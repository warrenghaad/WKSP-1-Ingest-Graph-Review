# EUCLID Image Pipeline Plugin

Automated image sourcing + design pipeline for the EUCLID curriculum. Searches museum APIs, assesses quality, creates geometric overlays, and generates AI recreation prompts.

## Commands

| Command | Description |
|---------|-------------|
| `/image-pipeline` | Full 6-stage pipeline: manifest → search → assess → overlay → recreate → output |
| `/image-search` | Search Met Museum, Wikimedia, British Museum, Smithsonian for artifact images |
| `/image-assess` | Quality-score images using 5-criteria rubric (25-point scale) |
| `/image-manifest` | Extract image needs from a lesson file |
| `/image-overlay` | Create geometric overlays (highlight, decomposition, measurement, etc.) |
| `/image-recreate` | Generate AI recreation prompts for missing/low-quality images |

## Pipeline Stages

```
RESEARCH FINDINGS → [1] MANIFEST → [2] SEARCH → [3] ASSESS → [4] OVERLAY → [5] RECREATE → [6] OUTPUT
```

## Integration

Works with the `euclid-gea-research` plugin:
- Research plugin produces FINDING blocks with artifact references
- Image pipeline turns those references into sourced, overlaid, ready-to-embed images

## Scripts

- `scripts/create_overlay.py` — PIL-based geometric overlay engine
- `scripts/museum_search.py` — Museum API search aggregator (Met, Wikimedia, Smithsonian)

## Museum API Priority

1. Metropolitan Museum of Art (Open Access API — programmatic, public domain)
2. Wikimedia Commons (broad coverage, good metadata)
3. British Museum (web search — excellent Mesopotamian collection)
4. Smithsonian Open Access (CC0)
5. Louvre Collections Online
