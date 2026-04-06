import { useState, useCallback, useMemo } from "react";
import { Link } from "wouter";

// ═══════════════════════════════════════════════════════════════════
// GEA CONSTRUCTION GRAMMAR CALCULATOR
// Primitive + Motion + Duration + Vector = Result = F(ge)
// Use this to compute the GECD of any invention or innovation:
// find the geometric element added or changed, then analyze here.
// ═══════════════════════════════════════════════════════════════════

// ── Types ───────────────────────────────────────────────────────────

interface Primitive {
  name: string; dim: 0|1|2|3; type: string; symbol: string;
  physics: string; canDo: string[]; cannotDo: string[];
}
interface Operation { name: string; desc: string; icon: string }
interface Duration  { name: string; desc: string; factor: number }
interface VectorDim { name: string; dim: number }
interface Combination {
  a: string; aOp: string; b: string;
  name: string; desc: string; complexity: number; machine: string;
}

interface ComputeResult {
  inputPrimitive: Primitive;
  operation:      Operation;
  duration:       Duration;
  vector:         VectorDim;
  outputDim:      number;
  forceVecDim:    number;
  constructionVectors: number;
  cogLevel:       number;
  cogLabel:       string;
  results:        string[];
  functionalities: string[];
  simpleMachines: string[];
  emanations:     string[];
  isParallel:     boolean;
}

// ── Knowledge Base ──────────────────────────────────────────────────

const PRIMITIVES: Record<string, Primitive> = {
  point: {
    name: "Point", dim: 0, type: "GEA.Sh", symbol: "•",
    physics: "Center of mass. Where force converges.",
    canDo: ["Locate position", "Balance forces", "Anchor rotation"],
    cannotDo: ["Extend", "Enclose", "Distribute"],
  },
  line: {
    name: "Line", dim: 1, type: "GEA.Sh", symbol: "─",
    physics: "Force vector. Direction + magnitude.",
    canDo: ["Transmit force", "Define direction", "Connect two points", "Measure distance"],
    cannotDo: ["Enclose area", "Distribute pressure", "Rotate without anchor"],
  },
  angle: {
    name: "Angle", dim: 1, type: "GEA.Sh", symbol: "∠",
    physics: "Force resolution. Where directions meet.",
    canDo: ["Split force into components", "Determine mechanical advantage", "Create rigidity when closed"],
    cannotDo: ["Enclose without closure", "Roll", "Distribute evenly"],
  },
  curve: {
    name: "Curve", dim: 1, type: "GEA.Sh", symbol: "⌢",
    physics: "Continuous force. Force that doesn't stop acting.",
    canDo: ["Redirect force smoothly", "Contain pressure evenly", "Enable rotation", "Create periodic motion"],
    cannotDo: ["Create straight-line translation alone", "Grip or hold (no edges)", "Tile a plane"],
  },
  plane: {
    name: "Plane", dim: 2, type: "GEA.Sh", symbol: "▱",
    physics: "Field. A value at every point in flat space.",
    canDo: ["Distribute pressure", "Constrain motion to 2 directions", "Tile space", "Map positions"],
    cannotDo: ["Enclose volume alone", "Create rigidity", "Focus force"],
  },
  triangle: {
    name: "Triangle", dim: 2, type: "GEA.Sh", symbol: "△",
    physics: "Load distribution. Only rigid polygon.",
    canDo: ["Resist deformation", "Decompose force", "Create structural stability", "Reduce required force (as ramp)"],
    cannotDo: ["Roll", "Distribute evenly (concentrates at vertices)", "Contain pressure evenly"],
  },
  square: {
    name: "Square", dim: 2, type: "GEA.Sh", symbol: "□",
    physics: "Tessellation + measurement. Perfect tiling.",
    canDo: ["Tile plane with zero gaps", "Create orthogonal channels", "Measure area", "Distribute to 4 neighbors"],
    cannotDo: ["Resist shear", "Roll", "Contain pressure efficiently (corner stress)"],
  },
};

