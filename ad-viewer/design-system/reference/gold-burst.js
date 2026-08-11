/* ==========================================================================
   Monetizr Blackbelt — gold click-burst
   --------------------------------------------------------------------------
   Any click on a gold-filled (primary) button emits a short burst of gold
   particles from the button's perimeter. Gold ramp only — never off-gold.
   Honors prefers-reduced-motion (no burst). Add data-no-burst to opt a button out.

   Auto-attaches on load: no wiring needed — load this once per page after the DOM
   script. Fire manually with Blackbelt.goldBurst(buttonEl) if you need to.
   Selector: .mtz-btn--primary
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

    var canvas, state;
    if (btn.__burst && btn.__burst.canvas.isConnected) {
      state = btn.__burst; canvas = state.canvas;              // coalesce rapid clicks
    } else {
      canvas = document.createElement('canvas');
      state = { canvas: canvas, particles: [], raf: null, btn: btn };
      btn.__burst = state;
      canvas.style.cssText = 'position:fixed;pointer-events:none;z-index:5;';
      document.body.appendChild(canvas);
    }
    var dpr = window.devicePixelRatio || 1;
    var w = r.width + PAD * 2, h = r.height + PAD * 2;
    canvas.style.left = (r.left - PAD) + 'px';
    canvas.style.top = (r.top - PAD) + 'px';
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    canvas.width = w * dpr; canvas.height = h * dpr;
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    state.cw = w; state.ch = h;
    emit(state, r.width, r.height);
    if (!state.raf) tick(state);
  }

  function emit(state, bw, bh) {
    var left = PAD, top = PAD, w = bw, h = bh;
    var emitters = [
      { x: left,      y: top,      dx: -1, dy: -1, jx: 14, jy: 14 },
      { x: left + w,  y: top,      dx:  1, dy: -1, jx: 14, jy: 14 },
      { x: left + w,  y: top + h,  dx:  1, dy:  1, jx: 14, jy: 14 },
      { x: left,      y: top + h,  dx: -1, dy:  1, jx: 14, jy: 14 },
      { x: left,      y: top + h/2,dx: -1, dy:  0, jx: 0,  jy: h * 0.35 },
      { x: left + w,  y: top + h/2,dx:  1, dy:  0, jx: 0,  jy: h * 0.35 },
      { x: left + w/2,y: top,      dx:  0, dy: -1, jx: w * 0.42, jy: 0, few: true },
      { x: left + w/2,y: top + h,  dx:  0, dy:  1, jx: w * 0.42, jy: 0, few: true }
    ];
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
          x: ox, y: oy,
          vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed,
          life: 0, maxLife: 26 + Math.random() * 22,
          size: 0.6 + Math.random() * 1.4,
          color: GOLDS[Math.random() * GOLDS.length | 0],
          drag: 0.92 + Math.random() * 0.04
        });
      }
    }
  }

  function tick(state) {
    var canvas = state.canvas;
    if (!canvas || !canvas.isConnected) { state.raf = null; return; }
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, state.cw, state.ch);
    var alive = [];
    for (var i = 0; i < state.particles.length; i++) {
      var p = state.particles[i];
      p.life++; p.vx *= p.drag; p.vy *= p.drag; p.x += p.vx; p.y += p.vy;
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
      state.raf = requestAnimationFrame(function () { tick(state); });
    } else {
      ctx.clearRect(0, 0, state.cw, state.ch);
      state.raf = null;
      if (state.btn) state.btn.__burst = null;
      canvas.remove();
    }
  }

  document.addEventListener('click', function (ev) {
    var btn = ev.target.closest && ev.target.closest('.mtz-btn--primary');
    if (btn) burst(btn);
  }, true);
  window.Blackbelt = window.Blackbelt || {};
  window.Blackbelt.goldBurst = burst;
})();
