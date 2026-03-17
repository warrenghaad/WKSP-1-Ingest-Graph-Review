import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CIVILIZATIONS } from "@/lib/braidData";
import { DII_MILESTONES, type DIIMilestone } from "@/lib/diiMilestones";
import { MAGIC_LABELS, type MAGICVector } from "@/lib/magicFramework";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { X, Search, Loader2, ExternalLink, Users, Zap } from "lucide-react";

const MAGIC_KEYS: (keyof MAGICVector)[] = ["M", "A", "G", "I", "C"];

const PHASE_COLORS: Record<string, string> = {
  discovery: "#eab308",
  innovation: "#a855f7",
  invention: "#22c55e",
};

interface PersonNode {
  id: string;
  milestone: DIIMilestone;
  civId: string;
  civColor: string;
  civName: string;
  cycle: number;
  x: number;
  y: number;
  radius: number;
  connections: number;
  isIsolated: boolean;
}

interface InteractionEdge {
  fromId: string;
  toId: string;
  type: "war" | "trade" | "cultural" | "conquest";
  year: number;
  description: string;
  intensity: number;
}

const EDGE_COLORS: Record<string, string> = {
  trade: "#22c55e",
  cultural: "#a855f7",
  war: "#ef4444",
  conquest: "#f97316",
};

function buildGraph(): { nodes: PersonNode[]; edges: InteractionEdge[] } {
  const nodes: PersonNode[] = [];
  const edges: InteractionEdge[] = [];

  const civSpacing = 180;
  const timeScale = 0.08;
  const minYear = -5000;

  for (let ci = 0; ci < CIVILIZATIONS.length; ci++) {
    const civ = CIVILIZATIONS[ci];
    const cycles = DII_MILESTONES[civ.id];
    if (!cycles) continue;

    const baseX = 80 + ci * civSpacing;

    for (const cycle of cycles) {
      for (const m of cycle.milestones) {
        const yearOffset = (m.year - minYear) * timeScale;
        const phaseJitter =
          m.phase === "discovery" ? -25 : m.phase === "innovation" ? 0 : 25;
        const cycleJitter = (cycle.cycle - 2) * 12;

        nodes.push({
          id: `${civ.id}-${cycle.cycle}-${m.phase}`,
          milestone: m,
          civId: civ.id,
          civColor: civ.color,
          civName: civ.shortName,
          cycle: cycle.cycle,
          x: baseX + phaseJitter + cycleJitter,
          y: 60 + yearOffset,
          radius: m.phase === "invention" ? 18 : m.phase === "innovation" ? 14 : 10,
          connections: 0,
          isIsolated: true,
        });
      }
    }
  }

  const civIndexMap = new Map(CIVILIZATIONS.map((c, i) => [c.id, i]));

  for (const civ of CIVILIZATIONS) {
    for (const interaction of civ.interactions) {
      const targetCiv = CIVILIZATIONS.find((c) => c.id === interaction.targetCivId);
      if (!targetCiv) continue;

      const fromNodes = nodes.filter((n) => n.civId === civ.id);
      const toNodes = nodes.filter((n) => n.civId === targetCiv.id);

      let bestFrom: PersonNode | null = null;
      let bestTo: PersonNode | null = null;
      let bestDist = Infinity;

      for (const fn of fromNodes) {
        for (const tn of toNodes) {
          const yearDist = Math.abs(fn.milestone.year - interaction.year) + Math.abs(tn.milestone.year - interaction.year);
          if (yearDist < bestDist) {
            bestDist = yearDist;
            bestFrom = fn;
            bestTo = tn;
          }
        }
      }

      if (bestFrom && bestTo) {
        const edgeId = [bestFrom.id, bestTo.id].sort().join("-");
        if (!edges.find((e) => [e.fromId, e.toId].sort().join("-") === edgeId)) {
          edges.push({
            fromId: bestFrom.id,
            toId: bestTo.id,
            type: interaction.type,
            year: interaction.year,
            description: interaction.description,
            intensity: interaction.intensity,
          });
          bestFrom.connections++;
          bestTo.connections++;
          bestFrom.isIsolated = false;
          bestTo.isIsolated = false;
        }
      }
    }
  }

  for (const civ of CIVILIZATIONS) {
    const civNodes = nodes.filter((n) => n.civId === civ.id);
    for (let i = 0; i < civNodes.length; i++) {
      for (let j = i + 1; j < civNodes.length; j++) {
        const a = civNodes[i];
        const b = civNodes[j];
        const yearDist = Math.abs(a.milestone.year - b.milestone.year);
        if (yearDist < 500) {
          const sharedDrivers = a.milestone.magicDrivers.filter((d) =>
            b.milestone.magicDrivers.includes(d)
          );
          if (sharedDrivers.length > 0) {
            a.connections++;
            b.connections++;
            a.isIsolated = false;
            b.isIsolated = false;
          }
        }
      }
    }
  }

  return { nodes, edges };
}

