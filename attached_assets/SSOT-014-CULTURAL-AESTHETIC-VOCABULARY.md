# SSOT-014: CULTURAL AESTHETIC VOCABULARY
version: 5.0.0
generated_at: 2026-02-02

# SSOT-014: Cultural Aesthetic Vocabulary
**Version:** 1.0
**Status:** DRAFT
**Purpose:** Define visual elements that constitute "Mesopotamian style" for consistent tagging and image selection

---

## Overview

"Cultural Aesthetic" = the internalized visual template that defines how a civilization sees and creates. Students absorb this through repeated exposure before formal instruction.

This SSOT defines:
1. What makes something "look Mesopotamian"
2. Tagging vocabulary for images
3. Design elements for created materials
4. Authentication criteria for artifact selection

---

## COMPOSITIONAL ELEMENTS

### REGISTER COMPOSITION
**Definition:** Horizontal bands dividing image into narrative layers

| Attribute | Description |
|-----------|-------------|
| **Visual** | Stacked horizontal strips, each self-contained |
| **Function** | Multiple scenes in one object; hierarchy; sequence |
| **Frequency** | Very common (cylinder seals, stelae, vessels) |
| **Tag** | `composition:register` |

**Variants:**
- Single register (simple narrative)
- Double register (contrast/sequence)
- Triple+ register (complex narrative, hierarchy)
- Frieze (continuous horizontal band)

---

### HERALDIC/ANTITHETICAL
**Definition:** Symmetrical arrangement around central axis

| Attribute | Description |
|-----------|-------------|
| **Visual** | Two matching figures flanking central element |
| **Function** | Power, protection, divine presence |
| **Frequency** | Common (gates, seals, boundary stones) |
| **Tag** | `composition:heraldic` |

**Examples:**
- Two lions flanking Ishtar
- Two humans flanking sacred tree
- Two guardian figures at gate

---

### PRESENTATION SCENE
**Definition:** Hierarchical arrangement showing worship/audience

| Attribute | Description |
|-----------|-------------|
| **Visual** | Larger figure (deity/king) receiving smaller figures |
| **Function** | Religious devotion, royal legitimacy |
| **Frequency** | Very common (seals, reliefs) |
| **Tag** | `composition:presentation` |

**Required Elements:**
- Size differential (important = larger)
- Direction (worshipper approaches deity)
- Gesture (raised hand, offering)

---

### PROCESSIONAL
**Definition:** Figures moving in same direction in sequence

| Attribute | Description |
|-----------|-------------|
| **Visual** | Multiple figures walking/carrying toward destination |
| **Function** | Ritual, tribute, narrative flow |
| **Frequency** | Common (palace reliefs, ritual scenes) |
| **Tag** | `composition:processional` |

---

## FIGURAL CONVENTIONS

### HUMAN/DIVINE FIGURE REPRESENTATION
| Feature | Convention | Tag |
|---------|------------|-----|
| **Face** | Profile view | `figure:profile_face` |
| **Eye** | Frontal in profile face | `figure:frontal_eye` |
| **Shoulders** | Frontal (twisted) | `figure:frontal_torso` |
| **Legs** | Profile, walking pose | `figure:profile_legs` |
| **Hands** | Often both visible | `figure:visible_hands` |
| **Scale** | Size = importance | `figure:hierarchical_scale` |

### DIVINE MARKERS
| Feature | Description | Tag |
|---------|-------------|-----|
| **Horned Crown** | Multiple tiers of horns | `divine:horned_crown` |
| **Tiered Robe** | Fringed, layered garment | `divine:tiered_robe` |
| **Scale** | Larger than humans | `divine:larger_scale` |
| **Elevation** | Seated on throne/mountain | `divine:elevated` |
| **Symbols** | Personal attribute visible | `divine:identifying_symbol` |

### ROYAL MARKERS
| Feature | Description | Tag |
|---------|-------------|-----|
| **Crown** | Various styles by period | `royal:crown` |
| **Beard** | Elaborate, curled | `royal:beard` |
| **Staff/Weapon** | Symbol of authority | `royal:authority_symbol` |
| **Inscription** | Name/titles nearby | `royal:inscription` |

