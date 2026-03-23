import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════════════
// DESIGN TOKENS — Mesopotamian palette
// ═══════════════════════════════════════════════════════════════
const T = {
  night: "#0D1B2A", lapis: "#1B3A5C", gold: "#C8A84E", clay: "#E8D5B7",
  parchment: "#FAF6EE", brown: "#3D2B1F",
  regM: "#5B7FA5", regF: "#6B8F5B", regB: "#8B6BAF",
  starGold: "#D4A843", starBlue: "#4A7FB5", starRose: "#B5647A",
};

// ═══════════════════════════════════════════════════════════════
// SHARED POWER SCHEMA — same data drives both A2 nodes and A3 annotations
// This is the visual schema transfer mechanism
// ═══════════════════════════════════════════════════════════════
const POWERS = [
  {
    id: "d8",
    name: "D₈ Symmetry",
    icon: "✦",
    color: T.starGold,
    shortDesc: "8 rotations × 8 reflections = 16 isometries",
    geometric: "Two overlapping squares at 45° rotation create 8-fold radial symmetry",
    perceptual: "Eye pulled outward equally in all directions — sensation of radiance, omnidirectional energy",
    schema: "Divine radiance — power that emanates from center without diminishing",
    schemaType: "Productive symbolic schema",
    level: 3, // "power level" — visual weight in the skill tree
  },
  {
    id: "radial",
    name: "Radial Composition",
    icon: "◎",
    color: T.starBlue,
    shortDesc: "All points equidistant from center",
    geometric: "Every tip of the star is the same distance from the center point — perfect radial balance",
    perceptual: "No preferred direction — the eye cannot rest on one point, forced to take in the whole",
    schema: "Cosmic order — all things held at equal distance from divine center (justice, equality, cosmic law)",
    schemaType: "Productive symbolic schema",
    level: 2,
  },
  {
    id: "overlap",
    name: "Square Overlap",
    icon: "⬡",
    color: T.starRose,
    shortDesc: "Two distinct forms creating one emergent form",
    geometric: "Two squares, each complete on its own, produce a new shape only when combined at 45°",
    perceptual: "Tension between seeing two squares vs seeing one star — the brain oscillates",
    schema: "Duality unified — love AND war, morning star AND evening star, two natures in one being",
    schemaType: "Productive symbolic schema",
    level: 2,
  },
];

// A3 artifacts — each annotated with POWER references (same IDs)
const ARTIFACTS = [
  {
    id: "ishtar-gate",
    name: "Ishtar Gate Rosette",
    location: "Pergamon Museum, Berlin",
    accession: "VAT 558",
    date: "c. 575 BCE",
    material: "Molded glazed brick — golden on cobalt",
    imageDesc: "8-pointed star rosette on deep blue glazed brick wall",
    powerRefs: ["d8", "radial"],
    context: "Processional way into Babylon. Every person entering the city passes under Ishtar's radiating geometry. The star is not decoration — it is a broadcast of divine authority.",
    howPowerManifests: {
      d8: "Each rosette is constructed from 8 precisely angled brick segments. The 45° rotation is a brick-cutting problem with a specific solution.",
      radial: "Rosettes are spaced at equal intervals — the radial principle applied at architectural scale.",
    },
  },
  {
    id: "boundary-stone",
    name: "Kudurru (Boundary Stone) of Meli-Shipak II",
    location: "Musée du Louvre, Paris",
    accession: "Sb 22",
    date: "c. 1186–1172 BCE",
    material: "Black limestone, carved in relief",
    imageDesc: "Carved boundary stone with celestial symbols — 8-pointed star among astral register",
    powerRefs: ["d8", "overlap"],
    context: "Legal document granting land rights. The 8-pointed star appears in the celestial register alongside sun and crescent moon. Ishtar's star validates the legal contract — divine witness encoded in geometry.",
    howPowerManifests: {
      d8: "The star is carved in low relief — the D₈ symmetry survives dimensional reduction from 3D brick to 2D carving.",
      overlap: "On the kudurru, the star sits between other celestial symbols. Two overlapping domains — celestial authority and terrestrial law — unified in one object.",
    },
  },
  {
    id: "cylinder-seal",
    name: "Cylinder Seal of Ishtar's Descent",
    location: "British Museum, London",
    accession: "BM 89110",
    date: "c. 2300 BCE",
    material: "Lapis lazuli, intaglio carved",
    imageDesc: "Cylinder seal impression showing Ishtar flanked by 8-pointed stars, winged, standing on lion",
    powerRefs: ["d8", "radial", "overlap"],
    context: "All three powers deployed simultaneously. The seal carries Ishtar's complete geometric identity in a pocket-sized object — personal authority embodied in a rolling cylinder.",
    howPowerManifests: {
      d8: "Miniaturized to 2cm across — the D₈ symmetry remains legible at any scale. This is resolution invariance.",
      radial: "Stars flank the figure symmetrically — radial balance of the composition itself mirrors the radial property of each star.",
      overlap: "Ishtar stands between the mortal and divine registers of the scene. Her dual nature (love/war) echoed in the dual-square construction of her symbol.",
    },
  },
];

