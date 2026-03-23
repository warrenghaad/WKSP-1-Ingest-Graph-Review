#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const SOURCE_ROOT =
  '/Users/samimajeed/_OFFLOAD_POSTPILOT_2026-02-23/TO_GATE/UI_BUILD_CONTENT + IMAGE SYSTEM/FULL GRADE LESSON';
const OUTPUT_ROOT = path.join(REPO_ROOT, 'CORRECTED_SRQ_V7_FIGMA_BATCH');
const FIGMA_URL =
  'https://www.figma.com/design/mKwXSIAcEpe6Zzj4Isa4D9/SmartEd--Ed-Tech-Web-App--Community-?m=auto&t=6iEhn8qoZhDWBdUP-6';

const GRADE_PROFILES = {
  3: {
    label: 'Grade 3',
    audience: 'concrete, embodied, introductory',
    ageBand: 'ages 8-9',
    calibration:
      'Use plain language, body-based demonstrations, short causal chains, and visible classroom actions.',
    mathShift:
      'Name the property in child-accessible language first, then attach formal terms after the visual pattern is secure.',
    teacherMove:
      'Model with gestures, have students trace or build the form, and keep each claim tied to one visible feature.'
  },
  4: {
    label: 'Grade 4',
    audience: 'causal, systemic, comparative',
    ageBand: 'ages 9-10',
    calibration:
      'Use comparative reasoning, make section-to-section dependencies explicit, and show how the same property scales from object to system.',
    mathShift:
      'Introduce formal vocabulary and ask students to compare what changes and what stays invariant across carriers and uses.',
    teacherMove:
      'Use side-by-side comparison, cause/effect language, and short evidence chains grounded in artifacts and diagrams.'
  },
  5: {
    label: 'Grade 5',
    audience: 'conceptual, engineering-forward, more abstract',
    ageBand: 'ages 10-11',
    calibration:
      'Use systems language, explicit structural reasoning, and design/engineering framing without losing historical grounding.',
    mathShift:
      'State the property formally, connect it to an engineering or navigational system, and show how the property constrains performance.',
    teacherMove:
      'Ask students to justify with properties, not impressions, and have them translate between diagram, artifact, and mechanism.'
  }
};

const WEEK_PROFILES = {
  1: {
    week: 1,
    deity: 'Shamash',
    deityAlt: 'Utu',
    element: 'Circle',
    elementSlug: 'circle',
    geaCode: 'GEA.circle',
    color: '#F97316',
    themeByGrade: {
      3: 'The Magic of Circles: How Shamash the Sun God Shows Us Fairness',
      4: 'Fairness and Problem-Solving: How Circles Help Us Share and Build',
      5: 'Justice and Equality: Circular Reasoning in Engineering Design'
    },
    metaphorLabel: 'justice, equal reach, and reliability',
    functionLabel: 'rotation, centered turning, and even distribution',
    geometricTruth:
      'A circle is the set of points held at a constant radius from one center, creating equal relation in every direction.',
    mythTitle: 'The Sun Wheel of Justice',
    mythActs: [
      'Act I: People in the city argue because no one can agree what is fair, and hidden corners let injustice hide.',
      'Act II: Shamash raises a radiant circle that sends light evenly outward, revealing every face and every action.',
      'Act III: The same circular order becomes law, ritual, and craft, teaching that equal relation to the center produces equal reach.'
    ],
    a2Affordances: [
      'constant radius creates equal relation to the center',
      'continuous boundary lets the eye move without interruption',
      'radial organization distributes attention evenly',
      'centered symmetry signals stability and reliability'
    ],
    iconography: [
      'Shamash Tablet (British Museum BM 91000)',
      'Code of Hammurabi Stele (Louvre Sb 8)',
      'Cylinder seal showing Shamash emerging between mountains'
    ],
    institutionalSpread: [
      'sun-disk iconography in law and temple imagery',
      'rolled cylinder seals used to authorize records',
      'pottery, wheels, and bread as daily circular carriers',
      'ritual light, mirrors, and solar courts as embodied circle practices'
    ],
    anchorArtifact: 'Shamash Tablet (British Museum BM 91000)',
    anchorArtifactDetail:
      'A relief showing Shamash enthroned with ring-and-rod and solar iconography, useful for connecting justice claims to a specific sacred image.',
    techniqueStudio:
      'string-compass circle construction plus radial sun-disk composition',
    architectureAnchor: 'Sippar temple court and solar-law iconography',
    b2Properties: [
      'constant radius',
      'equidistance from the center',
      'diameter splits the form into equal halves',
      'closed rotation with no preferred corner'
    ],
    b3Operation: 'rotation, rolling, and centered turning',
    b4Result: 'smooth transport, even force distribution, and stable shaping',
    invention: 'potter’s wheel',
    inventionDetail:
      'A stabilized rotating platform that turns constant circular geometry into repeatable containers and controlled shaping.',
    engineeringParts: [
      'turning platform',
      'central axis / pivot',
      'rim and hand contact zone',
      'clay body receiving the rotational force'
    ],
    classroomBuild: 'build and test a rolling wheel cart or tabletop spinner',
    synthesis:
      'The circle means justice and works as rotation because every point keeps the same relation to the center, producing equal reach in metaphor and smooth turning in function.',
    surfacePrompts: {
      overview:
        'Ultra-real Old Babylonian sunrise over Sippar, Shamash symbol integrated into civic life, warm gold light, children and adults arranged around circular forms, historically grounded, premium editorial realism.',
      dayA:
        'Ultra-real cinematic reconstruction of Shamash raising a radiant circular sun disk above a Mesopotamian temple court at dawn, priests, law stele, bronze mirrors catching light, period-accurate garments, archaeological plausibility, high detail.',
      dayB:
        'Ultra-real Mesopotamian pottery workshop with a potter using a spinning wheel, clay centered under skilled hands, visible rotational geometry, warm earth palette, strong tactile realism, historically grounded tools and setting.'
    }
  },
  2: {
    week: 2,
    deity: 'Sin',
    deityAlt: 'Nanna',
    element: 'Crescent',
    elementSlug: 'crescent',
    geaCode: 'GEA.arc',
    color: '#6366F1',
    themeByGrade: {
      3: "The Moon's Magic Curves: How Sin Teaches Us About Change and Growth",
      4: 'Cycles and Time: How Curved Shapes Help Us Track Change',
      5: 'Time and Cycles: Curved Design for Dynamic Systems'
    },
    metaphorLabel: 'renewal, return, and measured change',
    functionLabel: 'phase tracking, calendrical timing, and curved cutting',
    geometricTruth:
      'A crescent is a controlled partial circle: an arc-bounded region that shows change-in-progress rather than completed closure.',
    mythTitle: 'The Crescent Boat of Time',
    mythActs: [
      'Act I: The night goes dark and the people fear the moon has disappeared and time has broken.',
      'Act II: Sin returns as a thin crescent boat, proving that what vanished was still moving through a hidden part of the cycle.',
      'Act III: Priests, farmers, and families learn to read the returning arc as a promise that change follows a pattern that can be tracked.'
    ],
    a2Affordances: [
      'partial closure signals becoming rather than completion',
      'tapered arc directs the eye toward growth or return',
      'curvature holds a sense of contained movement',
      'phase variation makes change visible without breaking continuity'
    ],
    iconography: [
      'Cylinder seal with celestial triad showing crescent, sun disk, and star',
      'Stele of Ur-Nammu with lunar symbol',
      'Ziggurat of Ur as the cultic center of Sin'
    ],
    institutionalSpread: [
      'month-start observations from temple platforms',
      'crescent standards in cult and procession',
      'lunar scheduling for ritual and agriculture',
      'curved tools such as sickles echoing the same arc logic'
    ],
    anchorArtifact: 'Cylinder seal with celestial triad showing Sin’s crescent',
    anchorArtifactDetail:
      'A compact artifact that stages the crescent among other divine signs, making it ideal for A3/A5 iconographic and material analysis.',
    techniqueStudio:
      'two-arc crescent construction with phase-wheel comparison',
    architectureAnchor: 'Ziggurat of Ur and lunar observation platforms',
    b2Properties: [
      'arc length and curvature',
      'partial circle / annular segment logic',
      'predictable phase interval across the cycle',
      'orientation and taper revealing direction of change'
    ],
    b3Operation: 'waxing, waning, and progressive arc transformation',
    b4Result:
      'predictable calendars, scheduled ritual time, and improved harvesting/cutting from curved edges',
    invention: 'lunar calendar and phase tracker',
    inventionDetail:
      'A system that stabilizes recurring crescent observations into months, schedules, and repeatable forecasting.',
    engineeringParts: [
      'horizon observation point',
      'counting sequence / month register',
      'phase wheel or marking tablet',
      'curved edge or arc used to test transformation'
    ],
    classroomBuild: 'build a rotating moon-phase tracker or crescent timing wheel',
    synthesis:
      'The crescent means renewal and works as timekeeping because a visible changing arc lets people see return, sequence, and prediction in one property.',
    surfacePrompts: {
      overview:
        'Ultra-real twilight over Ur with a bright crescent moon above stepped architecture, reflective canals, priests and families using lunar cues, restrained indigo palette, archaeological realism.',
      dayA:
        'Ultra-real Mesopotamian rooftop moonwatch scene, priests and families looking west at the first visible crescent, clay tablets and horizon markers present, emotionally restrained but visually rich, historical reconstruction realism.',
      dayB:
        'Ultra-real lunar calendar workshop scene in ancient Mesopotamia, clay phase wheel, crescent diagrams, bronze sickle nearby, scribes and observers connecting curved geometry to time measurement, crisp tactile realism.'
    }
  },
  3: {
    week: 3,
    deity: 'Ishtar',
    deityAlt: 'Inanna',
    element: '8-Point Star',
    elementSlug: 'eight_point_star',
    geaCode: 'GEM.eight_point_star',
    color: '#2563EB',
    themeByGrade: {
      3: 'The Star of Many Paths: How Ishtar Shows One Center Reaching in Many Directions',
      4: 'Connections and Directions: How Star Patterns Help Us Navigate and Connect',
      5: 'Navigation and Networks: Star Patterns in Communication Systems'
    },
    metaphorLabel: 'multiplicity, radiance, and one center reaching many paths',
    functionLabel: '8-way orientation, routing, and networked direction',
    geometricTruth:
      'An 8-point star divides rotation into equal 45-degree intervals, producing one center with many balanced directional outputs.',
    mythTitle: 'The Morning Star Who Became Eight',
    mythActs: [
      'Act I: Ishtar refuses to be reduced to one role and appears as both morning star and evening star, love and war, radiance and danger.',
      'Act II: Her light divides into eight equal rays, showing that one center can move power outward in many directions without losing itself.',
      'Act III: The same eight-way order guides gates, routes, and navigation, turning multiplicity into a practical directional system.'
    ],
    a2Affordances: [
      'equal angular spacing creates balanced multiplicity',
      'radial rays show one source feeding many directions',
      'rotation preserves the pattern while orientation changes',
      'one center / many outputs makes connection visible'
    ],
    iconography: [
      'Ishtar Gate of Babylon',
      'Burney Relief (for multi-aspect goddess discussion)',
      'Cylinder seal with Ishtar and eight-point star in celestial register'
    ],
    institutionalSpread: [
      'eight-fold signs in gate decoration and celestial registers',
      'Venus observation as morning/evening star guidance',
      'star-based routing and directional symbolism',
      'network logic appearing in civic and ceremonial organization'
    ],
    anchorArtifact: 'Ishtar Gate lion and rosette/star program',
    anchorArtifactDetail:
      'The gate gives a monumental carrier where 8-fold geometry, divine branding, and controlled movement meet in one civic surface.',
    techniqueStudio:
      'circle division into eight equal 45-degree sectors and ray construction',
    architectureAnchor: 'Ishtar Gate and radial/directional passage systems',
    b2Properties: [
      '360° divided into 8 equal 45° sectors',
      'rotational symmetry of order 8',
      'equal rays from one center',
      'cardinal and intercardinal direction mapping'
    ],
    b3Operation: 'rotation, reorientation, and multi-direction routing',
    b4Result:
      'improved navigation, route precision, and coordinated movement through shared directional systems',
    invention: '8-direction navigation / compass-rose logic',
    inventionDetail:
      'A stabilized directional system that converts 45-degree divisions into repeatable guidance, route choice, and orientation.',
    engineeringParts: [
      'central hub',
      'eight equal directional rays',
      'label system or route encoding',
      'user turning and reading the star as an orientation device'
    ],
    classroomBuild: 'build a rotating compass rose or 8-way route board',
    synthesis:
      'The 8-point star means multiplicity and works as navigation because equal 45-degree divisions let one center guide many balanced directions.',
    surfacePrompts: {
      overview:
        'Ultra-real nightfall view of Babylon with Ishtar Gate glowing blue, an eight-point star motif echoing across the sky and civic surface, controlled ceremonial movement, premium historical realism.',
      dayA:
        'Ultra-real ceremonial scene at the Ishtar Gate, blue glazed brick, lion reliefs, star rosettes, priests and travelers beneath a bright Venus-inspired eight-point motif, historically grounded and cinematic.',
      dayB:
        'Ultra-real ancient navigation and routing scene, star chart and radial direction board laid beside clay tablets, travelers and scribes orienting movement from a central eight-point star diagram, crisp premium realism.'
    }
  }
};

