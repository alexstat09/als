// ════════════════════════════════════════════════════════════════
// Global error toast — the app's "something broke" surface.
//
// Until now a runtime error (a thrown exception, a rejected promise, a
// failed fetch the page didn't handle) failed SILENTLY — the only sign was
// a half-rendered page you'd find by chance. This catches them and shows a
// small, on-brand, auto-dismissing toast so breakage is visible.
//
// Self-injecting: drop <script src="error-toast.js"> on a page, or let
// topbar.js load it everywhere. Exposes window.ALSToast.show(msg, type) so
// app code can also surface a friendly message on a caught failure:
//     ALSToast.show('Couldn’t reach the food database — try again.', 'warn')
// type: 'err' (default) | 'warn' | 'ok' | 'info'.
//
// It is deliberately quiet: it dedupes repeated identical errors, ignores
// noise (cross-origin "Script error.", browser-extension frames, benign
// resource 404s), rate-limits, and never throws from inside itself.
// ════════════════════════════════════════════════════════════════
(function () {
  'use strict';
  if (window.ALSToast) return;

  var MAX_VISIBLE = 3;       // never stack more than this
  var DEDUPE_MS = 8000;      // same message within this window → ignore
  var DEFAULT_TTL = 6500;    // auto-dismiss after (ms); errors linger a bit
  var lastSeen = {};         // message → timestamp
  var wrap = null;

  function injectStyle() {
    if (document.getElementById('als-toast-style')) return;
    var css = '' +
      '#als-toast-wrap{position:fixed;left:0;right:0;bottom:calc(86px + env(safe-area-inset-bottom));z-index:100000;' +
        'display:flex;flex-direction:column;align-items:center;gap:8px;pointer-events:none;padding:0 14px;}' +
      '.als-toast{pointer-events:auto;max-width:440px;width:100%;display:flex;align-items:flex-start;gap:10px;' +
        'padding:12px 14px;border-radius:13px;font-family:var(--au-sans,-apple-system,system-ui,sans-serif);' +
        'font-size:13px;line-height:1.45;color:#F4F1EA;background:rgba(20,20,24,.92);backdrop-filter:blur(10px);' +
        '-webkit-backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.10);box-shadow:0 10px 34px rgba(0,0,0,.5);' +
        'transform:translateY(14px);opacity:0;transition:transform .26s cubic-bezier(.2,.8,.2,1),opacity .26s;}' +
      '.als-toast.in{transform:translateY(0);opacity:1;}' +
      '.als-toast .ic{flex:none;font-size:15px;line-height:1.3;}' +
      '.als-toast .bd{flex:1;min-width:0;word-break:break-word;}' +
      '.als-toast .x{flex:none;cursor:pointer;color:rgba(244,241,234,.4);font-size:16px;line-height:1.2;padding:0 2px;}' +
      '.als-toast .x:hover{color:#F4F1EA;}' +
      '.als-toast.err{border-color:rgba(255,107,139,.4);} .als-toast.err .ic{color:#FF6B8B;}' +
      '.als-toast.warn{border-color:rgba(242,192,99,.4);} .als-toast.warn .ic{color:#F2C063;}' +
      '.als-toast.ok{border-color:rgba(52,226,176,.4);} .als-toast.ok .ic{color:#34E2B0;}' +
      '.als-toast.info{border-color:rgba(124,211,252,.4);} .als-toast.info .ic{color:#7CD3FC;}' +
      '@media(max-width:480px){#als-toast-wrap{bottom:calc(78px + env(safe-area-inset-bottom));}}';
    var st = document.createElement('style'); st.id = 'als-toast-style'; st.textContent = css;
    (document.head || document.documentElement).appendChild(st);
  }

  function ensureWrap() {
    if (wrap && document.body.contains(wrap)) return wrap;
    injectStyle();
    wrap = document.getElementById('als-toast-wrap');
    if (!wrap) { wrap = document.createElement('div'); wrap.id = 'als-toast-wrap'; document.body.appendChild(wrap); }
    return wrap;
  }

  var ICONS = { err: '⚠', warn: '⚠', ok: '✓', info: '◈' };

  function show(msg, type, ttl) {
    try {
      msg = (msg == null ? '' : String(msg)).trim();
      if (!msg) return;
      if (msg.length > 220) msg = msg.slice(0, 217) + '…';
      type = (type === 'warn' || type === 'ok' || type === 'info') ? type : 'err';

      var now = Date.now();
      if (lastSeen[msg] && (now - lastSeen[msg]) < DEDUPE_MS) return; // dedupe
      lastSeen[msg] = now;

      if (!document.body) { // DOM not ready yet — retry shortly
        document.addEventListener('DOMContentLoaded', function () { show(msg, type, ttl); }, { once: true });
        return;
      }
      var w = ensureWrap();
      while (w.children.length >= MAX_VISIBLE) w.removeChild(w.firstChild);

      var t = document.createElement('div');
      t.className = 'als-toast ' + type;
      var ic = document.createElement('span'); ic.className = 'ic'; ic.textContent = ICONS[type] || '⚠';
      var bd = document.createElement('span'); bd.className = 'bd'; bd.textContent = msg; // textContent → no injection
      var x = document.createElement('span'); x.className = 'x'; x.textContent = '×';
      t.appendChild(ic); t.appendChild(bd); t.appendChild(x);
      w.appendChild(t);
      requestAnimationFrame(function () { t.classList.add('in'); });

      var killed = false;
      function dismiss() { if (killed) return; killed = true; t.classList.remove('in');
        setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 300); }
      x.addEventListener('click', dismiss);
      setTimeout(dismiss, ttl || (type === 'err' ? DEFAULT_TTL + 2000 : DEFAULT_TTL));
    } catch (e) { /* a toast must never break the page */ }
  }

  // Should we surface this error, or is it noise we can't act on?
  function isNoise(msg) {
    if (!msg) return true;
    var m = String(msg);
    if (/^Script error\.?$/i.test(m)) return true;                 // cross-origin, no detail
    if (/ResizeObserver loop/i.test(m)) return true;               // benign browser warning
    if (/extension|chrome-extension|moz-extension|safari-web/i.test(m)) return true;
    return false;
  }

  window.addEventListener('error', function (e) {
    // Resource load failures (img/script/link) bubble here with no e.message.
    if (e && e.target && e.target !== window && e.target.tagName) {
      var tag = e.target.tagName.toLowerCase();
      if (tag === 'script' || tag === 'link') {
        var url = e.target.src || e.target.href || '';
        if (url && url.indexOf('chrome-extension') === -1) show('Failed to load ' + url.split('/').pop() + ' — some features may not work.', 'warn');
      }
      return; // ignore img/other resource noise
    }
    var msg = e && (e.message || (e.error && e.error.message));
    if (isNoise(msg)) return;
    show('Something glitched: ' + msg, 'err');
  }, true);

  window.addEventListener('unhandledrejection', function (e) {
    var r = e && e.reason;
    var msg = r && (r.message || (typeof r === 'string' ? r : '')) || 'a background task failed';
    if (isNoise(msg)) return;
    show('Something glitched: ' + msg, 'err');
  });

  window.ALSToast = { show: show };
})();
