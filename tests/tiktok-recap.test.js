// THE TIKTOK RECAP — api/_recap.js + api/_tiktok.js + api/_model.js + improve.html
//
// The recap shipped for YouTube in als-v440 and stayed there for three
// versions, on the reasoning that the TikTok half already reads real ASR
// captions. That was true and still the wrong call: a caption track carries
// none of the text burned into the frame, none of what is SHOWN, and nothing
// at all when the clip has no speech. Hard constraint 15 — a guarantee that
// holds on one code path must hold on its twin — and this is the same file
// that earned the constraint in the first place.
//
// What this suite holds:
//
//   · ONE prompt and ONE parser, shared, not copied (constraint 15). If these
//     drift, the two worlds quietly become two products.
//   · `_recap.js` must require NOTHING, or the require graph closes a cycle
//     and Node answers with a half-built module instead of an error.
//   · A TikTok travels as BYTES, so its wall is SIZE, not duration. An
//     oversized video must be refused BEFORE it is downloaded, by name.
//   · A recap must be written to the store the video actually lives in.
//     `persist(K_VID, videos)` for a TikTok would not throw — it would repaint
//     correctly and lose the video on reload. Silent-empty with a delay.
//   · Watching costs real quota, so the background sweep must not reach it.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

let pass = 0, fail = 0;
function ok(cond, msg){ if(cond){ pass++; } else { fail++; console.error('  ✗ ' + msg); } }
function eq(a, b, msg){ ok(a === b, msg + '  (got ' + JSON.stringify(a) + ', want ' + JSON.stringify(b) + ')'); }

const ROOT = path.join(__dirname, '..');
const rc = require(path.join(ROOT, 'api', '_recap.js'));
const tt = require(path.join(ROOT, 'api', '_tiktok.js'));
const yt = require(path.join(ROOT, 'api', '_youtube.js'));
const model = require(path.join(ROOT, 'api', '_model.js'));

/* Constraint 19: search CODE, never the file as typed. Every comment in these
   files documents the trap by writing the bad pattern out, so a plain search
   finds the forbidden shape inside the prose warning against it. */
