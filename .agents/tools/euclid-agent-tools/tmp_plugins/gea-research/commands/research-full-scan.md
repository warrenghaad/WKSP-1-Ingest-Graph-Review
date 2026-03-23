---
description: Full 5-line MAGIC scan of a civilization-period notch
allowed-tools: WebSearch, WebFetch, Read, Write, Bash, Grep, Glob, Agent
argument-hint: <civilization> <period>
---

# Full MAGIC Scan — All Five Lines

Read the MAGIC research skill: @${CLAUDE_PLUGIN_ROOT}/skills/magic-research/SKILL.md
Load all references:
@${CLAUDE_PLUGIN_ROOT}/skills/magic-research/references/output-format.md
@${CLAUDE_PLUGIN_ROOT}/skills/magic-research/references/gea-gem-taxonomy.md
@${CLAUDE_PLUGIN_ROOT}/skills/magic-research/references/civilization-scopes.md

## Parameters
Parse: civilization = $1, period = $2

## Procedure

### Phase 1: Frame
Establish the notch parameters:
- Civilization and period from arguments
- Look up date range and known baseline from civilization-scopes.md
- Note any prior weeks / elements already taught (ask user if not specified)

### Phase 2: Run All Five Investigations
Execute each investigation command in sequence, building cumulative knowledge:

1. **G-Investigation FIRST** — establishes the geometric substrate everything else sits on.
   Run the full G-line probe set from `/research-geometry`.

2. **A-Investigation** — what's being MADE with that geometry.
   Run the full A-line probe set from `/research-aesthetics`.

3. **I-Investigation** — what sacred/institutional programs drive production.
   Run the full I-line probe set from `/research-ideology`.

4. **M-Investigation** — what's been FORMALIZED.
   Run the full M-line probe set from `/research-math`.

5. **C-Investigation** — who controls it all.
   Run the full C-line probe set from `/research-power`.

### Phase 3: Synthesize
After all five investigations complete:

1. **Compile the G(t) baseline** from G-investigation data
2. **Compute the deviation vector** — which MAGIC lines show highest intensification at this notch?
3. **Surface element candidates** — which GEA/GEM has highest |Δ|? List 2–3 with evidence.
4. **Surface deity candidates** — which ideological frames bind to the intensifying geometry? 1–3 per element.
5. **Build artifact pools** — A5 candidates (2–3 per element) and B5 candidates (1–2 per element)
6. **Compile image manifest** — total images found, quality assessment, overlay/enhancement needs
7. **Assess formalization gaps** — where does craft practice exceed written knowledge?
8. **Map power context** — who controls what at this notch?

### Phase 4: Generate Notch Registry Entry
Produce the full NOTCH_REGISTRY_ENTRY using the format in output-format.md.

### Phase 5: Generate Candidate Summary
Present candidates for pedagogical judgment with:
- Element-deity pairings ranked by |Δ|
- For each: A2 visual rhetoric potential, A5↔B5 bridge strength, compound lens contribution, museum artifact availability, grade-level fit
- Recommendation (but flag: "This is pedagogical judgment — human decision required")

## Output
Save the complete investigation to workspace:
- `[civ]_[period]_full_scan.yaml` — complete notch registry entry
- `[civ]_[period]_candidates.md` — human-readable candidate summary for pedagogical judgment
- `[civ]_[period]_image_manifest.yaml` — all images found with quality/needs assessment
- Individual investigation files: `[civ]_[period]_[I|A|G|M|C]_investigation.yaml`
