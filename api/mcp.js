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
function todayKey() { return dk(new Date()); } // UTC fallback only

/* ---------- timezone-aware dates (matches the app: reminders store prefs.tz) ---------- */
var TZ_CACHE = null;
async function getTz() { if (TZ_CACHE) return TZ_CACHE; try { var p = await supa.readRow('push:prefs'); TZ_CACHE = (p && p.tz) || 'Europe/Athens'; } catch (e) { TZ_CACHE = 'Europe/Athens'; } return TZ_CACHE; }
function fmtLocal(tz, date) { try { return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date); } catch (e) { return dk(date); } }
async function localToday() { return fmtLocal(await getTz(), new Date()); }
function shiftKey(key, days) { var d = new Date(key + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + days); return d.toISOString().slice(0, 10); }
async function resolveDate(arg) {
  if (!arg) return await localToday();
  var s = String(arg).trim().toLowerCase();
  if (s === 'today') return await localToday();
  if (s === 'yesterday') return shiftKey(await localToday(), -1);
  if (s === 'tomorrow') return shiftKey(await localToday(), 1);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  return await localToday();
}
function arr(v) { return Array.isArray(v) ? v : []; }
function r0(n) { return Math.round(+n || 0); }
function r1(n) { return Math.round((+n || 0) * 10) / 10; }
function daysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
function dkOf(y, m, d) { return y + '-' + pad(m + 1) + '-' + pad(d); }
function uid(p) { return (p || '') + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
// delete propagation: sync.js excludes tombstoned ids on merge (key matches idOf)
function idKeyOf(item) { if (item && typeof item === 'object') { if (item.id != null) return 'id:' + item.id; if (item.dateKey != null) return 'dk:' + item.dateKey; if (item.date != null) return 'dt:' + item.date; } return null; }
function tombstone(b, lsKey, item) { var k = idKeyOf(item); if (!k) return; if (!b._deletes) b._deletes = {}; if (!b._deletes[lsKey]) b._deletes[lsKey] = {}; b._deletes[lsKey][k] = Date.now(); }

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
  { name: 'journal_entry', description: 'Write/update a journal entry (reflection and/or gratitude) for a day.', inputSchema: { type: 'object', properties: { reflection: { type: 'string' }, gratitude: { type: 'string' }, date: { type: 'string' } } } },
  // more reads
  { name: 'get_supplements', description: 'Your supplement stack and which were taken on a day (default today).', inputSchema: { type: 'object', properties: { date: { type: 'string' } } } },
  { name: 'get_journal', description: 'Recent journal entries.', inputSchema: { type: 'object', properties: { limit: { type: 'number' } } } },
  { name: 'get_ideas', description: 'Your captured ideas (active by default; set include_done).', inputSchema: { type: 'object', properties: { limit: { type: 'number' }, include_done: { type: 'boolean' } } } },
  { name: 'get_watchlist', description: 'Films on your watchlist.', inputSchema: { type: 'object', properties: {} } },
  // updates / toggles
  { name: 'set_calorie_target', description: 'Set the daily calorie target.', inputSchema: { type: 'object', properties: { kcal: { type: 'number' } }, required: ['kcal'] } },
  { name: 'log_measurement', description: 'Log body tape measurements (cm) for a day.', inputSchema: { type: 'object', properties: { waist: { type: 'number' }, chest: { type: 'number' }, arms: { type: 'number' }, shoulders: { type: 'number' }, hips: { type: 'number' }, thigh: { type: 'number' }, calf: { type: 'number' }, neck: { type: 'number' }, forearm: { type: 'number' }, date: { type: 'string' } } } },
  { name: 'complete_learning', description: 'Mark a learning-queue item (by title) as watched.', inputSchema: { type: 'object', properties: { title: { type: 'string' } }, required: ['title'] } },
  { name: 'adopt_habit', description: 'Mark a "habit to build" (by text) as adopted.', inputSchema: { type: 'object', properties: { habit: { type: 'string' } }, required: ['habit'] } },
  { name: 'mark_idea_done', description: 'Mark an idea (by text) as done.', inputSchema: { type: 'object', properties: { idea: { type: 'string' } }, required: ['idea'] } },
  // undo / delete
  { name: 'remove_water', description: 'Remove glasses of water (undo) for a day.', inputSchema: { type: 'object', properties: { glasses: { type: 'number' }, date: { type: 'string' } } } },
  { name: 'delete_last_meal', description: 'Delete the most recent meal logged for a day.', inputSchema: { type: 'object', properties: { date: { type: 'string' } } } },
  { name: 'delete_idea', description: 'Delete an idea (by text).', inputSchema: { type: 'object', properties: { idea: { type: 'string' } }, required: ['idea'] } },
  { name: 'remove_from_watchlist', description: 'Remove a film (by title) from the watchlist.', inputSchema: { type: 'object', properties: { title: { type: 'string' } }, required: ['title'] } },
  { name: 'unmark_bill_paid', description: 'Undo marking a bill (by name) paid for the month.', inputSchema: { type: 'object', properties: { bill: { type: 'string' }, date: { type: 'string' } }, required: ['bill'] } },
  { name: 'remove_no_spend_day', description: 'Undo a no-spend day.', inputSchema: { type: 'object', properties: { date: { type: 'string' } } } }
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
    var nzTz = await getTz(), byDay = {};
    nut.forEach(function (e) {
      var d = (e && (e.dateKey || (e.ts ? fmtLocal(nzTz, new Date(e.ts)) : null))); if (!d) return;
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
    var pw = await readKey('po_water_v1'); var wlogs = (pw && pw.logs) || {}; var t = await localToday(); var bTz = await getTz();
    var caf = await readArr('caf:logs');
    var cafToday = caf.filter(function (e) { if (!e || !e.ts) return false; var d = new Date(e.ts); return !isNaN(d) && fmtLocal(bTz, d) === t; }).reduce(function (s, e) { return s + (+e.mg || 0); }, 0);
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
    var hbList = await readArr('habits:list'); var hbLog = await readKey('habits:log'); var t2 = await localToday();
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
    return '=== SNAPSHOT (' + (await localToday()) + ') ===\n\n[RECOVERY]\n' + p[0] + '\n\n[FUEL]\n' + p[1] + '\n\n[TRAINING]\n' + p[2] + '\n\n[BODY]\n' + p[3] + '\n\n[MONEY]\n' + p[4] + '\n\n[MIND]\n' + p[5];
  }

  /* ---- writes ---- */
  if (name === 'log_meal') {
    if (a.name == null || a.kcal == null) return 'Need at least name and kcal.';
    var d1 = await resolveDate(a.date);
    await mutateBundle('nutrition', function (b) {
      var logs = arr(b['nut:logs']);
      logs.push({ id: uid('m-'), ts: Date.now(), dateKey: d1, meal: a.meal || 'Snacks', name: String(a.name), grams: a.grams != null ? r0(a.grams) : null, source: 'claude', kcal: r0(a.kcal), p: r1(a.protein), c: r1(a.carbs), f: r1(a.fat), fiber: 0, sugar: 0, sodium: 0, satfat: 0 });
      b['nut:logs'] = logs;
    });
    return 'Logged "' + a.name + '" — ' + r0(a.kcal) + ' kcal' + (a.protein ? ', ' + r1(a.protein) + 'g protein' : '') + ' to ' + d1 + '.';
  }

  if (name === 'log_weight') {
    if (a.kg == null) return 'Need kg.';
    var d2 = await resolveDate(a.date);
    await mutateBundle('po-coach', function (b) {
      var w = arr(b['po_coach_weights']); var i = w.findIndex(function (e) { return e && e.dateKey === d2; });
      var rec = { dateKey: d2, weight: +a.kg, ts: Date.now() }; // ts → wins mergeWeights on same-day update
      if (i >= 0) w[i] = rec; else w.push(rec);
      b['po_coach_weights'] = w;
    });
    return 'Logged bodyweight ' + a.kg + 'kg for ' + d2 + '.';
  }

  if (name === 'add_water') {
    var d3 = await resolveDate(a.date), g = a.glasses != null ? r0(a.glasses) : 1, newCount = g;
    await mutateBundle('health', function (b) {
      var w = b['po_water_v1'] || {}; if (!w.logs) w.logs = {}; w.logs[d3] = (+w.logs[d3] || 0) + g; newCount = w.logs[d3];
      w._ts = Date.now(); // water merges last-write-wins by _ts; stamp it or the client reverts our change
      b['po_water_v1'] = w;
    });
    return 'Added ' + g + ' glass(es) of water for ' + d3 + ' — now ' + newCount + ' total.';
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
    var d4 = await resolveDate(a.date);
    if (a.hours == null && a.recovery == null && a.quality == null && a.energy == null) return 'Provide at least one of hours/recovery/quality/energy.';
    await mutateBundle('sleep', function (b) {
      var logs = arr(b['sleep:logs']); var i = logs.findIndex(function (e) { return e && e.dateKey === d4; });
      var e = i >= 0 ? logs[i] : { id: 'sl-' + d4, dateKey: d4 };
      if (a.hours != null) e.hours = +a.hours;
      if (a.recovery != null) e.recovery = r0(a.recovery);
      if (a.quality != null) e.quality = r0(a.quality);
      if (a.energy != null) e.energy = r0(a.energy);
      e.ts = Date.now(); // ts → wins mergeArray on same-night update
      if (i >= 0) logs[i] = e; else logs.push(e);
      b['sleep:logs'] = logs;
    });
    return 'Logged sleep for ' + d4 + '.';
  }

  if (name === 'mark_workout_done') {
    var d5 = await resolveDate(a.date);
    await mutateBundle('po-coach', function (b) { var done = b['po_coach_workout_done'] || {}; done[d5] = new Date().toISOString(); b['po_coach_workout_done'] = done; });
    return 'Marked workout done for ' + d5 + '.';
  }

  if (name === 'add_no_spend_day') {
    var d6 = await resolveDate(a.date);
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
    var d7 = await resolveDate(a.date), q2 = String(a.habit || '').toLowerCase(); var msg2 = '';
    await mutateBundle('identity', function (b) {
      var list = arr(b['habits:list']); var h = list.find(function (x) { return x && String(x.name || '').toLowerCase().indexOf(q2) >= 0; });
      if (!h) { msg2 = 'No habit matching "' + a.habit + '".'; return; }
      var log = b['habits:log'] || {}; if (!log[d7]) log[d7] = {}; log[d7][h.id] = Date.now(); b['habits:log'] = log;
      msg2 = 'Marked habit "' + h.name + '" done for ' + d7 + '.';
    });
    return msg2;
  }

  if (name === 'take_supplement') {
    var d8 = await resolveDate(a.date), q3 = String(a.name || '').toLowerCase(); var msg3 = '';
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
    var dkLocal = await localToday();
    await mutateBundle('movies', function (b) {
      var s = arr(b['movies:seen']);
      s.push({ id: uid(), title: String(a.title), year: a.year || null, genres: [], rating: a.rating != null ? r0(a.rating) : null, note: '', dateKey: dkLocal, ts: Date.now() });
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
    var d9 = await resolveDate(a.date);
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

  /* ---- more reads ---- */
  if (name === 'get_supplements') {
    var sd = await resolveDate(a.date);
    var items = await readArr('stack:items');
    var taken = (await readKey('stack:taken:' + sd)) || {};
    if (!items.length) return 'No supplement stack synced yet (the default stack lives in-app — open Supplements once on your phone to sync it).';
    var tk = items.filter(function (it) { return taken[it.id]; }).length;
    return 'Supplements ' + sd + ' — ' + tk + '/' + items.length + ' taken:\n' + items.map(function (it) { return (taken[it.id] ? '✓ ' : '· ') + (it.name || it.id) + (it.window ? ' (' + it.window + ')' : ''); }).join('\n');
  }
  if (name === 'get_journal') {
    var je = (await readArr('journal:entries')).slice(-(+a.limit || 5)).reverse();
    if (!je.length) return 'No journal entries yet.';
    return je.map(function (e) { return (e.dateKey || '?') + ((e.reflection || '').trim() ? '\n  Reflection: ' + e.reflection : '') + ((e.gratitude || '').trim() ? '\n  Gratitude: ' + e.gratitude : ''); }).join('\n\n');
  }
  if (name === 'get_ideas') {
    var ideas = await readArr('ideas:items'); var inc = a.include_done === true;
    var list = ideas.filter(function (x) { return x && (inc || !x.done); }).slice(0, (+a.limit || 15));
    if (!list.length) return 'No ideas captured yet.';
    return list.map(function (x) { return (x.done ? '✓ ' : '· ') + (x.text || '') + (x.category ? ' [' + x.category + ']' : ''); }).join('\n');
  }
  if (name === 'get_watchlist') {
    var w0 = await readArr('movies:watch');
    if (!w0.length) return 'Watchlist is empty.';
    return 'Watchlist (' + w0.length + '):\n' + w0.map(function (f) { return '· ' + (f.title || '') + (f.year ? ' (' + f.year + ')' : ''); }).join('\n');
  }

  /* ---- updates / toggles ---- */
  if (name === 'set_calorie_target') {
    if (a.kcal == null) return 'Need kcal.';
    await mutateBundle('nutrition', function (b) { var p = b['nut:profile'] || {}; p.calTarget = r0(a.kcal); p._ts = Date.now(); b['nut:profile'] = p; });
    return 'Set calorie target to ' + r0(a.kcal) + ' kcal/day.';
  }
  if (name === 'log_measurement') {
    var md = await resolveDate(a.date);
    var fld = ['waist', 'chest', 'arms', 'shoulders', 'hips', 'thigh', 'calf', 'neck', 'forearm'];
    if (!fld.some(function (f) { return a[f] != null; })) return 'Provide at least one measurement (waist, chest, arms, …).';
    var logged = [];
    await mutateBundle('body-measure', function (b) {
      var logs = arr(b['bm:logs']); var i = logs.findIndex(function (e) { return e && e.dateKey === md; });
      var rec = i >= 0 ? logs[i] : { dateKey: md };
      fld.forEach(function (f) { if (a[f] != null) { rec[f] = +a[f]; logged.push(f + ' ' + (+a[f]) + 'cm'); } });
      rec.ts = Date.now();
      if (i >= 0) logs[i] = rec; else logs.push(rec);
      b['bm:logs'] = logs;
    });
    return 'Logged for ' + md + ': ' + logged.join(', ') + '.';
  }
  if (name === 'complete_learning') {
    var lq = String(a.title || '').toLowerCase(), lmsg = 'No queue item matching "' + a.title + '".';
    await mutateBundle('improve', function (b) {
      var v = arr(b['improve:videos']); var it = v.find(function (x) { return x && String(x.title || '').toLowerCase().indexOf(lq) >= 0; });
      if (!it) return; it.watched = true; it.ts = Date.now(); b['improve:videos'] = v; lmsg = 'Marked "' + it.title + '" watched.';
    });
    return lmsg;
  }
  if (name === 'adopt_habit') {
    var aq = String(a.habit || '').toLowerCase(), amsg = 'No habit-to-build matching "' + a.habit + '".';
    await mutateBundle('improve', function (b) {
      var h = arr(b['improve:habits']); var it = h.find(function (x) { return x && String(x.text || '').toLowerCase().indexOf(aq) >= 0; });
      if (!it) return; it.adopted = true; it.ts = Date.now(); b['improve:habits'] = h; amsg = 'Marked "' + it.text + '" as adopted.';
    });
    return amsg;
  }
  if (name === 'mark_idea_done') {
    var iq = String(a.idea || '').toLowerCase(), imsg = 'No idea matching "' + a.idea + '".';
    await mutateBundle('ideas', function (b) {
      var list = arr(b['ideas:items']); var it = list.find(function (x) { return x && String(x.text || '').toLowerCase().indexOf(iq) >= 0; });
      if (!it) return; it.done = true; it.doneAt = new Date().toISOString(); it.ts = Date.now(); b['ideas:items'] = list; imsg = 'Marked idea "' + it.text + '" done.';
    });
    return imsg;
  }

  /* ---- undo / delete (remove + tombstone so it doesn't resurrect on sync) ---- */
  if (name === 'remove_water') {
    var rwd = await resolveDate(a.date), rg = a.glasses != null ? r0(a.glasses) : 1, rnc = 0;
    await mutateBundle('health', function (b) {
      var w = b['po_water_v1'] || {}; if (!w.logs) w.logs = {}; rnc = Math.max(0, (+w.logs[rwd] || 0) - rg);
      if (rnc === 0) delete w.logs[rwd]; else w.logs[rwd] = rnc; w._ts = Date.now(); b['po_water_v1'] = w;
    });
    return 'Removed ' + rg + ' glass(es) of water for ' + rwd + ' — now ' + rnc + ' total.';
  }
  if (name === 'delete_last_meal') {
    var dmd = await resolveDate(a.date), dmsg = 'No meals logged for ' + dmd + '.';
    await mutateBundle('nutrition', function (b) {
      var logs = arr(b['nut:logs']); var idx = -1, best = -1;
      for (var i = 0; i < logs.length; i++) { var e = logs[i]; if (e && e.dateKey === dmd) { var t = +e.ts || 0; if (t >= best) { best = t; idx = i; } } }
      if (idx < 0) return; var rem = logs[idx]; logs.splice(idx, 1); b['nut:logs'] = logs; tombstone(b, 'nut:logs', rem);
      dmsg = 'Deleted "' + (rem.name || 'meal') + '" (' + r0(rem.kcal) + ' kcal) from ' + dmd + '.';
    });
    return dmsg;
  }
  if (name === 'delete_idea') {
    var diq = String(a.idea || '').toLowerCase(), dimsg = 'No idea matching "' + a.idea + '".';
    await mutateBundle('ideas', function (b) {
      var list = arr(b['ideas:items']); var idx = list.findIndex(function (x) { return x && String(x.text || '').toLowerCase().indexOf(diq) >= 0; });
      if (idx < 0) return; var rem = list[idx]; list.splice(idx, 1); b['ideas:items'] = list; tombstone(b, 'ideas:items', rem); dimsg = 'Deleted idea "' + rem.text + '".';
    });
    return dimsg;
  }
  if (name === 'remove_from_watchlist') {
    var rwq = String(a.title || '').toLowerCase(), rwmsg = 'No watchlist film matching "' + a.title + '".';
    await mutateBundle('movies', function (b) {
      var w = arr(b['movies:watch']); var idx = w.findIndex(function (x) { return x && String(x.title || '').toLowerCase().indexOf(rwq) >= 0; });
      if (idx < 0) return; var rem = w[idx]; w.splice(idx, 1); b['movies:watch'] = w; tombstone(b, 'movies:watch', rem); rwmsg = 'Removed "' + rem.title + '" from the watchlist.';
    });
    return rwmsg;
  }
  if (name === 'unmark_bill_paid') {
    var ubq = String(a.bill || '').toLowerCase(), un = a.date ? new Date(a.date + 'T12:00:00') : new Date(), uym = un.getFullYear() + '-' + pad(un.getMonth() + 1), ubmsg = 'No matching bill.';
    await mutateBundle('bills', function (b) {
      var items = arr(b['bills:items']); var bill = items.find(function (x) { return x && String(x.name || '').toLowerCase().indexOf(ubq) >= 0; });
      if (!bill) { ubmsg = 'No bill matching "' + a.bill + '".'; return; }
      var paid = arr(b['bills:paid']); var pid = bill.id + '|' + uym; var idx = paid.findIndex(function (p) { return p.id === pid; });
      if (idx < 0) { ubmsg = '"' + bill.name + '" wasn’t marked paid for ' + uym + '.'; return; }
      var rem = paid[idx]; paid.splice(idx, 1); b['bills:paid'] = paid; tombstone(b, 'bills:paid', rem); ubmsg = 'Unmarked "' + bill.name + '" paid for ' + uym + '.';
    });
    return ubmsg;
  }
  if (name === 'remove_no_spend_day') {
    var rnd = await resolveDate(a.date), rnmsg = rnd + ' was not a no-spend day.';
    await mutateBundle('bills', function (b) {
      var ns = arr(b['bills:nospend']); var idx = ns.findIndex(function (n) { return n && n.id === rnd; });
      if (idx < 0) return; var rem = ns[idx]; ns.splice(idx, 1); b['bills:nospend'] = ns; tombstone(b, 'bills:nospend', rem); rnmsg = 'Removed no-spend mark on ' + rnd + '.';
    });
    return rnmsg;
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
    CACHE = {}; TZ_CACHE = null;
    try { var text = await callTool(nm, a); return reply(id, { content: [{ type: 'text', text: String(text) }] }); }
    catch (e) { return reply(id, { content: [{ type: 'text', text: 'Error: ' + ((e && e.message) || e) }], isError: true }); }
    finally { CACHE = null; TZ_CACHE = null; }
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