---

## DECORATIVE ELEMENTS

### BORDER PATTERNS
| Pattern | Description | Tag | Common Location |
|---------|-------------|-----|-----------------|
| **Guilloche** | Interlocking circles/loops | `border:guilloche` | Frames, architectural |
| **Rosette Band** | Repeated rosette flowers | `border:rosette_band` | Frames, textiles |
| **Chevron** | Zigzag pattern | `border:chevron` | Pottery, textiles |
| **Cable** | Twisted rope pattern | `border:cable` | Frames |
| **Meander** | Stepped/geometric maze | `border:meander` | Frames, floors |
| **Lotus/Palmette** | Stylized plant alternation | `border:lotus_palmette` | Later period |

### FILL PATTERNS
| Pattern | Description | Tag | Use |
|---------|-------------|-----|-----|
| **Cross-hatching** | Intersecting diagonal lines | `fill:crosshatch` | Shadow, texture |
| **Scale Pattern** | Overlapping semicircles | `fill:scale` | Mountains, water |
| **Herringbone** | V-shaped rows | `fill:herringbone` | Texture |
| **Dot Pattern** | Regular dots | `fill:dot` | Stars, texture |

---

## SYMBOLIC ELEMENTS

### CELESTIAL SYMBOLS
| Symbol | Deity | Description | Tag |
|--------|-------|-------------|-----|
| **Sun Disk** | Shamash | Circle with rays | `celestial:sun_disk` |
| **Crescent** | Sin | Horizontal crescent | `celestial:crescent` |
| **8-Pointed Star** | Ishtar | Venus star | `celestial:eight_star` |
| **7 Dots** | Pleiades | Star cluster | `celestial:pleiades` |
| **Lightning** | Adad | Forked bolt | `celestial:lightning` |

### NATURAL ELEMENTS
| Element | Description | Tag |
|---------|-------------|-----|
| **Sacred Tree** | Stylized date palm/cypress | `natural:sacred_tree` |
| **Mountain** | Scale pattern or twin peaks | `natural:mountain` |
| **Water** | Wavy parallel lines | `natural:water` |
| **Vegetation** | Stylized plants | `natural:vegetation` |

### CREATURE SYMBOLS
| Creature | Associated With | Tag |
|----------|-----------------|-----|
| **Lion** | Ishtar, royalty | `creature:lion` |
| **Bull** | Sin, storm gods | `creature:bull` |
| **Serpent** | Ningishzida, underworld | `creature:serpent` |
| **Eagle** | Various | `creature:eagle` |
| **Goat-Fish** | Ea | `creature:goat_fish` |
| **Mushhushshu** | Marduk | `creature:mushhushshu` |
| **Scorpion** | Various | `creature:scorpion` |

---

## COLOR PALETTE

### AUTHENTIC MESOPOTAMIAN COLORS
| Color | Hex | Pigment Source | Tag |
|-------|-----|----------------|-----|
| **Lapis Blue** | #1E4D8C | Lapis lazuli | `color:lapis_blue` |
| **Turquoise** | #40E0D0 | Copper compounds | `color:turquoise` |
| **Gold** | #FFD700 | Gold leaf/ochre | `color:gold` |
| **Terracotta** | #CC5500 | Clay/iron oxide | `color:terracotta` |
| **Cream/Ivory** | #FFFFF0 | Limestone, bone | `color:cream` |
| **Black** | #1A1A1A | Bitumen, carbon | `color:black` |
| **White** | #FFFFFF | Gypsum, shell | `color:white` |
| **Red** | #B22222 | Iron oxide, cinnabar | `color:red` |
| **Green** | #228B22 | Copper compounds | `color:green` |

