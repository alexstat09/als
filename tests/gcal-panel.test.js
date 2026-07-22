/* tests/gcal-panel.test.js — renders THE DAY panel out of morning.html against
   real calendar shapes and asserts on the produced markup.

   SILENT-EMPTY is this project's recurring disease: a panel that renders
   nothing looks identical to a panel that failed. Every case below asserts
   the body came back with something true in it.

   node tests/gcal-panel.test.js */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const GCAL = fs.readFileSync(path.join(ROOT, 'gcal.js'), 'utf8');
const HTML = fs.readFileSync(path.join(ROOT, 'morning.html'), 'utf8');

/* pull the panel renderer out of the page */
const blocks = [...HTML.matchAll(/<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const PANEL = blocks.find(b => b.includes('THE DAY — Google Calendar'));
if (!PANEL) { console.log('✗ could not find THE DAY script block in morning.html'); process.exit(1); }

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ ' + name + (extra ? '  → ' + extra : '')); }
}
function has(name, html, needle) { ok(name, html.indexOf(needle) >= 0, 'missing ' + JSON.stringify(needle)); }
function lacks(name, html, needle) { ok(name, html.indexOf(needle) < 0, 'unexpectedly contains ' + JSON.stringify(needle)); }
function count(html, cls) { return (html.match(new RegExp('class="' + cls + '"', 'g')) || []).length; }

/* ── harness ──────────────────────────────────────────────── */
function render(events, opts) {
  opts = opts || {};
  const store = {};
  if (events) store['gcal:events'] = JSON.stringify({ ts: Date.now() - 4 * 60000, events, cals: opts.cals || [{ id: 'primary', name: '' }] });
  if (opts.connected !== false) store['gcal:connected'] = '1';
  if (opts.stack) {
    store['stack:items'] = JSON.stringify(opts.stack.items);
    const d = new Date(), p = n => String(n).padStart(2, '0');
    store['stack:taken:' + d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate())] = JSON.stringify(opts.stack.taken);
  }

  let out = null;
  const el = () => ({
    innerHTML: '', addEventListener() {}, setAttribute() {}, getAttribute: () => '0',
    classList: { toggle: () => true, add() {}, remove() {} },
    querySelectorAll: () => [], style: {}, textContent: '', disabled: false
  });
  const bodyEl = el();
  Object.defineProperty(bodyEl, 'innerHTML', {
    get() { return out || ''; }, set(v) { out = v; }
  });

  const win = {};
  const ctx = {
    window: win,
    document: {
      readyState: 'complete',
      getElementById: id => (id === 'mbAgendaBody' ? bodyEl : null),
      createElement: () => el(), head: { appendChild() {} },
      addEventListener() {}
    },
    localStorage: {
      getItem: k => (k in store ? store[k] : null),
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: k => { delete store[k]; }
    },
    setTimeout: fn => { fn(); return 0; },
    fetch: () => Promise.reject(new Error('no network')),
    Promise, Date, JSON, Math, String, Number, Object, Array, RegExp, isNaN,
    encodeURIComponent, console
  };
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  vm.runInContext(GCAL, ctx);
  /* In a browser `window` IS the global, so gcal.js assigning window.GCal also
     defines the bare identifier the page uses. Model that here. */
  ctx.GCal = win.GCal;
  vm.runInContext(PANEL, ctx);
  return out || '';
}

let _id = 0;
function iso(x) {
  const off = -x.getTimezoneOffset(), sg = off >= 0 ? '+' : '-';
  const p = n => String(Math.floor(Math.abs(n))).padStart(2, '0');
  return x.getFullYear() + '-' + p(x.getMonth() + 1) + '-' + p(x.getDate()) + 'T' +
    p(x.getHours()) + ':' + p(x.getMinutes()) + ':00' + sg + p(off / 60) + ':' + p(off % 60);
}
function ev(dayOffset, h, m, dur, title, opts) {
  const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + dayOffset);
  const s = new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, m, 0, 0);
  return Object.assign({
    id: 'e' + (++_id), title, start: iso(s), end: iso(new Date(s.getTime() + dur * 60000)),
    allDay: false, location: '', rec: false, cal: 'primary', calName: ''
  }, opts || {});
}
function hisRoutines(off) {
  return [
    ev(off, 10, 0, 5, '🦷 Morning Teeth Routine', { rec: true }),
    ev(off, 10, 0, 5, '☀️ Morning skincare', { rec: true }),
    ev(off, 11, 0, 5, '💊 Morning Supplements', { rec: true }),
    ev(off, 13, 0, 5, '🛒 Order Skincare Products', { rec: true }),
    ev(off, 14, 0, 5, '💊 Lunch Supplements', { rec: true }),
    ev(off, 22, 30, 5, '🦷 Night Teeth Routine', { rec: true }),
    ev(off, 22, 30, 5, '💊 Night Supplements', { rec: true }),
    ev(off, 22, 30, 5, '🌙 Night skincare', { rec: true }),
    ev(off, 23, 0, 0, 'sleep', { rec: true })
  ];
}
const GYM = o => ev(o, 15, 0, 105, 'Gym Cybex', { rec: true, location: 'Cybex gym, Γεωρ. Σεφέρη 78, Rodos 851 00, Greece' });

console.log('\nTHE DAY panel\n');

