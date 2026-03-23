import { useState, useEffect, useRef } from "react";

const T = {
  night: "#0D1B2A", lapis: "#1B3A5C", gold: "#C8A84E", clay: "#E8D5B7",
  parch: "#FAF6EE", brown: "#3D2B1F", regM: "#5B7FA5", regF: "#6B8F5B", regB: "#8B6BAF",
  sGold: "#D4A843", sBlue: "#4A7FB5", sRose: "#B5647A",
};
const rc = r => r === "m" ? T.regM : r === "f" ? T.regF : T.regB;
const rl = r => r === "m" ? "METAPHOR" : r === "f" ? "FUNCTION" : "BOTH";

const POWERS = [
  { id:"d8", name:"D₈ Symmetry", icon:"✦", color:T.sGold, short:"16 isometries · 8 rot + 8 ref", geo:"Two overlapping squares at 45° rotation", percept:"Eye pulled outward equally in all directions — radiance", schema:"Divine radiance — power emanating without diminishing", level:3 },
  { id:"radial", name:"Radial Composition", icon:"◎", color:T.sBlue, short:"All points equidistant from center", geo:"Every tip same distance from center point", percept:"No preferred direction — forced to take in the whole", schema:"Cosmic order — all things at equal distance from center", level:2 },
  { id:"overlap", name:"Square Overlap", icon:"⬡", color:T.sRose, short:"Two forms → one emergent form", geo:"Two complete squares produce new shape at 45°", percept:"Brain oscillates between seeing two squares vs one star", schema:"Duality unified — love AND war in one being", level:2 },
];

const ARTIFACTS = [
  { id:"gate", name:"Ishtar Gate Rosette", loc:"Pergamon Museum", date:"c. 575 BCE", mat:"Glazed brick", powers:["d8","radial"], desc:"8-pointed star on deep cobalt processional way. Every person entering Babylon passes under Ishtar's radiating geometry." },
  { id:"kudurru", name:"Kudurru of Meli-Shipak II", loc:"Musée du Louvre", date:"c. 1186 BCE", mat:"Black limestone", powers:["d8","overlap"], desc:"Legal document with celestial register. Ishtar's star validates land rights — divine witness encoded in geometry." },
  { id:"seal", name:"Cylinder Seal of Ishtar", loc:"British Museum", date:"c. 2300 BCE", mat:"Lapis lazuli", powers:["d8","radial","overlap"], desc:"All three powers deployed simultaneously. Complete geometric identity in a pocket-sized rolling cylinder." },
];

const CULTURE_OBJECTS = [
  { name: "Temple Frieze", type: "Architecture", img: "Repeated star rosettes along temple upper register", found: "Uruk, Eanna complex" },
  { name: "Royal Cylinder Seal", type: "Administrative", img: "Star flanking enthroned deity on seal impression", found: "Ur III period" },
  { name: "Glazed Brick Panel", type: "Monumental", img: "Golden star on cobalt ground, Ishtar Gate", found: "Babylon, 6th c. BCE" },
  { name: "Boundary Stone", type: "Legal", img: "Star in celestial register of kudurru", found: "Kassite period" },
  { name: "Amulet / Jewelry", type: "Personal", img: "8-pointed star pendant in gold or lapis", found: "Royal Cemetery of Ur" },
  { name: "Pottery Stamp", type: "Domestic", img: "Star stamp on storage vessel rim", found: "Various Mesopotamian sites" },
];

const INVENTIONS_TIMELINE = [
  { year: "3500 BCE", name: "Potter's Wheel", desc: "Radial symmetry enables continuous rotational forming", geo: "Circle → rotation axis" },
  { year: "3000 BCE", name: "Surveyor's Compass", desc: "8-fold division of horizon for field measurement", geo: "D₈ → angular partition" },
  { year: "2100 BCE", name: "Ziggurat Orientation", desc: "Corners aligned to cardinal + intercardinal directions", geo: "8-pointed reference frame" },
  { year: "600 BCE", name: "Compass Rose", desc: "Navigation instrument: D₈ divides horizon into 8 bearings", geo: "D₈ → directional sectors" },
  { year: "300 BCE", name: "Astrolabe", desc: "Circular instrument with 8-fold graduated scale", geo: "Radial composition → angular measurement" },
];

const MATH_STEPS = [
  { step: 1, title: "Draw the circle", desc: "Any circle. Mark the center point.", visual: "circle" },
  { step: 2, title: "Draw diameter", desc: "Straight line through center. Two equal halves: 180° each.", visual: "diameter" },
  { step: 3, title: "Draw perpendicular diameter", desc: "Cross the first at 90°. Four equal sectors: 90° each.", visual: "cross" },
  { step: 4, title: "Bisect each quadrant", desc: "45° lines through center. Eight equal sectors: 45° each.", visual: "octant" },
  { step: 5, title: "Connect the points", desc: "Two overlapping squares at 45° rotation. D₈ = 8 rotations × 2 (with reflections) = 16 isometries.", visual: "star" },
];

const SECTIONS = [
  { id:"A1", name:"Myth", icon:"🎭", type:"cinematic", reg:"m" },
  { id:"A2", name:"Identify", icon:"⚔", type:"character-sheet", reg:"m" },
  { id:"A3", name:"Connect", icon:"📖", type:"lore-codex", reg:"m" },
  { id:"A4", name:"Culture", icon:"🏺", type:"collection", reg:"m" },
  { id:"A5", name:"Teach", icon:"🎓", type:"tutorial", reg:"m" },
  { id:"A6", name:"Create", icon:"✂", type:"workshop", reg:"m" },
  { id:"A7", name:"Bridge", icon:"🏛", type:"split-reveal", reg:"b" },
  { id:"B1", name:"Review", icon:"↩", type:"recap", reg:"b" },
  { id:"B2", name:"Proof", icon:"📐", type:"whiteboard", reg:"f" },
  { id:"B3", name:"Transform", icon:"🔄", type:"animation", reg:"f" },
  { id:"B4", name:"Mechanics", icon:"⚙", type:"schematic", reg:"f" },
  { id:"B5", name:"History", icon:"📊", type:"tech-tree", reg:"f" },
  { id:"B6", name:"Invention", icon:"💡", type:"blueprint", reg:"f" },
  { id:"B7", name:"Build", icon:"🔧", type:"build-guide", reg:"f" },
  { id:"B8", name:"Synthesis", icon:"∞", type:"superimpose", reg:"b" },
];