const OPERATIONS: Record<string, Operation> = {
  sweep:     { name: "Sweep",     desc: "Translate along a path",         icon: "→" },
  rotate:    { name: "Rotate",    desc: "Spin around an axis",            icon: "↻" },
  extrude:   { name: "Extrude",   desc: "Push perpendicular to surface",  icon: "⬆" },
  close:     { name: "Close",     desc: "Connect end to start",           icon: "○" },
  tile:      { name: "Tile",      desc: "Repeat to fill space",           icon: "▦" },
  fold:      { name: "Fold",      desc: "Bend along a line",              icon: "⌐" },
  overlay:   { name: "Overlay",   desc: "Stack with rotation offset",     icon: "⊕" },
  intersect: { name: "Intersect", desc: "Cut with another form",          icon: "✕" },
  project:   { name: "Project",   desc: "Flatten to lower dimension",     icon: "⤓" },
};

const DURATIONS: Record<string, Duration> = {
  zero:           { name: "Zero / Instant",      desc: "Frozen. No motion.",              factor: 0   },
  partial:        { name: "Partial",             desc: "Ghost visible. Incomplete form.", factor: 0.5 },
  full:           { name: "Full (single axis)",  desc: "Complete revolution or closure.", factor: 1   },
  full_all:       { name: "Full (all axes)",     desc: "Every orientation visited.",      factor: 2   },
  infinite_minus: { name: "∞ − 1",              desc: "Sphere with symmetry memory.",    factor: 3   },
};

const VECTOR_DIMS: Record<string, VectorDim> = {
  "0d":         { name: "0D (stationary)",        dim: 0 },
  "1d_straight":{ name: "1D straight",            dim: 1 },
  "1d_curved":  { name: "1D curved",              dim: 1 },
  "2d":         { name: "2D (surface)",           dim: 2 },
  "3d":         { name: "3D (volume)",            dim: 3 },
  screw:        { name: "Screw (translate+rotate)",dim: 2 },
};

const KNOWN_COMBINATIONS: Combination[] = [
  { a:"curve",    aOp:"close",   b:"line",     name:"Wheel & Axle",     desc:"Circle rotation → linear translation. Locomotion.",                       complexity:2, machine:"Wheel and Axle" },
  { a:"curve",    aOp:"close",   b:"curve",    name:"Pulley",           desc:"Circle + rope curve. Force redirection.",                                  complexity:2, machine:"Pulley" },
  { a:"triangle", aOp:"close",   b:"triangle", name:"Wedge",            desc:"Two inclined planes back-to-back. Material splitting.",                    complexity:2, machine:"Wedge" },
  { a:"line",     aOp:"sweep",   b:"point",    name:"Lever",            desc:"Line pivoting at point. Force multiplication.",                            complexity:2, machine:"Lever" },
  { a:"curve",    aOp:"close",   b:"triangle", name:"Screw",            desc:"Triangle wrapped around circle. Rotation → linear advance.",               complexity:3, machine:"Screw" },
  { a:"square",   aOp:"overlay", b:"square",   name:"8-Pointed Star",   desc:"Two squares rotated 45°. 8-fold directional symmetry.",                   complexity:2, machine:"Compass Rose (navigational)" },
  { a:"triangle", aOp:"tile",    b:"triangle", name:"Hexagon",          desc:"6 triangles sharing a vertex. Maximum efficient tiling.",                  complexity:3, machine:"Honeycomb / Gear teeth" },
  { a:"curve",    aOp:"close",   b:"angle",    name:"Cam / Gear",       desc:"Circle with angular teeth. Converts smooth rotation to stepped output.",   complexity:3, machine:"Gear train" },
  { a:"plane",    aOp:"fold",    b:"triangle", name:"Pyramid",          desc:"4 triangular planes meeting at apex. Maximum gravitational stability.",     complexity:4, machine:"Buttressed structure" },
];

// ── Computation Engine ──────────────────────────────────────────────

