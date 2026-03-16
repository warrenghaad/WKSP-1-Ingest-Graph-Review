import type { MAGICVector } from "./magicFramework";

export interface Research {
  id: string;
  title: string;
  author: string;
  date: string;
  summary: string;
}

export interface Artifact {
  id: string;
  name: string;
  year: number;
  endYear?: number;
  era: string;
  discoveryYear: number;
  location: string;
  description: string;
  image: string;
  category: "tablet" | "seal" | "sculpture" | "architecture" | "pottery" | "weapon" | "jewelry" | "tool" | "stele";
  research: Research[];
  magic?: {
    sectionRoles: string[];
    primaryVector?: MAGICVector;
    gea?: string[];
    gem?: string[];
    gecd?: string;
    keywordTags?: string[];
  };
  museumId?: string;
  museumUrl?: string;
}

import tablet1 from "@/assets/images/tablet_1.jpg";
import tablet2 from "@/assets/images/tablet_2.jpg";
import seal1 from "@/assets/images/seal_1.jpg";
import seal2 from "@/assets/images/seal_2.jpg";
import pottery1 from "@/assets/images/pottery_1.jpg";
import pottery2 from "@/assets/images/pottery_2.jpg";
import ziggurat1 from "@/assets/images/ziggurat_1.jpg";
import ziggurat2 from "@/assets/images/ziggurat_2.jpg";

export const ERAS = [
  { id: "ubaid", name: "Ubaid Period", start: -6500, end: -3800, color: "#6d5c4e" },
  { id: "halaf", name: "Halaf Culture", start: -6100, end: -5100, color: "#7a5c3e" },
  { id: "uruk", name: "Uruk Period", start: -4000, end: -3100, color: "#8b6914" },
  { id: "jemdet-nasr", name: "Jemdet Nasr", start: -3100, end: -2900, color: "#9a7b2e" },
  { id: "early-dynastic", name: "Early Dynastic", start: -2900, end: -2350, color: "#b8860b" },
  { id: "akkadian", name: "Akkadian Empire", start: -2334, end: -2154, color: "#cd853f" },
  { id: "ur-iii", name: "Third Dynasty of Ur", start: -2112, end: -2004, color: "#daa520" },
  { id: "old-babylonian", name: "Old Babylonian", start: -2000, end: -1595, color: "#d4a017" },
  { id: "kassite", name: "Kassite Period", start: -1595, end: -1155, color: "#c4a35a" },
  { id: "neo-assyrian", name: "Neo-Assyrian Empire", start: -911, end: -609, color: "#b87333" },
  { id: "neo-babylonian", name: "Neo-Babylonian", start: -626, end: -539, color: "#e6be8a" },
  { id: "achaemenid", name: "Achaemenid Period", start: -539, end: -331, color: "#c9b037" },
] as const;

