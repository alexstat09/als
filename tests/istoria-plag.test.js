/* ══════════════════════════════════════════════════════════════════════
   tests/istoria-plag.test.js — Ο ΠΛΑΓΙΟΤΙΤΛΟΣ

   ⭐⭐ ΤΟ ΠΡΟΒΛΗΜΑ ΠΟΥ ΛΥΝΕΙ Η ΣΕΛΙΔΑ, ΚΑΙ ΓΙΑΤΙ ΤΟ TEST ΕΙΝΑΙ ΤΟ ΘΕΜΕΛΙΟ.
   Η μονάδα εξέτασης δεν είναι η ενότητα· είναι ο πλαγιότιτλος του καθηγητή.
   Ένας πλαγιότιτλος ΔΕΝ κουβαλάει περιεχόμενο: είναι ΔΕΙΚΤΕΣ σε παραγράφους
   που είναι ήδη ελεγμένες λέξη-προς-λέξη απέναντι στο βιβλίο. Το μόνο πράγμα
   που κάνει το σχήμα δυνατό είναι ένα μετρημένο γεγονός:

       κάθε `anchor` κάθε σημείου λύνεται σε ΑΚΡΙΒΩΣ ΜΙΑ παράγραφο.

   ⚠️ ΑΥΤΟ ΕΙΝΑΙ ΠΡΟΫΠΟΘΕΣΗ, ΟΧΙ ΠΑΡΑΤΗΡΗΣΗ. Αν μια μελλοντική ενότητα φέρει
   σημείο που λύνεται σε 0 ή σε >1 παραγράφους, ο πλαγιότιτλος θα ζητούσε
   ΣΙΩΠΗΛΑ λάθος στοιχεία — σωστή οθόνη, λάθος εξέταση. Το build σκάει εδώ.

   Τα μέρη:
     1 · ο θεμέλιος λίθος — 1:1 άγκυρα → παράγραφος, σε ΚΑΘΕ σημείο
     2 · ο resolver — ντετερμινιστικός, με τη σειρά της απαγγελίας
     3 · η εξαγωγή δεν άλλαξε ΤΙΠΟΤΑ (σταθερή αρχή 25)
     4 · lesson-grade.js ≡ istoria-data.js, συνάρτηση προς συνάρτηση
     5 · ο guard σύγκρουσης, ΑΝΑ ΠΛΑΓΙΟΤΙΤΛΟ
     6 · το σχήμα δεν μπορεί να τον βλάψει
     7 · η καλωδίωση της σελίδας (και ότι ΔΕΝ αγγίζει τη ζωντανή)

   node tests/istoria-plag.test.js
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const I = require(path.join(ROOT, 'istoria-data.js'));
const LG = require(path.join(ROOT, 'lesson-grade.js'));
const PAGE = fs.readFileSync(path.join(ROOT, 'istoria-demo.html'), 'utf8');
const LIVE = fs.readFileSync(path.join(ROOT, 'istoria.html'), 'utf8');

/* ⚠️ ΟΙ ΣΤΑΤΙΚΕΣ ΒΕΒΑΙΩΣΕΙΣ ΔΙΑΒΑΖΟΥΝ ΚΩΔΙΚΑ, ΟΧΙ ΣΧΟΛΙΑ. Αυτή η σελίδα
   γράφει τους κανόνες της μέσα στα σχόλιά της («ΚΑΝΕΝΑ σκέτο `state =
   load()`», «ποτέ `100vh`»), οπότε ένα grep πάνω στην ωμή πηγή θα έβρισκε
   ακριβώς τις φράσεις που απαγορεύει και θα απέτυχε λέγοντας το αντίθετο
   από την αλήθεια. Ίδιο σχήμα με το tests/study-sync-persist.test.js §4. */
const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/<!--[\s\S]*?-->/g, ' ');
const CODE = strip(PAGE);
const LIVECODE = strip(LIVE);

let pass = 0, fail = 0;
function ok(cond, msg) { if (cond) pass++; else { fail++; console.log('  ✗ ' + msg); } }
function eq(a, b, msg) {
  ok(JSON.stringify(a) === JSON.stringify(b),
    msg + '\n      got  ' + JSON.stringify(a) + '\n      want ' + JSON.stringify(b));
}
const section = s => console.log('\n' + s);

