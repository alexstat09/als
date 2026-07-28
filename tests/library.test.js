// improve.html (the Library) + api/_tiktok.js
// Two halves: the SERVER helper's grading and parsing, and the PAGE's link
// extraction, key-point parsing and store routing.
//
// The assertions that matter most are the ones about honesty:
//   - a video with only hashtags must NEVER be graded as a lesson
//   - a TikTok that has not been fetched yet must still route to the TikTok
//     store, even though its ttId is empty
// Both were real bugs during the build.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

let pass = 0, fail = 0;
function ok(cond, msg){ if(cond){ pass++; } else { fail++; console.error('  ✗ ' + msg); } }
function eq(a, b, msg){ ok(a === b, msg + '  (got ' + JSON.stringify(a) + ', want ' + JSON.stringify(b) + ')'); }

/* ════════════════════════════════════════════════════════════
   1 · the server helper
   ════════════════════════════════════════════════════════════ */
const tt = require(path.join(__dirname, '..', 'api', '_tiktok.js'));

console.log('\n── api/_tiktok.js ──');

// URL discipline: this helper is reachable from the browser and must never
// become an open proxy.
(async function(){
  const good = await tt._canonical('https://www.tiktok.com/@just.myles/video/7637928002793262367?is_from_webapp=1');
  ok(good && good.id === '7637928002793262367', 'canonical: keeps the video id');
  eq(good && good.url, 'https://www.tiktok.com/@just.myles/video/7637928002793262367', 'canonical: strips the query string');
  eq(await tt._canonical('https://evil.com/@x/video/123456789'), null, 'canonical: refuses a non-tiktok host');
  eq(await tt._canonical('https://tiktok.com.evil.com/@x/video/123456789'), null, 'canonical: refuses a lookalike host');
  eq(await tt._canonical('file:///etc/passwd'), null, 'canonical: refuses a non-http scheme');
  eq(await tt._canonical(''), null, 'canonical: refuses empty');

  // numeric handles are real — his own saved links use them
  const num = await tt._canonical('https://www.tiktok.com/@6793362057804530694/video/7637928002793262367');
  ok(num && num.id === '7637928002793262367', 'canonical: accepts a numeric handle');
})();

// WEBVTT → speech
const VTT = 'WEBVTT\n\n\n00:00:00.140 --> 00:00:01.420\nYeah, please. Listen,\n\n' +
            '00:00:01.421 --> 00:00:04.401\nI apologize sincerely\n\n' +
            '00:00:04.580 --> 00:00:08.340\nI apologize sincerely\n\n' +
            '3\n00:00:08.341 --> 00:00:10.401\nbut I cannot move right now.\n';
const spoken = tt._vtt(VTT);
ok(spoken.indexOf('WEBVTT') < 0, 'vtt: drops the header');
ok(spoken.indexOf('-->') < 0, 'vtt: drops the cue timings');
ok(spoken.indexOf('\n') < 0, 'vtt: returns one flowing line');
eq((spoken.match(/I apologize sincerely/g) || []).length, 1, 'vtt: collapses ASR\'s repeated line');
ok(/^Yeah, please\. Listen, I apologize sincerely but I cannot move right now\.$/.test(spoken), 'vtt: reads as real speech');
eq(tt._vtt(''), '', 'vtt: empty in, empty out');

// stickers = the on-screen text
eq(tt._stickers({ stickersOnItem:[{ stickerText:['Stranger - Jhene Aiko'] }] })[0], 'Stranger - Jhene Aiko', 'stickers: pulls the on-screen text');
eq(tt._stickers({ stickersOnItem:[{ stickerText:['a'] },{ stickerText:['a'] }] }).length, 1, 'stickers: dedupes');
eq(tt._stickers({}).length, 0, 'stickers: nothing is not a crash');

