/* ════════════════════════════════════════════════════════════════
   als-sync-status.js — the sync watchdog.

   This was an always-on pill ("Saved · 3m ago") in the corner of all 33 pages.
   Two things were wrong with it.

   It was noise. It sat there reporting success on a screen where success is
   the only thing that ever happens, so it earned nothing and cost attention.

   And it lied. The engines could call ok() without having pushed anything —
   pocoach-sync fired ok() when a PULL succeeded, regardless of whether our own
   write landed, and both engines advanced their "already pushed" marker before
   the write was confirmed. So a green pill was not evidence. On 14/07/26 that
   cost four days of weigh-ins: they lived on one phone while the cloud, and
   the laptop, knew nothing.

   That is fixed at the source (sync.js / pocoach-sync.js): ok() means the
   cloud CONFIRMED the write, the "already pushed" marker only advances on that
   confirmation, and both engines retry every 15s until it lands.

   ── 22/07/26: why it stayed silent through THREE rounds of lost weigh-ins ──

   Both of those were real fixes and neither could work, because the watchdog
   itself had two holes that made a permanent failure look exactly like health.

   1. ONE SHARED COUNTER FOR EVERY ENGINE. sync.js and pocoach-sync.js both
      called the same ok()/fail(), and ok() zeroed `failingSince` outright. So
      sync.js — which was working perfectly — reset the clock on pocoach-sync's
      failures roughly every 15 seconds. The two-minute threshold could never
      be reached. The engine that owns the weigh-ins was failing 100% of the
      time and the banner mathematically could not appear. State is now kept
      PER ENGINE, and a healthy one can no longer vouch for a broken one.

   2. IT ALL LIVED IN MEMORY. Every navigation started the clock at zero, and
      he navigates constantly. Closing the app forgot everything. So "stuck for
      two minutes" really meant "stuck for two minutes without touching
      anything", which almost never happened. The unsent-since stamp now lives
      in localStorage, per engine, and survives navigation, reload, app restart
      and days of being closed.

   It still shows NOTHING when things work, and nothing while a blip heals. It
   speaks when data has genuinely been stuck on this device, with the network
   up. Silence means saved — and now that is a promise the code can keep.

   The API the engines call is unchanged; `name` is optional and additive:
     .queued(name)  a local change is waiting
     .ok(name)      a write REACHED the cloud
     .fail(name)    a write did not
   ════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.ALSSyncStatus) return;

  /* The engines retry every 15s. Two minutes of unbroken failure is ~8 straight
     attempts — long past any blip, and far short of nagging. */
  var STRANDED_MS = 2 * 60 * 1000;
  var TICK_MS = 20 * 1000;
  var STORE = 'als:sync-stuck';          // { engine: firstFailedAtMs }
  var ESTORE = 'als:sync-errd';          // { engine: lastErrorDetail } — kept separate
                                          // so STORE stays a pure {engine:ms} map (stuckSince
                                          // does +s[k]; mixing a string in would poison it).

  var el = null, txtEl = null, detEl = null, tick = null;

  function isOnline() { try { return navigator.onLine !== false; } catch (e) { return true; } }

  /* Persisted so a failure outlives the page that noticed it. Written on every
     transition rather than on a timer: a tab that is about to be suspended gets
     no timer, and that is precisely the case that kept going unreported. */
  function load() {
    try { var o = JSON.parse(localStorage.getItem(STORE)); return (o && typeof o === 'object' && !Array.isArray(o)) ? o : {}; }
    catch (e) { return {}; }
  }
  function save(o) {
    try {
      if (o && Object.keys(o).length) localStorage.setItem(STORE, JSON.stringify(o));
      else localStorage.removeItem(STORE);
    } catch (e) {}
  }

  /* The oldest engine still stuck, or 0. Per engine: one engine succeeding says
     nothing about another, and treating it as reassurance is the bug that hid
     three rounds of missing weigh-ins. */
  function stuckSince() {
    var s = load(), oldest = 0;
    for (var k in s) {
      if (!Object.prototype.hasOwnProperty.call(s, k)) continue;
      var t = +s[k];
      if (t > 0 && (!oldest || t < oldest)) oldest = t;
    }
    return oldest;
  }
  function stuckNames() {
    var s = load(), out = [];
    for (var k in s) { if (Object.prototype.hasOwnProperty.call(s, k) && +s[k] > 0) out.push(k); }
    return out;
  }
  function loadErr() {
    try { var o = JSON.parse(localStorage.getItem(ESTORE)); return (o && typeof o === 'object' && !Array.isArray(o)) ? o : {}; }
    catch (e) { return {}; }
  }
  function saveErr(o) {
    try { if (o && Object.keys(o).length) localStorage.setItem(ESTORE, JSON.stringify(o)); else localStorage.removeItem(ESTORE); }
    catch (e) {}
  }
  /* "gym & weigh-ins · HTTP 401" for every engine still stuck — the one line
     that turns "something is stuck" into a cause anyone can read off the screen. */
  function stuckDetail() {
    var errs = loadErr(), names = stuckNames(), parts = [];
    for (var i = 0; i < names.length; i++) {
      var d = errs[names[i]];
      parts.push(names[i] + (d ? ' · ' + d : ''));
    }
    return parts.join('   ');
  }

  /* Stuck, and it is not the network's fault. Offline is excluded on purpose:
     a tunnel is not a bug, the data is safe locally, and it will heal on its
     own the moment there is signal. Interrupting for that would teach him to
     ignore this — and then it is worthless on the day it matters. */
  function stranded() {
    var since = stuckSince();
    return since > 0 && isOnline() && (Date.now() - since) >= STRANDED_MS;
  }

  function human(ms) {
    var m = Math.round(ms / 60000);
    if (m < 60) return Math.max(1, m) + ' min';
    var h = Math.round(m / 60);
    if (h < 24) return h + (h === 1 ? ' hour' : ' hours');
    var d = Math.round(h / 24);
    return d + (d === 1 ? ' day' : ' days');
  }

  function build() {
    if (el) return;
    var css = document.createElement('style');
    css.textContent =
      '#alsStranded{position:fixed;left:0;right:0;top:0;z-index:9999;' +
      'display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;' +
      'padding:11px 16px;background:#3A2A08;border-bottom:1px solid rgba(242,192,99,.5);' +
      'font:600 13px/1.45 -apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;' +
      'color:#F8EACA;text-align:center;box-shadow:0 6px 22px rgba(0,0,0,.4);' +
      'padding-top:calc(11px + env(safe-area-inset-top,0px));}' +
      '#alsStranded .als-str-dot{flex:none;width:8px;height:8px;border-radius:50%;background:#F2C063;}' +
      '#alsStranded .als-str-btn{flex:none;border:1px solid rgba(242,192,99,.55);border-radius:999px;' +
      'background:rgba(242,192,99,.14);color:#F8EACA;font:600 12.5px/1 inherit;padding:7px 13px;cursor:pointer;' +
      '-webkit-tap-highlight-color:transparent;}' +
      '#alsStranded .als-str-btn:active{transform:scale(.97);}' +
      '#alsStranded .als-str-det{flex-basis:100%;margin:-4px 0 0;font:500 11px/1.3 ui-monospace,SFMono-Regular,Menlo,monospace;' +
      'color:rgba(248,234,202,.62);letter-spacing:.02em;}' +
      '#alsStranded .als-str-det:empty{display:none;}';
    document.head.appendChild(css);

    el = document.createElement('div');
    el.id = 'alsStranded';
    el.setAttribute('role', 'alert');
    el.setAttribute('aria-live', 'assertive');

    var dot = document.createElement('span'); dot.className = 'als-str-dot';
    txtEl = document.createElement('span'); txtEl.className = 'als-str-txt';
    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'als-str-btn'; btn.textContent = 'Retry now';
    btn.addEventListener('click', retry);
    detEl = document.createElement('span'); detEl.className = 'als-str-det';

    el.appendChild(dot); el.appendChild(txtEl); el.appendChild(btn); el.appendChild(detEl);
    (document.body || document.documentElement).appendChild(el);
  }

  function retry() {
    try { if (window.ALSSync && window.ALSSync.flush) window.ALSSync.flush(); } catch (e) {}
    try { window.dispatchEvent(new Event('online')); } catch (e) {}
    try { document.dispatchEvent(new Event('visibilitychange')); } catch (e) {}
  }

  function render() {
    if (stranded()) {
      build();
      /* Say what is actually at stake — "Not saved" is a status, and a status is
         easy to dismiss. The thing he needs to know is WHERE his data is. */
      txtEl.textContent = 'Some changes from the last ' + human(Date.now() - stuckSince()) +
        ' are only on this device — they haven\'t reached the cloud.';
      if (detEl) detEl.textContent = stuckDetail();
      el.style.display = '';
    } else if (el) {
      el.style.display = 'none';
    }
  }

  /* The banner has to be able to APPEAR while nothing is happening: the engines
     only report on attempts, so without a clock a device that goes quiet stays
     quiet. It also refreshes the elapsed count. */
  function startTick() { if (!tick) tick = setInterval(render, TICK_MS); }
  function stopTick() { if (tick) { clearInterval(tick); tick = null; } }

  window.addEventListener('offline', render);
  window.addEventListener('online', function () {
    /* Fresh grace period: the failures may have been the tunnel, and 15s from
       now it will probably have healed. Do not accuse it of being broken for
       something that was never its fault. */
    var s = load(), touched = false;
    for (var k in s) { if (Object.prototype.hasOwnProperty.call(s, k) && +s[k] > 0) { s[k] = Date.now(); touched = true; } }
    if (touched) save(s);
    render();
  });

  window.ALSSyncStatus = {
    queued: function () { /* healthy path — deliberately silent */ },
    ok: function (name) {
      var s = load(), key = name || 'sync';
      if (s[key]) { delete s[key]; save(s); }
      var er = loadErr(); if (er[key]) { delete er[key]; saveErr(er); }
      if (!stuckSince()) stopTick();
      render();
    },
    fail: function (name, detail) {
      var s = load(), key = name || 'sync';
      if (!s[key]) { s[key] = Date.now(); save(s); }
      if (detail) { var er = loadErr(); if (er[key] !== detail) { er[key] = detail; saveErr(er); } }
      startTick();
      render();
    },
    /* What is stuck right now, for the Vault's sync check. Reads the persisted
       record, so it is true across reloads and app restarts. */
    stuck: function () {
      var since = stuckSince();
      return { since: since || 0, engines: stuckNames(), online: isOnline() };
    }
  };

  // A page that OPENS with data already stranded (logged on the phone, app
  // closed before it landed, reopened later) must show it without waiting for
  // an engine to fail again.
  if (stuckSince()) { startTick(); render(); }
})();
