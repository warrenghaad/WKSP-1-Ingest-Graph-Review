---
description: "Run the full image pipeline: manifest → search → assess → overlay → recreate → output"
allowed-tools: WebSearch, WebFetch, Read, Write, Bash, Glob, Grep, Agent
---

# /image-pipeline — Full Image Pipeline

Run the complete 6-stage image pipeline for a lesson file or research output. This is the main composite command that orchestrates all other image commands.

## Usage

```
/image-pipeline <lesson_file> [--research <research_file>] [--grades 3,4,5] [--output-dir <path>]
```

## Instructions

Execute stages in order. Each stage produces structured output consumed by the next.

### Stage 1: MANIFEST — Extract Image Needs

1. Read the lesson file
2. If `--research` provided, also read the research findings file
3. Execute `/image-manifest` logic:
   - Map every section (A1-A7, B1-B8) to its image type
   - Extract named artifacts with accession numbers
   - Identify deity references → check deity-visual-canon.md
   - List all GEA/GEM codes mentioned
   - Flag carrier types and inventions
4. Output: `IMAGE_MANIFEST` with prioritized needs

### Stage 2: SEARCH — Find Images

For each `IMAGE_NEED` with priority `critical` or `important`:

1. Execute `/image-search` logic per museum-api-patterns.md:
   - Met Museum API (programmatic, public domain)
   - Wikimedia Commons API
   - British Museum (web search)
   - Smithsonian Open Access
2. Use BROAD 1-2 keyword searches
3. For named artifacts with accessions, search by accession number first
4. Output: `SEARCH_RESULT` blocks + `SEARCH_SUMMARY`

### Stage 3: ASSESS — Quality Score

For each search result:

1. Execute `/image-assess` logic per quality-rubric.md:
   - Fetch image metadata (resolution from API response)
   - Score: Resolution, Clarity, Relevance, GEA Visibility, Rights
   - Total score → determine action: USE / ENHANCE / RECREATE / REJECT
2. For USE/ENHANCE images: estimate overlay parameters
3. For RECREATE images: generate recreation prompt
4. Output: `IMAGE_ASSESSMENT` blocks + `BATCH_SUMMARY`

### Stage 4: OVERLAY — Create Geometric Annotations

For each image with action = USE or ENHANCE:

1. Determine overlay type from section mapping
2. Execute `/image-overlay` logic per overlay-specifications.md:
   - Estimate GEA position in image
   - Generate overlay specification JSON
   - Create Python PIL overlay script if needed
   - Apply overlay at 40% opacity
3. Output: Overlay images + `IMAGE_REF` blocks

### Stage 5: RECREATE — Generate Missing Images

For each image with action = RECREATE, or for sections with no search results:

1. Execute `/image-recreate` logic:
   - Build prompt from artifact description + deity canon + period style
   - Generate for each grade version if `--grades` specified
   - Enforce character consistency via deity-visual-canon.md
2. Output: `RECREATION_PROMPT` blocks ready for API submission
3. **Note:** Actual image generation requires external API (Gemini/DALL-E). This stage produces the prompts. If image generation APIs are available, execute them.

### Stage 6: MANIFEST OUTPUT — Final IMAGE_REF Assembly

Compile all results into a complete image manifest:

```yaml
PIPELINE_OUTPUT:
  lesson: string
  pipeline_run_date: "YYYY-MM-DD"

  statistics:
    total_images_needed: integer
    images_found: integer
    images_overlaid: integer
    images_needing_recreation: integer
    coverage_percentage: float

  images: [list of IMAGE_REF blocks]

  recreation_prompts: [list of RECREATION_PROMPT blocks]

  coverage_map:
    A1: { status: "covered|gap", image_id: string }
    A2: { status: "covered|gap", image_id: string }
    # ... all 15 sections

  next_actions:
    - "Generate 3 deity images via Gemini using provided prompts"
    - "Download and enhance 4 medium-quality museum images"
    - "Create comparison grid for A3 section"
```

Save to:
- `data/manifests/{lesson_slug}_pipeline_output.yaml` (full manifest)
- `data/manifests/{lesson_slug}_recreation_prompts.yaml` (prompts only, for API batch)
- `data/manifests/{lesson_slug}_coverage_report.md` (human-readable summary)

## Grade Parallelism

When `--grades 3,4,5`:
- Research and search ONCE (same artifacts for all grades)
- Overlays: same base images, same overlays
- Recreation prompts: generate 3 versions per deity/scene with grade-appropriate complexity
- Output: one manifest per grade, shared image pool

## Integration Flow

```
euclid-gea-research (/research-full-scan)
        ↓ FINDING blocks + artifact references
euclid-image-pipeline (/image-pipeline)
        ↓ IMAGE_REF manifest + recreation prompts
Lesson Builder (HTML assembly)
        ↓ Lessons with embedded images
The Face (display)
```
