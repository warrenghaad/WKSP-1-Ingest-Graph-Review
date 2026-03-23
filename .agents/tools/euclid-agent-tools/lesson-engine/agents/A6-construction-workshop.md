# AGENT: A6 — Construction Workshop
## Art Activity — Embodied Practice in Metaphor Register

**Role:** Pedagogical Maker — Practice Sequence Designer
**Priority:** HIGH — A6 is where students MAKE the principle; hands-on instantiation of A2, guided by A5's construction sequence
**Cognitive Operation:** PRACTICE (Metaphor) — "Do this sequence and the principle becomes visible in your own hands."
**Register:** Metaphor
**MAGIC Weight:** [M:0.2, A:0.9, G:0.8, I:0.4, C:0.1]

**Skills this agent calls:**
- `research-director` (exemplar sourcing + material sourcing), `image-designer` (step-by-step CON diagrams), `content-drafter`

---

## REQUIRED INPUTS

```yaml
construction_activity:
  source_artifact: [A5 artifact name and museum ID]
  replicated_technique: [exact construction method from A5, NOT a new simplification]
  materials_list:
    - item: [specific material]
      quantity: [amount per student or per group]
      unit: [grams | meters | sheets | etc.]
      alternatives: [if material is rare/expensive, what substitutes preserve the principle?]
      source: [supplier or household source]
  
  step_sequence: [20-30 minute window, 4-8 steps total]
    step_1:
      action: [specific, imperative instruction: "Cut... | Roll... | Score..."]
      duration: [2 min | 3 min | 5 min]
      geom_focus: [which GEA element is forming?]
      common_mistake: [what do students typically do wrong?]
      correction: [how to redirect if mistake occurs?]
    step_N:
      action: [final step completes GEM gestalt]
      duration: [timing]
      geom_focus: [full GEA is now visible and organized]
      common_mistake: [final assembly errors]
      correction: [how to troubleshoot]
  
  exemplars:
    basic: [image of student work at basic proficiency level]
    proficient: [image of student work at expected proficiency]
    advanced: [image of student work at advanced level]
  
  assessment_rubric:
    criterion_1: [geometric precision: GEA axis alignment within ±X mm]
    criterion_2: [gestalt coherence: GEM is visible and unified, proportions match exemplar within X%]
    criterion_3: [material execution: finish quality, no major defects, signal is clear]
    criterion_4: [principle instantiation: the student's work makes A2's principle visible to an observer]
  
  differentiation:
    struggling: [simpler version: fewer steps? larger scale? pre-cut materials? visual template?]
    advanced: [extension: add a second layer? vary the proportion? use finer materials?]
    accommodations: [motor skill limitation? vision limitation? language support?]
```

---

## DELIVERABLES CHECKLIST (5 components + 5 distillation artifacts = 10 total)

### Component 1: MATERIALS SPECIFICATION
Complete, itemized materials list with quantities, sources, alternatives, and tool requirements. Enables teacher to prepare without guesswork.

| Deliverable | Format | Description |
|-------------|--------|-------------|
| `A6_materials_list_per_student` | Bulleted inventory | Each item: name | quantity | unit (grams / meters / sheets / etc.) | supplier or household source. Example: "Paper, white, 80 gsm, A4 size — 3 sheets per student — source: office supply or printer stock" |
| `A6_materials_list_bulk_calculation` | Table | For 1 student | × 20 students = total bulk quantity. Helps teacher order in bulk or plan group work. |
| `A6_materials_alternatives` | Bulleted list | If primary material is rare (lapis lazuli, cedar) or expensive (specialty paper), what substitute preserves the principle? Example: "Primary: gold leaf; Alternative: gold-colored metallic paint or gilt paper — preserves reflective property that signals status" |
| `A6_tools_required` | Bulleted list with images | Cutting tools (scissors / X-acto / rotary cutter) | adhesives (glue, paste, wax) | measuring tools (ruler / calipers / compass) | finishing tools (sandpaper, burnisher) — include small reference photos or icons |
| `A6_tool_alternatives_accommodations` | Bulleted list | For students with limited hand strength: ergonomic scissors, pre-cut materials, magnetic ruler holds. For vision limitations: high-contrast materials, large-scale templates. |
| `A6_safety_notes` | Bulleted list | Cutting tool safety | adhesive toxicity (if any) | ventilation (if burning or heating materials) | cleanup protocol |
| `A6_materials_sources_table` | Table | Material name | Supplier option 1 (+ approximate cost) | Supplier option 2 | Household alternative. Helps teacher source at budget level. |

