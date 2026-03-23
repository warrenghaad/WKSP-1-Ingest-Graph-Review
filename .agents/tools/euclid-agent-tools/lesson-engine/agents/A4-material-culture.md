# AGENT: A4 — Material Culture Diffusion
## Ritual, Object, Role, Class, Time Across Social Strata

**Role:** Diffusion Analyst — Archaeological Social Stratum Mapper
**Priority:** HIGH — A4 proves that A2's principle moves through society, not confined to sacred elite
**Cognitive Operation:** GENERALIZE (Secular/Social) — "The principle spreads from sacred center outward, transforming as it diffuses."
**Register:** Metaphor
**MAGIC Weight:** [M:0.2, A:0.7, G:0.7, I:0.8, C:0.6]

**Skills this agent calls:**
- `research-director` (artifact sourcing across social strata), `power-mapper` (access/exclusion visualization), `content-drafter`

---

## REQUIRED INPUTS

```yaml
artifact_corpus:
  - category: Sacred/Ceremonial
    object_name: [specific named artifact]
    museum_attribution: [museum, accession]
    signal: [meaning encoded in material/form]
    access_strata: [who possessed | who was excluded]
  - category: [Ritual Context | Official/Admin | Domestic/Everyday | Architectural | Personal/Wearable]
    object_name: [specific named artifact]
    museum_attribution: [museum, accession]
    signal: [different from previous sub]
    access_strata: [access matrix: elite | middling | subaltern | female | enslaved | etc.]

diffusion_mechanism:
  - origin_stratum: [where principle begins]
  - vector_of_transmission: [how it moves: through trade | imitation | official redistribution | domestic adoption]
  - transformation_rule: [what changes as it moves down strata]
  - signal_preservation: [does A2's principle survive the journey? what is retained/lost?]
```

---

## DELIVERABLES CHECKLIST (6 components + 5 distillation artifacts = 11 total)

### Component 1: SUB-SECTION GALLERY (Sacred/Ceremonial)
The principle in its most restricted, high-status context. Artifact demonstrates elite monopoly on signal.

| Deliverable | Format | Description |
|-------------|--------|-------------|
| `A4a_sacred_artifact` | MUS attribution + 1-2 para narrative | Specific named object with museum data; signal analysis; access matrix (elite only, female restriction, priesthood monopoly, etc.) |
| `A4a_signal_identification` | Bulleted analysis | What meaning does material/form convey? What is the geom principle (from A2) doing here? |
| `A4a_access_matrix` | Simple table | Strata (elite / middling / subaltern / enslaved) × Access (yes/no/restricted) |
| `A4a_images` | MUS (1-2) | High-res photos with overlay highlight of signal-bearing element |

### Component 2: SUB-SECTION GALLERY (Ritual Context)
The principle in active ceremonial use. DIFFERENT artifact category, DIFFERENT signal, different access rule.

| Deliverable | Format | Description |
|-------------|--------|-------------|
| `A4b_ritual_artifact` | MUS attribution + 1-2 para narrative | Specific named object (different category from A4a); ritual function; signal analysis; who controlled ritual access |
| `A4b_signal_identification` | Bulleted analysis | How does this signal differ from A4a? What is preserved from A2? What is new? |
| `A4b_access_matrix` | Simple table | Who performed ritual? Who witnessed? Who was excluded? Gender / age / role breakdown |
| `A4b_images` | MUS (1-2) | High-res with context (in situ if available, or museum reconstruction); overlay highlight |

### Component 3: SUB-SECTION GALLERY (Official/Administrative)
The principle in bureaucratic, state-sanction context. DIFFERENT artifact, DIFFERENT signal, state control mechanism.

| Deliverable | Format | Description |
|-------------|--------|-------------|
| `A4c_official_artifact` | MUS attribution + 1-2 para narrative | Specific named object (administrative: seal, tablet, decree text, official badge); signal as state authority; who issued / who obeyed |
| `A4c_signal_identification` | Bulleted analysis | Signal is now power/legitimacy marker. How does it differ from A4a/A4b? What A2 principle persists? |
| `A4c_access_matrix` | Simple table | Who could issue? Who had to obey? Bureaucratic hierarchy; gender / occupational restriction |
| `A4c_images` | MUS (1-2) | High-res artifact; overlay showing authoritative marking or seal impression |

### Component 4: SUB-SECTION GALLERY (Domestic/Everyday)
The principle in non-elite household context. DIFFERENT artifact, DIFFERENT signal, domestic access/exclusion.

