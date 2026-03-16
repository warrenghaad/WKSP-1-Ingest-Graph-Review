/**
 * VIDEO GENERATION API
 * 
 * Integrates with Gemini and OpenAI to create educational videos
 * from curriculum content, RWI research packages, and user prompts
 */

import { Router } from 'express';
import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';

const router = Router();

class VideoGenerationSystem {
    constructor(options = {}) {
        this.geminiApiKey = options.geminiApiKey || process.env.GEMINI_API_KEY;
        this.openaiApiKey = options.openaiApiKey || process.env.OPENAI_API_KEY;
        this.outputDir = options.outputDir || './VIDEO_OUTPUT';
        
        // Video generation templates
        this.videoTemplates = {
            'educational_explainer': {
                name: 'Educational Explainer',
                description: 'Clear, step-by-step educational content',
                duration: '2-5 minutes',
                style: 'Clean animation with voice narration'
            },
            'myth_story': {
                name: 'Mythological Story',
                description: 'Narrative storytelling with visual elements',
                duration: '3-7 minutes', 
                style: 'Cinematic with atmospheric visuals'
            },
            'diagram_explanation': {
                name: 'Diagram Explanation',
                description: 'Geometric concepts with animated diagrams',
                duration: '1-3 minutes',
                style: 'Technical animation with labels'
            },
            'cultural_context': {
                name: 'Cultural Context',
                description: 'Historical and cultural background',
                duration: '4-8 minutes',
                style: 'Documentary style with artifacts'
            }
        };
    }

