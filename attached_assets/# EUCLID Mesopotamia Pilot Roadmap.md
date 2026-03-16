# EUCLID Mesopotamia Pilot Roadmap

**Version:** 1.0 (March 2026)
**Status:** WORKING — Tracks remaining tasks for 8-week Mesopotamia pilot (Grades 3–5)
**Context:** Architecture phase is complete (SSOT v7.0, SRQ v2.0, Visual Production Spec v1.0). This document tracks the transition from architecture to production.

---

## Completed Architecture

| Deliverable | Version | Status |
|------------|---------|--------|
| Lesson section architecture | SSOT v7.0 | ✅ Finalized — 15 sections, visual rhetoric, distillation pipeline |
| Research methodology | SRQ v2.0 | ✅ Finalized — notch-first scanning, five MAGIC investigations, routing |
| Visual production spec | v1.0 | ✅ Finalized — cell library, image SRQs, production workflow |
| GECD four-layer node schema | PATCH v5.2 | ✅ Finalized — Observable, Construction, Gestalt, Register layers |
| Ontology governance system | React dashboard | ✅ Built — 12 constraints, reconciliation protocol |
| Drift detection tool | euclid_section_patch.py | ✅ Built — four modes including migration audit |
| Project instructions | v3.0 | ✅ This session — replaces outdated bot instructions |
| Framework + Schema | v5.1 | ✅ Stable — theoretical architecture settled |

---

## Remaining Pilot Tasks

### TRACK 1: Research Infrastructure — SRQ Asset Collection Engine

**Goal:** The SRQ v2.0 defines HOW to investigate. This track builds the tooling and methodology to execute investigations at scale, amassing the bulk asset library that populates the curriculum.

#### Task 1.1: Expand SRQ for Bulk Asset Collection

The five MAGIC-line investigations need to collect not just lesson-ready content but a **deep asset library** — the raw material from which lessons are assembled. The SRQ should be expanded with collection targets organized by category:

**Category i — Civilization Proper Nouns:**
For each civilization-period notch, collect a controlled vocabulary of:
- Place names (cities, temples, palaces, rivers, regions)
- Person names (rulers, scribes, deities, historical figures)
- Institution names (temples, schools, guilds, offices)
- Artifact type names (in original language where attested + English)
- Period names and date ranges (with competing chronologies noted)
- Material/technique names

These become the **tagging vocabulary** for everything else. Without standardized proper nouns, the database can't cross-reference.

**Category ii — Assets Per MAGIC Variable:**
For each variable at each notch, collect:
- **M assets:** Mathematical tablets, calculation methods, measurement standards, formulas, proofs, scribal exercises, astronomical records, survey records
- **A assets:** Artistic artifacts with high visual quality images, style descriptions, technique analyses, workshop attributions, material analyses
- **G assets:** Geometric analyses of forms, GEA/GEM decomposition records, construction sequence evidence, dimensional rendering analyses
- **I assets:** Mythological texts (translated), hymns, ritual descriptions, temple records, theological treatises, cosmological diagrams, festival calendars
- **C assets:** Royal inscriptions, administrative records, legal codes, trade regulations, guild records, patronage evidence, sumptuary laws, access restrictions

**Category iii — Artifacts with GE,C,D Notation + Intensification Detection:**
For every collected artifact:
- Tag with GE,C,D: which element(s), what carrier, what dimensional rendering
- Note carrier type, material, context, date, museum/accession
- Flag GE,C,D nodes that show **intensification** — where production volume, carrier diversity, or dimensional range is expanding relative to the prior period
- Semi-automate: develop templates/checklists that make GE,C,D tagging fast, with intensification thresholds defined so flagging is consistent

The intensification flags are what surface **candidate notches** for lessons. A GE,C,D configuration that shows carrier proliferation + dimensional expansion + production volume increase = high |Δ| = strong lesson candidate.

**Category iv — DII (Discovery, Innovation, Invention):**
Collect with explicit DII classification:
- **Discoveries:** Mathematical truths recognized (timeless). Tag with GEK.
- **Innovations:** Culture-specific paths toward truths. Tag with period + method.
- **Inventions:** Stabilized functional mechanisms. Tag with GEK × GEK-T × GEA/GEM decomposition + STEM notch analysis.

Each invention entry should include: what it does, how it works, who controlled it, what prerequisites it assumes (which prior B2 properties), what tier of GEK-T complexity.

**Category v — Spatial Imagery (Filtered):**
Collect visual/spatial material BUT apply a relevance filter. Everything is spatial in some sense — collect only material where the spatial properties are **doing pedagogically significant work**:
- Geometric patterns that demonstrate specific GEA/GEM compositions
- Architectural forms that demonstrate structural principles
- Objects where the geometry of the form determines the function
- Artifacts where construction geometry is visible (compass marks, grid evidence, tool traces)
- NOT: general photographs of objects that happen to exist in space

