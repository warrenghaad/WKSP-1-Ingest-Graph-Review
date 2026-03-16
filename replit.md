# Chronos - Mesopotamian Artifact Research Archive

## Overview
A 3D interactive timeline for exploring Mesopotamian artifacts (~6500 BCE – 331 BCE), with a reader mode for text-to-image search, and an automation lab for batch museum API searches and AI image generation.

## Architecture
- **Frontend**: React + TypeScript with Vite, Tailwind CSS v4, shadcn/ui, Framer Motion, React Three Fiber (3D timeline)
- **Backend**: Express.js with TypeScript
- **Routing**: wouter (frontend SPA routing), Express (API)
- **AI Integration**: OpenAI (via Replit AI Integrations) for query enhancement and image generation (gpt-image-1), Perplexity API for web-powered image search
- **Museum APIs**: Metropolitan Museum (CC0, no key), Smithsonian Open Access (DEMO_KEY), Wikimedia Commons (free)
- **Storage**: In-memory (MemStorage) for saved images

## Key Features
1. **3D Timeline** (`/`): Interactive 3D visualization of 12 Mesopotamian artifacts spanning 10 eras (Ubaid through Achaemenid). Features:
   - Artifacts placed on a scaled horizontal axis (year-to-x mapping)
   - Era markers (colored bands) along the timeline
   - Category/era filtering via filter panel
   - Detail panel with research papers, artifact images, and cross-links to Lab/Reader
   - Smooth camera animation on selection, OrbitControls for zoom/pan/rotate
   - Particle field ambient effects
   - Artifact IDs follow WIII-A-SA3-### convention (Project EUCLID)
2. **Reader Mode** (`/reader`): Document reader with Tiptap editor and text-highlight-to-image-search
3. **Automation Lab** (`/lab`): Image search and generation testing ground
   - **Single Search**: Search across all museum APIs + AI simultaneously
   - **Batch Search**: Paste multiple queries, runs them sequentially with SSE streaming progress
   - **AI Generate**: Generate custom artifact images using OpenAI gpt-image-1
   - Batch save results to collection

## API Routes
- `POST /api/search-images` - AI-powered image search (Perplexity + OpenAI)
- `POST /api/search-museums` - Direct museum API search (Met, Smithsonian, Wikimedia)
- `POST /api/batch-search` - SSE streaming batch search (body: `{ queries: string[], searchType: "all"|"museums"|"ai" }`)
- `POST /api/generate-image` - AI image generation (body: `{ prompt: string, size?: string }`)
- `GET /api/saved-images` - Get all saved images
- `POST /api/saved-images` - Save an image
- `POST /api/saved-images/batch` - Batch save images
- `DELETE /api/saved-images/:id` - Delete a saved image

## Environment Variables
- `AI_INTEGRATIONS_OPENAI_API_KEY` - Set automatically by Replit AI Integrations
- `AI_INTEGRATIONS_OPENAI_BASE_URL` - Set automatically by Replit AI Integrations
- `PERPLEXITY_API_KEY` - Required for Perplexity web search (optional, falls back to OpenAI)

## File Structure
- `client/src/pages/Home.tsx` - 3D timeline page
- `client/src/pages/Reader.tsx` - Reader mode with image search
- `client/src/pages/Lab.tsx` - Automation lab (batch search, generation)
- `client/src/components/Timeline3D.tsx` - Three.js 3D timeline component
- `client/src/lib/artifacts.ts` - Artifact data model
- `server/routes.ts` - API route definitions
- `server/imageSearch.ts` - Image search logic (OpenAI + Perplexity)
- `server/museumSearch.ts` - Direct museum API integrations (Met, Smithsonian, Wikimedia)
- `server/storage.ts` - In-memory storage for saved images
- `shared/schema.ts` - Data schemas
