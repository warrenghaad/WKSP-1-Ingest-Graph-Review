import { useState, useRef, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Save, Plus, Trash2, Loader2, ArrowLeft, Wand2, FileText, Eye, Search, FolderOpen, ChevronRight, Download, Cloud } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Link } from "wouter";

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  bodyMd: string;
  status: string;
  tags: string[] | null;
  createdAt: string;
  updatedAt: string;
}

const LESSON_STATUSES = ["draft", "researched", "image_ready", "published"] as const;
type LessonStatus = (typeof LESSON_STATUSES)[number];

function slugify(s: string): string {
  return s.toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || `lesson-${Date.now()}`;
}

export default function Builder() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ title: string; description: string; bodyMd: string; status: string }>({
    title: "", description: "", bodyMd: "", status: "draft",
  });
  const [selection, setSelection] = useState<string>("");
  const [prompt, setPrompt] = useState<string>("");
  const [provider, setProvider] = useState<"anthropic" | "perplexity">("anthropic");
  const [researching, setResearching] = useState(false);
  const [previewMode, setPreviewMode] = useState<"split" | "preview" | "edit">("split");
  const editorRef = useRef<HTMLTextAreaElement | null>(null);
  const [dirty, setDirty] = useState(false);

  const { data: lessons = [], isLoading } = useQuery<Lesson[]>({
    queryKey: ["/api/lessons"],
  });

  const { data: activeLesson } = useQuery<Lesson>({
    queryKey: ["/api/lessons", activeId],
    enabled: !!activeId,
    queryFn: async () => {
      const r = await fetch(`/api/lessons/${activeId}`);
      if (!r.ok) throw new Error("Failed to load lesson");
      return r.json();
    },
  });

  useEffect(() => {
    if (activeLesson) {
      setDraft({
        title: activeLesson.title,
        description: activeLesson.description ?? "",
        bodyMd: activeLesson.bodyMd ?? "",
        status: activeLesson.status,
      });
      setDirty(false);
    }
  }, [activeLesson?.id]);

  const createMutation = useMutation({
    mutationFn: async (newLesson: { id: string; title: string }) => {
      const res = await apiRequest("POST", "/api/lessons", {
        ...newLesson,
        description: "",
        bodyMd: "",
        status: "draft",
        tags: [],
      });
      return res.json();
    },
    onSuccess: (lesson: Lesson) => {
      qc.invalidateQueries({ queryKey: ["/api/lessons"] });
      setActiveId(lesson.id);
      toast({ title: "Lesson created", description: lesson.title });
    },
    onError: (e: any) => toast({ title: "Failed to create", description: e.message, variant: "destructive" }),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!activeId) throw new Error("No active lesson");
      const res = await apiRequest("PUT", `/api/lessons/${activeId}`, draft);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/lessons"] });
      qc.invalidateQueries({ queryKey: ["/api/lessons", activeId] });
      setDirty(false);
      toast({ title: "Saved" });
    },
    onError: (e: any) => toast({ title: "Save failed", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/lessons/${id}`);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/lessons"] });
      setActiveId(null);
      toast({ title: "Deleted" });
    },
  });

  const handleNewLesson = () => {
    const title = window.prompt("Lesson title:");
    if (!title || !title.trim()) return;
    const id = slugify(title);
    createMutation.mutate({ id, title: title.trim() });
  };

  const captureSelection = () => {
    const el = editorRef.current;
    if (!el) return "";
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    if (start === end) return "";
    return el.value.slice(start, end);
  };

  const handleSelectionChange = () => {
    setSelection(captureSelection());
  };

  const insertAtCursor = (text: string) => {
    const el = editorRef.current;
    if (!el) {
      setDraft((d) => ({ ...d, bodyMd: d.bodyMd + "\n\n" + text }));
      setDirty(true);
      return;
    }
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const before = el.value.slice(0, start);
    const after = el.value.slice(end);
    const insertion = (before.endsWith("\n\n") || before.length === 0 ? "" : "\n\n") + text + (after.startsWith("\n\n") || after.length === 0 ? "" : "\n\n");
    const newBody = before + insertion + after;
    setDraft((d) => ({ ...d, bodyMd: newBody }));
    setDirty(true);
    requestAnimationFrame(() => {
      el.focus();
      const pos = (before + insertion).length;
      el.setSelectionRange(pos, pos);
    });
  };

  const runResearch = async () => {
    if (!prompt.trim() && !selection.trim()) {
      toast({ title: "Need something to research", description: "Highlight text or type a question.", variant: "destructive" });
      return;
    }
    setResearching(true);
    try {
      const body = {
        lessonId: activeId,
        prompt: prompt.trim() || `Research and elaborate on: "${selection.trim()}"`,
        selection: selection.trim() || undefined,
        lessonTitle: draft.title || undefined,
        lessonContext: draft.bodyMd ? draft.bodyMd.slice(0, 2000) : undefined,
      };
      const res = await apiRequest("POST", `/api/research/${provider}`, body);
      const data = await res.json();
      const content = data.content || "";
      if (!content) throw new Error("Empty response");
      const header = `> _${provider === "anthropic" ? "Claude" : "Perplexity"} research — ${selection ? `on selection` : "on prompt"}_\n\n`;
      insertAtCursor(header + content);
      setPrompt("");
      toast({ title: "Inserted research", description: `${content.length} chars from ${provider}` });
    } catch (e: any) {
      toast({ title: "Research failed", description: e.message, variant: "destructive" });
    } finally {
      setResearching(false);
    }
  };

  // ----- Drive browser state -----
  const DEFAULT_DRIVE_ROOT = "1oEjgB70OrVvFmZ9gH9k5qhypHJ0MUeVV";
  const [driveRoot, setDriveRoot] = useState<string>(() => localStorage.getItem("euclid:driveRoot") || DEFAULT_DRIVE_ROOT);
  const [driveCrumbs, setDriveCrumbs] = useState<{ id: string; name: string }[]>([{ id: driveRoot, name: "root" }]);
  const [driveQuery, setDriveQuery] = useState("");
  const [driveMode, setDriveMode] = useState<"browse" | "search">("browse");
  const [driveLoading, setDriveLoading] = useState(false);
  const [driveItems, setDriveItems] = useState<any[]>([]);
  const [drivePreview, setDrivePreview] = useState<{ id: string; name: string; text: string } | null>(null);
  const [drivePreviewLoading, setDrivePreviewLoading] = useState(false);

  const currentFolderId = driveCrumbs[driveCrumbs.length - 1]?.id || driveRoot;

  const loadFolder = async (folderId: string) => {
    setDriveLoading(true);
    setDriveMode("browse");
    try {
      const res = await fetch(`/api/drive/list?folder=${encodeURIComponent(folderId)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Drive list failed");
      setDriveItems(data.files || []);
    } catch (e: any) {
      toast({ title: "Drive error", description: e.message, variant: "destructive" });
    } finally {
      setDriveLoading(false);
    }
  };

  const runDriveSearch = async () => {
    if (!driveQuery.trim()) return;
    setDriveLoading(true);
    setDriveMode("search");
    try {
      const res = await fetch(`/api/drive/search?q=${encodeURIComponent(driveQuery)}&root=${encodeURIComponent(driveRoot)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Drive search failed");
      setDriveItems(data.files || []);
    } catch (e: any) {
      toast({ title: "Drive search failed", description: e.message, variant: "destructive" });
    } finally {
      setDriveLoading(false);
    }
  };

  const openDriveItem = async (item: any) => {
    if (item.mimeType === "application/vnd.google-apps.folder") {
      setDriveCrumbs((c) => [...c, { id: item.id, name: item.name }]);
      loadFolder(item.id);
      return;
    }
    setDrivePreviewLoading(true);
    setDrivePreview({ id: item.id, name: item.name, text: "" });
    try {
      const res = await fetch(`/api/drive/file/${item.id}/text`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Download failed");
      setDrivePreview({ id: item.id, name: item.name, text: data.text || "" });
    } catch (e: any) {
      toast({ title: "Could not read file", description: e.message, variant: "destructive" });
      setDrivePreview(null);
    } finally {
      setDrivePreviewLoading(false);
    }
  };

  const insertDriveAsContext = () => {
    if (!drivePreview) return;
    const block = `> _Drive source — ${drivePreview.name}_\n\n${drivePreview.text.slice(0, 8000)}`;
    insertAtCursor(block);
    toast({ title: "Inserted from Drive", description: drivePreview.name });
  };

  const useDriveAsResearchContext = async () => {
    if (!drivePreview || !activeId) return;
    setResearching(true);
    try {
      const body = {
        lessonId: activeId,
        prompt: prompt.trim() || `Summarize, distill, and extract on-topic Mesopotamian entities (artifacts, persons, architecture, actions) from the source below. Then answer in the voice of an eTextbook lesson section.`,
        selection: drivePreview.text.slice(0, 12000),
        lessonTitle: draft.title || undefined,
        lessonContext: `Source file: ${drivePreview.name}`,
      };
      const res = await apiRequest("POST", `/api/research/${provider}`, body);
      const data = await res.json();
      const content = data.content || "";
      if (!content) throw new Error("Empty response");
      const header = `> _${provider === "anthropic" ? "Claude" : "Perplexity"} synthesis from Drive · ${drivePreview.name}_\n\n`;
      insertAtCursor(header + content);
      toast({ title: "Inserted synthesis", description: `${content.length} chars from ${provider} via Drive source` });
    } catch (e: any) {
      toast({ title: "Synthesis failed", description: e.message, variant: "destructive" });
    } finally {
      setResearching(false);
    }
  };

  useEffect(() => { loadFolder(driveRoot); /* eslint-disable-next-line */ }, [driveRoot]);
  useEffect(() => { localStorage.setItem("euclid:driveRoot", driveRoot); }, [driveRoot]);

  const sortedLessons = useMemo(
    () => [...lessons].sort((a, b) => (a.title || "").localeCompare(b.title || "")),
    [lessons]
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <header className="border-b border-zinc-800 px-4 py-3 flex items-center gap-3 bg-zinc-900/60">
        <Link href="/">
          <Button variant="ghost" size="sm" data-testid="link-home">
            <ArrowLeft className="w-4 h-4 mr-1" /> Home
          </Button>
        </Link>
        <div className="text-sm uppercase tracking-widest text-zinc-400">EUCLID · Builder</div>
        <div className="flex-1" />
        {activeId && (
          <>
            <Badge variant="outline" data-testid="badge-status">{draft.status}</Badge>
            {dirty && <Badge variant="secondary" className="bg-amber-500/20 text-amber-300">Unsaved</Badge>}
            <Button
              size="sm"
              onClick={() => saveMutation.mutate()}
              disabled={!dirty || saveMutation.isPending}
              data-testid="button-save"
            >
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
              Save
            </Button>
          </>
        )}
      </header>

      <div className="flex-1 grid grid-cols-[260px_1fr_360px] min-h-0">
        {/* Sidebar: lessons */}
        <aside className="border-r border-zinc-800 bg-zinc-900/30 flex flex-col min-h-0">
          <div className="p-3 border-b border-zinc-800 flex items-center gap-2">
            <h2 className="text-xs uppercase tracking-widest text-zinc-400 flex-1">Lessons</h2>
            <Button size="sm" variant="ghost" onClick={handleNewLesson} data-testid="button-new-lesson">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {isLoading && <div className="text-xs text-zinc-500 p-2">Loading…</div>}
              {!isLoading && sortedLessons.length === 0 && (
                <div className="text-xs text-zinc-500 p-2">
                  No lessons yet. Click <Plus className="inline w-3 h-3" /> to create one.
                </div>
              )}
              {sortedLessons.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setActiveId(l.id)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    activeId === l.id ? "bg-zinc-800 text-white" : "hover:bg-zinc-800/50 text-zinc-300"
                  }`}
                  data-testid={`lesson-${l.id}`}
                >
                  <div className="font-medium truncate">{l.title}</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5 flex items-center gap-1">
                    <span>{l.status}</span>
                    <span>·</span>
                    <span>{(l.bodyMd || "").length} chars</span>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </aside>

        {/* Editor */}
        <main className="flex flex-col min-h-0">
          {!activeId ? (
            <div className="flex-1 flex items-center justify-center text-zinc-500">
              <div className="text-center max-w-sm">
                <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">Select a lesson on the left, or create a new one to start.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="border-b border-zinc-800 p-3 space-y-2 bg-zinc-900/30">
                <Input
                  value={draft.title}
                  onChange={(e) => { setDraft({ ...draft, title: e.target.value }); setDirty(true); }}
                  placeholder="Lesson title"
                  className="text-lg font-semibold bg-transparent border-zinc-700"
                  data-testid="input-title"
                />
                <Input
                  value={draft.description}
                  onChange={(e) => { setDraft({ ...draft, description: e.target.value }); setDirty(true); }}
                  placeholder="One-line description (optional)"
                  className="text-sm bg-transparent border-zinc-700"
                  data-testid="input-description"
                />
                <div className="flex items-center gap-2">
                  <Select value={draft.status} onValueChange={(v) => { setDraft({ ...draft, status: v }); setDirty(true); }}>
                    <SelectTrigger className="w-44 h-8 text-xs" data-testid="select-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LESSON_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <div className="flex-1" />
                  <div className="inline-flex rounded-md border border-zinc-700 overflow-hidden text-xs">
                    {(["edit", "split", "preview"] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => setPreviewMode(m)}
                        className={`px-3 py-1 ${previewMode === m ? "bg-zinc-700 text-white" : "text-zinc-400 hover:bg-zinc-800"}`}
                        data-testid={`button-mode-${m}`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (confirm("Delete this lesson? This cannot be undone.")) {
                        deleteMutation.mutate(activeId);
                      }
                    }}
                    data-testid="button-delete"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </Button>
                </div>
              </div>

              <div className={`flex-1 grid min-h-0 ${
                previewMode === "split" ? "grid-cols-2" : "grid-cols-1"
              }`}>
                {(previewMode === "edit" || previewMode === "split") && (
                  <Textarea
                    ref={editorRef as any}
                    value={draft.bodyMd}
                    onChange={(e) => { setDraft({ ...draft, bodyMd: e.target.value }); setDirty(true); }}
                    onSelect={handleSelectionChange}
                    onMouseUp={handleSelectionChange}
                    onKeyUp={handleSelectionChange}
                    placeholder="Write Markdown here. Highlight text, then use the research panel on the right →"
                    className="h-full resize-none rounded-none border-0 border-r border-zinc-800 bg-zinc-950 font-mono text-sm leading-relaxed p-6"
                    data-testid="textarea-body"
                  />
                )}
                {(previewMode === "preview" || previewMode === "split") && (
                  <ScrollArea className="h-full bg-zinc-900/40">
                    <article className="prose prose-invert prose-zinc max-w-none p-6 prose-headings:font-semibold prose-a:text-amber-400">
                      {draft.bodyMd ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {draft.bodyMd}
                        </ReactMarkdown>
                      ) : (
                        <p className="text-zinc-500 italic">Preview will appear here.</p>
                      )}
                    </article>
                  </ScrollArea>
                )}
              </div>
            </>
          )}
        </main>

        {/* Right panel: Research + Drive (RWI) */}
        <aside className="border-l border-zinc-800 bg-zinc-900/30 flex flex-col min-h-0">
          {!activeId ? (
            <div className="p-4 text-xs text-zinc-500">Open a lesson to use research and your RWI Drive.</div>
          ) : (
            <Tabs defaultValue="research" className="flex-1 flex flex-col min-h-0">
              <TabsList className="grid w-full grid-cols-2 rounded-none border-b border-zinc-800 bg-zinc-900/50">
                <TabsTrigger value="research" className="text-xs" data-testid="tab-research">
                  <Sparkles className="w-3 h-3 mr-1" /> Research
                </TabsTrigger>
                <TabsTrigger value="drive" className="text-xs" data-testid="tab-drive">
                  <Cloud className="w-3 h-3 mr-1" /> RWI Drive
                </TabsTrigger>
              </TabsList>

              <TabsContent value="research" className="flex-1 min-h-0 mt-0">
                <ScrollArea className="h-full">
                  <div className="p-3 space-y-3">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-zinc-500">Provider</label>
                      <Select value={provider} onValueChange={(v: any) => setProvider(v)}>
                        <SelectTrigger className="h-8 text-xs mt-1" data-testid="select-provider">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="anthropic">Claude (Anthropic)</SelectItem>
                          <SelectItem value="perplexity">Perplexity (with sources)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-zinc-500">Highlighted selection</label>
                      <Card className="mt-1 p-2 bg-zinc-950 border-zinc-800 min-h-[60px] max-h-32 overflow-auto text-xs text-zinc-300">
                        {selection ? selection : <span className="text-zinc-600 italic">Highlight text in the editor to attach it as research context.</span>}
                      </Card>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-zinc-500">Or ask a question</label>
                      <Textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g. Provenance and dating of the Warka Vase. Or leave blank to research the highlight."
                        rows={4}
                        className="mt-1 text-sm bg-zinc-950 border-zinc-800"
                        data-testid="textarea-prompt"
                      />
                    </div>

                    <Button
                      className="w-full"
                      onClick={runResearch}
                      disabled={researching || (!prompt.trim() && !selection.trim())}
                      data-testid="button-research"
                    >
                      {researching ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
                      Research → insert at cursor
                    </Button>

                    <div className="pt-3 border-t border-zinc-800 text-[10px] text-zinc-500 leading-relaxed">
                      <strong className="text-zinc-400">How it works:</strong> Highlight text or type a question. The result inserts as a quoted block at your cursor — existing prose is never overwritten. Each call is logged to <code className="text-zinc-300">lesson_research</code>.
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="drive" className="flex-1 min-h-0 mt-0 flex flex-col">
                <div className="p-2 border-b border-zinc-800 space-y-2 bg-zinc-900/40">
                  <div className="flex gap-1">
                    <Input
                      value={driveQuery}
                      onChange={(e) => setDriveQuery(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") runDriveSearch(); }}
                      placeholder="Search RWI corpus (concepts, names, terms)…"
                      className="h-8 text-xs bg-zinc-950 border-zinc-800"
                      data-testid="input-drive-search"
                    />
                    <Button size="sm" variant="outline" onClick={runDriveSearch} disabled={driveLoading} data-testid="button-drive-search">
                      <Search className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-zinc-500 overflow-x-auto whitespace-nowrap">
                    <button
                      onClick={() => { setDriveCrumbs([{ id: driveRoot, name: "root" }]); loadFolder(driveRoot); setDriveQuery(""); }}
                      className="hover:text-zinc-200 flex items-center gap-1"
                      data-testid="button-drive-root"
                    >
                      <FolderOpen className="w-3 h-3" /> root
                    </button>
                    {driveCrumbs.slice(1).map((c, i) => (
                      <span key={c.id} className="flex items-center gap-1">
                        <ChevronRight className="w-3 h-3" />
                        <button
                          onClick={() => {
                            const next = driveCrumbs.slice(0, i + 2);
                            setDriveCrumbs(next);
                            loadFolder(c.id);
                          }}
                          className="hover:text-zinc-200"
                        >
                          {c.name}
                        </button>
                      </span>
                    ))}
                    {driveMode === "search" && <span className="ml-2 text-amber-400">· search results for "{driveQuery}"</span>}
                  </div>
                </div>

                <ScrollArea className="flex-1 min-h-0">
                  <div className="p-2 space-y-1">
                    {driveLoading && <div className="text-xs text-zinc-500 p-2 flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> Loading…</div>}
                    {!driveLoading && driveItems.length === 0 && (
                      <div className="text-xs text-zinc-500 p-2 italic">{driveMode === "search" ? "No matches." : "Folder is empty."}</div>
                    )}
                    {driveItems.map((item) => {
                      const isFolder = item.mimeType === "application/vnd.google-apps.folder";
                      return (
                        <button
                          key={item.id}
                          onClick={() => openDriveItem(item)}
                          className="w-full text-left px-2 py-1.5 rounded hover:bg-zinc-800/60 text-xs flex items-start gap-2 group"
                          data-testid={`drive-item-${item.id}`}
                        >
                          {isFolder ? (
                            <FolderOpen className="w-3.5 h-3.5 mt-0.5 text-amber-400 flex-shrink-0" />
                          ) : (
                            <FileText className="w-3.5 h-3.5 mt-0.5 text-zinc-400 flex-shrink-0" />
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-zinc-200 group-hover:text-white">{item.name}</div>
                            <div className="text-[10px] text-zinc-500 truncate">
                              {isFolder ? "folder" : (item.mimeType?.split("/").pop() || "file")}
                              {item.size ? ` · ${Math.round(parseInt(item.size, 10) / 1024)} KB` : ""}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>

                {drivePreview && (
                  <div className="border-t border-zinc-800 bg-zinc-950 max-h-[45%] flex flex-col">
                    <div className="p-2 border-b border-zinc-800 flex items-center gap-2">
                      <Download className="w-3 h-3 text-zinc-400" />
                      <div className="text-xs font-medium truncate flex-1" data-testid="text-drive-preview-name">{drivePreview.name}</div>
                      <Button size="sm" variant="ghost" onClick={() => setDrivePreview(null)} className="h-6 w-6 p-0">×</Button>
                    </div>
                    <ScrollArea className="flex-1 min-h-0">
                      <pre className="text-[10px] text-zinc-300 whitespace-pre-wrap p-2 leading-relaxed">
                        {drivePreviewLoading ? "Loading…" : (drivePreview.text || "(empty or binary file)")}
                      </pre>
                    </ScrollArea>
                    <div className="p-2 border-t border-zinc-800 grid grid-cols-2 gap-1">
                      <Button size="sm" variant="outline" onClick={insertDriveAsContext} disabled={!drivePreview.text} data-testid="button-drive-insert">
                        Insert raw
                      </Button>
                      <Button size="sm" onClick={useDriveAsResearchContext} disabled={!drivePreview.text || researching} data-testid="button-drive-synthesize">
                        {researching ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3 mr-1" />}
                        Synthesize
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </aside>
      </div>
    </div>
  );
}
