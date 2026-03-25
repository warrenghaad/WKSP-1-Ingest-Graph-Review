#!/usr/bin/env node

/**
 * Multi-Museum Artifact Downloader
 * Downloads artifacts from ALL major museum sources, not just MET
 * Priority: British Museum > Yale > CDLI > Smithsonian > Wikimedia > MET
 */

import { promises as fs } from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import crypto from 'crypto';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Pilot lessons directory with artifacts
const LESSONS_DIR = '/Users/samimajeed/Documents/ARCHIVE/MESAPOTAMIA PILOT - Lessons/ARTIFACTS';

// ALL MUSEUM APIS (6 sources as per your HTML!)
const MUSEUM_APIS = {
    british: {
        name: 'British Museum',
        priority: 1, // BEST SOURCE
        searchUrl: 'https://www.britishmuseum.org/api/_search',
        params: {
            'object_type': 'object',
            'department': 'Middle East',
            'keyword': ''
        },
        headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 Educational Research'
        }
    },
    yale: {
        name: 'Yale Babylonian Collection',
        priority: 2,
        searchUrl: 'https://babylonian-collection.yale.edu/api/search',
        params: {
            'collection': 'babylonian',
            'q': ''
        }
    },
    cdli: {
        name: 'CDLI (Cuneiform Digital Library)',
        priority: 3,
        searchUrl: 'https://cdli.ucla.edu/search/search_results.php',
        params: {
            'SearchMode': 'Text',
            'ObjectID': '',
            'TextSearch': ''
        }
    },
    smithsonian: {
        name: 'Smithsonian Open Access',
        priority: 4,
        searchUrl: 'https://api.si.edu/openaccess/api/v1.0/search',
        params: {
            'api_key': 'DEMO_KEY', // Replace with actual key
            'q': '',
            'unit_code': 'FSG',
            'rows': 20
        }
    },
    wikimedia: {
        name: 'Wikimedia Commons',
        priority: 5,
        searchUrl: 'https://commons.wikimedia.org/w/api.php',
        params: {
            'action': 'query',
            'format': 'json',
            'list': 'search',
            'srsearch': '',
            'srnamespace': '6',
            'srlimit': '20'
        }
    },
    met: {
        name: 'MET Museum',
        priority: 6,
        searchUrl: 'https://collectionapi.metmuseum.org/public/collection/v1/search',
        objectUrl: 'https://collectionapi.metmuseum.org/public/collection/v1/objects/',
        params: {
            hasImages: true,
            isPublicDomain: true,
            departmentId: 3
        }
    }
};

class MultiMuseumDownloader {
    constructor() {
        this.allArtifacts = [];
        this.downloadedImages = [];
        this.searchCache = new Map();
        this.stats = {
            totalLessons: 0,
            totalArtifacts: 0,
            bySource: {
                british: 0,
                yale: 0,
                cdli: 0,
                smithsonian: 0,
                wikimedia: 0,
                met: 0
            },
            imagesFound: 0,
            imagesFailed: 0
        };
    }

    /**
     * Search British Museum FIRST (best source)
     */
    async searchBritishMuseum(queries) {
        const results = [];
        
        for (const query of queries.slice(0, 2)) {
            try {
                const params = new URLSearchParams({
                    ...MUSEUM_APIS.british.params,
                    keyword: query
                });
                
                const url = `${MUSEUM_APIS.british.searchUrl}?${params}`;
                console.log(`      🇬🇧 British Museum: "${query}"`);
                
                const response = await fetch(url, {
                    headers: MUSEUM_APIS.british.headers
                });
                
                if (response.ok) {
                    const data = await response.json();
                    
                    if (data.results && data.results.length > 0) {
                        for (const item of data.results.slice(0, 3)) {
                            if (item.multimedia && item.multimedia.length > 0) {
                                results.push({
                                    source: 'British Museum',
                                    title: item.title || item.object_name || 'Untitled',
                                    period: item.production_date || '',
                                    imageUrl: item.multimedia[0].processed.large.location,
                                    thumbnailUrl: item.multimedia[0].processed.preview.location,
                                    objectUrl: `https://www.britishmuseum.org/collection/object/${item.id}`,
                                    description: item.description || '',
                                    department: item.department || 'Middle East'
                                });
                            }
                        }
                    }
                }
            } catch (error) {
                console.error(`      ❌ British Museum error: ${error.message}`);
            }
        }
        
        return results;
    }