/* ══ 1 · Ο ΘΕΜΕΛΙΟΣ ΛΙΘΟΣ ═══════════════════════════════════════════ */
section('1 · Κάθε άγκυρα λύνεται σε ΑΚΡΙΒΩΣ ΜΙΑ παράγραφο');
let totalPoints = 0, totalEls = 0;
I.UNITS.forEach(function (un) {
  const pts = (un.skeleton && un.skeleton.points) || [];
  ok(pts.length > 0, un.id + ' · καμία ενότητα χωρίς σημεία');
  pts.forEach(function (p, pi) {
    totalPoints++;
    totalEls += (p.must || []).length;
    const hits = I.anchorHits(un.id, pi);
    ok(hits.length === 1,
      un.id + ' · το σημείο ' + (pi + 1) + ' («' + p.label + '») λύνεται σε ' + hits.length +
      ' παραγράφους αντί για ΜΙΑ → «' + p.anchor + '»');
  });

  /* ⭐ ΚΑΙ ΜΕ ΤΗ ΣΕΙΡΑ ΤΟΥΣ. Αν τα σημεία δεν είναι ήδη σε αύξουσα σειρά
     παραγράφου, μια επιλογή παραγράφων δίνει σπασμένο μπλοκ και ο
     πλαγιότιτλος διαβάζεται ανάποδα από το βιβλίο. */
  let last = -1, ordered = true;
  pts.forEach(function (p, pi) {
    const h = I.anchorHits(un.id, pi);
    if (h.length !== 1) return;
    if (h[0] < last) ordered = false;
    last = h[0];
  });
  ok(ordered, un.id + ' · τα σημεία ΔΕΝ είναι σε αύξουσα σειρά παραγράφου');

  /* Κάθε παράγραφος πρέπει να έχει τουλάχιστον ένα σημείο, αλλιώς υπάρχει
     παράγραφος που ο πλαγιότιτλος μπορεί να διαλέξει και να πάρει ΜΗΔΕΝ. */
  (un.text || []).forEach(function (t, pi) {
    ok(I.paraPoints(un.id, pi).length > 0,
      un.id + ' · η παράγραφος ' + (pi + 1) + ' δεν έχει ΚΑΝΕΝΑ σημείο — διαλέξιμη και άδεια');
  });
});
console.log('    units ' + I.UNITS.length + ' · points ' + totalPoints + ' · elements ' + totalEls);

/* ══ 2 · Ο RESOLVER ════════════════════════════════════════════════ */
section('2 · Ο resolver — ντετερμινιστικός, με τη σειρά της απαγγελίας');
{
  const a1b = I.unit('a1b');
  const p0 = I.paraPoints('a1b', 0), p1 = I.paraPoints('a1b', 1);
  ok(p0.length > 0 && p1.length > 0, 'η a1b δίνει σημεία και στις δύο παραγράφους');

  const two = I.pointsOf({ picks: [{ u: 'a1b', p: 0 }, { u: 'a1b', p: 1 }] });
  eq(two.length, p0.length + p1.length, 'δύο παράγραφοι = τα σημεία και των δύο, ακριβώς');
  eq(two.map(x => x.pointIndex), p0.concat(p1).map(x => x.pointIndex),
    'η σειρά είναι picks → και μέσα σε παράγραφο η σειρά των σημείων');
  eq(I.elCount(two), (a1b.skeleton.points || []).reduce((n, p) => n + (p.must || []).length, 0),
    'όλες οι παράγραφοι μιας ενότητας = όλα τα στοιχεία της');

  /* ⭐ Η ΣΕΙΡΑ ΤΟΥ ΚΑΘΗΓΗΤΗ, ΠΟΤΕ ΑΛΦΑΒΗΤΙΚΑ ΚΑΙ ΠΟΤΕ ΚΑΤΑ ts. */
  const rev = I.pointsOf({ picks: [{ u: 'a1b', p: 1 }, { u: 'a1b', p: 0 }] });
  eq(rev.map(x => x.pointIndex), p1.concat(p0).map(x => x.pointIndex),
    'αντίστροφη επιλογή → αντίστροφη απαγγελία');

  /* Η ΒΑΛΒΙΔΑ: ξεδιάλεγμα σημείου. */
  const key = 'a1b:' + p0[0].pointIndex;
  const dropped = I.pointsOf({ picks: [{ u: 'a1b', p: 0 }], drop: [key] });
  eq(dropped.length, p0.length - 1, 'το drop βγάζει ΑΚΡΙΒΩΣ ένα σημείο');
  ok(dropped.every(x => x.unitId + ':' + x.pointIndex !== key), '…και βγάζει το σωστό');

  /* Η ίδια παράγραφος δύο φορές δεν διπλασιάζει τίποτα. */
  eq(I.pointsOf({ picks: [{ u: 'b2', p: 0 }, { u: 'b2', p: 0 }] }).length,
     I.pointsOf({ picks: [{ u: 'b2', p: 0 }] }).length,
     'διπλό pick της ίδιας παραγράφου δεν διπλασιάζει σημεία');

  /* ⭐ Η b1 και η b1b είναι Η ΙΔΙΑ ενότητα του βιβλίου, κομμένη από το
     φροντιστήριο — άρα ένας πλαγιότιτλος ΠΡΕΠΕΙ να πατάει και στις δύο. */
  const cross = I.pointsOf({ picks: [{ u: 'b1', p: 0 }, { u: 'b1b', p: 0 }] });
  eq(cross.length, I.paraPoints('b1', 0).length + I.paraPoints('b1b', 0).length,
    'ένας πλαγιότιτλος πατάει σε ΔΥΟ ενότητες');
  ok(cross.some(x => x.unitId === 'b1') && cross.some(x => x.unitId === 'b1b'),
    '…και κρατάει το unitId του κάθε σημείου (τα λάθη του μένουν στη θέση τους)');

  /* Τα άδεια και τα άγνωστα δεν σκάνε και δεν εφευρίσκουν. */
  eq(I.pointsOf(null).length, 0, 'null → κανένα σημείο, χωρίς σφάλμα');
  eq(I.pointsOf({}).length, 0, 'χωρίς picks → κανένα σημείο');
  eq(I.pointsOf({ picks: [{ u: 'δενυπάρχει', p: 0 }] }).length, 0, 'άγνωστη ενότητα → κανένα σημείο');
  eq(I.pointsOf({ picks: [{ u: 'a1a', p: 99 }] }).length, 0, 'ανύπαρκτη παράγραφος → κανένα σημείο');
  eq(I.pointsOf({ picks: [null] }).length, 0, 'σκουπίδι μέσα στα picks δεν ρίχνει τον resolver');
  eq(I.elCount(null), 0, 'elCount σε null');
  eq(I.anchorHits('δενυπάρχει', 0).length, 0, 'anchorHits σε άγνωστη ενότητα');
}

