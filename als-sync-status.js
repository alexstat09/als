/* ════════════════════════════════════════════════════════════════
   als-sync-status.js — the "is it actually saved?" indicator.

   The sync engines used to save silently: when a write failed you had no way to
   know until data went missing days later. This gives sync a VOICE. It's quiet
   when everything's fine (collapses to a small dot) and speaks up the moment a
   change hasn't reached the cloud.

   The sync engines (sync.js, pocoach-sync.js) report into window.ALSSyncStatus:
     .queued()  a local change is waiting to be saved
     .ok()      a push/pull reached the cloud (we're in sync)
     .fail()    a push/pull failed (something is NOT saved)
   They call these defensively, so load order never matters.

   Display priority: offline > not-saved > saving > saved. `lastOk` persists in
   localStorage so "Saved · 3m ago" survives a reload and reads true immediately.
   ════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.ALSSyncStatus) return;

  var LS_OK = 'als:sync:lastOk';
  var state = {
    pending: false,
    error: false,
    offline: (typeof navigator !== 'undefined' && navigator.onLine === false),
    lastOk: (function () { try { return +localStorage.getItem(LS_OK) || 0; } catch (e) { return 0; } })()
  };

  var el, dotEl, txtEl, collapseTimer, seen = state.lastOk > 0;

  function ago(ms) {
    if (!ms) return '';
    var s = Math.max(0, Math.round((Date.now() - ms) / 1000));
    if (s < 45) return 'just now';
    var m = Math.round(s / 60);
    if (m < 60) return m + 'm ago';
    var h = Math.round(m / 60);
    if (h < 24) return h + 'h ago';
    return Math.round(h / 24) + 'd ago';
  }

  // offline > error > pending > synced
  function mode() {
    if (state.offline) return 'offline';
    if (state.error) return 'error';
    if (state.pending) return 'saving';
    return 'synced';
  }

  function label(m) {
    if (m === 'offline') return 'Offline';
    if (m === 'error') return 'Not saved';
    if (m === 'saving') return 'Saving…';
    return state.lastOk ? ('Saved · ' + ago(state.lastOk)) : 'Saved';
  }

  function ensureEl() {
    if (el) return;
    el = document.createElement('button');
    el.id = 'alsSync';
    el.type = 'button';
    el.setAttribute('aria-live', 'polite');
    dotEl = document.createElement('span'); dotEl.className = 'als-sync-dot';
    txtEl = document.createElement('span'); txtEl.className = 'als-sync-txt';
    el.appendChild(dotEl); el.appendChild(txtEl);

    var css = document.createElement('style');
    css.textContent =
      '#alsSync{position:fixed;left:calc(env(safe-area-inset-left) + 14px);' +
      'bottom:calc(env(safe-area-inset-bottom) + var(--als-sync-lift,16px));z-index:58;' +
      'display:inline-flex;align-items:center;gap:8px;padding:7px 13px 7px 11px;' +
      'border:1px solid rgba(255,255,255,.09);border-radius:999px;' +
      'background:rgba(12,12,14,.66);-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px);' +
      'font:600 12px/1 -apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;' +
      'letter-spacing:.01em;color:rgba(245,242,236,.82);cursor:pointer;-webkit-tap-highlight-color:transparent;' +
      'box-shadow:0 6px 22px rgba(0,0,0,.4);opacity:0;transform:translateY(6px) scale(.96);' +
      'transition:opacity .45s cubic-bezier(.16,1,.3,1),transform .45s cubic-bezier(.16,1,.3,1),border-color .3s,background .3s;}' +
      '#alsSync.show{opacity:1;transform:none;}' +
      '#alsSync .als-sync-dot{flex:none;width:8px;height:8px;border-radius:50%;background:#34E2B0;' +
      'box-shadow:0 0 0 0 rgba(52,226,176,.5);transition:background .3s;}' +
      '#alsSync .als-sync-txt{max-width:180px;overflow:hidden;white-space:nowrap;' +
      'transition:max-width .45s cubic-bezier(.16,1,.3,1),opacity .3s,margin .45s;}' +
      /* collapsed = just the dot, once everything is calm and saved */
      '#alsSync.mini .als-sync-txt{max-width:0;opacity:0;margin-left:-8px;}' +
      '#alsSync.mini{padding-right:11px;}' +
      /* saving: gentle breathing pulse */
      '#alsSync.m-saving .als-sync-dot{background:#34E2B0;animation:alsSyncPulse 1.3s ease-in-out infinite;}' +
      '@keyframes alsSyncPulse{0%,100%{box-shadow:0 0 0 0 rgba(52,226,176,.5);}50%{box-shadow:0 0 0 5px rgba(52,226,176,0);}}' +
      /* not-saved / offline: amber, steady, attention-catching but not alarmist */
      '#alsSync.m-error,#alsSync.m-offline{border-color:rgba(242,192,99,.42);background:rgba(30,22,8,.72);color:#F6E4BE;}' +
      '#alsSync.m-error .als-sync-dot,#alsSync.m-offline .als-sync-dot{background:#F2C063;animation:alsSyncBlink 1.6s step-end infinite;}' +
      '@keyframes alsSyncBlink{0%,60%{opacity:1;}61%,100%{opacity:.35;}}' +
      '@media (prefers-reduced-motion:reduce){#alsSync .als-sync-dot{animation:none!important;}}';
    document.head.appendChild(css);

    el.addEventListener('click', onTap);
    (document.body || document.documentElement).appendChild(el);

    // Sit above a bottom nav if the page has one.
    try {
      if (document.getElementById('bottombar') || document.body.classList.contains('has-bottombar')) {
        el.style.setProperty('--als-sync-lift', '84px');
      }
    } catch (e) {}
  }

  function render() {
    ensureEl();
    var m = mode();
    el.className = 'm-' + m + (seen ? ' show' : '');
    dotEl.className = 'als-sync-dot';
    txtEl.textContent = label(m);
    el.setAttribute('aria-label', 'Sync status: ' + label(m));

    // Collapse to just the dot only in the calm, all-saved state.
    clearTimeout(collapseTimer);
    if (m === 'synced') {
      collapseTimer = setTimeout(function () { if (mode() === 'synced' && !el.matches(':hover')) el.classList.add('mini'); }, 2600);
    } else {
      el.classList.remove('mini');
    }
  }

  function reveal() { seen = true; render(); }

  function onTap() {
    // Expand for a few seconds, and if something's wrong, ask the engines to retry now.
    el.classList.remove('mini');
    render();
    var m = mode();
    if (m === 'error' || m === 'offline') {
      try { if (window.ALSSync && window.ALSSync.flush) window.ALSSync.flush(); } catch (e) {}
      try { window.dispatchEvent(new Event('online')); } catch (e) {}   // nudge pocoach's foreground sync
      try { document.dispatchEvent(new Event('visibilitychange')); } catch (e) {}
    } else if (m === 'synced') {
      clearTimeout(collapseTimer);
      collapseTimer = setTimeout(function () { if (mode() === 'synced') el.classList.add('mini'); }, 2600);
    }
  }

  window.addEventListener('online',  function () { state.offline = false; reveal(); });
  window.addEventListener('offline', function () { state.offline = true;  reveal(); });

  window.ALSSyncStatus = {
    queued: function () { state.pending = true; reveal(); },
    ok: function () {
      state.pending = false; state.error = false; state.lastOk = Date.now();
      try { localStorage.setItem(LS_OK, String(state.lastOk)); } catch (e) {}
      reveal();
    },
    fail: function () { state.error = true; reveal(); },
    get: function () { return { mode: mode(), lastOk: state.lastOk }; }
  };

  // First paint: if we've ever synced, show the reassuring state right away.
  function boot() { if (seen) render(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
