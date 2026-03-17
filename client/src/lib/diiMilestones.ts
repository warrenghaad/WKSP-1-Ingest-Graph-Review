export interface DIIMilestone {
  phase: "discovery" | "innovation" | "invention";
  title: string;
  year: number;
  description: string;
  imageUrl: string;
  magicDrivers: string[];
}

export interface CivDIICycle {
  cycle: number;
  milestones: DIIMilestone[];
}

export type CivDIIData = Record<string, CivDIICycle[]>;

export const DII_MILESTONES: CivDIIData = {
  sumer: [
    {
      cycle: 1,
      milestones: [
        {
          phase: "discovery",
          title: "Clay Token Accounting",
          year: -3500,
          description: "Clay tokens enclosed in bullae for counting goods — first abstract quantity records",
          imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/ME11_217_3.jpg",
          magicDrivers: ["M"],
        },
        {
          phase: "innovation",
          title: "Cuneiform Script",
          year: -3200,
          description: "Pictographic marks on clay evolve into wedge-shaped writing system combining M, A, and I",
          imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DP293243.jpg",
          magicDrivers: ["M", "A", "I"],
        },
        {
          phase: "invention",
          title: "Sexagesimal Number System",
          year: -3000,
          description: "Base-60 positional notation — all 5 MAGIC drivers converge: math, aesthetics of notation, geometric division, institutional standardization, state accounting power",
          imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DP360672.jpg",
          magicDrivers: ["M", "A", "G", "I", "C"],
        },
      ],
    },
    {
      cycle: 2,
      milestones: [
        {
          phase: "discovery",
          title: "Irrigation Channels",
          year: -4000,
          description: "Early canal systems channeling Euphrates water to fields — geometric land management",
          imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/ME56_81_51.jpg",
          magicDrivers: ["G"],
        },
        {
          phase: "innovation",
          title: "Cylinder Seal Engraving",
          year: -3500,
          description: "Carved cylindrical seals rolled onto clay — combining art, geometry, and institutional identity",
          imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DT860.jpg",
          magicDrivers: ["A", "G", "I"],
        },
        {
          phase: "invention",
          title: "Ziggurat Architecture",
          year: -2100,
          description: "Ziggurat of Ur — monumental stepped platform merging all five: mathematical proportions, aesthetic grandeur, geometric form, institutional religion, political authority",
          imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/ME86_11_284.jpg",
          magicDrivers: ["M", "A", "G", "I", "C"],
        },
      ],
    },
    {
      cycle: 3,
      milestones: [
        {
          phase: "discovery",
          title: "Beer Brewing Records",
          year: -3900,
          description: "Hymn to Ninkasi and ration tablets — earliest recipes recording fermentation processes",
          imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DP-15117-022.jpg",
          magicDrivers: ["I"],
        },
        {
          phase: "innovation",
          title: "The Potter's Wheel",
          year: -3500,
          description: "Rotary pottery wheel enabling symmetrical vessels — geometry meets craft and mass production",
          imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DP-23786-001.jpg",
          magicDrivers: ["G", "A", "C"],
        },
        {
          phase: "invention",
          title: "Code of Ur-Nammu",
          year: -2100,
          description: "Oldest surviving law code — mathematical penalties, institutionalized justice, aesthetic proclamation, geometric tablet layout, state power codified",
          imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DP360673.jpg",
          magicDrivers: ["M", "A", "G", "I", "C"],
        },
      ],
    },
  ],

  akkad: [
    {
      cycle: 1,
      milestones: [
        {
          phase: "discovery",
          title: "Victory Stele Carving",
          year: -2300,
          description: "Naram-Sin stele introduces diagonal composition and divine king iconography",
          imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/ME69_181.jpg",
          magicDrivers: ["A"],
        },
        {
          phase: "innovation",
          title: "Bronze Casting Head",
          year: -2250,
          description: "Akkadian bronze head (possibly Sargon) — lost-wax technique merging art, geometry, and royal power",
          imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DT923.jpg",
          magicDrivers: ["A", "G", "C"],
        },
        {
          phase: "invention",
          title: "First Empire Administration",
          year: -2334,
          description: "Sargon's unified empire — standardized weights, road system, provincial governance merging all MAGIC strands",
          imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DP-35030-001.jpg",
          magicDrivers: ["M", "A", "G", "I", "C"],
        },
      ],
    },
    {
      cycle: 2,
      milestones: [
        {
          phase: "discovery",
          title: "Akkadian Language Spread",
          year: -2300,
          description: "Akkadian becomes lingua franca — semantic abstraction from Sumerian logographic base",
          imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DP-42229-001.jpg",
          magicDrivers: ["I"],
        },
        {
          phase: "innovation",
          title: "Standardized Weights",
          year: -2280,
          description: "Uniform mina/shekel weight system across provinces — math and institutional control converge",
          imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/ME41_55.jpg",
          magicDrivers: ["M", "I", "C"],
        },
        {
          phase: "invention",
          title: "Royal Propaganda Art",
          year: -2254,
          description: "Naram-Sin's divine kingship doctrine — art, religion, geometry, and power unified in monumental form",
          imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DP-35030-001.jpg",
          magicDrivers: ["M", "A", "G", "I", "C"],
        },
      ],
    },
    {
      cycle: 3,
      milestones: [
        {
          phase: "discovery",
          title: "Copper Alloy Metallurgy",
          year: -2300,
          description: "Advanced tin-bronze alloys for weapons and tools — material science discovery",
          imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DT923.jpg",
          magicDrivers: ["M"],
        },
        {
          phase: "innovation",
          title: "Garrison Road System",
          year: -2290,
          description: "Military roads connecting cities — geometric planning meets imperial control",
          imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DP-42229-001.jpg",
          magicDrivers: ["G", "C"],
        },
        {
          phase: "invention",
          title: "Calendar Reform",
          year: -2250,
          description: "Unified agricultural/ritual calendar across the empire — all five drivers crystallized",
          imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DP293243.jpg",
          magicDrivers: ["M", "A", "G", "I", "C"],
        },
      ],
    },
  ],

  babylon: [
    {
      cycle: 1,
      milestones: [
        {
          phase: "discovery",
          title: "Algebraic Problem Texts",
          year: -1800,
          description: "Old Babylonian tablets solving quadratic equations via geometric cut-and-paste methods",
          imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DP360672.jpg",
          magicDrivers: ["M"],
        },
        {
          phase: "innovation",
          title: "Code of Hammurabi",
          year: -1754,
          description: "282 laws carved on diorite stele — legal math, aesthetic composition, institutional codification",
          imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DP360673.jpg",
          magicDrivers: ["M", "A", "I", "C"],
        },
        {
          phase: "invention",
          title: "Mathematical Astronomy",
          year: -1600,
          description: "Venus tablet of Ammisaduqa — systematic celestial observation tables merging all MAGIC strands",
          imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DP360672.jpg",
          magicDrivers: ["M", "A", "G", "I", "C"],
        },
      ],
    },
    {
      cycle: 2,
      milestones: [
        {
          phase: "discovery",
          title: "Glass-Making",
          year: -1500,
          description: "First intentional glass vessels — discovery of silica vitrification from ceramic glaze experiments",
          imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DP273239.jpg",
          magicDrivers: ["A"],
        },
        {
          phase: "innovation",
          title: "Kudurru Boundary Stones",
          year: -1200,
          description: "Carved boundary markers combining divine symbols, land geometry, and legal force",
          imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DP-23667-001.jpg",
          magicDrivers: ["G", "I", "C"],
        },
        {
          phase: "invention",
          title: "Ishtar Gate",
          year: -575,
          description: "Glazed brick gateway with geometric relief — architecture, art, religion, math, and imperial authority fused",
          imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DP-33383-001.jpg",
          magicDrivers: ["M", "A", "G", "I", "C"],
        },
      ],
    },
    {
      cycle: 3,
      milestones: [
        {
          phase: "discovery",
          title: "Zodiac Division",
          year: -500,
          description: "Division of ecliptic into 12 equal signs of 30° — geometric abstraction of celestial sphere",
          imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DP360616.jpg",
          magicDrivers: ["G"],
        },
        {
          phase: "innovation",
          title: "Lunar Ephemeris Tables",
          year: -400,
          description: "Predictive lunar tables using zigzag functions — math and institutional astronomy combined",
          imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DP360672.jpg",
          magicDrivers: ["M", "G", "I"],
        },
        {
          phase: "invention",
          title: "Predictive Planetary Theory",
          year: -350,
          description: "System A/B planetary models — full mathematical astronomy merging all five MAGIC drivers",
          imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DP360616.jpg",
          magicDrivers: ["M", "A", "G", "I", "C"],
        },
      ],
    },
  ],

  assyria: [
    {
      cycle: 1,
      milestones: [
        {
          phase: "discovery",
          title: "Iron Smelting",
          year: -1200,
          description: "Early iron-working techniques for superior weapons — material advantage discovery",
          imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DT880.jpg",
          magicDrivers: ["M"],
        },
        {
          phase: "innovation",
          title: "Siege Engineering",
          year: -900,
          description: "Battering rams, siege towers, mobile ramps — geometric warfare meets imperial ambition",
          imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DP-13006-002.jpg",
          magicDrivers: ["G", "M", "C"],
        },
        {
          phase: "invention",
          title: "Palace Relief Narratives",
          year: -880,
          description: "Nimrud palace reliefs — continuous visual storytelling merging art, geometry, ideology, math proportion, and royal power",
          imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DP-16679-001.jpg",
          magicDrivers: ["M", "A", "G", "I", "C"],
        },
      ],
    },
    {
      cycle: 2,
      milestones: [
        {
          phase: "discovery",
          title: "Aqueduct Systems",
          year: -700,
          description: "Sennacherib's aqueduct at Jerwan — hydraulic engineering discovery for Nineveh's water supply",
          imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DP110686.jpg",
          magicDrivers: ["G"],
        },
        {
          phase: "innovation",
          title: "Royal Library System",
          year: -650,
          description: "Ashurbanipal's library at Nineveh — systematic knowledge collection combining institutional and aesthetic priorities",
          imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/ss86_11_51.jpg",
          magicDrivers: ["I", "A", "M"],
        },
        {
          phase: "invention",
          title: "Neo-Assyrian Empire Machine",
          year: -670,
          description: "Provincial administration, deportation policy, intelligence network — total state apparatus merging all MAGIC drivers",
          imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DT880.jpg",
          magicDrivers: ["M", "A", "G", "I", "C"],
        },
      ],
    },
    {
      cycle: 3,
      milestones: [
        {
          phase: "discovery",
          title: "Lamassu Colossi",
          year: -720,
          description: "Massive winged-bull gateway guardians — sculptural discovery of composite divine-animal forms",
          imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DT880.jpg",
          magicDrivers: ["A"],
        },
        {
          phase: "innovation",
          title: "Lion Hunt Reliefs",
          year: -645,
          description: "Ashurbanipal's lion hunt panels — artistic mastery with geometric composition and royal ideology",
          imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DP-33308-002.jpg",
          magicDrivers: ["A", "G", "C"],
        },
        {
          phase: "invention",
          title: "Palace of Sennacherib",
          year: -700,
          description: "Palace Without Rival at Nineveh — 71 rooms of carved reliefs, all MAGIC dimensions in architectural totality",
          imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DP-16679-001.jpg",
          magicDrivers: ["M", "A", "G", "I", "C"],
        },
      ],
    },
  ],

  elam: [
    {
      cycle: 1,
      milestones: [
        {
          phase: "discovery",
          title: "Proto-Elamite Script",
          year: -3100,
          description: "Independent writing system predating most cuneiform — unique sign repertoire undeciphered to this day",
          imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DP162091.jpg",
          magicDrivers: ["M"],
        },
        {
          phase: "innovation",
          title: "Bronze Sit-Shamshi Table",
          year: -1150,
          description: "Cast bronze ritual table showing temple ceremony — art, religious institution, and metalwork geometry combined",
          imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/ME52_74_1.jpg",
          magicDrivers: ["A", "G", "I"],
        },
        {
          phase: "invention",
          title: "Susa Ziggurats",
          year: -1250,
          description: "Chogha Zanbil — unique Elamite temple complex with concentric square plan merging all MAGIC factors",
          imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/ME48_98_11.jpg",
          magicDrivers: ["M", "A", "G", "I", "C"],
        },
      ],
    },
    {
      cycle: 2,
      milestones: [
        {
          phase: "discovery",
          title: "Painted Pottery Traditions",
          year: -4000,
          description: "Susa I painted ceramics — geometric patterns revealing mathematical sensibility",
          imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DP-12449-001.jpg",
          magicDrivers: ["A"],
        },
        {
          phase: "innovation",
          title: "Stele of Untash-Napirisha",
          year: -1260,
          description: "Royal dedication stele with Elamite cuneiform — blending imported script with local institutional needs",
          imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/ME52_74_1.jpg",
          magicDrivers: ["I", "A", "C"],
        },
        {
          phase: "invention",
          title: "Elamite Linear Script",
          year: -2200,
          description: "Unique linear writing system independent from cuneiform — full cultural technology merging all five drivers",
          imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DP162091.jpg",
          magicDrivers: ["M", "A", "G", "I", "C"],
        },
      ],
    },
    {
      cycle: 3,
      milestones: [
        {
          phase: "discovery",
          title: "Chlorite Vessel Carving",
          year: -2600,
          description: "Jiroft chlorite vessels with elaborate mythical scenes — stone-carving as cultural medium",
          imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/ME48_98_11.jpg",
          magicDrivers: ["A"],
        },
        {
          phase: "innovation",
          title: "Hammurabi Stele Seizure",
          year: -1160,
          description: "Shutruk-Nahhunte captures Hammurabi stele — cultural appropriation as institutional power move",
          imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DP-12449-001.jpg",
          magicDrivers: ["I", "C"],
        },
        {
          phase: "invention",
          title: "Elamite Queen Regency",
          year: -1500,
          description: "Institutionalized female co-rulership unique in ancient Near East — all MAGIC drivers in governance innovation",
          imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/ME52_74_1.jpg",
          magicDrivers: ["M", "A", "G", "I", "C"],
        },
      ],
    },
  ],

  egypt: [
    {
      cycle: 1,
      milestones: [
        {
          phase: "discovery",
          title: "Hieroglyphic Writing",
          year: -3200,
          description: "Sacred carved script — pictographic signs encoding language through visual symbols",
          imageUrl: "https://images.metmuseum.org/CRDImages/eg/web-large/DT277011.jpg",
          magicDrivers: ["A"],
        },
        {
          phase: "innovation",
          title: "Papyrus Manufacturing",
          year: -3000,
          description: "Reed-strip lamination creating portable writing medium — institutional knowledge transfer enabled",
          imageUrl: "https://images.metmuseum.org/CRDImages/eg/web-large/DP238391.jpg",
          magicDrivers: ["A", "I", "M"],
        },
        {
          phase: "invention",
          title: "Great Pyramid of Giza",
          year: -2560,
          description: "2.3 million blocks in precise geometric alignment — mathematics, art, geometry, religion, and pharaonic power in stone",
          imageUrl: "https://images.metmuseum.org/CRDImages/eg/web-large/11.155.3b_02.jpg",
          magicDrivers: ["M", "A", "G", "I", "C"],
        },
      ],
    },
    {
      cycle: 2,
      milestones: [
        {
          phase: "discovery",
          title: "Mummification Chemistry",
          year: -2600,
          description: "Natron desiccation and resin application — chemical preservation as religious technology",
          imageUrl: "https://images.metmuseum.org/CRDImages/eg/web-large/07.229.1a-b_EGDP011797.jpg",
          magicDrivers: ["I"],
        },
        {
          phase: "innovation",
          title: "Rhind Mathematical Papyrus",
          year: -1650,
          description: "84 mathematical problems with solutions — area calculations, fractions, volume formulas bridging math and institutional training",
          imageUrl: "https://images.metmuseum.org/CRDImages/eg/web-large/DP238391.jpg",
          magicDrivers: ["M", "G", "I"],
        },
        {
          phase: "invention",
          title: "Karnak Temple Complex",
          year: -1500,
          description: "Multi-century sacred precinct — hypostyle hall merging mathematical spacing, aesthetic program, geometric alignment, theological institution, pharaonic authority",
          imageUrl: "https://images.metmuseum.org/CRDImages/eg/web-large/11.155.3b_02.jpg",
          magicDrivers: ["M", "A", "G", "I", "C"],
        },
      ],
    },
    {
      cycle: 3,
      milestones: [
        {
          phase: "discovery",
          title: "Iron Tool Adoption",
          year: -700,
          description: "Late Period adoption of iron technology from Assyrian contact — new material capability",
          imageUrl: "https://images.metmuseum.org/CRDImages/eg/web-large/DP206147.jpg",
          magicDrivers: ["M"],
        },
        {
          phase: "innovation",
          title: "Demotic Script",
          year: -650,
          description: "Simplified cursive writing enabling broader literacy — art and institutional reform",
          imageUrl: "https://images.metmuseum.org/CRDImages/eg/web-large/DT11633.jpg",
          magicDrivers: ["A", "I"],
        },
        {
          phase: "invention",
          title: "Ptolemaic Temple Program",
          year: -300,
          description: "Greek-Egyptian synthesis temples at Edfu, Dendera — all five MAGIC drivers in cross-cultural architectural invention",
          imageUrl: "https://images.metmuseum.org/CRDImages/eg/web-large/07.228.25_EGDP023144.jpg",
          magicDrivers: ["M", "A", "G", "I", "C"],
        },
      ],
    },
  ],

  persia: [
    {
      cycle: 1,
      milestones: [
        {
          phase: "discovery",
          title: "Achaemenid Gold Work",
          year: -550,
          description: "Oxus treasure and Ziwiye hoard — sophisticated gold metalwork revealing aesthetic vocabulary",
          imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DP-19135-003.jpg",
          magicDrivers: ["A"],
        },
        {
          phase: "innovation",
          title: "Persepolis Reliefs",
          year: -518,
          description: "Apadana staircase processions — geometric repetition of tribute bearers merging art, institution, and control",
          imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DP226593.jpg",
          magicDrivers: ["A", "G", "C"],
        },
        {
          phase: "invention",
          title: "Royal Road System",
          year: -500,
          description: "2,500 km highway with relay stations — all MAGIC drivers in infrastructure: mathematical planning, aesthetic way stations, geometric route, institutional courier system, imperial control",
          imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DP-19135-003.jpg",
          magicDrivers: ["M", "A", "G", "I", "C"],
        },
      ],
    },
    {
      cycle: 2,
      milestones: [
        {
          phase: "discovery",
          title: "Qanat Technology",
          year: -1000,
          description: "Underground aqueduct tunnels — geometric engineering for water transport across arid terrain",
          imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DT911.jpg",
          magicDrivers: ["G"],
        },
        {
          phase: "innovation",
          title: "Daric Gold Coinage",
          year: -515,
          description: "Standardized gold coins — mathematical weight standard with aesthetic royal imagery and economic control",
          imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DP-19135-003.jpg",
          magicDrivers: ["M", "A", "C"],
        },
        {
          phase: "invention",
          title: "Behistun Inscription",
          year: -520,
          description: "Trilingual cliff inscription — Old Persian, Elamite, Babylonian merging all five: mathematical precision, aesthetic relief, geometric scaling, institutional proclamation, royal authority",
          imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DP226593.jpg",
          magicDrivers: ["M", "A", "G", "I", "C"],
        },
      ],
    },
    {
      cycle: 3,
      milestones: [
        {
          phase: "discovery",
          title: "Paradise Garden Design",
          year: -500,
          description: "Pairidaeza — enclosed quadrilateral gardens with geometric canal division, origin of 'paradise'",
          imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DP-19135-003.jpg",
          magicDrivers: ["G"],
        },
        {
          phase: "innovation",
          title: "Sasanian Silver Plates",
          year: 300,
          description: "Royal hunting scenes on silver — refined metalwork combining artistic mastery and dynastic imagery",
          imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DT1634.jpg",
          magicDrivers: ["A", "C"],
        },
        {
          phase: "invention",
          title: "Astronomical Observatories",
          year: 200,
          description: "Gundeshapur academy's synthesis of Babylonian, Greek, and Indian astronomy — all five MAGIC drivers in knowledge institution",
          imageUrl: "https://images.metmuseum.org/CRDImages/an/web-large/DT1634.jpg",
          magicDrivers: ["M", "A", "G", "I", "C"],
        },
      ],
    },
  ],
};
