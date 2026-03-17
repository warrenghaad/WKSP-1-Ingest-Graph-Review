import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CIVILIZATIONS } from "@/lib/braidData";
import { DII_MILESTONES, type DIIMilestone } from "@/lib/diiMilestones";
import { MAGIC_LABELS, type MAGICVector } from "@/lib/magicFramework";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { X, Search, Loader2, Users, Zap, BookOpen } from "lucide-react";

const MK: (keyof MAGICVector)[] = ["M", "A", "G", "I", "C"];

const PHASE_COLORS: Record<string, string> = {
  discovery: "#eab308",
  innovation: "#a855f7",
  invention: "#22c55e",
};

const EDGE_COLORS: Record<string, string> = {
  trade: "#22c55e",
  cultural: "#a855f7",
  war: "#ef4444",
  conquest: "#f97316",
};

interface MeetingTable {
  id: string;
  milestone: DIIMilestone;
  civId: string;
  civColor: string;
  civName: string;
  cycle: number;
  x: number;
  y: number;
  seats: SeatState[];
  knowledgeLevel: number;
  connections: number;
  isIsolated: boolean;
}

interface SeatState {
  key: keyof MAGICVector;
  active: boolean;
  knowledge: number;
  color: string;
  name: string;
}

interface BraidEdge {
  fromId: string;
  toId: string;
  type: "war" | "trade" | "cultural" | "conquest" | "internal";
  label: string;
  year: number;
}

function computeKnowledgeAccum(civId: string): Map<string, number> {
  const cycles = DII_MILESTONES[civId];
  if (!cycles) return new Map();
  const accum = new Map<string, number>();
  const driverCounts: Record<string, number> = { M: 0, A: 0, G: 0, I: 0, C: 0 };

  const all = cycles
    .flatMap((c) => c.milestones.map((m) => ({ ...m, cycle: c.cycle })))
    .sort((a, b) => a.year - b.year);

  for (const m of all) {
    for (const d of m.magicDrivers) {
      driverCounts[d] = (driverCounts[d] || 0) + 1;
    }
    const total = Object.values(driverCounts).reduce((s, v) => s + v, 0);
    accum.set(`${civId}-${m.cycle}-${m.phase}`, total);
  }
  return accum;
}

