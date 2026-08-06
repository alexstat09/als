/* ══════════════════════════════════════════════════════════════════════
   tests/istoria-claim.test.js

   ⭐⭐ ΔΥΟ ΕΓΓΥΗΣΕΙΣ, ΚΑΙ Η ΔΕΥΤΕΡΗ ΕΙΝΑΙ ΓΕΝΙΚΗ ΓΙΑ ΟΛΗ ΤΗ ΣΕΛΙΔΑ.

   1) Η ΔΗΛΩΣΗ ΔΕΝ ΕΙΝΑΙ ΜΕΤΡΗΣΗ.  Το «Το ξέρω απέξω» υπάρχει επειδή το
      ζήτησε ο Αλεξ, αλλά η als-v452 υπάρχει επειδή ένα εργαλείο που
      ανταμείβει έναν ΙΣΧΥΡΙΣΜΟ διδάσκει ότι ο ισχυρισμός αρκεί.  Άρα το
      `doClaim` ΑΠΑΓΟΡΕΥΕΤΑΙ να αγγίξει τη σκάλα (`reviews`) ή τη μετρημένη
      ακρίβεια (`best`), και η μέτρηση κερδίζει πάντα τη δήλωση.

   2) ⭐ ΚΑΜΙΑ ΚΛΗΣΗ ΣΕ ΟΝΟΜΑ ΠΟΥ ΔΕΝ ΔΗΛΩΝΕΤΑΙ ΠΟΥΘΕΝΑ.  Χτίζοντας αυτό
      ακριβώς το κουμπί έγραψα `render()` ενώ η συνάρτηση λέγεται
      `renderHome()`.  Το state γραφόταν κανονικά και ΜΕΤΑ έσκαγε, οπότε το
      κουμπί δεν άλλαζε ποτέ όψη: μια αποτυχία που μοιάζει με «δεν πάτησε το
      κουμπί».  Ίδια οικογένεια με τη σταθερή αρχή 12 (κλάση που δεν ορίζεται
      πουθενά) και 14 (τοπικό που σκιάζει βοηθητική) — το όνομα υπάρχει στο
      κείμενο και πουθενά αλλού.  Ο έλεγχος είναι στατικός και πιάνει ΟΛΗ τη
      σελίδα, όχι μόνο αυτό το κουμπί.

   ⚠️ ΔΥΟ ΟΨΕΙΣ ΤΟΥ ΚΩΔΙΚΑ, ΕΠΙΤΗΔΕΣ.  Οι έλεγχοι ΔΟΜΗΣ τρέχουν πάνω σε
   κώδικα χωρίς strings (αλλιώς μια λέξη μέσα σε μήνυμα περνάει για κλήση),
   και οι έλεγχοι ΠΕΡΙΕΧΟΜΕΝΟΥ πάνω σε κώδικα ΜΕ τα strings.  Η πρώτη γραφή
   αυτού του αρχείου τα μπέρδεψε και απέτυχαν 5 σωστά πράγματα — σταθερή
   αρχή 19: ένας φρουρός που κλαίει είναι φρουρός που θα χαλαρώσει.
   ══════════════════════════════════════════════════════════════════════ */

'use strict';

var fs = require('fs');
var path = require('path');
var SRC = fs.readFileSync(path.join(__dirname, '..', 'istoria.html'), 'utf8');

var pass = 0, fail = 0;
function ok(cond, msg) {
  if (cond) { pass++; } else { fail++; console.log('  ✗ ' + msg); }
}

var scripts = SRC.match(/<script>([\s\S]*?)<\/script>/g) || [];
var JS = scripts[scripts.length - 1].replace(/^<script>/, '').replace(/<\/script>$/, '');
ok(JS.length > 20000, 'βρέθηκε το inline script (' + JS.length + ' χαρ.)');

function noComments(s) {
  return s.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/[^\n]*/g, '$1 ');
}
function noStrings(s) {
  return s.replace(/'(?:\\.|[^'\\])*'/g, "''").replace(/"(?:\\.|[^"\\])*"/g, '""');
}
var TEXT = noComments(JS);        /* με strings — για έλεγχο περιεχομένου */
var CODE = noStrings(TEXT);       /* χωρίς strings — για έλεγχο δομής */

function bodyOf(src, name) {
  var i = src.indexOf('function ' + name + '(');
  if (i < 0) return '';
  var j = src.indexOf('{', i), d = 0, k;
  for (k = j; k < src.length; k++) {
    if (src[k] === '{') d++;
    else if (src[k] === '}') { d--; if (!d) return src.slice(j + 1, k); }
  }
  return '';
}

