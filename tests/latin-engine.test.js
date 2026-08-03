/* latin-engine.test.js — the ground truth for latinika.html (als-v449).
 *
 * Every paradigm below was written out BY HAND and checked form by form. They
 * are not generated, and they must never be regenerated from the engine — the
 * whole point is that they are an independent second opinion. If the engine
 * and this file ever disagree, the engine is wrong until proven otherwise.
 *
 * The last section is the rule that keeps the promise honest: a pattern may
 * only appear in LatinEngine.VERIFIED if it has a full table here. Add a
 * pattern without its table and this suite fails, so nothing untested can ever
 * reach a question Alex is graded on.
 */
'use strict';
const ALS = '/Users/alexstathatos/ALS DASHBOARD ALL FILES/als';
const L = require(ALS + '/latin-engine.js');

let pass = 0, fail = 0;
function is(name, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  console.log((ok ? '  ✓ ' : '  ✗ FAIL ') + name + (ok ? '' : `\n      got  ${JSON.stringify(got)}\n      want ${JSON.stringify(want)}`));
}
function ok(name, cond) { is(name, !!cond, true); }
function section(s) { console.log('\n' + s); }

const C = L.CASES; // nom gen dat acc voc abl

/* ══════════════════════════════════════════════════════════════════
   1 · ΟΥΣΙΑΣΤΙΚΑ — hand-written paradigms, one specimen per pattern
   ══════════════════════════════════════════════════════════════════ */
const NOUN_TRUTH = {
  n1: {
    word: { kind: 'noun', pat: 'n1', lemma: 'fuga', gen: 'fugae', gender: 'f' },
    sg: ['fuga', 'fugae', 'fugae', 'fugam', 'fuga', 'fuga'],
    pl: ['fugae', 'fugarum', 'fugis', 'fugas', 'fugae', 'fugis']
  },
  n2m: {
    word: { kind: 'noun', pat: 'n2m', lemma: 'numerus', gen: 'numeri', gender: 'm' },
    sg: ['numerus', 'numeri', 'numero', 'numerum', 'numere', 'numero'],
    pl: ['numeri', 'numerorum', 'numeris', 'numeros', 'numeri', 'numeris']
  },
  n2er: {
    word: { kind: 'noun', pat: 'n2er', lemma: 'puer', gen: 'pueri', gender: 'm' },
    sg: ['puer', 'pueri', 'puero', 'puerum', 'puer', 'puero'],
    pl: ['pueri', 'puerorum', 'pueris', 'pueros', 'pueri', 'pueris']
  },
  n2n: {
    word: { kind: 'noun', pat: 'n2n', lemma: 'signum', gen: 'signi', gender: 'n' },
    sg: ['signum', 'signi', 'signo', 'signum', 'signum', 'signo'],
    pl: ['signa', 'signorum', 'signis', 'signa', 'signa', 'signis']
  },
  n3mf: {
    word: { kind: 'noun', pat: 'n3mf', lemma: 'consul', gen: 'consulis', gender: 'm' },
    sg: ['consul', 'consulis', 'consuli', 'consulem', 'consul', 'consule'],
    pl: ['consules', 'consulum', 'consulibus', 'consules', 'consules', 'consulibus']
  },
  n3mfi: {
    word: { kind: 'noun', pat: 'n3mfi', lemma: 'hostis', gen: 'hostis', gender: 'm' },
    sg: ['hostis', 'hostis', 'hosti', 'hostem', 'hostis', 'hoste'],
    pl: ['hostes', 'hostium', 'hostibus', 'hostes', 'hostes', 'hostibus']
  },
  n3n: {
    word: { kind: 'noun', pat: 'n3n', lemma: 'corpus', gen: 'corporis', gender: 'n' },
    sg: ['corpus', 'corporis', 'corpori', 'corpus', 'corpus', 'corpore'],
    pl: ['corpora', 'corporum', 'corporibus', 'corpora', 'corpora', 'corporibus']
  },
  n3ni: {
    word: { kind: 'noun', pat: 'n3ni', lemma: 'mare', gen: 'maris', gender: 'n' },
    sg: ['mare', 'maris', 'mari', 'mare', 'mare', 'mari'],
    pl: ['maria', 'marium', 'maribus', 'maria', 'maria', 'maribus']
  },
  n4m: {
    word: { kind: 'noun', pat: 'n4m', lemma: 'equitatus', gen: 'equitatus', gender: 'm' },
    sg: ['equitatus', 'equitatus', 'equitatui', 'equitatum', 'equitatus', 'equitatu'],
    pl: ['equitatus', 'equitatuum', 'equitatibus', 'equitatus', 'equitatus', 'equitatibus']
  },
  n4n: {
    word: { kind: 'noun', pat: 'n4n', lemma: 'cornu', gen: 'cornus', gender: 'n' },
    sg: ['cornu', 'cornus', 'cornu', 'cornu', 'cornu', 'cornu'],
    pl: ['cornua', 'cornuum', 'cornibus', 'cornua', 'cornua', 'cornibus']
  },
  n5: {
    word: { kind: 'noun', pat: 'n5', lemma: 'dies', gen: 'diei', gender: 'm' },
    sg: ['dies', 'diei', 'diei', 'diem', 'dies', 'die'],
    pl: ['dies', 'dierum', 'diebus', 'dies', 'dies', 'diebus']
  }
};

