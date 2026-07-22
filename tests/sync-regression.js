/* Regression test for the 22/07/26 sync fix.
   Runs the REAL pocoach-sync.js and als-sync-status.js in a vm against a fake
   Supabase that enforces the SAME constraint the live database has:
   a row is unique on (user_id, key), so `on_conflict=key` is rejected 42P10/400.
   Reverting the fix must make these fail. */
'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const ALS = '/Users/alexstathatos/ALS DASHBOARD ALL FILES/als';

let pass = 0, fail = 0;
function is(name, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  console.log((ok ? '  ✓ ' : '  ✗ FAIL ') + name + (ok ? '' : `\n      got  ${JSON.stringify(got)}\n      want ${JSON.stringify(want)}`));
}
function section(s) { console.log('\n' + s); }

/* ── a Supabase that behaves like the real one ─────────────────── */
function makeCloud(opts = {}) {
  const rows = new Map();                 // "uid|key" -> data
  const log = { pushes: [], rejects: [], pulls: 0 };
  if (opts.seed) for (const [k, v] of (opts.seed instanceof Map ? opts.seed : Object.entries(opts.seed))) rows.set(k, JSON.parse(JSON.stringify(v)));

  async function fetchImpl(url, init = {}) {
    const u = String(url);
    const method = (init.method || 'GET').toUpperCase();
    const auth = (init.headers && (init.headers.Authorization || init.headers.authorization)) || '';
    const token = auth.replace(/^Bearer\s+/, '');
    const signedIn = token && token !== opts.anonKey;

    if (method === 'GET') {
      log.pulls++;
      if (opts.hangGet) return new Promise(() => {});     // pull never lands (slow network / closed too fast)
      if (!signedIn) return res(200, []);                 // RLS: anon sees nothing
      const m = u.match(/user_id=eq\.([^&]+)/);
      const uid = m ? decodeURIComponent(m[1]) : opts.uid;
      const key = (u.match(/key=eq\.([^&]+)/) || [])[1];
      const d = rows.get(uid + '|' + key);
      return res(200, d ? [{ data: d }] : []);
    }

    // POST = upsert
    const conflict = (u.match(/on_conflict=([^&]+)/) || [])[1] || '';
    const body = JSON.parse(init.body);
    // THE REAL CONSTRAINT. Primary key is (user_id, key); there is no unique
    // index on `key` alone, so Postgres rejects that conflict target outright,
    // BEFORE row-level security is ever consulted.
    if (decodeURIComponent(conflict) !== 'user_id,key') {
      log.rejects.push({ conflict, code: '42P10' });
      return res(400, { code: '42P10', message: 'there is no unique or exclusion constraint matching the ON CONFLICT specification' });
    }
    if (!signedIn) { log.rejects.push({ code: '42501' }); return res(401, { code: '42501', message: 'permission denied' }); }
    if (!body.user_id) { log.rejects.push({ code: 'null-owner' }); return res(400, { code: '23502', message: 'null value in column "user_id"' }); }
    rows.set(body.user_id + '|' + body.key, body.data);
    log.pushes.push(body);
    return res(201, {});
  }
  function res(status, json) {
    return Promise.resolve({
      ok: status >= 200 && status < 300, status,
      json: () => Promise.resolve(json),
      text: () => Promise.resolve(JSON.stringify(json)),
    });
  }
  return { fetch: fetchImpl, rows, log };
}

