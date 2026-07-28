/* @ds-bundle: {"format":4,"namespace":"MonetizrBlackbeltDesignSystem_e1017f","components":[{"name":"ArrowLink","sourcePath":"components/buttons/ArrowLink.jsx"},{"name":"Button","sourcePath":"components/buttons/Button.jsx"},{"name":"BrandCard","sourcePath":"components/cards/BrandCard.jsx"},{"name":"Card","sourcePath":"components/cards/Card.jsx"},{"name":"Panel","sourcePath":"components/cards/Panel.jsx"},{"name":"Eyebrow","sourcePath":"components/content/Eyebrow.jsx"},{"name":"Icon","sourcePath":"components/content/Icon.jsx"},{"name":"NumberBadge","sourcePath":"components/content/NumberBadge.jsx"},{"name":"SectionHeading","sourcePath":"components/content/SectionHeading.jsx"},{"name":"DropdownField","sourcePath":"components/controls/DropdownField.jsx"},{"name":"EmailInput","sourcePath":"components/controls/EmailInput.jsx"},{"name":"FilterDropdown","sourcePath":"components/controls/FilterDropdown.jsx"},{"name":"HelpNote","sourcePath":"components/controls/HelpNote.jsx"},{"name":"Slider","sourcePath":"components/controls/Slider.jsx"},{"name":"DataTable","sourcePath":"components/data/DataTable.jsx"},{"name":"StatRow","sourcePath":"components/data/StatRow.jsx"},{"name":"Tag","sourcePath":"components/data/Tag.jsx"},{"name":"PhoneFrame","sourcePath":"components/media/PhoneFrame.jsx"}],"sourceHashes":{"assets/gold-burst.js":"03e8e8cd55c6","assets/icons.js":"c519f47dece1","assets/image-slot.js":"0394ad34f685","components/buttons/ArrowLink.jsx":"037a2c286034","components/buttons/Button.jsx":"5a3a98c25277","components/cards/BrandCard.jsx":"c30acb97be16","components/cards/Card.jsx":"01c06c841d0b","components/cards/Panel.jsx":"6b01fdb1460e","components/content/Eyebrow.jsx":"c1d233088c83","components/content/Icon.jsx":"9cce675f93f5","components/content/NumberBadge.jsx":"983fb09e5a3d","components/content/SectionHeading.jsx":"e1616054c2f7","components/controls/DropdownField.jsx":"4268d65fe788","components/controls/EmailInput.jsx":"c54c024f0974","components/controls/FilterDropdown.jsx":"e89588ce7fea","components/controls/HelpNote.jsx":"e258bf495262","components/controls/Slider.jsx":"0541f443ea4e","components/data/DataTable.jsx":"a72cec10701e","components/data/StatRow.jsx":"0b468776f1e0","components/data/Tag.jsx":"dcf392585714","components/media/PhoneFrame.jsx":"a99ec78ab337","resources-mockups/reveal.js":"9d2eed930d2f","ui_kits/Resources/App.jsx":"5998b9bb035e","ui_kits/Resources/CampaignExample.jsx":"e2ccb2858339","ui_kits/Resources/Chrome.jsx":"25d2ddf878a2","ui_kits/Resources/Goldmine.jsx":"2f39a4318544","ui_kits/Resources/ResourcesHub.jsx":"b1875309e19f"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.MonetizrBlackbeltDesignSystem_e1017f = window.MonetizrBlackbeltDesignSystem_e1017f || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// assets/gold-burst.js
try { (() => {
/* ==========================================================================
   Monetizr Blackbelt — gold click-burst ("confetti" micro-celebration)
   --------------------------------------------------------------------------
   A canvas particle burst that fires from the perimeter of a GOLD-FILLED
   button on click — the one exception to "motion is never decorative": a
   primary CTA is the single act-now moment per surface, so its click earns a
   half-second of gold sparkle. Secondary / outline / disabled buttons never
   burst.

   Self-hosted, framework-agnostic, zero-dependency — same "system brain"
   philosophy as assets/icons.js (no CDN, nothing to go stale).

   ── Usage ────────────────────────────────────────────────────────────────
   1. Load once per page (after your content is on the page, or before — it
      auto-attaches via event delegation):
        <script src="assets/gold-burst.js"></script>
      Every click on a `.mtz-btn--primary` (that isn't [disabled]) then bursts
      automatically. That's it for plain-HTML surfaces.
   2. Manual / React use — fire it yourself from any handler:
        Blackbelt.goldBurst(buttonEl)
      (the React <Button variant="primary"> wires this in its onClick).
   3. Opt out on a specific gold button: add `data-no-burst`.

   ── Spec (set in stone) ────────────────────────────────────────────────────
   • Trigger .... pointer/keyboard click on a gold-filled (primary) button only.
   • Emitters ... the button's 4 corners (diagonal-out) + 4 edge midpoints
                  (straight-out) — particles hug and leave the perimeter.
   • Count ...... ~28–40 particles per burst (corners 4–6, sides 2–6).
   • Palette .... gold ramp only — #FEC902 · #F5D147 · #ffdd5c · #fff0b0.
                  No off-gold colours ever (stays inside the locked accent).
   • Motion ..... outward velocity 0.5–1.9px, drag ~0.93/frame, life ~26–48
                  frames (~0.45–0.8s). Solid for the first half of life, then
                  fades; shrinks slightly as it travels. Ease is the physics.
   • Canvas ..... transient, 60px pad around the button, pointer-events:none,
                  z-index above the button; removed when the last particle dies.
   • Guards ..... honours prefers-reduced-motion (no burst); coalesces rapid
                  clicks onto one canvas; DPR-aware; never shifts layout.
   ========================================================================== */
(function () {
  var GOLDS = ['#FEC902', '#F5D147', '#ffdd5c', '#fff0b0'];
  var PAD = 60;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function burst(btn) {
    if (!btn || reduce) return;
    if (btn.hasAttribute('disabled') || btn.getAttribute('aria-disabled') === 'true') return;
    if (btn.hasAttribute('data-no-burst')) return;
    var r = btn.getBoundingClientRect();
    if (!r.width || !r.height) return;

    // The button needs a positioned host so the canvas can overlay it exactly.
    var host = btn.parentElement;
    var hostPos = getComputedStyle(host).position;
    var canvas, state;

    // Reuse a live canvas on the same button (coalesce rapid clicks).
    if (btn.__burst && btn.__burst.canvas.isConnected) {
      state = btn.__burst;
      canvas = state.canvas;
    } else {
      canvas = document.createElement('canvas');
      canvas.style.cssText = 'position:absolute;pointer-events:none;z-index:5;';
      // Anchor relative to the button's offset within its host.
      var wrap = document.createElement('span');
      // Insert canvas as a sibling positioned over the button.
      state = {
        canvas: canvas,
        particles: [],
        raf: null,
        btn: btn
      };
      btn.__burst = state;
      // Overlay strategy: fixed-position canvas in <body> tracking the button
      // rect — robust regardless of host positioning/overflow.
      canvas.style.position = 'fixed';
      canvas.style.left = r.left - PAD + 'px';
      canvas.style.top = r.top - PAD + 'px';
      document.body.appendChild(canvas);
    }
    var dpr = window.devicePixelRatio || 1;
    var w = r.width + PAD * 2,
      h = r.height + PAD * 2;
    canvas.style.left = r.left - PAD + 'px';
    canvas.style.top = r.top - PAD + 'px';
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    state.cw = w;
    state.ch = h;
    emit(state, r.width, r.height);
    if (!state.raf) tick(state);
  }
  function emit(state, bw, bh) {
    var left = PAD,
      top = PAD,
      w = bw,
      h = bh;
    var emitters = [{
      x: left,
      y: top,
      dx: -1,
      dy: -1,
      jx: 14,
      jy: 14
    }, {
      x: left + w,
      y: top,
      dx: 1,
      dy: -1,
      jx: 14,
      jy: 14
    }, {
      x: left + w,
      y: top + h,
      dx: 1,
      dy: 1,
      jx: 14,
      jy: 14
    }, {
      x: left,
      y: top + h,
      dx: -1,
      dy: 1,
      jx: 14,
      jy: 14
    }, {
      x: left,
      y: top + h / 2,
      dx: -1,
      dy: 0,
      jx: 0,
      jy: h * 0.35
    }, {
      x: left + w,
      y: top + h / 2,
      dx: 1,
      dy: 0,
      jx: 0,
      jy: h * 0.35
    }, {
      x: left + w / 2,
      y: top,
      dx: 0,
      dy: -1,
      jx: w * 0.42,
      jy: 0,
      few: true
    }, {
      x: left + w / 2,
      y: top + h,
      dx: 0,
      dy: 1,
      jx: w * 0.42,
      jy: 0,
      few: true
    }];
    for (var e = 0; e < emitters.length; e++) {
      var c = emitters[e];
      var n = c.few ? 2 + (Math.random() * 2 | 0) : 4 + (Math.random() * 3 | 0);
      var base = Math.atan2(c.dy, c.dx);
      for (var i = 0; i < n; i++) {
        var ang = base + (Math.random() - 0.5) * 1.9;
        var speed = 0.5 + Math.random() * 1.4;
        var ox = c.dx === 0 ? c.x + (Math.random() - 0.5) * 2 * c.jx : c.x - c.dx * Math.random() * c.jx;
        var oy = c.dy === 0 ? c.y + (Math.random() - 0.5) * 2 * c.jy : c.y - c.dy * Math.random() * c.jy;
        state.particles.push({
          x: ox,
          y: oy,
          vx: Math.cos(ang) * speed,
          vy: Math.sin(ang) * speed,
          life: 0,
          maxLife: 26 + Math.random() * 22,
          size: 0.6 + Math.random() * 1.4,
          color: GOLDS[Math.random() * GOLDS.length | 0],
          drag: 0.92 + Math.random() * 0.04
        });
      }
    }
  }
  function tick(state) {
    var canvas = state.canvas;
    if (!canvas || !canvas.isConnected) {
      state.raf = null;
      return;
    }
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, state.cw, state.ch);
    var alive = [];
    for (var i = 0; i < state.particles.length; i++) {
      var p = state.particles[i];
      p.life++;
      p.vx *= p.drag;
      p.vy *= p.drag;
      p.x += p.vx;
      p.y += p.vy;
      var t = p.life / p.maxLife;
      if (t >= 1) continue;
      var a = t < 0.5 ? 1 : 1 - (t - 0.5) / 0.5;
      ctx.beginPath();
      ctx.fillStyle = p.color;
      ctx.globalAlpha = a;
      ctx.arc(p.x, p.y, p.size * (1 - t * 0.4), 0, Math.PI * 2);
      ctx.fill();
      alive.push(p);
    }
    ctx.globalAlpha = 1;
    state.particles = alive;
    if (state.particles.length) {
      state.raf = requestAnimationFrame(function () {
        tick(state);
      });
    } else {
      ctx.clearRect(0, 0, state.cw, state.ch);
      state.raf = null;
      if (state.btn) state.btn.__burst = null;
      canvas.remove();
    }
  }

  // Auto-attach: any click that lands on (or inside) a gold-filled button bursts.
  // Matches both the component class (.mtz-btn--primary) and the reference-page
  // specimen class (.btn-primary). Add data-no-burst to opt a button out.
  var SEL = '.mtz-btn--primary, .btn-primary';
  document.addEventListener('click', function (ev) {
    var btn = ev.target.closest && ev.target.closest(SEL);
    if (btn) burst(btn);
  }, true);
  window.Blackbelt = window.Blackbelt || {};
  window.Blackbelt.goldBurst = burst;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "assets/gold-burst.js", error: String((e && e.message) || e) }); }

// assets/icons.js
try { (() => {
/* ==========================================================================
   Monetizr Blackbelt — icon library ("system brain")
   --------------------------------------------------------------------------
   A curated, SELF-HOSTED set of Lucide icons. No CDN, no webfont — the glyphs
   are inline SVG path data baked into this one small file, so icons keep
   rendering even if the Lucide site is down, rate-limited, or a version is
   pulled. We deliberately ship ONLY the icons the system uses (not all 1000+)
   so nothing is bloated.

   ── Usage ────────────────────────────────────────────────────────────────
   1. Load once per page (before your content script):
        <script src="assets/icons.js"></script>
   2. Write an icon anywhere as:
        <i class="licon icon-search"></i>      (matches the old webfont markup)
        <i data-licon="search"></i>            (equivalent, explicit)
      On load, each is upgraded in place to an inline <svg>. Dynamically added
      icons: call  Blackbelt.icons.render(rootEl)  after inserting them, or
      Blackbelt.icons.svg('search')  to get the SVG markup string directly.
   3. Colour + size come from the surrounding text (currentColor, 1em) — style
      the parent, e.g.  .btn-primary .licon{font-size:14px}.

   ── Adding a new icon (the ONLY step to extend the library) ────────────────
   Copy the inner markup of the icon from lucide.dev (the bit INSIDE the
   <svg>…</svg>, i.e. the <path>/<circle>/<rect> elements) and add one line to
   the PATHS map below, keyed by the lucide name. That's it — kebab-case name in,
   `<i class="licon icon-that-name">` works everywhere. Keep them alphabetical.
   ========================================================================== */
(function () {
  // Inner SVG markup for each icon (Lucide 24×24, 2px round stroke).
  var PATHS = {
    'arrow-left': '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    'arrow-up-down': '<path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/>',
    'ban': '<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>',
    'building-2': '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>',
    'calendar': '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
    'case-sensitive': '<path d="M3 15V9a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v6"/><path d="M3 12h4"/><path d="M14 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path d="M17 9v6"/>',
    'chart-column': '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
    'check': '<path d="M20 6 9 17l-5-5"/>',
    'chevron-down': '<path d="m6 9 6 6 6-6"/>',
    'circle-alert': '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
    'circle-check': '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    'coins': '<circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/>',
    'component': '<path d="M15.536 11.293a1 1 0 0 0 0 1.414l2.376 2.377a1 1 0 0 0 1.414 0l2.377-2.377a1 1 0 0 0 0-1.414l-2.377-2.377a1 1 0 0 0-1.414 0z"/><path d="M2.297 11.293a1 1 0 0 0 0 1.414l2.377 2.377a1 1 0 0 0 1.414 0l2.377-2.377a1 1 0 0 0 0-1.414L6.088 8.916a1 1 0 0 0-1.414 0z"/><path d="M8.916 17.912a1 1 0 0 0 0 1.415l2.377 2.376a1 1 0 0 0 1.414 0l2.377-2.376a1 1 0 0 0 0-1.415l-2.377-2.376a1 1 0 0 0-1.414 0z"/><path d="M8.916 4.674a1 1 0 0 0 0 1.414l2.377 2.377a1 1 0 0 0 1.414 0l2.377-2.377a1 1 0 0 0 0-1.414l-2.377-2.377a1 1 0 0 0-1.414 0z"/>',
    'contrast': '<circle cx="12" cy="12" r="10"/><path d="M12 18a6 6 0 0 0 0-12v12z"/>',
    'diamond': '<path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41L13.7 2.71a2.41 2.41 0 0 0-3.41 0z"/>',
    'eye': '<path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0"/><circle cx="12" cy="12" r="3"/>',
    'gamepad-2': '<line x1="6" x2="10" y1="11" y2="11"/><line x1="8" x2="8" y1="9" y2="13"/><line x1="15" x2="15.01" y1="12" y2="12"/><line x1="18" x2="18.01" y1="10" y2="10"/><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.544-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"/>',
    'gift': '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>',
    'globe': '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
    'grid-2x2': '<path d="M12 3v18"/><path d="M3 12h18"/><rect x="3" y="3" width="18" height="18" rx="2"/>',
    'hash': '<line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/>',
    'layers': '<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/>',
    'layout-grid': '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
    'list-checks': '<path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>',
    'lock': '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    'mail': '<path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/>',
    'message-square': '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    'mouse-pointer-click': '<path d="M14 4.1 12 6"/><path d="m5.1 8-2.9-.8"/><path d="m6 12-1.9 2"/><path d="M7.2 2.2 8 5.1"/><path d="M9.037 9.69a.498.498 0 0 1 .653-.653l11 4.5a.5.5 0 0 1-.074.949l-4.349 1.041a1 1 0 0 0-.74.739l-1.04 4.35a.5.5 0 0 1-.95.074z"/>',
    'palette': '<circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>',
    'play': '<path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"/>',
    'search': '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.34-4.34"/>',
    'shield-check': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    'siren': '<path d="M7 18v-6a5 5 0 1 1 10 0v6"/><path d="M5 21a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1z"/><path d="M21 21a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1h-1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1z"/><path d="M11 4v-1a1 1 0 1 1 2 0v1"/><path d="M4.5 10.5 3 9"/><path d="m21 9-1.5 1.5"/>',
    'smartphone': '<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>',
    'square-stack': '<path d="M4 10c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2"/><path d="M10 16c-1.1 0-2-.9-2-2v-4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2"/><rect width="8" height="8" x="14" y="14" rx="2"/>',
    'target': '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    'triangle-alert': '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    'type': '<path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/>',
    'upload': '<path d="M12 3v12"/><path d="m17 8-5-5-5 5"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>',
    'user': '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    'zap': '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>'
  };
  function svg(name) {
    var inner = PATHS[name];
    if (!inner) {
      if (window.console) console.warn('[Blackbelt.icons] no icon named "' + name + '" — add it to assets/icons.js');
      return '';
    }
    return '<svg class="licon-svg" viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + inner + '</svg>';
  }
  function nameOf(el) {
    var d = el.getAttribute('data-licon');
    if (d) return d;
    var m = (el.className || '').match(/icon-([a-z0-9-]+)/);
    return m ? m[1] : null;
  }
  function render(root) {
    var scope = root || document;
    var nodes = scope.querySelectorAll('i.licon, [data-licon]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.querySelector('svg')) continue; // already upgraded
      var n = nameOf(el);
      if (n) el.innerHTML = svg(n);
    }
  }
  window.Blackbelt = window.Blackbelt || {};
  window.Blackbelt.icons = {
    paths: PATHS,
    svg: svg,
    render: render
  };

  // Inject minimal sizing once (inline svg inherits colour via currentColor).
  function injectCSS() {
    if (document.getElementById('blackbelt-icon-css')) return;
    var s = document.createElement('style');
    s.id = 'blackbelt-icon-css';
    s.textContent = 'i.licon,[data-licon]{display:inline-flex;align-items:center;justify-content:center;line-height:0}i.licon .licon-svg,[data-licon] .licon-svg{width:1em;height:1em;vertical-align:-.14em}';
    document.head.appendChild(s);
  }

  // React (and any late DOM) inject <i class="licon …"> AFTER load — a
  // MutationObserver upgrades them the moment they appear, so components never
  // need to know this file exists; they just emit the same <i> markup.
  function watch() {
    if (!window.MutationObserver) return;
    var mo = new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var added = muts[i].addedNodes;
        for (var j = 0; j < added.length; j++) {
          var n = added[j];
          if (n.nodeType !== 1) continue;
          if (n.matches && n.matches('i.licon, [data-licon]')) {
            if (!n.querySelector('svg')) {
              var nm = nameOf(n);
              if (nm) n.innerHTML = svg(nm);
            }
          }
          if (n.querySelectorAll) render(n);
        }
      }
    });
    mo.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  function boot() {
    injectCSS();
    render();
    watch();
  }
  if (document.readyState !== 'loading') boot();else document.addEventListener('DOMContentLoaded', boot);
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "assets/icons.js", error: String((e && e.message) || e) }); }

