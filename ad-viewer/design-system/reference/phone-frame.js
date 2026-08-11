/* ==========================================================================
   Monetizr Blackbelt — PhoneFrame (self-hosted, no framework)
   --------------------------------------------------------------------------
   iPhone-16-style bezel. Every geometric metric — outer radius, bezel
   padding, rim border, screen radius — is a % of the frame's *measured*
   width, applied via ResizeObserver, so the phone looks identical (never
   thin-when-big / chunky-when-small) at any size and corners stay
   concentric. See "PhoneFrame — Replication Guide.md" for the full spec
   this file implements.

     Outer bezel radius            w × 0.165
     Bezel padding (all sides)     w × 0.04
     Rim border                    max(w × 0.005, 0.5)px
     Screen radius (concentric)    outer − padding = w × 0.125

   USAGE
     <div class="mtz-phone-frame">
       <div class="mtz-phone-screen">
         <img src="shot.png" style="width:100%;height:100%;object-fit:cover">
       </div>
     </div>

   Auto-attaches on load (DOMContentLoaded + MutationObserver, same pattern
   as slider.js / icons.js / gold-burst.js) and re-measures on resize via a
   ResizeObserver per frame. Idempotent — safe to call scan()/init() again
   after inserting new markup.

   Public API: window.Blackbelt.phoneFrame = { init(el), scan(root) }
   ========================================================================== */
(function () {
  var REF_WIDTH = 206; // fallback width if a frame can't be measured yet (display:none, etc.)

  function apply(frame, w) {
    var outerR = w * 0.165;
    var pad = w * 0.04;
    var rim = Math.max(w * 0.005, 0.5);
    var innerR = outerR - pad;

    frame.style.borderRadius = outerR + 'px';
    frame.style.padding = pad + 'px';
    frame.style.borderWidth = rim + 'px';

    var screen = frame.querySelector('.mtz-phone-screen');
    if (screen) screen.style.borderRadius = innerR + 'px';
  }

  function init(frame) {
    if (!frame || frame.dataset.mtzReady === 'true') return;
    frame.dataset.mtzReady = 'true';

    function measure() {
      apply(frame, frame.clientWidth || REF_WIDTH);
    }
    measure();

    if (window.ResizeObserver) {
      new ResizeObserver(measure).observe(frame);
    } else {
      window.addEventListener('resize', measure);
    }
  }

  function scan(root) {
    var nodes = (root || document).querySelectorAll('.mtz-phone-frame');
    for (var i = 0; i < nodes.length; i++) init(nodes[i]);
  }

  window.Blackbelt = window.Blackbelt || {};
  window.Blackbelt.phoneFrame = { init: init, scan: scan };

  function boot() {
    scan();
    if (window.MutationObserver) {
      new MutationObserver(function (muts) {
        for (var i = 0; i < muts.length; i++) {
          var added = muts[i].addedNodes;
          for (var j = 0; j < added.length; j++) {
            var n = added[j];
            if (n.nodeType !== 1) continue;
            if (n.matches && n.matches('.mtz-phone-frame')) init(n);
            if (n.querySelectorAll) scan(n);
          }
        }
      }).observe(document.body, { childList: true, subtree: true });
    }
  }
  if (document.readyState !== 'loading') boot(); else document.addEventListener('DOMContentLoaded', boot);
})();
