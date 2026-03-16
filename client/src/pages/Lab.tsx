import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Search, ArrowLeft, Bookmark, Check, X, Loader2,
  Sparkles, Database, Layers, Download, Play, Pause,
  ImageIcon, Wand2, AlertCircle, ExternalLink, BookmarkCheck
} from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface ImageResult {
  url: string;
  title: string;
  source: string;
  objectUrl?: string;
  date?: string;
  culture?: string;
  medium?: string;
  searchType?: string;
}

interface BatchResult {
  query: string;
  results: ImageResult[];
  count: number;
  error?: string;
}

interface SavedImage {
  id: number;
  url: string;
  title: string | null;
  source: string | null;
  query: string | null;
  createdAt: string;
}

export default function Lab() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Single search state
  const [singleQuery, setSingleQuery] = useState("");
  const [singleResults, setSingleResults] = useState<ImageResult[]>([]);
  const [singleSearching, setSingleSearching] = useState(false);
  const [singleSource, setSingleSource] = useState<"all" | "museums" | "ai">("all");

  // Batch search state
  const [batchInput, setBatchInput] = useState("");
  const [batchResults, setBatchResults] = useState<BatchResult[]>([]);
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
  const batchAbort = useRef<AbortController | null>(null);

  // Generate state
  const [generatePrompt, setGeneratePrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  // Broken images tracker
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());

  const { data: savedImages = [] } = useQuery<SavedImage[]>({
    queryKey: ["/api/saved-images"],
    queryFn: async () => {
      const res = await fetch("/api/saved-images");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-images"] });
    },
  });

  const batchSaveMutation = useMutation({
    mutationFn: async (images: { url: string; title: string; source: string; query: string }[]) => {
      const res = await fetch("/api/saved-images/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-images"] });
      toast({ title: "Batch Save Complete", description: `${data.count} images saved to collection.` });
    },
  });

  const isImageSaved = (url: string) => savedImages.some(img => img.url === url);

  // Single search
  const handleSingleSearch = async () => {
    if (!singleQuery.trim()) return;
    setSingleSearching(true);
    setSingleResults([]);
    setBrokenImages(new Set());

    try {
      const endpoints = [];
      if (singleSource === "museums" || singleSource === "all") {
        endpoints.push(
          fetch("/api/search-museums", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: singleQuery }),
          }).then(r => {
            if (!r.ok) throw new Error(`Museum search failed (${r.status})`);
            return r.json();
          }).then(d => (d.results || []).map((r: any) => ({ ...r, searchType: "museum" })))
        );
      }
      if (singleSource === "ai" || singleSource === "all") {
        endpoints.push(
          fetch("/api/search-images", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: singleQuery }),
          }).then(r => {
            if (!r.ok) throw new Error(`AI search failed (${r.status})`);
            return r.json();
          }).then(d => (d.results || []).map((r: any) => ({ ...r, searchType: "ai" })))
        );
      }

      const results = await Promise.allSettled(endpoints);
      const successful = results
        .filter((r): r is PromiseFulfilledResult<ImageResult[]> => r.status === "fulfilled")
        .flatMap(r => r.value);
      const failures = results.filter(r => r.status === "rejected");

      setSingleResults(successful);
      if (failures.length > 0 && successful.length === 0) {
        toast({ title: "Search failed", description: "Could not reach search services.", variant: "destructive" });
      } else if (failures.length > 0) {
        toast({ title: "Partial results", description: "Some search sources were unavailable." });
      }
    } catch (err) {
      toast({ title: "Search failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setSingleSearching(false);
    }
  };

  // Batch search with SSE
  const handleBatchSearch = async () => {
    const queries = batchInput
      .split("\n")
      .map(q => q.replace(/^[-*•]\s*(\[.\]\s*)?(\*\*)?/g, "").replace(/\*\*$/g, "").trim())
      .filter(q => q.length > 3);

    if (queries.length === 0) return;

    setBatchRunning(true);
    setBatchResults([]);
    setBatchProgress({ current: 0, total: queries.length });

    const controller = new AbortController();
    batchAbort.current = controller;

    try {
      const res = await fetch("/api/batch-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queries, searchType: "museums" }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: "Batch search failed" }));
        toast({ title: "Batch search failed", description: errData.error, variant: "destructive" });
        setBatchRunning(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === "progress") {
              setBatchProgress({ current: event.index + 1, total: event.total });
            } else if (event.type === "result") {
              setBatchResults(prev => [...prev, { query: event.query, results: event.results, count: event.count }]);
            } else if (event.type === "error") {
              setBatchResults(prev => [...prev, { query: event.query, results: [], count: 0, error: event.error }]);
            } else if (event.type === "complete") {
              toast({ title: "Batch Complete", description: `${event.totalImages} images found across ${event.totalQueries} queries.` });
            }
          } catch {}
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        toast({ title: "Batch search failed", variant: "destructive" });
      }
    } finally {
      setBatchRunning(false);
      batchAbort.current = null;
    }
  };

  const handleStopBatch = () => {
    batchAbort.current?.abort();
  };

  // AI image generation
  const handleGenerate = async () => {
    if (!generatePrompt.trim()) return;
    setGenerating(true);
    setGeneratedImage(null);

    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: generatePrompt }),
      });

      if (!res.ok) throw new Error("Generation failed");
      const data = await res.json();
      if (data.b64_json) {
        setGeneratedImage(`data:image/png;base64,${data.b64_json}`);
      }
    } catch (err) {
      toast({ title: "Generation failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  // Save all results from batch
  const handleSaveAllBatch = () => {
    const allImages = batchResults.flatMap(br =>
      br.results.filter(r => !isImageSaved(r.url)).map(r => ({
        url: r.url,
        title: r.title,
        source: r.source,
        query: br.query,
      }))
    );
    if (allImages.length > 0) {
      batchSaveMutation.mutate(allImages);
    }
  };

  const renderImageCard = (img: ImageResult, idx: number, query?: string) => {
    const broken = brokenImages.has(img.url);
    const saved = isImageSaved(img.url);

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.03 }}
        key={`${img.url}-${idx}`}
        className={`group rounded-lg border overflow-hidden bg-card transition-colors shadow-sm ${broken ? 'border-destructive/30 opacity-60' : 'border-border hover:border-primary/40'}`}
      >
        <div className="aspect-[4/3] w-full relative overflow-hidden bg-muted">
          {broken ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
              <AlertCircle className="w-6 h-6 text-destructive/50" />
              <span className="text-[10px]">Image unavailable</span>
            </div>
          ) : (
          <img
            src={img.url}
            alt={img.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setBrokenImages(prev => new Set(prev).add(img.url))}
            loading="lazy"
          />
          )}
          <div className="absolute top-2 left-2">
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full backdrop-blur-md ${
              img.searchType === "museum" ? "bg-blue-500/80 text-white" : "bg-purple-500/80 text-white"
            }`}>
              {img.searchType === "museum" ? img.source?.split(" ")[0] || "Museum" : "AI"}
            </span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
            <div className="flex gap-2 w-full">
              <Button
                data-testid={`save-${idx}`}
                size="sm"
                className={`flex-1 h-8 text-xs ${saved ? 'bg-green-600 hover:bg-green-700' : ''}`}
                onClick={() => !saved && saveMutation.mutate({ url: img.url, title: img.title, source: img.source, query: query || "" })}
                disabled={saved}
              >
                {saved ? <><Check className="w-3 h-3 mr-1" /> Saved</> : <><Bookmark className="w-3 h-3 mr-1" /> Save</>}
              </Button>
              {img.objectUrl && (
                <Button size="sm" variant="secondary" className="h-8 w-8 p-0" asChild>
                  <a href={img.objectUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className="p-2.5">
          <p className="text-xs font-medium text-foreground line-clamp-2 mb-1">{img.title}</p>
          <p className="text-[10px] text-muted-foreground">{img.source}</p>
          {img.date && <p className="text-[10px] text-muted-foreground/70">{img.date}</p>}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="relative w-screen h-screen bg-background text-foreground flex flex-col overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border p-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <Button data-testid="button-back-lab" variant="ghost" size="icon" onClick={() => setLocation("/")} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Layers className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-serif font-bold">Automation Lab</h1>
              <p className="text-xs text-muted-foreground font-sans">Image Search & Generation Testing Ground</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
            <BookmarkCheck className="w-3 h-3 inline mr-1" />
            {savedImages.length} saved
          </span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="single" className="h-full flex flex-col">
          <div className="px-6 pt-4 border-b border-border flex-shrink-0">
            <TabsList className="bg-muted">
              <TabsTrigger data-testid="tab-single" value="single" className="gap-2">
                <Search className="w-4 h-4" /> Single Search
              </TabsTrigger>
              <TabsTrigger data-testid="tab-batch" value="batch" className="gap-2">
                <Database className="w-4 h-4" /> Batch Search
              </TabsTrigger>
              <TabsTrigger data-testid="tab-generate" value="generate" className="gap-2">
                <Wand2 className="w-4 h-4" /> AI Generate
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Single Search Tab */}
          <TabsContent value="single" className="flex-1 overflow-hidden mt-0 px-6 pt-6">
            <div className="flex gap-3 mb-6">
              <div className="flex gap-1 bg-muted p-1 rounded-lg">
                {(["all", "museums", "ai"] as const).map(src => (
                  <Button
                    key={src}
                    variant={singleSource === src ? "secondary" : "ghost"}
                    size="sm"
                    className={`rounded-md px-3 text-xs capitalize ${singleSource === src ? 'shadow-sm bg-background' : 'text-muted-foreground'}`}
                    onClick={() => setSingleSource(src)}
                  >
                    {src === "all" ? "All Sources" : src === "museums" ? "Museums" : "AI Search"}
                  </Button>
                ))}
              </div>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  data-testid="input-single-search"
                  placeholder="e.g. Ishtar Gate lion glazed brick, cylinder seal hunting scene..."
                  value={singleQuery}
                  onChange={e => setSingleQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSingleSearch()}
                  className="pl-10"
                />
              </div>
              <Button
                data-testid="button-single-search"
                onClick={handleSingleSearch}
                disabled={singleSearching || !singleQuery.trim()}
                className="gap-2"
              >
                {singleSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Search
              </Button>
            </div>

            <ScrollArea className="h-[calc(100vh-230px)]">
              {singleSearching ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-20">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="rounded-lg border border-border overflow-hidden bg-card animate-pulse">
                      <div className="aspect-[4/3] bg-muted" />
                      <div className="p-2.5"><div className="h-3 bg-muted rounded w-2/3 mb-1" /><div className="h-2.5 bg-muted rounded w-1/3" /></div>
                    </div>
                  ))}
                </div>
              ) : singleResults.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-muted-foreground">{singleResults.length} results found</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => {
                        const unsaved = singleResults.filter(r => !isImageSaved(r.url));
                        if (unsaved.length > 0) {
                          batchSaveMutation.mutate(unsaved.map(r => ({ url: r.url, title: r.title, source: r.source, query: singleQuery })));
                        }
                      }}
                      disabled={batchSaveMutation.isPending}
                    >
                      <Download className="w-3 h-3" /> Save All
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-20">
                    {singleResults.map((img, idx) => renderImageCard(img, idx, singleQuery))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-24">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <ImageIcon className="w-8 h-8 text-muted-foreground opacity-50" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Search for artifact images</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Search across the Met Museum, Smithsonian, Wikimedia Commons, and AI-powered web search simultaneously.
                  </p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Batch Search Tab */}
          <TabsContent value="batch" className="flex-1 overflow-hidden mt-0 px-6 pt-6">
            <div className="grid grid-cols-[1fr_1fr] gap-6 h-[calc(100vh-230px)]">
              {/* Left: Input */}
              <div className="flex flex-col gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Batch Queries</h3>
                  <p className="text-xs text-muted-foreground mb-3">Paste one search query per line. Supports bullet lists from your task documents.</p>
                </div>
                <Textarea
                  data-testid="textarea-batch"
                  placeholder={`Burney Relief Queen of the Night British Museum\nIshtar Gate Pergamon Museum Berlin\nMesopotamian kudurru boundary stone\ncylinder seal hunting scene\ncone mosaic Uruk Eanna precinct\nRoyal Tombs Ur gold granulation`}
                  value={batchInput}
                  onChange={e => setBatchInput(e.target.value)}
                  className="flex-1 resize-none font-mono text-sm"
                />
                <div className="flex gap-3">
                  <Button
                    data-testid="button-batch-run"
                    onClick={handleBatchSearch}
                    disabled={batchRunning || !batchInput.trim()}
                    className="gap-2 flex-1"
                  >
                    {batchRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    {batchRunning ? `Searching ${batchProgress.current}/${batchProgress.total}...` : "Run Batch Search"}
                  </Button>
                  {batchRunning && (
                    <Button variant="destructive" size="icon" onClick={handleStopBatch}>
                      <Pause className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Right: Results */}
              <ScrollArea className="h-full border border-border rounded-xl bg-card/50 p-4">
                {batchResults.length > 0 && (
                  <div className="mb-4 flex items-center justify-between sticky top-0 bg-card/90 backdrop-blur-sm p-2 rounded-lg z-10">
                    <span className="text-sm text-muted-foreground">
                      {batchResults.reduce((sum, r) => sum + r.count, 0)} images from {batchResults.length} queries
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={handleSaveAllBatch}
                      disabled={batchSaveMutation.isPending}
                    >
                      <Download className="w-3 h-3" /> Save All
                    </Button>
                  </div>
                )}

                {batchResults.length === 0 && !batchRunning && (
                  <div className="text-center py-20">
                    <Database className="w-10 h-10 text-muted-foreground opacity-30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">Results will appear here as each query completes.</p>
                  </div>
                )}

                <div className="space-y-6">
                  <AnimatePresence>
                    {batchResults.map((br, bIdx) => (
                      <motion.div
                        key={br.query}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">Q{bIdx + 1}</span>
                          <span className="text-sm font-medium truncate">{br.query}</span>
                          <span className="text-xs text-muted-foreground ml-auto">{br.count} results</span>
                        </div>

                        {br.error && (
                          <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/5 p-2 rounded">
                            <AlertCircle className="w-3 h-3" /> {br.error}
                          </div>
                        )}

                        <div className="grid grid-cols-3 gap-2">
                          {br.results.slice(0, 6).map((img, idx) => renderImageCard(img, idx, br.query))}
                        </div>

                        {bIdx < batchResults.length - 1 && <div className="h-[1px] bg-border" />}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          {/* AI Generate Tab */}
          <TabsContent value="generate" className="flex-1 overflow-hidden mt-0 px-6 pt-6">
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <h3 className="text-lg font-serif font-medium mb-2">AI Image Generation</h3>
                <p className="text-sm text-muted-foreground">Generate custom archaeological reference images using AI when real photos aren't available.</p>
              </div>

              <Textarea
                data-testid="textarea-generate"
                placeholder="e.g. A Mesopotamian cylinder seal impression showing a hunting scene with a lion and archer, detailed cuneiform border, museum photograph lighting"
                value={generatePrompt}
                onChange={e => setGeneratePrompt(e.target.value)}
                className="min-h-[100px] resize-none"
              />

              <Button
                data-testid="button-generate"
                onClick={handleGenerate}
                disabled={generating || !generatePrompt.trim()}
                className="gap-2 w-full"
              >
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {generating ? "Generating..." : "Generate Image"}
              </Button>

              <AnimatePresence>
                {generatedImage && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-border overflow-hidden bg-card shadow-lg"
                  >
                    <div className="aspect-square w-full relative bg-muted">
                      <img src={generatedImage} alt={generatePrompt} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium line-clamp-1">{generatePrompt}</p>
                        <p className="text-xs text-muted-foreground">AI Generated (OpenAI gpt-image-1)</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            saveMutation.mutate({
                              url: generatedImage!,
                              title: generatePrompt,
                              source: "AI Generated (OpenAI)",
                              query: generatePrompt,
                            });
                          }}
                          disabled={saveMutation.isPending}
                          className="gap-1"
                        >
                          <Bookmark className="w-3 h-3" /> Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const a = document.createElement("a");
                            a.href = generatedImage!;
                            a.download = `generated-${Date.now()}.png`;
                            a.click();
                          }}
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
