# Semantic Image Workbench Functionality Registry

Status: working functionality registry
Date: 2026-03-23

This is not a source-of-truth file.
It records the strongest current evidence for the ingest/image/semantic workbench container.

## Semantic workbench definition

The semantic workbench is the ingest / image / semantic workbench.

It owns:

- ingest understanding
- highlights and annotations
- summarization
- concept extraction
- research prompting
- image sourcing
- image curation
- image pairing
- overlay and pattern specs
- fidelity analysis
- graph packets and semantic output packets
- content-shaping support for downstream assembly

It does not own the primary room shell or dispatch-first orchestration UI.

## Strongest functionality evidence

### 1. Image flows registry

Source:

- `/Users/samimajeed/mesopotamia-backend/WORKSPACE/_index/IMAGE_AGENTIC_FLOWS_REGISTRY.md`

Why it matters:

- inventories the image/semantic side as primary flows
- names search, candidates, approval, museum-grade generation, validation, pairing, image ingestion, and sourcing orchestrators
- is the clearest map of semantic workbench responsibilities

### 2. RWI image routes

Source:

- `/Users/samimajeed/mesopotamia-backend/server/routes/rwi-image-routes.mjs`

Why it matters:

- turns lesson or artifact context into queries
- runs multi-source search
- attaches related sources
- stores candidate sets
- supports approval through media ingest
- generates AI diagrams
- ingests freeform content and auto-searches from needs CSV

### 3. Multi-source image API

Source:

- `/Users/samimajeed/mesopotamia-backend/multi-source-image-api.js`

Why it matters:

- is a unified search layer across museums, archives, academic sources, AI generation, and local extracts
- produces candidate pools for curation

### 4. Curriculum image ingestion system

Source:

- `/Users/samimajeed/mesopotamia-backend/curriculum-image-ingestion-system.js`

Why it matters:

- maps curriculum semantics to image needs and search queries
- searches museums per need and computes coverage

### 5. Enhanced image validator

Source:

- `/Users/samimajeed/mesopotamia-backend/enhanced-image-validator.js`

Why it matters:

- scores and filters image candidates for relevance
- uses keywords, exclusions, period checks, trust weighting, and quality buckets
- is the fidelity-analysis layer

### 6. Pairing agent

Source:

- `/Users/samimajeed/mesopotamia-backend/pairing-agent.js`

Why it matters:

- consumes section needs
- searches museums
- saves images through existing APIs
- falls back to generated diagrams
- validates key sections and updates pairing state

### 7. Auto image pairing system

Source:

- `/Users/samimajeed/mesopotamia-backend/auto-image-pairing-system.js`

Why it matters:

- pairs graph information with images
- prefers museum search first and AI fallback second
- extracts search terms from titles, labels, tags, and content

### 8. RWI research system

Source:

- `/Users/samimajeed/mesopotamia-backend/rwi-research-system.js`

Why it matters:

- auto-generates section-specific research queries
- runs research in parallel
- creates research packages for downstream writing and assembly

### 9. RWI writing system

Source:

- `/Users/samimajeed/mesopotamia-backend/rwi-writing-system.js`

Why it matters:

- converts research into grade-appropriate draft sections
- enforces visually provable writing
- marks content as ready for image work

### 10. Replit textreader semantic surface

Source:

- `/Users/samimajeed/mesopotamia-backend/WORKSPACE/_index/REPLIT_TEXTREADER_LIVE_PATCH_BRIEF_2026-03-22.md`

Why it matters:

- names missing semantic data and review structures such as `overlay_specs`, `pattern_specs`, `hover_cards`, `graph_packet`, `vectorization_records`, `fidelity_status`, and `fidelity_note`
- defines the immediate DAM lane after ingest and before final approval

### 11. Blue hub Engine 3 feed contract

Source:

- `/Users/samimajeed/mesopotamia-backend/WORKSPACE/CODEX_WORKSPACE/outputs/S50K_SYSTEM_SITE/S50K_CARD_E3_PAIRING_ASSEMBLY_PREP_RUNBOOK.html`

Why it matters:

- shows which pairing, validation, and asset-prep outputs need to arrive before Engine 3 assembly
- clarifies the semantic workbench as a feeder into the control plane

## Functional buckets that belong in the semantic workbench

### Ingest and understanding

- file/text ingest interpretation
- highlight generation
- annotation generation
- summarization
- concept extraction
- graph packet prep

### Research and prompting

- research-query generation
- section research packets
- image search prompts
- source discovery and linking

### Image and visual workbench

- multi-source search
- museum sourcing
- candidate generation
- pairing
- fallback generation
- overlay specs
- pattern specs
- hover-card data

### Validation and curation

- fidelity scoring
- fidelity notes
- provenance-linked candidate records
- approval-ready candidate packets

### Content shaping for assembly

- draft-writing support
- visually provable writing checks
- readiness flags for downstream assembly

## What the semantic workbench should not own

- room shell
- prism shell
- dock and drawers as the main UI
- stage board as the main orchestration surface
- session orchestration as the user-facing control plane
- dispatch to Engine 4 as the primary handoff UI

## Bottom line

The semantic workbench is the semantic and image workbench that feeds the NASH room.

It understands, searches, curates, validates, and prepares.
The control plane stages, reviews, assembles, and dispatches.
