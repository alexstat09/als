/* ══════════════════════════════════════════════════════════════
   MÉTRON — home-live.js
   Wires the premium home (exact demo markup) to Alex's REAL data.
   Reads the same localStorage keys the app uses; never writes state.
   Runs BEFORE home-motion.js so count-up animates to real values.
   Every section is isolated in try/catch: if one read fails, the page
   still looks perfect (falls back to the built-in sample).
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  /* ── paint one tile from real data ──────────────────────────────────
     ⭐ als-v684: THE HOME WAS REDESIGNED and there are no tiles any more —
     hairline columns, a day card, a 24-hour ruler, a week grid and index rows.
     Everything above this line (ls … sparkPts, and metric() above all) is
     UNCHANGED, byte for byte: tests/home-tiles.test.js slices it up to this
     marker and tests/ladders.test.js proves its values against history.
     What follows only PAINTS. It reads the same stores the pages own and writes
     nothing — the one exception is still the water + (wireWater, unchanged), and
     the device-local `arc:seen` stamp (paintArcBand, unchanged).
     Three answers never look alike (constraint 10/33): a value · "nothing
     logged yet" (an invitation) · "couldn't read" (a reader threw). */
  var D = document;
  function byId(id) { return D.getElementById(id); }
  function keyOf(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function arr(k) { var v = ls(k, []); return Array.isArray(v) ? v : []; }
  function nowH() { var d = new Date(); return d.getHours() + d.getMinutes() / 60; }
  function hm(h) { h = ((h % 24) + 24) % 24; var H = Math.floor(h), M = Math.round((h - H) * 60); if (M === 60) { H = (H + 1) % 24; M = 0; } return ('0' + H).slice(-2) + ':' + ('0' + M).slice(-2); }
  function hOfTs(ts) { var d = new Date(ts); return d.getHours() + d.getMinutes() / 60; }
  function hOfClock(s) { var p = String(s || '').split(':'); if (p.length < 2) return null; var h = +p[0] + (+p[1]) / 60; return isNaN(h) ? null : h; }
  function durTxt(hours) { var H = Math.floor(hours), M = Math.round((hours - H) * 60); if (M === 60) { H++; M = 0; } return H + ' h ' + (M ? M + ' min' : ''); }
  function phase() { var h = new Date().getHours(); return h >= 5 && h < 12 ? 'morning' : h >= 12 && h < 18 ? 'afternoon' : 'evening'; }
  /* Instrument Serif has NO Greek glyphs (it falls back to Georgia and the
     accents break). Anything that may be Greek is set in the sans instead. */
  function isGreek(s) { return /[Ͱ-Ͽἀ-῿]/.test(String(s || '')); }
  function gr(s) { return isGreek(s) ? '<span class="gr">' + esc(s) + '</span>' : esc(s); }
  var anim = !reduce;

  /* ── the same filtered nutrition view metric() uses (nut:deleted honoured) ── */
  function nutLogs() {
    var all = arr('nut:logs'), del = ls('nut:deleted', {});
    if (!del || typeof del !== 'object' || Array.isArray(del)) del = {};
    return all.filter(function (l) { return l && l.id != null && !del[l.id]; });
  }
  function nutDayKey(l) { return l.dateKey || (l.ts ? keyOf(new Date(l.ts)) : null); }
  function trainDays() {
    var days = {}, done = ls('po_coach_workout_done', {}) || {};
    arr('po_workouts').forEach(function (w) { if (w && w.date) days[w.date] = 1; });
    Object.keys(done).forEach(function (k) { if (done[k]) days[k] = 1; });
    return days;
  }
  function sleepFor(key) { var s = arr('sleep:logs').filter(function (e) { return e && e.dateKey === key; }); return s[s.length - 1] || null; }
  function sleptHours(e) { if (!e) return null; if (e.hours > 0) return +e.hours; return null; }
  /* "Is he TRACKING this right now?" — a store counts only if it has an entry
     in the last 14 days. Water stopped on 16/09 and food on 16/09 when school
     began; asking for them every day would leave the day open forever. */
  var RECENT = 14;
  function recentKeys(n) { var out = [], d = new Date(); d.setHours(0, 0, 0, 0); for (var i = 0; i < n; i++) { var x = new Date(d); x.setDate(d.getDate() - i); out.push(keyOf(x)); } return out; }
  function cutoffKey() { return recentKeys(RECENT)[RECENT - 1]; }
  function active() {
    var cut = cutoffKey(), keys = recentKeys(RECENT), a = {};
    a.sleep = arr('sleep:logs').some(function (e) { return e && e.dateKey >= cut; });
    var W = arr('po_coach_weights'), lw = W[W.length - 1]; a.weight = !!(lw && lw.dateKey >= cut);
    a.food = nutLogs().some(function (l) { var k = nutDayKey(l); return k && k >= cut; });
    var td = trainDays(); a.train = Object.keys(td).some(function (k) { return k >= cut; });
    if (window.ALSWater) { var ws = waterState(); a.water = keys.some(function (k) { return ALSWater.count(ws, k) > 0; }); } else a.water = false;
    a.supps = keys.some(function (k) { var t = ls('stack:taken:' + k, null); return !!(t && typeof t === 'object' && Object.keys(t).some(function (id) { return t[id]; })); });
    return a;
  }
  /* mirrors supps.html dailyItems() verbatim: "as needed" items are never owed */
  function dailyStack() { return arr('stack:items').filter(function (i) { return i && i.id && i.name && (i.window || 'anytime') !== 'occasional'; }); }

  /* ── rolling digits — the figure rolls to its new value instead of swapping ── */
  function roll(node, val) {
    if (!node) return; val = String(val);
    var digits = val.replace(/\D/g, ''), have = node.querySelectorAll ? node.querySelectorAll('.dg') : [];
    if (!anim || !have || have.length !== digits.length || !/^\d+$/.test(val)) {
      if (!anim || !/^\d+$/.test(val)) { node.textContent = val; return; }
      var col = ''; for (var i = 0; i < 10; i++) col += '<span>' + i + '</span>';
      node.innerHTML = val.split('').map(function (ch) { return '<span class="dg"><span class="col" style="transform:translateY(-' + (+ch * 10) + '%)">' + col + '</span></span>'; }).join('');
      return;
    }
    var k = 0; val.split('').forEach(function (ch) { have[k].firstChild.style.transform = 'translateY(-' + (+ch * 10) + '%)'; k++; });
  }

  var tT = null;
  function toast(msg) { var t = byId('toast'); if (!t || !t.classList) return; t.textContent = msg; t.classList.add('on'); clearTimeout(tT); tT = setTimeout(function () { t.classList.remove('on'); }, 2800); }

  /* ── THE DAY CARD ───────────────────────────────────────────────────
     What is left today, each item READ from the store that owns it. Nothing is
     ticked here: a home that wrote another page's store would be a silent loss
     (constraint 16). An item appears only once its store has ever been used, so
     an account that never weighs in is not asked to every day. */
  function dayItems() {
    var t = tk(), out = [], A = active();
    if (A.sleep) { var se = sleepFor(t), sh = sleptHours(se); out.push({ id: 'sleep', name: 'Sleep logged', href: 'sleep.html', done: !!(se && (sh || se.wake || se.recovery != null)), when: sh ? durTxt(sh) : 'last night' }); }
    var W = arr('po_coach_weights');
    if (A.weight) { var lw = W[W.length - 1]; var wd = !!(lw && lw.dateKey === t); out.push({ id: 'weight', name: 'Weigh-in', href: 'weight.html', done: wd, when: wd ? (+lw.weight).toFixed(1) + ' kg' : 'not yet' }); }
    var nl = nutLogs();
    if (A.food) { var kc = Math.round(nl.filter(function (l) { return nutDayKey(l) === t; }).reduce(function (s, l) { return s + (l.kcal || 0); }, 0)); out.push({ id: 'food', name: 'Food logged', href: 'nutrition.html', done: kc > 0, when: kc > 0 ? fmtN(kc) + ' kcal' : 'nothing yet' }); }
    if (A.water) { var ws = waterState(), wc = waterCount(ws), wt = waterTarget(ws); if (wt > 0) out.push({ id: 'water', name: 'Water', href: 'po-water.html', done: wc >= wt, when: wc + ' / ' + wt, plus: true }); }
    var it = dailyStack();
    if (A.supps && it.length) { var tkn = ls('stack:taken:' + activeDate(), {}) || {}; var tc = it.filter(function (i) { return tkn[i.id]; }).length; out.push({ id: 'supps', name: 'Supplements', href: 'supps.html', done: tc >= it.length, when: tc + ' / ' + it.length }); }
    return out;
  }
  var dayWasClosed = null;     /* null until the first paint: loading a closed day is not a celebration */
  var CHECK = '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M2.5 7.5l3 3 6-7"/></svg>';
  function paintDay() {
    try {
      var items = dayItems(), list = byId('tdList'), meter = byId('tdMeter'); if (!list) return;
      var ph = phase();
      var k = byId('tdK'); if (k) k.textContent = ph === 'morning' ? 'This morning' : ph === 'afternoon' ? 'This afternoon' : 'Tonight';
      if (!items.length) {
        render(list, '<div class="td-empty">Nothing you are tracking right now. Anything you log for two weeks (sleep, weigh-ins, food, water, supplements) gets a line here.</div>');
        roll(byId('tdN'), '—'); var of0 = byId('tdOf'); if (of0) of0.textContent = ''; if (meter) meter.innerHTML = '';
        dayWasClosed = false; return;
      }
      var done = items.filter(function (i) { return i.done; }).length, closed = done === items.length;
      var ids = items.map(function (i) { return i.id; }).join(','), rowsNow = list.querySelectorAll ? list.querySelectorAll('.item') : [];
      if (list.getAttribute('data-ids') === ids && rowsNow.length === items.length) {
        Array.prototype.forEach.call(rowsNow, function (r, j) {   /* same rows: toggle in place, so the strike DRAWS */
          r.classList.toggle('done', !!items[j].done);
          var w = r.querySelector('.when'); if (w && w.textContent !== items[j].when) w.textContent = items[j].when;
        });
      } else {
      list.setAttribute('data-ids', ids);
      render(list, items.map(function (i) {
        return '<a class="item' + (i.done ? ' done' : '') + '" href="' + i.href + '" data-id="' + i.id + '"><span class="box">' + CHECK + '</span><span class="ttl">' + esc(i.name) + '</span><span class="when">' + esc(i.when) + '</span>' +
          (i.plus ? '<span class="plus" role="button" tabindex="0" data-water="1" aria-label="Log one water">+</span>' : '') + '</a>';
      }).join(''));
      }
      roll(byId('tdN'), done); var of = byId('tdOf'); if (of) of.textContent = ' / ' + items.length;
      if (meter) { var mh = ''; for (var j = 0; j < items.length; j++) mh += '<i' + (j < done ? ' class="on"' : '') + '></i>'; if (meter.getAttribute('data-html') !== mh) { meter.setAttribute('data-html', mh); meter.innerHTML = mh; } }
      var card = byId('today'); if (card && card.classList) card.classList.toggle('closed', closed);
      if (dayWasClosed === false && closed) celebrate();
      dayWasClosed = closed;
      paintHeadline(items, done);
    } catch (e) { }
  }
  /* ONE quiet reward when the day's last item lands while he is looking at it:
     the ruler is swept once in champagne, today's column stamps in, a toast.
     Never on load — a day that was already closed is just closed. */
  function celebrate() {
    try {
      sweepRuler();
      var cells = D.querySelectorAll('.c.t'); Array.prototype.forEach.call(cells, function (c) { c.classList.remove('stamp'); void c.offsetWidth; c.classList.add('stamp'); });
      toast(phase() === 'evening' ? 'Day closed. Everything is in.' : 'All in for today. Nice.');
      try { if (navigator.vibrate) navigator.vibrate([8, 40, 12]); } catch (e2) { }
    } catch (e) { }
  }

  /* ── the greeting + the one-sentence answer ── */
  function paintHeadline(items, done) {
    try {
      var h1 = byId('homeGreeting'); if (!h1) return;
      var hr = new Date().getHours();
      var part = hr < 5 ? 'Good night' : hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening';
      var name = ''; try { name = (window.ALSProfile && ALSProfile.firstName()) || ''; } catch (e) { }
      var left = items ? items.length - done : 0, ph = phase(), line2;
      if (items && items.length > 1 && left === 0) line2 = 'The day is <em>closed.</em>';
      else if (items && items.length === 1 && left === 0) line2 = '<em>All in</em> for today.';
      else if (left === 1) line2 = '<em>One thing</em> left.';
      else if (ph === 'evening' && left > 1) line2 = '<em>' + left + ' things</em> left tonight.';
      else line2 = ph === 'morning' ? 'The day is <em>wide open.</em>' : 'The day is <em>well under way.</em>';
      /* The name comes from ALSProfile, never the markup — Chrissie must never be
         greeted as Alex. id="homeGreetingName" stays for anything that looks for it. */
      var html = esc(part) + (name ? ', <span id="homeGreetingName">' + gr(name) + '.</span>' : '<span id="homeGreetingName"></span>.') + '<br>' + line2;
      if (h1.getAttribute('data-html') !== html) { h1.setAttribute('data-html', html); h1.innerHTML = html; }
      paintLede();
    } catch (e) { }
  }
  function paintLede() {
    try {
      var p = byId('lede'); if (!p) return;
      var t = tk(), bits = [];
      var kc = Math.round(nutLogs().filter(function (l) { return nutDayKey(l) === t; }).reduce(function (s, l) { return s + (l.kcal || 0); }, 0));
      var prot = Math.round(nutLogs().filter(function (l) { return nutDayKey(l) === t; }).reduce(function (s, l) { return s + (l.protein || l.p || 0); }, 0));
      if (kc > 0) bits.push('you’ve eaten <b>' + fmtN(kc) + ' kcal</b>' + (prot ? ' with <b>' + prot + ' g protein</b>' : ''));
      var Wl = arr('po_coach_weights'), lwl = Wl[Wl.length - 1]; if (lwl && lwl.dateKey === t && +lwl.weight) bits.push('weighed in at <b>' + (+lwl.weight).toFixed(1) + ' kg</b>');
      var sh = sleptHours(sleepFor(t)); if (sh) bits.push('slept <b>' + durTxt(sh).trim() + '</b>');
      var tw = arr('po_workouts').filter(function (w) { return w && w.date === t; });
      if (tw.length) bits.push('finished <b>' + gr(tw[tw.length - 1].name || 'a session') + '</b>');
      else if ((ls('po_coach_workout_done', {}) || {})[t]) bits.push('finished <b>today’s session</b>');
      var s;
      if (!bits.length) s = 'Nothing logged yet today.';
      else { var last = bits.pop(); s = (bits.length ? bits.join(', ') + ' and ' + last : last) + '.'; s = s.charAt(0).toUpperCase() + s.slice(1); }
      if (p.getAttribute('data-html') !== s) { p.setAttribute('data-html', s); p.innerHTML = s; }
    } catch (e) { }
  }
  /* The primary button follows the time of day; Readiness is the real recovery
     score or it is simply not shown. */
  function paintActs() {
    try {
      var acts = byId('acts'); if (!acts || !acts.querySelectorAll) return;
      var ph = phase(), pri = ph === 'afternoon' ? 'c' : 'm', rec = latestRecovery();
      Array.prototype.forEach.call(acts.querySelectorAll('.btn'), function (b) {
        var on = b.getAttribute('data-k') === pri; b.classList.toggle('pri', on);
        var base = { m: 'Morning briefing', w: 'Weekly review', c: 'Coach' }[b.getAttribute('data-k')];
        var html = esc(base) + (on && b.getAttribute('data-k') === 'm' && rec != null ? ' <small>Readiness ' + rec + '</small>' : '');
        if (b.getAttribute('data-html') !== html) { b.setAttribute('data-html', html); b.innerHTML = html; }
      });
    } catch (e) { }
  }
  function latestRecovery() {
    var L = arr('sleep:logs'), today = L.filter(function (e) { return e && e.dateKey === tk() && e.recovery != null; });
    if (today.length) return Math.round(today[today.length - 1].recovery);
    var wr = L.filter(function (e) { return e && e.recovery != null; }).sort(function (a, b) { return a.dateKey < b.dateKey ? -1 : 1; });
    return wr.length ? Math.round(wr[wr.length - 1].recovery) : null;
  }

  /* ── THE RULER — today in 24 hours, from what he actually logged ──
     Sleep from the night's own bed/wake times, food at the time it was LOGGED
     (only for entries FOR today and logged today — a back-dated meal has no
     honest time of day), caffeine at its time, training from startedAt +
     durationSec. Nothing is scheduled or guessed; an empty day says so. */
  var NS = 'http://www.w3.org/2000/svg', RU = { ev: null, hov: null, W: 0, hl: null, first: true };
  function svgEl(p, tag, a) { var e = D.createElementNS(NS, tag); for (var k in a) e.setAttribute(k, a[k]); p.appendChild(e); return e; }
  function dayEvents() {
    var t = tk(), now = new Date(), blocks = [], points = [], ticks = [];
    var se = sleepFor(t);
    if (se) {
      var wake = hOfClock(se.wake || se.wakeMeasured), bed = hOfClock(se.bed), sh = sleptHours(se);
      if (wake != null) { var from = (bed != null && bed < wake) ? bed : 0; blocks.push({ a: from, b: wake, name: 'Sleep', c: '--rest', dark: true, lab: 'Sleep' + (sh ? ' ' + durTxt(sh).replace(' min', '').replace(' h ', ':').replace(/:$/, ':00').replace(/:(\d)$/, ':0$1') : ''), det: (bed != null ? hm(bed) + ' → ' : 'until ') + hm(wake) + (sh ? ' · ' + durTxt(sh).trim() : '') }); }
    }
    arr('po_workouts').forEach(function (w) {
      if (!w || w.date !== t || !w.startedAt) return; var s = new Date(w.startedAt); if (isNaN(s) || keyOf(s) !== t) return;
      var a = s.getHours() + s.getMinutes() / 60, b = Math.min(24, a + Math.max(0.25, (+w.durationSec || 0) / 3600));
      blocks.push({ a: a, b: b, name: w.name || 'Training', c: '--train', lab: isGreek(w.name) ? '' : (w.name || 'Training'), det: (w.volume ? fmtN(Math.round(w.volume)) + ' kg · ' : '') + (w.durationSec ? Math.round(w.durationSec / 60) + ' min' : '') });
    });
    var foods = nutLogs().filter(function (l) { return nutDayKey(l) === t && l.ts && keyOf(new Date(l.ts)) === t; }).sort(function (x, y) { return x.ts - y.ts; });
    foods.forEach(function (l) {   /* foods logged within 20 min of each other read as one meal */
      var h = hOfTs(l.ts), last = points[points.length - 1];
      if (last && h - last.hEnd < 1 / 3) { last.kcal += (l.kcal || 0); last.n++; last.hEnd = h; }
      else points.push({ h: h, hEnd: h, kcal: (l.kcal || 0), n: 1, first: l.name || '' });
    });
    arr('caf:logs').forEach(function (c) { if (!c || !c.ts || keyOf(new Date(c.ts)) !== t) return; ticks.push({ h: hOfTs(c.ts), mg: +c.mg || 0, name: c.name || 'Caffeine' }); });
    return { blocks: blocks, points: points, ticks: ticks, now: now.getHours() + now.getMinutes() / 60 };
  }
  function readAt(h) {
    var ev = RU.ev; if (!ev) return '';
    var best = null, bd = 0.3, kind = '';
    ev.points.forEach(function (p) { var d = Math.abs(p.h - h); if (d < bd) { bd = d; best = p; kind = 'food'; } });
    ev.ticks.forEach(function (p) { var d = Math.abs(p.h - h); if (d < bd) { bd = d; best = p; kind = 'caf'; } });
    if (best && kind === 'food') return '<b>' + hm(best.h) + ' · ' + (best.n > 1 ? best.n + ' foods logged' : esc(best.first || 'Food logged')) + '</b> · ' + fmtN(Math.round(best.kcal)) + ' kcal';
    if (best && kind === 'caf') return '<b>' + hm(best.h) + ' · ' + esc(best.name) + '</b>' + (best.mg ? ' · ' + best.mg + ' mg' : '');
    for (var i = 0; i < ev.blocks.length; i++) { var b = ev.blocks[i]; if (h >= b.a && h <= b.b) return '<b>' + esc(b.name) + '</b>' + (b.det ? ' · ' + esc(b.det) : ''); }
    return '<b>' + hm(h) + '</b> · ' + (h > ev.now ? 'still ahead' : 'nothing logged');
  }
  function ruIdle() {
    var ro = byId('ro'), ev = RU.ev; if (!ro || !ev) return;
    var n = ev.points.length, mg = ev.ticks.reduce(function (s, c) { return s + c.mg; }, 0), bits = [];
    if (n) bits.push(n + (n === 1 ? ' meal' : ' meals') + ' logged');
    if (mg) bits.push(mg + ' mg caffeine');
    ro.innerHTML = '<b>Now ' + hm(ev.now) + '</b> · ' + (bits.length || ev.blocks.length ? (bits.join(' · ') || 'logged so far below') : 'nothing logged yet today');
  }
  function paintRuler() {
    try {
      var svg = byId('ru'); if (!svg || !svg.getBoundingClientRect || !D.createElementNS) return;
      var W = svg.clientWidth, H = svg.clientHeight; if (!W || !H) return;
      var ph = W < 600, ev = dayEvents(); RU.ev = ev; RU.W = W;
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); while (svg.firstChild) svg.removeChild(svg.firstChild);
      var css = getComputedStyle(D.documentElement), V = function (n) { return css.getPropertyValue(n).trim(); };
      var x = function (h) { return h / 24 * W; }, L1 = 28, L2 = ph ? 70 : 64, lh = 22, first = RU.first && anim;
      for (var h = 0; h <= 24; h++) {
        var X = Math.min(W - 0.5, Math.max(0.5, x(h))), maj = h % 3 === 0;
        svgEl(svg, 'line', { x1: X, x2: X, y1: maj ? L1 - 10 : L1 - 4, y2: L2 + lh, stroke: maj ? 'rgba(255,255,255,.10)' : 'rgba(255,255,255,.045)' });
        if (maj && (!ph || h % 6 === 0) && h < 24) { var tx = svgEl(svg, 'text', { x: X + 4, y: L1 - 12 }); tx.textContent = ('0' + h).slice(-2) + ':00'; }
      }
      ev.blocks.forEach(function (b) {
        var g = svgEl(svg, 'g', {}), rc = svgEl(g, 'rect', { x: x(b.a), y: L1, width: Math.max(3, x(b.b) - x(b.a)), height: lh, rx: 5, fill: V(b.c) });
        if (b.lab && (x(b.b) - x(b.a)) > (ph ? 58 : 74)) { var t2 = svgEl(g, 'text', { x: x(b.a) + 9, y: L1 + 15, 'class': 'lab' + (b.dark ? ' dk' : '') }); t2.textContent = b.lab; }
        if (first && rc.animate) { rc.style.transformBox = 'fill-box'; rc.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 800, delay: 300 + b.a * 25, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' }); }
      });
      ev.points.forEach(function (p, i) {
        var c = svgEl(svg, 'circle', { cx: x(p.h), cy: L2 + lh / 2, r: p.n > 1 ? 6 : 5, fill: V('--fuel') });
        if (first && c.animate) c.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: 600 + i * 70, fill: 'backwards' });
      });
      ev.ticks.forEach(function (c) { svgEl(svg, 'rect', { x: x(c.h) - 1.5, y: L2 + 2, width: 3, height: lh - 4, rx: 1.5, fill: V('--caf') }); });
      var n = x(ev.now);
      svgEl(svg, 'rect', { x: n, y: L1 - 10, width: Math.max(0, W - n), height: L2 + lh - L1 + 10, fill: 'rgba(8,9,11,.5)' });
      svgEl(svg, 'line', { x1: n, x2: n, y1: L1 - 16, y2: L2 + lh + 8, stroke: V('--acc'), 'stroke-width': 1.5 });
      svgEl(svg, 'circle', { cx: n, cy: L2 + lh + 8, r: 3.5, fill: V('--acc') });
      var nt = svgEl(svg, 'text', { x: ev.now < 4 ? n + 6 : n - 6, y: L2 + lh + 26, 'text-anchor': ev.now < 4 ? 'start' : 'end', 'class': 'nowt' }); nt.textContent = 'NOW ' + hm(ev.now);
      RU.hl = svgEl(svg, 'line', { x1: 0, x2: 0, y1: L1 - 16, y2: L2 + lh + 8, stroke: 'rgba(255,255,255,.6)', 'stroke-width': 1, opacity: 0 });
      RU.first = false;
      if (RU.hov != null) scrub(RU.hov); else ruIdle();
    } catch (e) { }
  }
  function scrub(h) { if (!RU.hl) return; h = Math.max(0, Math.min(23.99, h)); RU.hov = h; var X = h / 24 * RU.W; RU.hl.setAttribute('x1', X); RU.hl.setAttribute('x2', X); RU.hl.setAttribute('opacity', 1); var ro = byId('ro'); if (ro) ro.innerHTML = readAt(h); }
  function unscrub() { RU.hov = null; if (RU.hl) RU.hl.setAttribute('opacity', 0); ruIdle(); }
  function sweepRuler() {
    var svg = byId('ru'); if (!svg || !RU.W || reduce) return;
    var r = svgEl(svg, 'rect', { x: 0, y: 10, width: RU.W, height: Math.max(10, svg.clientHeight - 36), rx: 6, fill: '#D9C49A', opacity: 0 });
    r.style.transformBox = 'fill-box'; r.style.transformOrigin = 'left';
    var a = r.animate([{ transform: 'scaleX(0)', opacity: 0.2 }, { transform: 'scaleX(1)', opacity: 0.14, offset: 0.65 }, { transform: 'scaleX(1)', opacity: 0 }], { duration: 1500, easing: 'cubic-bezier(.65,0,.35,1)' });
    a.onfinish = function () { if (r.parentNode) r.parentNode.removeChild(r); };
  }
  (function wireRuler() {
    var svg = byId('ru'); if (!svg || !svg.getBoundingClientRect) return;
    svg.addEventListener('pointermove', function (e) { var b = svg.getBoundingClientRect(); if (b.width) scrub((e.clientX - b.left) / b.width * 24); });
    svg.addEventListener('pointerleave', unscrub);
    svg.addEventListener('pointerup', function (e) { if (e.pointerType === 'touch') setTimeout(unscrub, 1400); });
    svg.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); scrub((RU.hov == null ? (RU.ev ? RU.ev.now : 12) : RU.hov) + (e.key === 'ArrowRight' ? 0.25 : -0.25)); }
      else if (e.key === 'Escape') unscrub();
    });
    svg.addEventListener('blur', unscrub);
  })();

  /* ── the four columns: Nutrition · Sleep · Training · Weight ── */
  function chart(svg, vals, color, opt) {
    if (!svg || !svg.getBoundingClientRect || !D.createElementNS) return;
    var W = svg.clientWidth, H = svg.clientHeight; while (svg.firstChild) svg.removeChild(svg.firstChild);
    if (!W || !H || !vals || vals.filter(function (v) { return v != null; }).length < 2) { svg.style.visibility = 'hidden'; return; }
    svg.style.visibility = ''; svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    if (opt && opt.bars) {
      var mx = Math.max.apply(null, vals.map(function (v) { return v || 0; })) || 1, gap = 6, bw = (W - gap * (vals.length - 1)) / vals.length;
      vals.forEach(function (v, i) { var hh = v ? Math.max(4, v / mx * (H - 4)) : 2; svgEl(svg, 'rect', { x: i * (bw + gap), y: H - hh, width: bw, height: hh, rx: 3, fill: v ? color : 'rgba(255,255,255,.08)', 'fill-opacity': i === vals.length - 1 ? 1 : 0.45 }); });
      return;
    }
    var pts = []; vals.forEach(function (v, i) { if (v != null) pts.push([i, v]); });
    var ys = pts.map(function (p) { return p[1]; }), mn = Math.min.apply(null, ys), mx2 = Math.max.apply(null, ys), sp = (mx2 - mn) || 1;
    if (opt && opt.floor && sp < opt.floor) { var mid = (mx2 + mn) / 2; mn = mid - opt.floor / 2; sp = opt.floor; }
    var X = function (i) { return vals.length > 1 ? i / (vals.length - 1) * W : W; }, Y = function (y) { return H - 3 - (y - mn) / sp * (H - 8); };
    var d = pts.map(function (p, i) { return (i ? 'L' : 'M') + X(p[0]).toFixed(1) + ' ' + Y(p[1]).toFixed(1); }).join('');
    var path = svgEl(svg, 'path', { d: d, fill: 'none', stroke: color, 'stroke-width': 1.6, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });
    if (pts.length <= 8) pts.slice(0, -1).forEach(function (p) { svgEl(svg, 'circle', { cx: X(p[0]), cy: Y(p[1]), r: 2, fill: '#08090B', stroke: color, 'stroke-width': 1.2 }); });
    var lp = pts[pts.length - 1]; svgEl(svg, 'circle', { cx: X(lp[0]), cy: Y(lp[1]), r: 3.6, fill: color });
    if (anim && !svg.getAttribute('data-drawn') && path.getTotalLength && path.animate) { var L = path.getTotalLength(); path.style.strokeDasharray = L; path.animate([{ strokeDashoffset: L }, { strokeDashoffset: 0 }], { duration: 1100, delay: 300, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' }); }
    svg.setAttribute('data-drawn', '1');
  }
  function last7() { var out = [], d = new Date(); d.setHours(0, 0, 0, 0); for (var i = 6; i >= 0; i--) { var x = new Date(d); x.setDate(d.getDate() - i); out.push(keyOf(x)); } return out; }
  function setCol(id, o) {
    var m = byId(id); if (!m || !m.querySelector) return;
    m.classList.toggle('err', !!o.err);
    var f = m.querySelector('.fig'), l = m.querySelector('.line'), ft = m.querySelector('.foot');
    var fh = o.err ? '—' : o.fig; if (f && f.getAttribute('data-html') !== fh) { f.setAttribute('data-html', fh); f.innerHTML = fh; }
    if (f) f.classList.toggle('txt', !!o.txt);
    var lh2 = o.err ? 'Couldn’t read this. Open the page to check.' : (o.line || ''); if (l && l.getAttribute('data-html') !== lh2) { l.setAttribute('data-html', lh2); l.innerHTML = lh2; }
    var fth = o.err ? '' : (o.foot || ''); if (ft && ft.getAttribute('data-html') !== fth) { ft.setAttribute('data-html', fth); ft.innerHTML = fth; }
    var svg = m.querySelector('svg'); if (svg) { if (o.err) { svg.style.visibility = 'hidden'; } else chart(svg, o.vals, o.color, o.opt); }
  }
  function paintColumns() {
    var t = tk(), days = last7();
    try {   /* Nutrition — kcal + protein today, the last seven days by dateKey */
      var nm = metric('nutrition.html');
      if (!nm) setCol('mNut', { err: true });
      else {
        var by = {}; nutLogs().forEach(function (l) { var k = nutDayKey(l); if (k) by[k] = (by[k] || 0) + (l.kcal || 0); });
        var streak = (ls('nut:streak', null) || {}).count;
        setCol('mNut', nm.hero === '—'
          ? { fig: '—', line: 'Nothing logged yet today.', foot: '<span>7 days</span><span>log food</span>', vals: days.map(function (k) { return by[k] ? Math.round(by[k]) : null; }), color: '#E59A7C' }
          : { fig: '<span>' + fmtN(nm.hero) + '</span><span class="unit">kcal</span>', line: esc(nm.note || ''), foot: '<span>7 days</span><span>' + (typeof streak === 'number' && streak > 0 ? fmtN(streak) + '-day streak' : '') + '</span>', vals: days.map(function (k) { return by[k] ? Math.round(by[k]) : null; }), color: '#E59A7C' });
      }
    } catch (e) { setCol('mNut', { err: true }); }
    try {   /* Sleep — last night, the last seven nights */
      var L = arr('sleep:logs'), se = sleepFor(t), sh = sleptHours(se);
      var lastS = L.filter(function (e) { return e && e.hours > 0; }).sort(function (a, b) { return a.dateKey < b.dateKey ? -1 : 1; }).pop();
      var vals = days.map(function (k) { var e = sleepFor(k); return e && e.hours > 0 ? +e.hours : null; });
      var shown = sh || (lastS ? +lastS.hours : null), H0 = shown ? Math.floor(shown) : 0, M0 = shown ? Math.round((shown - H0) * 60) : 0; if (M0 === 60) { H0++; M0 = 0; }
      var rec = se && se.recovery != null ? Math.round(se.recovery) : null;
      var times = se && se.bed && (se.wake || se.wakeMeasured) ? se.bed + ' – ' + (se.wake || se.wakeMeasured) : '';
      var avg = vals.filter(function (v) { return v; }); avg = avg.length ? avg.reduce(function (s, v) { return s + v; }, 0) / avg.length : null;
      setCol('mSleep', shown
        ? { fig: H0 + ':' + ('0' + M0).slice(-2) + '<span class="unit">h</span>', line: (rec != null ? '<b>Recovery ' + rec + '</b>' + (times ? ' · ' : '') : '') + esc(times || (sh ? '' : 'last logged ' + relDay(lastS.dateKey))), foot: '<span>7 nights</span><span>' + (avg ? 'avg ' + Math.floor(avg) + ':' + ('0' + Math.round((avg % 1) * 60)).slice(-2) : '') + '</span>', vals: vals, color: '#93A8E0', opt: { floor: 2 } }
        : { fig: '—', line: 'Log your sleep.', foot: '', vals: vals, color: '#93A8E0' });
    } catch (e) { setCol('mSleep', { err: true }); }
    try {   /* Training — today's session if there is one, else the last; sessions this week */
      var WO = arr('po_workouts'), td = trainDays(), wk = workoutsThisWeek();
      var sorted = WO.filter(function (w) { return w && w.date; }).sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : ((a.startedAt || '') < (b.startedAt || '') ? -1 : 1); });
      var lw = sorted[sorted.length - 1], ds = Object.keys(td).sort(), ld = ds[ds.length - 1];
      var vol = days.map(function (k) { return WO.filter(function (w) { return w && w.date === k; }).reduce(function (s, w) { return s + (+w.volume || 0); }, 0) || (td[k] ? 1 : 0); });
      if (!ld) setCol('mTrain', { fig: 'Ready', txt: true, line: 'No sessions logged yet.', foot: '', vals: null });
      else {
        var isToday = ld === t, nm2 = lw && lw.date === ld ? (lw.name || 'Session') : 'Session';
        setCol('mTrain', { fig: isGreek(nm2) ? '<span class="gr">' + esc(nm2) + '</span>' : esc(isToday ? nm2 : cap(relDay(ld))), txt: true,
          line: isToday ? ((lw && lw.date === t && lw.volume ? '<b>' + fmtN(Math.round(lw.volume)) + ' kg</b>' : '<b>Done today</b>') + (lw && lw.date === t && lw.durationSec ? ' · ' + Math.round(lw.durationSec / 60) + ' min' : '')) : 'Last: <b>' + gr(nm2) + '</b>',
          foot: '<span>' + wk + (wk === 1 ? ' session' : ' sessions') + ' this week</span><span>7 days</span>', vals: vol, color: '#7FCFA4', opt: { bars: true } });
      }
    } catch (e) { setCol('mTrain', { err: true }); }
    try {   /* Weight — the latest weigh-in, its change, the last twelve */
      var wm = metric('weight.html');
      if (!wm) setCol('mWeight', { err: true });
      else if (wm.hero === '—') setCol('mWeight', { fig: '—', line: 'Log a weigh-in.', foot: '', vals: null });
      else {
        var Wt = arr('po_coach_weights'), lastW = Wt[Wt.length - 1];
        setCol('mWeight', { fig: (+wm.hero).toFixed(1) + '<span class="unit">kg</span>', line: '<b>' + esc(cap(wm.note || '')) + '</b>', foot: '<span>' + (wm.spark ? wm.spark.length + ' weigh-ins' : '1 weigh-in') + '</span><span>' + (lastW && lastW.dateKey ? relDay(lastW.dateKey) : '') + '</span>', vals: wm.spark, color: '#C9A3CF', opt: { floor: 3 } });
      }
    } catch (e) { setCol('mWeight', { err: true }); }
  }

  /* ── THE WEEK, Mon–Sun ((getDay()+6)%7 — constraint 5) ── */
  var WK_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  function paintWeek() {
    try {
      var host = byId('g7'); if (!host) return;
      var today = new Date(); today.setHours(0, 0, 0, 0);
      var dow = (today.getDay() + 6) % 7, start = new Date(today); start.setDate(today.getDate() - dow);
      var keys = []; for (var i = 0; i < 7; i++) { var d = new Date(start); d.setDate(start.getDate() + i); keys.push(keyOf(d)); }
      var by = {}; nutLogs().forEach(function (l) { var k = nutDayKey(l); if (k) by[k] = (by[k] || 0) + (l.kcal || 0); });
      var td = trainDays(), ws = waterState(), wt = waterTarget(ws);
      var A = active(), wd = {}; arr('po_coach_weights').forEach(function (w) { if (w && w.dateKey) wd[w.dateKey] = 1; });
      var rows = [];
      if (A.weight) rows.push(['Weigh-in', '--wt', function (k) { return !!wd[k]; }]);
      if (A.food) rows.push(['Food', '--fuel', function (k) { return by[k] > 0; }]);
      if (A.sleep) rows.push(['Sleep', '--rest', function (k) { var e = sleepFor(k); return !!(e && e.hours > 0); }]);
      if (A.train) rows.push(['Training', '--train', function (k) { return !!td[k]; }]);
      if (A.water && wt > 0) rows.push(['Water', '--h2o', function (k) { return ALSWater.count(ws, k) >= wt; }]);
      if (!rows.length) { render(host, ''); roll(byId('wkN'), '—'); var of0 = byId('wkOf'); if (of0) of0.textContent = ''; var p0 = byId('wkP'); if (p0) p0.textContent = 'Nothing tracked in the last two weeks. Log anything and this week fills in.'; return; }
      var h = '<span></span>', filled = 0, total = 0, gaps = [];
      ['M', 'T', 'W', 'T', 'F', 'S', 'S'].forEach(function (dn, j) { h += '<span class="dl' + (j === dow ? ' t' : '') + '">' + dn + '</span>'; });
      rows.forEach(function (r) {
        h += '<span class="rl">' + r[0] + '</span>';
        keys.forEach(function (k, j) {
          var fut = j > dow, f = !fut && r[2](k);
          if (!fut) { total++; if (f) filled++; else if (j < dow) gaps.push([r[0], j]); }
          h += '<i class="c' + (f ? ' f' : '') + (j === dow ? ' t' : '') + (fut ? ' fut' : '') + '" style="--cc:var(' + r[1] + ')" title="' + r[0] + ' · ' + WK_NAMES[j] + (fut ? '' : f ? ' · done' : ' · not logged') + '"></i>';
        });
      });
      render(host, h);
      roll(byId('wkN'), filled); var of = byId('wkOf'); if (of) of.textContent = 'of ' + total + ' so far';
      var p = byId('wkP'), s;
      if (!filled) s = 'Nothing logged this week yet.';
      else if (!gaps.length) s = dow === 0 ? 'A fresh week. Today is the first day.' : 'Every day so far is complete.';
      else if (gaps.length === 1) s = 'Only ' + gaps[0][0].toLowerCase() + ' on ' + WK_NAMES[gaps[0][1]] + ' is missing.';
      else { var cnt = {}; gaps.forEach(function (g) { cnt[g[0]] = (cnt[g[0]] || 0) + 1; }); var worst = Object.keys(cnt).sort(function (a, b) { return cnt[b] - cnt[a]; })[0]; s = gaps.length + ' gaps before today, most of them ' + worst.toLowerCase() + '.'; }
      if (p) p.textContent = s;
    } catch (e) { }
  }

  /* ── "What Nova noticed" — real insights ── */
  function paintInsights() {
    try {
      if (!window.ALSInsights) return;
      var ins = window.ALSInsights.compute() || [];
      var q = byId('novaQ'), src = byId('novaSrc'), more = byId('novaMore'); if (!q) return;
      if (!ins.length) {
        q.textContent = 'Nova is still learning your patterns. Keep logging and correlations will appear here.';
        if (src) src.textContent = ''; if (more) render(more, ''); return;
      }
      var top = ins[0];
      if (q.textContent !== String(top.text)) q.textContent = String(top.text || '');
      if (src) src.textContent = cap(top.domain || 'pattern') + (top.strength != null ? ' · ' + Math.round(top.strength * 100) + '% confidence' : '');
      if (more) render(more, ins.slice(1, 3).map(function (i) { return '<p>' + esc(i.text) + '</p>'; }).join(''));
    } catch (e) { }
  }

  /* ── "Where you're headed" — real forecasts ── */
  function paintForecasts() {
    try {
      if (!window.ALSForecast) return;
      var fc = window.ALSForecast.compute() || [];
      var host = byId('fc'); if (!host) return;
      if (!fc.length) { render(host, '<div><span class="k">Trajectory</span><div class="line">A few more days of data and Nova will project where your trends are heading.</div></div>'); return; }
      var labels = { weight: 'Bodyweight', lift: 'Strength', recovery: 'Recovery' };
      render(host, fc.slice(0, 3).map(function (f) { return '<div><span class="k">' + (labels[f.kind] || 'Projection') + '</span><div class="line">' + esc(f.text) + '</div></div>'; }).join(''));
    } catch (e) { }
  }

  /* ── EVERYTHING — every page, each row carrying its metric() value ── */
  function rowVal(m) {
    if (!m) return null;
    if (m.hero === '—' || m.hero == null) return { t: m.note || '', cls: '' };
    if (m.txt) return { t: m.hero + (m.note ? ' · ' + m.note : ''), cls: m.hero === 'today' ? 'good' : '' };
    var v = m.comma ? fmtN(Math.round(m.hero)) : (m.dec ? (+m.hero).toFixed(m.dec) : m.hero);
    var unit = m.unit ? (m.unit === '€' ? '' : ' ' + m.unit) : '';
    return { t: (m.unit === '€' ? '€' : '') + v + unit + (m.note ? ' · ' + m.note : ''), cls: '' };
  }
  function paintRows() {
    try {
      var rows = D.querySelectorAll('.row'); if (!rows) return;
      Array.prototype.forEach.call(rows, function (r) {
        try {
          var h = href(r); if (h === 'scripture.html') return;   /* no reader for it: the label stays */
          var m = metric(h), v = r.querySelector('.v'); if (!v) return;
          if (m === null && h !== 'run.html') { if (!v.getAttribute('data-orig')) v.setAttribute('data-orig', v.textContent); v.textContent = 'couldn’t read'; v.className = 'v err'; return; }
          var o = rowVal(m); if (!o) return;
          if (v.textContent !== o.t) v.textContent = o.t;
          v.className = 'v' + (o.cls ? ' ' + o.cls : '');
        } catch (e) { }
      });
    } catch (e) { }
  }
  function paintSchool() {
    try {
      var m = metric('homework.html'), n = byId('schoolN'), s = byId('schoolNote'); if (!n || !s) return;
      if (!m) { n.textContent = '—'; s.textContent = 'εργασίες · ανάκληση'; return; }   /* ladders.js did not load: leave it, never a 0 */
      n.textContent = m.hero === '—' ? '—' : String(m.hero);
      s.textContent = m.note || '';
    } catch (e) { }
  }

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  /* ── water quick-log chip ── */
  function waterState() { var s = ls('po_water_v1', {}); return (s && typeof s === 'object') ? s : {}; }
  function waterCount(s) { return window.ALSWater ? ALSWater.count(s, tk()) : 0; }
  /* target comes from water.js — the one place the maths lives (this copy used
     to read activityHrsPerWeek as DAILY hours and showed 10 bottles, not 7). */
  function waterTarget(s) { return window.ALSWater ? ALSWater.target(s).units : 0; }
  function paintWater() {
    try {
      var c = document.getElementById('wCount'); if (!c) return;
      var s = waterState();
      c.textContent = waterCount(s);
      var g = document.getElementById('wGoal'); if (g) g.textContent = '/ ' + waterTarget(s);
    } catch (e) { }
  }
  (function wireWater() {
    var btn = document.getElementById('wAdd'); if (!btn) return;
    btn.addEventListener('click', function () {
      try {
        var s = waterState();
        if (!s.logs || typeof s.logs !== 'object') s.logs = {};
        var t = tk(), raw = s.logs[t];
        var cur = (typeof raw === 'number') ? raw : (raw && typeof raw.n === 'number' ? raw.n : 0);
        s.logs[t] = cur + 1;                 /* canonical plain-number day shape */
        s._ts = Date.now();                  /* last-write-wins — survives the Math.max('logs') merge */
        localStorage.setItem('po_water_v1', JSON.stringify(s));
        var b = document.getElementById('wCount');
        if (b) { b.textContent = cur + 1; b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); }
        try { if (navigator.vibrate) navigator.vibrate(8); } catch (e2) { }
      } catch (e) { }
    });
  })();
  /* The day card's + is the SAME write: it clicks the chip's button, so there is
     exactly one water writer on this page (constraint 15). After it, the
     home repaints what depends on water. A failed save is said, not swallowed. */
  (function wireDayWater() {
    var list = byId('tdList'), add = byId('wAdd'); if (!list || !add || !list.addEventListener) return;
    list.addEventListener('click', function (e) {
      var b = e.target && e.target.closest ? e.target.closest('[data-water]') : null; if (!b) return;
      e.preventDefault(); e.stopPropagation(); add.click();
    });
    list.addEventListener('keydown', function (e) {
      var b = e.target && e.target.closest ? e.target.closest('[data-water]') : null; if (!b || (e.key !== 'Enter' && e.key !== ' ')) return;
      e.preventDefault(); e.stopPropagation(); add.click();
    });
    var wBefore = null;
    /* capture phase: runs BEFORE wireWater's write, so we know what it started from */
    add.addEventListener('click', function () { try { wBefore = waterCount(waterState()); } catch (e) { wBefore = null; } }, true);
    add.addEventListener('click', function () {
      setTimeout(function () {
        var after = null; try { after = waterCount(waterState()); } catch (e) { }
        /* wireWater swallows a failed setItem (full device, private mode). Its result is
           the stored count, so a count that did not move means nothing was saved. */
        if (after == null || (wBefore != null && after <= wBefore)) { toast('That glass didn’t save. Open Water to log it.'); return; }
        paintDay(); paintWeek(); var tg = waterTarget(waterState());
        toast('Water logged · ' + after + (tg ? ' of ' + tg : ''));
      }, 0);
    });
  })();

  /* ── the vault line ── backup.html stamps `backup:lastFile` whenever a file is
     actually exported; no stamp means no backup ON THIS DEVICE, said plainly. */
  function paintVault() {
    try {
      var el = document.getElementById('vaultLast'); if (!el) return;
      var iso = null; try { iso = localStorage.getItem('backup:lastFile'); } catch (e) { return; }
      if (!iso) { el.textContent = 'back up your data'; return; }
      var d = new Date(iso); if (isNaN(d.getTime())) { el.textContent = 'back up your data'; return; }
      d.setHours(0, 0, 0, 0);
      var t0 = new Date(); t0.setHours(0, 0, 0, 0);
      var age = Math.round((t0 - d) / 86400000);
      el.textContent = 'last backup · ' + (age <= 0 ? 'today' : age === 1 ? 'yesterday' : age + ' days ago');
    } catch (e) { }
  }

  /* ── ⌘K · M · W · C ─────────────────────────────────────────────────
     The page list and the per-account filter stay in home-motion.js (#q/#res);
     this only opens the native <dialog> and adds the one action the home owns:
     a glass of water, through the same single writer as the chip. */
  (function wirePalette() {
    var pal = byId('pal'), q = byId('q'), acts = byId('palActs'), hint = byId('palHint'); if (!pal || !q || !pal.showModal) return;
    function open() { q.value = ''; if (acts) acts.innerHTML = ''; var r = byId('res'); if (r) { r.innerHTML = ''; r.classList.remove('on'); } if (hint) hint.hidden = false; try { pal.showModal(); } catch (e) { return; } q.focus(); }
    ['srch', 'srch2'].forEach(function (id) { var b = byId(id); if (b) b.addEventListener('click', function (e) { e.preventDefault(); open(); }); });
    pal.addEventListener('click', function (e) { if (e.target === pal) pal.close(); });
    q.addEventListener('input', function () {
      var v = q.value.trim().toLowerCase(); if (hint) hint.hidden = !!v;
      if (acts) acts.innerHTML = /water|glass|drink|νερ/.test(v) && window.ALSWater ? '<button type="button" class="opt" id="palWater"><span class="ic">+</span>Log one glass of water<span class="h">' + esc(waterCount(waterState()) + ' of ' + waterTarget(waterState()) + ' today') + '</span></button>' : '';
      var pw = byId('palWater'); if (pw) pw.addEventListener('click', function () { pal.close(); var a = byId('wAdd'); if (a) a.click(); });
    });
    /* registered before home-motion.js's own Enter handler: when the water action
       is on screen, Enter logs the glass instead of opening the first page. */
    q.addEventListener('keydown', function (e) { if (e.key === 'Enter' && byId('palWater')) { e.preventDefault(); e.stopImmediatePropagation(); byId('palWater').click(); } });
    D.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && String(e.key).toLowerCase() === 'k') { e.preventDefault(); if (pal.open) pal.close(); else open(); return; }
      var t = e.target || {}; if (pal.open || e.metaKey || e.ctrlKey || e.altKey || /INPUT|TEXTAREA|SELECT/.test(t.tagName || '') || t.isContentEditable) return;
      var go = { m: 'morning.html', w: 'weekly.html', c: 'coach.html' }[String(e.key).toLowerCase()];
      if (go) location.href = go;
    });
  })();

  /* ── first paint ── */
  function paintAll() {
    paintVault();
    paintWater();
    paintDay();
    paintActs();
    paintColumns();
    paintRuler();
    paintWeek();
    paintInsights();
    paintForecasts();
    paintRows();
    paintSchool();
  }
  try { paintAll(); } catch (e) { }

  /* The entrance is added only now that the script has committed to revealing
     it, and a timer reveals everything anyway (constraint 39: content is born
     visible, motion is the optional extra). */
  (function reveal() {
    try {
      var root = D.documentElement; if (!root || !root.classList || reduce) return;
      var rv = D.querySelectorAll('.rv'); if (!rv || !rv.length) return;
      root.classList.add('anim');
      requestAnimationFrame(function () { requestAnimationFrame(function () { Array.prototype.forEach.call(rv, function (n) { n.classList.add('in'); }); }); });
      setTimeout(function () { Array.prototype.forEach.call(rv, function (n) { n.classList.add('in'); }); }, 1500);
    } catch (e) { }
  })();

  /* ── the greeting belongs to whoever is signed in ────────────────────────
     Two accounts use this app now. The name comes from ALSProfile, never from
     the markup — Chrissie must never be greeted as Alex. It repaints on the
     als:profile event because the profile hydrates from the cloud async. */
  function paintGreeting() {
    try { var items = dayItems(); paintHeadline(items, items.filter(function (i) { return i.done; }).length); } catch (e) { }
  }

  /* ── THE ARC BAND ─────────────────────────────────────────────────
     The chapters engine was read by exactly one file (arc.html), so the app
     could never mention that a chapter had turned — you'd only find out by
     opening the page and noticing. This puts the current chapter at the top of
     Home and flags it the first time a new one appears.

     `arc:seen` remembers the last chapter shown. It is deliberately NOT synced:
     "have I been told about this yet" is a fact about a device, not about him,
     and syncing it would mean the phone silently eats the announcement the
     laptop should have made. */
  function paintArcBand() {
    var band = document.getElementById('arcBand');
    if (!band || !window.ALSChapters) return;
    var res;
    try { res = window.ALSChapters.compute(); } catch (e) { return; }
    var rail0 = document.getElementById('arcRail');
    if (!res || !res.hasEnough || !res.chapters || !res.chapters.length) {
      band.classList.add('hidden');
      if (rail0) rail0.classList.add('hidden');
      return;
    }

    /* The last entry is always "Now." — an open placeholder rather than a
       chapter he lived through. Prefer the most recent REAL one; fall back to
       Now only when nothing else has been detected yet. */
    var chs = res.chapters;
    var cur = null;
    for (var i = chs.length - 1; i >= 0; i--) { if (chs[i].key !== 'now') { cur = chs[i]; break; } }
    if (!cur) cur = chs[chs.length - 1];

    /* THE ANNOUNCEMENT WINDOW. The turn is stamped with a DATE, and the band is
       shown only while that date is inside the window. After it, the arc rests
       in the rail. (A repaint must not swallow the announcement — the old bug
       wrote `arc:seen` on the same paint that read it.) */
    var ANNOUNCE_DAYS = 3;
    var sig = cur.key + '|' + (cur.start || '');
    var seen = null, seenAt = null;
    try { seen = localStorage.getItem('arc:seen'); seenAt = localStorage.getItem('arc:seen_at'); } catch (e) {}
    if (seen !== sig) {
      /* A first-ever visit has nothing to announce: he has not missed a turn,
         the device simply has no memory yet. Stamp it as already-seen. */
      seenAt = seen ? tk() : '';
      try { localStorage.setItem('arc:seen', sig); localStorage.setItem('arc:seen_at', seenAt); } catch (e) {}
    }
    var isNew = false;
    if (seenAt) {
      var s0 = new Date(seenAt + 'T00:00:00'); s0.setHours(0, 0, 0, 0);
      var n0 = new Date(); n0.setHours(0, 0, 0, 0);
      var age = Math.round((n0 - s0) / 86400000);
      isNew = age >= 0 && age < ANNOUNCE_DAYS;
    }

    /* A chapter object carries `start` but no `end` — the end only survives
       inside the eyebrow, as "Sep 9 – Oct 15". So a closed chapter must NOT be
       given a "day N" count. Only open-ended chapters get a running count. */
    var closed = / – /.test(String(cur.eyebrow || ''));
    var days = 0;
    if (cur.start && !closed) {
      var d0 = new Date(cur.start + 'T00:00:00'); d0.setHours(0, 0, 0, 0);
      var t0 = new Date(); t0.setHours(0, 0, 0, 0);
      days = Math.max(0, Math.round((t0 - d0) / 86400000));
    }
    var set = function (id, txt) { var e = document.getElementById(id); if (e) e.textContent = txt; };
    var title = String(cur.title || '').replace(/\.$/, '');
    set('arcBandN', (closed ? 'Last chapter · ' : 'Chapter ') + (cur.n || 1));
    set('arcBandTitle', title);
    set('arcBandMeta', (days ? ('day ' + days + ' · ') : '') + (cur.eyebrow || ''));
    /* One sentence. The Arc itself is where the whole thing is read. */
    var body = String(cur.body || '');
    var stop = body.indexOf('. ');
    set('arcBandBody', stop > 20 ? body.slice(0, stop + 1) : body);
    var nb = document.getElementById('arcBandNew');
    if (nb) nb.classList.toggle('hidden', !isNew);

    /* The rail carries the same three facts in one line. */
    set('arcRailN', closed ? ('Last · ' + (cur.n || 1)) : ('Chapter ' + (cur.n || 1)));
    set('arcRailTitle', title);
    set('arcRailMeta', days ? ('day ' + days) : (cur.eyebrow || ''));

    /* Exactly one of the two is ever on screen. */
    var rail = document.getElementById('arcRail');
    band.classList.toggle('hidden', !isNew);
    if (rail) rail.classList.toggle('hidden', isNew);
  }

  paintGreeting();
  paintArcBand();
  document.addEventListener('als:profile', paintGreeting);

  /* ── keep it live: repaint (no re-animate) on data changes ── */
  var repaint = function () { try { paintArcBand(); paintAll(); } catch (e) { } };
  window.addEventListener('storage', repaint);
  window.addEventListener('focus', repaint);
  var rzT = null; window.addEventListener('resize', function () { clearTimeout(rzT); rzT = setTimeout(function () { try { paintRuler(); paintColumns(); } catch (e) { } }, 120); });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) repaint(); });
  /* sync.js pulls from the network shortly after load — catch that too */
  setTimeout(repaint, 1500); setTimeout(repaint, 4000);
  setInterval(repaint, 30000);
})();
