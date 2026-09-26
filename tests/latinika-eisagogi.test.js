/* ═══════════════════════════════════════════════════════════════════
   tests/latinika-eisagogi.test.js — Η ΕΙΣΑΓΩΓΗ ΤΩΝ ΛΑΤΙΝΙΚΩΝ

   ⭐ ΓΙΑΤΙ ΥΠΑΡΧΕΙ ΑΥΤΟ ΤΟ ΑΡΧΕΙΟ.
   Τα δύο πακέτα των Lectio (XVI/XVII) μπήκαν στο repo με `cp` και το
   `tests/latinika-lectio.test.js` τα κλειδώνει με **sha256**: κανείς δεν
   μπορεί να αλλάξει λέξη χωρίς να κοκκινίσει το τεστ.

   Η εισαγωγή ΔΕΝ είχε αρχείο — ήρθε ως κείμενο. Άρα το sha256 δεν έχει τι
   να προστατέψει. Αυτό που πρέπει να προστατευτεί είναι το ΙΔΙΟ πράγμα με
   άλλο σχήμα: **ότι κάθε πρόταση των σημειώσεων υπάρχει στη σελίδα, όπως
   ακριβώς δόθηκε.** Δική του εντολή, 22/08/26:
       «δεν επιτρέπεται να αλλάξεις ούτε μια λέξη ΤΙΠΟΤΑ»
       «ΚΑΝΕ ΤΟ ΛΕΞΗ ΠΡΟΣ ΛΕΞΗ ΟΛΟΣΩΣΤΟ»

   Το `latinika-eisagogi.source.txt` είναι Η ΠΗΓΗ, μία πρόταση/παράγραφος
   ανά γραμμή, ακριβώς όπως την έστειλε. Το τεστ ΔΕΝ διαβάζει την πηγή από
   τη σελίδα (θα ήταν ταυτολογία) — τη διαβάζει από το χωριστό αρχείο και
   απαιτεί να βρίσκεται ΟΛΟΚΛΗΡΗ μέσα στο DATA[] της σελίδας.

   ⚠️ Το κείμενο στη σελίδα φέρει σήμανση (<b>, <span class="la">, …) και
   είναι σπασμένο σε πεδία (nm/yr/ex μιας χρονογραμμής). Γι' αυτό:
     · βγάζουμε ΜΟΝΟ τις τιμές των string literals — όχι τα ονόματα πεδίων,
     · τις ενώνουμε με κενό, ώστε μια πρόταση μοιρασμένη σε δύο πεδία να
       ξαναγίνει συνεχής,
     · σβήνουμε tags και τον δείκτη «|SOS».
   Έτσι το τεστ ελέγχει ΛΕΞΕΙΣ, όχι μορφοποίηση.
   ═══════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
let fail = 0, pass = 0;
function ok(cond, msg){ if (cond){ pass++; console.log('  ✓ ' + msg); }
                        else { fail++; console.log('  ✗ ' + msg); } }
function eq(a, b, msg){ ok(a === b, msg + (a === b ? '' : `  (${a} ≠ ${b})`)); }

const PAGE = 'latinika-eisagogi.html';
const html = fs.readFileSync(path.join(ROOT, PAGE), 'utf8');
const source = fs.readFileSync(path.join(__dirname, 'latinika-eisagogi.source.txt'), 'utf8');

/* ── 1. το DATA[] ──────────────────────────────────────────────── */
const open = html.indexOf('var DATA = [');
const close = html.indexOf('\n];\n', open);
ok(open > 0 && close > open, 'η σελίδα έχει το DATA[] στη θέση του');
const data = html.slice(open, close);

/* Οι τιμές των string literals, ΧΩΡΙΣ τα ονόματα πεδίων. Τα κείμενα είναι
   σε μονά εισαγωγικά· ένα ' μέσα σε κείμενο θα έσπαγε το parsing, γι' αυτό
   η σελίδα χρησιμοποιεί ’ (U+2019) — δες «Γι’ αυτό ο Αύγουστος». */
const values = data.match(/'(?:[^'\\]|\\.)*'/g) || [];
ok(values.length > 60, `βρέθηκαν ${values.length} κείμενα μέσα στο DATA[]`);

