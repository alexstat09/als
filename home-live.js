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
        case 'latinika.html': {
          var latSt = ls('lat:v1', {}); var latCells = latSt.cells || []; var latR = 0, latW = 0;
          for (var li = 0; li < latCells.length; li++) { latR += (+latCells[li].r || 0); latW += (+latCells[li].w || 0); }
          var latT = latR + latW;
          /* '—' when nothing has been answered: a placeholder is never formatted
             into a number here (the als-v433 rule). */
          return latT ? { hero: Math.round(latR / latT * 100), unit: '%', note: '\u03c3\u03c9\u03c3\u03c4\u03ac \u00b7 \u03ba\u03bb\u03af\u03c3\u03b7' }
                      : { hero: '\u2014', note: '\u03be\u03b5\u03ba\u03af\u03bd\u03b1' };
        }
        case 'istoria.html': {
          /* όλα τα locals με πρόθεμα ist* — η σταθερή αρχή 14 κερδήθηκε
             σε ΑΥΤΗ ακριβώς τη συνάρτηση: ένα var μέσα σε case σκιάζει όλη τη συνάρτηση. */
          var istSt = ls('ist:v1', {}); var istU = istSt.units || {}; var istNow = Date.now();
          var istL = 0, istD = 0, istKey;
          for (istKey in istU) {
            if (!Object.prototype.hasOwnProperty.call(istU, istKey)) continue;
            if (!istU[istKey].learnedAt) continue;
            istL++;
            if (istU[istKey].due && istNow >= istU[istKey].due) istD++;
          }
          /* '\u2014' όταν δεν έχει μάθει τίποτα — ποτέ placeholder σαν αριθμός (als-v433). */
          return istL ? { hero: istL, note: istD ? istD + ' \u03c0\u03c1\u03bf\u03c2 \u03b5\u03c0\u03b1\u03bd\u03ac\u03bb\u03b7\u03c8\u03b7' : '\u03c5\u03c0\u03bf\u03b5\u03bd\u03cc\u03c4\u03b7\u03c4\u03b5\u03c2' }
                      : { hero: '\u2014', note: '\u03be\u03b5\u03ba\u03af\u03bd\u03b1' };
        }
        case 'tonos.html': {
          var tonSt = ls('ton:v1', {}); var tonCells = tonSt.cells || {}; var tonR = 0, tonW = 0;
          for (var tonK in tonCells) { if (!Object.prototype.hasOwnProperty.call(tonCells, tonK)) continue; tonR += (+tonCells[tonK].r || 0); tonW += (+tonCells[tonK].w || 0); }
          var tonT = tonR + tonW;
          /* '\u2014' when nothing has been answered \u2014 a placeholder is never
             formatted into a number here (the als-v433 rule). */
          return tonT ? { hero: Math.round(tonR / tonT * 100), unit: '%', note: '\u03c3\u03c9\u03c3\u03c4\u03ac \u00b7 \u03c4\u03cc\u03bd\u03bf\u03b9' }
                      : { hero: '\u2014', note: '\u03be\u03b5\u03ba\u03af\u03bd\u03b1' };
        }
        /* 'arxaia.html' had a case here. Retired als-v453 — the tile is gone and
           the page is a redirect stub, so a metric for it would never be painted. */
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

  /* ── paint one tile from real data ── */
  function paintTile(tile, animate) {
    var m = metric(href(tile)); if (!m) return;
    var val = tile.querySelector('.val'); var sub = tile.querySelector('.sub');
    if (val) {
      if (m.hero === '—') {
        /* The empty state used to echo the tile's own .name into the value slot,
           so a page with nothing logged read "Nutrition / Nutrition / log food".
           Nobody saw it while metric() was throwing (every tile kept its demo
           number instead), and it looks broken. A dash says "no number yet"
           without pretending to be one; the .sub already carries the invitation. */
        val.className = 'val txt'; val.textContent = '—';
      } else if (m.txt) {
        val.className = 'val txt'; val.textContent = m.hero;
      } else {
        val.className = 'val';
        var dec = m.dec || 0, comma = m.comma ? 1 : 0;
        var shown = animate ? '0' : (comma ? fmtN(Math.round(m.hero)) : (dec ? (+m.hero).toFixed(dec) : m.hero));
        val.innerHTML = '<span class="cnt" data-to="' + m.hero + '"' + (dec ? ' data-dec="' + dec + '"' : '') + (comma ? ' data-comma="1"' : '') + '>' + shown + '</span>' + (m.unit ? '<em>' + m.unit + '</em>' : '');
      }
    }
    if (sub && m.note) sub.textContent = m.note;
    /* spark */
    var spark = tile.querySelector('.spark');
    if (spark) {
      if (m.spark && m.spark.length >= 3) {
        var sp = sparkPts(m.spark);
        spark.innerHTML = '<svg viewBox="0 0 120 24" preserveAspectRatio="none" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><polyline points="' + sp.pts + '"/><circle class="pt" cx="' + sp.lx + '" cy="' + sp.ly + '" r="2" fill="currentColor" stroke="none"/></svg>';
        spark.style.display = '';
      } else {
        spark.style.display = 'none';
      }
    }
  }

  function paintAllTiles(animate) {
    document.querySelectorAll('.tile').forEach(function (t) { try { paintTile(t, animate); } catch (e) { } });
  }

  /* ── readiness ring (real recovery) ── */
  function paintReadiness(animate) {
    try {
      var rec = null;
      var logs = ls('sleep:logs', []);
      if (Array.isArray(logs)) {
        var today = logs.find(function (e) { return e && e.dateKey === tk(); });
        if (today && today.recovery != null) rec = today.recovery;
        else { var wr = logs.filter(function (e) { return e && e.recovery != null; }).sort(function (a, b) { return a.dateKey < b.dateKey ? -1 : 1; }); if (wr.length) rec = wr[wr.length - 1].recovery; }
      }
      var focus = document.querySelector('.focus'); if (!focus) return;
      var rn = focus.querySelector('.rn .cnt') || focus.querySelector('.rn');
      var line = focus.querySelector('.line'); var meta = focus.querySelector('.meta');
      if (rec == null) {
        if (rn) { rn.removeAttribute('data-to'); rn.dataset.done = '1'; rn.textContent = '—'; }
        var rf0 = focus.querySelector('.rf'); if (rf0) rf0.style.strokeDashoffset = '289';
        if (line) line.textContent = 'Log a night of sleep to unlock readiness.';
        if (meta) meta.textContent = 'Your recovery score appears here once the sleep page has data.';
        return;
      }
      rec = Math.max(0, Math.min(100, Math.round(rec)));
      var C = 289; var off = C * (1 - rec / 100);
      focus.dataset.roff = off;
      if (rn) {
        rn.setAttribute('data-to', rec);
        /* only reset to 0 on the first paint (so count-up runs once); on later
           repaints write the final number so we never blank a settled ring */
        if (animate) { rn.textContent = '0'; }
        else { rn.textContent = rec; var rf1 = focus.querySelector('.rf'); if (rf1) rf1.style.strokeDashoffset = off; }
      }
      var lineTxt = rec >= 67 ? 'Recovery is high. A good day to spend energy.' : rec >= 45 ? 'Recovery is moderate. Train smart and keep it steady.' : 'Recovery is low. Protect sleep and go easy today.';
      var wk = workoutsThisWeek();
      var metaTxt = 'Recovery sits at ' + rec + '. ' + (wk ? ('You have ' + wk + ' session' + (wk === 1 ? '' : 's') + ' logged this week. ') : '') + (rec >= 67 ? 'A good day to spend energy.' : rec >= 45 ? 'Match effort to how you feel.' : 'Prioritise rest and recovery.');
      if (line) line.textContent = lineTxt;
      if (meta) meta.textContent = metaTxt;
    } catch (e) { }
  }

  /* ── "What Nova noticed" — real insights ── */
  function paintInsights() {
    try {
      if (!window.ALSInsights) return;
      var ins = window.ALSInsights.compute() || [];
      var host = document.querySelector('#novaNoticed .intel-cards'); if (!host) return;
      if (!ins.length) {
        render(host, '<div class="icard" data-rise><div class="top"><span>Learning</span><span class="conf">building</span></div><div class="body">Nova is still learning your patterns. Keep logging and correlations will appear here.</div></div>');
        return;
      }
      render(host, ins.slice(0, 2).map(function (i) {
        var conf = i.strength != null ? Math.round(i.strength * 100) + '% conf' : 'signal';
        var label = cap(i.domain || 'pattern');
        return '<div class="icard" data-rise><div class="top"><span>' + label + '</span><span class="conf">' + conf + '</span></div><div class="body">' + esc(i.text) + '</div></div>';
      }).join(''));
    } catch (e) { }
  }

  /* ── "Where you're headed" — real forecasts ── */
  function paintForecasts() {
    try {
      if (!window.ALSForecast) return;
      var fc = window.ALSForecast.compute() || [];
      var host = document.querySelector('#headed .intel-cards'); if (!host) return;
      if (!fc.length) {
        render(host, '<div class="icard f" data-rise><div class="top"><span>Trajectory</span><span class="conf">building</span></div><div class="body">A few more days of data and Nova will project where your trends are heading.</div></div>');
        return;
      }
      var labels = { weight: 'Bodyweight', lift: 'Strength', recovery: 'Recovery' };
      render(host, fc.slice(0, 2).map(function (f) {
        var label = labels[f.kind] || 'Projection';
        return '<div class="icard f" data-rise><div class="top"><span>' + label + '</span><span class="conf">projection</span></div><div class="body">' + esc(f.text) + '</div></div>';
      }).join(''));
    } catch (e) { }
  }

  /* The "Intelligence feed" lived here. It rendered ALSInsights.slice(0,2) +
     ALSForecast[0] — a strict SUBSET of "What Nova noticed" and "Where you're
     headed", the two sections about 100px above it on the same page. Same
     engines, same page, third rendering; ALSInsights.compute() ran four times
     per load. Its only unique line was a count of recurring bills, which said
     the same sentence every day. Deleted, not moved: nothing was lost. */

  /* ── Standing — "this week vs last" ──
     paintAgent() lived here and is gone with the section it painted (als-v438),
     the last of the game layer. Its headline came from ALS.XP.compute(), and
     45% of that score is `goals:` to-do completion — a store he has never used,
     so the number could not exceed 55 in any week however good. An instrument
     that cannot read past halfway is not an instrument.
     latestRecovery() left with it: paintAgent() was its only caller.
     prCount() / sleepNights() / daysTracked() had already gone the same way in
     als-v435, with the milestone badges that were their only callers. */

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  /* ── water quick-log chip (the old topbar pill, reborn premium) ── */
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

  /* ── the vault line ──
     It used to read "last backup · 2 days ago" as static markup — never painted,
     never true. backup.html stamps `backup:lastFile` (an ISO string) whenever a
     file is actually exported, so that is the only honest source. No stamp means
     no backup has been taken ON THIS DEVICE, which is worth saying plainly. */
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

  /* ── first paint (before motion animates) ── */
  function paintAll(animate) {
    paintVault();
    paintAllTiles(animate);
    paintReadiness(animate);
    paintInsights();
    paintForecasts();
    paintWater();
  }
  paintAll(true);

  /* expose the ring offset for home-motion to use */
  window.__alsReady = function () { var f = document.querySelector('.focus'); return f && f.dataset.roff ? +f.dataset.roff : 92.5; };

  /* ── the greeting belongs to whoever is signed in ────────────────────────
     Two accounts use this app now. The name comes from ALSProfile, never from
     the markup — Chrissie must never be greeted as Alex. It repaints on the
     als:profile event because the profile hydrates from the cloud async. */
  function paintGreeting() {
    var h1 = document.getElementById('homeGreeting'), span = document.getElementById('homeGreetingName');
    if (!h1 || !span) return;
    var hr = new Date().getHours();
    var part = hr < 5 ? 'Good night' : hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening';
    var name = '';
    try { name = (window.ALSProfile && ALSProfile.firstName()) || ''; } catch (e) {}
    h1.childNodes[0].nodeValue = name ? part + ', ' : part;
    span.textContent = name ? name + '.' : '';
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

    /* THE ANNOUNCEMENT WINDOW.
       `isNew` used to be computed from `arc:seen` and then `arc:seen` was
       written immediately — so the flag was true for exactly one paint. Any
       repaint (a storage event, a sync landing) recomputed it as false and the
       announcement vanished mid-look. Worse, the band itself stayed at full
       height forever regardless, which is the actual cost: ~200px and a second
       italic serif headline sitting above the greeting every day of the year to
       carry a message that is true about six days of it.
       So the turn is now stamped with a DATE, and the band is shown only while
       that date is inside the window. After it, the arc rests in the rail. */
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
       given a "day N" count: saying "day 316" about something that finished in
       October reads as though he is still living it. Only open-ended chapters
       get a running count. */
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

    /* The rail carries the same three facts in one line. An open chapter counts
       days; a closed one has no running count, so it shows its date range
       instead of nothing. */
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
  var repaint = function () { paintGreeting(); paintArcBand(); paintAllTiles(false); paintReadiness(false); paintInsights(); paintForecasts(); paintWater(); paintVault(); };
  window.addEventListener('storage', repaint);
  window.addEventListener('focus', repaint);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) repaint(); });
  /* sync.js pulls from the network shortly after load — catch that too */
  setTimeout(repaint, 1500); setTimeout(repaint, 4000);
  setInterval(repaint, 30000);
})();