/* ══ 3 · Η ΕΞΑΓΩΓΗ ΔΕΝ ΑΛΛΑΞΕ ΤΙΠΟΤΑ ══════════════════════════════
   ⚠️ Σταθερή αρχή 25. Το ΠΑΛΙΟ σώμα της gradeUnit είναι ΑΝΤΙΓΡΑΜΜΕΝΟ ΜΕ ΤΟ
   ΧΕΡΙ εδώ, όπως ήταν πριν την εξαγωγή. Αν το παρήγαγα από τη νέα υλοποίηση
   θα συμφωνούσε με κάθε λάθος μου τέλεια — ίδιος κανόνας με τον χειρόγραφο
   πίνακα των Λατινικών. */
section('3 · gradeUnit: ΠΑΛΙΟ σώμα ≡ ΝΕΟ, σε κάθε ενότητα');
function gradeUnitOLD(unit, heard, aliases) {
  var pts = (unit && unit.skeleton && unit.skeleton.points) || [];
  var out = [], said = 0, total = 0, i, j, a;
  for (i = 0; i < pts.length; i++) {
    a = null;
    if (aliases) {
      a = [];
      for (j = 0; j < ((pts[i].must) || []).length; j++) a.push(aliases[i + ':' + j] || null);
    }
    var g = I.gradePoint(pts[i], heard, a);
    out.push(g); said += g.n; total += g.total;
  }
  return { points: out, said: said, total: total, coverage: total ? said / total : 0 };
}
/* Πλήρης απαγγελία = ό,τι γράφει το ίδιο το corpus. Μερική = τα μισά σημεία.
   Και μία με aliases, γιατί εκεί ζει η μόνη διαφορά που θα μπορούσε να
   ξεφύγει σιωπηλά. */
function fullSay(un) {
  return (un.skeleton.points || []).map(p =>
    p.detail + ' ' + (p.must || []).map(e => e.k).join('. ')).join(' ');
}
I.UNITS.forEach(function (un) {
  const half = (un.skeleton.points || []).slice(0, Math.ceil(un.skeleton.points.length / 2))
    .map(p => p.detail + ' ' + (p.must || []).map(e => e.k).join('. ')).join(' ');
  const alias = { '0:0': ['η δική μου φράση για το πρώτο στοιχείο'] };
  [['πλήρης', fullSay(un), null],
   ['μερική', half, null],
   ['σιωπή', '', null],
   ['με aliases', 'η δική μου φράση για το πρώτο στοιχείο', alias]].forEach(function (c) {
    eq(I.gradeUnit(un, c[1], c[2]), gradeUnitOLD(un, c[1], c[2]),
      un.id + ' · ' + c[0] + ': η εξαγωγή άλλαξε το αποτέλεσμα της gradeUnit');
  });
});

section('3β · gradePoints είναι το ΣΩΜΑ της gradeUnit, όχι κάτι διπλανό');
I.UNITS.forEach(function (un) {
  eq(I.gradePoints(un.skeleton.points, fullSay(un), null), I.gradeUnit(un, fullSay(un), null),
    un.id + ' · gradePoints(points) ≢ gradeUnit(unit)');
});
eq(I.gradePoints(null, 'οτιδήποτε', null), { points: [], said: 0, total: 0, coverage: 0 },
  'gradePoints σε κενή λίστα δεν σκάει και δεν επινοεί κάλυψη');
