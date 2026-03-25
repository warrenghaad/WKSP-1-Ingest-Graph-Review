/**
 * regex-batch-ingest.ts
 * Pure-regex GECD node extraction — ZERO LLM/API calls.
 *
 * Strategy:
 *  1. Curated seed records — hand-extracted from the four key research files.
 *     Each record comes directly from explicit text in those documents.
 *  2. Heuristic scanner — regex walks every line of every research file looking
 *     for "Artifact Name (c. YYYY BCE)" patterns not already in the curated set,
 *     assigns default geometric + MAGIC scores from keyword context.
 *  3. All records upserted into graph_nodes (ON CONFLICT DO UPDATE).
 *
 * Run: npx tsx scripts/regex-batch-ingest.ts
 */

import fs from "fs";
import path from "path";
import { Pool } from "pg";

const DATABASE_URL = process.env.DATABASE_URL ?? "";
const pool = new Pool({ connectionString: DATABASE_URL });

// ─── Types ────────────────────────────────────────────────────────────────────

interface MagicDrivers {
  math: number;
  aesthetic: number;
  institutional: number;
  comptroller: number;
}

interface GECDNode {
  id: string;
  name: string;
  date_bce: number | null;
  date_ce: number | null;
  date_display: string;
  geometric_element: string;
  deity: string;
  magic_drivers: MagicDrivers;
  description: string;
  provenance: string;
  civilization: string;
  intensification_category: string;
  tags: string[];
  source: string;
  notes: string | null;
}

// ─── Curated seed records ─────────────────────────────────────────────────────
// Hand-extracted from:
//   "Design and Aesthetics"
//   "Geometric Symbols & Cognitive Architecture in Mesapotamia"
//   "Geometry as weapon"
//   "history of invention"
// Every field below is traceable to explicit text in those documents.