function buildMeetings(): { tables: MeetingTable[]; edges: BraidEdge[] } {
  const tables: MeetingTable[] = [];
  const edges: BraidEdge[] = [];
  const allAccum = new Map<string, number>();

  for (const civ of CIVILIZATIONS) {
    const civAccum = computeKnowledgeAccum(civ.id);
    civAccum.forEach((v, k) => allAccum.set(k, v));
  }

  const maxKnowledge = Math.max(1, ...allAccum.values());

  const ROOM_W = 200;
  const ROOM_GAP = 30;
  const PHASE_Y: Record<string, number> = { discovery: 100, innovation: 220, invention: 340 };
  const CYCLE_X_OFF = 55;

  for (let ci = 0; ci < CIVILIZATIONS.length; ci++) {
    const civ = CIVILIZATIONS[ci];
    const cycles = DII_MILESTONES[civ.id];
    if (!cycles) continue;

    const roomLeft = ci * (ROOM_W + ROOM_GAP) + 40;

    for (const cycle of cycles) {
      for (const m of cycle.milestones) {
        const id = `${civ.id}-${cycle.cycle}-${m.phase}`;
        const cx = roomLeft + (cycle.cycle - 1) * CYCLE_X_OFF + CYCLE_X_OFF;
        const cy = PHASE_Y[m.phase];
        const kn = allAccum.get(id) || 0;
        const knNorm = kn / maxKnowledge;

        const seats: SeatState[] = MK.map((key) => ({
          key,
          active: m.magicDrivers.includes(key),
          knowledge: m.magicDrivers.includes(key) ? knNorm : 0,
          color: MAGIC_LABELS[key].color,
          name: MAGIC_LABELS[key].name,
        }));

        tables.push({
          id,
          milestone: m,
          civId: civ.id,
          civColor: civ.color,
          civName: civ.shortName,
          cycle: cycle.cycle,
          x: cx,
          y: cy,
          seats,
          knowledgeLevel: knNorm,
          connections: 0,
          isIsolated: true,
        });
      }

      for (let i = 0; i < cycle.milestones.length - 1; i++) {
        const a = cycle.milestones[i];
        const b = cycle.milestones[i + 1];
        edges.push({
          fromId: `${civ.id}-${cycle.cycle}-${a.phase}`,
          toId: `${civ.id}-${cycle.cycle}-${b.phase}`,
          type: "internal",
          label: "knowledge flow",
          year: b.year,
        });
      }
    }

    if (cycles.length > 1) {
      for (let c = 0; c < cycles.length - 1; c++) {
        const prev = cycles[c].milestones[cycles[c].milestones.length - 1];
        const next = cycles[c + 1].milestones[0];
        edges.push({
          fromId: `${civ.id}-${cycles[c].cycle}-${prev.phase}`,
          toId: `${civ.id}-${cycles[c + 1].cycle}-${next.phase}`,
          type: "internal",
          label: "cycle bridge",
          year: next.year,
        });
      }
    }
  }

  for (const civ of CIVILIZATIONS) {
    for (const inter of civ.interactions) {
      const fromTables = tables.filter((t) => t.civId === civ.id);
      const toTables = tables.filter((t) => t.civId === inter.targetCivId);

      let bestFrom: MeetingTable | null = null;
      let bestTo: MeetingTable | null = null;
      let bestDist = Infinity;
      for (const f of fromTables) {
        for (const t of toTables) {
          const d =
            Math.abs(f.milestone.year - inter.year) +
            Math.abs(t.milestone.year - inter.year);
          if (d < bestDist) {
            bestDist = d;
            bestFrom = f;
            bestTo = t;
          }
        }
      }

      if (bestFrom && bestTo) {
        const key = [bestFrom.id, bestTo.id].sort().join("~");
        if (!edges.find((e) => [e.fromId, e.toId].sort().join("~") === key)) {
          edges.push({
            fromId: bestFrom.id,
            toId: bestTo.id,
            type: inter.type,
            label: inter.description,
            year: inter.year,
          });
          bestFrom.connections++;
          bestTo.connections++;
          bestFrom.isIsolated = false;
          bestTo.isIsolated = false;
        }
      }
    }
  }

  return { tables, edges };
}

