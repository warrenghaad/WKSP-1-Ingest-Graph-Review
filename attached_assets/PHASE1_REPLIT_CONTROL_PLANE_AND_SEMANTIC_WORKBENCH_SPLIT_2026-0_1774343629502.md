# Phase I Replit Control Plane + Semantic Workbench Split

Status: working architecture note
Date: 2026-03-23

This is not a source-of-truth file.
It is a working split document created from the current evidence set.

## Purpose

Phase I uses two Replit containers so the workspace shell can evolve separately from the ingest/image/semantic stack.

This split is meant to reduce disturbance while both sides are still changing.

## The Split

### Control Plane / NASH Room Shell

`Orchestrator / NASH Room Shell / Control Plane`

This container is responsible for:

- room and prism UI
- session state
- queue state
- provenance visibility
- review surfaces
- candidate trays and DAM lanes
- send / receive
- routing and dispatch
- package prep
- assembly surfaces

This container is not responsible for semantic understanding.

### Semantic Image Workbench

`Ingest / Image / Semantic Workbench`

This container is responsible for:

- ingest
- annotation
- summarization
- highlights
- concept extraction
- research prompting
- image sourcing
- image curation
- overlay and pattern specs
- fidelity analysis
- graph packets
- semantic distillation support

This container is not responsible for the room shell or primary orchestration UI.

## Why this split works

The split follows a clean fault line:

- `Control Plane / NASH Room Shell` handles things that are mechanical, visible, routed, staged, or dispatched.
- `Semantic Image Workbench` handles things that are interpretive, semantic, generative, curatorial, or research-driven.

That keeps the main UI stable while the ingest/image workbench continues to improve.

## Working model

1. The control plane receives material or references.
2. The control plane preserves state, queue context, and provenance.
3. The control plane sends work packets to the semantic workbench.
4. The semantic workbench returns semantic outputs, candidates, specs, and reviewable packets.
5. The control plane stages, reviews, assembles, and dispatches those outputs.

## Control Plane source cluster

Primary evidence:

- `nash-room.html`
- `engine3-builder.html`
- `REPLIT_TEXTREADER_LIVE_PATCH_BRIEF_2026-03-22.md`
- `ENGINE_3_WIKINODE_PRESENTATION_PLAN.md`
- `ENGINE_3__BUILDER.md`
- `wiki-node-interface-prism-nash-room.md`
- `stage-map.md`
- `S50K_CARD_E3_PAIRING_ASSEMBLY_PREP_RUNBOOK.html`

## Semantic Image Workbench source cluster

Primary evidence:

- `IMAGE_AGENTIC_FLOWS_REGISTRY.md`
- `server/routes/rwi-image-routes.mjs`
- `multi-source-image-api.js`
- `curriculum-image-ingestion-system.js`
- `enhanced-image-validator.js`
- `pairing-agent.js`
- `auto-image-pairing-system.js`
- `rwi-research-system.js`
- `rwi-writing-system.js`
- `REPLIT_TEXTREADER_LIVE_PATCH_BRIEF_2026-03-22.md`
- `S50K_CARD_E3_PAIRING_ASSEMBLY_PREP_RUNBOOK.html`

## Shared boundary surfaces

These surfaces touch both containers and need explicit contracts:

- concept board
- candidate drawer
- immediate DAM lane
- handoff tray
- pairing approval packets
- lesson package assembly prep
- Engine 4 dispatch

## Non-goals for Phase I

- do not turn Replit into the final Unreal implementation
- do not merge the control plane and semantic workbench back together
- do not let the control plane silently take over semantic responsibilities
- do not let the semantic workbench silently become the main UI shell

## Next documents

- `CONTROL_PLANE_NASH_ROOM_FUNCTIONALITY_REGISTRY_2026-03-23.md`
- `SEMANTIC_IMAGE_WORKBENCH_FUNCTIONALITY_REGISTRY_2026-03-23.md`
