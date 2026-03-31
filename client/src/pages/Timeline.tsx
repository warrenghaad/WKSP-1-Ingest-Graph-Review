import { useRef, useState, useMemo, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html, Line, Text } from "@react-three/drei";
import * as THREE from "three";
import { create } from "zustand";
import { Link } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// ── Element palette ───────────────────────────────────────────────────────────

const ELEMENT_COLORS: Record<string, string> = {
  circle:    "#F5A623",
  star:      "#C62368",
  triangle:  "#2B6CC4",
  square:    "#2D8659",
  spiral:    "#3A8FBF",
  arc:       "#7CB9E8",
  hexagon:   "#DAA520",
  pyramid:   "#6A0DAD",
  dot:       "#E8855A",
  line:      "#5AB8E8",
  rectangle: "#5AE87C",
  cone:      "#B06AD4",
  crescent:  "#D4A06A",
  grid:      "#6AE8D4",
  diamond:   "#E86A9A",
};

const ELEMENT_DEITIES: Record<string, string> = {
  circle:    "Shamash",
  star:      "Ishtar",
  triangle:  "Enlil",
  square:    "Nabu",
  spiral:    "Tiamat",
  arc:       "Anu",
  hexagon:   "Nisaba",
  pyramid:   "Marduk",
  dot:       "Enlil",
  line:      "Anu",
  rectangle: "Nabu",
  cone:      "Marduk",
  crescent:  "Nanna",
  grid:      "Nisaba",
  diamond:   "Ishtar",
};

const ALL_ELEMENTS = [
  "circle","star","triangle","square","spiral","arc","hexagon","pyramid",
  "dot","line","rectangle","cone","crescent","grid","diamond",
];

// ── Historical eras ───────────────────────────────────────────────────────────

const ERAS = [
  { name: "Ubaid",          start: -6500, end: -3800 },
  { name: "Uruk",           start: -4000, end: -3100 },
  { name: "Early Dynastic", start: -2900, end: -2350 },
  { name: "Akkadian",       start: -2334, end: -2154 },
  { name: "Ur III",         start: -2112, end: -2004 },
  { name: "Old Babylonian", start: -2000, end: -1600 },
];

// ── Data types ────────────────────────────────────────────────────────────────

interface MagicDrivers {
  math: number;
  aesthetic: number;
  institutional: number;
  comptroller: number;
}

interface GECDNodeData {
  id: string;
  name: string;
  date_bce?: number;
  date_ce?: number;
  date_display: string;
  geometric_element: string;
  deity?: string;
  magic_drivers: MagicDrivers;
  description: string;
  provenance?: string;
  civilization?: string;
  intensification_category?: string;
  connections: string[];
  tags: string[];
  image_url?: string | null;
  image_status?: string;
  image_prompt?: string;
  confidence?: number;
  notes?: string;
}

// ── Starter dataset ───────────────────────────────────────────────────────────