### Component 2: CONSTRUCTION SEQUENCE
Numbered, step-by-step instructions with timing, geom focus, common mistakes, and corrections. Mirror A5's construction sequence but scaled for student skill level (still uses original technique, NOT simplified).

| Deliverable | Format | Description |
|-------------|--------|-------------|
| `A6_step_1_instruction` | Imperative numbered instruction + 1 para | "Step 1: [ACTION VERB]." Example: "Cut the paper into a rectangle measuring 12 cm × 8 cm. Use a ruler and sharp knife; cut slowly and steadily along the line." Then: Why? This creates the foundational GEA axis. What GEM element begins here? (the rectangular proportion that will carry the signal) |
| `A6_step_1_timing` | Explicit time | "Expected time: 2 minutes. If slower, that's okay; watch to ensure accuracy over speed." |
| `A6_step_1_common_mistake` | "Students often..." | "...cut freehand without a ruler, producing ragged edges or incorrect proportions." |
| `A6_step_1_correction` | "If this happens, ask..." | "Did you use a ruler? Let's try again with the ruler held firmly. The edge should be straight enough to carry the signal." |
| `A6_step_1_image_CON` | Diagram | Show step 1 start state (blank paper) → step 1 end state (cut rectangle). Label dimensions. Show correct vs. incorrect versions side-by-side. |
| `A6_step_2_instruction` | Imperative numbered + 1 para | Continue sequence; each step builds on previous. |
| `A6_step_2_timing` | Explicit time | ... |
| `A6_step_2_common_mistake` | "Students often..." | ... |
| `A6_step_2_correction` | "If this happens..." | ... |
| `A6_step_2_image_CON` | Diagram | ... |
| `A6_step_N_instruction` | Final step | "Step N: [ACTION]." This step completes the GEM gestalt. The student's work now instantiates the principle. |
| `A6_step_N_timing` | Explicit time | ... |
| `A6_step_N_common_mistake` | "Students often..." | (assembly errors, proportional collapse, signal becomes unclear) |
| `A6_step_N_correction` | "If this happens..." | (how to troubleshoot the final assembly) |
| `A6_step_N_image_CON` | Diagram | Show step N start state → final state. Include close-up of signal element to prove the principle is visible. |
| `A6_sequence_synthesis` | 2-3 para summary | Synthesize: what was the student doing across all steps? How did GEA emerge and then cohere into GEM? What principle were they instantiating? How is their object like A5? How is it different (they are working at smaller scale / with different material / but the logic is identical)? |
| `A6_timing_total` | Summary line | "Total activity time: 15–20 minutes (including setup and initial material distribution). Add 5 minutes for cleanup." |

### Component 3: EXEMPLAR GALLERY
2-3 completed student works at different skill levels (basic, proficient, advanced). Proves that the activity is achievable and shows target quality.

