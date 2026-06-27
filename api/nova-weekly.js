// ════════════════════════════════════════════════════════════════
// Nova — Frontier Weekly Deep Dive (Pillar 2 tail of the intelligence vision).
//
// Once a week, a TOP model (Claude Opus 4.8) reads Alex's full last-7-days of
// data and writes a genuinely smart weekly analysis — deeper than the on-device
// insight engine can. Budget-aware: the report is generated AT MOST ONCE per
// ISO week and cached in Supabase (row 'nova-weekly'). Repeat views read the
// cache (no model call); generation happens only on an explicit request.
//
//   GET  /api/nova-weekly            → peek: return the cached report (no call)
//   POST /api/nova-weekly[?force=1]  → generate this week's report (or return
//                                       the cached one unless force), then cache
//
// Raw HTTPS to the Anthropic Messages API (the repo has no Anthropic SDK; every
// api/* function uses fetch, mirroring api/nova-chat.js). Non-streaming: output
// is bounded (~1.5K tokens) and the per-function maxDuration is raised to 60s in
// vercel.json. Needs ANTHROPIC_API_KEY in Vercel; degrades gracefully without it.
// ════════════════════════════════════════════════════════════════
'use strict';
var supa = require('./_supa');
var auth = require('./_auth');

var ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
// Default to the most capable model — this is the one premium call per week.
// Overridable via env if Alex wants to trade cost for a lighter model.
var MODEL = (process.env.ANTHROPIC_MODEL || 'claude-opus-4-8').trim();
var ROW = 'nova-weekly';

