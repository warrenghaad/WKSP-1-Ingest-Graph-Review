import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Search, Bookmark, ArrowLeft, Image as ImageIcon, Check, Download, X,
  AlertCircle, Loader2, Bold, Italic, Heading2, Heading3,
  Undo, Redo, Strikethrough, Highlighter,
  FileText, ChevronDown, Grid3x3, Filter, Eye, Trash2,
  CheckCircle2, RefreshCw, ExternalLink, Upload, Sparkles,
  Tag, MapPin, Clock, User as UserIcon, Zap, ChevronRight,
  ThumbsUp, ThumbsDown, MoreHorizontal, Layers, ListTodo,
  Play, Star, AlertTriangle, Cpu, Wand2, BookOpen, Package,
  ChevronLeft, Globe, ImagePlus
} from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import { ImageAnnotation } from "@/components/InlineImageExtension";
import { InlineImageNode } from "@/components/InlineImageNode";
import { EntityMark } from "@/components/EntityMark";
import { DOCUMENTS } from "@/lib/documentContent";
import OfflineIndicator from "@/components/OfflineIndicator";

interface ImageResult {
  url: string;
  title: string;
  source: string;
  objectUrl?: string;
}

interface SavedImage {
  id: number;
  url: string;
  title: string | null;
  source: string | null;
  query: string | null;
  createdAt: string;
}

interface EntityData {
  id: number;
  label: string;
  entityType: string;
  description: string | null;
  period: string | null;
  region: string | null;
  magicTags: string[] | null;
  aliases: string[] | null;
}

interface VisualRequirement {
  id: number;
  entityId: number;
  documentId: number | null;
  kind: string;
  status: string;
  imageSpec: any;
  overlaySpec: any;
  primaryAssetId: number | null;
  qcFailCount: number;
}

interface ImageCandidate {
  id: number;
  requirementId: number;
  url: string;
  thumbnailUrl: string | null;
  title: string | null;
  source: string | null;
  provider: string | null;
  objectUrl: string | null;
  qcStatus: string;
  qcScore: number | null;
  metadata: any;
}

interface QcAssessment {
  id: number;
  candidateId: number;
  passed: boolean;
  score: number;
  reasons: string[] | null;
  observations: any;
}

interface LinkedAsset {
  id: number;
  linkId: number;
  url: string;
  title: string | null;
  source: string | null;
  objectUrl: string | null;
  status: string;
  sourceType: string;
  linkType: string;
  approved: boolean;
}

interface EntityDetail {
  entity: EntityData;
  assets: LinkedAsset[];
  mentions: any[];
  requirements: VisualRequirement[];
  topCandidates: ImageCandidate[];
}

interface IngestResult {
  document: any;
  entities: (EntityData & { searchQueries: string[]; offsetStart?: number; offsetEnd?: number; snippet?: string })[];
  chunkCount: number;
}

interface WorkQueueItem {
  document: { id: number; title: string; createdAt: string };
  missing: number;
  qcFailed: number;
  readyToSave: number;
}

const ENTITY_TYPE_COLORS: Record<string, string> = {
  artifact: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  place: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  person: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  deity: "bg-red-500/20 text-red-300 border-red-500/30",
  concept: "bg-green-500/20 text-green-300 border-green-500/30",
  material: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  technique: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  period: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  culture: "bg-pink-500/20 text-pink-300 border-pink-500/30",
};

const ENTITY_TYPE_ICONS: Record<string, typeof Tag> = {
  artifact: Sparkles,
  place: MapPin,
  person: UserIcon,
  deity: Zap,
  period: Clock,
};

const REQ_STATUS_COLORS: Record<string, string> = {
  MISSING: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  SEARCHING: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  QC_IN_PROGRESS: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  CANDIDATES_READY: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  COMPLETE: "bg-green-500/20 text-green-300 border-green-500/30",
  PROMPT_FALLBACK: "bg-purple-500/20 text-purple-300 border-purple-500/30",
};

const QC_STATUS_COLORS: Record<string, string> = {
  pending: "bg-gray-500/20 text-gray-400",
  passed: "bg-green-500/20 text-green-300",
  failed: "bg-red-500/20 text-red-300",
  saved: "bg-emerald-500/20 text-emerald-300",
};

const INITIAL_CONTENT = DOCUMENTS[0]?.content || "";

