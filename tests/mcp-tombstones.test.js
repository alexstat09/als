// api/mcp.js must HONOUR deletion tombstones on every read.
//
// The bug this pins: the file wrote tombstones (`tombstone()`) but never read
// one, so get_* summed rows Alex had already deleted. He mis-logged 2,245 g of
// tuna, corrected it to 225 g, and the MCP still reported 29 Jul as 4,671 kcal
// / 742 g protein while nutrition.html correctly showed 1,461 / 117.
//
// Nothing was ever corrupted — the deleted row legitimately stays in the stored
// array with a tombstone beside it, exactly as sync.js expects. The read was
// the only thing wrong.
'use strict';
var fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');

var SRC = fs.readFileSync(path.join(__dirname, '..', 'api', 'mcp.js'), 'utf8');
var n = 0, fails = 0;
function ok(what, cond) { n++; if (cond) return; fails++; console.error('  ✗ ' + what); }

/* ---- pull the pure helpers out and run them in isolation ---- */
function grab(name) {
  var m = SRC.match(new RegExp('\\nfunction ' + name + '\\b[\\s\\S]*?\\n}', ''))
       || SRC.match(new RegExp('\\nfunction ' + name + '\\b.*', ''));
  assert(m, 'could not extract ' + name + ' from api/mcp.js');
  return m[0];
}
var ctx = { module: {}, console: console };
vm.createContext(ctx);
vm.runInContext([grab('idKeyOf'), grab('addedAt'), grab('tombed'), grab('liveOnly')].join('\n'), ctx);
var liveOnly = ctx.liveOnly, tombed = ctx.tombed, addedAt = ctx.addedAt;

/* ---- 1. the real incident ---- */
var TUNA_BAD = { id: 'nf-bad', ts: 1000, dateKey: '2026-07-29', name: 'Tuna, canned in water', grams: 2245, kcal: 2604, p: 584 };
var TUNA_OK  = { id: 'nf-ok',  ts: 3000, dateKey: '2026-07-29', name: 'Tuna, canned in water', grams: 225,  kcal: 261,  p: 58 };
var EGGS     = { id: 'nf-egg', ts: 2000, dateKey: '2026-07-29', name: 'Egg, whole', grams: 200, kcal: 286, p: 25 };

var bundle = { 'nut:logs': [TUNA_BAD, EGGS, TUNA_OK], _deletes: { 'nut:logs': { 'id:nf-bad': 2500 } } };
var live = liveOnly(bundle, 'nut:logs', bundle['nut:logs']);
ok('the deleted 2,245 g tuna is excluded', live.length === 2 && !live.some(function (e) { return e.id === 'nf-bad'; }));
ok('the corrected 225 g tuna survives', live.some(function (e) { return e.id === 'nf-ok'; }));
ok('unrelated food is untouched', live.some(function (e) { return e.id === 'nf-egg'; }));
ok('kcal now match the app, not the raw array',
   live.reduce(function (s, e) { return s + e.kcal; }, 0) === 547);
ok('protein now matches the app', live.reduce(function (s, e) { return s + e.p; }, 0) === 83);
ok('the stored array is NOT mutated — the filter is a copy', bundle['nut:logs'].length === 3);

/* ---- 2. a RE-ADD beats its own tombstone (sync.js semantics) ---- */
var readd = { id: 'nf-bad', ts: 9999, kcal: 100, p: 5 };
ok('an item re-added AFTER the tombstone is kept',
   liveOnly({ _deletes: { k: { 'id:nf-bad': 2500 } } }, 'k', [readd]).length === 1);
ok('an item added at exactly the tombstone instant is suppressed',
   liveOnly({ _deletes: { k: { 'id:x': 500 } } }, 'k', [{ id: 'x', ts: 500 }]).length === 0);

/* ---- 3. it must never over-filter ---- */
ok('no _deletes at all → array returned unchanged',
   liveOnly({}, 'nut:logs', [TUNA_BAD, EGGS]).length === 2);
ok('a tombstone for a DIFFERENT key does not apply',
   liveOnly({ _deletes: { 'sleep:logs': { 'id:nf-bad': 9e9 } } }, 'nut:logs', [TUNA_BAD]).length === 1);
ok('an item with no id/dateKey/date is always kept',
   liveOnly({ _deletes: { k: { 'id:nf-bad': 9e9 } } }, 'k', [{ kcal: 10 }]).length === 1);
ok('a non-array value passes straight through (nut:profile)',
   liveOnly({ _deletes: { 'nut:profile': {} } }, 'nut:profile', { calTarget: 1800 }).calTarget === 1800);
ok('a non-numeric tombstone is ignored, not treated as deleted',
   liveOnly({ _deletes: { k: { 'id:x': 'yes' } } }, 'k', [{ id: 'x' }]).length === 1);
ok('dateKey-keyed items tombstone correctly',
   liveOnly({ _deletes: { k: { 'dk:2026-07-29': 9e9 } } }, 'k', [{ dateKey: '2026-07-29' }]).length === 0);

/* ---- 4. addedAt / tombed mirror sync.js exactly ---- */
ok('addedAt reads a bare number leaf', addedAt(1234) === 1234);
ok('addedAt prefers ts then _ts', addedAt({ ts: 7 }) === 7 && addedAt({ _ts: 9 }) === 9);
ok('addedAt of an untimed object is 0', addedAt({ id: 'a' }) === 0);
ok('tombed is false when there is no node', tombed(null, 'k', {}) === false);

/* ---- 5. GUARDS — the filter must stay on reads and off writes ---- */
var readKeyLine = (SRC.match(/async function readKey\(lsKey\)[^\n]*/) || [''])[0];
ok('readKey applies liveOnly', /liveOnly\(/.test(readKeyLine));
ok('readKey no longer returns b[lsKey] raw', !/return b\[lsKey\];/.test(readKeyLine));

var mutate = (SRC.match(/async function mutateBundle\([\s\S]*?\n}/) || [''])[0];
ok('mutateBundle still reads the RAW row', /supa\.readRow\(/.test(mutate));
ok('mutateBundle never uses the filtered read', !/liveOnly\(|readArr\(|readKey\(/.test(mutate));

/* ---- 6. the write path still STAMPS tombstones (unchanged behaviour) ---- */
ok('tombstone() still exists and writes _deletes', /function tombstone\(b, lsKey, item\)[\s\S]*?_deletes/.test(SRC));

console.log((fails ? '✗' : '✓') + ' mcp-tombstones: ' + (n - fails) + '/' + n + ' assertions');
process.exit(fails ? 1 : 0);
