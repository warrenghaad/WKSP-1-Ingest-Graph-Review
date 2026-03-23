---
description: "Generate a 3-Act storyboard from a single myth script or lesson file"
allowed-tools: Read, Write, Bash, Glob, Grep
---

# /storyboard-myth — Single Myth Storyboard Generation

Generate a three-act storyboard breakdown for one myth from a lesson file or myth script.

## Usage

```
/storyboard-myth <lesson_file> [--out <output_dir>] [--md] [--v1-compat]
```

## Instructions

1. **Read the lesson file** — HTML or Markdown
2. **Extract myth content** — Section A1 (myth script), deity, geometric element
3. **Run the storyboarder:**

```bash
python3 scripts/storyboarder_v2.py script \
  <lesson_file> \
  --out <output_dir> \
  --md
```

4. **Validate output:**
   - Confirm 3 acts (ABSENCE → TRANSFORMATION → LEGACY)
   - Confirm every panel has reuse_tags (non-empty)
   - Confirm visual_concept is ONE concept per panel
   - Check total panel count is reasonable (8–15 per myth)

5. **Report:**
   - Panel count per act
   - Total duration
   - Reuse tag coverage (which sections are served)
   - Any panels missing reuse tags (error)

## Post-Processing

After generating, you may want to:
- Enrich `extractable_assets` manually (the parser infers, but manual is richer)
- Add `grade_variants` with G3/G4/G5 narration text
- Feed the output JSON to `/storyboard-to-manifest` for image pipeline handoff
