#!/usr/bin/env python3
"""
STORYBOARDER_V2.py — Three-Act Hierarchical Storyboard Engine

Project Euclid — Mesopotamia Pilot

Upgrade from flat-beat STORYBOARDER.py to hierarchical 3-Act architecture:
  - Act → Panel nesting (variable panels per act)
  - Reuse tags per panel (A1_myth, A3_iconography, B3_science, etc.)
  - Extractable asset layers per panel (background, character, element, fx)
  - Grade-variant narration per panel (G3, G4, G5)
  - Two input modes:
      1) Parse from myth script text (HTML/MD) — upgraded V1 approach
      2) Load from THREE_ACT_STORYBOARDING_PROCESS.md structured tables

Outputs:
  - <out>/<stem>.storyboard_v2.json   (hierarchical JSON)
  - <out>/<stem>.storyboard_v2.csv    (flat CSV with act metadata)
  - <out>/<stem>.storyboard_v2.md     (formatted markdown)
  - <out>/asset_reuse_matrix.json     (cross-section asset map)

Usage:
  # From myth script files (V1-compatible mode)
  python STORYBOARDER_V2.py script /path/to/lesson.html --out storyboards/

  # From process document (structured tables)
  python STORYBOARDER_V2.py process /path/to/THREE_ACT_STORYBOARDING_PROCESS.md --out storyboards/
"""

from __future__ import annotations

import argparse
import csv
import html as htmllib
import json
import re
from dataclasses import dataclass, field, asdict
from pathlib import Path
from typing import List, Dict, Optional, Tuple
from enum import Enum


# ═══════════════════════════════════════════════
# CONSTANTS & ENUMS
# ═══════════════════════════════════════════════

class ActFunction(str, Enum):
    """The three narrative functions in the 3-Act structure."""
    ABSENCE = "ABSENCE"
    TRANSFORMATION = "TRANSFORMATION"
    LEGACY = "LEGACY"


class VisualRegister(str, Enum):
    """Visual language shift per act."""
    PRE_ELEMENT = "pre-element"        # No geometry visible
    ELEMENT_IN_ACTION = "element-in-action"  # Geometry performing
    ELEMENT_AS_SYMBOL = "element-as-symbol"  # Geometry encoded in culture


# Canonical reuse tag taxonomy
REUSE_TAGS = {
    "A1_myth",
    "A3_iconography",
    "A4_material_culture",
    "A5_deep_dive",
    "B3_science",
    "B4_history",
    "B5_evolution",
    "B6_invention",
    "BACKGROUND",
    "CHARACTER",
    "ELEMENT_SOLO",
}

# Extractable asset layer types
ASSET_LAYERS = {"background", "character", "element", "fx"}

# Deity → element mapping
DEITY_ELEMENTS = {
    "shamash": {"element": "circle", "accent": "#FFD700"},
    "sin": {"element": "crescent", "accent": "#C0C0C0"},
    "nanna": {"element": "crescent", "accent": "#C0C0C0"},
    "ishtar": {"element": "8-pointed star", "accent": "#800080"},
    "inanna": {"element": "8-pointed star", "accent": "#800080"},
    "ninurta": {"element": "triangle", "accent": "#8B4513"},
}

# Mesopotamian palette
PALETTE = {
    "primary": "#8B4513",    # clay
    "secondary": "#D2691E",  # brick
    "accent": "#FFD700",     # gold
    "dark_bg": "#1a0a00",    # deep earth
}

# Style hint for prompt generation
DEFAULT_STYLE = "Bright, clean, museum-quality kids educational art. Ancient Mesopotamia."


# ═══════════════════════════════════════════════
# DATA MODELS
# ═══════════════════════════════════════════════

@dataclass
class Panel:
    """A single storyboard panel within an Act."""
    panel_id: str                   # e.g. "G3-W1-ACT1-P2"
    act_number: int                 # 1, 2, or 3
    panel_number: int               # within the act
    beat_name: str                  # e.g. "Dark world"
    duration_sec: int               # target seconds

    # Visual
    visual_concept: str             # ONE concept per panel
    camera: str                     # camera direction/movement

    # Dialogue / action
    speaker: str
    dialogue: str
    stage_direction: str

    # Audio
    sfx: str
    music_mood: str

    # ── V2 additions ──
    reuse_tags: List[str] = field(default_factory=list)
    extractable_assets: Dict[str, str] = field(default_factory=dict)
    grade_variants: Dict[str, str] = field(default_factory=dict)

    # Media prompts (generated)
    image_prompt: str = ""
    diagram_prompt: str = ""
    gif_prompt: str = ""
    video_prompt: str = ""


