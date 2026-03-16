import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CIVILIZATIONS } from "@/lib/braidData";
import { DII_MILESTONES, type DIIMilestone } from "@/lib/diiMilestones";
import { MAGIC_LABELS, type MAGICVector } from "@/lib/magicFramework";
import { Search, ExternalLink, Loader2, Image, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const PHASE_COLORS: Record<string, string> = {
  discovery: "#eab308",
  innovation: "#a855f7",
  invention: "#22c55e",
};

const PHASE_BG: Record<string, string> = {
  discovery: "from-amber-500/10 to-amber-900/5",
  innovation: "from-purple-500/10 to-purple-900/5",
  invention: "from-green-500/10 to-green-900/5",
};

interface SearchResult {
  title: string;
  url: string;
  source: string;
  thumbnailUrl?: string;
}

interface DoorState {
  isOpen: boolean;
  isSearching: boolean;
  results: SearchResult[];
  linkedImage: string | null;
}

type DoorStates = Record<string, DoorState>;

function defaultDoorState(): DoorState {
  return { isOpen: false, isSearching: false, results: [], linkedImage: null };
}

function doorKey(civId: string, cycle: number, phase: string): string {
  return `${civId}-${cycle}-${phase}`;
}

function DoorCard({
  milestone,
  civId,
  civColor,
  cycle,
  state,
  onOpen,
  onSearch,
  onLinkImage,
  onClose,
}: {
  milestone: DIIMilestone;
  civId: string;
  civColor: string;
  cycle: number;
  state: DoorState;
  onOpen: () => void;
  onSearch: () => void;
  onLinkImage: (url: string) => void;
  onClose: () => void;
}) {
  const phaseColor = PHASE_COLORS[milestone.phase];
  const hasLinked = !!state.linkedImage;

  return (
    <motion.div
      data-testid={`door-${civId}-${cycle}-${milestone.phase}`}
      layout
      className="relative group"
      style={{ perspective: "800px" }}
    >
      <motion.div
        className={`relative rounded-xl overflow-hidden border cursor-pointer transition-all duration-300 ${
          state.isOpen
            ? "border-white/20 shadow-lg shadow-black/50"
            : "border-white/8 hover:border-white/15 hover:shadow-md hover:shadow-black/30"
        }`}
        style={{
          transformStyle: "preserve-3d",
          minHeight: state.isOpen ? "auto" : "140px",
        }}
        onClick={() => !state.isOpen && onOpen()}
        whileHover={!state.isOpen ? { rotateY: -3, rotateX: 2, scale: 1.02 } : {}}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <div
          className={`absolute inset-0 bg-gradient-to-br ${PHASE_BG[milestone.phase]} pointer-events-none`}
        />

        <div className="relative z-10">
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span
                className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                style={{
                  color: phaseColor,
                  backgroundColor: phaseColor + "15",
                }}
              >
                {milestone.phase}
              </span>
              <span className="text-[9px] text-white/30 font-mono">
                {Math.abs(milestone.year)} BCE
              </span>
            </div>

            <h4 className="text-[11px] font-semibold text-white/90 leading-tight mb-1">
              {milestone.title}
            </h4>

            {!state.isOpen && (
              <div className="flex items-center gap-1 mt-2">
                {milestone.magicDrivers.map((d) => (
                  <span
                    key={d}
                    className="text-[8px] font-bold px-1 py-0.5 rounded"
                    style={{
                      color: MAGIC_LABELS[d as keyof MAGICVector]?.color,
                      backgroundColor: (MAGIC_LABELS[d as keyof MAGICVector]?.color || "#888") + "15",
                    }}
                  >
                    {d}
                  </span>
                ))}
              </div>
            )}

            {!state.isOpen && (
              <div className="mt-2 relative w-full h-16 rounded-lg overflow-hidden bg-black/30">
                {hasLinked ? (
                  <img
                    src={state.linkedImage!}
                    alt={milestone.title}
                    className="w-full h-full object-cover"
                  />
                ) : milestone.imageUrl ? (
                  <img
                    src={milestone.imageUrl}
                    alt={milestone.title}
                    className="w-full h-full object-cover opacity-50"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image className="w-4 h-4 text-white/20" />
                  </div>
                )}
                {!hasLinked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Search className="w-4 h-4 text-white/60" />
                  </div>
                )}
              </div>
            )}
          </div>

          <AnimatePresence>
            {state.isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-3 pb-3 space-y-2">
                  <p className="text-[10px] text-white/50 leading-relaxed">
                    {milestone.description}
                  </p>

                  <div className="flex items-center gap-1">
                    {milestone.magicDrivers.map((d) => (
                      <span
                        key={d}
                        className="text-[8px] font-bold px-1.5 py-0.5 rounded"
                        style={{
                          color: MAGIC_LABELS[d as keyof MAGICVector]?.color,
                          backgroundColor: (MAGIC_LABELS[d as keyof MAGICVector]?.color || "#888") + "15",
                        }}
                      >
                        {d}
                      </span>
                    ))}
                  </div>

                  {hasLinked && (
                    <div className="relative w-full h-24 rounded-lg overflow-hidden bg-black/30 border border-white/10">
                      <img
                        src={state.linkedImage!}
                        alt={milestone.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-1 right-1 flex gap-1">
                        <a
                          href={state.linkedImage!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded bg-black/60 hover:bg-black/80 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="w-3 h-3 text-white/70" />
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-1.5">
                    <Button
                      data-testid={`search-${civId}-${cycle}-${milestone.phase}`}
                      size="sm"
                      variant="outline"
                      className="h-7 text-[10px] rounded-lg border-white/10 bg-white/5 hover:bg-white/10 text-white/70 flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSearch();
                      }}
                      disabled={state.isSearching}
                    >
                      {state.isSearching ? (
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        <Search className="w-3 h-3 mr-1" />
                      )}
                      {state.isSearching ? "Searching…" : "Find Images"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-white/40 hover:text-white/70 hover:bg-white/5 rounded-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>

                  {state.results.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[9px] text-white/30 uppercase tracking-wider">
                        Results ({state.results.length})
                      </span>
                      <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto">
                        {state.results.map((r, ri) => (
                          <button
                            key={ri}
                            data-testid={`result-${civId}-${cycle}-${milestone.phase}-${ri}`}
                            className={`relative rounded-lg overflow-hidden border transition-all cursor-pointer h-20 ${
                              state.linkedImage === r.url
                                ? "border-green-500/50 ring-1 ring-green-500/30"
                                : "border-white/10 hover:border-white/25"
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onLinkImage(r.url);
                            }}
                          >
                            {(r.thumbnailUrl || r.url) && (
                              <img
                                src={r.thumbnailUrl || r.url}
                                alt={r.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = "none";
                                }}
                              />
                            )}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1">
                              <p className="text-[7px] text-white/70 truncate">{r.title}</p>
                              <p className="text-[6px] text-white/40">{r.source}</p>
                            </div>
                            {state.linkedImage === r.url && (
                              <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-green-500 flex items-center justify-center">
                                <span className="text-[7px] text-white font-bold">✓</span>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div
          className="absolute bottom-0 left-0 right-0 h-[2px]"
          style={{ backgroundColor: phaseColor, opacity: 0.4 }}
        />
      </motion.div>
    </motion.div>
  );
}

export default function AdventCalendar({
  onBack,
  onNavigate,
}: {
  onBack: () => void;
  onNavigate?: (path: string) => void;
}) {
  const [doorStates, setDoorStates] = useState<DoorStates>({});
  const [expandedCiv, setExpandedCiv] = useState<string | null>(null);

  const getDoorState = useCallback(
    (key: string) => doorStates[key] || defaultDoorState(),
    [doorStates]
  );

  const updateDoor = useCallback(
    (key: string, update: Partial<DoorState>) => {
      setDoorStates((prev) => ({
        ...prev,
        [key]: { ...(prev[key] || defaultDoorState()), ...update },
      }));
    },
    []
  );

  const handleSearch = useCallback(
    async (milestone: DIIMilestone, key: string) => {
      updateDoor(key, { isSearching: true });

      try {
        const query = `${milestone.title} ancient artifact Mesopotamia archaeological`;

        const [museumRes, aiRes] = await Promise.allSettled([
          fetch("/api/search-museums", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query }),
          }).then((r) => r.json()),
          fetch("/api/search-images", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query }),
          }).then((r) => r.json()),
        ]);

        const results: SearchResult[] = [];

        if (museumRes.status === "fulfilled" && museumRes.value.results) {
          for (const r of museumRes.value.results) {
            if (r.imageUrl) {
              results.push({
                title: r.title,
                url: r.imageUrl,
                source: r.source || "Museum",
                thumbnailUrl: r.thumbnailUrl || r.imageUrl,
              });
            }
          }
        }

        if (aiRes.status === "fulfilled" && aiRes.value.results) {
          for (const r of aiRes.value.results) {
            if (r.url) {
              results.push({
                title: r.title || milestone.title,
                url: r.url,
                source: r.source || "AI Search",
                thumbnailUrl: r.thumbnailUrl || r.url,
              });
            }
          }
        }

        const unique = results.filter(
          (r, i, arr) => arr.findIndex((x) => x.url === r.url) === i
        );

        updateDoor(key, {
          isSearching: false,
          results: unique.slice(0, 12),
        });
      } catch {
        updateDoor(key, { isSearching: false });
      }
    },
    [updateDoor]
  );

  return (
    <div className="w-full h-full flex flex-col bg-[#030308]">
      <div className="flex-shrink-0 px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-serif font-bold text-white tracking-tight">
            DII Advent Calendar
          </h2>
          <p className="text-[10px] text-white/40 mt-0.5">
            Click a door to open · Search for artifact images · Link them to milestones
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            data-testid="button-advent-back"
            variant="outline"
            size="sm"
            className="rounded-full border-white/10 bg-black/40 text-white hover:bg-white/10 h-8 text-xs"
            onClick={onBack}
          >
            Back to Braids
          </Button>
          {onNavigate && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-white/10 bg-black/40 text-white hover:bg-white/10 h-8 text-xs"
              onClick={() => onNavigate("/")}
            >
              Timeline
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6 pb-12">
          {CIVILIZATIONS.map((civ) => {
            const cycles = DII_MILESTONES[civ.id];
            if (!cycles) return null;
            const isExpanded = expandedCiv === civ.id || expandedCiv === null;

            return (
              <div key={civ.id} className="space-y-3">
                <button
                  data-testid={`civ-header-${civ.id}`}
                  className="flex items-center gap-3 w-full text-left group"
                  onClick={() =>
                    setExpandedCiv(expandedCiv === civ.id ? null : civ.id)
                  }
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: civ.color }}
                  />
                  <h3
                    className="text-sm font-bold uppercase tracking-wider"
                    style={{ color: civ.color }}
                  >
                    {civ.name}
                  </h3>
                  <span className="text-[10px] text-white/30 font-mono">
                    {Math.abs(civ.startYear)}–{Math.abs(civ.endYear)} BCE
                  </span>
                  <div className="flex-1" />
                  <ChevronDown
                    className={`w-4 h-4 text-white/30 transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      {cycles.map((cycle) => (
                        <div key={cycle.cycle} className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="h-px flex-1 bg-white/5" />
                            <span className="text-[9px] text-white/20 uppercase tracking-widest font-mono">
                              Cycle {cycle.cycle}
                            </span>
                            <div className="h-px flex-1 bg-white/5" />
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            {cycle.milestones.map((m) => {
                              const key = doorKey(civ.id, cycle.cycle, m.phase);
                              return (
                                <DoorCard
                                  key={key}
                                  milestone={m}
                                  civId={civ.id}
                                  civColor={civ.color}
                                  cycle={cycle.cycle}
                                  state={getDoorState(key)}
                                  onOpen={() => updateDoor(key, { isOpen: true })}
                                  onSearch={() => handleSearch(m, key)}
                                  onLinkImage={(url) =>
                                    updateDoor(key, { linkedImage: url })
                                  }
                                  onClose={() => updateDoor(key, { isOpen: false })}
                                />
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
