// ════════════════════════════════════════════════════════════════
// Conversational Nova — the crown jewel (free brain: Groq / Llama).
// A streaming proxy to the Groq API. The API key stays server-side.
// On every turn Nova is grounded in the SIGNED-IN CALLER's real, up-to-the-minute
// data (read from Supabase via _supa.js, scoped to their verified uid) so she
// answers like a coach who actually knows them — and never shows one account
// another account's life. Streams the model's response straight to the browser
// as plain text. Provider-agnostic by design — the data brief + persona
// below would work behind any model; only the call section is provider-specific.
// ════════════════════════════════════════════════════════════════
'use strict';
var supa = require('./_supa');
var auth = require('./_auth');

// Groq: free API, fast, available worldwide (incl. the EEA/Greece, where
// Gemini's free tier is not offered — limit:0). OpenAI-compatible API.
var GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
var GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

function pad(n) { return n < 10 ? '0' + n : '' + n; }
function localParts(tz) {
  try {
    var p = {};
    new Intl.DateTimeFormat('en-CA', { timeZone: tz, weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hour12: false })
      .formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
    return { dateKey: p.year + '-' + p.month + '-' + p.day, hour: parseInt(p.hour, 10) % 24, weekday: p.weekday };
  } catch (e) {
    var d = new Date();
    return { dateKey: d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()), hour: d.getHours(), weekday: '' };
  }
}
function tsToDateKey(ts, tz) {
  try { return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(ts)); }
  catch (e) { var d = new Date(ts); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
}
function daysBetween(a, b) { var x = a.split('-').map(Number), y = b.split('-').map(Number); return Math.round((Date.UTC(x[0], x[1] - 1, x[2]) - Date.UTC(y[0], y[1] - 1, y[2])) / 86400000); }
function avg(a) { return a.length ? a.reduce(function (s, v) { return s + v; }, 0) / a.length : null; }
function r1(n) { return Math.round(n * 10) / 10; }
function dayLbl(dk) { var p = dk.split('-').map(Number); var dt = new Date(Date.UTC(p[0], p[1] - 1, p[2])); return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dt.getUTCDay()] + ' ' + p[2]; }