@dataclass
class Act:
    """A structural act containing variable panels."""
    act_number: int                        # 1, 2, or 3
    act_name: str                          # e.g. "ABSENCE"
    narrative_function: str                 # from ActFunction
    visual_register: str                   # from VisualRegister
    element_state: str                     # description of element in this act
    visual_register_note: str              # production note for visual language
    panels: List[Panel] = field(default_factory=list)

    @property
    def duration_sec(self) -> int:
        return sum(p.duration_sec for p in self.panels)

    @property
    def panel_count(self) -> int:
        return len(self.panels)


@dataclass
class Storyboard:
    """Complete three-act storyboard for one myth."""
    source_file: str
    lesson_code: str                       # e.g. "G3-W1"
    myth_title: str
    deity: str
    geometric_element: str
    metaphor: str                          # e.g. "Perfect justice (equal reach)"
    geometric_truth: str                   # e.g. "Equidistance from center = equal coverage"
    characters: List[str] = field(default_factory=list)
    props: List[str] = field(default_factory=list)
    acts: List[Act] = field(default_factory=list)

    @property
    def total_panels(self) -> int:
        return sum(a.panel_count for a in self.acts)

    @property
    def total_duration_sec(self) -> int:
        return sum(a.duration_sec for a in self.acts)

    @property
    def all_panels(self) -> List[Panel]:
        """Flat list of all panels across acts."""
        panels = []
        for act in self.acts:
            panels.extend(act.panels)
        return panels

    @property
    def all_reuse_tags(self) -> Dict[str, List[str]]:
        """Map of reuse_tag → list of panel_ids that carry it."""
        tag_map: Dict[str, List[str]] = {}
        for p in self.all_panels:
            for tag in p.reuse_tags:
                tag_map.setdefault(tag, []).append(p.panel_id)
        return tag_map

    @property
    def all_extractable_assets(self) -> Dict[str, Dict[str, str]]:
        """Map of panel_id → extractable asset dict."""
        return {p.panel_id: p.extractable_assets for p in self.all_panels if p.extractable_assets}


# ═══════════════════════════════════════════════
# PROMPT GENERATION
# ═══════════════════════════════════════════════

def generate_prompts(panel: Panel, style_hint: str = DEFAULT_STYLE) -> None:
    """Generate image/diagram/gif/video prompts for a panel. Mutates panel in place."""
    vc = panel.visual_concept
    cam = panel.camera or ""
    speaker = panel.speaker or "none specified"
    sd = panel.stage_direction or "none"

    panel.image_prompt = (
        f"{style_hint} Scene: {panel.beat_name}. "
        f"Focus on ONE concept: {vc}. "
        f"Characters present: {speaker}. "
        f"Stage action: {sd}. "
        f"Camera: {cam}. "
        f"Do not add text. Clear composition. One idea only."
    )

    panel.diagram_prompt = (
        f"Simple educational diagram (no text labels) showing ONLY: {vc}. "
        f"High contrast shapes, uncluttered, one concept only."
    )

    panel.gif_prompt = (
        f"Short looping animation (GIF) illustrating ONLY: {vc}. "
        f"Minimal background, 2-4 steps loop, no text."
    )

    panel.video_prompt = (
        f"5-8 second kid-safe animated clip. {style_hint} "
        f"Beat: {panel.beat_name}. Show ONLY the concept: {vc}. "
        f"Action: {sd}. Camera: {cam}. No on-screen text."
    )


# ═══════════════════════════════════════════════
# INPUT MODE 1: PARSE FROM MYTH SCRIPT (V1 UPGRADE)
# ═══════════════════════════════════════════════

# ── HTML helpers (carried from V1) ──

_RE_STRIP_SCRIPT_STYLE = re.compile(r"(?is)<(script|style).*?>.*?</\1>")
_RE_TAG = re.compile(r"(?is)<[^>]+>")


def html_to_text(html: str) -> str:
    s = _RE_STRIP_SCRIPT_STYLE.sub("", html)
    for token in ["</div>", "</p>", "<br>", "<br/>", "<br />",
                  "</h1>", "</h2>", "</h3>", "</li>", "</ul>", "</ol>"]:
        s = s.replace(token, "\n")
    s = re.sub(r"(?is)<li[^>]*>", "- ", s)
    s = _RE_TAG.sub("", s)
    s = htmllib.unescape(s)
    return "\n".join(line.strip() for line in s.splitlines() if line.strip())


def extract_lesson_code(raw_html: str, text: str) -> str:
    m = re.search(r'(?is)<div\s+class="lesson-code"\s*>(.*?)</div>', raw_html or "")
    if m:
        return htmllib.unescape(m.group(1)).strip()
    for line in text.splitlines()[:80]:
        if line.lower().startswith("g") and "day" in line.lower() and "wk" in line.lower():
            return line.strip()
    return ""


