import { db } from "./db";
import {
  ontologyDimensions, ontologyGeometricElements, ontologyOperations,
  ontologyPatternTypes, ontologyMaterials, ontologyTechniques,
  ontologyArchitecturalElements, ontologyMathConcepts, ontologyCulturalContexts,
  ontologyManifestations, ontologyArchitectureTranslations, ontologyDeities,
  ontologySymbols,
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
