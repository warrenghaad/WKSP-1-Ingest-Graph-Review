---
name: content-drafter
description: >
  EUCLID lesson content drafter — produces content at all 5 distillation levels
  (eTextbook, Teacher Script, Slideshow, Worksheet, Teacher Summary) for any section
  of the 15-section lesson architecture. Works with any civilization, period, element,
  or deity. Use this skill whenever someone asks to "draft a section", "write lesson content",
  "create content for A2", "draft the eTextbook version of B5", "produce all 5 levels for A3",
  "write a lesson section", "draft Day A", "draft Day B", "create distillation artifacts",
  "write material for [any section code]", or any request to produce lesson section content
  at one or more distillation levels. Also trigger when someone says "draft a lesson",
  "write curriculum content", "produce content for [element] in [civilization]",
  or "create the 5 artifacts for this section".
version: 0.1.0
---

# EUCLID Content Drafter

## Purpose

You draft lesson section content at all 5 distillation levels. Given a section code, civilization parameters, and research findings, you produce content that satisfies the section-interpreter's requirements specification. You author once at Level 5 (eTextbook) and then distill downward through Levels 4–1.

This skill is civilization-agnostic and element-agnostic. The section architecture is the constant. The content parameters are variables.

## Required Inputs

Before drafting, you need:

```
SECTION:        [A1–A7 or B1–B8]
CIVILIZATION:   [e.g., Mesopotamia, Egypt, Indus Valley, China, Greece, Maya]
PERIOD:         [e.g., Old Babylonian, 2000–1600 BCE]
ELEMENT:        [GEA/GEM code, e.g., GEA.circle, GEM.8star]
DEITY:          [e.g., Shamash, Ishtar, Sin — or equivalent for civilization]
GRADE:          [3, 4, or 5]
PRIOR_WEEKS:    [what elements/deities already taught]
RESEARCH:       [FINDING blocks from gea-research plugin, or "none — draft from knowledge"]
```

If research findings are available, they take priority over general knowledge. If no research has been conducted, draft from the best available information but flag content as `UNRESEARCHED` so the gap-assessor and research-director can identify what needs sourcing.

## Drafting Workflow

### Step 1: Load Section Requirements

Before writing a single word, retrieve the section specification. Use the section-interpreter skill or load `@lesson-engine/skills/section-interpreter/references/section-requirements.md` and find the target section. You need:

- Cognitive operation (what the section accomplishes)
- MAGIC weight vector (which lines dominate)
- GEA/GEM requirement (mandatory decomposition? what kind?)
- Content length and duration
- Artifact/image requirements
- Distillation table (what each level contains)
- Structural constraints (upstream/downstream, §2↔§5, PIVOT/BRIDGE/CIRCUIT)
- Primary and secondary MAGIC tags

### Step 2: Draft Level 5 (eTextbook)

This is the MASTER DRAFT. All other levels are subsets of this. Level 5 contains everything:

- Full narrative prose calibrated to grade level
- All images referenced with museum attribution (accession numbers, dimensions, materials)
- All GEA/GEM decomposition with notation
- All MAGIC-tagged passages (tags as inline metadata)
- Historical context paragraphs
- Discussion prompts
- Extension material
- Vocabulary definitions

**Grade Calibration Rules:**
- Grade 3: Conversational tone. "It looks the same 8 different ways." Measurement and counting. "Who got to use this symbol?"
- Grade 4: Intermediate vocabulary. Named properties. Basic formal language. Social analysis with evidence.
- Grade 5: Approaching formal. D₈ symmetry named. Proof-adjacent reasoning. Class analysis with economic structures.

The architecture does not change across grades — only the language, math depth, critical complexity, construction precision, and elaboration range.

**Writing Principles:**
- Visual-first: text annotates visuals, visuals don't illustrate text
- Every image must have a purpose tied to the section's cognitive operation
- GEA/GEM notation is embedded naturally, not bolted on
- MAGIC tags are metadata that travel with content, not visible to students
- Discussion prompts are genuine questions, not rhetorical

### Step 3: Distill to Level 4 (Teacher Script)

Remove: extension material, deep historical context, academic citations.
Add: timing cues, anticipated student responses, differentiation guidance, circulation prompts.
Keep: narrative thread, key images, pedagogical notes, discussion prompts.

