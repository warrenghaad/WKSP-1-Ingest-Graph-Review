---
name: euclid-storyboard-myth-retelling
description: "Three-Act storyboarding engine for myth video animations. Decomposes myth narratives into ACT I (ABSENCE) → ACT II (TRANSFORMATION) → ACT III (LEGACY) panel sequences with reuse-tagged extractable assets. UPSTREAM of the image pipeline — storyboard panels define exactly what images are needed. Use when building storyboards, decomposing myths into panels, generating image requirements from myth narratives, or producing animation pre-production specs."
allowed-tools: Read, Write, Bash, Glob, Grep, Agent
---

# Euclid Storyboard Myth Retelling

Three-Act storyboarding engine for EUCLID myth video animations. This tool sits **upstream** of the image pipeline — every storyboard panel produces structured image requirements that the image pipeline fulfills.

## Pipeline Position

```
euclid-gea-research (FINDINGS + artifact references)
       ↓
euclid-storyboard-myth-retelling (THIS TOOL)
       ↓ STORYBOARD panels with reuse tags + extractable assets
       ↓
euclid-image-pipeline (sources, assesses, overlays, recreates)
       ↓ IMAGE_REF manifest
       ↓
Lesson Builder (HTML assembly)
```

## Three-Act Architecture

Every myth follows a **three-act dramaturgical structure** — NOT a panel count. Each act contains a variable number of panels determined by narrative beats:

| Act | Function | Visual Register | Element State |
|-----|----------|-----------------|---------------|
| ACT I: ABSENCE | World without the geometric property | Pre-element — no geometry visible | Problem exists BECAUSE property is absent |
| ACT II: TRANSFORMATION | Deity discovers/deploys the element | Element-in-action — geometry performing | The element IS the solution |
| ACT III: LEGACY | Geometric truth becomes permanent | Element-as-symbol — geometry in culture | Symbol is established |

## Core Engine

**Script:** `scripts/storyboarder_v2.py`

Two input modes:

### Mode 1: From Process Document (structured tables)
```bash
python3 scripts/storyboarder_v2.py process \
  references/three-act-process.md \
  --out data/storyboards/ \
  --md --v1-compat
```

### Mode 2: From Myth Script Files (HTML/MD)
```bash
python3 scripts/storyboarder_v2.py script \
  path/to/lesson_DayA.html \
  --out data/storyboards/ \
  --md
```

### Outputs Per Myth

| File | Format | Purpose |
|------|--------|---------|
| `*.storyboard_v2.json` | Hierarchical JSON | Act → Panel nesting, full metadata |
| `*.storyboard_v2.csv` | Flat CSV | Spreadsheet-friendly, act metadata per row |
| `*.storyboard_v2.md` | Markdown | Human-readable with act/panel tables |
| `*.storyboard.json` | Flat JSON (V1 compat) | Backward compatible with V1 consumers |
| `asset_reuse_matrix.json` | JSON | Cross-myth reuse tag → panel mapping |

## Panel Metadata Schema

Every panel carries:

```yaml
panel_id: "G3-W1-ACT2-P3"
act_number: 2
panel_number: 3
beat_name: "Circle becomes sun wheel"
duration_sec: 6
visual_concept: "Circle radiating equal light in all directions"
camera: "WIDE → ZOOM to circle center"
speaker: "NARRATOR"
dialogue: "The circle had no corners to hide behind..."
stage_direction: "Light pulses outward from circle center"
sfx: "warm_glow_pulse"
music_mood: "revelation"

# ── IMAGE PIPELINE HANDOFF ──
reuse_tags: [A1_myth, B3_science, ELEMENT_SOLO]
extractable_assets:
  background: "mesopotamian_sky_dawn"
  character: "shamash_standing_radiant"
  element: "circle_radiating_light"
  fx: "equal_radial_glow"
grade_variants:
  G3_narration: "The light goes out equally everywhere — like fairness!"
  G4_narration: "Equal radii mean equal illumination in every direction."
  G5_narration: "Equidistance from center produces uniform coverage."
```

## Reuse Tag Taxonomy

Tags connect panels to lesson sections they serve:

| Tag | Sections Fed | Description |
|-----|-------------|-------------|
| `A1_myth` | A1 all grades | Primary myth delivery |
| `A3_iconography` | A3 | Artifact close-ups, deity symbols |
| `A4_material_culture` | A4 | Civilization objects, architecture |
| `A5_deep_dive` | A5 | Detailed artifact analysis frames |
| `B3_science` | B3 | Element property demonstrations |
| `B4_history` | B4 | Historical mechanical applications |
| `B5_evolution` | B5 | Cross-civilization usage |
| `B6_invention` | B6 | Specific invention moment |
| `BACKGROUND` | Any | Reusable environment layer |
| `CHARACTER` | Any | Reusable character pose/expression |
| `ELEMENT_SOLO` | A5, B2, B3, B6 | Isolated geometric element for overlay/diagram |

## Image Pipeline Handoff

When the image pipeline runs `/image-manifest`, it should check for existing storyboard output first:

```
IF storyboard_v2.json exists for this lesson:
  FOR each panel in storyboard:
    panel.visual_concept → IMAGE_NEED.description
    panel.extractable_assets → IMAGE_NEED.target layers
    panel.reuse_tags → IMAGE_NEED.target_sections
    panel.grade_variants → IMAGE_NEED.grade_versions
  SKIP re-deriving image needs from lesson text
ELSE:
  Fall back to lesson-text extraction (current behavior)
```

The `asset_reuse_matrix.json` output maps which panels feed which sections across ALL myths — the image pipeline uses this to avoid duplicate sourcing.

## Commands

| Command | Description |
|---------|-------------|
| `/storyboard-myth` | Generate 3-Act storyboard from a myth script or lesson file |
| `/storyboard-process` | Generate all 4 myth storyboards from the process document |
| `/storyboard-to-manifest` | Convert storyboard panels to image pipeline manifest format |

## References

- `references/three-act-process.md` — Complete 3-Act methodology + all 4 myth breakdowns
- `../euclid-agent-tools/image-pipeline/skills/image-pipeline/references/deity-visual-canon.md` — Character consistency
- `../euclid-agent-tools/image-pipeline/skills/image-pipeline/references/overlay-specifications.md` — Overlay specs

## Guardrails

- Every panel must have ONE visual concept (no multi-concept panels)
- Every panel must carry reuse tags (no untagged panels)
- Grade differentiation is NEVER done through different animations — same base, different overlays
- The storyboard is the source of truth for image needs — the image pipeline consumes, not re-derives
- ACT is the structural unit — panel count is variable per act, driven by narrative