const NODES: GECDNodeData[] = [
  {
    id: "node_spiral_pottery_001",
    name: "Halaf Spiral Pottery",
    date_bce: 5500, date_display: "c. 5500 BCE",
    geometric_element: "spiral", deity: "Tiamat",
    magic_drivers: { math: 0.3, aesthetic: 0.9, institutional: 0.2, comptroller: 0.1 },
    description: "Exquisitely painted polychrome pottery with spiral motifs. Peak aesthetic expression, minimal institutional function.",
    provenance: "Tell Halaf, northern Mesopotamia", civilization: "Halaf Culture",
    intensification_category: "decoration",
    connections: [],
    tags: ["spiral","pottery","painted","aesthetic","halaf"],
    image_prompt: "Halaf culture spiral painted polychrome pottery, prehistoric Mesopotamia archaeological",
  },
  {
    id: "node_potter_wheel_001",
    name: "Potter's Wheel (Tournette)",
    date_bce: 4500, date_display: "c. 4500 BCE",
    geometric_element: "circle", deity: "Shamash",
    magic_drivers: { math: 0.5, aesthetic: 0.4, institutional: 0.3, comptroller: 0.2 },
    description: "Slow-wheel tournette for hand-building assistance. NOT fast wheel-throwing, which comes ~2000 BCE.",
    provenance: "Mesopotamia, widespread", civilization: "Ubaid Period",
    intensification_category: "functional_assembly",
    connections: ["node_brb_001","node_fast_wheel_001","node_transport_wheel_001"],
    tags: ["circle","rotation","craft","tool"],
    image_prompt: "Ancient Mesopotamian pottery tournette slow wheel, Ubaid period clay",
    notes: "Often confused with fast wheel — the centrifugal fast wheel arrives c. 2000 BCE.",
  },
  {
    id: "node_brb_001",
    name: "Beveled-Rim Bowl",
    date_bce: 3500, date_display: "c. 3500 BCE",
    geometric_element: "circle", deity: "Shamash",
    magic_drivers: { math: 0.3, aesthetic: 0.2, institutional: 0.9, comptroller: 0.7 },
    description: "Standardized mold-made bowls found across Uruk expansion sites. Evidence of institutional food rationing at scale.",
    provenance: "Uruk, southern Mesopotamia", civilization: "Sumerian / Uruk Period",
    intensification_category: "object_form",
    connections: ["node_potter_wheel_001","node_cylinder_seal_001"],
    tags: ["circle","standardization","institutional","uruk"],
    notes: "NOT wheel-thrown. Mold-made. Common misconception.",
    image_prompt: "Archaeological beveled-rim bowl, crude clay, mold-made, Uruk period Mesopotamia",
  },
  {
    id: "node_cylinder_seal_001",
    name: "Cylinder Seal",
    date_bce: 3500, date_display: "c. 3500 BCE",
    geometric_element: "circle", deity: "Shamash",
    magic_drivers: { math: 0.4, aesthetic: 0.9, institutional: 0.8, comptroller: 0.9 },
    description: "Carved cylinder rolled on clay to produce continuous relief. Simultaneously art, identity, and economic authentication.",
    provenance: "Uruk, Susa", civilization: "Sumerian / Uruk Period",
    intensification_category: "complex_designed_system",
    connections: ["node_brb_001","node_cuneiform_triangle_001"],
    tags: ["circle","cylinder","seal","aesthetic","comptroller"],
    image_prompt: "Ancient Sumerian cylinder seal and clay impression, Uruk period carved stone",
  },
  {
    id: "node_transport_wheel_001",
    name: "Transport Wheel",
    date_bce: 3500, date_display: "c. 3500 BCE",
    geometric_element: "circle", deity: "Shamash",
    magic_drivers: { math: 0.8, aesthetic: 0.1, institutional: 0.6, comptroller: 0.8 },
    description: "Solid disc wheels on carts. Pure function — geometry serving logistics and trade.",
    provenance: "Mesopotamia / Eurasian steppe", civilization: "Uruk / Late Chalcolithic",
    intensification_category: "functional_assembly",
    connections: ["node_potter_wheel_001"],
    tags: ["circle","wheel","transport","function"],
    image_prompt: "Ancient solid wooden disc wheel, Mesopotamian cart, Uruk period archaeological",
  },
  {
    id: "node_cuneiform_triangle_001",
    name: "Cuneiform Wedge",
    date_bce: 3200, date_display: "c. 3200 BCE",
    geometric_element: "triangle", deity: "Nabu",
    magic_drivers: { math: 0.6, aesthetic: 0.3, institutional: 0.9, comptroller: 0.9 },
    description: "Triangular reed impression on clay. The wedge — a geometric atom of written language.",
    provenance: "Uruk", civilization: "Late Uruk",
    intensification_category: "composite_geometry",
    connections: ["node_cylinder_seal_001"],
    tags: ["triangle","writing","wedge","script"],
    image_prompt: "Early cuneiform clay tablet with wedge-shaped impressions, Uruk period archaeological",
  },
  {
    id: "node_ishtar_star_001",
    name: "Eight-Pointed Star of Ishtar",
    date_bce: 3000, date_display: "c. 3000 BCE",
    geometric_element: "star", deity: "Ishtar",
    magic_drivers: { math: 0.6, aesthetic: 0.9, institutional: 0.7, comptroller: 0.3 },
    description: "Iconographic symbol of Ishtar/Inanna. Geometric regularity encoding divine identity across the ancient Near East.",
    provenance: "Mesopotamia, widespread", civilization: "Early Dynastic",
    intensification_category: "composite_geometry",
    connections: [],
    tags: ["star","eight-pointed","deity","symbol"],
    image_prompt: "Eight-pointed star of Ishtar Inanna, Mesopotamian divine symbol, ancient relief",
  },
  {
    id: "node_plano_convex_001",
    name: "Plano-Convex Brick",
    date_bce: 2900, date_display: "c. 2900 BCE",
    geometric_element: "square", deity: "Nabu",
    magic_drivers: { math: 0.4, aesthetic: 0.2, institutional: 0.7, comptroller: 0.5 },
    description: "Standardized rectangular bricks with curved top. Modular geometry enabling monumental architecture.",
    provenance: "Southern Mesopotamia", civilization: "Early Dynastic",
    intensification_category: "object_form",
    connections: ["node_ziggurat_001"],
    tags: ["square","rectangle","brick","modular","architecture"],
    image_prompt: "Ancient Mesopotamian plano-convex mud brick, Early Dynastic period archaeological",
  },
  {
    id: "node_ziggurat_001",
    name: "Ziggurat of Ur",
    date_bce: 2100, date_display: "c. 2100 BCE",
    geometric_element: "pyramid", deity: "Marduk",
    magic_drivers: { math: 0.8, aesthetic: 0.9, institutional: 1.0, comptroller: 0.7 },
    description: "Monumental stepped pyramid. Peak institutional geometry — math, aesthetics, and state power converging in a single structure.",
    provenance: "Ur, southern Iraq", civilization: "Ur III Dynasty",
    intensification_category: "complex_designed_system",
    connections: ["node_plano_convex_001"],
    tags: ["pyramid","monumental","institutional","ur-iii"],
    image_prompt: "Great Ziggurat of Ur reconstructed, Nanna moon god temple, Ur III dynasty Mesopotamia",
  },
  {
    id: "node_fast_wheel_001",
    name: "Fast Wheel-Throwing",
    date_bce: 2000, date_display: "c. 2000 BCE",
    geometric_element: "circle", deity: "Shamash",
    magic_drivers: { math: 0.7, aesthetic: 0.6, institutional: 0.5, comptroller: 0.6 },
    description: "True centrifugal wheel-throwing. Often misdated to 3500 BCE — corrected chronology places it here.",
    provenance: "Mesopotamia", civilization: "Isin-Larsa / Old Babylonian",
    intensification_category: "complex_designed_system",
    connections: ["node_potter_wheel_001"],
    tags: ["circle","rotation","centrifugal","mastery"],
    image_prompt: "Mesopotamian fast pottery wheel throwing, Old Babylonian period centrifugal wheel",
  },
];

// ── Coordinate math ───────────────────────────────────────────────────────────

const WORLD_W   = 80;
const SPACE_S   = 8;
const MIN_YEAR  = -7000;
const MAX_YEAR  = 500;

function yearToX(year: number): number {
  const t = (year - MIN_YEAR) / (MAX_YEAR - MIN_YEAR);
  const c = Math.sign(t - 0.5) * Math.pow(Math.abs(t - 0.5) * 2, 0.85) / 2 + 0.5;
  return (c - 0.5) * WORLD_W;
}

function nodeYear(n: GECDNodeData): number {
  return n.date_bce ? -n.date_bce : (n.date_ce ?? 0);
}

function magicToPos(n: GECDNodeData): [number, number, number] {
  const { math, aesthetic, institutional, comptroller } = n.magic_drivers;
  return [
    yearToX(nodeYear(n)),
    (institutional * 0.6 + comptroller * 0.4) * SPACE_S,
    (math * 0.5 + aesthetic * 0.5) * SPACE_S,
  ];
}