function PersonAvatar({
  node,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  onLeave,
}: {
  node: PersonNode;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: () => void;
  onHover: () => void;
  onLeave: () => void;
}) {
  const phaseColor = PHASE_COLORS[node.milestone.phase];
  const r = node.radius;
  const pulseR = r + 4;
  const clipId = `avatar-${node.id}`;

  return (
    <g
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      style={{ cursor: "pointer" }}
    >
      {node.isIsolated && (
        <circle
          cx={node.x}
          cy={node.y}
          r={r + 8}
          fill="none"
          stroke="#ef4444"
          strokeWidth={0.5}
          strokeDasharray="3 3"
          opacity={0.25}
        />
      )}

      {(isSelected || isHovered) && (
        <circle
          cx={node.x}
          cy={node.y}
          r={pulseR}
          fill="none"
          stroke={phaseColor}
          strokeWidth={2}
          opacity={0.6}
        />
      )}

      <circle
        cx={node.x}
        cy={node.y}
        r={r}
        fill="#111"
        stroke={isSelected ? "white" : node.isIsolated ? "#ef444466" : phaseColor}
        strokeWidth={isSelected ? 2 : 1.5}
        style={{ transition: "all 0.2s" }}
      />

      <defs>
        <clipPath id={clipId}>
          <circle cx={node.x} cy={node.y} r={r - 1.5} />
        </clipPath>
      </defs>

      {node.milestone.imageUrl && (
        <image
          href={node.milestone.imageUrl}
          x={node.x - r + 1.5}
          y={node.y - r + 1.5}
          width={(r - 1.5) * 2}
          height={(r - 1.5) * 2}
          clipPath={`url(#${clipId})`}
          preserveAspectRatio="xMidYMid slice"
          opacity={isHovered || isSelected ? 1 : node.isIsolated ? 0.3 : 0.7}
          style={{ transition: "opacity 0.2s" }}
        />
      )}

      <circle
        cx={node.x + r * 0.6}
        cy={node.y - r * 0.6}
        r={4}
        fill={phaseColor}
        stroke="#111"
        strokeWidth={1}
      />

      {isHovered && !isSelected && (
        <g>
          <rect
            x={node.x - 60}
            y={node.y + r + 6}
            width={120}
            height={42}
            rx={6}
            fill="black"
            fillOpacity={0.92}
            stroke={phaseColor}
            strokeWidth={0.5}
          />
          <text
            x={node.x}
            y={node.y + r + 19}
            fill="white"
            fontSize={8}
            fontWeight={600}
            textAnchor="middle"
            fontFamily="Inter, sans-serif"
          >
            {node.milestone.title.length > 20
              ? node.milestone.title.slice(0, 20) + "…"
              : node.milestone.title}
          </text>
          <text
            x={node.x}
            y={node.y + r + 30}
            fill={node.civColor}
            fontSize={7}
            textAnchor="middle"
            fontFamily="Inter, sans-serif"
          >
            {node.civName} · {Math.abs(node.milestone.year)} BCE
          </text>
          <text
            x={node.x}
            y={node.y + r + 40}
            fill="white"
            fillOpacity={0.4}
            fontSize={7}
            textAnchor="middle"
            fontFamily="Inter, sans-serif"
          >
            {node.connections} connection{node.connections !== 1 ? "s" : ""}
            {node.isIsolated ? " · STAGNANT" : ""}
          </text>
        </g>
      )}
    </g>
  );
}

