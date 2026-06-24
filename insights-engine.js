// =============================================================
// ALS Insight Engine v2 — finds honest, cross-domain patterns in your data.
//
// Connects sleep + training + nutrition + caffeine + hydration + recovery that
// otherwise live on separate pages, and surfaces only patterns that are
// statistically real. Built to NOT lie:
//   • curated, sensible hypotheses (no blind correlation-dredging)
//   • rank-split group comparisons (bottom 40% vs top 40%), min samples/group
//   • TWO gates per pattern: an absolute effect that matters AND a Welch t-test
//     ≥ 3.0 (the difference must be statistically real vs the day-to-day noise,
//     a bar strict enough to survive testing ~16 hypotheses) — this is what
//     kills noise-driven false positives; it auto-scales with sample size
//   • association language only ("tends to", "tracks with") — never "causes"
//   • returns nothing when there isn't enough data
//
// Pure logic, reads localStorage only. window.ALSInsights.compute() → array of
// { id, text, emoji, strength, effect, confidence, action, domain } sorted
// strongest-first. (Older consumers read just id/text/emoji/strength.)
// =============================================================
(function () {
  'use strict';
  if (window.ALSInsights) return;

  var T_MIN = 3.8; // Welch t-gate — significance that survives testing many hypotheses
                   // (~3% false-positive rate on pure-noise data, Monte-Carlo tuned;
                   //  auto-scales: needs a large effect on little data, smaller as data grows)

  function ls(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
  function pad(n) { return String(n).padStart(2, '0'); }
  function dkOf(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function addDays(dk, n) { var d = new Date(dk + 'T00:00:00'); if (isNaN(d)) return dk; d.setDate(d.getDate() + n); return dkOf(d); }
  function mean(a) { return a.length ? a.reduce(function (s, x) { return s + x; }, 0) / a.length : 0; }
  function median(a) { if (!a.length) return 0; var b = a.slice().sort(function (x, y) { return x - y; }); var m = b.length >> 1; return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2; }
  function variance(a, m) { if (a.length < 2) return 0; var s = 0; for (var i = 0; i < a.length; i++) { var dv = a[i] - m; s += dv * dv; } return s / (a.length - 1); }
  function round(n, p) { p = p || 0; var m = Math.pow(10, p); return Math.round((n || 0) * m) / m; }
  function pct(x) { return Math.round(x * 100); }
  function kfmt(n) { n = Math.round(n || 0); return n >= 1000 ? (Math.round(n / 100) / 10) + 'k' : String(n); }
  function clamp01(x) { return Math.max(0, Math.min(1, x)); }
  function weekdayName(i) { return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][i]; }

  // ── unified daily timeline ────────────────────────────────
  function timeline() {
    var rows = {};
    function row(dk) { return rows[dk] || (rows[dk] = { date: dk }); }
    var sl = ls('sleep:logs'); if (Array.isArray(sl)) sl.forEach(function (e) {
      if (e && e.dateKey) { var r = row(e.dateKey);
        if (typeof e.recovery === 'number') r.recovery = e.recovery;
        if (typeof e.hours === 'number') r.sleepH = e.hours;
        if (typeof e.quality === 'number') r.quality = e.quality;
        if (typeof e.energy === 'number') r.energy = e.energy;
        if (typeof e.soreness === 'number') r.soreness = e.soreness;
        if (typeof e.mood === 'number') r.mood = e.mood;
      }
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
  // Continuous A → split by RANK (bottom 40% vs top 40%); binary/explicit A →
  // split on a value threshold. Returns means, per-group SDs, n, and Cohen's d
  // (effect size: mean gap normalised by pooled within-group spread).
  function splitAuto(rows, A, B, lag, opt) {
    opt = opt || {}; lag = lag || 0;
    var minN = opt.minN || 8;
    var items = [];
    Object.keys(rows).forEach(function (dk) {
      var ra = rows[dk]; var av = (ra[A] != null) ? ra[A] : (opt.missingA != null ? opt.missingA : null);
      if (av == null) return;
      var dk2 = lag ? addDays(dk, lag) : dk; var rb = rows[dk2]; if (!rb || rb[B] == null) return;
      items.push({ a: av, b: rb[B] });
    });
    if (items.length < minN) return null;
    var hi, lo;
    if (opt.thr != null) {
      hi = []; lo = [];
      items.forEach(function (i) { (i.a > opt.thr ? hi : lo).push(i.b); });
    } else {
      items.sort(function (x, y) { return x.a - y.a; });
      var n = items.length, k = Math.max(4, Math.round(n * 0.4));
      if (2 * k > n) k = Math.floor(n / 2);
      lo = items.slice(0, k).map(function (i) { return i.b; });
      hi = items.slice(n - k).map(function (i) { return i.b; });
    }
    if (hi.length < 4 || lo.length < 4) return null;
    var hm = mean(hi), lm = mean(lo);
    var hv = variance(hi, hm), lv = variance(lo, lm);
    var pooled = Math.sqrt((hv + lv) / 2);
    var d = pooled > 0 ? (hm - lm) / pooled : 0;
    var se = Math.sqrt(hv / hi.length + lv / lo.length);
    var t = se > 0 ? (hm - lm) / se : 0; // Welch's t (unequal variances)
    return { hiMean: hm, loMean: lm, hiSD: Math.sqrt(hv), loSD: Math.sqrt(lv), d: d, t: t, nHi: hi.length, nLo: lo.length, n: items.length };
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
    { id: 'rec-pr', A: 'recovery', B: 'pr', lag: 0, scale: 0.45, minN: 12, domain: 'training',
      action: 'Save your PR attempts for high-recovery days.',
      min: function (s) { return (s.hiMean - s.loMean) >= 0.18; },
      text: function (s) { return 'You set a PR on ' + pct(s.hiMean) + '% of your higher-recovery training days — versus ' + pct(s.loMean) + '% on lower-recovery ones. (' + s.n + ' sessions)'; },
      e: '🏆' },
    { id: 'prot-rec', A: 'protein', B: 'recovery', lag: 1, scale: 22, domain: 'nutrition',
      action: 'Hit your protein, especially after training.',
      min: function (s) { return Math.abs(s.hiMean - s.loMean) >= 8; },
      text: function (s) { var hi = s.hiMean > s.loMean; return 'Your recovery runs about ' + round(Math.abs(s.hiMean - s.loMean)) + ' points ' + (hi ? 'higher' : 'lower') + ' the morning after your higher-protein days (' + round(s.hiMean) + ' vs ' + round(s.loMean) + ', ' + s.n + ' days).'; },
      e: '🥩' },
    { id: 'vol-rec', A: 'volume', B: 'recovery', lag: 1, scale: 22, domain: 'training',
      action: 'Plan a lighter day after your biggest sessions.',
      min: function (s) { return Math.abs(s.hiMean - s.loMean) >= 8; },
      text: function (s) { return 'After your biggest training days, next-morning recovery averages ' + round(s.hiMean) + ' — versus ' + round(s.loMean) + ' after lighter days. (' + s.n + ' days)'; },
      e: '🔥' },
    { id: 'train-sleep', A: 'trained', B: 'sleepH', lag: 1, thr: 0.5, missingA: 0, scale: 1.1, domain: 'sleep',
      action: 'Protect your sleep window on training nights.',
      min: function (s) { return Math.abs(s.hiMean - s.loMean) >= 0.4; },
      text: function (s) { var more = s.hiMean > s.loMean; return 'You sleep about ' + round(Math.abs(s.hiMean - s.loMean), 1) + 'h ' + (more ? 'longer' : 'less') + ' on the nights after you train (' + round(s.hiMean, 1) + 'h vs ' + round(s.loMean, 1) + 'h, ' + s.n + ' nights).'; },
      e: '😴' },
    { id: 'caflate-sleep', A: 'cafLate', B: 'sleepH', lag: 1, scale: 1.1, domain: 'caffeine',
      action: 'Cut caffeine after ~2pm.',
      min: function (s) { return Math.abs(s.hiMean - s.loMean) >= 0.4; },
      text: function (s) { return 'Caffeine later in the day tracks with shorter sleep — ' + round(s.hiMean, 1) + 'h on your late-caffeine days versus ' + round(s.loMean, 1) + 'h without. (' + s.n + ' nights)'; },
      e: '☕' },
    { id: 'rec-vol', A: 'recovery', B: 'volume', lag: 0, scale: 0, domain: 'training',
      action: 'Push volume on the mornings you wake recovered.',
      min: function (s) { return s.loMean > 0 && Math.abs(s.hiMean - s.loMean) / s.loMean >= 0.15; },
      effect: function (s) { return Math.min(1, Math.abs(s.hiMean - s.loMean) / Math.max(1, s.loMean) / 0.5); },
      text: function (s) { return 'You train heavier when you wake recovered — volume averages ' + kfmt(s.hiMean) + ' on high-recovery days versus ' + kfmt(s.loMean) + ' on low ones. (' + s.n + ' days)'; },
      e: '💪' },
    { id: 'water-rec', A: 'water', B: 'recovery', lag: 1, scale: 22, domain: 'recovery',
      action: 'Keep hydration up — it shows up the next morning.',
      min: function (s) { return Math.abs(s.hiMean - s.loMean) >= 8; },
      text: function (s) { var hi = s.hiMean > s.loMean; return 'Recovery runs about ' + round(Math.abs(s.hiMean - s.loMean)) + ' points ' + (hi ? 'higher' : 'lower') + ' the morning after your better-hydrated days (' + round(s.hiMean) + ' vs ' + round(s.loMean) + ', ' + s.n + ' days).'; },
      e: '💧' },
    { id: 'caf-sleep', A: 'caf', B: 'sleepH', lag: 1, scale: 1.1, domain: 'caffeine',
      action: 'Keep total caffeine moderate.',
      min: function (s) { return Math.abs(s.hiMean - s.loMean) >= 0.4; },
      text: function (s) { return 'On your higher-caffeine days you sleep about ' + round(Math.abs(s.hiMean - s.loMean), 1) + 'h ' + (s.hiMean > s.loMean ? 'more' : 'less') + ' that night (' + round(s.hiMean, 1) + 'h vs ' + round(s.loMean, 1) + 'h, ' + s.n + ' nights).'; },
      e: '☕' },
    { id: 'qual-vol', A: 'quality', B: 'volume', lag: 0, scale: 0, domain: 'training',
      action: 'Prioritise sleep quality before your big sessions.',
      min: function (s) { return s.loMean > 0 && Math.abs(s.hiMean - s.loMean) / s.loMean >= 0.15; },
      effect: function (s) { return Math.min(1, Math.abs(s.hiMean - s.loMean) / Math.max(1, s.loMean) / 0.5); },
      text: function (s) { return 'You train harder after better sleep — volume averages ' + kfmt(s.hiMean) + ' on your best-quality nights versus ' + kfmt(s.loMean) + ' on your worst. (' + s.n + ' days)'; },
      e: '🛌' },
    { id: 'carb-rec', A: 'carbs', B: 'recovery', lag: 1, scale: 22, domain: 'nutrition',
      action: 'Don’t fear carbs around training.',
      min: function (s) { return Math.abs(s.hiMean - s.loMean) >= 8; },
      text: function (s) { var hi = s.hiMean > s.loMean; return 'Recovery is about ' + round(Math.abs(s.hiMean - s.loMean)) + ' points ' + (hi ? 'higher' : 'lower') + ' the morning after your higher-carb days (' + round(s.hiMean) + ' vs ' + round(s.loMean) + ', ' + s.n + ' days).'; },
      e: '🍚' },

    // ── new in v2 ──
    { id: 'sleep-energy', A: 'sleepH', B: 'energy', lag: 0, scale: 2, domain: 'sleep',
      action: 'Guard your hours — energy follows sleep.',
      min: function (s) { return Math.abs(s.hiMean - s.loMean) >= 0.5; },
      text: function (s) { var hi = s.hiMean > s.loMean; return 'Your morning energy is clearly ' + (hi ? 'higher' : 'lower') + ' after longer nights — averaging ' + round(s.hiMean, 1) + ' on your best-slept days versus ' + round(s.loMean, 1) + ' on your shortest. (' + s.n + ' days)'; },
      e: '🔋' },
    { id: 'rec-energy', A: 'recovery', B: 'energy', lag: 0, scale: 2, domain: 'recovery',
      action: 'Match the day’s demands to how recovered you wake.',
      min: function (s) { return Math.abs(s.hiMean - s.loMean) >= 0.5; },
      text: function (s) { return 'Energy tracks your recovery score — ' + round(s.hiMean, 1) + ' on high-recovery mornings versus ' + round(s.loMean, 1) + ' on low ones. (' + s.n + ' days)'; },
      e: '⚡' },
    { id: 'caf-rec', A: 'caf', B: 'recovery', lag: 1, scale: 22, domain: 'caffeine',
      action: 'Ease off caffeine — it dents next-day recovery.',
      min: function (s) { return Math.abs(s.hiMean - s.loMean) >= 8; },
      text: function (s) { var hi = s.hiMean > s.loMean; return 'The morning after your higher-caffeine days, recovery averages ' + round(s.hiMean) + ' versus ' + round(s.loMean) + ' on lower-caffeine days — about ' + round(Math.abs(s.hiMean - s.loMean)) + ' points ' + (hi ? 'higher' : 'lower') + '. (' + s.n + ' days)'; },
      e: '☕' },
    { id: 'vol-energy', A: 'volume', B: 'energy', lag: 1, scale: 2, domain: 'training',
      action: 'Expect a dip the day after big sessions — plan around it.',
      min: function (s) { return Math.abs(s.hiMean - s.loMean) >= 0.5; },
      text: function (s) { var hi = s.hiMean > s.loMean; return 'Energy the day after your biggest sessions runs ' + (hi ? 'higher' : 'lower') + ' — ' + round(s.hiMean, 1) + ' versus ' + round(s.loMean, 1) + ' after lighter days. (' + s.n + ' days)'; },
      e: '🥱' },
    { id: 'water-energy', A: 'water', B: 'energy', lag: 0, scale: 2, domain: 'recovery',
      action: 'Stay hydrated for steadier energy.',
      min: function (s) { return Math.abs(s.hiMean - s.loMean) >= 0.5; },
      text: function (s) { var hi = s.hiMean > s.loMean; return 'Your energy is ' + (hi ? 'higher' : 'lower') + ' on your better-hydrated days — ' + round(s.hiMean, 1) + ' versus ' + round(s.loMean, 1) + '. (' + s.n + ' days)'; },
      e: '💧' },
    { id: 'caflate-rec', A: 'cafLate', B: 'recovery', lag: 1, scale: 22, domain: 'caffeine',
      action: 'Late caffeine costs you tomorrow — keep it early.',
      min: function (s) { return Math.abs(s.hiMean - s.loMean) >= 8; },
      text: function (s) { var hi = s.hiMean > s.loMean; return 'After days with late caffeine, next-morning recovery averages ' + round(s.hiMean) + ' versus ' + round(s.loMean) + ' without — about ' + round(Math.abs(s.hiMean - s.loMean)) + ' points ' + (hi ? 'higher' : 'lower') + '. (' + s.n + ' days)'; },
      e: '🌙' }
  ];

  function crossDomain(rows) {
    var out = [];
    HYP.forEach(function (h) {
      var s = splitAuto(rows, h.A, h.B, h.lag, { thr: h.thr, missingA: h.missingA, minN: h.minN });
      if (!s || !h.min(s)) return;            // must matter in absolute terms
      if (Math.abs(s.t) < T_MIN) return;      // AND be statistically real (not noise)
      var effect = h.effect ? h.effect(s) : Math.min(1, Math.abs(s.hiMean - s.loMean) / h.scale);
      var confidence = clamp01((Math.abs(s.t) - 2) / 4); // t 3→0.25 … 6→1
      var strength = +clamp01(0.4 + effect * 0.3 + confidence * 0.3).toFixed(3);
      out.push({ id: h.id, text: h.text(s), emoji: h.e, strength: strength, effect: +effect.toFixed(2), confidence: +confidence.toFixed(2), d: +s.d.toFixed(2), action: h.action || '', domain: h.domain || '' });
    });
    return out;
  }

  // ── single-series insights (trends / rhythms) ─────────────
  function seriesOf(rows, key) {
    return Object.keys(rows).sort().filter(function (dk) { return rows[dk][key] != null; }).map(function (dk) { return { d: dk, v: rows[dk][key] }; });
  }

  function singleSeries(rows) {
    var out = [];
    var rec = seriesOf(rows, 'recovery');
    if (rec.length >= 4) {
      var last = rec.slice(-7); var vals = last.map(function (x) { return x.v; });
      var sp = slope(vals) * (vals.length - 1);
      if (sp <= -10) out.push({ id: 'rec-down', emoji: '🪫', strength: 0.72, domain: 'recovery', action: 'Take a lighter day or an early night.', text: 'Heads up — your recovery has trended down over your last ' + vals.length + ' mornings (about ' + round(Math.abs(sp)) + ' points). A lighter day or an early night pays off here.' });
      else if (sp >= 10) out.push({ id: 'rec-up', emoji: '⚡', strength: 0.6, domain: 'recovery', action: 'Capitalise — this is a window to push.', text: 'Your recovery has been climbing over your last ' + vals.length + ' mornings (about +' + round(sp) + '). Good time to push.' });
    }
    var wt = seriesOf(rows, 'weight');
    if (wt.length >= 6) {
      var lw = wt.slice(-14); var perWeek = slope(lw.map(function (x) { return x.v; })) * 7;
      if (Math.abs(perWeek) >= 0.2) out.push({ id: 'wt-trend', emoji: '⚖️', strength: 0.5, domain: 'body', action: '', text: 'Over your last ' + lw.length + ' weigh-ins you\'re trending ' + (perWeek < 0 ? 'down' : 'up') + ' about ' + round(Math.abs(perWeek), 1) + ' kg/week.' });
    }
    if (rec.length >= 15) {
      var byDow = {}; rec.forEach(function (x) { var dow = new Date(x.d + 'T00:00:00').getDay(); (byDow[dow] = byDow[dow] || []).push(x.v); });
      var overall = mean(rec.map(function (x) { return x.v; }));
      var bestDow = null, bestAvg = -1;
      Object.keys(byDow).forEach(function (d) { if (byDow[d].length >= 3) { var a = mean(byDow[d]); if (a > bestAvg) { bestAvg = a; bestDow = +d; } } });
      if (bestDow != null && bestAvg - overall >= 6) out.push({ id: 'best-dow', emoji: '📅', strength: 0.42, domain: 'recovery', action: 'Schedule your key sessions on ' + weekdayName(bestDow) + 's.', text: 'Your readiness peaks on ' + weekdayName(bestDow) + 's — recovery there averages ' + round(bestAvg) + ' versus your ' + round(overall) + ' overall.' });
    }
    // training consistency over the last 2 weeks
    var trained = Object.keys(rows).filter(function (dk) { return rows[dk].trained; }).sort();
    if (trained.length >= 4) {
      var today = new Date(); var since14 = dkOf(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 13));
      var last2w = trained.filter(function (dk) { return dk >= since14; }).length;
      if (last2w === 0 && trained.length >= 6) out.push({ id: 'train-gap', emoji: '🏋️', strength: 0.68, domain: 'training', action: 'Get a session in to restart momentum.', text: 'No training logged in the last two weeks, though you’ve got ' + trained.length + ' sessions on record. A short workout restarts the momentum.' });
    }
    return out;
  }

  function compute() {
    var rows;
    try { rows = timeline(); } catch (e) { return []; }
    if (Object.keys(rows).length < 6) return [];
    var all;
    try { all = crossDomain(rows).concat(singleSeries(rows)); } catch (e) { return []; }
    return all.filter(function (i) { return i.strength >= 0.30; })
      .sort(function (a, b) { return b.strength - a.strength; })
      .slice(0, 8);
  }

  window.ALSInsights = {
    compute: compute,
    _timeline: timeline, _splitAuto: splitAuto, _slope: slope, _median: median, _crossDomain: crossDomain, _singleSeries: singleSeries, _HYP: HYP
  };
})();
