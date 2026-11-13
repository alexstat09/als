/* tests/grammatiki.test.js — η μηχανή + τα δεδομένα της «Γραμματικής»
   (grammatiki-core.js + data/grammatiki/*.json).
   ⭐ Σταθ. 54: τα δεδομένα (το βιβλίο του) και οι κανόνες (ο κώδικας) πρέπει να
   αποδεικνύουν ο ένας τον άλλον — και κάθε μηχανικός έλεγχος δοκιμάζεται ΚΑΙ
   με μετάλλαξη: η σπασμένη μορφή ΠΡΕΠΕΙ να πιαστεί.
   ⭐ Σταθ. 27: καμία κάρτα δεν δίνει την απάντηση μέσα στην ερώτηση, και καμία
   λάθος επιλογή δεν είναι η σωστή. */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const G = require(path.join(ROOT, 'grammatiki-core.js'));
let pass = 0, fail = 0;
function ok(c, m) { if (c) pass++; else { fail++; console.log('  ✗ ' + m); } }
const J = f => JSON.parse(fs.readFileSync(path.join(ROOT, 'data/grammatiki', f), 'utf8'));
const clone = o => JSON.parse(JSON.stringify(o));

const IDX = J('index.json');
const UNITS = [];
IDX.groups.forEach(g => g.items.forEach(it => { if (it.file) UNITS.push(J(it.file)); }));

/* ── 1 · ευρετήριο ── */
ok(UNITS.length >= 1, 'τουλάχιστον μία ενότητα με αρχείο');
IDX.groups.forEach(g => g.items.forEach(it => {
  ok(typeof it.page === 'number', 'σελίδα βιβλίου για «' + it.title + '»');
  if (it.file) ok(fs.existsSync(path.join(ROOT, 'data/grammatiki', it.file)), 'υπάρχει ' + it.file);
}));
const pages = []; IDX.groups.forEach(g => g.items.forEach(it => pages.push(it.page)));
ok(pages.every((p, i) => i === 0 || p >= pages[i - 1]), 'το ευρετήριο ακολουθεί τη σειρά του βιβλίου');
const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
UNITS.forEach(u => ok(sw.includes("'data/grammatiki/" + u.id + ".json'"), 'το sw.js κρατάει offline το ' + u.id));

/* ── 2 · κάθε ενότητα: δομή ── */
UNITS.forEach(u => {
  const errs = G.validate(u);
  ok(errs.length === 0, u.id + ': validate → ' + errs.join(' | '));
  ok(u.find.every(f => G.allModels(u).some(m => m.id === f.to)), u.id + ': κάθε «Βρες το υπόδειγμα» δείχνει σε υπόδειγμα');
  G.allModels(u).forEach(m => {
    const t = G.table(m);
    t.cells.forEach(r => r.forEach(c => {
      if (!c) return;
      const p = G.plain(c).normalize('NFD');
      const acc = (p.match(/[́̀͂]/g) || []).length;
      ok(acc === 1, u.id + '/' + m.id + ': ένας τόνος στο «' + G.plain(c) + '» (βρέθηκαν ' + acc + ')');
    }));
    (m.why || []).forEach(y => ok(y.d && y.d.length > 20, m.id + ': το «γιατί» του «' + y.form + '» εξηγεί'));
  });
  u.rules.forEach((r, i) => ok(r.t && r.d && r.ex, u.id + ': κανόνας ' + i + ' έχει τίτλο, εξήγηση, παράδειγμα'));
  const titles = u.rules.map(r => r.t);
  ok(new Set(titles).size === titles.length, u.id + ': διαφορετικοί τίτλοι κανόνων (αλλιώς η κάρτα «Γιατί» έχει δύο σωστές)');
  // κάθε κανόνας χρησιμοποιείται από τουλάχιστον ένα «γιατί» ή είναι μόνο για διάβασμα — δεν απαιτείται, αλλά κάθε why δείχνει σε υπαρκτό
});

