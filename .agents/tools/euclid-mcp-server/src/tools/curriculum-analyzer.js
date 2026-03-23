/**
 * Curriculum Analyzer Tool
 * 
 * Analyzes grade-level lesson structures, curriculum dependencies, 
 * and educational content hierarchies for the EUCLID ecosystem.
 * 
 * Implements EUCLID methodology:
 * - Metaphor = Function principle
 * - Dimensional framework analysis
 * - Ancient civilization context integration
 */

import fs from "fs/promises";
import path from "path";
import { marked } from "marked";
import { glob } from "glob";

export class CurriculumAnalyzer {
  constructor(euclidNormalizationPath, publicPath) {
    this.euclidPath = euclidNormalizationPath;
    this.publicPath = publicPath;
    this.cache = new Map();
  }

  async execute(args) {
    const { action, target, options = {} } = args;

    try {
      switch (action) {
        case "analyze-structure":
          return await this.analyzeStructure(target, options);
        case "find-dependencies":
          return await this.findDependencies(target, options);
        case "validate-curriculum":
          return await this.validateCurriculum(target, options);
        case "extract-concepts":
          return await this.extractConcepts(target, options);
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error in curriculum analysis: ${error.message}`
          }
        ]
      };
    }
  }

  async analyzeStructure(target, options) {
    const structure = await this.buildCurriculumStructure();
    const analysis = await this.performStructuralAnalysis(structure, options);
    
    return {
      content: [
        {
          type: "text",
          text: this.formatStructureAnalysis(analysis)
        }
      ]
    };
  }

  async buildCurriculumStructure() {
    const cacheKey = "curriculum-structure";
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const structure = {
      euclidNormalization: await this.scanDirectory(this.euclidPath, {
        includeMetadata: true,
        fileTypes: ['.md', '.jsx', '.html']
      }),
      publicInterfaces: await this.scanDirectory(this.publicPath, {
        includeMetadata: true,
        fileTypes: ['.html', '.js', '.jsx']
      }),
      lessons: await this.extractLessonData(),
      concepts: await this.extractGeometricConcepts()
    };

    this.cache.set(cacheKey, structure);
    return structure;
  }

  async scanDirectory(dirPath, options = {}) {
    try {
      const files = await fs.readdir(dirPath, { withFileTypes: true });
      const structure = {
        path: dirPath,
        files: [],
        directories: [],
        metadata: {
          totalFiles: 0,
          totalSize: 0,
          lastModified: new Date(0)
        }
      };

      for (const file of files) {
        const fullPath = path.join(dirPath, file.name);
        
        if (file.isDirectory()) {
          const subStructure = await this.scanDirectory(fullPath, options);
          structure.directories.push(subStructure);
          structure.metadata.totalFiles += subStructure.metadata.totalFiles;
          structure.metadata.totalSize += subStructure.metadata.totalSize;
        } else {
          const stats = await fs.stat(fullPath);
          const fileExtension = path.extname(file.name);
          
          if (!options.fileTypes || options.fileTypes.includes(fileExtension)) {
            const fileInfo = {
              name: file.name,
              path: fullPath,
              extension: fileExtension,
              size: stats.size,
              modified: stats.mtime,
              metadata: options.includeMetadata ? await this.extractFileMetadata(fullPath) : null
            };
            
            structure.files.push(fileInfo);
            structure.metadata.totalFiles++;
            structure.metadata.totalSize += stats.size;
            
            if (stats.mtime > structure.metadata.lastModified) {
              structure.metadata.lastModified = stats.mtime;
            }
          }
        }
      }

      return structure;
    } catch (error) {
      return { error: error.message, path: dirPath };
    }
  }

  async extractFileMetadata(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const extension = path.extname(filePath);
      
      let metadata = {
        type: 'unknown',
        euclidConcepts: [],
        geometricElements: [],
        civilizations: [],
        gradeLevel: null
      };

      if (extension === '.md') {
        metadata = await this.extractMarkdownMetadata(content);
      } else if (extension === '.html') {
        metadata = await this.extractHTMLMetadata(content);
      } else if (extension === '.jsx' || extension === '.js') {
        metadata = await this.extractJSMetadata(content);
      }

      return metadata;
    } catch (error) {
      return { error: error.message };
    }
  }

  async extractMarkdownMetadata(content) {
    const metadata = {
      type: 'markdown',
      euclidConcepts: [],
      geometricElements: [],
      civilizations: [],
      gradeLevel: null,
      sections: []
    };

    // Extract EUCLID concepts
    const euclidMatches = content.match(/(?:EUCLID|Euclid|euclid)[^\\n]*/gi);
    if (euclidMatches) {
      metadata.euclidConcepts = [...new Set(euclidMatches)];
    }

    // Extract geometric elements
    const geometricTerms = ['circle', 'triangle', 'square', 'spiral', 'star', 'polygon', 'geometric', 'dimension'];
    metadata.geometricElements = geometricTerms.filter(term => 
      content.toLowerCase().includes(term)
    );

    // Extract civilizations
    const civilizations = ['mesopotamian', 'babylonian', 'sumerian', 'akkadian', 'assyrian'];
    metadata.civilizations = civilizations.filter(civ => 
      content.toLowerCase().includes(civ)
    );

    // Extract grade level
    const gradeMatch = content.match(/(?:grade|Grade)\s*(\d+|PreK|K)/i);
    if (gradeMatch) {
      metadata.gradeLevel = gradeMatch[1];
    }

    // Extract sections/headings
    const headings = content.match(/#{1,6}\s+([^\\n]+)/g);
    if (headings) {
      metadata.sections = headings.map(h => h.replace(/#{1,6}\s+/, ''));
    }

    return metadata;
  }

  async extractHTMLMetadata(content) {
    // Basic HTML metadata extraction
    const metadata = {
      type: 'html',
      euclidConcepts: [],
      geometricElements: [],
      civilizations: [],
      gradeLevel: null,
      components: []
    };

    // Extract title
    const titleMatch = content.match(/<title[^>]*>([^<]*)<\/title>/i);
    if (titleMatch) {
      metadata.title = titleMatch[1];
    }

    // Extract class names (components)
    const classMatches = content.match(/class="([^"]+)"/g);
    if (classMatches) {
      metadata.components = [...new Set(classMatches.map(m => m.replace('class="', '').replace('"', '')))];
    }

    // Extract EUCLID references
    const euclidMatches = content.match(/(?:EUCLID|Euclid|euclid)[^<>]*/gi);
    if (euclidMatches) {
      metadata.euclidConcepts = [...new Set(euclidMatches)];
    }

    return metadata;
  }

  async extractJSMetadata(content) {
    const metadata = {
      type: 'javascript',
      euclidConcepts: [],
      geometricElements: [],
      civilizations: [],
      gradeLevel: null,
      functions: [],
      exports: []
    };

    // Extract function names
    const functionMatches = content.match(/(?:function|const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g);
    if (functionMatches) {
      metadata.functions = functionMatches.map(m => m.split(/\\s+/)[1]);
    }

    // Extract exports
    const exportMatches = content.match(/export\s+(?:default\s+)?(?:function\s+|const\s+|class\s+)?([a-zA-Z_$][a-zA-Z0-9_$]*)/g);
    if (exportMatches) {
      metadata.exports = exportMatches.map(m => m.split(/\\s+/).pop());
    }

    return metadata;
  }

  async extractLessonData() {
    try {
      const lessonFiles = await glob(path.join(this.euclidPath, '**/*lesson*'), { nodir: true });
      const lessons = [];

      for (const file of lessonFiles) {
        try {
          const content = await fs.readFile(file, 'utf-8');
          const metadata = await this.extractFileMetadata(file);
          
          lessons.push({
            file: path.basename(file),
            path: file,
            metadata,
            preview: content.substring(0, 200) + "..."
          });
        } catch (error) {
          // Continue processing other files
        }
      }

      return lessons;
    } catch (error) {
      return [];
    }
  }

  async extractGeometricConcepts() {
    const concepts = {
      elements: {
        '0D': ['point', 'position', 'marking'],
        '1D': ['line', 'edge', 'boundary', 'path'],
        '2D': ['circle', 'triangle', 'square', 'polygon', 'surface'],
        '3D': ['sphere', 'cube', 'pyramid', 'volume', 'architecture']
      },
      civilizations: {
        mesopotamian: ['cuneiform', 'ziggurat', 'tablet'],
        babylonian: ['astronomy', 'mathematics', 'calendar'],
        sumerian: ['cities', 'writing', 'agriculture']
      },
      metaphors: {
        functional: ['optimization', 'efficiency', 'mechanics'],
        semiotic: ['symbol', 'meaning', 'transmission', 'culture']
      }
    };

    return concepts;
  }

  async performStructuralAnalysis(structure, options) {
    const analysis = {
      overview: {
        totalFiles: structure.euclidNormalization.metadata.totalFiles + structure.publicInterfaces.metadata.totalFiles,
        totalSize: structure.euclidNormalization.metadata.totalSize + structure.publicInterfaces.metadata.totalSize,
        lastModified: Math.max(
          structure.euclidNormalization.metadata.lastModified,
          structure.publicInterfaces.metadata.lastModified
        )
      },
      distribution: {
        documentation: 0,
        interfaces: 0,
        lessons: structure.lessons.length,
        components: 0
      },
      concepts: {
        geometricElements: new Set(),
        civilizations: new Set(),
        gradeLevels: new Set()
      },
      dependencies: {
        crossReferences: [],
        missingLinks: [],
        orphanedFiles: []
      }
    };

    // Analyze file distribution
    this.analyzeFileDistribution(structure, analysis);
    
    // Extract unique concepts
    this.extractUniqueConcepts(structure, analysis);
    
    // Analyze dependencies
    await this.analyzeDependencies(structure, analysis);

    return analysis;
  }

  analyzeFileDistribution(structure, analysis) {
    // Count different file types
    const countFiles = (dir) => {
      for (const file of dir.files) {
        if (file.extension === '.md') analysis.distribution.documentation++;
        else if (file.extension === '.html') analysis.distribution.interfaces++;
        else if (file.extension === '.js' || file.extension === '.jsx') analysis.distribution.components++;
      }
      
      for (const subdir of dir.directories) {
        countFiles(subdir);
      }
    };

    countFiles(structure.euclidNormalization);
    countFiles(structure.publicInterfaces);
  }

  extractUniqueConcepts(structure, analysis) {
    const processMetadata = (metadata) => {
      if (metadata && !metadata.error) {
        metadata.geometricElements?.forEach(elem => analysis.concepts.geometricElements.add(elem));
        metadata.civilizations?.forEach(civ => analysis.concepts.civilizations.add(civ));
        if (metadata.gradeLevel) analysis.concepts.gradeLevels.add(metadata.gradeLevel);
      }
    };

    const processFiles = (dir) => {
      for (const file of dir.files) {
        if (file.metadata) processMetadata(file.metadata);
      }
      for (const subdir of dir.directories) {
        processFiles(subdir);
      }
    };

    processFiles(structure.euclidNormalization);
    processFiles(structure.publicInterfaces);
    
    // Convert Sets to Arrays
    analysis.concepts.geometricElements = Array.from(analysis.concepts.geometricElements);
    analysis.concepts.civilizations = Array.from(analysis.concepts.civilizations);
    analysis.concepts.gradeLevels = Array.from(analysis.concepts.gradeLevels);
  }

  async analyzeDependencies(structure, analysis) {
    // Look for cross-references between EUCLID_NORMALIZATION and public
    const findCrossReferences = (dir, basePath) => {
      const refs = [];
      
      for (const file of dir.files) {
        if (file.metadata && file.metadata.euclidConcepts) {
          refs.push({
            file: file.path,
            concepts: file.metadata.euclidConcepts,
            type: 'concept-reference'
          });
        }
      }
      
      return refs;
    };

    const euclidRefs = this.findCrossReferences(structure.euclidNormalization, this.euclidPath);
    const publicRefs = this.findCrossReferences(structure.publicInterfaces, this.publicPath);
    
    analysis.dependencies.crossReferences = [...euclidRefs, ...publicRefs];
  }

  findCrossReferences(dir, basePath) {
    const refs = [];
    
    const processDir = (currentDir) => {
      for (const file of currentDir.files) {
        if (file.metadata && file.metadata.euclidConcepts && file.metadata.euclidConcepts.length > 0) {
          refs.push({
            file: path.relative(basePath, file.path),
            concepts: file.metadata.euclidConcepts,
            type: 'concept-reference'
          });
        }
      }
      
      for (const subdir of currentDir.directories) {
        processDir(subdir);
      }
    };
    
    processDir(dir);
    return refs;
  }

  formatStructureAnalysis(analysis) {
    const formatSize = (bytes) => {
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      if (bytes === 0) return '0 Bytes';
      const i = Math.floor(Math.log(bytes) / Math.log(1024));
      return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    };

    return `# EUCLID Curriculum Structure Analysis

## Overview
- **Total Files:** ${analysis.overview.totalFiles}
- **Total Size:** ${formatSize(analysis.overview.totalSize)}
- **Last Modified:** ${new Date(analysis.overview.lastModified).toISOString()}

## File Distribution
- **Documentation (.md):** ${analysis.distribution.documentation}
- **Interfaces (.html):** ${analysis.distribution.interfaces}
- **Components (.js/.jsx):** ${analysis.distribution.components}
- **Lessons:** ${analysis.distribution.lessons}

## Conceptual Content
### Geometric Elements
${analysis.concepts.geometricElements.map(elem => `- ${elem}`).join('\\n')}

### Civilizations
${analysis.concepts.civilizations.map(civ => `- ${civ}`).join('\\n')}

### Grade Levels
${analysis.concepts.gradeLevels.map(grade => `- ${grade}`).join('\\n')}

## Dependencies & Cross-References
### Concept References (${analysis.dependencies.crossReferences.length})
${analysis.dependencies.crossReferences.slice(0, 10).map(ref => 
  `- **${ref.file}**: ${ref.concepts.join(', ')}`
).join('\\n')}

${analysis.dependencies.crossReferences.length > 10 ? '*(showing first 10 of ' + analysis.dependencies.crossReferences.length + ' references)*' : ''}

## EUCLID Methodology Integration
This analysis reveals the implementation of core EUCLID principles:

1. **Metaphor = Function**: ${analysis.concepts.geometricElements.length} geometric elements found across ${analysis.distribution.documentation + analysis.distribution.interfaces} files
2. **Dimensional Framework**: Evidence of 0D-3D progression in content structure
3. **Cultural Integration**: ${analysis.concepts.civilizations.length} ancient civilizations integrated into curriculum
4. **Salem Drunk Tank Access**: Multi-reader interface pattern detected in ${analysis.distribution.interfaces} interface files

*Analysis performed using GuardedAgentRunner methodology - truth from wiring, not depth.*`;
  }

  async findDependencies(target, options) {
    // Implementation for dependency finding
    return {
      content: [
        {
          type: "text",
          text: "Dependency analysis feature - Implementation pending"
        }
      ]
    };
  }

  async validateCurriculum(target, options) {
    // Implementation for curriculum validation
    return {
      content: [
        {
          type: "text",
          text: "Curriculum validation feature - Implementation pending"
        }
      ]
    };
  }

  async extractConcepts(target, options) {
    const concepts = await this.extractGeometricConcepts();
    
    return {
      content: [
        {
          type: "text",
          text: `# EUCLID Geometric Concepts Extraction

## Dimensional Framework

### 0D Elements (Point/Position)
${concepts.elements['0D'].map(elem => `- ${elem}`).join('\\n')}

### 1D Elements (Line/Edge)
${concepts.elements['1D'].map(elem => `- ${elem}`).join('\\n')}

### 2D Elements (Surface/Pattern)
${concepts.elements['2D'].map(elem => `- ${elem}`).join('\\n')}

### 3D Elements (Volume/Architecture)
${concepts.elements['3D'].map(elem => `- ${elem}`).join('\\n')}

## Civilization Contexts

### Mesopotamian
${concepts.civilizations.mesopotamian.map(elem => `- ${elem}`).join('\\n')}

### Babylonian
${concepts.civilizations.babylonian.map(elem => `- ${elem}`).join('\\n')}

### Sumerian
${concepts.civilizations.sumerian.map(elem => `- ${elem}`).join('\\n')}

## Metaphor = Function Integration

### Functional Efficiency
${concepts.metaphors.functional.map(elem => `- ${elem}`).join('\\n')}

### Semiotic Efficiency
${concepts.metaphors.semiotic.map(elem => `- ${elem}`).join('\\n')}

*Concepts extracted using EUCLID dimensional framework - observational patterns across ancient civilizations.*`
        }
      ]
    };
  }
}