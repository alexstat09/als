/* ════════════════════════════════════════════════════════════════
   Métron — Web Push client (window.ALSPush)
   Subscribes the device to push (via the service worker + VAPID), and
   schedules/cancels the rest-timer push through the serverless API.
   Degrades to a silent no-op when push isn't supported or the backend
   isn't configured yet — so the app behaves exactly as before until set up.
   ════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  function ls(k){ try { return localStorage.getItem(k); } catch(e){ return null; } }
  function lss(k,v){ try { localStorage.setItem(k,v); } catch(e){} }
  function lsr(k){ try { localStorage.removeItem(k); } catch(e){} }

  function b64ToU8(base64){
    var pad = '='.repeat((4 - base64.length % 4) % 4);
    var b = (base64 + pad).replace(/-/g, '+').replace(/_/g, '/');
    var raw = atob(b); var arr = new Uint8Array(raw.length);
    for (var i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
    return arr;
  }

  function supported(){ return ('serviceWorker' in navigator) && ('PushManager' in window) && ('Notification' in window); }
  function enabled(){ return supported() && Notification.permission === 'granted' && !!ls('als_push_sub'); }

  var _vapid = null;
  function getVapidKey(){
    if (_vapid != null) return Promise.resolve(_vapid);
    return fetch('/api/vapid-public').then(function(r){ return r.ok ? r.json() : null; })
      .then(function(j){ _vapid = (j && j.key) || ''; return _vapid; })
      .catch(function(){ _vapid = ''; return _vapid; });
  }

  // Last reason enable() resolved false — so callers can show a precise message.
  var _lastErr = '';
  function lastError(){ return _lastErr; }

  // Request permission + subscribe. Resolves true only when fully subscribed.
  function enable(){
    _lastErr = '';
    if (!supported()) { _lastErr = 'unsupported'; return Promise.resolve(false); }
    return Notification.requestPermission().then(function(p){
      if (p !== 'granted') { _lastErr = 'permission-' + p; return false; }
      return navigator.serviceWorker.ready.then(function(reg){
        return getVapidKey().then(function(key){
          if (!key) { _lastErr = 'no-vapid'; return false; } // backend not configured yet
          var appKey = b64ToU8(key);
          function subscribe(){
            return reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: appKey })
              .then(function(s){ lss('als_push_sub', JSON.stringify(s)); return true; });
          }
          // Does an existing subscription use this same VAPID key?
          function sameKey(sub){
            try {
              var ek = sub && sub.options && sub.options.applicationServerKey; if (!ek) return false;
              var a = new Uint8Array(ek); if (a.length !== appKey.length) return false;
              for (var i = 0; i < a.length; i++) if (a[i] !== appKey[i]) return false;
              return true;
            } catch (e) { return false; }
          }
          return reg.pushManager.getSubscription().then(function(existing){
            if (existing && sameKey(existing)) { lss('als_push_sub', JSON.stringify(existing)); return true; }
            // Drop a stale/mismatched sub first, then subscribe fresh.
            var clear = existing ? existing.unsubscribe().catch(function(){}) : Promise.resolve();
            return clear.then(subscribe).catch(function(e1){
              // iOS push-service errors are often transient — clear & retry once.
              return reg.pushManager.getSubscription()
                .then(function(s){ return s ? s.unsubscribe().catch(function(){}) : null; })
                .then(subscribe)
                .catch(function(e2){ _lastErr = 'subscribe-failed: ' + ((e2 && e2.message) || e2); try { console.warn('[ALSPush] subscribe failed', e1, e2); } catch (e) {} return false; });
            });
          });
        });
      });
    }).catch(function(e){ _lastErr = 'error: ' + ((e && e.message) || e); return false; });
  }

  function scheduleRest(endAt){
    var sub = ls('als_push_sub'); if (!sub || !enabled()) return;
    try {
      fetch('/api/schedule-rest', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: JSON.parse(sub), endAt: endAt, title: 'Rest complete 💪', body: 'Time for your next set.' })
      }).then(function(r){ return r.json(); })
        .then(function(j){ if (j && j.messageId) lss('als_rest_msgid', j.messageId); })
        .catch(function(){});
    } catch(e){}
  }

  function cancelRest(){
    var id = ls('als_rest_msgid'); lsr('als_rest_msgid');
    if (!id) return;
    try {
      fetch('/api/cancel-rest', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId: id })
      }).catch(function(){});
    } catch(e){}
  }

  window.ALSPush = { supported: supported, enabled: enabled, enable: enable, lastError: lastError, scheduleRest: scheduleRest, cancelRest: cancelRest };
})();