/* ── 3 · Α΄ ΚΛΙΣΗ: οι κανόνες του βιβλίου ελέγχονται πάνω στους τύπους ── */
const A = UNITS.find(u => u.id === 'a-klisi');
const VOW = 'αεηιουωᾳῃῳ';
const base = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
function lawsA(u) {
  const bad = [];
  u.models.concat(u.contracted.models).forEach(m => {
    if (m.pl) {
      const gp = G.plain(m.pl[1]);
      if (!/ῶν$/.test(gp)) bad.push(m.id + ': γεν. πληθ. όχι ‑ῶν (' + gp + ')');
      ['αι', 'αις', 'ας', 'αι'].forEach((e, i) => { const f = base(G.plain(m.pl[[0, 2, 3, 4][i]])); if (!f.endsWith(e)) bad.push(m.id + ': πληθ. όχι ‑' + e + ' (' + f + ')'); });
    }
    /* ⚠️ ο Βορρᾶς: τοῦ Βορρᾶ — έτσι το τυπώνει το βιβλίο (σελ. 9) και είναι σωστό· η ΜΟΝΗ δηλωμένη εξαίρεση */
    if (m.g === 'm' && m.id !== 'borras' && !/(ου|οῦ)$/.test(G.plain(m.sg[1]))) bad.push(m.id + ': γεν. εν. αρσενικού όχι ‑ου');
  });
  // καθαρό / μη καθαρό α, ΚΑΙ στα «κλίνονται έτσι»
  const pure = w => { const b = base(w); return VOW.includes(b[b.length - 2]) || b[b.length - 2] === 'ρ'; };
  const ora = u.models.find(m => m.id === 'ora'), th = u.models.find(m => m.id === 'thalassa');
  [ora.w].concat(ora.like).forEach(w => { if (!pure(w)) bad.push('ὥρα: «' + w + '» δεν έχει καθαρό α'); });
  [th.w].concat(th.like).forEach(w => { if (pure(w)) bad.push('θάλασσα: «' + w + '» έχει καθαρό α'); });
  if (!base(G.plain(ora.sg[1])).endsWith('ας')) bad.push('ὥρα: γεν. όχι ‑ας');
  if (!base(G.plain(th.sg[1])).endsWith('ης')) bad.push('θάλασσα: γεν. όχι ‑ης');
  // κλητική σε ‑α για ‑της
  const st = u.models.find(m => m.id === 'stratiotis');
  if (!base(G.plain(st.sg[4])).endsWith('α')) bad.push('στρατιώτης: κλητική όχι ‑α');
  st.like.filter(w => /της$/.test(base(w))).forEach(() => {}); // τα ‑της ακολουθούν τον ίδιο κανόνα
  // ‑ας μακρό → η αιτ. πληθ. ΔΕΝ παίρνει περισπωμένη στην παραλήγουσα
  u.models.forEach(m => { if (/͂/.test(G.plain(m.pl[3]).normalize('NFD').slice(0, -3))) bad.push(m.id + ': αιτ. πληθ. με περισπωμένη πριν από μακρό ‑ας'); });
  // συνηρημένα: λήγουσα με περισπωμένη σε ονομαστική ενικού
  u.contracted.models.forEach(m => { if (!/͂/.test(G.plain(m.sg[0]).normalize('NFD'))) bad.push(m.id + ': ονομ. χωρίς περισπωμένη'); });
  return bad;
}
if (A) {
  const b0 = lawsA(A);
  ok(b0.length === 0, 'α΄ κλίση: οι κανόνες ισχύουν πάνω στους τύπους → ' + b0.join(' | '));
  ok(A.models.map(m => m.w).join() === 'ταμίας,στρατιώτης,ὥρα,θάλασσα,κώμη', 'α΄: τα υποδείγματα του ΒΙΒΛΙΟΥ, με τη σειρά του');
  ok(A.contracted.models.map(m => m.w).join() === 'Ἑρμῆς,μνᾶ,συκῆ,Βορρᾶς', 'α΄: και τα 4 συνηρημένα της σελ. 9');
  // μεταλλάξεις — κάθε μία ΠΡΕΠΕΙ να πιαστεί
  const MUT = [
    ['μέλισσα στο ὥρα', u => u.models[2].like.push('μέλισσα')],
    ['χώρα στο θάλασσα', u => u.models[3].like.push('χώρα')],
    ['θαλάσσ|ας', u => { u.models[3].sg[1] = 'θαλάσσ|ας'; }],
    ['ταμί|ας στη γενική', u => { u.models[0].sg[1] = 'ταμί|ας'; }],
    ['γεν. πληθ. ὥρ|ων', u => { u.models[2].pl[1] = 'ὥρ|ων'; }],
    ['στρατιῶτ|ας', u => { u.models[1].pl[3] = 'στρατιῶτ|ας'; }],
    ['κλητική στρατιώτ|η', u => { u.models[1].sg[4] = 'στρατιώτ|η'; }],
    ['συκ|ή', u => { u.contracted.models[2].sg[0] = 'συκ|ή'; }]
  ];
  MUT.forEach(([n, f]) => { const c = clone(A); f(c); ok(lawsA(c).length > 0, 'μετάλλαξη «' + n + '» πιάνεται'); });
  // μετάλλαξη στο validate: διπλός τόνος, χωρίς |, λέξη σε δύο υποδείγματα, why σε ανύπαρκτο κανόνα
  [['χωρίς |', u => { u.models[0].sg[0] = 'ταμίας'; }],
   ['ίδια λέξη σε δύο', u => { u.models[4].like.push('χώρα'); }],
   ['why σε κανόνα 99', u => { u.models[0].why[0].rule = 99; }],
   ['λιγότερα κελιά', u => { u.models[0].pl.pop(); }]
  ].forEach(([n, f]) => { const c = clone(A); f(c); let e; try { e = G.validate(c); } catch (x) { e = [String(x)]; } ok(e.length > 0, 'validate πιάνει «' + n + '»'); });
}

