import { useState, useMemo } from "react";
import { Link } from "wouter";

// ── Coordinate system ──────────────────────────────────────────────────────────
const T0    = -5900;
const T1    = -50;
const TSPAN = T1 - T0;
const SVG_W = 5200;
const SVG_H = 620;
const PL = 170, PR = 120, PT = 96, PB = 80;
const PW  = SVG_W - PL - PR;
const PH  = SVG_H - PT - PB;
const N_LANES  = 9;
const APPROACH = 110;
const KNOT_R   = 22;

// MAGIC scale: 0.0–2.0
// G is the center (always present, instantiative). M A I C form 4 axes.
// GECD = the ruler. MAGIC = the reading the ruler produces.
const MAGIC_MAX = 2.0;

const toX = (yr: number) => PL + ((yr - T0) / TSPAN) * PW;
const toY = (lane: number) => PT + (lane / (N_LANES - 1)) * PH;

// ── Types ──────────────────────────────────────────────────────────────────────
interface Strand {
  id: string; name: string; color: string;
  lane: number; startYear: number; endYear: number;
  bornAt?: string; phi: number;
}

interface KnotInput  { threadId: string; weight: number }
interface KnotOutput { threadId: string }

// MAGIC: G is NOT scored as an axis — it is the center point.
// M, A, I, C form the 4-vertex quadrilateral. Their delta = Insight. Magnitude = Ingenuity.
interface MagicReading { M: number; A: number; I: number; C: number }

interface Knot {
  id: string; year: number; name: string; gem: string; icon: string;
  inputs:  KnotInput[];
  outputs: KnotOutput[];
  spawns?: Strand;
  // GECD config → produces the MAGIC reading
  gecd: {
    element:     string;   // GEA.Sh or GEM
    carrier:     string;   // what it's instantiated in
    dimension:   string;   // dimensional complexity
    complexity:  number;   // task complexity 0–1
    potential:   string;
  };
  toolUse: {
    ideology:         string;
    intentionalShape: string;
    tools:            string[];
    prerequisite:     string | null;
  };
  dii: {
    primitive: string; motion: string;
    duration:  string; vector: string; fGe: string;
  };
  contribution: string;
  magic: MagicReading;  // 0.0–2.0 per axis; G is center (implied, unlabeled axis)
  geLabel: string;      // human-readable G description (geometric element present)
}

// ── Terminology (locked) ───────────────────────────────────────────────────────
// Creative Act   = choice / novel instantiation (first-level)
// Insight        = MAGIC change detected across ≥2 instantiations (delta between quads)
// Ingenuity      = magnitude of that insight (Euclidean distance of MAGIC delta / MAGIC_MAX)
// Discovery      = insight (it can only be an idea)
// Innovation     = domain-specific delta
// Invention      = emergent ingenuity

// ── Strands ────────────────────────────────────────────────────────────────────
const BASE_STRANDS: Strand[] = [
  { id:"geo",  name:"Geometry",    color:"#f5c518", lane:0,   startYear:-6000, endYear:-50, phi:0.0 },
  { id:"cos",  name:"Cosmos",      color:"#8b5cf6", lane:1.5, startYear:-5000, endYear:-50, phi:1.2 },
  { id:"mat",  name:"Matter",      color:"#c47c3f", lane:3.0, startYear:-6000, endYear:-50, phi:0.7 },
  { id:"crf",  name:"Craft/Tool",  color:"#22c55e", lane:4.5, startYear:-6000, endYear:-50, phi:2.1 },
  { id:"num",  name:"Number",      color:"#3b82f6", lane:6.0, startYear:-5500, endYear:-50, phi:1.7 },
  { id:"pow",  name:"Power",       color:"#ef4444", lane:7.5, startYear:-5200, endYear:-50, phi:0.4 },
];

