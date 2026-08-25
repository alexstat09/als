/* tests/tonos-fyllo.test.js — Ο ΦΡΟΥΡΟΣ ΤΗΣ ΣΕΛ. 5-6-7
 *
 * ⭐⭐⭐ ΤΡΙΑ ΑΝΕΞΑΡΤΗΤΑ ΕΠΙΠΕΔΑ, ΚΑΙ ΤΟ ΤΡΙΤΟ ΕΙΝΑΙ ΚΑΙΝΟΥΡΙΟ ΕΙΔΟΣ
 *
 *  §Α · ΔΙΠΛΗ ΜΕΤΑΓΡΑΦΗ — οι 16 λέξεις γραμμένες ΔΕΥΤΕΡΗ φορά, με άλλη
 *       σειρά, χωρίς να κοιτάξω το tonos-fyllo.js. Πρέπει να συμφωνούν
 *       χαρακτήρα προς χαρακτήρα. ⛔ ΠΟΤΕ μην τις παραγάγεις από το data.
 *
 *  §Β · ΟΙ ΝΟΜΟΙ — κάθε λέξη περνάει από laws()/forcedType() της μηχανής.
 *       Λάθος δήλωση δίχρονου ή λάθος τόνος σκάει ΕΔΩ, όχι στο διαγώνισμα.
 *
 *  §Γ · ⭐ Η ΔΙΑΣΤΑΥΡΩΣΗ — για κάθε κανόνα του φυλλαδίου που δηλώνει
 *       `check`, ΣΠΑΜΕ επίτηδες μια αληθινή λέξη ώστε να τον παραβιάσει,
 *       και απαιτούμε η μηχανή να ουρλιάξει. Αυτό αποδεικνύει ότι ο
 *       κανόνας που ΔΙΑΒΑΣΑ από τη φωτογραφία και ο νόμος που η μηχανή
 *       ΕΠΙΒΑΛΛΕΙ είναι το ίδιο πράγμα. Αν παρανόησα τη φωτογραφία, τα
 *       δύο αποκλίνουν και το build πέφτει.
 *       ⚠️ Η μετάλλαξη είναι υποχρεωτική: ένας έλεγχος που περνάει και
 *       στη σπασμένη μορφή δεν ελέγχει τίποτα.
 */
'use strict';

var path = require('path');
var E = require(path.join(__dirname, '..', 'tonos-engine.js'));
var F = require(path.join(__dirname, '..', 'tonos-fyllo.js'));

var pass = 0, fail = 0, notes = [];
function ok(cond, msg) { if (cond) { pass++; } else { fail++; notes.push('✗ ' + msg); } }
function eq(a, b, msg) { ok(a === b, msg + '  →  «' + a + '» ≠ «' + b + '»'); }

/* ═══ §Α · ΔΙΠΛΗ ΜΕΤΑΓΡΑΦΗ ══════════════════════════════════════════
   Γραμμένες ΞΑΝΑ, με το χέρι, από τη φωτογραφία της σελ. 5. Σκόπιμα σε
   ΑΛΛΗ σειρά, ώστε μια μηχανική αντιγραφή να μη γλιστρήσει μέσα. */
var SECOND = {
  'ἔχων': 'έχοντας',
  'θάλαττα': 'θάλασσα (αττικά)',
  'νῆσος': 'νησί',
  'ἀρχαῖον': 'αρχαίο',
  'πλήρης': 'γεμάτος',
  'ἤκουσας': 'άκουσες',
  'ἄνθρωπος': 'άνθρωπος',
  'γαῦρος': 'περήφανος',
  'εἶχον': 'είχα / είχαν',
  'μῆκος': 'μήκος',
  'ὅπλον': 'όπλο',
  'σώφρων': 'συνετός',
  'προβεβλημένη': 'προβεβλημένη',
  'πλήθη': 'πλήθη',
  'πολέμιον': 'εχθρικό',
  'ἄναρχος': 'χωρίς αρχηγό'
};

var firstKeys = F.DRILL.map(function (d) { return d.w; }).sort();
var secondKeys = Object.keys(SECOND).sort();

eq(firstKeys.length, secondKeys.length, 'Α1 · ίδιο πλήθος λέξεων στις δύο μεταγραφές');
firstKeys.forEach(function (w, i) {
  eq(w, secondKeys[i], 'Α2 · οι δύο μεταγραφές συμφωνούν στη λέξη #' + (i + 1));
});
F.DRILL.forEach(function (d) {
  ok(SECOND[d.w] !== undefined, 'Α3 · η «' + d.w + '» υπάρχει και στη δεύτερη μεταγραφή');
  if (SECOND[d.w] !== undefined) eq(d.g, SECOND[d.w], 'Α4 · ίδια σημασία για «' + d.w + '»');
});

