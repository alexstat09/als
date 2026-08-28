/* ══ THE EGRESS GUARD (als-v518) ══════════════════════════════════════════
   On 28/08/26 Supabase restricted this entire project — REST *and* Auth both
   answering HTTP 402 — because the month's free 5 GB of egress was gone. The
   cause was pocoach-sync.js: its 15-second reconciler called syncNow(), which
   downloads the WHOLE po-coach row (all gym history, every template, every
   weigh-in) unconditionally. topbar.js injects that engine into every page, so
   merely having Metron open cost about a megabyte four times a minute whether
   or not anything had changed. sync.js never behaved that way — it asks for
   updated_at first and pulls the blob only when it moved.

   This drives the REAL pocoach-sync.js in a vm against a fake Supabase that
   reports updated_at like the real one, and fails if the expensive path ever
   comes back. Reverting the fix must make section 1 fail.                    */
'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const ALS = path.resolve(__dirname, '..');

let pass = 0, fail = 0;
function is(name, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  console.log((ok ? '  ✓ ' : '  ✗ FAIL ') + name + (ok ? '' : `\n      got  ${JSON.stringify(got)}\n      want ${JSON.stringify(want)}`));
}
function section(s) { console.log('\n' + s); }

/* ── a Supabase that stamps updated_at, like the real one ─────────────── */
function makeCloud(opts = {}) {
  const rows = new Map();                        // "uid|key" -> {data, updated_at}
  const log = { blobPulls: 0, probes: 0, pushes: 0, other: 0 };

  function res(status, json) {
    return Promise.resolve({
      ok: status >= 200 && status < 300, status,
      headers: { get: h => (h.toLowerCase() === 'content-length' ? String(JSON.stringify(json).length) : null) },
      json: () => Promise.resolve(json),
      text: () => Promise.resolve(JSON.stringify(json)),
    });
  }
  async function fetchImpl(url, init = {}) {
    const u = String(url);
    const method = (init.method || 'GET').toUpperCase();
    if (method === 'GET') {
      const uid = (u.match(/user_id=eq\.([^&]+)/) || [])[1];
      const key = (u.match(/key=eq\.([^&]+)/) || [])[1];
      const row = rows.get(decodeURIComponent(uid || '') + '|' + key);
      if (/select=updated_at/.test(u)) {
        log.probes++;
        return res(200, row ? [{ updated_at: row.updated_at }] : []);
      }
      if (/select=data/.test(u)) {
        log.blobPulls++;
        return res(200, row ? [{ data: row.data, updated_at: row.updated_at }] : []);
      }
      log.other++; return res(200, []);
    }
    const body = JSON.parse(init.body);
    log.pushes++;
    rows.set(body.user_id + '|' + body.key, { data: body.data, updated_at: body.updated_at });
    return res(201, {});
  }
  return { fetch: fetchImpl, rows, log };
}

/* ── a device, with the 15s interval captured so we can drive it ──────── */
function makeDevice(cloud, uid, initial = {}) {
  const store = new Map(Object.entries(initial).map(([k, v]) => [k, JSON.stringify(v)]));
  const timers = [], intervals = [];
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
    localStorage, fetch: cloud.fetch, navigator: { onLine: true },
    setTimeout: (fn) => { timers.push(fn); return timers.length; },
    clearTimeout: () => {},
    setInterval: (fn) => { intervals.push(fn); return intervals.length; },
    clearInterval: () => {},
    Promise, JSON, Object, Array, Date, Math, String, Number, isNaN, parseInt,
    document: {
      addEventListener: () => {}, visibilityState: 'visible',
      createElement: () => ({ style: {}, setAttribute() {}, appendChild() {}, addEventListener() {}, classList: { add() {}, remove() {} } }),
      head: { appendChild() {} }, body: { appendChild() {} }, documentElement: { appendChild() {} },
    },
  };
  sandbox.window = sandbox;
  sandbox.addEventListener = () => {}; sandbox.removeEventListener = () => {}; sandbox.dispatchEvent = () => {};
  sandbox.window.ALSAuth = { client: { auth: {
    getSession: () => Promise.resolve({ data: { session } }), onAuthStateChange: () => {},
  } } };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(ALS, 'als-sync-status.js'), 'utf8'), sandbox, { filename: 'als-sync-status.js' });
  vm.runInContext(fs.readFileSync(path.join(ALS, 'pocoach-sync.js'), 'utf8'), sandbox, { filename: 'pocoach-sync.js' });
  return {
    sandbox, store,
    weights: () => JSON.parse(store.get('po_coach_weights') || '[]'),
    logWeight(dateKey, kg, ts) {
      const w = JSON.parse(store.get('po_coach_weights') || '[]');
      w.push({ dateKey, kg, ts: ts || Date.now() });
      sandbox.localStorage.setItem('po_coach_weights', JSON.stringify(w));
    },
    fireTimers() { timers.splice(0).forEach(fn => { try { fn(); } catch (e) {} }); },
    tick() { intervals.forEach(fn => { try { fn(); } catch (e) {} }); },
  };
}
const settle = () => new Promise(r => setImmediate(() => setImmediate(() => setImmediate(r))));
async function quiesce(dev, rounds = 8) { for (let i = 0; i < rounds; i++) { dev.fireTimers(); await settle(); } }
async function ticks(dev, n) { for (let i = 0; i < n; i++) { dev.tick(); await quiesce(dev, 4); } }

