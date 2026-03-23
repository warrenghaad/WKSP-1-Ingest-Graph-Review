# Section Requirements — Compiled from LESSON_ARCHITECTURE_SSOT v7.0

This is the machine-readable requirements reference for all 15 sections. Each section block contains everything needed for drafting, assessment, research routing, and image design.

Source authority: LESSON_ARCHITECTURE_SSOT v7.0 (March 2026). Sami Majeed is sole authority on definitions.

---

## A1: Mythological Introduction

```yaml
code: A1
name: Mythological Introduction
day: A
register: metaphor
cognitive_operation: PRESENT
cognitive_test: "Does it hook engagement without analysis?"
variable_focus: I-dominant
magic_weight: [M:0.1, A:0.6, G:0.5, I:0.9, C:0.2]
duration_minutes: [3, 5]
content_length: Short
paragraphs: [1, 2]

gea_gem:
  mandatory: false
  requirement: "Name the element and its atomic composition, but do NOT decompose — A2 does that. Present the shape as a whole."

primary_tags: [i_myth, i_deity_association, i_cosmological_role, a_symbolic_image, g_element_identification]
secondary_tags: [i_sacred_profane, c_institutional_origin]

artifacts:
  images_required: 1
  image_types: [MUS]
  description: "One striking image — the element in its most symbolically powerful form"
  museum_attribution: true
  overlay_needed: false

distillation:
  level_5: "Full mythological narrative, image with museum attribution, historical context paragraph, discussion prompt, vocabulary"
  level_4: "Narrative with timing cues, image, anticipated student responses, hook delivery guidance"
  level_3: "Image + 2–3 sentence hook text + element name"
  level_2: "Image + 'What do you notice about this shape?' prompt"
  level_1: "Element: [name]. Deity: [name]. Hook: [one sentence]. Image: [source]."

structural_constraints:
  upstream: none
  downstream: [A2]
  receives_from_circuit: "B8 of previous week previews this element"
  critical_matches: none
  named_constraints: none

guardrails:
  - "Do NOT decompose the element — present it whole"
  - "Emotional/narrative hook, not analytical"
  - "Must establish that this shape carried weight for real people"
```

---

## A2: Visual Rhetoric — The GEpHR Mechanism

```yaml
code: A2
name: "Visual Rhetoric — The GEpHR Mechanism"
day: A
register: metaphor
cognitive_operation: DEFINE
cognitive_test: "Does it explain WHY/HOW the geometry carries meaning?"
variable_focus: A+G dominant
magic_weight: [M:0.3, A:0.8, G:0.8, I:0.5, C:0.2]
duration_minutes: [5, 7]
content_length: Substantial
paragraphs: [3, 5]

gea_gem:
  mandatory: true
  requirement: "MANDATORY full decomposition into atomic components. Molecular composition must be explicitly connected to perceptual affordance."

sub_sections:
  - code: A2a
    name: "Significance (Perceptual Grab)"
    focus: "What about this GEA/GEM configuration captures attention? Compositional analysis."
    tags: [g_gea_decomposition, g_gem_composition, a_perceptual_affordance, a_line_direction, a_proportion, a_symmetry_type, g_carrier_dimension]
  - code: A2b
    name: "Meaning (Interpretive Load)"
    focus: "What does the brain do with those perceptual signals? Geometric property → cognitive interpretation."
    tags: [a_cognitive_effect, g_property_to_perception, i_meaning_assignment, a_embodied_response]
  - code: A2c
    name: "Elaboration (Expressive Range)"
    focus: "How far can this geometric metaphor travel? Elaboration range across domains."
    tags: [g_elaboration_range, a_cross_domain_metaphor, i_cultural_loading, g_cognitive_channel_count]

primary_tags: [a_visual_rhetoric, g_gea_decomposition, g_gem_composition, a_perceptual_affordance, g_carrier_dimension, a_cognitive_effect]
secondary_tags: [m_angle_measurement, m_symmetry_count, i_meaning_assignment, a_composition_analysis]

artifacts:
  images_required: [5, 6]
  image_types: [MUS, MUS, MUS, DGM, DGM, DGM]
  description: "2–3 images in different symbolic contexts + 3 diagrams: (1) GEA/GEM decomposition, (2) perceptual affordance map, (3) cultural application"
  museum_attribution: true
  overlay_needed: true
  overlay_type: decomposition

distillation:
  level_5: "Full three-stage analysis, all three diagram types, GEA/GEM notation, carrier comparison, cognitive channel explanation, historical examples of elaboration, discussion prompts"
  level_4: "Three-stage walkthrough with timing, key diagrams, student-facing language calibrated to grade, anticipated questions, differentiation notes"
  level_3: "Property isolation diagram + perceptual affordance diagram + 1 cultural example + key question per sub-stage"
  level_2: "'What shapes make up [element]?' + 'What does your eye do?' + 'What does this shape make you think/feel? Why?'"
  level_1: "Element: [name]. GEA composition: [list]. Visual rhetoric principle: [one sentence]. Perceptual affordance: [property] → [effect]."

structural_constraints:
  upstream: [A1]
  downstream: [A3, A4, A5, A6, A7, B2, B8]
  critical_matches:
    - "A2 visual rhetoric principle MUST be crystallizable in A5"
    - "A2 visual rhetoric principle MUST be teachable in A6"
    - "A2 perceptual affordance and B2 mathematical property are the SAME geometric fact in two registers"
  named_constraints: ["BRIDGE source (A2↔B2 are the same property)"]

guardrails:
  - "NOT feelings. NOT social-emotional learning."
  - "This is craft intelligence of visual communication"
  - "GEA/GEM decomposition is MANDATORY — cannot skip"
  - "Three-stage broadcast model (significance → meaning → elaboration) must be present"
  - "Whatever principle established here MUST reappear in A5 and be taught in A6"
```

