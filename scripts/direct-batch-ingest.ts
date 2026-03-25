/**
 * direct-batch-ingest.ts
 * Reads attached_assets, calls Gemini directly (3 parallel), writes to Postgres directly.
 * Image searches NOT fired here — they'll fire when nodes are viewed in the timeline.
 */

import fs from "fs";
import path from "path";
import { Pool } from "pg";

const BASE        = path.join(process.cwd(), "attached_assets");
const CHUNK       = 5000;
const CONCURRENCY = 3;           // 3 parallel Gemini calls
const DELAY_MS    = 500;
const GEMINI_TIMEOUT = 90_000;   // 90 s — gemini-2.5-flash can be slow

const GOOGLE_AI_KEY = process.env.Google_AI ?? process.env.GOOGLE_AI ?? "";
const DATABASE_URL  = process.env.DATABASE_URL ?? "";

const pool = new Pool({ connectionString: DATABASE_URL });

const SYSTEM = `You are a GECD (Geometric Element Civilization Development) research analyst specializing in ancient Mesopotamian history and the MAGIC framework.

Extract GECD nodes from the provided text. Each node is a historical moment where a geometric element intersected with civilization development.

Return a JSON array of GECD node objects. Each object MUST have ALL of these fields:
- id: string snake_case slug (e.g. "node_hassuna_ware_001")
- name: string artifact or concept name
- date_bce: number (positive BCE year) or null
- date_ce: number (positive CE year) or null  
- date_display: string like "c. 3500 BCE"
- geometric_element: MUST be one of ["circle","star","triangle","square","spiral","arc","hexagon","pyramid","dot","line","crescent","rectangle","cone","diamond","grid"]
- deity: string (Shamash/Ishtar/Enlil/Nabu/Tiamat/Anu/Nisaba/Marduk/Nanna/Inanna)
- magic_drivers: object with keys math, aesthetic, institutional, comptroller each 0-1
- description: string 1-2 sentences about this artifact and its geometric significance
- provenance: string museum or site location
- civilization: string
- intensification_category: one of ["object_form","functional_assembly","composite_geometry","complex_designed_system","decoration","simple_token","standardized_token"]
- connections: empty array []
- tags: string array 3-6 keywords
- image_prompt: vivid search prompt for an archaeological photograph
- notes: string or null

IMPORTANT: Only extract nodes that have a SPECIFIC artifact name, a SPECIFIC date or date range, and a CLEAR geometric element. No abstract concepts without physical evidence.
Respond with ONLY a valid JSON array — no markdown fences, no explanation text.`;

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

function chunkText(text: string, size: number): string[] {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    let end = Math.min(i + size, text.length);
    if (end < text.length) {
      const nl = text.lastIndexOf("\n\n", end);
      if (nl > i + size * 0.4) end = nl;
    }
    const c = text.slice(i, end).trim();
    if (c.length > 150) chunks.push(c);
    i = end;
  }
  return chunks;
}

async function callGemini(prompt: string): Promise<any[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GEMINI_TIMEOUT);
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GOOGLE_AI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 8192 },
        }),
      }
    );
    if (!res.ok) {
      const err = await res.text();
      process.stderr.write(`  Gemini HTTP ${res.status}: ${err.slice(0, 150)}\n`);
      return [];
    }
    const data: any = await res.json();
    let raw = (data.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]")
      .replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    if (!raw.startsWith("[")) {
      const m = raw.match(/\[[\s\S]*\]/);
      raw = m ? m[0] : "[]";
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : (parsed?.nodes ?? []);
    } catch {
      // Truncated response — recover all complete objects
      const objs: any[] = [];
      const objRegex = /\{[^{}]*(?:\{[^{}]*\}[^{}]*)?\}/g;
      let m: RegExpExecArray | null;
      while ((m = objRegex.exec(raw)) !== null) {
        try { objs.push(JSON.parse(m[0])); } catch { /* skip malformed */ }
      }
      if (objs.length) process.stderr.write(`  (recovered ${objs.length} objs from truncated JSON)\n`);
      return objs;
    }
  } catch (e: any) {
    if (e.name === "AbortError") process.stderr.write("  Gemini timeout\n");
    else process.stderr.write(`  Gemini error: ${e.message}\n`);
    return [];
  } finally {
    clearTimeout(timer);
  }
}

