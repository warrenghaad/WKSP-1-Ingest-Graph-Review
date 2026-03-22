import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CIVILIZATIONS, type Civilization } from "@/lib/braidData";
import { MAGIC_LABELS, type MAGICVector } from "@/lib/magicFramework";
import { DII_MILESTONES, type DIIMilestone } from "@/lib/diiMilestones";

const MAGIC_KEYS: (keyof MAGICVector)[] = ["M", "A", "G", "I", "C"];

const TIME_START = -5000;
const TIME_END = 400;
const TIME_SPAN = TIME_END - TIME_START;

const ROW_HEIGHT = 110;
const ROW_GAP = 18;
const LEFT_LABEL_W = 120;
const RIGHT_PAD = 60;
const TOP_PAD = 60;
const BOTTOM_PAD = 40;
const CHART_MIN_W = 1200;

const BRAID_AMPLITUDE = 14;
const BRAID_FREQ = 0.012;

const PHASE_COLORS: Record<string, string> = {
  discovery: "#eab308",
  innovation: "#a855f7",
  invention: "#22c55e",
};

function yearToX(year: number, chartW: number): number {
  return LEFT_LABEL_W + ((year - TIME_START) / TIME_SPAN) * chartW;
}

interface BraidStrandProps {
  startX: number;
  endX: number;
  centerY: number;
  strandIndex: number;
  weight: number;
  color: string;
}

function generateBraidPath(
  startX: number,
  endX: number,
  centerY: number,
  strandIndex: number,
  weight: number,
): string {
  const len = endX - startX;
  const segments = Math.max(60, Math.floor(len / 3));
  const basePhase = (strandIndex / 5) * Math.PI * 2;
  const amp = BRAID_AMPLITUDE * (0.3 + weight * 0.7);

  let d = "";
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const x = startX + t * len;
    const angle = basePhase + x * BRAID_FREQ * (3 + weight * 4);
    const y = centerY + Math.sin(angle) * amp;
    if (i === 0) d = `M ${x} ${y}`;
    else {
      const prevT = (i - 1) / segments;
      const prevX = startX + prevT * len;
      const prevAngle = basePhase + prevX * BRAID_FREQ * (3 + weight * 4);
      const prevY = centerY + Math.sin(prevAngle) * amp;
      const cpX = (prevX + x) / 2;
      d += ` C ${cpX} ${prevY} ${cpX} ${y} ${x} ${y}`;
    }
  }
  return d;
}

interface InventionData {
  milestone: DIIMilestone;
  x: number;
  y: number;
  civColor: string;
  civName: string;
}

interface HoverCardProps {
  inv: InventionData;
  onClose: () => void;
  onEnter: () => void;
}

