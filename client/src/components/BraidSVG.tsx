import { useState, useMemo } from "react";
import { CIVILIZATIONS, type Civilization } from "@/lib/braidData";
import { MAGIC_LABELS, type MAGICVector } from "@/lib/magicFramework";
import { DII_MILESTONES, type DIIMilestone } from "@/lib/diiMilestones";

const MAGIC_KEYS: (keyof MAGICVector)[] = ["M", "A", "G", "I", "C"];
const CYCLES = 3;
const STRAND_HEIGHT = 800;
const BRAID_WIDTH = 120;

const INNOVATION_ACTIVE: number[][] = [
  [0, 1, 3],
  [1, 2, 4],
  [0, 2, 3, 4],
];

interface StrandPoint {
  x: number;
  y: number;
}

function generateStrandPath(
  strandIndex: number,
  weight: number,
  width: number,
  height: number,
  xOffset: number
): StrandPoint[] {
  const points: StrandPoint[] = [];
  const segments = 200;
  const baseAngle = (strandIndex / 5) * Math.PI * 2;
  const cycleLen = height / CYCLES;

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const y = t * height;
    const cycleIndex = Math.min(Math.floor(y / cycleLen), CYCLES - 1);
    const cycleT = (y - cycleIndex * cycleLen) / cycleLen;

    let spreadRadius: number;
    let twistSpeed: number;

    const activeInInnovation = INNOVATION_ACTIVE[cycleIndex % INNOVATION_ACTIVE.length].includes(strandIndex);

    if (cycleT < 0.4) {
      const blend = cycleT / 0.4;
      spreadRadius = width * 0.42;
      twistSpeed = 0.6 + blend * 0.4;
      const drift = Math.sin(t * 8 + strandIndex * 1.3) * width * 0.05;
      const x = xOffset + Math.sin(baseAngle + t * Math.PI * 2 * twistSpeed * CYCLES) * spreadRadius * (0.3 + weight * 0.7) + drift;
      points.push({ x, y });
      continue;
    } else if (cycleT < 0.75) {
      const blend = (cycleT - 0.4) / 0.35;
      const converge = blend * blend;
      if (activeInInnovation) {
        spreadRadius = width * 0.42 * (1 - converge * 0.65);
        twistSpeed = 2.5 + converge * 5;
      } else {
        spreadRadius = width * 0.42 * (1 - converge * 0.15);
        twistSpeed = 0.8;
      }
    } else {
      const blend = (cycleT - 0.75) / 0.25;
      const tighten = blend * blend;
      spreadRadius = width * 0.42 * 0.35 * (1 - tighten * 0.8);
      twistSpeed = 6 + tighten * 8;
    }

    const angle = t * Math.PI * 2 * twistSpeed * CYCLES + baseAngle;
    const x = xOffset + Math.sin(angle) * spreadRadius * (0.3 + weight * 0.7);
    points.push({ x, y });
  }

  return points;
}

function pointsToPath(points: StrandPoint[]): string {
  if (points.length === 0) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpY = (prev.y + curr.y) / 2;
    d += ` C ${prev.x} ${cpY} ${curr.x} ${cpY} ${curr.x} ${curr.y}`;
  }
  return d;
}

function generateGreenWrapPath(
  cycleIndex: number,
  width: number,
  height: number,
  xOffset: number
): string {
  const cycleLen = height / CYCLES;
  const wrapStart = cycleIndex * cycleLen + cycleLen * 0.8;
  const wrapEnd = cycleIndex * cycleLen + cycleLen * 0.97;
  const segments = 40;
  const points: StrandPoint[] = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const y = wrapStart + t * (wrapEnd - wrapStart);
    const angle = t * Math.PI * 2 * 4;
    const r = width * 0.18 * (1 - t * 0.4);
    const x = xOffset + Math.sin(angle) * r;
    points.push({ x, y });
  }

  return pointsToPath(points);
}

