import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Bookmark, ArrowLeft, Image as ImageIcon, Check, Download, X } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

// Import mock images
import tablet1 from "@/assets/images/tablet_1.jpg";
import tablet2 from "@/assets/images/tablet_2.jpg";
import seal1 from "@/assets/images/seal_1.jpg";
import seal2 from "@/assets/images/seal_2.jpg";
import ziggurat1 from "@/assets/images/ziggurat_1.jpg";
import ziggurat2 from "@/assets/images/ziggurat_2.jpg";
import pottery1 from "@/assets/images/pottery_1.jpg";
import pottery2 from "@/assets/images/pottery_2.jpg";

const MOCK_IMAGES = [
  { id: 'tablet1', src: tablet1, keywords: ['tablet', 'cuneiform', 'writing', 'clay', 'dot', 'line'] },
  { id: 'tablet2', src: tablet2, keywords: ['tablet', 'cuneiform', 'writing', 'clay', 'mathematics'] },
  { id: 'seal1', src: seal1, keywords: ['seal', 'cylinder', 'stamp', 'drill', 'engraving'] },
  { id: 'seal2', src: seal2, keywords: ['seal', 'cylinder', 'stamp', 'impression'] },
  { id: 'ziggurat1', src: ziggurat1, keywords: ['architecture', 'ziggurat', 'brick', 'building', 'wall'] },
  { id: 'ziggurat2', src: ziggurat2, keywords: ['architecture', 'ziggurat', 'brick', 'cone', 'mosaic'] },
  { id: 'pottery1', src: pottery1, keywords: ['pottery', 'ceramic', 'clay', 'vessel', 'samarra', 'halaf'] },
  { id: 'pottery2', src: pottery2, keywords: ['pottery', 'ceramic', 'clay', 'bowl', 'painted'] },
];

