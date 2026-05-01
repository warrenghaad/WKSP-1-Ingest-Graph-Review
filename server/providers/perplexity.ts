export interface ArticleResult {
  title: string;
  url: string;
  snippet: string;
  publishedDate?: string;
  source: string;
}

export interface PerplexitySearchResult {
  answer: string;
  citations: ArticleResult[];
  query: string;
}

export async function searchPerplexityForArtifact(
  artifactTitle: string,
  context?: string
): Promise<PerplexitySearchResult | null> {
  const apiKey = process.env.Perplexity;
  if (!apiKey) {
    console.log("[Perplexity] Skipped: Perplexity secret not set");
    return null;
  }

  const query = context
    ? `${artifactTitle} ${context} Mesopotamia archaeology scholarly`
    : `${artifactTitle} ancient Mesopotamia archaeological significance scholarly research`;

  try {
    const res = await fetch("https://api.perplexity.ai/chat/completions", {
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
            content: "You are an archaeological research assistant. Provide factual, scholarly information about ancient Mesopotamian artifacts. Be concise and cite sources.",
          },
          {
            role: "user",
            content: `Find scholarly information about: ${query}. Include museum accession numbers, dates, significance, and any related publications or databases.`,
          },
        ],
        max_tokens: 500,
        return_citations: true,
        return_images: false,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[Perplexity] Error:", res.status, err.slice(0, 200));
      return null;
    }

    const data = await res.json() as {
      choices?: Array<{ message?: { content?: string } }>;
      citations?: string[];
    };

    const answer = data.choices?.[0]?.message?.content ?? "";
    const citations: ArticleResult[] = (data.citations ?? []).map((url, i) => ({
      title: `Source ${i + 1}`,
      url,
      snippet: "",
      source: new URL(url).hostname,
    }));

    return { answer, citations, query };
  } catch (err) {
    console.error("[Perplexity] Fetch error:", err);
    return null;
  }
}

export async function extractArticleText(url: string): Promise<string | null> {
  const apiKey = process.env.Perplexity;
  if (!apiKey) return null;

  try {
    const res = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          {
            role: "user",
            content: `Extract and summarize the key scholarly content from this page about Mesopotamian artifacts: ${url}. Focus on: artifact descriptions, museum accession numbers, historical dating, cultural significance, and geometric/mathematical properties.`,
          },
        ],
        max_tokens: 800,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
    return data.choices?.[0]?.message?.content ?? null;
  } catch {
    return null;
  }
}
