/* ==========================================================================
   Monetizr Blackbelt — Slider (self-hosted, no framework)
   --------------------------------------------------------------------------
   Single-thumb range control on the gold rail. See Slider.prompt.md for the
   full spec this file implements (elements, states, colors, animations,
   interaction/a11y, props).

   USAGE
     <div class="mtz-slider" data-mtz-slider
          data-min="5000" data-max="200000" data-step="5000" data-value="25000"
          data-value-prefix="£" data-grouping="true" data-marks="true"
          data-min-label="£5K" data-max-label="£200K"
          data-aria-label="Monthly budget"></div>

   Auto-attaches on load (DOMContentLoaded + MutationObserver, same pattern as
   icons.js / gold-burst.js). Can also be called synchronously right after
   inserting markup: Blackbelt.slider.init(el) — idempotent.

   Fires native CustomEvents on the container:
     'input'  — continuous, on every drag/keyboard change: e.detail.value
     'change' — on commit (pointerup / after a keyboard step): e.detail.value

   Public API: el.mtzSlider = { getValue, setValue(v, opts), setPrefix(p),
   setSuffix(s), setEndLabels(minLabel, maxLabel) }
   ========================================================================== */
(function () {
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function toBool(v, def) {
    if (v === undefined || v === null || v === '') return def;
    return v === 'true' || v === '1';
  }

  function readConfig(el) {
    var d = el.dataset;
    var min = d.min !== undefined ? parseFloat(d.min) : 0;
    var max = d.max !== undefined ? parseFloat(d.max) : 100;
    var step = d.step !== undefined ? parseFloat(d.step) : 1;
    var initial = d.value !== undefined ? parseFloat(d.value) : (d.defaultValue !== undefined ? parseFloat(d.defaultValue) : min);
    return {
      min: min, max: max, step: step, initial: initial,
      decimals: d.decimals !== undefined ? parseInt(d.decimals, 10) : 0,
      grouping: toBool(d.grouping, true),
      valuePrefix: d.valuePrefix || '',
      valueSuffix: d.valueSuffix || '',
      marks: toBool(d.marks, false),
      minLabel: d.minLabel, maxLabel: d.maxLabel,
      ariaLabel: d.ariaLabel || 'Slider',
      valueLabelDisplay: d.valueLabelDisplay || 'auto'
    };
  }

  function formatValue(cfg, v) {
    var s = cfg.decimals > 0 ? v.toFixed(cfg.decimals) : String(Math.round(v));
    if (cfg.grouping) {
      var parts = s.split('.');
      parts[0] = Number(parts[0]).toLocaleString('en-GB');
      s = parts.join('.');
    }
    return cfg.valuePrefix + s + cfg.valueSuffix;
  }

  function snap(cfg, raw) {
    var stepped = Math.round((raw - cfg.min) / cfg.step) * cfg.step + cfg.min;
    stepped = Math.min(cfg.max, Math.max(cfg.min, stepped));
    return Math.round(stepped * 1e6) / 1e6; // float-precision cleanup
  }

  function percentOf(cfg, v) {
    if (cfg.max === cfg.min) return 0;
    return ((v - cfg.min) / (cfg.max - cfg.min)) * 100;
  }

  function valueFromPercent(cfg, pct) {
    return snap(cfg, cfg.min + (pct / 100) * (cfg.max - cfg.min));
  }

  function init(el) {
    if (!el || el.dataset.mtzReady === 'true') return;
    var cfg = readConfig(el);
    var current = snap(cfg, cfg.initial);
    var dragging = false;

    el.innerHTML =
      '<div class="mtz-slider-rail">' +
        '<div class="mtz-slider-fill"></div>' +
        '<div class="mtz-slider-marks"></div>' +
        '<div class="mtz-slider-thumb"><div class="mtz-slider-tooltip"></div></div>' +
      '</div>' +
      '<div class="mtz-slider-end-labels"><span class="mtz-slider-min-label"></span><span class="mtz-slider-max-label"></span></div>';

    var railEl = el.querySelector('.mtz-slider-rail');
    var fillEl = el.querySelector('.mtz-slider-fill');
    var marksEl = el.querySelector('.mtz-slider-marks');
    var thumbEl = el.querySelector('.mtz-slider-thumb');
    var tooltipEl = el.querySelector('.mtz-slider-tooltip');
    var minLabelEl = el.querySelector('.mtz-slider-min-label');
    var maxLabelEl = el.querySelector('.mtz-slider-max-label');

    el.setAttribute('role', 'slider');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-label', cfg.ariaLabel);
    el.setAttribute('aria-valuemin', cfg.min);
    el.setAttribute('aria-valuemax', cfg.max);

    var marks = [];
    function buildMarks() {
      marksEl.innerHTML = '';
      marks = [];
      if (!cfg.marks) return;
      var stepsCount = Math.round((cfg.max - cfg.min) / cfg.step) + 1;
      if (stepsCount > 60) return;
      for (var i = 0; i < stepsCount; i++) {
        var v = cfg.min + i * cfg.step;
        var dot = document.createElement('div');
        dot.className = 'mtz-slider-mark';
        dot.style.left = percentOf(cfg, v) + '%';
        marksEl.appendChild(dot);
        marks.push(dot);
      }
    }

    function renderEndLabels() {
      minLabelEl.textContent = cfg.minLabel !== undefined ? cfg.minLabel : formatValue(cfg, cfg.min);
      maxLabelEl.textContent = cfg.maxLabel !== undefined ? cfg.maxLabel : formatValue(cfg, cfg.max);
    }

    function showTip() { if (cfg.valueLabelDisplay !== 'off') thumbEl.classList.add('show-tip'); }
    function hideTip() { if (cfg.valueLabelDisplay !== 'on' && !dragging && document.activeElement !== el) thumbEl.classList.remove('show-tip'); }

    function render(opts) {
      opts = opts || {};
      var pct = percentOf(cfg, current);
      fillEl.style.width = pct + '%';
      thumbEl.style.left = pct + '%';
      tooltipEl.textContent = formatValue(cfg, current);
      el.setAttribute('aria-valuenow', current);
      el.setAttribute('aria-valuetext', formatValue(cfg, current));
      el.dataset.value = current;
      for (var i = 0; i < marks.length; i++) {
        var dotPct = parseFloat(marks[i].style.left);
        marks[i].classList.toggle('active', dotPct <= pct + 0.001);
      }
      if (opts.emit) el.dispatchEvent(new CustomEvent('input', { detail: { value: current } }));
      if (opts.commit) el.dispatchEvent(new CustomEvent('change', { detail: { value: current } }));
    }

    function setFromClientX(clientX, opts) {
      var r = railEl.getBoundingClientRect();
      var pct = r.width ? ((clientX - r.left) / r.width) * 100 : 0;
      pct = Math.min(100, Math.max(0, pct));
      current = valueFromPercent(cfg, pct);
      render(opts);
    }

    // ── Pointer interaction: drag the thumb OR click the track ──────────
    el.addEventListener('pointerdown', function (e) {
      if (cfg.valueLabelDisplay !== 'on') { /* auto/off handled by showTip below */ }
      dragging = true;
      el.classList.add('dragging');
      showTip();
      try { el.setPointerCapture(e.pointerId); } catch (err) {}
      setFromClientX(e.clientX, { emit: true });
      e.preventDefault();
    });
    el.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      setFromClientX(e.clientX, { emit: true });
    });
    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      el.classList.remove('dragging');
      render({ commit: true });
      hideTip();
    }
    el.addEventListener('pointerup', endDrag);
    el.addEventListener('pointercancel', endDrag);

    // ── Keyboard ──────────────────────────────────────────────────────
    el.addEventListener('keydown', function (e) {
      var v = current;
      switch (e.key) {
        case 'ArrowLeft': case 'ArrowDown': v -= cfg.step; break;
        case 'ArrowRight': case 'ArrowUp': v += cfg.step; break;
        case 'PageDown': v -= cfg.step * 10; break;
        case 'PageUp': v += cfg.step * 10; break;
        case 'Home': v = cfg.min; break;
        case 'End': v = cfg.max; break;
        default: return;
      }
      e.preventDefault();
      current = snap(cfg, v);
      render({ emit: true, commit: true });
    });

    // ── Hover / focus reveal (auto mode); halo + tooltip carry focus ───
    el.addEventListener('mouseenter', showTip);
    el.addEventListener('mouseleave', hideTip);
    el.addEventListener('focus', showTip);
    el.addEventListener('blur', hideTip);

    buildMarks();
    renderEndLabels();
    render();
    if (cfg.valueLabelDisplay === 'on') thumbEl.classList.add('show-tip');

    el.mtzSlider = {
      getValue: function () { return current; },
      setValue: function (v, opts) {
        current = snap(cfg, v);
        render(opts || {});
      },
      setPrefix: function (p) { cfg.valuePrefix = p; tooltipEl.textContent = formatValue(cfg, current); },
      setSuffix: function (s) { cfg.valueSuffix = s; tooltipEl.textContent = formatValue(cfg, current); },
      setEndLabels: function (minLabel, maxLabel) {
        cfg.minLabel = minLabel; cfg.maxLabel = maxLabel;
        renderEndLabels();
      }
    };
    el.dataset.mtzReady = 'true';
  }

  function scan(root) {
    var nodes = (root || document).querySelectorAll('[data-mtz-slider]');
    for (var i = 0; i < nodes.length; i++) init(nodes[i]);
  }

  window.Blackbelt = window.Blackbelt || {};
  window.Blackbelt.slider = { init: init, scan: scan };

  function boot() {
    scan();
    if (window.MutationObserver) {
      new MutationObserver(function (muts) {
        for (var i = 0; i < muts.length; i++) {
          var added = muts[i].addedNodes;
          for (var j = 0; j < added.length; j++) {
            var n = added[j];
            if (n.nodeType !== 1) continue;
            if (n.matches && n.matches('[data-mtz-slider]')) init(n);
            if (n.querySelectorAll) scan(n);
          }
        }
      }).observe(document.body, { childList: true, subtree: true });
    }
  }
  if (document.readyState !== 'loading') boot(); else document.addEventListener('DOMContentLoaded', boot);
})();
