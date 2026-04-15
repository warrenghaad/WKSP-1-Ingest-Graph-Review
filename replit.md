# Chronos - Mesopotamian Artifact Research Archive

## Overview
A 3D interactive timeline for exploring Mesopotamian artifacts (~6500 BCE – 331 BCE), structured around the MAGIC theoretical framework (Mathematics, Aesthetics/Art, Geometry, Institutionalization/Internalization, Control/Power). Includes a reader mode for text-to-image search and an automation lab for batch museum API searches and AI image generation.

## Architecture
- **Frontend**: React + TypeScript with Vite, Tailwind CSS v4, shadcn/ui, Framer Motion, React Three Fiber (3D timeline)
- **Backend**: Express.js with TypeScript
- **Routing**: wouter (frontend SPA routing), Express (API)
- **AI Integration**: OpenAI (via Replit AI Integrations) for query enhancement and image generation (gpt-image-1), Perplexity API for web-powered image search
- **Museum APIs**: Metropolitan Museum (CC0, no key), Smithsonian Open Access (DEMO_KEY), Wikimedia Commons (free)
- **Database**: PostgreSQL with Drizzle ORM (sessions, concept cards, candidates, saved images)
- **Storage**: DatabaseStorage backed by PostgreSQL
- **Notion Integration**: Connected via MCP for reading Project Euclid databases (Geometric Element Atomics, Primitives × Civilizations, GEM Production Matrix)

## MAGIC Framework
Five variables plotted on the Braid graph — each is a scored float (0–1) per research instantiation:
- **M** (Math): Mathematical formalization, proofs, calculation
- **A** (Art): Aesthetic, visual rhetoric, decorative significance
- **G** (Geometric thinking): Spatial reasoning, geometric form analysis
- **I** (Ideology): Institutional, religious, political embedding
- **C** (Comptroller): Economic, administrative, accounting control

### Braid Graph (`/braid`)
ONE visualization: five colored ribbons flowing along a time axis. At each research-derived plot point (knot), the ribbons converge and cross based on their relative scores — the crossing IS braid theory applied. Research text → Gemini analysis → MAGIC scores → new plot points. No bar charts. No deviation vectors. No invented panels.

Database table: `braid_points` (id, name, year, math, art, geometry, ideology, comptroller, description, source).
Routes: `GET/POST /api/braid/points`, `DELETE /api/braid/points/:id`, `POST /api/braid/analyze`, `POST /api/braid/seed`.
41 initial plot points seeded from historical artifact data.

### Lesson Architecture (15 sections, two-day arc)
- **Day A (A1–A7)**: Metaphor/Rhetoric register — "What does it MEAN?"
- **Day B (B1–B8)**: Function register — "What does it DO?"
- **A7/B1**: Dual-register pivot — "It MEANS and it DOES"
- Each section has a MAGIC weight vector [M,A,G,I,C] ∈ [0,1]
- Artifacts are tagged with section roles (which lesson sections they can serve)

### Braid Theory Visualization (`/braid`)
Each civilization gets a 3D braid showing the DII (Discovery-Innovation-Invention) cycle:
- **Discoveries**: Individual MAGIC strands run separately, thickening as each variable grows
- **Innovations**: 2–4 strands cross and twist together (partial braiding, tighter helix)
- **Inventions**: All 5 converge into a tight full braid
- At invention convergence: a **green G-wrap** (Geometry) encircles the braid
- Then strands separate and the cycle restarts (3 cycles per braid)
- 7 civilizations: Sumerian, Akkadian, Babylonian, Assyrian, Elamite, Egyptian, Persian

### DII Advent Calendar (`/braid` → Calendar toggle)
A 3D-styled card grid where each milestone appears as a "door":
- 7 civilizations × 3 cycles × 3 phases = 63 doors
- Click a door to open it and reveal the milestone description + MAGIC drivers
- "Find Images" button searches Met Museum, Smithsonian, and Wikimedia Commons + AI-powered Perplexity search
- Click a search result to link that image to the milestone
- Linked images persist in view and show on closed door cards as thumbnails
- Cards have 3D hover tilt effect (perspective + rotateY/rotateX)