// the caption minus its hashtag wall
eq(tt._captionWords('#lanadelrey #xybzca #viral').length, 0, 'captionWords: a hashtag wall carries no words');
eq(tt._captionWords('Trying to post content again #fyp').length, 5, 'captionWords: counts the real words only');
eq(tt._captionWords('').length, 0, 'captionWords: empty is empty');

/* ⭐ THE RULE THE WHOLE FEATURE RESTS ON.
   These five cases are his own saved favourites, measured live on 27/07/26. */
console.log('   grade() — measured against his five real favourites');
const LANA   = { caption:'#lanadelrey #xybzca #viral', tags:['lanadelrey','xybzca','viral'], screen:[], transcript:'' };
const RONALDO= { caption:'#cristianoronaldo #viral #football', tags:['cristianoronaldo','viral'], screen:[], transcript:'' };
const COVER  = { caption:'Trying to post content again #coversong', tags:['coversong'], screen:['Stranger - Jhene Aiko'], transcript:'' };
const RAP    = { caption:'never gon lose #future', tags:['future'], screen:[], transcript:new Array(61).join('word ') };
const SERMON = { caption:'JESUS is all I can say #fyp', tags:['fyp'], screen:['Gods comfort is not only for us, but it is for others as well'], transcript:new Array(553).join('word ') };

eq(tt.grade(LANA), 'thin', 'grade: a Lana edit is THIN — never a lesson');
eq(tt.grade(RONALDO), 'thin', 'grade: a Ronaldo edit is THIN');
// ⚠️ The cover's sticker is "Stranger - Jhene Aiko" — 21 characters. That is a
// SONG TITLE, not something to teach from, so it stays keepsake-only. It still
// reaches the model as material, which is how the live answer came back as
// "A cover of Jhene Aiko's song Stranger" instead of an invented lesson.
eq(tt.grade(COVER), 'thin', 'grade: a short on-screen title is a label, not a lesson');
eq(tt.grade({ screen:['Three things nobody tells you about discipline and why it matters'] }), 'screen',
   'grade: a real wall of on-screen text IS teachable');
eq(tt.grade(RAP), 'transcript', 'grade: a clip with captions is transcript-grade');
eq(tt.grade(SERMON), 'transcript', 'grade: the sermon is transcript-grade');
eq(tt.grade({}), 'none', 'grade: nothing at all is NONE');
eq(tt.grade({ note:'the point was to share comfort' }), 'notes', 'grade: his own note outranks everything');
// 24 words is under the bar, 25 is over it — the boundary is deliberate.
eq(tt.grade({ transcript:new Array(25).join('word ') }), 'none', 'grade: 24 words of captions is not enough to teach from');
eq(tt.grade({ transcript:new Array(26).join('word ') }), 'transcript', 'grade: 25 words is');

/* ⭐ Only 'transcript', 'screen' and 'notes' may produce key points — that is
   the rule read() enforces. So no input that is merely a caption or a hashtag
   wall may ever reach one of those three grades, however it is dressed up. */
const LESSON_GRADES = ['transcript','screen','notes'];
[ ['a hashtag wall',           LANA],
  ['another hashtag wall',     RONALDO],
  ['a short on-screen title',  COVER],
  ['a written caption',        { caption:'this is a fairly long written caption with plenty of real words in it' }],
  ['a caption plus tags',      { caption:'some words here that go on', tags:['a','b','c'] }],
  ['only a sound',             { music:'died lonely — celestial ambient' }],
  ['nothing at all',           {}]
].forEach(function(row){
  ok(LESSON_GRADES.indexOf(tt.grade(row[1])) < 0,
     'grade: ' + row[0] + ' can never become a lesson  (graded ' + tt.grade(row[1]) + ')');
});

/* ════════════════════════════════════════════════════════════
   2 · the page
   ════════════════════════════════════════════════════════════ */
console.log('\n── improve.html ──');

const html = fs.readFileSync(path.join(__dirname, '..', 'improve.html'), 'utf8');

