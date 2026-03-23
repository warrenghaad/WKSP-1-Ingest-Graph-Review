# AGENT: B7 — Engineering Practice
## Practice: Build, Test, Diagnose, Iterate

**Role:** Guide students through hands-on construction and testing of the geometric invention; embed the engineering cycle (predict → build → test → diagnose → iterate) within 15–20 min; verify that B2's mathematical property holds in physical form.
**Priority:** LEVEL 1 — B7 is the longest Day B activity (15–20 min); consolidates all prior learning through embodied, iterative practice; formative data on geometric precision feeds B8 synthesis.
**Cognitive Operation:** PRACTICE (Function) — "Can you build this to specification? Does B2's property hold when you test it? What failed? Why? How do you fix it?"
**Register:** function
**MAGIC Weight:** [M:0.7, A:0.3, G:0.8, I:0.2, C:0.1]

**Skills this agent calls:**
- B6 (engineering decomposition reference: sequence, materials, measurements)
- B2 (mathematical property verification in the field)
- Measurement tools & data recording
- Iteration protocol (diagnose → modify → retest)

---

## REQUIRED INPUTS

```yaml
build_sequence: B6 Component 2 (step-by-step construction with timings)
materials_list: B6 Component 3 (materials, tools, safety)
measurement_spec: B6 Component 3 (critical dimensions and tolerances)
prediction_framework: B6 Component 4 (testable predictions and success criteria)
failure_catalog: B6 Component 5 (common failures + recovery procedures)
student_proficiency_level: range (e.g., "can measure to nearest mm" vs. "novice at fastening")
class_duration: available time window (15–20 min for full cycle including iteration)
materials_quantity_per_student: confirmed student-to-material ratio
```

---

## DELIVERABLES CHECKLIST (5 components + 5 distillation artifacts = 10 total)

### Component 1: Build Instructions
| Deliverable | Format | Description |
|-------------|--------|-------------|
| Student-Facing Step Sequence | Numbered list (1–N) with icons/labels | Same logical sequence as B6 Component 2, but reframed for student action: "You do this now." Each step includes: (1) action verb, (2) 2–5 min timing estimate, (3) illustration, (4) specific tools required, (5) "Check: measure X before proceeding." |
| Illustrated Build Guide (3 images minimum) | Annotated photo/diagram set | Step-by-step photos or clear diagrams for critical moments: (1) initial layout and marking, (2) joining/fastening at stress point, (3) final assembly and verification. Marks geometric features that MUST be precise. |
| Common Mistakes Callout Boxes | Visual warnings (icons + 1-sentence descriptions) | Placed at steps where pilot data shows frequent errors (e.g., "Oops: Angle too steep here → force won't balance"). Non-judgmental, instructive tone. |
| Timing Pacing Guide for Teacher | Table (step × estimated duration × cumulative time) | Helps teacher monitor class pace; flags which steps tend to slip; notes where to assign peer help vs. whole-group pause. |

### Component 2: Testing Protocol
| Deliverable | Format | Description |
|-------------|--------|-------------|
| Test Setup Instructions | Step-by-step with diagram | How to prepare the test apparatus: mount the model, apply load, set up measurement tools, position observation point. Includes safety setup (eye protection, stable bench, load containment). |
| Observation & Measurement Procedure | Numbered steps with checkpoints | What to measure: (1) static geometry (angle, alignment, gap) before loading, (2) load application (how much, at what rate), (3) displacement or deformation (where, how much, with what tool), (4) failure mode if it occurs (buckling, cracking, shear, etc.). Includes "freeze" instruction (photo/sketch failure state if it happens). |
| Measurement Instrument List & Accuracy | Table (instrument × accuracy ± mm × examples of what to measure) | Ruler, caliper, protractor, displacement gauge, load cell (if available); accuracy tolerance for each; examples of how each is used in this test. |
| Test Protocol Poster (1-page, laminated) | Visual checklist with icons | For student reference during test: "Measure this. Observe that. Record here. If X happens, do Y." |

### Component 3: Data Collection Template
| Deliverable | Format | Description |
|-------------|--------|-------------|
| Student Data Sheet (table format) | Columns: Prediction / Observation / Measurement / Geometric Principle Verified? / Notes | Pre-loaded with 3–4 rows for the predicted outcomes from B6 Component 4. Students fill in: What did you expect? What did you see? What number? Did B2's property hold or break? Why? |
| Geometric Precision Verification Table | Table (dimension name × design spec ± tol. × student measurement × pass/fail) | Rows for each critical dimension from B6 Component 3; students record their measurement; automated or visual flagging if out of tolerance. |
| Failure Mode Observation Log | Free-form + structured prompts | "If something breaks or deforms unexpectedly: Sketch it here. Where? Why do you think it happened? Which geometric principle does this violate?" Captures emergent failures not in the catalog. |
| Raw Data & Reflections Space | Lined section | Students can record unstructured observations, sketches, questions that arise during testing. |

