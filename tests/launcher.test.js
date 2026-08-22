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
  'health.html', 'bills.html', 'trends.html', // retired to redirects
  // study.html is NOT exempt: it is a redirect stub, but it is also the app's
  // only door to the Notion «Η ΧΡΟΝΙΑ», so it carries a real launcher entry.
]);
const live = fs.readdirSync(ALS)
  .filter(f => f.endsWith('.html'))
  .filter(f => !f.startsWith('_') && !f.includes('-demo') && !f.startsWith('render-'));

// ⭐ als-v502: ΚΑΙ ΜΙΑ ΣΕΛΙΔΑ ΠΟΥ ΤΗΝ ΑΝΟΙΓΕΙ ΑΛΛΗ ΣΕΛΙΔΑ ΕΙΝΑΙ ΠΡΟΣΒΑΣΙΜΗ.
// Ο σκοπός του ελέγχου είναι «καμία σελίδα που δεν μπορεί να βρει» — και ένα
// ΠΑΚΕΤΟ ΜΕΛΕΤΗΣ το βρίσκει από τον γονιό του, όχι από το launcher. Ως τώρα ο
// έλεγχος ήταν ΚΟΚΚΙΝΟΣ από την als-v460 (arxaia-sokratis / arxaia-platon):
// ένας μόνιμα κόκκινος φρουρός δεν φυλάει τίποτα, τον μαθαίνεις να τον
// αγνοείς. ⚠️ Η προσβασιμότητα ΑΠΟΔΕΙΚΝΥΕΤΑΙ (υπάρχει href σε ζωντανή
// σελίδα), δεν ΔΗΛΩΝΕΤΑΙ σε λίστα — μια λίστα θα έμενε αληθινή και αφού
// σβηνόταν ο σύνδεσμος.
const linkedFrom = new Set();
live.forEach(f => {
  const src = fs.readFileSync(ALS + '/' + f, 'utf8');
  [...src.matchAll(/href="([^"?#]+\.html)"/g)].forEach(m => {
    if (m[1] !== f) linkedFrom.add(m[1]);
  });
});
const unreachable = live.filter(f =>
  !EXEMPT.has(f) && hrefs.indexOf(f) < 0 && !linkedFrom.has(f));
is('no live page is unreachable from the launcher', unreachable, []);

// …και ό,τι γλιτώνει έτσι πρέπει να έχει ΟΝΤΩΣ γονιό, ονομαστικά.
const CHILDREN = {
  'arxaia-sokratis.html': 'arxaia.html', 'arxaia-platon.html': 'arxaia.html',
  'latinika-eisagogi.html': 'latinika.html',
  'latinika-lectio16.html': 'latinika.html', 'latinika-lectio17.html': 'latinika.html'
};
Object.keys(CHILDREN).forEach(kid => {
  if (!fs.existsSync(ALS + '/' + kid)) return;
  const parent = fs.readFileSync(ALS + '/' + CHILDREN[kid], 'utf8');
  ok(kid + ' opens from ' + CHILDREN[kid], parent.indexOf('href="' + kid + '"') > 0);
});

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
['alx-sheet', 'alx-body', 'alx-pins', 'alx-pin', 'alx-g', 'alx-gh',
 'alx-rows', 'alx-r', 'alx-none', 'alx-search', 'alx-x', 'alx-grab',
 'alx-a-coral', 'alx-a-emerald', 'alx-a-violet', 'alx-a-amber', 'here']
  .forEach(c => ok('.' + c + ' is defined', new RegExp('\\.' + c + '[\\s,{:.]').test(SRC)));
