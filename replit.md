# Chronos - Mesopotamian Artifact Research Archive

## Overview
A 3D interactive timeline for exploring Mesopotamian artifacts (~6500 BCE – 331 BCE), structured around the MAGIC theoretical framework (Mathematics, Aesthetics/Art, Geometry, Institutionalization/Internalization, Control/Power). Includes a reader mode for text-to-image search and an automation lab for batch museum API searches and AI image generation.

## Architecture
- **Frontend**: React + TypeScript with Vite, Tailwind CSS v4, shadcn/ui, Framer Motion, React Three Fiber (3D timeline)
- **Backend**: Express.js with TypeScript
- **Routing**: wouter (frontend SPA routing), Express (API)
- **AI Integration**: OpenAI (via Replit AI Integrations) for query enhancement and image generation (gpt-image-1), Perplexity API for web-powered image search
- **Museum APIs**: Metropolitan Museum (CC0, no key), Smithsonian Open Access (DEMO_KEY), Wikimedia Commons (free)
- **Storage**: In-memory (MemStorage) for saved images
- **Notion Integration**: Connected via MCP for reading Project Euclid databases (Geometric Element Atomics, Primitives × Civilizations, GEM Production Matrix)

## MAGIC Framework
The theoretical backbone of the platform. Five drivers form a weight vector per lesson section:
- **M** (Mathematics): Formal properties, proofs, measurement
- **A** (Aesthetics/Art): Visual rhetoric, craft, perceptual affordance
- **G** (Geometry): Spatial organization, GEA/GEM composition
- **I** (Institutionalization): Ideology, mythology, ritual, tradition
- **C** (Control/Power): Who funds, controls, permits, suppresses

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
2. **Reader / DAM** (`/reader`): Visual-first Digital Asset Manager with Tiptap editor. Features:
   - Highlight text → BubbleMenu → "Find Images" searches museum + AI sources
   - Search results appear in a floating panel above the highlighted text (not just sidebar)
   - Click an image to: anchor it inline above the text (ImageAnnotation mark) AND auto-save to DAM
   - Annotated text gets gold underline + dot indicator; hover shows image tooltip
   - DAM sidebar: grid gallery of all curated assets, filterable by search query
   - Custom Tiptap ImageAnnotation mark extension stores url/title/source/query per annotation
3. **Automation Lab** (`/lab`): Image search and generation testing ground

## API Routes
- `POST /api/search-images` - AI-powered image search (Perplexity + OpenAI)
- `POST /api/search-museums` - Direct museum API search (Met, Smithsonian, Wikimedia)
- `POST /api/batch-search` - SSE streaming batch search
- `POST /api/generate-image` - AI image generation
- `GET /api/saved-images` - Get all saved images
- `POST /api/saved-images` - Save an image
- `POST /api/saved-images/batch` - Batch save images
- `DELETE /api/saved-images/:id` - Delete a saved image

## Environment Variables
- `AI_INTEGRATIONS_OPENAI_API_KEY` - Set automatically by Replit AI Integrations
- `AI_INTEGRATIONS_OPENAI_BASE_URL` - Set automatically by Replit AI Integrations
- `PERPLEXITY_API_KEY` - Required for Perplexity web search (optional)

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
- `server/routes.ts` - API route definitions
- `server/imageSearch.ts` - Image search logic
- `server/museumSearch.ts` - Museum API integrations
- `server/storage.ts` - In-memory storage
- `shared/schema.ts` - Data schemas
