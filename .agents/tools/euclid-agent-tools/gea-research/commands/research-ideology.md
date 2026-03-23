---
description: I-line MAGIC investigation — ideology, myth, sacred structures
allowed-tools: WebSearch, WebFetch, Read, Write, Bash, Grep, Glob
argument-hint: <civilization> <period> [element]
---

# I-Line Investigation: Ideology — "What sacred and institutional structures are active?"

Read the MAGIC research skill first: @${CLAUDE_PLUGIN_ROOT}/skills/magic-research/SKILL.md

Then load the output format: @${CLAUDE_PLUGIN_ROOT}/skills/magic-research/references/output-format.md

## Parameters
Parse from arguments: civilization = $1, period = $2, element (optional) = $3

## Core Question
What myths, cosmological claims, ritual traditions, and institutional programs are ACTIVE at this civilization-period notch? What deities are being elevated, contested, or consolidated? What ideological programs are driving the production of geometric forms?

## Research Probes — Execute Each

### Probe 1: Mythological Landscape
Search: "[CIVILIZATION] [PERIOD] religion pantheon structure", "[CIVILIZATION] creation myth cosmology"
Find: What creation narratives, deity cycles, and cosmological models are current? What is the pantheon structure — which deities are ascendant, which declining?

### Probe 2: Sacred Geometry Claims
Search: "[CIVILIZATION] sacred geometry cosmology", "[CIVILIZATION] [DEITY] geometric symbol iconography"
Find: Which geometric forms carry sacred significance? What cosmological meanings are attributed to spatial configurations? (circular path = justice, 8-fold star = divine radiance, stepped platform = cosmic mountain)

### Probe 3: Ritual Requirements
Search: "[CIVILIZATION] ritual practice [PERIOD] archaeological evidence", "[CIVILIZATION] [PERIOD] temple ceremony"
Find: What ceremonies, festivals, and institutional practices REQUIRE specific geometric forms? Is there a "correct" deployment? What are consequences of incorrect deployment?

### Probe 4: Textual Evidence
Search: "[CIVILIZATION] [DEITY] hymn inscription", "[CIVILIZATION] [PERIOD] religious text translation"
Find: Hymns, prayers, inscriptions, legal codes, omen texts — what written record documents the sacred status of geometric forms?

### Probe 5: Institutional Apparatus
Search: "[CIVILIZATION] [PERIOD] temple economy", "[CIVILIZATION] [PERIOD] priesthood scribal school"
Find: What temples, priesthoods, scribal schools, and ritual bureaucracies maintain the ideological program?

### Probe 6: Ideological Change
Search: "[CIVILIZATION] [PERIOD] political theology", "[CIVILIZATION] [PERIOD] propaganda state ideology"
Find: Is the ideological landscape STABLE or SHIFTING? Is a new deity ascending? Is a political transition rewriting the sacred hierarchy? A deity's elevation is NEVER purely theological — it legitimizes a political structure.

## Image Sourcing
For each deity and sacred object identified, search museum APIs for:
- Deity iconography (statues, reliefs, seal impressions)
- Sacred architectural elements (temple plans, ziggurats, altars)
- Ritual objects with geometric decoration
- Textual artifacts (hymn tablets, inscription stones)

Record EVERY image using the IMAGE_REF format from the output spec.

## Section Routing for I-Line Findings
- **A1 (FULL):** The myth itself. The sacred narrative. The hook.
- **A3 (FULL):** The sacred artistic tradition deploying this ideology visually.
- **A4a/b (FULL):** Institutional regulation of the element's sacred use.
- **A2 (PRESENT):** What meanings the geometry PERMITS — ideological loading given perceptual affordance.
- **A7 (PRESENT):** What ideological program the monumental architecture serves.
- **B1 (PRESENT):** The register shift — "yes, it was sacred. And it held up a building."
- **B4 (PRESENT):** What institutional structures funded the engineering.
- **B8 (PRESENT):** Synthesis — circumnutating relationship between sacred meaning and functional deployment.
- **A5 (SEED):** Workshop tradition institutional context.
- **B2 (SEED):** Scribal/mathematical tradition that formalized the property.
- **B5 (SEED):** The invention still carries metaphor — the wheel is also a cosmic cycle.

## Output
Write ALL findings using the FINDING block format. Save to the workspace as `[civilization]_[period]_I_investigation.yaml`.
At the end, summarize: deity candidates surfaced, geometric forms with sacred significance identified, ideological programs active, and any element candidates with high |Δ| on the I-line.
