# Chronos - Artifact Research Archive

## Overview
A 3D interactive timeline for exploring historical artifacts, with a reader mode that allows highlighting text to search for related images from real web sources.

## Architecture
- **Frontend**: React + TypeScript with Vite, Tailwind CSS v4, shadcn/ui, Framer Motion, React Three Fiber (3D timeline)
- **Backend**: Express.js with TypeScript
- **Routing**: wouter (frontend), Express (API)
- **AI Integration**: OpenAI (via Replit AI Integrations) for query enhancement and image search, Perplexity API for web-powered image search
- **Storage**: In-memory (MemStorage) for saved images

## Key Features
1. **3D Timeline** (`/`): Interactive 3D visualization of historical artifacts with research aggregation
2. **Reader Mode** (`/reader`): Document reader with text-highlight-to-image-search functionality
   - Highlight any text → "Find Images" popup appears
   - AI-enhanced search queries sent to Perplexity/OpenAI
   - Save images to a personal collection

## API Routes
- `POST /api/search-images` - Search for images using AI (body: `{ query: string }`)
- `GET /api/saved-images` - Get all saved images
- `POST /api/saved-images` - Save an image (body: `{ url, title, source, query }`)
- `DELETE /api/saved-images/:id` - Delete a saved image

## Environment Variables
- `AI_INTEGRATIONS_OPENAI_API_KEY` - Set automatically by Replit AI Integrations
- `AI_INTEGRATIONS_OPENAI_BASE_URL` - Set automatically by Replit AI Integrations
- `PERPLEXITY_API_KEY` - Required for Perplexity web search (optional, falls back to OpenAI)

## File Structure
- `client/src/pages/Home.tsx` - 3D timeline page
- `client/src/pages/Reader.tsx` - Reader mode with image search
- `client/src/components/Timeline3D.tsx` - Three.js 3D timeline component
- `client/src/lib/artifacts.ts` - Artifact data model
- `server/routes.ts` - API route definitions
- `server/imageSearch.ts` - Image search logic (OpenAI + Perplexity)
- `server/storage.ts` - In-memory storage for saved images
- `shared/schema.ts` - Data schemas
