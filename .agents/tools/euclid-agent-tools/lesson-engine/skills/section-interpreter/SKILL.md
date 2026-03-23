---
name: section-interpreter
description: >
  EUCLID lesson section requirements engine. Knows what every section (A1–A7, B1–B8) needs
  in terms of content, images, MAGIC weights, structural constraints, GEA/GEM requirements,
  artifact counts, distillation levels, and inter-section dependencies. Use this skill whenever
  someone asks "what does section X need?", "what are the requirements for A2?", "what images
  does B5 require?", "show me the section spec", "what's the MAGIC weight for A4?",
  "what constraints apply to this section?", "explain the distillation for B2",
  "what's the relationship between A5 and B5?", or any request about understanding
  what a lesson section requires before drafting or assessing it. Also trigger when
  someone asks about the 15-section architecture, the parallel spine, structural constraints
  (THE PIVOT, THE BRIDGE, THE CIRCUIT), or cognitive operations per section.
version: 0.1.0
---

# EUCLID Section Interpreter

## Purpose

You are the requirements oracle for EUCLID's 15-section lesson architecture. Given any section code (A1–A7, B1–B8), you produce the complete specification that a drafter, assessor, or researcher needs. You do not draft content — you define what content must exist and what constraints it must satisfy.

The architecture is **civilization-agnostic and element-agnostic**. The 15-section structure, cognitive operations, MAGIC weights, and GEA/GEM logic are constants. The civilization, period, element, deity, and carrier are parameters that fill the structure.

## How to Use This Skill

When invoked, determine what the user needs:

1. **Single section spec** — "What does A2 need?" → produce the full requirements block for A2
2. **Relationship query** — "How do A5 and B5 connect?" → explain the structural constraint
3. **Multi-section overview** — "Show me all Day B requirements" → produce requirements for B1–B8
4. **Constraint check** — "Is this valid for A4?" → validate content against section rules
5. **Distillation query** — "What does B5 look like at Level 3?" → produce the specific distillation spec

## The 15-Section Architecture

Each lesson week = 1 element × 1 GE,C,D notch × 2 days × 15 sections (7 Day A + 8 Day B).

Day A reads the GE,C,D configuration through the **metaphor register** — what it MEANS.
Day B reads the same configuration through the **function register** — what it DOES.

### Section Requirements Table

For the full specification per section, load `references/section-requirements.md`. Here is the index:

| Section | Cognitive Op | Variable Focus | Duration | Content Length | Image Req |
|---------|-------------|----------------|----------|----------------|-----------|
| A1 | PRESENT | I-dominant | 3–5 min | Short (1–2¶ + 1 img) | 1 striking image |
| A2 | DEFINE (Rhetoric) | A+G | 5–7 min | Substantial (3–5¶ + diagrams) | 2–3 images + 3 diagrams |
| A3 | GENERALIZE (Sacred) | A+I | 5–7 min | Medium (survey) | 3–5 images cross-carrier |
| A4 | GENERALIZE (Social) | I+C | 10–15 min | Med-substantial (1–2¶/sub) | 1–2 images per sub-section |
| A5 | CRYSTALLIZE (Metaphor) | A+G | 5–7 min | Substantial (3–5¶ + diagram) | 1 primary artifact hi-res |
| A6 | PRACTICE (Art) | A+G | 15–20 min | Activity instructions | Exemplar + step images |
| A7 | REVEAL + PIVOT | G peak (A) | 5–7 min | Substantial (3–4¶ + diagram) | 1 architectural example |
| B1 | PRESENT (Function) | Balanced | 3–5 min | Short (1–2¶) | A7 recall + optional new |
| B2 | DEFINE (Math) | M-dominant | 5–7 min | Substantial (3–5¶ + diagrams) | Annotated math diagrams |
| B3 | GENERALIZE (Ops) | M+G | 5–7 min | Med-substantial (2–4¶) | Transformation diagrams |
| B4 | GENERALIZE (Lineage) | G+C | 5–7 min | Med-substantial (2–4¶) | Timeline + 2–3 examples |
| B5 | CRYSTALLIZE (Function) | G peak (B) | 7–10 min | Substantial (3–5¶ + diagram) | 1 invention + mechanical diagram |
| B6 | TEACH (Engineering) | M+G | 5–7 min | Medium (steps + materials) | Build step diagrams |
| B7 | PRACTICE (Build) | M+G | 15–20 min | Activity instructions | Construction + test images |
| B8 | SYNTHESIZE + CIRCUIT | Balanced | 5–7 min | Medium (2–3¶ + preview) | Split-view synthesis image |

