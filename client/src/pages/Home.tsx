import { useState, useEffect, Component, type ReactNode, type ErrorInfo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import Timeline3D from "@/components/Timeline3D";

function checkWebGLSupport(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    return gl != null;
  } catch {
    return false;
  }
}

function WebGLFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-[#030308]">
      <div className="text-center space-y-3 p-8">
        <div className="text-4xl">🏛️</div>
        <h3 className="text-lg font-serif text-white/70">3D Timeline Unavailable</h3>
        <p className="text-sm text-white/40 max-w-xs">WebGL context could not be created. The timeline requires GPU acceleration.</p>
      </div>
    </div>
  );
}

class WebGLErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.warn("WebGL unavailable:", error.message); }
  render() {
    if (this.state.hasError) {
      return <WebGLFallback />;
    }
    return this.props.children;
  }
}
import LessonArc from "@/components/LessonArc";
import MAGICRadar, { MAGICBar } from "@/components/MAGICRadar";
import { Artifact, artifacts, ERAS, CATEGORIES } from "@/lib/artifacts";
import { LESSON_SECTIONS, MAGIC_LABELS, averageVectors } from "@/lib/magicFramework";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Search,
  Database,
  Fingerprint,
  BookOpen,
  ExternalLink,
  Layers,
  Filter,
  MapPin,
  Calendar,
  Tag,
  Hexagon,
  FileText,
} from "lucide-react";
import { Input } from "@/components/ui/input";

type ViewMode = "timeline" | "magic";