/* ── 1 · Η ΔΗΛΩΣΗ ΔΕΝ ΑΓΓΙΖΕΙ ΤΗ ΜΕΤΡΗΣΗ ────────────────────────────── */
var CLAIM = bodyOf(CODE, 'doClaim'), CLAIM_T = bodyOf(TEXT, 'doClaim');
ok(CLAIM.length > 60, 'υπάρχει doClaim()');
ok(CLAIM.indexOf('reviews') < 0, '⭐ doClaim ΔΕΝ αγγίζει το reviews — η σκάλα κερδίζεται με μέτρηση');
ok(CLAIM.indexOf('best') < 0, '⭐ doClaim ΔΕΝ αγγίζει το best — δεν υπάρχει ακρίβεια χωρίς ανάκληση');
ok(CLAIM.indexOf('I.nextDue') < 0, '⭐ doClaim ΔΕΝ καλεί τη σκάλα επανάληψης');
ok(/s\.claimed\s*=\s*Date\.now\(\)/.test(CLAIM), 'doClaim σφραγίζει το claimed');
ok(/s\.due\s*=\s*Date\.now\(\)\s*\+\s*CLAIM_DAYS/.test(CLAIM), 'doClaim δίνει σταθερό παρκάρισμα CLAIM_DAYS');
ok(/if\s*\(\s*s\.runs\s*\)/.test(CLAIM), '⭐ doClaim αρνείται να πατήσει υπάρχουσα ΜΕΤΡΗΣΗ');
ok(CLAIM_T.indexOf('rcBar') >= 0 && CLAIM_T.indexOf('micStop()') >= 0,
  '⭐ doClaim κλείνει την ανάκληση — αλλιώς ένα «Τέλος» με σιωπή γράφει 0% πάνω στη δήλωση');

var UNDO = bodyOf(CODE, 'undoClaim');
ok(UNDO.length > 40, 'υπάρχει undoClaim()');
ok(/if\s*\(\s*!claimedOnly\(s\)\s*\)\s*return/.test(UNDO),
  '⭐ undoClaim ΔΕΝ μηδενίζει ποτέ μετρημένη πρόοδο');

ok(/!s\.runs/.test(bodyOf(CODE, 'claimedOnly')),
  '⭐ «δηλωμένο» σημαίνει ΚΑΙ «δεν έχει μετρηθεί» — η μέτρηση σβήνει τη δήλωση');

var FIN = bodyOf(CODE, 'finish');
ok(/cov\s*>=\s*I\.PASS/.test(FIN) && /s\.reviews\s*=/.test(FIN),
  'η σκάλα ανεβαίνει μόνο σε μετρημένη ανάκληση ≥ I.PASS');