/* ⚠️ Σταθερή αρχή 33 σε νέο μέρος: μηδέν στοιχεία ΔΕΝ είναι 0% — είναι
   απουσία μέτρησης. Η κάλυψη μένει 0 και η σελίδα το λέει με λέξεις. */
eq(I.gradePoints([], '', null).total, 0, 'μηδέν στοιχεία → total 0, ποτέ διαίρεση με μηδέν');

/* ══ 4 · ΤΑ ΔΥΟ ΑΝΤΙΓΡΑΦΑ ΜΕΝΟΥΝ ΤΑΥΤΟΣΗΜΑ ════════════════════════
   Το istoria-data.js κρατάει δικά του αντίγραφα του βαθμολογητή επίτηδες.
   Άρα η εξαγωγή έγινε ΚΑΙ ΣΤΑ ΔΥΟ αρχεία ή σε κανένα (σταθερή αρχή 15). */
section('4 · lesson-grade.js ≡ istoria-data.js');
ok(typeof LG.gradePoints === 'function', 'το lesson-grade.js εξάγει gradePoints');
ok(typeof I.gradePoints === 'function', 'το istoria-data.js εξάγει gradePoints');
{
  const norm = f => String(f).replace(/\s+/g, ' ').trim();
  ['matched', 'gradePoint', 'gradePoints', 'gradeUnit'].forEach(function (fn) {
    ok(norm(LG[fn]) === norm(I[fn]),
      'η `' + fn + '` απέκλινε ανάμεσα στα δύο αρχεία — άλλαξαν ΚΑΙ ΤΑ ΔΥΟ ή κανένα');
  });
  I.UNITS.forEach(function (un) {
    eq(LG.gradePoints(un.skeleton.points, fullSay(un), null),
       I.gradePoints(un.skeleton.points, fullSay(un), null),
       un.id + ' · τα δύο αντίγραφα βαθμολογούν διαφορετικά');
  });
  eq(LG.PASS, I.PASS, 'το PASS απέκλινε');
  eq(LG.LADDER, I.LADDER, 'η σκάλα απέκλινε');
}

/* ══ 5 · Ο GUARD ΣΥΓΚΡΟΥΣΗΣ, ΑΝΑ ΠΛΑΓΙΟΤΙΤΛΟ ══════════════════════
   Ο guard «κανένα σημείο δεν ανάβει στοιχείο ΑΛΛΟΥ σημείου» έχει πιάσει 7
   αληθινά bugs στην ενότητα. Με πλαγιότιτλους ο κίνδυνος ΜΕΓΑΛΩΝΕΙ: μια
   απαγγελία 8 στοιχείων έχει λιγότερο κείμενο για να «απορροφήσει» μια
   τυχαία σύμπτωση, οπότε ένα ψεύτικα αναμμένο στοιχείο κοστίζει ποσοστιαία
   πολύ περισσότερο.

   ⚠️⚠️ Η ΔΙΑΤΥΠΩΣΗ ΤΟΥ SPEC ΕΙΝΑΙ «κανένα στοιχείο ΕΚΤΟΣ ΑΥΤΟΥ δεν ανάβει»,
   ΚΑΙ ΜΕΤΡΗΘΗΚΕ ΟΤΙ ΔΕΝ ΕΙΝΑΙ ΑΥΤΗ Η ΕΓΓΥΗΣΗ ΠΟΥ ΔΕΣΜΕΥΕΙ. Ο βαθμολογητής
   παίρνει ΜΟΝΟ τα σημεία του πλαγιότιτλου (`gradePoints(pointsOf(plag))`),
   άρα ένα «ξένο» στοιχείο δεν βαθμολογείται ΠΟΤΕ, σε καμία απαγγελία, και
   δεν μπορεί να αλλάξει ούτε ποσοστό ούτε σκάλα ούτε «λάθος μου». Πάνω σε
   ολόκληρο το corpus τέτοιες συμπτώσεις υπάρχουν (3, από λέξεις σκορπισμένες
   σε ΔΙΑΦΟΡΕΤΙΚΑ σημεία της ίδιας παραγράφου) — δηλαδή μια αυστηρή
   βεβαίωση εκεί θα κλείδωνε κανόνα που δεν ισχύει και θα με έσπρωχνε να
   σφίξω τα `say` του corpus, που ΑΛΛΑΖΕΙ τη βαθμολόγηση της ζωντανής
   σελίδας που χρησιμοποιεί κάθε μέρα (σταθερή αρχή 19).

   ⭐ Η ΕΓΓΥΗΣΗ ΠΟΥ ΠΡΑΓΜΑΤΙ ΔΕΣΜΕΥΕΙ ΕΙΝΑΙ Ο ΠΛΗΘΩΡΙΣΜΟΣ ΜΕΣΑ ΣΤΟ ΒΑΘΜΟ:
   κανένα στοιχείο ενός ΒΑΘΜΟΛΟΓΟΥΜΕΝΟΥ σημείου δεν επιτρέπεται να ανάβει
   από τα λόγια των ΥΠΟΛΟΙΠΩΝ σημείων της ίδιας απαγγελίας. Αυτό είναι το
   «είπα δύο σημεία και μου χρέωσε τρία», και είναι ακριβώς το λάθος που
   κόστισε την als-v452. Μετρημένο: 0 σε 22 πλαγιότιτλους. */
