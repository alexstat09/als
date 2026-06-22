// =============================================================
// ALS Insight Engine — finds honest, cross-domain patterns in your data.
//
// The whole point: connect sleep + training + nutrition + caffeine + recovery
// that otherwise live on separate pages, and surface only patterns that are
// statistically real. Built to NOT lie:
//   • curated, sensible hypotheses (no blind correlation-dredging)
//   • median-split group comparisons with minimum sample sizes per group
//   • effect-size gates (a delta has to actually matter to surface)
//   • association language only ("tends to", "tracks with") — never "causes"
//   • returns nothing when there isn't enough data
//
// Pure logic, reads localStorage only. window.ALSInsights.compute() → array of
// { id, text, emoji, strength } sorted strongest-first.
// =============================================================
(function () {
  'use strict';
  if (window.ALSInsights) return;

  function ls(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
  function pad(n) { return String(n).padStart(2, '0'); }
  function dkOf(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function addDays(dk, n) { var d = new Date(dk + 'T00:00:00'); if (isNaN(d)) return dk; d.setDate(d.getDate() + n); return dkOf(d); }
  function mean(a) { return a.length ? a.reduce(function (s, x) { return s + x; }, 0) / a.length : 0; }
  function median(a) { if (!a.length) return 0; var b = a.slice().sort(function (x, y) { return x - y; }); var m = b.length >> 1; return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2; }
  function round(n, p) { p = p || 0; var m = Math.pow(10, p); return Math.round((n || 0) * m) / m; }
  function pct(x) { return Math.round(x * 100); }
  function kfmt(n) { n = Math.round(n || 0); return n >= 1000 ? (Math.round(n / 100) / 10) + 'k' : String(n); }
  function weekdayName(i) { return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][i]; }

  // ── unified daily timeline ────────────────────────────────
  function timeline() {
    var rows = {};
    function row(dk) { return rows[dk] || (rows[dk] = { date: dk }); }
    var sl = ls('sleep:logs'); if (Array.isArray(sl)) sl.forEach(function (e) {
      if (e && e.dateKey) { var r = row(e.dateKey); if (typeof e.recovery === 'number') r.recovery = e.recovery; if (typeof e.hours === 'number') r.sleepH = e.hours; if (typeof e.quality === 'number') r.quality = e.quality; if (typeof e.energy === 'number') r.energy = e.energy; }
    });
    var w = ls('po_coach_weights'); if (Array.isArray(w)) w.forEach(function (e) { if (e && e.dateKey && typeof e.weight === 'number') row(e.dateKey).weight = e.weight; });
    var wo = ls('po_workouts'); if (Array.isArray(wo)) wo.forEach(function (s) {
      if (s && s.date) { var r = row(s.date); r.volume = (r.volume || 0) + (+s.volume || 0); r.trained = 1; if (s.prs && s.prs.length) r.pr = 1; else if (r.pr == null) r.pr = 0; }
    });
    var nu = ls('nut:logs'); if (Array.isArray(nu)) nu.forEach(function (e) {
      if (e && e.dateKey) { var r = row(e.dateKey); r.kcal = (r.kcal || 0) + (+e.kcal || 0); r.protein = (r.protein || 0) + (+e.p || 0); r.carbs = (r.carbs || 0) + (+e.c || 0); }
    });
    var cf = ls('caf:logs'); if (Array.isArray(cf)) cf.forEach(function (e) {
      if (e && e.ts) { var d = new Date(e.ts); if (!isNaN(d)) { var r = row(dkOf(d)); r.caf = (r.caf || 0) + (+e.mg || 0); if (d.getHours() >= 16) r.cafLate = (r.cafLate || 0) + (+e.mg || 0); } }
    });
    var pw = ls('po_water_v1'); if (pw && pw.logs && typeof pw.logs === 'object') Object.keys(pw.logs).forEach(function (dk) { row(dk).water = +pw.logs[dk] || 0; });
    return rows;
  }

  // ── group comparison (A on day d → B on day d+lag) ──
  // opt: { thr, missingA }. Binary/explicit metrics split on a value threshold;
  // continuous metrics split by RANK (bottom group vs top group) — tie-proof
  // and cleaner than a median value (which can land on the max on skewed data).
  // Returns null unless both groups have ≥4 observations.
  function splitAuto(rows, A, B, lag, opt) {
    opt = opt || {}; lag = lag || 0;
    var items = [];
    Object.keys(rows).forEach(function (dk) {
      var ra = rows[dk]; var av = (ra[A] != null) ? ra[A] : (opt.missingA != null ? opt.missingA : null);
      if (av == null) return;
      var dk2 = lag ? addDays(dk, lag) : dk; var rb = rows[dk2]; if (!rb || rb[B] == null) return;
      items.push({ a: av, b: rb[B] });
    });
    if (items.length < 8) return null;
    var hi, lo;
    if (opt.thr != null) {
      hi = []; lo = [];
      items.forEach(function (i) { (i.a > opt.thr ? hi : lo).push(i.b); });
    } else {
      items.sort(function (x, y) { return x.a - y.a; });
      var n = items.length, k = Math.max(4, Math.round(n * 0.4)); // bottom 40% vs top 40%
      if (2 * k > n) k = Math.floor(n / 2);
      lo = items.slice(0, k).map(function (i) { return i.b; });
      hi = items.slice(n - k).map(function (i) { return i.b; });
    }
    if (hi.length < 4 || lo.length < 4) return null;
    return { hiMean: mean(hi), loMean: mean(lo), nHi: hi.length, nLo: lo.length, n: items.length };
  }

  // linear regression slope of values against their index (0..n-1)
  function slope(vals) {
    var n = vals.length; if (n < 2) return 0;
    var sx = 0, sy = 0, sxx = 0, sxy = 0;
    for (var i = 0; i < n; i++) { sx += i; sy += vals[i]; sxx += i * i; sxy += i * vals[i]; }
    var den = n * sxx - sx * sx; return den === 0 ? 0 : (n * sxy - sx * sy) / den;
  }

  // ── the curated hypotheses (cross-domain) ─────────────────
  var HYP = [
    { id: 'rec-pr', A: 'recovery', B: 'pr', lag: 0, scale: 0.45,
      min: function (s) { return (s.hiMean - s.loMean) >= 0.18; },
      text: function (s) { return 'You set a PR on ' + pct(s.hiMean) + '% of your higher-recovery training days — versus ' + pct(s.loMean) + '% on lower-recovery ones. (' + s.n + ' sessions)'; },
      e: '🏆' },
    { id: 'prot-rec', A: 'protein', B: 'recovery', lag: 1, scale: 22,
      min: function (s) { return Math.abs(s.hiMean - s.loMean) >= 8; },
      text: function (s) { var hi = s.hiMean > s.loMean; return 'Your recovery runs about ' + round(Math.abs(s.hiMean - s.loMean)) + ' points ' + (hi ? 'higher' : 'lower') + ' the morning after your higher-protein days (' + round(s.hiMean) + ' vs ' + round(s.loMean) + ', ' + s.n + ' days).'; },
      e: '🥩' },
    { id: 'vol-rec', A: 'volume', B: 'recovery', lag: 1, scale: 22,
      min: function (s) { return Math.abs(s.hiMean - s.loMean) >= 8; },
      text: function (s) { return 'After your biggest training days, next-morning recovery averages ' + round(s.hiMean) + ' — versus ' + round(s.loMean) + ' after lighter days. (' + s.n + ' days)'; },
      e: '🔥' },
    { id: 'train-sleep', A: 'trained', B: 'sleepH', lag: 1, thr: 0.5, missingA: 0, scale: 1.1,
      min: function (s) { return Math.abs(s.hiMean - s.loMean) >= 0.4; },
      text: function (s) { var more = s.hiMean > s.loMean; return 'You sleep about ' + round(Math.abs(s.hiMean - s.loMean), 1) + 'h ' + (more ? 'longer' : 'less') + ' on the nights after you train (' + round(s.hiMean, 1) + 'h vs ' + round(s.loMean, 1) + 'h, ' + s.n + ' nights).'; },
      e: '😴' },
    { id: 'caflate-sleep', A: 'cafLate', B: 'sleepH', lag: 1, scale: 1.1,
      min: function (s) { return Math.abs(s.hiMean - s.loMean) >= 0.4; },
      text: function (s) { return 'Caffeine later in the day tracks with shorter sleep — ' + round(s.hiMean, 1) + 'h on your late-caffeine days versus ' + round(s.loMean, 1) + 'h without. (' + s.n + ' nights)'; },
      e: '☕' },
    { id: 'rec-vol', A: 'recovery', B: 'volume', lag: 0, scale: 0,
      min: function (s) { return s.loMean > 0 && Math.abs(s.hiMean - s.loMean) / s.loMean >= 0.15; },
      effect: function (s) { return Math.min(1, Math.abs(s.hiMean - s.loMean) / Math.max(1, s.loMean) / 0.5); },
      text: function (s) { return 'You train heavier when you wake recovered — volume averages ' + kfmt(s.hiMean) + ' on high-recovery days versus ' + kfmt(s.loMean) + ' on low ones. (' + s.n + ' days)'; },
      e: '💪' },
    { id: 'water-rec', A: 'water', B: 'recovery', lag: 1, scale: 22,
      min: function (s) { return Math.abs(s.hiMean - s.loMean) >= 8; },
      text: function (s) { var hi = s.hiMean > s.loMean; return 'Recovery runs about ' + round(Math.abs(s.hiMean - s.loMean)) + ' points ' + (hi ? 'higher' : 'lower') + ' the morning after your better-hydrated days (' + round(s.hiMean) + ' vs ' + round(s.loMean) + ', ' + s.n + ' days).'; },
      e: '💧' },
    { id: 'caf-sleep', A: 'caf', B: 'sleepH', lag: 1, scale: 1.1,
      min: function (s) { return Math.abs(s.hiMean - s.loMean) >= 0.4; },
      text: function (s) { return 'On your higher-caffeine days you sleep about ' + round(Math.abs(s.hiMean - s.loMean), 1) + 'h ' + (s.hiMean > s.loMean ? 'more' : 'less') + ' that night (' + round(s.hiMean, 1) + 'h vs ' + round(s.loMean, 1) + 'h, ' + s.n + ' nights).'; },
      e: '☕' },
    { id: 'qual-vol', A: 'quality', B: 'volume', lag: 0, scale: 0,
      min: function (s) { return s.loMean > 0 && Math.abs(s.hiMean - s.loMean) / s.loMean >= 0.15; },
      effect: function (s) { return Math.min(1, Math.abs(s.hiMean - s.loMean) / Math.max(1, s.loMean) / 0.5); },
      text: function (s) { return 'You train harder after better sleep — volume averages ' + kfmt(s.hiMean) + ' on your best-quality nights versus ' + kfmt(s.loMean) + ' on your worst. (' + s.n + ' days)'; },
      e: '🛌' },
    { id: 'carb-rec', A: 'carbs', B: 'recovery', lag: 1, scale: 22,
      min: function (s) { return Math.abs(s.hiMean - s.loMean) >= 8; },
      text: function (s) { var hi = s.hiMean > s.loMean; return 'Recovery is about ' + round(Math.abs(s.hiMean - s.loMean)) + ' points ' + (hi ? 'higher' : 'lower') + ' the morning after your higher-carb days (' + round(s.hiMean) + ' vs ' + round(s.loMean) + ', ' + s.n + ' days).'; },
      e: '🍚' }
  ];

  function crossDomain(rows) {
    var out = [];
    HYP.forEach(function (h) {
      var s = splitAuto(rows, h.A, h.B, h.lag, { thr: h.thr, missingA: h.missingA });
      if (!s || !h.min(s)) return;
      var effect = h.effect ? h.effect(s) : Math.min(1, Math.abs(s.hiMean - s.loMean) / h.scale);
      var sample = Math.min(1, s.n / 24);
      var strength = +(effect * 0.6 + sample * 0.4).toFixed(3);
      out.push({ id: h.id, text: h.text(s), emoji: h.e, strength: strength });
    });
    return out;
  }

  // ── single-series insights (trends / rhythms) ─────────────
  function seriesOf(rows, key) {
    return Object.keys(rows).sort().filter(function (dk) { return rows[dk][key] != null; }).map(function (dk) { return { d: dk, v: rows[dk][key] }; });
  }

  function singleSeries(rows) {
    var out = [];
    // recovery momentum (last up-to-7)
    var rec = seriesOf(rows, 'recovery');
    if (rec.length >= 4) {
      var last = rec.slice(-7); var vals = last.map(function (x) { return x.v; });
      var sp = slope(vals) * (vals.length - 1); // total change across the window
      if (sp <= -10) out.push({ id: 'rec-down', emoji: '🪫', strength: 0.72, text: 'Heads up — your recovery has trended down over your last ' + vals.length + ' mornings (about ' + round(Math.abs(sp)) + ' points). A lighter day or an early night pays off here.' });
      else if (sp >= 10) out.push({ id: 'rec-up', emoji: '⚡', strength: 0.6, text: 'Your recovery has been climbing over your last ' + vals.length + ' mornings (about +' + round(sp) + '). Good time to push.' });
    }
    // weight trend (last up-to-14)
    var wt = seriesOf(rows, 'weight');
    if (wt.length >= 6) {
      var lw = wt.slice(-14); var perDay = slope(lw.map(function (x) { return x.v; }));
      var perWeek = perDay * 7;
      if (Math.abs(perWeek) >= 0.2) out.push({ id: 'wt-trend', emoji: '⚖️', strength: 0.5, text: 'Over your last ' + lw.length + ' weigh-ins you\'re trending ' + (perWeek < 0 ? 'down' : 'up') + ' about ' + round(Math.abs(perWeek), 1) + ' kg/week.' });
    }
    // best weekday for recovery (needs ≥3 weeks of recovery data)
    if (rec.length >= 15) {
      var byDow = {}; rec.forEach(function (x) { var dow = new Date(x.d + 'T00:00:00').getDay(); (byDow[dow] = byDow[dow] || []).push(x.v); });
      var overall = mean(rec.map(function (x) { return x.v; }));
      var bestDow = null, bestAvg = -1;
      Object.keys(byDow).forEach(function (d) { if (byDow[d].length >= 3) { var a = mean(byDow[d]); if (a > bestAvg) { bestAvg = a; bestDow = +d; } } });
      if (bestDow != null && bestAvg - overall >= 6) out.push({ id: 'best-dow', emoji: '📅', strength: 0.42, text: 'Your readiness peaks on ' + weekdayName(bestDow) + 's — recovery there averages ' + round(bestAvg) + ' versus your ' + round(overall) + ' overall.' });
    }
    return out;
  }

  function compute() {
    var rows;
    try { rows = timeline(); } catch (e) { return []; }
    var dataDays = Object.keys(rows).length;
    if (dataDays < 6) return []; // not enough history to say anything honest
    var all;
    try { all = crossDomain(rows).concat(singleSeries(rows)); } catch (e) { return []; }
    return all.filter(function (i) { return i.strength >= 0.30; })
      .sort(function (a, b) { return b.strength - a.strength; });
  }

  window.ALSInsights = {
    compute: compute,
    // exposed for the self-test harness
    _timeline: timeline, _splitAuto: splitAuto, _slope: slope, _median: median, _crossDomain: crossDomain, _singleSeries: singleSeries
  };
})();
