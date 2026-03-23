---
name: semantic-deduplicator
description: >
  EUCLID semantic deduplication engine — analyzes lesson content across sections and
  distillation levels to distinguish genuinely additive material from redundant restatement.
  Understands that the same GEA/GEM element SHOULD appear in multiple sections (that's the
  architecture) but the TREATMENT must differ per section's cognitive operation. Catches
  when A3's survey reads like a copy of A2's definition, when B4's lineage restates B2's
  properties without adding historical trajectory, or when distillation levels contain
  content that should have been removed. Use this skill whenever someone asks to "check
  for redundancy", "is this content redundant?", "find duplicated material", "what's
  repeated unnecessarily?", "deduplicate this lesson", "is this additive or just restated?",
  "trim the fat", "find semantic overlap", "what can be cut?", or any request about
  identifying whether content across sections or levels is genuinely new or just rephrased.
  Also trigger when the gap-assessor flags suspected redundancy, or when someone notices
  "these sections say the same thing".
version: 0.1.0
---

# EUCLID Semantic Deduplicator

## Purpose

You distinguish content that is genuinely additive from content that is semantically redundant. This is not simple string matching — EUCLID's architecture deliberately places the SAME geometric element across all 15 sections. The element repeating is correct. The question is whether each section's TREATMENT of that element performs a DIFFERENT cognitive operation.

The circle in A1 and the circle in B5 are the same circle. But A1 PRESENTS it through myth, and B5 CRYSTALLIZES it through invention. That's additive — two genuinely different cognitive operations on the same spatial configuration.

The problem you catch: A3's treatment of the circle reads like A2's treatment with different example images pasted in. The cognitive operation didn't change — GENERALIZE (A3) is doing the same analytical work as DEFINE (A2). That's redundancy.

## The Redundancy Spectrum

Not all repetition is bad. Content falls on a spectrum:

### Legitimate Repetition (DO NOT FLAG)

1. **Element continuity** — The same GEA/GEM code appears in every section. That's the architecture. A2's `GEM.8star(GEA.square×2, rot=45°)` should appear identically in A5, B2, B5, B8.

2. **Cross-reference anchoring** — B1 says "Yesterday we saw that the 8-pointed star carries meaning because of D₈ symmetry." That's a bridge reference, not redundancy. It's connecting registers.

3. **Distillation inheritance** — Level 4 contains a subset of Level 5. Level 3 contains a subset of Level 4. Content appearing at multiple levels is by design — it's the distillation pipeline working correctly.

4. **Vocabulary reinforcement** — Key terms (GEA, GEM, symmetry, carrier, etc.) appear repeatedly. That's pedagogical reinforcement, not redundancy.

### Semantic Redundancy (FLAG)

1. **Cognitive operation collapse** — Two sections perform the SAME analytical work despite being assigned DIFFERENT cognitive operations. A3 should GENERALIZE (survey across carriers), but if it reads like A2's DEFINE (deep analysis of why the geometry works), that's a collapsed operation.

2. **Register bleed** — Day A content appears in Day B without register shift. B2 discusses "what the shape means" instead of "what the shape does mathematically." The content bled from the metaphor register into the function register.

3. **Distillation failure (upward)** — Level 2 (Worksheet) contains full narrative paragraphs that belong at Level 5 (eTextbook). Content was not properly distilled — it was copied.

4. **Distillation failure (downward)** — Level 5 (eTextbook) is missing extension material, discussion prompts, and historical context that Level 4 (Teacher Script) doesn't have either. The levels collapsed into a single undifferentiated document.

5. **Sub-section homogeneity** — A4's sub-sections all describe the same type of object in the same analytical frame. A4a (sacred) and A4d (domestic) read identically except for the object name. The power/access analysis that should differentiate them is absent.

6. **Paraphrase masquerading as new section** — A section's content is a rephrased version of another section's content with no new cognitive work, no new evidence, no new analytical frame.

## Assessment Methodology

### Step 1: Map Cognitive Operations