export default function Reader() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [selectedText, setSelectedText] = useState("");
  const [selectionRect, setSelectionRect] = useState<{ top: number; left: number; width: number } | null>(null);
  
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<typeof MOCK_IMAGES>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [savedImages, setSavedImages] = useState<typeof MOCK_IMAGES>([]);
  const [activeTab, setActiveTab] = useState<'search' | 'saved'>('search');

  const contentRef = useRef<HTMLDivElement>(null);

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

  // Listen for selection changes
  useEffect(() => {
    document.addEventListener("selectionchange", handleSelection);
    return () => document.removeEventListener("selectionchange", handleSelection);
  }, []);

  const handleSearch = () => {
    if (!selectedText) return;
    
    setSearchQuery(selectedText);
    setIsSearching(true);
    setIsSidebarOpen(true);
    setActiveTab('search');
    
    // Simulate network request
    setTimeout(() => {
      const query = selectedText.toLowerCase();
      
      // Super basic mock search logic
      const results = MOCK_IMAGES.filter(img => 
        img.keywords.some(kw => query.includes(kw))
      );
      
      // If no exact match, return some random ones just to show functionality
      setSearchResults(results.length > 0 ? results : MOCK_IMAGES.slice(0, 4));
      setIsSearching(false);
      
      // Clear selection so the popover goes away
      window.getSelection()?.removeAllRanges();
    }, 800);
  };

  const handleSaveImage = (image: typeof MOCK_IMAGES[0]) => {
    if (!savedImages.find(img => img.id === image.id)) {
      setSavedImages(prev => [...prev, image]);
      toast({
        title: "Image Saved",
        description: "Added to your collection.",
        duration: 2000,
      });
    }
  };

  const handleRemoveSaved = (id: string) => {
    setSavedImages(prev => prev.filter(img => img.id !== id));
  };

  return (
    <div className="relative w-screen h-screen bg-background text-foreground flex overflow-hidden">
      
      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'pr-[400px]' : ''}`}>
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/")} className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-serif font-bold">Seven Geometric Primitives</h1>
              <p className="text-xs text-muted-foreground font-sans uppercase tracking-wider">Ancient Mesopotamian Material Culture</p>
            </div>
          </div>
          
          <Button 
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

              <h3 className="text-xl mt-10 mb-4 text-primary">Part B — Material culture inventory</h3>

              <p className="mb-6 leading-relaxed">
                <strong>B1. Ceramics.</strong> Dot patterns constitute one of the oldest decorative vocabularies on Near Eastern pottery. Samarra ware (c. 5500–4800 BCE, Tell es-Sawwan) features geometric dot arrangements on dark-fired backgrounds. Halaf pottery (c. 6100–5100 BCE) from Tell Arpachiyah and Tell Halaf introduced the <strong>dot-circle motif</strong> as a standard element by the Late Halaf phase (c. 4900–4500 BCE), alongside white-on-dark dot compositions on eggshell-thin bowls.
              </p>

              <p className="mb-6 leading-relaxed">
                <strong>B2. Cylinder seals and stamp seals.</strong> The <strong>drill-dot technique</strong> is fundamental to seal engraving. Halaf stamp seals (mid-6th millennium BCE) are the earliest personal property markers in the Near East, featuring geometric patterns including dot arrangements. Cylinder seals (invented c. 3500 BCE at Uruk) extensively use drilled dots as filler between figures, as border elements, and as compositional spacing devices.
              </p>
              
              <p className="mb-6 leading-relaxed">
                <strong>B4. Architecture.</strong> The <strong>cone mosaic</strong> is the dot's most spectacular architectural expression. At the Eanna Precinct in Uruk (c. 3500–3000 BCE), thousands of baked clay cones (~10 cm long) with flat circular ends painted black, red, or white were pressed pointed-end-first into wet mud plaster, creating geometric patterns of colored dots across walls and columns. Each cone tip functions as one dot in a massive architectural pointillist composition.
              </p>

              <div className="h-20" /> {/* Spacer */}
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Floating Action Button for Selection */}
      <AnimatePresence>
        {selectionRect && selectedText && !isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed z-50 shadow-2xl"
            style={{
              top: selectionRect.top - 60, // Above selection
              left: selectionRect.left + (selectionRect.width / 2) - 80, // Center
            }}
          >
            <div className="bg-popover border border-border shadow-xl rounded-full p-1.5 flex items-center gap-1 backdrop-blur-md">
              <span className="text-xs font-medium px-3 truncate max-w-[150px] text-muted-foreground">
                "{selectedText}"
              </span>
              <div className="w-[1px] h-4 bg-border mx-1" />
              <Button 
                size="sm" 
                className="rounded-full h-8 px-4 font-semibold shadow-md bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                onClick={handleSearch}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                Find Images
              </Button>
            </div>
            
            {/* Pointer triangle */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-popover border-b border-r border-border rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right Sidebar - Image Search & Saved */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 w-[400px] h-full bg-card border-l border-border shadow-2xl z-40 flex flex-col"
          >
            <div className="p-4 border-b border-border flex items-center justify-between bg-background/50 backdrop-blur-sm sticky top-0 z-10">
              <div className="flex gap-1 bg-muted p-1 rounded-lg">
                <Button 
                  variant={activeTab === 'search' ? 'secondary' : 'ghost'} 
                  size="sm" 
                  className={`rounded-md px-4 ${activeTab === 'search' ? 'shadow-sm bg-background text-foreground' : 'text-muted-foreground'}`}
                  onClick={() => setActiveTab('search')}
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
                <Button 
                  variant={activeTab === 'saved' ? 'secondary' : 'ghost'} 
                  size="sm" 
                  className={`rounded-md px-4 ${activeTab === 'saved' ? 'shadow-sm bg-background text-foreground' : 'text-muted-foreground'}`}
                  onClick={() => setActiveTab('saved')}
                >
                  <Bookmark className="w-4 h-4 mr-2" />
                  Saved ({savedImages.length})
                </Button>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setIsSidebarOpen(false)}>
                <X className="w-5 h-5 text-muted-foreground" />
              </Button>
            </div>

            <ScrollArea className="flex-1 p-4 bg-background/30">
              {activeTab === 'search' && (
                <div className="space-y-6 pb-20">
                  {searchQuery && (
                    <div className="bg-muted/50 p-4 rounded-xl border border-border">
                      <p className="text-sm text-muted-foreground mb-1">Results for text:</p>
                      <p className="text-base font-medium italic">"{searchQuery}"</p>
                    </div>
                  )}

                  {isSearching ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="rounded-xl border border-border overflow-hidden bg-card animate-pulse">
                          <div className="aspect-video bg-muted w-full" />
                          <div className="p-3">
                            <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                            <div className="h-8 bg-muted rounded w-full" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="space-y-6">
                      {searchResults.map((img, idx) => {
                        const isSaved = savedImages.some(saved => saved.id === img.id);
                        return (
                          <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            key={img.id} 
                            className="group rounded-xl border border-border overflow-hidden bg-card hover:border-primary/50 transition-colors shadow-sm"
                          >
                            <div className="aspect-[4/3] w-full relative overflow-hidden bg-muted">
                              <img src={img.src} alt={img.keywords.join(', ')} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                <div className="flex gap-2 w-full">
                                  <Button 
                                    className={`flex-1 ${isSaved ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
                                    variant={isSaved ? 'default' : 'default'}
                                    onClick={() => isSaved ? handleRemoveSaved(img.id) : handleSaveImage(img)}
                                  >
                                    {isSaved ? (
                                      <><Check className="w-4 h-4 mr-2" /> Saved</>
                                    ) : (
                                      <><Bookmark className="w-4 h-4 mr-2" /> Save to Collection</>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </div>
                            <div className="p-3 bg-card border-t border-border">
                              <div className="flex flex-wrap gap-1">
                                {img.keywords.slice(0, 3).map(kw => (
                                  <span key={kw} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full capitalize">
                                    {kw}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-20">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-muted-foreground opacity-50" />
                      </div>
                      <h3 className="text-lg font-medium text-foreground mb-2">No images found</h3>
                      <p className="text-muted-foreground text-sm">Try selecting different text to search.</p>
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
                    <div className="grid grid-cols-2 gap-3">
                      {savedImages.map((img, idx) => (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          key={img.id} 
                          className="group relative rounded-lg border border-border overflow-hidden bg-card shadow-sm"
                        >
                          <div className="aspect-square w-full">
                            <img src={img.src} alt={img.keywords[0]} className="w-full h-full object-cover" />
                          </div>
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                            <div className="flex justify-end">
                              <Button 
                                size="icon" 
                                variant="destructive" 
                                className="w-7 h-7 rounded-full"
                                onClick={() => handleRemoveSaved(img.id)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                            <Button size="sm" variant="secondary" className="w-full text-xs h-8">
                              <Download className="w-3 h-3 mr-1" /> Export
                            </Button>
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