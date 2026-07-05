/* ══════════════════════════════════════════════════════════════
   AURORA — page-motion.js
   The home page's motion language, extracted for every inner page:
   scroll-reveal cascade, count-up numbers, self-drawing sparklines.

   Usage:
     <script src="page-motion.js" defer></script>
     — static pages: put data-rise on anything that should rise in,
       data-to="42" (+ data-dec / data-comma) on numbers to count up,
       data-spark on a container holding an svg polyline to self-draw.
     — dynamic pages (innerHTML re-renders): set window.__pmAutoSel to a
       selector list to auto-tag, and call PageMotion.scan(window.__pmAutoSel)
       after every full render. Nodes are observed once; count-ups run
       once per node (data-done) so repaints show final values statically —
       re-injected content never gets stuck invisible (the home lesson).
   No-JS safe (styles gate on html.pm) + reduced-motion safe.
   ══════════════════════════════════════════════════════════════ */
(function () {
  if (window.PageMotion) return;
  var settle = 'cubic-bezier(0.16,1,0.3,1)';
  var reduce = false;
  try { reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { }

  /* style gate — only hide things once this engine is present */
  var st = document.createElement('style');
  st.textContent =
    'html.pm [data-rise]{opacity:0;transform:translateY(18px);transition:opacity .7s ' + settle + ', transform .7s ' + settle + ';will-change:opacity,transform;}' +
    'html.pm [data-rise].in{opacity:1;transform:none;}' +
    '@media (prefers-reduced-motion: reduce){html.pm [data-rise]{opacity:1!important;transform:none!important;transition:none!important;}}';
  (document.head || document.documentElement).appendChild(st);
  document.documentElement.classList.add('pm');

  /* count-up (once per node — repaints render static finals) */
  function fmt(v, dec, comma) { var n = dec ? v.toFixed(dec) : Math.round(v); if (comma) return Number(n).toLocaleString('en-US'); return String(n); }
  function countUp(node) {
    if (!node || node.dataset.done) return; node.dataset.done = '1';
    var to = parseFloat(node.dataset.to), dec = parseInt(node.dataset.dec || '0', 10), comma = node.dataset.comma === '1';
    if (reduce || isNaN(to)) { if (!isNaN(to)) node.textContent = fmt(to, dec, comma); return; }
    var dur = 750, s = performance.now();
    function f(t) { var p = Math.min(1, (t - s) / dur); p = 1 - Math.pow(1 - p, 3); node.textContent = fmt(to * p, dec, comma); if (p < 1) requestAnimationFrame(f); else node.textContent = fmt(to, dec, comma); }
    requestAnimationFrame(f);
  }
  /* self-drawing sparkline */
  function drawSpark(el) {
    var pl = el.querySelector('polyline'); if (!pl || pl.dataset.done) return; pl.dataset.done = '1';
    if (reduce) { pl.style.strokeDashoffset = '0'; return; }
    var L = 200; try { L = pl.getTotalLength(); } catch (e) { }
    pl.style.strokeDasharray = L; pl.style.strokeDashoffset = L; pl.getBoundingClientRect();
    pl.style.transition = 'stroke-dashoffset 1.1s ' + settle; pl.style.strokeDashoffset = '0';
  }
  function activate(el) {
    try {
      if (el.hasAttribute && el.hasAttribute('data-to')) countUp(el);
      var cs = el.querySelectorAll ? el.querySelectorAll('[data-to]') : [];
      Array.prototype.forEach.call(cs, countUp);
      if (el.hasAttribute && el.hasAttribute('data-spark')) drawSpark(el);
      var sp = el.querySelectorAll ? el.querySelectorAll('[data-spark]') : [];
      Array.prototype.forEach.call(sp, drawSpark);
    } catch (e) { }
  }

  /* reveal observer — batch stagger per callback, observe-once per node */
  var io = null;
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver(function (ents) {
      var i = 0;
      ents.forEach(function (e) {
        if (!e.isIntersecting) return; var el = e.target; io.unobserve(el);
        var d = reduce ? 0 : (i++) * 60;
        el.style.transitionDelay = d + 'ms';
        requestAnimationFrame(function () { el.classList.add('in'); });
        setTimeout(function () { activate(el); el.style.transitionDelay = ''; }, d + 150);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });
  }

  /* scan — tag (optional selector) + observe anything new; call after re-renders */
  function scan(sel, root) {
    root = root || document;
    if (sel) {
      try { root.querySelectorAll(sel).forEach(function (n) { if (!n.hasAttribute('data-rise')) n.setAttribute('data-rise', ''); }); } catch (e) { }
    }
    root.querySelectorAll('[data-rise]').forEach(function (n) {
      if (n.dataset.pm) return; n.dataset.pm = '1';
      if (io) io.observe(n);
      else { n.classList.add('in'); activate(n); }
    });
  }

  window.PageMotion = { scan: scan, countUp: countUp, drawSpark: drawSpark, activate: activate };

  function boot() { scan(window.__pmAutoSel || null); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
