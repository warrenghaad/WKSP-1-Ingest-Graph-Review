---
description: A-line MAGIC investigation — art, material production, visual rhetoric
allowed-tools: WebSearch, WebFetch, Read, Write, Bash, Grep, Glob
argument-hint: <civilization> <period> [element]
---

# A-Line Investigation: Aesthetics — "What is being MADE, and how?"

Read the MAGIC research skill first: @${CLAUDE_PLUGIN_ROOT}/skills/magic-research/SKILL.md

Then load the output format and GEA taxonomy:
@${CLAUDE_PLUGIN_ROOT}/skills/magic-research/references/output-format.md
@${CLAUDE_PLUGIN_ROOT}/skills/magic-research/references/gea-gem-taxonomy.md

## Parameters
Parse from arguments: civilization = $1, period = $2, element (optional) = $3

## Core Question
What geometric forms are being PRODUCED in high volume at this notch? On what carriers? With what techniques? Where is visual rhetoric most sophisticated or most rapidly changing? What's new versus inherited?

## Research Probes — Execute Each

### Probe 1: Production Census
Search: "[CIVILIZATION] [PERIOD] material culture geometric motifs", "[CIVILIZATION] art [PERIOD] iconography survey"
Find: What geometric forms appear in the material record? Which are most frequent? Which are new? Which inherited with modifications? Which disappearing?

### Probe 2: Carrier Diversity
Search: "[ELEMENT] [CIVILIZATION] carrier types", "[CIVILIZATION] [PERIOD] [CARRIER_TYPE] collection"
Find: For each candidate element — on how many carrier types does it appear? (Seals, pottery, textiles, architecture, sculpture, metalwork, jewelry, tablets.) Carrier diversity = direct measure of GEpHR intensification.

### Probe 3: Visual Rhetoric Analysis
Search: "[ELEMENT] [CIVILIZATION] visual analysis", "[ELEMENT] compositional properties symmetry"
Find: What is the perceptual affordance? What compositional properties (symmetry, proportion, line direction, contrast, scale) create the cognitive effect? What meaning does the geometry PERMIT vs. EXCLUDE? Raw material for A2.

### Probe 4: Construction Technique
Search: "[ELEMENT] construction technique archaeological evidence", "[CIVILIZATION] [PERIOD] craft technique [CARRIER]"
Find: How are makers producing these forms? What tools, sequences, material decisions? Where are compass marks, grid systems, modular proportions visible? Raw material for A5 and the liminal skill pathway.

### Probe 5: Style Evolution
Search: "[CIVILIZATION] [PERIOD] artistic innovation stylistic change", "[ELEMENT] [CIVILIZATION] style evolution"
Find: Is aesthetic treatment CHANGING at this notch? More complex, standardized, diverse? Evidence of competing styles (regional, workshop-level, class-level)?

### Probe 6: Craft Infrastructure
Search: "[CIVILIZATION] [PERIOD] craft production workshop", "[CIVILIZATION] artisan [PERIOD] apprenticeship"
Find: What workshops, material supply chains, and apprenticeship systems support production?

## Image Sourcing — CRITICAL FOR A-LINE
This investigation is the primary image source. For every artifact identified:
1. Search Met Museum API: "[CIVILIZATION] [ELEMENT]" (BROAD first)
2. Search British Museum collection: "[CIVILIZATION] [ELEMENT]"
3. Search Wikimedia Commons: "[ELEMENT] [CIVILIZATION] [PERIOD]"
4. For each result record the full IMAGE_REF block
5. Assess quality: does this image clearly show the geometric element?
6. Flag for overlay: what geometric decomposition should be drawn on top?

Aim for 3–5 HIGH-QUALITY artifact images per carrier type identified.

## Section Routing for A-Line Findings
- **A2 (FULL):** Visual rhetoric mechanism (the three-stage broadcast).
- **A3 (FULL):** Carrier diversity evidence.
- **A5 (FULL):** The single best artifact and its construction technique.
- **A6 (FULL):** The activity design.
- **A7 (PRESENT):** Monumental aesthetic context.
- **B1 (PRESENT):** The aesthetic-to-functional bridge context.
- **B4 (PRESENT):** Craft-to-engineering production context.
- **B5 (PRESENT):** The craft-to-engineering bridge.
- **A1 (PRESENT):** The visual world the myth inhabits.
- **B6 (PRESENT):** Construction technique informing engineering practice.

## Output
Write ALL findings using the FINDING block format with full artifact/image documentation. Save to workspace as `[civilization]_[period]_A_investigation.yaml`.
Summarize: production volume leaders, carrier diversity counts, style evolution assessment, top artifact candidates for A5, and any element candidates with high |Δ| on the A-line.
