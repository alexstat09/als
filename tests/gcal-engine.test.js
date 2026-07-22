/* tests/gcal-engine.test.js — the calendar engine, run against the REAL shape of
   his calendar (5-min recurring habit reminders + one weekly Gym Cybex block).

   Guards the thing that made the old agenda unreadable: a routine and a real
   event must never come back looking the same.

   node tests/gcal-engine.test.js */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SRC = fs.readFileSync(path.join(__dirname, '..', 'gcal.js'), 'utf8');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ ' + name + (extra ? '  → ' + extra : '')); }
}
function eq(name, got, want) { ok(name, got === want, 'got ' + JSON.stringify(got) + ', want ' + JSON.stringify(want)); }

/* ── harness ──────────────────────────────────────────────── */
function load(events, cals) {
  const store = {};
  if (events) store['gcal:events'] = JSON.stringify({ ts: Date.now(), events: events, cals: cals || [{ id: 'primary', name: '' }] });
  const win = {};
  const ctx = {
    window: win,
    document: { getElementById: () => null, createElement: () => ({}), head: { appendChild() {} } },
    localStorage: {
      getItem: k => (k in store ? store[k] : null),
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: k => { delete store[k]; }
    },
    fetch: () => Promise.reject(new Error('no network in tests')),
    Promise, Date, JSON, Math, String, Number, Object, Array, RegExp, isNaN, encodeURIComponent, console
  };
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  vm.runInContext(SRC, ctx);
  return { G: win.GCal, store };
}

/* Build an ISO local timestamp with the Athens offset, on a day N from today. */
function at(dayOffset, h, m, durMin) {
  const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + dayOffset);
  const s = new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, m, 0, 0);
  const e = new Date(s.getTime() + (durMin || 0) * 60000);
  const iso = x => {
    const off = -x.getTimezoneOffset();
    const sg = off >= 0 ? '+' : '-';
    const p = n => String(Math.floor(Math.abs(n))).padStart(2, '0');
    return x.getFullYear() + '-' + p(x.getMonth() + 1) + '-' + p(x.getDate()) + 'T' +
      p(x.getHours()) + ':' + p(x.getMinutes()) + ':00' + sg + p(off / 60) + ':' + p(off % 60);
  };
  return { start: iso(s), end: iso(e) };
}
let _id = 0;
function ev(dayOffset, h, m, dur, title, opts) {
  const t = at(dayOffset, h, m, dur);
  return Object.assign({ id: 'e' + (++_id), title, start: t.start, end: t.end, allDay: false,
    location: '', rec: false, cal: 'primary', calName: '' }, opts || {});
}

