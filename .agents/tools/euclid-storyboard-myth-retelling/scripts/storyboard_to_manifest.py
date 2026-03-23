#!/usr/bin/env python3
"""
storyboard_to_manifest.py — Bridge: Storyboard V2 → Image Pipeline Manifest

Converts storyboard panel output into IMAGE_NEED blocks that the
euclid-image-pipeline can consume directly.

The storyboard thinks in panels → reuse tags (panel-centric).
The image pipeline thinks in sections → image needs (section-centric).
This script inverts the mapping.

Usage:
  python3 storyboard_to_manifest.py <storyboard_dir> --out <manifest_dir>
  python3 storyboard_to_manifest.py <single_storyboard.json> --out <manifest_dir>
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Dict, List, Any


# ═══════════════════════════════════════════════
# SECTION → IMAGE TYPE MAPPING
# (from image-pipeline/commands/image-manifest.md)
# ═══════════════════════════════════════════════

SECTION_IMAGE_TYPES = {
    "A1_myth": {"section": "A1", "type": "deity_scene", "overlay": None},
    "A3_iconography": {"section": "A3", "type": "artifact_with_overlay", "overlay": "comparison"},
    "A4_material_culture": {"section": "A4", "type": "power_context", "overlay": None},
    "A5_deep_dive": {"section": "A5", "type": "artifact_with_decomposition", "overlay": "decomposition"},
    "B3_science": {"section": "B3", "type": "element_property_demo", "overlay": "measurement"},
    "B4_history": {"section": "B4", "type": "invention_scene", "overlay": None},
    "B5_evolution": {"section": "B5", "type": "technical_diagram", "overlay": "functional"},
    "B6_invention": {"section": "B6", "type": "construction_sequence", "overlay": "construction_sequence"},
    "BACKGROUND": {"section": "multi", "type": "environment", "overlay": None},
    "CHARACTER": {"section": "multi", "type": "character_asset", "overlay": None},
    "ELEMENT_SOLO": {"section": "multi", "type": "isolated_element", "overlay": "highlight"},
}

# Asset layer → image pipeline stage mapping
ASSET_TO_STAGE = {
    "background": "search",       # Museum photos of sites/environments
    "character": "recreate",      # Deity depictions via AI generation
    "element": "recreate",        # Isolated geometric element renders
    "fx": "recreate",             # Effects layers are always generated
}


def load_storyboard(path: Path) -> dict:
    """Load a single storyboard V2 JSON."""
    return json.loads(path.read_text(encoding="utf-8"))


def load_storyboards(source: Path) -> List[dict]:
    """Load storyboards from a file or directory."""
    if source.is_file():
        return [load_storyboard(source)]
    elif source.is_dir():
        sbs = []
        for f in sorted(source.glob("*.storyboard_v2.json")):
            sbs.append(load_storyboard(f))
        return sbs
    return []


def panel_to_image_needs(panel: dict, storyboard_meta: dict) -> List[dict]:
    """Convert one panel's reuse tags + assets into IMAGE_NEED blocks."""
    needs = []

    for tag in panel.get("reuse_tags", []):
        section_info = SECTION_IMAGE_TYPES.get(tag)
        if not section_info:
            continue

        need = {
            "source": "storyboard",
            "source_panel_id": panel["panel_id"],
            "source_myth": storyboard_meta.get("deity", ""),
            "source_week": storyboard_meta.get("lesson_code", ""),

            "section": section_info["section"],
            "type": section_info["type"],
            "overlay_type": section_info["overlay"],
            "description": panel.get("visual_concept", ""),
            "beat_name": panel.get("beat_name", ""),
            "duration_sec": panel.get("duration_sec", 6),

            "gea_target": storyboard_meta.get("geometric_element", ""),
            "deity": storyboard_meta.get("deity", ""),

            "priority": _priority_from_tag(tag),

            "grade_versions": [3, 4, 5],
            "grade_variants": panel.get("grade_variants", {}),
        }

        # Add extractable asset info
        assets = panel.get("extractable_assets", {})
        if assets:
            need["extractable_layers"] = assets
            need["pipeline_stages"] = list(set(
                ASSET_TO_STAGE.get(layer, "search")
                for layer in assets.keys()
            ))

        needs.append(need)

    return needs


def _priority_from_tag(tag: str) -> str:
    """Assign priority based on section importance."""
    critical = {"A1_myth", "ELEMENT_SOLO", "CHARACTER"}
    important = {"A3_iconography", "A5_deep_dive", "B3_science"}
    if tag in critical:
        return "critical"
    elif tag in important:
        return "important"
    return "standard"


