// ════════════════════════════════════════════════════════════════
// Conversational Nova — the crown jewel (free brain: Groq / Llama).
// A streaming proxy to the Groq API. The API key stays server-side.
// On every turn Nova is grounded in Alex's real, up-to-the-minute data
// (read from Supabase via _supa.js) so she answers like a coach who
// actually knows him. Streams the model's response straight to the browser
// as plain text. Provider-agnostic by design — the data brief + persona
// below would work behind any model; only the call section is provider-specific.
// ════════════════════════════════════════════════════════════════
'use strict';
var supa = require('./_supa');

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

// Build the compact, factual brief that grounds Nova in Alex's life today.
async function buildBrief(tz) {
  var lp = localParts(tz);
  var today = lp.dateKey;
  var rows = await Promise.all([
    supa.readRow('po-coach'), supa.readRow('nutrition'), supa.readRow('caffeine'),
    supa.readRow('identity'), supa.readRow('health'), supa.readRow('sleep'),
    supa.readRow('goals')
  ]);
  var poc = rows[0], nut = rows[1], caf = rows[2], idn = rows[3], hlt = rows[4], slp = rows[5], gls = rows[6];
  var L = [];
  L.push('ALEX — live snapshot, ' + lp.weekday + ' ' + today + ' (his local time, hour ' + lp.hour + ').');

  var weights = (poc['po_coach_weights'] || []).filter(function (e) { return e && e.dateKey && typeof e.weight === 'number'; })
    .sort(function (a, b) { return a.dateKey < b.dateKey ? -1 : 1; });
  var units = (poc['po_coach_v1'] || {}).units || 'kg';
  if (weights.length) {
    var last = weights[weights.length - 1];
    var cutoff = tsToDateKey(Date.now() - 7 * 86400000, tz), base = weights[0];
    for (var i = 0; i < weights.length; i++) { if (weights[i].dateKey <= cutoff) base = weights[i]; }
    var dl = r1(last.weight - base.weight);
    L.push('Weight: ' + last.weight + units + ' (last logged ' + last.dateKey + '), ' + (dl <= 0 ? 'down ' + Math.abs(dl) : 'up ' + dl) + units + ' over ~7 days. Weighed in today: ' + (last.dateKey === today ? 'yes' : 'NO'));
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
  } else L.push('Sleep: nothing logged yet (his #1 untracked lever).');

  var weightKg = (((hlt['po_water_v1'] || {}).profile) || {}).weightKg || (weights.length ? weights[weights.length - 1].weight : 75);
  var protTarget = Math.round(weightKg * 2);
  var prot = 0, kcal = 0, meals = 0;
  (nut['nut:logs'] || []).forEach(function (l) { if (l && l.ts && tsToDateKey(l.ts, tz) === today) { prot += (l.p || 0); kcal += (l.kcal || 0); meals++; } });
  L.push('Nutrition today: ' + Math.round(prot) + 'g protein (target ~' + protTarget + 'g), ' + Math.round(kcal) + ' kcal, ' + meals + ' meals logged.');

  var cafToday = 0; (caf['caf:logs'] || []).forEach(function (l) { if (l && l.ts && tsToDateKey(l.ts, tz) === today) cafToday += (l.mg || 0); });
  L.push('Caffeine today: ' + Math.round(cafToday) + 'mg.');

  var water = hlt['po_water_v1'] || {}; var wlogs = (water.logs && typeof water.logs === 'object') ? water.logs : {};
  if (Object.keys(wlogs).length) L.push('Water today: ' + (wlogs[today] || 0) + ' logged.');

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

  return L.join('\n');
}

function systemPrompt(brief) {
  return [
    "You are Nova — Alex's personal AI coach and companion, built into his life-tracking dashboard. Alex is 17 and doing a body recomposition (building strength and size while leaning out). You know him well and you genuinely care about him.",
    '',
    'Voice: warm, sharp, and direct — like a trusted older friend who happens to be an elite coach. Encouraging but honest; you celebrate real wins and call out drift without lecturing. You talk like a person, not a corporate assistant. Keep replies tight — usually 2–5 sentences. Use his real numbers from the data below to make advice concrete. Plain conversational text, no markdown headings or bullet dumps unless he asks for a plan. Emojis only occasionally, never forced.',
    '',
    'Ground every answer in his live data below. Reference specific numbers when relevant ("you\'re at 90g protein, ~60 short of target"). Never invent data you don\'t have — if something isn\'t tracked, say so and nudge him to log it. For general fitness/nutrition/mindset questions beyond his data, answer as the knowledgeable coach you are. If he\'s clearly run-down (low recovery), steer him to rest; if primed, push him. You can\'t change his data — you advise, motivate, and explain.',
    '',
    '=== HIS LIVE DATA ===',
    brief,
    '=== END DATA ==='
  ].join('\n');
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

  var key = (process.env.GROQ_API_KEY || '').trim();
  if (!key) {
    res.status(200).setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end("Nova's brain isn't connected yet — add a free GROQ_API_KEY in Vercel and redeploy, then I'll be able to talk properly. (See NOVA_SETUP.md.)");
    return;
  }

  var body = readBody(req);
  var messages = cleanMessages(body.messages);
  if (!messages.length) { res.status(400).json({ error: 'no messages' }); return; }

  var tz = 'Europe/Athens';
  try { var prefs = await supa.readRow('push:prefs'); if (prefs && prefs.tz) tz = prefs.tz; } catch (e) {}

  var brief;
  try { brief = await buildBrief(tz); } catch (e) { brief = '(data temporarily unavailable)'; }

  // Groq (OpenAI-compatible): system message + the conversation.
  var payload = {
    model: GROQ_MODEL,
    messages: [{ role: 'system', content: systemPrompt(brief) }].concat(messages),
    max_tokens: 1024,
    temperature: 0.85,
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
