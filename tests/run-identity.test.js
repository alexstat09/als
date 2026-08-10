// ════════════════════════════════════════════════════════════════
// run.html — WHOSE app is this? (owner read-only window vs the runner's app)
//
// Why this suite exists: on 2026-07-27 Alex opened the running page on Safari
// and "the new run wasn't there". Nothing had been lost. The page had simply
// answered the identity question wrong, silently, and there were two ways to do
// that:
//
//   · the synchronous check parsed every `sb-*-auth-token` out of localStorage.
//     supabase-js CHUNKS a large session across `…-auth-token.0`/`.1`, and
//     neither fragment is parseable JSON, so the OWNER read as "not the owner"
//     on exactly the devices holding a big session.
//   · the fallback was a NETWORK probe, and every one of its failures — session
//     not restored yet, offline, a cold serverless start, the _auth rate limit —
//     was collapsed into `return false`, meaning "this is the runner".
//
// Answer "runner" for Alex and the page starts a cloud sync on HIS account and
// renders HIS own pre-migration `run` row: her runs, frozen on 13 Jul, complete
// enough to read as "the app is just behind". Answer "peek" for Chrissie and her
// real app renders EMPTY.
//
// So the rules locked here: decide from the SESSION's user id, wait for it, and
// never resolve "I could not tell" into either account.
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
var start = html.indexOf("/* ── WHO IS THIS? The session's own user id, awaited.");
var end = html.indexOf('\n    initBeat();');
if (start < 0 || end < 0) { console.log('  ✗ FAIL could not locate the identity block in run.html'); process.exit(1); }
var src = html.slice(start, end);
var code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');

var OWNER = '1655556c-97af-43ac-970f-fcbdbd8f7f0c';
var RUNNER = 'chrissie-uid';

console.log('\nrun.html — whose app is this');

// ── 1. the rules, asserted on the source ──────────────────────────────────
console.log('\n  the rules');
ok('the owner check no longer hand-parses stored JWTs',
  !/sb-[\s\S]{0,40}auth-token/.test(html.slice(0, html.indexOf('initBeat();'))) || !/__ownerSignedIn/.test(html));
ok('__ownerSignedIn is gone entirely', !/__ownerSignedIn/.test(html));
ok('the network probe that answered "runner" on any failure is gone', !/peekProbe/.test(html));
ok('the pre-paint hint is an exact match on als:uid, never ?peek=1',
  /__RUN_PEEK\s*=\s*\(__uidHint\(\)\s*===\s*OWNER_UID\)/.test(html));
ok('a peek 403 never falls through to the runner path',
  !/status===403[\s\S]{0,120}location\.replace/.test(code) && !/status===403[\s\S]{0,120}icuSync/.test(code));

