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
ok(html.indexOf("var KEY = 'eisagogi:v1'") > 0, 'το κλειδί είναι το eisagogi:v1');
ok(html.indexOf('initCloudSync') < 0, '⛔ η σελίδα δεν σηκώνει engine συγχρονισμού');
const writes = html.match(/localStorage\.setItem\(/g) || [];
eq(writes.length, 1, 'ένα και μοναδικό setItem — και μόνο πίσω από το κουμπί');

/* ── 7. σταθ. 10 — το κείμενο ΓΕΝΝΙΕΤΑΙ ΟΡΑΤΟ ──────────────────
   Η είσοδος (opacity:0) επιτρέπεται ΜΟΝΟ κάτω από html.anim, που το βάζει
   η ίδια η JS αφού δεσμευτεί να τα ανάψει, με δίχτυ setTimeout. Χωρίς
   αυτό, ένα IntersectionObserver που δεν χτύπησε = ολόκληρη μαύρη σελίδα,
   που είναι το «σιωπηλό μηδέν» αυτού του project. */
ok(/html\.anim \.sec\{ opacity:0/.test(html.replace(/\s+/g, ' ').replace('html.anim .sec{ opacity:0', 'html.anim .sec{ opacity:0')),
   'το opacity:0 ζει ΜΟΝΟ κάτω από html.anim');
ok(!/^\s*\.sec\{[^}]*opacity:0/m.test(html), '⛔ καμία .sec δεν γεννιέται αόρατη');
ok(html.indexOf('setTimeout(revealAll') > 0, 'υπάρχει το δίχτυ που τα ανάβει όλα');

/* ── 8. μια κλάση, μια δουλειά (σταθ. 14 σε CSS) ───────────────
   Το .wk ήταν ΚΑΙ ετικέτα κάρτας (display:block) ΚΑΙ τίτλος έργου μέσα σε
   πρόταση — και έσπαγε τη γραμμή στα τρία. Ο inline είναι .ttl. */
ok(html.indexOf('<span class="wk">') < 0,
   '⛔ το .wk δεν χρησιμοποιείται ποτέ inline μέσα σε πρόταση');
ok(html.indexOf('.per > .wk{') > 0, 'το .wk είναι σκοπίμως άμεσο παιδί της κάρτας');

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
