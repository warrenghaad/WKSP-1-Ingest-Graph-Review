---
name: research-director
description: >
  EUCLID research routing engine — takes gap reports from the gap-assessor and routes
  targeted research tasks to the euclid-gea-research plugin's MAGIC-line investigation
  commands. Determines which MAGIC lines to investigate, what search queries to run,
  which museum APIs to hit, and what artifacts to source. Use this skill whenever someone
  asks to "fix these gaps", "research what's missing", "fill in the missing content",
  "source artifacts for this section", "find what we need for A3", "direct research to
  fix this lesson", "route research tasks", "what research do we need?", or any request
  to determine and execute research needed to complete lesson content. Also trigger when
  someone says "this section needs sourcing", "find museum artifacts for [section]",
  "investigate what's missing", or "run targeted research for [gap]".
version: 0.1.0
---

# EUCLID Research Director

## Purpose

You are the bridge between gap identification and gap resolution. You take a gap report (from gap-assessor) or a direct request and produce targeted research directives that the euclid-gea-research plugin can execute. You don't do the research yourself — you route it precisely.

The research-director understands the MAGIC routing matrix: which MAGIC lines feed which sections, and at what attenuation. A gap in A3 (sacred art) needs A-line + I-line research. A gap in B5 (invention) needs M-line + G-line research. You know which investigation commands to call and what search parameters to use.

## The Routing Matrix

This matrix shows which MAGIC-line investigations feed which sections, and at what intensity:

```
              A1    A2    A3    A4    A5    A6    A7    B1    B2    B3    B4    B5    B6    B7    B8
I (Ideology)  FULL  PRES  FULL  FULL  SEED  SEED  PRES  PRES  SEED  SEED  PRES  SEED  SEED  SEED  PRES
A (Aesthetics)PRES  FULL  FULL  PRES  FULL  FULL  PRES  PRES  SEED  SEED  PRES  PRES  PRES  SEED  PRES
G (Geometry)  PRES  FULL  PRES  PRES  FULL  FULL  FULL  PRES  FULL  FULL  FULL  FULL  FULL  FULL  FULL
M (Math)      SEED  PRES  SEED  SEED  PRES  SEED  PRES  SEED  FULL  FULL  PRES  FULL  FULL  FULL  PRES
C (Power)     SEED  SEED  SEED  FULL  SEED  SEED  PRES  SEED  SEED  SEED  FULL  PRES  SEED  SEED  PRES
```

FULL = Primary content source. Maximum research depth.
PRES = Supporting context. Moderate research depth.
SEED = Background implication. Minimal research, but seeds for later sections.

## Research Directive Workflow

### Step 1: Analyze Gaps

Accept input as either:
- A `GAP_REPORT` from the gap-assessor (structured YAML)
- A direct request ("we need artifacts for A3 in Mesopotamia Old Babylonian period")

From the gap report, extract:
- Which sections have gaps
- What type of gap (content, images, sourcing, structural)
- What the specific missing items are

### Step 2: Map Gaps to MAGIC Lines

For each gap, determine which MAGIC-line investigation(s) will resolve it:

| Gap Type | Primary MAGIC Line | Research Command |
|----------|-------------------|------------------|
| Missing myth/narrative | I (Ideology) | `/research-ideology` |
| Missing artifacts/images | A (Aesthetics) | `/research-aesthetics` |
| Missing GEA/GEM analysis | G (Geometry) | `/research-geometry` |
| Missing math properties | M (Mathematics) | `/research-math` |
| Missing power/access context | C (Power) | `/research-power` |
| Missing everything for a notch | All | `/research-full-scan` |
| Missing specific element data | Element-specific | `/research-element` |
| Missing cross-civ comparison | Comparative | `/research-compare` |

### Step 3: Generate Research Directives

For each gap, produce a precise research directive:

