import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export interface ImageResult {
  url: string;
  title: string;
  source: string;
}

async function enhanceQuery(rawQuery: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-5-mini",
    messages: [
      {
        role: "system",
        content: `You are a search query optimizer for finding images of ancient Mesopotamian artifacts and archaeological objects. Given a text selection or phrase, produce a concise, effective image search query. Focus on the most visually searchable terms. Output ONLY the search query, nothing else.`
      },
      {
        role: "user",
        content: `Create an image search query for: "${rawQuery}"`
      }
    ],
    max_completion_tokens: 80,
    temperature: 0.3,
  });

  return response.choices[0]?.message?.content?.trim() || rawQuery;
}

async function searchWithPerplexity(query: string): Promise<ImageResult[]> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    console.warn("PERPLEXITY_API_KEY not set, falling back to OpenAI search");
    return [];
  }

  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sonar",
      messages: [
        {
          role: "system",
          content: `You are a research image finder specializing in ancient Mesopotamian artifacts, archaeological objects, and museum collections. When asked about a topic, find real, publicly accessible image URLs from museums, academic sources, and reputable sites like Wikimedia Commons, the British Museum, the Metropolitan Museum of Art, the Louvre, the Penn Museum, etc.

Return ONLY a JSON array of objects with these fields:
- "url": direct image URL (must be a real, working image URL ending in .jpg, .png, .gif, or from a known image CDN)
- "title": descriptive title of the image
- "source": the institution or website name

Return 4-8 results. Output ONLY the JSON array, no other text.`
        },
        {
          role: "user",
          content: `Find real museum/academic images of: ${query}`
        }
      ],
      max_tokens: 1500,
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    console.error("Perplexity API error:", response.status, await response.text());
    return [];
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";

  try {
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.filter((item: any) =>
        item.url && typeof item.url === "string" &&
        item.title && typeof item.title === "string"
      ).map((item: any) => ({
        url: item.url,
        title: item.title,
        source: item.source || "Unknown",
      }));
    }
  } catch (e) {
    console.error("Failed to parse Perplexity response:", e);
  }

  return [];
}

async function searchWithOpenAI(query: string): Promise<ImageResult[]> {
  const response = await openai.chat.completions.create({
    model: "gpt-5-mini",
    messages: [
      {
        role: "system",
        content: `You are a research image finder specializing in ancient Mesopotamian artifacts. Find real, publicly accessible image URLs from museums and academic sources like Wikimedia Commons, the British Museum, Metropolitan Museum, Louvre, Penn Museum, etc.

Return ONLY a JSON array of objects with:
- "url": a real, publicly accessible image URL (use Wikimedia Commons URLs when possible, format: https://upload.wikimedia.org/wikipedia/commons/...)
- "title": descriptive title
- "source": institution name

Return 4-6 results. Output ONLY valid JSON.`
      },
      {
        role: "user",
        content: `Find real museum/academic images related to: ${query}`
      }
    ],
    max_completion_tokens: 1500,
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content || "";

  try {
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.filter((item: any) =>
        item.url && typeof item.url === "string" &&
        item.title && typeof item.title === "string"
      ).map((item: any) => ({
        url: item.url,
        title: item.title,
        source: item.source || "Unknown",
      }));
    }
  } catch (e) {
    console.error("Failed to parse OpenAI response:", e);
  }

  return [];
}

export async function searchImages(rawQuery: string): Promise<ImageResult[]> {
  const enhancedQuery = await enhanceQuery(rawQuery);
  console.log(`Search: "${rawQuery}" → Enhanced: "${enhancedQuery}"`);

  let results = await searchWithPerplexity(enhancedQuery);

  if (results.length === 0) {
    results = await searchWithOpenAI(enhancedQuery);
  }

  return results;
}