export const artifacts: Artifact[] = [
  {
    id: "WIII-A-SA3-001",
    name: "Proto-Cuneiform Tablet (Uruk IV)",
    year: -3300,
    era: "uruk",
    discoveryYear: 1928,
    location: "Uruk (modern Warka), Iraq",
    description: "One of the earliest known examples of writing. This clay tablet bears proto-cuneiform signs used for administrative record-keeping — tracking grain, livestock, and labor allocations in the temple economy of Uruk.",
    image: tablet1,
    category: "tablet",
    magic: {
      sectionRoles: ["A4", "B2"],
      gea: ["wedge", "impressed-mark", "pictograph"],
      gem: ["proto-writing-system", "numerical-notation"],
      gecd: "Wedge impressions on clay tablet in 2D incised",
      keywordTags: ["i_institutionalization", "m_counting_system", "c_temple_economy"],
    },
    research: [
      {
        id: "r001-1",
        title: "Archaic Bookkeeping: Early Writing and Administrative Techniques",
        author: "Hans J. Nissen et al.",
        date: "1993-01-15",
        summary: "Comprehensive analysis of proto-cuneiform tablets from Uruk, demonstrating that the earliest writing emerged from economic necessity rather than literary expression."
      },
      {
        id: "r001-2",
        title: "Sign Frequency Analysis of Uruk IV Corpus",
        author: "Robert K. Englund",
        date: "2004-06-20",
        summary: "Statistical study identifying over 900 distinct signs in the Uruk IV period, with clustering analysis suggesting specialized administrative vocabularies."
      }
    ]
  },
  {
    id: "WIII-A-SA3-002",
    name: "Akkadian Hunting Seal",
    year: -2250,
    era: "akkadian",
    discoveryYear: 1890,
    location: "Mesopotamia",
    description: "Stone cylinder seal depicting a hunter grasping ibex between two trees with cuneiform inscription reading 'Balu-ili, cupbearer.' The continuous horizontal design demonstrates the register system — a 3D cylinder creating a 2D narrative through rolling.",
    image: seal1,
    category: "seal",
    museumId: "329090",
    museumUrl: "https://www.metmuseum.org/art/collection/search/329090",
    magic: {
      sectionRoles: ["A2", "A3", "A4"],
      gea: ["triangle", "rectangle", "bilateral-symmetry"],
      gem: ["register-composition", "narrative-frieze"],
      gecd: "GEA elements on cylinder seal in 3D→2D transformation",
      keywordTags: ["a_visual_rhetoric", "g_gea_decomposition", "a_perceptual_affordance", "c_professional_identity"],
    },
    research: [
      {
        id: "r002-1",
        title: "Cylinder Seal Iconography in the Akkadian Period",
        author: "Dominique Collon",
        date: "1982-01-01",
        summary: "Comprehensive catalogue of Akkadian seal motifs, establishing typological sequences for hunting, contest, and presentation scenes."
      },
      {
        id: "r002-2",
        title: "3D to 2D: The Dimensional Transformation of Cylinder Seal Imagery",
        author: "Holly Pittman",
        date: "2001-01-01",
        summary: "Analysis of how the cylindrical rolling action creates continuous narrative from a finite carved surface — a geometric transformation fundamental to Mesopotamian visual communication."
      }
    ]
  },
  {
    id: "WIII-A-SA3-003",
    name: "Sumerian Banquet Seal (Drinking Straws)",
    year: -2650,
    era: "early-dynastic",
    discoveryYear: 1920,
    location: "Sumer, Iraq",
    description: "Early Dynastic III cylinder seal with double-register design. Top register shows seated figures drinking through long straws from shared vessel with attendants standing. Bottom register shows attendants serving. This is the register system as information architecture.",
    image: seal2,
    category: "seal",
    museumId: "324572",
    museumUrl: "https://www.metmuseum.org/art/collection/search/324572",
    magic: {
      sectionRoles: ["A2", "A3"],
      primaryVector: { M: 0.3, A: 0.8, G: 0.8, I: 0.5, C: 0.2 },
      gea: ["horizontal-band", "hierarchical-scale"],
      gem: ["double-register", "narrative-composition"],
      gecd: "Register bands on cylinder seal in relief",
      keywordTags: ["a_visual_rhetoric", "g_gem_composition", "i_social_hierarchy", "a_register_system"],
    },
    research: [
      {
        id: "r003-1",
        title: "Banquet Scenes in Early Dynastic Art",
        author: "Jean M. Evans",
        date: "2007-09-01",
        summary: "Contextualizes communal drinking scenes within the political economy of Early Dynastic Sumer, arguing they represent state-sponsored rituals that reinforced social bonds."
      },
      {
        id: "r003-2",
        title: "The Register System as Visual Grammar",
        author: "Irene J. Winter",
        date: "2010-01-01",
        summary: "Analysis of horizontal registers as a systematic approach to organizing visual narrative — an information architecture that persisted for 3,000 years across Mesopotamian art."
      }
    ]
  },
  {
    id: "WIII-A-SA3-004",
    name: "Neo-Sumerian Presentation Scene",
    year: -2100,
    era: "ur-iii",
    discoveryYear: 1900,
    location: "Ur, Iraq",
    description: "Most common Ur III motif: seated god on throne, standing goddess with headdress leading smaller worshiper. Clear size hierarchy — God > Goddess > Human — demonstrates hierarchical scaling as visual theology. The goddess serves as divine intermediary.",
    image: seal1,
    category: "seal",
    museumId: "329060",
    museumUrl: "https://www.metmuseum.org/art/collection/search/329060",
    magic: {
      sectionRoles: ["A2", "A3", "A4"],
      primaryVector: { M: 0.3, A: 0.9, G: 0.7, I: 0.9, C: 0.3 },
      gea: ["hierarchical-scale", "bilateral-symmetry", "seated-figure"],
      gem: ["presentation-scene", "divine-intermediary-triad"],
      gecd: "Hierarchical figures on cylinder seal in relief",
      keywordTags: ["a_iconographic_chain", "i_sacred_deployment", "g_cross_carrier_persistence", "a_hierarchical_scale"],
    },
    research: [
      {
        id: "r004-1",
        title: "The Ur III Presentation Scene: Typology and Function",
        author: "Claudia Fischer",
        date: "2002-01-01",
        summary: "Catalogues over 2,000 Ur III presentation scene seals, demonstrating standardized visual vocabulary where figure scale encodes divine-human hierarchy as measurable ratios."
      },
      {
        id: "r004-2",
        title: "Proportional Reasoning in Mesopotamian Art",
        author: "Zainab Bahrani",
        date: "2003-05-20",
        summary: "Art-historical analysis arguing that hierarchical scaling is not decorative choice but a precise visual coding system where size ratios communicate theological and political claims."
      }
    ]
  },
  {
    id: "WIII-A-SA3-005",
    name: "Late Uruk Ritual Scene Seal",
    year: -3300,
    era: "uruk",
    discoveryYear: 1910,
    location: "Uruk, Iraq",
    description: "One of the EARLIEST cylinder seals (3500-3100 BCE). Shows temple façade with reed-bundle columns and ritual procession. Geometric simplicity — mostly triangles and rectangles. This is the ORIGIN of the register system.",
    image: seal2,
    category: "seal",
    museumId: "326721",
    museumUrl: "https://www.metmuseum.org/art/collection/search/326721",
    magic: {
      sectionRoles: ["A1", "A2"],
      gea: ["triangle", "rectangle", "reed-bundle-column"],
      gem: ["temple-facade", "processional-composition"],
      gecd: "Geometric primitives on earliest cylinder seal",
      keywordTags: ["a_visual_rhetoric", "g_element_identification", "i_myth", "i_cosmological_role"],
    },
    research: [
      {
        id: "r005-1",
        title: "The Invention of Visual Narrative in Late Uruk",
        author: "Hans J. Nissen",
        date: "1988-01-01",
        summary: "Documents the emergence of representational art on cylinder seals as coincident with urban state formation, arguing visual communication was a technology of governance."
      },
      {
        id: "r005-2",
        title: "Temple Architecture in the Uruk Period",
        author: "Jean-Daniel Forest",
        date: "1999-01-01",
        summary: "Reconstructs the evolution of temple forms from simple reed-bundle structures to monumental limestone buildings, tracing how architectural geometry codified cosmological beliefs."
      }
    ]
  },
  {
    id: "WIII-A-SA3-006",
    name: "Standard of Ur",
    year: -2600,
    era: "early-dynastic",
    discoveryYear: 1928,
    location: "Royal Cemetery of Ur, Iraq",
    description: "Trapezoidal box inlaid with shell, red limestone, and lapis lazuli depicting War and Peace in registers. Found in the Royal Tombs by Woolley. Demonstrates the register system at full complexity: narrative bands organized by hierarchical scale, social role, and temporal sequence.",
    image: pottery1,
    category: "sculpture",
    magic: {
      sectionRoles: ["A3", "A4"],
      primaryVector: { M: 0.1, A: 0.9, G: 0.7, I: 0.9, C: 0.3 },
      gea: ["horizontal-register", "hierarchical-scale", "bilateral-symmetry"],
      gem: ["multi-register-narrative", "war-peace-duality"],
      gecd: "Inlaid mosaic on wooden box in 2D surface with 3D carrier",
      keywordTags: ["a_iconographic_chain", "i_sacred_deployment", "c_class_stratification", "a_visual_narrative"],
    },
    research: [
      {
        id: "r006-1",
        title: "The Royal Cemetery of Ur: Woolley's Excavation Notebooks",
        author: "C. Leonard Woolley",
        date: "1934-11-01",
        summary: "Original excavation report documenting the discovery context — found crushed atop a skeleton in tomb PG 779, alongside daggers and a broken lyre."
      },
      {
        id: "r006-2",
        title: "War Panel Reinterpreted: Chariotry in Early Mesopotamia",
        author: "Tammi J. Schneider",
        date: "2008-04-15",
        summary: "Analysis of the war panel's onager-drawn chariots, arguing they represent ceremonial processions rather than battlefield formations."
      }
    ]
  },
  {
    id: "WIII-A-SA3-007",
    name: "Warka Vase",
    year: -3200,
    era: "uruk",
    discoveryYear: 1934,
    location: "Uruk (modern Warka), Iraq",
    description: "Carved alabaster vessel over one meter tall, depicting hierarchical procession of offerings to Inanna in three registers. The earliest known example of narrative relief sculpture. Illustrates the cosmic order of Sumerian theology through geometric organization of visual space.",
    image: seal2,
    category: "sculpture",
    magic: {
      sectionRoles: ["A2", "A3", "A7"],
      primaryVector: { M: 0.3, A: 0.8, G: 0.8, I: 0.5, C: 0.2 },
      gea: ["horizontal-register", "hierarchical-scale", "processional-sequence"],
      gem: ["three-register-hierarchy", "cosmic-order-composition"],
      gecd: "Relief sculpture on alabaster vessel in 3D carrier with 2.5D rendering",
      keywordTags: ["a_visual_rhetoric", "g_gea_decomposition", "i_sacred_deployment", "a_register_system"],
    },
    research: [
      {
        id: "r007-1",
        title: "The Warka Vase: Narrative Art in Late Uruk",
        author: "Holly Pittman",
        date: "2001-01-01",
        summary: "Detailed iconographic analysis of the three registers, arguing the vase depicts the sacred marriage ritual (hieros gamos) between the ruler and Inanna."
      },
      {
        id: "r007-2",
        title: "Looting, Recovery, and Restoration of the Warka Vase",
        author: "John Curtis",
        date: "2005-07-01",
        summary: "Documents the vase's theft from the Iraq Museum in 2003 and its dramatic recovery — returned anonymously in the trunk of a car, broken into 14 pieces."
      }
    ]
  },
  {
    id: "WIII-A-SA3-008",
    name: "Halaf Pottery with Spiral Designs",
    year: -5500,
    era: "halaf",
    discoveryYear: 1911,
    location: "Tell Halaf, Syria",
    description: "Pre-cuneiform, pre-urban pottery showing EARLY geometric thinking. Red/orange bowl with black painted spiral and geometric designs — symmetrical patterns around rim. Shows rotational symmetry, repeated motifs, and the spiral as mathematical curve. 6000-5000 BCE.",
    image: pottery1,
    category: "pottery",
    magic: {
      sectionRoles: ["A1", "A2", "B3"],
      gea: ["spiral", "circle", "radial-symmetry"],
      gem: ["rotational-pattern", "rim-decoration-system"],
      gecd: "Painted spiral motifs on ceramic vessel in 2D surface",
      keywordTags: ["g_element_identification", "a_visual_rhetoric", "g_gek_t_operation", "m_transformation"],
    },
    research: [
      {
        id: "r008-1",
        title: "Halaf Painted Pottery: Regional Variation and Trade Networks",
        author: "Stuart Campbell",
        date: "2007-01-01",
        summary: "Analysis of Halaf pottery distribution demonstrating that standardized geometric motifs traveled across 800+ km, implying shared symbolic vocabulary before writing existed."
      },
      {
        id: "r008-2",
        title: "The Spiral in Prehistoric Art: Cognitive and Perceptual Origins",
        author: "John Onians",
        date: "2004-01-01",
        summary: "Argues spiral motifs arise from basic perceptual processing — the brain's response to circular motion — making them a near-universal geometric starting point for decorative art."
      }
    ]
  },
  {
    id: "WIII-A-SA3-009",
    name: "Code of Hammurabi Stele",
    year: -1754,
    era: "old-babylonian",
    discoveryYear: 1901,
    location: "Susa, Iran (originally Babylon)",
    description: "2.25m diorite stele with 282 laws. Top relief: Shamash giving authority to Hammurabi. Demonstrates DUAL REGISTER: visual rhetoric (divine investiture scene) AND functional code (legal system). The register system serves both sacred meaning and administrative function.",
    image: ziggurat1,
    category: "stele",
    magic: {
      sectionRoles: ["A3", "A4", "A7", "B4"],
      primaryVector: { M: 0.5, A: 0.7, G: 0.9, I: 0.7, C: 0.6 },
      gea: ["hierarchical-scale", "register-division", "frontal-pose"],
      gem: ["investiture-scene", "law-code-format"],
      gecd: "Relief + text on diorite stele in 2.5D relief with 2D inscription",
      keywordTags: ["g_dual_register", "a_architectural_rhetoric", "m_structural_function", "c_state_commission", "i_monumental_meaning"],
    },
    research: [
      {
        id: "r009-1",
        title: "The Laws of Hammurabi: Context and Jurisprudence",
        author: "Martha T. Roth",
        date: "1997-01-01",
        summary: "Comprehensive legal analysis contextualizing the code within prior Mesopotamian law collections (Ur-Nammu, Lipit-Ishtar) and demonstrating its roots in case law."
      },
      {
        id: "r009-2",
        title: "Shamash and the Visual Rhetoric of Divinely Ordained Law",
        author: "Zainab Bahrani",
        date: "2003-05-20",
        summary: "Art-historical analysis of the relief panel, arguing the investiture scene establishes a visual grammar of legitimate sovereignty repeated across millennia."
      }
    ]
  },
  {
    id: "WIII-A-SA3-010",
    name: "YBC 7289 — √2 Tablet",
    year: -1750,
    era: "old-babylonian",
    discoveryYear: 1912,
    location: "Southern Iraq (Yale Babylonian Collection)",
    description: "Clay tablet showing a square with two diagonal lines. Numbers along sides in cuneiform calculate √2 ≈ 1.414213 — accurate to 6 decimal places. Demonstrates that Babylonians knew the Pythagorean theorem 1,400 years before Pythagoras.",
    image: tablet2,
    category: "tablet",
    magic: {
      sectionRoles: ["B2", "B3", "B4"],
      primaryVector: { M: 0.9, A: 0.2, G: 0.7, I: 0.2, C: 0.1 },
      gea: ["square", "diagonal", "right-triangle"],
      gem: ["square-with-diagonals", "irrational-number-computation"],
      gecd: "Geometric diagram on clay tablet in 2D incised",
      keywordTags: ["m_definition", "m_proof", "g_formal_properties", "m_symmetry_group"],
    },
    research: [
      {
        id: "r010-1",
        title: "Mathematics in Ancient Iraq: A Social History",
        author: "Eleanor Robson",
        date: "2008-01-01",
        summary: "Contextualizes Old Babylonian mathematics within scribal school culture, demonstrating that geometric computation was learned through standardized problem sets."
      },
      {
        id: "r010-2",
        title: "The Diagonal and the Square: YBC 7289 in Context",
        author: "Jöran Friberg",
        date: "2007-01-01",
        summary: "Technical analysis showing the base-60 computation of √2 and its relationship to surveying and construction problems in Babylonian engineering."
      }
    ]
  },
  {
    id: "WIII-A-SA3-011",
    name: "Plimpton 322 — Pythagorean Triples",
    year: -1800,
    era: "old-babylonian",
    discoveryYear: 1922,
    location: "Larsa, Iraq (Columbia University)",
    description: "Clay tablet with 15 rows of Pythagorean triples (3-4-5, 5-12-13, etc.) organized in a systematic table. 1,300 years before Pythagoras. Demonstrates that Babylonians understood integer solutions to a²+b²=c² and used them for creating perfect right angles in construction.",
    image: tablet1,
    category: "tablet",
    magic: {
      sectionRoles: ["B2", "B4", "B5"],
      primaryVector: { M: 0.9, A: 0.2, G: 0.7, I: 0.2, C: 0.1 },
      gea: ["right-triangle", "integer-sides"],
      gem: ["pythagorean-triple-table", "systematic-enumeration"],
      gecd: "Numerical table on clay tablet in 2D incised",
      keywordTags: ["m_definition", "m_proof", "m_measurement", "g_formal_properties"],
    },
    research: [
      {
        id: "r011-1",
        title: "Plimpton 322 Is Babylonian Exact Sexagesimal Trigonometry",
        author: "Daniel Mansfield & N.J. Wildberger",
        date: "2017-08-24",
        summary: "Argues Plimpton 322 represents a trigonometric table using ratios rather than angles, making it the world's oldest and most accurate trigonometric table."
      },
      {
        id: "r011-2",
        title: "Neither Sherlock Holmes Nor Babylon: A Reassessment of Plimpton 322",
        author: "Eleanor Robson",
        date: "2001-01-01",
        summary: "Counters the trigonometric interpretation, arguing the tablet is a teacher's aid for generating regular reciprocal pairs — a standard scribal school exercise."
      }
    ]
  },
  {
    id: "WIII-A-SA3-012",
    name: "Great Ziggurat of Ur",
    year: -2100,
    era: "ur-iii",
    discoveryYear: 1853,
    location: "Ur, Iraq",
    description: "Massive terraced mud-brick structure: base 64m × 46m, height ~30m, 720,000 bricks. Three staircases converge at first terrace. THE architectural proof of dual register: sacred mountain symbolism (closer to gods) AND structural engineering (weight distribution, drainage). Commissioned by Ur-Nammu.",
    image: ziggurat1,
    category: "architecture",
    magic: {
      sectionRoles: ["A7", "B1", "B5", "B6"],
      primaryVector: { M: 0.5, A: 0.7, G: 0.9, I: 0.7, C: 0.6 },
      gea: ["rectangle", "trapezoid", "stepped-terrace"],
      gem: ["ziggurat-form", "terraced-pyramid", "convergent-staircases"],
      gecd: "Monumental terraced form in mud-brick at architectural scale — 3D carrier, 3D element",
      keywordTags: ["g_dual_register", "a_architectural_rhetoric", "m_structural_function", "i_monumental_meaning", "c_state_commission"],
    },
    research: [
      {
        id: "r012-1",
        title: "The Ziggurat and Its Interpretations",
        author: "Harriet Crawford",
        date: "2015-01-01",
        summary: "Survey of ziggurat theories: sacred mountain, cosmic axis, astronomical observatory, ritual platform — arguing these functions are non-exclusive and that the form's geometric properties serve all simultaneously."
      },
      {
        id: "r012-2",
        title: "Structural Analysis of Ur-Nammu's Ziggurat",
        author: "Seton Lloyd",
        date: "1978-01-01",
        summary: "Engineering analysis of the drainage system (weep holes), baked-brick casing over sun-dried core, and terracing ratios that distribute load and prevent erosion."
      }
    ]
  },
  {
    id: "WIII-A-SA3-013",
    name: "Ur-Nammu Foundation Brick",
    year: -2100,
    era: "ur-iii",
    discoveryYear: 1920,
    location: "Ziggurat of Ur, Iraq",
    description: "Fired brick stamped with Ur-Nammu's cuneiform inscription — AND accidental dog paw prints pressed into wet clay 4,000 years ago. Demonstrates standardized modular construction (like LEGO), mass production via stamping, and the material reality of monumental building.",
    image: tablet2,
    category: "tablet",
    magic: {
      sectionRoles: ["A4", "B5", "B6"],
      gea: ["rectangle", "wedge-impression", "standardized-module"],
      gem: ["brick-module-system", "stamped-inscription"],
      gecd: "Cuneiform stamp on fired clay brick — 2D text on 3D modular construction unit",
      keywordTags: ["m_engineering_decomposition", "g_construction_sequence", "c_state_commission", "a_material_craft"],
    },
    research: [
      {
        id: "r013-1",
        title: "Mud-Brick Architecture in Ancient Mesopotamia",
        author: "Gus W. Van Beek",
        date: "1987-01-01",
        summary: "Technical analysis of brick standardization across periods, demonstrating that modular construction enabled predictable load calculations and rapid building."
      },
      {
        id: "r013-2",
        title: "Accidental Marks on Mesopotamian Bricks: Animals, Feet, and Rain",
        author: "A. Leo Oppenheim",
        date: "1964-01-01",
        summary: "Survey of accidental impressions on bricks — animal paw prints, bare footprints, rain marks — as evidence of manufacturing processes and daily life at construction sites."
      }
    ]
  },
  {
    id: "WIII-A-SA3-014",
    name: "Lamassu of Dur-Sharrukin",
    year: -710,
    era: "neo-assyrian",
    discoveryYear: 1843,
    location: "Khorsabad (Dur-Sharrukin), Iraq",
    description: "Human-headed winged bull from single gypsum block. Five legs create illusion of motion from side while appearing stationary from front. Guards Sargon II's palace gates — combining human intelligence, bovine strength, eagle flight in apotropaic form. Peak dual-register artifact.",
    image: ziggurat2,
    category: "sculpture",
    magic: {
      sectionRoles: ["A3", "A7", "B3"],
      primaryVector: { M: 0.5, A: 0.7, G: 0.9, I: 0.7, C: 0.6 },
      gea: ["bilateral-symmetry", "composite-creature", "five-legged-illusion"],
      gem: ["apotropaic-guardian", "gate-flanking-pair"],
      gecd: "Monumental composite sculpture in gypsum — 3D carrier, 3D element with optical illusion",
      keywordTags: ["g_dual_register", "a_architectural_rhetoric", "g_gek_t_operation", "i_monumental_meaning"],
    },
    research: [
      {
        id: "r014-1",
        title: "Guardian Figures at the Gates of Mesopotamia",
        author: "Paul Collins",
        date: "2014-09-15",
        summary: "Contextualizes the lamassu within Assyrian palace programs, noting the five-legged design creates the illusion of motion from the side while appearing stationary from the front."
      },
      {
        id: "r014-2",
        title: "Botta's Excavation and the Birth of Assyriology",
        author: "Mogens Trolle Larsen",
        date: "1996-03-01",
        summary: "Historical account of Paul-Émile Botta's discovery at Khorsabad in 1843 and its impact on European understanding of ancient Mesopotamia."
      }
    ]
  },
  {
    id: "WIII-A-SA3-015",
    name: "Flood Tablet (Gilgamesh Tablet XI)",
    year: -650,
    era: "neo-assyrian",
    discoveryYear: 1853,
    location: "Library of Ashurbanipal, Nineveh, Iraq",
    description: "Clay tablet with Babylonian flood narrative told by Utnapishtim to Gilgamesh. Discovered by George Smith in 1872, its parallels to Genesis caused a sensation. From the Library of Ashurbanipal — the first systematically collected library in human history.",
    image: seal2,
    category: "tablet",
    magic: {
      sectionRoles: ["A1", "A4"],
      gea: ["cuneiform-text", "tablet-format"],
      gem: ["literary-narrative", "mythological-corpus"],
      gecd: "Cuneiform text on clay tablet in 2D incised",
      keywordTags: ["i_myth", "i_cosmological_role", "c_access_control", "i_institutionalization"],
    },
    research: [
      {
        id: "r015-1",
        title: "George Smith's Discovery: Reaction and Ramifications",
        author: "David Damrosch",
        date: "2006-10-10",
        summary: "Account of Smith's dramatic 1872 lecture and the Daily Telegraph's sponsorship of his expedition to find the missing fragment."
      },
      {
        id: "r015-2",
        title: "Atrahasis, Gilgamesh, and Genesis: Comparative Flood Traditions",
        author: "W.G. Lambert & A.R. Millard",
        date: "1969-01-01",
        summary: "Foundational comparative study tracing the flood narrative from Old Babylonian Atrahasis through Standard Babylonian Gilgamesh to the Hebrew Bible."
      }
    ]
  },
  {
    id: "WIII-A-SA3-016",
    name: "Ishtar Gate Glazed Bricks",
    year: -575,
    era: "neo-babylonian",
    discoveryYear: 1902,
    location: "Babylon, Iraq",
    description: "Glazed brick panels from the eighth gate to inner Babylon, built by Nebuchadnezzar II. Mušḫuššu dragons and aurochs in raised relief on lapis-lazuli blue glaze. Demonstrates chromatic meaning: cobalt blue as deliberate reference to cosmic waters and lapis lazuli.",
    image: pottery2,
    category: "architecture",
    magic: {
      sectionRoles: ["A3", "A4", "A7"],
      primaryVector: { M: 0.2, A: 0.9, G: 0.7, I: 0.8, C: 0.6 },
      gea: ["horizontal-register", "repeated-motif", "border-pattern"],
      gem: ["processional-way-program", "gate-decoration-system"],
      gecd: "Glazed molded brick relief on architectural gate — 2.5D on 3D carrier",
      keywordTags: ["a_iconographic_chain", "a_visual_rhetoric", "i_sacred_deployment", "c_state_commission"],
    },
    research: [
      {
        id: "r016-1",
        title: "Koldewey's Babylon: Architecture, Stratigraphy, and Reconstruction",
        author: "Olof Pedersén",
        date: "2005-01-01",
        summary: "Analysis of Robert Koldewey's meticulous excavation methods at Babylon and the controversial decision to reconstruct the gate in the Pergamon Museum."
      },
      {
        id: "r016-2",
        title: "Chromatic Meaning: Blue Glaze Technology in Neo-Babylonian Architecture",
        author: "Annie Caubet",
        date: "2007-11-30",
        summary: "Technical analysis of cobalt-based blue glazing, arguing the color choice was deliberate symbolic reference to lapis lazuli and cosmic waters."
      }
    ]
  },
  {
    id: "WIII-A-SA3-017",
    name: "Cyrus Cylinder",
    year: -539,
    era: "achaemenid",
    discoveryYear: 1879,
    location: "Babylon, Iraq",
    description: "Barrel-shaped clay cylinder in Akkadian cuneiform recording Cyrus the Great's conquest of Babylon. Follows standard Mesopotamian building inscription genre but makes unprecedented claims about restoring deported peoples and religious sanctuaries.",
    image: tablet1,
    category: "tablet",
    magic: {
      sectionRoles: ["A4", "B4"],
      gea: ["cuneiform-text", "cylinder-format"],
      gem: ["royal-inscription", "legitimation-narrative"],
      gecd: "Akkadian text on barrel-shaped clay cylinder in 2D on 3D carrier",
      keywordTags: ["c_access_control", "i_institutionalization", "c_class_stratification"],
    },
    research: [
      {
        id: "r017-1",
        title: "The Cyrus Cylinder: The King of Persia's Proclamation",
        author: "Irving Finkel (ed.)",
        date: "2013-06-01",
        summary: "Comprehensive volume including translations, historical context, and analysis of the cylinder's modern political reception as a symbol of tolerance."
      },
      {
        id: "r017-2",
        title: "Mesopotamian Precedents to the Cyrus Cylinder",
        author: "Hanspeter Schaudig",
        date: "2001-01-01",
        summary: "Demonstrates the cylinder follows a standard Mesopotamian genre of building inscriptions, challenging its characterization as unprecedented."
      }
    ]
  },
  {
    id: "WIII-A-SA3-018",
    name: "Pigtailed Ladies Work Seal",
    year: -3100,
    era: "jemdet-nasr",
    discoveryYear: 1920,
    location: "Mesopotamia",
    description: "Late Uruk–Jemdet Nasr cylinder seal showing three figures with distinctive pigtails, each holding double-handled vessel. Row/procession format in abstracted geometric style. Documents women's economic roles in ancient production contexts.",
    image: seal1,
    category: "seal",
    museumId: "327067",
    museumUrl: "https://www.metmuseum.org/art/collection/search/327067",
    magic: {
      sectionRoles: ["A4", "B4"],
      gea: ["repeated-figure", "vessel-form", "geometric-abstraction"],
      gem: ["procession-pattern", "labor-scene"],
      gecd: "Geometric figures on cylinder seal — Jemdet Nasr flat abstracted style",
      keywordTags: ["c_class_stratification", "a_cross_carrier", "i_ritual_regulation", "g_carrier_diversity"],
    },
    research: [
      {
        id: "r018-1",
        title: "Women in the Earliest Cities: New Evidence from Seals",
        author: "Rita P. Wright",
        date: "2003-01-01",
        summary: "Argues that 'pigtailed ladies' seals document women in textile and brewing production — economic roles that were central to the earliest urban economies."
      },
      {
        id: "r018-2",
        title: "She Who Wrote: Enheduanna and Women of Mesopotamia",
        author: "Morgan Library & Museum",
        date: "2022-01-01",
        summary: "Exhibition catalogue connecting women's economic and intellectual contributions from seal imagery to Enheduanna's literary legacy."
      }
    ]
  },
];

export const sortedArtifacts = [...artifacts].sort((a, b) => a.year - b.year);

export const CATEGORIES = [
  { id: "tablet", label: "Tablets", icon: "📜" },
  { id: "seal", label: "Seals", icon: "🔘" },
  { id: "sculpture", label: "Sculpture", icon: "🗿" },
  { id: "stele", label: "Stele", icon: "🪨" },
  { id: "architecture", label: "Architecture", icon: "🏛️" },
  { id: "pottery", label: "Pottery", icon: "🏺" },
] as const;
