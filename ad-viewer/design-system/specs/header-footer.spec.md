# Site header & footer — Replication guide

Canonical fixed header, copyright footer, and content column width for every
page on the Resources site. Worked out and battle-tested on `kpibooster.html`;
this is the authoritative spec — if a page ever drifts from this, the page
gets fixed, not the spec.

---

## Content column width

`kpibooster.html`'s content column is the locked, site-wide default for every
new and updated page's main content width — not the 900px `--wrap-max` token
used by the original `design-system/reference/index.html` handoff bundle.
That reference predates this pass and is stale on this one dimension; where
the two disagree on column width, `kpibooster.html` wins.

```css
.page { padding: var(--space-10) max(20px, calc(50% - 560px)) 96px; }
```

This is a **1120px effective centered column**, built with padding rather than
a boxed `max-width` + `margin: auto`: on viewports ≥ 1120px the side padding
is `calc(50% - 560px)`, holding the content at exactly 1120px; below that it
collapses to a flat `20px` gutter. Do not swap in `max-width: var(--wrap-max)`
(900px) + `margin: 0 auto` — it renders a visibly narrower column and was the
bug this fixed on `the-campaign-goldmine.html` and `campaign-launcher.html`.

On mobile (`max-width: 700px`), drop to a flat `16px` gutter, matching
`kpibooster.html`'s `.tool`/`.hero` mobile padding:

```css
@media (max-width: 700px) {
  .page { padding-left: 16px; padding-right: 16px; }
}
```

**Headline and supporting-text widths, within that column:**
- The H1 is unconstrained by default — let it run the full column width.
  Do not use a `max-width` hack to force the line break anymore (see next
  rule) — that was the old approach and is superseded.
- **If the H1's second clause is gold (`.accent`), it always starts on its
  own line — a hard `<br>` right before the `.accent` span, not a
  width-driven wrap.** This is deterministic regardless of viewport width or
  clause length, so it replaces the old "pick a max-width between first
  clause alone and first clause + next word" technique — don't guess a
  breakpoint width when a `<br>` says exactly what's meant. Applies whether
  the page builds the H1 in static markup (`<h1>Copy. <br><span
  class="accent">Accent copy.</span></h1>`) or in JS (insert a `<br>` node
  before appending the accent `<span>`, as `campaign-template.html` does).
- The supporting lede paragraph (`.hero-desc` / `.hero p`) is capped at
  `max-width: 900px` (raised from the original 760px — 760 was leaving a
  single-word orphan on the last line at full column width on more than one
  page) and gets `text-wrap: balance` (same property already used on
  `.nav-info`'s tooltip copy) so a lone trailing word can't happen
  regardless of copy length or viewport. This applies regardless of how wide
  the H1 above it is allowed to run.

---

## Header

### Structure

```html
<nav class="nav">
  <a href="/"><svg style="height:36px;width:auto;display:block;" viewBox="0 0 1587 430">...</svg></a>
  <span class="nav-sep" aria-hidden="true"></span>
  <span class="nav-link-wrap">
    <a class="nav-link" href="https://blackbelt.monetizr.com" aria-describedby="nav-blackbelt-info">Blackbelt</a>
    <div class="nav-info" id="nav-blackbelt-info" role="tooltip">
      <i class="licon icon-info" aria-hidden="true"></i>
      <span>Master gaming media buying. Get the frameworks, benchmarks, and strategies top brands use to plan smarter campaigns.</span>
    </div>
  </span>
</nav>
```

**The second nav item is always the "Blackbelt" link with this exact hover
tooltip — on every page, verbatim.** It is not a page title, not a
per-page label, and never gets swapped for anything else (e.g. a page name
like "Campaign Goldmine"). The whole nav — logo, separator, link, tooltip
copy — is one fixed unit; only the logo's link `href` may point to a
relative or absolute `/resources` depending on the page's existing
convention.

### The "Blackbelt" link + tooltip CSS

```css
.nav-link { font-size: 14px; font-weight: 700; color: var(--faint); text-decoration: none; letter-spacing: 0.06em; text-transform: uppercase; line-height: 1; }
.nav-link:hover { color: var(--accent); }
.nav-link-wrap { position: relative; display: inline-flex; align-items: center; }
.nav-info {
  position: absolute; top: calc(100% + 12px); left: 0; width: 575px; max-width: min(575px, calc(100vw - 40px));
  background: var(--surface-recessed); border: 1px solid var(--border-hairline); border-radius: var(--radius-sm);
  padding: var(--space-5) var(--space-6); font-size: var(--fs-lede); font-weight: 400; line-height: var(--lh-body); color: var(--muted);
  display: grid; grid-template-columns: auto 1fr; align-items: start; gap: var(--space-3);
  opacity: 0; transform: scale(0.96); transform-origin: top left; pointer-events: none; z-index: 20;
  transition: opacity var(--dur-base) ease, transform var(--dur-base) ease;
}
.nav-info .licon { font-size: 17px; margin-top: 5px; color: var(--muted); }
.nav-info span { min-width: 0; overflow-wrap: break-word; text-align: center; text-wrap: balance; }
.nav-info::after {
  content: ''; position: absolute; bottom: 100%; left: 14px; width: 0; height: 0;
  border: 5px solid transparent; border-bottom-color: var(--surface-recessed);
}
@media (hover:hover) and (pointer:fine) {
  .nav-link-wrap:hover .nav-info,
  .nav-link:focus-visible ~ .nav-info { opacity: 1; transform: scale(1); }
}
```

The tooltip's width is also clamped precisely in JS so it can never overflow
past the viewport's right edge on narrow windows (the CSS `max-width` above is
just the static fallback):

