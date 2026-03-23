---
name: reconciliation-dashboard
description: >
  EUCLID reconciliation and approval dashboard — generates a review interface that displays
  drafted content and images side-by-side for approval, rejection, or revision. Connects
  to the Express.js backend (port 3001) and Supabase for persistent state tracking.
  Surfaces naming inconsistencies, structural violations, image gaps, and redundancy flags
  alongside the actual content so Sami can approve/reject per section and per distillation
  level. Use this skill whenever someone asks to "show me what we have for approval",
  "open the reconciliation dashboard", "review this lesson for approval", "show content
  for sign-off", "display the approval view", "what's ready for approval?", "reconcile
  this lesson", "show me the dashboard", "present content and images for review",
  or any request involving reviewing, approving, or rejecting lesson content and images
  before they go to production. Also trigger when someone says "what's the status of
  this lesson?", "show me what needs my approval", or "build the approval UI".
version: 0.1.0
---

# EUCLID Reconciliation Dashboard

## Purpose

You generate a reconciliation interface that presents lesson content and images for human approval. The dashboard is the quality gate between drafting and production — nothing goes to The Face (Engine 4) without passing through reconciliation.

The dashboard connects to the Express.js backend at localhost:3001 and persists approval state to Supabase. It displays content, images, gap reports, and deduplication findings in a structured review interface.

## What the Dashboard Displays

### Per Section View

For each of the 15 sections, the dashboard shows:

```
┌─────────────────────────────────────────────────────────────┐
│ SECTION: A2 — Visual Rhetoric          STATUS: ⬤ Needs Review │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─ Content ──────────────────────────────────────────────┐ │
│  │ Level 5 (eTextbook)  [✓ Draft] [View] [Approve] [Reject] │
│  │ Level 4 (Teacher)    [✓ Draft] [View] [Approve] [Reject] │
│  │ Level 3 (Slideshow)  [⚠ Partial] [View] [Approve] [Reject] │
│  │ Level 2 (Worksheet)  [✗ Missing] [Draft] │
│  │ Level 1 (Summary)    [✓ Draft] [View] [Approve] [Reject] │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌─ Images ───────────────────────────────────────────────┐ │
│  │ [img1] MUS rosette  ✓ Sourced  [View] [Approve] [Reject] │
│  │ [img2] DGM decomp   ✓ Created  [View] [Approve] [Reject] │
│  │ [img3] DGM affordance ⚠ Needs overlay [Route to pipeline] │
│  │ [img4] OVR element  ✗ Missing  [Create brief] │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌─ Flags ────────────────────────────────────────────────┐ │
│  │ ⚠ MAGIC drift: I-line overweight (0.7 vs canonical 0.5) │
│  │ ⚠ GEA/GEM notation missing in ¶3 │
│  │ ✓ §2↔§5 match verified │
│  │ ✓ No redundancy detected │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  [Approve Section] [Reject Section] [Request Revision]     │
│  Notes: [_________________________________]                │
└─────────────────────────────────────────────────────────────┘
```

### Week Overview

The top-level view shows all 15 sections at a glance:

```
WEEK: [Element] — [Deity] — [Civilization] [Period] — Grade [N]

DAY A (Metaphor Register)
  A1 Myth Hook          ⬤ Approved    5/5 levels  4/4 images
  A2 Visual Rhetoric    ⬤ Needs Review 4/5 levels  3/6 images
  A3 Iconographic Chain ⬤ In Progress  2/5 levels  1/5 images
  A4 Material Culture   ⬤ Not Started  0/5 levels  0/8 images
  A5 Crystallization    ⬤ Needs Review 5/5 levels  2/3 images
  A6 Art Activity       ⬤ Approved    5/5 levels  3/3 images
  A7 Pivot              ⬤ In Progress  3/5 levels  0/3 images

DAY B (Function Register)
  B1 Bridge             ⬤ Approved    5/5 levels  1/1 images
  B2 Math Properties    ⬤ Needs Review 5/5 levels  3/4 images
  B3 Transformations    ⬤ Not Started  0/5 levels  0/4 images
  B4 Shape Lineage      ⬤ Not Started  0/5 levels  0/4 images
  B5 STEM Notch         ⬤ In Progress  3/5 levels  1/3 images
  B6 Engineering Decomp ⬤ Not Started  0/5 levels  0/3 images
  B7 Engineering Build  ⬤ Not Started  0/5 levels  0/3 images
  B8 Synthesis          ⬤ Not Started  0/5 levels  0/2 images

TOTALS: 3/15 Approved | 37/75 Levels Drafted | 18/52 Images Ready
```

### Flags Panel

A dedicated flags panel aggregates all issues from gap-assessor and semantic-deduplicator:

```
CRITICAL (must fix before approval):
  ⊘ A4: Only 1 sub-section (requires ≥2)
  ⊘ B5: No GEA/GEM decomposition (mandatory)
  ⊘ A2→A5: §2↔§5 match broken — A5 crystallizes a different principle than A2 defines

HIGH (should fix):
  △ A3: Only 2 carrier types (recommend 3–5)
  △ B2: MAGIC weight M=0.4 (canonical 0.9) — not math-dominant
  △ 12 images have broken paths

MEDIUM (polish):
  ○ A1: Missing museum accession number for primary image
  ○ B4: Timeline diagram not yet created
  ○ A6: Materials list incomplete

REDUNDANCY:
  ≈ A2 ↔ A3: Cognitive operation collapse — A3 reads like A2 with different images
  ≈ B2 Level 5 = B2 Level 4 (distillation not performed)
```