const SECTION_ORDER = [
  'A1',
  'A2',
  'A3',
  'A4',
  'A5',
  'A6',
  'A7',
  'B1',
  'B2',
  'B3',
  'B4',
  'B5',
  'B6',
  'B7',
  'B8'
];

const SECTION_META = {
  A1: { duration: '6-8 min', visualType: 'MOT', strategy: 'ai_reconstruction' },
  A2: { duration: '6-8 min', visualType: 'OVR+DGM', strategy: 'hybrid' },
  A3: { duration: '8-10 min', visualType: 'MUS+SCN', strategy: 'museum_first' },
  A4: { duration: '8-10 min', visualType: 'SCN+MUS', strategy: 'hybrid' },
  A5: { duration: '7-9 min', visualType: 'MUS', strategy: 'museum_first' },
  A6: { duration: '6-8 min', visualType: 'CON+DGM', strategy: 'hybrid' },
  A7: { duration: '6-8 min', visualType: 'SCN+MUS', strategy: 'hybrid' },
  B1: { duration: '4-5 min', visualType: 'OVR', strategy: 'hybrid' },
  B2: { duration: '7-9 min', visualType: 'DGM+OVR', strategy: 'diagram_first' },
  B3: { duration: '7-9 min', visualType: 'MOT+DGM', strategy: 'motion_board' },
  B4: { duration: '6-8 min', visualType: 'SCN+MUS', strategy: 'hybrid' },
  B5: { duration: '6-8 min', visualType: 'SCN+MUS', strategy: 'hybrid' },
  B6: { duration: '7-9 min', visualType: 'DGM+SCN', strategy: 'hybrid' },
  B7: { duration: '7-9 min', visualType: 'CON', strategy: 'activity_sequence' },
  B8: { duration: '5-7 min', visualType: 'OVR+SCN', strategy: 'synthesis_composite' }
};

function gradeClause(grade, g3, g4, g5) {
  return { 3: g3, 4: g4, 5: g5 }[grade];
}

