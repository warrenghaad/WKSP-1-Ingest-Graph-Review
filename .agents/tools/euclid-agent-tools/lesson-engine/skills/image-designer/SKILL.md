---
name: image-designer
description: >
  EUCLID image design and production routing engine — creates image design specifications
  for every section of the 15-section lesson architecture and routes them to the
  euclid-image-pipeline plugin for sourcing, overlay, and AI recreation. Knows which
  image types each section needs (MUS, SCN, DGM, CON, MOT, OVR), what overlays
  to apply, what the cell library provides, and how to write production-ready image briefs.
  Use this skill whenever someone asks to "design images for this section", "create image
  specs", "what images does B5 need?", "produce an image manifest", "write image briefs",
  "plan the visuals for this lesson", "route images to production", "create overlay specs",
  "design the diagrams for A2", "specify deity poses needed", or any request involving
  planning, specifying, or routing image production for lesson content. Also trigger
  when someone asks "what visuals are missing?" or "create the image brief for [section]".
version: 0.1.0
---

# EUCLID Image Designer

## Purpose

You design image specifications and route them to production. Given a section code, research findings, and existing content, you produce precise image briefs that tell the image-pipeline plugin exactly what to source, what overlays to create, what AI recreations to generate, and what diagrams to build.

This is a VISUAL-FIRST curriculum. Text exists to make visuals clear. Your image specifications are not decorative — they are the primary content that text annotates.

## Image Type Taxonomy

Every image belongs to one of six types. Each has a different source chain and reuse potential:

| Type | Abbrev | Source | Reuse |
|------|--------|--------|-------|
| Museum | MUS | Museum API chain (Met → Smithsonian → BM → Louvre → Wikimedia) | None (unique object) |
| Scene | SCN | AI generation (DALL-E/Gemini) — ultra-realistic reconstructions | HIGH — built from cells |
| Diagram | DGM | Vector generation (code/SVG) — technical decomposition | MEDIUM — GEA/GEM overlays reuse |
| Construction | CON | Step-by-step making sequence | LOW — section-specific but step cells reuse |
| Motion | MOT | Video/animation | HIGH — deity + setting cells reuse extensively |
| Overlay | OVR | Transparent-background GEA/GEM forms, annotations | HIGHEST — the element itself |

## The Cell Principle

Design reusable visual components once, composite them into section-specific scenes. A "cell" is any visual component reused across sections or weeks:

**Cell Categories:**
- `DEI.[civ].[deity].[pose]` — Deity character (standing_front, standing_profile, seated_throne, gesture_blessing, with_element, face_closeup)
- `SET.[civ].[location].[variant]` — Setting background (temple_interior, marketplace, workshop, palace, canal, field)
- `OBJ.[civ].[object_type].[variant]` — Object close-ups (seal, pottery, relief_panel, tablet, tool)
- `GEO.[element].[variant]` — Geometric overlays (isolated, decomposed, annotated, construction_step)
- `ANN.[type]` — Annotation elements (arrows, highlight_rings, comparison_frames, labels)

Cells are produced BEFORE section-specific images. They are the foundation layer.

## Section-by-Section Image Requirements

### Day A Images

**A1 — Myth Hook:**
- 1× MUS: Striking artifact showing deity + geometric element
- 1× SCN: Reconstructive scene of deity in context (uses DEI + SET cells)
- Optional MOT: 30–45 second myth video from cells

**A2 — Visual Rhetoric:**
- 2–3× MUS: Element in different symbolic contexts
- 3× DGM: (1) GEA/GEM decomposition/property isolation, (2) Perceptual affordance map (property → cognitive effect), (3) Cultural application (property alongside artifact)
- 1× OVR: Isolated element on white background with labels

**A3 — Iconographic Chain:**
- 3–5× MUS: Same element across different carrier types (seal, relief, vessel, architecture, votive)
- 3–5× OVR: Element highlighted in each artifact image

**A4 — Material Culture:**
- 1–2× MUS per sub-section (varies by how many subs: min 2, max 6)
- 1× SCN per sub if museum image unavailable
- OVR: Element highlighted in each

**A5 — Single Artifact:**
- 1× MUS: HIGH-RESOLUTION primary artifact (this is THE image)
- 1× DGM: Construction sequence diagram (GEA → GEM steps)
- 1× OVR: Full GEA/GEM decomposition overlay on artifact

**A6 — Art Activity:**
- 1× CON: Step-by-step construction sequence (4–8 steps)
- 1× MUS or SCN: Exemplar for comparison
- 1× DGM: Materials layout diagram

**A7 — Dual-Register Reveal:**
- 1× MUS or SCN: Architectural example showing dual-register
- 1× DGM: Split annotation — left: meaning labels, right: function labels
- 1× OVR: Dual overlay (rhetoric markers + force/function markers)

### Day B Images

**B1 — Bridge:**
- A7 image recalled (no new sourcing)
- Optional: 1× new functional image of element

**B2 — Math Properties:**
- 2–3× DGM: Mathematical diagrams with measurements, angles, symmetry lines
- 1× OVR: Element with mathematical notation overlay

**B3 — Transformations:**
- 2–4× DGM: Before/after transformation diagrams (rotation, reflection, scaling, projection)
- 1× DGM: "What doesn't work and why" impossibility demonstration

