---
description: Compare a geometric element across multiple civilizations
allowed-tools: WebSearch, WebFetch, Read, Write, Bash, Grep, Glob
argument-hint: <element> <civilization1> <civilization2> [civilization3...]
---

# Cross-Civilization Comparative Research

Read the MAGIC research skill: @${CLAUDE_PLUGIN_ROOT}/skills/magic-research/SKILL.md
Load references:
@${CLAUDE_PLUGIN_ROOT}/skills/magic-research/references/output-format.md
@${CLAUDE_PLUGIN_ROOT}/skills/magic-research/references/gea-gem-taxonomy.md
@${CLAUDE_PLUGIN_ROOT}/skills/magic-research/references/civilization-scopes.md

## Parameters
Parse: element = $1, civilizations = $2, $3, $4...

## Procedure

### Phase 1: Element Profile
Look up the element in gea-gem-taxonomy.md. Establish:
- GEA code and properties
- If GEM: constituent GEAs and interaction rules
- Key mathematical properties (GEK)
- Perceptual affordance

### Phase 2: Per-Civilization Timeline
For each civilization specified, research:

1. **Earliest appearance** — when does this element first appear in the archaeological record?
   Search: "[ELEMENT] earliest [CIVILIZATION] archaeological"

2. **Peak intensity** — when is production volume / carrier diversity highest?
   Search: "[ELEMENT] [CIVILIZATION] peak production"

3. **Carrier types** — on what carriers does it appear?
   Search: "[ELEMENT] [CIVILIZATION] artifacts objects"

4. **Dimensional max** — what's the highest dimensional rendering achieved?

5. **Sacred/ideological meaning** — what does it MEAN in this civilization?
   Search: "[ELEMENT] symbolism meaning [CIVILIZATION]"

6. **Mathematical formalization** — when was it formally documented (if ever)?
   Search: "[ELEMENT] mathematics [CIVILIZATION] formalization"

7. **Functional deployment** — what inventions/technologies use it?
   Search: "[ELEMENT] invention technology [CIVILIZATION]"

8. **Key museum artifacts** — 2–3 best examples with image references
   Search museum APIs: "[ELEMENT] [CIVILIZATION]"

### Phase 3: Comparative Analysis
Across all civilizations researched:

1. **Convergences** — what's similar? Same element, same meaning? Same element, same function?
   Classify: independent invention / diffusion / shared ancestor

2. **Divergences** — what differs? Same element, different meaning? Different carrier emphasis?
   Explain: carrier constraints, ideological programs, power structures causing divergence

3. **Timeline alignment** — did civilizations arrive at the same geometric milestone at similar times? Or wildly different? What explains the timing?

4. **Formalization gap comparison** — who formalized first? Who practiced without formalizing? Where is the gap widest?

### Phase 4: Pedagogical Value Assessment
- **Compound lens contribution:** What does this comparison teach that single-civilization study doesn't?
- **Contrast type:** Same element/different meaning? Same meaning/different element? Same function/different form?
- **Grade-level considerations:** Which contrasts are most accessible for 3rd–5th grade?
- **Lesson sequence implications:** Does this comparison suggest a cross-civilization week? A comparison activity within a single week?

## Output
Write findings using the COMPARATIVE block format from output-format.md.
Save to workspace as `[element]_comparative_[civ1]_[civ2]_etc.yaml`.
Include a human-readable summary with:
- Timeline visualization (text-based)
- Key convergences and divergences
- Recommended pedagogical use
- Image manifest for all civilizations