section('ουσιαστικά — κάθε μοτίβο ενάντια σε χειρόγραφο παράδειγμα');
Object.keys(NOUN_TRUTH).forEach(pat => {
  const t = NOUN_TRUTH[pat], p = L.declineNoun(t.word);
  ok(pat + ' κλίνεται', !!p);
  if (!p) return;
  is(pat + ' ενικός', C.map(c => p.sg[c]), t.sg);
  is(pat + ' πληθυντικός', C.map(c => p.pl[c]), t.pl);
});

section('ουσιαστικά — οι εναλλακτικοί τύποι');
is('hostis: αιτ. πληθ. δέχεται και -is', L.declineNoun(NOUN_TRUTH.n3mfi.word).alt['pl.acc'], 'hostis');

/* ══════════════════════════════════════════════════════════════════
   2 · ΡΗΜΑΤΑ — hand-written, all six tenses, both voices
   ══════════════════════════════════════════════════════════════════ */
const VERB_TRUTH = {
  v1: {
    word: { kind: 'verb', pat: 'v1', lemma: 'nuntio', perf: 'nuntiavi', sup: 'nuntiatum', inf: 'nuntiare' },
    act: {
      pres: ['nuntio', 'nuntias', 'nuntiat', 'nuntiamus', 'nuntiatis', 'nuntiant'],
      impf: ['nuntiabam', 'nuntiabas', 'nuntiabat', 'nuntiabamus', 'nuntiabatis', 'nuntiabant'],
      fut:  ['nuntiabo', 'nuntiabis', 'nuntiabit', 'nuntiabimus', 'nuntiabitis', 'nuntiabunt'],
      perf: ['nuntiavi', 'nuntiavisti', 'nuntiavit', 'nuntiavimus', 'nuntiavistis', 'nuntiaverunt'],
      plup: ['nuntiaveram', 'nuntiaveras', 'nuntiaverat', 'nuntiaveramus', 'nuntiaveratis', 'nuntiaverant'],
      futp: ['nuntiavero', 'nuntiaveris', 'nuntiaverit', 'nuntiaverimus', 'nuntiaveritis', 'nuntiaverint']
    },
    pass: {
      pres: ['nuntior', 'nuntiaris', 'nuntiatur', 'nuntiamur', 'nuntiamini', 'nuntiantur'],
      impf: ['nuntiabar', 'nuntiabaris', 'nuntiabatur', 'nuntiabamur', 'nuntiabamini', 'nuntiabantur'],
      fut:  ['nuntiabor', 'nuntiaberis', 'nuntiabitur', 'nuntiabimur', 'nuntiabimini', 'nuntiabuntur']
    },
    participle: 'nuntiatus, -a, -um'
  },
  v2: {
    word: { kind: 'verb', pat: 'v2', lemma: 'iubeo', perf: 'iussi', sup: 'iussum', inf: 'iubere' },
    act: {
      pres: ['iubeo', 'iubes', 'iubet', 'iubemus', 'iubetis', 'iubent'],
      impf: ['iubebam', 'iubebas', 'iubebat', 'iubebamus', 'iubebatis', 'iubebant'],
      fut:  ['iubebo', 'iubebis', 'iubebit', 'iubebimus', 'iubebitis', 'iubebunt'],
      perf: ['iussi', 'iussisti', 'iussit', 'iussimus', 'iussistis', 'iusserunt'],
      plup: ['iusseram', 'iusseras', 'iusserat', 'iusseramus', 'iusseratis', 'iusserant'],
      futp: ['iussero', 'iusseris', 'iusserit', 'iusserimus', 'iusseritis', 'iusserint']
    },
    pass: {
      pres: ['iubeor', 'iuberis', 'iubetur', 'iubemur', 'iubemini', 'iubentur'],
      impf: ['iubebar', 'iubebaris', 'iubebatur', 'iubebamur', 'iubebamini', 'iubebantur'],
      fut:  ['iubebor', 'iubeberis', 'iubebitur', 'iubebimur', 'iubebimini', 'iubebuntur']
    },
    participle: 'iussus, -a, -um'
  },
  v3: {
    word: { kind: 'verb', pat: 'v3', lemma: 'lego', perf: 'legi', sup: 'lectum', inf: 'legere' },
    act: {
      pres: ['lego', 'legis', 'legit', 'legimus', 'legitis', 'legunt'],
      impf: ['legebam', 'legebas', 'legebat', 'legebamus', 'legebatis', 'legebant'],
      fut:  ['legam', 'leges', 'leget', 'legemus', 'legetis', 'legent'],
      perf: ['legi', 'legisti', 'legit', 'legimus', 'legistis', 'legerunt'],
      plup: ['legeram', 'legeras', 'legerat', 'legeramus', 'legeratis', 'legerant'],
      futp: ['legero', 'legeris', 'legerit', 'legerimus', 'legeritis', 'legerint']
    },
    pass: {
      pres: ['legor', 'legeris', 'legitur', 'legimur', 'legimini', 'leguntur'],
      impf: ['legebar', 'legebaris', 'legebatur', 'legebamur', 'legebamini', 'legebantur'],
      fut:  ['legar', 'legeris', 'legetur', 'legemur', 'legemini', 'legentur']
    },
    participle: 'lectus, -a, -um'
  },
  v3io: {
    word: { kind: 'verb', pat: 'v3io', lemma: 'capio', perf: 'cepi', sup: 'captum', inf: 'capere' },
    act: {
      pres: ['capio', 'capis', 'capit', 'capimus', 'capitis', 'capiunt'],
      impf: ['capiebam', 'capiebas', 'capiebat', 'capiebamus', 'capiebatis', 'capiebant'],
      fut:  ['capiam', 'capies', 'capiet', 'capiemus', 'capietis', 'capient'],
      perf: ['cepi', 'cepisti', 'cepit', 'cepimus', 'cepistis', 'ceperunt'],
      plup: ['ceperam', 'ceperas', 'ceperat', 'ceperamus', 'ceperatis', 'ceperant'],
      futp: ['cepero', 'ceperis', 'ceperit', 'ceperimus', 'ceperitis', 'ceperint']
    },
    pass: {
      pres: ['capior', 'caperis', 'capitur', 'capimur', 'capimini', 'capiuntur'],
      impf: ['capiebar', 'capiebaris', 'capiebatur', 'capiebamur', 'capiebamini', 'capiebantur'],
      fut:  ['capiar', 'capieris', 'capietur', 'capiemur', 'capiemini', 'capientur']
    },
    participle: 'captus, -a, -um'
  },
  v4: {
    word: { kind: 'verb', pat: 'v4', lemma: 'audio', perf: 'audivi', sup: 'auditum', inf: 'audire' },
    act: {
      pres: ['audio', 'audis', 'audit', 'audimus', 'auditis', 'audiunt'],
      impf: ['audiebam', 'audiebas', 'audiebat', 'audiebamus', 'audiebatis', 'audiebant'],
      fut:  ['audiam', 'audies', 'audiet', 'audiemus', 'audietis', 'audient'],
      perf: ['audivi', 'audivisti', 'audivit', 'audivimus', 'audivistis', 'audiverunt'],
      plup: ['audiveram', 'audiveras', 'audiverat', 'audiveramus', 'audiveratis', 'audiverant'],
      futp: ['audivero', 'audiveris', 'audiverit', 'audiverimus', 'audiveritis', 'audiverint']
    },
    pass: {
      pres: ['audior', 'audiris', 'auditur', 'audimur', 'audimini', 'audiuntur'],
      impf: ['audiebar', 'audiebaris', 'audiebatur', 'audiebamur', 'audiebamini', 'audiebantur'],
      fut:  ['audiar', 'audieris', 'audietur', 'audiemur', 'audiemini', 'audientur']
    },
    participle: 'auditus, -a, -um'
  }
};

