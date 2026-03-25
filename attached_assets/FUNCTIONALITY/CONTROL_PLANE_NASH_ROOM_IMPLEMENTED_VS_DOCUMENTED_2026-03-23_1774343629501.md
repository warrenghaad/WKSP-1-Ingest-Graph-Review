# Control Plane / NASH Room Implemented vs Documented

Status: working implementation reality check
Date: 2026-03-23

This is not a source-of-truth file.
It separates what the control plane already has in repo from what is still only described or planned.

## Control plane scope

Orchestrator / NASH Room Shell / Control Plane

It should own:

- room and prism shell behavior
- session and queue state
- provenance-visible review
- candidate and DAM surfaces
- assembly surfaces
- routing and dispatch
- package prep before downstream delivery

It should not own semantic understanding, research interpretation, or image sourcing logic.

## Implemented and inspectable in repo

### 1. Local Nash Room shell exists

Evidence:

- `/Users/samimajeed/mesopotamia-backend/00-FINAL1_SYSTEM - FUNCTIONALITY AND SETUP/EUCLID_STACK_SETUP/ui/engine-suite/nash-room.html`
- `/Users/samimajeed/mesopotamia-backend/00-FINAL1_SYSTEM - FUNCTIONALITY AND SETUP/EUCLID_STACK_SETUP/ui/engine-suite/shared-store.js`

What exists:

- `Node Registry`
- `Graph Surface`
- `Link + Dispatch`
- explicit send-to-eTextbook action
- local persisted state through the shared store

Important caveat:

- the page itself says the standalone Nash Room is deprecated and pushes the user into Engine 2 RWI

Meaning:

- there is a real control-plane-like shell prototype
- the repo still collapses some control-plane responsibilities back into Engine 2

### 2. Local Engine 3 builder shell exists

Evidence:

- `/Users/samimajeed/mesopotamia-backend/00-FINAL1_SYSTEM - FUNCTIONALITY AND SETUP/EUCLID_STACK_SETUP/ui/engine-suite/engine3-builder.html`
- `/Users/samimajeed/mesopotamia-backend/00-FINAL1_SYSTEM - FUNCTIONALITY AND SETUP/EUCLID_STACK_SETUP/ui/engine-suite/shared-store.js`

What exists:

- `Teacher Deliverable Pipeline`
- `Section Stage Board`
- `Section Builder`
- `Distillation Outputs`
- queue pull
- send active lesson to Engine 4
- section-level queueing to Engine 4

Meaning:

- the control plane already has a concrete assembly/stage shell in HTML
- it is interactive, but still local-store driven and not yet the separated Replit control plane

### 3. Wiki presentation surface exists

Evidence:

- `/Users/samimajeed/mesopotamia-backend/public/wiki-presentation-generator.html`

What exists:

- a standalone presentation generator UI
- template selection and presentation-oriented shell behavior

Meaning:

- the presentation side of Engine 3 is not just conceptual
- it exists as a real local surface, even if it is not yet the NASH-room-first shell

### 4. RWI studio container exists

Evidence:

- `/Users/samimajeed/mesopotamia-backend/public/rwi-studio.html`

What exists:

- a split-panel container for RWI-related surfaces
- an existing workspace shell pattern for housing related tools together

Meaning:

- there is already a lightweight precedent for a multi-panel app shell
- this is relevant to control-plane architecture even though it is not the final NASH room

### 5. Storyboard API is live-wired

Evidence:

- `/Users/samimajeed/mesopotamia-backend/storyboard-api.js`
- `/Users/samimajeed/mesopotamia-backend/server.js`

What exists:

- lesson feed routes
- storyboard routes
- shape evolution routes
- server wiring for the storyboard API

Meaning:

- the control plane already has supporting runtime services for lesson/storyboard assembly
- these are real backend pieces, not just UI sketches

## Implemented elsewhere or externally, but not verified here as a local control-plane surface

### Replit Textreader live patch target

Evidence:

- `/Users/samimajeed/mesopotamia-backend/WORKSPACE/_index/REPLIT_TEXTREADER_LIVE_PATCH_BRIEF_2026-03-22.md`

What it says:

- the app is publicly reachable
- `Textreader` route exists
- concept board and candidate drawer already exist
- session creation works through `POST /api/textreader/sessions`

Meaning:

- there is a real external surface that behaves like part of the control plane
- but this repo note is a patch brief, not the local source code of that app

## Documented or planned, but not verified as implemented control-plane runtime

### 1. Engine 3 as compositional workspace

Evidence:

- `/Users/samimajeed/mesopotamia-backend/WORKSPACE/_index/ENGINE_3_WIKINODE_PRESENTATION_PLAN.md`

What is documented:

- drag-and-drop lesson/wiki nodes on canvas
- inspect alternatives before commit
- persist node placement and source attribution
- cross-engine inspector
- publish to Engine 4 handoff

Status:

- planning-complete document
- not proof of completed runtime behavior

### 2. Engine 3 builder registry statement

Evidence:

- `/Users/samimajeed/mesopotamia-backend/PILOT FINALIZATION/EUCLID_ FINALIZE MESAPOTAMIA /reconciliation-system/registry/engines/ENGINE_3__BUILDER.md`

What is documented:

- lesson builder
- assembler
- wiki-node/world generator
- structured presentation engine
- Unreal Engine 5 preference

Status:

- strong role definition
- not itself a runtime surface

### 3. Room + prism grammar

Evidence:

- `/Users/samimajeed/mesopotamia-backend/docs/ui-sys/reference-drops/2026-03-21-user-build-inputs/source/wiki-node-interface-prism-nash-room.md`
- `/Users/samimajeed/mesopotamia-backend/stage-map.md`

What is documented:

- room as single canvas workspace
- prism as 3D sidebar/category object
- reorderable working order
- typed directed edges
- dock, drawers, inspector, draggable windows

Status:

- defining grammar
- not verified as implemented in the local runtime

### 4. Blue hub Engine 3 runbook

Evidence:

- `/Users/samimajeed/mesopotamia-backend/WORKSPACE/CODEX_WORKSPACE/outputs/S50K_SYSTEM_SITE/S50K_CARD_E3_PAIRING_ASSEMBLY_PREP_RUNBOOK.html`

What is documented:

- Engine 3 as quality gate and assembly prep before rendering
- pairing approval and lesson package compilation for Engine 4

Status:

- operational runbook/reference
- not direct proof of a unified control-plane shell

## Main gaps between implemented control-plane behavior and documented control-plane behavior

- no verified local `Room + Prism` runtime matching the newer UI corpus
- no actual 3D prism sidebar/component panel
- no clean standalone control-plane boundary; current repo still mixes control-plane and Engine 2 concerns
- no verified six-decision review UI in the local control-plane surfaces
- no verified local immediate DAM lane in the control-plane shell
- no single NASH room app that unifies shell, review, assembly, and handoff under the newer model

## Bottom line

The control plane is partially implemented.

What exists now is a set of real but fragmented shells, helper APIs, and assembly surfaces:

- `nash-room.html`
- `engine3-builder.html`
- `wiki-presentation-generator.html`
- `rwi-studio.html`
- `storyboard-api.js`

What is still mostly documented is the newer, cleaner control-plane model:

- true `Room + Prism`
- explicit control-plane separation from the semantic workbench
- richer review/DAM behavior
- the NASH room as the main place where you can do