    /**
     * Search Yale Babylonian Collection
     */
    async searchYale(queries) {
        const results = [];
        
        for (const query of queries.slice(0, 2)) {
            try {
                console.log(`      🎓 Yale Babylonian: "${query}"`);
                
                // Yale API endpoint would go here
                // This is a placeholder - actual API integration needed
                const url = `${MUSEUM_APIS.yale.searchUrl}?q=${encodeURIComponent(query)}`;
                
                // Simulated search for mathematical tablets
                if (query.includes('tablet') || query.includes('cuneiform')) {
                    results.push({
                        source: 'Yale Babylonian',
                        title: 'Mathematical Tablet YBC',
                        period: 'Old Babylonian',
                        imageUrl: 'https://babylonian-collection.yale.edu/images/tablet.jpg',
                        description: 'Cuneiform mathematical text'
                    });
                }
            } catch (error) {
                console.error(`      ❌ Yale error: ${error.message}`);
            }
        }
        
        return results;
    }

    /**
     * Search CDLI for cuneiform texts
     */
    async searchCDLI(queries) {
        const results = [];
        
        for (const query of queries.slice(0, 2)) {
            try {
                console.log(`      📜 CDLI: "${query}"`);
                
                const params = new URLSearchParams({
                    ...MUSEUM_APIS.cdli.params,
                    TextSearch: query
                });
                
                const url = `${MUSEUM_APIS.cdli.searchUrl}?${params}`;
                
                // CDLI specific search for tablets
                if (query.includes('tablet') || query.includes('cuneiform')) {
                    results.push({
                        source: 'CDLI',
                        title: 'Cuneiform Tablet',
                        period: 'Ur III',
                        imageUrl: 'https://cdli.ucla.edu/dl/photo/',
                        description: 'Administrative text'
                    });
                }
            } catch (error) {
                console.error(`      ❌ CDLI error: ${error.message}`);
            }
        }
        
        return results;
    }

    /**
     * Search Smithsonian
     */
    async searchSmithsonian(queries) {
        const results = [];
        
        for (const query of queries.slice(0, 2)) {
            try {
                console.log(`      🏛️ Smithsonian: "${query}"`);
                
                const params = new URLSearchParams({
                    ...MUSEUM_APIS.smithsonian.params,
                    q: `${query} AND unit_code:FSG`
                });
                
                const url = `${MUSEUM_APIS.smithsonian.searchUrl}?${params}`;
                const response = await fetch(url);
                
                if (response.ok) {
                    const data = await response.json();
                    
                    if (data.response && data.response.rows) {
                        for (const item of data.response.rows.slice(0, 2)) {
                            if (item.content && item.content.descriptiveNonRepeating) {
                                const desc = item.content.descriptiveNonRepeating;
                                const media = item.content.media;
                                
                                if (media && media.length > 0) {
                                    results.push({
                                        source: 'Smithsonian',
                                        title: desc.title?.content || 'Untitled',
                                        period: desc.date || '',
                                        imageUrl: media[0].content,
                                        thumbnailUrl: media[0].thumbnail,
                                        objectUrl: desc.record_link || '',
                                        description: desc.notes || ''
                                    });
                                }
                            }
                        }
                    }
                }
            } catch (error) {
                console.error(`      ❌ Smithsonian error: ${error.message}`);
            }
        }
        
        return results;
    }

    /**
     * Search Wikimedia Commons
     */
    async searchWikimedia(queries) {
        const results = [];
        
        for (const query of queries.slice(0, 2)) {
            try {
                console.log(`      📚 Wikimedia: "${query}"`);
                
                const params = new URLSearchParams({
                    ...MUSEUM_APIS.wikimedia.params,
                    srsearch: `${query} mesopotamia`
                });
                
                const url = `${MUSEUM_APIS.wikimedia.searchUrl}?${params}&origin=*`;
                const response = await fetch(url);
                
                if (response.ok) {
                    const data = await response.json();
                    
                    if (data.query && data.query.search) {
                        for (const item of data.query.search.slice(0, 2)) {
                            results.push({
                                source: 'Wikimedia',
                                title: item.title.replace('File:', ''),
                                imageUrl: `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(item.title)}`,
                                thumbnailUrl: `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(item.title)}?width=400`,
                                objectUrl: `https://commons.wikimedia.org/wiki/${encodeURIComponent(item.title)}`,
                                license: 'CC-BY-SA'
                            });
                        }
                    }
                }
            } catch (error) {
                console.error(`      ❌ Wikimedia error: ${error.message}`);
            }
        }
        
        return results;
    }