### COLOR COMBINATIONS BY CONTEXT
| Context | Primary | Secondary | Accent |
|---------|---------|-----------|--------|
| **Divine** | Lapis Blue, Gold | White | Red |
| **Royal** | Gold, Lapis Blue | White, Red | Green |
| **Temple** | Lapis Blue, Gold, White | Terracotta | Green |
| **Domestic** | Terracotta, Cream | Black | Red |
| **Funerary** | Black, Gold | Lapis Blue | White |

---

## MATERIAL CULTURE SIGNATURES

### ARTIFACT MATERIALS
| Material | Appearance | Tag | Status Indicator |
|----------|------------|-----|------------------|
| **Clay/Ceramic** | Buff to terracotta | `material:clay` | Common |
| **Stone (limestone)** | Cream to gray | `material:limestone` | Moderate |
| **Stone (diorite)** | Dark gray-black | `material:diorite` | High (imports) |
| **Metal (bronze)** | Green patina | `material:bronze` | High |
| **Metal (gold)** | Yellow | `material:gold` | Very high |
| **Lapis lazuli** | Deep blue | `material:lapis` | Very high |
| **Shell** | White/iridescent | `material:shell` | Moderate |
| **Bitumen** | Black | `material:bitumen` | Common |

### SURFACE TREATMENTS
| Treatment | Description | Tag |
|-----------|-------------|-----|
| **Incised** | Lines cut into surface | `surface:incised` |
| **Relief (high)** | Raised forms, deep cut | `surface:high_relief` |
| **Relief (low)** | Shallow raised forms | `surface:low_relief` |
| **Inlay** | Different materials inserted | `surface:inlay` |
| **Glazed** | Vitreous coating | `surface:glazed` |
| **Painted** | Pigment applied | `surface:painted` |
| **Burnished** | Polished smooth | `surface:burnished` |

---

## PERIOD-SPECIFIC MARKERS

### SUMERIAN (c. 3500-2000 BCE)
- Large eyes, simple bodies
- Votive statues with clasped hands
- Register composition dominant
- Tags: `period:sumerian`, `style:early_dynastic`, `style:ur_iii`

### AKKADIAN (c. 2334-2154 BCE)
- More naturalistic bodies
- Dynamic action scenes
- Victory narratives
- Tags: `period:akkadian`

### BABYLONIAN (c. 1894-539 BCE)
- Elaborate divine imagery
- Kudurru (boundary stones)
- Law code stelae
- Tags: `period:old_babylonian`, `period:neo_babylonian`

### ASSYRIAN (c. 2500-609 BCE)
- Palace reliefs (narrative)
- Royal hunt scenes
- Military campaigns
- Tags: `period:assyrian`, `period:neo_assyrian`

---

## AUTHENTICATION CHECKLIST

When selecting artifact images, verify:

### Required for "Mesopotamian" Tag
- [ ] Geographic origin: Mesopotamia region
- [ ] Time period: within scope (c. 3500-539 BCE)
- [ ] At least 2 compositional/figural conventions present
- [ ] Material consistent with period

### Preferred Indicators
- [ ] Cuneiform inscription present
- [ ] Divine/royal markers consistent
- [ ] Color use (if preserved) matches palette
- [ ] Provenance documented

### Red Flags (May Not Be Authentic)
- [ ] Mix of incompatible period styles
- [ ] Non-Mesopotamian conventions (Egyptian profile, Greek naturalism)
- [ ] Modern "inspired by" rather than authentic
- [ ] Unknown provenance + "too good" condition

---

## Usage in Section SSOTs

```markdown
### Cultural Aesthetic Elements
- **Composition:** [from vocabulary]
- **Figural Conventions:** [applicable tags]
- **Decorative Elements:** [applicable tags]
- **Color Palette:** [from palette]
- **Period Markers:** [applicable tags]
- **Reference:** SSOT-014
```

---

## Tagging Example

For Tablet of Shamash (BM 91000):
```
composition:presentation
figure:profile_face, figure:frontal_eye, figure:hierarchical_scale
divine:horned_crown, divine:tiered_robe, divine:identifying_symbol
celestial:sun_disk
material:limestone
surface:low_relief
period:neo_babylonian
color:cream (original)
```