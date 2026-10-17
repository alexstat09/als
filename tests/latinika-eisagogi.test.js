/* ═══════════════════════════════════════════════════════════════════
   tests/latinika-eisagogi.test.js — Η ΕΙΣΑΓΩΓΗ ΤΩΝ ΛΑΤΙΝΙΚΩΝ (το τηλεσκόπιο)

   ⭐ ΓΙΑΤΙ ΥΠΑΡΧΕΙ. Δική του εντολή: «δεν επιτρέπεται να αλλάξεις ούτε μια
   λέξη ΤΙΠΟΤΑ». Η σελίδα από την als-v638 ΠΑΡΑΓΕΤΑΙ από το tools/eisagogi/
   (eisagogi.json + eisagogi.tpl → build.js). Κάθε σημάδι — πρόσωπο, έργο,
   όρος, χρονολογία, ζεύγος Ελλάδα→Ρώμη — είναι ΔΕΙΚΤΗΣ σε θέση της πηγής.

   Α · ΣΤΑΤΙΚΑ (node): η πηγή ταξιδεύει αυτούσια· ο validator δεν βρίσκει
       τίποτα· η σελίδα ΕΙΝΑΙ ό,τι βγάζει το build (δεν γράφτηκε με το χέρι)·
       ⭐ οι θέσεις χαρακτήρων ανά κεφάλαιο είναι ΙΔΙΕΣ με την als-v579, άρα
       οι πλαγιότιτλοι/ορισμοί του μένουν εκεί που τους έβαλε· οι γραφείς·
       η ταφόπλακα· το φύλλο στυλ· ο φρουρός 7b.
   Β · ΑΛΗΘΙΝΟ CHROME (CDP), χωρίς sync: τρέχει η σελίδα, και οι 75 παράγραφοι
       βρίσκονται ΣΤΗΝ ΟΘΟΝΗ· γραμματοσειρές ανά στοιχείο· σημειώσεις στις
       παλιές θέσεις· «Σκέπασε»· πορτρέτο· χάρακας· μηδέν οριζόντια κύλιση
       από 1440 ως 393 (CDP) ΚΑΙ σε iframe 393.
   ═══════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const http = require('http');
const { spawn } = require('child_process');

const ROOT = path.join(__dirname, '..');
const L = require(path.join(ROOT, 'tools', 'eisagogi', 'lib.js'));
const { build } = require(path.join(ROOT, 'tools', 'eisagogi', 'build.js'));
let fail = 0, pass = 0;
function ok(cond, msg, extra){ if (cond){ pass++; console.log('  ✓ ' + msg); }
  else { fail++; console.log('  ✗ ' + msg + (extra === undefined ? '' : '   ' + JSON.stringify(extra).slice(0, 400))); } }
function eq(a, b, msg){ ok(a === b, msg + (a === b ? '' : `  (${a} ≠ ${b})`)); }
const section = t => console.log('\n' + t);

const PAGE = 'latinika-eisagogi.html';
const html = fs.readFileSync(path.join(ROOT, PAGE), 'utf8');
const source = fs.readFileSync(path.join(__dirname, 'latinika-eisagogi.source.txt'), 'utf8');
const SRC = L.readSource();
const D = L.load();

section('Α1 · Η ΠΗΓΗ ΤΑΞΙΔΕΥΕΙ ΑΥΤΟΥΣΙΑ ΚΑΙ ΚΑΘΕ ΣΗΜΑΔΙ ΔΕΙΧΝΕΙ ΣΕ ΑΥΤΗΝ');
eq(SRC.length, 75, '75 παράγραφοι στην πηγή');
const m = html.match(/var EIS = (\{[\s\S]*?\});\n<\/script>/);
ok(!!m, 'η σελίδα κουβαλάει το υλικό (EIS)');
const EIS = m ? JSON.parse(m[1]) : { src: [] };
eq(JSON.stringify(EIS.src), JSON.stringify(SRC), 'το src της σελίδας είναι ΑΚΡΙΒΩΣ η πηγή, γραμμή-γραμμή');
const errs = L.validate(D, SRC);
eq(errs.length, 0, 'ο validator δεν βρίσκει τίποτα εκτός πηγής');
errs.slice(0, 10).forEach(e => console.log('      ✗ ' + e));
eq(html, build(), '⛔ η σελίδα ΕΙΝΑΙ η έξοδος του build — δεν γράφτηκε με το χέρι (τρέξε node tools/eisagogi/build.js)');

section('Α2 · Ο VALIDATOR ΔΑΓΚΩΝΕΙ (μεταλλάξεις)');
{
  const mut = (name, f) => { const d = L.load(); f(d); ok(L.validate(d, SRC).length > 0, 'αρνείται: ' + name); };
  mut('λέξη που δεν υπάρχει', d => { d.marks['52'][3].t = 'Θεόκριτος'; });
  mut('λάθος έτος', d => { d.marks['43'][5].y = -45; });
  mut('λάθος αιώνας', d => { d.marks['34'][1].y = -350; });
  mut('ζεύγος χωρίς σημάδι', d => { d.pairs.push({ gr: { l: 52, t: 'κλασικών' }, ro: { l: 52, t: 'Οράτιος' } }); });
  mut('ελληνικά σε λατινικό όρο', d => { d.marks['47'][2] = { t: 'ρωμαϊκή ειρήνη', k: 'la' }; });
  mut('ετικέτα πίνακα που δεν ανοίγει το κελί', d => { d.compare.rows[0].label = 'πολιτεία'; });
  mut('παράγραφος που χάθηκε', d => { d.chapters[5].blocks = d.chapters[5].blocks.filter(b => b.l !== 48); });
  mut('παράγραφος δύο φορές', d => { d.chapters[5].blocks.push({ b: 'p', l: 48 }); });
  mut('επικάλυψη σημαδιών', d => { d.marks['52'].push({ t: 'ο Κικέρων τους', k: 'st' }); });
}

section('Α3 · ⭐ ΟΙ ΣΗΜΕΙΩΣΕΙΣ ΤΟΥ ΜΕΝΟΥΝ ΣΤΗ ΘΕΣΗ ΤΟΥΣ');
/* Οι πλαγιότιτλοι/ορισμοί αποθηκεύονται ως {s,e} μέσα στο κείμενο του
   κεφαλαίου. Τα sha είναι του κειμένου όπως το έχτιζε η als-v579 (μετρημένα
   πάνω στην έκδοση εκείνη): αν αλλάξει ΕΝΑΣ χαρακτήρας ή η σειρά, κάθε
   σημείωσή του μετακινείται σιωπηλά πάνω σε άλλες λέξεις. */
