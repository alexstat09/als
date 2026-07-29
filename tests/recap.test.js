// THE RECAP — improve.html + api/_youtube.js + api/_model.js
//
// The Library's YouTube half has never seen a video. Its key points are
// written from the creator's description, because YouTube's caption endpoint
// is locked, and Alex's verdict was exactly right: "too vague, not that much
// good tbh." recap() fixes the CAUSE — Gemini watches the actual video — and
// this suite exists to hold the honesty properties that come with that:
//
//   · a video that was WATCHED must say so, and must never borrow the wording
//     of the paths that only read a description
//   · a video watched and found to contain nothing being said is a real
//     answer, and must not render the same as "we have not looked yet"
//   · a reply that did not parse is a FAILURE to read, never an empty recap
//   · the recap must be searchable — it is the best text on the page
//
// Every one of those is a silent-failure shape this project has already been
// bitten by at least once (hard constraints 10, 15, 16, 17).
const fs = require('fs');
const path = require('path');
const vm = require('vm');

let pass = 0, fail = 0;
function ok(cond, msg){ if(cond){ pass++; } else { fail++; console.error('  ✗ ' + msg); } }
function eq(a, b, msg){ ok(a === b, msg + '  (got ' + JSON.stringify(a) + ', want ' + JSON.stringify(b) + ')'); }

const ROOT = path.join(__dirname, '..');

/* ════════════════════════════════════════════════════════════
   1 · api/_model.js — the one role that is not Groq
   ════════════════════════════════════════════════════════════ */
console.log('\n── api/_model.js — the video role ──');
const model = require(path.join(ROOT, 'api', '_model.js'));

ok(Array.isArray(model.CHAINS.video) && model.CHAINS.video.length >= 2,
  'video: has a real chain, not a single hardcoded model');
ok(model.CHAINS.video.every(m => /^gemini-/.test(m)),
  'video: every model in the chain is a Gemini model');
ok(!model.CHAINS.video.some(m => /gemini-2\.0/.test(m)),
  'video: nothing from the 2.0 family — it was shut down 01/06/26');
ok(typeof model.watch === 'function', 'video: watch() is exported');
ok(/generativelanguage\.googleapis\.com/.test(model.GEMINI_URL), 'video: points at the Gemini endpoint');

// An env override PREPENDS rather than replaces, exactly like every other
// role — a typo must degrade to the next model, never brick the endpoint.
process.env.GEMINI_VIDEO_MODEL = 'gemini-experimental-xyz';
const chain = model.chainFor('video');
eq(chain[0], 'gemini-experimental-xyz', 'video: an env override goes first');
ok(chain.length > 1, 'video: an override still leaves the rest of the chain behind it');
delete process.env.GEMINI_VIDEO_MODEL;

/* The request body. The YouTube URL must ride as a file part — that is the
   whole mechanism; a URL pasted into the prompt text is just a string and the
   model would answer from the title alone, which is the bug we are fixing. */
console.log('   the request body carries the video, not a link to it');
const body = model._gemBody({
  url: 'https://www.youtube.com/watch?v=EHLI2WZUtXs',
  system: 'SYS', prompt: 'P', maxTokens: 4096, temperature: 0.35
}, true);
const parts = body.contents[0].parts;
ok(parts.some(p => p.file_data && /EHLI2WZUtXs/.test(p.file_data.file_uri)),
  'body: the video rides as a file_data part');
ok(parts.some(p => p.text === 'P'), 'body: the prompt is a text part');
eq(body.systemInstruction.parts[0].text, 'SYS', 'body: the system prompt is a systemInstruction');
eq(body.generationConfig.maxOutputTokens, 4096, 'body: honours maxTokens');
eq(body.generationConfig.mediaResolution, 'MEDIA_RESOLUTION_LOW',
  'body: low media resolution — ~100 tokens/sec instead of ~300');

