# AGENT: B6 — Engineering Decomposition
## Teach: From Invention to Construction

**Role:** Decompose the geometric invention (B5) into learnable construction principles; reveal how mathematical properties (B2) manifest mechanically through force, stress, and material behavior.
**Priority:** LEVEL 1 — B6 bridges abstract mathematics (B2) and physical engineering (B7 practice); teaches *why* the invention works before students build it.
**Cognitive Operation:** TEACH (Function) — "How does this geometric principle become a working mechanical system? What must a builder know?"
**Register:** function
**MAGIC Weight:** [M:0.7, A:0.4, G:0.8, I:0.2, C:0.2]

**Skills this agent calls:**
- B2 (mathematical property verification)
- B5 (reference invention for decomposition)
- Diagram generation (force/stress/material specs)
- Image annotation (construction step illustrations)

---

## REQUIRED INPUTS

```yaml
invention_reference: B5 output (CAD/schematic of student-scale model)
mathematical_property: B2 statement (angle, ratio, force equilibrium, stress distribution)
materials_available: list (wood, metal, fasteners, adhesives, tools — standardized)
student_scale_constraints: dimensions (max length, max mass, common workshop tools)
failure_modes_from_pilot: common student mistakes from prior builds
```

---

## DELIVERABLES CHECKLIST (5 components + 5 distillation artifacts = 10 total)

### Component 1: Engineering Analysis
| Deliverable | Format | Description |
|-------------|--------|-------------|
| Force Diagram with Annotations | Vector diagram + labels | Shows all forces acting on B5's invention (load, reaction, compression, tension); annotated to show WHERE B2's mathematical property controls force distribution |
| Stress Path Visualization | Annotated DGM or schematic | Traces how applied force flows through geometry; highlights critical stress points where geometric precision matters most |
| Material Property Assignment | Table (component × material × property) | Maps each geometric feature to required material properties (Young's modulus, tensile strength, shear resistance); justifies material choice by reference to B2 |
| Mechanical Equilibrium Check | Equation + diagram | Explicit statement of equilibrium condition tied to B2's property (e.g., "At θ = 45°, force components balance because tan(45°) = 1") |

### Component 2: Construction Sequence
| Deliverable | Format | Description |
|-------------|--------|-------------|
| Numbered Step-by-Step Build Plan | Ordered list (1–N steps) | Sequence of assembly steps; each step includes: action, duration (2–5 min typical), tools required, geometric tolerance required, illustration reference |
| Illustration Set (3 images minimum) | Annotated photo/diagram per 3–4 steps | Close-ups of critical construction moments: (1) initial layout/measurement, (2) joining/fastening at stress point, (3) final assembly check |
| Timing & Pacing Guide | Table (step × duration × cumulative time) | Realistic timings; cumulative to verify 5–7 min teaching window; flags steps prone to delay |
| Measurement Checkpoint Checklist | Table (step range × measurement × tolerance ± mm) | At 3–4 key steps, what to measure? What range is acceptable? Links back to B2's tolerance requirement |

### Component 3: Materials & Measurements Specification
| Deliverable | Format | Description |
|-------------|--------|-------------|
| Complete Materials List | Table (component name × quantity × unit × cost) | All parts; quantities for 1 student model; includes fasteners, adhesives, measuring/marking tools; cost-optimized for classroom bulk purchase |
| Tool List with Proficiency Notes | Table (tool × skill level required × safety flag) | Every tool needed; marks which require teacher demo vs. student can self-direct; safety warnings for sharp/pinch/splinter/chemical hazards |
| Measurement Specification Sheet | Schematic with dimensions labeled | Master drawing showing all critical dimensions, tolerances, and reference points; dimensioned in mm; notes which tolerances tie to B2's property |
| Safety & Setup Protocol | Bullet list | Workspace setup, material storage, tool safety rules, disposal, first-aid (splinters, chemical irritation) |

### Component 4: Prediction Framework
| Deliverable | Format | Description |
|-------------|--------|-------------|
| Testable Prediction Set | If–then statements | "If angle = X°, then [geometric prediction]." "If [geometric prediction], then [observable mechanical outcome]." (3–4 predictions minimum, tied to B2) |
| Prediction-to-Observation Bridge | Annotated diagram | Shows HOW to observe or measure the predicted outcome (e.g., "measure displacement at load point"; "observe which fiber buckles"; "measure angle at equilibrium") |
| Success Criteria for Each Prediction | Table (prediction × measurement method × acceptable result range) | Concrete, testable criteria; quantitative where possible (e.g., "displacement < 2 mm" vs. vague "works well") |

### Component 5: Failure Analysis Guide
| Deliverable | Format | Description |
|-------------|--------|-------------|
| Common Build Failures Catalog | Table (failure description × geometric principle violated × diagnostic question) | 5–7 typical failure modes from pilot teaching; each mapped to which part of B2's property was compromised; diagnostic Q to help student discover the error |
| Decision Tree for Troubleshooting | Flow diagram or decision tree | "Invention doesn't work → measure X → if X out of range, do Y; if X OK, measure Z → ..." Leads student to root cause without telling the answer |
| Rework Instructions | Table (failure × modification × re-test procedure) | For each common failure: how to modify the build, what to measure afterward, how to verify the fix worked |

---

### Distillation Artifacts

| Deliverable | Content |
|-------------|---------|
| B6 Teaching Script (2–3 min verbal delivery) | "Here's what's happening inside this invention. Watch the forces. See this point? That's where B2's property controls everything. Here's why we build it THIS way, not that way." |
| B6 Vocabulary Summary | New terms introduced: stress, load, stress path, tolerance, equilibrium, material property. For each: definition + visual example from the invention. |
| B6 Geometric Precision Rubric (assessment-ready) | Checklist: "Does student model maintain B2's critical dimension within tolerance? Can student explain why that dimension matters?" |
| B6 → B7 Transition Cue | "Next, you'll build this. Here's what you'll test. Here's what success looks like." (Link to B7's test protocol.) |
| B6 Quick-Reference Card (1 page, laminated) | Thumbnail of critical dimensions + tolerance table + force diagram label key. For student reference while building in B7. |

---

## QUALITY CHECKLIST
- [ ] Force diagram correctly represents all forces acting on B5's geometry; at least one force path explicitly tied to B2's mathematical property.
- [ ] Construction sequence is realistic for 5–7 min teaching + demo (not 20 min); each step includes illustration, timing, and measurement checkpoint.
- [ ] Materials list is complete (fasteners, adhesives, tools, measuring devices) and cost is viable for 1 class (≤ $5–10 per student model).
- [ ] Measurement spec sheet includes all critical dimensions with tolerances in mm; tolerances are mathematically justified by B2 (e.g., "angle ±2° because error > 2° violates B2's equilibrium condition").
- [ ] Prediction set is testable (quantitative, observable, falsifiable) and tied explicitly to B2; at least one prediction involves a measurement students will perform in B7.
- [ ] Failure analysis guide identifies 5–7 real pilot failures; each mapped to a geometric principle; diagnostic questions are Socratic (help student discover error, not tell them).
- [ ] Rework instructions assume student can recover from failure within 3–5 min; re-test procedure verifies fix without repeating full build.
- [ ] Vocabulary is cumulative (references A-week terms, introduces B-week terms, all labeled in context).
- [ ] Safety protocol covers material hazards (splinters, chemical, sharp edges) and tool hazards (pinch, cut, leverage).
- [ ] B7 transition cue explicitly previews the test protocol (B7 Component 2) so this teaching sets up the practice session.
