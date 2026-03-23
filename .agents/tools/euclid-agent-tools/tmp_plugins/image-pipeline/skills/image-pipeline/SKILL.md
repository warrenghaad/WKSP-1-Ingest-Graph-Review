---
description: "EUCLID image pipeline — automated museum sourcing, quality assessment, geometric overlay design, and AI recreation for lesson artifacts. Use when the user asks to 'source images', 'find artifact photos', 'create overlays', 'build image manifest', 'run image pipeline', 'search museum for', 'overlay geometry on', 'recreate artifact', 'generate deity image', 'process images for lesson', or any request involving sourcing, assessing, overlaying, or generating images for EUCLID lesson content."
allowed-tools: WebSearch, WebFetch, Read, Write, Bash, Grep, Glob, Agent
---

# EUCLID Image Pipeline Skill

You are the image sourcing and design engine for the EUCLID curriculum. Your job is to find, assess, overlay, and when necessary recreate artifact images that connect to the GEA/GEM research findings produced by the euclid-gea-research plugin.

## Core Principle

Every lesson section needs images. Research produces FINDING blocks with artifact references. This pipeline turns those references into actual, usable, annotated images ready for lesson assembly.

## Pipeline Stages

The full pipeline runs 6 stages in sequence. Individual commands may invoke specific stages.

```
RESEARCH FINDINGS → [1] SEARCH → [2] DOWNLOAD → [3] ASSESS → [4] OVERLAY → [5] RECREATE → [6] MANIFEST
```

### Stage 1: SEARCH — Museum API Queries

**CRITICAL RULE: Use BROAD 1-2 keyword searches.** Do NOT use long descriptive queries.

**Museum API Priority Order:**

1. **Metropolitan Museum of Art** (Open Access API)
   - Endpoint: `https://collectionapi.metmuseum.org/public/collection/v1/search?q=QUERY&hasImages=true`
   - Returns: `{ total: N, objectIDs: [...] }`
   - Detail: `https://collectionapi.metmuseum.org/public/collection/v1/objects/OBJECT_ID`
   - Detail returns: `primaryImage`, `primaryImageSmall`, `title`, `objectDate`, `medium`, `dimensions`, `accessionNumber`, `department`, `culture`, `period`, `creditLine`, `isPublicDomain`
   - **ONLY use images where `isPublicDomain: true`**
   - Search examples: `"mesopotamia circle"`, `"babylonian seal"`, `"sumerian pottery"`, `"assyrian relief"`

2. **British Museum** (Collection Online)
   - Search URL: `https://www.britishmuseum.org/collection/search?keyword=QUERY`
   - No public API — use WebSearch to find specific objects by museum number
   - Search: `site:britishmuseum.org QUERY`
   - Known objects: search by BM number (e.g., "BM 91000", "BM 92687")

3. **Wikimedia Commons**
   - API: `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=QUERY&srnamespace=6&format=json`
   - File info: `https://commons.wikimedia.org/w/api.php?action=query&titles=File:FILENAME&prop=imageinfo&iiprop=url|size|mime&format=json`
   - Search examples: `"Shamash tablet"`, `"Code of Hammurabi"`, `"cylinder seal mesopotamia"`

4. **Smithsonian** (Open Access)
   - API: `https://api.si.edu/openaccess/api/v1.0/search?q=QUERY&online_media_type=Images&rows=10`

5. **Louvre** (Collections Online)
   - WebSearch: `site:collections.louvre.fr QUERY`

**Search Strategy per Artifact:**
```
FOR each artifact in research findings:
  1. Extract keywords: [element] + [civilization] (e.g., "mesopotamia circle")
  2. If named artifact: search by name (e.g., "Code of Hammurabi stele")
  3. If accession known: search by accession number
  4. Try Met API first (programmatic, fast, public domain)
  5. Try Wikimedia second (broad coverage, good metadata)
  6. Try British Museum third (excellent Mesopotamian collection)
  7. Record ALL results — don't stop at first hit
```

### Stage 2: DOWNLOAD — Organize Retrieved Images

Download images to structured directories:
```
data/images/
  ├── museum/          # Direct museum downloads
  │   ├── met/         # Met Museum
  │   ├── bm/          # British Museum
  │   ├── wiki/        # Wikimedia Commons
  │   └── other/       # Smithsonian, Louvre, etc.
  ├── generated/       # AI recreations (Stage 5)
  ├── overlays/        # Geometric overlays (Stage 4)
  └── composites/      # Final composited images
```

