import { useState, useMemo, useEffect, useRef, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { Link, useLocation } from "wouter";

// ── MAGIC ribbon definitions ──────────────────────────────────────────────────
const MAGIC_DEF = [
  { key: "math"        as const, label: "M", long: "Math",        color: "#4f8ef7" },
  { key: "art"         as const, label: "A", long: "Art",         color: "#f472b6" },
  { key: "geometry"    as const, label: "G", long: "Geometric",   color: "#34d399" },
  { key: "ideology"    as const, label: "I", long: "Ideology",    color: "#fbbf24" },
  { key: "comptroller" as const, label: "C", long: "Comptroller", color: "#a78bfa" },
];
type MKey = "math" | "art" | "geometry" | "ideology" | "comptroller";

// ── Types ─────────────────────────────────────────────────────────────────────
interface BraidPoint {
  id: number;
  name: string;
  year: number;
  math: number;
  art: number;
  geometry: number;
  ideology: number;
  comptroller: number;
  description: string | null;
  source: string | null;
}

// ── Layout constants ──────────────────────────────────────────────────────────
const WORLD_X = 36;    // braid span in world units
const LANE_H  = 5.5;   // total height (rank 0 = top, rank 4 = bottom)
const Z_CROSS = 0.75;  // z-offset per detected ribbon crossing
const MIN_HW  = 0.11;  // ribbon half-width at score = 0
const MAX_HW  = 0.45;  // ribbon half-width at score = 1

// ── Math helpers ──────────────────────────────────────────────────────────────
function yearToX(year: number, minY: number, maxY: number): number {
  return -WORLD_X / 2 + ((year - minY) / (maxY - minY)) * WORLD_X;
}

function rankToY(rank: number): number {
  return LANE_H / 2 - (rank / (MAGIC_DEF.length - 1)) * LANE_H;
}

function hw(score: number): number {
  return MIN_HW + Math.max(0, Math.min(1, score)) * (MAX_HW - MIN_HW);
}

// Returns the rank (0 = highest score) of every MAGIC variable at this knot
function getRanks(pt: BraidPoint): Record<MKey, number> {
  const items = MAGIC_DEF.map(v => ({ key: v.key, score: pt[v.key] }));
  items.sort((a, b) => b.score - a.score);
  const r = {} as Record<MKey, number>;
  items.forEach((v, i) => { r[v.key] = i; });
  return r;
}

// ── Crossing detection ────────────────────────────────────────────────────────
// For every consecutive knot pair (i, i+1), detect pairwise rank swaps.
// A swap between ribbon A and ribbon B means they crossed in this segment.
// Crossings alternate over/under (true braid), tracked via overHistory.
// Returns an array of per-segment z-offsets (one record per segment midpoint).
function computeSegmentZOffsets(pts: BraidPoint[]): Array<Record<MKey, number>> {
  const N = MAGIC_DEF.length;
  const overHistory: Record<string, boolean> = {}; // pairKey → A was over last time?
  const result: Array<Record<MKey, number>> = [];

  for (let i = 0; i < pts.length - 1; i++) {
    const r1 = getRanks(pts[i]);
    const r2 = getRanks(pts[i + 1]);
    const midZ: Record<MKey, number> = {
      math: 0, art: 0, geometry: 0, ideology: 0, comptroller: 0,
    };

    for (let a = 0; a < N; a++) {
      for (let b = a + 1; b < N; b++) {
        const kA = MAGIC_DEF[a].key as MKey;
        const kB = MAGIC_DEF[b].key as MKey;
        const pk = `${kA}:${kB}`;

        // Rank swap = crossing detected (lower rank number = higher position)
        const aAbove1 = r1[kA] < r1[kB];
        const aAbove2 = r2[kA] < r2[kB];

        if (aAbove1 !== aAbove2) {
          // Toggle who is "over" at this crossing (alternating braid)
          const aOver = !(overHistory[pk] ?? false);
          overHistory[pk] = aOver;
          const delta = Z_CROSS;
          midZ[kA] += aOver ? delta : -delta;
          midZ[kB] += aOver ? -delta : delta;
        }
      }
    }

    // Clamp accumulated offsets so multiple simultaneous crossings don't blow up Z
    (Object.keys(midZ) as MKey[]).forEach(k => {
      midZ[k] = Math.max(-Z_CROSS * 3, Math.min(Z_CROSS * 3, midZ[k]));
    });

    result.push(midZ);
  }

  return result;
}

// ── Geometry builders ─────────────────────────────────────────────────────────

// Build the 3D control-point path for one ribbon.
// Alternates knot positions (z=0) and midpoint positions (z from segZ crossings).
function buildPath(
  key: MKey,
  pts: BraidPoint[],
  segZ: Array<Record<MKey, number>>,
  minY: number,
  maxY: number,
): THREE.Vector3[] {
  const path: THREE.Vector3[] = [];
  for (let i = 0; i < pts.length; i++) {
    const p  = pts[i];
    const x  = yearToX(p.year, minY, maxY);
    const y  = rankToY(getRanks(p)[key]);
    path.push(new THREE.Vector3(x, y, 0));           // knot at z=0
    if (i < pts.length - 1) {
      const pn = pts[i + 1];
      const xn = yearToX(pn.year, minY, maxY);
      const yn = rankToY(getRanks(pn)[key]);
      const mz = segZ[i][key];
      path.push(new THREE.Vector3((x + xn) / 2, (y + yn) / 2, mz)); // crossing midpoint
    }
  }
  return path;
}

// Score at every control point (knots + midpoints) for Sankey width
function buildScores(key: MKey, pts: BraidPoint[]): number[] {
  const sc: number[] = [];
  for (let i = 0; i < pts.length; i++) {
    sc.push(pts[i][key]);
    if (i < pts.length - 1) sc.push((pts[i][key] + pts[i + 1][key]) / 2);
  }
  return sc;
}

// Flat ribbon BufferGeometry: two vertices per sample point (top/bottom),
// ribbon half-width in Y from Sankey score, path follows 3D CatmullRom curve.
function makeRibbonGeo(
  ctrlPts: THREE.Vector3[],
  scores: number[],
): THREE.BufferGeometry {
  if (ctrlPts.length < 2) return new THREE.BufferGeometry();
  const curve = new THREE.CatmullRomCurve3(ctrlPts);
  const N     = Math.max(120, ctrlPts.length * 10);
  const pts   = curve.getPoints(N);
  const pos: number[] = [];
  const idx: number[] = [];

  for (let i = 0; i < pts.length; i++) {
    const t   = i / (pts.length - 1);
    const si  = t * (scores.length - 1);
    const si0 = Math.min(Math.floor(si), scores.length - 2);
    const sf  = si - si0;
    const s   = scores[si0] * (1 - sf) + (scores[si0 + 1] ?? scores[si0]) * sf;
    const h   = hw(s);
    const p   = pts[i];
    pos.push(p.x, p.y + h, p.z);
    pos.push(p.x, p.y - h, p.z);
  }
  for (let i = 0; i < pts.length - 1; i++) {
    const a = i * 2, b = a + 1, c = a + 2, d = a + 3;
    idx.push(a, b, c, b, d, c);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

// ── Scene components ──────────────────────────────────────────────────────────

function Starfield() {
  const geo = useMemo(() => {
    const arr = new Float32Array(3000);
    for (let i = 0; i < 1000; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 220;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 160;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 160;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(arr, 3));
    return g;
  }, []);
  return (
    <points geometry={geo}>
      <pointsMaterial size={0.12} color="#3a5080" transparent opacity={0.4} sizeAttenuation />
    </points>
  );
}

// Faint wireframe floor grid for depth reference
function BottomGrid() {
  return (
    <mesh
      position={[0, -LANE_H / 2 - 1.0, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={[WORLD_X + 6, 14, 24, 8]} />
      <meshBasicMaterial
        color="#0d1e2e"
        wireframe
        transparent
        opacity={0.3}
      />
    </mesh>
  );
}

// Regular year axis ticks along the bottom
function YearAxis({ minY, maxY }: { minY: number; maxY: number }) {
  const ticks = useMemo(() => {
    const out: { x: number; label: string }[] = [];
    const range = maxY - minY;
    const step  = range > 8000 ? 2000 : range > 4000 ? 1000 : 500;
    for (let y = Math.ceil(minY / step) * step; y <= maxY; y += step) {
      const abs = Math.abs(y);
      out.push({
        x: yearToX(y, minY, maxY),
        label: y < 0 ? `${abs >= 1000 ? abs / 1000 + "k" : abs} BCE` : `${y} CE`,
      });
    }
    return out;
  }, [minY, maxY]);

  const baseY = -LANE_H / 2 - 0.55;

  return (
    <group position={[0, baseY, 0]}>
      <mesh>
        <boxGeometry args={[WORLD_X, 0.01, 0.01]} />
        <meshBasicMaterial color="#1a2a3a" />
      </mesh>
      {ticks.map(({ x, label }) => (
        <group key={label} position={[x, 0, 0]}>
          <mesh>
            <boxGeometry args={[0.015, 0.18, 0.015]} />
            <meshBasicMaterial color="#1e3040" />
          </mesh>
          <Text
            position={[0, -0.3, 0]}
            fontSize={0.20}
            color="#2a4050"
            anchorX="center"
            anchorY="top"
          >{label}</Text>
        </group>
      ))}
    </group>
  );
}

// Per-knot year labels tied to each braid point — clickable
function KnotYearLabels({
  points, minYear, maxYear, onSelect,
}: {
  points: BraidPoint[];
  minYear: number; maxYear: number;
  onSelect: (pt: BraidPoint) => void;
}) {
  const baseY = -LANE_H / 2 - 1.22;

  // One label per unique year, using the braid point with the highest avg MAGIC score
  const labelPts = useMemo(() => {
    const byYear = new Map<number, BraidPoint>();
    const avgScore = (p: BraidPoint) =>
      (p.math + p.art + p.geometry + p.ideology + p.comptroller) / 5;
    for (const pt of points) {
      const existing = byYear.get(pt.year);
      if (!existing || avgScore(pt) > avgScore(existing)) byYear.set(pt.year, pt);
    }
    return Array.from(byYear.values());
  }, [points]);

  return (
    <group>
      {labelPts.map(pt => {
        const x     = yearToX(pt.year, minYear, maxYear);
        const abs   = Math.abs(pt.year);
        const label = pt.year < 0
          ? `${abs >= 1000 ? abs / 1000 + "k" : abs} BCE`
          : `${pt.year} CE`;

        return (
          <group key={pt.id}>
            {/* thin tick connecting axis to label */}
            <mesh position={[x, baseY + 0.38, 0]}>
              <boxGeometry args={[0.008, 0.28, 0.008]} />
              <meshBasicMaterial color="#162030" />
            </mesh>
            {/* Clickable year label */}
            <Text
              position={[x, baseY, 0]}
              fontSize={0.14}
              color="#1e4060"
              anchorX="center"
              anchorY="top"
              onClick={() => onSelect(pt)}
              onPointerOver={() => { document.body.style.cursor = "pointer"; }}
              onPointerOut={() => { document.body.style.cursor = "default"; }}
            >{label}</Text>
          </group>
        );
      })}
    </group>
  );
}

interface RibbonProps {
  def: typeof MAGIC_DEF[number];
  points: BraidPoint[];
  segZ: Array<Record<MKey, number>>;
  minYear: number;
  maxYear: number;
  selectedId: number | null;
  onSelect: (pt: BraidPoint) => void;
}

function Ribbon({ def, points, segZ, minYear, maxYear, selectedId, onSelect }: RibbonProps) {
  const ctrlPts = useMemo(
    () => buildPath(def.key, points, segZ, minYear, maxYear),
    [def.key, points, segZ, minYear, maxYear],
  );
  const scores = useMemo(() => buildScores(def.key, points), [def.key, points]);
  const geo    = useMemo(() => makeRibbonGeo(ctrlPts, scores), [ctrlPts, scores]);

  const knotData = useMemo(() =>
    points.map(pt => ({
      pt,
      x: yearToX(pt.year, minYear, maxYear),
      y: rankToY(getRanks(pt)[def.key]),
      score: pt[def.key],
    })),
    [def.key, points, minYear, maxYear],
  );

  useEffect(() => () => { geo.dispose(); }, [geo]);

  const col = def.color;

  return (
    <group>
      {/* Flat ribbon surface */}
      <mesh geometry={geo}>
        <meshStandardMaterial
          color={col} emissive={col} emissiveIntensity={0.15}
          transparent opacity={0.77}
          roughness={0.4} metalness={0.06}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Knot spheres (one per braid point) */}
      {knotData.map(({ pt, x, y, score }) => {
        const isSel = selectedId === pt.id;
        const r = 0.055 + score * 0.13;
        return (
          <mesh
            key={pt.id}
            position={[x, y, 0]}
            onClick={(e) => { e.stopPropagation(); onSelect(pt); }}
            onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = "pointer"; }}
            onPointerOut={() => { document.body.style.cursor = "default"; }}
          >
            <sphereGeometry args={[isSel ? r * 1.7 : r, 14, 10]} />
            <meshStandardMaterial
              color={col} emissive={col}
              emissiveIntensity={isSel ? 1.1 : 0.45}
              roughness={0.2} metalness={0.3}
            />
          </mesh>
        );
      })}
    </group>
  );
}

interface SceneProps {
  points: BraidPoint[];
  selectedId: number | null;
  onSelect: (pt: BraidPoint) => void;
}

function BraidScene({ points, selectedId, onSelect }: SceneProps) {
  const orbitRef = useRef<OrbitControlsImpl>(null);

  const minYear = useMemo(() => Math.min(...points.map(p => p.year)) - 300, [points]);
  const maxYear = useMemo(() => Math.max(...points.map(p => p.year)) + 300, [points]);

  // Pairwise crossing detection — computed once from the sorted braid points
  const segZ = useMemo(() => computeSegmentZOffsets(points), [points]);

  return (
    <>
      <color attach="background" args={["#04060e"]} />
      <ambientLight intensity={0.55} />
      <pointLight position={[0, 10, 12]}   intensity={1.4} color="#ffffff" />
      <pointLight position={[-18, 5, -5]}  intensity={0.7} color="#334dcc" />
      <pointLight position={[18,  5, -5]}  intensity={0.7} color="#cc5533" />

      <Starfield />
      <BottomGrid />
      <YearAxis minY={minYear} maxY={maxYear} />
      <KnotYearLabels
        points={points}
        minYear={minYear}
        maxYear={maxYear}
        onSelect={onSelect}
      />

      {MAGIC_DEF.map(def => (
        <Ribbon
          key={def.key}
          def={def}
          points={points}
          segZ={segZ}
          minYear={minYear}
          maxYear={maxYear}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      ))}

      {/* Orbit pauses while a knot is selected */}
      <OrbitControls
        ref={orbitRef}
        enabled={selectedId === null}
        enableDamping
        dampingFactor={0.06}
        minDistance={6}
        maxDistance={65}
        makeDefault
      />
    </>
  );
}

// ── DOM overlays ───────────────────────────────────────────────────────────────

function DetailPanel({ pt, onClose }: { pt: BraidPoint; onClose: () => void }) {
  return (
    <div style={{
      position: "absolute", top: 16, right: 16, width: 285, zIndex: 20,
      background: "rgba(6,9,20,0.97)", border: "1px solid #1a2a40",
      borderRadius: 10, padding: "14px 16px",
      color: "#ddeeff", fontFamily: "system-ui, sans-serif",
      boxShadow: "0 0 30px rgba(0,0,0,0.65)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#eef6ff", lineHeight: 1.35 }}>{pt.name}</div>
          <div style={{ fontSize: 11, color: "#4a7090", marginTop: 3 }}>
            {pt.year < 0 ? `${Math.abs(pt.year)} BCE` : `${pt.year} CE`}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{ background: "none", border: "none", color: "#2a3a50", fontSize: 16, cursor: "pointer", padding: "0 4px", lineHeight: 1 }}
        >✕</button>
      </div>

      {MAGIC_DEF.map(v => {
        const score = pt[v.key];
        return (
          <div key={v.key} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: v.color, width: 14, textAlign: "right", fontFamily: "monospace" }}>{v.label}</div>
            <div style={{ flex: 1, height: 5, background: "#0d1520", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: 5, width: `${score * 100}%`, background: v.color, borderRadius: 3, opacity: 0.85 }} />
            </div>
            <div style={{ fontSize: 10, color: "#3a5a70", width: 30, textAlign: "right", fontFamily: "monospace" }}>
              {(score * 100).toFixed(0)}%
            </div>
          </div>
        );
      })}

      {pt.description && (
        <p style={{ fontSize: 11, color: "#5a8aaa", lineHeight: 1.6, margin: "10px 0 0", borderTop: "1px solid #0d1a28", paddingTop: 10 }}>
          {pt.description}
        </p>
      )}
      {pt.source && (
        <div style={{ fontSize: 9, color: "#1e3040", marginTop: 8, fontFamily: "monospace" }}>{pt.source}</div>
      )}

      <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 10, color: "#1a2d3a" }}>Click elsewhere or ✕ to resume orbit</span>
        <Link
          href={`/node/${pt.id}`}
          data-testid="open-node-timeline"
          style={{ fontSize: 10, color: "#34d399", textDecoration: "none", fontWeight: 600 }}
        >View Tetrahedron →</Link>
      </div>
    </div>
  );
}

