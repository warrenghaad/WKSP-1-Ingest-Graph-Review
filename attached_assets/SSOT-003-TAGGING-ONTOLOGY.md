# SSOT-003: TAGGING ONTOLOGY

## Overview

Complete tag library for curriculum system (global, K–12, non-destructive).
All tags use dot notation: `namespace.category.value`

---

## NORMALIZATION & SAFETY (ANTI-CORRUPTION)

### Non-destructive tagging
Tagging tools MUST NOT delete or overwrite source tags in-place. Instead they output:
- `added_tags[]`
- `removed_tags[]` (suggested removals only; never applied silently)
- `flags[]`
- `patched_tags[]` (a computed view)

### Unknown-first ingestion
If a tag or concept is unrecognized:
- preserve it as-is
- attach `flag.tag_unknown`
- optionally attach `raw.*` (verbatim capture)
- route it to **Novelty Intake** for later taxonomy expansion

### Single-letter tag ban (except allowlist)
Single-letter tags (`e`, `t`, `m`, etc.) are **forbidden** because they collide with noisy extraction. Allowed exceptions are:
- section codes like `sec.A1`, `sec.B2` (not single-letter)
- explicitly allowlisted abbreviations documented in this SSOT

### Alias normalization (GE collision-safe)
To avoid the historical “GEA” acronym collision:
- Day lenses use `day.A/day.B` + `mode.metaphor/mode.function`
- Atomic/molecular GE aliases are accepted but normalized:
  - `A.GE.*` → `gea.*`
  - `M.GE.*` → `gem.*`

## NAMESPACE REGISTRY

## NEW: DRIVER + LENS NAMESPACES (canonical)
| Namespace | Purpose | Example |
|-----------|---------|---------|
| `drv` | MAGIC drivers | `drv.I`, `drv.A`, `drv.M`, `drv.C`, `drv.G` |
| `day` | Day routing | `day.A`, `day.B` |
| `lens` | Lens routing (avoid acronym collisions) | `lens.aesthetic`, `lens.formal` |
| `qa` | QA flags (never deleted) | `qa.dayA_formal_teaching_detected` |
| `novelty.raw` | Unknown preserved tokens | `novelty.raw.<token>` |
| `deprecated.raw` | Deprecated preserved tokens | `deprecated.raw.<token>` |

### Non-destructive tagging rules (hard)
- Tags are **never auto-removed**.
- Unknown tokens become `novelty.raw.*` + a QA flag.
- Deprecated tokens become `deprecated.raw.*` + a QA flag.
- Single-letter tokens are **never removed** (flag-only).


| Namespace | Purpose | Example |
|-----------|---------|---------|
| `sec` | Section codes | `sec.A1`, `sec.B2` |
| `elem` | Geometric elements | `elem.circle` |
| `deity` | Deity references | `deity.meso.shamash` |
| `civ` | Civilizations | `civ.mesopotamia` |
| `driver` | MAGIC drivers (connective tissue, not geometry) | `driver.I`, `driver.A`, `driver.M`, `driver.C`, `driver.G` |
| `art` | Artifact types | `art.sacred` |
| `focus` | Content focus | `focus.myth`, `focus.math` |
| `std` | Standards alignment | `std.ccss.math.3.g.1` |
| `grade` | Grade level | `grade.3`, `grade.4` |
| `img` | Image metadata | `img.type.artifact` |
| `ped` | Pedagogy | `ped.activity`, `ped.discussion` |
| `sel` | SEL competencies | `sel.self-awareness` |
| `cog` | Cognitive level | `cog.bloom.analyze` |

---

## 1. SECTION TAGS (`sec.*`)

### Day A Sections
| Tag | Name | Purpose |
|-----|------|---------|
| `sec.A1` | Myth Retelling | Origin story |
| `sec.A2` | SEL + Metaphor | Personal connection |
| `sec.A3` | Iconographic & Mythic Art | Visual convention |
| `sec.A4` | Semiotics on Objects | Material culture (multi-part) |
| `sec.A4a` | — Sacred/Ceremonial | Divine objects |
| `sec.A4b` | — Ritual Context | Ceremonial use |
| `sec.A4c` | — Official/Administrative | Authority objects |
| `sec.A4d` | — Domestic/Everyday | Common objects |
| `sec.A4e` | — Architectural | Building elements |
| `sec.A4f` | — Personal/Wearable | Body adornment |
| `sec.A5` | Technique OR Design | Making/motif |
| `sec.A5a` | — Technique | How made |
| `sec.A5b` | — Design | Motif classification |
| `sec.A6` | Activity (Create) | Hands-on making |
| `sec.A7` | Bridge (Exit) | Cliffhanger question |