// ⚠️ The retry path. mediaResolution is a newer field; if a model rejects it
// that is a 400, and falling through the chain would burn every model for a
// field none of them take. Pass 2 drops it and keeps everything else.
const trimmed = model._gemBody({ url: 'https://x/y', prompt: 'P' }, false);
eq(trimmed.generationConfig.mediaResolution, undefined,
  'body: the retry pass drops mediaResolution');
ok(trimmed.contents[0].parts.some(p => p.file_data),
  'body: the retry pass still carries the video');

/* Reading the reply. A 200 with no text is NOT an empty answer — it is nearly
   always a thinking model that spent its whole budget thinking, the gpt-oss
   trap wearing another provider's clothes. */
console.log('   a 200 with no text is a failure, not an empty recap');
eq(model._gemText({ candidates:[{ content:{ parts:[{ text:'a ' },{ text:'b' }] } }] }).text, 'a b',
  'gemText: joins multiple text parts');
eq(model._gemText({ candidates:[{ finishReason:'MAX_TOKENS', content:{ parts:[] } }] }).text, '',
  'gemText: no parts is empty text');
eq(model._gemText({ candidates:[{ finishReason:'MAX_TOKENS', content:{ parts:[] } }] }).finish, 'MAX_TOKENS',
  'gemText: carries the finish reason so the caller can name the failure');
eq(model._gemText({}).text, '', 'gemText: a reply with no candidates is not a crash');

// Those two must map onto DIFFERENT messages — they need different fixes.
const t = model.fail({ kind:'truncated' }), e = model.fail({ kind:'empty' });
eq(t.error, 'truncated', 'fail: truncated has its own code');
eq(e.error, 'empty', 'fail: empty has its own code');
ok(t.message !== e.message, 'fail: truncated and empty do not say the same thing');

/* ════════════════════════════════════════════════════════════
   2 · api/_youtube.js — parsing what came back
   ════════════════════════════════════════════════════════════ */
console.log('\n── api/_youtube.js — the recap ──');
const yt = require(path.join(ROOT, 'api', '_youtube.js'));

ok(typeof yt.recap === 'function', 'recap() is exported');
eq(yt._watchUrl('EHLI2WZUtXs'), 'https://www.youtube.com/watch?v=EHLI2WZUtXs',
  'watchUrl: rebuilt from the id, never trusted from the client');

// The id is scrubbed before it reaches a URL — this helper is reachable from
// the browser and must never become a way to point Gemini somewhere else.
(async function(){
  const bad = await yt.recap('', 'x', '');
  eq(bad.ok, false, 'recap: an empty id is refused before any call');
})();

const GOOD = [
  'SHELF: World',
  'CORE: Rome did not fall in 476; the eastern half kept going for another thousand years.',
  'OPEN:',
  'The story starts with a city on seven hills and ends with cannon fire at Constantinople.',
  'What holds it together is a single institution that outlived every emperor in it.',
  'SECTION: The republic breaks',
  'The senate stopped being able to say no. Caesar crossed the Rubicon in 49 BC with one legion,',
  'and the machinery that had governed for four centuries never recovered.',
  '',
  'Augustus kept every republican title and took all of the power behind them.',
  'SECTION: The long east',
  'Constantine moved the capital in 330. The western provinces went in the fifth century;',
  'the eastern half simply carried on calling itself Roman until 1453.',
  'FACTS:',
  '- Caesar crossed the Rubicon in 49 BC',
  '- Constantine founded Constantinople in 330 AD',
  '- The last western emperor was deposed in 476',
  '- Constantinople fell to Mehmed II in 1453'
].join('\n');