---

## A3: Iconographic Chain — Sacred Art Generalization

```yaml
code: A3
name: "Iconographic Chain — Sacred Art Generalization"
day: A
register: metaphor
cognitive_operation: GENERALIZE (Sacred Domain)
cognitive_test: "Does it show the principle across NEW sacred contexts?"
variable_focus: A+I dominant
magic_weight: [M:0.1, A:0.9, G:0.7, I:0.9, C:0.3]
duration_minutes: [5, 7]
content_length: Medium
paragraphs: survey_format

gea_gem:
  mandatory: false
  requirement: "Each example must be annotated with the GEA/GEM composition visible in A2's decomposition."

primary_tags: [a_iconographic_chain, i_sacred_deployment, g_cross_carrier_persistence, a_visual_narrative, i_deific_representation]
secondary_tags: [g_carrier_variation, g_dimensional_rendering, c_temple_commission, a_style_comparison]

artifacts:
  images_required: [3, 5]
  image_types: [MUS, MUS, MUS, MUS, MUS]
  description: "3–5 images from different carrier types within the sacred domain (seal, relief, vessel, architecture, votive)"
  museum_attribution: true
  overlay_needed: true
  overlay_type: highlight

distillation:
  level_5: "All images with full museum attribution, GEA/GEM annotations per carrier, historical context per artifact, comparison analysis, discussion prompts"
  level_4: "Images with guided comparison questions, timing, 'what's the same across all of these?' prompt structure"
  level_3: "3–5 images side-by-side + caption identifying A2 principle in each"
  level_2: "Images + 'Circle the [element] in each image' + 'What stays the same?'"
  level_1: "A2 principle: [name]. Sacred carriers: [list of 3–5 with sources]. Pattern: [one sentence]."

structural_constraints:
  upstream: [A2]
  downstream: [A4]
  critical_matches:
    - "Must show A2's visual rhetoric principle across carriers — not just 'same shape different places'"
  named_constraints: none

guardrails:
  - "Students are identifying the same VISUAL RHETORIC MECHANISM, not just the same shape"
  - "Different carrier types required (not 5 cylinder seals)"
  - "Must stay in sacred domain — secular/social expansion is A4's job"
```

---

## A4: Diffusion — Ritual, Object, Role, Class, Time

