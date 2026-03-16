/**
 * MUSEUM-GRADE IMAGE GENERATOR
 *
 * Generates high-quality educational diagrams for geometric elements
 * using DALL-E 3 with museum-quality prompts
 *
 * NO ICONS - Only professional educational illustrations
 */

import {
    MASTER_REGISTRY,
    getElementsForImageGeneration,
    getLessonElementMapping,
    getElementsByPeriod,
    getElementsByDeity,
    getDecompositionChain
} from './complete-element-registry.js';

import { MESOPOTAMIAN_PERIODS } from './expanded-tagging-ontology.js';
import { generateImageDALLE } from './ai-image-services.js';
import fs from 'fs/promises';
import path from 'path';

// ==========================================
// PROMPT TEMPLATES FOR MUSEUM-GRADE IMAGES
// ==========================================

class PromptBuilder {
    /**
     * Build high-quality educational diagram prompt
     */
    static buildEducationalDiagram(element, options = {}) {
        const {
            tier,
            dimension,
            deity,
            metaphor,
            period,
            culturalContext,
            showLabels = true,
            showDecomposition = false,
            style = 'textbook'
        } = options;

        let prompt = `Create a professional educational diagram of a geometric ${element.name}. `;

        // Base geometric description
        if (element.definition) {
            prompt += `${element.definition}. `;
        }

        // Visual style specification
        prompt += this.getStyleSpecification(style, tier);

        // Dimensional requirements
        if (dimension) {
            prompt += this.getDimensionalRequirements(dimension);
        }

        // Add mathematical properties
        if (element.type === 'mathematical' || tier === 'conceptual') {
            prompt += `Include clear mathematical properties: `;
            if (element.geometric_expression) {
                prompt += `${element.geometric_expression}. `;
            }
        }

        // Add decomposition if requested
        if (showDecomposition && element.atomic) {
            prompt += `Show how this is composed from: ${element.atomic.join(', ')}. `;
        }

        // Labels
        if (showLabels) {
            prompt += `Add clear, legible labels pointing to key features. `;
        }

        // Cultural context for Mesopotamian elements
        if (culturalContext && deity) {
            prompt += this.getCulturalContext(deity, metaphor, period);
        }

        // Quality specifications
        prompt += `High contrast, clean lines, suitable for grades 3-5 educational materials. `;
        prompt += `White or light neutral background. Professional textbook quality. `;
        prompt += `No cartoons, no clip art, no simplified icons. `;

        return prompt;
    }

    /**
     * Build museum artifact illustration prompt
     */
    static buildArtifactIllustration(element, options = {}) {
        const {
            period,
            deity,
            artifactType,
            material = 'stone',
            context = 'ceremonial'
        } = options;

        const periodData = MESOPOTAMIAN_PERIODS[period];
        const yearRange = periodData?.years || 'ancient';

        let prompt = `Create a detailed archaeological illustration of a ${element.name} design `;
        prompt += `from ${period} period Mesopotamia (${yearRange}). `;

        // Artifact type
        if (artifactType === 'cylinder_seal') {
            prompt += `Shown as carved into a cylinder seal, with the pattern rolled out flat. `;
        } else if (artifactType === 'relief') {
            prompt += `Shown as carved stone relief with visible chisel marks and weathering. `;
        } else if (artifactType === 'tablet') {
            prompt += `Shown as impressed into clay tablet. `;
        } else if (artifactType === 'jewelry') {
            prompt += `Shown as intricate metalwork jewelry design. `;
        } else if (artifactType === 'architectural') {
            prompt += `Shown as architectural element with brick or stone texture. `;
        }

        // Material texture
        prompt += `${material} material with authentic period texture and patina. `;

        // Deity association
        if (deity) {
            const deityContext = this.getDeitySymbolism(deity);
            prompt += `Associated with ${deity} deity: ${deityContext}. `;
        }

        // Museum documentation style
        prompt += `Museum documentation photography style: well-lit, neutral background, `;
        prompt += `clear detail visible, professional archaeological illustration quality. `;
        prompt += `Include subtle scale reference. `;

        return prompt;
    }

