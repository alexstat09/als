/* ════════════════════════════════════════════════════════════════
   Métron — service worker (Pillar 5: offline + notifications)
   • Offline app shell: precache core pages/assets, runtime-cache the
     rest. Same-origin requests are NETWORK-FIRST: always fresh code when
     online (so a deploy shows up on the very next load — no stale-cache
     limbo while iterating), cache only as the offline fallback. (We tried
     cache-first for gym-speed but it left deploys invisible for a launch
     or two — not worth the friction while still building.)
   • Cross-origin requests (Supabase, CDN, Google Fonts) are never
     intercepted — sync stays online-only and degrades gracefully.
   • Rest-timer notification: the app hands off the rest end-time when
     it's backgrounded; the SW fires a notification when rest is up.
   ════════════════════════════════════════════════════════════════ */
'use strict';
var CACHE = "als-v518";
var CORE = [
  './', 'index.html', 'main.html', 'gym.html', 'body.html', 'sleep.html',
  'weight.html', 'trends.html', 'health.html', 'caffeine.html', 'nutrition.html',
  'ideas.html', 'finance.html', 'morning.html', 'weekly.html', 'po-water.html', 'nova-chat.html', 'pr.html', 'measure.html', 'planner.html', 'supps.html', 'import.html', 'import-strong.html', 'movies.html', 'bills.html', 'improve.html', 'arc.html', 'coach.html', 'backup.html', 'insights.html', 'arxaia.html', 'arxaia-sokratis.html', 'arxaia-platon.html', 'arxaia-klisi.html', 'arxaia-klisi-data.js', 'latinika.html', 'latinika-eisagogi.html', 'latinika-lectio16.html', 'latinika-lectio17.html', 'latinika-lectio18.html', 'tonos.html', 'istoria.html', 'run.html', 'scripture.html', 'study.html', 'homework.html',
  /* als-v490 — Η ΑΤΜΟΣΦΑΙΡΑ ΤΗΣ SCHOOL STUDIES. Οι φωτογραφίες είναι ΑΡΧΕΙΑ
     επίτηδες: bytes εικόνας μέσα σε συγχρονισμένη γραμμή σκοτώνουν σιωπηλά το
     `flushOnUnload` για ΟΛΗ την εφαρμογή (σταθ. 34).
     ⚠️ Ένα αρχείο που λείπει εδώ απορρίπτει ΟΛΟΚΛΗΡΗ την εγκατάσταση του SW —
     και τα τέσσερα επαληθεύτηκαν ότι υπάρχουν πριν γραφτεί αυτή η γραμμή. */
  'hw-cover.jpg', 'hw-consistency.jpg', 'hw-side.jpg', 'hw-banner.jpg',
  /* ⛔ als-v489: ΤΟ `istoria-demo.html` ΕΦΥΓΕ ΑΠΟ ΕΔΩ ΣΤΟ ΙΔΙΟ COMMIT ΠΟΥ
     ΕΦΥΓΕ ΤΟ ΑΡΧΕΙΟ. Ένα αρχείο που λείπει μέσα σε `cache.addAll()` απορρίπτει
     ΟΛΟΚΛΗΡΗ την εγκατάσταση του service worker — δηλαδή θα χαλούσε η offline
     εφαρμογή, όχι μόνο η μία σελίδα. Ο πλαγιότιτλος δεν χάθηκε: ΕΓΙΝΕ η
     `istoria.html`, που είναι ήδη στη γραμμή από πάνω. */
  /* ⚠️ These two carry a ?v= query, so the precached URL must match the one
     index.html actually requests or the entry is dead weight. They had drifted
     (SW 206/202 vs page 208/203); realigned als-v438. */
  'aurora.css', 'aurora-page.css', 'jarvis.css', 'home-live.js?v=214', 'home-motion.js?v=206',
  'latin-engine.js', 'tonos-engine.js', 'tonos-fyllo.js', 'greek-ear.js', 'istoria-data.js', 'arxaia-data.js', 'arxaia-engine.js',
  /* ΤΟ ΓΝΩΣΤΟ (als-v460): ο κοινός βαθμολογητής + το corpus του Σωκράτη.
     Χωρίς αυτά στο CORE, η arxaia.html φορτώνει offline και ο ΕΝΑΣ από τους
     δύο κόσμους της είναι άδειος — δηλαδή σιωπηλά μισή σελίδα. */
  'lesson-grade.js', 'arxaia-gnosto-data.js', 'arxaia-syntax-data.js',
  /* als-v468: η σφραγίδα που κρατάει την πρόοδο των σελίδων μελέτης ζωντανή
     μέσα από το sync. Χωρίς αυτό στο CORE, μια offline εκκίνηση γράφει
     ασφράγιστη πρόοδο και το επόμενο sync τη γυρίζει πίσω. */
  'study-stamp.js',
  /* als-v470: ο ΕΝΑΣ αναγνώστης των πέντε σκαλών. Χωρίς αυτό στο CORE, μια
     offline εκκίνηση αφήνει το Home ΚΑΙ το homework.html χωρίς καμία σκάλα —
     και τα τέσσερα πλακίδια μελέτης μένουν σιωπηλά στην προηγούμενη τιμή. */
  'ladders.js',
  'water.js', 'topbar.js', 'launcher.js', 'nova.js', 'nova-coach.js', 'sync.js', 'tdee.js', 'pocoach-sync.js',
  /* xp.js was here. Deleted als-v438 with "This week vs last", its last caller. */
  'insights.js', 'lock.js', 'push.js', 'reminders.js', 'aurora-motion.js', 'page-motion.js', 'aurora-bg.js', 'insights-engine.js', 'forecast-engine.js', 'chapters-engine.js', 'error-toast.js', 'als-dialog.js', 'nova-actions.js', 'gcal.js', 'als-sync-status.js',
  'vendor/supabase.min.js', 'vendor/html5-qrcode.min.js', 'vendor/gsap.min.js', 'vendor/ScrollTrigger.min.js', 'vendor/Flip.min.js', 'vendor/SplitText.min.js', 'vendor/lenis.min.js',
  'manifest.json', 'run.webmanifest', 'icon-192.png', 'icon-512.png', 'icon.svg', 'apple-touch-icon.png'
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
     .then(function () {
       // when a new SW version activates, force every open window to reload
       // through the fresh no-store worker — breaks any stale-cache loop.
       return self.clients.matchAll({ type: 'window' }).then(function (list) {
         list.forEach(function (c) { try { c.navigate(c.url); } catch (e) {} });
       });
     })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url;
  try { url = new URL(req.url); } catch (err) { return; }
  if (url.origin !== self.location.origin) return; // leave Supabase / CDN / fonts to the network

  // Network-first for EVERYTHING same-origin: always fresh code online, cache
  // only as an offline fallback. This guarantees a deploy is visible on the
  // next load (no waiting for a service-worker generation to roll over).
  e.respondWith(
    fetch(req, { cache: 'no-store' }).then(function (res) {
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
  e.waitUntil(self.registration.showNotification(data.title || 'Métron', {
    body: data.body || '',
    tag: data.tag || 'als', renotify: true,
    icon: 'icon-192.png', badge: 'icon-192.png',
    vibrate: [300, 140, 300],
    /* ⭐ Ο ΠΡΟΟΡΙΣΜΟΣ ΤΑΞΙΔΕΥΕΙ ΜΕ ΤΗΝ ΕΙΔΟΠΟΙΗΣΗ. Το `notificationclick` δεν
       βλέπει το αρχικό payload — μόνο ό,τι μπήκε στο `data` εδώ. Χωρίς αυτή τη
       γραμμή, το `url` που στέλνει ο server φτάνει ως εδώ και πεθαίνει σιωπηλά,
       και κάθε push προσγειώνεται στο ίδιο μέρος όπως πάντα (δύο άκρα ενός
       πρωτοκόλλου, το ένα καλωδιωμένο — σταθερή αρχή 23). */
    data: { url: data.url || '' }
  }));
});

/* Ένα push μπορεί πλέον να ονομάσει ΠΟΥ ανοίγει. Η υπενθύμιση των 18:00 πάει
   κατευθείαν στο `homework.html#capture`, δηλαδή στο πεδίο σύλληψης, όρθιος,
   βγαίνοντας από το φροντιστήριο. Χωρίς `url` η συμπεριφορά μένει ΑΚΡΙΒΩΣ η
   παλιά — εστίασε ό,τι είναι ανοιχτό, αλλιώς άνοιξε το gym.html.
   ⚠️ Το `client.navigate()` απορρίπτεται όταν ο client δεν ελέγχεται από αυτόν
   τον SW· τότε πέφτουμε πίσω στο σκέτο focus αντί να μείνει το πάτημα χωρίς
   κανένα αποτέλεσμα. */
self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var url = (e.notification.data && e.notification.data.url) || '';
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
      for (var i = 0; i < list.length; i++) {
        var c = list[i];
        if (!('focus' in c)) continue;
        if (url && 'navigate' in c) {
          return c.navigate(url)
            .then(function (nc) { return (nc || c).focus(); })
            .catch(function () { return c.focus(); });
        }
        return c.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url || 'gym.html');
    })
  );
});