def extract_geometric_element(raw_html: str, text: str) -> str:
    m = re.search(r"identify and describe\s+([^<\n]+?)\s+in ancient artifacts", raw_html or "", re.I)
    if m:
        return htmllib.unescape(m.group(1)).strip()
    m2 = re.search(r"Geometric Element\s*:\s*([^\n]+)", text, re.I)
    if m2:
        return m2.group(1).strip()
    return ""


def looks_like_speaker(token: str) -> bool:
    t = token.strip()
    if not t or len(t) > 30:
        return False
    return all(ch.isupper() or ch.isdigit() or ch in " -'" for ch in t)


def split_stage_directions(dialogue: str) -> Tuple[str, str]:
    stage_dirs: List[str] = []
    d = dialogue.strip()
    while d.startswith("(") and ")" in d:
        close = d.find(")")
        stage_dirs.append(d[1:close].strip())
        d = d[close + 1:].strip()
    out = []
    i = 0
    while i < len(d):
        if d[i] == "(":
            j = d.find(")", i + 1)
            if j != -1:
                stage_dirs.append(d[i + 1:j].strip())
                i = j + 1
                continue
        out.append(d[i])
        i += 1
    return "".join(out).strip(), " | ".join(sd for sd in stage_dirs if sd)


# ── Act assignment heuristics for script parsing ──

ACT_BOUNDARIES = {
    # Keywords that signal act transitions in myth scripts
    "absence": ActFunction.ABSENCE,
    "problem": ActFunction.ABSENCE,
    "before": ActFunction.ABSENCE,
    "without": ActFunction.ABSENCE,
    "transformation": ActFunction.TRANSFORMATION,
    "discovers": ActFunction.TRANSFORMATION,
    "creates": ActFunction.TRANSFORMATION,
    "deploys": ActFunction.TRANSFORMATION,
    "legacy": ActFunction.LEGACY,
    "adopts": ActFunction.LEGACY,
    "symbol": ActFunction.LEGACY,
    "forever": ActFunction.LEGACY,
    "encoded": ActFunction.LEGACY,
}


def infer_act_from_context(line: str, current_act: int, total_lines: int, line_idx: int) -> int:
    """Heuristic: assign act number based on position and keywords."""
    lower = line.lower()

    # Explicit ACT headers
    act_match = re.match(r"act\s+([ivx123]+)", lower)
    if act_match:
        token = act_match.group(1)
        mapping = {"i": 1, "ii": 2, "iii": 3, "1": 1, "2": 2, "3": 3}
        return mapping.get(token, current_act)

    # Keyword detection
    for kw, act_fn in ACT_BOUNDARIES.items():
        if kw in lower:
            return {ActFunction.ABSENCE: 1, ActFunction.TRANSFORMATION: 2, ActFunction.LEGACY: 3}[act_fn]

    # Position-based fallback (roughly thirds)
    if total_lines > 0:
        pct = line_idx / total_lines
        if pct < 0.30:
            return 1
        elif pct < 0.70:
            return 2
        else:
            return 3

    return current_act


