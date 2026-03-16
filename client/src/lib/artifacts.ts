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
  category: "tablet" | "seal" | "sculpture" | "architecture" | "pottery" | "weapon" | "jewelry" | "tool";
  research: Research[];
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
  { id: "uruk", name: "Uruk Period", start: -4000, end: -3100, color: "#8b6914" },
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
    name: "Cylinder Seal of Enheduanna",
    year: -2300,
    era: "akkadian",
    discoveryYear: 1927,
    location: "Ur, Iraq",
    description: "Calcite cylinder seal bearing the name of Enheduanna, high priestess of Nanna at Ur and daughter of Sargon of Akkad. She is considered the world's first known author, composing hymns to Inanna.",
    image: seal1,
    category: "seal",
    research: [
      {
        id: "r002-1",
        title: "Enheduanna and the Theology of the Sumerian Tradition",
        author: "Annette Zgoll",
        date: "1997-03-10",
        summary: "Analysis of Enheduanna's literary corpus and its theological innovations, arguing she systematized Sumerian religious thought into a coherent framework."
      },
      {
        id: "r002-2",
        title: "The Disk of Enheduanna: Iconographic Reappraisal",
        author: "Irene J. Winter",
        date: "2010-09-01",
        summary: "Re-examination of the calcite disk found at Ur, connecting its visual program to the cylinder seal and confirming the historical existence of Enheduanna."
      }
    ]
  },
  {
    id: "WIII-A-SA3-003",
    name: "Standard of Ur",
    year: -2600,
    era: "early-dynastic",
    discoveryYear: 1928,
    location: "Royal Cemetery of Ur, Iraq",
    description: "A trapezoidal box inlaid with shell, red limestone, and lapis lazuli depicting scenes of war and peace. Found in the Royal Tombs of Ur by Leonard Woolley, it reveals the social hierarchy and military organization of Early Dynastic Sumer.",
    image: pottery1,
    category: "sculpture",
    research: [
      {
        id: "r003-1",
        title: "The Royal Cemetery of Ur: Woolley's Excavation Notebooks",
        author: "C. Leonard Woolley",
        date: "1934-11-01",
        summary: "Original excavation report documenting the discovery context — found crushed atop a skeleton in tomb PG 779, alongside daggers and a broken lyre."
      },
      {
        id: "r003-2",
        title: "War Panel Reinterpreted: Chariotry in Early Mesopotamia",
        author: "Tammi J. Schneider",
        date: "2008-04-15",
        summary: "Analysis of the war panel's onager-drawn chariots, arguing they represent ceremonial processions rather than battlefield formations."
      }
    ]
  },
  {
    id: "WIII-A-SA3-004",
    name: "Gudea Cylinders A & B",
    year: -2125,
    era: "ur-iii",
    discoveryYear: 1877,
    location: "Girsu (modern Telloh), Iraq",
    description: "Two terracotta cylinders inscribed with the longest known Sumerian literary text. They describe in exquisite detail the building of the Eninnu temple to Ningirsu by Gudea, ruler of Lagash, including divine dream visions and precise architectural instructions.",
    image: tablet2,
    category: "tablet",
    research: [
      {
        id: "r004-1",
        title: "The Building of Ningirsu's Temple (ETCSL Translation)",
        author: "J.A. Black et al.",
        date: "1998-06-01",
        summary: "Complete transliteration and translation of both cylinders for the Electronic Text Corpus of Sumerian Literature, with commentary on architectural terminology."
      },
      {
        id: "r004-2",
        title: "Gudea's Dream: Divination and Temple Building",
        author: "Thorkild Jacobsen",
        date: "1987-01-01",
        summary: "Analysis of the dream incubation sequence in Cylinder A, connecting it to broader Mesopotamian dream omen traditions and theophanic architecture."
      }
    ]
  },
  {
    id: "WIII-A-SA3-005",
    name: "Code of Hammurabi Stele",
    year: -1754,
    era: "old-babylonian",
    discoveryYear: 1901,
    location: "Susa, Iran (originally Babylon)",
    description: "A 2.25-meter diorite stele inscribed with 282 laws issued by Hammurabi, king of Babylon. The top shows Hammurabi receiving authority from Shamash, the sun god of justice. One of the earliest and most complete written legal codes.",
    image: ziggurat1,
    category: "sculpture",
    research: [
      {
        id: "r005-1",
        title: "The Laws of Hammurabi: Context and Jurisprudence",
        author: "Martha T. Roth",
        date: "1997-01-01",
        summary: "Comprehensive legal analysis of the code, contextualizing it within prior Mesopotamian law collections (Ur-Nammu, Lipit-Ishtar) and demonstrating its roots in case law."
      },
      {
        id: "r005-2",
        title: "Shamash and the Visual Rhetoric of Divinely Ordained Law",
        author: "Zainab Bahrani",
        date: "2003-05-20",
        summary: "Art-historical analysis of the relief panel, arguing the investiture scene establishes a visual grammar of legitimate sovereignty repeated across millennia."
      }
    ]
  },
  {
    id: "WIII-A-SA3-006",
    name: "Lamassu of Dur-Sharrukin",
    year: -710,
    era: "neo-assyrian",
    discoveryYear: 1843,
    location: "Khorsabad (Dur-Sharrukin), Iraq",
    description: "Monumental human-headed winged bull carved from a single block of gypsum alabaster. These colossi guarded the gates of Sargon II's palace, combining human intelligence, bovine strength, and eagle's flight in an apotropaic form.",
    image: ziggurat2,
    category: "sculpture",
    research: [
      {
        id: "r006-1",
        title: "Guardian Figures at the Gates of Mesopotamia",
        author: "Paul Collins",
        date: "2014-09-15",
        summary: "Contextualizes the lamassu within Assyrian palace programs, noting their five-legged design creates the illusion of motion from the side while appearing stationary from the front."
      },
      {
        id: "r006-2",
        title: "Botta's Excavation and the Birth of Assyriology",
        author: "Mogens Trolle Larsen",
        date: "1996-03-01",
        summary: "Historical account of Paul-Émile Botta's discovery at Khorsabad in 1843, the first major Assyrian site excavated, and its impact on European understanding of ancient Mesopotamia."
      }
    ]
  },
  {
    id: "WIII-A-SA3-007",
    name: "Flood Tablet (Gilgamesh Tablet XI)",
    year: -650,
    era: "neo-assyrian",
    discoveryYear: 1853,
    location: "Library of Ashurbanipal, Nineveh, Iraq",
    description: "Clay tablet containing the Babylonian flood narrative as told by Utnapishtim to Gilgamesh. Discovered by George Smith in 1872, its parallels to the Genesis account caused a sensation in Victorian England.",
    image: seal2,
    category: "tablet",
    research: [
      {
        id: "r007-1",
        title: "George Smith's Discovery: Reaction and Ramifications",
        author: "David Damrosch",
        date: "2006-10-10",
        summary: "Account of Smith's dramatic 1872 lecture at the Society of Biblical Archaeology and the Daily Telegraph's sponsorship of his expedition to find the missing fragment."
      },
      {
        id: "r007-2",
        title: "Atrahasis, Gilgamesh, and Genesis: Comparative Flood Traditions",
        author: "W.G. Lambert & A.R. Millard",
        date: "1969-01-01",
        summary: "Foundational comparative study tracing the flood narrative from the Old Babylonian Atrahasis through the Standard Babylonian Gilgamesh to the Hebrew Bible."
      }
    ]
  },
  {
    id: "WIII-A-SA3-008",
    name: "Ishtar Gate Glazed Bricks",
    year: -575,
    era: "neo-babylonian",
    discoveryYear: 1902,
    location: "Babylon, Iraq",
    description: "Glazed brick panels from the Ishtar Gate of Babylon, built by Nebuchadnezzar II. Depicting mušḫuššu dragons and aurochs in raised relief on brilliant lapis-lazuli blue glaze, it was the eighth gate to the inner city.",
    image: pottery2,
    category: "architecture",
    research: [
      {
        id: "r008-1",
        title: "Koldewey's Babylon: Architecture, Stratigraphy, and the Reconstruction Question",
        author: "Olof Pedersén",
        date: "2005-01-01",
        summary: "Analysis of Robert Koldewey's meticulous excavation methods at Babylon (1899-1917) and the controversial decision to reconstruct the gate in the Pergamon Museum."
      },
      {
        id: "r008-2",
        title: "Chromatic Meaning: Blue Glaze Technology in Neo-Babylonian Architecture",
        author: "Annie Caubet",
        date: "2007-11-30",
        summary: "Technical analysis of cobalt-based blue glazing techniques, arguing the color choice was deliberate symbolic reference to lapis lazuli and cosmic waters."
      }
    ]
  },
  {
    id: "WIII-A-SA3-009",
    name: "Cyrus Cylinder",
    year: -539,
    era: "achaemenid",
    discoveryYear: 1879,
    location: "Babylon, Iraq",
    description: "A barrel-shaped clay cylinder inscribed in Akkadian cuneiform, recording Cyrus the Great's conquest of Babylon. Often called the 'first declaration of human rights,' it describes the restoration of deported peoples and religious sanctuaries.",
    image: tablet1,
    category: "tablet",
    research: [
      {
        id: "r009-1",
        title: "The Cyrus Cylinder: The King of Persia's Proclamation from Ancient Babylon",
        author: "Irving Finkel (ed.)",
        date: "2013-06-01",
        summary: "Comprehensive volume including new translations, historical context, and analysis of the cylinder's modern political reception as a symbol of tolerance."
      },
      {
        id: "r009-2",
        title: "Mesopotamian Precedents to the Cyrus Cylinder",
        author: "Hanspeter Schaudig",
        date: "2001-01-01",
        summary: "Demonstrates the cylinder follows a standard Mesopotamian genre of building inscriptions, challenging its characterization as unprecedented in its claims."
      }
    ]
  },
  {
    id: "WIII-A-SA3-010",
    name: "Ubaid Lizard Figurines",
    year: -5500,
    era: "ubaid",
    discoveryYear: 1919,
    location: "Ur, Iraq",
    description: "Terracotta figurines with elongated heads and slit eyes, often described as 'lizard-headed.' Found in the Ubaid-period levels at Ur and Eridu, their purpose — votive, apotropaic, or representational — remains debated.",
    image: pottery1,
    category: "pottery",
    research: [
      {
        id: "r010-1",
        title: "Ubaid Figurines: An Interpretive Framework",
        author: "Joan Oates",
        date: "1978-01-01",
        summary: "Survey of Ubaid-period figurine types, arguing the 'lizard' features are stylistic conventions representing human figures rather than supernatural beings."
      },
      {
        id: "r010-2",
        title: "Pre-Urban Ritual in Southern Mesopotamia",
        author: "Augusta McMahon",
        date: "2020-03-15",
        summary: "Contextualizes the figurines within Ubaid ritual deposits at Eridu Temple VII, suggesting they functioned as votive offerings in the earliest known temple."
      }
    ]
  },
  {
    id: "WIII-A-SA3-011",
    name: "Warka Vase",
    year: -3200,
    era: "uruk",
    discoveryYear: 1934,
    location: "Uruk (modern Warka), Iraq",
    description: "A carved alabaster vessel over one meter tall, depicting a hierarchical procession of offerings to Inanna. Considered the earliest known example of narrative relief sculpture, it illustrates the cosmic order of Sumerian theology.",
    image: seal2,
    category: "sculpture",
    research: [
      {
        id: "r011-1",
        title: "The Warka Vase: Narrative Art in Late Uruk",
        author: "Holly Pittman",
        date: "2001-01-01",
        summary: "Detailed iconographic analysis of the three registers, arguing the vase depicts the sacred marriage ritual (hieros gamos) between the ruler and Inanna."
      },
      {
        id: "r011-2",
        title: "Looting, Recovery, and Restoration of the Warka Vase",
        author: "John Curtis",
        date: "2005-07-01",
        summary: "Documents the vase's theft from the Iraq Museum in 2003 and its dramatic recovery — returned anonymously in the trunk of a car, broken into 14 pieces."
      }
    ]
  },
  {
    id: "WIII-A-SA3-012",
    name: "Sumerian King List (WB 444)",
    year: -1800,
    era: "old-babylonian",
    discoveryYear: 1906,
    location: "Larsa, Iraq",
    description: "A cuneiform prism listing Sumerian and Akkadian kings from antediluvian rulers through historical dynasties. Blends mythology with history, recording reigns of tens of thousands of years for the earliest kings before the flood.",
    image: tablet2,
    category: "tablet",
    research: [
      {
        id: "r012-1",
        title: "The Sumerian King List: A Textual Criticism",
        author: "Thorkild Jacobsen",
        date: "1939-01-01",
        summary: "The foundational study establishing the King List as a political document legitimizing the concept of unitary kingship by presenting sequential dynasties that actually overlapped."
      },
      {
        id: "r012-2",
        title: "Antediluvian Reigns and Sexagesimal Mathematics",
        author: "Jöran Friberg",
        date: "2007-01-01",
        summary: "Mathematical analysis showing the impossibly long antediluvian reigns are based on multiples of 3600 (šar), suggesting a cosmological rather than historical counting system."
      }
    ]
  }
];

export const sortedArtifacts = [...artifacts].sort((a, b) => a.year - b.year);

export const CATEGORIES = [
  { id: "tablet", label: "Tablets", icon: "📜" },
  { id: "seal", label: "Seals", icon: "🔘" },
  { id: "sculpture", label: "Sculpture", icon: "🗿" },
  { id: "architecture", label: "Architecture", icon: "🏛️" },
  { id: "pottery", label: "Pottery", icon: "🏺" },
  { id: "weapon", label: "Weapons", icon: "⚔️" },
  { id: "jewelry", label: "Jewelry", icon: "💎" },
  { id: "tool", label: "Tools", icon: "🔧" },
] as const;
