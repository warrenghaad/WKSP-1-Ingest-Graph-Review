#!/usr/bin/env node
/**
 * EUCLID Document Discovery Scanner
 *
 * Scans folders recursively. Reads every document. Extracts:
 *   - What each file ACTUALLY contains (not what its name says)
 *   - Every section heading and what that section is about
 *   - Key concepts defined or referenced
 *   - Content fingerprint for overlap detection
 *
 * No assumptions. No shortcuts. Reads the content.
 *
 * Usage:
 *   node doc-scanner.mjs <folder1> [folder2] [folder3] --out report.html
 */

import fs from 'fs/promises';
import path from 'path';

// ============================================================================
// CONFIGURATION
// ============================================================================

const SKIP_DIRS = new Set([
  'node_modules', '.git', '.obsidian', '__pycache__', '.next',
  'dist', 'build', '.cache', 'document-graph-organizer', '.claude'
]);

const SCAN_EXTENSIONS = new Set(['.md', '.txt']);

// Concept vocabulary — not for classification, just for detection
const CONCEPT_MARKERS = {
  // Structural concepts
  lesson_architecture: /\b(section\s+[AB]\d|day\s*[AB]|SSOT|v7\.?0|15.section|lesson\s+architecture)\b/gi,
  magic_framework: /\b(MAGIC\s+(driver|variable|weight|vector|line|investigation)|[MAGIC]\s*[-:]\s*\d|M\.?\d.*A\.?\d.*G\.?\d)/gi,
  gea_gem: /\b(GEA|GEM|GEK|GEK.T|geometric\s+elem|atomic|molecular|perceptual\s+affordance)\b/gi,
  gephr: /\b(GEpHR|visual\s+rhetoric|significance.*meaning.*elaboration|perceptual.historical\s+resonance)\b/gi,
  ontology: /\b(ontology|deity.element|element.registry|shamash|sin|ishtar|ninurta|marduk|ea|nanna)\b/gi,
  srq: /\b(SRQ|standing\s+research\s+question|5.line\s+investigation|MAGIC\s+scan)\b/gi,
  image_pipeline: /\b(image\s+pipeline|RWI|provider.agnostic|DALL.E|midjourney|stable\s+diffusion|image\s+spec)\b/gi,
  tagging: /\b(tag(?:ging)?|tag\s+ontology|primary\s+tag|secondary\s+tag|i_myth|a_visual|g_gea|m_formal|c_power)\b/gi,
  dual_register: /\b(dual.register|metaphor.*function|meaning.*mechanism|circumnutat)\b/gi,
  artifact_culture: /\b(artifact|museum|British\s+Museum|Louvre|cylinder\s+seal|relief|stele|kudurru|material\s+culture)\b/gi,
  engineering_stem: /\b(STEM\s+notch|invention|engineering|wheel|arch|truss|vault|mechanical)\b/gi,
  diffusion: /\b(diffusion|social\s+spread|prestige\s+cascade|access\s+restrict|elite.*common)\b/gi,
  assessment: /\b(rubric|assessment|learning\s+object|LO\s+|standard|CCSS|NGSS)\b/gi,
  system_tech: /\b(Express|router|API|endpoint|server|MCP|agent|pipeline|orchestrat|ingest)\b/gi,
  ecd_framework: /\b(ECD|Evidence.Centered\s+Design|claim|evidence|task\s+model)\b/gi,
  geon: /\b(geon|Biederman|recognition.by.components|viewpoint.invariant)\b/gi,
  nash_room: /\b(Nash\s+Room|game\s+theory|equilibri|storage|4.engine)\b/gi,
  grant_admin: /\b(grant|NSF|pilot|roadmap|timeline|budget|stakeholder)\b/gi,
  grade_content: /\b(grade\s+[345]|week\s+\d|student|classroom|teacher)\b/gi,
};

// ============================================================================
// SCANNER
// ============================================================================

async function scanFolder(folderPath) {
  const results = [];

  async function walk(dir, depth = 0) {
    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch (e) {
      return; // skip unreadable
    }

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name) && !entry.name.startsWith('.')) {
          await walk(fullPath, depth + 1);
        }
      } else if (entry.isFile() && SCAN_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
        try {
          const content = await fs.readFile(fullPath, 'utf-8');
          const analysis = analyzeDocument(fullPath, content);
          results.push(analysis);
        } catch (e) {
          results.push({
            path: fullPath,
            error: e.message,
            relativePath: fullPath,
          });
        }
      }
    }
  }

  await walk(folderPath);
  return results;
}

// ============================================================================
// DOCUMENT ANALYZER — reads the actual content
// ============================================================================

