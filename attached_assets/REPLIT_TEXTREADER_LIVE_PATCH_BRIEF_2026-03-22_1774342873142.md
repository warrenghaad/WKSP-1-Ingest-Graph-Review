# Replit Textreader Live Patch Brief

Date: 2026-03-22
Source inspected: `https://f890e8b0-ad84-4e7c-8860-63c6858faddd-00-14yg7yr5ep169.spock.replit.dev/`

## What Already Works

- the app is publicly reachable
- it is a Vite app with a `Textreader` route
- session creation works through `POST /api/textreader/sessions`
- concept board and candidate drawer UI already exist
- there is a backend status indicator
- there is a handoff or export fallback tray

## What Is Broken Or Missing

- backend connection is not configured
- `backend-status` reports `APP_API_BASE not set`
- concept extraction is failing
- file ingestion is not present in the inspected `Textreader` page
- candidate review only supports `approve` and `reject`
- candidate image display uses `object-cover`, which crops images
- there is not yet a true immediate DAM lane with review-state visibility
- there is not yet a visible ingest -> vision spec -> overlay/pattern pipeline

## Required Patch Direction

Patch the existing app. Do not rebuild it.

### Frontend patch targets

- `Textreader` intake pane
- concept board
- candidate drawer
- handoff tray
- new immediate DAM lane or DAM drawer

### Backend adapter patch targets

- `backend-status`
- `sessions`
- `extract`
- `concept search`
- `candidate update`
- `handoff`
- proxy calls into the canonical app backend

## Exact UI Changes

### Intake pane

Add:

- multi-file upload
- drag and drop
- uploaded file list
- ingest progress state
- ingest result badges

Keep:

- title
- raw text
- citation
- source URL
- grade
- week
- section

### Candidate card behavior

Change:

- image from `object-cover` to `object-contain`

Add:

- review buttons for all six decisions
- fidelity badge
- fidelity note
- hover caption
- enlarge preview
- overlay-needed badge
- AI-needed badge

### DAM behavior

Add an immediate DAM surface that appears after ingest and before final approval.

Each DAM record should show:

- source excerpt
- linked concept labels
- candidate thumbnails
- provenance
- fidelity
- review decision
- AI generation needed flag
- overlay needed flag

## Exact Data Additions

### Concept model

Add or ensure:

- `ingest_id`
- `overlay_specs`
- `pattern_specs`
- `hover_cards`
- `graph_packet`
- `vectorization_records`

### Candidate model

Add or ensure:

- `review_decision`
- `fidelity_status`
- `fidelity_note`
- `hover_caption`
- `hover_alt`
- `needs_overlay`
- `needs_ai_generation`
- `needs_crop_or_resize`
- `needs_better_source`

## Exact Call Sequence

1. Create or update local session.
2. Ingest text or extracted file text to `POST /api/research/ingest`.
3. Call `POST /api/vision/spec-and-graph` for the ingested text.
4. Create concept cards with search queries, prompts, overlays, patterns, and hover cards.
5. Run image sourcing.
6. Display candidate images immediately in the DAM.
7. Run fidelity analysis.
8. Let the reviewer assign one of six decisions.
9. Send reviewed runtime packet to the canonical backend.
10. Update Notion workflow and validation status so CMS and reviewer visibility stay current.

## Non-Negotiable Guardrails

- Replit is not the source of truth.
- The app backend stays canonical for runtime data.
- Notion stays canonical for CMS, workflow, validation, and checking status.
- Replit may hold draft or session state only.
- Do not auto-approve.
- Do not auto-send.
- Do not hide provenance.
- Do not flatten review decisions into binary approve/reject.
- Do not crop candidate images by default.