function computeResult(
  primitive: string, operation: string, duration: string, vectorDim: string,
): ComputeResult | null {
  if (!primitive || !operation || !duration || !vectorDim) return null;

  const p   = PRIMITIVES[primitive];
  const op  = OPERATIONS[operation];
  const dur = DURATIONS[duration];
  const vec = VECTOR_DIMS[vectorDim];

  const isParallel = (p.dim === 1 && vectorDim === "1d_straight") ||
                     (p.dim === 0 && vectorDim === "0d");
  const outputDim = isParallel ? p.dim : Math.min(3, p.dim + vec.dim);
  const forceVecDim = Math.max(0, vec.dim - 1);

  let constructionVectors = 0;
  if (vec.dim > 0) constructionVectors++;
  if (operation === "rotate" || operation === "overlay") constructionVectors++;
  if (vectorDim === "screw") constructionVectors = 3;
  if (duration === "full_all") constructionVectors = Math.max(constructionVectors, 3);

  const cogLevel = Math.min(5, 1 + constructionVectors);
  const cogLabels = [
    "", "Unary (recognition)", "Binary (shape + property)",
    "Ternary (shape + property + application)",
    "Quaternary (shape + property + material + mechanism)",
    "Quinary (full integration)",
  ];

  const results: string[] = [];
  const functionalities: string[] = [];
  const simpleMachines: string[] = [];
  const emanations: string[] = [];

  // Point
  if (primitive === "point") {
    if (operation === "sweep" && vectorDim === "1d_straight") { results.push("Line"); functionalities.push("Creates direction and distance"); }
    if (operation === "sweep" && vectorDim === "1d_curved")   { results.push("Arc / Curve"); functionalities.push("Creates trajectory path"); }
    if (operation === "rotate" && duration !== "zero") { results.push("Circle"); functionalities.push("Creates boundary of equal radius"); simpleMachines.push("Wheel (if + axle line)"); }
    if (vectorDim === "2d") { results.push("Disc / Surface"); functionalities.push("Creates area for distribution"); }
    if (vectorDim === "3d") { results.push("Sphere / Volume"); functionalities.push("Creates containment in all directions"); }
  }

  // Line
  if (primitive === "line") {
    if (operation === "sweep" && vectorDim === "1d_straight") {
      if (isParallel) { results.push("Longer Line (no dimension gain)"); functionalities.push("Extends reach but adds no new capability — parallel motion doesn't add dimension"); }
      else { results.push("Rectangle / Plane"); functionalities.push("Creates surface area for pressure distribution"); }
    }
    if (operation === "rotate") {
      results.push(duration === "full" || duration === "full_all" ? "Circle / Cylinder" : "Arc / Partial sweep");
      functionalities.push("Converts linear force to rotational sweep");
      if (duration === "full" || duration === "full_all") simpleMachines.push("Wheel and Axle");
    }
    if (operation === "extrude") { results.push("Plane / Rectangle"); functionalities.push("Creates flat surface for load bearing"); }
  }

  // Angle
  if (primitive === "angle") {
    if (operation === "close") {
      if (duration === "partial") { results.push("Triangle (3 closures)"); functionalities.push("Minimum rigid structure — resists deformation"); simpleMachines.push("Inclined Plane (in profile)"); simpleMachines.push("Wedge (doubled)"); }
      if (duration === "full")   { results.push("Regular Polygon (n closures)"); functionalities.push("Distributes force to n neighbors at equal angles"); }
    }
    if (operation === "rotate") { results.push("Cone"); functionalities.push("Concentrates/disperses force from point to circle or vice versa"); }
    if (operation === "tile")   { results.push("Tessellation (angle-dependent)"); functionalities.push("Fills plane — valid only if angles sum to 360° at vertex"); }
  }

  // Curve
  if (primitive === "curve") {
    if (operation === "close") {
      results.push(duration === "full" ? "Circle / Ellipse" : "Arc (open curve)");
      functionalities.push(duration === "full" ? "Equal-radius containment. Isotropic in-plane emanation" : "Partial containment. Force redirection along arc");
      if (duration === "full") { simpleMachines.push("Wheel and Axle (if + point center + line axle)"); simpleMachines.push("Pulley (if + rope curve)"); }
    }
    if (operation === "sweep" && vectorDim === "1d_straight") { results.push("Spiral (if radius expanding) or Helix (if constant radius + translation)"); functionalities.push("Converts rotation to linear advance (screw principle)"); simpleMachines.push("Screw (if wrapped around cylinder)"); }
    if (operation === "rotate" && (duration === "full" || duration === "full_all")) { results.push("Sphere / Torus"); functionalities.push("3D containment. Uniform pressure distribution in all directions"); }
  }

  // Plane
  if (primitive === "plane") {
    if (operation === "extrude") { results.push("Prism / Volume"); functionalities.push("Creates enclosed 3D space"); }
    if (operation === "fold") { results.push(duration === "partial" ? "Dihedral angle" : "Polyhedron"); functionalities.push(duration === "partial" ? "Creates rigid edge where two surfaces meet" : "Creates enclosed 3D structure from flat material"); }
    if (operation === "tile") { results.push("Infinite Grid / Lattice"); functionalities.push("Fills space uniformly. Basis of all measurement systems"); }
  }

  // Triangle
  if (primitive === "triangle") {
    if (operation === "extrude") { results.push("Triangular Prism"); functionalities.push("Rigid 3D structure — Toblerone shape. Structural beam"); }
    if (operation === "rotate") {
      results.push(duration === "full_all" ? "Sphere with tetrahedral symmetry memory" : "Cone");
      if (duration === "partial") { results.push("Triskelion / Triskele"); functionalities.push("Partial rotation ghost — rotational symbol with triangular heritage"); }
      if (duration === "full")     functionalities.push("Force concentration from base to apex (funnel)");
      if (duration === "full_all") functionalities.push("Maximum stability sphere — still carries triangle's symmetry fingerprint");
    }
    if (operation === "tile") { results.push("Triangular Grid"); functionalities.push("Strongest possible 2D lattice — every vertex is structurally locked"); }
    if (operation === "fold") { results.push("Tetrahedron (4 triangles) → Icosahedron (20)"); functionalities.push("Minimum 3D enclosure (tetra) → maximum spherical approx (icosa)"); }
    emanations.push("Force along sides (decomposition)");
    emanations.push("Cannot: uniform distribution, rolling, pressure containment");
    simpleMachines.push("Inclined Plane (profile IS the ramp)");
    simpleMachines.push("Wedge (two triangles back-to-back)");
  }

  // Square
  if (primitive === "square") {
    if (operation === "extrude") { results.push("Cube"); functionalities.push("Tiles 3D space perfectly. Every brick, room, shipping container"); }
    if (operation === "rotate")  { results.push("Cylinder (around edge)"); functionalities.push("Smooth containment from flat faces"); }
    if (operation === "overlay") { results.push("8-Pointed Star (two squares at 45°)"); functionalities.push("8-fold directional partition. Compass rose. Navigation basis"); emanations.push("8 discrete radial directions at 45° intervals"); }
    if (operation === "tile")    { results.push("Infinite Square Grid"); functionalities.push("Orthogonal coordinate system. Graph paper. City grids. Pixel grids"); }
    if (operation === "fold")    { results.push("Cube (6 folds)"); functionalities.push("6 faces = complete rectilinear enclosure"); }
    emanations.push("Orthogonal force channels (horizontal + vertical)");
    emanations.push("Cannot: resist shear, roll, contain pressure efficiently");
  }

  if (results.length === 0) {
    results.push(`${p.name} + ${op.name} (${dur.name})`);
    functionalities.push("Custom combination — analyze by decomposing into known patterns");
  }

  if (emanations.length === 0) {
    if (primitive === "point")    emanations.push("Omnidirectional from center (radiates equally)");
    if (primitive === "line")     emanations.push("Along the line (axial). Cannot: perpendicular force alone");
    if (primitive === "angle")    emanations.push("Resolves into two component directions along sides");
    if (primitive === "curve")    emanations.push("Tangential + centripetal at every point. Continuously varying");
    if (primitive === "plane")    emanations.push("Uniform pressure across surface. Constrains to 2D motion");
  }

  return {
    inputPrimitive: p, operation: op, duration: dur, vector: vec,
    outputDim, forceVecDim, constructionVectors, cogLevel,
    cogLabel: cogLabels[cogLevel],
    results, functionalities, simpleMachines, emanations, isParallel,
  };
}