### Component 4: Iteration Guide
| Deliverable | Format | Description |
|-------------|--------|-------------|
| Diagnosis Decision Tree | Flowchart or visual logic | "Didn't work as predicted? → Check: Was [dimension X] out of tolerance? → If yes, modify [part Y]. If no, check [dimension Z]. → Re-test." Leads student systematically through root-cause analysis. |
| Modification Instructions (by failure mode) | Linked to B6 Component 5 failure catalog | For each common failure: "If this failed, try this fix. Here's what to measure to know it's fixed. Here's how to re-test quickly." Emphasizes iteration cycle, not starting over. |
| Time-Boxed Re-test Protocol | Abbreviated version of Component 2 | For iteration cycles: "You fixed it. Now re-test these 2 things in 2 min. Did it work? If yes, move to data summary. If no, iterate again." Keeps class on pace while allowing productive struggle. |
| Iteration Tracker | Table (attempt # × modification made × result: pass/fail) | Students log each iteration attempt; encourages metacognition ("What did I learn from that attempt?"). |

### Component 5: Assessment Rubric
| Deliverable | Format | Description |
|-------------|--------|-------------|
| Geometric Precision Rubric | Checklist (3–4 criteria) | (1) Did student model maintain B2's critical geometric property within tolerance? (2) Can student articulate why that tolerance matters? (3) Did student measure correctly? Scored as Yes/Partial/No; not "creativity" or "effort." |
| Functional Test Rubric | Checklist (3–4 criteria) | (1) When tested, did the model behave as B2's property predicts? (2) Did student correctly interpret the test results? (3) Could student diagnose why it succeeded or failed? Scored as Yes/Partial/No. |
| Engineering Cycle Rubric | Checklist (2–3 criteria) | (1) When prediction didn't match observation, did student iterate? (2) Did student's modification address the root cause (not random changes)? (3) Did student verify the fix worked? Scored as Yes/Partial/No. |
| Data Quality Checklist | Verification list (measurements complete, units recorded, legible, within expected range) | Teacher/peer review: Are the data trustworthy? Are they precise enough to support conclusions? |

---

### Distillation Artifacts

| Deliverable | Content |
|-------------|---------|
| B7 Teacher Facilitation Guide (2–3 min role clarity) | "Your role: Monitor pace. When someone's stuck, ask diagnostic questions (don't fix it for them). When someone finishes early, ask: 'Why did it work? Did B2's property really hold?' Collect data for B8." |
| B7 Student Success Checklist (1 page, student-facing) | "By end of B7, I have: (1) Built a model to spec, (2) Tested it, (3) Recorded data, (4) Iterated if it failed, (5) Explained why B2's property did (or didn't) hold." |
| B7 Vocabulary in Action | Glossary of terms used during practice: load, displacement, tolerance, precision, iteration, equilibrium, failure mode. Each with a sentence anchoring it to what students just did. |
| B7 → B8 Data Aggregation Prompt | "Collect all student data sheets. Are students' models converging on the same result? Where did variations occur? Which geometric precision issue showed up most? This data launches B8's synthesis." |
| B7 Quick-Reference Card (1 page, laminated) | Summary of test protocol + measurement tools + tolerance checklist. For student reference during testing; reduces cognitive load from remembering B6 while executing B7. |

---

## QUALITY CHECKLIST
- [ ] Build instructions are reframed for student action (imperative voice: "You measure," "You fasten," "You check"); not just regurgitating B6.
- [ ] Timing is realistic for 15–20 min total including iteration; pacing guide flags steps that tend to overrun.
- [ ] Common mistakes callout boxes are placed at the exact steps where pilot data shows frequent errors; tone is supportive, not punitive.
- [ ] Test protocol is reproducible (step-by-step, measurement tools listed, accuracy specs noted); can be run by different students and yield comparable data.
- [ ] Data collection template is pre-structured (columns provided, prompts included); students can fill it in without extended written response, within 3–5 min per prediction.
- [ ] Iteration guide is genuinely diagnostic (decision tree guides students toward root cause); modification instructions are time-bounded (< 3 min rework) so class stays on pace.
- [ ] Assessment rubric is standards-based, not effort-based; criteria are tied to geometric precision and functional outcome (B2 property holds?), not "creativity."
- [ ] B6 → B7 link is explicit: build sequence matches, materials are the same, measurement specs are referenced, predictions from B6 are directly tested.
- [ ] Safety during testing is addressed (load containment, eye protection, tool handling, failure mode safety).
- [ ] B7 → B8 transition is set up: data aggregation prompt ensures data is collected for synthesis; variation patterns visible in student data inform B8's dual-register discussion.
