import { storage } from "./storage";

export interface TimelineNode {
  id: string;
  track: "circle" | "crescent" | "star" | "triangle" | "square";
  year: number;
  r: number;
  title: string;
  desc: string;
  type: "gea" | "gek" | "gem" | "gephr" | "invention" | "artifact";
  dayB: string;
}

export interface ConvergenceLink {
  year: number;
  y1: string;
  y2: string;
  label: string;
}

export const TIMELINE_NODES: TimelineNode[] = [
  { id: "c1", track: "circle", year: -6200, r: 7, title: "Halaf painted circles", desc: "Concentric circles, petal-doubling (4→8→16→32→64) on pottery bowls. BM 1934,0210.11, Arpachiyah. Earliest systematic circle division.", type: "gea", dayB: "B5: earliest circle recognition" },
  { id: "c2", track: "circle", year: -5800, r: 7, title: "Samarra Plate", desc: "VA 13400, Berlin. 8 fish in rotational composition, ~120 rim lines. Dynamic circular design with possible base-6 awareness.", type: "gea", dayB: "B5: rotational composition" },
  { id: "c3", track: "circle", year: -4500, r: 6, title: "Slow potter's wheel (tournette)", desc: "Rotating platform for shaping clay. Prerequisites: circular disc, axis of rotation, intuitive centrifugal understanding.", type: "invention", dayB: "B6 candidate: first rotational machine" },
  { id: "c4", track: "circle", year: -3500, r: 8, title: "Fast potter's wheel", desc: "True wheel at Ur and Uruk. Oldest surviving wheel ~3129 BCE. Enables mass production of uniform round vessels.", type: "invention", dayB: "B6: current invention moment" },
  { id: "c5", track: "circle", year: -3500, r: 6, title: "Wheeled cart pictograph", desc: "Eanna district, Uruk. Earliest depiction of wheel used for transport. Circle property: circumference = predictable rolling distance.", type: "invention", dayB: "B4/B5: circle in transport" },
  { id: "c6", track: "circle", year: -2600, r: 7, title: "Standard of Ur — wheeled wagons", desc: "BM 121201. Four-wheeled battle wagons with solid disc wheels made of joined wooden pieces. Circle in military/trade technology.", type: "artifact", dayB: "B5: circle at war and trade" },
  { id: "c7", track: "circle", year: -1800, r: 8, title: "π ≈ 3.125 (Susa tablet)", desc: "Louvre, TMS series. Best pre-Archimedean approximation. Circumscribed circle calculations. Your B2 proof confirmed by tablet.", type: "gek", dayB: "B2: mathematical formalization" },
  { id: "c8", track: "circle", year: -700, r: 6, title: "360° circle division formalized", desc: "Ecliptic divided into 12 × 30° = 360°. Direct link: 360 days ≈ 1 year, base-60 system. Still used today.", type: "gek", dayB: "B5: circle becomes measurement standard" },
  { id: "c9", track: "circle", year: -350, r: 7, title: "Jupiter trapezoid tablets", desc: "BM 40054. Displacement as area under velocity-time curve. Circle's angular measurement applied to planetary motion. Proto-calculus.", type: "gek", dayB: "B5: circle in abstract reasoning" },

  { id: "cr1", track: "crescent", year: -2900, r: 7, title: "Crescent on Early Dynastic seals", desc: "First distinct crescent symbol (not partial circle). Recumbent orientation matching new moon at Mesopotamian latitude. Nanna/Sin emblem.", type: "gephr", dayB: "A1/A4: iconographic emergence" },
  { id: "cr2", track: "crescent", year: -2100, r: 7, title: "Seal of Ḫašḫamer", desc: "British Museum, Ur III period. Famous Sin/crescent seal. Crescent as institutional emblem of moon god cult.", type: "artifact", dayB: "A3/A4: material culture" },
  { id: "cr3", track: "crescent", year: -3000, r: 6, title: "Lunar calendar standardized", desc: "12 months × ~30 days. Month begins at first crescent sighting. 360-day ideal year = 360° circle. Geometric observation, not crescent geometry.", type: "invention", dayB: "B6: current invention (but uses CIRCLE property)" },
  { id: "cr4", track: "crescent", year: -3300, r: 5, title: "Bronze sickle tools", desc: "Curved cutting edge. Genuine crescent geometry: arc distributes force along sweeping path. Sequential contact = less force needed.", type: "invention", dayB: "B1/B4: actual geometric function of crescent" },
  { id: "cr5", track: "crescent", year: -1186, r: 7, title: "Kudurru of Meli-Shipak II", desc: "Louvre Sb 22. Canonical triad: 8-star + crescent + solar disc. All three lesson elements together on one artifact.", type: "artifact", dayB: "Cross-element convergence" },
  { id: "cr6", track: "crescent", year: -1000, r: 6, title: "MUL.APIN compendium", desc: "66 stars catalogued, zigzag daylight functions, proto-zodiac. Lunar observation systematized. Uses 360-day year framework.", type: "gek", dayB: "B5: astronomical formalization" },
  { id: "cr7", track: "crescent", year: -600, r: 5, title: "Saros eclipse cycle", desc: "223 synodic months. Predicting lunar eclipses from accumulated observation. Crescent observation → mathematical astronomy.", type: "gek", dayB: "B5: prediction from observation" },

  { id: "s1", track: "star", year: -6100, r: 5, title: "4-petal rosettes on Halaf seals", desc: "Arpachiyah, Domuztepe stamp seals. Circle + 4-fold radial symmetry. GEM precursor to 8-star.", type: "gem", dayB: "B5: earliest radial division" },
  { id: "s2", track: "star", year: -3100, r: 6, title: "Rosettes on Jemdet Nasr pottery", desc: "8-petaled rosettes on pottery and temple objects. Sacred decoration encoding 8-fold division. Shape enters culture.", type: "gem", dayB: "B5: 8-fold division appears" },
  { id: "s3", track: "star", year: -2900, r: 7, title: "8-pointed star on ED seals", desc: "Ishtar/Inanna association begins. Initially general celestial symbol, becomes Venus-specific. Recognizable from any rotation angle.", type: "gephr", dayB: "B4: rotation → recognition (seal function)" },
  { id: "s4", track: "star", year: -2500, r: 6, title: "Cylinder seal recognition", desc: "8-pointed star on thousands of seals. 8-fold rotational symmetry = readable while rolling at any angle. Functional geometry.", type: "artifact", dayB: "B4: mechanical result of rotation symmetry" },
  { id: "s5", track: "star", year: -1200, r: 6, title: "Assyrian palace rosettes", desc: "Nimrud/Nineveh. Carved stone 8-fold rosettes. Octagon+square tessellation for floor coverage. 45° enabling space-filling.", type: "artifact", dayB: "B4: tessellation → coverage" },
  { id: "s6", track: "star", year: -1200, r: 5, title: "Star catalogs (8-sector sky)", desc: "Babylonian astronomers divide sky into 8 sections (45° each). 8→16→32 subdivision for precision. Same property, new domain.", type: "gek", dayB: "B4: subdivision → precision" },
  { id: "s7", track: "star", year: -300, r: 7, title: "Uruk compass card", desc: "Cuneiform tablet determining 'place of rising of winds.' 8 directional divisions. Precursor to compass rose. 45° = navigation.", type: "invention", dayB: "B6: compass rose precursor" },

  { id: "t1", track: "triangle", year: -6000, r: 6, title: "Triangles on Hassuna pottery", desc: "Tell Hassuna. Lines, triangles, cross-hatching in red paint. Among earliest decorative motifs in Mesopotamia.", type: "gea", dayB: "B5: earliest triangle recognition" },
  { id: "t2", track: "triangle", year: -10000, r: 4, title: "Flint/obsidian arrowheads", desc: "Triangular tool shapes predate ceramics. Functional triangle: cutting edge, penetration geometry. Pre-Mesopotamian.", type: "artifact", dayB: "B4: functional triangle before decoration" },
  { id: "t3", track: "triangle", year: -5500, r: 6, title: "Buttressed walls at Sawwan", desc: "Tell es-Sawwan. Earliest buttress-and-recess construction. Triangular bracing principle in architecture.", type: "invention", dayB: "B4: triangular bracing 3400 yrs before Ur-Nammu" },
  { id: "t4", track: "triangle", year: -5400, r: 5, title: "Eridu temple buttresses", desc: "Level XVI. Buttress-and-recess decoration becomes standard on temple façades. Triangle as architectural principle.", type: "artifact", dayB: "B5: triangle in monumental architecture" },
  { id: "t5", track: "triangle", year: -4000, r: 5, title: "Three-legged stools/tripods", desc: "Bronze tripod stands at virtually every Mesopotamian site. 3 points define a plane. Guaranteed surface contact on any floor.", type: "artifact", dayB: "B4: 3-point stability" },
  { id: "t6", track: "triangle", year: -2600, r: 6, title: "Royal Tombs — true arches", desc: "Ur, PG 800. Woolley documented true arches. Triangulation of forces in vault construction. BM + Penn Museum.", type: "gek", dayB: "B5: triangle in force distribution" },
  { id: "t7", track: "triangle", year: -2100, r: 8, title: "Ziggurat of Ur — buttress system", desc: "Ur-Nammu. Systematic triangular buttresses every 3-5m. Baked brick + bitumen. Enabled 30m height. ~720,000 bricks.", type: "invention", dayB: "B6: current invention moment" },
  { id: "t8", track: "triangle", year: -1800, r: 7, title: "Plimpton 322", desc: "Columbia University. 15 Pythagorean triples in sexagesimal. Systematic knowledge of triangle side relationships.", type: "gek", dayB: "B2/B5: triangle math formalized" },
  { id: "t9", track: "triangle", year: -1800, r: 6, title: "YBC 7289 — √2 to 6 decimals", desc: "Yale. Square with diagonals. √2 = 1.414213... Greatest ancient computational accuracy. Triangle diagonal relationship.", type: "gek", dayB: "B2: mathematical proof on tablet" },
  { id: "t10", track: "triangle", year: -1900, r: 7, title: "Si.427 — oldest applied geometry", desc: "Istanbul Museum. Land survey using Pythagorean triples (3-4-5) for right-angle boundaries. Oldest known applied geometry.", type: "gek", dayB: "B5: Pythagorean theorem 1000+ yrs before Pythagoras" },

  { id: "sq1", track: "square", year: -7000, r: 5, title: "Rectangular architecture begins", desc: "Upper Mesopotamia. Rectilinear buildings 1000 yrs before Halaf circular tholoi. Right angles in construction.", type: "gea", dayB: "Foundational: rectangle as building unit" },
  { id: "sq2", track: "square", year: -6000, r: 5, title: "Hassuna adobe dwellings", desc: "Tell Hassuna. Adobe houses around open central courts. Standardized rectangular plans.", type: "artifact", dayB: "B5: rectangle in civic planning" },
  { id: "sq3", track: "square", year: -5300, r: 5, title: "Checkerboard grid — Arpachiyah", desc: "Burnt House plate A 751(B). Centered checkered field of equidistant staggered squares. One of earliest grid patterns.", type: "gem", dayB: "B5: grid as compositional principle" },
  { id: "sq4", track: "square", year: -5000, r: 6, title: "Standardized mud bricks", desc: "Mould-made bricks of standard size. By Late Uruk: Riemchen bricks at 1:1:2 ratio. Modular geometric units.", type: "invention", dayB: "B6 candidate: standardization as geometric invention" },
  { id: "sq5", track: "square", year: -3400, r: 6, title: "Cuneiform — geometric abstraction", desc: "Evolution from curved pictographs to 5 straight wedge elements. Triangular stylus impression = fundamental geometric unit.", type: "gek", dayB: "B5: geometry enables writing system" },
  { id: "sq6", track: "square", year: -2700, r: 6, title: "Sexagesimal system matures", desc: "Base-60. 360 = 6×60. Smallest number divisible by 1-6. Enables fractional division for trade, surveying, astronomy.", type: "gek", dayB: "B2/B5: number system IS geometric" },
  { id: "sq7", track: "square", year: -2650, r: 6, title: "Nippur cubit rod", desc: "Istanbul Museum. World's oldest ruler. Sumerian cubit ~518.5mm with graduated subdivisions. Standardized measurement.", type: "artifact", dayB: "B5: measurement standardization" },
  { id: "sq8", track: "square", year: -1800, r: 7, title: "BM 15285 — 41 area problems", desc: "British Museum. Circles in squares, composite figures. Systematic geometric problem-solving with diagrams.", type: "gek", dayB: "B2: square/rectangle area formalization" },
];