/* ── a device: localStorage + the DOM surface the engines touch ── */
function makeDevice(name, cloud, uid, initial = {}) {
  const store = new Map(Object.entries(initial).map(([k, v]) => [k, JSON.stringify(v)]));
  const listeners = { doc: {}, win: {} };
  const timers = [];
  const localStorage = {
    getItem: k => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: k => store.delete(k),
    get length() { return store.size; },
    key: i => Array.from(store.keys())[i],
  };
  const session = { access_token: 'jwt-' + uid, user: { id: uid } };
  const sandbox = {
    console: { warn: () => {}, log: () => {}, error: () => {} },
    localStorage,
    fetch: cloud.fetch,
    navigator: { onLine: true },
    setTimeout: (fn, ms) => { timers.push({ fn, ms }); return timers.length; },
    clearTimeout: () => {},
    setInterval: () => 0,
    clearInterval: () => {},
    Promise, JSON, Object, Array, Date, Math, String, Number, isNaN, parseInt,
    document: {
      addEventListener: (e, fn) => { (listeners.doc[e] = listeners.doc[e] || []).push(fn); },
      visibilityState: 'visible',
      createElement: () => ({ style: {}, setAttribute() {}, appendChild() {}, addEventListener() {}, classList: { add() {}, remove() {} } }),
      head: { appendChild() {} }, body: { appendChild() {} }, documentElement: { appendChild() {} },
    },
  };
  sandbox.window = sandbox;
  sandbox.addEventListener = (e, fn) => { (listeners.win[e] = listeners.win[e] || []).push(fn); };
  sandbox.removeEventListener = () => {};
  sandbox.dispatchEvent = () => {};
  sandbox.Event = function (t) { this.type = t; };
  sandbox.window.ALSAuth = { client: { auth: {
    getSession: () => Promise.resolve({ data: { session } }),
    onAuthStateChange: () => {},
  } } };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(ALS, 'als-sync-status.js'), 'utf8'), sandbox, { filename: 'als-sync-status.js' });
  vm.runInContext(fs.readFileSync(path.join(ALS, 'pocoach-sync.js'), 'utf8'), sandbox, { filename: 'pocoach-sync.js' });
  return {
    name, sandbox, store, listeners, timers, localStorage,
    weights: () => JSON.parse(store.get('po_coach_weights') || '[]'),
    logWeight(dateKey, kg, ts) {
      const w = JSON.parse(store.get('po_coach_weights') || '[]');
      w.push({ dateKey, kg, ts: ts || Date.now() });
      sandbox.localStorage.setItem('po_coach_weights', JSON.stringify(w));   // goes through the engine's override
    },
    fireTimers() { const t = timers.splice(0); t.forEach(x => { try { x.fn(); } catch (e) {} }); },
    pagehide() { (listeners.win.pagehide || []).forEach(f => { try { f(); } catch (e) {} }); },
    hide() { sandbox.document.visibilityState = 'hidden'; (listeners.doc.visibilitychange || []).forEach(f => f()); },
    show() { sandbox.document.visibilityState = 'visible'; (listeners.doc.visibilitychange || []).forEach(f => f()); },
  };
}
const settle = () => new Promise(r => setImmediate(() => setImmediate(() => setImmediate(r))));
async function quiesce(dev, rounds = 8) { for (let i = 0; i < rounds; i++) { dev.fireTimers(); await settle(); } }

const UID = 'alex-uuid-0001';
const ANON = 'sb_publishable_fGKn40f1Ek1Y4j0VComsFA_l4aXkKM-';