// assets/image-slot.js
try { (() => {
// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)
// Copied omelette starter. Re-running copy_starter_component with this kind overwrites this file with the latest version (page content is unaffected).
/* BEGIN USAGE */
/**
 * <image-slot> — user-fillable image placeholder.
 *
 * Drop this into a deck, mockup, or page wherever a design needs an image.
 * You control the slot's shape; it sizes to its container by default. When the search_stock_photos tool
 * is available, prefill the slot by default — write the photo's URL into
 * src (with credit/credit-href); the user can still fill or replace it
 * by dragging an image file onto it (or clicking to browse). The dropped
 * image persists across reloads via a .image-slots.state.json sidecar —
 * same read-via-fetch / write-via-window.omelette pattern as
 * design_canvas.jsx, so the filled slot shows on share links, downloaded
 * zips, and PPTX export. Outside the omelette runtime the slot is read-only.
 *
 * The sidecar is a SIBLING of the HTML file that uses this component: the
 * read is a document-relative fetch, and the host resolves the bridge's
 * sidecar writes into the previewed file's directory to match (same
 * contract as design_canvas.jsx). Pages in the same directory share one
 * sidecar; keep slot ids distinct across them.
 *
 * Attributes:
 *   id           Persistence key. REQUIRED for the drop to survive reload —
 *                every slot on the page needs a distinct id.
 *   shape        'rect' | 'rounded' | 'circle' | 'pill'   (default 'rounded')
 *                'circle' applies 50% border-radius; on a non-square slot
 *                that's an ellipse — set equal width and height for a true
 *                circle.
 *   radius       Corner radius in px for 'rounded'.       (default 12)
 *   mask         Any CSS clip-path value. Overrides `shape` — use this for
 *                hexagons, blobs, arbitrary polygons.
 *   fit          Initial framing baseline: cover | contain.   (default 'cover')
 *                cover starts the image filling the frame (overflow cropped);
 *                contain starts it fully visible (letterboxed). Either way the
 *                user can always pan/scale from there — double-click, or the
 *                Edit control, enters reframe mode (drag to move, scroll or
 *                corner-handles to scale; Escape / click-out commits). The
 *                crop persists alongside the image in the sidecar.
 *   placeholder  Empty-state caption.                      (default 'Drop an image')
 *   src          Optional initial/fallback image URL. Prefill it with a real
 *                photo via search_stock_photos when that tool is available
 *                (set credit/credit-href from the result). A user drop
 *                overrides it; clearing the drop reveals src again.
 *   credit       Attribution text shown as a small overlay at the
 *                bottom-left of the filled slot. REQUIRED whenever src
 *                points at any Unsplash host (images.unsplash.com,
 *                plus.unsplash.com, …): an Unsplash src with no credit
 *                renders an error tile INSTEAD of the photo (Unsplash
 *                terms forbid showing their photos unattributed). Use the
 *                exact form 'Photo by {photographer name} on Unsplash' —
 *                the overlay then links the name to credit-href and
 *                'Unsplash' to the Unsplash homepage, and links back to
 *                unsplash.com automatically get the required utm referral
 *                params appended at render time. The credit belongs to
 *                the src image, so it only shows while src is what's
 *                displayed — a user-dropped image hides it.
 *   credit-href  Link for the photographer's name in the credit overlay
 *                (their Unsplash profile URL from the stock-photo search
 *                results). http(s) URLs only — anything else renders the
 *                name as plain text.
 *
 * Sizing: the slot fills its container by default (width/height 100%).
 * Put it in a sized wrapper — absolutely positioned, a grid cell, a fixed
 * frame — and it takes exactly that box. When the parent's height is
 * indefinite (ordinary flow), it falls back to full width at a 3:2 aspect
 * ratio instead of collapsing. In a shrink-to-fit parent (a float,
 * width:max-content, an unsized absolute wrapper), percentages have
 * nothing to resolve against — size the slot or its wrapper explicitly
 * there. For a fixed-size slot, set
 * width/height on the element itself (inline style), which overrides the
 * default. When
 * layering content above a slot (full-bleed layouts), make the overlay
 * click-through — pointer-events: none on scrims/text plates, re-enabled
 * on interactive children — so the slot's hover controls stay reachable.
 * Keep the slot's bottom-left corner visually clear as well: the credit
 * overlay renders there, and a dark fade or text plate covering it hides
 * the attribution Unsplash's terms require — end the fade above that
 * corner, or keep it nearly transparent where the credit sits.
 *
 * Usage:
 *   <div style="position:relative;width:100%;height:100%">      <!-- full-bleed: -->
 *     <image-slot id="bg" shape="rect"></image-slot>            <!-- fills the wrapper -->
 *   </div>
 *   <image-slot id="hero"   style="width:800px;height:450px" shape="rounded" radius="20"
 *               placeholder="Drop a hero image"></image-slot>
 *   <image-slot id="avatar" style="width:120px;height:120px" shape="circle"></image-slot>
 *   <image-slot id="kite"   style="width:300px;height:300px"
 *               mask="polygon(50% 0, 100% 50%, 50% 100%, 0 50%)"></image-slot>
 */
/* END USAGE */

(() => {
  const STATE_FILE = '.image-slots.state.json';

  // Unsplash terms require visible attribution wherever their photos
  // display, and every link back to unsplash.com must carry utm referral
  // params. Two render-time rules enforce that here:
  //  - an Unsplash-src slot with NO credit attribute renders an error
  //    tile INSTEAD of the photo (an uncredited Unsplash photo on screen
  //    is itself the terms violation, so it never renders bare);
  //  - rendered credit links pointing at unsplash.com get the referral
  //    params appended when absent (credit-href values live in page
  //    content that can't be edited after the fact).
  // Keep the utm_source value in sync with UTM_SOURCE in
  // platform/web-agent/unsplash.ts — this file is a project-local
  // artifact and cannot import it (equality is pinned by tests).
  const UNSPLASH_HOMEPAGE_HREF = 'https://unsplash.com/?utm_source=claude_design&utm_medium=referral';
  // Host rule mirrors the hotlink validator that admits Unsplash srcs into
  // pages in the first place (cdn$ in unsplash.ts: apex or any subdomain)
  // — Unsplash+ results serve from plus.unsplash.com, not just images.*,
  // and an admitted-but-uncredited photo must error whatever unsplash
  // host it rides on.
  // Trailing-dot FQDNs (images.unsplash.com.) are the same host to the
  // browser but would miss the regex — strip one dot so the check fails
  // CLOSED (unrecognized-but-real Unsplash srcs must error, not render).
  const isUnsplashHost = u => {
    try {
      return /(^|\.)unsplash\.com$/.test(new URL(u, document.baseURI).hostname.replace(/\.$/, ''));
    } catch {
      return false;
    }
  };
  // Render-time referral normalization for links back to Unsplash:
  // appends utm_source/utm_medium when absent, preserves every existing
  // query param, never overwrites an existing utm_source, and passes
  // non-Unsplash URLs through untouched. Input is an ABSOLUTE validated
  // http(s) URL (the credit render funnel resolves + validates first).
  const withReferral = href => {
    try {
      const u = new URL(href);
      if (!/(^|\.)unsplash\.com$/.test(u.hostname.replace(/\.$/, ''))) {
        return href;
      }
      if (!u.searchParams.has('utm_source')) {
        u.searchParams.set('utm_source', 'claude_design');
      }
      if (!u.searchParams.has('utm_medium')) {
        u.searchParams.set('utm_medium', 'referral');
      }
      return u.toString();
    } catch (e) {
      return href;
    }
  };
  // 2× a ~600px slot in a 1920-wide deck — retina-sharp without making the
  // sidecar enormous. A 1200px WebP at q=0.85 is ~150-300KB.
  const MAX_DIM = 1200;
  // Raster formats only. SVG is excluded (can carry script; createImageBitmap
  // on SVG blobs is inconsistent). GIF is excluded because the canvas
  // re-encode keeps only the first frame, so an animated GIF would silently
  // go still — better to reject than surprise.
  const ACCEPT = ['image/png', 'image/jpeg', 'image/webp', 'image/avif'];

  // ── Shared sidecar store ────────────────────────────────────────────────
  // One fetch + immediate write-on-change for every <image-slot> on the
  // page. Reads via fetch() so viewing works anywhere the HTML and sidecar
  // are served together; writes go through window.omelette.writeFile, which
  // the host allowlists to *.state.json basenames only.
  const subs = new Set();
  let slots = {};
  // ids explicitly cleared before the sidecar fetch resolved — otherwise
  // the merge below can't tell "never set" from "just deleted" and would
  // resurrect the sidecar's stale value.
  const tombstones = new Set();
  let loaded = false;
  let loadP = null;
  function load() {
    if (loadP) return loadP;
    loadP = fetch(STATE_FILE).then(r => r.ok ? r.json() : null).then(j => {
      // Merge: sidecar loses to any in-memory change that raced ahead of
      // the fetch (drop or clear) so neither is clobbered by hydration.
      if (j && typeof j === 'object') {
        const merged = Object.assign({}, j, slots);
        // A framing-only write that raced ahead of hydration must not
        // drop a user image that's only on disk — inherit u from the
        // sidecar for any in-memory entry that lacks one.
        for (const k in slots) {
          if (merged[k] && !merged[k].u && j[k]) {
            merged[k].u = typeof j[k] === 'string' ? j[k] : j[k].u;
          }
        }
        for (const id of tombstones) delete merged[id];
        slots = merged;
      }
      tombstones.clear();
    }).catch(() => {}).then(() => {
      loaded = true;
      subs.forEach(fn => fn());
    });
    return loadP;
  }

  // Serialize writes so two near-simultaneous drops on different slots
  // can't reorder at the backend and leave the sidecar with only the
  // first. A save requested mid-flight just marks dirty and re-fires on
  // completion with the then-current slots.
  let saving = false;
  let saveDirty = false;
  // Unload-time flush: save()'s serialization defers a mid-RTT re-fire to a
  // .then that never runs in an unloading document, silently dropping a
  // pagehide commit. Post the current slots immediately instead — content
  // is a superset snapshot of any in-flight save's, the write is a
  // whole-file last-writer-wins replace, and postMessage FIFO delivers it
  // to the host after the in-flight one, so a backend-side reorder at
  // worst reproduces the dropped-commit outcome this flush improves on.
  // Guarded on the initial sidecar read: pre-hydration slots can miss
  // other slots' persisted entries, and flushing it would clobber them —
  // that narrow case stays best-effort (the in-memory merge in load()
  // cannot happen in an unloading document anyway).
  function flushNow() {
    if (!loaded) return;
    const w = window.omelette && window.omelette.writeFile;
    if (!w) return;
    try {
      Promise.resolve(w(STATE_FILE, JSON.stringify(slots))).catch(() => {});
    } catch (e) {}
  }
  function save() {
    if (saving) {
      saveDirty = true;
      return;
    }
    const w = window.omelette && window.omelette.writeFile;
    if (!w) return;
    saving = true;
    Promise.resolve(w(STATE_FILE, JSON.stringify(slots))).catch(() => {}).then(() => {
      saving = false;
      if (saveDirty) {
        saveDirty = false;
        save();
      }
    });
  }
  const S_MAX = 5;
  const clampS = s => Math.max(1, Math.min(S_MAX, s));

  // Normalize a stored slot value. Pre-reframe sidecars stored a bare
  // data-URL string; newer ones store {u, s, x, y}. Either shape is valid.
  function getSlot(id) {
    const v = slots[id];
    if (!v) return null;
    return typeof v === 'string' ? {
      u: v,
      s: 1,
      x: 0,
      y: 0
    } : v;
  }
  function setSlot(id, val) {
    if (!id) return;
    if (val) {
      slots[id] = val;
      tombstones.delete(id);
    } else {
      delete slots[id];
      if (!loaded) tombstones.add(id);
    }
    subs.forEach(fn => fn());
    // A drop is rare + high-value — write immediately so nav-away can't lose
    // it. Gate on the initial read so we don't overwrite a sidecar we haven't
    // merged yet; the merge in load() keeps this change once the read lands.
    if (loaded) save();else load().then(save);
  }

  // ── Image downscale ─────────────────────────────────────────────────────
  // Encode through a canvas so the sidecar carries resized bytes, not the
  // raw upload. Longest side is capped at 2× the slot's rendered width
  // (retina) and at MAX_DIM. WebP keeps alpha and is ~10× smaller than PNG
  // for photos, so there's no need for per-image format picking.
  async function toDataUrl(file, targetW) {
    const bitmap = await createImageBitmap(file);
    try {
      const cap = Math.min(MAX_DIM, Math.max(1, Math.round(targetW * 2)) || MAX_DIM);
      const scale = Math.min(1, cap / Math.max(bitmap.width, bitmap.height));
      const w = Math.max(1, Math.round(bitmap.width * scale));
      const h = Math.max(1, Math.round(bitmap.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(bitmap, 0, 0, w, h);
      return canvas.toDataURL('image/webp', 0.85);
    } finally {
      bitmap.close && bitmap.close();
    }
  }

  // ── Custom element ──────────────────────────────────────────────────────
  const stylesheet =
  // Fill the container by default: slots are usually placed inside a
  // sized wrapper (a hero frame, a grid cell, an inset:0 layer) and are
  // expected to take that box — a fixed intrinsic size would render as
  // a small tile in the corner of a full-bleed wrapper instead.
  // aspect-ratio is the companion fallback that keeps a bare slot
  // visible when the parent's height is indefinite: height:100%
  // resolves to auto there, and the ratio then derives height from
  // width instead of letting the slot collapse to zero height.
  // Explicit width/height on the element override all of this.
  ':host{display:block;position:relative;' + '  font:13px/1.3 system-ui,-apple-system,sans-serif;color:rgba(0,0,0,.55);' + '  width:100%;height:100%;aspect-ratio:3/2}' + '.frame{position:absolute;inset:0;overflow:hidden;background:rgba(0,0,0,.04)}' +
  // .frame img (clipped) and .spill (unclipped ghost + handles) share the
  // same left/top/width/height in frame-%, computed by _applyView(), so the
  // inside-mask crop and the outside-mask spill stay pixel-aligned.
  '.frame img{position:absolute;max-width:none;transform:translate(-50%,-50%);' + '  -webkit-user-drag:none;user-select:none;touch-action:none}' +
  // Reframe mode (double-click): the full image spills past the mask. The
  // spill layer is sized to the IMAGE bounds so its corners are where the
  // resize handles belong. The ghost <img> inside is translucent; the real
  // clipped <img> underneath shows the opaque in-mask crop.
  // popover=manual promotes the spill to the top layer on reframe, so it is
  // not clipped by any overflow:hidden / clip-path / scroll-container
  // ancestor (a plain z-index can't escape overflow clipping). UA popover
  // defaults (inset:0;margin:auto) are reset; _applyView sets viewport px.
  '.spill{position:fixed;margin:0;inset:auto;border:0;padding:0;background:transparent;' + '  overflow:visible;transform:translate(-50%,-50%);z-index:1;cursor:grab;touch-action:none}' + ':host([data-panning]) .spill{cursor:grabbing}' + '.spill .ghost{position:absolute;inset:0;width:100%;height:100%;opacity:.35;' + '  pointer-events:none;-webkit-user-drag:none;user-select:none;' + '  box-shadow:0 0 0 1px rgba(0,0,0,.2),0 12px 32px rgba(0,0,0,.2)}' + '.spill .handle{position:absolute;width:12px;height:12px;border-radius:50%;' + '  background:#fff;box-shadow:0 0 0 1.5px #c96442,0 1px 3px rgba(0,0,0,.3);' + '  transform:translate(-50%,-50%)}' + '.spill .handle[data-c=nw]{left:0;top:0;cursor:nwse-resize}' + '.spill .handle[data-c=ne]{left:100%;top:0;cursor:nesw-resize}' + '.spill .handle[data-c=sw]{left:0;top:100%;cursor:nesw-resize}' + '.spill .handle[data-c=se]{left:100%;top:100%;cursor:nwse-resize}' + ':host([data-reframe]){z-index:10}' + ':host([data-reframe]) .frame{box-shadow:0 0 0 2px #c96442}' + '.empty{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;' + '  justify-content:center;gap:6px;text-align:center;padding:12px;box-sizing:border-box;' + '  cursor:pointer;user-select:none}' + '.empty svg{opacity:.45}' + '.empty .cap{max-width:90%;font-weight:500;letter-spacing:.01em}' + '.empty .sub{font-size:11px}' + '.empty .sub u{text-underline-offset:2px;text-decoration-color:rgba(0,0,0,.25)}' + '.empty:hover .sub u{color:rgba(0,0,0,.75);text-decoration-color:currentColor}' + ':host([data-over]) .frame{outline:2px solid #c96442;outline-offset:-2px;' + '  background:rgba(201,100,66,.10)}' + '.ring{position:absolute;inset:0;pointer-events:none;border:1.5px dashed rgba(0,0,0,.25);' + '  transition:border-color .12s}' + ':host([data-over]) .ring{border-color:#c96442}' + ':host([data-filled]) .ring{display:none}' +
  // Controls overlay INSIDE the frame, pinned to the top-right corner, so
  // a full-bleed slot in an overflow:hidden container still shows them
  // (the old below-mask placement got clipped). Credit sits bottom-left,
  // so top-right avoids collision. The blurred pill background keeps them
  // legible over the image.
  // The UA [popover] base rule styles the element in EVERY state (only
  // display:none is gated on :not(:popover-open), and the display:flex
  // below overrides that) — so the UA resets live HERE, like .spill's,
  // or the ordinary hover-state strip renders as a bordered Canvas box
  // centered by margin:auto. inset:auto precedes top/right (shorthand).
  '.ctl{position:absolute;inset:auto;top:8px;right:8px;margin:0;border:0;padding:0;' + '  background:transparent;overflow:visible;' + '  display:flex;gap:6px;opacity:0;pointer-events:none;transition:opacity .12s;z-index:2;' + '  white-space:nowrap}' +
  // While reframing, the spill owns the top layer and would swallow every
  // click on the in-frame controls. Promoting .ctl into the top layer
  // ABOVE the spill (shown after it — later popovers stack higher) keeps
  // Edit-as-toggle and Replace clickable mid-reframe. _applyView pins it
  // to the frame's top-right in viewport px (translateX(-100%)
  // right-aligns against the computed left edge); inset:auto clears the
  // base rule's top/right so the inline left/top position it alone.
  '.ctl:popover-open{position:fixed;inset:auto;transform:translateX(-100%)}' + ':host([data-filled][data-editable]:hover) .ctl,:host([data-reframe]) .ctl' + '  {opacity:1;pointer-events:auto}' + '.ctl button{appearance:none;border:0;border-radius:6px;padding:5px 10px;cursor:pointer;' + '  background:rgba(0,0,0,.65);color:#fff;font:11px/1 system-ui,-apple-system,sans-serif;' + '  backdrop-filter:blur(6px)}' + '.ctl button:hover{background:rgba(0,0,0,.8)}' + '.err{position:absolute;left:8px;bottom:8px;right:8px;color:#b3261e;font-size:11px;' + '  background:rgba(255,255,255,.85);padding:4px 6px;border-radius:5px;pointer-events:none}' +
  // Replacement in flight: after a src swap the browser keeps painting
  // the PREVIOUS image until the new one decodes, so a Replace would
  // flash the old photo and then pop. Hide the stale frame (visibility,
  // not display — _applyView geometry still applies) and spin until the
  // new image reports in (load/error clears data-swapping).
  ':host([data-swapping]) .frame img{visibility:hidden}' + '.loading{position:absolute;inset:0;display:none;align-items:center;' + '  justify-content:center;pointer-events:none}' + ':host([data-swapping]) .loading{display:flex}' + '.loading::after{content:"";width:22px;height:22px;border-radius:50%;' + '  border:2px solid rgba(0,0,0,.12);border-top-color:rgba(0,0,0,.45);' + '  animation:om-slot-spin .7s linear infinite}' + '@keyframes om-slot-spin{to{transform:rotate(360deg)}}' +
  // Reduced motion: the static two-tone ring still reads as "working".
  '@media (prefers-reduced-motion:reduce){.loading::after{animation:none}}' + '.credit{position:absolute;left:6px;bottom:6px;max-width:calc(100% - 12px);display:none;' + '  padding:3px 7px;border-radius:5px;background:rgba(0,0,0,.55);color:#fff;' + '  font:10px/1.2 system-ui,-apple-system,sans-serif;text-decoration:none;' + '  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;backdrop-filter:blur(6px)}' +
  // The credit is a SPAN holding one or two <a>s (Unsplash's prescribed
  // form links the photographer AND Unsplash) — anchors style inline so
  // the overlay reads as one line of text.
  '.credit a{color:inherit;text-decoration:none}' + '.credit a:hover,.credit a:focus-visible{text-decoration:underline}' + ':host([data-filled][data-credit]) .credit{display:block}' +
  // Exports must ship JUST the image — no hover controls, no credit chip
  // (the host marks <html data-om-exporting> for the capture window; the
  // page-level hide script can't reach shadow DOM, this rule can).
  ':host-context([data-om-exporting]) .ctl,' + ':host-context([data-om-exporting]) .credit{display:none !important}' +
  // No export-window mask rules here on purpose: the export capture
  // releases the replacement mask by REMOVING data-swapping (the
  // shadow-root pass in pages/export/shared.ts HIDE_EXPORT_CHROME_SCRIPT)
  // — attribute removal works in every engine (:host-context is
  // Chromium-only), is scoped by construction to slots actually
  // mid-swap, and hides the spinner through the same gate. A masked img
  // would otherwise be silently dropped from PPTX decks (the capture
  // walk skips visibility:hidden imgs).
  // Attribution error tile: REPLACES the photo when an Unsplash src has
  // no credit attribute — rendering the photo uncredited is the terms
  // violation, so the photo must not appear at all.
  // Calm and neutral on purpose (review feedback): the tile informs the
  // user; the fix instructions are machine-facing (usage docblock, tool
  // description, and the turn-end scan's bounce copy name the attributes
  // for the agent).
  '.attr-error{position:absolute;inset:0;display:none;flex-direction:column;align-items:center;' + '  justify-content:center;gap:6px;text-align:center;padding:12px;box-sizing:border-box;' + '  background:#f2f1ef;color:#6e6c66;user-select:none;' + '  font:13px/1.45 system-ui,-apple-system,sans-serif}' + '.attr-error svg{opacity:.55}' + '.attr-error .cap{max-width:92%;font-weight:500;letter-spacing:.01em}' + ':host([data-attribution-error]) .attr-error{display:flex}' + ':host([data-attribution-error]) .ring{display:none}';
  const icon = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' + 'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>' + '<path d="m21 15-5-5L5 21"/></svg>';
  const warnIcon = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' + 'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + '<path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/>' + '<path d="M12 9v4"/><path d="M12 17h.01"/></svg>';
  class ImageSlot extends HTMLElement {
    static get observedAttributes() {
      return ['shape', 'radius', 'mask', 'fit', 'placeholder', 'src', 'id', 'credit', 'credit-href'];
    }

    /** Duplicate-slide hook (called by deck-stage, see its
     *  _remintDuplicateIds): copy this id's stored image, if any, under a
     *  freshly minted key and return that key — so a duplicated slide's
     *  slot keeps its dropped photo instead of reverting to the
     *  placeholder. 'isFree' is the caller's uniqueness check (document
     *  ids); candidates must ALSO be unused in the sidecar, which can
     *  hold keys from other pages sharing the project root. (An EMPTY
     *  slot on another page leaves no sidecar entry, so its id is not
     *  detectable here — a minted key can collide with it and that slot
     *  would show this photo. Same blast radius as two pages reusing an
     *  id by hand, which the shared sidecar already permits.) Returns null
     *  when no id could be minted (caller strips the id, today's
     *  behavior). */
    static cloneSlot(fromId, isFree) {
      if (typeof fromId !== 'string' || !fromId) return null;
      // Pre-hydration the store can't veto candidates or source the copy
      // — degrade to the strip (today's behavior) rather than mint
      // against keys we can't see yet. Any rendered (= droppable) slot
      // means load() has already settled.
      if (!loaded) return null;
      const stem = fromId.replace(/-\d+$/, '') || fromId;
      for (let n = 2; n < 100; n++) {
        const toId = stem + '-' + n;
        if (toId === fromId) continue;
        if (slots[toId] !== undefined) {
          // Reuse a key holding this exact value (bytes AND crop) if no
          // live element here owns it — a duplicate op the host refused
          // after minting leaves such a key behind, and reusing keeps
          // refused retries from accumulating one orphaned copy per
          // attempt. Full equality (not just bytes) so a byte-identical
          // key another PAGE owns with its own crop is stepped past, not
          // adopted or rewritten. (Entries without .u never match.)
          const prev = getSlot(toId);
          const cur = getSlot(fromId);
          if (!(prev && cur && prev.u && prev.u === cur.u && prev.s === cur.s && prev.x === cur.x && prev.y === cur.y && (typeof isFree !== 'function' || isFree(toId)))) continue;
          return toId;
        }
        if (typeof isFree === 'function' && !isFree(toId)) continue;
        const v = getSlot(fromId);
        if (v) setSlot(toId, Object.assign({}, v));
        return toId;
      }
      return null;
    }
    constructor() {
      super();
      // clonable: rail thumbnails deep-clone slides and carry this shadow
      // along; reuse an already-cloned root so upgrade-after-clone works.
      // (Deliberately NOT serializable — a getHTML consumer would embed
      // multi-MB sidecar data-URLs into serialized page HTML.)
      const root = this.shadowRoot || this.attachShadow({
        mode: 'open',
        clonable: true
      });
      // .spill and .ctl sit OUTSIDE .frame so overflow:hidden + border-radius
      // on the frame (circle, pill, rounded) can't clip them.
      root.innerHTML = '<style>' + stylesheet + '</style>' + '<div class="frame" part="frame">' + '  <img part="image" alt="" draggable="false" style="display:none">' + '  <div class="empty" part="empty">' + icon + '    <div class="cap"></div>' + '    <div class="sub">or <u>browse files</u></div></div>' + '  <div class="attr-error" part="attribution-error">' + warnIcon + '    <div class="cap">This photo needs attribution</div></div>' + '  <div class="loading" part="loading"></div>' + '  <div class="ring" part="ring"></div>' + '</div>' +
      // Outside .frame, like .spill/.ctl — the frame's overflow:hidden +
      // border-radius/clip-path would cut the credit off on circle/pill/mask.
      // A SPAN, not an <a>: the prescribed Unsplash credit holds two links
      // (photographer + Unsplash), built per-render in _render().
      '<span class="credit" part="credit"></span>' + '<div class="spill" popover="manual" data-dc-edit-transparent>' + '  <img class="ghost" alt="" draggable="false">' + '  <div class="handle" data-c="nw"></div><div class="handle" data-c="ne"></div>' + '  <div class="handle" data-c="sw"></div><div class="handle" data-c="se"></div>' + '</div>' +
      // data-dc-edit-transparent: the DC editor's edit-mode picker lets
      // clicks through for chrome marked with it (EDIT_TRANSPARENT_SEL)
      // — without it, Replace/Edit clicks in Edit mode are swallowed by
      // element selection and the controls look dead.
      '<div class="ctl" popover="manual" data-dc-edit-transparent><button data-act="replace" title="Replace image">Replace</button>' + '  <button data-act="edit" title="Reframe image">Edit</button></div>' + '<input type="file" accept="' + ACCEPT.join(',') + '" hidden>';
      this._frame = root.querySelector('.frame');
      this._ring = root.querySelector('.ring');
      this._img = root.querySelector('.frame img');
      this._empty = root.querySelector('.empty');
      this._cap = root.querySelector('.cap');
      this._sub = root.querySelector('.sub');
      this._spill = root.querySelector('.spill');
      this._ctl = root.querySelector('.ctl');
      this._credit = root.querySelector('.credit');
      this._attrError = root.querySelector('.attr-error');
      // Credit clicks open the link, not browse/reframe.
      this._credit.addEventListener('click', e => e.stopPropagation());
      this._credit.addEventListener('dblclick', e => e.stopPropagation());
      this._ghost = root.querySelector('.ghost');
      this._err = null;
      this._input = root.querySelector('input');
      this._depth = 0;
      this._gen = 0;
      // Encode-in-flight marker (the owning _ingest generation): while set,
      // the same-src "nothing in flight" clear in _render must not fire —
      // the stored value still points at the OLD image until the encode
      // lands, so that clear would unmask the stale image mid-replace.
      this._swapGen = 0;
      // Render-owned swap in flight: set when _render assigns a new src,
      // cleared only by the img's own load/error (or the empty branch).
      // img.complete CANNOT stand in for this — setting src only QUEUES
      // the current-request swap (a microtask), so synchronously after an
      // assignment, complete still reports the OLD settled request. The
      // pick path does exactly that: the host sets src, credit, and
      // credit-href back-to-back in one task, and renders #2/#3 would
      // read the stale complete === true and drop the mask one render
      // after it was set.
      this._loadPending = false;
      // See _render's empty branch: a transient attribution-error wipe of a
      // showing image must make the follow-up render a replacement (spinner),
      // not a first fill (blank frame).
      this._hidShowing = false;
      this._view = {
        s: 1,
        x: 0,
        y: 0
      };
      this._subFn = () => this._render();
      // Shadow-DOM listeners live with the shadow DOM — bound once here so
      // disconnect/reconnect (e.g. React remount) doesn't stack handlers.
      this._empty.addEventListener('click', () => this._input.click());
      root.addEventListener('click', e => {
        const act = e.target && e.target.getAttribute && e.target.getAttribute('data-act');
        if (!act) return;
        // The hidden controls are opacity-0 but still tabbable — without
        // this gate a keyboard user could drive them on a read-only share
        // link (mirrors the dblclick handler's editable gate).
        if (!this.hasAttribute('data-editable')) return;
        if (act === 'replace') {
          this._exitReframe(true);
          // Host-owned picker (Unsplash modal; it also offers local import).
          this.dispatchEvent(new CustomEvent('image-slot:pick', {
            bubbles: true,
            composed: true,
            detail: {
              id: this.id || null
            }
          }));
        }
        if (act === 'edit') {
          if (!this._reframes()) return;
          if (this.hasAttribute('data-reframe')) this._exitReframe(true);else this._enterReframe();
        }
      });
      this._input.addEventListener('change', () => {
        const f = this._input.files && this._input.files[0];
        if (f) this._ingest(f);
        this._input.value = '';
      });
      // naturalWidth/Height aren't known until load — re-apply so the cover
      // baseline is computed from real dimensions, not the 100%×100% fallback.
      // load/error also release the replacement-in-flight mask (via the
      // single discipline in _releaseMask): the swap is only revealed once
      // the new image can actually paint (on error the frame shows its
      // background, same as a fresh slot with a broken src).
      this._img.addEventListener('load', () => {
        this._loadPending = false;
        this._releaseMask(true);
        this._applyView();
      });
      this._img.addEventListener('error', () => {
        this._loadPending = false;
        this._releaseMask(true);
      });
      // Gated only on editable — any filled slot can be repositioned/scaled,
      // regardless of fit. Share links (no writeFile) stay static.
      this.addEventListener('dblclick', e => {
        if (!this.hasAttribute('data-editable') || !this._reframes()) return;
        e.preventDefault();
        if (this.hasAttribute('data-reframe')) this._exitReframe(true);else this._enterReframe();
      });
      // Pan + resize both originate on the spill layer. A handle pointerdown
      // drives an aspect-locked resize anchored at the opposite corner; any
      // other pointerdown on the spill pans. Offsets are frame-% so a
      // reframed slot survives responsive resize / PPTX export.
      this._spill.addEventListener('pointerdown', e => {
        if (e.button !== 0 || !this.hasAttribute('data-reframe')) return;
        e.preventDefault();
        e.stopPropagation();
        this._spill.setPointerCapture(e.pointerId);
        const rect = this.getBoundingClientRect();
        const fw = rect.width || 1,
          fh = rect.height || 1;
        const corner = e.target.getAttribute && e.target.getAttribute('data-c');
        let move;
        if (corner) {
          // Resize about the OPPOSITE corner. Viewport-px throughout (rect
          // fw/fh, not clientWidth) so the math survives a transform:scale()
          // ancestor — deck_stage renders slides scaled-to-fit.
          const iw = this._img.naturalWidth || 1,
            ih = this._img.naturalHeight || 1;
          const contain = (this.getAttribute('fit') || 'cover').toLowerCase() === 'contain';
          const base = contain ? Math.min(fw / iw, fh / ih) : Math.max(fw / iw, fh / ih);
          const sx = corner.includes('e') ? 1 : -1;
          const sy = corner.includes('s') ? 1 : -1;
          const s0 = this._view.s;
          const w0 = iw * base * s0,
            h0 = ih * base * s0;
          const cx0 = (50 + this._view.x) / 100 * fw;
          const cy0 = (50 + this._view.y) / 100 * fh;
          const ox = cx0 - sx * w0 / 2,
            oy = cy0 - sy * h0 / 2;
          const diag0 = Math.hypot(w0, h0);
          const ux = sx * w0 / diag0,
            uy = sy * h0 / diag0;
          move = ev => {
            const proj = (ev.clientX - rect.left - ox) * ux + (ev.clientY - rect.top - oy) * uy;
            const s = clampS(s0 * proj / diag0);
            const d = diag0 * s / s0;
            this._view.s = s;
            this._view.x = (ox + ux * d / 2) / fw * 100 - 50;
            this._view.y = (oy + uy * d / 2) / fh * 100 - 50;
            this._clampView();
            this._applyView();
          };
        } else {
          this.setAttribute('data-panning', '');
          const start = {
            px: e.clientX,
            py: e.clientY,
            x: this._view.x,
            y: this._view.y
          };
          move = ev => {
            this._view.x = start.x + (ev.clientX - start.px) / fw * 100;
            this._view.y = start.y + (ev.clientY - start.py) / fh * 100;
            this._clampView();
            this._applyView();
          };
        }
        const up = () => {
          try {
            this._spill.releasePointerCapture(e.pointerId);
          } catch {}
          this._spill.removeEventListener('pointermove', move);
          this._spill.removeEventListener('pointerup', up);
          this._spill.removeEventListener('pointercancel', up);
          this.removeAttribute('data-panning');
          this._dragUp = null;
        };
        // Stashed so _exitReframe (Escape / outside-click mid-drag) can
        // tear the capture + listeners down synchronously.
        this._dragUp = up;
        this._spill.addEventListener('pointermove', move);
        this._spill.addEventListener('pointerup', up);
        this._spill.addEventListener('pointercancel', up);
      });
      // Wheel zoom stays available inside reframe mode as a trackpad nicety —
      // zooms toward the cursor (offset' = cursor·(1-k) + offset·k).
      this.addEventListener('wheel', e => {
        if (!this.hasAttribute('data-reframe')) return;
        e.preventDefault();
        const r = this.getBoundingClientRect();
        const cx = (e.clientX - r.left) / r.width * 100 - 50;
        const cy = (e.clientY - r.top) / r.height * 100 - 50;
        const prev = this._view.s;
        const next = clampS(prev * Math.pow(1.0015, -e.deltaY));
        if (next === prev) return;
        const k = next / prev;
        this._view.s = next;
        this._view.x = cx * (1 - k) + this._view.x * k;
        this._view.y = cy * (1 - k) + this._view.y * k;
        this._clampView();
        this._applyView();
      }, {
        passive: false
      });
    }
    connectedCallback() {
      // Warn once per page — an id-less slot works for the session but
      // cannot persist, and two id-less slots would share nothing.
      if (!this.id && !ImageSlot._warned) {
        ImageSlot._warned = true;
        console.warn('<image-slot> without an id will not persist its dropped image.');
      }
      this.addEventListener('dragenter', this);
      this.addEventListener('dragover', this);
      this.addEventListener('dragleave', this);
      this.addEventListener('drop', this);
      subs.add(this._subFn);
      // The host may inject window.omelette.writeFile AFTER the first render;
      // re-render on hover so the editable-gated controls reliably appear.
      this.addEventListener('pointerenter', this._subFn);
      // width%/height% in _applyView encode the frame aspect at call time —
      // a host resize (responsive grid, pane divider) would stretch the
      // image until the next _render. Re-render on size change: _render()
      // re-seeds _view from stored before clamp/apply, so a shrink→grow
      // cycle round-trips instead of ratcheting x/y toward the narrower
      // frame's clamp range.
      this._ro = new ResizeObserver(() => this._render());
      this._ro.observe(this);
      load();
      this._render();
    }
    disconnectedCallback() {
      subs.delete(this._subFn);
      this.removeEventListener('pointerenter', this._subFn);
      this.removeEventListener('dragenter', this);
      this.removeEventListener('dragover', this);
      this.removeEventListener('dragleave', this);
      this.removeEventListener('drop', this);
      if (this._ro) {
        this._ro.disconnect();
        this._ro = null;
      }
      // commit=false: a disconnect is not a user intent — committing here
      // would persist whatever half-finished drag a React remount or DOM
      // splice happened to interrupt. Deliberate exits commit on their own
      // paths (Escape/click-out/toggle), and unloads commit via pagehide.
      this._exitReframe(false);
    }
    _enterReframe() {
      if (this.hasAttribute('data-reframe')) return;
      this.setAttribute('data-reframe', '');
      this._signalReframe(true);
      // Best-effort commit when the document unloads mid-reframe (a host
      // navigation racing the enter signal, a manual reload, tab close):
      // the sidecar write rides the host bridge, which outlives this
      // document, so the crop survives even though the mode dies with the
      // DOM. Held on the instance so _exitReframe detaches exactly what
      // was attached.
      this._pagehide = () => {
        this._exitReframe(true);
        flushNow();
      };
      window.addEventListener('pagehide', this._pagehide);
      // Promote spill to the top layer, then keep it pinned over the frame:
      // scroll/resize cover the common cases, and a per-frame rect check
      // catches layout shifts that fire neither (an image above finishing
      // load, streamed DOM pushing the slot down, an ancestor transform
      // change) so the overlay can't detach from the frame.
      try {
        this._spill.showPopover();
      } catch {}
      // After the spill, so the controls stack above it in the top layer.
      try {
        this._ctl.showPopover();
      } catch {}
      this._reposition = () => {
        if (this.hasAttribute('data-reframe')) this._applyView();
      };
      window.addEventListener('scroll', this._reposition, true);
      window.addEventListener('resize', this._reposition);
      this._lastRect = '';
      this._watch = () => {
        if (!this.hasAttribute('data-reframe')) return;
        const r = this.getBoundingClientRect();
        const key = r.left + ',' + r.top + ',' + r.width + ',' + r.height;
        if (key !== this._lastRect) {
          this._lastRect = key;
          this._applyView();
        }
        this._watchId = requestAnimationFrame(this._watch);
      };
      this._watchId = requestAnimationFrame(this._watch);
      this._applyView();
      // Close on click outside (the spill handler stopPropagation()s so
      // in-image drags don't reach this) and on Escape. Listeners are held
      // on the instance so _exitReframe / disconnectedCallback can detach
      // exactly what was attached.
      this._outside = e => {
        if (e.composedPath && e.composedPath().includes(this)) return;
        this._exitReframe(true);
      };
      this._esc = e => {
        if (e.key === 'Escape') this._exitReframe(true);
      };
      document.addEventListener('pointerdown', this._outside, true);
      document.addEventListener('keydown', this._esc, true);
    }
    _exitReframe(commit) {
      if (!this.hasAttribute('data-reframe')) return;
      if (this._dragUp) this._dragUp();
      this.removeAttribute('data-reframe');
      this.removeAttribute('data-panning');
      if (this._outside) document.removeEventListener('pointerdown', this._outside, true);
      if (this._esc) document.removeEventListener('keydown', this._esc, true);
      this._outside = this._esc = null;
      if (this._reposition) {
        window.removeEventListener('scroll', this._reposition, true);
        window.removeEventListener('resize', this._reposition);
        this._reposition = null;
      }
      if (this._watchId) {
        cancelAnimationFrame(this._watchId);
        this._watchId = 0;
      }
      if (this._pagehide) {
        window.removeEventListener('pagehide', this._pagehide);
        this._pagehide = null;
      }
      try {
        this._spill.hidePopover();
      } catch {}
      try {
        this._ctl.hidePopover();
      } catch {}
      this._ctl.style.left = '';
      this._ctl.style.top = '';
      if (commit) this._commitView();
      this._signalReframe(false);
    }

    // Reframe state lives only in this DOM until commit, invisible to the
    // host's dirty signals — announce enter/exit so the host can hold
    // auto-reloads for exactly the gesture (the guest bundle forwards
    // image-slot:reframe to the host as imageSlotReframe). Dispatched on
    // the element (composed, so it escapes shadow roots) while connected;
    // a disconnected exit (disconnectedCallback) falls back to document so
    // the host still hears it.
    _signalReframe(active) {
      const target = this.isConnected ? this : document;
      target.dispatchEvent(new CustomEvent('image-slot:reframe', {
        bubbles: true,
        composed: true,
        detail: {
          active: active,
          id: this.id || null
        }
      }));
    }

    // Public: host's "Import from computer" calls this to run local browse.
    openFilePicker() {
      this._exitReframe(true);
      this._input.click();
    }
    attributeChangedCallback() {
      if (this.shadowRoot) this._render();
    }

    // handleEvent — one listener object for all four drag events keeps the
    // add/remove symmetric and the depth counter correct.
    handleEvent(e) {
      if (e.type === 'dragenter' || e.type === 'dragover') {
        // Without preventDefault the browser never fires 'drop'.
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
        if (e.type === 'dragenter') this._depth++;
        this.setAttribute('data-over', '');
      } else if (e.type === 'dragleave') {
        // dragenter/leave fire for every descendant crossing — count depth
        // so hovering the icon inside the empty state doesn't flicker.
        if (--this._depth <= 0) {
          this._depth = 0;
          this.removeAttribute('data-over');
        }
      } else if (e.type === 'drop') {
        e.preventDefault();
        e.stopPropagation();
        this._depth = 0;
        this.removeAttribute('data-over');
        const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if (f) this._ingest(f);
      }
    }
    async _ingest(file) {
      this._setError(null);
      if (!file || ACCEPT.indexOf(file.type) < 0) {
        this._setError('Drop a PNG, JPEG, WebP, or AVIF image.');
        return;
      }
      // toDataUrl can take hundreds of ms on a large photo. A Clear or a
      // newer drop during that window would be clobbered when this await
      // resumes — bump + capture a generation so stale encodes bail.
      const gen = ++this._gen;
      // Replacing a shown image: surface the swap through the encode too,
      // not just the decode — otherwise the old photo sits there with no
      // feedback while the canvas re-encode runs. An empty slot keeps its
      // placeholder (no spinner) until the encode lands, as before.
      // _swapGen guards the mask against re-renders DURING the encode
      // (pointerenter, ResizeObserver, another slot's store write): the
      // stored value still resolves to the old image there, so _render's
      // same-src clear would otherwise unmask it mid-replace.
      if (this.hasAttribute('data-filled')) {
        this.setAttribute('data-swapping', '');
        this._swapGen = gen;
      }
      try {
        const w = this.clientWidth || this.offsetWidth || MAX_DIM;
        const url = await toDataUrl(file, w);
        if (gen !== this._gen) return;
        // Only exit reframe once the new image is in hand — a rejected type
        // or decode failure leaves the in-progress crop untouched.
        this._exitReframe(false);
        // Clear BEFORE setSlot: its synchronous re-render must see no
        // pending encode, so a byte-identical re-upload (same data URL, no
        // load event coming) still clears the mask via the complete branch.
        this._swapGen = 0;
        const val = {
          u: url,
          s: 1,
          x: 0,
          y: 0
        };
        setSlot(this.id || '', val);
        // Keep a session-local copy for id-less slots so the drop still
        // shows, even though it cannot persist.
        if (!this.id) {
          this._local = val;
          this._render();
        }
      } catch (err) {
        if (gen !== this._gen) return;
        this._swapGen = 0;
        // Reveal the kept old image — unless another replacement (a
        // remote pick's src swap) is still in flight, in which case the
        // mask stays until THAT image settles (its load/error releases).
        this._releaseMask();
        this._setError('Could not read that image.');
        console.warn('<image-slot> ingest failed:', err);
      }
    }
    _setError(msg) {
      if (this._err) {
        this._err.remove();
        this._err = null;
      }
      if (!msg) return;
      const d = document.createElement('div');
      d.className = 'err';
      d.textContent = msg;
      this.shadowRoot.appendChild(d);
      this._err = d;
      setTimeout(() => {
        if (this._err === d) {
          d.remove();
          this._err = null;
        }
      }, 3000);
    }

    // Reframing (pan/resize) is available on any filled slot — the user can
    // always reposition/scale. `fit` only sets the initial baseline (see
    // _geom): contain starts fully-visible, cover starts frame-filling.
    _reframes() {
      return this.hasAttribute('data-filled');
    }

    // The single release discipline for the replacement-in-flight mask
    // (data-swapping). The mask comes off only when BOTH hold:
    //  - no encode is pending (_swapGen) — mid-encode the stored value
    //    still resolves to the old image, so any reveal paints it;
    //  - the frame img has settled on its current src — an unsettled src
    //    means some replacement is still in flight (e.g. a remote pick),
    //    whoever started it, and revealing would paint the previous
    //    frame. The load/error listeners pass settled=true (the event IS
    //    the settlement signal, per spec complete is true by then);
    //    other callers rely on the complete flag (covers loaded AND
    //    failed).
    // Every release path funnels through here EXCEPT _render's empty
    // branch (the img is being cleared — nothing will ever settle).
    _releaseMask(settled) {
      if (!this._swapGen && !this._loadPending && (settled || this._img.complete)) {
        this.removeAttribute('data-swapping');
      }
    }

    // Baseline geometry, shared by clamp/apply/resize. `base` is the scale at
    // view-scale s=1: cover = fill the frame (overflow on the looser axis),
    // contain = fit fully inside (letterboxed). Zooming a contain image past
    // s where it overflows naturally becomes a crop. Null until the img has
    // loaded (naturalWidth is 0 before that) or when the slot has no layout
    // box — ResizeObserver fires with a 0×0 rect under display:none, and
    // clamping against a degenerate 1×1 frame would silently pull the stored
    // pan toward zero.
    _geom() {
      const iw = this._img.naturalWidth,
        ih = this._img.naturalHeight;
      const fw = this.clientWidth,
        fh = this.clientHeight;
      if (!iw || !ih || !fw || !fh) return null;
      const contain = (this.getAttribute('fit') || 'cover').toLowerCase() === 'contain';
      const base = contain ? Math.min(fw / iw, fh / ih) : Math.max(fw / iw, fh / ih);
      return {
        iw,
        ih,
        fw,
        fh,
        base
      };
    }
    _clampView() {
      // Pan range on each axis is half the overflow past the frame edge.
      const g = this._geom();
      if (!g) return;
      const mx = Math.max(0, (g.iw * g.base * this._view.s / g.fw - 1) * 50);
      const my = Math.max(0, (g.ih * g.base * this._view.s / g.fh - 1) * 50);
      this._view.x = Math.max(-mx, Math.min(mx, this._view.x));
      this._view.y = Math.max(-my, Math.min(my, this._view.y));
    }
    _applyView() {
      const g = this._geom();
      // Top-layer controls: pin to the frame's top-right in viewport px
      // (the same 8px inset as the in-frame layout; unscaled — top-layer UI
      // reads as chrome, not page content). BEFORE the geometry branch:
      // placement needs only the frame rect, and a not-yet-loaded or broken
      // src must not leave the promoted strip floating unpositioned. Gated
      // on the popover actually being open: without the Popover API,
      // showPopover() threw (swallowed in _enterReframe), .ctl stays in
      // its in-frame absolute layout, and viewport-px coordinates would
      // shove it off-frame — and matches(':popover-open') itself throws
      // there (unknown pseudo-class), hence the try/catch.
      if (this.hasAttribute('data-reframe')) {
        let onTop = false;
        try {
          onTop = this._ctl.matches(':popover-open');
        } catch {}
        if (onTop) {
          const r = this.getBoundingClientRect();
          this._ctl.style.left = r.right - 8 + 'px';
          this._ctl.style.top = r.top + 8 + 'px';
        }
      }
      if (!g) {
        // Dimensions not known yet (before img load) — centered fit so there
        // is no flash of an unpositioned image before the geometry lands.
        const contain = (this.getAttribute('fit') || 'cover').toLowerCase() === 'contain';
        this._img.style.width = '100%';
        this._img.style.height = '100%';
        this._img.style.left = '50%';
        this._img.style.top = '50%';
        this._img.style.objectFit = contain ? 'contain' : 'cover';
        return;
      }
      // Baseline (cover-fill or contain-fit) × view scale. Width/height and
      // left/top are all frame-% — depends only on the frame aspect ratio, so
      // a responsive resize keeps the same crop. The spill layer mirrors the
      // same box so its corners = image corners.
      const k = g.base * this._view.s;
      const w = g.iw * k / g.fw * 100 + '%';
      const h = g.ih * k / g.fh * 100 + '%';
      const l = 50 + this._view.x + '%';
      const t = 50 + this._view.y + '%';
      this._img.style.width = w;
      this._img.style.height = h;
      this._img.style.left = l;
      this._img.style.top = t;
      this._img.style.objectFit = '';
      if (this.hasAttribute('data-reframe')) {
        // Top-layer spill: position in viewport px over the frame. The top
        // layer escapes ancestor transforms entirely, so EVERY term must be
        // in viewport units: getBoundingClientRect gives the frame's scaled
        // origin AND size, and the rect/layout ratio rescales the ghost —
        // sizing from layout px alone renders it 1/scale too large under a
        // scaled deck slide. Inner ghost + handles stay box-relative.
        const r = this.getBoundingClientRect();
        const sx = g.fw ? r.width / g.fw : 1;
        const sy = g.fh ? r.height / g.fh : 1;
        this._spill.style.width = g.iw * k * sx + 'px';
        this._spill.style.height = g.ih * k * sy + 'px';
        this._spill.style.left = r.left + (50 + this._view.x) / 100 * r.width + 'px';
        this._spill.style.top = r.top + (50 + this._view.y) / 100 * r.height + 'px';
      }
    }
    _commitView() {
      const v = {
        s: this._view.s,
        x: this._view.x,
        y: this._view.y
      };
      if (this._userUrl) v.u = this._userUrl;
      // Framing-only (no u) persists too so an author-src slot remembers its
      // crop; clearing the sidecar still falls through to src=.
      if (this.id) setSlot(this.id, v);else {
        this._local = v;
      }
    }
    _render() {
      // Shape / mask. Presets use border-radius so the dashed ring can
      // follow the rounded outline; clip-path is only applied for an
      // explicit `mask` (the ring is hidden there since a rectangle
      // dashed border chopped by an arbitrary polygon looks broken).
      const mask = this.getAttribute('mask');
      const shape = (this.getAttribute('shape') || 'rounded').toLowerCase();
      let radius = '';
      if (shape === 'circle') radius = '50%';else if (shape === 'pill') radius = '9999px';else if (shape === 'rounded') {
        const n = parseFloat(this.getAttribute('radius'));
        radius = (Number.isFinite(n) ? n : 12) + 'px';
      }
      this._frame.style.borderRadius = mask ? '' : radius;
      this._frame.style.clipPath = mask || '';
      this._ring.style.borderRadius = mask ? '' : radius;
      this._ring.style.display = mask ? 'none' : '';

      // Controls and reframe entry gate on this so share links stay read-only.
      const editable = !!(window.omelette && window.omelette.writeFile);
      this.toggleAttribute('data-editable', editable);
      this._sub.style.display = editable ? '' : 'none';

      // Content. The sidecar is also writable by the agent's write_file
      // tool, so its value isn't guaranteed canvas-originated — only accept
      // data:image/ URLs from it. The `src` attribute is author-controlled
      // (Claude wrote it into the HTML) so it passes through unchanged.
      let stored = this.id ? getSlot(this.id) : this._local;
      if (stored && stored.u && !/^data:image\//i.test(stored.u)) stored = null;
      const srcAttr = this.getAttribute('src') || '';
      this._userUrl = stored && stored.u || null;
      const url = this._userUrl || srcAttr;
      // Don't clobber an in-flight reframe with a store-triggered re-render.
      if (!this.hasAttribute('data-reframe')) {
        this._view = {
          s: stored && Number.isFinite(stored.s) ? clampS(stored.s) : 1,
          x: stored && Number.isFinite(stored.x) ? stored.x : 0,
          y: stored && Number.isFinite(stored.y) ? stored.y : 0
        };
      }
      this._cap.textContent = this.getAttribute('placeholder') || 'Drop an image';
      // Toggle via style.display — the [hidden] attribute alone loses to
      // the display:flex / display:block rules in the stylesheet above.
      // An Unsplash src with no credit attribute must NOT render — showing
      // the photo uncredited is the Unsplash-terms violation itself. The
      // error tile replaces the photo until the credit is written. A
      // user-dropped image is the user's own content and always renders.
      // Trimmed: credit is agent/user-editable content, and a whitespace-
      // only value must count as missing — otherwise it would suppress the
      // error tile AND render an empty credit box (no text, no links),
      // exactly the unattributed state this gate exists to prevent.
      const credit = (this.getAttribute('credit') || '').trim();
      const attrError = !!(!credit && !this._userUrl && srcAttr && isUnsplashHost(srcAttr));
      this.toggleAttribute('data-attribution-error', attrError);
      if (url && !attrError) {
        const prev = this._img.getAttribute('src');
        if (prev !== url) {
          // Replacing an already-shown image: mark the swap BEFORE setting
          // src so the stale frame is never revealed (see the data-swapping
          // stylesheet rules). First fill (prev empty) keeps the existing
          // placeholder-until-load behavior — no spinner. _hidShowing
          // covers the pick path's transient attribution-error wipe: prev
          // is gone, but an image WAS showing, so this is a replacement.
          if (prev || this._hidShowing) this.setAttribute('data-swapping', '');
          // Mark the swap BEFORE assigning src: complete keeps reporting
          // the old settled request until the browser's
          // update-the-image-data microtask runs, so same-task re-renders
          // (the pick path's credit/credit-href setAttributes) need this
          // flag, not complete, to know a load is in flight.
          this._loadPending = true;
          this._img.src = url;
          this._ghost.src = url;
        } else {
          // Same-src re-render — release if settled, so an ingest-set
          // spinner can't stick after a byte-identical re-upload (same
          // data URL, no further load event ever fires).
          this._releaseMask();
        }
        this._hidShowing = false;
        this._img.style.display = 'block';
        this._empty.style.display = 'none';
        this.setAttribute('data-filled', '');
        this._clampView();
        this._applyView();
      } else {
        this.removeAttribute('data-swapping');
        // The src is being removed — no load/error will ever fire for it.
        this._loadPending = false;
        // A transient attribution-error wipe of a showing image happens on
        // the pick path: the host sets src one setAttribute before credit,
        // so render N hides the old image (attrError) and render N+1
        // restores a URL. Remember the wipe so that restore renders as a
        // replacement (spinner), not a first fill (blank frame).
        this._hidShowing = attrError && !!this._img.getAttribute('src');
        this._img.style.display = 'none';
        this._img.removeAttribute('src');
        this._ghost.removeAttribute('src');
        // The error tile owns the blocked-photo state; .empty stays for
        // the genuinely-empty slot.
        this._empty.style.display = attrError ? 'none' : 'flex';
        this.removeAttribute('data-filled');
      }

      // Credit belongs to the author src, so a user drop hides it.
      // textContent + the http(s)-only funnel keep external strings inert.
      const showCredit = !!(url && credit && !this._userUrl && !attrError);
      this._credit.textContent = '';
      if (showCredit) {
        // Validate once (resolved against the document, http(s) only),
        // then append the terms-required utm referral params to links
        // that point back at unsplash.com.
        let href = '';
        const rawHref = this.getAttribute('credit-href') || '';
        if (rawHref) {
          try {
            const u = new URL(rawHref, document.baseURI);
            if (u.protocol === 'http:' || u.protocol === 'https:') {
              href = withReferral(u.href);
            }
          } catch {}
        }
        const mkLink = (text, linkHref) => {
          const a = document.createElement('a');
          a.setAttribute('target', '_blank');
          a.setAttribute('rel', 'noopener noreferrer');
          a.setAttribute('href', linkHref);
          a.textContent = text;
          return a;
        };
        // Unsplash's prescribed credit is TWO links — the photographer's
        // name to their profile (credit-href) and 'Unsplash' to the
        // homepage. Render that split whenever the text has the canonical
        // shape; other text keeps the legacy single-link rendering.
        const m = /^Photo by (.+) on Unsplash$/.exec(credit);
        if (m) {
          this._credit.appendChild(document.createTextNode('Photo by '));
          this._credit.appendChild(href ? mkLink(m[1], href) : document.createTextNode(m[1]));
          this._credit.appendChild(document.createTextNode(' on '));
          this._credit.appendChild(mkLink('Unsplash', UNSPLASH_HOMEPAGE_HREF));
        } else if (href) {
          this._credit.appendChild(mkLink(credit, href));
        } else {
          this._credit.textContent = credit;
        }
      }
      this.toggleAttribute('data-credit', showCredit);
    }
  }
  if (!customElements.get('image-slot')) {
    customElements.define('image-slot', ImageSlot);
  }
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "assets/image-slot.js", error: String((e && e.message) || e) }); }

// components/buttons/ArrowLink.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * ArrowLink — the brand's forward-navigation link. Gold, bold, with a trailing
 * arrow that slides right on hover. Optional leading Lucide icon.
 * No underline on purpose (it breaks apart when the label wraps).
 */
function ArrowLink({
  href = '#',
  icon,
  children,
  style = {},
  ...rest
}) {
  return /*#__PURE__*/React.createElement("a", _extends({
    href: href,
    className: "mtz-arrow-link",
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      color: 'var(--accent)',
      fontWeight: 'var(--fw-bold)',
      fontSize: 'var(--fs-body)',
      textDecoration: 'none',
      ...style
    }
  }, rest), icon && /*#__PURE__*/React.createElement("i", {
    className: `licon icon-${icon}`,
    style: {
      fontSize: '14px'
    },
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("span", null, children), /*#__PURE__*/React.createElement("span", {
    className: "mtz-arrow",
    "aria-hidden": "true"
  }, "\u2192"));
}
Object.assign(__ds_scope, { ArrowLink });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/buttons/ArrowLink.jsx", error: String((e && e.message) || e) }); }

// components/buttons/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Button — the brand's primary action control.
 * Two variants: a solid gold "primary" (black text) and an outlined "secondary".
 * Press gives an immediate scale(0.97); hover lifts 2px. Optional leading Lucide icon.
 *
 * Gold CLICK BURST: primary (gold-filled) buttons emit a short gold particle
 * burst on click — the one sanctioned decorative motion, reserved for the
 * act-now CTA. Load assets/gold-burst.js once on the page; it auto-attaches to
 * .mtz-btn--primary via delegation (honors prefers-reduced-motion, skips
 * [disabled], opt out with data-no-burst). Secondary/disabled never burst.
 */
function Button({
  variant = 'primary',
  href,
  icon,
  children,
  onClick,
  disabled = false,
  type = 'button',
  style = {},
  ...rest
}) {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontFamily: 'var(--font-sans)',
    fontSize: 'var(--fs-body)',
    borderRadius: 'var(--radius-md)',
    textDecoration: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'transform var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out), background var(--dur-base) ease, border-color var(--dur-base) ease, color var(--dur-base) ease',
    whiteSpace: 'nowrap'
  };
  const variants = {
    primary: {
      background: 'var(--accent)',
      color: 'var(--on-accent)',
      fontWeight: 'var(--fw-black)',
      padding: '14px 28px',
      border: 'none',
      boxShadow: '0 0 0 rgba(254,201,2,0)'
    },
    secondary: {
      background: 'transparent',
      color: 'var(--text)',
      fontWeight: 'var(--fw-bold)',
      padding: '12.5px 26px',
      border: 'var(--border-btn)'
    }
  };

  // Disabled reads as muted, not a faded gold: neutral surface fill, faint text,
  // no accent and no hover glow. Color carries the state, so no opacity dimming.
  const disabledStyle = {
    background: 'var(--surface)',
    color: 'var(--faint)',
    border: variant === 'secondary' ? 'var(--border-btn)' : '1px solid var(--border)',
    boxShadow: 'none'
  };
  const cls = variant === 'primary' ? 'mtz-btn mtz-btn--primary' : 'mtz-btn mtz-btn--secondary';
  const props = {
    className: cls,
    style: {
      ...base,
      ...variants[variant],
      ...(disabled ? disabledStyle : {}),
      ...style
    },
    onClick: disabled ? undefined : onClick,
    ...rest
  };
  const inner = /*#__PURE__*/React.createElement(React.Fragment, null, icon && /*#__PURE__*/React.createElement("i", {
    className: `licon icon-${icon}`,
    style: {
      fontSize: '14px',
      verticalAlign: '-2px'
    },
    "aria-hidden": "true"
  }), children);
  if (href && !disabled) {
    return /*#__PURE__*/React.createElement("a", _extends({
      href: href
    }, props), inner);
  }
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    disabled: disabled
  }, props), inner);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/buttons/Button.jsx", error: String((e && e.message) || e) }); }

// components/cards/BrandCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * BrandCard — the minimal proof card: a centered badge up top (brand initials,
 * a logo image, OR a Lucide `icon` glyph) over one centered line at the bottom —
 * a benchmark figure or a short one-sentence proof. No tag, no name, no pill —
 * the section heading above carries the context. `initials` is 1-3 letters;
 * pass `logoSrc` for a real logo, or `icon` (e.g. "eye") for an insight card.
 * The `icon` variant drops the gold badge fill (icon sits in transparent safe
 * area), enlarges the glyph, and centers the icon+text as one tight group.
 */
function BrandCard({
  initials,
  logoSrc,
  icon,
  benchmark,
  href,
  style = {},
  ...rest
}) {
  const Wrapper = href ? 'a' : 'div';
  const isIcon = !!icon && !logoSrc;
  return /*#__PURE__*/React.createElement(Wrapper, _extends({
    href: href,
    className: "mtz-card"
  }, rest, {
    style: {
      background: 'var(--surface-card)',
      border: 'var(--border-hairline)',
      borderRadius: 'var(--radius-xl)',
      padding: '32px 20px',
      minHeight: '160px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: isIcon ? 'center' : 'space-between',
      gap: isIcon ? '12px' : 0,
      textAlign: 'center',
      textDecoration: 'none',
      color: 'inherit',
      transition: 'border-color 180ms var(--ease-out), transform 180ms var(--ease-out)',
      ...style
    }
  }), logoSrc ? /*#__PURE__*/React.createElement("img", {
    src: logoSrc,
    alt: "",
    style: {
      width: '56px',
      height: '56px',
      objectFit: 'contain'
    }
  }) : isIcon ? /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--accent)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '40px',
      lineHeight: 1
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: `licon icon-${icon}`,
    "aria-hidden": "true"
  })) : /*#__PURE__*/React.createElement("div", {
    style: {
      width: '56px',
      height: '56px',
      borderRadius: 'var(--radius-2xl)',
      background: 'var(--accent-soft)',
      color: 'var(--accent)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'var(--fw-black)',
      fontSize: '18px',
      lineHeight: 1,
      letterSpacing: 'var(--tracking-tight)'
    }
  }, initials), benchmark && /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text)',
      fontWeight: 'var(--fw-bold)',
      fontSize: 'var(--fs-body)',
      lineHeight: 'var(--lh-snug)',
      margin: 0
    }
  }, benchmark));
}
Object.assign(__ds_scope, { BrandCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/cards/BrandCard.jsx", error: String((e && e.message) || e) }); }

// components/cards/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Card — the brand's elevated navy content card. Optional uppercase `tag` (with
 * icon), a bold title, an optional bold `hook` question line, body copy, and a
 * footer "view link" that slides its arrow on card hover. Renders as an <a> when
 * `href` is set so the whole card is the target.
 */
function Card({
  tag,
  tagIcon,
  title,
  hook,
  children,
  href,
  linkLabel = 'View',
  style = {},
  ...rest
}) {
  const Wrapper = href ? 'a' : 'div';
  return /*#__PURE__*/React.createElement(Wrapper, _extends({
    href: href,
    className: "mtz-card"
  }, rest, {
    style: {
      background: 'var(--surface-card)',
      border: 'var(--border-hairline)',
      borderRadius: 'var(--radius-xl)',
      padding: '22px',
      display: 'flex',
      flexDirection: 'column',
      textDecoration: 'none',
      color: 'inherit',
      transition: 'border-color 180ms var(--ease-out), transform 180ms var(--ease-out)',
      ...style
    }
  }), tag && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      color: 'var(--text-muted)',
      fontSize: '11px',
      fontWeight: 'var(--fw-bold)',
      letterSpacing: 'var(--tracking-caps)',
      textTransform: 'uppercase',
      marginBottom: '10px'
    }
  }, tagIcon && /*#__PURE__*/React.createElement("i", {
    className: `licon icon-${tagIcon}`,
    "aria-hidden": "true"
  }), tag), title && /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 'var(--fs-h3)',
      fontWeight: 'var(--fw-bold)',
      marginBottom: '8px',
      letterSpacing: '-0.005em',
      color: 'var(--accent)'
    }
  }, title), hook && /*#__PURE__*/React.createElement("p", {
    style: {
      fontWeight: 'var(--fw-bold)',
      color: 'var(--text)',
      fontSize: '15px',
      marginBottom: '8px'
    }
  }, hook), children && /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-muted)',
      fontSize: 'var(--fs-sm)',
      marginBottom: '14px',
      flexGrow: 1
    }
  }, children), href && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: '14px',
      borderTop: 'var(--border-hairline)',
      marginTop: 'auto'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "mtz-view-link",
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      color: 'var(--text)',
      fontSize: '13px',
      fontWeight: 'var(--fw-bold)',
      transition: 'color 150ms ease'
    }
  }, linkLabel, " ", /*#__PURE__*/React.createElement("span", {
    className: "mtz-arrow",
    "aria-hidden": "true"
  }, "\u2192"))));
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/cards/Card.jsx", error: String((e && e.message) || e) }); }

