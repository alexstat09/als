/* ══════════════════════════════════════════════════════════════════════
   tests/ladders.test.js — ΤΑ ΤΕΣΣΕΡΑ ΣΧΗΜΑΤΑ, ΚΑΙ Η ΑΠΟΔΕΙΞΗ ΟΤΙ ΤΟ
   REFACTOR ΔΕΝ ΑΛΛΑΞΕ ΟΥΤΕ ΕΝΑ ΝΟΥΜΕΡΟ ΣΤΟ HOME.

   Δύο δουλειές, και η δεύτερη είναι ο λόγος που υπάρχει το αρχείο:

   1 · ΤΟ ΣΧΗΜΑ. Οι πέντε αποθήκες μελέτης έχουν ΤΕΣΣΕΡΑ διαφορετικά σχήματα
       και ένας αφελής αναγνώστης γυρίζει ΣΙΩΠΗΛΟ ΜΗΔΕΝ για τουλάχιστον δύο.
       ⭐ Τα fixtures εδώ είναι ΧΕΙΡΟΓΡΑΦΑ, ποτέ παραγόμενα από τον αναγνώστη:
       ένα fixture βγαλμένο από τον κώδικα που ελέγχει συμφωνεί τέλεια με κάθε
       bug του (το μάθημα του `-erint`/`-erunt`).
       Συμπεριλαμβάνεται ο ΠΑΛΙΟΣ ΠΙΝΑΚΑΣ του `arx:v1` — το σχήμα άλλαξε στην
       als-v458 και τα δύο ζουν ακόμη σε συσκευές.

   2 · Η ΤΑΥΤΟΤΗΤΑ. Τα τέσσερα πλακίδια μελέτης του Home συγκρίνονται με την
       ΤΕΛΕΥΤΑΙΑ ΑΝΑΘΕΩΡΗΣΗ ΠΟΥ ΕΙΧΕ ΤΟΥΣ ΠΑΛΙΟΥΣ ΑΝΑΓΝΩΣΤΕΣ, πάνω στα ΙΔΙΑ
       δεδομένα. Ένα refactor που αλλάζει σιωπηλά μια τιμή που ήδη βγαίνει στην
       οθόνη είναι regression με ρούχα καθαρίσματος, και καμία πράσινη βεβαίωση
       δεν το βλέπει.
       ⚠️ ΟΧΙ ΤΟ `HEAD`. Η πρώτη γραφή διάβαζε `git show HEAD:home-live.js` και
       κοκκίνισε τη στιγμή που έγινε commit το refactor: το «πριν» γίνεται το
       «μετά» και η απόδειξη συγκρίνει τον κώδικα με τον εαυτό του. Η αναφορά
       βρίσκεται μόνη της, ώστε ένα rebase να μην τη σκοτώσει σιωπηλά.
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const ALS = path.join(__dirname, '..');

let pass = 0, fail = 0;
function is(name, got, want) {
  const good = JSON.stringify(got) === JSON.stringify(want);
  good ? pass++ : fail++;
  console.log((good ? '  ✓ ' : '  ✗ FAIL ') + name + (good ? '' : `\n      got  ${JSON.stringify(got)}\n      want ${JSON.stringify(want)}`));
}
function ok(name, cond) { is(name, !!cond, true); }
function section(s) { console.log('\n' + s); }

const SRC = fs.readFileSync(path.join(ALS, 'ladders.js'), 'utf8');
const L = require(path.join(ALS, 'ladders.js'));

/* ── 0 · σταθερή αρχή 25 + 16: δεν εξαρτάται από κανέναν, δεν γράφει ── */
section('0 · what the file is allowed to touch');
ok('ladders.js requires nothing (no require cycle can be made from it)', !/\brequire\s*\(/.test(SRC));
/* ⚠️ Η βελόνα είναι η ΚΛΗΣΗ, όχι η λέξη (σταθερή αρχή 19). Ένα σκέτο
   `/setItem/` πιάνει το σχόλιο που τεκμηριώνει τον ίδιο τον κανόνα — και ένας
   φρουρός που φωνάζει «λύκος» είναι ένας φρουρός που κάποιος θα χαλαρώσει. */
ok('ladders.js never writes a store (σταθερή αρχή 16)', !/\.(setItem|removeItem)\s*\(/.test(SRC));
ok('ladders.js touches no DOM', !/\bdocument\b/.test(SRC));
ok('it still exports the six stores', L.STORES.length === 6);
is('the six keys, in a fixed order', L.STORES.map(s => s.key),
  ['ist:v1', 'arx:gn', 'arx:v1', 'lat:v1', 'ton:v1', 'ekt:v1']);

/* ── 1 · ΤΑ ΤΕΣΣΕΡΑ ΣΧΗΜΑΤΑ, ΧΕΙΡΟΓΡΑΦΑ ────────────────────────────────
   Κάθε ένα γράφτηκε κοιτώντας τη ΣΕΛΙΔΑ που το παράγει, όχι τον αναγνώστη:
     lat:v1  latinika.html:338   ΠΙΝΑΚΑΣ  {id, r, w, box, due, ts}
     ton:v1  tonos.html:419      ΧΑΡΤΗΣ   {r, w, due, streak}
     arx:v1  arxaia.html:774/782 pages ΧΑΡΤΗΣ + cells ΧΑΡΤΗΣ (πρώην ΠΙΝΑΚΑΣ)
     ist:v1  istoria.html:467/493 units ΧΑΡΤΗΣ + els ΧΑΡΤΗΣ `unitId:pi:ei`
     arx:gn  arxaia.html:1519/1525 ίδιο σχήμα με το ist:v1
     ekt:v1  ekthesi.html          words ΧΑΡΤΗΣ + els ΧΑΡΤΗΣ `cardId:groupId:i` */
const NOW = Date.parse('2026-08-11T12:00:00Z');
const DAY = 86400000;
const LATE = NOW - 2 * DAY;      // έληξε προχθές
const SOON = NOW + 5 * DAY;      // δεν έληξε

const FIX = {
  'lat:v1': {                                     /* ΠΙΝΑΚΑΣ */
    v: 1,
    cells: [
      { id: 'n3:gen:pl', r: 7, w: 3, box: 2, due: LATE, ts: 1 },
      { id: 'v2:pf:1sg', r: 4, w: 0, box: 4, due: SOON, ts: 2 },
      { id: 'a1:abl:sg', r: 0, w: 0, box: 0, due: 0, ts: 0 }      /* άθικτο */
    ],
    days: []
  },
  'ton:v1': {                                     /* ΧΑΡΤΗΣ */
    v: 1,
    cells: {
      'dasia': { r: 5, w: 5, due: LATE, streak: 0 },
      'difthongoi': { r: 9, w: 1, due: SOON, streak: 3 },
      'egklisi': { r: 0, w: 0, due: 0, streak: 0 }                /* άθικτο */
    },
    days: []
  },
  'arx:v1': {                                     /* pages ΧΑΡΤΗΣ + cells ΧΑΡΤΗΣ */
    v: 2,
    pages: { p1: { learnedAt: NOW - 30 * DAY, reviews: 2, due: LATE, best: 0.8, last: NOW - 3 * DAY, runs: 4, claimed: 0 } },
    cells: { 'ago:act:aor': { r: 3, w: 1 }, 'aggello:mid:pf': { r: 2, w: 2 } },
    days: [], heard: {}
  },
  'ist:v1': {                                     /* units ΧΑΡΤΗΣ + els ΧΑΡΤΗΣ */
    v: 1,
    units: {
      a1a: { learnedAt: NOW - 40 * DAY, reviews: 3, due: LATE, best: 0.95, last: NOW - 10 * DAY, runs: 5, claimed: 0 },
      b1b: { learnedAt: NOW - 9 * DAY, reviews: 1, due: SOON, best: 0.92, last: NOW - 9 * DAY, runs: 1, claimed: 0 },
      b2: { learnedAt: 0, reviews: 0, due: 0, best: 0, last: 0, runs: 0, claimed: 0 }  /* άθικτο */
    },
    els: {
      'a1a:0:0': { r: 9, w: 1 }, 'a1a:0:1': { r: 8, w: 2 },
      'b1b:1:0': { r: 5, w: 0 }
    },
    days: [], heard: {}
  },
  'arx:gn': {                                     /* ίδια οικογένεια με ist:v1 */
    v: 1,
    units: { gn1: { learnedAt: NOW - 6 * DAY, reviews: 1, due: SOON, best: 0.91, last: NOW - 6 * DAY, runs: 2, claimed: 0 } },
    els: { 'gn1:0:0': { r: 6, w: 4 } },
    days: [], heard: {}
  },
  /* ⭐ als-v495 · Η ΕΚΘΕΣΗ. Η μονάδα είναι το ΛΗΜΜΑ, τα κλειδιά ακρίβειας
     είναι `cardId:groupId:index` — δηλαδή το `groupId` είναι ΛΕΞΗ ('syn',
     'ant'), όχι αριθμός όπως στο ist:v1. Ο αναγνώστης δεν επιτρέπεται να
     υποθέσει αριθμό εκεί μέσα.
     ⚠️ Το `p547-athlos` είναι ΑΘΙΚΤΟ επίτηδες: ένα λήμμα που δεν το άγγιξε
     ποτέ δεν χρωστάει, και ένας αφελής αναγνώστης το μετράει ληξιπρόθεσμο
     επειδή `due: 0 <= now`. */
  'ekt:v1': {                                     /* words ΧΑΡΤΗΣ + els ΧΑΡΤΗΣ */
    v: 1,
    words: {
      'p547-adais':   { learnedAt: NOW - 12 * DAY, reviews: 2, due: LATE, best: 0.86, last: NOW - 4 * DAY, runs: 3 },
      'p547-adolos':  { learnedAt: NOW - 3 * DAY,  reviews: 1, due: SOON, best: 1,    last: NOW - 3 * DAY, runs: 1 },
      'p547-athlos':  { learnedAt: 0, reviews: 0, due: 0, best: 0, last: 0, runs: 0 }   /* άθικτο */
    },
    els: {
      'p547-adais:syn:0': { r: 4, w: 0 }, 'p547-adais:syn:1': { r: 2, w: 2 },
      'p547-adais:ant:0': { r: 3, w: 1 }, 'p547-adolos:syn:0': { r: 5, w: 0 }
    },
    sessions: []
  }
};
const getFix = k => (k in FIX ? JSON.stringify(FIX[k]) : null);

section('1 · every shape is read, and none returns a silent zero');
const R = L.read({ get: getFix, now: NOW });
L.STORES.forEach(s => {
  const st = R.byKey[s.key];
  ok(s.key + ' was read', st.ok === true);
  ok(s.key + ' produced rows (a naive reader returns 0 here)', st.items.length > 0);
});

is('lat:v1 — ΠΙΝΑΚΑΣ: 11 σωστά / 3 λάθη', [R.byKey['lat:v1'].right, R.byKey['lat:v1'].wrong], [11, 3]);
/* ⭐ Η Έκθεση: 14 σωστά / 3 λάθη στα ΣΤΟΙΧΕΙΑ (τα κλειδιά τους έχουν ΛΕΞΗ
   στη μέση, `p547-adais:syn:0`, όχι αριθμό — ένας αναγνώστης που περιμένει
   αριθμό γυρίζει σιωπηλά μηδέν εδώ). */
is('ekt:v1 — η ακρίβεια ζει στα els, η σκάλα στα words',
   [R.byKey['ekt:v1'].right, R.byKey['ekt:v1'].wrong], [14, 3]);
/* ⚠️⚠️ ΑΘΙΚΤΟ ≠ ΛΗΞΙΠΡΟΘΕΣΜΟ, ΚΑΙ ΕΔΩ ΕΙΝΑΙ ΕΥΚΟΛΟ ΝΑ ΣΠΑΣΕΙ: η ekthesi.html
   γεννάει κέλυφος `{learnedAt:0, due:0}` για ΚΑΘΕ λήμμα μόλις ζωγραφίσει τον
   χάρτη, άρα και τα 16 υπάρχουν στην αποθήκη από το πρώτο άνοιγμα. Αν ποτέ
   γράψει `due` σε λήμμα που δεν μαθεύτηκε, το School Studies θα του χρωστάει
   16 λέξεις που δεν είδε ποτέ. */
is('ekt:v1 — 3 εγγραφές, 2 μαθεμένες, 1 άθικτη, 1 ληξιπρόθεσμη',
   [R.byKey['ekt:v1'].items.length, R.byKey['ekt:v1'].learned,
    R.byKey['ekt:v1'].untouched, R.byKey['ekt:v1'].overdue], [3, 2, 1, 1]);
is('ton:v1 — ΧΑΡΤΗΣ: 14 σωστά / 6 λάθη', [R.byKey['ton:v1'].right, R.byKey['ton:v1'].wrong], [14, 6]);
is('arx:v1 — η ακρίβεια ζει στα cells, η σκάλα στα pages', [R.byKey['arx:v1'].right, R.byKey['arx:v1'].wrong, R.byKey['arx:v1'].items.length], [5, 3, 1]);
is('ist:v1 — η ακρίβεια ζει στα els, ανά ενότητα με πρόθεμα', [R.byKey['ist:v1'].right, R.byKey['ist:v1'].wrong], [22, 3]);
is('arx:gn — units + els, όπως το ist:v1', [R.byKey['arx:gn'].right, R.byKey['arx:gn'].wrong], [6, 4]);

section('1b · ένα άθικτο κελί ΔΕΝ είναι ληξιπρόθεσμο');
/* Και οι δύο σελίδες κελιών προσπερνούν τα άθικτα ΠΡΙΝ κοιτάξουν το due
   (`if (!t) continue;` — tonos.html:669, latinika.html:867). Αν ο αναγνώστης
   δεν το κάνει, ο Τονισμός γεννάει ΟΛΑ τα κελιά με due:0 στο blank() και η
   σελίδα θα έλεγε «40 έληξαν» την πρώτη μέρα. */
is('lat:v1 — 1 ληξιπρόθεσμο, 1 άθικτο', [R.byKey['lat:v1'].overdue, R.byKey['lat:v1'].untouched], [1, 1]);
is('ton:v1 — 1 ληξιπρόθεσμο, 1 άθικτο', [R.byKey['ton:v1'].overdue, R.byKey['ton:v1'].untouched], [1, 1]);
is('ist:v1 — 1 ληξιπρόθεσμο, 2 μαθημένα, 1 άθικτο', [R.byKey['ist:v1'].overdue, R.byKey['ist:v1'].learned, R.byKey['ist:v1'].untouched], [1, 2, 1]);
is('arx:gn — τίποτα δεν έληξε ακόμη', R.byKey['arx:gn'].overdue, 0);
is('η επόμενη λήξη είναι η πραγματική, όχι η ληξιπρόθεσμη', R.byKey['ist:v1'].nextDue, SOON);

section('1c · η ακρίβεια είναι ΑΝΑ ΕΝΟΤΗΤΑ, με πρόθεμα κλειδιού');
const a1a = R.byKey['ist:v1'].items.filter(i => i.unitId === 'a1a')[0];
is('a1a → 17/20 από δύο els', [a1a.samples, Math.round(a1a.accuracy * 100)], [20, 85]);
const b2 = R.byKey['ist:v1'].items.filter(i => i.unitId === 'b2')[0];
is('μια ενότητα χωρίς μέτρηση έχει accuracy null, ΠΟΤΕ 0', b2.accuracy, null);
const p1 = R.byKey['arx:v1'].items[0];
is('arx:v1 — τα cells είναι ΡΗΜΑΤΑ, όχι σελίδες: accuracy null ανά γραμμή', p1.accuracy, null);

/* ── 2 · ΤΟ ΠΑΛΙΟ ΣΧΗΜΑ ΤΟΥ arx:v1 (ΠΙΝΑΚΑΣ, ως την als-v458) ────────── */
section('2 · the legacy arx:v1 ARRAY still counts (als-v458)');
const LEGACY = {
  'arx:v1': {
    v: 1,
    pages: { p1: { learnedAt: NOW - 30 * DAY, reviews: 1, due: LATE, best: 0.7, last: 1, runs: 1, claimed: 0 } },
    cells: [{ r: 3, w: 1 }, { r: 2, w: 2 }],           /* ΠΙΝΑΚΑΣ, χωρίς id */
    days: []
  }
};
const RL = L.read({ get: k => (k in LEGACY ? JSON.stringify(LEGACY[k]) : null), now: NOW });
is('legacy ARRAY cells give the same 5/3 as the map', [RL.byKey['arx:v1'].right, RL.byKey['arx:v1'].wrong], [5, 3]);
is('and the ladder still reads from pages', RL.byKey['arx:v1'].overdue, 1);

/* ── 3 · ΑΔΙΑΒΑΣΤΗ ≠ ΑΔΕΙΑ ≠ ΜΗΔΕΝ (σταθερή αρχή 10) ────────────────── */
section('3 · unreadable, empty and zero are three different answers');
const RBAD = L.read({ get: k => (k === 'lat:v1' ? '{not json' : null), now: NOW });
is('σπασμένο JSON → ok:false, ΟΧΙ μηδέν', [RBAD.byKey['lat:v1'].ok, RBAD.byKey['lat:v1'].why], [false, 'parse']);
is('απούσα αποθήκη → ok:true, started:false', [RBAD.byKey['ist:v1'].ok, RBAD.byKey['ist:v1'].started], [true, false]);
const RTHROW = L.read({ get: () => { throw new Error('SecurityError'); }, now: NOW });
ok('ένα getItem που πετάει (Safari private) → ok:false παντού', RTHROW.stores.every(s => s.ok === false));
ok('και δεν παράγει ούτε μία γραμμή χρέους', RTHROW.items.length === 0);
const RSHAPE = L.read({ get: () => '[]', now: NOW });
is('ένας πίνακας εκεί που περιμέναμε αντικείμενο → ok:false', RSHAPE.byKey['ton:v1'].ok, false);

/* ── 4 · οι ημερολογιακές μέρες, όχι οι ώρες που πέρασαν ────────────── */
section('4 · daysLate counts CALENDAR days (the relDay lesson)');
const noon = Date.parse('2026-08-11T12:00:00');
const lastNight = Date.parse('2026-08-10T23:00:00');
is('χθες βράδυ → 1 μέρα, όχι 0 και όχι 1.5', L.daysLate(lastNight, noon), 1);
is('σήμερα το πρωί → 0', L.daysLate(Date.parse('2026-08-11T08:00:00'), noon), 0);

/* ══════════════════════════════════════════════════════════════════════
   4b · ΤΟ ΣΥΜΒΟΛΑΙΟ — οι συνεδρίες (als-v471)

   ⭐ ΤΑ FIXTURES ΕΙΝΑΙ ΧΕΙΡΟΓΡΑΦΑ ΚΑΙ ΟΙ ΑΝΑΜΕΝΟΜΕΝΕΣ ΤΙΜΕΣ ΥΠΟΛΟΓΙΣΜΕΝΕΣ
   ΣΤΟ ΧΕΡΙ. Μια διάμεσος βγαλμένη από τον ίδιο τον `median()` συμφωνεί με
   κάθε bug του τέλεια — το μάθημα του `-erint`/`-erunt`.

   ⚠️ Οι ώρες γράφονται ΧΩΡΙΣ `Z`, δηλαδή ΤΟΠΙΚΕΣ, γιατί το `byHour` μετράει
   τη δική ΤΟΥ ώρα («μετά τις 22:00»). Με `Z` το test θα περνούσε στην Αθήνα
   και θα κοκκίνιζε σε UTC runner — μια βεβαίωση που εξαρτάται από τη ζώνη
   της μηχανής είναι βεβαίωση για τη μηχανή.
   ══════════════════════════════════════════════════════════════════════ */
section('4b · sessions: the contract, read');

const MIN = 60000;
const at = s => Date.parse('2026-08-' + s);        /* τοπική ώρα, επίτηδες */

/* Τονισμός — τέσσερις τελειωμένες, δύο παρατημένες.
   ΣΤΟ ΧΕΡΙ: τελειωμένες = 6′ 10′ 8′ 20′ → ταξινομημένες 6 8 10 20 →
   διάμεσος (8+10)/2 = 9′.  Στις 09:00 τρεις τελειωμένες: 6 10 8 → 8′.
   Στις 23:00 τρεις συνεδρίες αλλά ΜΙΑ τελειωμένη → καμία διάμεσος. */
const SESS_TON = [
  { id: 's1', ts: at('05T09:20:00'), ms:  6 * MIN, unit: '',       mode: 'drill', asked: 12, right: 12, pass: 1, fin: 1 },
  { id: 's2', ts: at('06T09:40:00'), ms: 10 * MIN, unit: '',       mode: 'drill', asked: 12, right: 10, pass: 0, fin: 1 },
  { id: 's3', ts: at('07T09:10:00'), ms:  8 * MIN, unit: 'spirit', mode: 'drill', asked: 10, right:  9, pass: 0, fin: 1 },
  { id: 's4', ts: at('08T23:05:00'), ms: 20 * MIN, unit: '',       mode: 'drill', asked: 12, right:  6, pass: 0, fin: 1 },
  { id: 's5', ts: at('09T23:30:00'), ms:  2 * MIN, unit: '',       mode: 'drill', asked:  3, right:  1, pass: 0, fin: 0 },
  { id: 's6', ts: at('10T23:50:00'), ms:  1 * MIN, unit: 'spos',   mode: 'drill', asked:  1, right:  0, pass: 0, fin: 0 }
];
/* Ιστορία — ΔΥΟ τελειωμένες ανακλήσεις (κάτω από το κατώφλι) και μία
   παρατημένη διδασκαλία. Και τα δύο modes ΠΡΕΠΕΙ να εμφανίζονται με `null`:
   «δεν το έχει ξανακάνει» και «το έχει κάνει, δεν φτάνουν τα δείγματα»
   είναι δύο διαφορετικές προτάσεις. */
const SESS_IST = [
  { id: 'r2', ts: at('07T11:30:00'), ms: 22 * MIN, unit: 'a1a', mode: 'recall', asked: 30, right: 27, pass: 1, fin: 1 },
  { id: 'r1', ts: at('06T11:00:00'), ms: 18 * MIN, unit: 'a1a', mode: 'recall', asked: 30, right: 21, pass: 0, fin: 1 },
  { id: 'r3', ts: at('08T11:10:00'), ms:  4 * MIN, unit: 'b1b', mode: 'lesson', asked:  5, right:  4, pass: 0, fin: 0 }
];

const withSess = Object.keys(FIX).reduce((o, k) => (o[k] = JSON.parse(JSON.stringify(FIX[k])), o), {});
withSess['ton:v1'].sessions = SESS_TON;
withSess['ist:v1'].sessions = SESS_IST;
const RS = L.read({ get: k => (k in withSess ? JSON.stringify(withSess[k]) : null), now: NOW });

is('ton:v1 — και οι έξι διαβάστηκαν', RS.byKey['ton:v1'].sessions.length, 6);
is('η ΔΙΑΜΕΣΟΣ των ΤΕΛΕΙΩΜΕΝΩΝ, σε λεπτά (χειρόγραφο: 6·8·10·20 → 9)',
  RS.byKey['ton:v1'].typical.drill, 9);
is('και σε ms, γιατί το «έχω 20 λεπτά» φιλτράρει σε ms',
  RS.byKey['ton:v1'].typicalMs.drill, 9 * MIN);

section('4b.1 · μια παρατημένη ΔΕΝ μετράει για το «πόσο κρατάει»');
/* Οι δύο εγκαταλείψεις είναι 2′ και 1′. Αν μετρούσαν, η διάμεσος θα ήταν
   (6+8)/2 = 7′ και τα chips θα του υπόσχονταν χρόνο που δεν υπάρχει. */
ok('η διάμεσος δεν είναι η διάμεσος ΟΛΩΝ (που θα ήταν 7′)',
  RS.byKey['ton:v1'].typical.drill !== 7);
is('αλλά η εγκατάλειψη ΜΕΤΡΙΕΤΑΙ — τις τελευταίες 6, οι 2 παρατήθηκαν',
  RS.byKey['ton:v1'].abandoned, { of: 6, count: 2 });
is('το παράθυρο είναι δηλωμένο, όχι μαντεμένο', L.ABANDON_WINDOW, 10);

section('4b.2 · κάτω από τρία δείγματα δεν λέγεται «συνήθως»');
is('δύο τελειωμένες ανακλήσεις → null, ΠΟΤΕ ο μέσος όρος τους',
  RS.byKey['ist:v1'].typical.recall, null);
ok('αλλά το mode ΥΠΑΡΧΕΙ ως κλειδί — «το έχει κάνει» ≠ «δεν το ξέρω»',
  'recall' in RS.byKey['ist:v1'].typical);
is('ένα mode που δεν τελείωσε ποτέ → κλειδί με null, όχι μηδέν',
  RS.byKey['ist:v1'].typical.lesson, null);
ok('ένα mode που δεν έχει ξαναγίνει δεν έχει καν κλειδί',
  !('drill' in RS.byKey['ist:v1'].typical));
is('το κατώφλι είναι δηλωμένο', L.MIN_SAMPLES, 3);

section('4b.3 · η ώρα είναι ΤΟΠΙΚΗ, και οι μετρήσεις ωμές');
const H = RS.byKey['ton:v1'].byHour;
is('στις 09:00 τρεις συνεδρίες, όλες τελειωμένες', [H[9].n, H[9].done], [3, 3]);
is('διάμεσος 09:00 (χειρόγραφο: 6·10·8 → 8′)', H[9].ms, 8 * MIN);
is('στις 23:00 τρεις συνεδρίες, ΜΙΑ τελειωμένη', [H[23].n, H[23].done], [3, 1]);
is('άρα καμία διάμεσος εκεί — ένα δείγμα δεν είναι συνήθεια', H[23].ms, null);
is('η ακρίβεια των 09:00 είναι 31/34, όχι στρογγυλεμένη σε ποσοστό',
  [H[9].right, H[9].asked], [31, 34]);
is('μια ώρα που δεν άγγιξε ποτέ έχει accuracy null, ΠΟΤΕ 0', H[3].accuracy, null);
is('και οι 24 γραμμές υπάρχουν πάντα', H.length, 24);

section('4b.4 · η σειρά μπαίνει ΕΔΩ (το mergeArray δεν ταξινομεί)');
/* Το `mergeArray` γεμίζει έναν χάρτη με τα remote και γράφει από πάνω τα
   local: η σειρά εξόδου είναι σειρά χάρτη. Το fixture της Ιστορίας είναι
   γραμμένο ανάποδα επίτηδες. */
is('οι συνεδρίες βγαίνουν ΑΥΞΟΥΣΑ κατά ts',
  RS.byKey['ist:v1'].sessions.map(s => s.id), ['r1', 'r2', 'r3']);
is('και το ενιαίο ρεύμα όλων των αποθηκών επίσης',
  RS.sessions.map(s => s.id), ['s1', 's2', 'r1', 's3', 'r2', 'r3', 's4', 's5', 's6']);
ok('κάθε συνεδρία ξέρει από ποια αποθήκη ήρθε',
  RS.sessions.every(s => !!s.store && !!s.page && !!s.subject));

section('4b.5 · απόν ≠ σπασμένο ≠ άδειο (σταθερή αρχή 10, ξανά)');
is('μια αποθήκη που δεν αναφέρει ακόμη → [] και sessionsOk:true',
  [RS.byKey['lat:v1'].sessions.length, RS.byKey['lat:v1'].sessionsOk], [0, true]);
is('και ΚΑΝΕΝΑ παράγωγο — null, ποτέ 0',
  [RS.byKey['lat:v1'].typical, RS.byKey['lat:v1'].byHour, RS.byKey['lat:v1'].abandoned],
  [null, null, null]);
const RBROKE = L.read({
  get: k => k === 'ton:v1' ? JSON.stringify({ v: 1, cells: {}, days: [], sessions: { s1: {} } }) : null,
  now: NOW
});
is('λάθος σχήμα → sessionsOk:false, και η σκάλα διαβάζεται κανονικά',
  [RBROKE.byKey['ton:v1'].sessionsOk, RBROKE.byKey['ton:v1'].ok], [false, true]);

section('4b.6 · μια χαλασμένη εγγραφή πέφτει, και ΦΑΙΝΕΤΑΙ ότι έπεσε');
const RJUNK = L.read({
  get: k => k === 'ton:v1' ? JSON.stringify({
    v: 1, cells: {}, days: [], sessions: [
      SESS_TON[0],
      7,                                                                  /* όχι αντικείμενο */
      { id: 'b1', ts: 0, ms: 5 * MIN, asked: 1, right: 0 },               /* ts άκυρο */
      { id: 'b2', ts: at('05T10:00:00'), ms: 'πολύ', asked: 1, right: 0 },/* ms άκυρο */
      { id: 'b3', ts: at('05T10:00:00'), ms: 5 * MIN, right: 0 },         /* asked απόν */
      { id: 'b4', ts: at('05T10:00:00'), ms: -1, asked: 1, right: 0 }     /* αρνητικό */
    ]
  }) : null,
  now: NOW
});
is('πέντε χαλασμένες φεύγουν, η μία καλή μένει',
  [RJUNK.byKey['ton:v1'].sessions.length, RJUNK.byKey['ton:v1'].sessionsDropped], [1, 5]);
ok('ένα bug του γραφέα δεν κρύβεται πίσω από ένα σιωπηλό μηδέν',
  RJUNK.byKey['ton:v1'].sessionsDropped > 0);

/* ══════════════════════════════════════════════════════════════════════
   5 · Η ΑΠΟΔΕΙΞΗ ΤΗΣ ΤΑΥΤΟΤΗΤΑΣ — τα τέσσερα πλακίδια του Home
   ══════════════════════════════════════════════════════════════════════ */
section('5 · Home\'s study tiles are byte-identical to git show HEAD:');

const START = 'function ls(k, d)';
const END = '/* ── paint one tile';

/* Το metric() είναι κομμάτι ενός DOM-δεμένου IIFE που δεν εξάγει τίποτα, άρα
   κόβεται. Οι δείκτες ελέγχονται ώστε ένα refactor να σκάει ΕΔΩ, δυνατά,
   αντί να ελέγχει σιωπηλά το τίποτα. */
function sliceMetric(src, win, data, todayKey) {
  ok('the slice markers still exist', src.indexOf(START) > -1 && src.indexOf(END) > src.indexOf(START));
  const RealDate = Date;
  const PIN = new RealDate(todayKey + 'T09:00:00');
  class PinnedDate extends RealDate {
    constructor(...a) { if (a.length === 0) super(PIN.getTime()); else super(...a); }
    static now() { return PIN.getTime(); }
  }
  /* metric() καταπίνει τα δικά του σφάλματα — αυτή ακριβώς η αδιαφάνεια έκρυψε
     το als-v433 — οπότε μέσα στο harness ξαναπετάγονται. */
  const body = src.slice(src.indexOf(START), src.indexOf(END))
    .replace('    } catch (e) { }\n    return null;', '    } catch (e) { throw e; }\n    return null;');
  const make = new Function('window', 'localStorage', 'Date', body + '\nreturn { metric: metric };');
  return make(win, { getItem: k => (k in data ? data[k] : null) }, PinnedDate);
}

const TODAY = '2026-08-11';
/* Το ίδιο ΑΚΡΙΒΩΣ σύνολο δεδομένων και στις δύο εκδόσεις, σε ΤΡΕΙΣ σκηνές:
   γεμάτο, άδειο, και το παλιό σχήμα του arx:v1. */
const SCENES = {
  'full': Object.keys(FIX).reduce((o, k) => (o[k] = JSON.stringify(FIX[k]), o), {}),
  'empty': {},
  'legacy arx:v1 array': Object.assign(
    Object.keys(FIX).reduce((o, k) => (o[k] = JSON.stringify(FIX[k]), o), {}),
    { 'arx:v1': JSON.stringify(LEGACY['arx:v1']) }),
  /* ⭐ Η als-v471 προσθέτει ένα πεδίο ΜΕΣΑ σε αποθήκες που ήδη ζωγραφίζουν
     πλακίδια στο Home. Ό,τι είναι «καθαρά προσθετικό» αποδεικνύεται, δεν
     δηλώνεται: ΙΔΙΑ δεδομένα συν τις συνεδρίες, ίδια τέσσερα νούμερα. */
  'with sessions': Object.keys(withSess).reduce((o, k) => (o[k] = JSON.stringify(withSess[k]), o), {})
};
const STUDY_TILES = ['latinika.html', 'tonos.html', 'istoria.html', 'arxaia.html'];

/* ⚠️⚠️ Η ΠΡΩΤΗ ΓΡΑΦΗ ΑΥΤΟΥ ΕΔΕΙΧΝΕ ΣΤΟ `HEAD`, ΚΑΙ ΚΟΚΚΙΝΙΣΕ ΤΗ ΣΤΙΓΜΗ ΠΟΥ
   ΕΓΙΝΕ COMMIT ΤΟ REFACTOR. Μια απόδειξη «πριν/μετά» που διαβάζει το `HEAD`
   συγκρίνει τον νέο κώδικα με τον εαυτό του από τη δεύτερη μέρα και μετά: το
   «πριν» εξαφανίζεται ακριβώς επειδή πέτυχε. Η αναφορά πρέπει να είναι η
   ΤΕΛΕΥΤΑΙΑ ΑΝΑΘΕΩΡΗΣΗ ΠΟΥ ΕΙΧΕ ΤΟΥΣ ΠΑΛΙΟΥΣ ΑΝΑΓΝΩΣΤΕΣ — και βρίσκεται μόνη
   της, ώστε ένα rebase ή ένα squash να μην τη σκοτώσει σιωπηλά. */
const OLD_READER = /latSt\.cells|istSt\.units|tonSt\.cells|arxGnSt\.els/;
function preRefactor() {
  let revs = [];
  try {
    revs = execFileSync('git', ['log', '--format=%H', '--', 'home-live.js'],
      { cwd: ALS, encoding: 'utf8' }).split('\n').filter(Boolean);
  } catch (e) { return null; }
  for (let i = 0; i < revs.length && i < 40; i++) {
    let src;
    try { src = execFileSync('git', ['show', revs[i] + ':home-live.js'], { cwd: ALS, encoding: 'utf8' }); }
    catch (e) { continue; }
    if (OLD_READER.test(src)) return { rev: revs[i].slice(0, 7), src: src };
  }
  return null;
}
const before = preRefactor();
const head = before && before.src;

if (!head) {
  /* ⚠️ Ποτέ σιωπηλό πέρασμα. Ένα test που δεν μπόρεσε να τρέξει δεν είναι
     test που πέρασε — αυτό ακριβώς είναι η σταθερή αρχή 10 σε harness. */
  fail++;
  console.log('  ✗ FAIL  no revision of home-live.js with the four hand-written readers was reachable — the identity proof did not run');
} else {
  const now = fs.readFileSync(path.join(ALS, 'home-live.js'), 'utf8');
  console.log('  · comparing against ' + before.rev + ' — the last revision with the hand-written readers');
  ok('that revision really did carry the four hand-written readers', OLD_READER.test(head));
  ok('the working copy no longer does', !OLD_READER.test(now));

  Object.keys(SCENES).forEach(name => {
    const data = SCENES[name];
    const before = sliceMetric(head, {}, data, TODAY);
    /* ΜΟΝΟ η νέα έκδοση παίρνει το ladders.js — η παλιά δεν το ήξερε καν. */
    const after = sliceMetric(now, { ALSLadders: L }, data, TODAY);
    STUDY_TILES.forEach(h => {
      is('[' + name + '] ' + h + ' is unchanged', after.metric(h), before.metric(h));
    });
  });
}

/* ── 6 · το νέο πλακίδιο λέει τρεις ΔΙΑΦΟΡΕΤΙΚΕΣ προτάσεις ──────────── */
section('6 · the homework tile: unreadable ≠ clear ≠ owing');
{
  const now = fs.readFileSync(path.join(ALS, 'home-live.js'), 'utf8');
  const full = Object.keys(FIX).reduce((o, k) => (o[k] = JSON.stringify(FIX[k]), o), {});
  full['hw:v1'] = JSON.stringify({ v: 1, tasks: { t1: { id: 't1', done: 0 }, t2: { id: 't2', done: 1 } } });

  /* 4 ληξιπρόθεσμα (lat 1 · ton 1 · ist 1 · arx:v1 1 · arx:gn 0) + 1 ανοιχτή
     εργασία. Ο αριθμός γράφτηκε ΣΤΟ ΧΕΡΙ από τα fixtures παραπάνω. */
  const owing = sliceMetric(now, { ALSLadders: L }, full, TODAY).metric('homework.html');
  is('4 ληξιπρόθεσμα + 1 ανοιχτή εργασία = 5', owing.hero, 5);
  ok('and it names both halves', /ανάκληση/.test(owing.note));

  const clear = sliceMetric(now, { ALSLadders: L }, {}, TODAY).metric('homework.html');
  is('nothing anywhere → a dash, not a zero', clear.hero, '—');
  is('and it says so plainly', clear.note, 'καθαρά');

  const blindL = require(path.join(ALS, 'ladders.js'));
  const blind = sliceMetric(now, {
    ALSLadders: { read: () => blindL.read({ get: k => (k === 'lat:v1' ? '{broken' : null), now: Date.now() }) }
  }, {}, TODAY).metric('homework.html');
  is('one unreadable store → a dash and a DIFFERENT sentence', blind.hero, '—');
  ok('which names the failure, not a zero', /διαβάστηκε/.test(blind.note));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
