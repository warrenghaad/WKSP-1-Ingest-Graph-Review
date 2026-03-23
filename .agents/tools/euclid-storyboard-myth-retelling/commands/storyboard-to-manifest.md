---
description: "Convert storyboard V2 panels into image pipeline IMAGE_NEED manifest format"
allowed-tools: Read, Write, Bash, Glob, Grep
---

# /storyboard-to-manifest — Storyboard → Image Pipeline Bridge

Convert storyboard panel output into IMAGE_NEED blocks consumable by the image pipeline's `/image-pipeline` and `/image-manifest` commands.

## Usage

```
/storyboard-to-manifest [--storyboard-dir <path>] [--out <manifest_dir>]
```

## What This Does

The storyboard thinks **panel-first**: "Panel 2.3 serves A1_myth, B3_science, ELEMENT_SOLO."
The image pipeline thinks **section-first**: "Section B3 needs an element property demo image."

This command inverts the mapping:

```
STORYBOARD (panel → tags)          IMAGE MANIFEST (section → needs)
─────────────────────────          ────────────────────────────────
Panel 2.3:                    →    Section A1: deity_scene from Panel 2.3
  tags: [A1_myth, B3_science]      Section B3: element_property_demo from Panel 2.3
  assets: {element: "circle"}      Section multi: isolated_element "circle"
```

## Instructions

1. **Locate storyboard output:**
   ```
   data/storyboards/*.storyboard_v2.json
   ```

2. **Run the bridge script:**
   ```bash
   python3 scripts/storyboard_to_manifest.py \
     data/storyboards/ \
     --out data/manifests/
   ```

3. **Output files:**
   - `g3_w1_image_manifest.json` — Per-myth manifest
   - `g3_w2_image_manifest.json`
   - `g3_w3_image_manifest.json`
   - `g3_w4_image_manifest.json`
   - `batch_image_manifest.json` — Combined cross-myth manifest

4. **Feed to image pipeline:**
   The manifests are in IMAGE_NEED format. The image pipeline's `/image-search` can consume them directly:
   ```
   FOR each IMAGE_NEED in manifest:
     IF priority == "critical": search immediately
     IF type == "deity_scene": check deity-visual-canon.md first
     IF pipeline_stages includes "recreate": generate prompt from visual_concept
   ```

## Priority Levels

| Priority | Tags | Action |
|----------|------|--------|
| critical | A1_myth, ELEMENT_SOLO, CHARACTER | Source immediately — these block video production |
| important | A3_iconography, A5_deep_dive, B3_science | Source in batch — needed for lesson assembly |
| standard | A4, B4, B5, B6, BACKGROUND | Source opportunistically — nice to have |

## Integration Note

After running this command, the image pipeline should be invoked with the `--from-storyboard` pattern:

```
euclid-storyboard-myth-retelling (/storyboard-process)
       ↓ data/storyboards/*.storyboard_v2.json
euclid-storyboard-myth-retelling (/storyboard-to-manifest)
       ↓ data/manifests/*_image_manifest.json
euclid-image-pipeline (/image-pipeline --manifest data/manifests/batch_image_manifest.json)
       ↓ IMAGE_REF blocks + recreation prompts
Lesson Builder
```
