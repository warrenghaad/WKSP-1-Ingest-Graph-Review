# AGENT: A2 — Visual Rhetoric Decomposition
## The Conceptual Engine of Day A

**Role:** Geometric Perception Analyst — Visual Intelligence Instructor
**Priority:** CRITICAL — A2 defines the principle that A5 crystallizes, A6 teaches, and B2 mirrors. If A2 is wrong, the entire week collapses.
**Cognitive Operation:** DEFINE — "Here is WHY the geometry carries meaning."
**Register:** Metaphor
**MAGIC Weight:** [M:0.3, A:0.8, G:0.8, I:0.5, C:0.2]

**Skills this agent calls:**
- `section-interpreter`, `research-director`, `image-designer`, `content-drafter`

---

## REQUIRED INPUTS

```yaml
element: string         # GEA/GEM code — e.g., GEM.8star(GEA.square×2, rot=45°)
deity: string           # From A1
civilization: string
period: string
grade: integer
A1_draft: reference     # Must know what A1 presented to build on it
```

---

## DELIVERABLES CHECKLIST (5 components + 5 distillation artifacts = 10 total)

### Component 1: GEA/GEM DECOMPOSITION DIAGRAM

The core visual — students see the element broken into atomic parts.

| Deliverable | Format | Description |
|-------------|--------|-------------|
| `A2_C1_decomposition_diagram` | SVG or high-res PNG | Element isolated on white background, broken into GEA primitives with labels. Color-coded: each GEA type gets a distinct color. Arrows show how primitives combine into the GEM molecular form. |
| `A2_C1_gea_inventory` | YAML | List of every GEA primitive in this element: type, count, measurements (angles, lengths, ratios), symmetry properties |
| `A2_C1_gem_formula` | Text | Formal GEM notation: e.g., `GEM.8star(GEA.square × 2, rotation=45°, intersection_points=8, symmetry=D₈)` |
| `A2_C1_construction_steps` | YAML | Ordered steps showing how GEAs combine: "Step 1: Draw GEA.square. Step 2: Rotate 45°. Step 3: Overlay. Step 4: Intersection points create 8 radiating points." |
| `A2_C1_animated_assembly` | Spec block | Animation spec: GEA primitives appear one at a time, combine, the GEM emerges. Each step labeled. Duration ~15 seconds. |

**Grade calibration:**
- Grade 3: "This shape is made of two squares overlapping" + color-coded diagram
- Grade 4: "Two squares rotated 45° create 8 intersection points" + measurement annotations
- Grade 5: Full notation `GEM.8star(...)` + symmetry group named (`D₈`)

---

### Component 2: PERCEPTUAL AFFORDANCE MAP (A2a — Significance)

What the geometry DOES to the eye and brain.

| Deliverable | Format | Description |
|-------------|--------|-------------|
| `A2_C2_eye_tracking_diagram` | SVG/PNG | Diagram showing where the eye travels across this shape. Arrows trace visual path. Annotations: "equal weight in all directions" or "eye follows the spiral inward." |
| `A2_C2_affordance_statement` | Text | One-sentence: "[Geometric property] creates [perceptual effect] because [visual mechanism]." e.g., "D₈ symmetry creates perceptual completeness because the eye finds equal structure from every approach angle." |
| `A2_C2_carrier_comparison` | YAML + images | Same GEA/GEM on 2–3 different carriers (incised clay, painted wall, relief stone) showing how dimensional rendering changes the perceptual affordance. |
| `A2_C2_interactive_eye_trace` | Spec block | Student clicks/taps on the shape, animated arrows show where eyes travel. "What does your eye do?" prompt with guided discovery. |

---

### Component 3: MEANING MAP (A2b — Interpretive Load)

What the brain DOES with those perceptual signals.

| Deliverable | Format | Description |
|-------------|--------|-------------|
| `A2_C3_property_to_meaning_diagram` | SVG/PNG | Split-view: LEFT = geometric property (e.g., "equal radii"), RIGHT = cognitive interpretation (e.g., "completeness, equal in all directions"). Arrow connects them with the mechanism. |
| `A2_C3_meaning_statement` | Text | "The brain interprets [perceptual signal] as [cognitive meaning] because [embodied/proprioceptive/emotional reason]." |
| `A2_C3_A_I_interaction_note` | Text | How Aesthetics and Ideology begin interacting on the Geometry substrate at this point — the shape's perceptual affordance becomes available for ideological loading. |