// components/cards/Panel.jsx
try { (() => {
/**
 * Panel — the capture / result box. Elevated navy surface with a title, body copy,
 * a primary CTA (via the `cta` prop), and an optional demoted secondary link with
 * a sliding arrow. This is the brand's single-primary-action conversion block.
 */
function Panel({
  title,
  children,
  cta,
  secondary,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-card)',
      border: 'var(--border-hairline)',
      borderRadius: 'var(--radius-2xl)',
      padding: '28px',
      ...style
    }
  }, title && /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 'var(--fs-h3)',
      fontWeight: 'var(--fw-bold)',
      marginBottom: '8px',
      color: 'var(--text)'
    }
  }, title), children && /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-muted)',
      fontSize: '14.5px',
      marginBottom: '18px',
      maxWidth: '56ch'
    }
  }, children), cta && /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "primary",
    href: cta.href,
    icon: cta.icon
  }, cta.label), secondary && /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: '14px',
      fontSize: '13px'
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: secondary.href,
    className: "mtz-secondary-link",
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      color: 'var(--text-muted)',
      fontWeight: 'var(--fw-bold)',
      textDecoration: 'none',
      transition: 'color 150ms ease'
    }
  }, secondary.icon && /*#__PURE__*/React.createElement("i", {
    className: `licon icon-${secondary.icon}`,
    style: {
      fontSize: '13px'
    },
    "aria-hidden": "true"
  }), secondary.label, " ", /*#__PURE__*/React.createElement("span", {
    className: "mtz-arrow",
    "aria-hidden": "true"
  }, "\u2192"))));
}
Object.assign(__ds_scope, { Panel });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/cards/Panel.jsx", error: String((e && e.message) || e) }); }