section('ρήματα — ενεργητική οριστική, και οι έξι χρόνοι');
Object.keys(VERB_TRUTH).forEach(pat => {
  const t = VERB_TRUTH[pat], c = L.conjugate(t.word);
  ok(pat + ' κλίνεται', !!c);
  if (!c) return;
  Object.keys(t.act).forEach(tense => is(pat + ' ' + L.TENSE_SHORT[tense], c.act[tense], t.act[tense]));
});

section('ρήματα — παθητική, απλοί χρόνοι');
Object.keys(VERB_TRUTH).forEach(pat => {
  const t = VERB_TRUTH[pat], c = L.conjugate(t.word);
  if (!c) return;
  Object.keys(t.pass).forEach(tense => is(pat + ' ' + L.TENSE_SHORT[tense] + ' παθ.', c.pass[tense], t.pass[tense]));
});

section('ρήματα — παθητικοί συντελικοί (μετοχή + sum)');
Object.keys(VERB_TRUTH).forEach(pat => {
  const t = VERB_TRUTH[pat], c = L.conjugate(t.word);
  if (!c) return;
  is(pat + ' μετοχή παθ. παρακειμένου', c.participle, t.participle);
  const stem = t.participle.replace(/us, -a, -um$/, '');
  is(pat + ' ΠΡΚ παθ. α΄ εν.', c.pass.perf[0], stem + 'us, -a, -um sum');
  is(pat + ' ΠΡΚ παθ. α΄ πλ.', c.pass.perf[3], stem + 'i, -ae, -a sumus');
  is(pat + ' ΥΠΡ παθ. γ΄ εν.', c.pass.plup[2], stem + 'us, -a, -um erat');
  is(pat + ' ΣΜΛ παθ. γ΄ πλ.', c.pass.futp[5], stem + 'i, -ae, -a erunt');
});