// ── 2. behaviour ──────────────────────────────────────────────────────────
function build(opts) {
  opts = opts || {};
  var state = { peeked: 0, synced: 0, drained: 0, rendered: 0, banners: [], icuBanners: [], fails: [], initCalls: [] };
  var sandbox = {
    console: { warn: function () {}, log: function () {} },
    setTimeout: setTimeout, clearTimeout: clearTimeout, setInterval: function () {},
    Date: Date, JSON: JSON, Math: Math, String: String, Object: Object, Promise: Promise,
    document: {
      addEventListener: function (ev, fn) { (state.listeners = state.listeners || {})[ev] = fn; },
      getElementById: function () { return null; },
      hidden: false
    },
    OWNER_UID: OWNER,
    __RUN_PEEK: !!opts.hintOwner,
    __peekStore: opts.hintOwner ? {} : null,
    K_PROF: 'run:profile', K_PLAN: 'run:plan', K_LOGS: 'run:logs', K_SHIFT: 'run:shifts',
    K_STR: 'run:strength', K_SHOES: 'run:shoes', K_KNEE: 'run:knee', K_SPICS: 'run:shoePics',
    icuClient: function () {
      if (opts.session === undefined) return null;                 // client not up yet
      return { auth: { getSession: function () { return Promise.resolve({ data: { session: opts.session } }); } } };
    },
    icuFail: function (codeName, msg) { state.fails.push(codeName); },
    icuBanner: function (m) { state.icuBanners.push(m); },
    icuSync: function () { state.synced++; },
    icuDrainInbox: function () { state.drained++; return Promise.resolve(); },
    render: function () { state.rendered++; },
    peekBanner: function (m) { state.banners.push(m); },
    peekFetch: function () { state.peeked++; }
  };
  sandbox.window = {
    addEventListener: function () {},
    __RUN_PEEK_INSTALL: function () { sandbox.__peekStore = {}; sandbox.window.__RUN_PEEK = true; },
    // A healthy device: vendor/supabase.min.js has executed. startCloudSync now
    // waits for THIS as well as for initCloudSync, because sync.js returns
    // silently without it — which used to leave the page with no engine, no
    // deletion tombstones and no push for its whole life.
    supabase: opts.noSupabase ? undefined : { createClient: function () { return {}; } },
    // Mirror what sync.js really does: ALSSync is published synchronously, and
    // startCloudSync reads it back to confirm the call actually took.
    initCloudSync: function (cfg) { state.initCalls.push(cfg); sandbox.window.ALSSync = { flush: function () {}, drop: function () {} }; }
  };
  if (opts.alsAuthUser) sandbox.window.ALSAuth = { user: { id: opts.alsAuthUser } };
  sandbox.self = sandbox.window;
  vm.createContext(sandbox);
  vm.runInContext('(function(){' + src + '\nwindow.__t={resolve:__resolveMode};})()', sandbox);
  return { sandbox: sandbox, state: state, api: sandbox.window.__t };
}

var HER = { user: { id: RUNNER }, access_token: 'HER.JWT' };
var HIS = { user: { id: OWNER }, access_token: 'HIS.JWT' };

