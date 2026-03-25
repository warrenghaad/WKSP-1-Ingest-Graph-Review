/**
 * MUSEUM-GRADE IMAGE GENERATION API
 *
 * REST API endpoints for generating high-quality educational diagrams
 */

import { MuseumGradeImageGenerator, generateImage, generateCompleteLibrary } from './museum-grade-image-generator.js';

const imageGenerator = new MuseumGradeImageGenerator();

/**
 * Register Museum-Grade Image API routes
 */
export function registerMuseumImageRoutes(app) {

    /**
     * POST /api/images/generate
     * Generate single element image
     */
    app.post('/api/images/generate', async (req, res) => {
        try {
            const {
                elementId,
                type = 'educational', // educational, artifact, architectural, invention, writing
                options = {}
            } = req.body;

            if (!elementId) {
                return res.status(400).json({ error: 'elementId is required' });
            }

            console.log(`🎨 Generating ${type} image for: ${elementId}`);

            const result = await imageGenerator.generateElementImage(elementId, {
                type,
                ...options
            });

            if (result.success) {
                res.json({
                    success: true,
                    element_id: result.element_id,
                    image_url: result.image_url,
                    save_path: result.save_path,
                    metadata: result.metadata
                });
            } else {
                res.status(500).json({
                    success: false,
                    error: result.error
                });
            }

        } catch (error) {
            console.error('Image generation error:', error);
            res.status(500).json({
                error: 'Image generation failed',
                message: error.message
            });
        }
    });

    /**
     * POST /api/images/batch
     * Batch generate images
     */
    app.post('/api/images/batch', async (req, res) => {
        try {
            const {
                elementIds,
                type = 'educational',
                options = {}
            } = req.body;

            if (!Array.isArray(elementIds) || elementIds.length === 0) {
                return res.status(400).json({ error: 'elementIds array is required' });
            }

            console.log(`🎨 Batch generating ${elementIds.length} images...`);

            const results = [];

            for (const elementId of elementIds) {
                const result = await imageGenerator.generateElementImage(elementId, {
                    type,
                    ...options
                });

                results.push(result);

                // Rate limiting
                if (elementIds.indexOf(elementId) < elementIds.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }

            const successCount = results.filter(r => r.success).length;

            res.json({
                success: true,
                total: results.length,
                successful: successCount,
                failed: results.length - successCount,
                results: results
            });

        } catch (error) {
            console.error('Batch generation error:', error);
            res.status(500).json({
                error: 'Batch generation failed',
                message: error.message
            });
        }
    });

    /**
     * POST /api/images/generate-period
     * Generate period-specific artifact images
     */
    app.post('/api/images/generate-period', async (req, res) => {
        try {
            const {
                period,
                artifactType = 'cylinder_seal',
                options = {}
            } = req.body;

            if (!period) {
                return res.status(400).json({ error: 'period is required' });
            }

            console.log(`🏛️ Generating ${period} period images...`);

            const results = await imageGenerator.generatePeriodImages(period, {
                artifactType,
                ...options
            });

            res.json({
                success: true,
                period: period,
                total: results.length,
                results: results
            });

        } catch (error) {
            console.error('Period image generation error:', error);
            res.status(500).json({
                error: 'Period image generation failed',
                message: error.message
            });
        }
    });

    /**
     * POST /api/images/generate-deity
     * Generate deity-specific images
     */
    app.post('/api/images/generate-deity', async (req, res) => {
        try {
            const {
                deity,
                options = {}
            } = req.body;

            if (!deity) {
                return res.status(400).json({ error: 'deity is required' });
            }

            console.log(`⭐ Generating ${deity} deity images...`);

            const results = await imageGenerator.generateDeityImages(deity, options);

            res.json({
                success: true,
                deity: deity,
                total: results.length,
                results: results
            });

        } catch (error) {
            console.error('Deity image generation error:', error);
            res.status(500).json({
                error: 'Deity image generation failed',
                message: error.message
            });
        }
    });

    /**
     * POST /api/images/generate-architecture
     * Generate architectural comparison images
     */
    app.post('/api/images/generate-architecture', async (req, res) => {
        try {
            const { options = {} } = req.body;

            console.log('🏗️ Generating architecture comparison images...');

            const results = await imageGenerator.generateArchitectureComparisons(options);

            res.json({
                success: true,
                total: results.length,
                results: results
            });

        } catch (error) {
            console.error('Architecture image generation error:', error);
            res.status(500).json({
                error: 'Architecture image generation failed',
                message: error.message
            });
        }
    });

    /**
     * POST /api/images/generate-invention-series
     * Generate invention decomposition series
     */
    app.post('/api/images/generate-invention-series', async (req, res) => {
        try {
            const {
                inventionId,
                options = {}
            } = req.body;

            if (!inventionId) {
                return res.status(400).json({ error: 'inventionId is required' });
            }

            console.log(`⚙️ Generating invention series for: ${inventionId}`);

            const results = await imageGenerator.generateInventionSeries(inventionId, options);

            res.json({
                success: true,
                invention_id: inventionId,
                total: results.length,
                results: results
            });

        } catch (error) {
            console.error('Invention series generation error:', error);
            res.status(500).json({
                error: 'Invention series generation failed',
                message: error.message
            });
        }
    });

    /**
     * POST /api/images/generate-complete-library
     * Generate complete image library (throttled)
     */
    app.post('/api/images/generate-complete-library', async (req, res) => {
        try {
            const {
                maxPerTier = 10,
                startWithPriority = true
            } = req.body;

            console.log('🎨 Starting complete library generation...');

            // Start generation in background
            generateCompleteLibrary({ maxPerTier, startWithPriority })
                .then(stats => {
                    console.log('✅ Complete library generation finished');
                    console.log(stats);
                })
                .catch(error => {
                    console.error('❌ Library generation error:', error);
                });

            res.json({
                success: true,
                message: 'Library generation started in background',
                max_per_tier: maxPerTier
            });

        } catch (error) {
            console.error('Library generation error:', error);
            res.status(500).json({
                error: 'Library generation failed to start',
                message: error.message
            });
        }
    });

    /**
     * GET /api/images/statistics
     * Get generation statistics
     */
    app.get('/api/images/statistics', (req, res) => {
        try {
            const stats = imageGenerator.getStatistics();
            res.json(stats);
        } catch (error) {
            console.error('Statistics error:', error);
            res.status(500).json({
                error: 'Failed to get statistics',
                message: error.message
            });
        }
    });

    /**
     * POST /api/images/initialize
     * Initialize directory structure
     */
    app.post('/api/images/initialize', async (req, res) => {
        try {
            await imageGenerator.initialize();
            res.json({
                success: true,
                message: 'Directory structure initialized'
            });
        } catch (error) {
            console.error('Initialization error:', error);
            res.status(500).json({
                error: 'Initialization failed',
                message: error.message
            });
        }
    });

    console.log('✅ Museum-Grade Image API routes registered');
}
