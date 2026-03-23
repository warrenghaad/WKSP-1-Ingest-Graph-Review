---
name: magic-research
description: >
  EUCLID MAGIC-line research framework for investigating geometric elements across civilizations.
  Use when the user asks to "research a geometric element", "investigate a civilization notch",
  "run a MAGIC scan", "find archaeological examples of [shape]", "trace [element] through history",
  "research circles in Mesopotamia", "investigate triangles in Egypt", "scan a notch",
  "run an I-investigation", "run an A-investigation", "research GEAs", "research GEMs",
  or any request involving geometric element research across civilizations with MAGIC-line methodology.
version: 0.1.0
---

# EUCLID MAGIC-Line Research Framework

## Core Premise

A research investigation is NOT "research X element." It is "research what is geometrically happening at this civilization-period notch." The element and deity are OUTPUTS of the investigation — what the historical record reveals as the dominant geometric activity at that notch.

## The Five MAGIC Lines

Every investigation runs through five simultaneous lenses. All five are ALWAYS ON — the weight vector is a frequency tuning (graphic equalizer), not an on/off switch.

| Line | Domain | Core Question |
|------|--------|---------------|
| **I** — Ideology | Sacred/institutional structures | What myths, cosmologies, ritual traditions, and institutional programs are ACTIVE? What deities are being elevated/contested? |
| **A** — Aesthetics | Material production & visual rhetoric | What geometric forms are being PRODUCED in volume? On what carriers? With what techniques? Where is visual rhetoric most sophisticated? |
| **G** — Geometry | Spatial truth & composition | What GEA/GEM compositions are detectable? What dimensional range? What construction sequences? What is the G(t) baseline? |
| **M** — Mathematics | Formalized knowledge & function | What has been FORMALIZED (proven, calculated, measured)? What functional capabilities result? What is practiced but NOT formalized (the gap)? |
| **C** — Power | Control & access structures | Who holds power? Who funds production? What is restricted vs. diffused? Who controls knowledge? Who benefits, who is excluded? |

## Research Workflow

### Step 1: Frame Parameters
```
Civilization:     [e.g., Mesopotamia]
Period:           [e.g., Old Babylonian, 2000–1600 BCE]
Prior weeks:      [what elements already taught]
Grade level:      [3, 4, or 5]
```
Element, deity, artifact, and invention are NOT inputs. They EMERGE from Step 2.

### Step 2: Run MAGIC-Line Investigations (Parallel)
Execute the relevant command(s): `/research-ideology`, `/research-aesthetics`, `/research-geometry`, `/research-math`, `/research-power`. Or use `/research-full-scan` for all five.

### Step 3: Surface Candidates
From the five investigations, identify:
- **Element candidates:** Which GEA/GEM shows highest |Δ| (intensification) at this notch? List 2–3.
- **Deity candidates:** Which ideological frames are most tightly bound to the intensifying geometric activity? List 1–3 per element.
- **A5 artifact pool:** Which objects best crystallize the visual rhetoric principle? List 2–3 per element.
- **B5 invention pool:** Which functional stabilizations deploy the same geometric properties? List 1–2 per element.

### Step 4: Pedagogical Judgment (Human Decision)
Selection criteria: richest A2 visual rhetoric? Strongest A5↔B5 bridge? Best compound lens contribution? Best museum artifacts? Most grade-appropriate?

## GEA/GEM Taxonomy

See `references/gea-gem-taxonomy.md` for the full geometric element taxonomy including:
- 8–10 core GEA primitives (circle, triangle, square, spiral, hexagon, arc, parallel lines, cross, ellipse, star)
- GEM composition rules (how GEAs combine)
- Dimensional rendering levels (1D incised → 2D relief/painted → 3D sculptural/architectural)
- Carrier types and constraints

## Civilization Scopes

See `references/civilization-scopes.md` for the ~20 civilization-period scopes including date ranges, known geometric activity baselines, and key archaeological sites.

## Output Format

All research outputs MUST use the structured format in `references/output-format.md`. This format is designed to feed directly into the graphnode ingestion system (Engine 1: Cortex) and the texeditor system (Engine 3: Builder).

## Search Strategy Rules

1. Use BROAD 1–2 keyword searches first (e.g., "mesopotamia circle" not "neo-assyrian cylinder seal depicting shamash sun disk 850 BCE")
2. Search museum APIs in priority order: Met Museum → British Museum → Louvre → Smithsonian → Wikimedia Commons
3. For EVERY artifact found, record: name, museum, accession number, date, material, dimensions, image URL
4. For EVERY image, note whether it needs: geometric overlay, quality enhancement, or AI recreation
5. Cross-reference text sources with material evidence — claims without archaeological support get flagged
6. Track the formalization gap: where does craft practice exceed written mathematical knowledge?

## Attenuation Model

Research findings route to lesson sections at different attenuation levels:
- **FULL (weight ≥ 0.7):** Maximum research depth. Primary content.
- **PRESENT (0.3–0.6):** Contextual depth. Supporting content.
- **SEED (< 0.3):** Implication depth. Seeds for later sections.

What's attenuated in A1 is often load-bearing in B4 or B5. Research seeds NOW so later sections can harvest.

## Routing Matrix Reference

```
              A1    A2    A3    A4    A5    A6    A7    B1    B2    B3    B4    B5    B6    B7    B8
I (0.9→)      █     ▓     █     █     ░     ░     ▓     ▓     ░     ░     ▓     ░     ░     ░     ▓
A (→0.8)      ▓     █     █     ▓     █     █     ▓     ▓     ░     ░     ▓     ▓     ▓     ░     ▓
G (→0.8)      ▓     █     ▓     ▓     █     █     █     ▓     █     █     █     █     █     █     █
M (→0.9)      ░     ▓     ░     ░     ▓     ░     ▓     ░     █     █     ▓     █     █     █     ▓
C (→0.6)      ░     ░     ░     █     ░     ░     ▓     ░     ░     ░     █     ▓     ░     ░     ▓
```
█ = FULL | ▓ = PRESENT | ░ = SEED