async function storeNode(node: any, source: string): Promise<boolean> {
  if (!node.id || !node.name || !node.geometric_element) return false;
  const nodeId = `gecd:${node.id}`;
  const md = node.magic_drivers ?? {};
  const payload = {
    ...node,
    source,
    date_display: node.date_display ?? (node.date_bce ? `c. ${node.date_bce} BCE` : `c. ${node.date_ce} CE`),
    magic_drivers: {
      math:         Number(md.math ?? 0),
      aesthetic:    Number(md.aesthetic ?? 0),
      institutional: Number(md.institutional ?? 0),
      comptroller:  Number(md.comptroller ?? 0),
    },
  };

  try {
    await pool.query(
      `INSERT INTO graph_nodes (node_id, node_type, label, description, payload, tags, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (node_id) DO UPDATE
         SET label       = EXCLUDED.label,
             payload     = EXCLUDED.payload,
             description = EXCLUDED.description`,
      [
        nodeId,
        "gecd_node",
        node.name,
        node.description ?? null,
        JSON.stringify(payload),
        node.tags ?? [],
      ]
    );
    return true;
  } catch (e: any) {
    process.stderr.write(`  DB error for ${nodeId}: ${e.message}\n`);
    return false;
  }
}

// ── File selection ────────────────────────────────────────────────────────────

const PRIORITY = [
  "RESEARCH INGESTION/Pasted--Seven-Geometric-Primitives-in-Ancient-Mesopotamian-Mat_1773206538463.txt",
  "RESEARCH INGESTION/Pasted-The-Mathematical-Canvas-A-K-8-Curriculum-for-Exploring-Art-History-Introduction-The-Symbiosis-of-P-1755815189920_1755815189921.txt",
  "RESEARCH INGESTION/Mesopotamia_Image_Reference_Guide_1773656544792.md",
  "RESEARCH INGESTION/MAGIC_ECD_GE_Chat_1773656517066.md",
  "RESEARCH INGESTION/PERPLEXITY-ARTIFACT-TASKS.md",
  "RESEARCH INGESTION/Pasted-Great-this-is-exactly-the-right-prism-first-order-1-Edi_1774121482533.txt",
  "FUNCTIONALITY/MAGIC_COGNITIVE_AFFORDANCES_SSOT_v7_1773656514465.md",
  "SSOT-003-TAGGING-ONTOLOGY.md",
  "SSOT-014-CULTURAL-AESTHETIC-VOCABULARY.md",
  "IMAGE SOURCING AND DESIGNING/EUCLID__CLAUDE_CHAT_-_MAGIC_ECD_GE_-__1773656523762.md",
  "IMAGE SOURCING AND DESIGNING/EUCLID_DETAILED_EACH_MAGIC_VARIABLE_<>_DETAILED_IN_EACH_LESSON__1773656522024.md",
  "IMAGE SOURCING AND DESIGNING/SECTION_CONTENT_SPECIFICATIONS_1774340189092.md",
  "FUNCTIONALITY/# EUCLID Mesopotamia Pilot Roadmap.md",
  "FUNCTIONALITY/Incoming Tagging.md",
];