function slugify(input) {
  return String(input)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function titleSlug(input) {
  return String(input)
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function readFrontmatter(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const match = raw.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return {};
    const out = {};
    for (const line of match[1].split('\n')) {
      const idx = line.indexOf(':');
      if (idx === -1) continue;
      const key = line.slice(0, idx).trim();
      const value = line.slice(idx + 1).trim().replace(/^"|"$/g, '');
      out[key] = value;
    }
    return out;
  } catch {
    return {};
  }
}

function sourcePaths(grade, weekProfile) {
  const baseWeek = `GRADE_${grade}_WEEK_${weekProfile.week}_`;
  const byWeekDir = path.join(SOURCE_ROOT, 'LESSONS BY WEEK');
  const gradeDir = path.join(SOURCE_ROOT, `LESSONS - Grade ${grade}`);
  const suffix =
    weekProfile.week === 1
      ? 'SHAMASH_CIRCLE.md'
      : weekProfile.week === 2
      ? 'SIN_CRESCENT.md'
      : 'ISHTAR_8_POINT_STAR.md';
  const sourcePath = path.join(byWeekDir, `${baseWeek}${suffix}`);
  const legacyPath =
    weekProfile.week === 1
      ? path.join(gradeDir, 'wkI_Circle_Shamash_CORRECTED.md')
      : weekProfile.week === 2
      ? path.join(gradeDir, 'wkII_Crescent_Sin_CORRECTED.md')
      : path.join(gradeDir, 'wkIII_8Star_Ishtar_CORRECTED.md');
  return { sourcePath, legacyPath };
}

function weekId(grade, week) {
  return `G${grade}-W${week}`;
}

function frameName(ctx, suffix) {
  return `${ctx.id} / ${suffix}`;
}

function formatMagic(weights) {
  return `I ${weights.I.toFixed(1)} | A ${weights.A.toFixed(1)} | G ${weights.G.toFixed(1)} | M ${weights.M.toFixed(1)} | C ${weights.C.toFixed(1)}`;
}

function sectionWeights(code) {
  const map = {
    A1: { I: 0.9, A: 0.6, G: 0.7, M: 0.1, C: 0.2 },
    A2: { I: 0.4, A: 0.9, G: 0.9, M: 0.3, C: 0.2 },
    A3: { I: 0.7, A: 0.8, G: 0.7, M: 0.2, C: 0.3 },
    A4: { I: 0.9, A: 0.7, G: 0.5, M: 0.2, C: 0.6 },
    A5: { I: 0.6, A: 0.7, G: 0.7, M: 0.3, C: 0.4 },
    A6: { I: 0.3, A: 0.8, G: 0.8, M: 0.4, C: 0.2 },
    A7: { I: 0.7, A: 0.6, G: 0.5, M: 0.3, C: 0.7 },
    B1: { I: 0.4, A: 0.4, G: 0.7, M: 0.5, C: 0.3 },
    B2: { I: 0.2, A: 0.3, G: 0.9, M: 0.9, C: 0.2 },
    B3: { I: 0.2, A: 0.4, G: 0.8, M: 0.8, C: 0.4 },
    B4: { I: 0.2, A: 0.3, G: 0.7, M: 0.6, C: 0.5 },
    B5: { I: 0.4, A: 0.4, G: 0.7, M: 0.6, C: 0.7 },
    B6: { I: 0.2, A: 0.4, G: 0.8, M: 0.7, C: 0.6 },
    B7: { I: 0.2, A: 0.4, G: 0.7, M: 0.6, C: 0.4 },
    B8: { I: 0.6, A: 0.6, G: 0.8, M: 0.6, C: 0.4 }
  };
  return map[code];
}

function buildSection(ctx, code) {
  const { grade, gradeProfile, weekProfile } = ctx;
  const common = SECTION_META[code];

  switch (code) {
    case 'A1':
      return {
        code,
        title: `3-Act Video Myth Retelling — ${weekProfile.mythTitle}`,
        duration: common.duration,
        objective: gradeClause(
          grade,
          `Students retell how ${weekProfile.deity} uses the ${weekProfile.element.toLowerCase()} to make ${weekProfile.metaphorLabel} visible.`,
          `Students explain how the myth assigns a job to the ${weekProfile.element.toLowerCase()} before any formal analysis begins.`,
          `Students identify the myth as a narrative compression of the week's geometric claim and describe the problem the ${weekProfile.element.toLowerCase()} solves.`
        ),
        claim: `${weekProfile.geometricTruth} In A1, that geometric truth first appears as story action rather than explanation.`,
        because: `The ${weekProfile.element.toLowerCase()} matters in the myth because ${weekProfile.synthesis}`,
        routing: {
          I: `Myth, cult, and divine role establish why ${weekProfile.deity} is attached to this form.`,
          A: 'Visual staging introduces the form through a memorable repeated image.',
          G: `The shape itself is visible and named, even before its properties are unpacked.`,
          M: 'Mathematics is attenuated here; students only notice a stable recurring pattern.',
          C: 'Authority and institution are seeded as later questions, not the main payload.'
        },
        teacherMoves: [
          ...weekProfile.mythActs,
          gradeClause(
            grade,
            'End with one embodied gesture that lets students trace the element in the air.',
            'Pause between acts to ask what problem the form solved and what evidence the story keeps repeating.',
            'Explicitly name that the story is not evidence by itself; it is the entry into a claim that later sections test.'
          )
        ],
        evidence: [
          `Source lesson: ${ctx.sourcePath}`,
          `Legacy reference: ${ctx.legacyPath}`,
          `Myth title locked for this batch: ${weekProfile.mythTitle}`
        ],
        visual: {
          type: common.visualType,
          strategy: common.strategy,
          requirement:
            'Ultra-real keyframe sequence for a 3-act myth retelling plus one hero still used on overview and Day A surfaces.'
        }
      };
    case 'A2':
      return {
        code,
        title: `Visual Rhetoric — How the ${weekProfile.element} Conveys ${weekProfile.metaphorLabel}`,
        duration: common.duration,
        objective: gradeClause(
          grade,
          `Students name the visible features that let the ${weekProfile.element.toLowerCase()} communicate ${weekProfile.metaphorLabel} through visual structure and conveyance.`,
          `Students explain how specific visual affordances make the ${weekProfile.element.toLowerCase()} a reliable carrier of the week's metaphor.`,
          `Students analyze the ${weekProfile.element.toLowerCase()} as a compositional technology whose perceptual affordances constrain what meanings it can convincingly carry.`
        ),
        claim: `A2 teaches the craft of symbolic communication. Artists and institutions can repeatedly use ${weekProfile.a2Affordances.join(', ')} to encode ${weekProfile.metaphorLabel}.`,
        because: `The metaphor works because the form affords ${weekProfile.a2Affordances.join('; ')}.`,
        routing: {
          I: 'Belief systems authorize the metaphor, but the section studies how the form carries it.',
          A: 'Primary line: artistic technique, composition, and perceptual control.',
          G: `Primary line: the geometric property is treated as the mechanism of communication.`,
          M: 'Property language is introduced, but formal proof is deferred to B2.',
          C: 'Power is backgrounded here and returns when the form is distributed institutionally.'
        },
        teacherMoves: [
          'Run A2 as Identification → Mechanism → Intelligence.',
          `Identify one affordance at a time: ${weekProfile.a2Affordances.join('; ')}.`,
          'Require every because-statement to cite a visible property, not a mood word.',
          gradeProfile.teacherMove
        ],
        evidence: [
          `Anchor affordances: ${weekProfile.a2Affordances.join('; ')}`,
          'Guardrail: A2 centers visual rhetoric / conveyance mechanism.',
          `Feeds directly into A5 and B2 for ${ctx.id}.`
        ],
        visual: {
          type: common.visualType,
          strategy: common.strategy,
          requirement:
            'Ultra-real base image with decomposition overlays naming the affordances and pointing to the exact visual mechanism.'
        }
      };
    case 'A3':
      return {
        code,
        title: `Iconographic Reading — ${weekProfile.deity} in Art and Symbol`,
        duration: common.duration,
        objective: gradeClause(
          grade,
          `Students read real images of ${weekProfile.deity} and explain how the ${weekProfile.element.toLowerCase()} appears on sacred carriers.`,
          `Students use A2 vocabulary to analyze how iconographic choices intensify the week's metaphor across different carriers.`,
          `Students perform a formal iconographic read, translating visual evidence into claims about carrier, rendering, and encoded meaning.`
        ),
        claim: `A3 is the assessment section for A2. Students must show that they can recognize the ${weekProfile.element.toLowerCase()} in artifacts and explain why the artist chose it.`,
        because: `The same affordances from A2 recur across carrier changes, proving the form is doing communicative work rather than acting as decoration.`,
        routing: {
          I: `${weekProfile.deity} and cult context explain why the iconography mattered.`,
          A: 'Primary line: carrier comparison and visual reading.',
          G: 'Students locate the form and its rendering choices in each artifact.',
          M: 'Mathematics remains implicit in how the form is proportioned or divided.',
          C: 'Who gets to display the symbol is present but not yet centered.'
        },
        teacherMoves: [
          `Use three anchor carriers: ${weekProfile.iconography.join('; ')}.`,
          'Ask students what the artist changed and what stayed invariant across carriers.',
          'Require one sentence that begins: "This works because..." and finishes with a property from A2.'
        ],
        evidence: weekProfile.iconography,
        visual: {
          type: common.visualType,
          strategy: common.strategy,
          requirement:
            'Artifact plate with at least one museum image and one annotated close-up showing the geometric sign in context.'
        }
      };
    case 'A4':
      return {
        code,
        title: `Institutional Spread — Where the ${weekProfile.element} Organized Daily and Sacred Life`,
        duration: common.duration,
        objective: gradeClause(
          grade,
          `Students see that the ${weekProfile.element.toLowerCase()} did not stay in one artwork; it moved through ritual, objects, and places.`,
          `Students trace how the week's geometry was institutionalized across sacred, civic, administrative, and domestic carriers.`,
          `Students map how a stabilized sign becomes infrastructural once institutions, craft systems, and public ritual redistribute it.`
        ),
        claim: `A4 expands the form from one artwork into a social field. Once the ${weekProfile.element.toLowerCase()} became legible, it organized ritual, administration, and daily repetition.`,
        because: `The form survives because institutions keep rehearsing it through carriers, spaces, and controlled access.`,
        routing: {
          I: 'Cult, myth, and ritual give the spread its sacred authority.',
          A: 'Carrier diversity shows how the sign scales visually.',
          G: 'The same geometric nucleus persists through multiple materials.',
          M: 'Counting, scheduling, or proportion may appear as part of institutional use.',
          C: 'Primary seed: who controls access, display, and literacy around the sign.'
        },
        teacherMoves: [
          `Use four domains of spread: ${weekProfile.institutionalSpread.join('; ')}.`,
          gradeClause(
            grade,
            'Have students sort examples into sacred / civic / daily / restricted.',
            'Ask which carrier reaches the most people and which stays gatekept.',
            'Name the institution doing the distributing and ask what behavior it regulates.'
          )
        ],
        evidence: weekProfile.institutionalSpread,
        visual: {
          type: common.visualType,
          strategy: common.strategy,
          requirement:
            'Ultra-real carrier mosaic mixing one sacred environment, one daily scene, and one civic/administrative use of the element.'
        }
      };
    case 'A5':
      return {
        code,
        title: `Artifact Crystallization — ${weekProfile.anchorArtifact}`,
        duration: common.duration,
        objective: gradeClause(
          grade,
          `Students study one named artifact where the week's metaphor becomes materially concrete.`,
          `Students connect A2's technique language to one historical object with clear provenance and carrier-specific choices.`,
          `Students treat one artifact as the material proof that the rhetorical mechanism was deliberately deployed in a real historical object.`
        ),
        claim: `A5 is where metaphor becomes specific. The artifact does not merely repeat the story; it shows how a maker used the ${weekProfile.element.toLowerCase()} in material culture.`,
        because: `If students cannot name what A2 teaches and show how A5 instantiates it in one object, the lesson is structurally broken.`,
        routing: {
          I: 'Artifact is embedded in cult or legal meaning.',
          A: 'Primary line: composition, material, and carrier choices.',
          G: `Primary line: how the ${weekProfile.element.toLowerCase()} is rendered in the object.`,
          M: 'Property language is latent in the rendering and becomes explicit in B2.',
          C: 'Ownership, access, or public authority is noted where relevant.'
        },
        teacherMoves: [
          `Anchor object: ${weekProfile.anchorArtifactDetail}`,
          'Use provenance, material, and display context, not just a free-floating image.',
          'Ask students what the object would lose if the shape changed.'
        ],
        evidence: [
          weekProfile.anchorArtifact,
          ...weekProfile.iconography.slice(0, 2)
        ],
        visual: {
          type: common.visualType,
          strategy: common.strategy,
          requirement:
            'Museum-first hero artifact image with zoom detail, scale cue, and a short object biography panel.'
        }
      };
    case 'A6':
      return {
        code,
        title: `Technique Studio — Making the ${weekProfile.element}`,
        duration: common.duration,
        objective: gradeClause(
          grade,
          `Students practice the making logic behind the ${weekProfile.element.toLowerCase()} so the form becomes a repeatable technique.`,
          `Students reconstruct the making sequence and identify which step preserves the critical property.`,
          `Students translate the sign into a production sequence and explain where precision matters most.`
        ),
        claim: `A6 turns observation into craft. Students rehearse the sequence by which a maker stabilizes the form.`,
        because: `Making reveals why the property is not decorative: each step protects the exact relation the form needs to carry meaning.`,
        routing: {
          I: 'Minimal; sacred meaning remains backgrounded while technique comes forward.',
          A: 'Primary line: making sequence, composition, and revision.',
          G: 'Primary line: students preserve the key property through construction.',
          M: 'Measurement or equal division is used only as needed to hold the form.',
          C: 'Craft authority appears through who learns and controls the method.'
        },
        teacherMoves: [
          `Technique focus: ${weekProfile.techniqueStudio}.`,
          gradeClause(
            grade,
            'Use one teacher model, one guided build, and one student attempt.',
            'Have students compare a structurally correct and incorrect build to isolate the critical step.',
            'Require students to justify each construction step with the property it protects.'
          )
        ],
        evidence: [
          weekProfile.techniqueStudio,
          `Connect technique back to ${weekProfile.anchorArtifact}`
        ],
        visual: {
          type: common.visualType,
          strategy: common.strategy,
          requirement:
            'Construction strip or layered breakdown placed on an ultra-real workspace background.'
        }
      };
    case 'A7':
      return {
        code,
        title: `Monument and Threshold — ${weekProfile.architectureAnchor}`,
        duration: common.duration,
        objective: gradeClause(
          grade,
          `Students see the week's shape at building scale and explain what kind of behavior the space teaches.`,
          `Students connect architectural or monumental carriers to the same metaphor studied earlier in smaller objects.`,
          `Students analyze how geometry scales into spatial choreography, guiding bodies through institutional space.`
        ),
        claim: `A7 closes Day A by enlarging the sign into a spatial environment. The same geometry that worked in image and object now organizes movement, status, and threshold.`,
        because: `Spatial scale reveals that the form is not only pictured; it structures where people stand, move, and what they are allowed to do.`,
        routing: {
          I: 'Monumental scale binds the sign to cult and public authority.',
          A: 'Architecture is treated as a visual and experiential carrier.',
          G: 'The same geometric logic is recognized at environmental scale.',
          M: 'Measurement appears as layout, orientation, or repeated spacing.',
          C: 'Primary line: gates, temples, courts, and thresholds distribute power.'
        },
        teacherMoves: [
          `Use ${weekProfile.architectureAnchor} as the Day A scale shift.`,
          'Ask what the shape makes possible at the level of crowd, path, or threshold.',
          'Bridge explicitly to B1: tomorrow the same geometry will be read as function.'
        ],
        evidence: [
          weekProfile.architectureAnchor,
          ...weekProfile.iconography.slice(-1)
        ],
        visual: {
          type: common.visualType,
          strategy: common.strategy,
          requirement:
            'Ultra-real architectural or urban reconstruction with the element highlighted as a movement-shaping device.'
        }
      };
    case 'B1':
      return {
        code,
        title: 'Bridge — Same Shape, New Register',
        duration: common.duration,
        objective: gradeClause(
          grade,
          `Students restate yesterday's metaphor and preview how the same shape will work as a tool or system today.`,
          `Students translate the Day A artifact logic into a Day B functional question without changing the underlying property.`,
          `Students define the register shift: the same geometric truth will now be read as an operational system rather than a symbolic carrier.`
        ),
        claim: `B1 keeps the same geometry but changes the question from "What does it mean?" to "What does it let people do?"`,
        because: `The bridge holds only if students can still point to the same property before the function work starts.`,
        routing: {
          I: 'Recap only; mythology is not re-taught.',
          A: 'Artifact and image memory carry over from Day A.',
          G: 'Primary continuity line: name the same property again.',
          M: 'Preview of proof language and operational reading.',
          C: 'Historical stakes are foreshadowed for B5.'
        },
        teacherMoves: [
          `Repeat the geometric truth verbatim: ${weekProfile.geometricTruth}`,
          'Use one A5 artifact and one B5 invention image side by side.',
          'Ask students what stayed the same when the register changed.'
        ],
        evidence: [
          weekProfile.anchorArtifact,
          weekProfile.invention
        ],
        visual: {
          type: common.visualType,
          strategy: common.strategy,
          requirement:
            'Split-screen overlay card linking the Day A anchor artifact to the Day B invention or system.'
        }
      };
    case 'B2':
      return {
        code,
        title: `Mathematical Properties — The ${weekProfile.element} as an Internal System`,
        duration: common.duration,
        objective: gradeClause(
          grade,
          `Students describe the built-in math of the ${weekProfile.element.toLowerCase()} itself, not a generic measuring procedure.`,
          `Students identify the internal mathematical relationships that make the later transformation and result possible.`,
          `Students formalize the element's intrinsic geometry and explain why those properties are load-bearing for the functional system.`
        ),
        claim: `B2 is not about measuring things in general. It is about the mathematics living inside the ${weekProfile.element.toLowerCase()}: ${weekProfile.b2Properties.join(', ')}.`,
        because: `These internal properties are what B3 operates on and what B5 stabilizes in historical use.`,
        routing: {
          I: 'None primary; cultural context is secondary.',
          A: 'Diagram legibility matters but art is not the point.',
          G: 'Primary line: the element itself is decomposed and named.',
          M: `Primary line: ${weekProfile.b2Properties.join(', ')}.`,
          C: 'Deferred until B5.'
        },
        teacherMoves: [
          `State the key properties plainly: ${weekProfile.b2Properties.join('; ')}.`,
          gradeClause(
            grade,
            'Use direct observation plus one simple check to name the property without turning the lesson into a worksheet of procedures.',
            'Make students say which later function each property enables.',
            'Require the class to treat proof as explanation of the form itself, not as a detached recipe.'
          ),
          `End by previewing B3: if these properties are true, then the element can perform ${weekProfile.b3Operation}.`
        ],
        evidence: weekProfile.b2Properties,
        visual: {
          type: common.visualType,
          strategy: common.strategy,
          requirement:
            'High-clarity diagram/overlay hybrid with labels, property callouts, and no decorative clutter.'
        }
      };
    case 'B3':
      return {
        code,
        title: `Transformations and Operations — ${weekProfile.b3Operation}`,
        duration: common.duration,
        objective: gradeClause(
          grade,
          `Students watch the property move and explain what the ${weekProfile.element.toLowerCase()} can do because of B2.`,
          `Students trace a clear B2 → B3 dependency by naming which property is being transformed into motion or operation.`,
          `Students model the operational phase of the system and justify why the transformation still preserves the core geometry.`
        ),
        claim: `B3 is property in motion. Students must be able to say which B2 property is currently doing work as ${weekProfile.b3Operation}.`,
        because: `If B3 cannot name a B2 property, the Day B chain has broken.`,
        routing: {
          I: 'Not primary.',
          A: 'Visualization matters only to make motion legible.',
          G: 'The geometry is now dynamic rather than static.',
          M: 'Primary line: transformation is mathematically constrained.',
          C: 'Historical use is still waiting in B5.'
        },
        teacherMoves: [
          `Start with the sentence frame: "Because the ${weekProfile.element.toLowerCase()} has ${weekProfile.b2Properties[0]}, it can..."`,
          `Make the B2 → B3 chain explicit for ${ctx.id}.`,
          'Use before/after or frame-by-frame explanation rather than a single static description.'
        ],
        evidence: [
          `Operation focus: ${weekProfile.b3Operation}`,
          `Depends on B2 properties: ${weekProfile.b2Properties.join('; ')}`
        ],
        visual: {
          type: common.visualType,
          strategy: common.strategy,
          requirement:
            '2.5D motion-study board with 4 keyframes, arrows, and one still that can live on the Day B reader.'
        }
      };
    case 'B4':
      return {
        code,
        title: `Mechanical and Historical Result — ${weekProfile.b4Result}`,
        duration: common.duration,
        objective: gradeClause(
          grade,
          `Students explain what the transformation produces in the world once it is applied.`,
          `Students connect the moving property to a concrete result in labor, movement, scheduling, or coordination.`,
          `Students articulate the B2 → B3 → B4 chain as a causal system, not as three isolated sections.`
        ),
        claim: `B4 answers the question "So what happens?" The result is not generic usefulness; it is the exact effect produced when ${weekProfile.b3Operation} is applied.`,
        because: `B4 must reference B3 directly and keep the same property in view.`,
        routing: {
          I: 'Historical context only where it clarifies the result.',
          A: 'Reference images may still be used, but the section is effect-centered.',
          G: 'The element remains legible in the resulting system.',
          M: 'The result follows from the property and operation.',
          C: 'This result becomes socially consequential in B5.'
        },
        teacherMoves: [
          `State the full chain: ${weekProfile.b2Properties[0]} → ${weekProfile.b3Operation} → ${weekProfile.b4Result}.`,
          'Have students identify one result that would disappear if the property changed.',
          gradeClause(
            grade,
            'Use concrete classroom comparisons.',
            'Use side-by-side system comparison.',
            'Use causal language and counterfactual reasoning.'
          )
        ],
        evidence: [weekProfile.b4Result],
        visual: {
          type: common.visualType,
          strategy: common.strategy,
          requirement:
            'Cause/effect board or contextualized historical still showing the operational result in action.'
        }
      };
    case 'B5':
      return {
        code,
        title: `Functional Stabilization — ${weekProfile.invention}`,
        duration: common.duration,
        objective: gradeClause(
          grade,
          `Students see one historical invention or system where the property became repeatable and useful.`,
          `Students connect the B2 property and B4 result to one named historical stabilization with clear context.`,
          `Students treat the invention as a stabilized configuration, not just a cool example, and explain why this notch matters historically.`
        ),
        claim: `B5 is the historical notch where the property is stabilized into a repeatable practice or tool: ${weekProfile.inventionDetail}`,
        because: `B5 only works if it uses the same property from B2 and shows the same spatial skill previewed in A5.`,
        routing: {
          I: 'Belief may still frame adoption but is not the main line.',
          A: 'The invention has a visual profile students can inspect.',
          G: 'The element is materially present in the design.',
          M: 'The property is now historically deployed rather than abstractly named.',
          C: 'Primary line: labor, authority, timing, or route control now matter.'
        },
        teacherMoves: [
          `Historical stabilization: ${weekProfile.invention}.`,
          'Point back to A5 and ask what the artifact and invention share structurally.',
          'Use the sentence frame: "This worked because..." and force the property into the answer.'
        ],
        evidence: [
          weekProfile.invention,
          weekProfile.inventionDetail
        ],
        visual: {
          type: common.visualType,
          strategy: common.strategy,
          requirement:
            'Ultra-real invention/context hero still plus one supporting artifact or timeline strip.'
        }
      };
    case 'B6':
      return {
        code,
        title: `Engineering Decomposition — How ${weekProfile.invention} Works`,
        duration: common.duration,
        objective: gradeClause(
          grade,
          `Students break the invention into parts and show where the property is active inside the mechanism.`,
          `Students identify the minimum parts required for the invention to preserve the week's geometric logic.`,
          `Students decompose the system into interacting components and map the property across each load-bearing part.`
        ),
        claim: `B6 turns the invention into a system diagram. Students should be able to point to the part where the geometry is stored, transferred, or constrained.`,
        because: `Decomposition is what lets students rebuild or test the system honestly in B7.`,
        routing: {
          I: 'Minimal.',
          A: 'Visual clarity matters, but the section is mechanism-first.',
          G: 'Primary line: where the shape or division lives in the system.',
          M: 'Primary line: what relationship each part preserves.',
          C: 'Who controls making, maintenance, or specialized knowledge can be named if relevant.'
        },
        teacherMoves: [
          `Parts to label: ${weekProfile.engineeringParts.join('; ')}.`,
          'Have students point to which part would fail first if the property were broken.',
          'Use exploded-view or cutaway logic, not only a finished hero image.'
        ],
        evidence: weekProfile.engineeringParts,
        visual: {
          type: common.visualType,
          strategy: common.strategy,
          requirement:
            'Exploded-view or cutaway hybrid over an ultra-real base, ready to feed the motion board.'
        }
      };
    case 'B7':
      return {
        code,
        title: `Engineering Activity — Build and Test`,
        duration: common.duration,
        objective: gradeClause(
          grade,
          `Students build a classroom version and test whether the property actually produces the promised result.`,
          `Students use a constrained build to verify the section chain rather than treating the activity as a craft break.`,
          `Students prototype, test, revise, and explain the system using the week's geometric language.`
        ),
        claim: `B7 is the check on the whole lesson. The build only counts if students can name the property they are testing and the result they expect.`,
        because: `The activity must verify B2 → B3 → B4, not just produce something that looks similar.`,
        routing: {
          I: 'None primary.',
          A: 'The built object can still be visually expressive, but testing comes first.',
          G: 'Students have to preserve the actual geometry.',
          M: 'The test criteria come from the property and operation.',
          C: 'Collaboration and role distribution can be noted but are not the lesson focus.'
        },
        teacherMoves: [
          `Activity anchor: ${weekProfile.classroomBuild}.`,
          'Set one success criterion tied to the property and one tied to the result.',
          gradeClause(
            grade,
            'Use short build cycles and oral explanation.',
            'Add compare-and-revise language.',
            'Require a short engineering reflection with evidence.'
          )
        ],
        evidence: [
          weekProfile.classroomBuild,
          `Must test: ${weekProfile.b3Operation} → ${weekProfile.b4Result}`
        ],
        visual: {
          type: common.visualType,
          strategy: common.strategy,
          requirement:
            'Step-by-step construction strip or test-frame sequence with one teacher reference shot.'
        }
      };
    case 'B8':
      return {
        code,
        title: 'Synthesis — One Property, Two Registers',
        duration: common.duration,
        objective: gradeClause(
          grade,
          `Students complete the sentence that links the metaphor and the function through the same property.`,
          `Students show that the Day A and Day B readings converge on one geometric truth rather than two separate facts.`,
          `Students produce a non-tautological synthesis claim that names the property, the metaphor, and the functional result in one coherent statement.`
        ),
        claim: weekProfile.synthesis,
        because: `B8 exists so the lesson closes the loop instead of ending with two parallel stories.`,
        routing: {
          I: 'Myth and institution return only as part of the final convergence.',
          A: 'The visual sign returns in condensed form.',
          G: 'Primary line: restate the geometric truth one last time.',
          M: 'Primary line: restate the property without re-running B2.',
          C: 'Explain why the convergence mattered historically or socially.'
        },
        teacherMoves: [
          'Use the sentence frame: "[Element] unites [metaphor] and [function] because [same property] enables both."',
          'Reject circular or emotional explanations; the property must be explicit.',
          'Preview how next week will inherit vocabulary from this week rather than starting over.'
        ],
        evidence: [
          weekProfile.synthesis,
          `Circuit close for ${ctx.id}`
        ],
        visual: {
          type: common.visualType,
          strategy: common.strategy,
          requirement:
            'Dual-register synthesis composite combining Day A metaphor image language with Day B mechanism image language.'
        }
      };
    default:
      throw new Error(`Unknown section code: ${code}`);
  }
}

function renderBulletList(items) {
  return items.map((item) => `- ${item}`).join('\n');
}

function renderSectionMarkdown(section) {
  const weights = formatMagic(sectionWeights(section.code));
  return [
    `## ${section.code}: ${section.title}`,
    `**Duration:** ${section.duration}  `,
    `**Learning Objective:** ${section.objective}  `,
    `**MAGIC emphasis:** ${weights}`,
    '',
    `**Core claim:** ${section.claim}`,
    `**Because statement:** ${section.because}`,
    '',
    '**SRQ routing**',
    renderBulletList([
      `I-line: ${section.routing.I}`,
      `A-line: ${section.routing.A}`,
      `G-line: ${section.routing.G}`,
      `M-line: ${section.routing.M}`,
      `C-line: ${section.routing.C}`
    ]),
    '',
    '**Teacher moves**',
    renderBulletList(section.teacherMoves),
    '',
    '**Evidence anchors**',
    renderBulletList(section.evidence),
    '',
    '**Visual requirement**',
    renderBulletList([
      `Type: \`${section.visual.type}\``,
      `Source strategy: \`${section.visual.strategy}\``,
      section.visual.requirement
    ]),
    ''
  ].join('\n');
}

function buildLessonMarkdown(ctx, sections) {
  return [
    `# ${ctx.gradeProfile.label} Week ${ctx.weekProfile.week} — ${ctx.weekProfile.deity} & the ${ctx.weekProfile.element}`,
    `## ${ctx.theme}`,
    '',
    '## Batch Metadata',
    '```yaml',
    `lesson_id: "${ctx.id}"`,
    `grade: ${ctx.grade}`,
    `week: ${ctx.weekProfile.week}`,
    `deity: "${ctx.weekProfile.deity}"`,
    `element: "${ctx.weekProfile.element}"`,
    `gea_code: "${ctx.weekProfile.geaCode}"`,
    `theme: "${ctx.theme}"`,
    `correction_basis: ["SRQ_MAGIC_INVESTIGATIONS_v2.md", "LESSON_ARCHITECTURE_SSOT_v7.md", "EUCLID_VISUAL_PRODUCTION_SPEC.md"]`,
    `source_lesson: "${ctx.sourcePath}"`,
    `legacy_reference: "${ctx.legacyPath}"`,
    'section_structure: "A1-A7 + B1-B8"',
    'status: "draft_corrected_batch_output"',
    '```',
    '',
    '## Correction Notes',
    renderBulletList([
      'A1 is treated as a 3-act video myth retelling.',
      'A2 is visual rhetoric / conveyance mechanism focused on how form carries meaning.',
      'A5 is the material artifact crystallization section.',
      'B2 teaches internal mathematical properties of the element itself.',
      'B3 and B4 explicitly depend on the property named in B2.',
      'B8 closes metaphor and function through one shared property.'
    ]),
    '',
    '## Grade Calibration',
    renderBulletList([
      `Audience stance: ${ctx.gradeProfile.audience}`,
      ctx.gradeProfile.calibration,
      ctx.gradeProfile.mathShift,
      ctx.gradeProfile.teacherMove
    ]),
    '',
    '## Week Throughline',
    `${ctx.weekProfile.geometricTruth} This week treats that truth as **metaphor** on Day A and **function** on Day B, with ${ctx.weekProfile.deity} / ${ctx.weekProfile.element} kept fixed as the chosen pairing for this batch.`,
    '',
    '# Day A — Metaphor Register',
    '',
    ...sections
      .filter((section) => section.code.startsWith('A'))
      .map(renderSectionMarkdown),
    '# Day B — Function Register',
    '',
    ...sections
      .filter((section) => section.code.startsWith('B'))
      .map(renderSectionMarkdown)
  ].join('\n');
}

function buildResearchPacket(ctx, sections) {
  const { weekProfile } = ctx;
  return [
    `# SRQ Research Packet — ${ctx.id}`,
    '',
    '## Frame Parameters',
    renderBulletList([
      'Civilization: Mesopotamia',
      `Week notch: ${ctx.gradeProfile.label} / Week ${weekProfile.week}`,
      `Fixed pairing for this batch: ${weekProfile.deity} / ${weekProfile.element}`,
      `Grade calibration: ${ctx.gradeProfile.audience}`
    ]),
    '',
    '## Candidate Lock',
    renderBulletList([
      `Element locked: ${weekProfile.element}`,
      `Deity locked: ${weekProfile.deity}${weekProfile.deityAlt ? ` (${weekProfile.deityAlt})` : ''}`,
      `A5 anchor artifact: ${weekProfile.anchorArtifact}`,
      `B5 functional stabilization: ${weekProfile.invention}`,
      'This packet does not re-open candidate selection; it routes the fixed pairing through the SRQ lines.'
    ]),
    '',
    '## I-line — Ideology',
    renderBulletList([
      `${weekProfile.deity} frames ${weekProfile.metaphorLabel} through cult, myth, and institutional narrative.`,
      `Monumental or cult anchor: ${weekProfile.architectureAnchor}.`,
      `A1, A4, and A7 harvest this line most strongly for ${ctx.id}.`
    ]),
    '',
    '## A-line — Aesthetics',
    renderBulletList([
      `Primary affordances: ${weekProfile.a2Affordances.join('; ')}.`,
      `Primary carrier set: ${weekProfile.iconography.join('; ')}.`,
      `A2, A3, A5, and A6 route this line into the lesson.`
    ]),
    '',
    '## G-line — Geometry',
    renderBulletList([
      weekProfile.geometricTruth,
      `B2 properties: ${weekProfile.b2Properties.join('; ')}.`,
      `A2, B2, B3, and B8 carry the clearest G-line load.`
    ]),
    '',
    '## M-line — Mathematics',
    renderBulletList([
      `Internal math focus: ${weekProfile.b2Properties.join('; ')}.`,
      `Transformation focus: ${weekProfile.b3Operation}.`,
      `Result focus: ${weekProfile.b4Result}.`
    ]),
    '',
    '## C-line — Power',
    renderBulletList([
      `Institutional spread: ${weekProfile.institutionalSpread.join('; ')}.`,
      `Historical stabilization: ${weekProfile.invention}.`,
      'B5 and A4 carry the heaviest C-line load in this correction batch.'
    ]),
    '',
    '## Structural Validation',
    renderBulletList([
      `A2 ↔ A5: ${weekProfile.anchorArtifact} materializes the same rhetoric named in A2.`,
      `A2 ↔ B2: the same property named visually in A2 is formalized in B2.`,
      `A5 ↔ B5: both sections turn on the same spatial skill crossing registers.`,
      `B2 → B3 → B4: ${weekProfile.b2Properties[0]} → ${weekProfile.b3Operation} → ${weekProfile.b4Result}.`,
      `B8 synthesis claim: ${weekProfile.synthesis}`
    ]),
    '',
    '## Section Index',
    renderBulletList(
      sections.map(
        (section) => `${section.code}: ${section.title}`
      )
    )
  ].join('\n');
}

function sectionPrompt(ctx, section) {
  const week = ctx.weekProfile;
  const useCase =
    section.code === 'A1' || section.code === 'A4' || section.code === 'A7' || section.code === 'B5'
      ? 'historical-scene'
      : section.code === 'A2' || section.code === 'A6' || section.code === 'B2' || section.code === 'B6' || section.code === 'B8'
      ? 'infographic-diagram'
      : 'photorealistic-natural';
  const sourceStrategy =
    section.visual.strategy === 'museum_first'
      ? 'museum-first'
      : section.visual.strategy === 'motion_board'
      ? 'ai + diagram hybrid'
      : section.visual.strategy === 'diagram_first'
      ? 'diagram-first hybrid'
      : 'museum + AI fallback';
  const primaryRequest =
    section.code === 'A1'
      ? week.surfacePrompts.dayA
      : section.code === 'B5'
      ? week.surfacePrompts.dayB
      : `${section.title} for ${ctx.gradeProfile.label}, ${ctx.theme}. Show ${week.deity}, ${week.element}, and the section claim in a visually explicit, historically grounded way.`;
  const overlayNote =
    section.visual.type.includes('OVR') || section.visual.type.includes('DGM')
      ? 'Add clean overlay callouts naming the exact property or carrier relation. Keep overlays minimal and educational.'
      : 'No heavy annotation. Keep the image readable as a premium curriculum surface.';

  return {
    assetId: `${ctx.id}-${section.code}`,
    sectionCode: section.code,
    sectionTitle: section.title,
    visualType: section.visual.type,
    sourceStrategy,
    useCase,
    primaryRequest,
    prompt: [
      `Use case: ${useCase}`,
      `Asset type: ${section.code} primary curriculum still`,
      `Primary request: ${primaryRequest}`,
      'Style/medium: ultra-real historical reconstruction or curriculum-grade diagram hybrid',
      'Composition/framing: 16:9 lesson surface, clear focal hierarchy, room for teacher labels if needed',
      `Lighting/mood: ${section.code.startsWith('A') ? 'ritual / interpretive / atmospheric' : 'clear / explanatory / mechanism-forward'}`,
      `Constraints: period-accurate Mesopotamian materials, no fantasy armor, no modern props, no watermarks, ${overlayNote}`,
      `Avoid: vague fantasy haze, anachronistic architecture, unreadable clutter, stock-photo composition`
    ].join('\n'),
    museumLead:
      section.visual.strategy === 'museum_first' || section.visual.strategy === 'hybrid'
        ? week.iconography
        : [],
    overlayPlan:
      section.visual.type.includes('OVR') || section.visual.type.includes('DGM')
        ? `Name ${week.b2Properties[0] || week.a2Affordances[0]} directly in the overlay.`
        : null,
    surfaceRole:
      section.code.startsWith('A') ? 'Day A reader' : 'Day B reader'
  };
}

function buildImageManifest(ctx, sections) {
  const assets = sections.map((section) => sectionPrompt(ctx, section));
  const motionStudies = ['B3', 'B5', 'B6', 'B8'].map((sectionCode) => ({
    motionId: `${ctx.id}-${sectionCode}-motion`,
    sectionCode,
    concept:
      sectionCode === 'B3'
        ? `${ctx.weekProfile.b3Operation} as property in motion`
        : sectionCode === 'B5'
        ? `${ctx.weekProfile.invention} as a stabilized historical mechanism`
        : sectionCode === 'B6'
        ? `${ctx.weekProfile.invention} decomposed into load-bearing parts`
        : `dual-register synthesis for ${ctx.weekProfile.element}`,
    durationTarget: '8-15 seconds',
    outputMode: '2.5D storyboard / keyframe board'
  }));
  return {
    lessonId: ctx.id,
    grade: ctx.grade,
    week: ctx.weekProfile.week,
    deity: ctx.weekProfile.deity,
    element: ctx.weekProfile.element,
    primaryAssetCount: assets.length,
    assets,
    motionStudies
  };
}

function buildAssetListMarkdown(ctx, manifest) {
  const lines = [
    `# Asset List — ${ctx.id}`,
    '',
    '| Section | Visual Type | Source Strategy | Surface Role |',
    '| --- | --- | --- | --- |'
  ];
  for (const asset of manifest.assets) {
    lines.push(
      `| ${asset.sectionCode} | \`${asset.visualType}\` | ${asset.sourceStrategy} | ${asset.surfaceRole} |`
    );
  }
  lines.push('', '## Motion Boards', '', '| Section | Concept | Output |', '| --- | --- | --- |');
  for (const motion of manifest.motionStudies) {
    lines.push(
      `| ${motion.sectionCode} | ${motion.concept} | ${motion.outputMode} |`
    );
  }
  return lines.join('\n');
}

function buildPromptPackMarkdown(ctx, manifest) {
  return [
    `# Prompt Pack — ${ctx.id}`,
    '',
    ...manifest.assets.map((asset) =>
      [
        `## ${asset.assetId}`,
        `**Section:** ${asset.sectionCode} — ${asset.sectionTitle}`,
        `**Visual Type:** \`${asset.visualType}\``,
        `**Source Strategy:** ${asset.sourceStrategy}`,
        '',
        '```text',
        asset.prompt,
        '```',
        asset.museumLead.length
          ? `Museum lead set: ${asset.museumLead.join('; ')}`
          : 'Museum lead set: none required for this prompt.',
        asset.overlayPlan ? `Overlay plan: ${asset.overlayPlan}` : 'Overlay plan: none',
        ''
      ].join('\n')
    )
  ].join('\n');
}

function buildMotionStudyMarkdown(ctx) {
  const week = ctx.weekProfile;
  const specs = [
    {
      code: 'B3',
      title: 'Transformation Board',
      concept: week.b3Operation,
      keyframes: [
        'Frame 1: static property labeled and isolated',
        `Frame 2: the ${week.element.toLowerCase()} begins to operate`,
        'Frame 3: motion path or transformation reaches peak visibility',
        `Frame 4: operation resolves into ${week.b4Result}`
      ]
    },
    {
      code: 'B5',
      title: 'Historical Mechanism Board',
      concept: week.invention,
      keyframes: [
        'Frame 1: historical setting and operator introduced',
        'Frame 2: mechanism engaged',
        'Frame 3: geometric property highlighted inside the mechanism',
        'Frame 4: stabilized output shown in context'
      ]
    },
    {
      code: 'B6',
      title: 'Engineering Decomposition Board',
      concept: week.engineeringParts.join(', '),
      keyframes: [
        'Frame 1: complete assembled mechanism',
        'Frame 2: first disassembly layer',
        'Frame 3: load-bearing part callouts',
        'Frame 4: rebuilt system with property labels'
      ]
    },
    {
      code: 'B8',
      title: 'Dual-Register Synthesis Board',
      concept: week.synthesis,
      keyframes: [
        'Frame 1: Day A metaphor image language',
        'Frame 2: Day B mechanism image language',
        'Frame 3: the same geometric property highlighted in both',
        'Frame 4: single synthesis statement on one composite board'
      ]
    }
  ];

  return [
    `# Day B Motion Study Spec — ${ctx.id}`,
    '',
    ...specs.map((spec) =>
      [
        `## ${spec.code}: ${spec.title}`,
        `**Concept:** ${spec.concept}`,
        '**Format:** 2.5D keyframe board for SmartEd/Figma placement',
        '**Layer Stack:** background environment, subject/object layer, geometry overlay, annotation layer, motion arrows or phase traces',
        '**Keyframes:**',
        renderBulletList(spec.keyframes),
        ''
      ].join('\n')
    )
  ].join('\n');
}

function buildFigmaPlacementMarkdown(ctx, manifest) {
  return [
    `# Figma Placement Map — ${ctx.id}`,
    '',
    `**Target file:** ${FIGMA_URL}`,
    `**Target page:** EUCLID / Grade ${ctx.grade}`,
    '',
    renderBulletList([
      `Frame: ${frameName(ctx, 'Overview')}`,
      `Frame: ${frameName(ctx, 'Day A Reader')}`,
      `Frame: ${frameName(ctx, 'Day B Reader')}`,
      `Frame: ${frameName(ctx, 'Motion Board')}`
    ]),
    '',
    '## Surface Asset Bindings',
    renderBulletList([
      `Overview hero: FIGMA_PAGES/assets/images/${ctx.id.toLowerCase()}-overview.png`,
      `Day A hero: FIGMA_PAGES/assets/images/${ctx.id.toLowerCase()}-day-a.png`,
      `Day B hero: FIGMA_PAGES/assets/images/${ctx.id.toLowerCase()}-day-b.png`,
      `Motion board placeholder: FIGMA_PAGES/assets/images/${ctx.id.toLowerCase()}-motion-board.svg`
    ]),
    '',
    '## Reader Payload',
    renderBulletList([
      `Day A sections: ${manifest.assets.filter((asset) => asset.sectionCode.startsWith('A')).map((asset) => asset.sectionCode).join(', ')}`,
      `Day B sections: ${manifest.assets.filter((asset) => asset.sectionCode.startsWith('B')).map((asset) => asset.sectionCode).join(', ')}`,
      'SmartEd language reused: top navigation, card rhythm, soft shadows, orange call-to-action treatment.'
    ])
  ].join('\n');
}

function buildSurfaceImagePlanEntry(ctx, variant, prompt) {
  return {
    imageId: `${ctx.id.toLowerCase()}-${variant}`,
    lessonId: ctx.id,
    grade: ctx.grade,
    variant,
    outputFilename: `${ctx.id.toLowerCase()}-${variant}.png`,
    prompt,
    aspectRatio: '16:9',
    fallbackSvg: `${ctx.id.toLowerCase()}-${variant}.svg`
  };
}

function elementShapeSvg(weekProfile) {
  if (weekProfile.elementSlug === 'circle') {
    return `<circle cx="160" cy="160" r="84" fill="none" stroke="${weekProfile.color}" stroke-width="18" />`;
  }
  if (weekProfile.elementSlug === 'crescent') {
    return `<path d="M210 86a84 84 0 1 0 0 148a64 64 0 1 1 0-148z" fill="${weekProfile.color}" opacity="0.92" />`;
  }
  return `<polygon points="160,58 181,110 236,84 210,138 262,160 210,182 236,236 181,210 160,262 139,210 84,236 110,182 58,160 110,138 84,84 139,110" fill="${weekProfile.color}" opacity="0.95" />`;
}

function renderPlaceholderSvg(ctx, label, lines) {
  const safeLines = lines
    .map((line, index) => `<text x="64" y="${260 + index * 36}" font-family="Arial, sans-serif" font-size="24" fill="#E2E8F0">${escapeXml(line)}</text>`)
    .join('');
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1600" height="900" viewBox="0 0 1600 900" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1600" height="900" rx="32" fill="#111827"/>
  <rect x="28" y="28" width="1544" height="844" rx="28" fill="url(#bg)" stroke="#334155" stroke-width="2"/>
  <rect x="64" y="64" width="360" height="360" rx="28" fill="#0F172A" stroke="${ctx.weekProfile.color}" stroke-width="3"/>
  ${elementShapeSvg(ctx.weekProfile)}
  <text x="472" y="132" font-family="Arial, sans-serif" font-size="54" font-weight="700" fill="#F8FAFC">${escapeXml(label)}</text>
  <text x="472" y="190" font-family="Arial, sans-serif" font-size="28" fill="${ctx.weekProfile.color}">${escapeXml(ctx.id)} • ${escapeXml(ctx.weekProfile.deity)} • ${escapeXml(ctx.weekProfile.element)}</text>
  <text x="64" y="504" font-family="Arial, sans-serif" font-size="30" fill="#CBD5E1">${escapeXml(ctx.theme)}</text>
  <text x="64" y="554" font-family="Arial, sans-serif" font-size="26" fill="#94A3B8">Placeholder surface image. Replace with ultra-real generated still when available.</text>
  ${safeLines}
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1600" y2="900" gradientUnits="userSpaceOnUse">
      <stop stop-color="#0F172A"/>
      <stop offset="1" stop-color="#1E293B"/>
    </linearGradient>
  </defs>
</svg>`;
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function renderCss() {
  return `:root {
  --bg: #f6f7fb;
  --surface: #ffffff;
  --surface-2: #f8fafc;
  --ink: #0f172a;
  --muted: #64748b;
  --line: #e2e8f0;
  --accent: #f97316;
  --accent-soft: rgba(249, 115, 22, 0.12);
  --shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
  --radius: 24px;
}

* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: var(--bg); color: var(--ink); font-family: "Segoe UI", system-ui, sans-serif; }
a { color: inherit; text-decoration: none; }
body { min-width: 1440px; }

.topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28px 48px;
  background: rgba(255,255,255,0.94);
  backdrop-filter: blur(18px);
  border-bottom: 1px solid var(--line);
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 18px;
  font-weight: 700;
}

