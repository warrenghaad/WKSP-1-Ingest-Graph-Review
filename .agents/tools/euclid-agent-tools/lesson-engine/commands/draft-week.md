---
description: Draft all 15 sections of a lesson week at all 5 distillation levels
allowed-tools: WebSearch, WebFetch, Read, Write, Bash, Grep, Glob, Agent
argument-hint: <civilization> <period> <element> <deity> <grade>
---

# Draft Full Week

Read the content-drafter skill: @${CLAUDE_PLUGIN_ROOT}/skills/content-drafter/SKILL.md
Load section requirements: @${CLAUDE_PLUGIN_ROOT}/skills/section-interpreter/references/section-requirements.md

## Parameters
Parse: civilization = $1, period = $2, element = $3, deity = $4, grade = $5

## Procedure

This command orchestrates a full lesson week production — all 15 sections × 5 distillation levels = 75 content artifacts.

### Phase 1: Research (if not already done)
Check workspace for existing FINDING blocks. If insufficient:
1. Run `/research-full-scan` for the civilization/period notch
2. Run `/research-element` for the specific element
3. Collect all FINDING and IMAGE_REF blocks

### Phase 2: Draft in Structural Order
Draft sections in dependency order, not sequential order:

**Wave 1 (Defining sections — draft first):**
- A2 (defines visual rhetoric principle)
- B2 (defines mathematical property)
These set the §2↔§5 match — everything else flows from here.

**Wave 2 (Crystallization — draft second):**
- A5 (crystallizes A2's principle in one artifact)
- B5 (crystallizes B2's property in one invention)
Verify §2↔§5 match is solid before proceeding.

**Wave 3 (Generalization sections):**
- A3 (sacred art survey using A2's principle)
- A4 (social diffusion)
- B3 (transformations of B2's property)
- B4 (historical lineage)

**Wave 4 (Practice sections):**
- A6 (art activity from A5's technique)
- B6 (engineering decomposition from B5)
- B7 (engineering build)

**Wave 5 (Framing sections):**
- A1 (myth hook — now that we know the element and deity)
- B1 (bridge from A7)
- A7 (dual-register reveal — after both days' content exists)
- B8 (synthesis + circuit to next week)

### Phase 3: Validate
Run gap-assessor on the full set.
Run semantic-deduplicator on the full set.

### Phase 4: Image Design
Run image-designer on all sections.

### Phase 5: Reconcile
Generate reconciliation dashboard for approval.

## Output
Save to workspace directory `[civ]_[element]_grade[N]/`:
- 15 section draft files (YAML with all 5 levels)
- Gap report
- Dedup report
- Image briefs
- Reconciliation dashboard
