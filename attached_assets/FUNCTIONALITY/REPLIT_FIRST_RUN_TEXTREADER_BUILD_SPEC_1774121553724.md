# Replit First-Run Textreader Build Spec

Date: 2026-03-21

## Role

Build Replit as a narrow first-run worker for text-to-image prep.

It should:

- read raw text, briefs, and excerpts
- split them into atomic visual concepts
- generate search queries and AI prompt packs
- let the user quickly curate promising results
- hand selected packets into the existing backend

It should not become:

- the canonical RWI system
- the canonical NASH system
- the canonical DAM
- the final lesson editor
- the approval source of truth

Canonical persistence stays in the app backend and Supabase.

## Hard Guardrails

- Replit is a worker, not a source of truth.
- Supabase remains canonical for `content_items`, `sources`, `media_assets`, `rwi_needs`, candidate sets, and approvals.
- Replit may keep temporary local draft state only.
- Successful images should persist to Supabase first.
- Notion is optional and should only mirror approved outputs.
- Candidate sets and approvals must stay separate.
- AI-generated images must be explicitly labeled as generated.
- Every selected result must carry provenance and accuracy labels.

## Functional Scope

### Inputs

Support:

- pasted text
- research brief text
- lesson fragment text
- uploaded `.txt`, `.md`, `.docx` extract
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
- `run search`
- `refine query`
- `generate prompt`
- `mark reference`
- `mark ai-only`
- `ready for handoff`
- `send to backend`

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

## Behavior

Default flow:

1. User pastes text.
2. App extracts concepts.
3. User reviews concepts.
4. App prepares search queries and prompt packs.
5. User runs search on selected concepts.
6. User selects references or AI directions.
7. User sends packet to backend.

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