def parse_script_to_storyboard(
    text: str,
    source_file: str,
    lesson_code: str,
    deity: str = "",
    geometric_element: str = "",
    style_hint: str = DEFAULT_STYLE,
) -> Storyboard:
    """Parse myth script text into a 3-Act Storyboard."""

    lines = [l.strip() for l in text.splitlines() if l.strip()]
    total_lines = len(lines)

    # Build acts
    act_panels: Dict[int, List[Panel]] = {1: [], 2: [], 3: []}
    current_act = 1
    panel_counters = {1: 0, 2: 0, 3: 0}

    for idx, line in enumerate(lines):
        # Skip headers
        if line.startswith("#") or line.startswith("Section"):
            current_act = infer_act_from_context(line, current_act, total_lines, idx)
            continue

        # Detect explicit ACT markers
        if re.match(r"(?i)^act\s+", line):
            current_act = infer_act_from_context(line, current_act, total_lines, idx)
            continue

        # Detect scene markers
        if re.match(r"(?i)^scene\s+", line):
            continue

        # Speaker line?
        speaker = ""
        dialogue = ""
        stage_direction = ""

        if ":" in line:
            token, rest = line.split(":", 1)
            if looks_like_speaker(token.strip()):
                speaker = token.strip()
                dialogue, stage_direction = split_stage_directions(rest.strip())
            else:
                stage_direction = line
        else:
            stage_direction = line

        # Create panel
        panel_counters[current_act] += 1
        pn = panel_counters[current_act]
        pid = f"{lesson_code or 'LESSON'}-ACT{current_act}-P{pn}"

        # Infer reuse tags from content
        tags = _infer_reuse_tags(speaker, dialogue, stage_direction, current_act)

        panel = Panel(
            panel_id=pid,
            act_number=current_act,
            panel_number=pn,
            beat_name=f"Beat {pn}",
            duration_sec=6,
            visual_concept=geometric_element or "FILL_CONCEPT",
            camera="MEDIUM",
            speaker=speaker,
            dialogue=dialogue,
            stage_direction=stage_direction,
            sfx="",
            music_mood=_act_mood(current_act),
            reuse_tags=tags,
            extractable_assets={},
            grade_variants={},
        )
        generate_prompts(panel, style_hint)
        act_panels[current_act].append(panel)

    # Assemble Acts
    act_configs = {
        1: ("ABSENCE", ActFunction.ABSENCE, VisualRegister.PRE_ELEMENT,
            "Geometric property is MISSING", "Dark palette, asymmetric compositions, NO element visible"),
        2: ("TRANSFORMATION", ActFunction.TRANSFORMATION, VisualRegister.ELEMENT_IN_ACTION,
            "Element IS the solution", "Element-centric compositions, geometry performing"),
        3: ("LEGACY", ActFunction.LEGACY, VisualRegister.ELEMENT_AS_SYMBOL,
            "Symbol is permanent", "Warm earth tones, element embedded in culture"),
    }

    acts = []
    for act_num in [1, 2, 3]:
        name, func, register, elem_state, vis_note = act_configs[act_num]
        acts.append(Act(
            act_number=act_num,
            act_name=name,
            narrative_function=func.value,
            visual_register=register.value,
            element_state=elem_state,
            visual_register_note=vis_note,
            panels=act_panels[act_num],
        ))

    # Infer metadata
    myth_title = ""
    for line in lines[:40]:
        if "story" in line.lower():
            myth_title = line.strip()
            break

    deity_detected = deity
    if not deity_detected:
        m = re.search(r"([A-Z][a-z]+)'s\s+Story", text)
        if m:
            deity_detected = m.group(1)

    return Storyboard(
        source_file=source_file,
        lesson_code=lesson_code,
        myth_title=myth_title or "Untitled Myth",
        deity=deity_detected,
        geometric_element=geometric_element,
        metaphor="",
        geometric_truth="",
        acts=acts,
    )


def _infer_reuse_tags(speaker: str, dialogue: str, stage_dir: str, act_num: int) -> List[str]:
    """Heuristic tag assignment based on content."""
    tags = ["A1_myth"]
    combined = f"{speaker} {dialogue} {stage_dir}".lower()

    if any(kw in combined for kw in ["artifact", "seal", "carving", "relief", "statue"]):
        tags.append("A3_iconography")
    if any(kw in combined for kw in ["city", "temple", "market", "house", "builder", "artisan"]):
        tags.append("A4_material_culture")
    if any(kw in combined for kw in ["examine", "detail", "close-up", "inscription"]):
        tags.append("A5_deep_dive")
    if any(kw in combined for kw in ["radius", "symmetry", "angle", "arc", "property", "equal"]):
        tags.append("B3_science")
    if any(kw in combined for kw in ["calendar", "foundation", "irrigation", "architect"]):
        tags.append("B4_history")
    if any(kw in combined for kw in ["civilization", "spread", "adopt", "across"]):
        tags.append("B5_evolution")
    if any(kw in combined for kw in ["invent", "discover", "first time", "create"]):
        tags.append("B6_invention")

    if not speaker or speaker.upper() == "NARRATOR":
        if act_num == 1:
            tags.append("BACKGROUND")
        elif act_num == 3:
            tags.append("BACKGROUND")
    if speaker and speaker.upper() not in ("NARRATOR", ""):
        tags.append("CHARACTER")

    return list(dict.fromkeys(tags))  # de-dup preserving order


def _act_mood(act_num: int) -> str:
    return {1: "tension", 2: "revelation", 3: "legacy"}[act_num]


# ═══════════════════════════════════════════════
# INPUT MODE 2: PARSE FROM PROCESS DOCUMENT
# ═══════════════════════════════════════════════

