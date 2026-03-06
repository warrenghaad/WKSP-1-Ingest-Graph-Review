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
  year: number; // Negative for BC/BCE
  discoveryYear: number;
  location: string;
  description: string;
  image: string;
  research: Research[];
}

import artifact1 from '@/assets/images/artifact-1.png';
import artifact2 from '@/assets/images/artifact-2.png';
import artifact3 from '@/assets/images/artifact-3.png';

export const artifacts: Artifact[] = [
  {
    id: "antikythera",
    name: "Antikythera Mechanism",
    year: -150,
    discoveryYear: 1901,
    location: "Aegean Sea",
    description: "An ancient Greek hand-powered orrery, described as the oldest known example of an analogue computer used to predict astronomical positions and eclipses.",
    image: artifact1,
    research: [
      {
        id: "r1",
        title: "Decoding the Cosmos: New X-Ray Tomography",
        author: "Dr. A. Freeth",
        date: "2006-11-30",
        summary: "Advanced imaging reveals 82 fragments with microscopic text, confirming its use as an astronomical calculating machine."
      },
      {
        id: "r2",
        title: "The Front Dial and Planetary Alignments",
        author: "Tony Freeth et al.",
        date: "2021-03-12",
        summary: "A new theoretical model reconstructing the complex gear train responsible for calculating the positions of the five classical planets."
      }
    ]
  },
  {
    id: "rosetta",
    name: "Rosetta Stone",
    year: -196,
    discoveryYear: 1799,
    location: "Rashid (Rosetta), Egypt",
    description: "A granodiorite stele inscribed with three versions of a decree issued in Memphis, Egypt. Its discovery enabled the translation of Egyptian hieroglyphs.",
    image: artifact2,
    research: [
      {
        id: "r3",
        title: "Champollion's Breakthrough",
        author: "Jean-François Champollion",
        date: "1822-09-27",
        summary: "The Lettre à M. Dacier announcing the successful decipherment of Egyptian hieroglyphs using the Greek text as a key."
      },
      {
        id: "r4",
        title: "Digital Epigraphy: 3D Scanning the Stone",
        author: "British Museum Dept. of Ancient Egypt",
        date: "2017-08-15",
        summary: "High-resolution photogrammetry capturing tool marks and surface wear not visible to the naked eye."
      }
    ]
  },
  {
    id: "voynich",
    name: "Voynich Manuscript",
    year: 1420,
    discoveryYear: 1912,
    location: "Northern Italy (origin)",
    description: "An illustrated codex hand-written in an otherwise unknown writing system. The vellum on which it is written has been carbon-dated to the early 15th century.",
    image: artifact3,
    research: [
      {
        id: "r5",
        title: "Radiocarbon Dating of the Vellum",
        author: "University of Arizona",
        date: "2011-02-10",
        summary: "Mass spectrometry tests confirm with 95% probability that the parchment dates between 1404 and 1438."
      },
      {
        id: "r6",
        title: "Statistical Analysis of 'Voynichese'",
        author: "Marcelo Montemurro",
        date: "2013-06-21",
        summary: "Information-theory metrics suggest the text possesses statistical patterns compatible with those of real natural languages."
      }
    ]
  }
];

// Sort chronologically
export const sortedArtifacts = [...artifacts].sort((a, b) => a.year - b.year);