The filter criterion: **would this image teach something about geometry that the image of a different object in the same category would NOT teach?** If the answer is no, it's generic spatial content. If yes, it's GE,C,D-relevant.

**Category vi — DII Patterns Across Material Culture:**
Specifically collect and track:
- Textile patterns (weaving = tessellation, rotation, reflection algorithms)
- Jewelry and personal ornament (miniaturization of GEM compositions)
- Tomb/funerary architecture (where sacred geometry is most deliberately deployed)
- Hair styles and body decoration (embodied geometry, social signaling)
- Pottery decoration sequences (where production volume is highest and evolution most visible)
- Seal designs (the densest single source of GEA/GEM evidence in Mesopotamia)

The key analytical move: **follow the attenuation lines.** When an invention appears in one material domain, trace whether the same geometric principle is appearing in other domains simultaneously. Are textile patterns and architectural forms converging on the same GEA/GEM composition? Are seal designs and pottery decoration intensifying in parallel? Where structures merge across material categories = evidence of GEpHR intensification driving toward GEK formalization. These convergence points are the strongest lesson candidates because they demonstrate the circumnutating relationship empirically.

#### Task 1.2: Build Asset Collection Templates

Create standardized collection templates (JSON or YAML) for each category above. Each template should include:
- Required fields (non-negotiable for a valid entry)
- MAGIC tag fields (weight vector or at minimum primary/secondary line tags)
- GE,C,D fields (element, carrier, dimension)
- DII classification field
- Image reference field (museum API result, URL, or generation flag)
- Intensification flag (boolean + evidence string)
- Cross-reference fields (links to related entries in other categories)

#### Task 1.3: Semi-Automated Intensification Detection

Define thresholds for intensification flagging:
- Carrier count increase > X per time slice
- New carrier type adoption
- Dimensional range expansion (e.g., 2D → 3D for previously 2D-only element)
- Production volume proxy increase (number of museum specimens per period)
- Geographic spread expansion

Build a simple dashboard or spreadsheet that tracks these metrics per GEA/GEM per period, with automatic flagging when thresholds are crossed.

---

### TRACK 2: UI/UX — Image Sourcing and Design Interface

**Goal:** Build the interface through which images are sourced, reviewed, and tagged for the curriculum.

#### Task 2.1: Image Sourcing UI

**What it does:**
- Presents the museum API chain results (Met → Smithsonian → BM → Louvre → Wikimedia) for a given search query
- Allows browsing, filtering by carrier type, period, material
- Allows selection and tagging: tag each selected image with GE,C,D, MAGIC weights, section destination(s), cell category
- Flags gaps where no museum image exists → routes to AI generation queue
- Stores selections in the asset library with full attribution

**Design considerations:**
- Grid view for browsing (thumbnail + metadata)
- Detail view for selection (full image + all fields + tagging interface)
- Batch operations (tag multiple images with same GE,C,D)
- Integration with the cell library (mark an image as a source for a specific cell)

#### Task 2.2: Image Design/Generation UI

**What it does:**
- For gaps flagged by the sourcing UI, presents the AI generation interface
- Takes cell components (deity + setting + figures + objects + overlays) and composites scene illustrations
- Provides prompt templates based on section specifications (A4 scene = "ultra-realistic, [SETTING], [ACTIVITY], [N] figures, [OBJECTS], archaeological accuracy")
- Allows iterative refinement (adjust prompt, regenerate, compare)
- Tags generated images with explicit "Reconstruction" label
- Stores in cell library with generation metadata

#### Task 2.3: Cell Library Manager

**What it does:**
- Visual inventory of all cells (deity poses, settings, figures, objects, overlays)
- Filter by civilization, category, usage count
- Track which sections consume each cell
- Identify missing cells for upcoming weeks
- Track production status (designed / in-progress / complete)

---

### TRACK 3: Lesson Creation — Templates and Storytelling

**Goal:** Build the authoring environment where researched content becomes lessons across all five distillation levels.

#### Task 3.1: Figma Template Assembly

**What it does:**
- Assemble lesson creation templates from best Community designs in Figma
- No single template matches EUCLID's dual-register architecture — assembly strategy from multiple free templates (CC BY 4.0)
- Templates needed:
  - **eTextbook page** (Level 5): magazine-style layout, image-heavy, narrative prose, sidebar annotations, GEA/GEM diagram slots
  - **Teacher script page** (Level 4): two-column (script left, notes right), timing markers, image references
  - **Slideshow template** (Level 3): full-bleed image with minimal text overlay, construction step sequences
  - **Worksheet template** (Level 2): structured response spaces, image placeholders, vocabulary boxes, construction grids
  - **Summary template** (Level 1): one-page-per-day dense reference, section names + one-liners

