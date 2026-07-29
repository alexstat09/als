/* Regression test for als-v436: the nutrition streak seed was destroying the
   streak it existed to preserve.

   Alex carried his MyFitnessPal streak into this app on 2026-07-06 at 788. The
   seed lived inside getStreak() — a function that RENDERS — and it WROTE:

     function getStreak(){ var s=ls(STREAK,null);
       if(!s||typeof s.count!=='number'){ s={count:788,lastDay:today(),_ts:Date.now()}; save(STREAK,s); }
       return s; }

   Any paint before the cloud pull landed (fresh device, sign-out, cleared
   storage, slow sync) found no `nut:streak`, wrote 788 back with a FRESH `_ts`,
   and won whole-object last-write-wins against the real count in the cloud.

   Proof it happened: his 2026-07-14 device export holds {count:796,
   lastDay:"2026-07-14"}. On 2026-07-29 the page showed 790. A streak can only
   rise by one or reset to one, so 796 -> 790 is impossible by counting — and
   790 is exactly 788 + 2.

   These tests run the REAL functions, extracted from nutrition.html. Putting
   the seed back, or letting getStreak() write again, must make them fail. */
'use strict';
const fs = require('fs');
const vm = require('vm');
const ALS = '/Users/alexstathatos/ALS DASHBOARD ALL FILES/als';
const SRC = fs.readFileSync(ALS + '/nutrition.html', 'utf8');

let pass = 0, fail = 0;
function is(name, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  console.log((ok ? '  ✓ ' : '  ✗ FAIL ') + name + (ok ? '' : `\n      got  ${JSON.stringify(got)}\n      want ${JSON.stringify(want)}`));
}
function ok(name, cond) { is(name, !!cond, true); }
function section(s) { console.log('\n' + s); }

