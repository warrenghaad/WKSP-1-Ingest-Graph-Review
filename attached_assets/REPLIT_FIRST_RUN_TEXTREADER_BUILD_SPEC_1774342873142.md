# Replit First-Run Textreader Build Spec

Date: 2026-03-21

## Role

Build Replit as the image-side worker in RWI and a narrow first-run worker for text-to-image prep.

It should:

- read raw text, briefs, and excerpts
- ingest the material into the backend early
- split them into atomic visual concepts
- generate search queries and AI prompt packs
- append candidate images to the ingested material
- run a vision-validation pass for fidelity
- let the user quickly curate promising results
- hand selected packets into the existing backend

It should not become:

- the canonical RWI system
- the canonical NASH system
- the canonical DAM
- the final lesson editor
- the approval source of truth

Canonical runtime persistence stays in the app backend and Supabase/PostgreSQL. Notion serves as the CMS, workflow, validation, and checking layer.

## Live App Findings

The current public Replit preview already has a usable `Textreader` shell.

Observed state from the live app:

- routes exist for `/`, `/reader`, `/lab`, `/braid`, and `/textreader`
- `POST /api/textreader/sessions` works
- `GET /api/textreader/backend-status` returns `online: false` and `message: "APP_API_BASE not set"`
- `POST /api/textreader/extract` currently fails
- the candidate drawer already exists and renders image cards
- the candidate drawer currently supports only `approve` and `reject`
- candidate images currently use `object-cover`
- the current inspected page does not yet show file-ingest UI

This means Replit should be patched in place, not rebuilt from zero.

## Hard Guardrails

- Replit is a worker, not a source of truth.
- Supabase and PostgreSQL remain canonical for `content_items`, `sources`, `media_assets`, `rwi_needs`, candidate sets, approvals, and review data.
- Replit may keep temporary local draft state only.
- Successful images should persist to the canonical app stack first.
- Notion is the CMS, workflow, validation, and checking layer.
- Candidate sets and approvals must stay separate.
- AI-generated images must be explicitly labeled as generated.
- Every selected result must carry provenance and accuracy labels.
- A vision layer must validate image-to-text fidelity before handoff or approval.

## Functional Scope

### Inputs

Support:

- pasted text
- research brief text
- lesson fragment text
- uploaded `.txt`, `.md`, `.docx` extract
- uploaded files that already exist in the current workflow
- batch ingestion of files the user already has on hand
- optional source URL and citation
- optional `grade`, `week`, `sectionId`, `lessonId`

### Outputs

Each concept card must produce:

```json
{
  "concept_id": "string",
  "label": "string",
  "description": "string",
  "visual_type": "artifact|scene|diagram|overlay|timeline|map|mechanics",
  "priority": "high|medium|low",
  "search_queries": ["string"],
  "ai_prompts": ["string"],
  "diagram_prompt": "string|null",
  "tags": ["string"],
  "source_mode": "open_web_fast|museum_context|ai_reconstruction|hybrid",
  "source_type": "open_web|museum|pinterest_reference|ai_generated|hybrid_reference",
  "accuracy_status": "unreviewed|plausible|historically_grounded|approved"
}
```

### Required actions

- `extract concepts`
- `ingest material`
- `run search`
- `append candidates`
- `run fidelity check`
- `display in dam`
- `refine query`
- `generate prompt`
- `mark reference`
- `mark ai-only`
- `ready for handoff`
- `send to backend`

### Candidate decisions

Every image candidate must support these reviewer actions:

- `approve_reference`
- `reject`
- `needs_ai_generation`
- `needs_overlay`
- `needs_crop_or_resize`
- `needs_better_source`

## Source Strategy

Default to `open_web_fast`.

Available source modes:

- `open_web_fast`
- `museum_context`
- `ai_reconstruction`
- `hybrid`

Behavior:

- Use open-web first for fast visual coverage.
- Use museum context when grounding matters.
- Use AI reconstruction when sourced imagery is missing or weak.
- Use hybrid when references should shape a stronger AI prompt.

## Vision AI Fidelity Layer

The app must include a validation step between candidate retrieval and handoff.

This layer should:

- compare image candidates against the source text and concept card
- rank candidates so the strongest matches surface first
- flag weak matches, likely anachronisms, and mismatched visual details
- generate a short fidelity note for the reviewer
- keep validation separate from final human approval

Required outputs per selected candidate:

- `fidelity_status`: `unchecked|match|partial_match|weak_match|reject`
- `fidelity_note`
- `hover_caption`
- `hover_alt`

## Existing File Ingestion Process

The app must support ingesting files the user already has, not just pasted text.

Minimum flow:

1. User uploads one or more files already in hand.
2. Replit extracts text or descriptive metadata from each file.
3. Replit sends the extracted material into the backend.
4. Replit immediately runs image sourcing for each resulting concept or section.
5. Replit creates provisional DAM cards for the material and its image candidates.
6. Vision AI ranks and annotates the candidate images.
7. The reviewer marks each candidate as approved, rejected, AI-needed, or overlay-needed.

If the backend already has an ingest endpoint for bulk content, prefer that instead of inventing a second storage format.

## DAM Display Behavior

The Replit UI must include an immediate lightweight DAM surface.

Rules:

- every ingested item appears in the DAM immediately, even before approval
- each DAM card must show source text context, top image candidates, provenance, and fidelity state
- image containers must be shrink-safe and fit inside cards without breaking layout
- use image containers that preserve aspect ratio and support `contain` behavior rather than destructive cropping by default
- support a larger preview on hover or selection
- overlay-needed assets must be visually flagged in the DAM
- AI-needed assets must be visually flagged in the DAM
- image cards must default to `object-contain` inside bounded containers
- cards must support quick enlarge-on-hover or enlarge-on-select preview
- card metadata must surface `fidelity_status`, `fidelity_note`, `review_decision`, and provenance

## UI Design

Use a focused four-zone layout:

1. Top bar
   - title, backend status, source mode defaults, handoff button
2. Left intake pane
   - title, raw text, citation, source URL, scope fields
3. Center concept board
   - atomic concept cards and states
4. Right drawer
   - selected concept details, queries, prompts, candidates, provenance controls

Optional:

- bottom tray for handoff queue

Design rules:

- light-first
- calm and dense
- selection-driven
- no crowded permanent toolbars
- use drawers instead of modal stacks
- provenance and accuracy badges must always be visible
- text spans and image chips must support hover previews
- hover previews must show caption, provenance, and fidelity note

## Behavior

Default flow:

1. User pastes text or uploads files.
2. App creates a local session.
3. App ingests the material into the backend immediately.
4. App runs concept extraction.
5. App calls vision spec generation so overlays, patterns, hover cards, and graphnode candidates are created alongside the text.
6. App prepares search queries and prompt packs.
7. App runs search on selected concepts.
8. App appends candidates to the material.
9. App displays the material and candidates immediately in the DAM.
10. Vision AI validates candidate fidelity.
11. User marks each candidate as approved, rejected, AI-needed, overlay-needed, crop-needed, or better-source-needed.
12. User sends packet to backend.
13. App updates Notion workflow and validation records so CMS status, review state, and ready-next signals stay visible.

Concept state machine:

- `draft`
- `parsed`
- `query_ready`
- `searching`
- `candidates_ready`
- `selected`
- `ai_prompt_ready`
- `ready_for_handoff`
- `sent_to_backend`
- `error`

Human control rules:

- do not auto-approve
- do not auto-send all concepts
- do not overwrite manual edits on regenerate
- preserve manual query edits
- preserve manual prompt edits

## Backend Adapter

Replit should talk to the existing app backend through an adapter layer.

Environment variables:

- `APP_API_BASE`
- `APP_API_KEY` if auth is later added
- `OPENAI_API_KEY` only if Replit itself generates prompts or images

### Preferred initial routes

Research ingest:

- `POST /api/research/ingest`

Example:

```json
{
  "title": "Akitu excerpt",
  "excerpt": "raw text here",
  "sourceUrl": "optional",
  "citation": "optional",
  "tags": { "grade": 3, "week": 1, "section": "A1" },
  "autoSearchImages": true,
  "searchSources": ["met", "wikimedia", "british"],
  "maxConcepts": 8,
  "maxImagesPerConcept": 6
}
```

Image candidate search:

- `POST /api/rwi/images/search`

Example:

```json
{
  "artifact": "Akitu festival procession",
  "sources": ["wikimedia", "met", "british", "ppt"],
  "grade": 3,
  "week": 1,
  "sectionId": "A1",
  "lessonId": null,
  "needsId": null
}
```

Candidate retrieval:

- `GET /api/rwi/images/candidates/:artifactId`

Approve sourced image:

- `POST /api/rwi/images/approve`

Example:

```json
{
  "artifactId": "akitu-festival-procession",
  "imageUrl": "https://...",
  "title": "Akitu festival procession reference",
  "sourceUrl": "https://...",
  "license": "Unknown",
  "author": "Unknown",
  "tags": {
    "source_type": "open_web",
    "accuracy_status": "plausible"
  },
  "sectionId": "A1",
  "lessonId": null,
  "grade": 3,
  "week": 1
}
```

Generate and approve diagram:

- `POST /api/rwi/images/generate-diagram`

Bulk content-driven sourcing:

- `POST /api/rwi/images/ingest-content`

Needs-driven auto search:

- `POST /api/rwi/images/auto-search-needs`

Direct multi-source search:

- `POST /api/images/search/multi`

Prompt building and direct generation:

- `POST /api/images/spec/diagram`
- `POST /api/images/generate/openai`
- `POST /api/images/generate/gemini-image`

Vision validation:

- `POST /api/images/validate`
- `POST /api/images/analyze`

Combined vision + graph spec:

- `POST /api/vision/spec-and-graph`

## Build Order

### Phase 1

Build only:

- text intake
- concept extraction
- concept board
- query and prompt generation
- candidate drawer
- backend adapter
- handoff queue

### Phase 2

Add:

- saved sessions
- batch mode
- prompt refinement
- source mode switching
- JSON export fallback

### Phase 3

Add:

- Notion mirroring for approved outputs
- richer open-web integrations
- quality heuristics

## Fallback Export

If the backend is offline, export:

```json
{
  "title": "string",
  "input": {
    "text": "string",
    "citation": "string|null",
    "sourceUrl": "string|null"
  },
  "scope": {
    "grade": 3,
    "week": 1,
    "sectionId": "A1",
    "lessonId": null
  },
  "concepts": [],
  "selected_candidates": [],
  "ai_prompt_packets": []
}
```

## Anti-Patterns

Do not build:

- a second CMS
- a second NASH room
- a full lesson builder
- a broad dashboard with every tool always open
- hidden provenance
- hidden AI generation state

## Final Direction

Build Replit as a fast operator station:

- read text
- break it apart
- suggest sources
- suggest prompts
- let the human choose
- hand off into the real system

That is the correct scope.

## Exact Patch Order For The Existing Replit App

Patch the existing `Textreader` app in this order.

### 1. Fix backend connectivity

- add `APP_API_BASE` to Replit secrets
- make `/api/textreader/backend-status` succeed when `APP_API_BASE` is present
- if `APP_API_BASE` is missing, keep the current offline fallback behavior

### 2. Fix extraction

The current `/api/textreader/extract` path is failing.

Patch it so it:

- extracts atomic visual concepts locally or through Gemini
- stores `search_queries`
- stores `ai_prompts`
- stores `visual_type`, `priority`, `source_mode`, `source_type`, and `accuracy_status`
- sets concept state to `parsed` or `query_ready`

### 3. Add file ingestion

Add support for:

- drag and drop
- file picker
- multiple files per session
- `.txt`
- `.md`
- `.docx`
- plain text extracts from files already in hand

When files are uploaded:

- extract text locally
- create one session
- attach file records to the session
- ingest the extracted material to the backend immediately

### 4. Make ingestion happen before sourcing

On session creation or file upload:

- call `POST /api/research/ingest`
- store returned ingest identifiers on the local session and concept objects
- only then continue to extraction and search prep

### 5. Call vision spec generation immediately after ingest

For each ingested text block or concept:

- call `POST /api/vision/spec-and-graph`

Use the response to populate:

- `overlay_specs`
- `pattern_specs`
- `hover_cards`
- `vectorization.records`
- `graph.nodes`
- `graph.edges`
- `fidelity`

This gives the app simultaneous text, hover, overlay, pattern, and graph structure.

### 6. Replace candidate crop behavior

In the candidate drawer and DAM cards:

- replace `object-cover` with `object-contain`
- keep a bounded square or fixed-height container
- add a neutral background behind transparent or oddly sized images
- add a larger preview on hover or selection

### 7. Expand candidate review decisions

Replace the current binary review model:

- `approved`
- `rejected`

With:

- `approve_reference`
- `reject`
- `needs_ai_generation`
- `needs_overlay`
- `needs_crop_or_resize`
- `needs_better_source`

The UI must expose all six actions directly.

### 8. Add fidelity and hover metadata to the card model

Every candidate card must carry:

- `fidelity_status`
- `fidelity_note`
- `hover_caption`
- `hover_alt`
- `review_decision`
- `overlay_specs`
- `pattern_specs`

### 9. Add immediate DAM lane

Add a DAM surface that appears as soon as ingest finishes.

It should show:

- ingested item title
- source text excerpt
- linked concept chips
- top image candidates
- provenance badges
- fidelity state
- review decisions
- AI-needed and overlay-needed flags

### 10. Keep handoff packet backend-first

When the user clicks handoff:

- send only reviewed concepts and reviewed candidates
- include ingest ids
- include review decisions
- include fidelity info
- include overlay and pattern specs
- include hover fields

If backend is offline:

- preserve current JSON export fallback

## Preferred Backend Calls For The Existing App

Use these calls in this order:

1. `POST /api/research/ingest`
2. `POST /api/vision/spec-and-graph`
3. `POST /api/images/search/multi` or `POST /api/rwi/images/auto-search-needs`
4. `POST /api/images/validate`
5. `POST /api/images/analyze`
6. `POST /api/rwi/images/approve` or handoff packet route

The app should not invent a second persistence model for approved records.
