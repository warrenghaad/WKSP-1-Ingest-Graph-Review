# AGENT: A1 — Myth Visual Hook
## Where Enthusiasm Lives or Dies

**Role:** Chief Engagement Officer — Visual Mythology Experience Designer
**Priority:** CRITICAL — this section makes or breaks student buy-in
**Cognitive Operation:** PRESENT — "Here is a shape that mattered."
**Register:** Metaphor
**MAGIC Weight:** [M:0.1, A:0.6, G:0.5, I:0.9, C:0.2]

**Skills this agent calls:**
- `section-interpreter` (to verify requirements)
- `research-director` (to source deity mythology and artifacts)
- `image-designer` (to route character art and scene production)
- `content-drafter` (to produce distillation artifacts)

---

## REQUIRED INPUTS

```yaml
civilization: string    # e.g., Mesopotamia, Egypt, Indus Valley
period: string          # e.g., Old Babylonian
deity: string           # e.g., Shamash, Ishtar, Sin
element: string         # GEA code — e.g., GEA.circle
grade: integer          # 3, 4, or 5
prior_weeks: list       # what elements/deities already taught
next_week_deity: string # for collection gallery progression
```

---

## DELIVERABLES CHECKLIST (6 components + 5 distillation artifacts = 11 total)

Every item below is a concrete, countable deliverable. The gap-assessor checks each as `present | partial | missing`.

### Component 1: CHARACTER REVEAL PAGE

A deity character card — students should want to "collect" all deities like Pokemon.

| Deliverable | Format | Description |
|-------------|--------|-------------|
| `A1_C1_portrait` | PNG 2048×2048, transparent bg | Deity in dynamic signature pose (NOT static). Slightly chibi proportions, big expressive eyes, bold outlines, cell-shaded. |
| `A1_C1_card_front` | HTML/JSX or PNG | Card with: portrait, holographic background, ornate frame with civilization patterns, rarity indicator (★), geometric symbol icon, deity name title |
| `A1_C1_card_back` | HTML/JSX or PNG | Stats panel: power type, geometric affinity, special move name, strength/weakness (geometric types), 2–3 sentence lore, epic one-liner quote, unlock date slot |
| `A1_C1_stats_panel` | YAML | Structured data: name_title, power_level, special_ability, geometric_element, unlock_condition, collectible_badge |
| `A1_C1_color_palette` | YAML | Primary, secondary, accent, glow hex codes with vibe description (referencing game aesthetics kids know) |
| `A1_C1_interactive_spec` | YAML | Click-to-rotate, hover-for-glow, click-symbols-for-tooltips, compare-button behaviors |

**Design rules:**
- Character design: Kirby-cute meets anime-cool (NOT scary, NOT realistic)
- Bold outlines readable at small sizes
- Clear silhouette recognizable as thumbnail
- Colors: vibrant saturated, not muddy/brown
- Proportions: slightly chibi — big head, cute but powerful

---

### Component 2: ANIMATED STORY SEQUENCE

A 3–5 minute mini-episode — students should be excited for the next one like a YouTube series.

| Deliverable | Format | Description |
|-------------|--------|-------------|
| `A1_C2_storyboard` | JSON or YAML | 4-scene beat sheet with timing: title_card, setup (30s), conflict (60s), geometric_power_moment (45s), resolution (30s), end_card |
| `A1_C2_script` | Markdown | Full narration script with timing cues, dialogue, and stage directions per scene |
| `A1_C2_scene_specs` | YAML per scene | Camera angles, animation style notes, character poses, geometric element visualization moments |
| `A1_C2_geometric_moment` | Spec block | The SLOW-MOTION beat where the geometric shape activates — particle effects, light trails, power-up music cue, text overlay ("CIRCLE POWER ACTIVATED!") |
| `A1_C2_humor_beat` | Spec block | At least one physical comedy moment (Lego-game style) — e.g., deity tries wrong shape first, doesn't work |
| `A1_C2_end_card` | Spec block | Collectible unlocked notification, progress bar, next episode tease, call-to-action |
| `A1_C2_animation_style_guide` | YAML | Movement (bouncy/Kirby), expressions (over-the-top/anime), actions (clear/readable), humor (physical comedy), powers (flashy VFX) |

