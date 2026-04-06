import { storage } from "./storage";
import type { InsertBraidPoint } from "@shared/schema";

// MAGIC scores derived from artifact type, track, description keywords, and dayB classification.
// M = Math: mathematical formalization, proofs, calculation
// A = Art: aesthetic, visual rhetoric, decorative significance
// G = Geometric thinking: spatial reasoning, geometric form analysis
// I = Ideology: institutional, religious, political embedding
// C = Comptroller: economic, administrative, accounting control
// All values 0.0–1.0

export const INITIAL_BRAID_POINTS: InsertBraidPoint[] = [
  // ── Circle track ────────────────────────────────────────────────────────────
  {
    name: "Halaf painted circles",
    year: -6200,
    math: 0.20, art: 0.70, geometry: 0.60, ideology: 0.20, comptroller: 0.05,
    description: "Concentric circles, petal-doubling (4→8→16→32→64) on pottery bowls. BM 1934,0210.11, Arpachiyah. Earliest systematic circle division.",
    source: "TIMELINE_NODES / circle track",
  },
  {
    name: "Samarra Plate",
    year: -5800,
    math: 0.30, art: 0.80, geometry: 0.65, ideology: 0.30, comptroller: 0.10,
    description: "VA 13400, Berlin. 8 fish in rotational composition, ~120 rim lines. Dynamic circular design with possible base-6 awareness.",
    source: "TIMELINE_NODES / circle track",
  },
  {
    name: "Slow potter's wheel (tournette)",
    year: -4500,
    math: 0.25, art: 0.25, geometry: 0.70, ideology: 0.35, comptroller: 0.50,
    description: "Rotating platform for shaping clay. Prerequisites: circular disc, axis of rotation, intuitive centrifugal understanding.",
    source: "TIMELINE_NODES / circle track",
  },
  {
    name: "Fast potter's wheel",
    year: -3500,
    math: 0.35, art: 0.25, geometry: 0.70, ideology: 0.55, comptroller: 0.75,
    description: "True wheel at Ur and Uruk. Oldest surviving wheel ~3129 BCE. Enables mass production of uniform round vessels.",
    source: "TIMELINE_NODES / circle track",
  },
  {
    name: "Wheeled cart pictograph",
    year: -3490,
    math: 0.25, art: 0.20, geometry: 0.65, ideology: 0.45, comptroller: 0.65,
    description: "Eanna district, Uruk. Earliest depiction of wheel used for transport. Circle property: circumference = predictable rolling distance.",
    source: "TIMELINE_NODES / circle track",
  },
  {
    name: "Standard of Ur — wheeled wagons",
    year: -2600,
    math: 0.25, art: 0.55, geometry: 0.50, ideology: 0.75, comptroller: 0.65,
    description: "BM 121201. Four-wheeled battle wagons with solid disc wheels made of joined wooden pieces. Circle in military/trade technology.",
    source: "TIMELINE_NODES / circle track",
  },
  {
    name: "π ≈ 3.125 (Susa tablet)",
    year: -1800,
    math: 0.90, art: 0.15, geometry: 0.85, ideology: 0.35, comptroller: 0.25,
    description: "Louvre, TMS series. Best pre-Archimedean approximation. Circumscribed circle calculations.",
    source: "TIMELINE_NODES / circle track",
  },
  {
    name: "360° circle division formalized",
    year: -700,
    math: 0.80, art: 0.20, geometry: 0.90, ideology: 0.60, comptroller: 0.55,
    description: "Ecliptic divided into 12 × 30° = 360°. Direct link: 360 days ≈ 1 year, base-60 system.",
    source: "TIMELINE_NODES / circle track",
  },
  {
    name: "Jupiter trapezoid tablets",
    year: -350,
    math: 0.90, art: 0.15, geometry: 0.90, ideology: 0.45, comptroller: 0.25,
    description: "BM 40054. Displacement as area under velocity-time curve. Proto-calculus.",
    source: "TIMELINE_NODES / circle track",
  },

  // ── Crescent track ──────────────────────────────────────────────────────────
  {
    name: "Crescent on Early Dynastic seals",
    year: -2900,
    math: 0.10, art: 0.75, geometry: 0.30, ideology: 0.85, comptroller: 0.30,
    description: "First distinct crescent symbol. Recumbent orientation matching new moon. Nanna/Sin emblem.",
    source: "TIMELINE_NODES / crescent track",
  },
  {
    name: "Seal of Ḫašḫamer",
    year: -2100,
    math: 0.10, art: 0.65, geometry: 0.30, ideology: 0.90, comptroller: 0.40,
    description: "British Museum, Ur III period. Famous Sin/crescent seal. Crescent as institutional emblem of moon god cult.",
    source: "TIMELINE_NODES / crescent track",
  },
  {
    name: "Lunar calendar standardized",
    year: -3000,
    math: 0.55, art: 0.35, geometry: 0.60, ideology: 0.70, comptroller: 0.55,
    description: "12 months × ~30 days. Month begins at first crescent sighting. 360-day ideal year = 360° circle.",
    source: "TIMELINE_NODES / crescent track",
  },
  {
    name: "Bronze sickle tools",
    year: -3300,
    math: 0.15, art: 0.25, geometry: 0.60, ideology: 0.20, comptroller: 0.55,
    description: "Curved cutting edge. Genuine crescent geometry: arc distributes force along sweeping path.",
    source: "TIMELINE_NODES / crescent track",
  },
  {
    name: "Kudurru of Meli-Shipak II",
    year: -1186,
    math: 0.20, art: 0.80, geometry: 0.50, ideology: 0.85, comptroller: 0.60,
    description: "Louvre Sb 22. Canonical triad: 8-star + crescent + solar disc. All three lesson elements together.",
    source: "TIMELINE_NODES / crescent track",
  },
  {
    name: "MUL.APIN compendium",
    year: -1000,
    math: 0.75, art: 0.25, geometry: 0.75, ideology: 0.70, comptroller: 0.40,
    description: "66 stars catalogued, zigzag daylight functions, proto-zodiac. Lunar observation systematized.",
    source: "TIMELINE_NODES / crescent track",
  },
  {
    name: "Saros eclipse cycle",
    year: -600,
    math: 0.85, art: 0.15, geometry: 0.80, ideology: 0.60, comptroller: 0.25,
    description: "223 synodic months. Predicting lunar eclipses from accumulated observation.",
    source: "TIMELINE_NODES / crescent track",
  },

  // ── Star (8-Star) track ─────────────────────────────────────────────────────
  {
    name: "4-petal rosettes on Halaf seals",
    year: -6100,
    math: 0.20, art: 0.70, geometry: 0.55, ideology: 0.30, comptroller: 0.10,
    description: "Arpachiyah, Domuztepe stamp seals. Circle + 4-fold radial symmetry. GEM precursor to 8-star.",
    source: "TIMELINE_NODES / star track",
  },
  {
    name: "Rosettes on Jemdet Nasr pottery",
    year: -3100,
    math: 0.25, art: 0.80, geometry: 0.60, ideology: 0.50, comptroller: 0.30,
    description: "8-petaled rosettes on pottery and temple objects. Sacred decoration encoding 8-fold division.",
    source: "TIMELINE_NODES / star track",
  },
  {
    name: "8-pointed star on Early Dynastic seals",
    year: -2900,
    math: 0.20, art: 0.75, geometry: 0.65, ideology: 0.75, comptroller: 0.50,
    description: "Ishtar/Inanna association begins. Initially general celestial symbol, becomes Venus-specific.",
    source: "TIMELINE_NODES / star track",
  },
  {
    name: "Cylinder seal recognition geometry",
    year: -2500,
    math: 0.30, art: 0.65, geometry: 0.70, ideology: 0.70, comptroller: 0.70,
    description: "8-pointed star on thousands of seals. 8-fold rotational symmetry = readable while rolling at any angle.",
    source: "TIMELINE_NODES / star track",
  },
  {
    name: "Assyrian palace rosettes",
    year: -1200,
    math: 0.25, art: 0.70, geometry: 0.60, ideology: 0.80, comptroller: 0.65,
    description: "Nimrud/Nineveh. Carved stone 8-fold rosettes. Octagon+square tessellation for floor coverage.",
    source: "TIMELINE_NODES / star track",
  },
  {
    name: "Star catalogs (8-sector sky)",
    year: -1195,
    math: 0.70, art: 0.25, geometry: 0.80, ideology: 0.65, comptroller: 0.40,
    description: "Babylonian astronomers divide sky into 8 sections (45° each). 8→16→32 subdivision for precision.",
    source: "TIMELINE_NODES / star track",
  },
  {
    name: "Uruk compass card",
    year: -300,
    math: 0.55, art: 0.35, geometry: 0.75, ideology: 0.60, comptroller: 0.70,
    description: "Cuneiform tablet determining 'place of rising of winds.' 8 directional divisions. Compass rose precursor.",
    source: "TIMELINE_NODES / star track",
  },

  // ── Triangle track ──────────────────────────────────────────────────────────
  {
    name: "Triangles on Hassuna pottery",
    year: -6000,
    math: 0.10, art: 0.70, geometry: 0.45, ideology: 0.20, comptroller: 0.10,
    description: "Tell Hassuna. Lines, triangles, cross-hatching in red paint. Among earliest decorative motifs.",
    source: "TIMELINE_NODES / triangle track",
  },
  {
    name: "Flint/obsidian arrowheads",
    year: -10000,
    math: 0.10, art: 0.15, geometry: 0.50, ideology: 0.10, comptroller: 0.30,
    description: "Triangular tool shapes predate ceramics. Functional triangle: cutting edge, penetration geometry.",
    source: "TIMELINE_NODES / triangle track",
  },
  {
    name: "Buttressed walls at Sawwan",
    year: -5500,
    math: 0.20, art: 0.30, geometry: 0.65, ideology: 0.50, comptroller: 0.40,
    description: "Tell es-Sawwan. Earliest buttress-and-recess construction. Triangular bracing principle.",
    source: "TIMELINE_NODES / triangle track",
  },
  {
    name: "Eridu temple buttresses",
    year: -5400,
    math: 0.20, art: 0.40, geometry: 0.65, ideology: 0.65, comptroller: 0.30,
    description: "Level XVI. Buttress-and-recess decoration becomes standard on temple façades.",
    source: "TIMELINE_NODES / triangle track",
  },
  {
    name: "Three-legged stools/tripods",
    year: -4000,
    math: 0.15, art: 0.25, geometry: 0.55, ideology: 0.30, comptroller: 0.40,
    description: "Bronze tripod stands at virtually every Mesopotamian site. 3 points define a plane.",
    source: "TIMELINE_NODES / triangle track",
  },
  {
    name: "Royal Tombs of Ur — true arches",
    year: -2600,
    math: 0.40, art: 0.45, geometry: 0.70, ideology: 0.65, comptroller: 0.50,
    description: "Ur, PG 800. Woolley documented true arches. Triangulation of forces in vault construction.",
    source: "TIMELINE_NODES / triangle track",
  },
  {
    name: "Ziggurat of Ur — buttress system",
    year: -2100,
    math: 0.40, art: 0.55, geometry: 0.80, ideology: 0.90, comptroller: 0.70,
    description: "Ur-Nammu. Systematic triangular buttresses every 3-5m. Enabled 30m height. ~720,000 bricks.",
    source: "TIMELINE_NODES / triangle track",
  },
  {
    name: "Plimpton 322",
    year: -1800,
    math: 0.90, art: 0.15, geometry: 0.90, ideology: 0.35, comptroller: 0.25,
    description: "Columbia University. 15 Pythagorean triples in sexagesimal. Systematic knowledge of triangle side relationships.",
    source: "TIMELINE_NODES / triangle track",
  },
  {
    name: "YBC 7289 — √2 to 6 decimals",
    year: -1799,
    math: 0.90, art: 0.20, geometry: 0.90, ideology: 0.35, comptroller: 0.20,
    description: "Yale. Square with diagonals. √2 = 1.414213... Greatest ancient computational accuracy.",
    source: "TIMELINE_NODES / triangle track",
  },
  {
    name: "Si.427 — oldest applied geometry",
    year: -1900,
    math: 0.80, art: 0.15, geometry: 0.80, ideology: 0.50, comptroller: 0.55,
    description: "Istanbul Museum. Land survey using Pythagorean triples (3-4-5) for right-angle boundaries.",
    source: "TIMELINE_NODES / triangle track",
  },

  // ── Square track ─────────────────────────────────────────────────────────────
  {
    name: "Rectangular architecture begins",
    year: -7000,
    math: 0.10, art: 0.25, geometry: 0.50, ideology: 0.50, comptroller: 0.30,
    description: "Upper Mesopotamia. Rectilinear buildings 1000 yrs before Halaf circular tholoi.",
    source: "TIMELINE_NODES / square track",
  },
  {
    name: "Hassuna adobe dwellings",
    year: -5990,
    math: 0.10, art: 0.35, geometry: 0.40, ideology: 0.45, comptroller: 0.30,
    description: "Tell Hassuna. Adobe houses around open central courts. Standardized rectangular plans.",
    source: "TIMELINE_NODES / square track",
  },
  {
    name: "Checkerboard grid — Arpachiyah",
    year: -5300,
    math: 0.30, art: 0.70, geometry: 0.60, ideology: 0.30, comptroller: 0.20,
    description: "Burnt House plate A 751(B). Centered checkered field of equidistant staggered squares.",
    source: "TIMELINE_NODES / square track",
  },
  {
    name: "Standardized mud bricks",
    year: -5000,
    math: 0.20, art: 0.10, geometry: 0.50, ideology: 0.60, comptroller: 0.75,
    description: "Mould-made bricks of standard size. By Late Uruk: Riemchen bricks at 1:1:2 ratio.",
    source: "TIMELINE_NODES / square track",
  },
  {
    name: "Cuneiform — geometric abstraction",
    year: -3400,
    math: 0.50, art: 0.50, geometry: 0.70, ideology: 0.80, comptroller: 0.75,
    description: "Evolution from curved pictographs to 5 straight wedge elements. Triangular stylus impression.",
    source: "TIMELINE_NODES / square track",
  },
  {
    name: "Sexagesimal system matures",
    year: -2700,
    math: 0.85, art: 0.15, geometry: 0.80, ideology: 0.60, comptroller: 0.85,
    description: "Base-60. 360 = 6×60. Smallest number divisible by 1-6. Enables fractional division for trade.",
    source: "TIMELINE_NODES / square track",
  },
  {
    name: "Nippur cubit rod",
    year: -2650,
    math: 0.65, art: 0.20, geometry: 0.70, ideology: 0.70, comptroller: 0.85,
    description: "Istanbul Museum. World's oldest ruler. Sumerian cubit ~518.5mm with graduated subdivisions.",
    source: "TIMELINE_NODES / square track",
  },
  {
    name: "BM 15285 — 41 area problems",
    year: -1801,
    math: 0.80, art: 0.35, geometry: 0.90, ideology: 0.40, comptroller: 0.30,
    description: "British Museum. Circles in squares, composite figures. Systematic geometric problem-solving.",
    source: "TIMELINE_NODES / square track",
  },
];

export async function seedBraidPoints(): Promise<{ created: number; skipped: boolean }> {
  const count = await storage.countBraidPoints();
  if (count > 0) {
    return { created: 0, skipped: true };
  }
  let created = 0;
  for (const point of INITIAL_BRAID_POINTS) {
    await storage.createBraidPoint(point);
    created++;
  }
  return { created, skipped: false };
}