const CURATED: GECDNode[] = [

  // ── Geometry as weapon ───────────────────────────────────────────────────────

  {
    id: "node_cylinder_seal_uruk_001",
    name: "Cylinder Seal (Uruk period)",
    date_bce: 3500, date_ce: null, date_display: "c. 3500 BCE",
    geometric_element: "circle",
    deity: "Inanna",
    magic_drivers: { math: 0.3, aesthetic: 0.6, institutional: 0.95, comptroller: 0.9 },
    description: "Invented at Uruk c. 3500 BCE — a cylindrical stone carved with intaglio designs rolled across wet clay to produce infinitely repeating ideological imagery. Over 200,000 estimated unexcavated from Uruk period alone.",
    provenance: "Uruk, Mesopotamia",
    civilization: "Sumerian",
    intensification_category: "functional_assembly",
    tags: ["cylinder seal", "uruk", "intaglio", "propaganda", "administrative"],
    source: "Geometry as weapon",
    notes: "Edith Porada: 'the most characteristic object created by the Sumerians'",
  },

  {
    id: "node_uruk_style_seal_001",
    name: "Uruk-style Administrative Seal",
    date_bce: 3400, date_ce: null, date_display: "c. 3400 BCE",
    geometric_element: "star",
    deity: "Inanna",
    magic_drivers: { math: 0.2, aesthetic: 0.5, institutional: 0.9, comptroller: 0.8 },
    description: "Naturalistic seals with individually distinct designs owned by elite officials 'at the top of the administrative hierarchy' (Hans Nissen). Geometric complexity encodes social rank.",
    provenance: "Uruk, Mesopotamia",
    civilization: "Sumerian",
    intensification_category: "standardized_token",
    tags: ["uruk seal", "elite", "administrative", "naturalistic", "hierarchy"],
    source: "Geometry as weapon",
    notes: "Hans Nissen's typology: Uruk-style vs Jemdet Nasr-style maps onto power structures",
  },

  {
    id: "node_jemdet_nasr_seal_001",
    name: "Jemdet Nasr Geometric Seal",
    date_bce: 3100, date_ce: null, date_display: "c. 3100–2900 BCE",
    geometric_element: "grid",
    deity: "Inanna",
    magic_drivers: { math: 0.3, aesthetic: 0.4, institutional: 0.95, comptroller: 0.85 },
    description: "Repetitive geometric motifs deployed by institutions rather than individuals. Abstract linear tree-of-life and astronomical symbols. Institutional seals used repetitive patterns because collective branding outweighed individual distinctiveness.",
    provenance: "Jemdet Nasr / Uruk, Mesopotamia",
    civilization: "Sumerian",
    intensification_category: "standardized_token",
    tags: ["jemdet nasr", "institutional seal", "geometric abstraction", "tree of life"],
    source: "Design and Aesthetics",
    notes: null,
  },

  {
    id: "node_warka_vase_001",
    name: "Warka Vase",
    date_bce: 3200, date_ce: null, date_display: "c. 3200 BCE",
    geometric_element: "triangle",
    deity: "Inanna",
    magic_drivers: { math: 0.4, aesthetic: 0.85, institutional: 0.9, comptroller: 0.5 },
    description: "Earliest known narrative relief sculpture. Four ascending register bands — water/vegetation, animals, offering-bearers, divine-royal encounter — impose geometric order as social order. Registers increase in height as social importance rises. Cylindrical form creates continuous propaganda loop.",
    provenance: "Uruk; Iraq Museum, Baghdad",
    civilization: "Sumerian",
    intensification_category: "composite_geometry",
    tags: ["warka vase", "register composition", "narrative relief", "inanna", "propaganda"],
    source: "Geometry as weapon",
    notes: "Self-referential: two vases identical to itself appear in its own top register",
  },

  {
    id: "node_victory_stele_naram_sin_001",
    name: "Victory Stele of Naram-Sin",
    date_bce: 2254, date_ce: null, date_display: "c. 2254 BCE",
    geometric_element: "triangle",
    deity: "Shamash",
    magic_drivers: { math: 0.5, aesthetic: 0.9, institutional: 0.98, comptroller: 0.3 },
    description: "Revolutionary triangular composition with god-king at mountain apex, army ascending in disciplined diagonals, enemies collapsing in organic chaos at right. Forces every viewer's eye upward along a geometric gradient terminating at Naram-Sin. Henri Frankfort: Machtkunst — 'power art'.",
    provenance: "Sippar; Louvre, Paris",
    civilization: "Akkadian",
    intensification_category: "complex_designed_system",
    tags: ["naram-sin", "stele", "triangular composition", "machtkunst", "akkadian"],
    source: "Geometry as weapon",
    notes: "Irene Winter: 'visually compresses time and space'; three eight-pointed stars of Shamash at apex",
  },

  {
    id: "node_stele_hammurabi_001",
    name: "Stele of Hammurabi",
    date_bce: 1792, date_ce: null, date_display: "c. 1792 BCE",
    geometric_element: "circle",
    deity: "Shamash",
    magic_drivers: { math: 0.7, aesthetic: 0.75, institutional: 0.98, comptroller: 0.8 },
    description: "Shamash extends rod and ring to Hammurabi — instruments of measurement, with the ring as circular boundary-setter. Justice geometrized as the capacity for accurate measurement. Hammurabi at near-equal height but composition engineered so seated Shamash would tower if standing.",
    provenance: "Sippar; Louvre, Paris",
    civilization: "Old Babylonian",
    intensification_category: "complex_designed_system",
    tags: ["hammurabi", "stele", "rod and ring", "shamash", "justice", "measurement"],
    source: "Geometry as weapon",
    notes: "Ömür Harmansah: composition 'materially incorporates' divine legitimation",
  },

  {
    id: "node_shamash_tablet_sippar_001",
    name: "Shamash Tablet from Sippar",
    date_bce: 860, date_ce: null, date_display: "c. 860 BCE",
    geometric_element: "circle",
    deity: "Shamash",
    magic_drivers: { math: 0.4, aesthetic: 0.7, institutional: 0.9, comptroller: 0.5 },
    description: "Depicts Shamash holding rod and ring symbols while seated in the E-babbar shrine. Reinforces the geometric equation: justice = accurate measurement = divine authority = the circle. Solar disc in first register alongside Ishtar's star and Sin's crescent — celestial triad.",
    provenance: "Sippar; British Museum, London",
    civilization: "Neo-Babylonian / Kassite",
    intensification_category: "composite_geometry",
    tags: ["shamash tablet", "sippar", "rod and ring", "solar disc", "celestial triad"],
    source: "Geometry as weapon",
    notes: null,
  },

  {
    id: "node_kudurru_boundary_stone_001",
    name: "Kudurru (Boundary Stone)",
    date_bce: 1350, date_ce: null, date_display: "c. 1350–900 BCE",
    geometric_element: "star",
    deity: "Shamash",
    magic_drivers: { math: 0.5, aesthetic: 0.6, institutional: 0.95, comptroller: 0.85 },
    description: "Land-grant boundary stones bearing the celestial triad in first register: solar disc of Shamash, eight-pointed star of Ishtar, crescent of Sin. Geometric symbols govern 'time, fate, and divinity' as divine legal guarantors of property rights.",
    provenance: "Various Babylonian sites; British Museum; Louvre",
    civilization: "Kassite / Neo-Babylonian",
    intensification_category: "standardized_token",
    tags: ["kudurru", "boundary stone", "celestial triad", "ishtar star", "property rights"],
    source: "Geometry as weapon",
    notes: null,
  },

  {
    id: "node_etemenanki_babylon_001",
    name: "Etemenanki (Tower of Babel Ziggurat)",
    date_bce: 600, date_ce: null, date_display: "c. 600 BCE",
    geometric_element: "star",
    deity: "Marduk",
    magic_drivers: { math: 0.7, aesthetic: 0.85, institutional: 0.98, comptroller: 0.5 },
    description: "Seven-tiered multicolored ziggurat at Babylon — each stage painted a different color representing five known planets plus sun and moon. Designed as a perfect cube (90m × 90m base, 90m tall). Most geometrically ambitious expression of divine-royal power in Mesopotamia.",
    provenance: "Babylon; no longer standing",
    civilization: "Neo-Babylonian",
    intensification_category: "complex_designed_system",
    tags: ["etemenanki", "babylon", "seven tiers", "tower of babel", "marduk", "ziggurat"],
    source: "Design and Aesthetics",
    notes: "Seven colors = seven celestial spheres; each stage dedicated to a different deity",
  },

  {
    id: "node_ishtar_star_brand_001",
    name: "Ishtar Eight-Pointed Star (Temple Slave Brand)",
    date_bce: 2000, date_ce: null, date_display: "c. 2000–500 BCE",
    geometric_element: "star",
    deity: "Inanna",
    magic_drivers: { math: 0.2, aesthetic: 0.6, institutional: 0.98, comptroller: 0.9 },
    description: "Slaves working in Ishtar's temples were physically branded with the eight-pointed star — geometry as social coercion at its most material. Originally a general heavenly symbol, by Old Babylonian period specifically identified with Venus. Deployed on cylinder seals, temple facades, boundary stones, and human flesh.",
    provenance: "Babylonian temples; documented in administrative records",
    civilization: "Old Babylonian",
    intensification_category: "simple_token",
    tags: ["ishtar", "eight-pointed star", "brand", "temple slave", "venus", "institutional"],
    source: "Geometry as weapon",
    notes: "Most extreme example of geometric coercion: symbol burned into human body",
  },

  {
    id: "node_plimpton_322_tablet_001",
    name: "Plimpton 322 Tablet",
    date_bce: 1800, date_ce: null, date_display: "c. 1800 BCE",
    geometric_element: "triangle",
    deity: "Nisaba",
    magic_drivers: { math: 0.98, aesthetic: 0.2, institutional: 0.5, comptroller: 0.4 },
    description: "Contains Pythagorean triples — potentially the world's oldest trigonometric table, 1,000 years before Pythagoras. Produced by scribes trained in the same geometric visual tradition as cylinder seal iconography. 2016 Science publication by Ossendrijver linked Babylonian trapezoid geometry to planetary tracking.",
    provenance: "Larsa (?); Columbia University, New York",
    civilization: "Old Babylonian",
    intensification_category: "complex_designed_system",
    tags: ["plimpton 322", "pythagorean triples", "trigonometry", "babylonian mathematics", "tablet"],
    source: "Geometry as weapon",
    notes: "Mathieu Ossendrijver 2016: Babylonians tracked Jupiter via trapezoid calculation — 2,400 years before Europe",
  },

  {
    id: "node_babylonian_jupiter_trapezoid_001",
    name: "Babylonian Jupiter Trapezoid Calculation",
    date_bce: 400, date_ce: null, date_display: "c. 400–350 BCE",
    geometric_element: "rectangle",
    deity: "Marduk",
    magic_drivers: { math: 0.98, aesthetic: 0.1, institutional: 0.6, comptroller: 0.3 },
    description: "Babylonian astronomers calculated Jupiter's motion by plotting velocity against time, then finding displacement as the area under the curve using trapezoid geometry. This technique — applying geometry to abstract mathematical space — was previously believed to originate in 14th-century Europe.",
    provenance: "Babylon; British Museum, London (MNB 1884)",
    civilization: "Late Babylonian",
    intensification_category: "complex_designed_system",
    tags: ["jupiter", "trapezoid", "babylonian astronomy", "velocity", "mathematical abstraction"],
    source: "Geometry as weapon",
    notes: "Published Science 2016, Ossendrijver; 2,400 years before European calculus precursors",
  },

  // ── Design and Aesthetics ────────────────────────────────────────────────────

  {
    id: "node_halaf_pottery_001",
    name: "Halaf Culture Painted Pottery",
    date_bce: 5500, date_ce: null, date_display: "c. 6000–5000 BCE",
    geometric_element: "circle",
    deity: "Inanna",
    magic_drivers: { math: 0.3, aesthetic: 0.9, institutional: 0.3, comptroller: 0.2 },
    description: "Abstract geometric patterns reminiscent of woven fabrics — bilateral, radial, and translational symmetry types demonstrating cultural drives toward order. Hair and beards in symmetrical geometrical shapes; aesthetic order extended to the human body itself.",
    provenance: "Tell Halaf, Syria; multiple museum collections",
    civilization: "Halaf Culture",
    intensification_category: "decoration",
    tags: ["halaf", "painted pottery", "geometric pattern", "symmetry", "neolithic"],
    source: "Design and Aesthetics",
    notes: null,
  },

  {
    id: "node_great_ziggurat_ur_001",
    name: "Great Ziggurat of Ur",
    date_bce: 2112, date_ce: null, date_display: "c. 2112–2095 BCE",
    geometric_element: "triangle",
    deity: "Nanna",
    magic_drivers: { math: 0.7, aesthetic: 0.85, institutional: 0.95, comptroller: 0.4 },
    description: "210 × 150 feet at base with corners oriented to compass points and walls sloping inward for structural and visual solidity, employing principles similar to the Parthenon. Dedicated to Nanna (moon god). Ascending levels connected earth to heaven through geometric progression.",
    provenance: "Ur, Iraq (Tell el-Muqayyar); partially reconstructed",
    civilization: "Ur III / Sumerian",
    intensification_category: "complex_designed_system",
    tags: ["ziggurat", "ur", "nanna", "moon god", "monumental architecture", "nanna"],
    source: "Design and Aesthetics",
    notes: "Ur-Nammu builder; walls sloped inward like Parthenon for structural and visual solidity",
  },

  {
    id: "node_potters_wheel_001",
    name: "Potter's Wheel (Slow Tournette)",
    date_bce: 3500, date_ce: null, date_display: "c. 3500 BCE",
    geometric_element: "circle",
    deity: "Nisaba",
    magic_drivers: { math: 0.65, aesthetic: 0.5, institutional: 0.3, comptroller: 0.85 },
    description: "Slow tournette rotated vessels during coiling, improving radial symmetry. Exploits rotational symmetry — circular motion generates perfect radial symmetry impossible by hand. Transition to fast wheel (mid-3rd millennium) used flywheel momentum for throwing. Required understanding of center points, radii, circumference, and uniform revolution.",
    provenance: "Uruk / Sumer, Mesopotamia",
    civilization: "Sumerian",
    intensification_category: "functional_assembly",
    tags: ["potter's wheel", "tournette", "rotational symmetry", "ceramic", "flywheel"],
    source: "Design and Aesthetics",
    notes: null,
  },

  {
    id: "node_transportation_wheel_001",
    name: "Transportation Wheel",
    date_bce: 3200, date_ce: null, date_display: "c. 3200–3000 BCE",
    geometric_element: "circle",
    deity: "Enlil",
    magic_drivers: { math: 0.7, aesthetic: 0.2, institutional: 0.3, comptroller: 0.95 },
    description: "Observer of the potter's wheel recognized its lateral application — solid wooden discs on axles create carts. Constant radius ensures every circumference point travels same distance during rotation. Distance per revolution = πd. Later innovations: multi-plank construction, bronze-reinforced hubs, spoked designs.",
    provenance: "Sumer, Mesopotamia",
    civilization: "Sumerian",
    intensification_category: "functional_assembly",
    tags: ["wheel", "transportation", "rotary motion", "cart", "pi", "circumference"],
    source: "Design and Aesthetics",
    notes: "V. Gordon Childe identified rotary motion as the critical innovation of Mesopotamian civilization",
  },

  {
    id: "node_seeder_plow_001",
    name: "Seeder-Plow",
    date_bce: 3000, date_ce: null, date_display: "c. 3000 BCE",
    geometric_element: "line",
    deity: "Enlil",
    magic_drivers: { math: 0.5, aesthetic: 0.1, institutional: 0.3, comptroller: 0.95 },
    description: "Funnel seeder attached to plow blade drops grain as the blade cuts furrows — combining tilling and planting in one pass. Blade creates parallel linear furrows at consistent depth and spacing. Administrative tablets show routine field geometry calculations: furrow spacing, seed distribution rates, total field area.",
    provenance: "Sumer, Mesopotamia",
    civilization: "Sumerian",
    intensification_category: "functional_assembly",
    tags: ["seeder plow", "agriculture", "furrow", "parallel lines", "grain"],
    source: "Design and Aesthetics",
    notes: null,
  },

  {
    id: "node_shaduf_001",
    name: "Shaduf (Counterweighted Lever)",
    date_bce: 3000, date_ce: null, date_display: "c. 3000 BCE",
    geometric_element: "arc",
    deity: "Enlil",
    magic_drivers: { math: 0.65, aesthetic: 0.1, institutional: 0.2, comptroller: 0.9 },
    description: "Counterweighted lever on pivot with bucket — lifts water from rivers to irrigation channels. Mechanical advantage = effort arm / load arm. Efficiency 60–82%; one operator could lift 39–130 L/min over 1.8–6.2 m heights. Lever mechanics depend on distance ratios from the fulcrum.",
    provenance: "Sumer, Mesopotamia",
    civilization: "Sumerian",
    intensification_category: "functional_assembly",
    tags: ["shaduf", "lever", "irrigation", "mechanical advantage", "counterweight"],
    source: "Design and Aesthetics",
    notes: null,
  },

  {
    id: "node_cuneiform_stylus_001",
    name: "Cuneiform Reed Stylus (gi dub.ba)",
    date_bce: 3200, date_ce: null, date_display: "c. 3200 BCE",
    geometric_element: "cone",
    deity: "Nisaba",
    magic_drivers: { math: 0.7, aesthetic: 0.3, institutional: 0.8, comptroller: 0.7 },
    description: "Split giant reed (Arundo donax) with triangular or rectangular cross-section, pressed at angles into clay to create wedge impressions. Each wedge is a tetrahedral impression; stylus tip is a polyhedral cone. Wrist supination allowed efficient transitions between horizontal and vertical wedges.",
    provenance: "Uruk / Sumer, Mesopotamia",
    civilization: "Sumerian",
    intensification_category: "object_form",
    tags: ["cuneiform", "stylus", "wedge", "reed", "writing", "nisaba"],
    source: "Design and Aesthetics",
    notes: "Cuneiform = wedge-form (Latin); gi dub.ba = Sumerian name for writing reed",
  },

  {
    id: "node_proto_cuneiform_tablet_001",
    name: "Proto-Cuneiform Clay Tablet",
    date_bce: 3100, date_ce: null, date_display: "c. 3100–2900 BCE",
    geometric_element: "rectangle",
    deity: "Nisaba",
    magic_drivers: { math: 0.6, aesthetic: 0.2, institutional: 0.85, comptroller: 0.9 },
    description: "Earliest writing system — pictographs pressed into clay evolved into abstract signs. Cylinder seal designs directly contributed to proto-cuneiform writing, with specific seal motifs correlating to early pictographic signs. Geometric visual language evolved into abstract symbolic communication.",
    provenance: "Uruk, Mesopotamia; Louvre; British Museum",
    civilization: "Sumerian",
    intensification_category: "standardized_token",
    tags: ["proto-cuneiform", "pictograph", "clay tablet", "writing", "administrative"],
    source: "Design and Aesthetics",
    notes: "Recent research: seal motifs directly correlated to early pictographic signs",
  },

  {
    id: "node_modular_brick_mold_001",
    name: "Modular Brick Mold",
    date_bce: 3100, date_ce: null, date_display: "c. 3100 BCE",
    geometric_element: "rectangle",
    deity: "Enlil",
    magic_drivers: { math: 0.5, aesthetic: 0.1, institutional: 0.4, comptroller: 0.95 },
    description: "Mass-produced bricks via molds producing ten or more at once — a revolutionary design innovation enabling monumental construction. Standardized units assembled into complex wholes. Modular thinking became fundamental to ziggurats and irrigation systems.",
    provenance: "Sumer, Mesopotamia",
    civilization: "Sumerian",
    intensification_category: "standardized_token",
    tags: ["brick", "modular", "mold", "construction", "standardization"],
    source: "Design and Aesthetics",
    notes: null,
  },

  {
    id: "node_nippur_school_tablets_001",
    name: "Nippur School Tablets (edubba)",
    date_bce: 2000, date_ce: null, date_display: "c. 2000–1700 BCE",
    geometric_element: "rectangle",
    deity: "Nisaba",
    magic_drivers: { math: 0.95, aesthetic: 0.1, institutional: 0.8, comptroller: 0.6 },
    description: "Over 300 school tablets reconstructing the Mesopotamian scribal curriculum: multiplication tables → geometric problem-solving (rectangles, triangles, circles, trapezoids) → second-degree algebra using geometric 'cut-and-paste' methods. Problems expressed as concrete calculations: field areas, canal volumes, brick quantities.",
    provenance: "Nippur, Iraq; Penn Museum; Oriental Institute Chicago",
    civilization: "Old Babylonian",
    intensification_category: "standardized_token",
    tags: ["nippur", "school tablets", "edubba", "scribal curriculum", "algebra", "geometry"],
    source: "Design and Aesthetics",
    notes: null,
  },

  {
    id: "node_sexagesimal_system_001",
    name: "Sexagesimal (Base-60) Number System",
    date_bce: 3000, date_ce: null, date_display: "c. 3000 BCE",
    geometric_element: "circle",
    deity: "Shamash",
    magic_drivers: { math: 0.98, aesthetic: 0.2, institutional: 0.7, comptroller: 0.7 },
    description: "Six equilateral triangles arranged around a common center divide a circle into 60-degree segments, revealing the geometric basis for base-60. Generated the 360-degree circle, 60-minute hour, and 60-second minute still governing global timekeeping. 60 has factors 1,2,3,4,5,6,10,12,15,20,30,60 — enabling efficient proportional calculations.",
    provenance: "Sumer / Babylon, Mesopotamia",
    civilization: "Sumerian / Babylonian",
    intensification_category: "complex_designed_system",
    tags: ["sexagesimal", "base-60", "360 degrees", "timekeeping", "rosette"],
    source: "history of invention",
    notes: "Six equilateral triangles → rosette → base-60 is the direct geometric derivation",
  },

  {
    id: "node_bronze_casting_001",
    name: "Bronze Casting (Lost-Wax Method)",
    date_bce: 3000, date_ce: null, date_display: "c. 3000 BCE",
    geometric_element: "cone",
    deity: "Enlil",
    magic_drivers: { math: 0.55, aesthetic: 0.3, institutional: 0.3, comptroller: 0.9 },
    description: "Bronze (90% copper, 10% tin) casting required understanding three-dimensional negative space — cavity creates the positive form. Complex objects used multi-part molds that fit together precisely. Alloy ratios, thermal expansion/contraction rates, and volume calculations for mold filling required quantitative thinking.",
    provenance: "Sumer, Mesopotamia",
    civilization: "Sumerian",
    intensification_category: "functional_assembly",
    tags: ["bronze", "casting", "mold", "metallurgy", "3d geometry"],
    source: "Design and Aesthetics",
    notes: null,
  },

  {
    id: "node_mesopotamian_rosette_001",
    name: "Mesopotamian Six-Fold Rosette",
    date_bce: 3500, date_ce: null, date_display: "c. 3500 BCE",
    geometric_element: "star",
    deity: "Inanna",
    magic_drivers: { math: 0.75, aesthetic: 0.9, institutional: 0.5, comptroller: 0.2 },
    description: "Six equilateral triangles rotated radially around a central point create six-fold rosettes — the foundation of Mesopotamian decorative arts and mathematical systems. When six equilateral triangles meet at a center, they divide a circle into 60-degree segments — the direct geometric origin of base-60.",
    provenance: "Sumer, Mesopotamia; found on seals, pottery, and temple decorations",
    civilization: "Sumerian",
    intensification_category: "decoration",
    tags: ["rosette", "six-fold", "radial symmetry", "decorative", "base-60"],
    source: "history of invention",
    notes: null,
  },

  {
    id: "node_enuma_elish_geometry_001",
    name: "Enuma Elish Cosmic Division (Marduk divides Tiamat)",
    date_bce: 1750, date_ce: null, date_display: "c. 1750 BCE (written)",
    geometric_element: "circle",
    deity: "Marduk",
    magic_drivers: { math: 0.5, aesthetic: 0.5, institutional: 0.8, comptroller: 0.2 },
    description: "Creation myth narrates Marduk defeating Tiamat and splitting her body 'like a dried fish' to create heavens and earth — establishing cosmic order from chaos through divine geometry. Marduk organized three stars per month, organized constellations. Creation as act of divine geometry and proportion.",
    provenance: "Babylon; British Museum (Tablet of Creation)",
    civilization: "Old Babylonian / Akkadian",
    intensification_category: "object_form",
    tags: ["enuma elish", "marduk", "tiamat", "creation myth", "cosmic geometry"],
    source: "Design and Aesthetics",
    notes: null,
  },

  // ── Geometric Symbols & Cognitive Architecture ───────────────────────────────

  {
    id: "node_kekulé_benzene_001",
    name: "Kekulé Benzene Ring Discovery (Geometric Cognition)",
    date_bce: null, date_ce: 1865, date_display: "1865 CE",
    geometric_element: "circle",
    deity: "Nisaba",
    magic_drivers: { math: 0.95, aesthetic: 0.4, institutional: 0.1, comptroller: 0.1 },
    description: "Kekulé's ouroboros (snake biting its tail) vision did not evoke feeling about benzene — it reorganized his chemical problem space from linear chains to closed rings. Internalized geometric symbol restructured scientific reasoning. Demonstrates productive imagination vs. emotional response.",
    provenance: "Scientific literature; widely documented",
    civilization: "Modern (European)",
    intensification_category: "object_form",
    tags: ["kekule", "benzene", "ouroboros", "cognitive tool", "ring structure"],
    source: "Geometric Symbols & Cognitive Architecture in Mesapotamia",
    notes: "Johnson & Lakoff image schema theory; Shepard second-order isomorphism",
  },

  {
    id: "node_islamic_tessellation_001",
    name: "Islamic Geometric Tessellation (Quasi-Crystalline)",
    date_bce: null, date_ce: 900, date_display: "c. 900–1500 CE",
    geometric_element: "star",
    deity: "Nisaba",
    magic_drivers: { math: 0.95, aesthetic: 0.95, institutional: 0.4, comptroller: 0.1 },
    description: "Islamic artisans' centuries-long geometric practice instantiated quasi-crystalline mathematical structures 500 years before Western formalization. 2007 discovery: Darb-e Imam shrine (Iran) employed quasi-periodic Penrose-type tilings. Evolved from 6-point stars (9th c.) to complex 16-point designs by 16th century.",
    provenance: "Darb-e Imam shrine, Isfahan, Iran; documented across Islamic world",
    civilization: "Islamic",
    intensification_category: "complex_designed_system",
    tags: ["islamic geometry", "tessellation", "quasi-crystal", "star pattern", "penrose"],
    source: "Geometric Symbols & Cognitive Architecture in Mesapotamia",
    notes: "Fauconnier & Turner conceptual blending; emergent structure in geometric cognition",
  },

  {
    id: "node_sin_crescent_ur_001",
    name: "Sin/Nanna Crescent — Great Ziggurat of Ur",
    date_bce: 2100, date_ce: null, date_display: "c. 2100 BCE",
    geometric_element: "crescent",
    deity: "Nanna",
    magic_drivers: { math: 0.4, aesthetic: 0.7, institutional: 0.9, comptroller: 0.3 },
    description: "Sin/Nanna (moon god) carried the crescent symbol and governed the Great Ziggurat at Ur. The crescent appeared on kudurru stones in the celestial triad alongside Shamash's solar disc and Ishtar's eight-pointed star — divine legal guarantors of property rights. Crescent governed lunar calendrical calculation.",
    provenance: "Ur, Iraq; Great Ziggurat still standing",
    civilization: "Ur III / Neo-Babylonian",
    intensification_category: "object_form",
    tags: ["sin", "nanna", "crescent", "moon god", "ur", "ziggurat"],
    source: "Geometry as weapon",
    notes: null,
  },

  {
    id: "node_archimedean_screw_spiral_001",
    name: "Archimedean Screw (Spiral as Machine)",
    date_bce: 250, date_ce: null, date_display: "c. 250 BCE",
    geometric_element: "spiral",
    deity: "Enlil",
    magic_drivers: { math: 0.85, aesthetic: 0.3, institutional: 0.2, comptroller: 0.9 },
    description: "Spiral geometry — one of humanity's oldest motifs (Newgrange, 3200 BCE) — transformed into a water-lifting machine. The Archimedean screw converts rotational motion to axial fluid transport through helical geometry. Fibonacci-geometry turbine designs achieve 14–17.6% greater efficiency.",
    provenance: "Documented from Egypt and Mediterranean antiquity",
    civilization: "Hellenistic",
    intensification_category: "functional_assembly",
    tags: ["archimedean screw", "spiral", "water pump", "helix", "fibonacci"],
    source: "Geometry as weapon",
    notes: "Spiral motif documented independently at Newgrange (3200 BCE), Aboriginal Australia, pre-Columbian Americas, Mal'ta Siberia (18,000 BCE)",
  },

  // ── history of invention ─────────────────────────────────────────────────────

  {
    id: "node_antikythera_mechanism_001",
    name: "Antikythera Mechanism",
    date_bce: 100, date_ce: null, date_display: "c. 100 BCE",
    geometric_element: "circle",
    deity: "Shamash",
    magic_drivers: { math: 0.98, aesthetic: 0.5, institutional: 0.4, comptroller: 0.4 },
    description: "Earliest surviving example of geometric transformation enabling complex calculation. Circles with teeth mesh together to transmit rotational motion while changing speed and direction. Gear ratio determined by number of teeth defines how many input rotations produce one output rotation — encoding astronomical positions and eclipse predictions.",
    provenance: "Antikythera shipwreck, Greece; National Archaeological Museum, Athens",
    civilization: "Hellenistic Greek",
    intensification_category: "complex_designed_system",
    tags: ["antikythera", "gears", "astronomy", "eclipse", "mechanism", "calculation"],
    source: "history of invention",
    notes: null,
  },

  {
    id: "node_pantheon_dome_001",
    name: "Pantheon Dome (Roman)",
    date_bce: null, date_ce: 125, date_display: "c. 125 CE",
    geometric_element: "circle",
    deity: "Shamash",
    magic_drivers: { math: 0.9, aesthetic: 0.95, institutional: 0.7, comptroller: 0.3 },
    description: "Hemispherical dome 43.3 m diameter — world's largest unreinforced concrete dome. An arch rotated 360° around a vertical axis. Hemispherical shape distributes structural forces evenly. Thickness decreased toward apex while aggregate weight reduced in upper sections — geometric optimization of stress.",
    provenance: "Rome, Italy; still standing",
    civilization: "Roman",
    intensification_category: "complex_designed_system",
    tags: ["pantheon", "dome", "roman", "hemisphere", "concrete", "structural geometry"],
    source: "history of invention",
    notes: null,
  },

  {
    id: "node_mesopotamian_math_scribal_001",
    name: "Babylonian Quadratic Equations (Cut-and-Paste Geometry)",
    date_bce: 1700, date_ce: null, date_display: "c. 1700–1600 BCE",
    geometric_element: "square",
    deity: "Nisaba",
    magic_drivers: { math: 0.98, aesthetic: 0.2, institutional: 0.5, comptroller: 0.5 },
    description: "Sophisticated second-degree algebra solved through geometric 'cut-and-paste' methods: 'find the side of a square from the side and area'. Problems like 'from all four sides and the area' used what we now call quadratic equations. Likely inspired by surveying riddles; focused on areas of rectangles, triangles, circles, and trapezoids.",
    provenance: "Nippur and Larsa tablets; Yale Babylonian Collection",
    civilization: "Old Babylonian",
    intensification_category: "complex_designed_system",
    tags: ["quadratic", "cut-and-paste", "babylonian algebra", "scribe", "surveying"],
    source: "Design and Aesthetics",
    notes: null,
  },

  {
    id: "node_egyptian_pyramid_geometry_001",
    name: "Great Pyramid of Giza",
    date_bce: 2500, date_ce: null, date_display: "c. 2500 BCE",
    geometric_element: "triangle",
    deity: "Shamash",
    magic_drivers: { math: 0.95, aesthetic: 0.9, institutional: 0.95, comptroller: 0.4 },
    description: "Slope angles precisely calculated at 51°51'. Elevation encodes π, golden ratio (Φ), and Euler's number (e). Egyptian engineers used rope geometry with 3-4-5 Pythagorean triple — knotting ropes at 3-4-5 intervals to form right angles — centuries before Pythagoras.",
    provenance: "Giza, Egypt; still standing",
    civilization: "Egyptian",
    intensification_category: "complex_designed_system",
    tags: ["pyramid", "giza", "triangle", "pythagorean triple", "rope geometry", "pi"],
    source: "history of invention",
    notes: "Triangles are the only inherently rigid polygon — cannot deform without changing side lengths",
  },
];

