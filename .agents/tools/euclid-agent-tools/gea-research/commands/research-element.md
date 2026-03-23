---
description: Deep-dive research on a single geometric element at a specific notch
allowed-tools: WebSearch, WebFetch, Read, Write, Bash, Grep, Glob
argument-hint: <element> <civilization> <period>
---

# Single Element Deep Dive

Read the MAGIC research skill: @${CLAUDE_PLUGIN_ROOT}/skills/magic-research/SKILL.md
Load references:
@${CLAUDE_PLUGIN_ROOT}/skills/magic-research/references/output-format.md
@${CLAUDE_PLUGIN_ROOT}/skills/magic-research/references/gea-gem-taxonomy.md

## Parameters
Parse: element = $1, civilization = $2, period = $3

## Purpose
Unlike a full notch scan (which asks "what's happening HERE?"), this command asks "what is THIS ELEMENT doing at this notch?" Use this when an element candidate has already been surfaced and selected — this is the post-selection deep dive.

## Procedure

### Phase 1: Element Decomposition
1. Full GEA/GEM decomposition per taxonomy
2. All mathematical properties (GEK)
3. All possible transformations (GEK-T) and their tiers
4. Construction sequence analysis

### Phase 2: Archaeological Record — Complexity Progression
Research the element across complexity levels at this notch:

**Level 1 — Simple Decorative**
Search: "[ELEMENT] [CIVILIZATION] [PERIOD] decoration pottery motif"
Find: Where does the element appear as simple decoration? Painted bands, incised marks, stamped patterns.

**Level 2 — Symbolic/Semiotic**
Search: "[ELEMENT] [CIVILIZATION] [PERIOD] symbol meaning iconography"
Find: Where does the element carry meaning? Sacred associations, identity markers, status indicators.

**Level 3 — Structural/Compositional**
Search: "[ELEMENT] [CIVILIZATION] [PERIOD] composition design complex"
Find: Where is the element part of a larger GEM composition? Rosettes, tessellations, composite designs.

**Level 4 — Material Objects**
Search: "[ELEMENT] [CIVILIZATION] [PERIOD] seal disk mirror pendant"
Find: Where does the element define an entire object's form? Circular seals, triangular pendants, spiral bracelets.

**Level 5 — Nested/Recursive**
Search: "[ELEMENT] [CIVILIZATION] [PERIOD] nested concentric within"
Find: Where is the element nested within itself or within other elements? Bowls within bowls, circles within squares, spirals within circles.

**Level 6 — Functional Assembly**
Search: "[ELEMENT] [CIVILIZATION] [PERIOD] wheel spindle pulley mechanism"
Find: Where does the element's geometric properties enable functional work? Wheels, gears, lenses, structural arches.

**Level 7 — Monumental/Architectural**
Search: "[ELEMENT] [CIVILIZATION] [PERIOD] architecture temple monument"
Find: Where does the element operate at architectural scale? Domes, arches, colonnades, circular temples.

### Phase 3: Image Sourcing Marathon
For EACH complexity level, find 3–5 artifact images:
1. Met Museum API: "[ELEMENT] [CIVILIZATION]"
2. British Museum: "[ELEMENT] [CIVILIZATION] [PERIOD]"
3. Wikimedia: "[ELEMENT] [CIVILIZATION] artifact"
4. Academic sources for specific named objects

For EACH image, complete the full IMAGE_REF block including:
- Quality assessment
- Overlay needs (what geometric decomposition to draw)
- Lesson section routing

### Phase 4: MAGIC Weight Profile
Assess this element at this notch across all five lines:
- I: How ideologically charged? (0.0–1.0)
- A: How aesthetically productive? (0.0–1.0)
- G: How geometrically complex? (0.0–1.0)
- M: How mathematically formalized? (0.0–1.0)
- C: How politically controlled? (0.0–1.0)

### Phase 5: Lesson Routing Proposal
Based on findings, propose:
- A1: Which myth/narrative hooks this element?
- A2: What visual rhetoric principle does it embody? (the three-stage broadcast)
- A3: Which 3–5 artifacts demonstrate carrier diversity?
- A4: What power/access dynamics surround it?
- A5: Which single artifact best crystallizes the visual rhetoric?
- B2: What mathematical property defines it?
- B5: What invention deploys this property functionally?
- A5↔B5 bridge: Same spatial skill, two registers?

## Output
Save comprehensive element dossier to workspace:
- `[element]_[civ]_[period]_dossier.yaml` — full structured data
- `[element]_[civ]_[period]_images.yaml` — complete image manifest
- `[element]_[civ]_[period]_routing.md` — lesson section routing proposal
