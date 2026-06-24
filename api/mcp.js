// ─────────────────────────────────────────────────────────────────────────
// ALS Dashboard — remote MCP server (Model Context Protocol over HTTP).
// Lets Claude read AND modify Alex's live dashboard data from anywhere.
//
// Transport: Streamable HTTP (single JSON-RPC request -> single JSON response).
// Auth:      shared secret in MCP_TOKEN (?token=... or Authorization: Bearer).
// Data:      app_state rows are BUNDLES keyed by appKey (e.g. 'po-coach',
//            'nutrition', 'health', 'identity', 'sleep', 'bills', 'movies'…),
//            each holding several localStorage keys. We read/modify the whole
//            bundle and write it back; the client's sync engine union-merges
//            (arrays keyed by id/dateKey/date), so additions survive.
// ─────────────────────────────────────────────────────────────────────────
'use strict';
var supa = require('./_supa');

/* ---------- helpers ---------- */
function pad(n) { return String(n).padStart(2, '0'); }
function dk(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
function todayKey() { return dk(new Date()); }
function arr(v) { return Array.isArray(v) ? v : []; }
function r0(n) { return Math.round(+n || 0); }
function r1(n) { return Math.round((+n || 0) * 10) / 10; }
function daysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
function dkOf(y, m, d) { return y + '-' + pad(m + 1) + '-' + pad(d); }
function uid(p) { return (p || '') + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

/* ---------- bundle layout: localStorage key -> app_state row (appKey) ---------- */
var BUNDLE = {
  'sleep:logs': 'sleep', 'sleep:profile': 'sleep',
  'po_workouts': 'po-coach', 'po_coach_weights': 'po-coach', 'po_coach_workout_done': 'po-coach',
  'nut:logs': 'nutrition', 'nut:profile': 'nutrition', 'nut:meals': 'nutrition', 'nut:custom': 'nutrition',
  'caf:logs': 'caffeine',
  'po_water_v1': 'health', 'stack:items': 'health',
  'habits:list': 'identity', 'habits:log': 'identity', 'journal:entries': 'identity', 'identity:northstar': 'identity',
  'bm:logs': 'body-measure',
  'bills:items': 'bills', 'bills:paid': 'bills', 'bills:nospend': 'bills',
  'movies:seen': 'movies', 'movies:watch': 'movies',
  'improve:videos': 'improve', 'improve:habits': 'improve',
  'ideas:items': 'ideas'
};
function bundleFor(lsKey) { if (lsKey.indexOf('stack:taken:') === 0) return 'health'; return BUNDLE[lsKey]; }

/* ---------- per-request bundle cache (reads only) ---------- */
var CACHE = null;
async function getBundle(appKey) {
  if (CACHE && (appKey in CACHE)) return CACHE[appKey];
  var b = await supa.readRow(appKey);
  if (!b || typeof b !== 'object' || Array.isArray(b)) b = {};
  if (CACHE) CACHE[appKey] = b;
  return b;
}
async function readKey(lsKey) { var ak = bundleFor(lsKey); if (!ak) return undefined; var b = await getBundle(ak); return b[lsKey]; }
async function readArr(lsKey) { var v = await readKey(lsKey); return Array.isArray(v) ? v : []; }

/* ---------- mutate one bundle (read fresh -> change -> write whole row) ---------- */
async function mutateBundle(appKey, fn) {
  var b = await supa.readRow(appKey);
  if (!b || typeof b !== 'object' || Array.isArray(b)) b = {};
  await fn(b);
  await supa.writeRow(appKey, b);
  if (CACHE) delete CACHE[appKey];
}

/* ======================= TOOL DEFINITIONS ======================= */
var TOOLS = [
  // reads
  { name: 'snapshot', description: 'Broad cross-domain summary of Alex right now: recovery, today\'s fuel, recent training, body, money, mind. Best first call.', inputSchema: { type: 'object', properties: {} } },
  { name: 'get_recovery', description: 'Recent sleep & recovery (score, hours, quality, energy).', inputSchema: { type: 'object', properties: { limit: { type: 'number' } } } },
  { name: 'get_training', description: 'Recent workouts (date, volume, PR count, lifts).', inputSchema: { type: 'object', properties: { limit: { type: 'number' } } } },
  { name: 'get_nutrition', description: 'Recent nutrition by day (calories, protein, carbs, fat vs target).', inputSchema: { type: 'object', properties: { days: { type: 'number' } } } },
  { name: 'get_body', description: 'Bodyweight trend, hydration, caffeine, measurements.', inputSchema: { type: 'object', properties: {} } },
  { name: 'get_money', description: 'Monthly bill commitments, paid vs open, no-spend days.', inputSchema: { type: 'object', properties: {} } },
  { name: 'get_mind', description: 'Habits done today, learning queue, habits being adopted.', inputSchema: { type: 'object', properties: {} } },
  { name: 'get_life', description: 'Films watched, taste rating, watchlist.', inputSchema: { type: 'object', properties: {} } },
  { name: 'get_raw', description: 'Read raw stored JSON for one data key (power tool). See list_keys.', inputSchema: { type: 'object', properties: { key: { type: 'string' } }, required: ['key'] } },
  { name: 'list_keys', description: 'List the data keys available to read with get_raw.', inputSchema: { type: 'object', properties: {} } },
  // writes
  { name: 'log_meal', description: 'Log a meal/food to nutrition. Provide calories; protein/carbs/fat optional.', inputSchema: { type: 'object', properties: { name: { type: 'string' }, kcal: { type: 'number' }, protein: { type: 'number' }, carbs: { type: 'number' }, fat: { type: 'number' }, meal: { type: 'string', description: 'Breakfast/Lunch/Dinner/Snacks' }, date: { type: 'string', description: 'YYYY-MM-DD, default today' } }, required: ['name', 'kcal'] } },
  { name: 'log_weight', description: 'Log bodyweight (kg) for a day.', inputSchema: { type: 'object', properties: { kg: { type: 'number' }, date: { type: 'string' } }, required: ['kg'] } },
  { name: 'add_water', description: 'Add glasses of water for a day (default 1).', inputSchema: { type: 'object', properties: { glasses: { type: 'number' }, date: { type: 'string' } } } },
  { name: 'log_caffeine', description: 'Log caffeine in mg.', inputSchema: { type: 'object', properties: { mg: { type: 'number' }, name: { type: 'string' }, date: { type: 'string' } }, required: ['mg'] } },
  { name: 'log_sleep', description: 'Log/update a night of sleep (hours and/or recovery 0-100, quality, energy).', inputSchema: { type: 'object', properties: { hours: { type: 'number' }, recovery: { type: 'number' }, quality: { type: 'number' }, energy: { type: 'number' }, date: { type: 'string' } } } },
  { name: 'mark_workout_done', description: 'Mark today (or a date) as a completed workout.', inputSchema: { type: 'object', properties: { date: { type: 'string' } } } },
  { name: 'mark_bill_paid', description: 'Mark a bill (by name) paid for the current/given month.', inputSchema: { type: 'object', properties: { bill: { type: 'string' }, date: { type: 'string' } }, required: ['bill'] } },
  { name: 'add_no_spend_day', description: 'Mark a day as no-spend.', inputSchema: { type: 'object', properties: { date: { type: 'string' } } } },
  { name: 'add_habit', description: 'Add a daily habit/protocol to track.', inputSchema: { type: 'object', properties: { name: { type: 'string' } }, required: ['name'] } },
  { name: 'complete_habit', description: 'Mark a habit (by name) done for a day.', inputSchema: { type: 'object', properties: { habit: { type: 'string' }, date: { type: 'string' } }, required: ['habit'] } },
  { name: 'take_supplement', description: 'Mark a supplement (by name) taken for a day.', inputSchema: { type: 'object', properties: { name: { type: 'string' }, date: { type: 'string' } }, required: ['name'] } },
  { name: 'log_movie', description: 'Log a film as watched, optional rating 0-100.', inputSchema: { type: 'object', properties: { title: { type: 'string' }, rating: { type: 'number' }, year: { type: 'number' } }, required: ['title'] } },
  { name: 'add_to_watchlist', description: 'Add a film to the watchlist.', inputSchema: { type: 'object', properties: { title: { type: 'string' }, year: { type: 'number' } }, required: ['title'] } },
  { name: 'add_idea', description: 'Capture an idea.', inputSchema: { type: 'object', properties: { text: { type: 'string' }, note: { type: 'string' }, category: { type: 'string' } }, required: ['text'] } },
  { name: 'add_learning', description: 'Add something to the learning queue.', inputSchema: { type: 'object', properties: { title: { type: 'string' }, url: { type: 'string' } }, required: ['title'] } },
  { name: 'journal_entry', description: 'Write/update a journal entry (reflection and/or gratitude) for a day.', inputSchema: { type: 'object', properties: { reflection: { type: 'string' }, gratitude: { type: 'string' }, date: { type: 'string' } } } }
];

var READABLE = Object.keys(BUNDLE).concat(['stack:taken:<date>']);

/* ======================= TOOL IMPLEMENTATIONS ======================= */
async function callTool(name, a) {
  a = a || {};

  /* ---- reads ---- */
  if (name === 'list_keys') return 'Readable keys (use with get_raw):\n' + READABLE.join('\n');

  if (name === 'get_raw') {
    var key = String(a.key || '').trim();
    if (!key) return 'Provide a "key" (see list_keys).';
    if (!bundleFor(key)) return 'Unknown key. See list_keys.';
    var v = await readKey(key);
    var s = JSON.stringify(v === undefined ? null : v);
    if (s.length > 12000) s = s.slice(0, 12000) + ' …(truncated)';
    return key + ':\n' + s;
  }

  if (name === 'get_recovery') {
    var sl = (await readArr('sleep:logs')).slice(-(+a.limit || 10));
    if (!sl.length) return 'No sleep logged yet.';
    var lines = sl.map(function (e) {
      return (e.dateKey || '?') + ': recovery ' + (e.recovery != null ? e.recovery : '—') +
        ', ' + (e.hours != null ? r1(e.hours) + 'h' : '—') +
        (e.quality != null ? ', quality ' + e.quality : '') + (e.energy != null ? ', energy ' + e.energy : '');
    });
    var last = sl[sl.length - 1];
    return 'Last ' + sl.length + ' nights (recent last):\n' + lines.join('\n') + '\n\nLatest recovery: ' + (last.recovery != null ? last.recovery : '—');
  }

  if (name === 'get_training') {
    var wo = (await readArr('po_workouts')).slice(-(+a.limit || 8));
    if (!wo.length) return 'No workouts logged yet.';
    return 'Last ' + wo.length + ' sessions (recent last):\n' + wo.map(function (w) {
      var lifts = arr(w.entries).map(function (en) { return en && en.name; }).filter(Boolean).slice(0, 6).join(', ');
      return (w.date || '?') + ' · vol ' + r0(w.volume) + 'kg · PRs ' + (Array.isArray(w.prs) ? w.prs.length : 0) + (lifts ? '\n   ' + lifts : '');
    }).join('\n');
  }

  if (name === 'get_nutrition') {
    var nut = await readArr('nut:logs');
    var prof = await readKey('nut:profile');
    var target = (prof && prof.calTarget) || null;
    var byDay = {};
    nut.forEach(function (e) {
      var d = (e && (e.dateKey || (e.ts ? dk(new Date(e.ts)) : null))); if (!d) return;
      var o = byDay[d] || (byDay[d] = { kcal: 0, p: 0, c: 0, f: 0 });
      o.kcal += (+e.kcal || 0); o.p += (+e.p || 0); o.c += (+e.c || 0); o.f += (+e.f || 0);
    });
    var keys = Object.keys(byDay).sort().slice(-(+a.days || 7));
    if (!keys.length) return 'No nutrition logged yet.' + (target ? ' Target: ' + target + ' kcal.' : '');
    return 'Nutrition' + (target ? ' (target ' + target + ' kcal)' : '') + ':\n' + keys.map(function (k) {
      var o = byDay[k]; return k + ': ' + r0(o.kcal) + ' kcal' + (target ? '/' + target : '') + ' · ' + r0(o.p) + 'g P · ' + r0(o.c) + 'g C · ' + r0(o.f) + 'g F';
    }).join('\n');
  }

  if (name === 'get_body') {
    var wts = await readArr('po_coach_weights');
    var wline = wts.length ? 'Weight: latest ' + r1(wts[wts.length - 1].weight) + 'kg over ' + wts.length + ' weigh-ins' : 'Weight: none logged';
    var pw = await readKey('po_water_v1'); var wlogs = (pw && pw.logs) || {}; var t = todayKey();
    var caf = await readArr('caf:logs');
    var cafToday = caf.filter(function (e) { if (!e || !e.ts) return false; var d = new Date(e.ts); return !isNaN(d) && dk(d) === t; }).reduce(function (s, e) { return s + (+e.mg || 0); }, 0);
    var bm = (await readArr('bm:logs')).filter(function (e) { return e && e.dateKey; });
    return wline + '\nWater today: ' + (wlogs[t] || 0) + ' glasses\nCaffeine today: ' + r0(cafToday) + ' mg\nMeasurements: ' + bm.length + ' logged' + (bm.length ? ' (latest ' + bm[bm.length - 1].dateKey + ')' : '');
  }

  if (name === 'get_money') {
    var bills = await readArr('bills:items'), paid = await readArr('bills:paid'), nospend = await readArr('bills:nospend');
    if (!bills.length) return 'No bills tracked yet.';
    var now = new Date(), y = now.getFullYear(), m = now.getMonth();
    function occ(b, d) { var dim = daysInMonth(y, m), rc = b.recur || 'monthly'; if (rc === 'monthly') return d === Math.min(b.day || 1, dim); if (rc === 'weekly') return new Date(y, m, d).getDay() === (b.day == null ? 1 : b.day); if (rc === 'yearly') return b.month === m && d === Math.min(b.day || 1, dim); if (rc === 'once') return b.date === dkOf(y, m, d); return false; }
    function cnt(b) { var c = 0, dim = daysInMonth(y, m); for (var d = 1; d <= dim; d++) if (occ(b, d)) c++; return c; }
    var monthTotal = bills.reduce(function (s, b) { return s + cnt(b) * (+b.amount || 0); }, 0);
    var inM = bills.filter(function (b) { return cnt(b) > 0; });
    var paidC = inM.filter(function (b) { return b.recur !== 'weekly' && paid.some(function (p) { return p.id === b.id + '|' + y + '-' + pad(m + 1); }); }).length;
    var pre = y + '-' + pad(m + 1) + '-';
    var ns = nospend.filter(function (n) { return n && typeof n.id === 'string' && n.id.indexOf(pre) === 0; }).length;
    return 'This month: ' + r0(monthTotal) + ' committed across ' + inM.length + ' bills, ' + paidC + ' settled, ' + (inM.length - paidC) + ' open. ' + ns + ' no-spend day(s) so far.';
  }

  if (name === 'get_mind') {
    var hbList = await readArr('habits:list'); var hbLog = await readKey('habits:log'); var t2 = todayKey();
    var done = (hbLog && hbLog[t2]) ? Object.keys(hbLog[t2]).filter(function (k) { return hbLog[t2][k]; }).length : 0;
    var vids = await readArr('improve:videos'); var queue = vids.filter(function (v) { return v && !v.watched; }).length;
    var ihab = await readArr('improve:habits'); var adopting = ihab.filter(function (h) { return h && !h.adopted; }).length;
    return 'Habits today: ' + Math.min(done, hbList.length) + '/' + hbList.length + ' done.\nLearning queue: ' + queue + ' to watch.\nHabits being adopted: ' + adopting + '.';
  }

  if (name === 'get_life') {
    var seen = await readArr('movies:seen'), watch = await readArr('movies:watch');
    var rated = seen.filter(function (f) { return f && f.rating != null; });
    var avg = rated.length ? Math.round(rated.reduce(function (s, f) { return s + f.rating; }, 0) / rated.length) : null;
    return 'Films catalogued: ' + seen.length + (avg != null ? ' · taste rating ' + avg : '') + '\nWatchlist: ' + watch.length + ' queued.';
  }

  if (name === 'snapshot') {
    var p = await Promise.all([callTool('get_recovery', { limit: 3 }), callTool('get_nutrition', { days: 2 }), callTool('get_training', { limit: 3 }), callTool('get_body', {}), callTool('get_money', {}), callTool('get_mind', {})]);
    return '=== SNAPSHOT (' + todayKey() + ') ===\n\n[RECOVERY]\n' + p[0] + '\n\n[FUEL]\n' + p[1] + '\n\n[TRAINING]\n' + p[2] + '\n\n[BODY]\n' + p[3] + '\n\n[MONEY]\n' + p[4] + '\n\n[MIND]\n' + p[5];
  }

  /* ---- writes ---- */
  if (name === 'log_meal') {
    if (a.name == null || a.kcal == null) return 'Need at least name and kcal.';
    var d1 = a.date || todayKey();
    await mutateBundle('nutrition', function (b) {
      var logs = arr(b['nut:logs']);
      logs.push({ id: uid('m-'), ts: Date.now(), dateKey: d1, meal: a.meal || 'Snacks', name: String(a.name), grams: a.grams != null ? r0(a.grams) : null, source: 'claude', kcal: r0(a.kcal), p: r1(a.protein), c: r1(a.carbs), f: r1(a.fat), fiber: 0, sugar: 0, sodium: 0, satfat: 0 });
      b['nut:logs'] = logs;
    });
    return 'Logged "' + a.name + '" — ' + r0(a.kcal) + ' kcal' + (a.protein ? ', ' + r1(a.protein) + 'g protein' : '') + ' to ' + d1 + '.';
  }

  if (name === 'log_weight') {
    if (a.kg == null) return 'Need kg.';
    var d2 = a.date || todayKey();
    await mutateBundle('po-coach', function (b) {
      var w = arr(b['po_coach_weights']); var i = w.findIndex(function (e) { return e && e.dateKey === d2; });
      if (i >= 0) w[i] = { dateKey: d2, weight: +a.kg }; else w.push({ dateKey: d2, weight: +a.kg });
      b['po_coach_weights'] = w;
    });
    return 'Logged bodyweight ' + a.kg + 'kg for ' + d2 + '.';
  }

  if (name === 'add_water') {
    var d3 = a.date || todayKey(), g = a.glasses != null ? r0(a.glasses) : 1;
    await mutateBundle('health', function (b) {
      var w = b['po_water_v1'] || {}; if (!w.logs) w.logs = {}; w.logs[d3] = (+w.logs[d3] || 0) + g; b['po_water_v1'] = w;
    });
    return 'Added ' + g + ' glass(es) of water for ' + d3 + '.';
  }

  if (name === 'log_caffeine') {
    if (a.mg == null) return 'Need mg.';
    var when = a.date ? new Date(a.date + 'T12:00:00') : new Date();
    await mutateBundle('caffeine', function (b) {
      var logs = arr(b['caf:logs']);
      logs.push({ id: Date.now() + Math.floor(Math.random() * 1000), name: a.name || 'Caffeine', mg: r0(a.mg), emoji: '☕', ts: when.toISOString() });
      b['caf:logs'] = logs;
    });
    return 'Logged ' + r0(a.mg) + 'mg caffeine.';
  }

  if (name === 'log_sleep') {
    var d4 = a.date || todayKey();
    if (a.hours == null && a.recovery == null && a.quality == null && a.energy == null) return 'Provide at least one of hours/recovery/quality/energy.';
    await mutateBundle('sleep', function (b) {
      var logs = arr(b['sleep:logs']); var i = logs.findIndex(function (e) { return e && e.dateKey === d4; });
      var e = i >= 0 ? logs[i] : { id: 'sl-' + d4, dateKey: d4 };
      if (a.hours != null) e.hours = +a.hours;
      if (a.recovery != null) e.recovery = r0(a.recovery);
      if (a.quality != null) e.quality = r0(a.quality);
      if (a.energy != null) e.energy = r0(a.energy);
      if (i >= 0) logs[i] = e; else logs.push(e);
      b['sleep:logs'] = logs;
    });
    return 'Logged sleep for ' + d4 + '.';
  }

  if (name === 'mark_workout_done') {
    var d5 = a.date || todayKey();
    await mutateBundle('po-coach', function (b) { var done = b['po_coach_workout_done'] || {}; done[d5] = new Date().toISOString(); b['po_coach_workout_done'] = done; });
    return 'Marked workout done for ' + d5 + '.';
  }

  if (name === 'add_no_spend_day') {
    var d6 = a.date || todayKey();
    await mutateBundle('bills', function (b) { var ns = arr(b['bills:nospend']); if (!ns.some(function (n) { return n && n.id === d6; })) ns.push({ id: d6, ts: Date.now() }); b['bills:nospend'] = ns; });
    return 'Marked ' + d6 + ' as a no-spend day.';
  }

  if (name === 'mark_bill_paid') {
    var q = String(a.bill || '').toLowerCase(); var now2 = a.date ? new Date(a.date + 'T12:00:00') : new Date();
    var ym = now2.getFullYear() + '-' + pad(now2.getMonth() + 1); var msg = '';
    await mutateBundle('bills', function (b) {
      var items = arr(b['bills:items']); var bill = items.find(function (x) { return x && String(x.name || '').toLowerCase().indexOf(q) >= 0; });
      if (!bill) { msg = 'No bill matching "' + a.bill + '".'; return; }
      var paid = arr(b['bills:paid']); var pid = bill.id + '|' + ym;
      if (!paid.some(function (p) { return p.id === pid; })) paid.push({ id: pid, ts: Date.now() });
      b['bills:paid'] = paid; msg = 'Marked "' + bill.name + '" paid for ' + ym + '.';
    });
    return msg;
  }

  if (name === 'add_habit') {
    if (!a.name) return 'Need a habit name.';
    await mutateBundle('identity', function (b) { var list = arr(b['habits:list']); list.push({ id: uid('h-'), name: String(a.name), createdAt: Date.now() }); b['habits:list'] = list; });
    return 'Added habit "' + a.name + '".';
  }

  if (name === 'complete_habit') {
    var d7 = a.date || todayKey(), q2 = String(a.habit || '').toLowerCase(); var msg2 = '';
    await mutateBundle('identity', function (b) {
      var list = arr(b['habits:list']); var h = list.find(function (x) { return x && String(x.name || '').toLowerCase().indexOf(q2) >= 0; });
      if (!h) { msg2 = 'No habit matching "' + a.habit + '".'; return; }
      var log = b['habits:log'] || {}; if (!log[d7]) log[d7] = {}; log[d7][h.id] = Date.now(); b['habits:log'] = log;
      msg2 = 'Marked habit "' + h.name + '" done for ' + d7 + '.';
    });
    return msg2;
  }

  if (name === 'take_supplement') {
    var d8 = a.date || todayKey(), q3 = String(a.name || '').toLowerCase(); var msg3 = '';
    await mutateBundle('health', function (b) {
      var items = arr(b['stack:items']);
      if (!items.length) { msg3 = 'No supplement list found in your synced data (the default stack lives in-app). Open Supplements once on your phone to sync it, then try again.'; return; }
      var it = items.find(function (x) { return x && String(x.name || '').toLowerCase().indexOf(q3) >= 0; });
      if (!it) { msg3 = 'No supplement matching "' + a.name + '".'; return; }
      var tkey = 'stack:taken:' + d8; var taken = b[tkey] || {}; taken[it.id] = Date.now(); b[tkey] = taken;
      msg3 = 'Marked "' + it.name + '" taken for ' + d8 + '.';
    });
    return msg3;
  }

  if (name === 'log_movie') {
    if (!a.title) return 'Need a title.';
    await mutateBundle('movies', function (b) {
      var s = arr(b['movies:seen']);
      s.push({ id: uid(), title: String(a.title), year: a.year || null, genres: [], rating: a.rating != null ? r0(a.rating) : null, note: '', dateKey: todayKey(), ts: Date.now() });
      b['movies:seen'] = s;
    });
    return 'Logged "' + a.title + '" as watched' + (a.rating != null ? ' (' + r0(a.rating) + ')' : '') + '.';
  }

  if (name === 'add_to_watchlist') {
    if (!a.title) return 'Need a title.';
    await mutateBundle('movies', function (b) { var w = arr(b['movies:watch']); w.push({ id: uid(), title: String(a.title), year: a.year || null, genres: [], note: '', ts: Date.now() }); b['movies:watch'] = w; });
    return 'Added "' + a.title + '" to your watchlist.';
  }

  if (name === 'add_idea') {
    if (!a.text) return 'Need idea text.';
    await mutateBundle('ideas', function (b) {
      var list = arr(b['ideas:items']);
      list.unshift({ id: Date.now(), text: String(a.text), note: a.note || '', category: a.category || '', done: false, pinned: false, createdAt: new Date().toISOString(), doneAt: null });
      b['ideas:items'] = list;
    });
    return 'Captured idea: "' + a.text + '".';
  }

  if (name === 'add_learning') {
    if (!a.title) return 'Need a title.';
    await mutateBundle('improve', function (b) { var v = arr(b['improve:videos']); v.push({ id: uid(), title: String(a.title), url: a.url || '', source: '', topic: '', watched: false, note: '', ts: Date.now() }); b['improve:videos'] = v; });
    return 'Added "' + a.title + '" to your learning queue.';
  }

  if (name === 'journal_entry') {
    var d9 = a.date || todayKey();
    if (a.reflection == null && a.gratitude == null) return 'Provide reflection and/or gratitude.';
    await mutateBundle('identity', function (b) {
      var en = arr(b['journal:entries']); var i = en.findIndex(function (e) { return e && e.dateKey === d9; });
      var e = i >= 0 ? en[i] : { id: 'j-' + d9, dateKey: d9, reflection: '', gratitude: '', ts: Date.now() };
      if (a.reflection != null) e.reflection = String(a.reflection);
      if (a.gratitude != null) e.gratitude = String(a.gratitude);
      e.ts = Date.now();
      if (i >= 0) en[i] = e; else en.push(e);
      b['journal:entries'] = en;
    });
    return 'Saved journal entry for ' + d9 + '.';
  }

  throw new Error('Unknown tool: ' + name);
}

/* ======================= JSON-RPC ======================= */
function reply(id, result) { return { jsonrpc: '2.0', id: id, result: result }; }
function rpcError(id, code, message) { return { jsonrpc: '2.0', id: id, error: { code: code, message: message } }; }

async function handle(m) {
  if (!m || typeof m !== 'object') return null;
  var id = m.id, method = m.method;
  if (method === 'initialize') {
    return reply(id, {
      protocolVersion: (m.params && m.params.protocolVersion) || '2024-11-05',
      capabilities: { tools: { listChanged: false } },
      serverInfo: { name: 'ALS Dashboard', version: '2.0.0' },
      instructions: 'Personal performance dashboard for Alex. READ tools (snapshot, get_*) report his live data; WRITE tools (log_meal, log_weight, add_water, log_caffeine, log_sleep, mark_workout_done, mark_bill_paid, add_no_spend_day, add_habit, complete_habit, take_supplement, log_movie, add_to_watchlist, add_idea, add_learning, journal_entry) modify it. Dates are YYYY-MM-DD and default to today. Confirm destructive-sounding requests before writing.'
    });
  }
  if (typeof method === 'string' && method.indexOf('notifications/') === 0) return null;
  if (method === 'ping') return reply(id, {});
  if (method === 'tools/list') return reply(id, { tools: TOOLS });
  if (method === 'tools/call') {
    var nm = m.params && m.params.name, a = (m.params && m.params.arguments) || {};
    CACHE = {};
    try { var text = await callTool(nm, a); return reply(id, { content: [{ type: 'text', text: String(text) }] }); }
    catch (e) { return reply(id, { content: [{ type: 'text', text: 'Error: ' + ((e && e.message) || e) }], isError: true }); }
    finally { CACHE = null; }
  }
  if (id === undefined || id === null) return null;
  return rpcError(id, -32601, 'Method not found: ' + method);
}

/* ======================= HTTP ======================= */
function readJson(req) {
  if (req.body && typeof req.body === 'object') return Promise.resolve(req.body);
  return new Promise(function (resolve) { var d = ''; req.on('data', function (c) { d += c; }); req.on('end', function () { try { resolve(JSON.parse(d || '{}')); } catch (e) { resolve({}); } }); req.on('error', function () { resolve({}); }); });
}
function getToken(req) {
  var auth = req.headers['authorization'] || '';
  if (auth.indexOf('Bearer ') === 0) return auth.slice(7).trim();
  try { var u = new URL(req.url, 'http://x'); var t = u.searchParams.get('token'); if (t) return t; } catch (e) {}
  if (req.query && req.query.token) return String(req.query.token);
  return '';
}

module.exports = async function (req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method === 'GET') { res.status(405).setHeader('Allow', 'POST'); res.end('MCP server — POST JSON-RPC only.'); return; }
  if (req.method !== 'POST') { res.status(405).end(); return; }

  var expected = (process.env.MCP_TOKEN || '').trim();
  if (!expected) { res.status(500).json({ error: 'MCP_TOKEN not configured.' }); return; }
  if (getToken(req) !== expected) { res.status(401).json({ jsonrpc: '2.0', id: null, error: { code: -32001, message: 'Unauthorized' } }); return; }

  var body = await readJson(req);
  try {
    if (Array.isArray(body)) {
      var outs = []; for (var i = 0; i < body.length; i++) { var r = await handle(body[i]); if (r) outs.push(r); }
      if (!outs.length) { res.status(202).end(); return; }
      res.status(200).json(outs); return;
    }
    var one = await handle(body);
    if (!one) { res.status(202).end(); return; }
    res.status(200).json(one);
  } catch (e) {
    res.status(200).json(rpcError(body && body.id, -32603, 'Internal error: ' + ((e && e.message) || e)));
  }
};
