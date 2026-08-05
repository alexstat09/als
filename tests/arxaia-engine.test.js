/* arxaia-engine.test.js — η εγγύηση της σελίδας arxaia.html (als-v454).
 *
 * ΓΙΑΤΙ Η ΕΓΓΥΗΣΗ ΕΔΩ ΕΙΝΑΙ ΔΙΑΦΟΡΕΤΙΚΗ ΑΠ' ΤΑ ΛΑΤΙΝΙΚΑ
 * Στα Λατινικά ο κίνδυνος είναι μια ΓΕΝΝΗΤΡΙΑ που παράγει λάθος τύπο, οπότε ο
 * χειρόγραφος πίνακας είναι δεύτερη γνώμη απέναντι στη μηχανή. Εδώ δεν υπάρχει
 * γεννήτρια — ο κίνδυνος είναι ότι ΕΓΩ πληκτρολόγησα λάθος έναν τόνο ή έχασα
 * μια αύξηση στην 40ή γραμμή, και ένα λάθος στο ἤγγειλα διδάσκεται σαν αλήθεια
 * κάθε μέρα μέχρι τις Πανελλήνιες.
 *
 * Άρα η δεύτερη γνώμη είναι ΔΕΥΤΕΡΗ ΜΕΤΑΓΡΑΦΗ. Το ΤΡUΤΗ παρακάτω γράφτηκε
 * ξανά από την ίδια φωτογραφία, από την αρχή, και συγκρίνεται τύπο-τύπο με το
 * arxaia-data.js. Δύο ανεξάρτητα περάσματα πρέπει να συμφωνήσουν απόλυτα.
 * ⛔ ΜΗΝ το παραγάγεις ποτέ από το arxaia-data.js — τότε χάνει κάθε αξία.
 *
 * Από πάνω τρέχουν οι μηχανικοί έλεγχοι (κατάληξη ανά χρόνο, αύξηση στους
 * ιστορικούς, πνεύμα σε κάθε αρχικό φωνήεν, τόνος παντού), που πιάνουν και
 * λάθη που θα έκανα ΚΑΙ στις δύο μεταγραφές.
 */
'use strict';
const ALS = '/Users/alexstathatos/ALS DASHBOARD ALL FILES/als';
const D = require(ALS + '/arxaia-data.js');
const E = require(ALS + '/arxaia-engine.js');

let pass = 0, fail = 0;
function is(name, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  console.log((ok ? '  ✓ ' : '  ✗ FAIL ') + name + (ok ? '' : `\n      got  ${JSON.stringify(got)}\n      want ${JSON.stringify(want)}`));
}
function ok(name, cond) { is(name, !!cond, true); }
function section(s) { console.log('\n' + s); }

/* Ντετερμινιστικό «τυχαίο», για να ελέγχονται οι επιλογές μιας ερώτησης. */
function seeded(s) { return function () { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; }; }

const V = {};
D.VERBS.forEach(v => { V[v.id] = v; });

/* ══════════════════════════════════════════════════════════════════
   1 · Η ΔΕΥΤΕΡΗ ΜΕΤΑΓΡΑΦΗ
   ΦΡΟΝΤΙΣΤΗΡΙΟ ΠΥΘΑΓΟΡΑΣ — «Αρχικοί χρόνοι βασικών ρημάτων της αρχαίας
   ελληνικής», σελίδα 1. Γραμμένη ξανά κοιτώντας τη φωτογραφία, όχι το data.
   Σειρά στηλών: ΕΝΣ · ΠΡΤ · ΜΕΛ · ΑΟΡ · ΠΡΚ · ΥΠΡ. null = άδειο κελί.
   ══════════════════════════════════════════════════════════════════ */
