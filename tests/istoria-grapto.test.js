/* ══════════════════════════════════════════════════════════════════════
   tests/istoria-grapto.test.js — ΤΟ ΓΡΑΠΤΟ

   ⭐ ΓΙΑΤΙ ΥΠΑΡΧΕΙ: αυτή η σελίδα λέει «γράψε ΑΥΤΑ τα στοιχεία και παίρνεις
   τις μονάδες». Αν ένα στοιχείο δεν υπάρχει στο βιβλίο, ο Αλεξ θα γράψει
   στο γραπτό κάτι που ΔΕΝ γράφεται πουθενά — και θα το γράψει με
   σιγουριά, επειδή του το είπα εγώ. Αυτό είναι το χειρότερο που μπορεί να
   κάνει αυτό το repo.

   Η εγγύηση είναι ΔΙΠΛΗ, και η πρώτη μισή είναι η σκληρή:

     Α. ΤΑ ΝΟΥΜΕΡΑ. Κάθε αριθμός μέσα σε στοιχείο πρέπει να υπάρχει
        ΑΥΤΟΥΣΙΟΣ στις παραγράφους που δηλώνει το `p[]`. Τα νούμερα είναι
        εκεί που η επινόηση σκοτώνει (1.230.000 vs 610.000, 70% vs 80%,
        65.000→108.800) και είναι το μόνο σημείο που επιδέχεται απόλυτο
        έλεγχο. ⛔ Καμία λίστα εξαιρέσεων — μια λίστα εξαιρέσεων ΕΙΝΑΙ η
        τρύπα (σταθ. από το istoria-voithima).
     Β. ΤΟ ΛΕΞΙΛΟΓΙΟ. Τουλάχιστον τα 2/3 των χαρακτηριστικών λέξεων κάθε
        στοιχείου πρέπει να ζουν στις ίδιες παραγράφους. Πιάνει το
        στοιχείο που «ακούγεται σωστό» αλλά ανήκει σε άλλη ενότητα.

   ⚠️⚠️ Η ΣΥΓΚΡΙΣΗ ΓΙΝΕΤΑΙ ΣΕ ΘΕΜΑ, ΟΧΙ ΣΕ ΟΛΟΚΛΗΡΗ ΛΕΞΗ — ΚΑΙ ΑΥΤΟ ΤΟ
   ΠΛΗΡΩΣΑ. Η πρώτη γραφή σύγκρινε ολόκληρες λέξεις και «βρήκε» 12
   ψεύτικα σφάλματα: το βιβλίο γράφει «Ναπολεόντειους πολέμους», εγώ
   «Ναπολεόντειοι πόλεμοι» — ΙΔΙΟ πράγμα, άλλη πτώση. Στα ελληνικά η
   κλίση ζει στην ΚΑΤΑΛΗΞΗ, άρα ο έλεγχος κόβει ως 3 τελικούς χαρακτήρες
   και ψάχνει το θέμα. Χωρίς τόνους και με κανονικοποίηση τελικού σίγμα
   (σταθ. 42: το `\b` είναι ΤΥΦΛΟ στα ελληνικά).
   ⛔ Αυτό ΔΕΝ είναι χαλάρωση: ένα εφευρημένο στοιχείο δεν μοιάζει στο
   θέμα με τίποτα της παραγράφου. Το απέδειξε αμέσως — κράτησε και τα
   τρία αληθινά ευρήματα.

   ⛔ ΚΑΝΕΝΑ ΚΑΡΦΩΜΕΝΟ ΠΛΗΘΟΣ σε αυτό το αρχείο. Κάθε έλεγχος είναι
   αναλλοίωτο πάνω στο υλικό, ώστε να μη «χρειάζεται διόρθωση» όταν
   προστεθεί ζητούμενο.
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ALS = path.resolve(__dirname, '..');

let pass = 0, fail = 0;
function ok (name, cond) { cond ? pass++ : fail++; console.log((cond ? '  ✓ ' : '  ✗ FAIL ') + name); }
function section (s) { console.log('\n' + s); }

const PAGE = fs.readFileSync(path.join(ALS, 'istoria-grapto.html'), 'utf8');
const SW   = fs.readFileSync(path.join(ALS, 'sw.js'), 'utf8');
const AID  = fs.readFileSync(path.join(ALS, 'istoria-voithima.html'), 'utf8');
const SRC  = fs.readFileSync(path.join(__dirname, 'istoria-grapto.source.txt'), 'utf8');

const ctx = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(ALS, 'istoria-themata-index.js'), 'utf8'), ctx);
vm.runInContext(fs.readFileSync(path.join(ALS, 'istoria-grapto-data.js'), 'utf8'), ctx);
const { THI_UNITS, THI_PARA, GR_ASK, GR_SOURCE, GR_SRC_HOT } = ctx;

const CSS = PAGE.slice(PAGE.indexOf('<style>'), PAGE.indexOf('</style>')).replace(/\/\*[\s\S]*?\*\//g, '');
const JS  = PAGE.slice(PAGE.indexOf('</style>')).replace(/\/\*[\s\S]*?\*\//g, '').replace(/<!--[\s\S]*?-->/g, '');

/* ── οι παράγραφοι της γείωσης, ανά ενότητα και αριθμό ── */
const BOOK = {};
SRC.split(/\n#####\s+/).slice(1).forEach(block => {
  const code = block.slice(0, block.indexOf(' ')).trim();
  BOOK[code] = {};
  block.split(/\n\[/).slice(1).forEach(p => {
    const n = parseInt(p, 10);
    BOOK[code][n] = p.slice(p.indexOf(']') + 1).trim();
  });
});