const SKIP = [
  "REPLIT_FIRST_RUN","REPLIT_JOB","REPLIT_STORAGE","REPLIT_TEXTREADER",
  "PHASE1_REPLIT","CONTROL_PLANE_NASH","SEMANTIC_IMAGE_WORKBENCH",
  "RWI_IMAGE_PIPELINE","RWI_STORAGE","WIKI-NODE","SPECS-AUTOMATION",
  "SPECS-STUDIO","IMAGE_BATCH_DOWNLOAD","IMAGE BATCH DOWNLOADING",
  "MULTI_SOURCE_IMAGE","Image_Sourcing_System","museum-images-mapping",
  "Pasted-Absolutely","Pasted--Replit-Agent-Prompt","305_EUCLID_BOT",
  "EUCLID-AGENT_UI_UX","Pasted--EUCLID-Visual-Lookup","Pasted--GECD-3D",
  "REPLIT_FIRST_RUN_TEXTREADER_REPLIT",
];

function allTextFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) { out.push(...allTextFiles(full)); continue; }
    if (!/\.(md|txt)$/i.test(entry.name)) continue;
    const rel = full.replace(BASE + path.sep, "").replace(/\\/g, "/");
    if (!SKIP.some(p => rel.includes(p))) out.push(rel);
  }
  return out;
}

interface Chunk { rel: string; idx: number; total: number; text: string; }

async function main() {
  if (!GOOGLE_AI_KEY) { console.error("ERROR: Google_AI env not set"); process.exit(1); }
  if (!DATABASE_URL)  { console.error("ERROR: DATABASE_URL env not set"); process.exit(1); }

  // Only process the curated research content files
  const all = allTextFiles(BASE);
  const seen = new Set<string>(); const queue: string[] = [];
  for (const f of PRIORITY) if (all.includes(f) && !seen.has(f)) { queue.push(f); seen.add(f); }
  // Do NOT add the rest — most attached_assets are spec/impl docs, not research

  const chunks: Chunk[] = [];
  for (const rel of queue) {
    let text: string;
    try { text = fs.readFileSync(path.join(BASE, rel), "utf-8"); } catch { continue; }
    if (text.trim().length < 150) continue;
    const cs = chunkText(text, CHUNK);
    cs.forEach((c, i) => chunks.push({ rel, idx: i, total: cs.length, text: c }));
  }

  process.stdout.write(`\n🏛  EUCLID DIRECT BATCH INGEST\n`);
  process.stdout.write(`   ${queue.length} files → ${chunks.length} chunks (${CONCURRENCY} parallel)\n`);
  process.stdout.write(`${"─".repeat(60)}\n\n`);

  let totalNodes = 0, done = 0;

  for (let i = 0; i < chunks.length; i += CONCURRENCY) {
    const batch = chunks.slice(i, i + CONCURRENCY);
    const results = await Promise.all(batch.map(async (chunk) => {
      const context = path.basename(chunk.rel, path.extname(chunk.rel))
        .replace(/[_\-]/g, " ").replace(/\d{10,}/g, "").trim();
      const prompt = `${SYSTEM}\n\nContext (source document): ${context}\n\nText:\n\n${chunk.text}\n\nRESPOND WITH ONLY A JSON ARRAY.`;
      const nodes  = await callGemini(prompt);
      let stored = 0;
      for (const n of nodes) if (await storeNode(n, chunk.rel)) stored++;
      const label = `${path.basename(chunk.rel)} [${chunk.idx+1}/${chunk.total}]`;
      const tick = stored > 0 ? "✓" : "·";
      process.stdout.write(`  ${tick} [${done+1}/${chunks.length}] ${label}: ${stored} node(s)\n`);
      done++;
      return stored;
    }));
    totalNodes += results.reduce((a, b) => a + b, 0);
    process.stdout.write(`  ── running total: ${totalNodes} nodes\n`);
    if (i + CONCURRENCY < chunks.length) await sleep(DELAY_MS);
  }

  await pool.end();

  process.stdout.write(`\n${"═".repeat(60)}\n`);
  process.stdout.write(`✅ Done — ${totalNodes} GECD nodes from ${queue.length} files\n`);
  process.stdout.write(`   Refresh /timeline to see all nodes in 3D space\n\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
