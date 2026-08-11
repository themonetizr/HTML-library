# PhoneFrame — Replication Guide

A single, self-contained spec for the **Monetizr Blackbelt PhoneFrame** — an iPhone-16-style bezel that frames campaign screenshots. Share this file with Claude to reproduce the component exactly. It reflects the current version, including the width-proportional radius fix (fixed-px radii caused corner drift when scaled).

---

## What it is

A metallic phone bezel with a 19.5:9 screen for holding gameplay/campaign screenshots. **Every geometric metric is a proportion of the frame's measured width** — so the phone looks identical at any size: no thin bezels when enlarged, no chunky ones when small. Width is measured with a `ResizeObserver`; corners stay concentric (`screen radius = outer radius − bezel padding`).

Lays out well side-by-side as a campaign gallery. Lifts `-3px` on hover.

---

## Geometry (the important part)

All derived from the frame's rendered **width `w`**:

| Metric | Formula | At 206px ref |
| --- | --- | --- |
| Outer bezel radius | `w × 0.165` | ~34px |
| Bezel padding (thickness, even all sides) | `w × 0.04` | ~8px |
| Rim border | `max(w × 0.005, 0.5)` px | ~1px |
| Screen radius (concentric) | `outer − padding` = `w × 0.125` | ~26px |
| Screen aspect ratio | `9 / 19.5` (drives height from width) | — |

**Never set a height** — the `aspect-ratio` derives it from width. **Never hardcode the radius in px** — that was the original bug (small-phone corners stayed on a big phone). Derive from width and the corners stay parallel at every scale.

---

## Materials & tokens

- **Body gradient:** `linear-gradient(150deg, #3a3b40, #17181b 55%, #202127)` — machined-titanium look. The light bottom stop (`#202127`, not near-black) keeps the lower edge visible on a navy background.
- **Rim light:** `1px`-equivalent `rgba(255,255,255,.10)` border (scales with width).
- **Lift shadow:** `--shadow-phone` = `0 12px 30px rgba(0,0,0,0.35)`.
- **Empty screen:** `linear-gradient(160deg, var(--surface), var(--surface-recessed))` (navy-800 → navy-950).
- **Caption number:** `--accent` (gold `#FEC902`), Lato Black (`--fw-black`). **Caption label:** `--text` (white), Lato Regular.
- **Hover transition:** `transform 180ms var(--ease-out)` where `--ease-out` = `cubic-bezier(0.23,1,0.32,1)`.

Device-material hexes (`#3a3b40 → #202127`, rim white) are literal — they render the physical phone body and sit intentionally outside the palette. Everything else is a token.