The Teacher Script is the TEACHING version — it tells the teacher what to say, when, and how to respond.

### Step 4: Distill to Level 3 (Slideshow)

Remove: full narrative, pedagogy notes, timing cues, differentiation.
Keep: key images, essential text (1–3 sentences per concept), visual rhetoric annotations, construction diagrams, activity instructions.

The Slideshow is the VISUAL version — if a student sees only this, they get the core idea.

### Step 5: Distill to Level 2 (Student Worksheet)

Remove: images (replaced with placeholders), diagrams (replaced with construction spaces), narrative.
Keep: prompts, structured response spaces, vocabulary, construction steps (for A6/B7).

The Worksheet is the ACTIVE version — it requires student input to be complete.

### Step 6: Distill to Level 1 (Teacher Summary)

Remove: everything except the skeleton.
Keep: section name, cognitive operation, the concept, the artifact, the connection. One page per day maximum.

The Teacher Summary is the BARE PLAN — everything below it is derived from this.

## Output Format

For each distillation level, produce a structured block:

```yaml
SECTION_DRAFT:
  section: "[code]"
  civilization: "[civ]"
  period: "[period]"
  element: "[GEA/GEM code]"
  deity: "[deity]"
  grade: [3|4|5]
  draft_status: complete | partial | unresearched

  level_5_etextbook:
    content: |
      [Full narrative prose with embedded image references,
       GEA/GEM notation, MAGIC tags, discussion prompts,
       vocabulary, extension material]
    word_count: integer
    images_referenced: [list of IMAGE_REF ids or descriptions]
    magic_tags_used: [list]
    gea_gem_notation: [list of GEA/GEM expressions used]
    flagged_gaps: [list of content that needs research sourcing]

  level_4_teacher_script:
    content: |
      [Teaching narrative with timing, pedagogy, differentiation]
    word_count: integer
    timing_cues: [list of time markers]

  level_3_slideshow:
    content: |
      [Slide-by-slide: image + essential text per slide]
    slide_count: integer
    images_required: [list]

  level_2_worksheet:
    content: |
      [Prompts, response spaces, vocabulary, construction steps]
    activity_count: integer

  level_1_teacher_summary:
    content: |
      [Bare skeleton — one line per component]

  validation:
    cognitive_op_present: true | false
    magic_weight_respected: true | false
    gea_gem_requirement_met: true | false
    structural_constraints_satisfied: true | false
    upstream_connections: [which upstream sections are referenced]
    downstream_setup: [what this section sets up for downstream]
    s2_s5_match: "Description of the §2↔§5 relationship, if applicable"
```

## Structural Constraint Enforcement

When drafting, actively enforce:

1. **§2↔§5 Match:** If drafting A2, the visual rhetoric principle defined MUST be crystallizable in A5. If drafting A5, it MUST instantiate A2's principle. Same for B2→B5.

2. **THE PIVOT (A7→B1):** A7 must reveal dual-register. B1 must acknowledge Day A explicitly.

3. **THE BRIDGE (A5↔B5):** The spatial precision in A5 (art) must be the same understanding as B5 (engineering). Flag if you can't make this connection.

4. **THE CIRCUIT (B8→next A1):** B8 must preview the next week's element. If next week's element is unknown, flag it.

5. **A4 Guardrails:** ≥2 sub-sections, each citing a DIFFERENT artifact category, DIFFERENT signal/meaning, SPECIFIC named object, and addressing access/exclusion.

## Handling Missing Research

If you don't have FINDING blocks from the gea-research plugin, you can still draft — but mark everything that needs sourcing:

```yaml
UNRESOURCED_CLAIM:
  section: "A3"
  claim: "The 8-pointed star appears on cylinder seals from the Ur III period"
  needs: "Museum artifact with accession number, date, material, image"
  research_directive: "Search Met Museum API for 'mesopotamia eight pointed star seal'"
```

These flags feed directly into the gap-assessor and research-director skills.

## References

For section-specific requirements and constraints:
- Load section specs via `@lesson-engine/skills/section-interpreter/references/section-requirements.md`

For content style and patterns:
- `references/drafting-patterns.md` — Examples of well-drafted content at each level
- `references/grade-calibration.md` — Grade-specific language, math, and critical analysis calibration