### Day B Sections
| Tag | Name | Purpose |
|-----|------|---------|
| `sec.B1` | Bridge Review | Answer question |
| `sec.B2` | Math Proof | Property verification |
| `sec.B3` | Transformation | Property in operation |
| `sec.B4` | Mechanics | Physical result |
| `sec.B5` | STEM History | Field contribution |
| `sec.B6` | The Moment | Specific invention |
| `sec.B7` | Activity (Build) | Hands-on engineering |
| `sec.B8` | Exit Ticket | Synthesis |

### Section Groupings
| Tag | Contains |
|-----|----------|
| `sec.dayA` | A1, A2, A3, A4*, A5*, A6, A7 |
| `sec.dayB` | B1, B2, B3, B4, B5, B6, B7, B8 |
| `sec.bridge` | A7, B1 (paired) |
| `sec.activity` | A6, B7 |
| `sec.exit` | A7, B8 |


### Mode Tags (`mode.*`)
| Tag | Meaning |
|-----|---------|
| `mode.metaphor` | Day A lens: meaning/aesthetics-first (no new formalization) |
| `mode.function` | Day B lens: formal/function/mechanism |

---

## 2. ELEMENT TAGS (`elem.*`)

### 2D Curved
| Tag | Name |
|-----|------|
| `elem.circle` | Circle |
| `elem.spiral` | Spiral |
| `elem.arc` | Arc/Curve |
| `elem.ellipse` | Ellipse |

### 2D Angular
| Tag | Name |
|-----|------|
| `elem.triangle` | Triangle |
| `elem.square` | Square/Rectangle |
| `elem.star8` | 8-Pointed Star |
| `elem.hexagon` | Hexagon |
| `elem.pentagon` | Pentagon |
| `elem.polygon` | Polygon (general) |

### 3D
| Tag | Name |
|-----|------|
| `elem.sphere` | Sphere |
| `elem.pyramid` | Pyramid |
| `elem.cube` | Cube |
| `elem.cylinder` | Cylinder |
| `elem.cone` | Cone |

### Composite
| Tag | Name |
|-----|------|
| `elem.mandala` | Mandala |
| `elem.rosette` | Rosette |
| `elem.meander` | Meander/Greek Key |
| `elem.guilloche` | Guilloche |

---

## 3. DEITY TAGS (`deity.*`)

### Mesopotamia (`deity.meso.*`)
| Tag | Name | Element |
|-----|------|---------|
| `deity.meso.shamash` | Shamash | circle |
| `deity.meso.ishtar` | Ishtar | star8 |
| `deity.meso.enlil` | Enlil | triangle |
| `deity.meso.nabu` | Nabu | square |
| `deity.meso.tiamat` | Tiamat | spiral |
| `deity.meso.anu` | Anu | arc |
| `deity.meso.nisaba` | Nisaba | hexagon |
| `deity.meso.marduk` | Marduk | pyramid |
| `deity.meso.enki` | Enki | — |
| `deity.meso.nanna` | Nanna/Sin | — |

### Egypt (`deity.egypt.*`)
| Tag | Name | Element |
|-----|------|---------|
| `deity.egypt.ra` | Ra | circle |
| `deity.egypt.nut` | Nut | arc |
| `deity.egypt.thoth` | Thoth | — |
| `deity.egypt.osiris` | Osiris | pyramid |
| `deity.egypt.isis` | Isis | — |
| `deity.egypt.horus` | Horus | — |

### Greece (`deity.greece.*`)
| Tag | Name |
|-----|------|
| `deity.greece.apollo` | Apollo |
| `deity.greece.athena` | Athena |
| `deity.greece.hephaestus` | Hephaestus |
| `deity.greece.hermes` | Hermes |

