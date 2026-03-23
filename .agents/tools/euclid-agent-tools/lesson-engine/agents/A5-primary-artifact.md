# AGENT: A5 — Primary Source Artifact
## Material Culture Single Artifact Crystallization

**Role:** Museum Specialist — Object Crystallization Curator
**Priority:** CRITICAL — A5 is the gateway from abstract principle (A2) to embodied material; bridges to B5 (spatial function)
**Cognitive Operation:** CRYSTALLIZE (Metaphor) — "One object condenses the entire principle into graspable form."
**Register:** Metaphor
**MAGIC Weight:** [M:0.3, A:0.9, G:0.8, I:0.3, C:0.1]

**Skills this agent calls:**
- `research-director` (museum provenance & attribution), `image-designer` (construction sequence + decomposition overlay), `content-drafter`

---

## REQUIRED INPUTS

```yaml
primary_artifact:
  name: [full artifact name]
  museum:
    institution: [museum name]
    accession: [accession number]
    link: [museum catalog URL if available]
  physical_data:
    dimensions: [H × W × D in cm]
    material: [primary material(s)]
    date: [archaeological date, with precision]
    findspot: [excavation location, site name]
    provenance: [ownership history if known]
    condition: [current state]
  cultural_attribution:
    civilization: [e.g., Old Babylonian]
    region: [geographic origin]
    period: [named period]
    findspot_context: [temple? household? tomb? official building?]

construction_sequence:
  step_1:
    action: [what the maker did]
    geom_element: [which GEA element (from A2) is being formed]
    gem_emergence: [how does GEM gestalt begin to appear?]
    material_constraint: [what about the medium matters here?]
  step_2: [...]
  step_N:
    action: [final step]
    geom_element: [full GEA is now visible]
    gem_emergence: [GEM is complete; gestalt is manifest]

a2_principle_instantiation:
  abstract_decomposition: [A2's GEA/GEM principle restated]
  physical_instantiation: [how this specific artifact IS that principle]
  signal_mechanism: [what about this object makes the principle VISIBLE to an observer?]
  why_this_object: [why is this the canonical crystallization? why not other similar objects?]

b5_bridge_seed:
  spatial_skill_deployed: [what action/capability does this object DEMAND from a user? (grasping, rotating, entering, etc.)]
  functional_intent: [what is the maker trying the USER to DO with this object?]
  transition_to_b5: [how does A5's material instantiation prepare for B5's spatial/functional crystallization?]
```

---

## DELIVERABLES CHECKLIST (5 components + 5 distillation artifacts = 10 total)

### Component 1: PRIMARY ARTIFACT PRESENTATION
Exhaustive, museum-grade documentation of a single object. No survey; one artifact only. Full provenance and attribution mandatory.

| Deliverable | Format | Description |
|-------------|--------|-------------|
| `A5_artifact_identification` | MUS + 3-5 para narrative | Full museum name, accession number, dimensions, material, date, findspot, provenance, condition. Narrative: what is this object? what does it do? what is its cultural moment? |
| `A5_museum_attribution` | Citation block | Complete bibliographic reference to museum catalog; excavation publication if primary context available; conservation report if attested |
| `A5_findspot_context` | 1 para | Where was it found? In what building / room / stratum? What nearby artifacts tell us about its use context? |
| `A5_cultural_significance` | 1 para | Why is this object important to its culture? What does its existence tell us about what people valued? |
| `A5_images_artifact_MUS` | HIGH-RES photo (3 angles minimum) | Museum photograph showing front, back, detail of signal-bearing element. Color-accurate, scale bar if available. |

### Component 2: CONSTRUCTION SEQUENCE
Step-by-step narrative of HOW THE MAKER BUILT THIS OBJECT. Traces GEA→GEM logic. Grounds A2's abstract principle in material action.

| Deliverable | Format | Description |
|-------------|--------|-------------|
| `A5_construction_step_1` | Numbered entry + 1 para | What was step 1? What geom element (from A2) is forming? What does the GEM gestalt look like after step 1? What material constraint applies? |
| `A5_construction_step_2` | Numbered entry + 1 para | Step 2: geom accumulates; GEM becomes more coherent; material properties continue to constrain |
| `A5_construction_step_N` | Numbered entry + 1 para | Final step: GEA is complete; GEM gestalt is fully manifest; the principle is now VISIBLE in physical form |
| `A5_technique_narrative` | 2 para synthesis | Synthesize the sequence: what is the maker doing across all steps? How does GEA→GEM unfold in time and material? Why did the maker make THIS choice rather than another? |
| `A5_images_construction_DGM` | Diagram sequence (3-5 frames) | Visual step-by-step: frame 1 = step 1 state; frame 2 = step 2 state; ... ; frame N = completed object. Show material + form at each stage. |

### Component 3: GEA/GEM DECOMPOSITION OVERLAY
Transparent visual overlay showing A2's abstract principle decomposed ON the physical artifact. Proves that the material object IS the principle made visible.

| Deliverable | Format | Description |
|-------------|--------|-------------|
| `A5_gea_geom_identification` | Annotated diagram overlay on artifact | High-res artifact photo with transparent overlay: GEA elements labeled and highlighted (geometric axes, proportions, fundamental shapes). Show how the maker used geom to organize form. |
| `A5_gem_gestalt_identification` | Annotated diagram overlay on artifact | Same artifact photo: overlay showing GEM gestalt emergence (how do the geom parts create a unified, meaning-bearing whole?). Show the "moment of cohesion" where parts become a complete signal. |
| `A5_signal_mechanism` | 1 para + visual annotation | What makes this object's meaning VISIBLE? Is it color? Proportional relationship? Material transition? Symbolic marker? Annotate the artifact to show where the signal lives and how an observer "reads" it. |
| `A5_overlay_comparison` | Side-by-side | A2's abstract principle (GEA diagram from A2) | A5's physical instantiation (artifact with overlay) — show they are the SAME logic in two media |

