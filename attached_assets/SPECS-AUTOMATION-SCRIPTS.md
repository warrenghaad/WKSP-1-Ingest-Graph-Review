# AUTOMATION SCRIPTS - DETAILED SPECIFICATIONS
## For Friday Delivery - Mesopotamia Pilot Completion

---

## FILE 1: universal-parser.js

### Purpose
Parse any file type (MD, URL, PDF, JSON, DOCX) into structured ContentItem format

### Dependencies
```javascript
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter'; // YAML frontmatter
import fetch from 'node-fetch'; // URL fetching
import { createContentItem, createSource } from './dao.js';
```

### Function Signature
```javascript
async function parseFile(filePath, options = {})
```

### Inputs
- `filePath`: string (file path or URL)
- `options`: object
  - `type`: 'markdown' | 'url' | 'pdf' | 'json' | 'auto' (default: 'auto')
  - `extractSections`: boolean (default: true)
  - `saveToDatabase`: boolean (default: false)
  - `audience`: string (default: 'teacher')

### Outputs
```javascript
{
  success: boolean,
  contentItem: {
    type: 'lesson' | 'section' | 'note',
    title: string,
    summary: string,
    body: {...}, // JSONB structured blocks
    tags: {
      topics: string[],
      civ: string[],
      deities: string[],
      grade_bands: number[]
    },
    metadata: {
      source_type: string,
      source_path: string,
      parsed_at: timestamp
    }
  },
  sections: ContentItem[], // If extractSections=true
  warnings: string[]
}
```

### Algorithm

```javascript
async function parseFile(filePath, options) {
  // 1. Detect file type
  const fileType = options.type || detectFileType(filePath);

  // 2. Route to appropriate parser
  let rawContent;
  switch (fileType) {
    case 'markdown':
      rawContent = await parseMarkdown(filePath);
      break;
    case 'url':
      rawContent = await fetchAndParseURL(filePath);
      break;
    case 'pdf':
      rawContent = await parsePDF(filePath); // Stub for Friday
      break;
    case 'json':
      rawContent = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      break;
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }

  // 3. Extract metadata (YAML frontmatter if exists)
  const { data: metadata, content } = matter(rawContent);

  // 4. Parse sections if markdown lesson
  let sections = [];
  if (options.extractSections && fileType === 'markdown') {
    sections = extractSections(content);
  }

  // 5. Build structured ContentItem
  const contentItem = {
    type: inferType(content, metadata),
    title: metadata.title || extractTitle(content),
    summary: metadata.summary || extractSummary(content),
    body: parseBodyToBlocks(content),
    tags: extractTags(content, metadata),
    metadata: {
      source_type: fileType,
      source_path: filePath,
      parsed_at: new Date().toISOString()
    }
  };

  // 6. Save to database if requested
  if (options.saveToDatabase) {
    const saved = await createContentItem(contentItem);
    contentItem.id = saved.id;

    // Save sections as children
    for (const section of sections) {
      section.parent_id = saved.id;
      await createContentItem(section);
    }
  }

  return {
    success: true,
    contentItem,
    sections,
    warnings: []
  };
}
```

### Key Functions to Implement

#### detectFileType(filePath)
```javascript
function detectFileType(filePath) {
  if (filePath.startsWith('http')) return 'url';
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.md') return 'markdown';
  if (ext === '.pdf') return 'pdf';
  if (ext === '.json') return 'json';
  throw new Error(`Cannot detect type for: ${filePath}`);
}
```

#### parseMarkdown(filePath)
```javascript
async function parseMarkdown(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}
```

#### extractSections(content)
```javascript
function extractSections(content) {
  const sections = [];
  const lines = content.split('\n');
  let currentSection = null;
  let currentContent = [];

  for (const line of lines) {
    // Match ## A1: Title or ## B1: Title
    const match = line.match(/^## ([AB]\d+)[:\s]*(.+?)$/);

    if (match) {
      // Save previous section
      if (currentSection) {
        sections.push({
          type: 'section',
          title: currentSection.title,
          body: { text: currentContent.join('\n').trim() },
          tags: { section_code: currentSection.code },
          metadata: { order: sections.length + 1 }
        });
      }

      // Start new section
      currentSection = {
        code: match[1],
        title: match[2].trim()
      };
      currentContent = [];
    } else if (currentSection) {
      currentContent.push(line);
    }
  }

  // Save last section
  if (currentSection) {
    sections.push({
      type: 'section',
      title: currentSection.title,
      body: { text: currentContent.join('\n').trim() },
      tags: { section_code: currentSection.code },
      metadata: { order: sections.length + 1 }
    });
  }

  return sections;
}
```

