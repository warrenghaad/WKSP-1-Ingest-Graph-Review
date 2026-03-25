# Replit Agent Prompt

Build a full-stack Replit app called `Euclid First-Run Textreader`.

This app is not the canonical CMS, not the RWI system, not the NASH room, and not the final DAM.
It is a narrow first-run worker for text-to-image preparation.

## Product goal

Given pasted research text or lesson text, the app should:

1. extract atomic visual concepts
2. generate sourcing queries for each concept
3. generate AI image prompts for each concept
4. let the user curate candidate images quickly
5. hand selected packets into the existing backend

## Hard constraints

- Do not build a second CMS.
- Do not build a second lesson editor.
- Do not build graph/NASH functionality.
- Do not make Replit the source of truth.
- Treat the external backend as canonical.
- Keep only temporary local draft/session state in Replit.
- Show provenance and accuracy labels on every candidate.

## Preferred stack

- React frontend
- lightweight Node/Express backend in Replit for proxying
- local draft persistence only
- backend adapter layer so API routes can change without rewriting UI

## UI layout

Use 4 zones:

- top bar: project title, backend status, source mode, handoff action
- left pane: title, raw text, citation, source URL, grade/week/section inputs
- center pane: concept board with atomic cards
- right drawer: selected concept details, queries, prompts, candidates, provenance controls

Optional:

- bottom handoff tray

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
- POST `/api/images/spec/diagram`
- POST `/api/images/generate/openai`
- POST `/api/images/generate/gemini-image`

Use env vars:

- APP_API_BASE
- APP_API_KEY
- OPENAI_API_KEY only if needed locally

## Build order

Phase 1:
- text intake
- concept extraction
- concept board
- prompt/query generation
- candidate drawer
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

## Deliverables

Build the app with:

- frontend pages/components
- backend proxy routes
- typed concept data model
- local session persistence
- clear error states
- README with setup and env vars
