# THREE-ACT STORYBOARDING PROCESS
## Project Euclid — Mesopotamia Pilot Video Animation Production

**Version:** 1.0
**Date:** March 2026
**Scope:** All 4 myths (Weeks I–IV, Grades 3–5)

---

## PART 1: THE GENERAL PROCESS

### Why Three Acts (Not Five, Not Three Panels)

The myths in Project Euclid follow a **three-act dramaturgical structure** — a narrative architecture borrowed from film and animation pre-production. This is NOT a panel count. Each act contains a variable number of storyboard panels determined by the narrative beats within that act.

The three acts correspond to a universal story shape that maps precisely onto the "Story of an Element" arc (A1→B8):

| Act | Narrative Function | Visual Register | Element State |
|---|---|---|---|
| **ACT I: ABSENCE** | The world-state where the geometric property is MISSING | Pre-element — no geometry visible | Problem exists BECAUSE the property is absent |
| **ACT II: TRANSFORMATION** | The deity discovers/deploys the element's geometric property | Element-in-action — geometry performing | The element IS the solution |
| **ACT III: LEGACY** | The geometric truth becomes permanent cultural knowledge | Element-as-symbol — geometry encoded in culture | Symbol is established |

### The Decomposition Pipeline

```
MYTH NARRATIVE
    │
    ├─── ACT I: ABSENCE (world without the property)
    │       ├── Panel 1.1: World-state establishing shot
    │       ├── Panel 1.2: Problem manifestation
    │       └── Panel 1.3: Failed attempts / escalation
    │
    ├─── ACT II: TRANSFORMATION (deity + element)
    │       ├── Panel 2.1: Deity introduction / wisdom source
    │       ├── Panel 2.2: Element discovery / creation moment
    │       ├── Panel 2.3: Element deployed — property in action
    │       └── Panel 2.4: Problem solved THROUGH the property
    │
    └─── ACT III: LEGACY (meaning becomes permanent)
            ├── Panel 3.1: Civilization adopts the element
            ├── Panel 3.2: Element encoded in culture (symbol)
            └── Panel 3.3: Closing image — element as eternal truth
```

### Panel Design Rules

**Rule 1: One Visual Concept Per Panel**
Each panel contains exactly ONE visual idea. If a scene requires showing both a character and an artifact, those are separate panels.

**Rule 2: Every Panel Gets a Reuse Tag**
Every panel is tagged with which other sections/grades can use the imagery:

```
REUSE_TAGS:
  - A1_myth: Primary myth delivery (all grades)
  - A3_iconography: Artifact close-ups, deity symbols
  - A4_material_culture: Civilization objects, architecture
  - A5_deep_dive: Detailed artifact analysis frames
  - B3_science: Element property demonstrations
  - B4_history: Historical mechanical applications
  - B5_evolution: Cross-civilization usage
  - B6_invention: Specific invention moment
  - BACKGROUND: Reusable environment (Mesopotamian city, temple, sky)
  - CHARACTER: Reusable character pose/expression
  - ELEMENT_SOLO: Isolated geometric element for overlay/diagram use
```

**Rule 3: Extractable Assets**
Each panel is designed so that individual layers can be extracted:
- Background layer (environment)
- Character layer (deity/people)
- Element layer (geometric shape in isolation)
- FX layer (light, particles, glow)

**Rule 4: Grade-Agnostic Base, Grade-Specific Overlay**
The base animation is identical across Grades 3–5. Grade differentiation happens through:
- Narration text complexity
- On-screen text labels
- Teacher guide annotations
- NOT through different animations

---

### Production Metadata Per Panel

Every panel in the storyboard carries this metadata:

```yaml
panel_id: "G3-W1-ACT2-P3"
act: 2
panel_number: 3
beat_name: "Circle becomes sun wheel"
duration_sec: 6
visual_concept: "Circle radiating equal light in all directions"
camera: "WIDE → ZOOM to circle center"
speaker: "NARRATOR"
dialogue: "The circle had no corners to hide behind..."
stage_direction: "Light pulses outward from circle center"
sfx: "warm_glow_pulse"
music_mood: "revelation"

# Reuse metadata
reuse_tags: [A1_myth, B3_science, ELEMENT_SOLO]
extractable_assets:
  - background: "mesopotamian_sky_dawn"
  - character: "shamash_standing_radiant"
  - element: "circle_radiating_light"
  - fx: "equal_radial_glow"
grade_variants:
  G3_narration: "The light goes out equally everywhere — like fairness!"
  G4_narration: "Equal radii mean equal illumination in every direction."
  G5_narration: "Equidistance from center produces uniform coverage — the geometric basis of distributive equality."
```

---

## PART 2: THE FOUR MYTHS — THREE-ACT BREAKDOWNS

---

### WEEK I: SHAMASH & THE CIRCLE — "The Sun Wheel of Justice"

**Element:** Circle
**Deity:** Shamash (sun god)
**Metaphor:** Perfect justice (equal reach)
**Geometric Truth:** Equidistance from center = equal coverage

#### ACT I: ABSENCE — A World Without Fairness (Panels 1.1–1.3)

The world has no mechanism for equal treatment. Darkness enables cheating because visibility is unequal — some see, some don't. The ABSENCE is equidistance: nothing reaches everyone equally.

| Panel | Beat | Visual Concept | Duration | Camera | Reuse Tags |
|---|---|---|---|---|---|
| 1.1 | Dark world | Mesopotamian city in shadow — uneven pools of torchlight, some areas bright, others black | 8s | WIDE establishing shot, slow pan | A1_myth, BACKGROUND |
| 1.2 | Unfairness shown | Split-screen: merchant cheating in shadows vs. honest person visible in light — same act, different visibility | 6s | MEDIUM, split composition | A1_myth, A4_material_culture |
| 1.3 | Community suffering | Villagers arguing, pointing at uneven light — some demand "Why can't the light reach HERE?" | 6s | MEDIUM-CLOSE on crowd | A1_myth, CHARACTER |

**Act I Visual Register:** Dark palette, uneven lighting, asymmetric compositions. NO circles visible anywhere. The geometric absence IS the visual language.

#### ACT II: TRANSFORMATION — Shamash Creates the Circle (Panels 2.1–2.4)

The deity introduces the element. The circle SOLVES the problem through its specific geometric property (equidistance from center). The transformation is not magic — it's geometry.

| Panel | Beat | Visual Concept | Duration | Camera | Reuse Tags |
|---|---|---|---|---|---|
| 2.1 | Shamash appears | Shamash descends from above — first just a point of light, then expanding outward equally | 8s | LOW ANGLE looking up, ZOOM OUT as light expands | A1_myth, A3_iconography, CHARACTER |
| 2.2 | Circle creation | Shamash draws the circle — a single continuous line with NO beginning and NO end, light following the path | 10s | CLOSE on hands drawing, then PULL BACK to reveal full circle | A1_myth, ELEMENT_SOLO, B3_science |
| 2.3 | Property in action | Circle becomes sun wheel — light radiates from center, hitting every point on the ground at equal intensity. Shadows vanish EQUALLY everywhere | 8s | OVERHEAD shot showing radial light reaching all corners | A1_myth, B3_science, ELEMENT_SOLO |
| 2.4 | Problem solved | The merchant's cheating is now visible — same light everywhere. Fairness restored through EQUAL REACH, not through punishment | 6s | Return to Panel 1.2 composition, now fully lit | A1_myth, A4_material_culture |

**Act II Visual Register:** Golden light, radial compositions, circles appearing everywhere. The ELEMENT is the visual protagonist. Every frame should be composable with radial symmetry.

#### ACT III: LEGACY — The Circle Becomes Symbol (Panels 3.1–3.3)

The civilization adopts the element. The geometric truth (equidistance = fairness) is encoded into cultural practice. The symbol is permanent.