function nodeSize(n: GECDNodeData): number {
  const { math, aesthetic, institutional, comptroller } = n.magic_drivers;
  return 0.12 + (math + aesthetic + institutional + comptroller) * 0.09;
}

// ── Zustand store ─────────────────────────────────────────────────────────────

interface Filters {
  elements: string[];
  timeRange: [number, number];
  magic: { math: number; aesthetic: number; institutional: number; comptroller: number };
}

interface Store {
  nodes: GECDNodeData[];
  filters: Filters;
  selectedId: string | null;
  hoveredId: string | null;
  showConns: boolean;
  camPreset: "default" | "top" | "side";
  // actions
  setNodes: (n: GECDNodeData[]) => void;
  addNode: (n: GECDNodeData) => void;
  addNodes: (incoming: GECDNodeData[]) => void;
  select: (id: string | null) => void;
  hover: (id: string | null) => void;
  setElems: (e: string[]) => void;
  setTime: (r: [number, number]) => void;
  setMagic: (k: keyof Filters["magic"], v: number) => void;
  toggleConns: () => void;
  setCam: (p: "default" | "top" | "side") => void;
}

const useStore = create<Store>((set) => ({
  nodes: NODES,
  filters: {
    elements: [...ALL_ELEMENTS],
    timeRange: [-7000, 500],
    magic: { math: 0, aesthetic: 0, institutional: 0, comptroller: 0 },
  },
  selectedId: null,
  hoveredId: null,
  showConns: true,
  camPreset: "default",
  setNodes: (nodes) => set({ nodes }),
  addNode: (n) => set(s => ({ nodes: [...s.nodes, n] })),
  addNodes: (incoming) => set(s => {
    const existing = new Set(s.nodes.map(n => n.id));
    const fresh = incoming
      .filter(n => !existing.has(n.id))
      .map(n => ({ ...n, connections: n.connections ?? [] }));
    return fresh.length ? { nodes: [...s.nodes, ...fresh] } : {};
  }),
  select: (id) => set({ selectedId: id }),
  hover: (id) => set({ hoveredId: id }),
  setElems: (elements) => set(s => ({ filters: { ...s.filters, elements } })),
  setTime: (timeRange) => set(s => ({ filters: { ...s.filters, timeRange } })),
  setMagic: (k, v) => set(s => ({ filters: { ...s.filters, magic: { ...s.filters.magic, [k]: v } } })),
  toggleConns: () => set(s => ({ showConns: !s.showConns })),
  setCam: (camPreset) => set({ camPreset }),
}));

function useFilteredNodes(): GECDNodeData[] {
  const nodes   = useStore(s => s.nodes);
  const filters = useStore(s => s.filters);
  return useMemo(() => nodes.filter(n => {
    if (!filters.elements.includes(n.geometric_element)) return false;
    const yr = nodeYear(n);
    if (yr < filters.timeRange[0] || yr > filters.timeRange[1]) return false;
    const m = n.magic_drivers;
    if (!m) return false;
    return (
      m.math          >= filters.magic.math &&
      m.aesthetic     >= filters.magic.aesthetic &&
      m.institutional >= filters.magic.institutional &&
      m.comptroller   >= filters.magic.comptroller
    );
  }), [nodes, filters]);
}

// ── 3-D scene pieces ──────────────────────────────────────────────────────────

function Starfield() {
  const geo = useMemo(() => {
    const pts = new Float32Array(3000);
    for (let i = 0; i < 1000; i++) {
      pts[i*3]   = (Math.random()-0.5)*300;
      pts[i*3+1] = (Math.random()-0.5)*200;
      pts[i*3+2] = (Math.random()-0.5)*200;
    }
    return pts;
  }, []);
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute args={[geo, 3]} attach="attributes-position" />
      </bufferGeometry>
      <pointsMaterial size={0.15} color="#3a5080" transparent opacity={0.55} sizeAttenuation />
    </points>
  );
}

