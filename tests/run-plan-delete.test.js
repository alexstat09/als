/* run.html — a deleted plan session must STAY deleted.
 *
 * The bug (2026-08-10): Chrissie's coach programme was in her app twice, and
 * tapping ✕ removed a session that reappeared "a second later". It was never a
 * merge bug. sync.js stamps deletion tombstones from its localStorage.setItem
 * interceptor, and that interceptor only exists once initCloudSync has run —
 * which waits on the session id (0.5–3s on a cold PWA start, up to 12s). The
 * page paints a fully interactive plan long before that, so an ✕ tapped in
 * those first seconds left NO tombstone, and the engine's first pull unioned
 * the session back by id and pushed the resurrection to the cloud.
 *
 * The fix is run.html's own runDrop()/runDropKey(), which stamp the tombstone
 * into the exact key sync.js reads ('__synctomb__' + appKey) whether or not the
 * engine exists yet. This suite drives the REAL sync.js and the REAL helpers
 * sliced out of run.html — never a copy of either, because a copy agrees with
 * every bug perfectly.
 *
 * Reverting the fix must fail section B.
 */
'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const ALS = path.resolve(__dirname, '..');

let pass = 0, fail = 0;
function is(name, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  console.log((ok ? '  ✓ ' : '  ✗ FAIL ') + name +
    (ok ? '' : `\n      got  ${JSON.stringify(got)}\n      want ${JSON.stringify(want)}`));
}
function ok(name, cond) { is(name, !!cond, true); }
function section(s) { console.log('\n' + s); }

const RUN = fs.readFileSync(ALS + '/run.html', 'utf8');
const SYNC = fs.readFileSync(ALS + '/sync.js', 'utf8');

/* ── slice a function out of run.html by counting braces ───────────────
   The helpers under test are the SHIPPED ones. Re-implementing them here
   would prove only that two copies of my own mistake agree. */
function fnSource(name) {
  const start = RUN.indexOf('function ' + name + '(');
  if (start < 0) throw new Error('run.html has no function ' + name + '()');
  let i = RUN.indexOf('{', start), depth = 0;
  for (; i < RUN.length; i++) {
    if (RUN[i] === '{') depth++;
    else if (RUN[i] === '}') { depth--; if (!depth) return RUN.slice(start, i + 1); }
  }
  throw new Error('unbalanced braces in ' + name + '()');
}
/* the body only, for static assertions about what a function calls */
function bodyOf(name) { return fnSource(name); }

/* The declaration is sliced in with the helpers, not restated here: if run.html
   ever renames the key, these tests must move with it rather than keep asserting
   against a string only the test believes in. */
const TOMB_SRC = (RUN.match(/var\s+TOMB_KEY\s*=\s*'[^']+'\s*;/) || [])[0];
if (!TOMB_SRC) throw new Error('run.html no longer declares TOMB_KEY');
const TOMB_DECL = TOMB_SRC.match(/'([^']+)'/)[1];

