---
description: "Extract image needs from a lesson file and generate an image requirements manifest"
allowed-tools: Read, Write, Bash, Glob, Grep
---

# /image-manifest — Lesson Image Needs Extraction

Analyze a lesson file and produce a structured manifest of every image needed, mapped to sections.

## Usage

```
/image-manifest <lesson_file_path> [--output <manifest_path>]
```

## Instructions

1. **Read the lesson file** (markdown or HTML)

2. **For each of the 15 sections (A1-A7, B1-B8), identify image needs:**

   | Section | Image Type | What's Needed |
   |---------|-----------|---------------|
   | A1 (Hook) | Deity scene | Full deity depiction per visual canon |
   | A2 (Visual Rhetoric) | Artifact with GEA highlight | Primary artifact + GEA overlay (highlight type) |
   | A3 (Carrier Diversity) | Multiple carriers | 3-5 images showing same GEA on different carriers |
   | A4 (Power/Connection) | Power context | Image showing political/institutional use |
   | A5 (Primary Artifact) | Artifact with decomposition | Primary artifact + full GEA/GEM decomposition overlay |
   | A6 (Student Activity) | Construction steps | Step-by-step construction sequence images |
   | A7 (Pivot) | Architectural photo | Monument, building, or site photograph |
   | B1 (Recall) | Recap diagram | Simple GEA diagram (can be generated) |
   | B2 (GEK Property) | Math diagram | Measurement overlay showing properties |
   | B3 (3D Transform) | 3D visualization | Dimensional rendering (can be generated) |
   | B4 (Invention Throughline) | Invention scene | Historical scene showing invention in use |
   | B5 (STEM Notch) | Technical diagram | Functional overlay: GEA → mechanism |
   | B6 (Decomposition) | Construction sequence | Numbered step overlay |
   | B7 (Student Build) | Activity steps | Step-by-step build photos/diagrams |
   | B8 (Compound Lens) | Summary composite | Multi-register image showing both meanings |

3. **Extract from lesson content:**
   - Named artifacts (with accession numbers if present)
   - Deity references (→ look up in deity-visual-canon.md)
   - GEA/GEM codes mentioned
   - Carrier types listed
   - Inventions referenced
   - Any existing image paths or URLs

4. **For each image need, output:**

```yaml
IMAGE_NEED:
  section: "A2"
  type: "artifact_with_overlay"
  description: "Cylinder seal showing Shamash with sun disk rays"
  target_artifact:
    name: "Cylinder seal with sun god"
    museum: "Walters Art Museum"
    accession: "42.638"
  gea_target: "GEA.circle"
  gem_target: null
  overlay_type: "highlight"
  priority: critical | important | nice_to_have
  existing_source: null | "URL or path if already found"
  search_keywords: ["mesopotamia seal", "shamash cylinder seal", "sun god seal"]
  fallback_strategy: "Search Met API for 'mesopotamia seal', then Wikimedia for 'Shamash seal'"
```

5. **Output final manifest:**

```yaml
IMAGE_MANIFEST:
  lesson: "Grade 3 Week 1 — Shamash & Circle"
  total_images_needed: integer
  by_priority:
    critical: integer      # lesson cannot function without these
    important: integer     # significantly enhances lesson
    nice_to_have: integer  # bonus enrichment
  by_type:
    deity_scene: integer
    artifact_photo: integer
    overlay_needed: integer
    construction_sequence: integer
    diagram: integer
    architectural: integer
  already_sourced: integer
  needs_search: integer
  needs_generation: integer
  sections_covered: [list]
  sections_gaps: [list]

  needs: [list of IMAGE_NEED blocks]
```

6. **Save manifest** to `--output` path or default `data/manifests/{lesson_slug}_image_manifest.yaml`
