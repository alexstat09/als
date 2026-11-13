/* tests/grammatiki-page.test.js — ΟΔΗΓΕΙ την αληθινή arxaia-grammatiki.html σε
   headless Chrome (σταθ. 57: ένα test που διαβάζει το αρχείο δεν τρέχει τη σελίδα).
   ⛔ Σταθ. 8: sync.js / supabase ΜΠΛΟΚΑΡΙΣΜΕΝΑ, initCloudSync ψεύτικο.
   ⭐ Σταθ. 27: παίζει ολόκληρο πέρασμα και ΔΙΑΒΑΖΕΙ τις επιλογές.
   GRAM_SHOTS=<φάκελος> → screenshots για να τα κοιτάξεις. */
'use strict';
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const MIME = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css', '.json':'application/json; charset=utf-8', '.png':'image/png' };
let syncHits = 0, failData = false;
const server = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  if (/sync|supabase|topbar|nova/i.test(u)) { syncHits++; res.writeHead(200, { 'Content-Type':MIME['.js'] }); res.end('/* stripped by harness */'); return; }
  if (u === '/data/grammatiki/index.json' && failData) { res.writeHead(503); res.end('down'); return; }
  const f = path.join(ROOT, u);
  if (f.indexOf(ROOT) !== 0 || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end('no'); return; }
  res.writeHead(200, { 'Content-Type':MIME[path.extname(f)] || 'application/octet-stream' }); res.end(fs.readFileSync(f));
});
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
if (!fs.existsSync(CHROME)) { console.error('  ✗ FAIL δεν βρέθηκε το Chrome — δεν έτρεξε τίποτα'); process.exit(1); }
const PORT = 9383, KEY = 'metron.grammatiki.v1', SHOTS = process.env.GRAM_SHOTS || '';
const { spawn } = require('child_process');
let id = 0, ws, pend = new Map(), P = 0, F = 0;
const send = (m, p, s) => new Promise((res, rej) => { const i = ++id; pend.set(i, { res, rej }); ws.send(JSON.stringify({ id:i, method:m, params:p, sessionId:s })); });
const sleep = n => new Promise(r => setTimeout(r, n));
const ok = (n, c, x) => { c ? P++ : F++; console.log((c ? '  ✓ ' : '  ✗ FAIL ') + n + (c ? '' : '   ' + JSON.stringify(x === undefined ? null : x))); };
const SEED = 'window.ALS_LOCAL_ONLY=true; window.initCloudSync=function(){}; window.supabase=null;';

