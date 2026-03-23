#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import OpenAI from 'openai';
import sharp from 'sharp';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const BATCH_ROOT = path.join(REPO_ROOT, 'CORRECTED_SRQ_V7_FIGMA_BATCH');
const PLAN_PATH = path.join(BATCH_ROOT, 'surface_image_plan.json');
const BATCH_INDEX_PATH = path.join(BATCH_ROOT, 'batch_index.json');
const IMAGE_DIR = path.join(BATCH_ROOT, 'FIGMA_PAGES', 'assets', 'images');
const BASE_CACHE_DIR = path.join(IMAGE_DIR, '_generated_bases');
const MANIFEST_PATH = path.join(IMAGE_DIR, '_surface_generation_manifest.json');
const ENV_PATHS = [
  path.join(REPO_ROOT, '.env'),
  path.join(REPO_ROOT, 'AGENTIC FLOWS', '.env')
];

for (const envPath of ENV_PATHS) {
  dotenv.config({ path: envPath, override: false });
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not configured in the repo .env files.');
}

const client = new OpenAI({ apiKey: OPENAI_API_KEY });

function hashString(input) {
  return crypto.createHash('sha1').update(String(input)).digest('hex').slice(0, 12);
}

function escapeXml(input) {
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapTextLines(text, maxChars = 42) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 3);
}

function weekAccent(lessonId) {
  if (lessonId.endsWith('W1')) return '#F97316';
  if (lessonId.endsWith('W2')) return '#6366F1';
  return '#2563EB';
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, 'utf8'));
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function uniqueImageSpecs(surfacePlan) {
  const map = new Map();
  for (const item of surfacePlan) {
    const key = item.prompt;
    if (!map.has(key)) {
      map.set(key, {
        prompt: item.prompt,
        aspectRatio: item.aspectRatio,
        variants: [item.imageId]
      });
    } else {
      map.get(key).variants.push(item.imageId);
    }
  }
  return [...map.values()].map((item) => ({
    ...item,
    baseId: hashString(item.prompt)
  }));
}

