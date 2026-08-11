"""One-time offline conversion: media/blackbelt-kick.gif -> the baked ASCII
frame data inlined in 404.html's <script> block.

Not run at request time — the site has zero build step (see server.py /
CLAUDE.md), so this is a dev-machine utility. Re-run and paste the output
back into 404.html only if the source GIF or the crop/ramp constants below
change.

Source notes: blackbelt-kick.gif is clean line art (dark outline on a light
backdrop) — a genuine 6-frame front-kick cycle (chamber -> knee-up -> kick
out -> retract), unlike the earlier two source assets this replaced (a
halftone photo, then a static-pose glow loop). Content is darker than the
background here, so the density ramp inverts luminance, same direction as
the original photo conversion.

Usage:
    python3 design-system/scripts/gif-to-ascii.py > frames.json
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent.parent
SOURCE_GIF = ROOT / "media" / "blackbelt-kick.gif"

# Tight crop around the figure (x0, y0, x1, y1) on the 498x454 canvas: the
# union of each frame's content bounding box (luminance < 200) plus a 10px
# breathing margin, clamped to the canvas so PIL doesn't pad the overflow
# with solid black (which showed up as a bogus full-width dense row).
_CANVAS = (498, 454)
_RAW_BOX = (23 - 10, 15 - 10, 460 + 10, 450 + 10)
CROP_BOX = (
    max(0, _RAW_BOX[0]),
    max(0, _RAW_BOX[1]),
    min(_CANVAS[0], _RAW_BOX[2]),
    min(_CANVAS[1], _RAW_BOX[3]),
)

COLS = 70  # fixed character grid width (matches the site's one ASCII-grid convention)
CHAR_ASPECT = 0.55  # monospace glyph width/height, for square-pixel-correct scaling

RAMP = " .:-=+*#%@"  # light/background -> dark/content (this source's polarity)
GAUSSIAN_BLUR_RADIUS = 1.5  # light anti-aliasing smoothing; this source has no halftone noise
BG_LUMINANCE_THRESHOLD = 222  # >= this (post-blur) renders as blank space


def main() -> None:
    if not SOURCE_GIF.is_file():
        sys.exit(f"missing {SOURCE_GIF}")

    rows = round(
        COLS
        * ((CROP_BOX[3] - CROP_BOX[1]) / (CROP_BOX[2] - CROP_BOX[0]))
        * CHAR_ASPECT
    )

    gif = Image.open(SOURCE_GIF)
    n_frames = gif.n_frames
    durations = []
    samples = []
    for i in range(n_frames):
        gif.seek(i)
        durations.append(gif.info.get("duration", 120) or 120)
        frame = gif.convert("RGB").convert("L").crop(CROP_BOX)
        frame = frame.filter(ImageFilter.GaussianBlur(radius=GAUSSIAN_BLUR_RADIUS))
        small = frame.resize((COLS, rows), Image.BOX)
        samples.append(np.array(small).astype(float))

    all_pixels = np.concatenate([s.flatten() for s in samples])
    dark_point = np.percentile(all_pixels, 1)

    frames_out = []
    for arr in samples:
        idx = np.zeros(arr.shape, dtype=int)
        below_bg = arr < BG_LUMINANCE_THRESHOLD
        norm = np.clip(
            (BG_LUMINANCE_THRESHOLD - arr) / (BG_LUMINANCE_THRESHOLD - dark_point), 0, 1
        )
        levels = 1 + (norm * (len(RAMP) - 2))
        idx[below_bg] = levels[below_bg].round().astype(int)
        frames_out.append(["".join(RAMP[j] for j in row) for row in idx])

    json.dump(
        {"cols": COLS, "rows": rows, "durations_ms": durations, "frames": frames_out},
        sys.stdout,
    )


if __name__ == "__main__":
    main()
