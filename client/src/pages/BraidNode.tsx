import { useState, useEffect, useMemo, Suspense } from "react";
import { useParams, Link, useLocation } from "wouter";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text, Line } from "@react-three/drei";
import * as THREE from "three";

// ── MAGIC variable definitions ────────────────────────────────────────────────
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

interface Adjacent {
  prev: BraidPoint | null;
  next: BraidPoint | null;
}

// ── Vertex key (M, A, I, C — not G which is the META axis) ───────────────────
type VKey = "math" | "art" | "ideology" | "comptroller";

// ── Tetrahedron vertex positions ──────────────────────────────────────────────
// Regular tetrahedron base vertices — M, A, I, C as the four vertices.
// Each scaled by its respective MAGIC score (0–1).
const BASE_VERTICES: Record<VKey, THREE.Vector3> = {
  math:        new THREE.Vector3( 1,  1,  1),
  art:         new THREE.Vector3(-1, -1,  1),
  ideology:    new THREE.Vector3(-1,  1, -1),
  comptroller: new THREE.Vector3( 1, -1, -1),
};

const VERTEX_PAIRS: [VKey, VKey][] = [
  ["math", "art"],
  ["math", "ideology"],
  ["math", "comptroller"],
  ["art", "ideology"],
  ["art", "comptroller"],
  ["ideology", "comptroller"],
];

const FACE_TRIPLES: [VKey, VKey, VKey][] = [
  ["math", "art", "ideology"],
  ["math", "art", "comptroller"],
  ["math", "ideology", "comptroller"],
  ["art", "ideology", "comptroller"],
];

