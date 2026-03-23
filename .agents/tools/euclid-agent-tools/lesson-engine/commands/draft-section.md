---
description: Draft lesson content at all 5 distillation levels for a section
allowed-tools: WebSearch, WebFetch, Read, Write, Bash, Grep, Glob, Agent
argument-hint: <section-code> <civilization> <period> <element> <deity> <grade>
---

# Draft Section Content

Read the content-drafter skill: @${CLAUDE_PLUGIN_ROOT}/skills/content-drafter/SKILL.md
Load section requirements: @${CLAUDE_PLUGIN_ROOT}/skills/section-interpreter/references/section-requirements.md

## Parameters
Parse: section = $1, civilization = $2, period = $3, element = $4, deity = $5, grade = $6

## Procedure

1. Load the section specification for the target section
2. Check for existing research findings (FINDING blocks) in the workspace — if found, use them
3. Draft Level 5 (eTextbook) — the master draft with all content
4. Distill to Level 4 (Teacher Script) — remove extension, add pedagogy
5. Distill to Level 3 (Slideshow) — key visuals + essential text
6. Distill to Level 2 (Student Worksheet) — prompts + response spaces
7. Distill to Level 1 (Teacher Summary) — bare skeleton
8. Validate: cognitive operation performed? MAGIC weight respected? GEA/GEM present? structural constraints satisfied?
9. Flag any UNRESOURCED_CLAIM items that need research

## Output
Save structured SECTION_DRAFT to workspace:
- `[section]_[civ]_[element]_grade[N]_draft.yaml` — Full 5-level draft
- `[section]_[civ]_[element]_grade[N]_validation.md` — Validation results and flags