*(Additional civilizations added as curriculum expands)*

---

## 4. CIVILIZATION TAGS (`civ.*`)

| Tag | Name | Period |
|-----|------|--------|
| `civ.mesopotamia` | Mesopotamia | 3500-500 BCE |
| `civ.egypt` | Ancient Egypt | 3100-30 BCE |
| `civ.greece` | Ancient Greece | 800-31 BCE |
| `civ.rome` | Ancient Rome | 753 BCE-476 CE |
| `civ.india` | Ancient India | 2600 BCE-500 CE |
| `civ.china` | Ancient China | 1600 BCE-220 CE |
| `civ.maya` | Maya | 2000 BCE-1500 CE |
| `civ.islamic` | Islamic Golden Age | 750-1258 CE |
| `civ.medieval` | Medieval Europe | 500-1500 CE |
| `civ.renaissance` | Renaissance | 1400-1600 CE |

### Mesopotamia Sub-periods
| Tag | Period |
|-----|--------|
| `civ.meso.sumerian` | Sumerian (3500-2000 BCE) |
| `civ.meso.akkadian` | Akkadian (2334-2154 BCE) |
| `civ.meso.babylonian` | Babylonian (1894-539 BCE) |
| `civ.meso.assyrian` | Assyrian (2500-609 BCE) |

---

## 5. ARTIFACT TYPE TAGS (`art.*`)

| Tag | Name | Section |
|-----|------|---------|
| `art.sacred` | Sacred/Ceremonial | A4a |
| `art.ritual` | Ritual Context | A4b |
| `art.official` | Official/Administrative | A4c |
| `art.domestic` | Domestic/Everyday | A4d |
| `art.architectural` | Architectural | A4e |
| `art.personal` | Personal/Wearable | A4f |

### Material Tags
| Tag | Material |
|-----|----------|
| `art.mat.stone` | Stone |
| `art.mat.clay` | Clay/ceramic |
| `art.mat.metal` | Metal |
| `art.mat.wood` | Wood |
| `art.mat.textile` | Textile |
| `art.mat.glass` | Glass |
| `art.mat.bone` | Bone/ivory |

---

## 6. FOCUS TAGS (`focus.*`)

### Content Focus
| Tag | Meaning |
|-----|---------|
| `focus.myth` | Mythology/narrative |
| `focus.origin` | Origin story |
| `focus.sel` | Social-emotional learning |
| `focus.metaphor` | Symbolic meaning |
| `focus.iconography` | Visual conventions |
| `focus.visual` | Visual analysis |
| `focus.semiotics` | Signs/signals |
| `focus.material-culture` | Objects in context |
| `focus.technique` | Making process |
| `focus.design` | Motif classification |
| `focus.activity` | Hands-on |
| `focus.create` | Making activity |
| `focus.build` | Engineering activity |
| `focus.bridge` | Day A↔B connection |
| `focus.question` | Inquiry prompt |
| `focus.answer` | Revealed answer |
| `focus.math` | Mathematical property |
| `focus.proof` | Verification |
| `focus.transform` | Operation |
| `focus.mechanics` | Physical result |
| `focus.history` | Historical context |
| `focus.stem` | STEM connection |
| `focus.invention` | Specific discovery |
| `focus.moment` | Historical breakthrough |
| `focus.synthesis` | Unifying metaphor+function |
| `focus.exit` | Exit ticket |

---

## 7. STANDARDS TAGS (`std.*`)

### CCSS Math (`std.ccss.math.*`)
Format: `std.ccss.math.[grade].[domain].[standard]`

| Domain Code | Domain Name |
|-------------|-------------|
| `g` | Geometry |
| `md` | Measurement & Data |
| `nbt` | Numbers & Operations Base Ten |
| `nf` | Numbers & Operations Fractions |
| `oa` | Operations & Algebraic Thinking |
| `mp` | Mathematical Practices |

**Examples:**
- `std.ccss.math.3.g.1` — Grade 3, Geometry, Standard 1
- `std.ccss.math.4.md.5` — Grade 4, Measurement & Data, Standard 5
- `std.ccss.math.mp.7` — Mathematical Practice 7 (Structure)

