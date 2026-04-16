import { useState, useMemo, lazy, Suspense, Component, type ReactNode, type ErrorInfo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Artifact, artifacts, ERAS, CATEGORIES } from "@/lib/artifacts";
import { LESSON_SECTIONS, MAGIC_LABELS, averageVectors } from "@/lib/magicFramework";
import MAGICRadar, { MAGICBar } from "@/components/MAGICRadar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, Database, BookOpen, ExternalLink, Hexagon, FileText,
  ArrowLeft, ArrowRight, Calendar, MapPin, Tag, Filter, Layers,
  Fingerprint, X, Globe, Calculator, Compass,
} from "lucide-react";

const Timeline3D = lazy(() => import("@/components/Timeline3D"));

function checkWebGLSupport(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl") || c.getContext("experimental-webgl"));
  } catch { return false; }
}

class WebGLErrorBoundary extends Component<{ children: ReactNode; onError: () => void }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error, _info: ErrorInfo) {
    console.warn("WebGL error:", error.message);
    this.props.onError();
  }
  render() { return this.state.hasError ? null : this.props.children; }
}

const TOOLS = [
  { href: "/textreader", icon: FileText, label: "Textreader", sub: "Ingest & extract concepts from research texts", color: "#f59e0b" },
  { href: "/braid", icon: Hexagon, label: "MAGIC Braid", sub: "2D SVG braid — five MAGIC ribbons over time", color: "#34d399" },
  { href: "/timeline", icon: Layers, label: "3D Timeline", sub: "R3F braided Sankey through Mesopotamian history", color: "#60a5fa" },
  { href: "/gea", icon: Calculator, label: "GEA Calculator", sub: "Construction grammar calculator for geometric analysis", color: "#c084fc" },
  { href: "/ontology", icon: Compass, label: "Ontology Explorer", sub: "Geometric elements, deities, materials, patterns", color: "#f472b6" },
  { href: "/reader", icon: BookOpen, label: "Reader", sub: "Artifact reader with research papers", color: "#fb923c" },
] as const;

