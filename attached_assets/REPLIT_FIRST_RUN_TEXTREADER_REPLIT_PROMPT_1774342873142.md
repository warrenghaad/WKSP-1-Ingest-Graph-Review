# Replit Agent Prompt

Patch the existing full-stack Replit app called `Euclid First-Run Textreader`.

This app is not the canonical CMS, not the full RWI system, not the NASH room, and not the final DAM.
It is the image-side first-run worker in RWI for text-to-image preparation.

Do not rebuild the app from zero.
Keep the current route structure and patch the existing `Textreader` workflow in place.

Observed current state:

- the app already has `/textreader`
- session creation works
- `backend-status` says `APP_API_BASE not set`
- concept extraction is currently failing
- candidate cards exist
- candidate review currently supports only approve and reject
- candidate images currently use crop-style display and need contain-fit DAM behavior

## Product goal

Given pasted research text or lesson text, the app should:

1. extract atomic visual concepts
2. ingest the material into the backend early
3. generate sourcing queries for each concept
4. generate AI image prompts for each concept
5. append candidate images to the ingested material
6. run a vision-validation pass for image-to-text fidelity
7. display the material and candidate images immediately in a lightweight DAM view
8. let the user curate candidate images quickly
9. hand selected runtime packets into the existing backend
10. update Notion workflow and validation records so CMS status and reviewer state stay synchronized

## Hard constraints

- Do not build a second CMS.
- Do not build a second lesson editor.
- Do not build graph/NASH functionality.
- Do not make Replit the source of truth.
- Treat the external backend as canonical for runtime data.
- Treat Notion as the CMS, workflow, validation, and checking layer.
- Keep only temporary local draft/session state in Replit.
- Show provenance and accuracy labels on every candidate.
- Add a vision layer that validates candidate fidelity before human approval.
- Support ingesting files the user already has, not only pasted text.

## Preferred stack

- React frontend
- lightweight Node/Express backend in Replit for proxying
- local draft persistence only
- backend adapter layer so API routes can change without rewriting UI
- workflow adapter or sync layer for Notion status updates

## UI layout

Use 4 zones:

- top bar: project title, backend status, source mode, handoff action
- left pane: title, raw text, citation, source URL, grade/week/section inputs
- center pane: concept board with atomic cards
- right drawer: selected concept details, queries, prompts, candidates, provenance controls
- DAM view: immediate cards for ingested material and appended candidates

Optional:

- bottom handoff tray
- inline hover previews tied to text spans and image chips

## Concept card fields

- concept_id
- label
- description
- visual_type
- priority
- search_queries
- ai_prompts
- diagram_prompt
- tags
- source_mode
- source_type
- accuracy_status
- fidelity_status
- fidelity_note
- hover_caption
- hover_alt
- review_decision
- state

## State machine

- draft
- parsed
- query_ready
- searching
- candidates_ready
- selected
- ai_prompt_ready
- ready_for_handoff
- sent_to_backend
- error

## Source modes

- open_web_fast
- museum_context
- ai_reconstruction
- hybrid

Default to `open_web_fast`.

## Provenance labels

- source_type: open_web, museum, pinterest_reference, ai_generated, hybrid_reference
- accuracy_status: unreviewed, plausible, historically_grounded, approved

## Required review decisions

Every candidate must support:

- approve_reference
- reject
- needs_ai_generation
- needs_overlay
- needs_crop_or_resize
- needs_better_source

## Backend integration

Create an adapter layer for these existing routes:

- POST `/api/research/ingest`
- POST `/api/rwi/images/search`
- GET `/api/rwi/images/candidates/:artifactId`
- POST `/api/rwi/images/approve`
- POST `/api/rwi/images/generate-diagram`
- POST `/api/rwi/images/ingest-content`
- POST `/api/rwi/images/auto-search-needs`
- POST `/api/images/search/multi`
- POST `/api/images/validate`
- POST `/api/images/analyze`
- POST `/api/vision/spec-and-graph`
- POST `/api/images/spec/diagram`
- POST `/api/images/generate/openai`
- POST `/api/images/generate/gemini-image`

Use env vars:

- APP_API_BASE
- APP_API_KEY
- OPENAI_API_KEY only if needed locally
- GEMINI_API_KEY if local Gemini-based extraction or prompt generation is used

## Exact patch order

1. Fix `APP_API_BASE` handling and backend status.
2. Repair `/api/textreader/extract`.
3. Add file upload intake for existing files in hand.
4. Ingest material into the backend immediately after session creation or file upload.
5. Call `POST /api/vision/spec-and-graph` immediately after ingest.
6. Replace candidate image `object-cover` behavior with bounded `object-contain`.
7. Expand review decisions beyond approve/reject.
8. Add immediate DAM cards for ingested items and candidates.
9. Preserve JSON export fallback if backend is offline.
10. Add a workflow-status handoff so reviewed packets can update Notion CMS and validation state.

## Build order

Phase 1:
- text intake
- existing file upload intake
- backend ingest
- concept extraction
- vision spec generation
- concept board
- prompt/query generation
- candidate drawer
- immediate DAM display
- vision fidelity pass
- backend handoff

Phase 2:
- saved sessions
- batch mode
- prompt refinement
- JSON export fallback

Phase 3:
- approved-output mirror hooks
- richer search integrations

## Design behavior

- light, calm, dense UI
- selection-driven interactions
- no crowded toolbars
- no modal-heavy workflow
- preserve manual edits to queries and prompts
- do not auto-approve or auto-send concepts
- show text-plus-hover behavior so text spans can reveal appended image context
- show provenance and fidelity note in the hover UI
- use image containers that can shrink safely in DAM cards without layout breakage
- default to contain-fit display and allow larger preview on hover or selection

## Deliverables

Build the app with:

- frontend pages/components
- backend proxy routes
- typed concept data model
- local session persistence
- clear error states
- README with setup and env vars

## Required implementation details

- call `POST /api/research/ingest` before sourcing
- call `POST /api/vision/spec-and-graph` after ingest so overlays, patterns, hover cards, and graph packets are created immediately
- for candidate image cards, use fixed containers with `object-contain`
- add review decisions:
  - `approve_reference`
  - `reject`
  - `needs_ai_generation`
  - `needs_overlay`
  - `needs_crop_or_resize`
  - `needs_better_source`
- show `fidelity_status`, `fidelity_note`, `hover_caption`, and provenance on each candidate
- keep backend handoff packets compatible with the canonical app backend
- write workflow-facing status and validation updates into Notion without treating Notion as the runtime image blob store