section('ρήματα — ο εναλλακτικός παρακείμενος σε -ere');
is('nuntio', L.conjugate(VERB_TRUTH.v1.word).altPerf3pl, 'nuntiavere');
is('iubeo', L.conjugate(VERB_TRUTH.v2.word).altPerf3pl, 'iussere');

/* ══════════════════════════════════════════════════════════════════
   3 · ΤΑ ΚΛΕΙΔΩΜΑΤΑ ΑΣΦΑΛΕΙΑΣ
   These are the assertions that stop the page marking a right answer wrong.
   ══════════════════════════════════════════════════════════════════ */
section('ασφάλεια — αμφίσημοι τύποι δεν γίνονται ποτέ ερώτηση αναγνώρισης');
{
  const p = L.declineNoun(NOUN_TRUTH.n1.word);
  const uniq = L.uniqueForms(p).map(s => s.form);
  ok('fugae ΔΕΝ ρωτιέται (γεν.εν = δοτ.εν = ονομ.πλ = κλητ.πλ)', uniq.indexOf('fugae') < 0);
  ok('fuga ΔΕΝ ρωτιέται (ονομ. = κλητ. = αφαιρ.)', uniq.indexOf('fuga') < 0);
  ok('fugam ρωτιέται — είναι μοναδικό', uniq.indexOf('fugam') >= 0);
  ok('fugarum ρωτιέται — είναι μοναδικό', uniq.indexOf('fugarum') >= 0);
}
{
  /* lego is the hard case: legit is present AND perfect, legeris is passive
     present, passive future and active future-perfect all at once. */
  const c = L.conjugate(VERB_TRUTH.v3.word);
  const uniq = L.uniqueVerbForms(c).map(s => s.form);
  ok('legit ΔΕΝ ρωτιέται (ΕΝΣ γ΄εν = ΠΡΚ γ΄εν)', uniq.indexOf('legit') < 0);
  ok('legimus ΔΕΝ ρωτιέται (ΕΝΣ α΄πλ = ΠΡΚ α΄πλ)', uniq.indexOf('legimus') < 0);
  ok('legeris ΔΕΝ ρωτιέται (τρεις διαφορετικές θέσεις)', uniq.indexOf('legeris') < 0);
  ok('legebamus ρωτιέται — είναι μοναδικό', uniq.indexOf('legebamus') >= 0);
}