/* ── 2 · ΕΝΑ ΜΠΛΟΚ, ΔΥΟ ΘΕΣΕΙΣ (σταθερή αρχή 15) ────────────────────── */
ok((CODE.match(/function claimInner\(/g) || []).length === 1,
  'το κουμπί χτίζεται από ΜΙΑ συνάρτηση');
ok((TEXT.match(/paintClaim\('isClaim/g) || []).length === 2,
  'και μπαίνει σε ΔΥΟ θέσεις (μάθημα + ανάκληση), ώστε να μη γίνουν δύο υποσχέσεις');
ok(TEXT.indexOf('isClaimL') > 0, 'θέση 1: το μάθημα');
ok(TEXT.indexOf('isClaimR') > 0, 'θέση 2: η ανάκληση');

/* ── 3 · ΔΗΛΩΜΕΝΟ ΚΑΙ ΜΕΤΡΗΜΕΝΟ ΔΕΝ ΤΥΠΩΝΟΝΤΑΙ ΙΔΙΑ (σταθερή αρχή 10) ─ */
var ROW = bodyOf(TEXT, 'row');
ok(/claimedOnly\(s\)/.test(ROW), 'η γραμμή της ύλης ξέρει τη διαφορά');
ok(/var bar = dec \? '<span class="is-rowdec"/.test(ROW), 'το δηλωμένο ΔΕΝ παίρνει μπάρα ακρίβειας');
ok(ROW.indexOf('is-rowdec') >= 0, 'και λέει το όνομά του στη θέση της μπάρας');
ok(SRC.indexOf('.is-rowdec{') > 0, 'σταθερή αρχή 12: η .is-rowdec ΟΡΙΖΕΤΑΙ στο CSS');
['is-claim', 'is-claim-b', 'is-claim-on', 'is-claim-head', 'is-claim-note', 'is-claim-undo'].forEach(function (c) {
  ok(SRC.indexOf('.' + c + '{') > 0, 'σταθερή αρχή 12: η .' + c + ' ΟΡΙΖΕΤΑΙ στο CSS');
});
ok(/δηλωμένη, όχι μετρημένη/.test(TEXT) && /δηλωμένες, όχι μετρημένες/.test(TEXT),
  '⭐ το Home το λέει με λέξεις, δεν αφήνει τη δήλωση να περάσει για μέτρηση');
ok(/Το είπες εσύ, δεν το άκουσε κανείς/.test(TEXT),
  '⭐ και το ίδιο το κουμπί το λέει, για όσο ισχύει');

/* ── 4 · ⭐⭐ ΚΑΜΙΑ ΚΛΗΣΗ ΣΕ ΟΝΟΜΑ ΠΟΥ ΔΕΝ ΔΗΛΩΝΕΤΑΙ ────────────────────
   Το bug που έγινε ΤΩΡΑ: `render()` αντί για `renderHome()`. */
var declared = {}, m;

/* function NAME(...) — και οι παράμετροί της */
var reFn = /function\s*([A-Za-z_$][\w$]*)?\s*\(([^)]*)\)/g;
while ((m = reFn.exec(CODE))) {
  if (m[1]) declared[m[1]] = 1;
  m[2].split(',').forEach(function (p) {
    p = p.trim(); if (/^[A-Za-z_$][\w$]*$/.test(p)) declared[p] = 1;
  });
}
/* var/let/const a = …, b, c;  → ΟΛΑ τα ονόματα, όχι μόνο το πρώτο.
   Χρειάζεται, γιατί μια μεταβλητή μπορεί να κρατάει συνάρτηση (π.χ. `SR`). */
var reDecl = /\b(?:var|let|const)\s+([\s\S]*?);/g;
while ((m = reDecl.exec(CODE))) {
  var depth = 0, part = '', chunk = m[1], c2, list = [], q;
  for (q = 0; q < chunk.length; q++) {
    c2 = chunk[q];
    if ('([{'.indexOf(c2) >= 0) depth++;
    else if (')]}'.indexOf(c2) >= 0) depth--;
    if (c2 === ',' && !depth) { list.push(part); part = ''; continue; }
    part += c2;
  }
  list.push(part);
  list.forEach(function (p) {
    var nm = p.trim().match(/^([A-Za-z_$][\w$]*)/);
    if (nm) declared[nm[1]] = 1;
  });
}

var GLOBALS = ('String Number Boolean Array Object JSON Math Date RegExp Error Promise Set Map ' +
  'parseInt parseFloat isNaN isFinite encodeURIComponent decodeURIComponent ' +
  'setTimeout clearTimeout setInterval clearInterval requestAnimationFrame ' +
  'alert confirm prompt fetch console window document localStorage ' +
  'ALSConfirm ALSAlert ALSPrompt initCloudSync PageMotion').split(' ');
GLOBALS.forEach(function (g) { declared[g] = 1; });

var called = {}, reCall = /(^|[^\w$.])([A-Za-z_$][\w$]*)\s*\(/g;
while ((m = reCall.exec(CODE))) called[m[2]] = 1;
['if', 'for', 'while', 'switch', 'catch', 'function', 'return', 'typeof', 'new', 'else', 'do', 'in', 'of', 'delete', 'void', 'instanceof'].forEach(function (k) { delete called[k]; });

var unknown = Object.keys(called).filter(function (n) { return !declared[n]; });
ok(unknown.length === 0,
  '⭐⭐ ΚΑΛΕΙΤΑΙ ΟΝΟΜΑ ΠΟΥ ΔΕΝ ΔΗΛΩΝΕΤΑΙ ΠΟΥΘΕΝΑ → ' + unknown.join(', '));

/* Ο φρουρός πρέπει να ΔΑΓΚΩΝΕΙ: το ίδιο ακριβώς λάθος, δοκιμασμένο. */
(function () {
  var broken = CODE.replace('renderHome();', 'render();');
  var c2 = {}, mm, re2 = /(^|[^\w$.])([A-Za-z_$][\w$]*)\s*\(/g;
  while ((mm = re2.exec(broken))) c2[mm[2]] = 1;
  ok(!declared['render'] && c2['render'],
    '⭐ ο έλεγχος θα έπιανε το πραγματικό λάθος (render αντί renderHome)');
})();

console.log('\nΙΣΤΟΡΙΑ — «Το ξέρω απέξω»\n');
console.log(pass + ' pass, ' + fail + ' fail\n');
if (fail) process.exit(1);