**Design principles:**
- Visual-first: images dominate, text annotates
- Consistent visual language across levels (same color coding, same typography hierarchy)
- Section-coded: each section has a visual identity (color bar, icon) that persists across all levels
- MAGIC weight visualization: subtle bar/dot indicator showing the section's MAGIC profile

#### Task 3.2: Story Templates

**What it does:**
- Narrative templates for sections that tell stories (A1 myth, A4 life scenes, B4 historical trajectory)
- A1 specifically needs a **3-Act structure template** for the myth video:
  - Act 1: World Before (setting + problem)
  - Act 2: Divine Encounter (deity + element reveal)
  - Act 3: World After (element in human life)
- A4 needs **scene composition templates** per sub-section (who is present, what activity, what objects, what setting)
- B4 needs **timeline narrative templates** (chronological story of a functional property across time)

---

### TRACK 4: Content Infrastructure — Text Editor + Image Renderer

**Goal:** Build the authoring tool where content is written, images are placed, and the connection between text and visual is live.

#### Task 4.1: Rich Text Editor (Tiptap-based)

**What it does:**
- WYSIWYG editing for eTextbook content (Level 5)
- Section-aware: knows which section you're editing, displays MAGIC weight profile, enforces section constraints
- MAGIC tag insertion: inline tagging of passages with MAGIC line tags (m_, a_, g_, i_, c_)
- GEA/GEM notation support: inline notation rendering (e.g., `GEM.8star(GEA.square×2, rot=45°)`)
- Image slot insertion: designated image positions with type labels (MUS, SCN, DGM, CON, MOT, OVR)
- Cross-section reference links: "See A2" links that resolve across sections
- Distillation markers: tag which content persists at which level (Level 5 only, Level 4+, Level 3+, all levels)

#### Task 4.2: Image Renderer with Hover-to-View

**What it does:**
- Hovering over a tagged word, phrase, or proper noun shows a preview image
- The image is the **asset** associated with that term in the asset library
- Images are downloadable from the hover preview
- Images are appendable to different front-facing HTML deliverables (eTextbook, slideshow, worksheet)
- This creates a **visual glossary** that is both an authoring aid and a student-facing feature:
  - Author sees: "When I type 'Ishtar Gate,' the system shows me the Pergamon Museum photo and I can drag it into my eTextbook page"
  - Student sees: "When I hover over 'Ishtar Gate' in the eTextbook, I see the actual artifact"

**Implementation:**
- Asset library lookup by proper noun / tagged term
- Tooltip/popover component with image preview + metadata (museum, accession, date)
- "Insert here" action that places the image at current cursor position in the editor
- "Copy to clipboard" action for use in external tools
- "Append to [deliverable]" action that adds the image to a specific output document

#### Task 4.3: Deliverable Renderer

**What it does:**
- Takes Level 5 content from the text editor and renders each distillation level:
  - Level 5 → eTextbook HTML/PDF
  - Level 4 → Teacher Script document
  - Level 3 → Slideshow (PPTX or HTML slides)
  - Level 2 → Student Worksheet (printable PDF)
  - Level 1 → Teacher Summary (one-page PDF)
- Each renderer applies the distillation rules (what content persists at each level)
- Images are placed at the appropriate positions for each level
- MAGIC tags persist as metadata at all levels

---

### TRACK 5: Information Architecture — Nash Room and Data Flow

**Goal:** Finalize where information lives, how it moves between systems, and how nothing gets lost.

#### Task 5.1: Storage Architecture

```
LAYER          SYSTEM              WHAT LIVES HERE
──────         ──────              ────────────────
Source         File system /       Raw research: PDFs, articles, images,
               Obsidian vault      notes, conversation exports. NEVER
                                   modified. Copy-on-ingest.

Graph DB       SurrealDB           GE,C,D nodes (four-layer schema),
               (Docker-compose)    MAGIC weight profiles, DII entries,
                                   artifact records, proper noun registry,
                                   cross-references. The SINGLE SOURCE
                                   of structured curriculum data.

Asset          Private cloud       Images: museum-sourced, AI-generated,
Library        (Docker volume)     cell library components, overlays,
                                   diagrams. Referenced by graph nodes.

Lesson         SurrealDB +         Assembled lesson content per section
Assembly       File system         per week. References graph nodes and
                                   asset library. This is the Nash Room
                                   working space.

Deliverables   /outputs            Rendered distillation levels (eTextbook,
                                   script, slides, worksheet, summary).
                                   Generated from lesson assembly.
```

