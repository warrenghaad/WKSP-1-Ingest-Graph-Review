import { useState, useCallback, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { Link } from "wouter";

type ConceptState =
  | "draft" | "parsed" | "query_ready" | "searching"
  | "candidates_ready" | "selected" | "ai_prompt_ready"
  | "ready_for_handoff" | "sent_to_backend" | "error";
type SourceMode = "open_web_fast" | "museum_context" | "ai_reconstruction" | "hybrid";
type AIStyle = "museum_photograph" | "reconstruction" | "diagram" | "illustration";

interface ConceptCard {
  id: number; sessionId: number; conceptId: string; label: string;
  description: string | null; visualType: string; priority: string;
  state: ConceptState; searchQueries: string[] | null; aiPrompts: string[] | null;
  diagramPrompt: string | null; tags: string[] | null; sourceMode: string;
  sourceType: string; accuracyStatus: string;
}

interface Candidate {
  id: number; conceptCardId: number; imageUrl: string; title: string | null;
  source: string | null; objectUrl: string | null; sourceType: string;
  accuracyStatus: string; approved: string;
}

interface QuickResult {
  url: string; title: string; source: string;
  objectUrl?: string; date?: string; culture?: string; medium?: string;
}

const STATE_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  parsed: "bg-blue-100 text-blue-700",
  query_ready: "bg-indigo-100 text-indigo-700",
  searching: "bg-yellow-100 text-yellow-700",
  candidates_ready: "bg-emerald-100 text-emerald-700",
  selected: "bg-teal-100 text-teal-700",
  ai_prompt_ready: "bg-purple-100 text-purple-700",
  ready_for_handoff: "bg-amber-100 text-amber-800",
  sent_to_backend: "bg-green-100 text-green-800",
  error: "bg-red-100 text-red-700",
};

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-red-50 border-red-300 text-red-700",
  medium: "bg-amber-50 border-amber-300 text-amber-700",
  low: "bg-gray-50 border-gray-300 text-gray-500",
};

const VISUAL_TYPE_ICONS: Record<string, string> = {
  artifact: "🏺", scene: "🎭", diagram: "📐", overlay: "🔲",
  timeline: "📅", map: "🗺️", mechanics: "⚙️",
};

const SOURCE_TYPE_BADGES: Record<string, { label: string; color: string }> = {
  open_web: { label: "Web", color: "bg-blue-100 text-blue-700" },
  museum: { label: "Museum", color: "bg-amber-100 text-amber-800" },
  pinterest_reference: { label: "Pinterest Ref", color: "bg-pink-100 text-pink-700" },
  ai_generated: { label: "AI Generated", color: "bg-purple-100 text-purple-700" },
  hybrid_reference: { label: "Hybrid", color: "bg-teal-100 text-teal-700" },
};

const ACCURACY_BADGES: Record<string, { label: string; color: string }> = {
  unreviewed: { label: "Unreviewed", color: "bg-gray-100 text-gray-600" },
  plausible: { label: "Plausible", color: "bg-yellow-100 text-yellow-700" },
  historically_grounded: { label: "Grounded", color: "bg-green-100 text-green-700" },
  approved: { label: "Approved", color: "bg-emerald-100 text-emerald-800" },
};

const SOURCE_COLORS: Record<string, string> = {
  "Metropolitan Museum of Art": "bg-red-50 text-red-700",
  "Wikimedia Commons": "bg-blue-50 text-blue-700",
  "Smithsonian Institution": "bg-amber-50 text-amber-700",
};

const NEXT_STATE: Partial<Record<ConceptState, ConceptState>> = {
  draft: "parsed",
  parsed: "query_ready",
  query_ready: "searching",
  candidates_ready: "selected",
  selected: "ai_prompt_ready",
  ai_prompt_ready: "ready_for_handoff",
};