function TableSVG({
  table,
  isSelected,
  isHovered,
  highlightEdge,
  onSelect,
  onHover,
  onLeave,
}: {
  table: MeetingTable;
  isSelected: boolean;
  isHovered: boolean;
  highlightEdge: boolean;
  onSelect: () => void;
  onHover: () => void;
  onLeave: () => void;
}) {
  const { x, y, seats, milestone, knowledgeLevel } = table;
  const phaseColor = PHASE_COLORS[milestone.phase];
  const tableR = 20 + knowledgeLevel * 6;
  const seatR = 6 + knowledgeLevel * 2;
  const seatDist = tableR + seatR + 3;
  const active = isSelected || isHovered || highlightEdge;

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
      {table.isIsolated && (
        <rect
          x={x - tableR - seatR - 10}
          y={y - tableR - seatR - 10}
          width={(tableR + seatR) * 2 + 20}
          height={(tableR + seatR) * 2 + 20}
          rx={6}
          fill="none"
          stroke="#ef4444"
          strokeWidth={0.5}
          strokeDasharray="4 4"
          opacity={active ? 0.4 : 0.15}
        />
      )}

      {active && (
        <circle
          cx={x}
          cy={y}
          r={tableR + seatR + 12}
          fill={phaseColor}
          fillOpacity={0.03}
          stroke={phaseColor}
          strokeWidth={0.5}
          strokeOpacity={0.2}
        />
      )}

      <circle
        cx={x}
        cy={y}
        r={tableR}
        fill="#0a0a12"
        stroke={active ? "white" : phaseColor}
        strokeWidth={active ? 1.5 : 0.8}
        strokeOpacity={active ? 0.8 : 0.3}
      />

      <circle
        cx={x}
        cy={y}
        r={tableR * knowledgeLevel}
        fill={phaseColor}
        fillOpacity={0.06 + knowledgeLevel * 0.08}
      />

      {milestone.imageUrl && (
        <>
          <defs>
            <clipPath id={`tbl-${table.id}`}>
              <circle cx={x} cy={y} r={tableR - 2} />
            </clipPath>
          </defs>
          <image
            href={milestone.imageUrl}
            x={x - tableR + 2}
            y={y - tableR + 2}
            width={(tableR - 2) * 2}
            height={(tableR - 2) * 2}
            clipPath={`url(#tbl-${table.id})`}
            preserveAspectRatio="xMidYMid slice"
            opacity={active ? 0.35 : 0.15}
            style={{ transition: "opacity 0.3s" }}
          />
        </>
      )}

      {seats.map((seat, i) => {
        const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
        const sx = x + Math.cos(angle) * seatDist;
        const sy = y + Math.sin(angle) * seatDist;
        const r = seat.active ? seatR : seatR * 0.5;

        return (
          <g key={seat.key}>
            {seat.active && (
              <circle
                cx={sx}
                cy={sy}
                r={r + 2}
                fill={seat.color}
                fillOpacity={0.08 + seat.knowledge * 0.12}
              />
            )}

            <circle
              cx={sx}
              cy={sy}
              r={r}
              fill={seat.active ? seat.color : "#1a1a2e"}
              fillOpacity={seat.active ? 0.3 + seat.knowledge * 0.5 : 0.15}
              stroke={seat.color}
              strokeWidth={seat.active ? 1.2 : 0.4}
              strokeOpacity={seat.active ? 0.8 : 0.2}
            />

            <text
              x={sx}
              y={sy + 0.5}
              fill={seat.active ? "white" : seat.color}
              fillOpacity={seat.active ? 0.9 : 0.25}
              fontSize={seat.active ? 7 : 5}
              fontWeight={seat.active ? 700 : 400}
              textAnchor="middle"
              dominantBaseline="central"
              fontFamily="Inter, sans-serif"
            >
              {seat.key}
            </text>

            {seat.active && seat.knowledge > 0.3 && (
              <>
                {Array.from({ length: Math.floor(seat.knowledge * 3) }).map((_, j) => (
                  <circle
                    key={j}
                    cx={sx + (j - seat.knowledge * 1.5) * 3}
                    cy={sy + r + 4}
                    r={1.2}
                    fill={seat.color}
                    fillOpacity={0.3 + j * 0.15}
                  />
                ))}
              </>
            )}
          </g>
        );
      })}

      <text
        x={x}
        y={y + tableR + seatR + 18}
        fill="white"
        fillOpacity={active ? 0.7 : 0.3}
        fontSize={7}
        fontWeight={600}
        textAnchor="middle"
        fontFamily="Inter, sans-serif"
      >
        {milestone.title.length > 22
          ? milestone.title.slice(0, 22) + "…"
          : milestone.title}
      </text>

      {isHovered && !isSelected && (
        <g>
          <rect
            x={x - 70}
            y={y - tableR - seatR - 44}
            width={140}
            height={36}
            rx={8}
            fill="black"
            fillOpacity={0.95}
            stroke={phaseColor}
            strokeWidth={0.5}
          />
          <text
            x={x}
            y={y - tableR - seatR - 30}
            fill={phaseColor}
            fontSize={8}
            fontWeight={600}
            textAnchor="middle"
            fontFamily="Inter, sans-serif"
            textTransform="uppercase"
          >
            {milestone.phase} · Cycle {table.cycle}
          </text>
          <text
            x={x}
            y={y - tableR - seatR - 18}
            fill="white"
            fillOpacity={0.5}
            fontSize={7}
            textAnchor="middle"
            fontFamily="Inter, sans-serif"
          >
            {table.connections > 0
              ? `${table.connections} braids · knowledge ${Math.round(knowledgeLevel * 100)}%`
              : "no braids · stagnant"}
          </text>
        </g>
      )}
    </g>
  );
}

