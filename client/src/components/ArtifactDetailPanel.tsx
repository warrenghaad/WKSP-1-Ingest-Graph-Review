import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Artifact } from "@/lib/artifacts";
import { LESSON_SECTIONS, averageVectors } from "@/lib/magicFramework";
import MAGICRadar, { MAGICBar } from "@/components/MAGICRadar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Search, BookOpen, ExternalLink, Hexagon,
  Calendar, MapPin, Tag,
  Fingerprint, X, Triangle,
} from "lucide-react";

interface ArtifactDetailPanelProps {
  artifact: Artifact | null;
  onClose: () => void;
}

export default function ArtifactDetailPanel({ artifact, onClose }: ArtifactDetailPanelProps) {
  const [, navigate] = useLocation();

  const selectedVector = artifact?.magic
    ? artifact.magic.primaryVector ||
      (artifact.magic.sectionRoles.length > 0
        ? averageVectors(LESSON_SECTIONS.filter(s => artifact.magic!.sectionRoles.includes(s.id)).map(s => s.vector))
        : { M: 0.5, A: 0.5, G: 0.5, I: 0.5, C: 0.5 })
    : null;

  return (
    <AnimatePresence>
      {artifact && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
          data-testid="overlay-artifact-detail"
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
                  onClick={onClose}
                  className="text-white/50 hover:text-white hover:bg-white/5 rounded-full px-3 h-8"
                >
                  <X className="w-4 h-4 mr-1.5" /> Close
                </Button>
                <div className="flex gap-2 items-center">
                  {artifact.museumUrl && (
                    <a href={artifact.museumUrl} target="_blank" rel="noopener noreferrer"
                      className="text-[10px] text-blue-400/60 hover:text-blue-400 flex items-center gap-1"
                      data-testid="link-museum">
                      <ExternalLink className="w-3 h-3" /> Museum
                    </a>
                  )}
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/[0.06] text-white/40 font-mono flex items-center gap-1">
                    <Fingerprint className="w-3 h-3 text-amber-400/60" /> {artifact.id}
                  </span>
                </div>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-6 space-y-6">
                  <div>
                    <div className="flex gap-1.5 mb-3 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-400/10 text-amber-300 border border-amber-400/20 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {Math.abs(artifact.year)} {artifact.year < 0 ? "BCE" : "CE"}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-white/50 border border-white/[0.06] flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {artifact.location}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-white/50 border border-white/[0.06] flex items-center gap-1">
                        <Tag className="w-3 h-3" /> {artifact.category}
                      </span>
                    </div>
                    <h2 className="text-2xl font-serif font-medium text-white mb-3 leading-tight" data-testid="text-detail-name">{artifact.name}</h2>
                    <div className="relative rounded-xl overflow-hidden mb-4 border border-white/[0.06]">
                      <img src={artifact.image} alt={artifact.name} className="w-full h-48 object-cover" data-testid={`img-artifact-${artifact.id}`} />
                      <span className="absolute bottom-2 right-2 text-[9px] text-white/40 bg-black/60 px-2 py-0.5 rounded">
                        Discovered {artifact.discoveryYear}
                      </span>
                    </div>
                    <p className="text-sm text-white/50 leading-relaxed border-l-2 border-amber-400/30 pl-4">
                      {artifact.description}
                    </p>
                  </div>

                  {artifact.magic && (
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
                        {artifact.magic.sectionRoles.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[10px] text-white/30 uppercase tracking-wider">Lesson Sections</span>
                            <div className="flex gap-1 flex-wrap">
                              {artifact.magic.sectionRoles.map((role) => {
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
                        {artifact.magic.gea && artifact.magic.gea.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[10px] text-white/30 uppercase tracking-wider">GEA (Atomic Elements)</span>
                            <div className="flex gap-1 flex-wrap">
                              {artifact.magic.gea.map(t => (
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
                      <BookOpen className="w-4 h-4 text-amber-400" /> Research ({artifact.research.length})
                    </h3>
                    <div className="space-y-2">
                      {artifact.research.map((paper) => (
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

                  <div className="flex gap-2 flex-wrap">
                    <Button data-testid="button-open-in-lab" size="sm" className="flex-1 gap-1.5 bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/20 rounded-lg"
                      onClick={() => navigate(`/lab?q=${encodeURIComponent(artifact.name)}`)}>
                      <Search className="w-3.5 h-3.5" /> Search in Lab
                    </Button>
                    <Button data-testid="button-open-reader" size="sm" variant="outline" className="flex-1 gap-1.5 border-white/10 text-white/60 hover:text-white rounded-lg"
                      onClick={() => navigate("/reader")}>
                      <BookOpen className="w-3.5 h-3.5" /> Open Reader
                    </Button>
                    {artifact.magic && (
                      <Button data-testid="button-view-tetrahedron" size="sm" variant="outline" className="flex-1 gap-1.5 border-purple-400/20 bg-purple-400/10 text-purple-300 hover:bg-purple-400/20 rounded-lg"
                        onClick={() => navigate(`/node/${artifact.id}`)}>
                        <Triangle className="w-3.5 h-3.5" /> View Tetrahedron
                      </Button>
                    )}
                  </div>
                </div>
              </ScrollArea>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