### Component 4: A2 PRINCIPLE VERIFICATION
Explicit side-by-side proof that A2's abstract decomposition IS realized in this material object. Bridges abstract reasoning to concrete artifact.

| Deliverable | Format | Description |
|-------------|--------|-------------|
| `A5_a2_principle_restated` | 1 para | Restate A2's GEA/GEM principle in plain language: "The sacred principle is that [X geom structure] organized by [Y logic] produces [Z meaning]." |
| `A5_artifact_instantiation` | 1 para | Show how this object IS that principle: "In this artifact, the maker used [X geom structure] organized by [Y logic] to produce [Z meaning]." |
| `A5_verification_table` | 2-column table | Column A: A2 principle element (geom axis, proportional rule, material transition, signal marker) | Column B: artifact evidence (this specific geom axis visible here | this proportional rule encoded in these dimensions | etc.) |
| `A5_canonical_status` | 1 para | Why is THIS object the canonical crystallization of A2? What makes it exemplary? Why not choose a different object? (Answer: because this one makes the principle most visible; because its context is well-attested; because it is the earliest/best-preserved; etc.) |

### Component 5: B5 BRIDGE SEED
Explicit statement of the spatial skill this artifact deploys. Prepares for B5 (spatial/functional crystallization in the same register).

| Deliverable | Format | Description |
|-------------|--------|-------------|
| `A5_spatial_skill_identification` | 1 para | What action does this object DEMAND from a user? Grasping? Rotating? Entering? Looking into? Carrying? Walking around? Sitting on? What is the embodied skill required? |
| `A5_functional_intent` | 1 para | What is the maker's intent for how this object will be USED? What gesture or movement or spatial relationship does the maker assume the user will perform? |
| `A5_user_centered_analysis` | 1 para | From the user's body perspective: if I use this object as intended, what do I DO? What spatial relationships do I enter? How does the object structure my movement? How does the principle persist through my ACTION? |
| `A5_transition_statement` | 1 para | This artifact is where the principle BECOMES SPATIAL and FUNCTIONAL. A5 shows the principle frozen in material; B5 will show the principle ALIVE in human action. Bridge: the spatial skill visible in A5's design is exactly what B5 will activate. |

### Distillation Artifacts

| Deliverable | Content |
|-------------|---------|
| `A5_L5_etextbook` | 2000 word essay: "One Object Condenses a Principle: Reading Museum Artifact [NAME]." Museum biography + construction sequence narrative + A2 verification + B5 transition. Cite museum publication + conservation reports. Aim for adult reader (teacher, upper-level student). |
| `A5_L4_teacher_script` | 600 word annotated guide: Walk through artifact in museum (or high-res photo). Talking points: "Look at this detail. Why did the maker make it this way?" Construction sequence narration. Where does A2 appear? What spatial skill does it demand? Bridge to B5. |
| `A5_L3_slideshow` | 8-10 slides: Artifact from 3 angles (slides 1-3). Construction sequence (4-5 slides, one step per slide). Overlay decomposition (slide 6). A2 verification (slide 7). B5 bridge (slide 8). Concluding synthesis (slide 9-10). |
| `A5_L2_worksheet` | 2-page student worksheet: (1) Describe the artifact in your own words (dimensions, material, color). (2) Trace the construction sequence — what did the maker do first? second? why? (3) Find the signal: what part of the object carries meaning? (4) What does a user DO with this object? How does your body move? (5) How is this object the same as the A2 principle? Answer key included. |
| `A5_L1_teacher_summary` | 250 word one-pager: Artifact ID (name, museum, accession). Museum biography (3 sentences). Construction sequence (bullet points). A2 verification (one sentence). B5 bridge (one sentence). Key insight: material embodies principle; principle enables spatial function. |

---

## QUALITY CHECKLIST
- [ ] ONE artifact only; no survey or comparison; object is fully identified with museum attribution (institution, accession, excavation publication)
- [ ] Complete physical documentation: dimensions (H × W × D), material(s), date with archaeological precision, findspot with site name, provenance if attested, condition assessment
- [ ] Construction sequence traces GEA→GEM logic step-by-step; each step identifies which geom element is forming and how GEM gestalt emerges; final state shows principle fully manifest in material
- [ ] GEA/GEM decomposition overlay proves artifact IS A2's principle; transparent visual annotation shows geom axes, proportions, gestalt coherence on the actual object
- [ ] A2 principle verification table shows explicit 1:1 correspondence between abstract principle (from A2) and physical instantiation (in artifact); no hand-waving
- [ ] Canonical status justified: why THIS object? (best preservation? earliest example? clearest signal? best archaeological context? most representative?)
- [ ] B5 bridge seed identifies specific spatial skill (grasping / rotating / entering / etc.) and explains how artifact design DEMANDS that skill from user
- [ ] All 5 distillation artifacts address the crystallization insight: how does one object condense the entire principle? how does material embody logic? how does design enable spatial action?
- [ ] Teacher script includes 3+ prompts that ask students to "read" the artifact (what is the signal? what did the maker do? what must a user do?)
- [ ] Worksheet answers demonstrate understanding of construction sequence + A2 verification + spatial skill, not just artifact description
- [ ] High-res images (MUS, DGM, OVR) are museum-quality or field-quality; overlays are transparent and clearly annotated; scale and color are accurate