// Legend — top-right (below detail panel when open, otherwise top-right)
function Legend({ hasSelection }: { hasSelection: boolean }) {
  return (
    <div style={{
      position: "absolute",
      top: hasSelection ? 340 : 16,   // drop below detail panel when active
      right: 16,
      zIndex: 20,
      background: "rgba(6,9,20,0.82)",
      border: "1px solid #101820",
      borderRadius: 8,
      padding: "10px 14px",
      transition: "top 0.25s ease",
    }}>
      <div style={{ fontSize: 9, color: "#1e3040", letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 6, fontFamily: "monospace" }}>
        MAGIC
      </div>
      {MAGIC_DEF.map(v => (
        <div key={v.key} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: v.color, opacity: 0.85 }} />
          <span style={{ fontSize: 10, color: v.color, fontFamily: "monospace", fontWeight: 700 }}>{v.label}</span>
          <span style={{ fontSize: 10, color: "#2a4050" }}>{v.long}</span>
        </div>
      ))}
      <div style={{ fontSize: 8, color: "#1a2d3a", marginTop: 8, lineHeight: 1.7 }}>
        Y = score rank<br />
        Width = magnitude<br />
        Z = crossing (over/under)
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Timeline() {
  const [, navigate]            = useLocation();
  const [points,   setPoints]   = useState<BraidPoint[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState<BraidPoint | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        let res  = await fetch("/api/braid/points");
        let data: BraidPoint[] = await res.json();
        if (!Array.isArray(data) || !data.length) {
          await fetch("/api/braid/seed", { method: "POST" });
          res  = await fetch("/api/braid/points");
          data = await res.json();
        }
        if (alive) setPoints(data.sort((a, b) => a.year - b.year));
      } catch (e) {
        console.error("[Timeline3D]", e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#04060e", position: "relative", overflow: "hidden" }}>

      {/* Back nav */}
      <div style={{ position: "absolute", top: 12, left: 16, zIndex: 30, display: "flex", alignItems: "center", gap: 12 }}>
        <Link href="/" style={{
          fontSize: 11, color: "#2a3a4a", textDecoration: "none",
          background: "rgba(6,9,20,0.85)", border: "1px solid #131d2a",
          borderRadius: 5, padding: "4px 10px",
        }}>← Chronos</Link>
        {!loading && (
          <span style={{ fontSize: 10, color: "#1a2d3a", fontFamily: "monospace" }}>
            {points.length} pts · 3D MAGIC Braid
          </span>
        )}
      </div>

      {/* Detail panel (top-right) */}
      {selected && <DetailPanel pt={selected} onClose={() => setSelected(null)} />}

      {/* Legend (top-right, slides down when detail panel is open) */}
      <Legend hasSelection={!!selected} />

      {/* Hint */}
      <div style={{
        position: "absolute", bottom: 18, left: 16, zIndex: 10,
        fontSize: 9, color: "#1e2d3a",
        background: "rgba(6,9,20,0.75)", border: "1px solid #101820",
        borderRadius: 6, padding: "5px 9px", lineHeight: 1.8,
      }}>
        Drag to orbit · Scroll to zoom<br />
        Click knot or year to select
      </div>

      {/* Loading */}
      {loading && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#1a3a5a", fontSize: 14, fontFamily: "monospace", letterSpacing: 2,
        }}>
          Loading MAGIC braid…
        </div>
      )}

      {/* 3D Canvas */}
      {!loading && points.length > 0 && (
        <Canvas
          camera={{ position: [0, 2.5, 24], fov: 52 }}
          gl={{ antialias: true }}
          onPointerMissed={() => setSelected(null)}
        >
          <Suspense fallback={null}>
            <BraidScene
              points={points}
              selectedId={selected?.id ?? null}
              onSelect={(pt) => navigate(`/node/${pt.id}`)}
            />
          </Suspense>
        </Canvas>
      )}

      {!loading && points.length === 0 && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#1a3a5a", fontSize: 13, fontFamily: "monospace",
        }}>
          No braid points found.
        </div>
      )}
    </div>
  );
}