/* ── 0 · the seed must be gone from the source ──────────────────── */
section('the seed is gone, not merely guarded');
ok('getStreak() contains no save() call',
  /function getStreak\(\)\{[^\n]*\n?/.test(SRC) && !/function getStreak\(\)\{[^}]*save\(/.test(SRC));

/* ── 1 · extract the real functions ─────────────────────────────── */
function grab(name) {
  const i = SRC.indexOf('function ' + name + '(');
  if (i < 0) throw new Error('could not find function ' + name + ' in nutrition.html');
  // walk braces from the first { after the signature
  let j = SRC.indexOf('{', i), depth = 0, k = j;
  for (; k < SRC.length; k++) {
    if (SRC[k] === '{') depth++;
    else if (SRC[k] === '}') { depth--; if (depth === 0) break; }
  }
  return SRC.slice(i, k + 1);
}
const EXTRACTED = ['getStreak', 'renderStreak', 'nextDay', 'loggedDays', 'trueStreak', 'repairStreak']
  .map(grab).join('\n');
// The literal may still appear in the comment that documents the bug — that is
// the point of the comment. What must never come back is 788 in live CODE.
ok('no `788` survives in any streak function body', !/788/.test(EXTRACTED));
const CONSTS = (SRC.match(/var STREAKFIX='nut:streakfix'[^;]*;/) || [])[0];
ok('constants line found (STREAKFIX / FIX_V / ANCHOR_DAY / ANCHOR_COUNT)', !!CONSTS);
ok('the anchor is the observed 14 Jul export value', /ANCHOR_DAY='2026-07-14'/.test(CONSTS) && /ANCHOR_COUNT=796/.test(CONSTS));

/* ── 2 · sandbox: real code, stubbed surroundings ───────────────── */
function makeEnv(opts) {
  opts = opts || {};
  const store = Object.assign({}, opts.store || {});
  const chip = { innerHTML: '' };
  const env = {
    console,
    STREAK: 'nut:streak',
    TODAY: opts.today || '2026-07-29',
    __logs: opts.logs || [],
    localStorage: {
      getItem: k => (k in store ? store[k] : null),
      setItem: (k, v) => { store[k] = v; }
    },
    document: { getElementById: id => (id === 'streakChip' ? chip : null) },
    window: { ALSProfile: opts.profile === undefined ? { isOwner: () => true } : opts.profile },
    _store: store, _chip: chip, _writes: []
  };
  const boot = `
    function pad(n){ return String(n).padStart(2,'0'); }
    function today(){ return TODAY; }
    function ls(k,f){ try{ var v=JSON.parse(localStorage.getItem(k)); return v==null?f:v; }catch(e){ return f; } }
    function save(k,v){ _writes.push(k); localStorage.setItem(k, JSON.stringify(v)); return true; }
    function getLogs(){ return __logs; }
    ${CONSTS}
    ${EXTRACTED}
  `;
  vm.createContext(env);
  vm.runInContext(boot, env);
  return env;
}
const daysBetween = (from, to) => {
  const out = [];
  let d = new Date(from + 'T12:00:00Z'), end = new Date(to + 'T12:00:00Z');
  while (d <= end) { out.push(d.toISOString().slice(0, 10)); d.setUTCDate(d.getUTCDate() + 1); }
  return out;
};
const logsFor = days => days.map((dk, i) => ({ id: 'n' + i, dateKey: dk, kcal: 500 }));

/* ── 3 · getStreak never writes ─────────────────────────────────── */
section('getStreak() is read-only — the bug itself');
{
  const env = makeEnv({ store: {} });
  const got = vm.runInContext('getStreak()', env);
  is('absent store returns a zero-count shape', got, { count: 0, lastDay: '' });
  is('and it wrote NOTHING', env._writes, []);
  is('nut:streak was not created', env._store['nut:streak'], undefined);
}
{
  const env = makeEnv({ store: { 'nut:streak': JSON.stringify({ count: 811, lastDay: '2026-07-29' }) } });
  is('a real streak is returned untouched', vm.runInContext('getStreak().count', env), 811);
  is('and reading it still writes nothing', env._writes, []);
}

/* ── 4 · trueStreak — rebuilt from his own diary ────────────────── */
section('trueStreak() reconstructs from the logs');
{
  // every day logged from the anchor through today — his actual case
  const env = makeEnv({ today: '2026-07-29', logs: logsFor(daysBetween('2026-07-14', '2026-07-29')) });
  is('29 Jul, unbroken since the anchor → 811', vm.runInContext('trueStreak()', env), { count: 811, lastDay: '2026-07-29' });
}
{
  const env = makeEnv({ today: '2026-07-14', logs: logsFor(['2026-07-14']) });
  is('on the anchor day itself → the anchor value, unchanged', vm.runInContext('trueStreak()', env), { count: 796, lastDay: '2026-07-14' });
}
{
  // today not logged yet is normal, not a gap
  const env = makeEnv({ today: '2026-07-29', logs: logsFor(daysBetween('2026-07-14', '2026-07-28')) });
  is('today unlogged → counts through yesterday', vm.runInContext('trueStreak()', env), { count: 810, lastDay: '2026-07-28' });
}
{
  // a REAL gap means the streak legitimately broke — the anchor no longer applies
  const withGap = daysBetween('2026-07-14', '2026-07-29').filter(d => d !== '2026-07-20');
  const env = makeEnv({ today: '2026-07-29', logs: logsFor(withGap) });
  is('a missed day mid-run → null, never a repaired number', vm.runInContext('trueStreak()', env), null);
}
{
  // an unloaded diary and an empty one look the same — so answer neither
  const env = makeEnv({ today: '2026-07-29', logs: [] });
  is('no logs at all → null', vm.runInContext('trueStreak()', env), null);
  const env2 = makeEnv({ today: '2026-07-29', logs: logsFor(daysBetween('2026-07-15', '2026-07-29')) });
  is('anchor day missing from the diary → null', vm.runInContext('trueStreak()', env2), null);
}

/* ── 5 · repairStreak — the five guards ─────────────────────────── */
section('repairStreak() guards');
const HIS_LOGS = logsFor(daysBetween('2026-07-14', '2026-07-29'));
function repairEnv(extra) {
  return makeEnv(Object.assign({
    today: '2026-07-29', logs: HIS_LOGS,
    store: { 'als:uid': '1655556c-97af-43ac-970f-fcbdbd8f7f0c', 'nut:streak': JSON.stringify({ count: 790, lastDay: '2026-07-29' }) }
  }, extra || {}));
}
{
  const env = repairEnv();
  vm.runInContext('repairStreak()', env);
  is('the damaged 790 is repaired to 811', JSON.parse(env._store['nut:streak']).count, 811);
  is('lastDay follows the last logged day', JSON.parse(env._store['nut:streak']).lastDay, '2026-07-29');
  ok('the write carries a fresh _ts so it wins LWW', JSON.parse(env._store['nut:streak'])._ts > 0);
  is('the once-per-device flag is set', JSON.parse(env._store['nut:streakfix']), 1);
  ok('the chip was repainted', /811/.test(env._chip.innerHTML));
}
{
  const env = repairEnv();
  vm.runInContext('repairStreak(); repairStreak(); repairStreak()', env);
  is('running it again is a no-op (one nut:streak write only)',
    env._writes.filter(k => k === 'nut:streak').length, 1);
}
{
  const env = repairEnv({ store: { 'nut:streak': JSON.stringify({ count: 790, lastDay: '2026-07-29' }) } }); // no als:uid
  vm.runInContext('repairStreak()', env);
  is('no resolved session → refuses to write', JSON.parse(env._store['nut:streak']).count, 790);
  is('and does not burn the flag', env._store['nut:streakfix'], undefined);
}
{
  const env = repairEnv({ profile: { isOwner: () => false } });
  vm.runInContext('repairStreak()', env);
  is('not his account → refuses to write', JSON.parse(env._store['nut:streak']).count, 790);
}
{
  const env = repairEnv({ profile: null });
  vm.runInContext('repairStreak()', env);
  is('no ALSProfile at all → refuses to write', JSON.parse(env._store['nut:streak']).count, 790);
}
{
  const env = repairEnv({ store: {
    'als:uid': 'x', 'nut:streak': JSON.stringify({ count: 900, lastDay: '2026-07-29' }) } });
  vm.runInContext('repairStreak()', env);
  is('it can only ever RAISE — a higher count is left alone', JSON.parse(env._store['nut:streak']).count, 900);
  is('but it marks itself done', JSON.parse(env._store['nut:streakfix']), 1);
}
{
  const gap = logsFor(daysBetween('2026-07-14', '2026-07-29').filter(d => d !== '2026-07-22'));
  const env = repairEnv({ logs: gap });
  vm.runInContext('repairStreak()', env);
  is('a genuine break is left to bumpStreak, not papered over', JSON.parse(env._store['nut:streak']).count, 790);
}
{
  const env = repairEnv({ logs: [] });
  vm.runInContext('repairStreak()', env);
  is('an unloaded diary writes nothing', JSON.parse(env._store['nut:streak']).count, 790);
  is('and leaves the flag unset so a later sync can still repair', env._store['nut:streakfix'], undefined);
}

/* ── 6 · renderStreak never prints a nought ─────────────────────── */
section('renderStreak() shows "—" for no streak, never 0');
{
  const env = makeEnv({ store: {} });
  vm.runInContext('renderStreak()', env);
  ok('no streak renders a dash', /—/.test(env._chip.innerHTML));
  ok('and never the digit 0', !/>\s*0\s*$|\s0$/.test(env._chip.innerHTML.trim()));
}
{
  const env = makeEnv({ store: { 'nut:streak': JSON.stringify({ count: 811, lastDay: '2026-07-29' }) } });
  vm.runInContext('renderStreak()', env);
  ok('a real streak renders its number', /811/.test(env._chip.innerHTML));
}

/* ── 7 · the flag must stay device-local ────────────────────────── */
section('nut:streakfix is device-local');
{
  const sync = (SRC.match(/syncedKeys:\[[^\]]*\]/) || [''])[0];
  ok('it is not in syncedKeys', !/streakfix/.test(sync));
  ok('nut:streak itself IS still synced', /'nut:streak'/.test(sync));
  const backup = fs.readFileSync(ALS + '/backup.html', 'utf8');
  ok('and it is not in the vault BUNDLES', !/streakfix/.test(backup));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