// Build the compact, factual brief that grounds Nova in the CALLER's life
// today. `who` is the verified uid of whoever is signed in — never the owner,
// or Nova would coach Chrissie using Alex's numbers.
async function buildBrief(tz, who) {
  var lp = localParts(tz);
  var today = lp.dateKey;
  var rows = await Promise.all([
    supa.readRow('po-coach', who), supa.readRow('nutrition', who), supa.readRow('caffeine', who),
    supa.readRow('identity', who), supa.readRow('health', who), supa.readRow('sleep', who),
    supa.readRow('goals', who), supa.readRow('ideas', who), supa.readRow('profile', who)
  ]);
  var poc = rows[0], nut = rows[1], caf = rows[2], idn = rows[3], hlt = rows[4], slp = rows[5], gls = rows[6], ide = rows[7];
  var prof = (rows[8] && rows[8]['als:profile']) || {};
  var who_name = (prof.name || '').trim() || 'They';
  var who_age = prof.birthYear ? (new Date().getFullYear() - prof.birthYear) : null;
  var L = [];
  L.push(who_name.toUpperCase() + ' — live snapshot, ' + lp.weekday + ' ' + today + ' (their local time, hour ' + lp.hour + ').');
  L.push('WHO: ' + who_name + (who_age ? ', ' + who_age : '') + (prof.sex ? ', ' + (prof.sex === 'f' ? 'female' : 'male') : '') +
         (prof.sport ? ', trains mainly as a ' + prof.sport : '') + (prof.goal ? '. Their stated goal: ' + prof.goal : '') + '.');

  var weights = (poc['po_coach_weights'] || []).filter(function (e) { return e && e.dateKey && typeof e.weight === 'number'; })
    .sort(function (a, b) { return a.dateKey < b.dateKey ? -1 : 1; });
  var units = (poc['po_coach_v1'] || {}).units || 'kg';
  if (weights.length) {
    var last = weights[weights.length - 1];
    var cutoff = tsToDateKey(Date.now() - 7 * 86400000, tz), base = weights[0];
    for (var i = 0; i < weights.length; i++) { if (weights[i].dateKey <= cutoff) base = weights[i]; }
    var dl = r1(last.weight - base.weight);
    L.push('Weight: ' + last.weight + units + ' (last logged ' + last.dateKey + '), ' + (dl <= 0 ? 'down ' + Math.abs(dl) : 'up ' + dl) + units + ' over ~7 days. Weighed in today: ' + (last.dateKey === today ? 'yes' : 'NO'));
    if (weights.length > 1) {
      var wser = weights.slice(-14).map(function (w) { return w.dateKey.slice(5) + ':' + w.weight; });
      L.push('Weight series (oldest→newest, MM-DD:' + units + '): ' + wser.join(', ') + '. Daily swings are mostly water — judge real change by the multi-day trend, not a single day.');
    }
  } else L.push('Weight: none logged yet.');

  var exMap = {}; (poc['po_exercises'] || []).forEach(function (e) { if (e) exMap[e.id] = e; });
  var workouts = (poc['po_workouts'] || []).filter(function (w) { return w && w.date; }).sort(function (a, b) { return a.date < b.date ? -1 : 1; });
  if (workouts.length) {
    var lastW = workouts[workouts.length - 1];
    var since = daysBetween(today, lastW.date);
    var weekCut = tsToDateKey(Date.now() - 7 * 86400000, tz);
    var wkSessions = workouts.filter(function (w) { return w.date > weekCut; }).length;
    var recentPRs = [];
    workouts.filter(function (w) { return w.date > weekCut && w.prs && w.prs.length; }).forEach(function (w) {
      w.prs.forEach(function (id) { var n = (exMap[id] || {}).name || id; if (recentPRs.indexOf(n) < 0) recentPRs.push(n); });
    });
    L.push('Training: ' + wkSessions + ' session' + (wkSessions === 1 ? '' : 's') + ' in last 7 days; last workout ' + (since === 0 ? 'today' : since + ' day' + (since === 1 ? '' : 's') + ' ago') + (recentPRs.length ? '; recent PRs: ' + recentPRs.slice(0, 4).join(', ') : '') + '.');
    // Weekly volume per muscle (working sets) — the lever for his recomp.
    var muscleSets = {};
    workouts.filter(function (w) { return w.date > weekCut; }).forEach(function (w) {
      (w.entries || []).forEach(function (en) { if (en && en.muscle) muscleSets[en.muscle] = (muscleSets[en.muscle] || 0) + ((en.sets || []).length); });
    });
    var splitArr = Object.keys(muscleSets).sort(function (a, b) { return muscleSets[b] - muscleSets[a]; }).map(function (m) { return m + ' ' + muscleSets[m]; });
    if (splitArr.length) L.push('Weekly volume (working sets/muscle): ' + splitArr.join(', ') + '. Rough weekly targets: Chest 14, Back 16, Shoulders 12, Arms 12, Legs 18, Core 9 — flag any muscle well under.');
  } else L.push('Training: no workouts logged yet.');

  var sleepLogs = (slp['sleep:logs'] || []).filter(function (e) { return e && e.dateKey; }).sort(function (a, b) { return a.dateKey < b.dateKey ? -1 : 1; });
  if (sleepLogs.length) {
    var lastN = sleepLogs.filter(function (e) { return e.hours > 0; }).slice(-1)[0];
    var rcut = tsToDateKey(Date.now() - 7 * 86400000, tz);
    var recVals = sleepLogs.filter(function (e) { return e.dateKey > rcut && e.recovery != null; }).map(function (e) { return e.recovery; });
    var avgRec = avg(recVals);
    var todayS = sleepLogs.filter(function (e) { return e.dateKey === today; })[0];
    L.push('Sleep: ' + (lastN ? 'last night ' + r1(lastN.hours) + 'h' + (lastN.quality ? ' (quality ' + lastN.quality + '/5)' : '') : 'last night not logged') +
      (todayS && todayS.recovery != null ? '; today recovery ' + todayS.recovery + '/100' : '') +
      (avgRec != null ? '; 7-day avg recovery ' + Math.round(avgRec) + '/100' : '') + '.');
  } else L.push('Sleep: nothing logged yet (their #1 untracked lever).');

  var weightKg = (((hlt['po_water_v1'] || {}).profile) || {}).weightKg || (weights.length ? weights[weights.length - 1].weight : 75);
  var nGoal = ((nut['nut:profile'] || {}).goal) || 'maintain';
  var protTarget = (nut['nut:profile'] || {}).proteinTarget || Math.round(weightKg * (nGoal === 'cut' ? 2.2 : (nGoal === 'bulk' ? 1.8 : 2.0)));
  var dailyTarget = (nut['nut:profile'] || {}).calTarget || Math.round(weightKg * 32); // refined by the stats formula below
  var fiberTarget = Math.round(dailyTarget / 1000 * 14);
  // Per-day nutrition from ALL logs → real history (today, yesterday, this week),
  // not just a today snapshot. Match by dateKey, fall back to ts.
  var nutByDay = {};
  (nut['nut:logs'] || []).forEach(function (l) {
    if (!l) return;
    var dkk = l.dateKey || (l.ts ? tsToDateKey(l.ts, tz) : null);
    if (!dkk) return;
    var d = nutByDay[dkk] || (nutByDay[dkk] = { kcal: 0, p: 0, c: 0, f: 0, fiber: 0, sodium: 0, sugar: 0, items: 0, byMeal: {} });
    d.kcal += (l.kcal || 0); d.p += (l.p || 0); d.c += (l.c || 0); d.f += (l.f || 0); d.fiber += (l.fiber || 0); d.sodium += (l.sodium || 0); d.sugar += (l.sugar || 0); d.items++;
    var m = l.meal || 'Other'; if (!d.byMeal[m]) d.byMeal[m] = [];
    d.byMeal[m].push((l.name || 'food') + ' ' + Math.round(l.grams || 0) + 'g (' + Math.round(l.kcal || 0) + 'kcal/' + Math.round(l.p || 0) + 'p)');
  });
  var todayN = nutByDay[today] || { kcal: 0, p: 0, c: 0, f: 0, fiber: 0, sodium: 0, items: 0, byMeal: {} };
  var prot = todayN.p, kcal = todayN.kcal, carb = todayN.c, fat = todayN.f, fiber = todayN.fiber, items = todayN.items;
  L.push('Nutrition today: ' + Math.round(kcal) + ' kcal, ' + Math.round(prot) + 'g protein (target ~' + protTarget + 'g), ' + Math.round(carb) + 'g carbs, ' + Math.round(fat) + 'g fat, ' + Math.round(fiber) + 'g fiber, ' + Math.round(todayN.sodium) + 'mg sodium, ' + items + ' items.');
  if (items) {
    var lines = []; Object.keys(todayN.byMeal).forEach(function (m) { lines.push(m + ': ' + todayN.byMeal[m].slice(0, 12).join(', ')); });
    L.push('What he actually ate today — ' + lines.join(' | ') + '.');
  } else L.push('Nothing logged yet today.');

  // Energy target — Mifflin-St Jeor × activity from his stats (adaptive
  // intake-based TDEE removed by request: logged intake isn't always
  // accurate, so the stats formula is the single source of truth).
  try {
    var nProf = nut['nut:profile'] || {};
    if (!nProf.calTarget) {
      var nAge = +nProf.age, nCm = +nProf.heightCm;
      if (nAge > 0 && nCm > 0) {
        var nBmr = 10 * weightKg + 6.25 * nCm - 5 * nAge + (nProf.sex === 'female' ? -161 : 5);
        var nAct = { sedentary: 1.2, light: 1.375, moderate: 1.55, very: 1.725, athlete: 1.9 }[nProf.activity] || 1.55;
        var nMaint = Math.round(nBmr * nAct);
        var TDEE = require('../tdee.js');
        dailyTarget = TDEE.recommend(nMaint, nGoal, { weightKg: weightKg, rateKgPerWeek: nProf.rateKgPerWeek });
        fiberTarget = Math.round(dailyTarget / 1000 * 14);
        L.push('Energy: maintenance ≈ ' + nMaint + ' kcal (Mifflin-St Jeor × activity from their stats). Goal ' + nGoal + ' → target ~' + dailyTarget + ' kcal/day. Use these numbers when advising on calories.');
      } else {
        L.push('Energy: using ~' + dailyTarget + ' kcal as a rough working target (no stats set). Goal: ' + nGoal + '.');
      }
    } else {
      L.push('Energy: they have set their OWN target of ' + dailyTarget + ' kcal/day (goal ' + nGoal + ') — respect it when advising.');
    }
  } catch (e) {}

  // Where he stands vs today's targets right now + a 0–100 day score.
  if (items) {
    var remK = dailyTarget - kcal, remP = protTarget - prot;
    var dd = Math.abs(kcal / dailyTarget - 1);
    var calSc = dd <= 0.05 ? 100 : Math.max(0, 100 - (dd - 0.05) * 250);
    var protSc = protTarget ? Math.min(100, prot / protTarget * 100) : 100;
    var fibSc = fiberTarget ? Math.min(100, fiber / fiberTarget * 100) : 100;
    var dayScore = Math.max(0, Math.min(100, Math.round(calSc * 0.45 + protSc * 0.4 + fibSc * 0.15)));
    L.push('Vs today\'s targets: ' + (remK >= 0 ? remK + ' kcal left' : Math.abs(remK) + ' kcal OVER') + ', ' + (remP > 0 ? remP + 'g protein still to hit' : 'protein hit') + '. Day score so far: ' + dayScore + '/100.');
  }

  // Yesterday in full + the last week of intake — this is what lets Nova explain
  // weight changes and trends instead of being blind to the past.
  var yKey = tsToDateKey(Date.now() - 86400000, tz), yRec = nutByDay[yKey];
  if (yRec && yRec.items) {
    var ylines = []; Object.keys(yRec.byMeal).forEach(function (m) { ylines.push(m + ': ' + yRec.byMeal[m].slice(0, 14).join(', ')); });
    L.push('YESTERDAY (' + yKey + '): ' + Math.round(yRec.kcal) + ' kcal, ' + Math.round(yRec.p) + 'g protein, ' + Math.round(yRec.c) + 'g carbs, ' + Math.round(yRec.f) + 'g fat, ' + Math.round(yRec.sodium) + 'mg sodium. Foods — ' + ylines.join(' | ') + '.');
  } else L.push('Yesterday (' + yKey + '): no food logged.');
  var recentLines = [], kArr = [], pArr = [];
  for (var dd = 1; dd <= 7; dd++) {
    var rk = tsToDateKey(Date.now() - dd * 86400000, tz), rr = nutByDay[rk];
    if (rr && rr.items) { recentLines.push('  ' + dayLbl(rk) + ': ' + Math.round(rr.kcal) + ' kcal / ' + Math.round(rr.p) + 'g P / ' + Math.round(rr.c) + 'g C / ' + Math.round(rr.sodium) + 'mg Na'); kArr.push(rr.kcal); pArr.push(rr.p); }
  }
  if (recentLines.length) {
    L.push('Daily intake, last 7 days (most recent first):\n' + recentLines.join('\n'));
    L.push('7-day average: ' + Math.round(avg(kArr)) + ' kcal, ' + Math.round(avg(pArr)) + 'g protein (over ' + recentLines.length + ' logged day' + (recentLines.length === 1 ? '' : 's') + ').');
  }

  var cafToday = 0, lastCafTs = 0;
  (caf['caf:logs'] || []).forEach(function (l) { if (l && l.ts && tsToDateKey(l.ts, tz) === today) { cafToday += (l.mg || 0); if (l.ts > lastCafTs) lastCafTs = l.ts; } });
  var cafLine = 'Caffeine today: ' + Math.round(cafToday) + 'mg (sensible daily ceiling ~400mg).';
  if (lastCafTs) {
    var ct = new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(lastCafTs));
    cafLine += ' Last dose ' + ct + (parseInt(ct.slice(0, 2), 10) >= 16 ? ' — that\'s late; caffeine has a ~5–6h half-life and can blunt tonight\'s sleep.' : '.');
  }
  L.push(cafLine);

  var water = hlt['po_water_v1'] || {}; var wlogs = (water.logs && typeof water.logs === 'object') ? water.logs : {};
  var bottleMl = water.bottleMl || 500, wTarget = Math.max(1, Math.ceil(weightKg * 35 / bottleMl)), wDone = wlogs[today] || 0;
  L.push('Water today: ' + wDone + '/' + wTarget + ' servings (~' + Math.round(wDone * bottleMl / 1000 * 10) / 10 + 'L of ~' + Math.round(wTarget * bottleMl / 1000 * 10) / 10 + 'L target).');

  // Supplement stack — what's done vs still pending today (daily ones only).
  var stack = hlt['stack:items'] || [], takenToday = hlt['stack:taken:' + today] || {};
  if (Array.isArray(stack) && stack.length) {
    var dailySupps = stack.filter(function (s) { return s && s.ordered !== false && s.window !== 'occasional'; });
    var suppTaken = dailySupps.filter(function (s) { return takenToday[s.id]; }).length;
    var suppMissing = dailySupps.filter(function (s) { return !takenToday[s.id]; }).map(function (s) { return String(s.name || '').split(' (')[0]; });
    L.push('Supplements: ' + suppTaken + '/' + dailySupps.length + ' daily taken' + (suppMissing.length ? '; still to take: ' + suppMissing.slice(0, 8).join(', ') : ' — full stack done') + '.');
  }

  var hbList = idn['habits:list'] || [], hbLog = idn['habits:log'] || {};
  if (hbList.length) {
    var hbToday = hbLog[today] || {}, done = hbList.filter(function (h) { return h && hbToday[h.id]; }).length;
    var streaks = [];
    hbList.forEach(function (h) {
      if (!h) return; var s = 0, c = new Date();
      var k0 = tsToDateKey(c.getTime(), tz);
      if (!(hbLog[k0] && hbLog[k0][h.id])) c = new Date(c.getTime() - 86400000);
      while (true) { var k = tsToDateKey(c.getTime(), tz); if (hbLog[k] && hbLog[k][h.id]) { s++; c = new Date(c.getTime() - 86400000); } else break; }
      if (s > 0) streaks.push(h.name + ' ' + s + 'd');
    });
    streaks.sort(function (a, b) { return parseInt(b.split(' ').pop()) - parseInt(a.split(' ').pop()); });
    L.push('Habits: ' + done + '/' + hbList.length + ' done today' + (streaks.length ? '; streaks: ' + streaks.slice(0, 4).join(', ') : '') + '.');
  }
  var jToday = (idn['journal:entries'] || []).filter(function (e) { return e && e.dateKey === today; })[0];
  L.push('Journaled today: ' + (jToday && (((jToday.reflection || '').trim()) || ((jToday.gratitude || '').trim())) ? 'yes' : 'no') + '.');
  var ns = idn['identity:northstar'] || {};
  if (ns && ns.statement) L.push('His North Star: "' + ns.statement + '".');

  var goals = gls['goals:' + today] || [];
  if (Array.isArray(goals) && goals.length) {
    var gdone = goals.filter(function (g) { return g && g.done; }).length;
    L.push("Today's goals: " + gdone + '/' + goals.length + ' done' + (gdone < goals.length ? ' — open: ' + goals.filter(function (g) { return g && !g.done; }).map(function (g) { return g.text || g.title; }).filter(Boolean).slice(0, 4).join('; ') : '') + '.');
  }

  var ideas = (ide['ideas:items'] || []).filter(Boolean);
  if (ideas.length) {
    var ideasOpen = ideas.filter(function (i) { return !i.done; }).length;
    L.push('Ideas backlog: ' + ideasOpen + ' open of ' + ideas.length + '.');
  }

  return L.join('\n');
}

