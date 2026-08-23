/* ══════════════════════════════════════════════════════════════════════
   tests/arxaia-laptop.test.js — ΤΟ ΛΑΠΤΟΠ ΔΕΝ ΕΙΝΑΙ ΜΕΓΑΛΟ ΚΙΝΗΤΟ

   ⭐⭐⭐ ΓΙΑΤΙ ΥΠΑΡΧΕΙ. Δικά του λόγια, als-v507:
     «δεν κτλβαινω γιατι οτιδηποτε σου ζητω να φτιαχνεις παντα το κανεις
      σε μορφη κινητου και ασχημο… απο το λαπτοπ θα διαβαζω»

   Είχε δίκιο, και η αιτία ΔΕΝ ήταν γούστο — ήταν τρία μετρήσιμα λάθη που
   καμία λειτουργική βεβαίωση δεν βλέπει, γιατί η σελίδα δούλευε τέλεια:

     1. ΤΟ ΠΛΑΤΟΣ. `.ar-wrap` = 620px. Ο ΓΝΩΣΤΟΣ πήρε override 1240px στην
        als-v498· ο ΑΓΝΩΣΤΟΣ δεν το πήρε ποτέ. Λωρίδα μέσα σε μαύρο.
     2. ⛔ Η ΑΝΑΠΟΔΗ ΘΡΑΥΣΗ. Είχα γράψει `@media(min-width:900px)` για δύο
        στήλες. Το media query μετράει το VIEWPORT, ΟΧΙ τον γονέα — άρα σε
        λάπτοπ έσπαγε τη λωρίδα των 620px σε δύο στήλες των ~280px.
        ΧΕΙΡΟΤΕΡΟ από μία στήλη. Αυτό ήταν το «μορφή κινητού».
     3. ⛔ ΠΕΡΙΕΧΟΜΕΝΟ ΝΤΥΜΕΝΟ ΣΑΝ ΧΡΩΜΙΟ. Το `--au-faint` μετράει 2.98:1
        πάνω στο #050506 — κάτω από το 4.5:1 του WCAG AA — και το είχα
        δώσει στη ΦΡΑΣΗ ΤΟΥ ΦΥΛΛΑΔΙΟΥ, στις σημασίες των ρημάτων και στην
        εκφορά, στα 11.5-12.5px. Το πιο σημαντικό κείμενο της σελίδας ήταν
        το πιο δυσανάγνωστο.

   Αυτό το αρχείο τα κλειδώνει και τα τρία. Δεν ελέγχει «αν είναι ωραίο» —
   ελέγχει τα ΝΟΥΜΕΡΑ κάτω από το ωραίο.
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');
const ALS = path.resolve(__dirname, '..');

let pass = 0, fail = 0;
function ok(name, cond){ cond ? pass++ : fail++; console.log((cond ? '  ✓ ' : '  ✗ FAIL ') + name); }
function is(name, got, want){
  const good = String(got) === String(want);
  good ? pass++ : fail++;
  console.log((good ? '  ✓ ' : '  ✗ FAIL ') + name + (good ? '' : `\n      got ${got} · want ${want}`));
}
function section(s){ console.log('\n' + s); }

const PAGE = fs.readFileSync(path.join(ALS, 'arxaia.html'), 'utf8');
/* ⚠️ ΤΑ ΣΧΟΛΙΑ ΒΓΑΙΝΟΥΝ ΠΡΩΤΑ. Η πρώτη γραφή αυτού του τεστ «έβρισκε»
   ένα @media(min-width) που ήταν Η ΙΔΙΑ Η ΠΕΡΙΓΡΑΦΗ ΤΟΥ BUG μέσα σε
   σχόλιο. Ένα τεστ που διαβάζει τα σχόλιά του δεν ελέγχει τον κώδικα. */
