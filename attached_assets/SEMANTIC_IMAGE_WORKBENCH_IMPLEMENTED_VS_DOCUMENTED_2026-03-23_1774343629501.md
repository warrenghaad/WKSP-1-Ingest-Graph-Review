# Semantic Image Workbench Implemented vs Documented

Status: working implementation reality check
Date: 2026-03-23

This is not a source-of-truth file.
It separates what the semantic workbench already has in repo from what is still only described or planned.

## Semantic workbench scope

Ingest / Image / Semantic Workbench

It should own:

- ingest understanding
- highlights and annotations
- summarization
- concept extraction
- research prompting
- image sourcing and curation
- pairing
- overlay and pattern specs
- fidelity analysis
- graph packets and semantic output packets
- content shaping for downstream assembly

It should not own the primary room shell, main session shell, or dispatch-first orchestration UI.

## Implemented and live-wired in repo

### 1. RWI image search -> candidates -> approval flow

Evidence:

- `/Users/samimajeed/mesopotamia-backend/server/routes/rwi-image-routes.mjs`
- `/Users/samimajeed/mesopotamia-backend/server.js`
- `/Users/samimajeed/mesopotamia-backend/WORKSPACE/_index/IMAGE_AGENTIC_FLOWS_REGISTRY.md`

What exists:

- artifact/query search
- candidate set creation
- related-source attachment
- candidate approval handling
- AI diagram generation
- freeform ingest and needs-based search helpers
- explicit server wiring through `registerRwiImageRoutes`

Meaning:

- this is a real semantic-workbench runtime surface, not just a note

### 2. Multi-source image search is implemented

Evidence:

- `/Users/samimajeed/mesopotamia-backend/multi-source-image-api.js`
- `/Users/samimajeed/mesopotamia-backend/WORKSPACE/_index/IMAGE_AGENTIC_FLOWS_REGISTRY.md`

What exists:

- unified search across museums, archives, academic sources, AI generation, and local extracts
- candidate pool generation for downstream review

Meaning:

- the semantic workbench already has a substantial sourcing layer

### 3. Core museum search / save / validation flows are live

Evidence:

- `/Users/samimajeed/mesopotamia-backend/WORKSPACE/_index/IMAGE_AGENTIC_FLOWS_REGISTRY.md`
- registry statuses for:
  - `Core Museum Search + Save + Validation Flow`
  - `Museum-Grade Image Generation Flow`

Meaning:

- the image workbench already has live-wired museum-side infrastructure
- the semantic workbench is not starting from zero on sourcing or validation

## Implemented as scripts or worker entrypoints

### 4. Pairing agent exists

Evidence:

- `/Users/samimajeed/mesopotamia-backend/pairing-agent.js`

What exists:

- fetch pending `section_needs`
- museum search
- save image through existing APIs
- optional validation for key sections
- update pairing state in Supabase

Meaning:

- pairing/curation is implemented as a worker-style process
- it is not yet the main user-facing semantic-workbench shell

### 5. Curriculum image ingestion exists

Evidence:

- `/Users/samimajeed/mesopotamia-backend/curriculum-image-ingestion-system.js`
- `/Users/samimajeed/mesopotamia-backend/WORKSPACE/_index/IMAGE_AGENTIC_FLOWS_REGISTRY.md`

What exists:

- curriculum/image-need mapping
- museum search per image need
- coverage computation

Meaning:

- the semantic workbench already has image-ingest logic as a script-entry system

### 6. Enhanced image validator exists

Evidence:

- `/Users/samimajeed/mesopotamia-backend/enhanced-image-validator.js`

What exists:

- relevance scoring
- keyword and exclusion checks
- period checks
- trust weighting
- quality buckets

Meaning:

- fidelity analysis is implemented as real code

### 7. RWI research system exists

Evidence:

- `/Users/samimajeed/mesopotamia-backend/rwi-research-system.js`

What exists:

- section-specific research query generation
- research-package creation
- router endpoints

Meaning:

- research prompting and package generation are implemented
- the design and model assumptions inside the script may still need review, but the capability exists

### 8. RWI writing system exists

Evidence:

- `/Users/samimajeed/mesopotamia-backend/rwi-writing-system.js`

What exists:

- research-to-writing conversion
- grade-adjusted writing rules
- image-needed signaling
- router endpoints

Meaning:

- content shaping for downstream image/assembly work is implemented

### 9. Auto image pairing exists as legacy code

Evidence:

- `/Users/samimajeed/mesopotamia-backend/auto-image-pairing-system.js`
- `/Users/samimajeed/mesopotamia-backend/WORKSPACE/_index/IMAGE_AGENTIC_FLOWS_REGISTRY.md`

Status:

- present in repo
- explicitly marked `legacy-not-wired` in the registry

Meaning:

- capability exists as code, but not as current live wiring

## Implemented semantic-workbench-adjacent UI surface

### RWI Studio shell exists

Evidence:

- `/Users/samimajeed/mesopotamia-backend/public/rwi-studio.html`

What exists:

- a split-panel workspace container for RWI tools
- explicit RWI app and API references in the shell

Meaning:

- there is already a UI precedent for the semantic workbench housing multiple tools together

## Documented or desired, but not yet verified as a unified semantic-workbench runtime

### 1. Replit Textreader patch target

Evidence:

- `/Users/samimajeed/mesopotamia-backend/WORKSPACE/_index/REPLIT_TEXTREADER_LIVE_PATCH_BRIEF_2026-03-22.md`

What is documented:

- immediate DAM lane
- six review decisions
- ingest -> vision spec -> overlay/pattern pipeline
- concept board and candidate drawer expansion
- data fields like `overlay_specs`, `pattern_specs`, `hover_cards`, `graph_packet`, `vectorization_records`, `fidelity_status`, and `fidelity_note`

Status:

- external live app patch brief
- not verified here as a local unified semantic-workbench implementation

### 2. Blue hub Engine 3 feed contract

Evidence:

- `/Users/samimajeed/mesopotamia-backend/WORKSPACE/CODEX_WORKSPACE/outputs/S50K_SYSTEM_SITE/S50K_CARD_E3_PAIRING_ASSEMBLY_PREP_RUNBOOK.html`

What is documented:

- semantic-workbench outputs should arrive as candidate pairings, validated assets, and lesson package feed material before Engine 3 assembly

Status:

- useful boundary contract
- not itself the semantic-workbench runtime

## Main gaps between implemented semantic-workbench behavior and documented semantic-workbench behavior

- the semantic workbench exists more as routes, scripts, and worker entrypoints than as one coherent workbench app
- the six-decision review flow is not yet verified as a unified local semantic-workbench surface
- the immediate DAM lane is still documented as a patch target rather than confirmed local runtime behavior
- some important flows are live-wired, but others remain script-entry only
- `auto-image-pairing-system.js` exists but is marked legacy and not wired
- external Replit textreader behavior is referenced, not owned locally here

## Bottom line

The semantic workbench is more implemented than the control plane in terms of semantic/image functionality.

What already exists is substantial:

- live-wired image routes
- multi-source search
- museum search/save/validation
- pairing workers
- curriculum image ingestion
- research generation
- writing generation
- validator and pairing logic

What is still missing is not capability so much as consolidation:

- one unified semantic-workbench surface
- one review model tying ingest, DAM, fidelity, and semantic outputs together
- a cleaner handoff contract into the control plane without scattering behavior across scripts, routes, and patch briefs