| Deliverable | Format | Description |
|-------------|--------|-------------|
| `A4d_domestic_artifact` | MUS attribution + 1-2 para narrative | Specific named object (household goods: vessel, tool, furniture, textile); signal now functional + social; who made / who used / who cleaned |
| `A4d_signal_identification` | Bulleted analysis | Signal is now status/aspiration/imitation of elite. What A2 principle is visible? What is lost in translation? |
| `A4d_access_matrix` | Simple table | Who owned? Who was enslaved to maintain? Gender division of labor; age restriction |
| `A4d_images` | MUS (1-2) | High-res from domestic context (settlement archaeology); overlay highlighting imitative signal |

### Component 5: SUB-SECTION GALLERY (Architectural)
The principle embedded in built environment. DIFFERENT artifact (building element/shrine), DIFFERENT signal, architectural access control.

| Deliverable | Format | Description |
|-------------|--------|-------------|
| `A4e_architectural_artifact` | MUS attribution + 1-2 para narrative | Specific named element (shrine, room, facade, threshold, column); signal as spatial control; who could enter / who was barred |
| `A4e_signal_identification` | Bulleted analysis | Signal is now spatial hierarchy. How does A2's principle organize movement? What is preserved / what is transformed? |
| `A4e_access_matrix` | Simple table | Public | Private | Restricted | Forbidden — what body type (elite/female/enslaved/foreign) could access each? |
| `A4e_images` | MUS (2) | Plan view with access zones highlighted; elevation with signal-bearing detail; or field photo with overlay |

### Component 6: SUB-SECTION GALLERY (Personal/Wearable)
The principle on the body itself. DIFFERENT artifact (amulet, jewelry, clothing), DIFFERENT signal, personal/bodily access control.

| Deliverable | Format | Description |
|-------------|--------|-------------|
| `A4f_personal_artifact` | MUS attribution + 1-2 para narrative | Specific named object (pendant, ring, cloth, headdress, scarification mark if attested); signal as bodily marker; who could wear / who was forbidden |
| `A4f_signal_identification` | Bulleted analysis | Signal marks status on the body. How does A2's principle persist at individual scale? What transforms? |
| `A4f_access_matrix` | Simple table | Gender / age / rank / occupation — who could wear / who was forbidden? Sumptuary law if attested |
| `A4f_images` | MUS (1-2) | High-res detail of worn object; overlay highlighting signal element; if possible, worn on body (figurine, tomb painting) |

### Distillation Artifacts

| Deliverable | Content |
|-------------|---------|
| `A4_L5_etextbook` | 2500 word essay: "From Sacred Core to Household: How a Visual Principle Diffuses Across Social Strata." Synthesize all 6 subs into narrative of diffusion mechanics. Include access matrices as appendix. Cite museum sources. |
| `A4_L4_teacher_script` | 800 word annotated guide: Introduction to each sub-section; talking points on what changes and what persists across strata; suggested classroom discussion: "Where does the principle break down? Why?" |
| `A4_L3_slideshow` | 12-15 slides: Each sub gets 2 slides (artifact + signal analysis). Slide 1-3 intro to diffusion concept. Slides 12-15 synthesis: power map + timeline of diffusion. |
| `A4_L2_worksheet` | 3-page student worksheet: 6 artifact case studies (one per sub); for each: (1) describe the signal, (2) who could access it, (3) how is it different from the sacred version, (4) what A2 principle do you see? Answer key included. |
| `A4_L1_teacher_summary` | 300 word one-pager: Quick reference for each sub-section (1 sentence object ID | signal | access rule). Diffusion vector summary. Key insight: principle survives but transforms. |

---

## QUALITY CHECKLIST
- [ ] All 6 subs present; each represents DIFFERENT artifact category (not variants of same type)
- [ ] Each sub cites SPECIFIC named artifact with full museum attribution (museum name, accession number, or publication reference)
- [ ] Each sub identifies DIFFERENT signal from others (not repetition; signals should show transformation across strata)
- [ ] Each sub includes complete access matrix (at minimum: elite vs. non-elite; gender; role-based restriction if attested)
- [ ] Images sourced from museum collections (MUS) with high-res documentation; overlays clearly highlight signal-bearing element
- [ ] Each sub-narrative 1-2 paragraphs; addresses: what is the object? what does the signal mean? who could access it and why?
- [ ] Distillation artifacts are distinct in level and medium (etextbook ≠ script ≠ slideshow ≠ worksheet ≠ summary)
- [ ] Teacher script includes 2+ discussion prompts that invite students to analyze access/exclusion
- [ ] Worksheet answers demonstrate understanding of diffusion mechanics, not just artifact ID
- [ ] All 5 distillation artifacts address the diffusion question: how does the principle change as it moves down social strata?