function CentralSpine() {
  const ref = useRef<THREE.Mesh>(null!);
  const midY = SPACE_S * 0.5;
  const midZ = SPACE_S * 0.5;
  const pts = useMemo(() => {
    const a: THREE.Vector3[] = [];
    for (let x = -WORLD_W/2; x <= WORLD_W/2; x += 4) a.push(new THREE.Vector3(x, midY, midZ));
    return a;
  }, [midY, midZ]);
  useFrame(({ clock }) => {
    if (ref.current) (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
      0.35 + Math.sin(clock.elapsedTime * 1.4) * 0.12;
  });
  return (
    <group>
      <Line points={pts} color="#8899cc" lineWidth={1} transparent opacity={0.2} />
      <mesh ref={ref} position={[0, midY, midZ]}>
        <sphereGeometry args={[0.28, 16, 16]} />
        <meshStandardMaterial color="#aabbff" emissive="#6677ff" emissiveIntensity={0.35} transparent opacity={0.55} />
      </mesh>
    </group>
  );
}

function AxisLabels() {
  const eraInfo = useMemo(() =>
    ERAS.map(e => ({ ...e, x: yearToX((e.start+e.end)/2), sx: yearToX(e.start), ex: yearToX(e.end) })),
  []);
  const yearMarks = useMemo(() => {
    const a = [];
    for (let y = -6000; y <= 0; y += 1000) a.push({ y, x: yearToX(y), label: `${Math.abs(y)}k BCE` });
    return a;
  }, []);

  return (
    <group>
      <gridHelper args={[WORLD_W, 28, "#111827", "#0d1520"]} position={[0, 0, 0]} />
      <gridHelper args={[WORLD_W, 28, "#111827", "#0d1520"]} position={[0, 0, SPACE_S]} rotation={[Math.PI/2, 0, 0]} />

      {eraInfo.map(e => (
        <group key={e.name}>
          <mesh position={[(e.sx+e.ex)/2, -0.05, SPACE_S/2]}>
            <planeGeometry args={[e.ex-e.sx, SPACE_S+4]} />
            <meshStandardMaterial color="#0a1420" transparent opacity={0.18} side={THREE.DoubleSide} />
          </mesh>
          <Text position={[e.x, -1.4, 0]} fontSize={0.5} color="#4a6a90" anchorX="center" anchorY="top" font={undefined}>{e.name}</Text>
        </group>
      ))}

      {yearMarks.map(m => (
        <group key={m.y}>
          <Line points={[new THREE.Vector3(m.x, 0, 0), new THREE.Vector3(m.x, -0.7, 0)]} color="#223344" lineWidth={0.8} />
          <Text position={[m.x, -1.1, 0]} fontSize={0.33} color="#334455" anchorX="center" anchorY="top" font={undefined}>{m.label}</Text>
        </group>
      ))}
    </group>
  );
}

function NodeMesh({ node, selected, hovered }: { node: GECDNodeData; selected: boolean; hovered: boolean }) {
  const ref = useRef<THREE.Mesh>(null!);
  const select = useStore(s => s.select);
  const hover  = useStore(s => s.hover);
  const pos  = useMemo(() => magicToPos(node), [node]);
  const size = useMemo(() => nodeSize(node), [node]);
  const col  = ELEMENT_COLORS[node.geometric_element] || "#ffffff";

  useFrame(() => {
    if (!ref.current) return;
    const mat = ref.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, selected ? 0.85 : hovered ? 0.5 : 0.12, 0.1);
    const ts = selected ? 1.45 : hovered ? 1.22 : 1.0;
    ref.current.scale.setScalar(THREE.MathUtils.lerp(ref.current.scale.x, ts, 0.1));
  });

  return (
    <mesh
      ref={ref}
      position={pos}
      onClick={(e) => { e.stopPropagation(); select(node.id); }}
      onPointerOver={(e) => { e.stopPropagation(); hover(node.id); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { hover(null); document.body.style.cursor = "default"; }}
    >
      <icosahedronGeometry args={[size, 2]} />
      <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.12} roughness={0.25} metalness={0.15} />
      {hovered && !selected && (
        <Html distanceFactor={18} style={{ pointerEvents: "none" }}>
          <div style={{
            background: "rgba(6,9,20,0.95)", border: `1px solid ${col}55`,
            borderRadius: 7, padding: "5px 10px", color: "#ddeeff", fontSize: 11,
            whiteSpace: "nowrap", boxShadow: `0 0 14px ${col}30`,
          }}>
            <div style={{ color: col, fontWeight: 700, marginBottom: 1 }}>{node.name}</div>
            <div style={{ color: "#7a9aaa", fontSize: 10 }}>{node.date_display}</div>
          </div>
        </Html>
      )}
    </mesh>
  );
}

function Connections({ all, visibleIds }: { all: GECDNodeData[]; visibleIds: Set<string> }) {
  const show     = useStore(s => s.showConns);
  const hoveredId  = useStore(s => s.hoveredId);
  const selectedId = useStore(s => s.selectedId);

  const posMap = useMemo(() => {
    const m: Record<string, THREE.Vector3> = {};
    all.forEach(n => { const [x,y,z] = magicToPos(n); m[n.id] = new THREE.Vector3(x,y,z); });
    return m;
  }, [all]);

  const edges = useMemo(() => {
    const seen = new Set<string>();
    const out: { from: string; to: string }[] = [];
    all.forEach(n => {
      if (!visibleIds.has(n.id)) return;
      (n.connections ?? []).forEach(t => {
        if (!visibleIds.has(t)) return;
        const k = [n.id,t].sort().join("||");
        if (!seen.has(k)) { seen.add(k); out.push({ from: n.id, to: t }); }
      });
    });
    return out;
  }, [all, visibleIds]);

  if (!show) return null;

  return (
    <>
      {edges.map(({ from, to }) => {
        const a = posMap[from]; const b = posMap[to];
        if (!a || !b) return null;
        const active = from === hoveredId || to === hoveredId || from === selectedId || to === selectedId;
        const pts: THREE.Vector3[] = [];
        for (let i = 0; i <= 20; i++) {
          const t = i / 20;
          pts.push(new THREE.Vector3(
            a.x + (b.x - a.x) * t,
            a.y + (b.y - a.y) * t + Math.sin(Math.PI * t) * 1.8,
            a.z + (b.z - a.z) * t,
          ));
        }
        return (
          <Line key={`${from}||${to}`} points={pts} color="#ffffff"
            lineWidth={active ? 1.6 : 0.7} transparent opacity={active ? 0.55 : 0.12} />
        );
      })}
    </>
  );
}

function CameraRig({ preset }: { preset: "default"|"top"|"side" }) {
  const { camera } = useThree();
  const ctrlRef = useRef<any>(null);
  useEffect(() => {
    const presets = {
      default: { pos: [0, 20, 38] as [number,number,number], tgt: [0, 4, 4] as [number,number,number] },
      top:     { pos: [0, 60, 0.01] as [number,number,number], tgt: [0, 0, 0] as [number,number,number] },
      side:    { pos: [0, 4, 60] as [number,number,number], tgt: [0, 4, 0] as [number,number,number] },
    };
    const { pos, tgt } = presets[preset];
    camera.position.set(...pos);
    ctrlRef.current?.target.set(...tgt);
    ctrlRef.current?.update();
  }, [preset, camera]);
  return <OrbitControls ref={ctrlRef} enableDamping dampingFactor={0.07} minDistance={4} maxDistance={130} />;
}

