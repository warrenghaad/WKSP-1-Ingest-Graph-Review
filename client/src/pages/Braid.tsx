import { useState, useMemo, type ReactElement } from "react";
import { Link } from "wouter";

// ── SVG geometry ──────────────────────────────────────────────────────────────
const T0       = -6500;  // earliest year shown
const T1       = -300;   // latest year shown
const TSPAN    = T1 - T0;
const SVG_W    = 5400;
const SVG_H    = 580;
const PL       = 170;    // left padding (strand labels)
const PR       = 80;
const PT       = 90;     // top padding (era labels)
const PB       = 70;     // bottom padding (time axis)
const PW       = SVG_W - PL - PR;
const PH       = SVG_H - PT - PB;
const N_LANES  = 8;      // vertical divisions
const OSC_AMP  = 28;     // sinusoidal oscillation amplitude (px)
const OSC_PER  = 680;    // oscillation period (years)
const GAP_PX   = 18;     // gap half-width for under-strand masking

const toX = (yr: number)   => PL + ((yr - T0) / TSPAN) * PW;
const toY = (lane: number) => PT + (lane / (N_LANES - 1)) * PH;

// ── Data model ────────────────────────────────────────────────────────────────
interface KP   { yr: number; lane: number }
interface MGIC { M: number; A: number; G: number; I: number; C: number }

interface Strand {
  id:    string;
  name:  string;
  short: string;
  color: string;
  start: number;
  end:   number;
  kp:    KP[];        // (year, lane) control points — lane 0 = top (most dominant)
  phi:   number;      // phase offset for oscillation
  thick: number;      // stroke-width multiplier
  magic: MGIC;
  desc:  string;
}

