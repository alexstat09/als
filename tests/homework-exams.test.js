/* ══════════════════════════════════════════════════════════════════════
   tests/homework-exams.test.js — ΤΑ ΔΙΑΓΩΝΙΣΜΑΤΑ (als-v537)

   ΤΙ ΦΥΛΑΕΙ, ΚΑΙ ΓΙΑΤΙ ΑΥΤΑ ΤΑ ΠΕΝΤΕ:

   Α · Η ΝΕΚΡΗ ΠΟΡΤΑ. Το `#programma` ήταν στη λίστα `DOORS`, είχε κανόνα CSS
       `body.hw-door-programma`, είχε renderer που γέμιζε το σώμα του σε κάθε
       paint — και ΔΕΝ είχε τη γραμμή `cl.toggle('hw-door-programma', …)`.
       Αποτέλεσμα: ΛΕΥΚΗ ΟΘΟΝΗ πίσω από σύνδεσμο που ζει στην αρχική οθόνη,
       από την als-v485 ως την als-v537. Είναι η σταθ. 12 ανάποδα («κανόνας
       χωρίς κλάση» αντί για «κλάση χωρίς κανόνα») και βγάζει το ίδιο σιωπηλό-
       άδειο. Ο έλεγχος εδώ είναι ΑΜΦΙΔΡΟΜΟΣ και καλύπτει κάθε ΜΕΛΛΟΝΤΙΚΗ
       πόρτα: toggle ⇔ κανόνας CSS, για κάθε κλειδί του DOORS.

   Β · ΣΤΑΘΕΡΗ ΑΡΧΗ 35 — κάθε νέο πεδίο γράφεται ΚΑΙ στο `blank()` ΚΑΙ στον
       `load()`. Χωρίς τη δεύτερη, ένας πίνακας από παλιά έκδοση φτάνει στον
       renderer· χωρίς την πρώτη, καθαρή εγκατάσταση σκάει στο πρώτο γράψιμο.

   Γ · ΣΤΑΘΕΡΗ ΑΡΧΗ 31 — το `exams` ΞΑΝΑΓΡΑΦΕΤΑΙ (η ύλη διορθώνεται, ο βαθμός
       έρχεται μέρες μετά), άρα ΠΡΕΠΕΙ να είναι στο readMaps του STAMP. Χωρίς
       σφραγίδα η ΔΕΥΤΕΡΗ αλλαγή γυρίζει πίσω από το cloud σε ~400ms — δηλαδή
       γράφεις τον βαθμό, τον βλέπεις, και εξαφανίζεται μόνος του.

   Δ · ΣΤΑΘΕΡΗ ΑΡΧΗ 32 + 56 — το σβήσιμο αφήνει ταφόπλακα ΜΟΝΟ μετά από
       επιβεβαιωμένη εγγραφή, και περνάει από `Promise.resolve(ask).then(…)`.
       Ένα callback στον ALSConfirm αγνοείται ΣΙΩΠΗΛΑ (als-v525): το σβήσιμο
       θα φαινόταν να γίνεται και δεν θα γινόταν.

   Ε · Ο ΣΠΟΡΟΣ ΣΠΕΡΝΕΙ ΜΙΑ ΦΟΡΑ. Χωρίς σημαία, ένα σβησμένο διαγώνισμα
       ξαναγεννιέται στο επόμενο άνοιγμα — δηλαδή δεν μπορεί να το σβήσει
       ΠΟΤΕ, και το κουμπί «Σβήσε» λέει ψέματα.

   Οδηγεί ΑΛΗΘΙΝΟ κώδικα κομμένο από τη homework.html — ποτέ αντίγραφο, γιατί
   ένα αντίγραφο συμφωνεί με κάθε bug τέλεια.

   ⚠️ ΑΝΑΙΡΕΣΗ ΤΗΣ ΔΙΟΡΘΩΣΗΣ ΠΡΕΠΕΙ ΝΑ ΚΟΚΚΙΝΙΣΕΙ: βγάλε τη γραμμή toggle του
   `programma` και πέφτει το Α· βγάλε το `state.exams` από το readMaps και
   πέφτει το Γ· βγάλε τη σημαία `exSeed` και πέφτει το Ε.
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const ALS = path.resolve(__dirname, '..');

let pass = 0, fail = 0;
function is(name, got, want) {
  const good = JSON.stringify(got) === JSON.stringify(want);
  good ? pass++ : fail++;
  console.log((good ? '  ✓ ' : '  ✗ FAIL ') + name +
    (good ? '' : `\n      got  ${JSON.stringify(got)}\n      want ${JSON.stringify(want)}`));
}
function ok(name, cond) { is(name, !!cond, true); }
function section(s) { console.log('\n' + s); }

const PAGE = fs.readFileSync(path.join(ALS, 'homework.html'), 'utf8');

/* ⚠️ ΣΤΑΘ. 44: κάθε κοπή γίνεται ΜΕΣΑ ΣΤΗΝ ΠΕΡΙΟΧΗ ΤΗΣ, με ορόσημο που
   υπάρχει ΜΙΑ φορά. Ένα σκέτο indexOf σε αυτό το αρχείο των 5.000 γραμμών
   πιάνει άλλο μπλοκ και το test κατηγορεί σωστό κώδικα. */