// .alx-fab is the exception: topbar.js creates that element, so topbar.js owns
// its CSS. It must NOT also be styled here — launcher.js arrives on a separate
// deferred fetch, and the only navigation control in the app cannot wait on it.
ok('.alx-fab is styled by topbar.js, which creates it', /\.alx-fab\s*\{/.test(TOP));
ok('and launcher.js does not style it a second time', !/\.alx-fab\s*[\{,:]/.test(SRC));

/* ── 7 · nothing renderable is left as raw non-ASCII ────────────── */
section('encoding — Greek page names cannot mojibake');
{
  // A headless render decoded "Search your pages…" as "pagesâ€¦" when the host
  // document declared no charset. Escapes remove the class of bug entirely,
  // which matters most for Λατινικά / Τονισμός / Ιστορία / Η Χρονιά.
  const rendered = [...SRC.matchAll(/name: '([^']*)'/g)].map(m => m[1])
    .concat([...SRC.matchAll(/placeholder="([^"]*)"/g)].map(m => m[1]));
  const raw = rendered.filter(s => /[^\x00-\x7F]/.test(s));
  is('no raw non-ASCII in any rendered string', raw, []);
  /* ⚠️ Counted, never pinned to one WORD. This assertion used to match Αρχαία's
     own escapes and failed the moment that page was retired (als-v453) — which
     is the wrong signal entirely, because the rule it guards was never broken.
     It exists so the check above cannot pass vacuously by every Greek name
     being deleted, so a COUNT is what it should have been asking for. */
  const escaped = rendered.filter(s => /\\u03[0-9a-f]{2}/i.test(s));
  ok('the Greek names are still present, as escapes', escaped.length >= 4);
}

/* ── 8 · the shell wiring: ONE control, one code path (als-v438) ─── */
section('topbar.js wiring — the bar is gone, the All button is not');
const TOPCODE = TOP.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
ok('the five-tab .bottombar is gone from the markup',
  !/bottombarHtml/.test(TOPCODE) && !/class="bottombar-tab"/.test(TOPCODE));
ok('and its CSS went with it', !/\.bottombar[\s,{:.-]/.test(TOPCODE));
ok('nothing still adds body.has-bottombar', !/has-bottombar/.test(TOPCODE));
ok('the All button is built as an element, not an HTML string',
  /createElement\('button'\)/.test(TOPCODE) && /className = 'alx-fab'/.test(TOPCODE));
ok('it is a <button>, so the shell link interceptor cannot navigate on it',
  /\bb\.type = 'button'/.test(TOPCODE));
ok('it keeps the id the launcher wiring already used', /b\.id = 'tbAll'/.test(TOPCODE));
ok('it is labelled for screen readers', /aria-label', 'All pages'/.test(TOPCODE));
ok('it carries a visible ALL label, not the icon alone', /<span>All<\/span>/.test(TOPCODE));
{
  // A <button> does not inherit the document font. Unlike the bar's tab (where
  // setting font-family DROPPED "ALL" out of its siblings' mono stack), this
  // one has no siblings left to match, so it must state its own typography.
  const fab = TOP.match(/\.alx-fab\s*\{[^}]*\}/)[0];
  ok('the FAB names its own font-family', /font-family:/.test(fab));
  ok('it is pinned to the viewport, so scroll cannot move it',
    /position:\s*fixed/.test(fab) && /bottom:/.test(fab));
  ok('z-index 39 keeps it under gym sheets (61) and modals (71)',
    /z-index:\s*39/.test(fab));
  ok('it clears the iOS home indicator', /env\(safe-area-inset-bottom\)/.test(fab));
}
{
  // The one remaining branch. Everything that is not run.html gets the button;
  // everything that is not run.html or gym.html also gets the bottom padding.
  const inj = TOPCODE.match(/if \(!isRunSolo\(\)\) \{[\s\S]*?\n    \}/)[0];
  ok('every page but run.html gets the button', /appendChild\(makeAllButton\(\)\)/.test(inj));
  ok('and every page but gym gets the padding', /!isGymPage\(\)\) document\.body\.classList\.add\('has-alxfab'\)/.test(inj));
}
ok('run.html is left alone — it is Chrissie\'s app', /isRunSolo\(\)/.test(TOPCODE));
ok('the dead five-space page map is gone with the tabs it lit',
  !/currentPageKey/.test(TOPCODE) && /isHubPage/.test(TOPCODE));
{
  // Home used to hide the shared bar and draw a private one of its own. Two
  // bottom navs on one page, the visible one a stale copy pointing Mind at a
  // different destination. This is the assertion that stops it coming back.
  const HOME = fs.readFileSync(ALS + '/index.html', 'utf8');
  const HCODE = HOME.replace(/<!--[\s\S]*?-->/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
  ok('Home has no private bottom nav', !/<nav class="nav">/.test(HCODE));
  ok('Home no longer hides the shared control', !/#bottombar/.test(HCODE));
  ok('Home reserves room for the button like every other page',
    /body\.has-alxfab\s*\{/.test(HCODE));
}
/* ── 9 · the reason nothing pinned to the bottom ever stayed there ─
   Constraint 4 with the ancestor being <body> itself. The page-entrance
   animation on body animates `transform`; `animation-fill-mode: both` keeps
   that transform APPLIED after it ends, even though it settles on `none`, and
   a filled transform animation still makes the element a containing block for
   fixed descendants. So `position: fixed; bottom: 16px` resolved against a
   ~5,000px body box instead of the viewport, and the control sat at the foot
   of the DOCUMENT. Measured: top 1301 in an 820px viewport before, 762 after.
   This is the assertion that stops `both` coming back. */
section('body must not become a containing block for the fixed control');
{
  const rule = TOP.match(/\nbody \{ animation: _tbIn[^}]*\}/)[0];
  ok('the body entrance animation carries no fill mode',
    !/\b(both|forwards)\b/.test(rule));
  ok('and it is still the same entrance, not deleted', /_tbIn 0\.38s/.test(rule));
  // The exit fade is the deliberate exception: it must persist through the
  // navigation that removes it.
  ok('body.tb-out keeps its forwards fill on purpose',
    /body\.tb-out \{ animation: _tbOut[^}]*forwards/.test(TOP));
}
ok('launcher.js is lazy-loaded, not hard-required', /s\.src = 'launcher\.js'/.test(TOP));
ok('a tap before the script lands still opens it', /loadLauncher\(true\)/.test(TOP));
ok('launcher.js is precached by the service worker', /'launcher\.js'/.test(SW));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