#### fetchAndParseURL(url)
```javascript
async function fetchAndParseURL(url) {
  const response = await fetch(url);
  const html = await response.text();

  // Basic HTML to text conversion
  // For Friday: Simple regex, later use cheerio/jsdom
  let text = html
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<style[^>]*>.*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '\n')
    .replace(/\n\n+/g, '\n\n');

  return text;
}
```

#### parsePDF(filePath)
```javascript
async function parsePDF(filePath) {
  // STUB for Friday
  console.warn('PDF parsing not yet implemented');
  return `[PDF content from ${filePath}]\n\nTo be extracted...`;
}
```

### Testing Criteria
```bash
# Test 1: Parse Mesopotamia pilot
node universal-parser.js "/path/to/GRADE 3 MESOPOTAMIA PILOT.md" --save

# Test 2: Parse URL
node universal-parser.js "https://en.wikipedia.org/wiki/Polynesian_culture"

# Test 3: Parse with sections
node universal-parser.js "week1-dayA.md" --extract-sections --save

# Expected: ContentItem + 17 sections saved to database
```

---

## FILE 2: batch-section-generator.js

### Purpose
Generate all 17 sections (A1-A7, B1-B8) for a lesson using Claude AI

### Dependencies
```javascript
import Anthropic from '@anthropic-ai/sdk';
import { getContentItem, createContentItem, updateContentItem } from './dao.js';
import * as SSOT from './ssot-ontologies.js';
```

### Function Signature
```javascript
async function generateAllSections(lessonId, options = {})
```

### Inputs
- `lessonId`: UUID of parent lesson ContentItem
- `options`:
  - `day`: 'A' | 'B' (determines A1-A7 vs B1-B8)
  - `grade`: number (3-5)
  - `model`: string (default: 'claude-sonnet-4-20250514')
  - `parallel`: boolean (default: false) - generate sections in parallel
  - `overwrite`: boolean (default: false) - regenerate existing sections

### Outputs
```javascript
{
  success: boolean,
  lesson_id: UUID,
  sections_generated: number,
  sections: ContentItem[],
  duration_seconds: number,
  cost_estimate: number
}
```

### Algorithm

```javascript
async function generateAllSections(lessonId, options) {
  const startTime = Date.now();

  // 1. Load lesson metadata
  const lesson = await getContentItem(lessonId);
  if (!lesson) throw new Error('Lesson not found');

  const { deity, element, grade, week } = lesson.tags;

  // 2. Determine which sections to generate
  const sectionCodes = options.day === 'B'
    ? ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8']
    : ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7'];

  // 3. Check existing sections
  const existing = await listContentItems({
    parent_id: lessonId,
    type: 'section'
  });

  const existingCodes = new Set(
    existing.map(s => s.tags.section_code)
  );

  const toGenerate = options.overwrite
    ? sectionCodes
    : sectionCodes.filter(code => !existingCodes.has(code));

  console.log(`Generating ${toGenerate.length} sections for lesson ${lessonId}`);

  // 4. Generate sections
  const generatedSections = [];

  if (options.parallel) {
    // Parallel generation (faster but more expensive)
    const promises = toGenerate.map(code =>
      generateSection(code, { deity, element, grade, week, day: options.day })
    );
    generatedSections.push(...await Promise.all(promises));
  } else {
    // Sequential generation (cheaper, respects rate limits)
    for (const code of toGenerate) {
      const section = await generateSection(code, {
        deity,
        element,
        grade,
        week,
        day: options.day
      });
      generatedSections.push(section);

      // Rate limiting: wait 1 second between calls
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // 5. Save sections to database
  for (const section of generatedSections) {
    section.parent_id = lessonId;
    await createContentItem(section);
  }

  const duration = Math.round((Date.now() - startTime) / 1000);

  return {
    success: true,
    lesson_id: lessonId,
    sections_generated: generatedSections.length,
    sections: generatedSections,
    duration_seconds: duration,
    cost_estimate: generatedSections.length * 0.05 // ~$0.05 per section
  };
}
```