```yaml
code: A4
name: "Diffusion — Ritual, Object, Role, Class, Time"
day: A
register: metaphor
cognitive_operation: GENERALIZE (Secular/Social)
cognitive_test: "Does it show diffusion beyond sacred domain with power analysis?"
variable_focus: I+C directive
magic_weight: [M:0.2, A:0.7, G:0.7, I:0.8, C:0.6]
duration_minutes: [10, 15]
content_length: Medium-substantial
paragraphs: [1, 2] per sub-section

gea_gem:
  mandatory: false
  requirement: "GEA/GEM composition from A2 should be identifiable in each sub-section artifact."

sub_sections:
  - code: A4a
    name: "Sacred/Ceremonial"
    focus: "Where the element is most regulated — temple objects, ritual vessels"
  - code: A4b
    name: "Ritual Context"
    focus: "How the element functions in active ritual practice"
  - code: A4c
    name: "Official/Administrative"
    focus: "The element in governance — seals, weights, boundary markers"
  - code: A4d
    name: "Domestic/Everyday"
    focus: "The element in daily life — pottery, tools, household objects"
  - code: A4e
    name: "Architectural"
    focus: "The element in built environment — beyond temples"
  - code: A4f
    name: "Personal/Wearable"
    focus: "The element on the body — jewelry, amulets, cylinder seals"

primary_tags: [i_institutionalization, c_access_control, c_class_stratification, a_cross_carrier, i_ritual_regulation, g_carrier_diversity]
secondary_tags: [c_commission_patronage, i_sacred_profane_boundary, a_style_variation, m_standardization]

artifacts:
  images_required: [2, 12]  # 1-2 per sub, min 2 subs
  image_types: [MUS]
  description: "1–2 images per sub-section with full attribution"
  museum_attribution: true
  overlay_needed: true
  overlay_type: highlight

distillation:
  level_5: "All sub-sections with full artifact detail, power analysis, access control discussion, cross-class comparison, discussion prompts per sub"
  level_4: "2–3 selected sub-sections with guided questions about 'who got to use this?', differentiation notes"
  level_3: "2–3 artifact images across categories + key question about access/power"
  level_2: "'Where does the [element] appear?' matching or sorting activity across categories"
  level_1: "Diffusion path: [sacred] → [secular]. Power constraint: [one sentence]. Key artifacts: [2–3 with sources]."

structural_constraints:
  upstream: [A3]
  downstream: [A5]
  critical_matches: none
  named_constraints: none

guardrails:
  - "Must contain ≥ 2 sub-sections per lesson"
  - "Each sub must cite a DIFFERENT artifact category"
  - "Each sub must name a SPECIFIC object (not 'objects' plural)"
  - "Each sub must identify a DIFFERENT signal/meaning"
  - "Each sub must address who had access and who was excluded"
```

---

## A5: Material Culture — Single Artifact Crystallization

```yaml
code: A5
name: "Material Culture — Single Artifact Crystallization"
day: A
register: metaphor
cognitive_operation: CRYSTALLIZE (Metaphor)
cognitive_test: "Does it anchor everything in ONE specific artifact?"
variable_focus: A+G dominant
magic_weight: [M:0.3, A:0.9, G:0.8, I:0.3, C:0.1]
duration_minutes: [5, 7]
content_length: Substantial
paragraphs: [3, 5]

gea_gem:
  mandatory: true
  requirement: "MANDATORY. A2 decomposition must be visible in the physical construction. Construction sequence must follow GEA → GEM logic."

primary_tags: [a_technique_decomposition, g_gea_construction_sequence, g_gem_assembly, a_material_craft, g_carrier_specification, g_dimensional_rendering]
secondary_tags: [m_measurement_precision, a_tool_use, i_workshop_tradition, g_construction_geometry]

artifacts:
  images_required: 3
  image_types: [MUS, DGM, OVR]
  description: "1 primary artifact (HIGH-RES) + 1 construction sequence diagram + 1 GEA/GEM decomposition overlay"
  museum_attribution: true
  overlay_needed: true
  overlay_type: decomposition
  high_res_required: true

distillation:
  level_5: "Full artifact analysis with museum data, construction sequence, GEA/GEM trace, material analysis, historical context, artist/workshop attribution"
  level_4: "Artifact image with guided decomposition walkthrough, construction sequence as step list, 'how did they make this?' prompt structure"
  level_3: "Artifact image + annotated construction diagram + 3–4 key construction steps"
  level_2: "Construction steps with blanks + 'Label the [GEA elements] in this artifact' activity"
  level_1: "Artifact: [name, museum, accession]. A2 principle visible in: [one sentence]. Construction: [3–4 steps]."

structural_constraints:
  upstream: [A2, A3, A4]
  downstream: [A6, B5]
  critical_matches:
    - "MUST instantiate A2's visual rhetoric principle"
    - "A2 diagram next to A5 artifact → match must be visible"
  named_constraints: ["BRIDGE (A5↔B5) — same spatial skill, two registers"]

guardrails:
  - "ONE artifact, not a survey"
  - "Full museum attribution mandatory (name, museum, accession, dimensions, material, provenance, date)"
  - "Construction sequence must trace GEA → GEM → gestalt"
  - "If A2's principle is not visible in this artifact, the lesson is broken"
```

