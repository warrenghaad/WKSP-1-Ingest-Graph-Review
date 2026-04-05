import { useState, useMemo } from "react";
import { Link } from "wouter";

// ── Coordinate system ──────────────────────────────────────────────────────────
const T0   = -5900;   // earliest year
const T1   = -50;     // latest year
const TSPAN = T1 - T0;
const SVG_W = 5200;
const SVG_H = 620;
const PL = 170, PR = 120, PT = 96, PB = 80;
const PW  = SVG_W - PL - PR;
const PH  = SVG_H - PT - PB;
const N_LANES = 9;
const APPROACH = 110;  // px on each side of a knot where thread curves
const KNOT_R  = 22;    // hexagon radius

const toX = (yr: number) => PL + ((yr - T0) / TSPAN) * PW;
const toY = (lane: number) => PT + (lane / (N_LANES - 1)) * PH;

// ── Types ──────────────────────────────────────────────────────────────────────
interface Strand {
  id: string; name: string; color: string;
  lane: number;           // 0 – (N_LANES-1)
  startYear: number;
  endYear:   number;
  bornAt?:   string;      // knot id where this thread was spawned
  phi:       number;      // oscillation phase
}

interface KnotInput  { threadId: string; weight: number }
interface KnotOutput { threadId: string }

interface Knot {
  id: string; year: number; name: string; gem: string;
  icon: string;            // single glyph for hex label
  inputs:  KnotInput[];
  outputs: KnotOutput[];
  spawns?: Strand;         // new thread born at this knot
  // ── DII Analysis ───────────────────────────────────────────────────────────
  artifact: {
    element: string; carrier: string;
    complexity: number;    // 0–1
    potential:  string;
  };
  toolUse: {
    ideology:         string;
    intentionalShape: string;
    tools:            string[];
    prerequisite:     string | null; // knot id
  };
  dii: {
    primitive: string; motion: string;
    duration:  string; vector: string; fGe: string;
  };
  contribution: string;    // narrative summary of the convergence ratio
  magic: { M: number; A: number; G: number; I: number; C: number };
}

// ── Strands (base capability threads) ─────────────────────────────────────────
const BASE_STRANDS: Strand[] = [
  { id:"geo",  name:"Geometry",    color:"#f5c518", lane:0,   startYear:-6000, endYear:-50, phi:0.0 },
  { id:"cos",  name:"Cosmos",      color:"#8b5cf6", lane:1.5, startYear:-5000, endYear:-50, phi:1.2 },
  { id:"mat",  name:"Matter",      color:"#c47c3f", lane:3.0, startYear:-6000, endYear:-50, phi:0.7 },
  { id:"crf",  name:"Craft/Tool",  color:"#22c55e", lane:4.5, startYear:-6000, endYear:-50, phi:2.1 },
  { id:"num",  name:"Number",      color:"#3b82f6", lane:6.0, startYear:-5500, endYear:-50, phi:1.7 },
  { id:"pow",  name:"Power",       color:"#ef4444", lane:7.5, startYear:-5200, endYear:-50, phi:0.4 },
];