### Key Function: generateSection

```javascript
async function generateSection(sectionCode, context) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  // 1. Get section rules from SSOT
  const sectionRules = SSOT.SECTION_RULES[sectionCode] || {};
  const sectionTitle = getSectionTitle(sectionCode);

  // 2. Build context-aware prompt
  const prompt = buildSectionPrompt(sectionCode, context, sectionRules);

  // 3. Call Claude
  const response = await anthropic.messages.create({
    model: context.model || 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: prompt
    }]
  });

  const generatedText = response.content[0].text;

  // 4. Parse CARs if present
  const cars = extractCARs(generatedText);

  // 5. Build ContentItem
  return {
    type: 'section',
    title: `${sectionCode}: ${sectionTitle}`,
    body: {
      text: generatedText,
      cars: cars
    },
    tags: {
      section_code: sectionCode,
      deity: context.deity,
      element: context.element,
      grade_bands: [context.grade]
    },
    metadata: {
      generated_at: new Date().toISOString(),
      model: context.model,
      order: parseInt(sectionCode.slice(1))
    }
  };
}
```

### Prompt Builder

```javascript
function buildSectionPrompt(sectionCode, context, rules) {
  const { deity, element, grade, week, day } = context;

  const basePrompt = `You are an expert elementary curriculum writer creating educational content for Grade ${grade}.

**Lesson Context:**
- Deity: ${deity}
- Geometric Element: ${element}
- Week: ${week}, Day: ${day}
- Target Section: ${sectionCode}

**Section Purpose:**
${rules.purpose || getSectionPurpose(sectionCode)}

**Requirements:**
- Length: 300-500 words
- Reading level: Grade ${grade} (Lexile appropriate)
- Tone: Engaging, narrative, student-friendly
- Include 1-2 Content Acquisition Restatements (CARs) in format: p → q iff w

**SSOT Rules:**
${JSON.stringify(rules, null, 2)}

**Your Task:**
Write complete prose content for this section. Make it engaging for ${grade}rd graders while maintaining academic rigor.

Begin:`;

  return basePrompt;
}
```

### Helper Functions

```javascript
function getSectionTitle(code) {
  const titles = {
    A1: 'Myth Hook',
    A2: 'Phenomenology (SEL + Metaphor)',
    A3: 'Iconography',
    A4: 'Semiotics (Artifact Encounter)',
    A5: 'Technique (Geometric Decomposition)',
    A6: 'Activity (Hands-On Project)',
    A7: 'Bridge (Metaphor = Function)',
    B1: 'Bridge (Function = Metaphor)',
    B2: 'Proof (Mathematical Reasoning)',
    B3: 'Transformation (Geometric Operations)',
    B4: 'Mechanics (How It Works)',
    B5: 'STEM History (Ancient Inventions)',
    B6: 'Invention (Design Decomposition)',
    B7: 'Construction (Build Project)',
    B8: 'Exit Ticket (Assessment)'
  };
  return titles[code] || code;
}

function extractCARs(text) {
  // Pattern: Evidence → Claim iff Warrant
  const carPattern = /(.+?)\s*→\s*(.+?)\s+iff\s+(.+)/gi;
  const cars = [];
  let match;

  while ((match = carPattern.exec(text)) !== null) {
    cars.push({
      evidence: match[1].trim(),
      claim: match[2].trim(),
      warrant: match[3].trim()
    });
  }

  return cars;
}
```

### CLI Interface

```javascript
#!/usr/bin/env node

// Allow CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const lessonId = process.argv[2];
  const day = process.argv[3] || 'A';

  if (!lessonId) {
    console.error('Usage: node batch-section-generator.js <lessonId> [A|B]');
    process.exit(1);
  }

  generateAllSections(lessonId, { day })
    .then(result => {
      console.log(`✅ Generated ${result.sections_generated} sections in ${result.duration_seconds}s`);
      console.log(`   Estimated cost: $${result.cost_estimate.toFixed(2)}`);
    })
    .catch(error => {
      console.error('❌ Error:', error.message);
      process.exit(1);
    });
}
```