export const CONVERGENCE_LINKS: ConvergenceLink[] = [
  { year: -3500, y1: "circle", y2: "star", label: "Cylinder seal: circle (rolling) + emerging star (recognition)" },
  { year: -2100, y1: "circle", y2: "triangle", label: "Ziggurat: circle (columns) + triangle (buttresses)" },
  { year: -1186, y1: "crescent", y2: "star", label: "Kudurru Sb 22: crescent + 8-star + solar disc (ALL elements)" },
  { year: -1200, y1: "star", y2: "square", label: "Palace tiles: octagon (8-star) + square tessellation" },
  { year: -3500, y1: "circle", y2: "square", label: "Potter's wheel + standardized brick: circular production of rectangular units" },
  { year: -2600, y1: "circle", y2: "triangle", label: "Standard of Ur: wheeled carts (circle) + structural frames (triangle)" },
];

function importanceScore(node: TimelineNode): number {
  const typeScore: Record<string, number> = {
    gek: 5,
    invention: 4,
    gephr: 3,
    artifact: 3,
    gem: 3,
    gea: 2,
  };
  const base = typeScore[node.type] ?? 2;
  const radiusBonus = node.r >= 8 ? 2 : node.r >= 7 ? 1 : 0;
  return Math.min(base + radiusBonus, 7);
}