---

## A6: Art Activity — Practice

```yaml
code: A6
name: "Art Activity — Practice"
day: A
register: metaphor
cognitive_operation: PRACTICE (Metaphor)
cognitive_test: "Does it require student production using A5's technique?"
variable_focus: A+G dominant
magic_weight: [M:0.2, A:0.9, G:0.8, I:0.4, C:0.1]
duration_minutes: [15, 20]
content_length: Activity_instructions

gea_gem:
  mandatory: true
  requirement: "Activity instructions must follow the GEA → GEM construction sequence from A5."

primary_tags: [a_art_practice, g_construction_exercise, a_material_production, g_gea_to_gem_sequence]
secondary_tags: [m_measurement_application, a_aesthetic_judgment, g_tool_precision]

artifacts:
  images_required: 3
  image_types: [CON, MUS_or_SCN, DGM]
  description: "Step-by-step construction sequence + exemplar for comparison + materials layout"
  museum_attribution: false

distillation:
  level_5: "Full instructions, materials list, exemplar images, extension challenges, rubric, historical comparison"
  level_4: "Step-by-step with timing, common mistakes, differentiation (simpler/harder), circulation prompts"
  level_3: "Step-by-step visual instructions, 4–6 slides showing construction stages"
  level_2: "Step-by-step with space for student work, self-assessment checklist"
  level_1: "Activity: [name]. Steps: [count]. Key check: [what to look for]. Materials: [list]."

structural_constraints:
  upstream: [A2, A5]
  downstream: [A7]
  critical_matches:
    - "Activity must replicate A5's construction technique"
    - "A2's visual rhetoric principle should survive student construction"
  named_constraints: none

guardrails:
  - "Construction sequence from A5, not a new technique"
  - "Assessment rubric tied to geometric precision"
  - "Materials list required"
```

---

## A7: Dual-Register Reveal — The Pivot

```yaml
code: A7
name: "Dual-Register Reveal — The Pivot"
day: A
register: "metaphor → transitional"
cognitive_operation: REVEAL + PIVOT
cognitive_test: "Does it show both meaning AND function simultaneously?"
variable_focus: G peak (Day A)
magic_weight: [M:0.5, A:0.7, G:0.9, I:0.7, C:0.6]
duration_minutes: [5, 7]
content_length: Substantial
paragraphs: [3, 4]

gea_gem:
  mandatory: true
  requirement: "Same GEA/GEM decomposition from A2, now annotated for BOTH registers."

primary_tags: [g_dual_register, a_architectural_rhetoric, m_structural_function, g_gecd_dual_reading, i_monumental_meaning, c_state_commission]
secondary_tags: [g_scale_transformation, m_force_distribution, a_spatial_experience, i_civic_ideology]

artifacts:
  images_required: 3
  image_types: [MUS_or_SCN, DGM, OVR]
  description: "1 architectural example + 1 split annotation diagram (meaning | function) + 1 dual overlay"
  museum_attribution: true
  overlay_needed: true
  overlay_type: dual_register

distillation:
  level_5: "Full architectural analysis, dual-register annotation, historical commissioning context, structural analysis, discussion"
  level_4: "Guided 'same shape means X and does Y' reveal, discussion facilitation, bridge to Day B"
  level_3: "Architectural image + split annotation (left: meaning, right: function) + bridge question"
  level_2: "'This [element] MEANS ___ AND DOES ___' completion + drawing activity"
  level_1: "Architecture: [name, location]. Metaphor reading: [one sentence]. Function reading: [one sentence]. Bridge to Day B: [one sentence]."

structural_constraints:
  upstream: [A1, A2, A3, A4, A5, A6]
  downstream: [B1]
  critical_matches:
    - "Must use an artifact where BOTH registers are visible"
  named_constraints: ["THE PIVOT (A7 → B1)"]

guardrails:
  - "Not 'metaphor becomes function' — they were ALWAYS BOTH"
  - "Architectural or large-scale engineered artifact required"
  - "Full site data: location, date, dimensions, construction technique, patron"
```

