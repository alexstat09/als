/* ══════════════════════════════════════════════════════════════════════
   ΑΡΧΑΙΑ · ΓΝΩΣΤΟ — ΤΑ «ΟΡΓΑΝΑ» ΤΩΝ ΕΝΟΤΗΤΩΝ (arxaia-gkN.html)

   ⭐ ΓΕΝΙΚΟ: κάθε tools/gnosto/gkN.json ελέγχεται ΜΟΝΟ ΤΟΥ — μια νέα ενότητα
   είναι μηδέν γραμμές εδώ (όπως tests/latinika-lectio.test.js).
     Α · ΣΤΑΤΙΚΑ, ανά ενότητα: η πηγή = το καρφωμένο sha (και, αν υπάρχει το
         PDF, = ό,τι βγάζει ΤΩΡΑ το source.js) · ο validator δεν βρίσκει
         τίποτα · η σελίδα ΕΙΝΑΙ η έξοδος του build · τα `checks` · η
         καλωδίωση (πόρτα, sw CORE, launcher).
     Μ · ΜΕΤΑΛΛΑΞΕΙΣ πάνω στην gk9 (η ενότητα αναφοράς): ο validator δαγκώνει.
     Β · ΑΛΗΘΙΝΟ CHROME (CDP), ανά ενότητα: κάθε οθόνη ζωγραφίζει το ΔΙΚΟ ΤΗΣ
         σημάδι (σταθ. 57), κάθε κουμπί κάνει ό,τι λέει, η πρόοδος επιβιώνει
         reload, μηδέν οριζόντια κύλιση 1440 → 393 (iframe, σταθ. 30/59).
   GK_ONLY=gk9 → μόνο μία ενότητα · GK_SHOTS=φάκελος → φωτογραφίες για το μάτι.
   ⚠️ Το Β ΣΚΑΕΙ αν δεν βρει Chrome — ποτέ σιωπηλό «πέρασε».
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs'), path = require('path'), http = require('http');
const { spawn } = require('child_process');
const ROOT = path.join(__dirname, '..');
const L = require('../tools/gnosto/lib.js');
const B = require('../tools/gnosto/build.js');

let pass = 0, fail = 0;
function ok(c, m, x){ if (c){ pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m + (x ? '  ' + JSON.stringify(x).slice(0, 400) : '')); } }
function eq(a, b, m){ ok(a === b, m + (a === b ? '' : '  (' + a + ' ≠ ' + b + ')')); }
function section(t){ console.log('\n' + t); }
const nz = s => L.norm(s).replace(/\s+/g, '');

const IDS = fs.readdirSync(path.join(ROOT, 'tools', 'gnosto'))
  .map(f => (/^(gk\d+)\.json$/.exec(f) || [])[1]).filter(Boolean)
  .filter(id => !process.env.GK_ONLY || process.env.GK_ONLY === id)
  .sort((a, b) => +a.slice(2) - +b.slice(2));
ok(IDS.length > 0, 'βρέθηκαν όργανα: ' + IDS.join(', '));
const U = {};
IDS.forEach(id => { U[id] = { spec: L.loadSpec(id), unit: L.loadUnit(id) }; U[id].src = L.sourceOf(U[id].spec); });

/* ══ Α · ΣΤΑΤΙΚΑ ═══════════════════════════════════════════════════════ */
const ARX = fs.readFileSync(path.join(ROOT, 'arxaia.html'), 'utf8');
const SW = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
const LAUNCH = fs.readFileSync(path.join(__dirname, 'launcher.test.js'), 'utf8');
let PDF_OK = false;
try { const S = require('../tools/gnosto/source.js'); PDF_OK = fs.existsSync(S.PDF_DEFAULT); } catch (e) {}

IDS.forEach(id => {
  const { spec, unit, src } = U[id];
  const page = 'arxaia-' + id + '.html';
  section('Α · ' + id + ' — ' + (unit && unit.title));
  ok(!!unit && !!unit.align, 'η ενότητα υπάρχει στον Γνωστό, με align');
  eq(src.sha, spec.sourceSha, 'η πηγή του Φακέλου είναι ΑΚΡΙΒΩΣ αυτή που καρφώθηκε');
  if (PDF_OK){
    const c = require('../tools/gnosto/source.js').compose(spec);
    eq(c.sha, spec.sourceSha, 'και το source.js τη βγάζει ΤΩΡΑ ίδια από το PDF (τα rect δεν τρώνε γράμματα)');
  } else console.log('  ⚠️ δεν υπάρχει το PDF του Φακέλου — ο έλεγχος «το PDF τη βγάζει ίδια» ΔΕΝ έτρεξε');
  const errs = L.check(spec, unit, src);
  eq(errs.length, 0, 'ο validator δεν βρίσκει τίποτα' + (errs.length ? ' — ' + errs.slice(0, 3).join(' | ') : ''));
  const html = fs.readFileSync(path.join(ROOT, page), 'utf8');
  eq(html, B.render(id).html, page + ' === build(' + id + ') — καμία χειροκίνητη αλλαγή');
  ok(!/<script[^>]+src=/i.test(html), 'κανένα εξωτερικό script (άρα κανένα sync — σταθ. 8)');
  ok(!/\{\{[^}]*\}\}/.test(html), 'κανένα placeholder δεν έμεινε στη σελίδα');
  ok(html.indexOf('href="arxaia.html#gn"') > 0 && !/kx-exit/.test(html), 'η έξοδος γυρνάει στον Γνωστό (#gn), όχι στο Κέντρο');
  ok(!/@media\s*\(\s*min-width/i.test(html), 'κανένα min-width (σταθ. 51)');
  ok(html.indexOf("'arx:gn'") < 0, 'δεν γράφει στο συγχρονισμένο arx:gn (σταθ. 16)');
  ok(!/[⭐⚠]/.test(JSON.stringify(spec)), 'κανένα ⭐/⚠️ μέσα στα δικά μου κείμενα του JSON (§⑧)');
  eq(Object.keys(spec.words).length, Object.keys(unit.align.pairs).length, 'κάθε ζευγάρι έχει κάρτα (' + Object.keys(spec.words).length + ')');
  const paras = B.paraOf(unit);
  eq(Object.keys(paras).length, unit.align.segs.length, 'κάθε περίοδος ανήκει σε μία παράγραφο/ατάκα');
  const ck = spec.checks || {};
  ok(Object.keys(ck).length >= 6, 'το JSON δηλώνει τα μετρημένα του (checks)');
  const got = { segs: unit.align.segs.length, pairs: Object.keys(unit.align.pairs).length, clauses: Object.keys(spec.structure.clauses).length,
    scholia: spec.scholia.length, acts: spec.activities.reduce((n, g) => n + g.items.length, 0),
    pars: spec.parallels.reduce((n, p) => n + p.items.length, 0), lexika: spec.lexika.length, paras: unit.ancient.length };
  Object.keys(ck).forEach(k => eq(got[k], ck[k], 'checks.' + k + ' = ' + ck[k]));
  ok(ARX.indexOf('href="' + page + '"') > 0, 'η πόρτα στο μάθημα του Γνωστού (arxaia.html)');
  ok(SW.indexOf("'" + page + "'") > 0, 'στο CORE του sw.js (αλλιώς χάνεται offline)');
  ok(LAUNCH.indexOf("'" + page + "': 'arxaia.html'") > 0, 'στα CHILDREN του launcher.test.js');
});

