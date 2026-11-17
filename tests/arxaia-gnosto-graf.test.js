/* tests/arxaia-gnosto-graf.test.js — η στρώση «Γραφίτης» + τα ΠΛΟΥΣΙΑ ετυμολογικά (als-v726).
   ΓΙΑ ΚΑΘΕ ενότητα του `SKIN` του build.js (gk8 als-v726, gk9 als-v730, gk10 als-v731, gk11 als-v732, gk12 als-v733, gk4) — τίποτα καρφωμένο.
   Χωρίς διάλογο (gk11, gk12: `flow.who` = null) → κανένας ομιλητής, και η μετάλλαξη του `who` δεν τρέχει.
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
const IDS = SKIN ? (SKIN.match(/gk\d+(?=:\s*true)/g) || []) : [];
ok(['gk8', 'gk9', 'gk10', 'gk11', 'gk12'].every(g => IDS.indexOf(g) >= 0), 'οι gk8, gk9, gk10, gk11 και gk12 φοράνε τη στρώση', SKIN);
const LKN = J('tools/gnosto/lkn.json');
/* τεκμήριο από ΟΠΟΙΑΔΗΠΟΤΕ ενότητα μετράει (ίδια λέξη, ίδιο λεξικό) — ίδιος κανόνας με το lkn.js */
const inLKN = w => Object.keys(LKN).some(k => k !== '_' && LKN[k] && w in LKN[k]);
/* ⛔ λέξεις που ΔΕΝ υπάρχουν στο ΛΚΝ ή δεν είναι ομόρριζες (βρέθηκαν και βγήκαν) δεν ξαναμπαίνουν */
const BANNED = ['τρισκέλιο', 'πρόσπτωση', 'σιγοκαίω', 'τειχογραφία', 'οίκηση', 'αναπόφευκτος', 'ειδοποίηση', 'φημολογία', 'πρόοψη', 'έθος', 'μεγαλοφροσύνη',
  /* gk10 (als-v731): το ΛΚΝ δεν τις έχει ως λήμματα */
  'ανατριβή', 'πολυτριμμένος', 'αστόχημα', 'ευπραγία', 'εκουσίως', 'ακουσίως', 'Πελοπόννησος', 'βέλτιστος', 'πονεμένος', 'εκουσιότητα', 'ακουσιότητα', 'εκτριβή', 'τριμμένος',
  /* gk11 (als-v732): το ΛΚΝ δεν τις έχει ως λήμματα (οι 5 τελευταίες σε δοκιμή για το «βάναυσον») */
  'επίληψη', 'αριστεία', 'ηθοπλάστης', 'βάναυσα', 'σωματοδομή', 'βαναυσία', 'βαναυσουργία', 'βαναυσουργός', 'βαναυσουργώ', 'βαναυσολογία',
  /* gk12 (als-v733): το ΛΚΝ δεν τις έχει ως λήμματα */
  'μονόλιθος', 'μυριόχρωμος', 'παλινόστηση', 'πολυάνδριο',
  /* gk4: το ΛΚΝ δεν τις έχει ως λήμματα· το «αιτώ» βγήκε ψευδο-✓ (πρόθεμα → «Αιτωλικός») */
  'θανατοποινία', 'μίξη', 'μικτός', 'επιμιξία', 'καυσόξυλο', 'φυτοβόρος', 'εντομοβόρος', 'χορτοβόρος', 'αιτώ'];