(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const BASE = 'http://127.0.0.1:' + server.address().port + '/arxaia-grammatiki.html';
  const chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=' + PORT, '--no-first-run', '--user-data-dir=/tmp/cdp-gram-' + process.pid, '--hide-scrollbars', 'about:blank'], { stdio:'ignore' });
  let info = null; for (let i = 0; i < 60; i++) { try { info = await (await fetch('http://127.0.0.1:' + PORT + '/json/version')).json(); break; } catch (e) { await sleep(300); } }
  ws = new WebSocket(info.webSocketDebuggerUrl); const exc = [];
  ws.onmessage = e => { const m = JSON.parse(e.data);
    if (m.id && pend.has(m.id)) { const p = pend.get(m.id); pend.delete(m.id); m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result); }
    else if (m.method === 'Runtime.exceptionThrown') exc.push(m.params.exceptionDetails.exception && m.params.exceptionDetails.exception.description || m.params.exceptionDetails.text); };
  await new Promise(r => ws.onopen = r);
  const t = await send('Target.createTarget', { url:'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId:t.targetId, flatten:true });
  const S = (m, p) => send(m, p, sessionId);
  await S('Page.enable'); await S('Runtime.enable');
  await S('Page.addScriptToEvaluateOnNewDocument', { source:SEED });
  const size = (w, h) => S('Emulation.setDeviceMetricsOverride', { width:w, height:h, deviceScaleFactor:1, mobile:w < 600 });
  const ev = async e => { const r = await S('Runtime.evaluate', { expression:e, returnByValue:true, awaitPromise:true }); if (r.exceptionDetails) throw new Error(e + ' → ' + JSON.stringify(r.exceptionDetails.exception && r.exceptionDetails.exception.description)); return r.result.value; };
  let nav = 0;
  const open = async (today, hash) => {
    await S('Page.navigate', { url:BASE + '?today=' + today + '&n=' + (++nav) + (hash || '') }); await sleep(150);
    for (let i = 0; i < 60; i++) { try { if (await ev("document.readyState==='complete'&&!/Φορτώνει/.test(document.getElementById('main').textContent)")) break; } catch (e) {} await sleep(100); }
    await sleep(120);
  };
  const shot = async n => { if (!SHOTS) return; const r = await S('Page.captureScreenshot', { format:'png', captureBeyondViewport:true }); fs.writeFileSync(path.join(SHOTS, n + '.png'), Buffer.from(r.data, 'base64')); };
  const overflow = () => ev('document.documentElement.scrollWidth - document.documentElement.clientWidth');
  const main = () => ev("document.getElementById('main').textContent");
  const D1 = '2026-11-14', D2 = '2026-11-15';

  console.log('Α · αρχική χωρίς πρόοδο');
  await size(1440, 900); await open(D1);
  await ev(`localStorage.clear()`); await open(D1);
  ok('λέει ότι δεν ξεκίνησε ενότητα, με το τι να κάνει', /Δεν έχεις ξεκινήσει ενότητα/.test(await main()) && /Άνοιξε την Α΄ κλίση/.test(await main()));
  ok('τα περιεχόμενα του βιβλίου: Α΄ κλίση ανοιχτή, οι άλλες «έρχονται»', await ev("document.querySelectorAll('#toc a[href=\"#/u/a-klisi\"]').length===1 && document.querySelectorAll('#toc span').length>=25"));
  ok('«Σκόρπια» κλειστό χωρίς ενότητα', await ev("document.querySelector('[data-mode=mix]').disabled===true"));
  ok('έξοδος με λέξη προς τα Αρχαία, άγνωστο', await ev("(function(a){return a&&a.getAttribute('href')==='arxaia-agnosto.html'&&/Αρχαία, άγνωστο/.test(a.textContent)&&a.getBoundingClientRect().height>=44})(document.querySelector('a.back'))"));
  ok('η αρχική ΔΕΝ γράφει τίποτα (σταθ. 10: ένας αναγνώστης δεν γράφει)', await ev(`localStorage.getItem('${KEY}')===null`));
  await shot('home-empty-1440');

  console.log('Β · η ενότητα');
  await open(D1, '#/u/a-klisi');
  ok('5 υποδείγματα + 4 συνηρημένα', await ev("document.querySelectorAll('article.card').length===9"));
  ok('με τη σειρά του βιβλίου', await ev("[...document.querySelectorAll('article.card h3')].slice(0,5).map(h=>h.textContent.replace(/^\\S+ /,'')).join()") === 'ταμίας,στρατιώτης,ὥρα,θάλασσα,κώμη');
  ok('17 κανόνες, 3 SOS', await ev("document.querySelectorAll('.rule').length===17 && document.querySelectorAll('.rule .sos').length===3"));
  ok('5 κουτιά «Βρες το υπόδειγμα»', await ev("document.querySelectorAll('.key').length===5"));
  ok('κάθε «Γιατί» δείχνει σε υπαρκτό κανόνα', await ev("[...document.querySelectorAll('[data-rule]')].every(a=>document.getElementById('r-'+a.dataset.rule))"));
  ok('η κατάληξη τονισμένη (γραμμή-γραμμή: ον. εν/πλ, γεν. εν/πλ)', await ev("[...document.querySelectorAll('#m-thalassa .tbl em')].map(e=>e.textContent).slice(0,4).join()") === 'α,αι,ης,ῶν');
  ok('μηδέν οριζόντια κύλιση στα 1440', (await overflow()) <= 0, await overflow());
  /* ο φρουρός που έλειπε: στις 3 στήλες ο «θαλάσσης» έπεφτε πάνω στο «θαλασσῶν» */
  const CELLS = "[...document.querySelectorAll('.tbl>div, .key, .rule, .opt')].filter(e=>e.scrollWidth>e.clientWidth+1).map(e=>e.textContent.trim().slice(0,30))";
  ok('κανένα κελί δεν ξεχειλίζει (1440)', (await ev(CELLS)).length === 0, await ev(CELLS));
  await size(1180, 800); await open(D1, '#/u/a-klisi');
  ok('κανένα κελί δεν ξεχειλίζει (1180)', (await ev(CELLS)).length === 0, await ev(CELLS));
  await size(1440, 900); await open(D1, '#/u/a-klisi');
  await shot('unit-1440');
  await ev("document.querySelector('[data-hide=\"1\"]').click()"); await sleep(80);
  const hid = await ev("document.querySelectorAll('.hid').length");
  ok('Έλεγχος: οι καταλήξεις κρύβονται (' + hid + ')', hid >= 90 && await ev("document.querySelectorAll('.tbl em').length===0"));
  await ev("document.querySelector('.hid').click()"); await sleep(50);
  ok('ένα πάτημα δείχνει την κατάληξη', await ev("document.querySelectorAll('.hid').length") === hid - 1);
  await ev("document.querySelector('[data-hide=\"0\"]').click()");

  console.log('Γ · Ξεκίνα → το πρώτο πέρασμα');
  await ev("document.querySelector('[data-start]').click()"); await sleep(200);
  ok('πήγε στις κάρτες για σήμερα', await ev("location.hash") === '#/q/today');
  ok('15 νέες κάρτες', await ev('window.__gram.left()') === 15);
  const st0 = JSON.parse(await ev(`localStorage.getItem('${KEY}')`));
  ok('το «ξεκίνησε» γράφτηκε με _ts', st0.started['a-klisi'] && st0.started['a-klisi'].at === D1 && st0.started['a-klisi']._ts > 0, st0.started);
  const seen = [], bad27 = []; let n = 0, wrongDone = false, wrongId = '';
  while (n++ < 80) {
    const c = await ev('window.__gram.card()'); if (!c) break;
    const o = await ev('window.__gram.opts()');
    const shown = await ev("[...document.querySelectorAll('.opt .t')].map(x=>x.textContent)");
    const prompt = await ev("document.querySelector('.qp').textContent + ' | ' + document.querySelector('.qs').textContent");
    if (o.length !== 4 || new Set(o).size !== 4 || o.filter(x => x === c.a).length !== 1) bad27.push(['επιλογές', c.id, o]);
    /* σταθ. 38: ΛΕΞΗ, όχι υποσυμβολοσειρά — το «ταμία» μέσα στο «ταμίας» δεν είναι διαρροή */
    if (c.k === 'f' && prompt.split(/[\s|·,.;]+/).indexOf(c.q.stem + c.a) >= 0) bad27.push(['ο τύπος μέσα στην ερώτηση', c.id, prompt]);
    if (c.k === 'm' && o.indexOf(c.q.word) >= 0) bad27.push(['η λέξη στις επιλογές', c.id]);
    if (!seen.some(s => s[0] === c.k)) seen.push([c.k, prompt, shown.join(' / ')]);
    // μία φορά λάθος, για να δούμε την επιστροφή
    let pick = o.indexOf(c.a);
    if (!wrongDone && n === 3) { pick = (pick + 1) % 4; wrongDone = true; wrongId = c.id; }
    await ev(`document.querySelectorAll('.opt')[${pick}].click()`); await sleep(40);
    if (n === 3) {
      ok('λάθος → λέει το σωστό με λόγια', /Το σωστό:/.test(await ev("document.querySelector('.fb').textContent")));
      ok('λάθος → η κάρτα μπαίνει ξανά στο πέρασμα (16 στη λίστα, 2 πίσω μας)', await ev('window.__gram.left()') === 16 - 2, await ev('window.__gram.left()'));
      await shot('quiz-wrong-1440');
    }
    if (n === 1) { ok('σωστό → «Σωστό.» + εξήγηση', /Σωστό\./.test(await ev("document.querySelector('.fb').textContent"))); await shot('quiz-1440'); }
    await ev("document.querySelector('[data-next]').click()"); await sleep(30);
  }
  console.log('    δείγμα όπως το βλέπει:'); seen.forEach(s => console.log('      [' + s[0] + '] ' + s[1] + '  →  ' + s[2]));
  ok('σταθ. 27: καμία ερώτηση δεν δίνει την απάντηση, 4 διαφορετικές επιλογές, μία σωστή', bad27.length === 0, bad27.slice(0, 3));
  ok('η λάθος κάρτα ξαναήρθε 2 φορές (σωστά δύο στη σειρά)', n - 1 === 15 + 2, n - 1);
  ok('οθόνη τέλους: 14 / 15 και το λάθος στη λίστα', /14 \/ 15/.test(await main()) && await ev("document.querySelectorAll('.miss li').length") === 1);
  await shot('done-1440');
  const st1 = JSON.parse(await ev(`localStorage.getItem('${KEY}')`));
  const recs = Object.keys(st1.cards);
  ok('15 εγγραφές, όλες με _ts', recs.length === 15 && recs.every(k => st1.cards[k]._ts > 0));
  ok('οι σωστές: αύριο, κουτί 1', recs.filter(k => k !== wrongId).every(k => st1.cards[k].box === 1 && st1.cards[k].due === D2));
  ok('η λάθος: κουτί 0, αύριο', st1.cards[wrongId].box === 0 && st1.cards[wrongId].due === D2);
  ok('μηδέν exceptions ως εδώ', exc.length === 0, exc);

  console.log('Δ · την επόμενη μέρα');
  await open(D2);
  ok('αρχική: 30 κάρτες (15 επαναλήψεις + 15 νέες)', await ev("document.querySelector('.big .n').textContent") === '30', await main());
  ok('η ενότητα δείχνει ότι ξεκίνησε', await ev("!!document.querySelector('#toc a[href=\"#/u/a-klisi\"] .dot')"));
  await ev("document.querySelector('[data-mode=mix]').click()"); await sleep(150);
  ok('Σκόρπια: 20 κάρτες', await ev('window.__gram.left()') === 20);
  const before = JSON.stringify(JSON.parse(await ev(`localStorage.getItem('${KEY}')`)).cards);
  const c0 = await ev('window.__gram.card()'), o0 = await ev('window.__gram.opts()');
  await ev(`document.querySelectorAll('.opt')[${o0.indexOf(c0.a)}].click()`); await sleep(40);
  ok('εξάσκηση: ένα σωστό ΔΕΝ αλλάζει τη σκάλα', JSON.stringify(JSON.parse(await ev(`localStorage.getItem('${KEY}')`)).cards) === before);

  console.log('Ε · κινητό 390');
  await size(390, 844); await open(D2, '#/u/a-klisi');
  ok('ενότητα: μηδέν οριζόντια κύλιση', (await overflow()) <= 0, await overflow());
  ok('κανένα κελί δεν ξεχειλίζει (390)', (await ev("[...document.querySelectorAll('.tbl>div, .key, .rule')].filter(e=>e.scrollWidth>e.clientWidth+1).length")) === 0, await ev("[...document.querySelectorAll('.tbl>div, .key, .rule')].filter(e=>e.scrollWidth>e.clientWidth+1).map(e=>e.textContent.slice(0,30))"));
  ok('κανένα κείμενο κάτω από 11px', await ev("[...document.querySelectorAll('#main *')].filter(e=>e.childNodes.length&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())&&e.offsetParent).every(e=>parseFloat(getComputedStyle(e).fontSize)>=11)"));
  await shot('unit-390');
  await open(D2, '#/q/today');
  ok('κάρτα: μηδέν οριζόντια κύλιση', (await overflow()) <= 0, await overflow());
  ok('επιλογές ≥44px', await ev("[...document.querySelectorAll('.opt')].every(b=>b.getBoundingClientRect().height>=44)"));
  await shot('quiz-390');
  await open(D2);
  ok('αρχική: μηδέν οριζόντια κύλιση', (await overflow()) <= 0); await shot('home-390');

  console.log('Ζ · αποτυχίες που ΛΕΓΟΝΤΑΙ (σταθ. 10)');
  await size(1440, 900);
  failData = true; await open(D2);
  ok('τα δεδομένα δεν ήρθαν → το λέει, δεν δείχνει άδεια σελίδα', /Δεν μπόρεσα να διαβάσω τη γραμματική/.test(await main()) && /πρόοδός σου δεν πειράχτηκε/.test(await main()));
  failData = false;
  await ev(`localStorage.setItem('${KEY}', '{"v":7,"x":1}')`); await open(D2, '#/u/a-klisi');
  ok('αποθήκη που δεν διαβάζεται → προειδοποίηση', /δεν διαβάζεται/.test(await ev("document.getElementById('warn').textContent")));
  await ev("document.querySelector('[data-start]').click()"); await sleep(100);
  ok('…και ΔΕΝ γράφει από πάνω της', await ev(`localStorage.getItem('${KEY}')`) === '{"v":7,"x":1}');
  // σταθ. 35: ένα άγνωστο πεδίο επιβιώνει load+save
  await ev(`localStorage.setItem('${KEY}', JSON.stringify({v:1,started:{},cards:{},future:{keep:1}}))`); await open(D2, '#/u/a-klisi');
  await ev("document.querySelector('[data-start]').click()"); await sleep(100);
  ok('σταθ. 35: άγνωστο πεδίο επιβιώνει', JSON.parse(await ev(`localStorage.getItem('${KEY}')`)).future.keep === 1);
  ok('κανένα script συγχρονισμού δεν έτρεξε (μπλοκαρίστηκαν: ' + syncHits + ')', syncHits >= 2);
  ok('μηδέν exceptions σε ΟΛΗ τη διαδρομή', exc.length === 0, exc);

  console.log('\ngrammatiki-page: ' + P + ' πέρασαν, ' + F + ' έπεσαν');
  chrome.kill(); server.close(); process.exit(F ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
