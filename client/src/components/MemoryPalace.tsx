import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CIVILIZATIONS } from "@/lib/braidData";
import { DII_MILESTONES, type DIIMilestone } from "@/lib/diiMilestones";
import { MAGIC_LABELS, type MAGICVector } from "@/lib/magicFramework";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { X, ExternalLink, Search, Loader2 } from "lucide-react";

const MAGIC_KEYS: (keyof MAGICVector)[] = ["M", "A", "G", "I", "C"];

const FLOOR_HEIGHT = 120;
const BUILDING_WIDTH = 160;
const BUILDING_GAP = 80;
const ROOF_HEIGHT = 40;
const FOUNDATION_HEIGHT = 30;
const BRIDGE_Y_OFFSET = 20;

const PHASE_COLORS: Record<string, string> = {
  discovery: "#eab308",
  innovation: "#a855f7",
  invention: "#22c55e",
};

const PHASE_SHAPES: Record<string, string> = {
  discovery: "circle",
  innovation: "diamond",
  invention: "star",
};

interface RoomData {
  milestone: DIIMilestone;
  civId: string;
  cycle: number;
  floor: keyof MAGICVector;
  roomIndex: number;
}

interface BridgeData {
  fromCivIndex: number;
  toCivIndex: number;
  floor: number;
  type: "war" | "trade" | "cultural" | "conquest";
  year: number;
  description: string;
  intensity: number;
}

function buildRoomsPerBuilding(civId: string): Map<keyof MAGICVector, RoomData[]> {
  const map = new Map<keyof MAGICVector, RoomData[]>();
  for (const k of MAGIC_KEYS) map.set(k, []);

  const cycles = DII_MILESTONES[civId];
  if (!cycles) return map;

  for (const cycle of cycles) {
    for (const m of cycle.milestones) {
      for (const driver of m.magicDrivers) {
        const key = driver as keyof MAGICVector;
        if (MAGIC_KEYS.includes(key)) {
          const arr = map.get(key)!;
          arr.push({
            milestone: m,
            civId,
            cycle: cycle.cycle,
            floor: key,
            roomIndex: arr.length,
          });
        }
      }
    }
  }

  return map;
}

function buildBridges(): BridgeData[] {
  const bridges: BridgeData[] = [];
  const civIndexMap = new Map(CIVILIZATIONS.map((c, i) => [c.id, i]));

  for (const civ of CIVILIZATIONS) {
    const fromIdx = civIndexMap.get(civ.id)!;
    for (const interaction of civ.interactions) {
      const toIdx = civIndexMap.get(interaction.targetCivId);
      if (toIdx === undefined) continue;
      if (fromIdx >= toIdx) continue;

      const typeToFloor: Record<string, number> = {
        trade: 2,
        cultural: 1,
        war: 4,
        conquest: 3,
      };

      bridges.push({
        fromCivIndex: fromIdx,
        toCivIndex: toIdx,
        floor: typeToFloor[interaction.type] ?? 2,
        type: interaction.type,
        year: interaction.year,
        description: interaction.description,
        intensity: interaction.intensity,
      });
    }
  }

  return bridges;
}

const BRIDGE_COLORS: Record<string, string> = {
  trade: "#22c55e",
  cultural: "#a855f7",
  war: "#ef4444",
  conquest: "#f97316",
};