const TRUTH = {
  agamai: {
    lemma: 'ἄγαμαι',
    act: null,
    mp: {
      ens: ['ἄγαμαι'],
      prt: ['ἠγάμην'],
      mel: ['ἀγάσομαι', 'ἀγασθήσομαι'],
      aor: ['ἠγασάμην', 'ἠγάσθην'],
      prk: null,
      ypr: null
    }
  },
  aggello: {
    lemma: 'ἀγγέλλω',
    act: {
      ens: ['ἀγγέλλω'],
      prt: ['ἤγγελλον'],
      mel: ['ἀγγελῶ'],
      aor: ['ἤγγειλα'],
      prk: ['ἤγγελκα'],
      ypr: ['ἠγγέλκειν']
    },
    mp: {
      ens: ['ἀγγέλλομαι'],
      prt: ['ἠγγελλόμην'],
      mel: ['ἀγγελοῦμαι', 'ἀγγελθήσομαι'],
      aor: ['ἠγγειλάμην', 'ἠγγέλθην'],
      prk: ['ἤγγελμαι'],
      ypr: ['ἠγγέλμην']
    }
  },
  agoreuo: {
    lemma: 'ἀγορεύω',
    act: {
      ens: ['ἀγορεύω'],
      prt: ['ἠγόρευον'],
      mel: ['ἀγορεύσω'],
      aor: ['ἠγόρευσα'],
      prk: ['ἠγόρευκα'],
      ypr: ['ἠγορεύκειν']
    },
    mp: {
      ens: ['ἀγορεύομαι'],
      prt: ['ἠγορευόμην'],
      mel: ['ἀγορεύσομαι', 'ἀγορευθήσομαι', 'ῥηθήσομαι'],
      aor: ['ἠγορευσάμην', 'ἠγορεύθην', 'ἐρρήθην'],
      prk: ['εἴρημαι'],
      ypr: ['εἰρήμην']
    }
  },
  apagoreuo: {
    lemma: 'ἀπαγορεύω',
    act: {
      ens: ['ἀπαγορεύω'],
      prt: ['ἀπηγόρευον'],
      mel: ['ἀπερῶ'],
      aor: ['ἀπηγόρευσα', 'ἀπεῖπον'],
      prk: ['ἀπείρηκα', 'ἀπηγόρευκα'],
      ypr: ['ἀπειρήκειν', 'ἀπηγορεύκειν']
    },
    mp: {
      ens: ['ἀπαγορεύομαι'],
      prt: ['ἀπηγορευόμην'],           /* τυπωμένο σε παρένθεση στο φυλλάδιο */
      mel: ['ἀπορρηθήσομαι'],
      aor: ['ἀπερρήθην'],
      prk: ['ἀπείρημαι'],
      ypr: ['ἀπειρήμην']
    }
  },
  ago: {
    lemma: 'ἄγω',
    act: {
      ens: ['ἄγω'],
      prt: ['ἦγον'],
      mel: ['ἄξω'],
      aor: ['ἦξα', 'ἤγαγον'],
      prk: ['ἦχα', 'ἀγήοχα'],
      ypr: ['ἤχειν', 'ἀγηόχειν', 'ἠγηόχειν']
    },
    mp: {
      ens: ['ἄγομαι'],
      prt: ['ἠγόμην'],
      mel: ['ἄξομαι', 'ἀχθήσομαι'],
      aor: ['ἠγαγόμην', 'ἤχθην'],
      prk: ['ἦγμαι'],
      ypr: ['ἤγμην']
    }
  },
  aideomai: {
    lemma: 'αἰδέομαι – αἰδοῦμαι',
    act: null,
    mp: {
      ens: ['αἰδέομαι', 'αἰδοῦμαι'],
      prt: ['ᾐδούμην'],
      mel: ['αἰδέσομαι', 'αἰδεσθήσομαι'],
      aor: ['ᾐδεσάμην', 'ᾐδέσθην'],
      prk: ['ᾔδεσμαι'],
      ypr: ['ᾐδέσμην']
    }
  }
};