    /**
     * Build architectural diagram prompt
     */
    static buildArchitecturalDiagram(element, options = {}) {
        const {
            viewType = 'plan', // plan, elevation, section, isometric
            period,
            status = 'elite', // elite, common, sacred
            showDimensions = true,
            showProportions = true
        } = options;

        let prompt = `Create a professional architectural ${viewType} drawing of ${element.name}. `;

        // View-specific requirements
        if (viewType === 'plan') {
            prompt += `Top-down floor plan view with walls shown in solid black, `;
            prompt += `rooms clearly delineated, entrance marked. `;
        } else if (viewType === 'elevation') {
            prompt += `Front elevation view showing vertical proportions, `;
            prompt += `architectural details, material indications. `;
        } else if (viewType === 'section') {
            prompt += `Section cut showing interior spaces, wall thickness, `;
            prompt += `floor levels, structural elements. `;
        } else if (viewType === 'isometric') {
            prompt += `Isometric 3D view showing spatial relationships, `;
            prompt += `volumetric form, construction logic. `;
        }

        // Period-specific details
        if (period) {
            const periodData = MESOPOTAMIAN_PERIODS[period];
            prompt += `Authentic ${period} period (${periodData.years}) construction: `;
            prompt += `mud brick walls, flat roofs, interior courtyards. `;
        }

        // Status differentiation
        if (status === 'elite') {
            prompt += `Elite residence with large courtyard, multiple rooms, `;
            prompt += `decorated entrance, storage areas. `;
        } else if (status === 'common') {
            prompt += `Common dwelling with 2-4 rooms, simple rectangular plan, `;
            prompt += `modest proportions. `;
        } else if (status === 'sacred') {
            prompt += `Sacred architecture with monumental proportions, `;
            prompt += `ceremonial approach, divine symbolism. `;
        }

        // Technical specifications
        if (showDimensions) {
            prompt += `Include dimension lines and measurements in meters. `;
        }

        if (showProportions) {
            prompt += `Show proportional relationships with ratio annotations. `;
        }

        // Drawing style
        prompt += `Technical drawing style: clean line work, minimal shading, `;
        prompt += `professional architectural drafting quality. `;
        prompt += `Black lines on white background. `;

        return prompt;
    }

    /**
     * Build invention technical diagram prompt
     */
    static buildInventionDiagram(invention, options = {}) {
        const {
            showForces = true,
            showComponents = true,
            showOperation = true,
            explodedView = false
        } = options;

        let prompt = `Create a technical diagram of the ${invention.name}. `;

        // Description
        if (invention.science) {
            prompt += `Demonstrates these principles: ${invention.science.join(', ')}. `;
        }

        // View type
        if (explodedView) {
            prompt += `Exploded view showing all components separated with assembly lines. `;
        } else {
            prompt += `Side view cutaway showing internal mechanism. `;
        }

        // Component labeling
        if (showComponents && invention.components) {
            const componentNames = Object.keys(invention.components);
            prompt += `Label these components: ${componentNames.join(', ')}. `;
        }

        // Force vectors
        if (showForces) {
            prompt += `Show force vectors with arrows indicating direction and magnitude. `;
            prompt += `Use different colors for different force types (red=effort, blue=load, green=fulcrum). `;
        }

        // Operation sequence
        if (showOperation) {
            prompt += `Include small sequential diagrams showing operation steps. `;
        }

        // Technical illustration style
        prompt += `Technical illustration style: clean line work, cross-hatching for materials, `;
        prompt += `clear annotations, educational textbook quality. `;
        prompt += `Include human scale reference figure. `;

        return prompt;
    }

    /**
     * Build writing system evolution diagram prompt
     */
    static buildWritingEvolution(symbol, options = {}) {
        const {
            showPictograph = true,
            showTransition = true,
            showCuneiform = true,
            showGeometricBreakdown = true
        } = options;

        let prompt = `Create an educational diagram showing the evolution of the ${symbol.name} symbol. `;

        // Timeline layout
        prompt += `Arrange horizontally from left to right showing chronological development. `;

        // Stages
        if (showPictograph && symbol.pictograph_origin) {
            prompt += `Left panel: Early pictograph form (3500-3000 BCE) - naturalistic drawing. `;
        }

        if (showTransition) {
            prompt += `Middle panel: Transitional form (3000-2900 BCE) - simplified outlines. `;
        }

        if (showCuneiform) {
            prompt += `Right panel: Standard cuneiform (2900+ BCE) - wedge-shaped abstract form. `;
        }

        // Geometric analysis
        if (showGeometricBreakdown && symbol.geometric_components) {
            prompt += `Below each form, show geometric decomposition: `;
            prompt += `circles, lines, wedges that compose the symbol. `;
        }

        // Labels
        prompt += `Label each stage with period dates and meaning. `;
        prompt += `Add arrows showing transformation between stages. `;

        // Style
        prompt += `Clean educational poster style, clear typography, `;
        prompt += `black symbols on cream background. `;

        return prompt;
    }