// components/content/Eyebrow.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Eyebrow — the gold uppercase kicker that sits above a hero headline or card.
 * Bold, 12px, wide tracking. Optional leading Lucide icon.
 */
function Eyebrow({
  icon,
  children,
  style = {},
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      color: 'var(--accent)',
      fontSize: 'var(--fs-xs)',
      fontWeight: 'var(--fw-bold)',
      letterSpacing: 'var(--tracking-eyebrow)',
      textTransform: 'uppercase',
      ...style
    }
  }, rest), icon && /*#__PURE__*/React.createElement("i", {
    className: `licon icon-${icon}`,
    style: {
      fontSize: '12px',
      verticalAlign: '-1px'
    },
    "aria-hidden": "true"
  }), children);
}
Object.assign(__ds_scope, { Eyebrow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/Eyebrow.jsx", error: String((e && e.message) || e) }); }

// components/content/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Icon — inline Lucide icon. Emits `<i class="licon icon-<name>">`, which the
 * self-hosted icon library (assets/icons.js) upgrades in place to an inline SVG
 * — no CDN/webfont dependency. `name` is the Lucide glyph name (e.g. "shield-check").
 * The consuming page must load assets/icons.js once. Never use as a large stacked
 * tile over a heading — the brand keeps icons inline.
 */
function Icon({
  name,
  size = 14,
  color = 'currentColor',
  style = {},
  ...rest
}) {
  return /*#__PURE__*/React.createElement("i", _extends({
    className: `licon icon-${name}`,
    "aria-hidden": "true",
    style: {
      fontSize: `${size}px`,
      color,
      lineHeight: 1,
      verticalAlign: '-2px',
      ...style
    }
  }, rest));
}
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/Icon.jsx", error: String((e && e.message) || e) }); }

// components/content/NumberBadge.jsx
try { (() => {
/**
 * NumberBadge — a number (or 1-2 short chars) centered in a circle with the
 * vertical position LOCKED regardless of the digit or the font's metrics.
 *
 * Why SVG: flexbox/line-height centering aligns the font's *line box*, not the
 * glyph, so a font with asymmetric metrics (Lato) leaves digits sitting high.
 * `text-box-trim` fixes it but isn't universally supported. An SVG <text> with
 * text-anchor="middle" + dominant-baseline="central" centers by glyph geometry —
 * font-metric-proof and identical for every digit 0-9. This is the one correct
 * way to seat a number in a circle in this system; reach for it everywhere a
 * numbered/lettered circle appears.
 *
 * The baseline is placed deterministically at center + capHeight/2 (Lato
 * cap-height ≈ 0.7em → offset ≈ 0.35·fontSize) rather than relying on
 * dominant-baseline="central", which renders inconsistently across browsers.
 */
function NumberBadge({
  children,
  size = 30,
  fontSize,
  // px; defaults to ~52% of size
  fill = 'var(--surface-recessed)',
  color = 'var(--muted)',
  border = '1px solid var(--border)',
  weight = 'var(--fw-black)',
  style = {}
}) {
  const fs = fontSize == null ? Math.round(size * 0.52) : fontSize;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 'none',
      display: 'inline-flex',
      width: size,
      height: size,
      borderRadius: 'var(--radius-full)',
      background: fill,
      border,
      ...style
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: `0 0 ${size} ${size}`,
    "aria-hidden": "false",
    style: {
      display: 'block'
    }
  }, /*#__PURE__*/React.createElement("text", {
    x: "50%",
    y: size / 2 + fs * 0.35,
    textAnchor: "middle",
    fill: color,
    fontFamily: "var(--font-sans)",
    fontWeight: weight,
    fontSize: fs
  }, children)));
}
Object.assign(__ds_scope, { NumberBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/NumberBadge.jsx", error: String((e && e.message) || e) }); }

// components/content/SectionHeading.jsx
try { (() => {
/**
 * SectionHeading — a bold 20px section title with a bottom hairline rule, plus an
 * optional muted sub-line beneath it. Use `tight` for the first heading directly
 * under a hero (the hero already carries bottom padding).
 */
function SectionHeading({
  children,
  sub,
  tight = false,
  id,
  style = {}
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    id: id,
    style: {
      fontSize: 'var(--fs-h2)',
      fontWeight: 'var(--fw-bold)',
      color: 'var(--text)',
      padding: tight ? '4px 0 18px' : '44px 0 18px',
      borderBottom: 'var(--border-hairline)',
      marginBottom: sub ? '20px' : '0',
      ...style
    }
  }, children), sub && /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-muted)',
      fontSize: '14.5px',
      marginBottom: '16px',
      maxWidth: 'var(--measure-prose)',
      marginTop: '-16px'
    }
  }, sub));
}
Object.assign(__ds_scope, { SectionHeading });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/SectionHeading.jsx", error: String((e && e.message) || e) }); }

// components/controls/DropdownField.jsx
try { (() => {
const {
  useState,
  useRef,
  useEffect
} = React;
/**
 * DropdownField — the brand form-field pattern (see Text Field / Email Input)
 * rendered as a select. A notched, uppercase gold label sits on the hairline
 * border; the trigger focuses/hovers to gold and its chevron flips on open.
 * The floating menu uses the shared .mtz-dropdown enter/exit motion. Closes on
 * outside click and Escape. Uncontrolled by default — pass value + onChange.
 */
function DropdownField({
  label = 'DSP',
  placeholder = 'Select an option',
  options = [],
  value: controlledValue,
  defaultValue = '',
  onChange,
  style = {}
}) {
  const isControlled = controlledValue != null;
  const [inner, setInner] = useState(defaultValue);
  const value = isControlled ? controlledValue : inner;
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = e => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  function select(name) {
    if (!isControlled) setInner(name);
    onChange && onChange(name);
    setOpen(false);
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-sans)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'relative',
      top: '11px',
      alignSelf: 'flex-start',
      marginLeft: '11px',
      padding: '0 6px',
      whiteSpace: 'nowrap',
      background: 'var(--surface)',
      fontSize: 'var(--fs-xs)',
      fontWeight: 'var(--fw-bold)',
      letterSpacing: 'var(--tracking-eyebrow)',
      textTransform: 'uppercase',
      color: 'var(--accent)',
      zIndex: 1
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    ref: ref,
    className: 'mtz-dropdown' + (open ? ' open' : ''),
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "mtz-dropdown-trigger mtz-dropdown-trigger--field",
    "aria-haspopup": "listbox",
    "aria-expanded": open,
    onClick: e => {
      e.preventDefault();
      setOpen(o => !o);
    },
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '8px',
      width: '100%',
      boxSizing: 'border-box',
      padding: '14px',
      fontSize: 'var(--fs-body)',
      fontFamily: 'var(--font-sans)',
      textAlign: 'left',
      background: 'var(--surface)',
      border: 'var(--border-hairline)',
      borderColor: open ? 'var(--accent)' : 'var(--border)',
      borderRadius: 'var(--radius-md)',
      outline: 'none',
      cursor: 'pointer',
      transition: 'border-color var(--dur-base) var(--ease-out)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: value ? 'var(--text)' : 'var(--muted)'
    }
  }, value || placeholder), /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 10 10",
    fill: "none",
    "aria-hidden": "true",
    style: {
      flex: 'none',
      transition: 'transform 200ms cubic-bezier(0.23,1,0.32,1)',
      transform: open ? 'rotate(180deg)' : 'rotate(0deg)'
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M2.5 3.75L5 6.25L7.5 3.75",
    stroke: "var(--muted)",
    strokeWidth: "1.6",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "mtz-dropdown-menu",
    role: "listbox",
    style: {
      position: 'absolute',
      top: 'calc(100% + 8px)',
      left: 0,
      right: 0,
      zIndex: 20,
      background: 'var(--surface)',
      border: 'var(--border-hairline)',
      borderRadius: 'var(--radius-xl)',
      padding: '8px',
      boxShadow: 'var(--shadow-dropdown)'
    }
  }, options.map(name => /*#__PURE__*/React.createElement("button", {
    key: name,
    type: "button",
    role: "option",
    "aria-selected": value === name,
    className: 'mtz-dropdown-option' + (value === name ? ' sel' : ''),
    onClick: e => {
      e.preventDefault();
      select(name);
    },
    style: {
      display: 'block',
      width: '100%',
      textAlign: 'left',
      background: 'none',
      border: 'none',
      color: 'var(--muted)',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--fs-body)',
      fontWeight: 'var(--fw-regular)',
      padding: '10px 12px',
      borderRadius: 'var(--radius-md)',
      cursor: 'pointer',
      transition: 'background 120ms ease, color 120ms ease'
    }
  }, name))))));
}
Object.assign(__ds_scope, { DropdownField });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/controls/DropdownField.jsx", error: String((e && e.message) || e) }); }