### Testing Criteria
```bash
# Test: Generate Day A sections
node batch-section-generator.js <lesson-uuid> A

# Expected output:
# Generating 7 sections...
# ✅ A1: Myth Hook
# ✅ A2: Phenomenology
# ... (all 7)
# ✅ Generated 7 sections in 45s
# Estimated cost: $0.35
```

---

## FILE 3: auto-image-plan-generator.js

### Purpose
Analyze lesson sections and create comprehensive image specifications (47 images per lesson)

### Dependencies
```javascript
import { getContentItem, listContentItems, createMediaAsset } from './dao.js';
import fs from 'fs';
```

### Function Signature
```javascript
async function generateImagePlan(lessonId, options = {})
```

### Inputs
- `lessonId`: UUID
- `options`:
  - `imagesPerSection`: number (default: 3)
  - `includeMuseum`: boolean (default: true)
  - `includeDiagrams`: boolean (default: true)
  - `saveToDatabase`: boolean (default: true)

### Outputs
```javascript
{
  success: boolean,
  lesson_id: UUID,
  total_images: number,
  image_plan: [
    {
      id: string,
      section_code: string,
      type: 'MUSEUM_ARTIFACT' | 'DIAGRAM' | 'STORYBOARD' | 'DEITY_IMAGE',
      purpose: string,
      prompt: string, // For DALL-E
      search_terms: string[], // For museum APIs
      alt_text: string,
      placement: 'header' | 'inline' | 'sidebar'
    }
  ],
  breakdown: {
    museum_artifacts: number,
    generated_diagrams: number,
    storyboard_scenes: number
  }
}
```

### Algorithm

```javascript
async function generateImagePlan(lessonId, options) {
  // 1. Load lesson and all sections
  const lesson = await getContentItem(lessonId);
  const sections = await listContentItems({
    parent_id: lessonId,
    type: 'section'
  });

  // Sort by order
  sections.sort((a, b) =>
    (a.metadata.order || 0) - (b.metadata.order || 0)
  );

  const imagePlan = [];
  let imageCounter = 0;

  // 2. For each section, determine image needs
  for (const section of sections) {
    const sectionCode = section.tags.section_code;
    const sectionImages = determineImagesForSection(
      sectionCode,
      section,
      lesson,
      options
    );

    // Add IDs and metadata
    for (const img of sectionImages) {
      img.id = `${lesson.tags.element}-${sectionCode}-${++imageCounter}`;
      img.lesson_id = lessonId;
      img.section_code = sectionCode;
    }

    imagePlan.push(...sectionImages);
  }

  // 3. Save to database if requested
  if (options.saveToDatabase) {
    for (const spec of imagePlan) {
      await createMediaAsset({
        type: 'image',
        title: `${spec.section_code} - ${spec.purpose}`,
        prompt_plan: {
          prompt: spec.prompt,
          type: spec.type,
          search_terms: spec.search_terms
        },
        alt_text: spec.alt_text,
        tags: {
          section_code: spec.section_code,
          image_type: spec.type
        },
        content_item_id: lessonId,
        metadata: spec
      });
    }
  }

  // 4. Breakdown stats
  const breakdown = {
    museum_artifacts: imagePlan.filter(i => i.type === 'MUSEUM_ARTIFACT').length,
    generated_diagrams: imagePlan.filter(i => i.type === 'DIAGRAM').length,
    storyboard_scenes: imagePlan.filter(i => i.type === 'STORYBOARD').length
  };

  return {
    success: true,
    lesson_id: lessonId,
    total_images: imagePlan.length,
    image_plan: imagePlan,
    breakdown
  };
}
```

### Key Function: determineImagesForSection

