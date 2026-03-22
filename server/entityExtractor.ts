import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export interface ExtractedEntity {
  label: string;
  entityType: string;
  description: string;
  period?: string;
  region?: string;
  aliases?: string[];
  magicTags?: string[];
  searchQueries: string[];
  offsetStart?: number;
  offsetEnd?: number;
  snippet?: string;
}

export async function extractEntitiesFromText(text: string, maxEntities = 12): Promise<ExtractedEntity[]> {
  const response = await openai.chat.completions.create({
    model: "gpt-5-mini",
    messages: [
      {
        role: "system",
        content: `You are an entity extractor for ancient Mesopotamian and archaeological texts. Extract named entities (artifacts, places, people, concepts, materials, techniques) that would benefit from visual reference images.

For each entity, provide:
- label: canonical name
- entityType: one of "artifact", "place", "person", "concept", "material", "technique", "period", "culture", "deity"
- description: 1-2 sentence description
- period: time period if known (e.g. "c. 2600 BCE", "Neo-Assyrian")
- region: geographic region if known
- aliases: alternative names or spellings
- magicTags: MAGIC framework tags (M=Mathematics, A=Aesthetics/Art, G=Geometry, I=Institutionalization, C=Control/Power)
- searchQueries: 2-3 optimized image search queries for finding visual references
- offsetStart: character offset where entity first appears in text (approximate)
- offsetEnd: character offset where entity name ends
- snippet: the sentence or phrase containing the entity

Return max ${maxEntities} entities, prioritized by visual importance.
Return ONLY a JSON array, no other text.`
      },
      {
        role: "user",
        content: text,
      }
    ],
    max_completion_tokens: 3000,
  });

  const content = response.choices[0]?.message?.content || "";

  try {
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.filter((e: Record<string, unknown>) => e.label && e.entityType).map((e: Record<string, unknown>) => ({
        label: e.label,
        entityType: e.entityType || "concept",
        description: e.description || "",
        period: e.period,
        region: e.region,
        aliases: e.aliases || [],
        magicTags: e.magicTags || [],
        searchQueries: e.searchQueries || [e.label],
        offsetStart: e.offsetStart,
        offsetEnd: e.offsetEnd,
        snippet: e.snippet,
      }));
    }
  } catch (err) {
    console.error("Failed to parse entity extraction response:", err);
  }

  return [];
}