export default function Textreader() {
  const queryClient = useQueryClient();
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [selectedConceptId, setSelectedConceptId] = useState<number | null>(null);
  const [sourceMode, setSourceMode] = useState<SourceMode>("open_web_fast");

  const [title, setTitle] = useState("");
  const [rawText, setRawText] = useState("");
  const [citation, setCitation] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [grade, setGrade] = useState("");
  const [week, setWeek] = useState("");
  const [sectionId, setSectionId] = useState("");

  const [readingMode, setReadingMode] = useState(false);
  const [selectionBubble, setSelectionBubble] = useState<{ text: string; x: number; y: number } | null>(null);
  const [quickQuery, setQuickQuery] = useState("");
  const [quickResults, setQuickResults] = useState<QuickResult[]>([]);
  const [quickSearching, setQuickSearching] = useState(false);
  const [quickManualQuery, setQuickManualQuery] = useState("");

  const [editingQueries, setEditingQueries] = useState(false);
  const [draftQueries, setDraftQueries] = useState<string[]>([]);
  const [editingPrompts, setEditingPrompts] = useState(false);
  const [draftPrompts, setDraftPrompts] = useState<string[]>([]);
  const [aiStyle, setAiStyle] = useState<AIStyle>("museum_photograph");
  const [aiProvider, setAiProvider] = useState<"auto" | "gemini" | "openai">("auto");
  const [customAiPrompt, setCustomAiPrompt] = useState("");
  const [generatingAI, setGeneratingAI] = useState(false);

  const readingPaneRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);

  const backendStatus = useQuery({
    queryKey: ["backend-status"],
    queryFn: () => fetch("/api/textreader/backend-status").then(r => r.json()),
    refetchInterval: 30000,
  });

  const sessionData = useQuery({
    queryKey: ["session", sessionId],
    queryFn: () => sessionId ? fetch(`/api/textreader/sessions/${sessionId}`).then(r => r.json()) : null,
    enabled: !!sessionId,
  });

  const concepts: ConceptCard[] = sessionData.data?.concepts || [];

  const candidatesQuery = useQuery({
    queryKey: ["candidates", selectedConceptId],
    queryFn: () => selectedConceptId
      ? fetch(`/api/textreader/concepts/${selectedConceptId}/candidates`).then(r => r.json())
      : [],
    enabled: !!selectedConceptId,
  });

  const candidates: Candidate[] = candidatesQuery.data || [];
  const selectedConcept = concepts.find(c => c.id === selectedConceptId);

  const createSession = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/textreader/sessions", {
        title: title || "Untitled Session", rawText,
        citation: citation || null, sourceUrl: sourceUrl || null,
        grade: grade ? parseInt(grade) : null,
        week: week ? parseInt(week) : null,
        sectionId: sectionId || null, sourceMode,
      });
      return res.json();
    },
    onSuccess: (data) => { setSessionId(data.id); },
  });

  const extractMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/textreader/extract", { sessionId, text: rawText, maxConcepts: 8 });
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["session", sessionId] }); },
  });

  const searchMutation = useMutation({
    mutationFn: async (conceptId: number) => {
      const res = await apiRequest("POST", `/api/textreader/concepts/${conceptId}/search`, { sourceMode });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session", sessionId] });
      if (selectedConceptId) queryClient.invalidateQueries({ queryKey: ["candidates", selectedConceptId] });
    },
  });

  const generateQueriesMutation = useMutation({
    mutationFn: async (conceptId: number) => {
      const res = await apiRequest("POST", `/api/textreader/concepts/${conceptId}/generate-queries`, {});
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["session", sessionId] }); },
  });

  const updateConcept = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Record<string, unknown> }) => {
      const res = await apiRequest("PATCH", `/api/textreader/concepts/${id}`, updates);
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["session", sessionId] }); },
  });

  const updateCandidate = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Record<string, unknown> }) => {
      const res = await apiRequest("PATCH", `/api/textreader/candidates/${id}`, updates);
      return res.json();
    },
    onSuccess: async (_, { id: _id, updates }) => {
      if (selectedConceptId) {
        queryClient.invalidateQueries({ queryKey: ["candidates", selectedConceptId] });
        if (updates.approved === "approved") {
          await apiRequest("PATCH", `/api/textreader/concepts/${selectedConceptId}`, { state: "selected" });
          queryClient.invalidateQueries({ queryKey: ["session", sessionId] });
        }
      }
    },
  });

  const handoffMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/textreader/handoff", { sessionId });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["session", sessionId] });
      if (!data.success && data.fallbackExport) {
        const blob = new Blob([JSON.stringify(data.packet, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `textreader-export-${sessionId}.json`; a.click();
        URL.revokeObjectURL(url);
      }
    },
  });

  const handleExtract = useCallback(async () => {
    if (!rawText.trim()) return;
    if (!sessionId) {
      const session = await createSession.mutateAsync();
      setSessionId(session.id);
      setTimeout(() => extractMutation.mutate(), 200);
    } else {
      extractMutation.mutate();
    }
  }, [rawText, sessionId]);

  const runQuickSearch = useCallback(async (query: string) => {
    if (!query.trim() || query.trim().length < 2) return;
    setQuickSearching(true);
    setQuickQuery(query.trim());
    setQuickResults([]);
    setSelectedConceptId(null);
    setSelectionBubble(null);
    try {
      const res = await fetch(`/api/quick-search/images?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      setQuickResults(data.results || []);
    } catch {
      setQuickResults([]);
    } finally {
      setQuickSearching(false);
    }
  }, []);

  const generateAIImage = useCallback(async (conceptId: number) => {
    setGeneratingAI(true);
    try {
      const res = await apiRequest("POST", `/api/textreader/concepts/${conceptId}/generate-image`, {
        prompt: customAiPrompt || undefined,
        style: aiStyle,
        provider: aiProvider,
      });
      const data = await res.json();
      if (data.candidate) {
        queryClient.invalidateQueries({ queryKey: ["candidates", conceptId] });
        queryClient.invalidateQueries({ queryKey: ["session", sessionId] });
      }
    } catch (err) {
      console.error("AI image generation failed:", err);
    } finally {
      setGeneratingAI(false);
    }
  }, [customAiPrompt, aiStyle, sessionId]);

  const saveQueryEdits = useCallback(async (conceptId: number) => {
    await updateConcept.mutateAsync({ id: conceptId, updates: { searchQueries: draftQueries.filter(Boolean) } });
    setEditingQueries(false);
  }, [draftQueries]);

  const savePromptEdits = useCallback(async (conceptId: number) => {
    await updateConcept.mutateAsync({ id: conceptId, updates: { aiPrompts: draftPrompts.filter(Boolean) } });
    setEditingPrompts(false);
  }, [draftPrompts]);

  const handleTextSelect = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) { setSelectionBubble(null); return; }
    const text = sel.toString().trim();
    if (text.length < 2 || text.length > 120) { setSelectionBubble(null); return; }
    if (!readingPaneRef.current?.contains(sel.anchorNode)) { setSelectionBubble(null); return; }
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    setSelectionBubble({ text, x: rect.left + rect.width / 2, y: rect.top + window.scrollY });
  }, []);

  useEffect(() => {
    document.addEventListener("mouseup", handleTextSelect);
    return () => document.removeEventListener("mouseup", handleTextSelect);
  }, [handleTextSelect]);

  useEffect(() => {
    const dismiss = (e: MouseEvent) => {
      if (bubbleRef.current && !bubbleRef.current.contains(e.target as Node)) setSelectionBubble(null);
    };
    document.addEventListener("mousedown", dismiss);
    return () => document.removeEventListener("mousedown", dismiss);
  }, []);

  useEffect(() => {
    if (selectedConcept) {
      setDraftQueries(selectedConcept.searchQueries || []);
      setDraftPrompts(selectedConcept.aiPrompts || []);
      setEditingQueries(false);
      setEditingPrompts(false);
      setCustomAiPrompt("");
    }
  }, [selectedConceptId]);

  const readyConcepts = concepts.filter(c => c.state === "ready_for_handoff");
  const showQuickPanel = quickSearching || quickResults.length > 0 || quickQuery;

  return (
    <div className="h-screen flex flex-col bg-gray-50" data-testid="textreader-page">
      {/* TOP BAR */}
      <header className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200 shrink-0" data-testid="topbar">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">← Chronos</Link>
          <h1 className="text-lg font-semibold text-gray-900">Euclid Textreader</h1>
          {rawText.trim() && (
            <button
              onClick={() => { setReadingMode(m => !m); setSelectionBubble(null); }}
              className={`px-3 py-1 text-xs font-medium rounded-full border transition-all ${
                readingMode
                  ? "bg-amber-100 border-amber-300 text-amber-800"
                  : "bg-white border-gray-300 text-gray-600 hover:border-amber-300 hover:text-amber-700"
              }`}
              data-testid="button-toggle-reading-mode"
            >
              {readingMode ? "📝 Edit Mode" : "📖 Reading Mode"}
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2" data-testid="backend-status">
            <div className={`w-2 h-2 rounded-full ${backendStatus.data?.online ? "bg-green-500" : "bg-red-400"}`} />
            <span className="text-xs text-gray-500">{backendStatus.data?.online ? "Backend Online" : "Backend Offline"}</span>
          </div>
          <select
            value={sourceMode}
            onChange={(e) => setSourceMode(e.target.value as SourceMode)}
            className="text-xs border border-gray-200 rounded px-2 py-1 bg-white"
            data-testid="source-mode-select"
          >
            <option value="open_web_fast">Open Web (Fast)</option>
            <option value="museum_context">Museum Context</option>
            <option value="ai_reconstruction">AI Reconstruction</option>
            <option value="hybrid">Hybrid</option>
          </select>
          {readyConcepts.length > 0 && (
            <button
              onClick={() => handoffMutation.mutate()}
              disabled={handoffMutation.isPending}
              className="px-3 py-1.5 text-xs font-medium bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50"
              data-testid="button-handoff"
            >
              {handoffMutation.isPending ? "Sending..." : `Handoff (${readyConcepts.length})`}
            </button>
          )}
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* LEFT INTAKE PANE */}
        <div className="w-72 border-r border-gray-200 bg-white flex flex-col shrink-0 overflow-y-auto" data-testid="left-pane">
          <div className="p-3 space-y-3">

            {/* Quick Image Search */}
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-2.5">
              <p className="text-[10px] font-semibold text-amber-800 mb-1.5 uppercase tracking-wide">Find Images from Text</p>
              <div className="flex gap-1.5">
                <input
                  value={quickManualQuery}
                  onChange={(e) => setQuickManualQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && runQuickSearch(quickManualQuery)}
                  placeholder="Type any phrase..."
                  className="flex-1 text-xs border border-amber-200 rounded px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                  data-testid="input-quick-search"
                />
                <button
                  onClick={() => runQuickSearch(quickManualQuery)}
                  disabled={quickSearching || quickManualQuery.trim().length < 2}
                  className="px-2 py-1.5 text-xs bg-amber-500 text-white rounded hover:bg-amber-600 disabled:opacity-40 font-medium"
                  data-testid="button-quick-search"
                >
                  {quickSearching ? "…" : "🔍"}
                </button>
              </div>
              {readingMode && (
                <p className="text-[10px] text-amber-600 mt-1.5">✨ Highlight text in reader to search</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="Research excerpt title..."
                className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400"
                data-testid="input-title" />
            </div>

            {!readingMode && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Raw Text</label>
                <textarea
                  value={rawText} onChange={(e) => setRawText(e.target.value)}
                  placeholder="Paste research text, lesson fragment, or brief..."
                  rows={12}
                  className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400 resize-none leading-relaxed"
                  data-testid="input-raw-text"
                />
                <div className="text-right text-xs text-gray-400 mt-0.5">{rawText.length} chars</div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Citation</label>
              <input value={citation} onChange={(e) => setCitation(e.target.value)} placeholder="Source citation..."
                className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400"
                data-testid="input-citation" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Source URL</label>
              <input value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://..."
                className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400"
                data-testid="input-source-url" />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Grade", val: grade, set: setGrade, ph: "3", tid: "input-grade", type: "number" },
                { label: "Week", val: week, set: setWeek, ph: "1", tid: "input-week", type: "number" },
                { label: "Section", val: sectionId, set: setSectionId, ph: "A1", tid: "input-section", type: "text" },
              ].map(({ label, val, set, ph, tid, type }) => (
                <div key={tid}>
                  <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
                  <input value={val} onChange={(e) => set(e.target.value)} placeholder={ph} type={type}
                    className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    data-testid={tid} />
                </div>
              ))}
            </div>

            <button
              onClick={handleExtract}
              disabled={!rawText.trim() || extractMutation.isPending || createSession.isPending}
              className="w-full py-2 text-sm font-medium bg-amber-500 text-white rounded hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              data-testid="button-extract-concepts"
            >
              {extractMutation.isPending ? "Extracting..." : "Extract Concepts"}
            </button>
          </div>
        </div>

        {/* CENTER PANE */}
        <div className="flex-1 overflow-y-auto" data-testid="center-pane">
          {readingMode && rawText.trim() ? (
            <div className="h-full flex flex-col">
              <div className="px-4 py-2 bg-amber-50 border-b border-amber-100 flex items-center gap-2 text-xs text-amber-700 shrink-0">
                <span className="font-medium">Reading Mode</span>
                <span className="text-amber-400">·</span>
                <span>Select any text to find images</span>
                <span className="text-amber-400">·</span>
                <span className="text-amber-500">{rawText.split(/\s+/).filter(Boolean).length} words</span>
              </div>
              <div ref={readingPaneRef} className="flex-1 overflow-y-auto p-8 max-w-3xl mx-auto w-full" data-testid="reading-pane">
                <h2 className="text-xl font-serif text-gray-900 mb-4 leading-tight">{title || "Untitled"}</h2>
                {citation && <p className="text-xs text-gray-400 italic mb-6">— {citation}</p>}
                <div className="prose prose-sm max-w-none text-gray-800 leading-relaxed select-text">
                  {rawText.split(/\n+/).map((para, i) =>
                    para.trim() ? <p key={i} className="mb-4">{para}</p> : null
                  )}
                </div>
                <div className="mt-8 pt-4 border-t border-gray-100 text-xs text-gray-300 text-center">
                  Highlight any word or phrase to find matching images
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4">
              {concepts.length === 0 && !extractMutation.isPending && (
                <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
                  <div className="text-center">
                    <div className="text-4xl mb-3">📜</div>
                    <p>Paste text in the left pane and click "Extract Concepts"</p>
                    <p className="text-xs mt-1 text-gray-300">Or switch to Reading Mode to highlight and search</p>
                  </div>
                </div>
              )}
              {extractMutation.isPending && (
                <div className="flex items-center justify-center h-64 text-gray-500 text-sm">
                  <div className="text-center">
                    <div className="animate-pulse text-4xl mb-3">🔍</div>
                    <p>Extracting visual concepts from text...</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {concepts.map((concept) => (
                  <div
                    key={concept.id}
                    onClick={() => { setSelectedConceptId(concept.id); setQuickQuery(""); setQuickResults([]); }}
                    className={`rounded-lg border p-3 cursor-pointer transition-all hover:shadow-md ${
                      selectedConceptId === concept.id
                        ? "border-amber-400 shadow-md ring-1 ring-amber-200 bg-white"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                    data-testid={`concept-card-${concept.conceptId}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">{VISUAL_TYPE_ICONS[concept.visualType] || "🏺"}</span>
                        <h3 className="text-sm font-semibold text-gray-900 leading-tight">{concept.label}</h3>
                      </div>
                      <span className={`shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded ${PRIORITY_COLORS[concept.priority] || PRIORITY_COLORS.medium}`}>
                        {concept.priority}
                      </span>
                    </div>

                    {concept.description && (
                      <p className="text-xs text-gray-500 mb-2 line-clamp-2">{concept.description}</p>
                    )}

                    <div className="flex flex-wrap gap-1 mb-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${STATE_COLORS[concept.state] || STATE_COLORS.draft}`}>
                        {concept.state.replace(/_/g, " ")}
                      </span>
                      {SOURCE_TYPE_BADGES[concept.sourceType] && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${SOURCE_TYPE_BADGES[concept.sourceType].color}`}>
                          {SOURCE_TYPE_BADGES[concept.sourceType].label}
                        </span>
                      )}
                      {ACCURACY_BADGES[concept.accuracyStatus] && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${ACCURACY_BADGES[concept.accuracyStatus].color}`}>
                          {ACCURACY_BADGES[concept.accuracyStatus].label}
                        </span>
                      )}
                    </div>

                    {concept.tags && concept.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {concept.tags.slice(0, 4).map((tag, i) => (
                          <span key={i} className="text-[10px] px-1 py-0.5 bg-gray-100 text-gray-500 rounded">{tag}</span>
                        ))}
                        {concept.tags.length > 4 && <span className="text-[10px] text-gray-400">+{concept.tags.length - 4}</span>}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={(e) => { e.stopPropagation(); runQuickSearch(concept.label); }}
                        className="text-[10px] px-2 py-1 bg-amber-50 text-amber-700 rounded hover:bg-amber-100 font-medium"
                        data-testid={`button-find-images-${concept.conceptId}`}
                      >🔍 Images</button>
                      {(concept.state === "parsed" || concept.state === "query_ready" || concept.state === "candidates_ready") && (
                        <button
                          onClick={(e) => { e.stopPropagation(); searchMutation.mutate(concept.id); }}
                          disabled={searchMutation.isPending}
                          className="text-[10px] px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 font-medium"
                          data-testid={`button-search-${concept.conceptId}`}
                        >{searchMutation.isPending ? "…" : "Search"}</button>
                      )}
                      {concept.state !== "ready_for_handoff" && concept.state !== "sent_to_backend" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const next = NEXT_STATE[concept.state] || "ready_for_handoff";
                            updateConcept.mutate({ id: concept.id, updates: { state: next } });
                          }}
                          className="text-[10px] px-2 py-1 bg-gray-50 text-gray-600 rounded hover:bg-gray-100 font-medium"
                          data-testid={`button-advance-${concept.conceptId}`}
                        >Advance →</button>
                      )}
                      {concept.state === "sent_to_backend" && (
                        <span className="text-[10px] text-green-600 font-medium">✓ Sent</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANE */}
        {(showQuickPanel || selectedConcept) && (
          <div className="w-80 border-l border-gray-200 bg-white flex flex-col shrink-0 overflow-hidden" data-testid="right-drawer">

            {/* ── QUICK IMAGE RESULTS ── */}
            {showQuickPanel ? (
              <>
                <div className="p-3 border-b border-gray-100 bg-amber-50 shrink-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <h2 className="text-sm font-semibold text-amber-900">
                      {quickSearching ? "Searching…" : `${quickResults.length} images`}
                    </h2>
                    <button
                      onClick={() => { setQuickQuery(""); setQuickResults([]); setQuickManualQuery(""); }}
                      className="text-gray-400 hover:text-gray-600"
                      data-testid="button-close-quick"
                    >✕</button>
                  </div>
                  <p className="text-xs text-amber-700 italic truncate mb-2">"{quickQuery}"</p>
                  <div className="flex gap-1">
                    <input
                      defaultValue={quickQuery}
                      key={quickQuery}
                      onKeyDown={(e) => e.key === "Enter" && runQuickSearch((e.target as HTMLInputElement).value)}
                      placeholder="Refine search..."
                      className="flex-1 text-xs border border-amber-200 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                      data-testid="input-refine-search"
                    />
                    <button
                      onClick={(e) => { const inp = e.currentTarget.previousSibling as HTMLInputElement; runQuickSearch(inp.value); }}
                      className="px-2 text-xs bg-amber-500 text-white rounded hover:bg-amber-600"
                    >Go</button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                  {quickSearching && (
                    <div className="space-y-2">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="animate-pulse bg-gray-100 rounded aspect-video" />
                      ))}
                    </div>
                  )}
                  {!quickSearching && quickResults.length === 0 && quickQuery && (
                    <div className="text-center py-8 text-gray-400 text-xs">
                      <div className="text-2xl mb-2">🏛️</div>
                      <p>No museum images found.</p>
                      <p className="mt-1">Try a broader term.</p>
                    </div>
                  )}
                  <div className="space-y-2">
                    {quickResults.map((result, i) => (
                      <div key={i} className="rounded-lg border border-gray-200 overflow-hidden hover:border-amber-300 transition-colors group" data-testid={`quick-result-${i}`}>
                        <div className="aspect-video bg-gray-100 relative overflow-hidden">
                          <img src={result.url} alt={result.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                          <a href={result.objectUrl || result.url} target="_blank" rel="noreferrer"
                            className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded px-1.5 py-0.5 text-[9px] text-gray-700 font-medium">
                            View ↗
                          </a>
                        </div>
                        <div className="p-2">
                          <p className="text-[11px] text-gray-800 font-medium leading-tight line-clamp-2 mb-1">{result.title}</p>
                          <div className="flex items-center justify-between gap-1">
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${SOURCE_COLORS[result.source] || "bg-gray-100 text-gray-600"}`}>
                              {result.source}
                            </span>
                            {result.date && <span className="text-[9px] text-gray-400">{result.date}</span>}
                          </div>
                          {result.culture && <p className="text-[9px] text-gray-400 mt-0.5 truncate">{result.culture}</p>}
                          {result.medium && <p className="text-[9px] text-gray-300 truncate">{result.medium}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>

            ) : selectedConcept ? (
              /* ── CONCEPT DETAIL DRAWER ── */
              <>
                <div className="p-3 border-b border-gray-100 shrink-0">
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-sm font-semibold text-gray-900">{selectedConcept.label}</h2>
                    <button onClick={() => setSelectedConceptId(null)} className="text-gray-400 hover:text-gray-600" data-testid="button-close-drawer">✕</button>
                  </div>
                  {selectedConcept.description && <p className="text-xs text-gray-500 mb-2">{selectedConcept.description}</p>}
                  <div className="flex flex-wrap gap-1">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${STATE_COLORS[selectedConcept.state]}`}>
                      {selectedConcept.state.replace(/_/g, " ")}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">{selectedConcept.visualType}</span>
                    {ACCURACY_BADGES[selectedConcept.accuracyStatus] && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${ACCURACY_BADGES[selectedConcept.accuracyStatus].color}`}>
                        {ACCURACY_BADGES[selectedConcept.accuracyStatus].label}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-1 mt-2">
                    <button
                      onClick={() => runQuickSearch(selectedConcept.label)}
                      className="text-xs py-1.5 bg-amber-500 text-white rounded hover:bg-amber-600 font-medium"
                      data-testid="button-find-images-drawer"
                    >🔍 Find Images</button>
                    <button
                      onClick={() => { const next = NEXT_STATE[selectedConcept.state] || "ready_for_handoff"; updateConcept.mutate({ id: selectedConcept.id, updates: { state: next } }); }}
                      disabled={selectedConcept.state === "ready_for_handoff" || selectedConcept.state === "sent_to_backend"}
                      className="text-xs py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 font-medium disabled:opacity-40"
                      data-testid="button-advance-state"
                    >Advance State →</button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {/* Search Queries */}
                  <div className="p-3 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-semibold text-gray-700">Search Queries</h3>
                      <div className="flex gap-1">
                        {!editingQueries ? (
                          <>
                            <button onClick={() => { setDraftQueries(selectedConcept.searchQueries || []); setEditingQueries(true); }}
                              className="text-[9px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                              data-testid="button-edit-queries">Edit</button>
                            <button onClick={() => generateQueriesMutation.mutate(selectedConcept.id)}
                              disabled={generateQueriesMutation.isPending}
                              className="text-[9px] px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100 disabled:opacity-50"
                              data-testid="button-generate-queries">
                              {generateQueriesMutation.isPending ? "…" : "Regenerate"}
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => saveQueryEdits(selectedConcept.id)}
                              className="text-[9px] px-1.5 py-0.5 bg-green-500 text-white rounded hover:bg-green-600"
                              data-testid="button-save-queries">Save</button>
                            <button onClick={() => setEditingQueries(false)}
                              className="text-[9px] px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded hover:bg-gray-300">Cancel</button>
                          </>
                        )}
                      </div>
                    </div>

                    {editingQueries ? (
                      <div className="space-y-1.5">
                        {draftQueries.map((q, i) => (
                          <div key={i} className="flex gap-1">
                            <input value={q} onChange={(e) => { const n = [...draftQueries]; n[i] = e.target.value; setDraftQueries(n); }}
                              className="flex-1 text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                              data-testid={`query-edit-${i}`} />
                            <button onClick={() => setDraftQueries(draftQueries.filter((_, j) => j !== i))}
                              className="text-[9px] px-1 text-red-400 hover:text-red-600">✕</button>
                          </div>
                        ))}
                        <button onClick={() => setDraftQueries([...draftQueries, ""])}
                          className="text-[9px] px-2 py-1 w-full border border-dashed border-gray-300 text-gray-500 rounded hover:border-indigo-400 hover:text-indigo-600"
                          data-testid="button-add-query">+ Add query</button>
                      </div>
                    ) : selectedConcept.searchQueries?.length ? (
                      <div className="space-y-1">
                        {selectedConcept.searchQueries.map((q, i) => (
                          <div key={i} onClick={() => runQuickSearch(q)}
                            className="text-xs text-gray-600 bg-gray-50 hover:bg-amber-50 hover:text-amber-700 rounded px-2 py-1.5 flex items-start gap-1 cursor-pointer transition-colors"
                            data-testid={`query-item-${i}`}>
                            <span className="text-gray-400 shrink-0">{i + 1}.</span>
                            <span className="break-words">{q}</span>
                          </div>
                        ))}
                      </div>
                    ) : <p className="text-xs text-gray-400 italic">No queries yet — click Regenerate</p>}

                    <button onClick={() => searchMutation.mutate(selectedConcept.id)}
                      disabled={searchMutation.isPending}
                      className="mt-2 w-full text-xs py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 font-medium"
                      data-testid="button-run-search-drawer">
                      {searchMutation.isPending ? "Searching..." : "Run Full Search"}
                    </button>
                  </div>

                  {/* AI Prompt Pack */}
                  <div className="p-3 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-semibold text-gray-700">AI Image Prompts</h3>
                      <div className="flex gap-1">
                        {!editingPrompts ? (
                          <button onClick={() => { setDraftPrompts(selectedConcept.aiPrompts || []); setEditingPrompts(true); }}
                            className="text-[9px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                            data-testid="button-edit-prompts">Edit</button>
                        ) : (
                          <>
                            <button onClick={() => savePromptEdits(selectedConcept.id)}
                              className="text-[9px] px-1.5 py-0.5 bg-green-500 text-white rounded hover:bg-green-600"
                              data-testid="button-save-prompts">Save</button>
                            <button onClick={() => setEditingPrompts(false)}
                              className="text-[9px] px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded hover:bg-gray-300">Cancel</button>
                          </>
                        )}
                      </div>
                    </div>

                    {editingPrompts ? (
                      <div className="space-y-1.5">
                        {draftPrompts.map((p, i) => (
                          <div key={i} className="flex gap-1">
                            <textarea value={p} onChange={(e) => { const n = [...draftPrompts]; n[i] = e.target.value; setDraftPrompts(n); }}
                              rows={2}
                              className="flex-1 text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-400 resize-none"
                              data-testid={`prompt-edit-${i}`} />
                            <button onClick={() => setDraftPrompts(draftPrompts.filter((_, j) => j !== i))}
                              className="text-[9px] px-1 text-red-400 hover:text-red-600">✕</button>
                          </div>
                        ))}
                        <button onClick={() => setDraftPrompts([...draftPrompts, ""])}
                          className="text-[9px] px-2 py-1 w-full border border-dashed border-gray-300 text-gray-500 rounded hover:border-purple-400 hover:text-purple-600"
                          data-testid="button-add-prompt">+ Add prompt</button>
                      </div>
                    ) : selectedConcept.aiPrompts?.length ? (
                      <div className="space-y-1">
                        {selectedConcept.aiPrompts.map((p, i) => (
                          <div key={i} onClick={() => setCustomAiPrompt(p)}
                            className="text-xs text-gray-600 bg-purple-50 hover:bg-purple-100 rounded px-2 py-1.5 cursor-pointer transition-colors"
                            data-testid={`prompt-item-${i}`}>{p}</div>
                        ))}
                      </div>
                    ) : <p className="text-xs text-gray-400 italic">No prompts yet</p>}

                    {/* AI Generate control */}
                    <div className="mt-2 space-y-1.5 pt-2 border-t border-gray-100">
                      <textarea
                        value={customAiPrompt}
                        onChange={(e) => setCustomAiPrompt(e.target.value)}
                        placeholder={selectedConcept.aiPrompts?.[0] || "Custom AI image prompt…"}
                        rows={2}
                        className="w-full text-xs border border-purple-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-400 resize-none bg-purple-50/50"
                        data-testid="input-ai-prompt"
                      />
                      <div className="grid grid-cols-2 gap-1">
                        <select value={aiStyle} onChange={(e) => setAiStyle(e.target.value as AIStyle)}
                          className="text-xs border border-gray-200 rounded px-1.5 py-1 bg-white"
                          data-testid="select-ai-style">
                          <option value="museum_photograph">Museum Photo</option>
                          <option value="reconstruction">Reconstruction</option>
                          <option value="diagram">Diagram</option>
                          <option value="illustration">Illustration</option>
                        </select>
                        <select value={aiProvider} onChange={(e) => setAiProvider(e.target.value as "auto" | "gemini" | "openai")}
                          className="text-xs border border-gray-200 rounded px-1.5 py-1 bg-white"
                          data-testid="select-ai-provider">
                          <option value="auto">Auto</option>
                          <option value="gemini">Gemini</option>
                          <option value="openai">OpenAI</option>
                        </select>
                      </div>
                      <button
                        onClick={() => generateAIImage(selectedConcept.id)}
                        disabled={generatingAI}
                        className="w-full text-xs py-1.5 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 font-medium"
                        data-testid="button-generate-ai-image"
                      >
                        {generatingAI ? "Generating…" : "✨ Generate AI Image"}
                      </button>
                    </div>
                  </div>

                  {/* Candidates */}
                  <div className="p-3">
                    <h3 className="text-xs font-semibold text-gray-700 mb-2">Candidates ({candidates.length})</h3>
                    {candidatesQuery.isLoading ? (
                      <p className="text-xs text-gray-400">Loading...</p>
                    ) : candidates.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">Run search or generate AI image</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {candidates.map((c) => (
                          <div key={c.id}
                            className={`rounded border overflow-hidden ${c.approved === "approved" ? "border-green-400 ring-1 ring-green-200" : c.approved === "rejected" ? "border-red-300 opacity-50" : "border-gray-200"}`}
                            data-testid={`candidate-${c.id}`}>
                            <div className="aspect-square bg-gray-100 relative">
                              <img src={c.imageUrl} alt={c.title || ""}
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23eee'/%3E%3Ctext x='50' y='55' text-anchor='middle' fill='%23999' font-size='10'%3ENo img%3C/text%3E%3C/svg%3E"; }} />
                              <div className="absolute top-1 left-1 flex gap-0.5">
                                {SOURCE_TYPE_BADGES[c.sourceType] && (
                                  <span className={`text-[8px] px-1 py-0.5 rounded ${SOURCE_TYPE_BADGES[c.sourceType].color}`}>
                                    {SOURCE_TYPE_BADGES[c.sourceType].label}
                                  </span>
                                )}
                              </div>
                              <div className="absolute bottom-1 left-1">
                                {ACCURACY_BADGES[c.accuracyStatus] && (
                                  <span className={`text-[8px] px-1 py-0.5 rounded ${ACCURACY_BADGES[c.accuracyStatus].color}`}>
                                    {ACCURACY_BADGES[c.accuracyStatus].label}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="p-1.5">
                              <p className="text-[10px] text-gray-700 font-medium line-clamp-1">{c.title || "Untitled"}</p>
                              <p className="text-[9px] text-gray-400">{c.source || "?"}</p>
                              <div className="flex gap-1 mt-1">
                                <button
                                  onClick={() => updateCandidate.mutate({ id: c.id, updates: { approved: "approved", accuracyStatus: "historically_grounded" } })}
                                  className={`flex-1 text-[9px] py-0.5 rounded font-medium ${c.approved === "approved" ? "bg-green-500 text-white" : "bg-green-50 text-green-700 hover:bg-green-100"}`}
                                  data-testid={`button-approve-${c.id}`}>✓</button>
                                <button
                                  onClick={() => updateCandidate.mutate({ id: c.id, updates: { approved: "rejected" } })}
                                  className={`flex-1 text-[9px] py-0.5 rounded font-medium ${c.approved === "rejected" ? "bg-red-500 text-white" : "bg-red-50 text-red-700 hover:bg-red-100"}`}
                                  data-testid={`button-reject-${c.id}`}>✕</button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Concept Actions */}
                  <div className="p-3 border-t border-gray-100">
                    {selectedConcept.state !== "ready_for_handoff" && selectedConcept.state !== "sent_to_backend" && (
                      <button
                        onClick={() => updateConcept.mutate({ id: selectedConcept.id, updates: { state: "ready_for_handoff" } })}
                        className="w-full text-xs py-1.5 bg-amber-500 text-white rounded hover:bg-amber-600 font-medium"
                        data-testid="button-mark-ready">Mark Ready for Handoff</button>
                    )}
                    {selectedConcept.state === "ready_for_handoff" && (
                      <div className="text-center text-xs text-amber-600 font-medium py-1.5">✓ Ready for handoff</div>
                    )}
                    {selectedConcept.state === "sent_to_backend" && (
                      <div className="text-center text-xs text-green-600 font-medium py-1.5">✓ Sent to backend</div>
                    )}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}
      </div>

      {/* FLOATING SELECTION BUBBLE */}
      {selectionBubble && (
        <div ref={bubbleRef} className="fixed z-50 pointer-events-auto"
          style={{ left: selectionBubble.x, top: selectionBubble.y - 48, transform: "translateX(-50%)" }}>
          <button
            onClick={() => runQuickSearch(selectionBubble.text)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-900 text-white text-xs font-medium rounded-full shadow-xl border border-gray-700 hover:bg-amber-600 transition-colors whitespace-nowrap"
            data-testid="button-selection-search"
          >
            🔍 Find images for "{selectionBubble.text.length > 30 ? selectionBubble.text.slice(0, 28) + "…" : selectionBubble.text}"
          </button>
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 bg-gray-900 rotate-45 border-r border-b border-gray-700" />
        </div>
      )}

      {/* BOTTOM HANDOFF TRAY */}
      {readyConcepts.length > 0 && (
        <div className="border-t border-gray-200 bg-amber-50 px-4 py-2 flex items-center gap-3 shrink-0" data-testid="handoff-tray">
          <span className="text-xs font-medium text-amber-800">Handoff Queue: {readyConcepts.length}</span>
          <div className="flex gap-1 flex-1 overflow-x-auto">
            {readyConcepts.map((c) => (
              <span key={c.id} className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-800 rounded whitespace-nowrap">{c.label}</span>
            ))}
          </div>
          <button onClick={() => handoffMutation.mutate()} disabled={handoffMutation.isPending}
            className="px-3 py-1 text-xs font-medium bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50"
            data-testid="button-handoff-tray">
            {handoffMutation.isPending ? "Sending..." : backendStatus.data?.online ? "Send to Backend" : "Export JSON"}
          </button>
        </div>
      )}
    </div>
  );
}
