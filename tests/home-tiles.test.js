/* Regression test for the 28/07/26 fix (als-v433): EVERY tile on the home page
   showed its built-in demo number instead of his real data. Home said 78.4 kg
   while po_coach_weights said 70.4; it said 1,840 kcal, 142 kg on the PR board,
   6/8 supplements, 12-day streak — none of it his.

   Root cause, shipped in als-v426 (the Library commit): the new
   `case 'improve.html'` declared `var tk = ls('improve:tiktoks', [])`. `var`
   hoists to the whole FUNCTION, not the case block, so that one name shadowed
   the tk() date helper across ALL of metric() — and `var t = tk()` on metric's
   first line threw TypeError on every single call, for every tile. metric()
   catches its own errors and returns null; paintTile() returns early on null
   and leaves the markup alone. So the failure was completely silent and the
   demo values sat there looking plausible for two weeks.

   Two guards below, because the second is the one that generalises:
     1 · metric() returns real data for every tile destination.
     2 · metric() declares no local that shadows an outer helper — the actual
         bug class. Re-introducing `var tk` (or `var ls`, `var dawn`, …) fails
         this even if the seeded data happens to dodge guard 1.

   Reverting either fix must make this fail. */
'use strict';
const fs = require('fs');
const path = require('path');
const ALS = path.join(__dirname, '..');

let pass = 0, fail = 0;
function is(name, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  console.log((ok ? '  ✓ ' : '  ✗ FAIL ') + name + (ok ? '' : `\n      got  ${JSON.stringify(got)}\n      want ${JSON.stringify(want)}`));
}
function ok(name, cond) { is(name, !!cond, true); }
function section(s) { console.log('\n' + s); }

const src = fs.readFileSync(path.join(ALS, 'home-live.js'), 'utf8');

/* ── load the REAL metric() out of home-live.js ──────────────────
   Sliced rather than imported because home-live.js is a DOM-bound IIFE that
   exports nothing. The markers are asserted so a refactor fails loudly here
   instead of silently testing nothing. */
const START = 'function ls(k, d)';
const END = '/* ── paint one tile';
section('harness');
ok('home-live.js still has the helper block we slice from', src.indexOf(START) > -1);
ok('home-live.js still has the paint marker we slice to', src.indexOf(END) > src.indexOf(START));

const TODAY = '2026-07-14';
const DATA = {
  'po_workouts': JSON.stringify([
    { date: '2026-07-13', entries: [{ name: 'Bench Press', sets: [{ kg: 80, reps: 5, done: true }] }] }
  ]),
  'po_coach_weights': JSON.stringify([
    { ts: 1, weight: 70.6, dateKey: '2026-07-12' },
    { ts: 2, weight: 70.4, dateKey: '2026-07-13' }
  ]),
  'sleep:logs': JSON.stringify([{ id: 's1', dateKey: '2026-07-13', hours: 9.2, recovery: 87 }]),
  'nut:logs': JSON.stringify([{ id: 'n1', dateKey: TODAY, kcal: 651, p: 35 }]),
  'stack:items': JSON.stringify([{ id: 'i1', name: 'D3' }, { id: 'i2', name: 'Mg' }]),
  'bm:logs': JSON.stringify([{ dateKey: '2026-07-10', waist: 79 }]),
  'money:accounts': JSON.stringify([{ amount: 1000 }]),
  'ideas:items': JSON.stringify([{ id: 'x', done: false }, { id: 'y', done: true }]),
  'improve:videos': JSON.stringify([{ id: 'v1', watched: false }]),
  'improve:tiktoks': JSON.stringify([{ id: 't1' }, { id: 't2' }]),
  'movies:seen': JSON.stringify([{ id: 'm1' }, { id: 'm2' }]),
  'movies:watch': JSON.stringify([{ id: 'm3' }]),
  'run:logs': JSON.stringify([{ id: 'r1', date: '2026-07-13', distanceKm: 7.2 }]),
  'caf:logs': JSON.stringify([{ ts: new Date(TODAY + 'T08:00:00').getTime(), mg: 150 }]),
  'goal_streak_v1': JSON.stringify({ count: 12 }),
  'arxaia:v1': JSON.stringify({ days: { 1: { done: true } } }),
  'istoria:v1': JSON.stringify({ seen: { t1: { c: 2 } }, miss: {} }),
  ['goals:' + TODAY]: JSON.stringify([{ done: true }, { done: false }])
};

function loadMetric() {
  const RealDate = Date;
  const PIN = new RealDate(TODAY + 'T09:00:00');
  class PinnedDate extends RealDate {
    constructor(...a) { if (a.length === 0) super(PIN.getTime()); else super(...a); }
    static now() { return PIN.getTime(); }
  }
  /* metric() swallows its own errors — that opacity is exactly what hid the
     bug — so rethrow inside the harness to see the real failure. */
  const body = src.slice(src.indexOf(START), src.indexOf(END))
    .replace('    } catch (e) { }\n    return null;', '    } catch (e) { throw e; }\n    return null;');
  const make = new Function('window', 'localStorage', 'Date', body + '\nreturn { metric: metric };');
  return make({}, { getItem: k => (k in DATA ? DATA[k] : null) }, PinnedDate);
}

/* ── 1 · every tile resolves to real data ────────────────────────── */
section('metric() returns real data for every home tile');

