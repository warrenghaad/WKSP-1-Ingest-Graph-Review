# EUCLID GEA Research Plugin

Structured MAGIC-line research engine for investigating geometric elements (GEAs/GEMs) across civilizations. Tracks geometric elements through art, symbolism, mathematics, engineering, and power structures — with museum references and image sourcing.

## What It Does

This plugin gives Claude structured research direction for the EUCLID curriculum's investigation methodology. Instead of open-ended research, it focuses each investigation through the five MAGIC lines (Ideology, Aesthetics, Geometry, Mathematics, Power) and produces structured outputs compatible with the graphnode ingestion system (Engine 1: Cortex) and lesson builder (Engine 3: Builder).

## Commands

| Command | Purpose |
|---------|---------|
| `/research-ideology <civ> <period>` | I-line: myths, sacred structures, institutional programs |
| `/research-aesthetics <civ> <period>` | A-line: material production, visual rhetoric, carrier diversity |
| `/research-geometry <civ> <period>` | G-line: GEA/GEM compositions, dimensional range, spatial truth |
| `/research-math <civ> <period>` | M-line: formalized knowledge, functional capabilities, formalization gaps |
| `/research-power <civ> <period>` | C-line: political control, access, patronage, knowledge monopoly |
| `/research-full-scan <civ> <period>` | All 5 MAGIC lines + candidate surfacing + notch registry entry |
| `/research-compare <element> <civ1> <civ2>` | Cross-civilization comparison of a geometric element |
| `/research-element <element> <civ> <period>` | Deep dive on a specific element at a specific notch |

## Skills

**magic-research** — Core framework knowledge including MAGIC methodology, GEA/GEM taxonomy, civilization scopes, output formats, routing matrices, and attenuation model.

## Output Formats

All commands produce structured YAML outputs designed for pipeline ingestion:
- **FINDING blocks** — per-discovery structured data with artifacts, images, sources, and section routing
- **NOTCH_REGISTRY_ENTRY** — comprehensive notch assessment after full scan
- **IMAGE_REF blocks** — museum image references with quality assessment and overlay needs
- **COMPARATIVE blocks** — cross-civilization analysis

## Coverage

- **~10 core geometric elements** (circle, triangle, square, spiral, hexagon, arc, parallel lines, cross, ellipse, star)
- **~20 civilization-period scopes** with date ranges and archaeological baselines
- **Museum API search priority**: Met → British Museum → Louvre → Smithsonian → Wikimedia

## Usage Examples

```
/research-aesthetics mesopotamia "old babylonian"
/research-geometry egypt "new kingdom"
/research-full-scan mesopotamia "ur III"
/research-compare circle mesopotamia egypt greece
/research-element circle mesopotamia "old babylonian"
```
