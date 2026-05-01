export interface ImageResult {
  url: string;
  title: string;
  source: string;
  tier?: 1 | 2 | 3;
}

// RWI-safe institution list for prompts
const RWI_SOURCES = `Metropolitan Museum of Art (metmuseum.org, CC0), CDLI (cdli.earth, cuneiform), British Museum (britishmuseum.org, CC BY-NC-SA), Penn Museum (penn.museum), Wikimedia Commons (verify license), Smarthistory (smarthistory.org, CC BY-NC-SA), World History Encyclopedia (worldhistory.org), Europeana (europeana.eu)`;

async function enhanceQueryWithGemini(rawQuery: string): Promise<string> {
  const apiKey = process.env.Google_AI;
  if (!apiKey) return rawQuery;
  try {
    const prompt = `You are a search query optimizer for finding images of ancient Mesopotamian artifacts and archaeological objects in museum collections. Given a phrase, produce a concise, effective search query for museum databases. Focus on visually searchable archaeological terms (artifact type, material, period, culture). Output ONLY the search query, nothing else.

Phrase: "${rawQuery}"`;
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 80 },
        }),
      }
    );
    if (!res.ok) return rawQuery;
    const data = await res.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || rawQuery;
  } catch {
    return rawQuery;
  }
}

async function searchWithPerplexity(query: string): Promise<ImageResult[]> {
  const apiKey = process.env.Perplexity;
  if (!apiKey) return [];

  const res = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "sonar",
      messages: [
        {
          role: "system",
          content: `You are a museum image finder for a Mesopotamian artifact curriculum that enforces Reading With Integrity (RWI) standards. Find only curator-verified images from trusted institutions.

ALLOWED sources: ${RWI_SOURCES}
FORBIDDEN sources: Pinterest, Google Images, stock photo sites (Shutterstock, Getty Images, Adobe Stock), tourism blogs, AI-generated images, any image without a traceable museum/institution source.

Return ONLY a JSON array:
- "url": direct image URL ending in .jpg, .png, .gif, or .webp (real, working)
- "title": curator-verified artifact name and period
- "source": institution name

Return 4–8 results. Output ONLY the JSON array, no other text.`,
        },
        { role: "user", content: `Find RWI-safe museum images of: ${query}` },
      ],
      max_tokens: 1500,
      temperature: 0.2,
    }),
  });

  if (!res.ok) {
    console.error("Perplexity API error:", res.status);
    return [];
  }

  const data = await res.json() as { choices?: { message?: { content?: string } }[] };
  const content = data.choices?.[0]?.message?.content ?? "";
  try {
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as { url?: unknown; title?: unknown; source?: unknown }[];
      return parsed
        .filter((item) => typeof item.url === "string" && typeof item.title === "string")
        .map((item) => ({
          url: String(item.url),
          title: String(item.title),
          source: String(item.source ?? "Unknown"),
          tier: 2 as const,
        }));
    }
  } catch (e) {
    console.error("Failed to parse Perplexity response:", e);
  }
  return [];
}

async function searchWithGemini(query: string): Promise<ImageResult[]> {
  const apiKey = process.env.Google_AI;
  if (!apiKey) return [];
  try {
    const prompt = `You are a museum image finder for a Mesopotamian artifact curriculum. Find real, publicly accessible image URLs from trusted institutions only.

ALLOWED: ${RWI_SOURCES}
FORBIDDEN: Pinterest, stock photos, AI-generated images, unverified blogs.

For query: "${query}"

Return a JSON array of 4–8 results:
- "url": direct image URL (.jpg, .png, .webp)
- "title": artifact name and period
- "source": institution name
- "tier": 1 (Tier-1 museum CC0) or 2 (academic/open) or 3 (curated secondary)

Output ONLY the JSON array.`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.15, maxOutputTokens: 1500 },
        }),
      }
    );
    if (!res.ok) return [];
    const data = await res.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]";
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    const images = JSON.parse(jsonMatch[0]) as { url?: unknown; title?: unknown; source?: unknown; tier?: unknown }[];
    return images
      .filter((img) => typeof img.url === "string")
      .map((img) => ({
        url: String(img.url),
        title: String(img.title ?? "Untitled"),
        source: String(img.source ?? "Gemini Research"),
        tier: (img.tier === 1 || img.tier === 2 || img.tier === 3 ? img.tier : 3) as 1 | 2 | 3,
      }));
  } catch (err) {
    console.error("Gemini fallback search error:", err);
    return [];
  }
}

export async function enrichQueryWithOntologyTags(
  baseQuery: string,
  tags: string[],
  _storage?: unknown
): Promise<string> {
  const terms: string[] = [baseQuery];
  const MATERIAL_NAMES: Record<string, string> = {
    "mat-stone": "stone", "mat-clay": "ceramic clay", "mat-wood": "wood",
    "mat-metal": "metal", "mat-textile": "textile fabric", "mat-glass": "glass",
    "mat-papyrus": "papyrus paper",
  };
  const CULTURE_NAMES: Record<string, string> = {
    "civ-egypt": "Egyptian ancient Egypt", "civ-greece": "Greek classical Greece",
    "civ-islam": "Islamic", "civ-india": "Indian South Asian", "civ-china": "Chinese",
    "civ-meso": "Mesoamerican", "civ-medieval-eu": "Medieval European",
    "civ-renaissance": "Renaissance", "civ-andes": "Andean",
  };
  const TECH_NAMES: Record<string, string> = {
    "tech-incision": "engraved", "tech-carving": "carved", "tech-casting": "cast metal",
    "tech-weaving": "woven textile", "tech-mosaic": "mosaic", "tech-tiling": "tiled",
    "tech-painting": "painted", "tech-masonry": "masonry stone",
  };

  let cultureAdded = false;
  for (const tag of tags) {
    if (MATERIAL_NAMES[tag]) {
      terms.push(MATERIAL_NAMES[tag]);
    } else if (!cultureAdded && CULTURE_NAMES[tag]) {
      terms.push(CULTURE_NAMES[tag]);
      cultureAdded = true;
    } else if (TECH_NAMES[tag]) {
      terms.push(TECH_NAMES[tag]);
    }
  }

  return terms.join(" ");
}

export async function searchImages(rawQuery: string): Promise<ImageResult[]> {
  const enhancedQuery = await enhanceQueryWithGemini(rawQuery);
  console.log(`[imageSearch] "${rawQuery}" → "${enhancedQuery}"`);

  let results = await searchWithPerplexity(enhancedQuery);
  if (results.length === 0) {
    results = await searchWithGemini(enhancedQuery);
  }
  return results;
}
