# MFIE Build Surface v0

This branch adds the first React build surface for a curriculum asset catalogue.

## Route

- `/build-surface`

## What this v0 does

- Seeds a small catalogue of image/artifact records shaped like the future Supabase rows.
- Provides four views over one dataset:
  - Gallery
  - Table
  - Verification inbox
  - Status board
- Provides faceted filtering across:
  - verification status
  - civilization
  - period
  - geometry
  - carrier
  - material
  - source
  - lesson role
  - PFMD
- Persists local working state through Zustand + IndexedDB.
- Supports approve / needs info / reject decisions as local verification events.
- Supports dragging catalogue cards into lesson slots with dnd-kit.
- Exports lesson slot selections as a stable JSON production contract.
- Copies a Markdown lesson-selection draft to the clipboard.

## Files added

- `client/src/pages/BuildSurface.tsx`
- `client/src/lib/buildSurfaceTypes.ts`
- `client/src/lib/buildSurfaceSeed.ts`
- `client/src/lib/supabaseClient.ts`
- `client/src/store/buildSurfaceStore.ts`

## Files changed

- `client/src/App.tsx`: registers `/build-surface`
- `package.json`: adds build-surface dependencies

## Intent

This is not the final DAM. It is the cockpit slice that proves the core loop:

```text
Catalogue row -> verification state -> faceted view -> lesson slot -> export contract
```

Once this is visually correct, the next steps are:

1. Replace seed data with Supabase `artifacts`, `artifact_tags`, `views`, `lessons`, and `verification_events`.
2. Connect Supabase Storage thumbnails through `getSupabaseImageUrl()`.
3. Add a bulk ingest script for the initial image set.
4. Expand the lesson export contract into MFIE primitive / PFMD / FGE animation-cell jobs.
5. Add ArtisanalCanvas production-brief handoff.

## Environment

Optional Supabase variables:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

If the variables are absent, the app uses embedded seed thumbnails and remains fully local.