function analyzeDocument(filePath, content) {
  const lines = content.split('\n');
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const charCount = content.length;

  // Extract all headings and their content
  const sections = extractSections(lines);

  // Detect which concepts are ACTUALLY present
  const conceptPresence = {};
  let conceptCount = 0;
  for (const [concept, regex] of Object.entries(CONCEPT_MARKERS)) {
    const matches = content.match(regex) || [];
    if (matches.length > 0) {
      conceptPresence[concept] = {
        count: matches.length,
        samples: [...new Set(matches.slice(0, 5).map(m => m.trim()))],
      };
      conceptCount += matches.length;
    }
  }

  // Determine what this document ACTUALLY IS based on its content
  const purpose = inferPurpose(content, sections, conceptPresence, filePath);

  // Extract the first substantive paragraph (skip headings, blank lines)
  const openingContent = extractOpening(lines);

  // Extract section IDs mentioned (A1, B3, etc.)
  const sectionRefs = [...new Set((content.match(/\b[AB]\d[a-f]?\b/g) || []))].sort();

  // Extract specific element/deity mentions
  const deityMentions = [...new Set((content.match(/\b(Shamash|Sin|Ishtar|Ninurta|Marduk|Ea|Nanna|Ninhursag|Adad|Nabu|Enlil|Anu|Ninlil)\b/gi) || []).map(d => d.toLowerCase()))];
  const elementMentions = [...new Set((content.match(/\b(circle|crescent|star\s*8|triangle|square|spiral|arch|rectangle|rosette|lightning\s*bolt|spade|stylus|omega|water\s*streams?)\b/gi) || []).map(e => e.toLowerCase()))];

  // Content fingerprint — top 20 most frequent significant words
  const fingerprint = buildFingerprint(content);

  return {
    path: filePath,
    filename: path.basename(filePath),
    directory: path.dirname(filePath),
    wordCount,
    charCount,
    lineCount: lines.length,
    sectionCount: sections.length,
    sections,
    conceptPresence,
    conceptCount,
    purpose,
    openingContent,
    sectionRefs,
    deityMentions,
    elementMentions,
    fingerprint,
    isEmpty: wordCount < 20,
  };
}

function extractSections(lines) {
  const sections = [];
  let currentHeading = null;
  let currentLevel = 0;
  let currentContent = [];

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (headingMatch) {
      // Save previous section
      if (currentHeading !== null) {
        const text = currentContent.join('\n').trim();
        sections.push({
          heading: currentHeading,
          level: currentLevel,
          contentPreview: text.slice(0, 300),
          wordCount: text.split(/\s+/).filter(Boolean).length,
          purpose: inferSectionPurpose(currentHeading, text),
        });
      }
      currentHeading = headingMatch[2].replace(/\*\*/g, '').trim();
      currentLevel = headingMatch[1].length;
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }

  // Last section
  if (currentHeading !== null) {
    const text = currentContent.join('\n').trim();
    sections.push({
      heading: currentHeading,
      level: currentLevel,
      contentPreview: text.slice(0, 300),
      wordCount: text.split(/\s+/).filter(Boolean).length,
      purpose: inferSectionPurpose(currentHeading, text),
    });
  }

  return sections;
}

function inferSectionPurpose(heading, content) {
  const h = heading.toLowerCase();
  const c = content.toLowerCase();
  const wc = content.split(/\s+/).filter(Boolean).length;

  if (wc < 5) return 'empty/placeholder';

  // Check what this section actually DOES
  const traits = [];

  if (/defin|what\s+is|overview|introduction|about/i.test(h)) traits.push('defines');
  if (/example|instance|case\s+stud|sample/i.test(h + ' ' + c.slice(0, 200))) traits.push('examples');
  if (/step|how\s+to|procedure|workflow|process|instructions/i.test(h)) traits.push('procedural');
  if (/table|matrix|grid|comparison|vs\./i.test(h + ' ' + c.slice(0, 100))) traits.push('tabular');
  if (/rule|constraint|must|shall|require/i.test(c.slice(0, 300))) traits.push('prescriptive');
  if (/research|finding|evidence|source|museum|artifact/i.test(c.slice(0, 300))) traits.push('research');
  if (/api|endpoint|route|server|code|function|class|import/i.test(c.slice(0, 300))) traits.push('technical');
  if (/student|teacher|classroom|grade|lesson/i.test(c.slice(0, 300))) traits.push('pedagogical');
  if (/todo|fix|patch|broken|need|missing|problem|issue/i.test(h + ' ' + c.slice(0, 200))) traits.push('action-item');
  if (/sacred|deity|temple|myth|ritual/i.test(c.slice(0, 300))) traits.push('sacred-content');
  if (/math|formula|angle|measure|proof|theorem/i.test(c.slice(0, 300))) traits.push('mathematical');

  if (traits.length === 0) {
    // Generic content analysis
    if (wc > 200) traits.push('substantive-prose');
    else if (wc > 50) traits.push('brief-content');
    else traits.push('stub');
  }

  return traits.join(', ');
}