function InternalBond({
  a,
  b,
  sharedDrivers,
}: {
  a: PersonNode;
  b: PersonNode;
  sharedDrivers: string[];
}) {
  if (sharedDrivers.length === 0) return null;
  const color = MAGIC_LABELS[sharedDrivers[0] as keyof MAGICVector]?.color || "#666";
  return (
    <line
      x1={a.x}
      y1={a.y}
      x2={b.x}
      y2={b.y}
      stroke={color}
      strokeWidth={0.5 + sharedDrivers.length * 0.3}
      opacity={0.12}
      strokeDasharray="2 4"
    />
  );
}

function DetailPanel({
  node,
  allNodes,
  edges,
  onClose,
}: {
  node: PersonNode;
  allNodes: PersonNode[];
  edges: InteractionEdge[];
  onClose: () => void;
}) {
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<{ title: string; url: string; source: string }[]>([]);
  const phaseColor = PHASE_COLORS[node.milestone.phase];

  const connectedEdges = edges.filter(
    (e) => e.fromId === node.id || e.toId === node.id
  );

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const query = `${node.milestone.title} ancient artifact archaeological`;
      const res = await fetch("/api/search-museums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (data.results) {
        setResults(
          data.results
            .filter((r: any) => r.imageUrl)
            .map((r: any) => ({ title: r.title, url: r.imageUrl, source: r.source || "Museum" }))
            .slice(0, 6)
        );
      }
    } catch {
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      transition={{ type: "spring", damping: 30, stiffness: 200 }}
      className="absolute top-0 right-0 w-full max-w-sm h-full z-30"
    >
      <div className="h-full border-l border-white/10 bg-black/90 backdrop-blur-2xl flex flex-col shadow-2xl">
        <div
          className="absolute top-0 left-0 right-0 h-24 pointer-events-none"
          style={{ background: `linear-gradient(to bottom, ${phaseColor}15, transparent)` }}
        />

        <div className="p-4 border-b border-white/10 flex justify-between items-center relative z-10">
          <div className="flex items-center gap-2">
            <span
              className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
              style={{ color: phaseColor, backgroundColor: phaseColor + "15" }}
            >
              {node.milestone.phase}
            </span>
            <span className="text-[10px] font-mono" style={{ color: node.civColor }}>
              {node.civName}
            </span>
          </div>
          <Button
            data-testid="button-close-person"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white/40 hover:text-white hover:bg-white/5 rounded-full w-8 h-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1 relative z-10">
          <div className="p-5 space-y-4 pb-12">
            <div>
              <span className="text-[10px] text-white/40 font-mono">
                {Math.abs(node.milestone.year)} BCE · Cycle {node.cycle}
              </span>
              <h2 className="text-xl font-serif font-bold text-white mt-1 leading-tight">
                {node.milestone.title}
              </h2>
            </div>

            {node.milestone.imageUrl && (
              <div className="relative w-full h-36 rounded-xl overflow-hidden border border-white/10">
                <img
                  src={node.milestone.imageUrl}
                  alt={node.milestone.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <p className="text-xs text-white/60 leading-relaxed">
              {node.milestone.description}
            </p>

            <div className="flex gap-1.5">
              {node.milestone.magicDrivers.map((d) => (
                <span
                  key={d}
                  className="text-[9px] font-bold px-2 py-1 rounded-lg border"
                  style={{
                    color: MAGIC_LABELS[d as keyof MAGICVector]?.color,
                    borderColor: (MAGIC_LABELS[d as keyof MAGICVector]?.color || "#888") + "30",
                    backgroundColor: (MAGIC_LABELS[d as keyof MAGICVector]?.color || "#888") + "10",
                  }}
                >
                  {d} {MAGIC_LABELS[d as keyof MAGICVector]?.name}
                </span>
              ))}
            </div>

            <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02] space-y-2">
              <div className="flex items-center gap-2">
                {node.isIsolated ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-red-500/50" />
                    <span className="text-[10px] text-red-400/70 font-medium uppercase tracking-wider">
                      Stagnant — No External Pressure
                    </span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3 h-3 text-green-400/70" />
                    <span className="text-[10px] text-green-400/70 font-medium uppercase tracking-wider">
                      {node.connections} Connection{node.connections !== 1 ? "s" : ""} — Active Growth
                    </span>
                  </>
                )}
              </div>

              {node.isIsolated && (
                <p className="text-[10px] text-white/30 leading-relaxed">
                  This milestone developed in relative isolation — no cross-civilization
                  interactions nearby to drive competitive pressure or knowledge exchange.
                </p>
              )}
            </div>

            {connectedEdges.length > 0 && (
              <div className="space-y-2">
                <span className="text-[9px] text-white/30 uppercase tracking-wider">
                  Interactions
                </span>
                {connectedEdges.map((edge, i) => {
                  const otherId = edge.fromId === node.id ? edge.toId : edge.fromId;
                  const otherNode = allNodes.find((n) => n.id === otherId);
                  const color = EDGE_COLORS[edge.type];

                  return (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg border border-white/5 bg-white/[0.02]"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded"
                            style={{ color, backgroundColor: color + "15" }}
                          >
                            {edge.type}
                          </span>
                          {otherNode && (
                            <span className="text-[10px]" style={{ color: otherNode.civColor }}>
                              {otherNode.civName}
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] text-white/30 font-mono">
                          {Math.abs(edge.year)} BCE
                        </span>
                      </div>
                      <p className="text-[10px] text-white/40 leading-relaxed">
                        {edge.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="h-px bg-white/5" />

            <Button
              data-testid="button-search-person"
              variant="outline"
              size="sm"
              className="w-full h-8 text-xs rounded-lg border-white/10 bg-white/5 hover:bg-white/10 text-white/70"
              onClick={handleSearch}
              disabled={isSearching}
            >
              {isSearching ? (
                <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
              ) : (
                <Search className="w-3 h-3 mr-1.5" />
              )}
              {isSearching ? "Searching…" : "Search for Images"}
            </Button>

            {results.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {results.map((r, i) => (
                  <a
                    key={i}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative rounded-lg overflow-hidden border border-white/10 hover:border-white/25 h-20 block"
                  >
                    <img
                      src={r.url}
                      alt={r.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1">
                      <p className="text-[7px] text-white/70 truncate">{r.title}</p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </motion.div>
  );
}

export default function PeopleGraph({ onBack }: { onBack: () => void }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const { nodes, edges } = useMemo(() => buildGraph(), []);

  const internalBonds = useMemo(() => {
    const bonds: { a: PersonNode; b: PersonNode; shared: string[] }[] = [];
    for (const civ of CIVILIZATIONS) {
      const civNodes = nodes.filter((n) => n.civId === civ.id);
      for (let i = 0; i < civNodes.length; i++) {
        for (let j = i + 1; j < civNodes.length; j++) {
          const yearDist = Math.abs(civNodes[i].milestone.year - civNodes[j].milestone.year);
          if (yearDist < 500) {
            const shared = civNodes[i].milestone.magicDrivers.filter((d) =>
              civNodes[j].milestone.magicDrivers.includes(d)
            );
            if (shared.length > 0) {
              bonds.push({ a: civNodes[i], b: civNodes[j], shared });
            }
          }
        }
      }
    }
    return bonds;
  }, [nodes]);

  const selectedNode = selectedId ? nodes.find((n) => n.id === selectedId) : null;

  const isolatedCount = nodes.filter((n) => n.isIsolated).length;
  const connectedCount = nodes.length - isolatedCount;

  const maxX = Math.max(...nodes.map((n) => n.x)) + 100;
  const maxY = Math.max(...nodes.map((n) => n.y)) + 80;

  return (
    <div className="w-full h-full flex flex-col bg-[#030308]">
      <div className="flex-shrink-0 px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-serif font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            People & Pressure
          </h2>
          <p className="text-[10px] text-white/40 mt-0.5">
            Plot points as people · Connections = growth pressure · Isolation = stagnation
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-green-400/60" />
              <span className="text-[9px] text-green-400/50">{connectedCount} active</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full border border-dashed border-red-400/40" />
              <span className="text-[9px] text-red-400/50">{isolatedCount} stagnant</span>
            </div>
          </div>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-2">
            {Object.entries(PHASE_COLORS).map(([phase, color]) => (
              <div key={phase} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: color, opacity: 0.7 }} />
                <span className="text-[8px] text-white/40 capitalize">{phase}</span>
              </div>
            ))}
          </div>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-2">
            {Object.entries(EDGE_COLORS).map(([type, color]) => (
              <div key={type} className="flex items-center gap-1">
                <div className="w-3 h-0.5 rounded" style={{ backgroundColor: color, opacity: 0.7 }} />
                <span className="text-[8px] text-white/40 capitalize">{type}</span>
              </div>
            ))}
          </div>
          <Button
            data-testid="button-people-back"
            variant="outline"
            size="sm"
            className="rounded-full border-white/10 bg-black/40 text-white hover:bg-white/10 h-8 text-xs"
            onClick={onBack}
          >
            Back
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto relative">
        <div className="min-w-fit p-4">
          <svg width={maxX} height={maxY} viewBox={`0 0 ${maxX} ${maxY}`}>
            {CIVILIZATIONS.map((civ, i) => {
              const civNodes = nodes.filter((n) => n.civId === civ.id);
              if (civNodes.length === 0) return null;
              const minX = Math.min(...civNodes.map((n) => n.x)) - 30;
              const maxCX = Math.max(...civNodes.map((n) => n.x)) + 30;
              const minY = Math.min(...civNodes.map((n) => n.y)) - 30;
              const maxCY = Math.max(...civNodes.map((n) => n.y)) + 30;

              return (
                <g key={civ.id}>
                  <rect
                    x={minX}
                    y={minY}
                    width={maxCX - minX}
                    height={maxCY - minY}
                    rx={12}
                    fill={civ.color}
                    fillOpacity={0.02}
                    stroke={civ.color}
                    strokeWidth={0.5}
                    strokeOpacity={0.08}
                  />
                  <text
                    x={(minX + maxCX) / 2}
                    y={minY - 6}
                    fill={civ.color}
                    fontSize={10}
                    fontWeight={700}
                    textAnchor="middle"
                    fontFamily="Inter, sans-serif"
                    fillOpacity={0.5}
                  >
                    {civ.name}
                  </text>
                </g>
              );
            })}

            {internalBonds.map((bond, i) => (
              <InternalBond key={i} a={bond.a} b={bond.b} sharedDrivers={bond.shared} />
            ))}

            {edges.map((edge, i) => {
              const from = nodes.find((n) => n.id === edge.fromId);
              const to = nodes.find((n) => n.id === edge.toId);
              if (!from || !to) return null;

              const color = EDGE_COLORS[edge.type];
              const midX = (from.x + to.x) / 2;
              const midY = (from.y + to.y) / 2;
              const isHighlighted =
                selectedId === edge.fromId ||
                selectedId === edge.toId ||
                hoveredId === edge.fromId ||
                hoveredId === edge.toId;

              return (
                <g key={i}>
                  <line
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke={color}
                    strokeWidth={isHighlighted ? 2 : 0.8 + edge.intensity * 0.5}
                    opacity={isHighlighted ? 0.7 : 0.15}
                    style={{ transition: "all 0.2s" }}
                  />
                  <circle
                    cx={midX}
                    cy={midY}
                    r={2}
                    fill={color}
                    opacity={isHighlighted ? 0.6 : 0.2}
                  />
                </g>
              );
            })}

            {nodes.map((node) => (
              <PersonAvatar
                key={node.id}
                node={node}
                isSelected={selectedId === node.id}
                isHovered={hoveredId === node.id}
                onSelect={() => setSelectedId(selectedId === node.id ? null : node.id)}
                onHover={() => setHoveredId(node.id)}
                onLeave={() => setHoveredId(null)}
              />
            ))}
          </svg>
        </div>

        <AnimatePresence>
          {selectedNode && (
            <DetailPanel
              key={selectedNode.id}
              node={selectedNode}
              allNodes={nodes}
              edges={edges}
              onClose={() => setSelectedId(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
