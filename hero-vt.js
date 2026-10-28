/* ══════════════════════════════════════════════════════════════
   MÉTRON — hero-vt.js  (als-v685)
   The shared-element half of the cross-page View Transition: tap a number in
   Home's Today columns and that number TRAVELS into the top of the page that
   opens (and back again on the way home).

   The page-to-page motion itself is the static VT block in aurora.css (the
   opt-in must exist before first paint — topbar.js is defer and too late).
   This file only puts ONE `view-transition-name` on each side, for the length
   of one transition, and takes it off again:
     · on the page being left  → `pageswap`  (the element must be ON SCREEN —
       a snapshot of something scrolled away would fly in from nowhere)
     · on the page arriving    → `pagereveal`
   A name that exists twice on a page aborts the whole transition, which is
   why it is set from script on exactly one element and never in CSS.
   No support, reduced motion, a page we have no hero for, an element that has
   not rendered: nothing is named and the ordinary transition plays. Never an
   error, never a blank — the worst case is a plain fade.
   ⛔ Loaded in <head>, NOT defer: pagereveal fires before the first frame.
   Reads nothing, writes nothing.
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (!('onpagereveal' in window) || !('onpageswap' in window)) return;
  var NAME = 'hero-fig';
  /* the number at the top of each page (all rendered during parse, before the
     `vtReady` marker that blocks first render on those pages) */
  var HERO = {
    'nutrition.html': '#sumCard .sum-kcal',
    'sleep.html': '#recBody .rec-score',
    'weight.html': '#wtFace',
    'gym.html': '.w-hero-title'
  };
  function file(u) {
    try { var f = new URL(u, location.href).pathname.split('/').pop(); return f || 'index.html'; }
    catch (e) { return ''; }
  }
  var here = file(location.href);
  function heroFor(other) {
    if (here === 'index.html') return HERO[other] ? document.querySelector('[data-vt-hero="' + other + '"]') : null;
    if (other !== 'index.html' || !HERO[here]) return null;
    return document.querySelector(HERO[here]);
  }
  function onScreen(el) {
    if (!el || !el.getBoundingClientRect) return false;
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < (window.innerHeight || 0);
  }
  function name(el, vt) {
    el.style.viewTransitionName = NAME;
    var off = function () { el.style.viewTransitionName = ''; };
    try { vt.finished.then(off, off); } catch (e) { }
    setTimeout(off, 2000);   /* and never longer than one transition, whatever the promise does */
  }
  window.addEventListener('pageswap', function (e) {
    try {
      if (!e.viewTransition || !e.activation || !e.activation.entry) return;
      var el = heroFor(file(e.activation.entry.url));
      if (onScreen(el)) name(el, e.viewTransition);
    } catch (err) { }
  });
  window.addEventListener('pagereveal', function (e) {
    try {
      if (!e.viewTransition || !window.navigation || !navigation.activation || !navigation.activation.from) return;
      var el = heroFor(file(navigation.activation.from.url));
      if (onScreen(el)) name(el, e.viewTransition);
    } catch (err) { }
  });
  /* back/forward cache: a page restored from memory must not keep the name */
  window.addEventListener('pageshow', function (e) {
    if (!e.persisted) return;
    try { Array.prototype.forEach.call(document.querySelectorAll('[data-vt-hero],' + Object.keys(HERO).map(function (k) { return HERO[k]; }).join(',')), function (el) { if (el.style.viewTransitionName === NAME) el.style.viewTransitionName = ''; }); } catch (err) { }
  });
  /* the travel itself: the same length and curve as the page motion around it */
  try {
    var st = document.createElement('style');
    st.textContent = '::view-transition-group(' + NAME + '){animation-duration:.72s;animation-timing-function:cubic-bezier(.22,1,.36,1);}' +
      '::view-transition-old(' + NAME + '),::view-transition-new(' + NAME + '){animation-duration:.72s;height:100%;object-fit:contain;}' +
      '@media (prefers-reduced-motion:reduce){::view-transition-group(' + NAME + '),::view-transition-old(' + NAME + '),::view-transition-new(' + NAME + '){animation:none !important;}}';
    (document.head || document.documentElement).appendChild(st);
  } catch (e) { }
})();
