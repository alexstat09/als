/* als-v439 — "these three ingredients are one meal".

   Tuna + pasta + tomato paste is one lunch, not three loose rows. This suite
   covers the group model that makes that true, and the two traps found while
   building it:

   1. sync.js's mergeArray settles a same-id conflict on the NEWER `ts` and
      gives a TIE to local. So stamping a group without moving `ts` would let a
      second device keep its own ungrouped copy forever and push it back over
      this one — the group would silently never propagate.

   2. Which means a stamp REWRITES `ts` — and pruneDupes judged "accidental
      double-add" on a 15-minute `ts` window. Two genuinely separate identical
      portions (an egg at 08:00 and another at 12:00) stamped into one meal both
      land on the same instant, match on every key field, and one is SILENTLY
      DROPPED. `ts0` (when the food was actually logged) is what pruneDupes must
      judge on. moveEntries rewrites `ts` too, so that bug was already live
      there before this version — moving all of Lunch to Dinner could eat a
      duplicate portion.

   Everything here runs the REAL functions extracted from nutrition.html. */
'use strict';
const fs = require('fs');
const vm = require('vm');
const ALS = __dirname + '/..';
const SRC = fs.readFileSync(ALS + '/nutrition.html', 'utf8');

let pass = 0, fail = 0;
function is(name, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  console.log((ok ? '  ✓ ' : '  ✗ FAIL ') + name + (ok ? '' : `\n      got  ${JSON.stringify(got)}\n      want ${JSON.stringify(want)}`));
}
function ok(name, cond) { is(name, !!cond, true); }
function section(s) { console.log('\n' + s); }

function grab(name) {
  const i = SRC.indexOf('function ' + name + '(');
  if (i < 0) throw new Error('could not find function ' + name + ' in nutrition.html');
  let j = SRC.indexOf('{', i), depth = 0, k = j;
  for (; k < SRC.length; k++) {
    if (SRC[k] === '{') depth++;
    else if (SRC[k] === '}') { depth--; if (depth === 0) break; }
  }
  return SRC.slice(i, k + 1);
}

