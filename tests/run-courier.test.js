// ════════════════════════════════════════════════════════════════
// api/run-reminders.js — the courier's delivery bookkeeping.
//
// Why this suite exists: on 2026-07-27 `?icu=diag` showed her 25 Jul 16.3 km
// long run as `doneIds` + `acked`, with `pending: []` — i.e. the courier had
// downloaded it, an app had said "got it", and the FIT bytes had been pruned.
// Alex still could not see the run anywhere. The ack had followed a plain
// localStorage write that sync.js never managed to push, so the run existed on
// exactly one phone and the only other copy had already been thrown away.
//
// The rule locked here: `doneIds`/`seenIds` are bookkeeping, HER CLOUD ROW is
// the proof. Anything the courier delivered that is not in `run:logs` gets
// re-offered — once per activity, ever, so a deliberate delete cannot be
// resurrected hourly — and re-offering must also "un-see" the id or the next
// tick's seen-filter would prune it before her phone ever opened.
//
// node tests/run-courier.test.js
// ════════════════════════════════════════════════════════════════
'use strict';
var fs = require('fs');
var path = require('path');
var vm = require('vm');

var pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ✓ ' + name + (extra ? ' → ' + extra : '')); }
  else { fail++; console.log('  ✗ FAIL ' + name + (extra ? ' → ' + extra : '')); }
}

var js = fs.readFileSync(path.join(__dirname, '..', 'api', 'run-reminders.js'), 'utf8');
var start = js.indexOf('async function icuCheck() {');
var end = js.indexOf('// ── ?icu=diag');
if (start < 0 || end < 0) { console.log('  ✗ FAIL could not locate icuCheck in run-reminders.js'); process.exit(1); }
var src = js.slice(start, end);

console.log('\napi/run-reminders.js — courier delivery bookkeeping');

var RUN_ID = 'i169170852';
function activity(over) {
  return Object.assign({
    id: RUN_ID, start_date_local: '2026-07-25T19:54:08', source: 'GARMIN_CONNECT',
    distance: 16330, moving_time: 5503, name: 'Rhodes Running'
  }, over || {});
}
// The 16.3 km run as her app stores it: local date key + km, which is exactly
// what the client's own findMatch() compares on.
function logged(over) {
  return Object.assign({ id: 'r-local-1', date: '2026-07-25', distanceKm: 16.33, timeSec: 5503 }, over || {});
}

function run(opts) {
  opts = opts || {};
  var rows = opts.rows || {};
  var writes = [];
  var sandbox = {
    console: { warn: function () {}, log: function () {} },
    process: { env: { ICU_ATHLETE_ID: 'i640239', ICU_API_KEY: 'k' } },
    Buffer: Buffer, Date: Date, JSON: JSON, Math: Math, String: String, Number: Number,
    Array: Array, Object: Object, Promise: Promise, encodeURIComponent: encodeURIComponent,
    icuLooksLikeActivity: function () { return true; },
    supa: {
      RUNNER_ID: 'chrissie-uid',
      readRow: function (key) { return Promise.resolve(rows[key] || {}); },
      writeRow: function (key, data) { writes.push({ key: key, data: data }); rows[key] = data; return Promise.resolve(); }
    },
    fetch: function (url) {
      var u = String(url);
      if (u.indexOf('/activities?') >= 0) {
        return Promise.resolve({ ok: true, status: 200, json: function () { return Promise.resolve(opts.acts || [activity()]); } });
      }
      if (/\/activity\/[^/]+$/.test(u)) {
        return Promise.resolve({ ok: true, status: 200, json: function () { return Promise.resolve({ type: 'Run', name: 'Rhodes Running', distance: 16330 }); } });
      }
      if (/fit-file$/.test(u)) {
        return Promise.resolve({ ok: true, status: 200, arrayBuffer: function () { return Promise.resolve(Buffer.from('....FIT-bytes-here')); } });
      }
      return Promise.resolve({ ok: true, status: 200, json: function () { return Promise.resolve({}); } });
    }
  };
  vm.createContext(sandbox);
  vm.runInContext('(function(){' + src + '\nthis.__check=icuCheck;})()', sandbox);
  return sandbox.__check().then(function (out) { return { out: out, rows: rows, writes: writes }; });
}