---

## B1: Bridge — Register Shift

```yaml
code: B1
name: "Bridge — Register Shift"
day: B
register: function
cognitive_operation: PRESENT (Function)
cognitive_test: "Does it re-present the element through function, acknowledging Day A?"
variable_focus: Balanced
magic_weight: [M:0.3, A:0.5, G:0.6, I:0.5, C:0.2]
duration_minutes: [3, 5]
content_length: Short
paragraphs: [1, 2]

gea_gem:
  mandatory: false
  requirement: "Same element, same composition — reframed for mechanical possibility."

primary_tags: [g_register_shift, m_functional_framing, g_element_reintroduction, a_bridge_reference]
secondary_tags: [i_day_a_recall, g_problem_framing]

artifacts:
  images_required: [0, 1]
  image_types: [A7_recall]
  description: "Reference back to A7's dual-register artifact. May introduce one new functional image."
  museum_attribution: false

distillation:
  level_5: "Bridge narrative, A7 recall, functional reframing, preview of B2's question"
  level_4: "'Yesterday we asked what this means. Today: what does it DO?' + recall prompt + transition"
  level_3: "A7 image recalled + 'Today's question: What does this DO?'"
  level_2: "'Yesterday this shape MEANT ___. Today we ask: what does it DO?'"
  level_1: "Bridge from A7: [one sentence]. Day B question: [one sentence]."

structural_constraints:
  upstream: [A7]
  downstream: [B2]
  critical_matches:
    - "Must explicitly acknowledge Day A"
  named_constraints: ["THE PIVOT (A7 → B1)"]

guardrails:
  - "Short — the bridge, not the destination"
  - "Must reference A7 explicitly"
  - "Functional framing: 'what does this make possible?'"
```

---

## B2: Mathematical Properties — GEK Formalization

```yaml
code: B2
name: "Mathematical Properties — GEK Formalization"
day: B
register: function
cognitive_operation: DEFINE (Function)
cognitive_test: "Does it explain the formal mathematical properties?"
variable_focus: M-dominant
magic_weight: [M:0.9, A:0.2, G:0.7, I:0.2, C:0.1]
duration_minutes: [5, 7]
content_length: Substantial
paragraphs: [3, 5]

gea_gem:
  mandatory: true
  requirement: "Same decomposition from A2, now annotated with mathematical properties per component and per interaction."

primary_tags: [m_definition, m_proof, m_measurement, g_formal_properties, m_symmetry_group, g_gea_math_properties]
secondary_tags: [m_angle_relationships, m_area_calculation, g_gem_math_properties, m_notation]

artifacts:
  images_required: [3, 4]
  image_types: [DGM, DGM, DGM, OVR]
  description: "Annotated diagrams with measurements, angles, symmetry lines + mathematical notation overlay"
  museum_attribution: false
  overlay_needed: true
  overlay_type: measurement

distillation:
  level_5: "Full mathematical analysis, proofs/demonstrations, notation, worked examples, practice problems, GEA/GEM math annotation"
  level_4: "Guided mathematical discovery with manipulatives, key questions, anticipated misconceptions, grade-calibrated language"
  level_3: "Mathematical diagrams + property statements + measurement annotations"
  level_2: "Measurement/counting exercises + 'How many lines of symmetry?' + construction verification"
  level_1: "Mathematical property: [name]. Formal statement: [one sentence]. Connection to A2: [one sentence]."

structural_constraints:
  upstream: [B1, A2]
  downstream: [B3, B4, B5, B6, B7, B8]
  critical_matches:
    - "A2 perceptual affordance and B2 mathematical property are the SAME geometric fact"
    - "B2 property MUST be functionally deployed in B5"
  named_constraints: ["BRIDGE source (A2↔B2 same property, two registers)"]

guardrails:
  - "M-dominant — this is MATH, not art or symbolism"
  - "Grade-calibrated: Grade 3 = measurement/counting, Grade 5 = proof-adjacent"
  - "Same property as A2 — different register, not different fact"
```