function magicTagsForNode(node: TimelineNode): string[] {
  const tags: string[] = [];
  if (node.type === "gek" || node.dayB.includes("B2")) tags.push("M");
  if (node.type === "gea" || node.type === "gephr") tags.push("A");
  if (node.type === "gem" || node.track === "star" || node.track === "triangle" || node.track === "square") tags.push("G");
  if (node.desc.toLowerCase().includes("standard") || node.desc.toLowerCase().includes("institutional") || node.desc.toLowerCase().includes("cult")) tags.push("I");
  if (node.desc.toLowerCase().includes("military") || node.desc.toLowerCase().includes("power") || node.desc.toLowerCase().includes("palace") || node.desc.toLowerCase().includes("king")) tags.push("C");
  return Array.from(new Set(tags));
}

function periodForYear(year: number): string {
  if (year < -5000) return "Ubaid / Halaf (-6500 to -5000)";
  if (year < -3200) return "Chalcolithic / Uruk (-5000 to -3200)";
  if (year < -2350) return "Early Dynastic (-3200 to -2350)";
  if (year < -2100) return "Akkadian (-2350 to -2100)";
  if (year < -2000) return "Ur III (-2100 to -2000)";
  if (year < -1600) return "Old Babylonian (-2000 to -1600)";
  if (year < -900) return "Kassite / Middle Assyrian (-1600 to -900)";
  if (year < -600) return "Neo-Assyrian (-900 to -600)";
  return "Neo-Babylonian / Achaemenid (-600 to -330)";
}