### Memory Palace (`/braid` → Palace toggle)
Interactive visualization of the Geometric Primitives Theory with 4 tabs:

**Primitives Tab**: 5 universal geometric atomics (Point · Line · Angle · Curve · Plane)
- Each with physics roles (As Force, As Motion, As Energy, As State)
- Construction rules: Creates (↑D via motion), Created By (↓D via intersection)
- Output Rule: Primitive nD × Motion vector × Duration = Result
- Metaphor = Function convergence from Notion databases

**Grammar Tab**: Generative grammar showing Primitive + Operation + Duration = Result
- 14 rules mapping primitives to geometric elements through physical operations
- Each rule has a physics analogy (e.g., "Centripetal force creates orbit")

**Evidence Tab**: Historical DII confirmation with real artifacts
- 20 evidence entries across all 5 primitives
- Each shows Discovery → Innovation → Invention journey with Met Museum images
- MAGIC driver tags per artifact

**Art Theory Tab**: Metaphor = Function proven through art
- 10 entries showing the same primitives structuring both aesthetic and engineering decisions
- Each entry has Metaphor Register, Function Register, and Convergence Note

Data files:
- `client/src/lib/primitivesTheory.ts`: All primitives data, generative grammar, art theory, historical evidence
- `client/src/components/MemoryPalace.tsx`: 4-tab interactive visualization

### Data Layer
- `magicFramework.ts`: All 15 lesson sections with vectors, cognitive operations, GE tags, keyword templates
- `artifacts.ts`: 18 artifacts with MAGIC metadata (sectionRoles, GEA/GEM tags, E×C×D specs, RWI tags)
- `braidData.ts`: Civilization data for braid theory (7 civs with MAGIC profiles, interactions)
- `diiMilestones.ts`: 63 DII milestones with Met Museum CDN images
- `primitivesTheory.ts`: Geometric primitives theory with physics roles, generative grammar, historical evidence, art theory
- `MAGICRadar.tsx`: Pentagon radar chart + horizontal bar chart for weight vectors
- `LessonArc.tsx`: Interactive lesson architecture viewer with section bars and detail panel

## Key Features
1. **3D Timeline** (`/`): Interactive 3D visualization of 18 Mesopotamian artifacts spanning 12 eras (Ubaid through Achaemenid). Features:
   - Artifacts placed on a scaled horizontal axis (year-to-x mapping)
   - Era markers (colored bands) along the timeline
   - Category/era/lesson-section filtering via filter panel
   - MAGIC view toggle showing the Lesson Architecture panel
   - Detail panel with MAGIC profile (radar chart, weight bars, GEA/GEM/E×C×D), research papers, museum links
   - Smooth camera animation on selection, OrbitControls for zoom/pan/rotate
   - Artifact IDs follow WIII-A-SA3-### convention (Project EUCLID)
2. **PRISM Editor / Entity-Aware DAM** (`/reader`): Full canvas-first PRISM workspace. Features:
   - TipTap editor dominates ≥70% width; right drawer hidden by default
   - Hover over entity mark → preview drawer slides in; click → pins it
   - **Entity Marks**: Color-coded TipTap marks per entity type (artifact=amber, place=blue, etc.)
   - **4-Tab Right Drawer**: Entity (detail + PRISM requirements + candidates + saved assets), Ingest, DAM, Work Queue
   - **Text Ingestion**: Paste text → AI extracts entities → creates VisualRequirements (one per entity per doc)
   - **PRISM Pipeline**: Each requirement can: Search (parallel providers) → Generate Spec (GPT-4o imageSpec+overlaySpec) → Run QC on candidates (VisionAI) → Save candidate as Asset
   - **Providers**: Google CSE (if keys set), Wikimedia Commons, Met Museum, Openverse; Pinterest/Adobe are stubs
   - **VisionAI QC**: GPT-4o vision evaluates candidates against imageSpec, stores pass/fail + score + reasons
   - **Prompt Fallback**: Auto-generates ImagePrompt when 3+ QC failures with no passing candidate
   - **Work Queue Drawer**: Lists documents with pending/missing imaging + counts (missing, qc_failed, ready-to-save)
   - **Save Candidate**: Passes a candidate → creates Asset + EntityAsset link → marks requirement COMPLETE
   - **Entity-Asset Graph**: Entities linked to assets via join table with linkType, approval status, confidence
