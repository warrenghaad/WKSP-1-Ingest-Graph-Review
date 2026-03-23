# AGENT: B2 — Mathematical Properties
## GEK Formalization

**Role:** Define the functional property precisely; make the mathematical rule explicit and verifiable at grade level; establish the property that will drive B5 deployment and future functional applications
**Priority:** CRITICAL — B2 is to Day B what A2 is to Day A; if B2 is wrong, functional understanding collapses; this is the DEFINING section
**Cognitive Operation:** DEFINE (Function) — "What is the rule? What property MUST this shape have to do what it does?"
**Register:** function
**MAGIC Weight:** [M:0.9, A:0.2, G:0.7, I:0.2, C:0.1]

**Skills this agent calls:**
- S3: Mathematical Notation & Formalization (grade-calibrated property definition)
- S4: Geometric Decomposition (A2 decomposition re-annotated with measurements, angles, ratios)
- S6: Visual Annotation & Markup (annotated DGM with mathematical overlay; measurement-focused)

---

## REQUIRED INPUTS
```yaml
from_A2:
  type: "geometric_decomposition"
  requirement: "Exact same decomposition geometry, same composition"
  reframing: "From perceptual affordance → mathematical property"
  critical: "SAME GEOMETRY, DIFFERENT COGNITIVE REGISTER"

from_A7:
  type: "dual_register_artifact"
  requirement: "The functional property inferred from A7's dual overlay"
  
mathematical_property:
  type: "measurable_rule"
  grade_calibration: 
    grade_3: "measurement, counting, visual verification"
    grade_4: "pattern demonstration, repeated measurement, simple proportion"
    grade_5: "proof-adjacent reasoning, angle relationships, symmetry groups"
  
to_B5:
  type: "functional_deployment_seed"
  requirement: "This property MUST be the mechanism deployed in B5"
  relationship: "B5 succeeds if and only if B2's property is correctly defined and understood"
```

---

## DELIVERABLES CHECKLIST (6 components + 5 distillation artifacts = 11 total)

### Component 1: GEK Property Definition
| Deliverable | Format | Description |
|-------------|--------|-------------|
| Formal Mathematical Statement | Text (1-2 sentences) | The property stated precisely, without jargon but with mathematical clarity. Example structure: "If [geometric condition], then [functional outcome] because [property reason]." Must be testable/verifiable. |
| Grade 3 Version | Accessible Language | Same property, stated in counting/measuring terms: "This part is [X units] and that part is [Y units], so [functional behavior] happens." Visual-friendly, concrete. |
| Grade 4 Version | Pattern Language | Same property, stated as repeating pattern or simple relationship: "Every time [geometric feature], [functional response] occurs." Demonstration-ready. |
| Grade 5 Version | Proof-Adjacent Language | Same property, stated with angle relationships, symmetry, or geometric reasoning: "Because [shape/angles/symmetry] has [mathematical property], [functional behavior] necessarily follows." Evidence-linked. |
| Property Essence Statement | Core Insight (1 sentence) | If student forgets everything else, this one sentence captures WHY the shape works. The heart of B2. |

### Component 2: Mathematical Annotation Diagrams
| Deliverable | Format | Description |
|-------------|--------|-------------|
| Decomposition Diagram (Grade 3) | DGM with Measurements | A2's decomposition re-annotated with dimensions, counts, simple visual relationships. Each component labeled with measurements relevant to the property. Color-coded by importance. |
| Decomposition Diagram (Grade 4) | DGM with Ratios & Patterns | A2's decomposition re-annotated with measured ratios, repeated patterns, proportional relationships. Arrows showing how components relate mathematically. |
| Decomposition Diagram (Grade 5) | DGM with Angles & Symmetry | A2's decomposition re-annotated with angle measurements, symmetry axes, rotation relationships, possibly trigonometric notation. Highlighting geometric dependencies. |
| Measurement Guide | Text Reference | Explanation of how measurements were taken, what tools were used, tolerances/accuracy noted. Shows how the property was verified empirically. |
| Geometry-Property Link Callouts | Annotations on Diagrams | 3-5 specific callouts showing "THIS measurement IS the property" or "THIS relationship ENABLES the function." Direct evidence connecting geometry to mathematical property. |

### Component 3: Proof / Demonstration
| Deliverable | Format | Description |
|-------------|--------|-------------|
| Grade 3 Verification Method | Activity/Procedure | Counting or measuring approach: "Measure these three distances. Measure that distance. Are they equal/proportional? Yes = property confirmed. This is why [function] works." Tactile, visual, repeatable. |
| Grade 4 Demonstration Method | Pattern/Repetition Test | "Do this action [X times] in this geometric arrangement. Count [Y outcomes]. Does the pattern hold? Yes = property confirmed through evidence." Predictive test design. |
| Grade 5 Proof-Adjacent Reasoning | Logical Chain | "If [geometric condition A], then [geometric consequence B] must be true. If [B], then [property C] must be true. Therefore [functional behavior D] necessarily occurs. Here's why each step holds..." Conditional logic, not full formal proof but proof-adjacent. |
| Verification Results | Evidence Statement | Brief statement that the proof/demonstration method has been applied to the artifact and the property verified. Cite data if available. |
| Why This Matters Explanation | Text (1 paragraph) | Why can we trust this property? Why does verification through proof/demonstration matter? Builds student confidence in the rule. |

