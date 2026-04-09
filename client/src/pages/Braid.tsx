import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Link, useLocation } from "wouter";

// ── MAGIC variable definitions ────────────────────────────────────────────────
const MAGIC = [
  { key: "math",        label: "M",  long: "Math",             color: "#4f8ef7", dark: "#1d4ed8" },
  { key: "art",         label: "A",  long: "Art",              color: "#f472b6", dark: "#be185d" },
  { key: "geometry",    label: "G",  long: "Geometric",        color: "#34d399", dark: "#047857" },
  { key: "ideology",    label: "I",  long: "Ideology",         color: "#fbbf24", dark: "#b45309" },
  { key: "comptroller", label: "C",  long: "Comptroller",      color: "#a78bfa", dark: "#6d28d9" },
] as const;

type MKey = (typeof MAGIC)[number]["key"];

// ── Types ─────────────────────────────────────────────────────────────────────
interface BraidPoint {
  id: number;
  name: string;
  year: number;
  math: number;
  art: number;
  geometry: number;
  ideology: number;
  comptroller: number;
  description: string | null;
  source: string | null;
}

interface SectionContribution {
  id: number;
  braidPointId: number | null;
  sourceName: string;
  sectionId: string;
  relevance: number;
  contribution: string | null;
  learningObjective: string | null;
}

// ── Lesson section definitions (canonical v2026-04-01) ───────────────────────
const SECTIONS = [
  { id: "A1", name: "Myth",                          day: "A", purpose: "Hook — narrative entry. Three-act myth where the geometric element SOLVES the problem. Deity/cultural origin." },
  { id: "A2", name: "Identify Artifact",             day: "A", purpose: "Visual rhetoric — how geometric properties produce cognitive effects via three-stage broadcast. GEA decomposition." },
  { id: "A3", name: "Connect Myth to Artifact",      day: "A", purpose: "Bridge myth to material culture. Deity's geometric powers AT WORK in real artifacts." },
  { id: "A4", name: "Material Culture",              day: "A", purpose: "Element across 6 object classes. Ideology institutionalizing — I narrates, C allocates. Sacred→mundane diffusion." },
  { id: "A5", name: "TEACH Visual Rhetoric",         day: "A", purpose: "Teach compositional mechanics identified in A2. Explicit instruction in HOW. Prepares A6 creation." },
  { id: "A6", name: "CREATE Artifact",               day: "A", purpose: "Student creation — must match A2. Students produce using visual rhetoric skills identified in A2 and taught in A5." },
  { id: "A7", name: "Architecture Bridge",           day: "A", purpose: "Pivot to Day B. Architecture as dual-register capstone. Bridge: 'What does it DO?'" },
  { id: "B1", name: "Bridge Review",                 day: "B", purpose: "Resolve A7 bridge question. MUST reference SAME artifact as A7. Same element, new register." },
  { id: "B2", name: "Math Proof",                    day: "B", purpose: "Mathematical formalization. 'Because' = demonstration, NOT definition. F(ge) formula." },
  { id: "B3", name: "Transformation",                day: "B", purpose: "Element in operation — what the math enables. Geometric operations (rotation, reflection, scaling)." },
  { id: "B4", name: "Mechanics",                     day: "B", purpose: "What transformation produces — mechanical result. The geometry does physical WORK." },
  { id: "B5", name: "STEM History",                  day: "B", purpose: "Where element sits in STEM timeline — historical lineage of functional deployments." },
  { id: "B6", name: "The Moment (Invention)",        day: "B", purpose: "ONE specific invention — crystallization point. The STEM notch." },
  { id: "B7", name: "Activity (Build)",              day: "B", purpose: "Student construction. Hands-on. Parallels A6." },
  { id: "B8", name: "Synthesis",                     day: "B", purpose: "Both registers visible SIMULTANEOUSLY. Superimpositional agreement — NOT 'metaphor = function.'" },
] as const;

