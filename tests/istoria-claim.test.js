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
/* ⚠️⚠️ ΕΝΑΣ ΣΑΡΩΤΗΣ, ΟΧΙ ΤΡΙΑ REGEX — ΚΑΙ Ο ΛΟΓΟΣ ΕΙΝΑΙ ΜΕΤΡΗΜΕΝΟΣ.
   Η παλιά μορφή ήταν «σβήσε τα μονά, μετά τα διπλά». Αυτό ακυρώνεται από ΔΥΟ
   εντελώς συνηθισμένα πράγματα σε αυτή τη σελίδα:
     · ένα εισαγωγικό μέσα σε REGEX  — το `esc()` γράφει `.replace(/"/g,'&quot;')`,
       οπότε το πέρασμα των μονών άφηνε ΟΡΦΑΝΟ το `"` και το επόμενο πέρασμα
       κατάπινε **21.329 χαρακτήρες**·
     · μια απόστροφος μέσα σε ΔΙΠΛΑ εισαγωγικά — 7 ακόμη «συμβολοσειρές» ως
       563 χαρακτήρων, που έτρωγαν ολόκληρες `function …`.
   Και στις δύο περιπτώσεις ο φρουρός «καλείται όνομα που δεν δηλώνεται»
   κατήγγειλε ΣΩΣΤΟ κώδικα, δηλαδή έκλαιγε — και ένας φρουρός που κλαίει είναι
   φρουρός που κάποιος χαλαρώνει (σταθερή αρχή 19). Μια σάρωση αριστερά-προς-
   δεξιά που ξέρει τι ΕΙΝΑΙ literal δεν έχει αυτή την κατηγορία λάθους. */
