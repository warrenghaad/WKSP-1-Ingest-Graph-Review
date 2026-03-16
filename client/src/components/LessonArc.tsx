import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LESSON_SECTIONS, MAGIC_LABELS, type LessonSection } from "@/lib/magicFramework";
import { artifacts } from "@/lib/artifacts";
import MAGICRadar, { MAGICBar } from "./MAGICRadar";

interface LessonArcProps {
  selectedSection: string | null;
  onSelectSection: (id: string | null) => void;
}

export default function LessonArc({ selectedSection, onSelectSection }: LessonArcProps) {
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const activeSection = selectedSection || hoveredSection;
  const activeSectionData = activeSection
    ? LESSON_SECTIONS.find((s) => s.id === activeSection)
    : null;

  const sectionArtifacts = activeSectionData
    ? artifacts.filter((a) => a.magic?.sectionRoles.includes(activeSectionData.id))
    : [];

  return (
    <div className="bg-black/30 border border-white/10 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white/80 tracking-wide uppercase">
          Lesson Architecture
        </h3>
        <div className="flex gap-2 text-[10px]">
          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Day A: Metaphor
          </span>
          <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Day B: Function
          </span>
        </div>
      </div>

      <div className="flex gap-0.5 items-end h-20">
        {LESSON_SECTIONS.map((section) => {
          const isActive = activeSection === section.id;
          const isSelected = selectedSection === section.id;
          const gHeight = section.vector.G * 100;
          const bgColor =
            section.day === "A"
              ? section.register === "bridge"
                ? "rgba(168, 85, 247, 0.4)"
                : "rgba(245, 158, 11, 0.3)"
              : section.register === "bridge"
                ? "rgba(168, 85, 247, 0.4)"
                : "rgba(59, 130, 246, 0.3)";
          const activeColor =
            section.day === "A"
              ? "rgba(245, 158, 11, 0.7)"
              : "rgba(59, 130, 246, 0.7)";

          return (
            <motion.button
              key={section.id}
              data-testid={`section-bar-${section.id}`}
              className="flex-1 relative rounded-t cursor-pointer transition-all border-b-2"
              style={{
                height: `${gHeight}%`,
                background: isActive ? activeColor : bgColor,
                borderColor: isSelected ? "#eab308" : "transparent",
              }}
              onMouseEnter={() => setHoveredSection(section.id)}
              onMouseLeave={() => setHoveredSection(null)}
              onClick={() => onSelectSection(isSelected ? null : section.id)}
              whileHover={{ scale: 1.05 }}
            >
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-mono text-white/60">
                {section.id}
              </span>
              {isActive && (
                <motion.div
                  layoutId="section-indicator"
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-yellow-400"
                />
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="flex gap-1 text-[8px] text-white/30">
        <span className="flex-1 text-center">A1</span>
        <span className="flex-[6] text-center border-b border-amber-500/20 pb-0.5">
          Rhetoric Register
        </span>
        <span className="flex-[2] text-center border-b border-purple-500/20 pb-0.5">
          Pivot
        </span>
        <span className="flex-[6] text-center border-b border-blue-500/20 pb-0.5">
          Function Register
        </span>
      </div>

      <AnimatePresence mode="wait">
        {activeSectionData && (
          <motion.div
            key={activeSectionData.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            <div className="flex gap-3">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-white font-mono">
                    {activeSectionData.id}
                  </span>
                  <span className="text-sm text-white/70">
                    {activeSectionData.title}
                  </span>
                </div>
                <p className="text-[11px] text-white/50 leading-relaxed">
                  {activeSectionData.shortDesc}
                </p>
                <div className="flex gap-1 flex-wrap">
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-white/40 border border-white/10">
                    {activeSectionData.operation}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-white/40 border border-white/10">
                    {activeSectionData.loudActors}
                  </span>
                </div>
                <p className="text-[10px] text-white/30 italic">
                  "{activeSectionData.question}"
                </p>
              </div>

              <div className="flex flex-col items-center gap-1">
                <MAGICRadar
                  vector={activeSectionData.vector}
                  size={100}
                  showLabels={true}
                  animated={true}
                />
              </div>
            </div>

            <MAGICBar vector={activeSectionData.vector} />

            <div className="flex gap-1 flex-wrap">
              {activeSectionData.geTags.map((tag) => (
                <span
                  key={tag}
                  className="text-[9px] px-1.5 py-0.5 rounded bg-green-500/5 text-green-400/60 border border-green-500/10"
                >
                  {tag}
                </span>
              ))}
            </div>

            {sectionArtifacts.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] text-white/40 uppercase tracking-wider">
                  Artifacts in this section
                </span>
                <div className="flex gap-1 flex-wrap">
                  {sectionArtifacts.map((a) => (
                    <span
                      key={a.id}
                      className="text-[9px] px-2 py-1 rounded bg-white/5 text-white/60 border border-white/10 hover:border-amber-500/30 transition-colors cursor-default"
                    >
                      {a.name.length > 30
                        ? a.name.slice(0, 30) + "..."
                        : a.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!activeSectionData && (
        <p className="text-[11px] text-white/30 text-center py-2">
          Hover or click a section to see its MAGIC weight profile
        </p>
      )}
    </div>
  );
}