export default function Reader() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [currentDocIndex, setCurrentDocIndex] = useState(0);
  const [docPickerOpen, setDocPickerOpen] = useState(false);
  const currentDoc = DOCUMENTS[currentDocIndex];

  const [selectedText, setSelectedText] = useState("");
  const [searchResults, setSearchResults] = useState<ImageResult[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());
  const [damFilter, setDamFilter] = useState<string | null>(null);
  const [floatingSearchPos, setFloatingSearchPos] = useState<{ top: number; left: number } | null>(null);
  const [selectionRange, setSelectionRange] = useState<{ from: number; to: number } | null>(null);
  const [hoveredAnnotation, setHoveredAnnotation] = useState<{ url: string; title: string; source: string; rect: DOMRect } | null>(null);

  const [drawerMode, setDrawerMode] = useState<"prism" | "dam" | "entity" | "ingest" | "workqueue">("prism");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerPinned, setDrawerPinned] = useState(false);

  const [activeEntityId, setActiveEntityId] = useState<number | null>(null);
  const [entityDetail, setEntityDetail] = useState<EntityDetail | null>(null);
  const [entityLoading, setEntityLoading] = useState(false);

  const [activeRequirementId, setActiveRequirementId] = useState<number | null>(null);
  const [requirementDetail, setRequirementDetail] = useState<{ requirement: VisualRequirement; candidates: ImageCandidate[]; assessments: QcAssessment[] } | null>(null);

  const [reqSearching, setReqSearching] = useState(false);
  const [reqSpecGenerating, setReqSpecGenerating] = useState(false);
  const [reqQcRunning, setReqQcRunning] = useState<number | null>(null);
  const [reqPromptGenerating, setReqPromptGenerating] = useState(false);
  const [reqSaving, setReqSaving] = useState<number | null>(null);
  const [reqImageGenerating, setReqImageGenerating] = useState<number | null>(null);

  const [ingestTitle, setIngestTitle] = useState("");
  const [ingestText, setIngestText] = useState("");
  const [ingestUrl, setIngestUrl] = useState("");
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestResult, setIngestResult] = useState<IngestResult | null>(null);
  const [autoSearchingEntities, setAutoSearchingEntities] = useState(false);
  const [autoSearchProgress, setAutoSearchProgress] = useState({ current: 0, total: 0 });
  const [entitySearchQuery, setEntitySearchQuery] = useState("");
  const [entitySearching, setEntitySearching] = useState(false);

  const editorContainerRef = useRef<HTMLDivElement>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const drawerPinnedRef = useRef(false);

  useEffect(() => { drawerPinnedRef.current = drawerPinned; }, [drawerPinned]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({ placeholder: "Start writing or paste your research text here..." }),
      ImageAnnotation,
      InlineImageNode,
      EntityMark,
    ],
    content: INITIAL_CONTENT,
    editorProps: {
      attributes: {
        class: "prose prose-invert prose-lg font-serif max-w-none focus:outline-none selection:bg-primary/30 selection:text-white min-h-[60vh]",
      },
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      if (from === to) { setSelectedText(""); setSelectionRange(null); return; }
      const text = editor.state.doc.textBetween(from, to, " ");
      if (text.trim().length > 0) { setSelectedText(text.trim()); setSelectionRange({ from, to }); }
    },
  });

  const switchDocument = useCallback((index: number) => {
    if (editor && DOCUMENTS[index]) {
      setCurrentDocIndex(index);
      editor.commands.setContent(DOCUMENTS[index].content);
      setDocPickerOpen(false);
      setSelectionRange(null);
      setSelectedText("");
      setFloatingSearchPos(null);
      setSearchResults([]);
      setSearchQuery("");
      setIsSearching(false);
      setSearchError(null);
    }
  }, [editor]);

  useEffect(() => {
    const handleClickOutside = () => setDocPickerOpen(false);
    if (docPickerOpen) {
      setTimeout(() => document.addEventListener("click", handleClickOutside), 0);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [docPickerOpen]);

  useEffect(() => {
    const container = editorContainerRef.current;
    if (!container) return;

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      const entityEl = target.closest(".entity-mark") as HTMLElement;
      if (entityEl) {
        const entityId = entityEl.getAttribute("data-entity-id");
        if (entityId) {
          if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
          hoverTimerRef.current = setTimeout(() => {
            if (!drawerPinnedRef.current) {
              const eid = parseInt(entityId);
              setActiveEntityId(eid);
              setDrawerMode("entity");
              setDrawerOpen(true);
              loadEntityDetail(eid);
            }
          }, 300);
          return;
        }
      }

      const annotation = target.closest(".image-annotation") as HTMLElement;
      if (annotation) {
        const url = annotation.getAttribute("data-image-url");
        const title = annotation.getAttribute("data-image-title");
        const source = annotation.getAttribute("data-image-source");
        if (url) {
          const rect = annotation.getBoundingClientRect();
          setHoveredAnnotation({ url, title: title ?? "", source: source ?? "", rect });
        }
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const related = e.relatedTarget as HTMLElement;

      if (target.closest(".entity-mark") && !related?.closest(".entity-mark")) {
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
        if (!drawerPinnedRef.current) {
          setDrawerOpen(false);
          setActiveEntityId(null);
        }
      }

      if (target.closest(".image-annotation") && (!related || !related.closest(".image-annotation"))) {
        setHoveredAnnotation(null);
      }
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const entityEl = target.closest(".entity-mark") as HTMLElement;
      if (entityEl) {
        const entityId = entityEl.getAttribute("data-entity-id");
        if (entityId) {
          if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
          const eid = parseInt(entityId);
          setActiveEntityId(eid);
          setDrawerMode("entity");
          setDrawerOpen(true);
          setDrawerPinned(true);
          loadEntityDetail(eid);
        }
      }
    };

    const handleScroll = () => setHoveredAnnotation(null);

    container.addEventListener("mouseover", handleMouseOver);
    container.addEventListener("mouseout", handleMouseOut);
    container.addEventListener("click", handleClick);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      container.removeEventListener("mouseover", handleMouseOver);
      container.removeEventListener("mouseout", handleMouseOut);
      container.removeEventListener("click", handleClick);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, []);

  const openEntityPreview = async (entityId: number) => {
    if (drawerPinned) return;
    setActiveEntityId(entityId);
    setDrawerMode("entity");
    setDrawerOpen(true);
    await loadEntityDetail(entityId);
  };

  const openEntityDrawer = async (entityId: number) => {
    setActiveEntityId(entityId);
    setDrawerMode("entity");
    setDrawerOpen(true);
    setDrawerPinned(true);
    await loadEntityDetail(entityId);
  };

  const loadEntityDetail = async (entityId: number) => {
    setEntityLoading(true);
    try {
      const res = await fetch(`/api/entities/${entityId}`);
      if (res.ok) {
        const data = await res.json();
        setEntityDetail(data);
      }
    } catch (err) {
      console.error("Failed to fetch entity:", err);
    } finally {
      setEntityLoading(false);
    }
  };

  const loadRequirementDetail = async (requirementId: number) => {
    try {
      const res = await fetch(`/api/requirements/${requirementId}`);
      if (res.ok) {
        const data = await res.json();
        setRequirementDetail(data);
        setActiveRequirementId(requirementId);
      }
    } catch (err) {
      console.error("Failed to fetch requirement:", err);
    }
  };

  const handleRunSearch = async (requirementId: number) => {
    setReqSearching(true);
    try {
      const res = await fetch(`/api/requirements/${requirementId}/search`, { method: "POST" });
      if (res.ok) {
        await loadRequirementDetail(requirementId);
        if (activeEntityId) await loadEntityDetail(activeEntityId);
        toast({ title: "Search complete", description: "Candidates loaded", duration: 2000 });
      }
    } catch (err) {
      toast({ title: "Search failed", variant: "destructive" });
    } finally {
      setReqSearching(false);
    }
  };

  const handleGenerateSpec = async (requirementId: number) => {
    setReqSpecGenerating(true);
    try {
      const res = await fetch(`/api/requirements/${requirementId}/spec/generate`, { method: "POST" });
      if (res.ok) {
        await loadRequirementDetail(requirementId);
        toast({ title: "Spec generated", duration: 2000 });
      }
    } catch (err) {
      toast({ title: "Spec generation failed", variant: "destructive" });
    } finally {
      setReqSpecGenerating(false);
    }
  };

  const handleRunQC = async (candidateId: number) => {
    setReqQcRunning(candidateId);
    try {
      const res = await fetch(`/api/qc/${candidateId}/evaluate`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        if (activeRequirementId) await loadRequirementDetail(activeRequirementId);
        toast({
          title: data.passed ? "QC Passed" : "QC Failed",
          description: `Score: ${(data.score * 100).toFixed(0)}%`,
          duration: 2000,
        });
      }
    } catch (err) {
      toast({ title: "QC failed", variant: "destructive" });
    } finally {
      setReqQcRunning(null);
    }
  };

  const handleGeneratePrompt = async (requirementId: number) => {
    setReqPromptGenerating(true);
    try {
      const res = await fetch(`/api/requirements/${requirementId}/prompts/generate`, { method: "POST" });
      if (res.ok) {
        toast({ title: "Prompt pack generated", duration: 2000 });
      }
    } catch (err) {
      toast({ title: "Prompt generation failed", variant: "destructive" });
    } finally {
      setReqPromptGenerating(false);
    }
  };

  const handleSaveCandidate = async (requirementId: number, candidateId: number) => {
    setReqSaving(candidateId);
    try {
      const res = await fetch(`/api/requirements/${requirementId}/save-candidate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId }),
      });
      if (res.ok) {
        await loadRequirementDetail(requirementId);
        if (activeEntityId) await loadEntityDetail(activeEntityId);
        toast({ title: "Image saved as asset", description: "Requirement marked COMPLETE", duration: 2000 });
      }
    } catch (err) {
      toast({ title: "Save failed", variant: "destructive" });
    } finally {
      setReqSaving(null);
    }
  };

  const handleGenerateImage = async (requirementId: number | null) => {
    if (!requirementId) return;
    setReqImageGenerating(requirementId);
    try {
      const res = await fetch(`/api/requirements/${requirementId}/image/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(errData.error ?? "Image generation failed");
      }
      await loadRequirementDetail(requirementId);
      toast({ title: "Image generated", description: "New candidate added from AI generation", duration: 2500 });
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : "Image generation failed", variant: "destructive" });
    } finally {
      setReqImageGenerating(null);
    }
  };

  const { data: savedImages = [] } = useQuery<SavedImage[]>({
    queryKey: ["/api/saved-images"],
    queryFn: async () => {
      const res = await fetch("/api/saved-images");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const { data: workQueue = [] } = useQuery<WorkQueueItem[]>({
    queryKey: ["/api/work/queue"],
    queryFn: async () => {
      const res = await fetch("/api/work/queue");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    refetchInterval: 30000,
  });

  const saveMutation = useMutation({
    mutationFn: async (image: { url: string; title: string; source: string; query: string }) => {
      const res = await fetch("/api/saved-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(image),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/saved-images"] }); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/saved-images/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/saved-images"] }); },
  });

  const handleSearch = async () => {
    if (!selectedText) return;
    setSearchQuery(selectedText);
    setIsSearching(true);
    setSearchError(null);
    setSearchResults([]);
    setBrokenImages(new Set());

    if (editor && selectionRange) {
      const startCoords = editor.view.coordsAtPos(selectionRange.from);
      const endCoords = editor.view.coordsAtPos(selectionRange.to);
      const midX = (startCoords.left + endCoords.right) / 2;
      const panelHeight = 360;
      const panelWidth = 400;
      let top = startCoords.top - panelHeight - 10;
      if (top < 10) top = endCoords.bottom + 10;
      let left = midX - panelWidth / 2;
      left = Math.max(10, Math.min(left, window.innerWidth - panelWidth - 10));
      setFloatingSearchPos({ top, left });
    }

    try {
      const [aiRes, museumRes] = await Promise.allSettled([
        fetch("/api/search-images", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: selectedText }),
        }).then(r => r.ok ? r.json() : { results: [] }),
        fetch("/api/search-museums", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: selectedText }),
        }).then(r => r.ok ? r.json() : { results: [] }),
      ]);

      const aiResults = aiRes.status === "fulfilled" ? (aiRes.value.results || []) : [];
      const museumResults = museumRes.status === "fulfilled" ? (museumRes.value.results || []) : [];
      const seen = new Set<string>();
      const combined: ImageResult[] = [];
      for (const img of [...museumResults, ...aiResults]) {
        if (!seen.has(img.url)) { seen.add(img.url); combined.push(img); }
      }
      setSearchResults(combined);
      if (combined.length === 0) setSearchError("No images found. Try selecting different text.");
    } catch (err: any) {
      setSearchError(err.message || "Search failed.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleApproveImage = (image: ImageResult) => {
    if (!editor || !selectionRange) {
      toast({ title: "No text selected", duration: 2000 });
      return;
    }
    editor.chain().focus()
      .setTextSelection(selectionRange)
      .setImageAnnotation({ url: image.url, title: image.title, source: image.source, query: searchQuery })
      .run();
    editor.chain().focus()
      .setTextSelection({ from: selectionRange.from, to: selectionRange.from })
      .insertInlineImage({ src: image.url, title: image.title, source: image.source, query: searchQuery })
      .run();
    if (!savedImages.some(img => img.url === image.url)) {
      saveMutation.mutate({ url: image.url, title: image.title, source: image.source, query: searchQuery });
    }
    toast({ title: "Image anchored & saved", duration: 2000 });
    setFloatingSearchPos(null);
    setSearchResults([]);
    setSearchQuery("");
  };

  const dismissFloatingSearch = () => {
    setFloatingSearchPos(null);
    setSearchResults([]);
    setSearchQuery("");
    setIsSearching(false);
    setSearchError(null);
  };

  const handleIngestUrl = async () => {
    if (!ingestUrl.trim()) return;
    setIsIngesting(true);
    setIngestResult(null);
    try {
      const res = await fetch("/api/ingest/url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: ingestUrl.trim(), title: ingestTitle.trim() || undefined }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(errData.error ?? "URL ingestion failed");
      }
      const data: IngestResult = await res.json();
      setIngestResult(data);
      queryClient.invalidateQueries({ queryKey: ["/api/work/queue"] });
      toast({ title: `${data.entities.length} entities extracted from URL`, description: `${data.chunkCount} chunks processed`, duration: 3000 });
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : "URL ingestion failed", variant: "destructive" });
    } finally {
      setIsIngesting(false);
    }
  };

  const handleIngest = async () => {
    if (!ingestTitle.trim() || !ingestText.trim()) return;
    setIsIngesting(true);
    setIngestResult(null);
    try {
      const res = await fetch("/api/ingest/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: ingestTitle, text: ingestText }),
      });
      if (!res.ok) throw new Error("Ingestion failed");
      const data: IngestResult = await res.json();
      setIngestResult(data);

      if (editor && data.entities.length > 0) {
        const escaped = ingestText
          .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
          .replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br/>");
        editor.commands.setContent(`<p>${escaped}</p>`);
        for (const entity of data.entities) {
          if (entity.offsetStart != null && entity.offsetEnd != null) {
            const docSize = editor.state.doc.content.size;
            const from = Math.min(entity.offsetStart + 1, docSize - 1);
            const to = Math.min(entity.offsetEnd + 1, docSize - 1);
            if (from < to && from > 0) {
              try {
                editor.chain().focus()
                  .setTextSelection({ from, to })
                  .setEntityMark({ entityId: entity.id, label: entity.label, entityType: entity.entityType })
                  .run();
              } catch (e) { }
            }
          }
        }
        editor.commands.setTextSelection({ from: 0, to: 0 });
      }

      queryClient.invalidateQueries({ queryKey: ["/api/work/queue"] });
      toast({
        title: `${data.entities.length} entities extracted`,
        description: `${data.chunkCount} chunks, visual requirements created`,
        duration: 3000,
      });
    } catch (err) {
      toast({ title: "Ingestion failed", variant: "destructive" });
    } finally {
      setIsIngesting(false);
    }
  };

  const handleAutoSearch = async () => {
    if (!ingestResult) return;
    setAutoSearchingEntities(true);
    const ents = ingestResult.entities.slice(0, 5);
    setAutoSearchProgress({ current: 0, total: ents.length });
    for (let i = 0; i < ents.length; i++) {
      const entity = ents[i];
      setAutoSearchProgress({ current: i + 1, total: ents.length });
      const query = entity.searchQueries?.[0] || entity.label;
      try {
        await fetch("/api/assets/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, entityId: entity.id }),
        });
      } catch (err) { }
    }
    setAutoSearchingEntities(false);
    toast({ title: "Auto-sourcing complete", description: `Searched for ${ents.length} entities.` });
  };

  const handleEntitySearch = async () => {
    if (!entitySearchQuery.trim() || !activeEntityId) return;
    setEntitySearching(true);
    try {
      const res = await fetch("/api/assets/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: entitySearchQuery, entityId: activeEntityId }),
      });
      if (res.ok) {
        const data = await res.json();
        await loadEntityDetail(activeEntityId);
        toast({ title: `Found ${data.count} images`, duration: 2000 });
      }
    } catch (err) {
      toast({ title: "Search failed", variant: "destructive" });
    } finally {
      setEntitySearching(false);
    }
  };

  const handleApproveAsset = async (linkId: number) => {
    try {
      await fetch(`/api/entity-assets/${linkId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: true }),
      });
      if (activeEntityId) await loadEntityDetail(activeEntityId);
    } catch (err) { }
  };

  const isImageSaved = (url: string) => savedImages.some(img => img.url === url);
  const damQueries = Array.from(new Set(savedImages.map(img => img.query).filter(Boolean))) as string[];
  const filteredImages = damFilter ? savedImages.filter(img => img.query === damFilter) : savedImages;

  const totalPending = workQueue.reduce((s, i) => s + i.missing + i.qcFailed, 0);

  return (
    <div className="relative w-screen h-screen bg-background text-foreground flex overflow-hidden">
      <style>{`
        .entity-mark { cursor: pointer; border-bottom: 2px solid; padding-bottom: 1px; transition: all 0.2s; }
        .entity-mark:hover { filter: brightness(1.3); }
        .entity-artifact { border-color: #f59e0b; background: rgba(245,158,11,0.1); }
        .entity-place { border-color: #3b82f6; background: rgba(59,130,246,0.1); }
        .entity-person { border-color: #a855f7; background: rgba(168,85,247,0.1); }
        .entity-deity { border-color: #ef4444; background: rgba(239,68,68,0.1); }
        .entity-concept { border-color: #22c55e; background: rgba(34,197,94,0.1); }
        .entity-material { border-color: #f97316; background: rgba(249,115,22,0.1); }
        .entity-technique { border-color: #06b6d4; background: rgba(6,182,212,0.1); }
        .entity-period { border-color: #eab308; background: rgba(234,179,8,0.1); }
        .entity-culture { border-color: #ec4899; background: rgba(236,72,153,0.1); }
      `}</style>

      {/* Main editor area - takes full width or shrinks for drawer */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${drawerOpen ? 'mr-[480px]' : ''}`}>

        {/* Minimal floating toolbar */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button data-testid="button-back" variant="ghost" size="icon" onClick={() => setLocation("/")} className="rounded-full h-8 w-8">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="relative">
              <button
                data-testid="button-doc-picker"
                onClick={() => setDocPickerOpen(!docPickerOpen)}
                className="flex items-center gap-1.5 hover:bg-muted/50 rounded-lg px-2 py-1 transition-colors"
              >
                <BookOpen className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium max-w-[200px] truncate">{currentDoc?.title}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${docPickerOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {docPickerOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute top-full left-0 mt-1 w-[340px] bg-popover border border-border rounded-xl shadow-xl z-50 overflow-hidden"
                  >
                    {DOCUMENTS.map((doc, idx) => (
                      <button
                        key={doc.id}
                        data-testid={`doc-option-${doc.id}`}
                        onClick={() => switchDocument(idx)}
                        className={`w-full text-left px-4 py-2.5 flex items-start gap-3 hover:bg-muted/50 transition-colors border-b border-border last:border-0 ${idx === currentDocIndex ? 'bg-primary/5' : ''}`}
                      >
                        <FileText className={`w-4 h-4 mt-0.5 flex-shrink-0 ${idx === currentDocIndex ? 'text-primary' : 'text-muted-foreground'}`} />
                        <div>
                          <p className={`text-sm font-medium ${idx === currentDocIndex ? 'text-primary' : 'text-foreground'}`}>{doc.title}</p>
                          <p className="text-xs text-muted-foreground">{doc.subtitle}</p>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {editor && (
              <div className="hidden md:flex items-center gap-0.5 bg-muted/50 p-0.5 rounded-lg mr-1">
                <Button data-testid="button-undo" variant="ghost" size="icon" className="h-7 w-7 rounded" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
                  <Undo className="w-3.5 h-3.5" />
                </Button>
                <Button data-testid="button-redo" variant="ghost" size="icon" className="h-7 w-7 rounded" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
                  <Redo className="w-3.5 h-3.5" />
                </Button>
                <div className="w-px h-4 bg-border mx-0.5" />
                <Button data-testid="button-bold" variant={editor.isActive("bold") ? "secondary" : "ghost"} size="icon" className="h-7 w-7 rounded" onClick={() => editor.chain().focus().toggleBold().run()}>
                  <Bold className="w-3.5 h-3.5" />
                </Button>
                <Button data-testid="button-italic" variant={editor.isActive("italic") ? "secondary" : "ghost"} size="icon" className="h-7 w-7 rounded" onClick={() => editor.chain().focus().toggleItalic().run()}>
                  <Italic className="w-3.5 h-3.5" />
                </Button>
                <Button data-testid="button-highlight" variant={editor.isActive("highlight") ? "secondary" : "ghost"} size="icon" className="h-7 w-7 rounded" onClick={() => editor.chain().focus().toggleHighlight().run()}>
                  <Highlighter className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}

            <Button
              data-testid="button-ingest-toggle"
              variant={drawerMode === "ingest" && drawerOpen ? "default" : "ghost"}
              size="sm"
              className="rounded-lg gap-1.5 h-8 text-xs"
              onClick={() => {
                if (drawerMode === "ingest" && drawerOpen) { setDrawerOpen(false); }
                else { setDrawerMode("ingest"); setDrawerOpen(true); setDrawerPinned(true); }
              }}
            >
              <Upload className="w-3.5 h-3.5" />
              Ingest
            </Button>

            <Button
              data-testid="button-dam-toggle"
              variant={drawerMode === "dam" && drawerOpen ? "default" : "ghost"}
              size="sm"
              className="rounded-lg gap-1.5 h-8 text-xs"
              onClick={() => {
                if (drawerMode === "dam" && drawerOpen) { setDrawerOpen(false); }
                else { setDrawerMode("dam"); setDrawerOpen(true); setDrawerPinned(true); }
              }}
            >
              <Grid3x3 className="w-3.5 h-3.5" />
              DAM
            </Button>

            <Button
              data-testid="button-workqueue-toggle"
              variant={drawerMode === "workqueue" && drawerOpen ? "default" : "ghost"}
              size="sm"
              className="rounded-lg gap-1.5 h-8 text-xs relative"
              onClick={() => {
                if (drawerMode === "workqueue" && drawerOpen) { setDrawerOpen(false); }
                else { setDrawerMode("workqueue"); setDrawerOpen(true); setDrawerPinned(true); }
              }}
            >
              <ListTodo className="w-3.5 h-3.5" />
              Queue
              {totalPending > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {totalPending > 9 ? "9+" : totalPending}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Editor content */}
        <ScrollArea className="flex-1">
          <div className="max-w-4xl mx-auto py-10 px-8" ref={editorContainerRef}>
            {editor && (
              <BubbleMenu
                editor={editor}
                shouldShow={({ editor }) => {
                  const { from, to } = editor.state.selection;
                  return from !== to;
                }}
              >
                <div className="bg-popover border border-border shadow-xl rounded-xl p-1.5 flex items-center gap-1 backdrop-blur-md">
                  <Button data-testid="bubble-bold" variant={editor.isActive("bold") ? "secondary" : "ghost"} size="icon" className="h-7 w-7 rounded" onClick={() => editor.chain().focus().toggleBold().run()}>
                    <Bold className="w-3.5 h-3.5" />
                  </Button>
                  <Button data-testid="bubble-italic" variant={editor.isActive("italic") ? "secondary" : "ghost"} size="icon" className="h-7 w-7 rounded" onClick={() => editor.chain().focus().toggleItalic().run()}>
                    <Italic className="w-3.5 h-3.5" />
                  </Button>
                  <Button data-testid="bubble-highlight" variant={editor.isActive("highlight") ? "secondary" : "ghost"} size="icon" className="h-7 w-7 rounded" onClick={() => editor.chain().focus().toggleHighlight().run()}>
                    <Highlighter className="w-3.5 h-3.5" />
                  </Button>
                  <div className="w-px h-5 bg-border mx-0.5" />
                  <Button
                    data-testid="bubble-find-images"
                    size="sm"
                    className="rounded-lg h-7 px-3 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5"
                    onClick={handleSearch}
                    disabled={isSearching || !selectedText}
                  >
                    {isSearching ? <Loader2 className="w-3 h-3 animate-spin" /> : <ImageIcon className="w-3 h-3" />}
                    Find Images
                  </Button>
                </div>
              </BubbleMenu>
            )}
            <EditorContent editor={editor} data-testid="editor-content" />
          </div>
        </ScrollArea>
      </div>

      {/* Floating Search Results Panel */}
      <AnimatePresence>
        {floatingSearchPos && (isSearching || searchResults.length > 0 || searchError) && (
          <motion.div
            data-testid="floating-search-panel"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed z-50"
            style={{ top: `${floatingSearchPos.top}px`, left: `${floatingSearchPos.left}px` }}
          >
            <div className="w-[400px] bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-3 border-b border-border bg-background/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium truncate max-w-[250px]">"{searchQuery}"</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button data-testid="floating-search-more" variant="ghost" size="icon" className="h-6 w-6 rounded" onClick={handleSearch} disabled={isSearching}>
                    <RefreshCw className={`w-3 h-3 ${isSearching ? 'animate-spin' : ''}`} />
                  </Button>
                  <Button data-testid="floating-search-close" variant="ghost" size="icon" className="h-6 w-6 rounded" onClick={dismissFloatingSearch}>
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div className="max-h-[280px] overflow-y-auto p-2">
                {isSearching && (
                  <div className="flex flex-col items-center justify-center py-8 gap-3">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">Searching museums & archives...</p>
                  </div>
                )}
                {searchError && !isSearching && (
                  <div className="flex items-center gap-2 p-3 text-sm text-muted-foreground">
                    <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                    {searchError}
                  </div>
                )}
                {!isSearching && searchResults.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {searchResults.slice(0, 8).map((img, idx) => {
                      const broken = brokenImages.has(img.url);
                      if (broken) return null;
                      const saved = isImageSaved(img.url);
                      return (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          key={img.url + idx}
                          data-testid={`floating-result-${idx}`}
                          className="group relative rounded-lg overflow-hidden border border-border bg-muted cursor-pointer hover:border-primary/60 transition-all"
                          onClick={() => handleApproveImage(img)}
                        >
                          <div className="aspect-square w-full relative overflow-hidden">
                            <img src={img.url} alt={img.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              onError={() => setBrokenImages(prev => new Set(prev).add(img.url))} loading="lazy" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="absolute bottom-0 left-0 right-0 p-2">
                                <p className="text-[10px] text-white/90 line-clamp-2 font-medium">{img.title}</p>
                                <p className="text-[9px] text-white/60">{img.source}</p>
                              </div>
                              <div className="absolute top-2 right-2">
                                {saved ? <div className="bg-green-500/90 rounded-full p-1"><Check className="w-3 h-3 text-white" /></div>
                                  : <div className="bg-primary/90 rounded-full p-1"><CheckCircle2 className="w-3 h-3 text-white" /></div>}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
              {!isSearching && searchResults.length > 0 && (
                <div className="p-2 border-t border-border bg-background/50 text-center">
                  <p className="text-[10px] text-muted-foreground">Click to anchor image above selected text</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Annotation tooltip */}
      <AnimatePresence>
        {hoveredAnnotation && (
          <motion.div
            data-testid="annotation-tooltip"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="fixed z-[60] pointer-events-none"
            style={{
              top: `${Math.max(10, hoveredAnnotation.rect.top - 220 < 10 ? hoveredAnnotation.rect.bottom + 10 : hoveredAnnotation.rect.top - 220)}px`,
              left: `${Math.max(10, Math.min(hoveredAnnotation.rect.left + hoveredAnnotation.rect.width / 2 - 120, window.innerWidth - 260))}px`,
            }}
          >
            <div className="w-[240px] bg-card border border-primary/30 rounded-xl shadow-2xl overflow-hidden">
              <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
                <img src={hoveredAnnotation.url} alt={hoveredAnnotation.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-2 bg-card">
                <p className="text-xs font-medium text-foreground line-clamp-2">{hoveredAnnotation.title}</p>
                <p className="text-[10px] text-muted-foreground">{hoveredAnnotation.source}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            initial={{ opacity: 0, x: 480 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 480 }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="fixed top-0 right-0 w-[480px] h-full bg-card border-l border-border shadow-2xl z-40 flex flex-col"
            data-testid="right-drawer"
          >
            {/* Drawer Tab Bar */}
            <div className="flex border-b border-border bg-background/50 shrink-0">
              <button
                data-testid="drawer-tab-entity"
                onClick={() => setDrawerMode("entity")}
                className={`flex-1 px-3 py-2.5 text-xs font-medium flex items-center justify-center gap-1.5 border-b-2 transition-colors ${drawerMode === "entity" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                <Tag className="w-3.5 h-3.5" /> Entity
              </button>
              <button
                data-testid="drawer-tab-ingest"
                onClick={() => setDrawerMode("ingest")}
                className={`flex-1 px-3 py-2.5 text-xs font-medium flex items-center justify-center gap-1.5 border-b-2 transition-colors ${drawerMode === "ingest" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                <Upload className="w-3.5 h-3.5" /> Ingest
              </button>
              <button
                data-testid="drawer-tab-dam"
                onClick={() => setDrawerMode("dam")}
                className={`flex-1 px-3 py-2.5 text-xs font-medium flex items-center justify-center gap-1.5 border-b-2 transition-colors ${drawerMode === "dam" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                <Grid3x3 className="w-3.5 h-3.5" /> DAM
              </button>
              <button
                data-testid="drawer-tab-workqueue"
                onClick={() => setDrawerMode("workqueue")}
                className={`flex-1 px-3 py-2.5 text-xs font-medium flex items-center justify-center gap-1.5 border-b-2 transition-colors relative ${drawerMode === "workqueue" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                <ListTodo className="w-3.5 h-3.5" /> Queue
                {totalPending > 0 && <span className="ml-0.5 bg-red-500 text-white text-[8px] font-bold rounded-full px-1">{totalPending}</span>}
              </button>
              <button
                data-testid="drawer-close"
                onClick={() => { setDrawerOpen(false); setDrawerPinned(false); }}
                className="px-3 py-2.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ENTITY TAB */}
            {drawerMode === "entity" && (
              <ScrollArea className="flex-1">
                {entityLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : entityDetail ? (
                  <div className="flex flex-col">
                    {/* Entity header */}
                    <div className="p-4 border-b border-border">
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border flex-shrink-0 ${ENTITY_TYPE_COLORS[entityDetail.entity.entityType] || ENTITY_TYPE_COLORS.concept}`}>
                          {(() => { const Icon = ENTITY_TYPE_ICONS[entityDetail.entity.entityType] || Tag; return <Icon className="w-5 h-5" />; })()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h2 data-testid="entity-label" className="text-lg font-serif font-bold text-foreground">{entityDetail.entity.label}</h2>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className={`text-[10px] font-medium uppercase px-2 py-0.5 rounded-full border ${ENTITY_TYPE_COLORS[entityDetail.entity.entityType] || ENTITY_TYPE_COLORS.concept}`}>
                              {entityDetail.entity.entityType}
                            </span>
                            {entityDetail.entity.period && <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {entityDetail.entity.period}</span>}
                            {entityDetail.entity.region && <span className="text-[10px] text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> {entityDetail.entity.region}</span>}
                          </div>
                        </div>
                      </div>
                      {entityDetail.entity.description && (
                        <p data-testid="entity-description" className="text-sm text-muted-foreground leading-relaxed">{entityDetail.entity.description}</p>
                      )}
                      {entityDetail.entity.magicTags && entityDetail.entity.magicTags.length > 0 && (
                        <div className="flex gap-1.5 mt-3 flex-wrap">
                          {entityDetail.entity.magicTags.map(tag => (
                            <span key={tag} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Visual Requirements */}
                    {entityDetail.requirements && entityDetail.requirements.length > 0 && (
                      <div className="p-4 border-b border-border">
                        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Layers className="w-3.5 h-3.5" /> Visual Requirements ({entityDetail.requirements.length})
                        </h3>
                        <div className="space-y-2">
                          {entityDetail.requirements.map(req => (
                            <div
                              key={req.id}
                              data-testid={`requirement-${req.id}`}
                              className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${activeRequirementId === req.id ? 'border-primary/50 bg-primary/5' : 'border-border bg-background/50'}`}
                              onClick={() => loadRequirementDetail(req.id)}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-foreground">{req.kind === "SOURCE_PLUS_OVERLAY" ? "Source + Overlay" : "Source Only"}</span>
                                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${REQ_STATUS_COLORS[req.status] || REQ_STATUS_COLORS.MISSING}`}>
                                  {req.status}
                                </span>
                              </div>
                              {req.qcFailCount > 0 && (
                                <p className="text-[10px] text-red-400 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" /> {req.qcFailCount} QC failures
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Requirement Detail Panel */}
                    {requirementDetail && activeRequirementId && entityDetail.requirements.some(r => r.id === activeRequirementId) && (
                      <div className="p-4 border-b border-border bg-muted/20">
                        <div className="flex items-center gap-2 mb-3">
                          <h3 className="text-xs font-medium text-foreground uppercase tracking-wider flex-1">Requirement Actions</h3>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                          <Button
                            data-testid="btn-run-search"
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs gap-1.5"
                            onClick={() => handleRunSearch(activeRequirementId)}
                            disabled={reqSearching}
                          >
                            {reqSearching ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
                            Search
                          </Button>
                          <Button
                            data-testid="btn-gen-spec"
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs gap-1.5"
                            onClick={() => handleGenerateSpec(activeRequirementId)}
                            disabled={reqSpecGenerating}
                          >
                            {reqSpecGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Cpu className="w-3 h-3" />}
                            Gen Spec
                          </Button>
                          <Button
                            data-testid="btn-gen-prompt"
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs gap-1.5"
                            onClick={() => handleGeneratePrompt(activeRequirementId)}
                            disabled={reqPromptGenerating}
                          >
                            {reqPromptGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                            Prompt Pack
                          </Button>
                          <Button
                            data-testid="btn-gen-image"
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs gap-1.5"
                            onClick={() => handleGenerateImage(activeRequirementId)}
                            disabled={reqImageGenerating === activeRequirementId}
                            title="Generate an AI image for this requirement"
                          >
                            {reqImageGenerating === activeRequirementId ? <Loader2 className="w-3 h-3 animate-spin" /> : <ImagePlus className="w-3 h-3" />}
                            Gen Image
                          </Button>
                        </div>

                        {requirementDetail.requirement.imageSpec && (
                          <div className="mb-3 p-2 bg-background/50 rounded-lg border border-border">
                            <p className="text-[10px] font-medium text-muted-foreground mb-1 uppercase tracking-wider">Image Spec</p>
                            <p className="text-xs text-foreground line-clamp-3">{JSON.stringify(requirementDetail.requirement.imageSpec).slice(0, 200)}...</p>
                          </div>
                        )}

                        {requirementDetail.candidates.length > 0 && (
                          <div>
                            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Candidates ({requirementDetail.candidates.length})</h4>
                            <div className="grid grid-cols-2 gap-2">
                              {requirementDetail.candidates.slice(0, 8).map(candidate => (
                                <div
                                  key={candidate.id}
                                  data-testid={`candidate-${candidate.id}`}
                                  className="group relative rounded-lg border border-border overflow-hidden bg-muted"
                                >
                                  <div className="aspect-square w-full relative overflow-hidden">
                                    <img
                                      src={candidate.thumbnailUrl || candidate.url}
                                      alt={candidate.title || "Candidate"}
                                      className="w-full h-full object-cover"
                                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                      loading="lazy"
                                    />
                                    <div className="absolute top-1 left-1">
                                      <span className={`text-[8px] font-medium px-1.5 py-0.5 rounded-full ${QC_STATUS_COLORS[candidate.qcStatus] || QC_STATUS_COLORS.pending}`}>
                                        {candidate.qcStatus}
                                        {candidate.qcScore != null ? ` ${(candidate.qcScore * 100).toFixed(0)}%` : ""}
                                      </span>
                                    </div>
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                                      {candidate.qcStatus === "pending" && (
                                        <Button
                                          data-testid={`btn-qc-${candidate.id}`}
                                          size="sm"
                                          className="h-6 text-[10px] w-full gap-1"
                                          onClick={() => handleRunQC(candidate.id)}
                                          disabled={reqQcRunning === candidate.id}
                                        >
                                          {reqQcRunning === candidate.id ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Eye className="w-2.5 h-2.5" />}
                                          QC
                                        </Button>
                                      )}
                                      {candidate.qcStatus === "passed" && (
                                        <Button
                                          data-testid={`btn-save-${candidate.id}`}
                                          size="sm"
                                          className="h-6 text-[10px] w-full gap-1 bg-green-600 hover:bg-green-700"
                                          onClick={() => handleSaveCandidate(activeRequirementId, candidate.id)}
                                          disabled={reqSaving === candidate.id}
                                        >
                                          {reqSaving === candidate.id ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Star className="w-2.5 h-2.5" />}
                                          Save
                                        </Button>
                                      )}
                                      {candidate.objectUrl && (
                                        <a href={candidate.objectUrl} target="_blank" rel="noopener noreferrer"
                                          className="flex items-center justify-center gap-1 bg-white/20 text-white text-[10px] rounded px-2 py-1 w-full hover:bg-white/30">
                                          <ExternalLink className="w-2.5 h-2.5" /> View
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                  <div className="p-1.5">
                                    <p className="text-[10px] text-foreground line-clamp-1">{candidate.title || "Untitled"}</p>
                                    <p className="text-[9px] text-muted-foreground">{candidate.provider || candidate.source || "Unknown"}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Entity search */}
                    <div className="p-4 border-b border-border">
                      <div className="flex items-center gap-2">
                        <Input
                          data-testid="entity-search-input"
                          placeholder={`Search images for "${entityDetail.entity.label}"...`}
                          value={entitySearchQuery}
                          onChange={e => setEntitySearchQuery(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && handleEntitySearch()}
                          className="flex-1 h-9 text-sm"
                        />
                        <Button
                          data-testid="entity-search-btn"
                          size="sm"
                          onClick={handleEntitySearch}
                          disabled={entitySearching || !entitySearchQuery.trim()}
                          className="gap-1.5 h-9"
                        >
                          {entitySearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                          Search
                        </Button>
                      </div>
                    </div>

                    {/* Saved assets grid */}
                    <div className="p-4">
                      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                        Saved Assets ({entityDetail.assets.filter(a => a.approved).length})
                      </h3>
                      {entityDetail.assets.length === 0 ? (
                        <div className="text-center py-8">
                          <ImageIcon className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">No images linked yet</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          {entityDetail.assets.map(asset => (
                            <div key={asset.id} data-testid={`entity-asset-${asset.id}`}
                              className={`group relative rounded-xl border overflow-hidden bg-card shadow-sm transition-all hover:shadow-md ${asset.approved ? "border-green-500/30" : "border-border hover:border-primary/40"}`}>
                              <div className="aspect-square w-full relative overflow-hidden bg-muted">
                                <img src={asset.url} alt={asset.title || "Asset"} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} loading="lazy" />
                                <div className="absolute top-2 left-2">
                                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full backdrop-blur-md ${asset.sourceType === "museum" ? "bg-blue-500/80 text-white" : "bg-purple-500/80 text-white"}`}>
                                    {asset.sourceType === "museum" ? "Museum" : "Web"}
                                  </span>
                                </div>
                                {asset.approved && <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1"><Check className="w-3 h-3 text-white" /></div>}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                  <div className="absolute bottom-2 left-2 right-2 flex gap-1">
                                    {!asset.approved && (
                                      <button data-testid={`approve-asset-${asset.linkId}`} onClick={() => handleApproveAsset(asset.linkId)}
                                        className="flex-1 flex items-center justify-center gap-1 bg-green-500/80 backdrop-blur-sm text-white text-[10px] rounded-md py-1 hover:bg-green-600 transition-colors">
                                        <ThumbsUp className="w-3 h-3" /> Approve
                                      </button>
                                    )}
                                    {asset.objectUrl && (
                                      <a href={asset.objectUrl} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center justify-center bg-white/20 backdrop-blur-sm text-white rounded-md px-2 py-1 hover:bg-white/30 transition-colors">
                                        <ExternalLink className="w-3 h-3" />
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="p-2">
                                <p className="text-[11px] font-medium text-foreground line-clamp-2 leading-tight">{asset.title || "Untitled"}</p>
                                <p className="text-[10px] text-muted-foreground mt-0.5">{asset.source || "Unknown"}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20 px-6">
                    <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Tag className="w-10 h-10 text-muted-foreground opacity-40" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">No entity selected</h3>
                    <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                      Hover over a highlighted entity in the text to preview it, or click to pin this drawer.
                    </p>
                  </div>
                )}
              </ScrollArea>
            )}

            {/* INGEST TAB */}
            {drawerMode === "ingest" && (
              <ScrollArea className="flex-1">
                <div className="p-4 flex flex-col gap-4">
                  <div>
                    <h2 className="text-sm font-semibold text-foreground mb-1">Text Ingestion</h2>
                    <p className="text-[11px] text-muted-foreground">Paste text or a URL to auto-extract entities and create visual requirements.</p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Title <span className="text-muted-foreground/60">(optional for URL)</span></label>
                    <Input
                      data-testid="ingest-title"
                      placeholder="e.g. Cylinder Seals of the Akkadian Period"
                      value={ingestTitle}
                      onChange={e => setIngestTitle(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">URL <span className="text-muted-foreground/60">(ingest from web page)</span></label>
                    <div className="flex gap-2">
                      <Input
                        data-testid="ingest-url"
                        placeholder="https://example.com/article"
                        value={ingestUrl}
                        onChange={e => setIngestUrl(e.target.value)}
                        className="h-9 text-sm flex-1"
                        type="url"
                      />
                      <Button
                        data-testid="ingest-url-submit"
                        onClick={handleIngestUrl}
                        disabled={isIngesting || !ingestUrl.trim()}
                        variant="outline"
                        className="gap-1.5 h-9 shrink-0"
                      >
                        {isIngesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                        Fetch
                      </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">Public URLs only. Internal/private networks are blocked.</p>
                  </div>

                  <div className="flex items-center gap-2 my-1">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">or paste text</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Text</label>
                    <Textarea
                      data-testid="ingest-text"
                      placeholder="Paste your research text here..."
                      value={ingestText}
                      onChange={e => setIngestText(e.target.value)}
                      className="min-h-[180px] text-sm resize-none"
                    />
                  </div>

                  <Button
                    data-testid="ingest-submit"
                    onClick={handleIngest}
                    disabled={isIngesting || !ingestTitle.trim() || !ingestText.trim()}
                    className="gap-2"
                  >
                    {isIngesting ? <><Loader2 className="w-4 h-4 animate-spin" />Extracting entities...</> : <><Sparkles className="w-4 h-4" />Extract & Create Requirements</>}
                  </Button>

                  {ingestResult && (
                    <div className="space-y-3">
                      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                        <p className="text-sm font-medium text-green-400">
                          {ingestResult.entities.length} entities extracted, visual requirements created
                        </p>
                        <p className="text-xs text-green-400/70">{ingestResult.chunkCount} text chunks processed</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Detected Entities</h3>
                        <Button data-testid="auto-search-btn" size="sm" variant="outline" onClick={handleAutoSearch} disabled={autoSearchingEntities} className="gap-1.5 h-7 text-xs">
                          {autoSearchingEntities ? <><Loader2 className="w-3 h-3 animate-spin" />{autoSearchProgress.current}/{autoSearchProgress.total}</> : <><Search className="w-3 h-3" />Auto-Source</>}
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {ingestResult.entities.map(entity => {
                          const Icon = ENTITY_TYPE_ICONS[entity.entityType] || Tag;
                          return (
                            <button key={entity.id} data-testid={`ingest-entity-${entity.id}`} onClick={() => { setDrawerMode("entity"); openEntityDrawer(entity.id); }}
                              className="w-full text-left p-3 rounded-lg border border-border hover:border-primary/40 bg-card transition-all hover:shadow-sm">
                              <div className="flex items-start gap-2.5">
                                <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 border ${ENTITY_TYPE_COLORS[entity.entityType] || ENTITY_TYPE_COLORS.concept}`}>
                                  <Icon className="w-3.5 h-3.5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-foreground">{entity.label}</span>
                                    <ChevronRight className="w-3 h-3 text-muted-foreground" />
                                  </div>
                                  {entity.description && <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{entity.description}</p>}
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-[9px] font-medium uppercase px-1.5 py-0.5 rounded-full border ${ENTITY_TYPE_COLORS[entity.entityType] || ENTITY_TYPE_COLORS.concept}`}>{entity.entityType}</span>
                                    {entity.period && <span className="text-[9px] text-muted-foreground">{entity.period}</span>}
                                  </div>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}

            {/* DAM TAB */}
            {drawerMode === "dam" && (
              <>
                <div className="p-4 border-b border-border bg-background/50 shrink-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Grid3x3 className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-foreground">Digital Asset Manager</h2>
                      <p className="text-[10px] text-muted-foreground">{savedImages.length} assets curated</p>
                    </div>
                  </div>
                  {damQueries.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap">
                      <Button data-testid="dam-filter-all" variant={damFilter === null ? "secondary" : "ghost"} size="sm"
                        className="h-6 px-2.5 text-[10px] rounded-full" onClick={() => setDamFilter(null)}>
                        All ({savedImages.length})
                      </Button>
                      {damQueries.map((q, qi) => {
                        const count = savedImages.filter(img => img.query === q).length;
                        const slug = q.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                        return (
                          <Button key={q} data-testid={`dam-filter-${slug || qi}`} variant={damFilter === q ? "secondary" : "ghost"} size="sm"
                            className="h-6 px-2.5 text-[10px] rounded-full max-w-[120px] truncate" onClick={() => setDamFilter(damFilter === q ? null : q)}>
                            {q} ({count})
                          </Button>
                        );
                      })}
                    </div>
                  )}
                </div>
                <ScrollArea className="flex-1 bg-background/30">
                  {filteredImages.length === 0 ? (
                    <div className="text-center py-20 px-6">
                      <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <ImageIcon className="w-10 h-10 text-muted-foreground opacity-40" />
                      </div>
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        {damFilter ? "No assets for this query" : "Your DAM is empty"}
                      </h3>
                      <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                        Select text in the editor and click "Find Images" to start building your collection.
                      </p>
                    </div>
                  ) : (
                    <div className="p-4">
                      <div className="grid grid-cols-2 gap-3">
                        {filteredImages.map(img => (
                          <motion.div
                            key={img.id}
                            data-testid={`dam-asset-${img.id}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="group relative rounded-xl border border-border overflow-hidden bg-card hover:shadow-md transition-all hover:border-primary/40"
                          >
                            <div className="aspect-square w-full relative overflow-hidden bg-muted">
                              <img src={img.url} alt={img.title || "Image"} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} loading="lazy" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="absolute bottom-2 left-2 right-2 flex gap-1">
                                  <a href={img.url} target="_blank" rel="noopener noreferrer"
                                    className="flex-1 flex items-center justify-center gap-1 bg-white/20 backdrop-blur-sm text-white text-[10px] rounded-md py-1 hover:bg-white/30">
                                    <ExternalLink className="w-3 h-3" /> Open
                                  </a>
                                  <button onClick={() => deleteMutation.mutate(img.id)} data-testid={`delete-dam-${img.id}`}
                                    className="flex items-center justify-center bg-red-500/60 backdrop-blur-sm text-white rounded-md px-2 py-1 hover:bg-red-600/80">
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                            <div className="p-2">
                              <p className="text-[11px] font-medium text-foreground line-clamp-2 leading-tight">{img.title || "Untitled"}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">{img.source || "Unknown"}</p>
                              {img.query && (
                                <span className="inline-block mt-1 text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{img.query}</span>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </ScrollArea>
              </>
            )}

            {/* WORK QUEUE TAB */}
            {drawerMode === "workqueue" && (
              <>
                <div className="p-4 border-b border-border bg-background/50 shrink-0">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <ListTodo className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-foreground">Work Queue</h2>
                      <p className="text-[10px] text-muted-foreground">Documents with pending visual requirements</p>
                    </div>
                  </div>
                </div>
                <ScrollArea className="flex-1">
                  {workQueue.length === 0 ? (
                    <div className="text-center py-20 px-6">
                      <CheckCircle2 className="w-16 h-16 text-green-500/40 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">All clear!</h3>
                      <p className="text-muted-foreground text-sm">No documents have pending visual requirements.</p>
                    </div>
                  ) : (
                    <div className="p-4 space-y-3">
                      {workQueue.map(item => (
                        <div key={item.document.id} data-testid={`workqueue-doc-${item.document.id}`}
                          className="p-3 rounded-lg border border-border bg-background/50 hover:border-primary/30 transition-all">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground line-clamp-1">{item.document.title}</p>
                              <p className="text-[10px] text-muted-foreground">{new Date(item.document.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            {item.missing > 0 && (
                              <span data-testid={`wq-missing-${item.document.id}`}
                                className="text-[10px] px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-400 border border-gray-500/30 flex items-center gap-1">
                                <AlertCircle className="w-2.5 h-2.5" /> {item.missing} missing
                              </span>
                            )}
                            {item.qcFailed > 0 && (
                              <span data-testid={`wq-qcfailed-${item.document.id}`}
                                className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1">
                                <AlertTriangle className="w-2.5 h-2.5" /> {item.qcFailed} QC failed
                              </span>
                            )}
                            {item.readyToSave > 0 && (
                              <span data-testid={`wq-ready-${item.document.id}`}
                                className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 flex items-center gap-1">
                                <Star className="w-2.5 h-2.5" /> {item.readyToSave} ready
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