// ─── Heuristic scanner ────────────────────────────────────────────────────────

const GEO_ELEMENTS = ["circle","star","triangle","square","spiral","arc","hexagon",
  "pyramid","dot","line","crescent","rectangle","cone","diamond","grid"];

const GEO_KEYWORDS: Record<string, string> = {
  circle: "circle|circular|round|disc|disk|rotary|wheel|sphere|ring",
  star: "star|stellar|eight-pointed|six-pointed|sun|solar",
  triangle: "triangle|triangular|pyramid|wedge|diagonal|apex|stele",
  square: "square|rectangular|quadrant|right angle|grid",
  spiral: "spiral|helix|helical|coil|swirl|vortex",
  arc: "arc|arch|dome|curved|lever|shaduf",
  hexagon: "hexagon|hexagonal|honeycomb|six-fold|tessellat",
  crescent: "crescent|moon|lunar|sin|nanna",
  rectangle: "rectangle|rectangular|tablet|brick|register",
  cone: "cone|conical|stylus|wedge|spire",
  line: "linear|line|furrow|parallel|canal|groove",
  grid: "grid|lattice|checkerboard|network|array",
};

const DEITY_KEYWORDS: Record<string, string[]> = {
  Shamash: ["shamash","sun god","solar","justice","rod and ring","sippar"],
  Inanna:  ["inanna","ishtar","ishtar","venus","eight-pointed star","temple"],
  Nanna:   ["nanna","sin","moon","crescent","ur"],
  Marduk:  ["marduk","babylon","etemenanki","jupiter","creation"],
  Enlil:   ["enlil","nippur","wind","storm","plow","agriculture"],
  Nisaba:  ["nisaba","writing","tablet","scribe","grain","scribal"],
  Tiamat:  ["tiamat","chaos","primordial","sea","dragon"],
  Nabu:    ["nabu","wisdom","scribal arts","writing","literacy"],
  Anu:     ["anu","sky","heaven","celestial","divine"],
};