// components/controls/EmailInput.jsx
try { (() => {
const {
  useState
} = React;
/**
 * EmailInput — the brand form-field pattern (see Text Field / Dropdown Field),
 * specialised for email capture. A notched, uppercase gold label sits on the
 * hairline border (var(--border-hairline)); the field focuses to gold. Muted
 * placeholder and helper text come from the system defaults. On blur it
 * validates: a malformed entry turns the border coral (var(--error)) and shows
 * an error line, a valid entry shows a quiet gold check. Uncontrolled by
 * default — pass value + onChange to control it.
 */
function EmailInput({
  label = 'Email',
  hint,
  placeholder = 'jane@agency.com',
  value: controlledValue,
  defaultValue = '',
  helperText,
  errorText = 'Enter a valid email address.',
  required = false,
  onChange,
  onValidChange,
  style = {}
}) {
  const isControlled = controlledValue != null;
  const [inner, setInner] = useState(defaultValue);
  const value = isControlled ? controlledValue : inner;
  const [focused, setFocused] = useState(false);
  const [touched, setTouched] = useState(false);
  const isValid = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  const valid = isValid(value);
  const empty = value.trim() === '';
  const showError = touched && !focused && !empty && !valid;
  const showValid = touched && !focused && valid;
  const borderColor = focused ? 'var(--accent)' : showError ? 'var(--error)' : 'var(--border)';
  function handleChange(e) {
    const v = e.target.value;
    if (!isControlled) setInner(v);
    onChange && onChange(v);
    onValidChange && onValidChange(isValid(v));
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-sans)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'relative',
      top: '11px',
      alignSelf: 'flex-start',
      marginLeft: '11px',
      padding: '0 6px',
      whiteSpace: 'nowrap',
      background: 'var(--surface)',
      fontSize: 'var(--fs-xs)',
      fontWeight: 'var(--fw-bold)',
      letterSpacing: 'var(--tracking-eyebrow)',
      textTransform: 'uppercase',
      color: 'var(--accent)',
      zIndex: 1
    }
  }, label, hint && /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 'var(--fw-regular)',
      letterSpacing: 'normal',
      textTransform: 'none',
      color: 'var(--faint)'
    }
  }, " ", hint)), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'relative',
      display: 'flex',
      alignItems: 'stretch'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "email",
    inputMode: "email",
    autoComplete: "email",
    required: required,
    placeholder: placeholder,
    value: value,
    onChange: handleChange,
    onFocus: () => setFocused(true),
    onBlur: () => {
      setFocused(false);
      setTouched(true);
    },
    style: {
      flex: 1,
      width: '100%',
      boxSizing: 'border-box',
      padding: showValid ? '14px 42px 14px 14px' : '14px',
      fontSize: 'var(--fs-body)',
      fontFamily: 'var(--font-sans)',
      color: 'var(--text)',
      background: 'var(--surface)',
      border: '1px solid ' + borderColor,
      borderRadius: 'var(--radius-md)',
      outline: 'none',
      transition: 'border-color var(--dur-base) var(--ease-out)'
    }
  }), showValid && /*#__PURE__*/React.createElement("svg", {
    width: "17",
    height: "17",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--accent)",
    strokeWidth: "3",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
    style: {
      position: 'absolute',
      right: '14px',
      top: '50%',
      transform: 'translateY(-50%)'
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M20 6 9 17l-5-5"
  })))), showError ? /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '10px 0 0 2px',
      fontSize: 'var(--fs-sm)',
      color: 'var(--error)'
    }
  }, errorText) : helperText ? /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '10px 0 0 2px',
      fontSize: 'var(--fs-sm)',
      color: 'var(--muted)'
    }
  }, helperText) : null);
}
Object.assign(__ds_scope, { EmailInput });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/controls/EmailInput.jsx", error: String((e && e.message) || e) }); }

