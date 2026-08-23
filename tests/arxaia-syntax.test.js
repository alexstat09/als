/* ═══════════════════════════════════════════════════════════════════
   tests/arxaia-syntax.test.js — ΤΟ ΣΥΝΤΑΚΤΙΚΟ ΤΩΝ ΑΡΧΑΙΩΝ

   ⭐ ΓΙΑΤΙ ΥΠΑΡΧΕΙ.
   Η Ιστορία γειώνεται σε curl στο ebooks.edu.gr. Τα Λατινικά κλειδώνονται
   με sha256 σε αρχείο. Το συντακτικό ΔΕΝ έχει ούτε το ένα ούτε το άλλο:
   είναι φωτοτυπία φροντιστηρίου, μεταγραμμένη στο χέρι από φωτογραφία.
   Άρα η εγγύηση είναι αυτή των αρχικών χρόνων — Η ΔΙΠΛΗ ΜΕΤΑΓΡΑΦΗ:

     · `arxaia-syntax-data.js`  = η πρώτη μεταγραφή (η ύλη που διδάσκει)
     · `arxaia-syntax.source.txt` + οι πίνακες εδώ = η ΔΕΥΤΕΡΗ, γραμμένη
       ξανά από την ίδια φωτογραφία, ανεξάρτητα.

   ⛔ ΜΗΝ ΠΑΡΑΓΑΓΕΙΣ ΠΟΤΕ ΤΗ ΔΕΥΤΕΡΗ ΑΠΟ ΤΗΝ ΠΡΩΤΗ. Τότε το τεστ συμφωνεί
   με τον εαυτό του και δεν ελέγχει τίποτα. Το νόημα είναι ακριβώς ότι δύο
   ανεξάρτητα περάσματα πάνω από την ίδια φωτογραφία πρέπει να συμπέσουν.

   ⚠️⚠️ Η ΠΑΓΙΔΑ ΤΟΥ ΠΟΛΥΤΟΝΙΚΟΥ (σταθερή, ήδη μας έχει φάει στα Αρχαία):
   το OXIA (U+1F71 ά) και το TONOS (U+03AC ά) είναι ΟΛΟΙΔΙΑ στην όψη και
   διαφορετικά στη σύγκριση. Ένα `ἀ` χωρίς πνεύμα, ένα ΄ αντί για ᾿, και
   ο τύπος είναι άλλος τύπος. Γι᾿ αυτό: NFC παντού, απαγόρευση OXIA,
   πνεύμα υποχρεωτικό σε κάθε αρχαία λέξη που ξεκινά από φωνήεν.
   ═══════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
let fail = 0, pass = 0;
function ok(cond, msg){ if (cond){ pass++; console.log('  ✓ ' + msg); }
                        else { fail++; console.log('  ✗ ' + msg); } }
function eq(a, b, msg){ ok(a === b, msg + (a === b ? '' : `  (${JSON.stringify(a)} ≠ ${JSON.stringify(b)})`)); }

const D = require(path.join(ROOT, 'arxaia-syntax-data.js'));
const raw = fs.readFileSync(path.join(ROOT, 'arxaia-syntax-data.js'), 'utf8');

console.log('\n── 1. Η ΥΛΗ ΥΠΑΡΧΕΙ ────────────────────────────────────────');
eq(D.UNITS.length, 3, 'τρία κεφάλαια (σελ. 91, 92, 93)');
eq(D.UNITS.map(u => u.page).join(','), '91,92,93', 'οι σελίδες είναι οι σωστές');
eq(D.UNITS.map(u => u.id).join(','), 'syn1,syn2,syn3', 'τα ids είναι σταθερά');

/* ── 2. Η ΔΕΥΤΕΡΗ ΜΕΤΑΓΡΑΦΗ: Η ΠΡΟΖΑ ─────────────────────────────
   Μαζεύουμε ΟΛΑ τα κείμενα της ύλης (`map`) και μόνο αυτά — όχι τους
   δικούς μου διακόπτες, όχι τις ερωτήσεις, όχι τα δικά του χειρόγραφα.
   Ελέγχεται ΤΟ ΦΥΛΛΑΔΙΟ, τίποτε άλλο.                               */
