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
var CACHE = "als-v60";
var CORE = [
  './', 'index.html', 'main.html', 'gym.html', 'body.html', 'sleep.html',
  'weight.html', 'trends.html', 'health.html', 'caffeine.html', 'nutrition.html',
  'ideas.html', 'finance.html', 'morning.html', 'weekly.html', 'po-water.html', 'nova-chat.html', 'pr.html', 'measure.html', 'planner.html', 'supps.html', 'import.html', 'import-strong.html', 'movies.html', 'bills.html', 'improve.html',
  'aurora.css', 'aurora-page.css', 'jarvis.css',
  'topbar.js', 'nova.js', 'nova-coach.js', 'sync.js', 'tdee.js', 'pocoach-sync.js',
  'insights.js', 'xp.js', 'lock.js', 'push.js', 'reminders.js', 'aurora-motion.js',
  'vendor/gsap.min.js', 'vendor/ScrollTrigger.min.js', 'vendor/Flip.min.js', 'vendor/SplitText.min.js', 'vendor/lenis.min.js',
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

  // Network-first for EVERYTHING same-origin: always fresh code online, cache
  // only as an offline fallback. (Stale-while-revalidate was serving old JS/CSS
  // for an extra load each deploy — the source of the "still cached" issues.)
  e.respondWith(
    fetch(req).then(function (res) {
      if (res && res.status === 200 && res.type === 'basic') {
        var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); });
      }
      return res;
    }).catch(function () {
      return caches.match(req).then(function (r) {
        return r || (req.mode === 'navigate' ? caches.match('index.html') : undefined);
      });
    })
  );
});

/* ── Web Push: show the notification the server sent ─────────────
   Used for the rest-timer alert (delivered at the rest end-time even
   when the app is closed) and, later, daily reminders. */
self.addEventListener('push', function (e) {
  var data = {};
  try { data = e.data ? e.data.json() : {}; }
  catch (err) { try { data = { body: e.data.text() }; } catch (_) {} }
  e.waitUntil(self.registration.showNotification(data.title || 'ALS Dashboard', {
    body: data.body || '',
    tag: data.tag || 'als', renotify: true,
    icon: 'icon-192.png', badge: 'icon-192.png',
    vibrate: [300, 140, 300]
  }));
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
