// =============================================================
// AURORA Motion — the shared animation engine for the dashboard.
//
// Loaded on every page (injected by topbar.js). Self-sufficient:
// the core primitives (reveal, count-up, ring-draw, burst) run on
// native IntersectionObserver + requestAnimationFrame, so they are
// tiny, 60fps, dependency-free and work fully offline. GSAP is only
// LAZY-loaded (from /vendor) on a page that asks for the heavy stuff
// (e.g. the scroll-scrubbed "Your Arc" canvas), so light pages stay
// light.
//
// Two ways to use it:
//   1. Declarative (preferred) — add data-attributes to HTML and it
//      auto-wires on load:
//        <div data-am-reveal>…</div>                 fade+rise on scroll-in
//        <div data-am-reveal-group>…children…</div>  staggered reveal
//        <b data-am-count="1280" data-am-suffix="kg"></b>  count-up on reveal
//        <circle data-am-ring data-am-pct="0.72" …/>  stroke draws to 72%
//   2. Imperative — call the API:
//        AuroraMotion.count(el, 96)
//        AuroraMotion.drawRing(circleEl, 0.72)
//        AuroraMotion.burst({ x, y })
//        AuroraMotion.reveal('.card')
//
// Respects prefers-reduced-motion (everything jumps to final state).
// =============================================================
(function () {
  'use strict';
  if (window.AuroraMotion) return; // singleton

  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  var REDUCED = !!mq.matches;
  try { mq.addEventListener && mq.addEventListener('change', function (e) { REDUCED = e.matches; }); } catch (e) {}

  // ── easing ────────────────────────────────────────────────
  function easeOutExpo(t) { return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t); }
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
  // soft spring-ish settle for rings (slight overshoot, no negative)
  function easeOutBackSoft(t) { var c1 = 1.20, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); }

  var now = (window.performance && performance.now) ? function () { return performance.now(); } : function () { return Date.now(); };

  // generic rAF tween (0→1). dur in ms. Returns a canceller.
  function tween(dur, ease, onUpdate, onComplete) {
    if (REDUCED || !dur || dur <= 0) { onUpdate(1); if (onComplete) onComplete(); return function () {}; }
    var start = now(), raf = 0, killed = false;
    function frame(t) {
      if (killed) return;
      var p = Math.min(1, (t - start) / dur);
      onUpdate(ease ? ease(p) : p);
      if (p < 1) raf = requestAnimationFrame(frame);
      else if (onComplete) onComplete();
    }
    raf = requestAnimationFrame(frame);
    return function () { killed = true; if (raf) cancelAnimationFrame(raf); };
  }

  // ── number formatting ─────────────────────────────────────
  function fmtNum(v, decimals, sep) {
    var s = decimals > 0 ? v.toFixed(decimals) : String(Math.round(v));
    if (sep) { var parts = s.split('.'); parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); s = parts.join('.'); }
    return s;
  }
  function parseNum(str) {
    if (str == null) return 0;
    var m = String(str).replace(/,/g, '').match(/-?\d*\.?\d+/);
    return m ? parseFloat(m[0]) : 0;
  }

  // ── count-up ──────────────────────────────────────────────
  // count(el, to, { from, dur, decimals, prefix, suffix, sep, ease })
  function count(el, to, opts) {
    if (!el) return;
    opts = opts || {};
    if (el.__amCount) { el.__amCount(); el.__amCount = null; } // cancel prior
    var from = (opts.from != null) ? opts.from : 0;
    var decimals = opts.decimals != null ? opts.decimals : (String(to).indexOf('.') > -1 ? (String(to).split('.')[1] || '').length : 0);
    var pre = opts.prefix || '', suf = opts.suffix || '', sep = !!opts.sep;
    var dur = opts.dur != null ? opts.dur : 1100;
    var ease = opts.ease || easeOutExpo;
    el.__amCount = tween(dur, ease, function (p) {
      el.textContent = pre + fmtNum(from + (to - from) * p, decimals, sep) + suf;
    }, function () { el.__amCount = null; });
  }

  // ── reveal (fade + rise / scale) ──────────────────────────
  var revealIO = null;
  // Safety net: anything observed but never revealed (IO misfire, weird
  // browser) is force-shown after a beat so content can NEVER stay hidden.
  var pendingReveal = [];
  var safetyScheduled = false;
  function scheduleRevealSafety() {
    if (safetyScheduled) return; safetyScheduled = true;
    setTimeout(function () { pendingReveal.slice().forEach(function (el) { playReveal(el); }); pendingReveal.length = 0; }, 2600);
  }
  function unpend(el) { var i = pendingReveal.indexOf(el); if (i > -1) pendingReveal.splice(i, 1); }
  function ensureRevealIO() {
    if (revealIO || !window.IntersectionObserver) return revealIO;
    revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        revealIO.unobserve(el);
        playReveal(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    return revealIO;
  }
  function setRevealStart(el, kind) {
    if (REDUCED) return;
    el.style.willChange = 'opacity, transform';
    el.style.opacity = '0';
    if (kind === 'scale') el.style.transform = 'scale(.94)';
    else if (kind === 'fade') el.style.transform = 'none';
    else if (kind === 'left') el.style.transform = 'translateX(-22px)';
    else if (kind === 'right') el.style.transform = 'translateX(22px)';
    else el.style.transform = 'translate3d(0,18px,0)';
  }
  function playReveal(el) {
    unpend(el);
    var delay = +el.getAttribute('data-am-delay') || 0;
    if (REDUCED) { clearReveal(el); runRevealHooks(el); return; }
    setTimeout(function () {
      el.style.transition = 'opacity .72s cubic-bezier(.22,.61,.36,1), transform .72s cubic-bezier(.22,.61,.36,1)';
      requestAnimationFrame(function () { el.style.opacity = '1'; el.style.transform = 'none'; });
      setTimeout(function () { el.style.willChange = ''; el.style.transition = ''; }, 820 + delay);
      runRevealHooks(el);
    }, delay);
  }
  function clearReveal(el) { el.style.opacity = ''; el.style.transform = ''; el.style.willChange = ''; }
  // when an element reveals, also fire any count/ring it owns or contains
  function runRevealHooks(el) {
    var targets = [];
    if (el.hasAttribute && el.hasAttribute('data-am-count')) targets.push(el);
    if (el.querySelectorAll) Array.prototype.push.apply(targets, el.querySelectorAll('[data-am-count]'));
    targets.forEach(function (t) { if (t.__amCounted) return; t.__amCounted = 1; runCountHook(t); });
    var rings = [];
    if (el.hasAttribute && el.hasAttribute('data-am-ring')) rings.push(el);
    if (el.querySelectorAll) Array.prototype.push.apply(rings, el.querySelectorAll('[data-am-ring]'));
    rings.forEach(function (r) { if (r.__amRung) return; r.__amRung = 1; drawRing(r, +r.getAttribute('data-am-pct') || 0); });
  }

  // reveal(target, { kind, delay, stagger })
  // Stagger is applied ONLY to items in the initial viewport — items further
  // down reveal with no delay as they scroll in, so long pages never lag.
  function reveal(target, opts) {
    opts = opts || {};
    var els = resolve(target);
    var io = ensureRevealIO();
    var vh = window.innerHeight || 800, vis = 0;
    els.forEach(function (el) {
      if (el.__amReveal) return; el.__amReveal = 1;
      var kind = opts.kind || el.getAttribute('data-am-reveal') || 'up';
      if (opts.stagger) {
        var aboveFold = true; try { aboveFold = el.getBoundingClientRect().top < vh; } catch (e) {}
        var d = aboveFold ? (opts.delay || 0) + (vis++) * opts.stagger : 0;
        if (d) el.setAttribute('data-am-delay', d);
      } else if (opts.delay) el.setAttribute('data-am-delay', opts.delay);
      setRevealStart(el, kind);
      if (io) { io.observe(el); if (!REDUCED) { pendingReveal.push(el); scheduleRevealSafety(); } }
      else playReveal(el); // no IO → just play
    });
  }

  // ── SVG ring draw ─────────────────────────────────────────
  // drawRing(circleEl, pct 0..1, { dur, ease, from })
  function drawRing(circle, pct, opts) {
    if (!circle) return;
    opts = opts || {};
    var r = parseFloat(circle.getAttribute('r')) || 0;
    var C = 2 * Math.PI * r;
    pct = Math.max(0, Math.min(1, pct));
    if (!circle.getAttribute('stroke-dasharray')) circle.setAttribute('stroke-dasharray', C);
    var from = opts.from != null ? opts.from : 0;
    var dur = opts.dur != null ? opts.dur : 1200;
    if (circle.__amRing) { circle.__amRing(); circle.__amRing = null; }
    circle.__amRing = tween(dur, opts.ease || easeOutBackSoft, function (p) {
      var cur = from + (pct - from) * p;
      circle.setAttribute('stroke-dashoffset', C * (1 - cur));
    }, function () { circle.__amRing = null; });
  }

  // ── ring(): draw-in a progress ring with re-render dedup ──
  // Pages rebuild ring SVG via innerHTML each render, so call this after
  // setting innerHTML: ring(circleEl, pct, key). It draws from empty→pct on
  // first paint, animates old→new when the value changes, and does nothing
  // (instant) on a no-op re-render — keyed by a stable string so tab-focus /
  // 15s sync re-renders don't re-trigger the sweep. Flash-free: it sets the
  // start offset synchronously before the browser paints.
  var ringStore = (typeof Map !== 'undefined') ? new Map() : null;
  function ring(circle, pct, key) {
    if (!circle) return;
    pct = Math.max(0, Math.min(1, pct || 0));
    var r = parseFloat(circle.getAttribute('r')) || 0, C = 2 * Math.PI * r;
    if (!circle.getAttribute('stroke-dasharray')) circle.setAttribute('stroke-dasharray', C);
    var last = (ringStore && key != null) ? ringStore.get(key) : undefined;
    if (ringStore && key != null) ringStore.set(key, pct);
    if (REDUCED) { circle.setAttribute('stroke-dashoffset', C * (1 - pct)); return; }
    if (last != null && Math.abs(last - pct) < 0.001) { circle.setAttribute('stroke-dashoffset', C * (1 - pct)); return; }
    var from = (last != null) ? last : 0;
    circle.setAttribute('stroke-dashoffset', C * (1 - from)); // start state before paint → no flash of final
    drawRing(circle, pct, { from: from });
  }

  // ── celebratory burst (lightweight canvas particles) ──────
  // burst({ x, y, colors, count, spread, power })
  function burst(opts) {
    opts = opts || {};
    if (REDUCED || typeof document === 'undefined' || !document.body) return;
    var x = opts.x != null ? opts.x : (window.innerWidth / 2);
    var y = opts.y != null ? opts.y : (window.innerHeight / 2);
    var colors = opts.colors || ['#34E2B0', '#18C8C0', '#9B8CFF', '#F2C063', '#FF6B8B'];
    var n = opts.count || 46, spread = opts.spread || 1, power = opts.power || 1;
    var cv = document.createElement('canvas');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:99998;';
    cv.width = window.innerWidth * dpr; cv.height = window.innerHeight * dpr;
    document.body.appendChild(cv);
    var ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);
    var parts = [];
    for (var i = 0; i < n; i++) {
      var a = Math.random() * Math.PI * 2, sp = (4 + Math.random() * 7) * power;
      parts.push({ x: x, y: y, vx: Math.cos(a) * sp * spread, vy: Math.sin(a) * sp * spread - 2,
        size: 3 + Math.random() * 4, color: colors[(Math.random() * colors.length) | 0], life: 1, rot: Math.random() * 6 });
    }
    var start = now();
    (function frame() {
      var el = (now() - start) / 1400; if (el >= 1) { try { cv.remove(); } catch (e) {} return; }
      ctx.clearRect(0, 0, cv.width, cv.height);
      parts.forEach(function (p) {
        p.vy += 0.22; p.x += p.vx; p.y += p.vy; p.vx *= 0.99; p.life = 1 - el;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot += 0.1);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.6);
        ctx.restore();
      });
      requestAnimationFrame(frame);
    })();
  }

  // ── haptics (best-effort: Android/Chrome support it; iOS Safari is a no-op) ──
  function haptic(pattern) { try { if (navigator.vibrate) navigator.vibrate(pattern == null ? 12 : pattern); } catch (e) {} }

  // ── celebrate: one call for a milestone moment ─────────────
  // burst (skippable) + aurora flare + Nova happy + a haptic tap.
  function celebrate(opts) {
    opts = opts || {};
    if (opts.burst !== false) burst(opts);
    try { if (window.AuroraBG && window.AuroraBG.flare) window.AuroraBG.flare(); } catch (e) {}
    try { if (window.Nova && window.Nova.happy) window.Nova.happy(); } catch (e) {}
    haptic(opts.haptic != null ? opts.haptic : [12, 40, 18]);
  }

  // ── declarative count hook ────────────────────────────────
  function runCountHook(el) {
    var to = parseNum(el.getAttribute('data-am-count'));
    count(el, to, {
      decimals: el.hasAttribute('data-am-decimals') ? +el.getAttribute('data-am-decimals') : undefined,
      prefix: el.getAttribute('data-am-prefix') || '',
      suffix: el.getAttribute('data-am-suffix') || '',
      sep: el.hasAttribute('data-am-sep'),
      dur: el.hasAttribute('data-am-dur') ? +el.getAttribute('data-am-dur') : undefined
    });
  }

  // ── auto: scan declarative hooks ──────────────────────────
  function resolve(target) {
    if (!target) return [];
    if (typeof target === 'string') return Array.prototype.slice.call(document.querySelectorAll(target));
    if (target.nodeType === 1) return [target];
    if (target.length != null) return Array.prototype.slice.call(target);
    return [];
  }
  function auto(root) {
    root = root || document;
    // grouped staggered reveals — explicit opt-in AND the app's modern
    // `<main class="*-wrap">` pages get card reveals for free (zero edits).
    resolve('[data-am-reveal-group], main[class*="-wrap"]').forEach(function (group) {
      if (group.__amGroup) return; group.__amGroup = 1;
      var kids = Array.prototype.filter.call(group.children, function (c) {
        if (c.nodeType !== 1) return false;
        if (c.hasAttribute && c.hasAttribute('data-am-no-reveal')) return false;
        // never animate fixed/sticky children — a transform would break them
        try { var p = window.getComputedStyle ? getComputedStyle(c).position : ''; if (p === 'fixed' || p === 'sticky') return false; } catch (e) {}
        return true;
      });
      var stg = group.hasAttribute('data-am-stagger') ? +group.getAttribute('data-am-stagger') : 80;
      reveal(kids, { stagger: stg });
    });
    // individual reveals
    reveal('[data-am-reveal]');

    // auto count-up of the app's snapshot stats. Safe: only animates pure
    // integers in childless elements, so units (75<small>cm</small>),
    // money ("CHF 1.2k"), decimals and "—" are left untouched.
    resolve('[class$="-snap-v"], .im-stat b').forEach(function (el) {
      if (el.__amSnap) return; el.__amSnap = 1;
      if (el.children && el.children.length) return;
      var txt = (el.textContent || '').trim();
      if (!/^\d{1,9}$/.test(txt)) return;
      if (REDUCED) return;
      var target = parseInt(txt, 10);
      if (!target) return; // 0 → nothing to count
      var io = ensureRevealIO();
      el.textContent = '0';
      var fired = false, run = function () { if (fired) return; fired = true; count(el, target, { from: 0 }); };
      if (io) { var once = new IntersectionObserver(function (ents) { ents.forEach(function (en) { if (en.isIntersecting) { run(); once.unobserve(el); } }); }, { threshold: 0.1 }); once.observe(el); }
      setTimeout(run, 1500); // safety: never leave it stuck on 0
    });
    // counts / rings NOT inside a reveal still fire on their own scroll-in
    resolve('[data-am-count]').forEach(function (el) {
      if (el.__amReveal || el.__amCounted) return;            // handled via reveal
      var io = ensureRevealIO();
      if (!io) { el.__amCounted = 1; runCountHook(el); return; }
      el.style.opacity = el.style.opacity || ''; // leave layout intact
      var once = new IntersectionObserver(function (ents) {
        ents.forEach(function (en) { if (en.isIntersecting && !el.__amCounted) { el.__amCounted = 1; runCountHook(el); once.unobserve(el); } });
      }, { threshold: 0.1 });
      once.observe(el);
    });
    resolve('[data-am-ring]').forEach(function (el) {
      if (el.__amReveal || el.__amRung) return;
      var io = ensureRevealIO();
      if (!io) { el.__amRung = 1; drawRing(el, +el.getAttribute('data-am-pct') || 0); return; }
      var once = new IntersectionObserver(function (ents) {
        ents.forEach(function (en) { if (en.isIntersecting && !el.__amRung) { el.__amRung = 1; drawRing(el, +el.getAttribute('data-am-pct') || 0); once.unobserve(el); } });
      }, { threshold: 0.1 });
      once.observe(el);
    });
  }

  // ── lazy GSAP loader (for heavy scroll-scrub pages, Phase 5) ──
  var gsapLoading = null;
  function loadGSAP(cb, plugins) {
    plugins = plugins || ['ScrollTrigger'];
    if (window.gsap && plugins.every(function (p) { return window[p]; })) { cb && cb(window.gsap); return; }
    if (gsapLoading) { gsapLoading.then(function () { cb && cb(window.gsap); }); return; }
    function inject(src) { return new Promise(function (res, rej) { var s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); }); }
    gsapLoading = inject('vendor/gsap.min.js').then(function () {
      return Promise.all(plugins.map(function (p) { return inject('vendor/' + p + '.min.js'); }));
    }).then(function () {
      if (window.gsap && window.ScrollTrigger) window.gsap.registerPlugin(window.ScrollTrigger);
      if (window.gsap && window.Flip) window.gsap.registerPlugin(window.Flip);
      if (window.gsap && window.SplitText) window.gsap.registerPlugin(window.SplitText);
    });
    gsapLoading.then(function () { cb && cb(window.gsap); }).catch(function () {});
  }

  // ── public API ────────────────────────────────────────────
  window.AuroraMotion = {
    get reduced() { return REDUCED; },
    reveal: reveal,
    count: count,
    drawRing: drawRing,
    ring: ring,
    burst: burst,
    haptic: haptic,
    celebrate: celebrate,
    auto: auto,
    refresh: function (root) { auto(root); },
    loadGSAP: loadGSAP,
    // internals exposed for the self-test harness (harmless in app)
    _fmtNum: fmtNum, _parseNum: parseNum, _ease: { easeOutExpo: easeOutExpo, easeOutCubic: easeOutCubic, easeOutBackSoft: easeOutBackSoft }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { auto(); }, { once: true });
  else auto();
})();
