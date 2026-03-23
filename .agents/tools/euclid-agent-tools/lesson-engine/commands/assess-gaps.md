---
description: Assess existing lesson content against canonical requirements and produce a gap report
allowed-tools: Read, Write, Bash, Grep, Glob
argument-hint: <path-to-lesson-content> [section-code]
---

# Assess Lesson Gaps

Read the gap-assessor skill: @${CLAUDE_PLUGIN_ROOT}/skills/gap-assessor/SKILL.md
Load section requirements: @${CLAUDE_PLUGIN_ROOT}/skills/section-interpreter/references/section-requirements.md

## Parameters
Parse: content_path = $1, section_code = $2 (optional — if omitted, assess all sections found)

## Procedure

1. Ingest content at the specified path (HTML, markdown, YAML, or raw text)
2. Identify which sections are present and what distillation levels exist
3. For each section found, assess all 7 dimensions:
   - Content completeness (5 distillation levels)
   - Structural integrity (cognitive ops, §2↔§5, PIVOT/BRIDGE/CIRCUIT)
   - MAGIC weight compliance
   - GEA/GEM notation
   - Image coverage
   - MAGIC tag coverage
   - Cross-section consistency
4. Produce prioritized action items routed to appropriate skills

## Output
Save GAP_REPORT to workspace:
- `[lesson_id]_gap_report.yaml` — Full structured gap report
- `[lesson_id]_action_items.md` — Prioritized action list for human review