// ── DII Convergence Knots ──────────────────────────────────────────────────────
const KNOTS: Knot[] = [
  {
    id:"halaf", year:-5500, name:"Halaf Spiral Pottery", gem:"Spiral", icon:"◉",
    inputs: [
      { threadId:"geo", weight:0.40 },
      { threadId:"mat", weight:0.30 },
      { threadId:"crf", weight:0.30 },
    ],
    outputs: [{ threadId:"geo" },{ threadId:"mat" },{ threadId:"crf" }],
    spawns: { id:"aes", name:"Aesthetic Code", color:"#f97316", lane:1.2,
              startYear:-5500, endYear:-50, phi:0.9, bornAt:"halaf" },
    artifact: {
      element:    "Spiral",
      carrier:    "Painted polychrome clay vessel",
      complexity: 0.35,
      potential:  "Encodes natural growth patterns in durable ceramic. First evidence of geometric symbolism as a cultural carrier — shape outlasts the maker.",
    },
    toolUse: {
      ideology:         "Aesthetic-cosmic order: spiral = cyclical time, organic growth. Geometry as world-model.",
      intentionalShape: "Spiral is NOT accidental. Sustained radial attention during coiling reveals intent to encode non-utilitarian meaning.",
      tools:            ["Slow tournette (hand rotation)", "Multi-pigment ochre brushes", "Open-fire kiln"],
      prerequisite:     null,
    },
    dii: {
      primitive: "Curve",
      motion:    "Rotation (sustained radial sweep)",
      duration:  "Full single-axis",
      vector:    "Vertical axis through the center of the wet clay mass",
      fGe:       "Curve + Rotation + Full(1-axis) = Vessel — a solid of revolution that is also an aesthetic argument",
    },
    contribution: "Geometry (40%) supplies the spiral template. Matter (30%) is the clay medium that retains form. Craft (30%) is the hand-skill to execute radial motion at ceramic scale.",
    magic: { M:0.3, A:0.9, G:0.6, I:0.3, C:0.1 },
  },
  {
    id:"cylinder-seal", year:-3500, name:"Cylinder Seal", gem:"Circle", icon:"⊛",
    inputs: [
      { threadId:"geo", weight:0.35 },
      { threadId:"pow", weight:0.35 },
      { threadId:"crf", weight:0.20 },
      { threadId:"aes", weight:0.10 },
    ],
    outputs: [{ threadId:"geo" },{ threadId:"pow" },{ threadId:"crf" },{ threadId:"aes" }],
    spawns: { id:"tok", name:"Identity Token", color:"#06b6d4", lane:6.8,
              startYear:-3500, endYear:-50, phi:1.5, bornAt:"cylinder-seal" },
    artifact: {
      element:    "Circle (cylinder)",
      carrier:    "Carved hardstone cylinder; clay impression",
      complexity: 0.65,
      potential:  "Geometric authentication at institutional scale. Makes ownership tamper-evident. Enables trust without physical presence — the first 'digital signature'.",
    },
    toolUse: {
      ideology:         "Comptroller-power: geometry as authentication. The circle guarantees because it can be perfectly and infinitely reproduced.",
      intentionalShape: "Cylinder is CHOSEN precisely because rolling produces a continuous, unbreakable frieze. A flat seal makes a finite stamp. A cylinder makes an infinite, unforgeable border.",
      tools:            ["Hardstone drill (copper or flint)", "Rotary bow drill", "Abrasive (emery sand)"],
      prerequisite:     null,
    },
    dii: {
      primitive: "Circle",
      motion:    "Translation (linear rolling across clay)",
      duration:  "Full single-axis",
      vector:    "Horizontal axis along the clay surface (rolling direction)",
      fGe:       "Circle + Linear-Translation + Full = Continuous Frieze — the circle's revolution maps one-to-one onto a linear authority record",
    },
    contribution: "Geometry (35%) defines the cylinder-circle relationship. Power (35%) is the institutional need that demands the tool. Craft (20%) executes the miniature carving. Aesthetic (10%) encodes mythological narrative onto the cylinder.",
    magic: { M:0.4, A:0.9, G:0.8, I:0.9, C:0.9 },
  },
  {
    id:"cuneiform", year:-3200, name:"Cuneiform Writing", gem:"Triangle", icon:"𒀭",
    inputs: [
      { threadId:"num", weight:0.40 },
      { threadId:"mat", weight:0.30 },
      { threadId:"geo", weight:0.30 },
    ],
    outputs: [{ threadId:"num" },{ threadId:"mat" },{ threadId:"geo" }],
    spawns: { id:"ins", name:"Inscription", color:"#e879f9", lane:5.4,
              startYear:-3200, endYear:-50, phi:2.3, bornAt:"cuneiform" },
    artifact: {
      element:    "Triangle (wedge)",
      carrier:    "Reed stylus impressed into wet clay tablet",
      complexity: 0.55,
      potential:  "Externalizes number and sound into persistent material form. Unlocks abstraction from oral to visual — thought becomes object.",
    },
    toolUse: {
      ideology:         "Inscriptive authority: what is pressed in clay is legally binding. Triangle = compressed force = act of legal recording.",
      intentionalShape: "The wedge is NOT arbitrary. The reed's cut end IS naturally triangular. The geometry of the tool dictated the geometry of the script — material forced the form.",
      tools:            ["Trimmed reed stylus (cut at 45°)", "Wet alluvial clay tablets", "Drying rack or kiln"],
      prerequisite:     null,
    },
    dii: {
      primitive: "Triangle (wedge cross-section of reed)",
      motion:    "Linear pressure (punch into clay surface)",
      duration:  "Zero / instantaneous",
      vector:    "Perpendicular to the clay surface; angled to create the wedge shadow",
      fGe:       "Triangle + Puncture + Zero-duration = Frozen Wedge Mark — a sign is a triangle arrested at the moment of maximum force",
    },
    contribution: "Number (40%) is the counting/accounting need that motivates the invention. Matter (30%) supplies the clay medium — cuneiform is impossible without wet alluvial clay. Geometry (30%) provides the triangular wedge logic that makes systematic replication possible.",
    magic: { M:0.6, A:0.3, G:0.9, I:0.9, C:0.9 },
  },
  {
    id:"sexagesimal", year:-3000, name:"Sexagesimal System", gem:"Rosette/Circle", icon:"⬡",
    inputs: [
      { threadId:"geo", weight:0.45 },
      { threadId:"cos", weight:0.35 },
      { threadId:"num", weight:0.20 },
    ],
    outputs: [{ threadId:"geo" },{ threadId:"cos" },{ threadId:"num" }],
    spawns: { id:"b60", name:"Base-60 Math", color:"#fbbf24", lane:3.8,
              startYear:-3000, endYear:-50, phi:1.0, bornAt:"sexagesimal" },
    artifact: {
      element:    "6-fold Rosette (geometric origin of base-60)",
      carrier:    "Mathematical notation; calendar; astronomical tables",
      complexity: 0.78,
      potential:  "Six equilateral triangles tile a circle exactly. This creates 360°, the 60-minute hour, the 60-second minute. Still governing global timekeeping 5,000 years later.",
    },
    toolUse: {
      ideology:         "Mathematical-cosmic: geometry as the foundation of numerical structure. Base-60 is NOT arbitrary — it is geometrically inevitable from the 6-fold circle.",
      intentionalShape: "The rosette CHOSEN because 6-equilateral-triangle tiling is uniquely perfect. Other regular polygons fail: 4-fold gives 90°, 3-fold gives 120°. Only 6-fold gives 60°.",
      tools:            ["Compass (rope-and-peg)", "Sand or clay drawing surface", "Stellar transit observations for calibration"],
      prerequisite:     "halaf",
    },
    dii: {
      primitive: "Circle + equilateral Triangle (×6)",
      motion:    "Rotation (6-fold radial symmetry — 6 × 60° = 360°)",
      duration:  "Full all-axes",
      vector:    "6 equal angular divisions; each triangle vertex is a cardinal direction",
      fGe:       "Circle × 6-Triangle + Radial-Rotation + Full-all-axes = Rosette → 360° → Base-60 (geometry precedes arithmetic)",
    },
    contribution: "Geometry (45%) discovers that 6 equilateral triangles tile a circle exactly. Cosmos (35%) supplies the astronomical need (year, month, day) that demands a divisible number base. Number (20%) is the formal accounting system that adopts and propagates it.",
    magic: { M:0.98, A:0.20, G:0.80, I:0.70, C:0.70 },
  },
  {
    id:"ziggurat", year:-2100, name:"Ziggurat of Ur", gem:"Pyramid", icon:"△",
    inputs: [
      { threadId:"pow",  weight:0.35 },
      { threadId:"geo",  weight:0.30 },
      { threadId:"mat",  weight:0.25 },
      { threadId:"b60",  weight:0.10 },
    ],
    outputs: [{ threadId:"pow" },{ threadId:"geo" },{ threadId:"mat" },{ threadId:"b60" }],
    artifact: {
      element:    "Pyramid (stepped)",
      carrier:    "Fired mud brick; bitumen mortar; 3 terraces, 21m high",
      complexity: 0.85,
      potential:  "Encodes political hierarchy in three-dimensional space. Ziggurat height = institutional distance from deity. Each terrace = a lower order of access. Geometry as political grammar.",
    },
    toolUse: {
      ideology:         "Institutional-geometric: the pyramid makes power VISIBLE across a flat landscape. Geometry as political broadcast over distance.",
      intentionalShape: "Stepped form is NOT a failed true pyramid. Each step is an administrative boundary made architectural. The geometry encodes the bureaucracy.",
      tools:            ["Mud brick molds (plano-convex, standardized)", "Level ropes and plumb bobs", "Ramp construction (earth)", "Bitumen mortar"],
      prerequisite:     "cylinder-seal",
    },
    dii: {
      primitive: "Rectangle (brick) + Triangle (elevation profile)",
      motion:    "Stacking (translation along Z-axis, layer by layer)",
      duration:  "Full single-axis",
      vector:    "Vertical axis; each terrace is a horizontal cross-section of the pyramid solid",
      fGe:       "Rectangle(brick) × Z-Stacking + Full(1-axis) = Stepped Pyramid — a discrete solid of revolution built from modular units",
    },
    contribution: "Power (35%) provides the institutional will and labor mobilization. Geometry (30%) provides the pyramid profile and brick layout plans. Matter (25%) is standardized fired brick that makes large-scale modular construction possible. Base-60 (10%) provides the mathematical proportioning system for the terraces.",
    magic: { M:0.80, A:0.90, G:0.90, I:1.00, C:0.70 },
  },
  {
    id:"plimpton", year:-1800, name:"Plimpton 322", gem:"Triangle", icon:"⊿",
    inputs: [
      { threadId:"b60",  weight:0.50 },
      { threadId:"geo",  weight:0.35 },
      { threadId:"num",  weight:0.15 },
    ],
    outputs: [{ threadId:"b60" },{ threadId:"geo" },{ threadId:"num" }],
    spawns: { id:"alg", name:"Algebraic Geometry", color:"#34d399", lane:2.5,
              startYear:-1800, endYear:-50, phi:1.3, bornAt:"plimpton" },
    artifact: {
      element:    "Right Triangle (Pythagorean)",
      carrier:    "Clay tablet in sexagesimal notation; 15 rows × 4 columns",
      complexity: 0.92,
      potential:  "1,800 years before Pythagoras. Algebraic solution of quadratic equations via geometric 'cut-and-paste' method. Enables accurate surveying, canal design, monumental layout.",
    },
    toolUse: {
      ideology:         "Mathematical precision: the triangle as the ultimate ratio machine. Right angle = the cosmic guarantee of squareness in a constructed world.",
      intentionalShape: "Right triangle SPECIFICALLY chosen: it is the ONLY triangle where the ratio of sides produces integer solutions (3-4-5, 5-12-13, 8-15-17). Deliberately systematic — not discovered accidentally.",
      tools:            ["Reed stylus (cuneiform)", "Arithmetic tables (multiplication, reciprocals)", "Clay tablet"],
      prerequisite:     "sexagesimal",
    },
    dii: {
      primitive: "Right Triangle",
      motion:    "None (static ratio analysis)",
      duration:  "Zero — relationships extracted, not generated by motion",
      vector:    "Hypotenuse as primary direction; perpendicular legs define the orthogonal space",
      fGe:       "Right-Triangle + No-motion + Zero-duration = Pythagorean Triples (the triangle is a ratio extractor, not a motion generator)",
    },
    contribution: "Base-60 (50%) is the number system that makes the ratios expressible as clean fractions. Geometry (35%) identifies the right-triangle constraint that generates the triples. Number (15%) provides the systematic table format — this is a GENERATED list, not a random collection.",
    magic: { M:0.98, A:0.20, G:0.80, I:0.50, C:0.50 },
  },
  {
    id:"hammurabi", year:-1754, name:"Code of Hammurabi", gem:"Stele/Triangle", icon:"⚖",
    inputs: [
      { threadId:"ins",  weight:0.40 },
      { threadId:"pow",  weight:0.40 },
      { threadId:"tok",  weight:0.20 },
    ],
    outputs: [{ threadId:"ins" },{ threadId:"pow" },{ threadId:"tok" }],
    artifact: {
      element:    "Stele (triangle top + rectangle body)",
      carrier:    "Black diorite stone, 2.25m high; 282 laws in cuneiform",
      complexity: 0.82,
      potential:  "First comprehensive legal code. The geometry of the stele (triangle top = divine, rectangle body = human law) encodes the theological justification of the law itself. Form IS argument.",
    },
    toolUse: {
      ideology:         "Legal-geometric: the stele's triangular apex places Shamash at the top — divine authority radiates downward into the rectangular text. Geometry as theological argument.",
      intentionalShape: "Triangle (apex) encodes divine origin. Rectangle (body) encodes human application. The geometric transition IS the argument: 'this law descends from heaven'.",
      tools:            ["Iron/bronze chisels (hardstone)", "Polishing stones (diorite)", "Professional scribes (edubba school training)"],
      prerequisite:     "cuneiform",
    },
    dii: {
      primitive: "Triangle (stele apex) + Rectangle (text body)",
      motion:    "Linear inscription (horizontal text rows, top to bottom)",
      duration:  "Full single-axis (complete column-by-column coverage)",
      vector:    "Top-to-bottom: Shamash at apex radiates authority downward through the text",
      fGe:       "Stele(Triangle+Rectangle) + Linear-Inscription + Full = Permanent Legal Text — authority frozen in the hardest available stone",
    },
    contribution: "Inscription (40%) is the writing system that makes 282 laws expressible. Power (40%) is the Babylonian imperial authority that commissions and enforces. Identity-Token (20%) — the cylinder seal system that pre-established authenticated geometric identity is the direct predecessor logic.",
    magic: { M:0.30, A:0.70, G:0.50, I:1.00, C:0.95 },
  },
  {
    id:"antikythera", year:-100, name:"Antikythera Mechanism", gem:"Circle/Gear", icon:"⚙",
    inputs: [
      { threadId:"cos",  weight:0.35 },
      { threadId:"b60",  weight:0.30 },
      { threadId:"alg",  weight:0.20 },
      { threadId:"crf",  weight:0.15 },
    ],
    outputs: [{ threadId:"cos" },{ threadId:"b60" },{ threadId:"alg" },{ threadId:"crf" }],
    artifact: {
      element:    "Circle (gear — a circle with teeth)",
      carrier:    "37 bronze gears in a wooden case; corroded to 82 fragments",
      complexity: 0.98,
      potential:  "First known analog computer. 37 interlocking circles encode eclipse prediction, planetary positions, and the Olympiad calendar. Geometric ratio IS the computation.",
    },
    toolUse: {
      ideology:         "Mathematical-astronomical: gear ratio = ratio of circles = astronomical ratio. The same base-60 mathematics applied to gear teeth. Number becomes mechanism.",
      intentionalShape: "Circle REQUIRED: only a circle produces constant angular velocity at contact. A square or triangle produces variable speed — useless for ratio computation. The circle is the only figure that makes the machine possible.",
      tools:            ["Precision bronze casting and filing", "Gear-tooth cutting templates", "Astronomical tables (base-60)", "Miniaturization technique (unknown method)"],
      prerequisite:     "sexagesimal",
    },
    dii: {
      primitive: "Circle (gear)",
      motion:    "Interlocking rotation — gear-ratio transmission of angular velocity",
      duration:  "∞−1 (sphere with symmetry memory — continuous, cyclical, ratio-preserving)",
      vector:    "Rotational axis per gear; ratio defined by tooth count; vector ENCODES the astronomical period",
      fGe:       "Circle(A) × Circle(B) + Interlocked-Rotation + ∞-1 = Ratio Machine — two circles touching IS the computation; the ratio of their circumferences IS the answer",
    },
    contribution: "Cosmos (35%) provides the astronomical periods the mechanism must encode. Base-60 (30%) provides the number system that makes those periods expressible as gear ratios. Algebraic Geometry (20%) provides the right-triangle ratio mathematics needed to engineer the gear tooth counts. Craft (15%) executes miniature bronze work at precision levels not re-achieved for 1,400 years.",
    magic: { M:0.98, A:0.50, G:0.80, I:0.40, C:0.40 },
  },
];