export default function Home() {
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterEra, setFilterEra] = useState<string | null>(null);
  const [filterSection, setFilterSectionRaw] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("timeline");
  const [, navigate] = useLocation();
  const [webglSupported] = useState(() => checkWebGLSupport());

  const setFilterSection = (id: string | null) => {
    setFilterSectionRaw(id);
  };

  const filteredCount = artifacts.filter((a) => {
    if (filterCategory && a.category !== filterCategory) return false;
    if (filterEra && a.era !== filterEra) return false;
    if (filterSection && !a.magic?.sectionRoles.includes(filterSection)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        a.name.toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q)
      );
    }
    return true;
  }).length;

  const activeFilters = [filterCategory, filterEra, filterSection].filter(Boolean).length;

  const selectedSectionData = selectedArtifact?.magic?.sectionRoles
    ? LESSON_SECTIONS.filter((s) => selectedArtifact.magic?.sectionRoles.includes(s.id))
    : [];

  const artifactVector = selectedArtifact?.magic
    ? selectedArtifact.magic.primaryVector ||
      (selectedSectionData.length > 0
        ? averageVectors(selectedSectionData.map((s) => s.vector))
        : { M: 0.5, A: 0.5, G: 0.5, I: 0.5, C: 0.5 })
    : null;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background text-foreground selection:bg-primary/30">
      <div className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing">
        {webglSupported ? (
          <WebGLErrorBoundary>
            <Timeline3D
              onSelectArtifact={setSelectedArtifact}
              selectedId={selectedArtifact?.id || null}
              filterCategory={filterCategory}
              filterEra={filterEra}
              searchQuery={searchQuery}
              filterSection={filterSection}
            />
          </WebGLErrorBoundary>
        ) : (
          <WebGLFallback />
        )}
      </div>

      <header className="absolute top-0 left-0 right-0 z-20 p-4 md:p-6 flex justify-between items-start pointer-events-none">
        <div className="pointer-events-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/50 flex items-center justify-center backdrop-blur-md">
              <Database className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold tracking-tight text-white m-0 leading-none drop-shadow-md">
                CHRONOS
              </h1>
              <p className="text-[10px] text-primary/70 uppercase tracking-[0.2em] font-sans font-medium mt-0.5">
                MAGIC Framework · Mesopotamian Research
              </p>
            </div>
          </motion.div>
        </div>

        <div className="pointer-events-auto flex gap-2 items-center">
          <div className="flex bg-black/40 backdrop-blur-md rounded-full border border-white/10 p-0.5">
            <button
              data-testid="button-view-timeline"
              className={`text-xs px-3 py-1.5 rounded-full transition-all ${viewMode === "timeline" ? "bg-primary/20 text-primary" : "text-white/50 hover:text-white/80"}`}
              onClick={() => setViewMode("timeline")}
            >
              Timeline
            </button>
            <button
              data-testid="button-view-magic"
              className={`text-xs px-3 py-1.5 rounded-full transition-all flex items-center gap-1 ${viewMode === "magic" ? "bg-primary/20 text-primary" : "text-white/50 hover:text-white/80"}`}
              onClick={() => setViewMode("magic")}
            >
              <Hexagon className="w-3 h-3" />
              MAGIC
            </button>
          </div>
          <Button
            data-testid="button-nav-braid"
            variant="outline"
            size="sm"
            className="rounded-full border-white/10 bg-black/40 backdrop-blur-md text-white hover:bg-white/10 h-9"
            onClick={() => navigate("/braid")}
          >
            <Hexagon className="w-3.5 h-3.5 mr-1.5" />
            Braid
          </Button>
          <Button
            data-testid="button-nav-reader"
            variant="outline"
            size="sm"
            className="rounded-full border-white/10 bg-black/40 backdrop-blur-md text-white hover:bg-white/10 h-9"
            onClick={() => navigate("/reader")}
          >
            <BookOpen className="w-3.5 h-3.5 mr-1.5" />
            Reader
          </Button>
          <Button
            data-testid="button-nav-lab"
            variant="outline"
            size="sm"
            className="rounded-full border-white/10 bg-black/40 backdrop-blur-md text-white hover:bg-white/10 h-9"
            onClick={() => navigate("/lab")}
          >
            <Layers className="w-3.5 h-3.5 mr-1.5" />
            Lab
          </Button>
          <Button
            data-testid="button-nav-textreader"
            variant="outline"
            size="sm"
            className="rounded-full border-white/10 bg-black/40 backdrop-blur-md text-white hover:bg-white/10 h-9"
            onClick={() => navigate("/textreader")}
          >
            <FileText className="w-3.5 h-3.5 mr-1.5" />
            Textreader
          </Button>
          <Button
            data-testid="button-toggle-filters"
            variant="outline"
            size="sm"
            className={`rounded-full border-white/10 bg-black/40 backdrop-blur-md text-white hover:bg-white/10 h-9 relative ${showFilters ? "border-primary/50" : ""}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-3.5 h-3.5 mr-1.5" />
            Filters
            {activeFilters > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-[10px] font-bold text-black rounded-full flex items-center justify-center">
                {activeFilters}
              </span>
            )}
          </Button>
        </div>
      </header>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-[70px] right-4 md:right-6 z-30 w-[340px] pointer-events-auto"
          >
            <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <span className="text-sm font-medium text-white">Filter Timeline</span>
                {activeFilters > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-primary hover:text-primary/80"
                    onClick={() => {
                      setFilterCategory(null);
                      setFilterEra(null);
                      setFilterSection(null);
                    }}
                  >
                    Clear all
                  </Button>
                )}
              </div>

              <div className="p-4 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    data-testid="input-timeline-search"
                    placeholder="Search artifacts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-9 text-sm rounded-lg"
                  />
                </div>

                <div>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2 font-medium">
                    Era
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {ERAS.map((era) => (
                      <button
                        key={era.id}
                        data-testid={`filter-era-${era.id}`}
                        className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                          filterEra === era.id
                            ? "border-primary bg-primary/20 text-primary"
                            : "border-white/10 text-white/50 hover:text-white/80 hover:border-white/20"
                        }`}
                        onClick={() => setFilterEra(filterEra === era.id ? null : era.id)}
                      >
                        {era.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2 font-medium">
                    Category
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {CATEGORIES.filter((c) => artifacts.some((a) => a.category === c.id)).map((cat) => (
                      <button
                        key={cat.id}
                        data-testid={`filter-category-${cat.id}`}
                        className={`text-[11px] px-2.5 py-1 rounded-full border transition-all flex items-center gap-1 ${
                          filterCategory === cat.id
                            ? "border-primary bg-primary/20 text-primary"
                            : "border-white/10 text-white/50 hover:text-white/80 hover:border-white/20"
                        }`}
                        onClick={() => setFilterCategory(filterCategory === cat.id ? null : cat.id)}
                      >
                        <span>{cat.icon}</span>
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2 font-medium">
                    Lesson Section
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {LESSON_SECTIONS.map((s) => (
                      <button
                        key={s.id}
                        data-testid={`filter-section-${s.id}`}
                        className={`text-[10px] px-2 py-0.5 rounded border transition-all font-mono ${
                          filterSection === s.id
                            ? "border-primary bg-primary/20 text-primary"
                            : s.day === "A"
                              ? "border-amber-500/20 text-amber-500/50 hover:text-amber-400 hover:border-amber-500/40"
                              : "border-blue-500/20 text-blue-500/50 hover:text-blue-400 hover:border-blue-500/40"
                        }`}
                        onClick={() => setFilterSection(filterSection === s.id ? null : s.id)}
                      >
                        {s.id}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-white/30 pt-1">
                  {filteredCount} of {artifacts.length} artifacts
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewMode === "magic" && !selectedArtifact && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute top-[70px] left-4 md:left-6 z-20 w-[420px] max-h-[calc(100vh-100px)] pointer-events-auto overflow-auto"
          >
            <LessonArc
              selectedSection={filterSection}
              onSelectSection={(id) => {
                setFilterSection(id);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedArtifact && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ type: "spring", damping: 30, stiffness: 200 }}
            className="absolute top-0 right-0 w-full max-w-lg h-full z-30 pointer-events-auto"
          >
            <div className="h-full border-l border-white/10 bg-black/80 backdrop-blur-2xl flex flex-col shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

              <div className="p-4 border-b border-white/10 flex justify-between items-center relative z-10">
                <Button
                  data-testid="button-close-detail"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedArtifact(null)}
                  className="text-muted-foreground hover:text-white hover:bg-white/5 rounded-full px-4 h-9"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Return
                </Button>
                <div className="flex gap-2 items-center">
                  {selectedArtifact.museumUrl && (
                    <a
                      href={selectedArtifact.museumUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-blue-400/60 hover:text-blue-400 flex items-center gap-1 transition-colors"
                      data-testid="link-museum"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Met #{selectedArtifact.museumId}
                    </a>
                  )}
                  <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-[10px] font-mono flex items-center">
                    <Fingerprint className="w-3 h-3 mr-1.5 text-primary" />
                    {selectedArtifact.id}
                  </div>
                </div>
              </div>

              <ScrollArea className="flex-1 relative z-10">
                <div className="px-6 py-6 space-y-8 pb-12">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded bg-primary text-black text-[11px] font-bold tracking-wider flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {Math.abs(selectedArtifact.year)} {selectedArtifact.year < 0 ? "BCE" : "CE"}
                      </span>
                      <span className="px-2.5 py-0.5 rounded bg-white/5 border border-white/10 text-white/50 text-[11px] flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {selectedArtifact.location}
                      </span>
                      <span className="px-2.5 py-0.5 rounded bg-white/5 border border-white/10 text-white/50 text-[11px] flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {selectedArtifact.category}
                      </span>
                    </div>

                    <h2 className="text-3xl font-serif font-medium text-white mb-4 leading-tight tracking-tight">
                      {selectedArtifact.name}
                    </h2>

                    <div className="relative rounded-xl overflow-hidden mb-4 border border-white/10">
                      <img
                        src={selectedArtifact.image}
                        alt={selectedArtifact.name}
                        className="w-full h-48 object-cover"
                        data-testid={`img-artifact-${selectedArtifact.id}`}
                      />
                      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
                      <span className="absolute bottom-2 right-2 text-[10px] text-white/40 bg-black/50 px-2 py-0.5 rounded">
                        Discovered {selectedArtifact.discoveryYear}
                      </span>
                    </div>

                    <p className="text-white/60 leading-relaxed text-sm border-l-2 border-primary/50 pl-4">
                      {selectedArtifact.description}
                    </p>
                  </motion.div>

                  {selectedArtifact.magic && (
                    <>
                      <div className="h-[1px] w-full bg-gradient-to-r from-primary/30 via-primary/10 to-transparent" />

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.15 }}
                        className="space-y-4"
                      >
                        <div className="flex items-center gap-2">
                          <Hexagon className="w-4 h-4 text-primary" />
                          <h3 className="text-lg font-serif text-white">MAGIC Profile</h3>
                        </div>

                        {artifactVector && (
                          <div className="flex gap-4">
                            <div className="flex-shrink-0">
                              <MAGICRadar
                                vector={artifactVector}
                                size={130}
                                showLabels
                                animated
                              />
                            </div>
                            <div className="flex-1 space-y-3">
                              <MAGICBar vector={artifactVector} />
                            </div>
                          </div>
                        )}

                        <div className="space-y-2">
                          <span className="text-[10px] text-white/40 uppercase tracking-wider">
                            Lesson Section Roles
                          </span>
                          <div className="flex gap-1.5 flex-wrap">
                            {selectedArtifact.magic.sectionRoles.map((role) => {
                              const sectionData = LESSON_SECTIONS.find((s) => s.id === role);
                              const isA = role.startsWith("A");
                              return (
                                <button
                                  key={role}
                                  data-testid={`section-role-${role}`}
                                  className={`text-[10px] px-2.5 py-1 rounded border transition-all ${
                                    isA
                                      ? "border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                                      : "border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                                  }`}
                                  title={sectionData?.title}
                                >
                                  <span className="font-mono font-bold">{role}</span>
                                  {sectionData && (
                                    <span className="ml-1 opacity-60">{sectionData.operation}</span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {selectedArtifact.magic.gea && selectedArtifact.magic.gea.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[10px] text-white/40 uppercase tracking-wider">
                              GEA (Atomic Elements)
                            </span>
                            <div className="flex gap-1 flex-wrap">
                              {selectedArtifact.magic.gea.map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[9px] px-2 py-0.5 rounded bg-green-500/5 text-green-400/70 border border-green-500/10"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedArtifact.magic.gem && selectedArtifact.magic.gem.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[10px] text-white/40 uppercase tracking-wider">
                              GEM (Molecular Compositions)
                            </span>
                            <div className="flex gap-1 flex-wrap">
                              {selectedArtifact.magic.gem.map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[9px] px-2 py-0.5 rounded bg-purple-500/5 text-purple-400/70 border border-purple-500/10"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedArtifact.magic.gecd && (
                          <div className="space-y-1.5">
                            <span className="text-[10px] text-white/40 uppercase tracking-wider">
                              E×C×D Specification
                            </span>
                            <p className="text-[11px] text-white/50 bg-white/[0.03] border border-white/10 rounded-lg p-3 font-mono leading-relaxed">
                              {selectedArtifact.magic.gecd}
                            </p>
                          </div>
                        )}

                        {selectedArtifact.magic.keywordTags && selectedArtifact.magic.keywordTags.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[10px] text-white/40 uppercase tracking-wider">
                              RWI Tags
                            </span>
                            <div className="flex gap-1 flex-wrap">
                              {selectedArtifact.magic.keywordTags.map((tag) => {
                                const prefix = tag.split("_")[0];
                                const colorMap: Record<string, string> = {
                                  m: MAGIC_LABELS.M.color,
                                  a: MAGIC_LABELS.A.color,
                                  g: MAGIC_LABELS.G.color,
                                  i: MAGIC_LABELS.I.color,
                                  c: MAGIC_LABELS.C.color,
                                };
                                const color = colorMap[prefix] || "#888";
                                return (
                                  <span
                                    key={tag}
                                    className="text-[9px] px-1.5 py-0.5 rounded border"
                                    style={{
                                      color: color,
                                      borderColor: color + "30",
                                      backgroundColor: color + "08",
                                    }}
                                  >
                                    {tag}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </>
                  )}

                  <div className="h-[1px] w-full bg-gradient-to-r from-white/20 via-white/10 to-transparent" />

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-serif text-white flex items-center">
                        <BookOpen className="w-4 h-4 mr-2 text-primary" />
                        Research ({selectedArtifact.research.length})
                      </h3>
                      <div className="flex items-center text-green-400 text-[10px] font-mono bg-green-400/10 px-2.5 py-1 rounded-full border border-green-400/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5" />
                        INDEXED
                      </div>
                    </div>

                    <div className="space-y-3">
                      {selectedArtifact.research.map((paper, idx) => (
                        <motion.div
                          key={paper.id}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + idx * 0.1 }}
                          className="group relative bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] rounded-xl p-5 transition-all duration-300 hover:border-primary/30"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] text-primary font-mono tracking-wider bg-primary/10 px-2 py-0.5 rounded">
                              {new Date(paper.date).getFullYear()}
                            </span>
                            <span className="text-[10px] text-white/40 max-w-[45%] text-right">
                              {paper.author}
                            </span>
                          </div>
                          <h4 className="text-sm font-serif font-medium text-white mb-2 leading-snug group-hover:text-primary transition-colors">
                            {paper.title}
                          </h4>
                          <p className="text-xs text-white/50 leading-relaxed">
                            {paper.summary}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  <div className="flex gap-2">
                    <Button
                      data-testid="button-search-lab"
                      size="sm"
                      className="flex-1 gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg"
                      onClick={() => navigate(`/lab?q=${encodeURIComponent(selectedArtifact.name)}`)}
                    >
                      <Search className="w-3.5 h-3.5" />
                      Search in Lab
                    </Button>
                    <Button
                      data-testid="button-read-docs"
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-1.5 border-white/10 text-white/70 hover:text-white rounded-lg"
                      onClick={() => navigate("/reader")}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      Open Reader
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!selectedArtifact && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none w-full max-w-md px-6"
          >
            <div className="px-6 py-3 rounded-xl flex flex-col items-center gap-2 bg-black/50 backdrop-blur-xl border border-white/10">
              <div className="flex items-center gap-5 w-full justify-center">
                <span className="text-xs text-white/60 font-medium">Scroll to zoom</span>
                <div className="w-1 h-1 bg-primary rounded-full" />
                <span className="text-xs text-white/60 font-medium">Drag to pan</span>
                <div className="w-1 h-1 bg-primary rounded-full" />
                <span className="text-xs text-white/60 font-medium">Click to inspect</span>
              </div>
              <div className="text-[10px] text-white/30 font-mono">
                {artifacts.length} artifacts · 6500 BCE — 331 BCE · MAGIC Framework
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