section('ασφάλεια — οι λάθος επιλογές δεν κρύβουν ποτέ τη σωστή');
{
  const p = L.declineNoun(NOUN_TRUTH.n3mfi.word);
  for (let i = 0; i < 200; i++) {
    const d = L.distractors(L.nounPool(p), 'hostium', 3);
    if (d.indexOf('hostium') >= 0) { fail++; console.log('  ✗ FAIL η σωστή απάντηση εμφανίστηκε ως λάθος επιλογή'); break; }
    if (new Set(d).size !== d.length) { fail++; console.log('  ✗ FAIL διπλή επιλογή'); break; }
    if (i === 199) { pass++; console.log('  ✓ 200 κληρώσεις: ποτέ η απάντηση, ποτέ διπλότυπο'); }
  }
  const d2 = L.distractors(L.nounPool(p), 'hostium', 3);
  ok('όλες οι λάθος επιλογές είναι τύποι της ΙΔΙΑΣ λέξης', d2.every(x => L.nounPool(p).indexOf(x) >= 0));
}

section('ασφάλεια — τι επιτρέπεται να μπει σε άσκηση');
ok('άγνωστο μοτίβο απορρίπτεται', !L.drillable({ kind: 'noun', pat: 'n9', lemma: 'x', gen: 'xis' }));
ok('λέξη χωρίς γενική απορρίπτεται', !L.drillable({ kind: 'noun', pat: 'n1', lemma: 'fuga' }));
ok('ρήμα χωρίς παρακείμενο απορρίπτεται', !L.drillable({ kind: 'verb', pat: 'v1', lemma: 'x', inf: 'xare' }));
ok('πλήρης λέξη γίνεται δεκτή', L.drillable(NOUN_TRUTH.n3mfi.word));
ok('πλήρες ρήμα γίνεται δεκτό', L.drillable(VERB_TRUTH.v2.word));

section('ασφάλεια — τα ανώμαλα δεν παράγονται ποτέ');
is('sum · ενεστώτας', L.IRREGULAR.sum.act.pres, ['sum', 'es', 'est', 'sumus', 'estis', 'sunt']);
is('sum · μέλλοντας', L.IRREGULAR.sum.act.fut, ['ero', 'eris', 'erit', 'erimus', 'eritis', 'erunt']);
is('possum · ενεστώτας', L.IRREGULAR.possum.act.pres, ['possum', 'potes', 'potest', 'possumus', 'potestis', 'possunt']);
ok('κανένα ανώμαλο δεν έχει μοτίβο παραγωγής', Object.keys(L.IRREGULAR).every(k => !L.VERB_PATTERNS[L.IRREGULAR[k].pat]));

section('βαθμολόγηση');
ok('δέχεται κεφαλαία', L.isCorrect('HOSTIUM', 'hostium'));
ok('δέχεται κενά στις άκρες', L.isCorrect('  hostium ', 'hostium'));
ok('δέχεται τον εναλλακτικό -ere', L.isCorrect('iussere', 'iusserunt', 'iussere'));
ok('κόβει το παραπλήσιο λάθος', !L.isCorrect('hostum', 'hostium'));
ok('κόβει το κενό', !L.isCorrect('', 'hostium'));

/* ══════════════════════════════════════════════════════════════════
   4 · Ο ΚΑΝΟΝΑΣ — τίποτα δεν εξετάζεται χωρίς πίνακα εδώ
   ══════════════════════════════════════════════════════════════════ */
section('ο κανόνας: VERIFIED == όσα έχουν χειρόγραφο πίνακα σε αυτό το αρχείο');
{
  const tabled = Object.keys(NOUN_TRUTH).concat(Object.keys(VERB_TRUTH)).sort();
  const claimed = Object.keys(L.VERIFIED).sort();
  is('τα δύο σύνολα ταυτίζονται', claimed, tabled);
}
{
  const allPats = Object.keys(L.NOUN_PATTERNS).concat(Object.keys(L.VERB_PATTERNS));
  const missing = allPats.filter(p => !L.VERIFIED[p]);
  is('κανένα μοτίβο της μηχανής δεν μένει χωρίς έλεγχο', missing, []);
}

console.log('\n' + (fail === 0 ? `LATIN_OK — ${pass}/${pass} έλεγχοι πέρασαν` : `LATIN_FAIL — ${fail} από ${pass + fail} απέτυχαν`));
process.exit(fail === 0 ? 0 : 1);
