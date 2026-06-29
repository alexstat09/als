// =============================================================
// ALS Forecast Engine — honest trajectory & projection (Pillar 3).
//
// Looks at where your trends are HEADED, not just where they've been. The
// hard rule is the same as the Insight Engine: never overclaim. Every forecast
// is a transparent linear trend with a rate and a ± range, gated by fit
// quality and sample size. Flat data says "holding steady"; scattered data is
// hedged or withheld; thin data returns nothing.
//
// Reads localStorage only. window.ALSForecast.compute() → [{id,text,emoji,kind}].
// =============================================================
(function () {
  'use strict';
  if (window.ALSForecast) return;

  function ls(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
  function pad(n) { return String(n).padStart(2, '0'); }
  function dkOf(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function dayNum(dk) { var d = new Date(dk + 'T00:00:00'); return isNaN(d) ? 0 : Math.floor(d.getTime() / 86400000); }
  function addDays(dk, n) { var d = new Date(dk + 'T00:00:00'); if (isNaN(d)) return dk; d.setDate(d.getDate() + n); return dkOf(d); }
  function round(n, p) { p = p || 0; var m = Math.pow(10, p); return Math.round((n || 0) * m) / m; }
  function mean(a) { return a.length ? a.reduce(function (s, x) { return s + x; }, 0) / a.length : 0; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function fmtDate(dk) { var d = new Date(dk + 'T00:00:00'); return isNaN(d) ? dk : MON[d.getMonth()] + ' ' + d.getDate(); }
  function e1rm(w, r) { return (+w || 0) * (1 + (+r || 0) / 30); }

  // least-squares fit of y on x → slope, intercept, r², residual std
  function linreg(pts) {
    var n = pts.length; if (n < 2) return null;
    var sx = 0, sy = 0, sxx = 0, sxy = 0;
    for (var i = 0; i < n; i++) { sx += pts[i][0]; sy += pts[i][1]; sxx += pts[i][0] * pts[i][0]; sxy += pts[i][0] * pts[i][1]; }
    var den = n * sxx - sx * sx; if (den === 0) return null;
    var slope = (n * sxy - sx * sy) / den, intercept = (sy - slope * sx) / n;
    var meanY = sy / n, ssTot = 0, ssRes = 0;
    for (i = 0; i < n; i++) { var yi = pts[i][1], fi = intercept + slope * pts[i][0]; ssTot += (yi - meanY) * (yi - meanY); ssRes += (yi - fi) * (yi - fi); }
    return { slope: slope, intercept: intercept, n: n, r2: ssTot === 0 ? 0 : 1 - ssRes / ssTot, residStd: Math.sqrt(ssRes / Math.max(1, n - 2)) };
  }

  // ── weight trajectory (last ~28 days) ─────────────────────
  function weightForecast() {
    var a = ls('po_coach_weights'); if (!Array.isArray(a)) return null;
    var s = a.filter(function (e) { return e && e.dateKey && typeof e.weight === 'number'; })
      .map(function (e) { return { d: e.dateKey, v: e.weight }; })
      .sort(function (x, y) { return x.d.localeCompare(y.d); });
    if (s.length < 6) return null;
    var lastD = s[s.length - 1].d, cutoff = addDays(lastD, -28);
    var w = s.filter(function (e) { return e.d >= cutoff; });
    if (w.length < 6) return null;
    var x0 = dayNum(w[0].d), span = dayNum(lastD) - x0;
    if (span < 10) return null;
    var r = linreg(w.map(function (e) { return [dayNum(e.d) - x0, e.v]; })); if (!r) return null;
    var perWeek = r.slope * 7, cur = w[w.length - 1].v;
    if (Math.abs(perWeek) < 0.08) {
      return { id: 'wt-steady', emoji: '⚖️', kind: 'weight', text: 'Your weight’s holding steady around ' + round(cur, 1) + ' kg — no real trend to project right now.' };
    }
    var proj = r.intercept + r.slope * ((dayNum(lastD) - x0) + 28);
    var band = Math.max(0.4, r.residStd);
    var dir = perWeek < 0 ? 'down' : 'up';
    var lead = r.r2 < 0.25 ? 'Loosely, you’re drifting ' : 'At your current trend you’re moving ';
    return { id: 'wt-proj', emoji: '⚖️', kind: 'weight',
      text: lead + dir + ' about ' + round(Math.abs(perWeek), 1) + ' kg/week — on track for ~' + round(proj, 1) + ' kg in 4 weeks (±' + round(band, 1) + ').' };
  }

  // ── strongest lift trajectory (estimated-1RM trend) ───────
  function liftForecast() {
    var wo = ls('po_workouts'); if (!Array.isArray(wo)) return null;
    var byEx = {};
    wo.forEach(function (s) {
      if (!s || !s.date) return;
      (s.entries || []).forEach(function (en) {
        if (!en || en.kind === 'time') return;
        var best = 0; (en.sets || []).forEach(function (st) { if (st && st.done !== false && st.type !== 'warmup') { var v = e1rm(st.kg, st.reps); if (v > best) best = v; } });
        if (best > 0) { var k = en.exId || en.name; if (!byEx[k]) byEx[k] = { name: en.name || k, byDay: {} }; var d = s.date; if (!byEx[k].byDay[d] || best > byEx[k].byDay[d]) byEx[k].byDay[d] = best; }
      });
    });
    var pick = null;
    Object.keys(byEx).forEach(function (k) { var days = Object.keys(byEx[k].byDay).length; if (!pick || days > pick.days) pick = { ex: byEx[k], days: days }; });
    if (!pick || pick.days < 5) return null;
    var ser = Object.keys(pick.ex.byDay).sort().map(function (d) { return { d: d, v: pick.ex.byDay[d] }; }).slice(-12);
    if (ser.length < 5) return null;
    var x0 = dayNum(ser[0].d), span = dayNum(ser[ser.length - 1].d) - x0;
    if (span < 14) return null;
    var r = linreg(ser.map(function (p) { return [dayNum(p.d) - x0, p.v]; })); if (!r) return null;
    var perWeek = r.slope * 7;
    if (perWeek < 0.3 || r.r2 < 0.2) return null; // not a clear, consistent climb
    var cur = ser[ser.length - 1].v;
    var milestone = Math.ceil((cur + 1) / 5) * 5;
    var daysTo = (milestone - cur) / r.slope;
    if (!(daysTo > 0 && daysTo < 220)) return null;
    var eta = addDays(ser[ser.length - 1].d, Math.round(daysTo));
    return { id: 'lift-proj', emoji: '📈', kind: 'lift',
      text: 'Your ' + pick.ex.name + ' is climbing about ' + round(perWeek, 1) + ' kg/week (estimated 1RM) — on track to reach ' + milestone + ' kg around ' + fmtDate(eta) + ' if you keep the pace.' };
  }

  // ── tomorrow's recovery, from YOUR own next-day response to training load ──
  // Regresses next-morning recovery on the prior day's training volume, then
  // applies today's actual load. Honest: ranged (±), and gated so it never
  // predicts before today's training is known (needs you trained today, or it's
  // evening). Falls back to your recent baseline when load doesn't explain much.
  function recoveryForecast() {
    var sl = ls('sleep:logs'); if (!Array.isArray(sl)) return null;
    var rec = {}; sl.forEach(function (e) { if (e && e.dateKey && typeof e.recovery === 'number') rec[e.dateKey] = e.recovery; });
    var recDates = Object.keys(rec).sort(); if (recDates.length < 8) return null;
    var vol = {}; var wo = ls('po_workouts'); if (Array.isArray(wo)) wo.forEach(function (s) { if (s && s.date) vol[s.date] = (vol[s.date] || 0) + (+s.volume || 0); });
    var pts = recDates.map(function (dk) { return [vol[addDays(dk, -1)] || 0, rec[dk]]; });
    if (pts.length < 8) return null;
    var r = linreg(pts); if (!r) return null;

    var todayK = dkOf(new Date()), todayVol = vol[todayK] || 0;
    var trainedToday = todayVol > 0, hour = new Date().getHours();
    if (!trainedToday && hour < 18) return null;             // don't call tomorrow before today's training is known

    var baseline = mean(recDates.slice(-14).map(function (d) { return rec[d]; }));
    var loadPredictive = (r.r2 >= 0.15 && Math.abs(r.slope) > 0);
    var pred = clamp(loadPredictive ? (r.intercept + r.slope * todayVol) : baseline, 0, 100);
    var band = Math.max(5, Math.round(r.residStd));
    var p = Math.round(pred), diff = pred - baseline, text;
    if (trainedToday) {
      if (diff <= -5) text = 'Today’s training will likely cost you — tomorrow’s recovery projects around ' + p + ' (±' + band + '), based on how you usually respond to days like this.';
      else text = 'You trained today but should bounce back — tomorrow’s recovery projects around ' + p + ' (±' + band + ').';
    } else {
      text = 'A rest day today — tomorrow’s recovery projects around ' + p + ' (±' + band + ').';
    }
    return { id: 'rec-tomorrow', emoji: '🔮', kind: 'recovery', text: text };
  }

  function compute() {
    var out = [];
    try { var w = weightForecast(); if (w) out.push(w); } catch (e) {}
    try { var l = liftForecast(); if (l) out.push(l); } catch (e) {}
    try { var rc = recoveryForecast(); if (rc) out.push(rc); } catch (e) {}
    return out;
  }

  window.ALSForecast = { compute: compute, _linreg: linreg, _weightForecast: weightForecast, _liftForecast: liftForecast, _recoveryForecast: recoveryForecast };
})();
