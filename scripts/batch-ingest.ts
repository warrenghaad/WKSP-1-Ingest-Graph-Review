import fs from "fs";
import path from "path";

const BASE = path.join(process.cwd(), "attached_assets");
const API   = "http://localhost:5000/api/gecd/ingest";
const CHUNK  = 6000;   // chars per ingest call — keeps Gemini prompt well under limit
const DELAY  = 1500;   // ms between calls (rate-limit headroom)

// ── Files that contain real research content (not spec/impl docs) ─────────────
const PRIORITY: string[] = [
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

// ── Also pick up any remaining .md/.txt not in priority list ──────────────────
function allTextFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...allTextFiles(full));
    } else if (/\.(md|txt)$/i.test(entry.name)) {
      out.push(full.replace(BASE + path.sep, "").replace(/\\/g, "/"));
    }
  }
  return out;
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function chunkText(text: string, size: number): string[] {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    // Break at paragraph boundary near `size`
    let end = Math.min(i + size, text.length);
    if (end < text.length) {
      const nl = text.lastIndexOf("\n\n", end);
      if (nl > i + size * 0.5) end = nl;
    }
    chunks.push(text.slice(i, end).trim());
    i = end;
  }
  return chunks.filter(c => c.length > 80);
}

async function ingest(relPath: string, context: string, chunk: string, chunkIdx: number, total: number) {
  const label = `${relPath} [${chunkIdx+1}/${total}]`;
  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: chunk, context }),
    });
    const data: any = await res.json();
    if (!res.ok) {
      console.log(`  ✗ ${label}: ${data.error}`);
      return 0;
    }
    console.log(`  ✓ ${label}: ${data.extracted} node(s) — ${data.message}`);
    return data.extracted ?? 0;
  } catch (e: any) {
    console.log(`  ✗ ${label}: ${e.message}`);
    return 0;
  }
}

async function main() {
  const all = allTextFiles(BASE);
  const seen = new Set<string>();
  const queue: string[] = [];

  // Priority first, then the rest
  for (const f of PRIORITY) {
    if (all.includes(f)) { queue.push(f); seen.add(f); }
  }
  for (const f of all) {
    if (!seen.has(f)) queue.push(f);
  }

  console.log(`\n🏛  EUCLID BATCH INGEST — ${queue.length} files\n${"─".repeat(60)}`);

  let totalNodes = 0;
  let filesDone  = 0;

  for (const relPath of queue) {
    const fullPath = path.join(BASE, relPath);
    let text: string;
    try {
      text = fs.readFileSync(fullPath, "utf-8");
    } catch {
      console.log(`  SKIP (unreadable): ${relPath}`);
      continue;
    }

    if (text.trim().length < 100) {
      console.log(`  SKIP (too short): ${relPath}`);
      continue;
    }

    const context = path.basename(relPath, path.extname(relPath))
      .replace(/[_-]/g, " ").replace(/\d{10,}/g, "").trim();

    const chunks = chunkText(text, CHUNK);
    console.log(`\n📄 ${relPath}  (${chunks.length} chunk${chunks.length>1?"s":""})`);

    for (let i = 0; i < chunks.length; i++) {
      const n = await ingest(relPath, context, chunks[i], i, chunks.length);
      totalNodes += n;
      if (i < chunks.length - 1) await sleep(DELAY);
    }

    filesDone++;
    await sleep(DELAY);
  }

  console.log(`\n${"═".repeat(60)}`);
  console.log(`✅ Done — ${filesDone} files, ${totalNodes} total GECD nodes extracted`);
  console.log(`   Nodes are live in the 3D timeline at /timeline`);
}

main().catch(console.error);