function inferPurpose(content, sections, concepts, filePath) {
  const c = content.toLowerCase();
  const fname = path.basename(filePath).toLowerCase();
  const topConcepts = Object.entries(concepts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5)
    .map(([k]) => k);

  // Build a purpose description from what's ACTUALLY IN the content
  const purposes = [];

  // What domain is this about?
  if (topConcepts.includes('lesson_architecture')) purposes.push('LESSON ARCHITECTURE definition');
  if (topConcepts.includes('magic_framework')) purposes.push('MAGIC framework specification');
  if (topConcepts.includes('gea_gem')) purposes.push('GEA/GEM/GEK geometric element theory');
  if (topConcepts.includes('gephr')) purposes.push('GEpHR visual rhetoric model');
  if (topConcepts.includes('ontology')) purposes.push('deity-element ontology');
  if (topConcepts.includes('srq')) purposes.push('SRQ research methodology');
  if (topConcepts.includes('image_pipeline')) purposes.push('image generation pipeline');
  if (topConcepts.includes('tagging')) purposes.push('tagging/taxonomy system');
  if (topConcepts.includes('dual_register')) purposes.push('dual-register theory');
  if (topConcepts.includes('ecd_framework')) purposes.push('ECD assessment framework');
  if (topConcepts.includes('geon')) purposes.push('Geon integration theory');
  if (topConcepts.includes('nash_room')) purposes.push('Nash Room/4-engine architecture');
  if (topConcepts.includes('system_tech')) purposes.push('system/technical implementation');
  if (topConcepts.includes('grant_admin')) purposes.push('project admin/roadmap');
  if (topConcepts.includes('grade_content')) purposes.push('grade-level lesson content');
  if (topConcepts.includes('engineering_stem')) purposes.push('STEM/engineering content');
  if (topConcepts.includes('assessment')) purposes.push('assessment/standards');
  if (topConcepts.includes('artifact_culture')) purposes.push('artifact/material culture research');
  if (topConcepts.includes('diffusion')) purposes.push('social diffusion analysis');

  // What TYPE of document is it?
  if (/schema|framework|specification|spec\b|structure/i.test(fname)) purposes.push('[TYPE: specification]');
  else if (/guide|how.to|instruction|setup|install/i.test(fname)) purposes.push('[TYPE: guide]');
  else if (/report|audit|analysis|review/i.test(fname)) purposes.push('[TYPE: report]');
  else if (/readme/i.test(fname)) purposes.push('[TYPE: readme]');
  else if (/grade.*week|lesson/i.test(fname)) purposes.push('[TYPE: lesson draft]');
  else if (/handoff|summary|status/i.test(fname)) purposes.push('[TYPE: handoff/status]');
  else if (/patch|fix|quick/i.test(fname)) purposes.push('[TYPE: patch/fix]');
  else if (/roadmap|pilot|plan/i.test(fname)) purposes.push('[TYPE: planning]');
  else if (/untitled/i.test(fname)) purposes.push('[TYPE: untitled/orphan]');

  if (purposes.length === 0) {
    if (content.split(/\s+/).length < 50) return 'MINIMAL CONTENT — likely stub or placeholder';
    return 'UNCATEGORIZED — content does not match known concept vocabulary';
  }

  return purposes.join(' + ');
}

function extractOpening(lines) {
  const substantive = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('#')) continue;
    if (trimmed.startsWith('---')) continue;
    if (trimmed.startsWith('```')) continue;
    substantive.push(trimmed);
    if (substantive.join(' ').length > 300) break;
  }
  return substantive.join(' ').slice(0, 400);
}

function buildFingerprint(content) {
  const STOP_WORDS = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'shall', 'can', 'this', 'that', 'these',
    'those', 'it', 'its', 'they', 'them', 'their', 'he', 'she', 'his',
    'her', 'we', 'our', 'you', 'your', 'not', 'no', 'if', 'then', 'else',
    'when', 'where', 'how', 'what', 'which', 'who', 'whom', 'why', 'all',
    'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such',
    'than', 'too', 'very', 'just', 'also', 'so', 'as', 'about', 'up',
    'out', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
    'between', 'same', 'different', 'here', 'there', 'again', 'once',
  ]);

  const words = content.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !STOP_WORDS.has(w));
  const freq = {};
  for (const w of words) freq[w] = (freq[w] || 0) + 1;
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 25)
    .map(([word, count]) => `${word}:${count}`);
}

// ============================================================================
// OVERLAP DETECTION
// ============================================================================

