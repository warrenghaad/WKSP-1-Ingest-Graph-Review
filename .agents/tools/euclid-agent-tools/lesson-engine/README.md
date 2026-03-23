# EUCLID Lesson Engine Plugin

Lesson production pipeline for the EUCLID curriculum. 7 skills + 8 commands covering the full cycle from section interpretation through content drafting, gap assessment, research routing, image design, semantic deduplication, and reconciliation approval.

Works with any civilization, period, geometric element, or deity. The 15-section architecture is the constant; content parameters are variables.

## Skills

| Skill | Purpose |
|-------|---------|
| **section-interpreter** | Knows what every section (A1–A7, B1–B8) requires: content, images, MAGIC weights, constraints, distillation levels, dependencies |
| **content-drafter** | Drafts content at all 5 distillation levels (eTextbook → Teacher Script → Slideshow → Worksheet → Teacher Summary) |
| **gap-assessor** | Assesses existing drafts against canonical requirements across 7 dimensions, produces prioritized gap reports |
| **research-director** | Routes targeted research to the gea-research plugin to fix identified gaps |
| **image-designer** | Creates image design specs (MUS/SCN/DGM/CON/MOT/OVR) and routes to the image-pipeline plugin |
| **semantic-deduplicator** | Distinguishes genuinely additive content from redundant restatement across sections and distillation levels |
| **reconciliation-dashboard** | Generates approval UI displaying content + images with approve/reject controls, wired to Express.js/Supabase |

## Commands

| Command | What It Does |
|---------|-------------|
| `/interpret-section <code>` | Show full requirements for a section |
| `/draft-section <code> <civ> <period> <element> <deity> <grade>` | Draft one section at all 5 levels |
| `/draft-week <civ> <period> <element> <deity> <grade>` | Draft all 15 sections in dependency order |
| `/assess-gaps <path> [section]` | Run gap analysis on existing content |
| `/direct-research <gap-report OR section civ period>` | Route research to fix gaps |
| `/design-images <section civ period element OR gap-report>` | Create image specs for production |
| `/deduplicate <path>` | Check for semantic redundancy |
| `/reconcile <lesson-id OR path>` | Generate the approval dashboard |

## Pipeline Flow

```
                    ┌─────────────────────┐
                    │  section-interpreter │ ← understands requirements
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                 ▼
     ┌────────────────┐ ┌────────────┐ ┌──────────────┐
     │ content-drafter │ │ gap-assessor│ │image-designer │
     │ (drafts 5 lvls)│ │ (7 dims)   │ │ (6 img types)│
     └───────┬────────┘ └─────┬──────┘ └──────┬───────┘
             │                │                │
             │         ┌──────▼──────┐         │
             │         │research-dir │←────────┘
             │         │(routes to   │
             │         │gea-research)│
             │         └──────┬──────┘
             │                │
             ▼                ▼
     ┌──────────────────────────────┐
     │   semantic-deduplicator      │ ← additive vs redundant
     └──────────────┬───────────────┘
                    │
                    ▼
     ┌──────────────────────────────┐
     │  reconciliation-dashboard    │ ← approve/reject UI
     │  (→ Express.js/Supabase)    │
     └──────────────────────────────┘
                    │
                    ▼
              The Face (Engine 4)
```

## Companion Plugins

- **euclid-gea-research** — MAGIC-line research investigations (consumed by research-director)
- **euclid-image-pipeline** — Image sourcing, overlay, AI recreation (consumed by image-designer)