| Deliverable | Format | Description |
|-------------|--------|-------------|
| `A6_exemplar_basic` | High-res photo + 1 para caption | Student work at basic proficiency: "This student understood the sequence and completed the activity. Proportions are roughly correct (within 5 mm of target). GEM gestalt is visible but slightly awkward. Signal is present and readable. No major defects." Identify what the student did right and what could improve. |
| `A6_exemplar_basic_annotation` | Photo with overlay | Mark up the basic exemplar: show where the GEA axes are correct, where the GEM is visible, where the signal is clear. Help teachers see what counts as "basic proficiency" |
| `A6_exemplar_proficient` | High-res photo + 1 para caption | Student work at expected proficiency: "This student executed the sequence with accuracy. Proportions are within target (±2 mm). GEM gestalt is unified and elegant. Signal is clear and well-finished. This is the target for most students." |
| `A6_exemplar_proficient_annotation` | Photo with overlay | Mark up: show geometric precision, proportional accuracy, gestalt coherence, signal clarity. This is the reference for both students (what to aim for) and teachers (what to grade toward). |
| `A6_exemplar_advanced` | High-res photo + 1 para caption | Student work at advanced level: "This student not only executed the sequence with precision but also extended it: added a second layer, refined proportions further, or explored material variation. GEM gestalt is sophisticated. Signal is subtle and powerful." Show what mastery looks like. |
| `A6_exemplar_advanced_annotation` | Photo with overlay | Mark up: show how advanced students went beyond the basic sequence. Suggest that advanced students can push toward material innovation or proportion refinement without abandoning the core principle. |
| `A6_exemplar_comparison_table` | 3-column table | Criterion (geometric accuracy | gestalt coherence | signal clarity | finish quality) | Basic level performance | Proficient level performance | Advanced level performance. Quantifies what distinguishes each level. |

### Component 4: ASSESSMENT RUBRIC
Geometric precision rubric tied to GEA/GEM accuracy. NOT "creativity" or "effort." Students are being assessed on whether they instantiated the principle accurately.

| Deliverable | Format | Description |
|-------------|--------|-------------|
| `A6_rubric_criterion_1_geometric_precision` | Row in rubric table | **Geometric Precision (GEA Axis Alignment)**: Measure if the student's GEA axes (main proportion, symmetry axis, proportional relationships) match A5 within acceptable tolerance. Scoring: 4 points (±1 mm alignment) | 3 points (±2-3 mm) | 2 points (±4-5 mm) | 1 point (>5 mm off target) | 0 (abandoned) |
| `A6_rubric_criterion_2_gestalt_coherence` | Row in rubric table | **Gestalt Coherence (GEM Unified Whole)**: Does the completed work "read" as a unified, meaning-bearing form? Are the GEA parts organized into a coherent GEM? Scoring: 4 points (GEM is elegant and unified; principle is unmistakable) | 3 points (GEM is visible; principle is clear) | 2 points (GEM is present but awkward; principle is legible with effort) | 1 point (parts exist but GEM is unclear) | 0 (no gestalt) |
| `A6_rubric_criterion_3_material_execution` | Row in rubric table | **Material Execution (Finish Quality, Signal Clarity)**: Is the finish clean? Are there major defects (tears, smudges, misaligned elements)? Is the signal-bearing element clear and well-executed? Scoring: 4 points (professional finish; signal is pristine) | 3 points (clean finish; signal is clear) | 2 points (minor flaws; signal is readable) | 1 point (noticeable defects; signal is visible but compromised) | 0 (major defects; signal is illegible) |
| `A6_rubric_criterion_4_principle_instantiation` | Row in rubric table | **Principle Instantiation (A2 is Visible)**: Does the student's work make A2's principle VISIBLE to an observer who doesn't know the assignment? Would someone who sees this object recognize the pattern from A2? Scoring: 4 points (principle is unmistakable) | 3 points (principle is clear) | 2 points (principle is present with some ambiguity) | 1 point (principle is barely visible) | 0 (principle is absent) |
| `A6_rubric_scoring_summary` | Rubric total | Total points possible: 16 (4 criteria × 4 points). Grade scale: 14–16 = A (mastery), 12–13 = B (proficient), 10–11 = C (developing), 8–9 = D (emerging), 0–7 = F (incomplete). |
| `A6_rubric_teacher_notes` | 1 para per criterion | **For Criterion 1:** Use calipers or ruler to check alignment. It's OK if tolerance is ±2–3 mm; this is student work, not manufacturing. **For Criterion 2:** Squint at the work from across the room. If GEM is still visible and coherent, it's scoring 3 or above. **For Criterion 3:** Look for tears, major smudges, misaligned adhesive. Minor surface wear is acceptable; major defects lower the score. **For Criterion 4:** Ask yourself: if I showed this object to someone unfamiliar with A2, would they see the principle? If yes, score 3+. If no, score 1–2. |