// ── Path helpers ───────────────────────────────────────────────────────────────
function catmull(pts: [number,number][]): string {
  if (pts.length < 2) return "";
  const d: string[] = [`M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d.push(`C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)} ${cp2x.toFixed(1)} ${cp2y.toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`);
  }
  return d.join(" ");
}

// Build a thread segment from (x0,y0) to (x1,y1) with sinusoidal oscillation.
// Oscillation fades near the endpoints (approach to/departure from a knot).
function threadPath(
  x0: number, y0: number, x1: number, y1: number,
  phi: number, yr0: number, yr1: number,
): string {
  if (x1 <= x0) return "";
  const STEP = 16;
  const pts: [number,number][] = [];
  for (let x = x0; x <= x1; x += STEP) {
    const t  = (x - x0) / (x1 - x0);
    const s  = t * t * (3 - 2 * t);          // smoothstep
    const by = y0 + s * (y1 - y0);
    const edgeDist = Math.min(x - x0, x1 - x);
    const fade = Math.min(edgeDist / 80, 1);  // fade oscillation near endpoints
    const yr   = yr0 + t * (yr1 - yr0);
    const osc  = 20 * fade * Math.sin(2 * Math.PI * yr / 720 + phi);
    pts.push([x, by + osc]);
  }
  pts.push([x1, y1]);
  return catmull(pts);
}

function hexPath(cx: number, cy: number, r: number): string {
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = Math.PI / 6 + i * Math.PI / 3;
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  });
  return `M ${pts.join(" L ")} Z`;
}

// ── Knot Y computation ─────────────────────────────────────────────────────────
function knotY(k: Knot, allStrands: Strand[]): number {
  let sumY = 0, sumW = 0;
  for (const inp of k.inputs) {
    const s = allStrands.find(t => t.id === inp.threadId);
    if (s) { sumY += toY(s.lane) * inp.weight; sumW += inp.weight; }
  }
  return sumW > 0 ? sumY / sumW : SVG_H / 2;
}

// ── Segment builder ────────────────────────────────────────────────────────────
interface Segment { d: string; color: string; width: number; strandId: string }

function buildSegments(allStrands: Strand[], knotMap: Map<string, number>): Segment[] {
  const segs: Segment[] = [];

  // Sort knots by year
  const sortedKnots = [...KNOTS].sort((a, b) => a.year - b.year);

  for (const strand of allStrands) {
    const baseY  = toY(strand.lane);
    const startX = toX(strand.startYear);
    const endX   = toX(strand.endYear);
    const col    = strand.color;

    // Find knots that involve this strand as input, sorted by year
    const myKnots = sortedKnots.filter(k =>
      k.inputs.some(inp => inp.threadId === strand.id) &&
      k.year >= strand.startYear && k.year <= strand.endYear
    );

    // Build segments: start → knot1 → knot2 → ... → end
    let cursor = startX;
    let cursorYr = strand.startYear;

    for (const knot of myKnots) {
      const kx  = toX(knot.year);
      const ky  = knotMap.get(knot.id) ?? baseY;
      const inp = knot.inputs.find(i => i.threadId === strand.id);
      const w   = inp ? inp.weight * 4 + 0.8 : 1.2;

      // Normal thread from cursor to approach start
      const approachStart = kx - APPROACH;
      if (approachStart > cursor + 4) {
        segs.push({
          d: threadPath(cursor, baseY, approachStart, baseY,
             strand.phi, cursorYr, knot.year - 200),
          color: col, width: 1.4, strandId: strand.id,
        });
      }
      // Approach: thread curves toward knot center
      segs.push({
        d: threadPath(approachStart, baseY, kx, ky,
           strand.phi, knot.year - 200, knot.year),
        color: col, width: w, strandId: strand.id,
      });
      // Departure: thread curves back from knot center
      const approachEnd = kx + APPROACH;
      segs.push({
        d: threadPath(kx, ky, approachEnd, baseY,
           strand.phi, knot.year, knot.year + 200),
        color: col, width: w, strandId: strand.id,
      });
      cursor   = approachEnd;
      cursorYr = knot.year + 200;
    }

    // Final segment: last knot end → strand end
    if (cursor < endX - 4) {
      segs.push({
        d: threadPath(cursor, baseY, endX, baseY,
           strand.phi, cursorYr, strand.endYear),
        color: col, width: 1.4, strandId: strand.id,
      });
    }
  }
  return segs;
}

// ── MAGIC bar helper ───────────────────────────────────────────────────────────
const MAGIC_KEYS   = ["M","A","G","I","C"] as const;
const MAGIC_LABELS = { M:"Math", A:"Aesthetic", G:"Geometry", I:"Institution", C:"Comptroller" };
const MAGIC_COLORS = { M:"#3b82f6", A:"#f97316", G:"#f5c518", I:"#8b5cf6", C:"#ef4444" };

// ── Component ──────────────────────────────────────────────────────────────────
export default function Braid() {
  const [activeKnot, setActiveKnot] = useState<Knot | null>(null);
  const [hovKnot,    setHovKnot]    = useState<string | null>(null);
  const [hovStrand,  setHovStrand]  = useState<string | null>(null);

  // Merge base strands with spawned strands from knots
  const allStrands = useMemo<Strand[]>(() => {
    const extra = KNOTS.filter(k => k.spawns).map(k => k.spawns as Strand);
    return [...BASE_STRANDS, ...extra];
  }, []);

  // Pre-compute knot Y positions
  const knotMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const k of KNOTS) m.set(k.id, knotY(k, allStrands));
    return m;
  }, [allStrands]);

  // Build all thread segments
  const segments = useMemo(() => buildSegments(allStrands, knotMap), [allStrands, knotMap]);

  // Draw-order: strands sorted by MAGIC.C of any associated knot
  const knotsSorted = useMemo(() =>
    [...KNOTS].sort((a, b) => a.magic.C - b.magic.C), []);

  return (
    <div style={{ background:"#04060f", minHeight:"100vh", color:"#e2e8f0",
                  fontFamily:"'JetBrains Mono', 'Courier New', monospace" }}>
      {/* Header */}
      <div style={{ position:"fixed", top:0, left:0, right:0, zIndex:50,
                    background:"rgba(4,6,15,0.94)", borderBottom:"1px solid #1e2540",
                    padding:"12px 24px", display:"flex", alignItems:"center", gap:24 }}>
        <Link href="/" style={{ color:"#64748b", textDecoration:"none", fontSize:12 }}>← CHRONOS</Link>
        <span style={{ color:"#f5c518", fontSize:13, letterSpacing:4 }}>BRAID THEORY</span>
        <span style={{ color:"#334155", fontSize:11 }}>—</span>
        <span style={{ color:"#475569", fontSize:11 }}>DII Convergence Threads · Mesopotamia 6000–50 BCE</span>
        <span style={{ flex:1 }}/>
        <span style={{ color:"#334155", fontSize:10 }}>scroll →</span>
      </div>

      {/* Legend */}
      <div style={{ position:"fixed", top:44, left:0, right:0, zIndex:49,
                    background:"rgba(4,6,15,0.90)", borderBottom:"1px solid #12182e",
                    padding:"6px 24px", display:"flex", gap:20, flexWrap:"wrap" }}>
        {allStrands.map(s => (
          <span key={s.id} style={{ fontSize:10, color: hovStrand && hovStrand !== s.id ? "#1e2540" : s.color,
                                    cursor:"default", transition:"color 0.2s",
                                    display:"flex", alignItems:"center", gap:5 }}
                onMouseEnter={() => setHovStrand(s.id)}
                onMouseLeave={() => setHovStrand(null)}>
            <svg width={16} height={4}><rect y={1} width={16} height={2} fill={s.color} rx={1}/></svg>
            {s.name}
            {s.bornAt && <span style={{ color:"#334155", fontSize:9 }}> ↑ born at {KNOTS.find(k=>k.id===s.bornAt)?.name}</span>}
          </span>
        ))}
        <span style={{ flex:1 }}/>
        <span style={{ fontSize:10, color:"#334155" }}>⬡ = DII convergence knot · click to inspect</span>
      </div>

      {/* Scrollable SVG canvas */}
      <div style={{ overflowX:"auto", overflowY:"hidden",
                    marginTop:76, paddingBottom: activeKnot ? 420 : 20 }}>
        <svg width={SVG_W} height={SVG_H} style={{ display:"block" }}>
          <defs>
            {/* Glow filters for each strand color */}
            {allStrands.map(s => (
              <filter key={s.id} id={`glow-${s.id}`}>
                <feGaussianBlur stdDeviation="3" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            ))}
          </defs>

          {/* Time axis */}
          {Array.from({ length: 12 }, (_, i) => {
            const yr = -5500 + i * 500;
            const x  = toX(yr);
            return (
              <g key={yr}>
                <line x1={x} y1={PT} x2={x} y2={SVG_H - PB}
                      stroke="#0d1426" strokeWidth={1} strokeDasharray="2,6"/>
                <text x={x} y={SVG_H - PB + 16} textAnchor="middle"
                      fill="#1e2a40" fontSize={10}>{yr < 0 ? `${Math.abs(yr)} BCE` : `${yr} CE`}</text>
              </g>
            );
          })}

          {/* Thread segments — strands with low C-score drawn first */}
          {segments.map((seg, i) => {
            const dim = hovStrand && hovStrand !== seg.strandId;
            return (
              <path key={i} d={seg.d}
                    stroke={dim ? "#0f1624" : seg.color}
                    strokeWidth={dim ? 0.4 : seg.width}
                    fill="none"
                    strokeLinecap="round"
                    opacity={dim ? 0.15 : 0.82}
                    style={{ transition:"stroke 0.2s, opacity 0.2s" }}/>
            );
          })}

          {/* Knot symbols — draw low-C-score first (behind high-C) */}
          {knotsSorted.map(knot => {
            const kx  = toX(knot.year);
            const ky  = knotMap.get(knot.id) ?? SVG_H / 2;
            const dim = hovKnot && hovKnot !== knot.id && !activeKnot;
            const active = activeKnot?.id === knot.id;
            const hov  = hovKnot === knot.id;

            return (
              <g key={knot.id} style={{ cursor:"pointer" }}
                 onClick={() => setActiveKnot(active ? null : knot)}
                 onMouseEnter={() => setHovKnot(knot.id)}
                 onMouseLeave={() => setHovKnot(null)}>
                {/* Glow ring */}
                {(active || hov) && (
                  <polygon points={hexPath(kx, ky, KNOT_R + 10).replace(/M |Z| L /g, ' ').trim()}
                           fill="none" stroke="#f5c518" strokeWidth={1} opacity={0.3}/>
                )}
                {/* Contribution weight lines */}
                {knot.inputs.map(inp => {
                  const s = allStrands.find(t => t.id === inp.threadId);
                  if (!s) return null;
                  const sy = toY(s.lane);
                  return (
                    <line key={inp.threadId}
                          x1={kx - APPROACH * 0.3} y1={sy}
                          x2={kx} y2={ky}
                          stroke={s.color} strokeWidth={inp.weight * 6}
                          opacity={0.18} strokeLinecap="round"/>
                  );
                })}
                {/* Hex body */}
                <path d={hexPath(kx, ky, KNOT_R)}
                      fill={active ? "#0d1a2e" : dim ? "#060c18" : "#08102a"}
                      stroke={active ? "#f5c518" : hov ? "#94a3b8" : "#1e3060"}
                      strokeWidth={active ? 1.5 : 1}
                      opacity={dim ? 0.3 : 1}/>
                {/* Icon */}
                <text x={kx} y={ky + 5} textAnchor="middle"
                      fill={active ? "#f5c518" : dim ? "#1e2a40" : "#94a3b8"}
                      fontSize={14} style={{ pointerEvents:"none" }}>
                  {knot.icon}
                </text>
                {/* Year label */}
                <text x={kx} y={ky - KNOT_R - 8} textAnchor="middle"
                      fill={dim ? "#0d1426" : "#334155"} fontSize={9}>
                  {Math.abs(knot.year)} BCE
                </text>
                {/* Name label */}
                <text x={kx} y={ky + KNOT_R + 14} textAnchor="middle"
                      fill={active ? "#f5c518" : dim ? "#0d1426" : "#475569"} fontSize={9}>
                  {knot.name}
                </text>
                {/* Spawned thread indicator */}
                {knot.spawns && !dim && (
                  <g>
                    <circle cx={kx + KNOT_R + 6} cy={ky - KNOT_R - 2}
                            r={4} fill={knot.spawns.color} opacity={0.8}/>
                    <text x={kx + KNOT_R + 14} y={ky - KNOT_R + 1}
                          fill={knot.spawns.color} fontSize={8}>
                      +{knot.spawns.name}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Strand lane labels on left */}
          {allStrands.map(s => (
            <text key={s.id} x={toX(s.startYear) - 8} y={toY(s.lane) + 4}
                  textAnchor="end" fill={s.color} fontSize={10} opacity={0.8}>
              {s.name}
            </text>
          ))}
        </svg>
      </div>

      {/* DII Analysis Panel */}
      {activeKnot && (
        <div style={{
          position:"fixed", bottom:0, left:0, right:0, zIndex:60,
          background:"rgba(5,8,20,0.97)", borderTop:"1px solid #1e2a50",
          maxHeight:"42vh", overflowY:"auto",
          backdropFilter:"blur(8px)",
        }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:0 }}>

            {/* Col 1: Artifact */}
            <div style={{ padding:"16px 20px", borderRight:"1px solid #0f1830" }}>
              <div style={{ fontSize:9, color:"#334155", letterSpacing:3, marginBottom:8 }}>
                ARTIFACT + CARRIER CONSTRUCTION
              </div>
              <div style={{ fontSize:14, color:"#f5c518", marginBottom:4 }}>{activeKnot.name}</div>
              <div style={{ fontSize:10, color:"#64748b", marginBottom:10 }}>
                {Math.abs(activeKnot.year)} BCE · GEM: {activeKnot.gem}
              </div>
              <div style={{ fontSize:10, color:"#94a3b8", marginBottom:6, lineHeight:1.6 }}>
                <span style={{ color:"#475569" }}>Element:</span> {activeKnot.artifact.element}
              </div>
              <div style={{ fontSize:10, color:"#94a3b8", marginBottom:6, lineHeight:1.6 }}>
                <span style={{ color:"#475569" }}>Carrier:</span> {activeKnot.artifact.carrier}
              </div>
              <div style={{ margin:"8px 0", height:4, background:"#0f1624", borderRadius:2, overflow:"hidden" }}>
                <div style={{ width:`${activeKnot.artifact.complexity * 100}%`, height:"100%",
                              background:"linear-gradient(90deg, #3b82f6, #8b5cf6)", borderRadius:2 }}/>
              </div>
              <div style={{ fontSize:9, color:"#334155", marginBottom:8 }}>
                task complexity: {Math.round(activeKnot.artifact.complexity * 100)}%
              </div>
              <div style={{ fontSize:10, color:"#64748b", lineHeight:1.6 }}>
                {activeKnot.artifact.potential}
              </div>
            </div>

            {/* Col 2: Tool Use */}
            <div style={{ padding:"16px 20px", borderRight:"1px solid #0f1830" }}>
              <div style={{ fontSize:9, color:"#334155", letterSpacing:3, marginBottom:8 }}>
                TOOL USE + IDEOLOGY STRAND
              </div>
              <div style={{ fontSize:10, color:"#f97316", marginBottom:8, lineHeight:1.6 }}>
                {activeKnot.toolUse.ideology}
              </div>
              <div style={{ fontSize:10, color:"#94a3b8", marginBottom:10, lineHeight:1.6 }}>
                <span style={{ color:"#475569" }}>Intentional shape:</span><br/>
                {activeKnot.toolUse.intentionalShape}
              </div>
              <div style={{ fontSize:9, color:"#334155", marginBottom:4 }}>TOOLS REQUIRED</div>
              {activeKnot.toolUse.tools.map((t, i) => (
                <div key={i} style={{ fontSize:9, color:"#475569", padding:"2px 0",
                                      borderBottom:"1px solid #0d1426", lineHeight:1.5 }}>
                  · {t}
                </div>
              ))}
              {activeKnot.toolUse.prerequisite && (
                <div style={{ marginTop:10, fontSize:9, color:"#22c55e" }}>
                  ↗ prerequisite convergence: {KNOTS.find(k => k.id === activeKnot.toolUse.prerequisite)?.name}
                </div>
              )}
            </div>

            {/* Col 3: DII Analysis */}
            <div style={{ padding:"16px 20px", borderRight:"1px solid #0f1830" }}>
              <div style={{ fontSize:9, color:"#334155", letterSpacing:3, marginBottom:8 }}>
                DII — F(ge) FORMULA
              </div>
              {[
                { label:"Primitive",  val: activeKnot.dii.primitive },
                { label:"Motion",     val: activeKnot.dii.motion },
                { label:"Duration",   val: activeKnot.dii.duration },
                { label:"Vector",     val: activeKnot.dii.vector },
              ].map(row => (
                <div key={row.label} style={{ marginBottom:8 }}>
                  <div style={{ fontSize:9, color:"#334155", letterSpacing:2 }}>{row.label}</div>
                  <div style={{ fontSize:10, color:"#94a3b8", lineHeight:1.5 }}>{row.val}</div>
                </div>
              ))}
              <div style={{ marginTop:10, padding:"8px", background:"#060d1f",
                            border:"1px solid #1e2a50", borderRadius:4, fontSize:10,
                            color:"#f5c518", lineHeight:1.6 }}>
                F(ge): {activeKnot.dii.fGe}
              </div>
            </div>

            {/* Col 4: Contribution + MAGIC */}
            <div style={{ padding:"16px 20px" }}>
              <div style={{ fontSize:9, color:"#334155", letterSpacing:3, marginBottom:8 }}>
                CONVERGENCE RATIO + MAGIC
              </div>
              {/* Input weight bars */}
              {activeKnot.inputs.map(inp => {
                const s = allStrands.find(t => t.id === inp.threadId);
                return s ? (
                  <div key={inp.threadId} style={{ marginBottom:6 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:9,
                                  color: s.color, marginBottom:2 }}>
                      <span>{s.name}</span>
                      <span>{Math.round(inp.weight * 100)}%</span>
                    </div>
                    <div style={{ height:3, background:"#0a1020", borderRadius:2, overflow:"hidden" }}>
                      <div style={{ width:`${inp.weight * 100}%`, height:"100%",
                                    background:s.color, borderRadius:2 }}/>
                    </div>
                  </div>
                ) : null;
              })}
              <div style={{ fontSize:9, color:"#64748b", lineHeight:1.6, marginTop:8, marginBottom:12 }}>
                {activeKnot.contribution}
              </div>
              {/* MAGIC profile */}
              <div style={{ fontSize:9, color:"#334155", letterSpacing:3, marginBottom:6 }}>
                MAGIC PROFILE
              </div>
              {MAGIC_KEYS.map(k => (
                <div key={k} style={{ marginBottom:4 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:8, color:"#334155" }}>
                    <span>{MAGIC_LABELS[k]}</span>
                    <span>{Math.round(activeKnot.magic[k] * 100)}</span>
                  </div>
                  <div style={{ height:2, background:"#080f1e", borderRadius:1, overflow:"hidden" }}>
                    <div style={{ width:`${activeKnot.magic[k] * 100}%`, height:"100%",
                                  background: MAGIC_COLORS[k], borderRadius:1 }}/>
                  </div>
                </div>
              ))}
              {activeKnot.spawns && (
                <div style={{ marginTop:10, padding:"6px 8px", background:"#060d1f",
                              border:`1px solid ${activeKnot.spawns.color}33`, borderRadius:3 }}>
                  <div style={{ fontSize:9, color:activeKnot.spawns.color }}>
                    ✦ spawns new thread: {activeKnot.spawns.name}
                  </div>
                  <div style={{ fontSize:9, color:"#334155", marginTop:2 }}>
                    This convergence creates a capability that did not exist before and cannot be reduced to its inputs.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Close strip */}
          <div onClick={() => setActiveKnot(null)}
               style={{ textAlign:"center", padding:"6px", fontSize:9, color:"#334155",
                        cursor:"pointer", borderTop:"1px solid #0f1830" }}
               onMouseEnter={e => (e.currentTarget.style.color = "#64748b")}
               onMouseLeave={e => (e.currentTarget.style.color = "#334155")}>
            ▼ close panel
          </div>
        </div>
      )}
    </div>
  );
}