def parse_process_document(md_path: Path) -> List[Storyboard]:
    """Parse THREE_ACT_STORYBOARDING_PROCESS.md into Storyboard objects."""
    text = md_path.read_text(encoding="utf-8")
    storyboards = []

    # Split by WEEK headers
    week_pattern = re.compile(
        r"###\s+WEEK\s+([IVX]+):\s+(.+?)(?:\n|$)",
        re.IGNORECASE,
    )
    week_matches = list(week_pattern.finditer(text))

    # Find where non-week content starts (PART 3, PART 4, APPENDIX, etc.)
    # so the last week doesn't swallow appendix tables
    doc_end_markers = [
        re.search(r"^##\s+PART\s+3", text, re.MULTILINE),
        re.search(r"^##\s+PART\s+4", text, re.MULTILINE),
        re.search(r"^##\s+APPENDIX", text, re.MULTILINE | re.IGNORECASE),
    ]
    doc_end = min((m.start() for m in doc_end_markers if m), default=len(text))

    for wi, wm in enumerate(week_matches):
        week_num_roman = wm.group(1).strip()
        week_title = wm.group(2).strip()

        # Get text block for this week — bounded by next week OR doc_end
        start = wm.end()
        if wi + 1 < len(week_matches):
            end = week_matches[wi + 1].start()
        else:
            end = doc_end
        week_text = text[start:end]

        storyboard = _parse_week_block(week_text, week_num_roman, week_title, str(md_path))
        if storyboard:
            storyboards.append(storyboard)

    return storyboards


def _parse_week_block(block: str, week_roman: str, title: str, source_file: str) -> Optional[Storyboard]:
    """Parse a single week's block from the process document."""
    week_num = {"I": 1, "II": 2, "III": 3, "IV": 4}.get(week_roman, 0)
    if not week_num:
        return None

    # Extract header metadata
    element_m = re.search(r"\*\*Element:\*\*\s*(.+)", block)
    deity_m = re.search(r"\*\*Deity:\*\*\s*(.+)", block)
    metaphor_m = re.search(r"\*\*Metaphor:\*\*\s*(.+)", block)
    geo_truth_m = re.search(r"\*\*Geometric Truth:\*\*\s*(.+)", block)

    element = element_m.group(1).strip() if element_m else ""
    deity = deity_m.group(1).strip() if deity_m else ""
    metaphor = metaphor_m.group(1).strip() if metaphor_m else ""
    geo_truth = geo_truth_m.group(1).strip() if geo_truth_m else ""

    lesson_code = f"G3-W{week_num}"

    # Parse ACT blocks
    act_pattern = re.compile(
        r"####\s+ACT\s+([IVX]+):\s+(\w+)\s*(?:—|–|-)\s*(.+?)(?:\n|$)",
        re.IGNORECASE,
    )
    act_matches = list(act_pattern.finditer(block))

    acts = []
    for ai, am in enumerate(act_matches):
        act_roman = am.group(1).strip()
        act_name = am.group(2).strip().upper()
        act_subtitle = am.group(3).strip()

        act_num = {"I": 1, "II": 2, "III": 3}.get(act_roman, ai + 1)

        # Get act text block
        act_start = am.end()
        act_end = act_matches[ai + 1].start() if ai + 1 < len(act_matches) else len(block)
        act_text = block[act_start:act_end]

        # Extract visual register note
        vis_note_m = re.search(r"\*\*Act [IVX]+ Visual Register:\*\*\s*(.+)", act_text)
        vis_note = vis_note_m.group(1).strip() if vis_note_m else ""

        # Parse panel table
        panels = _parse_panel_table(act_text, act_num, lesson_code, week_num)

        # Determine visual register
        register_map = {
            1: VisualRegister.PRE_ELEMENT,
            2: VisualRegister.ELEMENT_IN_ACTION,
            3: VisualRegister.ELEMENT_AS_SYMBOL,
        }
        func_map = {
            1: ActFunction.ABSENCE,
            2: ActFunction.TRANSFORMATION,
            3: ActFunction.LEGACY,
        }
        elem_state_map = {
            1: "Geometric property is MISSING",
            2: "Element IS the solution",
            3: "Symbol is permanent",
        }

        acts.append(Act(
            act_number=act_num,
            act_name=act_name,
            narrative_function=func_map.get(act_num, ActFunction.ABSENCE).value,
            visual_register=register_map.get(act_num, VisualRegister.PRE_ELEMENT).value,
            element_state=elem_state_map.get(act_num, ""),
            visual_register_note=vis_note,
            panels=panels,
        ))

    # Clean title: remove trailing formatting artifacts
    clean_title = re.sub(r"\*\*$", "", title).strip().strip('"').strip("'")

    return Storyboard(
        source_file=source_file,
        lesson_code=lesson_code,
        myth_title=clean_title,
        deity=deity,
        geometric_element=element,
        metaphor=metaphor,
        geometric_truth=geo_truth,
        acts=acts,
    )