    // ==========================================
    // STYLE HELPERS
    // ==========================================

    static getStyleSpecification(style, tier) {
        const styles = {
            textbook: `Textbook educational illustration style: clear, precise line work, `,
            museum: `Museum documentation style: detailed, authentic, archival quality, `,
            technical: `Technical engineering drawing style: precise measurements, annotations, `,
            schematic: `Schematic diagram style: simplified, conceptual, emphasis on relationships, `
        };

        let spec = styles[style] || styles.textbook;

        // Tier-specific additions
        if (tier === 'atomic') {
            spec += `emphasize the irreducible fundamental nature, `;
        } else if (tier === 'molecular') {
            spec += `show pattern repetition and composition structure, `;
        } else if (tier === 'conceptual') {
            spec += `visualize the abstract concept with concrete examples, `;
        }

        return spec;
    }

    static getDimensionalRequirements(dimension) {
        const requirements = {
            '0D': `Show as a point with annotations indicating position without dimension. `,
            '1D': `Show as a line or curve with length measurement but no width. Include endpoints. `,
            '2D': `Show as a flat shape on a plane. Include area shading or hatching. Show perimeter clearly. `,
            '3D': `Show in 3D with perspective or isometric projection. Use shading to show volume. Include depth cues. `
        };

        return requirements[dimension] || '';
    }

    static getCulturalContext(deity, metaphor, period) {
        let context = `Cultural context: `;

        if (deity) {
            context += `Associated with ${deity} deity. `;
            context += this.getDeitySymbolism(deity) + `. `;
        }

        if (metaphor) {
            context += `Metaphorical meaning: ${metaphor}. `;
        }

        if (period) {
            context += `Shown in ${period} period artistic style. `;
        }

        return context;
    }

    static getDeitySymbolism(deity) {
        const symbolism = {
            shamash: 'sun god of justice, associated with circles and radiance',
            ishtar: 'goddess of love and war, associated with 8-pointed stars',
            sin: 'moon god of wisdom, associated with crescents and lunar cycles',
            enlil: 'god of wind and authority, associated with triangles and mountains',
            nabu: 'god of writing and wisdom, associated with wedges and tablets',
            nisaba: 'goddess of agriculture and grain, associated with hexagons and grids',
            marduk: 'supreme deity, associated with pyramids and cosmic order',
            tiamat: 'primordial chaos goddess, associated with spirals and dragons',
            anu: 'sky god, associated with arcs and celestial domes',
            ea: 'god of water and wisdom, associated with waves and flowing patterns'
        };

        return symbolism[deity] || deity;
    }
}

// ==========================================
// IMAGE GENERATION ENGINE
// ==========================================

export class MuseumGradeImageGenerator {
    constructor(outputDir = './generated-images') {
        this.outputDir = outputDir;
        this.promptBuilder = PromptBuilder;
        this.generationLog = [];
        this.rateLimitDelay = 2000; // 2 seconds between DALL-E calls
    }

    /**
     * Initialize output directory structure
     */
    async initialize() {
        const subdirs = [
            'atomic',
            'molecular',
            'conceptual',
            'ubiquitous',
            'inventions',
            'architecture',
            'writing-system',
            'material-culture',
            'periods',
            'lessons'
        ];

        await fs.mkdir(this.outputDir, { recursive: true });

        for (const subdir of subdirs) {
            await fs.mkdir(path.join(this.outputDir, subdir), { recursive: true });
        }

        console.log('✅ Output directory structure created');
    }

