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

/* ── stopping the reader, and undoing an oversized paste ────── */
console.log('   the reader can be stopped, and a big paste undone');
im._set([], [], [
  { id:'a', ttId:'1', url:'https://www.tiktok.com/@x/video/1', keypoints:'CORE: read already' },
  { id:'b', ttId:'2', url:'https://www.tiktok.com/@x/video/2' },
  { id:'c', ttId:'',  url:'https://www.tiktok.com/@x/video/3', pending:true, source:'TikTok' }
]);
const unread = im.unreadIn(im._state().tiktoks);
eq(unread.length, 2, 'stop: "unread" counts everything with no key points');
ok(unread.every(v => !v.keypoints), 'stop: nothing already read is ever counted as unread');
ok(unread.some(v => v.pending), 'stop: a still-fetching item counts as unread');

// pausing must persist, or reopening the page restarts the flood he just stopped
eq(im.isPaused(), false, 'stop: not paused to begin with');
im.setPaused(true);
eq(im.isPaused(), true, 'stop: pausing takes effect');
eq(localStorage.getItem(im.K_PAUSE), '1', 'stop: the pause survives a reload');
im.setPaused(false);
eq(localStorage.getItem(im.K_PAUSE), null, 'stop: resuming clears it');
// ⭐ device-local on purpose: pausing his laptop must not stop his phone
ok(!/syncedKeys:\[[^\]]*K_PAUSE/.test(html), 'stop: ⭐ the pause flag is NOT synced');
ok(!/improve:paused/.test(fs.readFileSync(path.join(__dirname,'..','backup.html'),'utf8')),
   'stop: the pause flag is not in the vault either — it is not his data');

// both readers must actually check it, not merely offer the button
const sweepBody = html.slice(html.indexOf('async function sweep()'), html.indexOf('async function ttSweep()'));
ok(/if\(sweeping\|\|paused\) return;/.test(sweepBody), 'stop: the YouTube reader refuses to start when paused');
ok(/if\(paused\) break;/.test(sweepBody), 'stop: ⭐ the YouTube reader bails BETWEEN videos');
const ttBody = html.slice(html.indexOf('async function ttSweep()'), html.indexOf('/* ── shelving'));
ok(/if\(ttSweeping\|\|paused\) return;/.test(ttBody), 'stop: the TikTok reader refuses to start when paused');
ok(/if\(paused\) break;/.test(ttBody), 'stop: ⭐ the TikTok reader bails BETWEEN videos');