// ── DII Convergence Knots (Creative Acts) ─────────────────────────────────────
// MAGIC scale 0.0–2.0:
//   0.0–0.9  accessory (present but not causal)
//   1.0–1.3  required + co-dependent
//   1.4–1.7  required + partially independent
//   1.8–2.0  dominant driver
const KNOTS: Knot[] = [
  {
    id:"halaf", year:-5500, name:"Halaf Spiral Pottery", gem:"Spiral", icon:"◉",
    inputs:  [{ threadId:"geo", weight:0.40 },{ threadId:"mat", weight:0.30 },{ threadId:"crf", weight:0.30 }],
    outputs: [{ threadId:"geo" },{ threadId:"mat" },{ threadId:"crf" }],
    spawns: { id:"aes", name:"Aesthetic Code", color:"#f97316", lane:1.2,
              startYear:-5500, endYear:-50, phi:0.9, bornAt:"halaf" },
    gecd: {
      element:    "Spiral (GEM — Tiamat variant)",
      carrier:    "Painted polychrome clay vessel",
      dimension:  "2D surface → 3D vessel (solid of revolution)",
      complexity: 0.35,
      potential:  "Encodes natural growth patterns in durable ceramic. Geometry becomes cultural carrier — shape outlasts the maker.",
    },
    toolUse: {
      ideology:         "Aesthetic-cosmic order: spiral = cyclical time, organic growth. Geometry as world-model.",
      intentionalShape: "Spiral is NOT accidental. Sustained radial attention during coiling reveals intent to encode non-utilitarian meaning in a utilitarian object.",
      tools:            ["Slow tournette (hand rotation)", "Multi-pigment ochre brushes", "Open-fire or pit kiln"],
      prerequisite:     null,
    },
    dii: {
      primitive: "Curve",
      motion:    "Rotation (sustained radial sweep outward from center)",
      duration:  "Full single-axis",
      vector:    "Vertical axis through the center of the wet clay mass",
      fGe:       "Curve + Rotation + Full(1-axis) → Vessel. A solid of revolution that is simultaneously an aesthetic argument.",
    },
    contribution: "Geometry (40%) supplies the spiral template from natural observation. Matter (30%) is the clay medium that retains form after firing. Craft (30%) is the hand-skill to execute radial motion at ceramic scale.",
    magic: { M:0.4, A:1.8, I:0.3, C:0.2 },
    geLabel: "G: Spiral (rotation of curve around vertical axis)",
  },
  {
    id:"cylinder-seal", year:-3500, name:"Cylinder Seal", gem:"Circle", icon:"⊛",
    inputs:  [{ threadId:"geo", weight:0.35 },{ threadId:"pow", weight:0.35 },{ threadId:"crf", weight:0.20 },{ threadId:"aes", weight:0.10 }],
    outputs: [{ threadId:"geo" },{ threadId:"pow" },{ threadId:"crf" },{ threadId:"aes" }],
    spawns: { id:"tok", name:"Identity Token", color:"#06b6d4", lane:6.8,
              startYear:-3500, endYear:-50, phi:1.5, bornAt:"cylinder-seal" },
    gecd: {
      element:    "Circle (GEM — cylinder cross-section)",
      carrier:    "Carved hardstone cylinder; clay impression",
      dimension:  "3D cylinder → 2D continuous frieze",
      complexity: 0.65,
      potential:  "Geometric authentication at institutional scale. Enables trust without physical presence — the first cryptographic signature.",
    },
    toolUse: {
      ideology:         "Comptroller-power: geometry as authentication. The circle guarantees because it can be perfectly and infinitely reproduced.",
      intentionalShape: "Cylinder CHOSEN precisely because rolling produces a continuous, unbreakable frieze. A flat seal makes a finite stamp. A cylinder makes an infinite, unforgeable border.",
      tools:            ["Hardstone drill (copper or flint)", "Rotary bow drill", "Abrasive (emery sand)"],
      prerequisite:     null,
    },
    dii: {
      primitive: "Circle",
      motion:    "Translation (linear rolling across clay surface)",
      duration:  "Full single-axis",
      vector:    "Horizontal axis along the clay surface — rolling direction",
      fGe:       "Circle + Linear-Translation + Full(1-axis) → Continuous Frieze. The circle's revolution maps one-to-one onto a linear authority record.",
    },
    contribution: "Geometry (35%) defines the cylinder-circle relationship. Power (35%) is the institutional need demanding authentication. Craft (20%) executes miniature carving. Aesthetic Code (10%) encodes mythological narrative.",
    magic: { M:0.6, A:1.6, I:1.8, C:1.8 },
    geLabel: "G: Circle (cylinder cross-section rolling through translation)",
  },
  {
    id:"cuneiform", year:-3200, name:"Cuneiform Writing", gem:"Triangle", icon:"𒀭",
    inputs:  [{ threadId:"num", weight:0.40 },{ threadId:"mat", weight:0.30 },{ threadId:"geo", weight:0.30 }],
    outputs: [{ threadId:"num" },{ threadId:"mat" },{ threadId:"geo" }],
    spawns: { id:"ins", name:"Inscription", color:"#e879f9", lane:5.4,
              startYear:-3200, endYear:-50, phi:2.3, bornAt:"cuneiform" },
    gecd: {
      element:    "Triangle / wedge (GEA.Sh — angle with force vector)",
      carrier:    "Reed stylus impressed into wet clay tablet",
      dimension:  "1D point force → 2D mark array → 3D tablet archive",
      complexity: 0.55,
      potential:  "Externalizes number and sound into persistent material form. Thought becomes object. Abstraction escapes oral transmission.",
    },
    toolUse: {
      ideology:         "Inscriptive authority: what is pressed in clay is legally binding. Triangle = compressed force = act of legal recording.",
      intentionalShape: "The wedge is NOT arbitrary. The reed's cut end IS naturally triangular. Material geometry dictated script geometry — tool forced the form.",
      tools:            ["Trimmed reed stylus (cut at 45°)", "Wet alluvial clay tablets", "Drying rack or kiln"],
      prerequisite:     null,
    },
    dii: {
      primitive: "Triangle (wedge — the cross-section of the reed tip)",
      motion:    "Linear pressure (punch into clay surface, instantaneous)",
      duration:  "Zero / frozen",
      vector:    "Perpendicular to clay surface; angled to produce the wedge shadow",
      fGe:       "Triangle + Puncture + Zero-duration → Wedge Mark. A sign is a triangle arrested at the moment of maximum force.",
    },
    contribution: "Number (40%) is the accounting need that motivates the invention. Matter (30%) supplies clay — cuneiform is impossible without wet alluvial silt. Geometry (30%) provides the triangular wedge logic that enables systematic replication.",
    magic: { M:1.2, A:0.3, I:1.9, C:1.9 },
    geLabel: "G: Triangle (wedge — frozen angle of reed under pressure)",
  },
  {
    id:"sexagesimal", year:-3000, name:"Sexagesimal System", gem:"Rosette/Circle", icon:"⬡",
    inputs:  [{ threadId:"geo", weight:0.45 },{ threadId:"cos", weight:0.35 },{ threadId:"num", weight:0.20 }],
    outputs: [{ threadId:"geo" },{ threadId:"cos" },{ threadId:"num" }],
    spawns: { id:"b60", name:"Base-60 Math", color:"#fbbf24", lane:3.8,
              startYear:-3000, endYear:-50, phi:1.0, bornAt:"sexagesimal" },
    gecd: {
      element:    "6-fold Rosette (GEM — 6 equilateral triangles inside a circle)",
      carrier:    "Mathematical notation; astronomical tables; calendar",
      dimension:  "2D geometric proof → abstract number system",
      complexity: 0.78,
      potential:  "Six equilateral triangles tile a circle exactly. This creates 360°, the 60-min hour, 60-sec minute. Still governing global timekeeping 5,000 years later.",
    },
    toolUse: {
      ideology:         "Mathematical-cosmic: geometry as the foundation of numerical structure. Base-60 is NOT arbitrary — it is geometrically inevitable from 6-fold circular symmetry.",
      intentionalShape: "Rosette chosen because 6-equilateral-triangle tiling is uniquely perfect: only regular configuration where triangles tile a circle with integer count. 4-fold fails, 3-fold fails. 6-fold succeeds.",
      tools:            ["Rope-and-peg compass", "Sand or clay drawing surface", "Stellar transit observations for calibration"],
      prerequisite:     "halaf",
    },
    dii: {
      primitive: "Circle + equilateral Triangle (×6)",
      motion:    "Rotation (6-fold radial symmetry — 6 × 60° = 360°)",
      duration:  "Full all-axes",
      vector:    "6 equal angular divisions; each triangle vertex is a directional anchor",
      fGe:       "Circle × 6-Triangle + Radial-Rotation + Full-all-axes → Rosette → 360° → Base-60. Geometry precedes arithmetic.",
    },
    contribution: "Geometry (45%) discovers that 6 equilateral triangles tile a circle exactly — the mathematical fact. Cosmos (35%) supplies the astronomical need (year/month/day cycles) demanding a highly divisible base. Number (20%) is the formal system that adopts and propagates it.",
    magic: { M:1.9, A:0.2, I:1.2, C:1.1 },
    geLabel: "G: Rosette (6-fold rotational completion of equilateral triangles in circle)",
  },
  {
    id:"ziggurat", year:-2100, name:"Ziggurat of Ur", gem:"Pyramid", icon:"△",
    inputs:  [{ threadId:"pow", weight:0.35 },{ threadId:"geo", weight:0.30 },{ threadId:"mat", weight:0.25 },{ threadId:"b60", weight:0.10 }],
    outputs: [{ threadId:"pow" },{ threadId:"geo" },{ threadId:"mat" },{ threadId:"b60" }],
    gecd: {
      element:    "Pyramid, stepped (GEM — Marduk variant; discrete solid of revolution)",
      carrier:    "Fired mud brick (plano-convex); bitumen mortar",
      dimension:  "2D brick rectangle → 3D stepped pyramid",
      complexity: 0.85,
      potential:  "Encodes political hierarchy in three-dimensional space. Each terrace is an administrative stratum made architectural. Geometry as institutional grammar.",
    },
    toolUse: {
      ideology:         "Institutional-geometric: the pyramid makes power VISIBLE across a flat alluvial landscape. Geometry as political broadcast — hierarchy readable from a distance.",
      intentionalShape: "Stepped form is NOT a failed true pyramid. Each step is an administrative boundary made architectural. The stepped geometry encodes the bureaucracy.",
      tools:            ["Mud brick molds (plano-convex, standardized)", "Level ropes and plumb bobs", "Earth-ramp construction", "Bitumen mortar"],
      prerequisite:     "cylinder-seal",
    },
    dii: {
      primitive: "Rectangle (brick) + Triangle (elevation profile)",
      motion:    "Stacking — translation along Z-axis, layer by layer",
      duration:  "Full single-axis",
      vector:    "Vertical axis; each terrace is a horizontal cross-section of the pyramid solid",
      fGe:       "Rectangle(brick) × Z-Stacking + Full(1-axis) → Stepped Pyramid. A discrete solid of revolution built from modular standardized units.",
    },
    contribution: "Power (35%) provides institutional will and mobilizes labor. Geometry (30%) provides pyramid profile and brick layout calculations. Matter (25%) is standardized fired brick enabling modular large-scale construction. Base-60 (10%) supplies the proportioning mathematics for terrace ratios.",
    magic: { M:1.6, A:1.8, I:2.0, C:1.2 },
    geLabel: "G: Pyramid (Z-axis stacking of rectangles; stepped solid of revolution)",
  },
  {
    id:"plimpton", year:-1800, name:"Plimpton 322", gem:"Triangle", icon:"⊿",
    inputs:  [{ threadId:"b60", weight:0.50 },{ threadId:"geo", weight:0.35 },{ threadId:"num", weight:0.15 }],
    outputs: [{ threadId:"b60" },{ threadId:"geo" },{ threadId:"num" }],
    spawns: { id:"alg", name:"Algebraic Geometry", color:"#34d399", lane:2.5,
              startYear:-1800, endYear:-50, phi:1.3, bornAt:"plimpton" },
    gecd: {
      element:    "Right Triangle (GEA.Sh — the only triangle with integer-ratio sides)",
      carrier:    "Clay tablet; 15 rows × 4 columns in sexagesimal notation",
      dimension:  "2D triangle → abstract ratio table",
      complexity: 0.92,
      potential:  "1,800 years before Pythagoras. Algebraic solution of quadratic equations via geometric cut-and-paste. Enables accurate surveying, canal design, monumental layout.",
    },
    toolUse: {
      ideology:         "Mathematical precision: triangle as ratio machine. Right angle = cosmic guarantee of squareness in a constructed world.",
      intentionalShape: "Right triangle specifically chosen — ONLY triangle producing integer-ratio solutions (3-4-5, 5-12-13, 8-15-17). Deliberately systematic: a generated list, not random collection.",
      tools:            ["Reed stylus (cuneiform)", "Multiplication and reciprocal tables", "Clay tablet"],
      prerequisite:     "sexagesimal",
    },
    dii: {
      primitive: "Right Triangle",
      motion:    "None — static ratio analysis (no motion required)",
      duration:  "Zero — relationships extracted, not generated by motion",
      vector:    "Hypotenuse as primary direction; perpendicular legs define orthogonal space",
      fGe:       "Right-Triangle + No-motion + Zero-duration → Pythagorean Triples. The triangle is a ratio extractor, not a motion generator.",
    },
    contribution: "Base-60 (50%) is the number system making the ratios expressible as clean sexagesimal fractions. Geometry (35%) identifies the right-triangle constraint that generates the triples. Number (15%) supplies the systematic tabular format — this IS a generated sequence.",
    magic: { M:1.95, A:0.2, I:0.7, C:0.4 },
    geLabel: "G: Right Triangle (static — ratio extraction without motion)",
  },
  {
    id:"hammurabi", year:-1754, name:"Code of Hammurabi", gem:"Stele/Triangle", icon:"⚖",
    inputs:  [{ threadId:"ins", weight:0.40 },{ threadId:"pow", weight:0.40 },{ threadId:"tok", weight:0.20 }],
    outputs: [{ threadId:"ins" },{ threadId:"pow" },{ threadId:"tok" }],
    gecd: {
      element:    "Stele — Triangle (apex) + Rectangle (body)",
      carrier:    "Black diorite stone; 2.25m high; 282 laws in cuneiform columns",
      dimension:  "2D geometric composition → 3D permanent monument",
      complexity: 0.82,
      potential:  "First comprehensive legal code. The geometry of the stele encodes the theological justification of the law. Form IS argument: divine authority (apex) radiates into human law (body).",
    },
    toolUse: {
      ideology:         "Legal-geometric: the stele's triangular apex places Shamash at the top — divine authority radiates downward through the rectangular text body. Geometry as theological proof.",
      intentionalShape: "Triangle (apex) = divine origin. Rectangle (body) = human application. The geometric transition from triangle to rectangle IS the argument: 'this law descends from heaven'.",
      tools:            ["Iron/bronze chisels (hardstone cutting)", "Polishing stones", "Professional scribes (edubba school)"],
      prerequisite:     "cuneiform",
    },
    dii: {
      primitive: "Triangle (stele apex) + Rectangle (text body)",
      motion:    "Linear inscription — horizontal text rows, top to bottom",
      duration:  "Full single-axis — complete column coverage",
      vector:    "Top-to-bottom; Shamash at apex radiates authority downward through text",
      fGe:       "Stele(Triangle+Rectangle) + Linear-Inscription + Full → Permanent Legal Text. Authority frozen in the hardest available stone.",
    },
    contribution: "Inscription (40%) is the writing system that makes 282 laws expressible and reproducible. Power (40%) is Babylonian imperial authority commissioning and enforcing. Identity-Token (20%) — the cylinder seal system pre-established the logic of authenticated geometric identity.",
    magic: { M:0.4, A:1.4, I:2.0, C:1.9 },
    geLabel: "G: Stele composite (Triangle apex → Rectangle body; linear inscription)",
  },
  {
    id:"antikythera", year:-100, name:"Antikythera Mechanism", gem:"Circle/Gear", icon:"⚙",
    inputs:  [{ threadId:"cos", weight:0.35 },{ threadId:"b60", weight:0.30 },{ threadId:"alg", weight:0.20 },{ threadId:"crf", weight:0.15 }],
    outputs: [{ threadId:"cos" },{ threadId:"b60" },{ threadId:"alg" },{ threadId:"crf" }],
    gecd: {
      element:    "Circle (GEM — gear; circle with teeth)",
      carrier:    "37 bronze gears in a wooden case; 82 surviving fragments",
      dimension:  "2D circle → 3D gear-train → 4D temporal prediction",
      complexity: 0.98,
      potential:  "First known analog computer. 37 interlocking circles encode eclipse prediction, planetary positions, Olympiad calendar. Geometric ratio IS the computation.",
    },
    toolUse: {
      ideology:         "Mathematical-astronomical: gear ratio = ratio of circles = astronomical ratio. Base-60 mathematics applied to gear teeth. Number becomes self-operating mechanism.",
      intentionalShape: "Circle REQUIRED: only a circle produces constant angular velocity at contact. Square or triangle → variable speed → useless for ratio computation. The circle is the only figure enabling the machine.",
      tools:            ["Precision bronze casting and filing", "Gear-tooth cutting templates", "Astronomical tables (sexagesimal)", "Miniaturization technique (unknown method)"],
      prerequisite:     "sexagesimal",
    },
    dii: {
      primitive: "Circle (gear)",
      motion:    "Interlocking rotation — gear-ratio transmission of angular velocity",
      duration:  "∞−1 (sphere with symmetry memory — continuous, cyclical, ratio-preserving)",
      vector:    "Rotational axis per gear; ratio defined by tooth count; vector ENCODES the astronomical period",
      fGe:       "Circle(A) × Circle(B) + Interlocked-Rotation + ∞-1 → Ratio Machine. Two touching circles IS the computation; their circumference ratio IS the answer.",
    },
    contribution: "Cosmos (35%) provides the astronomical periods the mechanism must encode. Base-60 (30%) supplies the number system making periods expressible as gear ratios. Algebraic Geometry (20%) provides right-triangle ratio mathematics for gear tooth engineering. Craft (15%) executes miniature bronze work at precision not re-achieved for 1,400 years.",
    magic: { M:1.95, A:0.7, I:0.5, C:0.4 },
    geLabel: "G: Circle/gear (interlocked rotation; ∞-1 duration; ratio transmission)",
  },
];