function RoomDot({
  room,
  x,
  y,
  onSelect,
  isSelected,
}: {
  room: RoomData;
  x: number;
  y: number;
  onSelect: () => void;
  isSelected: boolean;
}) {
  const color = PHASE_COLORS[room.milestone.phase];
  const r = room.milestone.phase === "invention" ? 10 : room.milestone.phase === "innovation" ? 8 : 6;

  return (
    <g
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      style={{ cursor: "pointer" }}
    >
      {room.milestone.phase === "invention" ? (
        <>
          <polygon
            points={starPoints(x, y, r, r * 0.45, 5)}
            fill={color}
            fillOpacity={isSelected ? 0.9 : 0.6}
            stroke={color}
            strokeWidth={isSelected ? 2 : 1}
            style={{ transition: "all 0.2s" }}
          />
        </>
      ) : room.milestone.phase === "innovation" ? (
        <rect
          x={x - r * 0.7}
          y={y - r * 0.7}
          width={r * 1.4}
          height={r * 1.4}
          rx={2}
          fill={color}
          fillOpacity={isSelected ? 0.9 : 0.6}
          stroke={color}
          strokeWidth={isSelected ? 2 : 1}
          transform={`rotate(45 ${x} ${y})`}
          style={{ transition: "all 0.2s" }}
        />
      ) : (
        <circle
          cx={x}
          cy={y}
          r={r}
          fill={color}
          fillOpacity={isSelected ? 0.9 : 0.6}
          stroke={color}
          strokeWidth={isSelected ? 2 : 1}
          style={{ transition: "all 0.2s" }}
        />
      )}

      {room.milestone.imageUrl && (
        <defs>
          <clipPath id={`room-clip-${room.civId}-${room.cycle}-${room.milestone.phase}-${room.floor}-${room.roomIndex}`}>
            <circle cx={x} cy={y} r={r - 1} />
          </clipPath>
        </defs>
      )}

      <text
        x={x}
        y={y + r + 10}
        fill="white"
        fillOpacity={0.5}
        fontSize={6}
        textAnchor="middle"
        fontFamily="Inter, sans-serif"
      >
        {room.milestone.title.length > 14
          ? room.milestone.title.slice(0, 14) + "…"
          : room.milestone.title}
      </text>
    </g>
  );
}

function starPoints(cx: number, cy: number, outerR: number, innerR: number, n: number): string {
  const pts: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const angle = (Math.PI / n) * i - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    pts.push(`${cx + Math.cos(angle) * r},${cy + Math.sin(angle) * r}`);
  }
  return pts.join(" ");
}

function BridgePath({
  bridge,
  totalWidth,
  onHover,
  onLeave,
  isHovered,
}: {
  bridge: BridgeData;
  totalWidth: number;
  onHover: () => void;
  onLeave: () => void;
  isHovered: boolean;
}) {
  const x1 = bridge.fromCivIndex * (BUILDING_WIDTH + BUILDING_GAP) + BUILDING_WIDTH + 20;
  const x2 = bridge.toCivIndex * (BUILDING_WIDTH + BUILDING_GAP) + 20;
  const totalBuildingHeight = MAGIC_KEYS.length * FLOOR_HEIGHT + ROOF_HEIGHT + FOUNDATION_HEIGHT;
  const y = ROOF_HEIGHT + bridge.floor * FLOOR_HEIGHT + FLOOR_HEIGHT / 2 + BRIDGE_Y_OFFSET;
  const midX = (x1 + x2) / 2;
  const arcHeight = -30 - bridge.intensity * 20;
  const color = BRIDGE_COLORS[bridge.type];

  return (
    <g
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      style={{ cursor: "pointer" }}
    >
      <path
        d={`M ${x1} ${y} Q ${midX} ${y + arcHeight} ${x2} ${y}`}
        fill="none"
        stroke={color}
        strokeWidth={isHovered ? 2.5 : 1 + bridge.intensity}
        strokeDasharray={bridge.type === "trade" ? "none" : "4 3"}
        opacity={isHovered ? 0.9 : 0.3}
        style={{ transition: "all 0.2s" }}
      />
      <circle cx={midX} cy={y + arcHeight / 2} r={3} fill={color} opacity={isHovered ? 0.8 : 0.3} />

      {isHovered && (
        <g>
          <rect
            x={midX - 80}
            y={y + arcHeight / 2 - 30}
            width={160}
            height={24}
            rx={4}
            fill="black"
            fillOpacity={0.92}
            stroke={color}
            strokeWidth={0.5}
          />
          <text
            x={midX}
            y={y + arcHeight / 2 - 20}
            fill={color}
            fontSize={7}
            fontWeight={700}
            textAnchor="middle"
            fontFamily="Inter, sans-serif"
          >
            {bridge.type.toUpperCase()} · {Math.abs(bridge.year)} BCE
          </text>
          <text
            x={midX}
            y={y + arcHeight / 2 - 10}
            fill="white"
            fillOpacity={0.6}
            fontSize={6}
            textAnchor="middle"
            fontFamily="Inter, sans-serif"
          >
            {bridge.description.length > 50
              ? bridge.description.slice(0, 50) + "…"
              : bridge.description}
          </text>
        </g>
      )}
    </g>
  );
}

