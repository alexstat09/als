// ════════════════════════════════════════════════════════════════
// Chapters engine — turns Alex's raw logs into the STORY of who he's
// been: a chronological set of detected "chapters" (Genesis, The Cut,
// The Build, The Surge, The Streak, The Return, Now) for the Arc page.
//
// Pillar 4 of the intelligence vision: data + identity → a living
// narrative. Pure, free, local — reads the same localStorage the rest
// of the app syncs. Nothing is fabricated: every chapter is gated by
// real thresholds (mirrors the honesty discipline of insights-engine).
//
//   window.ALSChapters.compute()            // reads localStorage
//   window.ALSChapters.compute(override)    // inject data (for tests)
//     → { hasEnough:bool, chapters:[...], northStar:{...}|null }
//
// Each chapter: { n, key, title, eyebrow, body, color(rgb),
//                 stat:{value,label}, spark:{kind,rgb,data}|null,
//                 start(YYYY-MM-DD), score }
//
// NOTE for Alex (17): weight phases are framed as neutral observation,
// never as encouragement to cut harder, and carry no calorie what-ifs.
// ════════════════════════════════════════════════════════════════
(function () {
  'use strict';
  if (window.ALSChapters) return;

  // ── tiny date / math helpers (pure) ─────────────────────────────
  function pad(n) { return String(n).padStart(2, '0'); }
  function todayKey() { var d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function dParse(dk) { return new Date(dk + 'T00:00:00'); }
  function daysBetween(a, b) { return Math.round((dParse(b) - dParse(a)) / 86400000); }
  function addDays(dk, n) { var d = dParse(dk); d.setDate(d.getDate() + n); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function r1(n) { return Math.round((n || 0) * 10) / 10; }
  function r0(n) { return Math.round(n || 0); }
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function fmtShort(dk) { var d = dParse(dk); return MON[d.getMonth()] + ' ' + d.getDate(); }
  function fmtLong(dk) { var d = dParse(dk); return MON[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear(); }
  function isoWeek(dk) {
    var d = dParse(dk); var day = (d.getDay() + 6) % 7; var x = new Date(d); x.setDate(d.getDate() - day + 3);
    var f = new Date(x.getFullYear(), 0, 4); var w = 1 + Math.round(((x - f) / 86400000 - 3 + ((f.getDay() + 6) % 7)) / 7);
    return x.getFullYear() + '-W' + pad(w);
  }
  function mondayOf(dk) { var d = dParse(dk); var off = (d.getDay() + 6) % 7; d.setDate(d.getDate() - off); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  // least-squares slope per DAY over [{d,v}]; null if <2 points
  function slopePerDay(series) {
    var n = series.length; if (n < 2) return null;
    var x0 = series[0].d, sx = 0, sy = 0, sxx = 0, sxy = 0;
    for (var i = 0; i < n; i++) { var x = daysBetween(x0, series[i].d), y = series[i].v; sx += x; sy += y; sxx += x * x; sxy += x * y; }
    var den = n * sxx - sx * sx; if (Math.abs(den) < 1e-9) return null;
    return (n * sxy - sx * sy) / den;
  }

  function ls(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
  function arr(x) { return Array.isArray(x) ? x : []; }

  // ── normalize the raw stores into clean, sorted series ──────────
  function readAll() {
    return {
      weights: ls('po_coach_weights'),
      workouts: ls('po_workouts'),
      recovery: ls('sleep:logs'),
      goalStreak: ls('goal_streak_v1'),
      northStar: ls('identity:northstar')
    };
  }
  function normWeights(raw) {
    return arr(raw).filter(function (e) { return e && e.dateKey && typeof e.weight === 'number'; })
      .map(function (e) { return { d: e.dateKey, v: e.weight }; })
      .sort(function (a, b) { return a.d.localeCompare(b.d); });
  }
  function normWorkouts(raw) {
    return arr(raw).filter(function (w) { return w && w.date; })
      .map(function (w) { return { d: w.date, volume: +w.volume || 0, prCount: (w.prs && w.prs.length) || 0 }; })
      .sort(function (a, b) { return a.d.localeCompare(b.d); });
  }
  function normRecovery(raw) {
    return arr(raw).filter(function (e) { return e && e.dateKey && typeof e.recovery === 'number'; })
      .map(function (e) { return { d: e.dateKey, v: e.recovery }; })
      .sort(function (a, b) { return a.d.localeCompare(b.d); });
  }

  // weekly average bodyweight buckets (denoise within a week)
  function weeklyAvg(weights) {
    var m = {};
    weights.forEach(function (p) {
      var wk = isoWeek(p.d);
      if (!m[wk]) m[wk] = { sum: 0, c: 0, dMin: p.d, dMax: p.d };
      var b = m[wk]; b.sum += p.v; b.c++; if (p.d < b.dMin) b.dMin = p.d; if (p.d > b.dMax) b.dMax = p.d;
    });
    return Object.keys(m).sort().map(function (k) { var b = m[k]; return { avg: b.sum / b.c, dStart: b.dMin, dEnd: b.dMax }; });
  }
  // weekly training volume buckets (for sparklines)
  function weeklyVolume(workouts) {
    var m = {};
    workouts.forEach(function (w) {
      var wk = isoWeek(w.d);
      if (!m[wk]) m[wk] = { volume: 0, pr: false, dStart: w.d };
      m[wk].volume += w.volume; if (w.prCount) m[wk].pr = true; if (w.d < m[wk].dStart) m[wk].dStart = w.d;
    });
    return Object.keys(m).sort().map(function (k) { return { volume: m[k].volume, pr: m[k].pr, dStart: m[k].dStart }; });
  }

  // ── tunables (conservative → no phantom chapters on noise) ──────
  var FLAT = 0.3, REVERSAL = 0.5, MIN_NET = 1.5, MIN_WEEKS = 3; // weight phases (kg / weeks)
  var SURGE_WIN = 49, SURGE_MIN_PR = 3;                          // strength surge (days / PRs)
  var STREAK_MIN = 4;                                            // consecutive training weeks
  var GAP_MIN = 14;                                              // comeback gap (days)
  var COLOR = { genesis: '167,139,250', cut: '124,211,252', build: '245,158,110', surge: '255,196,87', streak: '52,226,176', ret: '255,143,163', now: '167,139,250' };

  // ── detectors ───────────────────────────────────────────────────
  // Bodyweight phases via run-merging on weekly averages (tolerant of
  // wobble). Produces chronological Cut/Build chapters.
  function detectWeightPhases(weights) {
    var b = weeklyAvg(weights), out = [];
    if (b.length < MIN_WEEKS) return out;
    var A = b.map(function (x) { return x.avg; }), n = A.length, i = 0;
    while (i < n - 1) {
      var j = i + 1;
      while (j < n && Math.abs(A[j] - A[i]) < FLAT) j++; // skip a flat opening
      if (j >= n) break;
      var up = A[j] > A[i], ext = j, best = A[j];
      while (ext + 1 < n) {
        var nx = A[ext + 1];
        if (up) { if (nx >= best - REVERSAL) { if (nx > best) best = nx; ext++; } else break; }
        else { if (nx <= best + REVERSAL) { if (nx < best) best = nx; ext++; } else break; }
      }
      var net = A[ext] - A[i], weeks = ext - i + 1;
      if (Math.abs(net) >= MIN_NET && weeks >= MIN_WEEKS) {
        out.push({ kind: net < 0 ? 'cut' : 'build', a: i, b2: ext, start: b[i].dStart, end: b[ext].dEnd, startW: b[i].avg, endW: b[ext].avg, weeks: weeks, net: net });
      }
      i = ext > i ? ext : i + 1;
    }
    return out;
  }

  // Densest cluster of PRs inside a sliding date window.
  function detectSurge(workouts) {
    var ev = workouts.filter(function (w) { return w.prCount > 0; });
    if (!ev.length) return null;
    if (ev.reduce(function (s, w) { return s + w.prCount; }, 0) < SURGE_MIN_PR) return null;
    var best = { count: 0, start: null, end: null };
    for (var i = 0; i < ev.length; i++) {
      var c = 0, j = i;
      while (j < ev.length && daysBetween(ev[i].d, ev[j].d) <= SURGE_WIN) { c += ev[j].prCount; j++; }
      if (c > best.count) best = { count: c, start: ev[i].d, end: ev[j - 1].d };
    }
    if (best.count < SURGE_MIN_PR) return null;
    return { kind: 'surge', start: best.start, end: best.end, prCount: best.count };
  }

  // Longest run of consecutive training weeks (Mondays exactly 7d apart).
  function detectStreak(workouts) {
    var set = {}; workouts.forEach(function (w) { set[mondayOf(w.d)] = true; });
    var mons = Object.keys(set).sort(); if (!mons.length) return null;
    var bestLen = 0, bestStart = null, bestEnd = null, curLen = 1, curStart = mons[0];
    for (var i = 1; i < mons.length; i++) {
      if (daysBetween(mons[i - 1], mons[i]) === 7) curLen++;
      else { if (curLen > bestLen) { bestLen = curLen; bestStart = curStart; bestEnd = mons[i - 1]; } curLen = 1; curStart = mons[i]; }
    }
    if (curLen > bestLen) { bestLen = curLen; bestStart = curStart; bestEnd = mons[mons.length - 1]; }
    if (bestLen < STREAK_MIN) return null;
    return { kind: 'streak', start: bestStart, end: addDays(bestEnd, 6), weeks: bestLen };
  }

  // The biggest gap between sessions that was followed by a return.
  function detectReturn(workouts) {
    var ds = workouts.map(function (w) { return w.d; }).sort();
    var bestGap = 0, bestAt = null, before = null;
    for (var i = 1; i < ds.length; i++) { var g = daysBetween(ds[i - 1], ds[i]); if (g > bestGap) { bestGap = g; bestAt = ds[i]; before = ds[i - 1]; } }
    if (bestGap < GAP_MIN) return null;
    return { kind: 'return', start: bestAt, gap: bestGap, awayFrom: before };
  }

  // ── chapter builders (turn a detection into a narrated chapter) ──
  function weightSparkSlice(weights, start, end) {
    var s = weights.filter(function (p) { return p.d >= start && p.d <= end; });
    return s.length >= 2 ? s.map(function (p) { return { v: p.v }; }) : null;
  }
  function volSparkSlice(volWeeks, start, end) {
    var s = volWeeks.filter(function (w) { return w.dStart >= start && w.dStart <= end; });
    return s.length >= 1 ? s.map(function (w) { return { volume: w.volume, pr: w.pr }; }) : null;
  }

  function compute(override) {
    var D = override || readAll();
    var weights = normWeights(D.weights), workouts = normWorkouts(D.workouts), recovery = normRecovery(D.recovery);
    var gs = D.goalStreak, streakCount = (gs && typeof gs.count === 'number') ? gs.count : (typeof gs === 'number' ? gs : 0);
    var northStar = (D.northStar && typeof D.northStar === 'object' && D.northStar.statement) ? D.northStar : null;

    // earliest mark across all sources
    var firsts = [];
    if (weights.length) firsts.push(weights[0].d);
    if (workouts.length) firsts.push(workouts[0].d);
    if (recovery.length) firsts.push(recovery[0].d);
    firsts.sort();
    var first = firsts[0] || null;
    var today = todayKey();
    var daysTracked = first ? daysBetween(first, today) + 1 : 0;
    var totalEvents = weights.length + workouts.length + recovery.length;

    if (!first || daysTracked < 10 || totalEvents < 6) return { hasEnough: false, chapters: [], northStar: northStar };

    var volWeeks = weeklyVolume(workouts);
    var totalWorkouts = workouts.length;
    var totalPRs = workouts.reduce(function (s, w) { return s + w.prCount; }, 0);
    var mids = [];

    // Cut / Build phases
    detectWeightPhases(weights).forEach(function (p) {
      var net = r1(p.net), aw = r1(p.startW), bw = r1(p.endW);
      var isCut = p.kind === 'cut';
      mids.push({
        key: p.kind, color: COLOR[p.kind], start: p.start,
        title: isCut ? 'The Cut.' : 'The Build.',
        eyebrow: fmtShort(p.start) + ' – ' + fmtShort(p.end),
        body: isCut
          ? 'Over ' + p.weeks + ' weeks you got leaner — ' + aw + ' kg down to ' + bw + ' kg. The line bent on purpose.'
          : 'Over ' + p.weeks + ' weeks you added size — ' + aw + ' kg up to ' + bw + ' kg. Built, gram by gram.',
        stat: { value: (net > 0 ? '+' : '') + net + ' kg', label: 'over ' + p.weeks + ' weeks' },
        spark: (function () { var d = weightSparkSlice(weights, p.start, p.end); return d ? { kind: 'curve', rgb: COLOR[p.kind], data: d } : null; })(),
        score: Math.abs(p.net) * 2 + p.weeks * 0.3
      });
    });

    // The Surge
    var sg = detectSurge(workouts);
    if (sg) {
      var span = daysBetween(sg.start, sg.end) + 1;
      mids.push({
        key: 'surge', color: COLOR.surge, start: sg.start,
        title: 'The Surge.',
        eyebrow: fmtShort(sg.start) + ' – ' + fmtShort(sg.end),
        body: sg.prCount + ' personal records in ' + span + ' days. For a while there, the bar kept giving.',
        stat: { value: sg.prCount, label: 'PRs in ' + span + ' days' },
        spark: (function () { var d = volSparkSlice(volWeeks, sg.start, sg.end); return d ? { kind: 'bars', rgb: COLOR.surge, data: d } : null; })(),
        score: sg.prCount * 3
      });
    }

    // The Streak
    var st = detectStreak(workouts);
    if (st) {
      mids.push({
        key: 'streak', color: COLOR.streak, start: st.start,
        title: 'The Streak.',
        eyebrow: fmtShort(st.start) + ' – ' + fmtShort(st.end),
        body: st.weeks + ' straight weeks in the gym. No drama, no missed weeks — you just kept showing up.',
        stat: { value: st.weeks, label: 'weeks unbroken' },
        spark: (function () { var d = volSparkSlice(volWeeks, st.start, st.end); return d ? { kind: 'bars', rgb: COLOR.streak, data: d } : null; })(),
        score: st.weeks
      });
    }

    // The Return
    var rt = detectReturn(workouts);
    if (rt) {
      mids.push({
        key: 'return', color: COLOR.ret, start: rt.start,
        title: 'The Return.',
        eyebrow: fmtShort(rt.start),
        body: 'You stepped away for ' + rt.gap + ' days — then came back on ' + fmtShort(rt.start) + '. Coming back is the rep that counts most.',
        stat: { value: rt.gap, label: 'days away, then back' },
        spark: null,
        score: rt.gap * 0.2
      });
    }

    // sort chronologically, cap the middle to keep it a story (not a log)
    mids.sort(function (a, b) { return a.start.localeCompare(b.start); });
    if (mids.length > 4) {
      var top = mids.slice().sort(function (a, b) { return b.score - a.score; }).slice(0, 4);
      var keep = {}; top.forEach(function (m) { keep[m.key + m.start] = true; });
      mids = mids.filter(function (m) { return keep[m.key + m.start]; });
    }

    // Genesis (always first)
    var genesis = {
      key: 'genesis', color: COLOR.genesis, start: first,
      title: 'Day One.',
      eyebrow: fmtLong(first),
      body: 'It began on ' + fmtLong(first) + '. ' + (weights.length ? 'You stepped on the scale at ' + r1(weights[0].v) + ' kg — point one on a line you hadn’t drawn yet.' : 'The first mark on a line that’s still being drawn.'),
      stat: { value: daysTracked, label: 'days ago' },
      spark: null
    };

    // Now (always last) — trajectory, the open chapter
    var recent = weights.filter(function (p) { return daysBetween(p.d, today) <= 28; });
    var perWk = recent.length >= 3 ? (slopePerDay(recent) || 0) * 7 : 0;
    var traj;
    if (Math.abs(perWk) >= 0.1) traj = 'You’re trending ' + (perWk < 0 ? 'down' : 'up') + ' ~' + r1(Math.abs(perWk)) + ' kg a week right now.';
    else if (recent.length >= 3) traj = 'Right now you’re holding steady.';
    else traj = 'This chapter’s still blank — you’re writing it today.';
    var now = {
      key: 'now', color: COLOR.now, start: today,
      title: 'Now.',
      eyebrow: 'Today',
      body: traj + ' ' + totalWorkouts + ' sessions and ' + totalPRs + ' PRs deep — and the page is still open.',
      stat: { value: daysTracked, label: 'days in, still counting' },
      spark: null
    };

    var chapters = [genesis].concat(mids).concat([now]);
    chapters.forEach(function (c, i) { c.n = i + 1; });
    return { hasEnough: true, chapters: chapters, northStar: northStar };
  }

  window.ALSChapters = {
    compute: compute,
    // exposed for self-tests
    _: { detectWeightPhases: detectWeightPhases, detectSurge: detectSurge, detectStreak: detectStreak, detectReturn: detectReturn, weeklyAvg: weeklyAvg, isoWeek: isoWeek, daysBetween: daysBetween }
  };
})();
