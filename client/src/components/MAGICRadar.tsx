import { useMemo } from "react";
import { motion } from "framer-motion";
import type { MAGICVector } from "@/lib/magicFramework";
import { MAGIC_LABELS } from "@/lib/magicFramework";

interface MAGICRadarProps {
  vector: MAGICVector;
  size?: number;
  showLabels?: boolean;
  animated?: boolean;
}

export default function MAGICRadar({ vector, size = 120, showLabels = true, animated = true }: MAGICRadarProps) {
  const center = size / 2;
  const radius = size * 0.38;
  const keys: (keyof MAGICVector)[] = ["M", "A", "G", "I", "C"];

  const points = useMemo(() => {
    return keys.map((key, i) => {
      const angle = (Math.PI * 2 * i) / keys.length - Math.PI / 2;
      const value = vector[key];
      const x = center + Math.cos(angle) * radius * value;
      const y = center + Math.sin(angle) * radius * value;
      return { key, x, y, angle, value };
    });
  }, [vector, center, radius]);

  const polygonPoints = points.map((p) => `${p.x},${p.y}`).join(" ");

  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {gridLevels.map((level) => (
          <polygon
            key={level}
            points={keys
              .map((_, i) => {
                const angle = (Math.PI * 2 * i) / keys.length - Math.PI / 2;
                return `${center + Math.cos(angle) * radius * level},${center + Math.sin(angle) * radius * level}`;
              })
              .join(" ")}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={0.5}
          />
        ))}

        {keys.map((_, i) => {
          const angle = (Math.PI * 2 * i) / keys.length - Math.PI / 2;
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={center + Math.cos(angle) * radius}
              y2={center + Math.sin(angle) * radius}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={0.5}
            />
          );
        })}

        {animated ? (
          <motion.polygon
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            points={polygonPoints}
            fill="rgba(234, 179, 8, 0.15)"
            stroke="#eab308"
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
        ) : (
          <polygon
            points={polygonPoints}
            fill="rgba(234, 179, 8, 0.15)"
            stroke="#eab308"
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
        )}

        {points.map((p) => (
          <circle
            key={p.key}
            cx={p.x}
            cy={p.y}
            r={3}
            fill={MAGIC_LABELS[p.key].color}
            stroke="#000"
            strokeWidth={1}
          />
        ))}

        {showLabels &&
          points.map((p) => {
            const labelR = radius + 14;
            const lx = center + Math.cos(p.angle) * labelR;
            const ly = center + Math.sin(p.angle) * labelR;
            return (
              <text
                key={p.key}
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="central"
                fill={MAGIC_LABELS[p.key].color}
                fontSize={9}
                fontWeight={600}
                fontFamily="Inter, sans-serif"
              >
                {p.key}
              </text>
            );
          })}
      </svg>
    </div>
  );
}

export function MAGICBar({ vector }: { vector: MAGICVector }) {
  const keys: (keyof MAGICVector)[] = ["M", "A", "G", "I", "C"];
  return (
    <div className="space-y-1.5">
      {keys.map((key) => (
        <div key={key} className="flex items-center gap-2">
          <span
            className="text-[10px] font-bold w-3 text-center"
            style={{ color: MAGIC_LABELS[key].color }}
          >
            {key}
          </span>
          <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${vector[key] * 100}%` }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="h-full rounded-full"
              style={{ backgroundColor: MAGIC_LABELS[key].color }}
            />
          </div>
          <span className="text-[10px] text-white/40 w-6 text-right font-mono">
            {vector[key].toFixed(1)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function MAGICPill({ label, color, active }: { label: string; color: string; active: boolean }) {
  return (
    <span
      className={`text-[10px] px-1.5 py-0.5 rounded border transition-all ${
        active
          ? "border-current bg-current/10"
          : "border-white/10 text-white/30"
      }`}
      style={active ? { color, borderColor: color } : undefined}
    >
      {label}
    </span>
  );
}