| Panel | Beat | Visual Concept | Duration | Camera | Reuse Tags |
|---|---|---|---|---|---|
| 3.1 | Civilization adopts | Artisans carving circular sun disks. Builders marking circular foundations. Scribes pressing circular seals into clay | 6s | MONTAGE — 3 quick cuts showing circle in use | A1_myth, A3_iconography, A4_material_culture, B4_history |
| 3.2 | Symbol encoded | Close-up: cylinder seal being rolled across clay — Shamash seated with circular sun disk above, rays radiating equally | 8s | EXTREME CLOSE on seal impression forming | A3_iconography, A5_deep_dive, ELEMENT_SOLO |
| 3.3 | Closing truth | The circle alone against sky — no beginning, no end, equal in every direction. Slow rotation. | 6s | HERO SHOT — isolated circle, slow zoom out to reveal it as the sun | A1_myth, ELEMENT_SOLO, BACKGROUND |

**Act III Visual Register:** Warm earth tones, cultural artifacts visible, circle integrated into architecture and art. The element is now EMBEDDED in civilization.

**Total Panels:** 10
**Total Duration:** ~72 seconds (expandable to 5–8 min with narration pacing)

---

### WEEK II: SIN & THE CRESCENT — "The Crescent Boat of Time"

**Element:** Crescent
**Deity:** Sin/Nanna (moon god)
**Metaphor:** Cycles and renewal (from ending comes beginning)
**Geometric Truth:** Directional arc + asymmetric thickness = change-in-progress

#### ACT I: ABSENCE — A World Without Rhythm (Panels 1.1–1.3)

Time has no visible marker. Days blur together. People cannot plan because nothing marks cycles. The ABSENCE is directionality: nothing points forward, nothing shows change-in-progress.

| Panel | Beat | Visual Concept | Duration | Camera | Reuse Tags |
|---|---|---|---|---|---|
| 1.1 | Timeless world | Same scene repeated three times — farmer planting, reaping, confused — no seasons visible, sky unchanging | 8s | WIDE, same framing three times with jump cuts | A1_myth, BACKGROUND |
| 1.2 | Confusion | People trying to measure time with straight sticks and squares — nothing works, lines don't curve, squares don't change | 6s | MEDIUM on frustrated astronomers | A1_myth, A4_material_culture |
| 1.3 | Desperation | Community gathered, looking at featureless night sky — no moon, no marker, just uniform darkness | 6s | WIDE, upward tilt to empty sky | A1_myth, BACKGROUND |

**Act I Visual Register:** Static compositions, straight lines, rectangular forms. NO curves, NO arcs. The visual language is geometrically FLAT — nothing suggests change or movement.

#### ACT II: TRANSFORMATION — Sin Shapes the Crescent (Panels 2.1–2.4)

Sin discovers that a specific geometric form — the crescent — can encode change-in-progress through its asymmetric thickness and directional arc.

| Panel | Beat | Visual Concept | Duration | Camera | Reuse Tags |
|---|---|---|---|---|---|
| 2.1 | Sin appears | Sin on celestial waters — silver figure with horned crown, shaping moonlight with hands | 8s | MEDIUM on Sin at water's surface | A1_myth, A3_iconography, CHARACTER |
| 2.2 | Crescent carved | Sin carves light into a crescent — thin on one edge, thick on other. NOT a circle (not complete), NOT a line (has area). The asymmetry IS the point | 10s | CLOSE on hands shaping light, SLOW REVEAL of crescent form | A1_myth, ELEMENT_SOLO, B3_science |
| 2.3 | Crescent sails | The crescent boat moves across sky — each night it GROWS thicker (waxing). The change-in-progress IS the message: time is moving, fullness is coming | 8s | TIME-LAPSE: crescent thickening night by night across sky | A1_myth, B3_science, ELEMENT_SOLO |
| 2.4 | Full → wane → return | Full moon reached. Then thinning (waning). Then gone. Then — thin crescent returns! The CYCLE is visible because the crescent's asymmetry shows direction | 10s | MONTAGE: full moon → phases → new crescent | A1_myth, B3_science, B4_history |

**Act II Visual Register:** Silver-blue palette, curved compositions, everything arcing. Asymmetric framing — one side of frame always thicker/fuller than other. Visual dynamism.

#### ACT III: LEGACY — The Crescent Becomes Calendar (Panels 3.1–3.3)

Mesopotamians adopt the crescent as time-marker. The first lunar calendars. The crescent on every temple to Sin.