// Lane 0 = top/dominant, Lane 7 = bottom/peripheral
const STRANDS: Strand[] = [
  {
    id: "ubaid", name: "Ubaid Culture", short: "UBAID",
    color: "#b8864e", start: -6500, end: -3800,
    kp: [{yr:-6500,lane:3},{yr:-5500,lane:3.2},{yr:-4500,lane:3.8},{yr:-3800,lane:5.5}],
    phi: 0, thick: 1.5,
    magic: { M:0.25, A:0.65, G:0.6, I:0.5, C:0.15 },
    desc: "Pre-urban agricultural foundation. Painted pottery, communal temples, earliest long-distance trade. The deep root of all Mesopotamian civilization.",
  },
  {
    id: "uruk", name: "Uruk Period", short: "URUK",
    color: "#f5c518", start: -4000, end: -3100,
    kp: [{yr:-4000,lane:0},{yr:-3700,lane:0.4},{yr:-3500,lane:0},{yr:-3200,lane:0.6},{yr:-3100,lane:1.5}],
    phi: Math.PI * 0.4, thick: 2.5,
    magic: { M:0.75, A:0.9, G:0.95, I:0.95, C:0.8 },
    desc: "World's first cities. Writing, cylinder seals, the Warka Vase, mass-produced beveled-rim bowls. The Uruk Expansion spread institutional geometry across the Near East.",
  },
  {
    id: "sumer", name: "Sumerian / Early Dynastic", short: "SUMER",
    color: "#e8b500", start: -2900, end: -2154,
    kp: [{yr:-2900,lane:1},{yr:-2700,lane:0.5},{yr:-2500,lane:1.2},{yr:-2334,lane:3.5},{yr:-2154,lane:5}],
    phi: Math.PI * 0.8, thick: 1.8,
    magic: { M:0.7, A:0.85, G:0.9, I:0.9, C:0.7 },
    desc: "Competitive city-state hegemony. Epic of Gilgamesh, Law of Ur-Nammu, ziggurat temples. Mathematical brilliance without political unity.",
  },
  {
    id: "akkad", name: "Akkadian Empire", short: "AKKAD",
    color: "#dc2626", start: -2334, end: -2154,
    kp: [{yr:-2334,lane:0},{yr:-2280,lane:0.3},{yr:-2200,lane:0.6},{yr:-2154,lane:3}],
    phi: Math.PI * 1.2, thick: 2.2,
    magic: { M:0.5, A:0.7, G:0.85, I:0.8, C:0.95 },
    desc: "Sargon of Akkad: world's first empire. Military conquest, standardized administration, the birth of imperialism as ideology. The comptroller supreme.",
  },
  {
    id: "ur3", name: "Ur III Dynasty", short: "UR-III",
    color: "#f97316", start: -2112, end: -2004,
    kp: [{yr:-2112,lane:0},{yr:-2060,lane:0.4},{yr:-2020,lane:0.3},{yr:-2004,lane:5}],
    phi: Math.PI * 1.6, thick: 1.9,
    magic: { M:0.8, A:0.85, G:0.9, I:0.95, C:0.9 },
    desc: "Sumerian renaissance. Ziggurat of Ur, the most bureaucratic state of antiquity, standardized weights. Administrative geometry at its apex.",
  },
  {
    id: "babylon", name: "Babylonian", short: "BABYL",
    color: "#3b82f6", start: -1894, end: -539,
    kp: [
      {yr:-1894,lane:2},{yr:-1754,lane:0},{yr:-1595,lane:2.5},
      {yr:-1155,lane:3},{yr:-900,lane:3.5},{yr:-700,lane:4},{yr:-539,lane:6},
    ],
    phi: Math.PI * 2.0, thick: 3.0,
    magic: { M:0.9, A:0.75, G:0.85, I:0.85, C:0.85 },
    desc: "Hammurabi's Code. Plimpton 322 (Pythagorean triples). Astronomical archives. Babylon as the cultural capital of the world for over a millennium.",
  },
  {
    id: "assyria", name: "Assyrian Empire", short: "ASSYR",
    color: "#7c3aed", start: -2500, end: -609,
    kp: [
      {yr:-2500,lane:5.5},{yr:-2000,lane:5},{yr:-1500,lane:4.5},
      {yr:-1225,lane:3},{yr:-911,lane:1.5},{yr:-680,lane:0},{yr:-612,lane:1.2},{yr:-609,lane:7},
    ],
    phi: Math.PI * 2.4, thick: 2.2,
    magic: { M:0.6, A:0.65, G:0.75, I:0.8, C:0.98 },
    desc: "Library of Ashurbanipal. The Neo-Assyrian war machine. Mass deportations as imperial policy. Iron discipline and lion hunts in alabaster relief.",
  },
  {
    id: "neobab", name: "Neo-Babylonian", short: "N-BAB",
    color: "#06b6d4", start: -626, end: -539,
    kp: [{yr:-626,lane:3.5},{yr:-612,lane:1.5},{yr:-600,lane:0},{yr:-560,lane:0.5},{yr:-539,lane:6}],
    phi: Math.PI * 2.8, thick: 2.0,
    magic: { M:0.85, A:0.8, G:0.8, I:0.85, C:0.85 },
    desc: "Nebuchadnezzar II. Hanging Gardens. Etemenanki — the Tower of Babel. The last great flowering of Mesopotamian civilization before Persia.",
  },
];

// Historical events to mark on the timeline
interface Ev { yr: number; label: string; type: "conquest"|"collapse"|"culture"|"rise" }
const EVENTS: Ev[] = [
  { yr:-3500, label:"Warka Vase · Writing",       type:"culture"  },
  { yr:-2334, label:"Sargon Conquers Sumer",       type:"conquest" },
  { yr:-2112, label:"Ur-Nammu founds Ur III",      type:"rise"     },
  { yr:-2004, label:"Elamites Destroy Ur III",     type:"collapse" },
  { yr:-1754, label:"Hammurabi's Code",            type:"culture"  },
  { yr:-1595, label:"Hittites Sack Babylon",       type:"conquest" },
  { yr:-911,  label:"Neo-Assyrian Empire",         type:"rise"     },
  { yr:-612,  label:"Fall of Nineveh",             type:"collapse" },
  { yr:-539,  label:"Cyrus Takes Babylon",         type:"conquest" },
];