function Star8({ size=60, stroke=T.gold, opacity=0.6 }) {
  const s = size/2;
  return (
    <svg viewBox="0 0 80 80" width={size} height={size}>
      <rect x="20" y="20" width="40" height="40" fill="none" stroke={stroke} strokeWidth="1.5" opacity={opacity} />
      <rect x="20" y="20" width="40" height="40" fill="none" stroke={stroke} strokeWidth="1.5" opacity={opacity} transform="rotate(45 40 40)" />
      <circle cx="40" cy="40" r="2.5" fill={stroke} opacity={opacity} />
    </svg>
  );
}

function PowerBadge({ power, small, active, onClick }) {
  return (
    <button onClick={onClick} style={{ display:"inline-flex", alignItems:"center", gap:4, background: active?`${power.color}22`:"transparent", border:`1.5px solid ${active?power.color:power.color+"44"}`, borderRadius:16, padding: small?"2px 8px":"4px 12px", cursor:"pointer", transition:"all 0.2s" }}>
      <span style={{ fontSize: small?10:13, color:power.color }}>{power.icon}</span>
      <span style={{ fontSize: small?9:11, color:power.color, fontWeight:600 }}>{power.name}</span>
    </button>
  );
}

// ═══ A1: CINEMATIC ═══
function A1Cinematic() {
  const [beat, setBeat] = useState(0);
  const beats = [
    { act:"I", title:"The World Before", narration:"Long ago, before the first city had walls, the people of Sumer looked up at the evening sky and saw the brightest light moving across the heavens...", img:"Mesopotamian landscape at dusk — vast plain, distant ziggurat silhouette, single brilliant star on horizon", camera:"Slow zoom in on star", mood:"somber" },
    { act:"I", title:"The Problem", narration:"Ishtar watched from above. She saw everything — love and war, birth and death — but the people could not see her. They looked up and saw only light, not meaning.", img:"Ishtar as radiant figure above city, but her form is blurred, indistinct — the people below shield their eyes", camera:"Slow pan down from sky to people", mood:"searching" },
    { act:"II", title:"Wrong Shape", narration:"She tried a circle — but it had no direction. A triangle — too sharp, too few paths. A square — too rigid, too earthbound. None of them could carry her fullness.", img:"Three failed shapes floating and dissolving — circle, triangle, square — each cracking apart", camera:"Hold, shapes appear and fade", mood:"tension" },
    { act:"II", title:"The Discovery", narration:"Then she took two squares and turned one 45 degrees. Suddenly — eight points. Eight directions. Light radiating outward from every angle at once. Equal in all directions. Infinite reach.", img:"Two golden squares overlapping at 45° — the 8-pointed star forms in a burst of golden light", camera:"Slow zoom in as star forms", mood:"revelation" },
    { act:"III", title:"The Star Lives", narration:"The people carved her star into their gates, their seals, their boundary stones. Wherever they needed Ishtar to see, they placed her geometry. And she saw.", img:"Montage: star on Ishtar Gate, on cylinder seals, on boundary stones — all glowing with the same golden light", camera:"Slow pan across artifacts", mood:"majesty" },
  ];
  const b = beats[beat];
  const actColor = b.act === "I" ? "#667" : b.act === "II" ? T.gold : "#8B6BAF";

  return (
    <div style={{ flex:1, background:"#000", display:"flex", flexDirection:"column", position:"relative", overflow:"hidden" }}>
      {/* Cinematic black bars */}
      <div style={{ height:40, background:"#000", zIndex:2 }} />
      
      {/* Image area */}
      <div style={{ flex:1, background:`linear-gradient(180deg, ${T.night} 0%, #111 100%)`, display:"flex", alignItems:"center", justifyContent:"center", position:"relative", padding:40 }}>
        <div style={{ position:"absolute", top:20, left:24, display:"flex", gap:8, alignItems:"center", zIndex:2 }}>
          <span style={{ fontSize:9, letterSpacing:3, color:actColor, fontWeight:700 }}>ACT {b.act}</span>
          <span style={{ fontSize:11, color:"#555" }}>·</span>
          <span style={{ fontSize:11, color:"#666", fontStyle:"italic" }}>{b.title}</span>
        </div>
        
        <div style={{ maxWidth:500, textAlign:"center" }}>
          <div style={{ fontSize:11, color:"#555", fontStyle:"italic", lineHeight:1.6, marginBottom:16 }}>[ {b.img} ]</div>
          <div style={{ fontSize:9, color:"#444", letterSpacing:1 }}>CAMERA: {b.camera}</div>
        </div>

        {b.act === "III" && <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", opacity:0.08 }}><Star8 size={300} /></div>}
      </div>

      {/* Narration bar */}
      <div style={{ background:"rgba(0,0,0,0.9)", padding:"20px 40px", borderTop:"1px solid #222", minHeight:100 }}>
        <div style={{ fontSize:14, lineHeight:1.8, color:"#ccc", fontFamily:"Georgia, serif", fontStyle:"italic", maxWidth:600, margin:"0 auto", textAlign:"center" }}>
          "{b.narration}"
        </div>
      </div>
      
      <div style={{ height:40, background:"#000", zIndex:2 }} />

      {/* Beat navigation */}
      <div style={{ position:"absolute", bottom:48, left:"50%", transform:"translateX(-50%)", display:"flex", gap:6, zIndex:10 }}>
        {beats.map((_, i) => (
          <button key={i} onClick={() => setBeat(i)} style={{ width: i===beat?24:8, height:8, borderRadius:4, background: i===beat ? T.gold : "#333", border:"none", cursor:"pointer", transition:"all 0.3s" }} />
        ))}
      </div>
    </div>
  );
}

// ═══ A2: CHARACTER SHEET ═══
function A2CharacterSheet({ onNav }) {
  const [exp, setExp] = useState(null);
  return (
    <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
      <div style={{ width:240, background:`linear-gradient(180deg, ${T.night} 0%, ${T.lapis} 100%)`, padding:20, display:"flex", flexDirection:"column", gap:12, borderRight:`1px solid ${T.lapis}` }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ width:100, height:100, borderRadius:"50%", margin:"0 auto 8px", background:`radial-gradient(circle at 40% 40%, ${T.gold}44, ${T.night})`, border:`2px solid ${T.gold}33`, display:"flex", alignItems:"center", justifyContent:"center" }}><Star8 size={60} /></div>
          <div style={{ fontSize:9, letterSpacing:3, color:T.gold }}>DEITY PROFILE</div>
          <div style={{ fontSize:22, fontWeight:700, color:T.gold, fontFamily:"Georgia,serif" }}>Ishtar</div>
          <div style={{ fontSize:11, color:T.clay, fontStyle:"italic" }}>Love · War · Venus</div>
        </div>
        <div style={{ fontSize:10, color:"#999", lineHeight:1.6, borderTop:`1px solid ${T.lapis}`, paddingTop:10 }}>
          The only deity who rules opposite domains. Descends to the underworld and returns. Demands to be seen.
        </div>
        <div style={{ marginTop:"auto", background:`${T.gold}11`, border:`1px solid ${T.gold}33`, borderRadius:8, padding:10, textAlign:"center" }}>
          <div style={{ fontSize:16, color:T.gold, fontWeight:700, fontFamily:"Georgia,serif" }}>8-Pointed Star</div>
          <div style={{ fontSize:9, color:"#888" }}>Week 3 · Grade 5</div>
        </div>
      </div>
      <div style={{ flex:1, background:T.parch, padding:24, overflowY:"auto" }}>
        <div style={{ fontSize:9, letterSpacing:3, color:"#999", marginBottom:2 }}>GEOMETRIC POWERS</div>
        <div style={{ fontSize:14, fontWeight:700, color:T.brown, fontFamily:"Georgia,serif", marginBottom:16 }}>Visual Rhetoric Analysis</div>
        {POWERS.map(p => (
          <div key={p.id} style={{ background:"#fff", borderRadius:10, border:`1.5px solid ${exp===p.id?p.color:"#e0ddd8"}`, marginBottom:10, overflow:"hidden", transition:"all 0.3s" }}>
            <button onClick={() => setExp(exp===p.id?null:p.id)} style={{ width:"100%", background:"none", border:"none", cursor:"pointer", padding:"12px 16px", display:"flex", alignItems:"center", gap:10, textAlign:"left" }}>
              <div style={{ width:36, height:36, borderRadius:"50%", background:`${p.color}15`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, color:p.color, border:`2px solid ${p.color}33`, flexShrink:0 }}>{p.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:700, color:T.brown }}>{p.name}</div>
                <div style={{ fontSize:10, color:"#888" }}>{p.short}</div>
              </div>
              <div style={{ display:"flex", gap:2 }}>{[0,1,2].map(i => <div key={i} style={{ width:7, height:7, borderRadius:"50%", background:i<p.level?p.color:"#ddd" }} />)}</div>
              <span style={{ color:"#bbb", transform:exp===p.id?"rotate(180deg)":"none", transition:"transform 0.2s" }}>▾</span>
            </button>
            {exp===p.id && (
              <div style={{ padding:"0 16px 16px" }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6, marginBottom:10 }}>
                  {[["GEOMETRIC",p.geo,`${p.color}08`],["PERCEPTUAL",p.percept,`${p.color}12`],["SCHEMA",p.schema,`${p.color}18`]].map(([t,c,bg],i) => (
                    <div key={i} style={{ background:bg, borderRadius:6, padding:10 }}>
                      <div style={{ fontSize:7, letterSpacing:2, color:p.color, fontWeight:700, marginBottom:4 }}>{t}</div>
                      <div style={{ fontSize:10, lineHeight:1.5, color:"#444" }}>{c}</div>
                    </div>
                  ))}
                </div>
                <button onClick={() => onNav(2, p.id)} style={{ background:p.color, color:"#fff", border:"none", borderRadius:6, padding:"6px 14px", fontSize:10, fontWeight:700, cursor:"pointer" }}>See in artifacts →</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══ A3: LORE CODEX ═══
function A3LoreCodex({ highlight, onNav }) {
  const [sel, setSel] = useState(0);
  const [filt, setFilt] = useState(highlight);
  const filtered = filt ? ARTIFACTS.filter(a=>a.powers.includes(filt)) : ARTIFACTS;
  const a = ARTIFACTS[sel];
  return (
    <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
      <div style={{ width:240, background:T.night, padding:14, display:"flex", flexDirection:"column", gap:6, borderRight:`1px solid ${T.lapis}`, overflowY:"auto" }}>
        <button onClick={() => onNav(1)} style={{ background:"none", border:`1px solid ${T.lapis}`, borderRadius:6, padding:"5px 10px", color:T.gold, fontSize:10, cursor:"pointer", textAlign:"left" }}>← Character Sheet</button>
        <div style={{ fontSize:8, letterSpacing:3, color:T.gold, marginTop:4 }}>FILTER BY POWER</div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:3 }}>
          <button onClick={()=>setFilt(null)} style={{ background:!filt?`${T.gold}22`:"transparent", border:`1px solid ${!filt?T.gold:"#444"}`, borderRadius:10, padding:"2px 8px", fontSize:9, color:!filt?T.gold:"#666", cursor:"pointer" }}>All</button>
          {POWERS.map(p => <button key={p.id} onClick={()=>setFilt(filt===p.id?null:p.id)} style={{ background:filt===p.id?`${p.color}22`:"transparent", border:`1px solid ${filt===p.id?p.color:"#444"}`, borderRadius:10, padding:"2px 8px", fontSize:9, color:filt===p.id?p.color:"#666", cursor:"pointer" }}>{p.icon} {p.name}</button>)}
        </div>
        <div style={{ fontSize:8, letterSpacing:3, color:"#555", marginTop:4 }}>ARTIFACTS ({filtered.length})</div>
        {filtered.map((ar,i) => { const ri=ARTIFACTS.indexOf(ar); return (
          <button key={ar.id} onClick={()=>setSel(ri)} style={{ background:ri===sel?T.lapis:`${T.lapis}44`, border:ri===sel?`1px solid ${T.gold}33`:"1px solid transparent", borderRadius:6, padding:10, cursor:"pointer", textAlign:"left" }}>
            <div style={{ fontSize:11, fontWeight:600, color:ri===sel?T.gold:T.clay }}>{ar.name}</div>
            <div style={{ fontSize:9, color:"#888" }}>{ar.date}</div>
          </button>
        );})}
      </div>
      <div style={{ flex:1, background:T.parch, padding:24, overflowY:"auto" }}>
        <div style={{ fontSize:9, letterSpacing:3, color:"#999", marginBottom:12 }}>LORE CODEX · Ishtar · 8-Pointed Star</div>
        <div style={{ background:"#fff", borderRadius:10, border:"1px solid #e0ddd8", marginBottom:16, overflow:"hidden" }}>
          <div style={{ background:`linear-gradient(135deg, ${T.lapis}11, ${T.clay}44)`, padding:28, textAlign:"center", fontSize:11, color:"#888", fontStyle:"italic" }}>[ {a.desc.substring(0,60)}... ]</div>
          <div style={{ padding:"14px 18px" }}>
            <div style={{ fontSize:18, fontWeight:700, color:T.brown, fontFamily:"Georgia,serif" }}>{a.name}</div>
            <div style={{ fontSize:11, color:"#888" }}>{a.date} · {a.mat} · {a.loc}</div>
            <div style={{ display:"flex", gap:4, marginTop:8 }}>{a.powers.map(pid => { const pw=POWERS.find(p=>p.id===pid); return pw ? <PowerBadge key={pid} power={pw} small active={filt===pid} onClick={()=>setFilt(filt===pid?null:pid)} /> : null; })}</div>
          </div>
        </div>
        <div style={{ fontSize:13, lineHeight:1.8, color:"#444", fontFamily:"Georgia,serif" }}>{a.desc}</div>
      </div>
    </div>
  );
}

// ═══ A4: COLLECTION GALLERY ═══
function A4Collection() {
  const [sel, setSel] = useState(null);
  return (
    <div style={{ flex:1, background:T.parch, padding:24, overflowY:"auto" }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
        <div style={{ fontSize:9, letterSpacing:3, color:"#999" }}>MATERIAL CULTURE</div>
        <div style={{ flex:1, height:1, background:"#ddd" }} />
        <div style={{ fontSize:11, color:"#999" }}>{CULTURE_OBJECTS.length} / 6 explored</div>
        <div style={{ display:"flex", gap:3 }}>{CULTURE_OBJECTS.map((_,i) => <div key={i} style={{ width:8, height:8, borderRadius:"50%", background:T.gold }} />)}</div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
        {CULTURE_OBJECTS.map((obj, i) => (
          <button key={i} onClick={() => setSel(sel===i?null:i)} style={{
            background: sel===i ? `linear-gradient(135deg, ${T.lapis}11, ${T.gold}11)` : "#fff",
            border: sel===i ? `2px solid ${T.gold}` : "1px solid #e0ddd8", borderRadius:12, padding:0, cursor:"pointer", overflow:"hidden", textAlign:"left", transition:"all 0.2s",
          }}>
            <div style={{ background:`${T.clay}88`, height:80, display:"flex", alignItems:"center", justifyContent:"center", position:"relative" }}>
              <div style={{ fontSize:10, color:"#888", fontStyle:"italic", padding:8, textAlign:"center" }}>[ {obj.img} ]</div>
              <div style={{ position:"absolute", top:6, right:6, background:T.lapis, color:"#fff", fontSize:8, padding:"2px 6px", borderRadius:4, letterSpacing:1 }}>{obj.type.toUpperCase()}</div>
            </div>
            <div style={{ padding:12 }}>
              <div style={{ fontSize:13, fontWeight:700, color:T.brown }}>{obj.name}</div>
              <div style={{ fontSize:10, color:"#888", marginTop:2 }}>{obj.found}</div>
              {sel===i && (
                <div style={{ marginTop:8, paddingTop:8, borderTop:`1px solid ${T.gold}33`, fontSize:10, color:"#666", lineHeight:1.5 }}>
                  <div style={{ display:"flex", gap:4, marginBottom:4 }}>
                    {POWERS.slice(0, i%3===0?3:i%3===1?2:1).map(p => <PowerBadge key={p.id} power={p} small />)}
                  </div>
                  Geometric element appears in {obj.type.toLowerCase()} context as both symbolic marker and structural feature.
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ═══ A5: TUTORIAL ═══
function A5Tutorial() {
  const steps = [
    { n:1, title:"Draw two squares", desc:"Same size, one aligned to your page edges.", visual:"Two separate squares side by side" },
    { n:2, title:"Rotate the second 45°", desc:"Place it directly on top of the first, rotated.", visual:"Overlapping squares forming star" },
    { n:3, title:"Identify the 8 points", desc:"Where the edges cross — those are your star's tips.", visual:"Star with numbered vertex points" },
    { n:4, title:"Trace the outline", desc:"Connect the outermost points. The 8-pointed star emerges.", visual:"Clean star outline" },
    { n:5, title:"Add symmetry axes", desc:"Draw lines through center and each point. Count: 8 lines.", visual:"Star with all 8 symmetry axes drawn" },
  ];
  const [active, setActive] = useState(0);
  return (
    <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
      <div style={{ width:200, background:"#fff", borderRight:"1px solid #e0ddd8", padding:16, display:"flex", flexDirection:"column", gap:4 }}>
        <div style={{ fontSize:9, letterSpacing:3, color:T.regM, marginBottom:8, fontWeight:700 }}>CONSTRUCTION STEPS</div>
        {steps.map((s,i) => (
          <button key={i} onClick={() => setActive(i)} style={{
            background: i===active ? `${T.regM}12` : "transparent",
            border: i<=active ? `1px solid ${T.regM}33` : "1px solid #eee", borderRadius:8, padding:"8px 10px", cursor:"pointer", textAlign:"left", display:"flex", gap:8, alignItems:"center",
          }}>
            <div style={{ width:24, height:24, borderRadius:"50%", background: i<active ? T.regM : i===active ? `${T.regM}22` : "#f0f0f0", color: i<active ? "#fff" : i===active ? T.regM : "#ccc", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, flexShrink:0, border: i===active ? `2px solid ${T.regM}` : "none" }}>
              {i<active ? "✓" : s.n}
            </div>
            <div style={{ fontSize:11, fontWeight: i===active ? 700 : 400, color: i===active ? T.brown : "#888" }}>{s.title}</div>
          </button>
        ))}
      </div>
      <div style={{ flex:1, background:T.parch, padding:32, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
        <div style={{ fontSize:9, letterSpacing:3, color:T.regM, marginBottom:16 }}>STEP {steps[active].n} OF {steps.length}</div>
        <div style={{ background:"#fff", borderRadius:12, width:"100%", maxWidth:400, padding:32, textAlign:"center", border:"1px solid #e0ddd8", marginBottom:20 }}>
          <div style={{ fontSize:11, color:"#888", fontStyle:"italic", marginBottom:12 }}>[ {steps[active].visual} ]</div>
          <Star8 size={120} opacity={0.3 + (active * 0.15)} />
        </div>
        <div style={{ textAlign:"center", maxWidth:400 }}>
          <div style={{ fontSize:18, fontWeight:700, color:T.brown, fontFamily:"Georgia,serif", marginBottom:8 }}>{steps[active].title}</div>
          <div style={{ fontSize:13, color:"#666", lineHeight:1.6 }}>{steps[active].desc}</div>
        </div>
        <div style={{ display:"flex", gap:8, marginTop:20 }}>
          <button onClick={() => setActive(Math.max(0,active-1))} disabled={active===0} style={{ background:"none", border:`1px solid ${active===0?"#ddd":T.regM}`, borderRadius:6, padding:"6px 16px", cursor:active===0?"default":"pointer", color:active===0?"#ddd":T.regM, fontSize:12 }}>← Back</button>
          <button onClick={() => setActive(Math.min(steps.length-1,active+1))} disabled={active===steps.length-1} style={{ background:active<steps.length-1?T.regM:"#ddd", color:"#fff", border:"none", borderRadius:6, padding:"6px 16px", cursor:active<steps.length-1?"pointer":"default", fontSize:12 }}>Next →</button>
        </div>
      </div>
    </div>
  );
}

// ═══ A7: SPLIT REVEAL ═══
function A7SplitReveal() {
  const [split, setSplit] = useState(50);
  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <div style={{ flex:1, display:"flex", position:"relative" }}>
        {/* Left: Metaphor */}
        <div style={{ width:`${split}%`, background:`linear-gradient(135deg, ${T.lapis}22, ${T.regM}11)`, padding:32, display:"flex", flexDirection:"column", justifyContent:"center", overflow:"hidden", transition:"width 0.3s" }}>
          <div style={{ fontSize:9, letterSpacing:3, color:T.regM, marginBottom:12 }}>METAPHOR REGISTER</div>
          <div style={{ fontSize:11, color:"#888", fontStyle:"italic", marginBottom:16 }}>[ Ishtar Gate — star rosette as divine presence ]</div>
          <div style={{ fontSize:14, lineHeight:1.7, color:"#444" }}>
            The 8-pointed star on the Ishtar Gate is Ishtar watching. Every person who enters Babylon passes under her radiating geometry. The star is not decoration — it is <strong>divine surveillance encoded in brick</strong>.
          </div>
          <div style={{ display:"flex", gap:4, marginTop:12 }}>
            {POWERS.map(p => <PowerBadge key={p.id} power={p} small />)}
          </div>
        </div>
        {/* Divider */}
        <div style={{ width:4, background:T.gold, cursor:"col-resize", position:"relative", zIndex:5 }} onMouseDown={e => {
          const start = e.clientX;
          const startSplit = split;
          const move = ev => setSplit(Math.max(20, Math.min(80, startSplit + (ev.clientX - start) / window.innerWidth * 100)));
          const up = () => { document.removeEventListener("mousemove", move); document.removeEventListener("mouseup", up); };
          document.addEventListener("mousemove", move); document.addEventListener("mouseup", up);
        }}>
          <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:24, height:24, borderRadius:"50%", background:T.gold, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ fontSize:10, color:T.night }}>⟷</span>
          </div>
        </div>
        {/* Right: Function */}
        <div style={{ flex:1, background:`linear-gradient(135deg, ${T.regF}11, ${T.regF}22)`, padding:32, display:"flex", flexDirection:"column", justifyContent:"center", overflow:"hidden" }}>
          <div style={{ fontSize:9, letterSpacing:3, color:T.regF, marginBottom:12 }}>FUNCTION REGISTER</div>
          <div style={{ fontSize:11, color:"#888", fontStyle:"italic", marginBottom:16 }}>[ Same building — structural load distribution ]</div>
          <div style={{ fontSize:14, lineHeight:1.7, color:"#444" }}>
            The same gate uses the 8-pointed geometry to distribute structural load across the arch. The rosettes aren't just surface — they're <strong>interlocking brick units</strong> whose angular precision prevents lateral collapse.
          </div>
        </div>
      </div>
      {/* Bridge question */}
      <div style={{ background:T.night, padding:"20px 32px", textAlign:"center", borderTop:`3px solid ${T.gold}` }}>
        <div style={{ fontSize:9, letterSpacing:3, color:T.gold, marginBottom:8 }}>BRIDGE QUESTION</div>
        <div style={{ fontSize:18, color:T.clay, fontFamily:"Georgia,serif", fontStyle:"italic" }}>
          "We've seen what the 8-pointed star MEANS. Tomorrow: what does it DO?"
        </div>
      </div>
    </div>
  );
}

// ═══ B2: WHITEBOARD ═══
function B2Whiteboard() {
  const [step, setStep] = useState(0);
  const s = MATH_STEPS[step];
  return (
    <div style={{ flex:1, background:"#fff", display:"flex", flexDirection:"column" }}>
      <div style={{ padding:"12px 24px", borderBottom:"1px solid #eee", display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ fontSize:9, letterSpacing:3, color:T.regF, fontWeight:700 }}>MATHEMATICAL PROOF</div>
        <div style={{ flex:1 }} />
        {MATH_STEPS.map((_, i) => (
          <button key={i} onClick={() => setStep(i)} style={{ width: i===step?20:10, height:6, borderRadius:3, background: i<=step ? T.regF : "#ddd", border:"none", cursor:"pointer", transition:"all 0.2s" }} />
        ))}
      </div>
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:40 }}>
        <div style={{ textAlign:"center" }}>
          <svg viewBox="0 0 200 200" width="200" height="200" style={{ marginBottom:20 }}>
            <circle cx="100" cy="100" r="80" fill="none" stroke="#ddd" strokeWidth="1" />
            {step >= 1 && <line x1="20" y1="100" x2="180" y2="100" stroke={T.regF} strokeWidth="1.5" />}
            {step >= 2 && <line x1="100" y1="20" x2="100" y2="180" stroke={T.regF} strokeWidth="1.5" />}
            {step >= 3 && <>
              <line x1="43.4" y1="43.4" x2="156.6" y2="156.6" stroke={T.sGold} strokeWidth="1.5" />
              <line x1="156.6" y1="43.4" x2="43.4" y2="156.6" stroke={T.sGold} strokeWidth="1.5" />
            </>}
            {step >= 4 && <>
              <rect x="43.4" y="43.4" width="113.2" height="113.2" fill="none" stroke={T.regF} strokeWidth="2" />
              <rect x="43.4" y="43.4" width="113.2" height="113.2" fill="none" stroke={T.sGold} strokeWidth="2" transform="rotate(45 100 100)" />
            </>}
            <circle cx="100" cy="100" r="3" fill={T.regF} />
            {step >= 3 && [0,45,90,135,180,225,270,315].map(a => {
              const r = a * Math.PI / 180;
              return <circle key={a} cx={100+80*Math.cos(r)} cy={100+80*Math.sin(r)} r="3" fill={T.sGold} />;
            })}
          </svg>
          <div style={{ fontSize:9, letterSpacing:3, color:T.regF, marginBottom:8 }}>STEP {s.step} OF {MATH_STEPS.length}</div>
          <div style={{ fontSize:20, fontWeight:700, color:T.brown, fontFamily:"Georgia,serif", marginBottom:8 }}>{s.title}</div>
          <div style={{ fontSize:14, color:"#666", maxWidth:400, lineHeight:1.6 }}>{s.desc}</div>
          {step === 4 && (
            <div style={{ marginTop:16, background:`${T.regF}08`, border:`1px solid ${T.regF}33`, borderRadius:8, padding:12, display:"inline-block" }}>
              <span style={{ fontFamily:"'Courier New',monospace", fontSize:14, color:T.regF }}>|D₈| = 16</span>
              <span style={{ fontSize:11, color:"#888", marginLeft:8 }}>(8 rotations × 2)</span>
            </div>
          )}
        </div>
      </div>
      <div style={{ padding:"12px 24px", borderTop:"1px solid #eee", display:"flex", justifyContent:"center", gap:8 }}>
        <button onClick={() => setStep(Math.max(0,step-1))} disabled={step===0} style={{ background:"none", border:`1px solid ${step===0?"#ddd":T.regF}`, borderRadius:6, padding:"6px 16px", cursor:step===0?"default":"pointer", color:step===0?"#ddd":T.regF, fontSize:12 }}>← Back</button>
        <button onClick={() => setStep(Math.min(4,step+1))} disabled={step===4} style={{ background:step<4?T.regF:"#ddd", color:"#fff", border:"none", borderRadius:6, padding:"6px 16px", cursor:step<4?"pointer":"default", fontSize:12 }}>Next →</button>
      </div>
    </div>
  );
}

// ═══ B5: TECH TREE TIMELINE ═══
function B5TechTree() {
  const [sel, setSel] = useState(null);
  return (
    <div style={{ flex:1, background:"#f8faf8", padding:24, overflowY:"auto" }}>
      <div style={{ fontSize:9, letterSpacing:3, color:T.regF, marginBottom:16, fontWeight:700 }}>STEM HISTORY · 8-Pointed Star Timeline</div>
      <div style={{ position:"relative", paddingLeft:60 }}>
        <div style={{ position:"absolute", left:28, top:0, bottom:0, width:2, background:`${T.regF}33` }} />
        {INVENTIONS_TIMELINE.map((inv, i) => (
          <button key={i} onClick={() => setSel(sel===i?null:i)} style={{
            display:"block", width:"100%", textAlign:"left", cursor:"pointer", marginBottom:16, background: sel===i ? "#fff" : "transparent",
            border: sel===i ? `1.5px solid ${T.regF}` : "1px solid transparent", borderRadius:10, padding:16, position:"relative", transition:"all 0.2s",
          }}>
            <div style={{ position:"absolute", left:-44, top:16, width:16, height:16, borderRadius:"50%", background: sel===i ? T.regF : "#fff", border:`2px solid ${T.regF}`, zIndex:2 }} />
            <div style={{ fontSize:11, fontWeight:700, color:T.regF, fontFamily:"monospace", marginBottom:4 }}>{inv.year}</div>
            <div style={{ fontSize:15, fontWeight:700, color:T.brown }}>{inv.name}</div>
            <div style={{ fontSize:12, color:"#666", marginTop:4, lineHeight:1.5 }}>{inv.desc}</div>
            {sel===i && (
              <div style={{ marginTop:10, paddingTop:10, borderTop:`1px solid ${T.regF}22` }}>
                <div style={{ fontSize:10, letterSpacing:1, color:T.regF, fontWeight:700, marginBottom:4 }}>GEOMETRIC PRINCIPLE</div>
                <div style={{ fontSize:12, color:"#555", fontFamily:"'Courier New',monospace" }}>{inv.geo}</div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ═══ B6: BLUEPRINT / INVENTION DECOMPOSITION ═══
function B6Blueprint() {
  return (
    <div style={{ flex:1, background:"#f4f6f4", padding:28, overflowY:"auto" }}>
      <div style={{ fontSize:9, letterSpacing:3, color:T.regF, marginBottom:4, fontWeight:700 }}>THE MOMENT · INVENTION DECOMPOSITION</div>
      <div style={{ textAlign:"center", margin:"16px 0" }}>
        <div style={{ fontSize:22, fontWeight:700, color:T.brown, fontFamily:"Georgia,serif" }}>The Compass Rose</div>
        <div style={{ fontSize:12, color:"#888", fontStyle:"italic" }}>Mediterranean / Near East, c. 600 BCE</div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:20 }}>
        {[["E (Element)","8-Pointed Star","D₈ division of circle",T.sGold],["C (Carrier)","Navigation Instrument","Chart overlay / physical device",T.sBlue],["D (Dimension)","2D → Angular","Circular division → bearing calc",T.sRose]].map(([label,val,desc,col]) => (
          <div key={label} style={{ background:"#fff", borderRadius:10, padding:16, borderTop:`4px solid ${col}` }}>
            <div style={{ fontSize:9, letterSpacing:2, color:col, fontWeight:700, marginBottom:6 }}>{label}</div>
            <div style={{ fontSize:14, fontWeight:700, color:T.brown }}>{val}</div>
            <div style={{ fontSize:11, color:"#888", marginTop:4 }}>{desc}</div>
          </div>
        ))}
      </div>
      <div style={{ background:"#fff", borderRadius:10, padding:20, border:`1px dashed ${T.regF}` }}>
        <div style={{ fontSize:9, letterSpacing:2, color:T.regF, fontWeight:700, marginBottom:10 }}>IMPLICIT SCIENCE — what you'd need to KNOW to build this</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          {["Angular division of circular arc","Cardinal direction identification","Wind classification (8 principal winds)","Bearing calculation from fixed point"].map((s,i) => (
            <div key={i} style={{ display:"flex", gap:8, alignItems:"center" }}>
              <div style={{ width:20, height:20, borderRadius:"50%", background:`${T.regF}11`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, color:T.regF, fontWeight:700, flexShrink:0 }}>{i+1}</div>
              <div style={{ fontSize:12, color:"#555" }}>{s}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══ B8: SUPERIMPOSITION ═══
function B8Synthesis() {
  return (
    <div style={{ flex:1, background:T.night, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:32 }}>
      <div style={{ fontSize:9, letterSpacing:4, color:T.regB, marginBottom:24 }}>SYNTHESIS · SUPERIMPOSITIONAL AGREEMENT</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr auto 1fr", gap:20, alignItems:"center", maxWidth:700 }}>
        <div style={{ background:`${T.regM}15`, borderRadius:12, padding:20, borderLeft:`3px solid ${T.regM}` }}>
          <div style={{ fontSize:9, letterSpacing:2, color:T.regM, marginBottom:8 }}>METAPHOR REGISTER</div>
          <div style={{ fontSize:13, lineHeight:1.7, color:T.clay }}>
            Divine radiance — Ishtar's presence encoded in geometric form. The star on the gate says <em>"I see you in every direction."</em>
          </div>
        </div>
        <div style={{ textAlign:"center" }}>
          <Star8 size={80} stroke={T.regB} opacity={0.8} />
          <div style={{ fontSize:11, color:T.gold, marginTop:8, fontFamily:"monospace", fontWeight:700 }}>D₈</div>
          <div style={{ fontSize:9, color:"#555", marginTop:2 }}>Same geometry</div>
        </div>
        <div style={{ background:`${T.regF}15`, borderRadius:12, padding:20, borderRight:`3px solid ${T.regF}` }}>
          <div style={{ fontSize:9, letterSpacing:2, color:T.regF, marginBottom:8 }}>FUNCTION REGISTER</div>
          <div style={{ fontSize:13, lineHeight:1.7, color:T.clay }}>
            Angular navigation — the horizon partitioned into 8 bearings. The compass rose says <em>"I can find any direction."</em>
          </div>
        </div>
      </div>
      <div style={{ marginTop:24, padding:"14px 28px", background:`${T.gold}11`, borderRadius:10, border:`1px solid ${T.gold}33`, maxWidth:500, textAlign:"center" }}>
        <div style={{ fontSize:14, color:T.gold, fontFamily:"Georgia,serif", fontStyle:"italic", lineHeight:1.6 }}>
          Two operations. Same spatial configuration. Equivalent expressions.
        </div>
        <div style={{ fontSize:10, color:"#666", marginTop:6 }}>Not "metaphor = function." The geometry is deep enough to support both.</div>
      </div>
    </div>
  );
}

// ═══ PLACEHOLDER ═══
function Placeholder({ section }) {
  return (
    <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:12, background:T.parch }}>
      <div style={{ fontSize:48 }}>{section.icon}</div>
      <div style={{ fontSize:18, fontWeight:700, color:T.brown, fontFamily:"Georgia,serif" }}>{section.id}: {section.name}</div>
      <div style={{ fontSize:11, color:"#999", padding:"6px 14px", background:`${rc(section.reg)}11`, borderRadius:8, border:`1px solid ${rc(section.reg)}22` }}>
        Screen archetype: <strong>{section.type}</strong>
      </div>
    </div>
  );
}

// ═══ NAV RAIL ═══
function NavRail({ activeIdx, onSelect }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", width:52, background:T.night, borderRight:`1px solid ${T.lapis}`, overflowY:"auto" }}>
      {SECTIONS.map((s, i) => {
        const active = i === activeIdx;
        const c = rc(s.reg);
        return (
          <button key={s.id} onClick={() => onSelect(i)} title={`${s.id}: ${s.name} [${s.type}]`}
            style={{ background: active ? `${c}22` : "transparent", border:"none", borderLeft: active ? `3px solid ${c}` : "3px solid transparent", padding:"5px 0", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:1, transition:"all 0.15s" }}>
            <span style={{ fontSize:12 }}>{s.icon}</span>
            <span style={{ fontSize:7, fontFamily:"monospace", color: active ? c : "#555", fontWeight: active ? 700 : 400, letterSpacing:1 }}>{s.id}</span>
          </button>
        );
      })}
    </div>
  );
}

// ═══ MAIN ═══
export default function EuclidFullPrototype() {
  const [idx, setIdx] = useState(0);
  const [a3pow, setA3pow] = useState(null);

  const nav = (i, pow) => { setIdx(i); if (pow) setA3pow(pow); };
  const section = SECTIONS[idx];

  const renderSection = () => {
    switch(idx) {
      case 0: return <A1Cinematic />;
      case 1: return <A2CharacterSheet onNav={nav} />;
      case 2: return <A3LoreCodex highlight={a3pow} onNav={nav} />;
      case 3: return <A4Collection />;
      case 4: return <A5Tutorial />;
      case 6: return <A7SplitReveal />;
      case 8: return <B2Whiteboard />;
      case 11: return <B5TechTree />;
      case 12: return <B6Blueprint />;
      case 14: return <B8Synthesis />;
      default: return <Placeholder section={section} />;
    }
  };

  return (
    <div style={{ fontFamily:"'Inter',-apple-system,sans-serif", height:"100vh", display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <style>{`* { box-sizing:border-box; margin:0; padding:0; } ::-webkit-scrollbar { width:5px; } ::-webkit-scrollbar-thumb { background:#ccc; border-radius:3px; }`}</style>
      <div style={{ background:T.night, padding:"8px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:`1px solid ${T.lapis}`, flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:9, letterSpacing:4, color:T.gold, fontWeight:700 }}>EUCLID</span>
          <span style={{ color:"#333" }}>|</span>
          <span style={{ fontSize:10, color:"#777" }}>Week 3 · 8-Pointed Star · Ishtar · Grade 5</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ fontSize:9, letterSpacing:2, color:rc(section.reg), fontWeight:700 }}>{rl(section.reg)}</span>
          <span style={{ fontFamily:"monospace", fontSize:11, fontWeight:700, color:rc(section.reg), background:`${rc(section.reg)}18`, padding:"2px 7px", borderRadius:4 }}>{section.id}</span>
          <span style={{ fontSize:11, color:T.clay }}>{section.name}</span>
          <span style={{ fontSize:9, color:"#555", marginLeft:4, background:"#1a1a2a", padding:"2px 6px", borderRadius:3 }}>{section.type}</span>
        </div>
      </div>
      <div style={{ display:"flex", flex:1, overflow:"hidden" }}>
        <NavRail activeIdx={idx} onSelect={setIdx} />
        {renderSection()}
      </div>
      <div style={{ background:T.night, borderTop:`1px solid ${T.lapis}`, padding:"6px 16px", display:"flex", gap:16, alignItems:"center", fontSize:9, color:"#555", flexShrink:0 }}>
        <span>v7.0 · 15 sections</span>
        <span style={{ color:T.regM }}>■</span><span>Metaphor A1-A6</span>
        <span style={{ color:T.regB }}>■</span><span>Both A7 B1 B8</span>
        <span style={{ color:T.regF }}>■</span><span>Function B2-B7</span>
        <span style={{ marginLeft:"auto", fontFamily:"monospace" }}>A2→A5→A6 · B2→B3→B4 · A2↔A6</span>
      </div>
    </div>
  );
}