(async function () {
  // ── a brand new run ─────────────────────────────────────────────────────
  console.log('\n  a run intervals has and the courier has never seen');
  var fresh = await run({ rows: {} });
  ok('it is downloaded into the inbox', fresh.out.added === 1, JSON.stringify(fresh.out.added));
  ok('and parked as a pending item', (fresh.rows['run:inbox'].items || []).length === 1);
  ok('no re-delivery was spent on it', fresh.out.redelivered === 0);

  // ── the steady state: delivered AND in her app ──────────────────────────
  console.log('\n  delivered, acked, and really in her app');
  var settled = await run({
    rows: {
      'run:inbox': { doneIds: [RUN_ID], items: [] },
      'run:inbox-ack': { seenIds: [RUN_ID] },
      'run': { 'run:logs': [logged()] }
    }
  });
  ok('nothing is downloaded again', settled.out.added === 0);
  ok('nothing is re-delivered', settled.out.redelivered === 0);
  ok('her ack row is left alone', !settled.writes.some(function (w) { return w.key === 'run:inbox-ack'; }));

  // ── THE BUG: acked, pruned, and missing from her account ────────────────
  console.log('\n  acked and pruned, but her account does not have it');
  var lost = await run({
    rows: {
      'run:inbox': { doneIds: [RUN_ID], items: [] },
      'run:inbox-ack': { seenIds: [RUN_ID] },
      'run': { 'run:logs': [logged({ id: 'r-other', date: '2026-07-22', distanceKm: 5.01 })] }
    }
  });
  ok('the courier fetches it again', lost.out.added === 1, 'added=' + lost.out.added);
  ok('it counts as a re-delivery', lost.out.redelivered === 1);
  ok('the FIT bytes are back in her inbox', (lost.rows['run:inbox'].items || []).length === 1);
  ok('the id is un-seen, or the next tick would prune it', (lost.rows['run:inbox-ack'].seenIds || []).indexOf(RUN_ID) < 0);
  ok('and it is recorded so this can happen only once', (lost.rows['run:inbox'].redelivered || []).indexOf(RUN_ID) >= 0);

  // ── the resurrection guard ──────────────────────────────────────────────
  console.log('\n  a run she deleted on purpose, after its one re-delivery');
  var deleted = await run({
    rows: {
      'run:inbox': { doneIds: [RUN_ID], items: [], redelivered: [RUN_ID] },
      'run:inbox-ack': { seenIds: [RUN_ID] },
      'run': { 'run:logs': [logged({ id: 'r-other', date: '2026-07-22', distanceKm: 5.01 })] }
    }
  });
  ok('it is NOT delivered a second time', deleted.out.added === 0, 'added=' + deleted.out.added);
  ok('so a deliberate delete cannot come back hourly', deleted.out.redelivered === 0);

  // ── the read that failed ────────────────────────────────────────────────
  // An unreadable row and an empty history are the same value. Reading the
  // first as the second would re-download her entire month.
  console.log('\n  her run row could not be read');
  var blind = await run({
    rows: {
      'run:inbox': { doneIds: [RUN_ID], items: [] },
      'run:inbox-ack': { seenIds: [RUN_ID] },
      'run': {}
    }
  });
  ok('it re-delivers NOTHING rather than guessing', blind.out.added === 0 && blind.out.redelivered === 0);

  // ── one tick cannot flood ───────────────────────────────────────────────
  console.log('\n  ten delivered runs, none of them in her app');
  var many = [];
  for (var i = 0; i < 10; i++) many.push(activity({ id: 'i' + i, start_date_local: '2026-07-' + (10 + i) + 'T08:00:00' }));
  var flood = await run({
    acts: many,
    rows: {
      'run:inbox': { doneIds: many.map(function (a) { return a.id; }), items: [] },
      'run:inbox-ack': { seenIds: [] },
      'run': { 'run:logs': [logged({ date: '2026-06-01', distanceKm: 3 })] }
    }
  });
  ok('at most three are re-delivered per tick', flood.out.redelivered === 3, 'redelivered=' + flood.out.redelivered);
  ok('the rest wait for the next tick', (flood.rows['run:inbox'].redelivered || []).length === 3);

  // ── Strava stays out of it ──────────────────────────────────────────────
  console.log('\n  a Strava activity missing from her app');
  var strava = await run({
    acts: [activity({ id: 'sv1', source: 'STRAVA' })],
    rows: {
      'run:inbox': { doneIds: [], items: [] },
      'run:inbox-ack': { seenIds: [] },
      'run': { 'run:logs': [logged({ date: '2026-06-01', distanceKm: 3 })] }
    }
  });
  ok('it is never fetched (intervals returns 422 for these)', strava.out.added === 0 && strava.out.strava === 1);

  console.log('\n' + pass + ' passed, ' + fail + ' failed\n');
  process.exit(fail ? 1 : 0);
})().catch(function (e) { console.log('  ✗ FAIL threw → ' + (e && e.stack || e)); process.exit(1); });