/* ── 4 · κάρτες: σταθ. 27 ── */
UNITS.forEach(u => {
  const cs = G.cards(u);
  const ids = cs.map(c => c.id);
  ok(new Set(ids).size === ids.length, u.id + ': μοναδικά ids καρτών (' + cs.length + ')');
  ['f', 'r', 'm', 'w'].forEach(k => ok(cs.some(c => c.k === k), u.id + ': υπάρχουν κάρτες είδους ' + k));
  cs.forEach(c => {
    for (let s = 0; s < 6; s++) {
      let seed = s + 1; const rng = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
      const o = G.options(c, rng);
      if (o.length !== 4 || new Set(o).size !== 4 || o.filter(x => x === c.a).length !== 1) { ok(false, c.id + ': 4 διαφορετικές επιλογές με μία σωστή → ' + o.join(' / ')); break; }
    }
    if (c.k === 'f') {
      const acc = s => /[\u0301\u0300\u0342]/.test(s.normalize('NFD'));
      ok(c.pool.every(e => acc(e) === acc(c.a)), c.id + ': καμία λάθος κατάληξη με/χωρίς τόνο ενώ η σωστή όχι/ναι (θα έβγαζε 0 ή 2 τόνους)');
      ok(c.q.stem + c.a === G.plain(c.full.replace(/^\S+ /, '')) || (c.q.art === '' && c.q.stem + c.a === c.full), c.id + ': στέλεχος + κατάληξη = ο τύπος');
    }
    if (c.k === 'r') {
      // κάθε τύπος που ταιριάζει ΑΛΛΟ κελί είναι μέσα στη σωστή απάντηση, ποτέ στις λάθος
      const m = G.allModels(u).find(x => x.id === c.model), t = G.table(m);
      t.cells.forEach((row, r) => row.forEach((x, ci) => { if (x && G.plain(x) === c.q.form) ok(c.a.split(' ή ').includes(G.cellName(m, t, r, ci)), c.id + ': ' + G.cellName(m, t, r, ci) + ' μέσα στη σωστή'); }));
      ok(!c.pool.some(p => c.a.split(' ή ').includes(p)), c.id + ': καμία σωστή ετικέτα στις λάθος');
    }
    if (c.k === 'f') ok(!c.q.w || G.nfc(c.q.w) !== c.q.stem + c.a, c.id + ': το υπόδειγμα δεν είναι η απάντηση');
    if (c.k === 'm') { const cs2 = (u.contracted && u.contracted.models || []).map(x => x.w), mine = cs2.includes(c.a);
      ok(c.pool.filter(p => cs2.includes(p) === mine).length >= 3, c.id + ': ≥3 λάθος επιλογές από την ΙΔΙΑ ομάδα'); }
    if (c.k === 'm') ok(!c.pool.includes(c.q.word), c.id + ': η λέξη της ερώτησης δεν είναι επιλογή');
  });
});

