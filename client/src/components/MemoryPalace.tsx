import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MAGIC_LABELS, type MAGICVector } from "@/lib/magicFramework";
import { PRIMITIVES, GENERATIVE_GRAMMAR, ART_THEORY, type PrimitiveData, type HistoricalEvidence, type ArtTheoryEntry } from "@/lib/primitivesTheory";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChevronRight, Atom, BookOpen, Palette, Grid3X3, ArrowRight, Sparkles } from "lucide-react";

type PalaceTab = "primitives" | "grammar" | "evidence" | "art";

const TAB_CONFIG: { id: PalaceTab; label: string; icon: typeof Atom }[] = [
  { id: "primitives", label: "Primitives", icon: Atom },
  { id: "grammar", label: "Grammar", icon: Grid3X3 },
  { id: "evidence", label: "Evidence", icon: BookOpen },
  { id: "art", label: "Art Theory", icon: Palette },
];

const PHASE_COLORS: Record<string, string> = {
  discovery: "#eab308",
  innovation: "#a855f7",
  invention: "#22c55e",
};

function PrimitiveCard({
  prim,
  isSelected,
  onClick,
}: {
  prim: PrimitiveData;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.div
      data-testid={`card-primitive-${prim.id}`}
      layout
      onClick={onClick}
      className={`relative cursor-pointer rounded-2xl border transition-all duration-300 overflow-hidden ${
        isSelected
          ? "border-white/20 bg-white/[0.06] shadow-xl"
          : "border-white/[0.06] bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"
      }`}
      style={{
        boxShadow: isSelected ? `0 0 40px ${prim.color}15` : "none",
      }}
    >
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold"
            style={{ backgroundColor: prim.color + "15", color: prim.color }}
          >
            {prim.symbol}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{prim.name}</h3>
            <span className="text-[10px] font-mono" style={{ color: prim.color }}>
              {prim.dimension}
            </span>
          </div>
          <ChevronRight
            className={`w-4 h-4 ml-auto text-white/20 transition-transform ${isSelected ? "rotate-90" : ""}`}
          />
        </div>

        <p className="text-[11px] text-white/50 leading-relaxed line-clamp-2">
          {prim.geometryDef}
        </p>

        <div className="mt-3 flex gap-1 flex-wrap">
          {prim.buildsInto.slice(0, 4).map((el) => (
            <span
              key={el}
              className="text-[8px] px-1.5 py-0.5 rounded bg-white/[0.04] text-white/30 border border-white/[0.04]"
            >
              {el}
            </span>
          ))}
          {prim.buildsInto.length > 4 && (
            <span className="text-[8px] px-1.5 py-0.5 text-white/20">
              +{prim.buildsInto.length - 4}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function PrimitiveDetail({ prim }: { prim: PrimitiveData }) {
  const [expandedSection, setExpandedSection] = useState<string | null>("physics");

  const sections = [
    {
      id: "physics",
      title: "Physics Role",
      content: (
        <div className="space-y-3">
          <p className="text-xs text-white/60 leading-relaxed">{prim.physicsRole}</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "As Force", value: prim.asForce, icon: "→" },
              { label: "As Motion", value: prim.asMotion, icon: "⟶" },
              { label: "As Energy", value: prim.asEnergy, icon: "⚡" },
              { label: "As State", value: prim.asState, icon: "◈" },
            ].map((dim) => (
              <div
                key={dim.label}
                className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-xs">{dim.icon}</span>
                  <span className="text-[9px] font-bold text-white/50 uppercase tracking-wider">
                    {dim.label}
                  </span>
                </div>
                <p className="text-[10px] text-white/40 leading-relaxed">{dim.value}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "construction",
      title: "Construction Rules",
      content: (
        <div className="space-y-2.5">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider">Creates (↑D via motion)</span>
            <p className="text-[11px] text-white/60 mt-1 leading-relaxed">{prim.creates}</p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider">Created By (↓D via intersection)</span>
            <p className="text-[11px] text-white/60 mt-1 leading-relaxed">{prim.createdBy}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider">Output Rule</span>
              <p className="text-[10px] text-white/50 mt-1 leading-relaxed">{prim.outputRule}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider">Duration Rule</span>
              <p className="text-[10px] text-white/50 mt-1 leading-relaxed">{prim.durationRule}</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "convergence",
      title: "Metaphor = Function",
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-2">
            <div className="p-3 rounded-xl border border-amber-500/10 bg-amber-500/[0.03]">
              <span className="text-[9px] font-bold text-amber-400/60 uppercase tracking-wider">
                Day A — Metaphor Register
              </span>
              <p className="text-[11px] text-amber-100/60 mt-1 leading-relaxed italic">
                "{prim.metaphor}"
              </p>
            </div>
            <div className="p-3 rounded-xl border border-blue-500/10 bg-blue-500/[0.03]">
              <span className="text-[9px] font-bold text-blue-400/60 uppercase tracking-wider">
                Day B — Function Register
              </span>
              <p className="text-[11px] text-blue-100/60 mt-1 leading-relaxed">
                {prim.function}
              </p>
            </div>
          </div>
          <div className="p-3 rounded-xl border border-emerald-500/15 bg-emerald-500/[0.04]">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Sparkles className="w-3 h-3 text-emerald-400/60" />
              <span className="text-[9px] font-bold text-emerald-400/60 uppercase tracking-wider">
                Superposition — Where They Converge
              </span>
            </div>
            <p className="text-[11px] text-emerald-100/70 leading-relaxed font-medium">
              {prim.convergenceNote}
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-2">
      {sections.map((s) => (
        <div key={s.id}>
          <button
            data-testid={`button-section-${s.id}`}
            onClick={() => setExpandedSection(expandedSection === s.id ? null : s.id)}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/[0.03] transition-colors flex items-center gap-2"
          >
            <ChevronRight
              className={`w-3 h-3 text-white/30 transition-transform ${
                expandedSection === s.id ? "rotate-90" : ""
              }`}
            />
            <span className="text-[11px] font-bold text-white/60">{s.title}</span>
          </button>
          <AnimatePresence>
            {expandedSection === s.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden px-3"
              >
                <div className="pb-3">{s.content}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

function EvidenceCard({ ev, index }: { ev: HistoricalEvidence; index: number }) {
  const phaseColor = PHASE_COLORS[ev.phase];
  return (
    <div data-testid={`card-evidence-${index}`} className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden hover:border-white/10 transition-all">
      <div className="relative h-32 bg-black/40">
        <img
          src={ev.imageUrl}
          alt={ev.title}
          className="w-full h-full object-cover opacity-80"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-2 left-2 right-2">
          <div className="flex items-center gap-1.5 mb-1">
            <span
              className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
              style={{ color: phaseColor, backgroundColor: phaseColor + "15" }}
            >
              {ev.phase}
            </span>
            <span className="text-[9px] text-white/40 font-mono">
              {Math.abs(ev.year)} BCE
            </span>
          </div>
          <h4 className="text-xs font-bold text-white leading-tight">{ev.title}</h4>
        </div>
      </div>
      <div className="p-3">
        <p className="text-[10px] text-white/50 leading-relaxed">{ev.description}</p>
        <div className="flex gap-1 mt-2">
          {ev.magicDrivers.map((d) => {
            const label = MAGIC_LABELS[d as keyof MAGICVector];
            return (
              <span
                key={d}
                className="text-[8px] font-bold px-1.5 py-0.5 rounded"
                style={{ color: label?.color, backgroundColor: (label?.color || "#fff") + "10" }}
              >
                {d}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ArtCard({ entry }: { entry: ArtTheoryEntry }) {
  return (
    <div data-testid={`card-art-${entry.id}`} className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden hover:border-white/10 transition-all">
      <div className="relative h-36 bg-black/40">
        <img
          src={entry.imageUrl}
          alt={entry.title}
          className="w-full h-full object-cover opacity-80"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-2 left-2 right-2">
          <span className="text-[9px] text-white/40 font-mono">
            {entry.civilization} · {Math.abs(entry.year)} BCE
          </span>
          <h4 className="text-xs font-bold text-white leading-tight">{entry.title}</h4>
        </div>
      </div>
      <div className="p-3 space-y-2">
        <p className="text-[10px] text-white/50 leading-relaxed">{entry.description}</p>
        <div className="grid grid-cols-1 gap-1.5">
          <div className="p-2 rounded-lg bg-amber-500/[0.04] border border-amber-500/10">
            <span className="text-[8px] font-bold text-amber-400/50 uppercase tracking-wider">Metaphor</span>
            <p className="text-[9px] text-amber-100/50 mt-0.5 leading-relaxed italic">{entry.metaphorRegister}</p>
          </div>
          <div className="p-2 rounded-lg bg-blue-500/[0.04] border border-blue-500/10">
            <span className="text-[8px] font-bold text-blue-400/50 uppercase tracking-wider">Function</span>
            <p className="text-[9px] text-blue-100/50 mt-0.5 leading-relaxed">{entry.functionRegister}</p>
          </div>
          <div className="p-2 rounded-lg bg-emerald-500/[0.04] border border-emerald-500/10">
            <span className="text-[8px] font-bold text-emerald-400/50 uppercase tracking-wider">Convergence</span>
            <p className="text-[9px] text-emerald-100/60 mt-0.5 leading-relaxed font-medium">{entry.convergence}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PrimitivesView() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = PRIMITIVES.find((p) => p.id === selectedId);

  return (
    <div className="flex gap-4 h-full">
      <div className="w-72 flex-shrink-0 space-y-2 overflow-auto pr-2">
        <div className="mb-3">
          <h3 className="text-xs font-bold text-white/60 uppercase tracking-wider mb-1">
            Geometric Element Atomics
          </h3>
          <p className="text-[10px] text-white/30 leading-relaxed">
            5 universal primitives. Each one IS physics — force, motion, energy, state.
            Select a primitive to explore its roles.
          </p>
        </div>
        {PRIMITIVES.map((prim) => (
          <PrimitiveCard
            key={prim.id}
            prim={prim}
            isSelected={selectedId === prim.id}
            onClick={() => setSelectedId(selectedId === prim.id ? null : prim.id)}
          />
        ))}
      </div>

      <div className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-bold"
                  style={{ backgroundColor: selected.color + "15", color: selected.color }}
                >
                  {selected.symbol}
                </div>
                <div>
                  <h2 className="text-lg font-serif font-bold text-white">{selected.name}</h2>
                  <p className="text-[11px] text-white/40">{selected.dimension} · {selected.geometryDef}</p>
                </div>
              </div>

              <PrimitiveDetail prim={selected} />

              <div className="pt-2">
                <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2">
                  Kid Diagram
                </h4>
                <div className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                  <p className="text-[11px] text-white/60 leading-relaxed italic">
                    "{selected.kidDiagram}"
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-64"
            >
              <div className="text-center">
                <Atom className="w-8 h-8 text-white/10 mx-auto mb-2" />
                <p className="text-xs text-white/20">Select a primitive to explore</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function GrammarView() {
  const [highlightFrom, setHighlightFrom] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof GENERATIVE_GRAMMAR>();
    for (const rule of GENERATIVE_GRAMMAR) {
      if (!map.has(rule.from)) map.set(rule.from, []);
      map.get(rule.from)!.push(rule);
    }
    return map;
  }, []);

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-xs font-bold text-white/60 uppercase tracking-wider mb-1">
          Generative Grammar
        </h3>
        <p className="text-[10px] text-white/30 leading-relaxed">
          Primitive + Operation + Duration = Result. This grammar IS classical mechanics.
          Every geometric element is generated from primitives by physical operations.
        </p>
      </div>

      <div className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 mb-4">
        <div className="text-center mb-3">
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">The Formula</span>
        </div>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span className="px-3 py-1.5 rounded-lg bg-white/[0.06] text-sm font-mono text-white/70 border border-white/10">
            Primitive<sub className="text-[8px] text-white/30">nD</sub>
          </span>
          <span className="text-white/30">×</span>
          <span className="px-3 py-1.5 rounded-lg bg-purple-500/10 text-sm font-mono text-purple-300/70 border border-purple-500/10">
            Motion Vector
          </span>
          <span className="text-white/30">×</span>
          <span className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-sm font-mono text-amber-300/70 border border-amber-500/10">
            Duration
          </span>
          <span className="text-white/30">=</span>
          <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-sm font-mono text-emerald-300/70 border border-emerald-500/10">
            Result
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {Array.from(grouped.entries()).map(([from, rules]) => {
          const prim = PRIMITIVES.find((p) => p.name === from);
          return (
            <div
              key={from}
              className={`rounded-xl border transition-all ${
                highlightFrom === from ? "border-white/15 bg-white/[0.04]" : "border-white/[0.06] bg-white/[0.02]"
              }`}
              onMouseEnter={() => setHighlightFrom(from)}
              onMouseLeave={() => setHighlightFrom(null)}
            >
              <div className="p-3 border-b border-white/[0.04] flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold"
                  style={{
                    backgroundColor: (prim?.color || "#888") + "15",
                    color: prim?.color || "#888",
                  }}
                >
                  {prim?.symbol || "?"}
                </div>
                <span className="text-xs font-bold text-white/70">{from}</span>
                <span className="text-[9px] text-white/30 font-mono">{prim?.dimension}</span>
              </div>
              <div className="p-2 space-y-1">
                {rules.map((rule, i) => (
                  <div
                    key={i}
                    data-testid={`row-grammar-${from}-${i}`}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.03] transition-colors"
                  >
                    <span className="text-[10px] text-purple-300/60 font-mono w-24 flex-shrink-0">
                      {rule.operation}
                    </span>
                    <span className="text-[10px] text-amber-300/50 font-mono w-16 flex-shrink-0">
                      {rule.duration}
                    </span>
                    <ArrowRight className="w-3 h-3 text-white/15 flex-shrink-0" />
                    <span className="text-[10px] text-emerald-300/70 font-bold">
                      {rule.result}
                    </span>
                    <span className="text-[9px] text-white/25 ml-auto hidden sm:block">
                      {rule.physicsAnalogy}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EvidenceView() {
  const [selectedPrimId, setSelectedPrimId] = useState<string>("point");
  const selected = PRIMITIVES.find((p) => p.id === selectedPrimId)!;

  return (
    <div className="space-y-4">
      <div className="mb-3">
        <h3 className="text-xs font-bold text-white/60 uppercase tracking-wider mb-1">
          Historical Evidence — DII Confirmation
        </h3>
        <p className="text-[10px] text-white/30 leading-relaxed">
          Each primitive's journey from Discovery → Innovation → Invention, confirmed by real artifacts.
          The theory predicts what history shows.
        </p>
      </div>

      <div className="flex gap-1 mb-4 flex-wrap">
        {PRIMITIVES.map((p) => (
          <button
            key={p.id}
            data-testid={`button-evidence-${p.id}`}
            onClick={() => setSelectedPrimId(p.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
              selectedPrimId === p.id
                ? "bg-white/10 text-white border border-white/15"
                : "bg-white/[0.03] text-white/40 border border-white/[0.05] hover:bg-white/[0.06]"
            }`}
          >
            <span style={{ color: p.color }}>{p.symbol}</span>
            {p.name}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-lg font-bold"
            style={{ backgroundColor: selected.color + "15", color: selected.color }}
          >
            {selected.symbol}
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">{selected.name}</h4>
            <p className="text-[9px] text-white/30">{selected.physicsRole.slice(0, 80)}...</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
            <div className="flex h-full">
              <div className="h-full bg-yellow-500/40 rounded-l-full" style={{ width: "25%" }} />
              <div className="h-full bg-purple-500/40" style={{ width: "50%" }} />
              <div className="h-full bg-green-500/40 rounded-r-full" style={{ width: "25%" }} />
            </div>
          </div>
          <div className="flex gap-2">
            {Object.entries(PHASE_COLORS).map(([phase, color]) => (
              <div key={phase} className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-[8px] text-white/30 capitalize">{phase}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {selected.evidence.map((ev, i) => (
          <EvidenceCard key={ev.title} ev={ev} index={i} />
        ))}
      </div>
    </div>
  );
}

function ArtView() {
  const [selectedPrimId, setSelectedPrimId] = useState<string>("point");
  const selected = PRIMITIVES.find((p) => p.id === selectedPrimId)!;
  const artEntries = ART_THEORY.filter((a) => a.primitiveId === selectedPrimId);

  return (
    <div className="space-y-4">
      <div className="mb-3">
        <h3 className="text-xs font-bold text-white/60 uppercase tracking-wider mb-1">
          Art Theory — Metaphor = Function in Artifacts
        </h3>
        <p className="text-[10px] text-white/30 leading-relaxed">
          The same primitives that structure physics also structure art. Each artifact proves that aesthetic
          choices and engineering decisions converge — because both respond to the same forces.
        </p>
      </div>

      <div className="flex gap-1 mb-4 flex-wrap">
        {PRIMITIVES.map((p) => {
          const count = ART_THEORY.filter((a) => a.primitiveId === p.id).length;
          return (
            <button
              key={p.id}
              data-testid={`button-art-${p.id}`}
              onClick={() => setSelectedPrimId(p.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                selectedPrimId === p.id
                  ? "bg-white/10 text-white border border-white/15"
                  : "bg-white/[0.03] text-white/40 border border-white/[0.05] hover:bg-white/[0.06]"
              }`}
            >
              <span style={{ color: p.color }}>{p.symbol}</span>
              {p.name}
              <span className="text-[8px] text-white/20">{count}</span>
            </button>
          );
        })}
      </div>

      {artEntries.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {artEntries.map((entry) => (
            <ArtCard key={entry.id} entry={entry} />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-40 rounded-xl border border-white/[0.06]">
          <p className="text-xs text-white/20">No art entries for this primitive yet</p>
        </div>
      )}
    </div>
  );
}

export default function MemoryPalace({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<PalaceTab>("primitives");

  return (
    <div className="w-full h-full flex flex-col bg-[#030308]">
      <div className="flex-shrink-0 px-4 py-3 border-b border-white/5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-serif font-bold text-white tracking-tight">
              Memory Palace
            </h2>
            <p className="text-[10px] text-white/40 mt-0.5">
              Geometric primitives as generative grammar · Physics IS geometry · Metaphor = Function
            </p>
          </div>
          <Button
            data-testid="button-palace-back"
            variant="outline"
            size="sm"
            className="rounded-full border-white/10 bg-black/40 text-white hover:bg-white/10 h-8 text-xs"
            onClick={onBack}
          >
            Back
          </Button>
        </div>

        <div className="flex gap-1">
          {TAB_CONFIG.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              data-testid={`tab-palace-${id}`}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                activeTab === id
                  ? "bg-white/10 text-white border border-white/15"
                  : "bg-transparent text-white/40 border border-transparent hover:bg-white/[0.04] hover:text-white/60"
              }`}
            >
              <Icon className="w-3 h-3" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "primitives" && <PrimitivesView />}
              {activeTab === "grammar" && <GrammarView />}
              {activeTab === "evidence" && <EvidenceView />}
              {activeTab === "art" && <ArtView />}
            </motion.div>
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  );
}
