export interface MAGICVector {
  M: number;
  A: number;
  G: number;
  I: number;
  C: number;
}

export interface LessonSection {
  id: string;
  day: "A" | "B";
  number: number;
  title: string;
  operation: string;
  shortDesc: string;
  question: string;
  vector: MAGICVector;
  loudActors: string;
  bridgeForward: string;
  register: "metaphor" | "function" | "bridge";
  geTags: string[];
  keywordTemplates: string[];
}

export const MAGIC_LABELS: Record<keyof MAGICVector, { name: string; color: string; desc: string }> = {
  M: { name: "Mathematics", color: "#3b82f6", desc: "Formal properties, proofs, measurement, calculation" },
  A: { name: "Aesthetics/Art", color: "#a855f7", desc: "Visual rhetoric, craft, design, perceptual affordance" },
  G: { name: "Geometry", color: "#22c55e", desc: "Spatial organization, GEA/GEM composition, dimensional analysis" },
  I: { name: "Institutionalization", color: "#eab308", desc: "Ideology, mythology, religion, tradition, ritual, ethics" },
  C: { name: "Control/Power", color: "#ef4444", desc: "Who funds, controls, permits, suppresses, monopolizes" },
};

export const LESSON_SECTIONS: LessonSection[] = [
  {
    id: "A1",
    day: "A",
    number: 1,
    title: "Mythological Introduction",
    operation: "PRESENT",
    shortDesc: "Here is a shape that mattered.",
    question: "Who said this was sacred? What did it mean?",
    vector: { M: 0.1, A: 0.6, G: 0.5, I: 0.9, C: 0.2 },
    loudActors: "I (LEADS), A (speaking)",
    bridgeForward: "Students must leave with the existential problem, the mythological solution, and awareness that geometry is present IN the myth.",
    register: "metaphor",
    geTags: ["GEpHR-nascent", "GEA-cosmic", "GEU-identified"],
    keywordTemplates: [
      "{CIV} creation myth text translation",
      "{DEITY} hymn prayer text {PERIOD}",
      "{CIV} divine hierarchy pantheon structure",
      "{CIV} kingship divine right ideology",
    ],
  },
  {
    id: "A2",
    day: "A",
    number: 2,
    title: "Visual Rhetoric — GEpHR Mechanism",
    operation: "DEFINE",
    shortDesc: "Here is WHY the geometry carries meaning.",
    question: "What perceptual affordance does this GEA/GEM composition produce?",
    vector: { M: 0.3, A: 0.8, G: 0.8, I: 0.5, C: 0.2 },
    loudActors: "A (LEADS), G (CO-LEADS)",
    bridgeForward: "Students must understand visualization is CONSTRUCTED, know the GEA/GEM vocabulary, and understand ECD relationships.",
    register: "metaphor",
    geTags: ["GEpHR-born", "GEA-selected", "GEM-composed", "GE,C,D-primary"],
    keywordTemplates: [
      "{GEA} symbol construction method {CIV}",
      "{DEITY} symbol iconographic attribute design",
      "{CIV} visual hierarchy sacred art",
      "{CIV} art proportional system canon",
    ],
  },
  {
    id: "A3",
    day: "A",
    number: 3,
    title: "Iconographic Chain — Sacred Art",
    operation: "GENERALIZE (Sacred)",
    shortDesc: "The visual rhetoric principle appears across sacred imagery.",
    question: "What does this look like across different sacred carriers?",
    vector: { M: 0.1, A: 0.9, G: 0.7, I: 0.9, C: 0.3 },
    loudActors: "A (LEADS), I (CO-LEADS), G (speaking)",
    bridgeForward: "Students recognize the same GEA/GEM composition on 3+ sacred carriers with consistent perceptual affordance.",
    register: "metaphor",
    geTags: ["GEpHR-full", "GEA/GEM-visible", "GE,C,D-invested"],
    keywordTemplates: [
      "{CIV} masterpiece iconic artwork {PERIOD}",
      "{DEITY} major depiction relief sculpture {SITE}",
      "{CIV} monumental art {MATERIAL} {PERIOD}",
    ],
  },
  {
    id: "A4",
    day: "A",
    number: 4,
    title: "Diffusion — Ritual, Object, Role, Class",
    operation: "GENERALIZE (Secular)",
    shortDesc: "The visual rhetoric travels beyond the sacred.",
    question: "Who controlled this knowledge? Who was excluded?",
    vector: { M: 0.2, A: 0.7, G: 0.7, I: 0.8, C: 0.6 },
    loudActors: "I (LEADS), C (RISING), A (speaking), G (speaking)",
    bridgeForward: "Students distinguish elite vs. common carriers and identify power controls on design diffusion.",
    register: "metaphor",
    geTags: ["GEpHR-diffusing", "GEA/GEM-multiple-carriers", "GE,C,D-multiple-nodes", "GEU-crosscultural"],
    keywordTemplates: [
      "{CIV} domestic pottery {GEA} motif {PERIOD}",
      "{CIV} personal jewelry amulet {GEA} {MATERIAL}",
      "{CIV} cylinder seal impression {GEA} administrative",
      "{CIV} craft production standardization workshop",
    ],
  },
  {
    id: "A5",
    day: "A",
    number: 5,
    title: "Material Culture — Crystallization",
    operation: "CRYSTALLIZE (Metaphor)",
    shortDesc: "ONE artifact where the visual rhetoric principle is materially present.",
    question: "How was it made? What technique produced this?",
    vector: { M: 0.3, A: 0.9, G: 0.8, I: 0.3, C: 0.1 },
    loudActors: "A (LEADS), G (CO-LEADS)",
    bridgeForward: "Students can trace the GEA→GEM construction sequence in the physical object.",
    register: "metaphor",
    geTags: ["GEA-constructing", "GEM-combining", "GE,C,D-student-node", "GEK-latent"],
    keywordTemplates: [
      "{CIV} artisan technique {GEA} construction method",
      "{GEA} geometric construction step by step ancient method",
      "rosette star polygon geometric construction compass",
    ],
  },
  {
    id: "A6",
    day: "A",
    number: 6,
    title: "Art Activity — Practice",
    operation: "PRACTICE (Metaphor)",
    shortDesc: "Make it yourself.",
    question: "What spatial constraints do you discover by making?",
    vector: { M: 0.2, A: 0.9, G: 0.8, I: 0.4, C: 0.1 },
    loudActors: "A (LEADS), G (CO-LEADS)",
    bridgeForward: "Students have a physical artifact and experience of creative decision-making within geometric constraints.",
    register: "metaphor",
    geTags: ["GEA/GEM-student-produced", "GE,C,D-student-node", "GEpHR-personal"],
    keywordTemplates: [
      "{CIV} workshop production variation {GEA} {CARRIER}",
      "{GEA} cross-cultural variation comparison",
    ],
  },
  {
    id: "A7",
    day: "A",
    number: 7,
    title: "Dual-Register Reveal — The Pivot",
    operation: "REVEAL + PIVOT",
    shortDesc: "This shape carries BOTH meaning and function.",
    question: "How is space organized here? — it MEANS and it DOES.",
    vector: { M: 0.5, A: 0.7, G: 0.9, I: 0.7, C: 0.6 },
    loudActors: "G (PEAKS — Day A maximum), all others speaking",
    bridgeForward: "Students can identify BOTH metaphor and function readings of the same architectural artifact.",
    register: "bridge",
    geTags: ["GEpHR-full", "GEK-full", "GEA/GEM-complex", "GE,C,D-densest", "CIRCUMNUTATING"],
    keywordTemplates: [
      "{CIV} {SITE} temple reconstruction architecture",
      "{CIV} ziggurat plan elevation reconstruction",
      "{CIV} temple both symbolic functional analysis",
    ],
  },
  {
    id: "B1",
    day: "B",
    number: 1,
    title: "Bridge — Register Shift",
    operation: "PRESENT (Function)",
    shortDesc: "Yesterday meaning, today mechanism.",
    question: "The geometry hasn't changed. Only the reading is shifting.",
    vector: { M: 0.3, A: 0.5, G: 0.6, I: 0.5, C: 0.2 },
    loudActors: "G (speaking), all others listening",
    bridgeForward: "Students hold the register shift: same element, different questions.",
    register: "bridge",
    geTags: ["GEpHR-acknowledged", "GEK-previewed", "GEA-constant"],
    keywordTemplates: [
      "{GEA} sacred secular comparison {CIV}",
      "{GEA} symbolic functional dual use {CIV}",
    ],
  },
  {
    id: "B2",
    day: "B",
    number: 2,
    title: "Mathematical Properties — GEK Formalization",
    operation: "DEFINE (Function)",
    shortDesc: "What is mathematically true about this shape.",
    question: "What's the formula? Can you prove it?",
    vector: { M: 0.9, A: 0.2, G: 0.7, I: 0.2, C: 0.1 },
    loudActors: "M (LEADS)",
    bridgeForward: "Students can state and verify the mathematical property. Same property as A2's perceptual affordance.",
    register: "function",
    geTags: ["GEK-emerging", "GEA-formally-defined", "GEM-mathematical-relations"],
    keywordTemplates: [
      "{GEA} mathematical properties formal definition",
      "{CIV} mathematical tablet proof {GEA}",
      "Pythagorean theorem Babylonian tablet",
    ],
  },
  {
    id: "B3",
    day: "B",
    number: 3,
    title: "Transformations & Operations — GEK-T",
    operation: "GENERALIZE (Operations)",
    shortDesc: "What this property DOES when you operate on it.",
    question: "Rotate, reflect, extrude, project. What NEW properties emerge?",
    vector: { M: 0.8, A: 0.3, G: 0.9, I: 0.2, C: 0.2 },
    loudActors: "M (loud), G (PEAKS)",
    bridgeForward: "Students can perform transformations and identify preserved vs. emergent properties.",
    register: "function",
    geTags: ["GEK-T-rotation", "GEK-T-reflection", "GEK-T-tessellation", "GEK-T-extrusion"],
    keywordTemplates: [
      "{GEA} transformation rotation reflection tessellation",
      "{CIV} geometric pattern tessellation {GEM}",
    ],
  },
  {
    id: "B4",
    day: "B",
    number: 4,
    title: "Shape Lineage — Historical Trajectory G(t)",
    operation: "GENERALIZE (Lineage)",
    shortDesc: "How this geometric capability traveled through time.",
    question: "Who funded the engineering? What innovations were suppressed?",
    vector: { M: 0.6, A: 0.4, G: 0.8, I: 0.4, C: 0.6 },
    loudActors: "G (loud), C (RISING), M (speaking)",
    bridgeForward: "Students can trace the element's functional evolution and identify power constraints on the trajectory.",
    register: "function",
    geTags: ["G(t)-trajectory", "GEM-evolution", "deviation-vector"],
    keywordTemplates: [
      "{GEA} functional evolution history {CIV}",
      "{CIV} engineering patronage innovation {PERIOD}",
    ],
  },
  {
    id: "B5",
    day: "B",
    number: 5,
    title: "STEM Notch — Invention Crystallization",
    operation: "CRYSTALLIZE (Function)",
    shortDesc: "The specific invention that crystallizes this week's geometry.",
    question: "What's the STEM notch? How does the mechanism work?",
    vector: { M: 0.8, A: 0.5, G: 0.9, I: 0.3, C: 0.7 },
    loudActors: "G (PEAKS — Day B maximum), M (loud), C (speaking)",
    bridgeForward: "Students can decompose the invention's mechanism and connect to A5: same spatial skill, different register.",
    register: "function",
    geTags: ["GEK-deployed", "GEA/GEM-mechanical", "STEM-notch", "ECD-stabilized"],
    keywordTemplates: [
      "{INVENTION} mechanism decomposition engineering",
      "{CIV} invention {GEA} functional deployment",
    ],
  },
  {
    id: "B6",
    day: "B",
    number: 6,
    title: "Engineering Decomposition — Teach",
    operation: "TEACH (Function)",
    shortDesc: "How the invention works, decomposed for your hands.",
    question: "What are the parts? What measurements matter?",
    vector: { M: 0.7, A: 0.4, G: 0.8, I: 0.2, C: 0.2 },
    loudActors: "M (speaking), G (loud)",
    bridgeForward: "Students can name parts, forces, measurements, and predict build outcomes.",
    register: "function",
    geTags: ["GEA/GEM-constructible", "force-analysis", "measurement-spec"],
    keywordTemplates: [
      "{INVENTION} construction step by step",
      "{CIV} engineering technique {MATERIAL}",
    ],
  },
  {
    id: "B7",
    day: "B",
    number: 7,
    title: "Engineering Activity — Practice",
    operation: "PRACTICE (Function)",
    shortDesc: "Build it. Test it. Break it. Understand why.",
    question: "Does the measurement match the prediction?",
    vector: { M: 0.7, A: 0.3, G: 0.8, I: 0.2, C: 0.1 },
    loudActors: "M (speaking), G (loud)",
    bridgeForward: "Students have built, tested, and verified the geometric principle in a functional model.",
    register: "function",
    geTags: ["GEA/GEM-built", "testing-verification", "iteration"],
    keywordTemplates: [
      "{INVENTION} student model construction test",
    ],
  },
  {
    id: "B8",
    day: "B",
    number: 8,
    title: "Synthesis — Circuit Close",
    operation: "SYNTHESIZE + CIRCUIT",
    shortDesc: "Same geometry MEANS and DOES. Next week inherits this G(t).",
    question: "What can you now see that you couldn't before?",
    vector: { M: 0.6, A: 0.6, G: 0.8, I: 0.6, C: 0.5 },
    loudActors: "All voices balanced — synthesis",
    bridgeForward: "This week's accumulated G(t) becomes next week's prior knowledge. The compound lens effect.",
    register: "bridge",
    geTags: ["compound-lens", "G(t)-accumulated", "circuit-close"],
    keywordTemplates: [
      "{GEA} meaning function synthesis {CIV}",
    ],
  },
];

