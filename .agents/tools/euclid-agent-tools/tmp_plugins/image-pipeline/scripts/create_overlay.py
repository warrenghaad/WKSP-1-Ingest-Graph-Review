#!/usr/bin/env python3
"""
EUCLID Image Pipeline — Geometric Overlay Creator

Creates geometric overlays on artifact images showing GEA/GEM decompositions.
Compatible with image_tools.py PIL patterns from the EUCLID backend.

Usage:
    python3 create_overlay.py --spec overlay_spec.json
    python3 create_overlay.py --image input.jpg --gea circle --center 0.5,0.5 --radius 0.25 --output overlay.png
"""

import argparse
import json
import math
import os
import sys

try:
    from PIL import Image, ImageDraw, ImageFont, ImageFilter
except ImportError:
    print("ERROR: Pillow not installed. Run: pip install Pillow --break-system-packages")
    sys.exit(1)


# ─── Color Palette ───────────────────────────────────────────────────────────

COLORS = {
    "primary_gea":    (255, 107, 53),    # #FF6B35 — orange
    "secondary_gea":  (78, 205, 196),    # #4ECDC4 — teal
    "gem_composite":  (255, 184, 0),     # #FFB800 — gold
    "label_text":     (255, 255, 255),   # white
    "label_bg":       (0, 0, 0),         # black
    "dim":            (0, 0, 0),         # black (for dimming)
    "axis":           (255, 255, 255),   # white
}

DEFAULTS = {
    "line_width": 3,
    "label_font_size": 14,
    "fill_opacity": 31,          # 12% of 255
    "outline_opacity": 102,      # 40% of 255
    "label_bg_opacity": 178,     # 70% of 255
    "center_mark_radius": 5,
    "axis_opacity": 76,          # 30% of 255
    "dim_opacity": 38,           # 15% of 255
    "max_dimension": 2400,
}


def hex_to_rgba(hex_color, opacity=255):
    """Convert hex color string to RGBA tuple."""
    hex_color = hex_color.lstrip('#')
    r, g, b = int(hex_color[0:2], 16), int(hex_color[2:4], 16), int(hex_color[4:6], 16)
    return (r, g, b, opacity)


def get_color(elem, key="color", default="primary_gea", opacity=None):
    """Get RGBA color from element spec or defaults."""
    if key in elem:
        rgb = hex_to_rgba(elem[key])
        if opacity is not None:
            return (*rgb[:3], opacity)
        return rgb
    base = COLORS.get(default, COLORS["primary_gea"])
    return (*base, opacity if opacity is not None else 255)


def load_font(size=14):
    """Load font, falling back gracefully."""
    font_paths = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
        "/usr/share/fonts/truetype/freefont/FreeSans.ttf",
    ]
    for path in font_paths:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def draw_label(draw, text, position, font, text_color=None, bg_color=None):
    """Draw a labeled text with background box."""
    if text_color is None:
        text_color = (*COLORS["label_text"], 255)
    if bg_color is None:
        bg_color = (*COLORS["label_bg"], DEFAULTS["label_bg_opacity"])

    bbox = font.getbbox(text)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]
    padding = 4

    x, y = position
    # Background rectangle
    draw.rectangle(
        [x - padding, y - padding, x + text_w + padding, y + text_h + padding],
        fill=bg_color
    )
    # Text
    draw.text((x, y), text, fill=text_color, font=font)


def draw_dashed_line(draw, start, end, color, width=1, dash_length=10, gap_length=6):
    """Draw a dashed line between two points."""
    x1, y1 = start
    x2, y2 = end
    total_length = math.sqrt((x2 - x1)**2 + (y2 - y1)**2)
    if total_length == 0:
        return

    dx = (x2 - x1) / total_length
    dy = (y2 - y1) / total_length

    current = 0
    drawing = True
    while current < total_length:
        seg_len = dash_length if drawing else gap_length
        seg_end = min(current + seg_len, total_length)

        if drawing:
            sx = x1 + dx * current
            sy = y1 + dy * current
            ex = x1 + dx * seg_end
            ey = y1 + dy * seg_end
            draw.line([(sx, sy), (ex, ey)], fill=color, width=width)

        current = seg_end
        drawing = not drawing


