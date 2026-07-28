# Monetizr Blackbelt — Design System

A dark navy + gold design system for **Monetizr**, an attention-based advertising platform that places brand creative inside opt-in, rewarded mobile-gameplay moments. This system was reverse-engineered from the **Blackbelt Resources** surface (`blackbelt.monetizr.com/resources`) — a library of tools and proof pages (Campaign Goldmine, Campaign Launcher, Attention Calculator, KPI Booster, Case Studies) built to move brand/media buyers from doubt to a booked call.

The whole system is deliberately small and cohesive: one accent color, one type family, one motion language, one primary action per page.

## Sources

- **Codebase:** `BLACKBELT-monetizr-resources-mockups/` (mounted local folder) — 7 HTML pages sharing one `styles.css`, plus a `DESIGN_AUDIT.md`. All tokens, components, and copy here are lifted verbatim from those files; nothing was invented.
- **Logos:** the official Monetizr white logo pack (horizontal, monogram, vertical) is in `assets/`. On this dark-navy Blackbelt surface only the **white** lockups are used.
- No Figma file or full brand kit was provided beyond the logos. See **Iconography** and **Caveats**.

---

## Content Fundamentals

**Voice: one doubt, one answer.** Every page headline is the reader's own objection written back to them as a *belief-gap question*, on its own line — "Has a brand like mine already tested gaming?", "Do we need new creative to enter gaming?", "What does this look like in practice?" A single supporting sentence follows; then one action.

**Rules observed across the source copy:**
- **Second person, direct.** "your pitch", "brands like mine", "before you commit budget". The reader is the subject.
- **Sentence case** everywhere except the uppercase gold kicker (Eyebrow) and table headers.
- **No emoji.** Iconography carries all visual signalling.
- **No fabricated numbers.** A metric appears only if it is traceable and named ("95.4% VCR — named result, not a platform average"). Cards without a sourced figure show none rather than an invented one. Averages and named/best results are always visually separated.
- **One primary ask per page.** Everything secondary is demoted to a quiet arrow-link ("Prefer to just talk it through? Book a fit-check call"). The audit explicitly flags competing CTAs as a defect.
- **Plain, confident, unhyped.** "nothing here is filler", "same video, new placement", "no new shoot". Short sentences. Em-dashes for asides.

**Vibe:** a sharp B2B media/agency pitch — precedent and proof over adjectives.

---

## Visual Foundations

- **Palette.** A dark navy surface stack — `#0b0e25` page, `#101635` elevated cards/panels/menus, `#080915` deepest (phone-screen gradients) — with a **single gold accent `#FEC902`** (Monetizr brand gold; hover `#ffd633`, 12%-opacity tint `--gold-soft` for fills/badges). Text is three tiers of cool off-white/slate (`#f5f6fa` / `#9aa1b9` / `#7e85a3`). No second accent, no gradients as decoration.
- **Type.** **Lato** only, from **900 (black)** display down to **300 (light)** stat captions. Display headline 38px/900/-0.02em with a gold-accented span; section headings 20px/700; card & panel titles 19px/700; hook question 19px/700; lede 16.5px muted; body 14.5px; kicker 12px/700 uppercase 0.12em gold; stat number 24px/900 gold. Monospace only inside mock-tool placeholders.
- **Layout.** One centered column, `max-width: 900px`, 28px gutters, 64px header. Everything that repeats (card grids, stat rows, phone gallery) is **CSS Grid with a fixed column count** — never flex-wrap with last-child border tricks — so uneven counts still land in clean rows (this was a documented bug fix).
- **Cards.** Elevated navy (`#101635`), 1px `rgba(255,255,255,.08)` hairline border, **12px** radius, 22px padding. On hover (fine pointers only): border shifts to gold at 35% and the card lifts `-2px`; the footer view-link turns gold and its arrow slides 3px. No drop shadow on cards — elevation is surface + border, not shadow.
- **Shadows.** Reserved for truly floating things: dropdown menu `0 16px 32px rgba(0,0,0,.4)`, phone frame `0 12px 30px rgba(0,0,0,.35)`, and the primary button's gold glow on hover.
- **Corner radii.** 6px tag · 8px button · 10px badge/table/mock · 12px card & dropdown menu · 14px panel & large badge · 26px phone · 100px filter pill · 50% logo mark.
- **Motion — one language.** Easing `cubic-bezier(0.23, 1, 0.32, 1)` (ease-out), durations under 200ms. Hover lifts `translateY(-2px)`; **press gives an immediate `scale(0.97)`**. Only transform / box-shadow / background / border animate. Arrows translate +3px on hover; chevrons rotate 180°. `prefers-reduced-motion` is honored everywhere (transforms drop, color transitions remain).
- **Transparency & blur.** Used only as low-opacity tints (`--gold-soft`, hairline borders, protection gradients over phone captions). No backdrop blur.
- **Imagery.** The source ships no photography or illustration. Campaign screenshots sit in iPhone 16-style **phone frames** (Dynamic Island, 19.5:9) with a bottom protection gradient; where a real screenshot is absent, the frame shows a cool navy gradient placeholder. Brand proof uses an initials badge, not a logo image (avoids a broken `<img>`), until a real mark exists.