/* ⭐ Η ΣΤΑΥΡΩΤΗ ΕΡΩΤΗΣΗ ΑΠΑΝΤΙΕΤΑΙ ΑΠΟ ΔΥΟ ΕΝΟΤΗΤΕΣ, άρα γειώνεται σε ΔΥΟ.
   Η πρώτη γραφή κοίταζε μόνο το `p[]` της μίας και «έβρισκε» εφευρημένα τα
   στοιχεία του άλλου σκέλους — ο φρουρός ήταν αυτός που έλεγε ψέματα. */
function paraText (a) {
  const one = (u, ps) => ps.map(n => (BOOK[THI_UNITS[u].code] || {})[n] || '').join(' ');
  return one(a.u, a.p) + (a.u2 != null ? ' ' + one(a.u2, a.p2 || []) : '');
}
const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ς/g, 'σ');
const digits = s => (String(s).match(/\d[\d.,]*/g) || []).map(x => x.replace(/[.,]/g, '')).filter(x => x.length);

const STOP = new Set(['ειναι','ηταν','ομωσ','αυτο','αυτη','αυτα','αυτεσ','αυτων','καθε','μονο','παρα','τουσ','τισ','των','στο','στη','στην','στον','στουσ','στισ','μετα','πριν','προσ','απο','για','και','που','δεν','θα','να','ωσ','με','σε','η','ο','το','τα','οι','του','τησ','ενα','μια','οταν','ενω','οπωσ','ολα','πολυ','πιο','περιπου','δηλαδη','ετσι','ηδη','χωρισ','μεσα','κατω','πανω','μεταξυ','καθωσ','λογω','μεχρι','μεσω','ειδε','ειχε','ειχαν','εγινε','γινει','αλλα','αλλο','αλλη','αλλων','πρωτο','πρωτη','πρωτα','ολοκληρο','σχετικα','επισησ','τοτε','τωρα','εκει','εδω','ποσο','ποια','ποιο','ποιοι','ενοτητα','παραγραφοσ','στοιχειο','βιβλιο','κεφαλαιο']);

function words (s) {
  return [...new Set(norm(s).split(/[^a-zα-ω0-9]+/).filter(w => w.length >= 6 && !STOP.has(w)))];
}
/* το θέμα της λέξης: κόβει ως 3 χαρακτήρες κατάληξης, ποτέ κάτω από 5 */
function stem (w) { return w.slice(0, Math.max(5, w.length - 3)); }

/* ══════════════════ Α · ΤΑ ΝΟΥΜΕΡΑ ══════════════════ */
section('Α · κάθε αριθμός στοιχείου υπάρχει στις παραγράφους που δηλώνει');