| Panel | Beat | Visual Concept | Duration | Camera | Reuse Tags |
|---|---|---|---|---|---|
| 3.1 | Calendar born | Scribes marking crescent shapes on clay tablets — tracking phases. Farmers now know when to plant. Cities know when festivals occur | 6s | MONTAGE: scribe → farmer → festival | A1_myth, A4_material_culture, B4_history, B6_invention |
| 3.2 | Temple crescent | Ur's great ziggurat with crescent standard atop — Sin's symbol visible across the plain. Close-up: kudurru stone with crescent + solar disk + star (divine triad) | 8s | WIDE on ziggurat → CLOSE on kudurru | A3_iconography, A5_deep_dive, B5_evolution |
| 3.3 | Closing truth | Crescent alone in night sky — one edge thin, one edge thick, pointing forward. Still changing. Always renewing. | 6s | HERO SHOT — crescent against stars | A1_myth, ELEMENT_SOLO, BACKGROUND |

**Total Panels:** 10
**Total Duration:** ~76 seconds

---

### WEEK III: ISHTAR & THE 8-POINTED STAR — "The Morning Star Who Became Eight"

**Element:** 8-pointed star
**Deity:** Inanna/Ishtar
**Metaphor:** Multiplicity (one being contains many contradictory natures)
**Geometric Truth:** Radial symmetry from single center = unity-within-multiplicity

#### ACT I: ABSENCE — A World of Singularity (Panels 1.1–1.3)

The world operates on a false assumption: each thing can only be ONE thing. Light OR dark. Love OR war. Life OR death. The ABSENCE is radial multiplicity — nothing radiates outward in multiple directions simultaneously.

| Panel | Beat | Visual Concept | Duration | Camera | Reuse Tags |
|---|---|---|---|---|---|
| 1.1 | Singular world | Visual: everything labeled with ONE tag. Sun = bright. Night = dark. Sword = war. Flower = peace. Binary pairs only | 8s | WIDE establishing, labels floating beside objects | A1_myth, BACKGROUND |
| 1.2 | Venus appears | A single bright point in sky — Morning Star. People see it and say "That is the star of love." Just one meaning. One label. | 6s | SKY SHOT, single point of light | A1_myth, A3_iconography |
| 1.3 | Limitation felt | The goddess Inanna watches from the star, frustrated. "I am not just ONE thing," she says. But the world has no shape for multiplicity | 6s | CLOSE on figure within the star-point | A1_myth, CHARACTER |

**Act I Visual Register:** Single-point compositions, binary contrasts, everything arranged in pairs. NO radial forms, NO starbursts. Visual monotony of singularity.

#### ACT II: TRANSFORMATION — Inanna Becomes Eight (Panels 2.1–2.5)

Inanna acquires her contradictory aspects — love AND war, life AND death, morning AND evening. The 8-pointed star emerges as the only geometric form that can hold all aspects simultaneously through radial symmetry.

| Panel | Beat | Visual Concept | Duration | Camera | Reuse Tags |
|---|---|---|---|---|---|
| 2.1 | Aspects accumulate | Inanna as Morning Star ALSO appearing as Evening Star — same being, two positions. Then: Love goddess AND war goddess. Aspects accumulating in PAIRS | 8s | SPLIT-SCREEN becoming MULTI-SCREEN | A1_myth, CHARACTER |
| 2.2 | Descent begins | Inanna descends through 7 gates of the underworld. At each gate, she GAINS an aspect (not loses). Seven gates, seven aspects — but this is incomplete | 10s | VERTICAL CAMERA tracking downward through gates | A1_myth, A5_deep_dive |
| 2.3 | Death and rebirth | In the underworld: death. Then rebirth. Now 8 aspects total. She IS multiplicity itself — the eighth aspect is the ability to contain contradiction | 8s | DARK → LIGHT transformation | A1_myth, B3_science |
| 2.4 | Star emerges | The 8 aspects radiate outward from her center — each pointing a different direction, all connected at one origin. THIS is the 8-pointed star. Not decoration. The GEOMETRY of being-many-from-one | 10s | CENTER OUT — star forming ray by ray from single point | A1_myth, ELEMENT_SOLO, B3_science |
| 2.5 | Star completes | Full 8-pointed star rotating slowly. Each point different (love, war, life, death, morning, evening, fertility, drought) but all from one center | 6s | HERO SHOT of complete star | A1_myth, ELEMENT_SOLO |