### CCSS ELA (`std.ccss.ela.*`)
Format: `std.ccss.ela.[grade].[strand].[standard]`

| Strand Code | Strand Name |
|-------------|-------------|
| `rl` | Reading Literature |
| `ri` | Reading Informational |
| `w` | Writing |
| `sl` | Speaking & Listening |
| `l` | Language |

### NGSS (`std.ngss.*`)
Format: `std.ngss.[grade-band].[discipline].[standard]`

| Discipline | Code |
|------------|------|
| Physical Science | `ps` |
| Life Science | `ls` |
| Earth Science | `es` |
| Engineering | `ets` |

---

## 8. GRADE TAGS (`grade.*`)

| Tag | Grade |
|-----|-------|
| `grade.k` | Kindergarten |
| `grade.1` | Grade 1 |
| `grade.2` | Grade 2 |
| `grade.3` | Grade 3 |
| `grade.4` | Grade 4 |
| `grade.5` | Grade 5 |
| `grade.6` | Grade 6 |
| `grade.7` | Grade 7 |
| `grade.8` | Grade 8 |

### Grade Bands
| Tag | Range |
|-----|-------|
| `grade.band.k2` | K-2 |
| `grade.band.35` | 3-5 |
| `grade.band.68` | 6-8 |

---

## 9. IMAGE TAGS (`img.*`)

### Image Type
| Tag | Description |
|-----|-------------|
| `img.type.artifact` | Museum/archaeological photo |
| `img.type.diagram` | Created illustration |
| `img.type.reconstruction` | Historical reconstruction |
| `img.type.map` | Geographic map |
| `img.type.timeline` | Chronological visual |
| `img.type.comparison` | Side-by-side |
| `img.type.process` | Step-by-step |
| `img.type.annotated` | Labeled overlay |

### Image Source
| Tag | Source |
|-----|--------|
| `img.src.british-museum` | British Museum |
| `img.src.louvre` | Louvre |
| `img.src.met` | Metropolitan Museum |
| `img.src.pergamon` | Pergamon Museum |
| `img.src.penn` | Penn Museum |
| `img.src.yale` | Yale Babylonian Collection |
| `img.src.smithsonian` | Smithsonian |
| `img.src.wikimedia` | Wikimedia Commons |
| `img.src.created` | Curriculum-created |

### Image License
| Tag | License |
|-----|---------|
| `img.lic.cc0` | Public Domain / CC0 |
| `img.lic.cc-by` | CC Attribution |
| `img.lic.cc-by-sa` | CC Attribution-ShareAlike |
| `img.lic.cc-by-nc` | CC Attribution-NonCommercial |
| `img.lic.fair-use` | Fair Use (educational) |
| `img.lic.permission` | Specific permission obtained |

---

## 10. PEDAGOGY TAGS (`ped.*`)

### Activity Type
| Tag | Type |
|-----|------|
| `ped.lecture` | Direct instruction |
| `ped.discussion` | Class discussion |
| `ped.activity` | Hands-on activity |
| `ped.inquiry` | Guided inquiry |
| `ped.collaborative` | Group work |
| `ped.independent` | Individual work |
| `ped.demonstration` | Teacher demo |
| `ped.assessment` | Formal assessment |

### Grouping
| Tag | Grouping |
|-----|----------|
| `ped.group.whole` | Whole class |
| `ped.group.small` | Small groups |
| `ped.group.pair` | Partner work |
| `ped.group.individual` | Independent |

### Differentiation
| Tag | Level |
|-----|-------|
| `ped.diff.support` | Below grade level |
| `ped.diff.core` | On grade level |
| `ped.diff.extend` | Above grade level |

---

## 11. SEL TAGS (`sel.*`)

Based on CASEL framework:

| Tag | Competency |
|-----|------------|
| `sel.self-awareness` | Self-awareness |
| `sel.self-management` | Self-management |
| `sel.social-awareness` | Social awareness |
| `sel.relationship-skills` | Relationship skills |
| `sel.decision-making` | Responsible decision-making |