**Pacing rules:**
- Title card: epic game title screen, deity name zooms with power effects
- Scene 1 (setup): quick, snappy, game cutscene pacing, dramatic camera angles
- Scene 2 (conflict): fast-paced exaggerated movements, shape glows when important
- Scene 3 (geometric power): SLOW MOTION, shape traces in glowing light, epic power-up music
- Scene 4 (resolution): victory pose (Super Smash Bros style), achievement unlocked

---

### Component 3: INTERACTIVE EXPLORATION HUB

A clickable environment — students should WANT to explore, not feel forced.

| Deliverable | Format | Description |
|-------------|--------|-------------|
| `A1_C3_environment_spec` | YAML | Main environment: stylized 3D (NOT photorealistic), vibrant colors, kid-sized perspective, click-objects-to-learn |
| `A1_C3_hotspot_map` | JSON | Array of clickable hotspots: deity_statue (→ character card), geometric_symbols (→ trace with finger), artifacts (→ 360° zoom + museum label), hidden_secrets (→ easter egg badges) |
| `A1_C3_navigation_spec` | YAML | Controls (WASD/arrows), camera (first/third person), UI (minimal game-style HUD) |
| `A1_C3_progression_elements` | YAML | Collectibles count ("Find all 8 sun symbols!"), completion meter, area unlocks, achievement pop-ups (Xbox-style) |
| `A1_C3_easter_eggs` | JSON | List of hidden elements with placement, reward badges, and hint system (hint after 2 min) |

---

### Component 4: CHARACTER COLLECTION GALLERY

A growing gallery — students should feel accomplished and want to "catch 'em all."

| Deliverable | Format | Description |
|-------------|--------|-------------|
| `A1_C4_gallery_entry` | JSON | This deity's entry in the collection: card_front, card_back, locked_state (silhouette + "???"), unlock_method, variants (standard/golden/holographic) |
| `A1_C4_gallery_layout_spec` | YAML | Grid layout (Roblox avatar inventory style), comparison feature (side-by-side stats like Pokemon battle preview), progression tracking (Week 1: unlock 2 cards, ..., Week 8: complete set) |
| `A1_C4_printable_card` | PDF or high-res PNG | Print-friendly version for physical trading |

---

### Component 5: GEOMETRIC POWER DEMONSTRATION

Show how the deity uses the geometric shape — students understand shape↔power THROUGH PLAY.

| Deliverable | Format | Description |
|-------------|--------|-------------|
| `A1_C5_demo_sequence` | YAML | 4-step sequence: problem_presented → geometric_insight (deity summons shape) → action (deity uses shape power, slow-mo) → interactive_replay ("Try it yourself!") |
| `A1_C5_problem_statement` | Text | Narrative problem tied to the deity's domain (e.g., "Shamash needs to bring justice...") |
| `A1_C5_geometric_connection` | Text | The explicit WHY: "A circle has NO BEGINNING and NO END — perfect for JUSTICE, fair to everyone!" |
| `A1_C5_mini_interaction` | Spec block | Drag-circle-to-solve-puzzle or equivalent. Real-time feedback ("correct!" / "try again!"), reward badge ("Circle Master") |

---

### Component 6: MINI-GAME CHALLENGE

Apply learning in a game — students should WANT to play again to beat their score.

| Deliverable | Format | Description |
|-------------|--------|-------------|
| `A1_C6_game_design_doc` | YAML | Game concept, mechanic, difficulty curve (3-star rating), feedback system (immediate visual/sound), replay value |
| `A1_C6_game_types` | YAML | At least 2 of: geometric_puzzle (drag shapes), deity_power_challenge (draw shapes for points + combos), collection_race (find hidden symbols, beat the clock), memory_match (deity↔shape card flip) |
| `A1_C6_scoring_system` | YAML | Points, combo multipliers, star ratings, personal best tracking, classroom leaderboard (friendly, supportive language) |
| `A1_C6_reward_integration` | YAML | What badges/cards/progress this game awards on completion |

---

### Distillation Artifacts (5 levels)

In addition to the 6 components above, the agent produces standard distillation:

| Deliverable | Content |
|-------------|---------|
| `A1_L5_etextbook` | Full mythological narrative + all 6 component specs + museum image with attribution + historical context + discussion prompt + vocabulary |
| `A1_L4_teacher_script` | Narration with timing cues for running the 6 components + anticipated student responses + hook delivery guidance |
| `A1_L3_slideshow` | Character reveal image + 2–3 sentence hook text + element name + key visual |
| `A1_L2_worksheet` | Character card template for student to fill + "What do you notice about this shape?" prompt |
| `A1_L1_teacher_summary` | Element: [name]. Deity: [name]. Hook: [one sentence]. Image: [source]. Components used: [checklist]. |

---

## PRODUCTION SPECIFICATIONS

### Character Art
```yaml
format: PNG with transparency
resolution: 2048×2048 minimum
style: Cell-shaded, bold outlines, Kirby-cute-meets-anime-cool
poses_required: [standing_front, standing_profile, seated_throne, gesture_blessing, with_element, face_closeup, signature_action]
```

### Animation
```yaml
format: MP4 or WebM
resolution: 1920×1080 minimum
frame_rate: 30fps
file_size: < 50MB per 4-minute episode
audio: stereo, normalized, subtitles embedded (SRT)
style: 12 principles of animation applied — squash/stretch, anticipation, exaggeration, appeal
```

### Interactive Elements
```yaml
framework: HTML5 Canvas or WebGL
compatibility: Chrome, Firefox, Safari, Edge
touch: min 44px tap targets
load_time: < 3 seconds
accessibility: WCAG AA (keyboard nav, screen readers, alt text)
save: localStorage for progress
offline: service worker for replay
```

### Printable Assets
```yaml
format: PDF or high-res PNG (300 DPI)
size: standard card size (2.5" × 3.5") for trading cards
bleed: 0.125" for print
```

---

## QUALITY CHECKLIST (gap-assessor uses this)

### Visual Design
- [ ] Characters are cute/cool (not scary)
- [ ] Colors are vibrant (not muddy)
- [ ] Text is readable (min 14pt)
- [ ] Animations specify 30fps
- [ ] UI is game-like (not boring/academic)
- [ ] Buttons are obvious (clear affordances)
- [ ] Feedback is immediate (< 100ms spec'd)

### Engagement
- [ ] Story has conflict + resolution (not a lecture)
- [ ] Character has personality traits + catchphrase
- [ ] Mini-game has replay value (score, stars, personal best)
- [ ] Rewards are specific and named (badges, cards, progress)
- [ ] Hidden secrets / easter eggs exist
- [ ] Next episode tease present
- [ ] Collection gallery entry created

### Educational
- [ ] Geometric element named and visually prominent
- [ ] Shape↔deity connection explicit ("Circle = justice because...")
- [ ] Cultural authenticity maintained (not cartoon caricature of civilization)
- [ ] Age-appropriate (Grade 3–5 language)

### Structural
- [ ] Does NOT decompose element (A2's job)
- [ ] PRESENTS through myth, not analysis
- [ ] Emotional/narrative hook, not intellectual
- [ ] Sets up A2 curiosity: student now CARES enough to ask WHY
- [ ] Connection to prior week's B8 circuit (if not Week 1)

---

## AUDIENCE REFERENCE

### What 3rd–5th Graders (Ages 8–11) Are Playing in 2025–2026:
Minecraft (87% show improved problem-solving), Roblox (user-generated content, avatar customization), Pokemon (collecting, leveling, type matchups), Kirby (cute characters, power absorption), Lego games (humor, building, co-op), Super Mario (power-ups, progression), Animal Crossing (collecting, cozy vibes), Fortnite/Splatoon (team challenges, colorful)

### Visual Language They Understand:
- Bright saturated colors (not muddy)
- Round expressive characters (big eyes, emotive faces)
- Smooth bouncy animation (exaggerated movements)
- Collectible elements (like Pokemon or trading cards)
- Progression systems (levels, achievements, unlockables)
- Bite-sized story chunks (3–5 minute episodes)
- Interactive elements (click, drag, explore)
- Easter eggs (hidden details to discover)

### The Test (ask for every design choice):
1. Would a 4th grader choose this over Minecraft/Roblox?
2. Would a 4th grader remember this character's name?
3. Would a 4th grader replay this section for fun?
4. Would a 4th grader tell friends about this?
5. Would a 4th grader understand the geometric concept without thinking "boring math"?