console.log('\n── 2. ΔΙΠΛΗ ΜΕΤΑΓΡΑΦΗ — Η ΠΡΟΖΑ ───────────────────────────');
/* ⚠️ Ο ΣΥΛΛΕΚΤΗΣ ΠΕΡΠΑΤΑΕΙ ΟΛΑ ΤΑ ΣΧΗΜΑΤΑ (δέντρο / αντιπαραβολή / πλάκα
   / σημείωση). Αν προστεθεί σχήμα και ξεχαστεί εδώ, η δεύτερη μεταγραφή
   θα «λείπει» και το τεστ θα κοκκινίσει — που είναι το σωστό: μια ύλη που
   ο συλλέκτης δεν βλέπει είναι ύλη που κανείς δεν ελέγχει. */
function flat(node, out){
  if (node == null) return out;
  if (typeof node === 'string'){ out.push(node); return out; }
  if (Array.isArray(node)){ node.forEach(n => flat(n, out)); return out; }
  ['h','lead','tag','t','tnote','note','text','root','full','name','when','shows','ex','g','v','why','legend']
    .forEach(k => { if (typeof node[k] === 'string') out.push(node[k]); });
  ['groups','items','sub','branches','leaves','cols','rows','sign'].forEach(k => { if (node[k]) flat(node[k], out); });
  if (node.pair) flat(node.pair.why, out);
  return out;
}

const mapText = D.UNITS.map(u => flat(u.map, []).join(' ')).join(' ¶ ')
  .replace(/\s+/g, ' ').normalize('NFC');

const source = fs.readFileSync(path.join(__dirname, 'arxaia-syntax.source.txt'), 'utf8')
  .split('\n').map(s => s.replace(/\s+/g, ' ').trim().normalize('NFC')).filter(Boolean);

eq(source.length, 66, 'η δεύτερη μεταγραφή έχει 66 γραμμές');
let miss = source.filter(line => mapText.indexOf(line) === -1);
ok(miss.length === 0, `και οι 66 γραμμές βρίσκονται αυτούσιες στην ύλη${miss.length ? '\n      ΛΕΙΠΕΙ: ' + miss.join('\n      ΛΕΙΠΕΙ: ') : ''}`);

/* ── 3. Η ΔΕΥΤΕΡΗ ΜΕΤΑΓΡΑΦΗ: Ο ΠΙΝΑΚΑΣ ΤΩΝ ΑΠΡΟΣΩΠΩΝ ─────────────
   Ο πίνακας δεν είναι πρόζα — είναι τρεις στήλες από επτά. Ξαναγράφεται
   εδώ ΑΠΟ ΤΗ ΦΩΤΟΓΡΑΦΙΑ, θέση προς θέση, και πρέπει να ταυτιστεί.       */
