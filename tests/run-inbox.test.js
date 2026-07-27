// ════════════════════════════════════════════════════════════════
// run.html — the watch inbox drain (Garmin → intervals.icu → run:inbox).
//
// Why this suite exists: on 2026-07-27 Chrissie's 25 Jul 16.3 km long run was
// sitting in `run:inbox`, DOWNLOADED, with 136 KB of real FIT bytes, and her
// phone had never taken it. The server was healthy the whole time. The drain
// sent `Authorization: Bearer <publishable key>` whenever her session had not
// restored yet — a valid key with no identity, which RLS answers with 200 and
// an EMPTY array. "No session yet" and "nothing new" were the same response,
// and every other failure path was a bare `return`.
//
// So the rules locked here are: never send the anon key, and never exit
// quietly for any reason except a genuinely empty inbox.
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

var html = fs.readFileSync(path.join(__dirname, '..', 'run.html'), 'utf8');

// ── the region under test, lifted verbatim from the page ──────────────────
var start = html.indexOf("var ICU_SB_URL=");
var endMark = "document.addEventListener('als:auth', function(){";
var end = html.indexOf(endMark);
if (start < 0 || end < 0) { console.log('  ✗ FAIL could not locate the icu block in run.html'); process.exit(1); }
var src = html.slice(start, end);

console.log('\nrun.html — watch inbox drain');

// ── 1. the rule itself, asserted on the source ────────────────────────────
console.log('\n  the anon-key rule');
// Comments stripped first: the block deliberately NAMES the banned expression
// in the warning above icuHdr, and that must not read as the bug itself.
var code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');
ok('icuHdr never falls back to the publishable key', !/ICU_TOKEN\s*\|\|\s*ICU_SB_KEY/.test(code),
  /ICU_TOKEN\s*\|\|\s*ICU_SB_KEY/.test(code) ? 'found ICU_TOKEN||ICU_SB_KEY' : 'Bearer is JWT-only');
