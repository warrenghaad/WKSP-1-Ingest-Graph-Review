---
description: C-line MAGIC investigation — power, control, access structures
allowed-tools: WebSearch, WebFetch, Read, Write, Bash, Grep, Glob
argument-hint: <civilization> <period> [element]
---

# C-Line Investigation: Power — "Who controls production, deployment, knowledge, and access?"

Read the MAGIC research skill first: @${CLAUDE_PLUGIN_ROOT}/skills/magic-research/SKILL.md

Then load the output format: @${CLAUDE_PLUGIN_ROOT}/skills/magic-research/references/output-format.md

## Parameters
Parse from arguments: civilization = $1, period = $2, element (optional) = $3

## Core Question
Who holds power at this notch? What political structures are commissioning geometric production? What is restricted vs. diffused? What recently changed hands? Who benefits and who is excluded?

## Research Probes — Execute Each

### Probe 1: Political Landscape
Search: "[CIVILIZATION] [PERIOD] political structure governance", "[CIVILIZATION] [PERIOD] king ruler dynasty"
Find: What is the political structure? City-state, empire, theocratic state? Who rules? How recently did power change? Stable or contested?

### Probe 2: Patronage and Commission
Search: "[CIVILIZATION] [PERIOD] royal patronage art production", "[CIVILIZATION] [PERIOD] temple economy craft workshop"
Find: Who FUNDS geometric form production? Temple economies, royal workshops, independent artisans, merchant classes? Relationship between political authority and aesthetic production?

### Probe 3: Access and Restriction
Search: "[CIVILIZATION] social class access [PERIOD]", "[CIVILIZATION] [PERIOD] sumptuary law regulation"
Find: Which geometric forms, carriers, and techniques are RESTRICTED? Who may use them? Sumptuary laws, guild regulations, sacred prohibitions? Who is excluded?

### Probe 4: Prestige Cascade
Search: "[CIVILIZATION] [PERIOD] elite imitation social", "[CIVILIZATION] prestige goods [PERIOD]"
Find: Evidence of C-directive production (power mandates what's made) vs. C-aspirational production (lower-status groups imitate elite choices)? How does element deployment differ across classes?

### Probe 5: Knowledge Monopoly
Search: "[CIVILIZATION] [PERIOD] scribal school education access", "[CIVILIZATION] [PERIOD] knowledge restriction technology access"
Find: Who controls MATHEMATICAL knowledge? Scribal schools → who attends? Astronomical observation → who has access? Engineering knowledge → guild-controlled, palace-controlled, temple-controlled?

### Probe 6: Political Geometry
Search: "[DEITY_CANDIDATE] political significance [CIVILIZATION]", "[CIVILIZATION] [PERIOD] propaganda state ideology"
Find: How do political transitions change the geometric landscape? Deity ascendancy maps political power. Iconography = state propaganda. Research the political history of each deity candidate.

### Probe 7: Suppression and Loss
Search: "[CIVILIZATION] [PERIOD] destruction conquest cultural loss", "[CIVILIZATION] [PERIOD] knowledge lost"
Find: What geometric knowledge/traditions were SUPPRESSED, destroyed, or lost? What was available-but-not-combined (combination gap)? What existed but didn't spread (diffusion gap)?

## Section Routing for C-Line Findings
- **A4c–f (FULL):** Social diffusion and access analysis.
- **B4 (FULL):** Engineering patronage and power dynamics.
- **A7 (PRESENT):** Who commissioned the monumental architecture and why.
- **B5 (PRESENT):** Who controlled the invention — patronage, monopoly, labor.
- **B8 (PRESENT):** Power shapes both registers — whose function, whose meaning.
- **A1 (SEED):** The political backdrop of the myth — the king who built the temple.
- **A2 (SEED):** Whose aesthetic standards governed production.
- **A3 (SEED):** Was production centralized or distributed?
- **A5 (SEED):** Who was the artifact made FOR?
- **B2 (SEED):** Who had access to mathematical knowledge?
- **B3 (SEED):** Who had access to transformation knowledge?

## Output
Write ALL findings using the FINDING block format. Save to workspace as `[civilization]_[period]_C_investigation.yaml`.
Summarize: political structure, patronage model, access restrictions identified, prestige cascade evidence, knowledge monopoly assessment, suppression/loss events, and power dynamics affecting geometric production.
