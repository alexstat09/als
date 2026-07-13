/* ════════════════════════════════════════════════════════════════
   ALS — WATER TARGET: the single source of truth.

   Every surface that shows a water goal (po-water.html, the topbar pill,
   the home chip, the home tile, body.html) MUST come through here.
   Five hand-copied variants of this maths had drifted apart: three of them
   multiplied activityHrsPerWeek by 500 as if the weekly training hours were
   DAILY hours, which turned a 7-bottle goal into a 10-bottle one.

   Loaded as a plain (non-defer) script so it is ready at parse time for the
   inline page scripts, before topbar.js and the rest.

     base       = weight_kg × 35 ml            (NAM/IOM standard)
     exercise   = activity_hrs_per_WEEK / 7 × 500 ml   (≈500 ml per training hour)
     caffeine   = max(0, mg/day − 200) × 1.5 ml        (mild diuresis)
     substances = Σ dose × mlPerUnit
     adjust     = +200 ml male, +100 ml age 50+

   The bottle count is what the app asks you to drink, so it is the number
   that must be honest: needMl is rounded UP to whole units, and drinkMl is
   what those units actually hold (7 × 500 ml = 3.5 L, not the 3.0 L need).
   ════════════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  var KEY = 'po_water_v1';
  var DEFAULT_UNIT = 'bottle', DEFAULT_BOTTLE_ML = 500, DEFAULT_GLASS_ML = 250, DEFAULT_WEIGHT_KG = 75;

  function num(v) { var n = parseFloat(v); return isFinite(n) ? n : 0; }

  function load() {
    try { var s = JSON.parse(localStorage.getItem(KEY)); return (s && typeof s === 'object') ? s : {}; }
    catch (e) { return {}; }
  }

  function dateKey(d) {
    d = d || new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  /* ml held by one logged unit */
  function unitMl(s) {
    s = s || {};
    var u = s.unit || DEFAULT_UNIT;
    if (u === 'glass') return num(s.glassMl) || DEFAULT_GLASS_ML;
    if (u === 'oz') return 30;                                   /* 1 fl oz ≈ 29.57 ml */
    if (u === 'ml') return 1;
    return num(s.bottleMl) || DEFAULT_BOTTLE_ML;                 /* 'bottle' */
  }

  function unitLabel(s, plural) {
    var u = (s || {}).unit || DEFAULT_UNIT;
    if (u === 'glass') return plural ? 'glasses' : 'glass';
    if (u === 'oz') return 'oz';
    if (u === 'ml') return 'ml';
    return plural ? 'bottles' : 'bottle';
  }

  function subExtraMl(x) {
    if (!x) return 0;
    var dose = num(x.dose != null ? x.dose : x.defaultDose);
    return Math.max(0, dose * num(x.mlPerUnit));
  }

  /* the itemised daily need, in ml */
  function breakdown(s) {
    s = s || {};
    var p = s.profile || {};
    var wKg = num(p.weightKg) || DEFAULT_WEIGHT_KG;
    if (s.weightUnit === 'lb') wKg = wKg / 2.20462;
    var base = wKg * 35;
    var exercise = num(p.activityHrsPerWeek) / 7 * 500;
    var caffeine = Math.max(0, num(s.caffeineMgPerDay) - 200) * 1.5;
    var subs = (Array.isArray(s.substances) ? s.substances : []).reduce(function (t, x) { return t + subExtraMl(x); }, 0);
    var adjust = 0;
    if (p.sex === 'm') adjust += 200;
    if (num(p.age) >= 50) adjust += 100;
    return { base: base, exercise: exercise, caffeine: caffeine, subs: subs, adjust: adjust,
             total: base + exercise + caffeine + subs + adjust };
  }

  /* THE goal. units is what every surface must display. */
  function target(s) {
    s = s || load();
    var b = breakdown(s), one = unitMl(s);
    var units = Math.max(1, Math.ceil(b.total / one));
    return {
      units: units,                 /* e.g. 7 — the goal, whole units, rounded up */
      unitMl: one,                  /* e.g. 500 */
      needMl: b.total,              /* e.g. 3007 — what the body needs */
      drinkMl: units * one,         /* e.g. 3500 — what 7 bottles actually pour */
      label: unitLabel(s, units !== 1),
      breakdown: b
    };
  }

  /* units logged on a given day (old rows were plain numbers, newer ones {n}) */
  function count(s, key) {
    s = s || load();
    var raw = (s.logs && typeof s.logs === 'object') ? s.logs[key || dateKey()] : 0;
    if (typeof raw === 'number') return raw;
    if (raw && typeof raw.n === 'number') return raw.n;
    return 0;
  }

  function fmtMl(ml) {
    ml = num(ml);
    if (ml >= 1000) return (ml / 1000).toFixed(1) + ' L';
    return Math.round(ml) + ' ml';
  }

  root.ALSWater = {
    KEY: KEY, load: load, dateKey: dateKey, unitMl: unitMl, unitLabel: unitLabel,
    subExtraMl: subExtraMl, breakdown: breakdown, target: target, count: count, fmtMl: fmtMl
  };
})(window);
