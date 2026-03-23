# Gap Assessment Rubric

## Severity Scoring

### Critical (must fix before approval)

The lesson CANNOT FUNCTION with this gap:

- **Missing section**: A section code (A1–A7, B1–B8) has no content at any level
- **Broken §2↔§5 match**: A2 defines principle X, but A5 crystallizes principle Y
- **Wrong cognitive operation**: Section labeled GENERALIZE but actually performs DEFINE
- **Missing mandatory GEA/GEM**: A2, A5, B2, or B5 lacks geometric decomposition
- **14-section drift**: B8 is missing (the 14-section variant is a known drift problem)
- **Register collapse**: Day B reads like Day A with no functional framing

### High (should fix)

The section exists but is substantially incomplete:

- **Missing distillation level**: 0 of 5 levels present, or key level (Level 5) missing
- **All images broken**: Image paths return 404 or reference non-existent files
- **MAGIC weight drift > 0.3**: Dominant line shifted (A2 should be A+G but reads as I-dominant)
- **A4 guardrail violation**: < 2 sub-sections, or sub-sections cite same artifact category
- **PIVOT broken**: A7 doesn't reveal dual-register, or B1 doesn't acknowledge Day A

### Medium (polish)

The section works but lacks completeness:

- **Missing secondary MAGIC tags**: Primary tags present, secondary absent
- **Incomplete museum attribution**: Artifact named but missing accession number
- **Partial distillation**: 3 of 5 levels present
- **Missing discussion prompts or vocabulary at Level 5**
- **Extension material absent from Level 5**

### Low (nice to have)

Minor refinement:

- **Minor notation inconsistency**: GEA/GEM notation varies between sections
- **Vocabulary list incomplete**: Most terms defined, some missing
- **Timeline diagram not yet created for B4** (text description exists)
- **Overlay not yet applied to A3 images** (images exist, overlays don't)

## Dimension-Specific Scoring

### Content Completeness

| Score | Description |
|-------|-------------|
| 5/5 | All 5 distillation levels present, all components included |
| 4/5 | 4 levels present, or 5 levels but one is partial |
| 3/5 | 3 levels present |
| 2/5 | Only 1-2 levels present |
| 1/5 | Content exists but not structured into levels |
| 0/5 | No content |

### MAGIC Weight Compliance

Compare section's content emphasis to canonical weight vector:

| Drift | Severity |
|-------|----------|
| All lines within ±0.1 | None |
| One line off by 0.2 | Minor |
| Dominant line off by 0.3+ | Major |
| Wrong dominant line entirely | Critical |

Method: Read the content and estimate which MAGIC lines are emphasized. Compare to canonical. This is qualitative, not computational — you're reading for emphasis, not counting keywords.

### Cross-Section Consistency

Check these pairs:
- A2 ↔ A5: Same visual rhetoric principle?
- A5 ↔ A6: Activity replicates A5's technique?
- A2 ↔ B2: Same property, two registers?
- B2 ↔ B5: Property deployed in invention?
- A7 ↔ B1: Pivot acknowledged?
- A5 ↔ B5: Same spatial skill, two registers?
- B8 → next A1: Circuit preview present?
