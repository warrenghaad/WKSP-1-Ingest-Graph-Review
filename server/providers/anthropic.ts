import Anthropic from "@anthropic-ai/sdk";

let _client: Anthropic | null = null;
function client(): Anthropic | null {
  const apiKey = process.env.anthropic;
  if (!apiKey) return null;
  if (!_client) _client = new Anthropic({ apiKey });
  return _client;
}

export interface ResearchRequest {
  prompt: string;
  selection?: string;
  lessonTitle?: string;
  lessonContext?: string;
}

export interface ResearchResult {
  content: string;
  model: string;
  inputTokens?: number;
  outputTokens?: number;
}

const SYSTEM_PROMPT = `You are a research assistant for the Chronos/EUCLID Mesopotamian artifact research platform.

When asked to research a topic, you produce concise, factual Markdown suitable for direct insertion into a scholarly lesson. Rules:

- Output Markdown only (headings, lists, blockquotes, links). No preamble or sign-off.
- Cite sources inline as [Author Year] or [Museum Accession] when known. Never invent citations.
- If a claim cannot be verified from training data, mark it with "*[needs verification]*".
- Prefer 150–400 words unless asked otherwise. Tighter is better.
- For artifacts: include period, provenance, material, current museum/accession, and the geometric/mathematical/ideological significance (the MAGIC framework lens) when relevant.
- Never overwrite the user's existing prose — your output will be inserted at their cursor as a new block.`;

export async function researchWithClaude(
  req: ResearchRequest
): Promise<ResearchResult | null> {
  const c = client();
  if (!c) {
    console.log("[Anthropic] Skipped: anthropic secret not set");
    return null;
  }

  const userParts: string[] = [];
  if (req.lessonTitle) userParts.push(`Lesson: "${req.lessonTitle}"`);
  if (req.lessonContext) userParts.push(`Lesson context (excerpt):\n${req.lessonContext.slice(0, 2000)}`);
  if (req.selection) userParts.push(`Highlighted text from the lesson:\n> ${req.selection.slice(0, 2000)}`);
  userParts.push(`Research request:\n${req.prompt}`);

  const userMessage = userParts.join("\n\n");

  try {
    const res = await c.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const textBlock = res.content.find((b) => b.type === "text");
    const content = textBlock && textBlock.type === "text" ? textBlock.text : "";

    return {
      content,
      model: res.model,
      inputTokens: res.usage?.input_tokens,
      outputTokens: res.usage?.output_tokens,
    };
  } catch (err: any) {
    console.error("[Anthropic] Error:", err?.message || err);
    return null;
  }
}
