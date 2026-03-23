---
description: Analyze lesson content for semantic redundancy vs. genuinely additive material
allowed-tools: Read, Write, Bash, Grep, Glob
argument-hint: <path-to-lesson-content>
---

# Deduplicate Content

Read the semantic-deduplicator skill: @${CLAUDE_PLUGIN_ROOT}/skills/semantic-deduplicator/SKILL.md

## Parameters
Parse: content_path = $1 (path to lesson content — can be a directory or single file)

## Procedure

1. Ingest all section content found at the path
2. Map what cognitive operation each section ACTUALLY performs (not just what it's labeled)
3. Check register separation (Day A = metaphor, Day B = function)
4. Check distillation integrity (each level is a proper subset of the one above)
5. Check A4 sub-section differentiation
6. Check cross-section uniqueness (would a reader know which section is which without labels?)
7. Produce DEDUP_REPORT with findings and recommendations

## Output
Save to workspace:
- `[lesson_id]_dedup_report.yaml` — Full deduplication report
- `[lesson_id]_dedup_summary.md` — Human-readable summary with examples