---

## B3: Transformations & Operations — GEK-T Mechanics

```yaml
code: B3
name: "Transformations & Operations — GEK-T Mechanics"
day: B
register: function
cognitive_operation: GENERALIZE (Operations)
cognitive_test: "Does it show B2's property under mathematical operations?"
variable_focus: M+G dominant
magic_weight: [M:0.8, A:0.3, G:0.9, I:0.2, C:0.2]
duration_minutes: [5, 7]
content_length: Medium-substantial
paragraphs: [2, 4]

gea_gem:
  mandatory: true
  requirement: "Show how GEA/GEM compositions behave under transformation. Which properties preserved? Which change? What new GEMs emerge?"

primary_tags: [m_transformation, g_gek_t_operation, g_dimensional_change, m_property_preservation, g_tessellation, g_projection]
secondary_tags: [m_proof_by_operation, g_new_gem_generation, g_spatial_impossibility]

artifacts:
  images_required: [3, 5]
  image_types: [DGM, DGM, DGM, DGM]
  description: "Transformation diagrams: before/after, impossibility demonstrations"
  museum_attribution: false

distillation:
  level_5: "Full transformation analysis, all operations demonstrated, impossibility proofs, extension to higher dimensions"
  level_4: "Key transformations with manipulative demonstrations, inquiry structure"
  level_3: "Transformation diagrams + before/after + 'what changed? what stayed?'"
  level_2: "'Rotate this shape ___°. What do you notice?' + prediction exercises"
  level_1: "Key transformations: [list 2–3]. Preserved: [one sentence]. Changed: [one sentence]."

structural_constraints:
  upstream: [B2]
  downstream: [B4]
  critical_matches: none
  named_constraints: none

guardrails:
  - "Include at least one impossibility demonstration (what DOESN'T work)"
  - "Properties preserved vs. changed must be explicit"
```

---

## B4: Shape Lineage — Historical Trajectory G(t)

```yaml
code: B4
name: "Shape Lineage — Historical Trajectory G(t)"
day: B
register: function
cognitive_operation: GENERALIZE (Lineage)
cognitive_test: "Does it trace functional deployment across time with power analysis?"
variable_focus: G+C dominant
magic_weight: [M:0.6, A:0.4, G:0.8, I:0.4, C:0.6]
duration_minutes: [5, 7]
content_length: Medium-substantial
paragraphs: [2, 4]

gea_gem:
  mandatory: false
  requirement: "Show how base GEA/GEM combined with OTHER elements over time. Trace compositional evolution."

primary_tags: [g_historical_trajectory, g_element_combination, c_engineering_patronage, g_gem_evolution, m_formalization_timeline, c_innovation_suppression]
secondary_tags: [i_engineering_tradition, c_monopoly, g_combination_gap, g_diffusion_gap]

artifacts:
  images_required: [3, 4]
  image_types: [DGM, MUS_or_SCN, MUS_or_SCN, MUS_or_SCN]
  description: "Timeline visualization + 2–3 historical examples showing combinatorial evolution"
  museum_attribution: true

distillation:
  level_5: "Full G(t) analysis, deviation vector discussion, combination/formalization/diffusion gaps, power analysis, timeline with images"
  level_4: "Simplified timeline with key moments, 'why did it take so long to combine X with Y?' prompt, power discussion"
  level_3: "Timeline graphic + 2–3 key invention moments + power question"
  level_2: "Timeline ordering activity + 'Who decided what got built?' discussion prompt"
  level_1: "Lineage: [element] → [combination 1] → [combination 2]. Power constraint: [one sentence]. Gap: [one sentence]."

structural_constraints:
  upstream: [B3]
  downstream: [B5]
  critical_matches: none
  named_constraints: none

guardrails:
  - "C (power) re-enters here — who funded engineering? What was suppressed?"
  - "Deviation vector framework: what COULD have been combined but wasn't, and why"
```

