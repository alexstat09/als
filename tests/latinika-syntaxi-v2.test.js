// latinika-syntaxi-v2.html — «Σύνταξε μόνος σου», η νέα μορφή (als-v787).
// Η σελίδα δεν έχει δική της ύλη: το κλειδί κάθε λέξης ΠΑΡΑΓΕΤΑΙ από το `x` του
// πακέτου. Ο φρουρός ελέγχει (1) ότι διαβάζει ΑΚΡΙΒΩΣ τις λέξεις του πακέτου,
// (2) ότι η αυτόματη κρίση λέει την αλήθεια — σωστή απάντηση → ✓, άλλη λειτουργία → ✗,
// άγραφη → ουδέτερη, (3) ότι ο γύρος/η επανάληψη/η μεταφορά από το v1 δουλεύουν,
// (4) τους κανόνες εμφάνισης που έχουν σπάσει σελίδες στο παρελθόν.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const R = path.join(__dirname, '..');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  ✗ ' + m); } };
const read = f => fs.readFileSync(path.join(R, f), 'utf8');

const PAGE = read('latinika-syntaxi-v2.html');
const OLD = read('latinika-syntaxi.html');
const script = PAGE.match(/<script>([\s\S]*?)<\/script>/)[1];
const logic = script.slice(0, script.indexOf("if (typeof document !== 'undefined')"));
ok(logic.length > 1000, 'βρέθηκε η καθαρή λογική της σελίδας');

function fresh(ls) {
  const store = Object.assign({}, ls || {});
  const ctx = { localStorage: { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); } } };
  vm.createContext(ctx);
  vm.runInContext(logic + '\nthis.X={TEXTS,keyOf,parseMine,judge,parsePack,rec,load,save,store:function(){return store;},importOld,lockOf,isDue,askable,lockedN,closeRound,headIdx,keyLabel,cands,kindOk,sameW,DAYS,DAY};', ctx);
  ctx.X.raw = store;
  return ctx.X;
}
const X = fresh();