console.log('\n── 3. ΔΙΠΛΗ ΜΕΤΑΓΡΑΦΗ — ΤΑ 21 ΑΠΡΟΣΩΠΑ ────────────────────');
const VERBS2 = [
  [ ['ἔστι', ''],
    ['ἔξεστι', 'είναι δυνατόν'],
    ['ἔνεστι ἢ ἔνι', 'είναι στην εξουσία κάποιου'],
    ['μέτεστι', 'κάποιος έχει μερίδιο σε κάτι'],
    ['πάρεστι', 'είναι στο χέρι κάποιου'],
    ['συμβαίνει', ''],
    ['δοκεῖ', 'φαίνεται, αποφασίζεται'] ],
  [ ['προσήκει', 'ταιριάζει, αρμόζει'],
    ['πρέπει', ''],
    ['χρή', 'πρέπει, είναι ανάγκη'],
    ['δεῖ', '-//-'],
    ['μέλει', 'ενδιαφέρει'],
    ['μεταμέλει', 'κάποιος μετανοιώνει'],
    ['μέλλει', 'πρόκειται να…'] ],
  [ ['συμφέρει', ''],
    ['ἀρκεῖ', ''],
    ['ἐξαρκεῖ', ''],
    ['θρυλεῖται', ''],
    ['εἵμαρται', 'είναι καθορισμένο από τη μοίρα'],
    ['πέπρωται', '-//-'],
    ['ὁμολογεῖται', ''] ]
];
const tbl = D.UNITS[1].map.find(m => m.kind === 'verbs');
ok(!!tbl, 'ο πίνακας των απρόσωπων υπάρχει στο κεφάλαιο 2');
eq(tbl.cols.length, 3, 'τρεις στήλες');
tbl.cols.forEach((c, i) => eq(c.length, 7, `η στήλη ${i + 1} έχει 7 ρήματα`));
eq(tbl.cols.reduce((n, c) => n + c.length, 0), 21, 'σύνολο 21 απρόσωπα ρήματα');
let vbad = 0;
VERBS2.forEach((col, i) => col.forEach((pair, j) => {
  const got = (tbl.cols[i] || [])[j] || {};
  if ((got.v || '') !== pair[0] || (got.g || '') !== pair[1]){
    vbad++; console.log(`      ✗ [${i}][${j}] ${JSON.stringify(got)} ≠ ${JSON.stringify(pair)}`);
  }
}));
ok(vbad === 0, 'και τα 21 ρήματα συμφωνούν τύπο-τύπο και σημασία-σημασία');

/* ── 4. Η ΔΕΥΤΕΡΗ ΜΕΤΑΓΡΑΦΗ: ΤΑ π.χ. ─────────────────────────────
   ⛔ Κάθε αρχαία πρόταση της σελίδας πρέπει να είναι ΤΥΠΩΜΕΝΗ στο
   φυλλάδιό του. Καμία εφευρεμένη πρόταση δεν επιτρέπεται να μπει σε
   ερώτηση: θα ήταν λάθος που διδάσκεται σαν αλήθεια.                  */
console.log('\n── 4. ΔΙΠΛΗ ΜΕΤΑΓΡΑΦΗ — ΤΑ ΠΑΡΑΔΕΙΓΜΑΤΑ ───────────────────');
const EX2 = [
  'οἱ ἄριστοι, οἱ ὀλίγοι',
  'τὰ παιδία παίζει',
  'δῆλόν ἐστι',
  'ἄξιόν ἐστι',
  'αἰσχρόν ἐστι',
  'ἀνάγκη ἐστί',
  'καιρός ἐστί',
  'Προσήκει ἡμῖν κολάζειν τοὺς ἀδικοῦντας',
  'ἦσαν τῷ πατρὶ παῖδες δύο',
  'πᾶς ἀνὴρ αὑτῷ πονεῖ',
  'ὡς καλός μοι ὁ πάππος'
];
/* «Τυπωμένο» = η πρόζα ΚΑΙ ο πίνακας των απρόσωπων. Ο πίνακας είναι κι
   αυτός φυλλάδιο — απλώς σε στήλες αντί για παραγράφους. */
const allText = mapText + ' ¶ ' + D.UNITS.map(u => u.map.filter(m => m.kind === 'verbs')
  .map(m => m.cols.map(c => c.map(x => x.v).join(' ')).join(' ')).join(' ')).join(' ');
let exmiss = EX2.filter(e => allText.indexOf(e) === -1);
ok(exmiss.length === 0, `και τα ${EX2.length} π.χ. του φυλλαδίου υπάρχουν στην ύλη${exmiss.length ? '  ΛΕΙΠΕΙ: ' + exmiss.join(' | ') : ''}`);

/* Και το ανάποδο, που είναι το ΕΠΙΚΙΝΔΥΝΟ: καμία αρχαία πρόταση στην
   εξάσκηση που να μην είναι μέσα στο φυλλάδιο. */