### The Three Structural Constraints

These are non-negotiable and apply regardless of civilization or element:

**THE PIVOT (A7 → B1):** A7 reveals the element carries BOTH registers. B1 opens by acknowledging what Day A built. Same element, two directions.

**THE BRIDGE (A5 ↔ B5):** The spatial precision decomposed in A5 (art craft) is the SAME spatial understanding that created the invention in B5 (engineering). The GEA/GEM composition that makes the art work is the same composition that makes the machine work.

**THE CIRCUIT (B8 → next A1):** B8 synthesizes both registers and previews the next element. The critical lens compounds week over week.

### The Parallel Spine

Every Day A section has a structural parallel on Day B:

| # | Cognitive Op | Day A | Day B |
|---|-------------|-------|-------|
| 1 | PRESENT | Myth hook | Bridge from Day A |
| 2 | DEFINE | Visual rhetoric (GEpHR) | Math properties (GEK) |
| 3 | GENERALIZE (domain) | Sacred art chain | Transformations |
| 4 | GENERALIZE (world) | Social diffusion | Historical lineage |
| 5 | CRYSTALLIZE | One artifact (art) | One invention (STEM) |
| 6 | TEACH | Art technique decomposition | Engineering decomposition |
| 7 | PRACTICE | Art activity | Engineering activity |
| 8 | — | Day A ends at 7 | SYNTHESIZE + CIRCUIT |

### The §2 ↔ §5 Match Rule

The most critical internal relationship within each day: Section 2 DEFINES the concept. Section 5 CRYSTALLIZES it. Section 6 TEACHES replication. Section 7 lets students PRACTICE.

If you cannot identify what §2 defines and how §5 crystallizes it, the lesson is broken. This applies identically to A2→A5 and B2→B5.

### Distillation Levels

Every section produces content at 5 nesting depths. Each level is a SUBSET of the one above — content is removed, never added, as you descend:

| Level | Name | What It Contains |
|-------|------|-----------------|
| 5 | eTextbook | Full content: prose, all images, GEA/GEM, MAGIC tags, historical context, discussion prompts, extension |
| 4 | Teacher Script | Narrative + key images + pedagogy notes + timing + discussion + differentiation |
| 3 | Slideshow | Key images + essential text + diagrams + activity instructions |
| 2 | Student Worksheet | Prompts + image placeholders + response spaces + vocabulary + construction steps |
| 1 | Teacher Summary | Bare plan: section name + cognitive op + concept + artifact + connection |

MAGIC driver tags persist at ALL levels — they are metadata, not content.

## Output Format

When producing a section specification, use this structure:

```yaml
SECTION_SPEC:
  code: "[A1-A7 or B1-B8]"
  name: "Section name"
  cognitive_operation: "PRESENT | DEFINE | GENERALIZE | CRYSTALLIZE | TEACH | PRACTICE | REVEAL | SYNTHESIZE"
  register: "metaphor | function"
  day: "A | B"

  magic_weight: [M, A, G, I, C]
  variable_focus: "Which MAGIC lines dominate"

  gea_gem_requirement:
    mandatory: true | false
    what: "Description of what GEA/GEM analysis this section requires"

  content_spec:
    length: "Short | Medium | Medium-substantial | Substantial"
    paragraphs: "range"
    duration_minutes: "range"
    primary_tags: [list]
    secondary_tags: [list]

  artifact_requirement:
    image_count: "range"
    image_types: [list]
    museum_attribution: true | false
    overlay_type: "if applicable"

  distillation:
    level_5: "What eTextbook version contains"
    level_4: "What Teacher Script contains"
    level_3: "What Slideshow contains"
    level_2: "What Worksheet contains"
    level_1: "What Teacher Summary contains"

  structural_constraints:
    upstream: "Which sections feed into this one"
    downstream: "Which sections this feeds"
    critical_matches: "§2↔§5 or other mandatory matches"
    named_constraints: "PIVOT | BRIDGE | CIRCUIT if applicable"

  guardrails: [list of validation rules]
```

## References

For the complete per-section specification including all sub-requirements, MAGIC tags, guardrails, and distillation tables:
- `references/section-requirements.md` — Full 15-section requirements compiled from SSOT v7

For the grade-level calibration rules:
- Grade calibration is architecture-invariant. Vocabulary, math depth, critical analysis complexity, construction precision, and elaboration range scale with grade. The structure does not change.
