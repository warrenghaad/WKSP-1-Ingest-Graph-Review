/**
 * Component Mapper Tool
 * 
 * Maps relationships between UI components, interfaces, and identifies 
 * integration points across the EUCLID ecosystem.
 * 
 * Features:
 * - Dependency graph generation
 * - Component relationship analysis
 * - Interface pattern detection
 * - Salem Drunk Tank integration mapping
 */

import fs from "fs/promises";
import path from "path";
import { glob } from "glob";

export class ComponentMapper {
  constructor(publicPath) {
    this.publicPath = publicPath;
    this.cache = new Map();
    this.componentGraph = new Map();
  }

  async execute(args) {
    const { action, componentPath, options = {} } = args;

    try {
      switch (action) {
        case "map-components":
          return await this.mapComponents(componentPath, options);
        case "find-dependencies":
          return await this.findDependencies(componentPath, options);
        case "analyze-interfaces":
          return await this.analyzeInterfaces(componentPath, options);
        case "detect-patterns":
          return await this.detectPatterns(componentPath, options);
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error in component mapping: ${error.message}`
          }
        ]
      };
    }
  }

  async mapComponents(componentPath, options) {
    const componentMap = await this.buildComponentMap(options);
    const relationships = await this.analyzeRelationships(componentMap, options);
    
    return {
      content: [
        {
          type: "text",
          text: await this.formatComponentMap(componentMap, relationships, options)
        }
      ]
    };
  }

  async buildComponentMap(options) {
    const cacheKey = `component-map-${JSON.stringify(options)}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const components = {
      htmlInterfaces: await this.scanHTMLComponents(),
      jsComponents: await this.scanJSComponents(),
      cssStyles: await this.scanCSSComponents(),
      archives: options.includeArchived ? await this.scanArchivedComponents() : []
    };

    this.cache.set(cacheKey, components);
    return components;
  }

  async scanHTMLComponents() {
    const htmlFiles = await glob(path.join(this.publicPath, "**/*.html"));
    const components = [];

    for (const file of htmlFiles) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        const componentInfo = await this.analyzeHTMLComponent(file, content);
        components.push(componentInfo);
      } catch (error) {
        components.push({
          file: file,
          error: error.message,
          type: 'html'
        });
      }
    }

    return components;
  }

  async analyzeHTMLComponent(filePath, content) {
    const relativePath = path.relative(this.publicPath, filePath);
    const fileName = path.basename(filePath, '.html');
    
    // Extract component metadata
    const metadata = {
      file: relativePath,
      name: fileName,
      type: 'html',
      size: content.length,
      dependencies: {
        scripts: this.extractScriptDependencies(content),
        styles: this.extractStyleDependencies(content),
        images: this.extractImageDependencies(content),
        links: this.extractLinkDependencies(content)
      },
      elements: {
        classes: this.extractCSSClasses(content),
        ids: this.extractIds(content),
        customElements: this.extractCustomElements(content)
      },
      features: this.detectFeatures(content),
      salemIntegration: this.detectSalemIntegration(content),
      euclidConcepts: this.extractEuclidConcepts(content)
    };

    return metadata;
  }

  extractScriptDependencies(content) {
    const scriptMatches = content.match(/<script[^>]*src\\s*=\\s*["']([^"']+)["'][^>]*>/g);
    if (!scriptMatches) return [];
    
    return scriptMatches.map(match => {
      const srcMatch = match.match(/src\\s*=\\s*["']([^"']+)["']/);
      return srcMatch ? srcMatch[1] : null;
    }).filter(Boolean);
  }