/* ── 1. his actual Saturday ───────────────────────────────── */
{
  const h = render(hisRoutines(0).concat([GYM(0)]));
  ok('renders something at all', h.length > 200, 'got ' + h.length + ' chars');
  has('the gym is on the rail', h, 'Gym Cybex');
  has('the day is stated in one line', h, 'One thing today');
  has('routines are folded, not listed', h, 'Routines');
  ok('exactly ONE event card on the rail', count(h, 'mb-ev') === 1, 'found ' + count(h, 'mb-ev'));
  ok('the 9 routines collapse to 3 clusters', count(h, 'mb-rt') === 3, 'found ' + count(h, 'mb-rt'));
  has('location is trimmed to the useful part', h, 'Cybex gym');
  lacks('…without the full postal address', h, '851 00');
  has('free time is named', h, 'free');
  has('sync moved to the footer', h, 'mb-day-foot');
  has('…with a real timestamp', h, 'Synced 4 min ago');
}

/* ── 2. a plain weekday: routines only ────────────────────── */
{
  const h = render(hisRoutines(0));
  ok('still renders with zero real events', h.length > 150);
  has('says nothing is committed', h, 'Nothing committed today');
  has('…and counts the routines honestly', h, '9 routines');
  ok('no event cards invented', count(h, 'mb-ev') === 0);
}

/* ── 3. exam outranks the page ────────────────────────────── */
{
  const h = render(hisRoutines(0).concat([ev(3, 9, 0, 90, 'Διαγώνισμα Ιστορίας')]));
  has('exam card renders', h, 'mb-day-exam');
  has('…with the countdown', h, '>3<');
  has('…pluralised', h, 'DAYS');
  has('…and the title', h, 'Διαγώνισμα Ιστορίας');
  const h1 = render(hisRoutines(0).concat([ev(1, 9, 0, 90, 'Test Χημείας')]));
  has('singular day', h1, 'DAY<');
  has('tomorrow named in words', h1, 'Tomorrow');
}

/* ── 4. no exam → no exam card, ever ──────────────────────── */
{
  const h = render(hisRoutines(0).concat([GYM(0)]));
  lacks('no fabricated exam card', h, 'mb-day-exam');
}

/* ── 5. the stack is read, never invented ─────────────────── */
{
  const withStack = render(hisRoutines(0), { stack: { items: [1, 2, 3, 4], taken: { a: 1, b: 1 } } });
  has('supplement cluster shows real stack progress', withStack, '2/4 stack');
  const noStack = render(hisRoutines(0));
  lacks('no stack data → no fake count', noStack, 'stack');
}

/* ── 6. not connected → an invitation, not an error ───────── */
{
  const h = render(null, { connected: false });
  has('connect CTA renders', h, 'mbAgConnect');
  has('…and says where the data goes', h, 'never leaves this device');
  lacks('no empty rail', h, 'mb-rail');
}

/* ── 7. connected but the cache is empty ──────────────────── */
{
  const h = render([]);
  ok('an empty calendar still renders', h.length > 100);
  has('says so plainly', h, 'Nothing on the calendar today');
  has('…and still offers sync', h, 'mb-day-sync');
}

/* ── 8. a busy exam-season day ────────────────────────────── */
{
  const h = render(hisRoutines(0).concat([
    ev(0, 8, 30, 300, 'Σχολείο'),
    ev(0, 15, 0, 105, 'Gym Cybex', { rec: true }),
    ev(0, 19, 0, 90, 'Φροντιστήριο Αγγλικά')
  ]));
  ok('three real events, three cards', count(h, 'mb-ev') === 3, 'found ' + count(h, 'mb-ev'));
  has('counts them in the read line', h, '3 things');
  has('school is tinted as school', h, 'k-school');
  has('gym is tinted as gym', h, 'k-gym');
}

/* ── 9. tomorrow gets a line, today's noise does not ──────── */
{
  const h = render(hisRoutines(0).concat(hisRoutines(1)).concat([GYM(1)]));
  has('tomorrow is previewed', h, 'Tomorrow ·');
  has('…naming the real event', h, 'Gym Cybex');
  const quiet = render(hisRoutines(0).concat(hisRoutines(1)));
  lacks('tomorrow line stays away when only routines', quiet, 'Tomorrow ·');
}

/* ── 10. multi-calendar + all-day ─────────────────────────── */
{
  const d = new Date(); d.setHours(0, 0, 0, 0);
  const p = n => String(n).padStart(2, '0');
  const ds = d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  const h = render([{ id: 'h1', title: 'Δεκαπενταύγουστος', start: ds, end: ds, allDay: true,
    location: '', rec: false, cal: 'hol', calName: 'Holidays in Greece' }],
    { cals: [{ id: 'primary', name: 'me' }, { id: 'hol', name: 'Holidays in Greece' }] });
  has('all-day event shows as all day', h, 'all day');
  has('source calendar is credited', h, 'Holidays in Greece');
  has('footer counts the calendars', h, '2 calendars');
}

/* ── 11. escaping ─────────────────────────────────────────── */
{
  const h = render([ev(0, 12, 0, 60, '<img src=x onerror=alert(1)>')]);
  lacks('event titles are escaped', h, '<img src=x');
  has('…as entities', h, '&lt;img');
}

console.log('\n' + pass + ' passed, ' + fail + ' failed\n');
process.exit(fail ? 1 : 0);
