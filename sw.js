/* ════════════════════════════════════════════════════════════════
   ALS Dashboard — service worker (Pillar 5: offline + notifications)
   • Offline app shell: precache core pages/assets, runtime-cache the
     rest. Navigations are network-first (always fresh online, cached
     offline); static assets are stale-while-revalidate.
   • Cross-origin requests (Supabase, CDN, Google Fonts) are never
     intercepted — sync stays online-only and degrades gracefully.
   • Rest-timer notification: the app hands off the rest end-time when
     it's backgrounded; the SW fires a notification when rest is up.
   ════════════════════════════════════════════════════════════════ */
'use strict';
var CACHE = 'als-v1';
var CORE = [
  './', 'index.html', 'main.html', 'gym.html', 'body.html', 'sleep.html',
  'weight.html', 'trends.html', 'health.html', 'caffeine.html', 'nutrition.html',
  'ideas.html', 'finance.html', 'morning.html', 'po-water.html',
  'aurora.css', 'aurora-page.css', 'jarvis.css',
  'topbar.js', 'nova.js', 'nova-coach.js', 'sync.js', 'pocoach-sync.js',
  'insights.js', 'xp.js', 'lock.js',
  'manifest.json', 'icon-192.png', 'icon-512.png', 'icon.svg', 'apple-touch-icon.png'
];

self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      // allSettled so one missing/renamed file can't abort the whole install
      return Promise.allSettled(CORE.map(function (u) { return c.add(new Request(u, { cache: 'reload' })); }));
    })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url;
  try { url = new URL(req.url); } catch (err) { return; }
  if (url.origin !== self.location.origin) return; // leave Supabase / CDN / fonts to the network

  var isNav = req.mode === 'navigate' || (req.headers.get('accept') || '').indexOf('text/html') !== -1;

  if (isNav) {
    // network-first: freshest page when online, cached shell when offline
    e.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); });
        return res;
      }).catch(function () {
        return caches.match(req).then(function (r) { return r || caches.match('index.html'); });
      })
    );
    return;
  }

  // static assets: stale-while-revalidate
  e.respondWith(
    caches.match(req).then(function (cached) {
      var net = fetch(req).then(function (res) {
        if (res && res.status === 200 && res.type === 'basic') {
          var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      }).catch(function () { return cached; });
      return cached || net;
    })
  );
});

/* ── Rest-timer background notification ──────────────────────────
   The page posts {type:'schedule-rest', endAt} when it backgrounds
   mid-rest, and {type:'cancel-rest'} when rest is resumed/skipped. */
var restTimer = null;
self.addEventListener('message', function (e) {
  var d = e.data || {};
  if (d.type === 'schedule-rest') {
    if (restTimer) { clearTimeout(restTimer); restTimer = null; }
    var delay = Math.max(0, (d.endAt || 0) - Date.now());
    restTimer = setTimeout(function () {
      restTimer = null;
      self.registration.showNotification('Rest complete 💪', {
        body: 'Time for your next set.',
        tag: 'als-rest', renotify: true,
        icon: 'icon-192.png', badge: 'icon-192.png',
        vibrate: [300, 140, 300]
      });
    }, delay);
  } else if (d.type === 'cancel-rest') {
    if (restTimer) { clearTimeout(restTimer); restTimer = null; }
  }
});

self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
      for (var i = 0; i < list.length; i++) { if ('focus' in list[i]) return list[i].focus(); }
      if (self.clients.openWindow) return self.clients.openWindow('gym.html');
    })
  );
});