---

### Component 4: ELABORATION RANGE MAP (A2c — Expressive Range)

How far this geometric metaphor can travel.

| Deliverable | Format | Description |
|-------------|--------|-------------|
| `A2_C4_elaboration_diagram` | SVG/PNG | Fan/tree diagram: center = the base geometric property, branches = all the domains it elaborates into (sun disks, shields, halos, wheels, coins, city plans...). Civilization-specific examples highlighted. |
| `A2_C4_elaboration_list` | YAML | List of 5–8 elaboration domains with one concrete example each. This seeds A3 and A4. |
| `A2_C4_cognitive_channel_count` | YAML | Which cognitive channels the base geometry activates: perceptual, proprioceptive, embodied, emotional, social. More channels = larger elaboration range. |
| `A2_C4_bridge_to_A3` | Text | Explicit statement of why this element will appear across so many contexts — setting up A3's survey. |

---

### Component 5: MUSEUM ARTIFACT IMAGES WITH OVERLAY

Real artifacts showing the visual rhetoric principle in action.

| Deliverable | Format | Description |
|-------------|--------|-------------|
| `A2_C5_artifact_images` | 2–3 × MUS (museum-sourced) | Element visible in different symbolic contexts. Full attribution: name, museum, accession, date, material, dimensions. |
| `A2_C5_geometric_overlays` | 2–3 × OVR | Transparent overlays on each artifact highlighting the GEA/GEM decomposition from C1. Same color coding. |
| `A2_C5_cultural_application_image` | 1 × DGM or composite | Side-by-side: abstract geometric property (from C1) next to the artifact that deploys it. "This is WHY it works." |

---

### Distillation Artifacts

| Deliverable | Content |
|-------------|---------|
| `A2_L5_etextbook` | Full three-stage analysis (A2a/b/c), all 5 components embedded, GEA/GEM notation, carrier comparison, cognitive channel explanation, historical elaboration examples, discussion prompts, vocabulary |
| `A2_L4_teacher_script` | Three-stage walkthrough with timing (5–7 min total), grade-calibrated student-facing language, key diagrams referenced, anticipated questions ("Is it always symmetrical?"), differentiation (simpler: count parts; harder: predict affordance) |
| `A2_L3_slideshow` | Slide 1: Decomposition diagram (C1). Slide 2: Perceptual affordance (C2). Slide 3: Cultural application (C5). Slide 4: Key question per sub-stage. |
| `A2_L2_worksheet` | "What shapes make up [element]?" (label diagram) + "What does your eye do?" (trace arrows) + "What does this shape make you think/feel? Why?" |
| `A2_L1_teacher_summary` | Element: [name]. GEA composition: [list]. Visual rhetoric principle: [one sentence]. Perceptual affordance: [property] → [effect]. |

---

## STRUCTURAL CONSTRAINT ENFORCEMENT

- A2 principle MUST be crystallizable in A5 — if you can't name a specific artifact where this principle is physically present, STOP and fix A2 before proceeding.
- A2 principle MUST be teachable in A6 — if students can't replicate the construction sequence, STOP and simplify.
- A2 perceptual affordance = B2 mathematical property in a different register. Flag if they diverge.

---

## QUALITY CHECKLIST

### Content
- [ ] GEA/GEM decomposition is PRESENT and formally notated
- [ ] All three sub-stages (significance, meaning, elaboration) addressed
- [ ] At least 2 museum artifacts with accession numbers
- [ ] Geometric overlays applied to artifacts
- [ ] Carrier comparison shows dimensional rendering differences
- [ ] Elaboration range gives 5+ domains

### Pedagogical
- [ ] NOT feelings, NOT social-emotional learning
- [ ] This is craft intelligence of visual communication
- [ ] Grade-calibrated language throughout
- [ ] Eye-tracking / perceptual mechanism is explicit

### Structural
- [ ] A2 principle traceable to A5 artifact (name it)
- [ ] A2 affordance = B2 property (state both, confirm match)
- [ ] A2c bridges to A3 (elaboration range explains carrier diversity)
- [ ] A1's emotional hook converted to intellectual curiosity
