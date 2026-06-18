// ════════════════════════════════════════════════════════════════
// Adaptive TDEE engine (nutrition Part 2). Pure functions, no DOM —
// unit-tested in JSC. Learns true maintenance calories from logged
// intake + the weight trend, so it SELF-CORRECTS logging error:
//   TDEE = avg daily intake − (weight change per day × 7700 kcal/kg)
// (gaining → maintenance is below intake; losing → above).
// recommend() turns TDEE + goal into a daily calorie target.
// Exposes window.ALSTDEE = { compute, recommend }.
// ════════════════════════════════════════════════════════════════
(function () {
  'use strict';
  var KCAL_PER_KG = 7700;

  function dayNum(dk) { var p = String(dk).split('-').map(Number); return Math.round(Date.UTC(p[0], (p[1] || 1) - 1, p[2] || 1) / 86400000); }

  // least-squares slope of y over x (kg per day)
  function slope(pts) {
    var n = pts.length; if (n < 2) return null;
    var sx = 0, sy = 0, sxx = 0, sxy = 0;
    for (var i = 0; i < n; i++) { var p = pts[i]; sx += p.x; sy += p.y; sxx += p.x * p.x; sxy += p.x * p.y; }
    var d = n * sxx - sx * sx; if (d === 0) return null;
    return (n * sxy - sx * sy) / d;
  }

  function intakeByDay(logs) {
    var m = {};
    (logs || []).forEach(function (l) { if (l && l.dateKey) m[l.dateKey] = (m[l.dateKey] || 0) + (l.kcal || 0); });
    return m;
  }

  // compute(logs, weights, opts) → { ok, tdee, avgIntake, weeklyWeightChange, ... }
  function compute(logs, weights, opts) {
    opts = opts || {};
    var win = opts.windowDays || 14;
    var todayNum = (opts.todayNum != null) ? opts.todayNum : Math.floor(Date.now() / 86400000);
    var floor = (opts.intakeFloor != null) ? opts.intakeFloor : 500; // ignore barely-logged days
    var bodyKg = opts.weightKg || null;

    // intake: logged days in window with intake ≥ floor
    var im = intakeByDay(logs), intakes = [];
    Object.keys(im).forEach(function (dk) {
      var age = todayNum - dayNum(dk);
      if (age >= 0 && age < win && im[dk] >= floor) intakes.push(im[dk]);
    });
    var intakeDays = intakes.length;
    var avgIntake = intakeDays ? intakes.reduce(function (a, b) { return a + b; }, 0) / intakeDays : 0;

    // weigh-ins in window, deduped per day (mean), sorted by day
    var byDay = {};
    (weights || []).forEach(function (w) {
      if (!w || typeof w.weight !== 'number' || !w.dateKey) return;
      var x = dayNum(w.dateKey), age = todayNum - x;
      if (age >= 0 && age < win) { if (!byDay[x]) byDay[x] = { x: x, sum: 0, n: 0 }; byDay[x].sum += w.weight; byDay[x].n++; }
    });
    var pts = Object.keys(byDay).map(function (k) { return { x: byDay[k].x, y: byDay[k].sum / byDay[k].n }; }).sort(function (a, b) { return a.x - b.x; });
    var weighIns = pts.length;
    var spanDays = weighIns >= 2 ? (pts[weighIns - 1].x - pts[0].x) : 0;
    var slopePerDay = weighIns >= 2 ? slope(pts) : null;
    if (!bodyKg && weighIns) bodyKg = pts[weighIns - 1].y;

    if (intakeDays < 7 || weighIns < 2 || spanDays < 6 || slopePerDay == null) {
      return {
        ok: false, intakeDays: intakeDays, weighIns: weighIns, spanDays: spanDays,
        avgIntake: Math.round(avgIntake), weightKg: bodyKg || null,
        reason: intakeDays < 7 ? ('Log food ' + (7 - intakeDays) + ' more day' + (7 - intakeDays === 1 ? '' : 's')) : 'Weigh in a few more times across ~1 week'
      };
    }

    var tdee = avgIntake - slopePerDay * KCAL_PER_KG;
    // guardrails: clamp to a sane kcal/kg band so sparse/noisy data can't give garbage
    if (bodyKg) { var lo = bodyKg * 18, hi = bodyKg * 45; if (tdee < lo) tdee = lo; if (tdee > hi) tdee = hi; }

    var conf = 0.4 + Math.min(0.3, (intakeDays - 7) * 0.03) + Math.min(0.2, (weighIns - 2) * 0.05) + Math.min(0.1, (spanDays - 6) * 0.01);
    conf = Math.max(0, Math.min(1, conf));

    return {
      ok: true, tdee: Math.round(tdee), avgIntake: Math.round(avgIntake),
      slopePerDay: slopePerDay, weeklyWeightChange: Math.round(slopePerDay * 7 * 100) / 100,
      intakeDays: intakeDays, weighIns: weighIns, spanDays: spanDays,
      confidence: Math.round(conf * 100) / 100, weightKg: bodyKg || null
    };
  }

  // recommend(tdee, goal, opts) → daily calorie target
  function recommend(tdee, goal, opts) {
    opts = opts || {}; goal = goal || 'maintain';
    var perDay = 0;
    if (goal === 'cut') perDay = -((opts.rateKgPerWeek || 0.5) * KCAL_PER_KG / 7);
    else if (goal === 'bulk') perDay = ((opts.rateKgPerWeek || 0.25) * KCAL_PER_KG / 7);
    var target = Math.round(tdee + perDay);
    var minK = opts.weightKg ? Math.round(opts.weightKg * 22) : 1500; // never recommend a crash floor
    if (goal === 'cut' && target < minK) target = minK;
    return target;
  }

  var api = { compute: compute, recommend: recommend };
  var root = (typeof window !== 'undefined') ? window : (typeof globalThis !== 'undefined') ? globalThis : this;
  root.ALSTDEE = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api; // Node (Nova brief)
})();
