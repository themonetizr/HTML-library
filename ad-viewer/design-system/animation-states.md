# Animation & interaction states

**One motion language across the whole site.** All values live as tokens in `tokens.css`; the
states below are implemented in `components.css`. Reproduce them exactly.

## Global constants
| Token | Value | Meaning |
|---|---|---|
| `--ease-out` | `cubic-bezier(0.23, 1, 0.32, 1)` | the only easing curve used |
| `--dur-fast` | `120ms` | |
| `--dur-base` | `160ms` | default transition |
| `--dur-slow` | `200ms` | card border/lift |
| `--press-scale` | `0.97` | immediate scale on `:active` |
| `--lift` | `-2px` | `translateY` on hover |

**Only these properties ever animate:** `transform`, `box-shadow`, `background`, `border-color`.
Never animate layout (width/height/top/left), never animate `color` for motion (color transitions
are allowed but instant-feeling at 160ms). No durations above 200ms anywhere.

## Per-component

**Card** (`.mtz-card`)
- Transition: `border-color 200ms ease-out, transform 200ms ease-out`.
- Hover (fine pointers only, `@media (hover:hover) and (pointer:fine)`): `border-color` → `--border-hover` (gold 55%), `transform: translateY(-2px)`.
- Inner footer link `.mtz-view-link`: on card hover its color → gold and its `.mtz-arrow` does `translateX(3px)` (180ms).
- No shadow at any state.

**Button — primary** (`.mtz-btn--primary`)
- Hover: `background` → `--accent-hover`, `translateY(-2px)`, `box-shadow: 0 8px 22px rgba(254,201,2,.35)` (gold glow). **Re-assert `color: var(--on-accent)` on hover** — these buttons are `<a>` elements, and the base `a:hover{color:accent-hover}` would otherwise turn the navy label light-gold on the light-gold fill and the text vanishes.
- Active: `scale(0.97)`, `box-shadow: 0 2px 8px rgba(254,201,2,.25)`, transition tightened to `transform 100ms`.
- **Click burst:** on every click, `gold-burst.js` emits ~28–40 gold particles from the button's 4 corners + 4 edge midpoints (outward velocity 0.5–1.9px, drag ~0.93/frame, life ~0.45–0.8s, solid for the first half then fades). Gold ramp only (`#FEC902 #F5D147 #ffdd5c #fff0b0`). Transient `pointer-events:none` canvas, no layout shift. Suppressed under reduced-motion.

**Button — secondary** (`.mtz-btn--secondary`)
- Hover: `border-color` + `color` → gold, `translateY(-2px)`.
- Active: `scale(0.97)`, `transform 100ms`.

**Arrow links** (`.mtz-arrow-link`, `.mtz-secondary-link`, and card `.mtz-view-link`)
- The trailing `.mtz-arrow` is `inline-block` with `transition: transform 180ms ease-out`.
- On hover of the link: text → gold (`--accent-hover` for arrow-link, `--accent` for the others) and arrow `translateX(3px)`.

**Tab pill** (`.bb-tab`)
- Transition: `background / color / border-color 160ms ease-out`.
- Hover: text → `--text`, border → gold. Selected (`[aria-selected="true"]`): solid gold fill, navy text, gold border. No transform.
- On click: the target screen replaces the visible one and the window scrolls to top instantly (`behavior:'instant'`). No cross-fade in the source.

**Filter dropdown trigger** (`.mtz-dropdown-trigger`)
- Hover: border → gold, `translateY(-1px)`. Active: `scale(0.97)`.
- Field variant (`--field`): static — only the hairline goes gold, **no** scale/lift.
- Chevron (`.mtz-chevron`): rotates 180° when the menu opens (`transition: transform 180ms ease-out`).
- Menu (if built): stays mounted; `.open` on the wrapper drives `opacity 0→1` + `translateY(-4px)→0` + `scale(0.98)→1`, transform-origin top-left, 180ms; `visibility` transitions too so the closed menu is inert.

**PhoneFrame** (`.mtz-phone-frame`)
- Transition: `transform 180ms var(--ease-out)`.
- Hover (fine pointers only, `@media (hover:hover) and (pointer:fine)`): `translateY(-3px)`. No shadow change, no scale.
- Geometry is not animated — it's static per render, recomputed by `phone-frame.js` (`ResizeObserver`) only when the frame's measured width actually changes (e.g. a breakpoint swap), not as a transition.

**Focus (keyboard only)** — one signal everywhere: `outline: 2px solid var(--accent); outline-offset: 2px`
on buttons, links, cards, tabs, dropdown triggers (`:focus-visible`).

## Reduced motion
`@media (prefers-reduced-motion: reduce)` (already in `components.css`): all `transform`s drop
(`transform: none !important`), transitions collapse to `background/color/border-color 160ms ease`.
Menus still appear/disappear, just without the slide/scale. Color feedback stays; movement goes.

## What is NOT animated
Page/screen changes do not cross-fade. Cards never shadow. Gold never transitions through other hues.
No parallax, no scroll-triggered reveals, no looping/idle animation anywhere on the surface.

**One deliberate exception: `404.html`.** The ASCII fighter loop (a 6-frame
front-kick cycle baked from `media/blackbelt-kick.gif`, see
`design-system/scripts/gif-to-ascii.py`) plays on an infinite loop for as long
as the page is open. This is an easter egg on a dead-end error page, not
product chrome — it does not set a precedent for looping/idle animation
anywhere else on the surface. Under `prefers-reduced-motion: reduce`, the loop
does not run at all; it renders a single static frame instead, consistent
with "movement stops" elsewhere in this doc.