section('1 · Η ΔΕΥΤΕΡΗ ΜΕΤΑΓΡΑΦΗ — τύπος προς τύπο');
is('ο αριθμός των ρημάτων συμφωνεί', D.VERBS.length, Object.keys(TRUTH).length);
Object.keys(TRUTH).forEach(id => {
  const t = TRUTH[id], v = V[id];
  if (!v) { is('υπάρχει το ρήμα ' + id, false, true); return; }
  is(id + ' · lemma', v.lemma, t.lemma);
  D.VOICES.forEach(voice => {
    if (t[voice] === null) { is(id + ' · ' + voice + ' δεν υπάρχει', v[voice], null); return; }
    if (!v[voice]) { is(id + ' · υπάρχει η φωνή ' + voice, false, true); return; }
    D.TENSES.forEach(tense => {
      const want = t[voice][tense];
      const got = v[voice][tense] === undefined ? null : v[voice][tense];
      is(id + ' · ' + voice + '.' + tense, got, want);
    });
  });
});

/* Κανένα κελί στη ΜΗΧΑΝΗ που να μην υπάρχει στη ΔΕΥΤΕΡΗ μεταγραφή, ώστε ένα
   κελί που πρόσθεσα μόνο στο data να μη γλιστρήσει ανέλεγκτο. */
section('   κανένα ανέλεγκτο κελί');
D.VERBS.forEach(v => {
  E.cellsOf(v).forEach(c => {
    const t = TRUTH[v.id] && TRUTH[v.id][c.voice] && TRUTH[v.id][c.voice][c.tense];
    ok('το ' + c.id + ' υπάρχει και στη δεύτερη μεταγραφή', Array.isArray(t) && t.length > 0);
  });
});

/* ══════════════════════════════════════════════════════════════════
   2 · Ο ΜΗΧΑΝΙΚΟΣ ΕΛΕΓΧΟΣ — ολόκληρη η ύλη περνάει καθαρή
   ══════════════════════════════════════════════════════════════════ */
section('2 · AUDIT — η ύλη περνάει καθαρή');
const problems = E.auditAll(D.VERBS);
if (problems.length) problems.forEach(p => console.log('      ! ' + p));
is('μηδέν προβλήματα σε όλη την ύλη', problems, []);

/* ══════════════════════════════════════════════════════════════════
   3 · ΟΤΙ Ο ΕΛΕΓΧΟΣ ΠΡΑΓΜΑΤΙΚΑ ΠΙΑΝΕΙ ΛΑΘΗ
   Ένας έλεγχος που περνάει τα πάντα δεν είναι έλεγχος. Κάθε περίπτωση εδώ
   είναι ένα λάθος που θα μπορούσα ρεαλιστικά να κάνω μεταγράφοντας.
   ══════════════════════════════════════════════════════════════════ */
section('3 · Ο ΕΛΕΓΧΟΣ ΠΙΑΝΕΙ ΛΑΘΗ');
const dummy = { lemma: 'δοκιμή' };
function bad(voice, tense, form) { return E.auditForm(dummy, voice, tense, form).length > 0; }
function good(voice, tense, form) { return E.auditForm(dummy, voice, tense, form).length === 0; }

ok('μονοτονικό «ήγγειλα» → πιάνεται (λείπει πνεύμα)', bad('act', 'aor', 'ήγγειλα'));
ok('πολυτονικό «ἤγγειλα» → καθαρό', good('act', 'aor', 'ἤγγειλα'));
ok('άτονο «αγγελλω» → πιάνεται', bad('act', 'ens', 'αγγελλω'));
ok('λατινικό γράμμα μέσα στη λέξη → πιάνεται', bad('act', 'ens', 'ἀγγέλλo'));
ok('παρακείμενος μέσης σε -θην → πιάνεται (θέλει -μαι)', bad('mp', 'prk', 'ἠγγέλθην'));
ok('υπερσυντέλικος μέσης σε -μαι → πιάνεται (θέλει -μην)', bad('mp', 'ypr', 'ἤγγελμαι'));
ok('μέλλοντας ενεργητικής σε -μαι → πιάνεται', bad('act', 'mel', 'ἀγγελοῦμαι'));
ok('αρχικό ρ χωρίς δασεία → πιάνεται', bad('mp', 'mel', 'ρηθήσομαι'));
ok('ῥηθήσομαι με δασεία → καθαρό', good('mp', 'mel', 'ῥηθήσομαι'));
ok('ενεστώτας μέσης σε -ω → πιάνεται', bad('mp', 'ens', 'ἀγγέλλω'));