(async function () {
  // ── Chrissie ────────────────────────────────────────────────────────────
  console.log('\n  her phone, her session');
  var r = build({ session: HER });
  var m1 = await r.api.resolve();
  ok('she is resolved as the runner', m1 === false, String(m1));
  ok('her cloud sync engine is started', r.state.initCalls.length === 1);
  ok('it syncs the run row with all her keys',
    r.state.initCalls[0] && r.state.initCalls[0].appKey === 'run' && r.state.initCalls[0].syncedKeys.length === 8);
  ok('the engine starts BEFORE the drain, so flush() is real',
    r.state.initCalls.length === 1 && r.state.synced === 1);
  ok('no read-only window is opened over her app', r.state.peeked === 0);

  // The trap this replaces: Home's Running tile always carries ?peek=1, so
  // honouring that param put the shadow up over HER app and hid every run.
  console.log('\n  her phone, arriving via Home\'s ?peek=1 tile');
  ok('?peek=1 is not consulted anywhere in the boot path', !/peek=1/.test(code));

  // ── Alex ────────────────────────────────────────────────────────────────
  console.log('\n  his device, his session');
  var o = build({ session: HIS });
  var m2 = await o.api.resolve();
  ok('he is resolved as the owner', m2 === true, String(m2));
  ok('the read-only window opens', o.state.peeked === 1);
  ok('NOTHING syncs on his account', o.state.initCalls.length === 0);
  ok('and nothing drains her inbox into it', o.state.synced === 0 && o.state.drained === 0);

  // ── the Safari failure: session not restored when the page boots ─────────
  console.log('\n  his device, session restored a moment late');
  var slow = build({ session: undefined });
  slow.sandbox.icuClient = (function () {
    var n = 0;
    return function () {
      if (n++ < 5) return null;                                    // topbar.js has not run yet
      return { auth: { getSession: function () { return Promise.resolve({ data: { session: HIS } }); } } };
    };
  })();
  var m3 = await slow.api.resolve();
  ok('waiting beats guessing: still the owner', m3 === true, String(m3));
  ok('his account was never synced while the answer was unknown', slow.state.initCalls.length === 0);

  // ── the stale pre-paint hint ────────────────────────────────────────────
  console.log('\n  the hint says owner, the session says runner');
  var stale = build({ session: HER, hintOwner: true });
  var m4 = await stale.api.resolve();
  ok('the session wins', m4 === false, String(m4));
  ok('the shadow is taken back down', stale.sandbox.__peekStore === null && stale.sandbox.__RUN_PEEK === false);
  ok('her real runs are repainted', stale.state.rendered >= 1);
  ok('and her sync engine still starts', stale.state.initCalls.length === 1);

  // ── no session at all ───────────────────────────────────────────────────
  console.log('\n  no session at all (12s wait, then a real answer)');
  var t0 = Date.now();
  var none = build({ session: null });
  var m5 = await none.api.resolve();
  ok('undecided stays undecided; it picks NEITHER account', m5 === null, String(m5));
  ok('nothing is synced', none.state.initCalls.length === 0);
  ok('nothing is drained', none.state.synced === 0);
  ok('and it says so rather than rendering a silent empty page', none.state.fails.indexOf('nosession') >= 0);
  ok('it waited ~12s before giving up, not ~3s', Date.now() - t0 > 10000, (Date.now() - t0) + 'ms');

  // ── a session that lands after the wait expired ─────────────────────────
  console.log('\n  the session arrives late, after the wait gave up');
  var late = build({ session: null });
  var m5b = await late.api.resolve();
  ok('it is undecided first', m5b === null);
  late.sandbox.window.ALSAuth = { user: { id: RUNNER } };          // topbar settles at last
  await late.state.listeners['als:auth']();
  await new Promise(function (r) { setTimeout(r, 300); });
  ok('als:auth re-opens ONLY the undecided answer', late.state.initCalls.length === 1, late.state.initCalls.length + ' engine start(s)');
  ok('and the drain finally runs', late.state.synced === 1);

  // ── ALSAuth is the fast path when topbar has already settled ────────────
  console.log('\n  topbar.js has already published the session');
  var fast = build({ session: null, alsAuthUser: RUNNER });
  var m6 = await fast.api.resolve();
  ok('window.ALSAuth.user.id answers immediately', m6 === false, String(m6));

  // ── memoisation: the answer is computed once ────────────────────────────
  console.log('\n  asked twice');
  var twice = build({ session: HER });
  await twice.api.resolve(); await twice.api.resolve();
  ok('the engine is not started a second time', twice.state.initCalls.length === 1);
  ok('the inbox is not re-synced from the resolver', twice.state.synced === 1);
  ok('a healthy start says nothing about sync', twice.state.icuBanners.length === 0);

  /* ── the engine must not be able to fail to start SILENTLY ──────────────
     sync.js's very first line returns when window.supabase is undefined, and
     startCloudSync used to set __syncStarted and call it anyway. One slow
     vendor script then left the page with no setItem interception — so no
     deletion tombstones — and every edit local-only until the next open
     reverted it. That is the same class of fault as the resurrected session
     this suite's sibling (run-plan-delete) pins. */
  console.log('\n  vendor/supabase.min.js never executed');
  var nosb = build({ session: null, alsAuthUser: RUNNER, noSupabase: true });
  // collapse the 200ms poll so the ~20s give-up happens inside the test
  var ticks = 0;
  nosb.sandbox.setTimeout = function (fn) { if (ticks++ < 400) fn(); return 0; };
  await nosb.api.resolve();
  await new Promise(function (r) { setTimeout(r, 20); });
  ok('the engine is never started', nosb.state.initCalls.length === 0);
  ok('and it does NOT fail silently', nosb.state.icuBanners.length === 1,
    JSON.stringify(nosb.state.icuBanners[0] || '').slice(0, 60));

  console.log('\n' + pass + ' passed, ' + fail + ' failed\n');
  process.exit(fail ? 1 : 0);
})().catch(function (e) { console.log('  ✗ FAIL threw → ' + (e && e.stack || e)); process.exit(1); });
