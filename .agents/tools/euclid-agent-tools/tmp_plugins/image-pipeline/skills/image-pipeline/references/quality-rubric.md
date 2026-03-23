# Image Quality Assessment Rubric

## Scoring Matrix (5 criteria × 5 points = 25 max)

### 1. Resolution (1-5)

| Score | Resolution | Description |
|-------|-----------|-------------|
| 5 | ≥ 2000px longest edge | High-res museum quality, suitable for zoom |
| 4 | 1500-1999px | Good quality, clear at full display |
| 3 | 800-1499px | Acceptable for web display, no zoom |
| 2 | 400-799px | Low resolution, visible pixelation |
| 1 | < 400px | Thumbnail only, unusable |

### 2. Clarity (1-5)

| Score | Description |
|-------|-------------|
| 5 | Sharp focus, even lighting, no artifacts, professional photography |
| 4 | Clear image, minor shadows or slight softness, still highly usable |
| 3 | Some blur, uneven lighting, or compression artifacts but subject identifiable |
| 2 | Significant blur, heavy shadows, or distortion — subject partially obscured |
| 1 | Very blurry, dark, or corrupted — subject barely discernible |

### 3. Relevance (1-5)

| Score | Description |
|-------|-------------|
| 5 | Exact artifact match — same accession number, correct period, correct identification |
| 4 | Correct artifact type and period, possibly different specimen or view |
| 3 | Related artifact — same civilization and element but different specific object |
| 2 | Same civilization but different element or period |
| 1 | Wrong civilization or completely unrelated object |

### 4. GEA Visibility (1-5)

| Score | Description |
|-------|-------------|
| 5 | Geometric element clearly visible, well-lit, dominant in frame — ideal for overlay |
| 4 | Element visible and identifiable, may need minor cropping |
| 3 | Element present but partially obscured (angle, damage, competing elements) |
| 2 | Element barely visible — requires explanation to identify |
| 1 | Element not discernible in this image |

### 5. Rights (1-5)

| Score | Description |
|-------|-------------|
| 5 | Confirmed public domain (Met Open Access, expired copyright, government work) |
| 4 | Creative Commons license (CC-BY, CC-BY-SA) — can use with attribution |
| 3 | Museum permits educational use with attribution |
| 2 | Copyright status unclear — may require permission |
| 1 | Known restricted/copyrighted — cannot use without license |

---

## Action Thresholds

| Total Score | Action | Description |
|-------------|--------|-------------|
| 20-25 | **USE** | High quality — proceed directly to geometric overlay |
| 15-19 | **USE + ENHANCE** | Usable but could benefit from sharpening, cropping, or color correction |
| 12-14 | **ENHANCE REQUIRED** | Needs significant enhancement before overlay; run through quality improvement |
| 8-11 | **RECREATE** | Too low quality — use artifact description as prompt for AI recreation |
| 1-7 | **REJECT** | Unusable — search for alternative source or generate from scratch |

---

## Assessment Output Format

```yaml
IMAGE_ASSESSMENT:
  image_id: string
  source_url: string
  filename: string

  scores:
    resolution: { score: 1-5, pixels: "WxH", note: "" }
    clarity: { score: 1-5, note: "" }
    relevance: { score: 1-5, note: "" }
    gea_visibility: { score: 1-5, gea_identified: [], note: "" }
    rights: { score: 1-5, license: "", note: "" }

  total_score: 1-25
  action: USE | ENHANCE | RECREATE | REJECT

  overlay_readiness:
    gea_center_estimate: [x, y]     # normalized 0-1
    gea_scale_estimate: float        # normalized 0-1
    rotation_needed: degrees
    crop_suggested: { top: %, bottom: %, left: %, right: % }

  enhancement_notes: ""              # if ENHANCE: what needs fixing
  recreation_prompt: ""              # if RECREATE: full prompt for AI generation
```

---

## Quick Assessment (No Image File Available)

When only metadata is available (e.g., from API results before download):

```yaml
PRELIMINARY_ASSESSMENT:
  source: "Met Museum API"
  object_id: 12345
  has_image: true
  is_public_domain: true
  image_url: "https://..."
  preliminary_score:
    relevance_estimate: 4            # based on metadata match
    rights_estimate: 5               # based on isPublicDomain flag
    resolution_estimate: 4           # Met typically provides high-res
  priority: high | medium | low      # download priority
  download_order: 1                  # sequence in download queue
```

---

## Batch Assessment Summary

After assessing all images for a lesson week:

```yaml
BATCH_SUMMARY:
  lesson: "Week 1 — Shamash & Circle"
  total_images_assessed: 15
  breakdown:
    USE: 6
    ENHANCE: 4
    RECREATE: 3
    REJECT: 2
  coverage:
    sections_with_images: ["A1", "A2", "A3", "A5", "B2", "B5", "B6"]
    sections_missing: ["A4", "A6", "A7", "B4", "B8"]
    critical_gaps: ["A7 — needs architectural photo of ziggurat"]
  next_actions:
    - "Download and enhance 4 ENHANCE-flagged images"
    - "Generate AI recreations for 3 RECREATE-flagged artifacts"
    - "Search for missing images: A4 (power context), A7 (architecture)"
    - "Create geometric overlays for all 10 usable images"
```
