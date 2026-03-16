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
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Accountancy_clay_envelope_Louvre_Sb1932.jpg/320px-Accountancy_clay_envelope_Louvre_Sb1932.jpg",
          magicDrivers: ["M"],
        },
        {
          phase: "innovation",
          title: "Cuneiform Script",
          year: -3200,
          description: "Pictographic marks on clay evolve into wedge-shaped writing system combining M, A, and I",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Cuneiform_script2.jpg/320px-Cuneiform_script2.jpg",
          magicDrivers: ["M", "A", "I"],
        },
        {
          phase: "invention",
          title: "Sexagesimal Number System",
          year: -3000,
          description: "Base-60 positional notation — all 5 MAGIC drivers converge: math, aesthetics of notation, geometric division, institutional standardization, state accounting power",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Plimpton_322.jpg/320px-Plimpton_322.jpg",
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
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Fertile_Crescent_map.png/320px-Fertile_Crescent_map.png",
          magicDrivers: ["G"],
        },
        {
          phase: "innovation",
          title: "Cylinder Seal Engraving",
          year: -3500,
          description: "Carved cylindrical seals rolled onto clay — combining art, geometry, and institutional identity",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Cylinder_seal_banquet_scene_Ur.jpg/320px-Cylinder_seal_banquet_scene_Ur.jpg",
          magicDrivers: ["A", "G", "I"],
        },
        {
          phase: "invention",
          title: "Ziggurat Architecture",
          year: -2100,
          description: "Ziggurat of Ur — monumental stepped platform merging all five: mathematical proportions, aesthetic grandeur, geometric form, institutional religion, political authority",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Ziggarat_of_Ur_001.jpg/320px-Ziggarat_of_Ur_001.jpg",
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
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Bread-and-beer_Mesopotamia.jpg/320px-Bread-and-beer_Mesopotamia.jpg",
          magicDrivers: ["I"],
        },
        {
          phase: "innovation",
          title: "The Potter's Wheel",
          year: -3500,
          description: "Rotary pottery wheel enabling symmetrical vessels — geometry meets craft and mass production",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Beveled_rim_bowl%2C_Uruk_period%2C_from_southern_Iraq._Iraq_Museum.jpg/320px-Beveled_rim_bowl%2C_Uruk_period%2C_from_southern_Iraq._Iraq_Museum.jpg",
          magicDrivers: ["G", "A", "C"],
        },
        {
          phase: "invention",
          title: "Code of Ur-Nammu",
          year: -2100,
          description: "Oldest surviving law code — mathematical penalties, institutionalized justice, aesthetic proclamation, geometric tablet layout, state power codified",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Ur-Nammu_code_Istanbul.jpg/320px-Ur-Nammu_code_Istanbul.jpg",
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
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Victory_stele_of_Naram_Sin_9068.jpg/240px-Victory_stele_of_Naram_Sin_9068.jpg",
          magicDrivers: ["A"],
        },
        {
          phase: "innovation",
          title: "Bronze Casting Head",
          year: -2250,
          description: "Akkadian bronze head (possibly Sargon) — lost-wax technique merging art, geometry, and royal power",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Head_of_an_Akkadian_ruler%2C_Nineveh.jpg/240px-Head_of_an_Akkadian_ruler%2C_Nineveh.jpg",
          magicDrivers: ["A", "G", "C"],
        },
        {
          phase: "invention",
          title: "First Empire Administration",
          year: -2334,
          description: "Sargon's unified empire — standardized weights, road system, provincial governance merging all MAGIC strands",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Map_of_Akkad.svg/320px-Map_of_Akkad.svg.png",
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
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Letter_Enna-Dagan_Louvre_AO19682.jpg/240px-Letter_Enna-Dagan_Louvre_AO19682.jpg",
          magicDrivers: ["I"],
        },
        {
          phase: "innovation",
          title: "Standardized Weights",
          year: -2280,
          description: "Uniform mina/shekel weight system across provinces — math and institutional control converge",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Duck_weight_Louvre_AO253.jpg/240px-Duck_weight_Louvre_AO253.jpg",
          magicDrivers: ["M", "I", "C"],
        },
        {
          phase: "invention",
          title: "Royal Propaganda Art",
          year: -2254,
          description: "Naram-Sin's divine kingship doctrine — art, religion, geometry, and power unified in monumental form",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Stele_Naram_Sim_Louvre_Sb4.jpg/240px-Stele_Naram_Sim_Louvre_Sb4.jpg",
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
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Akkadian_Dagger.jpg/240px-Akkadian_Dagger.jpg",
          magicDrivers: ["M"],
        },
        {
          phase: "innovation",
          title: "Garrison Road System",
          year: -2290,
          description: "Military roads connecting cities — geometric planning meets imperial control",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Stele_of_Ushumgal.jpg/240px-Stele_of_Ushumgal.jpg",
          magicDrivers: ["G", "C"],
        },
        {
          phase: "invention",
          title: "Calendar Reform",
          year: -2250,
          description: "Unified agricultural/ritual calendar across the empire — all five drivers crystallized",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Cuneiform_tablet-_administrative_account_with_entries_concerning_malt_and_barley_groats_MET_DP-13441-007.jpg/240px-Cuneiform_tablet-_administrative_account_with_entries_concerning_malt_and_barley_groats_MET_DP-13441-007.jpg",
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
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/YBC-7289-OBV-labeled.jpg/320px-YBC-7289-OBV-labeled.jpg",
          magicDrivers: ["M"],
        },
        {
          phase: "innovation",
          title: "Code of Hammurabi",
          year: -1754,
          description: "282 laws carved on diorite stele — legal math, aesthetic composition, institutional codification",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Milkau_Oberer_Teil_der_Stele_mit_dem_Text_von_Hammurapis_Gesetzescode_369-2.jpg/240px-Milkau_Oberer_Teil_der_Stele_mit_dem_Text_von_Hammurapis_Gesetzescode_369-2.jpg",
          magicDrivers: ["M", "A", "I", "C"],
        },
        {
          phase: "invention",
          title: "Mathematical Astronomy",
          year: -1600,
          description: "Venus tablet of Ammisaduqa — systematic celestial observation tables merging all MAGIC strands",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Venus_Tablet_of_Ammisaduqa.jpg/320px-Venus_Tablet_of_Ammisaduqa.jpg",
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
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Glass_Head_of_a_man%2C_1st_century_AD%2C_Roman_-_Corning_Museum_of_Glass_-_DSC09507.jpg/240px-Glass_Head_of_a_man%2C_1st_century_AD%2C_Roman_-_Corning_Museum_of_Glass_-_DSC09507.jpg",
          magicDrivers: ["A"],
        },
        {
          phase: "innovation",
          title: "Kudurru Boundary Stones",
          year: -1200,
          description: "Carved boundary markers combining divine symbols, land geometry, and legal force",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Kudurru_Melishipak_Louvre_Sb23.jpg/240px-Kudurru_Melishipak_Louvre_Sb23.jpg",
          magicDrivers: ["G", "I", "C"],
        },
        {
          phase: "invention",
          title: "Ishtar Gate",
          year: -575,
          description: "Glazed brick gateway with geometric relief — architecture, art, religion, math, and imperial authority fused",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Ishtar_Gate_at_Berlin_Museum.jpg/240px-Ishtar_Gate_at_Berlin_Museum.jpg",
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
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Planisph%C3%A8re_British_Museum.jpg/320px-Planisph%C3%A8re_British_Museum.jpg",
          magicDrivers: ["G"],
        },
        {
          phase: "innovation",
          title: "Lunar Ephemeris Tables",
          year: -400,
          description: "Predictive lunar tables using zigzag functions — math and institutional astronomy combined",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Babylonian_tablet_recording_Halley%27s_comet.jpg/240px-Babylonian_tablet_recording_Halley%27s_comet.jpg",
          magicDrivers: ["M", "G", "I"],
        },
        {
          phase: "invention",
          title: "Predictive Planetary Theory",
          year: -350,
          description: "System A/B planetary models — full mathematical astronomy merging all five MAGIC drivers",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/British_Museum_Room_55_Cuneiform_tablet.jpg/240px-British_Museum_Room_55_Cuneiform_tablet.jpg",
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
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Assyrian_helmet_BM.jpg/240px-Assyrian_helmet_BM.jpg",
          magicDrivers: ["M"],
        },
        {
          phase: "innovation",
          title: "Siege Engineering",
          year: -900,
          description: "Battering rams, siege towers, mobile ramps — geometric warfare meets imperial ambition",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Assyrian_Attack_on_a_Town.jpg/320px-Assyrian_Attack_on_a_Town.jpg",
          magicDrivers: ["G", "M", "C"],
        },
        {
          phase: "invention",
          title: "Palace Relief Narratives",
          year: -880,
          description: "Nimrud palace reliefs — continuous visual storytelling merging art, geometry, ideology, math proportion, and royal power",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Assyrian_relief_-_Battle_scene._Kalhu_%28Nimrud%29.jpg/320px-Assyrian_relief_-_Battle_scene._Kalhu_%28Nimrud%29.jpg",
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
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Jerwan_aqueduct.jpg/320px-Jerwan_aqueduct.jpg",
          magicDrivers: ["G"],
        },
        {
          phase: "innovation",
          title: "Royal Library System",
          year: -650,
          description: "Ashurbanipal's library at Nineveh — systematic knowledge collection combining institutional and aesthetic priorities",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Library_of_Ashurbanipal_The_Flood_Tablet.jpg/240px-Library_of_Ashurbanipal_The_Flood_Tablet.jpg",
          magicDrivers: ["I", "A", "M"],
        },
        {
          phase: "invention",
          title: "Neo-Assyrian Empire Machine",
          year: -670,
          description: "Provincial administration, deportation policy, intelligence network — total state apparatus merging all MAGIC drivers",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Karte_Neuassyrisches_Reich.png/320px-Karte_Neuassyrisches_Reich.png",
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
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Lamassu_from_the_Throne_Room_of_Ashurnasirpal_II.jpg/240px-Lamassu_from_the_Throne_Room_of_Ashurnasirpal_II.jpg",
          magicDrivers: ["A"],
        },
        {
          phase: "innovation",
          title: "Lion Hunt Reliefs",
          year: -645,
          description: "Ashurbanipal's lion hunt panels — artistic mastery with geometric composition and royal ideology",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Sculpted_reliefs_depicting_Ashurbanipal%2C_the_last_great_Assyrian_king%2C_parsing_the_royal_lion_hunt.jpg/320px-Sculpted_reliefs_depicting_Ashurbanipal%2C_the_last_great_Assyrian_king%2C_parsing_the_royal_lion_hunt.jpg",
          magicDrivers: ["A", "G", "C"],
        },
        {
          phase: "invention",
          title: "Palace of Sennacherib",
          year: -700,
          description: "Palace Without Rival at Nineveh — 71 rooms of carved reliefs, all MAGIC dimensions in architectural totality",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Sennacherib%27s_palace_in_Nineveh.jpg/320px-Sennacherib%27s_palace_in_Nineveh.jpg",
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
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Tablette_proto-elamite_Sb_15200.jpg/240px-Tablette_proto-elamite_Sb_15200.jpg",
          magicDrivers: ["M"],
        },
        {
          phase: "innovation",
          title: "Bronze Sit-Shamshi Table",
          year: -1150,
          description: "Cast bronze ritual table showing temple ceremony — art, religious institution, and metalwork geometry combined",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Sit_Shamshi_table_Louvre_Sb2743.jpg/320px-Sit_Shamshi_table_Louvre_Sb2743.jpg",
          magicDrivers: ["A", "G", "I"],
        },
        {
          phase: "invention",
          title: "Susa Ziggurats",
          year: -1250,
          description: "Chogha Zanbil — unique Elamite temple complex with concentric square plan merging all MAGIC factors",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Choghazanbil2.jpg/320px-Choghazanbil2.jpg",
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
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Pot_tripode_Louvre_AO20684.jpg/240px-Pot_tripode_Louvre_AO20684.jpg",
          magicDrivers: ["A"],
        },
        {
          phase: "innovation",
          title: "Stele of Untash-Napirisha",
          year: -1260,
          description: "Royal dedication stele with Elamite cuneiform — blending imported script with local institutional needs",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Stele_of_Untash-Napirisha.jpg/240px-Stele_of_Untash-Napirisha.jpg",
          magicDrivers: ["I", "A", "C"],
        },
        {
          phase: "invention",
          title: "Elamite Linear Script",
          year: -2200,
          description: "Unique linear writing system independent from cuneiform — full cultural technology merging all five drivers",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Undeciphered_Linear_Elamite_script.jpg/240px-Undeciphered_Linear_Elamite_script.jpg",
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
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Jiroft_vase.jpg/240px-Jiroft_vase.jpg",
          magicDrivers: ["A"],
        },
        {
          phase: "innovation",
          title: "Hammurabi Stele Seizure",
          year: -1160,
          description: "Shutruk-Nahhunte captures Hammurabi stele — cultural appropriation as institutional power move",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Milkau_Oberer_Teil_der_Stele_mit_dem_Text_von_Hammurapis_Gesetzescode_369-2.jpg/240px-Milkau_Oberer_Teil_der_Stele_mit_dem_Text_von_Hammurapis_Gesetzescode_369-2.jpg",
          magicDrivers: ["I", "C"],
        },
        {
          phase: "invention",
          title: "Elamite Queen Regency",
          year: -1500,
          description: "Institutionalized female co-rulership unique in ancient Near East — all MAGIC drivers in governance innovation",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Queen_Napir-Asu_Statue.jpg/240px-Queen_Napir-Asu_Statue.jpg",
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
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Hieroglyphs_from_the_tomb_of_Seti_I.jpg/320px-Hieroglyphs_from_the_tomb_of_Seti_I.jpg",
          magicDrivers: ["A"],
        },
        {
          phase: "innovation",
          title: "Papyrus Manufacturing",
          year: -3000,
          description: "Reed-strip lamination creating portable writing medium — institutional knowledge transfer enabled",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Papyrus_Ani_curs_hiero.jpg/320px-Papyrus_Ani_curs_hiero.jpg",
          magicDrivers: ["A", "I", "M"],
        },
        {
          phase: "invention",
          title: "Great Pyramid of Giza",
          year: -2560,
          description: "2.3 million blocks in precise geometric alignment — mathematics, art, geometry, religion, and pharaonic power in stone",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Kheops-Pyramid.jpg/320px-Kheops-Pyramid.jpg",
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
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Mummy_in_Vatican_Museums.jpg/180px-Mummy_in_Vatican_Museums.jpg",
          magicDrivers: ["I"],
        },
        {
          phase: "innovation",
          title: "Rhind Mathematical Papyrus",
          year: -1650,
          description: "84 mathematical problems with solutions — area, volume, and fraction calculations for scribal training",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Rhind_Mathematical_Papyrus.jpg/320px-Rhind_Mathematical_Papyrus.jpg",
          magicDrivers: ["M", "G", "I"],
        },
        {
          phase: "invention",
          title: "Temple of Karnak",
          year: -1500,
          description: "2000-year construction project — hypostyle hall with 134 columns merging all MAGIC dimensions in sacred architecture",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/GD-EG-Karnak-Hypostyle2.jpg/320px-GD-EG-Karnak-Hypostyle2.jpg",
          magicDrivers: ["M", "A", "G", "I", "C"],
        },
      ],
    },
    {
      cycle: 3,
      milestones: [
        {
          phase: "discovery",
          title: "Astronomical Ceiling Art",
          year: -1470,
          description: "Star charts painted on tomb ceilings — mapping celestial cycles through artistic rendering",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Senenmut-Grab.JPG/320px-Senenmut-Grab.JPG",
          magicDrivers: ["G"],
        },
        {
          phase: "innovation",
          title: "Book of the Dead",
          year: -1550,
          description: "Illustrated funerary scroll — visual theology merging art, ritual institution, and scribal power",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/BD_Hunefer.jpg/400px-BD_Hunefer.jpg",
          magicDrivers: ["A", "I", "C"],
        },
        {
          phase: "invention",
          title: "Abu Simbel Temples",
          year: -1264,
          description: "Rock-cut colossal temple with solar alignment — precision engineering, divine aesthetics, ideology, and Ramesses' power unified",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Abu_Simbel%2C_Ramesses_Temple%2C_front%2C_Egypt%2C_Oct_2004.jpg/320px-Abu_Simbel%2C_Ramesses_Temple%2C_front%2C_Egypt%2C_Oct_2004.jpg",
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
          title: "Pasargadae Garden Design",
          year: -546,
          description: "Earliest known chaharbagh (four-garden) plan — geometric paradise garden at Cyrus' capital",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Pasargad_Tomb_Cyrus3.jpg/320px-Pasargad_Tomb_Cyrus3.jpg",
          magicDrivers: ["G"],
        },
        {
          phase: "innovation",
          title: "Cyrus Cylinder Declaration",
          year: -539,
          description: "Clay cylinder proclaiming religious tolerance — institutional innovation in imperial governance and propaganda",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Cyrus_Cylinder.jpg/320px-Cyrus_Cylinder.jpg",
          magicDrivers: ["I", "C", "A"],
        },
        {
          phase: "invention",
          title: "Persepolis Complex",
          year: -515,
          description: "Ceremonial capital with Apadana — math proportions, relief art, axial geometry, Zoroastrian ideology, Achaemenid sovereignty in stone",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Persepolis_24.11.2009_11-12-14.jpg/320px-Persepolis_24.11.2009_11-12-14.jpg",
          magicDrivers: ["M", "A", "G", "I", "C"],
        },
      ],
    },
    {
      cycle: 2,
      milestones: [
        {
          phase: "discovery",
          title: "Qanat Water System",
          year: -500,
          description: "Underground aqueduct tunnels — hydraulic engineering for arid agriculture",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Qanat_cross_section.svg/320px-Qanat_cross_section.svg.png",
          magicDrivers: ["G"],
        },
        {
          phase: "innovation",
          title: "Royal Road System",
          year: -500,
          description: "2,699 km highway with relay stations — geometric route planning meets administrative control",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Map_of_the_Achaemenid_Empire.jpg/320px-Map_of_the_Achaemenid_Empire.jpg",
          magicDrivers: ["G", "M", "C"],
        },
        {
          phase: "invention",
          title: "Daric Gold Coinage",
          year: -510,
          description: "Standardized gold currency with archer design — math purity, artistic emblem, geometric stamp, institutional trust, imperial control",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Gold_daric_coin.jpg/240px-Gold_daric_coin.jpg",
          magicDrivers: ["M", "A", "G", "I", "C"],
        },
      ],
    },
    {
      cycle: 3,
      milestones: [
        {
          phase: "discovery",
          title: "Trilingual Inscriptions",
          year: -520,
          description: "Behistun inscription in Old Persian, Elamite, Babylonian — linguistic documentation breakthrough",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Behistun_Inscription.jpg/320px-Behistun_Inscription.jpg",
          magicDrivers: ["I"],
        },
        {
          phase: "innovation",
          title: "Satrap Provincial System",
          year: -525,
          description: "20-satrapy governance with local autonomy — institutional innovation combining control with cultural diversity",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Tribute_Bearers_on_the_Apadana_Staircase_4.jpg/320px-Tribute_Bearers_on_the_Apadana_Staircase_4.jpg",
          magicDrivers: ["I", "C", "M"],
        },
        {
          phase: "invention",
          title: "Apadana Audience Hall",
          year: -490,
          description: "72-column hypostyle hall at Persepolis — engineering, artistic relief program, geometric precision, ritual architecture, and imperial spectacle unified",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Persepolis_stairs_of_the_Apadana_relief.jpg/320px-Persepolis_stairs_of_the_Apadana_relief.jpg",
          magicDrivers: ["M", "A", "G", "I", "C"],
        },
      ],
    },
  ],
};