// Era spans for top labels
const ERAS = [
  { label:"Ubaid",              s:-6500, e:-3800 },
  { label:"Uruk",               s:-4000, e:-3100 },
  { label:"Early Dynastic",     s:-2900, e:-2350 },
  { label:"Akkadian",           s:-2334, e:-2154 },
  { label:"Ur III",             s:-2112, e:-2004 },
  { label:"Old Babylonian",     s:-1894, e:-1595 },
  { label:"Kassite / M.Assyr.", s:-1600, e:-912  },
  { label:"Neo-Assyrian",       s:-911,  e:-609  },
  { label:"Neo-Babylonian",     s:-626,  e:-539  },
];

// ── Path math ─────────────────────────────────────────────────────────────────
function laneAt(kp: KP[], yr: number): number {
  if (yr <= kp[0].yr) return kp[0].lane;
  if (yr >= kp[kp.length-1].yr) return kp[kp.length-1].lane;
  for (let i = 0; i < kp.length-1; i++) {
    if (yr >= kp[i].yr && yr <= kp[i+1].yr) {
      const t = (yr - kp[i].yr) / (kp[i+1].yr - kp[i].yr);
      const s = t*t*(3-2*t); // smoothstep
      return kp[i].lane + s*(kp[i+1].lane - kp[i].lane);
    }
  }
  return kp[kp.length-1].lane;
}

function yAt(s: Strand, yr: number): number {
  return toY(laneAt(s.kp, yr)) + OSC_AMP * Math.sin(2*Math.PI*yr/OSC_PER + s.phi);
}

function sample(s: Strand, step = 22): [number,number][] {
  const pts: [number,number][] = [];
  for (let yr = s.start; yr <= s.end; yr += step) pts.push([toX(yr), yAt(s, yr)]);
  pts.push([toX(s.end), yAt(s, s.end)]);
  return pts;
}

// Catmull-Rom → cubic bezier path
function catmull(pts: [number,number][]): string {
  if (pts.length < 2) return "";
  const d: string[] = [`M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`];
  for (let i = 0; i < pts.length-1; i++) {
    const [x0,y0] = pts[Math.max(0,i-1)];
    const [x1,y1] = pts[i];
    const [x2,y2] = pts[i+1];
    const [x3,y3] = pts[Math.min(pts.length-1,i+2)];
    const cp1x = x1+(x2-x0)/6, cp1y = y1+(y2-y0)/6;
    const cp2x = x2-(x3-x1)/6, cp2y = y2-(y3-y1)/6;
    d.push(`C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)} ${cp2x.toFixed(1)} ${cp2y.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`);
  }
  return d.join(" ");
}

// Find x-regions where strand A comes within GAP_PX of strand B (crossing zones)
function crossingRegions(a: Strand, b: Strand): [number,number][] {
  const regions: [number,number][] = [];
  const startYr = Math.max(a.start, b.start);
  const endYr   = Math.min(a.end,   b.end);
  if (startYr >= endYr) return [];
  const STEP = 12;
  let inRegion = false, rx0 = 0;
  for (let yr = startYr; yr <= endYr; yr += STEP) {
    const close = Math.abs(yAt(a, yr) - yAt(b, yr)) < GAP_PX;
    if (close && !inRegion)  { inRegion = true;  rx0 = toX(yr); }
    if (!close && inRegion)  { inRegion = false; regions.push([rx0, toX(yr)]); }
  }
  if (inRegion) regions.push([rx0, toX(endYr)]);
  return regions;
}

