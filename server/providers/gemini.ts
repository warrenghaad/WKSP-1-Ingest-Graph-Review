export interface GeminiImageResult {
  url: string;
  prompt: string;
  model: string;
  mimeType: string;
}

export async function generateGeminiImage(
  prompt: string,
  style: "museum_photograph" | "reconstruction" | "diagram" | "illustration" = "museum_photograph"
): Promise<GeminiImageResult | null> {
  const apiKey = process.env.Google_AI;
  if (!apiKey) {
    console.log("[Gemini] Skipped: Google_AI key not set");
    return null;
  }

  const stylePrefix: Record<typeof style, string> = {
    museum_photograph:
      "Museum-quality archival photograph of an ancient artifact, professional lighting, white background, high resolution, educational reference quality:",
    reconstruction:
      "Archaeological reconstruction illustration, scholarly accuracy, detailed academic style:",
    diagram:
      "Clean schematic diagram with labels, academic publication quality, clear line art on white background:",
    illustration:
      "Detailed historical illustration, Victorian-era scholarly engraving style, accurate period detail:",
  };

  const fullPrompt = `${stylePrefix[style]} ${prompt}`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }],
          generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error("[Gemini] API error:", res.status, err.slice(0, 200));
      return null;
    }

    const data = await res.json() as {
      candidates?: Array<{
        content?: { parts?: Array<{ inlineData?: { data: string; mimeType: string } }> };
      }>;
    };

    const parts = data.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find((p) => p.inlineData);
    if (!imagePart?.inlineData) {
      console.warn("[Gemini] No image part in response");
      return null;
    }

    const { data: b64, mimeType } = imagePart.inlineData;
    const dataUrl = `data:${mimeType};base64,${b64}`;
    return { url: dataUrl, prompt: fullPrompt, model: "gemini-2.0-flash-preview-image-generation", mimeType };
  } catch (err) {
    console.error("[Gemini] Fetch error:", err);
    return null;
  }
}

export async function searchGeminiForArtifact(
  artifactTitle: string,
  museumId?: string
): Promise<string | null> {
  const apiKey = process.env.Google_AI;
  if (!apiKey) return null;

  const query = museumId
    ? `${artifactTitle} museum accession ${museumId} ancient Mesopotamia`
    : `${artifactTitle} ancient Mesopotamian artifact archaeological`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an archaeologist curating a research database. For the artifact "${artifactTitle}"${museumId ? ` (museum ID: ${museumId})` : ""}, write a concise 3-sentence scholarly description covering: (1) what it is and its material/dimensions if known, (2) its historical significance in Mesopotamian culture, (3) which MAGIC dimension it best exemplifies (Mathematics, Aesthetics/Art, Geometry, Institutionalization, or Control/Power). Be precise and academic. Do not add filler.`
            }]
          }],
          generationConfig: { maxOutputTokens: 300 }
        }),
      }
    );
    if (!res.ok) return null;
    const data = await res.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
  } catch {
    return null;
  }
}

export interface Gemini15SearchResult {
  enrichedQuery: string;
  candidateUrls: Array<{ url: string; title: string; source: string }>;
}

export async function searchGemini15ForArtifact(
  query: string
): Promise<Gemini15SearchResult | null> {
  const apiKey = process.env.Google_AI;
  if (!apiKey) {
    console.log("[Gemini15] Skipped: Google_AI key not set");
    return null;
  }

  const RWI_SOURCES = `Metropolitan Museum of Art (metmuseum.org), CDLI (cdli.earth), British Museum (britishmuseum.org), Penn Museum (penn.museum), Wikimedia Commons, Smarthistory (smarthistory.org), World History Encyclopedia (worldhistory.org)`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a museum image search specialist for ancient Mesopotamian artifacts. Given the search query "${query}", do two things:

1. Write an enriched, archaeologically precise search query (max 12 words) that would surface the best results in museum image databases.
2. List 3-5 real, publicly accessible image URLs from trusted institutions only. Allowed: ${RWI_SOURCES}. Forbidden: Pinterest, stock sites, AI-generated images.

Return ONLY valid JSON in this exact shape:
{
  "enrichedQuery": "<optimized search string>",
  "candidateUrls": [
    { "url": "<direct image URL ending in .jpg/.png/.webp>", "title": "<artifact name and period>", "source": "<institution name>" }
  ]
}

Output ONLY the JSON object. No markdown, no explanation.`
            }]
          }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 800 }
        }),
      }
    );

    if (!res.ok) {
      console.error("[Gemini15] API error:", res.status);
      return null;
    }

    const data = await res.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]) as Gemini15SearchResult;
    if (!parsed.enrichedQuery) return null;
    return {
      enrichedQuery: parsed.enrichedQuery,
      candidateUrls: Array.isArray(parsed.candidateUrls) ? parsed.candidateUrls : [],
    };
  } catch (err) {
    console.error("[Gemini15] Error:", err);
    return null;
  }
}