**Act II Visual Register:** Radial compositions emerging, multi-directional movement, 8-fold symmetry building progressively. Color palette expanding from binary to full spectrum.

#### ACT III: LEGACY — The Star Everywhere (Panels 3.1–3.3)

The 8-pointed star becomes THE identifier for Ishtar across all of Mesopotamian civilization — on every kudurru, every temple, every seal.

| Panel | Beat | Visual Concept | Duration | Camera | Reuse Tags |
|---|---|---|---|---|---|
| 3.1 | Star adopted | Artisans carving 8-pointed rosettes. Temple facades blooming with 8-petal flowers. The star on warrior shields AND wedding gifts — multiplicity in practice | 6s | MONTAGE across uses | A1_myth, A3_iconography, A4_material_culture, B5_evolution |
| 3.2 | Divine triad | Kudurru boundary stone: 8-pointed star (Ishtar) + crescent (Sin) + solar disk (Shamash) — all three geometric elements from Weeks I–III together on one stone | 8s | CLOSE PAN across kudurru symbols | A3_iconography, A5_deep_dive, ELEMENT_SOLO |
| 3.3 | Closing truth | Star pulsing gently — 8 rays breathing outward from center. One being, many natures. One center, many directions. | 6s | HERO SHOT — isolated star | A1_myth, ELEMENT_SOLO, BACKGROUND |

**Total Panels:** 11
**Total Duration:** ~82 seconds

---

### WEEK IV: NINURTA & THE TRIANGLE — "The Three Foundations of Victory"

**Element:** Triangle
**Deity:** Ninurta (warrior god)
**Metaphor:** Stability (unshakeable foundation)
**Geometric Truth:** Three-point support = structural rigidity (cannot deform)

#### ACT I: ABSENCE — A World That Falls (Panels 1.1–1.3)

Mountains rebel. Structures collapse. Nothing stays upright because nobody understands minimum structural support. The ABSENCE is three-point rigidity — everything wobbles because it rests on 2 points (or 4 that can deform).

| Panel | Beat | Visual Concept | Duration | Camera | Reuse Tags |
|---|---|---|---|---|---|
| 1.1 | Mountains attack | Stone peaks sending boulders down. Mesopotamian city walls crumbling — they were built with FOUR-sided supports that DEFORM under pressure | 8s | WIDE, dynamic action, structures collapsing | A1_myth, BACKGROUND |
| 1.2 | Ninurta fails | Ninurta charges at mountain, strikes peak with mace. Mountain laughs. "You cannot defeat me, little god." Ninurta falls | 8s | MEDIUM-CLOSE, action sequence | A1_myth, CHARACTER |
| 1.3 | Exhaustion | Ninurta on ground, looking up at mountain. "How can I fight something so strong?" The problem: he attacks from the TOP (unstable) not the BASE | 6s | LOW ANGLE, Ninurta below mountain | A1_myth, CHARACTER |

**Act I Visual Register:** Diagonal compositions (things falling), rectangular structures failing, NO triangular forms. Visual instability — nothing is grounded.

#### ACT II: TRANSFORMATION — Ninhursag Teaches Three (Panels 2.1–2.5)