section('   η αύξηση');
ok('ἤγγειλα έχει αύξηση', E.hasAugment('ἤγγειλα'));
ok('ἀγγέλλω δεν έχει', !E.hasAugment('ἀγγέλλω'));
ok('ᾐδέσθην έχει αύξηση (αι → ᾐ)', E.hasAugment('ᾐδέσθην'));
ok('αἰδέσομαι δεν έχει', !E.hasAugment('αἰδέσομαι'));
ok('ἀπηγόρευον έχει αύξηση μετά την πρόθεση', E.hasAugment('ἀπηγόρευον', 'ἀπ'));
ok('ἀπαγορεύω δεν έχει', !E.hasAugment('ἀπαγορεύω', 'ἀπ'));
ok('ἀγηόχειν όντως δεν έχει αύξηση', !E.hasAugment('ἀγηόχειν'));
ok('ἠγηόχειν έχει', E.hasAugment('ἠγηόχειν'));
/* ...γι' αυτό ο κανόνας είναι «τουλάχιστον ένας τύπος του κελιού»: */
is('το ΥΠΡ ενεργ. του ἄγω περνάει χάρη στο ἤχειν', E.audit(V.ago).length, 0);

/* Ρήμα με ξεχασμένη αύξηση σε ΟΛΟ το κελί → πρέπει να πέσει. */
const noAug = {
  id: 'x', lemma: 'δοκιμή', fam: 'evo',
  act: { ens: ['ἀγορεύω'], prt: ['ἀγόρευον'], mel: null, aor: null, prk: null, ypr: null }
};
ok('κελί ιστορικού χρόνου χωρίς καμία αύξηση → πιάνεται',
   E.audit(noAug).some(p => p.indexOf('αύξηση') >= 0));

/* ══════════════════════════════════════════════════════════════════
   4 · Η ΠΥΛΗ ΤΗΣ ΜΟΝΑΔΙΚΟΤΗΤΑΣ
   ══════════════════════════════════════════════════════════════════ */
section('4 · ΜΟΝΑΔΙΚΟΤΗΤΑ');
const uAgg = E.uniqueInVerb(V.aggello);
is('ἤγγειλα → μόνο αόριστος ενεργητικής', uAgg['ἤγγειλα'], 'aggello.act.aor');
is('ἤγγελμαι → μόνο παρακείμενος μέσης', uAgg['ἤγγελμαι'], 'aggello.mp.prk');

/* Κατασκευασμένο ρήμα όπου ο ίδιος τύπος στέκει σε δύο κελιά: δεν επιτρέπεται
   να ρωτηθεί ποτέ ανάποδα, γιατί δεν έχει ΜΙΑ σωστή απάντηση. */
const ambig = {
  id: 'amb', lemma: 'ἄμφω', fam: 'evo',
  act: { ens: ['ἀγορεύω'], prt: ['ἠγόρευον'], mel: ['ἀγορεύω'], aor: ['ἠγόρευσα'], prk: null, ypr: null }
};
is('διπλός τύπος → εκτός πύλης', E.uniqueInVerb(ambig)['ἀγορεύω'], undefined);
const ambigCell = E.cellsOf(ambig).filter(c => c.tense === 'mel')[0];
is('δεν χτίζεται ερώτηση αναγνώρισης πάνω σε διπλό τύπο', E.reverse(ambig, ambigCell, seeded(7)), null);