// ── Colours ─────────────────────────────────────────────────────────
const DIM_COLORS = ["#556", "#3b82f6", "#22c55e", "#a855f7"];
const COG_COLOR  = (level: number) =>
  level <= 1 ? "#22c55e" : level <= 2 ? "#3b82f6" : level <= 3 ? "#eab308" : level <= 4 ? "#f97316" : "#ef4444";

// ── Component ───────────────────────────────────────────────────────
export default function GEACalculator() {
  const [prim, setPrim] = useState<string | null>(null);
  const [op,   setOp]   = useState<string | null>(null);
  const [dur,  setDur]  = useState<string | null>(null);
  const [vec,  setVec]  = useState<string | null>(null);
  const [tab,  setTab]  = useState<"calc" | "combine">("calc");
  const [hovCombo, setHovCombo] = useState<number | null>(null);

  const result = useMemo(
    () => computeResult(prim ?? "", op ?? "", dur ?? "", vec ?? ""),
    [prim, op, dur, vec],
  );

  const reset = useCallback(() => {
    setPrim(null); setOp(null); setDur(null); setVec(null);
  }, []);

  const mono = "'JetBrains Mono','Courier New',monospace";
  const serif = "'Georgia',serif";

  return (
    <div style={{ background:"#04060f", minHeight:"100vh", color:"#e2e8f0",
                  fontFamily: mono }}>

      {/* Nav */}
      <div style={{ display:"flex", alignItems:"center", gap:16, padding:"12px 24px",
                    background:"#060c1e", borderBottom:"1px solid #0b1428" }}>
        <Link href="/" style={{ color:"#1e2a40", fontSize:11, textDecoration:"none",
                                letterSpacing:2 }}>← CHRONOS</Link>
        <span style={{ color:"#0b1428" }}>·</span>
        <span style={{ color:"#f5c518", fontSize:11, letterSpacing:3 }}>
          GEA CONSTRUCTION GRAMMAR
        </span>
        <span style={{ flex:1 }}/>
        <span style={{ fontSize:9, color:"#1e2a40" }}>
          PRIMITIVE + MOTION + DURATION + VECTOR = F(ge)
        </span>
      </div>

      <div style={{ maxWidth:960, margin:"0 auto", padding:"28px 24px" }}>

        {/* Header */}
        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:22, fontWeight:700, color:"#f5c518",
                        letterSpacing:4, fontFamily:serif, marginBottom:4 }}>
            GEA CONSTRUCTION GRAMMAR CALCULATOR
          </div>
          <div style={{ fontSize:10, color:"#1e2a40", letterSpacing:3 }}>
            To find the GECD of an invention or innovation: identify the geometric element added or changed,
            then run this engine to compute F(ge) — the full functionality of that geometric act.
          </div>
        </div>

        {/* Tab switcher */}
        <div style={{ display:"flex", gap:8, marginBottom:20 }}>
          {(["calc","combine"] as const).map(k => (
            <button key={k} onClick={() => setTab(k)}
              style={{ padding:"6px 18px", fontSize:10, letterSpacing:2,
                       cursor:"pointer", border:"1px solid",
                       borderColor: tab===k ? "#f5c518" : "#0b1428",
                       background:  tab===k ? "#f5c51812" : "transparent",
                       color:       tab===k ? "#f5c518" : "#334155",
                       borderRadius:3, fontFamily:mono }}>
              {k === "calc" ? "SINGLE PRIMITIVE" : "COMBINATIONS"}
            </button>
          ))}
        </div>

        {tab === "calc" ? (
          <>
            {/* Step 1: Primitive */}
            <Section title="1 · SELECT PRIMITIVE (GEA)">
              <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:6 }}>
                {Object.entries(PRIMITIVES).map(([k, v]) => (
                  <Tile key={k} active={prim===k} onClick={() => setPrim(k)}>
                    <div style={{ fontSize:22, marginBottom:4 }}>{v.symbol}</div>
                    <div style={{ fontSize:10, color: prim===k ? "#f5c518" : "#94a3b8" }}>{v.name}</div>
                    <DimBadge dim={v.dim}/>
                    <div style={{ fontSize:8, color:"#334155", marginTop:2 }}>{v.type}</div>
                  </Tile>
                ))}
              </div>

              {/* Primitive detail */}
              {prim && (
                <div style={{ marginTop:12, padding:"10px 14px", background:"#060e20",
                              border:"1px solid #0b1828", borderRadius:4 }}>
                  <div style={{ fontSize:10, color:"#64748b", marginBottom:4 }}>
                    {PRIMITIVES[prim].physics}
                  </div>
                  <div style={{ display:"flex", gap:24 }}>
                    <div>
                      <div style={{ fontSize:8, color:"#22c55e", marginBottom:2 }}>CAN DO</div>
                      {PRIMITIVES[prim].canDo.map((c,i) => (
                        <div key={i} style={{ fontSize:8, color:"#334155" }}>· {c}</div>
                      ))}
                    </div>
                    <div>
                      <div style={{ fontSize:8, color:"#ef4444", marginBottom:2 }}>CANNOT DO</div>
                      {PRIMITIVES[prim].cannotDo.map((c,i) => (
                        <div key={i} style={{ fontSize:8, color:"#334155" }}>· {c}</div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Section>

            {/* Step 2: Operation */}
            <Section title="2 · SELECT OPERATION">
              <div style={{ display:"grid", gridTemplateColumns:"repeat(9,1fr)", gap:6 }}>
                {Object.entries(OPERATIONS).map(([k, v]) => (
                  <Tile key={k} active={op===k} onClick={() => setOp(k)}>
                    <div style={{ fontSize:20, marginBottom:4 }}>{v.icon}</div>
                    <div style={{ fontSize:9, color: op===k ? "#f5c518" : "#94a3b8" }}>{v.name}</div>
                    <div style={{ fontSize:7, color:"#334155", marginTop:2 }}>{v.desc}</div>
                  </Tile>
                ))}
              </div>
            </Section>

            {/* Step 3: Duration */}
            <Section title="3 · SELECT DURATION">
              <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:6 }}>
                {Object.entries(DURATIONS).map(([k, v]) => (
                  <Tile key={k} active={dur===k} onClick={() => setDur(k)}>
                    <div style={{ fontSize:11, color: dur===k ? "#f5c518" : "#94a3b8",
                                  marginBottom:2 }}>{v.name}</div>
                    <div style={{ fontSize:7, color:"#334155" }}>{v.desc}</div>
                    <div style={{ fontSize:8, color:"#1e2a40", marginTop:4 }}>
                      factor × {v.factor}
                    </div>
                  </Tile>
                ))}
              </div>
            </Section>

            {/* Step 4: Vector */}
            <Section title="4 · SELECT MOTION VECTOR DIMENSIONALITY">
              <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:6 }}>
                {Object.entries(VECTOR_DIMS).map(([k, v]) => (
                  <Tile key={k} active={vec===k} onClick={() => setVec(k)}>
                    <DimBadge dim={v.dim}/>
                    <div style={{ fontSize:10, color: vec===k ? "#f5c518" : "#94a3b8",
                                  marginTop:4 }}>{v.name}</div>
                  </Tile>
                ))}
              </div>
            </Section>

            {/* Result */}
            {result && (
              <div style={{ marginTop:8, padding:"20px 24px", background:"#050b1c",
                            border:"1px solid #c9a84c44", borderRadius:6 }}>

                {/* F(ge) formula */}
                <div style={{ padding:"10px 14px", background:"#040810",
                              border:"1px solid #1e2d3d", borderRadius:4,
                              fontFamily:mono, fontSize:11, color:"#7dc4e4",
                              textAlign:"center", marginBottom:16, letterSpacing:1 }}>
                  {result.inputPrimitive.symbol} {result.inputPrimitive.name} ({result.inputPrimitive.dim}D)
                  {" "}+{" "}{result.operation.icon} {result.operation.name}
                  {" "}+{" "}{result.duration.name}
                  {" "}+{" "}{result.vector.name}
                  {" "}={" "}<span style={{ color:"#f5c518", fontWeight:700 }}>F(ge)</span>
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
                  {/* Left: Result geometry */}
                  <div>
                    <SectionHead>RESULT GEOMETRY</SectionHead>
                    {result.isParallel && (
                      <div style={{ padding:"4px 8px", background:"#1a0808",
                                    border:"1px solid #ef444440", borderRadius:3,
                                    fontSize:9, color:"#ef4444", marginBottom:8 }}>
                        ⚠ Parallel motion — does NOT increase dimensionality.
                        Only independent motion adds a dimension.
                      </div>
                    )}
                    {result.results.map((r, i) => (
                      <div key={i} style={{ display:"flex", alignItems:"center",
                                            gap:8, marginBottom:6 }}>
                        <span style={{ fontSize:12, color:"#e2e8f0" }}>→ {r}</span>
                        <DimBadge dim={result.outputDim}/>
                      </div>
                    ))}

                    <SectionHead style={{ marginTop:16 }}>F(ge) — FUNCTIONALITY</SectionHead>
                    {result.functionalities.map((f, i) => (
                      <div key={i} style={{ fontSize:10, color:"#64748b",
                                            padding:"3px 0", lineHeight:1.6 }}>· {f}</div>
                    ))}

                    {result.simpleMachines.length > 0 && (
                      <>
                        <SectionHead style={{ marginTop:16 }}>SIMPLE MACHINES</SectionHead>
                        <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                          {result.simpleMachines.map((m, i) => (
                            <span key={i} style={{ padding:"3px 8px", background:"#f5c51812",
                                                   border:"1px solid #f5c51840",
                                                   borderRadius:3, fontSize:9, color:"#f5c518" }}>
                              {m}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Right: Force + Cognitive */}
                  <div>
                    <SectionHead>FORCE ANALYSIS</SectionHead>
                    <div style={{ fontSize:9, color:"#334155", marginBottom:4 }}>
                      Force vector dimensionality: <DimBadge dim={result.forceVecDim}/>
                    </div>
                    <SectionHead style={{ marginTop:12 }}>EMANATION PROFILE</SectionHead>
                    {result.emanations.map((e, i) => (
                      <div key={i} style={{ fontSize:9, color:"#475569",
                                            padding:"2px 0", lineHeight:1.6 }}>· {e}</div>
                    ))}

                    <SectionHead style={{ marginTop:16 }}>COGNITIVE COMPLEXITY (Halford)</SectionHead>
                    <div style={{ height:6, background:"#080f1e",
                                  borderRadius:3, overflow:"hidden", marginBottom:6 }}>
                      <div style={{
                        height:"100%", borderRadius:3,
                        width:`${(result.cogLevel / 5) * 100}%`,
                        background:`linear-gradient(90deg,#22c55e,#eab308,#ef4444)`,
                        transition:"width 0.4s ease",
                      }}/>
                    </div>
                    <div style={{ fontSize:9, color: COG_COLOR(result.cogLevel) }}>
                      Level {result.cogLevel}/5 — {result.cogLabel}
                    </div>
                    <div style={{ marginTop:8, fontSize:8, color:"#1e2a40" }}>
                      Construction vectors: {result.constructionVectors}
                    </div>

                    {/* Primitive ability reminder */}
                    <SectionHead style={{ marginTop:16 }}>PRIMITIVE CONSTRAINTS</SectionHead>
                    <div style={{ fontSize:8, color:"#1e2a40", fontStyle:"italic",
                                  lineHeight:1.6, marginBottom:4 }}>
                      {result.inputPrimitive.physics}
                    </div>
                    <div style={{ fontSize:8, color:"#334155" }}>
                      Can: {result.inputPrimitive.canDo.join(", ")}
                    </div>
                    <div style={{ fontSize:8, color:"#1e2a40", marginTop:2 }}>
                      Cannot: {result.inputPrimitive.cannotDo.join(", ")}
                    </div>
                  </div>
                </div>

                {/* GECD summary line */}
                <div style={{ marginTop:20, padding:"10px 14px", background:"#040c1e",
                              border:"1px solid #0b2040", borderRadius:4 }}>
                  <div style={{ fontSize:8, color:"#1e2a40", letterSpacing:2,
                                marginBottom:4 }}>GECD SUMMARY</div>
                  <div style={{ fontFamily:mono, fontSize:10, color:"#f5c518", lineHeight:1.8 }}>
                    GEA: {result.inputPrimitive.type} · {result.inputPrimitive.name}<br/>
                    GEM: {result.results[0]}<br/>
                    DIM: {result.inputPrimitive.dim}D → {result.outputDim}D<br/>
                    F(ge): {result.functionalities[0]}
                  </div>
                </div>

                <button onClick={reset}
                  style={{ marginTop:12, padding:"5px 14px", background:"transparent",
                            border:"1px solid #1e2a40", borderRadius:3, color:"#334155",
                            fontSize:9, cursor:"pointer", fontFamily:mono, letterSpacing:2 }}>
                  RESET
                </button>
              </div>
            )}

            {/* Prompt to complete selection */}
            {!result && (
              <div style={{ marginTop:16, padding:"14px 18px", background:"#040810",
                            border:"1px solid #0b1428", borderRadius:4,
                            fontSize:10, color:"#1e2a40", textAlign:"center" }}>
                Select all four inputs to compute F(ge)
                {[prim,op,dur,vec].filter(Boolean).length > 0 && (
                  <span style={{ color:"#22c55e" }}>
                    {" "}— {[prim,op,dur,vec].filter(Boolean).length}/4 selected
                  </span>
                )}
              </div>
            )}
          </>
        ) : (
          /* ── Combinations tab ── */
          <Section title="KNOWN GEA COMBINATIONS">
            <div style={{ fontSize:10, color:"#1e2a40", marginBottom:16 }}>
              These are documented GEA compositions. Each combines two primitives via an operation
              to produce a named GEM with specific engineering functionality.
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {KNOWN_COMBINATIONS.map((c, i) => (
                <div key={i}
                  onClick={() => setHovCombo(hovCombo === i ? null : i)}
                  style={{ padding:"12px 14px", borderRadius:5, cursor:"pointer",
                            background: hovCombo===i ? "#f5c51810" : "#050c1e",
                            border:`1px solid ${hovCombo===i ? "#f5c51840" : "#0b1428"}`,
                            transition:"all 0.15s" }}>
                  <div style={{ display:"flex", justifyContent:"space-between",
                                alignItems:"baseline", marginBottom:4 }}>
                    <span style={{ fontSize:12, color:"#f5c518", fontFamily:serif }}>
                      {c.name}
                    </span>
                    <span style={{ fontSize:8, color:"#334155" }}>
                      complexity {c.complexity}
                    </span>
                  </div>
                  <div style={{ fontSize:9, color:"#64748b", marginBottom:6,
                                lineHeight:1.6 }}>{c.desc}</div>
                  <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                    <span style={{ padding:"2px 7px", background:"#3b82f612",
                                   border:"1px solid #3b82f630", borderRadius:3,
                                   fontSize:8, color:"#3b82f6" }}>
                      {PRIMITIVES[c.a]?.symbol} {c.a}
                    </span>
                    <span style={{ fontSize:8, color:"#334155" }}>+</span>
                    <span style={{ padding:"2px 7px", background:"#a855f712",
                                   border:"1px solid #a855f730", borderRadius:3,
                                   fontSize:8, color:"#a855f7" }}>
                      {PRIMITIVES[c.b]?.symbol} {c.b}
                    </span>
                    <span style={{ flex:1 }}/>
                    <span style={{ padding:"2px 7px", background:"#f5c51812",
                                   border:"1px solid #f5c51840", borderRadius:3,
                                   fontSize:8, color:"#f5c518" }}>
                      ⚙ {c.machine}
                    </span>
                  </div>
                  {hovCombo === i && (
                    <div style={{ marginTop:10, padding:"8px 10px",
                                  background:"#040c1e", border:"1px solid #0b2040",
                                  borderRadius:3 }}>
                      <div style={{ fontSize:8, color:"#1e2a40", letterSpacing:2,
                                    marginBottom:4 }}>GECD READING</div>
                      <div style={{ fontSize:9, color:"#f5c518", fontFamily:mono,
                                    lineHeight:1.8 }}>
                        GEA(A): {c.a} + {OPERATIONS[c.aOp]?.icon} {c.aOp}<br/>
                        GEA(B): {c.b}<br/>
                        GEM:    {c.name}<br/>
                        F(ge):  {c.desc}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background:"#060c1e", border:"1px solid #0b1428",
                  borderRadius:5, padding:"14px 16px", marginBottom:12 }}>
      <div style={{ fontSize:9, color:"#1e2a40", letterSpacing:3,
                    marginBottom:10 }}>{title}</div>
      {children}
    </div>
  );
}

function Tile({ active, onClick, children }: {
  active: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button onClick={onClick} style={{
      background: active ? "#f5c51810" : "transparent",
      border: `1px solid ${active ? "#f5c518" : "#0b1828"}`,
      borderRadius:5, padding:"10px 6px", cursor:"pointer",
      display:"flex", flexDirection:"column", alignItems:"center",
      transition:"all 0.15s", textAlign:"center",
      fontFamily:"'JetBrains Mono','Courier New',monospace",
    }}>
      {children}
    </button>
  );
}

function DimBadge({ dim }: { dim: number }) {
  return (
    <span style={{
      display:"inline-block",
      background: DIM_COLORS[Math.min(dim, 3)] + "22",
      border:`1px solid ${DIM_COLORS[Math.min(dim, 3)]}`,
      borderRadius:3, padding:"1px 5px", fontSize:8,
      color: DIM_COLORS[Math.min(dim, 3)], marginTop:2,
    }}>{dim}D</span>
  );
}

function SectionHead({ children, style }: {
  children: React.ReactNode; style?: React.CSSProperties;
}) {
  return (
    <div style={{ fontSize:8, color:"#1e2a40", letterSpacing:2,
                  marginBottom:4, ...style }}>{children}</div>
  );
}
