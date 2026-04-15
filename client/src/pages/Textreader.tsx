import { useState, useCallback, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

const SESSION_STORAGE_KEY = "chronos_textreader_session_id";

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

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
  gecdStatus?: string | null; gecdScore?: number | null;
}

interface GecdTag {
  id?: number; candidateId: number; category: string; tagId: string | null;
  label: string; confidence: number;
}

const GECD_STATUS_BADGES: Record<string, { label: string; color: string; icon: string }> = {
  unscored: { label: "GECD?", color: "bg-gray-100 text-gray-500 border-gray-300", icon: "◯" },
  qualified: { label: "GECD✓", color: "bg-emerald-100 text-emerald-700 border-emerald-300", icon: "✓" },
  insufficient: { label: "GECD✕", color: "bg-red-100 text-red-700 border-red-300", icon: "✕" },
};

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
  const { toast } = useToast();
  const [sessionId, setSessionId] = useState<number | null>(() => {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY);
    return stored ? parseInt(stored, 10) || null : null;
  });
  const [hydrated, setHydrated] = useState(false);
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

  const [autoImages, setAutoImages] = useState<QuickResult[]>([]);
  const [autoSearching, setAutoSearching] = useState(false);
  const [autoTerms, setAutoTerms] = useState<string[]>([]);

  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [fileUploadLoading, setFileUploadLoading] = useState(false);
  const [fileUploadError, setFileUploadError] = useState<string | null>(null);
  const [fileUploadSummary, setFileUploadSummary] = useState<string | null>(null);
  const [detectedUrl, setDetectedUrl] = useState<string | null>(null);
  const [urlFetchLoading, setUrlFetchLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const debouncedTitle = useDebounce(title, 1500);
  const debouncedRawText = useDebounce(rawText, 1500);
  const debouncedCitation = useDebounce(citation, 1500);
  const debouncedSourceUrl = useDebounce(sourceUrl, 1500);
  const debouncedGrade = useDebounce(grade, 1500);
  const debouncedWeek = useDebounce(week, 1500);
  const debouncedSectionId = useDebounce(sectionId, 1500);

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

  useEffect(() => {
    if (sessionId !== null) {
      localStorage.setItem(SESSION_STORAGE_KEY, String(sessionId));
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, [sessionId]);

  useEffect(() => {
    if (sessionData.data && !hydrated) {
      const s = sessionData.data.session || sessionData.data;
      if (s?.id) {
        setTitle(s.title || "");
        setRawText(s.rawText || "");
        setCitation(s.citation || "");
        setSourceUrl(s.sourceUrl || "");
        setGrade(s.grade != null ? String(s.grade) : "");
        setWeek(s.week != null ? String(s.week) : "");
        setSectionId(s.sectionId || "");
        setSourceMode((s.sourceMode as SourceMode) || "open_web_fast");
        setHydrated(true);
      }
    }
  }, [sessionData.data, hydrated]);

  const autosaveMutation = useMutation({
    mutationFn: async (updates: Record<string, unknown>) => {
      if (!sessionId) return null;
      const res = await apiRequest("PATCH", `/api/textreader/sessions/${sessionId}`, updates);
      return res.json();
    },
  });

  useEffect(() => {
    if (!hydrated || !sessionId) return;
    autosaveMutation.mutate({
      title: debouncedTitle || "Untitled Session",
      rawText: debouncedRawText,
      citation: debouncedCitation || null,
      sourceUrl: debouncedSourceUrl || null,
      grade: debouncedGrade ? parseInt(debouncedGrade) : null,
      week: debouncedWeek ? parseInt(debouncedWeek) : null,
      sectionId: debouncedSectionId || null,
      sourceMode,
    });
  }, [debouncedTitle, debouncedRawText, debouncedCitation, debouncedSourceUrl, debouncedGrade, debouncedWeek, debouncedSectionId, sourceMode, sessionId, hydrated]);

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

  const [gecdLoading, setGecdLoading] = useState<number | null>(null);
  const [gecdPanelId, setGecdPanelId] = useState<number | null>(null);
  const [gecdTagsMap, setGecdTagsMap] = useState<Record<number, GecdTag[]>>({});
  const [gecdSummaryMap, setGecdSummaryMap] = useState<Record<number, string>>({});
  const [gecdFilter, setGecdFilter] = useState<"all" | "unscored" | "qualified" | "insufficient">("all");
  const [gecdTagDimFilter, setGecdTagDimFilter] = useState<string>("");
  const [gecdTagCultureFilter, setGecdTagCultureFilter] = useState<string>("");
  const [gecdTagMaterialFilter, setGecdTagMaterialFilter] = useState<string>("");
  const [gecdTagElementFilter, setGecdTagElementFilter] = useState<string>("");
  const [editingGecdTags, setEditingGecdTags] = useState<Record<number, GecdTag[]>>({}); // per-candidate edited tag state

  const ontologyQuery = useQuery({
    queryKey: ["ontology-all"],
    queryFn: () => fetch("/api/ontology/all").then(r => r.json()),
    staleTime: 60 * 60 * 1000,
  });

  const runGecdQualify = async (candidateId: number) => {
    setGecdLoading(candidateId);
    try {
      const res = await apiRequest("POST", `/api/candidates/${candidateId}/gecd-qualify`, {});
      const data = await res.json() as { suggestedTags?: GecdTag[]; summary?: string; gecdStatus?: string; gecdScore?: number };
      if (data.suggestedTags) {
        setGecdTagsMap(prev => ({ ...prev, [candidateId]: data.suggestedTags! }));
        setEditingGecdTags(prev => ({ ...prev, [candidateId]: data.suggestedTags! }));
      }
      if (data.summary) setGecdSummaryMap(prev => ({ ...prev, [candidateId]: data.summary! }));
      setGecdPanelId(candidateId);
      queryClient.invalidateQueries({ queryKey: ["candidates", selectedConceptId] });
      toast({ title: `GECD: ${data.gecdStatus === "qualified" ? "Qualified ✓" : "Insufficient ✕"}`, description: `Score: ${data.gecdScore}/100` });
    } catch {
      toast({ title: "GECD analysis failed", variant: "destructive" });
    } finally {
      setGecdLoading(null);
    }
  };

  const fetchGecdTags = async (candidateId: number) => {
    try {
      const res = await fetch(`/api/candidates/${candidateId}/gecd-tags`);
      const tags = await res.json() as GecdTag[];
      if (Array.isArray(tags) && tags.length > 0) {
        setGecdTagsMap(prev => ({ ...prev, [candidateId]: tags }));
        setEditingGecdTags(prev => ({ ...prev, [candidateId]: tags }));
      }
    } catch { /* silent */ }
  };

  // When any GECD tag filter is activated, preload tags for all scored candidates
  // so filtering works reliably across all candidates, not just those whose panel was opened
  const hasAnyTagFilter = !!(gecdTagDimFilter || gecdTagCultureFilter || gecdTagMaterialFilter || gecdTagElementFilter);
  useEffect(() => {
    if (!hasAnyTagFilter) return;
    const unloaded = candidates.filter(c => c.gecdStatus && c.gecdStatus !== "unscored" && !gecdTagsMap[c.id]);
    if (unloaded.length === 0) return;
    unloaded.forEach((c, i) => setTimeout(() => fetchGecdTags(c.id), i * 80));
  }, [hasAnyTagFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const addGecdTag = (candidateId: number, tag: GecdTag) => {
    setEditingGecdTags(prev => {
      const existing = prev[candidateId] || [];
      const filtered = existing.filter(t => !(t.category === tag.category && t.tagId === tag.tagId));
      return { ...prev, [candidateId]: [...filtered, tag] };
    });
  };

  const removeGecdTag = (candidateId: number, category: string, tagId: string | null) => {
    setEditingGecdTags(prev => ({
      ...prev,
      [candidateId]: (prev[candidateId] || []).filter(t => !(t.category === category && t.tagId === tagId)),
    }));
  };

  const saveGecdTags = async (candidateId: number) => {
    const tags = editingGecdTags[candidateId] || [];
    try {
      const res = await apiRequest("POST", `/api/candidates/${candidateId}/gecd-tags`, { tags });
      await res.json();
      queryClient.invalidateQueries({ queryKey: ["candidates", selectedConceptId] });
      toast({ title: "GECD tags confirmed", description: `${tags.length} tag(s) saved` });
    } catch {
      toast({ title: "Failed to save GECD tags", variant: "destructive" });
    }
  };

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
    let activeSessionId = sessionId;
    if (!activeSessionId) {
      const session = await createSession.mutateAsync();
      activeSessionId = session.id;
      setSessionId(activeSessionId);
    }
    const res = await apiRequest("POST", "/api/textreader/extract", {
      sessionId: activeSessionId,
      text: rawText,
      maxConcepts: 8,
    });
    await res.json();
    queryClient.invalidateQueries({ queryKey: ["session", activeSessionId] });
  }, [rawText, sessionId]);

  // ── Pure-JS keyword extractor — zero API calls ────────────────────────────
  const extractKeywords = useCallback((text: string): string[] => {
    const terms: string[] = [];

    // 1. Named Mesopotamian artifact types (most specific)
    const artifactRe = /\b(cylinder seal|cuneiform tablet|clay tablet|ziggurat|kudurru|stele|stela|votive plaque|stamp seal|bull.s head|warka vase|standard of ur|ram in (?:a |the )?thicket|ishtar gate|lion hunt|lapis lazuli pendant|carnelian bead|faience figurine)\b/gi;
    for (const m of text.matchAll(artifactRe)) terms.push(m[0].trim() + " mesopotamia");

    // 2. Culture-name + artifact-type phrases  e.g. "Hassuna ware", "Samarra pottery"
    const cultureArtifactRe = /\b([A-Z][a-z]{2,}(?:[-\s][A-Z][a-z]+)?\s+(?:ware|pottery|seal|tablet|vessel|figurine|statuette|relief|inscription|period|style|bowl|jar|vase))\b/g;
    for (const m of text.matchAll(cultureArtifactRe)) terms.push(m[0].trim() + " ancient");

    // 3. Place names near BCE dates  e.g. "Uruk, c. 3500 BCE"
    const siteRe = /\b(Ur|Uruk|Babylon|Nineveh|Nippur|Lagash|Eridu|Susa|Akkad|Ashur|Nimrud|Khorsabad|Kish|Mari|Ebla|Çatalhöyük|Jericho|Tell(?:\s+\w+)?)\b/g;
    const siteMatches = Array.from(new Set(Array.from(text.matchAll(siteRe)).map(m => m[0])));
    if (siteMatches.length) terms.push(siteMatches[0] + " ancient mesopotamia artifact");

    // 4. Deity names → find associated objects
    const deityRe = /\b(Ishtar|Inanna|Shamash|Marduk|Enlil|Anu|Nanna|Nabu|Tiamat|Gilgamesh|Enkidu)\b/g;
    const deityMatches = Array.from(new Set(Array.from(text.matchAll(deityRe)).map(m => m[0])));
    if (deityMatches.length) terms.push(deityMatches[0] + " mesopotamian artifact museum");

    // 5. Capitalized multi-word phrases (fallback)
    const capRe = /\b([A-Z][a-z]{3,}(?:\s+(?:of\s+)?[A-Z][a-z]{2,}){1,2})\b/g;
    const SKIP = /^(The|This|That|These|Those|There|Their|They|When|Where|What|With|From|Into|Upon|Over|Under|After|Before|During|While|Each|Such|Some|More)/;
    for (const m of text.matchAll(capRe)) {
      if (!SKIP.test(m[0])) { terms.push(m[0] + " ancient artifact"); break; }
    }

    // Deduplicate, limit to 4
    const seen = new Set<string>();
    return terms
      .map(t => t.toLowerCase().trim())
      .filter(t => { if (seen.has(t) || t.length < 6) return false; seen.add(t); return true; })
      .slice(0, 4);
  }, []);

  // ── Auto-search on paste — fires all museum sources, no LLM ──────────────
  const autoSearchRef = useRef<{ active: boolean; seen: Set<string>; done: number; total: number }>({
    active: false, seen: new Set(), done: 0, total: 0,
  });

  const uploadFiles = useCallback(async (files: File[]) => {
    if (!files.length) return;
    setFileUploadLoading(true);
    setFileUploadError(null);
    setFileUploadSummary(null);
    try {
      const formData = new FormData();
      for (const file of files) formData.append("files", file);
      const res = await fetch("/api/ingest/file", { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Upload failed" }));
        const msg = err.error || "Upload failed";
        setFileUploadError(msg);
        toast({ title: "Upload failed", description: msg, variant: "destructive" });
        return;
      }
      const data = await res.json();
      const results: Array<{ filename: string; text: string; error?: string }> = data.results || [];
      const successful = results.filter(r => r.text && !r.error);
      const failed = results.filter(r => r.error);
      if (successful.length === 0) {
        const msg = failed.map(f => `${f.filename}: ${f.error}`).join("; ") || "No text could be extracted";
        setFileUploadError(msg);
        toast({ title: "No text extracted", description: msg.slice(0, 120), variant: "destructive" });
        return;
      }

      if (successful.length === 1) {
        // Single file: populate the textarea for the user to review and extract
        const r = successful[0];
        setTitle(r.filename.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "));
        setRawText(r.text);
        setFileUploadSummary("1 file extracted — review and click Extract Concepts");
        if (failed.length > 0) {
          setFileUploadError(failed.map(f => `${f.filename}: ${f.error}`).join("; "));
        }
      } else {
        // Multiple files: ingest each as a separate document through the pipeline
        let ingested = 0;
        const ingestErrors: string[] = [];
        for (const r of successful) {
          try {
            const ingestRes = await fetch("/api/ingest/text", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title: r.filename.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
                text: r.text,
              }),
            });
            if (ingestRes.ok) {
              ingested++;
            } else {
              ingestErrors.push(r.filename);
            }
          } catch {
            ingestErrors.push(r.filename);
          }
        }
        const summaryParts = [`${ingested} document${ingested !== 1 ? "s" : ""} ingested`];
        if (failed.length > 0) summaryParts.push(`${failed.length} extraction failed`);
        if (ingestErrors.length > 0) summaryParts.push(`${ingestErrors.length} ingest failed`);
        setFileUploadSummary(summaryParts.join(", "));
        if (failed.length > 0 || ingestErrors.length > 0) {
          const errs = [
            ...failed.map(f => `${f.filename}: ${f.error}`),
            ...ingestErrors.map(f => `${f}: ingest failed`),
          ];
          setFileUploadError(errs.join("; "));
        }
      }

    } catch {
      const msg = "Upload failed. Please try again.";
      setFileUploadError(msg);
      toast({ title: "Upload failed", description: msg, variant: "destructive" });
    } finally {
      setFileUploadLoading(false);
    }
  }, [toast]);

  const fetchUrl = useCallback(async (url: string) => {
    setUrlFetchLoading(true);
    setFileUploadError(null);
    try {
      const res = await fetch("/api/ingest/url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Fetch failed" }));
        const msg = err.error || "Could not fetch URL";
        setFileUploadError(msg);
        toast({ title: "URL fetch failed", description: msg, variant: "destructive" });
        return;
      }
      const data = await res.json();
      if (data.document) {
        setTitle(data.document.title || url);
        setRawText(data.document.rawText || "");
        setSourceUrl(url);
        setFileUploadSummary(`Fetched from URL — ${data.chunkCount || 0} chunks, ${data.entities?.length || 0} entities extracted`);
      }
      setDetectedUrl(null);
    } catch {
      const msg = "Could not fetch URL. Make sure it is publicly accessible.";
      setFileUploadError(msg);
      toast({ title: "URL fetch failed", description: msg, variant: "destructive" });
    } finally {
      setUrlFetchLoading(false);
    }
  }, [toast]);

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pasted = e.clipboardData.getData("text");
    if (!pasted) return;

    // Detect URL pastes
    const trimmed = pasted.trim();
    if (/^https?:\/\/\S+$/.test(trimmed)) {
      setDetectedUrl(trimmed);
      return;
    }

    if (pasted.trim().length < 30) return;

    const terms = extractKeywords(pasted);
    if (!terms.length) return;

    // Reset search state
    autoSearchRef.current = { active: true, seen: new Set(), done: 0, total: terms.length };
    setAutoImages([]);
    setAutoSearching(true);
    setAutoTerms(terms);
    setSelectedConceptId(null);
    setQuickResults([]);
    setQuickQuery("");

    terms.forEach(async (term) => {
      try {
        const res = await fetch(`/api/quick-search/images?q=${encodeURIComponent(term)}`);
        const data = await res.json();
        const results: QuickResult[] = data.results || [];
        // Deduplicate using the ref's shared set
        const fresh = results.filter(r => {
          if (autoSearchRef.current.seen.has(r.url)) return false;
          autoSearchRef.current.seen.add(r.url);
          return true;
        });
        if (fresh.length) setAutoImages(prev => [...prev, ...fresh]);
      } catch { /* non-fatal */ } finally {
        autoSearchRef.current.done++;
        if (autoSearchRef.current.done >= autoSearchRef.current.total) {
          autoSearchRef.current.active = false;
          setAutoSearching(false);
        }
      }
    });
  }, [extractKeywords]);

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
          {sessionId && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400" data-testid="autosave-indicator">
                {autosaveMutation.isPending ? "💾 Saving…" : hydrated ? `✓ Session #${sessionId}` : "Loading…"}
              </span>
              <button
                onClick={() => {
                  setSessionId(null); setHydrated(false);
                  setTitle(""); setRawText(""); setCitation(""); setSourceUrl("");
                  setGrade(""); setWeek(""); setSectionId("");
                  setSelectedConceptId(null); setQuickQuery(""); setQuickResults([]);
                }}
                className="text-[10px] px-2 py-0.5 border border-gray-200 text-gray-500 rounded hover:border-red-300 hover:text-red-500 transition-colors"
                data-testid="button-new-session"
              >New Session</button>
            </div>
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

            {/* File Drop Zone */}
            <div
              className={`rounded-lg border-2 border-dashed transition-colors p-3 text-center cursor-pointer ${
                isDraggingFile
                  ? "border-amber-400 bg-amber-50"
                  : "border-gray-200 bg-gray-50 hover:border-amber-300 hover:bg-amber-50/50"
              }`}
              data-testid="file-drop-zone"
              onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
              onDragLeave={() => setIsDraggingFile(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingFile(false);
                const files = Array.from(e.dataTransfer.files);
                if (files.length) uploadFiles(files);
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                data-testid="input-file-picker"
                accept=".pdf,.doc,.docx,.txt,.md,.json,.js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.cs,.go,.rs,.rb,.php,.swift,.kt,.sh,.yaml,.yml,.xml,.html,.css,.sql"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length) uploadFiles(files);
                  e.target.value = "";
                }}
              />
              {fileUploadLoading ? (
                <div className="flex items-center justify-center gap-1.5 py-1">
                  <div className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-amber-700">Extracting text…</span>
                </div>
              ) : (
                <>
                  <p className="text-xs font-medium text-gray-500">Drop files or click to browse</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">PDF, DOCX, TXT, MD, JSON, code files</p>
                </>
              )}
            </div>

            {/* File upload feedback */}
            {fileUploadSummary && !fileUploadError && (
              <div className="rounded px-2 py-1.5 bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-700 flex items-center justify-between" data-testid="file-upload-summary">
                <span>✓ {fileUploadSummary}</span>
                <button onClick={() => setFileUploadSummary(null)} className="text-emerald-400 hover:text-emerald-700 ml-2">×</button>
              </div>
            )}
            {fileUploadError && (
              <div className="rounded px-2 py-1.5 bg-red-50 border border-red-200 text-[11px] text-red-700 flex items-center justify-between" data-testid="file-upload-error">
                <span>{fileUploadError}</span>
                <button onClick={() => setFileUploadError(null)} className="text-red-400 hover:text-red-700 ml-2">×</button>
              </div>
            )}

            {/* URL detection prompt */}
            {detectedUrl && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-2.5" data-testid="url-detected-banner">
                <p className="text-[10px] font-semibold text-blue-800 mb-1.5 uppercase tracking-wide">URL Detected</p>
                <p className="text-[10px] text-blue-600 mb-2 truncate">{detectedUrl}</p>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => fetchUrl(detectedUrl)}
                    disabled={urlFetchLoading}
                    className="flex-1 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 font-medium"
                    data-testid="button-fetch-url"
                  >
                    {urlFetchLoading ? "Fetching…" : "Fetch & Extract"}
                  </button>
                  <button
                    onClick={() => setDetectedUrl(null)}
                    className="px-2 py-1 text-xs border border-blue-200 text-blue-600 rounded hover:bg-blue-100"
                    data-testid="button-dismiss-url"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

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
                  value={rawText}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRawText(val);
                    const trimmed = val.trim();
                    if (/^https?:\/\/\S+$/.test(trimmed)) {
                      setDetectedUrl(trimmed);
                    } else if (detectedUrl && !trimmed.startsWith("http")) {
                      setDetectedUrl(null);
                    }
                  }}
                  onPaste={handlePaste}
                  placeholder="Paste research text or drop a file above…"
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

          {/* ── LIVE IMAGE FEED — fires the instant text is pasted ────────── */}
          {(autoSearching || autoImages.length > 0) && (
            <div className="border-b border-amber-200 bg-amber-50" data-testid="auto-image-feed">
              <div className="flex items-center justify-between px-4 py-2 border-b border-amber-200">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${autoSearching ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`} />
                  <span className="text-xs font-semibold text-amber-900">
                    {autoSearching ? `Searching across all sources…` : `${autoImages.length} images found`}
                  </span>
                  {autoTerms.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {autoTerms.map((t, i) => (
                        <span key={i} className="text-[10px] px-1.5 py-0.5 bg-amber-200 text-amber-800 rounded font-mono">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => { setAutoImages([]); setAutoTerms([]); setAutoSearching(false); }}
                  className="text-[10px] text-amber-600 hover:text-amber-900"
                  data-testid="button-clear-auto-images"
                >clear</button>
              </div>
              <div className="p-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 gap-2">
                {autoImages.map((img, i) => (
                  <a
                    key={i}
                    href={img.objectUrl || img.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative aspect-square bg-gray-100 rounded overflow-hidden hover:ring-2 hover:ring-amber-400 transition-all"
                    title={`${img.title || "image"} — ${img.source}`}
                    data-testid={`auto-image-${i}`}
                  >
                    <img
                      src={img.url}
                      alt={img.title || ""}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = "none"; }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[8px] px-1 py-0.5 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                      {img.source}
                    </div>
                  </a>
                ))}
                {autoSearching && autoImages.length === 0 && (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="aspect-square bg-amber-100 rounded animate-pulse" />
                  ))
                )}
              </div>
            </div>
          )}

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
                    <div className="mb-1">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <h3 className="text-xs font-semibold text-gray-700 shrink-0">Candidates ({candidates.length})</h3>
                        <select
                          value={gecdFilter}
                          onChange={e => setGecdFilter(e.target.value as typeof gecdFilter)}
                          className="text-[8px] border border-gray-200 rounded px-1 py-0.5 bg-white text-gray-600"
                          data-testid="select-gecd-filter"
                          title="Filter by GECD status">
                          <option value="all">All GECD</option>
                          <option value="unscored">Unscored</option>
                          <option value="qualified">Qualified ✓</option>
                          <option value="insufficient">Insuff ✕</option>
                        </select>
                      </div>
                      {(() => {
                        const ont = ontologyQuery.data as { dimensions?: Array<{id: string; name: string}>; cultures?: Array<{id: string; name: string}>; materials?: Array<{id: string; name: string}>; elements?: Array<{id: string; name: string}> } | undefined;
                        const hasTagFilters = !!(gecdTagDimFilter || gecdTagCultureFilter || gecdTagMaterialFilter || gecdTagElementFilter);
                        return (
                          <div className="flex flex-wrap gap-0.5">
                            <select value={gecdTagDimFilter} onChange={e => setGecdTagDimFilter(e.target.value)}
                              className="text-[7px] border border-blue-200 rounded px-0.5 py-0.5 bg-white text-blue-700"
                              data-testid="select-gecd-tag-dim-filter" title="Filter by GECD dimension">
                              <option value="">Dim: All</option>
                              {ont?.dimensions?.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                            <select value={gecdTagCultureFilter} onChange={e => setGecdTagCultureFilter(e.target.value)}
                              className="text-[7px] border border-orange-200 rounded px-0.5 py-0.5 bg-white text-orange-700"
                              data-testid="select-gecd-tag-culture-filter" title="Filter by culture">
                              <option value="">Civ: All</option>
                              {ont?.cultures?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <select value={gecdTagMaterialFilter} onChange={e => setGecdTagMaterialFilter(e.target.value)}
                              className="text-[7px] border border-amber-200 rounded px-0.5 py-0.5 bg-white text-amber-700"
                              data-testid="select-gecd-tag-material-filter" title="Filter by material">
                              <option value="">Mat: All</option>
                              {ont?.materials?.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                            <select value={gecdTagElementFilter} onChange={e => setGecdTagElementFilter(e.target.value)}
                              className="text-[7px] border border-purple-200 rounded px-0.5 py-0.5 bg-white text-purple-700"
                              data-testid="select-gecd-tag-element-filter" title="Filter by geometric element">
                              <option value="">Elem: All</option>
                              {ont?.elements?.map(el => <option key={el.id} value={el.id}>{el.name}</option>)}
                            </select>
                            {hasTagFilters && (
                              <button onClick={() => { setGecdTagDimFilter(""); setGecdTagCultureFilter(""); setGecdTagMaterialFilter(""); setGecdTagElementFilter(""); }}
                                className="text-[7px] px-0.5 py-0.5 bg-gray-100 text-gray-500 rounded hover:bg-gray-200"
                                data-testid="button-clear-gecd-tag-filters" title="Clear tag filters">✕</button>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                    {candidatesQuery.isLoading ? (
                      <p className="text-xs text-gray-400">Loading...</p>
                    ) : candidates.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">Run search or generate AI image</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {candidates.filter(c => {
                          if (gecdFilter !== "all" && (c.gecdStatus || "unscored") !== gecdFilter) return false;
                          if (gecdTagDimFilter || gecdTagCultureFilter || gecdTagMaterialFilter || gecdTagElementFilter) {
                            const tags = editingGecdTags[c.id] || gecdTagsMap[c.id] || [];
                            if (gecdTagDimFilter && !tags.some(t => t.category === "dimension" && t.tagId === gecdTagDimFilter)) return false;
                            if (gecdTagCultureFilter && !tags.some(t => t.category === "culture" && t.tagId === gecdTagCultureFilter)) return false;
                            if (gecdTagMaterialFilter && !tags.some(t => t.category === "material" && t.tagId === gecdTagMaterialFilter)) return false;
                            if (gecdTagElementFilter && !tags.some(t => t.category === "element" && t.tagId === gecdTagElementFilter)) return false;
                          }
                          return true;
                        }).map((c) => {
                          const d = c.approved;
                          const gStatus = c.gecdStatus || "unscored";
                          const gBadge = GECD_STATUS_BADGES[gStatus] || GECD_STATUS_BADGES.unscored;
                          const cardBorder =
                            d === "approve_reference" ? "border-green-400 ring-1 ring-green-200" :
                            d === "reject" ? "border-red-300 opacity-50" :
                            d === "needs_ai_generation" ? "border-purple-400 ring-1 ring-purple-100" :
                            d === "needs_overlay" ? "border-orange-400 ring-1 ring-orange-100" :
                            d === "needs_crop_or_resize" ? "border-yellow-400 ring-1 ring-yellow-100" :
                            d === "needs_better_source" ? "border-gray-400 ring-1 ring-gray-200" :
                            "border-gray-200";
                          const isGecdOpen = gecdPanelId === c.id;
                          const gecdTags = gecdTagsMap[c.id] || [];
                          const gecdSummary = gecdSummaryMap[c.id] || "";
                          return (
                          <div key={c.id}
                            className={`rounded border overflow-hidden ${cardBorder} col-span-1`}
                            data-testid={`candidate-${c.id}`}>
                            <div className="relative bg-gray-100" style={{ aspectRatio: "1/1", maxHeight: 120 }}>
                              <img src={c.imageUrl} alt={c.title || ""}
                                className="w-full h-full object-contain"
                                onError={(e) => { (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23eee'/%3E%3Ctext x='50' y='55' text-anchor='middle' fill='%23999' font-size='10'%3ENo img%3C/text%3E%3C/svg%3E"; }} />
                              <div className="absolute top-1 left-1 flex gap-0.5 flex-wrap">
                                {SOURCE_TYPE_BADGES[c.sourceType] && (
                                  <span className={`text-[8px] px-1 py-0.5 rounded ${SOURCE_TYPE_BADGES[c.sourceType].color}`}>
                                    {SOURCE_TYPE_BADGES[c.sourceType].label}
                                  </span>
                                )}
                                <span className={`text-[8px] px-1 py-0.5 rounded border font-medium ${gBadge.color}`}
                                  data-testid={`gecd-badge-${c.id}`} title={`GECD: ${gStatus}${c.gecdScore != null ? ` (${c.gecdScore}/100)` : ""}`}>
                                  {gBadge.label}
                                </span>
                              </div>
                              <div className="absolute bottom-1 left-1">
                                {ACCURACY_BADGES[c.accuracyStatus] && (
                                  <span className={`text-[8px] px-1 py-0.5 rounded ${ACCURACY_BADGES[c.accuracyStatus].color}`}>
                                    {ACCURACY_BADGES[c.accuracyStatus].label}
                                  </span>
                                )}
                              </div>
                              {d && d !== "pending" && (
                                <div className="absolute top-1 right-1">
                                  <span className={`text-[8px] px-1 py-0.5 rounded font-bold ${
                                    d === "approve_reference" ? "bg-green-500 text-white" :
                                    d === "reject" ? "bg-red-500 text-white" :
                                    d === "needs_ai_generation" ? "bg-purple-500 text-white" :
                                    d === "needs_overlay" ? "bg-orange-500 text-white" :
                                    d === "needs_crop_or_resize" ? "bg-yellow-500 text-white" :
                                    "bg-gray-500 text-white"
                                  }`}>
                                    {d === "approve_reference" ? "✓REF" :
                                     d === "reject" ? "✕" :
                                     d === "needs_ai_generation" ? "AI" :
                                     d === "needs_overlay" ? "OVR" :
                                     d === "needs_crop_or_resize" ? "CROP" :
                                     "SRC"}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="p-1.5">
                              <p className="text-[10px] text-gray-700 font-medium line-clamp-1">{c.title || "Untitled"}</p>
                              <p className="text-[9px] text-gray-400 mb-1">{c.source || "?"}</p>
                              {/* GECD Qualify button */}
                              <button
                                onClick={() => {
                                  if (isGecdOpen) { setGecdPanelId(null); } else {
                                    if (gecdTags.length === 0 && gStatus !== "unscored") fetchGecdTags(c.id);
                                    setGecdPanelId(c.id);
                                  }
                                }}
                                className={`w-full text-[8px] py-0.5 px-1 rounded font-medium mb-1 border flex items-center justify-between ${isGecdOpen ? "bg-indigo-100 text-indigo-700 border-indigo-300" : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-indigo-50 hover:text-indigo-600"}`}
                                data-testid={`button-gecd-panel-${c.id}`}>
                                <span>GECD {gStatus === "qualified" ? "✓" : gStatus === "insufficient" ? "✕" : "?"}</span>
                                <span>{isGecdOpen ? "▲" : "▼"}</span>
                              </button>

                              {/* GECD Panel */}
                              {isGecdOpen && (() => {
                                const ontology = ontologyQuery.data as { elements?: Array<{id: string; name: string}>; dimensions?: Array<{id: string; name: string}>; operations?: Array<{id: string; name: string}>; materials?: Array<{id: string; name: string}>; techniques?: Array<{id: string; name: string}>; cultures?: Array<{id: string; name: string}>; mathConcepts?: Array<{id: string; name: string}> } | undefined;
                                const currentEdits = editingGecdTags[c.id] || [];
                                const hasByCategory = (cat: string) => currentEdits.some(t => t.category === cat);
                                return (
                                <div className="mb-1 p-1.5 bg-indigo-50 rounded border border-indigo-200 text-[8px]" data-testid={`gecd-panel-${c.id}`}>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-semibold text-indigo-700">GECD Analysis</span>
                                    {c.gecdScore != null && (
                                      <span className={`px-1 py-0.5 rounded font-bold ${c.gecdScore >= 60 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                                        {c.gecdScore}/100
                                      </span>
                                    )}
                                  </div>
                                  {gecdSummary && <p className="text-gray-600 italic mb-1.5 text-[7px] leading-tight">{gecdSummary}</p>}

                                  {/* Current tag chips (editable) */}
                                  {currentEdits.length > 0 && (
                                    <div className="flex flex-wrap gap-0.5 mb-1.5">
                                      {currentEdits.map((tag, i) => (
                                        <span key={i} className="inline-flex items-center gap-0.5 px-1 py-0.5 bg-white border border-indigo-200 rounded text-indigo-700"
                                          title={`${tag.category}`}>
                                          <span className="text-[6px] text-indigo-400 uppercase">{tag.category.slice(0,3)}</span>
                                          <span>{tag.label}</span>
                                          <button onClick={() => removeGecdTag(c.id, tag.category, tag.tagId)}
                                            className="text-red-400 hover:text-red-600 ml-0.5" title="Remove tag">×</button>
                                        </span>
                                      ))}
                                    </div>
                                  )}

                                  {/* Ontology-backed tag selectors */}
                                  <div className="space-y-0.5 mb-1.5">
                                    {ontology && ([
                                      { key: "dimension", label: "Dim", items: ontology.dimensions || [], color: "border-blue-200" },
                                      { key: "element", label: "Elem", items: ontology.elements || [], color: "border-purple-200" },
                                      { key: "operation", label: "Op", items: ontology.operations || [], color: "border-fuchsia-200" },
                                      { key: "material", label: "Mat", items: ontology.materials || [], color: "border-amber-200" },
                                      { key: "technique", label: "Tech", items: ontology.techniques || [], color: "border-teal-200" },
                                      { key: "culture", label: "Civ", items: ontology.cultures || [], color: "border-orange-200" },
                                      { key: "mathLink", label: "Math", items: ontology.mathConcepts || [], color: "border-green-200" },
                                    ] as const).map(({ key, label, items, color }) => (
                                      <div key={key} className="flex items-center gap-0.5">
                                        <span className="text-[7px] text-gray-400 w-6 shrink-0">{label}</span>
                                        <select
                                          className={`flex-1 text-[8px] bg-white border ${color} rounded px-0.5 py-0.5 text-gray-700`}
                                          data-testid={`gecd-select-${key}-${c.id}`}
                                          onChange={e => {
                                            const val = e.target.value;
                                            if (!val) return;
                                            const item = items.find(i => i.id === val);
                                            addGecdTag(c.id, { candidateId: c.id, category: key, tagId: val, label: item?.name || val, confidence: 1 });
                                            e.target.value = "";
                                          }}>
                                          <option value="">+ Add {label.toLowerCase()}…</option>
                                          {items.map(item => {
                                            const already = currentEdits.some(t => t.category === key && t.tagId === item.id);
                                            return <option key={item.id} value={item.id} disabled={already}>{item.name}{already ? " ✓" : ""}</option>;
                                          })}
                                        </select>
                                      </div>
                                    ))}
                                  </div>

                                  {!hasByCategory("element") && !hasByCategory("dimension") && !gecdSummary && (
                                    <p className="text-gray-400 italic mb-1 text-[7px]">Run GECD to auto-tag, or use dropdowns above</p>
                                  )}

                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => runGecdQualify(c.id)}
                                      disabled={gecdLoading === c.id}
                                      className="flex-1 py-0.5 px-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 font-medium"
                                      data-testid={`button-run-gecd-${c.id}`}>
                                      {gecdLoading === c.id ? "Analyzing…" : "Run GECD"}
                                    </button>
                                    <button
                                      onClick={() => saveGecdTags(c.id)}
                                      disabled={currentEdits.length === 0}
                                      className="flex-1 py-0.5 px-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-40 font-medium"
                                      data-testid={`button-confirm-gecd-${c.id}`}>
                                      Confirm ({currentEdits.length})
                                    </button>
                                  </div>
                                </div>
                                );
                              })()}

                              <div className="grid grid-cols-3 gap-0.5">
                                <button
                                  onClick={() => updateCandidate.mutate({ id: c.id, updates: { approved: "approve_reference", accuracyStatus: "historically_grounded" } })}
                                  className={`text-[8px] py-0.5 px-0.5 rounded font-medium truncate ${d === "approve_reference" ? "bg-green-500 text-white" : "bg-green-50 text-green-700 hover:bg-green-100"}`}
                                  title="Approve as Reference"
                                  data-testid={`button-approve-ref-${c.id}`}>✓ Ref</button>
                                <button
                                  onClick={() => updateCandidate.mutate({ id: c.id, updates: { approved: "needs_overlay" } })}
                                  className={`text-[8px] py-0.5 px-0.5 rounded font-medium truncate ${d === "needs_overlay" ? "bg-orange-500 text-white" : "bg-orange-50 text-orange-700 hover:bg-orange-100"}`}
                                  title="Needs Overlay"
                                  data-testid={`button-needs-overlay-${c.id}`}>Overlay</button>
                                <button
                                  onClick={() => updateCandidate.mutate({ id: c.id, updates: { approved: "needs_crop_or_resize" } })}
                                  className={`text-[8px] py-0.5 px-0.5 rounded font-medium truncate ${d === "needs_crop_or_resize" ? "bg-yellow-500 text-white" : "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"}`}
                                  title="Needs Crop / Resize"
                                  data-testid={`button-needs-crop-${c.id}`}>Crop</button>
                                <button
                                  onClick={() => updateCandidate.mutate({ id: c.id, updates: { approved: "needs_ai_generation" } })}
                                  className={`text-[8px] py-0.5 px-0.5 rounded font-medium truncate ${d === "needs_ai_generation" ? "bg-purple-500 text-white" : "bg-purple-50 text-purple-700 hover:bg-purple-100"}`}
                                  title="Needs AI Generation"
                                  data-testid={`button-needs-ai-${c.id}`}>Gen AI</button>
                                <button
                                  onClick={() => updateCandidate.mutate({ id: c.id, updates: { approved: "needs_better_source" } })}
                                  className={`text-[8px] py-0.5 px-0.5 rounded font-medium truncate ${d === "needs_better_source" ? "bg-gray-500 text-white" : "bg-gray-50 text-gray-700 hover:bg-gray-100"}`}
                                  title="Needs Better Source"
                                  data-testid={`button-needs-src-${c.id}`}>Re-src</button>
                                <button
                                  onClick={() => updateCandidate.mutate({ id: c.id, updates: { approved: "reject" } })}
                                  className={`text-[8px] py-0.5 px-0.5 rounded font-medium truncate ${d === "reject" ? "bg-red-500 text-white" : "bg-red-50 text-red-700 hover:bg-red-100"}`}
                                  title="Reject"
                                  data-testid={`button-reject-${c.id}`}>✕ Rej</button>
                              </div>
                            </div>
                          </div>
                          );
                        })}
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