/* ── a Supabase that behaves like the real one, holding ONE row ──────── */
function makeEnv(cloudRow) {
  const store = {};
  const localStorage = {
    get length() { return Object.keys(store).length; },
    key(i) { return Object.keys(store)[i]; },
    getItem(k) { return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
    setItem(k, v) { store[k] = String(v); },
    removeItem(k) { delete store[k]; },
  };
  const cloud = {
    row: cloudRow ? JSON.parse(JSON.stringify(cloudRow)) : null,
    stamp: '2026-08-10T10:00:00.000Z',
    pushes: [],
  };
  function builder() {
    const b = {
      select() { return b; },
      eq() { return b; },
      limit() { return Promise.resolve({ data: [], error: null }); },       // hasOwnerCol probe
      maybeSingle() {
        return Promise.resolve({
          data: cloud.row ? { data: cloud.row, updated_at: cloud.stamp } : null,
          error: null,
        });
      },
      upsert(row) {
        cloud.row = JSON.parse(JSON.stringify(row.data));
        cloud.stamp = row.updated_at;
        cloud.pushes.push(row.data);
        return Promise.resolve({ error: null });
      },
    };
    return b;
  }
  const supa = {
    from() { return builder(); },
    auth: {
      getSession() {
        return Promise.resolve({ data: { session: { user: { id: 'runner-uuid' }, access_token: 'jwt' } } });
      },
      onAuthStateChange() {},
    },
    channel() { const c = { on() { return c; }, subscribe() { return c; } }; return c; },
  };
  const win = {
    supabase: { createClient: () => supa },
    localStorage,
    addEventListener() {}, removeEventListener() {},
    setTimeout, clearTimeout, setInterval: () => 0, clearInterval,
  };
  win.window = win;
  const ctx = vm.createContext({
    window: win, localStorage, __peekStore: null,
    document: { addEventListener() {}, hidden: false },
    console: { log() {}, warn() {}, error() {} },
    setTimeout, clearTimeout, setInterval: () => 0, clearInterval,
    JSON, Date, Object, Array, String, Number, Math, Promise, RegExp, isNaN,
  });
  vm.runInContext(SYNC, ctx, { filename: 'sync.js' });
  vm.runInContext(TOMB_SRC + '\n' + fnSource('runDrop') + '\n' + fnSource('runDropKey'), ctx, { filename: 'run.html:helpers' });
  return { ctx, store, cloud, localStorage };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SYNCED = ['run:profile', 'run:plan', 'run:logs', 'run:shifts', 'run:strength', 'run:shoes', 'run:knee', 'run:shoePics'];

function startEngine(env) {
  env.ctx.window.initCloudSync({ appKey: 'run', syncedKeys: SYNCED, onApplied() {} });
}
// run.html's persist(), in behaviour: JSON through the (possibly intercepted) setItem
function persist(env, k, v) { env.ctx.window.localStorage.setItem(k, JSON.stringify(v)); }
function drop(env, k, id, ts) { env.ctx.runDrop(k, id, ts); }
function idsIn(env, k) { return JSON.parse(env.store[k] || '[]').map((x) => x.id); }
function tombsFor(env, k) {
  const t = JSON.parse(env.store[TOMB_DECL] || '{}');
  return Object.keys(t[k] || {}).sort();
}
function sess(id, ts, date) { return { id, date: date || '2026-08-11', type: 'Easy', struct: 'Easy', km: 8, ts, src: 'plan' }; }

(async function main() {
  const T = 1786000000000;                       // when the programme was pasted

  section('0 · the two ends of the protocol agree on the key');
  is('run.html declares the tombstone key', TOMB_DECL, '__synctomb__run');
  ok("sync.js derives it as '__synctomb__' + appKey", SYNC.includes("'__synctomb__' + appKey"));
  ok('sync.js exempts that key from its own interception', /k === TOMB_KEY\) return false/.test(SYNC));

  section('A · ✕ tapped while the engine is already running (was always fine)');
  {
    const dup = [sess('a1', T), sess('a2', T)];
    const env = makeEnv({ 'run:plan': dup });
    env.store['run:plan'] = JSON.stringify(dup);
    startEngine(env);
    await sleep(80);
    is('the programme is there twice to begin with', idsIn(env, 'run:plan'), ['a1', 'a2']);
    const gone = dup[1];
    persist(env, 'run:plan', dup.filter((s) => s.id !== gone.id));
    drop(env, 'run:plan', gone.id, gone.ts);
    await sleep(700);                            // schedulePush 400ms → syncNow pull+merge+push
    is('local plan', idsIn(env, 'run:plan'), ['a1']);
    is('her cloud row', (env.cloud.row['run:plan'] || []).map((s) => s.id), ['a1']);
    is('tombstone', tombsFor(env, 'run:plan'), ['id:a2']);
  }

  section('B · ✕ tapped BEFORE the engine starts — THE BUG');
  {
    const dup = [sess('b1', T), sess('b2', T)];
    const env = makeEnv({ 'run:plan': dup });
    env.store['run:plan'] = JSON.stringify(dup);
    // No engine yet: run.html only calls startCloudSync() once runUid() resolves.
    const gone = dup[1];
    persist(env, 'run:plan', dup.filter((s) => s.id !== gone.id));
    drop(env, 'run:plan', gone.id, gone.ts);
    is('the tombstone exists without any engine', tombsFor(env, 'run:plan'), ['id:b2']);
    startEngine(env);                            // her session lands, sync begins
    await sleep(700);
    is('it did NOT come back', idsIn(env, 'run:plan'), ['b1']);
    is('and it is gone from the cloud too', (env.cloud.row['run:plan'] || []).map((s) => s.id), ['b1']);
  }

  section('C · the tombstone survives a later edit of the same array');
  {
    const dup = [sess('c1', T), sess('c2', T)];
    const env = makeEnv({ 'run:plan': dup });
    env.store['run:plan'] = JSON.stringify(dup);
    persist(env, 'run:plan', [dup[0]]);
    drop(env, 'run:plan', 'c2', T);
    startEngine(env);
    await sleep(700);
    const cur = JSON.parse(env.store['run:plan']);
    cur.forEach((s) => { s.date = '2026-08-12'; s.ts = Date.now(); });   // moveSession
    persist(env, 'run:plan', cur);
    await sleep(700);
    is('plan after the move', idsIn(env, 'run:plan'), ['c1']);
    is('tombstone still held', tombsFor(env, 'run:plan'), ['id:c2']);
  }

  section('D · a future-dated ts (device clock skew) cannot outlive its tombstone');
  {
    const future = Date.now() + 3 * 3600 * 1000;
    const dup = [sess('d1', future), sess('d2', future)];
    const env = makeEnv({ 'run:plan': dup });
    env.store['run:plan'] = JSON.stringify(dup);
    persist(env, 'run:plan', [dup[0]]);
    drop(env, 'run:plan', 'd2', future);
    // Defensive on purpose: with the fix reverted there is no tombstone at all,
    // and a suite that THROWS there reports a crash instead of the regression.
    const t = (JSON.parse(env.store[TOMB_DECL] || '{}')['run:plan'] || {})['id:d2'];
    ok('tombstone dominates the item ts', typeof t === 'number' && t > future);
    startEngine(env);
    await sleep(700);
    is('stays deleted', idsIn(env, 'run:plan'), ['d1']);
  }

  section('E · a re-paste supersedes the old week without duplicating it');
  {
    const oldWeek = [sess('p1', T), sess('p2', T, '2026-08-12')];
    const env = makeEnv({ 'run:plan': oldWeek });
    env.store['run:plan'] = JSON.stringify(oldWeek);
    // doParse: supersede every src:'plan' row on a covered date, then concat the new set
    const fresh = [sess('n1', T + 1000), sess('n2', T + 1000, '2026-08-12')];
    persist(env, 'run:plan', fresh);
    oldWeek.forEach((s) => drop(env, 'run:plan', s.id, s.ts));
    startEngine(env);
    await sleep(700);
    is('one programme, not two', idsIn(env, 'run:plan'), ['n1', 'n2']);
    is('cloud agrees', (env.cloud.row['run:plan'] || []).map((s) => s.id), ['n1', 'n2']);
  }

  section('F · runs and shoes get the same guarantee');
  {
    const runs = [{ id: 'r1', date: '2026-08-09', distanceKm: 10, ts: T }, { id: 'r2', date: '2026-08-10', distanceKm: 5, ts: T }];
    const shoes = [{ id: 's1', name: 'Bondi 9', ts: T }, { id: 's2', name: 'Endorphin Pro 5', ts: T }];
    const pics = { s1: 'data:image/jpeg;base64,AAA', s2: 'data:image/jpeg;base64,BBB' };
    const env = makeEnv({ 'run:logs': runs, 'run:shoes': shoes, 'run:shoePics': pics });
    env.store['run:logs'] = JSON.stringify(runs);
    env.store['run:shoes'] = JSON.stringify(shoes);
    env.store['run:shoePics'] = JSON.stringify(pics);
    persist(env, 'run:logs', [runs[0]]);   drop(env, 'run:logs', 'r2', T);
    persist(env, 'run:shoes', [shoes[0]]); drop(env, 'run:shoes', 's2', T);
    const p2 = Object.assign({}, pics); delete p2.s2;
    persist(env, 'run:shoePics', p2);      env.ctx.runDropKey('run:shoePics', 's2');
    startEngine(env);
    await sleep(700);
    is('deleted run stays deleted', idsIn(env, 'run:logs'), ['r1']);
    is('deleted shoe stays deleted', idsIn(env, 'run:shoes'), ['s1']);
    is('deleted shoe photo stays deleted', Object.keys(JSON.parse(env.store['run:shoePics'])), ['s1']);
  }

  section('G · peek (Alex\'s read-only window) must never write to his disk');
  {
    const env = makeEnv(null);
    env.ctx.__peekStore = {};                    // shadow is up
    env.ctx.runDrop('run:plan', 'x1', T);
    env.ctx.runDropKey('run:shoePics', 'x1');
    is('no tombstone written', env.store[TOMB_DECL], undefined);
  }

  section('H · the wiring, statically');
  {
    ok('delSess stamps a plan tombstone',   /runDrop\(K_PLAN/.test(bodyOf('delSess')));
    ok('delRun stamps a logs tombstone',    /runDrop\(K_LOGS/.test(bodyOf('delRun')));
    ok('delShoe stamps a shoes tombstone',  /runDrop\(K_SHOES/.test(bodyOf('delShoe')));
    ok('clearShoePhoto stamps a map tombstone', /runDropKey\(K_SPICS/.test(bodyOf('clearShoePhoto')));
    ok('doParse tombstones what it supersedes', /runDrop\(K_PLAN/.test(bodyOf('doParse')));

    // Every one of them must stamp only after a CONFIRMED write: a tombstone over
    // an item that is still there (storage full) deletes something she kept.
    ['delSess', 'delRun', 'doParse'].forEach(function (fn) {
      ok(fn + ' stamps only after persist() returned true', /if\s*\(\s*persist\(/.test(bodyOf(fn)));
    });

    // The engine must not be able to fail to start silently.
    const scs = bodyOf('startCloudSync');
    ok('startCloudSync waits for window.supabase too', /!window\.supabase/.test(scs));
    ok('startCloudSync confirms ALSSync was published', /!window\.ALSSync/.test(scs));
    ok('and says so when it never starts', /icuBanner\(/.test(scs));

    // Peek writes are refused out loud rather than reported as saved.
    ['delSess', 'delRun', 'delShoe', 'addSession', 'doParse', 'clearShoePhoto'].forEach(function (fn) {
      ok(fn + ' refuses in read-only peek', /peekBlocked\(/.test(bodyOf(fn)));
    });
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