function Scene() {
  const all        = useStore(s => s.nodes);
  const selectedId = useStore(s => s.selectedId);
  const hoveredId  = useStore(s => s.hoveredId);
  const camPreset  = useStore(s => s.camPreset);
  const select     = useStore(s => s.select);
  const vis        = useFilteredNodes();
  const visIds     = useMemo(() => new Set(vis.map(n => n.id)), [vis]);

  return (
    <>
      <CameraRig preset={camPreset} />
      <ambientLight intensity={0.28} />
      <pointLight position={[0, 35, 0]} intensity={0.9} color="#5566ff" />
      <pointLight position={[-35, 12, 22]} intensity={0.4} color="#ff7733" />
      <pointLight position={[35,  12, -22]} intensity={0.4} color="#3366ff" />
      <fog attach="fog" args={["#05070f", 65, 190]} />

      <Starfield />
      <AxisLabels />
      <CentralSpine />
      <Connections all={all} visibleIds={visIds} />

      <group onPointerMissed={() => select(null)}>
        {vis.map(n => (
          <NodeMesh key={n.id} node={n}
            selected={n.id === selectedId}
            hovered={n.id === hoveredId}
          />
        ))}
      </group>
    </>
  );
}

// ── 2-D UI panels ─────────────────────────────────────────────────────────────

const panel: React.CSSProperties = {
  background: "rgba(6,9,20,0.97)",
  border: "1px solid #1a2a40",
  borderRadius: 10,
  backdropFilter: "blur(14px)",
  color: "#c0d4e8",
};

function MagicBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ marginBottom: 5 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
        <span style={{ fontSize: 10, color: "#7a99bb", fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 10, color: "#aabbc8" }}>{value.toFixed(2)}</span>
      </div>
      <div style={{ height: 5, background: "#101820", borderRadius: 3 }}>
        <div style={{ height: "100%", width: `${value*100}%`, background: color, borderRadius: 3, transition: "width .3s" }} />
      </div>
    </div>
  );
}

function DetailPanel({ node, onClose }: { node: GECDNodeData; onClose: () => void }) {
  const all    = useStore(s => s.nodes);
  const select = useStore(s => s.select);
  const col    = ELEMENT_COLORS[node.geometric_element] || "#ffffff";
  const [pipeSt, setPipeSt] = useState<"idle"|"loading"|"done">("idle");

  const connected = useMemo(() => all.filter(n => (node.connections ?? []).includes(n.id)), [all, node]);

  const sendPipeline = async () => {
    if (!node.image_prompt) return;
    setPipeSt("loading");
    try {
      await apiRequest("POST", "/api/rwi/images/search", {
        artifactId: node.id, query: node.image_prompt, sourceMode: "open_web_fast",
      });
      setPipeSt("done");
    } catch { setPipeSt("idle"); }
  };

  const magicColors = { math: "#2B6CC4", aesthetic: "#C62368", institutional: "#2D8659", comptroller: "#DAA520" };

  return (
    <div style={{
      ...panel,
      position: "absolute", right: 12, top: 56, width: 258,
      padding: 14, zIndex: 20,
      boxShadow: `0 0 28px ${col}1a`,
      maxHeight: "calc(100vh - 72px)", overflowY: "auto",
    }}>
      {/* header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontSize: 9, color: col, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
          {node.geometric_element} · {ELEMENT_DEITIES[node.geometric_element] || node.deity}
        </div>
        <button onClick={onClose} style={{ background:"none", border:"none", color:"#445566", fontSize:16, cursor:"pointer" }}>✕</button>
      </div>

      {/* image slot */}
      <div style={{
        width:"100%", aspectRatio:"4/3",
        background:`linear-gradient(135deg,#080e1c,${col}12)`,
        borderRadius:7, marginBottom:12, overflow:"hidden",
        display:"flex", alignItems:"center", justifyContent:"center",
        border:`1px solid ${col}22`,
      }}>
        {node.image_url
          ? <img src={node.image_url} alt={node.name} style={{ width:"100%", height:"100%", objectFit:"contain" }} />
          : <span style={{ fontSize:34, opacity:0.3 }}>
              {node.geometric_element==="circle"?"○":node.geometric_element==="star"?"✦":
               node.geometric_element==="triangle"?"△":node.geometric_element==="square"?"□":
               node.geometric_element==="spiral"?"◌":node.geometric_element==="pyramid"?"▲":"◈"}
            </span>
        }
      </div>

      <div style={{ fontSize:14, fontWeight:700, color:"#e2eaf6", marginBottom:2 }}>{node.name}</div>
      <div style={{ fontSize:11, color:"#5a7a88", marginBottom:6 }}>{node.date_display} · {node.provenance}</div>
      {node.civilization && (
        <span style={{ fontSize:9, padding:"2px 7px", background:`${col}18`, color, borderRadius:10, marginBottom:8, display:"inline-block" }}>
          {node.civilization}
        </span>
      )}

      <p style={{ fontSize:11, color:"#8aaccb", lineHeight:1.55, marginBottom:10, marginTop:8 }}>{node.description}</p>

      {node.notes && (
        <p style={{ fontSize:10, color:"#bb9933", background:"#1a1400", borderRadius:5, padding:"4px 8px", marginBottom:10 }}>
          ⚠ {node.notes}
        </p>
      )}

      {/* MAGIC profile */}
      <div style={{ marginBottom:12 }}>
        <div style={{ fontSize:9, color:"#445566", fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>MAGIC Profile</div>
        <MagicBar label="Math"          value={node.magic_drivers.math}          color={magicColors.math} />
        <MagicBar label="Aesthetic"     value={node.magic_drivers.aesthetic}     color={magicColors.aesthetic} />
        <MagicBar label="Institutional" value={node.magic_drivers.institutional} color={magicColors.institutional} />
        <MagicBar label="Comptroller"   value={node.magic_drivers.comptroller}   color={magicColors.comptroller} />
      </div>

      {/* connections */}
      {connected.length > 0 && (
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:9, color:"#445566", fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>Connected To</div>
          {connected.map(cn => (
            <button key={cn.id} onClick={() => select(cn.id)} style={{
              display:"block", width:"100%", textAlign:"left",
              background:"#0c1520", border:`1px solid ${ELEMENT_COLORS[cn.geometric_element]}2a`,
              borderRadius:5, padding:"4px 8px", marginBottom:3,
              color:"#aabbcc", fontSize:11, cursor:"pointer",
            }}>
              <span style={{ color:ELEMENT_COLORS[cn.geometric_element] }}>→ </span>{cn.name}
              <span style={{ fontSize:9, color:"#334455", marginLeft:5 }}>{cn.date_display}</span>
            </button>
          ))}
        </div>
      )}

      {/* tags */}
      {node.tags.length > 0 && (
        <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginBottom:12 }}>
          {node.tags.map(t => (
            <span key={t} style={{ fontSize:9, padding:"2px 6px", background:"#0d1420", border:"1px solid #1a2a38", borderRadius:10, color:"#445566" }}>{t}</span>
          ))}
        </div>
      )}

      {/* pipeline button */}
      <button onClick={sendPipeline} disabled={pipeSt!=="idle"} style={{
        width:"100%", padding:"7px 0", borderRadius:6, border:`1px solid ${pipeSt==="done"?"#1a4a1a":col}33`,
        background: pipeSt==="done"?"#0d1f0d": pipeSt==="loading"?"#0d0d20":`${col}1a`,
        color: pipeSt==="done"?"#4aaa4a": pipeSt==="loading"?"#5566aa": col,
        fontSize:11, fontWeight:700, cursor: pipeSt!=="idle"?"default":"pointer", transition:"all .2s",
      }}>
        {pipeSt==="done"?"✓ Sent to Image Pipeline": pipeSt==="loading"?"⟳ Searching…":"⟳ Send to Image Pipeline"}
      </button>
    </div>
  );
}