// ── SVG layout constants ──────────────────────────────────────────────────────
const SVG_H  = 520;
const PL     = 20;
const PR     = 40;
const PT     = 90;
const PB     = 70;
const PH     = SVG_H - PT - PB;
const MAX_HALF_W = 18;    // max half-width of a ribbon at score = 1.0
const MIN_HALF_W = 2;     // minimum half-width so all ribbons are visible
const CTRL_RATIO = 0.42;  // bezier control point ratio

// ── Helpers ───────────────────────────────────────────────────────────────────
function toX(year: number, minY: number, maxY: number, svgW: number): number {
  const span = maxY - minY;
  return PL + ((year - minY) / span) * (svgW - PL - PR);
}

function halfW(score: number): number {
  return MIN_HALF_W + (MAX_HALF_W - MIN_HALF_W) * Math.max(0, Math.min(1, score));
}

// At each knot, sort MAGIC variables by score descending → top-to-bottom
function knotYPositions(pt: BraidPoint): Record<MKey, number> {
  const ranked = ([...MAGIC] as typeof MAGIC[number][]).map(v => ({
    key: v.key as MKey,
    score: pt[v.key as MKey] as number,
  }));
  ranked.sort((a, b) => b.score - a.score);
  const positions = {} as Record<MKey, number>;
  ranked.forEach((v, rank) => {
    positions[v.key] = PT + (rank / (MAGIC.length - 1)) * PH;
  });
  return positions;
}