// components/controls/FilterDropdown.jsx
try { (() => {
const {
  useState,
  useRef,
  useEffect
} = React;
/**
 * FilterDropdown — the pill-style filter control from the live tool. A rounded
 * trigger (icon + label + chevron) that opens a floating menu of options; the
 * selected option replaces the label and the chevron rotates. One open at a time
 * is the caller's concern; this closes on outside click and Escape.
 */
function FilterDropdown({
  label,
  icon,
  options = [],
  onSelect,
  style = {}
}) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(label);
  const ref = useRef(null);
  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('click', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    className: `mtz-dropdown${open ? ' open' : ''}`,
    style: {
      position: 'relative',
      ...style
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "mtz-dropdown-trigger",
    onClick: e => {
      e.stopPropagation();
      setOpen(o => !o);
    },
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      background: open ? 'var(--accent-soft)' : 'var(--bg-elevated)',
      border: `1px solid ${open ? 'var(--accent)' : 'var(--border)'}`,
      color: open ? 'var(--accent)' : 'var(--text)',
      fontFamily: 'var(--font-sans)',
      fontSize: '13.5px',
      fontWeight: 'var(--fw-bold)',
      padding: '10px 16px',
      borderRadius: 'var(--radius-pill)',
      cursor: 'pointer',
      transition: 'border-color 160ms ease, transform 160ms var(--ease-out), background 160ms ease'
    }
  }, icon && /*#__PURE__*/React.createElement("i", {
    className: `licon icon-${icon}`,
    style: {
      fontSize: '14px'
    },
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("span", null, current), /*#__PURE__*/React.createElement("svg", {
    width: "10",
    height: "10",
    viewBox: "0 0 10 10",
    fill: "none",
    style: {
      transform: open ? 'rotate(180deg)' : 'rotate(0)',
      transition: 'transform 200ms var(--ease-out)'
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M2.5 3.75L5 6.25L7.5 3.75",
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "mtz-dropdown-menu",
    role: "listbox",
    style: {
      position: 'absolute',
      top: 'calc(100% + 8px)',
      left: 0,
      zIndex: 20,
      minWidth: '200px',
      background: 'var(--bg-elevated)',
      border: 'var(--border-hairline)',
      borderRadius: 'var(--radius-xl)',
      padding: '8px',
      boxShadow: 'var(--shadow-dropdown)'
    }
  }, options.map(opt => /*#__PURE__*/React.createElement("button", {
    key: opt,
    type: "button",
    role: "option",
    "aria-selected": current === opt,
    className: `mtz-dropdown-option${current === opt ? ' sel' : ''}`,
    onClick: () => {
      setCurrent(opt);
      setOpen(false);
      onSelect && onSelect(opt);
    },
    style: {
      display: 'block',
      width: '100%',
      textAlign: 'left',
      background: 'none',
      border: 'none',
      color: current === opt ? 'var(--accent)' : 'var(--text-muted)',
      fontFamily: 'var(--font-sans)',
      fontSize: '13.5px',
      fontWeight: 'var(--fw-regular)',
      padding: '9px 12px',
      borderRadius: 'var(--radius-md)',
      cursor: 'pointer',
      transition: 'background 120ms ease, color 120ms ease'
    }
  }, opt))));
}
Object.assign(__ds_scope, { FilterDropdown });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/controls/FilterDropdown.jsx", error: String((e && e.message) || e) }); }

// components/controls/HelpNote.jsx
try { (() => {
const {
  useState
} = React;
/**
 * HelpNote — the inline "reveal the answer" pattern from the form fields
 * (see Text Field). A muted helper line ends in a gold link ("Where do I find
 * this? →"); clicking it rotates the arrow 90° and eases open a recessed panel
 * holding the answer. Purely a disclosure — no press-scale, matching the rest
 * of the form family. Uncontrolled by default.
 */
function HelpNote({
  helperText = 'Your DSP seat/account ID.',
  linkLabel = 'Where do I find this?',
  body = 'Open your DSP and go to Settings → Account. The seat (or advertiser) ID is the numeric identifier next to your organization name — usually 5–7 digits.',
  defaultOpen = false,
  style = {}
}) {
  const [open, setOpen] = useState(defaultOpen);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-sans)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 0 2px',
      fontSize: 'var(--fs-sm)',
      color: 'var(--muted)'
    }
  }, helperText, ' ', /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      setOpen(o => !o);
    },
    style: {
      fontWeight: 'var(--fw-bold)',
      color: 'var(--accent)',
      textDecoration: 'none',
      cursor: 'pointer',
      whiteSpace: 'nowrap'
    }
  }, linkLabel, ' ', /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-block',
      transition: 'transform 220ms cubic-bezier(0.23,1,0.32,1)',
      transform: open ? 'rotate(90deg)' : 'rotate(0deg)'
    }
  }, "\u2192"))), /*#__PURE__*/React.createElement("div", {
    style: {
      overflow: 'hidden',
      maxHeight: open ? '240px' : '0px',
      opacity: open ? 1 : 0,
      marginTop: open ? '12px' : '0px',
      transition: 'max-height 280ms cubic-bezier(0.23,1,0.32,1), opacity 200ms ease, margin-top 280ms cubic-bezier(0.23,1,0.32,1)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-recessed)',
      border: 'var(--border-hairline)',
      borderRadius: 'var(--radius-md)',
      padding: '14px 16px'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 'var(--fs-sm)',
      lineHeight: 'var(--lh-body)',
      color: 'var(--muted)'
    }
  }, body))));
}
Object.assign(__ds_scope, { HelpNote });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/controls/HelpNote.jsx", error: String((e && e.message) || e) }); }