// Build SVG mask rect list for a strand that is "under" at certain x-regions
function buildMask(id: string, gapRegions: [number,number][]): ReactElement {
  return (
    <mask id={`mask-${id}`}>
      <rect x="0" y="0" width={SVG_W} height={SVG_H} fill="white" />
      {gapRegions.map(([x0, x1], i) => (
        <rect key={i} x={x0-4} y={PT-10} width={x1-x0+8} height={PH+20} fill="black" />
      ))}
    </mask>
  );
}

// ── Event colors ──────────────────────────────────────────────────────────────
const EV_COLOR: Record<string, string> = {
  conquest: "#ef4444", collapse: "#f97316", culture: "#eab308", rise: "#22c55e",
};

// ── MAGIC labels ──────────────────────────────────────────────────────────────
const MAGIC_LABELS: Record<keyof MGIC, string> = {
  M: "Mathematics", A: "Aesthetics", G: "Geo-Institutional", I: "Institutional", C: "Comptroller",
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function Braid() {
  const [selId, setSelId]     = useState<string|null>(null);
  const [hovId, setHovId]     = useState<string|null>(null);
  const activeId = selId ?? hovId;
  const sel = activeId ? STRANDS.find(s => s.id === activeId) ?? null : null;

  // Pre-compute paths and masks once
  const computed = useMemo(() => {
    const paths = STRANDS.map(s => ({ ...s, path: catmull(sample(s)) }));

    // For each strand, collect all gap regions where a more-dominant strand crosses over it
    const gapMap: Record<string, [number,number][]> = {};
    STRANDS.forEach(s => { gapMap[s.id] = []; });

    for (let i = 0; i < STRANDS.length; i++) {
      for (let j = 0; j < STRANDS.length; j++) {
        if (i === j) continue;
        const over  = STRANDS[i];
        const under = STRANDS[j];
        // "over" = higher C (comptroller) score = draws on top
        if (over.magic.C <= under.magic.C) continue;
        const regions = crossingRegions(over, under);
        gapMap[under.id].push(...regions);
      }
    }

    const masks = STRANDS.map(s => buildMask(s.id, gapMap[s.id]));
    return { paths, masks, gapMap };
  }, []);

  // Draw order: lower C score first (goes behind), higher C score last (on top)
  const drawOrder = useMemo(
    () => [...STRANDS].sort((a,b) => a.magic.C - b.magic.C),
    []
  );

  const tick500 = useMemo(() => {
    const ticks: number[] = [];
    for (let yr = Math.ceil(T0/500)*500; yr <= T1; yr += 500) ticks.push(yr);
    return ticks;
  }, []);

  return (
    <div style={{ width:"100vw", height:"100vh", background:"#05070f", display:"flex", flexDirection:"column", overflow:"hidden", fontFamily:"monospace" }}>

      {/* ── Header ── */}
      <div style={{
        display:"flex", alignItems:"center", gap:16,
        padding:"9px 20px", borderBottom:"1px solid #0a1828",
        background:"rgba(5,7,15,0.97)", flexShrink:0,
      }}>
        <Link to="/">
          <span style={{ color:"#2a4a6a", fontSize:11, cursor:"pointer", letterSpacing:1 }}>← HOME</span>
        </Link>
        <span style={{ color:"#1a2a40" }}>·</span>
        <Link to="/timeline">
          <span style={{ color:"#2a4a6a", fontSize:11, cursor:"pointer", letterSpacing:1 }}>TIMELINE</span>
        </Link>
        <Link to="/textreader">
          <span style={{ color:"#2a4a6a", fontSize:11, cursor:"pointer", letterSpacing:1 }}>TEXTREADER</span>
        </Link>
        <div style={{ flex:1, textAlign:"center" }}>
          <span style={{ color:"#b8864e", fontSize:13, fontWeight:700, letterSpacing:4 }}>
            BRAID THEORY · MESOPOTAMIA
          </span>
          <span style={{ color:"#2a3a50", fontSize:9, letterSpacing:2, marginLeft:12 }}>
            MAGIC CIRCUMNUTATING STRANDS · 6500 – 300 BCE
          </span>
        </div>
        <span style={{ color:"#1a3050", fontSize:10, letterSpacing:2 }}>
          {STRANDS.length} STRANDS
        </span>
      </div>

      {/* ── Body: SVG + optional info panel ── */}
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>

        {/* Scrollable SVG braid */}
        <div style={{ flex:1, overflowX:"auto", overflowY:"hidden", position:"relative" }}>
          <svg
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            width={SVG_W}
            height="100%"
            style={{ display:"block" }}
            onMouseLeave={() => setHovId(null)}
          >
            <defs>
              {/* Glow filters */}
              {STRANDS.map(s => (
                <filter key={s.id} id={`glow-${s.id}`} x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="7" result="blur1" />
                  <feGaussianBlur stdDeviation="3" result="blur2" />
                  <feMerge>
                    <feMergeNode in="blur1" />
                    <feMergeNode in="blur2" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              ))}
              {/* Over/under masks */}
              {computed.masks}
            </defs>

            {/* Background */}
            <rect width={SVG_W} height={SVG_H} fill="#05070f" />

            {/* Subtle vertical grid every 500 years */}
            {tick500.map(yr => (
              <line key={yr}
                x1={toX(yr)} y1={PT} x2={toX(yr)} y2={SVG_H-PB}
                stroke="#080f1c" strokeWidth={1}
              />
            ))}

            {/* Era brackets at top */}
            {ERAS.map(era => {
              const x0 = Math.max(toX(era.s), PL);
              const x1 = Math.min(toX(era.e), SVG_W - PR);
              if (x1 <= x0) return null;
              const cx = (x0+x1)/2;
              return (
                <g key={era.label}>
                  <line x1={x0} y1={PT-8}  x2={x0} y2={PT-2}  stroke="#0e1f30" strokeWidth={1} />
                  <line x1={x1} y1={PT-8}  x2={x1} y2={PT-2}  stroke="#0e1f30" strokeWidth={1} />
                  <line x1={x0} y1={PT-8}  x2={x1} y2={PT-8}  stroke="#0e1f30" strokeWidth={1} />
                  <text x={cx} y={PT-13} textAnchor="middle" fontSize={8} fill="#1a3a5a" fontFamily="monospace" letterSpacing="1">
                    {era.label.toUpperCase()}
                  </text>
                </g>
              );
            })}

            {/* Historical event markers */}
            {EVENTS.map(ev => {
              const x = toX(ev.yr);
              const col = EV_COLOR[ev.type];
              const isAbove = ev.yr % 1000 === 0;
              return (
                <g key={ev.label}>
                  <line x1={x} y1={PT} x2={x} y2={SVG_H-PB}
                    stroke={col} strokeWidth={1} strokeOpacity={0.25} strokeDasharray="3 6"
                  />
                  <circle cx={x} cy={SVG_H-PB+6} r={3} fill={col} fillOpacity={0.75} />
                  <text x={x} y={SVG_H-PB+20} textAnchor="middle" fontSize={7.5}
                    fill={col} fillOpacity={0.75} fontFamily="monospace">
                    {ev.label}
                  </text>
                </g>
              );
            })}

            {/* Time axis ticks */}
            {tick500.map(yr => (
              <text key={yr} x={toX(yr)} y={SVG_H-PB+36} textAnchor="middle"
                fontSize={8.5} fill="#1a2d40" fontFamily="monospace">
                {Math.abs(yr)} BCE
              </text>
            ))}

            {/* ── Strands (drawn in dominance order: weakest first, strongest last) ── */}
            {drawOrder.map(s => {
              const path  = computed.paths.find(p => p.id === s.id)!;
              const isHov = hovId === s.id;
              const isSel = selId === s.id;
              const isDim = !!(activeId && activeId !== s.id);
              const sw    = s.thick * (isHov||isSel ? 5 : 3);
              const op    = isDim ? 0.12 : (isHov||isSel ? 1 : 0.82);
              const hasMask = computed.gapMap[s.id].length > 0;

              return (
                <g key={s.id}>
                  {/* Soft halo behind each strand */}
                  <path d={path.path} fill="none"
                    stroke={s.color} strokeWidth={s.thick*16} strokeOpacity={0.06}
                    strokeLinecap="round"
                    mask={hasMask ? `url(#mask-${s.id})` : undefined}
                  />
                  {/* Main strand line */}
                  <path d={path.path} fill="none"
                    stroke={s.color} strokeWidth={sw} strokeOpacity={op}
                    strokeLinecap="round"
                    mask={hasMask ? `url(#mask-${s.id})` : undefined}
                    filter={isHov||isSel ? `url(#glow-${s.id})` : undefined}
                    style={{ cursor:"pointer", transition:"stroke-opacity 0.2s, stroke-width 0.15s" }}
                    onMouseEnter={() => setHovId(s.id)}
                    onMouseLeave={() => setHovId(null)}
                    onClick={() => setSelId(selId === s.id ? null : s.id)}
                  />
                </g>
              );
            })}

            {/* Strand start labels */}
            {STRANDS.map(s => {
              const isActive = activeId === s.id || !activeId;
              const x = toX(s.start);
              const y = yAt(s, s.start);
              return (
                <text key={s.id}
                  x={x-10} y={y+4}
                  textAnchor="end" fontSize={10.5}
                  fill={s.color} fillOpacity={isActive ? 0.9 : 0.2}
                  fontFamily="monospace" fontWeight="bold"
                  style={{ cursor:"pointer", userSelect:"none" }}
                  onMouseEnter={() => setHovId(s.id)}
                  onMouseLeave={() => setHovId(null)}
                  onClick={() => setSelId(selId === s.id ? null : s.id)}
                >
                  {s.short}
                </text>
              );
            })}

            {/* Strand end year labels */}
            {STRANDS.map(s => {
              const isActive = activeId === s.id || !activeId;
              const x = toX(s.end);
              const y = yAt(s, s.end);
              return (
                <text key={s.id}
                  x={x+8} y={y+4}
                  textAnchor="start" fontSize={8}
                  fill={s.color} fillOpacity={isActive ? 0.55 : 0.1}
                  fontFamily="monospace"
                >
                  {Math.abs(s.end)} BCE
                </text>
              );
            })}
          </svg>
        </div>

        {/* ── Info panel (right, appears on selection) ── */}
        {sel && (
          <div style={{
            width: 290, flexShrink: 0,
            background: "rgba(5,9,20,0.98)",
            borderLeft: `1px solid ${sel.color}30`,
            padding: 22,
            overflowY: "auto",
            display: "flex", flexDirection: "column", gap: 14,
          }}>
            {/* Strand title */}
            <div>
              <div style={{ color: sel.color, fontWeight:700, fontSize:14, letterSpacing:3, marginBottom:2 }}>
                {sel.short}
              </div>
              <div style={{ color:"#c0d4e8", fontSize:12, marginBottom:4 }}>{sel.name}</div>
              <div style={{ color:"#3a5a7a", fontSize:10, letterSpacing:1 }}>
                {Math.abs(sel.start)} – {Math.abs(sel.end)} BCE &nbsp;·&nbsp;
                {Math.abs(sel.end - sel.start)} years
              </div>
            </div>

            {/* Description */}
            <div style={{ color:"#8aabb8", fontSize:11, lineHeight:1.6, borderTop:"1px solid #0a1828", paddingTop:12 }}>
              {sel.desc}
            </div>

            {/* MAGIC bars */}
            <div style={{ borderTop:"1px solid #0a1828", paddingTop:12 }}>
              <div style={{ fontSize:9, color:"#2a4a6a", fontWeight:700, letterSpacing:1.5, marginBottom:10, textTransform:"uppercase" }}>
                MAGIC Profile
              </div>
              {(["M","A","G","I","C"] as const).map(k => (
                <div key={k} style={{ marginBottom:8 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                    <span style={{ fontSize:9, color:"#4a6a8a" }}>{k} · {MAGIC_LABELS[k]}</span>
                    <span style={{ fontSize:9, color:"#6a9aaa" }}>{Math.round(sel.magic[k]*100)}%</span>
                  </div>
                  <div style={{ height:4, background:"#060e1a", borderRadius:2 }}>
                    <div style={{
                      height:"100%", borderRadius:2,
                      width:`${sel.magic[k]*100}%`,
                      background: sel.color,
                      boxShadow:`0 0 8px ${sel.color}66`,
                      transition:"width 0.4s",
                    }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Events during this civ's active period */}
            <div style={{ borderTop:"1px solid #0a1828", paddingTop:12 }}>
              <div style={{ fontSize:9, color:"#2a4a6a", fontWeight:700, letterSpacing:1.5, marginBottom:8, textTransform:"uppercase" }}>
                Key Events
              </div>
              {EVENTS.filter(ev => ev.yr >= sel.start && ev.yr <= sel.end).map(ev => (
                <div key={ev.label} style={{ display:"flex", gap:8, marginBottom:6, alignItems:"flex-start" }}>
                  <span style={{ color: EV_COLOR[ev.type], fontSize:10, flexShrink:0 }}>◆</span>
                  <div>
                    <span style={{ color:"#4a7a8a", fontSize:9 }}>{Math.abs(ev.yr)} BCE &nbsp;</span>
                    <span style={{ color:"#8aabb8", fontSize:9 }}>{ev.label}</span>
                  </div>
                </div>
              ))}
              {EVENTS.filter(ev => ev.yr >= sel.start && ev.yr <= sel.end).length === 0 && (
                <div style={{ color:"#1a2a40", fontSize:10 }}>No marked events in this period.</div>
              )}
            </div>

            <button
              onClick={() => setSelId(null)}
              style={{
                marginTop:"auto", padding:"7px 0", borderRadius:4,
                border:`1px solid ${sel.color}30`, background:"transparent",
                color: sel.color, fontSize:10, cursor:"pointer", letterSpacing:1.5,
              }}
            >
              CLOSE
            </button>
          </div>
        )}
      </div>

      {/* ── Legend bar at bottom ── */}
      <div style={{
        display:"flex", gap:18, padding:"8px 20px",
        borderTop:"1px solid #080f1c", background:"rgba(5,7,15,0.97)",
        flexShrink:0, overflowX:"auto",
      }}>
        {STRANDS.map(s => (
          <div
            key={s.id}
            data-testid={`legend-${s.id}`}
            style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer", flexShrink:0 }}
            onMouseEnter={() => setHovId(s.id)}
            onMouseLeave={() => setHovId(null)}
            onClick={() => setSelId(selId === s.id ? null : s.id)}
          >
            <div style={{
              width:28, height:3, borderRadius:2,
              background: s.color,
              boxShadow: selId === s.id || hovId === s.id ? `0 0 8px ${s.color}` : "none",
            }} />
            <span style={{
              fontSize:9.5, fontFamily:"monospace", letterSpacing:1,
              color: selId === s.id || hovId === s.id ? s.color : "#2a4a6a",
              transition:"color 0.15s",
            }}>
              {s.short}
            </span>
          </div>
        ))}
        <div style={{ flex:1 }} />
        <span style={{ fontSize:9, color:"#1a2a40", letterSpacing:1, alignSelf:"center" }}>
          Click strand or legend to inspect · Scroll to explore timeline
        </span>
      </div>
    </div>
  );
}