const INTENSIFICATION_MAP: [RegExp, string][] = [
  [/tablet|inscription|document|record/i, "standardized_token"],
  [/ziggurat|temple|palace|monument|architecture/i, "complex_designed_system"],
  [/seal|stamp|mold|brand/i, "functional_assembly"],
  [/wheel|plow|lever|screw|pump|machine/i, "functional_assembly"],
  [/pottery|vessel|vase|bowl/i, "object_form"],
  [/carving|relief|painting|decoration|mosaic/i, "decoration"],
  [/token|bead|amulet|talisman/i, "simple_token"],
];

// Date patterns: "c. 3500 BCE", "ca. 1800 BCE", "(c. 2254 BCE)", "3200 BCE", "3100–2900 BCE"
const DATE_RE = /(?:c(?:a)?\.?\s*)?(\d{1,4})(?:–\d{1,4})?\s*BCE/;

function detectGeo(text: string): string {
  const lower = text.toLowerCase();
  for (const [geo, kw] of Object.entries(GEO_KEYWORDS)) {
    if (new RegExp(kw).test(lower)) return geo;
  }
  return "circle";
}

function detectDeity(text: string): string {
  const lower = text.toLowerCase();
  for (const [deity, kws] of Object.entries(DEITY_KEYWORDS)) {
    if (kws.some(k => lower.includes(k))) return deity;
  }
  return "Inanna";
}

