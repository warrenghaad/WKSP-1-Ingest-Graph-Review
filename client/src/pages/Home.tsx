import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Timeline3D from "@/components/Timeline3D";
import { Artifact, artifacts } from "@/lib/artifacts";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChevronRight, ArrowLeft, Search, Database, Fingerprint, RefreshCw, BookOpen, ExternalLink, Layers } from "lucide-react";
import { Input } from "@/components/ui/input";
import bgAbstract from "@/assets/images/bg-abstract.png";

export default function Home() {
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Simulate scanning for new research
  useEffect(() => {
    if (selectedArtifact) {
      setIsScanning(true);
      const timer = setTimeout(() => {
        setIsScanning(false);
      }, 2500); // 2.5s scan simulation
      return () => clearTimeout(timer);
    }
  }, [selectedArtifact]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background text-foreground selection:bg-primary/30">
      {/* Background Texture Overlay */}
      <div 
        className="absolute inset-0 z-0 opacity-20 mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: `url(${bgAbstract})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      />
      
      {/* Noise Texture */}
      <div className="absolute inset-0 z-[1] opacity-5 pointer-events-none bg-[url('https://grainy-gradients.vercel.apply/noise.svg')]" />

      {/* 3D Canvas */}
      <div className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing">
        <Timeline3D 
          onSelectArtifact={setSelectedArtifact} 
          selectedId={selectedArtifact?.id || null} 
        />
      </div>

      {/* Header UI */}
      <header className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-start pointer-events-none">
        <div className="pointer-events-auto">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/50 flex items-center justify-center backdrop-blur-md relative overflow-hidden group">
              <div className="absolute inset-0 bg-primary/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-out" />
              <Database className="w-6 h-6 text-primary relative z-10" />
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold tracking-tight text-white m-0 leading-none drop-shadow-md">
                CHRONOS
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <p className="text-xs text-primary/80 uppercase tracking-[0.2em] font-sans font-medium">
                  Active Global Network
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="pointer-events-auto flex gap-4 max-w-sm w-full items-center">
          <Button variant="outline" className="h-10 rounded-full border-white/10 bg-black/40 backdrop-blur-md text-white hover:bg-white/10" onClick={() => window.location.href = '/reader'}>
            <BookOpen className="w-4 h-4 mr-2" />
            Reader
          </Button>
          <Button variant="outline" className="h-10 rounded-full border-white/10 bg-black/40 backdrop-blur-md text-white hover:bg-white/10" onClick={() => window.location.href = '/lab'}>
            <Layers className="w-4 h-4 mr-2" />
            Lab
          </Button>
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search timeline..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 bg-black/40 border-white/10 text-white placeholder:text-white/40 focus:border-primary/50 rounded-full h-12 backdrop-blur-md"
            />
          </div>
        </div>
      </header>

      {/* Overlay UI - Context Panel */}
      <AnimatePresence>
        {selectedArtifact && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ type: "spring", damping: 30, stiffness: 200 }}
            className="absolute top-0 right-0 w-full max-w-lg h-full z-30 pointer-events-auto"
          >
            <div className="h-full glass-panel border-l border-white/10 bg-black/70 backdrop-blur-2xl flex flex-col shadow-2xl relative overflow-hidden">
              
              {/* Top gradient glow */}
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

              <div className="p-6 border-b border-white/10 flex justify-between items-center relative z-10">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedArtifact(null)}
                  className="text-muted-foreground hover:text-white hover:bg-white/5 rounded-full px-4 h-10"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Return
                </Button>
                <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs font-medium font-sans flex items-center shadow-inner">
                  <Fingerprint className="w-3.5 h-3.5 mr-2 text-primary" />
                  ID: {selectedArtifact.id.toUpperCase()}
                </div>
              </div>

              <ScrollArea className="flex-1 px-8 py-8 relative z-10">
                <div className="space-y-10 pb-12">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-3 py-1 rounded bg-primary text-black text-xs font-bold tracking-wider">
                        {Math.abs(selectedArtifact.year)} {selectedArtifact.year < 0 ? 'BCE' : 'CE'}
                      </span>
                      <span className="text-white/40 text-sm flex items-center">
                        <span className="w-1 h-1 rounded-full bg-white/40 mr-3" />
                        Discovered {selectedArtifact.discoveryYear}
                      </span>
                    </div>

                    <h2 className="text-5xl font-serif font-medium text-white mb-6 leading-[1.1] tracking-tight text-balance">
                      {selectedArtifact.name}
                    </h2>
                    
                    <p className="text-white/60 leading-relaxed font-sans text-base text-balance border-l-2 border-primary/50 pl-4">
                      {selectedArtifact.description}
                    </p>
                  </motion.div>

                  <div className="h-[1px] w-full bg-gradient-to-r from-white/20 via-white/10 to-transparent" />

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-serif text-white flex items-center">
                        <BookOpen className="w-5 h-5 mr-3 text-primary" />
                        Research Aggregation
                      </h3>
                      
                      <AnimatePresence mode="wait">
                        {isScanning ? (
                          <motion.div
                            key="scanning"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center text-primary text-xs font-mono bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20"
                          >
                            <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                            SCANNING DATABASES...
                          </motion.div>
                        ) : (
                          <motion.div
                            key="complete"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center text-green-400 text-xs font-mono bg-green-400/10 px-3 py-1.5 rounded-full border border-green-400/20"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 mr-2" />
                            SYNC COMPLETE
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    
                    <div className="space-y-4">
                      {selectedArtifact.research.map((paper, idx) => (
                        <motion.div 
                          key={paper.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: isScanning ? 1.5 + (idx * 0.2) : 0.3 + (idx * 0.1) }}
                          className="group relative bg-white/5 border border-white/10 hover:bg-white/[0.07] rounded-xl p-6 transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(234,179,8,0.15)] hover:border-primary/40"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <span className="text-xs text-primary font-mono tracking-wider bg-primary/10 px-2 py-1 rounded">
                              {new Date(paper.date).getFullYear()}
                            </span>
                            <span className="text-xs text-white/50 border border-white/10 px-2 py-1 rounded-full">
                              {paper.author}
                            </span>
                          </div>
                          
                          <h4 className="text-lg font-serif font-medium text-white mb-3 leading-snug group-hover:text-primary transition-colors">
                            {paper.title}
                          </h4>
                          
                          <p className="text-sm text-white/60 leading-relaxed mb-5">
                            {paper.summary}
                          </p>

                          <div className="flex items-center gap-3">
                            <Button variant="secondary" size="sm" className="bg-white/10 hover:bg-white/20 text-white border-0 h-9 rounded-full px-5 text-xs font-medium">
                              Read Abstract
                            </Button>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-white/50 hover:text-white hover:bg-white/10">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}

                      {/* Skeleton loaders while scanning */}
                      {isScanning && selectedArtifact.research.length === 0 && (
                        Array.from({ length: 2 }).map((_, i) => (
                          <div key={i} className="p-6 rounded-xl border border-white/5 bg-white/[0.02] animate-pulse">
                            <div className="flex justify-between mb-4">
                              <div className="w-16 h-6 bg-white/10 rounded" />
                              <div className="w-24 h-6 bg-white/10 rounded-full" />
                            </div>
                            <div className="w-3/4 h-6 bg-white/10 rounded mb-3" />
                            <div className="w-full h-4 bg-white/5 rounded mb-2" />
                            <div className="w-5/6 h-4 bg-white/5 rounded" />
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                </div>
              </ScrollArea>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Controls & Hints */}
      <AnimatePresence>
        {!selectedArtifact && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 pointer-events-none w-full max-w-md px-6"
          >
            <div className="glass-panel px-8 py-4 rounded-2xl flex flex-col items-center gap-3 bg-black/40 backdrop-blur-xl border-white/10">
              <div className="flex items-center gap-6 w-full justify-center">
                <span className="text-sm text-white/70 font-medium tracking-wide">Drag to explore</span>
                <div className="w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_10px_rgba(234,179,8,1)]" />
                <span className="text-sm text-white/70 font-medium tracking-wide">Click to analyze</span>
              </div>
              <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent my-1" />
              <div className="text-xs text-white/40 font-mono">
                {artifacts.length} artifacts connected to global database
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}