section('Α · ΦΡΟΥΡΟΣ 7b — ΚΑΜΙΑ INSTRUMENT SERIF ΣΕ ΕΛΛΗΝΙΚΑ (το πρότυπο)');
const TPL = fs.readFileSync(path.join(ROOT, 'tools', 'gnosto', 'gk.tpl'), 'utf8');
const css = (TPL.match(/<style>([\s\S]*?)<\/style>/) || [, ''])[1];
const serifSel = [];
css.replace(/([^{}]+)\{([^}]*)\}/g, (m, sel, body) => { if (/var\(--serif\)/.test(body)) serifSel.push(sel.trim()); return m; });
const ALLOWED = ['.face .n', '.band .bn'];
ok(serifSel.length && serifSel.every(s => ALLOWED.indexOf(s) >= 0), 'το --serif μπαίνει ΜΟΝΟ σε αριθμούς (' + serifSel.join(' | ') + ')', serifSel);
['.an', '.md', 'h1', '.sxc h4', '.qa .q', '.qa .qn', '.wc-an', '.intro'].forEach(s => {
  const re = new RegExp('(^|\\})\\s*' + s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\{[^}]*font-family:var\\(--gr\\)');
  ok(re.test(css), 'το «' + s + '» είναι GFS Didot');
});
ok(!/Γρυπάρ|Σκουτερόπουλ|Ρουσό/.test(TPL + fs.readFileSync(path.join(ROOT, 'tools', 'gnosto', 'build.js'), 'utf8')),
  'το πρότυπο και το build δεν ξέρουν ονόματα μιας ενότητας (όλα από το JSON)');

/* ══ Μ · ΜΕΤΑΛΛΑΞΕΙΣ (gk9 = αναφορά) ══════════════════════════════════ */
if (U.gk9){
  section('Μ · Ο VALIDATOR ΔΑΓΚΩΝΕΙ (μεταλλάξεις πάνω στην gk9)');
  const { spec, unit, src } = U.gk9;
  const mut = fn => { const s = JSON.parse(JSON.stringify(spec)); fn(s); return L.check(s, unit, src).length; };
  ok(mut(s => { s.scholia[3].body = s.scholia[3].body.replace('Αγαθού', 'Ωραίου'); }) > 0, 'μία λέξη αλλαγμένη σε σχόλιο → σφάλμα');
  ok(mut(s => { s.scholia.pop(); }) > 0, 'ένα σχόλιο λιγότερο → σφάλμα (πρέπει να είναι ΟΛΑ)');
  ok(mut(s => { s.second.paras[0] = s.second.paras[0].replace('μερικοί', 'κάποιοι'); }) > 0, 'μία λέξη της 2ης μετάφρασης → σφάλμα');
  ok(mut(s => { s.second.paras = [s.second.paras.join(' ')]; }) > 0, '2η μετάφραση σε λάθος πλήθος παραγράφων → σφάλμα');
  ok(mut(s => { s.second.name = ''; }) > 0, '2η μετάφραση χωρίς όνομα → σφάλμα');
  ok(mut(s => { s.activities[0].items[0].q = s.activities[0].items[0].q.replace('παιδεία', 'μόρφωση'); }) > 0, 'ερώτηση που δεν είναι του βιβλίου → σφάλμα');
  ok(mut(s => { s.activities[0].items[1].model.push({ k: 'q', an: 'ἡ ἀρετὴ διδακτόν ἐστιν', x: '—' }); }) > 0, 'παράθεμα που δεν υπάρχει στο αρχαίο → σφάλμα');
  ok(mut(s => { s.activities[0].items[1].model.push({ k: 'p', x: 'όπως λέει «ἡ ψυχὴ ἀθάνατος»' }); }) > 0, 'πολυτονικό «…» μέσα σε πρόζα που δεν υπάρχει → σφάλμα');
  ok(mut(s => { s.activities[2].items[0].model.push({ k: 'tq', who: 'second', an: 'η παιδεία είναι η τέχνη της στροφής', x: '—' }); }) > 0, 'ψεύτικο παράθεμα της 2ης μετάφρασης → σφάλμα');
  ok(mut(s => { s.activities[2].items[0].model.push({ k: 'tq', who: 'κάποιος', an: 'Τότε, είπα', x: '—' }); }) > 0, 'άγνωστο who → σφάλμα');
  ok(mut(s => { s.activities[0].items[0].model = s.activities[0].items[0].model.filter(b => b.k !== 's'); }) > 0, 'υπόδειγμα χωρίς «Και γι’ αυτό» → σφάλμα');
  ok(mut(s => { s.activities[0].items[0].model = s.activities[0].items[0].model.filter(b => b.k !== 'q'); }) > 0, 'υπόδειγμα χωρίς παράθεμα → σφάλμα');
  ok(mut(s => { s.activities[1].items[0].id = s.activities[0].items[0].id; }) > 0, 'διπλό id ερώτησης → σφάλμα');
  ok(mut(s => { s.words.c13[1] = 'απαρέμφατο ενεστ.'; }) > 0, '«απαρέμφατο» σε λέξη χωρίς κατάληξη απαρεμφάτου → σφάλμα');
  ok(mut(s => { s.words.a6[1] = 'μετοχή αορ.'; }) > 0, '«μετοχή» σε απαρέμφατο → σφάλμα');
  ok(mut(s => { delete s.words.q15; }) > 0, 'λέξη χωρίς κάρτα → σφάλμα');
  ok(mut(s => { s.words.q15 = ['', '', '']; }) > 0, 'κενή κάρτα (όπως τη στήνει το scaffold) → σφάλμα');
  ok(mut(s => { delete s.structure.clauses['12']; }) > 0, 'η Δομή δείχνει σε πρόταση που δεν ορίζεται → σφάλμα');
  ok(mut(s => { s.structure.runs['7'] = [[0, 8]]; }) > 0, 'πρόταση που ορίζεται αλλά χάθηκε από τη Δομή → σφάλμα');
  ok(mut(s => { s.structure.runs['9'] = []; }) > 0, 'περίοδος χωρίς Δομή → σφάλμα');
  ok(mut(s => { s.lexika[0].rel = ['παιδί']; }) > 0, 'λεξιλογικό με λιγότερα από 3 ομόρριζα → σφάλμα');
  ok(mut(s => { s.sourceSha = '0'.repeat(64); }) > 0, 'άλλη πηγή → σφάλμα');
  {
    const P = unit.align.pairs, one = Object.keys(P).find(k => unit.align.segs.reduce((a, g) => a + g.m.filter(c => c[1] === k).length, 0) === 1 && /^[α-ω]/.test(P[k].m));
    ok(mut(s => { s.easy = { [one]: 'κάτι απλό' }; }) === 0, '«πες το απλά» σωστό (' + one + ') → κανένα σφάλμα');
    ok(mut(s => { s.easy = { zz: 'κάτι' }; }) > 0, '«πες το απλά» σε κλειδί που δεν υπάρχει → σφάλμα');
    ok(mut(s => { s.easy = { [one]: P[one].m }; }) > 0, '«πες το απλά» ίδιο με του μεταφραστή → σφάλμα');
    ok(mut(s => { s.easy = { [one]: 'κάτι … άλλο' }; }) > 0, '«πες το απλά» με λάθος πλήθος κομματιών → σφάλμα');
    ok(mut(s => { s.easy = { [one]: 'Κάτι' }; }) > 0, '«πες το απλά» με κεφαλαίο που δεν έχει η μετάφραση → σφάλμα');
    ok(mut(s => { s.easy = { [one]: 'τὸ ἁπλό' }; }) > 0, '«πες το απλά» σε πολυτονικό → σφάλμα');
  }
  {
    /* «απλή μετάφραση»: μία ανά περίοδο, ούτε λείπει ούτε περισσεύει */
    const ns = unit.align.segs.map(g => String(g.n)), full = {};
    ns.forEach(n => { full[n] = 'κάτι απλό ' + n; });
    ok(mut(s => { s.aplh = { name: 'Απλή', segs: Object.assign({}, full) }; }) === 0, 'απλή μετάφραση σε κάθε περίοδο → κανένα σφάλμα');
    ok(mut(s => { const x = Object.assign({}, full); delete x[ns[0]]; s.aplh = { name: 'Απλή', segs: x }; }) > 0, 'απλή μετάφραση που ξεχνά μια περίοδο → σφάλμα');
    ok(mut(s => { s.aplh = { name: 'Απλή', segs: Object.assign({ 999: 'κάτι' }, full) }; }) > 0, 'απλή μετάφραση σε περίοδο που δεν υπάρχει → σφάλμα');
    ok(mut(s => { s.aplh = { name: 'Απλή', segs: Object.assign({}, full, { [ns[0]]: 'τὸ ἁπλό' }) }; }) > 0, 'απλή μετάφραση σε πολυτονικό → σφάλμα');
    ok(mut(s => { s.aplh = { name: 'Απλή', segs: Object.assign({}, full), changes: [['α', 'β']] }; }) > 0, 'αλλαγή χωρίς «γιατί» → σφάλμα');
  }
  /* ανάμειξη στηλών: η πηγή αλλάζει, όχι το JSON — όπως το κείμενο που επικόλλησε για την 9η */
  const src2 = JSON.parse(JSON.stringify(src));
  src2.blocks.grypari += ' ' + L.norm('Απεναντίας, η τωρινή διερεύνησή μας, είπα εγώ, δείχνει αυτή τη δύναμη της γνώσης');
  ok(L.check(spec, unit, src2).some(e => /λάθος στήλη/.test(e)), 'γραμμή της μετάφρασης που μαθαίνει μέσα στη 2η → «λάθος στήλη»');
}

/* ══ Β · ΑΛΗΘΙΝΟ CHROME ═══════════════════════════════════════════════ */
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.json': 'application/json' };
let netHits = 0, FRAME = '';
const server = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  if (/sync|supabase|topbar|nova/i.test(u)) { netHits++; res.writeHead(200, { 'Content-Type': MIME['.js'] }); res.end(''); return; }
  if (u === '/frame.html') { res.writeHead(200, { 'Content-Type': MIME['.html'] }); res.end('<!doctype html><meta charset=utf-8><body style="margin:0;background:#000"><iframe id=f src="/' + FRAME + '" style="width:393px;height:860px;border:0"></iframe>'); return; }
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
  const udd = '/tmp/cdp-gnosto-' + process.pid;
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
  const shot = async name => { if (!SHOTS) return; const r = await S('Page.captureScreenshot', { format: 'png' }); fs.writeFileSync(path.join(SHOTS, name + '.png'), Buffer.from(r.data, 'base64')); };
  const shotAt = async (name, sel) => { if (!SHOTS) return;
    await ev(`(()=>{document.documentElement.style.scrollBehavior='auto';const e=document.querySelector(${JSON.stringify(sel)});if(e)window.scrollTo(0,e.getBoundingClientRect().top+scrollY-20);return 1})()`);
    await sleep(150); await shot(name); await ev(`window.scrollTo(0,0);document.documentElement.style.scrollBehavior='';1`); };
  const noScroll = async (label) => {
    const r = await ev(`(()=>{const d=document.documentElement;
      const inScroller=el=>{for(let p=el.parentElement;p;p=p.parentElement){const o=getComputedStyle(p).overflowX;if(o==='auto'||o==='scroll')return true}return false};
      const wide=[...document.querySelectorAll('.shell *')].filter(el=>{if(el.offsetParent===null)return false;const b=el.getBoundingClientRect();return b.width&&b.right>innerWidth+1&&!inScroller(el)}).map(el=>(el.className||el.tagName)+'').slice(0,5);
      const clip=[...document.querySelectorAll('.shell p, .shell h1, .shell h2, .shell h3, .shell h4, .shell li, .shell td')].filter(el=>el.offsetParent!==null&&el.scrollWidth>el.clientWidth+1&&getComputedStyle(el).overflowX!=='visible').map(el=>el.className||el.tagName).slice(0,5);
      return {sw:d.scrollWidth,cw:d.clientWidth,wide,clip}})()`);
    ok(r.sw <= r.cw && !r.wide.length && !r.clip.length, label + ' — μηδέν οριζόντια κύλιση (' + r.sw + ' ≤ ' + r.cw + ')', r);
  };

  for (const gid of IDS) {
    const { spec, unit } = U[gid];
    const PAGE = 'arxaia-' + gid + '.html';
    const open = async (hash) => { await S('Page.navigate', { url: BASE + PAGE + '?n=' + (++nav) + (hash || '') }); await sleep(150);
      for (let i = 0; i < 80; i++) { try { if (await ev(`document.readyState==='complete' && document.querySelectorAll('.sent').length>0`)) break; } catch (e) {} await sleep(100); }
      await ev(`document.fonts ? document.fonts.ready.then(()=>1) : 1`); await sleep(200); };
    const segs = unit.align.segs, n1 = segs[0].n, n2 = segs[Math.min(1, segs.length - 1)].n;
    const allQ = spec.activities.reduce((a, g) => a.concat(g.items), []).concat(spec.parallels.reduce((a, p) => a.concat(p.items), []));
    try {
      exc.length = 0;
      section('Β · ' + gid + ' — ΤΡΕΧΕΙ, ΚΑΙ Η ΜΕΤΑΦΡΑΣΗ ΕΙΝΑΙ ΣΤΗΝ ΟΘΟΝΗ');
      await size(1440, 900);
      await open(); await ev(`localStorage.clear()`); await open();
      eq(exc.length, 0, 'μηδέν εξαιρέσεις στη φόρτωση' + (exc.length ? ' — ' + exc[0] : ''));
      eq(netHits, 0, 'κανένα sync/supabase/topbar δεν ζητήθηκε');
      eq(await ev(`document.querySelectorAll('.sent').length`), segs.length, segs.length + ' περίοδοι στην οθόνη');
      eq(await ev(`document.querySelectorAll('.sent.turn').length`), unit.ancient.length - 1, (unit.ancient.length - 1) + ' αλλαγές παραγράφου/ατάκας');
      eq(nz(await ev(`[...document.querySelectorAll('.an')].map(p=>p.textContent).join(' ')`)), nz(unit.ancient.map(b => b.p).join(' ')), 'το αρχαίο στην οθόνη = το αρχαίο της ενότητας, γράμμα-γράμμα');
      eq(nz(await ev(`[...document.querySelectorAll('.md')].map(p=>p.textContent).join(' ')`)), nz(unit.text.map(b => b.p).join(' ')), 'η μετάφραση στην οθόνη = η μετάφραση της ενότητας, γράμμα-γράμμα');
      ok(await ev(`/Πάτα μια λέξη/.test(document.getElementById('aside').textContent)`), 'η άδεια κάρτα λέει τι να κάνει');
      await shot(gid + '-01-read');

      section('Β · ' + gid + ' — Η ΚΑΡΤΑ ΤΗΣ ΛΕΞΗΣ');
      const k0 = spec.scholia[0].keys[0], w0 = spec.words[k0];
      await ev(`document.querySelector('.an .w[data-k="${k0}"]').click()`);
      const card = await ev(`document.getElementById('aside').textContent`);
      ok(card.indexOf(w0[0]) >= 0 && card.indexOf(w0[1]) >= 0 && card.indexOf(w0[2]) >= 0, 'η κάρτα του «' + unit.align.pairs[k0].a + '» δείχνει λήμμα, τύπο, συντακτικό');
      ok(card.indexOf(spec.scholia[0].lemma) >= 0, 'και το σχόλιο του βιβλίου που την αφορά');
      ok(!/[⭐⚠]/.test(card), 'χωρίς ⭐/⚠️ στην κάρτα (§⑧)');
      const segK = segs.find(s => s.a.some(c => c[1] === k0));
      const want = segK.a.filter(c => c[1] === k0).length + segK.m.filter(c => c[1] === k0).length;
      eq(await ev(`document.querySelectorAll('.w.hit').length`), want, 'ανάβει σε αρχαίο ΚΑΙ μετάφραση (' + want + ' θέσεις)');
      await shotAt(gid + '-02-card', '.sent[data-n="' + segK.n + '"]');
      await ev(`document.querySelector('#aside [data-sch]').click()`);
      ok(await ev(`document.getElementById('p-sxolia').classList.contains('on')`), 'το σχόλιο της κάρτας ανοίγει την καρτέλα «Σχόλια»');
      await ev(`document.querySelector('.tab[data-tab="metafrasi"]').click(); document.querySelector('.an .w.hit') && document.querySelector('.an .w.hit').click()`);

      section('Β · ' + gid + ' — ΦΑΚΟΙ');
      for (const [lk] of L.LENSES) {
        const want2 = Object.keys(spec.words).filter(k => (L.tagsOf(spec.words[k][1], spec.words[k][3]).concat(spec.scholia.some(s => s.keys.indexOf(k) >= 0) ? ['sch'] : [])).indexOf(lk) >= 0).sort();
        const has = await ev(`!!document.querySelector('.lens[data-lens="${lk}"]')`);
        if (!want2.length) { ok(!has, 'φακός «' + lk + '»: κανένα κουμπί όταν δεν υπάρχει τίποτα'); continue; }
        await ev(`document.querySelector('.lens[data-lens="${lk}"]').click()`);
        const lit = (await ev(`[...new Set([...document.querySelectorAll('.an .w')].filter(w=>!w.classList.contains('hit')&&getComputedStyle(w).opacity==='1').map(w=>w.dataset.k))]`)).sort();
        ok(JSON.stringify(lit) === JSON.stringify(want2), 'ο φακός «' + lk + '» ανάβει ΑΚΡΙΒΩΣ ' + want2.length + ' λέξεις', { lit: lit.length });
        if (lk === 'part') await shot(gid + '-03-lens');
        await ev(`document.querySelector('.lens[data-lens="${lk}"]').click()`);
      }

      section('Β · ' + gid + ' — ΠΕΣ ΤΟ ΑΠΛΑ (απλές λέξεις)');
      const EZ = spec.easy || {}, ezK = Object.keys(EZ).sort();
      const hdK = (await ev(`[...new Set([...document.querySelectorAll('.md .w.hd')].map(w=>w.dataset.k))]`)).sort();
      eq(JSON.stringify(hdK), JSON.stringify(ezK), 'τελίτσες ΑΚΡΙΒΩΣ στις ' + ezK.length + ' λέξεις που έχουν απλή απόδοση');
      if (!ezK.length) {
        ok(await ev(`document.getElementById('easyT').hidden`), 'χωρίς απλές λέξεις, κανένας διακόπτης');
      } else {
        ok(!(await ev(`document.getElementById('easyT').hidden`)), 'ο διακόπτης «Απλές λέξεις» φαίνεται στο «Διάβασε»');
        eq(await ev(`document.getElementById('easyN').textContent`), String(ezK.length), 'και λέει πόσες είναι');
        const ezText = segs.map(g => { const seen = {}; return g.m.map(c => { if (!c[1] || !EZ[c[1]]) return c[0]; const j = seen[c[1]] = (seen[c[1]] || 0) + 1; return EZ[c[1]].split(' … ')[j - 1] + c[0].slice(c[0].replace(/\s+$/, '').length); }).join(''); }).join(' ');
        await ev(`document.getElementById('easyI').click()`);
        eq(nz(await ev(`[...document.querySelectorAll('.md')].map(p=>p.textContent).join(' ')`)), nz(ezText), 'με τον διακόπτη, κάθε περίοδος διαβάζεται με τις απλές λέξεις στη θέση τους');
        eq(await ev(`document.querySelectorAll('.md .w.hd').length`), 0, 'και καμία δύσκολη δεν έμεινε');
        const multi = ezK.find(k => / … /.test(EZ[k])) || ezK[0];
        const segM = segs.find(g => g.m.some(c => c[1] === multi));
        await ev(`document.querySelector('.md .w.ez[data-k="${multi}"]').click()`);
        const c2 = await ev(`document.getElementById('aside').textContent`);
        ok(c2.indexOf(EZ[multi]) >= 0 && c2.indexOf(unit.align.pairs[multi].m) >= 0, 'πατώντας μια απλή, η κάρτα δείχνει ΚΑΙ τη λέξη του βιβλίου («' + unit.align.pairs[multi].m + '»)');
        eq(await ev(`document.querySelectorAll('.w.hit').length`), segM.a.filter(c => c[1] === multi).length + EZ[multi].split(' … ').length, 'και ανάβει το ζευγάρι σε αρχαίο ΚΑΙ απλή απόδοση');
        await shotAt(gid + '-05-easy', '.sent[data-n="' + segM.n + '"]');
        await open();
        ok(await ev(`document.getElementById('easyI').checked && document.querySelectorAll('.md .w.ez').length>0`), 'ο διακόπτης θυμάται τη θέση του μετά το reload');
        await ev(`document.querySelector('[data-mode="st"]').click()`);
        ok(await ev(`document.getElementById('easyT').hidden`), 'στη «Δομή» (χωρίς μετάφραση) ο διακόπτης κρύβεται');
        await ev(`document.querySelector('[data-mode="rd"]').click(); document.getElementById('easyI').click()`);
        eq(nz(await ev(`[...document.querySelectorAll('.md')].map(p=>p.textContent).join(' ')`)), nz(unit.text.map(b => b.p).join(' ')), 'κλειστός ξανά: η μετάφραση του βιβλίου, γράμμα-γράμμα');
      }

      section('Β · ' + gid + ' — ΑΚΡΙΒΗΣ / ΑΠΛΗ ΜΕΤΑΦΡΑΣΗ');
      if (!spec.aplh) {
        ok(await ev(`document.getElementById('verRow').hidden`), 'χωρίς απλή μετάφραση, κανένας επιλογέας');
      } else {
        const AP = spec.aplh;
        ok(!(await ev(`document.getElementById('verRow').hidden`)), 'ο επιλογέας φαίνεται στο «Διάβασε»');
        ok(await ev(`document.querySelector('[data-ver="ak"]').getAttribute('aria-pressed')==='true'`), 'ξεκινά στην ακριβή');
        ok((await ev(`document.querySelector('[data-ver="ak"]').textContent`)).indexOf(unit.translator) >= 0, 'και η ακριβής λέει ποιος την έγραψε (' + unit.translator + ')');
        await ev(`document.querySelector('[data-ver="ap"]').click()`);
        eq(JSON.stringify(await ev(`[...document.querySelectorAll('.sent')].map(r=>r.querySelector('.md').textContent)`)), JSON.stringify(segs.map(g => AP.segs[g.n])), 'στην απλή, ΚΑΘΕ περίοδος δείχνει τη δική της απλή απόδοση, αυτολεξεί');
        ok(await ev(`document.getElementById('easyT').hidden`), 'και ο διακόπτης «Απλές λέξεις» κρύβεται (δεν μπλέκονται δύο)');
        await ev(`document.querySelector('.an .w').click()`);
        ok(await ev(`document.getElementById('aside').textContent.length>20`), 'η λέξη του αρχαίου ανοίγει ακόμη την κάρτα της');
        await shotAt(gid + '-06-aplh', '.sent[data-n="' + segs[1].n + '"]');
        /* ΔΙΟΡΘΩΣΕ: το δικό του παράδειγμα — «Τι λοιπόν;» → «Τότε;» (= ο Σκουτερόπουλος) */
        const g0 = segs[0], g1 = segs[1], g2 = segs[2];
        const book = g => g.m.map(c => c[0]).join('').trim();
        const R = n => `document.querySelector('.sent[data-n="${n}"]')`;
        ok(await ev(`getComputedStyle(${R(g0.n)}.querySelector('.apx')).display!=='none'`), 'στην απλή, κάθε περίοδος έχει «Διόρθωσε»');
        await ev(`${R(g0.n)}.querySelector('[data-apx="edit"]').click()`);
        eq(await ev(`${R(g0.n)}.querySelector('.ape').value`), AP.segs[g0.n], 'το «Διόρθωσε» ανοίγει το κείμενο της απλής για αλλαγή');
        await ev(`${R(g0.n)}.querySelector('.ape').value=${JSON.stringify(book(g0))}; ${R(g0.n)}.querySelector('[data-apx="save"]').click()`);
        eq(await ev(`${R(g0.n)}.querySelector('.md').textContent`), book(g0), 'γράφει «' + book(g0) + '» και η περίοδος το δείχνει');
        ok((await ev(`${R(g0.n)}.querySelector('.apx').textContent`)).indexOf('Εδώ η κανονική') >= 0, 'και αφού είναι ίδιο με του βιβλίου, λέγεται «Εδώ η κανονική»');
        await ev(`${R(g1.n)}.querySelector('[data-apx="edit"]').click(); ${R(g1.n)}.querySelector('.ape').value='  Δική μου   απόδοση  '; ${R(g1.n)}.querySelector('[data-apx="save"]').click()`);
        eq(await ev(`${R(g1.n)}.querySelector('.md').textContent`), 'Δική μου απόδοση', 'δική του απόδοση (με τα κενά καθαρισμένα)');
        ok((await ev(`${R(g1.n)}.querySelector('.apx').textContent`)).indexOf('Δική σου') >= 0, 'και σημαδεύεται «Δική σου»');
        await ev(`${R(g2.n)}.querySelector('[data-apx="book"]').click()`);
        eq(await ev(`${R(g2.n)}.querySelector('.md').textContent`), book(g2), '«Εδώ θέλω την κανονική» βάζει τον ' + unit.translator + ' σε ΑΥΤΗ την περίοδο');
        eq(await ev(`${R(segs[3].n)}.querySelector('.md').textContent`), AP.segs[segs[3].n], 'και οι άλλες περίοδοι μένουν όπως ήταν');
        await ev(`${R(g2.n)}.querySelector('[data-apx="edit"]').click(); ${R(g2.n)}.querySelector('.ape').value='κάτι'; ${R(g2.n)}.querySelector('[data-apx="cancel"]').click()`);
        eq(await ev(`${R(g2.n)}.querySelector('.md').textContent`), book(g2), 'το «Άκυρο» δεν αλλάζει τίποτα');
        await open();
        eq(JSON.stringify(await ev(`[${g0.n},${g1.n},${g2.n}].map(n=>document.querySelector('.sent[data-n="'+n+'"] .md').textContent)`)), JSON.stringify([book(g0), 'Δική μου απόδοση', book(g2)]), 'οι διορθώσεις μένουν μετά το reload');
        await ev(`document.querySelector('[data-mode="wh"]').click()`);
        ok((await ev(`document.querySelector('#wholeBox .mod:not(.gry)').textContent`)).indexOf('Δική μου απόδοση') >= 0, 'και φαίνονται και στο «Ολόκληρο»');
        await ev(`document.querySelector('[data-mode="tr"]').click()`);
        ok(await ev(`getComputedStyle(${R(g0.n)}.querySelector('.apx')).display==='none'`), 'στο «Μετάφρασε» τα κουμπιά διόρθωσης κρύβονται (δεν προδίδουν τη μετάφραση)');
        await ev(`document.querySelector('[data-mode="rd"]').click()`);
        await shotAt(gid + '-06-aplh-edit', '.sent[data-n="' + g0.n + '"]');
        for (const g of [g0, g1, g2]) await ev(`${R(g.n)}.querySelector('[data-apx="undo"]').click()`);
        eq(JSON.stringify(await ev(`[${g0.n},${g1.n},${g2.n}].map(n=>document.querySelector('.sent[data-n="'+n+'"] .md').textContent)`)), JSON.stringify([g0, g1, g2].map(g => AP.segs[g.n])), '«Γύρνα στην απλή» φέρνει πίσω την απλή του αρχείου');
        eq(await ev(`localStorage.getItem('${gid}_ap_v1')`), '{}', 'και δεν μένει τίποτα αποθηκευμένο');
        await ev(`document.querySelector('[data-mode="wh"]').click()`);
        ok(!(await ev(`document.getElementById('verRow').hidden`)), 'ο επιλογέας φαίνεται και στο «Ολόκληρο»');
        eq(nz(await ev(`[...document.querySelectorAll('#wholeBox .mod:not(.gry) p')].map(p=>p.textContent).join(' ')`)), nz(segs.map(g => AP.segs[g.n]).join(' ')), 'στο «Ολόκληρο» η στήλη «Μαθαίνεις» είναι η απλή, ολόκληρη');
        eq(await ev(`document.querySelectorAll('#wholeBox .mod:not(.gry) p').length`), unit.ancient.length, 'σε τόσες παραγράφους όσες οι ατάκες του αρχαίου (' + unit.ancient.length + ')');
        eq(await ev(`document.querySelectorAll('#wholeBox .chg tbody tr').length`), (AP.changes || []).length, 'και από κάτω ο πίνακας «τι άλλαξε» (' + (AP.changes || []).length + ' γραμμές)');
        await shotAt(gid + '-06-aplh-whole', '#wholeBox');
        await ev(`document.querySelector('[data-mode="st"]').click()`);
        ok(await ev(`document.getElementById('verRow').hidden`), 'στη «Δομή» (χωρίς μετάφραση) ο επιλογέας κρύβεται');
        await open();
        ok(await ev(`document.querySelector('[data-ver="ap"]').getAttribute('aria-pressed')==='true'`), 'θυμάται την επιλογή μετά το reload');
        await ev(`document.querySelector('[data-mode="rd"]').click(); document.querySelector('[data-ver="ak"]').click()`);
        eq(nz(await ev(`[...document.querySelectorAll('.md')].map(p=>p.textContent).join(' ')`)), nz(unit.text.map(b => b.p).join(' ')), 'πίσω στην ακριβή: η μετάφραση του βιβλίου, γράμμα-γράμμα');
        eq(nz(await ev(`[...document.querySelectorAll('#wholeBox .mod:not(.gry) p')].map(p=>p.textContent).join(' ')`)), nz(unit.text.map(b => b.p).join(' ')), 'και στο «Ολόκληρο» ξανά ο ' + unit.translator);
      }

      section('Β · ' + gid + ' — ΜΕΤΑΦΡΑΣΕ (✗ ↻ ✓) ΚΑΙ RELOAD');
      await ev(`document.querySelector('[data-mode="tr"]').click()`);
      eq(await ev(`[...document.querySelectorAll('.md')].filter(p=>getComputedStyle(p).display!=='none').length`), 0, 'η μετάφραση κρύβεται σε όλες τις περιόδους');
      await ev(`document.querySelector('.sent[data-n="${n1}"] .veil').click()`);
      ok(await ev(`getComputedStyle(document.querySelector('.sent[data-n="${n1}"] .md')).display!=='none'`), 'το «πάτα για να την ελέγξεις» δείχνει ΜΟΝΟ εκείνη');
      await ev(`document.querySelector('.sent[data-n="${n1}"] .g3.x').click()`);
      if (n2 !== n1) await ev(`document.querySelector('.sent[data-n="${n2}"] .veil').click(); document.querySelector('.sent[data-n="${n2}"] .g3.k').click()`);
      eq(await ev(`document.getElementById('bTr').textContent`), n2 !== n1 ? '1' : '0', 'η ταινία μετράει τις ✓');
      await ev(`document.getElementById('onlyRedI').click()`);
      eq(await ev(`document.querySelectorAll('.sent:not(.gone)').length`), 1, '«Μόνο τα κόκκινα» αφήνει μόνο την ✗');
      await open();
      const stored = JSON.parse(await ev(`localStorage.getItem('${gid}_tr_v1')`));
      eq(stored[n1], 'x', 'η κρίση αποθηκεύτηκε, στο κλειδί της ενότητας (' + gid + '_tr_v1)');
      eq(await ev(`document.querySelector('.sent[data-n="${n1}"] .mk').textContent`), '✗ ξανά', 'και φαίνεται μετά το reload');
      await ev(`document.getElementById('bReset').click()`);
      ok(await ev(`localStorage.getItem('${gid}_tr_v1')`) !== '{}', 'το «μηδένισε» θέλει ΔΕΥΤΕΡΟ πάτημα');
      await ev(`document.getElementById('bReset').click()`);
      eq(await ev(`localStorage.getItem('${gid}_tr_v1')`), '{}', 'και με το δεύτερο μηδενίζει');

      section('Β · ' + gid + ' — ΔΟΜΗ');
      await ev(`document.querySelector('[data-mode="st"]').click()`);
      const br = await ev(`[...document.querySelectorAll('.sent .an')].map(p=>{const t=[...p.querySelectorAll('.br')].map(b=>b.textContent.replace(/\\d/g,''));let o=0,ok=true;t.forEach(c=>{if(c==='['||c==='(')o++;else{o--;if(o<0)ok=false}});return ok&&o===0})`);
      ok(br.every(Boolean), 'σε κάθε περίοδο οι αγκύλες ανοίγουν και κλείνουν σωστά');
      eq(await ev(`new Set([...document.querySelectorAll('.cl')].map(c=>c.dataset.q)).size`), Object.keys(spec.structure.clauses).length, 'όλες οι προτάσεις εμφανίζονται');
      eq(nz((await ev(`[...document.querySelectorAll('.an')].map(p=>p.textContent).join(' ')`)).replace(/[\[\]()]\d*/g, '')), nz(unit.ancient.map(b => b.p).join(' ').replace(/[()]/g, '')), 'οι αγκύλες δεν έφαγαν ούτε πρόσθεσαν γράμμα');
      const dep = segs.find(s => s.a.length && spec.structure.runs[s.n].some(r => spec.structure.clauses[r[1]].d));
      if (dep) {
        const q = spec.structure.runs[dep.n].find(r => spec.structure.clauses[r[1]].d)[1];
        await ev(`document.querySelector('.sent[data-n="${dep.n}"] .clauses li[data-q="${q}"]').click()`);
        ok(await ev(`!!document.querySelector('.sent[data-n="${dep.n}"] .cl.on[data-q="${q}"]')`), 'πατώντας μια δευτερεύουσα ανάβει μέσα στο κείμενο');
        await shotAt(gid + '-04-structure', '.sent[data-n="' + dep.n + '"]');
      }

      section('Β · ' + gid + ' — ΑΠΛΑ ΛΟΓΙΑ · ΟΛΟΚΛΗΡΟ (+ 2η μετάφραση)');
      await ev(`document.querySelector('[data-mode="si"]').click()`);
      eq(await ev(`document.querySelectorAll('#simple p').length`), (unit.simple || []).length, 'τα «απλά λόγια» όλα');
      await ev(`document.querySelector('[data-mode="wh"]').click()`);
      eq(await ev(`document.getElementById('secName').textContent`), spec.second.name, 'ο διακόπτης ονομάζει τη 2η μετάφραση');
      await ev(`document.getElementById('grypI').checked || document.getElementById('grypI').click()`);
      ok(nz(await ev(`document.querySelector('.whole .gry').textContent`)).indexOf(nz(spec.second.paras.join(' '))) >= 0, 'όταν ανοίξει, είναι ΟΛΗ η 2η μετάφραση, αυτολεξεί');
      await shotAt(gid + '-05-whole', '#wholeBox');

      section('Β · ' + gid + ' — ΣΧΟΛΙΑ');
      await ev(`document.querySelector('.tab[data-tab="sxolia"]').click()`);
      eq(await ev(`document.querySelectorAll('.sxc').length`), spec.scholia.length, spec.scholia.length + ' κάρτες σχολίων');
      const sxText = await ev(`document.getElementById('sxList').textContent + document.getElementById('introTxt').textContent`);
      ok(spec.scholia.every(s => nz(sxText).indexOf(nz(s.body)) >= 0) && nz(sxText).indexOf(nz(spec.intro)) >= 0, 'όλα τα σχόλια + η εισαγωγή φαίνονται αυτολεξεί');
      await shotAt(gid + '-06-scholia', '#sxList');
      await ev(`document.querySelector('[data-sxm="hide"]').click()`);
      eq(await ev(`[...document.querySelectorAll('.sxc .body')].filter(b=>getComputedStyle(b).display!=='none').length`), 0, '«Σκέπασε»: κρύβονται όλα');
      await ev(`document.querySelector('.sxc[data-i="0"] .cover-b').click(); document.querySelector('.sxc[data-i="0"] .g3.k').click()`);
      eq(await ev(`document.getElementById('bSx').textContent`), '1', 'το ✓ μετράει στην ταινία');
      await ev(`document.querySelector('.sxc[data-i="0"] [data-go]').click()`);
      ok(await ev(`document.getElementById('p-metafrasi').classList.contains('on') && document.querySelectorAll('.w.hit').length>0`), 'η λέξη του σχολίου ανοίγει τη Μετάφραση με τη λέξη αναμμένη');

      section('Β · ' + gid + ' — ΕΡΜΗΝΕΥΤΙΚΑ');
      await ev(`document.querySelector('.tab[data-tab="ermineia"]').click()`);
      eq(await ev(`document.querySelectorAll('.qa').length`), allQ.length, allQ.length + ' ερωτήσεις');
      eq(await ev(`[...document.querySelectorAll('.model')].filter(m=>getComputedStyle(m).display!=='none').length`), 0, 'τα υποδείγματα κλειστά — γράφει πρώτα αυτός');
      const par = await ev(`document.getElementById('parBox').textContent`);
      ok(spec.parallels.every(p => nz(par).indexOf(nz(p.text)) >= 0), 'τα παράλληλα κείμενα αυτολεξεί');
      const q0 = allQ[0], qq = q0.model.find(b => b.k === 'q');
      await ev(`document.querySelector('.qa[data-id="${q0.id}"] .mshow').click()`);
      const m0 = await ev(`document.querySelector('.qa[data-id="${q0.id}"] .model').textContent`);
      ok(m0.indexOf('δικό μου') >= 0 && m0.indexOf('Και γι’ αυτό') >= 0 && (!qq || m0.indexOf(qq.an) >= 0), 'το υπόδειγμα: ετικέτα «δικό μου», παράθεμα, «και γι’ αυτό»');
      await ev(`(()=>{const t=document.querySelector('.qa[data-id="${q0.id}"] textarea');t.value='Θέση: δοκιμή.';t.dispatchEvent(new Event('input',{bubbles:true}))})()`);
      await sleep(600);
      eq(await ev(`JSON.parse(localStorage.getItem('${gid}_ans_v1'))['${q0.id}']`), 'Θέση: δοκιμή.', 'η απάντησή του αποθηκεύεται');
      eq(await ev(`document.getElementById('bAns').textContent`), '1', 'και μετράει');
      await shotAt(gid + '-07-ermineia', '.qa[data-id="' + q0.id + '"]');

      section('Β · ' + gid + ' — ΛΕΞΙΛΟΓΙΚΑ · HASH');
      await ev(`document.querySelector('.tab[data-tab="lexika"]').click()`);
      eq(await ev(`document.querySelectorAll('#lxBody tr').length`), spec.lexika.length, spec.lexika.length + ' λέξεις');
      await ev(`document.getElementById('lxHide').click()`);
      ok(await ev(`document.getElementById('lxTbl').classList.contains('hidecol')`), '«Κρύψε τα ομόρριζα»');
      await shotAt(gid + '-08-lexika', '#p-lexika');
      const lk0 = spec.lexika[0].key;
      await ev(`document.querySelector('#lxBody [data-go="${lk0}"]').click()`);
      ok(await ev(`document.querySelectorAll('.an .w.hit[data-k="${lk0}"]').length>=1`), 'η λέξη ανοίγει μέσα στο κείμενο');
      await open('#sxolia');
      ok(await ev(`document.getElementById('p-sxolia').classList.contains('on')`), '#sxolia ανοίγει τα Σχόλια');

      section('Β · ' + gid + ' — ΠΛΑΤΗ 1440 → 393');
      for (const w of [1440, 1180, 1040, 860, 760, 560]) {
        await size(w, 900);
        for (const tb of ['metafrasi', 'sxolia', 'ermineia', 'lexika']) {
          await ev(`document.querySelector('.tab[data-tab="${tb}"]').click()`);
          if (tb === 'ermineia') await ev(`document.querySelectorAll('.qa .mshow').forEach(b=>{if(b.getAttribute('aria-pressed')!=='true')b.click()})`);
          await sleep(50);
          await noScroll(w + 'px · ' + tb);
        }
      }
      await ev(`document.querySelector('.tab[data-tab="metafrasi"]').click(); document.querySelector('[data-mode="st"]').click()`);
      await noScroll('560px · Δομή');
      FRAME = PAGE;
      await size(420, 900);
      await S('Page.navigate', { url: BASE + 'frame.html?n=' + (++nav) }); await sleep(900);
      const fr = await ev(`(()=>{const d=document.getElementById('f').contentDocument;return {sw:d.documentElement.scrollWidth,cw:d.documentElement.clientWidth}})()`);
      ok(fr.sw <= fr.cw && fr.cw === 393, '393px (iframe) — μηδέν οριζόντια κύλιση (' + fr.sw + ' ≤ ' + fr.cw + ')', fr);
      if (SHOTS) {
        await size(393, 860); await open('#metafrasi');
        await ev(`document.querySelector('[data-mode="rd"]').click(); document.querySelector('.an .w[data-k="${k0}"]').click()`);
        await shotAt(gid + '-09-phone-read', '.sent[data-n="' + segK.n + '"]');
      }

      section('Β · ' + gid + ' — ΓΡΑΜΜΑΤΟΣΕΙΡΑ ΑΝΑ ΣΤΟΙΧΕΙΟ (7b σε Chrome)');
      await size(1440, 900); await open();
      const fams = await ev(`[...document.querySelectorAll('.an .w, .md .w, h1, .wc-an, .qa .qn')].slice(0,60).map(e=>getComputedStyle(e).fontFamily.split(',')[0].replace(/["']/g,'').trim())`);
      ok(fams.length && fams.every(f => f === 'GFS Didot'), 'κάθε ελληνικό στοιχείο ζητάει πρώτα GFS Didot', [...new Set(fams)]);
      eq(exc.length, 0, 'και μηδέν εξαιρέσεις σε ΟΛΗ τη διαδρομή' + (exc.length ? ' — ' + exc[0] : ''));
    } catch (e) {
      ok(false, gid + ': το Β σταμάτησε: ' + e.message);
    }
  }
  ws.close(); chrome.kill('SIGKILL'); server.close();
  try { fs.rmSync(udd, { recursive: true, force: true }); } catch (e) {}
  finish();
})();

function finish(){
  console.log('\n' + pass + '/' + fail);
  process.exit(fail ? 1 : 0);
}