// SVG filled bezier band for one ribbon segment between two knots
function bandPath(
  x1: number, yc1: number, hw1: number,
  x2: number, yc2: number, hw2: number,
): string {
  const cx1 = x1 + (x2 - x1) * CTRL_RATIO;
  const cx2 = x2 - (x2 - x1) * CTRL_RATIO;
  return [
    `M${x1} ${yc1 - hw1}`,
    `C${cx1} ${yc1 - hw1} ${cx2} ${yc2 - hw2} ${x2} ${yc2 - hw2}`,
    `L${x2} ${yc2 + hw2}`,
    `C${cx2} ${yc2 + hw2} ${cx1} ${yc1 + hw1} ${x1} ${yc1 + hw1}`,
    "Z",
  ].join(" ");
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Braid() {
  const [, navigate]                  = useLocation();
  const [points, setPoints]           = useState<BraidPoint[]>([]);
  const [selected, setSelected]       = useState<BraidPoint | null>(null);
  const [loading, setLoading]         = useState(true);
  const [analyzing, setAnalyzing]     = useState(false);
  const [researchText, setResearchText] = useState("");
  const [analyzeResult, setAnalyzeResult] = useState<string | null>(null);
  const [manualOpen, setManualOpen]   = useState(false);
  const [manual, setManual]           = useState({ name: "", year: "", math: "0.5", art: "0.5", geometry: "0.5", ideology: "0.5", comptroller: "0.5", description: "" });
  const [activeVar, setActiveVar]     = useState<MKey | null>(null);
  const [sectionMap, setSectionMap]   = useState<SectionContribution[] | null>(null);
  const [expandedSec, setExpandedSec] = useState<string | null>(null);
  const scrollRef                     = useRef<HTMLDivElement>(null);

  const fetchPoints = useCallback(async () => {
    setLoading(true);
    try {
      let res = await fetch("/api/braid/points");
      let data: BraidPoint[] = await res.json();
      if (data.length === 0) {
        await fetch("/api/braid/seed", { method: "POST" });
        res = await fetch("/api/braid/points");
        data = await res.json();
      }
      setPoints(data.sort((a, b) => a.year - b.year));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPoints(); }, [fetchPoints]);

  // ── Derived layout ─────────────────────────────────────────────────────────
  const { svgW, minYear, maxYear, enriched } = useMemo(() => {
    if (points.length === 0) return { svgW: 800, minYear: -10000, maxYear: 0, enriched: [] };
    const minY = Math.min(...points.map(p => p.year)) - 400;
    const maxY = Math.max(...points.map(p => p.year)) + 400;
    const span  = maxY - minY;
    const W     = Math.max(1200, span / 5 + PL + PR);
    const enriched = points.map(p => ({
      ...p,
      x:  toX(p.year, minY, maxY, W),
      ys: knotYPositions(p),
    }));
    return { svgW: W, minYear: minY, maxYear: maxY, enriched };
  }, [points]);

  // ── Analyze research text ──────────────────────────────────────────────────
  const handleAnalyze = async () => {
    if (!researchText.trim()) return;
    setAnalyzing(true);
    setAnalyzeResult(null);
    setSectionMap(null);
    setExpandedSec(null);
    try {
      const res = await fetch("/api/braid/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: researchText }),
      });
      const data = await res.json();
      if (!res.ok) { setAnalyzeResult(`Error: ${data.error}`); return; }
      setAnalyzeResult(`Added ${data.created} plot point${data.created !== 1 ? "s" : ""} to the graph.`);
      if (Array.isArray(data.sectionMap) && data.sectionMap.length > 0) {
        setSectionMap(data.sectionMap as SectionContribution[]);
      }
      setResearchText("");
      await fetchPoints();
    } catch (e) {
      setAnalyzeResult("Network error.");
    } finally {
      setAnalyzing(false);
    }
  };

  // ── Manual point add ───────────────────────────────────────────────────────
  const handleManualAdd = async () => {
    if (!manual.name || !manual.year) return;
    const res = await fetch("/api/braid/points", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: manual.name,
        year: Number(manual.year),
        math: parseFloat(manual.math),
        art: parseFloat(manual.art),
        geometry: parseFloat(manual.geometry),
        ideology: parseFloat(manual.ideology),
        comptroller: parseFloat(manual.comptroller),
        description: manual.description || null,
      }),
    });
    if (res.ok) {
      setManual({ name: "", year: "", math: "0.5", art: "0.5", geometry: "0.5", ideology: "0.5", comptroller: "0.5", description: "" });
      setManualOpen(false);
      await fetchPoints();
    }
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/braid/points/${id}`, { method: "DELETE" });
    if (selected?.id === id) setSelected(null);
    await fetchPoints();
  };

  // ── Render ribbons ─────────────────────────────────────────────────────────
  const ribbons = useMemo(() => {
    if (enriched.length < 2) return null;
    // Draw lowest-scoring variables first (they appear behind)
    const avgScores: Record<MKey, number> = {} as Record<MKey, number>;
    MAGIC.forEach(v => {
      avgScores[v.key as MKey] = enriched.reduce((s, p) => s + (p[v.key as MKey] as number), 0) / enriched.length;
    });
    const drawOrder = ([...MAGIC] as typeof MAGIC[number][]).map(v => v.key as MKey).sort(
      (a, b) => avgScores[a] - avgScores[b]
    );

    return drawOrder.map(key => {
      const varDef = MAGIC.find(v => v.key === key)!;
      const paths: React.ReactElement[] = [];

      for (let i = 0; i < enriched.length - 1; i++) {
        const k1 = enriched[i], k2 = enriched[i + 1];
        const score1 = k1[key as MKey] as number;
        const score2 = k2[key as MKey] as number;
        const d = bandPath(k1.x, k1.ys[key], halfW(score1), k2.x, k2.ys[key], halfW(score2));
        const isActive = activeVar === null || activeVar === key;
        paths.push(
          <path
            key={`${key}-${i}`}
            d={d}
            fill={varDef.color}
            fillOpacity={isActive ? 0.82 : 0.18}
            stroke={varDef.dark}
            strokeWidth={isActive ? 0.8 : 0.3}
          />
        );
      }

      // Dot at each knot
      enriched.forEach((k, i) => {
        const score = k[key as MKey] as number;
        const isActive = activeVar === null || activeVar === key;
        paths.push(
          <circle
            key={`${key}-dot-${i}`}
            cx={k.x}
            cy={k.ys[key]}
            r={halfW(score)}
            fill={varDef.color}
            fillOpacity={isActive ? 1 : 0.2}
            stroke={varDef.dark}
            strokeWidth={0.8}
          />
        );
      });

      return <g key={key}>{paths}</g>;
    });
  }, [enriched, activeVar]);

  // ── Knot click targets — click navigates directly to /node/:id ────────────
  const knotTargets = useMemo(() =>
    enriched.map((k, i) => (
      <g key={`knot-${i}`} style={{ cursor: "pointer" }} onClick={() => navigate(`/node/${k.id}`)}>
        <line x1={k.x} y1={PT - 12} x2={k.x} y2={PT + PH + 12}
          stroke={selected?.id === k.id ? "#fff" : "rgba(255,255,255,0.12)"}
          strokeWidth={selected?.id === k.id ? 1.5 : 0.8}
          strokeDasharray={selected?.id === k.id ? "none" : "4 4"}
        />
        <circle cx={k.x} cy={SVG_H - PB + 18} r={6}
          fill={selected?.id === k.id ? "#fff" : "rgba(255,255,255,0.25)"}
          stroke="rgba(255,255,255,0.5)" strokeWidth={1}
        />
        <text x={k.x} y={SVG_H - PB + 36} textAnchor="middle"
          fontSize={9} fill="rgba(255,255,255,0.6)" fontFamily="monospace">
          {k.year < 0 ? `${Math.abs(k.year)} BCE` : `${k.year} CE`}
        </text>
      </g>
    )), [enriched, selected, navigate]);

  // ── Knot labels (above timeline) — click navigates to /node/:id ───────────
  const knotLabels = useMemo(() =>
    enriched.map((k, i) => {
      const even = i % 2 === 0;
      return (
        <text key={`label-${i}`}
          x={k.x} y={even ? PT - 24 : PT - 8}
          textAnchor="middle" fontSize={8.5}
          fill={selected?.id === k.id ? "#fff" : "rgba(255,255,255,0.55)"}
          fontFamily="system-ui" fontWeight={selected?.id === k.id ? 600 : 400}
          style={{ cursor: "pointer" }} onClick={() => navigate(`/node/${k.id}`)}>
          {k.name.length > 22 ? k.name.slice(0, 21) + "…" : k.name}
        </text>
      );
    }), [enriched, selected, navigate]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a14", color: "#e2e8f0", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <div style={{ padding: "14px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <Link href="/" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none", fontSize: 13 }}>← Chronos</Link>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, letterSpacing: 2, color: "#e2e8f0" }}>MAGIC BRAID</h1>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: 1 }}>
          {points.length} plot point{points.length !== 1 ? "s" : ""} · M A G I C convergence over time
        </span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
          {MAGIC.map(v => (
            <button key={v.key}
              onClick={() => setActiveVar(av => av === v.key ? null : v.key as MKey)}
              data-testid={`filter-${v.key}`}
              style={{
                padding: "3px 10px", borderRadius: 20, border: `1px solid ${v.color}`,
                background: activeVar === v.key ? v.color : "transparent",
                color: activeVar === v.key ? "#000" : v.color,
                fontSize: 11, fontWeight: 700, cursor: "pointer", letterSpacing: 1,
              }}>
              {v.label}
            </button>
          ))}
          {activeVar && (
            <button onClick={() => setActiveVar(null)}
              style={{ padding: "3px 10px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.2)", background: "transparent", color: "rgba(255,255,255,0.5)", fontSize: 11, cursor: "pointer" }}>
              all
            </button>
          )}
        </div>
      </div>

      {/* Legend */}
      <div style={{ padding: "8px 24px", display: "flex", gap: 20, flexWrap: "wrap", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        {MAGIC.map(v => (
          <div key={v.key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 28, height: 6, borderRadius: 3, background: v.color, opacity: 0.85 }} />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}><b style={{ color: v.color }}>{v.label}</b> {v.long}</span>
          </div>
        ))}
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginLeft: "auto", alignSelf: "center" }}>
          Ribbon width = score strength · Position = ranking at that moment
        </span>
      </div>

      {/* Main graph */}
      <div style={{ flex: 1, position: "relative", display: "flex" }}>
        <div ref={scrollRef}
          style={{ flex: 1, overflowX: "auto", overflowY: "hidden", padding: "0 24px" }}
          data-testid="braid-scroll">
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: SVG_H, color: "rgba(255,255,255,0.4)" }}>
              Loading braid data…
            </div>
          ) : points.length === 0 ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: SVG_H, color: "rgba(255,255,255,0.3)", fontSize: 14 }}>
              No plot points yet. Add research below to begin.
            </div>
          ) : (
            <svg width={svgW} height={SVG_H} style={{ display: "block" }} data-testid="braid-svg">
              {/* Background grid lines */}
              {Array.from({ length: 6 }).map((_, i) => {
                const y = PT + (i / 5) * PH;
                return <line key={i} x1={PL} y1={y} x2={svgW - PR} y2={y}
                  stroke="rgba(255,255,255,0.04)" strokeWidth={1} />;
              })}

              {/* Time axis */}
              <line x1={PL} y1={SVG_H - PB} x2={svgW - PR} y2={SVG_H - PB}
                stroke="rgba(255,255,255,0.2)" strokeWidth={1} />

              {/* MAGIC ribbons */}
              {ribbons}

              {/* Knot interaction targets */}
              {knotTargets}

              {/* Knot labels */}
              {knotLabels}

              {/* Axis labels */}
              {MAGIC.map((v, i) => {
                const baseY = PT + (i / (MAGIC.length - 1)) * PH;
                return (
                  <text key={v.key} x={svgW - PR + 6} y={baseY + 4}
                    fontSize={9} fill={v.color} fontFamily="monospace" fontWeight={700}>
                    {v.label}
                  </text>
                );
              })}
            </svg>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div style={{
            width: 300, minWidth: 260, background: "#111122",
            borderLeft: "1px solid rgba(255,255,255,0.1)",
            padding: 20, overflowY: "auto",
            display: "flex", flexDirection: "column", gap: 14,
          }} data-testid="detail-panel">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, lineHeight: 1.3, color: "#fff" }}>{selected.name}</h2>
              <button onClick={() => setSelected(null)}
                style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
            </div>

            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontFamily: "monospace" }}>
              {selected.year < 0 ? `${Math.abs(selected.year)} BCE` : `${selected.year} CE`}
            </div>

            {selected.description && (
              <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>
                {selected.description}
              </p>
            )}

            {/* MAGIC scores */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
              {MAGIC.map(v => {
                const score = selected[v.key as MKey] as number;
                return (
                  <div key={v.key} data-testid={`score-${v.key}`}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 11, color: v.color, fontWeight: 700 }}>{v.label} — {v.long}</span>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontFamily: "monospace" }}>
                        {score.toFixed(2)}
                      </span>
                    </div>
                    <div style={{ height: 5, background: "rgba(255,255,255,0.08)", borderRadius: 3 }}>
                      <div style={{ height: 5, width: `${score * 100}%`, background: v.color, borderRadius: 3 }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {selected.source && (
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 10 }}>
                Source: {selected.source}
              </div>
            )}

            <button
              onClick={() => navigate(`/node/${selected.id}`)}
              data-testid="open-node"
              style={{ padding: "7px 12px", background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.3)", borderRadius: 6, color: "#34d399", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>
              Open 3D Node →
            </button>

            <button
              onClick={() => handleDelete(selected.id)}
              data-testid="delete-point"
              style={{ padding: "6px 12px", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 6, color: "#f87171", fontSize: 11, cursor: "pointer" }}>
              Remove from graph
            </button>
          </div>
        )}
      </div>

      {/* Research ingestion */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "16px 24px", background: "#0d0d1e" }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 10, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 600, letterSpacing: 1 }}>
            ADD RESEARCH
          </span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>
            Paste research text → Gemini extracts MAGIC plot points and adds them to the graph
          </span>
          <button
            onClick={() => setManualOpen(o => !o)}
            data-testid="toggle-manual"
            style={{ marginLeft: "auto", padding: "4px 12px", background: "transparent", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 6, color: "rgba(255,255,255,0.5)", fontSize: 11, cursor: "pointer" }}>
            {manualOpen ? "hide manual entry" : "+ manual entry"}
          </button>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <textarea
            value={researchText}
            onChange={e => setResearchText(e.target.value)}
            placeholder="Paste research text here — articles, excerpts, museum descriptions, academic papers…"
            data-testid="research-textarea"
            style={{
              flex: 1, minHeight: 72, maxHeight: 160, background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8,
              color: "#e2e8f0", fontSize: 12, padding: "10px 12px", resize: "vertical",
              fontFamily: "system-ui", lineHeight: 1.5,
            }}
          />
          <button
            onClick={handleAnalyze}
            disabled={analyzing || !researchText.trim()}
            data-testid="analyze-btn"
            style={{
              padding: "10px 18px", background: analyzing ? "rgba(79,142,247,0.2)" : "#4f8ef7",
              border: "none", borderRadius: 8, color: analyzing ? "rgba(255,255,255,0.4)" : "#000",
              fontSize: 12, fontWeight: 700, cursor: analyzing ? "not-allowed" : "pointer", whiteSpace: "nowrap",
            }}>
            {analyzing ? "Analyzing…" : "Analyze →"}
          </button>
        </div>

        {analyzeResult && (
          <div style={{ marginTop: 8, fontSize: 12, color: analyzeResult.startsWith("Error") ? "#f87171" : "#34d399" }}
            data-testid="analyze-result">
            {analyzeResult}
          </div>
        )}

        {/* Section impact map */}
        {sectionMap && sectionMap.length > 0 && (() => {
          const byId: Record<string, SectionContribution> = {};
          for (const sc of sectionMap) byId[sc.sectionId] = sc;
          const dayA = SECTIONS.filter(s => s.day === "A");
          const dayB = SECTIONS.filter(s => s.day === "B");

          const SectionCard = ({ sec }: { sec: typeof SECTIONS[number] }) => {
            const contrib = byId[sec.id];
            const relevance = contrib?.relevance ?? 0;
            const isA = sec.day === "A";
            const dayColor = isA ? "#f472b6" : "#4f8ef7";
            const expanded = expandedSec === sec.id;
            const dim = relevance < 0.2;
            return (
              <div
                onClick={() => setExpandedSec(expanded ? null : sec.id)}
                data-testid={`section-card-${sec.id}`}
                style={{
                  padding: "8px 10px", borderRadius: 6, cursor: "pointer",
                  border: `1px solid ${expanded ? dayColor + "66" : relevance >= 0.4 ? dayColor + "33" : "rgba(255,255,255,0.06)"}`,
                  background: expanded ? (isA ? "#1a0c14" : "#0c1220") : "rgba(255,255,255,0.02)",
                  opacity: dim ? 0.35 : 1,
                  transition: "all 0.15s",
                  marginBottom: 4,
                }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: dayColor, minWidth: 22 }}>{sec.id}</span>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", flex: 1 }}>{sec.name}</span>
                  {relevance >= 0.66 && (
                    <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: 0.8, color: dayColor, background: dayColor + "22", borderRadius: 3, padding: "1px 5px", flexShrink: 0 }}>HIGH</span>
                  )}
                  {relevance >= 0.33 && relevance < 0.66 && (
                    <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: 0.8, color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.07)", borderRadius: 3, padding: "1px 5px", flexShrink: 0 }}>MED</span>
                  )}
                  <div style={{ width: 48, height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2, flexShrink: 0 }}>
                    <div style={{ height: 4, width: `${relevance * 100}%`, background: dayColor, borderRadius: 2, opacity: 0.85 }} />
                  </div>
                  <span style={{ fontSize: 9, color: relevance >= 0.4 ? dayColor : "rgba(255,255,255,0.25)", fontFamily: "monospace", minWidth: 28, textAlign: "right" }}>
                    {(relevance * 100).toFixed(0)}%
                  </span>
                </div>
                {expanded && (
                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${dayColor}22` }}>
                    {contrib?.contribution && (
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 9, color: dayColor, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 3 }}>This research contributes</div>
                        <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.85)", lineHeight: 1.55 }}>
                          {contrib.contribution}
                        </p>
                      </div>
                    )}
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 3 }}>Learning objective</div>
                    <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>
                      {contrib?.learningObjective ?? sec.purpose}
                    </p>
                  </div>
                )}
              </div>
            );
          };

          return (
            <div style={{ marginTop: 14, padding: 14, borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.3)" }}
              data-testid="section-impact-panel">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 600, letterSpacing: 1 }}>
                  LESSON SECTION IMPACT
                </span>
                <button onClick={() => setSectionMap(null)}
                  style={{ background: "none", border: "none", color: "rgba(255,255,255,0.25)", cursor: "pointer", fontSize: 16, lineHeight: 1, padding: 0 }}>×</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                <div>
                  <div style={{ fontSize: 9, color: "#f472b6", letterSpacing: 1, fontWeight: 700, marginBottom: 6, textTransform: "uppercase" }}>Day A — Meaning</div>
                  {dayA.map(s => <SectionCard key={s.id} sec={s} />)}
                </div>
                <div>
                  <div style={{ fontSize: 9, color: "#4f8ef7", letterSpacing: 1, fontWeight: 700, marginBottom: 6, textTransform: "uppercase" }}>Day B — Function</div>
                  {dayB.map(s => <SectionCard key={s.id} sec={s} />)}
                </div>
              </div>
              <div style={{ marginTop: 8, fontSize: 9, color: "rgba(255,255,255,0.2)", textAlign: "center" }}>
                Click any section to see its contribution and purpose · Sections below 20% are dimmed
              </div>
            </div>
          );
        })()}

        {/* Manual entry */}
        {manualOpen && (
          <div style={{ marginTop: 14, padding: 16, background: "rgba(255,255,255,0.03)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
              <div>
                <label style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 4 }}>Name *</label>
                <input value={manual.name} onChange={e => setManual(m => ({ ...m, name: e.target.value }))}
                  placeholder="e.g. Plimpton 322" data-testid="manual-name"
                  style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 4 }}>Year (negative = BCE) *</label>
                <input value={manual.year} onChange={e => setManual(m => ({ ...m, year: e.target.value }))}
                  placeholder="-1800" type="number" data-testid="manual-year"
                  style={inputStyle} />
              </div>
              {MAGIC.map(v => (
                <div key={v.key}>
                  <label style={{ fontSize: 10, color: v.color, display: "block", marginBottom: 4 }}>{v.label} – {v.long} (0–1)</label>
                  <input
                    value={manual[v.key as keyof typeof manual]}
                    onChange={e => setManual(m => ({ ...m, [v.key]: e.target.value }))}
                    type="number" min={0} max={1} step={0.05}
                    data-testid={`manual-${v.key}`}
                    style={inputStyle}
                  />
                </div>
              ))}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 4 }}>Description</label>
                <input value={manual.description} onChange={e => setManual(m => ({ ...m, description: e.target.value }))}
                  placeholder="One-line context" data-testid="manual-description"
                  style={inputStyle} />
              </div>
            </div>
            <button onClick={handleManualAdd} data-testid="manual-submit"
              style={{ marginTop: 12, padding: "7px 18px", background: "#4f8ef7", border: "none", borderRadius: 6, color: "#000", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              Add to graph
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", boxSizing: "border-box",
  padding: "6px 10px", background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6,
  color: "#e2e8f0", fontSize: 12, fontFamily: "system-ui",
};