Minimum token set the component reads (define these if the target project doesn't have them):
```css
:root{
  --surface:#111635; --surface-recessed:#04091f;
  --accent:#FEC902; --text:#f5f6fa;
  --font-sans:'Lato',-apple-system,'Segoe UI',sans-serif;
  --fw-black:900; --fw-regular:400;
  --shadow-phone:0 12px 30px rgba(0,0,0,.35);
  --ease-out:cubic-bezier(0.23,1,0.32,1);
}
```

---

## Content

- **Screen fill — two ways:**
  1. **`children`** — drop an `<img>` (or any node): `<PhoneFrame><img src="shot.png" style={{width:'100%',height:'100%',objectFit:'cover'}} /></PhoneFrame>`. Clipped to the rounded screen; nothing pokes past the corners.
  2. **`slotId`** — renders a user-fillable `<image-slot>` filling the screen (drag-and-drop/upload, persists by id). **Requires `assets/image-slot.js` loaded on the page.** Give each frame a **unique** `slotId` (drops are keyed by id).
- No drawn notch / Dynamic Island / camera — the screenshot owns the full glass.
- **Caption** (optional), centered *below* the phone: pass one string like `"1 · Rewarded video"` and it splits on `·` / `.` / `-` into a gold leading number + white label. Or pass `number` explicitly.

---

## Interactions & animation

- **Hover lift** — `translateY(-3px)`, gated behind `@media (hover:hover) and (pointer:fine)` so it never fires on touch:
  ```css
  @media (hover:hover) and (pointer:fine){ .mtz-phone-frame:hover{ transform: translateY(-3px); } }
  ```
- **Reduced motion** — under `@media (prefers-reduced-motion: reduce)` drop the transform transition.
- That's the entire motion vocabulary — no entrance animation, no parallax. The image slot (when used) handles its own drag/drop/upload.

---

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `children` | node | — | Screen content (`<img>` / node). Ignored when `slotId` is set. |
| `slotId` | string | — | Renders a user-fillable `<image-slot>` filling the screen. Unique per frame. |
| `slotSrc` | string | — | Initial image src for the slot. |
| `placeholder` | string | `'Drop a screenshot'` | Empty-slot prompt. |
| `caption` | node | — | Centered below; `"1 · Label"` → gold number + white text. |
| `number` | node | — | Explicit leading number; overrides the digit parsed from `caption`. |
| `style` | object | `{}` | Merged onto the outer wrapper. |

---

## Layout recipe — campaign gallery

Fixed-column CSS grid; frames fill their columns and stay equal size (size by constraining width, never height):

```jsx
<div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'24px' }}>
  <PhoneFrame slotId="pf-1" caption="1 · Teaser button" />
  <PhoneFrame slotId="pf-2" caption="2 · Rewarded video" />
  <PhoneFrame slotId="pf-3" caption="3 · Reward granted" />
  <PhoneFrame slotId="pf-4" caption="4 · Store CTA" />
</div>
```

---

## Full source (React) — copy verbatim

```jsx
import React, { useState, useRef, useLayoutEffect } from 'react';

/**
 * PhoneFrame — iPhone-16-style bezel, 19.5:9 screen. Every metric is a
 * proportion of the measured width (outer radius 16.5%, bezel padding 4%,
 * rim 0.5%, screen radius 12.5% = 16.5 − 4), so it looks identical at any
 * size and corners stay concentric. Drop an <img>/node as children, or pass
 * slotId for a user-fillable <image-slot> (needs assets/image-slot.js).
 * Caption renders centered below: gold leading number + white label.
 */
export function PhoneFrame({ children, caption, number, slotId, slotSrc, placeholder = 'Drop a screenshot', style = {} }) {
  let num = number;
  let text = caption;
  if (num == null && typeof caption === 'string') {
    const m = caption.match(/^\s*(\d+)\s*[·.\-]\s*(.*)$/);
    if (m) { num = m[1]; text = m[2]; }
  }

  const frameRef = useRef(null);
  const [w, setW] = useState(206); // reference width until measured
  useLayoutEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const measure = () => setW(el.clientWidth || 206);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const outerR = w * 0.165;             // outer bezel radius
  const pad = w * 0.04;                 // bezel thickness (even on all sides)
  const rim = Math.max(w * 0.005, 0.5); // rim light, never below 0.5px
  const innerR = outerR - pad;          // concentric screen radius

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', ...style }}>
      <div
        ref={frameRef}
        className="mtz-phone-frame"
        style={{
          width: '100%',
          background: 'linear-gradient(150deg, #3a3b40, #17181b 55%, #202127)',
          borderRadius: outerR + 'px',
          padding: pad + 'px',
          border: rim + 'px solid rgba(255,255,255,.10)',
          boxShadow: 'var(--shadow-phone)',
          transition: 'transform 180ms var(--ease-out)',
          boxSizing: 'border-box',
        }}
      >
        <div style={{
          aspectRatio: '9 / 19.5',
          borderRadius: innerR + 'px',
          overflow: 'hidden',
          position: 'relative',
          background: 'linear-gradient(160deg, var(--surface), var(--surface-recessed))',
          display: 'flex',
          alignItems: 'flex-end',
        }}>
          {slotId
            ? React.createElement('image-slot', {
                id: slotId,
                src: slotSrc,
                shape: 'rect',
                fit: 'cover',
                placeholder,
                style: { position: 'absolute', inset: 0, width: '100%', height: '100%' },
              })
            : children}
        </div>
      </div>
      {(text || num != null) && (
        <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '13px', lineHeight: 1.4 }}>
          {num != null && (
            <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 'var(--fw-black)', color: 'var(--accent)', marginRight: '6px' }}>{num}</span>
          )}
          {text && <span style={{ color: 'var(--text)', fontWeight: 'var(--fw-regular)' }}>{text}</span>}
        </div>
      )}
    </div>
  );
}
```

The matching hover CSS (add once to a stylesheet):
```css
@media (hover:hover) and (pointer:fine){ .mtz-phone-frame:hover{ transform: translateY(-3px); } }
@media (prefers-reduced-motion: reduce){ .mtz-phone-frame{ transition:none!important; transform:none!important; } }
```

---

## Principles

- **Width-driven sizing.** Aspect ratio owns the height; radii/bezel/rim are % of width. Constrain width, never set height or a fixed-px radius.
- **Concentric corners.** Screen radius = outer − padding. Change the padding % → recompute the screen % so the rounds stay parallel.
- **Screenshot owns the glass.** No drawn device chrome; real screenshots read better.
- **One motion only.** A 3px hover lift, ease-out, reduced-motion-aware.
- **Unique `slotId` per frame** — drops persist by id; duplicates would overwrite each other.
- **Equal size in a row** — use a fixed-column grid.

---

## Plain-HTML/vanilla-JS port (this project)

This project (`Blackbelt update`) is static HTML + vanilla JS, not React, so the proportional-geometry logic above is ported as `design-system/reference/phone-frame.js` (same ResizeObserver-per-frame approach, ~80 lines, auto-boots like `slider.js`/`gold-burst.js`) instead of the JSX component. Markup:

```html
<div class="mtz-phone-frame">
  <div class="mtz-phone-screen">
    <img src="shot.png" style="width:100%;height:100%;object-fit:cover">
  </div>
</div>
<div class="mtz-phone-caption"><span class="num">1</span><span class="lbl">Teaser button</span></div>
```

Wrap frame + caption in `.mtz-phone-frame-wrap` (`display:flex;flex-direction:column;align-items:center`) when the frame's width is pinned narrower than its parent — see `kpibooster.html`'s "What you're getting" gallery, which fixes each frame to 300px (→ exactly 650px tall at the 9:19.5 ratio).