const uAll = E.uniqueGlobal(D.VERBS);
is('ἠγόρευκα → ἀγορεύω', uAll['ἠγόρευκα'], 'agoreuo');
is('ἀπείρηκα → ἀπαγορεύω', uAll['ἀπείρηκα'], 'apagoreuo');

/* ══════════════════════════════════════════════════════════════════
   5 · ΟΙ ΠΑΓΙΔΕΣ ΚΑΙ ΟΙ ΕΡΩΤΗΣΕΙΣ
   ══════════════════════════════════════════════════════════════════ */
section('5 · ΕΡΩΤΗΣΕΙΣ');
const aorAgg = E.cellsOf(V.aggello).filter(c => c.id === 'aggello.act.aor')[0];
const dis = E.distractors(V.aggello, aorAgg, 3, seeded(11));
is('τρεις παγίδες', dis.length, 3);
ok('καμία παγίδα δεν είναι σωστή απάντηση', dis.every(f => aorAgg.forms.indexOf(f) < 0));
ok('κάθε παγίδα είναι ΑΛΗΘΙΝΟΣ τύπος του ίδιου ρήματος', dis.every(f => {
  return E.cellsOf(V.aggello).some(c => c.forms.indexOf(f) >= 0);
}));
ok('οι παγίδες προτιμούν την ίδια φωνή', dis.filter(f => V.aggello.act && Object.keys(V.aggello.act).some(t => (V.aggello.act[t] || []).indexOf(f) >= 0)).length >= 2);

const qp = E.production(V.aggello, aorAgg, seeded(3));
is('παραγωγή · ερώτημα', qp.prompt, 'ἀγγέλλω');
is('παραγωγή · τι ζητάει', qp.ask, 'αόριστος ενεργητικής');
is('παραγωγή · τέσσερις επιλογές', qp.options.length, 4);
ok('παραγωγή · η σωστή είναι μέσα', qp.options.indexOf('ἤγγειλα') >= 0);
ok('παραγωγή · μία μόνο σωστή στις επιλογές',
   qp.options.filter(o => qp.answers.indexOf(o) >= 0).length === 1);
ok('βαθμολόγηση με το δάχτυλο: ἤγγειλα σωστό', E.correct(qp, 'ἤγγειλα', false));
ok('βαθμολόγηση με το δάχτυλο: ἤγγελκα λάθος', !E.correct(qp, 'ἤγγελκα', false));
ok('με το δάχτυλο ο τόνος ΜΕΤΡΑΕΙ: ήγγειλα λάθος', !E.correct(qp, 'ήγγειλα', false));
ok('πληκτρολογημένο: ήγγειλα δεκτό (το κινητό δεν βγάζει πολυτονικό)', E.correct(qp, 'ήγγειλα', true));
ok('πληκτρολογημένο: ηγγελκα πάλι λάθος', !E.correct(qp, 'ηγγελκα', true));

/* Κελί με δύο σωστούς τύπους: και οι δύο δεκτοί. */
const aorAgo = E.cellsOf(V.ago).filter(c => c.id === 'ago.act.aor')[0];
const qAgo = E.production(V.ago, aorAgo, seeded(5));
ok('ἦξα δεκτό', E.correct(qAgo, 'ἦξα', false));
ok('ἤγαγον εξίσου δεκτό', E.correct(qAgo, 'ἤγαγον', false));

/* ⭐ Ο,ΤΙ ΓΡΑΦΕΤΑΙ ΣΤΗΝ ΕΡΩΤΗΣΗ. Βρέθηκε κοιτάζοντας ένα render: το ερώτημα
   ήταν «αἰδέομαι – αἰδοῦμαι» και δύο από τις τέσσερις επιλογές ήταν ακριβώς
   αυτές οι δύο λέξεις — αποκλείονταν χωρίς καμία γνώση. */
