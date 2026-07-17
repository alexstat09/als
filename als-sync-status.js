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

   That is fixed at the source now (sync.js / pocoach-sync.js): ok() means the
   cloud CONFIRMED the write, the "already pushed" marker only advances on that
   confirmation, and both engines retry every 15s until it lands. A failed push
   is now a blip that heals with nobody watching.

   So this file shows NOTHING when things work, and nothing while a blip heals.
   It speaks exactly once: when data has been stuck on this device, with the
   network up, for long enough that it is not a blip. Silence means saved —
   which is only an honest promise because of the fixes above.

   The API is unchanged, so the engines did not have to learn anything:
     .queued()  a local change is waiting
     .ok()      a write REACHED the cloud
     .fail()    a write did not
   ════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.ALSSyncStatus) return;

  /* The engines retry every 15s. Two minutes of unbroken failure is ~8 straight
     attempts — long past any blip, and far short of nagging. */
  var STRANDED_MS = 2 * 60 * 1000;
  var TICK_MS = 20 * 1000;

  var failingSince = 0;      // start of the current run of failures; 0 = healthy
  var el = null, txtEl = null, tick = null;

  function isOnline() { try { return navigator.onLine !== false; } catch (e) { return true; } }

  /* Stuck, and it is not the network's fault. Offline is excluded on purpose:
     a tunnel is not a bug, the data is safe locally, and it will heal on its
     own the moment there is signal. Interrupting for that would teach him to
     ignore this — and then it is worthless on the day it matters. */
  function stranded() {
    return failingSince > 0 && isOnline() && (Date.now() - failingSince) >= STRANDED_MS;
  }

  function mins() { return Math.max(1, Math.round((Date.now() - failingSince) / 60000)); }

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
      '#alsStranded .als-str-btn:active{transform:scale(.97);}';
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

    el.appendChild(dot); el.appendChild(txtEl); el.appendChild(btn);
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
      txtEl.textContent = 'Your changes from the last ' + mins() + ' min are only on this device — they haven\'t reached the cloud.';
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
    if (failingSince) failingSince = Date.now();
    render();
  });

  window.ALSSyncStatus = {
    queued: function () { /* healthy path — deliberately silent */ },
    ok: function () {
      failingSince = 0;
      stopTick();
      render();
    },
    fail: function () {
      if (!failingSince) failingSince = Date.now();
      startTick();
      render();
    }
  };
})();
