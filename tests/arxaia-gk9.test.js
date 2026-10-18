/* ══════════════════════════════════════════════════════════════════════
   ΑΡΧΑΙΑ · ΓΝΩΣΤΟ — ΤΟ «ΟΡΓΑΝΟ» ΤΗΣ 9ης ΕΝΟΤΗΤΑΣ (arxaia-gk9.html)

   Α · ΣΤΑΤΙΚΑ: η πηγή είναι αυτή που καρφώθηκε, ο validator δεν βρίσκει
       τίποτα, η σελίδα ΕΙΝΑΙ η έξοδος του build, και ο φρουρός 7b (καμία
       Instrument Serif σε ελληνικά).
   Β · ΑΛΗΘΙΝΟ CHROME (CDP): η σελίδα τρέχει, κάθε οθόνη ζωγραφίζει το ΔΙΚΟ
       ΤΗΣ σημάδι (σταθ. 57), κάθε κουμπί κάνει αυτό που λέει, η πρόοδος
       επιβιώνει ενός reload, και μηδέν οριζόντια κύλιση 1440 → 393.
   ⚠️ Το Β ΣΚΑΕΙ αν δεν βρει Chrome — ποτέ σιωπηλό «πέρασε».
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs'), path = require('path'), http = require('http');
const { spawn } = require('child_process');
const ROOT = path.join(__dirname, '..');
const L = require('../tools/gnosto/lib.js');
const B = require('../tools/gnosto/build.js');
const PAGE = 'arxaia-gk9.html';

let pass = 0, fail = 0;
function ok(c, m, x){ if (c){ pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m + (x ? '  ' + JSON.stringify(x).slice(0, 400) : '')); } }
function eq(a, b, m){ ok(a === b, m + (a === b ? '' : '  (' + a + ' ≠ ' + b + ')')); }
function section(t){ console.log('\n' + t); }

/* ══ Α · ΣΤΑΤΙΚΑ ═══════════════════════════════════════════════════════ */
section('Α1 · Η ΠΗΓΗ ΚΑΙ Ο VALIDATOR');
const spec = L.loadSpec('gk9'), unit = L.loadUnit('gk9');
const src = L.readSource(path.join(ROOT, spec.source));
eq(src.sha, '69e1702b09fab8168f693d6ea352a6a44a2a7360b6377006f838c2ffb7b46876', 'η πηγή του Φακέλου είναι ΑΚΡΙΒΩΣ αυτή που βγήκε από το PDF');
['intro','grypari','scholia','p92','p93','p94'].forEach(k => ok(src.blocks[k] && src.blocks[k].length > 200, 'η πηγή έχει το μπλοκ «' + k + '»'));
const errs = L.check(spec, unit, src);
eq(errs.length, 0, 'ο validator δεν βρίσκει τίποτα' + (errs.length ? ' — ' + errs[0] : ''));