function EdgeLine({
  from,
  to,
  edge,
  active,
}: {
  from: MeetingTable;
  to: MeetingTable;
  edge: BraidEdge;
  active: boolean;
}) {
  const isInternal = edge.type === "internal";
  const color = isInternal ? from.civColor : EDGE_COLORS[edge.type] || "#666";

  if (isInternal) {
    return (
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke={color}
        strokeWidth={active ? 1.5 : 0.6}
        strokeOpacity={active ? 0.4 : 0.08}
        strokeDasharray="3 5"
        style={{ transition: "all 0.2s" }}
      />
    );
  }

  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  const bulge = Math.min(80, Math.abs(dx) * 0.3 + 20);
  const cx1 = mx + (dy > 0 ? -bulge : bulge);
  const cy1 = my;

  return (
    <g>
      <path
        d={`M ${from.x} ${from.y} Q ${cx1} ${cy1} ${to.x} ${to.y}`}
        fill="none"
        stroke={color}
        strokeWidth={active ? 2.5 : 1}
        strokeOpacity={active ? 0.6 : 0.12}
        style={{ transition: "all 0.2s" }}
      />
      <circle
        cx={mx}
        cy={my}
        r={active ? 3 : 2}
        fill={color}
        fillOpacity={active ? 0.5 : 0.15}
      />
      {active && (
        <text
          x={mx + 5}
          y={my - 5}
          fill={color}
          fontSize={7}
          fontWeight={600}
          fontFamily="Inter, sans-serif"
          fillOpacity={0.7}
        >
          {edge.type}
        </text>
      )}
    </g>
  );
}