function RoomDetailPanel({
  room,
  onClose,
}: {
  room: RoomData;
  onClose: () => void;
}) {
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<{ title: string; url: string; source: string }[]>([]);
  const color = PHASE_COLORS[room.milestone.phase];
  const civ = CIVILIZATIONS.find((c) => c.id === room.civId);

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const query = `${room.milestone.title} ancient artifact archaeological`;
      const [museumRes, aiRes] = await Promise.allSettled([
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

      const all: { title: string; url: string; source: string }[] = [];
      if (museumRes.status === "fulfilled" && museumRes.value.results) {
        for (const r of museumRes.value.results) {
          if (r.imageUrl) all.push({ title: r.title, url: r.imageUrl, source: r.source || "Museum" });
        }
      }
      if (aiRes.status === "fulfilled" && aiRes.value.results) {
        for (const r of aiRes.value.results) {
          if (r.url) all.push({ title: r.title || room.milestone.title, url: r.url, source: r.source || "AI" });
        }
      }
      setResults(all.filter((r, i, a) => a.findIndex((x) => x.url === r.url) === i).slice(0, 8));
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
          style={{ background: `linear-gradient(to bottom, ${color}15, transparent)` }}
        />

        <div className="p-4 border-b border-white/10 flex justify-between items-center relative z-10">
          <div className="flex items-center gap-2">
            <span
              className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
              style={{ color, backgroundColor: color + "15" }}
            >
              {room.milestone.phase}
            </span>
            {civ && (
              <span className="text-[10px] font-mono" style={{ color: civ.color }}>
                {civ.shortName}
              </span>
            )}
            <span className="text-[10px] text-white/30 font-mono">
              Floor {room.floor}
            </span>
          </div>
          <Button
            data-testid="button-close-room"
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
                {Math.abs(room.milestone.year)} BCE · Cycle {room.cycle}
              </span>
              <h2 className="text-xl font-serif font-bold text-white mt-1 leading-tight">
                {room.milestone.title}
              </h2>
            </div>

            {room.milestone.imageUrl && (
              <div className="relative w-full h-36 rounded-xl overflow-hidden border border-white/10">
                <img
                  src={room.milestone.imageUrl}
                  alt={room.milestone.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                  <span className="text-[8px] text-white/50">Wikimedia Commons</span>
                </div>
              </div>
            )}

            <p className="text-xs text-white/60 leading-relaxed">
              {room.milestone.description}
            </p>

            <div>
              <span className="text-[9px] text-white/30 uppercase tracking-wider">
                MAGIC Drivers on this floor
              </span>
              <div className="flex gap-1.5 mt-1.5">
                {room.milestone.magicDrivers.map((d) => {
                  const label = MAGIC_LABELS[d as keyof MAGICVector];
                  return (
                    <div
                      key={d}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg border ${
                        d === room.floor
                          ? "border-white/20 bg-white/5"
                          : "border-white/5 bg-white/[0.02]"
                      }`}
                    >
                      <span
                        className="text-[9px] font-bold"
                        style={{ color: label?.color }}
                      >
                        {d}
                      </span>
                      <span className="text-[8px] text-white/40">{label?.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="h-px bg-white/5" />

            <div className="space-y-2">
              <Button
                data-testid="button-search-room"
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
                {isSearching ? "Searching museums…" : "Search for Images"}
              </Button>

              {results.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {results.map((r, i) => (
                    <a
                      key={i}
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative rounded-lg overflow-hidden border border-white/10 hover:border-white/25 h-20 block transition-all"
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
                        <p className="text-[6px] text-white/40">{r.source}</p>
                      </div>
                      <div className="absolute top-1 right-1 p-0.5 rounded bg-black/50">
                        <ExternalLink className="w-2.5 h-2.5 text-white/50" />
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </div>
    </motion.div>
  );
}

export default function MemoryPalace({ onBack }: { onBack: () => void }) {
  const [selectedRoom, setSelectedRoom] = useState<RoomData | null>(null);
  const [hoveredBridge, setHoveredBridge] = useState<number | null>(null);

  const buildings = useMemo(
    () => CIVILIZATIONS.map((civ) => ({ civ, rooms: buildRoomsPerBuilding(civ.id) })),
    []
  );

  const bridges = useMemo(() => buildBridges(), []);

  const totalBuildingHeight = MAGIC_KEYS.length * FLOOR_HEIGHT + ROOF_HEIGHT + FOUNDATION_HEIGHT;
  const totalWidth = CIVILIZATIONS.length * (BUILDING_WIDTH + BUILDING_GAP) + 60;
  const svgHeight = totalBuildingHeight + 60;

  return (
    <div className="w-full h-full flex flex-col bg-[#030308]">
      <div className="flex-shrink-0 px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-serif font-bold text-white tracking-tight">
            Memory Palace
          </h2>
          <p className="text-[10px] text-white/40 mt-0.5">
            Floors = MAGIC elements · Buildings = Civilizations · Bridges = Interactions
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="flex items-center gap-3">
            {Object.entries(PHASE_COLORS).map(([phase, color]) => (
              <div key={phase} className="flex items-center gap-1">
                <div
                  className="w-2 h-2 rounded-sm"
                  style={{ backgroundColor: color, opacity: 0.7 }}
                />
                <span className="text-[8px] text-white/40 capitalize">{phase}</span>
              </div>
            ))}
            <div className="w-px h-3 bg-white/10" />
            {Object.entries(BRIDGE_COLORS).map(([type, color]) => (
              <div key={type} className="flex items-center gap-1">
                <div className="w-3 h-0.5 rounded" style={{ backgroundColor: color, opacity: 0.7 }} />
                <span className="text-[8px] text-white/40 capitalize">{type}</span>
              </div>
            ))}
          </div>
          <Button
            data-testid="button-palace-back"
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
        <div className="min-w-fit p-6">
          <svg
            width={totalWidth}
            height={svgHeight}
            viewBox={`0 0 ${totalWidth} ${svgHeight}`}
          >
            {buildings.map(({ civ, rooms }, bi) => {
              const bx = 30 + bi * (BUILDING_WIDTH + BUILDING_GAP);
              const by = 20;

              return (
                <g key={civ.id}>
                  <polygon
                    points={`${bx + BUILDING_WIDTH / 2} ${by}, ${bx - 5} ${by + ROOF_HEIGHT}, ${bx + BUILDING_WIDTH + 5} ${by + ROOF_HEIGHT}`}
                    fill={civ.color}
                    fillOpacity={0.08}
                    stroke={civ.color}
                    strokeWidth={1}
                    strokeOpacity={0.3}
                  />

                  <rect
                    x={bx}
                    y={by + ROOF_HEIGHT}
                    width={BUILDING_WIDTH}
                    height={MAGIC_KEYS.length * FLOOR_HEIGHT}
                    fill="white"
                    fillOpacity={0.02}
                    stroke={civ.color}
                    strokeWidth={0.5}
                    strokeOpacity={0.15}
                    rx={2}
                  />

                  {MAGIC_KEYS.map((key, fi) => {
                    const fy = by + ROOF_HEIGHT + fi * FLOOR_HEIGHT;
                    const floorColor = MAGIC_LABELS[key].color;
                    const floorRooms = rooms.get(key) || [];

                    return (
                      <g key={key}>
                        <rect
                          x={bx}
                          y={fy}
                          width={BUILDING_WIDTH}
                          height={FLOOR_HEIGHT}
                          fill={floorColor}
                          fillOpacity={0.03}
                          stroke={floorColor}
                          strokeWidth={0.3}
                          strokeOpacity={0.1}
                        />

                        <line
                          x1={bx}
                          y1={fy + FLOOR_HEIGHT}
                          x2={bx + BUILDING_WIDTH}
                          y2={fy + FLOOR_HEIGHT}
                          stroke="white"
                          strokeWidth={0.3}
                          strokeOpacity={0.08}
                        />

                        <text
                          x={bx + 6}
                          y={fy + 14}
                          fill={floorColor}
                          fontSize={9}
                          fontWeight={700}
                          fontFamily="Inter, sans-serif"
                          fillOpacity={0.5}
                        >
                          {key}
                        </text>
                        <text
                          x={bx + 18}
                          y={fy + 14}
                          fill="white"
                          fontSize={7}
                          fontFamily="Inter, sans-serif"
                          fillOpacity={0.2}
                        >
                          {MAGIC_LABELS[key].name}
                        </text>

                        {floorRooms.map((room, ri) => {
                          const roomsPerRow = 4;
                          const col = ri % roomsPerRow;
                          const row = Math.floor(ri / roomsPerRow);
                          const rx = bx + 20 + col * 32;
                          const ry = fy + 30 + row * 32;
                          const isSelected =
                            selectedRoom?.civId === room.civId &&
                            selectedRoom?.cycle === room.cycle &&
                            selectedRoom?.milestone.phase === room.milestone.phase &&
                            selectedRoom?.floor === room.floor;

                          return (
                            <RoomDot
                              key={`${room.civId}-${room.cycle}-${room.milestone.phase}-${room.floor}-${ri}`}
                              room={room}
                              x={rx}
                              y={ry}
                              onSelect={() => setSelectedRoom(isSelected ? null : room)}
                              isSelected={isSelected}
                            />
                          );
                        })}
                      </g>
                    );
                  })}

                  <rect
                    x={bx}
                    y={by + ROOF_HEIGHT + MAGIC_KEYS.length * FLOOR_HEIGHT}
                    width={BUILDING_WIDTH}
                    height={FOUNDATION_HEIGHT}
                    fill={civ.color}
                    fillOpacity={0.06}
                    stroke={civ.color}
                    strokeWidth={0.5}
                    strokeOpacity={0.2}
                    rx={2}
                  />

                  <text
                    x={bx + BUILDING_WIDTH / 2}
                    y={by + ROOF_HEIGHT + MAGIC_KEYS.length * FLOOR_HEIGHT + 18}
                    fill={civ.color}
                    fontSize={11}
                    fontWeight={700}
                    textAnchor="middle"
                    fontFamily="Inter, sans-serif"
                  >
                    {civ.shortName}
                  </text>

                  <text
                    x={bx + BUILDING_WIDTH / 2}
                    y={by + ROOF_HEIGHT / 2 + 4}
                    fill={civ.color}
                    fontSize={8}
                    fontWeight={600}
                    textAnchor="middle"
                    fontFamily="Inter, sans-serif"
                    fillOpacity={0.6}
                  >
                    {civ.name}
                  </text>
                </g>
              );
            })}

            {bridges.map((bridge, i) => (
              <BridgePath
                key={i}
                bridge={bridge}
                totalWidth={totalWidth}
                onHover={() => setHoveredBridge(i)}
                onLeave={() => setHoveredBridge(null)}
                isHovered={hoveredBridge === i}
              />
            ))}
          </svg>
        </div>

        <AnimatePresence>
          {selectedRoom && (
            <RoomDetailPanel
              key={`${selectedRoom.civId}-${selectedRoom.cycle}-${selectedRoom.milestone.phase}-${selectedRoom.floor}`}
              room={selectedRoom}
              onClose={() => setSelectedRoom(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