section('   ό,τι γράφεται στην ερώτηση δεν ρωτιέται και δεν παγιδεύει');
const ensAid = E.cellsOf(V.aideomai).filter(c => c.id === 'aideomai.mp.ens')[0];
ok('το λήμμα «αἰδέομαι – αἰδοῦμαι» γράφει τον ενεστώτα του', E.givenAway(V.aideomai, ensAid));
is('...άρα ο ενεστώτας δεν ρωτιέται ως παραγωγή', E.production(V.aideomai, ensAid, seeded(2)), null);

const ensAgg = E.cellsOf(V.aggello).filter(c => c.id === 'aggello.act.ens')[0];
ok('το ἀγγέλλω γράφει κι αυτό τον ενεστώτα του', E.givenAway(V.aggello, ensAgg));
is('...άρα ούτε αυτός ρωτιέται («ἀγγέλλω → ενεστώτας;» δεν εξετάζει τίποτα)',
   E.production(V.aggello, ensAgg, seeded(2)), null);

const melAid = E.cellsOf(V.aideomai).filter(c => c.id === 'aideomai.mp.mel')[0];
const qAid = E.production(V.aideomai, melAid, seeded(4));
ok('ο μέλλοντας του αἰδέομαι ρωτιέται κανονικά', qAid !== null);
ok('...και καμία επιλογή δεν είναι λέξη του λήμματος',
   qAid.options.every(o => ['αἰδέομαι', 'αἰδοῦμαι', '–'].indexOf(o) < 0));

const aorAgo2 = E.cellsOf(V.ago).filter(c => c.id === 'ago.act.aor')[0];
ok('το ἄγω δεν μπαίνει ποτέ ως παγίδα στο ίδιο του το ρήμα',
   E.distractors(V.ago, aorAgo2, 4, seeded(6)).indexOf('ἄγω') < 0);

/* Ο ενεστώτας μέσης ΔΕΝ είναι στο λήμμα ενός ενεργητικού ρήματος, άρα ρωτιέται
   — ο κανόνας δεν είναι «ο ενεστώτας», είναι «ό,τι γράφεται στην ερώτηση». */
const ensAggMp = E.cellsOf(V.aggello).filter(c => c.id === 'aggello.mp.ens')[0];
ok('το ἀγγέλλομαι ΔΕΝ δίνεται από το λήμμα ἀγγέλλω', !E.givenAway(V.aggello, ensAggMp));
ok('...οπότε ρωτιέται κανονικά', E.production(V.aggello, ensAggMp, seeded(8)) !== null);

const qr = E.reverse(V.aggello, aorAgg, seeded(9));
is('αναγνώριση · δείχνει τον τύπο', qr.prompt, 'ἤγγειλα');
is('αναγνώριση · τέσσερις επιλογές', qr.options.length, 4);
ok('αναγνώριση · η σωστή είναι μέσα', qr.options.some(o => o.id === 'aggello.act.aor'));
ok('αναγνώριση · χωρίς διπλές επιλογές', new Set(qr.options.map(o => o.id)).size === qr.options.length);

const qw = E.whichVerb(D.VERBS, V.agoreuo, E.cellsOf(V.agoreuo).filter(c => c.id === 'agoreuo.act.prk')[0], seeded(13));
is('ποιο ρήμα · δείχνει τον τύπο', qw.prompt, 'ἠγόρευκα');
is('ποιο ρήμα · σωστή απάντηση', qw.answer, 'agoreuo');
is('ποιο ρήμα · τέσσερα λήμματα', qw.options.length, 4);
ok('ποιο ρήμα · χωρίς διπλά', new Set(qw.options.map(o => o.id)).size === 4);

/* Καμία ερώτηση δεν χτίζεται ποτέ πάνω σε κελί που το φυλλάδιο τυπώνει σε
   παρένθεση. Αν σπάσει αυτό, εξετάζεται σε τύπο που το ίδιο το φυλλάδιο
   θεωρεί αμφίβολο. */