```javascript
function determineImagesForSection(sectionCode, section, lesson, options) {
  const images = [];
  const { deity, element } = lesson.tags;

  switch (sectionCode) {
    case 'A1': // Myth Hook - needs storyboard
      images.push({
        type: 'STORYBOARD',
        purpose: 'Opening scene: Deity introduction',
        prompt: `Ancient Mesopotamian art style illustration showing ${deity} in their domain. Warm colors, stylized figures, cuneiform-inspired border. Child-friendly, educational.`,
        alt_text: `Illustration of ${deity}, Mesopotamian deity`,
        placement: 'header'
      });
      images.push({
        type: 'DEITY_IMAGE',
        purpose: 'Deity portrait',
        prompt: `Portrait of ${deity} in ancient Mesopotamian art style. Show key symbols and attributes. Suitable for grade 3-5 students.`,
        alt_text: `${deity}, ancient Mesopotamian deity`,
        placement: 'sidebar'
      });
      break;

    case 'A2': // Phenomenology - needs real-world examples
      images.push({
        type: 'DIAGRAM',
        purpose: 'Geometric pattern in nature',
        prompt: `Educational diagram showing ${element} shapes in natural phenomena. Clear labels, simple style, white background.`,
        alt_text: `${element} shapes appearing in nature`,
        placement: 'inline'
      });
      break;

    case 'A3': // Iconography - needs artifact images
      if (options.includeMuseum) {
        images.push({
          type: 'MUSEUM_ARTIFACT',
          purpose: 'Primary artifact showing deity symbol',
          search_terms: [
            `${deity} ${element}`,
            `Mesopotamian ${deity}`,
            `${deity} cylinder seal`,
            `${deity} relief`
          ],
          alt_text: `Ancient artifact depicting ${deity} with ${element} symbol`,
          placement: 'inline'
        });
      }
      break;

    case 'A4': // Semiotics - needs multiple artifacts
      if (options.includeMuseum) {
        images.push(
          {
            type: 'MUSEUM_ARTIFACT',
            purpose: 'Artifact 1 for analysis',
            search_terms: [`${deity} seal`, `${element} Mesopotamia`],
            alt_text: `Mesopotamian artifact showing ${element}`,
            placement: 'inline'
          },
          {
            type: 'MUSEUM_ARTIFACT',
            purpose: 'Artifact 2 for comparison',
            search_terms: [`${deity} tablet`, `${deity} temple`],
            alt_text: `Archaeological evidence of ${deity} worship`,
            placement: 'inline'
          }
        );
      }
      break;

    case 'A5': // Technique - needs diagrams
      if (options.includeDiagrams) {
        images.push({
          type: 'DIAGRAM',
          purpose: 'Geometric decomposition steps',
          prompt: `Step-by-step diagram showing how to construct a ${element}. Clean, educational style with numbered steps. White background, clear labels.`,
          alt_text: `Step-by-step construction of ${element}`,
          placement: 'inline'
        });
      }
      break;

    case 'A6': // Activity - needs reference images
      images.push({
        type: 'DIAGRAM',
        purpose: 'Activity example',
        prompt: `Children creating ${element} art project in classroom. Diverse students, hands-on learning, bright colors.`,
        alt_text: `Students creating ${element} art project`,
        placement: 'header'
      });
      break;

    // Similar logic for B1-B8...
    case 'B2': // Proof - mathematical diagrams
      if (options.includeDiagrams) {
        images.push({
          type: 'DIAGRAM',
          purpose: 'Mathematical proof visualization',
          prompt: `Geometric proof diagram for ${element}. Clean lines, labeled vertices, proof steps numbered. Educational math textbook style.`,
          alt_text: `Mathematical proof using ${element}`,
          placement: 'inline'
        });
      }
      break;

    default:
      // Default: 1 contextual image per section
      images.push({
        type: 'DIAGRAM',
        purpose: `Visual for ${sectionCode}`,
        prompt: `Educational illustration for grade 3-5 geometry lesson about ${element}. Clear, simple, engaging.`,
        alt_text: `Illustration for ${sectionCode} section`,
        placement: 'inline'
      });
  }

  return images;
}
```

### CLI Interface

```bash
#!/usr/bin/env node

if (import.meta.url === `file://${process.argv[1]}`) {
  const lessonId = process.argv[2];

  if (!lessonId) {
    console.error('Usage: node auto-image-plan-generator.js <lessonId>');
    process.exit(1);
  }

  generateImagePlan(lessonId)
    .then(result => {
      console.log(`✅ Generated image plan: ${result.total_images} images`);
      console.log(`   Museum artifacts: ${result.breakdown.museum_artifacts}`);
      console.log(`   Generated diagrams: ${result.breakdown.generated_diagrams}`);
      console.log(`   Storyboard scenes: ${result.breakdown.storyboard_scenes}`);

      // Save JSON file
      fs.writeFileSync(
        `image-plan-${lessonId}.json`,
        JSON.stringify(result.image_plan, null, 2)
      );
      console.log(`   Saved to: image-plan-${lessonId}.json`);
    })
    .catch(error => {
      console.error('❌ Error:', error.message);
      process.exit(1);
    });
}
```

### Testing Criteria
```bash
# Test: Generate image plan
node auto-image-plan-generator.js <lesson-uuid>