interface MilestonePosition {
  milestone: DIIMilestone;
  y: number;
  side: "left" | "right";
}

function computeMilestonePositions(civId: string, height: number): MilestonePosition[] {
  const cycles = DII_MILESTONES[civId];
  if (!cycles) return [];

  const positions: MilestonePosition[] = [];
  const cycleLen = height / CYCLES;

  for (let c = 0; c < CYCLES && c < cycles.length; c++) {
    const base = c * cycleLen;
    const milestones = cycles[c].milestones;

    for (const m of milestones) {
      let y: number;
      if (m.phase === "discovery") {
        y = base + cycleLen * 0.2;
      } else if (m.phase === "innovation") {
        y = base + cycleLen * 0.575;
      } else {
        y = base + cycleLen * 0.875;
      }

      positions.push({
        milestone: m,
        y,
        side: m.phase === "innovation" ? "left" : "right",
      });
    }
  }

  return positions;
}

const PHASE_COLORS: Record<string, string> = {
  discovery: "#eab308",
  innovation: "#a855f7",
  invention: "#22c55e",
};

const IMG_SIZE = 28;

function MilestoneNode({
  pos,
  xCenter,
  onHover,
  onLeave,
  isHovered,
  clipId,
}: {
  pos: MilestonePosition;
  xCenter: number;
  onHover: () => void;
  onLeave: () => void;
  isHovered: boolean;
  clipId: string;
}) {
  const phaseColor = PHASE_COLORS[pos.milestone.phase];
  const offset = pos.side === "right" ? BRAID_WIDTH / 2 + 22 : -(BRAID_WIDTH / 2 + 22);
  const imgX = xCenter + offset - IMG_SIZE / 2;
  const imgY = pos.y - IMG_SIZE / 2;
  const connX = pos.side === "right" ? xCenter + BRAID_WIDTH / 2 + 4 : xCenter - BRAID_WIDTH / 2 - 4;

  return (
    <g
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      style={{ cursor: "pointer" }}
    >
      <line
        x1={connX}
        y1={pos.y}
        x2={xCenter + offset}
        y2={pos.y}
        stroke={phaseColor}
        strokeWidth={0.8}
        opacity={0.3}
        strokeDasharray="2 2"
      />

      <defs>
        <clipPath id={clipId}>
          <circle cx={xCenter + offset} cy={pos.y} r={IMG_SIZE / 2} />
        </clipPath>
      </defs>

      <circle
        cx={xCenter + offset}
        cy={pos.y}
        r={IMG_SIZE / 2 + 2}
        fill="none"
        stroke={phaseColor}
        strokeWidth={isHovered ? 2 : 1}
        opacity={isHovered ? 0.9 : 0.4}
        style={{ transition: "all 0.2s" }}
      />

      <image
        href={pos.milestone.imageUrl}
        x={imgX}
        y={imgY}
        width={IMG_SIZE}
        height={IMG_SIZE}
        clipPath={`url(#${clipId})`}
        preserveAspectRatio="xMidYMid slice"
        opacity={isHovered ? 1 : 0.7}
        style={{ transition: "opacity 0.2s" }}
      />

      {isHovered && (
        <g>
          <rect
            x={pos.side === "right" ? xCenter + offset + IMG_SIZE / 2 + 6 : xCenter + offset - IMG_SIZE / 2 - 160}
            y={pos.y - 32}
            width={154}
            height={64}
            rx={6}
            fill="black"
            fillOpacity={0.92}
            stroke={phaseColor}
            strokeWidth={0.5}
            strokeOpacity={0.4}
          />
          <text
            x={pos.side === "right" ? xCenter + offset + IMG_SIZE / 2 + 12 : xCenter + offset - IMG_SIZE / 2 - 154}
            y={pos.y - 17}
            fill={phaseColor}
            fontSize={8}
            fontWeight={700}
            fontFamily="Inter, sans-serif"
            textTransform="uppercase"
          >
            {pos.milestone.phase} · {Math.abs(pos.milestone.year)} BCE
          </text>
          <text
            x={pos.side === "right" ? xCenter + offset + IMG_SIZE / 2 + 12 : xCenter + offset - IMG_SIZE / 2 - 154}
            y={pos.y - 4}
            fill="white"
            fontSize={9}
            fontWeight={600}
            fontFamily="Inter, sans-serif"
          >
            {pos.milestone.title.length > 22 ? pos.milestone.title.slice(0, 22) + "…" : pos.milestone.title}
          </text>
          <text
            x={pos.side === "right" ? xCenter + offset + IMG_SIZE / 2 + 12 : xCenter + offset - IMG_SIZE / 2 - 154}
            y={pos.y + 10}
            fill="white"
            fillOpacity={0.5}
            fontSize={7}
            fontFamily="Inter, sans-serif"
          >
            {pos.milestone.description.length > 40 ? pos.milestone.description.slice(0, 40) + "…" : pos.milestone.description}
          </text>
          <g>
            {pos.milestone.magicDrivers.map((d, di) => (
              <g key={di}>
                <rect
                  x={(pos.side === "right" ? xCenter + offset + IMG_SIZE / 2 + 12 : xCenter + offset - IMG_SIZE / 2 - 154) + di * 18}
                  y={pos.y + 16}
                  width={15}
                  height={10}
                  rx={2}
                  fill={MAGIC_LABELS[d as keyof MAGICVector]?.color || "#888"}
                  fillOpacity={0.2}
                />
                <text
                  x={(pos.side === "right" ? xCenter + offset + IMG_SIZE / 2 + 12 : xCenter + offset - IMG_SIZE / 2 - 154) + di * 18 + 7.5}
                  y={pos.y + 24}
                  fill={MAGIC_LABELS[d as keyof MAGICVector]?.color || "#888"}
                  fontSize={7}
                  fontWeight={700}
                  fontFamily="Inter, sans-serif"
                  textAnchor="middle"
                >
                  {d}
                </text>
              </g>
            ))}
          </g>
        </g>
      )}
    </g>
  );
}

