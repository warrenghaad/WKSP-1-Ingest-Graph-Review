---
description: Show the full requirements specification for a lesson section (A1–A7, B1–B8)
allowed-tools: Read, Glob, Grep
argument-hint: <section-code>
---

# Interpret Section

Read the section-interpreter skill: @${CLAUDE_PLUGIN_ROOT}/skills/section-interpreter/SKILL.md
Load section requirements: @${CLAUDE_PLUGIN_ROOT}/skills/section-interpreter/references/section-requirements.md

## Parameters
Parse: section_code = $1 (e.g., "A2", "B5", "all", "day-a", "day-b")

## Procedure

1. If section_code is a specific code (A1–A7, B1–B8): produce the full SECTION_SPEC for that section
2. If section_code is "all": produce the summary table for all 15 sections
3. If section_code is "day-a": produce specs for A1–A7
4. If section_code is "day-b": produce specs for B1–B8

For each section, output:
- Cognitive operation and what it accomplishes
- MAGIC weight vector and variable focus
- GEA/GEM requirement (mandatory? what kind?)
- Content length, duration, paragraph count
- Image requirements (count, types, overlay needs)
- Distillation table (what each of 5 levels contains)
- Structural constraints (upstream, downstream, PIVOT/BRIDGE/CIRCUIT)
- Primary and secondary MAGIC tags
- Guardrails and validation rules