/* His actual day, reproduced. Every routine is 5 minutes and recurring. */
function hisDay(off) {
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

console.log('\ngcal engine\n');

/* ── 1. the core split ────────────────────────────────────── */
{
  const gym = ev(0, 15, 0, 105, 'Gym Cybex', { rec: true, location: 'Cybex gym, Γεωρ. Σεφέρη 78, Rodos 851 00, Greece' });
  const { G } = load(hisDay(0).concat([gym]));
  const d = G.day(0);
  eq('his real day yields exactly 1 event', d.events.length, 1);
  eq('…and it is the gym', d.events[0].title, 'Gym Cybex');
  eq('the other 9 fold into routines', d.routines.length, 9);
  eq('anchor is the gym block', d.anchor && d.anchor.title, 'Gym Cybex');
  ok('bedtime read from his own sleep marker', d.bedtime && d.bedtime.getHours() === 23);
}

/* ── 2. a long recurring block is NEVER a routine ─────────── */
{
  const { G } = load([ev(0, 15, 0, 105, 'Gym Cybex', { rec: true })]);
  eq('105-min recurring block classifies as gym', G.classify(G.day(0).events[0]), 'gym');
  const { G: G2 } = load([ev(0, 9, 0, 60, 'Weekly sync', { rec: true })]);
  eq('60-min recurring block stays an event', G2.classify(G2.day(0).events[0]), 'event');
}

/* ── 3. a SHORT ONE-OFF is an event, not a routine ────────── */
{
  const { G } = load([ev(0, 16, 0, 5, 'Call the dentist', { rec: false })]);
  const d = G.day(0);
  eq('5-min non-recurring item survives as a real event', d.events.length, 1);
  eq('…and is not swallowed as a routine', d.routines.length, 0);
}

/* ── 4. exams, in both alphabets ──────────────────────────── */
{
  const cases = [
    ['Διαγώνισμα Ιστορίας', 'exam'],
    ['ΔΙΑΓΩΝΙΣΜΑ ΜΑΘΗΜΑΤΙΚΩΝ', 'exam'],   // caps + no accents
    ['τεστ Αρχαία', 'exam'],
    ['Physics test', 'exam'],
    ['Final exam', 'exam'],
    ['Εξετάσεις', 'exam'],
    ['Σχολείο', 'school'],
    ['Φροντιστήριο Αγγλικά', 'school'],
    ['Gym Cybex', 'gym'],
    ['Προπόνηση', 'gym'],
    ['sleep', 'sleep'],
    ['Cinema with the guys', 'event']
  ];
  cases.forEach(([title, want]) => {
    const { G } = load([ev(0, 12, 0, 60, title)]);
    eq('"' + title + '" → ' + want, G.classify(G.day(0).events[0] || G.day(0).routines[0]), want);
  });
}

/* ── 5. exam outranks everything as the anchor ────────────── */
{
  const { G } = load([
    ev(0, 9, 0, 45, 'Διαγώνισμα Ιστορίας'),
    ev(0, 15, 0, 105, 'Gym Cybex', { rec: true })
  ]);
  eq('short exam beats long gym for anchor', G.day(0).anchor.title, 'Διαγώνισμα Ιστορίας');
}

/* ── 6. nextExam scans the whole 7-day window ─────────────── */
{
  const { G } = load(hisDay(0).concat(hisDay(4)).concat([ev(4, 9, 0, 45, 'Τεστ Χημείας')]));
  const x = G.nextExam();
  ok('finds an exam 4 days out', !!x);
  eq('…with the right countdown', x && x.days, 4);
  eq('…and the right title', x && x.ev.title, 'Τεστ Χημείας');
  const { G: G2 } = load(hisDay(0));
  eq('no exam → null, never a fake one', G2.nextExam(), null);
}

/* ── 7. gaps ignore routines, respect bedtime ─────────────── */
{
  const { G } = load(hisDay(2).concat([ev(2, 15, 0, 105, 'Gym Cybex', { rec: true })]));
  const d = G.day(2);
  ok('a future day has free blocks', d.gaps.length >= 2);
  ok('no gap runs past his 23:00 sleep marker',
    d.gaps.every(g => g.end.getHours() < 23 || (g.end.getHours() === 23 && g.end.getMinutes() === 0)));
  ok('teeth at 10:00 does not carve up the morning', d.gaps.some(g => g.mins >= 240),
    JSON.stringify(d.gaps.map(g => g.mins)));
}

/* ── 8. all-day events land on the right local day ────────── */
{
  /* Parsed naively, "YYYY-MM-DD" is UTC midnight → the previous day in Athens.
     This is the bug that would have shown Greek holidays a day early. */
  const d0 = new Date(); d0.setHours(0, 0, 0, 0); d0.setDate(d0.getDate() + 3);
  const p = n => String(n).padStart(2, '0');
  const ds = d0.getFullYear() + '-' + p(d0.getMonth() + 1) + '-' + p(d0.getDate());
  const { G } = load([{ id: 'h1', title: 'Δεκαπενταύγουστος', start: ds, end: ds, allDay: true,
    location: '', rec: false, cal: 'holidays', calName: 'Holidays in Greece' }]);
  eq('all-day holiday appears on ITS day', G.day(3).events.length, 1);
  eq('…and not the day before', G.day(2).events.length, 0);
}

/* ── 9. duration is DST-safe ──────────────────────────────── */
{
  /* 31 Oct 2026 his gym flips +03:00 → +02:00. Hand-rolled hour math breaks
     here; Date math must not. */
  const { G } = load([{ id: 'g', title: 'Gym Cybex', allDay: false, rec: true, cal: 'primary', calName: '',
    location: '', start: '2026-10-31T15:00:00+02:00', end: '2026-10-31T16:45:00+02:00' }]);
  eq('105 minutes across the DST boundary', G.durMin(G.cached().events[0]), 105);
}

/* ── 10. empty + missing cache never throw ────────────────── */
{
  const { G } = load(null);
  const d = G.day(0);
  eq('no cache → no events', d.events.length, 0);
  eq('no cache → no routines', d.routines.length, 0);
  eq('no cache → no anchor', d.anchor, null);
  eq('no cache → no exam', G.nextExam(), null);
  eq('week() still returns 7 days', G.week().length, 7);
  eq('calendars() is empty, not undefined', G.calendars().length, 0);
}

/* ── 11. calendar selection ───────────────────────────────── */
{
  const cals = [{ id: 'primary', name: 'me' }, { id: 'hol', name: 'Holidays in Greece' }];
  const { G, store } = load([ev(0, 12, 0, 60, 'Lunch')], cals);
  eq('both calendars listed', G.calendars().length, 2);
  ok('all selected by default', G.calendars().every(c => c.selected));
  G.setCalendars(['primary']);
  eq('selection persists', JSON.parse(store['gcal:cals'])[0], 'primary');
  eq('holidays now deselected', G.calendars().filter(c => c.selected).length, 1);
  G.setCalendars([]);
  ok('empty selection resets to all', G.calendars().every(c => c.selected));
}

/* ── 12. back-compat: the old API still works ─────────────── */
{
  const { G } = load(hisDay(0).concat(hisDay(1)));
  eq('eventsForDay(0) unchanged for callers', G.eventsForDay(G.cached().events, 0).length, 9);
  eq('eventsForDay(1) unchanged for callers', G.eventsForDay(G.cached().events, 1).length, 9);
}

console.log('\n' + pass + ' passed, ' + fail + ' failed\n');
process.exit(fail ? 1 : 0);