// `person` = the CALLER (name/age/sex/sport/goal from their profile row).
// Nova used to be written entirely around Alex — 17, body recomp, "he", "his".
// Two people use this app now and more may follow, so the coach adapts to who
// is actually talking to it. Second person throughout; no assumed pronouns.
function systemPrompt(brief, patterns, memory, person) {
  var p = person || {};
  var nm = (p.name || '').trim();
  var whoLine = nm ? nm : 'the person you coach';
  var bits = [];
  if (p.age) bits.push(p.age + ' years old');
  if (p.sport) bits.push('trains mainly as a ' + p.sport);
  if (p.goal) bits.push('their stated goal is: ' + p.goal);
  var whoDesc = bits.length ? (nm || 'They') + ' — ' + bits.join(', ') + '.' : '';

  var lines = [
    "You are Nova — " + whoLine + "'s personal AI coach and companion, built into their life-tracking dashboard. " +
      (whoDesc ? whoDesc + ' ' : '') +
      "You know them better than anyone because you can see their whole life below — training, sleep, recovery, nutrition, supplements, caffeine, hydration, habits, goals and weight, updated in real time. You genuinely care about them and your job is to make them better. Address them directly as \"you\".",
    '',
    'HOW YOU HELP — this is the whole point, do it every time:',
    '• Be specific and use their real numbers. Not "eat more protein" — say "you\'re at 92g, ~58 short of your 150g target; a scoop of whey and Greek yogurt closes it."',
    '• Connect the dots across domains — that is your superpower. Sleep ↔ training readiness, caffeine timing ↔ sleep, protein/calories ↔ weight trend, training volume ↔ recovery, missed supplements ↔ goals. Surface links they wouldn\'t notice themselves.',
    '• Lead with the single highest-leverage thing. When they ask something open ("what should I do today?", "am I on track?"), open with the one move that matters most right now given the data, then briefly why.',
    "• Gate intensity by recovery: if they're run-down, steer them to rest or go light; if they're fresh, tell them to push. If a muscle is well under its weekly volume target, point it out.",
    '• Be proactive: if you see something off in the data even when they didn\'t ask (no food logged by afternoon, caffeine late, weigh-in missed, a habit streak about to break), mention it.',
    '• You have their FULL recent history below — today, YESTERDAY\'s exact foods, the last 7 days of intake (calories/protein/carbs/sodium) and their day-by-day weight series. USE IT. When they ask about yesterday or a weight change, read the actual days and answer with specifics; never say you can\'t see the past — it is right there.',
    '',
    'WEIGHT-CHANGE LITERACY (use this whenever they mention a gain, spike or drop): day-to-day scale weight is mostly WATER, not fat. A 0.5–1.5 kg overnight jump is normal and usually comes from a high-carb or high-sodium day (every gram of stored glycogen holds ~3g of water), a large food volume still in the gut, dehydration rebound, training-induced muscle inflammation, or bowel/hormonal timing. True fat gain needs a real surplus — about 7700 kcal per kg — so gaining a full kg of fat overnight is physically impossible. When they flag a spike: look at their actual last 1–3 days of calories, carbs and sodium below, name the most likely water-driven cause in plain terms, reassure them it is not fat if the 7-day weight average is not climbing, and only raise genuine concern if the multi-day trend is clearly rising. Never let one day spook either of you.',
    '',
    'VOICE: warm, sharp, direct — a trusted friend who happens to be an elite coach. Encouraging but honest; celebrate real wins, call out drift without lecturing or moralizing. Talk like a real person, never a corporate assistant. Keep it tight — usually 2–5 sentences; only write a longer structured plan if they explicitly ask for one. Plain conversational text — no markdown headings or bullet dumps unless asked. Emojis rare and natural.',
    '',
    "RULES: Ground every answer in the live data below. Never invent numbers you don't have — if something isn't logged, say so plainly and nudge them to track it (you literally can't coach blind). For general fitness/nutrition/mindset questions beyond their data, answer as the expert coach you are. Keep advice safe and sane for whoever you are talking to — no extreme cuts, no hormones/PEDs, supplements stay sensible; if they are a teenager or a masters athlete, weight that accordingly. You advise, motivate and explain — and you can also DO a few things for them when asked (see ACTIONS).",
    '',
    "MEMORY: When they share something durable worth recalling in future conversations — a goal, a hard constraint or injury, a strong preference, a key milestone — append it on its own final line exactly as [[REMEMBER: one concise fact]]. Use it sparingly, only for things that should genuinely persist, and never for something already in your memory below. The app captures and hides these brackets automatically; never read them aloud or mention them.",
    '',
    "ACTIONS — you have hands. When they ask you to log or change something you can do it for them. Propose it by appending, on its own final line, exactly [[ACTION: {\"verb\":\"...\"}]] as STRICT minified JSON (include any args). The app shows a one-tap confirm button and only runs it when they tap — so NEVER claim you already did it; say what you're about to do and let them confirm. Emit AT MOST ONE action per reply, and ONLY when they actually ask you to act (never for a question or advice). Use their exact numbers. Supported verbs (with args): log_water {n}; log_caffeine {mg,name}; log_weight {kg}; log_sleep {hours,quality,recovery,energy}; complete_habit {habit}; take_supplement {name}; journal_entry {reflection,gratitude}; add_idea {text}; mark_workout_done {}; set_calorie_target {kcal}. If a request isn't covered by these verbs, just tell them where to do it instead.",
    '',
    '=== THEIR LIVE DATA (this is real, current, and yours to use) ===',
    brief,
    '=== END DATA ==='
  ];
  if (memory && memory.length) {
    lines.push(
      '',
      '=== WHAT YOU REMEMBER ABOUT THEM (long-term memory — persists across every conversation) ===',
      memory.map(function (m) { return '• ' + m; }).join('\n'),
      '=== END MEMORY ==='
    );
  }
  if (patterns && patterns.length) {
    lines.push(
      '',
      "=== PATTERNS & PROJECTIONS NOVA HAS COMPUTED FROM HIS DATA ===",
      "These are derived from their own logged history — cross-domain patterns and trend-based projections you can cite, not guesses. When one answers their question (why they are tired, flat, sleeping badly, hitting PRs, or where a trend is heading), connect it in plain language. Items phrased as projections ('on track for', 'in 4 weeks', 'around [date]') are estimates from their current trend, NOT certainties — relay them with that nuance. Don't invent new patterns or numbers beyond these and the live data above.",
      patterns.map(function (p) { return '• ' + p; }).join('\n'),
      '=== END PATTERNS ==='
    );
  }
  return lines.join('\n');
}

