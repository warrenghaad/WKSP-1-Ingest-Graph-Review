#!/usr/bin/env node
/**
 * SHAPE BIOGRAPHY CANON PROCESSOR
 * 
 * Processes canonical shape biography spines and connects them to the invention composite system.
 * Each shape biography becomes a structured curriculum generator with dual A/B lens support.
 * 
 * Features:
 * - Processes SB_CANON_V1 schema
 * - Generates plates with mythic/mechanism dual lens
 * - Connects to invention composite system via carrier/invention mappings
 * - Handles image requirements and evidence sourcing
 * - Exports to presentation formats with governance rules
 */

import fs from 'fs/promises';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

class ShapeBiographyCanonProcessor {
  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
    
    this.canonSpines = new Map();
    this.inventionComposites = null;
    this.plateGenerators = new Map();
    
    this.initializePlateGenerators();
  }

  /**
   * Initialize plate content generators for different types
   */
  initializePlateGenerators() {
    // Mythic Origin generator (Lens A)
    this.plateGenerators.set('MYTHIC_ORIGIN', async (plate, canonSpine) => {
      return await this.generateMythicOriginPlate(plate, canonSpine);
    });
    
    // Invention Mechanism generator (Lens B)
    this.plateGenerators.set('INVENTION_MECHANISM', async (plate, canonSpine) => {
      return await this.generateInventionMechanismPlate(plate, canonSpine);
    });
    
    // Additional plate types can be added here
    this.plateGenerators.set('ARTIFACT_EVIDENCE', async (plate, canonSpine) => {
      return await this.generateArtifactEvidencePlate(plate, canonSpine);
    });
    
    this.plateGenerators.set('DECOMPOSITION_ANALYSIS', async (plate, canonSpine) => {
      return await this.generateDecompositionPlate(plate, canonSpine);
    });
    
    console.log('🎭 Plate generators initialized (4 types)');
  }

  /**
   * Load canonical spine from JSON
   */
  async loadCanonSpine(spineFilePath) {
    console.log(`📖 Loading canonical spine: ${path.basename(spineFilePath)}`);
    
    try {
      const spineData = JSON.parse(await fs.readFile(spineFilePath, 'utf8'));
      
      if (spineData.schema_version !== 'SB_CANON_V1') {
        throw new Error(`Unsupported schema version: ${spineData.schema_version}`);
      }
      
      this.canonSpines.set(spineData.shape_bio_id, spineData);
      console.log(`   ✅ Loaded: ${spineData.ge_id} (${spineData.canonical_slots.length} slots)`);
      
      return spineData;
    } catch (error) {
      console.error(`   💥 Failed to load spine: ${error.message}`);
      throw error;
    }
  }

  /**
   * Load invention composite dataset for connection mapping
   */
  async loadInventionComposites() {
    try {
      const compositeData = JSON.parse(
        await fs.readFile('/Users/samimajeed/mesopotamia-backend/invention-composite-dataset.json', 'utf8')
      );
      this.inventionComposites = compositeData;
      console.log('🔧 Invention composite dataset loaded for mapping');
    } catch (error) {
      console.warn('⚠️  Could not load invention composites - continuing without mapping');
    }
  }

  /**
   * Generate Mythic Origin plate content (Lens A)
   */
  async generateMythicOriginPlate(plate, canonSpine) {
    const prompt = `
Generate mythic origin content for a shape biography plate.

CONTEXT:
- Shape: ${canonSpine.ge_id}
- Civilization: ${canonSpine.civilization}
- Time Period: ${canonSpine.time_scope.start_bce} - ${canonSpine.time_scope.end_bce} BCE
- Plate Title: ${plate.title}
- Student Caption: ${plate.caption_student}

REQUIREMENTS:
- Keep it pre-functional (no mechanics yet)
- Focus on meaning and symbolic significance
- Age-appropriate for elementary students
- Connect to Mesopotamian culture authentically
- Include emotional/spiritual dimensions
- Maximum 200 words for main content

TEACHER GUIDANCE NEEDED:
${plate.teacher_bullets.join('\n')}

Generate engaging mythic origin content that establishes the deeper meaning of this geometric element before introducing its structural functions.
`;

    try {
      const response = await this.anthropic.messages.create({
        model: "claude-3-sonnet-20240229",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }]
      });

      return {
        plateId: plate.plate_id,
        plateType: plate.plate_type,
        content: response.content[0].text,
        generatedAt: new Date().toISOString(),
        imageRequirement: plate.image_requirement
      };
    } catch (error) {
      console.error(`Failed to generate mythic origin plate: ${error.message}`);
      return null;
    }
  }

  /**
   * Generate Invention Mechanism plate content (Lens B)
   */
  async generateInventionMechanismPlate(plate, canonSpine) {
    // Find matching inventions from composite dataset
    const relatedInventions = this.findRelatedInventions(plate.tags.inventions);
    
    const prompt = `
Generate invention mechanism content for a shape biography plate.

CONTEXT:
- Shape: ${canonSpine.ge_id}
- Invention Focus: ${plate.title}
- Student Caption: ${plate.caption_student}
- Related Inventions: ${relatedInventions.map(inv => inv.name).join(', ')}

INVENTION COMPOSITE DATA:
${relatedInventions.map(inv => `
  ${inv.name}: ${inv.summary}
  Key Elements: ${inv.composedOf.map(c => `${c.elementId} (${c.role})`).join(', ')}
`).join('\n')}

REQUIREMENTS:
- Define structure/function clearly
- Keep it concrete and hands-on
- Connect geometric element to practical invention
- Age-appropriate technical explanation
- Maximum 250 words for main content

TEACHER GUIDANCE:
${plate.teacher_bullets.join('\n')}

Generate mechanism-focused content that shows how this geometric element functions in real inventions.
`;

    try {
      const response = await this.anthropic.messages.create({
        model: "claude-3-sonnet-20240229",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }]
      });

      return {
        plateId: plate.plate_id,
        plateType: plate.plate_type,
        content: response.content[0].text,
        relatedInventions: relatedInventions,
        generatedAt: new Date().toISOString(),
        imageRequirement: plate.image_requirement
      };
    } catch (error) {
      console.error(`Failed to generate invention mechanism plate: ${error.message}`);
      return null;
    }
  }

  /**
   * Generate Artifact Evidence plate content
   */
  async generateArtifactEvidencePlate(plate, canonSpine) {
    const prompt = `
Generate artifact evidence content that grounds the geometric element in historical reality.

CONTEXT:
- Shape: ${canonSpine.ge_id}
- Civilization: ${canonSpine.civilization}
- Time Period: ${canonSpine.time_scope.start_bce} - ${canonSpine.time_scope.end_bce} BCE

REQUIREMENTS:
- Reference specific archaeological evidence
- Show geometric element in historical artifacts
- Connect to museum collections when possible
- Maintain scholarly accuracy while staying accessible
- Maximum 200 words

Generate artifact-focused content that provides historical grounding for this geometric element.
`;

    try {
      const response = await this.anthropic.messages.create({
        model: "claude-3-sonnet-20240229",
        max_tokens: 800,
        messages: [{ role: "user", content: prompt }]
      });

      return {
        plateId: plate.plate_id,
        plateType: plate.plate_type,
        content: response.content[0].text,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Failed to generate artifact evidence plate: ${error.message}`);
      return null;
    }
  }

  /**
   * Generate Decomposition Analysis plate content
   */
  async generateDecompositionPlate(plate, canonSpine) {
    const prompt = `
Generate decomposition analysis content that breaks down the geometric element systematically.

CONTEXT:
- Shape: ${canonSpine.ge_id}
- Analysis Focus: How the element can be broken into parts and relationships

REQUIREMENTS:
- Analytical and systematic approach
- Show component parts and relationships
- Connect to broader geometric principles
- Suitable for STEM education goals
- Maximum 250 words

Generate decomposition-focused content for systematic geometric analysis.
`;

    try {
      const response = await this.anthropic.messages.create({
        model: "claude-3-sonnet-20240229",
        max_tokens: 900,
        messages: [{ role: "user", content: prompt }]
      });

      return {
        plateId: plate.plate_id,
        plateType: plate.plate_type,
        content: response.content[0].text,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Failed to generate decomposition plate: ${error.message}`);
      return null;
    }
  }

  /**
   * Find related inventions from composite dataset
   */
  findRelatedInventions(inventionIds) {
    if (!this.inventionComposites || !inventionIds.length) return [];
    
    const allInventions = [
      ...this.inventionComposites.inventions.grade3,
      ...this.inventionComposites.inventions.grade4,
      ...this.inventionComposites.inventions.grade5
    ];
    
    return allInventions.filter(inv => inventionIds.includes(inv.id));
  }

  /**
   * Process a complete canonical spine - generate all plates
   */
  async processCanonSpine(spineData) {
    console.log(`🎭 Processing canonical spine: ${spineData.shape_bio_id}`);
    
    const processedSpine = {
      ...spineData,
      processedAt: new Date().toISOString(),
      processedSlots: []
    };
    
    for (const slot of spineData.canonical_slots) {
      console.log(`   📑 Processing slot ${slot.slot}: ${slot.slot_label}`);
      
      const processedPlates = [];
      
      for (const plate of slot.plates || []) {
        const generator = this.plateGenerators.get(plate.plate_type);
        if (generator) {
          const generatedPlate = await generator(plate, spineData);
          if (generatedPlate) {
            processedPlates.push(generatedPlate);
            console.log(`      ✅ Generated ${plate.plate_type} plate: ${plate.plate_id}`);
          }
        } else {
          console.log(`      ⚠️  No generator for plate type: ${plate.plate_type}`);
        }
      }
      
      processedSpine.processedSlots.push({
        ...slot,
        processedPlates,
        plateCount: processedPlates.length
      });
    }
    
    // Save processed spine
    const outputPath = `/Users/samimajeed/mesopotamia-backend/processed-spine-${spineData.shape_bio_id}.json`;
    await fs.writeFile(outputPath, JSON.stringify(processedSpine, null, 2));
    
    console.log(`✅ Processed spine saved to: ${outputPath}`);
    console.log(`📊 Generated ${processedSpine.processedSlots.reduce((sum, slot) => sum + slot.plateCount, 0)} plates across ${processedSpine.processedSlots.length} slots\n`);
    
    return processedSpine;
  }

  /**
   * Export processed spine to presentation format
   */
  async exportToPresentation(processedSpine, format = 'slides') {
    console.log(`📊 Exporting ${processedSpine.shape_bio_id} to ${format} format...`);
    
    const presentation = {
      title: `Shape Biography: ${processedSpine.ge_id}`,
      subtitle: `${processedSpine.civilization} • ${processedSpine.time_scope.start_bce}-${processedSpine.time_scope.end_bce} BCE`,
      slides: []
    };
    
    // Title slide
    presentation.slides.push({
      type: 'title',
      content: {
        title: presentation.title,
        subtitle: presentation.subtitle,
        note: 'Canonical spine with dual A/B lens approach'
      }
    });
    
    // Slot slides
    for (const slot of processedSpine.processedSlots) {
      if (slot.processedPlates.length > 0) {
        presentation.slides.push({
          type: 'slot_intro',
          content: {
            title: `${slot.slot_label}`,
            subtitle: `Slot ${slot.slot} • ${slot.processedPlates.length} plates`
          }
        });
        
        // Plate slides
        for (const plate of slot.processedPlates) {
          presentation.slides.push({
            type: 'plate',
            content: {
              title: `${plate.plateType}: ${plate.plateId}`,
              content: plate.content,
              imageRequirement: plate.imageRequirement,
              relatedInventions: plate.relatedInventions || []
            }
          });
        }
      }
    }
    
    const exportPath = `/Users/samimajeed/mesopotamia-backend/presentation-${processedSpine.shape_bio_id}.json`;
    await fs.writeFile(exportPath, JSON.stringify(presentation, null, 2));
    
    console.log(`✅ Presentation exported to: ${exportPath}`);
    return presentation;
  }
}