section('Α2 · Ο VALIDATOR ΔΑΓΚΩΝΕΙ (μεταλλάξεις)');
function mut(fn){ const s = JSON.parse(JSON.stringify(spec)); fn(s); return L.check(s, unit, src).length; }
ok(mut(s => { s.scholia[3].body = s.scholia[3].body.replace('Αγαθού', 'Ωραίου'); }) > 0, 'μία λέξη αλλαγμένη σε σχόλιο → σφάλμα');
ok(mut(s => { s.scholia.pop(); }) > 0, 'ένα σχόλιο λιγότερο → σφάλμα (πρέπει να είναι ΟΛΑ)');
ok(mut(s => { s.grypari[0] = s.grypari[0].replace('μερικοί', 'κάποιοι'); }) > 0, 'μία λέξη του Γρυπάρη → σφάλμα');
ok(mut(s => { s.activities[0].items[0].q += ' '; s.activities[0].items[0].q = s.activities[0].items[0].q.replace('παιδεία', 'μόρφωση'); }) > 0, 'ερώτηση που δεν είναι του βιβλίου → σφάλμα');
ok(mut(s => { s.activities[0].items[1].model.push({ k: 'q', an: 'ἡ ἀρετὴ διδακτόν ἐστιν', x: '—' }); }) > 0, 'παράθεμα που δεν υπάρχει στο αρχαίο → σφάλμα');
ok(mut(s => { s.activities[0].items[1].model.push({ k: 'p', x: 'όπως λέει «ἡ ψυχὴ ἀθάνατος»' }); }) > 0, 'πολυτονικό «…» μέσα σε πρόζα που δεν υπάρχει → σφάλμα');
ok(mut(s => { s.activities[2].items[0].model.push({ k: 'tq', who: 'gryp', an: 'η παιδεία είναι η τέχνη της στροφής', x: '—' }); }) > 0, 'ψεύτικο παράθεμα Γρυπάρη → σφάλμα');
ok(mut(s => { s.words.c13[1] = 'απαρέμφατο ενεστ.'; }) > 0, '«απαρέμφατο» σε λέξη που δεν τελειώνει σε κατάληξη απαρεμφάτου → σφάλμα');
ok(mut(s => { s.words.a6[1] = 'μετοχή αορ.'; }) > 0, '«μετοχή» σε απαρέμφατο → σφάλμα');
ok(mut(s => { delete s.words.q15; }) > 0, 'λέξη χωρίς κάρτα → σφάλμα');
ok(mut(s => { delete s.structure.clauses['12']; }) > 0, 'η Δομή δείχνει σε πρόταση που δεν ορίζεται → σφάλμα');
ok(mut(s => { s.structure.runs['7'] = [[0, 8]]; }) > 0, 'πρόταση που ορίζεται αλλά χάθηκε από τη Δομή → σφάλμα');
ok(mut(s => { delete s.structure.runs['9']; }) > 0, 'περίοδος χωρίς Δομή → σφάλμα');
ok(mut(s => { s.lexika[0].rel = ['παιδί']; }) > 0, 'λεξιλογικό με λιγότερα από 3 ομόρριζα → σφάλμα');
ok(mut(s => { s.sourceSha = '0'.repeat(64); }) > 0, 'άλλη πηγή → σφάλμα');

section('Α3 · ΤΑ ΝΟΥΜΕΡΑ, ΜΕΤΡΗΜΕΝΑ');
eq(unit.align.segs.length, 17, '17 περίοδοι');
eq(Object.keys(unit.align.pairs).length, 154, '154 ζευγάρια — και 154 κάρτες λέξεων');
eq(Object.keys(spec.words).length, 154, 'κάθε ζευγάρι έχει κάρτα');
eq(spec.scholia.length, 6, 'τα 6 σχόλια του βιβλίου');
eq(spec.activities.reduce((n, g) => n + g.items.length, 0), 7, '7 δραστηριότητες (Α1-3, Β1-2, Γ1-2)');
eq(spec.parallels.reduce((n, p) => n + p.items.length, 0), 3, '3 ερωτήσεις παράλληλων κειμένων');
eq(spec.grypari.length, unit.ancient.length, 'ο Γρυπάρης έχει τόσες παραγράφους όσες οι ατάκες του αρχαίου (7)');
const paras = B.paraOf(unit);
eq(Object.keys(paras).length, 17, 'κάθε περίοδος ανήκει σε μία ατάκα');
eq(Math.max.apply(null, Object.values(paras)), 6, 'οι 17 περίοδοι καλύπτουν ακριβώς τις 7 ατάκες');