const V579 = { glossa: 'c4970a582a321a83', genesi: '72e4c58ceaec74bb', epoxes: '983d30049b8c1afc',
  genika: 'ab3d6781c9a20ffd', proklasiki: 'd758bb729575bf98', klasiki: '2fc6a78df6cff0c3',
  republic: '70c12cb011e21f13', avgousteioi: 'd734a7dd6194457d' };
D.chapters.forEach(c => {
  const sha = crypto.createHash('sha256').update(L.chapterFull(D, SRC, c)).digest('hex').slice(0, 16);
  eq(sha, V579[c.id], 'κεφ. ' + c.n + ': ίδιο κείμενο-συντεταγμένες με την als-v579');
});
eq(D.chapters.map(c => c.id).join(','), 'glossa,genesi,epoxes,genika,proklasiki,klasiki,republic,avgousteioi',
   'οκτώ κεφάλαια, ίδια ids (τα κλειδιά eis:notes:<id> δεν αλλάζουν)');

section('Α4 · ⛔ ΚΑΜΙΑ ΔΙΚΗ ΜΟΥ ΛΕΞΗ ΣΤΑ ΣΗΜΑΔΙΑ ΚΑΙ ΣΤΙΣ ΛΕΖΑΝΤΕΣ');
eq(D.figs.length, 7, 'επτά λεζάντες εικόνων, ως γραμμές της πηγής');
D.figs.forEach(l => ok(SRC[l - 1].indexOf(' · ') < 0, 'λεζάντα αυτούσια και ασυγχώνευτη: «' + SRC[l - 1] + '»'));
eq(D.people.length, 15, 'δεκαπέντε πορτρέτα — ένα για κάθε συγγραφέα με δική του παράγραφο');
D.people.forEach(p => (p.works || []).forEach(w => ok(!!(w.gr || w.la), 'έργο του ' + p.id + ' = δείκτης στην πηγή')));
/* οι επικεφαλίδες είναι των σημειώσεών του, όπως στην als-v579 — κλειδωμένες */
const HEADS = ['Η λατινική γλώσσα', 'Η γένεση της ρωμαϊκής λογοτεχνίας', 'Εποχές της ρωμαϊκής λογοτεχνίας',
  'Γενικά χαρακτηριστικά της ρωμαϊκής λογοτεχνίας', 'Προκλασική εποχή', 'Κλασική εποχή',
  'Η ρεπουμπλικανική περίοδος ή οι χρόνοι του Κικέρωνα', 'Οι Αυγούστειοι χρόνοι'];
eq(D.chapters.map(c => c.title).join('|'), HEADS.join('|'), 'οι τίτλοι κεφαλαίων είναι ακριβώς οι δικοί του');
const SUBS = new Set(['Γενικά χαρακτηριστικά', 'Πεζογραφία', 'Ποίηση', 'Κωμωδία', 'Τραγωδία', 'Έπος', 'Σάτιρα']);
D.chapters.forEach(c => c.blocks.forEach(b => { if (b.h) ok(SUBS.has(b.h), 'υπότιτλος από τις σημειώσεις: «' + b.h + '»'); }));
D.people.forEach(p => ok(SUBS.has(p.genre), 'το «είδος» του ' + p.id + ' είναι υπότιτλος των σημειώσεων'));
ok(D.pairs.length >= 7, D.pairs.length + ' ζεύγη Ελλάδα → Ρώμη, όλα με τα δύο άκρα στην ίδια πρόταση');