function stripComments(src){
  return src.replace(/\/\*[\s\S]*?\*\//g, ' ')
            .replace(/^\s*\/\/.*$/gm, ' ')
            .replace(/<!--[\s\S]*?-->/g, ' ');
}

/* ════════════════════════════════════════════════════════════
   1 · api/_recap.js — one contract, shared by both worlds
   ════════════════════════════════════════════════════════════ */
console.log('\n── api/_recap.js — the shared contract ──');

const recapSrc = fs.readFileSync(path.join(ROOT, 'api', '_recap.js'), 'utf8');
ok(!/\brequire\s*\(/.test(stripComments(recapSrc)),
  '_recap.js requires NOTHING — anything else can close a cycle with _tiktok/_youtube');

ok(typeof rc.sysFor === 'function', 'sysFor() is exported');
ok(typeof rc.parseRecap === 'function', 'parseRecap() is exported');
ok(typeof rc.recapWords === 'function', 'recapWords() is exported');
ok(typeof rc.unfence === 'function', 'unfence() is exported');

// ⭐ THE ANTI-DRIFT ASSERTION. If someone edits one world's prompt, this fails.
eq(yt.RECAP_SYS, rc.sysFor(tt.SHELF_RULES),
  'the YouTube recap prompt IS the shared one — not a copy of it');
ok(rc.sysFor(tt.SHELF_RULES).indexOf('Never invent a shelf') > 0,
  'the shelf rules are appended, so a recap can only file onto a shelf we own');
ok(rc.sysFor('X', true).length > rc.sysFor('X', false).length,
  'the SHORT variant adds a scale-down clause rather than being a second prompt');
ok(/under three minutes/i.test(rc.sysFor('X', true)),
  'the short clause names the threshold it applies to');
ok(!/under three minutes/i.test(rc.sysFor('X', false)),
  'a long video is never told to scale down');

// Neither world may bake the EMPTY clause into the page prompt — it is appended
// by the caller, so "there was nothing to say" stays a separate answer.
ok(rc.sysFor(tt.SHELF_RULES).indexOf('NOTHING:') < 0,
  'the EMPTY clause is appended by the caller, never baked into the page prompt');
ok(rc.EMPTY.indexOf('NOTHING:') > 0, 'the EMPTY clause is what carries NOTHING:');

// One parser, one format. Two parsers for one wire format is two formats with
// a delay — the taxonomy lesson from als-v434 applied to a reply shape.
const sample = 'SHELF: Mind\nCORE: One thing.\nOPEN:\nA then B.\nSECTION: First\nBody one.\nFACTS:\n- a fact\n- two';
const parsed = rc.parseRecap(sample);
eq(parsed.shelf, 'Mind', 'parseRecap reads the shelf');
eq(parsed.core, 'One thing.', 'parseRecap reads the core');
eq(parsed.sections.length, 1, 'parseRecap reads sections');
eq(parsed.facts.length, 2, 'parseRecap reads the facts');
eq(JSON.stringify(rc.parseRecap(sample)), JSON.stringify(yt._parseRecap(sample)),
  'the YouTube export and the shared parser are the same function');
eq(rc.parseRecap('SHELF: Sound\nNOTHING: it is a song.').nothing, 'it is a song.',
  'a NOTHING reply parses as a real answer, not as a failed recap');
eq(rc.unfence('```\nSHELF: Mind\n```'), 'SHELF: Mind', 'unfence strips a code fence');

/* ════════════════════════════════════════════════════════════
   2 · api/_model.js — a video can arrive as a URL or as BYTES
   ════════════════════════════════════════════════════════════ */
console.log('\n── api/_model.js — inline video ──');

ok(typeof model.GEM_INLINE_MAX_BYTES === 'number', 'the inline cap is exported so callers can enforce it');
ok(model.GEM_INLINE_MAX_BYTES <= 14 * 1024 * 1024,
  'the inline cap leaves room for base64 inflation (4/3) inside Google’s 20MB request limit');
ok(model.GEM_INLINE_MAX_BYTES > 5 * 1024 * 1024,
  'the cap is not so small that an ordinary TikTok is refused');

const urlBody = model._gemBody({ prompt:'p', url:'https://www.youtube.com/watch?v=abc' }, true);
const urlPart = urlBody.contents[0].parts.find(p => p.file_data);
ok(!!urlPart, 'a URL still becomes a file_data part (YouTube path unchanged)');
ok(!urlBody.contents[0].parts.some(p => p.inline_data), 'a URL never also sends bytes');

const bytesBody = model._gemBody({ prompt:'p', bytes: Buffer.from('hello'), mime:'video/mp4' }, true);
const inlinePart = bytesBody.contents[0].parts.find(p => p.inline_data);
ok(!!inlinePart, 'bytes become an inline_data part');
eq(inlinePart.inline_data.mime_type, 'video/mp4', 'the mime type is carried');
eq(Buffer.from(inlinePart.inline_data.data, 'base64').toString(), 'hello', 'the bytes survive base64 round-trip');
ok(!bytesBody.contents[0].parts.some(p => p.file_data), 'bytes never also send a file_uri');

// Mutually exclusive, URL wins — a caller that supplies both must not silently
// upload megabytes it did not mean to send.
const bothBody = model._gemBody({ prompt:'p', url:'https://www.youtube.com/watch?v=abc', bytes: Buffer.from('x') }, true);
ok(bothBody.contents[0].parts.some(p => p.file_data) && !bothBody.contents[0].parts.some(p => p.inline_data),
  'given both, the URL wins and no bytes are uploaded');

// fps is the caller's call — 0.2 is a default for long video, not a law.
eq(model._gemBody({ prompt:'p', bytes: Buffer.from('x') }, true).contents[0].parts
     .find(p => p.inline_data).video_metadata.fps, 0.2, 'fps defaults to 0.2');
eq(model._gemBody({ prompt:'p', bytes: Buffer.from('x'), fps:1 }, true).contents[0].parts
     .find(p => p.inline_data).video_metadata.fps, 1, 'a caller can ask for 1 fps');
// The trimmed retry (a 400 on the newer config fields) must drop fps with the
// rest, or the retry goes out carrying the field that was just refused.
ok(!model._gemBody({ prompt:'p', bytes: Buffer.from('x'), fps:1 }, false).contents[0].parts
     .find(p => p.inline_data).video_metadata,
  'the trimmed retry drops video_metadata along with the other newer fields');

/* ════════════════════════════════════════════════════════════
   3 · api/_tiktok.js — the bytes, and refusing an oversized one
   ════════════════════════════════════════════════════════════ */
console.log('\n── api/_tiktok.js — fetching the video ──');

ok(typeof tt.recap === 'function', 'recap() is exported');

const gears = tt._gearsOf({ bitrateInfo: [
  { GearName:'normal_540_0',      PlayAddr:{ DataSize: 23.5*1048576, UrlList:['u1'] } },
  { GearName:'adapt_540_1',       PlayAddr:{ DataSize:  7.3*1048576, UrlList:['u2'] } },
  { GearName:'adapt_lower_720_1', PlayAddr:{ DataSize:  9.2*1048576, UrlList:['u3'] } }
]});
eq(gears.length, 3, 'every offered encoding is collected');
eq(gears[0].name, 'adapt_540_1', 'gears come back SMALLEST first — the cheapest that fits is the one we send');
ok(gears[0].size < gears[1].size && gears[1].size < gears[2].size, 'the sort is by real byte size');

// A gear with no URL is useless and must not be offered as a choice.
eq(tt._gearsOf({ bitrateInfo:[{ GearName:'x', PlayAddr:{ DataSize:1, UrlList:[] } }] }).length, 0,
  'a gear with no URL is dropped, not returned as an unfetchable option');

// Absent bitrateInfo → the plain playAddr is the fallback, never nothing.
const fb = tt._gearsOf({ playAddr:'http://x/v.mp4', size: 1234 });
eq(fb.length, 1, 'playAddr is the fallback when bitrateInfo is absent');
eq(fb[0].size, 1234, 'the fallback carries the video size');
eq(tt._gearsOf({}).length, 0, 'a video with no source at all returns nothing to pick from');

// An unknown size sorts LAST but is still offered — it might be the only one,
// and Content-Length is checked before anything is buffered anyway.
const mixed = tt._gearsOf({ bitrateInfo:[
  { GearName:'unknown', PlayAddr:{ DataSize:0, UrlList:['u1'] } },
  { GearName:'small',   PlayAddr:{ DataSize:100, UrlList:['u2'] } }
]});
eq(mixed[0].name, 'small', 'a known small size is preferred over an unknown one');
eq(mixed.length, 2, 'an unknown size is still kept as a last resort');

eq(tt._cookiesOf({ headers:{ getSetCookie:()=>['ttwid=abc; Path=/; HttpOnly','tt_csrf=z; Path=/'] } }),
  'ttwid=abc; tt_csrf=z', 'cookies are reduced to name=value pairs for the CDN request');
eq(tt._cookiesOf({ headers:{ get:()=>null } }), '', 'no cookies is an empty string, never a crash');

ok(/MB$/.test(tt._mib(7.25*1048576)), 'sizes are reported in MB, for a sentence a human reads');
eq(tt._mib(13*1048576), '13.0 MB', 'the cap renders as a real number');

// The budget is shared by the download AND the watching — constraint 21.
ok(tt.TT_RECAP_BUDGET_MS <= 50000,
  'the whole recap budget sits inside the platform’s 60s function cap');
ok(tt.TT_MIN_WATCH_MS > 0 && tt.TT_MIN_WATCH_MS < tt.TT_RECAP_BUDGET_MS,
  'there is a floor below which we do not start watching at all');

const ttSrc = stripComments(fs.readFileSync(path.join(ROOT, 'api', '_tiktok.js'), 'utf8'));
ok(/deadlineAt/.test(ttSrc), 'the deadline is stamped once and passed down, not restarted per request');
ok(/budgetMs\s*:\s*left/.test(ttSrc),
  'what REMAINS of the budget is handed to watch() — a fresh 48s envelope after a slow download would guarantee the 504 it prevents');
ok(/ftyp/.test(ttSrc),
  'the MP4 magic is checked — TikTok serves HTML error pages with HTTP 200, and "we failed to read it" must not look like data');
ok(/content-length/i.test(ttSrc),
  'the real Content-Length is checked, not only TikTok’s own DataSize claim');
// Constraint 15 again: the recap must use the shared parser, not its own.
ok(/rc\.parseRecap/.test(ttSrc), 'the TikTok recap parses with the SHARED parser');
ok(/rc\.sysFor/.test(ttSrc), 'the TikTok recap prompts with the SHARED prompt');
ok(/fps\s*:\s*1\b/.test(ttSrc),
  'a TikTok is watched at 1 fps — its argument is often written on the screen, and 0.2 fps would miss it');
// Clipping cannot shrink an upload, so segmenting must NOT be cargo-culted here.
ok(!/planSegments|recapSegment|recapMerge/.test(ttSrc),
  'no segmenting on the TikTok path — its wall is SIZE, and a clip still uploads the whole file');

/* ════════════════════════════════════════════════════════════
   4 · the courier — ?ttrecap
   ════════════════════════════════════════════════════════════ */
console.log('\n── api/run-reminders.js — the ?ttrecap branch ──');

const courier = fs.readFileSync(path.join(ROOT, 'api', 'run-reminders.js'), 'utf8');
const courierCode = stripComments(courier);
ok(/req\.query\.ttrecap !== undefined/.test(courierCode), 'the ?ttrecap branch exists');
ok(/tt\.recap\(/.test(courierCode), 'it calls the TikTok recap, not the YouTube one');

const ttBranch = courierCode.slice(
  courierCode.indexOf('req.query.ttrecap !== undefined'),
  courierCode.indexOf('req.query.ytorganize !== undefined'));
ok(ttBranch.length > 200, 'the branch body was found');
ok(/413/.test(ttBranch), 'an oversized video answers 413 — its own status, not a generic 502');
ok(/404/.test(ttBranch), 'a deleted or private video answers 404');
ok(/501/.test(ttBranch), 'a missing GEMINI_API_KEY is 501 — a setup problem, never confused with a busy model');
ok(/503/.test(ttBranch), 'an overloaded Google model is 503');
ok(/504/.test(ttBranch), 'a timeout is 504');
// Every failure must carry a sentence. A status code is not a message —
// constraint 10 wearing a number, and how the YouTube recap shipped saying
// "The server said 504."
ok((ttBranch.match(/message\s*:/g) || []).length >= 2, 'failures carry real sentences, not just codes');
ok(!/for\s*\(|while\s*\(/.test(ttBranch),
  'the courier does NOT loop over parts — one TikTok is one ordinary request');
// It must never be swept. Watching costs real quota.
const sweepish = courierCode.slice(0, courierCode.indexOf('req.query.ytrecap !== undefined'));
ok(!/ttrecap/.test(sweepish), '?ttrecap is not reachable from anything that runs unattended');

/* ════════════════════════════════════════════════════════════
   5 · improve.html — the page
   ════════════════════════════════════════════════════════════ */
console.log('\n── improve.html — both worlds can be watched ──');

const html = fs.readFileSync(path.join(ROOT, 'improve.html'), 'utf8');
const code = stripComments(html);

function makeEl(){
  const el = {
    _html:'', style:{ setProperty(){} }, dataset:{}, open:false,
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
ok(typeof im.canRecap === 'function', 'canRecap() is exposed');

const ytVid  = { id:'a', ytId:'abc', url:'https://www.youtube.com/watch?v=abc' };
const ttVid  = { id:'b', ttId:'123', url:'https://www.tiktok.com/@x/video/123' };
const ttPend = { id:'c', ttId:'',    url:'https://www.tiktok.com/@x/video/999', pending:true };
const bare   = { id:'d', url:'https://example.com/x' };

ok(im.canRecap(ytVid),  'a YouTube video can be recapped — unchanged');
ok(im.canRecap(ttVid),  '⭐ a resolved TikTok can now be recapped too');
ok(!im.canRecap(ttPend),'a PENDING TikTok cannot — it has no ttId yet, so it is not confirmed');
ok(!im.canRecap(bare),  'something that is neither is never offered a recap');
ok(im.isTikTok(ttPend), 'a pending TikTok is still a TikTok — the empty-ttId trap from als-v426');

// The parser on the page and the parser on the server must agree.
const pageParsed = im.rcParse ? im.rcParse(sample) : null;
if (pageParsed) {
  eq(pageParsed.core, rc.parseRecap(sample).core, 'the page parser and the server parser read the same core');
  eq(pageParsed.facts.length, rc.parseRecap(sample).facts.length, 'and the same number of facts');
}

/* ⭐ THE SOURCE LINE MUST TELL THE TRUTH PER WORLD.
   `watched` is the one grade both worlds reach, and the YouTube sentence
   contrasts the recap with the creator's DESCRIPTION — which is simply not
   what a TikTok reading is built from. This line exists to say where a reading
   came from, so a wrong one here is worse than none. */
const wYt = im.srcLine({ id:'a', ytId:'abc', grade:'watched' });
const wTt = im.srcLine({ id:'b', ttId:'1', url:'https://www.tiktok.com/@x/video/1', grade:'watched' });
ok(wYt && wTt, 'both worlds get a source line for a watched video');
ok(wYt !== wTt, 'they are DIFFERENT sentences — the same one would be false on a TikTok');
ok(/description/i.test(wYt), 'the YouTube line contrasts the recap with the description it replaces');
ok(!/description/i.test(wTt), 'the TikTok line never claims it replaced a description — it replaced captions');
ok(/screen/i.test(wTt), 'the TikTok line names what the captions could not carry: the screen');
eq(im.srcLine({ id:'x' }), '', 'no grade renders nothing at all, never an empty box');
eq(im.srcLine({ id:'y', ttId:'1', grade:'transcript' }), im.SRC.transcript,
  'every other grade still reads straight from the shared SRC map');

/* ⚠️ FOUND BY RENDERING, INVISIBLE TO EVERY ASSERTION ABOVE IT.
   Three surfaces name where a reading came from — the offer copy, the
   disclosure label over the folded summary, and the source line — and the
   first pass gave a per-world sentence to two of them. The pane rendered
   "The earlier summary, from the description" over a TikTok, whose earlier
   summary is written from TikTok's own captions. Count them, so a fourth
   surface cannot appear without somebody looking. */
const worldWords = (code.match(/from the description/g) || []).length;
const saidWords  = (code.match(/from what was said/g) || []).length;
ok(worldWords >= 2, 'the description wording still exists for the YouTube world');
ok(saidWords >= 1, 'and every one of those surfaces has a TikTok twin');
ok(/isTikTok\(v\)\?'The earlier summary, from what was said'/.test(code.replace(/\s+/g,'')) ||
   /The earlier summary, from what was said/.test(code),
  '⭐ the folded-summary label says where a TIKTOK reading came from, not "the description"');

// The routing, and the store.
ok(/ttrecap/.test(code), 'the page knows the ?ttrecap endpoint');
ok(/isTikTok\(v\)\s*\)\s*return postRecap\(\{\s*url:/.test(code.replace(/\s+/g,' ')) ||
   /askRecap[\s\S]{0,260}ttrecap/.test(code),
  'askRecap() sends a TikTok to ?ttrecap with its URL, not a videoId');

const runRecapBody = code.slice(code.indexOf('async function runRecap(id)'),
                               code.indexOf('function openRecap('));
ok(runRecapBody.length > 400, 'found runRecap()');
/* ⚠️⚠️ THE ONE THAT WOULD HAVE BEEN SILENT. A hardcoded `persist(K_VID, videos)`
   writes a TikTok recap into the YouTube array: nothing throws, the card
   repaints from memory, and the video is gone on the next reload. */
ok(!/persist\(K_VID/.test(runRecapBody),
  '⭐ runRecap never hardcodes the YouTube store — a TikTok recap would be written to the wrong array and lost on reload');
ok(/saveItem\(/.test(runRecapBody),
  'it persists through saveItem(), which asks isTikTok() and writes the store the item lives in');
ok(/canRecap\(v\)/.test(runRecapBody), 'the gate is canRecap(), not a hardcoded ytId check');
ok(/grade\s*=\s*'watched'/.test(runRecapBody), 'a recapped video is graded watched in both worlds');

// The sweep must never watch anything — same cost rule as the YouTube half.
const sweepBody = code.slice(code.indexOf('async function ttSweep'),
                             code.indexOf('async function ttSweep') + 2600);
ok(sweepBody.length > 100, 'found the TikTok sweep');
ok(!/runRecap\(/.test(sweepBody),
  'the background TikTok sweep never calls runRecap — watching costs real quota and is on demand only');

console.log('\n' + (fail ? '✗ ' : '✓ ') + 'tiktok-recap: ' + pass + '/' + (pass + fail) + ' assertions');
process.exit(fail ? 1 : 0);