    /**
     * Generate single element image
     */
    async generateElementImage(elementId, options = {}) {
        const element = MASTER_REGISTRY[elementId];
        if (!element) {
            throw new Error(`Element ${elementId} not found`);
        }

        console.log(`🎨 Generating image for: ${element.name || elementId}`);

        // Determine image type and build prompt
        let prompt;
        let imageCategory;

        if (options.type === 'artifact') {
            prompt = this.promptBuilder.buildArtifactIllustration(element, options);
            imageCategory = 'artifact';
        } else if (options.type === 'architectural') {
            prompt = this.promptBuilder.buildArchitecturalDiagram(element, options);
            imageCategory = 'architectural';
        } else if (options.type === 'invention') {
            prompt = this.promptBuilder.buildInventionDiagram(element, options);
            imageCategory = 'invention';
        } else if (options.type === 'writing') {
            prompt = this.promptBuilder.buildWritingEvolution(element, options);
            imageCategory = 'writing';
        } else {
            // Default: educational diagram
            prompt = this.promptBuilder.buildEducationalDiagram(element, {
                tier: this.getTier(elementId),
                dimension: element.dimension,
                deity: element.deity,
                metaphor: element.metaphor,
                ...options
            });
            imageCategory = 'educational';
        }

        // Generate image via DALL-E 3
        try {
            const result = await generateImageDALLE(prompt, {
                size: '1024x1024',
                quality: 'hd',
                style: 'natural'
            });

            // Save metadata
            const metadata = {
                element_id: elementId,
                element_name: element.name || elementId,
                tier: this.getTier(elementId),
                image_type: imageCategory,
                prompt: prompt,
                generated_at: new Date().toISOString(),
                image_url: result.imageUrl,
                options: options
            };

            this.generationLog.push(metadata);

            // Determine save path
            const tierDir = this.getTierDirectory(elementId);
            const filename = this.generateFilename(elementId, imageCategory, options);
            const savePath = path.join(this.outputDir, tierDir, filename);

            // Save metadata JSON
            await fs.writeFile(
                savePath.replace('.png', '.json'),
                JSON.stringify(metadata, null, 2)
            );

            console.log(`✅ Generated: ${filename}`);
            console.log(`   URL: ${result.imageUrl}`);

            return {
                success: true,
                element_id: elementId,
                image_url: result.imageUrl,
                save_path: savePath,
                metadata: metadata
            };

        } catch (error) {
            console.error(`❌ Error generating image for ${elementId}:`, error.message);
            return {
                success: false,
                element_id: elementId,
                error: error.message
            };
        }
    }

    /**
     * Batch generate images for all elements
     */
    async generateAllElements(options = {}) {
        const {
            filter = null,
            maxImages = null,
            startIndex = 0
        } = options;

        const elements = getElementsForImageGeneration();
        let filteredElements = elements;

        // Apply filter
        if (filter) {
            filteredElements = elements.filter(filter);
        }

        // Apply limits
        if (maxImages) {
            filteredElements = filteredElements.slice(startIndex, startIndex + maxImages);
        }

        console.log(`🎨 Generating ${filteredElements.length} images...`);

        const results = [];

        for (let i = 0; i < filteredElements.length; i++) {
            const element = filteredElements[i];

            console.log(`\n[${i + 1}/${filteredElements.length}] Processing: ${element.id}`);

            const result = await this.generateElementImage(element.id, {
                tier: element.tier,
                showLabels: true,
                culturalContext: true
            });

            results.push(result);

            // Rate limiting
            if (i < filteredElements.length - 1) {
                console.log(`⏳ Waiting ${this.rateLimitDelay}ms for rate limit...`);
                await this.delay(this.rateLimitDelay);
            }
        }

        // Save summary
        await this.saveBatchSummary(results);

        const successCount = results.filter(r => r.success).length;
        console.log(`\n✅ Batch complete: ${successCount}/${results.length} succeeded`);

        return results;
    }

    /**
     * Generate period-specific image set
     */
    async generatePeriodImages(periodName, options = {}) {
        const elements = getElementsByPeriod(periodName);

        console.log(`🏛️ Generating ${periodName} period images (${elements.length} elements)`);

        const results = [];

        for (const element of elements) {
            // Generate artifact illustration for this period
            const result = await this.generateElementImage(element.id, {
                type: 'artifact',
                period: periodName,
                artifactType: options.artifactType || 'cylinder_seal',
                ...options
            });

            results.push(result);

            await this.delay(this.rateLimitDelay);
        }

        return results;
    }

    /**
     * Generate deity-specific image set
     */
    async generateDeityImages(deityName, options = {}) {
        const elements = getElementsByDeity(deityName);

        console.log(`⭐ Generating ${deityName} deity images (${elements.length} elements)`);

        const results = [];

        for (const element of elements) {
            const result = await this.generateElementImage(element.id, {
                deity: deityName,
                culturalContext: true,
                showLabels: true,
                ...options
            });

            results.push(result);

            await this.delay(this.rateLimitDelay);
        }

        return results;
    }

    /**
     * Generate architecture comparison images
     */
    async generateArchitectureComparisons(options = {}) {
        const statusLevels = ['elite', 'common'];
        const viewTypes = ['plan', 'elevation'];

        console.log(`🏗️ Generating architecture comparison images...`);

        const results = [];

        for (const status of statusLevels) {
            for (const viewType of viewTypes) {
                const result = await this.generateElementImage('arch.home.' + status, {
                    type: 'architectural',
                    viewType: viewType,
                    status: status,
                    showDimensions: true,
                    showProportions: true,
                    ...options
                });

                results.push(result);

                await this.delay(this.rateLimitDelay);
            }
        }

        return results;
    }