// ═══════════════════════════════════════════════════════════════
// SECTION NAV RAIL
// ═══════════════════════════════════════════════════════════════
const SECTIONS = [
  { id: "A1", name: "Myth", icon: "🎭", type: "cinematic", reg: "m" },
  { id: "A2", name: "Identify", icon: "⚔", type: "character-sheet", reg: "m" },
  { id: "A3", name: "Connect", icon: "📖", type: "lore-codex", reg: "m" },
  { id: "A4", name: "Culture", icon: "🏺", type: "collection", reg: "m" },
  { id: "A5", name: "Teach", icon: "🎓", type: "tutorial", reg: "m" },
  { id: "A6", name: "Create", icon: "🔨", type: "workshop", reg: "m" },
  { id: "A7", name: "Bridge", icon: "🏛", type: "split-reveal", reg: "b" },
  { id: "B1", name: "Review", icon: "↩", type: "recap", reg: "b" },
  { id: "B2", name: "Proof", icon: "📐", type: "whiteboard", reg: "f" },
  { id: "B3", name: "Transform", icon: "🔄", type: "animation", reg: "f" },
  { id: "B4", name: "Mechanics", icon: "⚙", type: "schematic", reg: "f" },
  { id: "B5", name: "History", icon: "📊", type: "tech-tree", reg: "f" },
  { id: "B6", name: "Invention", icon: "💡", type: "blueprint", reg: "f" },
  { id: "B7", name: "Build", icon: "🔧", type: "workshop", reg: "f" },
  { id: "B8", name: "Synthesis", icon: "∞", type: "superimpose", reg: "b" },
];

const regColor = (r) => r === "m" ? T.regM : r === "f" ? T.regF : T.regB;