// components/controls/Slider.jsx
try { (() => {
const {
  useState,
  useRef,
  useCallback
} = React;
/**
 * Slider — a single-thumb range control on the gold rail. Drag the thumb, click
 * the track, or use arrows/Page/Home/End; a value tooltip floats above the thumb
 * (auto = on hover/drag). Snaps to `step`, formats with prefix + grouping, and
 * optionally renders per-step marks. Uncontrolled by default (seeds from
 * `defaultValue`); pass `value` + `onChange` to control it. This is the bare
 * control — wrap it in a Card for the budget-picker context.
 */
function Slider({
  min = 0,
  max = 100,
  step = 1,
  defaultValue,
  value: controlledValue,
  onChange,
  marks = false,
  valueLabelDisplay = 'auto',
  decimals = 0,
  grouping = true,
  valuePrefix = '',
  valueSuffix = '',
  minLabel,
  maxLabel,
  ariaLabel = 'Slider',
  style = {}
}) {
  const trackRef = useRef(null);
  const isControlled = controlledValue != null;
  const [internal, setInternal] = useState(defaultValue == null ? min : defaultValue);
  const [dragging, setDragging] = useState(false);
  const [hover, setHover] = useState(false);
  const value = isControlled ? controlledValue : internal;
  const dec = Math.max(0, Math.round(decimals));
  const snap = useCallback(v => {
    let s = Math.round((v - min) / step) * step + min;
    const stepDec = (String(step).split('.')[1] || '').length;
    if (stepDec) s = parseFloat(s.toFixed(stepDec + 2));
    return Math.min(max, Math.max(min, s));
  }, [min, max, step]);
  const commit = useCallback(v => {
    const sv = snap(v);
    if (!isControlled) setInternal(sv);
    onChange && onChange(sv);
  }, [snap, isControlled, onChange]);
  const fmt = v => {
    const body = grouping ? v.toLocaleString('en-GB', {
      minimumFractionDigits: dec,
      maximumFractionDigits: dec
    }) : v.toFixed(dec);
    return valuePrefix + body + valueSuffix;
  };
  const valueFromClientX = clientX => {
    const el = trackRef.current;
    if (!el) return value;
    const r = el.getBoundingClientRect();
    const pct = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    return min + pct * (max - min);
  };
  const onPointerDown = e => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDragging(true);
    commit(valueFromClientX(e.clientX));
  };
  const onPointerMove = e => {
    if (dragging) commit(valueFromClientX(e.clientX));
  };
  const onPointerUp = e => {
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    setDragging(false);
  };
  const onKeyDown = e => {
    let nv = value;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') nv = value + step;else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') nv = value - step;else if (e.key === 'PageUp') nv = value + step * 10;else if (e.key === 'PageDown') nv = value - step * 10;else if (e.key === 'Home') nv = min;else if (e.key === 'End') nv = max;else return;
    e.preventDefault();
    commit(nv);
  };
  const range = max === min ? 1 : max - min;
  const pct = (value - min) / range;
  const fillPct = (pct * 100).toFixed(3) + '%';

  // marks
  let markPoints = [];
  if (marks) {
    if (Array.isArray(marks)) {
      markPoints = marks.map(m => ({
        pct: (m.value - min) / range * 100 + '%',
        on: m.value <= value
      }));
    } else {
      const count = Math.round((max - min) / step);
      if (count > 0 && count <= 60) {
        for (let i = 0; i <= count; i++) {
          const mv = min + i * step;
          markPoints.push({
            pct: i / count * 100 + '%',
            on: mv <= value
          });
        }
      }
    }
  }
  const showTip = valueLabelDisplay === 'on' ? 1 : valueLabelDisplay === 'off' ? 0 : dragging || hover ? 1 : 0;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '6px 0 4px',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    ref: trackRef,
    onPointerDown: onPointerDown,
    onPointerMove: onPointerMove,
    onPointerUp: onPointerUp,
    onPointerLeave: () => {
      if (!dragging) setHover(false);
    },
    onPointerEnter: () => setHover(true),
    style: {
      position: 'relative',
      height: '26px',
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
      touchAction: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      height: '5px',
      borderRadius: 'var(--radius-pill)',
      background: 'var(--line-strong)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      height: '5px',
      borderRadius: 'var(--radius-pill)',
      background: 'var(--accent)',
      width: fillPct
    }
  }), markPoints.map((m, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      position: 'absolute',
      top: '50%',
      width: '3px',
      height: '3px',
      borderRadius: '50%',
      transform: 'translate(-50%,-50%)',
      left: m.pct,
      background: m.on ? 'var(--on-accent)' : 'var(--line-strong)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    role: "slider",
    tabIndex: 0,
    "aria-label": ariaLabel,
    "aria-valuemin": min,
    "aria-valuemax": max,
    "aria-valuenow": value,
    "aria-valuetext": fmt(value),
    onKeyDown: onKeyDown,
    onFocus: () => setHover(true),
    onBlur: () => setHover(false),
    style: {
      position: 'absolute',
      left: fillPct,
      top: '50%',
      width: '18px',
      height: '18px',
      borderRadius: 'var(--radius-full)',
      background: 'var(--accent)',
      transform: `translate(-50%,-50%) scale(${dragging ? 0.82 : 1})`,
      boxShadow: '0 0 0 4px var(--surface), 0 2px 6px rgba(0,0,0,0.4)',
      cursor: dragging ? 'grabbing' : 'grab',
      outline: 'none',
      transition: 'box-shadow var(--dur-fast) var(--ease-out), transform 140ms var(--ease-out)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: '26px',
      left: '50%',
      transform: 'translateX(-50%)',
      padding: '4px 9px',
      borderRadius: 'var(--radius-md)',
      background: 'var(--surface-recessed)',
      border: 'var(--border-hairline)',
      color: 'var(--muted)',
      fontSize: '12px',
      fontWeight: 'var(--fw-bold)',
      whiteSpace: 'nowrap',
      pointerEvents: 'none',
      opacity: showTip,
      transition: 'opacity var(--dur-fast) var(--ease-out)'
    }
  }, fmt(value), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      border: '4px solid transparent',
      borderTopColor: 'var(--surface-recessed)'
    }
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: '14px',
      fontSize: 'var(--fs-sm)',
      color: 'var(--faint)'
    }
  }, /*#__PURE__*/React.createElement("span", null, minLabel ?? fmt(min)), /*#__PURE__*/React.createElement("span", null, maxLabel ?? fmt(max))));
}
Object.assign(__ds_scope, { Slider });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/controls/Slider.jsx", error: String((e && e.message) || e) }); }

// components/data/DataTable.jsx
try { (() => {
/**
 * DataTable — the brand's spec / results table. Elevated navy surface, hairline
 * rules. Pass `rows` as [{ label, value, highlight }]; a highlighted value renders
 * in bold gold. Optional two-column `headers` [labelHead, valueHead].
 */
function DataTable({
  rows = [],
  headers,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse',
      background: 'var(--surface-card)',
      border: 'var(--border-hairline)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      fontSize: '14px',
      ...style
    }
  }, headers && /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, headers.map((h, i) => /*#__PURE__*/React.createElement("th", {
    key: i,
    style: {
      textAlign: 'left',
      color: 'var(--text-muted)',
      fontWeight: 'var(--fw-bold)',
      padding: '12px 16px',
      fontSize: '11.5px',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      borderBottom: 'var(--border-hairline)'
    }
  }, h)))), /*#__PURE__*/React.createElement("tbody", null, rows.map((r, i) => /*#__PURE__*/React.createElement("tr", {
    key: i
  }, r.label !== undefined && /*#__PURE__*/React.createElement("th", {
    style: {
      textAlign: 'left',
      color: 'var(--text-muted)',
      fontWeight: 'var(--fw-bold)',
      padding: '12px 16px',
      fontSize: '11.5px',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      borderTop: i === 0 && !headers ? 'none' : 'var(--border-hairline)',
      width: '38%'
    }
  }, r.label), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '12px 16px',
      borderTop: i === 0 && !headers ? 'none' : 'var(--border-hairline)',
      color: r.highlight ? 'var(--accent)' : 'var(--text)',
      fontWeight: r.highlight ? 'var(--fw-black)' : 'var(--fw-regular)',
      fontSize: r.highlight ? '16px' : '14px'
    }
  }, r.value)))));
}
Object.assign(__ds_scope, { DataTable });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/DataTable.jsx", error: String((e && e.message) || e) }); }

// components/data/StatRow.jsx
try { (() => {
/**
 * StatRow — a proof-stat band. Renders an evenly-split grid of gold numbers with
 * muted labels beneath. Pass `stats` as [{ num, label }]. Uses CSS Grid (not
 * flex-wrap) so any count lands in clean, even rows. `columns` defaults to 3.
 */
function StatRow({
  stats = [],
  columns = 3,
  divider = true,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      columnGap: 'var(--gap-stat)',
      rowGap: '24px',
      marginTop: '36px',
      paddingTop: divider ? '22px' : '0',
      borderTop: divider ? 'var(--border-hairline)' : 'none',
      ...style
    }
  }, stats.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      gap: '2px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-stat)',
      fontWeight: 'var(--fw-black)',
      color: 'var(--accent)',
      letterSpacing: 'var(--tracking-tight)',
      lineHeight: 1.1
    }
  }, s.num), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-muted)',
      fontSize: 'var(--fs-xs)',
      fontWeight: 'var(--fw-light)'
    }
  }, s.label))));
}
Object.assign(__ds_scope, { StatRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/StatRow.jsx", error: String((e && e.message) || e) }); }

// components/data/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Tag — a small pill label for format/category chips. Muted (neutral) by
 * default; pass `tone="gold"` for the gold-tinted accent variant. When
 * `onRemove` is supplied it renders a trailing close (×) button (with a gap,
 * vertically centered) so the tag can be excluded/dismissed.
 *
 * Pass `onClick` (without `onRemove`) to make the tag a clickable/selectable
 * chip: it becomes a real <button>, reacts on hover/press (scale 0.96 on
 * active), and reflects the `selected` prop with a gold-filled state.
 */
function Tag({
  children,
  tone = 'muted',
  selected = false,
  onRemove,
  onClick,
  style = {},
  ...rest
}) {
  const gold = tone === 'gold';
  const clickable = typeof onClick === 'function' && !onRemove;

  // Base pill visuals, shared by all variants.
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    gap: '6px',
    fontSize: 'var(--fs-2xs)',
    fontWeight: 'var(--fw-bold)',
    lineHeight: 1,
    borderRadius: 'var(--radius-pill)'
  };

  // Selectable chip: rendered as a button with hover/press/selected states.
  if (clickable) {
    const on = selected;
    return /*#__PURE__*/React.createElement("button", _extends({
      type: "button",
      onClick: onClick,
      "aria-pressed": on,
      style: {
        ...base,
        padding: '6px 14px',
        cursor: 'pointer',
        background: on ? 'var(--accent)' : 'var(--surface-recessed)',
        color: on ? 'var(--navy-900)' : 'var(--muted)',
        border: on ? '1px solid var(--accent)' : '1px solid var(--border)',
        transition: 'background var(--dur-slow) var(--ease-out), color var(--dur-slow) var(--ease-out), border-color var(--dur-slow) var(--ease-out), transform var(--dur-slow) var(--ease-out)',
        transform: 'scale(1)',
        ...style
      },
      onMouseEnter: e => {
        if (!on) {
          e.currentTarget.style.background = 'var(--row-hover)';
          e.currentTarget.style.color = 'var(--text)';
          e.currentTarget.style.borderColor = 'var(--line-gold)';
        }
      },
      onMouseLeave: e => {
        if (!on) {
          e.currentTarget.style.background = 'var(--surface-recessed)';
          e.currentTarget.style.color = 'var(--muted)';
          e.currentTarget.style.borderColor = 'var(--border)';
        }
      },
      onMouseDown: e => {
        e.currentTarget.style.transform = 'scale(0.96)';
      },
      onMouseUp: e => {
        e.currentTarget.style.transform = 'scale(1)';
      }
    }, rest), /*#__PURE__*/React.createElement("span", null, children));
  }
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      ...base,
      background: gold ? 'var(--accent-soft)' : 'var(--surface-recessed)',
      color: gold ? 'var(--accent)' : 'var(--muted)',
      border: gold ? '1px solid var(--line-gold)' : '1px solid var(--border)',
      padding: onRemove ? '6px 8px 6px 13px' : '6px 13px',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", null, children), onRemove && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onRemove,
    "aria-label": `Remove ${typeof children === 'string' ? children : 'tag'}`,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '15px',
      height: '15px',
      padding: 0,
      border: 'none',
      borderRadius: 'var(--radius-full)',
      background: 'transparent',
      color: 'inherit',
      cursor: 'pointer',
      opacity: 0.7,
      transition: 'background var(--dur-fast) var(--ease-out), opacity var(--dur-fast) var(--ease-out)'
    },
    onMouseEnter: e => {
      e.currentTarget.style.background = 'var(--row-hover)';
      e.currentTarget.style.opacity = 1;
    },
    onMouseLeave: e => {
      e.currentTarget.style.background = 'transparent';
      e.currentTarget.style.opacity = 0.7;
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "9",
    height: "9",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "3",
    strokeLinecap: "round",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M18 6 6 18M6 6l12 12"
  }))));
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Tag.jsx", error: String((e && e.message) || e) }); }

// components/media/PhoneFrame.jsx
try { (() => {
const {
  useState,
  useRef,
  useLayoutEffect
} = React;
/**
 * PhoneFrame — an iPhone 16-style bezel with uniform thin bezels and a
 * 19.5:9 screen. Bezel thickness is even on all four sides, and the screen
 * corner radius follows Inner = Outer − Padding so the rounds stay concentric
 * AT ANY SIZE. Every metric is a PROPORTION of the frame's measured width:
 * outer radius 16.5%, bezel padding 4%, rim 0.5%, screen radius 12.5% (= 16.5 − 4).
 * The width is measured with a ResizeObserver, so scaling the frame up or down
 * keeps the phone looking identical (a big phone is not thin-bezeled, a small
 * one not chunky). At the 206px reference width this equals the original
 * 34 / 4 / 30px.
 *
 * Drop an <img> or screen node as `children`, OR pass `slotId` to get a
 * user-fillable <image-slot> that fills the screen and inherits its rounded
 * corners (drop/upload a screenshot, clipped to fit — nothing pokes out).
 * Requires assets/image-slot.js on the page when `slotId` is used. The
 * `caption` renders CENTERED BELOW the phone: a leading step number in Lato
 * Black gold, the rest in white. Pass "1 · Opt-in prompt" (or set `number` +
 * caption separately). Lifts on hover.
 */
function PhoneFrame({
  children,
  caption,
  number,
  slotId,
  slotSrc,
  placeholder = 'Drop a screenshot',
  style = {}
}) {
  let num = number;
  let text = caption;
  if (num == null && typeof caption === 'string') {
    const m = caption.match(/^\s*(\d+)\s*[·.\-]\s*(.*)$/);
    if (m) {
      num = m[1];
      text = m[2];
    }
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
  const outerR = w * 0.165; // outer bezel radius
  const pad = w * 0.04; // bezel thickness (even on all sides)
  const rim = Math.max(w * 0.005, 0.5); // rim light, never below 0.5px
  const innerR = outerR - pad; // concentric screen radius

  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    ref: frameRef,
    className: "mtz-phone-frame",
    style: {
      width: '100%',
      background: 'linear-gradient(150deg, #3a3b40, #17181b 55%, #202127)',
      borderRadius: outerR + 'px',
      padding: pad + 'px',
      border: rim + 'px solid rgba(255,255,255,.10)',
      boxShadow: 'var(--shadow-phone)',
      transition: 'transform 180ms var(--ease-out)',
      boxSizing: 'border-box'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      aspectRatio: '9 / 19.5',
      borderRadius: innerR + 'px',
      overflow: 'hidden',
      position: 'relative',
      background: 'linear-gradient(160deg, var(--surface), var(--surface-recessed))',
      display: 'flex',
      alignItems: 'flex-end'
    }
  }, slotId ? React.createElement('image-slot', {
    id: slotId,
    src: slotSrc,
    shape: 'rect',
    fit: 'cover',
    placeholder,
    style: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%'
    }
  }) : children)), (text || num != null) && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '12px',
      textAlign: 'center',
      fontSize: '13px',
      lineHeight: 1.4
    }
  }, num != null && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontWeight: 'var(--fw-black)',
      color: 'var(--accent)',
      marginRight: '6px'
    }
  }, num), text && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text)',
      fontWeight: 'var(--fw-regular)'
    }
  }, text)));
}
Object.assign(__ds_scope, { PhoneFrame });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/media/PhoneFrame.jsx", error: String((e && e.message) || e) }); }