// ── Tetrahedron scene ─────────────────────────────────────────────────────────
function TetrahedronScene({ point }: { point: BraidPoint }) {
  const scaledVerts = useMemo<Record<VKey, THREE.Vector3>>(() => ({
    math:        BASE_VERTICES.math.clone().multiplyScalar(Math.max(0.18, point.math)),
    art:         BASE_VERTICES.art.clone().multiplyScalar(Math.max(0.18, point.art)),
    ideology:    BASE_VERTICES.ideology.clone().multiplyScalar(Math.max(0.18, point.ideology)),
    comptroller: BASE_VERTICES.comptroller.clone().multiplyScalar(Math.max(0.18, point.comptroller)),
  }), [point]);

  // Centroid of the four scaled vertices
  const centroid = useMemo(() => {
    const c = new THREE.Vector3();
    Object.values(scaledVerts).forEach(v => c.add(v));
    c.divideScalar(4);
    return c;
  }, [scaledVerts]);

  // G-axis endpoint: centroid + geometry * 1.4 along Y-up
  const gAxisEnd = useMemo(
    () => centroid.clone().add(new THREE.Vector3(0, 1, 0).multiplyScalar(point.geometry * 1.4)),
    [centroid, point.geometry]
  );

  // Face geometries (semi-transparent)
  const faceGeos = useMemo(() =>
    FACE_TRIPLES.map(([a, b, c], i) => {
      const va = scaledVerts[a], vb = scaledVerts[b], vc = scaledVerts[c];
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.Float32BufferAttribute([
        va.x, va.y, va.z,
        vb.x, vb.y, vb.z,
        vc.x, vc.y, vc.z,
      ], 3));
      geo.setIndex([0, 1, 2, 0, 2, 1]);
      geo.computeVertexNormals();
      return { key: `face-${i}`, geo };
    }),
  [scaledVerts]);

  // Centroid-to-vertex spokes for visual clarity
  const spokePoints = useMemo(() =>
    (Object.entries(scaledVerts) as [VKey, THREE.Vector3][]).map(([key, v]) => ({
      key: `spoke-${key}`,
      pts: [centroid, v] as THREE.Vector3[],
    })),
  [scaledVerts, centroid]);

  const vertexColors: Record<VKey, string> = {
    math: "#4f8ef7",
    art: "#f472b6",
    ideology: "#fbbf24",
    comptroller: "#a78bfa",
  };

  // Edge point pairs for <Line>
  const edgePointPairs = useMemo(() =>
    VERTEX_PAIRS.map(([a, b]) => ({
      key: `edge-${a}-${b}`,
      pts: [scaledVerts[a], scaledVerts[b]] as THREE.Vector3[],
    })),
  [scaledVerts]);

  return (
    <>
      <color attach="background" args={["#04060e"]} />
      <ambientLight intensity={0.5} />
      <pointLight position={[4, 6, 6]} intensity={1.2} color="#c0d8ff" />
      <pointLight position={[-5, -3, 4]} intensity={0.6} color="#3040aa" />

      {/* Semi-transparent faces */}
      {faceGeos.map(({ key, geo }) => (
        <mesh key={key} geometry={geo}>
          <meshStandardMaterial
            color="#2a4060"
            transparent
            opacity={0.13}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}

      {/* Edges */}
      {edgePointPairs.map(({ key, pts }) => (
        <Line key={key} points={pts} color="#1a3a5a" transparent opacity={0.55} lineWidth={1} />
      ))}

      {/* Centroid-to-vertex spokes (subtle) */}
      {spokePoints.map(({ key, pts }) => (
        <Line key={key} points={pts} color="#0d1e2e" transparent opacity={0.4} lineWidth={0.8} />
      ))}

      {/* Centroid sphere */}
      <mesh position={centroid}>
        <sphereGeometry args={[0.055, 12, 8]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.7} />
      </mesh>

      {/* Vertex spheres — M, A, I, C */}
      {(Object.entries(scaledVerts) as [VKey, THREE.Vector3][]).map(([key, pos]) => {
        const def = MAGIC_DEF.find(d => d.key === key)!;
        const score = point[key];
        return (
          <group key={key} position={pos}>
            <mesh>
              <sphereGeometry args={[0.065 + score * 0.09, 14, 10]} />
              <meshStandardMaterial
                color={vertexColors[key]}
                emissive={vertexColors[key]}
                emissiveIntensity={0.5}
                roughness={0.3}
                metalness={0.2}
              />
            </mesh>
            <Text
              position={[0, 0.22 + score * 0.12, 0]}
              fontSize={0.16}
              color={def.color}
              anchorX="center"
              anchorY="bottom"
            >{def.label}</Text>
          </group>
        );
      })}

      {/* G-axis line */}
      <Line
        points={[centroid, gAxisEnd] as THREE.Vector3[]}
        color="#34d399"
        transparent
        opacity={0.9}
        lineWidth={2}
      />

      {/* G endpoint sphere */}
      <mesh position={gAxisEnd}>
        <sphereGeometry args={[0.055, 12, 8]} />
        <meshStandardMaterial color="#34d399" emissive="#34d399" emissiveIntensity={0.85} />
      </mesh>

      {/* G label at axis end */}
      <Text
        position={[gAxisEnd.x, gAxisEnd.y + 0.2, gAxisEnd.z]}
        fontSize={0.15}
        color="#34d399"
        anchorX="center"
        anchorY="bottom"
      >G</Text>

      <OrbitControls
        enableDamping
        dampingFactor={0.06}
        minDistance={2}
        maxDistance={14}
        makeDefault
      />
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function BraidNode() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const id = Number(params.id);

  const [point, setPoint]             = useState<BraidPoint | null>(null);
  const [adjacent, setAdjacent]       = useState<Adjacent>({ prev: null, next: null });
  const [loading, setLoading]         = useState(true);
  const [interpretation, setInterp]   = useState<string | null>(null);
  const [interpLoading, setInterpLoad] = useState(false);

  useEffect(() => {
    if (isNaN(id)) return;
    setLoading(true);
    setPoint(null);
    setInterp(null);
    Promise.all([
      fetch(`/api/braid/points/${id}`).then(r => r.ok ? r.json() as Promise<BraidPoint> : null),
      fetch(`/api/braid/adjacent/${id}`).then(r => r.ok ? r.json() as Promise<Adjacent> : { prev: null, next: null }),
    ]).then(([pt, adj]) => {
      if (pt) setPoint(pt);
      setAdjacent(adj as Adjacent);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleInterpret = async () => {
    if (!point || interpLoading) return;
    setInterpLoad(true);
    try {
      const res = await fetch("/api/braid/node/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: point.id }),
      });
      const data = await res.json() as { interpretation?: string; error?: string };
      if (data.interpretation) setInterp(data.interpretation);
      else setInterp("Interpretation unavailable.");
    } catch {
      setInterp("Network error while generating interpretation.");
    } finally {
      setInterpLoad(false);
    }
  };

  const ingenuityPrev = point && adjacent.prev
    ? Math.abs(point.geometry - adjacent.prev.geometry)
    : null;
  const ingenuityNext = point && adjacent.next
    ? Math.abs(point.geometry - adjacent.next.geometry)
    : null;

  const yearLabel = (pt: BraidPoint) =>
    pt.year < 0 ? `${Math.abs(pt.year)} BCE` : `${pt.year} CE`;

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#04060e", display: "flex", alignItems: "center", justifyContent: "center", color: "#1a4060", fontFamily: "monospace", letterSpacing: 2 }}>
        Loading node…
      </div>
    );
  }

  if (!point) {
    return (
      <div style={{ minHeight: "100vh", background: "#04060e", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, color: "#1a4060" }}>
        <div style={{ fontFamily: "monospace" }}>Node not found.</div>
        <Link href="/braid" style={{ color: "#4f8ef7", fontSize: 13 }}>← Back to Braid</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#04060e", color: "#ddeeff", display: "flex", flexDirection: "column", fontFamily: "system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <Link href="/braid" style={{ color: "rgba(255,255,255,0.3)", textDecoration: "none", fontSize: 12 }}>← Braid</Link>
        <Link href="/timeline" style={{ color: "rgba(255,255,255,0.3)", textDecoration: "none", fontSize: 12 }}>← Timeline</Link>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#eef6ff" }}>{point.name}</h1>
          <div style={{ fontSize: 11, color: "#3a6080", fontFamily: "monospace", marginTop: 2 }}>{yearLabel(point)}</div>
        </div>

        {/* Prev / Next navigation */}
        <div style={{ display: "flex", gap: 8 }}>
          {adjacent.prev && (
            <button
              onClick={() => navigate(`/node/${adjacent.prev!.id}`)}
              data-testid="nav-prev"
              style={{ padding: "5px 12px", background: "transparent", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, color: "rgba(255,255,255,0.45)", fontSize: 11, cursor: "pointer" }}>
              ← {adjacent.prev.name.length > 24 ? adjacent.prev.name.slice(0, 23) + "…" : adjacent.prev.name}
            </button>
          )}
          {adjacent.next && (
            <button
              onClick={() => navigate(`/node/${adjacent.next!.id}`)}
              data-testid="nav-next"
              style={{ padding: "5px 12px", background: "transparent", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, color: "rgba(255,255,255,0.45)", fontSize: 11, cursor: "pointer" }}>
              {adjacent.next.name.length > 24 ? adjacent.next.name.slice(0, 23) + "…" : adjacent.next.name} →
            </button>
          )}
        </div>
      </div>

      {/* Main layout: 3D canvas left + panel right */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* 3D Canvas */}
        <div style={{ flex: 1, minHeight: 440, position: "relative" }}>
          <Canvas camera={{ position: [0, 0.5, 5.5], fov: 48 }} gl={{ antialias: true }}>
            <Suspense fallback={null}>
              <TetrahedronScene point={point} />
            </Suspense>
          </Canvas>

          {/* Canvas legend */}
          <div style={{ position: "absolute", bottom: 14, left: 14, background: "rgba(4,6,14,0.85)", border: "1px solid #0d1a28", borderRadius: 8, padding: "8px 12px", fontSize: 10, color: "#1e4060", lineHeight: 1.8 }}>
            M/A/I/C vertices scaled by score<br />
            G-axis = META contour from centroid<br />
            Drag to orbit · Scroll to zoom
          </div>
        </div>

        {/* Side panel */}
        <div style={{ width: 320, minWidth: 260, background: "#080c18", borderLeft: "1px solid rgba(255,255,255,0.07)", overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 18 }}>

          {/* MAGIC score bars */}
          <div>
            <div style={{ fontSize: 9, color: "#1e4060", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10, fontFamily: "monospace" }}>MAGIC Scores</div>
            {MAGIC_DEF.map(v => {
              const score = point[v.key];
              return (
                <div key={v.key} style={{ marginBottom: 8 }} data-testid={`score-${v.key}`}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ fontSize: 11, color: v.color, fontWeight: 700, fontFamily: "monospace" }}>{v.label} — {v.long}</span>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontFamily: "monospace" }}>{score.toFixed(2)}</span>
                  </div>
                  <div style={{ height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 3 }}>
                    <div style={{ height: 5, width: `${score * 100}%`, background: v.color, borderRadius: 3, opacity: 0.85 }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* G = META explanation */}
          <div style={{ padding: "10px 12px", borderRadius: 7, background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.18)" }}>
            <div style={{ fontSize: 9, color: "#34d399", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6, fontFamily: "monospace" }}>G — META Contour</div>
            <div style={{ fontSize: 11, color: "#a0c8b0", lineHeight: 1.6 }}>
              G is not another ribbon — it is the topology of this moment: the shape formed by how M, A, I, and C converge or diverge. The green axis projects from the centroid by the G score.
            </div>
          </div>

          {/* Ingenuity deltas */}
          {(ingenuityPrev !== null || ingenuityNext !== null) && (
            <div>
              <div style={{ fontSize: 9, color: "#1e4060", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8, fontFamily: "monospace" }}>Ingenuity Δ (|ΔG|)</div>
              {ingenuityPrev !== null && adjacent.prev && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }} data-testid="ingenuity-prev">
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    ← {adjacent.prev.name}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "monospace", color: "#34d399", flexShrink: 0 }}>
                    {ingenuityPrev.toFixed(3)}
                  </div>
                </div>
              )}
              {ingenuityNext !== null && adjacent.next && (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }} data-testid="ingenuity-next">
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {adjacent.next.name} →
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "monospace", color: "#34d399", flexShrink: 0 }}>
                    {ingenuityNext.toFixed(3)}
                  </div>
                </div>
              )}
              <div style={{ fontSize: 9, color: "#0d2030", marginTop: 6 }}>
                Ingenuity = magnitude of shift in the META contour between adjacent nodes
              </div>
            </div>
          )}

          {/* Description */}
          {point.description && (
            <div>
              <div style={{ fontSize: 9, color: "#1e4060", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6, fontFamily: "monospace" }}>Context</div>
              <p style={{ margin: 0, fontSize: 12, color: "#6090a0", lineHeight: 1.6 }}>{point.description}</p>
            </div>
          )}

          {/* Human Interpretive Machine */}
          <div>
            <div style={{ fontSize: 9, color: "#1e4060", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8, fontFamily: "monospace" }}>Human Interpretive Machine</div>
            {interpretation ? (
              <p style={{ margin: 0, fontSize: 12, color: "#a0c0d4", lineHeight: 1.7, fontStyle: "italic" }} data-testid="interpretation-text">
                {interpretation}
              </p>
            ) : (
              <button
                onClick={handleInterpret}
                disabled={interpLoading}
                data-testid="interpret-btn"
                style={{
                  padding: "8px 16px", background: "rgba(79,142,247,0.12)", border: "1px solid rgba(79,142,247,0.3)",
                  borderRadius: 6, color: "#4f8ef7", fontSize: 12, cursor: interpLoading ? "not-allowed" : "pointer",
                  fontFamily: "system-ui", width: "100%",
                }}>
                {interpLoading ? "Generating…" : "Generate AI Interpretation →"}
              </button>
            )}
          </div>

          {/* Source */}
          {point.source && (
            <div style={{ fontSize: 9, color: "#0d2030", fontFamily: "monospace", borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: 10 }}>
              Source: {point.source}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