section('Α4 · Η ΣΕΛΙΔΑ ΕΙΝΑΙ Η ΕΞΟΔΟΣ ΤΟΥ BUILD');
const html = fs.readFileSync(path.join(ROOT, PAGE), 'utf8');
eq(html, B.render('gk9').html, PAGE + ' === build(gk9) — καμία χειροκίνητη αλλαγή');
ok(!/<script[^>]+src=/i.test(html), 'κανένα εξωτερικό script (άρα κανένα sync — σταθ. 8)');
ok(!/\{\{[^}]*\}\}/.test(html), 'κανένα placeholder δεν έμεινε στη σελίδα (το «{{H1}}» το είδε μόνο το render)');
ok(/<h1>Η παιδεία ως<br>περιαγωγή<\/h1>/.test(html), 'ο τίτλος είναι ο τίτλος');
ok(html.indexOf('href="arxaia.html#gn"') > 0, 'η έξοδος γυρνάει στον Γνωστό (#gn), όχι στον Άγνωστο');
ok(!/kx-exit/.test(html), 'σελίδα πακέτου: ΔΕΝ φοράει την έξοδο του Κέντρου (γυρνάει στον γονέα)');
ok(!/@media\s*\(\s*min-width/i.test(html), 'κανένα min-width (σταθ. 51)');
ok(!/localStorage\.(setItem|removeItem)\([^)]*\)\s*;?\s*\}\s*catch\s*\(\s*\w*\s*\)\s*\{\s*\}/.test(html), 'καμία εγγραφή σε άδειο catch (σταθ. 17)');
ok(html.indexOf("'arx:gn'") < 0 && html.indexOf('"arx:gn"') < 0, 'δεν γράφει στο συγχρονισμένο arx:gn (σταθ. 16)');

section('Α5 · ΦΡΟΥΡΟΣ 7b — ΚΑΜΙΑ INSTRUMENT SERIF ΣΕ ΕΛΛΗΝΙΚΑ');
const css = (html.match(/<style>([\s\S]*?)<\/style>/) || [, ''])[1];
const serifSel = [];
css.replace(/([^{}]+)\{([^}]*)\}/g, (m, sel, body) => { if (/var\(--serif\)/.test(body)) serifSel.push(sel.trim()); return m; });
const ALLOWED = ['.face .n', '.band .bn'];
ok(serifSel.length && serifSel.every(s => ALLOWED.indexOf(s) >= 0), 'το --serif μπαίνει ΜΟΝΟ σε αριθμούς (' + serifSel.join(' | ') + ')', serifSel);
['.an', '.md', 'h1', '.sxc h4', '.qa .q', '.qa .qn', '.wc-an', '.intro'].forEach(s => {
  const re = new RegExp('(^|\\})\\s*' + s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\{[^}]*font-family:var\\(--gr\\)');
  ok(re.test(css), 'το «' + s + '» είναι GFS Didot');
});

/* ══ Β · ΑΛΗΘΙΝΟ CHROME ═══════════════════════════════════════════════ */
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.json': 'application/json' };
let netHits = 0;
const server = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  if (/sync|supabase|topbar|nova/i.test(u)) { netHits++; res.writeHead(200, { 'Content-Type': MIME['.js'] }); res.end(''); return; }
  if (u === '/frame.html') { res.writeHead(200, { 'Content-Type': MIME['.html'] }); res.end('<!doctype html><meta charset=utf-8><body style="margin:0;background:#000"><iframe id=f src="/' + PAGE + '" style="width:393px;height:860px;border:0"></iframe>'); return; }
  const f = path.join(ROOT, u);
  if (f.indexOf(ROOT) !== 0 || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end('no'); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
  res.end(fs.readFileSync(f));
});
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SHOTS = process.env.GK_SHOTS || '';
const sleep = n => new Promise(r => setTimeout(r, n));

