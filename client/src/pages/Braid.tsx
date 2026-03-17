import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import BraidSVGView from "@/components/BraidSVG";
import AdventCalendar from "@/components/AdventCalendar";
import MemoryPalace from "@/components/MemoryPalace";
import PeopleGraph from "@/components/PeopleGraph";
import MAGICRadar, { MAGICBar } from "@/components/MAGICRadar";
import { CIVILIZATIONS } from "@/lib/braidData";
import { MAGIC_LABELS, type MAGICVector } from "@/lib/magicFramework";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Database,
  Hexagon,
  Layers,
  BookOpen,
  ChevronLeft,
  CalendarDays,
  Building2,
  Users,
} from "lucide-react";

const MAGIC_KEYS: (keyof MAGICVector)[] = ["M", "A", "G", "I", "C"];

export default function Braid() {
  const [selectedCiv, setSelectedCiv] = useState<string | null>(null);
  const [view, setView] = useState<"braid" | "calendar" | "palace" | "people">("braid");
  const [, navigate] = useLocation();

  const civ = selectedCiv
    ? CIVILIZATIONS.find((c) => c.id === selectedCiv)
    : null;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background text-foreground selection:bg-primary/30">
      <div className="absolute inset-0 z-10">
        {view === "braid" && (
          <BraidSVGView selectedCiv={selectedCiv} onSelectCiv={setSelectedCiv} />
        )}
        {view === "calendar" && (
          <AdventCalendar onBack={() => setView("braid")} onNavigate={navigate} />
        )}
        {view === "palace" && (
          <MemoryPalace onBack={() => setView("braid")} />
        )}
        {view === "people" && (
          <PeopleGraph onBack={() => setView("braid")} />
        )}
      </div>

      <header className={`absolute top-0 left-0 right-0 z-20 p-4 md:p-6 flex justify-between items-start pointer-events-none ${view !== "braid" ? "hidden" : ""}`}>
        <div className="pointer-events-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/50 flex items-center justify-center backdrop-blur-md">
              <Hexagon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold tracking-tight text-white m-0 leading-none drop-shadow-md">
                BRAID THEORY
              </h1>
              <p className="text-[10px] text-primary/70 uppercase tracking-[0.2em] font-sans font-medium mt-0.5">
                MAGIC Circumnutating Braids
              </p>
            </div>
          </motion.div>
        </div>

        <div className="pointer-events-auto flex gap-2 items-center">
          <Button
            data-testid="button-toggle-calendar"
            variant="outline"
            size="sm"
            className="rounded-full border-white/10 bg-black/40 backdrop-blur-md text-white hover:bg-white/10 h-9"
            onClick={() => setView("calendar")}
          >
            <CalendarDays className="w-3.5 h-3.5 mr-1.5" />
            Calendar
          </Button>
          <Button
            data-testid="button-toggle-palace"
            variant="outline"
            size="sm"
            className="rounded-full border-white/10 bg-black/40 backdrop-blur-md text-white hover:bg-white/10 h-9"
            onClick={() => setView("palace")}
          >
            <Building2 className="w-3.5 h-3.5 mr-1.5" />
            Palace
          </Button>
          <Button
            data-testid="button-toggle-people"
            variant="outline"
            size="sm"
            className="rounded-full border-white/10 bg-black/40 backdrop-blur-md text-white hover:bg-white/10 h-9"
            onClick={() => setView("people")}
          >
            <Users className="w-3.5 h-3.5 mr-1.5" />
            Meetings
          </Button>
          <Button
            data-testid="button-nav-home"
            variant="outline"
            size="sm"
            className="rounded-full border-white/10 bg-black/40 backdrop-blur-md text-white hover:bg-white/10 h-9"
            onClick={() => navigate("/")}
          >
            <ChevronLeft className="w-3.5 h-3.5 mr-1" />
            Timeline
          </Button>
          <Button
            data-testid="button-nav-reader-braid"
            variant="outline"
            size="sm"
            className="rounded-full border-white/10 bg-black/40 backdrop-blur-md text-white hover:bg-white/10 h-9"
            onClick={() => navigate("/reader")}
          >
            <BookOpen className="w-3.5 h-3.5 mr-1.5" />
            Reader
          </Button>
          <Button
            data-testid="button-nav-lab-braid"
            variant="outline"
            size="sm"
            className="rounded-full border-white/10 bg-black/40 backdrop-blur-md text-white hover:bg-white/10 h-9"
            onClick={() => navigate("/lab")}
          >
            <Layers className="w-3.5 h-3.5 mr-1.5" />
            Lab
          </Button>
        </div>
      </header>

      <AnimatePresence>
        {!selectedCiv && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
          >
            <div className="flex gap-2 flex-wrap justify-center">
              {CIVILIZATIONS.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10"
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: c.color }}
                  />
                  <span className="text-[11px] text-white/60 font-medium">
                    {c.shortName}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!selectedCiv && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.3 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none w-full max-w-lg px-6"
          >
            <div className="px-6 py-3 rounded-xl flex flex-col items-center gap-2 bg-black/50 backdrop-blur-xl border border-white/10">
              <div className="flex items-center gap-5 w-full justify-center">
                <span className="text-xs text-white/60 font-medium">
                  Click braid to inspect
                </span>
                <div className="w-1 h-1 bg-primary rounded-full" />
                <span className="text-xs text-white/60 font-medium">
                  Hover strand for MAGIC
                </span>
                <div className="w-1 h-1 bg-primary rounded-full" />
                <span className="text-xs text-white/60 font-medium">
                  Scroll to explore
                </span>
              </div>
              <p className="text-[10px] text-white/30 text-center leading-relaxed max-w-sm">
                Each braid repeats the DII cycle: Discovery (strands separate) → Innovation
                (2–4 cross) → Invention (all 5 converge + green G-wrap)
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {civ && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ type: "spring", damping: 30, stiffness: 200 }}
            className="absolute top-0 right-0 w-full max-w-md h-full z-30 pointer-events-auto"
          >
            <div className="h-full border-l border-white/10 bg-black/80 backdrop-blur-2xl flex flex-col shadow-2xl relative overflow-hidden">
              <div
                className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
                style={{
                  background: `linear-gradient(to bottom, ${civ.color}15, transparent)`,
                }}
              />

              <div className="p-4 border-b border-white/10 flex justify-between items-center relative z-10">
                <Button
                  data-testid="button-close-braid-detail"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCiv(null)}
                  className="text-muted-foreground hover:text-white hover:bg-white/5 rounded-full px-4 h-9"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Return
                </Button>
                <div
                  className="px-3 py-1 rounded-full border text-[10px] font-mono"
                  style={{
                    borderColor: civ.color + "40",
                    color: civ.color,
                    backgroundColor: civ.color + "10",
                  }}
                >
                  {civ.shortName}
                </div>
              </div>

              <ScrollArea className="flex-1 relative z-10">
                <div className="px-6 py-6 space-y-6 pb-12">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: civ.color }}
                      />
                      <span className="text-[11px] text-white/50">
                        {Math.abs(civ.startYear)} – {Math.abs(civ.endYear)} BCE
                      </span>
                    </div>
                    <h2
                      className="text-3xl font-serif font-medium mb-3 leading-tight tracking-tight"
                      style={{ color: civ.color }}
                    >
                      {civ.name}
                    </h2>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-2">
                      <Hexagon className="w-4 h-4 text-primary" />
                      <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wide">
                        MAGIC Braid Profile
                      </h3>
                    </div>

                    <div className="flex gap-4 items-start">
                      <MAGICRadar
                        vector={civ.magicProfile}
                        size={140}
                        showLabels
                        animated
                      />
                      <div className="flex-1 pt-2">
                        <MAGICBar vector={civ.magicProfile} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] text-white/40 uppercase tracking-wider">
                        Strand Analysis
                      </span>
                      <div className="space-y-1.5">
                        {MAGIC_KEYS.map((key) => {
                          const val = civ.magicProfile[key];
                          const label = MAGIC_LABELS[key];
                          return (
                            <div
                              key={key}
                              className="flex items-start gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/5"
                            >
                              <div
                                className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold mt-0.5 flex-shrink-0"
                                style={{
                                  backgroundColor: label.color + "20",
                                  color: label.color,
                                }}
                              >
                                {key}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] text-white/70 font-medium">
                                    {label.name}
                                  </span>
                                  <span className="text-[10px] text-white/40 font-mono">
                                    {val.toFixed(2)}
                                  </span>
                                </div>
                                <p className="text-[9px] text-white/30 leading-relaxed mt-0.5">
                                  {label.desc}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>

                  <div className="h-[1px] w-full bg-gradient-to-r from-white/10 to-transparent" />

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-3"
                  >
                    <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wide">
                      Interactions
                    </h3>
                    {civ.interactions.map((interaction, idx) => {
                      const target = CIVILIZATIONS.find(
                        (c) => c.id === interaction.targetCivId
                      );
                      const typeColors: Record<string, string> = {
                        war: "#ef4444",
                        trade: "#22c55e",
                        cultural: "#a855f7",
                        conquest: "#f97316",
                      };
                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.25 + idx * 0.05 }}
                          className="p-3 rounded-lg bg-white/[0.03] border border-white/10"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span
                                className="text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider"
                                style={{
                                  color: typeColors[interaction.type],
                                  backgroundColor:
                                    typeColors[interaction.type] + "15",
                                  borderColor:
                                    typeColors[interaction.type] + "30",
                                }}
                              >
                                {interaction.type}
                              </span>
                              {target && (
                                <span
                                  className="text-[10px] font-mono"
                                  style={{ color: target.color }}
                                >
                                  → {target.shortName}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-white/40 font-mono">
                              {Math.abs(interaction.year)} BCE
                            </span>
                          </div>
                          <p className="text-[11px] text-white/50 leading-relaxed">
                            {interaction.description}
                          </p>
                          <div className="mt-1.5 flex items-center gap-1.5">
                            <span className="text-[9px] text-white/30">
                              Intensity
                            </span>
                            <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${interaction.intensity * 100}%`,
                                  backgroundColor:
                                    typeColors[interaction.type],
                                }}
                              />
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </div>
              </ScrollArea>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