#### Task 5.2: Data Flow — How Information Moves

```
RAW RESEARCH
    │
    ▼ (copy-on-ingest, never modify source)
RWI PIPELINE (7 agents)
    │
    ├─── Agent 1–5: Read, assess, extract, tag, prioritize
    │
    ├─── Agent 6: Image specification → Studio API chain
    │
    └─── Agent 7: Node assembly (four-layer schema)
            │
            ▼
    GRAPH DB (SurrealDB)
        │
        ├─── Proper noun registry (Category i)
        ├─── MAGIC variable assets (Category ii)
        ├─── GE,C,D tagged artifacts (Category iii)
        ├─── DII classified entries (Category iv)
        ├─── Spatial imagery (filtered) (Category v)
        └─── Material culture patterns (Category vi)
                │
                ▼
    NASH ROOM (Lesson Assembly)
        │
        ├─── Drag-and-drop from graph nodes
        ├─── Section-aware editing (SSOT v7.0 constraints)
        ├─── Image placement from asset library
        ├─── MAGIC tag annotation
        └─── Distillation level marking
                │
                ▼
    DELIVERABLE RENDERING
        │
        ├─── Level 5: eTextbook
        ├─── Level 4: Teacher Script
        ├─── Level 3: Slideshow
        ├─── Level 2: Worksheet
        └─── Level 1: Summary
```

#### Task 5.3: How Nothing Gets Lost

The critical failure mode is **information entering the system and not reaching the graph database** — research that was done but never tagged, images that were sourced but never linked, insights from conversations that never became nodes.

**Safeguards:**

1. **Ingest logging:** Every file that enters the RWI pipeline is logged with timestamp, source, and processing status (queued / processing / complete / failed). Failed items are re-queued, not silently dropped.

2. **Orphan detection:** Periodic scan of the asset library for images not referenced by any graph node. Periodic scan of graph nodes with empty image fields. Both produce action queues.

3. **Conversation harvesting:** After research conversations (with Claude, Gemini, or collaborators), key findings are extracted and entered as graph nodes. The conversation itself is stored in Source but the structured findings must migrate to the graph. This is currently manual — automating it is a future task.

4. **Cross-reference integrity:** Every graph node that references another node (e.g., an artifact referencing a GEA/GEM, a DII entry referencing a carrier) must have a valid target. Broken references are flagged by the integrity checker.

5. **Version provenance:** Every graph node carries a `source` field documenting where the information came from (which document, which conversation, which museum database). If a node can't cite its source, it's flagged for verification.

---

### TRACK 6: Database and Integration

#### Task 6.1: SurrealDB Schema Bootstrap

Stand up the database with the v5.2 four-layer schema and import the first hand-coded nodes. Docker-compose, offline-first priority.

#### Task 6.2: MCP Integration

Use SurrealDB's built-in MCP as "syntax titration" before building custom MCP. Four-phase workflow:
1. CLI infrastructure
2. Application integration
3. Classroom pilot testing
4. Custom MCP (if needed — deferred until pilot reveals actual usage patterns)

#### Task 6.3: Next.js Frontend Shell

Stand up the basic Next.js application shell with:
- Authentication (teacher login)
- Section-aware page routing (each section has a URL)
- Asset library browser component
- Text editor component (Tiptap)
- Image renderer component (hover-to-view)

---

## Task Priority Sequence

```
PHASE      TASKS                    WHY THIS ORDER
──────     ──────                   ───────────────
Phase 1    1.1 (SRQ expansion)      Can't collect assets without
           1.2 (collection templates) knowing what to collect

Phase 2    2.1 (image sourcing UI)   Can't populate cell library
           2.3 (cell library mgr)    without sourcing interface

Phase 3    5.1 (storage architecture) Must know where things go
           5.2 (data flow)           before building tools that
           6.1 (SurrealDB bootstrap)  create things

Phase 4    4.1 (text editor)         Authoring tools depend on
           4.2 (image renderer)      storage being ready
           4.3 (deliverable renderer)

Phase 5    3.1 (Figma templates)     Templates depend on knowing
           3.2 (story templates)      what the renderer outputs

Phase 6    1.3 (intensification)     Semi-automation depends on
           2.2 (image generation)     having enough manual data
           6.2 (MCP integration)      to calibrate thresholds

Phase 7    5.3 (loss prevention)     Integrity checking is
           6.3 (Next.js shell)        meaningful only with data
                                      in the system
```

**The first concrete production step is still the 10 hand-coded nodes** (from PATCH v5.2 Phase 1). Tasks 1.1 and 1.2 create the templates those nodes will be coded into. Everything downstream depends on having real data to work with.

---

*End of roadmap. This document is a living tracker and will be updated as tasks are completed or re-prioritized.*