function makeEl(){
  const el = {
    _html:'', style:{ setProperty(){}, }, dataset:{},
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
    closest(){ return null; }, scrollIntoView(){}, focus(){}, blur(){}, setSelectionRange(){}
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

const document = {
  getElementById: el,
  documentElement: makeEl(),
  querySelector: ()=> null,
  addEventListener:()=>{},
  hidden:false
};
const sandbox = {
  document, localStorage,
  window:{ addEventListener(){}, initCloudSync(){}, ALSSync:null },
  performance:{ now:()=>0 }, requestAnimationFrame:()=>{}, setTimeout:()=>{}, setInterval:()=>{},
  fetch:()=>Promise.reject(new Error('no network in tests')),
  console, Date, Math, JSON, parseInt, parseFloat, String, Number, Array, Object, isNaN, isFinite,
  encodeURIComponent, decodeURIComponent, RegExp, Promise, Error, Set
};
sandbox.globalThis = sandbox;

const scripts = html.match(/<script>[\s\S]*?<\/script>/g) || [];
const main = scripts.find(s => s.includes("var K_VID='improve:videos'"));
ok(!!main, 'found the page\'s main inline script');
const code = main.replace(/^<script>/,'').replace(/<\/script>$/,'');
vm.createContext(sandbox);
vm.runInContext(code, sandbox, { filename:'improve.html' });
const im = sandbox.window.__im;
ok(!!im, 'the page exposes its test hook');

/* ── link extraction: a real notes dump ─────────────────────── */
console.log('   pulling links out of a Notes paste');
const NOTES = `saved stuff
https://www.tiktok.com/@7661748790546433026/video/7665680458109308182
the ronaldo one https://www.tiktok.com/@7655054560651035661/video/7665823901942926622?is_from_webapp=1&sender_device=pc
https://vm.tiktok.com/ZMabcd123/
https://www.tiktok.com/@6971158597812569093/video/7533119123346197773
duplicate → https://www.tiktok.com/@7661748790546433026/video/7665680458109308182
https://www.youtube.com/watch?v=dQw4w9WgXcQ
random text with no link at all`;
const found = NOTES.match(im.TT_RE) || [];
eq(found.length, 5, 'extract: finds every TikTok link (including the repeat)');
ok(found.every(u => /tiktok\.com/.test(u)), 'extract: never picks up the YouTube link');
eq(im.ttIdOf('https://www.tiktok.com/@x/video/7665680458109308182'), '7665680458109308182', 'ttIdOf: reads the id');
eq(im.ttIdOf('https://vm.tiktok.com/ZMabcd123/'), '', 'ttIdOf: a short link has no id yet — that is not an error');
eq(im.ttIdOf('nonsense'), '', 'ttIdOf: nonsense yields nothing');

// the dedupe the paste box actually runs
const seen = {}, uniq = [];
found.forEach(u => { u = u.split('?')[0]; if(!seen[u]){ seen[u]=1; uniq.push(u); } });
eq(uniq.length, 4, 'extract: the repeat and the query-string twin collapse to one');

/* ── ⭐ store routing ────────────────────────────────────────── */
console.log('   which store does an item belong to');
ok(im.isTikTok({ ttId:'123', url:'' }), 'routing: a fetched TikTok is a TikTok');
ok(im.isTikTok({ ttId:'', url:'https://www.tiktok.com/@a/video/1', source:'TikTok' }),
   'routing: ⭐ a PENDING TikTok (empty ttId) is still a TikTok');
ok(im.isTikTok({ ttId:'', url:'https://vm.tiktok.com/ZMabc/', source:'TikTok' }),
   'routing: a pending SHORT link is still a TikTok');
ok(!im.isTikTok({ ytId:'abc', url:'https://www.youtube.com/watch?v=abc' }), 'routing: a YouTube video is not');
ok(!im.isTikTok({ title:'a book', url:'' }), 'routing: a hand-typed row is not');
ok(!im.isTikTok(null), 'routing: null is not a crash');

/* ── key-point parsing, against REAL model output ───────────── */
console.log('   parsing what the model actually returned live');
const SERMON_OUT = `KIND: LESSON
TOPIC: Faith
CORE: The comfort we receive from God is meant to be shared with others.
KEY:
- When God comforts us, we can pass that comfort to people who are hurting.
- Sharing Bible verses is a way to give others a real experience of Jesus.
DO: Send someone a short encouraging verse this week.`;
let p = im.kpParse(SERMON_OUT);
eq(p.kind, 'lesson', 'parse: reads KIND');
eq(p.topic, 'Faith', 'parse: reads TOPIC');
eq(p.core, 'The comfort we receive from God is meant to be shared with others.', 'parse: reads CORE');
eq(p.keys.length, 2, 'parse: reads both key points');
ok(/Send someone/.test(p.act), 'parse: reads DO');

const KEEP_OUT = `KIND: KEEPSAKE
TOPIC: Music
CORE: A cover of Jhene Aiko's song "Stranger."
KEY:
- Creator @cay.ba3
- Song title shown: Stranger - Jhene Aiko`;
p = im.kpParse(KEEP_OUT);
eq(p.kind, 'keepsake', 'parse: a keepsake declares itself');
eq(p.keys.length, 2, 'parse: keepsake key points survive');
ok(!p.act, 'parse: a keepsake has no action — and none is invented');

// the forgiving paths — a model that wanders must not cost him his notes
p = im.kpParse('KEY POINTS: the first one\n- the second');
eq(p.keys.length + (p.core?1:0), 2, 'parse: "KEY POINTS:" is one label, never KEY + POINTS');
ok(!/^POINTS/.test(p.core||''), 'parse: the longest-first alternation still holds');
p = im.kpParse('**CORE:** bolded\n1. numbered point\n2. another');
eq(p.core, 'bolded', 'parse: markdown bold is stripped');
eq(p.keys.length, 2, 'parse: numbered lists are key points');
p = im.kpParse('- only a bullet, no core at all');
eq(p.core, 'only a bullet, no core at all', 'parse: a missing CORE promotes the first bullet');
p = im.kpParse('');
ok(!p.core && !p.keys.length, 'parse: nothing in, nothing invented');

/* ── lesson vs keepsake on the card ─────────────────────────── */
console.log('   what the card promises');
ok(im.isLesson({ kind:'lesson' }), 'card: a lesson reads as a lesson');
ok(!im.isLesson({ kind:'keepsake' }), 'card: a keepsake never reads as a lesson');
ok(!im.isLesson({ keypoints:KEEP_OUT }), 'card: the KIND line wins even with no kind field');
ok(im.isLesson({ ytId:'abc' }), 'card: an unread YouTube video defaults to lesson');
// ⭐ the rap clip: it HAD a transcript, so it was allowed to be a lesson, and
// the model demoted itself. The card must follow the model, not the eligibility.
ok(!im.isLesson({ ttId:'1', grade:'transcript', kind:'keepsake' }),
   'card: ⭐ transcript-grade + KEEPSAKE stays a keepsake');

/* ── titles ─────────────────────────────────────────────────── */
console.log('   naming a TikTok that has no title');
eq(im.titleOf({ ttId:'1', caption:'Trying to post again #fyp #viral' }), 'Trying to post again', 'title: caption minus its hashtags');
eq(im.titleOf({ ttId:'1', caption:'#lanadelrey #viral', handle:'farbeyond_driven', keypoints:'CORE: A Lana Del Rey edit.' }),
   'A Lana Del Rey edit.', 'title: a hashtag-only caption falls back to what it IS');
eq(im.titleOf({ ttId:'1', caption:'#a #b', handle:'someone' }), '@someone', 'title: then to the creator');
eq(im.titleOf({ ttId:'1' }), 'Saved TikTok', 'title: never blank');
eq(im.titleOf({ title:'Real title' }), 'Real title', 'title: a real title always wins');

/* ── search ─────────────────────────────────────────────────── */
console.log('   search reaches everything');
const hay = im.hay({ ttId:'1', handle:'just.myles', caption:'JESUS is all I can say', tags:['fyp'],
                     screen:['Second Corinthians'], keypoints:'CORE: comfort is for sharing', note:'my own line' });
['just.myles','jesus','fyp','corinthians','comfort','my own line'].forEach(function(t){
  ok(hay.indexOf(t) >= 0, 'search: finds "' + t + '"');
});

/* ── queue order ────────────────────────────────────────────── */
console.log('   order lives in ord, never in ts');
const a = { ord:0, ts:9999 }, b = { ord:1, ts:1 };
ok(im.byOrd(a,b) < 0, 'order: ord decides, not the sync clock');
ok(im.byOrd({ts:1},{ts:2}) < 0, 'order: rows with no ord fall back to ts');

/* ── remember ───────────────────────────────────────────────── */
console.log('   what resurfaces');
const DAY = 86400000, now = Date.now();
im._set([], [], []);
ok(!im.dueRemember(), 'remember: an empty library resurfaces nothing');
im._set([{ id:'v1', kind:'lesson', keypoints:'CORE: x', distilledTs:now-4*DAY, revisitTs:now-6*DAY }], [], []);
ok(!!im.dueRemember(), 'remember: an old lesson comes back');
im._set([{ id:'v1', kind:'lesson', keypoints:'CORE: x', distilledTs:now-1*DAY, revisitTs:now-6*DAY }], [], []);
ok(!im.dueRemember(), 'remember: a fresh one does not');
im._set([{ id:'v1', kind:'lesson', keypoints:'CORE: x', distilledTs:now-9*DAY, revisitTs:now-1*DAY }], [], []);
ok(!im.dueRemember(), 'remember: one seen yesterday does not');
// ⭐ a keepsake has nothing to remember — resurfacing "A Lana Del Rey edit"
// as a lesson to revisit would be nonsense.
im._set([], [], [{ id:'t1', ttId:'1', kind:'keepsake', keypoints:'CORE: A Lana Del Rey edit.', distilledTs:now-9*DAY }]);
ok(!im.dueRemember(), 'remember: ⭐ a keepsake never resurfaces');
im._set([], [], [{ id:'t2', ttId:'2', kind:'lesson', keypoints:'CORE: real', distilledTs:now-9*DAY }]);
ok(!!im.dueRemember(), 'remember: a TikTok LESSON does resurface');

/* ── the page still registers everything it must ────────────── */
console.log('   wiring that silently breaks if it drifts');
ok(/improve:tiktoks/.test(html), 'wiring: the page names improve:tiktoks');
ok(/syncedKeys:\[K_VID,K_TT,K_HAB,K_PROF\]/.test(html), 'wiring: all four keys are synced');
const backup = fs.readFileSync(path.join(__dirname, '..', 'backup.html'), 'utf8');
ok(/'improve':\s*\{\s*keys:\[[^\]]*'improve:tiktoks'/.test(backup),
   'wiring: ⭐ improve:tiktoks is in backup BUNDLES — synced but unrestorable is the trap');
const sw = fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8');
ok(/improve\.html/.test(sw), 'wiring: improve.html is in the service worker CORE');
// every class the script toggles must exist in the stylesheet (constraint 11)
['hidden','open','on','sel','pulse'].forEach(function(c){
  ok(new RegExp('\\.' + c + '[\\s,{:]').test(html), 'wiring: .' + c + ' is defined in CSS, not just toggled');
});

/* ════════════════════════════════════════════════════════════ */
setTimeout(function(){
  console.log('\n' + (fail ? '✗ ' : '✓ ') + pass + ' passed, ' + fail + ' failed\n');
  process.exit(fail ? 1 : 0);
}, 50);