function detectOverlaps(docs) {
  const overlaps = [];

  // Compare fingerprints pairwise
  for (let i = 0; i < docs.length; i++) {
    for (let j = i + 1; j < docs.length; j++) {
      const a = docs[i];
      const b = docs[j];
      if (a.isEmpty || b.isEmpty) continue;

      // Fingerprint overlap
      const aWords = new Set(a.fingerprint.map(f => f.split(':')[0]));
      const bWords = new Set(b.fingerprint.map(f => f.split(':')[0]));
      const intersection = [...aWords].filter(w => bWords.has(w));
      const union = new Set([...aWords, ...bWords]);
      const jaccard = intersection.length / union.size;

      // Concept overlap
      const aConcepts = new Set(Object.keys(a.conceptPresence));
      const bConcepts = new Set(Object.keys(b.conceptPresence));
      const conceptIntersection = [...aConcepts].filter(c => bConcepts.has(c));
      const conceptUnion = new Set([...aConcepts, ...bConcepts]);
      const conceptJaccard = conceptUnion.size > 0 ? conceptIntersection.length / conceptUnion.size : 0;

      // Combined similarity
      const similarity = (jaccard * 0.6) + (conceptJaccard * 0.4);

      if (similarity > 0.35) {
        overlaps.push({
          fileA: a.filename,
          pathA: a.path,
          fileB: b.filename,
          pathB: b.path,
          similarity: Math.round(similarity * 100),
          sharedWords: intersection.slice(0, 10),
          sharedConcepts: conceptIntersection,
          purposeA: a.purpose,
          purposeB: b.purpose,
        });
      }
    }
  }

  return overlaps.sort((a, b) => b.similarity - a.similarity);
}

// ============================================================================
// FRAGMENT DETECTION — files that only contain one operational piece
// ============================================================================

function detectFragments(docs) {
  return docs.filter(d => {
    if (d.isEmpty) return true;
    if (d.wordCount < 100 && d.sectionCount <= 1) return true;
    // Has a general name but only addresses one narrow concept
    const conceptCount = Object.keys(d.conceptPresence).length;
    const nameIsGeneral = /framework|system|overview|master|complete|full|comprehensive/i.test(d.filename);
    if (nameIsGeneral && conceptCount <= 1) return true;
    return false;
  }).map(d => ({
    file: d.filename,
    path: d.path,
    wordCount: d.wordCount,
    concepts: Object.keys(d.conceptPresence),
    reason: d.isEmpty ? 'EMPTY/NEAR-EMPTY' :
      d.wordCount < 100 ? 'STUB (<100 words)' :
        'GENERAL NAME but narrow content',
  }));
}

// ============================================================================
// DRIFT DETECTION — name says one thing, content says another
// ============================================================================

function detectDrift(docs) {
  const drifted = [];

  for (const doc of docs) {
    if (doc.isEmpty) continue;
    const fname = doc.filename.toLowerCase().replace(/[_-]/g, ' ').replace(/\.md$/, '');

    // Check if name implies a domain the content doesn't cover
    const nameClaims = [];
    if (/schema/i.test(fname)) nameClaims.push('lesson_architecture', 'tagging');
    if (/magic/i.test(fname)) nameClaims.push('magic_framework');
    if (/gea|gem|gek/i.test(fname)) nameClaims.push('gea_gem');
    if (/gephr|rhetoric/i.test(fname)) nameClaims.push('gephr');
    if (/ontology|element|registry/i.test(fname)) nameClaims.push('ontology');
    if (/srq|investigation/i.test(fname)) nameClaims.push('srq');
    if (/image|pipeline|rwi/i.test(fname)) nameClaims.push('image_pipeline');
    if (/tag/i.test(fname)) nameClaims.push('tagging');
    if (/ssot|constitution/i.test(fname)) nameClaims.push('lesson_architecture');
    if (/ecd/i.test(fname)) nameClaims.push('ecd_framework');
    if (/geon/i.test(fname)) nameClaims.push('geon');
    if (/nash/i.test(fname)) nameClaims.push('nash_room');
    if (/lesson|grade|week/i.test(fname)) nameClaims.push('grade_content');
    if (/assessment|rubric|standard/i.test(fname)) nameClaims.push('assessment');

    if (nameClaims.length === 0) continue;

    const actualConcepts = new Set(Object.keys(doc.conceptPresence));
    const missingFromContent = nameClaims.filter(c => !actualConcepts.has(c));

    if (missingFromContent.length > 0 && missingFromContent.length >= nameClaims.length * 0.5) {
      drifted.push({
        file: doc.filename,
        path: doc.path,
        nameSuggests: nameClaims,
        contentActuallyCovers: [...actualConcepts],
        missingFromContent,
        purpose: doc.purpose,
      });
    }
  }

  return drifted;
}

// ============================================================================
// HTML REPORT GENERATOR
// ============================================================================