const p = yt._parseRecap(GOOD);
eq(p.shelf, 'World', 'parse: reads the shelf');
ok(/another thousand years/.test(p.core), 'parse: reads the core');
ok(/seven hills/.test(p.open), 'parse: reads the opening');
eq(p.sections.length, 2, 'parse: finds both sections');
eq(p.sections[0].h, 'The republic breaks', 'parse: reads a section heading');
ok(/Rubicon/.test(p.sections[0].body), 'parse: keeps the section body');
ok(/Augustus/.test(p.sections[0].body), 'parse: keeps a second paragraph inside one section');
eq(p.facts.length, 4, 'parse: collects every fact');
eq(p.facts[0], 'Caesar crossed the Rubicon in 49 BC', 'parse: strips the bullet');
eq(p.nothing, '', 'parse: a real recap has no NOTHING line');

// ⚠️ The section body must not swallow the FACTS block. If it did, the facts
// would render as prose and the "worth keeping" panel would be empty — a
// silent loss of the one part built to survive six months.
ok(!/Rubicon in 49 BC$/.test(p.sections[1].body), 'parse: FACTS does not leak into the last section');

// The shelf is validated against the nine we own — the model may FILE, never NAME.
eq(yt._matchShelf('World'), 'World', 'shelf: accepts one of the nine');
eq(yt._matchShelf('Ancient History'), '', 'shelf: an invented shelf is discarded, not adopted');
eq(yt._matchShelf(''), '', 'shelf: nothing in, nothing out');
eq(yt._matchShelf('faith'), 'Faith', 'shelf: case-insensitive');

// A video with nothing being said in it.
const NONE = yt._parseRecap('SHELF: Sound\nNOTHING: A live performance of one song, with no talking.');
eq(NONE.sections.length, 0, 'parse: a NOTHING reply has no sections');
ok(/live performance/.test(NONE.nothing), 'parse: keeps what the video actually is');

// Forgiving, like kpParse — a missing header must never cost him the words.
const MESSY = yt._parseRecap('CORE: one idea\nSECTION: A\nbody text here\nFACTS:\n* a starred fact');
eq(MESSY.sections.length, 1, 'parse: survives a missing SHELF and OPEN');
eq(MESSY.facts[0], 'a starred fact', 'parse: accepts a * bullet');
eq(yt._parseRecap('').sections.length, 0, 'parse: empty in is not a crash');

/* The prompt is where this feature lives or dies — these are the instructions
   that stop it producing the vagueness he rejected. */
console.log('   the prompt refuses the vagueness he complained about');
ok(/instead of ever watching it again/i.test(yt.RECAP_SYS), 'prompt: states it replaces the video');
ok(/Be specific or say nothing/i.test(yt.RECAP_SYS), 'prompt: bans the generically-true sentence');
ok(/Never invent/i.test(yt.RECAP_SYS), 'prompt: bans invention');
ok(/no markdown/i.test(yt.RECAP_SYS), 'prompt: bans markdown — the page renders this itself');
ok(/in this video/i.test(yt.RECAP_SYS), 'prompt: bans "in this video" narration');
ok(!/3 to 5|three to five/i.test(yt.RECAP_SYS),
  'prompt: does NOT demand a fixed number of points — that is what forced padding before');

/* ════════════════════════════════════════════════════════════
   3 · improve.html — the page
   ════════════════════════════════════════════════════════════ */
console.log('\n── improve.html — the reading view ──');
const html = fs.readFileSync(path.join(ROOT, 'improve.html'), 'utf8');

/* ⚠️ CONSTRAINT 19, THE HARD WAY — twice, in this file.
   Two assertions below failed on their first run, and both were the GUARD
   being wrong rather than the code. The comment above the CSS documents the
   trap by writing the bad pattern out (`dialog.rc{display:flex}`), and the
   comment above runRecap explains why the sweep must never call it — so a
   plain search of the file finds the forbidden shape inside the prose warning
   against it.
   That is exactly how the broken sync-script guard survived: a guard that
   cries wolf is a guard somebody loosens. So every structural assertion below
   searches CODE, never the file as typed. */