**B4 — Shape Lineage:**
- 1× DGM: Timeline visualization showing functional deployment across time
- 2–3× MUS or SCN: Historical examples at different points on timeline

**B5 — STEM Notch:**
- 1× MUS or SCN: The invention
- 1× DGM: Mechanical decomposition diagram (GEA/GEM → mechanical function)
- 1× DGM: A5↔B5 bridge diagram (same spatial skill, two registers)

**B6 — Engineering Decomposition:**
- 1× CON: Build steps diagram
- 1× DGM: Force/stress diagram
- 1× DGM: Materials and measurements specification

**B7 — Engineering Activity:**
- 1× CON: Step-by-step build instructions (4–8 steps)
- 1× DGM: Test protocol visual
- 1× DGM: Data collection template visual

**B8 — Synthesis:**
- 1× DGM: Split-screen synthesis (A2 principle | B2 principle | "SAME GEOMETRY")
- 1× MUS or SCN: Next week preview image (next element's most striking artifact)

## Image Brief Format

For each image needed, produce:

```yaml
IMAGE_BRIEF:
  id: "IB_[section]_[type]_[sequence]"
  section: "[section code]"
  image_type: MUS | SCN | DGM | CON | MOT | OVR
  priority: critical | high | medium | low

  description:
    what: "Precise description of what this image shows"
    why: "What pedagogical function it serves in this section"
    cognitive_operation: "How it supports the section's cognitive operation"

  # For MUS (museum sourcing):
  museum_search:
    keywords: [list of search terms]
    api_priority: [Met, BM, Wikimedia, Smithsonian, Louvre]
    known_artifacts: [specific named artifacts to search for, if any]
    public_domain_required: true
    minimum_resolution: "2000px longest edge"

  # For SCN (AI scene generation):
  scene_spec:
    cells_needed: [list of cell IDs to composite]
    new_cells_required: [cells not yet in library]
    prompt_template: "Ultra-realistic [description]. [Material]. [Period]. [Style notes]."
    style: "Archaeological catalog | Reconstructive illustration | Technical diagram"
    character_consistency: "Reference to deity-visual-canon"

  # For DGM (diagram):
  diagram_spec:
    diagram_type: "decomposition | affordance_map | construction_sequence | measurement | transformation | timeline | force | comparison | synthesis"
    elements_to_show: [list of GEA/GEM elements with positions]
    labels: [list of text labels with positions]
    annotations: [arrows, highlight rings, symmetry axes, etc.]
    format: "SVG preferred | PNG acceptable"

  # For CON (construction):
  construction_spec:
    total_steps: integer
    per_step:
      - step: 1
        description: "What to do"
        tools: [list]
        geometric_principle: "What GEA/GEM logic this step embodies"

  # For OVR (overlay):
  overlay_spec:
    base_image: "Reference to the image this overlays"
    gea_elements: [list with positions, colors, line widths]
    gem_elements: [list with positions, colors]
    symmetry_axes: [list with positions]
    labels: [list with positions]
    overlay_type: "highlight | decomposition | measurement | functional | construction_sequence"
    opacity: 0.40

  # Routing
  production_route:
    pipeline_stage: "search | download | assess | overlay | recreate | manifest"
    image_pipeline_command: "/image-search | /image-overlay | /image-recreate | /image-pipeline"
    cell_library_check: "Which cells to verify exist before compositing"
```

## Workflow

### Step 1: Determine Scope
- Single section? Full day? Full week?
- Are research findings available? (Artifacts to source will be more precise)
- What already exists? (Don't re-specify what's already sourced)

### Step 2: Load Section Requirements
Reference the section-interpreter's image requirements for each section in scope.

### Step 3: Check Cell Library
Before specifying section-specific images, check what reusable cells already exist:
- Deity characters for this civilization/deity?
- Setting backgrounds for relevant locations?
- Geometric overlays for this element?
If cells are missing, add cell production briefs before section-specific briefs.

### Step 4: Produce Image Briefs
Generate IMAGE_BRIEF blocks for every image needed, organized by section.

### Step 5: Route to Production
Map each brief to the appropriate image-pipeline command:
- MUS → `/image-search` → `/image-assess` → `/image-overlay`
- SCN → `/image-recreate` (with cell compositing)
- DGM → Code/SVG generation (can be done inline or routed)
- CON → `/image-recreate` (step-by-step)
- OVR → `/image-overlay` (applied to base images)

## Integration Points

**Upstream:** Receives requirements from `section-interpreter`, gap reports from `gap-assessor`, research findings from `research-director`
**Executes via:** `euclid-image-pipeline` plugin commands
**Downstream:** Completed images feed into `content-drafter` (for embedding) and `reconciliation-dashboard` (for approval)

## References

For image sourcing methodology and APIs:
- `@image-pipeline/skills/image-pipeline/SKILL.md`

For deity visual canon and character consistency:
- `@image-pipeline/skills/image-pipeline/references/deity-visual-canon.md`

For overlay specifications and Python templates:
- `@image-pipeline/skills/image-pipeline/references/overlay-specifications.md`

For museum API patterns:
- `@image-pipeline/skills/image-pipeline/references/museum-api-patterns.md`

For visual production spec and cell library:
- Project knowledge: `EUCLID_VISUAL_PRODUCTION_SPEC.md`
