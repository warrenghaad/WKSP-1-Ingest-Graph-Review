# RWI Storage Architecture With Notion

Date: 2026-03-23

## The Correct Split

The storage model should be split into three layers:

- Notion = CMS, workflow pipeline, validation, editorial check, and production visibility
- PostgreSQL and Supabase = canonical runtime data and media records
- Graph layer = graph-ready and Neo-facing node structure

Replit sits upstream of these layers as the image-side worker in RWI.

## What Each Layer Is For

### 1. Notion: control plane

Notion should be used for:

- CMS organization
- workflow setup
- production queues
- validation checklists
- editorial review
- approval tracking
- visibility into what is ready, blocked, needs revision, or needs sourcing
- publishing and lesson-facing status views

Notion is where you manage the work.

### 2. PostgreSQL and Supabase: data plane

PostgreSQL and Supabase should be used for:

- raw ingest records
- normalized content records
- image needs
- candidate sets
- search logs
- quality scores
- review queue data
- approval payloads
- final approved asset records
- source and media metadata

This is where the actual structured data lives.

### 3. Graph layer: relationship plane

The graph layer should be used for:

- graph-ready packets
- source document nodes
- research concept nodes
- geometric element nodes
- image asset linkages
- overlay and pattern relationships
- later Neo-facing or wiki-node persistence

This is where the meaning and relationship structure lives.

## Replit's Job In This Architecture

Replit is the image-side worker in RWI.

It should:

- ingest text and files
- extract concepts
- derive image needs
- source candidate images
- generate prompts and specs
- run vision fidelity
- prepare overlay, pattern, and hover specs
- organize the first-pass packet
- write or hand off the packet into the correct storage layers

Replit should not become the final home of the data.

## Where Each Record Should Go

### Raw source material

Store in runtime data layer:

- `sources`
- `research_documents` when using batch research ingestion

Mirror in Notion as:

- research source page
- ingestion work item
- workflow record with status

### Normalized text and excerpts

Store in runtime data layer:

- `content_items`

Mirror in Notion as:

- lesson fragment entry
- research brief block
- writing or revision task

### Image and visual needs

Store in runtime data layer:

- `rwi_needs`

Mirror in Notion as:

- asset request
- image need card
- section-linked production task
- validation checklist item

### Candidate image sets

Store in runtime data layer:

- `rwi_image_candidate_sets`

Mirror in Notion as:

- candidate review task
- shortlist status
- curator notes

Notion should hold workflow-facing summaries and links, not the full raw candidate blob as the main source of truth.

### Search telemetry and cache

Store in runtime data layer:

- `image_provider_cache`
- `image_search_log`

Notion does not need to hold this as canonical data.

If useful, Notion can expose summary counters or pipeline health, but not the raw telemetry tables.

### Fidelity and validation outputs

Store in runtime data layer:

- `image_quality_scores`
- `image_review_queue`

Mirror in Notion as:

- validation status
- reviewer checklist
- fidelity summary
- escalation note

This is the place where Notion serves as a validation and checking layer.

### Approvals

Store in runtime data layer:

- `rwi_image_approvals`

Mirror in Notion as:

- approval state
- approver name or role
- review notes
- downstream ready flag

### Final approved assets

Store in runtime data layer:

- `media_assets`

Mirror in Notion as:

- CMS asset entry
- lesson-linked media reference
- publishing record

The binary and canonical metadata should remain in the app stack, even if Notion is the surface where editors and reviewers manage status.

### Graph packets and node structure

Store in graph-facing layer:

- `graph_nodes`
- graph-ready packets from the ingest and vision layers

Mirror in Notion as:

- graph summary
- node readiness status
- editorial interpretation or notes

## The Right Model For Notion

Notion should be treated as the CMS and workflow control plane.

That means Notion should own:

- status
- queue shape
- editorial flow
- validation checklists
- reviewer decisions
- human-readable summaries
- production visibility

But Notion should not replace:

- `rwi_needs`
- `rwi_image_candidate_sets`
- `rwi_image_approvals`
- `media_assets`
- `sources`
- `content_items`
- graph packets

Those still belong in the runtime data layer.

## The Right Model For Replit

Replit should organize its output according to all three layers at once:

1. write runtime records into PostgreSQL and Supabase
2. write graph-ready packets for the graph layer
3. write workflow and validation-facing references into Notion

That gives you:

- Notion for management and checking
- backend tables for actual data
- graph layer for relationships and future Neo structure

## The Practical Rule

When Replit creates something, ask three questions:

1. What is the runtime record?
2. What is the workflow or CMS record in Notion?
3. What is the graph-ready representation?

If those three are clear, the system stays organized.

## Simplest Version

- Notion = CMS and workflow
- Supabase and Postgres = canonical runtime records
- Graph layer = node and relationship structure
- Replit = ingest, sourcing, curation, and spec worker that writes into all three correctly
