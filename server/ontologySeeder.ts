import { db } from "./db";
import {
  ontologyDimensions, ontologyGeometricElements, ontologyOperations,
  ontologyPatternTypes, ontologyMaterials, ontologyTechniques,
  ontologyArchitecturalElements, ontologyMathConcepts, ontologyCulturalContexts,
  ontologyManifestations, ontologyArchitectureTranslations, ontologyDeities,
  ontologySymbols, licensedImageResources,
} from "@shared/schema";
import { sql } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";

function loadOntologyData(): any {
  const assetPath = path.join(
    process.cwd(),
    "attached_assets",
    "Pasted--version-1-0-about-title-Geometric-Dimensionality-Combi_1776241354166.txt"
  );
  const raw = fs.readFileSync(assetPath, "utf-8").trim();
  const cleaned = raw.endsWith("}") ? raw : raw + "}";
  return JSON.parse(cleaned);
}

export async function seedOntology(): Promise<void> {
  try {
    let data: any;
    try {
      data = loadOntologyData();
    } catch (e) {
      console.error("[ontologySeeder] Failed to parse ontology JSON:", e);
      return;
    }

    const onto = data.ontology ?? {};
    const manifestations = data.manifestations ?? [];
    const archTranslations = data.architecture_translations ?? [];
    const mythology = data.mythology ?? {};

    await db.insert(ontologyDimensions)
      .values((onto.dimensions ?? []).map((d: any) => ({
        id: d.id, name: d.name, description: d.description ?? null,
      })))
      .onConflictDoNothing();

    await db.insert(ontologyGeometricElements)
      .values((onto.geometric_elements ?? []).map((e: any) => ({
        id: e.id, dimension: e.dimension, name: e.name,
        variants: e.variants ?? null,
      })))
      .onConflictDoNothing();

    await db.insert(ontologyOperations)
      .values((onto.operations ?? []).map((o: any) => ({
        id: o.id, name: o.name, description: o.description ?? null,
      })))
      .onConflictDoNothing();

    await db.insert(ontologyPatternTypes)
      .values((onto.pattern_types ?? []).map((p: any) => ({
        id: p.id, name: p.name,
        groups: p.groups != null ? String(p.groups) : null,
      })))
      .onConflictDoNothing();

    await db.insert(ontologyMaterials)
      .values((onto.materials ?? []).map((m: any) => ({
        id: m.id, name: m.name, classes: m.classes ?? null,
      })))
      .onConflictDoNothing();

    await db.insert(ontologyTechniques)
      .values((onto.techniques ?? []).map((t: any) => ({
        id: t.id, name: t.name,
      })))
      .onConflictDoNothing();

    await db.insert(ontologyArchitecturalElements)
      .values((onto.architectural_elements ?? []).map((a: any) => ({
        id: a.id, name: a.name,
      })))
      .onConflictDoNothing();

    await db.insert(ontologyMathConcepts)
      .values((onto.math_concepts ?? []).map((m: any) => ({
        id: m.id, name: m.name, topics: m.topics ?? null,
      })))
      .onConflictDoNothing();

    await db.insert(ontologyCulturalContexts)
      .values((onto.cultural_contexts ?? []).map((c: any) => ({
        id: c.id, name: c.name,
      })))
      .onConflictDoNothing();

    if (manifestations.length > 0) {
      await db.insert(ontologyManifestations)
        .values(manifestations.map((m: any) => ({
          id: m.id,
          title: m.title,
          dimensionMapping: m.dimension_mapping ?? null,
          elements: m.elements ?? null,
          materials: m.materials ?? null,
          techniques: m.techniques ?? null,
          culture: m.culture ?? null,
          patternType: m.pattern_type ?? null,
          mathLinks: m.math_links ?? null,
          description: m.description ?? null,
          metadata: m.number_writing_visualization ?? null,
        })))
        .onConflictDoNothing();
    }

    if (archTranslations.length > 0) {
      await db.insert(ontologyArchitectureTranslations)
        .values(archTranslations.map((a: any) => ({
          id: a.id,
          title: a.title,
          from2dPattern: a.from_2d_pattern ?? null,
          to3dElement: a.to_3d_element ?? null,
          operations: a.operations ?? null,
          benefits: a.benefits ?? null,
          mathLinks: a.math_links ?? null,
        })))
        .onConflictDoNothing();
    }

    const deities = mythology.deities ?? [];
    if (deities.length > 0) {
      await db.insert(ontologyDeities)
        .values(deities.map((d: any) => ({
          id: d.id,
          name: d.name,
          culture: d.culture ?? null,
          domains: d.domains ?? null,
          symbols: d.symbols ?? null,
          geometricAssociations: d.geometric_associations ?? null,
          stories: d.stories ?? null,
        })))
        .onConflictDoNothing();
    }

    const symbols = mythology.symbols_index ?? [];
    if (symbols.length > 0) {
      await db.insert(ontologySymbols)
        .values(symbols.map((s: any) => ({
          symbol: s.symbol,
          linkedTo: s.linked_to ?? null,
          geometric: s.geometric ?? null,
        })))
        .onConflictDoNothing();
    }

    console.log("[ontologySeeder] Ontology seeded successfully.");
  } catch (err) {
    console.error("[ontologySeeder] Seed error:", err);
  }
}