# Expected output:
# ✅ Generated image plan: 47 images
#    Museum artifacts: 12
#    Generated diagrams: 28
#    Storyboard scenes: 7
#    Saved to: image-plan-<uuid>.json
```

---

## FILE 4: auto-html-generator.js

### Purpose
Assemble sections + images into final HTML lesson without manual manifest

### Dependencies
```javascript
import { getContentItem, listContentItems, listMediaAssets } from './dao.js';
import fs from 'fs';
import path from 'path';
```

### Function Signature
```javascript
async function generateHTML(lessonId, options = {})
```

### Inputs
- `lessonId`: UUID
- `options`:
  - `template`: 'default' | 'printable' | 'slideshow'
  - `outputPath`: string (default: './output/')
  - `includeImages`: boolean (default: true)
  - `audience`: 'teacher' | 'student' | 'parent'

### Outputs
```javascript
{
  success: boolean,
  html_path: string,
  file_size_kb: number,
  sections_included: number,
  images_included: number
}
```

### Algorithm

```javascript
async function generateHTML(lessonId, options) {
  // 1. Load complete lesson data
  const lesson = await getContentItem(lessonId);
  const sections = await listContentItems({
    parent_id: lessonId,
    type: 'section'
  });
  const images = await listMediaAssets({
    content_item_id: lessonId
  });

  // Sort sections by order
  sections.sort((a, b) =>
    (a.metadata.order || 0) - (b.metadata.order || 0)
  );

  // 2. Map images to sections
  const imagesBySection = {};
  for (const img of images) {
    const section = img.tags.section_code || 'general';
    if (!imagesBySection[section]) imagesBySection[section] = [];
    imagesBySection[section].push(img);
  }

  // 3. Build HTML
  const html = buildLessonHTML(lesson, sections, imagesBySection, options);

  // 4. Write to file
  const outputDir = options.outputPath || './output';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filename = `${lesson.tags.element}-${lesson.tags.deity}-${lesson.tags.grade}.html`;
  const filepath = path.join(outputDir, filename);

  fs.writeFileSync(filepath, html, 'utf-8');

  return {
    success: true,
    html_path: filepath,
    file_size_kb: Math.round(Buffer.byteLength(html, 'utf-8') / 1024),
    sections_included: sections.length,
    images_included: images.length
  };
}
```

### HTML Builder

```javascript
function buildLessonHTML(lesson, sections, imagesBySection, options) {
  const { deity, element, grade, week } = lesson.tags;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${lesson.title} - Grade ${grade}</title>
  <style>
    ${getLessonCSS(options.template)}
  </style>
</head>
<body>
  <header class="lesson-header">
    <h1>${lesson.title}</h1>
    <div class="lesson-meta">
      <span>Grade ${grade}</span>
      <span>Week ${week}</span>
      <span>Deity: ${deity}</span>
      <span>Element: ${element}</span>
    </div>
  </header>

  <nav class="lesson-nav">
    ${buildNavigation(sections)}
  </nav>

  <main class="lesson-content">
    ${sections.map(section => buildSectionHTML(section, imagesBySection, options)).join('\n')}
  </main>

  <footer class="lesson-footer">
    <p>Generated by Mesopotamia Curriculum System</p>
    <p>${new Date().toLocaleDateString()}</p>
  </footer>

  <script>
    ${getLessonJavaScript()}
  </script>
</body>
</html>`;
}
```

### Section Builder

```javascript
function buildSectionHTML(section, imagesBySection, options) {
  const sectionCode = section.tags.section_code;
  const sectionImages = imagesBySection[sectionCode] || [];

  return `
  <section id="${sectionCode}" class="lesson-section">
    <h2>${section.title}</h2>

    ${options.includeImages && sectionImages.length > 0 ? `
    <div class="section-images">
      ${sectionImages.map(img => `
        <figure>
          <img src="${img.url || img.local_path}" alt="${img.alt_text}">
          ${img.caption ? `<figcaption>${img.caption}</figcaption>` : ''}
        </figure>
      `).join('\n')}
    </div>
    ` : ''}

    <div class="section-content">
      ${formatContent(section.body)}
    </div>

    ${section.body.cars && section.body.cars.length > 0 ? `
    <div class="section-cars">
      <h3>Key Concepts:</h3>
      <ul>
        ${section.body.cars.map(car => `
          <li><strong>${car.evidence}</strong> → <em>${car.claim}</em> iff <span>${car.warrant}</span></li>
        `).join('\n')}
      </ul>
    </div>
    ` : ''}
  </section>`;
}
```

### CSS Templates

```javascript
function getLessonCSS(template) {
  if (template === 'printable') {
    return `
      body { font-family: 'Times New Roman', serif; font-size: 12pt; }
      .lesson-header { border-bottom: 2px solid #000; padding-bottom: 20px; }
      .lesson-nav { display: none; }
      .section-images img { max-width: 300px; }
      @media print { .lesson-nav { display: none; } }
    `;
  } else if (template === 'slideshow') {
    return `
      body { font-family: Arial, sans-serif; background: #f5f5f5; }
      .lesson-section { page-break-after: always; min-height: 100vh; padding: 40px; }
      .section-images img { max-width: 80%; margin: 0 auto; display: block; }
    `;
  } else {
    // Default web template
    return `
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Open Sans', Arial, sans-serif; line-height: 1.6; color: #333; }
      .lesson-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
      .lesson-meta { display: flex; justify-content: center; gap: 20px; margin-top: 20px; }
      .lesson-nav { background: #f8f9fa; padding: 20px; position: sticky; top: 0; z-index: 100; }
      .lesson-nav a { margin: 0 10px; text-decoration: none; color: #667eea; }
      .lesson-content { max-width: 900px; margin: 40px auto; padding: 0 20px; }
      .lesson-section { margin-bottom: 60px; padding: 30px; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
      .lesson-section h2 { color: #667eea; margin-bottom: 20px; border-bottom: 3px solid #667eea; padding-bottom: 10px; }
      .section-images { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0; }
      .section-images img { width: 100%; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
      .section-content { margin: 20px 0; }
      .section-cars { background: #f8f9fa; padding: 20px; border-left: 4px solid #667eea; margin-top: 20px; }
      .lesson-footer { background: #333; color: white; text-align: center; padding: 20px; margin-top: 60px; }
    `;
  }
}
```

### Testing Criteria
```bash
# Test: Generate HTML
node auto-html-generator.js <lesson-uuid>

# Expected output:
# ✅ Generated HTML: circle-Shamash-3.html
#    File size: 245 KB
#    Sections: 7
#    Images: 23
#    Path: ./output/circle-Shamash-3.html

# Then open in browser
open ./output/circle-Shamash-3.html
```

---

## FILE 5: run-full-pipeline.sh

### Purpose
One-click orchestrator that runs complete automation pipeline

### Contents

```bash
#!/bin/bash
set -e # Exit on error

# MESOPOTAMIA CURRICULUM - FULL AUTOMATION PIPELINE
# Usage: ./run-full-pipeline.sh <markdown-file>

MARKDOWN_FILE=$1

if [ -z "$MARKDOWN_FILE" ]; then
  echo "Usage: ./run-full-pipeline.sh <markdown-file>"
  echo "Example: ./run-full-pipeline.sh week1-dayA.md"
  exit 1
fi

if [ ! -f "$MARKDOWN_FILE" ]; then
  echo "Error: File not found: $MARKDOWN_FILE"
  exit 1
fi

echo "🏛️  MESOPOTAMIA CURRICULUM - AUTOMATION PIPELINE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Input: $MARKDOWN_FILE"
echo "Started: $(date)"
echo ""

# Step 1: Parse markdown file
echo "📄 STEP 1/5: Parsing markdown file..."
PARSE_RESULT=$(node universal-parser.js "$MARKDOWN_FILE" --save --extract-sections)
LESSON_ID=$(echo "$PARSE_RESULT" | grep "lesson_id:" | awk '{print $2}')

if [ -z "$LESSON_ID" ]; then
  echo "❌ Failed to parse file"
  exit 1
fi

echo "✅ Parsed: Lesson ID = $LESSON_ID"
echo ""

# Step 2: Generate sections (Day A)
echo "📝 STEP 2/5: Generating sections (Day A)..."
node batch-section-generator.js "$LESSON_ID" A
echo "✅ Generated 7 sections for Day A"
echo ""

# Step 3: Create image plan
echo "🖼️  STEP 3/5: Creating image plan..."
node auto-image-plan-generator.js "$LESSON_ID"
echo "✅ Image plan created"
echo ""

# Step 4: Generate images (using existing bulk-image-manager.js)
echo "🎨 STEP 4/5: Generating images (this takes 5-10 minutes)..."
IMAGE_PLAN_FILE="image-plan-${LESSON_ID}.json"

if [ -f "$IMAGE_PLAN_FILE" ]; then
  node bulk-image-manager.js generate-from-plan "$IMAGE_PLAN_FILE" 3000
  echo "✅ Images generated"
else
  echo "⚠️  Image plan file not found, skipping image generation"
fi
echo ""

# Step 5: Generate HTML
echo "📄 STEP 5/5: Building HTML lesson..."
node auto-html-generator.js "$LESSON_ID"
echo "✅ HTML generated"
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ PIPELINE COMPLETE"
echo ""
echo "Lesson ID: $LESSON_ID"
echo "Output: ./output/*.html"
echo "Completed: $(date)"
echo ""
echo "Next steps:"
echo "  1. Open HTML in browser: open ./output/*.html"
echo "  2. Review content and images"
echo "  3. Generate Day B: ./run-full-pipeline.sh week1-dayB.md"
```

### Make Executable

```bash
chmod +x run-full-pipeline.sh
```

### Testing Criteria

```bash
# Test: Full pipeline
./run-full-pipeline.sh "/path/to/week1-dayA.md"

# Expected: Complete lesson generated in 10-15 minutes
# Output: HTML file in ./output/ directory
```

---

## INTEGRATION CHECKLIST

### Before Running Automation Scripts

1. ✅ Apply schema.sql to Supabase
2. ✅ Set environment variables:
   ```bash
   export SUPABASE_URL="your_url"
   export SUPABASE_SERVICE_KEY="your_key"
   export ANTHROPIC_API_KEY="your_key"
   export OPENAI_API_KEY="your_key"
   ```
3. ✅ Test DAO layer:
   ```bash
   node -e "import('./dao.js').then(dao => dao.healthCheck()).then(console.log)"
   ```

### Execution Order

1. `universal-parser.js` → Creates ContentItem (lesson) + sections
2. `batch-section-generator.js` → Generates prose for all sections
3. `auto-image-plan-generator.js` → Creates image specifications
4. `bulk-image-manager.js` (existing) → Generates actual images
5. `auto-html-generator.js` → Assembles final HTML

### Success Metrics

- Parse time: < 5 seconds
- Section generation: ~45 seconds (7 sections × 6s each)
- Image plan: < 10 seconds
- Image generation: 5-10 minutes (47 images)
- HTML generation: < 5 seconds
- **Total**: 10-15 minutes per lesson

---

## COST ESTIMATES

- Claude API (sections): $0.35 per lesson (7 sections × $0.05)
- DALL-E (images): $1.88 per lesson (47 images × $0.04)
- **Total per lesson**: ~$2.25

For 6 weeks (12 lessons): ~$27

---

## ERROR HANDLING

All scripts should include:

```javascript
try {
  // Main logic
} catch (error) {
  console.error(`❌ Error in ${scriptName}:`, error.message);
  console.error(`Stack trace:`, error.stack);

  // Log to file
  fs.appendFileSync('automation-errors.log',
    `[${new Date().toISOString()}] ${error.message}\n${error.stack}\n\n`
  );

  process.exit(1);
}
```

---

## NEXT STEPS AFTER AUTOMATION SCRIPTS

Once these 5 files are complete, the Automation Engine is functional. Next priority is Studio UI (see SPECS-STUDIO-UI.md).