function InventionHoverCard({ inv, onClose, onEnter }: HoverCardProps) {
  const cardTop = inv.y - 260;
  const flipBelow = cardTop < 10;
  const top = flipBelow ? inv.y + ROW_HEIGHT + 10 : cardTop;
  const left = Math.max(10, Math.min(inv.x - 160, 1400));

  return (
    <motion.div
      initial={{ opacity: 0, y: flipBelow ? -10 : 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: flipBelow ? -10 : 10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="absolute z-50 pointer-events-auto"
      style={{ left, top, width: 320 }}
      onMouseEnter={onEnter}
      onMouseLeave={onClose}
    >
      <div className="rounded-xl overflow-hidden border border-white/15 bg-black/95 backdrop-blur-2xl shadow-2xl shadow-black/50">
        <div className="relative w-full h-40 overflow-hidden">
          <img
            src={inv.milestone.imageUrl}
            alt={inv.milestone.title}
            className="w-full h-full object-cover"
            data-testid={`img-invention-${inv.milestone.title.slice(0,20).replace(/\s+/g,'-').toLowerCase()}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-2 left-3 right-3">
            <div className="flex items-center gap-1.5 mb-1">
              <span
                className="text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider"
                style={{ color: "#22c55e", backgroundColor: "#22c55e15", border: "1px solid #22c55e30" }}
              >
                Invention
              </span>
              <span className="text-[10px] text-white/60 font-mono">
                {inv.milestone.year < 0 ? `${Math.abs(inv.milestone.year)} BCE` : `${inv.milestone.year} CE`}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-white leading-tight">{inv.milestone.title}</h3>
          </div>
        </div>

        <div className="p-3 space-y-2">
          <p className="text-[11px] text-white/60 leading-relaxed">{inv.milestone.description}</p>

          <div className="flex items-center gap-1 pt-1">
            {inv.milestone.magicDrivers.map((d) => (
              <span
                key={d}
                className="text-[9px] px-1.5 py-0.5 rounded font-bold"
                style={{
                  color: MAGIC_LABELS[d as keyof MAGICVector]?.color || "#888",
                  backgroundColor: (MAGIC_LABELS[d as keyof MAGICVector]?.color || "#888") + "20",
                }}
              >
                {d}
              </span>
            ))}
            <span className="ml-auto text-[9px] px-2 py-0.5 rounded-full font-medium" style={{ color: inv.civColor, backgroundColor: inv.civColor + "15" }}>
              {inv.civName}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SmallMilestoneTooltip({ milestone, x, y }: { milestone: DIIMilestone; x: number; y: number }) {
  const phaseColor = PHASE_COLORS[milestone.phase];
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 5 }}
      className="absolute z-40 pointer-events-none"
      style={{ left: x - 100, top: y - 70, width: 200 }}
    >
      <div className="rounded-lg p-2 border border-white/10 bg-black/90 backdrop-blur-xl shadow-lg">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-[8px] px-1 py-0.5 rounded uppercase font-bold" style={{ color: phaseColor, backgroundColor: phaseColor + "15" }}>
            {milestone.phase}
          </span>
          <span className="text-[9px] text-white/40 font-mono">
            {milestone.year < 0 ? `${Math.abs(milestone.year)} BCE` : `${milestone.year} CE`}
          </span>
        </div>
        <p className="text-[10px] text-white/80 font-medium leading-tight">{milestone.title}</p>
      </div>
    </motion.div>
  );
}

function CivRow({
  civ,
  rowIndex,
  chartW,
  isSelected,
  onSelect,
  onHoverInvention,
  onLeaveInvention,
  hoveredInventionKey,
  onHoverSmall,
  onLeaveSmall,
  hoveredSmallKey,
}: {
  civ: Civilization;
  rowIndex: number;
  chartW: number;
  isSelected: boolean;
  onSelect: () => void;
  onHoverInvention: (key: string, inv: InventionData) => void;
  onLeaveInvention: () => void;
  hoveredInventionKey: string | null;
  onHoverSmall: (key: string, m: DIIMilestone, x: number, y: number) => void;
  onLeaveSmall: () => void;
  hoveredSmallKey: string | null;
}) {
  const topY = TOP_PAD + rowIndex * (ROW_HEIGHT + ROW_GAP);
  const centerY = topY + ROW_HEIGHT / 2;
  const startX = yearToX(civ.startYear, chartW);
  const endX = yearToX(civ.endYear, chartW);

  const cycles = DII_MILESTONES[civ.id] || [];
  const allMilestones = cycles.flatMap((c) => c.milestones);

  const inventions = allMilestones.filter((m) => m.phase === "invention");
  const others = allMilestones.filter((m) => m.phase !== "invention");

  return (
    <g data-testid={`gantt-row-${civ.id}`}>
      <rect
        x={startX}
        y={topY}
        width={Math.max(0, endX - startX)}
        height={ROW_HEIGHT}
        rx={6}
        fill={civ.color + "08"}
        stroke={isSelected ? civ.color + "50" : civ.color + "18"}
        strokeWidth={isSelected ? 1.5 : 0.5}
        className="cursor-pointer"
        onClick={onSelect}
        style={{ transition: "stroke 0.2s" }}
      />

      {MAGIC_KEYS.map((key, i) => {
        const weight = civ.magicProfile[key];
        const color = MAGIC_LABELS[key].color;
        const sw = 0.6 + weight * 2;
        return (
          <path
            key={key}
            d={generateBraidPath(startX + 4, endX - 4, centerY, i, weight)}
            fill="none"
            stroke={color}
            strokeWidth={sw}
            strokeLinecap="round"
            opacity={isSelected ? 0.7 : 0.4}
            style={{ transition: "opacity 0.3s" }}
          />
        );
      })}

      {others.map((m, mi) => {
        const mx = yearToX(m.year, chartW);
        const phaseColor = PHASE_COLORS[m.phase];
        const key = `${civ.id}-${m.phase}-${mi}`;
        const isHov = hoveredSmallKey === key;
        return (
          <g key={key}>
            <circle
              cx={mx}
              cy={centerY}
              r={isHov ? 5 : 3.5}
              fill={phaseColor}
              fillOpacity={isHov ? 0.9 : 0.5}
              stroke={phaseColor}
              strokeWidth={isHov ? 1.5 : 0.5}
              strokeOpacity={0.3}
              className="cursor-pointer"
              style={{ transition: "all 0.15s" }}
              onMouseEnter={() => onHoverSmall(key, m, mx, topY)}
              onMouseLeave={onLeaveSmall}
            />
          </g>
        );
      })}

      {inventions.map((m, mi) => {
        const mx = yearToX(m.year, chartW);
        const imgR = 22;
        const key = `${civ.id}-inv-${mi}`;
        const isHov = hoveredInventionKey === key;
        const clipId = `clip-inv-${civ.id}-${mi}`;
        return (
          <g
            key={key}
            className="cursor-pointer"
            onMouseEnter={() =>
              onHoverInvention(key, { milestone: m, x: mx, y: topY, civColor: civ.color, civName: civ.shortName })
            }
            onMouseLeave={onLeaveInvention}
          >
            <defs>
              <clipPath id={clipId}>
                <circle cx={mx} cy={centerY} r={imgR} />
              </clipPath>
            </defs>

            <circle
              cx={mx}
              cy={centerY}
              r={imgR + 3}
              fill="none"
              stroke="#22c55e"
              strokeWidth={isHov ? 2.5 : 1.5}
              opacity={isHov ? 1 : 0.5}
              style={{ transition: "all 0.2s" }}
              filter="url(#glow-green)"
            />
            <circle
              cx={mx}
              cy={centerY}
              r={imgR + 1}
              fill="black"
              opacity={0.4}
            />
            <image
              href={m.imageUrl}
              x={mx - imgR}
              y={centerY - imgR}
              width={imgR * 2}
              height={imgR * 2}
              clipPath={`url(#${clipId})`}
              preserveAspectRatio="xMidYMid slice"
              opacity={isHov ? 1 : 0.85}
              style={{ transition: "opacity 0.2s" }}
            />

            {isHov && (
              <circle
                cx={mx}
                cy={centerY}
                r={imgR + 6}
                fill="none"
                stroke="#22c55e"
                strokeWidth={1}
                opacity={0.3}
                strokeDasharray="3 3"
              />
            )}
          </g>
        );
      })}
    </g>
  );
}