export default function Home() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterEra, setFilterEra] = useState<string | null>(null);
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);
  const [show3D, setShow3D] = useState(false);
  const [webglFailed, setWebglFailed] = useState(false);
  const webglSupported = useMemo(() => checkWebGLSupport(), []);

  const filtered = useMemo(() => {
    return artifacts.filter((a) => {
      if (filterCategory && a.category !== filterCategory) return false;
      if (filterEra && a.era !== filterEra) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return a.name.toLowerCase().includes(q) || a.location.toLowerCase().includes(q) || a.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [searchQuery, filterCategory, filterEra]);

  const selectedVector = selectedArtifact?.magic
    ? selectedArtifact.magic.primaryVector ||
      (selectedArtifact.magic.sectionRoles.length > 0
        ? averageVectors(LESSON_SECTIONS.filter(s => selectedArtifact.magic!.sectionRoles.includes(s.id)).map(s => s.vector))
        : { M: 0.5, A: 0.5, G: 0.5, I: 0.5, C: 0.5 })
    : null;

  if (show3D && webglSupported && !webglFailed) {
    return (
      <div className="relative w-screen h-screen overflow-hidden bg-[#030308]">
        <div className="absolute inset-0 z-10">
          <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-white/40">Loading 3D…</div>}>
            <WebGLErrorBoundary onError={() => { setWebglFailed(true); setShow3D(false); }}>
              <Timeline3D
                onSelectArtifact={setSelectedArtifact}
                selectedId={selectedArtifact?.id || null}
                filterCategory={filterCategory}
                filterEra={filterEra}
                searchQuery={searchQuery}
                filterSection={null}
              />
            </WebGLErrorBoundary>
          </Suspense>
        </div>
        <div className="absolute top-4 left-4 z-20">
          <Button
            data-testid="button-exit-3d"
            variant="outline"
            size="sm"
            className="rounded-full border-white/20 bg-black/60 backdrop-blur text-white hover:bg-white/10"
            onClick={() => setShow3D(false)}
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Chronos
          </Button>
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
          <div className="px-5 py-2.5 rounded-xl bg-black/60 backdrop-blur border border-white/10 flex items-center gap-4 text-xs text-white/50">
            <span>Scroll to zoom</span>
            <span className="w-1 h-1 bg-amber-400 rounded-full" />
            <span>Drag to pan</span>
            <span className="w-1 h-1 bg-amber-400 rounded-full" />
            <span>Click to inspect</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060912] text-white">
      {/* ── Hero ──────────────────────────────────────────── */}
      <header className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 via-transparent to-blue-900/10" />
        <div className="relative max-w-6xl mx-auto px-6 py-12 md:py-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                  <Database className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h1 data-testid="text-app-title" className="text-3xl md:text-4xl font-serif font-bold tracking-tight leading-none">
                    CHRONOS
                  </h1>
                  <p className="text-[11px] text-amber-400/70 uppercase tracking-[0.25em] font-medium mt-0.5">
                    MAGIC Framework · Mesopotamian Research
                  </p>
                </div>
              </div>
              <p className="text-sm text-white/50 max-w-lg leading-relaxed mt-2">
                Math · Art · Geometric/META · Ideology · Comptroller — five dimensions scoring every artifact from 0 to 1. Explore 6,500 years of Mesopotamian civilization through the MAGIC lens.
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {webglSupported && !webglFailed && (
                <Button
                  data-testid="button-launch-3d"
                  size="sm"
                  className="rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 h-9"
                  onClick={() => setShow3D(true)}
                >
                  <Globe className="w-3.5 h-3.5 mr-1.5" /> Launch 3D Timeline
                </Button>
              )}
              <Button
                data-testid="button-nav-braid-hero"
                variant="outline"
                size="sm"
                className="rounded-lg border-white/10 text-white/70 hover:text-white h-9"
                onClick={() => navigate("/braid")}
              >
                <Hexagon className="w-3.5 h-3.5 mr-1.5" /> Braid
              </Button>
            </div>
          </motion.div>
        </div>
      </header>

      {/* ── Tools Grid ────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <h2 className="text-xs text-white/30 uppercase tracking-[0.2em] font-medium mb-5">Research Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {TOOLS.map((tool) => (
            <motion.button
              key={tool.href}
              data-testid={`card-tool-${tool.label.toLowerCase().replace(/\s+/g, "-")}`}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="text-left group rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] p-4 transition-all hover:border-white/10"
              onClick={() => navigate(tool.href)}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: tool.color + "15", border: `1px solid ${tool.color}30` }}>
                  <tool.icon className="w-4 h-4" style={{ color: tool.color }} />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white/90 group-hover:text-white transition-colors">{tool.label}</h3>
                  <p className="text-[11px] text-white/35 mt-0.5 leading-relaxed">{tool.sub}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* ── Artifact Browser ──────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xs text-white/30 uppercase tracking-[0.2em] font-medium">
            Artifact Collection <span className="text-white/20 ml-1">({filtered.length})</span>
          </h2>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
            <Input
              data-testid="input-artifact-search"
              placeholder="Search artifacts…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/25 h-9 text-sm rounded-lg"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {CATEGORIES.filter(c => artifacts.some(a => a.category === c.id)).map((cat) => (
              <button
                key={cat.id}
                data-testid={`filter-category-${cat.id}`}
                className={`text-[11px] px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1 ${
                  filterCategory === cat.id
                    ? "border-amber-400/40 bg-amber-400/10 text-amber-300"
                    : "border-white/[0.06] text-white/40 hover:text-white/60 hover:border-white/10"
                }`}
                onClick={() => setFilterCategory(filterCategory === cat.id ? null : cat.id)}
              >
                <span>{cat.icon}</span> {cat.label}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {ERAS.slice(0, 6).map((era) => (
              <button
                key={era.id}
                data-testid={`filter-era-${era.id}`}
                className={`text-[11px] px-2.5 py-1.5 rounded-lg border transition-all ${
                  filterEra === era.id
                    ? "border-amber-400/40 bg-amber-400/10 text-amber-300"
                    : "border-white/[0.06] text-white/40 hover:text-white/60 hover:border-white/10"
                }`}
                onClick={() => setFilterEra(filterEra === era.id ? null : era.id)}
              >
                {era.name}
              </button>
            ))}
            {filterEra && ERAS.findIndex(e => e.id === filterEra) >= 6 && (
              <span className="text-[11px] px-2.5 py-1.5 rounded-lg border border-amber-400/40 bg-amber-400/10 text-amber-300">
                {ERAS.find(e => e.id === filterEra)?.name}
              </span>
            )}
          </div>
        </div>

        {/* Artifact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((artifact, i) => (
            <motion.div
              key={artifact.id}
              data-testid={`card-artifact-${artifact.id}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.3) }}
              className="group rounded-xl border border-white/[0.06] bg-white/[0.015] hover:bg-white/[0.04] overflow-hidden cursor-pointer transition-all hover:border-white/10"
              onClick={() => setSelectedArtifact(artifact)}
            >
              <div className="relative h-36 overflow-hidden">
                <img src={artifact.image} alt={artifact.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#060912] via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2 flex gap-1">
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/60 backdrop-blur text-amber-300/80 border border-amber-400/20">
                    {Math.abs(artifact.year)} {artifact.year < 0 ? "BCE" : "CE"}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/60 backdrop-blur text-white/50 border border-white/10">
                    {artifact.category}
                  </span>
                </div>
              </div>
              <div className="p-3">
                <h3 className="text-sm font-medium text-white/90 leading-tight mb-1 group-hover:text-amber-200 transition-colors">
                  {artifact.name}
                </h3>
                <p className="text-[11px] text-white/30 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {artifact.location}
                </p>
                {artifact.magic?.primaryVector && (
                  <div className="flex gap-0.5 mt-2">
                    {(["M", "A", "G", "I", "C"] as const).map((k) => (
                      <div key={k} className="flex-1 h-1 rounded-full overflow-hidden bg-white/5">
                        <div className="h-full rounded-full" style={{
                          width: `${(artifact.magic!.primaryVector![k] ?? 0) * 100}%`,
                          backgroundColor: MAGIC_LABELS[k].color,
                        }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-white/25 text-sm">
            No artifacts match your filters.
          </div>
        )}
      </section>

      {/* ── Artifact Detail Panel ─────────────────────────── */}
      <AnimatePresence>
        {selectedArtifact && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedArtifact(null)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 250 }}
              className="absolute top-0 right-0 w-full max-w-lg h-full bg-[#0a0e18] border-l border-white/[0.06] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-full flex flex-col">
                <div className="p-4 border-b border-white/[0.06] flex justify-between items-center">
                  <Button
                    data-testid="button-close-detail"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedArtifact(null)}
                    className="text-white/50 hover:text-white hover:bg-white/5 rounded-full px-3 h-8"
                  >
                    <X className="w-4 h-4 mr-1.5" /> Close
                  </Button>
                  <div className="flex gap-2 items-center">
                    {selectedArtifact.museumUrl && (
                      <a href={selectedArtifact.museumUrl} target="_blank" rel="noopener noreferrer"
                        className="text-[10px] text-blue-400/60 hover:text-blue-400 flex items-center gap-1"
                        data-testid="link-museum">
                        <ExternalLink className="w-3 h-3" /> Museum
                      </a>
                    )}
                    <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/[0.06] text-white/40 font-mono flex items-center gap-1">
                      <Fingerprint className="w-3 h-3 text-amber-400/60" /> {selectedArtifact.id}
                    </span>
                  </div>
                </div>

                <ScrollArea className="flex-1">
                  <div className="p-6 space-y-6">
                    <div>
                      <div className="flex gap-1.5 mb-3 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-400/10 text-amber-300 border border-amber-400/20 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {Math.abs(selectedArtifact.year)} {selectedArtifact.year < 0 ? "BCE" : "CE"}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-white/50 border border-white/[0.06] flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {selectedArtifact.location}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-white/50 border border-white/[0.06] flex items-center gap-1">
                          <Tag className="w-3 h-3" /> {selectedArtifact.category}
                        </span>
                      </div>
                      <h2 className="text-2xl font-serif font-medium text-white mb-3 leading-tight">{selectedArtifact.name}</h2>
                      <div className="relative rounded-xl overflow-hidden mb-4 border border-white/[0.06]">
                        <img src={selectedArtifact.image} alt={selectedArtifact.name} className="w-full h-48 object-cover" data-testid={`img-artifact-${selectedArtifact.id}`} />
                        <span className="absolute bottom-2 right-2 text-[9px] text-white/40 bg-black/60 px-2 py-0.5 rounded">
                          Discovered {selectedArtifact.discoveryYear}
                        </span>
                      </div>
                      <p className="text-sm text-white/50 leading-relaxed border-l-2 border-amber-400/30 pl-4">
                        {selectedArtifact.description}
                      </p>
                    </div>

                    {selectedArtifact.magic && (
                      <>
                        <div className="h-px bg-gradient-to-r from-amber-400/20 to-transparent" />
                        <div className="space-y-4">
                          <h3 className="text-sm font-medium text-white/70 flex items-center gap-2">
                            <Hexagon className="w-4 h-4 text-amber-400" /> MAGIC Profile
                          </h3>
                          {selectedVector && (
                            <div className="flex gap-4">
                              <div className="flex-shrink-0">
                                <MAGICRadar vector={selectedVector} size={120} showLabels animated />
                              </div>
                              <div className="flex-1 space-y-3">
                                <MAGICBar vector={selectedVector} />
                              </div>
                            </div>
                          )}
                          {selectedArtifact.magic.sectionRoles.length > 0 && (
                            <div className="space-y-1.5">
                              <span className="text-[10px] text-white/30 uppercase tracking-wider">Lesson Sections</span>
                              <div className="flex gap-1 flex-wrap">
                                {selectedArtifact.magic.sectionRoles.map((role) => {
                                  const s = LESSON_SECTIONS.find(ls => ls.id === role);
                                  return (
                                    <span key={role} className={`text-[10px] px-2 py-0.5 rounded border ${
                                      role.startsWith("A") ? "border-amber-400/20 bg-amber-400/5 text-amber-300/70" : "border-blue-400/20 bg-blue-400/5 text-blue-300/70"
                                    }`}>
                                      <span className="font-mono font-bold">{role}</span>
                                      {s && <span className="ml-1 opacity-60">{s.operation}</span>}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          {selectedArtifact.magic.gea && selectedArtifact.magic.gea.length > 0 && (
                            <div className="space-y-1.5">
                              <span className="text-[10px] text-white/30 uppercase tracking-wider">GEA (Atomic Elements)</span>
                              <div className="flex gap-1 flex-wrap">
                                {selectedArtifact.magic.gea.map(t => (
                                  <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-green-500/5 text-green-400/60 border border-green-500/10">{t}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    <div className="h-px bg-gradient-to-r from-white/10 to-transparent" />

                    <div>
                      <h3 className="text-sm font-medium text-white/70 flex items-center gap-2 mb-3">
                        <BookOpen className="w-4 h-4 text-amber-400" /> Research ({selectedArtifact.research.length})
                      </h3>
                      <div className="space-y-2">
                        {selectedArtifact.research.map((paper) => (
                          <div key={paper.id} className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-3 hover:bg-white/[0.04] transition-colors">
                            <div className="flex justify-between text-[10px] text-white/30 mb-1">
                              <span className="font-mono text-amber-400/50">{new Date(paper.date).getFullYear()}</span>
                              <span>{paper.author}</span>
                            </div>
                            <h4 className="text-xs font-medium text-white/80 mb-1">{paper.title}</h4>
                            <p className="text-[11px] text-white/40 leading-relaxed">{paper.summary}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button data-testid="button-open-in-lab" size="sm" className="flex-1 gap-1.5 bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/20 rounded-lg"
                        onClick={() => navigate(`/lab?q=${encodeURIComponent(selectedArtifact.name)}`)}>
                        <Search className="w-3.5 h-3.5" /> Search in Lab
                      </Button>
                      <Button data-testid="button-open-reader" size="sm" variant="outline" className="flex-1 gap-1.5 border-white/10 text-white/60 hover:text-white rounded-lg"
                        onClick={() => navigate("/reader")}>
                        <BookOpen className="w-3.5 h-3.5" /> Open Reader
                      </Button>
                    </div>
                  </div>
                </ScrollArea>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.04] py-6 text-center">
        <p className="text-[10px] text-white/20 font-mono">
          {artifacts.length} artifacts · 6500 BCE — 331 BCE · MAGIC Framework · Chronos
        </p>
      </footer>
    </div>
  );
}