function detectIntensification(text: string): string {
  for (const [re, cat] of INTENSIFICATION_MAP) {
    if (re.test(text)) return cat;
  }
  return "object_form";
}

function scoreMagic(text: string): MagicDrivers {
  const t = text.toLowerCase();
  return {
    math:         Math.min(1, ([/math|calcul|geometr|algebr|equation|number|formula|measure|trigon/g].flatMap(r => t.match(r) ?? []).length * 0.15 + 0.1)),
    aesthetic:    Math.min(1, ([/design|art|beauty|decorat|pattern|symmetr|ornament|relief|aesthetic/g].flatMap(r => t.match(r) ?? []).length * 0.15 + 0.1)),
    institutional:Math.min(1, ([/king|royal|temple|state|power|authority|institution|official|divine|law/g].flatMap(r => t.match(r) ?? []).length * 0.15 + 0.1)),
    comptroller:  Math.min(1, ([/administ|record|account|inventory|distribution|trade|economic|storage/g].flatMap(r => t.match(r) ?? []).length * 0.15 + 0.1)),
  };
}

function slugify(name: string): string {
  return "node_scan_" + name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 50);
}

interface ScanNode extends GECDNode { _heuristic: true }

function scanFile(filePath: string, rel: string): ScanNode[] {
  const text = fs.readFileSync(filePath, "utf-8");
  const lines = text.split("\n");
  const nodes: ScanNode[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Look for lines that name an artifact with a date
    const dateM = DATE_RE.exec(line);
    if (!dateM) continue;
    const dateBce = parseInt(dateM[1]);

    // Try to extract an artifact name — look for bold or title-case phrases near the date
    const boldM = /\*\*([^*]+)\*\*/.exec(line);
    const titleM = /(?:The\s+)?([A-Z][A-Za-z\s'-]{4,40})(?:\s*\(|,|\s*—)/.exec(line);
    const rawName = boldM?.[1] || titleM?.[1];
    if (!rawName || rawName.length < 5) continue;
    const name = rawName.trim();

    // Skip if it's already in curated list
    const slug = slugify(name);
    if (seen.has(slug)) continue;
    if (CURATED.some(c => c.name.toLowerCase().includes(name.toLowerCase().slice(0, 15)))) continue;
    seen.add(slug);

    // Build context window (±3 lines)
    const ctx = lines.slice(Math.max(0, i - 3), Math.min(lines.length, i + 4)).join(" ");

    nodes.push({
      _heuristic: true,
      id: slug,
      name,
      date_bce: dateBce,
      date_ce: null,
      date_display: `c. ${dateBce} BCE`,
      geometric_element: detectGeo(ctx),
      deity: detectDeity(ctx),
      magic_drivers: scoreMagic(ctx),
      description: line.replace(/\*\*/g, "").replace(/\[[\d,\s]+\]/g, "").trim().slice(0, 300),
      provenance: "",
      civilization: /egypt/i.test(ctx) ? "Egyptian" : /greek|hellenistic/i.test(ctx) ? "Hellenistic" : /roman/i.test(ctx) ? "Roman" : "Mesopotamian",
      intensification_category: detectIntensification(ctx),
      tags: [name.toLowerCase().split(" ").slice(0, 2).join("-"), `${dateBce}-bce`],
      source: rel,
      notes: null,
    });
  }
  return nodes;
}

// ─── DB write ─────────────────────────────────────────────────────────────────

async function upsertNode(node: GECDNode): Promise<boolean> {
  if (!node.id || !node.name) return false;
  const nodeId = `gecd:${node.id}`;
  const payload = {
    ...node,
    magic_drivers: {
      math:          Number(node.magic_drivers.math.toFixed(2)),
      aesthetic:     Number(node.magic_drivers.aesthetic.toFixed(2)),
      institutional: Number(node.magic_drivers.institutional.toFixed(2)),
      comptroller:   Number(node.magic_drivers.comptroller.toFixed(2)),
    },
  };
  try {
    await pool.query(
      `INSERT INTO graph_nodes (node_id, node_type, label, description, payload, tags, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (node_id) DO UPDATE
         SET label       = EXCLUDED.label,
             payload     = EXCLUDED.payload,
             description = EXCLUDED.description`,
      [nodeId, "gecd_node", node.name, node.description ?? null, JSON.stringify(payload), node.tags ?? []]
    );
    return true;
  } catch (e: any) {
    process.stderr.write(`  DB error ${nodeId}: ${e.message}\n`);
    return false;
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const RESEARCH_FILES = [
  "attached_assets/RESEARCH INGESTION/Design and Aesthetics",
  "attached_assets/RESEARCH INGESTION/Geometric Symbols & Cognitive Architecture in Mesapotamia",
  "attached_assets/RESEARCH INGESTION/Geometry as weapon",
  "attached_assets/RESEARCH INGESTION/history of invention",
];

async function main() {
  if (!DATABASE_URL) { console.error("ERROR: DATABASE_URL not set"); process.exit(1); }

  process.stdout.write(`\n🏛  EUCLID REGEX BATCH INGEST (zero LLM)\n`);
  process.stdout.write(`${"─".repeat(60)}\n`);

  // 1. Write curated seed records
  process.stdout.write(`\n[1/2] Writing ${CURATED.length} curated seed nodes...\n`);
  let curatedOk = 0;
  for (const node of CURATED) {
    const ok = await upsertNode(node);
    if (ok) { curatedOk++; process.stdout.write(`  ✓ ${node.name} (${node.date_display})\n`); }
    else process.stdout.write(`  ✗ ${node.name}\n`);
  }

  // 2. Heuristic scan of research files for additional date-tagged artifacts
  process.stdout.write(`\n[2/2] Heuristic scan of ${RESEARCH_FILES.length} research files...\n`);
  let scanTotal = 0, scanOk = 0;
  for (const fp of RESEARCH_FILES) {
    const rel = path.basename(fp);
    if (!fs.existsSync(fp)) { process.stdout.write(`  ⚠ not found: ${fp}\n`); continue; }
    const found = scanFile(fp, rel);
    scanTotal += found.length;
    for (const node of found) {
      const ok = await upsertNode(node);
      if (ok) {
        scanOk++;
        process.stdout.write(`  + ${node.name} (${node.date_display}) [${rel.slice(0,25)}]\n`);
      }
    }
  }

  await pool.end();

  process.stdout.write(`\n${"═".repeat(60)}\n`);
  process.stdout.write(`✅  Curated: ${curatedOk}/${CURATED.length}  Heuristic: ${scanOk}/${scanTotal}\n`);
  process.stdout.write(`   Refresh /timeline to see all nodes in 3D space\n\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
