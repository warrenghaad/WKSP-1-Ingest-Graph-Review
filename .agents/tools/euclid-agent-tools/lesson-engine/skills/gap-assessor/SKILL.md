---
name: gap-assessor
description: >
  EUCLID lesson gap assessment engine — analyzes existing draft content against the
  canonical 15-section architecture requirements and produces a structured gap report.
  Identifies missing content, missing images, structural violations, broken §2↔§5 matches,
  MAGIC weight drift, GEA/GEM notation gaps, and distillation incompleteness. Use this skill
  whenever someone asks to "assess this lesson", "find gaps in this content", "what's missing
  from this draft?", "audit this section", "check this lesson against the SSOT", "validate
  this content", "what needs fixing?", "run a gap analysis", "compare this draft to requirements",
  "is this section complete?", "what's broken in this lesson?", or any request to evaluate
  existing lesson content for completeness, correctness, or structural integrity. Also trigger
  when someone uploads lesson files and asks "what state is this in?" or "how far along is this?"
version: 0.1.0
---

# EUCLID Gap Assessor

## Purpose

You assess existing lesson content against the canonical 15-section architecture and produce a structured gap report. You do not fix gaps — you identify them precisely enough that the research-director, content-drafter, and image-designer skills know exactly what to do.

The assessment is civilization-agnostic. The requirements come from the section-interpreter. The content being assessed can be in any format — HTML lesson files, markdown drafts, YAML content blocks, or raw text.

## Assessment Dimensions

Every section is assessed across 7 dimensions:

### 1. Content Completeness

Does the section contain the required content at each distillation level?

```
COMPLETENESS_CHECK:
  level_5_etextbook:    present | partial | missing
  level_4_teacher_script: present | partial | missing
  level_3_slideshow:    present | partial | missing
  level_2_worksheet:    present | partial | missing
  level_1_summary:      present | partial | missing
```

"Partial" means content exists but is incomplete — missing vocabulary, missing discussion prompts, missing extension material, etc. Specify exactly what's missing.

### 2. Structural Integrity

Does the section satisfy the architectural constraints?

- **Cognitive operation:** Does the content actually perform the named operation (PRESENT, DEFINE, GENERALIZE, CRYSTALLIZE, TEACH, PRACTICE, REVEAL, SYNTHESIZE)?
- **§2↔§5 Match:** Does §2 define a concept that §5 crystallizes? Can you trace the thread?
- **THE PIVOT (A7→B1):** Does A7 reveal dual-register? Does B1 acknowledge Day A?
- **THE BRIDGE (A5↔B5):** Is the same spatial skill present in both?
- **THE CIRCUIT (B8→next A1):** Does B8 preview the next element?
- **A4 guardrails:** ≥2 sub-sections? Different categories? Named artifacts? Access/exclusion addressed?

### 3. MAGIC Weight Compliance

Does the content's emphasis match the section's canonical MAGIC weight vector?

For each section, the SSOT specifies which MAGIC lines should dominate. A2 should be A+G dominant, not I-heavy. B2 should be M-dominant, not A-heavy. Assess whether the content's actual emphasis matches.

```
MAGIC_ASSESSMENT:
  canonical_weight: [M, A, G, I, C]
  observed_weight:  [estimated M, A, G, I, C based on content analysis]
  drift: [which lines are over/under-represented]
  severity: none | minor | major | critical
```

### 4. GEA/GEM Notation

Does the section include required GEA/GEM decomposition?

- Sections where GEA/GEM is MANDATORY: A2, A5, B2, B5
- Sections where GEA/GEM should be identifiable: A3, A4 (per sub), A6, A7, B3, B4, B6, B7, B8
- Sections where GEA/GEM is named but not decomposed: A1, B1

Check: Is the notation present? Is it consistent with other sections in the same lesson? Does the molecular composition match across sections?

### 5. Image Coverage

Does the section have the required images?

Compare the section's image requirement (from section-interpreter) against what exists:
- How many images are required vs. present?
- Do images have museum attribution (accession numbers)?
- Are image paths valid or broken?
- Are geometric overlays present where required?
- What image types are missing (museum photo, diagram, overlay, scene, construction sequence)?

### 6. MAGIC Tag Coverage

Are the required MAGIC tags present?