function strip(t){
  return t.replace(/<[^>]+>/g, '')
          .replace(/\|SOS/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
}
const flat = strip(values.map(v => v.slice(1, -1)).join(' '));

/* ── 2. ΚΑΘΕ γραμμή της πηγής υπάρχει αυτούσια ─────────────────── */
const lines = source.split('\n').map(l => l.trim()).filter(Boolean);
const missing = lines.filter(l => flat.indexOf(strip(l)) < 0);
eq(missing.length, 0, `και οι ${lines.length} παράγραφοι της πηγής υπάρχουν αυτολεξεί`);
missing.forEach(m => console.log('      ✗ ΛΕΙΠΕΙ: ' + m.slice(0, 120)));

/* ── 3. τα 8 κεφάλαια και η σειρά τους ─────────────────────────── */
const ids = (data.match(/id:'([a-z]+)'/g) || []).map(m => m.slice(4, -1));
eq(ids.join(','),
   'glossa,genesi,epoxes,genika,proklasiki,klasiki,republic,avgousteioi',
   'οκτώ κεφάλαια, στη σειρά του βιβλίου (η φωτο με τον Τίτο Λίβιο ΤΕΛΕΥΤΑΙΑ)');

/* ── 4. ⛔ ΚΑΜΙΑ ΔΙΚΗ ΜΟΥ ΛΕΞΗ ΣΤΙΣ ΚΑΡΤΕΣ ΤΩΝ ΠΡΟΣΩΠΩΝ ─────────
   Είχα γράψει ετικέτες τύπου «ρήτορας · φιλόσοφος · πολιτικός». Δεν
   υπάρχουν στις σημειώσεις. Ό,τι στέκεται ως ετικέτα πρέπει να είναι
   τίτλος έργου που ΥΠΑΡΧΕΙ στην πηγή. Ίδιος κανόνας με το homework.html:
   καμία διακοσμητική λέξη πίσω από κάρτα. */
const kickers = (data.match(/wk:'([^']*)'/g) || []).map(m => m.slice(4, -1));
kickers.forEach(k => ok(source.indexOf(k) >= 0,
  `η ετικέτα «${k}» υπάρχει στην πηγή`));
ok(kickers.every(k => k.indexOf('·') < 0),
  '⛔ καμία ετικέτα δεν είναι λίστα με διαχωριστικό που έφτιαξα εγώ');

/* ── 5. οι λεζάντες των εικόνων μένουν ΧΩΡΙΣΤΕΣ ────────────────
   «Γάιος Βαλέριος Κάτουλλος» και «Λουκρήτιος» είναι ΔΥΟ λεζάντες. Ενωμένες
   με « · » θα πρόσθεταν έναν χαρακτήρα που δεν έγραψε ποτέ κανείς. */
const caps = [].concat(
  (data.match(/cap:'([^']*)'/g) || []).map(m => m.slice(5, -1)),
  (data.match(/ fig:'([^']*)'/g) || []).map(m => m.slice(6, -1))
);
eq(caps.length, 7, 'επτά λεζάντες εικόνων');
caps.forEach(c => ok(source.indexOf(c) >= 0 && c.indexOf(' · ') < 0,
  `η λεζάντα «${c}» είναι αυτούσια και ασυγχώνευτη`));

/* ── 6. ο αναγνώστης ΔΕΝ ΓΡΑΦΕΙ σε ξένο κλειδί ─────────────────
   Η σελίδα κρατάει ΜΟΝΟ το δικό της `eisagogi:v1`, device-local — ίδιος
   λόγος με τα lectio κλειδιά: πίνακες/χάρτες που το mergeArray θα ένωνε,
   οπότε το «ξεμαρκάρισμα» θα γύριζε πίσω από την άλλη συσκευή. */
ok(html.indexOf("var READ_KEY = 'eisagogi:v1'") > 0, 'το κλειδί «το διάβασα» είναι το eisagogi:v1');

/* ── 6β. Ο ΣΥΓΧΡΟΝΙΣΜΟΣ (als-v579) ────────────────────────────
   ⭐ ΑΛΛΑΞΕ ΕΠΙΤΗΔΕΣ. Ως την als-v503 η σελίδα κρατούσε ΜΟΝΟ ένα boolean
   ανά κεφάλαιο και σωστά έμενε εκτός sync. Τώρα κρατάει ΠΛΑΓΙΟΤΙΤΛΟΥΣ και
   ΟΡΙΣΜΟΥΣ — ώρες δουλειάς — που ΔΕΝ επιτρέπεται να ζουν σε μία συσκευή.
   ⛔ ΚΑΙ ΤΟ `eisagogi:v1` ΜΕΝΕΙ DEVICE-LOCAL: είναι χάρτης από booleans,
   δηλαδή το σχήμα που η σταθ. 31 λέει ότι ο merge ΔΕΝ κρατάει τοπικά. */
ok(/initCloudSync\(\{\s*appKey:\s*'eisagogi'/.test(html.replace(/\s+/g, ' ')),
   'σηκώνει engine συγχρονισμού με δικό της appKey');
ok(/syncedPrefixes:\s*\[\s*NKEY\s*\]/.test(html), 'συγχρονίζει το πρόθεμα των σημειώσεων');
ok(!/syncedKeys[^\]]*eisagogi:v1/.test(html.replace(/\s+/g, ' ')),
   '⛔ το «το διάβασα» ΔΕΝ μπαίνει στο sync (σταθ. 31)');
{
  const bk = fs.readFileSync(path.join(ROOT, 'backup.html'), 'utf8');
  ok(/'eisagogi':\s*\{[^}]*'eis:notes:'/.test(bk.replace(/\s+/g, ' ')),
     'το πρόθεμα είναι στα BUNDLES του backup.html (αλλιώς συγχρονίζεται και δεν επαναφέρεται ΠΟΤΕ)');
}

/* ── 6γ. ΟΙ ΓΡΑΦΕΙΣ ΕΙΝΑΙ ΑΠΑΡΙΘΜΗΜΕΝΟΙ, ΚΑΙ ΚΑΝΕΝΑΣ ΔΕΝ ΖΕΙ ΣΕ RENDER
   Ο `nut:streak` χάθηκε επειδή ένας ΑΝΑΓΝΩΣΤΗΣ έγραφε (als-v436). */
{
  const sites = html.match(/localStorage\.setItem\(([^,]+),/g) || [];
  eq(sites.length, 4, 'τέσσερις γραφείς: οι σημειώσεις, οι δύο της ταφόπλακας, το «το διάβασα»');
  const RENDERERS = ['function render(', 'function renderUnit(', 'function paintPanel(',
                     'function paintBar(', 'function marginFor('];
  RENDERERS.forEach(fn => {
    const a = html.indexOf(fn);
    ok(a > 0, 'υπάρχει ο renderer ' + fn.slice(9, -1));
    if (a < 0) return;
    /* το σώμα ως το επόμενο top-level `\nfunction ` ή `\n/*` */
    let b = html.indexOf('\nfunction ', a + 1);
    const c = html.indexOf('\n/*', a + 1);
    if (c > 0 && (b < 0 || c < b)) b = c;
    const body = html.slice(a, b < 0 ? a + 4000 : b);
    ok(body.indexOf('localStorage.setItem') < 0,
       '⛔ ο ' + fn.slice(9, -1) + ' δεν ΓΡΑΦΕΙ (σταθ. 10 + als-v436)');
  });
}

/* ── 6δ. ΣΤΑΘ. 61 — ΜΙΑ ΚΑΙ ΜΟΝΟ ΜΙΑ ΣΥΝΑΡΤΗΣΗ ΣΒΗΝΕΙ ΣΗΜΕΙΩΣΗ
   Η istoria-voithima είχε ΠΕΝΤΕ πόρτες σβησίματος και η als-v565 έκλεισε
   τις δύο. Μια απαρίθμηση με ΟΝΟΜΑΤΑ είναι δείγμα, όχι απογραφή — αυτός
   ο φρουρός σαρώνει ΟΛΟ το αρχείο. */
{
  const CODE = html.replace(/\/\*[\s\S]*?\*\//g, '');
  const cuts = CODE.match(/notes\[[^\]]+\]\s*=\s*[^;]*\.filter\(|notes\.(?:heads|defs)\s*=\s*[^;]*\.filter\(|\.splice\(/g) || [];
  ok(cuts.length > 0, 'ο φρουρός του σβησίματος όντως πιάνει κάτι (θετικός έλεγχος)');
  const a = CODE.indexOf('function removeNote(');
  ok(a > 0, 'υπάρχει η removeNote');
  let b = CODE.indexOf('\nfunction ', a + 1);
  const only = CODE.slice(a, b < 0 ? CODE.length : b);
  const inside = only.match(/notes\[[^\]]+\]\s*=\s*[^;]*\.filter\(|notes\.(?:heads|defs)\s*=\s*[^;]*\.filter\(|\.splice\(/g) || [];
  eq(cuts.length, inside.length, '⛔ καμία αφαίρεση σημείωσης δεν ζει ΕΞΩ από την removeNote');
  ok(only.indexOf('tombNote(') > 0, 'η removeNote σφραγίζει ταφόπλακα');
  ok(only.indexOf('saveNotes()') < only.indexOf('tombNote('),
     'η ταφόπλακα μπαίνει ΜΕΤΑ από επιβεβαιωμένη εγγραφή (als-v424)');
}
/* η ταφόπλακα ΞΑΝΑΔΙΑΒΑΖΕΤΑΙ — σε Safari το localStorage ΣΩΠΑΙΝΕΙ */
ok(/const back = JSON\.parse|var back = JSON\.parse/.test(html),
   'η tombNote ξαναδιαβάζει πριν πει «σφράγισα» (σταθ. 10)');
ok(html.indexOf('function untombNotes(') > 0, 'η αναίρεση σηκώνει την ταφόπλακα');

/* ── 7. σταθ. 10/39 — ΤΟ ΚΕΙΜΕΝΟ ΓΕΝΝΙΕΤΑΙ ΟΡΑΤΟ ──────────────
   ⭐ Η als-v579 είναι ΑΥΣΤΗΡΟΤΕΡΗ από τον παλιό κανόνα: δεν υπάρχει
   καθόλου είσοδος, άρα δεν υπάρχει τίποτα να μείνει σβηστό. Η als-v503
   είχε βγει ΕΝΤΕΛΩΣ ΜΑΥΡΗ ακριβώς από αυτό. */
{
  const CSS = html.slice(html.indexOf('<style>'), html.indexOf('</style>'))
                  .replace(/\/\*[\s\S]*?\*\//g, '');
  ok(!/opacity\s*:\s*0(?![.\d])/.test(CSS), '⛔ ΚΑΝΕΝΑ opacity:0 στο φύλλο στυλ');
  ok(CSS.indexOf('IntersectionObserver') < 0 && html.indexOf('IntersectionObserver') < 0,
     '⛔ κανένα IntersectionObserver — τίποτα δεν περιμένει κώδικα για να φανεί');
  /* σταθ. 51: η πλήρης όψη γράφεται ΠΡΩΤΑ, το τηλέφωνο τη ΜΑΖΕΥΕΙ */
  ok(!/@media\s*\(\s*min-width/.test(CSS), '⛔ ΚΑΝΕΝΑ @media(min-width) — σταθ. 51');
  /* σταθ. 12: κάθε κλάση/ιδιότητα που γυρίζει η JS ΠΡΕΠΕΙ να υπάρχει σε CSS */
  ['.world[hidden]', '.nums[hidden]', '.banner[hidden]'].forEach(sel => {
    ok(CSS.indexOf(sel) > 0, 'ο κανόνας ' + sel + ' υπάρχει (σταθ. 12)');
  });
  ok(/\.selbar\[hidden\][^{]*\{display:none\}|\.selbar\[hidden\],/.test(CSS),
     'τα fixed παιδιά έχουν κανόνα [hidden] (σταθ. 12)');
}

/* ── 8. μια κλάση, μια δουλειά (σταθ. 50) ─────────────────────
   Το .wk ήταν ΚΑΙ ετικέτα κάρτας (display:block) ΚΑΙ τίτλος έργου μέσα σε
   πρόταση — και έσπαγε τη γραμμή στα τρία. Στην als-v579 η ετικέτα λέγεται
   .pwork και ο renderer ΜΕΤΑΤΡΕΠΕΙ κάθε inline `wk` σε `ttl`. */
ok(html.indexOf('<span class="wk">') < 0,
   '⛔ το .wk δεν χρησιμοποιείται ποτέ inline μέσα σε πρόταση');
ok(html.indexOf('.pwork{') > 0, 'η ετικέτα του έργου έχει ΔΙΚΟ της όνομα');
ok(/sp\.cls === 'wk' \? 'ttl'/.test(html),
   'ο renderer γυρίζει κάθε inline wk σε ttl — η σταθ. 50 δεν μπορεί να ξαναχτυπήσει');

/* ── 9. ο σύνδεσμος επιστροφής + η βιβλιοθήκη τη δείχνει ────────
   Ένα πακέτο μελέτης το βρίσκει Ο ΓΟΝΙΟΣ του, όχι μια λίστα. */
ok(html.indexOf('href="latinika.html"') > 0, 'γυρίζει πίσω στα Λατινικά');
const hub = fs.readFileSync(path.join(ROOT, 'latinika.html'), 'utf8');
ok(hub.indexOf('latinika-eisagogi.html') > 0, 'η latinika.html ανοίγει την εισαγωγή');

/* ── 10. στο service worker ────────────────────────────────────── */
const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
ok(sw.indexOf("'" + PAGE + "'") > 0, 'το πακέτο είναι στο CORE του sw.js');

console.log(`\n  ${pass} πέρασαν · ${fail} απέτυχαν`);
process.exit(fail ? 1 : 0);