## Backend Integration

### Express.js Endpoints (localhost:3001)

The dashboard reads from and writes to these endpoints:

```
GET  /api/lessons/:lessonId/sections          → All sections for a lesson
GET  /api/lessons/:lessonId/sections/:code    → Single section detail
GET  /api/lessons/:lessonId/images            → All images for a lesson
GET  /api/lessons/:lessonId/gaps              → Gap report
GET  /api/lessons/:lessonId/dedup             → Deduplication report
GET  /api/lessons/:lessonId/status            → Approval status summary

POST /api/lessons/:lessonId/sections/:code/approve    → Approve a section
POST /api/lessons/:lessonId/sections/:code/reject     → Reject with notes
POST /api/lessons/:lessonId/sections/:code/revise     → Request revision
POST /api/lessons/:lessonId/images/:imageId/approve   → Approve an image
POST /api/lessons/:lessonId/images/:imageId/reject    → Reject an image

POST /api/lessons/:lessonId/reconcile         → Run full reconciliation
POST /api/lessons/:lessonId/export            → Export approved content to The Face
```

### Supabase Schema

The dashboard persists approval state to Supabase:

```sql
-- Lesson approval tracking
CREATE TABLE lesson_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id TEXT NOT NULL,
  section_code TEXT NOT NULL,        -- A1, A2, ..., B8
  distillation_level INTEGER,        -- 1-5, NULL for section-level approval
  status TEXT NOT NULL DEFAULT 'pending',  -- pending, approved, rejected, revision_requested
  reviewer TEXT,                      -- who approved/rejected
  notes TEXT,                         -- rejection/revision notes
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Image approval tracking
CREATE TABLE image_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id TEXT NOT NULL,
  image_ref_id TEXT NOT NULL,
  section_code TEXT NOT NULL,
  image_type TEXT NOT NULL,          -- MUS, SCN, DGM, CON, MOT, OVR
  status TEXT NOT NULL DEFAULT 'pending',
  reviewer TEXT,
  notes TEXT,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gap tracking (persisted from gap-assessor runs)
CREATE TABLE lesson_gaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id TEXT NOT NULL,
  section_code TEXT NOT NULL,
  dimension TEXT NOT NULL,           -- content, images, structural, magic, gea_gem, tags, cross_section
  severity TEXT NOT NULL,            -- critical, high, medium, low
  description TEXT NOT NULL,
  action_required TEXT,
  target_skill TEXT,                 -- research-director, content-drafter, image-designer, semantic-deduplicator
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reconciliation history
CREATE TABLE reconciliation_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id TEXT NOT NULL,
  run_date TIMESTAMPTZ DEFAULT NOW(),
  sections_assessed INTEGER,
  gaps_found INTEGER,
  gaps_critical INTEGER,
  gaps_resolved INTEGER,
  redundancy_instances INTEGER,
  approval_progress JSONB           -- {approved: N, pending: N, rejected: N}
);
```

### Row-Level Security

```sql
-- All tables: authenticated users only
ALTER TABLE lesson_approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage approvals"
  ON lesson_approvals FOR ALL USING (auth.role() = 'authenticated');

-- Same for image_approvals, lesson_gaps, reconciliation_runs
```

## Dashboard Generation Workflow

### Step 1: Gather State

Collect from all upstream skills:
- Content drafts from `content-drafter` (what exists at each level)
- Gap report from `gap-assessor` (what's missing or broken)
- Dedup report from `semantic-deduplicator` (what's redundant)
- Image manifest from `image-designer` (what images exist, what's needed)

### Step 2: Compute Status

For each section, compute:
- **Content completeness:** How many of 5 levels are drafted?
- **Image completeness:** How many required images are sourced?
- **Structural health:** Any constraint violations?
- **Approval state:** Pending / Approved / Rejected / Revision Requested

### Step 3: Generate Dashboard

Produce the dashboard as a React component or HTML page that:
- Renders the week overview
- Provides drill-down per section
- Shows content at each level (with diff view if previous version exists)
- Shows images with quality scores and overlay status
- Shows all flags from gap-assessor and semantic-deduplicator
- Provides approve/reject/revise controls
- Persists state to Supabase via Express.js endpoints

### Step 4: Handle Approvals

When content is approved:
1. Update Supabase `lesson_approvals` record
2. Mark related gaps as resolved
3. If all sections approved → enable "Export to The Face" button
4. Export writes approved content to The Face's HTML template system

When content is rejected:
1. Update Supabase with rejection notes
2. Create action items routed to appropriate skill
3. Re-enter the draft → assess → fix cycle

## Generating the Dashboard

When this skill is invoked, produce one of:

1. **Static HTML dashboard** — Self-contained HTML file with embedded JS that reads from a JSON data file. Use this when the Express.js backend isn't running.

2. **Connected React component** — A `.jsx` component that fetches from the Express.js endpoints. Use this when wiring into the live system.

3. **JSON state export** — Raw structured data for integration with other tools.

The choice depends on context. If the user says "show me what we have," produce the static HTML with current state embedded. If wiring into the system, produce the React component with API integration.

## References

For the Express.js endpoint patterns:
- `references/api-endpoints.md` — Full endpoint spec with request/response shapes

For the Supabase schema:
- `references/supabase-schema.md` — Complete schema with indexes and policies

For the approval workflow state machine:
- `references/approval-workflow.md` — State transitions and business rules