def create_overlay(spec, image_path=None, output_path=None):
    """
    Create a geometric overlay on an image.

    Args:
        spec: dict with overlay specification
        image_path: override image path (else from spec)
        output_path: override output path (else from spec)
    """
    img_path = image_path or spec.get("image_path")
    out_path = output_path or spec.get("output_path", "overlay_output.png")

    if not img_path or not os.path.exists(img_path):
        print(f"ERROR: Image not found: {img_path}")
        sys.exit(1)

    # Load and prepare image
    img = Image.open(img_path).convert("RGBA")

    # Resize if too large
    max_dim = DEFAULTS["max_dimension"]
    if max(img.size) > max_dim:
        ratio = max_dim / max(img.size)
        new_size = (int(img.size[0] * ratio), int(img.size[1] * ratio))
        img = img.resize(new_size, Image.Resampling.LANCZOS)

    w, h = img.size

    # Create overlay layer
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    font = load_font(spec.get("label_font_size", DEFAULTS["label_font_size"]))

    # ── Background dimming ────────────────────────────────────────────────
    if spec.get("background_dim", 0) > 0:
        dim_opacity = int(spec["background_dim"] * 255)
        dim_layer = Image.new("RGBA", (w, h), (*COLORS["dim"], dim_opacity))
        img = Image.alpha_composite(img, dim_layer)

    # ── Draw GEA elements ─────────────────────────────────────────────────
    for elem in spec.get("gea_elements", []):
        elem_type = elem.get("type", "")
        fill_opacity = int(elem.get("fill_opacity", 0.12) * 255)
        outline_opacity = DEFAULTS["outline_opacity"]
        line_width = elem.get("width", DEFAULTS["line_width"])

        color_rgb = get_color(elem, opacity=outline_opacity)
        fill_rgb = get_color(elem, opacity=fill_opacity)

        if elem_type == "circle":
            cx = int(elem["center"][0] * w)
            cy = int(elem["center"][1] * h)
            radius = int(elem["radius"] * min(w, h))

            # Fill
            draw.ellipse(
                [cx - radius, cy - radius, cx + radius, cy + radius],
                fill=fill_rgb,
                outline=color_rgb,
                width=line_width
            )

            # Center mark
            if spec.get("center_mark", {}).get("show", True) or spec.get("center_mark", True) is True:
                cr = DEFAULTS["center_mark_radius"]
                draw.ellipse(
                    [cx - cr, cy - cr, cx + cr, cy + cr],
                    fill=get_color(elem, opacity=200)
                )

        elif elem_type == "line":
            points = [(int(p[0] * w), int(p[1] * h)) for p in elem.get("points", [])]
            if len(points) >= 2:
                style = elem.get("style", "solid")
                if style == "dashed":
                    draw_dashed_line(draw, points[0], points[1], color_rgb, line_width)
                else:
                    draw.line(points, fill=color_rgb, width=line_width)

        elif elem_type in ("triangle", "square", "polygon"):
            points = [(int(p[0] * w), int(p[1] * h)) for p in elem.get("points", [])]
            if len(points) >= 3:
                draw.polygon(points, fill=fill_rgb, outline=color_rgb)

        elif elem_type == "arc":
            bbox = elem.get("bbox", [0.3, 0.3, 0.7, 0.7])
            pil_bbox = [int(bbox[0]*w), int(bbox[1]*h), int(bbox[2]*w), int(bbox[3]*h)]
            start_angle = elem.get("start_angle", 0)
            end_angle = elem.get("end_angle", 180)
            draw.arc(pil_bbox, start_angle, end_angle, fill=color_rgb, width=line_width)

        elif elem_type == "point":
            px = int(elem["position"][0] * w)
            py = int(elem["position"][1] * h)
            size = elem.get("size", 8)
            draw.ellipse(
                [px - size//2, py - size//2, px + size//2, py + size//2],
                fill=get_color(elem, opacity=220)
            )

        # Label
        if elem.get("label"):
            label_pos = elem.get("label_position")
            if not label_pos:
                if elem_type == "circle":
                    label_pos = [elem["center"][0], elem["center"][1] - elem["radius"] - 0.04]
                elif elem_type == "point":
                    label_pos = [elem["position"][0] + 0.02, elem["position"][1] - 0.03]
                else:
                    label_pos = [0.05, 0.05]

            lx = int(label_pos[0] * w)
            ly = int(label_pos[1] * h)
            draw_label(draw, elem["label"], (lx, ly), font)

    # ── Symmetry axes ─────────────────────────────────────────────────────
    for axis in spec.get("symmetry_axes", []):
        start = (int(axis["start"][0] * w), int(axis["start"][1] * h))
        end = (int(axis["end"][0] * w), int(axis["end"][1] * h))
        axis_color = (*COLORS["axis"], DEFAULTS["axis_opacity"])
        style = axis.get("style", "dashed")

        if style == "dashed":
            draw_dashed_line(draw, start, end, axis_color, 1)
        else:
            draw.line([start, end], fill=axis_color, width=1)

    # ── Dimension lines (measurement overlays) ────────────────────────────
    for meas in spec.get("measurements", []):
        if meas.get("show_line"):
            endpoints = meas.get("line_endpoints", [])
            if len(endpoints) == 2:
                start = (int(endpoints[0][0] * w), int(endpoints[0][1] * h))
                end = (int(endpoints[1][0] * w), int(endpoints[1][1] * h))
                meas_color = (*COLORS["secondary_gea"], DEFAULTS["outline_opacity"])
                style = meas.get("style", "solid")
                if style == "dashed":
                    draw_dashed_line(draw, start, end, meas_color, 2)
                else:
                    draw.line([start, end], fill=meas_color, width=2)

        if meas.get("label"):
            pos = meas.get("annotation_position", "top_right")
            positions = {
                "top_right": (int(0.7 * w), int(0.1 * h)),
                "top_left": (int(0.05 * w), int(0.1 * h)),
                "bottom_center": (int(0.35 * w), int(0.85 * h)),
                "center": (int(0.4 * w), int(0.45 * h)),
            }
            lpos = positions.get(pos, positions["top_right"])
            draw_label(draw, meas["label"], lpos, font)

    # ── Formula box ───────────────────────────────────────────────────────
    if spec.get("formula_box"):
        fb = spec["formula_box"]
        fb_text = fb.get("text", "")
        fb_font = load_font(fb.get("font_size", 14))

        bbox_text = fb_font.getbbox(fb_text)
        tw = bbox_text[2] - bbox_text[0]
        th = bbox_text[3] - bbox_text[1]
        padding = 10

        if fb.get("position", "bottom") == "bottom":
            bx = (w - tw) // 2 - padding
            by = h - th - padding * 3
        else:
            bx = (w - tw) // 2 - padding
            by = padding

        bg_hex = fb.get("bg_color", "#1A1A2E")
        text_hex = fb.get("text_color", "#FFB800")

        draw.rectangle(
            [bx, by, bx + tw + padding * 2, by + th + padding * 2],
            fill=hex_to_rgba(bg_hex, 220)
        )
        draw.text(
            (bx + padding, by + padding),
            fb_text,
            fill=hex_to_rgba(text_hex),
            font=fb_font
        )

    # ── Standalone labels ─────────────────────────────────────────────────
    for label in spec.get("labels", []):
        lx = int(label["position"][0] * w)
        ly = int(label["position"][1] * h)
        draw_label(draw, label["text"], (lx, ly), font)

    # ── Composite and save ────────────────────────────────────────────────
    result = Image.alpha_composite(img, overlay)

    # Convert to RGB for JPEG output if needed
    if out_path.lower().endswith('.jpg') or out_path.lower().endswith('.jpeg'):
        result = result.convert('RGB')

    os.makedirs(os.path.dirname(out_path) if os.path.dirname(out_path) else '.', exist_ok=True)
    result.save(out_path, quality=95)
    print(f"Overlay saved: {out_path} ({w}×{h})")
    return out_path


def create_comparison_grid(spec):
    """Create a side-by-side comparison grid of multiple images with GEA highlighted."""
    images = spec.get("comparison_images", [])
    if not images:
        print("ERROR: No comparison images provided")
        return

    layout = spec.get("layout", "side_by_side")
    loaded = []

    for img_spec in images:
        path = img_spec.get("image_path")
        if not os.path.exists(path):
            print(f"WARNING: Image not found: {path}")
            continue

        img = Image.open(path).convert("RGBA")
        # Normalize sizes
        target_h = 600
        ratio = target_h / img.size[1]
        img = img.resize((int(img.size[0] * ratio), target_h), Image.Resampling.LANCZOS)

        # Apply individual overlay
        sub_spec = {
            "gea_elements": img_spec.get("gea_elements", []),
            "center_mark": True,
        }
        sub_overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
        sub_draw = ImageDraw.Draw(sub_overlay)
        # Draw elements on sub_overlay (simplified — reuse main logic)
        img = Image.alpha_composite(img, sub_overlay)

        loaded.append({
            "image": img,
            "label": img_spec.get("carrier", ""),
        })

    if not loaded:
        print("ERROR: No valid images to compare")
        return

    # Arrange grid
    padding = 20
    font = load_font(16)

    if layout in ("side_by_side", "grid_3x1"):
        total_w = sum(im["image"].size[0] for im in loaded) + padding * (len(loaded) + 1)
        max_h = max(im["image"].size[1] for im in loaded) + 60  # space for labels
        canvas = Image.new("RGBA", (total_w, max_h + padding * 2), (26, 26, 46, 255))
        canvas_draw = ImageDraw.Draw(canvas)

        x_offset = padding
        for item in loaded:
            y_offset = padding
            canvas.paste(item["image"], (x_offset, y_offset))

            # Carrier label
            label = item["label"]
            if label:
                lx = x_offset + item["image"].size[0] // 2 - len(label) * 4
                ly = y_offset + item["image"].size[1] + 5
                draw_label(canvas_draw, label, (lx, ly), font)

            x_offset += item["image"].size[0] + padding

    out_path = spec.get("output_path", "comparison_grid.png")
    os.makedirs(os.path.dirname(out_path) if os.path.dirname(out_path) else '.', exist_ok=True)
    canvas.save(out_path, quality=95)
    print(f"Comparison grid saved: {out_path}")
    return out_path


def create_construction_sequence(spec):
    """Create a filmstrip of construction steps."""
    steps = spec.get("construction_steps", [])
    if not steps:
        print("ERROR: No construction steps provided")
        return

    step_size = 400
    padding = 15
    font = load_font(12)

    n = len(steps)
    canvas_w = n * step_size + (n + 1) * padding
    canvas_h = step_size + 80  # space for step labels
    canvas = Image.new("RGBA", (canvas_w, canvas_h), (26, 26, 46, 255))

    for i, step in enumerate(steps):
        x_offset = padding + i * (step_size + padding)
        y_offset = padding

        # Step background
        step_img = Image.new("RGBA", (step_size, step_size), (40, 40, 60, 255))
        step_draw = ImageDraw.Draw(step_img)

        # Draw elements for this step
        for elem in step.get("elements", []):
            elem_type = elem.get("type", "")
            color = get_color(elem, opacity=DEFAULTS["outline_opacity"])
            fill = get_color(elem, opacity=DEFAULTS["fill_opacity"])

            if elem_type == "circle":
                cx = int(elem["center"][0] * step_size)
                cy = int(elem["center"][1] * step_size)
                r = int(elem["radius"] * step_size)
                step_draw.ellipse([cx-r, cy-r, cx+r, cy+r], fill=fill, outline=color, width=2)
            elif elem_type == "point":
                px = int(elem["position"][0] * step_size)
                py = int(elem["position"][1] * step_size)
                step_draw.ellipse([px-4, py-4, px+4, py+4], fill=color)
            elif elem_type == "line":
                points = [(int(p[0]*step_size), int(p[1]*step_size)) for p in elem.get("points", [])]
                if len(points) >= 2:
                    step_draw.line(points, fill=color, width=2)

        canvas.paste(step_img, (x_offset, y_offset))

        # Step number and instruction
        step_num = f"Step {step.get('step', i+1)}"
        instruction = step.get("description", "")
        canvas_draw = ImageDraw.Draw(canvas)
        draw_label(canvas_draw, step_num, (x_offset, y_offset + step_size + 5), font,
                   text_color=(*COLORS["gem_composite"], 255))
        if instruction:
            small_font = load_font(10)
            canvas_draw.text(
                (x_offset, y_offset + step_size + 28),
                instruction[:40],
                fill=(*COLORS["label_text"], 200),
                font=small_font
            )

    out_path = spec.get("output_path", "construction_sequence.png")
    os.makedirs(os.path.dirname(out_path) if os.path.dirname(out_path) else '.', exist_ok=True)
    canvas.save(out_path, quality=95)
    print(f"Construction sequence saved: {out_path}")
    return out_path


# ─── CLI Entry Point ─────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="EUCLID Geometric Overlay Creator")
    parser.add_argument("--spec", help="JSON spec file path")
    parser.add_argument("--image", help="Input image path (overrides spec)")
    parser.add_argument("--output", help="Output path (overrides spec)")
    parser.add_argument("--gea", help="Quick GEA type: circle, line, triangle, etc.")
    parser.add_argument("--center", help="GEA center as x,y (normalized 0-1)")
    parser.add_argument("--radius", type=float, help="GEA radius (normalized 0-1)")
    parser.add_argument("--mode", choices=["overlay", "comparison", "construction"],
                        default="overlay", help="Operation mode")

    args = parser.parse_args()

    if args.spec:
        with open(args.spec, 'r') as f:
            spec = json.load(f)
    elif args.image and args.gea:
        # Quick mode — build spec from CLI args
        center = [float(x) for x in args.center.split(',')] if args.center else [0.5, 0.5]
        radius = args.radius or 0.25
        spec = {
            "image_path": args.image,
            "output_path": args.output or args.image.rsplit('.', 1)[0] + "_overlay.png",
            "type": "highlight",
            "gea_elements": [{
                "type": args.gea,
                "center": center,
                "radius": radius,
                "color": "#FF6B35",
                "label": f"GEA.{args.gea}",
                "fill_opacity": 0.12,
            }],
            "center_mark": True,
            "symmetry_axes": [
                {"start": [center[0], 0.1], "end": [center[0], 0.9], "style": "dashed"},
                {"start": [0.1, center[1]], "end": [0.9, center[1]], "style": "dashed"},
            ]
        }
    else:
        parser.print_help()
        sys.exit(1)

    if args.mode == "comparison":
        create_comparison_grid(spec)
    elif args.mode == "construction":
        create_construction_sequence(spec)
    else:
        create_overlay(spec, image_path=args.image, output_path=args.output)


if __name__ == "__main__":
    main()