export async function seedLicensedImageResources(): Promise<void> {
  try {
    const existing = await db.select().from(licensedImageResources).limit(1);
    if (existing.length > 0) return;

    const resources = [
      { title: "Ishango Bone (20,000 BCE)", section: "1D Foundations", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/6/62/Os_d%27Ishango_IRSNB.JPG", source: "Royal Belgian Institute of Natural Sciences / Wikimedia Commons", license: "CC BY-SA 3.0", dimensionMapping: "map-1d-on-3d", geometricElements: ["geo-line"], materials: ["mat-stone"], techniques: ["tech-incision"], culture: null, description: "Dark brown baboon fibula with engraved tally marks, one of earliest mathematical tools", searchTerms: ["ishango bone", "tally marks", "prehistoric math", "baboon bone"] },
      { title: "YBC 7290 Babylonian Math Tablet", section: "1D Foundations", imageUrl: null, source: "Yale Babylonian Collection / CDLI", license: "Educational use with attribution", dimensionMapping: "map-1d-on-3d", geometricElements: ["geo-line"], materials: ["mat-clay"], techniques: ["tech-incision"], culture: "civ-meso", description: "Trapezoid area calculation tablet, Old Babylonian 1900-1600 BCE", searchTerms: ["babylonian tablet", "clay tablet", "math tablet", "cuneiform math"] },
      { title: "Giza Pyramid Complex Aerial View", section: "1D Foundations", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/af/All_Gizah_Pyramids.jpg", source: "Wikimedia Commons", license: "CC BY-SA 3.0", dimensionMapping: "map-2d-to-3d", geometricElements: ["geo-polygon", "geo-archform"], materials: ["mat-stone"], techniques: ["tech-masonry"], culture: "civ-egypt", description: "Aerial view showing triangular geometry of Giza pyramids", searchTerms: ["giza pyramids", "egyptian pyramids", "pyramid geometry"] },
      { title: "Cave Hand Stencils (Cueva de las Manos)", section: "1D Foundations", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e3/Cuevamanos1.JPG", source: "Wikimedia Commons", license: "Public Domain", dimensionMapping: "map-1d-on-2d", geometricElements: ["geo-surface"], materials: ["mat-stone"], techniques: ["tech-painting"], culture: null, description: "9,000-year-old hand stencils in Santa Cruz, Argentina", searchTerms: ["cave paintings", "hand stencils", "prehistoric art", "cueva de las manos"] },
      { title: "Greek Meander Frieze Fragment", section: "1D to 2D Patterns", imageUrl: null, source: "Metropolitan Museum of Art (Open Access)", license: "CC0 Public Domain", dimensionMapping: "map-1d-on-2d", geometricElements: ["geo-line"], materials: ["mat-stone", "mat-clay"], techniques: ["tech-carving", "tech-painting"], culture: "civ-greece", description: "Meander/key pattern frieze fragment from Coptic period", searchTerms: ["greek meander", "key pattern", "meander frieze", "greek ornament"] },
      { title: "Rosetta Stone", section: "1D to 2D Patterns", imageUrl: null, source: "British Museum / Wikimedia Commons", license: "CC BY-SA 3.0", dimensionMapping: "map-1d-on-2d", geometricElements: ["geo-line", "geo-polygon"], materials: ["mat-stone"], techniques: ["tech-incision"], culture: "civ-egypt", description: "196 BCE trilingual decree stele with hieroglyphic inscriptions", searchTerms: ["rosetta stone", "hieroglyphics", "egyptian script", "british museum"] },
      { title: "Chinese Oracle Bone Script", section: "1D to 2D Patterns", imageUrl: null, source: "Metropolitan Museum of Art (Open Access)", license: "CC0 Public Domain", dimensionMapping: "map-1d-on-2d", geometricElements: ["geo-line"], materials: ["mat-stone"], techniques: ["tech-incision"], culture: "civ-china", description: "Shang dynasty oracle bone with 4 columns of 8 characters (ca. 1600–1046 BCE)", searchTerms: ["oracle bone", "chinese script", "shang dynasty", "bronze age china"] },
      { title: "Celtic Spiral Carvings (Newgrange)", section: "1D to 2D Patterns", imageUrl: null, source: "Wikimedia Commons", license: "CC BY-SA 3.0", dimensionMapping: "map-1d-on-3d", geometricElements: ["geo-curve"], materials: ["mat-stone"], techniques: ["tech-carving"], culture: null, description: "Triple spiral entrance stone, c. 3200 BCE, older than Stonehenge", searchTerms: ["newgrange spiral", "celtic spiral", "triple spiral", "neolithic spiral"] },
      { title: "Nazca Lines Aerial Photograph", section: "1D to 2D Patterns", imageUrl: null, source: "Wikimedia Commons", license: "CC BY-SA 4.0", dimensionMapping: "map-1d-on-2d", geometricElements: ["geo-line", "geo-curve"], materials: ["mat-stone"], techniques: [], culture: "civ-meso", description: "Aerial view of Nazca lines geoglyphs, 500 BCE–500 CE", searchTerms: ["nazca lines", "geoglyphs", "peru aerial", "nazca peru"] },
      { title: "Egyptian Grid System for Proportions", section: "2D Systems", imageUrl: null, source: "Metropolitan Museum of Art (Open Access)", license: "CC0 Public Domain", dimensionMapping: "map-1d-on-2d", geometricElements: ["geo-line", "geo-polygon"], materials: ["mat-stone", "mat-papyrus"], techniques: ["tech-painting"], culture: "civ-egypt", description: "Egyptian 18-square proportion grid system from the Middle Kingdom", searchTerms: ["egyptian proportions", "canon grid", "egyptian relief grid", "proportion system"] },
      { title: "Roman Mosaic Floor Panel", section: "2D Systems", imageUrl: null, source: "Metropolitan Museum of Art (Open Access)", license: "CC0 Public Domain", dimensionMapping: "map-2d-on-2d", geometricElements: ["geo-polygon", "geo-circle"], materials: ["mat-stone", "mat-glass"], techniques: ["tech-mosaic"], culture: null, description: "Roman tessellation mosaic from Villa at Daphne near Antioch", searchTerms: ["roman mosaic", "tessellation", "ancient roman floor", "mosaic pattern"] },
      { title: "Alhambra Islamic Geometric Patterns", section: "2D Systems", imageUrl: null, source: "Wikimedia Commons", license: "CC0 Public Domain", dimensionMapping: "map-2d-on-2d", geometricElements: ["geo-polygon", "geo-circle", "geo-curvearea"], materials: ["mat-stone", "mat-clay"], techniques: ["tech-tiling", "tech-mosaic"], culture: "civ-islam", description: "Geometric star/rosette patterns from the Alhambra palace, Sala del Mexuar", searchTerms: ["alhambra patterns", "islamic geometry", "moorish patterns", "geometric tiles"] },
      { title: "Parthenon Showing Golden Ratio", section: "2D Systems", imageUrl: null, source: "Wikimedia Commons", license: "CC BY-SA 3.0", dimensionMapping: "map-3d-objects", geometricElements: ["geo-archform", "geo-polygon"], materials: ["mat-stone"], techniques: ["tech-masonry"], culture: "civ-greece", description: "West facade of Parthenon demonstrating golden ratio proportions", searchTerms: ["parthenon proportions", "golden ratio architecture", "greek temple", "classical architecture"] },
      { title: "Stonehenge Megaliths", section: "3D Linear", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/3c/Stonehenge%2C_Condado_de_Wiltshire%2C_Inglaterra%2C_2014-08-12%2C_DD_18.JPG", source: "Wikimedia Commons", license: "CC BY-SA 4.0", dimensionMapping: "map-3d-objects", geometricElements: ["geo-archform", "geo-cylinder"], materials: ["mat-stone"], techniques: ["tech-masonry"], culture: null, description: "Megalithic stone circle monument showing post-and-lintel 3D construction", searchTerms: ["stonehenge", "megaliths", "stone circle", "neolithic monument"] },
      { title: "Greek Columns (Parthenon Doric)", section: "3D Linear", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/86/Sideview_of_the_Parthenon_from_the_West_Facade_on_March_5%2C_2020.jpg", source: "Wikimedia Commons", license: "Creative Commons", dimensionMapping: "map-2d-to-3d", geometricElements: ["geo-cylinder", "geo-archform"], materials: ["mat-stone"], techniques: ["tech-carving", "tech-masonry"], culture: "civ-greece", description: "Doric columns of the Parthenon showing revolution of 2D profile to 3D cylinder", searchTerms: ["doric columns", "greek columns", "parthenon columns", "classical columns"] },
      { title: "Gothic Flying Buttresses (Notre Dame)", section: "3D Linear", imageUrl: null, source: "Wikimedia Commons", license: "CC BY-SA 2.0", dimensionMapping: "map-2d-to-3d", geometricElements: ["geo-archform"], materials: ["mat-stone"], techniques: ["tech-masonry"], culture: "civ-medieval-eu", description: "Flying buttresses of Notre Dame channeling structural loads through arched stone", searchTerms: ["flying buttresses", "notre dame", "gothic architecture", "medieval engineering"] },
      { title: "Eiffel Tower Iron Framework Plans", section: "3D Linear", imageUrl: null, source: "Gallica-BNF (Public Domain)", license: "Public Domain", dimensionMapping: "map-2d-to-3d", geometricElements: ["geo-archform", "geo-line"], materials: ["mat-metal"], techniques: ["tech-casting", "tech-masonry"], culture: null, description: "Historical construction plans and phase photos of Eiffel Tower iron framework (1888-89)", searchTerms: ["eiffel tower plans", "iron framework", "lattice structure", "steel construction"] },
      { title: "Greek Painted Pottery (Red-Figure Amphora)", section: "2D on 3D Surfaces", imageUrl: null, source: "Metropolitan Museum of Art (Open Access)", license: "CC0 Public Domain", dimensionMapping: "map-2d-on-3d", geometricElements: ["geo-polygon", "geo-circle", "geo-curvearea"], materials: ["mat-clay"], techniques: ["tech-painting"], culture: "civ-greece", description: "Red-figure amphora by the Berlin Painter, ca. 490 BCE — 2D figural scenes on 3D vessel", searchTerms: ["greek pottery", "red figure amphora", "attic pottery", "ancient greek vase"] },
      { title: "Islamic Dome Decorations (Ottoman Mosque)", section: "2D on 3D Surfaces", imageUrl: null, source: "Wikimedia Commons", license: "CC BY-SA", dimensionMapping: "map-2d-on-3d", geometricElements: ["geo-circle", "geo-polygon", "geo-sphere"], materials: ["mat-stone", "mat-glass"], techniques: ["tech-tiling", "tech-painting"], culture: "civ-islam", description: "2D geometric patterns applied to the curved interior surfaces of Islamic domes", searchTerms: ["islamic dome", "mosque dome", "muqarnas", "islamic ceiling"] },
      { title: "Ming Dynasty Blue and White Porcelain", section: "2D on 3D Surfaces", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/5/55/Ming_Dynasty_porcelain_vase%2C_Wanli_Reign_Period_%282%29.JPG", source: "Wikimedia Commons", license: "CC BY-SA 4.0", dimensionMapping: "map-2d-on-3d", geometricElements: ["geo-curvearea", "geo-circle"], materials: ["mat-clay", "mat-glass"], techniques: ["tech-painting"], culture: "civ-china", description: "Ming Dynasty porcelain vase with blue-and-white floral patterns on curved ceramic surface", searchTerms: ["ming dynasty porcelain", "blue white vase", "chinese porcelain", "ceramic painting"] },
      { title: "Ndebele Beadwork Apron", section: "2D on 3D Surfaces", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d4/Liphotu_apron%2C_Ndebele%2C_South_Africa%2C_20th_century_-_Royal_Ontario_Museum_-_DSC09561.JPG", source: "Royal Ontario Museum", license: "CC0 Public Domain", dimensionMapping: "map-2d-on-3d", geometricElements: ["geo-polygon", "geo-line"], materials: ["mat-glass", "mat-textile"], techniques: ["tech-weaving", "tech-embroidery"], culture: null, description: "Ndebele geometric beadwork apron with rectilinear patterns on wearable surface", searchTerms: ["ndebele beadwork", "african geometric", "beadwork patterns", "south african crafts"] },
      { title: "Egyptian Pyramids at Giza (Full 3D)", section: "Full 3D Systems", imageUrl: null, source: "Wikimedia Commons", license: "CC0", dimensionMapping: "map-2d-to-3d", geometricElements: ["geo-polyhedron", "geo-polygon"], materials: ["mat-stone"], techniques: ["tech-masonry"], culture: "civ-egypt", description: "Full 3D pyramid forms — 2D triangular profiles extruded into massive limestone volumes", searchTerms: ["great pyramid", "khufu pyramid", "giza necropolis", "pyramid construction"] },
      { title: "Roman Pantheon Dome Interior", section: "Full 3D Systems", imageUrl: null, source: "National Gallery of Art (Public Domain)", license: "Public Domain", dimensionMapping: "map-2d-to-3d", geometricElements: ["geo-sphere", "geo-archform"], materials: ["mat-stone"], techniques: ["tech-masonry"], culture: null, description: "Coffered concrete dome with oculus, 43.3m diameter — revolution of 2D circle to 3D hemisphere", searchTerms: ["pantheon dome", "roman dome", "pantheon interior", "roman architecture"] },
      { title: "Florence Cathedral Dome (Brunelleschi)", section: "Full 3D Systems", imageUrl: null, source: "Wikimedia Commons", license: "CC BY-SA 4.0", dimensionMapping: "map-2d-to-3d", geometricElements: ["geo-sphere", "geo-archform"], materials: ["mat-stone", "mat-wood"], techniques: ["tech-masonry"], culture: "civ-renaissance", description: "Brunelleschi's double-shell dome — Renaissance engineering of 3D form from 2D octagonal plan", searchTerms: ["brunelleschi dome", "florence cathedral dome", "duomo florence", "renaissance dome"] },
      { title: "Sagrada Familia (Gaudí Architecture)", section: "Full 3D Systems", imageUrl: null, source: "Wikimedia Commons", license: "CC BY-SA 4.0", dimensionMapping: "map-2d-to-3d", geometricElements: ["geo-archform", "geo-curve", "geo-cylinder"], materials: ["mat-stone"], techniques: ["tech-carving", "tech-masonry"], culture: null, description: "Gaudí's parametric catenary arches and tree-like columns — computational 3D geometry", searchTerms: ["sagrada familia", "gaudi architecture", "parametric architecture", "barcelona cathedral"] },
    ];

    await db.insert(licensedImageResources).values(resources).onConflictDoNothing();
    console.log(`[ontologySeeder] Seeded ${resources.length} licensed image resources.`);
  } catch (err) {
    console.error("[ontologySeeder] Licensed resource seed error:", err);
  }
}