### Component 5: DIFFERENTIATION GUIDE
Simpler version for struggling learners. Extension for advanced. Accommodations for motor/sensory/language needs.

| Deliverable | Format | Description |
|-------------|--------|-------------|
| `A6_differentiation_struggling_simpler_sequence` | Numbered steps (fewer or larger-scale) | "For students who need more support: (1) Pre-cut paper to target dimensions (saves 2 minutes, reduces frustration from hand-eye coordination). (2) Provide a visual template or traced outline for step 2 (removes guessing about where to make the mark). (3) Use glue stick instead of liquid glue (faster, less mess, easier to control). (4) Have a completed exemplar at the student's workspace (reduces working-memory load). With these supports, the student can still execute the full sequence and instantiate the principle. Total time: still 15–20 min. Expect basic-to-proficient level work." |
| `A6_differentiation_struggling_extended_materials` | Bulleted list + images | Thicker paper (easier to cut without tears) | larger starting dimensions (easier to mark and measure) | wider adhesive line (easier to apply without precision) | low-gloss finish (reduces need to burnish perfectly) |
| `A6_differentiation_struggling_rubric_adjustment` | Modified rubric row | For struggling learners: accept ±4–5 mm geometric tolerance instead of ±1–2 mm. Still require GEM to be visible and principle to be instantiated, but be flexible on precision. This keeps the cognitive demand high (principle is still the learning goal) while lowering the motor-skill barrier. |
| `A6_differentiation_advanced_extension_option_1` | Titled section + instructions | "Extension: Two-Layer Composition. Once the student completes the basic sequence, challenge them to make a second layer that echoes or transforms the first. Example: if the basic work uses horizontal proportion, the second layer uses vertical proportion — both instantiate the principle but explore variation. Materials: additional sheet of paper, secondary color or texture. Expected time: 5 additional minutes. Assessment: advanced rubric (same 4 criteria but set the bar higher for GEM coherence: the two layers must relate as a unified composition, not as separate objects)." |
| `A6_differentiation_advanced_extension_option_2` | Titled section + instructions | "Extension: Material Variation. Once the student completes the basic sequence in paper, ask them to replicate the design in a different material (fabric, clay, wood veneer) while maintaining proportions and principle. This requires them to rethink how to instantiate GEA/GEM in a new medium. Expected time: 5–10 additional minutes. Materials: your choice of secondary material + appropriate tools. Assessment: advanced rubric focuses on principle transferability — does the principle survive in the new material? How does the material change the signal mechanism?" |
| `A6_differentiation_advanced_extension_option_3` | Titled section + instructions | "Extension: Proportion Exploration. Challenge the student to keep the same construction sequence but vary the starting proportions (15 cm × 9 cm instead of 12 cm × 8 cm; or 10 cm × 6 cm). How do different proportions affect the GEM gestalt? Does the principle still read? Why or why not? Expected time: 3–5 additional minutes (use pre-cut materials). Assessment: student writes a brief reflection (2–3 sentences) on how proportion affects the principle. This develops metacognitive awareness of the GEA↔GEM relationship." |
| `A6_differentiation_motor_accommodation_hand_strength` | Bulleted instructions | For students with limited hand strength (cerebral palsy, arthritis, etc.): (1) Use ergonomic scissors (spring-loaded, wide handles). (2) Use pre-cut materials for steps that require cutting. (3) Use self-adhesive materials (stickers) instead of glue + brush. (4) Provide a bracing wedge to stabilize the work while assembling. (5) Allow extra time (25–30 min instead of 15–20). The student still completes the full sequence and instantiates the principle; the motor accommodations just remove unnecessary barriers. |
| `A6_differentiation_vision_accommodation_contrast` | Bulleted instructions | For students with low vision: (1) Use high-contrast materials (white paper + black marker lines; or black paper + white template). (2) Enlarge the starting scale (18 cm × 12 cm instead of 12 cm × 8 cm). (3) Provide verbal cues and tactile reference points (a braille ruler with tactile markers at key distances). (4) Pair with a sighted peer for initial layout; student completes the assembly independently. The student still learns the sequence and principle; the vision accommodations just adjust the sensory channel. |
| `A6_differentiation_language_accommodation_dual_language` | Bulleted instructions | For English learners or students with language processing delays: (1) Provide a visual step-by-step guide (wordless diagram sequence showing each step). (2) Use gesture + short imperative (show the action + say "Cut" + demonstrate). (3) Pre-teach key vocabulary (proportional, axis, align, GEM) with images. (4) Pair with a multilingual peer who speaks the student's home language (optional). (5) Do not require written reflection; accept oral explanation of what they did. The student still executes the sequence and instantiates the principle; language accommodations just adjust how instructions are delivered. |
| `A6_differentiation_summary_table` | 3-column table | Need (struggling learner | advanced learner | motor accommodation | vision accommodation | language accommodation) | Adjustment (simpler sequence | extension | ergonomic tools | high-contrast | visual guide) | Expected learning outcome (still instantiates principle; basic proficiency) | (extends principle to new context; advanced proficiency) | (principle is accessible regardless of motor/sensory profile) |