---

## B5: Current Notch — STEM Notch Crystallization

```yaml
code: B5
name: "Current Notch — STEM Notch Crystallization"
day: B
register: function
cognitive_operation: CRYSTALLIZE (Function)
cognitive_test: "Does it anchor B2's property in ONE specific invention?"
variable_focus: G peak (Day B)
magic_weight: [M:0.8, A:0.5, G:0.9, I:0.3, C:0.7]
duration_minutes: [7, 10]
content_length: Substantial
paragraphs: [3, 5]

gea_gem:
  mandatory: true
  requirement: "MANDATORY full STEM notch decomposition: what GEA primitives compose the invention? What GEM configurations? What GEK-T transformations exploited?"

primary_tags: [m_stem_notch, g_invention_decomposition, g_gea_mechanical_composition, g_gem_functional_assembly, g_gek_t_exploitation, c_invention_context]
secondary_tags: [m_engineering_principle, c_patronage, i_engineering_tradition, g_deviation_vector]

artifacts:
  images_required: 3
  image_types: [MUS_or_SCN, DGM, DGM]
  description: "The invention + mechanical decomposition diagram + A5↔B5 bridge diagram"
  museum_attribution: true
  overlay_needed: true
  overlay_type: functional

distillation:
  level_5: "Full invention analysis, STEM notch decomposition, GEA/GEM mechanical trace, historical context, deviation vector, A5↔B5 bridge explicit"
  level_4: "Guided 'how does it work?' decomposition, A5 callback, differentiation"
  level_3: "Invention image + mechanical diagram + STEM notch summary + A5 bridge"
  level_2: "'Label the parts' + 'What math makes this work?' + 'How is this like what you built yesterday?'"
  level_1: "Invention: [name, place, date]. STEM notch: [one sentence]. B2 property deployed: [one sentence]. A5 bridge: [one sentence]."

structural_constraints:
  upstream: [B2, B3, B4, A5]
  downstream: [B6, B7, B8]
  critical_matches:
    - "MUST instantiate B2's mathematical property"
    - "A5↔B5 bridge: same spatial skill, two registers"
  named_constraints: ["THE BRIDGE (A5↔B5)"]

guardrails:
  - "ONE invention, not a survey"
  - "Full specification: what, where, when, how, who"
  - "B2's property must be functionally deployed — verifiable"
  - "A5↔B5 bridge must be explicit"
```

---

## B6: Engineering Decomposition — Teach

```yaml
code: B6
name: "Engineering Decomposition — Teach"
day: B
register: function
cognitive_operation: TEACH (Function)
cognitive_test: "Does it decompose B5's invention for student replication?"
variable_focus: M+G dominant
magic_weight: [M:0.7, A:0.4, G:0.8, I:0.2, C:0.2]
duration_minutes: [5, 7]
content_length: Medium

gea_gem:
  mandatory: false
  requirement: "Construction/testing instructions should reference GEA/GEM composition from B5."

primary_tags: [m_engineering_decomposition, g_construction_sequence, m_measurement_specification, g_force_analysis, m_testable_prediction]
secondary_tags: [a_design_constraint, g_material_selection, m_variable_isolation]

artifacts:
  images_required: 3
  image_types: [CON, DGM, DGM]
  description: "Build steps diagram + force/stress diagram + materials/measurements spec"

distillation:
  level_5: "Full engineering analysis, materials science, force diagrams, prediction framework, extensions"
  level_4: "Step-by-step with timing, materials, safety, common failures, differentiation"
  level_3: "Build steps as visuals + materials + key measurement"
  level_2: "Build steps + prediction ('I think ___ will happen because ___') + data table"
  level_1: "Build: [what]. Test: [what]. Predict: [what]. Materials: [list]."

structural_constraints:
  upstream: [B5]
  downstream: [B7]
  critical_matches:
    - "Decomposition of B5's invention for student construction"
  named_constraints: none
```

