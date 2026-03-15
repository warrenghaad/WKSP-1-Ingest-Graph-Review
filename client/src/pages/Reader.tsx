import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Bookmark, ArrowLeft, Image as ImageIcon, Check, Download, X, AlertCircle, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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

export default function Reader() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedText, setSelectedText] = useState("");
  const [selectionRect, setSelectionRect] = useState<{ top: number; left: number; width: number } | null>(null);

  const [searchResults, setSearchResults] = useState<ImageResult[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'saved'>('search');
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());

  const contentRef = useRef<HTMLDivElement>(null);

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
      toast({ title: "Image Saved", description: "Added to your collection.", duration: 2000 });
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

  const handleSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0 && contentRef.current?.contains(selection.anchorNode)) {
      const text = selection.toString().trim();
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      setSelectedText(text);
      setSelectionRect({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    } else {
      setSelectionRect(null);
      setSelectedText("");
    }
  };

  useEffect(() => {
    document.addEventListener("selectionchange", handleSelection);
    return () => document.removeEventListener("selectionchange", handleSelection);
  }, []);

  const handleSearch = async () => {
    if (!selectedText) return;

    setSearchQuery(selectedText);
    setIsSearching(true);
    setSearchError(null);
    setIsSidebarOpen(true);
    setActiveTab('search');
    setSearchResults([]);
    setBrokenImages(new Set());

    window.getSelection()?.removeAllRanges();

    try {
      const res = await fetch("/api/search-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: selectedText }),
      });

      if (!res.ok) {
        throw new Error("Search failed");
      }

      const data = await res.json();
      setSearchResults(data.results || []);

      if (!data.results || data.results.length === 0) {
        setSearchError("No images found. Try selecting different text.");
      }
    } catch (err: any) {
      setSearchError(err.message || "Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSaveImage = (image: ImageResult) => {
    saveMutation.mutate({
      url: image.url,
      title: image.title,
      source: image.source,
      query: searchQuery,
    });
  };

  const isImageSaved = (url: string) => savedImages.some(img => img.url === url);

  return (
    <div className="relative w-screen h-screen bg-background text-foreground flex overflow-hidden">

      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'pr-[420px]' : ''}`}>
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button data-testid="button-back" variant="ghost" size="icon" onClick={() => setLocation("/")} className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-serif font-bold">Seven Geometric Primitives</h1>
              <p className="text-xs text-muted-foreground font-sans uppercase tracking-wider">Ancient Mesopotamian Material Culture</p>
            </div>
          </div>

          <Button
            data-testid="button-saved-toggle"
            variant="outline"
            className="rounded-full gap-2"
            onClick={() => { setIsSidebarOpen(!isSidebarOpen); setActiveTab('saved'); }}
          >
            <Bookmark className="w-4 h-4" />
            Saved ({savedImages.length})
          </Button>
        </header>

        <ScrollArea className="h-[calc(100vh-73px)]">
          <div className="max-w-3xl mx-auto py-12 px-8">
            <div
              ref={contentRef}
              className="prose prose-invert prose-lg font-serif selection:bg-primary/30 selection:text-white"
            >
              <h1 className="text-4xl mb-8 leading-tight">Seven Geometric Primitives in Ancient Mesopotamian Material Culture</h1>

              <p className="lead text-xl text-muted-foreground mb-12">
                The geometric vocabulary of human civilization rests on seven elemental forms—dot, line, triangle, circle, square, eight-pointed star, and crescent—each traceable from Paleolithic cognitive origins through Mesopotamian urban complexity.
              </p>

              <h2 className="text-2xl mt-12 mb-6 border-b border-border pb-2">PRIMITIVE 1: THE DOT / POINT</h2>

              <h3 className="text-xl mt-8 mb-4 text-primary">Part A — Mathematical properties and the science of position</h3>

              <p className="mb-6 leading-relaxed">
                The dot is geometry's zero-dimensional atom: position without extension, location without magnitude. Formally, it possesses no symmetry axes, no angles, no ratios—it is pure <em>where</em>. Yet this seemingly trivial element generated the most consequential cognitive technology in Mesopotamian history: <strong>the numeral</strong>.
              </p>

              <p className="mb-6 leading-relaxed">
                Babylonian mathematics exploited the dot through two innovations. First, the <strong>clay token system</strong> (c. 8000–3100 BCE), documented by Denise Schmandt-Besserat across more than 8,000 artifacts, used small geometric clay shapes—spheres, cones, disks—as one-to-one counters for commodities. A sphere equaled one large measure of grain; a cone, one small measure. These tokens are literally three-dimensional dots. When pressed into wet clay, tokens produced circular impressions—<strong>two-dimensional dots that became the first numerals</strong> (c. 3200 BCE, Susa and Uruk). The round-tipped stylus created circular marks for tens while the wedge-tipped end produced unit marks, establishing the proto-cuneiform numerical system visible on some 4,000 tablets from Uruk Level IV.
              </p>

              <p className="mb-6 leading-relaxed">
                Second, the <strong>sexagesimal positional notation</strong> (emerging c. 2000 BCE) combined vertical wedges (units) and horizontal wedges (tens) in a base-60 system that required understanding position—where a sign sat determined its value. By the 3rd century BCE, Babylonian astronomers introduced a placeholder symbol for empty positions, a functional zero. The dot as abstract numerical position had traveled from physical token to conceptual placeholder across five millennia.
              </p>

              <p className="mb-6 leading-relaxed">
                <strong>Tools that create dots</strong> include pointed styli (reed and bone), blunt circular stylus ends for numerical impressions, bow drills for bead perforation and seal engraving, and flint punches. The transition from stone to copper drills (3rd millennium BCE) enabled finer work on seals and jewelry.
              </p>

              <h3 className="text-xl mt-10 mb-4 text-primary">Part B — Material culture inventory</h3>

              <p className="mb-6 leading-relaxed">
                <strong>B1. Ceramics.</strong> Dot patterns constitute one of the oldest decorative vocabularies on Near Eastern pottery. Samarra ware (c. 5500–4800 BCE, Tell es-Sawwan) features geometric dot arrangements on dark-fired backgrounds. Halaf pottery (c. 6100–5100 BCE) from Tell Arpachiyah and Tell Halaf introduced the <strong>dot-circle motif</strong> as a standard element by the Late Halaf phase (c. 4900–4500 BCE), alongside white-on-dark dot compositions on eggshell-thin bowls.
              </p>

              <p className="mb-6 leading-relaxed">
                <strong>B2. Cylinder seals and stamp seals.</strong> The <strong>drill-dot technique</strong> is fundamental to seal engraving. Halaf stamp seals (mid-6th millennium BCE) are the earliest personal property markers in the Near East, featuring geometric patterns including dot arrangements. Cylinder seals (invented c. 3500 BCE at Uruk) extensively use drilled dots as filler between figures, as border elements, and as compositional spacing devices.
              </p>

              <p className="mb-6 leading-relaxed">
                <strong>B3. Textiles.</strong> Direct evidence is limited, but Schmandt-Besserat documented disk tokens from Uruk (c. 3300 BCE) bearing "different patterns of incised lines or dots, which stood for a variety of textiles and garments." Cone mosaic patterns at Uruk explicitly imitate "matting and textiles." Al-Ubaid figurines bear "painted marks or tattoos" that may represent textile or body-art dot patterns.
              </p>

              <p className="mb-6 leading-relaxed">
                <strong>B4. Architecture.</strong> The <strong>cone mosaic</strong> is the dot's most spectacular architectural expression. At the Eanna Precinct in Uruk (c. 3500–3000 BCE), thousands of baked clay cones (~10 cm long) with flat circular ends painted black, red, or white were pressed pointed-end-first into wet mud plaster, creating geometric patterns of colored dots across walls and columns. Each cone tip functions as one dot in a massive architectural pointillist composition.
              </p>

              <p className="mb-6 leading-relaxed">
                <strong>B5. Jewelry.</strong> Beads are three-dimensional dots. Stone, shell, and clay beads appear from the earliest Neolithic sites. The <strong>granulation technique</strong> (c. 2500 BCE) represents the dot's most refined metalworking expression: tiny gold spheres (pinhead-sized) are fused to gold surfaces in decorative patterns without conventional solder. The earliest examples come from the Royal Tombs of Ur (c. 2500 BCE), discovered by Woolley.
              </p>

              <p className="mb-6 leading-relaxed">
                <strong>B6. Ritual objects.</strong> Al-Ubaid female clay figurines with painted dot-patterns on their bodies (Penn Museum 31-16-733) may represent ritual scarification. Votive animal figurines from Uruk Level III (c. 3000 BCE) bear incised dot patterns. Clay bullae (hollow spherical envelopes containing tokens, c. 3300 BCE, Susa, Louvre) served the temple redistribution economy.
              </p>

              <p className="mb-6 leading-relaxed">
                <strong>B7. Tools.</strong> Tools that CREATE dots include: bone/flint/reed awls (Neolithic onward); the reed stylus with its blunt circular end for numerical impressions; bow drills for bead and seal work; copper drills replacing stone (3rd millennium BCE); and most fundamentally, <strong>Schmandt-Besserat's clay tokens</strong> (c. 8000–3100 BCE)—the tool system that bridged concrete counting and abstract notation.
              </p>

              <p className="mb-6 leading-relaxed">
                <strong>B8. Writing and administration.</strong> The dot's trajectory from token to tablet to sexagesimal notation constitutes one of history's most consequential technological chains. Clay tokens (c. 8000 BCE) → complex tokens with incised dots (c. 3500 BCE, ~300 subtypes) → tokens sealed in bullae (c. 3300 BCE, Susa envelope, Louvre) → impressed dots on tablets (c. 3200 BCE, Uruk Level IV, ~4,000 tablets) → sexagesimal positional notation (c. 2000 BCE).
              </p>

              <h2 className="text-2xl mt-12 mb-6 border-b border-border pb-2">PRIMITIVE 2: THE LINE</h2>

              <h3 className="text-xl mt-8 mb-4 text-primary">Part A — The geometry of extension and measurement</h3>

              <p className="mb-6 leading-relaxed">
                The line is one-dimensional: extension without breadth, defined by two points, infinitely extendable in both directions. It is the basis of all measurement, all construction, all writing. Formally, lines can be parallel (never meeting), perpendicular (meeting at 90°), or intersecting at any angle, generating the entire vocabulary of angular geometry.
              </p>

              <p className="mb-6 leading-relaxed">
                Babylonian mathematics formalized the line through <strong>standardized measurement units</strong>: the cubit (~518.5 mm per the Nippur standard), the nindan/rod (6 cubits, ~5.94 m), and the eš₂-gana₂ surveyor's rope (10 nindan). The oldest preserved measuring rod is a <strong>copper-alloy bar from Nippur, c. 2650 BCE</strong> (Istanbul Archaeological Museum), marked with 4 large units each subdivided into 16 smaller divisions.
              </p>

              <p className="mb-6 leading-relaxed">
                <strong>Transformations</strong> of the line generate the entire decorative vocabulary of ancient ceramics: parallel lines (bands), reflected lines (zigzags, chevrons), rotated lines (radial arrangements), and crossed lines (hatching, crosshatching, herringbone). Tools include the reed stylus, stretched cords/ropes for surveying, combed tools for parallel lines, straightedges, and plumb lines.
              </p>

              <h3 className="text-xl mt-10 mb-4 text-primary">Part B — Material culture inventory</h3>

              <p className="mb-6 leading-relaxed">
                <strong>B1. Ceramics.</strong> Line decoration is the most fundamental and universal element on Near Eastern pottery. Hassuna ware (c. 6500–6000 BCE, Tell Hassuna, Iraq Museum) represents the earliest painted linear decoration in northern Mesopotamia—cream slip with reddish paint in linear designs. Samarra pottery (c. 5500–4800 BCE, Tell es-Sawwan, Tell Baghouz) features painted and incised geometric designs with crosshatching, zigzag bands, and parallel lines.
              </p>

              <p className="mb-6 leading-relaxed">
                <strong>B2. Seals.</strong> The <strong>ground line</strong> is the primary organizing device of cylinder seal composition. By Early Dynastic I (c. 2900–2700 BCE), figures were "solidly placed on a groundline." Register lines—horizontal bands dividing scenes into narrative tiers—appear on Proto-Historical seals (3000–2700 BCE).
              </p>

              <p className="mb-6 leading-relaxed">
                <strong>B4. Architecture.</strong> Brick courses form the fundamental horizontal line of Mesopotamian construction. Varied brick types were deployed: Patzen (80×40×15 cm, Late Uruk), Riemchen (16×16 cm square section, Late Uruk), plano-convex (Early Dynastic). <strong>Recessed niching</strong>—vertical articulation of walls with projecting and recessed elements—appears from the 5th millennium BCE onward, creating "coloristic effects based on light and shadow."
              </p>

              <p className="mb-6 leading-relaxed">
                <strong>B5. Jewelry.</strong> Gold wire appears at the Royal Cemetery of Ur (c. 2600–2400 BCE). Wire work—drawing metal into linear filaments—is a metalworking innovation. Bar pendants and incised linear decorations on beads are found from Early Neolithic onward.
              </p>

              <div className="h-20" />
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Floating Action Button for Selection */}
      <AnimatePresence>
        {selectionRect && selectedText && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed z-50 shadow-2xl"
            style={{
              top: selectionRect.top - 60,
              left: Math.max(10, Math.min(selectionRect.left + (selectionRect.width / 2) - 100, window.innerWidth - 250)),
            }}
          >
            <div className="bg-popover border border-border shadow-xl rounded-full p-1.5 flex items-center gap-1 backdrop-blur-md">
              <span className="text-xs font-medium px-3 truncate max-w-[150px] text-muted-foreground">
                "{selectedText.slice(0, 30)}{selectedText.length > 30 ? '...' : ''}"
              </span>
              <div className="w-[1px] h-4 bg-border mx-1" />
              <Button
                data-testid="button-find-images"
                size="sm"
                className="rounded-full h-8 px-4 font-semibold shadow-md bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                onClick={handleSearch}
                disabled={isSearching}
              >
                {isSearching ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ImageIcon className="w-3.5 h-3.5" />
                )}
                Find Images
              </Button>
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-popover border-b border-r border-border rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 w-[420px] h-full bg-card border-l border-border shadow-2xl z-40 flex flex-col"
          >
            <div className="p-4 border-b border-border flex items-center justify-between bg-background/50 backdrop-blur-sm sticky top-0 z-10">
              <div className="flex gap-1 bg-muted p-1 rounded-lg">
                <Button
                  data-testid="tab-search"
                  variant={activeTab === 'search' ? 'secondary' : 'ghost'}
                  size="sm"
                  className={`rounded-md px-4 ${activeTab === 'search' ? 'shadow-sm bg-background text-foreground' : 'text-muted-foreground'}`}
                  onClick={() => setActiveTab('search')}
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
                <Button
                  data-testid="tab-saved"
                  variant={activeTab === 'saved' ? 'secondary' : 'ghost'}
                  size="sm"
                  className={`rounded-md px-4 ${activeTab === 'saved' ? 'shadow-sm bg-background text-foreground' : 'text-muted-foreground'}`}
                  onClick={() => setActiveTab('saved')}
                >
                  <Bookmark className="w-4 h-4 mr-2" />
                  Saved ({savedImages.length})
                </Button>
              </div>
              <Button data-testid="button-close-sidebar" variant="ghost" size="icon" className="rounded-full" onClick={() => setIsSidebarOpen(false)}>
                <X className="w-5 h-5 text-muted-foreground" />
              </Button>
            </div>

            <ScrollArea className="flex-1 p-4 bg-background/30">
              {activeTab === 'search' && (
                <div className="space-y-6 pb-20">
                  {searchQuery && (
                    <div className="bg-muted/50 p-4 rounded-xl border border-border">
                      <p className="text-sm text-muted-foreground mb-1">Searching for:</p>
                      <p className="text-base font-medium italic">"{searchQuery}"</p>
                    </div>
                  )}

                  {isSearching && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                        <Loader2 className="w-5 h-5 text-primary animate-spin" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Searching databases...</p>
                          <p className="text-xs text-muted-foreground">Finding images from museums and academic sources</p>
                        </div>
                      </div>
                      {[1, 2, 3].map(i => (
                        <div key={i} className="rounded-xl border border-border overflow-hidden bg-card animate-pulse">
                          <div className="aspect-video bg-muted w-full" />
                          <div className="p-3">
                            <div className="h-4 bg-muted rounded w-2/3 mb-2" />
                            <div className="h-3 bg-muted rounded w-1/3" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {searchError && !isSearching && (
                    <div className="flex items-start gap-3 p-4 bg-destructive/5 border border-destructive/20 rounded-xl">
                      <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Search Issue</p>
                        <p className="text-xs text-muted-foreground">{searchError}</p>
                      </div>
                    </div>
                  )}

                  {!isSearching && searchResults.length > 0 && (
                    <div className="space-y-5">
                      <p className="text-xs text-muted-foreground">{searchResults.length} results from web search</p>
                      {searchResults.map((img, idx) => {
                        const saved = isImageSaved(img.url);
                        const broken = brokenImages.has(img.url);
                        if (broken) return null;
                        return (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.08 }}
                            key={img.url + idx}
                            className="group rounded-xl border border-border overflow-hidden bg-card hover:border-primary/50 transition-colors shadow-sm"
                          >
                            <div className="aspect-[4/3] w-full relative overflow-hidden bg-muted">
                              <img
                                src={img.url}
                                alt={img.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                onError={() => setBrokenImages(prev => new Set(prev).add(img.url))}
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                <Button
                                  data-testid={`button-save-image-${idx}`}
                                  className={`flex-1 ${saved ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
                                  variant={saved ? 'default' : 'default'}
                                  onClick={() => !saved && handleSaveImage(img)}
                                  disabled={saveMutation.isPending}
                                >
                                  {saved ? (
                                    <><Check className="w-4 h-4 mr-2" /> Saved</>
                                  ) : (
                                    <><Bookmark className="w-4 h-4 mr-2" /> Save to Collection</>
                                  )}
                                </Button>
                              </div>
                            </div>
                            <div className="p-3 bg-card border-t border-border">
                              <p className="text-sm font-medium text-foreground mb-1 line-clamp-2">{img.title}</p>
                              <p className="text-xs text-muted-foreground">{img.source}</p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}

                  {!isSearching && !searchError && searchResults.length === 0 && !searchQuery && (
                    <div className="text-center py-20">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <ImageIcon className="w-8 h-8 text-muted-foreground opacity-50" />
                      </div>
                      <h3 className="text-lg font-medium text-foreground mb-2">Highlight text to search</h3>
                      <p className="text-muted-foreground text-sm max-w-xs mx-auto">Select any word or phrase in the document, then click "Find Images" to search for related images.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'saved' && (
                <div className="space-y-4 pb-20">
                  {savedImages.length === 0 ? (
                    <div className="text-center py-20">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bookmark className="w-8 h-8 text-muted-foreground opacity-50" />
                      </div>
                      <h3 className="text-lg font-medium text-foreground mb-2">Your collection is empty</h3>
                      <p className="text-muted-foreground text-sm">Highlight text and search to find and save images.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {savedImages.map((img) => (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          key={img.id}
                          className="group relative rounded-xl border border-border overflow-hidden bg-card shadow-sm"
                        >
                          <div className="aspect-[16/10] w-full relative overflow-hidden bg-muted">
                            <img
                              src={img.url}
                              alt={img.title || "Saved image"}
                              className="w-full h-full object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                data-testid={`button-delete-saved-${img.id}`}
                                size="icon"
                                variant="destructive"
                                className="w-8 h-8 rounded-full shadow-lg"
                                onClick={() => deleteMutation.mutate(img.id)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="p-3 bg-card border-t border-border">
                            <p className="text-sm font-medium text-foreground mb-1 line-clamp-2">{img.title || "Untitled"}</p>
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-muted-foreground">{img.source || "Unknown source"}</p>
                              <a
                                href={img.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline"
                              >
                                <Download className="w-3 h-3 inline mr-1" />
                                Open
                              </a>
                            </div>
                            {img.query && (
                              <p className="text-xs text-muted-foreground/70 mt-1 italic">Query: "{img.query}"</p>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