async function downloadToBuffer(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download generated image: HTTP ${response.status}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function generateBaseImage(spec) {
  const basePath = path.join(BASE_CACHE_DIR, `${spec.baseId}.png`);
  if (await fileExists(basePath)) {
    return { basePath, reused: true };
  }

  const size = spec.aspectRatio === '16:9' ? '1792x1024' : '1024x1024';
  const response = await client.images.generate({
    model: 'dall-e-3',
    prompt: spec.prompt,
    n: 1,
    size,
    quality: 'hd',
    style: 'natural'
  });

  const imageUrl = response.data?.[0]?.url;
  if (!imageUrl) {
    throw new Error(`No image URL returned for base ${spec.baseId}`);
  }

  const imageBuffer = await downloadToBuffer(imageUrl);
  await fs.writeFile(basePath, imageBuffer);
  return {
    basePath,
    reused: false,
    revisedPrompt: response.data?.[0]?.revised_prompt || null
  };
}

async function copyBaseToTargets(surfacePlan, baseResultsByPrompt) {
  const copies = [];
  for (const item of surfacePlan) {
    const result = baseResultsByPrompt.get(item.prompt);
    const targetPath = path.join(IMAGE_DIR, item.outputFilename);
    await fs.copyFile(result.basePath, targetPath);
    copies.push({
      imageId: item.imageId,
      targetPath,
      basePath: result.basePath
    });
  }
  return copies;
}

async function createMotionBoard(lesson, assetMap) {
  const accent = weekAccent(lesson.id);
  const dayBImage = assetMap.get(`${lesson.id.toLowerCase()}-day-b`);
  if (!dayBImage) {
    throw new Error(`Missing day-b image for ${lesson.id}`);
  }
  const resizedDayB = await sharp(dayBImage)
    .resize(640, 480, { fit: 'cover', position: 'center' })
    .png()
    .toBuffer();

  const motionTitle = `${lesson.id} / Day B Motion Board`;
  const stepBlocks = lesson.motionBoard
    .map((item, index) => {
      const y = 216 + index * 132;
      const lines = wrapTextLines(item.concept, 40);
      const lineSvg = lines
        .map(
          (line, lineIndex) => `
        <text x="952" y="${y + 42 + lineIndex * 26}" font-family="Arial, sans-serif" font-weight="700" font-size="22" fill="#0F172A">${escapeXml(line)}</text>`
        )
        .join('');
      return `
      <g>
        <rect x="832" y="${y}" width="688" height="112" rx="26" fill="#FFFFFF" fill-opacity="0.9"/>
        <rect x="856" y="${y + 24}" width="68" height="64" rx="20" fill="${accent}" fill-opacity="0.14"/>
        <text x="890" y="${y + 65}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="26" fill="${accent}">${escapeXml(item.code)}</text>
        ${lineSvg}
        <text x="952" y="${y + 94}" font-family="Arial, sans-serif" font-size="18" fill="#475569">2.5D board for SmartEd placement</text>
      </g>`;
    })
    .join('\n');

  const svg = `
  <svg width="1600" height="900" viewBox="0 0 1600 900" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#FFF7ED"/>
        <stop offset="50%" stop-color="#FFFFFF"/>
        <stop offset="100%" stop-color="#EEF2FF"/>
      </linearGradient>
      <linearGradient id="panel" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${accent}" stop-opacity="0.16"/>
        <stop offset="100%" stop-color="${accent}" stop-opacity="0.03"/>
      </linearGradient>
    </defs>
    <rect width="1600" height="900" fill="url(#bg)"/>
    <rect x="48" y="48" width="1504" height="804" rx="36" fill="#FFFFFF" fill-opacity="0.78"/>
    <rect x="64" y="64" width="736" height="772" rx="32" fill="url(#panel)"/>
    <text x="88" y="120" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="${accent}">EUCLID / ${escapeXml(lesson.gradeLabel)} / ${escapeXml(lesson.element)}</text>
    <text x="88" y="166" font-family="Arial, sans-serif" font-size="42" font-weight="800" fill="#0F172A">${escapeXml(motionTitle)}</text>
    <text x="88" y="202" font-family="Arial, sans-serif" font-size="22" fill="#334155">B3, B5, B6, and B8 staged as a SmartEd-ready 2.5D storyboard board.</text>
    <text x="832" y="120" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="${accent}">FOUR MOTION STUDIES</text>
    <text x="832" y="166" font-family="Arial, sans-serif" font-size="42" font-weight="800" fill="#0F172A">${escapeXml(lesson.deity)} / ${escapeXml(lesson.element)}</text>
    <text x="832" y="202" font-family="Arial, sans-serif" font-size="22" fill="#334155">${escapeXml(lesson.dayBSummary)}</text>
    ${stepBlocks}
  </svg>`;

  const outputPath = path.join(IMAGE_DIR, `${lesson.id.toLowerCase()}-motion-board.png`);
  await sharp({
    create: {
      width: 1600,
      height: 900,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
    .composite([
      { input: Buffer.from(svg), top: 0, left: 0 },
      { input: resizedDayB, top: 250, left: 96 }
    ])
    .png()
    .toFile(outputPath);

  return outputPath;
}

async function createGradeHero(grade, lessons) {
  const width = 1600;
  const height = 720;
  const columns = [];
  const overlays = [];
  const baseY = 160;
  const cardWidth = 472;
  const cardHeight = 420;

  for (let i = 0; i < lessons.length; i++) {
    const lesson = lessons[i];
    const imgPath = path.join(IMAGE_DIR, `${lesson.id.toLowerCase()}-overview.png`);
    const x = 64 + i * (cardWidth + 32);
    const resized = await sharp(imgPath)
      .resize(cardWidth, cardHeight, { fit: 'cover', position: 'center' })
      .png()
      .toBuffer();
    columns.push({ input: resized, top: baseY, left: x });
    overlays.push(`
      <g>
        <rect x="${x}" y="${baseY + 320}" width="${cardWidth}" height="100" rx="24" fill="#0F172A" fill-opacity="0.72"/>
        <text x="${x + 28}" y="${baseY + 362}" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#FFFFFF">${escapeXml(lesson.id)}</text>
        <text x="${x + 28}" y="${baseY + 392}" font-family="Arial, sans-serif" font-size="20" fill="#E2E8F0">${escapeXml(lesson.deity)} / ${escapeXml(lesson.element)}</text>
      </g>`);
  }

  const svg = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#FFF7ED"/>
        <stop offset="50%" stop-color="#FFFFFF"/>
        <stop offset="100%" stop-color="#E0F2FE"/>
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#bg)"/>
    <text x="64" y="88" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#F97316">EUCLID / Grade ${grade}</text>
    <text x="64" y="136" font-family="Arial, sans-serif" font-size="44" font-weight="800" fill="#0F172A">Corrected lesson surfaces for SmartEd</text>
    ${overlays.join('\n')}
  </svg>`;

  const outputPath = path.join(IMAGE_DIR, `grade-${grade}-hero.png`);
  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }, ...columns])
    .png()
    .toFile(outputPath);

  return outputPath;
}

async function createLibraryHero(lessons) {
  const width = 1600;
  const height = 860;
  const composites = [];
  const labels = [];

  const subset = lessons.slice(0, 9);
  for (let index = 0; index < subset.length; index++) {
    const lesson = subset[index];
    const row = Math.floor(index / 3);
    const col = index % 3;
    const x = 64 + col * 496;
    const y = 180 + row * 200;
    const imgPath = path.join(IMAGE_DIR, `${lesson.id.toLowerCase()}-overview.png`);
    const resized = await sharp(imgPath)
      .resize(448, 180, { fit: 'cover', position: 'center' })
      .png()
      .toBuffer();
    composites.push({ input: resized, top: y, left: x });
    labels.push(`
      <g>
        <rect x="${x + 16}" y="${y + 120}" width="272" height="60" rx="18" fill="#0F172A" fill-opacity="0.74"/>
        <text x="${x + 36}" y="${y + 156}" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#FFFFFF">${escapeXml(lesson.id)}  ${escapeXml(lesson.deity)} / ${escapeXml(lesson.element)}</text>
      </g>`);
  }

  const svg = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#FFF7ED"/>
        <stop offset="35%" stop-color="#FFFFFF"/>
        <stop offset="100%" stop-color="#EDE9FE"/>
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#bg)"/>
    <text x="64" y="88" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#F97316">SmartEd / EUCLID Library</text>
    <text x="64" y="140" font-family="Arial, sans-serif" font-size="46" font-weight="800" fill="#0F172A">Nine corrected lesson entries for Grades 3–5</text>
    <text x="64" y="176" font-family="Arial, sans-serif" font-size="22" fill="#334155">Shamash / Circle, Sin / Crescent, and Ishtar / 8-Point Star across the first three weeks of each grade.</text>
    ${labels.join('\n')}
  </svg>`;

  const outputPath = path.join(IMAGE_DIR, 'library-hero.png');
  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }, ...composites])
    .png()
    .toFile(outputPath);

  return outputPath;
}

function attachGradeLabels(lessons) {
  return lessons.map((lesson) => ({ ...lesson, gradeLabel: `Grade ${lesson.grade}` }));
}

async function main() {
  await ensureDir(IMAGE_DIR);
  await ensureDir(BASE_CACHE_DIR);

  const surfacePlan = await readJson(PLAN_PATH);
  const batchIndex = await readJson(BATCH_INDEX_PATH);
  const uniqueSpecs = uniqueImageSpecs(surfacePlan);

  const baseResultsByPrompt = new Map();
  const baseManifest = [];

  for (const spec of uniqueSpecs) {
    const result = await generateBaseImage(spec);
    baseResultsByPrompt.set(spec.prompt, result);
    baseManifest.push({
      prompt: spec.prompt,
      baseId: spec.baseId,
      basePath: result.basePath,
      reused: result.reused ?? false,
      revisedPrompt: result.revisedPrompt || null,
      variants: spec.variants
    });
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }

  const copies = await copyBaseToTargets(surfacePlan, baseResultsByPrompt);
  const lessons = attachGradeLabels(batchIndex.lessons);

  const motionBoards = [];
  const assetMap = new Map(
    surfacePlan.map((item) => [
      item.imageId,
      path.join(IMAGE_DIR, item.outputFilename)
    ])
  );

  for (const lesson of lessons) {
    const motionBoardPath = await createMotionBoard(lesson, assetMap);
    motionBoards.push({ lessonId: lesson.id, motionBoardPath });
  }

  const gradeHeroes = [];
  for (const grade of [3, 4, 5]) {
    const heroPath = await createGradeHero(
      grade,
      lessons.filter((lesson) => lesson.grade === grade)
    );
    gradeHeroes.push({ grade, heroPath });
  }

  const libraryHeroPath = await createLibraryHero(lessons);

  await fs.writeFile(
    MANIFEST_PATH,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        uniquePromptCount: uniqueSpecs.length,
        copiedSurfaceCount: copies.length,
        motionBoardCount: motionBoards.length,
        gradeHeroCount: gradeHeroes.length,
        libraryHeroPath,
        baseManifest,
        copies,
        motionBoards,
        gradeHeroes
      },
      null,
      2
    )
  );

  console.log(`Generated ${uniqueSpecs.length} unique surface images, ${copies.length} copied lesson images, ${motionBoards.length} motion boards.`);
  console.log(`Output directory: ${IMAGE_DIR}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