```yaml
RESEARCH_DIRECTIVE:
  id: "RD_[section]_[sequence]"
  priority: critical | high | medium | low
  source_gap: "Reference to the gap-report action item"

  target:
    section: "[section code]"
    dimension: "content | images | sourcing | structural"
    specific_need: "Exactly what's missing"

  research_task:
    command: "/research-ideology | /research-aesthetics | /research-geometry | /research-math | /research-power | /research-full-scan | /research-element | /research-compare"
    parameters:
      civilization: "[civ]"
      period: "[period]"
      element: "[if known]"
    search_queries:
      - query: "Specific search string"
        target_api: "Met Museum | British Museum | Wikimedia | Smithsonian | Louvre | WebSearch"
        expected_results: "What we're looking for"

  expected_output:
    finding_type: "FINDING | IMAGE_REF | NOTCH_REGISTRY_ENTRY | COMPARATIVE"
    target_sections: [which sections will consume this research]
    attenuation: "FULL | PRESENT | SEED"

  routing:
    after_research: "content-drafter | image-designer | both"
    instructions: "What to do with the findings once obtained"
```

### Step 4: Prioritize and Sequence

Order directives by:
1. **Critical gaps first** — structural violations, missing mandatory sections
2. **Upstream before downstream** — research A2 before A5 (A2 defines what A5 crystallizes)
3. **High-reuse findings first** — research that feeds multiple sections
4. **Image sourcing in parallel** — image searches can run alongside content research

### Step 5: Execute or Queue

Depending on context:
- **If running live:** Execute the research commands directly using the gea-research plugin
- **If producing a plan:** Output the full directive list for batch execution

## Search Strategy Intelligence

The research-director knows how to construct effective search queries per section need:

### For A1 (Myth Hook):
```
Queries: "[deity] relief", "[deity] mythology [civilization]", "[deity] temple [period]"
APIs: Wikimedia first (broad), then Met Museum (high-quality images)
```

### For A2 (Visual Rhetoric):
```
Queries: "[element] [civilization] close-up detail", "[element] motif [period]", "GEA composition [element]"
APIs: Met Museum first (high-res public domain), then academic sources
Need: Multiple instances showing the SAME geometric property
```

### For A3 (Iconographic Chain):
```
Queries: "[element] [deity] [carrier_type]" for each carrier type (seal, relief, vessel, architecture, votive)
APIs: All museum APIs — breadth matters here
Need: 3–5 different carrier types, same element
```

### For A4 (Material Culture):
```
Queries per sub-section:
  a: "[element] temple sacred [civilization]"
  b: "[element] ritual [civilization] [period]"
  c: "[element] seal administrative [civilization]"
  d: "[element] pottery household [civilization]"
  e: "[element] architecture civic [civilization]"
  f: "[element] jewelry amulet [civilization]"
Need: Different artifact categories, named specific objects
```

### For A5/B5 (Crystallization):
```
A5: "[specific artifact name]", "[artifact] museum accession"
B5: "[specific invention] [civilization]", "[element] mechanism [period]"
APIs: Direct museum search by known artifact name
Need: ONE primary object, maximum detail
```

### For B2 (Math Properties):
```
Queries: "[element] mathematical properties", "[element] symmetry group", "[element] geometric proof [civilization]"
Sources: Academic/mathematical sources, not just museum APIs
Need: Formal properties that can be stated precisely
```

### For B4 (Historical Lineage):
```
Queries: "[element] history engineering", "[element] evolution mechanism", "[element] invention timeline"
Sources: History of science/technology sources
Need: Chronological sequence showing functional deployment
```

## Integration Points

**Upstream:** Receives gap reports from `gap-assessor`
**Executes via:** `euclid-gea-research` plugin commands (`/research-*`)
**Downstream:** Passes findings to `content-drafter` (for text) and `image-designer` (for visuals)

## References

For the MAGIC-line research methodology and output formats:
- `@gea-research/skills/magic-research/SKILL.md`
- `@gea-research/skills/magic-research/references/output-format.md`

For civilization-specific search scopes:
- `@gea-research/skills/magic-research/references/civilization-scopes.md`

For museum API patterns:
- `@image-pipeline/skills/image-pipeline/references/museum-api-patterns.md`

For section-specific requirements (what each section needs):
- `@lesson-engine/skills/section-interpreter/references/section-requirements.md`
