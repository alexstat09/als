/* The reinstall scenario, against the REAL sync.js in a vm.
   A phone that was just wiped opens the app. Its localStorage is empty. If the
   cloud read fails, or the page is closed before the read lands, sync.js must
   NOT replace the cloud row with nothing. */
'use strict';
const fs = require('fs'), vm = require('vm');
const ALS = '/Users/alexstathatos/ALS DASHBOARD ALL FILES/als';
let pass = 0, fail = 0;
const is = (n, g, w) => { const ok = JSON.stringify(g) === JSON.stringify(w); ok ? pass++ : fail++;
  console.log((ok ? '  ✓ ' : '  ✗ FAIL ') + n + (ok ? '' : `\n      got ${JSON.stringify(g)} want ${JSON.stringify(w)}`)); };

function run({ readFails, closeBeforePull, localSeed }) {
  const cloudRow = { 'nut:logs': [{ id: 'a', kcal: 500 }, { id: 'b', kcal: 700 }] };
  const state = { row: JSON.parse(JSON.stringify(cloudRow)), upserts: 0, keepalivePush: 0 };
  const store = new Map(Object.entries(localSeed || {}).map(([k, v]) => [k, JSON.stringify(v)]));
  const winL = {};
  let resolvePull;
  const q = () => ({
    select() { return this; }, eq() { return this; }, limit() { return Promise.resolve({ error: null }); },
    maybeSingle() {
      if (readFails) return Promise.resolve({ data: null, error: { message: 'network' } });
      if (closeBeforePull) return new Promise(r => { resolvePull = r; });
      return Promise.resolve({ data: { data: state.row, updated_at: 'x' }, error: null });
    },
    upsert(row) { state.upserts++; state.row = row.data; return Promise.resolve({ error: null }); },
  });
  const sandbox = {
    console: { warn() {}, log() {} }, JSON, Object, Array, Date, Math, String, Number, Promise,
    localStorage: { getItem: k => store.has(k) ? store.get(k) : null, setItem: (k, v) => store.set(k, String(v)),
      removeItem: k => store.delete(k), get length() { return store.size; }, key: i => [...store.keys()][i] },
    setTimeout: () => 0, clearTimeout() {}, setInterval: () => 0,
    fetch: (url, init) => { if (init && init.keepalive) state.keepalivePush++; return Promise.resolve({ ok: true, status: 200 }); },
    document: { addEventListener() {} },
    navigator: { onLine: true },
  };
  sandbox.window = sandbox;
  sandbox.addEventListener = (e, fn) => { (winL[e] = winL[e] || []).push(fn); };
  sandbox.supabase = { createClient: () => ({
    from: q, channel: () => ({ on() { return this; }, subscribe() {} }),
    auth: { getSession: () => Promise.resolve({ data: { session: { access_token: 'jwt', user: { id: 'u1' } } } }),
      onAuthStateChange() {} },
  }) };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(ALS + '/sync.js', 'utf8'), sandbox, { filename: 'sync.js' });
  sandbox.initCloudSync({ appKey: 'nutrition', syncedKeys: ['nut:logs'] });
  return { state, winL, store, settle: () => new Promise(r => setImmediate(() => setImmediate(() => setImmediate(() => setImmediate(r))))) };
}

(async () => {
  console.log('\nA freshly reinstalled phone (empty localStorage)');
  {
    const t = run({ readFails: true, localSeed: {} });        // cloud read fails
    await t.settle();
    is('a failed read does not blank the cloud row', t.state.row, { 'nut:logs': [{ id: 'a', kcal: 500 }, { id: 'b', kcal: 700 }] });
    is('…and nothing was upserted at all', t.state.upserts, 0);
  }
  {
    const t = run({ closeBeforePull: true, localSeed: {} });   // closed before the read lands
    await t.settle();
    (t.winL.pagehide || []).forEach(f => f());
    await t.settle();
    is('closing before the first pull pushes nothing', t.state.keepalivePush, 0);
    is('…and the cloud row is untouched', t.state.row, { 'nut:logs': [{ id: 'a', kcal: 500 }, { id: 'b', kcal: 700 }] });
  }
  console.log('\nThe normal path still works');
  {
    const t = run({ localSeed: { 'nut:logs': [{ id: 'c', kcal: 300 }] } });
    await t.settle();
    const ids = (JSON.parse(t.store.get('nut:logs')) || []).map(x => x.id).sort();
    is('device ends up with the union', ids, ['a', 'b', 'c']);
    // Nothing to flush right after a clean sync — so log something new first.
    t.store.set('nut:logs', JSON.stringify([{ id: 'a', kcal: 500 }, { id: 'b', kcal: 700 }, { id: 'c', kcal: 300 }, { id: 'd', kcal: 900 }]));
    (t.winL.pagehide || []).forEach(f => f());
    await t.settle();
    is('a device that HAS pulled still flushes a fresh edit on close', t.state.keepalivePush >= 1, true);
  }
  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
})();