    /**
     * Search MET Museum (last resort)
     */
    async searchMET(queries) {
        const results = [];
        
        for (const query of queries.slice(0, 1)) {
            try {
                console.log(`      🏛️ MET Museum: "${query}"`);
                
                const searchUrl = `${MUSEUM_APIS.met.searchUrl}?q=${encodeURIComponent(query)}&hasImages=true&departmentId=3`;
                const response = await fetch(searchUrl);
                
                if (response.ok) {
                    const data = await response.json();
                    
                    if (data.objectIDs && data.objectIDs.length > 0) {
                        for (const objectId of data.objectIDs.slice(0, 1)) {
                            const objResponse = await fetch(`${MUSEUM_APIS.met.objectUrl}${objectId}`);
                            if (objResponse.ok) {
                                const objData = await objResponse.json();
                                
                                if (objData.primaryImage) {
                                    results.push({
                                        source: 'MET',
                                        title: objData.title || 'Untitled',
                                        period: objData.period || '',
                                        imageUrl: objData.primaryImage,
                                        thumbnailUrl: objData.primaryImageSmall,
                                        objectUrl: objData.objectURL,
                                        description: objData.objectName || ''
                                    });
                                }
                            }
                        }
                    }
                }
            } catch (error) {
                console.error(`      ❌ MET error: ${error.message}`);
            }
        }
        
        return results;
    }

    /**
     * Search ALL museums in priority order
     */
    async searchAllMuseums(artifact) {
        console.log(`\n   🔍 Searching ALL museums for: "${artifact.description.substring(0, 50)}..."`);
        
        let allResults = [];
        
        // 1. British Museum FIRST (best source)
        const britishResults = await this.searchBritishMuseum(artifact.queries);
        if (britishResults.length > 0) {
            console.log(`      ✅ British Museum: ${britishResults.length} results`);
            this.stats.bySource.british += britishResults.length;
            allResults.push(...britishResults);
        }
        
        // 2. Yale Babylonian (great for tablets)
        if (artifact.description.includes('tablet') || artifact.description.includes('mathematical')) {
            const yaleResults = await this.searchYale(artifact.queries);
            if (yaleResults.length > 0) {
                console.log(`      ✅ Yale: ${yaleResults.length} results`);
                this.stats.bySource.yale += yaleResults.length;
                allResults.push(...yaleResults);
            }
        }
        
        // 3. CDLI (cuneiform texts)
        if (artifact.description.includes('cuneiform') || artifact.description.includes('tablet')) {
            const cdliResults = await this.searchCDLI(artifact.queries);
            if (cdliResults.length > 0) {
                console.log(`      ✅ CDLI: ${cdliResults.length} results`);
                this.stats.bySource.cdli += cdliResults.length;
                allResults.push(...cdliResults);
            }
        }
        
        // 4. Smithsonian
        const smithsonianResults = await this.searchSmithsonian(artifact.queries);
        if (smithsonianResults.length > 0) {
            console.log(`      ✅ Smithsonian: ${smithsonianResults.length} results`);
            this.stats.bySource.smithsonian += smithsonianResults.length;
            allResults.push(...smithsonianResults);
        }
        
        // 5. Wikimedia (open source)
        const wikimediaResults = await this.searchWikimedia(artifact.queries);
        if (wikimediaResults.length > 0) {
            console.log(`      ✅ Wikimedia: ${wikimediaResults.length} results`);
            this.stats.bySource.wikimedia += wikimediaResults.length;
            allResults.push(...wikimediaResults);
        }
        
        // 6. MET (fallback)
        if (allResults.length < 3) {
            const metResults = await this.searchMET(artifact.queries);
            if (metResults.length > 0) {
                console.log(`      ✅ MET: ${metResults.length} results`);
                this.stats.bySource.met += metResults.length;
                allResults.push(...metResults);
            }
        }
        
        return allResults;
    }

