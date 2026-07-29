/* launcher.js — "All": every page, one press, from anywhere (als-v437).

   Alex's brief was navigation, with one condition attached: "be sure that if i
   dont like it u can easily revert back to how it was with no data loss or no
   problems, like nothing ever happened."

   That condition is the first section below and it is the important one. The
   launcher owns NO state: no localStorage write, no key, nothing synced,
   nothing in BUNDLES, no network call. `git revert` plus a service-worker bump
   returns the app exactly to als-v436 with nothing to migrate — because
   nothing was ever created. These assertions are what keep that true. */
'use strict';
const fs = require('fs');
const ALS = '/Users/alexstathatos/ALS DASHBOARD ALL FILES/als';
const SRC = fs.readFileSync(ALS + '/launcher.js', 'utf8');
const TOP = fs.readFileSync(ALS + '/topbar.js', 'utf8');
const SW  = fs.readFileSync(ALS + '/sw.js', 'utf8');

let pass = 0, fail = 0;
function is(name, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  console.log((ok ? '  ✓ ' : '  ✗ FAIL ') + name + (ok ? '' : `\n      got  ${JSON.stringify(got)}\n      want ${JSON.stringify(want)}`));
}
function ok(name, cond) { is(name, !!cond, true); }
function section(s) { console.log('\n' + s); }

// Strip block + line comments so prose about writes can't pass for a write.
const CODE = SRC.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