function searchQueriesForNode(node: TimelineNode): string[] {
  const queries = [node.title];
  const museumMatch = node.desc.match(/BM \d+[,\.\d]*/);
  if (museumMatch) queries.push(`British Museum ${museumMatch[0]}`);
  const louvreMatch = node.desc.match(/Louvre[, ]+([A-Z]{1,3}[\s\d]+)/);
  if (louvreMatch) queries.push(`Louvre ${louvreMatch[1]}`);
  queries.push(`${node.title} Mesopotamia ${Math.abs(node.year)} BCE`);
  queries.push(`${node.track} geometry ancient Mesopotamia ${node.title}`);
  return queries.slice(0, 4);
}

export async function seedTimelineArtifacts(): Promise<{
  created: number;
  skipped: number;
  errors: string[];
}> {
  let created = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const node of TIMELINE_NODES) {
    try {
      const existing = await storage.findEntitiesByLabel(node.title);
      if (existing.length > 0) {
        skipped++;
        continue;
      }

      const score = importanceScore(node);
      const magic = magicTagsForNode(node);
      const period = periodForYear(node.year);
      const queries = searchQueriesForNode(node);

      const entity = await storage.createEntity({
        label: node.title,
        aliases: [],
        entityType: "artifact",
        description: node.desc,
        period,
        region: "Mesopotamia",
        magicTags: magic,
        metadata: {
          timelineId: node.id,
          track: node.track,
          yearBce: node.year,
          artifactType: node.type,
          dayBSlot: node.dayB,
          importanceScore: score,
          radiusHint: node.r,
          searchQueries: queries,
          convergences: CONVERGENCE_LINKS
            .filter((c) => c.y1 === node.track || c.y2 === node.track)
            .filter((c) => Math.abs(c.year - node.year) < 300)
            .map((c) => c.label),
        },
      });

      await storage.createVisualRequirement({
        entityId: entity.id,
        kind: ["gek", "gem"].includes(node.type) ? "SOURCE_PLUS_OVERLAY" : "SOURCE_ONLY",
        status: "MISSING",
        imageSpec: {
          aspectRatio: node.track === "crescent" ? "1:1" : "4:3",
          preferredStyle: node.type === "gek" ? "diagram" : "museum_photograph",
          searchQueries: queries,
          importanceScore: score,
        },
        overlaySpec: ["gek", "gem"].includes(node.type)
          ? {
              type: "annotation",
              magicDimension: magic[0] ?? "G",
              dayBSlot: node.dayB,
            }
          : null,
      });

      created++;
    } catch (err) {
      errors.push(`${node.id}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return { created, skipped, errors };
}
