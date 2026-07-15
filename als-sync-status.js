/* ════════════════════════════════════════════════════════════════
   als-sync-status.js — the "is it actually saved?" indicator.

   The sync engines used to save silently: when a write failed you had no way to
   know until data went missing days later. This gives sync a VOICE — a small,
   always-readable pill tucked under the account circle (top-right). It reads
   "Saved · 3m ago" when all is well, "Saving…" while a change is in flight, and
   turns amber ("Not saved" / "Offline") the moment something hasn't reached the
   cloud — tap it to retry.

   The sync engines (sync.js, pocoach-sync.js) report into window.ALSSyncStatus:
     .queued()  a local change is waiting to be saved
     .ok()      a push/pull reached the cloud (we're in sync)
     .fail()    a push/pull failed (something is NOT saved)
   They call these defensively, so load order never matters. `lastOk` persists in
   localStorage, so the reassuring state reads true immediately on every page —
   even ones that don't sync themselves (like home).
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

  var el, dotEl, txtEl, seen = state.lastOk > 0, agoTimer;

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

  function mode() {                                   // offline > error > pending > synced
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
    el.id = 'alsSync'; el.type = 'button'; el.setAttribute('aria-live', 'polite');
    dotEl = document.createElement('span'); dotEl.className = 'als-sync-dot';
    txtEl = document.createElement('span'); txtEl.className = 'als-sync-txt';
    el.appendChild(dotEl); el.appendChild(txtEl);

    var css = document.createElement('style');
    css.textContent =
      '#alsSync{position:fixed;top:56px;right:14px;z-index:47;' +
      'display:inline-flex;align-items:center;gap:7px;padding:6px 11px 6px 9px;' +
      'border:1px solid rgba(255,255,255,.09);border-radius:999px;' +
      'background:rgba(12,12,14,.62);-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px);' +
      'font:600 11.5px/1 -apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;' +
      'letter-spacing:.01em;color:rgba(245,242,236,.8);cursor:pointer;-webkit-tap-highlight-color:transparent;' +
      'box-shadow:0 5px 18px rgba(0,0,0,.38);opacity:0;transform:translateY(-5px) scale(.96);pointer-events:none;' +
      'transition:opacity .4s cubic-bezier(.16,1,.3,1),transform .4s cubic-bezier(.16,1,.3,1),border-color .3s,background .3s,color .3s;}' +
      '#alsSync.show{opacity:1;transform:none;pointer-events:auto;}' +
      '#alsSync .als-sync-dot{flex:none;width:7px;height:7px;border-radius:50%;background:#34E2B0;transition:background .3s;}' +
      '#alsSync .als-sync-txt{white-space:nowrap;}' +
      '#alsSync.m-saving .als-sync-dot{animation:alsSyncPulse 1.3s ease-in-out infinite;}' +
      '@keyframes alsSyncPulse{0%,100%{box-shadow:0 0 0 0 rgba(52,226,176,.5);}50%{box-shadow:0 0 0 5px rgba(52,226,176,0);}}' +
      '#alsSync.m-error,#alsSync.m-offline{border-color:rgba(242,192,99,.45);background:rgba(30,22,8,.72);color:#F6E4BE;}' +
      '#alsSync.m-error .als-sync-dot,#alsSync.m-offline .als-sync-dot{background:#F2C063;animation:alsSyncBlink 1.6s step-end infinite;}' +
      '@keyframes alsSyncBlink{0%,60%{opacity:1;}61%,100%{opacity:.35;}}' +
      '@media (prefers-reduced-motion:reduce){#alsSync .als-sync-dot{animation:none!important;}}';
    document.head.appendChild(css);

    el.addEventListener('click', onTap);
    (document.body || document.documentElement).appendChild(el);
    place();
    window.addEventListener('resize', place);
    // The account circle is injected by topbar.js a moment after load — keep
    // trying to tuck under it until it appears, then stop.
    var tries = 0, iv = setInterval(function () { if (place() || tries++ > 30) clearInterval(iv); }, 250);
  }

  // Sit just under the account circle, right-aligned to it — works whether the
  // circle is in the normal top bar or floated on the home page. Returns true
  // once the circle was found and used.
  function place() {
    if (!el) return false;
    var acct = document.getElementById('topbarAcct');
    if (acct) {
      var r = acct.getBoundingClientRect();
      if (r.width || r.height) {
        el.style.top = (r.bottom + 8) + 'px';
        el.style.right = Math.max(8, window.innerWidth - r.right) + 'px';
        return true;
      }
    }
    return false;
  }

  function render() {
    ensureEl();
    var m = mode();
    el.className = 'm-' + m + (seen ? ' show' : '');
    txtEl.textContent = label(m);
    el.setAttribute('aria-label', 'Sync status: ' + label(m));
    place();
    // keep the "· 3m ago" text honest while the page sits open
    clearTimeout(agoTimer);
    if (m === 'synced' && state.lastOk) agoTimer = setTimeout(render, 60000);
  }
  function reveal() { seen = true; render(); }

  function onTap() {
    var m = mode();
    if (m === 'error' || m === 'offline') {
      try { if (window.ALSSync && window.ALSSync.flush) window.ALSSync.flush(); } catch (e) {}
      try { window.dispatchEvent(new Event('online')); } catch (e) {}
      try { document.dispatchEvent(new Event('visibilitychange')); } catch (e) {}   // nudge pocoach foreground sync
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

  function boot() { if (seen) render(); }             // show the reassuring state right away if we've ever synced
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