function NavRail({ activeIdx, onSelect }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", width: 56, background: T.night, borderRight: `1px solid ${T.lapis}`, overflow: "hidden" }}>
      {SECTIONS.map((s, i) => {
        const active = i === activeIdx;
        const c = regColor(s.reg);
        return (
          <button key={s.id} onClick={() => onSelect(i)} title={`${s.id}: ${s.name}`}
            style={{ background: active ? `${c}22` : "transparent", border: "none", borderLeft: active ? `3px solid ${c}` : "3px solid transparent", padding: "6px 0", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 1, transition: "all 0.2s" }}>
            <span style={{ fontSize: 14 }}>{s.icon}</span>
            <span style={{ fontSize: 8, fontFamily: "monospace", color: active ? c : "#555", fontWeight: active ? 700 : 400, letterSpacing: 1 }}>{s.id}</span>
          </button>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// POWER NODE — reusable component for both A2 and A3
// This is the visual schema transfer unit
// ═══════════════════════════════════════════════════════════════
function PowerBadge({ power, size = "sm", onClick, active }) {
  const s = size === "sm" ? 24 : 32;
  return (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: active ? `${power.color}22` : "transparent",
      border: `1.5px solid ${active ? power.color : power.color + "44"}`,
      borderRadius: 20, padding: size === "sm" ? "3px 10px 3px 6px" : "5px 14px 5px 8px",
      cursor: "pointer", transition: "all 0.2s",
    }}>
      <span style={{ fontSize: size === "sm" ? 12 : 16, width: s, height: s, borderRadius: "50%", background: `${power.color}18`, display: "flex", alignItems: "center", justifyContent: "center", color: power.color, fontWeight: 700 }}>{power.icon}</span>
      <span style={{ fontSize: size === "sm" ? 11 : 13, color: power.color, fontWeight: 600, letterSpacing: 0.3 }}>{power.name}</span>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════
// A2: CHARACTER SHEET — "Who is this deity? What are their powers?"
// ═══════════════════════════════════════════════════════════════
function A2CharacterSheet({ onNavigateA3 }) {
  const [expandedPower, setExpandedPower] = useState(null);
  const [showTransition, setShowTransition] = useState(false);

  const handleSeeInAction = (powerId) => {
    setShowTransition(true);
    setTimeout(() => { setShowTransition(false); onNavigateA3(powerId); }, 600);
  };

  return (
    <div style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative" }}>
      {showTransition && (
        <div style={{ position: "absolute", inset: 0, zIndex: 100, background: T.night, display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.3s ease" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 10, letterSpacing: 4, color: T.gold, marginBottom: 8 }}>ENTERING CODEX</div>
            <div style={{ fontSize: 18, color: T.clay, fontFamily: "Georgia, serif" }}>See this power in action...</div>
          </div>
        </div>
      )}

      {/* Left: Deity Profile */}
      <div style={{ width: 280, background: `linear-gradient(180deg, ${T.night} 0%, ${T.lapis} 100%)`, padding: 24, display: "flex", flexDirection: "column", gap: 16, borderRight: `1px solid ${T.lapis}` }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 120, height: 120, borderRadius: "50%", margin: "0 auto 12px", background: `radial-gradient(circle at 40% 40%, ${T.gold}44 0%, ${T.night} 70%)`, border: `2px solid ${T.gold}33`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg viewBox="0 0 80 80" width="70" height="70">
              <rect x="20" y="20" width="40" height="40" fill="none" stroke={T.gold} strokeWidth="1.5" opacity="0.6" />
              <rect x="20" y="20" width="40" height="40" fill="none" stroke={T.gold} strokeWidth="1.5" opacity="0.6" transform="rotate(45 40 40)" />
              {[0,45,90,135,180,225,270,315].map(a => {
                const r = a * Math.PI / 180;
                return <circle key={a} cx={40 + 32*Math.cos(r)} cy={40 + 32*Math.sin(r)} r="2" fill={T.gold} opacity="0.5" />;
              })}
              <circle cx="40" cy="40" r="3" fill={T.gold} />
            </svg>
          </div>
          <div style={{ fontSize: 9, letterSpacing: 4, color: T.gold, marginBottom: 4 }}>DEITY PROFILE</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: T.gold, fontFamily: "Georgia, serif" }}>Ishtar</div>
          <div style={{ fontSize: 12, color: T.clay, fontStyle: "italic", marginTop: 2 }}>Goddess of Love, War & Venus</div>
        </div>

        <div style={{ fontSize: 11, color: "#aaa", lineHeight: 1.6, borderTop: `1px solid ${T.lapis}`, paddingTop: 12 }}>
          Fierce, passionate, unpredictable. The only deity who rules opposite domains — love AND war — held in one form. Descends to the underworld and returns. Demands to be seen.
        </div>

        <div style={{ marginTop: "auto" }}>
          <div style={{ fontSize: 9, letterSpacing: 3, color: "#666", marginBottom: 6 }}>ELEMENT</div>
          <div style={{ background: `${T.gold}11`, border: `1px solid ${T.gold}33`, borderRadius: 8, padding: "10px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 18, color: T.gold, fontWeight: 700, fontFamily: "Georgia, serif" }}>8-Pointed Star</div>
            <div style={{ fontSize: 10, color: "#888", marginTop: 2 }}>Week 3 · Grade 5 · Mesopotamia</div>
          </div>
        </div>
      </div>

      {/* Right: Skill Tree / Powers */}
      <div style={{ flex: 1, background: T.parchment, padding: 28, overflowY: "auto" }}>
        <div style={{ fontSize: 9, letterSpacing: 4, color: "#999", marginBottom: 4 }}>GEOMETRIC POWERS</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: T.brown, fontFamily: "Georgia, serif", marginBottom: 4 }}>Visual Rhetoric Analysis</div>
        <div style={{ fontSize: 12, color: "#888", marginBottom: 20, lineHeight: 1.5 }}>
          Each "power" is a geometric property that produces a specific cognitive effect through visual rhetoric. Select a power to see its three-stage broadcast.
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {POWERS.map(p => {
            const expanded = expandedPower === p.id;
            return (
              <div key={p.id} style={{
                background: "#fff", borderRadius: 12, overflow: "hidden",
                border: `1.5px solid ${expanded ? p.color : "#e0ddd8"}`,
                boxShadow: expanded ? `0 4px 20px ${p.color}15` : "none",
                transition: "all 0.3s",
              }}>
                {/* Collapsed: Power header */}
                <button onClick={() => setExpandedPower(expanded ? null : p.id)} style={{
                  width: "100%", background: "none", border: "none", cursor: "pointer",
                  padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, textAlign: "left",
                }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: `${p.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: p.color, flexShrink: 0, border: `2px solid ${p.color}33` }}>
                    {p.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: T.brown }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: "#888", marginTop: 1 }}>{p.shortDesc}</div>
                  </div>
                  <div style={{ display: "flex", gap: 2 }}>
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: i < p.level ? p.color : "#ddd" }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 14, color: "#bbb", transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
                </button>

                {/* Expanded: Three-stage broadcast */}
                {expanded && (
                  <div style={{ padding: "0 18px 18px", animation: "slideDown 0.3s ease" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
                      {[
                        { stage: "1. GEOMETRIC PROPERTY", content: p.geometric, bg: `${p.color}08` },
                        { stage: "2. PERCEPTUAL EFFECT", content: p.perceptual, bg: `${p.color}12` },
                        { stage: "3. COGNITIVE SCHEMA", content: p.schema, bg: `${p.color}18` },
                      ].map((s, i) => (
                        <div key={i} style={{ background: s.bg, borderRadius: 8, padding: 12, position: "relative" }}>
                          <div style={{ fontSize: 8, letterSpacing: 2, color: p.color, fontWeight: 700, marginBottom: 6 }}>{s.stage}</div>
                          <div style={{ fontSize: 11, lineHeight: 1.6, color: "#444" }}>{s.content}</div>
                          {i < 2 && <div style={{ position: "absolute", right: -12, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: p.color, zIndex: 1 }}>→</div>}
                        </div>
                      ))}
                    </div>
                    <div style={{ background: `${p.color}08`, borderRadius: 8, padding: "8px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", border: `1px dashed ${p.color}33` }}>
                      <div style={{ fontSize: 10, color: "#888" }}>
                        <strong style={{ color: p.color }}>{p.schemaType}</strong> — not an emotion, a thinking tool
                      </div>
                      <button onClick={() => handleSeeInAction(p.id)} style={{
                        background: p.color, color: "#fff", border: "none", borderRadius: 6,
                        padding: "6px 14px", fontSize: 11, fontWeight: 700, cursor: "pointer",
                        letterSpacing: 0.5,
                      }}>
                        See in artifacts →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// A3: LORE CODEX — "Where do these powers appear in the world?"
// ═══════════════════════════════════════════════════════════════
function A3LoreCodex({ highlightPower, onBack }) {
  const [selectedArtifact, setSelectedArtifact] = useState(0);
  const [activePowerFilter, setActivePowerFilter] = useState(highlightPower);

  const artifact = ARTIFACTS[selectedArtifact];
  const filteredArtifacts = activePowerFilter
    ? ARTIFACTS.filter(a => a.powerRefs.includes(activePowerFilter))
    : ARTIFACTS;

  return (
    <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
      {/* Left: Artifact list */}
      <div style={{ width: 260, background: T.night, padding: 16, display: "flex", flexDirection: "column", gap: 8, borderRight: `1px solid ${T.lapis}`, overflowY: "auto" }}>
        <button onClick={onBack} style={{ background: "none", border: `1px solid ${T.lapis}`, borderRadius: 6, padding: "6px 12px", color: T.gold, fontSize: 11, cursor: "pointer", textAlign: "left", marginBottom: 4, letterSpacing: 0.5 }}>
          ← Back to Character Sheet
        </button>

        <div style={{ fontSize: 9, letterSpacing: 4, color: T.gold, marginBottom: 2 }}>FILTER BY POWER</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
          <button onClick={() => setActivePowerFilter(null)} style={{
            background: !activePowerFilter ? `${T.gold}22` : "transparent",
            border: `1px solid ${!activePowerFilter ? T.gold : "#444"}`,
            borderRadius: 12, padding: "3px 10px", fontSize: 10, color: !activePowerFilter ? T.gold : "#666", cursor: "pointer",
          }}>All</button>
          {POWERS.map(p => (
            <button key={p.id} onClick={() => setActivePowerFilter(p.id === activePowerFilter ? null : p.id)} style={{
              background: activePowerFilter === p.id ? `${p.color}22` : "transparent",
              border: `1px solid ${activePowerFilter === p.id ? p.color : "#444"}`,
              borderRadius: 12, padding: "3px 10px", fontSize: 10, cursor: "pointer",
              color: activePowerFilter === p.id ? p.color : "#666",
              display: "flex", alignItems: "center", gap: 4,
            }}>
              <span style={{ fontSize: 10 }}>{p.icon}</span>{p.name}
            </button>
          ))}
        </div>

        <div style={{ fontSize: 9, letterSpacing: 4, color: "#666", marginBottom: 4 }}>ARTIFACTS ({filteredArtifacts.length})</div>
        {filteredArtifacts.map((a, i) => {
          const realIdx = ARTIFACTS.indexOf(a);
          const selected = realIdx === selectedArtifact;
          return (
            <button key={a.id} onClick={() => setSelectedArtifact(realIdx)} style={{
              background: selected ? `${T.lapis}` : `${T.lapis}44`,
              border: `1px solid ${selected ? T.gold + "44" : "transparent"}`,
              borderRadius: 8, padding: 12, cursor: "pointer", textAlign: "left", transition: "all 0.2s",
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: selected ? T.gold : T.clay, marginBottom: 4 }}>{a.name}</div>
              <div style={{ fontSize: 10, color: "#888" }}>{a.date} · {a.location.split(",")[0]}</div>
              <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
                {a.powerRefs.map(pId => {
                  const pow = POWERS.find(p => p.id === pId);
                  return pow ? (
                    <span key={pId} style={{ fontSize: 9, background: `${pow.color}22`, color: pow.color, padding: "2px 6px", borderRadius: 8, border: `1px solid ${pow.color}33` }}>
                      {pow.icon} {pow.name}
                    </span>
                  ) : null;
                })}
              </div>
            </button>
          );
        })}
      </div>

      {/* Right: Artifact detail with power annotations */}
      <div style={{ flex: 1, background: T.parchment, padding: 28, overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ fontSize: 9, letterSpacing: 4, color: "#999" }}>LORE CODEX</div>
          <div style={{ flex: 1, height: 1, background: "#ddd" }} />
          <div style={{ fontSize: 10, color: "#999" }}>Ishtar · 8-Pointed Star</div>
        </div>

        {/* Artifact hero */}
        <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", border: "1px solid #e0ddd8", marginBottom: 20 }}>
          <div style={{ background: `linear-gradient(135deg, ${T.lapis}11 0%, ${T.clay}44 100%)`, padding: 32, textAlign: "center" }}>
            <div style={{ fontSize: 12, color: "#888", fontStyle: "italic" }}>[ {artifact.imageDesc} ]</div>
          </div>
          <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: T.brown, fontFamily: "Georgia, serif" }}>{artifact.name}</div>
              <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{artifact.date} · {artifact.material}</div>
              <div style={{ fontSize: 11, color: "#aaa", marginTop: 1 }}>{artifact.location} · {artifact.accession}</div>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {artifact.powerRefs.map(pId => {
                const pow = POWERS.find(p => p.id === pId);
                return pow ? <PowerBadge key={pId} power={pow} active={activePowerFilter === pId} onClick={() => setActivePowerFilter(pId === activePowerFilter ? null : pId)} /> : null;
              })}
            </div>
          </div>
        </div>

        {/* Context */}
        <div style={{ fontSize: 13, lineHeight: 1.8, color: "#444", marginBottom: 24, fontFamily: "Georgia, serif" }}>
          {artifact.context}
        </div>

        {/* Power manifestations — SAME visual language as A2 skill tree */}
        <div style={{ fontSize: 9, letterSpacing: 4, color: "#999", marginBottom: 12 }}>HOW POWERS MANIFEST IN THIS ARTIFACT</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {artifact.powerRefs.map(pId => {
            const pow = POWERS.find(p => p.id === pId);
            if (!pow) return null;
            const manifestation = artifact.howPowerManifests[pId];
            return (
              <div key={pId} style={{
                background: "#fff", borderRadius: 10, padding: 16,
                border: `1.5px solid ${pow.color}44`,
                borderLeft: `4px solid ${pow.color}`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${pow.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: pow.color, border: `2px solid ${pow.color}33` }}>
                    {pow.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: pow.color }}>{pow.name}</div>
                    <div style={{ fontSize: 10, color: "#aaa" }}>{pow.shortDesc}</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, lineHeight: 1.7, color: "#555", paddingLeft: 42 }}>
                  {manifestation}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN: Connected A2→A3 with nav rail
// ═══════════════════════════════════════════════════════════════
export default function EuclidA2A3() {
  const [activeSection, setActiveSection] = useState(1); // Start on A2
  const [a3HighlightPower, setA3HighlightPower] = useState(null);

  const handleNavigateToA3 = (powerId) => {
    setA3HighlightPower(powerId);
    setActiveSection(2); // A3
  };

  const handleBackToA2 = () => {
    setActiveSection(1); // A2
  };

  const section = SECTIONS[activeSection];

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", height: "100vh", display: "flex", flexDirection: "column", background: T.parchment, overflow: "hidden" }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideDown { from { opacity: 0; max-height: 0; } to { opacity: 1; max-height: 400px; } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }
      `}</style>

      {/* Top bar */}
      <div style={{ background: T.night, padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${T.lapis}`, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 10, letterSpacing: 4, color: T.gold, fontWeight: 700 }}>EUCLID</span>
          <span style={{ color: "#444" }}>|</span>
          <span style={{ fontSize: 11, color: "#888" }}>Week 3 · 8-Pointed Star · Ishtar · Grade 5</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 10, letterSpacing: 2, color: regColor(section.reg), fontWeight: 700 }}>
            {section.reg === "m" ? "METAPHOR" : section.reg === "f" ? "FUNCTION" : "BOTH"}
          </span>
          <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: regColor(section.reg), background: `${regColor(section.reg)}18`, padding: "2px 8px", borderRadius: 4 }}>{section.id}</span>
          <span style={{ fontSize: 11, color: T.clay }}>{section.name}</span>
        </div>
      </div>

      {/* Body: nav rail + content */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <NavRail activeIdx={activeSection} onSelect={setActiveSection} />

        {/* Content area */}
        {activeSection === 1 && <A2CharacterSheet onNavigateA3={handleNavigateToA3} />}
        {activeSection === 2 && <A3LoreCodex highlightPower={a3HighlightPower} onBack={handleBackToA2} />}

        {activeSection !== 1 && activeSection !== 2 && (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
            <div style={{ fontSize: 48 }}>{section.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: T.brown, fontFamily: "Georgia, serif" }}>{section.id}: {section.name}</div>
            <div style={{ fontSize: 12, color: "#999", padding: "6px 14px", background: `${regColor(section.reg)}11`, borderRadius: 8, border: `1px solid ${regColor(section.reg)}22` }}>
              Screen archetype: {section.type}
            </div>
            <div style={{ fontSize: 11, color: "#bbb", maxWidth: 300, textAlign: "center", lineHeight: 1.6 }}>
              This section uses the <strong>{section.type}</strong> visual template. Select A2 or A3 to see the connected character sheet → lore codex prototype.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