const UID = 'alex-uuid-0001';

(async () => {
  section('1) THE LEAK: an idle app must not re-download the whole row every 15s');
  {
    const cloud = makeCloud();
    const phone = makeDevice(cloud, UID, { po_coach_weights: [{ dateKey: '2026-08-20', kg: 69.6, ts: 1 }] });
    await quiesce(phone);
    is('one real pull on load (it needs the cloud’s tombstones)', cloud.log.blobPulls, 1);

    const before = cloud.log.blobPulls;
    await ticks(phone, 10);
    is('10 idle ticks pulled the blob ZERO more times', cloud.log.blobPulls - before, 0);
    is('…they asked only for the timestamp', cloud.log.probes, 10);
  }

  section('2) …but a real remote change must still come through');
  {
    const cloud = makeCloud();
    const phone = makeDevice(cloud, UID, { po_coach_weights: [{ dateKey: '2026-08-20', kg: 69.6, ts: 1 }] });
    await quiesce(phone);
    await ticks(phone, 3);
    const quiet = cloud.log.blobPulls;

    // the laptop writes a newer weigh-in straight into the row
    const row = cloud.rows.get(UID + '|po-coach');
    row.data.po_coach_weights = row.data.po_coach_weights.concat([{ dateKey: '2026-08-27', kg: 69.2, ts: 9000 }]);
    row.updated_at = new Date(Date.now() + 60000).toISOString();

    await ticks(phone, 1);
    is('the stamp moved → it pulled the blob', cloud.log.blobPulls - quiet, 1);
    is('and the phone now shows the laptop’s weigh-in',
       phone.weights().map(w => w.dateKey).sort(), ['2026-08-20', '2026-08-27']);
  }

  section('3) …and an unpushed local edit must still be sent');
  {
    const cloud = makeCloud();
    const phone = makeDevice(cloud, UID, { po_coach_weights: [{ dateKey: '2026-08-20', kg: 69.6, ts: 1 }] });
    await quiesce(phone);
    await ticks(phone, 2);

    // write straight past the engine's setItem hook, so only the tick can notice
    phone.store.set('po_coach_weights', JSON.stringify([
      { dateKey: '2026-08-20', kg: 69.6, ts: 1 }, { dateKey: '2026-08-28', kg: 69.4, ts: 9000 },
    ]));
    await ticks(phone, 2);
    const dks = (cloud.rows.get(UID + '|po-coach').data.po_coach_weights || []).map(w => w.dateKey).sort();
    is('the cheap tick still noticed local drift and pushed', dks, ['2026-08-20', '2026-08-28']);
  }

  section('4) LOCAL-ONLY: a restricted project must not be hammered');
  {
    const cloud = makeCloud();
    const phone = makeDevice(cloud, UID, { po_coach_weights: [{ dateKey: '2026-08-20', kg: 69.6, ts: 1 }] });
    await quiesce(phone);
    phone.sandbox.window.ALS_LOCAL_ONLY = true;
    const frozen = JSON.stringify(cloud.log);
    await ticks(phone, 10);
    phone.logWeight('2026-08-28', 69.4, 9000);
    await quiesce(phone);
    is('10 ticks + a new weigh-in made ZERO requests', JSON.stringify(cloud.log), frozen);
    is('…and the weigh-in is safe on the device', phone.weights().map(w => w.dateKey).sort(),
       ['2026-08-20', '2026-08-28']);
  }

  section('5) THE METER: the pulls it does make are counted');
  {
    const cloud = makeCloud();
    const phone = makeDevice(cloud, UID, { po_coach_weights: [{ dateKey: '2026-08-20', kg: 69.6, ts: 1 }] });
    await quiesce(phone);
    await ticks(phone, 3);
    const eg = phone.sandbox.window.ALSEgress.read();
    is('bytes were recorded', eg.bytes > 0, true);
    is('reads were counted', eg.reads >= 4, true);
    is('nothing was blind (the fake sends Content-Length)', eg.nolen, 0);
  }

  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
})();