let invented = [];
D.UNITS.forEach(u => u.drill.forEach(d => {
  if (d.gr && allText.indexOf(d.gr) === -1 && EX2.indexOf(d.gr) === -1) invented.push(u.id + '/' + d.id + ': ' + d.gr);
}));
ok(invented.length === 0, `καμία εφευρεμένη πρόταση στην εξάσκηση${invented.length ? '\n      ' + invented.join('\n      ') : ''}`);

/* ── 5. ΠΟΛΥΤΟΝΙΚΟ ────────────────────────────────────────────────  */
console.log('\n── 5. ΤΟ ΠΟΛΥΤΟΝΙΚΟ ───────────────────────────────────────');
ok(raw === raw.normalize('NFC'), 'ολόκληρο το αρχείο είναι σε NFC');
const OXIA = /[άέήίόύώ]/;
const oxiaHit = raw.match(OXIA);
ok(!oxiaHit, `κανένα OXIA — μόνο TONOS${oxiaHit ? ' (βρέθηκε U+' + oxiaHit[0].codePointAt(0).toString(16).toUpperCase() + ')' : ''}`);

/* Πνεύμα σε κάθε αρχαία λέξη που αρχίζει από φωνήεν ή ρ. Ελέγχεται ΜΟΝΟ
   στα αρχαία πεδία (τα π.χ. και ο πίνακας) — η νεοελληνική πρόζα του
   φυλλαδίου δεν έχει και δεν πρέπει να έχει πνεύματα. */
const VOWEL = /^[αεηιουωΑΕΗΙΟΥΩρ]/;
const BREATH = /[̓̔ἀ-῿]/;
function needsBreath(w){
  const d = w.normalize('NFD');
  return VOWEL.test(d[0]) && !/[̓̔]/.test(d.slice(0, 3));
}
let ancient = [];
D.UNITS.forEach(u => {
  u.drill.forEach(d => { if (d.gr) ancient.push(d.gr); if (d.mark) ancient.push(d.mark); });
  u.map.forEach(m => { if (m.kind === 'verbs') m.cols.forEach(c => c.forEach(x => ancient.push(x.v))); });
});
let noBreath = [];
ancient.join(' ').split(/[\s,·.;]+/).filter(Boolean).forEach(w => {
  if (needsBreath(w)) noBreath.push(w);
});
ok(noBreath.length === 0, `πνεύμα σε κάθε αρχικό φωνήεν (${ancient.length} αρχαία κείμενα)${noBreath.length ? '  ΧΩΡΙΣ: ' + noBreath.join(', ') : ''}`);

/* ── 6. Η ΜΗΧΑΝΗ ΤΗΣ ΕΞΑΣΚΗΣΗΣ ───────────────────────────────────  */
console.log('\n── 6. Η ΕΞΑΣΚΗΣΗ ──────────────────────────────────────────');
const ids = {};
let dup = 0, badAns = 0, badRule = 0, thin = 0;
D.UNITS.forEach(u => {
  const rules = {}; (u.rules || []).forEach(r => rules[r.id] = 1);
  u.drill.forEach(d => {
    if (ids[d.id]) dup++; ids[d.id] = 1;
    const opts = D.optionsOf(u, d);
    if (opts.indexOf(d.ans) === -1 && opts.indexOf(d.alt) === -1) { badAns++; console.log('      ✗ απάντηση εκτός set: ' + d.id + ' → ' + d.ans); }
    if (opts.length < 2) thin++;
    if (d.rule && !rules[d.rule]) { badRule++; console.log('      ✗ άγνωστος διακόπτης: ' + d.id + ' → ' + d.rule); }
  });
});
eq(dup, 0, 'κανένα διπλό id ερώτησης');
eq(badAns, 0, 'κάθε απάντηση ανήκει στο set της (οι επιλογές είναι ΠΑΝΤΑ τα αδέρφια)');
eq(thin, 0, 'κανένα set με λιγότερες από 2 επιλογές');
eq(badRule, 0, 'κάθε ερώτηση δείχνει σε υπαρκτό διακόπτη');
eq(D.totalDrill(), 48, '48 ερωτήσεις συνολικά');
D.UNITS.forEach(u => ok(u.drill.length >= 14, `το κεφάλαιο ${u.n} έχει ${u.drill.length} ερωτήσεις`));