.brand-mark {
  color: var(--accent);
  font-size: 40px;
  line-height: 1;
}

.nav {
  display: flex;
  align-items: center;
  gap: 18px;
  font-size: 15px;
  color: var(--muted);
}

.nav a.active,
.nav a:hover {
  color: var(--accent);
}

.page {
  width: 1440px;
  margin: 0 auto;
  padding: 40px 40px 80px;
}

.hero {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 24px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 32px;
  box-shadow: var(--shadow);
  overflow: hidden;
  margin-bottom: 28px;
}

.hero-copy {
  padding: 42px;
}

.hero-kicker {
  display: inline-block;
  padding: 8px 14px;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-bottom: 18px;
}

.hero h1 {
  margin: 0 0 14px;
  font-size: 48px;
  line-height: 1.05;
}

.hero p {
  margin: 0 0 12px;
  font-size: 17px;
  line-height: 1.6;
  color: var(--muted);
}

.hero-meta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 18px;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  background: var(--surface-2);
  border: 1px solid var(--line);
  color: var(--muted);
  font-size: 13px;
}

.hero-visual {
  position: relative;
  min-height: 360px;
  background: linear-gradient(145deg, rgba(249,115,22,0.22), rgba(37,99,235,0.12));
}

.hero-visual img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 30px 4px 16px;
}