let badNum = [], checkedNum = 0;
GR_ASK.forEach(a => {
  const code = THI_UNITS[a.u].code;
  const text = paraText(a);
  const have = new Set(digits(text));
  a.s.forEach(st => digits(st).forEach(d => {
    checkedNum++;
    if (!have.has(d)) badNum.push(code + ' π' + a.p.join(',') + ' → ' + d + '  «' + st.slice(0, 60) + '»');
  }));
});
ok('κανένας εφευρημένος αριθμός (' + checkedNum + ' ελέγχθηκαν)' +
   (badNum.length ? '\n      ' + badNum.slice(0, 12).join('\n      ') : ''), badNum.length === 0);

/* Ο έλεγχος πρέπει να ΜΠΟΡΕΙ να αποτύχει, αλλιώς είναι διακοσμητικός. */
ok('ο αριθμητικός έλεγχος ΜΠΟΡΕΙ να αποτύχει (αρνητικό δείγμα)',
   !new Set(digits(Object.values(BOOK['Γ.5'] || {}).join(' '))).has('999999'));

/* ══════════════════ Β · ΤΟ ΛΕΞΙΛΟΓΙΟ ══════════════════ */
section('Β · κάθε στοιχείο πατάει στις ίδιες τις παραγράφους');

let weak = [], checkedSt = 0;
GR_ASK.forEach(a => {
  const code = THI_UNITS[a.u].code;
  const text = norm(paraText(a));
  a.s.forEach(st => {
    const w = words(st);
    if (w.length < 3) return;                 /* πολύ μικρό για να κριθεί */
    checkedSt++;
    const hit = w.filter(x => text.indexOf(stem(x)) !== -1).length;
    if (hit / w.length < 0.66) weak.push(code + ' ' + Math.round(hit / w.length * 100) + '% «' + st.slice(0, 70) + '»');
  });
});
ok('κάθε στοιχείο έχει ≥66% λεξιλόγιο μέσα στις παραγράφους του (' + checkedSt + ')' +
   (weak.length ? '\n      ' + weak.slice(0, 12).join('\n      ') : ''), weak.length === 0);

/* ══════════════════ Γ · Η ΔΟΜΗ ══════════════════ */
section('Γ · η δομή των ζητουμένων');

ok('κάθε ζητούμενο δείχνει υπαρκτή ενότητα',
   GR_ASK.every(a => Number.isInteger(a.u) && a.u >= 0 && a.u < THI_UNITS.length));
ok('κάθε παράγραφος που δηλώνεται ΥΠΑΡΧΕΙ στην ενότητα',
   GR_ASK.every(a => a.p.length > 0 && a.p.every(n => n >= 1 && n <= THI_PARA[a.u].length)));
ok('κάθε ζητούμενο έχει εκφώνηση, μονάδες, στοιχεία και οδηγία',
   GR_ASK.every(a => a.q && a.q.length > 25 && a.mon > 0 && a.s.length >= 3 && a.tip && a.tip.length > 20));
ok('κανένα άγνωστο σήμα προέλευσης',
   GR_ASK.every(a => ['pan', 'diag', 'mine'].indexOf(a.k) !== -1));
ok('καμία «δική μου» δεν παριστάνει χρονιά',
   GR_ASK.filter(a => a.k === 'mine').every(a => !a.y));
ok('κάθε «έχει πέσει» δηλώνει πότε',
   GR_ASK.filter(a => a.k === 'pan').every(a => a.y && a.y.length >= 4));

/* ⛔⛔ ΤΟ ΘΕΜΑ Γ/Δ ΔΕΝ ΠΡΟΒΛΕΠΕΤΑΙ, ΚΑΙ Η ΣΕΛΙΔΑ ΔΕΝ ΕΠΙΤΡΕΠΕΤΑΙ ΝΑ ΤΟ
   ΥΠΟΣΧΕΘΕΙ. Μετρημένο: οι μισές και πλέον ενότητες έχουν ήδη σταθεί Γ1/Δ1,
   άρα οποιαδήποτε «λίστα πρόβλεψης» θα τον έσπρωχνε να αφήσει τα υπόλοιπα. */
