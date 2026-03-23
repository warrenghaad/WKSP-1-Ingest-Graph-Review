---
description: Route targeted research tasks to fix identified lesson gaps
allowed-tools: WebSearch, WebFetch, Read, Write, Bash, Grep, Glob, Agent
argument-hint: <gap-report-path> OR <section-code> <civilization> <period>
---

# Direct Research

Read the research-director skill: @${CLAUDE_PLUGIN_ROOT}/skills/research-director/SKILL.md

## Parameters
Parse: Either gap_report_path = $1 (path to a GAP_REPORT yaml), or section = $1, civilization = $2, period = $3

## Procedure

### From Gap Report:
1. Load the gap report
2. Extract action items targeted at research-director
3. Map each gap to the appropriate MAGIC-line investigation
4. Generate RESEARCH_DIRECTIVE blocks with precise search queries
5. Prioritize: critical gaps first, upstream before downstream
6. Execute research commands via gea-research plugin OR output directive list

### From Direct Parameters:
1. Load section requirements for the target section
2. Determine which MAGIC lines this section needs (routing matrix)
3. Generate search queries appropriate to the section's needs
4. Execute or output directives

## Output
Save to workspace:
- `[lesson_id]_research_directives.yaml` — Full directive list
- Execute research commands if running live, saving FINDING blocks to workspace