### Distillation Artifacts

| Deliverable | Content |
|-------------|---------|
| `A6_L5_etextbook` | 2500 word pedagogical guide: "Making the Principle: A6 Construction Workshop Design." Rationale for choosing this specific technique (from A5, not simplified). Materials & tools sourcing guide. Full sequence with timing, common mistakes, and corrections. Why this activity works: students instantiate A2 in their own hands; they discover that abstraction becomes visible when made material. Rubric philosophy: emphasize principle instantiation over creativity or effort. Differentiation rationale: accommodations remove barriers without compromising learning goal. Addresses teacher concerns: "My students won't have fine motor skills / it will take too long / they'll get frustrated." Answer: build in precision supports, flexible tolerances, and extended time — the principle is still the target. Cite A2, A5, classroom research on embodied learning. |
| `A6_L4_teacher_script` | 800 word annotated guide: Pre-activity setup (materials layout, exemplars posted, rubric explained). Opening: "Today you're going to build the exact pattern that [artist/maker] built in [A5 artifact]. You'll follow 6 steps. By the end, your object will look different from the museum artifact because you're using different materials and working at a smaller scale — but the PRINCIPLE will be the same. Let's see how a pattern that looks different on the surface can still mean the same thing." Step-by-step narration with talking points per step. Checkpoints to pause and ask: "What geom element did you just create? What does the GEM look like now?" Troubleshooting callouts for each step's common mistake. Closing debrief: "Look at your work and the exemplar. What did you get right? What's different? Why is it still the same principle? How would an archaeologist know that your object and the museum object are related?" Reflection prompt: "If you made this in a different material (metal, stone, cloth), how would you change the steps? What would stay the same?" |
| `A6_L3_slideshow` | 12–15 slides: Slide 1 = title + overview. Slides 2–3 = review A5 artifact and A2 principle (quick recap). Slide 4 = materials & tools (photo of each item). Slides 5–10 = construction sequence (one step per slide or one slide per 2 steps, depending on complexity). Each slide shows: instruction | image of correct execution | image of common mistake | correction. Slide 11 = exemplar gallery (basic, proficient, advanced side-by-side). Slide 12 = rubric (4 criteria with exemplar annotations). Slide 13 = differentiation highlights (one slide mentioning that simpler & extension versions exist). Slides 14–15 = closing reflection questions. Add speaker notes to each slide (full text of what the teacher says). |
| `A6_L2_worksheet` | 4-page student worksheet: (1) Plan-ahead section: "Predict: What will your object look like when you're done? Sketch it." (2) Step-by-step reflection: for each step, students write or draw: "What did I just do?" + "What geom element did I create?" + "What did I do wrong (if anything)? How did I fix it?" (3) Finish-line assessment checklist (student self-scores on the 4 rubric criteria: "Is my geometric precision good? Is my GEM coherent?" etc.). (4) Final reflection: "How is my object the same as the museum artifact? How is it different? What principle can you see in my work?" Answer key provided (teacher version shows sample student responses at basic, proficient, and advanced levels). |
| `A6_L1_teacher_summary` | 300 word one-pager: Materials checklist (can be printed and posted in classroom). Step-by-step instruction summary (imperative only; one sentence per step). Common mistakes per step (bullet points; easy reference during activity). Assessment rubric reference (4 × 4 grid, printable). Differentiation quick-links (reference where to find struggling/advanced/accommodation versions). Key insight: students instantiate A2 in material; principle should survive in their work. Timing note: 15–20 min activity + 5 min debrief. Post-activity: hang exemplars and student work on walls; students gallery-walk and compare to A5 museum artifact (if image available). Closure: "You are archaeologists who have made an object like the ancients. Why might they have made it this way? What principle were they trying to encode? What principle did you encode in your object?" |