**Naming convention:** `[civ]_[period]_[element]_[carrier]_[accession].[ext]`
Example: `meso_ob_circle_seal_walters42638.jpg`

### Stage 3: ASSESS — Quality Scoring

Score each image on 5 criteria (1-5 each, 25 max):

| Criterion | 5 (Excellent) | 3 (Acceptable) | 1 (Poor) |
|-----------|---------------|-----------------|----------|
| **Resolution** | ≥2000px longest | 800-2000px | <800px |
| **Clarity** | Sharp, well-lit | Some blur/shadow | Very blurry/dark |
| **Relevance** | Exact artifact match | Related artifact | Tangentially related |
| **GEA Visibility** | Geometric element clearly visible | Partially visible | Not discernible |
| **Rights** | Public domain confirmed | CC license | Unknown/restricted |

**Thresholds:**
- Score ≥ 18: **USE** — proceed to overlay
- Score 12-17: **ENHANCE** — use but flag for quality improvement
- Score < 12: **RECREATE** — generate AI replacement using artifact description

### Stage 4: OVERLAY — Geometric Annotation

For every image scoring ≥ 12, create a geometric overlay showing the GEA/GEM decomposition.

**Overlay Specification:**
```python
# Overlay parameters (compatible with image_tools.py PIL pattern)
OVERLAY_CONFIG = {
    "opacity": 0.40,          # 40% overlay opacity
    "line_color": "#FF6B35",  # Orange for GEA lines
    "line_width": 3,          # pixels
    "fill_color": "#FFB800",  # Gold for GEA fills
    "fill_opacity": 0.15,     # 15% fill opacity
    "label_font_size": 14,    # GEA/GEM labels
    "label_color": "#FFFFFF", # White labels
    "label_bg": "#000000",    # Black label background
    "label_bg_opacity": 0.70, # 70% label background opacity
    "center_mark": True,      # Show center point for circles
    "symmetry_axes": True,    # Show symmetry lines
    "construction_steps": False # Set True for A5/B6 decomposition images
}
```

**Overlay Types by Lesson Section:**

| Section | Overlay Type | What to Draw |
|---------|-------------|--------------|
| A2 (Visual Rhetoric) | `highlight` | Outline the primary GEA, label it |
| A3 (Carrier Diversity) | `comparison` | Same GEA highlighted across different carriers |
| A5 (Primary Artifact) | `decomposition` | Full GEA/GEM decomposition with labels |
| B2 (GEK Property) | `measurement` | Dimensions, angles, mathematical properties |
| B5 (Invention) | `functional` | How GEA/GEM enables mechanical function |
| B6 (STEM Decomposition) | `construction_sequence` | Step-by-step construction with numbered steps |

**Python Overlay Script Template:**
```python
from PIL import Image, ImageDraw, ImageFont
import json

def create_overlay(image_path, overlay_spec, output_path):
    """
    overlay_spec = {
        "type": "decomposition|highlight|measurement|functional|construction_sequence",
        "gea_elements": [
            {
                "type": "circle|line|triangle|square|arc|spiral",
                "center": [x, y],       # normalized 0-1
                "radius": float,         # normalized 0-1 (for circles)
                "points": [[x,y],...],   # normalized 0-1 (for polygons)
                "label": "GEA.circle",
                "color": "#FF6B35"
            }
        ],
        "symmetry_axes": [
            {"start": [x,y], "end": [x,y], "style": "dashed"}
        ],
        "labels": [
            {"text": "r = radius", "position": [x,y], "anchor": "center"}
        ],
        "construction_steps": [
            {"step": 1, "description": "Establish center point", "elements": [...]}
        ]
    }
    """
    img = Image.open(image_path).convert("RGBA")
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    w, h = img.size

    for elem in overlay_spec.get("gea_elements", []):
        color = elem.get("color", "#FF6B35")
        r, g, b = int(color[1:3], 16), int(color[3:5], 16), int(color[5:7], 16)

        if elem["type"] == "circle":
            cx, cy = int(elem["center"][0] * w), int(elem["center"][1] * h)
            radius = int(elem["radius"] * min(w, h))
            # Fill at 15% opacity
            draw.ellipse([cx-radius, cy-radius, cx+radius, cy+radius],
                        fill=(r, g, b, 38), outline=(r, g, b, 102), width=3)
            if overlay_spec.get("center_mark", True):
                draw.ellipse([cx-4, cy-4, cx+4, cy+4], fill=(r, g, b, 200))

        elif elem["type"] == "line":
            points = [(int(p[0]*w), int(p[1]*h)) for p in elem["points"]]
            draw.line(points, fill=(r, g, b, 102), width=3)

        elif elem["type"] in ("triangle", "square", "polygon"):
            points = [(int(p[0]*w), int(p[1]*h)) for p in elem["points"]]
            draw.polygon(points, fill=(r, g, b, 38), outline=(r, g, b, 102))

    # Symmetry axes (dashed)
    for axis in overlay_spec.get("symmetry_axes", []):
        start = (int(axis["start"][0]*w), int(axis["start"][1]*h))
        end = (int(axis["end"][0]*w), int(axis["end"][1]*h))
        draw.line([start, end], fill=(255, 255, 255, 76), width=1)

    # Composite
    result = Image.alpha_composite(img, overlay)
    result.save(output_path)
    return output_path
```