.section-title h2 {
  margin: 0;
  font-size: 24px;
}

.section-title p {
  margin: 0;
  color: var(--muted);
  font-size: 14px;
}

.library-grid,
.week-stack {
  display: grid;
  gap: 20px;
}

.library-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.card,
.week-block,
.frame-card {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

.library-card {
  overflow: hidden;
}

.library-card img {
  width: 100%;
  height: 220px;
  object-fit: cover;
  display: block;
}

.library-card .copy {
  padding: 20px;
}

.library-card h3 {
  margin: 8px 0 10px;
  font-size: 24px;
}

.library-card p {
  margin: 0;
  color: var(--muted);
  line-height: 1.55;
}

.week-block {
  padding: 24px;
}

.week-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.week-header h3 {
  margin: 0;
  font-size: 32px;
}

.week-header .meta {
  color: var(--muted);
  font-size: 14px;
}

.frames {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.frame-card {
  overflow: hidden;
}

.frame-card.full {
  grid-column: 1 / -1;
}

.frame-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  border-bottom: 1px solid var(--line);
}

.frame-top h4 {
  margin: 0;
  font-size: 20px;
}

.frame-top span {
  color: var(--muted);
  font-size: 13px;
}

.frame-visual {
  height: 320px;
  background: linear-gradient(135deg, rgba(249,115,22,0.12), rgba(15,23,42,0.06));
}

.frame-visual img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.frame-body {
  padding: 18px;
}

.frame-body p {
  margin: 0 0 12px;
  color: var(--muted);
  line-height: 1.55;
}

.frame-body ul {
  margin: 0;
  padding-left: 18px;
  color: var(--muted);
  display: grid;
  gap: 8px;
}

.section-chip-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.chip {
  padding: 7px 10px;
  border-radius: 999px;
  background: var(--surface-2);
  border: 1px solid var(--line);
  font-size: 12px;
  color: var(--ink);
}

.motion-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.motion-step {
  padding: 16px;
  border-radius: 18px;
  background: var(--surface-2);
  border: 1px solid var(--line);
}

.motion-step strong {
  display: block;
  margin-bottom: 8px;
}

.footer-note {
  margin-top: 36px;
  color: var(--muted);
  font-size: 13px;
}
`;
}

function renderTopbar(activeHref) {
  return `<header class="topbar">
  <div class="brand">
    <span class="brand-mark">SmartEd</span>
    <span>EUCLID Lesson Surfaces</span>
  </div>
  <nav class="nav">
    <a href="./euclid-library.html"${activeHref === 'library' ? ' class="active"' : ''}>Library</a>
    <a href="./euclid-grade-3.html"${activeHref === 'g3' ? ' class="active"' : ''}>Grade 3</a>
    <a href="./euclid-grade-4.html"${activeHref === 'g4' ? ' class="active"' : ''}>Grade 4</a>
    <a href="./euclid-grade-5.html"${activeHref === 'g5' ? ' class="active"' : ''}>Grade 5</a>
  </nav>
</header>`;
}

function imageTag(baseName, alt) {
  return `<img src="./assets/images/${baseName}.png" alt="${escapeXml(alt)}" onerror="this.onerror=null;this.src='./assets/images/${baseName}.svg';" />`;
}

function renderLibraryPage(batchIndex) {
  const cards = batchIndex.lessons
    .map((lesson) => {
      return `<article class="card library-card">
  ${imageTag(`${lesson.id.toLowerCase()}-overview`, `${lesson.id} overview`)}
  <div class="copy">
    <div class="pill">${lesson.gradeLabel} • Week ${lesson.week}</div>
    <h3>${lesson.deity} &amp; the ${lesson.element}</h3>
    <p>${escapeXml(lesson.theme)}</p>
    <div class="section-chip-wrap">
      <span class="chip">A1-A7</span>
      <span class="chip">B1-B8</span>
      <span class="chip">${escapeXml(lesson.anchorArtifact)}</span>
      <span class="chip">${escapeXml(lesson.invention)}</span>
    </div>
  </div>
</article>`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>EUCLID Library</title>
  <link rel="stylesheet" href="./assets/styles.css" />
  <script src="https://mcp.figma.com/mcp/html-to-design/capture.js" async></script>
</head>
<body>
  ${renderTopbar('library')}
  <main class="page">
    <section class="hero">
      <div class="hero-copy">
        <div class="hero-kicker">EUCLID / Library</div>
        <h1>Corrected SRQ / v7 lesson batch for SmartEd</h1>
        <p>This library page groups the first three weeks of Grades 3–5 into one consistent review surface for Figma import.</p>
        <p>Every card routes to a corrected 15-section lesson, a Day A / Day B surface, a motion board, and a full asset prompt pack.</p>
        <div class="hero-meta">
          <span class="pill">9 corrected lessons</span>
          <span class="pill">15 primary assets per lesson</span>
          <span class="pill">4 motion studies per lesson</span>
        </div>
      </div>
      <div class="hero-visual">
        ${imageTag('library-hero', 'EUCLID library hero')}
      </div>
    </section>
    <div class="section-title">
      <h2>Batch Library</h2>
      <p>Grouped by grade, week, deity, element, and surface image set.</p>
    </div>
    <section class="library-grid">
      ${cards}
    </section>
    <p class="footer-note">Target Figma file: ${escapeXml(FIGMA_URL)}</p>
  </main>
</body>
</html>`;
}