const RAW = PAGE.slice(PAGE.indexOf('<style>'), PAGE.indexOf('</style>'));
const CSS = RAW.replace(/\/\*[\s\S]*?\*\//g, '');

/* ══ 1 · ΤΟ ΠΛΑΤΟΣ ═══════════════════════════════════════════════════ */
section('1 · ΟΙ ΔΥΟ ΚΟΣΜΟΙ ΕΧΟΥΝ ΤΟ ΙΔΙΟ ΠΛΑΤΟΣ ΚΑΙ ΤΗΝ ΙΔΙΑ ΘΡΑΥΣΗ');
const wide = sel => {
  const m = new RegExp(sel.replace(/[.#]/g, '\\$&') + '\\{[^}]*max-width:(\\d+)px').exec(CSS);
  return m ? +m[1] : null;
};
const gnW = wide('#gnWrap.ar-wrap'), agW = wide('#agWrap.ar-wrap');
ok('ο ΓΝΩΣΤΟΣ έχει πλάτος laptop', gnW >= 1100);
ok('⭐ ο ΑΓΝΩΣΤΟΣ ΤΟ ΕΧΕΙ ΚΙ ΑΥΤΟΣ (εδώ ήταν το bug)', agW >= 1100);
is('και είναι ΤΟ ΙΔΙΟ — δύο κόσμοι σε άλλο πλάτος είναι δύο κόσμοι να μάθεις', agW, gnW);

/* Το σημείο θραύσης ΤΩΝ ΣΤΗΛΩΝ πρέπει να είναι ΕΝΑ. (Άλλα, μικρότερα
   breakpoints για λεπτομέρειες τηλεφώνου είναι θεμιτά — εδώ ελέγχεται
   μόνο το σημείο όπου οι δύο κόσμοι μαζεύουν τις στήλες τους.) */
function collapseAt(colSel){
  const at = CSS.indexOf(colSel + '{ grid-template-columns:1fr');
  if (at < 0) return null;
  const before = CSS.slice(0, at);
  const m = [...before.matchAll(/@media\(max-width:(\d+)px\)/g)].pop();
  return m ? +m[1] : null;
}
const gnBp = collapseAt('#gnWrap .gn-cols'), agBp = collapseAt('#agWrap .ag-cols');
ok('ο ΓΝΩΣΤΟΣ μαζεύει τις στήλες του σε σημείο θραύσης', !!gnBp);
ok('ο ΑΓΝΩΣΤΟΣ επίσης', !!agBp);
is('⭐ και είναι ΤΟ ΙΔΙΟ σημείο', agBp, gnBp);

/* ══ 2 · Η ΑΝΑΠΟΔΗ ΘΡΑΥΣΗ ════════════════════════════════════════════ */
section('2 · ⛔ ΚΑΜΙΑ ΘΡΑΥΣΗ ΠΡΟΣ ΤΑ ΠΑΝΩ');
/* Ο κανόνας του project: η πλήρης όψη γράφεται ΠΡΩΤΑ, και το τηλέφωνο τη
   ΜΑΖΕΥΕΙ με `max-width`. Ένα `min-width` ανοίγει στήλες με βάση το
   VIEWPORT χωρίς να ξέρει τι πλάτος έχει ο γονέας — και έτσι γεννήθηκαν
   οι δύο στήλες των 280px μέσα σε λωρίδα 620px. */
is('κανένα @media(min-width) πουθενά στη σελίδα', (CSS.match(/@media[^{]*min-width/g) || []).length, 0);
ok('οι στήλες δηλώνονται σε ΠΛΗΡΕΣ πλάτος', /#agWrap \.ag-cols\{[^}]*grid-template-columns:1\.34fr \.86fr/.test(CSS));
ok('και μαζεύονται σε μία κάτω από τη θραύση', /@media\(max-width:1040px\)\{[\s\S]*?#agWrap \.ag-cols\{ grid-template-columns:1fr/.test(CSS));

/* ══ 3 · ΠΕΡΙΕΧΟΜΕΝΟ ≠ ΧΡΩΜΙΟ ════════════════════════════════════════ */
section('3 · ΟΤΙ ΔΙΑΒΑΖΕΤΑΙ ΕΧΕΙ ΑΝΤΙΘΕΣΗ ΚΑΙ ΜΕΓΕΘΟΣ');
/* --au-faint = rgba(245,242,236,.30) → 2.98:1 πάνω στο #050506.
   Επιτρέπεται ΜΟΝΟ σε ετικέτες/μετρητές. Κάθε λέξη που τη διαβάζει
   πρέπει να είναι --au-dim (7.11:1) ή --au-ivory (18.2:1). */
const CONTENT = [
  '#synLesson .cmp-src',    /* Η ΦΡΑΣΗ ΤΟΥ ΦΥΛΛΑΔΙΟΥ — το πιο σημαντικό κείμενο */
  '#synLesson .cmp-v',
  '#synLesson .pl-i i',     /* η σημασία του ρήματος */
  '#synLesson .pl-i .ex',
  '#synLesson .tr-l .nt',   /* η εκφορά της πρότασης */
  '#synLesson .tr-bn',
  '#synLesson .sy-note p',
  '#synLesson .sy-sw .sg',
  '#synLesson .sy-gap',
  '#synLesson .sy-src',
  '#synLesson .sy-done p',
  '#agWrap .sh-note'
];
function rule(sel){
  const at = CSS.indexOf(sel + '{');
  if (at < 0) return null;
  return CSS.slice(at, CSS.indexOf('}', at));
}
let faint = [], tiny = [];
CONTENT.forEach(sel => {
  const r = rule(sel);
  if (r == null){ fail++; console.log('  ✗ FAIL λείπει ο κανόνας ' + sel); return; }
  if (/--au-faint/.test(r)) faint.push(sel);
  const fs2 = /font-size:([\d.]+)px/.exec(r);
  if (fs2 && +fs2[1] < 13.5) tiny.push(sel + ' @' + fs2[1] + 'px');
});
is('⛔ κανένα κείμενο ανάγνωσης στο --au-faint (2.98:1)', faint.join(', '), '');
is('⛔ κανένα κείμενο ανάγνωσης κάτω από 13.5px', tiny.join(', '), '');
ok('η φράση του φυλλαδίου είναι πλέον 14.5px σε --au-dim',
   /#synLesson \.cmp-src\{[^}]*font-size:14\.5px[\s\S]*?--au-dim/.test(CSS));

/* ══ 4 · ΤΟ ΜΕΤΡΟ ΑΝΑΓΝΩΣΗΣ ══════════════════════════════════════════ */
section('4 · Η ΠΡΟΖΑ ΔΕΝ ΤΕΝΤΩΝΕΤΑΙ ΣΤΑ 1180px');
/* Η μία απόφαση της als-v500: κάθε στρώση παίρνει ΤΟ ΔΙΚΟ ΤΗΣ πλάτος.
   Η πρόζα μένει σε μέτρο ανάγνωσης· η αντιπαραβολή παίρνει όλο το πλάτος,
   γιατί εκεί είναι όλο το κέρδος του λάπτοπ. */
[['#synLesson .sy-lead', 70], ['#synLesson .sy-note p', null], ['#synLesson .sy-mine', 78],
 ['#synLesson .sy-gap', 78], ['#agWrap .ar-foot', 78]].forEach(([sel, max]) => {
  /* Το μέτρο μπορεί να ζει στον ΓΟΝΕΑ (`.sy-note` αντί για `.sy-note p`)
     — αυτό είναι σωστό, αρκεί να υπάρχει κάπου στην αλυσίδα. */
  const own = rule(sel), parent = sel.includes(' p') ? rule(sel.replace(' p', '')) : null;
  const m = /max-width:(\d+)ch/.exec(own || '') || /max-width:(\d+)ch/.exec(parent || '');
  ok(sel + ' έχει μέτρο ανάγνωσης' + (m ? ' (' + m[1] + 'ch)' : ''), !!m && +m[1] <= 80);
});
ok('η ΑΝΤΙΠΑΡΑΒΟΛΗ όμως ΔΕΝ περιορίζεται — παίρνει όλο το πλάτος',
   !/#synLesson \.cmp\{[^}]*max-width/.test(CSS));
ok('και κυλάει μέσα στο κουτί της αντί να σπρώξει το body',
   /#synLesson \.cmp\{[^}]*overflow-x:auto/.test(CSS));
ok('η εξάσκηση μένει σε στήλη ανάγνωσης', /#synLesson \.dr\{ max-width:6\d\dpx/.test(CSS));

/* ══ 5 · ΑΠΑΓΟΡΕΥΜΕΝΑ ΣΧΗΜΑΤΑ ════════════════════════════════════════ */
section('5 · ΤΑ ΑΝΤΑΝΑΚΛΑΣΤΙΚΑ ΠΟΥ ΔΕΝ ΜΠΑΙΝΟΥΝ');
const AGCSS = CSS.slice(CSS.indexOf('#agWrap.ar-wrap{'));
/* Πλαϊνή χρωματιστή ρίγα: το πιο κοινό διακοσμητικό αντανακλαστικό, δεν
   σημαίνει τίποτα, και η ίδια σήμανση γίνεται με πλήρες περίγραμμα. */
is('⛔ καμία πλαϊνή ρίγα (border-left > 1px ως χρώμα)',
   (AGCSS.match(/border-left(-width)?:\s*(?![01]px)\d+px/g) || []).join(', '), '');
is('⛔ κανένα gradient σε κείμενο', (AGCSS.match(/background-clip:\s*text/g) || []).length, 0);
/* Οι διακόπτες ήταν έξι πανομοιότυπα κουτάκια — το τεμπέλικο σχήμα. */
ok('οι διακόπτες είναι τυπογραφία σε κολόνες, όχι πλέγμα από κουτιά',
   /#synLesson \.sw-g\{ columns:2/.test(AGCSS) && !/\.sw-g\{[^}]*grid-template-columns/.test(AGCSS));
ok('και δεν είναι κουτιά', !/#synLesson \.sy-sw\{[^}]*border-radius/.test(AGCSS));
ok('υπάρχει εναλλακτική για prefers-reduced-motion',
   /@media \(prefers-reduced-motion: reduce\)/.test(AGCSS));

console.log(`\n${fail ? '✗' : '✓'} arxaia-laptop: ${pass} πέρασαν, ${fail} έπεσαν\n`);
process.exit(fail ? 1 : 0);