### Stage 5: RECREATE — AI Image Generation

For images scoring < 12 OR where no museum source exists, generate AI recreations.

**Recreation Prompt Template:**
```
Ultra-realistic museum photograph of [ARTIFACT DESCRIPTION].
Material: [MATERIAL]. Dimensions approximately [DIMENSIONS].
Dating to [DATE RANGE], [CIVILIZATION] [PERIOD].
The [GEA ELEMENT] is clearly visible as [SPECIFIC DESCRIPTION].
Museum lighting, neutral background, high resolution detail photograph.
Style: Archaeological catalog photography, similar to Metropolitan Museum collection images.
```

**What to generate:**
1. **Artifact recreations** — When museum photo is missing or too low quality
2. **Deity depictions** — Ultra-realistic interpretations of deity as described in period texts
3. **Invention schematics** — Technical illustrations showing how GEA/GEM enables function
4. **Scene reconstructions** — Historical moment images (e.g., scribe in E-babbar temple)

**Character Consistency Rules:**
- Each deity gets a fixed visual description used across ALL lessons
- Deity descriptions stored in `references/deity-visual-canon.md`
- Invention illustrations use consistent style: cross-section view, labeled components, neutral palette

### Stage 6: MANIFEST — IMAGE_REF Block Generation

Output a complete IMAGE_REF block (per output-format.md) for every image:

```yaml
IMAGE_REF:
  id: "[finding_id]_img_[sequence]"
  source_type: museum_api | wikimedia | web_search | ai_generated
  url: "Full URL to original source"
  local_path: "data/images/[category]/[filename]"
  overlay_path: "data/overlays/[filename]_overlay.png"
  composite_path: "data/composites/[filename]_composite.png"

  metadata:
    title: string
    museum: string
    accession: string
    date: string
    material: string
    artist_culture: string
    dimensions: string
    credit_line: string
    rights: "public_domain | cc_by | cc_by_sa | restricted | unknown"

  quality:
    resolution: "WxH"
    score: 1-25
    action: use | enhance | recreate
    overlay_type: "decomposition | highlight | measurement | functional | construction_sequence"

  geometric_analysis:
    gea_visible: [GEA codes]
    gem_visible: [GEM codes]
    overlay_spec: { ... }  # Full overlay specification for Stage 4

  lesson_routing:
    target_sections: [section codes]
    role: primary_artifact | supporting_evidence | comparison | diagram | reconstruction | deity | invention
    grade_versions: [3, 4, 5]  # Which grade levels use this image
```

## Integration with euclid-gea-research

This plugin CONSUMES output from the research plugin:
- FINDING blocks → extract artifact references → Stage 1 search
- IMAGE_REF stubs → complete with actual sourced images
- NOTCH_REGISTRY_ENTRY.image_manifest → track coverage gaps

**Workflow:**
```
euclid-gea-research (produces FINDINGS with artifacts)
       ↓
euclid-image-pipeline (sources, assesses, overlays, recreates)
       ↓
IMAGE_REF manifest (ready for lesson assembly)
       ↓
Lesson Builder (embeds images into HTML sections)
```

## References

Load these for detailed specifications:
- `@${CLAUDE_PLUGIN_ROOT}/skills/image-pipeline/references/museum-api-patterns.md`
- `@${CLAUDE_PLUGIN_ROOT}/skills/image-pipeline/references/overlay-specifications.md`
- `@${CLAUDE_PLUGIN_ROOT}/skills/image-pipeline/references/deity-visual-canon.md`
- `@${CLAUDE_PLUGIN_ROOT}/skills/image-pipeline/references/quality-rubric.md`