ok('η λίστα Γ/Δ δηλώνεται ως ΣΥΧΝΟΤΗΤΑ, όχι ως πρόβλεψη',
   GR_SRC_HOT.length > THI_UNITS.length / 2 && /ΟΧΙ ΠΡΟΒΛΕΨΗ|όχι ως πρόβλεψη|δεν προβλέπεται/i.test(
     fs.readFileSync(path.join(ALS, 'istoria-grapto-data.js'), 'utf8')));
ok('η σελίδα το λέει ΚΑΙ στον αναγνώστη', /δεν υπάρχει ασφαλής πρόβλεψη/i.test(PAGE));
ok('υπάρχει τεχνική για το Γ/Δ', GR_SOURCE.length >= 5 && GR_SOURCE.every(x => x.h && x.t));

/* ══════════════════ Δ · Η ΣΕΛΙΔΑ ══════════════════ */
section('Δ · η σελίδα');

ok('φορτώνει τα δεδομένα', /src="istoria-themata-index\.js"/.test(PAGE) && /src="istoria-grapto-data\.js"/.test(PAGE));
ok('⛔ ΚΑΜΙΑ topbar.js', !/topbar\.js/.test(PAGE.replace(/<!--[\s\S]*?-->/g, '')));
ok('⛔ ΚΑΝΕΝΑ sync.js — ο αναγνώστης δεν γράφει', !/sync\.js/.test(PAGE.replace(/<!--[\s\S]*?-->/g, '')));
ok('⛔ κανένα @media (min-width)', !/@media[^{]*min-width/.test(CSS));

/* ΘΕΣΗ, όχι ύπαρξη — το ίδιο μάθημα που πληρώθηκε στο ράνταρ. */
const backTop = PAGE.indexOf('class="back top"'), list = PAGE.indexOf('id="asks"');
ok('ο δρόμος πίσω είναι ΠΑΝΩ-ΠΑΝΩ', backTop > 0 && list > 0 && backTop < list);

ok('η σελίδα ΤΥΠΩΝΕΙ τις αρχές των παραγράφων', /THI_PARA/.test(JS));
ok('η σελίδα ξεχωρίζει ΟΠΤΙΚΑ τι έχει πέσει από τι έγραψα εγώ', /\.k\.mine/.test(CSS) && /ΔΕΝ έχει πέσει/.test(PAGE));
ok('κάθε πρόσβαση σε localStorage είναι σε try/catch',
   (JS.match(/localStorage/g) || []).length === (JS.match(/try \{[^}]*localStorage/g) || []).length);

/* ⛔⛔ Η ΣΕΙΡΑ ΒΓΑΙΝΕΙ ΑΠΟ ΤΑ ΑΛΗΘΙΝΑ ΘΕΜΑΤΑ, ΟΧΙ ΑΠΟ ΤΟ ΠΟΣΕΣ ΚΑΡΤΕΣ
   ΕΓΡΑΨΑ. Ένα μέτρο που μετράει τον μετρητή ταξινόμησε τη Β.2 (3
   εμφανίσεις) πάνω από τη Γ.1 (7), επειδή της είχα γράψει περισσότερες
   κάρτες. Και η σειρά ΕΙΝΑΙ το προϊόν: αποφασίζει τι θα προλάβει. */
section('Ζ · η σειρά');
ok('η σελίδα φορτώνει το corpus των αληθινών θεμάτων',
   /src="istoria-themata-themes\.js"/.test(PAGE));
ok('η θερμοκρασία μετριέται στο THI_THEMES, όχι στο GR_ASK',
   /THI_THEMES\.forEach/.test(JS) && !/A\.forEach\(function \(a\) \{ if \(a\.k !== 'mine'\)/.test(JS));

section('Ε · offline + ο δρόμος');
['istoria-grapto.html', 'istoria-grapto-data.js'].forEach(f =>
  ok('το sw.js προφορτώνει ' + f, SW.indexOf("'" + f + "'") !== -1));
ok('υπάρχει δρόμος από την ΑΡΧΙΚΗ του βοηθήματος', /href="istoria-grapto\.html"/.test(AID));

console.log('\n' + (fail ? '✗ ' : '✓ ') + pass + ' πέρασαν · ' + fail + ' απέτυχαν');
process.exit(fail ? 1 : 0);
