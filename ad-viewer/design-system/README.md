# Handoff — Monetizr Blackbelt Resources site

## Overview
The **Resources** surface of `blackbelt.monetizr.com` — a single-column library of tools and
proof pages that moves a brand/media buyer from doubt to a booked call. It is one page with a
sticky header + pill tab bar and **eight screens** switched in place: **Hub, Campaign Goldmine,
Case Studies, Campaign Launcher, Attention Calculator, KPI Booster, Custom Audiences, Video
Library.** One accent colour, one type family, one motion language, one primary action per screen.

## About the design files
The files in `reference/` are a **design reference built in plain HTML/CSS/JS** — a prototype that
shows the intended look, structure, copy, and interactions. They are **not** a drop-in export.
The task is to **recreate this design in the real site's codebase**, matching its existing plain
HTML/CSS/JS patterns, file layout, and routing. Where the real site already has a header, footer,
or router, reuse those — don't fork them; just match the visual + structural spec below.

Treat `reference/index.html` as the visual source of truth. Open it in a browser side-by-side with
your build and match it pixel for pixel. When something is ambiguous, the reference wins.

## Fidelity: **HIGH.**
Final colours, type, spacing, radii, and interactions. Recreate pixel-for-pixel using the tokens in
`reference/tokens.css`. Do **not** approximate values — every number here is intentional.

## Reference files (in this bundle)
- `reference/index.html` — all 8 screens, real markup, real copy, vanilla tab switching. **Open this first.**
- `reference/tokens.css` — every colour / type / spacing / radius / motion value, resolved, with real hex in comments. Copy this into the repo verbatim; it is the contract.
- `reference/components.css` — the `.mtz-*` component + interaction states (`:hover / :active / :focus`, reduced-motion). Base appearance is inline styles in `index.html`; this file is only what inline styles can't express.
- `reference/icons.js` — self-hosted Lucide icon subset (no CDN). `<i class="licon icon-NAME"></i>` upgrades to inline SVG. Add icons by pasting Lucide inner-SVG into the `PATHS` map.
- `reference/gold-burst.js` — the gold particle burst fired on every primary-button click. Auto-attaches to `.mtz-btn--primary`; honors reduced-motion; `data-no-burst` opts a button out.
- `reference/slider.js` — self-hosted single-thumb range Slider (budget pickers, numeric inputs). Auto-boots on `DOMContentLoaded` + `MutationObserver`; exposes `el.mtzSlider = {getValue, setValue, setPrefix, setSuffix, setEndLabels}`. Full spec: `specs/slider.spec.md`.
- `reference/phone-frame.js` — self-hosted PhoneFrame (iPhone 16-style bezel for campaign screenshots, `.mtz-phone-frame` + `.mtz-phone-screen`). Every geometric metric (outer radius, bezel padding, rim, screen radius) is computed as a % of the frame's measured width via `ResizeObserver`, so it stays correctly proportioned at any size — never set a fixed px radius on it. Auto-boots the same way as the other components. Full spec: `specs/phone-frame.spec.md`.
- `reference/assets/logo-horizontal-white.png` — Monetizr white horizontal logo (only white lockups are used on this dark surface).
- `specs/slider.spec.md` — original component spec for the Slider (props, states, animation, a11y).
- `specs/state-colors.spec.md` — original spec for the error/success/warning three-layer colour pattern.
- `../CLAUDE.md` — paste into the real repo root. Rules that keep future edits on-system.
- `../animation-states.md` — exact motion spec (durations, easing, transforms, per component).

---

## Design tokens
Full list with real hex is in `reference/tokens.css`. The essentials:

**Colour** — Surfaces stack by navy lightness (elevation is surface + border, *never* shadow):
`--bg #0b0e25` (page) · `--surface #111635` (cards/panels/menus) · `--surface-recessed #04091f`
(wells / tag chips / mock-tool placeholders). One accent: `--accent #FEC902` (gold), hover
`--accent-hover #F5D147`, 22%-tint `--accent-soft` for chips/badges. Text tiers:
`--text #f5f6fa` · `--muted #9aa1b9` · `--faint #7e85a3`. Borders: solid `--border #232743`,
hairline `--border-hairline rgba(255,255,255,.08)`, gold hover `--border-hover rgba(254,201,2,.55)`.
Pending/unverified metric red: `--error #ff5d5d`. **No second accent. No decorative gradients.**