ok('the ack write still uses on_conflict=user_id,key', /on_conflict='\+\(ICU_UID\?'user_id,key'/.test(src));
// The ack tells the server to PRUNE the FIT bytes and mark the activity done at
// intervals, so it is destructive and irreversible. It may only ever follow a
// confirmed cloud write, never a bare localStorage persist() — acking on a local
// write is the same shape as advancing lastJson before the upsert, and it strands
// the run on one device with nothing left to recover it from.
var _confirmAt = code.indexOf('icuCloudHas(needIds)');
var _ackAt = code.indexOf('icuAck(newSeen)');
ok('the drain confirms the cloud before it acks', _confirmAt > 0 && _ackAt > _confirmAt,
  'confirm@' + _confirmAt + ' ack@' + _ackAt);
ok('the confirmation reads her row with the same JWT header', /app_state\?key=eq\.run&select=data[\s\S]{0,80}icuHdr\(\)/.test(code));

// ── 2. behaviour, driven through a stubbed page ───────────────────────────
function build(opts) {
  opts = opts || {};
  var store = Object.create(null);
  var state = {
    fetches: [], toasts: [], banners: [], warns: [], logs: [], persistFails: opts.persistFails || 0,
    rendered: 0, flushed: 0
  };

  function makeEl() {
    var el = { id: '', style: { cssText: '' }, children: [], firstChild: null, type: '', textContent: '' };
    el.appendChild = function (c) { el.children.push(c); if (!el.firstChild) el.firstChild = c; return c; };
    el.addEventListener = function () {};
    el.remove = function () { state.bannerEl = null; };
    return el;
  }

  var sandbox = {
    console: { warn: function (m) { state.warns.push(String(m)); }, log: function () {} },
    setTimeout: setTimeout, clearTimeout: clearTimeout, Date: Date, JSON: JSON, Math: Math,
    String: String, Number: Number, Array: Array, Object: Object, Promise: Promise, atob: null,
    document: {
      getElementById: function (id) { return id === 'runIcuBar' ? (state.bannerEl || null) : null; },
      createElement: function (t) { var e = makeEl(); e.tag = t; return e; },
      body: { appendChild: function (e) { state.bannerEl = e; state.banners.push(e); return e; } },
      documentElement: {}, addEventListener: function () {}
    },
    window: {},
    // page dependencies the block reaches for
    lsGet: function (k) { return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
    lsSet: function (k, v) { store[k] = String(v); return true; },
    lsRem: function (k) { delete store[k]; },
    toast: function (id, m) { state.toasts.push(m); },
    render: function () { state.rendered++; },
    flush: function () { state.flushed++; },
    logs: state.logs,
    K_LOGS: 'run:logs',
    __RUN_PEEK: false,
    persist: function (k, v) { if (state.persistFails > 0) { state.persistFails--; return false; } store[k] = JSON.stringify(v); return true; },
    uid: function () { return 'u' + Math.random().toString(36).slice(2, 7); },
    expandBytes: opts.expandBytes || function () { return Promise.resolve([{ date: new Date('2026-07-25T19:54:08'), distanceKm: 16.33, timeSec: 5503, route: [[1, 2], [3, 4]], series: [1, 2, 3], format: 'fit' }]); },
    findMatch: function () { return null; },
    canUpgrade: function () { return false; },
    applyUpgrade: function () {},
    runFromParsed: function (r) { return { id: 'r' + state.logs.length, date: '2026-07-25', distanceKm: r.distanceKm, timeSec: r.timeSec, route: r.route, series: r.series, laps: r.laps || null }; },
    fetch: function (url, init) {
      var u = String(url);
      state.fetches.push({ url: u, auth: (init && init.headers && init.headers.Authorization) || null });
      // Her cloud `run` row, read back to confirm the run actually landed before
      // the inbox item is acked. By default it mirrors whatever the page has
      // imported (i.e. sync.js's push succeeded); `cloudHas:false` is the device
      // whose push never left — the case that used to strand a run silently.
      if (u.indexOf('key=eq.run&') >= 0) {
        var cloud = opts.cloudHas === false ? [] : state.logs.map(function (x) { return { id: x.id }; });
        return Promise.resolve({ ok: true, status: 200, json: function () { return Promise.resolve([{ data: { 'run:logs': cloud } }]); } });
      }
      return Promise.resolve(opts.respond ? opts.respond(u) : { ok: true, status: 200, json: function () { return Promise.resolve([]); } });
    }
  };
  sandbox.atob = function (b64) { return Buffer.from(b64, 'base64').toString('binary'); };
  sandbox.window.ALSAuth = opts.session === undefined ? null : {
    client: { auth: { getSession: function () { return Promise.resolve({ data: { session: opts.session } }); } } }
  };
  sandbox.self = sandbox.window;

  vm.createContext(sandbox);
  vm.runInContext('(function(){' + src + '\nwindow.__t={icuDrainInbox:icuDrainInbox,icuHdr:icuHdr,icuEnsureToken:icuEnsureToken};})()', sandbox, { timeout: 20000 });
  return { sandbox: sandbox, state: state, store: store, api: sandbox.window.__t };
}

var SESSION = { access_token: 'HER.JWT.TOKEN', user: { id: 'chrissie-uid' } };
var FIT_B64 = Buffer.from('xxxxxxxx.FITrestofthefile').toString('base64');
function inboxReply(items) {
  return { ok: true, status: 200, json: function () { return Promise.resolve([{ data: { items: items } }]); } };
}

(async function () {
  // ── the happy path: her run actually lands ──────────────────────────────
  console.log('\n  a waiting run, with her session');
  var h = build({
    session: SESSION,
    respond: function (u) {
      if (u.indexOf('key=eq.run%3Ainbox') >= 0) return inboxReply([{ id: 'i169170852', name: 'Rhodes Running', date: '2026-07-25T19:54:08', fit: FIT_B64 }]);
      return { ok: true, status: 200, json: function () { return Promise.resolve([]); } };
    }
  });
  await h.api.icuDrainInbox();
  ok('the run is imported', h.state.logs.length === 1, h.state.logs.length + ' log(s)');
  ok('the read carried HER JWT, not the anon key', (h.state.fetches[0] || {}).auth === 'Bearer HER.JWT.TOKEN', String((h.state.fetches[0] || {}).auth).slice(0, 24));
  ok('the id is remembered locally', /i169170852/.test(h.store['run:icuSeen'] || ''));
  ok('the server is acked so it can prune', h.state.fetches.some(function (f) { return /on_conflict/.test(f.url); }));
  ok('she is told a run arrived', h.state.toasts.some(function (t) { return /Τρέξ|ρολόι/.test(t); }), h.state.toasts[0] || '(none)');
  ok('no failure banner is left behind', !h.state.bannerEl);
  ok('nothing is stored under run:icuErr', !h.store['run:icuErr']);

  // ── no session: must NOT fetch, and must say so ─────────────────────────
  console.log('\n  no session yet (the actual 25 Jul bug)');
  var n = build({ session: null, respond: function () { return inboxReply([]); } });
  await n.api.icuDrainInbox();
  ok('it never touches Supabase without a JWT', n.state.fetches.length === 0, n.state.fetches.length + ' request(s)');
  ok('it names the cause instead of returning quietly', !!n.store['run:icuErr'], n.store['run:icuErr'] || '(silent)');
  ok('the cause is nosession', /"code":"nosession"/.test(n.store['run:icuErr'] || ''));
  ok('a visible banner is raised', !!n.state.bannerEl);

  // ── a rejected read is not an empty inbox ───────────────────────────────
  console.log('\n  the session went stale (HTTP 401)');
  var s = build({ session: SESSION, respond: function () { return { ok: false, status: 401, json: function () { return Promise.resolve(null); } }; } });
  await s.api.icuDrainInbox();
  ok('401 is reported, not swallowed', /"code":"http401"/.test(s.store['run:icuErr'] || ''), s.store['run:icuErr'] || '(silent)');
  ok('the message tells her to sign in again', /ξαναμπ/.test(s.store['run:icuErr'] || ''));

  // ── an empty inbox is the one allowed quiet exit ────────────────────────
  console.log('\n  an inbox with nothing in it');
  var e = build({ session: SESSION, respond: function () { return inboxReply([]); } });
  await e.api.icuDrainInbox();
  ok('an empty inbox raises no alarm', !e.store['run:icuErr'] && !e.state.bannerEl);
  ok('and imports nothing', e.state.logs.length === 0);

  // ── storage full: keep the run, drop the map ────────────────────────────
  console.log('\n  the phone is full');
  var f = build({
    session: SESSION, persistFails: 1,
    respond: function (u) {
      if (u.indexOf('key=eq.run%3Ainbox') >= 0) return inboxReply([{ id: 'i169170852', name: 'Rhodes Running', date: '2026-07-25T19:54:08', fit: FIT_B64 }]);
      return { ok: true, status: 200, json: function () { return Promise.resolve([]); } };
    }
  });
  await f.api.icuDrainInbox();
  ok('the run survives', f.state.logs.length === 1, f.state.logs.length + ' log(s)');
  ok('the heavy fields were shed', f.state.logs.length === 1 && f.state.logs[0].series === null && f.state.logs[0].route === null);
  ok('the distance and time are kept', f.state.logs.length === 1 && f.state.logs[0].distanceKm === 16.33 && f.state.logs[0].timeSec === 5503);
  ok('and it says the map was dropped', /"code":"storage-lite"/.test(f.store['run:icuErr'] || ''), f.store['run:icuErr'] || '(silent)');

  // ── storage full twice: refuse to ack, so it retries ────────────────────
  console.log('\n  the phone is full and stays full');
  var f2 = build({
    session: SESSION, persistFails: 2,
    respond: function (u) {
      if (u.indexOf('key=eq.run%3Ainbox') >= 0) return inboxReply([{ id: 'i169170852', name: 'Rhodes Running', date: '2026-07-25T19:54:08', fit: FIT_B64 }]);
      return { ok: true, status: 200, json: function () { return Promise.resolve([]); } };
    }
  });
  await f2.api.icuDrainInbox();
  ok('no half-saved run is left in memory', f2.state.logs.length === 0, f2.state.logs.length + ' log(s)');
  ok('the id is NOT marked seen, so it retries', !f2.store['run:icuSeen']);
  ok('the server is NOT acked', !f2.state.fetches.some(function (x) { return /on_conflict/.test(x.url); }));
  ok('and she is told the phone is full', /"code":"storage"/.test(f2.store['run:icuErr'] || ''));

  // ── an unreadable file must not vanish without a word ───────────────────
  console.log('\n  a file the parser cannot read');
  var u = build({
    session: SESSION,
    expandBytes: function () { return Promise.resolve([]); },
    respond: function (uu) {
      if (uu.indexOf('key=eq.run%3Ainbox') >= 0) return inboxReply([{ id: 'i1', name: 'Rhodes Running', date: '2026-07-25T19:54:08', fit: FIT_B64 }]);
      return { ok: true, status: 200, json: function () { return Promise.resolve([]); } };
    }
  });
  await u.api.icuDrainInbox();
  ok('it is consumed so the drain cannot loop on it', /i1/.test(u.store['run:icuSeen'] || ''));
  ok('but it is reported, not silently dropped', /"code":"unreadable"/.test(u.store['run:icuErr'] || ''), u.store['run:icuErr'] || '(silent)');

  // ── the run is on the phone but never reached the cloud ─────────────────
  // This is the bug behind "I opened it on Safari and the new run wasn't
  // there": the drain acked (so the server pruned the FIT bytes and marked the
  // activity done at intervals) on the strength of a localStorage write that
  // sync.js had not yet pushed. The run then existed on exactly one device, and
  // Alex's read-only window — which reads the CLOUD — showed it missing.
  console.log('\n  the run saved locally but the push has not landed');
  var c = build({
    session: SESSION, cloudHas: false,
    respond: function (uu) {
      if (uu.indexOf('key=eq.run%3Ainbox') >= 0) return inboxReply([{ id: 'i169170852', name: 'Rhodes Running', date: '2026-07-25T19:54:08', fit: FIT_B64 }]);
      return { ok: true, status: 200, json: function () { return Promise.resolve([]); } };
    }
  });
  await c.api.icuDrainInbox();
  ok('she still sees her run immediately', c.state.logs.length === 1 && c.state.toasts.some(function (t) { return /ρολόι/.test(t); }));
  ok('the server is NOT acked, so the FIT bytes survive', !c.state.fetches.some(function (f) { return /on_conflict/.test(f.url); }));
  ok('the id is NOT marked seen, so the next open re-drains', !c.store['run:icuSeen']);
  ok('and the reason is recorded, not swallowed', /"code":"unconfirmed"/.test(c.store['run:icuErr'] || ''), c.store['run:icuErr'] || '(silent)');
  ok('it kept asking while the push had time to land', c.state.fetches.filter(function (f) { return /key=eq\.run&/.test(f.url); }).length >= 6);

  // A run already present locally is the repair case for anything stranded by
  // the old behaviour: re-draining it must confirm the CLOUD has it too, not
  // shrug because the phone already does.
  console.log('\n  a run already imported, still missing from the cloud');
  var m = build({
    session: SESSION, cloudHas: false,
    respond: function (uu) {
      if (uu.indexOf('key=eq.run%3Ainbox') >= 0) return inboxReply([{ id: 'i2', name: 'Rhodes Running', date: '2026-07-25T19:54:08', fit: FIT_B64 }]);
      return { ok: true, status: 200, json: function () { return Promise.resolve([]); } };
    }
  });
  m.sandbox.findMatch = function () { return { id: 'already-here' }; };
  await m.api.icuDrainInbox();
  ok('nothing is imported twice', m.state.logs.length === 0, m.state.logs.length + ' log(s)');
  ok('but it is still not acked away', !m.state.fetches.some(function (f) { return /on_conflict/.test(f.url); }));

  console.log('\n' + pass + ' passed, ' + fail + ' failed\n');
  process.exit(fail ? 1 : 0);
})().catch(function (e) { console.log('  ✗ FAIL threw → ' + (e && e.stack || e)); process.exit(1); });