def _parse_panel_table(act_text: str, act_num: int, lesson_code: str, week_num: int) -> List[Panel]:
    """Parse markdown table rows into Panel objects."""
    panels = []

    # Find table rows (skip header and separator)
    table_lines = []
    in_table = False
    for line in act_text.splitlines():
        stripped = line.strip()
        if stripped.startswith("|") and stripped.endswith("|"):
            if "---" in stripped:
                in_table = True
                continue
            if in_table:
                table_lines.append(stripped)
            elif "Panel" in stripped and "Beat" in stripped:
                # header row
                continue

    for row in table_lines:
        cells = [c.strip() for c in row.split("|")[1:-1]]
        if len(cells) < 6:
            continue

        panel_label = cells[0].strip()     # e.g. "1.1" or "2.3"
        beat_name = cells[1].strip()
        visual_concept = cells[2].strip()
        duration_str = cells[3].strip()
        camera = cells[4].strip()
        reuse_str = cells[5].strip()

        # Parse panel number from label
        pn_match = re.search(r"(\d+)\.(\d+)", panel_label)
        if pn_match:
            panel_number = int(pn_match.group(2))
        else:
            panel_number = len(panels) + 1

        # Parse duration
        dur_match = re.search(r"(\d+)", duration_str)
        duration = int(dur_match.group(1)) if dur_match else 6

        # Parse reuse tags
        reuse_tags = [t.strip() for t in reuse_str.split(",") if t.strip() in REUSE_TAGS]

        pid = f"{lesson_code}-ACT{act_num}-P{panel_number}"

        panel = Panel(
            panel_id=pid,
            act_number=act_num,
            panel_number=panel_number,
            beat_name=beat_name,
            duration_sec=duration,
            visual_concept=visual_concept,
            camera=camera,
            speaker="NARRATOR",
            dialogue="",
            stage_direction=visual_concept,
            sfx="",
            music_mood=_act_mood(act_num),
            reuse_tags=reuse_tags,
            extractable_assets={},
            grade_variants={},
        )
        generate_prompts(panel)
        panels.append(panel)

    return panels


# ═══════════════════════════════════════════════
# ASSET REUSE MATRIX
# ═══════════════════════════════════════════════

def build_asset_reuse_matrix(storyboards: List[Storyboard]) -> Dict:
    """Build cross-section asset reuse map from all storyboards."""
    matrix = {
        "total_storyboards": len(storyboards),
        "total_panels": sum(sb.total_panels for sb in storyboards),
        "tags": {},
        "assets_by_panel": {},
    }

    for sb in storyboards:
        for tag, pids in sb.all_reuse_tags.items():
            matrix["tags"].setdefault(tag, []).extend(
                {"panel_id": pid, "myth": sb.deity, "week": sb.lesson_code}
                for pid in pids
            )
        for pid, assets in sb.all_extractable_assets.items():
            matrix["assets_by_panel"][pid] = {
                "myth": sb.deity,
                "week": sb.lesson_code,
                "assets": assets,
            }

    return matrix


# ═══════════════════════════════════════════════
# OUTPUT WRITERS
# ═══════════════════════════════════════════════

def _sb_to_dict(sb: Storyboard) -> dict:
    """Convert Storyboard to serializable dict with hierarchy preserved."""
    return {
        "source_file": sb.source_file,
        "lesson_code": sb.lesson_code,
        "myth_title": sb.myth_title,
        "deity": sb.deity,
        "geometric_element": sb.geometric_element,
        "metaphor": sb.metaphor,
        "geometric_truth": sb.geometric_truth,
        "characters": sb.characters,
        "props": sb.props,
        "total_panels": sb.total_panels,
        "total_duration_sec": sb.total_duration_sec,
        "acts": [
            {
                "act_number": a.act_number,
                "act_name": a.act_name,
                "narrative_function": a.narrative_function,
                "visual_register": a.visual_register,
                "element_state": a.element_state,
                "visual_register_note": a.visual_register_note,
                "panel_count": a.panel_count,
                "duration_sec": a.duration_sec,
                "panels": [asdict(p) for p in a.panels],
            }
            for a in sb.acts
        ],
    }


def write_json(out_path: Path, sb: Storyboard) -> None:
    out_path.write_text(json.dumps(_sb_to_dict(sb), indent=2, ensure_ascii=False), encoding="utf-8")


CSV_FIELDS_V2 = [
    "source_file", "lesson_code", "myth_title", "deity", "geometric_element",
    "act_number", "act_name", "narrative_function", "visual_register",
    "panel_id", "panel_number", "beat_name", "duration_sec",
    "visual_concept", "camera",
    "speaker", "dialogue", "stage_direction",
    "sfx", "music_mood",
    "reuse_tags", "extractable_assets", "grade_variants",
    "image_prompt", "diagram_prompt", "gif_prompt", "video_prompt",
]