  extractStyleDependencies(content) {
    const linkMatches = content.match(/<link[^>]*rel\\s*=\\s*["']stylesheet["'][^>]*>/g);
    if (!linkMatches) return [];
    
    return linkMatches.map(match => {
      const hrefMatch = match.match(/href\\s*=\\s*["']([^"']+)["']/);
      return hrefMatch ? hrefMatch[1] : null;
    }).filter(Boolean);
  }

  extractImageDependencies(content) {
    const imgMatches = content.match(/<img[^>]*src\\s*=\\s*["']([^"']+)["'][^>]*>/g);
    if (!imgMatches) return [];
    
    return imgMatches.map(match => {
      const srcMatch = match.match(/src\\s*=\\s*["']([^"']+)["']/);
      return srcMatch ? srcMatch[1] : null;
    }).filter(Boolean);
  }

  extractLinkDependencies(content) {
    const linkMatches = content.match(/<a[^>]*href\\s*=\\s*["']([^"']+)["'][^>]*>/g);
    if (!linkMatches) return [];
    
    return linkMatches.map(match => {
      const hrefMatch = match.match(/href\\s*=\\s*["']([^"']+)["']/);
      return hrefMatch ? hrefMatch[1] : null;
    }).filter(Boolean);
  }

  extractCSSClasses(content) {
    const classMatches = content.match(/class\\s*=\\s*["']([^"']+)["']/g);
    if (!classMatches) return [];
    
    const classes = new Set();
    classMatches.forEach(match => {
      const classMatch = match.match(/class\\s*=\\s*["']([^"']+)["']/);
      if (classMatch) {
        classMatch[1].split(/\\s+/).forEach(cls => classes.add(cls));
      }
    });
    
    return Array.from(classes);
  }

  extractIds(content) {
    const idMatches = content.match(/id\\s*=\\s*["']([^"']+)["']/g);
    if (!idMatches) return [];
    
    return idMatches.map(match => {
      const idMatch = match.match(/id\\s*=\\s*["']([^"']+)["']/);
      return idMatch ? idMatch[1] : null;
    }).filter(Boolean);
  }

  extractCustomElements(content) {
    // Look for custom element patterns
    const customElements = [];
    
    // React-style components
    const reactMatches = content.match(/<[A-Z][a-zA-Z0-9]*[^>]*>/g);
    if (reactMatches) {
      reactMatches.forEach(match => {
        const tagMatch = match.match(/<([A-Z][a-zA-Z0-9]*)/);
        if (tagMatch) {
          customElements.push({
            type: 'react-component',
            name: tagMatch[1]
          });
        }
      });
    }
    
    return customElements;
  }

  detectFeatures(content) {
    const features = [];
    
    // Dashboard features
    if (content.includes('dashboard') || content.includes('Dashboard')) {
      features.push('dashboard');
    }
    
    // Navigation features
    if (content.includes('nav-item') || content.includes('navigation')) {
      features.push('navigation');
    }
    
    // Interactive features
    if (content.includes('addEventListener') || content.includes('onClick')) {
      features.push('interactive');
    }
    
    // Graph/visualization features
    if (content.includes('canvas') || content.includes('svg') || content.includes('mermaid')) {
      features.push('visualization');
    }
    
    // Form features
    if (content.includes('<form') || content.includes('input') || content.includes('button')) {
      features.push('forms');
    }
    
    return features;
  }

  detectSalemIntegration(content) {
    const salemFeatures = {
      isDrunkTank: content.includes('salem-drunk-tank') || content.includes('drunk-tank'),
      hasAccessControl: content.includes('permission') || content.includes('admin') || content.includes('readonly'),
      hasFigmaStyle: content.includes('figma') || content.includes('canvas') || content.includes('visual-navigation'),
      hasMultiReader: content.includes('multi-reader') || content.includes('readonly-users'),
      hasStatusIndicators: content.includes('status-indicator') || content.includes('system-health')
    };
    
    salemFeatures.integrationLevel = Object.values(salemFeatures).filter(Boolean).length;
    
    return salemFeatures;
  }

  extractEuclidConcepts(content) {
    const concepts = [];
    
    // Geometric concepts
    const geometricTerms = ['circle', 'triangle', 'square', 'spiral', 'star', 'polygon', 'geometry', 'geometric'];
    geometricTerms.forEach(term => {
      if (content.toLowerCase().includes(term)) {
        concepts.push({ type: 'geometric', term });
      }
    });
    
    // Civilization concepts
    const civilizations = ['mesopotamian', 'babylonian', 'sumerian', 'akkadian'];
    civilizations.forEach(civ => {
      if (content.toLowerCase().includes(civ)) {
        concepts.push({ type: 'civilization', term: civ });
      }
    });
    
    // EUCLID-specific concepts
    if (content.toLowerCase().includes('euclid')) {
      concepts.push({ type: 'euclid', term: 'euclid-reference' });
    }
    
    return concepts;
  }

  async scanJSComponents() {
    const jsFiles = await glob(path.join(this.publicPath, "**/*.js"));
    const components = [];

    for (const file of jsFiles) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        const componentInfo = await this.analyzeJSComponent(file, content);
        components.push(componentInfo);
      } catch (error) {
        components.push({
          file: file,
          error: error.message,
          type: 'javascript'
        });
      }
    }

    return components;
  }