Each section has primary tags (MUST appear) and secondary tags (MAY appear). Check:
- Are all primary tags represented in the content?
- Are secondary tags present where the content warrants them?
- Are there tags present that don't belong in this section (contamination)?

### 7. Cross-Section Consistency

Does this section's content align with other sections in the same lesson?

- Is the element name consistent across all sections?
- Is the GEA/GEM notation consistent?
- Does A2's visual rhetoric principle actually appear in A5's artifact?
- Does B2's mathematical property actually appear in B5's invention?
- Does A7 actually bridge between Day A and Day B content?
- Does B8 actually synthesize both registers?

## Assessment Workflow

### Phase 1: Ingest Content

Accept content in any format. Parse it to identify:
- Which sections are present
- What distillation levels exist per section
- What content exists at each level

### Phase 2: Load Requirements

For each section found, load the canonical requirements from section-interpreter. This gives you the rubric.

### Phase 3: Assess Each Dimension

Run all 7 assessment dimensions per section. Produce scores and specific gap descriptions.

### Phase 4: Produce Gap Report

## Output Format

```yaml
GAP_REPORT:
  lesson_id: "[civ]_[period]_[element]_[grade]"
  assessed_date: "YYYY-MM-DD"
  content_source: "path or description of what was assessed"

  summary:
    sections_present: [list of section codes found]
    sections_missing: [list of section codes not found]
    total_gaps: integer
    critical_gaps: integer  # structural violations, missing mandatory sections
    major_gaps: integer     # missing distillation levels, broken images
    minor_gaps: integer     # missing tags, incomplete extension material

  per_section:
    - section: "A1"
      overall_status: complete | needs_work | critical_gaps | missing

      completeness:
        level_5: present | partial | missing
        level_4: present | partial | missing
        level_3: present | partial | missing
        level_2: present | partial | missing
        level_1: present | partial | missing
        missing_components: [specific list]

      structural_integrity:
        cognitive_op_performed: true | false
        constraint_violations: [list or "none"]

      magic_compliance:
        canonical: [M, A, G, I, C]
        observed: [M, A, G, I, C]
        drift_severity: none | minor | major | critical
        drift_details: "description"

      gea_gem:
        required: mandatory | recommended | named_only
        present: true | false
        consistent_with_other_sections: true | false
        notation_issues: [list or "none"]

      images:
        required_count: integer
        present_count: integer
        broken_paths: [list]
        missing_attribution: [list]
        missing_overlays: [list]
        missing_types: [list of image types needed]

      magic_tags:
        primary_present: [list]
        primary_missing: [list]
        secondary_present: [list]
        contamination: [tags that don't belong]

      cross_section:
        element_consistent: true | false
        notation_consistent: true | false
        s2_s5_match_verified: true | false | n/a
        issues: [list or "none"]

  action_items:
    # Prioritized list of what needs to happen, suitable for
    # routing to research-director, content-drafter, or image-designer
    - priority: critical | high | medium | low
      section: "code"
      dimension: "which assessment dimension"
      gap: "specific description of what's missing or broken"
      action: "what needs to happen"
      target_skill: "research-director | content-drafter | image-designer | semantic-deduplicator"
```

## Severity Definitions

- **Critical:** Structural violation — missing section, broken §2↔§5 match, wrong cognitive operation, missing mandatory GEA/GEM decomposition. The lesson cannot function.
- **Major (high):** Missing distillation level, all images broken, MAGIC weight drift > 0.3 on dominant line. The section exists but is incomplete.
- **Medium:** Missing secondary MAGIC tags, incomplete extension material, missing museum attribution on some images. The section works but lacks polish.
- **Low (minor):** Missing optional content, minor notation inconsistencies, incomplete vocabulary lists. Nice to have.

## Integration Points

The gap report's `action_items` feed directly into:
- **research-director** — for gaps that require new research (missing artifacts, unsourced claims)
- **content-drafter** — for gaps that require new writing (missing distillation levels, incomplete sections)
- **image-designer** — for gaps that require new images (broken paths, missing overlays, missing types)
- **semantic-deduplicator** — if the assessment reveals suspected redundancy across sections

## References

For the canonical requirements that form the assessment rubric:
- `@lesson-engine/skills/section-interpreter/references/section-requirements.md`

For assessment patterns and scoring calibration:
- `references/assessment-rubric.md` — Scoring guidelines with examples of each severity level