def write_csv(out_path: Path, sb: Storyboard) -> None:
    with out_path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=CSV_FIELDS_V2)
        w.writeheader()
        for act in sb.acts:
            for p in act.panels:
                row = {
                    "source_file": sb.source_file,
                    "lesson_code": sb.lesson_code,
                    "myth_title": sb.myth_title,
                    "deity": sb.deity,
                    "geometric_element": sb.geometric_element,
                    "act_number": act.act_number,
                    "act_name": act.act_name,
                    "narrative_function": act.narrative_function,
                    "visual_register": act.visual_register,
                    "panel_id": p.panel_id,
                    "panel_number": p.panel_number,
                    "beat_name": p.beat_name,
                    "duration_sec": p.duration_sec,
                    "visual_concept": p.visual_concept,
                    "camera": p.camera,
                    "speaker": p.speaker,
                    "dialogue": p.dialogue,
                    "stage_direction": p.stage_direction,
                    "sfx": p.sfx,
                    "music_mood": p.music_mood,
                    "reuse_tags": ",".join(p.reuse_tags),
                    "extractable_assets": json.dumps(p.extractable_assets),
                    "grade_variants": json.dumps(p.grade_variants),
                    "image_prompt": p.image_prompt,
                    "diagram_prompt": p.diagram_prompt,
                    "gif_prompt": p.gif_prompt,
                    "video_prompt": p.video_prompt,
                }
                w.writerow(row)


def write_md(out_path: Path, sb: Storyboard) -> None:
    lines = []
    lines.append(f"# Storyboard — {sb.myth_title}")
    lines.append("")
    lines.append(f"- **Lesson Code:** {sb.lesson_code}")
    lines.append(f"- **Deity:** {sb.deity}")
    lines.append(f"- **Geometric Element:** {sb.geometric_element}")
    lines.append(f"- **Metaphor:** {sb.metaphor}")
    lines.append(f"- **Geometric Truth:** {sb.geometric_truth}")
    lines.append(f"- **Total Panels:** {sb.total_panels}")
    lines.append(f"- **Total Duration:** ~{sb.total_duration_sec}s")
    lines.append("")

    for act in sb.acts:
        lines.append(f"## ACT {act.act_number}: {act.act_name}")
        lines.append(f"*{act.narrative_function}* — {act.element_state}")
        lines.append(f"Visual register: {act.visual_register}")
        if act.visual_register_note:
            lines.append(f"> {act.visual_register_note}")
        lines.append("")
        lines.append("| # | Beat | Visual Concept | Dur | Camera | Reuse Tags |")
        lines.append("|---|---|---|---|---|---|")
        for p in act.panels:
            tags = ", ".join(p.reuse_tags)
            vc = (p.visual_concept or "").replace("|", "\\|")[:80]
            lines.append(
                f"| {p.panel_number} | {p.beat_name} | {vc} | {p.duration_sec}s | {p.camera} | {tags} |"
            )
        lines.append("")
        lines.append(f"**Act duration:** ~{act.duration_sec}s ({act.panel_count} panels)")
        lines.append("")

    # Reuse tag summary
    lines.append("## Reuse Tag Summary")
    lines.append("")
    tag_map = sb.all_reuse_tags
    for tag in sorted(tag_map.keys()):
        pids = tag_map[tag]
        lines.append(f"- **{tag}:** {len(pids)} panels — {', '.join(pids)}")
    lines.append("")

    out_path.write_text("\n".join(lines), encoding="utf-8")


# ═══════════════════════════════════════════════
# V1 COMPATIBILITY ADAPTER
# ═══════════════════════════════════════════════

def storyboard_v2_to_v1(sb: Storyboard) -> dict:
    """Convert a V2 Storyboard to V1-compatible flat dict (for backward compat)."""
    from dataclasses import asdict as _asdict

    v1_panels = []
    for act in sb.acts:
        for p in act.panels:
            v1_panels.append({
                "panel_id": p.panel_id,
                "act": f"ACT {act.act_number}: {act.act_name}",
                "scene": f"Act {act.act_number}",
                "beat": p.panel_number,
                "speaker": p.speaker,
                "dialogue": p.dialogue,
                "stage_direction": p.stage_direction,
                "visual_concept": p.visual_concept,
                "image_prompt": p.image_prompt,
                "diagram_prompt": p.diagram_prompt,
                "gif_prompt": p.gif_prompt,
                "video_prompt": p.video_prompt,
                "sfx": p.sfx,
                "music_mood": p.music_mood,
                "duration_sec": p.duration_sec,
            })

    return {
        "source_file": sb.source_file,
        "lesson_code": sb.lesson_code,
        "myth_title": sb.myth_title,
        "deity": sb.deity,
        "geometric_element": sb.geometric_element,
        "characters": sb.characters,
        "props": sb.props,
        "panels": v1_panels,
    }