function cut(from, to, label) {
  const a = PAGE.indexOf(from);
  if (a < 0) throw new Error('homework.html no longer contains: ' + label + ' (start)');
  const b = PAGE.indexOf(to, a + from.length);
  if (b < 0) throw new Error('homework.html no longer contains: ' + label + ' (end)');
  return PAGE.slice(a, b);
}

/* ══ Α · ΚΑΘΕ ΠΟΡΤΑ ΕΧΕΙ ΚΑΙ ΤΑ ΔΥΟ ΣΚΕΛΗ ═══════════════════════════ */
section('Α · οι πόρτες — toggle ⇔ κανόνας CSS (η νεκρή #programma)');

const doorsSrc = cut("var DOORS = {", "};", 'DOORS map');
const doorKeys = [];
doorsSrc.replace(/([a-z]+)\s*:\s*'/g, (m, k) => { doorKeys.push(k); return m; });
is('το DOORS δηλώνει και τις πέντε πόρτες', doorKeys.sort(),
   ['capture', 'diagonismata', 'ergasies', 'programma', 'tonight']);

/* Το toggle ζει ΜΟΝΟ μέσα στον applyDoor· το ψάχνουμε εκεί, όχι σε όλο το
   αρχείο, ώστε ένα σχόλιο που αναφέρει το όνομα να μη μετράει ως καλωδίωση. */
const applySrc = cut('function applyDoor(){', '\n  }\n', 'applyDoor');
doorKeys.forEach(k => {
  const hasToggle = applySrc.indexOf("'hw-door-" + k + "'") >= 0;
  const hasCss = PAGE.indexOf('body.hw-door-' + k + ' ') >= 0;
  ok('«' + k + '»: toggle(' + hasToggle + ') και CSS(' + hasCss + ') συμφωνούν',
     hasToggle === hasCss);
  ok('«' + k + '»: έχει και τα δύο σκέλη, όχι κανένα', hasToggle && hasCss);
});
ok('η #diagonismata έχει τμήμα στο markup', PAGE.indexOf('id="hwDiag"') >= 0);
ok('η #diagonismata έχει σύνδεσμο στην αρχική', PAGE.indexOf('href="#diagonismata"') >= 0);
ok('ο renderDiag καλείται από το paint', /renderDiag\(\);\s*\/\*/.test(PAGE));

/* ⚠️⚠️ ΣΤΑΘ. 51 · ΙΔΙΑ ΕΙΔΙΚΟΤΗΤΑ ⇒ Η ΣΕΙΡΑ ΕΙΝΑΙ Ο ΚΑΝΟΝΑΣ.
   `body.hw-door .hw-wrap` και `body.hw-door-diagonismata .hw-wrap` μετράνε και
   τα δύο (0,2,1). Γραμμένο ΠΑΝΩ από τον γενικό, το override του δωματίου
   χάνεται ΣΙΩΠΗΛΑ και το λάπτοπ δείχνει λωρίδα 684px — μετρημένο στο render,
   αόρατο σε κάθε βεβαίωση που κοιτάει μόνο αν ο κανόνας ΥΠΑΡΧΕΙ.
   ⛔ Γι᾿ αυτό ελέγχεται η ΘΕΣΗ, όχι η ύπαρξη. */
section('Α2 · το πλάτος του δωματίου νικάει τον γενικό κανόνα της πόρτας');
{
  const gen = PAGE.indexOf('body.hw-door .hw-wrap{');
  const dgw = PAGE.indexOf('body.hw-door-diagonismata .hw-wrap{');
  const erg = PAGE.indexOf('body.hw-door-ergasies .hw-wrap{');
  ok('υπάρχουν και οι τρεις κανόνες', gen > 0 && dgw > 0 && erg > 0);
  ok('το override των διαγωνισμάτων έρχεται ΜΕΤΑ τον γενικό', dgw > gen);
  ok('όπως και του #ergasies, που είναι το δοκιμασμένο σχήμα', erg > gen);
  ok('και δηλώνει 980px, όχι 720', /body\.hw-door-diagonismata \.hw-wrap\{ max-width:980px; \}/.test(PAGE));
  /* ⛔ ΚΑΝΕΝΑ `min-width` ΣΤΟ ΔΩΜΑΤΙΟ — το media query μετράει VIEWPORT, όχι
     γονέα, οπότε ένα `min-width` σπάει τη στήλη σε δύο μισές μέσα σε στενό
     γονέα. Η πλήρης όψη γράφεται πρώτα· το τηλέφωνο τη ΜΑΖΕΥΕΙ με max-width. */
  const dgCss = PAGE.slice(PAGE.indexOf('.hw-diag{ display:none; }'),
                           PAGE.indexOf('/* ══ ΦΑΣΗ 2 · ΟΙ ΕΡΓΑΣΙΕΣ'));
  ok('και το CSS του δωματίου δεν έχει ΚΑΝΕΝΑ min-width', !/min-width/.test(dgCss));
}

/* ══ Β · ΣΤΑΘ. 35 — blank() ΚΑΙ load() ══════════════════════════════ */
section('Β · σταθ. 35 — το exams υπάρχει και στα δύο');

/* ⚠️ ΣΤΑΘ. 44 ΜΕΣΑ ΣΤΟ ΙΔΙΟ ΤΟ TEST, ΚΑΙ ΤΟ ΕΠΙΑΣΕ ΤΡΕΧΟΝΤΑΣ: το `blank()`
   είναι ΜΟΝΟΓΡΑΜΜΟ και το πρώτο `}` του είναι το `tasks:{}` — μια κοπή ως
   εκεί έκοβε πριν από το `exams` και κατηγορούσε ΣΩΣΤΟ κώδικα. Κόβουμε στο
   τέλος της ΓΡΑΜΜΗΣ, που είναι το πραγματικό όριο της συνάρτησης. */
const blankSrc = cut('function blank(){', '\n', 'blank()');
ok('το blank() γεννάει exams', /exams\s*:\s*\{\}/.test(blankSrc));
const loadSrc = cut('function load(){', '\n  function loadPics', 'load()');
ok('ο load() κανονικοποιεί το exams', /b\.exams\s*=/.test(loadSrc));
ok('… και απορρίπτει πίνακα (όχι μόνο typeof object)',
   /b\.exams[\s\S]{0,160}!Array\.isArray\(s\.exams\)/.test(loadSrc));
ok('ο load() κρατάει ΟΛΑ τα κλειδιά (δεν είναι λίστα επιτρεπομένων)',
   /for \(k in s\)[\s\S]{0,120}b\[k\] = s\[k\]/.test(loadSrc));

/* ══ Γ · ΣΤΑΘ. 31 — Η ΣΦΡΑΓΙΔΑ ═════════════════════════════════════ */
section('Γ · σταθ. 31 — το exams σφραγίζεται');

const mapsSrc = cut('function(){ return state ?', '},', 'STAMP readMaps');
ok('το state.exams είναι στο readMaps του STAMP', mapsSrc.indexOf('state.exams') >= 0);
is('και είναι το πέμπτο, μετά το timetable',
   mapsSrc.indexOf('state.exams') > mapsSrc.indexOf('state.timetable'), true);

/* ══ Δ · ΣΤΑΘ. 32 + 56 — ΤΟ ΣΒΗΣΙΜΟ ════════════════════════════════ */
section('Δ · το σβήσιμο είναι αληθινό');

ok('υπάρχει tombExam και δείχνει στο σωστό μονοπάτι',
   /function tombExam\(id, ts\)\{ tombPath\(KEY, \['exams'\], id, ts\); \}/.test(PAGE));
const wireSrc = cut("$('hwDgBody').addEventListener('click'", "$('hwDgOpen')", 'exam wiring');
ok('ο ALSConfirm διαβάζεται ως ΥΠΟΣΧΕΣΗ, όχι με callback (σταθ. 56)',
   /Promise\.resolve\(ask\)\.then\(/.test(wireSrc));
ok('η ταφόπλακα μπαίνει ΜΟΝΟ μετά από επιτυχημένο save()',
   /if \(save\(\)\) tombExam\(id, ts\);/.test(wireSrc));
ok('ο ακροατής είναι ΑΝΑΤΕΘΕΙΜΕΝΟΣ στο σταθερό κέλυφος (σταθ. als-v522)',
   wireSrc.indexOf("data-dg") >= 0 && !/querySelectorAll\('\[data-dg\]'\)\.forEach/.test(wireSrc));

/* ══ Ε · Ο ΚΩΔΙΚΑΣ, ΖΩΝΤΑΝΟΣ ═══════════════════════════════════════ */
section('Ε · ο αληθινός κώδικας τρέχει σε vm');

const helpers = cut('function pad2(n){', '  /* ── ΤΑ ΤΕΣΣΕΡΑ ΜΑΘΗΜΑΤΑ', 'date helpers');
const examFns = cut('function examList(){', '  function renderDiag(){', 'exam pure functions');
const seedFn  = cut('function examSeedOnce(){', '\n    return true;\n  }', 'examSeedOnce') + '\n    return true;\n  }';

const ctx = {
  state: { exams: {} },
  console,
  /* ΤΟ ΣΗΜΕΡΑ ΕΙΝΑΙ ΚΑΡΦΩΤΟ: ένα test που εξαρτάται από την πραγματική μέρα
     γίνεται πράσινο σήμερα και κόκκινο την Τρίτη, χωρίς να αλλάξει κώδικας. */
  Date: class extends Date {
    constructor(...a) { if (!a.length) super('2026-09-04T20:00:00'); else super(...a); }
    static now() { return new Date('2026-09-04T20:00:00').getTime(); }
  }
};
vm.createContext(ctx);
vm.runInContext(
  'var DOW_EL = ["Δευτέρα","Τρίτη","Τετάρτη","Πέμπτη","Παρασκευή","Σάββατο","Κυριακή"];\n' +
  'var SUBJ = { arxaia_gn:{label:"Αρχαία · γνωστό"} };\n' +
  helpers + '\n' + examFns + '\n' + seedFn, ctx);

is('ο σπόρος σπέρνει την πρώτη φορά', vm.runInContext('examSeedOnce()', ctx), true);
is('… και ΠΟΤΕ δεύτερη (σημαία exSeed)', vm.runInContext('examSeedOnce()', ctx), false);
is('έγραψε ακριβώς ένα διαγώνισμα', Object.keys(ctx.state.exams).length, 1);

const seeded = ctx.state.exams['x-arxaia-0908'];
is('για την Τρίτη 8 Σεπτεμβρίου', seeded.date, '2026-09-08');
is('χωρίς βαθμό — null, ΠΟΤΕ 0', seeded.grade, null);
is('και δεν είναι γραμμένο ακόμη', seeded.done, 0);
ok('η ύλη κρατάει τους αρχικούς χρόνους του πίνακα', seeded.yli.indexOf('141-153') >= 0);
ok('η ύλη κρατάει την εισαγωγή σελ. 3-13', seeded.yli.indexOf('3-13') >= 0);
ok('η ύλη κρατάει το συντακτικό που ΔΕΝ ήταν στον πίνακα',
   seeded.yli.indexOf('Συντακτικό') >= 0);
ok('η ύλη είναι ΓΡΑΜΜΕΣ, όχι παράγραφος', seeded.yli.split('\n').length >= 8);

/* ⭐ ΤΟ ΣΒΗΣΙΜΟ ΕΙΝΑΙ ΟΡΙΣΤΙΚΟ — αυτό είναι το όλο νόημα της σημαίας. */
delete ctx.state.exams['x-arxaia-0908'];
vm.runInContext('examSeedOnce()', ctx);
is('σβησμένο διαγώνισμα ΔΕΝ ξαναγεννιέται', Object.keys(ctx.state.exams).length, 0);

section('… και οι τρεις καταστάσεις γράφονται διαφορετικά');
function say(date, done) {
  ctx.state.exams = {}; ctx.state.exSeed = 0;
  return vm.runInContext('examLeftSay(' + JSON.stringify({ date: date, done: done || 0 }) + ')', ctx);
}
is('σε 4 μέρες', say('2026-09-08'), 'σε 4 μέρες');
is('αύριο', say('2026-09-05'), 'αύριο');
is('σήμερα', say('2026-09-04'), 'σήμερα');
is('χθες', say('2026-09-03'), 'χθες');
is('χωρίς ημερομηνία ≠ σήμερα', say(''), 'δεν μου είπες πότε');

function written(date, done) {
  return vm.runInContext('examWritten(' + JSON.stringify({ date: date, done: done || 0 }) + ')', ctx);
}
is('μελλοντικό, άγραφο', written('2026-09-08'), false);
is('περασμένο μετράει γραμμένο ακόμη κι αν δεν το πάτησε', written('2026-09-01'), true);
is('«το έγραψα» νικάει την ημερομηνία', written('2026-09-08', 1756900000000), true);

/* ⛔⛔ ΤΟ ΚΟΜΜΑ, ΚΑΙ ΤΟ ΒΡΗΚΕ ΜΟΝΟ ΤΟ RENDER (als-v537).
   Ένα `<input type="number">` ΑΠΟΡΡΙΠΤΕΙ το κόμμα, και ο δεκαδικός
   διαχωριστής του ελληνικού πληκτρολογίου ΕΙΝΑΙ το κόμμα: το «17,5» έδινε
   `.value === ''` και το «Κράτησέ το» έγραφε «γραμμένο, χωρίς βαθμό» ΣΙΩΠΗΛΑ,
   ενώ το ίδιο το placeholder ζητούσε κόμμα. Ο φρουρός δείχνει στο ΠΕΔΙΟ, όχι
   στη μορφοποίηση — εκεί ήταν το bug. */
section('Ζ · το πεδίο του βαθμού δέχεται ελληνικό κόμμα');
{
  const fld = PAGE.slice(PAGE.indexOf('id="hwGradeVal"') - 200,
                         PAGE.indexOf('id="hwGradeVal"') + 200);
  ok('το πεδίο ΔΕΝ είναι type="number"', !/id="hwGradeVal"[^>]*type="number"/.test(PAGE)
                                          && !/type="number"[^>]*id="hwGradeVal"/.test(PAGE));
  ok('είναι type="text" με αριθμητικό πληκτρολόγιο', /type="text"[\s\S]{0,60}inputmode="decimal"/.test(fld));
  ok('και ο parser γυρίζει το κόμμα σε τελεία', /replace\(',', *'\.'\)/.test(PAGE));
  ok('«δεν είναι αριθμός» και «εκτός κλίμακας» λένε ΔΙΑΦΟΡΕΤΙΚΑ πράγματα',
     /Δεν κατάλαβα τον βαθμό/.test(PAGE) && /από 0 ως/.test(PAGE));
}

is('ο βαθμός γράφεται με ΚΟΜΜΑ, όπως τον λέει',
   vm.runInContext('examGradeStr({grade:17.5})', ctx), '17,5');
is('… και το «δεν έχω βαθμό» δεν είναι μηδέν',
   vm.runInContext('examGradeStr({grade:null})', ctx), '');

console.log('\n' + (fail ? '✗ ' + fail + ' FAILED' : '✓ ΟΛΑ ΠΕΡΑΣΑΝ') + '  (' + pass + '/' + (pass + fail) + ')');
process.exit(fail ? 1 : 0);