/* ═══ §Β · ΟΞΕΙΑ vs ΤΟΝΟΣ — η αόρατη παγίδα ═════════════════════════
   Το U+1F71 φαίνεται ολόιδιο με το U+03AC. Απαγορεύονται όλα τα OXIA/
   VARIA precomposed του μπλοκ Greek Extended που έχουν δίδυμο. */
var OXIA_BAD = /[άέήίόύώΆΈΉΐΊΰΎΌΏ`´]/;
function scan(obj, where) {
  if (typeof obj === 'string') {
    ok(!OXIA_BAD.test(obj), 'Β0 · κανένα OXIA/precomposed-tonos στο ' + where + ' («' + obj + '»)');
    eq(obj, obj.normalize('NFC'), 'Β0 · NFC στο ' + where);
  } else if (Array.isArray(obj)) obj.forEach(function (v, i) { scan(v, where + '[' + i + ']'); });
  else if (obj && typeof obj === 'object') Object.keys(obj).forEach(function (k) { scan(obj[k], where + '.' + k); });
}
scan(F.DRILL, 'DRILL'); scan(F.LAWS8, 'LAWS8'); scan(F.DASY, 'DASY');
scan(F.ATONA, 'ATONA'); scan(F.SPIRITS, 'SPIRITS'); scan(F.VOWELS, 'VOWELS');

/* ═══ §Β · ΟΙ ΝΟΜΟΙ ΠΑΝΩ ΣΕ ΚΑΘΕ ΛΕΞΗ ══════════════════════════════ */
var bad = E.verify(F.DRILL);
ok(bad.length === 0, 'Β1 · καμία λέξη του ασκησακιού δεν παραβιάζει νόμο  →  ' +
  JSON.stringify(bad.map(function (b) { return b.w + ': ' + b.why.join('; '); })));

F.DRILL.forEach(function (d) {
  var a = E.analyze(d.w);
  ok(a.accIdx >= 1 && a.accIdx <= 3, 'Β2 · «' + d.w + '» έχει τόνο σε νόμιμη θέση');
  ok(E.nameOf(d) !== null, 'Β3 · «' + d.w + '» παίρνει ονομασία (' + E.nameOf(d) + ')');
  /* κάθε λέξη που αρχίζει από φωνήεν ΠΡΕΠΕΙ να έχει πνεύμα — μηχανικός
     ανιχνευτής μονοτονικού, ίδιος με τους αρχικούς χρόνους */
  if (a.needsBreath) ok(a.breath !== null, 'Β4 · «' + d.w + '» έχει πνεύμα');
  /* καμία ποσότητα δεν μένει άγνωστη: αν δήλωσα λειψά q, φαίνεται εδώ */
  var i;
  for (i = 1; i <= Math.min(a.n, 3); i++) {
    ok(E.quantity(d, i) !== null, 'Β5 · «' + d.w + '» δηλώνει ποσότητα για τη θέση ' + i);
  }
  /* το `why` πρέπει να δείχνει σε υπαρκτό κανόνα */
  ok(F.law(d.why) !== null, 'Β6 · «' + d.w + '» δείχνει σε υπαρκτό κανόνα (#' + d.why + ')');
});

/* ═══ §Γ · Η ΔΙΑΣΤΑΥΡΩΣΗ ΦΥΛΛΑΔΙΟ ⇄ ΜΗΧΑΝΗ ════════════════════════
   base   = αληθινή λέξη του corpus
   break_ = πώς τη σπάμε ώστε να ΠΑΡΑΒΙΑΣΕΙ αυτόν τον κανόνα
   expect = τι πρέπει να πει η μηχανή */
var CROSS = {
  trisyl:    { base: 'προβεβλημένη', brk: { idx: 4 },            expect: /τρισυλλαβίας/ },
  ultima:    { base: 'προβεβλημένη', brk: { idx: 3 },            expect: /λήγουσας/ },
  antepen:   { base: 'ἄνθρωπος',     brk: { idx: 3, type: 'π' }, expect: /προπαραλήγουσα/ },
  shortacc:  { base: 'ὅπλον',        brk: { idx: 2, type: 'π' }, expect: /βραχύ/ },
  longlong:  { base: 'πλήρης',       brk: { idx: 2, type: 'π' }, expect: /περισπωμένη/ },
  longshort: { base: 'νῆσος',        brk: { idx: 2, type: 'ο' }, expect: /ΠΕΡΙΣΠΩΜΕΝΗ/ }
};

function entryOf(w) { for (var i = 0; i < F.DRILL.length; i++) if (F.DRILL[i].w === w) return F.DRILL[i]; return null; }

var checked = 0, declaredNull = 0;
F.LAWS8.forEach(function (L) {
  ok(typeof L.full === 'string' && L.full.length > 20, 'Γ0 · ο κανόνας #' + L.n + ' κρατάει τη φράση του φυλλαδίου');
  ok(typeof L.say === 'string' && L.say !== L.full, 'Γ0 · ο κανόνας #' + L.n + ' έχει ΔΙΚΗ ΜΟΥ διατύπωση, ξεχωριστή από του φυλλαδίου');

  if (L.check === null) {
    declaredNull++;
    ok(typeof L.why === 'string' && L.why.length > 10,
      'Γ1 · ο κανόνας #' + L.n + ' δεν ελέγχεται μηχανικά ΚΑΙ λέει γιατί');
    return;
  }

  var C = CROSS[L.check];
  ok(!!C, 'Γ2 · ο κανόνας #' + L.n + ' δηλώνει check «' + L.check + '» που υπάρχει στη διασταύρωση');
  if (!C) return;

  var src = entryOf(C.base);
  ok(!!src, 'Γ3 · η λέξη-βάση «' + C.base + '» υπάρχει στο ασκησάκι');
  if (!src) return;

  /* η ΥΓΙΗΣ μορφή δεν πρέπει να ενοχλεί τον κανόνα */
  var clean = E.laws({ w: src.w, q: src.q }).join(' | ');
  ok(!C.expect.test(clean),
    'Γ4 · η σωστή «' + src.w + '» ΔΕΝ παραβιάζει τον κανόνα #' + L.n + '  →  ' + clean);

  /* η ΣΠΑΣΜΕΝΗ πρέπει να τον ενεργοποιεί — αλλιώς ο έλεγχος είναι διακοσμητικός */
  var broken = E.restrike(src, C.brk);
  ok(!!broken && broken !== src.w, 'Γ5 · η μετάλλαξη του «' + src.w + '» άλλαξε όντως τη λέξη');
  var got = E.laws({ w: broken, q: src.q }).join(' | ');
  ok(C.expect.test(got),
    'Γ6 · ⭐ ο κανόνας #' + L.n + ' («' + L.check + '») πιάνει τη σπασμένη «' + broken + '»  →  ' + (got || '(τίποτα)'));
  checked++;
});

eq(checked, 6, 'Γ7 · έξι κανόνες διασταυρώθηκαν μηχανικά');
eq(declaredNull, 2, 'Γ8 · δύο κανόνες δηλώνουν ρητά ότι ΔΕΝ ελέγχονται μηχανικά');
eq(F.LAWS8.length, 8, 'Γ9 · οκτώ κανόνες, όσοι και στο φυλλάδιο');

/* ═══ §Δ · Η ΥΠΟΛΟΙΠΗ ΥΛΗ ══════════════════════════════════════════ */
eq(F.ATONA.words.length, 10, 'Δ1 · δέκα άτονες λέξεις, όσες λέει το φυλλάδιο');
F.ATONA.words.forEach(function (w) {
  var a = E.analyze(w);
  ok(a.accIdx === 0, 'Δ2 · η άτονη «' + w + '» δεν έχει τόνο');
  ok(!a.needsBreath || a.breath !== null, 'Δ3 · η άτονη «' + w + '» έχει πνεύμα');
});
eq(F.SYL.length, 3, 'Δ4 · λήγουσα · παραλήγουσα · προπαραλήγουσα');
eq(F.VOWELS.dixrona.join(''), 'αιυ', 'Δ5 · τα δίχρονα είναι α, ι, υ');
eq(F.PTOSEIS.list.length, 5, 'Δ6 · πέντε πτώσεις');

/* κάθε δασυνόμενη ΠΡΕΠΕΙ να φέρει δασεία — αλλιώς η λίστα αυτοαναιρείται */
var dasyN = 0;
F.DASY.groups.forEach(function (g) {
  g.l.forEach(function (w) {
    dasyN++;
    var a = E.analyze(w);
    eq(a.breath, 'δ', 'Δ7 · η δασυνόμενη «' + w + '» φέρει όντως δασεία');
  });
});
ok(dasyN > 60, 'Δ8 · η λίστα δασυνόμενων έχει ουσία (' + dasyN + ' λέξεις)');
ok(F.GAPS.length >= 3, 'Δ9 · τα κενά της μεταγραφής δηλώνονται ρητά (' + F.GAPS.length + ')');

/* ═══ ΑΠΟΤΕΛΕΣΜΑ ══════════════════════════════════════════════════ */
console.log('\ntonos-fyllo: ' + pass + ' πέρασαν, ' + fail + ' έπεσαν  ·  ' +
  F.DRILL.length + ' λέξεις, ' + F.LAWS8.length + ' κανόνες, ' + dasyN + ' δασυνόμενες');
if (fail) { console.log('\n' + notes.slice(0, 40).join('\n')); process.exit(1); }
console.log('ΟΛΑ ΠΡΑΣΙΝΑ');
