const APP_API_BASE = process.env.APP_API_BASE || "";
const APP_API_KEY = process.env.APP_API_KEY || "";

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (APP_API_KEY) {
    headers["Authorization"] = `Bearer ${APP_API_KEY}`;
  }
  return headers;
}

async function proxyRequest(path: string, method: string, body?: any): Promise<{ ok: boolean; data?: any; error?: string }> {
  if (!APP_API_BASE) {
    return { ok: false, error: "APP_API_BASE not configured — backend offline" };
  }

  try {
    const url = `${APP_API_BASE}${path}`;
    const res = await fetch(url, {
      method,
      headers: getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, error: `Backend returned ${res.status}: ${text}` };
    }

    const data = await res.json().catch(() => ({}));
    return { ok: true, data };
  } catch (err: any) {
    return { ok: false, error: err.message || "Backend unreachable" };
  }
}

export async function checkBackendStatus(): Promise<{ online: boolean; message: string }> {
  if (!APP_API_BASE) {
    return { online: false, message: "APP_API_BASE not set" };
  }
  try {
    const res = await fetch(`${APP_API_BASE}/api/health`, {
      signal: AbortSignal.timeout(5000),
    });
    return { online: res.ok, message: res.ok ? "Connected" : `HTTP ${res.status}` };
  } catch {
    return { online: false, message: "Backend unreachable" };
  }
}

export async function sendResearchIngest(payload: {
  title: string;
  excerpt: string;
  sourceUrl?: string;
  citation?: string;
  tags?: Record<string, any>;
  autoSearchImages?: boolean;
  searchSources?: string[];
  maxConcepts?: number;
  maxImagesPerConcept?: number;
}) {
  return proxyRequest("/api/research/ingest", "POST", payload);
}

export async function sendImageSearch(payload: {
  artifact: string;
  sources?: string[];
  grade?: number;
  week?: number;
  sectionId?: string;
}) {
  return proxyRequest("/api/rwi/images/search", "POST", payload);
}

export async function sendImageApproval(payload: {
  artifactId: string;
  imageUrl: string;
  title: string;
  sourceUrl?: string;
  license?: string;
  author?: string;
  tags?: Record<string, any>;
  sectionId?: string;
  grade?: number;
  week?: number;
}) {
  return proxyRequest("/api/rwi/images/approve", "POST", payload);
}

export async function sendMultiSourceSearch(payload: {
  query: string;
  sources?: string[];
  limit?: number;
}) {
  return proxyRequest("/api/images/search/multi", "POST", payload);
}

export async function sendGenerateOpenAI(payload: {
  prompt: string;
  style?: string;
}) {
  return proxyRequest("/api/images/generate/openai", "POST", payload);
}

export async function sendDiagramSpec(payload: {
  concept: string;
  description: string;
  style?: string;
}) {
  return proxyRequest("/api/images/spec/diagram", "POST", payload);
}

export function buildHandoffPacket(session: any, concepts: any[], candidates: any[]) {
  return {
    title: session.title,
    input: {
      text: session.rawText,
      citation: session.citation || null,
      sourceUrl: session.sourceUrl || null,
    },
    scope: {
      grade: session.grade || null,
      week: session.week || null,
      sectionId: session.sectionId || null,
      lessonId: session.lessonId || null,
    },
    concepts: concepts.map((c) => ({
      concept_id: c.conceptId,
      label: c.label,
      description: c.description,
      visual_type: c.visualType,
      priority: c.priority,
      search_queries: c.searchQueries || [],
      ai_prompts: c.aiPrompts || [],
      diagram_prompt: c.diagramPrompt,
      tags: c.tags || [],
      source_mode: c.sourceMode,
      source_type: c.sourceType,
      accuracy_status: c.accuracyStatus,
      state: c.state,
    })),
    selected_candidates: candidates.filter((c) => c.approved === "approved").map((c) => ({
      image_url: c.imageUrl,
      title: c.title,
      source: c.source,
      source_type: c.sourceType,
      accuracy_status: c.accuracyStatus,
      object_url: c.objectUrl,
    })),
    ai_prompt_packets: concepts
      .filter((c) => c.aiPrompts?.length > 0)
      .map((c) => ({
        concept_id: c.conceptId,
        label: c.label,
        prompts: c.aiPrompts,
        diagram_prompt: c.diagramPrompt,
      })),
  };
}