section('5 · Απαγγέλλει ΕΝΑΝ πλαγιότιτλο: ανάβουν όλα τα δικά του, κανένα ΠΛΗΘΩΡΙΣΜΕΝΟ');
{
  const say = x => x.point.detail + ' ' + (x.point.must || []).map(e => e.k).join('. ');
  let cases = 0, multi = 0;
  I.UNITS.forEach(function (un) {
    (un.text || []).forEach(function (t, pi) {
      const mine = I.pointsOf({ picks: [{ u: un.id, p: pi }] });
      if (!mine.length) return;
      cases++;
      const spoken = mine.map(say).join(' ');

      /* (α) ΟΛΑ τα δικά του ανάβουν. Ένας πλαγιότιτλος που δεν περνάει με τα
         ίδια τα λόγια του βιβλίου είναι σπασμένος πριν τον δει άνθρωπος. */
      const g = I.gradePoints(mine.map(x => x.point), spoken, null);
      ok(g.coverage >= I.PASS,
        un.id + ':π' + (pi + 1) + ' · η ίδια του η απαγγελία δίνει μόνο ' +
        Math.round(g.coverage * 100) + '%, κάτω από το PASS');
      ok(g.points.every(p => p.full),
        un.id + ':π' + (pi + 1) + ' · κάποιο σημείο δεν βγήκε ΠΛΗΡΕΣ με τα λόγια του βιβλίου');

      /* (β) ⭐ ΚΑΝΕΝΑΣ ΠΛΗΘΩΡΙΣΜΟΣ. Για κάθε σημείο, απαγγέλλουμε ΟΛΑ ΤΑ
         ΥΠΟΛΟΙΠΑ και απαιτούμε να μην ανάψει τίποτα δικό του. */
      if (mine.length < 2) return;
      multi++;
      mine.forEach(function (target, ti) {
        const others = mine.filter((x, ix) => ix !== ti).map(say).join(' ');
        (target.point.must || []).forEach(function (e) {
          ok(!I.matched(e, others),
            un.id + ':π' + (pi + 1) + ' · ΠΛΗΘΩΡΙΣΜΟΣ — το «' + e.k + '» του σημείου ' +
            (target.pointIndex + 1) + ' ανάβει από τα ΑΛΛΑ σημεία της ίδιας απαγγελίας → ' +
            JSON.stringify(e.say));
        });
      });
    });
  });
  ok(cases >= 20, 'ο guard έτρεξε σε ' + cases + ' πλαγιότιτλους (περίμενα ≥20)');
  console.log('    ' + cases + ' πλαγιότιτλοι-μιας-παραγράφου, ' + multi + ' με ≥2 σημεία');
}

section('5β · Και σε πλαγιότιτλο ΔΥΟ παραγράφων, από δύο ενότητες');
{
  const say = x => x.point.detail + ' ' + (x.point.must || []).map(e => e.k).join('. ');
  const mine = I.pointsOf({ picks: [{ u: 'b1', p: 0 }, { u: 'b1b', p: 0 }] });
  const spoken = mine.map(say).join(' ');
  const g = I.gradePoints(mine.map(x => x.point), spoken, null);
  ok(g.coverage >= I.PASS, 'ο διπλός πλαγιότιτλος δίνει ' + Math.round(g.coverage * 100) + '%');
  mine.forEach(function (target, ti) {
    const others = mine.filter((x, ix) => ix !== ti).map(say).join(' ');
    (target.point.must || []).forEach(function (e) {
      ok(!I.matched(e, others),
        'ΠΛΗΘΩΡΙΣΜΟΣ σε διπλό πλαγιότιτλο: «' + e.k + '» του ' + target.unitId + ':' +
        (target.pointIndex + 1) + ' ανάβει από τα άλλα σημεία');
    });
  });
}

/* ══ 6 · ΤΟ ΣΧΗΜΑ ΔΕΝ ΜΠΟΡΕΙ ΝΑ ΤΟΝ ΒΛΑΨΕΙ ════════════════════════
   Ο πλαγιότιτλος γράφεται από τον ΙΔΙΟ, στο κινητό του, στις 11 το βράδυ.
   Κανένα build-time test δεν μπορεί να ελέγξει ΤΙ έγραψε. Μπορεί όμως να
   ελέγξει ότι το σχήμα δεν επιτρέπει στο λάθος να μπει. */
