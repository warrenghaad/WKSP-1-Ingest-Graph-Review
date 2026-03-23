---
description: "Generate all myth storyboards from the THREE_ACT_STORYBOARDING_PROCESS.md document"
allowed-tools: Read, Write, Bash, Glob, Grep
---

# /storyboard-process — Batch Storyboard Generation from Process Document

Parse the canonical Three-Act Storyboarding Process document and generate storyboards for all myths in one pass.

## Usage

```
/storyboard-process [--out <output_dir>] [--md] [--v1-compat]
```

## Instructions

1. **Locate the process document:**
   ```
   references/three-act-process.md
   ```

2. **Run the storyboarder in process mode:**

```bash
python3 scripts/storyboarder_v2.py process \
  references/three-act-process.md \
  --out <output_dir> \
  --md --v1-compat
```

3. **Expected output (Mesopotamia pilot):**

| Myth | Week | Panels | Duration |
|------|------|--------|----------|
| Shamash / Circle | W1 | 10 | ~72s |
| Sin / Crescent | W2 | 10 | ~76s |
| Ishtar / 8-Star | W3 | 11 | ~82s |
| Ninurta / Triangle | W4 | 11 | ~88s |
| **TOTAL** | | **42** | **~318s** |

4. **Validate:**
   - 4 storyboard JSON files (one per myth)
   - 1 `asset_reuse_matrix.json` (cross-myth tag map)
   - All 11 reuse tags represented
   - 42 total panels

5. **Feed to image pipeline:**
   ```
   /storyboard-to-manifest --storyboard-dir <output_dir>
   ```

## When to Use

- First run when setting up the Mesopotamia pilot image production
- After any edits to `three-act-process.md` (source of truth for panel specs)
- When rebuilding the image manifest from scratch