function renderGradePage(grade, lessons) {
  const gradeKey = `g${grade}`;
  const blocks = lessons
    .map((lesson) => {
      const aSections = lesson.sections.filter((section) => section.code.startsWith('A'));
      const bSections = lesson.sections.filter((section) => section.code.startsWith('B'));
      return `<section class="week-block">
  <div class="week-header">
    <div>
      <h3>${lesson.id} — ${lesson.deity} &amp; the ${lesson.element}</h3>
      <div class="meta">${escapeXml(lesson.theme)}</div>
    </div>
    <div class="section-chip-wrap">
      <span class="chip">${escapeXml(lesson.anchorArtifact)}</span>
      <span class="chip">${escapeXml(lesson.invention)}</span>
      <span class="chip">${lesson.primaryAssetCount} primary stills</span>
    </div>
  </div>
  <div class="frames">
    <article class="frame-card">
      <div class="frame-top">
        <h4>${frameName(lesson, 'Overview')}</h4>
        <span>Library + week summary</span>
      </div>
      <div class="frame-visual">${imageTag(`${lesson.id.toLowerCase()}-overview`, `${lesson.id} overview`)}</div>
      <div class="frame-body">
        <p>${escapeXml(lesson.geometricTruth)}</p>
        <div class="section-chip-wrap">
          <span class="chip">${escapeXml(lesson.metaphorLabel)}</span>
          <span class="chip">${escapeXml(lesson.functionLabel)}</span>
          <span class="chip">${escapeXml(lesson.gradeAudience)}</span>
        </div>
      </div>
    </article>
    <article class="frame-card">
      <div class="frame-top">
        <h4>${frameName(lesson, 'Day A Reader')}</h4>
        <span>Metaphor register</span>
      </div>
      <div class="frame-visual">${imageTag(`${lesson.id.toLowerCase()}-day-a`, `${lesson.id} Day A`)}</div>
      <div class="frame-body">
        <p>${escapeXml(lesson.dayASummary)}</p>
        <div class="section-chip-wrap">
          ${aSections.map((section) => `<span class="chip">${section.code} ${escapeXml(section.title)}</span>`).join('')}
        </div>
      </div>
    </article>
    <article class="frame-card">
      <div class="frame-top">
        <h4>${frameName(lesson, 'Day B Reader')}</h4>
        <span>Function register</span>
      </div>
      <div class="frame-visual">${imageTag(`${lesson.id.toLowerCase()}-day-b`, `${lesson.id} Day B`)}</div>
      <div class="frame-body">
        <p>${escapeXml(lesson.dayBSummary)}</p>
        <div class="section-chip-wrap">
          ${bSections.map((section) => `<span class="chip">${section.code} ${escapeXml(section.title)}</span>`).join('')}
        </div>
      </div>
    </article>
    <article class="frame-card">
      <div class="frame-top">
        <h4>${frameName(lesson, 'Motion Board')}</h4>
        <span>2.5D Day B studies</span>
      </div>
      <div class="frame-visual">${imageTag(`${lesson.id.toLowerCase()}-motion-board`, `${lesson.id} motion board`)}</div>
      <div class="frame-body">
        <p>Day B motion board for B3, B5, B6, and B8.</p>
        <div class="motion-grid">
          ${lesson.motionBoard.map((motion) => `<div class="motion-step"><strong>${motion.code}</strong><span>${escapeXml(motion.concept)}</span></div>`).join('')}
        </div>
      </div>
    </article>
  </div>
</section>`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>EUCLID Grade ${grade}</title>
  <link rel="stylesheet" href="./assets/styles.css" />
  <script src="https://mcp.figma.com/mcp/html-to-design/capture.js" async></script>
</head>
<body>
  ${renderTopbar(gradeKey)}
  <main class="page">
    <section class="hero">
      <div class="hero-copy">
        <div class="hero-kicker">EUCLID / Grade ${grade}</div>
        <h1>Grade ${grade} corrected lesson surfaces</h1>
        <p>${escapeXml(GRADE_PROFILES[grade].calibration)}</p>
        <p>${escapeXml(GRADE_PROFILES[grade].mathShift)}</p>
        <div class="hero-meta">
          <span class="pill">${GRADE_PROFILES[grade].audience}</span>
          <span class="pill">Weeks 1–3</span>
          <span class="pill">${lessons.length} lesson blocks</span>
        </div>
      </div>
      <div class="hero-visual">${imageTag(`grade-${grade}-hero`, `Grade ${grade} hero`)}</div>
    </section>
    <div class="section-title">
      <h2>Lesson Frames</h2>
      <p>Each week includes overview, Day A, Day B, and motion board surfaces.</p>
    </div>
    <div class="week-stack">
      ${blocks}
    </div>
    <p class="footer-note">Import target: EUCLID / Grade ${grade} page in SmartEd Figma file.</p>
  </main>
</body>
</html>`;
}

async function writeFile(filePath, content) {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content);
}

async function main() {
  await ensureDir(OUTPUT_ROOT);

  const batchIndex = {
    generatedAt: new Date().toISOString(),
    outputRoot: OUTPUT_ROOT,
    targetFigma: FIGMA_URL,
    lessons: []
  };
  const surfaceImagePlan = [];

  for (const grade of [3, 4, 5]) {
    const gradeDir = path.join(OUTPUT_ROOT, `GRADE_${grade}`);
    await ensureDir(gradeDir);
    for (const week of [1, 2, 3]) {
      const weekProfile = WEEK_PROFILES[week];
      const gradeProfile = GRADE_PROFILES[grade];
      const { sourcePath, legacyPath } = sourcePaths(grade, weekProfile);
      const theme = weekProfile.themeByGrade[grade];
      const id = weekId(grade, week);
      const weekDir = path.join(
        gradeDir,
        `WEEK_${week}_${titleSlug(weekProfile.deity)}_${titleSlug(weekProfile.element)}`
      );
      await ensureDir(weekDir);

      const ctx = {
        id,
        grade,
        theme,
        sourcePath,
        legacyPath,
        gradeProfile,
        weekProfile
      };

      const sections = SECTION_ORDER.map((code) => buildSection(ctx, code));
      const manifest = buildImageManifest(ctx, sections);
      const lessonMarkdown = buildLessonMarkdown(ctx, sections);
      const researchMarkdown = buildResearchPacket(ctx, sections);
      const assetListMarkdown = buildAssetListMarkdown(ctx, manifest);
      const promptPackMarkdown = buildPromptPackMarkdown(ctx, manifest);
      const motionStudyMarkdown = buildMotionStudyMarkdown(ctx);
      const figmaPlacementMarkdown = buildFigmaPlacementMarkdown(ctx, manifest);

      await writeFile(path.join(weekDir, `${id}__corrected_lesson.md`), lessonMarkdown);
      await writeFile(path.join(weekDir, `${id}__srq_research_packet.md`), researchMarkdown);
      await writeFile(path.join(weekDir, `${id}__image_manifest.json`), JSON.stringify(manifest, null, 2));
      await writeFile(path.join(weekDir, `${id}__asset_list.md`), assetListMarkdown);
      await writeFile(path.join(weekDir, `${id}__prompt_pack.md`), promptPackMarkdown);
      await writeFile(path.join(weekDir, `${id}__day_b_motion_study_spec.md`), motionStudyMarkdown);
      await writeFile(path.join(weekDir, `${id}__figma_placement_map.md`), figmaPlacementMarkdown);

      const overviewPlan = buildSurfaceImagePlanEntry(ctx, 'overview', weekProfile.surfacePrompts.overview);
      const dayAPlan = buildSurfaceImagePlanEntry(ctx, 'day-a', weekProfile.surfacePrompts.dayA);
      const dayBPlan = buildSurfaceImagePlanEntry(ctx, 'day-b', weekProfile.surfacePrompts.dayB);
      surfaceImagePlan.push(overviewPlan, dayAPlan, dayBPlan);

      batchIndex.lessons.push({
        id,
        grade,
        gradeLabel: gradeProfile.label,
        week,
        deity: weekProfile.deity,
        element: weekProfile.element,
        theme,
        geometricTruth: weekProfile.geometricTruth,
        metaphorLabel: weekProfile.metaphorLabel,
        functionLabel: weekProfile.functionLabel,
        anchorArtifact: weekProfile.anchorArtifact,
        invention: weekProfile.invention,
        primaryAssetCount: manifest.primaryAssetCount,
        gradeAudience: gradeProfile.audience,
        dayASummary: sections
          .filter((section) => section.code.startsWith('A'))
          .slice(0, 3)
          .map((section) => section.title)
          .join(' • '),
        dayBSummary: sections
          .filter((section) => section.code.startsWith('B'))
          .slice(1, 5)
          .map((section) => section.title)
          .join(' • '),
        sections: sections.map((section) => ({
          code: section.code,
          title: section.title
        })),
        motionBoard: manifest.motionStudies.map((motion) => ({
          code: motion.sectionCode,
          concept: motion.concept
        }))
      });
    }
  }

  const figmaDir = path.join(OUTPUT_ROOT, 'FIGMA_PAGES');
  const figmaAssetsDir = path.join(figmaDir, 'assets');
  const figmaImagesDir = path.join(figmaAssetsDir, 'images');
  await ensureDir(figmaImagesDir);
  await writeFile(path.join(figmaAssetsDir, 'styles.css'), renderCss());
  await writeFile(path.join(figmaDir, 'euclid-library.html'), renderLibraryPage(batchIndex));
  for (const grade of [3, 4, 5]) {
    const lessons = batchIndex.lessons.filter((lesson) => lesson.grade === grade);
    await writeFile(
      path.join(figmaDir, `euclid-grade-${grade}.html`),
      renderGradePage(grade, lessons)
    );
  }

  const libraryHeroSvg = renderPlaceholderSvg(
    {
      id: 'EUCLID-LIBRARY',
      theme: 'Corrected lesson library',
      weekProfile: { color: '#F97316', elementSlug: 'circle', deity: 'EUCLID', element: 'Batch' }
    },
    'EUCLID Library Surface',
    ['Nine corrected lessons', 'SmartEd-aligned cards and reader frames', 'Figma import-ready static pages']
  );
  await writeFile(path.join(figmaImagesDir, 'library-hero.svg'), libraryHeroSvg);

  for (const grade of [3, 4, 5]) {
    const svg = renderPlaceholderSvg(
      {
        id: `GRADE-${grade}`,
        theme: `Grade ${grade} correction batch`,
        weekProfile: { color: '#F97316', elementSlug: 'circle', deity: `Grade ${grade}`, element: 'Batch' }
      },
      `Grade ${grade} Surface Hero`,
      [
        GRADE_PROFILES[grade].audience,
        'Weeks 1–3 corrected into v7 structure',
        'Overview, Day A, Day B, and motion boards'
      ]
    );
    await writeFile(path.join(figmaImagesDir, `grade-${grade}-hero.svg`), svg);
  }

  for (const lesson of batchIndex.lessons) {
    const ctx = {
      id: lesson.id,
      theme: lesson.theme,
      weekProfile: WEEK_PROFILES[lesson.week]
    };
    await writeFile(
      path.join(figmaImagesDir, `${lesson.id.toLowerCase()}-overview.svg`),
      renderPlaceholderSvg(ctx, `${lesson.id} Overview`, [
        lesson.metaphorLabel,
        lesson.functionLabel,
        lesson.anchorArtifact
      ])
    );
    await writeFile(
      path.join(figmaImagesDir, `${lesson.id.toLowerCase()}-day-a.svg`),
      renderPlaceholderSvg(ctx, `${lesson.id} Day A`, [
        'Metaphor register',
        lesson.sections
          .filter((section) => section.code.startsWith('A'))
          .slice(0, 3)
          .map((section) => section.title)
          .join(' / ')
      ])
    );
    await writeFile(
      path.join(figmaImagesDir, `${lesson.id.toLowerCase()}-day-b.svg`),
      renderPlaceholderSvg(ctx, `${lesson.id} Day B`, [
        'Function register',
        lesson.sections
          .filter((section) => section.code.startsWith('B'))
          .slice(1, 4)
          .map((section) => section.title)
          .join(' / ')
      ])
    );
    await writeFile(
      path.join(figmaImagesDir, `${lesson.id.toLowerCase()}-motion-board.svg`),
      renderPlaceholderSvg(ctx, `${lesson.id} Motion Board`, [
        ...lesson.motionBoard.map((motion) => `${motion.code}: ${motion.concept}`)
      ])
    );
  }

  await writeFile(
    path.join(OUTPUT_ROOT, 'batch_index.json'),
    JSON.stringify(batchIndex, null, 2)
  );
  await writeFile(
    path.join(OUTPUT_ROOT, 'surface_image_plan.json'),
    JSON.stringify(surfaceImagePlan, null, 2)
  );
  await writeFile(
    path.join(OUTPUT_ROOT, 'README.md'),
    [
      '# CORRECTED_SRQ_V7_FIGMA_BATCH',
      '',
      'This batch contains corrected v7 lesson packets for:',
      '',
      '- Grade 3 Weeks 1-3',
      '- Grade 4 Weeks 1-3',
      '- Grade 5 Weeks 1-3',
      '',
      'Outputs per week:',
      '',
      '- corrected lesson markdown',
      '- SRQ research packet',
      '- image manifest',
      '- asset list',
      '- prompt pack',
      '- Day B motion study spec',
      '- Figma placement map',
      '',
      'Figma-ready HTML pages live in `FIGMA_PAGES/`.',
      '',
      `Target file: ${FIGMA_URL}`,
      '',
      'Generated by `tools/build_srq_v7_figma_batch.mjs`.'
    ].join('\n')
  );
  await writeFile(
    path.join(OUTPUT_ROOT, 'FIGMA_IMPORT_INSTRUCTIONS.md'),
    [
      '# Figma Import Instructions',
      '',
      `Target file: ${FIGMA_URL}`,
      '',
      'Local pages to import:',
      '',
      '- `FIGMA_PAGES/euclid-library.html` → `EUCLID / Library`',
      '- `FIGMA_PAGES/euclid-grade-3.html` → `EUCLID / Grade 3`',
      '- `FIGMA_PAGES/euclid-grade-4.html` → `EUCLID / Grade 4`',
      '- `FIGMA_PAGES/euclid-grade-5.html` → `EUCLID / Grade 5`',
      '',
      'Serve `FIGMA_PAGES/` from a localhost static server before capture/import.',
      '',
      'Surface image fallbacks are SVG placeholders in `FIGMA_PAGES/assets/images/`.',
      'If PNG files with the same base names are generated later, the pages will automatically use those PNGs first.'
    ].join('\n')
  );

  console.log(`Built SRQ/v7 batch in ${OUTPUT_ROOT}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
