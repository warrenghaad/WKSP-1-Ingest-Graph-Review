import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export interface ExtractedConcept {
  concept_id: string;
  label: string;
  description: string;
  visual_type: string;
  priority: string;
  search_queries: string[];
  ai_prompts: string[];
  diagram_prompt: string | null;
  tags: string[];
}

export async function extractConcepts(rawText: string, maxConcepts = 8): Promise<ExtractedConcept[]> {
  const response = await openai.chat.completions.create({
    model: "gpt-5-mini",
    messages: [
      {
        role: "system",
        content: `You are a visual concept extractor for ancient Mesopotamian research and curriculum content.

Given raw text, identify atomic visual concepts — specific things that can be depicted in an image.

For each concept, produce:
- concept_id: a slugified identifier (e.g., "akitu-festival-procession")
- label: short human-readable name
- description: 1-2 sentence description of what the image should show
- visual_type: one of "artifact", "scene", "diagram", "overlay", "timeline", "map", "mechanics"
- priority: "high", "medium", or "low" based on how central the concept is to the text
- search_queries: 3-5 search queries optimized for museum databases and open web (include institution-specific terms like "British Museum", "cylinder seal", "relief")
- ai_prompts: 2-3 detailed AI image generation prompts (museum-quality archaeological photography style)
- diagram_prompt: if the concept suits a diagram, provide a prompt; otherwise null
- tags: relevant topic tags (e.g., "deity", "architecture", "ritual", "geometry", "cuneiform")

Return ONLY a JSON array of concept objects. Extract up to ${maxConcepts} concepts, prioritizing the most visually distinctive and educationally important ones.`,
      },
      {
        role: "user",
        content: rawText,
      },
    ],
    max_completion_tokens: 4000,
    temperature: 0.4,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content || "";

  try {
    const parsed = JSON.parse(content);
    const concepts = parsed.concepts || parsed;
    if (Array.isArray(concepts)) {
      return concepts.map((c: any) => ({
        concept_id: c.concept_id || c.label?.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "unknown",
        label: c.label || "Untitled",
        description: c.description || "",
        visual_type: c.visual_type || "artifact",
        priority: c.priority || "medium",
        search_queries: Array.isArray(c.search_queries) ? c.search_queries : [],
        ai_prompts: Array.isArray(c.ai_prompts) ? c.ai_prompts : [],
        diagram_prompt: c.diagram_prompt || null,
        tags: Array.isArray(c.tags) ? c.tags : [],
      }));
    }
  } catch (e) {
    console.error("Failed to parse concept extraction response:", e);
  }

  return [];
}

export async function generateQueryPack(label: string, description: string): Promise<{ queries: string[]; prompts: string[] }> {
  const response = await openai.chat.completions.create({
    model: "gpt-5-mini",
    messages: [
      {
        role: "system",
        content: `Generate search queries and AI image prompts for the given visual concept.

Return JSON with:
- queries: 4-6 museum/academic search queries
- prompts: 2-3 detailed AI generation prompts (museum-quality archaeological photography style)

Output ONLY valid JSON.`,
      },
      {
        role: "user",
        content: `Concept: "${label}"\nDescription: ${description}`,
      },
    ],
    max_completion_tokens: 1000,
    temperature: 0.3,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content || "";
  try {
    const parsed = JSON.parse(content);
    return {
      queries: Array.isArray(parsed.queries) ? parsed.queries : [],
      prompts: Array.isArray(parsed.prompts) ? parsed.prompts : [],
    };
  } catch {
    return { queries: [], prompts: [] };
  }
}
