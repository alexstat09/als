/* Regression test for the 24/07/26 fix: the HOME nutrition tile read 2,614 kcal
   while the nutrition page read ~1,600 for the SAME day.

   Root cause: nutrition.html reads through getLogs(), which drops null-id rows
   and any id in the nut:deleted block-list (a READ-TIME guard, because a cloud
   merge can resurrect a deleted food into the raw nut:logs array — sync
   tombstones lose to clock skew). home-live.js (and the morning briefing, the
   body page, and main.html's protein goal) summed the RAW array, so a deleted
   entry that came back inflated the daily total on those surfaces.

   Every daily "today's intake" read must now apply the same block-list.
   Reverting the guard must make these fail. */
'use strict';
const fs = require('fs');
const ALS = '/Users/alexstathatos/ALS DASHBOARD ALL FILES/als';

let pass = 0, fail = 0;
function is(name, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  console.log((ok ? '  ✓ ' : '  ✗ FAIL ') + name + (ok ? '' : `\n      got  ${JSON.stringify(got)}\n      want ${JSON.stringify(want)}`));
}
function ok(name, cond) { is(name, !!cond, true); }
function section(s) { console.log('\n' + s); }

/* ── 1 · the filter every daily read must implement ─────────────── */
section('block-list filter (mirrors nutrition.html getLogs)');

const TODAY = '2026-07-24';
const logs = [
  { id: 'a', dateKey: TODAY, kcal: 600, p: 40 },   // real
  { id: 'b', dateKey: TODAY, kcal: 500, p: 35 },   // real
  { id: 'c', dateKey: TODAY, kcal: 500, p: 30 },   // real
  { id: 'ghost', dateKey: TODAY, kcal: 1014, p: 71 }, // deleted, resurrected in raw array
  { id: null,   dateKey: TODAY, kcal: 999, p: 60 },   // null id — never counted
  { id: 'y', dateKey: '2026-07-23', kcal: 1500, p: 90 } // yesterday
];
const deleted = { ghost: 1753300000000 };

function sumDay(all, del, day, field) {
  del = (del && typeof del === 'object' && !Array.isArray(del)) ? del : {};
  return all
    .filter(l => l && l.id != null && !del[l.id] && l.dateKey === day)
    .reduce((s, l) => s + (l[field] || 0), 0);
}

is('kcal excludes deleted + null-id + other days', sumDay(logs, deleted, TODAY, 'kcal'), 1600);
is('protein excludes the same', sumDay(logs, deleted, TODAY, 'p'), 105);
is('fully-raw sum of today (no guard at all)', logs.filter(l => l && l.dateKey === TODAY).reduce((s, l) => s + l.kcal, 0), 3613);
is('id-guard on but block-list empty still shows the ghost (the reported 2,614)', sumDay(logs, {}, TODAY, 'kcal'), 2614);

/* ── 2 · source guard: no surface may read the raw array undeleted ── */
section('every daily nut:logs reader applies the nut:deleted block-list');

function read(f) { return fs.readFileSync(ALS + '/' + f, 'utf8'); }

const homeLive = read('home-live.js');
// the nutrition case must build the block-list and filter by it before summing
ok('home-live.js nutrition case references nut:deleted',
   /case 'nutrition\.html'[\s\S]{0,400}nut:deleted/.test(homeLive));
ok('home-live.js filters id!=null && !del[...]',
   /nut:deleted[\s\S]{0,300}l\.id != null[\s\S]{0,60}!del\[l\.id\]/.test(homeLive));

const morning = read('morning.html');
ok('morning.html defines nutDeleted() helper', /function nutDeleted\(\)/.test(morning));
ok('morning.html loadSystems read is guarded', /!nutDeleted\(\)\[l\.id\][\s\S]{0,120}reduce/.test(morning));
ok('morning.html dayTotalsKey is guarded', /!del\[e\.id\]&&e\.dateKey===key/.test(morning));

const body = read('body.html');
ok('body.html renderNutrition is guarded', /nut:deleted[\s\S]{0,200}!nDel\[l\.id\]/.test(body));

const main = read('main.html');
ok('main.html proteinToday is guarded', /proteinToday[\s\S]{0,200}!del\[e\.id\]/.test(main));

/* ── summary ─────────────────────────────────────────────────── */
console.log(`\n${fail ? '✗' : '✓'} nutrition-deleted: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