function DetailPanel({
  table,
  allTables,
  edges,
  onClose,
}: {
  table: MeetingTable;
  allTables: MeetingTable[];
  edges: BraidEdge[];
  onClose: () => void;
}) {
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<
    { title: string; url: string; source: string }[]
  >([]);
  const phaseColor = PHASE_COLORS[table.milestone.phase];

  const connectedEdges = edges.filter(
    (e) =>
      (e.fromId === table.id || e.toId === table.id) && e.type !== "internal"
  );

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const query = `${table.milestone.title} ancient artifact`;
      const [museumRes, imageRes] = await Promise.allSettled([
        fetch("/api/search-museums", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        }).then((r) => r.json()),
        fetch("/api/search-images", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        }).then((r) => r.json()),
      ]);

      const combined: { title: string; url: string; source: string }[] = [];
      const urls = new Set<string>();
      const addResult = (r: any, src: string) => {
        if (r.imageUrl && !urls.has(r.imageUrl)) {
          urls.add(r.imageUrl);
          combined.push({ title: r.title, url: r.imageUrl, source: src });
        }
      };

      if (museumRes.status === "fulfilled" && museumRes.value.results) {
        museumRes.value.results.forEach((r: any) => addResult(r, "Museum"));
      }
      if (imageRes.status === "fulfilled" && imageRes.value.results) {
        imageRes.value.results.forEach((r: any) => addResult(r, "Image"));
      }
      setResults(combined.slice(0, 8));
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
          style={{
            background: `linear-gradient(to bottom, ${phaseColor}15, transparent)`,
          }}
        />

        <div className="p-4 border-b border-white/10 flex justify-between items-center relative z-10">
          <div className="flex items-center gap-2">
            <span
              className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
              style={{
                color: phaseColor,
                backgroundColor: phaseColor + "15",
              }}
            >
              {table.milestone.phase} meeting
            </span>
            <span
              className="text-[10px] font-mono"
              style={{ color: table.civColor }}
            >
              {table.civName} · Cycle {table.cycle}
            </span>
          </div>
          <Button
            data-testid="button-close-meeting"
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
                {Math.abs(table.milestone.year)} BCE
              </span>
              <h2 className="text-xl font-serif font-bold text-white mt-1 leading-tight">
                {table.milestone.title}
              </h2>
            </div>

            {table.milestone.imageUrl && (
              <div className="relative w-full h-36 rounded-xl overflow-hidden border border-white/10">
                <img
                  src={table.milestone.imageUrl}
                  alt={table.milestone.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <p className="text-xs text-white/60 leading-relaxed">
              {table.milestone.description}
            </p>

            <div className="space-y-2">
              <span className="text-[9px] text-white/30 uppercase tracking-wider">
                People at the Table
              </span>
              <div className="grid grid-cols-5 gap-1.5">
                {table.seats.map((seat) => (
                  <div
                    key={seat.key}
                    className="flex flex-col items-center p-2 rounded-lg border"
                    style={{
                      borderColor: seat.active
                        ? seat.color + "40"
                        : "rgba(255,255,255,0.05)",
                      backgroundColor: seat.active
                        ? seat.color + "08"
                        : "transparent",
                    }}
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mb-1"
                      style={{
                        backgroundColor: seat.active
                          ? seat.color + "30"
                          : "rgba(255,255,255,0.03)",
                        color: seat.active ? "white" : "rgba(255,255,255,0.2)",
                      }}
                    >
                      {seat.key}
                    </div>
                    <span
                      className="text-[7px] text-center leading-tight"
                      style={{
                        color: seat.active
                          ? seat.color
                          : "rgba(255,255,255,0.2)",
                      }}
                    >
                      {seat.name.slice(0, 5)}
                    </span>
                    {seat.active && (
                      <div className="flex gap-0.5 mt-1">
                        {Array.from({
                          length: Math.max(1, Math.ceil(seat.knowledge * 5)),
                        }).map((_, j) => (
                          <div
                            key={j}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{
                              backgroundColor: seat.color,
                              opacity: 0.3 + j * 0.15,
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-3 h-3 text-white/30" />
                  <span className="text-[10px] text-white/50">
                    Accumulated Knowledge
                  </span>
                </div>
                <span className="text-[10px] font-mono text-white/60">
                  {Math.round(table.knowledgeLevel * 100)}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${table.knowledgeLevel * 100}%`,
                    background: `linear-gradient(to right, ${phaseColor}40, ${phaseColor})`,
                  }}
                />
              </div>
            </div>

            <div className="p-3 rounded-xl border border-white/5 bg-white/[0.02]">
              {table.isIsolated ? (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500/50" />
                  <div>
                    <span className="text-[10px] text-red-400/70 font-medium uppercase tracking-wider block">
                      No External Braids — Stagnant
                    </span>
                    <p className="text-[9px] text-white/30 mt-1 leading-relaxed">
                      This meeting developed without cross-civilization pressure.
                      No trade, war, or cultural exchange to catalyze growth.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Zap className="w-3 h-3 text-green-400/70" />
                  <div>
                    <span className="text-[10px] text-green-400/70 font-medium uppercase tracking-wider block">
                      {table.connections} Braid
                      {table.connections !== 1 ? "s" : ""} — Active Pressure
                    </span>
                    <p className="text-[9px] text-white/30 mt-1 leading-relaxed">
                      External interactions drove knowledge exchange at this
                      meeting.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {connectedEdges.length > 0 && (
              <div className="space-y-2">
                <span className="text-[9px] text-white/30 uppercase tracking-wider">
                  Braids (Cross-Table Meetings)
                </span>
                {connectedEdges.map((edge, i) => {
                  const otherId =
                    edge.fromId === table.id ? edge.toId : edge.fromId;
                  const other = allTables.find((t) => t.id === otherId);
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
                            style={{
                              color,
                              backgroundColor: color + "15",
                            }}
                          >
                            {edge.type}
                          </span>
                          {other && (
                            <span
                              className="text-[10px]"
                              style={{ color: other.civColor }}
                            >
                              {other.civName} table
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] text-white/30 font-mono">
                          {Math.abs(edge.year)} BCE
                        </span>
                      </div>
                      <p className="text-[10px] text-white/40 leading-relaxed">
                        {edge.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="h-px bg-white/5" />

            <Button
              data-testid="button-search-meeting"
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
              {isSearching ? "Searching…" : "Find Artifact Images"}
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
                      <p className="text-[7px] text-white/70 truncate">
                        {r.title}
                      </p>
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

  const { tables, edges } = useMemo(() => buildMeetings(), []);

  const selectedTable = selectedId
    ? tables.find((t) => t.id === selectedId)
    : null;

  const highlightSet = useMemo(() => {
    if (!selectedId && !hoveredId) return new Set<string>();
    const active = selectedId || hoveredId;
    const set = new Set<string>();
    set.add(active!);
    for (const e of edges) {
      if (e.fromId === active) set.add(e.toId);
      if (e.toId === active) set.add(e.fromId);
    }
    return set;
  }, [selectedId, hoveredId, edges]);

  const isolatedCount = tables.filter((t) => t.isIsolated).length;
  const activeCount = tables.length - isolatedCount;

  const ROOM_W = 200;
  const ROOM_GAP = 30;
  const svgW = CIVILIZATIONS.length * (ROOM_W + ROOM_GAP) + 60;
  const svgH = 460;

  return (
    <div className="w-full h-full flex flex-col bg-[#030308]">
      <div className="flex-shrink-0 px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <div>
          <h2
            className="text-lg font-serif font-bold text-white tracking-tight flex items-center gap-2"
            data-testid="text-meetings-heading"
          >
            <Users className="w-4 h-4 text-primary" />
            Meeting Tables
          </h2>
          <p className="text-[10px] text-white/40 mt-0.5">
            Tables = meetings · MAGIC people carry knowledge · Braids = cross-table encounters · Isolation = stagnation
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-green-400/60" />
              <span className="text-[9px] text-green-400/50">
                {activeCount} braided
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full border border-dashed border-red-400/40" />
              <span className="text-[9px] text-red-400/50">
                {isolatedCount} stagnant
              </span>
            </div>
          </div>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-2">
            {Object.entries(PHASE_COLORS).map(([phase, color]) => (
              <div key={phase} className="flex items-center gap-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: color, opacity: 0.7 }}
                />
                <span className="text-[8px] text-white/40 capitalize">
                  {phase}
                </span>
              </div>
            ))}
          </div>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-2">
            {Object.entries(EDGE_COLORS).map(([type, color]) => (
              <div key={type} className="flex items-center gap-1">
                <div
                  className="w-3 h-0.5 rounded"
                  style={{ backgroundColor: color, opacity: 0.7 }}
                />
                <span className="text-[8px] text-white/40 capitalize">
                  {type}
                </span>
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
          <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}>
            {CIVILIZATIONS.map((civ, ci) => {
              const left = ci * (ROOM_W + ROOM_GAP) + 40;
              return (
                <g key={civ.id}>
                  <rect
                    x={left}
                    y={30}
                    width={ROOM_W}
                    height={svgH - 60}
                    rx={12}
                    fill={civ.color}
                    fillOpacity={0.015}
                    stroke={civ.color}
                    strokeWidth={0.5}
                    strokeOpacity={0.06}
                  />
                  <text
                    x={left + ROOM_W / 2}
                    y={22}
                    fill={civ.color}
                    fontSize={11}
                    fontWeight={700}
                    textAnchor="middle"
                    fontFamily="Inter, sans-serif"
                    fillOpacity={0.5}
                  >
                    {civ.name} Room
                  </text>

                  {Object.entries({ discovery: 100, innovation: 220, invention: 340 }).map(
                    ([phase, py]) => (
                      <text
                        key={phase}
                        x={left + 8}
                        y={py - 28}
                        fill={PHASE_COLORS[phase]}
                        fontSize={7}
                        fontWeight={600}
                        fillOpacity={0.25}
                        fontFamily="Inter, sans-serif"
                        textTransform="uppercase"
                      >
                        {phase}
                      </text>
                    )
                  )}
                </g>
              );
            })}

            {edges.map((edge, i) => {
              const from = tables.find((t) => t.id === edge.fromId);
              const to = tables.find((t) => t.id === edge.toId);
              if (!from || !to) return null;
              const active =
                highlightSet.has(edge.fromId) && highlightSet.has(edge.toId);
              return (
                <EdgeLine
                  key={i}
                  from={from}
                  to={to}
                  edge={edge}
                  active={active}
                />
              );
            })}

            {tables.map((table) => (
              <TableSVG
                key={table.id}
                table={table}
                isSelected={selectedId === table.id}
                isHovered={hoveredId === table.id}
                highlightEdge={
                  highlightSet.size > 0 && highlightSet.has(table.id) && selectedId !== table.id && hoveredId !== table.id
                }
                onSelect={() =>
                  setSelectedId(selectedId === table.id ? null : table.id)
                }
                onHover={() => setHoveredId(table.id)}
                onLeave={() => setHoveredId(null)}
              />
            ))}
          </svg>
        </div>

        <AnimatePresence>
          {selectedTable && (
            <DetailPanel
              key={selectedTable.id}
              table={selectedTable}
              allTables={tables}
              edges={edges}
              onClose={() => setSelectedId(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