    /**
     * Generate invention decomposition series
     */
    async generateInventionSeries(inventionId, options = {}) {
        console.log(`⚙️ Generating invention series for: ${inventionId}`);

        const variants = [
            { showForces: true, explodedView: false },
            { showForces: false, explodedView: true },
            { showOperation: true, showForces: true }
        ];

        const results = [];

        for (let i = 0; i < variants.length; i++) {
            const result = await this.generateElementImage(inventionId, {
                type: 'invention',
                ...variants[i],
                ...options
            });

            results.push(result);

            if (i < variants.length - 1) {
                await this.delay(this.rateLimitDelay);
            }
        }

        return results;
    }

    // ==========================================
    // HELPER METHODS
    // ==========================================

    getTier(elementId) {
        if (elementId.startsWith('gea.')) return 'atomic';
        if (elementId.startsWith('gem.')) return 'molecular';
        if (elementId.startsWith('gek.')) return 'conceptual';
        if (elementId.startsWith('geu.')) return 'ubiquitous';
        if (elementId.startsWith('inv.')) return 'invention';
        if (elementId.startsWith('arch.')) return 'architectural';
        if (elementId.startsWith('symbol.')) return 'writing';
        if (elementId.startsWith('icon.')) return 'iconography';
        return 'other';
    }

    getTierDirectory(elementId) {
        const tier = this.getTier(elementId);
        const dirMap = {
            atomic: 'atomic',
            molecular: 'molecular',
            conceptual: 'conceptual',
            ubiquitous: 'ubiquitous',
            invention: 'inventions',
            architectural: 'architecture',
            writing: 'writing-system',
            iconography: 'writing-system'
        };
        return dirMap[tier] || 'other';
    }

    generateFilename(elementId, imageType, options) {
        let filename = elementId.replace(/\./g, '_');

        if (options.period) {
            filename += `_${options.period}`;
        }

        if (options.viewType) {
            filename += `_${options.viewType}`;
        }

        if (options.status) {
            filename += `_${options.status}`;
        }

        filename += `_${imageType}.png`;

        return filename;
    }

    async saveBatchSummary(results) {
        const summary = {
            generated_at: new Date().toISOString(),
            total: results.length,
            successful: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
            results: results
        };

        const summaryPath = path.join(this.outputDir, 'batch_summary.json');
        await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));

        console.log(`📊 Summary saved to: ${summaryPath}`);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get generation statistics
     */
    getStatistics() {
        return {
            total_generated: this.generationLog.length,
            by_tier: this.generationLog.reduce((acc, entry) => {
                acc[entry.tier] = (acc[entry.tier] || 0) + 1;
                return acc;
            }, {}),
            by_type: this.generationLog.reduce((acc, entry) => {
                acc[entry.image_type] = (acc[entry.image_type] || 0) + 1;
                return acc;
            }, {})
        };
    }
}

// ==========================================
// CONVENIENCE FUNCTIONS
// ==========================================

/**
 * Quick generation for single element
 */
export async function generateImage(elementId, options = {}) {
    const generator = new MuseumGradeImageGenerator();
    return await generator.generateElementImage(elementId, options);
}

/**
 * Generate complete element library (priority order)
 */
export async function generateCompleteLibrary(options = {}) {
    const generator = new MuseumGradeImageGenerator();
    await generator.initialize();

    const {
        maxPerTier = 10,
        startWithPriority = true
    } = options;

    console.log('🎨 Generating complete museum-grade image library...\n');

    // Priority 1: Atomic elements (foundation)
    console.log('📐 PRIORITY 1: Atomic Elements');
    await generator.generateAllElements({
        filter: el => el.tier === 'atomic',
        maxImages: maxPerTier
    });

    // Priority 2: Molecular elements
    console.log('\n🧬 PRIORITY 2: Molecular Elements');
    await generator.generateAllElements({
        filter: el => el.tier === 'molecular',
        maxImages: maxPerTier
    });

    // Priority 3: Inventions (simple machines)
    console.log('\n⚙️ PRIORITY 3: Simple Machines');
    await generator.generateAllElements({
        filter: el => el.id.startsWith('inv.simple'),
        maxImages: 6
    });

    const stats = generator.getStatistics();
    console.log('\n📊 Generation Statistics:');
    console.log(JSON.stringify(stats, null, 2));

    return stats;
}

console.log('✅ Museum-Grade Image Generator loaded');

export { PromptBuilder };