/* ── ⭐ starting over ────────────────────────────────────────── */
console.log('   clearing a batch has to actually stick');
im._set([], [], [
  { id:'a', ttId:'1', url:'https://www.tiktok.com/@x/video/1', keypoints:'CORE: read' },
  { id:'b', ttId:'2', url:'https://www.tiktok.com/@x/video/2' }
]);
im.setWorld('tt');
im.removeItems(im._state().tiktoks.slice());
eq(im._state().tiktoks.length, 0, 'reset: removing everything empties the wall');
eq(JSON.parse(localStorage.getItem('improve:tiktoks') || '[]').length, 0, 'reset: and it is written to the store');
// ⭐ The write MUST go through localStorage.setItem, because that is what
// sync.js intercepts to stamp deletion tombstones. Clear the key any other way
// and every video syncs straight back from the cloud on the next pull.
ok(/function removeItems\([\s\S]{0,400}?persist\(K_TT,tiktoks\)/.test(html),
   'reset: ⭐ deletion goes through persist(), so sync stamps tombstones');
ok(!/localStorage\.removeItem\(K_TT\)|localStorage\.clear\(/.test(html),
   'reset: ⭐ the store is never cleared behind sync\'s back');
// a wipe must not leave the reader paused with a fresh batch waiting
ok(/if\(paused\) setPaused\(false\);/.test(html), 'reset: clearing everything also lifts a pause');

/* ── TikTok never plays inline ──────────────────────────────── */
console.log('   TikTok opens in a real tab, not a bad embed');
ok(!/tiktok\.com\/embed/.test(html), '⭐ the TikTok embed iframe is GONE — it is a marketing surface, not a player');
ok(/youtube-nocookie\.com\/embed/.test(html), 'YouTube still plays inline, which works');
ok(/target="_blank" rel="noopener"/.test(html), 'a TikTok poster is a real link out');

/* ── ⭐ the shelves ──────────────────────────────────────────── */
console.log('   the nine shelves, fixed and shared');
eq(tt.SHELVES.length, 9, 'shelves: there are nine');
eq(tt.SHELVES.join(' '), 'Faith Mind Body Food Money World Sport Sound Laughs', 'shelves: in their canonical order');
ok(/var SHELVES=\['Faith','Mind','Body','Food','Money','World','Sport','Sound','Laughs'\]/.test(html),
   'shelves: ⭐ the page and the server hold the SAME list');
ok(/CVER=3/.test(html), 'shelves: CVER was bumped, so the library re-shelves once');
ok(/known=SHELVES\.slice\(\)/.test(html), 'shelves: the sorter is given the fixed list');
ok(/strict:true/.test(html), 'shelves: ⭐ and told it may file but never name');
// the rail must not reorder itself as videos arrive
ok(/Canonical order first/.test(html), 'shelves: the rail order is fixed, never by size');
tt.SHELVES.forEach(function(sh){
  ok(new RegExp('- ' + sh + ' —').test(tt.SHELF_RULES), 'shelves: "' + sh + '" says what belongs on it');
});
ok(/FAITH WINS/.test(tt.SHELF_RULES), 'shelves: ⭐ faith outranks everything, as he asked');
ok(/SUBJECT beats the format/.test(tt.SHELF_RULES), 'shelves: a football edit is Sport, not Sound');
ok(/Never invent a shelf/.test(tt.SHELF_RULES), 'shelves: nothing outside the nine');

/* ── ⭐ grounding: the key points are checked, not trusted ───── */
console.log('   every specific is checked against what was said');
const MAT = 'I apologize for not having a shirt on. Second Corinthians chapter 1 verses 3 and 4 reads praise be to the God and father of our Lord Jesus Christ, the father of compassion who comforts us in all our troubles.';
let g = tt._groundKeys([
  'Sharing Bible verses gives others a real experience of Jesus.',
  'Second Corinthians 1:3-4 says God is the father of compassion.',
  'In Philippians 4:13 Paul says he can do all things.',
  'A study by Harvard found 87% of people feel comforted.'
], MAT);
eq(g.keys.length, 2, 'grounding: the two supported points survive');
eq(g.dropped.length, 2, 'grounding: the two fabricated ones are removed');
ok(g.dropped.some(d => d.token === '87'), 'grounding: catches an invented statistic');
ok(g.dropped.some(d => /13/.test(d.token)), 'grounding: catches an invented verse reference');
ok(g.keys.some(k => /1:3-4/.test(k)),
   'grounding: ⭐ a TRUE point written "1:3-4" survives, though it was said "chapter 1 verses 3 and 4"');
// citation formatting is not fabrication — this was a real false positive
eq(tt._specifics('Second Corinthians 1:3-4 and John 3:16').nums.join(','), '16',
   'grounding: single digits are ignored, multi-digit runs are checked');
// never strip a card to nothing
g = tt._groundKeys(['Harvard says 87% agree'], MAT);
eq(g.keys.length, 1, 'grounding: ⭐ the last point is never removed');
ok(g.suspect, 'grounding: it is flagged suspect instead');
ok(/v\.suspect/.test(html), 'grounding: and the card says so');
ok(/removed for citing something the video never mentions/.test(html),
   'grounding: a shorter list is explained, never silent');

// ⚠️ BOTH false positives this guard produced against REAL live output. Each
// dropped a TRUE key point over spelling rather than substance, which is worse
// than the fabrication it exists to catch.
const COVER_MAT = 'Text on screen: Stranger - Jhene Aiko. Caption: Trying to post content again #coversong';
g = tt._groundKeys(['A cover of Jhene Aiko\u2019s song Stranger.', 'Produced by Beyonce\u2019s label.'], COVER_MAT);
eq(g.keys.length, 1, 'grounding: ⭐ a POSSESSIVE is grammar, not a different name');
ok(/Jhene Aiko/.test(g.keys[0]), 'grounding: "Jhene Aiko\u2019s" matches "Jhene Aiko"');
eq(g.dropped[0].token, 'Beyonce', 'grounding: an invented artist is still caught');
// Only capitalised, non-initial words count as names, so the lowercase words
// are ignored — and "Aiko\u2019s"/"Drake\u2019s" reduce to the names themselves.
eq(tt._specifics('He covered Drake\u2019s verse and Aiko\u2019s song').names.join(','), 'Drake,Aiko',
   'grounding: possessive markers are stripped before comparing');
// ⚠️ Deliberately NOT policed: the vocabulary his faith videos use constantly.
// Flagging "God" or "Jesus" as an unverified name would fight every sermon.
eq(tt._specifics('He said God and Jesus and Lord').names.length, 0,
   'grounding: faith vocabulary is never treated as a suspicious name');

/* ── receipts ───────────────────────────────────────────────── */
console.log('   each key point can show the words it came from');
const withT = { transcript: MAT, screen: [] };
const quote = im.quoteFor('God is the father of compassion who comforts us', withT);
ok(/father of compassion/.test(quote), 'receipts: finds the sentence the point came from');
ok(MAT.indexOf(quote) >= 0, 'receipts: ⭐ the quote is a VERBATIM slice of the transcript');
eq(im.quoteFor('something about tax returns and mortgages', withT), '', 'receipts: an unrelated point gets no quote');
eq(im.quoteFor('anything at all', { transcript:'', screen:[] }), '', 'receipts: no transcript, no quote');
ok(!/quote|source/i.test((im.quoteFor('x', withT) || 'x')), 'receipts: nothing is fabricated when there is no match');

/* ── the page still registers everything it must ────────────── */
console.log('   wiring that silently breaks if it drifts');
ok(/improve:tiktoks/.test(html), 'wiring: the page names improve:tiktoks');
ok(/syncedKeys:\[K_VID,K_TT,K_HAB,K_PROF,K_ACT\]/.test(html), 'wiring: all five keys are synced');
// ⭐ improve:actions is the DO-line outbox. A synced key that backup.html does
// not know about syncs perfectly and is silently UNRESTORABLE — the exact trap
// smoke-test.sh exists to catch, pinned here too because this one is new.
const bk = fs.readFileSync(path.join(__dirname, '..', 'backup.html'), 'utf8');
ok(/improve:actions/.test(bk), 'wiring: improve:actions is in the vault BUNDLES');
ok(/improve:actions/.test(html), 'wiring: the page names improve:actions');
const backup = fs.readFileSync(path.join(__dirname, '..', 'backup.html'), 'utf8');
ok(/'improve':\s*\{\s*keys:\[[^\]]*'improve:tiktoks'/.test(backup),
   'wiring: ⭐ improve:tiktoks is in backup BUNDLES — synced but unrestorable is the trap');
const sw = fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8');
ok(/improve\.html/.test(sw), 'wiring: improve.html is in the service worker CORE');
// every class the script toggles must exist in the stylesheet (constraint 12)
// ⭐ 'bad', 'old', 'big' and 'no-rail' are new; 'live' was REMOVED because it
// was toggled here and defined nowhere for the page's whole life.
['hidden','open','on','sel','pulse','bad','old','big','no-rail'].forEach(function(c){
  ok(new RegExp('\\.' + c + '[\\s,{:]').test(html), 'wiring: .' + c + ' is defined in CSS, not just toggled');
});
// The dead class must not come back.
ok(!/classList\.toggle\('live'/.test(html), 'wiring: ⭐ the no-op .live toggle is gone (constraint 12)');
// Four worlds means the pill must be a quarter wide, not a third.
ok(/width:calc\(\(100% - 6px\)\/4\)/.test(html), 'wiring: ⭐ the world pill is sized for FOUR segments');
eq((html.match(/data-world="/g) || []).length, 4, 'wiring: there are exactly four worlds');

/* ════════════════════════════════════════════════════════════
   THE YOUTUBE HALF IS NOW GRADED — the honesty asymmetry
   ════════════════════════════════════════════════════════════ */
console.log('\n── api/_youtube.js — it can finally say "there is no lesson here" ──');
const ytm = require(path.join(__dirname, '..', 'api', '_youtube.js'));
const M = (desc, ch) => ({ desc: desc || '', chapters: ch || [] });
const REAL = 'A practical routine for exam season built on spaced repetition and retrieval practice. ' +
             'We cover how to plan a week, how to recover from a bad one, and why rereading feels productive ' +
             'while doing almost nothing for recall at all in the long run for most students.';
eq(ytm.grade(M(''), 'spacing beats cramming, I tested it', 'x'), 'notes', 'yt grade: his own note outranks everything');
eq(ytm.grade(M('', ['Intro','Method','Outro']), '', 'x'), 'chapters', 'yt grade: a chapter list is a real outline');
eq(ytm.grade(M(REAL), '', 'x'), 'description', 'yt grade: a real write-up can carry a lesson');
eq(ytm.grade(M('Full match. Subscribe for more.'), '', 'x'), 'title',
   'yt grade: ⭐ a promo scrap is not material — it grades the same as a bare title');
eq(ytm.grade(M('', ['Intro','Outro']), '', 'x'), 'title', 'yt grade: two chapters is not an outline');
eq(ytm.grade(M(''), '', 'Real Madrid 5-1 Barcelona'), 'title', 'yt grade: ⭐ a bare title can NEVER reach a lesson grade');
// 'thin' belongs to the TikTok helper and must not leak into this one — the
// two use the same SRC map on the page, and a shared key would put TikTok's
// sentence ("nothing was said on screen") onto a YouTube card.
['notes','chapters','description','title','none'].forEach(function(g){
  ok(g !== 'thin', 'yt grade: ' + g + ' does not collide with TikTok\'s vocabulary');
});
eq(ytm.grade(M(''), '', '(untitled)'), 'none', 'yt grade: nothing at all is unreadable, not a lesson');
eq(ytm.grade(M(''), '', ''), 'none', 'yt grade: empty in, unreadable out');
// The grades that may produce key points are exactly the three with material.
['title','thin','none'].forEach(function(g){
  ok(['notes','chapters','description'].indexOf(g) < 0, 'yt grade: ' + g + ' is not lesson-eligible');
});
// The shelves are REQUIRED from the TikTok helper, not restated — one taxonomy.
ok(!/^\s*var SHELVES = \[/m.test(fs.readFileSync(path.join(__dirname,'..','api','_youtube.js'),'utf8')),
   'yt: ⭐ the shelves are required from _tiktok.js, never a second copy');
// Grounding runs on this path now, against the MATERIAL and not the prompt.
const ytsrc = fs.readFileSync(path.join(__dirname, '..', 'api', '_youtube.js'), 'utf8');
ok(/_groundKeys\(keys, mat\)/.test(ytsrc), 'yt: ⭐ key points are grounded against the material, not the instructions');
ok(/KIND: LESSON/.test(ytsrc) && /KIND: KEEPSAKE/.test(ytsrc), 'yt: the prompt declares a KIND to be read back');
// The courier must forward what distill worked out — it used to send text only.
const courier = fs.readFileSync(path.join(__dirname, '..', 'api', 'run-reminders.js'), 'utf8');
ok(/text: dout\.text, grade: dout\.grade, kind: dout\.kind/.test(courier),
   'courier: ⭐ the grade and kind reach the page (they were computed and dropped)');

/* a fabricated statistic dies on the YouTube path too */
const ytGround = tt._groundKeys([
  'Spacing your revision beats cramming it in at once',
  'A Harvard study found 87% of students improved'
], 'Title: How to study\n\nDescription:\nSpaced repetition and retrieval practice.');
eq(ytGround.keys.length, 1, 'yt grounding: the invented statistic is removed');
eq(ytGround.dropped[0].token, '87', 'yt grounding: it names the token that was never said');

/* ════════════════════════════════════════════════════════════
   THE PAGE — the rest of what changed
   ════════════════════════════════════════════════════════════ */
console.log('\n── improve.html — honesty, recall, practice ──');

console.log('   an unverified reading stops calling itself a lesson');
ok(im.isLegacyRead({ keypoints:'CORE: x' }), 'legacy: a reading with no kind and no grade is unverified');
ok(!im.isLegacyRead({ keypoints:'CORE: x', kind:'lesson' }), 'legacy: a declared kind is not legacy');
ok(!im.isLegacyRead({ keypoints:'CORE: x', grade:'transcript' }), 'legacy: ⭐ a graded TikTok is NOT legacy');
ok(!im.isLegacyRead({ keypoints:'CORE: x', rver:im.RVER }), 'legacy: the reading version clears it');
ok(!im.isLegacyRead({ ytId:'a' }), 'legacy: an unread video is not a legacy reading');
// ⭐ the whole point: his existing TikTok wall must NOT be re-read
im._set([], [], [{ id:'t', ttId:'1', keypoints:'CORE: x', kind:'keepsake', grade:'caption' }]);
eq(im._state().tiktoks.filter(im.isLegacyRead).length, 0,
   'legacy: ⭐⭐ an already-graded TikTok library is never queued for a re-read');
// but an old YouTube reading is
im._set([{ id:'v', ytId:'a', keypoints:'CORE: old' }], [], []);
eq(im.ytQueue().length, 1, 'legacy: an ungraded YouTube reading IS queued to be read again');
im._set([{ id:'v', ytId:'a', keypoints:'CORE: new', kind:'lesson', grade:'description', rver:im.RVER }], [], []);
eq(im.ytQueue().length, 0, 'legacy: a properly graded one is left alone');

console.log('   recall expands instead of nagging on a loop');
const D2 = 86400000, N2 = Date.now();
eq(im.STEPS[0], 3, 'recall: the first interval is 3 days');
ok(im.STEPS[im.STEPS.length-1] > im.STEPS[0], 'recall: the intervals expand');
const lesson = { id:'r1', kind:'lesson', keypoints:'CORE: x', distilledTs:N2-4*D2, revisitTs:N2-4*D2 };
im._set([lesson], [], []);
eq(im.recallQueue().length, 1, 'recall: a 4-day-old lesson is due at step 0');
im.recallKept(lesson);
eq(im.recallQueue().length, 0, 'recall: "still with me" pushes it away');
eq(lesson.recall, 1, 'recall: ⭐ the interval STEPS UP rather than repeating 5 days for ever');
im.recallLost(lesson);
eq(lesson.recall, 0, 'recall: ⭐ "I had forgotten it" resets to the shortest interval');
// a keepsake and an unverified reading are never recalled
im._set([{ id:'k', kind:'keepsake', keypoints:'CORE: an edit', distilledTs:N2-90*D2 }], [], []);
eq(im.recallQueue().length, 0, 'recall: a keepsake is never resurfaced');
im._set([{ id:'u', ytId:'a', keypoints:'CORE: unchecked', distilledTs:N2-90*D2 }], [], []);
eq(im.recallQueue().length, 0, 'recall: ⭐ an unverified reading is never recalled as if it were true');

console.log('   a DO line can leave the page');
im._set([], [], [], []);
const src = { id:'v9', ytId:'z', title:'A talk', url:'u', keypoints:'KIND: LESSON\nCORE: c\nDO: call one person today' };
im._set([src], [], [], []);
im.addAction(src, 'call one person today');
eq(im._state().actions.length, 1, 'practice: the DO line becomes a real item');
eq(im._state().actions[0].from, 'v9', 'practice: it remembers which video it came from');
im.addAction(src, 'call one person today');
eq(im._state().actions.length, 1, 'practice: ⭐ practising the same video twice does not duplicate it');
im.toggleAction(im._state().actions[0].id);
ok(im._state().actions[0].done, 'practice: it can be ticked off');
im.dropAction(im._state().actions[0].id);
eq(im._state().actions.length, 0, 'practice: and removed');
// ⭐ the exit must never write another page's store
ok(!/setItem\(\s*'habits:list'|lsSave\('habits:list'|'coach:focus'/.test(html),
   'practice: ⭐⭐ the Library never writes a store another page owns');
ok(/identity\.html\?habit=/.test(html), 'practice: the habit leaves through a LINK, so Identity writes its own row');
const ident = fs.readFileSync(path.join(__dirname, '..', 'identity.html'), 'utf8');
ok(/adoptFromQuery/.test(ident), 'practice: identity.html receives it');
ok(/history\.replaceState/.test(ident), 'practice: ⭐ the query is cleared so a refresh cannot add it twice');

console.log('   search reaches the transcript, in his alphabet');
eq(im.fold('Προσευχή'), im.fold('προσευχη'), 'search: ⭐ Greek accents fold — προσευχή matches προσευχη');
eq(im.fold('ΟΔΟΣ'), im.fold('οδος'), 'search: a final sigma is the same letter');
eq(im.fold('Café'), 'cafe', 'search: latin accents fold too');
const withTx = { id:'s1', ttId:'1', transcript:'He spoke about patience and the father of compassion', ts:1 };
ok(im.hay(withTx).indexOf('compassion') >= 0, 'search: ⭐ the TRANSCRIPT is searched (it never was)');
im._set([], [], [{ id:'s1', ttId:'1', keypoints:'CORE: x', caption:'faith and discipline together', ts:1 }]);
im._world('tt'); im._seek('faith discipline');
eq(im.pool().length, 1, 'search: ⭐ every term matches in any order, not one unbroken run');
im._seek('faith unicorn');
eq(im.pool().length, 0, 'search: a term that is not there still excludes it');
im._seek('');

console.log('   starred is a facet, not a state');
im._set([], [], [
  { id:'a', ttId:'1', keypoints:'K', kind:'lesson', grade:'transcript', star:true },
  { id:'b', ttId:'2', keypoints:'K', kind:'lesson', grade:'transcript' },
  { id:'c', ttId:'3', keypoints:'K', kind:'keepsake', grade:'caption' }
]);
im._world('tt'); im._star(false); im._stateSet('lesson');
eq(im.scoped().length, 2, 'facet: ⭐⭐ a STARRED lesson still appears under Lessons (it used to vanish)');
im._star(true);
eq(im.scoped().length, 1, 'facet: starred NARROWS the current view instead of replacing it');
im._stateSet('keep');
eq(im.scoped().length, 0, 'facet: starred + keepsakes is an honest empty, not a wrong list');
im._star(false); im._stateSet('');
eq(im.scoped().length, 3, 'facet: everything means everything');

console.log('   a save that did not happen says so');
const realSet = localStorage.setItem;
localStorage.setItem = function(){ const e = new Error('full'); e.name = 'QuotaExceededError'; throw e; };
eq(im.persist('improve:videos', [{ id:'x' }]), false, 'storage: ⭐⭐ a failed write REPORTS failure (it used to swallow it)');
ok(/full|saved/i.test(im.storageErr()), 'storage: and it says what went wrong, in words');
localStorage.setItem = realSet;
ok(im.persist('improve:videos', []), 'storage: a working write still succeeds');
ok(!im.storageErr(), 'storage: and clears the warning');

console.log('   the Room only shows what was actually checked');
im._set(
  [{ id:'r1', ytId:'a', keypoints:'KIND: LESSON\nCORE: One real idea', kind:'lesson', grade:'description', rver:im.RVER, concept:'Mind' }],
  [],
  [{ id:'r2', ttId:'1', keypoints:'KIND: KEEPSAKE\nCORE: A Lana edit', kind:'keepsake', grade:'caption', concept:'Sound' },
   { id:'r3', ttId:'2', keypoints:'CORE: unchecked leftovers' }],
  []);
const room = im.roomItems();
eq(room.length, 1, 'room: ⭐ only grounded LESSONS reach the Room');
eq(room[0].id, 'r1', 'room: and it is the checked one');

/* ════════════════════════════════════════════════════════════ */
setTimeout(function(){
  console.log('\n' + (fail ? '✗ ' : '✓ ') + pass + ' passed, ' + fail + ' failed\n');
  process.exit(fail ? 1 : 0);
}, 50);
