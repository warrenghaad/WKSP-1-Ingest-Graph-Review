---
description: Generate the reconciliation dashboard showing content and images for approval
allowed-tools: WebSearch, WebFetch, Read, Write, Bash, Grep, Glob, Agent
argument-hint: <lesson-id> OR <path-to-lesson-content>
---

# Reconcile Lesson

Read the reconciliation-dashboard skill: @${CLAUDE_PLUGIN_ROOT}/skills/reconciliation-dashboard/SKILL.md

## Parameters
Parse: lesson_id_or_path = $1

## Procedure

1. Gather current state:
   - Load all drafted content (from content-drafter outputs or existing files)
   - Load gap report (from gap-assessor, or run one)
   - Load dedup report (from semantic-deduplicator, or run one)
   - Load image manifest (from image-designer, or inventory existing images)

2. Compute per-section status:
   - Content completeness (N/5 levels drafted)
   - Image completeness (N/required images ready)
   - Structural health (constraint violations)
   - Approval state (pending/approved/rejected)

3. Generate dashboard:
   - If Express.js backend available → React component with API integration
   - If standalone → static HTML with embedded state
   - Always → JSON state export for programmatic access

4. Display:
   - Week overview (all 15 sections at a glance)
   - Per-section drill-down (content + images + flags)
   - Flags panel (all issues aggregated)
   - Approval controls

## Output
Save to workspace:
- `[lesson_id]_dashboard.html` — Static HTML reconciliation dashboard
- `[lesson_id]_dashboard_state.json` — Machine-readable state
- `[lesson_id]_reconciliation_summary.md` — Text summary of what needs attention
