# Geometric Overlay Specifications

## Overlay Types

Six overlay types map to specific lesson sections:

### 1. `highlight` — Section A2 (Visual Rhetoric)
**Purpose:** Draw student attention to the primary GEA within an artifact image.
```yaml
spec:
  type: highlight
  elements:
    - gea: "GEA.circle"
      style: outline          # outline only, no fill
      color: "#FF6B35"        # EUCLID orange
      width: 4px
      label: true             # show "CIRCLE" label
      pulse: false            # static for print, pulse for digital
  background_dim: 0.15        # dim rest of image 15%
  annotation:
    text: "What shape do you see?"
    position: bottom_center
```

### 2. `comparison` — Section A3 (Carrier Diversity)
**Purpose:** Show same GEA across different carrier types side by side.
```yaml
spec:
  type: comparison
  layout: grid_2x2 | grid_3x1 | side_by_side
  elements:
    - image: "seal_image.jpg"
      gea: "GEA.circle"
      carrier: "cylinder seal"
      outline_color: "#FF6B35"
    - image: "pottery_image.jpg"
      gea: "GEA.circle"
      carrier: "ceramic vessel"
      outline_color: "#FF6B35"
    - image: "tablet_image.jpg"
      gea: "GEA.circle"
      carrier: "clay tablet"
      outline_color: "#FF6B35"
  connector_lines: true       # draw lines connecting same GEA across images
  shared_label: "Same circle — different carriers"
```

### 3. `decomposition` — Section A5 (Primary Artifact) & B6 (STEM Decomposition)
**Purpose:** Full GEA/GEM breakdown with labeled components.
```yaml
spec:
  type: decomposition
  elements:
    - gea: "GEA.circle"
      center: [0.5, 0.48]     # normalized coordinates
      radius: 0.22
      color: "#FF6B35"
      label: "GEA.circle — sun disk"
      fill_opacity: 0.12
    - gea: "GEA.line"
      points: [[0.5, 0.26], [0.5, 0.70]]
      color: "#4ECDC4"         # teal for secondary elements
      label: "GEA.line — vertical axis"
      style: dashed
    - gem: "GEM.rosette"
      bounding_box: [0.3, 0.28, 0.7, 0.68]
      color: "#FFB800"         # gold for GEM compositions
      label: "GEM.rosette(GEA.circle, GEA.line×4)"
      fill_opacity: 0.08
  symmetry_axes:
    - axis: vertical
      style: dashed
      color: "#FFFFFF"
      opacity: 0.3
    - axis: horizontal
      style: dashed
      color: "#FFFFFF"
      opacity: 0.3
  center_mark:
    show: true
    size: 6px
    color: "#FF6B35"
  layer_labels:
    show: true                 # Label Layer 1a (Observable) vs 1b (Construction)
    layer_1a: "What you SEE"
    layer_1b: "How it's BUILT"
```

### 4. `measurement` — Section B2 (GEK Property)
**Purpose:** Show mathematical properties — dimensions, angles, ratios.
```yaml
spec:
  type: measurement
  elements:
    - gea: "GEA.circle"
      center: [0.5, 0.5]
      radius: 0.3
      color: "#FF6B35"
      measurements:
        - type: radius
          label: "r"
          show_line: true
          line_endpoints: [[0.5, 0.5], [0.8, 0.5]]
        - type: diameter
          label: "d = 2r"
          show_line: true
          line_endpoints: [[0.2, 0.5], [0.8, 0.5]]
          style: dashed
        - type: circumference
          label: "C = πd ≈ 3d"
          show_arc: true
          annotation_position: top_right
        - type: area
          label: "A = πr²"
          show_fill: true
          fill_opacity: 0.1
          annotation_position: bottom_center
  dimension_lines:
    color: "#4ECDC4"
    width: 2px
    arrow_size: 8px
    label_font_size: 16
    label_color: "#FFFFFF"
    label_bg: "#000000CC"
  grid:
    show: false                # optional background grid
    spacing: 0.1
    color: "#FFFFFF20"
```

### 5. `functional` — Section B5 (Invention)
**Purpose:** Show how GEA/GEM enables mechanical function in an invention.
```yaml
spec:
  type: functional
  invention: "potter's wheel"
  elements:
    - gea: "GEA.circle"
      role: "rotating platform"
      color: "#FF6B35"
      annotation: "GEA.circle → rotation → uniform vessel"
    - gea: "GEA.line"
      role: "axle"
      color: "#4ECDC4"
      annotation: "GEA.line → axis of rotation"
  arrows:
    - from: [0.5, 0.3]
      to: [0.7, 0.3]
      label: "rotation"
      style: curved
      color: "#FFB800"
  formula_box:
    text: "GEK(circle) × GEK-T(rotation) × GEA.circle = potter's wheel"
    position: bottom
    bg_color: "#1A1A2E"
    text_color: "#FFB800"
    font_size: 14
  cross_section:
    show: true                 # show cross-section view alongside
    position: right_panel
```

### 6. `construction_sequence` — Section A6 (Student Activity) & B6
**Purpose:** Step-by-step construction showing how to build the geometric form.
```yaml
spec:
  type: construction_sequence
  total_steps: 5
  steps:
    - step: 1
      instruction: "Establish center point"
      elements:
        - type: point
          position: [0.5, 0.5]
          color: "#FF6B35"
          size: 8px
      highlight_new: true      # flash/highlight what's new this step
    - step: 2
      instruction: "Draw circle from center"
      elements:
        - type: point
          position: [0.5, 0.5]
          color: "#FF6B35"
          size: 6px
        - type: circle
          center: [0.5, 0.5]
          radius: 0.25
          color: "#FF6B35"
          style: solid
      highlight_new: true
    - step: 3
      instruction: "Add vertical axis"
      elements:
        - type: circle
          center: [0.5, 0.5]
          radius: 0.25
          color: "#FF6B3580"   # previous elements dimmed
        - type: line
          points: [[0.5, 0.25], [0.5, 0.75]]
          color: "#4ECDC4"
          width: 3px
      highlight_new: true
  layout: filmstrip | grid | animated_gif
  filmstrip_direction: horizontal
  step_label_position: below
```

---

## Color Palette

| Role | Hex | Usage |
|------|-----|-------|
| Primary GEA | `#FF6B35` | Orange — main geometric element outlines |
| Secondary GEA | `#4ECDC4` | Teal — supporting elements, axes, lines |
| GEM Composition | `#FFB800` | Gold — composite structures |
| Measurement | `#4ECDC4` | Teal — dimension lines, labels |
| Background Dim | `#000000` at 15% | Darken non-highlighted areas |
| Labels BG | `#000000` at 70% | Label background for readability |
| Labels Text | `#FFFFFF` | White label text |
| Construction New | `#FF6B35` full | Current step highlight |
| Construction Old | `#FF6B3580` | Previous step (dimmed) |

## PIL Implementation Constants

```python
OVERLAY_DEFAULTS = {
    "line_width": 3,
    "label_font_size": 14,
    "fill_opacity_pct": 12,       # 12% = 0.12 × 255 ≈ 31
    "outline_opacity_pct": 40,    # 40% = 0.40 × 255 ≈ 102
    "label_bg_opacity_pct": 70,
    "center_mark_radius": 4,
    "arrow_head_size": 8,
    "dim_opacity_pct": 15,
    "dpi": 150,                   # output resolution
    "output_format": "PNG",
    "max_dimension": 2400,        # resize if larger
}
```