3. **Automation Lab** (`/lab`): Image search and generation testing ground
4. **Euclid First-Run Textreader** (`/textreader`): Narrow first-run worker for text-to-image preparation. Features:
   - 4-zone layout: top bar, left intake pane, center concept board, right detail drawer
   - Paste research text → AI extracts atomic visual concepts with labels, descriptions, visual types, priorities, tags
   - Each concept card follows a state machine: draft → parsed → query_ready → searching → candidates_ready → selected → ai_prompt_ready → ready_for_handoff → sent_to_backend
   - Concept cards show provenance labels (source_type + accuracy_status) on every candidate
   - Source mode selector: open_web_fast, museum_context, ai_reconstruction, hybrid
   - Right drawer shows search queries (auto-generated), AI prompts, candidate image grid with approve/reject
   - Backend adapter layer for external mesopotamia-backend (APP_API_BASE env var)
   - Handoff queue: mark concepts ready, send to backend or export JSON fallback
   - NOT a CMS/DAM — temporary local draft state only, canonical persistence stays in external backend

## API Routes
### Image Search & Generation
- `POST /api/search-images` - AI-powered image search (Perplexity + OpenAI)
- `POST /api/search-museums` - Direct museum API search (Met, Smithsonian, Wikimedia)
- `POST /api/batch-search` - SSE streaming batch search
- `POST /api/generate-image` - AI image generation
- `GET /api/saved-images` - Get all saved images
- `POST /api/saved-images` - Save an image
- `POST /api/saved-images/batch` - Batch save images
- `DELETE /api/saved-images/:id` - Delete a saved image

### Textreader
- `GET /api/textreader/backend-status` - Check external backend connectivity
- `POST /api/textreader/sessions` - Create a textreader session
- `GET /api/textreader/sessions` - List all sessions
- `GET /api/textreader/sessions/:id` - Get session with concepts
- `DELETE /api/textreader/sessions/:id` - Delete session + concepts + candidates
- `POST /api/textreader/extract` - Extract atomic visual concepts from text (AI-powered)
- `PATCH /api/textreader/concepts/:id` - Update concept card (state, queries, prompts)
- `DELETE /api/textreader/concepts/:id` - Delete concept card
- `POST /api/textreader/concepts/:id/search` - Run multi-provider image search for a concept
- `GET /api/textreader/concepts/:id/candidates` - Get candidate images for a concept
- `PATCH /api/textreader/candidates/:id` - Update candidate (approve/reject)
- `POST /api/textreader/concepts/:id/generate-queries` - Regenerate search queries and AI prompts
- `POST /api/textreader/handoff` - Send ready concepts to external backend (or export JSON)

### Entity DAM
- `GET /api/entities/by-label?q=...` - Search entities by label (autocomplete)
- `GET /api/entities/:id` - Get entity detail with linked assets and mentions
- `POST /api/entities` - Create an entity
- `PATCH /api/entities/:id` - Update entity
- `POST /api/assets/search` - Multi-provider image search, optionally linked to entity
- `POST /api/assets/save` - Save asset and optionally link to entity
- `PATCH /api/entity-assets/:id` - Update entity-asset link (approve/reject)
- `POST /api/ingest/text` - Ingest text → chunk → entity extraction → mention creation → VisualRequirements
- `POST /api/ingest/url` - Ingest URL → fetch → extract → same pipeline as text
- `GET /api/documents` - List all documents
- `GET /api/documents/:id` - Get document with mentions

### PRISM Pipeline
- `GET /api/requirements/:id` - Get a VisualRequirement with its candidates and QC assessments
- `POST /api/requirements/:id/search` - Trigger parallel image search across all providers for a requirement
- `POST /api/requirements/:id/spec/generate` - Generate imageSpec + overlaySpec via GPT-4o
- `POST /api/qc/:candidateId/evaluate` - Run VisionAI QC on a candidate (GPT-4o vision)
- `POST /api/requirements/:id/save-candidate` - Save best candidate as Asset and mark requirement COMPLETE
- `GET /api/requirements/:id/prompts` - Get image prompts for a requirement
- `POST /api/requirements/:id/prompts` - Create/update an image prompt for a requirement
- `GET /api/work/queue` - Get work queue summary (per-document counts of missing/qcFailed/readyToSave)
- `POST /api/work/recompute` - Recompute all requirement statuses based on current candidate state