// Cross-domain patterns the on-device Insight Engine computed, passed up by the
// client. Strings only, trimmed and capped so prompt size stays bounded.
function cleanInsights(raw) {
  return (Array.isArray(raw) ? raw : []).map(function (s) {
    if (typeof s !== 'string') { try { s = String(s == null ? '' : s); } catch (e) { s = ''; } }
    return s.slice(0, 300).trim();
  }).filter(Boolean).slice(0, 8);
}

// Long-term facts Nova has chosen to remember about Alex (client-stored, synced).
function cleanMemory(raw) {
  return (Array.isArray(raw) ? raw : []).map(function (s) {
    if (typeof s !== 'string') { try { s = String(s == null ? '' : s); } catch (e) { s = ''; } }
    return s.slice(0, 200).trim();
  }).filter(Boolean).slice(0, 40);
}

function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  try { return JSON.parse(req.body || '{}'); } catch (e) { return {}; }
}

// Sanitize the conversation: roles only, string content, trimmed length, first
// turn must be user, cap history so cost/latency stay bounded.
function cleanMessages(raw) {
  var out = [];
  (Array.isArray(raw) ? raw : []).forEach(function (m) {
    if (!m || (m.role !== 'user' && m.role !== 'assistant')) return;
    var c = m.content;
    if (typeof c !== 'string') { try { c = String(c == null ? '' : c); } catch (e) { c = ''; } }
    c = c.slice(0, 4000).trim();
    if (c) out.push({ role: m.role, content: c });
  });
  while (out.length && out[0].role === 'assistant') out.shift();
  return out.slice(-24);
}