/* ── 0 · a stamp must move `ts`, and pruneDupes must not judge on it ── */
section('the two traps, asserted on the source itself');
const STAMP = grab('stampGroup');
ok('stampGroup rewrites ts (or the group never reaches a 2nd device)', /e\.ts\s*=\s*Date\.now\(\)/.test(STAMP));
ok('stampGroup preserves the original log time in ts0', /e\.ts0\s*==\s*null/.test(STAMP) && /e\.ts0\s*=/.test(STAMP));
const PRUNE = grab('pruneDupes');
ok('pruneDupes judges its window on ts0, never on a rewritten ts', /ts0/.test(PRUNE));
ok('pruneDupes no longer reads e.ts directly for the window', !/keepTs\s*=\s*arr\[0\]\.ts\b/.test(PRUNE));
const MOVE = grab('moveEntries');
ok('moveEntries carries ts0 across a move', /c\.ts0/.test(MOVE));
const COMMIT = grab('commitDiaryAdd');
ok('editing a row carries its group across the id change', /keep\.grp/.test(COMMIT));
const COPY = grab('copyMealDay');
ok('copyMealDay REMAPS group ids rather than copying them', /remap/.test(COPY));
const SAVE = grab('mealSave');
ok('a saved meal never stores a diary row\'s group', /delete c\.grp/.test(SAVE));
ok('a saved meal never stores ts0 either', /delete c\.ts0/.test(SAVE));
const DRAFT = grab('saveDraft');
ok('the draft is written from saveDraft(), not from a render', /save\(DRAFTK/.test(DRAFT));
ok('renderMealEditor never writes', !/save\(|localStorage\.setItem/.test(grab('renderMealEditor')));
ok('renderTab never writes', !/save\(DRAFTK|localStorage\.setItem/.test(grab('renderTab')));
ok('groupSlot never writes', !/save\(|setItem/.test(grab('groupSlot')));
ok('nut:mealDraft is NOT in syncedKeys (it is a scratchpad, not data)',
  /syncedKeys:\[[^\]]*\]/.test(SRC) && !/syncedKeys:\[[^\]]*mealDraft/.test(SRC));

/* ── 1 · run the real functions ─────────────────────────────────── */
section('the group model, running the real code');

const store = {};
const sandbox = {
  console,
  localStorage: {
    getItem: k => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: k => { delete store[k]; }
  },
  window: {},
  Date, Math, JSON, String, Number, Array, Object, isFinite, parseFloat, parseInt
};
sandbox.window.ALSSync = null;
vm.createContext(sandbox);

const PRELUDE = `
  var LOGS='nut:logs', DELK='nut:deleted', DRAFTK='nut:mealDraft';
  var viewDate='2026-07-29';
  var _pIndexCache=null;
  function ls(k,f){ try{ var v=JSON.parse(localStorage.getItem(k)); return v==null?f:v; }catch(e){ return f; } }
  function save(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); return true; }catch(e){ return false; } }
  function uid(){ return 'nf-'+(Math.random().toString(36).slice(2,10)); }
  function r0(n){ return Math.round(n||0); }
  function renderAll(){}
`;
const REAL = ['getDeleted', 'getLogs', 'saveLogs', 'dayLogs', 'grpId', 'grpEntries',
  'groupSlot', 'stampGroup', 'delEntries', 'pruneDupes', 'suggestMealName'].map(grab).join('\n');
vm.runInContext(PRELUDE + '\n' + REAL, sandbox);

function seed(rows) { store['nut:logs'] = JSON.stringify(rows); delete store['nut:deleted']; }
const T = Date.parse('2026-07-29T12:00:00Z');
function food(id, name, over) {
  return Object.assign({ id, name, dateKey: '2026-07-29', meal: 'Lunch', grams: 100,
    kcal: 100, p: 10, c: 10, f: 2, ts: T }, over || {});
}

/* grouping */
seed([food('a', 'Tuna'), food('b', 'Pasta'), food('c', 'Tomato paste')]);
let nodes = vm.runInContext(`groupSlot(dayLogs('2026-07-29'))`, sandbox);
is('three ungrouped foods render as three rows', nodes.length, 3);
ok('each is a solo row', nodes.every(n => !!n.solo));

vm.runInContext(`stampGroup(['a','b','c'],'g1','Tuna & pasta','m1')`, sandbox);
nodes = vm.runInContext(`groupSlot(dayLogs('2026-07-29'))`, sandbox);
is('once stamped they are ONE row', nodes.length, 1);
is('the row is the meal, named', nodes[0].name, 'Tuna & pasta');
is('holding all three ingredients', nodes[0].items.length, 3);
let raw = JSON.parse(store['nut:logs']);
ok('every member carries the meal it came from', raw.every(e => e.grpOf === 'm1'));
ok('every member got a fresh ts (so the group converges on sync)', raw.every(e => e.ts > T));
ok('every member kept its ORIGINAL log time in ts0', raw.every(e => e.ts0 === T));

/* a group of one is just a food */
seed([food('a', 'Tuna', { grp: 'g1', grpName: 'Tuna & pasta' }), food('b', 'Bread')]);
nodes = vm.runInContext(`groupSlot(dayLogs('2026-07-29'))`, sandbox);
is('a group with one member left renders as a plain food, not an empty wrapper', nodes.length, 2);
ok('…and it is a solo row', !!nodes[0].solo);

/* order is preserved */
seed([food('a', 'Tuna', { grp: 'g1', grpName: 'Meal' }), food('x', 'Apple'),
      food('b', 'Pasta', { grp: 'g1', grpName: 'Meal' })]);
nodes = vm.runInContext(`groupSlot(dayLogs('2026-07-29'))`, sandbox);
is('a group takes the position of its FIRST member', nodes.length, 2);
is('…the group is first', nodes[0].name, 'Meal');
is('…the loose food keeps its place after it', nodes[1].solo.name, 'Apple');

/* two loggings of the same meal stay two meals */
seed([food('a', 'Tuna', { grp: 'g1', grpName: 'Tuna & pasta' }), food('b', 'Pasta', { grp: 'g1', grpName: 'Tuna & pasta' }),
      food('c', 'Tuna', { grp: 'g2', grpName: 'Tuna & pasta' }), food('d', 'Pasta', { grp: 'g2', grpName: 'Tuna & pasta' })]);
nodes = vm.runInContext(`groupSlot(dayLogs('2026-07-29'))`, sandbox);
is('the same meal logged twice is TWO meals, not one of six items', nodes.length, 2);

/* ── 2 · the pruneDupes trap ────────────────────────────────────── */
section('⭐ a group stamp must not feed a genuine second portion to pruneDupes');

// Two identical eggs, four hours apart. Both deliberate.
const T8 = Date.parse('2026-07-29T08:00:00Z'), T12 = Date.parse('2026-07-29T12:00:00Z');
seed([food('e1', 'Egg, whole', { ts: T8 }), food('e2', 'Egg, whole', { ts: T12 })]);
let dropped = vm.runInContext(`pruneDupes()`, sandbox);
is('four hours apart, neither is touched', dropped, 0);

// Now stamp them into one meal — both ts land on the same instant.
vm.runInContext(`stampGroup(['e1','e2'],'g9','Two eggs','m9')`, sandbox);
raw = JSON.parse(store['nut:logs']);
ok('the stamp did put both on the same ts', raw[0].ts === raw[1].ts);
dropped = vm.runInContext(`pruneDupes()`, sandbox);
is('⭐ pruneDupes still leaves BOTH alone — it reads ts0, not ts', dropped, 0);
is('…both portions survive', vm.runInContext(`getLogs().length`, sandbox), 2);

// The case pruneDupes exists for still works: a real double-tap.
seed([food('d1', 'Tuna', { ts: T12, ts0: T12 }), food('d2', 'Tuna', { ts: T12 + 2000, ts0: T12 + 2000 })]);
dropped = vm.runInContext(`pruneDupes()`, sandbox);
is('an accidental double-add two seconds apart is still pruned', dropped, 1);

// And the same trap through a move.
seed([food('m1', 'Egg, whole', { ts: T8, ts0: T8, meal: 'Dinner' }),
      food('m2', 'Egg, whole', { ts: T8 + 60, ts0: T12, meal: 'Dinner' })]);
dropped = vm.runInContext(`pruneDupes()`, sandbox);
is('a MOVE that flattened ts cannot eat a real second portion either', dropped, 0);

/* ── 3 · batch delete ───────────────────────────────────────────── */
section('removing a whole meal');
seed([food('a', 'Tuna', { grp: 'g1' }), food('b', 'Pasta', { grp: 'g1' }), food('z', 'Apple')]);
vm.runInContext(`delEntries(grpEntries('g1').map(function(e){return e.id;}))`, sandbox);
is('the meal is gone', vm.runInContext(`getLogs().length`, sandbox), 1);
is('…and the untouched food is still there', vm.runInContext(`getLogs()[0].name`, sandbox), 'Apple');
const del = JSON.parse(store['nut:deleted'] || '{}');
ok('both ids are permanently blocked, same as delEntry', !!del.a && !!del.b);
ok('the surviving food is NOT blocked', !del.z);

/* ── 4 · the suggested name ─────────────────────────────────────── */
section('the default name is the two biggest things on the plate');
const nm = (items, slot) => vm.runInContext(
  `suggestMealName(${JSON.stringify(items)}, ${JSON.stringify(slot)})`, sandbox);
is('tuna + pasta + tomato paste', nm([
  { name: 'Tuna, canned in water', kcal: 197 },
  { name: 'Pasta, dry', kcal: 297 },
  { name: 'Tomato paste', kcal: 12 }], 'Lunch'), 'Pasta & Tuna');
// Only the FIRST character is touched. Lowercasing the second name would turn
// "Toast & Coco Pops" into "Toast & coco Pops".
is('a proper noun keeps its capitals', nm([
  { name: 'Coco Pops', kcal: 200 }, { name: 'Toast', kcal: 260 }], 'Breakfast'), 'Toast & Coco Pops');
is('a lone food names itself', nm([{ name: 'Greek yogurt, 0% plain', kcal: 236 }], 'Snacks'), 'Greek yogurt');
is('an empty slot falls back to the slot name', nm([], 'Dinner'), 'Dinner set');
ok('a very long pair is trimmed to one name, never a run-on',
  nm([{ name: 'Organic free range chicken breast, cooked', kcal: 300 },
      { name: 'Sweet potato mash with olive oil', kcal: 250 }], 'Lunch').length <= 42);

/* ── 5 · every class toggled from JS exists in CSS (constraint 12) ─ */
section('constraint 12 — no class is toggled that CSS has never heard of');
['grp-hdr', 'grp-chev', 'grp-items', 'meal-make'].forEach(c => {
  ok('.' + c + ' is defined in the page stylesheet', SRC.indexOf('.' + c + '{') >= 0);
});
ok('.grp-hdr.open is styled (the chevron must actually turn)', /\.grp-hdr\.open/.test(SRC));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