    /**
     * Generate video using OpenAI (text-to-video coming soon)
     */
    async generateWithOpenAI(prompt, options = {}) {
        console.log(`🎬 Generating video with OpenAI: ${prompt.substring(0, 50)}...`);
        
        try {
            // For now, OpenAI doesn't have direct video generation
            // We'll create a detailed video script and storyboard
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.openaiApiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o',
                    messages: [
                        {
                            role: 'system',
                            content: `You are a video production specialist creating detailed video scripts for educational content. 
                            Generate a comprehensive video production plan including:
                            1. Scene-by-scene breakdown
                            2. Visual descriptions for each scene
                            3. Narration script
                            4. Animation/visual effects notes
                            5. Timing and pacing
                            
                            Format as JSON with scenes array.`
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: 2000,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.status}`);
            }

            const data = await response.json();
            const videoScript = data.choices[0]?.message?.content;

            return {
                success: true,
                provider: 'openai',
                type: 'video_script',
                content: videoScript,
                metadata: {
                    model: 'gpt-4o',
                    template: options.template || 'educational_explainer',
                    duration_estimate: options.duration || '3-5 minutes',
                    generatedAt: new Date().toISOString()
                }
            };

        } catch (error) {
            console.error('❌ OpenAI video generation failed:', error.message);
            return {
                success: false,
                provider: 'openai',
                error: error.message
            };
        }
    }

    /**
     * Generate video using Gemini
     */
    async generateWithGemini(prompt, options = {}) {
        console.log(`🎬 Generating video with Gemini: ${prompt.substring(0, 50)}...`);
        
        try {
            // Gemini API call for video generation
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.geminiApiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `Create a detailed video production plan for educational content: ${prompt}
                            
                            Include:
                            1. Visual storyboard descriptions
                            2. Scene transitions
                            3. Educational objectives for each scene
                            4. Recommended visual style and animations
                            5. Pacing and timing
                            
                            Format as a structured JSON response.`
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.8,
                        maxOutputTokens: 2048
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`Gemini API error: ${response.status}`);
            }

            const data = await response.json();
            const videoContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

            return {
                success: true,
                provider: 'gemini',
                type: 'video_plan',
                content: videoContent,
                metadata: {
                    model: 'gemini-pro',
                    template: options.template || 'educational_explainer',
                    duration_estimate: options.duration || '3-5 minutes',
                    generatedAt: new Date().toISOString()
                }
            };

        } catch (error) {
            console.error('❌ Gemini video generation failed:', error.message);
            return {
                success: false,
                provider: 'gemini',
                error: error.message
            };
        }
    }

    /**
     * Generate video from RWI research package
     */
    async generateFromRWIPackage(packagePath, options = {}) {
        console.log(`📦 Generating video from RWI package: ${packagePath}`);
        
        try {
            const packageContent = await fs.readFile(packagePath, 'utf8');
            const rwiData = JSON.parse(packageContent);
            
            // Create video prompt from RWI data
            const prompt = this.createVideoPromptFromRWI(rwiData, options);
            
            // Generate with both providers
            const [openaiResult, geminiResult] = await Promise.all([
                this.generateWithOpenAI(prompt, options),
                this.generateWithGemini(prompt, options)
            ]);

            return {
                success: true,
                source: 'rwi_package',
                deity: rwiData.deity,
                element: rwiData.element,
                grade: rwiData.grade,
                results: {
                    openai: openaiResult,
                    gemini: geminiResult
                },
                prompt: prompt
            };

        } catch (error) {
            console.error('❌ RWI package video generation failed:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Create video prompt from RWI research data
     */
    createVideoPromptFromRWI(rwiData, options = {}) {
        const { deity, element, grade, sections } = rwiData;
        const template = options.template || 'educational_explainer';
        
        const successfulSections = sections.filter(s => s.success);
        
        let prompt = `Create an educational video for Grade ${grade} students about ${deity} and ${element}.\n\n`;
        
        // Add content from successful sections
        if (successfulSections.length > 0) {
            prompt += `Key content to include:\n`;
            successfulSections.forEach(section => {
                prompt += `\n${section.section}: ${section.template}\n`;
                prompt += `${section.content?.substring(0, 200)}...\n`;
            });
        }
        
        prompt += `\nVideo Requirements:
        - Target audience: Grade ${grade} students
        - Focus: ${deity} deity and ${element} geometric properties
        - Style: ${this.videoTemplates[template]?.style || 'Educational animation'}
        - Duration: ${this.videoTemplates[template]?.duration || '3-5 minutes'}
        - Include visual diagrams and cultural context`;
        
        return prompt;
    }

    /**
     * Save video generation results
     */
    async saveVideoResults(results) {
        try {
            await fs.mkdir(this.outputDir, { recursive: true });
            
            const timestamp = Date.now();
            const filename = `video-generation-${timestamp}.json`;
            const filepath = path.join(this.outputDir, filename);
            
            await fs.writeFile(filepath, JSON.stringify(results, null, 2));
            
            console.log(`💾 Video results saved: ${filepath}`);
            return filepath;
            
        } catch (error) {
            console.error('❌ Failed to save video results:', error.message);
            throw error;
        }
    }
}

// Initialize video generation system
const videoSystem = new VideoGenerationSystem();

// ============================================================================
// API ENDPOINTS
// ============================================================================

/**
 * POST /api/video/generate
 * Generate video from custom prompt
 */
router.post('/generate', async (req, res) => {
    try {
        const { prompt, providers = ['openai', 'gemini'], template, duration } = req.body;
        
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }
        
        console.log(`🎬 Generating video: "${prompt.substring(0, 50)}..."`);
        
        const options = { template, duration };
        const results = {};
        
        // Generate with selected providers
        if (providers.includes('openai')) {
            results.openai = await videoSystem.generateWithOpenAI(prompt, options);
        }
        
        if (providers.includes('gemini')) {
            results.gemini = await videoSystem.generateWithGemini(prompt, options);
        }
        
        // Save results
        const filepath = await videoSystem.saveVideoResults({
            prompt,
            providers,
            options,
            results,
            generatedAt: new Date().toISOString()
        });
        
        res.json({
            success: true,
            results,
            filepath,
            message: `Video generation completed with ${Object.keys(results).length} provider(s)`
        });
        
    } catch (error) {
        console.error('Video generation error:', error);
        res.status(500).json({
            error: 'Video generation failed',
            message: error.message
        });
    }
});

/**
 * POST /api/video/from-rwi
 * Generate video from RWI research package
 */
router.post('/from-rwi', async (req, res) => {
    try {
        const { packagePath, template, duration, providers = ['openai', 'gemini'] } = req.body;
        
        if (!packagePath) {
            return res.status(400).json({ error: 'RWI package path is required' });
        }
        
        const options = { template, duration, providers };
        const results = await videoSystem.generateFromRWIPackage(packagePath, options);
        
        // Save results
        const filepath = await videoSystem.saveVideoResults(results);
        
        res.json({
            success: true,
            ...results,
            filepath
        });
        
    } catch (error) {
        console.error('RWI video generation error:', error);
        res.status(500).json({
            error: 'RWI video generation failed',
            message: error.message
        });
    }
});

/**
 * GET /api/video/templates
 * Get available video templates
 */
router.get('/templates', (req, res) => {
    res.json({
        success: true,
        templates: videoSystem.videoTemplates
    });
});

/**
 * GET /api/video/results
 * List generated video results
 */
router.get('/results', async (req, res) => {
    try {
        const files = await fs.readdir(videoSystem.outputDir);
        const videoFiles = files.filter(f => f.startsWith('video-generation-') && f.endsWith('.json'));
        
        const results = await Promise.all(
            videoFiles.map(async (filename) => {
                const filepath = path.join(videoSystem.outputDir, filename);
                const content = await fs.readFile(filepath, 'utf8');
                const data = JSON.parse(content);
                
                return {
                    filename,
                    filepath,
                    generatedAt: data.generatedAt,
                    prompt: data.prompt?.substring(0, 100) + '...',
                    providers: Object.keys(data.results || {})
                };
            })
        );
        
        res.json({
            success: true,
            count: results.length,
            results: results.sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt))
        });
        
    } catch (error) {
        console.error('Get video results error:', error);
        res.status(500).json({
            error: 'Failed to get video results',
            message: error.message
        });
    }
});

/**
 * GET /api/video/status
 * Get video generation system status
 */
router.get('/status', (req, res) => {
    res.json({
        success: true,
        status: {
            geminiConfigured: !!videoSystem.geminiApiKey,
            openaiConfigured: !!videoSystem.openaiApiKey,
            outputDir: videoSystem.outputDir,
            templates: Object.keys(videoSystem.videoTemplates),
            supportedProviders: ['openai', 'gemini']
        }
    });
});

export { router as videoGenerationRoutes, VideoGenerationSystem };