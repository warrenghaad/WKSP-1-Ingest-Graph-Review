import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search, Bookmark, ArrowLeft, Image as ImageIcon, Check, Download, X,
  AlertCircle, Loader2, Bold, Italic, Heading2, Heading3,
  Undo, Redo, Strikethrough, Highlighter,
  FileText, ChevronDown, Grid3x3, Filter, Eye, Trash2,
  CheckCircle2, RefreshCw, ExternalLink
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
import { DOCUMENTS } from "@/lib/documentContent";
import OfflineIndicator from "@/components/OfflineIndicator";

interface ImageResult {
  url: string;
  title: string;
  source: string;
}

interface SavedImage {
  id: number;
  url: string;
  title: string | null;
  source: string | null;
  query: string | null;
  createdAt: string;
}

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());
  const [damFilter, setDamFilter] = useState<string | null>(null);
  const [hoveredAnnotation, setHoveredAnnotation] = useState<{
    url: string; title: string; source: string; rect: DOMRect;
  } | null>(null);

  const [floatingSearchPos, setFloatingSearchPos] = useState<{
    top: number; left: number;
  } | null>(null);
  const [selectionRange, setSelectionRange] = useState<{ from: number; to: number } | null>(null);

  const editorContainerRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({ placeholder: "Start writing or paste your research text here..." }),
      ImageAnnotation,
      InlineImageNode,
    ],
    content: INITIAL_CONTENT,
    editorProps: {
      attributes: {
        class: "prose prose-invert prose-lg font-serif max-w-none focus:outline-none selection:bg-primary/30 selection:text-white min-h-[60vh]",
      },
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      if (from === to) {
        setSelectedText("");
        setSelectionRange(null);
        return;
      }
      const text = editor.state.doc.textBetween(from, to, " ");
      if (text.trim().length > 0) {
        setSelectedText(text.trim());
        setSelectionRange({ from, to });
      }
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
      const annotation = target.closest(".image-annotation") as HTMLElement;
      if (annotation) {
        const url = annotation.getAttribute("data-image-url");
        const title = annotation.getAttribute("data-image-title");
        const source = annotation.getAttribute("data-image-source");
        if (url) {
          const rect = annotation.getBoundingClientRect();
          setHoveredAnnotation({ url, title: title || "", source: source || "", rect });
        }
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const related = e.relatedTarget as HTMLElement;
      if (target.closest(".image-annotation") && (!related || !related.closest(".image-annotation"))) {
        setHoveredAnnotation(null);
      }
    };

    const handleScroll = () => setHoveredAnnotation(null);

    container.addEventListener("mouseover", handleMouseOver);
    container.addEventListener("mouseout", handleMouseOut);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      container.removeEventListener("mouseover", handleMouseOver);
      container.removeEventListener("mouseout", handleMouseOut);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, []);

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

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/saved-images/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-images"] });
    },
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
        if (!seen.has(img.url)) {
          seen.add(img.url);
          combined.push(img);
        }
      }

      setSearchResults(combined);
      if (combined.length === 0) {
        setSearchError("No images found. Try selecting different text.");
      }
    } catch (err: any) {
      setSearchError(err.message || "Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleApproveImage = (image: ImageResult) => {
    if (!editor || !selectionRange) {
      toast({ title: "No text selected", description: "Please select text first.", duration: 2000 });
      return;
    }

    editor.chain().focus()
      .setTextSelection(selectionRange)
      .setImageAnnotation({
        url: image.url,
        title: image.title,
        source: image.source,
        query: searchQuery,
      })
      .run();

    editor.chain().focus()
      .setTextSelection({ from: selectionRange.from, to: selectionRange.from })
      .insertInlineImage({
        src: image.url,
        title: image.title,
        source: image.source,
        query: searchQuery,
      })
      .run();

    if (!isImageSaved(image.url)) {
      saveMutation.mutate({
        url: image.url,
        title: image.title,
        source: image.source,
        query: searchQuery,
      });
    }

    toast({
      title: "Image anchored & saved",
      description: "Added to your DAM collection.",
      duration: 2000,
    });

    setFloatingSearchPos(null);
    setSearchResults([]);
    setSearchQuery("");
  };

  const handleSearchMore = () => {
    handleSearch();
  };

  const dismissFloatingSearch = () => {
    setFloatingSearchPos(null);
    setSearchResults([]);
    setSearchQuery("");
    setIsSearching(false);
    setSearchError(null);
  };

  const isImageSaved = (url: string) => savedImages.some(img => img.url === url);

  const damQueries = [...new Set(savedImages.map(img => img.query).filter(Boolean))] as string[];
  const filteredImages = damFilter
    ? savedImages.filter(img => img.query === damFilter)
    : savedImages;

  return (
    <div className="relative w-screen h-screen bg-background text-foreground flex overflow-hidden">
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'pr-[480px]' : ''}`}>
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button data-testid="button-back" variant="ghost" size="icon" onClick={() => setLocation("/")} className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="relative">
              <button
                data-testid="button-doc-picker"
                onClick={() => setDocPickerOpen(!docPickerOpen)}
                className="text-left hover:bg-muted/50 rounded-lg px-3 py-1.5 -ml-3 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-serif font-bold">{currentDoc?.title}</h1>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${docPickerOpen ? 'rotate-180' : ''}`} />
                </div>
                <p className="text-xs text-muted-foreground font-sans uppercase tracking-wider">{currentDoc?.subtitle}</p>
              </button>

              <AnimatePresence>
                {docPickerOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute top-full left-0 mt-1 w-[380px] bg-popover border border-border rounded-xl shadow-xl z-50 overflow-hidden"
                  >
                    {DOCUMENTS.map((doc, idx) => (
                      <button
                        key={doc.id}
                        data-testid={`doc-option-${doc.id}`}
                        onClick={() => switchDocument(idx)}
                        className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-muted/50 transition-colors border-b border-border last:border-0 ${
                          idx === currentDocIndex ? 'bg-primary/5' : ''
                        }`}
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

          <div className="flex items-center gap-2">
            {editor && (
              <div className="hidden md:flex items-center gap-0.5 bg-muted p-1 rounded-lg mr-2">
                <Button data-testid="button-undo" variant="ghost" size="icon" className="h-7 w-7 rounded"
                  onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
                  <Undo className="w-3.5 h-3.5" />
                </Button>
                <Button data-testid="button-redo" variant="ghost" size="icon" className="h-7 w-7 rounded"
                  onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
                  <Redo className="w-3.5 h-3.5" />
                </Button>
                <div className="w-px h-5 bg-border mx-1" />
                <Button data-testid="button-bold" variant={editor.isActive("bold") ? "secondary" : "ghost"}
                  size="icon" className="h-7 w-7 rounded" onClick={() => editor.chain().focus().toggleBold().run()}>
                  <Bold className="w-3.5 h-3.5" />
                </Button>
                <Button data-testid="button-italic" variant={editor.isActive("italic") ? "secondary" : "ghost"}
                  size="icon" className="h-7 w-7 rounded" onClick={() => editor.chain().focus().toggleItalic().run()}>
                  <Italic className="w-3.5 h-3.5" />
                </Button>
                <Button data-testid="button-strike" variant={editor.isActive("strike") ? "secondary" : "ghost"}
                  size="icon" className="h-7 w-7 rounded" onClick={() => editor.chain().focus().toggleStrike().run()}>
                  <Strikethrough className="w-3.5 h-3.5" />
                </Button>
                <Button data-testid="button-highlight" variant={editor.isActive("highlight") ? "secondary" : "ghost"}
                  size="icon" className="h-7 w-7 rounded" onClick={() => editor.chain().focus().toggleHighlight().run()}>
                  <Highlighter className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}

            <Button
              data-testid="button-dam-toggle"
              variant={isSidebarOpen ? "default" : "outline"}
              className="rounded-full gap-2"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Grid3x3 className="w-4 h-4" />
              DAM ({savedImages.length})
            </Button>
          </div>
        </header>

        <ScrollArea className="h-[calc(100vh-73px)]">
          <div className="max-w-3xl mx-auto py-12 px-8" ref={editorContainerRef}>
            {editor && (
              <BubbleMenu
                editor={editor}
                tippyOptions={{ duration: 150, placement: "top" }}
                shouldShow={({ editor }) => {
                  const { from, to } = editor.state.selection;
                  return from !== to;
                }}
              >
                <div className="bg-popover border border-border shadow-xl rounded-xl p-1.5 flex items-center gap-1 backdrop-blur-md">
                  <Button data-testid="bubble-bold" variant={editor.isActive("bold") ? "secondary" : "ghost"}
                    size="icon" className="h-7 w-7 rounded" onClick={() => editor.chain().focus().toggleBold().run()}>
                    <Bold className="w-3.5 h-3.5" />
                  </Button>
                  <Button data-testid="bubble-italic" variant={editor.isActive("italic") ? "secondary" : "ghost"}
                    size="icon" className="h-7 w-7 rounded" onClick={() => editor.chain().focus().toggleItalic().run()}>
                    <Italic className="w-3.5 h-3.5" />
                  </Button>
                  <Button data-testid="bubble-highlight" variant={editor.isActive("highlight") ? "secondary" : "ghost"}
                    size="icon" className="h-7 w-7 rounded" onClick={() => editor.chain().focus().toggleHighlight().run()}>
                    <Highlighter className="w-3.5 h-3.5" />
                  </Button>
                  <Button data-testid="bubble-h2" variant={editor.isActive("heading", { level: 2 }) ? "secondary" : "ghost"}
                    size="icon" className="h-7 w-7 rounded" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
                    <Heading2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button data-testid="bubble-h3" variant={editor.isActive("heading", { level: 3 }) ? "secondary" : "ghost"}
                    size="icon" className="h-7 w-7 rounded" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
                    <Heading3 className="w-3.5 h-3.5" />
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

      {/* Floating Search Results Panel - appears above selected text */}
      <AnimatePresence>
        {floatingSearchPos && (isSearching || searchResults.length > 0 || searchError) && (
          <motion.div
            data-testid="floating-search-panel"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed z-50"
            style={{
              top: `${floatingSearchPos.top}px`,
              left: `${floatingSearchPos.left}px`,
            }}
          >
            <div className="w-[400px] bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-3 border-b border-border bg-background/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium truncate max-w-[250px]">"{searchQuery}"</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button data-testid="floating-search-more" variant="ghost" size="icon" className="h-6 w-6 rounded"
                    onClick={handleSearchMore} disabled={isSearching} title="Search again">
                    <RefreshCw className={`w-3 h-3 ${isSearching ? 'animate-spin' : ''}`} />
                  </Button>
                  <Button data-testid="floating-search-close" variant="ghost" size="icon" className="h-6 w-6 rounded"
                    onClick={dismissFloatingSearch}>
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
                          className="group relative rounded-lg overflow-hidden border border-border bg-muted cursor-pointer hover:border-primary/60 transition-all hover:shadow-lg"
                          onClick={() => handleApproveImage(img)}
                        >
                          <div className="aspect-square w-full relative overflow-hidden">
                            <img
                              src={img.url}
                              alt={img.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              onError={() => setBrokenImages(prev => new Set(prev).add(img.url))}
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="absolute bottom-0 left-0 right-0 p-2">
                                <p className="text-[10px] text-white/90 line-clamp-2 font-medium">{img.title}</p>
                                <p className="text-[9px] text-white/60">{img.source}</p>
                              </div>
                              <div className="absolute top-2 right-2">
                                {saved ? (
                                  <div className="bg-green-500/90 rounded-full p-1">
                                    <Check className="w-3 h-3 text-white" />
                                  </div>
                                ) : (
                                  <div className="bg-primary/90 rounded-full p-1">
                                    <CheckCircle2 className="w-3 h-3 text-white" />
                                  </div>
                                )}
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
                  <p className="text-[10px] text-muted-foreground">Click an image to anchor it above the selected text & save to DAM</p>
                </div>
              )}

              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-card/95 border-r border-b border-border rotate-45" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hover tooltip for annotated text */}
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
                <img
                  src={hoveredAnnotation.url}
                  alt={hoveredAnnotation.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-2 bg-card">
                <p className="text-xs font-medium text-foreground line-clamp-2">{hoveredAnnotation.title}</p>
                <p className="text-[10px] text-muted-foreground">{hoveredAnnotation.source}</p>
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-card border-r border-b border-primary/30 rotate-45" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DAM Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0, x: 480 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 480 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 w-[480px] h-full bg-card border-l border-border shadow-2xl z-40 flex flex-col"
          >
            <div className="p-4 border-b border-border bg-background/50 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Grid3x3 className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">Digital Asset Manager</h2>
                    <p className="text-[10px] text-muted-foreground">{savedImages.length} assets curated</p>
                  </div>
                </div>
                <Button data-testid="button-close-dam" variant="ghost" size="icon" className="rounded-full" onClick={() => setIsSidebarOpen(false)}>
                  <X className="w-5 h-5 text-muted-foreground" />
                </Button>
              </div>

              {damQueries.length > 0 && (
                <div className="flex gap-1.5 flex-wrap">
                  <Button
                    data-testid="dam-filter-all"
                    variant={damFilter === null ? "secondary" : "ghost"}
                    size="sm"
                    className="h-6 px-2.5 text-[10px] rounded-full"
                    onClick={() => setDamFilter(null)}
                  >
                    All ({savedImages.length})
                  </Button>
                  {damQueries.map((q, qi) => {
                    const count = savedImages.filter(img => img.query === q).length;
                    const slug = q.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                    return (
                      <Button
                        key={q}
                        data-testid={`dam-filter-${slug || qi}`}
                        variant={damFilter === q ? "secondary" : "ghost"}
                        size="sm"
                        className="h-6 px-2.5 text-[10px] rounded-full max-w-[120px] truncate"
                        onClick={() => setDamFilter(damFilter === q ? null : q)}
                      >
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
                    {damFilter
                      ? "Try a different filter or add more images."
                      : "Highlight text in the editor and click \"Find Images\" to source and curate visual assets."}
                  </p>
                </div>
              ) : (
                <div className="p-3">
                  <div className="grid grid-cols-2 gap-3">
                    {filteredImages.map((img) => (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        key={img.id}
                        data-testid={`dam-asset-${img.id}`}
                        className="group relative rounded-xl border border-border overflow-hidden bg-card shadow-sm hover:border-primary/40 transition-all hover:shadow-md"
                      >
                        <div className="aspect-square w-full relative overflow-hidden bg-muted">
                          <img
                            src={img.url}
                            alt={img.title || "Saved image"}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="absolute bottom-2 left-2 right-2 flex gap-1">
                              <a
                                href={img.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                data-testid={`dam-open-${img.id}`}
                                className="flex-1 flex items-center justify-center gap-1 bg-white/20 backdrop-blur-sm text-white text-[10px] rounded-md py-1 hover:bg-white/30 transition-colors"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Open
                              </a>
                              <button
                                data-testid={`dam-delete-${img.id}`}
                                className="flex items-center justify-center bg-red-500/80 backdrop-blur-sm text-white rounded-md px-2 py-1 hover:bg-red-600 transition-colors"
                                onClick={() => deleteMutation.mutate(img.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="p-2">
                          <p className="text-[11px] font-medium text-foreground line-clamp-2 leading-tight">{img.title || "Untitled"}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{img.source || "Unknown"}</p>
                          {img.query && (
                            <span className="inline-block mt-1 text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                              {img.query}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