function stripComments(src){
  return src.replace(/\/\*[\s\S]*?\*\//g, ' ')     // block comments (CSS and JS)
            .replace(/^\s*\/\/.*$/gm, ' ')          // whole-line JS comments
            .replace(/<!--[\s\S]*?-->/g, ' ');      // HTML comments
}
const code = stripComments(html);

function makeEl(){
  const el = {
    _html:'', style:{ setProperty(){}, }, dataset:{}, open:false,
    classList:{ _s:new Set(),
      add(){ [].forEach.call(arguments,c=>this._s.add(c)); },
      remove(){ [].forEach.call(arguments,c=>this._s.delete(c)); },
      toggle(c,f){ if(f===undefined) f=!this._s.has(c); f?this._s.add(c):this._s.delete(c); return f; },
      contains(c){ return this._s.has(c); } },
    children:[], value:'', textContent:'', offsetLeft:0, offsetWidth:100, firstChild:null,
    set innerHTML(v){ this._html=String(v); this.firstChild = v ? {} : null; },
    get innerHTML(){ return this._html; },
    setAttribute(k,v){ this[k]=v; }, getAttribute(k){ return this[k]===undefined?null:this[k]; },
    removeAttribute(k){ delete this[k]; },
    addEventListener(){}, appendChild(){}, querySelector(){ return null; }, querySelectorAll(){ return []; },
    closest(){ return null; }, scrollIntoView(){}, focus(){}, blur(){}, setSelectionRange(){},
    showModal(){ this.open = true; }, close(){ this.open = false; }
  };
  return el;
}
const els = {};
function el(id){ if(!els[id]) els[id]=makeEl(); return els[id]; }
const store = {};
const localStorage = {
  getItem:(k)=> k in store ? store[k] : null,
  setItem:(k,v)=>{ store[k]=String(v); },
  removeItem:(k)=>{ delete store[k]; },
  key:(i)=> Object.keys(store)[i], get length(){ return Object.keys(store).length; }
};
const sandbox = {
  document:{ getElementById: el, documentElement: makeEl(), querySelector: ()=>null, addEventListener:()=>{}, hidden:false },
  localStorage,
  window:{ addEventListener(){}, initCloudSync(){}, ALSSync:null },
  performance:{ now:()=>0 }, requestAnimationFrame:()=>{}, setTimeout:()=>{}, setInterval:()=>{},
  fetch:()=>Promise.reject(new Error('no network in tests')),
  console, Date, Math, JSON, parseInt, parseFloat, String, Number, Array, Object, isNaN, isFinite,
  encodeURIComponent, decodeURIComponent, RegExp, Promise, Error, Set
};
sandbox.globalThis = sandbox;
const scripts = html.match(/<script>[\s\S]*?<\/script>/g) || [];
const main = scripts.find(s => s.includes("var K_VID='improve:videos'"));
ok(!!main, 'found the page main inline script');
vm.createContext(sandbox);
vm.runInContext(main.replace(/^<script>/,'').replace(/<\/script>$/,''), sandbox, { filename:'improve.html' });
const im = sandbox.window.__im;
ok(!!im, 'the page exposes its test hook');

// The page's parser must agree with the server's. Two parsers for one format
// is two formats with a delay — the taxonomy lesson from als-v434, applied to
// a wire format.
console.log('   the page parses exactly what the server writes');
const pp = im.rcParse(GOOD);
eq(pp.shelf, p.shelf, 'page/server agree: shelf');
eq(pp.core, p.core, 'page/server agree: core');
eq(pp.sections.length, p.sections.length, 'page/server agree: section count');
eq(pp.sections[0].h, p.sections[0].h, 'page/server agree: section heading');
eq(pp.facts.length, p.facts.length, 'page/server agree: fact count');
eq(pp.facts[3], p.facts[3], 'page/server agree: the last fact');
eq(im.rcParse(NONE.nothing ? 'SHELF: Sound\nNOTHING: A live performance.' : '').nothing, 'A live performance.',
  'page: reads a NOTHING reply');

// Paragraphs: a blank line is a paragraph break, a single newline is not.
const paras = im.recapParagraphs('one line\nwrapped here\n\nsecond para');
eq(paras.length, 2, 'paragraphs: a blank line splits, a wrap does not');
eq(paras[0], 'one line wrapped here', 'paragraphs: a wrapped line rejoins into one');
eq(im.recapParagraphs('').length, 0, 'paragraphs: empty in, nothing out');

/* ── THE THREE STATES ────────────────────────────────────────
   Not looked at · watched and there was nothing · watched and here it is.
   Constraint 10: these must never render the same way. */
console.log('   three states that must never look the same');
const fresh = { id:'a', ytId:'aaa', title:'A' };
const nothing = { id:'b', ytId:'bbb', title:'B', recapNothing:'A song, no talking.', recapTs:1 };
const done = { id:'c', ytId:'ccc', title:'C', recap:GOOD, recapTs:1, recapWords:120 };
eq(im.hasRecap(fresh), false, 'state: a fresh video has no recap');
eq(im.recapEmpty(fresh), false, 'state: a fresh video is not "watched, nothing there"');
eq(im.hasRecap(nothing), false, 'state: "nothing there" is not a recap');
eq(im.recapEmpty(nothing), true, 'state: "nothing there" is its own state');
eq(im.hasRecap(done), true, 'state: a real recap reads as one');
eq(im.recapEmpty(done), false, 'state: a real recap is not "nothing there"');
eq(im.hasRecap({ id:'d', recap:'   ' }), false, 'state: whitespace is not a recap');

// The badge. A recap outranks every other badge because it is the only one
// making a claim about the SOURCE rather than about a reading.
console.log('   the badge says the video was watched');
ok(/recap/.test(im.badgeFor(done)), 'badge: a recapped video says recap');
ok(/recap/.test(im.badgeFor({ id:'e', ytId:'e', recap:GOOD, keypoints:'KIND: LESSON\nCORE: x' })),
  'badge: recap outranks the lesson badge');
ok(/recap/.test(im.badgeFor({ id:'f', ytId:'f', recap:GOOD, keypoints:'CORE: old' })),
  'badge: a recapped video is no longer "unverified", whatever its old key points were');
ok(!/recap/.test(im.badgeFor(fresh)), 'badge: a video with no recap does not claim one');

/* ── ONE CARD, ONE VOICE ─────────────────────────────────────
   A good summary and a grey one on the same card makes him decide which to
   trust every single time. Once a recap exists it IS the summary; the earlier
   description-written reading folds away rather than being deleted. */
console.log('   a recap replaces the summary, not the action');
const paneSrc = (code.match(/function paneHTML\(\)\{[\s\S]*?\n    \}\n/) || [''])[0];
ok(paneSrc.length > 400, 'one-voice: found paneHTML to check');
ok(/var recapped=hasRecap\(v\)/.test(paneSrc), 'one-voice: the pane branches on whether a recap exists');
ok(/The earlier summary/.test(paneSrc), 'one-voice: the old key points fold into a disclosure, not deleted');
ok(/if\(!recapped\)\{/.test(paneSrc), 'one-voice: the inline key points only render when there is no recap');
// ⚠️ The DO line must NOT fold with them — it is an action, and the recap does
// not replace an action. It is rendered outside the !recapped branch.
const doIdx = paneSrc.indexOf('pane-do'), notRecapIdx = paneSrc.indexOf('if(!recapped){');
ok(doIdx > 0 && notRecapIdx > 0 && doIdx > notRecapIdx,
  'one-voice: the DO / practice block survives a recap — a recap replaces a summary, not an action');

// The block is ONE function used in two positions, so the two can never drift
// into two components.
ok(/function recapBlockHTML\(v\)/.test(code), 'one-voice: the recap block is a single function');
eq((paneSrc.match(/recapBlockHTML\(v\)/g) || []).length, 2,
  'one-voice: it is drawn in exactly two positions from one source');

/* ── RECALL ──────────────────────────────────────────────────
   A recap is the strongest thing in the library, so it must be able to come
   back round on its own — including on a video whose old key points are
   legacy, which is most of them. */
console.log('   a recap can come back round on its own');
const dueSrc = (code.match(/function dueAt\(v\)\{[\s\S]*?\n    \}/) || [''])[0];
ok(/hasRecap\(v\)/.test(dueSrc), 'recall: a recap qualifies for the recall queue by itself');
ok(/v\.recapTs\|\|0/.test(dueSrc), 'recall: recapTs joins the anchor, so the interval counts from the last contact');
ok(/Math\.max\(v\.revisitTs\|\|0, v\.distilledTs\|\|0, v\.recapTs\|\|0\)/.test(dueSrc),
  'recall: the anchor is the LATEST of the three, never one of them alone');
// Opening the reading view IS revisiting it — the one place on this page where
// stamping revisitTs is honestly true.
ok(/function openRecap\(id\)\{[\s\S]*?revisitTs=Date\.now\(\)/.test(code),
  'recall: opening the recap restarts its recall clock');
// ⚠️ ...and runRecap must NOT, or every recap would land already-due.
const runSrc = (code.match(/async function runRecap\(id\)\{[\s\S]*?\n    \}/) || [''])[0];
ok(runSrc.length > 300, 'recall: found runRecap to check');
ok(!/revisitTs/.test(runSrc),
  'recall: writing a recap does NOT stamp revisitTs — that is the applyKP trap, one store over');

// Both recall cards must survive a recap-only item. Reading kpParse alone
// there would draw an empty card under a "Before you forget it" heading.
const roomSrc = (code.match(/function renderRoom\(\)\{[\s\S]*?\n    \}/) || [''])[0];
ok(/hasRecap\(r\)\?rcParse/.test(roomSrc), 'recall: the Room due card reads the recap when there is one');
ok(/data-rcread="/.test(roomSrc), 'recall: the Room due card opens the recap directly');
const emptySrc = (code.match(/function paneEmptyHTML\(\)\{[\s\S]*?\n    \}/) || [''])[0];
ok(/hasRecap\(rem\)\?rcParse/.test(emptySrc), 'recall: the pane recall card reads the recap when there is one');

/* ── THE SOURCE LINE ─────────────────────────────────────────
   Every other grade on this page is an apology for reading around the video.
   This one is not, and it must not be worded like one. */
console.log('   the source line tells the truth about what was read');
ok(!!im.SRC.watched, 'src: the watched grade has its own line');
ok(/watched/i.test(im.SRC.watched), 'src: it says the video was watched');
ok(!/no transcript/i.test(im.SRC.watched),
  'src: it does NOT borrow the "there is no transcript" apology from the description grades');
ok(/no transcript/i.test(im.SRC.description),
  'src: the description grade still carries that apology, because it is still true there');
ok(im.SRC.watched !== im.SRC.description, 'src: watched and description do not say the same thing');
// ⚠️ This line renders at the FOOT of the pane, with the recap above it.
ok(!/below/i.test(im.SRC.watched),
  'looked-at: the watched line does not say "below" — it sits at the foot of the pane and the recap is above it');

/* The pane chip must agree with the tile badge. The wall said RECAP while the
   pane two inches away still said LESSON — one reading, described two ways on
   one screen. Constraint 15 in miniature. */
console.log('   the pane chip agrees with the tile badge');
ok(/var recapKind=hasRecap\(v\)/.test(paneSrc), 'agreement: the pane chip knows about recaps');
ok(/recapKind\?'Recap'/.test(paneSrc), 'agreement: a recapped video says Recap in the pane, not Lesson');
ok(/recap/.test(im.badgeFor(done)) && /Recap/.test("Recap"),
  'agreement: and the tile badge says recap for the same item');
// ...and the tile's own core line, which wore the RECAP badge over "A tour of
// Roman history" — the thin core, under a badge promising the opposite.
const tileSrc = (code.match(/function tileHTML\(v\)\{[\s\S]*?\n    \}/) || [''])[0];
ok(/hasRecap\(v\)/.test(tileSrc), 'agreement: the tile prints the recap core, not the description-written one');
// Every surface that can show a core must consult the recap first. If a new
// one appears without doing so, this count changes and somebody has to look.
const coreSurfaces = ['tileHTML','paneHTML','renderRoom','paneEmptyHTML']
  .filter(fn => new RegExp('function ' + fn + '\\(\\)?\\w*\\)?\\{[\\s\\S]*?hasRecap').test(code));
eq(coreSurfaces.length, 4,
  'agreement: all four surfaces that print a core consult the recap first  (' + coreSurfaces.join(', ') + ')');

/* ── SEARCH ──────────────────────────────────────────────────
   The recap is now the longest and most specific text in the library. Search
   ignored the transcript for the page's whole life; this is the same omission
   waiting to happen again. */
console.log('   search reaches the recap');
const hayed = im.hay(done);
ok(hayed.indexOf('rubicon') >= 0, 'search: the recap body is in the haystack');
ok(hayed.indexOf('mehmed') >= 0, 'search: a fact from the recap is searchable');
// And the memo signature must move when the recap does, or the first search
// after a recap lands would be answered from a stale blob.
const before = im.hay({ id:'g', ytId:'g', title:'T', ts:1 });
const after  = im.hay({ id:'g', ytId:'g', title:'T', ts:1, recap:'CORE: something new about Byzantium' });
ok(before !== after, 'search: the memo signature moves when a recap is added');

/* ── WIRING ──────────────────────────────────────────────────
   Things that break silently if they drift apart. */
console.log('   wiring that breaks silently if it drifts');
const courier = fs.readFileSync(path.join(ROOT, 'api', 'run-reminders.js'), 'utf8');
ok(/ytrecap/.test(courier), 'wiring: the courier has a ?ytrecap branch');
ok(/yt\.recap\(/.test(courier), 'wiring: the courier actually calls recap()');
ok(/GEMINI_API_KEY/.test(courier), 'wiring: the courier checks for the key before calling');
ok(/PUBLIC videos/.test(courier), 'wiring: a non-public video gets an actionable message, not a raw 400');
ok(/ytrecap/.test(html), 'wiring: the page calls ?ytrecap');

// Constraint 1: twelve routed functions, all twelve used. This feature folds
// into run-reminders.js and must never have added a thirteenth.
const vercel = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'));
ok(Object.keys(vercel.functions || {}).length <= 12,
  'constraint 1: still 12 or fewer routed functions');
ok(!fs.existsSync(path.join(ROOT, 'api', 'ytrecap.js')),
  'constraint 1: the recap did NOT become a thirteenth function');

// Constraint 16: a store is written by the page that owns it. The recap lives
// ON the video, in improve:videos — a key this page already owns, already
// syncs and already backs up. A new key would have needed BUNDLES.
ok(/v\.recap\s*=/.test(html), 'constraint 16: the recap is stored on the video itself');
ok(!/improve:recaps/.test(html), 'constraint 16: no new store was invented for it');
const backup = fs.readFileSync(path.join(ROOT, 'backup.html'), 'utf8');
ok(/improve:videos/.test(backup), 'constraint 16: improve:videos is in BUNDLES, so recaps are restorable');



// Constraint 4: the reading view is a native <dialog>, centred against this
// page's global *{margin:0}, with display scoped to [open].
ok(/<dialog class="rc"/.test(code), 'constraint 4: the reading view is a native <dialog>');
ok(/showModal\(\)/.test(code), 'constraint 4: it is opened with showModal()');
ok(/dialog\.rc\{[^}]*margin:auto/.test(code),
  'constraint 4: margin:auto is set explicitly — *{margin:0} kills the UA centering');
ok(/dialog\.rc\[open\]\{\s*display:flex/.test(code),
  'constraint 4: display is scoped to [open], or the recap is permanently on screen');
ok(!/dialog\.rc\{[^}]*display:flex/.test(code),
  'constraint 4: no unscoped display on the dialog itself');

// Constraint 13: a scrolling flex child never gets flex:1 against an
// indefinite-height container — iOS Safari collapses it to zero.
ok(/\.rc-body\{[^}]*flex:1 1 auto/.test(html),
  'constraint 13: the scrolling body uses flex:1 1 auto, not flex:1');
ok(/\.rc-body\{[^}]*min-height:0/.test(html), 'constraint 13: it carries its own min-height');

// Constraint 12: a class toggled from JS must exist in CSS.
ok(/\.badge\.recap\{/.test(code), 'constraint 12: the .badge.recap class is actually defined');

/* ⭐ Two things only a SCREENSHOT caught — invisible to all 105 assertions
   above, and both now pinned so they cannot come back.
   The lesson this repo keeps re-learning: a green suite is not a look. */
ok(/\.b\{[^}]*text-decoration:none/.test(code),
  'looked-at: .b sets text-decoration:none, so an <a class="b"> is not underlined beside its <button> siblings');
ok(/\.rc-x:focus\{\s*outline:none/.test(code),
  'looked-at: showModal() autofocuses the ✕ — its UA blue focus ring is suppressed');
ok(/\.rc-x:focus-visible\{[^}]*rgba\(var\(--acc\)/.test(code),
  'looked-at: keyboard focus is still visible, in the page accent rather than UA blue');
ok(/class="rc-body" tabindex="-1"/.test(code),
  'looked-at: the reading view starts focused on the TEXT, not on its close button');
const renderRecapBody = (code.match(/function renderRecap\(\)\{[\s\S]*?\n    \}/) || [''])[0];
ok(renderRecapBody.length > 200, 'looked-at: found renderRecap to check');
ok(!/toLocaleDateString/.test(renderRecapBody),
  'looked-at: the recap meta uses whenAgo(), not a US-format locale date on a page read in Greece');

// Constraint 2: the service worker was bumped, and never backwards.
const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
const ver = (sw.match(/var CACHE = "als-v(\d+)"/) || [])[1];
ok(ver && parseInt(ver, 10) >= 440, 'constraint 2: sw.js CACHE is at least als-v440  (got als-v' + ver + ')');

/* It must stay OUT of the background sweep. An hour of video is a real slice
   of the daily quota; sweeping 46 videos would spend it on ones he never
   watched. Checked against the sweep's actual BODY rather than by proximity —
   the first version of this assertion matched the comment explaining the rule
   (see the constraint 19 note above). */
const sweepBody = (code.match(/async function sweep\(\)\{[\s\S]*?\n    \}/) || [''])[0];
ok(sweepBody.length > 200, 'cost: found the sweep body to check');
ok(!/runRecap|ytrecap/.test(sweepBody), 'cost: the background sweep never triggers a recap');
const ttSweepBody = (code.match(/async function ttSweep\(\)\{[\s\S]*?\n    \}/) || [''])[0];
ok(!/runRecap|ytrecap/.test(ttSweepBody), 'cost: the TikTok sweep never triggers a recap either');
ok(/data-rcrun/.test(code), 'cost: a recap only happens when he presses the button');

// A recap replaces one he may already have, so it may only do so on success —
// the rule the re-read sweep learned the hard way.
ok(/if\(res\.ok\)/.test(html), 'safety: the store is only touched on a confirmed success');
ok(/recapBusy\[id\]/.test(html), 'safety: in-flight state is keyed by id, not one shared flag');

console.log(pass + ' passed, ' + fail + ' failed');
if (fail) process.exit(1);
console.log('\n✓ ' + pass + ' passed, 0 failed');
