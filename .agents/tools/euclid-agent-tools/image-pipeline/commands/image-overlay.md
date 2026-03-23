---
description: "Create geometric overlays on artifact images showing GEA/GEM decompositions"
allowed-tools: Read, Write, Bash, Glob, Grep
---

# /image-overlay — Geometric Overlay Creation

Generate geometric overlays on artifact images, highlighting GEA primitives, GEM compositions, symmetry axes, measurements, and construction sequences.

## Usage

```
/image-overlay <image_path> --type <overlay_type> --gea <GEA_code> [--gem <GEM_code>] [--section <lesson_section>]
```

**Overlay types:** `highlight`, `comparison`, `decomposition`, `measurement`, `functional`, `construction_sequence`

## Instructions

1. **Load references:**
   - Read `@${CLAUDE_PLUGIN_ROOT}/skills/image-pipeline/references/overlay-specifications.md`

2. **Determine overlay type from section mapping:**
   - A2 → `highlight`
   - A3 → `comparison`
   - A5 / B6 → `decomposition`
   - B2 → `measurement`
   - B5 → `functional`
   - A6 / B6 → `construction_sequence`

3. **Analyze the image** to estimate GEA positions:
   - View the image using Read tool
   - Identify where the target geometric element appears
   - Estimate center coordinates (normalized 0-1)
   - Estimate scale/radius (normalized)
   - Note any rotation or perspective distortion

4. **Generate overlay specification (JSON):**

```json
{
  "type": "decomposition",
  "image_path": "/path/to/image.jpg",
  "output_path": "/path/to/image_overlay.png",
  "gea_elements": [
    {
      "type": "circle",
      "center": [0.5, 0.48],
      "radius": 0.22,
      "color": "#FF6B35",
      "label": "GEA.circle — sun disk",
      "fill_opacity": 0.12
    }
  ],
  "symmetry_axes": [
    {"start": [0.5, 0.1], "end": [0.5, 0.9], "style": "dashed"}
  ],
  "labels": [],
  "center_mark": true
}
```

5. **Execute overlay creation using Python PIL:**

```bash
python3 /path/to/scripts/create_overlay.py --spec overlay_spec.json
```

If the script doesn't exist yet, generate it using the template from the SKILL.md (Stage 4 section) and save to `scripts/create_overlay.py`.

6. **Output IMAGE_REF block** for the overlay:

```yaml
IMAGE_REF:
  id: "{finding_id}_img_{seq}_overlay"
  source_type: overlay
  url: null
  local_path: "data/overlays/{filename}_overlay.png"
  quality:
    resolution: "WxH"
    score: null  # overlays don't get quality scored
    overlay_type: "decomposition"
  geometric_analysis:
    gea_visible: ["GEA.circle"]
    gem_visible: []
    overlay_spec: { ... }
  lesson_routing:
    target_sections: ["A5"]
    role: primary_artifact
```

## Multi-Image Comparison Mode

When `--type comparison` and multiple images are provided:
```
/image-overlay image1.jpg image2.jpg image3.jpg --type comparison --gea GEA.circle
```
- Create a grid layout (2×2 or 3×1) with the same GEA highlighted in each
- Draw connector lines showing the common element
- Add carrier type labels beneath each image
- Output as a single composite image