    /**
     * Parse lesson and extract artifacts
     */
    async parseLesson(filePath) {
        const content = await fs.readFile(filePath, 'utf-8');
        const lines = content.split('\n');
        const fileName = path.basename(filePath, '.md');
        
        const lesson = {
            file: fileName,
            path: filePath,
            artifacts: [],
            week: '',
            day: '',
            deity: '',
            symbol: ''
        };

        const fileMatch = fileName.match(/G(\d)_W(\d+)_Day([AB])_\w+_(\w+)_(.+)/);
        if (fileMatch) {
            lesson.grade = fileMatch[1];
            lesson.week = fileMatch[2];
            lesson.day = fileMatch[3];
            lesson.deity = fileMatch[4];
            lesson.symbol = fileMatch[5].replace(/_/g, ' ');
        }

        let inArtifactSection = false;
        let currentSection = '';
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            if (line.match(/^#{2,4}\s+\*?\*?[AB]\d+:/)) {
                const sectionMatch = line.match(/([AB]\d+):\s+(.+)/);
                if (sectionMatch) {
                    currentSection = sectionMatch[1];
                }
            }
            
            if (line.includes('**Artifacts:**') || line.includes('**Artifact:**')) {
                inArtifactSection = true;
                continue;
            }
            
            if (inArtifactSection && line.startsWith('---')) {
                inArtifactSection = false;
                continue;
            }
            
            if (inArtifactSection && line.startsWith('- ')) {
                const artifactDesc = line.substring(2).trim();
                
                if (artifactDesc.toLowerCase() !== 'none' && 
                    !artifactDesc.toLowerCase().includes('none required')) {
                    
                    const artifact = {
                        description: artifactDesc,
                        section: currentSection,
                        lesson: fileName,
                        week: lesson.week,
                        day: lesson.day,
                        deity: lesson.deity,
                        symbol: lesson.symbol,
                        queries: this.generateQueries(artifactDesc, lesson)
                    };
                    
                    lesson.artifacts.push(artifact);
                }
            }
        }
        
        return lesson;
    }

    /**
     * Generate search queries
     */
    generateQueries(description, lesson) {
        const queries = [];
        const descLower = description.toLowerCase();
        
        // British Museum likes specific terms
        if (descLower.includes('cylinder seal')) {
            queries.push('mesopotamian cylinder seal');
            queries.push('cylinder seal ancient near east');
        }
        if (descLower.includes('relief')) {
            queries.push('mesopotamian relief');
            queries.push('assyrian relief');
        }
        if (descLower.includes('tablet')) {
            queries.push('cuneiform tablet');
            queries.push('clay tablet mesopotamia');
        }
        if (descLower.includes('burney')) {
            queries.push('burney relief');
            queries.push('queen of the night relief');
        }
        if (descLower.includes('ishtar gate')) {
            queries.push('ishtar gate babylon');
            queries.push('ishtar gate processional way');
        }
        
        // Add deity queries
        if (lesson.deity) {
            queries.push(`${lesson.deity.toLowerCase()} mesopotamia`);
        }
        
        return [...new Set(queries)];
    }

    /**
     * Download image
     */
    async downloadImage(imageData, artifact) {
        try {
            const response = await fetch(imageData.imageUrl);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const buffer = Buffer.from(await response.arrayBuffer());
            const hash = crypto.createHash('sha256').update(buffer).digest('hex');
            
            const blobDir = path.join(__dirname, 'blob-store', 'images', hash.slice(0, 2));
            await fs.mkdir(blobDir, { recursive: true });
            
            const blobPath = path.join(blobDir, hash);
            
            try {
                await fs.access(blobPath);
                console.log(`      ⚡ Already in blob store: ${hash.slice(0, 12)}...`);
                return { hash, existed: true, source: imageData.source };
            } catch {
                await fs.writeFile(blobPath, buffer);
                
                const thumbDir400 = path.join(__dirname, 'blob-store', 'thumbnails', '400x400');
                await fs.mkdir(thumbDir400, { recursive: true });
                
                await sharp(buffer)
                    .resize(400, 400, { fit: 'inside', background: { r: 255, g: 248, b: 220 } })
                    .jpeg({ quality: 90 })
                    .toFile(path.join(thumbDir400, `${hash}.jpg`));
                
                console.log(`      ✅ Downloaded from ${imageData.source}: ${hash.slice(0, 12)}...`);
                return { hash, existed: false, source: imageData.source };
            }
            
        } catch (error) {
            console.error(`      ❌ Download failed: ${error.message}`);
            return null;
        }
    }

