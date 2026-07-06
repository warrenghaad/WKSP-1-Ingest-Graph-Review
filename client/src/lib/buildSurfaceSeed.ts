import type { CatalogueArtifact, LessonSlot, SurfaceViewConfig } from "./buildSurfaceTypes";

export const BUILD_SURFACE_FACETS = [
  "civilization",
  "period",
  "geometry",
  "carrier",
  "material",
  "source",
  "lessonRole",
  "pfmd",
] as const;

const svgThumb = (label: string, bg = "111827", fg = "f5d76e") =>
  `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
      <defs>
        <radialGradient id="g" cx="50%" cy="35%" r="70%">
          <stop offset="0" stop-color="#${fg}" stop-opacity="0.35"/>
          <stop offset="1" stop-color="#${bg}" stop-opacity="1"/>
        </radialGradient>
      </defs>
      <rect width="800" height="600" fill="url(#g)"/>
      <path d="M110 420 C210 240 330 500 455 285 S620 190 695 330" fill="none" stroke="#${fg}" stroke-width="16" stroke-linecap="round" opacity="0.65"/>
      <circle cx="235" cy="215" r="62" fill="none" stroke="#ffffff" stroke-opacity="0.28" stroke-width="10"/>
      <path d="M500 150 L650 410 L350 410 Z" fill="none" stroke="#ffffff" stroke-opacity="0.24" stroke-width="10"/>
      <text x="48" y="552" font-family="Inter, Arial" font-size="44" font-weight="700" fill="#fff" opacity="0.88">${label}</text>
    </svg>
  `)}`;

export const seedArtifacts: CatalogueArtifact[] = [
  {
    id: "artifact:uruk-beveled-bowl",
    title: "Beveled-rim bowl",
    subtitle: "Mass production, rationing, nested enclosure",
    description: "A humble clay container that lets students see enclosure, repetition, administrative control, and material standardization as one artifact-system.",
    imageUrl: svgThumb("Bowl", "1f2937", "f59e0b"),
    thumbUrl: svgThumb("Bowl", "1f2937", "f59e0b"),
    source: "seed",
    sourceId: "local-seed-001",
    license: "Educational Use",
    verificationStatus: "approved",
    tags: {
      civilization: ["Sumerian"],
      period: ["Uruk"],
      geometry: ["enclosure", "circle", "profile"],
      carrier: ["vessel"],
      material: ["clay"],
      source: ["seed"],
      lessonRole: ["Day B function", "artifact anchor"],
      pfmd: ["P:enclosure", "F:containment", "M:static", "D:continuous"],
    },
    primitiveRefs: ["enclosure", "circle", "arc"],
    productionNotes: ["Needs cross-section diagram", "Compare hand-made vs mold repetition"],
    imagePrompt: "Diagram a Mesopotamian beveled-rim bowl as an enclosure primitive with labeled wall profile, mouth circle, clay carrier, and containment force.",
  },
  {
    id: "artifact:cylinder-seal",
    title: "Cylinder seal roll-out",
    subtitle: "Circle translated into administrative image automation",
    description: "A circular primitive becomes a rolling inscription machine: rotation plus translation produces a repeated image ribbon.",
    imageUrl: svgThumb("Seal", "172554", "38bdf8"),
    thumbUrl: svgThumb("Seal", "172554", "38bdf8"),
    source: "seed",
    sourceId: "local-seed-002",
    license: "Educational Use",
    verificationStatus: "unverified",
    tags: {
      civilization: ["Sumerian", "Akkadian"],
      period: ["Early Dynastic"],
      geometry: ["circle", "line", "pattern"],
      carrier: ["seal", "impression"],
      material: ["stone", "clay"],
      source: ["seed"],
      lessonRole: ["visual evidence", "mechanics bridge"],
      pfmd: ["P:circle", "F:pressure", "M:roll", "D:cyclic"],
    },
    primitiveRefs: ["circle", "line", "grid"],
    productionNotes: ["Animate cylinder rolling to make an image strip", "Needs source verification before lesson use"],
    imagePrompt: "Create an educational diagram of a cylinder seal rolling over clay, showing rotation arrow, translation path, pressure vector, and repeated image strip.",
  },
  {
    id: "artifact:plimpton-322",
    title: "Plimpton 322 tablet",
    subtitle: "Grid as computation carrier",
    description: "A tablet where grid, inscription, number, and institutional memory fuse into a cognitive machine.",
    imageUrl: svgThumb("Grid", "312e81", "a78bfa"),
    thumbUrl: svgThumb("Grid", "312e81", "a78bfa"),
    source: "seed",
    sourceId: "local-seed-003",
    license: "Educational Use",
    verificationStatus: "needs_info",
    tags: {
      civilization: ["Babylonian"],
      period: ["Old Babylonian"],
      geometry: ["grid", "line", "number"],
      carrier: ["tablet"],
      material: ["clay"],
      source: ["seed"],
      lessonRole: ["math anchor", "research caution"],
      pfmd: ["P:grid", "F:inscription", "M:index", "D:stored"],
    },
    primitiveRefs: ["grid", "line", "point"],
    productionNotes: ["Keep claims conservative", "Require citation cards for mathematical interpretation"],
    imagePrompt: "Design a classroom-safe visualization of a Babylonian numerical grid tablet, emphasizing rows, columns, indexing, and clay as information carrier without overclaiming interpretation.",
  },
  {
    id: "artifact:wheel-cart",
    title: "Wheel-and-axle cart model",
    subtitle: "Circle plus rigid line as transport converter",
    description: "A circle recruited into rolling contact and constrained by a line-axis creates a repeatable motion converter.",
    imageUrl: svgThumb("Wheel", "164e63", "22d3ee"),
    thumbUrl: svgThumb("Wheel", "164e63", "22d3ee"),
    source: "seed",
    sourceId: "local-seed-004",
    license: "Educational Use",
    verificationStatus: "approved",
    tags: {
      civilization: ["Sumerian"],
      period: ["Late Uruk"],
      geometry: ["circle", "line", "axis"],
      carrier: ["vehicle"],
      material: ["wood"],
      source: ["seed"],
      lessonRole: ["simple machine", "Day B function"],
      pfmd: ["P:circle", "F:load", "M:roll", "D:continuous"],
    },
    primitiveRefs: ["circle", "line_rigid", "point"],
    productionNotes: ["Needs wheel/axle exploded diagram", "Animate load path and rolling contact"],
    imagePrompt: "Generate a clean wheel-and-axle diagram with a rolling circle, rigid axle line, ground contact force, load vector, and motion ribbon.",
  },
  {
    id: "artifact:wedge-blade",
    title: "Wedge blade study",
    subtitle: "Triangle translates force into split",
    description: "The wedge makes force visible: a triangle converts downward or forward input into lateral separation.",
    imageUrl: svgThumb("Wedge", "3f1d1d", "f87171"),
    thumbUrl: svgThumb("Wedge", "3f1d1d", "f87171"),
    source: "seed",
    sourceId: "local-seed-005",
    license: "Educational Use",
    verificationStatus: "unverified",
    tags: {
      civilization: ["cross-cultural"],
      period: ["Neolithic to Bronze Age"],
      geometry: ["triangle", "wedge", "angle"],
      carrier: ["tool"],
      material: ["stone", "bronze"],
      source: ["seed"],
      lessonRole: ["primitive mechanics", "simple machine"],
      pfmd: ["P:triangle", "F:concentrated", "M:translate", "D:impulse"],
    },
    primitiveRefs: ["triangle", "line_rigid"],
    productionNotes: ["Show input vector splitting into two output vectors", "Useful for ax, chisel, plow lineage"],
    imagePrompt: "Illustrate a wedge primitive driven into material, with input force, split reaction forces, edge angle, and error envelope/residue labels.",
  },
  {
    id: "artifact:screw-helix",
    title: "Screw / helix cell",
    subtitle: "Rotation converted into linear advance",
    description: "The helix wraps a triangle-like thread around a line-axis, converting rotation into axial movement.",
    imageUrl: svgThumb("Helix", "1e1b4b", "c4b5fd"),
    thumbUrl: svgThumb("Helix", "1e1b4b", "c4b5fd"),
    source: "seed",
    sourceId: "local-seed-006",
    license: "Educational Use",
    verificationStatus: "approved",
    tags: {
      civilization: ["Greek", "Roman", "cross-cultural"],
      period: ["Classical"],
      geometry: ["helix", "triangle", "line"],
      carrier: ["fastener", "machine element"],
      material: ["wood", "metal"],
      source: ["seed"],
      lessonRole: ["MFIE canonical", "invention lineage"],
      pfmd: ["P:helix", "F:torque", "M:screw_advance", "D:cyclic"],
    },
    primitiveRefs: ["helix", "triangle", "line_rigid"],
    productionNotes: ["Canonical nail-to-screw comparison", "Needs PFMD overlay and residue panel"],
    imagePrompt: "Create a screw mechanics diagram showing helix thread, central axis, torque arrow, axial advance arrow, pitch, and residue-fitting thread geometry.",
  },
];

export const seedLessonSlots: LessonSlot[] = [
  { id: "slot:warmup", label: "Warm-up visual", helper: "One image that makes the primitive immediately legible.", itemIds: [] },
  { id: "slot:problem", label: "Problem node", helper: "Artifact or diagram that exposes the error envelope.", itemIds: [] },
  { id: "slot:mechanics", label: "Mechanics bridge", helper: "Force, motion, duration, or material behavior evidence.", itemIds: [] },
  { id: "slot:production", label: "Production asset", helper: "Final image, animation, or prompt-ready asset.", itemIds: [] },
];

export const seedViews: SurfaceViewConfig[] = [
  {
    id: "view:gallery-approved",
    name: "Approved gallery",
    type: "gallery",
    filters: { verificationStatus: ["approved"] },
    sort: [{ id: "title", desc: false }],
    groupBy: "geometry",
    visibleColumns: ["title", "verificationStatus", "civilization", "geometry", "lessonRole", "license"],
    columnOrder: ["title", "verificationStatus", "civilization", "geometry", "lessonRole", "license"],
    galleryCoverField: "thumbUrl",
  },
  {
    id: "view:review-inbox",
    name: "Verification inbox",
    type: "inbox",
    filters: { verificationStatus: ["unverified", "needs_info"] },
    sort: [{ id: "title", desc: false }],
    groupBy: "verificationStatus",
    visibleColumns: ["title", "verificationStatus", "source", "license"],
    columnOrder: ["title", "verificationStatus", "source", "license"],
  },
];
