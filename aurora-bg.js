// =============================================================
// AURORA Living Background — the data-reactive ambient field.
//
// Injected on every page (by topbar.js) as a fixed, behind-content
// (z-index:-1, pointer-events:none) layer. It's a SOUL, not wallpaper:
// soft aurora blobs drift slowly behind the UI and their palette /
// intensity / pace react to your state — time of day, last night's
// recovery, whether you trained today, and your goal streak. A PR or
// win can fire a one-shot flare via AuroraBG.flare().
//
// Performance: pure CSS animation (GPU-composited transforms, no
// per-frame JS), so it's battery-friendly and jank-free. JS only reads
// localStorage once and sets a handful of CSS variables. Respects
// prefers-reduced-motion (blobs hold still, palette stays). Skips
// iframes (embedded water) and any <body data-no-aurora>.
// =============================================================
(function () {
  'use strict';
  if (window.AuroraBG) return;
  try { if (window.top !== window.self) return; } catch (e) { return; } // embedded → skip

  var reduced = false;
  try { reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  function ls(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
  function pad(n) { return String(n).padStart(2, '0'); }
  function todayKey() { var d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  // ── read the live state from localStorage ─────────────────
  function readState() {
    var h = new Date().getHours();
    var tod = h < 5 ? 'night' : h < 9 ? 'dawn' : h < 17 ? 'day' : h < 22 ? 'dusk' : 'night';

    var rec = null;
    var sl = ls('sleep:logs');
    if (Array.isArray(sl) && sl.length) {
      var last = sl[sl.length - 1];
      if (last && typeof last.recovery === 'number') rec = last.recovery;
    }

    var trained = false;
    var done = ls('po_coach_workout_done');
    if (done && done[todayKey()]) trained = true;
    else { var w = ls('po_workouts'); if (Array.isArray(w)) trained = w.some(function (x) { return x && x.date === todayKey(); }); }

    var streak = 0;
    var gs = ls('goal_streak_v1');
    if (gs && typeof gs.count === 'number') streak = gs.count; else if (typeof gs === 'number') streak = gs;

    return { tod: tod, rec: rec, trained: trained, streak: streak, hour: h };
  }

  // ── map state → visual (palette / intensity / pace) ───────
  // colors are "r,g,b" strings used in rgba(var(--ab-cN), a)
  var BASE = {
    night: { c1: '120,110,235', c2: '70,90,200', c3: '24,140,150', alpha: 0.40, speed: 1.28 }, // deep, calm
    dawn:  { c1: '255,140,150', c2: '245,190,120', c3: '160,150,255', alpha: 0.42, speed: 1.06 }, // warm wake
    day:   { c1: '52,226,176', c2: '24,200,192', c3: '120,180,250', alpha: 0.50, speed: 0.92 }, // fresh, alive
    dusk:  { c1: '150,130,255', c2: '24,200,192', c3: '240,180,120', alpha: 0.46, speed: 1.00 }  // rich
  };
  function computeVisual(s) {
    var b = BASE[s.tod] || BASE.day;
    var v = { c1: b.c1, c2: b.c2, c3: b.c3, alpha: b.alpha, speed: b.speed };

    // recovery bias: recovered → emerald/teal & calm; depleted → amber & heavy
    if (s.rec != null) {
      if (s.rec >= 70) { v.c1 = '52,226,176'; v.c2 = '24,200,192'; v.alpha += 0.05; }
      else if (s.rec < 45) { v.c2 = '235,170,90'; v.c3 = '230,120,110'; v.alpha -= 0.04; v.speed *= 1.18; }
    }
    // trained today → a touch more alive
    if (s.trained) { v.alpha += 0.05; v.speed *= 0.94; }
    // streak → subtle vitality, capped
    v.alpha += clamp(s.streak, 0, 7) * 0.006;

    v.alpha = clamp(v.alpha, 0.30, 0.66);
    v.speed = clamp(v.speed, 0.80, 1.40);
    return v;
  }

  // ── inject CSS + DOM once ─────────────────────────────────
  var CSS =
    '#aurora-bg{position:fixed;inset:0;z-index:-1;overflow:hidden;pointer-events:none;background:var(--au-void,#050506);' +
      'contain:strict;--ab-alpha:.5;--ab-speed:1;--ab-c1:52,226,176;--ab-c2:24,200,192;--ab-c3:120,180,250;}' +
    '#aurora-bg .ab-blob{position:absolute;border-radius:50%;mix-blend-mode:screen;opacity:var(--ab-alpha);will-change:transform;' +
      'transition:opacity 1.4s ease;}' +
    '#aurora-bg .ab-b1{width:92vw;height:92vw;left:-26vw;top:-22vh;' +
      'background:radial-gradient(circle at 50% 50%,rgba(var(--ab-c1),.60),rgba(var(--ab-c1),0) 66%);' +
      'animation:abD1 calc(var(--ab-speed)*46s) ease-in-out infinite;}' +
    '#aurora-bg .ab-b2{width:84vw;height:84vw;right:-24vw;top:6vh;' +
      'background:radial-gradient(circle at 50% 50%,rgba(var(--ab-c2),.55),rgba(var(--ab-c2),0) 64%);' +
      'animation:abD2 calc(var(--ab-speed)*58s) ease-in-out infinite;}' +
    '#aurora-bg .ab-b3{width:80vw;height:80vw;left:8vw;bottom:-30vh;' +
      'background:radial-gradient(circle at 50% 50%,rgba(var(--ab-c3),.50),rgba(var(--ab-c3),0) 64%);' +
      'animation:abD3 calc(var(--ab-speed)*52s) ease-in-out infinite;}' +
    '#aurora-bg .ab-flare-layer{position:absolute;inset:0;opacity:0;mix-blend-mode:screen;' +
      'background:radial-gradient(circle at 50% 40%,rgba(52,226,176,.5),rgba(155,140,255,.25) 40%,transparent 70%);}' +
    '#aurora-bg.ab-flare .ab-flare-layer{animation:abFlare 1.9s ease-out forwards;}' +
    '@keyframes abD1{0%{transform:translate3d(0,0,0) scale(1)}50%{transform:translate3d(10vw,8vh,0) scale(1.12)}100%{transform:translate3d(0,0,0) scale(1)}}' +
    '@keyframes abD2{0%{transform:translate3d(0,0,0) scale(1.05)}50%{transform:translate3d(-12vw,10vh,0) scale(.92)}100%{transform:translate3d(0,0,0) scale(1.05)}}' +
    '@keyframes abD3{0%{transform:translate3d(0,0,0) scale(1)}50%{transform:translate3d(8vw,-9vh,0) scale(1.14)}100%{transform:translate3d(0,0,0) scale(1)}}' +
    '@keyframes abFlare{0%{opacity:0;transform:scale(.6)}30%{opacity:.55}100%{opacity:0;transform:scale(1.25)}}' +
    '@media (prefers-reduced-motion: reduce){#aurora-bg .ab-blob{animation:none!important}#aurora-bg.ab-flare .ab-flare-layer{animation:none!important}}';

  var el = null;
  function inject() {
    if (document.getElementById('aurora-bg')) { el = document.getElementById('aurora-bg'); return; }
    var st = document.createElement('style'); st.id = 'aurora-bg-css'; st.textContent = CSS;
    (document.head || document.documentElement).appendChild(st);
    el = document.createElement('div'); el.id = 'aurora-bg'; el.setAttribute('aria-hidden', 'true');
    el.innerHTML = '<span class="ab-blob ab-b1"></span><span class="ab-blob ab-b2"></span><span class="ab-blob ab-b3"></span><span class="ab-flare-layer"></span>';
    // insert as the FIRST child so it sits behind everything else in the body
    if (document.body.firstChild) document.body.insertBefore(el, document.body.firstChild);
    else document.body.appendChild(el);
  }

  function apply(v) {
    if (!el) return;
    el.style.setProperty('--ab-c1', v.c1);
    el.style.setProperty('--ab-c2', v.c2);
    el.style.setProperty('--ab-c3', v.c3);
    el.style.setProperty('--ab-alpha', v.alpha.toFixed(3));
    el.style.setProperty('--ab-speed', v.speed.toFixed(3));
  }

  function refresh() { if (el) apply(computeVisual(readState())); }

  // ── public API ────────────────────────────────────────────
  window.AuroraBG = {
    refresh: refresh,
    readState: readState,
    computeVisual: computeVisual,
    flare: function () {
      if (!el || reduced) return;
      el.classList.remove('ab-flare'); void el.offsetWidth; el.classList.add('ab-flare');
      setTimeout(function () { if (el) el.classList.remove('ab-flare'); }, 2000);
    }
  };

  function boot() {
    if (!document.body) return;
    if (document.body.hasAttribute('data-no-aurora')) return; // bespoke-bg pages opt out
    inject();
    refresh();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
  // re-evaluate when the app returns to foreground (time of day / fresh data may have changed)
  document.addEventListener('visibilitychange', function () { if (!document.hidden) refresh(); });
})();