// ── date / week helpers (tz-aware) ──────────────────────────────
function pad(n) { return n < 10 ? '0' + n : '' + n; }
function localDateKey(tz) {
  try {
    var p = {};
    new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' })
      .formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
    return p.year + '-' + p.month + '-' + p.day;
  } catch (e) { var d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
}
function tsToDateKey(ts, tz) {
  try { return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(ts)); }
  catch (e) { var d = new Date(ts); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
}
function dParse(dk) { return new Date(dk + 'T00:00:00'); }
function addDays(dk, n) { var d = dParse(dk); d.setDate(d.getDate() + n); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
function daysBetween(a, b) { return Math.round((dParse(b) - dParse(a)) / 86400000); }
// ISO week key, matching the client engines (arc/insights) so keys align.
function isoWeek(dk) {
  var d = dParse(dk); var day = (d.getDay() + 6) % 7; var x = new Date(d); x.setDate(d.getDate() - day + 3);
  var f = new Date(x.getFullYear(), 0, 4); var w = 1 + Math.round(((x - f) / 86400000 - 3 + ((f.getDay() + 6) % 7)) / 7);
  return x.getFullYear() + '-W' + pad(w);
}
function r1(n) { return Math.round((n || 0) * 10) / 10; }
function avg(a) { return a.length ? a.reduce(function (s, v) { return s + v; }, 0) / a.length : null; }
var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function fmtShort(dk) { var d = dParse(dk); return MON[d.getMonth()] + ' ' + d.getDate(); }

// ── build the compact 7-day brief that grounds the deep dive ────
async function buildWeeklyBrief(tz) {
  var today = localDateKey(tz);
  var start = addDays(today, -6);              // 7-day window inclusive
  function inWin(dk) { return dk && dk >= start && dk <= today; }

  var rows = await Promise.all([
    supa.readRow('po-coach'), supa.readRow('sleep'), supa.readRow('nutrition'),
    supa.readRow('caffeine'), supa.readRow('identity'), supa.readRow('goals'), supa.readRow('health')
  ]);
  var poc = rows[0], slp = rows[1], nut = rows[2], caf = rows[3], idn = rows[4], gls = rows[5], hlt = rows[6];

  var L = [];
  L.push('ALEX — weekly data, ' + fmtShort(start) + ' to ' + fmtShort(today) + ' (his timezone).');

  // Weight
  var units = (poc['po_coach_v1'] || {}).units || 'kg';
  var weights = (poc['po_coach_weights'] || []).filter(function (e) { return e && e.dateKey && typeof e.weight === 'number'; })
    .sort(function (a, b) { return a.dateKey < b.dateKey ? -1 : 1; });
  var weightKg = weights.length ? weights[weights.length - 1].weight : 75;
  if (weights.length) {
    var inW = weights.filter(function (e) { return inWin(e.dateKey); });
    var last = weights[weights.length - 1];
    var base = weights[0]; for (var i = 0; i < weights.length; i++) { if (weights[i].dateKey < start) base = weights[i]; }
    var dl = r1(last.weight - base.weight);
    L.push('Weight: now ' + last.weight + units + ' (last ' + last.dateKey + '); ' + (dl <= 0 ? 'down ' + Math.abs(dl) : 'up ' + dl) + units + ' over the week; ' + inW.length + ' weigh-in' + (inW.length === 1 ? '' : 's') + ' this week.');
    if (inW.length > 1) L.push('  weigh-ins (MM-DD:' + units + '): ' + inW.map(function (w) { return w.dateKey.slice(5) + ':' + w.weight; }).join(', ') + '. (Day-to-day is mostly water; judge by the multi-day trend.)');
  } else L.push('Weight: none logged.');

  // Training
  var exMap = {}; (poc['po_exercises'] || []).forEach(function (e) { if (e) exMap[e.id] = e; });
  var workouts = (poc['po_workouts'] || []).filter(function (w) { return w && w.date && inWin(w.date); }).sort(function (a, b) { return a.date < b.date ? -1 : 1; });
  if (workouts.length) {
    var vol = 0, prNames = [], muscleSets = {};
    workouts.forEach(function (w) {
      vol += (+w.volume || 0);
      (w.prs || []).forEach(function (id) { var n = (exMap[id] || {}).name || id; if (prNames.indexOf(n) < 0) prNames.push(n); });
      (w.entries || []).forEach(function (en) { if (en && en.muscle) muscleSets[en.muscle] = (muscleSets[en.muscle] || 0) + ((en.sets || []).length); });
    });
    L.push('Training: ' + workouts.length + ' session' + (workouts.length === 1 ? '' : 's') + ' this week; total volume ' + Math.round(vol).toLocaleString('en-US') + units + (prNames.length ? '; PRs: ' + prNames.slice(0, 6).join(', ') : '; no PRs') + '.');
    var splitArr = Object.keys(muscleSets).sort(function (a, b) { return muscleSets[b] - muscleSets[a]; }).map(function (m) { return m + ' ' + muscleSets[m]; });
    if (splitArr.length) L.push('  weekly working sets/muscle: ' + splitArr.join(', ') + '. Rough weekly targets: Chest 14, Back 16, Shoulders 12, Arms 12, Legs 18, Core 9 — flag anything well under.');
  } else L.push('Training: no workouts logged this week.');

  // Sleep & recovery
  var sleepLogs = (slp['sleep:logs'] || []).filter(function (e) { return e && e.dateKey && inWin(e.dateKey); }).sort(function (a, b) { return a.dateKey < b.dateKey ? -1 : 1; });
  var hrs = sleepLogs.filter(function (e) { return e.hours > 0; }).map(function (e) { return e.hours; });
  var recs = sleepLogs.filter(function (e) { return e.recovery != null; }).map(function (e) { return e.recovery; });
  if (hrs.length || recs.length) {
    L.push('Sleep: avg ' + (hrs.length ? r1(avg(hrs)) + 'h over ' + hrs.length + ' night' + (hrs.length === 1 ? '' : 's') : 'n/a') +
      (recs.length ? '; avg recovery ' + Math.round(avg(recs)) + '/100 (range ' + Math.min.apply(null, recs) + '–' + Math.max.apply(null, recs) + ')' : '') + '. Nights logged: ' + hrs.length + '/7.');
    if (sleepLogs.length) L.push('  by night (MM-DD h/rec): ' + sleepLogs.map(function (e) { return e.dateKey.slice(5) + ' ' + (e.hours > 0 ? r1(e.hours) + 'h' : '–') + (e.recovery != null ? '/' + e.recovery : ''); }).join(', ') + '.');
  } else L.push('Sleep: nothing logged this week (his #1 untracked lever).');

  // Nutrition (per-day rollup)
  var nGoal = ((nut['nut:profile'] || {}).goal) || 'maintain';
  var protTarget = (nut['nut:profile'] || {}).proteinTarget || Math.round(weightKg * (nGoal === 'cut' ? 2.2 : (nGoal === 'bulk' ? 1.8 : 2.0)));
  var calTarget = (nut['nut:profile'] || {}).calTarget || Math.round(weightKg * 32);
  var byDay = {};
  (nut['nut:logs'] || []).forEach(function (l) {
    if (!l) return; var dk = l.dateKey || (l.ts ? tsToDateKey(l.ts, tz) : null);
    if (!inWin(dk)) return;
    var d = byDay[dk] || (byDay[dk] = { kcal: 0, p: 0, items: 0 });
    d.kcal += (l.kcal || 0); d.p += (l.p || 0); d.items++;
  });
  var dayKeys = Object.keys(byDay).filter(function (k) { return byDay[k].items > 0; }).sort();
  if (dayKeys.length) {
    var kArr = dayKeys.map(function (k) { return byDay[k].kcal; }), pArr = dayKeys.map(function (k) { return byDay[k].p; });
    var onTarget = dayKeys.filter(function (k) { return Math.abs(byDay[k].kcal / calTarget - 1) <= 0.1; }).length;
    L.push('Nutrition: ' + dayKeys.length + '/7 days logged; avg ' + Math.round(avg(kArr)) + ' kcal/day (target ' + calTarget + ', goal ' + nGoal + '), avg ' + Math.round(avg(pArr)) + 'g protein/day (target ' + protTarget + '); ' + onTarget + '/' + dayKeys.length + ' logged days within 10% of calorie target.');
    L.push('  per day (MM-DD kcal/protein): ' + dayKeys.map(function (k) { return k.slice(5) + ' ' + Math.round(byDay[k].kcal) + '/' + Math.round(byDay[k].p) + 'g'; }).join(', ') + '.');
  } else L.push('Nutrition: nothing logged this week.');

  // Adaptive TDEE (learned maintenance) — same engine the app uses
  try {
    var TDEE = require('../tdee.js');
    var todayNum = Math.floor(Date.parse(today + 'T00:00:00Z') / 86400000);
    var tres = TDEE.compute(nut['nut:logs'] || [], weights || [], { weightKg: weightKg, todayNum: todayNum });
    if (tres && tres.ok) L.push('Adaptive energy: learned maintenance ≈ ' + tres.tdee + ' kcal (weight trend ' + (tres.weeklyWeightChange > 0 ? '+' : '') + tres.weeklyWeightChange + ' kg/wk). Goal ' + nGoal + ' → recommended ~' + TDEE.recommend(tres.tdee, nGoal, { weightKg: weightKg }) + ' kcal/day.');
  } catch (e) {}

  // Caffeine
  var cafByDay = {}, lateDoses = 0;
  (caf['caf:logs'] || []).forEach(function (l) {
    if (!l || !l.ts) return; var dk = tsToDateKey(l.ts, tz); if (!inWin(dk)) return;
    cafByDay[dk] = (cafByDay[dk] || 0) + (l.mg || 0);
    try { var hr = parseInt(new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', hour12: false }).format(new Date(l.ts)), 10); if (hr >= 16) lateDoses++; } catch (e2) {}
  });
  var cafDays = Object.keys(cafByDay);
  if (cafDays.length) L.push('Caffeine: avg ' + Math.round(avg(cafDays.map(function (k) { return cafByDay[k]; }))) + 'mg/day' + (lateDoses ? '; ' + lateDoses + ' dose(s) after 4pm this week (can blunt sleep — ~5–6h half-life)' : '') + '. (Sensible ceiling ~400mg/day.)');

  // Habits & goals consistency
  var hbList = idn['habits:list'] || [], hbLog = idn['habits:log'] || {};
  if (hbList.length) {
    var hbDays = 0, hbDone = 0;
    for (var d2 = 0; d2 < 7; d2++) { var k = addDays(start, d2); var day = hbLog[k]; if (day && Object.keys(day).length) { hbDays++; hbDone += Object.keys(day).length; } }
    L.push('Habits: active ' + hbDays + '/7 days, ' + hbDone + ' total completions across ' + hbList.length + ' tracked habit(s).');
  }
  var goalDays = 0, goalSet = 0;
  for (var d3 = 0; d3 < 7; d3++) { var gk = addDays(start, d3); var g = gls['goals:' + gk]; if (Array.isArray(g) && g.length) { goalSet++; if (g.every(function (x) { return x && x.done; })) goalDays++; } }
  if (goalSet) L.push('Daily goals: fully completed ' + goalDays + '/' + goalSet + ' of the days he set goals.');

  // North Star — anchor the narrative
  var ns = idn['identity:northstar'] || {};
  if (ns && ns.statement) L.push('His North Star: "' + ns.statement + '".' + (ns.why ? ' Why: ' + ns.why : ''));

  return L.join('\n');
}

function systemPrompt() {
  return [
    "You are Nova — Alex's personal AI coach, writing his WEEKLY DEEP DIVE. Alex is 17, doing a body recomposition (build strength + muscle while leaning out). Once a week you get his full last-7-days of data and write the one analysis no quick chatbot could: you connect the dots across training, sleep, recovery, nutrition, caffeine, weight and habits, and you tell him the truth about his week.",
    '',
    'WRITE:',
    '• Open with one or two sentences naming the headline of the week — what actually defined it.',
    '• Then the CROSS-DOMAIN READ: the patterns that only show up when you look across domains together (e.g. recovery vs prior-day training volume, sleep vs late caffeine, protein/calorie trend vs the scale, which muscles are under their weekly target). Use his real numbers. This is the whole point — surface links he would not notice himself.',
    '• What clearly WORKED this week (name it, with the number), and the single biggest leak.',
    '• End with "Next week — one focus": the single highest-leverage change, concrete and measurable. Just one.',
    '',
    'VOICE: warm, sharp, direct — a trusted older brother who is an elite coach. Honest, never flattering; celebrate real wins, call out drift without lecturing. ~350–550 words. Plain prose with at most a couple of short bold sub-labels; no big markdown headers, no bullet dumps unless it genuinely helps. Talk like a person.',
    '',
    "RULES: Ground EVERY claim in the data below — never invent a number. If something is not logged, say so plainly and tell him to track it (you can't coach blind). He's 17 — keep advice safe and sane: no extreme cuts, no aggressive deficits, no hormones/PEDs; supplements stay sensible. Tie the week back to his North Star if he's set one. Address him as 'you'."
  ].join('\n');
}

function sendJSON(res, obj) {
  try { res.statusCode = 200; res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.end(JSON.stringify(obj)); }
  catch (e) { try { res.end(); } catch (_) {} }
}

module.exports = async function (req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET' && req.method !== 'POST') { res.statusCode = 405; res.end('GET or POST only'); return; }
  if (!auth.guard(req, res, { name: 'nova-weekly', rateMax: 20 })) return;

  var tz = 'Europe/Athens';
  try { var prefs = await supa.readRow('push:prefs'); if (prefs && prefs.tz) tz = prefs.tz; } catch (e) {}
  var week = isoWeek(localDateKey(tz));

  var store = await supa.readRow(ROW);
  var weeks = (store && store.weeks && typeof store.weeks === 'object') ? store.weeks : {};

  // ── GET = peek: return the cached report, never call the model ──
  if (req.method === 'GET') {
    var pickKey = weeks[week] ? week : (store.latest && weeks[store.latest] ? store.latest : null);
    var e = pickKey ? weeks[pickKey] : null;
    sendJSON(res, { exists: !!e, current: week, week: pickKey || week, isCurrent: pickKey === week,
      text: e ? e.text : '', generatedAt: e ? e.generatedAt : null, model: e ? e.model : null });
    return;
  }

  // ── POST = generate (or return this week's cached report) ──
  var force = /[?&]force=1\b/.test(req.url || '');
  if (weeks[week] && !force) {
    sendJSON(res, { cached: true, week: week, text: weeks[week].text, generatedAt: weeks[week].generatedAt, model: weeks[week].model });
    return;
  }

  var key = (process.env.ANTHROPIC_API_KEY || '').trim();
  if (!key) {
    sendJSON(res, { error: 'no-key', text: "Nova's frontier brain isn't connected yet — add an ANTHROPIC_API_KEY in Vercel and redeploy, then I can write your weekly deep dive. (See NOVA_SETUP.md.)" });
    return;
  }

  var brief;
  try { brief = await buildWeeklyBrief(tz); } catch (e) { brief = '(weekly data temporarily unavailable)'; }

  var payload = {
    model: MODEL,
    max_tokens: 2000,
    system: systemPrompt(),
    messages: [{ role: 'user', content: 'Here is my last 7 days. Write my weekly deep dive.\n\n' + brief }]
  };

  var up;
  try {
    up = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (e) {
    sendJSON(res, { error: 'unreachable', text: "I couldn't reach the frontier model just now — check back in a moment." });
    return;
  }

  if (!up.ok) {
    var detail = '';
    try { var j = await up.json(); detail = (j && j.error && j.error.message) || ''; } catch (e3) {}
    sendJSON(res, { error: 'api', text: 'Nova hit a snag writing the deep dive (' + up.status + (detail ? ': ' + detail : '') + '). Try again in a moment.' });
    return;
  }

  var data; try { data = await up.json(); } catch (e) { data = null; }
  var text = '';
  if (data && Array.isArray(data.content)) data.content.forEach(function (b) { if (b && b.type === 'text' && typeof b.text === 'string') text += b.text; });
  text = text.trim();
  if (!text) { sendJSON(res, { error: 'empty', text: 'Nova came back empty — try again.' }); return; }

  var generatedAt = new Date().toISOString();
  weeks[week] = { text: text, generatedAt: generatedAt, model: (data && data.model) || MODEL };
  // keep the last ~8 weeks so the row can't grow unbounded
  var ks = Object.keys(weeks).sort(); while (ks.length > 8) { delete weeks[ks.shift()]; }
  try { await supa.writeRow(ROW, { weeks: weeks, latest: week }); } catch (e) {}

  sendJSON(res, { week: week, text: text, generatedAt: generatedAt, model: weeks[week].model, fresh: true });
};