```js
(function () {
  var trigger = document.querySelector('.nav-link-wrap');
  var info = document.getElementById('nav-blackbelt-info');
  if (!trigger || !info) return;
  function clampWidth() {
    var rect = trigger.getBoundingClientRect();
    var margin = 20;
    var available = window.innerWidth - rect.left - margin;
    info.style.width = Math.max(240, Math.min(575, available)) + 'px';
  }
  trigger.addEventListener('mouseenter', clampWidth);
  trigger.addEventListener('focusin', clampWidth);
  window.addEventListener('resize', clampWidth);
  clampWidth();
})();
```

### The logo's viewBox must be cropped

The shipped logo SVG's `viewBox="0 0 3142 430"` has ~1555 units of dead
transparent space after the visible mark — confirmed via `convert -trim`, tight
bbox is `0 0 1587 430`. Always use `viewBox="0 0 1587 430"` (never the full
3142 width), or the logo silently eats ~50% of its own rendered box in blank
space, throwing off any gap/spacing math next to it.

### Positioning — `fixed`, not `sticky`

```css
.nav {
  padding: 20px 28px; display: flex; align-items: center; gap: var(--space-3);
  border-bottom: 1px solid var(--border-hairline);
  position: fixed; top: 0; left: 0; right: 0; z-index: 50;
  background: rgba(11,14,37,0.8);
  backdrop-filter: blur(12px) saturate(140%);
  -webkit-backdrop-filter: blur(12px) saturate(140%);
}
.nav-sep { width: 1px; height: 20px; background: var(--line-strong); flex-shrink: 0; }
```

**Do not use `position: sticky`.** It un-sticks once its containing block runs
out and visibly jumps near the bottom of tall pages. `fixed` is always
anchored to the viewport regardless of scroll position or document structure —
genuinely never moves.

`background` is the exact same navy as `--bg` (`rgba(11,14,37,x)`), not a
different/lighter tone — a header that's a *different* color than the page
looks like a separate floating bar; being the *same* color at less than full
opacity is what makes scrolled content visibly blur/tint underneath it
instead of just disappearing behind a solid-colored bar. `0.8` opacity (80%,
i.e. "4% transparent" territory, not 96%) is the tuned value — legible text,
still clearly translucent.

### Compensating for `position: fixed`

Fixed removes the nav from document flow, so page content needs to be pushed
down by its real height — and re-measured on resize, since the mobile
breakpoint shrinks the nav's padding/logo size:

```js
(function () {
  var nav = document.querySelector('.nav');
  if (!nav) return;
  function padForNav() {
    var h = nav.getBoundingClientRect().height;
    document.body.style.paddingTop = h + 'px';
    document.documentElement.style.setProperty('--kb-nav-h', h + 'px');
  }
  window.addEventListener('resize', padForNav);
  padForNav();
})();
```

Reset it in print: `@media print { body { padding-top: 0 !important; } }` (the
nav is hidden when printing anyway).

### Alerts anchor to the nav's real height, not a guessed px

The shared `.mtz-alert` component defaults to `top: 18px` — fine on a page
with no fixed header, wrong once one exists (it'll sit inside/behind the nav).
Override **per page**, scoped to `.mtz-alert` in that page's own stylesheet
(never edit the shared rule in `components.css` — other pages without a fixed
nav still need the default):

```css
.mtz-alert { top: calc(var(--kb-nav-h, 77px) / 2); transform: translate(-50%, calc(-50% - 12px)); }
.mtz-alert.visible { transform: translate(-50%, -50%); }
```

---

## Footer

### Copy & base style

```html
<div class="site-footer">© Monetizr. All rights reserved.</div>
```

```css
.site-footer { text-align: center; font-size: var(--fs-lede); color: var(--faint); }
```

`var(--fs-lede)` (16.5px) matches the hero lede paragraph size; `var(--faint)`
matches the nav link color (`.nav-link`) — same muted tone the header itself
uses, so header and footer read as one consistent chrome.

### The 40px / 20px rule

Every footer instance must sit **exactly 40px below the last real content
block above it, and exactly 20px above the true bottom of the page/panel it's
in** — regardless of whatever padding that container already happens to have.

**Check for inherited padding before setting a margin.** Containers on this
site frequently carry a "safe area" padding that was sized before a footer
existed (e.g. `.tool`'s `80px` bottom padding, `#results`'s `64px` bottom
padding). Stacking a `40px`/`20px` margin *on top of* that padding silently
produces 120px/84px gaps instead. Always check the container's actual
padding first, then set the footer's margin to **net out** to 40/20, not add
to it:

```css
/* .tool has padding-bottom: 80px already → net to 40px, not 120px */
#site-footer-pre { margin-top: -40px; margin-bottom: 20px; }

/* #results has padding-bottom: 64px already → net to 20px, not 84px */
#site-footer-results { margin-top: 40px; margin-bottom: -44px; }
```

If a page has only one footer instance and no pre-existing bottom padding on
its container, this is just `margin-top: 40px; margin-bottom: 20px;` — no
cancellation needed. Give every instance a unique `id` and verify the
container's padding-bottom before writing its margin.

### Multiple states, multiple instances

Pages with more than one visual state (e.g. a calculator's "before" and
"after" results) get **one footer instance per state**, each individually
following the 40/20 rule for its own container — not one footer that gets
repositioned via flex/JS trickery to chase a moving target. When a later
state becomes visible, hide the earlier state's footer entirely (not just its
text) so no empty reserved space is left behind:

```js
resultsEl.classList.add('visible');
document.getElementById('site-footer-pre').style.display = 'none';
```

---

## File map addition

This spec is referenced from the root `CLAUDE.md` and `design-system/CLAUDE.md`
golden rules — every page migration must include this header + footer
treatment as part of "getting it right," the same as tokens/motion/state-colors.
