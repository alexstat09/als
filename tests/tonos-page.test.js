/* tests/tonos-page.test.js — ΤΟ ΣΥΜΒΟΛΑΙΟ ΤΗΣ ΣΕΛΙΔΑΣ, als-v510
 *
 * ⭐ ΓΙΑΤΙ ΥΠΑΡΧΕΙ: οι τρεις λόγοι που ο Άλεξ είπε «χάλια» ήταν ΝΟΥΜΕΡΑ, όχι
 * γούστο — πλάτος 600px, γραμματοσειρά με ΜΗΔΕΝ πολυτονικά γλυφικά, και
 * κείμενο ανάγνωσης σε αντίθεση 2.98:1. Κανένα λειτουργικό test δεν βλέπει
 * τίποτα από αυτά, γιατί η σελίδα δούλευε τέλεια όλη την ώρα.
 * Αυτό το αρχείο είναι **συμβόλαιο CSS**: κλειδώνει τα νούμερα.
 *
 * ⚠️ ΤΑ ΣΧΟΛΙΑ ΒΓΑΙΝΟΥΝ ΠΡΙΝ ΑΠΟ ΚΑΘΕ ΑΝΑΛΥΣΗ CSS. Η πρώτη γραφή του
 * αδελφού του αρχείου «έβρισκε» ένα `min-width` που ήταν Η ΙΔΙΑ Η ΠΕΡΙΓΡΑΦΗ
 * ΤΟΥ BUG μέσα σε σχόλιο — φρουρός που κράζει για σχόλια είναι φρουρός που
 * κάποιος χαλαρώνει (σταθ. 19).
 */
'use strict';

var fs = require('fs');
var path = require('path');
var R = path.join(__dirname, '..');
var HTML = fs.readFileSync(path.join(R, 'tonos.html'), 'utf8');
var ARX = fs.readFileSync(path.join(R, 'arxaia.html'), 'utf8');
var SW = fs.readFileSync(path.join(R, 'sw.js'), 'utf8');