**State colours** — `--error` (red, `#ff5d5d`) · `--success` (blue, `#2096F3`) · `--warning`
(shares the error red — no separate amber in the palette; distinguish caution from failure by
icon/copy, not colour). Each is expressed as **one three-layer pattern**: a solid stop (icon/text/
emphatic border) + a `.14`-alpha soft fill (`--error-soft` / `--success-soft` / `--warning-soft`,
container background) + a `.35`-alpha hairline (`--line-error` / `--line-success` / `--line-warning`,
the 1px edge). The soft fill and hairline are the *same* base colour at those two alphas and always
move together — never mix a fill from one hue with a border from another. Reference the semantic
role (`--error`, not `--error-500`) so meaning can be retargeted without touching a component. Full
spec: `specs/state-colors.spec.md`.

**Type** — **Lato only**, 300→900. Sizes: display 38px/900/-0.02em/lh1.12 · h2 20px/700 ·
card+panel title 19px/700 (hub & video card *titles* use 900) · hook question 19px/700 · lede
16.5px muted · stat number 24px/900 gold · body 14.5px · eyebrow 12px/700 uppercase 0.12em gold ·
tag 11px. Monospace (`--font-mono`) **only** inside mock-tool placeholders and unverified-metric labels.

**Spacing / layout** — one centered column `max-width:900px`, 28px gutters, header 64px.
Card grids gap 18px, stat columns gap 28px. Everything repeating is **CSS Grid with a fixed column
count** (2-col card grids, 3-col step/video grids) — never flex-wrap with border tricks.

**Radii** — tag 6px · button 8px · table/mock 10px · card 12px · panel 14px · pill (tab + filter) 100px.

**Shadows** — reserved for floating things only (dropdown menu, phone frame, button gold-glow on hover). Cards get none.

---

## Screens
All screens share the header (sticky, `rgba(11,14,37,.92)`, logo left + "RESOURCES" label right,
pill tab bar below) and the footer (top hairline, centered `© 2026 Monetizr · connect@monetizr.com`).
Each screen opens with an **Eyebrow** (gold uppercase kicker + inline icon), a **display H1** whose
second clause is wrapped in `<span style="color:var(--accent)">`, and a muted lede. Each ends with
**one capture Panel** (elevated navy, title + one-line body + one primary gold button; some add a
quiet secondary "Talk it through" arrow-link — never two competing primary CTAs).

1. **Hub** — eyebrow `layout-grid` "Resources Hub". H1 "Which question do you need answered *before you test gaming?*". "Choose your question" section label. **2-col grid of 6 cards**, each = tag pill (icon + label) · title (900) · **hook question** (19px/700) · body · footer view-link with sliding →. Cards are buttons that switch screens. Trailer line: "Prefer to watch? *Browse all 9 explainer videos →*".
2. **Campaign Goldmine** — eyebrow `search`. Right-aligned row of 3 **filter pills** (Industry/Format/Objective, each icon + chevron). Dashed **mock-tool well** for the results grid. "Platform performance baseline" **data table** (Metric / Average / Best; gold-900 in the Best column for named highs like 95.4%, 40%, +49%). Capture panel "Save your shortlist".
3. **Case Studies** — eyebrow `shield-check`. H1 with a `<br>` before the gold clause. **2-col grid of 7 result cards.** Two metric styles: **named** (18px/900 gold) vs **pending/unverified** (13px/700 red mono) — this distinction is load-bearing (no fabricated numbers). Each card has a "View case →" secondary button. Capture panel "Save the matched set".
4. **Campaign Launcher** — eyebrow `gamepad-2`. "How it works" **3-col grid of numbered step cards** (30px round number badge, title, body). Dashed mock-tool well. Secondary button "Preview my creative in-game →". Capture panel "Get your preview link".
5. **Attention Calculator** — eyebrow `chart-column`. Lede embeds two **mono source IDs** (`[PERF_A001]`, `[INDX001]`) in `--faint`. Dashed mock-tool well. Capture panel "Email this model to yourself".
6. **KPI Booster** — eyebrow `target`. Dashed mock-tool well. Secondary button "Estimate my reach →". Capture panel "Your results are ready".
7. **Custom Audiences** — eyebrow `layers`. **StatRow** (3 cols, gold-900 numbers: 2.8B / 40+ / 500+, with hairline top+bottom rules). "Available deals" heading. **2-col grid of 2 deal cards** (category kicker · title · body · keyword pills [recessed] · DSP pills [gold-soft, mono] · "View deal →"). Dashed mock-tool well describing the deal modal at `?deal=slug`. Capture panel "Not ready to activate yet?".
8. **Video Library** — eyebrow `play`. Two sections: "Brand examples" (3-col, 4 cards) and "Strategy & format explainers" (3-col, 5 cards). Cards are `<a target="_blank">` to real resource URLs (in `index.html`), tag + play icon, title (900), body, "Watch →". Capture panel "Seen enough to be curious?".