global.window = global; try { require('../greek-ear.js'); } catch (e) {} try { require('../lesson-grade.js'); } catch (e) {}
const UNITS = require('../arxaia-gnosto-data.js').UNITS;
const SPEC = {};
IDS.forEach(g => {
  const h = fs.readFileSync(path.join(ROOT, 'arxaia-' + g + '.html'), 'utf8');
  ok(/<body class="skin-graf">/.test(h) && /id="gsteps"/.test(h) && /id="nmap"/.test(h), g + ': body.skin-graf + διαδρομή + χάρτης');
  ok(!/\{\{[A-Z0-9_]+\}\}/.test(h), g + ': κανένα placeholder δεν έμεινε');
  /* οι πέντε κλειδιά προόδου ΑΜΕΤΑΒΛΗΤΑ */
  ['_tr_v1', '_sx_v1', '_ans_v1', '_ap_v1', '_ui_v1'].forEach(k => ok(h.indexOf("ID + '" + k + "'") > 0, g + ': το κλειδί προόδου ' + k + ' ίδιο'));
  const spec = SPEC[g] = J('tools/gnosto/' + g + '.json');
  ok(spec.flow && spec.flow.nodes && spec.flow.nodes.length >= 4, g + ': «Τι γίνεται εδώ» με κόμβους');
  /* ΛΚΝ: κάθε ομόρριζο έχει τεκμήριο */
  const rels = [...new Set(spec.lexika.reduce((a, x) => a.concat(x.rel), []))];
  const miss = rels.filter(r => !inLKN(r));
  ok(miss.length === 0, g + ': κάθε ομόρριζο (' + rels.length + ') βρέθηκε στο Λεξικό της Κοινής Νεοελληνικής', miss);
  ok(spec.lexika.length >= 40, g + ': πλούσια ετυμολογικά (' + spec.lexika.length + ' λέξεις)');
  ok(spec.checks.lexika === spec.lexika.length, g + ': checks.lexika = ' + spec.lexika.length);
  ok(spec.lexika.every(x => x.apl && x.syn && x.rel.length >= 3), g + ': κάθε λέξη με απλά + σύνθετα, ≥3 ομόρριζα');
  ok(spec.lexika.filter(x => x.trap).length >= 5, g + ': παγίδες');
  BANNED.forEach(w => ok(rels.indexOf(w) < 0, g + ': «' + w + '» δεν είναι στα ομόρριζα'));
  /* μεταλλάξεις στον validator */
  const unit = UNITS.find(u => u.id === g);
  const src = L.sourceOf(spec);
  ok(L.check(spec, unit, src).length === 0, g + ': ο validator δέχεται τα δεδομένα');
  const mut = fn => { const s = JSON.parse(JSON.stringify(spec)); fn(s); return L.check(s, unit, src).length; };
  const withTxt = spec.lexika.findIndex(x => x.txt.length);
  ok(mut(s => { s.lexika[0].txt.push('zz9'); }) > 0, g + ' μετάλλαξη: «στο κείμενο» με άγνωστο κλειδί → σφάλμα');
  ok(mut(s => { s.lexika[withTxt].txt.push(s.lexika[withTxt].key); }) > 0, g + ' μετάλλαξη: «στο κείμενο» δείχνει τον εαυτό του → σφάλμα');
  ok(mut(s => { s.lexika[2].rel = s.lexika[2].rel.slice(1); }) > 0, g + ' μετάλλαξη: rel ≠ απλά + σύνθετα → σφάλμα');
  ok(mut(s => { s.lexika[3].syn.push(s.lexika[3].apl[0]); s.lexika[3].rel = s.lexika[3].apl.concat(s.lexika[3].syn); }) > 0, g + ' μετάλλαξη: διπλό ομόρριζο → σφάλμα');
  ok(mut(s => { delete s.flow.segs['2']; }) > 0, g + ' μετάλλαξη: λείπει περίοδος από το «Τι γίνεται εδώ» → σφάλμα');
  ok(mut(s => { s.flow.nodes[1].from += 1; }) > 0, g + ' μετάλλαξη: κενό ανάμεσα στους κόμβους → σφάλμα');
  if (spec.flow.who) ok(mut(s => { s.flow.who = [s.flow.who[0]]; }) > 0, g + ' μετάλλαξη: ένας μόνο ομιλητής σε διάλογο → σφάλμα');
});

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
  /* τυχαία θύρα: ένα Chrome που ξέμεινε από προηγούμενο τρέξιμο δεν «κλέβει» το test (14/11) */
  const PORT = 9400 + Math.floor(Math.random() * 500), { spawn } = require('child_process');
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
  for (const G of IDS) {
  const SP = SPEC[G], NSEG = SP.checks.segs;
  const open = async () => { await S('Page.navigate', { url: 'http://127.0.0.1:' + server.address().port + '/arxaia-' + G + '.html?n=' + (++nav) }); await sl(1500); };
  const ok0 = ok; { const ok = (c, m, x) => ok0(c, G + ': ' + m, x);
  try {
    await size(1440, 900); await open();
    await ev("localStorage.clear()"); await open();
    const FLn = SP.flow.nodes.length;
    ok(await ev("getComputedStyle(document.querySelector('.tabs')).display") === 'none', 'οι παλιές καρτέλες δεν φαίνονται (μένουν στο DOM)');
    ok(await ev("document.querySelectorAll('.gstep').length") === 7, '7 στάσεις');
    ok(await ev("document.querySelectorAll('#nmap .nd').length") === FLn, 'ο χάρτης έχει ' + FLn + ' κόμβους');
    ok(await ev("document.querySelectorAll('#content .nodeh').length") === FLn, 'οι κόμβοι μπαίνουν μέσα στο κείμενο');
    ok(await ev("document.querySelectorAll('#content .sent').length") === NSEG, 'οι ' + NSEG + ' περίοδοι ανέπαφες');
    const spk = await ev("[...document.querySelectorAll('.spk')].map(s=>s.textContent)");
    if (SP.flow.who) ok(spk.length >= 4 && spk.every((w, i) => i === 0 || w !== spk[i - 1]), 'ο ομιλητής μπαίνει ΜΟΝΟ όταν αλλάζει', spk);
    else ok(spk.length === 0, 'χωρίς διάλογο: κανένας ομιλητής', spk);
    const MAP = { si: ['metafrasi', 'si'], rd: ['metafrasi', 'rd'], st: ['metafrasi', 'st'], tr: ['metafrasi', 'tr'], sxolia: ['sxolia'], ermineia: ['ermineia'], lexika: ['lexika'] };
    for (const k of Object.keys(MAP)) {
      await ev(`document.querySelector('[data-gstep="${k}"]').click()`); await sl(80);
      const st = await ev("({tab:document.querySelector('.tab[aria-selected=true]').dataset.tab, mode:document.querySelector('[data-mode][aria-pressed=true]').dataset.mode, cur:document.querySelector('.gstep[aria-current]').dataset.gstep})");
      ok(st.tab === MAP[k][0] && (!MAP[k][1] || st.mode === MAP[k][1]) && st.cur === k, 'η στάση «' + k + '» = ' + MAP[k].join('/'), st);
    }
    await ev("localStorage.clear()"); await open();
    ok(await ev("document.querySelector('.gstep[aria-current]').dataset.gstep") === 'si', 'η πρώτη φορά ανοίγει στο «Κατάλαβέ το»');
    await ev(`document.querySelector('[data-gstep="si"]').click()`); await sl(60);
    ok(await ev("document.getElementById('readGrid').getBoundingClientRect().height === 0 && document.getElementById('simple').getBoundingClientRect().height > 100"), '«Κατάλαβέ το»: ΜΟΝΟ τα απλά λόγια — το κείμενο ΔΕΝ φαίνεται');
    ok(await ev("!document.getElementById('gIntro').hidden && document.getElementById('gIntroTxt').textContent.replace(/\\s+/g,' ').indexOf(" + JSON.stringify(String(SP.intro).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').slice(0, 40)) + ") >= 0"), '«Κατάλαβέ το»: απλά λόγια + η εισαγωγή του βιβλίου');
    await ev(`document.querySelector('[data-gstep="rd"]').click()`); await sl(60);
    await ev("document.getElementById('gWholeI').click()"); await sl(60);
    ok(await ev("document.querySelector('[data-mode=wh]').getAttribute('aria-pressed')") === 'true', '«Όλο το κείμενο μαζί» = ο τρόπος Ολόκληρο');
    await ev("document.getElementById('gWholeI').click()"); await sl(60);
    /* ο χάρτης πάει στον κόμβο */
    await ev("document.querySelectorAll('#nmap .nd')[3].click()"); await sl(900);
    ok(await ev("document.querySelector('.sent.cur').dataset.n") === String(SP.flow.nodes[3].from), 'ο χάρτης: κόμβος 4 → περίοδος ' + SP.flow.nodes[3].from);
    /* η πρόοδος: ίδιο κλειδί, ίδια σημασία */
    await ev(`document.querySelector('[data-gstep="tr"]').click()`); await sl(60);
    await ev("document.querySelector('.sent .veil').click(); document.querySelector('.sent .g3.k').click()"); await sl(80);
    ok(JSON.parse(await ev("localStorage.getItem('" + G + "_tr_v1')"))['1'] === 'k', 'το ✓ γράφεται στο ΙΔΙΟ ' + G + '_tr_v1');
    /* λεξιλογικά */
    await ev(`document.querySelector('[data-gstep="lexika"]').click()`); await sl(80);
    ok(await ev("document.querySelectorAll('#lxBody tr:not(.trap)').length") === SP.lexika.length, 'ο πίνακας: ' + SP.lexika.length + ' λέξεις');
    ok(await ev("document.querySelectorAll('#lxBody tr.trap').length") === SP.lexika.filter(x => x.trap).length, 'οι παγίδες στον πίνακα');
    ok(await ev("document.querySelectorAll('#lxBody td.tx [data-go]').length") === SP.lexika.reduce((a, x) => a + x.txt.length, 0), 'κάθε «στο κείμενο» είναι κουμπί');
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
  } }
  ch.kill('SIGKILL'); server.close();
  console.log((F ? '✗ ' : '✓ ') + 'gnosto-graf: ' + P + '/' + F);
  process.exit(F ? 1 : 0);
})();
