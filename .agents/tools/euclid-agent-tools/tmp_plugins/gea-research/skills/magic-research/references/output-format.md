# Research Output Format

All MAGIC-line investigation outputs MUST use these structured formats for compatibility with the graphnode ingestion system (Engine 1: Cortex) and lesson builder (Engine 3: Builder).

## Per-Finding Output Block

Each discrete research finding produces one block:

```yaml
FINDING:
  id: "[civ]_[period_abbrev]_[magic_line]_[sequence]"
  # e.g., "meso_ob_A_003" = Mesopotamia, Old Babylonian, A-line, finding 3

  magic_line: I | A | G | M | C
  civilization: string
  period: string
  date_range: [start_bce, end_bce]

  content:
    summary: "1–2 sentence finding statement"
    detail: "Full research paragraph with citations"
    evidence_type: textual | material | architectural | iconographic | mathematical | ethnographic
    confidence: high | medium | low | speculative

  geometric_elements:
    primary_gea: [list of GEA codes involved]
    primary_gem: [list of GEM codes involved, if applicable]
    dimensional_rendering: "0D | 1D | 2D | 2.5D | 3D"
    carrier_types: [list of carrier types where this appears]
    gek_t_tier: 1 | 2 | 3
    construction_sequence: "Description of how the form is produced"

  artifacts:
    - name: "Object name"
      museum: "Museum name"
      accession: "Accession/catalog number"
      date: "Date or date range"
      material: "Material description"
      dimensions: "Measurements if known"
      image_url: "Direct URL to image"
      image_quality: high | medium | low | missing
      image_needs: none | overlay | enhancement | ai_recreation
      description: "Detailed visual description (doubles as image prompt if AI recreation needed)"

  sources:
    - type: web | academic | museum_api | book
      url: "URL if web/api"
      citation: "Full citation"
      accessed: "YYYY-MM-DD"

  section_routing:
    # Which lesson sections this finding feeds, at what attenuation
    full: [list of section codes, e.g., "A2", "A3"]
    present: [list of section codes]
    seed: [list of section codes]
```

## Notch Registry Entry (After Full Scan)

After completing all 5 MAGIC-line investigations for a notch:

```yaml
NOTCH_REGISTRY_ENTRY:
  id: "[civ]_[period_abbrev]_[sequence]"
  civilization: string
  period: string
  date_range: [start, end]

  g_t_baseline:
    gea_range: integer  # count of GEA primitives in active use
    gem_complexity: low | moderate | high | very_high
    gekt_tier_max: 1 | 2 | 3
    dimensional_range: "e.g., 1D–3D"
    carrier_diversity: integer  # count of carrier types

  deviation_vector:
    delta_M: float
    delta_A: float
    delta_G: float
    delta_I: float
    delta_C: float
    magnitude: float  # |Δ|
    direction: "e.g., A+I dominant"

  element_candidates:
    - gea_gem: "e.g., GEM.8star(GEA.square×2, rot=45°)"
      intensification_evidence: "Summary of why this is intensifying"
      carrier_count: integer
      deity_associations: [list]
      a5_artifact_pool:
        - name: string
          museum: string
          accession: string
          quality_score: 1-5
      b5_invention_pool:
        - name: string
          gek_t_composition: string
          tier: 1 | 2 | 3

  power_context:
    political_structure: string
    ruling_authority: string
    recent_transitions: string
    propaganda_programs: string
    knowledge_restrictions: string

  formalization_state:
    known_math: [list of what M knows at this notch]
    formalization_gaps: [list of where G exceeds M]
    combination_gaps: [list of what could combine but hasn't]
    diffusion_gaps: [list of what exists but doesn't spread]

  image_manifest:
    total_images_found: integer
    high_quality: integer
    needs_overlay: integer
    needs_enhancement: integer
    needs_ai_recreation: integer
    missing_critical: [list of what's needed but not found]
```

## Image Reference Block

For every image sourced or needed:

```yaml
IMAGE_REF:
  id: "[finding_id]_img_[sequence]"
  source_type: museum_api | wikimedia | web_search | ai_generated
  url: "Full URL"
  local_path: "Path after download (filled by pipeline)"
  thumbnail_url: "If available"

  metadata:
    title: string
    museum: string
    accession: string
    date: string
    material: string
    artist_culture: string
    dimensions: string
    credit_line: string
    rights: "public domain | CC-BY | CC-BY-SA | restricted | unknown"

  quality:
    resolution: "WxH pixels if known"
    score: 1-5
    needs: none | geometric_overlay | quality_enhancement | ai_recreation

  geometric_analysis:
    gea_visible: [list of GEA codes]
    gem_visible: [list of GEM codes]
    overlay_description: "What the geometric overlay should highlight"
    overlay_type: "decomposition | symmetry_axes | construction_sequence | measurement"

  lesson_routing:
    target_sections: [list of section codes where this image belongs]
    role: primary_artifact | supporting_evidence | comparison | diagram | reconstruction
```

## Comparative Cross-Civilization Block

When comparing the same element across civilizations:

```yaml
COMPARATIVE:
  element: "GEA or GEM code"
  civilizations_compared: [list]

  timeline:
    - civilization: string
      earliest_appearance: "date"
      peak_intensity: "date range"
      carrier_types: [list]
      dimensional_max: "1D | 2D | 3D"
      formalization_date: "when mathematically documented, if ever"

  convergences:
    - description: "What's similar across civilizations"
      civilizations: [which ones]
      type: independent_invention | diffusion | shared_ancestor

  divergences:
    - description: "What differs"
      civilizations: [which ones]
      explanation: "Why the divergence (carrier constraints, ideological program, power structure)"

  pedagogical_value:
    compound_lens_contribution: "What this comparison adds to student understanding"
    contrast_type: "same element, different meaning | same meaning, different element | same function, different form"
```
