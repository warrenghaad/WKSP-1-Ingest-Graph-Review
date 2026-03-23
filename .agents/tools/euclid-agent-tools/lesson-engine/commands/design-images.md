---
description: Create image design specifications and route to the image pipeline for production
allowed-tools: WebSearch, WebFetch, Read, Write, Bash, Grep, Glob, Agent
argument-hint: <section-code> <civilization> <period> <element> OR <gap-report-path>
---

# Design Images

Read the image-designer skill: @${CLAUDE_PLUGIN_ROOT}/skills/image-designer/SKILL.md

## Parameters
Parse: Either section = $1, civilization = $2, period = $3, element = $4, or gap_report_path = $1

## Procedure

1. Determine scope (single section, full day, full week, or from gap report)
2. Load section-specific image requirements
3. Check cell library for existing reusable components
4. For each image needed, produce an IMAGE_BRIEF with:
   - Image type (MUS/SCN/DGM/CON/MOT/OVR)
   - Search queries or generation specs
   - Overlay specifications
   - Cell references
5. Route briefs to image-pipeline commands

## Output
Save to workspace:
- `[lesson_id]_image_briefs.yaml` — All IMAGE_BRIEF blocks
- `[lesson_id]_cell_requirements.md` — Cell library gaps to fill first
- Route to image-pipeline commands for execution