function FilterPanel() {
  const filters    = useStore(s => s.filters);
  const setElems   = useStore(s => s.setElems);
  const setMagic   = useStore(s => s.setMagic);
  const setTime    = useStore(s => s.setTime);
  const showConns  = useStore(s => s.showConns);
  const toggleConns = useStore(s => s.toggleConns);
  const [open, setOpen] = useState(true);

  const toggleEl = (el: string) => {
    const e = filters.elements;
    setElems(e.includes(el) ? e.filter(x => x !== el) : [...e, el]);
  };

  const eraButtons = [
    { name:"Ubaid",     r:[-6500,-3800] }, { name:"Uruk",    r:[-4000,-3100] },
    { name:"Early Dyn.",r:[-2900,-2350] }, { name:"Akkadian",r:[-2334,-2154] },
    { name:"Ur III",    r:[-2112,-2004] }, { name:"Old Bab.", r:[-2000,-1600] },
  ];

  if (!open) return (
    <button onClick={() => setOpen(true)} style={{
      ...panel, position:"absolute", left:12, top:56, zIndex:20,
      padding:"6px 12px", fontSize:11, color:"#5577aa", cursor:"pointer",
    }}>⊞ Filters</button>
  );

  return (
    <div style={{
      ...panel, position:"absolute", left:12, top:56, width:196, padding:12, zIndex:20,
      maxHeight:"calc(100vh - 72px)", overflowY:"auto",
    }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
        <span style={{ fontSize:9, fontWeight:700, color:"#556688", textTransform:"uppercase", letterSpacing:1 }}>Filters</span>
        <button onClick={() => setOpen(false)} style={{ background:"none", border:"none", color:"#334455", cursor:"pointer", fontSize:14 }}>−</button>
      </div>

      {/* Elements */}
      <div style={{ fontSize:9, color:"#334455", marginBottom:5, fontWeight:700, textTransform:"uppercase", letterSpacing:0.8 }}>Geometric Element</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:3, marginBottom:12 }}>
        {ALL_ELEMENTS.map(el => {
          const on = filters.elements.includes(el);
          return (
            <button key={el} onClick={() => toggleEl(el)} style={{
              padding:"3px 5px", borderRadius:4, fontSize:10, cursor:"pointer", textAlign:"left",
              background: on ? `${ELEMENT_COLORS[el]}1e` : "#070c18",
              border:`1px solid ${on ? ELEMENT_COLORS[el]+"55" : "#131d2a"}`,
              color: on ? ELEMENT_COLORS[el] : "#2a3a4a",
            }}>{el}</button>
          );
        })}
      </div>

      {/* MAGIC thresholds */}
      <div style={{ fontSize:9, color:"#334455", marginBottom:5, fontWeight:700, textTransform:"uppercase", letterSpacing:0.8 }}>MAGIC Thresholds</div>
      {(["math","aesthetic","institutional","comptroller"] as const).map(k => (
        <div key={k} style={{ marginBottom:7 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}>
            <span style={{ fontSize:9, color:"#556677" }}>{k.charAt(0).toUpperCase()}{k.slice(1)}</span>
            <span style={{ fontSize:9, color:"#667788" }}>{filters.magic[k].toFixed(1)}</span>
          </div>
          <input type="range" min={0} max={1} step={0.1} value={filters.magic[k]}
            onChange={e => setMagic(k, parseFloat(e.target.value))}
            style={{ width:"100%", accentColor:"#3a6aaa", cursor:"pointer" }}
          />
        </div>
      ))}

      {/* Era quick-select */}
      <div style={{ fontSize:9, color:"#334455", marginBottom:5, fontWeight:700, textTransform:"uppercase", letterSpacing:0.8 }}>Era</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:3, marginBottom:12 }}>
        {eraButtons.map(e => (
          <button key={e.name} onClick={() => setTime([e.r[0],e.r[1]] as [number,number])} style={{
            padding:"3px 4px", borderRadius:4, background:"#070c18",
            border:"1px solid #131d2a", color:"#3a5a70", fontSize:9, cursor:"pointer",
          }}>{e.name}</button>
        ))}
        <button onClick={() => setTime([-7000,500])} style={{
          padding:"3px 4px", borderRadius:4, gridColumn:"span 2",
          background:"#070c18", border:"1px solid #131d2a", color:"#3a5a70", fontSize:9, cursor:"pointer",
        }}>All Time</button>
      </div>

      {/* Connections */}
      <button onClick={toggleConns} style={{
        width:"100%", padding:"5px 8px", borderRadius:5, cursor:"pointer",
        background: showConns?"#0a1928":"#070c18",
        border:"1px solid #131d2a",
        color: showConns?"#5577aa":"#334455", fontSize:10,
      }}>
        {showConns?"⊸ Connections ON":"⊸ Connections OFF"}
      </button>
    </div>
  );
}