// resources-mockups/reveal.js
try { (() => {
// Blackbelt reveal — entrance motion only. Progressive enhancement: elements
// are fully visible without this script; it only adds the hidden start-state
// right before animating in, and it does nothing if the person prefers
// reduced motion.
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  function stagger(els, step) {
    els.forEach(function (el, i) {
      el.classList.add('reveal');
      el.style.setProperty('--d', i * (step || 60) + 'ms');
    });
  }
  function playIn(els) {
    // double rAF: let the browser paint the hidden state first, so the
    // transition to .in actually fires instead of being skipped.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        els.forEach(function (el) {
          el.classList.add('in');
        });
      });
    });
  }

  // Hero: above the fold on every page load, so it plays immediately —
  // no scroll trigger needed, no repeat visits to worry about (it's a
  // one-time-per-load entrance, not a hover/keyboard-repeat action).
  var heroEls = document.querySelectorAll('.hero .eyebrow, .hero h1, .hero .hook, .hero .lede, ' + '.hero .arrow-link, .hero .stats .stat, .hero .btn-group');
  if (heroEls.length) {
    stagger(Array.prototype.slice.call(heroEls), 70);
    playIn(Array.prototype.slice.call(heroEls));
  }

  // Below-fold groups: reveal with a stagger the first time they enter
  // view, then stop watching (no replay on scroll up/down).
  var groupObserver = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var children = Array.prototype.slice.call(entry.target.children);
      stagger(children, 60);
      playIn(children);
      obs.unobserve(entry.target);
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });
  document.querySelectorAll('.grid, .phone-gallery').forEach(function (g) {
    groupObserver.observe(g);
  });

  // Standalone blocks (panel, mock-tool, table): reveal individually.
  var soloObserver = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('reveal');
      playIn([entry.target]);
      obs.unobserve(entry.target);
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });
  document.querySelectorAll('.panel, .mock-tool, table').forEach(function (el) {
    soloObserver.observe(el);
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "resources-mockups/reveal.js", error: String((e && e.message) || e) }); }

// ui_kits/Resources/App.jsx
try { (() => {
// App — simple state router across the three recreated views.
function App() {
  const [view, setView] = React.useState('hub');
  const go = v => {
    setView(v);
    window.scrollTo({
      top: 0
    });
  };
  const back = {
    goldmine: {
      label: 'Resources',
      to: 'hub'
    },
    campaign: {
      label: 'Campaign Goldmine',
      to: 'goldmine'
    }
  }[view];
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Header, {
    backLabel: back ? back.label : null,
    onBack: () => back && go(back.to),
    onHome: () => go('hub')
  }), view === 'hub' && /*#__PURE__*/React.createElement(ResourcesHub, {
    go: go
  }), view === 'goldmine' && /*#__PURE__*/React.createElement(Goldmine, {
    go: go
  }), view === 'campaign' && /*#__PURE__*/React.createElement(CampaignExample, null), /*#__PURE__*/React.createElement(Footer, null));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/Resources/App.jsx", error: String((e && e.message) || e) }); }

// ui_kits/Resources/CampaignExample.jsx
try { (() => {
// Campaign example — Ford & Mercedes named result. Message-first: headline → proof
// stats → four phone-framed moments → spec table → one CTA.
function CampaignExample() {
  const {
    Eyebrow,
    StatRow,
    SectionHeading,
    PhoneFrame,
    DataTable,
    Panel
  } = window.MonetizrBlackbeltDesignSystem_e1017f;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Wrap, {
    style: {
      padding: '64px var(--wrap-pad) 40px'
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    icon: "shield-check"
  }, "Named Result \xB7 Automotive"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 'var(--fs-display)',
      fontWeight: 900,
      letterSpacing: '-0.02em',
      lineHeight: 1.12,
      margin: '18px 0 12px',
      color: 'var(--text)'
    }
  }, "Ford ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--accent)'
    }
  }, "& Mercedes")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontWeight: 700,
      color: 'var(--text)',
      fontSize: '19px',
      lineHeight: 1.35,
      marginBottom: '8px'
    }
  }, "Connecting with younger audiences through rewarded video \u2014 without a single new asset."), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-muted)',
      fontSize: 'var(--fs-lede)',
      maxWidth: '600px',
      marginBottom: '22px'
    }
  }, "Both brands ran their existing creative inside opt-in mobile gameplay moments. No redesign, no new shoot: same video, new placement."), /*#__PURE__*/React.createElement(StatRow, {
    columns: 3,
    stats: [{
      num: '37%',
      label: 'click-through rate'
    }, {
      num: '2',
      label: 'brands, one flight'
    }, {
      num: '100%',
      label: 'opt-in placements'
    }]
  })), /*#__PURE__*/React.createElement(Wrap, null, /*#__PURE__*/React.createElement(SectionHeading, {
    tight: true,
    sub: "Four moments from the actual placement \u2014 a player opts in before anything plays, watches on their terms, then acts."
  }, "Inside the campaign"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '18px',
      marginBottom: '36px'
    }
  }, /*#__PURE__*/React.createElement(PhoneFrame, {
    caption: "1 \xB7 Opt-in reward prompt"
  }), /*#__PURE__*/React.createElement(PhoneFrame, {
    caption: "2 \xB7 Rewarded video moment"
  }), /*#__PURE__*/React.createElement(PhoneFrame, {
    caption: "3 \xB7 Interactive end-card"
  }), /*#__PURE__*/React.createElement(PhoneFrame, {
    caption: "4 \xB7 Reward granted, back to play"
  })), /*#__PURE__*/React.createElement(SectionHeading, null, "The setup"), /*#__PURE__*/React.createElement(DataTable, {
    rows: [{
      label: 'Format',
      value: 'Rewarded video, opt-in only'
    }, {
      label: 'Creative',
      value: 'Existing OLV, unmodified'
    }, {
      label: 'Audience',
      value: '18–34, auto intenders'
    }, {
      label: 'Platforms',
      value: 'Brand-safe mobile games, in-app'
    }, {
      label: 'Result',
      value: '37% CTR — named result, not a platform average',
      highlight: true
    }],
    style: {
      marginBottom: '28px'
    }
  }), /*#__PURE__*/React.createElement(Panel, {
    title: "Want to see what this looks like for your category?",
    cta: {
      label: 'Talk to us about a similar campaign →',
      icon: 'calendar',
      href: '#'
    },
    style: {
      marginBottom: '32px'
    }
  }, "15 minutes to walk through a plan built around your existing creative \u2014 no new production required.")));
}
Object.assign(window, {
  CampaignExample
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/Resources/CampaignExample.jsx", error: String((e && e.message) || e) }); }

// ui_kits/Resources/Chrome.jsx
try { (() => {
// Shared chrome: header (wordmark + back link) and footer.
const {
  useState
} = React;
function Header({
  backLabel,
  onBack,
  onHome
}) {
  return /*#__PURE__*/React.createElement("header", {
    style: {
      borderBottom: '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--wrap-max)',
      margin: '0 auto',
      padding: '0 var(--wrap-pad)',
      height: 'var(--header-h)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("a", {
    onClick: e => {
      e.preventDefault();
      onHome();
    },
    href: "#",
    style: {
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer'
    },
    "aria-label": "Monetizr home"
  }, /*#__PURE__*/React.createElement("img", {
    src: window.__resources && window.__resources.logoHorizontal || "../../assets/logo-horizontal-white.png",
    alt: "Monetizr",
    style: {
      height: '22px',
      display: 'block'
    }
  })), backLabel ? /*#__PURE__*/React.createElement("a", {
    onClick: e => {
      e.preventDefault();
      onBack();
    },
    href: "#",
    className: "mtz-arrow-link",
    style: {
      color: 'var(--text-muted)',
      fontSize: '13px',
      fontWeight: 700,
      textDecoration: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ti ti-arrow-left",
    "aria-hidden": "true"
  }), backLabel) : /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-muted)',
      fontSize: '13px',
      fontWeight: 700
    }
  }, "Resources")));
}
function Footer() {
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      borderTop: '1px solid var(--border)',
      padding: '28px 0',
      marginTop: '24px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--wrap-max)',
      margin: '0 auto',
      padding: '0 var(--wrap-pad)',
      display: 'flex',
      justifyContent: 'center',
      color: 'var(--text-muted)',
      fontSize: '13px',
      gap: '4px'
    }
  }, /*#__PURE__*/React.createElement("span", null, "\xA9 2026 Monetizr \xB7 ", /*#__PURE__*/React.createElement("a", {
    href: "mailto:connect@monetizr.com",
    style: {
      color: 'var(--text-muted)'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ti ti-mail",
    style: {
      marginRight: '4px',
      verticalAlign: '-2px'
    },
    "aria-hidden": "true"
  }), "connect@monetizr.com"))));
}
function Wrap({
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--wrap-max)',
      margin: '0 auto',
      padding: '0 var(--wrap-pad)',
      ...style
    }
  }, children);
}
Object.assign(window, {
  Header,
  Footer,
  Wrap
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/Resources/Chrome.jsx", error: String((e && e.message) || e) }); }

// ui_kits/Resources/Goldmine.jsx
try { (() => {
// Campaign Goldmine — proof stats, category filter, top-results table, capture panel.
function Goldmine({
  go
}) {
  const {
    Eyebrow,
    StatRow,
    SectionHeading,
    FilterDropdown,
    ArrowLink,
    DataTable,
    Panel,
    BrandCard
  } = window.MonetizrBlackbeltDesignSystem_e1017f;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Wrap, {
    style: {
      padding: '64px var(--wrap-pad) 40px'
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    icon: "search"
  }, "Resource"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 'var(--fs-display)',
      fontWeight: 900,
      letterSpacing: '-0.02em',
      lineHeight: 1.12,
      margin: '18px 0 12px',
      color: 'var(--text)'
    }
  }, "Campaign ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--accent)'
    }
  }, "Goldmine")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontWeight: 700,
      color: 'var(--text)',
      fontSize: '19px',
      lineHeight: 1.35,
      marginBottom: '8px'
    }
  }, "Has a brand like mine already tested gaming?"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-muted)',
      fontSize: 'var(--fs-lede)',
      maxWidth: '600px',
      marginBottom: '22px'
    }
  }, "Search by industry, format, or campaign type \u2014 see what brands ran and what results were reported, so your pitch starts with precedent, not a leap of faith."), /*#__PURE__*/React.createElement(StatRow, {
    columns: 3,
    stats: [{
      num: '92.1%',
      label: 'avg. video completion'
    }, {
      num: '93%',
      label: 'avg. viewability'
    }, {
      num: '3.6%',
      label: 'avg. click-through'
    }, {
      num: '+7%',
      label: 'avg. purchase intent'
    }, {
      num: '37s',
      label: 'avg. attention/session'
    }, {
      num: '+4%',
      label: 'avg. brand favorability'
    }]
  })), /*#__PURE__*/React.createElement(Wrap, null, /*#__PURE__*/React.createElement(SectionHeading, {
    tight: true,
    sub: "Start with the category your team already understands."
  }, "Category filter"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '14px',
      marginBottom: '22px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--text-muted)',
      fontSize: '14px',
      fontWeight: 700,
      marginRight: 'auto'
    }
  }, "122 brands \xB7 441 campaigns"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '10px'
    }
  }, /*#__PURE__*/React.createElement(FilterDropdown, {
    label: "Industry",
    icon: "building-2",
    options: ['CPG & Household', 'Beauty & Personal Care', 'QSR & Snacking', 'Automotive', 'Entertainment & Streaming', 'Financial Services', 'Retail']
  }), /*#__PURE__*/React.createElement(FilterDropdown, {
    label: "Region",
    icon: "globe",
    options: ['North America', 'Europe', 'LATAM', 'APAC', 'Global']
  }), /*#__PURE__*/React.createElement(FilterDropdown, {
    label: "Objective",
    icon: "target",
    options: ['Awareness', 'Purchase Intent', 'Brand Favorability', 'Reach & Frequency']
  }), /*#__PURE__*/React.createElement(FilterDropdown, {
    label: "Format",
    icon: "layout-grid",
    options: ['Rewarded Video', 'Branded Takeover', 'Interactive End-Card', 'Playable']
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 'var(--gap-card)',
      marginBottom: '20px'
    }
  }, /*#__PURE__*/React.createElement(BrandCard, {
    initials: "F",
    benchmark: "37% CTR",
    href: "#",
    onClick: e => {
      e.preventDefault();
      go('campaign');
    },
    style: {
      cursor: 'pointer'
    }
  }), /*#__PURE__*/React.createElement(BrandCard, {
    initials: "TH",
    benchmark: "95.4% VCR"
  }), /*#__PURE__*/React.createElement(BrandCard, {
    initials: "TD",
    benchmark: "Reach at scale"
  }), /*#__PURE__*/React.createElement(BrandCard, {
    initials: "DO",
    benchmark: "Takeover"
  })), /*#__PURE__*/React.createElement(ArrowLink, {
    icon: "smartphone",
    href: "#",
    onClick: e => {
      e.preventDefault();
      go('campaign');
    }
  }, "See an example brand page"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '8px'
    }
  }, /*#__PURE__*/React.createElement(SectionHeading, {
    sub: "The best verified outcome we've seen per metric \u2014 shown on its own, never blended into the averages above."
  }, "Top results"), /*#__PURE__*/React.createElement(DataTable, {
    headers: ['Metric', 'Best verified result'],
    rows: [{
      label: 'Video Completion Rate',
      value: '95.4%',
      highlight: true
    }, {
      label: 'Click-Through Rate',
      value: '40%',
      highlight: true
    }, {
      label: 'Purchase Intent Lift',
      value: '+49%',
      highlight: true
    }],
    style: {
      marginBottom: '28px'
    }
  })), /*#__PURE__*/React.createElement(Panel, {
    title: "Want to send these to your team before the meeting?",
    cta: {
      label: 'Send me these examples →',
      icon: 'mail',
      href: '#'
    },
    secondary: {
      label: 'Prefer to just talk it through? Book a fit-check call',
      icon: 'calendar',
      href: '#'
    },
    style: {
      marginBottom: '32px'
    }
  }, "Save the examples from your category and send them to your inbox.")));
}
Object.assign(window, {
  Goldmine
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/Resources/Goldmine.jsx", error: String((e && e.message) || e) }); }

// ui_kits/Resources/ResourcesHub.jsx
try { (() => {
// Resources Hub — the router page. Kicker → headline → five resource cards.
function ResourcesHub({
  go
}) {
  const {
    Eyebrow,
    Card
  } = window.MonetizrBlackbeltDesignSystem_e1017f;
  const cards = [{
    tag: 'Resource',
    icon: 'search',
    title: 'Campaign Goldmine',
    hook: 'Has a brand like mine already tested gaming?',
    body: 'Search 500+ campaigns by industry before you commit budget — find the closest precedent so your pitch starts with proof, not theory.',
    link: 'See campaigns in my category',
    to: 'goldmine'
  }, {
    tag: 'Interactive Tool',
    icon: 'gamepad-2',
    title: 'Campaign Launcher',
    hook: 'Do we need new creative to enter gaming?',
    body: 'Use the video or logo you already have. Preview how your brand could appear inside a rewarded gameplay moment in three clicks.',
    link: 'Preview my creative in-game'
  }, {
    tag: 'Interactive Tool',
    icon: 'gamepad-2',
    title: 'Attention Calculator',
    hook: 'What happens to attention when gaming enters the plan?',
    body: 'Compare your current media mix against a plan that includes gaming. The question shifts from CPM to CPvM.',
    link: 'Calculate my attention model'
  }, {
    tag: 'Audience Planner',
    icon: 'target',
    title: 'KPI Booster',
    hook: 'Can I reach the right audience, not just more impressions?',
    body: 'Enter your industry, market, audience, and budget. Estimate reach against verified quality benchmarks.',
    link: 'Estimate my reach'
  }, {
    tag: 'Verified Results',
    icon: 'shield-check',
    title: 'Case Studies',
    hook: 'What does this look like in practice?',
    body: 'Named campaign results with the metric tier clearly labeled — a specific result, not a platform average.',
    link: 'See proof by category'
  }];
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Wrap, {
    style: {
      padding: '64px var(--wrap-pad) 40px'
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Resource Library"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 'var(--fs-display)',
      fontWeight: 900,
      letterSpacing: '-0.02em',
      lineHeight: 1.12,
      maxWidth: '640px',
      margin: '18px 0 16px',
      color: 'var(--text)'
    }
  }, "Everything you need ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--accent)'
    }
  }, "before you test gaming.")), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-muted)',
      fontSize: 'var(--fs-lede)',
      maxWidth: '600px'
    }
  }, "Five tools and proof points, each built to answer one doubt. Pick the one that matches where you're stuck \u2014 nothing here is filler.")), /*#__PURE__*/React.createElement(Wrap, null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--fs-h2)',
      fontWeight: 700,
      color: 'var(--text)',
      padding: '4px 0 18px',
      borderBottom: '1px solid var(--border)',
      marginBottom: '20px'
    }
  }, "Choose your question"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 'var(--gap-card)',
      marginBottom: '32px'
    }
  }, cards.map((c, i) => /*#__PURE__*/React.createElement(Card, {
    key: i,
    tag: c.tag,
    tagIcon: c.icon,
    title: c.title,
    hook: c.hook,
    href: "#",
    linkLabel: c.link,
    style: {
      cursor: c.to ? 'pointer' : 'default'
    },
    onClick: e => {
      e.preventDefault();
      if (c.to) go(c.to);
    }
  }, c.body)))));
}
Object.assign(window, {
  ResourcesHub
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/Resources/ResourcesHub.jsx", error: String((e && e.message) || e) }); }

__ds_ns.ArrowLink = __ds_scope.ArrowLink;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.BrandCard = __ds_scope.BrandCard;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Panel = __ds_scope.Panel;

__ds_ns.Eyebrow = __ds_scope.Eyebrow;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.NumberBadge = __ds_scope.NumberBadge;

__ds_ns.SectionHeading = __ds_scope.SectionHeading;

__ds_ns.DropdownField = __ds_scope.DropdownField;

__ds_ns.EmailInput = __ds_scope.EmailInput;

__ds_ns.FilterDropdown = __ds_scope.FilterDropdown;

__ds_ns.HelpNote = __ds_scope.HelpNote;

__ds_ns.Slider = __ds_scope.Slider;

__ds_ns.DataTable = __ds_scope.DataTable;

__ds_ns.StatRow = __ds_scope.StatRow;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.PhoneFrame = __ds_scope.PhoneFrame;

})();
