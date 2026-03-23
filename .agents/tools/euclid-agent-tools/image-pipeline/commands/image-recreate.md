---
description: "Generate AI recreation prompts for missing or low-quality artifact images"
allowed-tools: Read, Write, Bash, Glob, Grep, WebSearch
---

# /image-recreate — AI Image Recreation

Generate detailed prompts for AI image recreation of artifacts, deities, inventions, and historical scenes. Outputs ready-to-use prompts for Gemini, DALL-E, or other image generation APIs.

## Usage

```
/image-recreate <type> <subject> [--deity <name>] [--artifact <description>] [--period <period>] [--style <style>]
```

**Types:** `artifact`, `deity`, `invention`, `scene`, `diagram`

## Instructions

1. **Load references:**
   - Read `@${CLAUDE_PLUGIN_ROOT}/skills/image-pipeline/references/deity-visual-canon.md`
   - Read `@${CLAUDE_PLUGIN_ROOT}/skills/image-pipeline/references/quality-rubric.md`

2. **For each type, build the prompt:**

### Type: `deity`
- Look up the deity in deity-visual-canon.md
- Use the EXACT `recreation_prompt` from the canon — do NOT improvise
- Append grade-level modifier:
  - Grade 3: "Simple composition, single figure, clear background"
  - Grade 4: "Moderate complexity, include one attendant/mount, partial background"
  - Grade 5: "Full complexity, attendants, architectural background, period-accurate detail"

### Type: `artifact`
- Build prompt from artifact description in research findings:
  ```
  Ultra-realistic museum photograph of [ARTIFACT_DESCRIPTION].
  Material: [MATERIAL]. Dimensions: [DIMENSIONS].
  Dating to [DATE], [CIVILIZATION] [PERIOD].
  The [GEA] is clearly visible as [SPECIFIC_VISUAL].
  Museum lighting, neutral background, high-resolution detail.
  Style: Archaeological catalog photography, Metropolitan Museum standard.
  ```
- Include specific details about the geometric element's appearance
- Mention the carrier type (seal, tablet, stele, vessel, etc.)

### Type: `invention`
- Build technical illustration prompt:
  ```
  Technical cross-section illustration of a [INVENTION_NAME].
  [CIVILIZATION] [PERIOD], circa [DATE].
  The [GEA] functions as [MECHANICAL_ROLE]: [DESCRIPTION].
  Show: labeled components, directional arrows for movement,
  the geometric principle highlighted in orange (#FF6B35).
  Style: Technical illustration, neutral background, clear labels,
  similar to Smithsonian technical drawings.
  ```

### Type: `scene`
- Build historical reconstruction:
  ```
  Historical reconstruction: [SCENE_DESCRIPTION].
  [CIVILIZATION] [PERIOD], circa [DATE].
  Setting: [LOCATION — temple, workshop, palace, etc.].
  [FIGURES AND ACTIONS].
  The [GEA/ARTIFACT] is prominently visible in [POSITION].
  Style: Museum diorama photography, warm natural lighting,
  period-accurate materials and clothing.
  ```

### Type: `diagram`
- Build geometric/mathematical diagram:
  ```
  Clean geometric diagram on cream-colored parchment background.
  Show: [GEOMETRIC CONSTRUCTION].
  Label: [MEASUREMENTS AND PROPERTIES].
  Use: orange (#FF6B35) for primary lines, teal (#4ECDC4) for construction lines.
  Style: Technical drawing, no perspective, orthographic view.
  ```

3. **Output RECREATION_PROMPT block:**

```yaml
RECREATION_PROMPT:
  id: "{finding_id}_recreation_{seq}"
  type: artifact | deity | invention | scene | diagram
  subject: string

  prompt:
    primary: "Full prompt text here"
    negative: "Avoid: modern elements, anachronisms, cartoon style, flat design"
    style_reference: "Metropolitan Museum catalog photography"

  parameters:
    aspect_ratio: "4:3" | "16:9" | "1:1" | "3:4"
    resolution: "1024x1024" | "1536x1024" | "1024x1536"
    style_strength: 0.7

  target_api: "gemini" | "dall-e" | "midjourney"

  consistency_check:
    deity_canon_match: true | false | n/a
    period_accurate: true | false
    gea_prominent: true | false

  lesson_routing:
    target_sections: [list]
    role: deity | reconstruction | artifact | invention | diagram
    grade_versions: [3, 4, 5]
```

4. **Character consistency enforcement:**
   - If generating a deity that appears in multiple lessons, ALWAYS check deity-visual-canon.md
   - The headdress, symbols, and attributes MUST match across all images
   - Only the pose, background, and complexity level may change between grades

## Batch Mode

```
/image-recreate --batch <assessment_manifest>
```
- Read the assessment manifest (output from /image-assess)
- For every image with action = RECREATE, generate a recreation prompt
- Output all prompts as a single batch file ready for API submission