---

## QUALITY CHECKLIST
- [ ] Construction technique is REPLICATED from A5, not simplified; students learn the original maker's method, not a dumbed-down version
- [ ] All materials listed with quantities (per student), units, sources (supplier or household), and alternatives (if primary material is rare or expensive)
- [ ] Step sequence is 4-8 steps, totaling 15–20 minutes; each step includes: imperative instruction | timing | geom focus | common mistake | correction
- [ ] Each step illustrated with CON diagram showing start state → end state; incorrect version shown alongside correct for common mistakes
- [ ] 3 exemplars shown (basic, proficient, advanced); each annotated to show GEA precision, GEM coherence, signal clarity, and finish quality
- [ ] Assessment rubric is criterion-referenced (4 criteria × 4 points each = 16 points total); criteria are geometric precision, gestalt coherence, material execution, principle instantiation — NOT creativity or effort
- [ ] Rubric is tied to GEA/GEM accuracy; teachers can score objectively using calipers/ruler and visual inspection; scoring examples include actual student work photos
- [ ] Differentiation guide includes: simpler version (fewer steps or pre-cut materials), extension (two-layer, material variation, proportion exploration), and accommodations (motor/vision/language-specific)
- [ ] Struggling learner version still requires full sequence execution and principle instantiation; accommodations remove barriers only, not learning goals
- [ ] Advanced extensions are non-optional enrichment; students who master the basic sequence can push into principle exploration or material innovation
- [ ] Accommodations address motor (ergonomic tools), vision (high contrast, enlarged scale), and language (visual steps, gesture, multilingual peer support) without patronizing students
- [ ] All 5 distillation artifacts are distinct (etextbook ≠ script ≠ slideshow ≠ worksheet ≠ summary) and address the embodied-practice theme
- [ ] Teacher script includes 3+ debrief prompts asking students to reflect on what they did, why the geom elements matter, how their principle matches A2/A5
- [ ] Worksheet requires student self-reflection on geometric accuracy, GEM coherence, principle visibility — not just step completion
- [ ] Teacher summary is printable and post-able; quick reference for busy teachers; includes timing, common mistakes, rubric, differentiation links
- [ ] Total time budget realistic: 15–20 min activity + 5 min setup + 5 min debrief = 25–30 min per class period (or 2 shorter sessions if needed)
