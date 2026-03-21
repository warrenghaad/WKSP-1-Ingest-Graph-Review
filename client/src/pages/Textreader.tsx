import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { Link } from "wouter";

type ConceptState = "draft" | "parsed" | "query_ready" | "searching" | "candidates_ready" | "selected" | "ai_prompt_ready" | "ready_for_handoff" | "sent_to_backend" | "error";
type SourceMode = "open_web_fast" | "museum_context" | "ai_reconstruction" | "hybrid";

interface ConceptCard {
  id: number;
  sessionId: number;
  conceptId: string;
  label: string;
  description: string | null;
  visualType: string;
  priority: string;
  state: ConceptState;
  searchQueries: string[] | null;
  aiPrompts: string[] | null;
  diagramPrompt: string | null;
  tags: string[] | null;
  sourceMode: string;
  sourceType: string;
  accuracyStatus: string;
}

interface Candidate {
  id: number;
  conceptCardId: number;
  imageUrl: string;
  title: string | null;
  source: string | null;
  objectUrl: string | null;
  sourceType: string;
  accuracyStatus: string;
  approved: string;
}

interface Session {
  id: number;
  title: string;
  rawText: string;
  citation: string | null;
  sourceUrl: string | null;
  grade: number | null;
  week: number | null;
  sectionId: string | null;
  sourceMode: string;
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
  artifact: "🏺",
  scene: "🎭",
  diagram: "📐",
  overlay: "🔲",
  timeline: "📅",
  map: "🗺️",
  mechanics: "⚙️",
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
    queryFn: () => selectedConceptId ? fetch(`/api/textreader/concepts/${selectedConceptId}/candidates`).then(r => r.json()) : [],
    enabled: !!selectedConceptId,
  });

  const candidates: Candidate[] = candidatesQuery.data || [];
  const selectedConcept = concepts.find(c => c.id === selectedConceptId);

  const createSession = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/textreader/sessions", {
        title: title || "Untitled Session",
        rawText,
        citation: citation || null,
        sourceUrl: sourceUrl || null,
        grade: grade ? parseInt(grade) : null,
        week: week ? parseInt(week) : null,
        sectionId: sectionId || null,
        sourceMode,
      });
      return res.json();
    },
    onSuccess: (data) => {
      setSessionId(data.id);
    },
  });

  const extractMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/textreader/extract", {
        sessionId,
        text: rawText,
        maxConcepts: 8,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session", sessionId] });
    },
  });

  const searchMutation = useMutation({
    mutationFn: async (conceptId: number) => {
      const res = await apiRequest("POST", `/api/textreader/concepts/${conceptId}/search`, {
        sourceMode,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session", sessionId] });
      if (selectedConceptId) {
        queryClient.invalidateQueries({ queryKey: ["candidates", selectedConceptId] });
      }
    },
  });

  const updateConcept = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Record<string, any> }) => {
      const res = await apiRequest("PATCH", `/api/textreader/concepts/${id}`, updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session", sessionId] });
    },
  });

  const updateCandidate = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Record<string, any> }) => {
      const res = await apiRequest("PATCH", `/api/textreader/candidates/${id}`, updates);
      return res.json();
    },
    onSuccess: () => {
      if (selectedConceptId) {
        queryClient.invalidateQueries({ queryKey: ["candidates", selectedConceptId] });
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
        a.href = url;
        a.download = `textreader-export-${sessionId}.json`;
        a.click();
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

  const readyConcepts = concepts.filter(c => c.state === "ready_for_handoff");

  return (
    <div className="h-screen flex flex-col bg-gray-50" data-testid="textreader-page">
      {/* TOP BAR */}
      <header className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200 shrink-0" data-testid="topbar">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">← Chronos</Link>
          <h1 className="text-lg font-semibold text-gray-900">Euclid First-Run Textreader</h1>
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

      {/* MAIN 3-ZONE LAYOUT */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT INTAKE PANE */}
        <div className="w-72 border-r border-gray-200 bg-white flex flex-col shrink-0 overflow-y-auto" data-testid="left-pane">
          <div className="p-3 space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Research excerpt title..."
                className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400"
                data-testid="input-title"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Raw Text</label>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste research text, lesson fragment, or brief..."
                rows={12}
                className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400 resize-none leading-relaxed"
                data-testid="input-raw-text"
              />
              <div className="text-right text-xs text-gray-400 mt-0.5">{rawText.length} chars</div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Citation</label>
              <input
                value={citation}
                onChange={(e) => setCitation(e.target.value)}
                placeholder="Source citation..."
                className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400"
                data-testid="input-citation"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Source URL</label>
              <input
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://..."
                className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400"
                data-testid="input-source-url"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Grade</label>
                <input
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="3"
                  type="number"
                  className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  data-testid="input-grade"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Week</label>
                <input
                  value={week}
                  onChange={(e) => setWeek(e.target.value)}
                  placeholder="1"
                  type="number"
                  className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  data-testid="input-week"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Section</label>
                <input
                  value={sectionId}
                  onChange={(e) => setSectionId(e.target.value)}
                  placeholder="A1"
                  className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  data-testid="input-section"
                />
              </div>
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

        {/* CENTER CONCEPT BOARD */}
        <div className="flex-1 overflow-y-auto p-4" data-testid="center-pane">
          {concepts.length === 0 && !extractMutation.isPending && (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              <div className="text-center">
                <div className="text-4xl mb-3">📜</div>
                <p>Paste text in the left pane and click "Extract Concepts"</p>
                <p className="text-xs mt-1 text-gray-300">Atomic visual concepts will appear here</p>
              </div>
            </div>
          )}

          {extractMutation.isPending && (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm">
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
                onClick={() => setSelectedConceptId(concept.id)}
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
                  <div className="flex flex-wrap gap-1">
                    {concept.tags.slice(0, 4).map((tag, i) => (
                      <span key={i} className="text-[10px] px-1 py-0.5 bg-gray-100 text-gray-500 rounded">{tag}</span>
                    ))}
                    {concept.tags.length > 4 && (
                      <span className="text-[10px] text-gray-400">+{concept.tags.length - 4}</span>
                    )}
                  </div>
                )}

                <div className="flex gap-1 mt-2 pt-2 border-t border-gray-100">
                  {(concept.state === "parsed" || concept.state === "query_ready" || concept.state === "candidates_ready") && (
                    <button
                      onClick={(e) => { e.stopPropagation(); searchMutation.mutate(concept.id); }}
                      disabled={searchMutation.isPending}
                      className="text-[10px] px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 font-medium"
                      data-testid={`button-search-${concept.conceptId}`}
                    >
                      {searchMutation.isPending ? "..." : "Run Search"}
                    </button>
                  )}
                  {concept.state !== "ready_for_handoff" && concept.state !== "sent_to_backend" && (
                    <button
                      onClick={(e) => { e.stopPropagation(); updateConcept.mutate({ id: concept.id, updates: { state: "ready_for_handoff" } }); }}
                      className="text-[10px] px-2 py-1 bg-amber-50 text-amber-700 rounded hover:bg-amber-100 font-medium"
                      data-testid={`button-ready-${concept.conceptId}`}
                    >
                      Ready
                    </button>
                  )}
                  {concept.state === "sent_to_backend" && (
                    <span className="text-[10px] text-green-600 font-medium">✓ Sent</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT DETAIL DRAWER */}
        {selectedConcept && (
          <div className="w-80 border-l border-gray-200 bg-white flex flex-col shrink-0 overflow-y-auto" data-testid="right-drawer">
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-sm font-semibold text-gray-900">{selectedConcept.label}</h2>
                <button
                  onClick={() => setSelectedConceptId(null)}
                  className="text-gray-400 hover:text-gray-600 text-sm"
                  data-testid="button-close-drawer"
                >
                  ✕
                </button>
              </div>
              {selectedConcept.description && (
                <p className="text-xs text-gray-500">{selectedConcept.description}</p>
              )}
              <div className="flex gap-1 mt-2">
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${STATE_COLORS[selectedConcept.state]}`}>
                  {selectedConcept.state.replace(/_/g, " ")}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">
                  {selectedConcept.visualType}
                </span>
              </div>
            </div>

            {/* Search Queries */}
            <div className="p-3 border-b border-gray-100">
              <h3 className="text-xs font-semibold text-gray-700 mb-2">Search Queries</h3>
              {selectedConcept.searchQueries && selectedConcept.searchQueries.length > 0 ? (
                <div className="space-y-1">
                  {selectedConcept.searchQueries.map((q, i) => (
                    <div key={i} className="text-xs text-gray-600 bg-gray-50 rounded px-2 py-1.5 flex items-start gap-1">
                      <span className="text-gray-400 shrink-0">{i + 1}.</span>
                      <span className="break-words">{q}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">No queries generated yet</p>
              )}
              <button
                onClick={() => searchMutation.mutate(selectedConcept.id)}
                disabled={searchMutation.isPending}
                className="mt-2 w-full text-xs py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 font-medium"
                data-testid="button-run-search-drawer"
              >
                {searchMutation.isPending ? "Searching..." : "Run Search"}
              </button>
            </div>

            {/* AI Prompts */}
            <div className="p-3 border-b border-gray-100">
              <h3 className="text-xs font-semibold text-gray-700 mb-2">AI Image Prompts</h3>
              {selectedConcept.aiPrompts && selectedConcept.aiPrompts.length > 0 ? (
                <div className="space-y-1">
                  {selectedConcept.aiPrompts.map((p, i) => (
                    <div key={i} className="text-xs text-gray-600 bg-purple-50 rounded px-2 py-1.5">
                      {p}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">No prompts generated yet</p>
              )}
            </div>

            {/* Candidates */}
            <div className="p-3 flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-gray-700">Candidates ({candidates.length})</h3>
              </div>

              {candidatesQuery.isLoading ? (
                <p className="text-xs text-gray-400">Loading candidates...</p>
              ) : candidates.length === 0 ? (
                <p className="text-xs text-gray-400 italic">Run search to find candidates</p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {candidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      className={`rounded border overflow-hidden ${
                        candidate.approved === "approved"
                          ? "border-green-400 ring-1 ring-green-200"
                          : candidate.approved === "rejected"
                          ? "border-red-300 opacity-50"
                          : "border-gray-200"
                      }`}
                      data-testid={`candidate-${candidate.id}`}
                    >
                      <div className="aspect-square bg-gray-100 relative">
                        <img
                          src={candidate.imageUrl}
                          alt={candidate.title || ""}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='%23eee'%3E%3Crect width='100' height='100'/%3E%3Ctext x='50' y='55' text-anchor='middle' fill='%23999' font-size='10'%3ENo image%3C/text%3E%3C/svg%3E";
                          }}
                        />
                        <div className="absolute top-1 left-1 flex gap-0.5">
                          {SOURCE_TYPE_BADGES[candidate.sourceType] && (
                            <span className={`text-[8px] px-1 py-0.5 rounded ${SOURCE_TYPE_BADGES[candidate.sourceType].color}`}>
                              {SOURCE_TYPE_BADGES[candidate.sourceType].label}
                            </span>
                          )}
                        </div>
                        <div className="absolute bottom-1 left-1">
                          {ACCURACY_BADGES[candidate.accuracyStatus] && (
                            <span className={`text-[8px] px-1 py-0.5 rounded ${ACCURACY_BADGES[candidate.accuracyStatus].color}`}>
                              {ACCURACY_BADGES[candidate.accuracyStatus].label}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="p-1.5">
                        <p className="text-[10px] text-gray-700 font-medium line-clamp-1">{candidate.title || "Untitled"}</p>
                        <p className="text-[9px] text-gray-400">{candidate.source || "Unknown"}</p>
                        <div className="flex gap-1 mt-1">
                          <button
                            onClick={() => updateCandidate.mutate({ id: candidate.id, updates: { approved: "approved" } })}
                            className={`flex-1 text-[9px] py-0.5 rounded font-medium ${
                              candidate.approved === "approved"
                                ? "bg-green-500 text-white"
                                : "bg-green-50 text-green-700 hover:bg-green-100"
                            }`}
                            data-testid={`button-approve-${candidate.id}`}
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => updateCandidate.mutate({ id: candidate.id, updates: { approved: "rejected" } })}
                            className={`flex-1 text-[9px] py-0.5 rounded font-medium ${
                              candidate.approved === "rejected"
                                ? "bg-red-500 text-white"
                                : "bg-red-50 text-red-700 hover:bg-red-100"
                            }`}
                            data-testid={`button-reject-${candidate.id}`}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Concept Actions */}
            <div className="p-3 border-t border-gray-100 space-y-2">
              {selectedConcept.state !== "ready_for_handoff" && selectedConcept.state !== "sent_to_backend" && (
                <button
                  onClick={() => updateConcept.mutate({ id: selectedConcept.id, updates: { state: "ready_for_handoff" } })}
                  className="w-full text-xs py-1.5 bg-amber-500 text-white rounded hover:bg-amber-600 font-medium"
                  data-testid="button-mark-ready"
                >
                  Mark Ready for Handoff
                </button>
              )}
              {selectedConcept.state === "ready_for_handoff" && (
                <div className="text-center text-xs text-amber-600 font-medium py-1.5">
                  ✓ Ready for handoff
                </div>
              )}
              {selectedConcept.state === "sent_to_backend" && (
                <div className="text-center text-xs text-green-600 font-medium py-1.5">
                  ✓ Sent to backend
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM HANDOFF TRAY */}
      {readyConcepts.length > 0 && (
        <div className="border-t border-gray-200 bg-amber-50 px-4 py-2 flex items-center gap-3 shrink-0" data-testid="handoff-tray">
          <span className="text-xs font-medium text-amber-800">
            Handoff Queue: {readyConcepts.length} concept{readyConcepts.length !== 1 ? "s" : ""}
          </span>
          <div className="flex gap-1 flex-1 overflow-x-auto">
            {readyConcepts.map((c) => (
              <span key={c.id} className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-800 rounded whitespace-nowrap">
                {c.label}
              </span>
            ))}
          </div>
          <button
            onClick={() => handoffMutation.mutate()}
            disabled={handoffMutation.isPending}
            className="px-3 py-1 text-xs font-medium bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50"
            data-testid="button-handoff-tray"
          >
            {handoffMutation.isPending ? "Sending..." : backendStatus.data?.online ? "Send to Backend" : "Export JSON"}
          </button>
        </div>
      )}
    </div>
  );
}