### Component 4: Notation Guide
| Deliverable | Format | Description |
|-------------|--------|-------------|
| Symbol Dictionary | Reference Table | All mathematical notation used in this agent: what each symbol means, how to read it, what it measures. Grade-calibrated (Grade 3 = simple measurement symbols, Grade 5 = more formal notation). |
| Notation Examples | Worked Examples (2-3 per grade level) | Show how the notation is used in context of THIS property and THIS artifact. Not abstract — concrete. |
| Student-Facing Notation Introduction | Text (1 paragraph) | Friendly explanation: "Mathematicians use shorthand so they can talk about properties quickly. Here's our shorthand for this property..." Normalizes notation as tool, not barrier. |
| Notation-to-Language Translation | Two-Column Reference | LEFT: Formal notation | RIGHT: English sentence saying the same thing. Students can move between registers. |
| Grade Progression Map | Notation Progression Table | Shows which notations are used at which grade levels; helps teacher calibrate expectations and supports student scaffolding. |

### Component 5: A2 ↔ B2 Bridge Verification
| Deliverable | Format | Description |
|-------------|--------|-------------|
| Side-by-Side Comparison | Visual/Text Table | LEFT COLUMN: A2 Perceptual Affordance Statement ("This arrangement looks/feels/suggests [metaphorical principle]") | MIDDLE COLUMN: SAME GEOMETRY highlighted and numbered | RIGHT COLUMN: B2 Mathematical Property Statement ("This arrangement HAS the property that [mathematical rule]"). Shows they describe the SAME geometry, different cognitive registers. |
| Geometry Alignment Verification | Annotation Overlay | Transparent overlay or split-screen showing the identical geometric features referenced in A2 affordance statement and B2 property statement. Every feature A2 mentioned is geometrically present in B2's proof. |
| Register Translation Narrative | Text (1-2 paragraphs) | Student-facing explanation: "Notice: the shape that MEANS something (Day A) is EXACTLY the same shape that HAS this property (Day B). You were seeing the geometry correctly all along. We're just using different tools to understand it." Builds coherence across days. |
| Verification Checklist | Student Activity | "Check: Can you find [A2 principle visual marker] on this diagram? Can you find [B2 property measurement] on this diagram? Are they on THE SAME parts of the shape? Yes? Then the bridge works." |

### Component 6: B5 Deployment Seed
| Deliverable | Format | Description |
|-------------|--------|-------------|
| B5 Application Preview | Text (1-2 sentences) | Explicit statement of HOW this property will be used in B5. Example: "Tomorrow we'll use THIS property to [build/predict/solve]. Here's why: if the property is true, then we can..."  |
| Functional Extension | Text (1 paragraph) | What becomes possible if we have this property? What constraint does it remove? What capability does it enable? Why should student care? |
| B5 Question Seed | Preview Question | The question B5 will answer, seeded here: "If we use this property, what can we accomplish?" Curiosity hook. |
| Property-to-Problem Connection | Explicit Link | Concrete: "This property solves this kind of problem because..." Directional arrow from B2 to B5 function. |

### Distillation Artifacts
| Deliverable | Content |
|-------------|---------|
| B2 Property Card | Single page: property definition (top, all four grade versions), example annotation diagram (middle), why-it-matters (bottom). Portable reference. |
| Proof Guide Worksheet | Grade-differentiated activity sheet: Grade 3 measurement checklist | Grade 4 pattern verification | Grade 5 logical chain reasoning. Students complete the proof for their grade level. |
| Notation Reference Poster | Laminate-ready reference sheet: all notation used in B2 with definitions, examples, and student-facing language. Stays on classroom wall. |
| A2↔B2 Bridge Graphic | Visual summary of the bridge: A2's perceptual affordance image → SAME GEOMETRY → B2's mathematical property diagram. Single page, minimal text. |
| B5 Deployment Map | One-page forward reference: B2's property + how it's used in B5 + what problem B5 solves using that property. Links the agents explicitly. |

---

## QUALITY CHECKLIST
- [ ] Formal mathematical statement is precise, testable, and verifiable (not vague)
- [ ] All four grade versions (3, 4, 5) of the property are present and grade-calibrated correctly
- [ ] Grade 3 version uses only measurement and simple visual language; no formal notation
- [ ] Grade 4 version references patterns and repeated outcomes; introduces basic relationships
- [ ] Grade 5 version uses conditional logic and geometric relationships; proof-adjacent but not claiming full formal proof
- [ ] Decomposition diagrams (DGM) use EXACTLY the same geometry as A2 (no new examples, no simplifications)
- [ ] Measurement annotations on diagrams are accurate and verifiable from the original artifact
- [ ] Grade 3, 4, 5 versions of proof/demonstration are genuinely different in cognitive demand, not just word changes
- [ ] Proof/demonstration method has actually been applied to the artifact (not theoretical/hypothetical)
- [ ] A2↔B2 bridge verification shows identical geometry in both registers (side-by-side comparison is unambiguous)
- [ ] Register translation narrative explicitly states "same geometry, different cognitive tool" (not "metaphor becomes math")
- [ ] Notation guide includes student-friendly definitions and concrete examples from THIS property (not generic math notation)
- [ ] B5 deployment seed is specific enough that B5 cannot proceed without this property
- [ ] Property essence statement (1 sentence) can be understood independently and still conveys the core rule
- [ ] All distillation artifacts are tangible, usable classroom materials (not essays)
- [ ] Quality check: A student who masters all components of B2 should be able to: (1) state the property in their own words, (2) verify it through appropriate method for their grade, (3) explain why B5 will rely on it, (4) see the bridge between A2's affordance and B2's rule.
- [ ] CRITICAL: If B2 is wrong, B5 fails. Quality check: Could B5 be taught using this property? Does the property actually explain/enable B5's function?
- [ ] No component contains or claims formal proof (only "proof-adjacent" for Grade 5); matches age-appropriate rigor