### Sub-competencies
| Tag | Sub-competency |
|-----|----------------|
| `sel.self-awareness.emotion` | Identifying emotions |
| `sel.self-awareness.strength` | Recognizing strengths |
| `sel.self-management.impulse` | Impulse control |
| `sel.self-management.goal` | Goal-setting |
| `sel.social-awareness.perspective` | Perspective-taking |
| `sel.social-awareness.empathy` | Empathy |
| `sel.relationship-skills.communication` | Communication |
| `sel.relationship-skills.teamwork` | Teamwork |
| `sel.decision-making.consequence` | Considering consequences |
| `sel.decision-making.ethics` | Ethical reasoning |

---

## 12. COGNITIVE LEVEL TAGS (`cog.*`)

### Bloom's Taxonomy
| Tag | Level |
|-----|-------|
| `cog.bloom.remember` | Remember |
| `cog.bloom.understand` | Understand |
| `cog.bloom.apply` | Apply |
| `cog.bloom.analyze` | Analyze |
| `cog.bloom.evaluate` | Evaluate |
| `cog.bloom.create` | Create |

### Webb's DOK
| Tag | Level |
|-----|-------|
| `cog.dok.1` | Recall |
| `cog.dok.2` | Skill/Concept |
| `cog.dok.3` | Strategic Thinking |
| `cog.dok.4` | Extended Thinking |

---

## TAG COMBINATIONS

### Required Tags per LO Record
```yaml
tags_required:
  - sec.*          # Which section
  - elem.*         # Which element
  - deity.*        # Which deity (Day A)
  - civ.*          # Which civilization
  - grade.*        # Target grade
  - focus.*        # Content focus (1-3)
  - std.*          # Standards (1-5)
```

### Required Tags per Image Record
```yaml
tags_required:
  - img.type.*     # Image type
  - img.src.*      # Source museum/creator
  - img.lic.*      # License type
  - sec.*          # Target section(s)
  - elem.*         # Element shown
  - art.*          # Artifact type (if artifact)
  - civ.*          # Civilization
```

### Required Tags per Artifact Record
```yaml
tags_required:
  - art.*          # Artifact category (A4 type)
  - art.mat.*      # Material
  - civ.*          # Civilization
  - elem.*         # Element present
  - deity.*        # Associated deity (if any)
```

---

## VALIDATION RULES

### Tag Format
- All lowercase
- Dot notation only
- No spaces
- No special characters except hyphen in values

### Tag Completeness
```
IF record.type == "LO":
  REQUIRE: sec.*, elem.*, civ.*, grade.*, ≥1 focus.*, ≥1 std.*
  
IF record.type == "IMAGE":
  REQUIRE: img.type.*, img.src.*, img.lic.*, ≥1 sec.*, elem.*
  
IF record.type == "ARTIFACT":
  REQUIRE: art.* (category), art.mat.*, civ.*, elem.*
```

### Tag Consistency
```
IF sec.A4a THEN art.sacred
IF sec.A4b THEN art.ritual
IF sec.A4c THEN art.official
IF sec.A4d THEN art.domestic
IF sec.A4e THEN art.architectural
IF sec.A4f THEN art.personal

IF deity.meso.* THEN civ.mesopotamia
IF deity.egypt.* THEN civ.egypt
IF deity.greece.* THEN civ.greece
```

---

## QUICK REFERENCE: SECTION → FOCUS

| Section | Primary Focus Tags |
|---------|-------------------|
| A1 | `focus.myth`, `focus.origin` |
| A2 | `focus.sel`, `focus.metaphor` |
| A3 | `focus.iconography`, `focus.visual` |
| A4* | `focus.semiotics`, `focus.material-culture` |
| A5a | `focus.technique` |
| A5b | `focus.design` |
| A6 | `focus.activity`, `focus.create` |
| A7 | `focus.bridge`, `focus.question` |
| B1 | `focus.bridge`, `focus.answer` |
| B2 | `focus.math`, `focus.proof` |
| B3 | `focus.transform` |
| B4 | `focus.mechanics` |
| B5 | `focus.history`, `focus.stem` |
| B6 | `focus.invention`, `focus.moment` |
| B7 | `focus.activity`, `focus.build` |
| B8 | `focus.synthesis`, `focus.exit` |