section('   τα αμφίβολα κελιά δεν ρωτιούνται');
is('το ἀπαγορεύω έχει ένα noDrill', V.apagoreuo.noDrill, ['mp.prt']);
ok('το mp.prt του ἀπαγορεύω δεν είναι drillable',
   E.cellsOf(V.apagoreuo).filter(c => c.id === 'apagoreuo.mp.prt')[0].drillable === false);
ok('δεν μπαίνει στα drillCells', E.drillCells(D.VERBS).every(c => c.id !== 'apagoreuo.mp.prt'));
ok('αλλά ΦΑΙΝΕΤΑΙ στον πίνακα', E.cellsOf(V.apagoreuo).some(c => c.id === 'apagoreuo.mp.prt'));

/* ══════════════════════════════════════════════════════════════════
   6 · Η ΣΤΗΛΗ ΚΑΙ ΟΙ ΟΙΚΟΓΕΝΕΙΕΣ
   ══════════════════════════════════════════════════════════════════ */
section('6 · Η ΣΤΗΛΗ · ΟΙΚΟΓΕΝΕΙΕΣ');
const ch = E.chain(V.aggello, 'act');
is('η στήλη έχει έξι θέσεις', ch.length, 6);
is('με τη σειρά του φυλλαδίου', ch.map(c => c.tense), ['ens', 'prt', 'mel', 'aor', 'prk', 'ypr']);
is('πρώτη θέση', ch[0].forms, ['ἀγγέλλω']);

const chAg = E.chain(V.agamai, 'mp');
is('το ἄγαμαι κρατάει έξι θέσεις', chAg.length, 6);
is('...με τα δύο τελευταία άδεια', [chAg[4].forms, chAg[5].forms], [null, null]);
ok('...και μη εξετάσιμα', !chAg[4].drillable && !chAg[5].drillable);
is('το ἄγαμαι δεν έχει ενεργητική στήλη καθόλου', E.chain(V.agamai, 'act'), []);

const fams = E.byFamily(D.VERBS);
ok('κάθε ρήμα ανήκει σε γνωστή οικογένεια', D.VERBS.every(v => !!D.FAMS[v.fam]));
ok('κάθε οικογένεια που χρησιμοποιείται έχει κανόνα', fams.every(f => f.info && f.info.rule && f.info.label));
is('τα δύο αποθετικά είναι μαζί', fams.filter(f => f.fam === 'apoth')[0].verbs.map(v => v.id), ['agamai', 'aideomai']);

/* ══════════════════════════════════════════════════════════════════
   7 · ΜΕΤΑΔΕΔΟΜΕΝΑ — κάθε ρήμα ξέρει από πού ήρθε και γιατί συμπεριφέρεται έτσι
   ══════════════════════════════════════════════════════════════════ */
section('7 · ΜΕΤΑΔΕΔΟΜΕΝΑ');
ok('κάθε ρήμα έχει μετάφραση', D.VERBS.every(v => v.gloss && v.gloss.length > 2));
ok('κάθε ρήμα έχει εξήγηση συμπεριφοράς', D.VERBS.every(v => v.why && v.why.length > 30));
ok('κάθε id είναι λατινικό, ασφαλές για κλειδί', D.VERBS.every(v => /^[a-z]+$/.test(v.id)));
is('το σύνθετο δηλώνει την πρόθεσή του', V.apagoreuo.compound, 'ἀπ');
ok('κανένα ΑΣΥΝΘΕΤΟ ρήμα δεν δηλώνει πρόθεση κατά λάθος',
   D.VERBS.filter(v => v.compound).every(v => v.lemma.indexOf(v.compound) === 0));
is('η πηγή είναι καταγεγραμμένη', D.SHEET.source, 'Φροντιστήριο Πυθαγόρας');
is('η σελίδα 1 δηλώνει 6 ρήματα', D.SHEET.pages[0].verbs, D.VERBS.length);

console.log('\n' + (fail ? '✗ ' + fail + ' FAILED' : '✓ όλα πέρασαν') + '  (' + pass + ' assertions)');
process.exit(fail ? 1 : 0);