function Legend() {
  return (
    <div style={{
      position:"absolute", bottom:18, left:"50%", transform:"translateX(-50%)",
      background:"rgba(6,9,20,0.88)", border:"1px solid #1a2a40",
      borderRadius:8, padding:"7px 14px",
      display:"flex", gap:10, flexWrap:"wrap", justifyContent:"center",
      zIndex:10,
    }}>
      {ALL_ELEMENTS.map(el => (
        <div key={el} style={{ display:"flex", alignItems:"center", gap:4 }}>
          <div style={{ width:7, height:7, borderRadius:"50%", background:ELEMENT_COLORS[el] }} />
          <span style={{ fontSize:9, color:"#556677" }}>{el}</span>
        </div>
      ))}
    </div>
  );
}

// ── Ingest Modal ─────────────────────────────────────────────────────────────

function IngestModal({ onClose }: { onClose: () => void }) {
  const addNodes  = useStore(s => s.addNodes);
  const qc        = useQueryClient();
  const [text, setText]       = useState("");
  const [ctx,  setCtx]        = useState("");
  const [grade, setGrade]     = useState("");
  const [week,  setWeek]      = useState("");
  const [status, setStatus]   = useState<"idle"|"loading"|"done"|"error">("idle");
  const [result, setResult]   = useState<{ extracted: number; nodes: any[] } | null>(null);
  const [errMsg, setErrMsg]   = useState("");

  async function submit() {
    if (!text.trim()) return;
    setStatus("loading");
    setErrMsg("");
    try {
      const r = await apiRequest("POST", "/api/gecd/ingest", {
        text, context: ctx || undefined,
        grade: grade || undefined, week: week || undefined,
      });
      const data = await r.json();
      if (!r.ok) { setErrMsg(data.error || "Ingest failed"); setStatus("error"); return; }
      setResult(data);
      // Merge new nodes into the 3D timeline immediately
      if (Array.isArray(data.nodes)) addNodes(data.nodes as GECDNodeData[]);
      // Refresh cached node list
      qc.invalidateQueries({ queryKey: ["/api/gecd/nodes"] });
      setStatus("done");
    } catch (e: any) {
      setErrMsg(e.message ?? "Network error");
      setStatus("error");
    }
  }

  const overlay: React.CSSProperties = {
    position:"fixed", inset:0, background:"rgba(4,6,14,0.88)",
    display:"flex", alignItems:"center", justifyContent:"center",
    zIndex:100,
  };
  const box: React.CSSProperties = {
    background:"#080d1a", border:"1px solid #1a2a3a", borderRadius:10,
    padding:24, width:540, maxWidth:"90vw", maxHeight:"85vh",
    overflowY:"auto", display:"flex", flexDirection:"column", gap:12,
    color:"#8ab0c8", fontFamily:"monospace", fontSize:12,
  };

  return (
    <div style={overlay} onClick={e => { if (e.target===e.currentTarget) onClose(); }}>
      <div style={box}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ color:"#3a6a9a", fontWeight:700, fontSize:13, letterSpacing:2 }}>
            GECD NODE INGEST
          </span>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#3a5a7a", cursor:"pointer", fontSize:16 }}>✕</button>
        </div>

        <div style={{ fontSize:10, color:"#2a4a5a", lineHeight:1.6 }}>
          Paste any research text — Mesopotamian history, artifact descriptions, academic excerpts.
          Claude will extract GECD nodes and queue image searches automatically.
        </div>

        <textarea
          data-testid="ingest-text-input"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Paste research text here…"
          rows={8}
          style={{
            width:"100%", boxSizing:"border-box",
            background:"#060b14", border:"1px solid #1a2a3a", borderRadius:6,
            color:"#8ab0c8", fontFamily:"monospace", fontSize:11, padding:10,
            resize:"vertical",
          }}
        />

        <div style={{ display:"flex", gap:8 }}>
          <input
            data-testid="ingest-context-input"
            value={ctx}
            onChange={e => setCtx(e.target.value)}
            placeholder="Context / source title (optional)"
            style={{
              flex:2, background:"#060b14", border:"1px solid #1a2a3a", borderRadius:6,
              color:"#8ab0c8", fontFamily:"monospace", fontSize:11, padding:"6px 9px",
            }}
          />
          <input
            data-testid="ingest-grade-input"
            value={grade}
            onChange={e => setGrade(e.target.value)}
            placeholder="Grade (opt)"
            style={{
              flex:1, background:"#060b14", border:"1px solid #1a2a3a", borderRadius:6,
              color:"#8ab0c8", fontFamily:"monospace", fontSize:11, padding:"6px 9px",
            }}
          />
          <input
            data-testid="ingest-week-input"
            value={week}
            onChange={e => setWeek(e.target.value)}
            placeholder="Week (opt)"
            style={{
              flex:1, background:"#060b14", border:"1px solid #1a2a3a", borderRadius:6,
              color:"#8ab0c8", fontFamily:"monospace", fontSize:11, padding:"6px 9px",
            }}
          />
        </div>

        <button
          data-testid="ingest-submit-btn"
          onClick={submit}
          disabled={status==="loading" || !text.trim()}
          style={{
            padding:"9px 0", borderRadius:7,
            background: status==="loading" ? "#0a1020" : "#0d2040",
            border:"1px solid #1a3a5a",
            color: status==="loading" ? "#2a4a6a" : "#5a9aca",
            fontFamily:"monospace", fontWeight:700, fontSize:12,
            cursor: status==="loading" || !text.trim() ? "not-allowed" : "pointer",
            letterSpacing:1,
          }}
        >
          {status==="loading" ? "⏳ EXTRACTING NODES…" : "⬆ INGEST TEXT"}
        </button>

        {status==="error" && (
          <div style={{ color:"#aa3333", fontSize:11, padding:"6px 10px", background:"#1a0808", borderRadius:6 }}>
            ✕ {errMsg}
          </div>
        )}

        {status==="done" && result && (
          <div style={{ background:"#04100a", border:"1px solid #1a3a2a", borderRadius:6, padding:12 }}>
            <div style={{ color:"#3a9a5a", fontWeight:700, marginBottom:8 }}>
              ✓ {result.extracted} node{result.extracted!==1?"s":""} extracted → added to timeline
            </div>
            {result.nodes.map((n: any, i: number) => (
              <div key={i} style={{
                display:"flex", alignItems:"center", gap:8,
                padding:"4px 0", borderBottom:"1px solid #0d2018", fontSize:11,
              }}>
                <span style={{ color: ELEMENT_COLORS[n.geometric_element] ?? "#667788", fontSize:8 }}>⬡</span>
                <span style={{ color:"#8ab0a0", flex:1 }}>{n.name}</span>
                <span style={{ color:"#2a5a3a", fontSize:10 }}>{n.date_display}</span>
                <span style={{
                  background:"#0d2018", borderRadius:4, padding:"1px 6px",
                  color: ELEMENT_COLORS[n.geometric_element] ?? "#445566", fontSize:9,
                }}>
                  {n.geometric_element}
                </span>
              </div>
            ))}
            <div style={{ marginTop:10, fontSize:10, color:"#1a4a2a" }}>
              Image searches fired in background. Check candidate sets in Textreader.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function HUD({ onIngest }: { onIngest: () => void }) {
  const camPreset = useStore(s => s.camPreset);
  const setCam    = useStore(s => s.setCam);
  const nodeCount = useFilteredNodes().length;

  return (
    <div style={{ position:"absolute", top:10, left:"50%", transform:"translateX(-50%)", display:"flex", alignItems:"center", gap:8, zIndex:20 }}>
      <div style={{ ...panel, padding:"5px 14px", fontSize:10, color:"#2a4a6a", letterSpacing:2, fontWeight:700 }}>
        GECD TIMELINE · {nodeCount} NODES
      </div>
      <div style={{ ...panel, display:"flex", borderRadius:7 }}>
        {(["default","top","side"] as const).map(p => (
          <button key={p} onClick={() => setCam(p)} style={{
            padding:"4px 11px", border:"none", borderRadius:6,
            background: camPreset===p?"#142030":"transparent",
            color: camPreset===p?"#6699bb":"#2a4050",
            fontSize:10, cursor:"pointer",
          }}>
            {p==="default"?"3D":p==="top"?"Top":"Side"}
          </button>
        ))}
      </div>
      <button
        data-testid="hud-ingest-btn"
        onClick={onIngest}
        style={{
          ...panel, padding:"4px 13px", border:"1px solid #1a3a5a",
          background:"#0a1828", color:"#2a6a9a",
          fontSize:10, cursor:"pointer", fontFamily:"monospace",
          letterSpacing:1,
        }}
      >
        ⬆ INGEST
      </button>
    </div>
  );
}

// ── Keyboard shortcuts ────────────────────────────────────────────────────────

function useKeys() {
  const setCam      = useStore(s => s.setCam);
  const toggleConns = useStore(s => s.toggleConns);
  const select      = useStore(s => s.select);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key.toLowerCase()==="r") setCam("default");
      if (e.key.toLowerCase()==="t") setCam("top");
      if (e.key.toLowerCase()==="s") setCam("side");
      if (e.key.toLowerCase()==="c") toggleConns();
      if (e.key==="Escape") select(null);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [setCam, toggleConns, select]);
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Timeline() {
  const selectedId   = useStore(s => s.selectedId);
  const nodes        = useStore(s => s.nodes);
  const select       = useStore(s => s.select);
  const addNodes     = useStore(s => s.addNodes);
  const selectedNode = useMemo(() => nodes.find(n => n.id === selectedId) ?? null, [nodes, selectedId]);
  const [showIngest, setShowIngest] = useState(false);
  useKeys();

  // Load DB-persisted GECD nodes on mount and merge into store
  const { data: dbNodes } = useQuery<GECDNodeData[]>({
    queryKey: ["/api/gecd/nodes"],
    queryFn: async () => {
      const r = await fetch("/api/gecd/nodes");
      if (!r.ok) return [];
      return r.json();
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  useEffect(() => {
    if (dbNodes && dbNodes.length > 0) addNodes(dbNodes);
  }, [dbNodes, addNodes]);

  return (
    <div style={{ width:"100vw", height:"100vh", background:"#04060e", position:"relative", overflow:"hidden" }}>
      {/* Back link */}
      <div style={{ position:"absolute", top:12, left:12, zIndex:30 }}>
        <Link href="/" style={{
          fontSize:10, color:"#2a3a4a", textDecoration:"none",
          background:"rgba(6,9,20,0.85)", border:"1px solid #131d2a",
          borderRadius:5, padding:"4px 10px",
        }}>← Chronos</Link>
      </div>

      {/* HUD */}
      <HUD onIngest={() => setShowIngest(true)} />

      {/* 3-D canvas */}
      <Canvas
        camera={{ position:[0,20,38], fov:55 }}
        gl={{ antialias:true, alpha:false }}
        style={{ background:"#04060e" }}
        onPointerMissed={() => select(null)}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>

      {/* UI panels */}
      <FilterPanel />
      {selectedNode && <DetailPanel node={selectedNode} onClose={() => select(null)} />}
      <Legend />

      {/* Ingest modal */}
      {showIngest && <IngestModal onClose={() => setShowIngest(false)} />}

      {/* Key hint */}
      <div style={{
        position:"absolute", bottom:18, right:12, zIndex:10,
        fontSize:9, color:"#1e2d3a",
        background:"rgba(6,9,20,0.75)", border:"1px solid #101820",
        borderRadius:6, padding:"5px 9px", lineHeight:1.75,
      }}>
        R reset · T top · S side · C connections · I ingest · ESC deselect
      </div>
    </div>
  );
}
