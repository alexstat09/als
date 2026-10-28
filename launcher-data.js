/* launcher-data.js — the readers behind the "All" panel (als-v686).

   WHY A SEPARATE FILE
   The panel shows each page's real number (1,612 kcal, 78.4 kg, 3 / 5 ...).
   Home already computes exactly those numbers in home-live.js metric(), and a
   second, hand-written reader for the same stores is how two screens start to
   disagree (constraint 15). So the block between BEGIN and END below is a
   BYTE-IDENTICAL copy of home-live.js, from `function ls` to the end of
   `sparkPts`. tests/launcher.test.js extracts both and fails on any drift:
   change a reader in home-live.js and this copy must be re-pasted, never edited.

   IT ONLY READS. No setItem, no removeItem, no sync, no network. It is loaded
   lazily by launcher.js the first time the panel opens, never on page load.
   Everything it needs from other files (ladders.js, water.js) is pure too, and
   a missing one makes metric() return null or a dash: never a made-up zero. */
(function () {
  'use strict';
  if (window.ALSLauncherData) return;

  /* ===== BEGIN COPY of home-live.js (do not edit here) ===== */
  function ls(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
  function tk() { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function activeDate() { var d = new Date(); if (d.getHours() < 6) d.setDate(d.getDate() - 1); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function dawn() { var d = new Date(); d.setHours(0, 0, 0, 0); return d; }
  /* CALENDAR days apart, not elapsed hours. Comparing a midnight date-key against
     new Date() (which carries the time of day) made every afternoon round up to 1 —
     so a workout logged this morning read "yesterday" from noon onwards. Both sides
     are pinned to local midnight, which also keeps it right across a DST shift. */
  function relDay(key) {
    var d = new Date(key + 'T00:00:00'); d.setHours(0, 0, 0, 0);
    var t = new Date(); t.setHours(0, 0, 0, 0);
    var diff = Math.round((t - d) / 86400000);
    return diff <= 0 ? 'today' : diff === 1 ? 'yesterday' : diff + 'd ago';
  }
  function fmtN(n) { return Number(n).toLocaleString('en-US'); }
  function href(t) { var h = t.getAttribute('href') || ''; return h.split('#')[0].split('?')[0]; }
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
  /* ⭐ ΟΙ ΠΕΝΤΕ ΣΚΑΛΕΣ ΔΙΑΒΑΖΟΝΤΑΙ ΑΠΟ ΕΝΑ ΜΕΡΟΣ (als-v470).
     Τέσσερις χειροποίητοι αναγνώστες των `lat:v1` / `ist:v1` / `ton:v1` /
     `arx:v1`+`arx:gn` ζούσαν μέσα στο metric(). Το `homework.html` χρειάζεται
     ΤΟΥΣ ΙΔΙΟΥΣ, και ένα πέμπτο αντίγραφο είναι η σταθερή αρχή 15: μια
     εγγύηση που ισχύει στον έναν δρόμο και όχι στον δίδυμό του δεν είναι
     εγγύηση. Το `ladders.js` κρατάει τα τέσσερα σχήματα σε ΕΝΑ σημείο.
     ⚠️ Καμία τιμή δεν άλλαξε: το `tests/ladders.test.js` συγκρίνει τα
     τέσσερα πλακίδια με το `git show HEAD:home-live.js` και απαιτεί
     ΤΑΥΤΟΣΗΜΗ έξοδο. Ένα refactor που αλλάζει σιωπηλά μια τιμή που έχει ήδη
     βγει στην οθόνη είναι regression με ρούχα καθαρίσματος.
     Ένα `null` εδώ σημαίνει «δεν φόρτωσε το ladders.js» — τα cases που το
     χρησιμοποιούν επιστρέφουν null, οπότε το πλακίδιο μένει όπως ήταν αντί να
     πει ψέματα με ένα μηδέν. */
  var LADS = null;
  function lads() {
    if (!window.ALSLadders) return null;
    /* ⚠️ Ο αναγνώστης δίνεται ΑΠ' ΕΞΩ, ποτέ δεν τον βρίσκει μόνο του το
       `ladders.js`: αυτό είναι που το κρατάει καθαρό από περιβάλλον
       (σταθερή αρχή 25) και είναι ό,τι επιτρέπει στο test να το τρέξει σε
       `vm` χωρίς localStorage. Εδώ περνάει το ΙΔΙΟ handle που διαβάζει και
       το `ls()` δύο γραμμές πιο πάνω. */
    if (!LADS) {
      try { LADS = window.ALSLadders.read({ get: function (k) { return localStorage.getItem(k); } }); }
      catch (e) { return null; }
    }
    return LADS;
  }
  function ladder(k) { var L = lads(); if (!L) return null; var s = L.byKey[k]; return (s && s.ok) ? s : null; }

  /* render html into host, but only rewrite the DOM when it actually changed
     (no 30s-repaint flicker) and always reveal freshly-injected [data-rise]
     cards ourselves — the motion observer fires once per section then unobserves,
     so re-injected nodes would otherwise stay stuck at opacity:0 and vanish. */
  function render(host, html) {
    if (!host || host.getAttribute('data-html') === html) return;
    host.setAttribute('data-html', html);
    host.innerHTML = html;
    var rise = host.querySelectorAll('[data-rise]');
    requestAnimationFrame(function () {
      rise.forEach(function (n, i) { n.style.transitionDelay = (i * 60) + 'ms'; n.classList.add('in'); });
    });
  }

  /* ── this-week workout count (Mon–Sun) ── */
  function workoutsThisWeek() {
    var ws = ls('po_workouts', []); ws = Array.isArray(ws) ? ws : [];
    var done = ls('po_coach_workout_done', {}) || {};
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var dow = (today.getDay() + 6) % 7; var start = new Date(today); start.setDate(today.getDate() - dow);
    var days = {};
    ws.forEach(function (w) { if (w && w.date) days[w.date] = 1; });
    Object.keys(done).forEach(function (k) { if (done[k]) days[k] = 1; });
    var c = 0; Object.keys(days).forEach(function (k) { var d = new Date(k + 'T00:00:00'); if (d >= start && d <= today) c++; });
    return c;
  }

  /* ── REAL DATA per destination → {hero, unit, note, spark, txt, comma, dec} ── */
  function metric(h) {
    var t = tk();
    try {
      switch (h) {
        case 'gym.html': {
          var wk = workoutsThisWeek();
          /* a session counts whether it was ticked off on the plan OR logged in the
             gym tracker — same two sources workoutsThisWeek() counts, so the hero
             and the "N sessions this week" note can never disagree. */
          var done = ls('po_coach_workout_done', {}) || {}, gd = {};
          Object.keys(done).forEach(function (k) { if (done[k]) gd[k] = 1; });
          (ls('po_workouts', []) || []).forEach(function (w) { if (w && w.date) gd[w.date] = 1; });
          var ds = Object.keys(gd).sort(), ld = ds[ds.length - 1];
          return { hero: ld ? relDay(ld) : 'Ready', txt: true, note: wk + (wk === 1 ? ' session this week' : ' sessions this week') };
        }
        case 'pr.html': {
          var ws = ls('po_workouts', []), best = 0, name = '';
          (Array.isArray(ws) ? ws : []).forEach(function (w) { (w && w.entries || []).forEach(function (en) { if (!en || en.kind === 'time') return; (en.sets || []).forEach(function (s) { if (!s || s.done === false) return; var kg = +s.kg || 0, r = +s.reps || 0; if (kg <= 0 || r <= 0) return; var e = kg * (1 + r / 30); if (e > best) { best = e; name = en.name || ''; } }); }); });
          return best > 0 ? { hero: Math.round(best), unit: 'kg', note: (name ? name.toLowerCase() + ' · ' : '') + 'best lift' } : { hero: '—', note: 'no lifts yet' };
        }
        case 'sleep.html': {
          var logs = ls('sleep:logs', []); var arr = Array.isArray(logs) ? logs : [];
          var today = arr.find(function (e) { return e && e.dateKey === t; });
          if (today && today.recovery != null) { var hrs = today.hours ? (Math.floor(today.hours) + 'h ' + Math.round((today.hours % 1) * 60) + 'm') : 'logged'; return { hero: today.recovery, note: hrs + ' · recovery', spark: recSpark(arr) }; }
          var slept = arr.filter(function (e) { return e && e.hours > 0; }).sort(function (a, b) { return a.dateKey < b.dateKey ? -1 : 1; });
          if (slept.length) { var hh = slept[slept.length - 1].hours; return { hero: +hh.toFixed(1), unit: 'h', dec: 1, note: 'last night', spark: recSpark(arr) }; }
          return { hero: '—', note: 'log your sleep' };
        }
        case 'nutrition.html': {
          var all = ls('nut:logs', []); all = Array.isArray(all) ? all : [];
          /* mirror nutrition.html getLogs(): drop null-id rows and anything in
             the nut:deleted block-list. A cloud merge can resurrect a deleted
             food into the raw array (sync tombstones lose to clock skew), so the
             nutrition page filters it at READ time — the home tile must too, or
             phantom entries inflate the day's kcal/protein above the real page. */
          var del = ls('nut:deleted', {}); if (!del || typeof del !== 'object' || Array.isArray(del)) del = {};
          all = all.filter(function (l) { return l && l.id != null && !del[l.id]; });
          var nl = all.filter(function (l) { return l && (l.dateKey ? l.dateKey === t : new Date(l.ts) >= dawn()); });
          var kc = Math.round(nl.reduce(function (s, l) { return s + (l.kcal || 0); }, 0));
          var prot = Math.round(nl.reduce(function (s, l) { return s + (l.protein || l.p || 0); }, 0));
          var byDay = {}; all.forEach(function (l) { if (!l) return; var k = l.dateKey || (l.ts ? new Date(l.ts).toISOString().slice(0, 10) : null); if (k) byDay[k] = (byDay[k] || 0) + (l.kcal || 0); });
          var days = Object.keys(byDay).sort().slice(-10).map(function (k) { return Math.round(byDay[k]); });
          return kc > 0 ? { hero: kc, unit: 'kcal', comma: kc >= 1000, note: prot ? ('protein ' + prot + 'g today') : 'today', spark: days.length >= 3 ? days : null } : { hero: '—', note: 'log food' };
        }
        case 'health.html': case 'supps.html': {
          var it = ls('stack:items', []); it = (Array.isArray(it) ? it : []).filter(function (i) { return i && i.id && i.name; });
          var tkn = ls('stack:taken:' + activeDate(), {}) || {}; var tc = it.filter(function (i) { return tkn[i.id]; }).length;
          return it.length ? { hero: tc, unit: '/ ' + it.length, note: (it.length - tc) + ' left today' } : { hero: '—', note: 'your stack' };
        }
        case 'measure.html': {
          var lg = ls('bm:logs', []); lg = Array.isArray(lg) ? lg : [];
          var latest = function (k) { var s = lg.filter(function (r) { return r && r[k] != null; }).sort(function (a, b) { return a.dateKey < b.dateKey ? -1 : 1; }); return s.length ? s[s.length - 1][k] : null; };
          var wa = latest('waist'); return wa != null ? { hero: +wa, unit: 'cm', dec: (String(wa).indexOf('.') > -1 ? 1 : 0), note: 'waist' } : { hero: '—', note: 'measure up' };
        }
        case 'weight.html': case 'body.html': {
          var W = ls('po_coach_weights', []); W = Array.isArray(W) ? W : [];
          var last = W[W.length - 1];
          if (!last) return { hero: '—', note: 'log weight' };
          var prev = W.length >= 2 ? W[W.length - 2] : null;
          var sub = 'latest'; if (prev) { var d = (+last.weight - +prev.weight); sub = (d === 0 ? 'holding steady' : (d < 0 ? 'down ' : 'up ') + Math.abs(d).toFixed(1) + ' kg'); }
          return { hero: +last.weight, unit: 'kg', dec: 1, note: sub, spark: wSpark(W) };
        }
        case 'caffeine.html': {
          var mg = ls('caf:logs', []).filter(function (l) { return new Date(l.ts) >= dawn(); }).reduce(function (s, l) { return s + (l.mg || 0); }, 0);
          return { hero: mg || 0, unit: 'mg', note: 'today' };
        }
        case 'po-water.html': {
          if (!window.ALSWater) return { hero: '—', note: 'hydration' };
          var pw = ls('po_water_v1', {}), wg = ALSWater.target(pw);
          return { hero: ALSWater.count(pw, t), unit: '/ ' + wg.units, note: ALSWater.fmtMl(wg.drinkMl) + ' · hydration' };
        }
        case 'main.html': {
          var g = ls('goals:' + t, []); if (Array.isArray(g) && g.length) return { hero: g.filter(function (x) { return x.done; }).length, unit: '/ ' + g.length + ' today', note: 'daily plan' };
          return { hero: '—', note: 'set goals' };
        }
        case 'identity.html': {
          var streak = 0; try { var s = ls('goal_streak_v1', {}); streak = (s && typeof s.count === 'number') ? s.count : 0; } catch (e) { }
          if (streak > 0) return { hero: streak, unit: 'day streak', note: 'north star · habits' };
          var hl = ls('habits:list', []), lgg = ls('habits:log', {});
          if (Array.isArray(hl) && hl.length) { var d = (hl.filter(function (x) { return lgg[t] && lgg[t][x.id]; })).length; return { hero: d, unit: '/ ' + hl.length, note: 'habits today' }; }
          return { hero: '—', note: 'north star' };
        }
        case 'ideas.html': { var a = ls('ideas:items', []); a = Array.isArray(a) ? a : []; return a.length ? { hero: a.filter(function (i) { return !i.done; }).length, note: 'open · capture' } : { hero: '—', note: 'capture' }; }
        /* NOTE: never name a local `tk` in here. `var` hoists to the whole
           function, so a `var tk` inside any case shadowed the tk() helper for
           ALL of metric() — `var t = tk()` on line one threw TypeError every
           call, metric() returned null, and EVERY home tile silently kept its
           built-in demo number. Shipped als-v426, fixed als-v433. */
        case 'improve.html': { var v = ls('improve:videos', []); v = Array.isArray(v) ? v : []; var toks = ls('improve:tiktoks', []); toks = Array.isArray(toks) ? toks : []; var w = v.filter(function (x) { return x && !x.watched; }).length; if (!v.length && !toks.length) return { hero: '—', note: 'videos & TikToks' }; return { hero: w + toks.length, note: w ? (w + ' to watch · ' + toks.length + ' saved') : (toks.length + ' saved') }; }
        // Money is euros now, read from money:accounts. The old tile summed the
        // nw:* categories, which were stored in a CHF base and displayed through
        // a live FX rate — so the home screen could show a different number from
        // the page itself.
        case 'finance.html': { var acc = ls('money:accounts', []); acc = Array.isArray(acc) ? acc : []; var nw = 0; acc.forEach(function (a) { nw += Number(a && a.amount) || 0; }); return nw > 0 ? { hero: Math.round(nw), unit: '€', comma: nw >= 1000, note: 'in hand' } : { hero: '—', note: 'what you hold' }; }
        case 'movies.html': { var sn = (ls('movies:seen', []) || []).filter(function (x) { return x && x.id; }); var wt = (ls('movies:watch', []) || []).filter(function (x) { return x && x.id; }); if (sn.length) return { hero: sn.length, note: 'rated · watchlist' }; if (wt.length) return { hero: wt.length, note: 'to watch' }; return { hero: '—', note: 'rate a film' }; }
        case 'run.html': {
          var rl = (ls('run:logs', []) || []).filter(function (x) { return x && x.id; });
          var rp = (ls('run:plan', []) || []).filter(function (x) { return x && x.id; });
          var wsD = new Date(); wsD.setHours(0, 0, 0, 0); wsD.setDate(wsD.getDate() - ((wsD.getDay() + 6) % 7));
          var wsKey = wsD.getFullYear() + '-' + String(wsD.getMonth() + 1).padStart(2, '0') + '-' + String(wsD.getDate()).padStart(2, '0');
          var wkKm = 0; rl.forEach(function (r) { if (r.date >= wsKey) wkKm += (+r.distanceKm || 0); });
          var sToday = rp.filter(function (s) { return s.date === t && s.type !== 'Rest'; })[0];
          var note = sToday ? ('today · ' + String(sToday.type || '').toLowerCase()) : 'this week';
          if (wkKm > 0) { wkKm = Math.round(wkKm * 10) / 10; return { hero: wkKm, unit: 'km', dec: (wkKm % 1 ? 1 : 0), note: note }; }
          if (sToday && sToday.km) return { hero: sToday.km, unit: 'km', note: note };
          if (rl.length) return { hero: rl.length, unit: 'runs', note: 'all-time' };
          return { hero: '—', note: 'set race · paces' };
        }
        case 'arc.html': {
          var Wt = ls('po_coach_weights', []), Wo = ls('po_workouts', []), Sl = ls('sleep:logs', []), ds = [];
          (Array.isArray(Wt) ? Wt : []).forEach(function (e) { if (e && e.dateKey) ds.push(e.dateKey); });
          (Array.isArray(Wo) ? Wo : []).forEach(function (e) { if (e && e.date) ds.push(e.date); });
          (Array.isArray(Sl) ? Sl : []).forEach(function (e) { if (e && e.dateKey) ds.push(e.dateKey); });
          ds.sort(); if (ds.length) { var days = Math.round((new Date(t + 'T00:00:00') - new Date(ds[0] + 'T00:00:00')) / 86400000) + 1; return { hero: days, unit: 'days', note: 'your story' }; }
          return { hero: '—', note: 'your story' };
        }
        case 'insights.html': { var n = 0; try { if (window.ALSInsights) n = (window.ALSInsights.compute() || []).length; } catch (e) { } return n ? { hero: n, note: 'patterns found' } : { hero: '—', note: 'connecting' }; }
        /* ── ΟΙ ΤΕΣΣΕΡΙΣ ΠΟΥ ΔΙΑΒΑΖΟΥΝ ΣΚΑΛΑ ─────────────────────────────
           Τα τέσσερα σχήματα ζουν στο `ladders.js` τώρα, όχι εδώ. Οι τιμές
           είναι ΟΙ ΙΔΙΕΣ — το κλειδώνει το `tests/ladders.test.js` απέναντι
           στο `git show HEAD:home-live.js`. Ένα `null` (δεν φόρτωσε το
           `ladders.js`) αφήνει το πλακίδιο ανέγγιχτο· δεν το μηδενίζει. */
        case 'latinika.html': {
          var latS = ladder('lat:v1'); if (!latS) return null;
          /* '\u2014' when nothing has been answered: a placeholder is never
             formatted into a number here (the als-v433 rule). */
          return latS.samples ? { hero: Math.round(latS.accuracy * 100), unit: '%', note: '\u03c3\u03c9\u03c3\u03c4\u03ac \u00b7 \u03ba\u03bb\u03af\u03c3\u03b7' }
                              : { hero: '\u2014', note: '\u03be\u03b5\u03ba\u03af\u03bd\u03b1' };
        }
        case 'istoria.html': {
          /* ⭐⭐ als-v489: Η ΣΕΛΙΔΑ ΤΩΝ ΠΛΑΓΙΟΤΙΤΛΩΝ ΕΓΙΝΕ Η ΙΣΤΟΡΙΑ, ΑΡΑ ΤΟ
             ΠΛΑΚΙΔΙΟ ΜΕΤΡΑΕΙ ΑΥΤΟ ΠΟΥ ΜΕΤΡΑΕΙ Η ΣΕΛΙΔΑ. Ως την als-v488 υπήρχαν
             ΔΥΟ cases, ένα ανά πόρτα, και εδώ η μόνη αλήθεια ήταν το
             `ist:v1.units`. Αν έμενε έτσι, το πλακίδιο θα έλεγε ΣΙΩΠΗΛΑ λάθος
             ημερομηνία: η μονάδα εξέτασης είναι πλέον ο πλαγιότιτλος και το
             `due` της υποενότητας είναι ΠΑΡΑΓΩΓΟ (σταθερή αρχή 23).
             ⭐ Η ΣΕΙΡΑ ΕΙΝΑΙ Η ΙΔΙΑ ΜΕ ΤΟΥ `nowTarget()` ΤΗΣ ΣΕΛΙΔΑΣ, επίτηδες:
             πλαγιότιτλοι πρώτα, και ΜΟΝΟ όταν δεν υπάρχει κανένας πέφτουμε στις
             υποενότητες. Έτσι το πλακίδιο και η σελίδα δεν μπορούν να πουν δύο
             διαφορετικά πράγματα την ίδια μέρα.
             ⚠️ Το `plag` διαβάζεται ΕΔΩ και όχι από το `ladders.js` γιατί το
             `STORES` κλειδώνεται ΚΑΤΑ ΚΛΕΙΔΙ και το `ist:v1` είναι ήδη πιασμένο·
             δεύτερη εγγραφή με το ίδιο key θα σκίαζε σιωπηλά την πρώτη μέσα στο
             `byKey`. Η έκτη σκάλα με `id` ξεχωριστό από το `key` είναι ο σωστός
             δρόμος και ανοίγει όταν το χρειαστεί ΚΑΙ το `homework.html`.
             ⚠️ Όλα τα locals με πρόθεμα ist* — η σταθερή αρχή 14 κερδήθηκε σε
             ΑΥΤΗ ακριβώς τη συνάρτηση: ένα var μέσα σε case σκιάζει ΟΛΗ τη
             συνάρτηση. */
          var istStore = ls('ist:v1', null);
          var istMap = (istStore && typeof istStore === 'object' && istStore.plag) || null;
          var istN = 0, istPDue = 0, istKey, istRec, istNow = Date.now();
          if (istMap && typeof istMap === 'object') {
            for (istKey in istMap) {
              if (!Object.prototype.hasOwnProperty.call(istMap, istKey)) continue;
              istRec = istMap[istKey];
              if (!istRec || typeof istRec !== 'object') continue;
              istN++;
              /* Ποτέ ειπωμένος = οφείλεται ΤΩΡΑ. Ίδιος κανόνας με τη σελίδα. */
              if (!istRec.runs && !istRec.claimed) istPDue++;
              else if (istRec.due && istNow >= istRec.due) istPDue++;
            }
          }
          if (istN) {
            return istPDue
              ? { hero: istPDue, note: 'προς ανάκληση' }
              : { hero: istN, note: 'πλαγιότιτλοι · όλοι εντάξει' };
          }
          /* Κανένας πλαγιότιτλος ακόμη → οι υποενότητες, ΑΚΡΙΒΩΣ όπως πριν.
             ⭐ Δεν είναι «άδειο»: είναι η κατάσταση της πρώτης μέρας, και η
             σελίδα συμπεριφέρεται ΑΚΡΙΒΩΣ έτσι (σταθερή αρχή 33). */
          var istS = ladder('ist:v1'); if (!istS) return null;
          var istL = istS.learned, istD = istS.overdue;
          /* '—' όταν δεν έχει μάθει τίποτα — ποτέ placeholder σαν αριθμός (als-v433). */
          return istL ? { hero: istL, note: istD ? istD + ' προς επανάληψη' : 'υποενότητες' }
                      : { hero: '—', note: 'ξεκίνα' };
        }
        case 'tonos.html': {
          var tonS = ladder('ton:v1'); if (!tonS) return null;
          /* '\u2014' when nothing has been answered — a placeholder is never
             formatted into a number here (the als-v433 rule). */
          return tonS.samples ? { hero: Math.round(tonS.accuracy * 100), unit: '%', note: '\u03c3\u03c9\u03c3\u03c4\u03ac \u00b7 \u03c4\u03cc\u03bd\u03bf\u03b9' }
                              : { hero: '\u2014', note: '\u03be\u03b5\u03ba\u03af\u03bd\u03b1' };
        }
        case 'arxaia.html': {
          /* όλα τα locals με πρόθεμα arx* — η σταθερή αρχή 14 κερδήθηκε σε ΑΥΤΗ
             ακριβώς τη συνάρτηση: ένα var μέσα σε case σκιάζει όλη τη συνάρτηση.
             ⚠️ als-v460, ΣΤΑΘΕΡΗ ΑΡΧΗ 23: η σελίδα έχει ΔΥΟ κόσμους (ΑΓΝΩΣΤΟ =
             `arx:v1`, ΓΝΩΣΤΟ = `arx:gn`) και το πλακίδιο διάβαζε μόνο τον έναν.
             Αν δούλευε μόνο το Γνωστό, το Home θα έλεγε «ξεκίνα» για πάντα —
             ένα εύλογο ΛΑΘΟΣ, όχι error. Και τα δύο, πάντα.
             ⚠️ als-v458: τα κελιά του `arx:v1` έγιναν ΑΝΤΙΚΕΙΜΕΝΟ αντί για
             πίνακα· και τα δύο σχήματα ζουν ακόμη και τα διαβάζει το
             `ladders.js`, όχι αυτό το αρχείο. */
          var arxAg = ladder('arx:v1'), arxGn = ladder('arx:gn');
          if (!arxAg || !arxGn) return null;
          var arxAgT = arxAg.samples, arxGnT = arxGn.samples;
          var arxR = arxAg.right + arxGn.right, arxT = arxAgT + arxGnT;
          var arxNote = (arxAgT && arxGnT) ? '\u03c3\u03c9\u03c3\u03c4\u03ac \u00b7 \u03b3\u03bd\u03c9\u03c3\u03c4\u03cc + \u03ac\u03b3\u03bd\u03c9\u03c3\u03c4\u03bf'
            : arxGnT ? '\u03c3\u03c9\u03c3\u03c4\u03ac \u00b7 \u03c4\u03bf \u03b3\u03bd\u03c9\u03c3\u03c4\u03cc'
                     : '\u03c3\u03c9\u03c3\u03c4\u03ac \u00b7 \u03b1\u03c1\u03c7\u03b9\u03ba\u03bf\u03af \u03c7\u03c1\u03cc\u03bd\u03bf\u03b9';
          /* '\u2014' όταν δεν έχει απαντήσει τίποτα — ποτέ placeholder σαν αριθμό (als-v433). */
          return arxT ? { hero: Math.round(arxR / arxT * 100), unit: '%', note: arxNote }
                      : { hero: '\u2014', note: '\u03be\u03b5\u03ba\u03af\u03bd\u03b1' };
        }
        /* ΤΟ ΧΡΕΟΣ — το ένα πλακίδιο που βλέπει ΚΑΙ ΤΙΣ ΠΕΝΤΕ σκάλες μαζί με
           τις εργασίες του φροντιστηρίου. ⚠️ Όλα τα locals με πρόθεμα `hw*`
           (σταθερή αρχή 14: ένα `var` μέσα σε ΕΝΑ case σκιάζει το όνομα σε
           ΟΛΗ τη συνάρτηση, και κόστισε δύο εβδομάδες ψεύτικων πλακιδίων). */
        case 'homework.html': {
          var hwL = lads();
          var hwSt = ls('hw:v1', {}); var hwTasks = (hwSt && hwSt.tasks) || {};
          var hwOpen = 0, hwK;
          for (hwK in hwTasks) {
            if (!Object.prototype.hasOwnProperty.call(hwTasks, hwK)) continue;
            if (hwTasks[hwK] && !hwTasks[hwK].done) hwOpen++;
          }
          var hwDue = 0, hwBlind = 0, hwI;
          if (!hwL) return null;
          for (hwI = 0; hwI < hwL.stores.length; hwI++) {
            if (hwL.stores[hwI].ok) hwDue += hwL.stores[hwI].overdue; else hwBlind++;
          }
          /* Τρεις διαφορετικές προτάσεις, ποτέ η ίδια (σταθερή αρχή 10):
             «δεν διάβασα μια αποθήκη» \u2260 «δεν χρωστάς» \u2260 «να τι χρωστάς». */
          if (hwBlind) return { hero: '\u2014', note: hwBlind + (hwBlind === 1 ? ' \u03b1\u03c0\u03bf\u03b8\u03ae\u03ba\u03b7 \u03b4\u03b5\u03bd \u03b4\u03b9\u03b1\u03b2\u03ac\u03c3\u03c4\u03b7\u03ba\u03b5' : ' \u03b1\u03c0\u03bf\u03b8\u03ae\u03ba\u03b5\u03c2 \u03b4\u03b5\u03bd \u03b4\u03b9\u03b1\u03b2\u03ac\u03c3\u03c4\u03b7\u03ba\u03b1\u03bd') };
          if (!hwDue && !hwOpen) return { hero: '\u2014', note: '\u03ba\u03b1\u03b8\u03b1\u03c1\u03ac' };
          return { hero: hwDue + hwOpen, note: hwDue + ' \u03b1\u03bd\u03ac\u03ba\u03bb\u03b7\u03c3\u03b7 \u00b7 ' + hwOpen + ' \u03b5\u03c1\u03b3\u03b1\u03c3\u03af' + (hwOpen === 1 ? '\u03b1' : '\u03b5\u03c2') };
        }
      }
    } catch (e) { }
    return null;
  }
  function wSpark(W) { var a = (Array.isArray(W) ? W : []).slice(-12).map(function (e) { return +e.weight || 0; }).filter(function (x) { return x > 0; }); return a.length >= 3 ? a : null; }
  function recSpark(L) { var a = (Array.isArray(L) ? L : []).filter(function (e) { return e && e.recovery != null; }).slice(-12).map(function (e) { return +e.recovery; }); return a.length >= 3 ? a : null; }
  function sparkPts(arr) {
    var min = Math.min.apply(null, arr), max = Math.max.apply(null, arr), rng = (max - min) || 1;
    var pts = arr.map(function (v, i) { var x = (i / (arr.length - 1)) * 120; var y = 22 - ((v - min) / rng) * 18 - 2; return x.toFixed(1) + ',' + y.toFixed(1); }).join(' ');
    var last = pts.split(' ').pop().split(',');
    return { pts: pts, lx: last[0], ly: last[1] };
  }
  /* ===== END COPY ===== */

  window.ALSLauncherData = { metric: metric, lads: lads };
})();