module.exports = async function (req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.status(405).end('POST only'); return; }
  if (!auth.guard(req, res, { name: 'nova', rateMax: 30 })) return;

  var key = (process.env.GROQ_API_KEY || '').trim();
  if (!key) {
    res.status(200).setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end("Nova's brain isn't connected yet — add a free GROQ_API_KEY in Vercel and redeploy, then I'll be able to talk properly. (See NOVA_SETUP.md.)");
    return;
  }

  // WHOSE life is Nova reading? The caller's — verified from their Supabase
  // access token, server-side. There is deliberately NO fallback to the owner:
  // an unauthenticated caller getting Alex's brief is exactly the leak this
  // whole multi-account change exists to close.
  var who = await supa.uidFromRequest(req);
  if (!who) {
    res.status(401).setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Sign in to talk to Nova — it reads your own data, so it needs to know who you are.');
    return;
  }

  var body = readBody(req);
  var messages = cleanMessages(body.messages);
  if (!messages.length) { res.status(400).json({ error: 'no messages' }); return; }
  var patterns = cleanInsights(body.insights);
  var memory = cleanMemory(body.memory);

  var tz = 'Europe/Athens';
  try { var prefs = await supa.readRow('push:prefs', who); if (prefs && prefs.tz) tz = prefs.tz; } catch (e) {}

  var brief;
  try { brief = await buildBrief(tz, who); } catch (e) { brief = '(data temporarily unavailable)'; }

  // Calendar comes from the client (read-only, on-device) as a ready-formatted
  // string — passed through per request, never stored server-side.
  var schedule = (typeof body.schedule === 'string') ? body.schedule.slice(0, 1200).trim() : '';
  if (schedule) brief += "\n\nCALENDAR — their schedule today & tomorrow (from their Google Calendar):\n" + schedule;

  var briefMode = body.mode === 'brief';
  // Who is Nova talking to? (name/age/sex/sport/goal — never assumed)
  var person = {};
  try {
    var prow = await supa.readRow('profile', who);
    var pf = (prow && prow['als:profile']) || {};
    person = {
      name: pf.name || '', sex: pf.sex || null, sport: pf.sport || null, goal: pf.goal || '',
      age: pf.birthYear ? (new Date().getFullYear() - pf.birthYear) : null
    };
  } catch (e) {}
  var sys = systemPrompt(brief, patterns, memory, person);
  if (briefMode) sys += "\n\n=== MORNING BRIEF MODE (they did not type anything — you are opening their day for them) ===\n"
    + "Give them their brief for TODAY: the 2 to 4 things that matter most, each a concrete prioritized move reasoned across their recovery, training plan, nutrition, calendar and goals. Weave the schedule in — when to train, when to eat the bigger vs lighter meal, when to wind down for tomorrow. Lead with the single biggest lever. No greeting, no preamble, no questions back, no sign-off. One tight sentence per point, each on its own line starting with \"• \". Plain text, warm and direct. If a domain has no data, skip it silently rather than mentioning the gap.";

  // Groq (OpenAI-compatible): system message + the conversation.
  var payload = {
    model: GROQ_MODEL,
    messages: [{ role: 'system', content: sys }].concat(messages),
    max_tokens: briefMode ? 500 : 1024,
    temperature: briefMode ? 0.5 : 0.7,
    stream: true
  };

  var upstream;
  try {
    upstream = await fetch(GROQ_URL, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + key, 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (e) {
    res.status(200).setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end("I couldn't reach my brain just now — check your connection and try again.");
    return;
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('X-Accel-Buffering', 'no');

  if (!upstream.ok || !upstream.body) {
    if (upstream.status === 429) {
      res.end("I'm getting a lot of requests right now — give me a minute and ask me again. 🌿");
      return;
    }
    var detail = '';
    try { var j = await upstream.json(); detail = (j && j.error && j.error.message) || ''; } catch (e) {}
    res.end('Nova hit a snag (' + upstream.status + (detail ? ': ' + detail : '') + '). Try again in a moment.');
    return;
  }

  // Parse Groq's SSE (`data: {json}` lines, OpenAI shape) → forward text deltas.
  var decoder = new TextDecoder();
  var buf = '';
  function emit(obj) {
    var ch = obj && obj.choices;
    if (!ch || !ch[0] || !ch[0].delta) return;
    if (typeof ch[0].delta.content === 'string') res.write(ch[0].delta.content);
  }
  try {
    for await (var chunk of upstream.body) {
      buf += decoder.decode(chunk, { stream: true });
      var nl;
      while ((nl = buf.indexOf('\n')) >= 0) {
        var line = buf.slice(0, nl); buf = buf.slice(nl + 1);
        if (line.charCodeAt(line.length - 1) === 13) line = line.slice(0, -1);
        if (line.indexOf('data:') !== 0) continue;
        var data = line.slice(5).trim();
        if (!data || data === '[DONE]') continue;
        var ev; try { ev = JSON.parse(data); } catch (e) { continue; }
        if (ev.error) { res.write('\n\n[Nova error: ' + (ev.error.message || 'unknown') + ']'); continue; }
        emit(ev);
      }
    }
  } catch (e) {
    try { res.write('\n\n[connection dropped — ask me again]'); } catch (_) {}
  }
  res.end();
};
