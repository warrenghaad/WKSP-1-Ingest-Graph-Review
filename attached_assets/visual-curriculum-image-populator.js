/**
 * Visual Curriculum Explorer Image Populator
 * Finds and downloads appropriate museum images for each civilization period
 */

import fs from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class VisualCurriculumImagePopulator {
  constructor() {
    this.htmlPath = '/Users/samimajeed/Downloads/visual_curriculum_explorer_1.html';
    this.outputDir = path.join(__dirname, 'VISUAL_CURRICULUM_IMAGES');
    this.metApiBase = 'https://collectionapi.metmuseum.org/public/collection/v1';
    
    // Define image needs for each civilization
    this.civilizationImages = {
      mesopotamia: [
        { id: 'ziggurat_ur', query: 'ziggurat ur mesopotamia', caption: 'Ziggurat of Ur - Reaching Heaven' },
        { id: 'cuneiform_tablet', query: 'cuneiform tablet mesopotamian writing', caption: 'Cuneiform Tablet - First Writing' },
        { id: 'standard_ur', query: 'standard of ur sumerian', caption: 'Standard of Ur - War & Peace' },
        { id: 'cylinder_seal', query: 'cylinder seal mesopotamian', caption: 'Cylinder Seal - Rolled Narratives' },
        { id: 'hammurabi_stele', query: 'code hammurabi stele', caption: 'Code of Hammurabi Stele' },
        { id: 'ishtar_gate', query: 'ishtar gate babylon', caption: "Ishtar Gate - Babylon's Glory" }
      ],
      egypt: [
        { id: 'pyramid_giza', query: 'pyramid giza egypt', caption: 'Great Pyramid of Giza' },
        { id: 'tutankhamun_mask', query: 'tutankhamun gold mask', caption: "Tutankhamun's Golden Mask" },
        { id: 'eye_horus', query: 'eye of horus amulet egypt', caption: 'Eye of Horus - Protection Symbol' },
        { id: 'rosetta_stone', query: 'rosetta stone hieroglyphs', caption: 'Rosetta Stone - Key to Hieroglyphs' },
        { id: 'temple_karnak', query: 'karnak temple egypt', caption: 'Temple of Karnak - Hypostyle Hall' },
        { id: 'book_dead', query: 'book of dead papyrus egypt', caption: 'Book of the Dead Papyrus' }
      ],
      greece: [
        { id: 'parthenon', query: 'parthenon athens greece', caption: 'The Parthenon - Temple of Athena' },
        { id: 'discobolus', query: 'discobolus greek sculpture', caption: 'Discobolus - Discus Thrower' },
        { id: 'greek_vase', query: 'greek vase geometric pattern', caption: 'Greek Vase - Geometric Patterns' },
        { id: 'theater_epidaurus', query: 'epidaurus theater greece', caption: 'Theater of Epidaurus' },
        { id: 'pythagorean', query: 'pythagorean theorem ancient', caption: 'Pythagorean Theorem Tablet' },
        { id: 'acropolis', query: 'acropolis athens greece', caption: 'The Acropolis of Athens' }
      ],
      rome: [
        { id: 'colosseum', query: 'colosseum rome amphitheater', caption: 'The Colosseum - Eternal Arena' },
        { id: 'aqueduct', query: 'roman aqueduct pont du gard', caption: 'Roman Aqueduct - Engineering Marvel' },
        { id: 'pantheon', query: 'pantheon rome dome', caption: 'The Pantheon - Perfect Dome' },
        { id: 'roman_mosaic', query: 'roman mosaic geometric', caption: 'Roman Mosaic - Geometric Patterns' },
        { id: 'augustus', query: 'augustus caesar statue', caption: 'Augustus Caesar' },
        { id: 'roman_road', query: 'roman road via appia', caption: 'Roman Roads - Via Appia' }
      ],
      china: [
        { id: 'great_wall', query: 'great wall china', caption: 'The Great Wall' },
        { id: 'terracotta_army', query: 'terracotta warriors china', caption: 'Terracotta Army' },
        { id: 'forbidden_city', query: 'forbidden city beijing', caption: 'The Forbidden City' },
        { id: 'chinese_compass', query: 'chinese compass ancient', caption: 'Ancient Chinese Compass' },
        { id: 'paper_making', query: 'chinese paper making han', caption: 'Paper Making Process' },
        { id: 'confucius', query: 'confucius portrait chinese', caption: 'Confucius - The Teacher' }
      ],
      india: [
        { id: 'taj_mahal', query: 'taj mahal india mughal', caption: 'Taj Mahal - Geometric Paradise' },
        { id: 'hindu_temple', query: 'hindu temple architecture', caption: 'Hindu Temple Architecture' },
        { id: 'buddhist_stupa', query: 'buddhist stupa sanchi', caption: 'Buddhist Stupa at Sanchi' },
        { id: 'sanskrit', query: 'sanskrit manuscript ancient', caption: 'Sanskrit Mathematical Text' },
        { id: 'mandala', query: 'mandala geometric pattern', caption: 'Mandala - Sacred Geometry' },
        { id: 'mohenjo_daro', query: 'mohenjo daro indus valley', caption: 'Mohenjo-daro City Plan' }
      ],
      islam: [
        { id: 'dome_rock', query: 'dome of rock jerusalem', caption: 'Dome of the Rock' },
        { id: 'alhambra', query: 'alhambra geometric patterns', caption: 'Alhambra - Geometric Paradise' },
        { id: 'arabic_calligraphy', query: 'arabic calligraphy geometric', caption: 'Arabic Calligraphy' },
        { id: 'astrolabe', query: 'islamic astrolabe brass', caption: 'Islamic Astrolabe' },
        { id: 'mosque_cordoba', query: 'mosque cordoba arches', caption: 'Great Mosque of Córdoba' },
        { id: 'islamic_tile', query: 'islamic geometric tile pattern', caption: 'Islamic Geometric Tiles' }
      ],
      medieval: [
        { id: 'notre_dame', query: 'notre dame cathedral gothic', caption: 'Notre Dame Cathedral' },
        { id: 'illuminated_manuscript', query: 'illuminated manuscript medieval', caption: 'Illuminated Manuscript' },
        { id: 'castle', query: 'medieval castle fortress', caption: 'Medieval Castle' },
        { id: 'stained_glass', query: 'stained glass rose window', caption: 'Rose Window - Sacred Geometry' },
        { id: 'medieval_astrolabe', query: 'medieval astrolabe european', caption: 'Medieval Astrolabe' },
        { id: 'book_kells', query: 'book of kells celtic', caption: 'Book of Kells' }
      ],
      renaissance: [
        { id: 'vitruvian_man', query: 'vitruvian man leonardo da vinci', caption: 'Vitruvian Man - Perfect Proportions' },
        { id: 'florence_cathedral', query: 'florence cathedral dome brunelleschi', caption: 'Florence Cathedral Dome' },
        { id: 'school_athens', query: 'school of athens raphael', caption: 'School of Athens' },
        { id: 'david', query: 'david michelangelo sculpture', caption: 'David by Michelangelo' },
        { id: 'perspective_drawing', query: 'renaissance perspective drawing', caption: 'Perspective Drawing' },
        { id: 'galileo_telescope', query: 'galileo telescope scientific', caption: "Galileo's Telescope" }
      ]
    };
  }

  /**
   * Initialize output directory structure
   */
  async initDirectories() {
    await fs.mkdir(this.outputDir, { recursive: true });
    
    for (const civilization of Object.keys(this.civilizationImages)) {
      await fs.mkdir(path.join(this.outputDir, civilization), { recursive: true });
    }
    
    console.log(`📁 Created directories for ${Object.keys(this.civilizationImages).length} civilizations`);
  }

  /**
   * Search Met Museum for images
   */
  async searchMetMuseum(query, limit = 5) {
    try {
      const searchUrl = `${this.metApiBase}/search?q=${encodeURIComponent(query)}&hasImages=true`;
      const searchResponse = await fetch(searchUrl);
      
      if (!searchResponse.ok) return [];
      
      const searchData = await searchResponse.json();
      if (!searchData.objectIDs || searchData.objectIDs.length === 0) return [];
      
      const objectIds = searchData.objectIDs.slice(0, limit);
      const objects = [];
      
      for (const id of objectIds) {
        try {
          const objectUrl = `${this.metApiBase}/objects/${id}`;
          const objectResponse = await fetch(objectUrl);
          
          if (objectResponse.ok) {
            const objectData = await objectResponse.json();
            if (objectData.primaryImageSmall) {
              objects.push({
                id: objectData.objectID,
                title: objectData.title || 'Untitled',
                image: objectData.primaryImageSmall,
                imageLarge: objectData.primaryImage,
                date: objectData.objectDate || '',
                culture: objectData.culture || '',
                department: objectData.department || '',
                medium: objectData.medium || '',
                metUrl: objectData.objectURL
              });
            }
          }
        } catch (err) {
          continue;
        }
      }
      
      return objects;
    } catch (error) {
      console.error(`Search error for "${query}":`, error.message);
      return [];
    }
  }

  /**
   * Search Wikimedia Commons for images
   */
  async searchWikimedia(query, limit = 5) {
    try {
      const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(query + ' filetype:bitmap')}&srnamespace=6&srlimit=${limit}`;
      
      const response = await fetch(url);
      if (!response.ok) return [];
      
      const data = await response.json();
      if (!data.query || !data.query.search) return [];
      
      const images = [];
      for (const result of data.query.search) {
        const imageInfoUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&titles=${encodeURIComponent(result.title)}&iiprop=url|size|mime&iiurlwidth=800`;
        
        try {
          const imageResponse = await fetch(imageInfoUrl);
          const imageData = await imageResponse.json();
          const pages = imageData.query.pages;
          const pageId = Object.keys(pages)[0];
          
          if (pages[pageId].imageinfo && pages[pageId].imageinfo[0]) {
            const imageInfo = pages[pageId].imageinfo[0];
            images.push({
              title: result.title.replace('File:', ''),
              image: imageInfo.thumburl || imageInfo.url,
              imageLarge: imageInfo.url,
              width: imageInfo.width,
              height: imageInfo.height,
              source: 'Wikimedia Commons'
            });
          }
        } catch (err) {
          continue;
        }
      }
      
      return images;
    } catch (error) {
      console.error(`Wikimedia search error for "${query}":`, error.message);
      return [];
    }
  }

  /**
   * Download image
   */
  async downloadImage(url, filepath) {
    try {
      const response = await fetch(url);
      if (!response.ok) return false;
      
      const buffer = await response.buffer();
      await fs.writeFile(filepath, buffer);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Find and download images for a civilization
   */
  async processCivilization(civilization, imageNeeds) {
    console.log(`\n🏛️ Processing ${civilization.toUpperCase()}`);
    const civDir = path.join(this.outputDir, civilization);
    const downloaded = [];
    
    for (const need of imageNeeds) {
      console.log(`  🔍 Searching for: ${need.caption}`);
      
      // Search multiple sources
      const metResults = await this.searchMetMuseum(need.query, 3);
      const wikiResults = await this.searchWikimedia(need.query, 2);
      
      const allResults = [...metResults, ...wikiResults];
      
      if (allResults.length > 0) {
        // Download the first good result
        for (let i = 0; i < Math.min(allResults.length, 3); i++) {
          const result = allResults[i];
          const filename = `${need.id}_${i+1}.jpg`;
          const filepath = path.join(civDir, filename);
          
          const success = await this.downloadImage(result.image, filepath);
          if (success) {
            console.log(`    ✅ Downloaded: ${result.title.substring(0, 50)}...`);
            downloaded.push({
              civilization,
              imageId: need.id,
              caption: need.caption,
              filename,
              source: result.source || 'Met Museum',
              title: result.title,
              url: result.image
            });
            break;
          }
        }
      } else {
        console.log(`    ⚠️ No results found`);
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return downloaded;
  }

  /**
   * Update HTML with downloaded images
   */
  async updateHTML(downloadedImages) {
    let htmlContent = await fs.readFile(this.htmlPath, 'utf-8');
    
    // Group images by civilization
    const imagesByCiv = {};
    for (const img of downloadedImages) {
      if (!imagesByCiv[img.civilization]) {
        imagesByCiv[img.civilization] = [];
      }
      imagesByCiv[img.civilization].push(img);
    }
    
    // Update each civilization section
    for (const [civ, images] of Object.entries(imagesByCiv)) {
      console.log(`\n📝 Updating ${civ} section with ${images.length} images`);
      
      for (const img of images) {
        // Find the corresponding placeholder and replace it
        const placeholderRegex = new RegExp(
          `<div class="image-placeholder">[^<]*</div>\\s*<div class="image-caption">${img.caption.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</div>`,
          'g'
        );
        
        const replacement = `<img src="./VISUAL_CURRICULUM_IMAGES/${img.civilization}/${img.filename}" alt="${img.caption}" class="gallery-image" />
                <div class="image-caption">${img.caption}</div>`;
        
        htmlContent = htmlContent.replace(placeholderRegex, replacement);
      }
    }
    
    // Add CSS for images if not present
    if (!htmlContent.includes('.gallery-image')) {
      const cssAddition = `
        .gallery-image {
            width: 100%;
            height: 250px;
            object-fit: cover;
        }`;
      
      htmlContent = htmlContent.replace('</style>', cssAddition + '\n    </style>');
    }
    
    // Save updated HTML
    const updatedPath = path.join(this.outputDir, 'visual_curriculum_explorer_populated.html');
    await fs.writeFile(updatedPath, htmlContent);
    
    console.log(`\n📄 Updated HTML saved to: ${updatedPath}`);
    return updatedPath;
  }

  /**
   * Generate report
   */
  async generateReport(downloadedImages) {
    const report = {
      timestamp: new Date().toISOString(),
      totalImages: downloadedImages.length,
      byCivilization: {},
      missingImages: []
    };
    
    // Count images per civilization
    for (const civ of Object.keys(this.civilizationImages)) {
      const civImages = downloadedImages.filter(img => img.civilization === civ);
      const needed = this.civilizationImages[civ].length;
      const found = civImages.length;
      
      report.byCivilization[civ] = {
        needed,
        found,
        percentage: Math.round((found / needed) * 100)
      };
      
      // Find missing images
      for (const need of this.civilizationImages[civ]) {
        if (!civImages.some(img => img.imageId === need.id)) {
          report.missingImages.push({
            civilization: civ,
            caption: need.caption,
            query: need.query
          });
        }
      }
    }
    
    // Save JSON report
    const reportPath = path.join(this.outputDir, 'population_report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    // Generate HTML report
    const htmlReport = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Visual Curriculum Image Population Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
            margin: 0;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 25px 75px rgba(0,0,0,0.3);
        }
        h1 {
            color: #2d3748;
            font-size: 2.5em;
            border-bottom: 4px solid #667eea;
            padding-bottom: 15px;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        .stat-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
        }
        .stat-value {
            font-size: 2.5em;
            font-weight: bold;
            color: #667eea;
        }
        .stat-label {
            color: #6c757d;
            margin-top: 5px;
        }
        .civ-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 30px;
        }
        .civ-card {
            background: white;
            border: 1px solid #e9ecef;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .civ-name {
            font-size: 1.3em;
            font-weight: bold;
            color: #2d3748;
            text-transform: capitalize;
            margin-bottom: 15px;
        }
        .progress-bar {
            background: #e9ecef;
            height: 10px;
            border-radius: 5px;
            overflow: hidden;
            margin: 10px 0;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #667eea, #764ba2);
            transition: width 0.3s;
        }
        .civ-stats {
            display: flex;
            justify-content: space-between;
            margin-top: 10px;
            font-size: 0.9em;
            color: #6c757d;
        }
        .missing-section {
            margin-top: 40px;
            padding: 20px;
            background: #fff5f5;
            border-radius: 10px;
            border: 1px solid #ffc1c1;
        }
        .missing-title {
            font-size: 1.3em;
            font-weight: bold;
            color: #c53030;
            margin-bottom: 15px;
        }
        .missing-item {
            padding: 8px;
            margin: 5px 0;
            background: white;
            border-left: 3px solid #fc8181;
            border-radius: 3px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📚 Visual Curriculum Image Population Report</h1>
        <p style="color: #6c757d;">Generated: ${new Date(report.timestamp).toLocaleString()}</p>
        
        <div class="summary">
            <div class="stat-card">
                <div class="stat-value">${report.totalImages}</div>
                <div class="stat-label">Total Images Downloaded</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${Object.keys(report.byCivilization).length}</div>
                <div class="stat-label">Civilizations</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${Math.round(report.totalImages / Object.values(report.byCivilization).reduce((sum, c) => sum + c.needed, 0) * 100)}%</div>
                <div class="stat-label">Overall Coverage</div>
            </div>
        </div>
        
        <h2>Coverage by Civilization</h2>
        <div class="civ-grid">
            ${Object.entries(report.byCivilization).map(([civ, data]) => `
                <div class="civ-card">
                    <div class="civ-name">${civ}</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${data.percentage}%"></div>
                    </div>
                    <div class="civ-stats">
                        <span>Found: ${data.found}/${data.needed}</span>
                        <span>${data.percentage}%</span>
                    </div>
                </div>
            `).join('')}
        </div>
        
        ${report.missingImages.length > 0 ? `
            <div class="missing-section">
                <div class="missing-title">⚠️ Missing Images (${report.missingImages.length})</div>
                ${report.missingImages.map(img => `
                    <div class="missing-item">
                        <strong>${img.civilization}:</strong> ${img.caption}
                    </div>
                `).join('')}
            </div>
        ` : ''}
    </div>
</body>
</html>`;
    
    const htmlReportPath = path.join(this.outputDir, 'population_report.html');
    await fs.writeFile(htmlReportPath, htmlReport);
    
    return { reportPath, htmlReportPath };
  }

  /**
   * Run the complete population process
   */
  async populate() {
    console.log('🚀 Starting Visual Curriculum Image Population\n');
    console.log('=' .repeat(60));
    
    try {
      // Initialize directories
      await this.initDirectories();
      
      // Process each civilization (limiting to first 3 for testing)
      const allDownloaded = [];
      const civilizations = Object.entries(this.civilizationImages).slice(0, 3); // Only first 3
      for (const [civ, imageNeeds] of civilizations) {
        const downloaded = await this.processCivilization(civ, imageNeeds);
        allDownloaded.push(...downloaded);
      }
      
      console.log(`\n✅ Downloaded ${allDownloaded.length} total images`);
      
      // Update HTML
      const updatedHtmlPath = await this.updateHTML(allDownloaded);
      
      // Generate report
      const { reportPath, htmlReportPath } = await this.generateReport(allDownloaded);
      
      console.log('\n' + '=' .repeat(60));
      console.log('✨ Population Complete!');
      console.log(`  📁 Images saved in: ${this.outputDir}`);
      console.log(`  📄 Updated HTML: ${updatedHtmlPath}`);
      console.log(`  📊 Report: ${htmlReportPath}`);
      console.log('\nTo view the updated curriculum explorer:');
      console.log(`  open "${updatedHtmlPath}"`);
      console.log('\nTo view the report:');
      console.log(`  open "${htmlReportPath}"`);
      
      return { totalImages: allDownloaded.length, updatedHtmlPath, htmlReportPath };
      
    } catch (error) {
      console.error('❌ Population failed:', error);
      throw error;
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const populator = new VisualCurriculumImagePopulator();
  populator.populate()
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export default VisualCurriculumImagePopulator;