## Deployment

The app is deployed using Replit Autoscale:
- **Build**: `npm run build`
- **Run**: `node ./dist/index.cjs`
- **Access**: Public (no authentication required)

The deployment must be published as **Public** (not Private/Authenticated) so that
visitors can access the app without a Replit account. If the login wall appears,
re-publish from the Replit publishing UI and ensure visibility is set to Public.

## Environment Variables
- `AI_INTEGRATIONS_OPENAI_API_KEY` - Set automatically by Replit AI Integrations
- `AI_INTEGRATIONS_OPENAI_BASE_URL` - Set automatically by Replit AI Integrations
- `PERPLEXITY_API_KEY` - Required for Perplexity web search (optional)
- `DATABASE_URL` - PostgreSQL connection string (auto-configured by Replit)
- `APP_API_BASE` - External backend URL for handoff (optional, enables backend adapter)
- `APP_API_KEY` - External backend auth key (optional)

## File Structure
- `client/src/pages/Home.tsx` - 3D timeline page with MAGIC framework integration
- `client/src/pages/Reader.tsx` - Visual-first DAM with inline image annotations
- `client/src/components/InlineImageExtension.ts` - Custom Tiptap ImageAnnotation mark extension
- `client/src/pages/Lab.tsx` - Automation lab
- `client/src/pages/Braid.tsx` - Braid Theory page with 4 views (braid, calendar, palace, meetings)
- `client/src/components/Timeline3D.tsx` - Three.js 3D timeline component
- `client/src/components/MemoryPalace.tsx` - Primitives theory visualization (4 tabs)
- `client/src/components/PeopleGraph.tsx` - Meeting Tables / traveling MAGIC people view
- `client/src/components/MAGICRadar.tsx` - MAGIC weight vector radar chart and bar chart
- `client/src/components/LessonArc.tsx` - Lesson Architecture interactive viewer
- `client/src/lib/magicFramework.ts` - MAGIC data layer (sections, vectors, ziggurat layers)
- `client/src/lib/artifacts.ts` - Artifact data model with MAGIC metadata
- `client/src/lib/braidData.ts` - Civilization data for braid theory (7 civs with MAGIC profiles, interactions)
- `client/src/lib/diiMilestones.ts` - 63 DII milestones with Met Museum images
- `client/src/lib/primitivesTheory.ts` - Geometric primitives theory data
- `client/src/components/BraidSVG.tsx` - SVG braid visualization
- `client/src/pages/Textreader.tsx` - Euclid First-Run Textreader (4-zone layout)
- `server/routes.ts` - API route definitions (image search, textreader, saved images)
- `server/imageSearch.ts` - AI image search logic (Perplexity + OpenAI)
- `server/museumSearch.ts` - Museum API integrations (Met, Smithsonian, Wikimedia)
- `server/conceptExtractor.ts` - AI concept extraction from text (OpenAI)
- `server/backendAdapter.ts` - External backend adapter (proxy to mesopotamia-backend)
- `server/storage.ts` - DatabaseStorage backed by PostgreSQL
- `server/db.ts` - Drizzle ORM database connection
- `client/src/components/EntityMark.ts` - Custom TipTap EntityMark extension (entity-aware mark with type colors)
- `server/entityExtractor.ts` - AI entity extraction from text (OpenAI)
- `shared/schema.ts` - Drizzle schema (users, savedImages, textreaderSessions, conceptCards, conceptCandidates, entities, assets, entityAssets, mentions, documents, docChunks, imagePrompts, visualRequirements, imageSearchJobs, imageCandidates, qcAssessments, docAssetLinks)
- `server/providers/index.ts` - Image provider adapters (Google CSE, Wikimedia, Met Museum, Openverse; Pinterest/Adobe stubs)