// §1 — καλωδίωση: κάθε κείμενο εδώ = μία γραμμή με v2 στην παλιά λίστα, και ανάποδα
const oldV2 = [...OLD.matchAll(/\{ id:'(\d+)',[^}]*v2:'latinika-syntaxi-v2\.html' \}/g)].map(m => m[1]);
const ids = X.TEXTS.map(t => t.id);
ok(ids.length >= 1, 'τουλάχιστον ένα κείμενο');
ids.forEach(id => ok(oldV2.includes(id), id + ': η παλιά λίστα δεν το στέλνει εδώ'));
oldV2.forEach(id => ok(ids.includes(id), id + ': η παλιά λίστα στέλνει εδώ κείμενο που η v2 δεν έχει'));
ok(/a\.href = t\.v2 \? t\.v2 \+ '\?l=' \+ t\.id/.test(OLD), 'η παλιά λίστα ανοίγει τη v2 για τα κείμενα v2');
ok(/if \(cur && cur\.v2\) location\.replace\(cur\.v2/.test(OLD), 'παλιός σύνδεσμος ?l=29 → v2');
ok(/'latinika-syntaxi-v2\.html'/.test(read('sw.js')), 'η σελίδα είναι στο sw.js');
ok(!/sync\.js|supabase|pocoach-sync/i.test(PAGE), '⛔ κανένα sync script στη σελίδα');

// §2 — ο αναγνώστης: ΑΚΡΙΒΩΣ οι λέξεις του πακέτου, με τη σειρά, χωρίς τις προθέσεις
X.TEXTS.forEach(t => {
  const src = read(t.file);
  const P = X.parsePack(src);
  ok(P && P.slots.length > 40, t.id + ': διαβάστηκε το πακέτο');
  if (!P) return;
  ok(P.title && !/Lectio/.test(P.title), t.id + ': τίτλος «' + P.title + '»');
  const m = /\nconst S = \[/.exec(src);
  const arr = vm.runInNewContext('(' + src.slice(m.index + 11, src.indexOf('\n];', m.index) + 2) + ')');
  const words = [];
  arr.forEach(sc => sc.s.forEach(u => u.la.forEach(w => { if (!/^Πρόθεση/.test(w.x || '')) words.push(w); })));
  ok(words.length === P.slots.length, t.id + ': ' + words.length + ' λέξεις στο πακέτο, ' + P.slots.length + ' στη σελίδα');
  ok(P.slots.every((s, i) => words[i] && s.w === words[i].w && s.x === words[i].x), t.id + ': λέξεις/σωστό όχι αυτούσια από το πακέτο');
  ok(Object.keys(P.CL).length > 3, t.id + ': διαβάστηκαν οι προτάσεις (CL)');

  // §3 — η κρίση λέει την αλήθεια
  const keyed = P.slots.filter(s => s.key.roles.length);
  ok(keyed.length >= P.slots.length - 2, t.id + ': κλειδί για ' + keyed.length + '/' + P.slots.length);
  const AB = {RHM:'ρ',YPO:'υ',ANT:'αντ',KTG:'κτγ',EPTH:'επιθ',KP:'κπ',PAR:'παρ',EPEX:'επεξ',EMP:'εμπρ',EPR:'επιρ',GEN:'γεν',DOT:'δοτ',AF:'αφ',AIT:'αιτ',MTX:'μτχ',APR:'απαρ',SYN:'συνδ',KL:'κλ'};
  let right = 0, wrongCaught = 0, heads = 0, headsFound = 0;
  P.slots.forEach(s => {
    const r = s.key.roles[0]; if (!r) return;
    let hj = null;
    if (r.head) { heads++; hj = X.headIdx(P, s, r.head); if (hj >= 0) headsFound++; else hj = null; }
    const sub = r.sub && /^(αμεσο|εμμεσο|συστοιχο|χρονικη|αιτιολογικη|επιθετικη|τροπικη|τελικη|υποθετικη|εναντιωματικη|ειδικο|τελικο|κτητικη|υποκειμενικη|αντικειμενικη|διαιρετικη|ποιοτητασ|αξιασ|δευτερο)$/.test(r.sub) ? ' ' + r.sub.slice(0, 4) : '';
    const v = X.judge(s, { t: AB[r.c] + sub, h: hj }, P.slots);
    if (v.v === 'ok') right++; else console.log('    (σωστή απάντηση όχι ✓) ' + s.w + ' → ' + v.v + ' · ' + v.why);
    const w = X.judge(s, { t: r.c === 'YPO' ? 'αντ' : 'υ', h: hj }, P.slots);
    if (s.key.roles.some(o => o.c === (r.c === 'YPO' ? 'ANT' : 'YPO'))) return; // διπλός ρόλος: το «λάθος» είναι σωστό
    if (w.v === 'bad') wrongCaught++;
  });
  ok(right === keyed.length, t.id + ': σωστές απαντήσεις → ✓ ' + right + '/' + keyed.length);
  ok(headsFound === heads, t.id + ': κάθε όρος του κλειδιού βρίσκεται στο κείμενο ' + headsFound + '/' + heads);
  ok(wrongCaught >= keyed.length * 0.95, t.id + ': άλλη λειτουργία → ✗ ' + wrongCaught);
  P.slots.forEach(s => ok(X.judge(s, { t: '' }, P.slots).v === 'skip', t.id + ': άγραφη ≠ ουδέτερη: ' + s.w));
  P.slots.forEach(s => ok(X.judge(s, { t: 'ξψζ' }, P.slots).v !== 'bad', t.id + ': άγνωστη συντομογραφία έγινε ✗: ' + s.w));
});

// §3β — XXIX συγκεκριμένα (μετρημένα στο demo)
{
  const P = X.parsePack(read('latinika-lectio29.html'));
  const at = w => P.slots.findIndex(s => s.w === w);
  const oct = P.slots[at('Octaviānus')], red = at('redīret,'), occ = at('occurrit');
  ok(X.judge(oct, { t: 'υ', h: red }, P.slots).v === 'ok', 'Octaviānus υ→redīret = ✓');
  ok(X.judge(oct, { t: 'υ', h: occ }, P.slots).v === 'half', 'Octaviānus υ→occurrit = ½ (λάθος όρος)');
  ok(X.judge(oct, { t: 'υ' }, P.slots).v === 'half', 'Octaviānus υ χωρίς όρο = ½');
  ok(X.judge(oct, { t: 'αντ', h: red }, P.slots).v === 'bad', 'Octaviānus αντ = ✗');
  const eum = P.slots[at('eum')];
  ok(X.keyLabel(P, eum).indexOf('αμεσ. Αντ. → instituerat') === 0, 'eum: «αμεσ. Αντ. → instituerat» (' + X.keyLabel(P, eum) + ')');
  ok(X.judge(eum, { t: 'αντ', h: at('instituerat') }, P.slots).v === 'half', 'eum «αντ» χωρίς «άμεσο» = ½');
  ok(X.judge(eum, { t: 'αα', h: at('instituerat') }, P.slots).v === 'ok', 'eum αα→instituerat = ✓');
  const avem = P.slots[at('avem')];
  ok(X.judge(avem, { t: 'αντ', h: at('emitque') }, P.slots).v === 'ok', 'avem → emitque (εγκλιτικό -que) = ✓');
  const non = P.slots[at('non')];
  ok(non && X.judge(non, { t: 'μόριο' }, P.slots).v === 'ask', 'non: χωρίς κλειδί = «κρίνε εσύ»');
  ok(X.kindOk('δευτ. χρονική', 'δευτερεύουσα χρονική'), 'είδος πρότασης: χρονική ✓');
  ok(!X.kindOk('δευτ. χρονική', 'αιτιολογική'), 'είδος πρότασης: αιτιολογική ≠ χρονική');
  ok(!X.kindOk('δευτ. χρονική', ''), 'είδος πρότασης: κενό ≠ σωστό');
  ok(X.cands(P, { ans: { [at('Octaviānus')]: { t: 'υ' } } }, at('Octaviānus')).includes(red), 'υποψήφιοι όροι: το redīret είναι μέσα');
}

// §4 — συντομογραφίες
const sh = (s, c, sub) => { const m = X.parseMine(s); ok(m && m.c === c && (sub == null || m.sub === sub), '«' + s + '» → ' + c + (sub ? ' ' + sub : '') + ' (' + JSON.stringify(m) + ')'); };
sh('υ', 'YPO'); sh('Υποκ.', 'YPO'); sh('αα', 'ANT', 'αμεσο'); sh('εα', 'ANT', 'εμμεσο'); sh('αντ', 'ANT');
sh('κτγ', 'KTG'); sh('κπ', 'KP'); sh('επιθ', 'EPTH'); sh('παρ', 'PAR'); sh('εμπρ χρ', 'EMP');
sh('γεν κτ', 'GEN'); sh('αφ', 'AF'); sh('μτχ χρον', 'MTX', 'χρον'); sh('απαρ τελ', 'APR'); sh('ρ', 'RHM'); sh('συνδ', 'SYN');
ok(X.parseMine('ξψζ').c === null, 'άγνωστο → null');
ok(X.parseMine('   ') === null, 'κενό → τίποτα');

// §5 — αποθήκη, γύρος, επανάληψη, μεταφορά από το v1
{
  const P = X.parsePack(read('latinika-lectio29.html'));
  // το v1 μετράει θέσεις σε ΟΛΕΣ τις λέξεις (και τις προθέσεις)· η v2 μόνο στις ζητούμενες
  const allWords = []; P.scenes.forEach(() => {});
  const firstPrepAll = Object.keys(P.fromAll).length < P.slots.length + 20;
  ok(firstPrepAll, 'fromAll υπάρχει');
  const allIdx = Object.keys(P.fromAll).map(Number);
  const prepAll = []; for (let k = 0; k <= Math.max(...allIdx); k++) if (!(k in P.fromAll)) prepAll.push(k);
  ok(prepAll.length > 0, 'XXIX έχει προθέσεις χωρίς κουτί (' + prepAll.length + ')');
  const v1 = { '29': { locked: { [allIdx[0]]: true, [allIdx[5]]: true, [prepAll[0]]: true } } };
  const Y = fresh({ 'latsyn:v1': JSON.stringify(v1) });
  Y.load(); const r = Y.rec('29'); const now = 1_800_000_000_000;
  Y.importOld('29', P, r, now);
  ok(Object.keys(r.locked).length === 2, 'v1 → v2: δύο κλειδώματα (η πρόθεση αγνοείται): ' + Object.keys(r.locked).length);
  ok(r.locked[P.fromAll[allIdx[5]]] && r.locked[P.fromAll[allIdx[5]]].w === P.slots[P.fromAll[allIdx[5]]].w, 'v1 → v2: η σωστή λέξη στη σωστή θέση');
  r.locked = {}; Y.importOld('29', P, r, now);
  ok(Object.keys(r.locked).length === 0, 'η μεταφορά γίνεται ΜΙΑ φορά');
  ok(Y.raw['latsyn:v1'] === JSON.stringify(v1), 'το v1 δεν αγγίχτηκε');

  // γύρος
  r.ver = { 0: { v: 'ok' }, 1: { v: 'half' }, 2: { v: 'bad' }, 3: { v: 'skip' }, 4: { v: 'ask' } };
  r.ans = { 0: { t: 'σ' }, 1: { t: 'μ' }, 2: { t: 'λ' }, 4: { t: 'α' } };
  r.locked[2] = { w: P.slots[2].w, t: now - 99 * Y.DAY, n: 1 };
  r.phase = 'check'; const round0 = r.round;
  Y.closeRound(r, P, now);
  ok(r.locked[0] && r.locked[0].n === 0 && r.locked[0].t === now, '✓ κλειδώνει (στάδιο 0)');
  ok(!r.locked[1] && !r.locked[2], '½ και ✗ ξεκλειδώνουν');
  ok(!r.ans[0] && !r.ans[1] && !r.ans[2] && r.ans[4], 'οι απαντήσεις: σβήνουν ✓½✗, μένει το «κρίνε εσύ»');
  ok(r.hist.length === 3 && r.hist.filter(h => h.ok).length === 1, 'ιστορικό: 3 κρίσεις, 1 σωστή (άγραφη/κρίνε εσύ δεν μετράνε)');
  ok(r.phase === 'write' && r.round === round0 + 1 && Object.keys(r.ver).length === 0, 'νέος γύρος');
  ok(!Y.askable(r, P, 0, now + Y.DAY), 'κλειδωμένη δεν ρωτιέται πριν την ώρα της');
  ok(Y.askable(r, P, 0, now + 3 * Y.DAY), 'μετά από 3 μέρες ξαναβγαίνει');
  ok(Y.lockedN(r, P, now + 3 * Y.DAY) === 0 && Y.lockedN(r, P, now) === 1, 'το νούμερο του εξωφύλλου μετράει μόνο τις μη ληξιπρόθεσμες');
  r.ver = { 0: { v: 'ok' } }; Y.closeRound(r, P, now + 4 * Y.DAY);
  ok(r.locked[0].n === 1, 'δεύτερο ✓ → στάδιο 1 (7 μέρες)');
  ok(!Y.askable(r, P, 0, now + 4 * Y.DAY + 6 * Y.DAY) && Y.askable(r, P, 0, now + 4 * Y.DAY + 7 * Y.DAY), 'στάδιο 1 = 7 μέρες');
  r.all = true; ok(Y.askable(r, P, 0, now), '«Όλο το κείμενο» ρωτάει και τις κλειδωμένες'); r.all = false;
  r.locked[7] = { w: 'ψεύτικο', t: now, n: 0 };
  ok(!Y.lockOf(r, P, 7) && Y.askable(r, P, 7, now), 'κλείδωμα με άλλη λέξη (άλλαξε το πακέτο) αγνοείται');
  r.lens = 'MTX';
  const lensN = P.slots.filter((s, i) => Y.askable(r, P, i, now)).length;
  ok(lensN > 0 && lensN === P.slots.filter((s, i) => !Y.lockOf(r, P, i) && s.key.roles.some(o => o.c === 'MTX')).length, 'φακός «Μετοχή»: μόνο μετοχές (' + lensN + ')');
  Y.save();
  const back = JSON.parse(Y.raw['latsyn:v2'])['29'];
  ok(back && back.locked && back.lens === 'MTX', 'αποθηκεύεται στο latsyn:v2');
  const Z = fresh({ 'latsyn:v2': '[1,2]' }); Z.load(); Z.rec('29');
  ok(true, 'χαλασμένη αποθήκη δεν σκάει');
}

// §6 — εμφάνιση: οι κανόνες που έσπασαν σελίδες
const css = PAGE.match(/<style>([\s\S]*?)<\/style>/)[1];
ok((PAGE.match(/<\/style/g) || []).length === 1, '⛔ η λέξη κλεισίματος στυλ εμφανίζεται ΜΙΑ φορά (σταθ. als-v770)');
const rules = [...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)];
const serifSel = rules.filter(m => /var\(--serif\)/.test(m[2])).map(m => m[1].trim());
const LATIN = /^(\.cover \.rn|\.face \.n|\.sch \.i|\.sl \.w|\.cw|\.cand|\.cl \.la)$/;
serifSel.forEach(s => s.split(',').forEach(x => ok(LATIN.test(x.trim()), '⛔ --serif (χωρίς ελληνικά γλυφά) σε μη λατινικό: ' + x.trim())));
ok(serifSel.length >= 5, 'η Instrument Serif μένει στα λατινικά (' + serifSel.length + ')');
ok(/\.cover h1\{font-family:var\(--rd\)/.test(css) && /\.why\{font-family:var\(--rd\)/.test(css), 'ελληνικοί τίτλοι/πρόζα σε Literata');
ok(!/min-width\s*:\s*\d/.test(css.replace(/min-width:0/g, '')), '⛔ κανένα min-width breakpoint/κουτί');
ok(/@media \(max-width:960px\)/.test(css) && /@media \(max-width:560px\)/.test(css), 'breakpoints σε max-width');
ok(/\.side \.card\{background:var\(--s1\)/.test(css), 'στο κινητό η κάρτα είναι συμπαγής (όχι διάφανη πάνω στο κείμενο)');
ok(!/box-shadow:0|text-shadow|emoji/.test(css), 'καμία σκιά');
ok(/\.card \.cx\{display:block\}/.test(css) && (PAGE.match(/class="cx" id="bClose"/g) || []).length === 2, 'κινητό: η κάρτα κλείνει (κουμπί «Κλείσιμο» και στις δύο φάσεις)');
ok(!/(^|[\s,}])\.(card|errs) \.x\b/.test(css), '⛔ καμία κλάση «.x» στην κάρτα — κρύβει τις ροζ παυλίτσες των λαθών');
ok(/\.tally span\{white-space:nowrap\}/.test(css), 'κινητό: ο απολογισμός δεν σπάει «σωστά / 11»');
ok(!/\.top \.path\{display:none\}/.test(css), 'κινητό: ο σύνδεσμος επιστροφής δεν κρύβεται');
ok(/<meta name="viewport"/.test(PAGE) && /<html lang="el">/.test(PAGE), 'viewport + lang');

console.log((fail ? '✗' : '✓') + ' latinika-syntaxi-v2: ' + pass + ' / ' + (pass + fail));
process.exit(fail ? 1 : 0);