---

## Iconography

- **System:** [Lucide Icons](https://tabler.io/icons), loaded as a **webfont via CDN** (`@tabler/icons-webfont`), used with `<i class="ti ti-<name>">`. Requires a network connection at page open.
- **Placement rule:** icons are **always inline beside text** — in kickers, card tags, buttons, captions, filter triggers, the footer — **never a large stacked tile over a heading.**
- **Sizing:** 12–14px inline, `vertical-align: -1px/-2px`, `currentColor` so they inherit the text tier they sit in.
- **No emoji. No unicode-glyph icons** except the literal `→` arrow used in links/labels (a deliberate typographic device, not an icon).
- The `Icon` component wraps this; every component that takes an `icon`/`tagIcon`/`captionIcon` prop expects a Lucide name **without** the `ti-` prefix.
- **CDN dependency flagged:** Lucide loads from jsDelivr. For offline/production use, self-host the webfont and update `tokens/fonts.css`.

---

## Index / Manifest

**Root**
- `styles.css` — global entry point (import lines only; consumers link this one file).
- `readme.md` — this file.
- `SKILL.md` — Agent-Skills-compatible entry.

**`tokens/`** (all `@import`ed by `styles.css`)
- `fonts.css` — Lato (Google Fonts) + Lucide icon webfont, both CDN.
- `colors.css` — navy surfaces, gold accent, text tiers, borders + semantic aliases.
- `typography.css` — Lato weights, type scale, line-heights, tracking.
- `spacing.css` — spacing scale, wrap width, gaps.
- `effects.css` — radii, borders, shadows, motion.
- `base.css` — reset, document defaults, base link + `.licon` rules.

**`components/`** — 14 reusable primitives (React, styled via CSS custom properties; interaction states in `components/interactions.css`):
- `buttons/` — **Button** (primary / secondary), **ArrowLink**
- `content/` — **Eyebrow**, **SectionHeading**, **Icon**, **NumberBadge**
- `cards/` — **Card**, **BrandCard**, **Panel**
- `data/` — **StatRow**, **Tag**, **DataTable**
- `controls/` — **FilterDropdown**, **Slider**, **EmailInput**, **DropdownField**, **HelpNote**
- `media/` — **PhoneFrame**

**`guidelines/`** — foundation specimen cards (Colors, Type, Spacing, Brand, Principles) plus **`principles.md`** — the design principles & thinking behind the system (web-specific; notes what does *not* carry over from the Monetizr deck system).

**`assets/`** — official Monetizr white logos: `logo-horizontal-white.png`, `logo-monogram-white.png`, `logo-vertical-white.png`.

**`ui_kits/Resources/`** — interactive recreation of Monetizr Resources: Resources Hub → Campaign Goldmine → Ford & Mercedes campaign example. Composed from the primitives above (`Chrome.jsx`, `ResourcesHub.jsx`, `Goldmine.jsx`, `CampaignExample.jsx`, `App.jsx`, `index.html`).

### Intentional additions
- **Icon** — a thin wrapper over the Lucide webfont. The source uses raw `<i class="ti …">`; the wrapper gives consumers a typed, prefix-free API while keeping the exact inline-icon behavior.

---

## Caveats

- **Logos are white-only here.** `assets/` holds the horizontal, monogram, and vertical white lockups; the navy Blackbelt surface uses white exclusively. Dark/color variants exist in the master Monetizr brand kit but are not used on this surface. Brand *proof* cards (BrandCard) still use an initials badge for third-party brands where no logo asset exists.
- **Fonts & icons load from CDN** (Google Fonts, jsDelivr). Pages need a network connection; self-host for offline/production.
- **No product photography or illustration** exists in the source; phone frames use gradient placeholders.
- The recreation covers 3 of the 7 source pages end-to-end (Hub, Goldmine, Campaign example); the other four (Launcher, Attention Calculator, KPI Booster, Case Studies) reuse the same primitives and are straightforward to add if wanted.
