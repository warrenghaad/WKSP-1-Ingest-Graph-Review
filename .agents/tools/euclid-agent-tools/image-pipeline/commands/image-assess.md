---
description: "Quality-assess sourced images using the 5-criteria rubric"
allowed-tools: WebFetch, Read, Write, Bash, Glob, Grep
---

# /image-assess — Image Quality Assessment

Score sourced images against the 5-criteria quality rubric and determine action (USE / ENHANCE / RECREATE / REJECT).

## Usage

```
/image-assess <image_path_or_url> [--artifact "name"] [--gea "GEA.circle"] [--batch <manifest_path>]
```

## Instructions

1. **Load references:**
   - Read `@${CLAUDE_PLUGIN_ROOT}/skills/image-pipeline/references/quality-rubric.md`

2. **For each image:**

   **A. Resolution check:**
   - If local file: use Python PIL to get dimensions
     ```bash
     python3 -c "from PIL import Image; img=Image.open('PATH'); print(f'{img.size[0]}x{img.size[1]}')"
     ```
   - If URL: check headers or fetch and measure
   - Score per rubric (≥2000px = 5, 1500-1999 = 4, etc.)

   **B. Clarity assessment:**
   - View the image (Read tool for local files, or describe from metadata)
   - Assess focus, lighting, artifacts, compression quality
   - Score 1-5 per rubric

   **C. Relevance check:**
   - Compare image metadata (title, date, culture) against the target artifact
   - Exact accession match = 5, same type/period = 4, related = 3, etc.

   **D. GEA Visibility:**
   - Assess whether the target geometric element is clearly visible
   - Can you see the circle/crescent/star/triangle? Is it the dominant feature?
   - Score 1-5

   **E. Rights verification:**
   - Check: `isPublicDomain`, license metadata, museum terms
   - Public domain = 5, CC license = 4, educational use = 3, unclear = 2, restricted = 1

3. **Calculate total and determine action:**
   - 20-25 → USE
   - 15-19 → USE + ENHANCE
   - 12-14 → ENHANCE REQUIRED
   - 8-11 → RECREATE
   - 1-7 → REJECT

4. **For RECREATE actions**, generate a recreation prompt using:
   - The artifact description from research findings
   - The deity visual canon (if applicable): `@${CLAUDE_PLUGIN_ROOT}/skills/image-pipeline/references/deity-visual-canon.md`
   - Append style suffix: "Style: Archaeological reconstruction, [Period], circa [Date]"

5. **For USE/ENHANCE actions**, estimate overlay parameters:
   - Where is the GEA center in the image? (normalized 0-1 coordinates)
   - What scale is the GEA relative to the image?
   - Any rotation needed for alignment?
   - Suggested crop?

6. **Output IMAGE_ASSESSMENT block per quality-rubric.md format.**

7. **If --batch mode**, output a BATCH_SUMMARY at the end.

## Batch Mode

When `--batch <manifest_path>` is provided:
- Read the manifest (JSON or YAML file listing image paths/URLs)
- Assess each image in sequence
- Output individual assessments + final BATCH_SUMMARY
- Sort results by score descending
- Flag critical coverage gaps (sections with no usable images)
