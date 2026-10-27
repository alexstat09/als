/* ══════════════════════════════════════════════════════════════════════
   tests/arxaia-eisagogi.test.js — ΤΟ ΓΕΝΙΚΟ TEST ΚΑΘΕ ΚΕΦΑΛΑΙΟΥ ΤΟΥ ΚΑΛΟΥΠΙΟΥ.
     node tests/arxaia-eisagogi.test.js                 → όλα τα tools/eisagogi/arxaia/*.json
     EIS_ONLY=sokratis-d3 node tests/arxaia-eisagogi.test.js   → μόνο ένα
     EIS_SHOTS=<φάκελος>  → και οι 3 φωτογραφίες του finish.js (1440: πρώτη επίσκεψη ·
                            ένας σταθμός με σχέδιο · επιστροφή με σπαρμένη πρόοδο)

   Νέο κεφάλαιο = ΜΗΔΕΝ γραμμές εδώ. Ό,τι ισχύει για ΚΑΘΕ κεφάλαιο ζει εδώ
   (ήταν το μεγαλύτερο μέρος του arxaia-sokratis-ideas.test.js, als-v673)·
   ό,τι είναι ΜΟΝΟ του Δ2 (τα 130 γεγονότα της als-v538, οι σημειώσεις του)
   μένει στο δικό του, λεπτό πια, test.
     Α · η πηγή (sha) · σελίδα = έξοδος του build · μορφή του json (fmt)
     Β · ο validator περνάει ΚΑΙ δαγκώνει (13 μεταλλάξεις) · ποσότητες
     Δ · αποθήκη (ΕΝΑ κλειδί), καλώδιο (πλάκα, PACKS, SW, NO_VT)
     Ε · ΑΛΗΘΙΝΟ Chrome (Playwright του video-kit), χωρίς κανένα sync:
         κάθε σταθμός, διάβασα→reload, κενό→χάρτης, Didot, χαλασμένη αποθήκη,
         1440/1180/390 χωρίς κύλιση, άκρες κειμένου στα .dg, 11px/44px.
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DIR = path.join(ROOT, 'tools', 'eisagogi', 'arxaia');
const L = require(path.join(DIR, 'lib.js'));
const { build } = require(path.join(DIR, 'build.js'));
const { format } = require(path.join(DIR, 'fmt.js'));

let pass = 0, fail = 0;
function ok(c, m) { if (c) pass++; else { fail++; console.error('  ✗ ' + m); } }
function eq(a, b, m) { ok(a === b, m + '\n      περίμενα: ' + b + '\n      πήρα:     ' + a); }
function section(t) { console.log('\n── ' + t); }

const IDS = fs.readdirSync(DIR).filter(f => f.endsWith('.json')).map(f => f.replace(/\.json$/, ''))
  .filter(id => !process.env.EIS_ONLY || id === process.env.EIS_ONLY).sort();
if (!IDS.length) { console.error('✗ κανένα κεφάλαιο' + (process.env.EIS_ONLY ? ' με id ' + process.env.EIS_ONLY : '')); process.exit(1); }

const OXIA = /[άέήίόύώΆΈΉΐΊΰΎΌΏ]/;
const arx = fs.readFileSync(path.join(ROOT, 'arxaia.html'), 'utf8');
const GN = arx.slice(arx.indexOf('id="gnWrap"'), arx.indexOf('id="gnLesson"'));
const SW = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
const NO_VT = eval(/const NO_VT = (\/.*\/);/.exec(fs.readFileSync(path.join(ROOT, 'topbar.js'), 'utf8'))[1]); // eslint-disable-line no-eval
const PACKS = fs.readFileSync(path.join(__dirname, 'arxaia-gnosto.test.js'), 'utf8');

function statics(id) {
  const D = L.load(id), SRC = L.readSource(D.source.file), PAGE_F = D.file;
  const page = fs.existsSync(path.join(ROOT, PAGE_F)) ? fs.readFileSync(path.join(ROOT, PAGE_F), 'utf8') : '';

  /* ══ Α ══ */
  section(id + ' · Α · η πηγή, το build, η μορφή');
  eq(SRC.sha, D.source.sha, '⛔ ΑΛΛΑΞΕ Η ΠΗΓΗ ' + D.source.file + ' — είναι κατέβασμα του σχολικού βιβλίου, δεν διορθώνεται με το χέρι');
  ok(/^# /.test(SRC.raw) && /ebooks\.edu\.gr/.test(SRC.raw), 'η πηγή έχει κεφαλίδα και λέει ΠΟΙΑ σελίδα του ebooks.edu.gr είναι');
  ok(!OXIA.test(SRC.raw) && !OXIA.test(page), '⛔ OXIA (U+1F71…) στην πηγή ή στη σελίδα');
  const raw = fs.readFileSync(path.join(DIR, id + '.json'), 'utf8');
  ok(format(JSON.parse(raw)) === raw, '⛔ το ' + id + '.json δεν είναι στη μορφή του καλουπιού — node tools/eisagogi/arxaia/fmt.js ' + id + ' (ποτέ JSON.stringify όλου του αρχείου)');
  let built = null;
  try { built = build(id); } catch (e) { ok(false, 'το build απέτυχε: ' + e.message.slice(0, 400)); }
  if (built) {
    eq(built.file, PAGE_F, 'το build γράφει ΑΥΤΟ το αρχείο (filename == URL)');
    ok(built.html === page, '⛔ Η ΣΕΛΙΔΑ ' + PAGE_F + ' ΔΕΝ ΕΙΝΑΙ Η ΕΞΟΔΟΣ ΤΟΥ BUILD — γράφτηκε με το χέρι; node tools/eisagogi/arxaia/finish.js ' + id);
  }

  /* ══ Β ══ */
  section(id + ' · Β · ο validator περνάει, και δαγκώνει');
  const errs0 = L.validate(L.load(id), SRC);
  eq(errs0.length, 0, 'ο validator περνάει καθαρά' + (errs0.length ? ':\n      ' + errs0.slice(0, 5).join('\n      ') : ''));
  const N = SRC.sentences.length;
  ok(N >= 8, 'η πηγή σπάει σε ' + N + ' προτάσεις (όχι σε μία μεγάλη)');
  function mutant(label, fn, needle) {
    const d = L.load(id);
    if (fn(d) === false) return;
    const e = L.validate(d, SRC);
    ok(e.some(x => x.indexOf(needle) >= 0), '⭐ ΜΕΤΑΛΛΑΞΗ «' + label + '» ΔΕΝ πιάστηκε (περίμενα «' + needle + '»)');
  }
  const D0 = L.load(id);
  /* ο σταθμός με τα περισσότερα σημεία: αν τον αδειάσεις ΟΛΟΚΛΗΡΟ, κάτι του βιβλίου μένει ακάλυπτο */
  const big = D0.stations.reduce((b, s, i) => (s.points || []).length > (D0.stations[b].points || []).length ? i : b, 0);
  mutant('αδειάζω έναν σταθμό → μένει κενό', d => { const s = d.stations[big]; s.prose = []; s.points = []; s.gloss = []; s.diagram = { type: s.diagram.type }; delete s.quote; delete s.la; }, 'ΚΕΝΟ');
  mutant('άγκυρα που δεν είναι στο βιβλίο', d => { d.stations[0].points[0].a.push('ο φιλόσοφος ήταν γλύπτης στην Αθήνα'); }, 'ΔΕΝ είναι αυτολεξεί');
  mutant('σημείο χωρίς άγκυρα', d => { d.stations[0].points.push({ t: 'Κάτι εύλογο που δεν δένεται πουθενά.', a: [] }); }, 'καμία άγκυρα');
  mutant('το κείμενο δεν λέει την άγκυρά του', d => {
    for (const s of d.stations) for (const p of s.points || []) if (p.a.some(a => L.words(a).length >= 3)) { p.t = 'Ο φιλόσοφος περπατούσε στην αγορά κάθε πρωί.'; return; }
    return false;
  }, 'δεν λέει την άγκυρά του');
  mutant('νούμερο που δεν υπάρχει', d => { d.stations[0].points[0].t += ' Το έγραψε το 7777.'; }, 'το νούμερο «7777»');
  mutant('όνομα που δεν υπάρχει', d => { d.stations[0].points[0].t += ' Το ίδιο έλεγε και ο Ζαρατούστρας.'; }, 'το όνομα «Ζαρατούστρας»');
  mutant('αρχαία λέξη που δεν υπάρχει', d => { d.stations[0].points[0].t += ' Δηλαδή *ἀβρακαδαβρῶν*.'; }, 'η αρχαία λέξη');
  mutant('παγίδα γραμμένη ως αλήθεια', d => { if (!d.traps.length) return false; d.stations[0].points[0].t += ' Άρα ' + d.traps[0].claim + '.'; }, 'ΠΑΓΙΔΑ');
  mutant('απόσπασμα που δεν βρίσκεται', d => { const s = d.stations.find(x => x.quote); if (!s) return false; s.quote.to = 'λέξη που δεν υπάρχει'; }, 'δεν βρέθηκε στο βιβλίο');
  mutant('σταθμός χωρίς σχέδιο', d => { delete d.stations[d.stations.length - 1].diagram; }, 'το δικό του σχέδιο');
  mutant('τύπος σχεδίου που δεν ξέρει το καλούπι', d => { d.stations[0].diagram.type = 'spiral'; }, 'δεν υπάρχει στο DG');
  mutant('πολλαπλή με επιλογή μέσα στην ερώτηση', d => { const c = d.check.mc[0]; c.q = 'Είναι σωστό το «' + c.o[(c.ok + 1) % 4] + '»;'; }, 'μέσα στην ερώτηση');
  mutant('Σ/Λ σε σταθμό που δεν υπάρχει', d => { d.check.tf[0].s = 99; }, 'σταθμό που δεν υπάρχει');
  mutant('ξεχασμένο κενό του σκελετού', d => { d.core = '⟪η φράση στη μέση⟫'; }, 'ασυμπλήρωτο');
  mutant('ίδια φράση σε τρία σημεία', d => { const s = d.stations[0]; while (s.points.length < 3) s.points.push(JSON.parse(JSON.stringify(s.points[0]))); s.points.slice(0, 3).forEach(p => { p.t += ' Η πορεία της σκέψης.'; }); }, 'επαναλαμβάνεται');

  /* ποσότητες-στόχοι (από το Δ2: 59 προτάσεις → 43 ανάκληση · 24 Σ/Λ · 42 πολλαπλή) */
  const C = D0.check;
  ok(C.recall.length >= Math.ceil(N / 2), 'ανάκληση: ~1 ερώτηση ανά 1–2 προτάσεις (' + C.recall.length + ' για ' + N + ' προτάσεις, θέλω ≥' + Math.ceil(N / 2) + ')');
  ok(C.tf.length >= Math.max(8, Math.ceil(N / 3)), 'Σ/Λ σε ύφος Πανελληνίων (' + C.tf.length + ', θέλω ≥' + Math.max(8, Math.ceil(N / 3)) + ')');
  ok(C.tf.some(c => !c.ok) && C.tf.some(c => c.ok), 'Σ/Λ με ΚΑΙ σωστές ΚΑΙ λάθος προτάσεις');
  ok(C.mc.length >= Math.ceil(N / 2), 'πολλαπλή επιλογή (' + C.mc.length + ', θέλω ≥' + Math.ceil(N / 2) + ')');
  if (C.mc.length >= 8) eq(new Set(C.mc.map(c => c.ok)).size, 4, 'η σωστή κάθεται σε ΟΛΕΣ τις θέσεις');
  ok(D0.traps.length >= 3, 'οι παγίδες του κεφαλαίου είναι δηλωμένες για τον validator (' + D0.traps.length + ', θέλω ≥3)');
  ok(C.pitfalls.length >= 2 && !!(C.idea && C.idea.t), 'οι παγίδες στο «Με μια ματιά» και η «μεγάλη ιδέα»');
  ok(D0.stations.every(s => (s.points || []).length >= 1), 'κάθε σταθμός έχει τουλάχιστον ένα σημείο');
  ok(D0.stations.every((s, i) => !i || s.diagram.type !== D0.stations[i - 1].diagram.type), 'δύο διαδοχικοί σταθμοί δεν έχουν το ίδιο σχέδιο');
  ok(D0.stations.every((s, i) => s.n === i + 1), 'οι σταθμοί είναι 1…N, στη σειρά');
  ok(D0.stations.every(s => Array.isArray(s.xy) && s.xy[0] >= 60 && s.xy[0] <= 1040 && s.xy[1] >= 70 && s.xy[1] <= 290), 'ο αστερισμός χωράει στο πλαίσιο 1100×380 (xy)');

  /* ══ Δ ══ */
  section(id + ' · Δ · αποθήκη, καλώδιο');
  eq((page.match(/const KEY="([^"]+)"/g) || []).join('|'), 'const KEY="' + D0.key + '"', 'ΕΝΑ κλειδί, το δηλωμένο');
  ok(/^eisarx-[a-z0-9-]+-v1$/.test(D0.key), 'το κλειδί έχει το σχήμα eisarx-…-v1');
  eq((page.match(/localStorage\.setItem\(/g) || []).length, 1, 'και γράφεται από ΕΝΑ μόνο σημείο');
  ok(page.indexOf('sessionStorage') < 0 && page.indexOf('indexedDB') < 0, '⛔ καμία άλλη αποθήκη');
  ok(page.indexOf('arx:gn') < 0 && page.indexOf('arx:v1') < 0, 'δεν αγγίζει τα κλειδιά του Γνωστού/Αγνώστου');
  ok(!/src=["'][^"']*sync\.js/.test(page) && page.indexOf('initCloudSync') < 0, '⛔ καμία μηχανή συγχρονισμού — το κλειδί μένει στη συσκευή');
  ok(!/@media[^{]*min-width/.test(page), '⛔ κανένα min-width (σταθ. 51)');
  ok(page.indexOf('Instrument Serif') < 0 && page.indexOf('--au-serif') < 0, '⛔ καμία λατινική γραμματοσειρά (7b)');
  const READALL = L.items(D0).filter(it => it.reading || it.mine).map(it => L.plain(it.text)).join(' ');
  ok(!/\b\d{1,2}\/\d{1,2}\/\d{2}\b/.test(READALL), '⛔ καμία ημερομηνία φροντιστηρίου στο κεφάλαιο');
  eq(page.split('\n').filter(l => l.indexOf('href="arxaia.html#gn"') >= 0).length, 1, 'ακριβώς μία γραμμή επιστροφής «← Αρχαία»');
  ok(/<html lang="el">/.test(page), 'αυτοτελής σελίδα στα ελληνικά');
  const plates = GN.split('<a class="gn-pl"').slice(1);
  const pl = (plates.find(x => x.indexOf('href="' + PAGE_F + '"') >= 0) || '');
  const body = pl.slice(0, pl.indexOf('</a>'));
  ok(!!body, 'ο Γνωστός έχει πλάκα για το ' + PAGE_F);
  ok(body.indexOf('<i>Σταθμοί</i><u>' + D0.stations.length + '</u>') > 0, '⛔ η πλάκα διαφημίζει άλλο πλήθος σταθμών');
  ok(body.indexOf('<i>Ερωτήσεις</i><u>' + (C.recall.length + C.tf.length + C.mc.length) + '</u>') > 0, '⛔ η πλάκα διαφημίζει άλλο πλήθος ερωτήσεων');
  ok(PACKS.indexOf("{ file: '" + PAGE_F + "', mine: true") >= 0 && PACKS.indexOf("stores: '" + D0.key + "'") >= 0, 'δηλωμένο στο PACKS του arxaia-gnosto.test.js (mine + stores)');
  ok(SW.indexOf("'" + PAGE_F + "'") > 0, 'είναι στο SW CORE');
  if (D0.cover.seal && D0.cover.seal.img) {
    ok(fs.existsSync(path.join(ROOT, D0.cover.seal.img)), 'η προτομή ' + D0.cover.seal.img + ' υπάρχει');
    ok(SW.indexOf("'" + D0.cover.seal.img + "'") > 0, 'και είναι στο SW CORE');
    ok(/κοινό κτήμα|CC0/.test(D0.cover.seal.credit || '') && /Wikimedia Commons/.test(D0.cover.seal.credit || ''), 'και το credit λέει την άδεια και την πηγή');
  }
  ok(NO_VT.test(PAGE_F), 'και στο NO_VT του topbar (δεν φοράει aurora/kentro-exit)');
  return D0;
}

/* ══ Ε · ΑΛΗΘΙΝΟ CHROME ═══════════════════════════════════════════════ */
async function chrome(b, D) {
  section(D.file + ' · Ε · αληθινό Chrome — διάβασμα, έλεγχος, αποθήκη, γεωμετρία');
  const url = 'file://' + path.join(ROOT, D.file);
  /* Ε1 · κάθε σταθμός ζωγραφίζεται με ΔΙΚΟ ΤΟΥ σημάδι (σταθ. 57) */
  let ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  let p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/fonts\.g/.test(m.text())) errs.push(m.text()); });
  await p.goto(url + '#s1'); await p.waitForTimeout(500);
  for (const s of D.stations) {
    await p.evaluate(n => { location.hash = 's' + n; }, s.n); await p.waitForTimeout(120);
    const r = await p.evaluate(() => ({ h: (document.querySelector('.st h2') || {}).textContent || '', dg: document.querySelectorAll('.st .dg').length, li: document.querySelectorAll('.st .keys li').length, here: !!document.querySelector('#map .node.here'), miss: /Λείπει ο σχεδιαστής/.test((document.querySelector('.st .dg') || {}).textContent || '') }));
    eq(r.h, L.plain(s.title), 'σταθμός ' + s.n + ': ζωγραφίζεται ο τίτλος του');
    ok(r.dg === 1 && !r.miss && r.li === (s.points || []).length && r.here, 'σταθμός ' + s.n + ': ένα σχέδιο, ' + (s.points || []).length + ' σημεία, δαχτυλίδι στον χάρτη');
  }
  const readTxt = await p.evaluate(() => document.getElementById('vRead').innerText);
  ok(!/πηγή:|Πηγή:/.test(readTxt), '⛔ κανένα «πηγή:» μέσα στο Διάβασμα');
  ok(!/\d+\s*\/\s*\d+/.test(readTxt.replace(/\d+\s*\/\s*\d+\s*π\.Χ\./g, '')), '⛔ κανένας μετρητής «n / N» μέσα στο Διάβασμα');
  /* Ε2 · «Το διάβασα» → γράφει ΜΟΝΟ το κλειδί, ανάβει, επιβιώνει reload */
  const k = Math.min(3, D.stations.length);
  await p.evaluate(n => { location.hash = 's' + n; }, k); await p.waitForTimeout(150);
  await p.click('[data-read="' + k + '"]'); await p.waitForTimeout(150);
  const st = await p.evaluate(key => JSON.parse(localStorage.getItem(key)), D.key);
  ok(st && st.read && st.read[String(k)] > 0, 'το «Το διάβασα» γράφει read[' + k + '] στο ' + D.key);
  eq((await p.evaluate(() => Object.keys(localStorage))).join(','), D.key, 'και δεν γράφεται κανένα άλλο κλειδί');
  await p.reload(); await p.waitForTimeout(300);
  ok(await p.evaluate(() => document.querySelectorAll('#map .node.lit').length === 1), 'μετά από reload ο σταθμός ' + k + ' μένει αναμμένος (και μόνο αυτός)');
  /* Ε3 · έλεγχος: ανάκληση «όχι ακόμα» → κενό, με τον σταθμό του, και τελεία στον χάρτη */
  await p.click('#tabCheck'); await p.waitForTimeout(200);
  ok(await p.evaluate(() => /Δεν έχεις ελέγξει τίποτα/.test(document.getElementById('say').textContent)), 'πριν από απάντηση: «δεν έχεις ελέγξει τίποτα» (όχι «0 κενά», σταθ. 33)');
  await p.click('[data-rc="show"]'); await p.click('[data-rc="no"]'); await p.waitForTimeout(100);
  await p.click('[data-mode="gaps"]'); await p.waitForTimeout(100);
  const gp = await p.evaluate(() => ({ n: document.querySelectorAll('.gapst li').length, link: (document.querySelector('.gapst .hd a') || { getAttribute: () => null }).getAttribute('href'), dot: document.querySelectorAll('#map2 .gapdot').length }));
  ok(gp.n === 1 && gp.link === '#s' + D.check.recall[0].s && gp.dot === 1, 'ένα κενό, με σύνδεσμο στον σταθμό του και τελεία στον αστερισμό');
  await p.click('[data-clear]'); await p.waitForTimeout(100);
  ok(await p.evaluate(() => /Κανένα κενό/.test(document.getElementById('pane').textContent)), '«Το ξέρω πια» το σβήνει — και η σελίδα λέει «κανένα κενό», όχι «δεν έλεγξες»');
  await p.click('[data-mode="tf"]'); await p.waitForTimeout(80);
  await p.click('[data-tf="' + D.check.tf[0].id + '"][data-v="' + String(!D.check.tf[0].ok) + '"]'); await p.waitForTimeout(80);
  ok(await p.evaluate(() => !!document.querySelector('.qi .ex .v.no')), 'Σ/Λ: λάθος απάντηση δείχνει εξήγηση');
  await p.click('[data-mode="mc"]'); await p.click('[data-mode="glance"]'); await p.waitForTimeout(80);
  const nm = D.stations.filter(s => s.mnem).length;
  ok(await p.evaluate(([a, c]) => document.querySelectorAll('.nums > div').length === a && document.querySelectorAll('.mlist > div').length === c, [D.check.numbers.length, nm]), 'Με μια ματιά: ' + D.check.numbers.length + ' νούμερα, ' + nm + ' μνημονικά');
  eq(errs.length, 0, 'μηδέν σφάλματα JS' + (errs.length ? ': ' + errs.join(' | ') : ''));
  /* Ε4 · κάθε πολυτονικό ζωγραφίζεται σε GFS Didot (7b, ανά στοιχείο) */
  await p.click('#tabRead'); await p.waitForTimeout(100);
  let bad = [];
  for (const s of D.stations) {
    await p.evaluate(n => { location.hash = 's' + n; }, s.n); await p.waitForTimeout(80);
    bad = bad.concat(await p.evaluate(() => {
      const out = [], POLY = /[ἀ-῿]/, w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let n; while ((n = w.nextNode())) {
        if (!POLY.test(n.nodeValue) || !n.parentElement || n.parentElement.closest('[hidden],svg,script,style,noscript')) continue;
        const f = getComputedStyle(n.parentElement).fontFamily;
        if (!/^"?GFS Didot/.test(f)) out.push(n.nodeValue.trim().slice(0, 30) + ' → ' + f.slice(0, 30));
      } return out;
    }));
  }
  eq(bad.length, 0, '⛔ πολυτονικό σε γραμματοσειρά χωρίς πολυτονικό: ' + bad.slice(0, 4).join(' | '));
  /* Ε5 · χαλασμένη αποθήκη: banner, και ΚΑΜΙΑ εγγραφή από πάνω */
  await p.evaluate(key => localStorage.setItem(key, '{σπασμένο'), D.key);
  await p.reload(); await p.waitForTimeout(200);
  ok(await p.evaluate(() => !document.getElementById('banner').hidden), 'χαλασμένη πρόοδος → φαίνεται banner');
  await p.evaluate(() => { location.hash = 's1'; }); await p.waitForTimeout(100);
  await p.click('[data-read="1"]'); await p.waitForTimeout(100);
  eq(await p.evaluate(key => localStorage.getItem(key), D.key), '{σπασμένο', '⛔ και η σελίδα ΔΕΝ γράφει από πάνω της (μπορεί να είναι η πρόοδός του)');
  await ctx.close();
  /* Ε6 · γεωμετρία: 1440 / 1180 / 390, και στο κινητό 11px + 44px */
  const hashes = D.stations.map(s => '#s' + s.n).concat(['#fin', '#elegxos']);
  for (const W of [1440, 1180, 390]) {
    ctx = await b.newContext({ viewport: { width: W, height: 860 } }); p = await ctx.newPage();
    let worst = 0;
    for (const h of hashes) {
      /* ?w= : το ίδιο URL με άλλο #hash δεν ξαναφορτώνει (σταθ. του render) */
      await p.goto(url + '?w=' + W + h); await p.waitForTimeout(220);
      worst = Math.max(worst, await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth));
      /* ⚠️ το .dg έχει overflow:hidden — κομμένο κείμενο ΔΕΝ φαίνεται ως κύλιση: μετριέται κάθε άκρη */
      const spill = await p.evaluate(() => {
        const out = [];
        document.querySelectorAll('.dg').forEach(dg => {
          const R = dg.getBoundingClientRect();
          dg.querySelectorAll('*').forEach(el => {
            if (!el.childNodes.length || el.closest('svg')) return;
            const r = el.getBoundingClientRect();
            if (r.width && (r.right > R.right + 1 || r.left < R.left - 1)) out.push(el.textContent.trim().slice(0, 24));
          });
        });
        return out;
      });
      ok(!spill.length, h + ' @' + W + ': κείμενο ξεχειλίζει από το σχέδιο: ' + spill.slice(0, 3).join(' | '));
      if (W === 390) {
        const r = await p.evaluate(() => {
          const small = [], tiny = [];
          document.querySelectorAll('body *').forEach(el => {
            if (el.closest('[hidden],svg') || !el.offsetParent) return;
            const own = [...el.childNodes].some(n => n.nodeType === 3 && n.nodeValue.trim());
            if (own && parseFloat(getComputedStyle(el).fontSize) < 11) small.push(el.className + ':' + el.textContent.trim().slice(0, 20));
            if (el.matches('button,a.back,.tabs button,.subnav button')) { const q = el.getBoundingClientRect(); if (q.height < 40 || q.width < 40) tiny.push((el.textContent || '').trim().slice(0, 20) + ' ' + Math.round(q.width) + '×' + Math.round(q.height)); }
          });
          return { small, tiny };
        });
        ok(!r.small.length, h + ' @390: κείμενο κάτω από 11px: ' + r.small.slice(0, 3).join(' | '));
        ok(!r.tiny.length, h + ' @390: στόχος αφής κάτω από 44: ' + r.tiny.slice(0, 3).join(' | '));
      }
    }
    eq(worst, 0, 'μηδέν οριζόντια κύλιση στα ' + W + 'px (σε όλους τους σταθμούς, στο τέλος και στον Έλεγχο)');
    await ctx.close();
  }
  /* Ε7 · οι 3 φωτογραφίες του finish.js (μόνο με EIS_SHOTS) */
  if (process.env.EIS_SHOTS) {
    const dir = process.env.EIS_SHOTS, id = path.basename(D.source.file).replace(/^arxaia-eisagogi-|\.source\.txt$/g, '');
    fs.mkdirSync(dir, { recursive: true });
    const most = D.stations.reduce((m, s) => JSON.stringify(s.diagram).length > JSON.stringify(m.diagram).length ? s : m, D.stations[0]);
    ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); p = await ctx.newPage();
    await p.goto(url); await p.waitForTimeout(900);
    await p.screenshot({ path: path.join(dir, D.file.replace(/\.html$/, '') + '-1-first.png') });
    await p.goto(url + '?s=' + most.n + '#s' + most.n); await p.waitForTimeout(1200);
    await p.screenshot({ path: path.join(dir, D.file.replace(/\.html$/, '') + '-2-station' + most.n + '.png'), fullPage: true });
    await ctx.close();
    ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); p = await ctx.newPage();
    await p.addInitScript(([key, n]) => { const r = {}; for (let i = 1; i <= Math.max(1, n - 2); i++) r[i] = 1; localStorage.setItem(key, JSON.stringify({ v: 1, at: Math.max(1, n - 1), read: r, rc: {}, tf: {}, mc: {} })); }, [D.key, D.stations.length]);
    await p.goto(url); await p.waitForTimeout(900);
    await p.screenshot({ path: path.join(dir, D.file.replace(/\.html$/, '') + '-3-return.png') });
    await ctx.close();
    void id;
  }
}