function generateHTML(allDocs, overlaps, fragments, drifted, folderPaths) {
  // Group by directory
  const byDirectory = {};
  for (const doc of allDocs) {
    const dir = doc.directory;
    if (!byDirectory[dir]) byDirectory[dir] = [];
    byDirectory[dir].push(doc);
  }

  // Concept coverage map — which docs cover which concepts
  const conceptMap = {};
  for (const doc of allDocs) {
    for (const concept of Object.keys(doc.conceptPresence)) {
      if (!conceptMap[concept]) conceptMap[concept] = [];
      conceptMap[concept].push({ file: doc.filename, path: doc.path, count: doc.conceptPresence[concept].count });
    }
  }

  const totalDocs = allDocs.length;
  const totalWords = allDocs.reduce((s, d) => s + d.wordCount, 0);
  const emptyDocs = allDocs.filter(d => d.isEmpty).length;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>EUCLID Document Discovery Report</title>
<style>
  :root {
    --bg: #0d1117; --surface: #161b22; --surface2: #21262d;
    --border: #30363d; --text: #e6edf3; --text2: #8b949e;
    --accent: #58a6ff; --warn: #d29922; --danger: #f85149;
    --good: #3fb950; --purple: #bc8cff;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: var(--bg); color: var(--text); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace; line-height: 1.5; padding: 20px; }
  h1 { font-size: 24px; margin-bottom: 8px; color: var(--accent); }
  h2 { font-size: 18px; margin: 30px 0 12px; color: var(--purple); border-bottom: 1px solid var(--border); padding-bottom: 6px; }
  h3 { font-size: 15px; margin: 16px 0 8px; color: var(--text); }
  .stats { display: flex; gap: 16px; flex-wrap: wrap; margin: 16px 0; }
  .stat { background: var(--surface); border: 1px solid var(--border); border-radius: 6px; padding: 12px 16px; min-width: 140px; }
  .stat-val { font-size: 28px; font-weight: bold; color: var(--accent); }
  .stat-label { font-size: 12px; color: var(--text2); }
  .tab-bar { display: flex; gap: 2px; margin: 20px 0 0; border-bottom: 2px solid var(--border); }
  .tab { padding: 8px 16px; cursor: pointer; color: var(--text2); border-radius: 6px 6px 0 0; font-size: 13px; }
  .tab.active { background: var(--surface); color: var(--accent); border: 1px solid var(--border); border-bottom: 2px solid var(--surface); margin-bottom: -2px; }
  .tab:hover { color: var(--text); }
  .tab-content { display: none; }
  .tab-content.active { display: block; }
  .doc-card { background: var(--surface); border: 1px solid var(--border); border-radius: 6px; padding: 12px; margin: 8px 0; }
  .doc-card.empty { opacity: 0.5; border-color: var(--danger); }
  .doc-card.drifted { border-left: 3px solid var(--warn); }
  .doc-name { font-weight: bold; color: var(--accent); font-size: 14px; word-break: break-all; }
  .doc-path { font-size: 11px; color: var(--text2); margin-top: 2px; word-break: break-all; }
  .doc-purpose { font-size: 13px; margin: 6px 0; color: var(--text); background: var(--surface2); padding: 6px 8px; border-radius: 4px; }
  .doc-meta { font-size: 11px; color: var(--text2); margin-top: 4px; }
  .concept-tag { display: inline-block; background: var(--surface2); border: 1px solid var(--border); border-radius: 3px; padding: 1px 6px; margin: 2px; font-size: 11px; color: var(--purple); }
  .section-list { margin: 8px 0; }
  .section-item { font-size: 12px; padding: 3px 0 3px 12px; border-left: 2px solid var(--border); margin: 2px 0; }
  .section-heading { color: var(--text); font-weight: 600; }
  .section-purpose { color: var(--text2); font-style: italic; }
  .section-wc { color: var(--text2); font-size: 10px; }
  .overlap-card { background: var(--surface); border: 1px solid var(--warn); border-radius: 6px; padding: 12px; margin: 8px 0; }
  .overlap-pct { font-size: 20px; font-weight: bold; color: var(--warn); }
  .fragment-card { background: var(--surface); border: 1px solid var(--danger); border-radius: 6px; padding: 10px; margin: 6px 0; }
  .drift-card { background: var(--surface); border: 1px solid var(--warn); border-radius: 6px; padding: 10px; margin: 6px 0; }
  .concept-row { background: var(--surface); border: 1px solid var(--border); border-radius: 6px; padding: 10px; margin: 6px 0; display: flex; gap: 12px; align-items: flex-start; }
  .concept-name { font-weight: bold; color: var(--purple); min-width: 160px; font-size: 13px; }
  .concept-files { font-size: 12px; color: var(--text2); flex: 1; }
  .opening { font-size: 12px; color: var(--text2); font-style: italic; margin: 4px 0; max-height: 60px; overflow: hidden; }
  .dir-group { margin: 16px 0; }
  .dir-name { font-size: 14px; color: var(--good); margin-bottom: 4px; cursor: pointer; }
  .dir-name::before { content: '▶ '; font-size: 10px; }
  .dir-name.open::before { content: '▼ '; }
  .dir-contents { display: none; }
  .dir-contents.open { display: block; }
  .search-box { width: 100%; padding: 8px 12px; background: var(--surface); border: 1px solid var(--border); border-radius: 6px; color: var(--text); font-size: 14px; margin: 12px 0; }
  .search-box::placeholder { color: var(--text2); }
  .hidden { display: none !important; }
  .collapse-btn { cursor: pointer; color: var(--accent); font-size: 11px; margin-left: 8px; }
  details { margin: 4px 0; }
  summary { cursor: pointer; font-size: 12px; color: var(--accent); }
  .deity-tag { display: inline-block; background: #1a1e2e; border: 1px solid #4040a0; border-radius: 3px; padding: 1px 6px; margin: 2px; font-size: 11px; color: #8888ff; }
  .element-tag { display: inline-block; background: #1a2e1e; border: 1px solid #40a040; border-radius: 3px; padding: 1px 6px; margin: 2px; font-size: 11px; color: #88ff88; }
  .section-ref-tag { display: inline-block; background: #2e2a1a; border: 1px solid #a0a040; border-radius: 3px; padding: 1px 6px; margin: 2px; font-size: 11px; color: #ffff88; }
</style>
</head>
<body>

<h1>EUCLID Document Discovery Report</h1>
<p style="color:var(--text2); margin-bottom: 16px;">
  Scanned: ${folderPaths.join(', ')}<br>
  Generated: ${new Date().toISOString().slice(0, 19)}
</p>

<div class="stats">
  <div class="stat"><div class="stat-val">${totalDocs}</div><div class="stat-label">Documents</div></div>
  <div class="stat"><div class="stat-val">${Math.round(totalWords / 1000)}k</div><div class="stat-label">Words</div></div>
  <div class="stat"><div class="stat-val">${emptyDocs}</div><div class="stat-label">Empty/Stubs</div></div>
  <div class="stat"><div class="stat-val">${overlaps.length}</div><div class="stat-label">Overlapping Pairs</div></div>
  <div class="stat"><div class="stat-val">${fragments.length}</div><div class="stat-label">Fragments</div></div>
  <div class="stat"><div class="stat-val">${drifted.length}</div><div class="stat-label">Name≠Content Drift</div></div>
  <div class="stat"><div class="stat-val">${Object.keys(conceptMap).length}</div><div class="stat-label">Concepts Found</div></div>
</div>

<div class="tab-bar">
  <div class="tab active" data-tab="all-docs">All Documents</div>
  <div class="tab" data-tab="concepts">Concept Map</div>
  <div class="tab" data-tab="overlaps">Overlaps (${overlaps.length})</div>
  <div class="tab" data-tab="fragments">Fragments (${fragments.length})</div>
  <div class="tab" data-tab="drift">Name Drift (${drifted.length})</div>
</div>

<!-- ALL DOCUMENTS TAB -->
<div id="all-docs" class="tab-content active">
  <input type="text" class="search-box" placeholder="Search documents by name, purpose, or concept..." id="docSearch">
  ${Object.entries(byDirectory).sort((a,b) => a[0].localeCompare(b[0])).map(([dir, docs]) => `
    <div class="dir-group">
      <div class="dir-name" onclick="this.classList.toggle('open'); this.nextElementSibling.classList.toggle('open')">
        ${dir.replace(/\/sessions\/keen-ecstatic-darwin\/mnt\//g, '')} (${docs.length} files)
      </div>
      <div class="dir-contents">
        ${docs.sort((a,b) => a.filename.localeCompare(b.filename)).map(doc => `
          <div class="doc-card ${doc.isEmpty ? 'empty' : ''}" data-searchable="${(doc.filename + ' ' + doc.purpose + ' ' + Object.keys(doc.conceptPresence).join(' ')).toLowerCase()}">
            <div class="doc-name">${escapeHtml(doc.filename)}</div>
            <div class="doc-purpose">${escapeHtml(doc.purpose)}</div>
            <div class="doc-meta">${doc.wordCount} words · ${doc.sectionCount} sections · ${Object.keys(doc.conceptPresence).length} concepts</div>
            ${doc.deityMentions.length ? `<div style="margin-top:4px">${doc.deityMentions.map(d => `<span class="deity-tag">${d}</span>`).join('')}</div>` : ''}
            ${doc.elementMentions.length ? `<div>${doc.elementMentions.map(e => `<span class="element-tag">${e}</span>`).join('')}</div>` : ''}
            ${doc.sectionRefs.length ? `<div>${doc.sectionRefs.map(s => `<span class="section-ref-tag">${s}</span>`).join('')}</div>` : ''}
            ${Object.keys(doc.conceptPresence).length ? `<div style="margin-top:4px">${Object.keys(doc.conceptPresence).map(c => `<span class="concept-tag">${c} (${doc.conceptPresence[c].count})</span>`).join('')}</div>` : ''}
            ${doc.openingContent ? `<div class="opening">"${escapeHtml(doc.openingContent.slice(0, 200))}..."</div>` : ''}
            ${doc.sections.length ? `
              <details>
                <summary>${doc.sections.length} sections</summary>
                <div class="section-list">
                  ${doc.sections.map(s => `
                    <div class="section-item">
                      <span class="section-heading">${'  '.repeat(s.level - 1)}${'#'.repeat(s.level)} ${escapeHtml(s.heading)}</span>
                      <span class="section-wc">(${s.wordCount}w)</span>
                      <span class="section-purpose">— ${escapeHtml(s.purpose)}</span>
                    </div>
                  `).join('')}
                </div>
              </details>
            ` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `).join('')}
</div>

<!-- CONCEPT MAP TAB -->
<div id="concepts" class="tab-content">
  <h3>Which documents cover which concepts?</h3>
  <p style="color:var(--text2); margin-bottom: 12px; font-size: 13px;">
    Concepts detected by actual content scanning, not filename guessing. Count = keyword hits in document.
  </p>
  ${Object.entries(conceptMap).sort((a,b) => b[1].length - a[1].length).map(([concept, files]) => `
    <div class="concept-row">
      <div class="concept-name">${concept.replace(/_/g, ' ')} <span style="color:var(--text2); font-weight:normal">(${files.length} docs)</span></div>
      <div class="concept-files">${files.sort((a,b) => b.count - a.count).map(f => `${f.file} <span style="color:var(--text2)">(${f.count})</span>`).join(' · ')}</div>
    </div>
  `).join('')}
</div>

<!-- OVERLAPS TAB -->
<div id="overlaps" class="tab-content">
  <h3>Document pairs with significant content overlap</h3>
  <p style="color:var(--text2); margin-bottom: 12px; font-size: 13px;">
    Measured by vocabulary fingerprint + concept overlap. Higher % = more redundant.
  </p>
  ${overlaps.slice(0, 80).map(o => `
    <div class="overlap-card">
      <span class="overlap-pct">${o.similarity}%</span> overlap
      <div style="margin-top:6px">
        <strong style="color:var(--accent)">${escapeHtml(o.fileA)}</strong>
        <span style="color:var(--text2); font-size:12px">— ${escapeHtml(o.purposeA)}</span>
      </div>
      <div>
        <strong style="color:var(--accent)">${escapeHtml(o.fileB)}</strong>
        <span style="color:var(--text2); font-size:12px">— ${escapeHtml(o.purposeB)}</span>
      </div>
      <div style="margin-top:4px; font-size:11px; color:var(--text2)">
        Shared concepts: ${o.sharedConcepts.map(c => `<span class="concept-tag">${c}</span>`).join('')}
      </div>
    </div>
  `).join('')}
</div>

<!-- FRAGMENTS TAB -->
<div id="fragments" class="tab-content">
  <h3>Files that are stubs, empty, or misleadingly general-named</h3>
  ${fragments.map(f => `
    <div class="fragment-card">
      <strong style="color:var(--danger)">${escapeHtml(f.file)}</strong>
      <span style="color:var(--text2); font-size:12px; margin-left:8px">${f.wordCount} words</span>
      <div style="font-size:12px; color:var(--warn); margin-top:4px">Reason: ${f.reason}</div>
      ${f.concepts.length ? `<div style="margin-top:4px">${f.concepts.map(c => `<span class="concept-tag">${c}</span>`).join('')}</div>` : '<div style="font-size:11px; color:var(--text2); margin-top:4px">No recognized concepts</div>'}
      <div style="font-size:10px; color:var(--text2); margin-top:2px">${f.path.replace(/\/sessions\/keen-ecstatic-darwin\/mnt\//g, '')}</div>
    </div>
  `).join('')}
</div>

<!-- DRIFT TAB -->
<div id="drift" class="tab-content">
  <h3>Files where the name claims something the content doesn't deliver</h3>
  ${drifted.map(d => `
    <div class="drift-card">
      <strong style="color:var(--warn)">${escapeHtml(d.file)}</strong>
      <div style="font-size:12px; margin-top:4px">
        <span style="color:var(--danger)">Name suggests:</span> ${d.nameSuggests.map(c => `<span class="concept-tag">${c}</span>`).join('')}
      </div>
      <div style="font-size:12px; margin-top:4px">
        <span style="color:var(--good)">Content actually covers:</span> ${d.contentActuallyCovers.map(c => `<span class="concept-tag">${c}</span>`).join('')}
      </div>
      <div style="font-size:12px; margin-top:4px">
        <span style="color:var(--danger)">Missing from content:</span> ${d.missingFromContent.map(c => `<span class="concept-tag" style="border-color:var(--danger)">${c}</span>`).join('')}
      </div>
      <div style="font-size:12px; color:var(--text2); margin-top:4px">Actual purpose: ${escapeHtml(d.purpose)}</div>
    </div>
  `).join('')}
</div>

<script>
// Tab switching
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
  });
});

// Search
const searchBox = document.getElementById('docSearch');
if (searchBox) {
  searchBox.addEventListener('input', () => {
    const q = searchBox.value.toLowerCase();
    document.querySelectorAll('.doc-card').forEach(card => {
      const searchable = card.getAttribute('data-searchable');
      card.classList.toggle('hidden', q && !searchable.includes(q));
    });
    // Auto-open directories that have visible results
    document.querySelectorAll('.dir-group').forEach(group => {
      const visible = group.querySelectorAll('.doc-card:not(.hidden)').length;
      const dirName = group.querySelector('.dir-name');
      const dirContents = group.querySelector('.dir-contents');
      if (q && visible > 0) {
        dirName.classList.add('open');
        dirContents.classList.add('open');
      } else if (!q) {
        dirName.classList.remove('open');
        dirContents.classList.remove('open');
      }
    });
  });
}
</script>

</body>
</html>`;
}

function escapeHtml(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const folders = [];
  let outPath = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--out' && args[i + 1]) {
      outPath = args[++i];
    } else {
      folders.push(args[i]);
    }
  }

  if (folders.length === 0) {
    console.error('Usage: node doc-scanner.mjs <folder1> [folder2] ... [--out report.html]');
    process.exit(1);
  }

  console.log(`Scanning ${folders.length} folder(s)...`);

  let allDocs = [];
  for (const folder of folders) {
    console.log(`  Scanning: ${folder}`);
    const docs = await scanFolder(folder);
    console.log(`    Found ${docs.length} documents`);
    allDocs = allDocs.concat(docs);
  }

  console.log(`\nTotal: ${allDocs.length} documents, ${Math.round(allDocs.reduce((s, d) => s + d.wordCount, 0) / 1000)}k words`);

  console.log('Detecting overlaps...');
  const overlaps = detectOverlaps(allDocs);
  console.log(`  Found ${overlaps.length} overlapping pairs`);

  console.log('Detecting fragments...');
  const fragments = detectFragments(allDocs);
  console.log(`  Found ${fragments.length} fragments`);

  console.log('Detecting name/content drift...');
  const drifted = detectDrift(allDocs);
  console.log(`  Found ${drifted.length} drifted files`);

  if (outPath) {
    console.log(`\nGenerating HTML report: ${outPath}`);
    const html = generateHTML(allDocs, overlaps, fragments, drifted, folders);
    await fs.writeFile(outPath, html, 'utf-8');
    console.log(`Report written: ${outPath}`);
  } else {
    // Console summary
    console.log('\n=== TOP OVERLAPS ===');
    for (const o of overlaps.slice(0, 15)) {
      console.log(`  ${o.similarity}% — ${o.fileA} ↔ ${o.fileB}`);
    }
    console.log('\n=== FRAGMENTS ===');
    for (const f of fragments.slice(0, 15)) {
      console.log(`  ${f.file} — ${f.reason}`);
    }
    console.log('\n=== DRIFT ===');
    for (const d of drifted.slice(0, 15)) {
      console.log(`  ${d.file} — name suggests [${d.nameSuggests}] but content has [${d.contentActuallyCovers}]`);
    }
  }

  // Also write JSON for programmatic access
  const jsonPath = (outPath || 'discovery-report.html').replace('.html', '.json');
  const jsonData = {
    generatedAt: new Date().toISOString(),
    folders,
    totalDocs: allDocs.length,
    totalWords: allDocs.reduce((s, d) => s + d.wordCount, 0),
    documents: allDocs.map(d => ({
      path: d.path,
      filename: d.filename,
      directory: d.directory,
      wordCount: d.wordCount,
      sectionCount: d.sectionCount,
      purpose: d.purpose,
      concepts: Object.keys(d.conceptPresence),
      sectionRefs: d.sectionRefs,
      deityMentions: d.deityMentions,
      elementMentions: d.elementMentions,
      isEmpty: d.isEmpty,
      sections: d.sections.map(s => ({ heading: s.heading, level: s.level, wordCount: s.wordCount, purpose: s.purpose })),
    })),
    overlaps: overlaps.slice(0, 100),
    fragments,
    drifted,
  };
  await fs.writeFile(jsonPath, JSON.stringify(jsonData, null, 2), 'utf-8');
  console.log(`JSON data written: ${jsonPath}`);
}

main().catch(err => { console.error(err); process.exit(1); });