Exact copy for every headline, card, and button is in `reference/index.html` — copy it verbatim.

## Components (recreate these as reusable partials/functions)
- **Eyebrow** — `inline-flex` gold kicker, 12px/700 uppercase, 0.12em tracking, leading inline icon 13px.
- **Card** (`.mtz-card`) — elevated navy, 1px hairline, 12px radius, 22px pad. Hover (fine pointers): border → gold 35% + lift -2px; inner `.mtz-view-link` turns gold and its `.mtz-arrow` slides +3px. No shadow.
- **Button** (`.mtz-btn--primary` / `--secondary`) — primary = solid gold + navy text; secondary = gold outline + gold text. Hover lift -2px (+ gold glow on primary); `:active` scale(0.97).
- **Filter pill** (`.mtz-dropdown-trigger`) — surface pill, icon + label + chevron. Field variant: static press, only the hairline goes gold.
- **Panel** — elevated navy, 14px radius, 26px pad: title (19px/700) + one-line body (muted) + one primary button (+ optional secondary arrow-link).
- **StatRow** — grid, N columns, gold-900 number over muted 12px label, hairline top/bottom.
- **DataTable** (`.bb-tech-table`) — surface, 10px radius, recessed uppercase header row, hairline row rules, gold-900 for named-best figures.
- **Tag / keyword pill** — recessed 100px pill, 10.5px muted. **DSP pill** — gold-soft fill, gold mono text, 8px radius.
- **Removable Tag** (`.mtz-tag` / `.mtz-tag-remove`) — same recessed pill as the keyword tag, plus a trailing `×` remove control (13px, `--faint`, hover → `--text`). Used for multi-select chips (selected markets, filters) where the user needs to unpick one item without clearing the whole set.
- **Mock-tool well** (`.bb-mock`) — dashed border, recessed fill, mono `--faint` caption. Marks where a *live* interactive tool renders — keep as a placeholder unless wiring the real tool.
- **Slider** (`slider.js`, bare control — wrap in a `Card` for a budget-picker context) — 5px gold rail + fill, 18px gold thumb with a 4px `--surface` halo, floating value tooltip (`--surface-recessed` bg). Drag / click-track / keyboard all set the value; snaps to `step`, clamps to `[min, max]`. Full spec: `specs/slider.spec.md`.
- **Alert** (`.mtz-alert`, + `--error` / `--success` / `--warning` modifier) — fixed top-of-viewport banner: leading `licon`, message, the three-layer state-colour fill/border for its variant. Fades/slides in from the top, dismissible programmatically (e.g. auto-hides once the triggering condition — like "no market selected" — is resolved). This is the standard replacement for a native `alert()`.

## Interactions & behavior
- **Tab switch** — clicking a pill (or a hub card) shows that screen, updates `aria-selected`, and scrolls to top instantly. In the reference this is in-page state (`show(id)`); the real site may prefer URL routes (`/resources/goldmine`) — either is fine, keep the behavior identical.
- **One primary ask per screen.** Everything secondary is a quiet arrow-link. Never two competing CTAs.
- **Hover / press / focus / reduced-motion** — see `animation-states.md`.

## State
Minimal: which screen is active (tab). Filter dropdowns, the calculator slider, the upload tool, and
the deal modal (`?deal=slug`) are **existing live components** — left as dashed placeholders here;
wire to the real implementations, don't rebuild.

## Assets
- `logo-horizontal-white.png` — Monetizr white horizontal logo. Only white lockups on this dark surface.
- Icons — self-hosted Lucide subset (`icons.js`). Names used: layout-grid, search, shield-check,
  gamepad-2, chart-column, target, layers, play, grid-2x2, chevron-down, mail, calendar,
  mouse-pointer-click. **No emoji.** The literal `→` arrow is a typographic device, not an icon.
- Fonts — Lato via Google Fonts CDN (`tokens.css` / the `<link>` in `index.html`). Self-host for production.