# ═══════════════════════════════════════════════
# CLI
# ═══════════════════════════════════════════════

def cmd_script(args) -> int:
    """Process myth script files (V1-upgraded mode)."""
    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)

    made = 0
    for inp in args.inputs:
        p = Path(inp)
        if not p.exists():
            print(f"[SKIP] {p} does not exist")
            continue

        raw = p.read_text(encoding="utf-8", errors="ignore")
        is_html = p.suffix.lower() in {".html", ".htm"}
        text = html_to_text(raw) if is_html else raw

        lesson_code = extract_lesson_code(raw if is_html else "", text)
        geo_elem = extract_geometric_element(raw if is_html else "", text)

        sb = parse_script_to_storyboard(
            text=text,
            source_file=str(p),
            lesson_code=lesson_code,
            geometric_element=geo_elem,
            style_hint=args.style,
        )

        stem = p.stem
        write_json(out_dir / f"{stem}.storyboard_v2.json", sb)
        write_csv(out_dir / f"{stem}.storyboard_v2.csv", sb)
        if args.md:
            write_md(out_dir / f"{stem}.storyboard_v2.md", sb)

        # V1 compat
        if args.v1_compat:
            v1_path = out_dir / f"{stem}.storyboard.json"
            v1_path.write_text(json.dumps(storyboard_v2_to_v1(sb), indent=2, ensure_ascii=False))

        made += 1
        print(f"  [{stem}] {sb.total_panels} panels across 3 acts ({sb.total_duration_sec}s)")

    print(f"\nDone. V2 storyboards created for {made} file(s) in: {out_dir.resolve()}")
    return 0


def cmd_process(args) -> int:
    """Process the THREE_ACT_STORYBOARDING_PROCESS.md document."""
    md_path = Path(args.process_doc)
    if not md_path.exists():
        print(f"[ERROR] Process document not found: {md_path}")
        return 1

    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)

    storyboards = parse_process_document(md_path)

    for sb in storyboards:
        stem = sb.lesson_code.replace("-", "_").lower()
        write_json(out_dir / f"{stem}.storyboard_v2.json", sb)
        write_csv(out_dir / f"{stem}.storyboard_v2.csv", sb)
        if args.md:
            write_md(out_dir / f"{stem}.storyboard_v2.md", sb)
        if args.v1_compat:
            v1_path = out_dir / f"{stem}.storyboard.json"
            v1_path.write_text(json.dumps(storyboard_v2_to_v1(sb), indent=2, ensure_ascii=False))

        print(f"  [{sb.lesson_code}] {sb.myth_title}: {sb.total_panels} panels, ~{sb.total_duration_sec}s")

    # Asset reuse matrix
    matrix = build_asset_reuse_matrix(storyboards)
    matrix_path = out_dir / "asset_reuse_matrix.json"
    matrix_path.write_text(json.dumps(matrix, indent=2, ensure_ascii=False))

    print(f"\nDone. {len(storyboards)} storyboards + asset matrix in: {out_dir.resolve()}")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(
        description="STORYBOARDER V2 — Three-Act Hierarchical Storyboard Engine",
    )
    sub = ap.add_subparsers(dest="command", required=True)

    # ── script subcommand ──
    sp_script = sub.add_parser("script", help="Parse myth script files (HTML/MD)")
    sp_script.add_argument("inputs", nargs="+", help="HTML/MD files")
    sp_script.add_argument("--out", default="storyboards_v2_out", help="Output folder")
    sp_script.add_argument("--md", action="store_true", help="Also write markdown output")
    sp_script.add_argument("--v1-compat", action="store_true", help="Also write V1-format JSON")
    sp_script.add_argument("--style", default=DEFAULT_STYLE, help="Style hint for prompts")

    # ── process subcommand ──
    sp_proc = sub.add_parser("process", help="Parse THREE_ACT_STORYBOARDING_PROCESS.md")
    sp_proc.add_argument("process_doc", help="Path to process document")
    sp_proc.add_argument("--out", default="storyboards_v2_out", help="Output folder")
    sp_proc.add_argument("--md", action="store_true", help="Also write markdown output")
    sp_proc.add_argument("--v1-compat", action="store_true", help="Also write V1-format JSON")

    args = ap.parse_args()

    if args.command == "script":
        return cmd_script(args)
    elif args.command == "process":
        return cmd_process(args)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