(async () => {
  section('1) THE BUG: a weigh-in logged on the phone must reach the cloud');
  {
    const cloud = makeCloud({ anonKey: ANON, uid: UID });
    const phone = makeDevice('phone', cloud, UID, {
      po_coach_weights: [{ dateKey: '2026-07-19', kg: 70.4, ts: 1 }],
    });
    await quiesce(phone);
    phone.logWeight('2026-07-20', 70.1, 1000);
    phone.logWeight('2026-07-21', 69.9, 2000);
    await quiesce(phone);

    const row = cloud.rows.get(UID + '|po-coach');
    const dks = (row && row.po_coach_weights || []).map(w => w.dateKey).sort();
    is('cloud has all three weigh-ins', dks, ['2026-07-19', '2026-07-20', '2026-07-21']);
    is('no upsert was rejected', cloud.log.rejects, []);
  }

  section('2) …and reaches the LAPTOP (the thing he actually reported)');
  {
    const cloud = makeCloud({ anonKey: ANON, uid: UID });
    const phone = makeDevice('phone', cloud, UID, {
      po_coach_weights: [{ dateKey: '2026-07-19', kg: 70.4, ts: 1 }],
    });
    await quiesce(phone);
    phone.logWeight('2026-07-20', 70.1, 1000);
    phone.logWeight('2026-07-21', 69.9, 2000);
    await quiesce(phone);

    const laptop = makeDevice('laptop', cloud, UID, {
      po_coach_weights: [{ dateKey: '2026-07-19', kg: 70.4, ts: 1 }],
    });
    await quiesce(laptop);
    const seen = laptop.weights().map(w => w.dateKey).sort();
    is('laptop pulled the phone\'s two days', seen, ['2026-07-19', '2026-07-20', '2026-07-21']);
  }

  section('3) A stale laptop closing fast must not erase the cloud');
  {
    const cloud = makeCloud({ anonKey: ANON, uid: UID });
    const phone = makeDevice('phone', cloud, UID, {});
    await quiesce(phone);
    phone.logWeight('2026-07-20', 70.1, 1000);
    phone.logWeight('2026-07-21', 69.9, 2000);
    await quiesce(phone);
    is('cloud holds 2 before the laptop opens', (cloud.rows.get(UID + '|po-coach').po_coach_weights || []).length, 2);

    // (a) Laptop opens with older data and is closed BEFORE its pull can land.
    //     Its unload push would replace the whole row with raw local — and raw
    //     local is missing the phone's two days.
    const cloudHang = makeCloud({ anonKey: ANON, uid: UID, hangGet: true, seed: cloud.rows });
    const laptop = makeDevice('laptop', cloudHang, UID, {
      po_coach_weights: [{ dateKey: '2026-07-19', kg: 70.4, ts: 1 }],
    });
    laptop.pagehide();
    await settle(); await settle();
    const afterHang = (cloudHang.rows.get(UID + '|po-coach').po_coach_weights || []).map(w => w.dateKey).sort();
    is('a device that never pulled cannot replace the row', afterHang, ['2026-07-20', '2026-07-21']);
    is('…and it pushed nothing at all', cloudHang.log.pushes.length, 0);

    // (b) Normally, the laptop merges and the UNION is kept — nobody loses.
    const laptop2 = makeDevice('laptop2', cloud, UID, {
      po_coach_weights: [{ dateKey: '2026-07-19', kg: 70.4, ts: 1 }],
    });
    await quiesce(laptop2);
    const after = (cloud.rows.get(UID + '|po-coach').po_coach_weights || []).map(w => w.dateKey).sort();
    is('after a real sync the cloud holds every device\'s days', after, ['2026-07-19', '2026-07-20', '2026-07-21']);
    is('and the laptop shows them all', laptop2.weights().map(w => w.dateKey).sort(), ['2026-07-19', '2026-07-20', '2026-07-21']);
  }

  section('4) The watchdog: one healthy engine must not vouch for a broken one');
  {
    const cloud = makeCloud({ anonKey: ANON, uid: UID });
    const dev = makeDevice('dev', cloud, UID, {});
    await quiesce(dev);
    const S = dev.sandbox.window.ALSSyncStatus;
    S.fail('gym & weigh-ins');
    is('weigh-ins recorded as stuck', S.stuck().engines, ['gym & weigh-ins']);
    S.ok('nutrition');
    S.ok('health');
    S.ok('sleep');
    is('a different app succeeding does NOT clear it', S.stuck().engines, ['gym & weigh-ins']);
    S.ok('gym & weigh-ins');
    is('only its own success clears it', S.stuck().engines, []);
  }

  section('5) …and the stuck record survives navigation / app restart');
  {
    const cloud = makeCloud({ anonKey: ANON, uid: UID });
    const dev = makeDevice('dev', cloud, UID, {});
    await quiesce(dev);
    dev.sandbox.window.ALSSyncStatus.fail('gym & weigh-ins');
    const persisted = dev.store.get('als:sync-stuck');
    is('written to localStorage, not just memory', typeof persisted === 'string' && persisted.indexOf('gym & weigh-ins') >= 0, true);

    // "Navigate": a brand-new page context over the SAME localStorage.
    const page2 = makeDevice('dev-page2', cloud, UID, {});
    page2.store.set('als:sync-stuck', persisted);
    const S2 = page2.sandbox.window.ALSSyncStatus;
    is('the new page still knows data is stuck', S2.stuck().engines, ['gym & weigh-ins']);
  }

  section('6) GUARDRAIL: on_conflict=key is rejected, exactly like production');
  {
    const cloud = makeCloud({ anonKey: ANON, uid: UID });
    const r = await cloud.fetch('https://x/rest/v1/app_state?on_conflict=key', {
      method: 'POST', headers: { Authorization: 'Bearer jwt-' + UID },
      body: JSON.stringify({ key: 'po-coach', user_id: UID, data: {} }),
    });
    is('status', r.status, 400);
    is('code', (await r.json()).code, '42P10');
  }

  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
})();
