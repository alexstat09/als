// ─────────────────────────────────────────────────────────────────────────
// ALS Dashboard — remote MCP server (Model Context Protocol over HTTP).
// Lets Claude (claude.ai Connectors / Claude Desktop) read Alex's live
// dashboard data straight from Supabase, so he can ask anything from anywhere.
//
// Transport: Streamable HTTP (single JSON-RPC request -> single JSON response).
// Auth:      a shared secret in MCP_TOKEN, sent as ?token=... or
//            "Authorization: Bearer <token>". Fails closed if MCP_TOKEN is unset.
// Data:      read-only, via the same app_state table the rest of /api uses.
// ─────────────────────────────────────────────────────────────────────────
'use strict';
var supa = require('./_supa');

/* ---------- small helpers ---------- */
function pad(n) { return String(n).padStart(2, '0'); }
function dk(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
function todayKey() { return dk(new Date()); }
function arr(v) { return Array.isArray(v) ? v : []; }
function r1(n) { return Math.round((+n || 0) * 10) / 10; }
function r0(n) { return Math.round(+n || 0); }
async function R(key) { return await supa.readRow(key); }            // object/array or {}
async function Rarr(key) { var v = await supa.readRow(key); return Array.isArray(v) ? v : []; }
function daysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
function dkOf(y, m, d) { return y + '-' + pad(m + 1) + '-' + pad(d); }

/* ---------- read body / token ---------- */
function readJson(req) {
  if (req.body && typeof req.body === 'object') return Promise.resolve(req.body);
  return new Promise(function (resolve) {
    var d = '';
    req.on('data', function (c) { d += c; });
    req.on('end', function () { try { resolve(JSON.parse(d || '{}')); } catch (e) { resolve({}); } });
    req.on('error', function () { resolve({}); });
  });
}
function getToken(req) {
  var auth = req.headers['authorization'] || '';
  if (auth.indexOf('Bearer ') === 0) return auth.slice(7).trim();
  try { var u = new URL(req.url, 'http://x'); var t = u.searchParams.get('token'); if (t) return t; } catch (e) {}
  if (req.query && req.query.token) return String(req.query.token);
  return '';
}

/* ======================= TOOLS ======================= */
var TOOLS = [
  { name: 'snapshot', description: 'Broad cross-domain summary of Alex right now: readiness/recovery, today\'s fuel, recent training, body, money and streaks. Best first call for general questions.', inputSchema: { type: 'object', properties: {} } },
  { name: 'get_recovery', description: 'Recent sleep & recovery: nightly recovery score, hours slept, quality, energy.', inputSchema: { type: 'object', properties: { limit: { type: 'number', description: 'how many recent nights (default 10)' } } } },
  { name: 'get_training', description: 'Recent workouts: date, total volume, PR count and the lifts performed.', inputSchema: { type: 'object', properties: { limit: { type: 'number', description: 'how many recent sessions (default 8)' } } } },
  { name: 'get_nutrition', description: 'Recent nutrition by day: calories, protein, carbs, fat vs the calorie target.', inputSchema: { type: 'object', properties: { days: { type: 'number', description: 'how many recent days (default 7)' } } } },
  { name: 'get_body', description: 'Bodyweight trend, hydration, caffeine intake and tape measurements.', inputSchema: { type: 'object', properties: {} } },
  { name: 'get_money', description: 'Finances: monthly bill commitments, what is paid, and no-spend days this month.', inputSchema: { type: 'object', properties: {} } },
  { name: 'get_mind', description: 'Discipline: daily habits/protocols, learning queue, habits being adopted, goal streak.', inputSchema: { type: 'object', properties: {} } },
  { name: 'get_life', description: 'Leisure: films watched, taste rating and watchlist.', inputSchema: { type: 'object', properties: {} } },
  { name: 'list_keys', description: 'List the raw app_state data keys available to read with get_raw.', inputSchema: { type: 'object', properties: {} } },
  { name: 'get_raw', description: 'Read the raw stored JSON for one app_state key (power tool). Use list_keys first.', inputSchema: { type: 'object', properties: { key: { type: 'string', description: 'e.g. "sleep:logs", "po_workouts", "nut:logs"' } }, required: ['key'] } }
];

var RAW_KEYS = [
  'sleep:logs', 'po_workouts', 'po_coach_weights', 'po_coach_workout_done',
  'nut:logs', 'nut:profile', 'caf:logs', 'po_water_v1', 'goal_streak_v1',
  'bills:items', 'bills:paid', 'bills:nospend', 'movies:seen', 'movies:watch',
  'improve:videos', 'improve:habits', 'habits:list', 'habits:log',
  'bm:logs', 'stack:items'
];

async function callTool(name, args) {
  args = args || {};
  if (name === 'list_keys') return 'Readable keys:\n' + RAW_KEYS.join('\n');

  if (name === 'get_raw') {
    var key = String(args.key || '').trim();
    if (!key) return 'Provide a "key" (see list_keys).';
    var data = await R(key);
    var s = JSON.stringify(data);
    if (s.length > 12000) s = s.slice(0, 12000) + ' …(truncated)';
    return key + ':\n' + s;
  }

  if (name === 'get_recovery') {
    var lim = +args.limit || 10;
    var sl = (await Rarr('sleep:logs')).slice(-lim);
    if (!sl.length) return 'No sleep logged yet.';
    var lines = sl.map(function (e) {
      return (e.dateKey || '?') + ': recovery ' + (e.recovery != null ? e.recovery : '—') +
        ', ' + (e.hours != null ? r1(e.hours) + 'h' : '—') +
        (e.quality != null ? ', quality ' + e.quality : '') +
        (e.energy != null ? ', energy ' + e.energy : '');
    });
    var last = sl[sl.length - 1];
    return 'Last ' + sl.length + ' nights (most recent last):\n' + lines.join('\n') +
      '\n\nLatest recovery: ' + (last.recovery != null ? last.recovery : '—');
  }

  if (name === 'get_training') {
    var l2 = +args.limit || 8;
    var wo = (await Rarr('po_workouts')).slice(-l2);
    if (!wo.length) return 'No workouts logged yet.';
    var out = wo.map(function (w) {
      var lifts = arr(w.entries).map(function (en) { return en && en.name; }).filter(Boolean).slice(0, 6).join(', ');
      return (w.date || '?') + ' · vol ' + r0(w.volume) + 'kg · PRs ' + (Array.isArray(w.prs) ? w.prs.length : 0) +
        (lifts ? '\n   ' + lifts : '');
    });
    return 'Last ' + wo.length + ' sessions (most recent last):\n' + out.join('\n');
  }

  if (name === 'get_nutrition') {
    var days = +args.days || 7;
    var nut = await Rarr('nut:logs');
    var prof = await R('nut:profile');
    var target = (prof && prof.calTarget) || null;
    var byDay = {};
    nut.forEach(function (e) {
      if (!e || !e.dateKey) return;
      var d = byDay[e.dateKey] || (byDay[e.dateKey] = { kcal: 0, p: 0, c: 0, f: 0 });
      d.kcal += (+e.kcal || 0); d.p += (+e.p || 0); d.c += (+e.c || 0); d.f += (+e.f || 0);
    });
    var keys = Object.keys(byDay).sort().slice(-days);
    if (!keys.length) return 'No nutrition logged yet.' + (target ? ' Calorie target: ' + target + '.' : '');
    var rows = keys.map(function (k) {
      var d = byDay[k];
      return k + ': ' + r0(d.kcal) + ' kcal' + (target ? '/' + target : '') + ' · ' + r0(d.p) + 'g P · ' + r0(d.c) + 'g C · ' + r0(d.f) + 'g F';
    });
    return 'Nutrition' + (target ? ' (target ' + target + ' kcal)' : '') + ':\n' + rows.join('\n');
  }

  if (name === 'get_body') {
    var wts = await Rarr('po_coach_weights');
    var wline = wts.length
      ? 'Weight: latest ' + r1(wts[wts.length - 1].weight) + 'kg' + (wts.length > 1 ? ' (from ' + r1(wts[0].weight) + 'kg over ' + wts.length + ' weigh-ins)' : '')
      : 'Weight: none logged';
    var pw = await R('po_water_v1');
    var wlogs = (pw && pw.logs) || {};
    var t = todayKey();
    var waterToday = wlogs[t] || 0;
    var caf = await Rarr('caf:logs');
    var cafToday = caf.filter(function (e) { if (!e || !e.ts) return false; var d = new Date(e.ts); return !isNaN(d) && dk(d) === t; }).reduce(function (s, e) { return s + (+e.mg || 0); }, 0);
    var bm = (await Rarr('bm:logs')).filter(function (e) { return e && e.dateKey; });
    var mline = bm.length ? 'Measurements: ' + bm.length + ' logged, latest ' + bm[bm.length - 1].dateKey : 'Measurements: none';
    return wline + '\nWater today: ' + waterToday + ' glasses\nCaffeine today: ' + r0(cafToday) + ' mg\n' + mline;
  }

  if (name === 'get_money') {
    var bills = await Rarr('bills:items');
    var paid = await Rarr('bills:paid');
    var nospend = await Rarr('bills:nospend');
    var now = new Date(), y = now.getFullYear(), m = now.getMonth();
    function occ(b, d) {
      var dim = daysInMonth(y, m), rc = b.recur || 'monthly';
      if (rc === 'monthly') return d === Math.min(b.day || 1, dim);
      if (rc === 'weekly') return new Date(y, m, d).getDay() === (b.day == null ? 1 : b.day);
      if (rc === 'yearly') return b.month != null && b.month === m && d === Math.min(b.day || 1, dim);
      if (rc === 'once') return b.date === dkOf(y, m, d);
      return false;
    }
    function occCount(b) { var dim = daysInMonth(y, m), c = 0; for (var d = 1; d <= dim; d++) if (occ(b, d)) c++; return c; }
    var monthTotal = bills.reduce(function (s, b) { return s + occCount(b) * (+b.amount || 0); }, 0);
    var inMonth = bills.filter(function (b) { return occCount(b) > 0; });
    var pid = function (b) { return b.id + '|' + y + '-' + pad(m + 1); };
    var paidCount = inMonth.filter(function (b) { return b.recur !== 'weekly' && paid.some(function (p) { return p.id === pid(b); }); }).length;
    var pre = y + '-' + pad(m + 1) + '-';
    var noSpend = nospend.filter(function (n) { return n && typeof n.id === 'string' && n.id.indexOf(pre) === 0; }).length;
    if (!bills.length) return 'No bills tracked yet.';
    return 'This month: ' + r0(monthTotal) + ' committed across ' + inMonth.length + ' bills, ' +
      paidCount + ' settled, ' + (inMonth.length - paidCount) + ' open. ' +
      noSpend + ' no-spend day(s) so far.';
  }

  if (name === 'get_mind') {
    var gs = await R('goal_streak_v1');
    var streak = (gs && typeof gs.count === 'number') ? gs.count : 0;
    var hbList = await Rarr('habits:list');
    var hbLog = await R('habits:log');
    var today2 = todayKey();
    var todayDone = (hbLog && hbLog[today2]) ? Object.keys(hbLog[today2]).length : 0;
    var vids = await Rarr('improve:videos');
    var queue = vids.filter(function (v) { return v && !v.watched; }).length;
    var ihab = await Rarr('improve:habits');
    var adopting = ihab.filter(function (h) { return h && !h.adopted; }).length;
    return 'Goal streak: ' + streak + ' days.\n' +
      'Habits today: ' + Math.min(todayDone, hbList.length) + '/' + hbList.length + ' done.\n' +
      'Learning queue: ' + queue + ' to watch.\n' +
      'Habits being adopted: ' + adopting + '.';
  }

  if (name === 'get_life') {
    var seen = await Rarr('movies:seen');
    var watch = await Rarr('movies:watch');
    var rated = seen.filter(function (f) { return f && f.rating != null; });
    var avg = rated.length ? Math.round(rated.reduce(function (a, f) { return a + f.rating; }, 0) / rated.length) : null;
    return 'Films catalogued: ' + seen.length + (avg != null ? ' · taste rating ' + avg : '') + '\nWatchlist: ' + watch.length + ' queued.';
  }

  if (name === 'snapshot') {
    var parts = await Promise.all([
      callTool('get_recovery', { limit: 3 }),
      callTool('get_nutrition', { days: 2 }),
      callTool('get_training', { limit: 3 }),
      callTool('get_body', {}),
      callTool('get_money', {}),
      callTool('get_mind', {})
    ]);
    return '=== SNAPSHOT (' + todayKey() + ') ===\n\n[RECOVERY]\n' + parts[0] +
      '\n\n[FUEL]\n' + parts[1] + '\n\n[TRAINING]\n' + parts[2] +
      '\n\n[BODY]\n' + parts[3] + '\n\n[MONEY]\n' + parts[4] + '\n\n[MIND]\n' + parts[5];
  }

  throw new Error('Unknown tool: ' + name);
}

/* ======================= JSON-RPC dispatch ======================= */
function reply(id, result) { return { jsonrpc: '2.0', id: id, result: result }; }
function rpcError(id, code, message) { return { jsonrpc: '2.0', id: id, error: { code: code, message: message } }; }

async function handle(m) {
  if (!m || typeof m !== 'object') return null;
  var id = m.id, method = m.method;
  if (method === 'initialize') {
    return reply(id, {
      protocolVersion: (m.params && m.params.protocolVersion) || '2024-11-05',
      capabilities: { tools: { listChanged: false } },
      serverInfo: { name: 'ALS Dashboard', version: '1.0.0' },
      instructions: 'Personal performance dashboard for Alex. Tools read his live tracked data (recovery, training, nutrition, body, money, mind, life). Call "snapshot" for a broad picture, or a get_* tool for one domain. Data is read-only.'
    });
  }
  if (typeof method === 'string' && method.indexOf('notifications/') === 0) return null; // no response to notifications
  if (method === 'ping') return reply(id, {});
  if (method === 'tools/list') return reply(id, { tools: TOOLS });
  if (method === 'tools/call') {
    var name = m.params && m.params.name, a = (m.params && m.params.arguments) || {};
    try {
      var text = await callTool(name, a);
      return reply(id, { content: [{ type: 'text', text: String(text) }] });
    } catch (e) {
      return reply(id, { content: [{ type: 'text', text: 'Error: ' + ((e && e.message) || e) }], isError: true });
    }
  }
  if (id === undefined || id === null) return null; // unknown notification
  return rpcError(id, -32601, 'Method not found: ' + method);
}

/* ======================= HTTP entry ======================= */
module.exports = async function (req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method === 'GET') { res.status(405).setHeader('Allow', 'POST'); res.end('MCP server — POST JSON-RPC only.'); return; }
  if (req.method !== 'POST') { res.status(405).end(); return; }

  // auth — fail closed
  var expected = (process.env.MCP_TOKEN || '').trim();
  if (!expected) { res.status(500).json({ error: 'MCP_TOKEN not configured on the server.' }); return; }
  if (getToken(req) !== expected) { res.status(401).json({ jsonrpc: '2.0', id: null, error: { code: -32001, message: 'Unauthorized' } }); return; }

  var body = await readJson(req);

  try {
    if (Array.isArray(body)) {
      var outs = [];
      for (var i = 0; i < body.length; i++) { var r = await handle(body[i]); if (r) outs.push(r); }
      if (!outs.length) { res.status(202).end(); return; }
      res.status(200).json(outs); return;
    }
    var one = await handle(body);
    if (!one) { res.status(202).end(); return; }      // notification
    res.status(200).json(one);
  } catch (e) {
    res.status(200).json(rpcError(body && body.id, -32603, 'Internal error: ' + ((e && e.message) || e)));
  }
};
