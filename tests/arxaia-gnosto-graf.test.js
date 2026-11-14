/* tests/arxaia-gnosto-graf.test.js — η στρώση «Γραφίτης» + τα ΠΛΟΥΣΙΑ ετυμολογικά (als-v726).
   1 · στατικά: ποιες ενότητες φοράνε τη στρώση, κάθε ομόρριζο έχει τεκμήριο ΛΚΝ, μεταλλάξεις.
   2 · οδηγημένα σε Chrome (sync δεν υπάρχει σε αυτές τις σελίδες — μόνο localStorage):
       η διαδρομή πατάει τα ΙΔΙΑ tab/mode, οι κόμβοι, ο ομιλητής, ο πίνακας, η Στήλη Α–Β. */
'use strict';
const fs = require('fs'), path = require('path'), http = require('http');
const ROOT = path.join(__dirname, '..');
const L = require('../tools/gnosto/lib.js');
let P = 0, F = 0;
const ok = (c, m, x) => { c ? P++ : F++; if (!c) console.log('  ✗ ' + m + (x !== undefined ? '  ' + JSON.stringify(x).slice(0, 300) : '')); };
const J = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));

/* ── 1 · στατικά ── */
const build = fs.readFileSync(path.join(ROOT, 'tools/gnosto/build.js'), 'utf8');
const SKIN = (build.match(/var SKIN = (\{[^}]*\});/) || [])[1];
ok(SKIN && /gk8:\s*true/.test(SKIN), 'η gk8 φοράει τη στρώση', SKIN);
['gk9', 'gk10', 'gk11', 'gk12'].forEach(g => {
  const h = fs.readFileSync(path.join(ROOT, 'arxaia-' + g + '.html'), 'utf8');
  ok(!/skin-graf/.test(h) && !/\{\{G2_/.test(h), g + ': ΔΕΝ φοράει τη στρώση (μένει όπως ήταν)');
});
const h8 = fs.readFileSync(path.join(ROOT, 'arxaia-gk8.html'), 'utf8');
ok(/<body class="skin-graf">/.test(h8) && /id="gsteps"/.test(h8) && /id="nmap"/.test(h8), 'gk8: body.skin-graf + διαδρομή + χάρτης');
ok(!/\{\{[A-Z0-9_]+\}\}/.test(h8), 'gk8: κανένα placeholder δεν έμεινε');
/* οι πέντε κλειδιά προόδου ΑΜΕΤΑΒΛΗΤΑ */
['_tr_v1', '_sx_v1', '_ans_v1', '_ap_v1', '_ui_v1'].forEach(k => ok(h8.indexOf("ID + '" + k + "'") > 0, 'gk8: το κλειδί προόδου ' + k + ' ίδιο'));
/* ΛΚΝ: κάθε ομόρριζο έχει τεκμήριο */
const LKN = J('tools/gnosto/lkn.json');
const spec8 = J('tools/gnosto/gk8.json');
const rels = [...new Set(spec8.lexika.reduce((a, x) => a.concat(x.rel), []))];
const miss = rels.filter(r => !(r in (LKN.gk8 || {})));
ok(miss.length === 0, 'gk8: κάθε ομόρριζο (' + rels.length + ') βρέθηκε στο Λεξικό της Κοινής Νεοελληνικής', miss);
ok(spec8.lexika.length >= 50, 'gk8: πλούσια ετυμολογικά (' + spec8.lexika.length + ' λέξεις)');
ok(spec8.lexika.every(x => x.apl && x.syn && x.rel.length >= 3), 'gk8: κάθε λέξη με απλά + σύνθετα, ≥3 ομόρριζα');
ok(spec8.lexika.filter(x => x.trap).length >= 5, 'gk8: παγίδες');
/* ⛔ λέξεις που ΔΕΝ υπάρχουν στο ΛΚΝ (βρέθηκαν και βγήκαν) δεν ξαναμπαίνουν */
['τρισκέλιο', 'πρόσπτωση', 'σιγοκαίω', 'τειχογραφία', 'οίκηση', 'αναπόφευκτος', 'ειδοποίηση'].forEach(w => ok(rels.indexOf(w) < 0, '«' + w + '» δεν είναι στα ομόρριζα'));
/* μεταλλάξεις στον validator */
const unit = (function(){ global.window = global; try { require('../greek-ear.js'); } catch (e) {} try { require('../lesson-grade.js'); } catch (e) {} return require('../arxaia-gnosto-data.js').UNITS.find(u => u.id === 'gk8'); })();
const src = L.sourceOf(spec8);
ok(L.check(spec8, unit, src).length === 0, 'gk8: ο validator δέχεται τα δεδομένα');
const mut = fn => { const s = JSON.parse(JSON.stringify(spec8)); fn(s); return L.check(s, unit, src).length; };
ok(mut(s => { s.lexika[0].txt.push('zz9'); }) > 0, 'μετάλλαξη: «στο κείμενο» με άγνωστο κλειδί → σφάλμα');
ok(mut(s => { s.lexika[1].txt.push(s.lexika[1].key); }) > 0, 'μετάλλαξη: «στο κείμενο» δείχνει τον εαυτό του → σφάλμα');
ok(mut(s => { s.lexika[2].rel = s.lexika[2].rel.slice(1); }) > 0, 'μετάλλαξη: rel ≠ απλά + σύνθετα → σφάλμα');
ok(mut(s => { s.lexika[3].syn.push(s.lexika[3].apl[0]); s.lexika[3].rel = s.lexika[3].apl.concat(s.lexika[3].syn); }) > 0, 'μετάλλαξη: διπλό ομόρριζο → σφάλμα');

/* ── 2 · οδηγημένα ── */
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const MIME = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.png':'image/png', '.webp':'image/webp' };
const server = http.createServer((q, r) => {
  const u = decodeURIComponent(q.url.split('?')[0]);
  if (/sync|supabase|topbar|nova/i.test(u)) { r.writeHead(200, { 'Content-Type': MIME['.js'] }); r.end(''); return; }
  const f = path.join(ROOT, u);
  if (f.indexOf(ROOT) !== 0 || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); r.end(); return; }
  r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); r.end(fs.readFileSync(f));
});
(async () => {
  if (!fs.existsSync(CHROME)) { console.log('  ✗ χωρίς Chrome — δεν έτρεξε το οδηγημένο μέρος'); process.exit(1); }
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const PORT = 9398, { spawn } = require('child_process');
  const ch = spawn(CHROME, ['--headless=new', '--remote-debugging-port=' + PORT, '--user-data-dir=/tmp/cdp-graf-' + process.pid, 'about:blank'], { stdio: 'ignore' });
  const sl = n => new Promise(r => setTimeout(r, n));
  let info; for (let i = 0; i < 60; i++) { try { info = await (await fetch('http://127.0.0.1:' + PORT + '/json/version')).json(); break; } catch (e) { await sl(300); } }
  const ws = new WebSocket(info.webSocketDebuggerUrl); let id = 0; const pend = new Map(), exc = [];
  ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m.result); pend.delete(m.id); } else if (m.method === 'Runtime.exceptionThrown') exc.push(m.params.exceptionDetails.exception && m.params.exceptionDetails.exception.description); };
  await new Promise(r => ws.onopen = r);
  const send = (m, p, s) => new Promise(r => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p, sessionId: s })); });
  const t = await send('Target.createTarget', { url: 'about:blank' }); const { sessionId } = await send('Target.attachToTarget', { targetId: t.targetId, flatten: true });
  const S = (m, p) => send(m, p, sessionId);
  await S('Page.enable'); await S('Runtime.enable');
  const ev = async e => { const r = await S('Runtime.evaluate', { expression: e, returnByValue: true }); if (r.exceptionDetails) throw new Error(e + ' → ' + JSON.stringify(r.exceptionDetails.exception && r.exceptionDetails.exception.description)); return r.result.value; };
  const size = (w, h) => S('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: w < 600 });
  let nav = 0;
  const open = async () => { await S('Page.navigate', { url: 'http://127.0.0.1:' + server.address().port + '/arxaia-gk8.html?n=' + (++nav) }); await sl(1500); };
  try {
    await size(1440, 900); await open();
    await ev("localStorage.clear()"); await open();
    const FLn = spec8.flow.nodes.length;
    ok(await ev("getComputedStyle(document.querySelector('.tabs')).display") === 'none', 'οι παλιές καρτέλες δεν φαίνονται (μένουν στο DOM)');
    ok(await ev("document.querySelectorAll('.gstep').length") === 7, '7 στάσεις');
    ok(await ev("document.querySelectorAll('#nmap .nd').length") === FLn, 'ο χάρτης έχει ' + FLn + ' κόμβους');
    ok(await ev("document.querySelectorAll('#content .nodeh').length") === FLn, 'οι κόμβοι μπαίνουν μέσα στο κείμενο');
    ok(await ev("document.querySelectorAll('#content .sent').length") === 22, 'οι 22 περίοδοι ανέπαφες');
    const spk = await ev("[...document.querySelectorAll('.spk')].map(s=>s.textContent)");
    ok(spk.length >= 4 && spk.every((w, i) => i === 0 || w !== spk[i - 1]), 'ο ομιλητής μπαίνει ΜΟΝΟ όταν αλλάζει', spk);
    const MAP = { si: ['metafrasi', 'si'], rd: ['metafrasi', 'rd'], st: ['metafrasi', 'st'], tr: ['metafrasi', 'tr'], sxolia: ['sxolia'], ermineia: ['ermineia'], lexika: ['lexika'] };
    for (const k of Object.keys(MAP)) {
      await ev(`document.querySelector('[data-gstep="${k}"]').click()`); await sl(80);
      const st = await ev("({tab:document.querySelector('.tab[aria-selected=true]').dataset.tab, mode:document.querySelector('[data-mode][aria-pressed=true]').dataset.mode, cur:document.querySelector('.gstep[aria-current]').dataset.gstep})");
      ok(st.tab === MAP[k][0] && (!MAP[k][1] || st.mode === MAP[k][1]) && st.cur === k, 'η στάση «' + k + '» = ' + MAP[k].join('/'), st);
    }
    await ev(`document.querySelector('[data-gstep="si"]').click()`); await sl(60);
    ok(await ev("!document.getElementById('gIntro').hidden && /Σωκράτης/.test(document.getElementById('gIntroTxt').textContent)"), '«Κατάλαβέ το»: απλά λόγια + η εισαγωγή του βιβλίου');
    await ev(`document.querySelector('[data-gstep="rd"]').click()`); await sl(60);
    await ev("document.getElementById('gWholeI').click()"); await sl(60);
    ok(await ev("document.querySelector('[data-mode=wh]').getAttribute('aria-pressed')") === 'true', '«Όλο το κείμενο μαζί» = ο τρόπος Ολόκληρο');
    await ev("document.getElementById('gWholeI').click()"); await sl(60);
    /* ο χάρτης πάει στον κόμβο */
    await ev("document.querySelectorAll('#nmap .nd')[3].click()"); await sl(900);
    ok(await ev("document.querySelector('.sent.cur').dataset.n") === String(spec8.flow.nodes[3].from), 'ο χάρτης: κόμβος 4 → περίοδος ' + spec8.flow.nodes[3].from);
    /* η πρόοδος: ίδιο κλειδί, ίδια σημασία */
    await ev(`document.querySelector('[data-gstep="tr"]').click()`); await sl(60);
    await ev("document.querySelector('.sent .veil').click(); document.querySelector('.sent .g3.k').click()"); await sl(80);
    ok(JSON.parse(await ev("localStorage.getItem('gk8_tr_v1')"))['1'] === 'k', 'το ✓ γράφεται στο ΙΔΙΟ gk8_tr_v1');
    /* λεξιλογικά */
    await ev(`document.querySelector('[data-gstep="lexika"]').click()`); await sl(80);
    ok(await ev("document.querySelectorAll('#lxBody tr:not(.trap)').length") === spec8.lexika.length, 'ο πίνακας: ' + spec8.lexika.length + ' λέξεις');
    ok(await ev("document.querySelectorAll('#lxBody tr.trap').length") === spec8.lexika.filter(x => x.trap).length, 'οι παγίδες στον πίνακα');
    ok(await ev("document.querySelectorAll('#lxBody td.tx [data-go]').length") === spec8.lexika.reduce((a, x) => a + x.txt.length, 0), 'κάθε «στο κείμενο» είναι κουμπί');
    await ev("document.querySelector('#lxBody td.tx [data-go]').click()"); await sl(300);
    ok(await ev("document.querySelector('.tab[aria-selected=true]').dataset.tab") === 'metafrasi' && await ev("!!document.querySelector('.w.hit')"), '«στο κείμενο» → η λέξη ανάβει μέσα στο κείμενο');
    await ev(`document.querySelector('[data-gstep="lexika"]').click()`); await sl(80);
    /* Στήλη Α–Β: σωστό ζευγάρι μετράει, λάθος όχι */
    const A0 = await ev("document.querySelector('#lxAB [data-a]').dataset.a");
    await ev(`document.querySelector('#lxAB [data-a="${A0}"]').click()`);
    const wrongB = await ev(`[...document.querySelectorAll('#lxAB [data-b]')].find(b=>b.dataset.b!=='${A0}').dataset.b`);
    await ev(`document.querySelector('#lxAB [data-b="${wrongB}"]').click()`);
    ok(/^0 \/ 6/.test(await ev("document.querySelector('#lxAB .sc').textContent")), 'Α–Β: λάθος ζευγάρι δεν μετράει');
    await ev(`document.querySelector('#lxAB [data-a="${A0}"]').click(); document.querySelector('#lxAB [data-b="${A0}"]').click()`);
    ok(/^1 \/ 6/.test(await ev("document.querySelector('#lxAB .sc').textContent")), 'Α–Β: σωστό ζευγάρι μετράει');
    /* πλάτη */
    for (const w of [1440, 1180, 393]) {
      await size(w, 900); await open();
      for (const k of ['rd', 'lexika', 'sxolia', 'ermineia']) {
        await ev(`document.querySelector('[data-gstep="${k}"]').click()`); await sl(80);
        const ov = await ev('document.documentElement.scrollWidth - document.documentElement.clientWidth');
        ok(ov <= 0, w + 'px · ' + k + ': μηδέν οριζόντια κύλιση', ov);
      }
    }
    ok(exc.length === 0, 'μηδέν εξαιρέσεις', exc);
  } catch (e) { ok(false, 'το οδηγημένο μέρος έσκασε: ' + e.message); }
  ch.kill(); server.close();
  console.log((F ? '✗ ' : '✓ ') + 'gnosto-graf: ' + P + '/' + F);
  process.exit(F ? 1 : 0);
})();