/* ⛔ ΤΑ ΔΙΚΑ ΤΟΥ ΧΕΙΡΟΓΡΑΦΑ ΔΕΝ ΡΩΤΙΟΥΝΤΑΙ ΠΟΤΕ.
   Μια σημείωση στο περιθώριο δεν είναι ύλη, και αν την αντιμετωπίσουμε
   σαν ύλη τον βαθμολογούμε πάνω σε κάτι που έγραψε ο ίδιος. */
let mineLeak = [];
D.UNITS.forEach(u => (u.mine || []).forEach(m => {
  u.drill.forEach(d => {
    if (d.q === m || d.ans === m || d.gr === m) mineLeak.push(u.id + '/' + d.id);
  });
}));
eq(mineLeak.length, 0, 'καμία χειρόγραφη σημείωσή του δεν ρωτιέται');

/* ── 7. Η ΟΥΡΑ — «ΔΥΟ ΣΩΣΤΑ ΣΤΗ ΣΕΙΡΑ ΚΑΙ ΦΕΥΓΕΙ» ────────────────
   Σταθερά 43: «το έχω» ≠ «μου ζητείται τώρα». Στην Έκθεση αυτό ακριβώς
   έφτιαξε ατέρμονο βρόχο. Εδώ το κλειδώνουμε.                          */
console.log('\n── 7. Η ΟΥΡΑ ──────────────────────────────────────────────');
const u3 = D.unit('syn3');
eq(D.queueOf(u3, {}).length, u3.drill.length, 'με άδεια πρόοδο, όλα στην ουρά');
eq(D.clearedOf(u3, {}), 0, 'με άδεια πρόοδο, τίποτα δεν έχει φύγει');
const st1 = {}; st1[u3.drill[0].id] = 1;
eq(D.queueOf(u3, st1).length, u3.drill.length, 'ΕΝΑ σωστό ΔΕΝ το βγάζει από την ουρά');
const st2 = {}; st2[u3.drill[0].id] = 2;
eq(D.queueOf(u3, st2).length, u3.drill.length - 1, 'ΔΥΟ σωστά στη σειρά το βγάζουν');
eq(D.clearedOf(u3, st2), 1, 'και μετριέται ως «έφυγε»');
const stAll = {}; u3.drill.forEach(d => stAll[d.id] = 2);
eq(D.queueOf(u3, stAll).length, 0, 'όταν φύγουν όλα, η ουρά αδειάζει (δεν ξαναγεμίζει μόνη της)');
eq(D.unit('δεν-υπάρχει'), null, 'άγνωστο κεφάλαιο επιστρέφει null, δεν σκάει');

/* ── 8. ΤΑ ΚΕΝΑ ΦΑΙΝΟΝΤΑΙ ────────────────────────────────────────
   Σταθερή αρχή 10: ένα κενό που φαίνεται είναι σωστό· ένα κενό που
   μοιάζει με ύλη είναι λάθος. Ό,τι δεν διάβασα δηλώνεται.              */
console.log('\n── 8. ΤΑ ΚΕΝΑ ─────────────────────────────────────────────');
D.UNITS.forEach(u => ok(Array.isArray(u.gaps), `το κεφάλαιο ${u.n} δηλώνει τα κενά του (${u.gaps.length})`));
ok(D.UNITS.some(u => u.gaps.length > 0), 'τα κενά που ξέρω ότι υπάρχουν είναι γραμμένα, όχι σιωπηλά');

console.log(`\n${fail ? '✗' : '✓'} arxaia-syntax: ${pass} πέρασαν, ${fail} έπεσαν\n`);
process.exit(fail ? 1 : 0);