// ── Path helpers ───────────────────────────────────────────────────────────────
function catmull(pts: [number,number][]): string {
  if (pts.length < 2) return "";
  const d: string[] = [`M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i], p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6, cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6, cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d.push(`C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)} ${cp2x.toFixed(1)} ${cp2y.toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`);
  }
  return d.join(" ");
}

function threadPath(
  x0: number, y0: number, x1: number, y1: number,
  phi: number, yr0: number, yr1: number,
): string {
  if (x1 <= x0) return "";
  const STEP = 16;
  const pts: [number,number][] = [];
  for (let x = x0; x <= x1; x += STEP) {
    const t  = (x - x0) / (x1 - x0);
    const s  = t * t * (3 - 2 * t);
    const by = y0 + s * (y1 - y0);
    const edgeDist = Math.min(x - x0, x1 - x);
    const fade = Math.min(edgeDist / 80, 1);
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

// ── Knot Y (weighted centroid of input thread lanes) ───────────────────────────
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

function buildSegments(allStrands: Strand[], knotMap: Map<string,number>): Segment[] {
  const segs: Segment[] = [];
  const sortedKnots = [...KNOTS].sort((a, b) => a.year - b.year);

  for (const strand of allStrands) {
    const baseY  = toY(strand.lane);
    const startX = toX(strand.startYear);
    const endX   = toX(strand.endYear);

    const myKnots = sortedKnots.filter(k =>
      k.inputs.some(inp => inp.threadId === strand.id) &&
      k.year >= strand.startYear && k.year <= strand.endYear
    );

    let cursor = startX, cursorYr = strand.startYear;

    for (const knot of myKnots) {
      const kx  = toX(knot.year);
      const ky  = knotMap.get(knot.id) ?? baseY;
      const inp = knot.inputs.find(i => i.threadId === strand.id);
      const w   = inp ? inp.weight * 4 + 0.8 : 1.2;

      const approachStart = kx - APPROACH;
      if (approachStart > cursor + 4) {
        segs.push({ d: threadPath(cursor, baseY, approachStart, baseY, strand.phi, cursorYr, knot.year - 200), color: strand.color, width: 1.4, strandId: strand.id });
      }
      segs.push({ d: threadPath(approachStart, baseY, kx, ky, strand.phi, knot.year - 200, knot.year), color: strand.color, width: w, strandId: strand.id });
      const approachEnd = kx + APPROACH;
      segs.push({ d: threadPath(kx, ky, approachEnd, baseY, strand.phi, knot.year, knot.year + 200), color: strand.color, width: w, strandId: strand.id });
      cursor = approachEnd; cursorYr = knot.year + 200;
    }
    if (cursor < endX - 4) {
      segs.push({ d: threadPath(cursor, baseY, endX, baseY, strand.phi, cursorYr, strand.endYear), color: strand.color, width: 1.4, strandId: strand.id });
    }
  }
  return segs;
}

// ── Ingenuity = magnitude of MAGIC delta between two knots ─────────────────────
function ingenuity(a: MagicReading, b: MagicReading): number {
  // Euclidean distance in 4D MAGIC space, normalized to [0,1]
  // Max possible distance: all 4 axes change by MAGIC_MAX → sqrt(4 × MAGIC_MAX²) = 2×MAGIC_MAX
  const d = Math.sqrt((a.M-b.M)**2 + (a.A-b.A)**2 + (a.I-b.I)**2 + (a.C-b.C)**2);
  return d / (2 * MAGIC_MAX);
}

// ── MAGIC Quadrilateral (G at center, MAIC as 4 axes, 0–2 scale) ──────────────
function MagicQuad({
  magic, prev, size = 90,
}: {
  magic: MagicReading; prev?: MagicReading; size?: number;
}) {
  const cx = size / 2, cy = size / 2, r = size / 2 - 10;
  const axes = [
    { k: "M" as const, angle: -Math.PI / 2, color: "#3b82f6" },
    { k: "A" as const, angle: 0,            color: "#f97316" },
    { k: "I" as const, angle: Math.PI / 2,  color: "#8b5cf6" },
    { k: "C" as const, angle: Math.PI,      color: "#ef4444" },
  ];
  const pt = (val: number, angle: number): [number,number] => [
    cx + (val / MAGIC_MAX) * r * Math.cos(angle),
    cy + (val / MAGIC_MAX) * r * Math.sin(angle),
  ];
  const poly = (m: MagicReading) =>
    axes.map(a => pt(m[a.k], a.angle).join(",")).join(" ");

  return (
    <svg width={size} height={size} style={{ display:"block" }}>
      {/* Grid rings at 0.5, 1.0, 1.5, 2.0 */}
      {[0.5, 1.0, 1.5, 2.0].map(v => {
        const pts2 = axes.map(a => pt(v, a.angle).join(",")).join(" ");
        return <polygon key={v} points={pts2} fill="none" stroke="#0d1830"
                        strokeWidth={v === 1.0 ? 0.8 : 0.4} strokeDasharray={v===1.0?"":"3,3"}/>;
      })}
      {/* Axis spokes */}
      {axes.map(a => {
        const [x2, y2] = pt(MAGIC_MAX, a.angle);
        return <line key={a.k} x1={cx} y1={cy} x2={x2} y2={y2} stroke="#1a2540" strokeWidth={0.5}/>;
      })}
      {/* Previous quadrilateral (insight delta shown in grey) */}
      {prev && <polygon points={poly(prev)} fill="none" stroke="#334155"
                        strokeWidth={0.7} strokeDasharray="2,2" opacity={0.5}/>}
      {/* Current quadrilateral */}
      <polygon points={poly(magic)} fill="#f5c51815" stroke="#f5c518" strokeWidth={1.3} opacity={0.9}/>
      {/* Axis endpoint markers */}
      {axes.map(a => {
        const [x2, y2] = pt(magic[a.k], a.angle);
        return <circle key={a.k} cx={x2} cy={y2} r={2.5} fill={a.color}/>;
      })}
      {/* G center dot (always present — makes measurement possible) */}
      <circle cx={cx} cy={cy} r={3.5} fill="#f5c518" opacity={0.8}/>
      {/* Axis labels */}
      {axes.map(a => {
        const [x2, y2] = pt(2.35, a.angle);
        return <text key={a.k} x={x2} y={y2 + 3.5} textAnchor="middle"
                     fill={a.color} fontSize={8} fontWeight="bold">{a.k}</text>;
      })}
      {/* G label */}
      <text x={cx + 5} y={cy - 5} fill="#f5c518" fontSize={7} opacity={0.7}>G</text>
    </svg>
  );
}

// ── MAGIC constants ────────────────────────────────────────────────────────────
const MAGIC_KEYS   = ["M","A","I","C"] as const;
const MAGIC_LABELS = { M:"Math", A:"Aesthetic", I:"Institution", C:"Comptroller" };
const MAGIC_COLORS = { M:"#3b82f6", A:"#f97316", I:"#8b5cf6", C:"#ef4444" };

function magicLabel(v: number): string {
  if (v < 0.5)  return "accessory";
  if (v < 1.0)  return "near-codependent";
  if (v < 1.35) return "required + co-dependent";
  if (v < 1.75) return "required + partial indep.";
  return "dominant driver";
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function Braid() {
  const [activeKnot, setActiveKnot] = useState<Knot | null>(null);
  const [hovKnot,    setHovKnot]    = useState<string | null>(null);
  const [hovStrand,  setHovStrand]  = useState<string | null>(null);

  const allStrands = useMemo<Strand[]>(() => {
    const extra = KNOTS.filter(k => k.spawns).map(k => k.spawns as Strand);
    return [...BASE_STRANDS, ...extra];
  }, []);

  const knotMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const k of KNOTS) m.set(k.id, knotY(k, allStrands));
    return m;
  }, [allStrands]);

  const segments = useMemo(() => buildSegments(allStrands, knotMap), [allStrands, knotMap]);

  const sortedKnots = useMemo(() =>
    [...KNOTS].sort((a, b) => a.magic.C - b.magic.C), []);

  // Chronological order for "previous knot" (insight computation)
  const chronoKnots = useMemo(() =>
    [...KNOTS].sort((a, b) => a.year - b.year), []);

  const prevKnot = useMemo(() => {
    if (!activeKnot) return null;
    const idx = chronoKnots.findIndex(k => k.id === activeKnot.id);
    return idx > 0 ? chronoKnots[idx - 1] : null;
  }, [activeKnot, chronoKnots]);

  const ingenuityScore = useMemo(() => {
    if (!activeKnot || !prevKnot) return null;
    return ingenuity(prevKnot.magic, activeKnot.magic);
  }, [activeKnot, prevKnot]);

  return (
    <div style={{ background:"#04060f", minHeight:"100vh", color:"#e2e8f0",
                  fontFamily:"'JetBrains Mono','Courier New',monospace" }}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div style={{ position:"fixed", top:0, left:0, right:0, zIndex:50,
                    background:"rgba(4,6,15,0.94)", borderBottom:"1px solid #1e2540",
                    padding:"11px 24px", display:"flex", alignItems:"center", gap:20 }}>
        <Link href="/" style={{ color:"#64748b", textDecoration:"none", fontSize:12 }}>← CHRONOS</Link>
        <span style={{ color:"#f5c518", fontSize:13, letterSpacing:4 }}>BRAID THEORY</span>
        <span style={{ color:"#334155", fontSize:10 }}>—</span>
        <span style={{ color:"#475569", fontSize:10 }}>DII Convergence Threads · Creative Acts · Mesopotamia 6000–50 BCE</span>
        <span style={{ flex:1 }}/>
        <span style={{ color:"#1e2a40", fontSize:9 }}>GECD = ruler · MAGIC = reading · scroll →</span>
      </div>

      {/* ── Legend ─────────────────────────────────────────────────────── */}
      <div style={{ position:"fixed", top:42, left:0, right:0, zIndex:49,
                    background:"rgba(4,6,15,0.90)", borderBottom:"1px solid #0e1528",
                    padding:"5px 24px", display:"flex", gap:18, flexWrap:"wrap", alignItems:"center" }}>
        {allStrands.map(s => (
          <span key={s.id}
                style={{ fontSize:10, color: hovStrand && hovStrand !== s.id ? "#12182e" : s.color,
                         cursor:"default", transition:"color 0.2s",
                         display:"flex", alignItems:"center", gap:5 }}
                onMouseEnter={() => setHovStrand(s.id)}
                onMouseLeave={() => setHovStrand(null)}>
            <svg width={16} height={4}><rect y={1} width={16} height={2} fill={s.color} rx={1}/></svg>
            {s.name}
            {s.bornAt && (
              <span style={{ color:"#1e2a40", fontSize:8 }}>
                ↑{KNOTS.find(k=>k.id===s.bornAt)?.name.split(" ")[0]}
              </span>
            )}
          </span>
        ))}
        <span style={{ flex:1 }}/>
        <span style={{ fontSize:9, color:"#1e2a40" }}>⬡ = creative act · click to inspect DII</span>
      </div>

      {/* ── SVG canvas ─────────────────────────────────────────────────── */}
      <div style={{ overflowX:"auto", overflowY:"hidden",
                    marginTop:72, paddingBottom: activeKnot ? 440 : 20 }}>
        <svg width={SVG_W} height={SVG_H} style={{ display:"block" }}>

          {/* Time axis */}
          {Array.from({ length: 12 }, (_, i) => {
            const yr = -5500 + i * 500;
            const x  = toX(yr);
            return (
              <g key={yr}>
                <line x1={x} y1={PT} x2={x} y2={SVG_H - PB}
                      stroke="#080f1e" strokeWidth={1} strokeDasharray="2,8"/>
                <text x={x} y={SVG_H - PB + 16} textAnchor="middle"
                      fill="#141e30" fontSize={10}>{Math.abs(yr)} BCE</text>
              </g>
            );
          })}

          {/* Prerequisite edge (dashed arc between knots) */}
          {KNOTS.filter(k => k.toolUse.prerequisite).map(k => {
            const pk = KNOTS.find(p => p.id === k.toolUse.prerequisite);
            if (!pk) return null;
            const x1 = toX(pk.year), y1 = knotMap.get(pk.id) ?? 0;
            const x2 = toX(k.year),  y2 = knotMap.get(k.id) ?? 0;
            const mx = (x1 + x2) / 2, my = Math.min(y1, y2) - 40;
            return (
              <g key={k.id + "-prereq"}>
                <path d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`}
                      fill="none" stroke="#1a2a40" strokeWidth={0.8}
                      strokeDasharray="4,4" opacity={0.5}/>
                <text x={mx} y={my - 5} textAnchor="middle"
                      fill="#1e2a40" fontSize={8} fontStyle="italic">
                  ∴ necessary
                </text>
              </g>
            );
          })}

          {/* Thread segments */}
          {segments.map((seg, i) => {
            const dim = hovStrand && hovStrand !== seg.strandId;
            return (
              <path key={i} d={seg.d}
                    stroke={dim ? "#0a1220" : seg.color}
                    strokeWidth={dim ? 0.4 : seg.width}
                    fill="none" strokeLinecap="round"
                    opacity={dim ? 0.1 : 0.82}
                    style={{ transition:"stroke 0.2s, opacity 0.2s" }}/>
            );
          })}

          {/* Knots */}
          {sortedKnots.map(knot => {
            const kx  = toX(knot.year);
            const ky  = knotMap.get(knot.id) ?? SVG_H / 2;
            const dim = hovKnot && hovKnot !== knot.id && !activeKnot;
            const active = activeKnot?.id === knot.id;
            const hov    = hovKnot === knot.id;

            return (
              <g key={knot.id} style={{ cursor:"pointer" }}
                 onClick={() => setActiveKnot(active ? null : knot)}
                 onMouseEnter={() => setHovKnot(knot.id)}
                 onMouseLeave={() => setHovKnot(null)}>
                {/* Contribution weight lines */}
                {knot.inputs.map(inp => {
                  const s = allStrands.find(t => t.id === inp.threadId);
                  if (!s) return null;
                  const sy = toY(s.lane);
                  return (
                    <line key={inp.threadId}
                          x1={kx - APPROACH * 0.25} y1={sy} x2={kx} y2={ky}
                          stroke={s.color} strokeWidth={inp.weight * 7}
                          opacity={0.12} strokeLinecap="round"/>
                  );
                })}
                {/* Glow ring */}
                {(active || hov) && (
                  <path d={hexPath(kx, ky, KNOT_R + 9)}
                        fill="none" stroke="#f5c518" strokeWidth={0.8} opacity={0.25}/>
                )}
                {/* Hex body */}
                <path d={hexPath(kx, ky, KNOT_R)}
                      fill={active ? "#0b172a" : dim ? "#050810" : "#07112a"}
                      stroke={active ? "#f5c518" : hov ? "#8090b0" : "#1a2d5a"}
                      strokeWidth={active ? 1.5 : 0.8}
                      opacity={dim ? 0.25 : 1}/>
                {/* Icon */}
                <text x={kx} y={ky + 5} textAnchor="middle"
                      fill={active ? "#f5c518" : dim ? "#0e1826" : "#7090b0"}
                      fontSize={13} style={{ pointerEvents:"none" }}>
                  {knot.icon}
                </text>
                {/* Year */}
                <text x={kx} y={ky - KNOT_R - 8} textAnchor="middle"
                      fill={dim ? "#090f1a" : "#1e2a40"} fontSize={9}>
                  {Math.abs(knot.year)} BCE
                </text>
                {/* Name */}
                <text x={kx} y={ky + KNOT_R + 14} textAnchor="middle"
                      fill={active ? "#f5c518" : dim ? "#090f1a" : "#2e3e5a"} fontSize={9}>
                  {knot.name}
                </text>
                {/* Spawn badge */}
                {knot.spawns && !dim && (
                  <g>
                    <circle cx={kx + KNOT_R + 6} cy={ky - KNOT_R}
                            r={4} fill={knot.spawns.color} opacity={0.85}/>
                    <text x={kx + KNOT_R + 14} y={ky - KNOT_R + 4}
                          fill={knot.spawns.color} fontSize={8}>
                      +{knot.spawns.name}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Strand labels (left edge) */}
          {allStrands.map(s => (
            <text key={s.id} x={toX(s.startYear) - 8} y={toY(s.lane) + 4}
                  textAnchor="end" fill={s.color} fontSize={10} opacity={0.7}>
              {s.name}
            </text>
          ))}
        </svg>
      </div>

      {/* ── DII Analysis Panel ──────────────────────────────────────────── */}
      {activeKnot && (
        <div style={{
          position:"fixed", bottom:0, left:0, right:0, zIndex:60,
          background:"rgba(4,7,18,0.97)", borderTop:"1px solid #1a2848",
          maxHeight:"44vh", overflowY:"auto", backdropFilter:"blur(8px)",
        }}>
          {/* Panel header strip */}
          <div style={{ display:"flex", alignItems:"center", gap:16, padding:"8px 20px",
                        borderBottom:"1px solid #0d1830", background:"rgba(10,16,36,0.8)" }}>
            <span style={{ color:"#f5c518", fontSize:12 }}>{activeKnot.name}</span>
            <span style={{ color:"#334155", fontSize:10 }}>·</span>
            <span style={{ color:"#475569", fontSize:10 }}>
              {Math.abs(activeKnot.year)} BCE · Creative Act
            </span>
            {ingenuityScore !== null && prevKnot && (
              <>
                <span style={{ color:"#334155", fontSize:10 }}>·</span>
                <span style={{ color:"#94a3b8", fontSize:10 }}>
                  Insight ↑ from {prevKnot.name.split(" ")[0]}:&nbsp;
                  <span style={{ color:ingenuityScore > 0.5 ? "#f5c518" : "#64748b" }}>
                    Ingenuity = {(ingenuityScore * 100).toFixed(0)}
                  </span>
                  <span style={{ color:"#334155" }}>/100</span>
                </span>
              </>
            )}
            <span style={{ flex:1 }}/>
            <span style={{ fontSize:9, color:"#1e2a40" }}>GECD = ruler · MAGIC = reading</span>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:0 }}>

            {/* Col 1: GECD → Artifact */}
            <div style={{ padding:"14px 18px", borderRight:"1px solid #0b1428" }}>
              <div style={{ fontSize:9, color:"#1e2a40", letterSpacing:3, marginBottom:8 }}>
                GECD CONFIG → CARRIER CONSTRUCTION
              </div>
              <div style={{ fontSize:10, color:"#64748b", marginBottom:4 }}>
                Element (GEA/GEM):
              </div>
              <div style={{ fontSize:10, color:"#f5c518", marginBottom:8 }}>
                {activeKnot.gecd.element}
              </div>
              <div style={{ fontSize:10, color:"#64748b", marginBottom:2 }}>Carrier:</div>
              <div style={{ fontSize:10, color:"#94a3b8", marginBottom:8, lineHeight:1.5 }}>
                {activeKnot.gecd.carrier}
              </div>
              <div style={{ fontSize:10, color:"#64748b", marginBottom:2 }}>Dimension:</div>
              <div style={{ fontSize:10, color:"#94a3b8", marginBottom:10, lineHeight:1.5 }}>
                {activeKnot.gecd.dimension}
              </div>
              <div style={{ margin:"6px 0 2px", display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontSize:9, color:"#1e2a40" }}>task complexity</span>
                <span style={{ fontSize:9, color:"#334155" }}>{Math.round(activeKnot.gecd.complexity * 100)}%</span>
              </div>
              <div style={{ height:3, background:"#080f1e", borderRadius:2, overflow:"hidden", marginBottom:8 }}>
                <div style={{ width:`${activeKnot.gecd.complexity * 100}%`, height:"100%",
                              background:"linear-gradient(90deg,#3b82f6,#8b5cf6)", borderRadius:2 }}/>
              </div>
              <div style={{ fontSize:9, color:"#475569", lineHeight:1.6 }}>
                {activeKnot.gecd.potential}
              </div>
            </div>

            {/* Col 2: Tool Use + Ideology */}
            <div style={{ padding:"14px 18px", borderRight:"1px solid #0b1428" }}>
              <div style={{ fontSize:9, color:"#1e2a40", letterSpacing:3, marginBottom:8 }}>
                TOOL USE · IDEOLOGY STRAND
              </div>
              <div style={{ fontSize:10, color:"#f97316", marginBottom:8, lineHeight:1.6 }}>
                {activeKnot.toolUse.ideology}
              </div>
              <div style={{ fontSize:9, color:"#334155", marginBottom:3 }}>INTENTIONAL SHAPE CHOICE</div>
              <div style={{ fontSize:10, color:"#64748b", marginBottom:10, lineHeight:1.6 }}>
                {activeKnot.toolUse.intentionalShape}
              </div>
              <div style={{ fontSize:9, color:"#1e2a40", marginBottom:4 }}>TOOLS REQUIRED</div>
              {activeKnot.toolUse.tools.map((t, i) => (
                <div key={i} style={{ fontSize:9, color:"#334155", padding:"2px 0",
                                      borderBottom:"1px solid #080e1c", lineHeight:1.5 }}>
                  · {t}
                </div>
              ))}
              {activeKnot.toolUse.prerequisite && (
                <div style={{ marginTop:10, padding:"5px 8px", background:"#060d1c",
                              border:"1px solid #1a3060", borderRadius:3, fontSize:9, color:"#22c55e" }}>
                  ∴ necessary condition:{" "}
                  {KNOTS.find(k => k.id === activeKnot.toolUse.prerequisite)?.name}
                </div>
              )}
            </div>

            {/* Col 3: DII → F(ge) */}
            <div style={{ padding:"14px 18px", borderRight:"1px solid #0b1428" }}>
              <div style={{ fontSize:9, color:"#1e2a40", letterSpacing:3, marginBottom:8 }}>
                DII ANALYSIS · F(ge) FORMULA
              </div>
              {[
                { label:"Primitive",   val: activeKnot.dii.primitive },
                { label:"Motion",      val: activeKnot.dii.motion },
                { label:"Duration",    val: activeKnot.dii.duration },
                { label:"Vector",      val: activeKnot.dii.vector },
              ].map(row => (
                <div key={row.label} style={{ marginBottom:9 }}>
                  <div style={{ fontSize:8, color:"#1e2a40", letterSpacing:2, marginBottom:1 }}>
                    {row.label}
                  </div>
                  <div style={{ fontSize:10, color:"#64748b", lineHeight:1.5 }}>{row.val}</div>
                </div>
              ))}
              <div style={{ marginTop:8, padding:"8px 10px", background:"#050c1e",
                            border:"1px solid #1a2a50", borderRadius:4,
                            fontSize:10, color:"#f5c518", lineHeight:1.6 }}>
                {activeKnot.dii.fGe}
              </div>
              <div style={{ marginTop:8, fontSize:9, color:"#1e2a40", lineHeight:1.5 }}>
                {activeKnot.geLabel}
              </div>
            </div>

            {/* Col 4: MAGIC Quadrilateral + Insight */}
            <div style={{ padding:"14px 18px" }}>
              <div style={{ fontSize:9, color:"#1e2a40", letterSpacing:3, marginBottom:6 }}>
                MAGIC READING · G AT CENTER
              </div>

              {/* Radar + Ingenuity */}
              <div style={{ display:"flex", gap:12, alignItems:"flex-start", marginBottom:10 }}>
                <MagicQuad magic={activeKnot.magic} prev={prevKnot?.magic} size={92}/>
                <div style={{ flex:1 }}>
                  {ingenuityScore !== null && prevKnot ? (
                    <div style={{ marginBottom:8 }}>
                      <div style={{ fontSize:8, color:"#334155", letterSpacing:2, marginBottom:3 }}>
                        INGENUITY (ΔMAGIC magnitude)
                      </div>
                      <div style={{ height:4, background:"#080f1e", borderRadius:2, overflow:"hidden", marginBottom:3 }}>
                        <div style={{
                          width:`${ingenuityScore * 100}%`, height:"100%",
                          background:`linear-gradient(90deg, #3b82f6, #f5c518)`,
                          borderRadius:2,
                        }}/>
                      </div>
                      <div style={{ fontSize:10, color:"#f5c518" }}>
                        {(ingenuityScore * 100).toFixed(0)}<span style={{ color:"#334155", fontSize:8 }}>/100</span>
                      </div>
                      <div style={{ fontSize:8, color:"#1e2a40", marginTop:2 }}>
                        vs {prevKnot.name.split(" ").slice(0,2).join(" ")}
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize:8, color:"#1e2a40", marginTop:4 }}>
                      First creative act — no prior reading to delta
                    </div>
                  )}
                  <div style={{ fontSize:8, color:"#0d1428", marginTop:4 }}>
                    dashed = prior quad<br/>solid = this reading<br/>G = geometric element (center)
                  </div>
                </div>
              </div>

              {/* MAIC axis values */}
              {MAGIC_KEYS.map(k => (
                <div key={k} style={{ marginBottom:5 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline" }}>
                    <span style={{ fontSize:9, color: MAGIC_COLORS[k] }}>
                      {MAGIC_LABELS[k]}
                    </span>
                    <span style={{ fontSize:9, color: MAGIC_COLORS[k] }}>
                      {activeKnot.magic[k].toFixed(2)}
                    </span>
                  </div>
                  <div style={{ height:2.5, background:"#06101e", borderRadius:1, overflow:"hidden", marginBottom:1 }}>
                    <div style={{ width:`${(activeKnot.magic[k] / MAGIC_MAX) * 100}%`, height:"100%",
                                  background: MAGIC_COLORS[k], borderRadius:1, opacity:0.9 }}/>
                  </div>
                  <div style={{ fontSize:7, color:"#1e2a40" }}>
                    {magicLabel(activeKnot.magic[k])}
                  </div>
                </div>
              ))}

              {/* Spawned thread */}
              {activeKnot.spawns && (
                <div style={{ marginTop:8, padding:"6px 8px", background:"#050d1c",
                              border:`1px solid ${activeKnot.spawns.color}40`, borderRadius:3 }}>
                  <div style={{ fontSize:8, color:activeKnot.spawns.color }}>
                    ✦ spawns: {activeKnot.spawns.name}
                  </div>
                  <div style={{ fontSize:7, color:"#1e2a40", marginTop:2, lineHeight:1.4 }}>
                    A new thread that cannot be reduced to its inputs. Emergent ingenuity.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contribution ratio strip */}
          <div style={{ padding:"8px 18px", borderTop:"1px solid #0a1428",
                        background:"rgba(5,9,22,0.7)" }}>
            <div style={{ fontSize:8, color:"#1e2a40", letterSpacing:3, marginBottom:5 }}>
              CONVERGENCE RATIO — contribution of each thread to this creative act
            </div>
            <div style={{ display:"flex", gap:16, flexWrap:"wrap", marginBottom:5 }}>
              {activeKnot.inputs.map(inp => {
                const s = allStrands.find(t => t.id === inp.threadId);
                return s ? (
                  <div key={inp.threadId} style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <div style={{ width:`${inp.weight * 120}px`, height:3,
                                  background:s.color, borderRadius:2, minWidth:10 }}/>
                    <span style={{ fontSize:9, color:s.color }}>{s.name}</span>
                    <span style={{ fontSize:9, color:"#334155" }}>{Math.round(inp.weight * 100)}%</span>
                  </div>
                ) : null;
              })}
            </div>
            <div style={{ fontSize:9, color:"#2e3e5a", lineHeight:1.5 }}>
              {activeKnot.contribution}
            </div>
          </div>

          {/* Close */}
          <div onClick={() => setActiveKnot(null)}
               style={{ textAlign:"center", padding:"5px", fontSize:9,
                        color:"#1e2a40", cursor:"pointer", borderTop:"1px solid #080f1e" }}
               onMouseEnter={e => (e.currentTarget.style.color = "#475569")}
               onMouseLeave={e => (e.currentTarget.style.color = "#1e2a40")}>
            ▼ close
          </div>
        </div>
      )}
    </div>
  );
}