section('Α5 · Η ΣΕΛΙΔΑ ΓΡΑΦΕΙ ΜΟΝΟ ΤΑ ΔΙΚΑ ΤΗΣ, ΚΑΙ ΚΑΝΕΝΑΣ ΑΝΑΓΝΩΣΤΗΣ ΔΕΝ ΓΡΑΦΕΙ');
ok(html.indexOf("var READ_KEY = 'eisagogi:v1'") > 0, 'το «το διάβασα» είναι το eisagogi:v1');
ok(html.indexOf("var NKEY = 'eis:notes:'") > 0, 'οι σημειώσεις μένουν στο πρόθεμα eis:notes:');
ok(/initCloudSync\(\{\s*appKey:\s*'eisagogi'/.test(html.replace(/\s+/g, ' ')), 'σηκώνει engine με δικό της appKey');
ok(/syncedPrefixes:\s*\[\s*NKEY\s*\]/.test(html), 'συγχρονίζει το πρόθεμα των σημειώσεων');
ok(!/syncedKeys[^\]]*eisagogi:v1/.test(html.replace(/\s+/g, ' ')), '⛔ το «το διάβασα» ΔΕΝ μπαίνει στο sync (σταθ. 31)');
{
  const bk = fs.readFileSync(path.join(ROOT, 'backup.html'), 'utf8');
  ok(/'eisagogi':\s*\{[^}]*'eis:notes:'/.test(bk.replace(/\s+/g, ' ')), 'το πρόθεμα είναι στα BUNDLES του backup.html');
}
const CODE = html.replace(/\/\*[\s\S]*?\*\//g, '');
{
  const sites = CODE.match(/localStorage\.setItem\(/g) || [];
  eq(sites.length, 4, 'τέσσερις γραφείς: οι σημειώσεις, οι δύο της ταφόπλακας, το «το διάβασα»');
  ['function render(', 'function renderLine(', 'function renderChapter(', 'function paintBar(', 'function paintSummary(',
   'function paintTables(', 'function portraitHTML(', 'function tick('].forEach(fn => {
    const a = CODE.indexOf(fn);
    ok(a > 0, 'υπάρχει ο ' + fn.slice(9, -1));
    if (a < 0) return;
    const b = CODE.indexOf('\nfunction ', a + 1);
    ok(CODE.slice(a, b < 0 ? a + 4000 : b).indexOf('localStorage.setItem') < 0, '⛔ ο ' + fn.slice(9, -1) + ' δεν ΓΡΑΦΕΙ (als-v436)');
  });
}
/* ΣΤΑΘ. 61 — μία και μόνο μία συνάρτηση σβήνει σημείωση, και σφραγίζει */
{
  const RE = /notes\[[^\]]+\]\s*=\s*[^;]*\.filter\(|NOTES\[[^\]]+\]\[[^\]]+\]\s*=\s*[^;]*\.filter\(|\.splice\(/g;
  const cuts = CODE.match(RE) || [];
  ok(cuts.length > 0, 'ο φρουρός του σβησίματος όντως πιάνει κάτι (θετικός έλεγχος)');
  const a = CODE.indexOf('function removeNote(');
  ok(a > 0, 'υπάρχει η removeNote');
  const only = CODE.slice(a, CODE.indexOf('\nfunction ', a + 1));
  eq(cuts.length, (only.match(RE) || []).length, '⛔ καμία αφαίρεση σημείωσης δεν ζει ΕΞΩ από την removeNote');
  ok(only.indexOf('tombNote(') > 0, 'η removeNote σφραγίζει ταφόπλακα');
  ok(only.indexOf('saveNotes(') > 0 && only.indexOf('saveNotes(') < only.indexOf('tombNote('),
     'η ταφόπλακα μπαίνει ΜΕΤΑ από επιβεβαιωμένη εγγραφή (als-v424)');
}
ok(/var back = JSON\.parse/.test(html), 'η tombNote ξαναδιαβάζει πριν πει «σφράγισα» (σταθ. 10)');
ok(html.indexOf('function untombNotes(') > 0, 'η αναίρεση σηκώνει την ταφόπλακα');

section('Α6 · ΤΟ ΦΥΛΛΟ ΣΤΥΛ: ΓΕΝΝΙΕΤΑΙ ΟΡΑΤΟ, ΜΟΝΟ max-width, ΚΑΘΕ [hidden] ΕΧΕΙ ΚΑΝΟΝΑ');
const CSS = html.slice(html.indexOf('<style>'), html.indexOf('</style>')).replace(/\/\*[\s\S]*?\*\//g, '');
ok(!/opacity\s*:\s*0(?![.\d])/.test(CSS), '⛔ κανένα opacity:0 — τίποτα δεν γεννιέται σβηστό (σταθ. 39)');
ok(html.indexOf('IntersectionObserver') < 0, '⛔ κανένας παρατηρητής — τίποτα δεν περιμένει κώδικα για να φανεί');
ok(!/@media\s*\(\s*min-width/.test(CSS), '⛔ κανένα @media(min-width) — σταθ. 51');
ok(/\.wrap\{max-width:1180px/.test(CSS), 'κέλυφος 1180px');
ok(/--col:64ch/.test(CSS), 'πρόζα 64ch');
['.world[hidden]', '.nums[hidden]', '.banner[hidden]', '.cv-hint[hidden]', '.selbar[hidden]'].forEach(sel =>
  ok(CSS.indexOf(sel) >= 0, 'ο κανόνας ' + sel + ' υπάρχει (σταθ. 12)'));
ok(/dialog\.ptd\{position:fixed/.test(CSS) && !/dialog\.ptd\{[^}]*display:/.test(CSS),
   'ο διάλογος κεντράρεται ρητά και ΔΕΝ δηλώνει display έξω από [open] (σταθ. 4)');
ok(/\.cov \.cvable:not\(\.rv\)\{color:transparent/.test(CSS), '«Σκέπασε» = κενά μέσα στο κείμενο, χωρίς opacity');

section('Α7 · ⭐⭐ ΦΡΟΥΡΟΣ 7b — ΕΛΛΗΝΙΚΗ SERIF ΣΤΑ ΕΛΛΗΝΙΚΑ, ΛΑΤΙΝΙΚΗ ΜΟΝΟ ΣΤΑ ΛΑΤΙΝΙΚΑ (σταθ. 43)');
{
  const RULES = CSS.split('}').map(ch => { const i = ch.indexOf('{'); return i < 0 ? null : { sel: ch.slice(0, i).trim(), body: ch.slice(i + 1) }; }).filter(Boolean);
  const decl = sel => { const r = RULES.find(x => x.sel === sel || x.sel.split('\n').pop().trim() === sel); return r ? r.body : null; };
  const GREEK_SERIF = ['.cover h1', '.cover .lead', '.ch-h h2', '.sub h3', '.gen h4', '.m-gr', '.m-ro', '.m-wk', '.m-era',
    '.port-h .nm', '.th .tg', '.th .tr', '.legend .k b', '.cmp .hd b', '.sum h2', '.tb-h h2', '.ruler .now'];
  const LATIN_SERIF = ['.m-la', '.meet .big', '.duo .l', '.plate .l', '.ruler .now .nb', '.port-h .cnt b'];
  GREEK_SERIF.forEach(sel => {
    const d = decl(sel);
    ok(!!d && /font-family:var\(--f-gr\)/.test(d) && !/--f-lat/.test(d), 'ο «' + sel + '» φοράει την ΕΛΛΗΝΙΚΗ στοίβα, ποτέ την Instrument Serif');
  });
  LATIN_SERIF.forEach(sel => {
    const d = decl(sel);
    ok(!!d && /font-family:var\(--f-lat\)/.test(d), 'ο «' + sel + '» φοράει τη ΛΑΤΙΝΙΚΗ στοίβα');
  });
  ok(!/--f-gr:[^;]*Georgia/i.test(CSS), '⛔ η ελληνική στοίβα δεν έχει Georgia ούτε ως fallback');
  /* ⛔ ΚΑΝΕΝΑΣ άλλος κανόνας δεν φοράει την Instrument Serif */
  const ALLOW = new Set(LATIN_SERIF.concat(['.ch-h h2 sup', '.fn sup,.row sup', '.row.ni p::before', '.facts .no .nb', ':root']));
  const stray = RULES.filter(r => /var\(--f-lat\)/.test(r.body) && !ALLOW.has(r.sel.split('\n').pop().trim())).map(r => r.sel);
  eq(stray.length, 0, '⛔ καμία άλλη δήλωση με Instrument Serif' + (stray.length ? ' — ' + stray.join(' | ') : ''));
}

section('Α8 · ΚΑΛΩΔΙΩΣΗ');
ok(html.indexOf('href="latinika.html"') > 0 && /class="back"[^>]*>&#8592; Λατινικά/.test(html), 'έξοδος με λέξη: «← Λατινικά» (σταθ. 64)');
ok(fs.readFileSync(path.join(ROOT, 'latinika.html'), 'utf8').indexOf('latinika-eisagogi.html') > 0, 'η latinika.html ανοίγει την εισαγωγή');
ok(fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8').indexOf("'" + PAGE + "'") > 0, 'η σελίδα είναι στο CORE του sw.js');
ok(!fs.existsSync(path.join(ROOT, 'latinika-eisagogi-demo.html')), 'το demo δεν ζει στη ρίζα (δεν σερβίρεται)');

/* ══════════════════════════════════════════════════════════════════
   Β · ΑΛΗΘΙΝΟ CHROME — ο server ΣΒΗΝΕΙ sync.js/supabase (σταθ. 8)
   ══════════════════════════════════════════════════════════════════ */
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.css': 'text/css' };
let syncHits = 0;
const server = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  if (/sync|supabase|topbar|nova/i.test(u)) { syncHits++; res.writeHead(200, { 'Content-Type': MIME['.js'] }); res.end('/* stripped by harness */'); return; }
  if (u === '/frame.html') { res.writeHead(200, { 'Content-Type': MIME['.html'] }); res.end('<!doctype html><meta charset=utf-8><body style="margin:0;background:#000"><iframe id=f src="/' + PAGE + '?frame=1" style="width:393px;height:860px;border:0"></iframe>'); return; }
  const f = path.join(ROOT, u);
  if (f.indexOf(ROOT) !== 0 || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end('no'); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
  res.end(fs.readFileSync(f));
});
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SHOTS = process.env.EIS_SHOTS || '';
const sleep = n => new Promise(r => setTimeout(r, n));

(async () => {
  if (!fs.existsSync(CHROME)) { ok(false, 'δεν βρέθηκε Chrome — ΔΕΝ έτρεξε το Β, δεν πέρασε τίποτα'); return finish(); }
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const HTTP = server.address().port, BASE = 'http://127.0.0.1:' + HTTP + '/';
  const PORT = 9300 + (process.pid % 500);
  const chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=' + PORT, '--no-first-run',
    '--user-data-dir=/tmp/cdp-eis-test-' + process.pid, '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });
  let info = null;
  for (let i = 0; i < 60; i++) { try { info = await (await fetch('http://127.0.0.1:' + PORT + '/json/version')).json(); break; } catch (e) { await sleep(300); } }
  if (!info) { ok(false, 'το Chrome δεν άνοιξε θύρα CDP'); chrome.kill(); return finish(); }
  let id = 0; const pend = new Map(); const exc = [];
  const ws = new WebSocket(info.webSocketDebuggerUrl);
  ws.onmessage = e => { const msg = JSON.parse(e.data);
    if (msg.id && pend.has(msg.id)) { const p = pend.get(msg.id); pend.delete(msg.id); msg.error ? p.rej(new Error(JSON.stringify(msg.error))) : p.res(msg.result); }
    else if (msg.method === 'Runtime.exceptionThrown') exc.push(msg.params.exceptionDetails.exception && msg.params.exceptionDetails.exception.description || msg.params.exceptionDetails.text); };
  await new Promise(r => ws.onopen = r);
  const send = (mth, p, s) => new Promise((res, rej) => { const i = ++id; pend.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method: mth, params: p, sessionId: s })); });
  const t = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId: t.targetId, flatten: true });
  const S = (mth, p) => send(mth, p, sessionId);
  await S('Page.enable'); await S('Runtime.enable');
  await S('Page.addScriptToEvaluateOnNewDocument', { source: 'window.initCloudSync=function(){}; window.supabase=null;' });
  const ev = async e => { const r = await S('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(e.slice(0, 80) + ' → ' + JSON.stringify(r.exceptionDetails.exception && r.exceptionDetails.exception.description)); return r.result.value; };
  const size = (w, h) => S('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: false });
  let nav = 0;
  const open = async (url) => { await S('Page.navigate', { url: url + (url.indexOf('?') < 0 ? '?' : '&') + 'n=' + (++nav) }); await sleep(200);
    for (let i = 0; i < 80; i++) { try { if (await ev(`document.readyState==='complete' && !!document.querySelector('#ch-avgousteioi .row')`)) break; } catch (e) {} await sleep(100); }
    await ev(`document.fonts && document.fonts.ready.then(()=>1)`); await sleep(250); };
  const shot = async name => { if (!SHOTS) return; const r = await S('Page.captureScreenshot', { format: 'png' }); fs.writeFileSync(path.join(SHOTS, name + '.png'), Buffer.from(r.data, 'base64')); };
  const noScroll = async (label) => {
    const r = await ev(`(()=>{const d=document.documentElement;
      const inScroller=el=>{for(let p=el.parentElement;p;p=p.parentElement){const o=getComputedStyle(p).overflowX;if(o==='auto'||o==='scroll')return true}return false};
      const wide=[...document.querySelectorAll('main *, nav *')].filter(el=>{if(el.offsetParent===null)return false;const b=el.getBoundingClientRect();return b.width&&b.right>innerWidth+1&&!inScroller(el)}).map(el=>(el.className||el.tagName)+'').slice(0,5);
      const clip=[...document.querySelectorAll('main p, main h1, main h2, main h3, main h4, .nm, .lead')].filter(el=>el.offsetParent!==null&&getComputedStyle(el).visibility!=='hidden'&&el.scrollWidth>el.clientWidth+1&&getComputedStyle(el).overflowX!=='visible').map(el=>el.className||el.tagName).slice(0,5);
      return {sw:d.scrollWidth,cw:d.clientWidth,wide,clip}})()`);
    ok(r.sw <= r.cw && !r.wide.length && !r.clip.length, label + ' — μηδέν οριζόντια κύλιση (' + r.sw + ' ≤ ' + r.cw + ')', r);
  };

  try {
    section('Β1 · ΤΡΕΧΕΙ, ΚΑΙ ΚΑΘΕ ΠΑΡΑΓΡΑΦΟΣ ΕΙΝΑΙ ΣΤΗΝ ΟΘΟΝΗ');
    await size(1440, 900);
    await S('Page.navigate', { url: BASE + PAGE }); await sleep(300);
    await ev(`localStorage.clear()`);
    await open(BASE + PAGE);
    ok(syncHits >= 2 && await ev(`typeof window.ALSSync`) === 'undefined', '⛔ κανένα sync script δεν έτρεξε (ο server τα έδωσε άδεια)', { syncHits });
    eq(exc.length, 0, 'μηδέν εξαιρέσεις στη φόρτωση' + (exc.length ? ' — ' + exc[0] : ''));
    ok(await ev(`window.__EIS_OK === true && document.getElementById('gate').hidden`), 'όλα τα σημάδια βρέθηκαν στην πηγή (καμία ειδοποίηση)');
    const shown = await ev(`(()=>{const t=document.getElementById('worldA').innerText;return t.replace(/\\s+/g,' ')})()`);
    const norm = s => s.replace(/\s+/g, ' ').trim();
    const missing = SRC.map((l, i) => ({ i: i + 1, l })).filter(x => {
      let want = norm(x.l);
      if (x.i === 59) want = want.replace(/μονογραφία\.3$/, 'μονογραφία.');      /* ο δείκτης ³ γίνεται <sup> */
      if (x.i === 8 || x.i === 65) want = want.replace(/^\d+\s/, '');           /* ο αριθμός της υποσημείωσης γίνεται <sup> */
      return shown.indexOf(want) < 0;
    });
    eq(missing.length, 0, 'και οι 75 παράγραφοι φαίνονται αυτολεξεί στην οθόνη');
    missing.slice(0, 5).forEach(x => console.log('      ✗ ΛΕΙΠΕΙ ' + x.i + ': ' + x.l.slice(0, 100)));
    eq(await ev(`document.querySelectorAll('.chap').length`), 8, 'οκτώ κεφάλαια');
    eq(await ev(`document.querySelectorAll('.fig').length`), 7, 'επτά λεζάντες');
    eq(await ev(`document.querySelectorAll('.port').length`), 10, 'δέκα πορτρέτα μέσα στα VII/VIII (τα πέντε του V ανοίγουν σε διάλογο)');
    eq(await ev(`[...document.querySelectorAll('#nums [data-bar]')].map(b=>b.textContent).join(',')`), 'I,II,III,IV,V,VI,Α.VII,Β.VIII', 'η μπάρα I–VIII με τα Α./Β.');
    ok(await ev(`!!document.querySelector('#nums .brk')`), 'το χώρισμα πριν το V');
    eq(await ev(`document.querySelectorAll('.era').length`), 4, 'η ταινία: τέσσερις εποχές');
    const w = await ev(`[...document.querySelectorAll('.era')].map(e=>e.getBoundingClientRect().width)`);
    const dur = D.band.eras.map(e => e.b - e.a), k = w[0] / dur[0];
    ok(w.every((x, i) => Math.abs(x - dur[i] * k) < 3), 'πλάτος εποχής ανάλογο της διάρκειας (±3px)', { w, dur });
    eq(await ev(`document.querySelectorAll('.cmp .rl').length`), 3, 'ο συγκριτικός πίνακας: τρεις άξονες');
    eq(await ev(`document.querySelectorAll('.sgrid .au').length`), 15, 'η σύνοψη: δεκαπέντε συγγραφείς, παραγόμενοι');
    eq(await ev(`[...document.querySelectorAll('.sgrid .ln')].map(e=>e.textContent).join(',')`), 'Έπος,Κωμωδία,Πεζογραφία,Ποίηση', 'οι λωρίδες είναι τα είδη των σημειώσεων');
    await shot('1-cover-1440');

    section('Β2 · ⭐ ΓΡΑΜΜΑΤΟΣΕΙΡΕΣ ΑΝΑ ΣΤΟΙΧΕΙΟ (σταθ. 43)');
    const fonts = await ev(`(()=>{const bad=[];document.querySelectorAll('body *').forEach(el=>{
        const ff=getComputedStyle(el).fontFamily; if(!/^"?Instrument Serif/.test(ff)) return;
        const own=[...el.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('');
        if(/[\\u0370-\\u03ff\\u1f00-\\u1fff]/.test(own)) bad.push((el.className||el.tagName)+': '+own.slice(0,30));});
      const ro=getComputedStyle(document.querySelector('.m-ro')).fontFamily, gr=getComputedStyle(document.querySelector('.m-gr'));
      const la=getComputedStyle(document.querySelector('.m-la')).fontFamily;
      return {bad, ro, grF:gr.fontFamily, grS:gr.fontStyle, la, loaded:document.fonts.check('16px "GFS Didot"') && document.fonts.check('16px "Instrument Serif"')}})()`);
    eq(fonts.bad.length, 0, '⛔ κανένα ελληνικό γράμμα σε Instrument Serif' + (fonts.bad.length ? ' — ' + fonts.bad[0] : ''));
    ok(/^"?GFS Didot/.test(fonts.ro), 'Ρώμη (ονόματα) = GFS Didot όρθια', fonts.ro);
    ok(/^"?GFS Didot/.test(fonts.grF) && fonts.grS === 'italic', 'Ελλάδα (πρότυπα) = GFS Didot πλάγια', fonts.grF);
    ok(/^"?Instrument Serif/.test(fonts.la), 'λατινικοί όροι = Instrument Serif', fonts.la);

    section('Β3 · ⭐ ΟΙ ΣΗΜΕΙΩΣΕΙΣ ΤΟΥ ΑΠΟ ΤΗΝ als-v579 ΠΕΦΤΟΥΝ ΣΤΙΣ ΙΔΙΕΣ ΛΕΞΕΙΣ');
    {
      const full = L.chapterFull(D, SRC, D.chapters[5]);
      const s = full.indexOf('pax Romana'), e = s + 'pax Romana'.length;
      const s2 = full.indexOf('η Ρώμη γίνεται μια εντυπωσιακή'), e2 = s2 + 'η Ρώμη γίνεται μια εντυπωσιακή'.length;
      const seed = { heads: [{ id: 'h1', ts: 1, s: s2, e: e2, title: 'Η πόλη του μαρμάρου' }], defs: [{ id: 'd1', ts: 1, s, e, term: 'ρωμαϊκή ειρήνη' }] };
      await ev(`localStorage.setItem('eis:notes:klasiki', ${JSON.stringify(JSON.stringify(seed))})`);
      await open(BASE + PAGE);
      eq(await ev(`[...document.querySelectorAll('#ch-klasiki [data-d="d1"]')].map(x=>x.textContent).join('')`), 'pax Romana', 'ο ορισμός πέφτει ακριβώς στο «pax Romana»');
      eq(await ev(`[...document.querySelectorAll('#ch-klasiki [data-h="h1"]')].map(x=>x.textContent).join('')`), 'η Ρώμη γίνεται μια εντυπωσιακή', 'ο πλαγιότιτλος πέφτει ακριβώς στις λέξεις του');
      ok(await ev(`[...document.querySelectorAll('#ch-klasiki .marg .mnote .mt')].some(x=>x.textContent==='Η πόλη του μαρμάρου')`), 'ο πλαγιότιτλος κάθεται στο περιθώριο');
      ok(await ev(`!!document.querySelector('#ch-klasiki .nlist [data-del="klasiki:heads:h1"]')`), 'και στη λίστα του κεφαλαίου, με ορατό ×');
      await ev(`document.querySelector('[data-del="klasiki:heads:h1"]').click()`); await sleep(100);
      const after = await ev(`JSON.parse(localStorage.getItem('eis:notes:klasiki')).heads.length`);
      const tomb = await ev(`JSON.parse(localStorage.getItem('__synctomb__eisagogi')||'{}')`);
      eq(after, 0, 'το × σβήνει τον πλαγιότιτλο');
      ok(!!(tomb['eis:notes:klasiki'] && tomb['eis:notes:klasiki'].heads && tomb['eis:notes:klasiki'].heads['id:h1']), 'και αφήνει ταφόπλακα στη θέση που διαβάζει το sync.js');
      await ev(`document.querySelector('#toast button').click()`); await sleep(100);
      eq(await ev(`JSON.parse(localStorage.getItem('eis:notes:klasiki')).heads.length`), 1, 'η «Αναίρεση» τον φέρνει πίσω');
      ok(await ev(`!(JSON.parse(localStorage.getItem('__synctomb__eisagogi')||'{}')['eis:notes:klasiki'].heads||{})['id:h1']`), '…και σηκώνει την ταφόπλακα');
      /* επιλογή κειμένου → πλαγιότιτλος, με τις θέσεις του κεφαλαίου */
      const r = await ev(`(()=>{const segs=[...document.querySelectorAll('#ch-klasiki .seg[data-o]')].filter(s=>s.textContent.indexOf('Οι Ρωμαίοι δεν περιορίζονται')>=0);
        const s=segs[0];const n=s.firstChild;const i=n.textContent.indexOf('Οι Ρωμαίοι δεν περιορίζονται');const rg=document.createRange();rg.setStart(n,i);rg.setEnd(n,i+'Οι Ρωμαίοι δεν περιορίζονται'.length);
        const sel=getSelection();sel.removeAllRanges();sel.addRange(rg);document.dispatchEvent(new MouseEvent('mouseup'));return 1})()`);
      await sleep(60);
      ok(r && await ev(`!document.getElementById('selbar').hidden`), 'η επιλογή κειμένου ανοίγει «Πλαγιότιτλος / Ορισμός»');
      await ev(`document.getElementById('bHead').click()`); await sleep(50);
      await ev(`document.getElementById('popIn').value='Βαθύτερη επίδραση'; document.querySelector('#pop [data-ok]').click()`); await sleep(80);
      const nh = await ev(`JSON.parse(localStorage.getItem('eis:notes:klasiki')).heads.find(h=>h.title==='Βαθύτερη επίδραση')`);
      ok(!!nh && full.slice(nh.s, nh.e) === 'Οι Ρωμαίοι δεν περιορίζονται', 'ο νέος πλαγιότιτλος γράφεται με τις ΙΔΙΕΣ συντεταγμένες κεφαλαίου', nh);
      await ev(`localStorage.removeItem('eis:notes:klasiki'); localStorage.removeItem('__synctomb__eisagogi')`);
    }

    section('Β4 · «ΣΚΕΠΑΣΕ», ΠΟΡΤΡΕΤΟ, ΧΑΡΑΚΑΣ, «ΤΟ ΔΙΑΒΑΣΑ», ΟΙ ΠΙΝΑΚΕΣ');
    await open(BASE + PAGE);
    /* η σελίδα κυλάει «smooth» — ο οδηγός θέλει να φτάσει ΑΜΕΣΩΣ εκεί που μετράει */
    await ev(`document.documentElement.style.scrollBehavior='auto'`);
    await ev(`document.getElementById('cvbtn').click()`);
    const cv = await ev(`(()=>{const x=document.querySelector('#ch-klasiki .m-ro.cvable');return {c:getComputedStyle(x).color, cov:document.body.classList.contains('cov')}})()`);
    ok(cv.cov && /rgba\(0, 0, 0, 0\)|transparent/.test(cv.c), '«Σκέπασε»: τα ονόματα γίνονται κενά μέσα στο κείμενο', cv);
    await ev(`document.querySelector('#ch-klasiki .m-date.cvable').click()`);
    ok(await ev(`document.querySelector('#ch-klasiki .m-date.cvable').classList.contains('rv')`), 'πάτημα σε κενό = αποκάλυψη, χωρίς να ανοίξει τίποτα άλλο');
    ok(await ev(`!document.getElementById('ptd').open`), '…και στο κενό-όνομα δεν ανοίγει διάλογος');
    await shot('2-cover-mode');
    await ev(`document.getElementById('cvbtn').click()`);
    await ev(`document.querySelector('.who [data-p="plautos"]').click()`); await sleep(80);
    ok(await ev(`document.getElementById('ptd').open && document.querySelector('#ptd .port-h .nm').textContent==='Πλαύτος'`), 'το όνομα ανοίγει πορτρέτο σε <dialog>');
    ok(await ev(`/ελληνική κωμωδία/.test(document.querySelector('#ptd .facts').textContent)`), 'το πορτρέτο του Πλαύτου δείχνει το πρότυπό του με κλωστή');
    ok(await ev(`(()=>{const r=document.getElementById('ptd').getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight+1&&Math.abs((r.left+r.right)/2-innerWidth/2)<2})()`), 'ο διάλογος είναι κεντραρισμένος μέσα στην οθόνη (σταθ. 4)');
    await shot('3-portrait-dialog');
    await ev(`document.querySelector('#ptd [data-close]').click()`);
    eq(await ev(`document.querySelector('#pt-kikeron .cnt b').textContent`), '5', 'ο Κικέρων: 5 αναφορές στην εισαγωγή (μετρημένες)');
    /* ο χάρακας αλλάζει καθώς διαβάζεις */
    const r1 = await ev(`(async()=>{const row=document.querySelector('#ch-klasiki .row[data-l="44"]');scrollTo(0,row.getBoundingClientRect().top+scrollY-200);await new Promise(r=>setTimeout(r,250));return document.querySelector('#ch-klasiki [data-now]').textContent})()`);
    const r2 = await ev(`(async()=>{const row=document.querySelector('#ch-klasiki .row[data-l="55"]');scrollTo(0,row.getBoundingClientRect().top+scrollY-200);await new Promise(r=>setTimeout(r,250));return document.querySelector('#ch-klasiki [data-now]').textContent})()`);
    eq(r1, '31 π.Χ.', 'ο χάρακας στην παράγραφο του Ακτίου λέει «31 π.Χ.»');
    eq(r2, '31 π.Χ.-14 μ.Χ.', 'στην τελευταία παράγραφο λέει «31 π.Χ.-14 μ.Χ.»');
    eq(await ev(`document.querySelector('#nums [aria-current="true"]').dataset.bar`), 'klasiki', 'η μπάρα ξέρει σε ποιο κεφάλαιο είσαι');
    await shot('4-chapter-VI-1440');
    await ev(`document.querySelector('[data-read="klasiki"]').click()`);
    eq(await ev(`JSON.parse(localStorage.getItem('eisagogi:v1')).klasiki`), true, '«το διάβασα» γράφει μόνο στο eisagogi:v1');
    ok(await ev(`!!document.querySelector('#nums [data-bar="klasiki"] u')`), '…και βάζει την τελεία στη μπάρα');
    await ev(`document.getElementById('wB').click()`); await sleep(60);
    eq(await ev(`document.querySelectorAll('#tables table')[0].querySelectorAll('tbody tr').length`), D.pairs.length, '«Οι πίνακες»: μία γραμμή ανά ζεύγος, παραγόμενη');
    { const ph = await ev(`document.querySelector('#tables td.ph').textContent`);
      ok(ph.indexOf('Το 240 π.Χ. ένας Έλληνας από τον Τάραντα (Ν. Ιταλία), ο Λίβιος Ανδρόνικος') === 0,
         'η φράση κόβεται ΜΟΝΟ σε όριο πρότασης — το «(Ν. Ιταλία)» δεν είναι τέλος', ph.slice(0, 90)); }
    eq(await ev(`document.querySelectorAll('#tables table')[1].querySelectorAll('tbody tr').length`), 3, '«Ποιος ανήκει πού»: τρία κεφάλαια με πρόσωπα');
    ok(await ev(`document.getElementById('numsBar').hidden && document.getElementById('worldA').hidden`), 'ο δεύτερος κόσμος κρύβει τον πρώτο και τη μπάρα');
    await shot('5-tables');
    await ev(`document.getElementById('wA').click()`);

    section('Β5 · ΛΑΠΤΟΠ ΠΡΩΤΑ — ΚΑΙ ΜΗΔΕΝ ΟΡΙΖΟΝΤΙΑ ΚΥΛΙΣΗ ΩΣ ΤΟ ΚΙΝΗΤΟ (CDP)');
    const lay = await ev(`(()=>{const p=document.querySelector('#ch-klasiki .row p').getBoundingClientRect().width, w=document.querySelector('main.wrap').getBoundingClientRect().width,
      r=document.querySelector('#ch-klasiki .ruler').getBoundingClientRect(), m=document.querySelector('#ch-klasiki .row[data-l="52"] .marg').getBoundingClientRect();
      return {p, w, rw:r.width, mw:m.width, side:m.left>p}})()`);
    ok(lay.w <= 1180 && lay.w >= 1100, 'κέλυφος 1180px στο λάπτοπ (' + Math.round(lay.w) + ')');
    ok(lay.p >= 540 && lay.p <= 720, 'η πρόζα μένει σε μέτρο ανάγνωσης (' + Math.round(lay.p) + 'px)');
    ok(lay.rw > 100 && lay.mw > 200, 'δύο περιθώρια ζωντανά στο λάπτοπ: χάρακας ' + Math.round(lay.rw) + 'px, κλωστές ' + Math.round(lay.mw) + 'px');
    for (const W of [1440, 1280, 1180, 1040, 900, 860, 768, 640, 560, 430, 393]) {
      await size(W, 900); await sleep(120);
      await ev(`dispatchEvent(new Event('resize'))`); await sleep(60);
      await noScroll('πλάτος ' + W);
      if (W === 393) { await ev(`scrollTo(0,0)`); await sleep(80); await shot('6-393-top'); }
    }
    const mob = await ev(`(()=>{const ax=document.querySelector('#ch-klasiki .axis');const r=document.querySelector('#ch-klasiki .ruler');
      return {axis:getComputedStyle(ax).display, rulerPos:getComputedStyle(r).position, one:document.querySelector('#ch-klasiki .row').getBoundingClientRect().width}})()`);
    ok(mob.axis === 'none' && mob.rulerPos === 'sticky', 'κάτω από 860: ο άξονας μαζεύεται, το έτος γίνεται λωρίδα', mob);
    await size(1440, 900);

    section('Β6 · ΣΕ iframe 393 (σταθ. 30: το CDP δεν αρκεί μόνο του)');
    await S('Page.navigate', { url: BASE + 'frame.html?n=' + (++nav) });
    for (let i = 0; i < 80; i++) { try { if (await ev(`(()=>{const d=document.getElementById('f').contentDocument;return d&&d.readyState==='complete'&&!!d.querySelector('#ch-avgousteioi .row')})()`)) break; } catch (e) {} await sleep(100); }
    await sleep(400);
    const fr = await ev(`(()=>{const w=document.getElementById('f').contentWindow,d=w.document,de=d.documentElement;
      const inScroller=el=>{for(let p=el.parentElement;p;p=p.parentElement){const o=w.getComputedStyle(p).overflowX;if(o==='auto'||o==='scroll')return true}return false};
      const wide=[...d.querySelectorAll('main *, nav *')].filter(el=>{if(el.offsetParent===null)return false;const b=el.getBoundingClientRect();return b.width&&b.right>w.innerWidth+1&&!inScroller(el)}).map(el=>el.className||el.tagName).slice(0,5);
      return {iw:w.innerWidth,sw:de.scrollWidth,cw:de.clientWidth,wide}})()`);
    eq(fr.iw, 393, 'το iframe είναι πραγματικά 393px');
    ok(fr.sw <= fr.cw && !fr.wide.length, 'iframe 393 — μηδέν οριζόντια κύλιση (' + fr.sw + ' ≤ ' + fr.cw + ')', fr);
    eq(exc.length, 0, 'μηδέν εξαιρέσεις σε όλη τη διαδρομή' + (exc.length ? ' — ' + exc.join(' | ').slice(0, 200) : ''));
  } catch (e) {
    ok(false, 'το σενάριο του Chrome έσκασε: ' + e.message);
  }
  try { ws.close(); } catch (e) {}
  chrome.kill(); server.close();
  try { fs.rmSync('/tmp/cdp-eis-test-' + process.pid, { recursive: true, force: true }); } catch (e) {}
  finish();
})();

function finish(){
  console.log(`\n  ${pass} πέρασαν · ${fail} απέτυχαν`);
  process.exit(fail ? 1 : 0);
}