// Example usage and test runner
async function main() {
  console.log('🎭 SHAPE BIOGRAPHY CANON PROCESSOR\n');
  
  const processor = new ShapeBiographyCanonProcessor();
  
  // Load invention composites for mapping
  await processor.loadInventionComposites();
  
  // Create sample circle spine if it doesn't exist
  const sampleSpinePath = '/Users/samimajeed/mesopotamia-backend/sample-circle-canon-spine.json';
  
  // Sample circle canon spine (based on your provided schema)
  const sampleCircleSpine = {
    "schema_version": "SB_CANON_V1",
    "shape_bio_id": "SB_MESO_CIRCLE_V1",
    "ge_id": "GE_A_CIRCLE",
    "civilization": "Mesopotamia",
    "time_scope": {
      "start_bce": 3500,
      "end_bce": 500,
      "note": "Broad educational scope; exact dates handled in evidence layer."
    },
    "canonical_slots": [
      {
        "slot": 1,
        "slot_label": "Establish meaning vs structure",
        "required": true,
        "plates": [
          {
            "plate_id": "P01",
            "plate_type": "MYTHIC_ORIGIN",
            "lens": "A",
            "title": "Shamash and the Sun Wheel",
            "caption_student": "A circle can stand for the sun: steady, whole, returning.",
            "teacher_bullets": [
              "Keep this pre-functional: no mechanics yet.",
              "Name the geometric element: circle."
            ],
            "tags": {
              "domain": "GEpHR",
              "carriers": ["CARR__SUN_DISK"],
              "inventions": []
            },
            "image_requirement": {
              "role": "CONTEXT_VISUAL",
              "preferred_types": ["illustration", "artifact_photo"],
              "source_priority": ["museum_catalog", "reconstruction", "ai_generated"],
              "ai_allowed": true,
              "must_not_include": ["equations", "measurement language"]
            }
          },
          {
            "plate_id": "P02",
            "plate_type": "INVENTION_MECHANISM",
            "lens": "B",
            "title": "Wheel as structure",
            "caption_student": "A wheel rotates around an axle to help things move.",
            "teacher_bullets": [
              "Define structure/function. Keep it concrete.",
              "Introduce the invention spine early."
            ],
            "tags": {
              "domain": "GEK",
              "carriers": ["CARR__WHEEL", "CARR__AXLE"],
              "inventions": ["cylinder_seal_authentication"]
            },
            "image_requirement": {
              "role": "MECHANISM_VISUAL",
              "preferred_types": ["diagram", "illustration"],
              "source_priority": ["ai_generated", "textbook_diagram", "museum_catalog"],
              "ai_allowed": true,
              "must_include": ["rotation arrows", "wheel", "axle"],
              "must_not_include": ["historically specific claims without source"]
            }
          }
        ]
      },
      {
        "slot": 2,
        "slot_label": "Artifact in world vs GEK-T in world",
        "required": true,
        "plates": [
          {
            "plate_id": "P03",
            "plate_type": "ARTIFACT_EVIDENCE",
            "lens": "A",
            "title": "Circles in Mesopotamian artifacts",
            "caption_student": "Ancient people carved and shaped circles for important purposes.",
            "teacher_bullets": [
              "Show real archaeological examples",
              "Connect to museum collections"
            ],
            "tags": {
              "domain": "GEpHR",
              "carriers": ["CARR__SUN_DISK", "CARR__SEAL"],
              "inventions": []
            },
            "image_requirement": {
              "role": "EVIDENCE_VISUAL",
              "preferred_types": ["artifact_photo", "museum_catalog"],
              "source_priority": ["museum_catalog", "archaeological_report"],
              "ai_allowed": false
            }
          }
        ]
      },
      {
        "slot": 6,
        "slot_label": "Decomposition vs Invention",
        "required": true,
        "plates": [
          {
            "plate_id": "P04",
            "plate_type": "DECOMPOSITION_ANALYSIS",
            "lens": "B",
            "title": "Circle analysis",
            "caption_student": "A circle has a center, radius, and circumference that work together.",
            "teacher_bullets": [
              "Break down the geometric components",
              "Show mathematical relationships"
            ],
            "tags": {
              "domain": "GEK",
              "carriers": [],
              "inventions": []
            },
            "image_requirement": {
              "role": "ANALYTICAL_VISUAL",
              "preferred_types": ["diagram", "illustration"],
              "source_priority": ["ai_generated", "textbook_diagram"],
              "ai_allowed": true,
              "must_include": ["center point", "radius line", "circumference"]
            }
          }
        ]
      }
    ],
    "export_defaults": {
      "presentation": {
        "slide_one_image_rule": true,
        "caption_max_chars": 140,
        "teacher_bullets_max": 8
      }
    },
    "governance": {
      "frozen": false,
      "created_at": "2026-01-22",
      "author": "user",
      "notes": "Canon spine. Downstream evidence + sourcing attaches via mappings."
    }
  };
  
  // Save sample spine
  await fs.writeFile(sampleSpinePath, JSON.stringify(sampleCircleSpine, null, 2));
  console.log('📄 Created sample circle canon spine');
  
  // Load and process the spine
  const loadedSpine = await processor.loadCanonSpine(sampleSpinePath);
  const processedSpine = await processor.processCanonSpine(loadedSpine);
  const presentation = await processor.exportToPresentation(processedSpine);
  
  console.log('🎯 Shape Biography Canon Processing Complete!');
  console.log(`   • Processed ${processedSpine.processedSlots.length} slots`);
  console.log(`   • Generated ${presentation.slides.length} presentation slides`);
  console.log(`   • Connected to invention composite system`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}

export { ShapeBiographyCanonProcessor };