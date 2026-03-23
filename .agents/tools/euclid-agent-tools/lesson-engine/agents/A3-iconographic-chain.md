# AGENT: A3 — Iconographic Chain Survey
## The Visual Rhetoric Principle Across Sacred Carriers

**Role:** Archaeological Survey Curator — Cross-Carrier Pattern Analyst
**Priority:** HIGH — A3 proves that A2's principle is not a one-off but a visual LANGUAGE
**Cognitive Operation:** GENERALIZE (Sacred Domain) — "The principle appears everywhere in sacred art."
**Register:** Metaphor
**MAGIC Weight:** [M:0.1, A:0.9, G:0.7, I:0.9, C:0.3]

**Skills this agent calls:**
- `research-director` (museum sourcing across carrier types), `image-designer` (overlays per artifact), `content-drafter`

---

## REQUIRED INPUTS

```yaml
A2_principle: string        # The visual rhetoric principle from A2
A2_gea_gem: string          # The GEA/GEM notation from A2
element: string
deity: string
civilization: string
period: string
grade: integer
```

---

## DELIVERABLES CHECKLIST (3 components + 5 distillation artifacts = 8 total)

### Component 1: CARRIER DIVERSITY GALLERY

3–5 artifacts across DIFFERENT carrier types, all showing the SAME visual rhetoric.

| Deliverable | Format | Description |
|-------------|--------|-------------|
| `A3_C1_artifact_set` | 3–5 × MUS images | Each from a DIFFERENT carrier type. Minimum 3, target 5. Each with full museum attribution. |
| `A3_C1_carrier_types_covered` | YAML checklist | Which of these are represented: cylinder_seal, wall_relief, vessel/pottery, architectural_element, votive_sculpture, mosaic/tile, textile, metalwork. Must cover ≥ 3 distinct types. |
| `A3_C1_per_artifact_data` | YAML per artifact | name, museum, accession, date, material, dimensions, carrier_type, findspot, technique_visible, A2_principle_location ("where in this artifact is the principle visible?") |

**Critical rule:** Students are NOT seeing "the same shape in different places" — they are identifying the same VISUAL RHETORIC MECHANISM across different GE,C,D configurations. The caption for each artifact must point to A2's principle, not just the element's presence.

---

### Component 2: GEOMETRIC OVERLAY SET

Each artifact gets an overlay highlighting the A2 decomposition.

| Deliverable | Format | Description |
|-------------|--------|-------------|
| `A3_C2_overlays` | 3–5 × OVR (transparent PNG) | One per artifact. Same color-coding as A2's decomposition diagram. GEA primitives highlighted, GEM molecular form outlined. |
| `A3_C2_comparison_composite` | 1 × DGM | All artifacts side-by-side with overlays applied, showing the SAME geometric structure across carriers. Visual proof: "it's the same principle everywhere." |

---

### Component 3: CONTEXTUAL CAPTIONS

Not just labels — each caption identifies the A2 principle in that specific carrier.

| Deliverable | Format | Description |
|-------------|--------|-------------|
| `A3_C3_captions` | YAML array | Per artifact: 2–3 sentences identifying (1) what carrier type this is, (2) where the A2 principle is visible, (3) how the dimensional rendering (carrier) affects the perceptual affordance. |
| `A3_C3_pattern_statement` | Text | Synthesis: "Across [N] different carrier types spanning [date range], the same geometric principle — [A2 statement] — operates consistently. This is a visual language, not a coincidence." |

---

### Distillation Artifacts

| Deliverable | Content |
|-------------|---------|
| `A3_L5_etextbook` | All artifacts with full museum attribution, GEA/GEM annotations per carrier, historical context per artifact, comparison analysis, discussion prompts ("What stays the same? What changes?") |
| `A3_L4_teacher_script` | Images with guided comparison questions, timing (5–7 min), "what's the same across all of these?" prompt structure, circulation notes |
| `A3_L3_slideshow` | 3–5 images side-by-side + caption identifying A2 principle in each |
| `A3_L2_worksheet` | Images + "Circle the [element] in each image" + "What stays the same across all of them?" + carrier-type sorting activity |
| `A3_L1_teacher_summary` | A2 principle: [name]. Sacred carriers: [list of 3–5 with sources]. Pattern: [one sentence]. |

---

## QUALITY CHECKLIST

- [ ] ≥ 3 different carrier types represented (not 3 cylinder seals)
- [ ] Each artifact has full museum attribution (accession number)
- [ ] Each caption explicitly references A2's principle (not just "circle is here")
- [ ] Overlays use same color-coding as A2's decomposition
- [ ] Comparison composite exists showing all artifacts side-by-side
- [ ] Stays in SACRED domain (secular/social expansion is A4's job)
- [ ] Pattern statement synthesizes across all artifacts
- [ ] Does NOT re-analyze the mechanism (A2 already did that — A3 SURVEYS)