function TimeAxis({ chartW, totalH }: { chartW: number; totalH: number }) {
  const ticks: number[] = [];
  for (let y = Math.ceil(TIME_START / 500) * 500; y <= TIME_END; y += 500) {
    ticks.push(y);
  }

  return (
    <g>
      {ticks.map((year) => {
        const x = yearToX(year, chartW);
        return (
          <g key={year}>
            <line x1={x} y1={TOP_PAD - 8} x2={x} y2={totalH - BOTTOM_PAD} stroke="white" strokeWidth={0.5} opacity={0.06} strokeDasharray="4 8" />
            <text x={x} y={TOP_PAD - 14} fill="white" fontSize={9} textAnchor="middle" opacity={0.35} fontFamily="Inter, sans-serif">
              {year < 0 ? `${Math.abs(year)}` : year}
            </text>
            <text x={x} y={TOP_PAD - 4} fill="white" fontSize={7} textAnchor="middle" opacity={0.2} fontFamily="Inter, sans-serif">
              {year < 0 ? "BCE" : "CE"}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function GanttLegend() {
  return (
    <div className="flex flex-wrap items-center gap-4 justify-center">
      <div className="flex items-center gap-3">
        {MAGIC_KEYS.map((key) => (
          <div key={key} className="flex items-center gap-1">
            <div className="w-4 h-0.5 rounded-full" style={{ backgroundColor: MAGIC_LABELS[key].color }} />
            <span className="text-[9px] text-white/40">
              <span className="font-bold" style={{ color: MAGIC_LABELS[key].color }}>{key}</span>
            </span>
          </div>
        ))}
      </div>
      <div className="w-px h-3 bg-white/10" />
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-amber-500/60" />
          <span className="text-[9px] text-white/40">Discovery</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-purple-500/60" />
          <span className="text-[9px] text-white/40">Innovation</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-green-500/80 ring-1 ring-green-400/40" />
          <span className="text-[9px] text-green-400/80 font-semibold">Invention</span>
        </div>
      </div>
    </div>
  );
}

export default function BraidSVGView({
  selectedCiv,
  onSelectCiv,
}: {
  selectedCiv: string | null;
  onSelectCiv: (id: string | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredInvention, setHoveredInvention] = useState<{ key: string; data: InventionData } | null>(null);
  const [hoveredSmall, setHoveredSmall] = useState<{ key: string; m: DIIMilestone; x: number; y: number } | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const civCount = CIVILIZATIONS.length;
  const chartW = Math.max(CHART_MIN_W - LEFT_LABEL_W - RIGHT_PAD, 900);
  const totalW = LEFT_LABEL_W + chartW + RIGHT_PAD;
  const totalH = TOP_PAD + civCount * (ROW_HEIGHT + ROW_GAP) - ROW_GAP + BOTTOM_PAD;

  const cancelClose = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const handleHoverInvention = useCallback((key: string, inv: InventionData) => {
    cancelClose();
    setHoveredInvention({ key, data: inv });
  }, [cancelClose]);

  const handleLeaveInvention = useCallback(() => {
    closeTimerRef.current = setTimeout(() => {
      setHoveredInvention(null);
    }, 150);
  }, []);

  const handleCardEnter = useCallback(() => {
    cancelClose();
  }, [cancelClose]);

  useEffect(() => {
    return () => { if (closeTimerRef.current) clearTimeout(closeTimerRef.current); };
  }, []);

  const handleHoverSmall = useCallback((key: string, m: DIIMilestone, x: number, y: number) => {
    setHoveredSmall({ key, m, x, y });
  }, []);

  const handleLeaveSmall = useCallback(() => {
    setHoveredSmall(null);
  }, []);

  return (
    <div className="w-full h-full flex flex-col" data-testid="braid-gantt-view">
      <div className="flex-shrink-0 py-2.5 px-4 border-b border-white/5">
        <GanttLegend />
      </div>

      <div className="flex-1 overflow-auto relative" ref={containerRef}>
        <div className="min-w-fit p-4 relative">
          <svg
            width={totalW}
            height={totalH}
            viewBox={`0 0 ${totalW} ${totalH}`}
            className="mx-auto"
          >
            <defs>
              <filter id="glow-green">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <TimeAxis chartW={chartW} totalH={totalH} />

            {CIVILIZATIONS.map((civ, i) => {
              const topY = TOP_PAD + i * (ROW_HEIGHT + ROW_GAP);
              const centerY = topY + ROW_HEIGHT / 2;
              return (
                <g key={`label-${civ.id}`}>
                  <circle cx={16} cy={centerY} r={5} fill={civ.color} opacity={0.7} />
                  <text
                    x={28}
                    y={centerY - 6}
                    fill={civ.color}
                    fontSize={12}
                    fontWeight={700}
                    fontFamily="Inter, sans-serif"
                    opacity={selectedCiv === civ.id ? 1 : 0.7}
                    className="cursor-pointer"
                    onClick={() => onSelectCiv(selectedCiv === civ.id ? null : civ.id)}
                  >
                    {civ.shortName}
                  </text>
                  <text
                    x={28}
                    y={centerY + 8}
                    fill={civ.color}
                    fontSize={8}
                    fontFamily="Inter, sans-serif"
                    opacity={0.4}
                  >
                    {Math.abs(civ.startYear)}–{Math.abs(civ.endYear)} BCE
                  </text>
                </g>
              );
            })}

            {CIVILIZATIONS.map((civ, i) => (
              <CivRow
                key={civ.id}
                civ={civ}
                rowIndex={i}
                chartW={chartW}
                isSelected={selectedCiv === civ.id}
                onSelect={() => onSelectCiv(selectedCiv === civ.id ? null : civ.id)}
                onHoverInvention={handleHoverInvention}
                onLeaveInvention={handleLeaveInvention}
                hoveredInventionKey={hoveredInvention?.key ?? null}
                onHoverSmall={handleHoverSmall}
                onLeaveSmall={handleLeaveSmall}
                hoveredSmallKey={hoveredSmall?.key ?? null}
              />
            ))}
          </svg>

          <AnimatePresence>
            {hoveredInvention && (
              <InventionHoverCard
                key={hoveredInvention.key}
                inv={hoveredInvention.data}
                onClose={handleLeaveInvention}
                onEnter={handleCardEnter}
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {hoveredSmall && (
              <SmallMilestoneTooltip
                key={hoveredSmall.key}
                milestone={hoveredSmall.m}
                x={hoveredSmall.x}
                y={hoveredSmall.y}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
