/* ══════════════════════════════════════════════════════════════
   AURORA — home-live.js
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
  function relDay(key) { var d = new Date(key + 'T00:00:00'); var diff = Math.round((new Date() - d) / 86400000); return diff === 0 ? 'today' : diff === 1 ? 'yesterday' : diff + 'd ago'; }
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
          var done = ls('po_coach_workout_done', {}) || {}; var ds = Object.keys(done).filter(function (k) { return done[k]; }).sort(); var ld = ds[ds.length - 1];
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
          var nl = all.filter(function (l) { return l && (l.dateKey ? l.dateKey === t : new Date(l.ts) >= dawn()); });
          var kc = Math.round(nl.reduce(function (s, l) { return s + (l.kcal || 0); }, 0));
          var prot = Math.round(nl.reduce(function (s, l) { return s + (l.protein || l.p || 0); }, 0));
          var byDay = {}; all.forEach(function (l) { if (!l) return; var k = l.dateKey || (l.ts ? new Date(l.ts).toISOString().slice(0, 10) : null); if (k) byDay[k] = (byDay[k] || 0) + (l.kcal || 0); });
          var days = Object.keys(byDay).sort().slice(-10).map(function (k) { return Math.round(byDay[k]); });
          return kc > 0 ? { hero: kc, unit: 'kcal', comma: kc >= 1000, note: prot ? ('protein ' + prot + 'g today') : 'today', spark: days.length >= 3 ? days : null } : { hero: '—', note: 'log food' };
        }
        case 'health.html': {
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
          var pw = ls('po_water_v1', {}); var done = ((pw.logs || {})[t]) || 0;
          var wKg = (pw.profile && pw.profile.weightKg) || 75; var total = Math.max(1, Math.ceil(wKg * 35 / (pw.bottleMl || 500)));
          return { hero: done, unit: '/ ' + total, note: 'hydration' };
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
        case 'improve.html': { var v = ls('improve:videos', []); v = Array.isArray(v) ? v : []; var w = v.filter(function (x) { return x && !x.watched; }).length; return v.length ? { hero: w, note: 'to learn · queue' } : { hero: '—', note: 'learning queue' }; }
        case 'finance.html': { var nw = 0; ['bank', 'stocks', 'crypto', 'other'].forEach(function (c) { (ls('nw:' + c, []) || []).forEach(function (it2) { nw += Number(it2.amount) || 0; }); }); var cur = ls('nw_currency', 'CHF'); return nw > 0 ? { hero: Math.round(nw), unit: cur, comma: nw >= 1000, note: 'net worth' } : { hero: '—', note: 'net worth' }; }
        case 'bills.html': { var b = ls('bills:items', []); b = (Array.isArray(b) ? b : []).filter(function (x) { return x && x.id; }); return b.length ? { hero: b.length, note: 'tracked' } : { hero: '—', note: 'add bills' }; }
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
        case 'trends.html': { var W2 = ls('po_coach_weights', []); return (Array.isArray(W2) && W2.length) ? { hero: W2.length, note: 'weigh-ins · charts' } : { hero: '—', note: 'charts over time' }; }
        case 'insights.html': { var n = 0; try { if (window.ALSInsights) n = (window.ALSInsights.compute() || []).length; } catch (e) { } return n ? { hero: n, note: 'patterns found' } : { hero: '—', note: 'connecting' }; }
        case 'arxaia.html': { var st = ls('arxaia:v1', {}); var days2 = st.days || {}; var dd = 0; for (var n1 = 1; n1 <= 31; n1++) { if (days2[n1] && days2[n1].done) dd++; } var day = Math.min(dd + 1, 31); return dd ? { hero: day, unit: '/ 31', note: 'Άγνωστο · SOS' } : { hero: 1, unit: '/ 31', note: 'Άγνωστο · start' }; }
        case 'istoria.html': { var st2 = ls('istoria:v1', {}); var seen = st2.seen || {}, miss = st2.miss || {}, terms = 0; for (var k in seen) { if (/^t/.test(k) && seen[k].c >= 2 && !(miss[k] > 0)) terms++; } return terms ? { hero: terms, unit: 'όροι', note: 'Προσφυγικό' } : { hero: '—', note: 'Προσφυγικό' }; }
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
        var nm = (tile.querySelector('.name') || {}).textContent || '—';
        val.className = 'val txt'; val.textContent = nm;
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

  /* ── intelligence feed — real signals ── */
  function paintFeed() {
    try {
      var real = document.getElementById('feedReal'); if (!real) return;
      var items = [];
      var ins = (window.ALSInsights && window.ALSInsights.compute()) || [];
      var fc = (window.ALSForecast && window.ALSForecast.compute()) || [];
      ins.slice(0, 2).forEach(function (i) { items.push({ c: 'var(--emerald)', p: 'M3 12h4l2-5 4 10 2-5h6', t: i.text }); });
      if (fc[0]) items.push({ c: 'var(--violet)', p: 'M4 4v16h16M7 14l3-4 3 2 5-7', t: fc[0].text });
      /* bills due */
      try {
        var bills = (ls('bills:items', []) || []).filter(function (b) { return b && b.id; });
        if (bills.length) items.push({ c: 'var(--amber)', p: 'M12 3v18M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6', t: 'You track ' + bills.length + ' recurring bill' + (bills.length === 1 ? '' : 's') + '. Check what’s due this week.' });
      } catch (e) { }
      if (!items.length) {
        items.push({ c: 'var(--emerald)', p: 'M20 6 9 17l-5-5', t: 'Nothing flagged today. Keep logging and Nova will surface what matters.' });
      }
      real.innerHTML = items.slice(0, 3).map(function (it) {
        return '<div class="feed-item"><span class="fi" style="color:' + it.c + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="' + it.p + '"/></svg></span><div class="ft">' + esc(it.t) + '</div></div>';
      }).join('');
    } catch (e) { }
  }

  /* ── Agent / XP card — real gamification ── */
  function paintAgent() {
    try {
      if (!(window.ALS && window.ALS.XP)) return;
      var st = window.ALS.XP.compute(); if (!st) return;
      var lv = st.level, data = st.data, tw = st.thisWeek, lw = st.lastWeek;
      var setTxt = function (sel, v) { var e = document.querySelector(sel); if (e) e.textContent = v; };
      setTxt('.agent .badge', 'LVL ' + lv.level);
      setTxt('.agent .streak', (data.streak || 0) + ' day streak');
      setTxt('.agent-title', 'The ' + lv.title);
      var xpLbl = document.querySelectorAll('.agent .xpbar-lbl span');
      if (xpLbl[0]) xpLbl[0].textContent = fmtN(lv.xp) + ' XP';
      if (xpLbl[1]) xpLbl[1].textContent = lv.isMax ? 'Max level reached' : (fmtN(lv.xpToNext) + ' to ' + lv.nextTitle);
      var fill = document.querySelector('.agent .xpbar-fill'); if (fill) fill.style.width = Math.round((lv.progress || 0) * 100) + '%';
      /* week vs last */
      var wnum = document.querySelector('.agent .week-score .num .cnt') || document.querySelector('.agent .week-score .num');
      if (wnum && tw) { wnum.setAttribute('data-to', Math.round(tw.score)); wnum.textContent = '0'; }
      var delta = document.querySelector('.agent .week-score .delta');
      if (delta && tw && lw) { var d = Math.round(tw.score - lw.score); delta.textContent = (d >= 0 ? '+' + d : d) + ' vs last week'; delta.style.color = d >= 0 ? 'var(--emerald)' : 'var(--coral)'; }
      /* rows */
      var rows = document.querySelectorAll('.agent .wrow');
      if (rows[0] && tw) { var wo = tw.workouts || 0; rows[0].querySelector('.wf').style.width = Math.min(100, wo / 5 * 100) + '%'; rows[0].querySelector('span:last-child').textContent = wo + '/5'; }
      if (rows[1]) { var rec = latestRecovery(); rows[1].querySelector('.wf').style.width = (rec != null ? rec : 0) + '%'; rows[1].querySelector('span:last-child').textContent = rec != null ? rec : '—'; }
      if (rows[2] && tw) { var nd = tw.nutDays || 0; rows[2].querySelector('.wf').style.width = Math.min(100, nd / 7 * 100) + '%'; rows[2].querySelector('span:last-child').textContent = nd + (nd === 1 ? ' day' : ' days'); }
      /* milestones (honest thresholds) */
      var ms = document.querySelectorAll('.agent .ms');
      var thr = [data.streak >= 100, prCount() >= 50, sleepNights() >= 30, daysTracked() >= 365];
      ms.forEach(function (el, i) { if (i < thr.length) el.classList.toggle('hit', !!thr[i]); });
    } catch (e) { }
  }
  function latestRecovery() { try { var l = ls('sleep:logs', []); l = (Array.isArray(l) ? l : []).filter(function (e) { return e && e.recovery != null; }).sort(function (a, b) { return a.dateKey < b.dateKey ? -1 : 1; }); return l.length ? Math.round(l[l.length - 1].recovery) : null; } catch (e) { return null; } }
  function prCount() { try { var seen = {}, ws = ls('po_workouts', []); (Array.isArray(ws) ? ws : []).forEach(function (w) { (w && w.entries || []).forEach(function (en) { if (en && en.name) seen[en.name] = 1; }); }); return Object.keys(seen).length; } catch (e) { return 0; } }
  function sleepNights() { try { var l = ls('sleep:logs', []); return (Array.isArray(l) ? l : []).filter(function (e) { return e && (e.hours > 0 || e.recovery != null); }).length; } catch (e) { return 0; } }
  function daysTracked() { try { var m = metric('arc.html'); return (m && typeof m.hero === 'number') ? m.hero : 0; } catch (e) { return 0; } }

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  /* ── water quick-log chip (the old topbar pill, reborn premium) ── */
  function waterState() { var s = ls('po_water_v1', {}); return (s && typeof s === 'object') ? s : {}; }
  function waterCount(s) { var raw = (s.logs && typeof s.logs === 'object') ? s.logs[tk()] : 0; return (typeof raw === 'number') ? raw : (raw && typeof raw.n === 'number' ? raw.n : 0); }
  function waterTarget(s) {
    var unit = s.unit || 'glass';
    var unitMl = unit === 'glass' ? (s.glassMl || 250) : unit === 'oz' ? 30 : (s.bottleMl || 500);
    var wKg = (s.profile && s.profile.weightKg) || 75;
    var actHrs = (s.profile && s.profile.activityHrsPerWeek) || 0;
    return Math.max(1, Math.ceil((wKg * 35 + actHrs * 500) / unitMl)); /* same formula as po-water/body */
  }
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

  /* ── first paint (before motion animates) ── */
  function paintAll(animate) {
    paintAllTiles(animate);
    paintReadiness(animate);
    paintInsights();
    paintForecasts();
    paintFeed();
    paintAgent();
    paintWater();
  }
  paintAll(true);

  /* expose the ring offset for home-motion to use */
  window.__alsReady = function () { var f = document.querySelector('.focus'); return f && f.dataset.roff ? +f.dataset.roff : 92.5; };

  /* ── keep it live: repaint (no re-animate) on data changes ── */
  var repaint = function () { paintAllTiles(false); paintReadiness(false); paintInsights(); paintForecasts(); paintAgent(); paintWater(); };
  window.addEventListener('storage', repaint);
  window.addEventListener('focus', repaint);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) repaint(); });
  /* sync.js pulls from the network shortly after load — catch that too */
  setTimeout(repaint, 1500); setTimeout(repaint, 4000);
  setInterval(repaint, 30000);
})();