function stripComments(t){
  return t.replace(/<!--[\s\S]*?-->/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
}
var CLEAN = stripComments(HTML);
var CSS = (CLEAN.match(/<style>([\s\S]*?)<\/style>/) || ['',''])[1];

var pass = 0, fail = 0, notes = [];
function ok(c, m){ if (c) pass++; else { fail++; notes.push('✗ ' + m); } }
function eq(a, b, m){ ok(a === b, m + '  →  «' + a + '» ≠ «' + b + '»'); }

/* ═══ Α · ΤΟ ΠΛΑΤΟΣ (σταθ. 51) ══════════════════════════════════════ */
ok(/\.tn-wrap\{[^}]*max-width:1240px/.test(CSS),
  'Α1 · η .tn-wrap είναι 1240px, όχι λωρίδα 600px σε οθόνη λάπτοπ');

/* ⛔⛔ Η ΑΝΑΠΟΔΗ ΘΡΑΥΣΗ. Ένα `min-width` μετράει το VIEWPORT, όχι τον
   γονέα — έτσι γεννιούνται δύο στήλες των 280px σε οθόνη 2000px. */
var mq = CSS.match(/@media[^{]*\(min-width/g) || [];
eq(mq.length, 0, 'Α2 · ΚΑΝΕΝΑ @media (min-width) στη σελίδα');

/* Το μοναδικό επιτρεπτό `min-width:max-content` είναι ΜΕΣΑ στο
   max-width:1040px — δηλαδή στο ΤΗΛΕΦΩΝΟ, όπου η κύλιση είναι σωστή. */
var phoneBlock = (CSS.match(/@media \(max-width:1040px\)\{([\s\S]*?)\n  \}/) || ['',''])[1];
ok(phoneBlock.length > 40, 'Α3 · υπάρχει το σημείο θραύσης των 1040px');
ok(/min-width:max-content/.test(phoneBlock),
  'Α4 · ο πίνακας των κανόνων ΚΥΛΑΕΙ στο τηλέφωνο');
var lawgLaptop = (CSS.match(/\.tn-lawg\{([\s\S]*?)\}/) || ['',''])[1];
ok(!/min-width:max-content/.test(lawgLaptop),
  'Α5 · ⭐ ο πίνακας ΧΩΡΑΕΙ στο λάπτοπ — αλλιώς η 4η στήλη («Η ΜΗΧΑΝΗ») ζει εκτός οθόνης');
ok(/grid-template-columns:[^;]*150px/.test(lawgLaptop),
  'Α6 · η στήλη της μηχανής έχει πλάτος για τη δικαιολογία της');

/* ⛔⛔ ΣΤΑΘ. 50 — ΜΙΑ ΚΛΑΣΗ, ΜΙΑ ΔΟΥΛΕΙΑ, ΚΑΙ ΤΟ ΠΛΗΡΩΣΑ ΕΔΩ.
   Τα σκαλοπάτια γεννήθηκαν με `.tn-opt/.tn-opts` — ονόματα που ΑΝΗΚΑΝ ΗΔΗ
   στις επιλογές του ΚΟΥΙΖ, όπου το δοχείο είναι `flex-direction:column`.
   Αποτέλεσμα: τα δύο κουμπιά ποσότητας βγήκαν **710px το καθένα μέσα σε
   δοχείο 710** και στοιβάχτηκαν — και ταυτόχρονα οι δικοί μου κανόνες
   ΞΑΝΑΕΝΤΥΝΑΝ σιωπηλά το κουίζ, που δεν είχα αγγίξει.
   Τα σκαλοπάτια φοράνε `.st-opt(s)` τώρα, και το test φυλάει ΚΑΙ ΤΑ ΔΥΟ:
   το δικό μου να είναι πλέγμα, ΚΑΙ του κουίζ να έχει μείνει στήλη. */
var opts = (CSS.match(/\.st-opts\{([\s\S]*?)\}/) || ['',''])[1];
ok(/display:grid/.test(opts), 'Α7 · οι επιλογές των σκαλοπατιών είναι ΠΛΕΓΜΑ');
ok(!/display:flex/.test(opts), 'Α8 · και δεν έμεινε flex από πάνω');

var quiz = (CSS.match(/\.tn-opts\{([\s\S]*?)\}/) || ['',''])[1];
ok(/flex-direction:column/.test(quiz),
  'Α9 · ⭐ οι επιλογές του ΚΟΥΙΖ έμειναν στήλη — δεν τις πείραξα κατά λάθος');
var mineStart = CSS.indexOf('.tn-steps{');
ok(mineStart > 0 && CSS.slice(mineStart).indexOf('.tn-opt') < 0,
  'Α10 · ⛔ κανένα `.tn-opt` μέσα στο μπλοκ των σκαλοπατιών');

/* ═══ Β · Η ΓΡΑΜΜΑΤΟΣΕΙΡΑ (σταθ. 43 · als-v504) ═════════════════════ */
ok(/fonts\.googleapis\.com\/css2\?family=GFS\+Didot/.test(HTML),
  'Β1 · η GFS Didot φορτώνεται με δικό της link');
ok(/--ar-gr:"GFS Didot","Times New Roman"/.test(CSS),
  'Β2 · η αλυσίδα πέφτει σε Times New Roman (233 πολυτονικά), όχι σε Georgia');

/* ⛔ Η Georgia ΕΙΝΑΙ Η ΑΙΤΙΑ (ΜΗΔΕΝ πολυτονικά γλυφικά). Απαγορεύεται
   ακόμη και ως fallback: ένα πεσμένο CDN θα επανέφερε το bug αυτούσιο. */
ok(!/--ar-gr:[^;]*Georgia/.test(CSS),
  'Β3 · ⛔ καμία Georgia μέσα στην αλυσίδα των αρχαίων');

/* Κάθε επιλογέας που ζωγραφίζει ΑΡΧΑΙΑ λέξη παίρνει --ar-gr. */
[['.gr\\{', 'η γενική κλάση των αρχαίων'],
 ['\\.tn-w \\.l\\{', 'η λέξη στη λίστα'],
 ['\\.tn-word \\.bare\\{', 'η άτονη λέξη των σκαλοπατιών'],
 ['\\.st-opt\\.gr\\{', 'οι επιλογές τόνου'],
 ['\\.tn-at\\{', 'οι άτονες λέξεις'],
 ['\\.tn-gi\\{', 'οι δασυνόμενες']
].forEach(function(p){
  var m = CSS.match(new RegExp(p[0] + '([^}]*)\\}'));
  ok(!!m && /var\(--ar-gr\)/.test(m[1]), 'Β4 · ' + p[1] + ' → --ar-gr');
});

/* ═══ Γ · Η ΑΝΤΙΘΕΣΗ (σταθ. 52) ═════════════════════════════════════
   Το --au-faint είναι 2.98:1. Επιτρέπεται ΜΟΝΟ σε ετικέτες και μετρητές.
   Ο έλεγχος: κάθε κανόνας που το χρησιμοποιεί ΚΑΙ δηλώνει font-size
   πρέπει να είναι mono ή uppercase — δηλαδή ετικέτα, όχι πρόζα. */
var rules = CSS.split('}');
var readingOnFaint = [];
rules.forEach(function(r){
  if (r.indexOf('--au-faint') < 0) return;
  var fs2 = r.match(/font-size:([\d.]+)px/);
  if (!fs2) return;
  var size = parseFloat(fs2[1]);
  var isLabel = /au-mono/.test(r) || /text-transform:uppercase/.test(r) || /letter-spacing:\.1[0-9]/.test(r);
  if (size >= 13 && !isLabel) readingOnFaint.push((r.split('{')[0] || '').trim() + ' @' + size + 'px');
});
eq(readingOnFaint.length, 0,
  'Γ1 · κανένα κείμενο ανάγνωσης σε --au-faint  →  ' + readingOnFaint.join(' · '));

['.tn-foot', '.tn-qgloss', '.tn-legend'].forEach(function(sel){
  var m = CSS.match(new RegExp('\\' + sel + '\\{([^}]*)\\}'));
  ok(!!m && /--au-dim/.test(m[1]), 'Γ2 · το ' + sel + ' διαβάζεται (--au-dim, 7.11:1)');
  var sz = m && m[1].match(/font-size:([\d.]+)px/);
  ok(!!sz && parseFloat(sz[1]) >= 13.5, 'Γ3 · το ' + sel + ' είναι ≥13.5px');
});

/* ═══ Δ · ΣΤΑΘ. 35 — ΤΟ `load()` ΕΙΝΑΙ ΛΙΣΤΑ ΕΠΙΤΡΕΠΟΜΕΝΩΝ ══════════
   Κάθε νέο πεδίο πρέπει να γραφτεί ΚΑΙ στο blank() ΚΑΙ στο load(),
   αλλιώς σβήνεται σιωπηλά σε κάθε φόρτωση — και με sync, μια πρόοδος που
   κατέβηκε από άλλη συσκευή εξαφανίζεται στο επόμενο save(). */
var blankFn = (CLEAN.match(/function blank\(\)\{([\s\S]*?)\n  \}/) || ['',''])[1];
var loadFn  = (CLEAN.match(/function load\(\)\{([\s\S]*?)\n  \}/) || ['',''])[1];
['cells', 'days', 'sessions', 'steps'].forEach(function(f){
  ok(blankFn.indexOf(f) >= 0, 'Δ1 · το «' + f + '» υπάρχει στο blank()');
  ok(loadFn.indexOf(f) >= 0,  'Δ2 · ⭐ το «' + f + '» ΑΝΤΙΓΡΑΦΕΤΑΙ στο load()');
});

/* ═══ Ε · Η ΥΛΗ ΦΤΑΝΕΙ ΣΤΗ ΣΕΛΙΔΑ ══════════════════════════════════ */
ok(/<script src="tonos-fyllo\.js"><\/script>/.test(HTML),
  'Ε1 · η σελίδα φορτώνει το tonos-fyllo.js');
ok(SW.indexOf("'tonos-fyllo.js'") >= 0,
  'Ε2 · και είναι στο CORE του service worker (αλλιώς offline δεν υπάρχει ύλη)');
ok(/var CACHE = "als-v5\d\d"/.test(SW), 'Ε3 · το CACHE είναι σε έκδοση als-v5xx');

/* ═══ ΣΤ · ΤΟ ΡΑΦΙ ΣΤΟΝ ΑΓΝΩΣΤΟ ════════════════════════════════════
   ⛔⛔ Η `arxaia.html` ΔΙΑΒΑΖΕΙ το `ton:v1`, ΠΟΤΕ δεν το γράφει (σταθ. 16).
   Ένα setItem από εκεί δεν θα έσπρωχνε ποτέ (άλλη μηχανή sync), δεν θα
   άφηνε ταφόπλακα, και η σελίδα-ιδιοκτήτης θα το έγραφε από πάνω. */
var ARXC = stripComments(ARX);
ok(/id="tonSh"/.test(ARX), 'ΣΤ1 · το ράφι του Τονισμού υπάρχει στον Άγνωστο');
ok(/href="tonos\.html"/.test(ARXC), 'ΣΤ2 · και οδηγεί στη σελίδα που κατέχει την πρόοδο');

var writes = ARXC.match(/setItem\(\s*['"]ton:v1/g) || [];
eq(writes.length, 0, 'ΣΤ3 · ⛔ η arxaia.html ΔΕΝ γράφει ποτέ στο ton:v1');
var tonShelf = (ARXC.match(/function tonShelf\(\)\{([\s\S]*?)\n  \}\)\(\);/) || ['',''])[1];
ok(tonShelf.length > 200, 'ΣΤ4 · ο αναγνώστης του ραφιού βρέθηκε');
ok(tonShelf.indexOf('setItem') < 0, 'ΣΤ5 · ⛔ καμία εγγραφή μέσα στον αναγνώστη');
/* σταθ. 33: «δεν το άνοιξε ποτέ» ΔΕΝ είναι μηδέν, και «δεν διαβάστηκε»
   δεν είναι το ίδιο με «αδιάβαστο». Τρεις καταστάσεις, τρεις προτάσεις. */
ok(/αδιάβαστο/.test(tonShelf), 'ΣΤ6 · λέει «αδιάβαστο», όχι «0/16»');
ok(/δεν διαβάστηκε/.test(tonShelf),
  'ΣΤ7 · ⭐ και ξεχωρίζει το «απέτυχα να διαβάσω» από το «δεν το ξεκίνησε» (σταθ. 10)');

/* ═══ Ζ · ΚΑΝΕΝΑ ΜΙΚΡΟΦΩΝΟ (σταθ. 42) ══════════════════════════════
   Δύο όψεων, όπως λέει ο κανόνας: απαγορευμένο εδώ ΚΑΙ απαιτούμενο εκεί. */
ok(!/SpeechRecognition/.test(HTML), 'Ζ1 · ⛔ καμία αναγνώριση φωνής στον Τονισμό');
var IST = fs.readFileSync(path.join(R, 'istoria.html'), 'utf8');
ok(/SpeechRecognition/.test(IST), 'Ζ2 · και ΥΠΑΡΧΕΙ ακόμη στην Ιστορία, όπου ανήκει');

console.log('\ntonos-page: ' + pass + ' πέρασαν, ' + fail + ' έπεσαν');
if (fail){ console.log('\n' + notes.join('\n')); process.exit(1); }
console.log('ΟΛΑ ΠΡΑΣΙΝΑ');