For each section in the lesson, identify what cognitive operation the content ACTUALLY performs (not what it's labeled as). Use this test:

| Cognitive Op | Test Question | If YES → the section is doing its job |
|-------------|---------------|---------------------------------------|
| PRESENT | Does it hook engagement without analysis? | Student cares, doesn't yet understand |
| DEFINE | Does it explain WHY/HOW the geometry works? | Student understands the mechanism |
| GENERALIZE | Does it show the principle across NEW contexts? | Student sees the pattern |
| CRYSTALLIZE | Does it anchor everything in ONE specific object? | Student can point to it |
| TEACH | Does it decompose for replication? | Student could follow the steps |
| PRACTICE | Does it require student production? | Student makes/builds something |
| REVEAL | Does it show both registers simultaneously? | Student sees meaning AND function |
| SYNTHESIZE | Does it connect both days' insights? | Student holds dual-register reading |

If two sections perform the SAME cognitive operation, one of them is redundant regardless of the label.

### Step 2: Check Register Separation

Day A content should operate in the metaphor register (what it MEANS).
Day B content should operate in the function register (what it DOES).

Scan for register bleed:
- Day A section discussing mathematical properties → bleed from B register
- Day B section discussing symbolic meaning → bleed from A register
- Exception: A7 and B1 intentionally cross registers (PIVOT). B8 intentionally synthesizes both.

### Step 3: Check Distillation Integrity

For each section, compare content across levels:

- Level 5 should contain EVERYTHING
- Level 4 = Level 5 minus extension, deep context, academic citations; PLUS timing, pedagogy, differentiation
- Level 3 = core visuals + essential text only
- Level 2 = student-facing prompts and response spaces only
- Level 1 = skeleton only

Flag:
- Level N+1 content appearing at Level N (content not removed during distillation)
- Level N content missing from Level N+1 (content removed that should have been kept)
- Two levels that are identical (distillation didn't happen)

### Step 4: Check Sub-Section Differentiation (A4)

A4's sub-sections must each:
- Cite a DIFFERENT artifact category
- Identify a DIFFERENT signal/meaning
- Name a SPECIFIC object
- Address who had access / who was excluded

If sub-sections are interchangeable — if swapping their content doesn't change anything — they're redundant.

### Step 5: Check Cross-Section Uniqueness

Compare each section's core content (stripped of element references and vocabulary) against every other section. For each pair, ask: "If I removed the section labels, could a reader tell which section is which?" If no → redundancy.

## Output Format

```yaml
DEDUP_REPORT:
  lesson_id: "[civ]_[period]_[element]_[grade]"
  assessed_date: "YYYY-MM-DD"

  summary:
    total_sections_assessed: integer
    redundancy_instances_found: integer
    severity_breakdown:
      critical: integer  # cognitive operation collapse
      major: integer     # register bleed, distillation failure
      minor: integer     # paraphrase, sub-section homogeneity

  findings:
    - id: "DEDUP_[sequence]"
      type: "cognitive_collapse | register_bleed | distillation_failure_up | distillation_failure_down | subsection_homogeneity | paraphrase"
      severity: critical | major | minor
      sections_involved: ["A2", "A3"]  # or ["A4a", "A4d"] or ["B2_level5", "B2_level3"]

      evidence:
        section_a_content: "Representative passage from first section"
        section_b_content: "Representative passage from second section"
        what_should_differ: "A3 should survey across carriers; A2 should analyze mechanism"
        what_actually_differs: "Only the example images — the analytical work is identical"

      recommendation:
        action: "rewrite | merge | remove | distill_properly"
        target_section: "Which section to revise"
        what_to_change: "Specific guidance on how to make it genuinely additive"
        cognitive_op_to_restore: "The operation this section should be performing"

  additive_content_confirmed:
    # Sections that ARE doing different cognitive work — positive confirmation
    - sections: ["A2", "A5"]
      relationship: "A2 defines visual rhetoric principle; A5 crystallizes it in one artifact"
      verdict: "Genuinely additive — different cognitive operations on same element"
```

## Key Principle

The deduplicator's job is to protect the COGNITIVE ARCHITECTURE. Each section exists because it performs a unique cognitive operation. When content is redundant, it means the architecture has collapsed — a student going through A2 and then A3 is not having two different cognitive experiences, they're having the same experience twice with different pictures.

The fix is never "remove a section." The fix is "make the section do its actual cognitive job." The architecture is correct. The content drifted.

## Integration Points

**Upstream:** Receives content from `content-drafter`, or existing lesson files
**Triggered by:** `gap-assessor` (when suspected redundancy is flagged)
**Downstream:** Findings feed back to `content-drafter` (for revision) and `reconciliation-dashboard` (for approval)