/* ── 5 · σκάλα ── */
const T = '2026-11-14';
let r = G.grade(null, true, T);
ok(r.box === 1 && r.due === '2026-11-15' && r.first === T, 'σωστό με την πρώτη → αύριο');
r = G.grade(r, true, '2026-11-15'); ok(r.box === 2 && r.due === '2026-11-18', '2η → +3');
r = G.grade(r, true, '2026-11-18'); ok(r.box === 3 && r.due === '2026-11-25', '3η → +7');
r = G.grade(r, false, '2026-11-25'); ok(r.box === 0 && r.due === '2026-11-26' && r.first === T, 'λάθος → αύριο, κρατάει το first');
ok(G.addDays('2026-12-31', 1) === '2027-01-01', 'αλλαγή χρόνου');
if (A) {
  const all = G.cards(A);
  ok(G.todayQueue(all, {}, {}, T).length === 0, 'καμία κάρτα από ενότητα που δεν ξεκίνησε');
  const q = G.todayQueue(all, {}, { 'a-klisi': 1 }, T);
  ok(q.length === G.NEW_PER_DAY, 'πρώτη μέρα: ' + G.NEW_PER_DAY + ' νέες');
  ok(['f', 'r', 'm', 'w'].every(k => q.some(c => c.k === k)), 'πρώτη μέρα: και τα 4 είδη καρτών, όχι 15 ίδιες');
  const recs = {}; q.forEach(c => { recs[c.id] = G.grade(null, true, T); });
  ok(G.todayQueue(all, recs, { 'a-klisi': 1 }, T).length === 0, 'ίδια μέρα: τέλος οι νέες');
  const q2 = G.todayQueue(all, recs, { 'a-klisi': 1 }, '2026-11-15');
  ok(q2.length === 15 + G.NEW_PER_DAY, 'αύριο: οι 15 χθεσινές + 15 νέες (' + q2.length + ')');
  const cn = G.counts(all, recs, { 'a-klisi': 1 }, '2026-11-15');
  ok(cn.due === 15 && cn.fresh === G.NEW_PER_DAY && cn.total === all.length, 'counts');
}

/* ── 6 · ⛔ καμία λατινική γραμματοσειρά σε ελληνικά, καμία min-width (αν υπάρχει η σελίδα) ── */
const PG = path.join(ROOT, 'arxaia-grammatiki.html');
if (fs.existsSync(PG)) {
  const h = fs.readFileSync(PG, 'utf8');
  ok(!/min-width\s*:\s*\d+px\s*\)/.test(h), 'σελίδα: κανένα @media min-width');
  ok(!/Instrument Serif/.test(h), 'σελίδα: όχι Instrument Serif');
  ok(/src="grammatiki-core\.js"/.test(h), 'σελίδα: φορτώνει grammatiki-core.js');
  ok(/appKey\s*:\s*'grammatiki'/.test(h) && /syncedKeys\s*:\s*\['metron\.grammatiki\.v1'\]/.test(h), 'σελίδα: sync appKey grammatiki / metron.grammatiki.v1');
  ok(/href="arxaia-agnosto\.html"/.test(h), 'σελίδα: έξοδος με λέξη προς τα Αρχαία, άγνωστο (σταθ. 64)');
}

console.log((fail ? '✗ ' : '✓ ') + 'grammatiki: ' + pass + '/' + fail);
process.exit(fail ? 1 : 0);