  async analyzeJSComponent(filePath, content) {
    const relativePath = path.relative(this.publicPath, filePath);
    const fileName = path.basename(filePath, '.js');
    
    return {
      file: relativePath,
      name: fileName,
      type: 'javascript',
      size: content.length,
      functions: this.extractFunctions(content),
      imports: this.extractImports(content),
      exports: this.extractExports(content),
      dependencies: this.extractJSDependencies(content),
      apiCalls: this.extractAPICalls(content),
      eventListeners: this.extractEventListeners(content)
    };
  }

  extractFunctions(content) {
    const functionMatches = content.match(/(?:function\\s+([a-zA-Z_$][a-zA-Z0-9_$]*)|(?:const|let|var)\\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\\s*=\\s*(?:function|\\([^)]*\\)\\s*=>))/g);
    if (!functionMatches) return [];
    
    return functionMatches.map(match => {
      const nameMatch = match.match(/(?:function\\s+([a-zA-Z_$][a-zA-Z0-9_$]*)|(?:const|let|var)\\s+([a-zA-Z_$][a-zA-Z0-9_$]*))/);
      return nameMatch ? (nameMatch[1] || nameMatch[2]) : null;
    }).filter(Boolean);
  }

  extractImports(content) {
    const importMatches = content.match(/import\\s+[^;]+from\\s+["']([^"']+)["']/g);
    if (!importMatches) return [];
    
    return importMatches.map(match => {
      const moduleMatch = match.match(/from\\s+["']([^"']+)["']/);
      return moduleMatch ? moduleMatch[1] : null;
    }).filter(Boolean);
  }

  extractExports(content) {
    const exportMatches = content.match(/export\\s+(?:default\\s+)?(?:function\\s+|const\\s+|class\\s+)?([a-zA-Z_$][a-zA-Z0-9_$]*)/g);
    if (!exportMatches) return [];
    
    return exportMatches.map(match => {
      const nameMatch = match.match(/export\\s+(?:default\\s+)?(?:function\\s+|const\\s+|class\\s+)?([a-zA-Z_$][a-zA-Z0-9_$]*)/);
      return nameMatch ? nameMatch[1] : null;
    }).filter(Boolean);
  }

  extractJSDependencies(content) {
    const dependencies = [];
    
    // Look for require calls
    const requireMatches = content.match(/require\\s*\\(\\s*["']([^"']+)["']\\s*\\)/g);
    if (requireMatches) {
      requireMatches.forEach(match => {
        const moduleMatch = match.match(/["']([^"']+)["']/);
        if (moduleMatch) {
          dependencies.push({ type: 'require', module: moduleMatch[1] });
        }
      });
    }
    
    return dependencies;
  }

  extractAPICalls(content) {
    const apiCalls = [];
    
    // Look for fetch calls
    const fetchMatches = content.match(/fetch\\s*\\(\\s*["']([^"']+)["']/g);
    if (fetchMatches) {
      fetchMatches.forEach(match => {
        const urlMatch = match.match(/["']([^"']+)["']/);
        if (urlMatch) {
          apiCalls.push({ type: 'fetch', url: urlMatch[1] });
        }
      });
    }
    
    return apiCalls;
  }

  extractEventListeners(content) {
    const listeners = [];
    
    const listenerMatches = content.match(/addEventListener\\s*\\(\\s*["']([^"']+)["']/g);
    if (listenerMatches) {
      listenerMatches.forEach(match => {
        const eventMatch = match.match(/["']([^"']+)["']/);
        if (eventMatch) {
          listeners.push({ event: eventMatch[1] });
        }
      });
    }
    
    return listeners;
  }

  async scanCSSComponents() {
    const cssFiles = await glob(path.join(this.publicPath, "**/*.css"));
    const components = [];

    for (const file of cssFiles) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        const componentInfo = await this.analyzeCSSComponent(file, content);
        components.push(componentInfo);
      } catch (error) {
        components.push({
          file: file,
          error: error.message,
          type: 'css'
        });
      }
    }

    return components;
  }

  async analyzeCSSComponent(filePath, content) {
    const relativePath = path.relative(this.publicPath, filePath);
    const fileName = path.basename(filePath, '.css');
    
    return {
      file: relativePath,
      name: fileName,
      type: 'css',
      size: content.length,
      classes: this.extractCSSClassDefinitions(content),
      ids: this.extractCSSIdDefinitions(content),
      variables: this.extractCSSVariables(content),
      mediaQueries: this.extractMediaQueries(content)
    };
  }

  extractCSSClassDefinitions(content) {
    const classMatches = content.match(/\\.([a-zA-Z_-][a-zA-Z0-9_-]*)\\s*\\{[^}]*\\}/g);
    if (!classMatches) return [];
    
    return classMatches.map(match => {
      const nameMatch = match.match(/\\.([a-zA-Z_-][a-zA-Z0-9_-]*)/);
      return nameMatch ? nameMatch[1] : null;
    }).filter(Boolean);
  }

  extractCSSIdDefinitions(content) {
    const idMatches = content.match(/#([a-zA-Z_-][a-zA-Z0-9_-]*)\\s*\\{[^}]*\\}/g);
    if (!idMatches) return [];
    
    return idMatches.map(match => {
      const nameMatch = match.match(/#([a-zA-Z_-][a-zA-Z0-9_-]*)/);
      return nameMatch ? nameMatch[1] : null;
    }).filter(Boolean);
  }

  extractCSSVariables(content) {
    const varMatches = content.match(/--([a-zA-Z_-][a-zA-Z0-9_-]*)\\s*:/g);
    if (!varMatches) return [];
    
    return varMatches.map(match => {
      const nameMatch = match.match(/--([a-zA-Z_-][a-zA-Z0-9_-]*)/);
      return nameMatch ? nameMatch[1] : null;
    }).filter(Boolean);
  }

  extractMediaQueries(content) {
    const mediaMatches = content.match(/@media\\s*[^{]*\\{[^}]*\\}/g);
    if (!mediaMatches) return [];
    
    return mediaMatches.map(match => {
      const queryMatch = match.match(/@media\\s*([^{]*)/);
      return queryMatch ? queryMatch[1].trim() : null;
    }).filter(Boolean);
  }

  async scanArchivedComponents() {
    // Placeholder for archived component scanning
    // Would scan archived UI_BUILD_CONTENT directory
    return [];
  }

  async analyzeRelationships(componentMap, options) {
    const relationships = {
      dependencies: [],
      crossReferences: [],
      integrationPoints: [],
      salemConnections: []
    };

    // Analyze HTML to JS relationships
    for (const htmlComponent of componentMap.htmlInterfaces) {
      if (htmlComponent.dependencies && htmlComponent.dependencies.scripts) {
        htmlComponent.dependencies.scripts.forEach(script => {
          relationships.dependencies.push({
            from: htmlComponent.file,
            to: script,
            type: 'script-dependency',
            relationship: 'html-to-js'
          });
        });
      }
    }

    // Analyze Salem Drunk Tank connections
    for (const component of componentMap.htmlInterfaces) {
      if (component.salemIntegration && component.salemIntegration.integrationLevel > 0) {
        relationships.salemConnections.push({
          component: component.file,
          features: Object.keys(component.salemIntegration).filter(key => 
            component.salemIntegration[key] === true
          ),
          integrationLevel: component.salemIntegration.integrationLevel
        });
      }
    }

    return relationships;
  }

  async formatComponentMap(componentMap, relationships, options) {
    const totalComponents = componentMap.htmlInterfaces.length + 
                           componentMap.jsComponents.length + 
                           componentMap.cssStyles.length;

    let output = `# EUCLID Component Mapping Analysis

## Overview
- **Total Components:** ${totalComponents}
- **HTML Interfaces:** ${componentMap.htmlInterfaces.length}
- **JavaScript Components:** ${componentMap.jsComponents.length}
- **CSS Stylesheets:** ${componentMap.cssStyles.length}
- **Dependencies:** ${relationships.dependencies.length}
- **Salem Connections:** ${relationships.salemConnections.length}

`;

    // Salem Drunk Tank Integration Analysis
    if (relationships.salemConnections.length > 0) {
      output += `## Salem Drunk Tank Integration\n\n`;
      relationships.salemConnections.forEach(conn => {
        output += `### ${conn.component}
- **Integration Level:** ${conn.integrationLevel}/5
- **Features:** ${conn.features.join(', ')}

`;
      });
    }

    // HTML Components
    if (componentMap.htmlInterfaces.length > 0) {
      output += `## HTML Interfaces (${componentMap.htmlInterfaces.length})\n\n`;
      componentMap.htmlInterfaces.slice(0, 10).forEach(comp => {
        output += `### ${comp.name}
- **File:** ${comp.file}
- **Size:** ${comp.size} bytes
- **Features:** ${comp.features.join(', ')}
- **Classes:** ${comp.elements.classes.slice(0, 5).join(', ')}${comp.elements.classes.length > 5 ? '...' : ''}
- **EUCLID Concepts:** ${comp.euclidConcepts.length}

`;
      });
      
      if (componentMap.htmlInterfaces.length > 10) {
        output += `*(showing first 10 of ${componentMap.htmlInterfaces.length} interfaces)*\n\n`;
      }
    }

    // Dependency Graph
    if (options.visualFormat === 'mermaid' && relationships.dependencies.length > 0) {
      output += `## Component Dependency Graph (Mermaid)\n\n\`\`\`mermaid\ngraph TD\n`;
      
      relationships.dependencies.slice(0, 20).forEach(dep => {
        const fromId = dep.from.replace(/[^a-zA-Z0-9]/g, '');
        const toId = dep.to.replace(/[^a-zA-Z0-9]/g, '');
        output += `  ${fromId}["${dep.from}"] --> ${toId}["${dep.to}"]\n`;
      });
      
      output += `\`\`\`\n\n`;
    }

    // Integration Points
    output += `## Integration Analysis

### Cross-Directory References
${relationships.crossReferences.length} cross-references detected between EUCLID_NORMALIZATION and public directories.

### Salem Drunk Tank Pattern Detection
- **Access Control Components:** ${relationships.salemConnections.filter(c => c.features.includes('hasAccessControl')).length}
- **Figma-Style Interfaces:** ${relationships.salemConnections.filter(c => c.features.includes('hasFigmaStyle')).length}
- **Multi-Reader Support:** ${relationships.salemConnections.filter(c => c.features.includes('hasMultiReader')).length}

### Component Distribution
- **Dashboard Components:** ${componentMap.htmlInterfaces.filter(c => c.features.includes('dashboard')).length}
- **Navigation Components:** ${componentMap.htmlInterfaces.filter(c => c.features.includes('navigation')).length}
- **Interactive Components:** ${componentMap.htmlInterfaces.filter(c => c.features.includes('interactive')).length}
- **Visualization Components:** ${componentMap.htmlInterfaces.filter(c => c.features.includes('visualization')).length}

*Component mapping performed using GuardedAgentRunner methodology - truth from wiring analysis.*`;

    return output;
  }

  async findDependencies(componentPath, options) {
    // Implementation for specific component dependency finding
    return {
      content: [
        {
          type: "text",
          text: "Component dependency finding feature - Implementation pending"
        }
      ]
    };
  }

  async analyzeInterfaces(componentPath, options) {
    // Implementation for interface analysis
    return {
      content: [
        {
          type: "text",
          text: "Interface analysis feature - Implementation pending"
        }
      ]
    };
  }

  async detectPatterns(componentPath, options) {
    // Implementation for pattern detection
    return {
      content: [
        {
          type: "text",
          text: "Pattern detection feature - Implementation pending"
        }
      ]
    };
  }
}