(async function main() {
  const loaded = [];
  IDS.forEach(id => { try { loaded.push(statics(id)); } catch (e) { ok(false, id + ': ο στατικός έλεγχος έσκασε: ' + e.message); } });
  let chromium;
  try { chromium = require(path.join(ROOT, 'video-kit', 'node_modules', 'playwright')).chromium; }
  catch (e) { ok(false, 'δεν βρέθηκε Playwright στο video-kit — ΤΟ Ε ΔΕΝ ΕΤΡΕΞΕ'); return finish(); }
  const b = await chromium.launch();
  for (const D of loaded) {
    if (!fs.existsSync(path.join(ROOT, D.file))) { ok(false, D.file + ' δεν υπάρχει — ΤΟ Ε ΔΕΝ ΕΤΡΕΞΕ'); continue; }
    try { await chrome(b, D); } catch (e) { ok(false, D.file + ': το σενάριο του Chrome έσκασε: ' + e.message); }
  }
  await b.close();
  finish();
})();

function finish() {
  console.log('\n──────────────────────────────────────────────');
  console.log('ΑΡΧΑΙΑ · ΕΙΣΑΓΩΓΗ — ΤΟ ΓΕΝΙΚΟ TEST (' + IDS.join(', ') + ')');
  console.log((fail ? '✗ ' : '✓ ') + pass + ' πέρασαν, ' + fail + ' απέτυχαν');
  console.log('──────────────────────────────────────────────');
  process.exit(fail ? 1 : 0);
}