(async () => {
  if (!fs.existsSync(CHROME)) { ok(false, 'δεν βρέθηκε Chrome — ΔΕΝ έτρεξε το Β, δεν πέρασε τίποτα'); return finish(); }
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const BASE = 'http://127.0.0.1:' + server.address().port + '/';
  const PORT = 9800 + (process.pid % 150);
  const udd = '/tmp/cdp-gk9-' + process.pid;
  const chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=' + PORT, '--no-first-run', '--user-data-dir=' + udd, '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });
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
  const ev = async e => { const r = await S('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(e.slice(0, 90) + ' → ' + JSON.stringify(r.exceptionDetails.exception && r.exceptionDetails.exception.description)); return r.result.value; };
  const size = (w, h) => S('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: false });
  let nav = 0;
  const open = async (hash) => { await S('Page.navigate', { url: BASE + PAGE + '?n=' + (++nav) + (hash || '') }); await sleep(150);
    for (let i = 0; i < 80; i++) { try { if (await ev(`document.readyState==='complete' && document.querySelectorAll('.sent').length>0`)) break; } catch (e) {} await sleep(100); }
    await ev(`document.fonts ? document.fonts.ready.then(()=>1) : 1`); await sleep(200); };
  const shot = async (name, full) => { if (!SHOTS) return;
    let clip;
    if (full){ const h = await ev(`document.documentElement.scrollHeight`); const w = await ev(`innerWidth`); clip = { x: 0, y: 0, width: w, height: Math.min(h, 9000), scale: 1 }; }
    const r = await S('Page.captureScreenshot', { format: 'png', captureBeyondViewport: !!full, clip }); fs.writeFileSync(path.join(SHOTS, name + '.png'), Buffer.from(r.data, 'base64')); };
  const shotAt = async (name, sel) => { if (!SHOTS) return; await ev(`(()=>{document.documentElement.style.scrollBehavior='auto';const e=document.querySelector(${JSON.stringify(sel)});if(e)window.scrollTo(0,e.getBoundingClientRect().top+scrollY-20);return 1})()`); await sleep(150); await shot(name); await ev(`window.scrollTo(0,0);document.documentElement.style.scrollBehavior='';1`); };
  const noScroll = async (label) => {
    const r = await ev(`(()=>{const d=document.documentElement;
      const inScroller=el=>{for(let p=el.parentElement;p;p=p.parentElement){const o=getComputedStyle(p).overflowX;if(o==='auto'||o==='scroll')return true}return false};
      const wide=[...document.querySelectorAll('.shell *')].filter(el=>{if(el.offsetParent===null)return false;const b=el.getBoundingClientRect();return b.width&&b.right>innerWidth+1&&!inScroller(el)}).map(el=>(el.className||el.tagName)+'').slice(0,5);
      const clip=[...document.querySelectorAll('.shell p, .shell h1, .shell h2, .shell h3, .shell h4, .shell li, .shell td')].filter(el=>el.offsetParent!==null&&el.scrollWidth>el.clientWidth+1&&getComputedStyle(el).overflowX!=='visible').map(el=>el.className||el.tagName).slice(0,5);
      return {sw:d.scrollWidth,cw:d.clientWidth,wide,clip}})()`);
    ok(r.sw <= r.cw && !r.wide.length && !r.clip.length, label + ' — μηδέν οριζόντια κύλιση (' + r.sw + ' ≤ ' + r.cw + ')', r);
  };

  try {
    section('Β1 · ΤΡΕΧΕΙ, ΚΑΙ Η ΜΕΤΑΦΡΑΣΗ ΕΙΝΑΙ ΣΤΗΝ ΟΘΟΝΗ');
    await size(1440, 900);
    await open(); await ev(`localStorage.clear()`); await open();
    eq(exc.length, 0, 'μηδέν εξαιρέσεις στη φόρτωση' + (exc.length ? ' — ' + exc[0] : ''));
    eq(netHits, 0, 'κανένα sync/supabase/topbar δεν ζητήθηκε');
    eq(await ev(`document.querySelectorAll('.sent').length`), 17, '17 περίοδοι στην οθόνη');
    eq(await ev(`document.querySelectorAll('.sent.turn').length`), 6, 'έξι αλλαγές ατάκας (7 ατάκες)');
    const shownAn = await ev(`[...document.querySelectorAll('.an')].map(p=>p.textContent).join(' ')`);
    const shownMd = await ev(`[...document.querySelectorAll('.md')].map(p=>p.textContent).join(' ')`);
    const nz = s => L.norm(s).replace(/\s+/g, '');
    eq(nz(shownAn), nz(unit.ancient.map(b => b.p).join(' ')), 'το αρχαίο στην οθόνη = το αρχαίο της ενότητας, γράμμα-γράμμα');
    eq(nz(shownMd), nz(unit.text.map(b => b.p).join(' ')), 'η μετάφραση στην οθόνη = ο Σκουτερόπουλος, γράμμα-γράμμα');
    ok(await ev(`/Πάτα μια λέξη/.test(document.getElementById('aside').textContent)`), 'η άδεια κάρτα λέει τι να κάνει');
    await shot('01-read-1440');

    section('Β2 · Η ΚΑΡΤΑ ΤΗΣ ΛΕΞΗΣ');
    await ev(`document.querySelector('.an .w[data-k="g4"]').click()`);
    const card = await ev(`document.getElementById('aside').textContent`);
    ok(card.indexOf('περιάγω') >= 0 && card.indexOf('ρηματικό επίθετο') >= 0 && card.indexOf('σημαίνει') >= 0, 'το «περιακτέον εἶναι» δείχνει λήμμα, τύπο, συντακτικό', card.slice(0, 200));
    ok(card.indexOf('περιαγωγή') >= 0, 'και το σχόλιο του βιβλίου που το αφορά');
    eq(await ev(`document.querySelectorAll('.w.hit').length`), 2, 'ανάβει και στο αρχαίο και στη μετάφραση');
    await ev(`document.querySelector('.md .w[data-k="b3"]').click()`);
    eq(await ev(`document.querySelectorAll('.an .w.hit').length`), 2, 'ζευγάρι με δύο θέσεις («οἵαν … τοιαύτην»): ανάβουν και οι δύο');
    await shotAt('02-card-1440', '.sent[data-n="2"]');
    await ev(`document.querySelector('#aside [data-sch]') ? 1 : document.querySelector('.an .w[data-k="g4"]').click()`);
    await ev(`(document.querySelector('#aside [data-sch]')||{click(){}}).click()`);
    ok(await ev(`document.getElementById('p-sxolia').classList.contains('on')`), 'το σχόλιο της κάρτας ανοίγει την καρτέλα «Σχόλια»');
    await ev(`document.querySelector('.tab[data-tab="metafrasi"]').click()`);

    section('Β3 · ΦΑΚΟΙ');
    const lensN = await ev(`[...document.querySelectorAll('.lens')].map(b=>b.dataset.lens+':'+b.querySelector('i').textContent).join(',')`);
    ok(/part:\d+/.test(lensN) && /inf:\d+/.test(lensN) && /sch:\d+/.test(lensN) && /vadj:1/.test(lensN), 'φακοί: μετοχές · απαρέμφατα · ρηματικό επίθετο (1) · σχόλια', lensN);
    await ev(`document.querySelector('.lens[data-lens="part"]').click()`);
    const lit = await ev(`[...new Set([...document.querySelectorAll('.an .w')].filter(w=>!w.classList.contains('hit')&&getComputedStyle(w).opacity==='1').map(w=>w.dataset.k))]`);
    const parts = Object.keys(spec.words).filter(k => L.tagsOf(spec.words[k][1], spec.words[k][3]).indexOf('part') >= 0);
    ok(parts.every(k => lit.indexOf(k) >= 0) && lit.every(k => parts.indexOf(k) >= 0), 'ο φακός «Μετοχές» ανάβει ΑΚΡΙΒΩΣ τις μετοχές', { lit: lit.length, parts: parts.length });
    await shotAt('03-lens-part', '.sent[data-n="3"]');
    await ev(`document.querySelector('.lens[data-lens="part"]').click()`);

    section('Β4 · ΜΕΤΑΦΡΑΣΕ (✗ ↻ ✓) — ΚΑΙ ΕΠΙΒΙΩΝΕΙ ΤΟΥ RELOAD');
    await ev(`document.querySelector('[data-mode="tr"]').click()`);
    eq(await ev(`[...document.querySelectorAll('.md')].filter(p=>getComputedStyle(p).display!=='none').length`), 0, 'η μετάφραση κρύβεται σε όλες τις περιόδους');
    await ev(`document.querySelector('.sent[data-n="3"] .veil').click()`);
    ok(await ev(`getComputedStyle(document.querySelector('.sent[data-n="3"] .md')).display!=='none'`), 'το «πάτα για να την ελέγξεις» δείχνει ΜΟΝΟ εκείνη');
    await ev(`document.querySelector('.sent[data-n="3"] .g3.x').click()`);
    await ev(`document.querySelector('.sent[data-n="5"] .veil').click(); document.querySelector('.sent[data-n="5"] .g3.k').click()`);
    eq(await ev(`document.getElementById('bTr').textContent`), '1', 'η ταινία μετράει τις ✓');
    await ev(`document.getElementById('onlyRedI').click()`);
    eq(await ev(`document.querySelectorAll('.sent:not(.gone)').length`), 1, '«Μόνο τα κόκκινα» αφήνει μόνο την ✗');
    await open();
    eq(await ev(`JSON.stringify(JSON.parse(localStorage.getItem('gk9_tr_v1')))`), '{"3":"x","5":"k"}', 'η κρίση αποθηκεύτηκε');
    eq(await ev(`document.querySelector('.sent[data-n="3"] .mk').textContent`), '✗ ξανά', 'και φαίνεται μετά το reload');
    eq(await ev(`document.querySelector('[data-mode="tr"]').getAttribute('aria-pressed')`), 'true', 'ο τρόπος θυμάται');
    await ev(`document.getElementById('bReset').click()`);
    eq(await ev(`localStorage.getItem('gk9_tr_v1')`), '{"3":"x","5":"k"}', 'το «μηδένισε» θέλει ΔΕΥΤΕΡΟ πάτημα');
    await ev(`document.getElementById('bReset').click()`);
    eq(await ev(`localStorage.getItem('gk9_tr_v1')`), '{}', 'και με το δεύτερο μηδενίζει');

    section('Β5 · ΔΟΜΗ');
    await ev(`document.querySelector('[data-mode="st"]').click()`);
    const br = await ev(`[...document.querySelectorAll('.sent .an')].map(p=>{const t=[...p.querySelectorAll('.br')].map(b=>b.textContent.replace(/\\d/g,''));let o=0,ok=true;t.forEach(c=>{if(c==='['||c==='(')o++;else{o--;if(o<0)ok=false}});return ok&&o===0})`);
    ok(br.every(Boolean), 'σε κάθε περίοδο οι αγκύλες ανοίγουν και κλείνουν σωστά');
    eq(await ev(`new Set([...document.querySelectorAll('.cl')].map(c=>c.dataset.q)).size`), Object.keys(spec.structure.clauses).length, 'και οι ' + Object.keys(spec.structure.clauses).length + ' προτάσεις εμφανίζονται');
    eq(nz((await ev(`[...document.querySelectorAll('.an')].map(p=>p.textContent).join(' ')`)).replace(/[\[\]()]\d*/g, '')), nz(unit.ancient.map(b => b.p).join(' ')), 'οι αγκύλες δεν έφαγαν ούτε πρόσθεσαν γράμμα');
    await ev(`document.querySelector('.sent[data-n="5"] .clauses li[data-q="10"]').click()`);
    ok(await ev(`!!document.querySelector('.sent[data-n="5"] .cl.on[data-q="10"]')`), 'πατώντας την πρόταση ανάβει μέσα στο κείμενο');
    await shotAt('04-structure-1440', '.sent[data-n="5"]');

    section('Β6 · ΑΠΛΑ ΛΟΓΙΑ · ΟΛΟΚΛΗΡΟ (+ ΓΡΥΠΑΡΗΣ)');
    await ev(`document.querySelector('[data-mode="si"]').click()`);
    eq(await ev(`document.querySelectorAll('#simple p').length`), unit.simple.length, 'τα «απλά λόγια» όλα');
    await ev(`document.querySelector('[data-mode="wh"]').click()`);
    ok(await ev(`!!document.querySelector('.whole .gry[hidden]')`), 'ο Γρυπάρης κρυμμένος μέχρι να τον ζητήσει');
    await ev(`document.getElementById('grypI').click()`);
    const gry = await ev(`document.querySelector('.whole .gry').textContent`);
    ok(nz(gry).indexOf(nz(spec.grypari.join(' '))) >= 0, 'και όταν ανοίξει, είναι ΟΛΟΣ ο Γρυπάρης, αυτολεξεί');
    await shotAt('05-whole-gryp-1440', '#wholeBox');

    section('Β7 · ΣΧΟΛΙΑ');
    await ev(`document.querySelector('.tab[data-tab="sxolia"]').click()`);
    eq(await ev(`document.querySelectorAll('.sxc').length`), 6, 'έξι κάρτες σχολίων');
    const sxText = await ev(`document.getElementById('sxList').textContent + document.getElementById('introTxt').textContent`);
    ok(spec.scholia.every(s => nz(sxText).indexOf(nz(s.body)) >= 0) && nz(sxText).indexOf(nz(spec.intro)) >= 0, 'και τα έξι σχόλια + η εισαγωγή φαίνονται αυτολεξεί');
    await shotAt('06-scholia-1440', '#sxList');
    await ev(`document.querySelector('[data-sxm="hide"]').click()`);
    eq(await ev(`[...document.querySelectorAll('.sxc .body')].filter(b=>getComputedStyle(b).display!=='none').length`), 0, '«Σκέπασε»: κρύβονται όλα');
    await ev(`document.querySelector('.sxc[data-i="4"] .cover-b').click(); document.querySelector('.sxc[data-i="4"] .g3.k').click()`);
    eq(await ev(`document.getElementById('bSx').textContent`), '1', 'το ✓ μετράει στην ταινία');
    await ev(`document.querySelector('.sxc[data-i="4"] [data-go]').click()`);
    ok(await ev(`document.getElementById('p-metafrasi').classList.contains('on') && document.querySelectorAll('.w.hit').length>0`), 'η λέξη του σχολίου ανοίγει τη Μετάφραση με τη λέξη αναμμένη');

    section('Β8 · ΕΡΜΗΝΕΥΤΙΚΑ');
    await ev(`document.querySelector('.tab[data-tab="ermineia"]').click()`);
    eq(await ev(`document.querySelectorAll('.qa').length`), 10, 'δέκα ερωτήσεις (7 δραστηριότητες + 3 παράλληλων)');
    eq(await ev(`[...document.querySelectorAll('.model')].filter(m=>getComputedStyle(m).display!=='none').length`), 0, 'τα υποδείγματα κλειστά — γράφει πρώτα αυτός');
    const par = await ev(`document.getElementById('parBox').textContent`);
    ok(spec.parallels.every(p => nz(par).indexOf(nz(p.text)) >= 0), 'τα δύο παράλληλα κείμενα αυτολεξεί');
    await ev(`document.querySelector('.qa[data-id="A3"] .mshow').click()`);
    const m3 = await ev(`document.querySelector('.qa[data-id="A3"] .model').textContent`);
    ok(m3.indexOf('δικό μου') >= 0 && m3.indexOf('Και γι’ αυτό') >= 0 && m3.indexOf('ἡ δὲ τοῦ φρονῆσαι') >= 0, 'το υπόδειγμα: ετικέτα «δικό μου», παράθεμα, «και γι’ αυτό»');
    await ev(`(()=>{const t=document.querySelector('.qa[data-id="A1"] textarea');t.value='Θέση: η παιδεία στρέφει.';t.dispatchEvent(new Event('input',{bubbles:true}))})()`);
    await sleep(600);
    eq(await ev(`JSON.parse(localStorage.getItem('gk9_ans_v1')).A1`), 'Θέση: η παιδεία στρέφει.', 'η απάντησή του αποθηκεύεται');
    eq(await ev(`document.getElementById('bAns').textContent`), '1', 'και μετράει');
    await shotAt('07-ermineia-1440', '.qa[data-id="A3"]');

    section('Β9 · ΛΕΞΙΛΟΓΙΚΑ');
    await ev(`document.querySelector('.tab[data-tab="lexika"]').click()`);
    eq(await ev(`document.querySelectorAll('#lxBody tr').length`), spec.lexika.length, spec.lexika.length + ' λέξεις');
    await ev(`document.getElementById('lxHide').click()`);
    ok(await ev(`document.getElementById('lxTbl').classList.contains('hidecol')`), '«Κρύψε τα ομόρριζα»');
    await shotAt('08-lexika-1440', '#p-lexika');
    await ev(`document.querySelector('#lxBody [data-go="k8"]').click()`);
    ok(await ev(`document.querySelectorAll('.an .w.hit[data-k="k8"]').length===1`), 'η λέξη ανοίγει μέσα στο κείμενο');

    section('Β10 · ΤΟ ΒΑΘΥ HASH');
    await open('#sxolia');
    ok(await ev(`document.getElementById('p-sxolia').classList.contains('on')`), '#sxolia ανοίγει τα Σχόλια');

    section('Β11 · ΠΛΑΤΗ — 1440 → 393, ΜΗΔΕΝ ΟΡΙΖΟΝΤΙΑ ΚΥΛΙΣΗ');
    for (const w of [1440, 1180, 1040, 860, 760, 560]) {
      await size(w, 900);
      for (const tb of ['metafrasi', 'sxolia', 'ermineia', 'lexika']) {
        await ev(`document.querySelector('.tab[data-tab="${tb}"]').click()`);
        if (tb === 'ermineia') await ev(`document.querySelectorAll('.qa .mshow').forEach(b=>{if(b.getAttribute('aria-pressed')!=='true')b.click()})`);
        await sleep(60);
        await noScroll(w + 'px · ' + tb);
      }
    }
    await ev(`document.querySelector('.tab[data-tab="metafrasi"]').click(); document.querySelector('[data-mode="st"]').click()`);
    await noScroll('560px · Δομή');
    /* 393 = αληθινό πλάτος κινητού, μέσα σε iframe (σταθ. 30/59) */
    await size(420, 900);
    await S('Page.navigate', { url: BASE + 'frame.html' }); await sleep(900);
    const fr = await ev(`(()=>{const d=document.getElementById('f').contentDocument;return {sw:d.documentElement.scrollWidth,cw:d.documentElement.clientWidth}})()`);
    ok(fr.sw <= fr.cw && fr.cw === 393, '393px (iframe) — μηδέν οριζόντια κύλιση (' + fr.sw + ' ≤ ' + fr.cw + ')', fr);
    if (SHOTS) {
      await size(393, 860); await open('#metafrasi');
      await ev(`document.querySelector('[data-mode="rd"]').click(); document.querySelector('.an .w[data-k="e8"]').click()`);
      await shotAt('09-phone-read', '.sent[data-n="5"]');
      await ev(`document.querySelector('[data-mode="st"]').click()`); await shotAt('10-phone-structure', '.sent[data-n="11"]');
      await ev(`document.querySelector('.tab[data-tab="ermineia"]').click(); document.querySelector('.qa[data-id="C1"] .mshow').click()`); await shotAt('11-phone-ermineia', '.qa[data-id="C1"]');
      await ev(`document.querySelector('.tab[data-tab="sxolia"]').click()`); await shotAt('12-phone-sxolia', '#sxList');
    }

    section('Β12 · ΓΡΑΜΜΑΤΟΣΕΙΡΑ ΑΝΑ ΣΤΟΙΧΕΙΟ (7b σε Chrome)');
    await size(1440, 900); await open();
    const fams = await ev(`[...document.querySelectorAll('.an .w, .md .w, h1, .wc-an')].slice(0,40).map(e=>getComputedStyle(e).fontFamily.split(',')[0].replace(/["']/g,'').trim())`);
    ok(fams.length && fams.every(f => f === 'GFS Didot'), 'κάθε ελληνικό στοιχείο ζητάει πρώτα GFS Didot', [...new Set(fams)]);
    eq(exc.length, 0, 'και μηδέν εξαιρέσεις σε ΟΛΗ τη διαδρομή' + (exc.length ? ' — ' + exc[0] : ''));
  } catch (e) {
    ok(false, 'το Β σταμάτησε: ' + e.message);
  }
  ws.close(); chrome.kill('SIGKILL'); server.close();
  try { fs.rmSync(udd, { recursive: true, force: true }); } catch (e) {}
  finish();
})();

function finish(){
  console.log('\n' + pass + '/' + fail);
  process.exit(fail ? 1 : 0);
}