section('6 · Το σχήμα');
{
  const code = CODE;

  ok(!/plag\[[^\]]*\]\.text|rec\.text\s*=|\.picks\[[^\]]*\]\.text\s*=/.test(code),
    'ο πλαγιότιτλος ΔΕΝ αποκτά πεδίο κειμένου βιβλίου');
  ok(!/\.anchor\s*=/.test(code), 'κανένα μονοπάτι της σελίδας δεν ΓΡΑΦΕΙ anchor');

  /* ⛔ ΚΑΜΙΑ AI ΣΤΟ RUNTIME ΤΗΣ ΣΕΛΙΔΑΣ — ούτε για να διαβάσει φωτογραφία,
     ούτε για να σπάσει τα λόγια του καθηγητή σε στοιχεία. Ο τίτλος του δεν
     τον αγγίζει κανένα μοντέλο. */
  ok(!/\bfetch\s*\(/.test(code.replace(/fetchEvents|fetchOne|fetchCalendarList/g, '')),
    'η σελίδα δεν κάνει ΚΑΝΕΝΑ fetch — καμία AI στο runtime');
  ok(!/api\/(nova|mcp|recap|gem)/.test(code), 'η σελίδα δεν καλεί κανένα api/*.js');
  ok(!/getUserMedia|createElement\(['"]canvas|<input[^>]+type="file"/.test(code),
    'καμία αναγνώριση φωτογραφίας μέσα στη σελίδα');

  /* ⭐ ΜΗΔΕΝ ΣΤΟΙΧΕΙΑ → ΠΟΤΕ ΑΝΑΚΛΗΣΗ. Σταθερή αρχή 10: μια απαγγελία που
     ζητάει κρυφά τα μισά είναι χειρότερη από καμία. */
  ok(/if\s*\(!pts\.length\)\s*\{[\s\S]{0,400}?openEditor/.test(code),
    'πλαγιότιτλος με ΜΗΔΕΝ σημεία δεν προσφέρεται ποτέ για ανάκληση');
  ok(/pbroken\s*\(/.test(code) && /χαλασμένος/.test(code),
    'ο «χαλασμένος» έχει δική του πρόταση, διαφορετική από «άδειος» και «άγνωστος»');
  ok(/δεν το έχεις πει/.test(code), '«δεν το έχεις πει ακόμη» υπάρχει και ΔΕΝ είναι 0%');

  /* Οι πίνακες είναι υλικό ΑΝΑΓΝΩΣΗΣ, ποτέ πηγή στοιχείων. */
  ok(/ΔΕΝ προσθέτει κανένα στοιχείο/.test(code),
    'ο συντάκτης λέει ρητά ότι ένας πίνακας δεν προσθέτει στοιχεία');

  /* ⭐ ΤΟ ΚΛΕΙΔΙ ΤΟΥ ΣΤΟΙΧΕΙΟΥ ΔΕΝ ΑΛΛΑΖΕΙ: `unitId:σημείο:θέση`. Αν άλλαζε,
     «τα λάθη μου» θα μηδενίζονταν την ημέρα που θα έφτιαχνε τον πρώτο του
     πλαγιότιτλο — και ξανά σε κάθε αναδιάταξη. */
  ok(/var k = uid \+ ':' \+ pi \+ ':' \+ ei;/.test(code),
    'το κλειδί στοιχείου μένει unitId:σημείο:θέση');
  ok(/pts\[i\]\.unitId, pts\[i\]\.pointIndex, j/.test(code),
    'η βαθμολόγηση γράφει στο στοιχείο του ΣΗΜΕΙΟΥ, όχι του πλαγιότιτλου');
}

section('6β · Το ΤΩΡΑ δεν επινοεί ούτε αριθμό ούτε δουλειά');
{
  ok(/PACE_MIN_ELS/.test(CODE) && /state\.pace\.secs \+= secs/.test(CODE),
    'τα λεπτά προκύπτουν από ΜΕΤΡΗΜΕΝΟ ρυθμό, όχι από εκτίμηση');
  ok(/p\.els >= PACE_MIN_ELS && p\.secs > 0/.test(CODE),
    'πριν υπάρξουν δεδομένα, η γραμμή λέει ΜΟΝΟ στοιχεία');
  ok(/secs >= 5 && secs <= 3600/.test(CODE),
    'φρουρός και στα δύο άκρα: 2 δευτερόλεπτα δεν είναι απαγγελία, μία ώρα δεν είναι μέτρηση');
  ok(/Τελείωσες\./.test(PAGE), '«Τελείωσες» είναι αληθινή απάντηση — δεν εφευρίσκει δουλειά');
  ok(/(this|Το ημερολόγιο δεν είναι συνδεδεμένο)/.test(PAGE),
    'ασύνδετο ημερολόγιο το λέει, δεν σωπαίνει');
}

/* ══ 7 · Η ΚΑΛΩΔΙΩΣΗ ══════════════════════════════════════════════ */
section('7 · Η καλωδίωση');
{
  /* ⚠️ ΚΑΝΕΝΑ ΝΕΟ ΣΥΓΧΡΟΝΙΖΟΜΕΝΟ ΚΛΕΙΔΙ (σταθερή αρχή 16). Όλα ζουν στο
     ΙΔΙΟ `ist:v1` / appKey `istoria`, άρα μπαίνουν αυτόματα στο backup και
     στο MCP χωρίς μία γραμμή νέας καλωδίωσης. */
  ok(/var KEY = 'ist:v1';/.test(CODE), 'η σελίδα γράφει στο ist:v1');
  ok(/var APP = 'istoria';/.test(CODE), '…με appKey istoria');
  const keys = (CODE.match(/syncedKeys:\s*\[([^\]]*)\]/g) || []);
  ok(keys.length === 1 && /\[KEY\]/.test(keys[0]), 'ένα και μόνο συγχρονιζόμενο κλειδί');
  ok(!/hw:v1|arx:gn|ton:v1|lat:v1/.test(CODE), 'δεν αγγίζει store άλλης σελίδας');

  const bundles = fs.readFileSync(path.join(ROOT, 'backup.html'), 'utf8');
  ok(/'ist:v1'/.test(bundles), 'το ist:v1 είναι ήδη στα BUNDLES του backup.html');
  const mcp = fs.readFileSync(path.join(ROOT, 'api', 'mcp.js'), 'utf8');
  ok(/'ist:v1'/.test(mcp), 'το ist:v1 είναι ήδη στο BUNDLE του api/mcp.js');

  /* ⚠️⚠️ ΣΤΑΘΕΡΗ ΑΡΧΗ 31 — ΤΡΕΙΣ ΧΑΡΤΕΣ. Ένας ξεχασμένος είναι σιωπηλή
     απώλεια: η δεύτερη απαγγελία κάθε πλαγιότιτλου θα αναιρούνταν 400ms
     αργότερα, ντετερμινιστικά. */
  ok(/\[state\.units, state\.els, state\.plag, \{ pace: state\.pace \}\]/.test(CODE),
    'το StudyStamp βλέπει units ΚΑΙ els ΚΑΙ plag ΚΑΙ pace');
  ok(/function reload\(\)\{ state = load\(\); STAMP\.seed\(\); \}/.test(CODE),
    'κάθε ανάγνωση από τον δίσκο ξανασπέρνει το αποτύπωμα');
  const bare = (CODE.match(/state = load\(\)/g) || []).length;
  ok(bare === 1, 'κανένα σκέτο `state = load()` έξω από το reload() (' + bare + ')');
  ok(/function save\(\)\{\s*STAMP\.stamp\(\);/.test(CODE), 'κάθε save() σφραγίζει πρώτα');
  ok(/Δεν φόρτωσε το study-stamp\.js/.test(CODE), 'λέει αν λείπει η σφραγίδα');

  /* ⚠️⚠️ ΣΤΑΘΕΡΗ ΑΡΧΗ 32 — ταφόπλακα με το χέρι, ΜΕ ΤΟΝ ΚΑΝΟΝΑ ΑΥΤΟΥΣΙΟ. */
  ok(/var TOMB_KEY = '__synctomb__' \+ APP;/.test(CODE), 'το TOMB_KEY είναι αυτό που διαβάζει το sync.js');
  ok(/Math\.max\(cr, Date\.now\(\), \(\+ts \|\| 0\) \+ 1\)/.test(CODE),
    'ο κανόνας T = max(now, ts+1) αντιγράφηκε ΚΑΤΑ ΛΕΞΗ (σταθερή αρχή 23)');
  ok(/tombPath\(KEY, \['plag'\], id, ts\)/.test(CODE), 'η ταφόπλακα είναι ΦΩΛΙΑΣΜΕΝΗ, όπως το plag');

  /* Σταθερή αρχή 17: ποτέ άδειο catch σε γράψιμο. */
  const emptyCatch = (CODE.match(/catch\s*\(\s*\w*\s*\)\s*\{\s*\}/g) || []).length;
  ok(emptyCatch <= 3, 'τα άδεια catch είναι μόνο σε focus/stop, όχι σε γράψιμο (' + emptyCatch + ')');
  ok(/Ο χώρος του κινητού γέμισε/.test(CODE), 'ένα γεμάτο κινητό το λέει με λέξεις');

  /* Σταθερή αρχή 32: παίρνει ταφόπλακα ΜΟΝΟ μετά από επιβεβαιωμένο γράψιμο. */
  ok(/back\.plag && has\(back\.plag, id\)/.test(CODE),
    'η ταφόπλακα μπαίνει ΜΟΝΟ αφού επιβεβαιωθεί ότι το σβήσιμο έπιασε');

  /* ⚠️ page-motion.js: κρύβει περιεχόμενο πίσω από translateY μέχρι να
     κυλήσει, και το transform του σπάει τα fixed παιδιά. Σε στήλη sticky
     είναι λάθος — το improve.html δεν το φορτώνει για τον ίδιο λόγο. */
  ok(!/<script src="page-motion\.js"/.test(CODE), 'δεν φορτώνει page-motion.js');
  ok(/position:sticky/.test(CODE) && !/\.ip-spine-wrap\{[^}]*position:fixed/.test(CODE),
    'η αριστερή στήλη είναι sticky, ΠΟΤΕ fixed');
  ok(!/overscroll-behavior:\s*contain/.test(CODE),
    'καμία στήλη δεν παίρνει overscroll-behavior:contain (σταθερή αρχή 22)');
  ok(/100dvh/.test(CODE) && !/100vh/.test(CODE), '100dvh, ποτέ 100vh');
}

section('7β · Η ΖΩΝΤΑΝΗ σελίδα δεν χάλασε — και δεν σβήνει πια ό,τι δεν διαβάζει');
{
  /* ⚠️⚠️ ΣΤΑΘΕΡΗ ΑΡΧΗ 35. Ο παλιός `load()` της istoria.html ήταν λίστα
     επιτρεπομένων: ό,τι δεν ονόμαζε ρητά ΔΕΝ επιβίωνε της φόρτωσης, και το
     επόμενο save το έγραφε σβησμένο στον δίσκο. Με δύο σελίδες πάνω στο ίδιο
     store αυτό είναι ΑΠΩΛΕΙΑ ΔΕΔΟΜΕΝΩΝ, όχι ατέλεια. */
  ok(/for \(k in s\) if \(Object\.prototype\.hasOwnProperty\.call\(s, k\)\) b\[k\] = s\[k\];/.test(LIVECODE),
    'η istoria.html αντιγράφει ΠΡΩΤΑ όλα τα κλειδιά και μετά κανονικοποιεί');

  /* Και η ΣΥΜΠΕΡΙΦΟΡΑ της δεν άλλαξε σε τίποτα άλλο: τα τέσσερα πεδία που
     ήξερε τα κανονικοποιεί ακόμη ακριβώς όπως πριν. */
  ['b.units = s.units || {};', 'b.els   = s.els   || {};',
   'b.days  = s.days  || [];', 'b.heard = s.heard || {};'].forEach(function (line) {
    ok(LIVE.indexOf(line) >= 0, 'η istoria.html κανονικοποιεί ακόμη: ' + line);
  });
  ok(/function reload\(\)\{ state = load\(\); STAMP\.seed\(\); \}/.test(LIVECODE),
    'ο κύκλος reload/seed της ζωντανής είναι άθικτος');
  ok(/appKey:'istoria'/.test(LIVECODE), 'η ζωντανή κρατάει τον appKey της');
  ok(!/istoria-demo/.test(LIVECODE), 'η ζωντανή σελίδα ΔΕΝ ξέρει καν ότι υπάρχει η νέα');

  /* Και το ίδιο το σχήμα, με προσομοίωση του κύκλου φόρτωσης/αποθήκευσης:
     ένα ΑΓΝΩΣΤΟ πεδίο πρέπει να ζητηθεί πίσω μετά από load+save. Κανένα
     υπάρχον test δεν το έβλεπε, γιατί κάθε suite έσπερνε ΑΚΡΙΒΩΣ τα πεδία
     που ήξερε ο load(). */
  const m = /\n  function load\(\)\{[\s\S]*?\n  \}\n/.exec(LIVE);
  ok(!!m, 'βρέθηκε ο load() της istoria.html');
  if (m) {
    const seeded = { units: { a1a: { runs: 1 } }, els: {}, days: [], heard: {}, plag: { p_x: { id: 'p_x', title: 'δικός του' } }, pace: { secs: 40, els: 20 } };
    /* Ο ΑΛΗΘΙΝΟΣ `load()` της ζωντανής σελίδας, κομμένος από το αρχείο και
       τρεχούμενος όπως είναι. Ένα αντίγραφο εδώ θα συμφωνούσε με το λάθος. */
    const fn = new Function('RAW', 'KEY', 'toast', 'blank', 'localStorage',
      m[0] + ' return load();');
    const out = fn(JSON.stringify(seeded), 'ist:v1', function () {},
      function () { return { v: 1, units: {}, els: {}, days: [], heard: {} }; },
      { getItem: function () { return JSON.stringify(seeded); } });
    eq(out.plag, seeded.plag, '⭐ ο load() της ζωντανής ΔΕΝ σβήνει πια το plag άλλης σελίδας');
    eq(out.pace, seeded.pace, '…ούτε το pace');
    eq(out.units, seeded.units, '…και κρατάει κανονικά τα δικά του');
  }
}

console.log('\n' + pass + ' πέρασαν, ' + fail + ' απέτυχαν\n');
if (fail) process.exit(1);