const api = loadMetric();
/* Every href the home tiles point at that metric() claims to handle. */
const DESTS = ['gym.html', 'pr.html', 'sleep.html', 'nutrition.html', 'supps.html',
  'measure.html', 'weight.html', 'caffeine.html', 'main.html', 'identity.html',
  'ideas.html', 'improve.html', 'finance.html', 'movies.html', 'run.html',
  'arc.html', 'insights.html', 'arxaia.html'];

DESTS.forEach(h => {
  let m, err = null;
  try { m = api.metric(h); } catch (e) { err = e.message; }
  ok(h + ' does not throw', err === null);
  ok(h + ' returns a metric (not the demo fallback)', !err && m != null);
});

/* The exact numbers that were wrong on his screen. */
section('the values home was getting wrong');
const w = api.metric('weight.html');
is('weight reads po_coach_weights, not the 78.4 demo', w && w.hero, 70.4);
const n = api.metric('nutrition.html');
is('nutrition reads nut:logs, not the 1840 demo', n && n.hero, 651);
const s = api.metric('supps.html');
is('supplements counts stack:items, not the 6/8 demo', s && s.unit, '/ 2');
const im = api.metric('improve.html');
is('the Library case that caused it still works', im && im.hero, 3);

/* ── 2 · the bug CLASS: no local may shadow an outer helper ──────── */
section('metric() declares no local that shadows an outer helper');

/* helpers defined in the home-live.js IIFE and called from inside metric() */
const HELPERS = ['ls', 'tk', 'activeDate', 'dawn', 'relDay', 'fmtN', 'href', 'cap',
  'render', 'workoutsThisWeek', 'metric', 'wSpark', 'recSpark', 'sparkPts', 'esc'];

const mStart = src.indexOf('function metric(h)');
ok('metric() found in source', mStart > -1);
/* metric() ends where the next sibling helper begins */
const mEnd = src.indexOf('function wSpark(', mStart);
const metricSrc = src.slice(mStart, mEnd);

HELPERS.forEach(name => {
  /* `var NAME =` or `var NAME,` or `var NAME;` anywhere inside metric() */
  const re = new RegExp('\\bvar\\s+' + name + '\\b\\s*[=,;]');
  const hit = re.test(metricSrc);
  ok('no `var ' + name + '` inside metric() (would shadow the ' + name + '() helper)', !hit);
});

/* ── 3 · the home markup ships no invented numbers ───────────────── */
section('index.html carries no fabricated values');

const html = fs.readFileSync(path.join(ALS, 'index.html'), 'utf8');
/* A .cnt with a data-to in the static markup is a number nobody measured: it
   animates to that value before (or instead of) any real paint. Real values are
   injected by paintTile()/paintReadiness() at runtime, never authored here. */
const authored = html.match(/<span class="cnt"[^>]*data-to="[^"]*"/g) || [];
is('no authored data-to values in the tile markup', authored, []);

const FICTIONS = ['78.4', '1840', 'protein 148g', '7h 41m · rested', 'deadlift · new best',
  'stack · 2 left today', '86% conf', '76.5 kg', 'last backup · 2 days ago'];
FICTIONS.forEach(f => ok('index.html no longer claims "' + f + '"', html.indexOf(f) === -1));

/* ── The game layer is gone, all of it (als-v435 → als-v438) ──────────
   The LVL pill, the XP bar, the Recruit-to-Legend ladder, the 20 milestone
   badges, the streak chip that read a store fixed at 0, and finally "This week
   vs last" — whose headline was 45% weighted on `goals:` to-do completion, a
   store he has never used, so the score could never pass 55. Deleting that
   panel retired xp.js: ALS.XP had no other caller anywhere in the app.
   These assertions fail if any of it comes back by accident. */
section('the game layer stays deleted');
ok('xp.js no longer exists', !fs.existsSync(path.join(ALS, 'xp.js')));
{
  // Comments stripped first: the files that used to call it now explain why
  // they don't, and an epitaph must not read as a caller.
  const strip = (s) => s
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
  const live = fs.readdirSync(ALS)
    .filter(f => (f.endsWith('.js') || f.endsWith('.html')) && !f.startsWith('_'));
  const callers = live.filter(f => /\bALS\.XP\b|["']xp\.js/.test(strip(fs.readFileSync(path.join(ALS, f), 'utf8'))));
  is('nothing in the app still references ALS.XP or xp.js', callers, []);
}
ok('the "This week vs last" markup is gone from Home', !/class="agent"/.test(html));
ok('and its CSS went with it', !/^\.agent\{/m.test(html) && !/^\.wrow\{/m.test(html));
ok('paintAgent() has no orphaned call site', !/paintAgent\(\)\s*;/.test(src));

/* countUp must not turn an unpainted placeholder into "0" — that is the same
   lie in a smaller font. */
section('home-motion.js leaves unpainted placeholders alone');
const motion = fs.readFileSync(path.join(ALS, 'home-motion.js'), 'utf8');
ok('countUp returns early when data-to is absent', /if \(isNaN\(to\)\) return;/.test(motion));
ok('countUp no longer writes fmt(0) for a missing data-to', motion.indexOf('isNaN(to) ? 0 : to') === -1);

console.log('\n' + (fail ? `✗ ${fail} failed, ${pass} passed` : `✓ all ${pass} passed`));
process.exit(fail ? 1 : 0);