---

## B7: Engineering Activity — Practice

```yaml
code: B7
name: "Engineering Activity — Practice"
day: B
register: function
cognitive_operation: PRACTICE (Function)
cognitive_test: "Does it require student construction, testing, and iteration?"
variable_focus: M+G dominant
magic_weight: [M:0.7, A:0.3, G:0.8, I:0.2, C:0.1]
duration_minutes: [15, 20]
content_length: Activity_instructions

gea_gem:
  mandatory: false
  requirement: "Assessment should verify students can identify GEA/GEM in their build."

primary_tags: [m_engineering_practice, g_construction_exercise, m_testing_verification, g_mechanical_production, m_iteration]
secondary_tags: [m_data_collection, a_design_aesthetics, g_failure_analysis]

artifacts:
  images_required: 3
  image_types: [CON, DGM, DGM]
  description: "Construction instructions + test protocol visual + data collection template"

distillation:
  level_5: "Full instructions, testing protocol, data analysis, iteration guidance, extensions, real-world connections"
  level_4: "Step-by-step with timing, circulation priorities, key questions, assessment checkpoints"
  level_3: "Build steps + test protocol + data collection visual"
  level_2: "Build steps + test record + 'What happened? Why?' reflection"
  level_1: "Activity: [name]. Build: [what]. Test: [what]. Key check: [what to observe]."

structural_constraints:
  upstream: [B6]
  downstream: [B8]
  critical_matches:
    - "Builds from B6's decomposition"
  named_constraints: none

guardrails:
  - "Must include testing protocol — not just construction"
  - "Data collection required"
  - "Iteration prompt: when it fails, diagnose which geometric principle was violated"
```

---

## B8: Synthesis — Circuit Close

```yaml
code: B8
name: "Synthesis — Circuit Close"
day: B
register: "both (synthesis)"
cognitive_operation: SYNTHESIZE + CIRCUIT
cognitive_test: "Does it connect A2↔B2 and preview next week?"
variable_focus: Balanced
magic_weight: [M:0.5, A:0.5, G:0.7, I:0.4, C:0.5]
duration_minutes: [5, 7]
content_length: Medium
paragraphs: [2, 3]

gea_gem:
  mandatory: true
  requirement: "Must show SAME composition responsible for BOTH perceptual affordance (A2) and mechanical affordance (B2/B5)."

primary_tags: [g_dual_register_synthesis, g_circumnutating_proof, a_rhetoric_to_function, m_function_to_rhetoric, g_compounding_lens]
secondary_tags: [i_next_week_preview, g_circuit_close, g_cumulative_vocabulary]

artifacts:
  images_required: 2
  image_types: [DGM, MUS_or_SCN]
  description: "Split-screen synthesis diagram (A2 principle | B2 principle | SAME GEOMETRY) + next week preview image"
  museum_attribution: true_for_preview

distillation:
  level_5: "Full synthesis, explicit A2↔B2 connection, circumnutating demonstration, cumulative vocabulary, next week preview with hook"
  level_4: "Guided 'same shape, two readings' discussion, formative assessment, next week teaser"
  level_3: "Split screen: A2 principle / B2 principle + 'SAME GEOMETRY' + next week image"
  level_2: "'[Element] MEANS ___ because [property] creates [effect]. [Element] DOES ___ because [same property] enables [function].'"
  level_1: "Synthesis: [A2 principle] ↔ [B2 principle] because [same GEA/GEM]. Next week: [element, deity]."

structural_constraints:
  upstream: [A2, B2, B5, B7, all_prior]
  downstream: [next_week_A1]
  critical_matches:
    - "Must connect A2↔B2 explicitly"
    - "Must preview next week's element"
  named_constraints: ["THE CIRCUIT (B8 → next A1)"]

guardrails:
  - "NOT 'metaphor equals function' — they are two REGISTERS of the same configuration"
  - "Compounding lens: by week 8, the dual-register question should be automatic"
  - "Next week preview is required (if next week exists)"
```