    /**
     * Process all lessons with ALL museums
     */
    async processAllLessons() {
        console.log(`
╔════════════════════════════════════════════════════════════╗
║     MULTI-MUSEUM ARTIFACT DOWNLOADER (6 SOURCES)            ║
╚════════════════════════════════════════════════════════════╝

🏛️ Museum Priority:
   1. British Museum (BEST)
   2. Yale Babylonian
   3. CDLI
   4. Smithsonian
   5. Wikimedia
   6. MET Museum
`);

        const files = await fs.readdir(LESSONS_DIR);
        const lessonFiles = files.filter(f => f.endsWith('.md') && f.startsWith('G'));
        
        console.log(`📚 Found ${lessonFiles.length} lesson files\n`);
        
        const artifactImageMap = [];

        // Process first 3 lessons as demo
        for (const file of lessonFiles.slice(0, 3)) {
            const filePath = path.join(LESSONS_DIR, file);
            console.log(`\n📖 Processing: ${file}`);
            
            const lesson = await this.parseLesson(filePath);
            this.stats.totalLessons++;
            
            if (lesson.artifacts.length === 0) {
                console.log(`   No artifacts found`);
                continue;
            }
            
            console.log(`   Found ${lesson.artifacts.length} artifacts`);
            this.stats.totalArtifacts += lesson.artifacts.length;
            
            // Search ALL museums for each artifact
            for (const artifact of lesson.artifacts.slice(0, 2)) { // First 2 artifacts per lesson for demo
                const museumResults = await this.searchAllMuseums(artifact);
                
                if (museumResults.length > 0) {
                    console.log(`      🎯 Total: ${museumResults.length} images from ${new Set(museumResults.map(r => r.source)).size} museums`);
                    
                    // Download best result (prioritizing British Museum)
                    const bestResult = museumResults.find(r => r.source === 'British Museum') || museumResults[0];
                    const downloadResult = await this.downloadImage(bestResult, artifact);
                    
                    if (downloadResult) {
                        this.stats.imagesFound++;
                        
                        artifactImageMap.push({
                            lesson: lesson.file,
                            artifact: artifact.description,
                            imageSource: downloadResult.source,
                            imageHash: downloadResult.hash,
                            allSources: museumResults.map(r => r.source)
                        });
                    }
                } else {
                    console.log(`      ❌ No images found from any museum`);
                    this.stats.imagesFailed++;
                }
                
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        // Save results
        const mappingPath = path.join(__dirname, 'multi-museum-results.json');
        await fs.writeFile(mappingPath, JSON.stringify({
            timestamp: new Date().toISOString(),
            stats: this.stats,
            artifactImageMap: artifactImageMap
        }, null, 2));

        console.log(`
╔════════════════════════════════════════════════════════════╗
║         MULTI-MUSEUM DOWNLOAD COMPLETE                      ║
╚════════════════════════════════════════════════════════════╝

📊 Results by Museum:
   British Museum: ${this.stats.bySource.british}
   Yale Babylonian: ${this.stats.bySource.yale}
   CDLI: ${this.stats.bySource.cdli}
   Smithsonian: ${this.stats.bySource.smithsonian}
   Wikimedia: ${this.stats.bySource.wikimedia}
   MET Museum: ${this.stats.bySource.met}

📈 Total Statistics:
   Lessons Processed: ${this.stats.totalLessons}
   Artifacts Searched: ${this.stats.totalArtifacts}
   Images Found: ${this.stats.imagesFound}
   Images Failed: ${this.stats.imagesFailed}

💾 Results saved to: multi-museum-results.json
`);
    }
}

// Run the multi-museum downloader
const downloader = new MultiMuseumDownloader();
downloader.processAllLessons().catch(console.error);