Ninhursag (earth goddess, Ninurta's mother) teaches the secret: THREE points spread wide cannot be toppled. The triangle is the minimum architecture of stability.

| Panel | Beat | Visual Concept | Duration | Camera | Reuse Tags |
|---|---|---|---|---|---|
| 2.1 | Ninhursag arrives | Wise earth goddess appears. "Ninurta, you fight the top. Mountains are strong at the BASE." She draws in sand | 8s | MEDIUM TWO-SHOT | A1_myth, CHARACTER |
| 2.2 | Three-point lesson | Three marks in sand → triangle. "Stand on one leg" (wobbles). "Two legs" (better, can be pushed). "Three legs spread wide" (IMPOSSIBLE to topple) | 12s | CLOSE on sand drawing, intercut with Ninurta's balance tests | A1_myth, B3_science, ELEMENT_SOLO |
| 2.3 | Base attack | Armed with knowledge, Ninurta finds the mountain's THREE base-points. He breaks them. The mountain falls — not from top-down force, but from geometric understanding | 8s | WIDE action, strategic not brute | A1_myth, B4_history |
| 2.4 | Victory stacking | Ninurta gathers fallen stones, stacks them in triangular piles — three-sided pyramids. "THE TRIANGLE IS THE FOUNDATION OF ALL STABILITY" | 8s | MEDIUM, Ninurta building | A1_myth, B4_history, B6_invention |
| 2.5 | Property isolated | Close-up: a single triangle. Wide base. Tapering apex. Three fixed angles. Push it — it doesn't move. It CANNOT deform. Three sides, three fixed angles = rigidity | 6s | EXTREME CLOSE, ELEMENT_SOLO demonstration | B3_science, ELEMENT_SOLO |

**Act II Visual Register:** Triangular compositions taking over — base-heavy framing, pyramid shapes, V-formations. Visual stability emerging from chaos.

#### ACT III: LEGACY — The Triangle Builds Civilization (Panels 3.1–3.3)

The triangle becomes the foundation of Mesopotamian architecture and engineering. From three-legged stools to ziggurat buttresses.

| Panel | Beat | Visual Concept | Duration | Camera | Reuse Tags |
|---|---|---|---|---|---|
| 3.1 | Builders adopt | Three-legged stools that never wobble. Foundation stones in triangular arrangements. Diagonal braces on walls. Mesopotamian engineers applying three-point stability everywhere | 8s | MONTAGE across applications | A1_myth, A4_material_culture, B4_history, B5_evolution |
| 3.2 | Ziggurat buttress | The Great Ziggurat of Ur — triangular buttresses at regular intervals preventing wall buckling. Close-up: the triangular cross-section of a buttress | 10s | WIDE on ziggurat → CLOSE on buttress detail | A5_deep_dive, B6_invention, ELEMENT_SOLO |
| 3.3 | Closing truth | Triangle alone — wide base on ground, apex pointing up. Unmovable. The minimum architecture of permanence. | 6s | HERO SHOT — isolated triangle against sky | A1_myth, ELEMENT_SOLO, BACKGROUND |

**Total Panels:** 11
**Total Duration:** ~88 seconds

---

## PART 3: REUSABLE IMAGERY MAP

### Cross-Section Asset Reuse Matrix

This matrix shows which storyboard panels produce extractable assets for other lesson sections:

| Asset | Source Panel(s) | A1 | A3 | A4 | A5 | B3 | B4 | B5 | B6 |
|---|---|---|---|---|---|---|---|---|---|
| **BACKGROUNDS** | | | | | | | | | |
| Mesopotamian city (dark) | W1-1.1 | ✓ | | ✓ | | | | | |
| Mesopotamian city (lit) | W1-2.4 | ✓ | | ✓ | | | | | |
| Celestial waters (night) | W2-2.1 | ✓ | | | | | | | |
| Empty night sky | W2-1.3 | ✓ | | | | | | | |
| Mountain landscape | W4-1.1 | ✓ | | | | | | | |
| Ziggurat complex | W4-3.2 | | | ✓ | ✓ | | | ✓ | ✓ |
| **CHARACTERS** | | | | | | | | | |
| Shamash (radiant) | W1-2.1 | ✓ | ✓ | | | | | | |
| Sin (silver, horned crown) | W2-2.1 | ✓ | ✓ | | | | | | |
| Inanna/Ishtar (multi-aspect) | W3-2.4 | ✓ | ✓ | | | | | | |
| Ninurta (warrior) | W4-1.2 | ✓ | ✓ | | | | | | |
| Ninhursag (teaching) | W4-2.1 | ✓ | | | | | | | |
| Mesopotamian villagers | W1-1.3 | ✓ | | ✓ | | | | | |
| Artisans/builders | W1-3.1, W4-3.1 | | | ✓ | | | ✓ | ✓ | |
| **ELEMENTS (ISOLATED)** | | | | | | | | | |
| Circle — radiating light | W1-2.3 | ✓ | | | | ✓ | | | |
| Circle — continuous boundary | W1-2.2 | ✓ | | | | ✓ | | | |
| Crescent — asymmetric arc | W2-2.2 | ✓ | | | | ✓ | | | |
| Crescent — phase sequence | W2-2.3 | ✓ | | | | ✓ | ✓ | | |
| 8-point star — ray by ray | W3-2.4 | ✓ | | | | ✓ | | | |
| 8-point star — complete rotating | W3-2.5 | ✓ | | | | ✓ | | | |
| Triangle — sand drawing | W4-2.2 | ✓ | | | | ✓ | | | |
| Triangle — rigidity demo | W4-2.5 | | | | | ✓ | | | |
| **ARTIFACTS** | | | | | | | | | |
| Cylinder seal impression | W1-3.2 | | ✓ | ✓ | ✓ | | | | |
| Kudurru with divine triad | W3-3.2 | | ✓ | ✓ | ✓ | | | | |
| Cuneiform calendar tablet | W2-3.1 | | | ✓ | | | ✓ | | ✓ |
| Ziggurat buttress detail | W4-3.2 | | | ✓ | ✓ | | ✓ | ✓ | ✓ |
| Three-legged stool | W4-3.1 | | | ✓ | | | ✓ | | |

### Grade Differentiation Strategy

The BASE animation is identical across Grades 3, 4, and 5. Differentiation is achieved through:

| Layer | Grade 3 | Grade 4 | Grade 5 |
|---|---|---|---|
| Narration vocabulary | Simple, concrete | Academic, comparative | Technical, analytical |
| On-screen labels | None or minimal | Key terms | Full geometric vocabulary |
| Pause points | After each act | After key panels | Minimal — flows continuously |
| Post-video discussion | "What did you see?" | "Why did that work?" | "What geometric principle..." |
| Teacher guide callouts | Basic comprehension | Cross-week connections | Mathematical proof links |

---

## PART 4: PRODUCTION SPECIFICATIONS

### Animation Style Guide

- **Aesthetic:** Bright, clean, museum-quality educational illustration
- **Palette:** Mesopotamian earth tones (clay, brick, gold) + element-specific accent colors
  - Circle/Shamash: Gold + warm white radiance
  - Crescent/Sin: Silver-blue + cool whites
  - 8-Star/Ishtar: Royal purple + multi-color rays
  - Triangle/Ninurta: Brown-earth + structural gray
- **Character design:** Stylized, culturally respectful, age-appropriate (K-8)
- **NO on-screen text** in base animation (text added via grade-specific overlay layer)

### Frame Rate & Resolution

- **Base resolution:** 1920×1080 (16:9)
- **Export also at:** 1080×1080 (1:1 for mobile/tablet)
- **Frame rate:** 24fps for animation, 12fps for limited-animation (budget version)
- **Asset exports:** Individual elements at 2x resolution (3840px) for print use

### Audio Layers (Separate Tracks)

1. **Narration** (3 versions per myth: G3, G4, G5 vocabulary)
2. **Music** (mood-tagged per panel)
3. **SFX** (action sounds, ambient, transitions)
4. **Silence** (clean video for teacher-led narration)

---

## APPENDIX: STORYBOARD PANEL INVENTORY

### Complete Panel Count

| Myth | Act I Panels | Act II Panels | Act III Panels | Total |
|---|---|---|---|---|
| Shamash / Circle | 3 | 4 | 3 | **10** |
| Sin / Crescent | 3 | 4 | 3 | **10** |
| Ishtar / 8-Star | 3 | 5 | 3 | **11** |
| Ninurta / Triangle | 3 | 5 | 3 | **11** |
| **TOTAL** | **12** | **18** | **12** | **42** |

### Unique Extractable Assets

- Backgrounds: 7 unique environments
- Characters: 7 unique character designs (5 deities + villagers + artisans)
- Isolated elements: 8 unique element renders
- Cultural artifacts: 5 unique artifact close-ups
- **Total unique assets: 27** (reusable across 4 myths × 3 grades × 15 sections)