/* ── 1 · REVERTIBILITY: the launcher owns no state ──────────────── */
section('revert safety — it can never own data');
ok('no localStorage.setItem', !/setItem/.test(CODE));
ok('no localStorage.removeItem', !/removeItem/.test(CODE));
ok('no localStorage.clear', !/localStorage\s*\.\s*clear/.test(CODE));
ok('no sync engine', !/initCloudSync|ALSSync/.test(CODE));
ok('no network call at all', !/\bfetch\s*\(|XMLHttpRequest|navigator\.sendBeacon/.test(CODE));
ok('it only ever READS storage', /localStorage\.getItem/.test(CODE));
{
  const backup = fs.readFileSync(ALS + '/backup.html', 'utf8');
  ok('nothing of its own is in the vault BUNDLES', !/alx|launcher/i.test(backup.match(/BUNDLES[\s\S]{0,4000}/)?.[0] || ''));
}

/* ── 2 · every link resolves, and every live page is reachable ──── */
section('the index is complete and every link is real');
const hrefs = [...SRC.matchAll(/href: '([^']+)'/g)].map(m => m[1]);
ok('the index is not empty', hrefs.length > 20);
const missing = hrefs.filter(h => !fs.existsSync(ALS + '/' + h.split('?')[0]));
is('every href points at a file that exists', missing, []);

// Anything live in the root must be reachable from the launcher, or be one of
// the deliberate exceptions. A new page added without a launcher entry fails
// here — which is the whole point: this is the thing that stops the app
// growing pages he cannot find.
const EXEMPT = new Set([
  'index.html',       // the Home tab
  'nova-chat.html',   // the Nova tab
  'health.html', 'bills.html', 'trends.html' // retired to redirects
]);
const live = fs.readdirSync(ALS)
  .filter(f => f.endsWith('.html'))
  .filter(f => !f.startsWith('_') && !f.includes('-demo') && !f.startsWith('render-'));
const unreachable = live.filter(f => !EXEMPT.has(f) && hrefs.indexOf(f) < 0);
is('no live page is unreachable from the launcher', unreachable, []);

/* ── 3 · the pinned six never reorder ───────────────────────────── */
section('the pins are fixed, not ranked');
const pinBlock = SRC.match(/var PINS = \[[\s\S]*?\];/)[0];
is('exactly six pins', (pinBlock.match(/href:/g) || []).length, 6);
ok('pins are declared literally, never sorted', !/PINS[\s\S]{0,400}\.sort\(/.test(SRC));
ok('nothing in the file sorts by usage or frequency', !/\.sort\s*\(/.test(CODE));
['nutrition.html', 'gym.html', 'weight.html', 'sleep.html', 'po-water.html', 'supps.html']
  .forEach(h => ok('pinned: ' + h, pinBlock.indexOf(h) > -1));

/* ── 4 · the <dialog> traps this project has already paid for ───── */
section('dialog contract (constraint 4 + the als-v431 bug)');
ok('display is scoped to [open]', /dialog\.alx\[open\]\s*\{[^}]*display:\s*flex/.test(SRC));
ok('and closed is explicitly display:none', /dialog\.alx:not\(\[open\]\)\s*\{\s*display:\s*none/.test(SRC));
ok('there is no unscoped `dialog.alx{...display:` rule',
  !/dialog\.alx\s*\{[^}]*display\s*:/.test(SRC));
ok('it opens with showModal(), so it lives in the top layer', /showModal\(\)/.test(SRC));

/* ── 5 · the iOS Safari flex collapse (constraint 13) ───────────── */
section('the scroll pane cannot collapse to zero height on iOS');
const bodyRule = SRC.match(/\.alx-body\s*\{[^}]*\}/)[0];
ok('flex is 1 1 auto, never the bare `flex: 1`', /flex:\s*1 1 auto/.test(bodyRule));
ok('and it carries its own min-height', /min-height:\s*0/.test(bodyRule));
ok('the sheet bounds it with a max-height', /\.alx-sheet\s*\{[^}]*max-height/.test(SRC));

/* ── 6 · every class toggled from JS exists in CSS (constraint 12) ─ */
section('no class is toggled that CSS never defines');
['alx-fab', 'alx-sheet', 'alx-body', 'alx-pins', 'alx-pin', 'alx-g', 'alx-gh',
 'alx-rows', 'alx-r', 'alx-none', 'alx-search', 'alx-x', 'alx-grab',
 'alx-a-coral', 'alx-a-emerald', 'alx-a-violet', 'alx-a-amber', 'here']
  .forEach(c => ok('.' + c + ' is defined', new RegExp('\\.' + c + '[\\s,{:.]').test(SRC)));

/* ── 7 · nothing renderable is left as raw non-ASCII ────────────── */
section('encoding — Greek page names cannot mojibake');
{
  // A headless render decoded "Search your pages…" as "pagesâ€¦" when the host
  // document declared no charset. Escapes remove the class of bug entirely,
  // which matters most for Αρχαία / Ιστορία / Η Χρονιά.
  const rendered = [...SRC.matchAll(/name: '([^']*)'/g)].map(m => m[1])
    .concat([...SRC.matchAll(/placeholder="([^"]*)"/g)].map(m => m[1]));
  const raw = rendered.filter(s => /[^\x00-\x7F]/.test(s));
  is('no raw non-ASCII in any rendered string', raw, []);
  ok('the Greek names are present as escapes', /\\u0391\\u03c1\\u03c7/.test(SRC));
}

/* ── 8 · the shell wiring ───────────────────────────────────────── */
section('topbar.js wiring');
ok('the All button is in the bar', /data-page="all"/.test(TOP));
ok('it is a <button>, so the link interceptor cannot navigate on it',
  /<button[^>]*data-page="all"/.test(TOP));
{
  const reset = TOP.match(/button\.bottombar-tab\s*\{[^}]*\}/)[0];
  ok('button.bottombar-tab is reset to match its <a> siblings', /appearance:\s*none/.test(reset));
  // `font: inherit` in this rule outranks .bottombar-tab and silently drops
  // the label out of the mono stack the other four tabs use.
  ok('the reset sets NO font property, or "ALL" leaves the mono stack',
    !/\bfont(-family|-size|-weight)?\s*:/.test(reset));
}
ok('the Body tab is gone', !/class="bottombar-tab" data-page="body"/.test(TOP));
{
  const bar = TOP.match(/const bottombarHtml = `[\s\S]*?`;/)[0];
  const order = [...bar.matchAll(/data-page="(\w+)"/g)].map(m => m[1]);
  is('five slots, All in the centre', order, ['home', 'mind', 'all', 'money', 'nova']);
}
ok('gym.html gets a floating button instead (it has no bar of its own)',
  /isGymPage\(\)/.test(TOP) && /alx-fab/.test(TOP));
ok('launcher.js is lazy-loaded, not hard-required', /s\.src = 'launcher\.js'/.test(TOP));
ok('a tap before the script lands still opens it', /loadLauncher\(true\)/.test(TOP));
ok('launcher.js is precached by the service worker', /'launcher\.js'/.test(SW));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