function noStrings(s) {
  var out = '', i = 0, n = s.length, prev = '';
  while (i < n) {
    var c = s[i];
    if (c === "'" || c === '"' || c === '`') {
      var q = c; i++;
      while (i < n && s[i] !== q) { if (s[i] === '\\') i++; i++; }
      i++; out += q + q; prev = q; continue;
    }
    /* Regex literal ή διαίρεση; Το κρίνει ο προηγούμενος ΜΗ-ΚΕΝΟΣ χαρακτήρας:
       μετά από τελεστή ή άνοιγμα παρένθεσης δεν μπορεί να είναι διαίρεση. */
    if (c === '/' && '(,=:!&|?{};[+\n'.indexOf(prev || '\n') >= 0) {
      var j = i + 1, cls = false, closed = false;
      for (; j < n; j++) {
        var d = s[j];
        if (d === '\\') { j++; continue; }
        if (d === '\n') break;
        if (d === '[') cls = true;
        else if (d === ']') cls = false;
        else if (d === '/' && !cls) { closed = true; break; }
      }
      if (closed) {
        out += '/RX/'; i = j + 1;
        while (i < n && 'gimsuy'.indexOf(s[i]) >= 0) i++;
        prev = '/'; continue;
      }
    }
    out += c;
    if (!/\s/.test(c)) prev = c;
    i++;
  }
  return out;
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
ok(/\brec\.claimed\s*=\s*Date\.now\(\)/.test(CLAIM), 'doClaim σφραγίζει το claimed');
ok(/\brec\.due\s*=\s*Date\.now\(\)\s*\+\s*CLAIM_DAYS/.test(CLAIM), 'doClaim δίνει σταθερό παρκάρισμα CLAIM_DAYS');
ok(/if\s*\(\s*rec\.runs\s*\)/.test(CLAIM), '⭐ doClaim αρνείται να πατήσει υπάρχουσα ΜΕΤΡΗΣΗ');
ok(CLAIM_T.indexOf('rcBar') >= 0 && CLAIM_T.indexOf('micStop()') >= 0,
  '⭐ doClaim κλείνει την ανάκληση — αλλιώς ένα «Τέλος» με σιωπή γράφει 0% πάνω στη δήλωση');

var UNDO = bodyOf(CODE, 'undoClaim');
ok(UNDO.length > 40, 'υπάρχει undoClaim()');
ok(/if\s*\(\s*!claimedOnly\(rec\)\s*\)\s*return/.test(UNDO),
  '⭐ undoClaim ΔΕΝ μηδενίζει ποτέ μετρημένη πρόοδο');

ok(/!s\.runs/.test(bodyOf(CODE, 'claimedOnly')),
  '⭐ «δηλωμένο» σημαίνει ΚΑΙ «δεν έχει μετρηθεί» — η μέτρηση σβήνει τη δήλωση');

/* ⚠️ Η σκάλα ζει στο regrade() από την als-v457 (το «το είπα αυτό» πρέπει να
   μπορεί να ξαναβαθμολογήσει).  Ο έλεγχος δεν καρφώνεται σε ΜΙΑ συνάρτηση —
   ζητάει να υπάρχει ΑΚΡΙΒΩΣ ΕΝΑ σημείο σε ΟΛΟ το script που ανεβάζει σκαλί,
   και αυτό να είναι κλειδωμένο πίσω από το I.PASS. */
ok((CODE.match(/s\.reviews\s*=\s*[^;]*\+\s*1/g) || []).length === 1,
  'υπάρχει ΑΚΡΙΒΩΣ ΕΝΑ σημείο που ανεβάζει τη σκάλα');
var LAD = bodyOf(CODE, 'regrade');
ok(/cov\s*>=\s*I\.PASS/.test(LAD) && /s\.reviews\s*=\s*sess\.base\.reviews\s*\+\s*1/.test(LAD),
  'η σκάλα ανεβαίνει μόνο σε μετρημένη ανάκληση ≥ I.PASS');
ok(/s\.reviews\s*=\s*sess\.base\.reviews;/.test(LAD),
  '⭐ και ΞΑΝΑΠΕΦΤΕΙ στη βάση αλλιώς — αλλιώς μια διόρθωση θα ανέβαζε σκαλί δύο φορές');
ok(/s\.best\s*=\s*Math\.max\(sess\.base\.best/.test(LAD),
  '⭐ και η ακρίβεια μετριέται από τη φωτογραφία, όχι σωρευτικά');

/* ── 2 · ΕΝΑ ΜΠΛΟΚ, ΔΥΟ ΘΕΣΕΙΣ (σταθερή αρχή 15) ────────────────────── */
ok((CODE.match(/function claimInner\(/g) || []).length === 1,
  'το κουμπί χτίζεται από ΜΙΑ συνάρτηση');
/* ⭐ als-v489: ΤΡΕΙΣ ΘΕΣΕΙΣ ΤΩΡΑ, ΟΧΙ ΔΥΟ — ΤΟ ΤΩΡΑ, το μάθημα και η ανάκληση.
   Ο αριθμός δεν είναι το ζητούμενο· το ζητούμενο είναι ότι τις ζωγραφίζει ΜΙΑ
   συνάρτηση, ώστε να μη γίνουν τρεις διαφορετικές υποσχέσεις (σταθερή αρχή 15). */
ok((TEXT.match(/paintClaim\('ipClaim/g) || []).length === 3,
  'και μπαίνει σε ΤΡΕΙΣ θέσεις, ώστε να μη γίνουν τρεις υποσχέσεις');
ok(TEXT.indexOf('ipClaimNow') > 0, 'θέση 1: ΤΟ ΤΩΡΑ');
ok(TEXT.indexOf('ipClaimL') > 0, 'θέση 2: το μάθημα');
ok(TEXT.indexOf('ipClaimR') > 0, 'θέση 3: η ανάκληση');

/* ── 3 · ΔΗΛΩΜΕΝΟ ΚΑΙ ΜΕΤΡΗΜΕΝΟ ΔΕΝ ΤΥΠΩΝΟΝΤΑΙ ΙΔΙΑ (σταθερή αρχή 10) ─
   ⚠️ Η διάκριση μετακόμισε από τη `row()` της λίστας ύλης στο `chipOf()` της
   ραχοκοκαλιάς, γιατί η λίστα ύλης έγινε ραχοκοκαλιά. Ο ΝΟΜΟΣ είναι ο ίδιος
   και γι' αυτό ο έλεγχος επιβιώνει: μια ΔΗΛΩΣΗ δεν επιτρέπεται να πάρει ποτέ
   ποσοστό, γιατί ποσοστό σημαίνει ότι κάποιος το άκουσε. */
var CHIP = bodyOf(TEXT, 'chipOf');
ok(CHIP.length > 60, 'υπάρχει chipOf()');
ok(/claimedOnly\(rec\)/.test(CHIP), 'το τσιπάκι της ύλης ξέρει τη διαφορά');
ok(/claimedOnly\(rec\)\)\s*return\s*\{[^}]*δηλωμένο/.test(CHIP),
  '⭐ το δηλωμένο γυρίζει ΝΩΡΙΣ και ΔΕΝ φτάνει ποτέ στον υπολογισμό ποσοστού');
ok(CHIP.indexOf('δηλωμένο') >= 0, 'και λέει το όνομά του στη θέση του ποσοστού');
['is-claim', 'is-claim-b', 'is-claim-on', 'is-claim-head', 'is-claim-note', 'is-claim-undo'].forEach(function (c) {
  ok(SRC.indexOf('.' + c + '{') > 0, 'σταθερή αρχή 12: η .' + c + ' ΟΡΙΖΕΤΑΙ στο CSS');
});
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
