import type { MAGICVector } from "./magicFramework";

export interface Civilization {
  id: string;
  name: string;
  shortName: string;
  color: string;
  startYear: number;
  endYear: number;
  magicProfile: MAGICVector;
  interactions: CivInteraction[];
}

export interface CivInteraction {
  targetCivId: string;
  type: "war" | "trade" | "cultural" | "conquest";
  year: number;
  description: string;
  intensity: number;
}

export const CIVILIZATIONS: Civilization[] = [
  {
    id: "sumer",
    name: "Sumerian",
    shortName: "SUM",
    color: "#eab308",
    startYear: -4500,
    endYear: -1900,
    magicProfile: { M: 0.7, A: 0.8, G: 0.9, I: 0.9, C: 0.6 },
    interactions: [
      { targetCivId: "akkad", type: "conquest", year: -2334, description: "Sargon unifies Sumer under Akkadian rule", intensity: 0.9 },
      { targetCivId: "elam", type: "war", year: -2004, description: "Elamite destruction of Ur III", intensity: 0.8 },
      { targetCivId: "elam", type: "trade", year: -3000, description: "Proto-Elamite trade networks", intensity: 0.5 },
    ],
  },
  {
    id: "akkad",
    name: "Akkadian",
    shortName: "AKK",
    color: "#ef4444",
    startYear: -2334,
    endYear: -2154,
    magicProfile: { M: 0.5, A: 0.7, G: 0.8, I: 0.7, C: 0.9 },
    interactions: [
      { targetCivId: "sumer", type: "conquest", year: -2334, description: "Sargon conquers Sumerian city-states", intensity: 0.9 },
      { targetCivId: "elam", type: "war", year: -2280, description: "Akkadian campaigns into Elam", intensity: 0.7 },
      { targetCivId: "egypt", type: "trade", year: -2300, description: "Diplomatic exchange and trade", intensity: 0.4 },
    ],
  },
  {
    id: "babylon",
    name: "Babylonian",
    shortName: "BAB",
    color: "#3b82f6",
    startYear: -1894,
    endYear: -539,
    magicProfile: { M: 0.9, A: 0.7, G: 0.8, I: 0.8, C: 0.8 },
    interactions: [
      { targetCivId: "assyria", type: "war", year: -1225, description: "Tukulti-Ninurta sacks Babylon", intensity: 0.8 },
      { targetCivId: "assyria", type: "cultural", year: -700, description: "Babylonian culture absorbed by Assyria", intensity: 0.6 },
      { targetCivId: "persia", type: "conquest", year: -539, description: "Cyrus conquers Babylon", intensity: 0.9 },
      { targetCivId: "egypt", type: "war", year: -605, description: "Battle of Carchemish", intensity: 0.7 },
    ],
  },
  {
    id: "assyria",
    name: "Assyrian",
    shortName: "ASS",
    color: "#a855f7",
    startYear: -2500,
    endYear: -609,
    magicProfile: { M: 0.6, A: 0.6, G: 0.7, I: 0.7, C: 0.95 },
    interactions: [
      { targetCivId: "babylon", type: "war", year: -1225, description: "Assyrian sack of Babylon", intensity: 0.8 },
      { targetCivId: "babylon", type: "cultural", year: -700, description: "Assyrian absorption of Babylonian learning", intensity: 0.6 },
      { targetCivId: "egypt", type: "conquest", year: -671, description: "Esarhaddon invades Egypt", intensity: 0.9 },
      { targetCivId: "elam", type: "war", year: -647, description: "Ashurbanipal destroys Susa", intensity: 0.9 },
    ],
  },
  {
    id: "elam",
    name: "Elamite",
    shortName: "ELM",
    color: "#22c55e",
    startYear: -3200,
    endYear: -539,
    magicProfile: { M: 0.5, A: 0.7, G: 0.6, I: 0.8, C: 0.7 },
    interactions: [
      { targetCivId: "sumer", type: "war", year: -2004, description: "Elamites destroy Ur III dynasty", intensity: 0.8 },
      { targetCivId: "babylon", type: "war", year: -1160, description: "Shutruk-Nahhunte raids Babylon, takes Hammurabi stele", intensity: 0.8 },
      { targetCivId: "assyria", type: "war", year: -647, description: "Ashurbanipal destroys Susa", intensity: 0.9 },
    ],
  },
  {
    id: "egypt",
    name: "Egyptian",
    shortName: "EGY",
    color: "#f97316",
    startYear: -3100,
    endYear: -332,
    magicProfile: { M: 0.7, A: 0.9, G: 0.9, I: 0.95, C: 0.8 },
    interactions: [
      { targetCivId: "akkad", type: "trade", year: -2300, description: "Diplomatic gifts and trade routes", intensity: 0.4 },
      { targetCivId: "assyria", type: "war", year: -671, description: "Assyrian invasion of Egypt", intensity: 0.9 },
      { targetCivId: "babylon", type: "war", year: -605, description: "Babylon defeats Egypt at Carchemish", intensity: 0.7 },
      { targetCivId: "persia", type: "conquest", year: -525, description: "Cambyses conquers Egypt", intensity: 0.9 },
    ],
  },
  {
    id: "persia",
    name: "Persian (Achaemenid)",
    shortName: "PER",
    color: "#06b6d4",
    startYear: -550,
    endYear: -331,
    magicProfile: { M: 0.6, A: 0.7, G: 0.7, I: 0.7, C: 0.95 },
    interactions: [
      { targetCivId: "babylon", type: "conquest", year: -539, description: "Cyrus conquers Babylon", intensity: 0.9 },
      { targetCivId: "egypt", type: "conquest", year: -525, description: "Cambyses conquers Egypt", intensity: 0.9 },
    ],
  },
];

export const BRAID_LEVELS = [
  { depth: 0.0, label: "Surface", description: "Present — accumulated G(t)" },
  { depth: 0.25, label: "Layer 1", description: "Neo-Babylonian / Neo-Assyrian interactions" },
  { depth: 0.5, label: "Layer 2", description: "Old Babylonian / Kassite period" },
  { depth: 0.75, label: "Layer 3", description: "Akkadian / Ur III convergence" },
  { depth: 1.0, label: "Core", description: "Ubaid / Uruk origins — deepest time" },
];

export function yearToDepth(year: number): number {
  const earliest = -5000;
  const latest = -300;
  return Math.max(0, Math.min(1, (year - latest) / (earliest - latest)));
}

export function depthToYear(depth: number): number {
  const earliest = -5000;
  const latest = -300;
  return latest + depth * (earliest - latest);
}