function CivBraidSVG({
  civ,
  xCenter,
  height,
  isSelected,
  onSelect,
}: {
  civ: Civilization;
  xCenter: number;
  height: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const [hoveredStrand, setHoveredStrand] = useState<number | null>(null);
  const [hoveredMilestone, setHoveredMilestone] = useState<number | null>(null);

  const strands = useMemo(
    () =>
      MAGIC_KEYS.map((key, i) =>
        generateStrandPath(i, civ.magicProfile[key], BRAID_WIDTH, height, xCenter)
      ),
    [civ, xCenter, height]
  );

  const greenWraps = useMemo(
    () =>
      Array.from({ length: CYCLES }, (_, c) =>
        generateGreenWrapPath(c, BRAID_WIDTH, height, xCenter)
      ),
    [xCenter, height]
  );

  const inventionMarkers = useMemo(() => {
    const markers: number[] = [];
    const cycleLen = height / CYCLES;
    for (let c = 0; c < CYCLES; c++) {
      markers.push(c * cycleLen + cycleLen * 0.875);
    }
    return markers;
  }, [height]);

  const milestonePositions = useMemo(
    () => computeMilestonePositions(civ.id, height),
    [civ.id, height]
  );

  const phaseBands = useMemo(() => {
    const bands: { y: number; h: number; color: string }[] = [];
    const cycleLen = height / CYCLES;
    for (let c = 0; c < CYCLES; c++) {
      const base = c * cycleLen;
      bands.push({ y: base, h: cycleLen * 0.4, color: "#eab30804" });
      bands.push({ y: base + cycleLen * 0.4, h: cycleLen * 0.35, color: "#a855f704" });
      bands.push({ y: base + cycleLen * 0.75, h: cycleLen * 0.25, color: "#22c55e06" });
    }
    return bands;
  }, [height]);

  return (
    <g className="cursor-pointer" onClick={onSelect}>
      {phaseBands.map((band, i) => (
        <rect
          key={`band-${i}`}
          x={xCenter - BRAID_WIDTH / 2 - 5}
          y={band.y}
          width={BRAID_WIDTH + 10}
          height={band.h}
          fill={band.color}
          rx={4}
        />
      ))}

      {isSelected && (
        <rect
          x={xCenter - BRAID_WIDTH / 2 - 10}
          y={-10}
          width={BRAID_WIDTH + 20}
          height={height + 50}
          rx={8}
          fill="none"
          stroke={civ.color}
          strokeWidth={1}
          strokeDasharray="4 4"
          opacity={0.3}
        />
      )}

      {strands.map((points, i) => {
        const key = MAGIC_KEYS[i];
        const color = MAGIC_LABELS[key].color;
        const weight = civ.magicProfile[key];
        const isHovered = hoveredStrand === i;
        const strokeW = 1.2 + weight * 3.5;

        return (
          <path
            key={key}
            d={pointsToPath(points)}
            fill="none"
            stroke={color}
            strokeWidth={isHovered ? strokeW + 2 : strokeW}
            strokeLinecap="round"
            opacity={isHovered ? 1 : isSelected ? 0.85 : 0.55}
            style={{ transition: "opacity 0.2s, stroke-width 0.2s" }}
            onMouseEnter={() => setHoveredStrand(i)}
            onMouseLeave={() => setHoveredStrand(null)}
          >
            <title>{MAGIC_LABELS[key].name}: {weight.toFixed(2)}</title>
          </path>
        );
      })}

      {greenWraps.map((d, i) => (
        <path
          key={`gw-${i}`}
          d={d}
          fill="none"
          stroke="#22c55e"
          strokeWidth={3.5}
          strokeLinecap="round"
          opacity={0.85}
          filter="url(#glow-green)"
        />
      ))}

      {inventionMarkers.map((y, i) => (
        <g key={`inv-${i}`}>
          <circle
            cx={xCenter}
            cy={y}
            r={10}
            fill="none"
            stroke="#22c55e"
            strokeWidth={1.5}
            opacity={0.4}
          />
          <circle
            cx={xCenter}
            cy={y}
            r={4}
            fill="#22c55e"
            opacity={0.7}
          />
        </g>
      ))}

      {milestonePositions.map((pos, i) => (
        <MilestoneNode
          key={`ms-${i}`}
          pos={pos}
          xCenter={xCenter}
          onHover={() => setHoveredMilestone(i)}
          onLeave={() => setHoveredMilestone(null)}
          isHovered={hoveredMilestone === i}
          clipId={`clip-${civ.id}-${i}`}
        />
      ))}

      <line
        x1={xCenter}
        y1={-8}
        x2={xCenter}
        y2={0}
        stroke={civ.color}
        strokeWidth={1}
        opacity={0.3}
      />
      <circle cx={xCenter} cy={-12} r={4} fill={civ.color} opacity={0.6} />

      <text
        x={xCenter}
        y={height + 20}
        fill={civ.color}
        fontSize={11}
        fontWeight={700}
        textAnchor="middle"
        fontFamily="Inter, sans-serif"
      >
        {civ.shortName}
      </text>
      <text
        x={xCenter}
        y={height + 34}
        fill={civ.color}
        fontSize={8}
        textAnchor="middle"
        fontFamily="Inter, sans-serif"
        opacity={0.5}
      >
        {Math.abs(civ.startYear)}–{Math.abs(civ.endYear)} BCE
      </text>

      {hoveredStrand !== null && (
        <g>
          <rect
            x={xCenter + BRAID_WIDTH / 2 + 8}
            y={height / 2 - 18}
            width={90}
            height={36}
            rx={6}
            fill="black"
            fillOpacity={0.9}
            stroke="white"
            strokeOpacity={0.15}
            strokeWidth={0.5}
          />
          <text
            x={xCenter + BRAID_WIDTH / 2 + 14}
            y={height / 2 - 2}
            fill={MAGIC_LABELS[MAGIC_KEYS[hoveredStrand]].color}
            fontSize={10}
            fontWeight={600}
            fontFamily="Inter, sans-serif"
          >
            {MAGIC_LABELS[MAGIC_KEYS[hoveredStrand]].name}
          </text>
          <text
            x={xCenter + BRAID_WIDTH / 2 + 14}
            y={height / 2 + 12}
            fill="white"
            fillOpacity={0.5}
            fontSize={9}
            fontFamily="Inter, sans-serif"
          >
            Weight: {civ.magicProfile[MAGIC_KEYS[hoveredStrand]].toFixed(2)}
          </text>
        </g>
      )}
    </g>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {MAGIC_KEYS.map((key) => (
        <div key={key} className="flex items-center gap-1.5">
          <div
            className="w-3 h-1 rounded-full"
            style={{ backgroundColor: MAGIC_LABELS[key].color }}
          />
          <span className="text-[10px] text-white/50">
            <span className="font-bold" style={{ color: MAGIC_LABELS[key].color }}>
              {key}
            </span>{" "}
            {MAGIC_LABELS[key].name}
          </span>
        </div>
      ))}
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-1 rounded-full bg-green-500" />
        <span className="text-[10px] text-white/50">
          <span className="font-bold text-green-500">G-Wrap</span> Invention
        </span>
      </div>
    </div>
  );
}

function DiiCycleLegend() {
  return (
    <div className="flex items-center gap-4 justify-center">
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-amber-500/40" />
        <span className="text-[9px] text-white/40">Discovery (strands separate)</span>
      </div>
      <div className="text-white/20 text-[9px]">&rarr;</div>
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-purple-500/40" />
        <span className="text-[9px] text-white/40">Innovation (2-4 cross)</span>
      </div>
      <div className="text-white/20 text-[9px]">&rarr;</div>
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-green-500/60" />
        <span className="text-[9px] text-white/40">Invention (all 5 converge)</span>
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
  const civCount = CIVILIZATIONS.length;
  const spacing = BRAID_WIDTH + 100;
  const totalWidth = civCount * spacing;
  const svgHeight = STRAND_HEIGHT + 60;

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-shrink-0 py-3 px-4 space-y-2 border-b border-white/5">
        <Legend />
        <DiiCycleLegend />
      </div>

      <div className="flex-1 overflow-auto relative">
        <div className="min-w-fit p-6">
          <svg
            width={totalWidth + 40}
            height={svgHeight}
            viewBox={`0 0 ${totalWidth + 40} ${svgHeight}`}
            className="mx-auto"
          >
            <defs>
              <filter id="glow-green">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {CIVILIZATIONS.map((civ, i) => {
              const xCenter = 20 + spacing / 2 + i * spacing;
              return (
                <CivBraidSVG
                  key={civ.id}
                  civ={civ}
                  xCenter={xCenter}
                  height={STRAND_HEIGHT}
                  isSelected={selectedCiv === civ.id}
                  onSelect={() =>
                    onSelectCiv(selectedCiv === civ.id ? null : civ.id)
                  }
                />
              );
            })}

            {Array.from({ length: CYCLES }, (_, c) => {
              const cycleLen = STRAND_HEIGHT / CYCLES;
              const y = c * cycleLen;
              return (
                <g key={`cycle-${c}`}>
                  <line
                    x1={10}
                    y1={y}
                    x2={totalWidth + 30}
                    y2={y}
                    stroke="white"
                    strokeWidth={0.5}
                    opacity={0.06}
                    strokeDasharray="4 8"
                  />
                  <text
                    x={8}
                    y={y + 12}
                    fill="white"
                    fontSize={8}
                    opacity={0.15}
                    fontFamily="Inter, sans-serif"
                  >
                    Cycle {c + 1}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}
