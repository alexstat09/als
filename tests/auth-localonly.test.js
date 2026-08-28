/* ══ THE LOCAL-ONLY DOOR (als-v518) ═══════════════════════════════════════
   When Supabase restricted this project on 28/08/26 (HTTP 402 on REST *and*
   Auth), the hourly token refresh failed, supabase-js dropped the session, and
   topbar.js's gate did the only thing it knew: it showed a login form over an
   app whose data was sitting safely in localStorage — and that login could not
   possibly succeed. Metron is local-first; Supabase copies data between
   devices, it does not hold it. So a dead server is not a reason to lock him
   out of his own phone.

   But the gate is the privacy boundary between two accounts on one browser, so
   the door it now has must be NARROW. This runs the REAL authGate source and
   pins exactly when it opens:
     • never on a device that has not signed in before;
     • never when the server answers like a healthy server (200/401/404);
     • only on 402 / 429 / 5xx / unreachable — the server's own refusal.        */
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

/* Run the REAL gate, sliced out of topbar.js with its config constants. If the
   slice ever stops matching, that is a failure worth seeing, not a skip. */
const src = fs.readFileSync(path.join(ALS, 'topbar.js'), 'utf8');
const start = src.indexOf('const TOPBAR_SUPABASE_URL');
const end = src.indexOf('// -------- CSS --------');
if (start < 0 || end < 0 || end <= start) { console.error('could not slice authGate out of topbar.js'); process.exit(1); }
const GATE = src.slice(start, end);

function el(tag) {
  const e = {
    tagName: tag, style: {}, open: false, _h: '', _t: '',
    setAttribute() {}, removeAttribute() {}, appendChild() {}, remove() {},
    addEventListener() {}, removeEventListener() {}, focus() {},
    showModal() { e.open = true; }, close() { e.open = false; },
    querySelector() { return el('stub'); },
  };
  Object.defineProperty(e, 'innerHTML', { get: () => e._h, set: v => { e._h = String(v); } });
  Object.defineProperty(e, 'textContent', { get: () => e._t, set: v => { e._t = String(v); } });
  return e;
}

/* opts: { session, seenUid, health } — health is a status number, or 'reject' */
function run(opts) {
  const created = [];
  const store = new Map();
  if (opts.seenUid) store.set('als:uid', opts.seenUid);
  const calls = { health: 0, reloaded: 0 };
  const sandbox = {
    console: { warn() {}, log() {}, error() {} },
    localStorage: {
      getItem: k => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, String(v)),
      removeItem: k => store.delete(k), clear: () => store.clear(),
      get length() { return store.size; }, key: i => Array.from(store.keys())[i],
    },
    sessionStorage: { getItem: () => null, setItem() {}, removeItem() {}, clear() {} },
    setTimeout: (fn, ms) => { if (ms >= 3000) return 0; return 0; },   // never auto-fire the 3s killTimer
    clearTimeout() {}, setInterval: () => 0, clearInterval() {},
    Promise, JSON, Object, Array, Date, Math, String, Number, isNaN, parseInt,
    AbortController: function () { this.signal = {}; this.abort = () => {}; },
    CustomEvent: function (t, d) { this.type = t; this.detail = d && d.detail; },
    location: { replace() {}, reload() { calls.reloaded++; }, pathname: '/index.html' },
    fetch: (url) => {
      if (!/\/auth\/v1\/health/.test(String(url))) return Promise.reject(new Error('unexpected ' + url));
      calls.health++;
      if (opts.health === 'reject') return Promise.reject(new Error('offline'));
      const st = opts.health;
      return Promise.resolve({ ok: st >= 200 && st < 300, status: st, json: () => Promise.resolve({}) });
    },
    document: {
      createElement: t => { const e = el(t); created.push(e); return e; },
      getElementById: () => null, querySelector: () => null,
      addEventListener() {}, dispatchEvent() {},
      body: { appendChild() {} }, head: { appendChild() {} },
      documentElement: { appendChild() {}, style: {} },
    },
  };
  sandbox.window = sandbox;
  sandbox.addEventListener = () => {};
  sandbox.supabase = { createClient: () => ({ auth: {
    getSession: () => Promise.resolve({ data: { session: opts.session || null } }),
    onAuthStateChange() {}, signInWithPassword() {}, signInWithOtp() {},
  } }) };
  vm.createContext(sandbox);
  vm.runInContext(GATE, sandbox, { filename: 'topbar.js#authGate' });
  return { sandbox, created, calls,
    loginShown: () => created.some(e => /Log in|sign-in link/i.test(e._h)),
    localOnly: () => sandbox.window.ALS_LOCAL_ONLY === true,
    banner: () => created.find(e => e.id === 'alsLocalBar' || /saving to this device/i.test(e._t)),
  };
}
const settle = () => new Promise(r => setImmediate(() => setImmediate(() => setImmediate(() => setImmediate(r)))));

(async () => {
  section('1) A real session still just works');
  {
    const r = run({ session: { user: { id: 'alex-1' } }, seenUid: 'alex-1', health: 200 });
    await settle();
    is('app runs', r.localOnly(), false);
    is('no login form', r.loginShown(), false);
    is('the health endpoint was never even asked', r.calls.health, 0);
  }

  section('2) ⛔ A device that has NEVER signed in gets the wall — server state is irrelevant');
  {
    const r = run({ session: null, seenUid: null, health: 402 });
    await settle();
    is('login form shown', r.loginShown(), true);
    is('local-only NOT granted', r.localOnly(), false);
    is('it did not even probe (nothing could justify opening)', r.calls.health, 0);
  }

  section('3) ⛔ Server healthy + no session = you really are signed out');
  {
    const r = run({ session: null, seenUid: 'alex-1', health: 200 });
    await settle();
    is('login form shown', r.loginShown(), true);
    is('local-only NOT granted', r.localOnly(), false);
  }

  section('4) ⛔ A 401 is a CLIENT-shaped answer from a LIVE server — the wall stands');
  {
    for (const st of [401, 403, 404]) {
      const r = run({ session: null, seenUid: 'alex-1', health: st });
      await settle();
      is('HTTP ' + st + ' → login, not local-only', [r.loginShown(), r.localOnly()], [true, false]);
    }
  }

  section('5) ✅ 402 restricted — THE outage. The app opens on local data.');
  {
    const r = run({ session: null, seenUid: 'alex-1', health: 402 });
    await settle();
    is('local-only granted', r.localOnly(), true);
    is('no login form', r.loginShown(), false);
    is('ALSAuth.user stays null (onboarding must not run)', r.sandbox.window.ALSAuth.user, null);
    is('…and it says so on screen', !!r.banner(), true);
  }

  section('6) ✅ 429 / 5xx / unreachable are the server too');
  {
    for (const st of [429, 500, 503, 'reject']) {
      const r = run({ session: null, seenUid: 'alex-1', health: st });
      await settle();
      is(st + ' → local-only', [r.localOnly(), r.loginShown()], [true, false]);
    }
  }

  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
})();