export const DAY_A_SECTIONS = LESSON_SECTIONS.filter((s) => s.day === "A");
export const DAY_B_SECTIONS = LESSON_SECTIONS.filter((s) => s.day === "B");

export const ZIGGURAT_LAYERS = [
  { level: 0, label: "MAGIC Drivers", desc: "M·A·G·I·C — 0D particles converging", type: "base" as const },
  { level: 1, label: "Discovery Plane", desc: "2D plane formed by driver convergence", type: "discovery" as const },
  { level: 2, label: "Innovation Edges", desc: "Connections between variables/discoveries", type: "innovation" as const },
  { level: 3, label: "Invention 1", desc: "First stabilized ECD configuration", type: "invention" as const },
  { level: 4, label: "Invention 2", desc: "Accumulated spatial capability", type: "invention" as const },
  { level: 5, label: "Invention 3", desc: "Increasing specificity", type: "invention" as const },
  { level: 6, label: "Invention 4", desc: "Compound geometric operations", type: "invention" as const },
  { level: 7, label: "Invention 5", desc: "Cross-register synthesis", type: "invention" as const },
  { level: 8, label: "Invention 6", desc: "Refined functional deployment", type: "invention" as const },
  { level: 9, label: "Invention 7", desc: "Peak — smallest volume", type: "invention" as const },
];

export const LESSON_SECTION_IDS = LESSON_SECTIONS.map((s) => s.id) as readonly string[];
export type LessonSectionId = (typeof LESSON_SECTIONS)[number]["id"];

export function averageVectors(vectors: MAGICVector[]): MAGICVector {
  if (vectors.length === 0) return { M: 0, A: 0, G: 0, I: 0, C: 0 };
  const sum: MAGICVector = { M: 0, A: 0, G: 0, I: 0, C: 0 };
  for (const v of vectors) {
    sum.M += v.M;
    sum.A += v.A;
    sum.G += v.G;
    sum.I += v.I;
    sum.C += v.C;
  }
  const n = vectors.length;
  return { M: sum.M / n, A: sum.A / n, G: sum.G / n, I: sum.I / n, C: sum.C / n };
}

export function getVectorMax(v: MAGICVector): keyof MAGICVector {
  let max: keyof MAGICVector = "M";
  let maxVal = 0;
  for (const k of Object.keys(v) as (keyof MAGICVector)[]) {
    if (v[k] > maxVal) {
      maxVal = v[k];
      max = k;
    }
  }
  return max;
}

export function getVectorTotal(v: MAGICVector): number {
  return v.M + v.A + v.G + v.I + v.C;
}