def storyboard_to_manifest(sb: dict) -> dict:
    """Convert a full storyboard into an image pipeline manifest."""
    all_needs: List[dict] = []
    meta = {
        "deity": sb.get("deity", ""),
        "lesson_code": sb.get("lesson_code", ""),
        "geometric_element": sb.get("geometric_element", ""),
    }

    for act in sb.get("acts", []):
        for panel in act.get("panels", []):
            needs = panel_to_image_needs(panel, meta)
            all_needs.extend(needs)

    # De-duplicate by (section, description) — same image need from multiple panels
    seen = set()
    unique_needs = []
    for need in all_needs:
        key = (need["section"], need["description"][:80])
        if key not in seen:
            seen.add(key)
            unique_needs.append(need)
        else:
            # Merge: find existing and add source panel
            for existing in unique_needs:
                if (existing["section"], existing["description"][:80]) == key:
                    if "additional_source_panels" not in existing:
                        existing["additional_source_panels"] = []
                    existing["additional_source_panels"].append(need["source_panel_id"])
                    break

    # Build section coverage map
    coverage = {}
    for need in unique_needs:
        sec = need["section"]
        if sec != "multi":
            coverage.setdefault(sec, []).append(need["source_panel_id"])

    return {
        "source": "storyboard_v2",
        "lesson_code": sb.get("lesson_code", ""),
        "myth_title": sb.get("myth_title", ""),
        "deity": sb.get("deity", ""),
        "geometric_element": sb.get("geometric_element", ""),
        "total_panels": sb.get("total_panels", 0),
        "total_image_needs": len(unique_needs),
        "priority_breakdown": {
            "critical": sum(1 for n in unique_needs if n["priority"] == "critical"),
            "important": sum(1 for n in unique_needs if n["priority"] == "important"),
            "standard": sum(1 for n in unique_needs if n["priority"] == "standard"),
        },
        "section_coverage": coverage,
        "image_needs": unique_needs,
    }


def build_batch_manifest(storyboards: List[dict]) -> dict:
    """Build a combined manifest from all storyboards."""
    manifests = [storyboard_to_manifest(sb) for sb in storyboards]

    all_needs = []
    for m in manifests:
        all_needs.extend(m["image_needs"])

    # Cross-myth section coverage
    section_coverage: Dict[str, List[str]] = {}
    for m in manifests:
        for sec, pids in m["section_coverage"].items():
            section_coverage.setdefault(sec, []).extend(pids)

    return {
        "source": "storyboard_v2_batch",
        "total_myths": len(manifests),
        "total_panels": sum(m["total_panels"] for m in manifests),
        "total_image_needs": len(all_needs),
        "per_myth": [
            {
                "lesson_code": m["lesson_code"],
                "myth_title": m["myth_title"],
                "total_panels": m["total_panels"],
                "total_image_needs": m["total_image_needs"],
                "priority_breakdown": m["priority_breakdown"],
            }
            for m in manifests
        ],
        "section_coverage": section_coverage,
        "image_needs": all_needs,
    }


def main() -> int:
    ap = argparse.ArgumentParser(
        description="Convert storyboard V2 output to image pipeline manifest format",
    )
    ap.add_argument("source", help="Storyboard JSON file or directory of storyboard JSONs")
    ap.add_argument("--out", default="manifests_out", help="Output directory for manifests")
    args = ap.parse_args()

    source = Path(args.source)
    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)

    storyboards = load_storyboards(source)
    if not storyboards:
        print(f"[ERROR] No storyboard V2 JSONs found at: {source}")
        return 1

    # Per-myth manifests
    for sb in storyboards:
        manifest = storyboard_to_manifest(sb)
        slug = manifest["lesson_code"].replace("-", "_").lower()
        out_path = out_dir / f"{slug}_image_manifest.json"
        out_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False))
        print(f"  [{manifest['lesson_code']}] {manifest['total_image_needs']} image needs "
              f"({manifest['priority_breakdown']['critical']} critical)")

    # Batch manifest
    if len(storyboards) > 1:
        batch = build_batch_manifest(storyboards)
        batch_path = out_dir / "batch_image_manifest.json"
        batch_path.write_text(json.dumps(batch, indent=2, ensure_ascii=False))
        print(f"\n  [BATCH] {batch['total_image_needs']} total image needs across {batch['total_myths']} myths")

    print(f"\nDone. Manifests written to: {out_dir.resolve()}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
