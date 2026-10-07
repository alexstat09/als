/* ══════════════════════════════════════════════════════════════════════
   tests/istoria-voithima.test.js — ΤΟ ΒΟΗΘΗΜΑ ΤΗΣ ΙΣΤΟΡΙΑΣ

   ⭐ ΓΙΑΤΙ ΥΠΑΡΧΕΙ. Η σελίδα γεννήθηκε ΕΞΩ από το repo (Claude Cowork) και
   τη ζήτησε αυτούσια: «αυτη η δομη μαρεσει πολυ περισσοτερο». Άρα ο
   φρουρός έχει δύο δουλειές που συνήθως τις κάνουν δύο διαφορετικά αρχεία:

     Α. ΝΑ ΜΗΝ ΑΦΗΣΕΙ ΤΟ ΣΧΗΜΑ ΝΑ ΓΛΙΣΤΡΗΣΕΙ. Ό,τι του άρεσε κλειδώνεται
        ΘΕΤΙΚΑ — 7 καρτέλες με τα ονόματά τους, μηδέν @media(min-width),
        το κείμενο να ζει με τα τυπογραφικά του βιβλίου.
     Β. ΝΑ ΑΠΟΔΕΙΞΕΙ ΤΗ ΓΕΙΩΣΗ. Το υλικό ήρθε από ΜΟΝΤΕΛΟ, οπότε η εγγύηση
        είναι curl στο ebooks.edu.gr (σταθερή αρχή 50), και το αντίγραφο
        κάθεται στο tests/istoria-voithima.source.txt — ΟΧΙ παραγόμενο από
        τη σελίδα, αλλιώς θα συμφωνούσε με κάθε λάθος της τέλεια.

   ⚠️ ΚΑΙ ΤΡΕΙΣ ΠΑΓΙΔΕΣ ΤΗΣ ΜΕΤΑΚΟΜΙΣΗΣ, ΟΛΕΣ ΣΙΩΠΗΛΕΣ:
     • σταθ. 18 — η σελίδα έχει ΤΕΣΣΕΡΑ `position:fixed` παιδιά. Μία γραμμή
       `topbar.js` και σχεδιάζονται όλα εκτός οθόνης, χωρίς σφάλμα.
     • σταθ. 42 — η αναγνώριση φωνής ζει ΜΟΝΟ στην istoria.html.
     • ο συγχρονισμός: μέσα στο artifact έτρεχε σε `window.claude.use("db")`,
       που εδώ ΔΕΝ υπάρχει. Χωρίς αντικατάσταση θα έμενε σιωπηλά τοπικός.
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

const PAGE  = fs.readFileSync(path.join(ALS, 'istoria-voithima.html'), 'utf8');
const HOME  = fs.readFileSync(path.join(ALS, 'istoria.html'), 'utf8');
const SW    = fs.readFileSync(path.join(ALS, 'sw.js'), 'utf8');
const BACK  = fs.readFileSync(path.join(ALS, 'backup.html'), 'utf8');
const SRC   = fs.readFileSync(path.join(__dirname, 'istoria-voithima.source.txt'), 'utf8');

/* ⚠️ ΤΑ ΣΧΟΛΙΑ ΒΓΑΙΝΟΥΝ ΠΡΩΤΑ, ΠΑΝΤΑ. Το arxaia-laptop.test.js «βρήκε» κάποτε
   ένα @media(min-width) που ήταν Η ΙΔΙΑ Η ΠΕΡΙΓΡΑΦΗ ΤΟΥ BUG μέσα σε σχόλιο. */
const CSS_RAW = PAGE.slice(PAGE.indexOf('<style>'), PAGE.indexOf('</style>'));
const CSS     = CSS_RAW.replace(/\/\*[\s\S]*?\*\//g, '');
const JS_RAW  = PAGE.slice(PAGE.indexOf('</style>'));
const JS      = JS_RAW.replace(/\/\*[\s\S]*?\*\//g, '').replace(/<!--[\s\S]*?-->/g, '');

/* ── ΟΛΕΣ οι έτοιμες ενότητες, από το ίδιο το CHAPTERS ──
   ⛔⛔ ΗΤΑΝ ΚΑΡΦΩΜΕΝΟ ΣΕ ΜΙΑ ΕΝΟΤΗΤΑ, ΚΑΙ ΑΥΤΟ ΕΙΝΑΙ ΣΙΩΠΗΛΗ ΑΠΩΛΕΙΑ.
   Τα `PAGE.match(/paragraphs: \[…/)` και `/sic: \[…/` έπιαναν ΤΗΝ ΠΡΩΤΗ
   ενότητα, ενώ οι άγκυρες μαζεύονταν από ΟΛΗ τη σελίδα — άρα με τη δεύτερη
   ενότητα ο φρουρός σύγκρινε τις άγκυρες της Γ.3 με το κείμενο της Γ.4 και
   «έβρισκε» 70 ορφανές. Ένας φρουρός που δεν μεγαλώνει μαζί με το υλικό
   σταματάει να φρουρεί ΑΚΡΙΒΩΣ όταν αρχίζει να χρειάζεται. */
const chStart = PAGE.indexOf('const CHAPTERS = [');
const chEnd   = PAGE.indexOf('\n  }\n}];', chStart);
if (chStart < 0 || chEnd < 0) throw new Error('δεν βρήκα τον πίνακα CHAPTERS');
const CHAPTERS = eval(PAGE.slice(chStart + 'const CHAPTERS = '.length, chEnd + '\n  }\n}]'.length));

/* το ΑΝΕΞΑΡΤΗΤΟ αρχείο γείωσης κάθε ενότητας — ένα ανά ενότητα, ποτέ κοινό */
const SOURCES = { 'k1-g4': 'istoria-voithima.source.txt',
                  'k1-g3': 'istoria-voithima-g3.source.txt',
                  'k1-g2': 'istoria-voithima-g2.source.txt',
                  'k1-a1': 'istoria-voithima-a1.source.txt',
                  'k1-a2': 'istoria-voithima-a2.source.txt',
                  'k1-b1': 'istoria-voithima-b1.source.txt',
                  'k1-b2': 'istoria-voithima-b2.source.txt',
                  'k1-b3': 'istoria-voithima-b3.source.txt',
                  'k1-g5': 'istoria-voithima-g5.source.txt',
                  'k1-b4': 'istoria-voithima-b4.source.txt',
                  'k1-b5': 'istoria-voithima-b5.source.txt',
                  'k1-b6': 'istoria-voithima-b6.source.txt',
                  'k1-b7': 'istoria-voithima-b7.source.txt',
                  'k1-b8': 'istoria-voithima-b8.source.txt',
                  'k1-b9': 'istoria-voithima-b9.source.txt',
                  'k1-b10': 'istoria-voithima-b10.source.txt',
                  'k1-g1': 'istoria-voithima-g1.source.txt',
                  'k1-g6': 'istoria-voithima-g6.source.txt',
                  'k1-g7': 'istoria-voithima-g7.source.txt',
                  'k1-g8': 'istoria-voithima-g8.source.txt',
                  'k1-g9': 'istoria-voithima-g9.source.txt',
                  /* ⭐ ΠΡΩΤΗ ΕΝΟΤΗΤΑ ΤΟΥ ΚΕΦΑΛΑΙΟΥ 2 — άλλο αρχείο βιβλίου (index2_2),
                     άλλο sha. Το όνομα κουβαλάει ΚΑΙ κεφάλαιο («k2a1») επίτηδες: το
                     σκέτο «a1» ανήκει ήδη στην Κεφ.1 · Α.1. */
                  'k2-a1': 'istoria-voithima-k2a1.source.txt',
                  /* ίδιο αρχείο βιβλίου και ίδιο sha με την Α.1· δύο παράγραφοι
                     είναι ΓΥΜΝΟ κείμενο έξω από <p> (δες την κεφαλίδα του αρχείου) */
                  'k2-a4': 'istoria-voithima-k2a4.source.txt',
                  /* ίδιο αρχείο βιβλίου, ίδιο sha· εξάγεται χάρη στο wrapBare/div.title */
                  'k2-a2': 'istoria-voithima-k2a2.source.txt',
                  /* ⭐ ΠΡΩΤΗ ενότητα του τμήματος Β του κεφ. 2 — ΝΕΟ αρχείο βιβλίου
                     (index2_3), νέο sha. Τρεις εξαγωγείς συμφώνησαν 9/9. */
                  'k2-b1': 'istoria-voithima-k2b1.source.txt' };

/* ══ 1 · Η ΓΕΙΩΣΗ ════════════════════════════════════════════════════ */
section('1 · ΤΟ ΚΕΙΜΕΝΟ ΕΙΝΑΙ ΤΟΥ ΒΙΒΛΙΟΥ, ΧΑΡΑΚΤΗΡΑ ΠΡΟΣ ΧΑΡΑΚΤΗΡΑ');
ok('υπάρχει τουλάχιστον μία έτοιμη ενότητα', CHAPTERS.length >= 1);
CHAPTERS.forEach(C => {
  const f = SOURCES[C.id];
  ok(C.id + ': έχει δικό της αρχείο γείωσης', !!f);
  if (!f) return;
  const src = fs.readFileSync(path.join(__dirname, f), 'utf8');
  const book = src.split(/@@P\d+/).slice(1).map(x => x.trim()).filter(Boolean);
  is(C.id + ': ίδιος αριθμός παραγράφων σελίδα ↔ πηγή', C.paragraphs.length, book.length);
  C.paragraphs.forEach((p, i) => is(C.id + ': παράγραφος ' + (i + 1) + ' ταυτόσημη με το βιβλίο', p, book[i] || '(λείπει)'));
  ok(C.id + ': η πηγή δηλώνει το sha256 του κατεβάσματος', /sha256 [0-9a-f]{64}/.test(src));
  ok(C.id + ': η πηγή δηλώνει τη διεύθυνση στο ebooks.edu.gr', src.includes('ebooks.edu.gr'));
});

/* ══ 2 · ΤΑ ΤΥΠΟΓΡΑΦΙΚΑ ΤΟΥ ΒΙΒΛΙΟΥ ══════════════════════════════════ */
section('2 · ΤΑ ΤΥΠΟΓΡΑΦΙΚΑ ΜΕΝΟΥΝ — ΤΟ ΒΙΒΛΙΟ ΔΕΝ «ΔΙΟΡΘΩΝΕΤΑΙ»');
is('η Γ.4 κρατάει και τα τρία της τυπογραφικά', (CHAPTERS.find(c => c.id === 'k1-g4') || { sic: [] }).sic.length, 3);
CHAPTERS.forEach(C => {
  const full = C.paragraphs.join('\n');
  ok(C.id + ': δηλώνει τουλάχιστον ένα τυπογραφικό ή κανένα συνειδητά', Array.isArray(C.sic));
  C.sic.forEach(x => {
    ok(C.id + ': «' + x.m + '» υπάρχει ΑΥΤΟΥΣΙΟ στο κείμενο', full.includes(x.m));
    ok(C.id + ': και η διόρθωση «' + x.fix + '» ΔΕΝ έχει μπει στο κείμενο', !full.includes(x.fix));
  });
});
/* ⚠️ Η ΠΑΡΕΝΘΕΤΙΚΗ ΠΑΥΛΑ ΤΗΣ Γ.3 — η ΜΟΝΗ γραφή που πρέπει να επιβιώσει.
   Ο κανόνας που ενώνει τις σπασμένες λέξεις της τυπωμένης σελίδας την είχε
   κάνει «κράτους-αποτέλεσαν», που δεν είναι λέξη καμίας γλώσσας. */
/* ⚠️ ΚΑΙ Η ΙΔΙΑ ΓΡΑΦΗ ΣΤΗ Γ.2 — ΤΟ ΜΟΤΙΒΟ ΔΕΝ ΗΤΑΝ ΑΤΥΧΗΜΑ ΤΗΣ Γ.3.
   Το βιβλίο γράφει «σημαντικό -για τα μέτρα της περιοχής- βιομηχανικό»:
   ανοιχτική παύλα κολλημένη στη λέξη ΜΕΤΑ, κλειστική στη λέξη ΠΡΙΝ. Ο
   κανόνας που ενώνει τις σπασμένες λέξεις της τυπωμένης σελίδας θα έβγαζε
   «περιοχής-βιομηχανικό», που δεν είναι λέξη καμίας γλώσσας. */
const G2 = CHAPTERS.find(c => c.id === 'k1-g2');
if (G2) {
  const f2 = G2.paragraphs.join('\n');
  ok('⭐ η Γ.2 κρατάει την κλειστική παύλα: «περιοχής- βιομηχανικό»', f2.includes('περιοχής- βιομηχανικό'));
  ok('⛔ και ΔΕΝ έχει την ενωμένη μορφή «περιοχής-βιομηχανικό»', !f2.includes('περιοχής-βιομηχανικό'));
  ok('⭐ η ανοιχτική παύλα υπάρχει κι αυτή', f2.includes('σημαντικό -για τα μέτρα'));
  /* ⛔⛔ Η ΠΗΓΗ ΕΠΟΧΗΣ ΤΟΥ ΒΙΒΛΙΟΥ (Percy Martin, 1913) ΕΙΝΑΙ ΠΗΓΗ, ΟΧΙ ΠΡΟΖΑ.
     Ζει στην καρτέλα «Πηγές». Αν γλιστρήσει στις paragraphs, ο μαθητής θα
     τη διαβάσει ως κείμενο του βιβλίου και θα τη γράψει στις εξετάσεις. */
  ok('⛔ το πλαίσιο πηγής του βιβλίου ΔΕΝ μπήκε στις παραγράφους',
     !f2.includes('Ελάχιστα καινούρια εργοστάσια') && !f2.includes('Percy Martin'));
  ok('⭐ …αλλά ΥΠΑΡΧΕΙ στην καρτέλα «Πηγές», με το βιβλίο και τη σελίδα του',
     JSON.stringify(G2.sources).includes('Ελάχιστα καινούρια εργοστάσια')
     && JSON.stringify(G2.sources).includes('σ. 176-177'));
  /* ⭐ Η ενότητα γράφει ΜΙΑ μόνο χρονολογία. Ένα «Χρονολογία βιβλίου» πάνω
     από ένα είναι σχεδόν σίγουρα χρονολογία πηγής ή πίνακα που γλίστρησε. */
  is('⭐ Γ.2 · ακριβώς ΜΙΑ χρονολογία βιβλίου (το 1896 του Λαυρίου)',
     G2.timeline.events.filter(e => e.book).map(e => e.label).join(','), '1896');
  ok('⛔ και το «μέχρι το 1909» της ΠΗΓΗΣ δεν μπήκε στο χρονολόγιο',
     !G2.timeline.events.some(e => String(e.y) === '1909' && e.book));
}

const G3 = CHAPTERS.find(c => c.id === 'k1-g3');
if (G3) {
  const f3 = G3.paragraphs.join('\n');
  ok('⭐ η Γ.3 κρατάει την παύλα: «κράτους- αποτέλεσαν»', f3.includes('κράτους- αποτέλεσαν'));
  ok('⛔ και ΔΕΝ έχει την ενωμένη μορφή «κράτους-αποτέλεσαν»', !f3.includes('κράτους-αποτέλεσαν'));
  ok('⭐ η ανοιχτική παύλα υπάρχει κι αυτή', f3.includes('της -ο εκσυγχρονισμός'));
}

/* ══ 3 · ΚΑΘΕ ΑΓΚΥΡΑ ΔΕΙΧΝΕΙ ΣΕ ΠΡΑΓΜΑΤΙΚΗ ΦΡΑΣΗ ════════════════════ */
section('3 · ΟΙ ΑΓΚΥΡΕΣ — ΚΑΝΕΝΑ ΚΟΥΜΠΙ ΔΕΝ ΔΕΙΧΝΕΙ ΣΤΟ ΠΟΥΘΕΝΑ');
/* ⭐ Η ΑΓΚΥΡΑ ΚΡΙΝΕΤΑΙ ΣΤΟ ΚΕΙΜΕΝΟ ΤΗΣ ΔΙΚΗΣ ΤΗΣ ΕΝΟΤΗΤΑΣ, ΠΟΤΕ ΣΤΟ ΣΥΝΟΛΟ:
   αλλιώς μια άγκυρα της Γ.3 θα «περνούσε» επειδή η φράση τυχαίνει να υπάρχει
   στη Γ.4 — και το κουμπί θα οδηγούσε στο πουθενά χωρίς κανένα σφάλμα. */
let anchorCount = 0;
const orphan = [];
CHAPTERS.forEach(C => {
  const full = C.paragraphs.join('\n');
  const take = [];
  C.explain.acts.forEach(a => take.push(['quote', a.quote]));
  C.facts.forEach(f => take.push(['link', f.link]));
  C.sources.list.forEach(x => take.push(['sources.link', x.link]));
  C.glossary.forEach(g => take.push(['glossary.m', g.m]));
  C.sic.forEach(x => take.push(['sic.m', x.m]));
  C.timeline.events.forEach(e => { if (e.q) take.push(['timeline.q', e.q]); });
  take.forEach(([k, v]) => {
    anchorCount++;
    if (typeof v !== 'string' || !full.includes(v)) orphan.push(C.id + ' ' + k + ' → ' + v);
  });
});
is('αγκύρες που ΔΕΝ υπάρχουν αυτολεξεί στο ΔΙΚΟ ΤΟΥΣ κείμενο', orphan.length + (orphan.length ? ' → ' + orphan.join(' | ') : ''), 0);
ok('και είναι πολλές, όχι δείγμα', anchorCount >= 40);

/* ⛔⛔ ΤΟ ΧΡΟΝΟΛΟΓΙΟ ΕΙΝΑΙ ΚΑΘΑΡΑ ΤΟΥ ΚΕΙΜΕΝΟΥ. ΔΙΚΗ ΤΟΥ ΑΠΟΦΑΣΗ, 14/09.
   Καμία χρονολογία από ΠΙΝΑΚΑ και καμία από ΠΗΓΗ — ούτε καν σημειωμένη.
   Ο πίνακας έχει ήδη δύο σωστές θέσεις (σχεδιάγραμμα, καρτέλα «Πηγές»)·
   στο χρονολόγιο γίνεται γεγονός που ο μαθητής νομίζει ότι διάβασε.
   ⚠️ Ο έλεγχος είναι ΑΠΑΓΟΡΕΥΣΗ, όχι σύσταση: κάθε χρονολογία ΚΑΘΕ
   γεγονότος — και «Πλαισίου» — πρέπει να γράφεται στις ΠΑΡΑΓΡΑΦΟΥΣ, αλλιώς
   ζει μόνο ως κείμενο του `note`. Η πρώτη γραφή είχε λίστα εξαιρέσεων για
   τα έτη του Πίνακα 8: μια λίστα εξαιρέσεων ΕΙΝΑΙ η τρύπα. */
const badYears = [], noNote = [];
CHAPTERS.forEach(C => {
  const full = C.paragraphs.join('\n');
  /* ⛔⛔ ΤΟ ΠΑΡΑΘΥΡΟ ΤΩΝ ΕΤΩΝ ΗΤΑΝ ΚΑΡΦΩΜΕΝΟ ΣΤΟΝ 19ο-20ό ΑΙΩΝΑ.
     Η Β.2 («Η εμπορική ναυτιλία») ξεκινάει από τον 18ο: το βιβλίο γράφει
     «τη συνθήκη του Κιουτσούκ Καϊναρτζή (1774)». Με `1[89]\d\d` το 1774
     ΔΕΝ μετριόταν ως χρονολογία του κειμένου, οπότε ένα σωστό `book:true`
     έσκαγε — και η εύκολη «διόρθωση» θα ήταν να βαφτιστεί «Πλαίσιο», δηλαδή
     να πει η σελίδα ψέματα. Το παράθυρο βγαίνει από το ΥΛΙΚΟ, όχι από
     υπόθεση: κάθε τετραψήφιο έτος της χιλιετίας. */
  const inBook = new Set([...full.matchAll(/\b(1\d{3})\b/g)].map(m => m[1]));
  C.timeline.events.forEach(e => {
    if (!e.book) { if (!e.note) noNote.push(C.id + ' ' + e.id); return; }
    const yrs = String(e.label).match(/\d{4}/g);
    if (yrs) { yrs.forEach(y => { if (!inBook.has(y)) badYears.push(C.id + ' ' + e.id + ' → ' + y); }); return; }
    /* ⛔⛔ Η ΤΡΥΠΑ ΠΟΥ ΑΝΟΙΞΕ Η Β.6: μια ΜΗ ΑΡΙΘΜΗΤΙΚΗ ετικέτα («πρώτες
       δεκαετίες») έπεφτε πίσω στο `e.y`, που είναι ΠΑΝΤΑ κατασκευή δική μου
       για τη σειρά — άρα ο έλεγχος σύγκρινε ένα νούμερο που ΚΑΝΕΝΑΣ δεν
       ισχυρίστηκε ότι γράφεται. Ο σωστός έλεγχος για τέτοια ετικέτα είναι
       ΦΡΑΣΤΙΚΟΣ: ΚΑΘΕ λέξη της πρέπει να γράφεται στο κείμενο της ενότητας.
       ⚠️ Γι' αυτό «τέλη 19ου αι.» ΔΕΝ πέρασε και έγινε «τελευταία χρόνια
       19ου»: το βιβλίο γράφει «στα τελευταία χρόνια του 19ου αιώνα», ποτέ
       «τέλη». Η λύση ήταν στα ΔΕΔΟΜΕΝΑ, όχι στον κανόνα.
       ⛔ Και μια ετικέτα χωρίς ΚΑΜΙΑ ελέγξιμη λέξη είναι κι αυτή αποτυχία —
       αλλιώς το «αι.» θα περνούσε ελεύθερο. */
    const ws = String(e.label).split(/[^0-9A-Za-zΆ-ώ]+/).filter(w => w.length >= 4);
    if (!ws.length) { badYears.push(C.id + ' ' + e.id + ' → ετικέτα χωρίς ελέγξιμη λέξη'); return; }
    ws.forEach(w => { if (!full.includes(w)) badYears.push(C.id + ' ' + e.id + ' → «' + w + '»'); });
  });
});
is('⛔ book:true σε χρονολογία που ΔΕΝ γράφει το ΚΕΙΜΕΝΟ της ενότητας', badYears.join(' | '), '');
is('⭐ «Πλαίσιο» χωρίς note (δεν λέει ότι είναι εκτός βιβλίου)', noNote.join(' | '), '');
/* ⛔ και καμία αναφορά σε πίνακα ΜΕΣΑ στο χρονολόγιο, ούτε ως τίτλος */
const tblRefs = [];
CHAPTERS.forEach(C => C.timeline.events.forEach(e => {
  if (/Πίνακ/i.test(String(e.title) + String(e.text || ''))) tblRefs.push(C.id + ' ' + e.id);
}));
is('⛔ γεγονός χρονολογίου που παραπέμπει σε ΠΙΝΑΚΑ', tblRefs.join(' | '), '');
/* ⛔⛔ ΕΚΤΟ ΚΟΥΤΙ ΤΟΥ TEMPLATE ΜΕ ΣΙΩΠΗΛΟ ΟΡΙΟ — ΚΑΙ ΤΟ ΒΡΗΚΕ ΜΟΝΟ ΤΟ CDP.
   Η κολόνα του έτους είναι ΣΤΑΘΕΡΗ (`.tl` → 132px) και το `.ev .yr` είναι
   26px mono: ΜΙΑ ΛΕΞΗ ΔΕΝ ΣΠΑΕΙ ΠΟΤΕ, όσο στενή κι αν γίνει η οθόνη.
   ⭐ Το 9 ΔΕΝ είναι μαντεψιά — μετρήθηκε στον πραγματικό browser στα 1440:
     9 χαρακτήρες → scrollWidth 133 (1px, αόρατο)· 10 → 148 (ορατό σπάσιμο).
   ⚠️⚠️ ΚΑΙ ΤΟ ΕΥΡΗΜΑ ΗΤΑΝ ΣΕ ΠΑΛΙΑ ΕΝΟΤΗΤΑ, ΤΕΤΑΡΤΗ ΣΥΝΕΧΟΜΕΝΗ ΦΟΡΑ: η Β.4
     έστελνε ζωντανά «αρχαιότητα» (10) και ξεχείλιζε 16px από την als-v559.
     Έγινε «αρχαία εποχή» — ίδιο ακριβώς νόημα, και ο τίτλος με το κείμενο του
     γεγονότος γράφουν «αρχαιότητα» ούτως ή άλλως. Η λύση στα ΔΕΔΟΜΕΝΑ. */
const longYr = [];
CHAPTERS.forEach(C => C.timeline.events.forEach(e => {
  const ws = String(e.label).split(/[^0-9A-Za-zΆ-ώ]+/).filter(Boolean);
  const w = Math.max(...ws.map(x => x.length));
  if (w > 9) longYr.push(C.id + ' «' + e.label + '» (' + w + ')');
}));
is('⛔ ετικέτα χρονολογίου με λέξη που ΔΕΝ χωράει στα 132px', longYr.join(' | '), '');
ok('  και ο κανόνας ζει στο CSS που τον γεννάει (.tl → κολόνα 132px, .yr 26px)',
   /\.tl\{display:grid;grid-template-columns:132px /.test(CSS) && /\.ev \.yr\{[^}]*font-size:26px/.test(CSS));

/* ⛔⛔ ΜΙΑ ΕΤΙΚΕΤΑ <b> ΣΕ ΠΕΔΙΟ ΠΟΥ ΠΕΡΝΑΕΙ ΑΠΟ esc() ΤΥΠΩΝΕΤΑΙ ΩΣ ΚΕΙΜΕΝΟ.
   Το βρήκε ΜΟΝΟ το render: η σελίδα φόρτωσε χωρίς σφάλμα, όλες οι βεβαιώσεις
   ήταν πράσινες, και η εισαγωγή των «Πηγών» έγραφε κυριολεκτικά
   «<b>πηγή εποχής</b>» στην οθόνη. Καμία βεβαίωση περιεχομένου δεν κοιτάζει
   HTML που ΔΕΝ ζωγραφίστηκε ως HTML — γι' αυτό ο έλεγχος είναι εδώ, πάνω στα
   ΔΕΔΟΜΕΝΑ, και απαριθμεί ΘΕΤΙΚΑ τα μόνα πεδία που επιτρέπεται να έχουν HTML.
   ⭐ Η λίστα βγαίνει από τον renderer: ό,τι τυπώνεται με ${...} σκέτο. Όλα τα
   υπόλοιπα (sources.*, facts.*, pitfalls.*, timeline.*, glossary.d) είναι esc(). */
section('3β · ⛔ HTML ΜΟΝΟ ΕΚΕΙ ΠΟΥ Ο RENDERER ΤΟ ΖΩΓΡΑΦΙΖΕΙ');
const RAW_HTML = new Set(['explain.lede', 'explain.acts[].body', 'explain.acts[].think', 'explain.concepts[].b']);
const leaked = [];
CHAPTERS.forEach(C => {
  const walk = (v, pa) => {
    if (typeof v === 'string') {
      if (/<[a-zA-Z]+>|<\/[a-zA-Z]+>/.test(v) && !RAW_HTML.has(pa)) leaked.push(C.id + ' ' + pa);
      return;
    }
    if (Array.isArray(v)) return v.forEach(x => walk(x, pa + '[]'));
    if (v && typeof v === 'object') return Object.keys(v).forEach(k => walk(v[k], pa ? pa + '.' + k : k));
  };
  walk(C, '');
});
is('⛔ ετικέτα HTML σε πεδίο που περνάει από esc() (θα τυπωθεί ΑΥΤΟΥΣΙΑ)',
   [...new Set(leaked)].join(' | '), '');
ok('  και ο renderer ΟΝΤΩΣ κάνει esc() την εισαγωγή των πηγών',
   JS.includes('<p class="sub">${esc(S.intro)}</p>'));

/* ══ 3γ · ⭐⭐ ΚΑΘΕ ΕΝΟΤΗΤΑ ΣΤΟ ΙΔΙΟ ΕΠΙΠΕΔΟ ΜΕ ΟΛΕΣ ΤΙΣ ΑΛΛΕΣ ═══════════
   Δική του απαίτηση: «να παραμένουν σε πολύ εξαιρετικό επίπεδο ΟΛΑ».
   ⚠️ Το βρήκε ένας οριζόντιος έλεγχος, όχι ο κάθετος: η Γ.4 — η ΠΡΩΤΗ
   ενότητα, χτισμένη πριν σταθεροποιηθεί το σχήμα — είχε ΔΥΟ πηγές ΧΩΡΙΣ
   «δικό μου σχόλιο», ενώ και οι 22 άλλες πηγές το είχαν. Κανένας έλεγχος
   ανά ενότητα δεν μπορούσε να το δει: φαινόταν μόνο στη ΣΥΓΚΡΙΣΗ.
   ⭐ Τα κατώφλια είναι ΔΑΠΕΔΑ, όχι ακριβείς αριθμοί: βγαίνουν από την
   ασθενέστερη υπάρχουσα ενότητα και σπάνε μόνο αν μια ΝΕΑ είναι φτωχότερη
   από ό,τι έχει ήδη ανεβεί — που είναι ακριβώς αυτό που θέλουμε να πιάνουν. */
section('3γ · ΟΛΕΣ ΟΙ ΕΝΟΤΗΤΕΣ ΣΤΟ ΙΔΙΟ ΕΠΙΠΕΔΟ, ΟΧΙ ΜΟΝΟ Η ΤΕΛΕΥΤΑΙΑ');
/* ⚠️ ΕΤΟΣ = ΤΕΣΣΕΡΑ ΨΗΦΙΑ ΠΟΥ ΣΤΕΚΟΥΝ ΜΟΝΑ, ΟΧΙ ΚΟΜΜΑΤΙ ΑΡΙΘΜΟΥ.
   Χωρίς τα lookaround, το «1.200.000.000» και το «108.800» θα γινόταν
   «χρονολογίες» και το κατώφλι θα φούσκωνε από το πουθενά. */
const proseYears = C => [...new Set((C.paragraphs.join('\n')
  .match(/(?<![\d.])(1[6-9]\d{2}|20\d{2})(?![\d])/g) || []).map(Number))];
const thin = [], hollow = [], dup = [];
CHAPTERS.forEach(C => {
  const floor = [['πράξεις', C.explain.acts.length, 5], ['έννοιες', C.explain.concepts.length, 3],
                 ['παγίδες', C.explain.pitfalls.length, 5], ['λεξικό', C.glossary.length, 35],
                 ['fun facts', C.facts.length, 8], ['πηγές', C.sources.list.length, 3],
                 ['«πώς το γράφω»', C.sources.how.length, 3],
                 /* ⛔⛔ ΤΟ «5» ΕΔΩ ΗΤΑΝ ΚΑΡΦΩΜΕΝΟ, ΚΑΙ ΤΟ ΕΔΕΙΞΕ Η ΠΡΩΤΗ ΕΝΟΤΗΤΑ
                    ΕΞΩ ΑΠΟ ΤΟ ΚΕΦΑΛΑΙΟ 1. Ήταν το ελάχιστο των ενοτήτων του κεφ. 1,
                    που είναι ΟΛΕΣ γεμάτες χρονολογίες. Η Κεφ.2 · Α.1 είναι άλλο ζώο:
                    αναλύει έναν ΚΟΙΝΩΝΙΚΟ ΜΗΧΑΝΙΣΜΟ και η πρόζα της γράφει ΜΙΑ
                    περίοδο, «1715-1821». Για να «περάσει» το 5 θα έπρεπε να
                    εφεύρω τρία γεγονότα — δηλαδή να σπάσω τον κανόνα ότι το
                    χρονολόγιο είναι ΚΑΘΑΡΑ του κειμένου, για να ευχαριστήσω έναν
                    αριθμό. ⭐ Άρα το κατώφλι βγαίνει ΑΠΟ ΤΟ ΥΛΙΚΟ: τουλάχιστον όσα
                    γεγονότα όσα ΔΙΑΚΡΙΤΑ ΕΤΗ γράφει η πρόζα της ίδιας ενότητας,
                    και ποτέ λιγότερα από δύο. Μια ενότητα με οκτώ έτη και δύο
                    γεγονότα σκάει — που είναι ακριβώς αυτό που θέλαμε να πιάνει. */
                 ['χρονολόγιο', C.timeline.events.length, Math.max(2, proseYears(C).length)],
                 ['κρίκοι αλυσίδας', C.explain.chain.length, 5]];
  floor.forEach(([k, got, min]) => { if (got < min) thin.push(C.id + ' ' + k + ' ' + got + '<' + min); });
  /* κάθε πράξη και κάθε πηγή ΠΛΗΡΗΣ — εδώ κρύφτηκε το κενό της Γ.4 */
  C.explain.acts.forEach((a, i) => ['when','cat','title','body','think','quote']
    .forEach(f => { if (!a[f]) hollow.push(C.id + ' act[' + i + '].' + f); }));
  C.sources.list.forEach((x, i) => ['ref','title','cat','gist','mine','link']
    .forEach(f => { if (!x[f]) hollow.push(C.id + ' source[' + i + '].' + f); }));
  C.sources.list.forEach((x, i) => { if (!(x.keep || []).length) hollow.push(C.id + ' source[' + i + '].keep'); });
  C.explain.pitfalls.forEach((x, i) => { if (!x.no || !x.ok) hollow.push(C.id + ' pitfall[' + i + ']'); });
  C.explain.concepts.forEach((x, i) => { if (!x.t || !x.b) hollow.push(C.id + ' concept[' + i + ']'); });
  C.glossary.forEach((g, i) => { if (!g.m || !g.t || !g.d || !g.cat) hollow.push(C.id + ' glossary[' + i + ']'); });
  ['period', 'title', 'num'].forEach(f => { if (!C[f]) hollow.push(C.id + '.' + f); });
  if (!C.explain.lede || !C.explain.glance.who || !C.sources.intro) hollow.push(C.id + ' lede/who/intro');
  /* ⛔ ΔΥΟ ΛΗΜΜΑΤΑ ΠΑΝΩ ΣΤΗΝ ΙΔΙΑ ΦΡΑΣΗ ΧΑΝΟΝΤΑΙ: το data-g είναι ΕΝΑ ανά
     segment, άρα το δεύτερο σκεπάζει το πρώτο. (Λήμμα + τυπογραφικό μαζί
     είναι ΜΙΑ ΧΑΡΑ — ο renderer είναι boundary-based και το segment φοράει
     και «w» και «sic»· το κάνει ήδη η Γ.4 στο «προέβει».) */
  C.paragraphs.forEach((p, pi) => {
    const sp = [];
    C.glossary.forEach(g => { const k = p.indexOf(g.m); if (k >= 0) sp.push([k, k + g.m.length, g.m]); });
    sp.sort((a, b) => a[0] - b[0]);
    for (let i = 1; i < sp.length; i++)
      if (sp[i][0] < sp[i - 1][1]) dup.push(C.id + ' παρ.' + (pi + 1) + ' «' + sp[i - 1][2] + '» ∩ «' + sp[i][2] + '»');
  });
});
/* ⛔⛔⛔ ΤΕΤΑΡΤΟ ΚΟΥΤΙ ΤΟΥ TEMPLATE ΜΕ ΣΙΩΠΗΛΟ ΟΡΙΟ — ΚΑΙ ΤΟ ΒΡΗΚΕ ΜΟΝΟ ΤΟ RENDER.
   `.glance .nums b` είναι `white-space:nowrap` ΜΕΣΑ σε `.glance dl{display:grid}`:
   μια μακριά τιμή ΔΕΝ σπάει, ορίζει το min-content ΟΛΗΣ της στήλης και ανοίγει
   το πλαϊνό κουτί. Η Β.4 έβγαλε τη σελίδα 1528px σε οθόνη 1440 με τον κατάλογο
   των έξι ορυκτών — και ο ΟΡΙΖΟΝΤΙΟΣ έλεγχος βρήκε ότι η Γ.3 το έκανε ΗΔΗ στα
   400 («166.000 Έλληνες · 38.000 μουσουλμάνοι», 289px, το πιο φαρδύ της σελίδας).
   ⭐ Η λύση είναι ΠΑΝΤΑ στα ΔΕΔΟΜΕΝΑ, ποτέ στο CSS (ίδια αρχή με το «Ιαν. 1923»
   της Γ.5): κοντές ΕΤΙΚΕΤΕΣ και κοντές ΤΙΜΕΣ, και ο κατάλογος πάει στις
   λέξεις-κλειδιά, που ΣΠΑΝΕ.
   ⚠️ Η ετικέτα τυλίγεται, άρα μετράει η ΜΕΓΑΛΥΤΕΡΗ ΤΗΣ ΛΕΞΗ, όχι όλο το μήκος.
   Το 40 ΔΕΝ είναι μαντεψιά: το χειρότερο υγιές ζευγάρι του υλικού είναι 32
   (Εδάφη + «65.000 → 108.800 τετρ. χλμ.») και το σπασμένο ήταν 44. */
const wide = [];
CHAPTERS.forEach(C => (C.explain.glance.numbers || []).forEach(([a, b]) => {
  const lw = Math.max(...String(a).split(/\s+/).map(w => w.length));
  if (lw + String(b).length > 40) wide.push(C.id + ' «' + a + '» → «' + b + '» (' + (lw + String(b).length) + ')');
}));
is('⛔ τιμή στο «Με μια ματιά» που ΔΕΝ σπάει και ανοίγει το πλαϊνό κουτί', wide.join(' | '), '');
ok('  και ο κανόνας ζει στο CSS που τον γεννάει (.nums b = nowrap)',
   /\.nums b\{[^}]*white-space:nowrap/.test(CSS));
is('⭐ καμία ενότητα πιο φτωχή από τις υπόλοιπες', thin.join(' | '), '');
/* ⭐⭐ ΚΑΙ Ο ΙΣΧΥΡΟΤΕΡΟΣ ΕΛΕΓΧΟΣ ΤΟΥ ΧΡΟΝΟΛΟΓΙΟΥ ΔΕΝ ΕΙΝΑΙ ΠΛΗΘΟΣ, ΕΙΝΑΙ ΚΑΛΥΨΗ:
   κάθε έτος που γράφει η πρόζα πρέπει να είναι ΠΡΟΣΙΤΟ από το χρονολόγιο —
   είτε ως γεγονός, είτε μέσα στην ετικέτα/κείμενο ενός γεγονότος, είτε στη
   δηλωμένη `period` της ενότητας. ⚠️ Το τρίτο ΔΕΝ είναι χαλάρωση: όταν το
   βιβλίο γράφει εύρος («1910-1922») και η αφήγηση της ενότητας σταματάει πριν
   το τέλος του, το κλείσιμο ζει σωστά στην `period` — η Γ.3 το κάνει ακριβώς
   έτσι, και η επόμενη ενότητα συνεχίζει από εκεί. */
const uncov = [];
CHAPTERS.forEach(C => {
  const hay = C.period + ' | ' + C.timeline.events
    .map(e => [e.y, e.label, e.title, e.text, e.q || ''].join(' ')).join(' | ');
  proseYears(C).filter(y => !hay.includes(String(y)))
    .forEach(y => uncov.push(C.id + ' ' + y));
});
is('⭐⭐ κάθε έτος της πρόζας είναι ΠΡΟΣΙΤΟ από το χρονολόγιο ή την period', uncov.join(' | '), '');
is('⭐ κανένα κενό πεδίο σε πράξη, πηγή, παγίδα, έννοια ή λήμμα', hollow.join(' | '), '');
is('⛔ δύο λήμματα πάνω στην ίδια φράση (το ένα θα έσβηνε το άλλο)', dup.join(' | '), '');
is('⛔ έμεινε «ΣΥΜΠΛΗΡΩΣΕ» από τον σκελετό του tools/istoria-unit.js',
   CHAPTERS.filter(C => JSON.stringify(C).indexOf('ΣΥΜΠΛΗΡΩΣΕ') >= 0).map(C => C.id).join(' | '), '');
is('⭐ κάθε ενότητα έχει το δικό της σχεδιάγραμμα στο δεύτερο <script>',
   CHAPTERS.map((C, i) => PAGE.includes('CHAPTERS[' + i + '].diagram = `') ? '' : C.id).filter(Boolean).join(' | '), '');
ok('  και οι πηγές είναι ΠΑΝΤΑ τρεις — πηγή/αριθμοί/διαφωνία',
   CHAPTERS.every(C => C.sources.list.length === 3));

/* ══ 3ε · ⛔⛔⛔ ΟΙ ΔΙΑΣΤΑΥΡΟΥΜΕΝΟΙ ΙΣΧΥΡΙΣΜΟΙ — Η ΠΙΟ ΥΠΟΥΛΗ ΣΑΠΙΛΑ ══════
   Ο Άλεξ το εντόπισε διαβάζοντας: ένα λήμμα στο hover έλεγε «το μόνο…»
   και ο ισχυρισμός είχε γραφτεί ΟΤΑΝ ΥΠΗΡΧΑΝ ΜΟΝΟ ΟΙ ΠΡΟΗΓΟΥΜΕΝΕΣ
   ενότητες. Ο έλεγχος μεγέθους της als-v569 έπιανε ΜΟΝΟ τα μεγέθη·
   αυτοί οι ισχυρισμοί μιλάνε για ΜΗΝΕΣ, ΟΝΟΜΑΤΑ, ΤΥΠΟΓΡΑΦΙΚΑ και
   ΑΦΕΤΗΡΙΕΣ, και σάπισαν αθόρυβα.
   ⭐ ΤΕΣΣΕΡΑ ΒΡΕΘΗΚΑΝ ΛΑΘΟΣ ΚΑΙ ΔΙΟΡΘΩΘΗΚΑΝ (als-v571):
     Γ.8  «η ΜΟΝΗ φορά που το βιβλίο δίνει ΜΗΝΑ»   → η Γ.9 δίνει κι αυτή
     Β.9  «η μακρύτερη αφετηρία του κεφαλαίου Β»   → η Β.2 πάει στο 1774
     Β.9  «η ΜΟΝΗ με ΜΗΔΕΝ τυπογραφικά»            → και η Β.10 έχει μηδέν
     Β.10 «η ΜΟΝΗ με γυμνό παράθυρο»               → και η Β.3 και η Β.4
   ⛔ Ο έλεγχος ΔΕΝ διαβάζει κείμενο: ΜΕΤΡΑΕΙ το υλικό και απαιτεί η
   σελίδα να λέει το ίδιο. Αν μια μελλοντική ενότητα αλλάξει τη μέτρηση,
   θα σκάσει — και αυτό είναι το ζητούμενο. */
section('3ε · ΟΙ ΙΣΧΥΡΙΣΜΟΙ ΠΟΥ ΓΕΝΙΚΕΥΟΥΝ ΣΕ ΟΛΟ ΤΟ ΚΕΦΑΛΑΙΟ');
{
  const K1 = CHAPTERS.filter(c => /^k1-/.test(c.id));
  const B  = K1.filter(c => /^k1-b\d+$/.test(c.id));
  const G  = K1.filter(c => /^k1-g\d+$/.test(c.id));
  const txt = c => JSON.stringify([c.glossary, c.facts, c.explain]);
  const ALL = JSON.stringify(K1.map(txt)) + PAGE.slice(PAGE.indexOf('CHAPTERS[0].diagram'));
  /* ⛔⛔ ΣΤΑΘ. (als-v569, ΞΑΝΑ): μια τίμια ανάκληση ΠΑΡΑΘΕΤΕΙ ό,τι έλεγε πριν,
     και ένας αφελής φρουρός τιμωρεί ακριβώς τη διόρθωση. Ο κανόνας είναι
     ΤΥΠΟΓΡΑΦΙΚΟΣ: ισχυρισμός ΜΕΣΑ σε «» αναφέρεται, ΕΞΩ από «» ισχυρίζεται. */
  const LIVE = ALL.replace(/«[^»]*»/g, ' ');

  /* ── (α) ΜΗΝΕΣ ΣΤΗΝ ΠΡΟΖΑ ── */
  const MHN = /(Ιανουαρ|Φεβρουαρ|Μαρτ|Απριλ|Μαΐ|Μάι|Ιουν|Ιουλ|Αυγούστ|Σεπτεμβρ|Οκτωβρ|Νοεμβρ|Δεκεμβρ)/;
  const withMonth = K1.filter(c => MHN.test(c.paragraphs.join('\n'))).map(c => c.id);
  is('⭐⭐ πόσες υποενότητες του κεφ. 1 γράφουν ΜΗΝΑ στην πρόζα', withMonth.sort().join(','), 'k1-g8,k1-g9');
  ok('  ⛔ και ΚΑΜΙΑ σελίδα δεν λέει πια «η ΜΟΝΗ φορά… που δίνει ΜΗΝΑ»',
     !/(Η ΜΟΝΗ|Η μόνη) φορά σε ολόκληρο το κεφάλαιο που το βιβλίο δίνει ΜΗΝΑ/.test(LIVE));
  ok('  ⭐ …και λέει ρητά ότι είναι ΔΥΟ', /δύο μόνο φορ/i.test(ALL) || /ΔΥΟ ΜΟΝΟ ΦΟΡΕΣ/.test(ALL));

  /* ── (β) ΠΛΗΡΗΣ ΗΜΕΡΟΜΗΝΙΑ (μέρα + μήνας + χρονιά) ── */
  const FULL = /\d{1,2}\s+(Ιανουαρίου|Φεβρουαρίου|Μαρτίου|Απριλίου|Μαΐου|Ιουνίου|Ιουλίου|Αυγούστου|Σεπτεμβρίου|Οκτωβρίου|Νοεμβρίου|Δεκεμβρίου)/;
  is('⭐ και πόσες δίνουν ΠΛΗΡΗ ημερομηνία — η Γ.9 το ισχυρίζεται ως μοναδικό',
     K1.filter(c => FULL.test(c.paragraphs.join('\n'))).map(c => c.id).join(','), 'k1-g9');

  /* ── (γ) ΥΠΟΕΝΟΤΗΤΕΣ ΤΟΥ Β ΜΕ ΜΗΔΕΝ ΤΥΠΟΓΡΑΦΙΚΑ ── */
  const zero = B.filter(c => c.sic.length === 0).map(c => 'Β.' + c.num);
  is('⭐⭐ πόσες υποενότητες του τμήματος Β έχουν ΜΗΔΕΝ τυπογραφικά', zero.join(','), 'Β.9,Β.10');
  ok('  ⛔ και η Β.9 ΔΕΝ ισχυρίζεται πια ότι είναι η μόνη',
     !/ΜΟΝΗ υποενότητα ολόκληρου του τμήματος Β με ΜΗΔΕΝ τυπογραφικά/.test(LIVE));
  ok('  ⛔ ούτε η Β.10 ότι είναι η μόνη με γυμνό παράθυρο',
     !/ΜΟΝΗ που δεν έχει ούτε πίνακα/.test(LIVE)
     && !/μόνη υποενότητα του τμήματος Β με απολύτως καθαρή πρόζα/.test(LIVE));

  /* ── (δ) ΑΦΕΤΗΡΙΑ: ΠΟΙΑ ΥΠΟΕΝΟΤΗΤΑ ΤΟΥ Β ΠΑΕΙ ΠΙΟ ΠΙΣΩ ── */
  const earliest = B.map(c => {
    const ys = (c.paragraphs.join('\n').match(/\b1[6-9]\d{2}\b/g) || []).map(Number);
    return { id: c.id, y: ys.length ? Math.min(...ys) : 9999 };
  }).sort((a, b2) => a.y - b2.y)[0];
  is('⭐⭐ ποια υποενότητα του Β ονομάζει την ΠΑΛΑΙΟΤΕΡΗ χρονολογία', earliest.id + '=' + earliest.y, 'k1-b2=1774');
  ok('  ⛔ άρα η Β.9 ΔΕΝ ισχυρίζεται πια «η μακρύτερη αφετηρία» ούτε «όλες οι άλλες από το 1830»',
     !/μακρύτερη αφετηρία/.test(LIVE) && !/άλλες υποενότητες του κεφαλαίου Β ξεκινούν από το (<b>)?1830/.test(LIVE));

  /* ── (ε) ΟΝΟΜΑΤΑ ΠΡΟΣΩΠΩΝ ── */
  const NAMES = /(Βενιζέλ|Μεταξά|Τρικούπ|Ράλλη|Σταύρου|Εϋνάρδ|Σκουζ)/;
  is('⭐ ονόματα προσώπων στο τμήμα Γ — η Γ.9 λέει ότι ο Μεταξάς είναι ο δεύτερος',
     G.filter(c => NAMES.test(c.paragraphs.join('\n'))).map(c => c.id).sort().join(','),
     'k1-g1,k1-g3,k1-g4,k1-g8,k1-g9');
  ok('  ⭐ και μόνο η Γ.9 ονομάζει τον Μεταξά',
     G.filter(c => /Μεταξά/.test(c.paragraphs.join('\n'))).map(c => c.id).join(',') === 'k1-g9');

  /* ── (στ) ΤΟ ΜΟΝΟ ΘΕΤΙΚΟ ΤΕΛΟΣ ΤΟΥ Β — ο ισχυρισμός που ΑΝΤΕΞΕ ── */
  is('⭐⭐ η ΜΟΝΗ υποενότητα του Β που τελειώνει θετικά (μετρημένο ξανά)',
     B.filter(c => /Τα αποτελέσματα ήταν θετικά|χαρακτηριστούν υγιή/.test(c.paragraphs[c.paragraphs.length - 1]))
      .map(c => 'Β.' + c.num).join(','), 'Β.10');
  ok('  ⭐ και το τμήμα Β είναι ΚΛΕΙΣΤΟ, άρα ο ισχυρισμός δεν μπορεί να σαπίσει', B.length === 10);
}


/* ══ 3δ · ⛔⛔⛔ ΔΥΟ ΣΙΩΠΗΛΑ ΟΡΙΑ ΤΩΝ ΠΙΝΑΚΩΝ ΤΟΥ ΣΧΕΔΙΑΓΡΑΜΜΑΤΟΣ ═══════
   Και τα δύο τα βρήκε ΜΟΝΟ το render στα 400px, και τα δύο ήταν ΗΔΗ εκεί
   σε παλιά ενότητα (Β.1, 411px) πριν τα ξανακάνει η Β.5 (440px).
   ⭐ Η αιτία: στα 400px το `.two` γίνεται μονόστηλο με `1fr`, που είναι
   `minmax(AUTO,1fr)` — το AUTO σημαίνει ότι η στήλη ΔΕΝ πέφτει κάτω από
   το min-content της κάρτας. Ό,τι δεν σπάει μέσα στην κάρτα, σπάει τη
   σελίδα. */
section('3δ · ΟΙ ΠΙΝΑΚΕΣ ΤΟΥ ΣΧΕΔΙΑΓΡΑΜΜΑΤΟΣ ΚΑΙ ΤΑ ΣΙΩΠΗΛΑ ΤΟΥΣ ΟΡΙΑ');
const DIAGS = [...PAGE.matchAll(/CHAPTERS\[(\d+)\]\.diagram = `([\s\S]*?)`;/g)].map(m => [m[1], m[2]]);
is('βρέθηκαν τα σχεδιαγράμματα όλων των ενοτήτων', DIAGS.length, CHAPTERS.length);

/* (α) κάθε <table class="tbl"> ζει μέσα σε .tscroll — ΚΑΙ μέσα σε .card.
   Δέκα από τους 33 ήταν «γυμνοί» και δούλευαν ΚΑΤΑ ΤΥΧΗ, όσο το
   περιεχόμενό τους ήταν κοντό. Τυλίχθηκαν ΟΛΟΙ: μια λίστα εξαιρέσεων
   ΕΙΝΑΙ η τρύπα. Το .tscroll είναι σκέτο overflow-x:auto, καθαρά
   προσθετικό — μηδέν οπτική αλλαγή όταν ο πίνακας χωράει. */
const bareTbl = [];
let tblCount = 0;
DIAGS.forEach(([id, d]) => {
  [...d.matchAll(/<table class="tbl[^"]*">/g)].forEach(t => {
    tblCount++;
    const before = d.slice(Math.max(0, t.index - 140), t.index);
    if (!/<div class="tscroll">\s*$/.test(before)) bareTbl.push('CHAPTERS[' + id + ']');
  });
});
is('⛔ πίνακας σχεδιαγράμματος ΕΞΩ από .tscroll', bareTbl.join(' | '), '');
ok('  και είναι πολλοί, όχι δείγμα (≥30)', tblCount >= 30);
ok('  το .tscroll είναι σκέτο overflow-x:auto', /\.tscroll\{overflow-x:auto\}/.test(CSS));

/* (β) ⛔⛔ `.tbl .amt` ΕΙΝΑΙ white-space:nowrap — ΓΙΑ ΑΡΙΘΜΟΥΣ.
   Πρόζα εκεί μέσα δεν σπάει ΠΟΤΕ. Έξω από κάρτα χωράει (η Β.3 έχει
   26 χαρακτήρες και είναι μια χαρά)· ΜΕΣΑ σε κάρτα όχι.
   ⭐ Το 18 ΔΕΝ είναι μαντεψιά: το χειρότερο ΥΓΙΕΣ κελί μέσα σε κάρτα
   είναι 16 («πάνω από 300.000»), και τα σπασμένα ήταν 19 έως 25
   («κυρίαρχα βιομηχανικά», ««κυριολεκτικά ασήμαντες»», «20% του αρχικού
   κεφαλαίου»). Η διόρθωση είναι πάντα η ΚΛΑΣΗ, όχι το κείμενο: ό,τι δεν
   είναι αριθμός φοράει `.cur`, που σπάει. */
function cardRegions(d) {
  const out = [];
  const re = /<div class="card">/g; let m;
  while ((m = re.exec(d))) {
    let i = m.index, depth = 0, j = i;
    const step = /<div\b|<\/div\s*>/g; step.lastIndex = i; let s;
    while ((s = step.exec(d))) { depth += s[0][1] === '/' ? -1 : 1; if (depth === 0) { j = s.index; break; } }
    out.push(d.slice(i, j));
  }
  return out;
}
const longAmt = [];
let inCard = 0, cardsSeen = 0;
DIAGS.forEach(([id, d]) => {
  cardRegions(d).forEach(region => {
    cardsSeen++;
    [...region.matchAll(/<td class="amt">([\s\S]*?)<\/td>/g)].forEach(t => {
      inCard++;
      const txt = t[1].replace(/<[^>]*>/g, '').replace(/&[a-z]+;/g, 'x').trim();
      if (txt.length > 18) longAmt.push('CHAPTERS[' + id + '] «' + txt + '» (' + txt.length + ')');
    });
  });
});
is('⛔ κελί .amt (nowrap) μέσα σε .card πάνω από 18 χαρακτήρες', longAmt.join(' | '), '');
is('  ⭐ ο σαρωτής βρήκε ΚΑΘΕ κάρτα του αρχείου (όχι καρφωμένο νούμερο)',
   cardsSeen, (PAGE.match(/<div class="card">/g) || []).length);
ok('  και υπάρχουν όντως .amt κελιά μέσα σε κάρτες', inCard > 0);
ok('  ο κανόνας ζει στο CSS που τον γεννάει (.tbl .amt = nowrap)',
   /\.tbl \.amt\{[^}]*white-space:nowrap/.test(CSS));

/* (γ) ⛔⛔ `.oc b{display:block}` — ΚΑΘΕ <b> ΜΕΣΑ ΣΤΟ <span> ΤΟΥ .oc ΓΙΝΕΤΑΙ ΓΡΑΜΜΗ.
   Δύο ή περισσότερα <b>, ή ένα που ΔΕΝ ανοίγει το span, σπάνε το κουτί σε
   σπαράγματα και αφήνουν «, », «,» και μονοσύλλαβα («οι», «το») ΜΟΝΑ ΤΟΥΣ σε
   αράδα. Καμία μέτρηση πλάτους δεν το βλέπει — μόνο το SCREENSHOT.
   ⚠️⚠️ ΤΡΙΤΗ ΕΜΦΑΝΙΣΗ, ΚΑΙ ΤΗ ΒΡΗΚΕ Ο ΟΡΙΖΟΝΤΙΟΣ ΕΛΕΓΧΟΣ: η als-v560 το είχε
   διορθώσει σε ΕΝΑ κουτί της Β.6· η σάρωση όλων των ενοτήτων στην als-v562
   βρήκε **19 σπασμένα κουτιά σε ΕΞΙ ΠΑΛΙΕΣ ενότητες** (Γ.3 · Γ.2 · Β.1 · Β.2 ·
   Β.3 · Β.6). Πέμπτη συνεχόμενη φορά που το εύρημα είναι σε ΠΑΛΙΑ ενότητα.
   ⭐ Η λύση είναι ΠΑΝΤΑ στα ΔΕΔΟΜΕΝΑ, ποτέ στο CSS — και σε ΔΥΟ κανόνες, ώστε
   να μη χαθεί η πρόθεση: αν το <b> ήδη ανοίγει το span, ξετυλίγονται μόνο τα
   ΕΠΟΜΕΝΑ· αλλιώς το bold τεντώνεται από την αρχή ως το τελευταίο </b>.
   ⛔ ΚΑΜΙΑ λίστα εξαιρέσεων: μια λίστα εξαιρέσεων ΕΙΝΑΙ η τρύπα.
   ⚠️ Το <span> μετριέται ΙΣΟΖΥΓΙΣΜΕΝΑ — το non-greedy σταματάει στο ΕΣΩΤΕΡΙΚΟ
   </span> του `.yr` και κόβει το κουτί στη μέση (το έπαθε η πρώτη γραφή). */
function ocSpans(d) {
  const out = [], re = /<div class="oc [^"]*">/g; let m;
  while ((m = re.exec(d))) {
    const sp = d.indexOf('<span>', m.index); if (sp < 0) continue;
    let i = sp + 6, depth = 1;
    while (depth && i < d.length) {
      const t = /<span\b|<\/span>/g; t.lastIndex = i; const n = t.exec(d); if (!n) break;
      depth += n[0] === '</span>' ? -1 : 1; i = n.index + n[0].length;
    }
    out.push(d.slice(sp + 6, i - 7));
  }
  return out;
}
const ocBad = []; let ocSeen = 0;
DIAGS.forEach(([id, d]) => ocSpans(d).forEach(inner => {
  ocSeen++;
  const bs = (inner.match(/<b>/g) || []).length;
  const txt = inner.replace(/<[^>]*>/g, '').trim().slice(0, 45);
  if (bs > 1) ocBad.push('CHAPTERS[' + id + '] ' + bs + ' <b> «' + txt + '»');
  else if (bs === 1 && inner.indexOf('<b>') !== 0) ocBad.push('CHAPTERS[' + id + '] <b> δεν ανοίγει το span «' + txt + '»');
}));
is('⛔⛔ .oc με δεύτερο <b> ή <b> που δεν ανοίγει το span (σπάει σε γραμμές)', ocBad.join(' | '), '');
ok('  ⭐ ο σαρωτής βρήκε ΚΑΘΕ κουτί .oc του αρχείου (όχι καρφωμένο νούμερο)',
   ocSeen === (PAGE.match(/<div class="oc [^"]*">/g) || []).length && ocSeen > 40);
ok('  και ο κανόνας ζει στο CSS που τον γεννάει (.oc b = display:block)',
   /\.oc b\{[^}]*display:block/.test(CSS));

/* ══ 4 · ΤΟ ΛΑΠΤΟΠ (σταθερή αρχή 51) ═════════════════════════════════ */
section('4 · ΤΟ ΛΑΠΤΟΠ ΕΙΝΑΙ Η ΟΘΟΝΗ ΜΕΛΕΤΗΣ');
is('⛔ ΚΑΝΕΝΑ @media(min-width) — η ανάποδη θραύση', (CSS.match(/@media[^{]*min-width/g) || []).length, 0);
const wrap = /\.wrap\{max-width:(\d+)px/.exec(CSS);
ok('η σελίδα ανοίγει σε πλάτος λάπτοπ (≥1100px)', wrap && +wrap[1] >= 1100);
ok('η πρόζα του βιβλίου κρατάει μέτρο ανάγνωσης σε ch', /\.rtext\{max-width:\d+ch/.test(CSS));
ok('και οι πίνακες/σχεδιαγράμματα μαζεύουν με max-width', (CSS.match(/@media \(max-width:/g) || []).length >= 3);
ok('prefers-reduced-motion υπάρχει', CSS.includes('prefers-reduced-motion'));

/* ══ 5 · ΤΟ ΣΧΗΜΑ ΠΟΥ ΤΟΥ ΑΡΕΣΕ — ΘΕΤΙΚΗ ΑΠΑΓΟΡΕΥΣΗ ΤΗΣ ΟΛΙΣΘΗΣΗΣ ══ */
section('5 · ΕΠΤΑ ΚΑΡΤΕΛΕΣ, ΜΕ ΤΑ ΟΝΟΜΑΤΑ ΤΟΥΣ');
const tabBlock = PAGE.match(/const TABS = \[([\s\S]*?)\];/);
const TABS = tabBlock ? eval('[' + tabBlock[1] + ']') : [];
is('7 σταθερές καρτέλες', TABS.filter(t => !t.needs).length, 7);
/* Η 8η είναι ΠΡΟΑΙΡΕΤΙΚΗ: μπαίνει ΜΕΤΑ τις επτά (τα πλήκτρα 1-7 δεν
   μετακινούνται) και εμφανίζεται μόνο σε ενότητα με πεδίο `video`. */
is('  + μία προαιρετική: «Βίντεο», τελευταία, μόνο με `video`',
   JSON.stringify(TABS[7]), JSON.stringify({ id: 'video', label: 'Βίντεο', needs: 'video' }));
is('  και καμία άλλη', TABS.length, 8);
[['explain','Κατάλαβέ το'],['diagram','Σχεδιάγραμμα'],['timeline','Χρονολόγιο'],
 ['glossary','Λεξικό'],['facts','Fun facts'],['text','Κείμενο'],['sources','Πηγές']]
  .forEach(([id, label], i) => {
    is('καρτέλα ' + (i + 1) + ' = ' + id, TABS[i] && TABS[i].id, id);
    is('  με ετικέτα «' + label + '»', TABS[i] && TABS[i].label, label);
  });
ok('τα Fun facts λένε ΡΗΤΑ ότι δεν γράφονται στις εξετάσεις',
   PAGE.includes('Μην τα γράψεις στις εξετάσεις'));
ok('και κάθε κάρτα τους φοράει σήμα «Εκτός βιβλίου»', PAGE.includes('>Εκτός βιβλίου<'));
ok('το χρονολόγιο ξεχωρίζει ΒΙΒΛΙΟ από ΣΥΜΦΡΑΖΟΜΕΝΟ', /book: (true|false)/.test(PAGE) && /badge\.ctx/.test(CSS));

/* ══ 6 · ΟΙ ΤΡΕΙΣ ΠΑΓΙΔΕΣ ΤΗΣ ΜΕΤΑΚΟΜΙΣΗΣ ═══════════════════════════ */
section('6 · ⛔ ΤΙ ΔΕΝ ΕΠΙΤΡΕΠΕΤΑΙ ΝΑ ΜΠΕΙ ΠΟΤΕ ΣΕ ΑΥΤΗ ΤΗ ΣΕΛΙΔΑ');
/* σταθ. 19: η βελόνα είναι το ΠΛΑΙΣΙΟ src=, όχι το σκέτο όνομα αρχείου. */
ok('⛔ καμία topbar.js (σταθ. 18: τα 4 fixed παιδιά θα έφευγαν εκτός οθόνης)',
   !PAGE.includes('src="topbar.js') && !PAGE.includes("src='topbar.js"));
const fixedKids = ['.selbar{position:fixed', '.pop{position:fixed', '.tip{position:fixed', '.toast{position:fixed'];
fixedKids.forEach(f => ok('  και το ' + f.split('{')[0] + ' είναι όντως position:fixed', CSS.includes(f)));
ok('⛔ καμία αναγνώριση φωνής (σταθ. 42 — ζει ΜΟΝΟ στην istoria.html)',
   !/SpeechRecognition/.test(PAGE));
ok('   …και η istoria.html την κρατάει', /SpeechRecognition/.test(HOME) || HOME.includes('greek-ear.js'));
ok('⛔ κανένα window.claude — το artifact runtime δεν υπάρχει εδώ',
   !PAGE.includes('window.claude'));
ok('⛔ κανένα νεκρό κουμπί θέματος (σταθ. 12)',
   !PAGE.includes('themeBtn') && !PAGE.includes('istoria:theme'));

/* ══ 7 · Ο ΣΥΓΧΡΟΝΙΣΜΟΣ ══════════════════════════════════════════════ */
section('7 · ΟΙ ΠΛΑΓΙΟΤΙΤΛΟΙ ΤΟΥ ΦΤΑΝΟΥΝ ΣΤΟ CLOUD, Η ΣΙΩΠΗ ΕΙΝΑΙ ΑΠΑΓΟΡΕΥΜΕΝΗ');
ok('η σελίδα φορτώνει sync.js', PAGE.includes('src="sync.js"'));
ok('και τον vendored supabase client (ΠΟΤΕ CDN για δεδομένα)', PAGE.includes('src="vendor/supabase.min.js"'));
ok('καλεί initCloudSync με appKey «istoria»', /initCloudSync\(\{ appKey: "istoria"/.test(JS));
ok('και συγχρονίζει το πρόθεμα istoria:notes:', JS.includes('syncedPrefixes: ["istoria:notes:"]'));
ok('⭐ ένας συγχρονισμός που ΔΕΝ ξεκίνησε το λέει με λέξεις (σταθ. 10/32)',
   JS.includes('Ο συγχρονισμός δεν ξεκίνησε') && CSS.includes('.gate{'));
ok('το backup.html ξέρει το πρόθεμα — αλλιώς συγχρονίζεται και ΔΕΝ ανακτάται',
   BACK.includes("prefixes:['istoria:notes:']"));
/* Στο βαθμωτό φύλλο ο merge κρατάει την ΑΠΟΜΑΚΡΥΣΜΕΝΗ τιμή: χωρίς `ts`
   μια μετονομασία πλαγιότιτλου δεν φτάνει ΠΟΤΕ στη δεύτερη συσκευή. */
is('τα 4 σημεία ΔΗΜΙΟΥΡΓΙΑΣ στοιβάζουν ts', (JS.match(/ts: Date\.now\(\)/g) || []).length, 4);
is('και τα 2 σημεία ΕΠΕΞΕΡΓΑΣΙΑΣ το ΑΝΑΝΕΩΝΟΥΝ — αλλιώς η μετονομασία δεν φεύγει ποτέ',
   (JS.match(/\.ts = Date\.now\(\)/g) || []).length, 2);
ok('το «τοπικό» και το «cloud» ΔΕΝ γράφονται το ίδιο (σταθ. 10)',
   JS.includes('Αποθηκεύεται στο cloud') && JS.includes('Αποθηκεύεται σε αυτή τη συσκευή'));

/* ══ 8 · Η ΣΕΛΙΔΑ ΕΙΝΑΙ ΟΝΤΩΣ ΜΕΣΑ ΣΤΟ MÉTRON ═══════════════════════ */
section('8 · ΑΝΟΙΓΕΙ ΑΠΟ ΤΗΝ ΙΣΤΟΡΙΑ, ΚΑΙ ΓΥΡΝΑΕΙ ΠΙΣΩ');
ok('η istoria.html δίνει τον σύνδεσμο', HOME.includes('href="istoria-voithima.html"'));
ok('και η κλάση του συνδέσμου υπάρχει στο CSS της (σταθ. 12)',
   HOME.includes('class="ip-aid"') && /\.ip-aid\{/.test(HOME));
ok('το βοήθημα δίνει τον δρόμο πίσω (καμία topbar εδώ)',
   PAGE.includes('href="homework.html"') && CSS.includes('.back{'));

/* ⭐⭐ ΔΥΟ ΠΟΡΤΕΣ ΠΟΥ ΔΕΝ ΕΠΙΤΡΕΠΕΤΑΙ ΝΑ ΓΙΝΟΥΝ ΜΙΑ (als-v544).
   Δικά του λόγια: το School Studies ανοίγει ΤΟ ΒΟΗΘΗΜΑ, αλλά η μηχανή
   ανάκλησης «δεν θέλω να τη χάσω… να υπάρχει». Αν κάποιος ενώσει
   `door` και `page`, ΚΑΘΕ βαθύ link επανάληψης προσγειώνεται σε
   σελίδα με ΜΙΑ ενότητα — δηλαδή σε αδιέξοδο, σιωπηλά. */
const HW = fs.readFileSync(path.join(ALS, 'homework.html'), 'utf8');
ok('⭐ η ΚΑΡΤΑ Ιστορία στο School Studies ανοίγει το βοήθημα',
   /istoria:\s*\{[^}]*door:\s*'istoria-voithima\.html'/.test(HW));
ok('⭐ αλλά το ΒΑΘΥ link ενότητας μένει στη μηχανή ανάκλησης',
   /istoria:\s*\{[^}]*page:\s*'istoria\.html'/.test(HW));
ok('  και ο deepLink() στοχεύει ακόμη την istoria.html',
   HW.includes("if (page === 'istoria.html' && unitId)"));
ok('  και ο knownUnits() στέλνει τις ενότητες εκεί',
   HW.includes("subject:'istoria', page:'istoria.html'"));
ok('  η κάρτα διαβάζει door ΠΡΙΝ το page, και στα δύο σημεία',
   (HW.match(/meta\.door \|\| meta\.page/g) || []).length === 2);

/* Η ΠΑΛΙΑ ΣΕΛΙΔΑ ΔΕΝ ΧΑΝΕΤΑΙ — και δεν μένει ορφανή χωρίς πόρτα. */
ok('⭐ η μηχανή ανάκλησης υπάρχει ακόμη ως αρχείο',
   fs.existsSync(path.join(ALS, 'istoria.html')));
ok('  κρατάει το μικρόφωνο (σταθ. 42)', HOME.includes('greek-ear.js'));
ok('  και το βοήθημα δίνει ΡΗΤΗ πόρτα προς αυτήν',
   PAGE.includes('class="oldlink" href="istoria.html"') && CSS.includes('.oldlink{'));
ok('  ο σύνδεσμος λέει ΤΙ είναι, όχι «παλιά»',
   PAGE.includes('Η μηχανή ανάκλησης') && !PAGE.includes('Η παλιά σελίδα'));
ok('  και ο service worker την κρατάει offline', SW.includes("'istoria.html'"));
ok('ο service worker την κατεβάζει για offline', SW.includes("'istoria-voithima.html'"));
const cache = /var CACHE = "(als-v\d+)"/.exec(SW);
ok('και το CACHE προχώρησε (σταθ. 2)', cache && +cache[1].slice(5) >= 556);
ok('σωστό <!DOCTYPE> και lang="el"', PAGE.startsWith('<!DOCTYPE html>') && PAGE.includes('<html lang="el">'));
is('ένα <body>, ένα </body>', (PAGE.match(/\n<body>/g) || []).length + '/' + (PAGE.match(/<\/body>/g) || []).length, '1/1');

/* ══════════════════════════════════════════════════════════════════ */
/* ══ 9 · Η ΣΕΛΙΔΑ ΑΝΟΙΓΕΙ ΠΡΑΓΜΑΤΙΚΑ ═════════════════════════════════
   ⭐⭐ ΓΙΑΤΙ ΥΠΑΡΧΕΙ ΑΥΤΟ ΤΟ ΤΜΗΜΑ, ΚΑΙ ΕΙΝΑΙ ΤΟ ΣΗΜΑΝΤΙΚΟΤΕΡΟ ΤΟΥ ΑΡΧΕΙΟΥ.
   Μεταφέροντας τη σελίδα μέσα στο MÉTRON έσβησα τον νεκρό διακόπτη θέματος
   και ΕΜΕΙΝΕ ΜΙΑ ΣΚΕΤΗ ΚΛΗΣΗ `applyThemeIcon();` χωρίς συνάρτηση από πίσω.
   ReferenceError στη ΦΟΡΤΩΣΗ → ολόκληρο το IIFE πέθανε → η σελίδα ζωγράφισε
   ΜΟΝΟ την μπάντα και από κάτω ΜΑΥΡΟ. Οι 64 βεβαιώσεις ήταν ΟΛΕΣ πράσινες:
   κάθε μία διάβαζε το ΚΕΙΜΕΝΟ του αρχείου, καμία δεν το ΕΤΡΕΞΕ.
   Το είδε το render — και ένα render δεν τρέχει στο CI. Άρα τρέχει εδώ.

   Οδηγεί τα ΑΛΗΘΙΝΑ inline scripts της σελίδας σε `vm` με στουμπωμένο DOM.
   ΠΟΤΕ αντίγραφο: ένα αντίγραφο συμφωνεί με κάθε bug τέλεια. */
section('9 · ⭐ ΤΟ BOOT ΤΡΕΧΕΙ, ΔΕΝ ΤΟ ΔΙΑΒΑΖΟΥΜΕ');
const vm = require('vm');

function boot(hash, seed){
  const src = [...PAGE.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  const painted = {}, cache = {};
  const el = id => ({
    id, _html: '', hidden: false, disabled: false, dataset: {}, style: {},
    className: '', textContent: '', value: '',
    classList: { add(){}, remove(){}, toggle(){}, contains(){ return false; } },
    get innerHTML(){ return this._html; },
    set innerHTML(v){ this._html = v; if (this.id) painted[this.id] = v; },
    setAttribute(){}, getAttribute(){ return null; }, removeAttribute(){},
    addEventListener(){}, removeEventListener(){}, focus(){}, select(){}, scrollIntoView(){},
    appendChild(){}, append(){}, prepend(){}, insertBefore(){}, remove(){},
    insertAdjacentHTML(pos, html){ this.innerHTML = this._html + html; },
    closest(){ return null; }, contains(){ return false; },
    querySelector(){ return null; }, querySelectorAll(){ return []; },
    getBoundingClientRect(){ return { top:0, left:0, width:800, height:20, bottom:20, right:800 }; },
    offsetTop: 0, offsetHeight: 20, offsetWidth: 800, scrollHeight: 20
  });
  const doc = {
    documentElement: el('html'), body: el('body'), fonts: { ready: Promise.resolve() },
    querySelector(s){ const k = s.startsWith('#') ? s.slice(1) : s; return cache[k] || (cache[k] = el(k)); },
    querySelectorAll(sel){ return sel && sel[0] === '.' ? Object.keys(cache).filter(k => k.indexOf(sel.slice(1)) === 0).map(k => cache[k]) : []; },
    getElementById(k){ return cache[k] || (cache[k] = el(k)); },
    createElement(){ return el(); }, addEventListener(){}, removeEventListener(){},
    createRange(){ return { setStart(){}, setEnd(){}, getBoundingClientRect(){ return { top:0,left:0,width:0,height:0 }; } }; }
  };
  const ls = Object.assign({}, seed || {});
  const win = {
    document: doc, console: { log(){}, warn(){}, error(){} },
    localStorage: { getItem: k => (k in ls ? ls[k] : null), setItem: (k,v) => { ls[k] = String(v); },
                    removeItem: k => { delete ls[k]; }, key: () => null, length: 0 },
    matchMedia: () => ({ matches: true, addEventListener(){}, addListener(){} }),
    getSelection: () => ({ rangeCount: 0, removeAllRanges(){}, getRangeAt(){ return null; } }),
    getComputedStyle: () => ({ getPropertyValue: () => '', lineHeight: '32px', fontSize: '18px', paddingLeft: '0px' }),
    setTimeout: () => 0, clearTimeout(){}, setInterval: () => 0, clearInterval(){},
    requestAnimationFrame: () => 0, cancelAnimationFrame(){},
    addEventListener(){}, removeEventListener(){},
    ResizeObserver: class { observe(){} disconnect(){} },
    location: { hash: hash || '', href: 'file://x', replace(h){ this.hash = h; } }, history: { replaceState(){} },
    /* ⛔ ΨΕΥΤΙΚΟ ΕΠΙΤΗΔΕΣ. Σταθερή αρχή 8: κανένας συγχρονισμός σε harness —
       θα έγραφε στο ΖΩΝΤΑΝΟ Supabase. Εδώ μετράμε μόνο ΟΤΙ κλήθηκε. */
    initCloudSync: () => { win.__sync = true; }, supabase: {},
    navigator: { userAgent: 'node' }, innerWidth: 1440, innerHeight: 900, scrollY: 0, scrollTo(){}
  };
  win.window = win; win.self = win; win.globalThis = win;
  const ctx = vm.createContext(win);
  let error = null;
  for (const sc of src) {
    try { vm.runInContext(sc, ctx, { timeout: 8000 }); }
    catch (e) { error = e.name + ': ' + e.message; break; }
  }
  return { error, painted, win };
}

const B = boot('');                    /* καμία διαδρομή → η ΑΡΧΙΚΗ */
is('⭐ ΚΑΝΕΝΑ σφάλμα στη φόρτωση', B.error || 'NONE', 'NONE');
is('χτίζονται 7 καρτέλες', ((B.painted.tabs || '').match(/role="tab"/g) || []).length, 7);
ok('η ΑΡΧΙΚΗ ζωγραφίζει τον τίτλο της', (B.painted.hero || '').includes('Όλη η ύλη,'));
ok('  και τις τρεις κάρτες', (B.painted.viewHome || '').includes('Συνέχισε από εκεί που σταμάτησες')
   && (B.painted.viewHome || '').includes('Όλοι οι ορισμοί μου') && (B.painted.viewHome || '').includes('Όλες οι χρονολογίες'));
ok('  και τον χάρτη ύλης, και με τα τρία υπόμνημα', (B.painted.viewHome || '').includes('Κεφάλαια &amp; ενότητες')
   && (B.painted.viewHome || '').includes('Δεν έχει φτιαχτεί ακόμα') && (B.painted.viewHome || '').includes('Εκτός ύλης'));
/* ⭐ Η ΦΡΑΣΗ ΤΥΠΩΝΟΤΑΝ 68 ΦΟΡΕΣ — μία ανά άφτιαχτη ενότητα — ενώ το
   υπόμνημα τη λέει ήδη. Τώρα ζει ΜΟΝΟ στο υπόμνημα. */
is('η φράση «Δεν έχει φτιαχτεί ακόμα» γράφεται ΜΙΑ φορά, στο υπόμνημα',
   ((B.painted.viewHome || '').match(/Δεν έχει φτιαχτεί ακόμα/g) || []).length, 1);
/* ⭐ ΤΑ ΝΟΥΜΕΡΑ ΒΓΑΙΝΟΥΝ ΑΠΟ ΤΟ ΥΛΙΚΟ, ΔΕΝ ΓΡΑΦΟΝΤΑΙ: ένα «1» καρφωμένο
   εδώ σημαίνει ότι ο φρουρός σκάει σε ΚΑΘΕ νέα ενότητα, και η εύκολη
   «διόρθωση» είναι να αλλάξεις το νούμερο — δηλαδή να μην ελέγχεις τίποτα. */
is('⭐ κουτί φοράει ΜΟΝΟ ό,τι έχει περιεχόμενο', ((B.painted.viewHome || '').match(/class="ucard"/g) || []).length, CHAPTERS.length);
is('  και οι υπόλοιπες είναι γραμμές λίστας', ((B.painted.viewHome || '').match(/class="urow/g) || []).length, 105 - CHAPTERS.length);
ok('⭐ και ο συγχρονισμός ΟΝΤΩΣ ξεκινάει (initCloudSync κλήθηκε)', B.win.__sync === true);

const C = boot('#/k1-g4/explain');     /* διαδρομή ενότητας */
is('η διαδρομή #/k1-g4 φορτώνει την ενότητα χωρίς σφάλμα', C.error || 'NONE', 'NONE');
is('χτίζονται 8 πάνελ (η Γ.4 έχει βίντεο)', ((C.painted.panels || '').match(/role="tabpanel"/g) || []).length, 8);
is('  και 8 καρτέλες', ((C.painted.tabs || '').match(/role="tab"/g) || []).length, 8);
ok('ο τίτλος της ενότητας μπαίνει στο hero', (C.painted.hero || '').includes('Παγκόσμιος πόλεμος'));
ok('το μενού ενοτήτων γεμίζει, ομαδοποιημένο ανά κεφάλαιο', (C.painted.chapterSel || '').includes('<optgroup'));
ok('και μπαίνει Προηγούμενη/Επόμενη στο τέλος των καρτελών', (C.painted['panel-explain'] || '').includes('class="pn"'));

const D = boot('#/orismoi'), E = boot('#/xronologies');
is('η διαδρομή #/orismoi ζωγραφίζει', D.error || 'NONE', 'NONE');
ok('  με τον τίτλο της', (D.painted.hero || '').includes('Όλοι οι ορισμοί μου'));
is('η διαδρομή #/xronologies ζωγραφίζει', E.error || 'NONE', 'NONE');
ok('  και δείχνει ΜΟΝΟ χρονολογίες βιβλίου', (E.painted.viewList || '').includes('Χρονολογία βιβλίου'));
ok('⛔ ΚΑΜΙΑ «undefined» στις τρεις νέες οθόνες (εδώ έγραψα IC.gap αντί για IC.arrowD)',
   !/undefined/.test((B.painted.viewHome || '') + (D.painted.viewList || '') + (E.painted.viewList || '')));

/* Κάθε καρτέλα ζωγραφίζει ΜΟΝΗ ΤΗΣ, και ελέγχεται με ΔΙΚΟ ΤΗΣ σημάδι — όχι
   με μήκος. Ένα μήκος περνάει και με σκελετό χωρίς περιεχόμενο (σταθ. 10).
   ⚠️ Η «Κείμενο» γράφει σε ΠΑΙΔΙ (#rtext), όχι στο πάνελ: αν το ξεχάσεις,
   ο έλεγχος κοιτάζει το κέλυφος και λέει «γεμάτο» για μια άδεια σελίδα. */
[['explain',   'panel-explain',  'Τι έγινε, με τη σειρά'],
 ['diagram',   'panel-diagram',  'Η οικονομική πλευρά'],
 ['timeline',  'panel-timeline', 'Από το πιο παλιό'],
 ['glossary',  'ggrid',          'Διχασμός (Εθνικός Διχασμός)'],
 ['facts',     'panel-facts',    'Μην τα γράψεις στις εξετάσεις'],
 ['text',      'rtext',          'Η συμμετοχή της Ελλάδας'],
 ['sources',   'panel-sources',  'Πηγές της ενότητας']].forEach(([id, box, needle]) => {
  const r = boot('#/k1-g4/' + id);
  is('η καρτέλα «' + id + '» ζωγραφίζει χωρίς σφάλμα', r.error || 'NONE', 'NONE');
  ok('  και το περιεχόμενό της είναι ΟΝΤΩΣ εκεί («' + needle + '»)',
     (r.painted[box] || '').includes(needle));
});

/* ⭐ ΤΟ ΒΙΝΤΕΟ. Η Γ.4 το έχει: η καρτέλα ζωγραφίζει τον player με τους
   κανόνες που ζήτησε (controls, preload=metadata, playsinline, ΟΧΙ autoplay)
   και το αρχείο ΥΠΑΡΧΕΙ στο repo. Μια ενότητα χωρίς `video` δεν δείχνει
   ούτε καρτέλα ούτε πάνελ — και ένα #/…/video σε αυτήν πέφτει στο «Κατάλαβέ το». */
{
  const r = boot('#/k1-g4/video'), V = r.painted['panel-video'] || '';
  is('Γ.4 · η καρτέλα «video» ζωγραφίζει χωρίς σφάλμα', r.error || 'NONE', 'NONE');
  ok('  με <video controls preload="metadata" playsinline>', /<video controls preload="metadata" playsinline/.test(V));
  ok('  ⛔ χωρίς autoplay', !/autoplay/.test(V));
  ok('  με τη σήμανση και τον τίτλο της', V.includes('ΕΝΟΤΗΤΑ 4 · ANIMATION') && V.includes('Ο Α΄ Παγκόσμιος πόλεμος — σε εικόνες'));
  const g4 = CHAPTERS.find(c => c.id === 'k1-g4');
  ok('  και το αρχείο του υπάρχει', g4.video && fs.existsSync(path.join(ALS, g4.video.src)) && fs.existsSync(path.join(ALS, g4.video.poster)));
  const n = boot('#/k1-g3/video');
  is('Γ.3 (χωρίς βίντεο) · #/…/video φορτώνει χωρίς σφάλμα', n.error || 'NONE', 'NONE');
  is('  με 7 καρτέλες', ((n.painted.tabs || '').match(/role="tab"/g) || []).length, 7);
  ok('  και κανένα πάνελ βίντεο', !(n.painted.panels || '').includes('panel-video'));
  ok('  και πέφτει στο «Κατάλαβέ το»', (n.painted['panel-explain'] || '').includes('Τι έγινε, με τη σειρά'));
}
/* Κεφ.2 Α.1 · το δεύτερο βίντεο (video-kit/episodes/k2-a1). Το ίδιο συμβόλαιο,
   με ΤΗ ΔΙΚΗ ΤΟΥ σήμανση — ένας player που έδειχνε τον τίτλο της Γ.4 θα περνούσε
   κάθε έλεγχο ύπαρξης. */
{
  const r = boot('#/k2-a1/video'), V = r.painted['panel-video'] || '';
  is('Κεφ.2 Α.1 · η καρτέλα «video» ζωγραφίζει χωρίς σφάλμα', r.error || 'NONE', 'NONE');
  ok('  με <video controls preload="metadata" playsinline>, χωρίς autoplay', /<video controls preload="metadata" playsinline/.test(V) && !/autoplay/.test(V));
  ok('  με τη ΔΙΚΗ ΤΗΣ σήμανση και τίτλο', V.includes('ΕΝΟΤΗΤΑ 1 · ANIMATION') && V.includes('Πελατειακά δίκτυα επί τουρκοκρατίας — σε εικόνες') && !V.includes('Παγκόσμιος'));
  /* το src μπαίνει ως ιδιότητα (όχι στο HTML) — ελέγχεται στα δεδομένα της ενότητας */
  const k = CHAPTERS.find(c => c.id === 'k2-a1');
  ok('  δείχνει το δικό της αρχείο', k.video && k.video.src === 'videos/istoria/k2-a1.mp4' && k.video.poster === 'videos/istoria/k2-a1.jpg');
  ok('  και το αρχείο + η αφίσα υπάρχουν', k.video && fs.existsSync(path.join(ALS, k.video.src)) && fs.existsSync(path.join(ALS, k.video.poster)));
}
/* Κεφ.2 Β.1 · το τρίτο βίντεο (video-kit/episodes/k2-b1). Ίδιο συμβόλαιο, ΔΙΚΑ ΤΟΥ σημάδια:
   το num είναι πάλι «1» (όπως της Α.1), άρα ο ΤΙΤΛΟΣ είναι αυτό που τα ξεχωρίζει. */
{
  const r = boot('#/k2-b1/video'), V = r.painted['panel-video'] || '';
  is('Κεφ.2 Β.1 · η καρτέλα «video» ζωγραφίζει χωρίς σφάλμα', r.error || 'NONE', 'NONE');
  ok('  με <video controls preload="metadata" playsinline>, χωρίς autoplay', /<video controls preload="metadata" playsinline/.test(V) && !/autoplay/.test(V));
  ok('  με τη ΔΙΚΗ ΤΗΣ σήμανση και τίτλο (όχι της Α.1)', V.includes('ΕΝΟΤΗΤΑ 1 · ANIMATION') && V.includes('Το σύνταγμα του 1844 — σε εικόνες') && !V.includes('Πελατειακά'));
  const k = CHAPTERS.find(c => c.id === 'k2-b1');
  ok('  δείχνει το δικό της αρχείο', k.video && k.video.src === 'videos/istoria/k2-b1.mp4' && k.video.poster === 'videos/istoria/k2-b1.jpg');
  ok('  και το αρχείο + η αφίσα υπάρχουν', k.video && fs.existsSync(path.join(ALS, k.video.src)) && fs.existsSync(path.join(ALS, k.video.poster)));
}
CHAPTERS.forEach(c => { if (c.video) ok('το βίντεο της ' + c.id + ' υπάρχει στο repo', fs.existsSync(path.join(ALS, c.video.src))); });

/* ⭐⭐ ΚΑΙ Η ΝΕΑ ΕΝΟΤΗΤΑ ΖΩΓΡΑΦΙΖΕΙ ΜΕ ΤΑ ΔΙΚΑ ΤΗΣ ΣΗΜΑΔΙΑ.
   Δεν αρκεί «η σελίδα δεν έσκασε»: το σχεδιάγραμμα είναι ΧΕΙΡΟΓΡΑΦΟ HTML,
   άρα ένα λάθος κλείσιμο ή ένα placeholder που δεν υπάρχει βγάζει σελίδα
   που φορτώνει κανονικά και δείχνει σκουπίδια (ή τίποτα). */
[['explain',   'panel-explain',  'Μια χώρα που δεν κατεβάζει ποτέ τα όπλα'],
 ['diagram',   'panel-diagram',  'Πίνακας 8 του βιβλίου'],
 ['timeline',  'panel-timeline', 'Πλεονασματικός προϋπολογισμός'],
 ['glossary',  'ggrid',          'Υπερπόντια μετανάστευση'],
 ['facts',     'panel-facts',    'Μην τα γράψεις στις εξετάσεις'],
 ['text',      'rtext',          'Στην περίοδο 1910-1922'],
 ['sources',   'panel-sources',  'Πηγές της ενότητας']].forEach(([id, box, needle]) => {
  const r = boot('#/k1-g3/' + id);
  is('Γ.3 · η καρτέλα «' + id + '» ζωγραφίζει χωρίς σφάλμα', r.error || 'NONE', 'NONE');
  ok('  και το περιεχόμενό της είναι ΟΝΤΩΣ εκεί («' + needle + '»)',
     (r.painted[box] || '').includes(needle));
});
/* ⭐⭐ ΚΑΙ Η Γ.2, ΜΕ ΔΙΚΑ ΤΗΣ ΣΗΜΑΔΙΑ — ΟΧΙ ΜΗΚΟΣ, ΟΧΙ ΑΝΤΙΓΡΑΦΟ ΤΗΣ Γ.3.
   Κάθε σημάδι εδώ υπάρχει ΜΟΝΟ αν ζωγραφίστηκε ΑΥΤΗ η ενότητα: μία φράση
   από το σχεδιάγραμμά της, μία από το χρονολόγιό της, μία από το λεξικό της. */
[['explain',   'panel-explain',  'Η εξαίρεση που επιβεβαιώνει τον κανόνα'],
 ['diagram',   'panel-diagram',  'Οι τρεις αιτίες της καθυστέρησης'],
 ['timeline',  'panel-timeline', 'Λαύριο: οι πρώτες καθαρά εργατικές εξεγέρσεις'],
 ['glossary',  'ggrid',          'Φεντερασιόν'],
 ['facts',     'panel-facts',    'Μην τα γράψεις στις εξετάσεις'],
 ['text',      'rtext',          'Οι διαφορές του αγροτικού προβλήματος'],
 ['sources',   'panel-sources',  'Πηγές της ενότητας']].forEach(([id, box, needle]) => {
  const r = boot('#/k1-g2/' + id);
  is('Γ.2 · η καρτέλα «' + id + '» ζωγραφίζει χωρίς σφάλμα', r.error || 'NONE', 'NONE');
  ok('  και το περιεχόμενό της είναι ΟΝΤΩΣ εκεί («' + needle + '»)',
     (r.painted[box] || '').includes(needle));
});
const G2D = boot('#/k1-g2/diagram');
ok('⭐ Γ.2 · τα placeholders του σχεδιαγράμματος έγιναν εικονίδια', !/\{\{\w+\}\}/.test(G2D.painted['panel-diagram'] || 'x{{X}}'));
ok('⭐ Γ.2 · και τα τέσσερα στάδια του σχεδιαγράμματος είναι εκεί',
   ['Τι υπήρχε ήδη', 'Οι τρεις αιτίες', 'Η τομή: η Θεσσαλονίκη', 'Η ταχύτατη ωρίμανση']
     .every(t => (G2D.painted['panel-diagram'] || '').includes(t)));
ok('⭐ Γ.2 · ο τίτλος της μπαίνει στο hero', (G2D.painted.hero || '').includes('Τα πρώτα βήματα του εργατικού κινήματος'));
const G2S = boot('#/k1-g2/sources');
ok('⭐ Γ.2 · η καρτέλα «Πηγές» δείχνει την πηγή ΕΠΟΧΗΣ του ίδιου του βιβλίου',
   (G2S.painted['panel-sources'] || '').includes('Percy Martin'));

const G3D = boot('#/k1-g3/diagram');
ok('⭐ Γ.3 · τα placeholders του σχεδιαγράμματος έγιναν εικονίδια', !/\{\{\w+\}\}/.test(G3D.painted['panel-diagram'] || 'x{{X}}'));
ok('⭐ Γ.3 · και τα νούμερα του Πίνακα 8 είναι όντως εκεί',
   ['11.000', '51.000', '122.000', '128.000', '67.000', '50.000', '41.000', '15.000']
     .every(n => (G3D.painted['panel-diagram'] || '').includes(n)));
ok('⭐ Γ.3 · ο τίτλος της μπαίνει στο hero', (G3D.painted.hero || '').includes('Οι οικονομικές συνθήκες'));

/* ⭐⭐ ΚΑΙ Η Α.1 — Η ΠΡΩΤΗ ΕΝΟΤΗΤΑ ΟΛΟΥ ΤΟΥ ΒΙΒΛΙΟΥ, ΜΕ ΔΙΚΑ ΤΗΣ ΣΗΜΑΔΙΑ.
   Κάθε σημάδι εδώ υπάρχει ΜΟΝΟ αν ζωγραφίστηκε ΑΥΤΗ η ενότητα: μία φράση από
   το σχεδιάγραμμά της, μία από το χρονολόγιό της, μία από το λεξικό της.
   ⚠️ Ζει σε ΑΛΛΗ σελίδα του βιβλίου (index1_2) από τις τρεις Γ. (index1_4):
   το κεφ. 1 είναι μοιρασμένο σε τρία αρχεία, ένα ανά τμήμα Α/Β/Γ. */
[['explain',   'panel-explain',  'Όχι μόνο φτωχή — και μικρή και άδεια'],
 ['diagram',   'panel-diagram',  'Πίνακας 1 του βιβλίου'],
 ['timeline',  'panel-timeline', 'Προστίθενται τα Ιόνια νησιά'],
 ['glossary',  'ggrid',          'Αγρανάπαυση'],
 ['facts',     'panel-facts',    'Μην τα γράψεις στις εξετάσεις'],
 ['text',      'rtext',          'Η Ελλάδα δεν ήταν μόνο φτωχή'],
 ['sources',   'panel-sources',  'Πηγές της ενότητας']].forEach(([id, box, needle]) => {
  const r = boot('#/k1-a1/' + id);
  is('Α.1 · η καρτέλα «' + id + '» ζωγραφίζει χωρίς σφάλμα', r.error || 'NONE', 'NONE');
  ok('  και το περιεχόμενό της είναι ΟΝΤΩΣ εκεί («' + needle + '»)',
     (r.painted[box] || '').includes(needle));
});
const A1D = boot('#/k1-a1/diagram');
ok('⭐ Α.1 · τα placeholders του σχεδιαγράμματος έγιναν εικονίδια', !/\{\{\w+\}\}/.test(A1D.painted['panel-diagram'] || 'x{{X}}'));
ok('⭐ Α.1 · και τα πέντε στάδια του σχεδιαγράμματος είναι εκεί',
   ['Τα τρία μειονεκτήματα, μαζί', 'Ο χάρτης: ο κορμός και οι δύο προσθήκες',
    'Η πυκνότητα, και η εικόνα του τόπου', 'Πληθυσμός που αυξάνεται, οικονομία που δεν αντέχει',
    'Οι δύο κινήσεις: ΜΕΣΑ και ΕΞΩ']
     .every(x => (A1D.painted['panel-diagram'] || '').includes(x)));
ok('⭐ Α.1 · και τα νούμερα ΚΑΙ ΤΩΝ ΔΥΟ πινάκων του βιβλίου είναι όντως εκεί',
   ['47.516', '752.000', '63.606', '2.701.000', '150.833', '7.050.000',
    '63.000', '168.000', '74.000', '114.000'].every(n => (A1D.painted['panel-diagram'] || '').includes(n)));
ok('⭐ Α.1 · ο τίτλος της μπαίνει στο hero', (A1D.painted.hero || '').includes('Τα δημογραφικά δεδομένα'));
const A1S = boot('#/k1-a1/sources');
ok('⭐ Α.1 · η καρτέλα «Πηγές» δείχνει τη μαρτυρία ΕΠΟΧΗΣ του ίδιου του βιβλίου (Moraitinis, 1877)',
   (A1S.painted['panel-sources'] || '').includes('Moraitinis'));

/* ⛔⛔ ΤΟ ΤΥΠΟΓΡΑΦΙΚΟ ΤΗΣ ΣΕΛΙΔΑΣ ΖΕΙ ΜΕΣΑ ΣΤΟΝ ΠΙΝΑΚΑ 1, ΟΧΙ ΣΤΗΝ ΠΡΟΖΑ.
   Το βιβλίο γράφει «4.818..000» (διπλή τελεία) στη γραμμή του 1914. Δεν
   είναι «sic» της ενότητας — καμία παράγραφος δεν το περιέχει — αλλά ΔΕΝ
   επιτρέπεται και να «διορθωθεί» σιωπηλά εκεί όπου ζει. */
/* ⚠️ ΤΟ ΣΧΕΔΙΑΓΡΑΜΜΑ ΔΕΝ ΖΕΙ ΜΕΣΑ ΣΤΟ CHAPTERS. Μπαίνει σε ΔΕΥΤΕΡΟ <script>
   ως CHAPTERS[n].diagram, άρα το eval του πίνακα το βλέπει undefined — το
   μόνο μέρος όπου υπάρχει είναι το ΖΩΓΡΑΦΙΣΜΕΝΟ πάνελ. */
ok('⭐ Α.1 · καμία διόρθωση στη γραμμή του 1914: το «4.818..000» του βιβλίου μένει',
   (A1D.painted['panel-diagram'] || '').includes('<td class="amt">4.818..000</td>'));
ok('  και η απόκλιση ΔΗΛΩΝΕΤΑΙ στη σελίδα, δεν κρύβεται (σταθ. 50)',
   (A1D.painted['panel-diagram'] || '').includes('τυπογραφικό του βιβλίου'));
ok('  ⛔ και το κελί ΔΕΝ γράφτηκε ποτέ στη «σωστή» του μορφή',
   !(A1D.painted['panel-diagram'] || '').includes('>4.818.000<'));

const A1 = CHAPTERS.find(c => c.id === 'k1-a1');
if (A1) {
  is('⭐ Α.1 · η πρόζα της είναι καθαρή — μηδέν τυπογραφικά, συνειδητά', A1.sic.length, 0);
  /* ⛔ Ο ΣΚΕΛΕΤΟΣ ΤΟΥ SCRIPT ΠΡΟΤΕΙΝΕ ΤΕΣΣΕΡΑ ΓΕΓΟΝΟΤΑ ΑΠΟ ΤΟΝ ΠΙΝΑΚΑ 2
     («Αθήνα 63.000 · Πειραιάς 22.000» στο 1879, «168.000/74.000» στο 1907).
     Καμία από αυτές τις χρονολογίες δεν γράφεται στις παραγράφους: στο
     χρονολόγιο θα γίνονταν γεγονός που ο μαθητής νομίζει ότι το διάβασε. */
  is('⛔ Α.1 · καμία χρονολογία των Πινάκων 1 & 2 δεν γλίστρησε στο χρονολόγιο',
     A1.timeline.events.filter(e => [1838, 1851, 1871, 1879, 1889, 1901, 1907, 1914, 1920, 1928, 1936]
       .includes(+e.y)).map(e => e.id).join(' | '), '');
  is('⭐ Α.1 · και οι πέντε χρονολογίες βιβλίου είναι ΟΛΕΣ του κειμένου',
     A1.timeline.events.filter(e => e.book).map(e => e.label).join(','), '1828,1854,1864,1881,1911');
}

/* ⭐⭐ ΚΑΙ Η Α.2 — Η ΕΝΟΤΗΤΑ ΧΩΡΙΣ ΚΑΜΙΑ ΧΡΟΝΟΛΟΓΙΑ, ΜΕ ΔΙΚΑ ΤΗΣ ΣΗΜΑΔΙΑ. */
[['explain',   'panel-explain',  'Έμοιαζε με την Ανατολή, ενώ κοίταζε τη Δύση'],
 ['diagram',   'panel-diagram',  'Οι τέσσερις προϋποθέσεις που έλειπαν'],
 ['timeline',  'panel-timeline', 'Τανζιμάτ'],
 ['glossary',  'ggrid',          'Ανεπρόκοπος'],
 ['facts',     'panel-facts',    'Μην τα γράψεις στις εξετάσεις'],
 ['text',      'rtext',          'Πώς θα μπορούσαν άλλωστε να υπάρξουν'],
 ['sources',   'panel-sources',  'Πηγές της ενότητας']].forEach(([id, box, needle]) => {
  const r = boot('#/k1-a2/' + id);
  is('Α.2 · η καρτέλα «' + id + '» ζωγραφίζει χωρίς σφάλμα', r.error || 'NONE', 'NONE');
  ok('  και το περιεχόμενό της είναι ΟΝΤΩΣ εκεί («' + needle + '»)',
     (r.painted[box] || '').includes(needle));
});
const A2D = boot('#/k1-a2/diagram');
ok('⭐ Α.2 · τα placeholders του σχεδιαγράμματος έγιναν εικονίδια', !/\{\{\w+\}\}/.test(A2D.painted['panel-diagram'] || 'x{{X}}'));
ok('⭐ Α.2 · και τα πέντε στάδια του σχεδιαγράμματος είναι εκεί',
   ['Το κενό: απουσίαζαν οι «ατμομηχανές»', 'Οι τέσσερις προϋποθέσεις που έλειπαν',
    'Ο πλούτος υπήρχε — απλώς ζούσε έξω από τα σύνορα',
    'Η στροφή προς την Ελλάδα — και η πραγματική της αιτία',
    'Η «Μεγάλη Ιδέα» — εδώ εξετάζεται ΟΙΚΟΝΟΜΙΚΑ']
     .every(x => (A2D.painted['panel-diagram'] || '').includes(x)));
ok('⭐ Α.2 · και τα έξι άκρα του τόξου, ακριβώς όπως τα γράφει το βιβλίο',
   ['Ουκρανία', 'Σουδάν', 'Δούναβη', 'Καύκασ', 'Σμύρνη', 'Κιλικία']
     .every(x => (A2D.painted['panel-diagram'] || '').includes(x)));
ok('⭐ Α.2 · ο τίτλος της μπαίνει στο hero', (A2D.painted.hero || '').includes('παραγωγικές δυνάμεις'));
const A2S = boot('#/k1-a2/sources');
ok('⭐ Α.2 · οι «Πηγές» φέρνουν τον Κωλέττη ΑΠΟ ΤΟ ΚΕΦ. 2 του ίδιου βιβλίου',
   (A2S.painted['panel-sources'] || '').includes('Κωλέττης')
   && (A2S.painted['panel-sources'] || '').includes('Τα πρώτα ελληνικά κόμματα'));
ok('  και λένε ΡΗΤΑ ότι η Β.11 είναι ΕΚΤΟΣ εξεταστέας ύλης',
   (A2S.painted['panel-sources'] || '').includes('ΕΚΤΟΣ εξεταστέας ύλης'));

/* ⛔⛔ Η ΕΝΟΤΗΤΑ ΧΩΡΙΣ ΧΡΟΝΟΛΟΓΙΕΣ ΕΙΝΑΙ ΤΟ ΟΡΙΟ ΤΟΥ ΧΡΟΝΟΛΟΓΙΟΥ.
   Τρεις παράγραφοι, μηδέν τετραψήφιος αριθμός → μηδέν book:true. Ο
   διακόπτης «Μόνο του βιβλίου» ΜΕΝΕΙ στο localStorage, οπότε αν είναι
   ανοιχτός το πάνελ ζωγράφιζε ΤΙΠΟΤΑ, χωρίς μία λέξη εξήγησης — η
   επαναλαμβανόμενη ασθένεια του project (σιωπηλό-άδειο). */
const A2 = CHAPTERS.find(c => c.id === 'k1-a2');
if (A2) {
  is('⭐ Α.2 · το ΚΕΙΜΕΝΟ της δεν γράφει ούτε έναν τετραψήφιο αριθμό',
     (A2.paragraphs.join('\n').match(/\b1[89]\d\d\b/g) || []).join(','), '');
  is('⭐ …άρα ΜΗΔΕΝ «Χρονολογία βιβλίου», και αυτό είναι σωστό',
     A2.timeline.events.filter(e => e.book).length, 0);
  ok('  και κάθε ένα από τα γεγονότα-πλαίσιο λέει ΓΙΑΤΙ δεν είναι του βιβλίου',
     A2.timeline.events.length >= 5 && A2.timeline.events.every(e => !!e.note));
  is('⭐ Α.2 · μηδέν τυπογραφικά, συνειδητά', A2.sic.length, 0);
}
ok('⛔ ΤΟ ΚΕΝΟ ΧΡΟΝΟΛΟΓΙΟ ΜΙΛΑΕΙ: ο renderer έχει μήνυμα για «καμία χρονολογία»',
   JS.includes('ΔΕΝ γράφει καμία χρονολογία') && JS.includes('class="empty"'));
/* ⛔⛔ ΚΑΙ ΤΟ ΑΠΟΔΕΙΚΝΥΟΥΜΕ ΟΔΗΓΩΝΤΑΣ ΤΗ ΣΕΛΙΔΑ, ΟΧΙ ΔΙΑΒΑΖΟΝΤΑΣ ΤΗΝ:
   ο διακόπτης έρχεται από το localStorage, άρα ο μαθητής που τον άφησε
   ανοιχτό μία φορά τον βρίσκει ανοιχτό ΠΑΝΤΟΥ. */
const ON = { 'istoria:tlBookOnly': 'true' };
const A2F = boot('#/k1-a2/timeline', ON);
is('⭐ Α.2 · με «Μόνο του βιβλίου» ανοιχτό, η καρτέλα ζωγραφίζει χωρίς σφάλμα', A2F.error || 'NONE', 'NONE');
ok('⛔ …και ΔΕΝ μένει άδεια: εξηγεί ότι η ενότητα δεν γράφει καμία χρονολογία',
   (A2F.painted['panel-timeline'] || '').includes('ΔΕΝ γράφει καμία χρονολογία')
   && (A2F.painted['panel-timeline'] || '').includes('Μόνο του βιβλίου'));
const A1F = boot('#/k1-a1/timeline', ON);
ok('⭐ …ενώ η Α.1, που ΕΧΕΙ χρονολογίες βιβλίου, εξακολουθεί να τις δείχνει στο ίδιο φίλτρο',
   (A1F.painted['panel-timeline'] || '').includes('Χρονολογία βιβλίου')
   && !(A1F.painted['panel-timeline'] || '').includes('ΔΕΝ γράφει καμία χρονολογία'));
ok('  και σε αυτό το φίλτρο ΔΕΝ περνάει κανένα «Πλαίσιο» της Α.1',
   !(A1F.painted['panel-timeline'] || '').includes('badge ctx'));

/* ⭐⭐ ΚΑΙ Η Β.1 — Η ΠΡΩΤΗ ΕΝΟΤΗΤΑ ΤΟΥ ΤΜΗΜΑΤΟΣ Β, ΜΕ ΔΙΚΑ ΤΗΣ ΣΗΜΑΔΙΑ.
   ⚠️ Το σημάδι της καρτέλας «Κείμενο» πέφτει ΕΠΙΤΗΔΕΣ σε πρόζα χωρίς
   λήμματα: ο μαρκαδόρος του λεξικού σπάει κάθε φράση που περιέχει λήμμα. */
[['explain',   'panel-explain',  'Το κεντρικό πρόβλημα: παθητικό ισοζύγιο'],
 ['diagram',   'panel-diagram',  'Πίνακας 4 του βιβλίου'],
 ['timeline',  'panel-timeline', 'Η αφετηρία: 36.000.000 χρυσές δραχμές'],
 ['glossary',  'ggrid',          'Θηραϊκή γη'],
 ['facts',     'panel-facts',    'Μην τα γράψεις στις εξετάσεις'],
 ['text',      'rtext',          'Στατιστικά, η αύξηση της αξίας των συναλλαγών παρουσιάζεται εντυπωσιακή'],
 ['sources',   'panel-sources',  'Πηγές της ενότητας']].forEach(([id, box, needle]) => {
  const r = boot('#/k1-b1/' + id);
  is('Β.1 · η καρτέλα «' + id + '» ζωγραφίζει χωρίς σφάλμα', r.error || 'NONE', 'NONE');
  ok('  και το περιεχόμενό της είναι ΟΝΤΩΣ εκεί («' + needle + '»)',
     (r.painted[box] || '').includes(needle));
});
const B1D = boot('#/k1-b1/diagram');
ok('⭐ Β.1 · τα placeholders του σχεδιαγράμματος έγιναν εικονίδια', !/\{\{\w+\}\}/.test(B1D.painted['panel-diagram'] || 'x{{X}}'));
ok('⭐ Β.1 · και τα πέντε στάδια του σχεδιαγράμματος είναι εκεί',
   ['Γιατί «εμπόριο» εδώ σημαίνει ΕΞΩΤΕΡΙΚΟ εμπόριο',
    'Σχεδόν μόνιμα παθητικό — κι όμως πολύτιμο',
    'Οι τρεις μετρήσεις — και η προειδοποίηση του βιβλίου',
    'Η δομή: εξαγωγές αγροτικές, εισαγωγές βιομηχανικές',
    'Οι εταίροι, και το εμπόριο ΕΞΩ από τα σύνορα']
     .every(x => (B1D.painted['panel-diagram'] || '').includes(x)));
ok('⭐ Β.1 · και τα νούμερα ΚΑΙ ΤΩΝ ΔΥΟ πινάκων του βιβλίου είναι όντως εκεί',
   ['31%', '63%', '36%', '75%', '24%', '7%', '30%', '2%', '12%', '17%', '18%', '22%',
    '66.000.000', '32.000.000', '28.000.000', '25.000.000', '22.000.000', '217.000.000']
     .every(n => (B1D.painted['panel-diagram'] || '').includes(n)));
ok('⭐ Β.1 · ο τίτλος της μπαίνει στο hero', (B1D.painted.hero || '').includes('Το εμπόριο'));
const B1S = boot('#/k1-b1/sources');
ok('⭐ Β.1 · η καρτέλα «Πηγές» δείχνει τη μαρτυρία ΕΠΟΧΗΣ του ίδιου του βιβλίου (Μανσόλας, 1867)',
   (B1S.painted['panel-sources'] || '').includes('Μανσόλα')
   && (B1S.painted['panel-sources'] || '').includes('1867'));

const B1 = CHAPTERS.find(c => c.id === 'k1-b1');
if (B1) {
  /* ⛔ ΤΟ ΛΑΘΟΣ ΤΟΝΙΣΜΟΥ ΕΙΝΑΙ ΤΥΠΟΓΡΑΦΙΚΟ ΤΟΥ ΒΙΒΛΙΟΥ, ΚΑΙ ΤΟ ΕΡΓΑΛΕΙΟ
     ΔΕΝ ΤΟ ΠΙΑΝΕΙ. Το tools/istoria-unit.js ανέφερε «0 τυπογραφικά». */
  is('⭐ Β.1 · κρατάει το τυπογραφικό «πού όμως» του βιβλίου', B1.sic.length, 1);
  ok('  και είναι ακριβώς ο λάθος τονισμός', B1.sic[0].m === 'πού όμως' && B1.sic[0].fix === 'που όμως');
  /* ⛔⛔ ΟΙ ΧΡΟΝΟΛΟΓΙΕΣ ΤΩΝ ΠΙΝΑΚΩΝ ΚΑΙ ΤΗΣ ΠΗΓΗΣ ΔΕΝ ΜΠΑΙΝΟΥΝ ΠΟΤΕ.
     Εδώ ο πειρασμός είναι μεγάλος: ο Πίνακας 4 έχει ολόκληρη χρονιά (1890)
     και η πηγή του Μανσόλα τρεις (1830, 1859, 1867). */
  is('⛔ Β.1 · καμία χρονολογία ΠΙΝΑΚΑ ή ΠΗΓΗΣ δεν γλίστρησε στο χρονολόγιο',
     B1.timeline.events.filter(e => [1830, 1859, 1867, 1890].includes(+e.y)).map(e => e.id).join(' | '), '');
  is('⭐ Β.1 · και οι επτά χρονολογίες βιβλίου είναι ΟΛΕΣ της πρόζας',
     B1.timeline.events.filter(e => e.book).map(e => e.label).join(','),
     '1851,1880,μετά το 1900,1901,1900-1910,1911,1913');
  ok('  ενώ οι προσαρτήσεις του 1864/1881 μένουν «Πλαίσιο» — τα έτη τα γράφει η Α.1, όχι η Β.1',
     B1.timeline.events.filter(e => [1864, 1881].includes(+e.y)).every(e => !e.book && !!e.note));
  /* ⭐ Ο ΠΙΝΑΚΑΣ 4 ΤΟΥ ΒΙΒΛΙΟΥ ΔΕΝ ΑΘΡΟΙΖΕΙ — ΚΑΙ ΜΕΝΕΙ ΩΣ ΕΧΕΙ. */
  const dg = B1D.painted['panel-diagram'] || '';
  ok('⭐ Β.1 · η γραμμή «Σύνολο» του Πίνακα 4 μένει στα 217.000.000 του βιβλίου', dg.includes('217.000.000'));
  ok('  και η απόκλιση ΔΗΛΩΝΕΤΑΙ, δεν διορθώνεται σιωπηλά',
     dg.includes('195.000.000') && dg.includes('δεν κλείνει'));
  ok('  και το «1890» δηλώνεται ΡΗΤΑ ως χρονολογία του πίνακα, όχι της πρόζας',
     dg.includes('χρονολογία <b>ΤΟΥ ΠΙΝΑΚΑ</b>'));
}

/* ⭐⭐ ΚΑΙ Η Β.2 — Η ΕΝΟΤΗΤΑ ΠΟΥ ΞΕΚΙΝΑΕΙ ΑΠΟ ΤΟΝ 18ο ΑΙΩΝΑ. */
[['explain',   'panel-explain',  'Η αφετηρία είναι ΠΡΙΝ από το κράτος'],
 ['diagram',   'panel-diagram',  'Πίνακας 5 του βιβλίου'],
 ['timeline',  'panel-timeline', 'Συνθήκη του Κιουτσούκ Καϊναρτζή'],
 ['glossary',  'ggrid',          'Ηπειρωτικός αποκλεισμός'],
 ['facts',     'panel-facts',    'Μην τα γράψεις στις εξετάσεις'],
 ['text',      'rtext',          'Στη διάρκεια των συγκρούσεων'],
 ['sources',   'panel-sources',  'Πηγές της ενότητας']].forEach(([id, box, needle]) => {
  const r = boot('#/k1-b2/' + id);
  is('Β.2 · η καρτέλα «' + id + '» ζωγραφίζει χωρίς σφάλμα', r.error || 'NONE', 'NONE');
  ok('  και το περιεχόμενό της είναι ΟΝΤΩΣ εκεί («' + needle + '»)',
     (r.painted[box] || '').includes(needle));
});
const B2D = boot('#/k1-b2/diagram');
ok('⭐ Β.2 · τα placeholders του σχεδιαγράμματος έγιναν εικονίδια', !/\{\{\w+\}\}/.test(B2D.painted['panel-diagram'] || 'x{{X}}'));
ok('⭐ Β.2 · και τα πέντε στάδια του σχεδιαγράμματος είναι εκεί',
   ['Τρεις συγκυρίες — και καμία δεν είναι ελληνική απόφαση',
    'Η Επανάσταση καταστρέφει το πιο δυνατό κομμάτι της οικονομίας',
    'Η Σύρος: γιατί ακριβώς αυτό το νησί',
    'Η άνοδος — και η επιφύλαξη δύο προτάσεις μετά',
    'Ο ατμός αλλάζει το πλοίο — και τον ιδιοκτήτη του']
     .every(x => (B2D.painted['panel-diagram'] || '').includes(x)));
ok('⭐ Β.2 · και ΟΛΟΣ ο Πίνακας 5 είναι εκεί, ιστιοφόρα ΚΑΙ ατμόπλοια',
   ['837', '94.000', '1.482', '248.000', '1.212', '234.000', '210.000',
    '1.292', '213.000', '145.000', '760', '102.000',
    '8.200', '60.400', '202.000', '384.000'].every(n => (B2D.painted['panel-diagram'] || '').includes(n)));
ok('⭐ Β.2 · ο τίτλος της μπαίνει στο hero', (B2D.painted.hero || '').includes('Η εμπορική ναυτιλία'));
const B2S = boot('#/k1-b2/sources');
ok('⭐ Β.2 · οι «Πηγές» φέρνουν τη Β.7 του ίδιου βιβλίου για τα λιμάνια και τους φάρους',
   (B2S.painted['panel-sources'] || '').includes('Τα δημόσια έργα')
   && (B2S.painted['panel-sources'] || '').includes('διώρυγας της Κορίνθου'));

const B2 = CHAPTERS.find(c => c.id === 'k1-b2');
if (B2) {
  /* ⛔⛔ ΤΟ 1774 ΕΙΝΑΙ ΧΡΟΝΟΛΟΓΙΑ ΤΟΥ ΒΙΒΛΙΟΥ ΚΑΙ ΠΡΕΠΕΙ ΝΑ ΜΕΤΡΑΕΙ.
     Ο έλεγχος των ετών κοιτούσε μόνο 18xx/19xx — καρφωμένη υπόθεση που
     έσπασε στην πρώτη ενότητα που πάει πιο πίσω. */
  ok('⭐ Β.2 · το «1774» του Κιουτσούκ Καϊναρτζή είναι ΧΡΟΝΟΛΟΓΙΑ ΒΙΒΛΙΟΥ',
     B2.timeline.events.some(e => e.book && e.label === '1774'));
  ok('  και το γράφει όντως η πρόζα της', B2.paragraphs.join('\n').includes('Κιουτσούκ Καϊναρτζή (1774)'));
  is('⛔ Β.2 · καμία χρονολογία του Πίνακα 5 δεν γλίστρησε στο χρονολόγιο',
     B2.timeline.events.filter(e => [1850, 1860, 1875, 1892, 1903, 1910, 1911].includes(+e.y)).map(e => e.id).join(' | '), '');
  /* ⛔ ΤΑ ΤΡΙΑ ΤΥΠΟΓΡΑΦΙΚΑ: ο λάθος τονισμός ΞΑΝΑ (μοτίβο, όπως στη Β.1)
     και οι δύο παρενθετικές παύλες (μοτίβο, όπως στις Γ.2/Γ.3). */
  is('⭐ Β.2 · κρατάει και τα τρία τυπογραφικά του βιβλίου', B2.sic.length, 3);
  ok('  ο λάθος τονισμός «κενά, πού» — δεύτερη φορά στο τμήμα Β',
     B2.sic.some(x => x.m === 'κενά, πού'));
  ok('  και οι ΔΥΟ παρενθετικές παύλες',
     B2.sic.some(x => x.m.indexOf('-ελληνικά-') >= 0)
     && B2.sic.some(x => x.m.indexOf('-όχι μόνο για τα ελληνικά μέτρα-') >= 0));
}

/* ⭐⭐ ΚΑΙ Η Β.3 — Η ΕΝΟΤΗΤΑ ΜΕ ΤΟΝ ΟΡΦΑΝΟ ΑΣΤΕΡΙΣΚΟ. */
[['explain',   'panel-explain',  'Η λύση: δύο στόχοι που αναιρούσαν ο ένας τον άλλον'],
 ['diagram',   'panel-diagram',  'Τα τέσσερα εμπόδια της διανομής'],
 ['timeline',  'panel-timeline', 'Οι νομοθετικές ρυθμίσεις: η οριστική αντιμετώπιση'],
 ['glossary',  'ggrid',          'Επάλληλα δικαιώματα'],
 ['facts',     'panel-facts',    'Μην τα γράψεις στις εξετάσεις'],
 ['text',      'rtext',          'Στόχος των νομοθετημάτων ήταν να εξασφαλιστούν'],
 ['sources',   'panel-sources',  'Πηγές της ενότητας']].forEach(([id, box, needle]) => {
  const r = boot('#/k1-b3/' + id);
  is('Β.3 · η καρτέλα «' + id + '» ζωγραφίζει χωρίς σφάλμα', r.error || 'NONE', 'NONE');
  ok('  και το περιεχόμενό της είναι ΟΝΤΩΣ εκεί («' + needle + '»)',
     (r.painted[box] || '').includes(needle));
});
const B3D = boot('#/k1-b3/diagram');
ok('⭐ Β.3 · τα placeholders του σχεδιαγράμματος έγιναν εικονίδια', !/\{\{\w+\}\}/.test(B3D.painted['panel-diagram'] || 'x{{X}}'));
ok('⭐ Β.3 · και τα πέντε στάδια του σχεδιαγράμματος είναι εκεί',
   ['Τι ήταν οι «εθνικές γαίες», και πώς έγιναν εθνικές',
    'Τα τέσσερα εμπόδια της διανομής',
    'Πολυτεμαχισμός — και οι δύο αντίθετες συνέπειές του',
    '1870-1871: δύο στόχοι που αναιρούσαν ο ένας τον άλλον',
    'Τι έδωσε τελικά η διανομή']
     .every(x => (B3D.painted['panel-diagram'] || '').includes(x)));
ok('⭐ Β.3 · και ΟΛΑ τα νούμερα της ενότητας είναι μαζεμένα εκεί',
   ['4.000.000 – 5.000.000 στρ.', '15%', '80 στρέμματα', '40 στρέμματα',
    '600.000 στρ.', '2.650.000 στρ.', '370.000', '50%'].every(n => (B3D.painted['panel-diagram'] || '').includes(n)));
ok('⭐ Β.3 · οι τρεις διαιρέσεις δηλώνονται ΡΗΤΑ ως δικές μου, όχι του βιβλίου',
   (B3D.painted['panel-diagram'] || '').includes('7,2 στρέμματα')
   && (B3D.painted['panel-diagram'] || '').includes('Μη γράψεις το «7,2» σαν νούμερο του βιβλίου'));
ok('⭐ Β.3 · και τα ονόματα των «επάλληλων δικαιωμάτων» δηλώνονται ως ανάλυση, όχι ως κείμενο',
   (B3D.painted['panel-diagram'] || '').includes('δική μου ανάλυση'));
ok('⭐ Β.3 · ο τίτλος της μπαίνει στο hero', (B3D.painted.hero || '').includes('Η διανομή των εθνικών κτημάτων'));
const B3S = boot('#/k1-b3/sources');
ok('⭐ Β.3 · οι «Πηγές» φέρνουν ΞΑΝΑ τον Μανσόλα (1867), από άλλη σελίδα του ίδιου βιβλίου',
   (B3S.painted['panel-sources'] || '').includes('Μανσόλα')
   && (B3S.painted['panel-sources'] || '').includes('σ. 43-44'));
ok('  και τη Γ.1, που δείχνει ότι το «καμία ένταση» ισχύει ΜΟΝΟ για την παλιά Ελλάδα',
   (B3S.painted['panel-sources'] || '').includes('Το αγροτικό ζήτημα')
   && (B3S.painted['panel-sources'] || '').includes('τσιφλίκια'));

const B3 = CHAPTERS.find(c => c.id === 'k1-b3');
if (B3) {
  /* ⭐⭐ ΤΡΙΤΟ ΣΥΝΕΧΟΜΕΝΟ ΤΟΝΙΚΟ ΛΑΘΟΣ ΤΟΥ ΤΜΗΜΑΤΟΣ Β — ΜΟΤΙΒΟ.
     Β.1 «πού όμως» · Β.2 «κενά, πού» · Β.3 «πολυπλοκότητα του». */
  is('⭐ Β.3 · κρατάει και τα δύο τυπογραφικά του βιβλίου', B3.sic.length, 2);
  ok('  το τονικό λάθος «πολυπλοκότητα του» (τρίτο συνεχόμενο στο τμήμα Β)',
     B3.sic.some(x => x.m === 'πολυπλοκότητα του'));
  /* ⭐⭐⭐ Ο ΟΡΦΑΝΟΣ ΑΣΤΕΡΙΣΚΟΣ: ο ΔΕΙΚΤΗΣ υποσημείωσης έμεινε, η ΣΗΜΕΙΩΣΗ
     λείπει από όλο το ψηφιακό βιβλίο. Μένει ως έχει και δηλώνεται. */
  ok('  και ο ΟΡΦΑΝΟΣ αστερίσκος υποσημείωσης', B3.sic.some(x => x.m === 'επί της γης*'));
  ok('  ο αστερίσκος υπάρχει ΟΝΤΩΣ στο κείμενο της ενότητας',
     B3.paragraphs.join('\n').includes('επί της γης*'));
  ok('  και τα fun facts εξηγούν ΓΙΑΤΙ λείπει η υποσημείωση',
     JSON.stringify(B3.facts).indexOf('υποσημείωση') >= 0);
  /* ⛔⛔ Η ΠΗΓΗ ΤΟΥ ΜΑΝΣΟΛΑ ΔΙΝΕΙ ΤΡΕΙΣ ΧΡΟΝΟΛΟΓΙΕΣ (1836, 1859, 1867)
     ΚΑΙ ΚΑΜΙΑ ΔΕΝ ΕΠΙΤΡΕΠΕΤΑΙ ΣΤΟ ΧΡΟΝΟΛΟΓΙΟ. */
  is('⛔ Β.3 · καμία χρονολογία ΠΗΓΗΣ δεν γλίστρησε στο χρονολόγιο',
     B3.timeline.events.filter(e => [1836, 1859, 1867].includes(+e.y)).map(e => e.id).join(' | '), '');
  is('⭐ Β.3 · και οι τρεις χρονολογίες βιβλίου είναι ΟΛΕΣ της πρόζας',
     B3.timeline.events.filter(e => e.book).map(e => e.label).join(','), '1833,1870-1871,1911');
}

/* ⭐⭐ ΚΑΙ Η Γ.5 — Η ΕΝΟΤΗΤΑ ΜΕ ΤΙΣ ΔΥΟ ΠΑΡΑΓΡΑΦΟΥΣ ΚΑΙ ΤΑ ΤΡΙΑ ΝΟΥΜΕΡΑ. */
[['explain',   'panel-explain',  'Τραγωδία ΚΑΙ καταλύτης — και τα δύο μαζί'],
 ['diagram',   'panel-diagram',  'Ποιοι μπήκαν, ποιοι έφυγαν'],
 ['timeline',  'panel-timeline', 'Τα δύο προσφυγικά δάνεια του εξωτερικού'],
 ['glossary',  'ggrid',          'Λειτούργησε ως καταλύτης'],
 ['facts',     'panel-facts',    'Μην τα γράψεις στις εξετάσεις'],
 ['text',      'rtext',          'σε σχέση με το μέγεθος του προβλήματος'],
 ['sources',   'panel-sources',  'Πηγές της ενότητας']].forEach(([id, box, needle]) => {
  const r = boot('#/k1-g5/' + id);
  is('Γ.5 · η καρτέλα «' + id + '» ζωγραφίζει χωρίς σφάλμα', r.error || 'NONE', 'NONE');
  ok('  και το περιεχόμενό της είναι ΟΝΤΩΣ εκεί («' + needle + '»)',
     (r.painted[box] || '').includes(needle));
});
const G5D = boot('#/k1-g5/diagram');
ok('⭐ Γ.5 · τα placeholders του σχεδιαγράμματος έγιναν εικονίδια', !/\{\{\w+\}\}/.test(G5D.painted['panel-diagram'] || 'x{{X}}'));
ok('⭐ Γ.5 · και τα τέσσερα στάδια του σχεδιαγράμματος είναι εκεί',
   ['Ποιοι μπήκαν, ποιοι έφυγαν',
    'Μία νέα αρχή» — τι κλείνει και τι ανοίγει',
    'Τραγωδία ΚΑΙ καταλύτης — στην ίδια πρόταση',
    'Η ετυμηγορία, και με τι πληρώθηκε']
     .every(x => (G5D.painted['panel-diagram'] || '').includes(x)));
ok('⭐ Γ.5 · και ΟΛΑ τα νούμερα της ενότητας είναι μαζεμένα εκεί',
   ['1.230.000', '45.000', '610.000', '100 χρόνια', '1923 και 1924', '5 – 10 δισ. δρχ.']
     .every(n => (G5D.painted['panel-diagram'] || '').includes(n)));
/* ⛔ ΟΙ ΤΡΕΙΣ ΑΝΑΓΝΩΣΕΙΣ ΕΙΝΑΙ ΔΙΚΕΣ ΜΟΥ ΠΡΑΞΕΙΣ, ΟΧΙ ΝΟΥΜΕΡΑ ΤΟΥ ΒΙΒΛΙΟΥ —
   και η σελίδα το λέει ΡΗΤΑ, όπως έκανε η Β.3 με το «7,2». */
ok('⭐ Γ.5 · οι πράξεις δηλώνονται ΡΗΤΑ ως δικές μου, όχι του βιβλίου',
   (G5D.painted['panel-diagram'] || '').includes('δικές μου πράξεις')
   && (G5D.painted['panel-diagram'] || '').includes('Μη γράψεις καμία από τις τρεις σαν νούμερο του βιβλίου'));
ok('⭐ Γ.5 · και η σύγκριση των δύο απογραφών δηλώνει ΜΟΝΗ ΤΗΣ ότι δεν είναι καθαρή',
   (G5D.painted['panel-diagram'] || '').includes('δεν είναι καθαρή')
   && (G5D.painted['panel-diagram'] || '').includes('150.833'));
/* ⚠️⚠️ ΤΟ ΜΟΝΟ ΤΥΠΟΓΡΑΦΙΚΟ ΤΗΣ ΕΝΟΤΗΤΑΣ ΖΕΙ ΕΞΩ ΑΠΟ ΤΗΝ ΠΡΟΖΑ, ΣΤΗ ΛΕΖΑΝΤΑ
   ΤΗΣ ΕΙΚΟΝΑΣ («άφιξη τους» αντί «άφιξή τους»). Το `sic` ελέγχεται κατά των
   paragraphs, άρα εκεί ΔΕΝ χωράει — ίδια αρχή με το «4.818..000» της Α.1.
   `sic: []` ΣΥΝΕΙΔΗΤΑ, και η απόκλιση δηλώνεται στο σχεδιάγραμμα. */
ok('⭐ Γ.5 · το τυπογραφικό της ΛΕΖΑΝΤΑΣ δηλώνεται, αν και δεν χωράει στο sic',
   (G5D.painted['panel-diagram'] || '').includes('άφιξη τους')
   && (G5D.painted['panel-diagram'] || '').includes('λεζάντα δεν είναι παράγραφος'));
ok('⭐ Γ.5 · ο τίτλος της μπαίνει στο hero', (G5D.painted.hero || '').includes('Η οικονομική ζωή κατά την περίοδο 1922-1936'));
const G5S = boot('#/k1-g5/sources');
ok('⭐ Γ.5 · οι «Πηγές» φέρνουν το ΚΕΙΜΕΝΟ της Σύμβασης της Λοζάνης (30 Ιανουαρίου 1923)',
   (G5S.painted['panel-sources'] || '').includes('ΣΥΜΒΑΣΙΣ')
   && (G5S.painted['panel-sources'] || '').includes('18 Οκτωβρίου 1912'));
ok('  τον ΠΙΝΑΚΑ της προέλευσης, με το σύνολο και το μερίδιο της Τουρκίας',
   (G5S.painted['panel-sources'] || '').includes('1.221.849')
   && (G5S.painted['panel-sources'] || '').includes('1.104.216'));
ok('  και τη ΔΙΑΦΩΝΙΑ: το ψήφισμα των ίδιων των προσφύγων',
   (G5S.painted['panel-sources'] || '').includes('Ομόνοια')
   && (G5S.painted['panel-sources'] || '').includes('αναγκαστικού εκπατρισμού'));

const G5 = CHAPTERS.find(c => c.id === 'k1-g5');
if (G5) {
  /* ⛔ ΜΗΔΕΝ ΤΥΠΟΓΡΑΦΙΚΟ ΣΤΗΝ ΠΡΟΖΑ — ΚΑΙ ΕΙΝΑΙ ΑΠΟΦΑΣΗ, ΟΧΙ ΠΑΡΑΛΕΙΨΗ. */
  is('⭐ Γ.5 · sic: [] συνειδητά — το τυπογραφικό ζει στη λεζάντα, όχι στην πρόζα', G5.sic.length, 0);
  /* ⛔⛔ ΤΟ 1936 ΤΟΥ ΤΙΤΛΟΥ ΔΕΝ ΓΡΑΦΕΤΑΙ ΠΟΥΘΕΝΑ ΣΤΙΣ ΠΑΡΑΓΡΑΦΟΥΣ.
     Ο τίτλος ΔΕΝ είναι κείμενο: ένα book:true στο 1936 θα ήταν η σελίδα να
     λέει ψέματα για να δείχνει πληρέστερο χρονολόγιο. */
  ok('⛔ Γ.5 · το 1936 του ΤΙΤΛΟΥ δεν γράφεται στην πρόζα', !G5.paragraphs.join('\n').includes('1936'));
  ok('  και καμία χρονολογία του χρονολογίου δεν το διεκδικεί ως «του βιβλίου»',
     !G5.timeline.events.some(e => e.book && String(e.label).includes('1936')));
  is('⭐ Γ.5 · και οι τρεις χρονολογίες βιβλίου είναι ΟΛΕΣ της πρόζας',
     G5.timeline.events.filter(e => e.book).map(e => e.label).join(','), '1821,1922,1923 · 1924');
  /* ⛔ ΤΟ 1928 ΕΙΝΑΙ ΕΤΟΣ ΑΠΟΓΡΑΦΗΣ ΤΟΥ ΠΙΝΑΚΑ ΚΑΙ ΤΟ 21-1-1923 ΕΙΝΑΙ ΤΗΣ
     ΠΗΓΗΣ: κανένα από τα δύο δεν επιτρέπεται να γίνει γεγονός χρονολογίου. */
  is('⛔ Γ.5 · καμία χρονολογία ΠΙΝΑΚΑ ή ΠΗΓΗΣ δεν έγινε γεγονός',
     G5.timeline.events.filter(e => /απογραφ|ψήφισμα|Ομόνοια/i.test(String(e.title))).map(e => e.id).join(' | '), '');
  /* ⭐⭐ Η ΛΕΞΗ «ΑΝΤΑΛΛΑΓΗ» ΔΕΝ ΥΠΑΡΧΕΙ ΣΤΗΝ ΕΝΟΤΗΤΑ — ΚΑΙ ΑΥΤΟ ΕΙΝΑΙ ΤΟ
     ΕΥΡΗΜΑ ΤΗΣ: η μεγαλύτερη υποχρεωτική ανταλλαγή πληθυσμών του αιώνα
     περνάει μέσα από τρεις λέξεις, «Στη θέση τους». */
  ok('⭐ Γ.5 · η λέξη «ανταλλαγή» ΔΕΝ γράφεται πουθενά στην πρόζα',
     !/ανταλλαγ/i.test(G5.paragraphs.join('\n')));
  ok('  …και η σελίδα το λέει ΡΗΤΑ αντί να το αφήσει να περάσει απαρατήρητο',
     JSON.stringify(G5.facts).includes('δεν υπάρχει πουθενά στην ενότητα'));
  /* ⭐ ΚΑΙ ΤΑ ΤΡΙΑ ΝΟΥΜΕΡΑ, ΑΥΤΟΥΣΙΑ ΚΑΙ ΞΕΧΩΡΙΣΤΑ — ΟΙ ΑΡΜΕΝΙΟΙ ΕΙΝΑΙ
     ΔΕΥΤΕΡΟ ΝΟΥΜΕΡΟ, ΟΧΙ ΜΕΡΟΣ ΤΟΥ ΠΡΩΤΟΥ. */
  ok('⭐ Γ.5 · τα τρία νούμερα είναι όλα αυτούσια στο κείμενο',
     ['1.230.000', '45.000', '610.000'].every(n => G5.paragraphs.join('\n').includes(n)));
  ok('  και οι Αρμένιοι έχουν δικό τους λήμμα, για να μη χαθούν',
     G5.glossary.some(g => g.m === 'Αρμένιοι') && G5.glossary.some(g => g.m === '45.000'));
}

/* ── Β.4 «Η εκμετάλλευση των ορυχείων» (als-v558) ────────────────────
   ⭐ Ο ΕΞΑΓΩΓΕΑΣ ΤΗΣ ΔΕΝ ΑΠΟΔΕΙΧΘΗΚΕ ΣΤΗ Β.4, ΑΠΟΔΕΙΧΘΗΚΕ ΣΤΙΣ ΕΝΝΕΑ
   ΠΑΛΙΕΣ (9/9 ταυτόσημες) — και η αναδρομή έπιασε ΔΥΟ δικά μου λάθη που
   η Β.4 δεν τα ακουμπάει καν: τη σβησμένη παύλα στο «Αμβρακικού-
   Παγασητικού» (Α.1) και το <sup>1</sup> που άφηνε πίσω «επίπεδα1.» (Β.1).
   Τα κρατάει γραμμένα το tests/istoria-voithima-b4.source.txt. */
['explain', 'diagram', 'timeline', 'glossary', 'facts', 'text', 'sources'].forEach(id => {
  const r = boot('#/k1-b4/' + id);
  is('Β.4 · η καρτέλα «' + id + '» ζωγραφίζει χωρίς σφάλμα', r.error || 'NONE', 'NONE');
});
const B4D = boot('#/k1-b4/diagram');
ok('⭐ Β.4 · το σχεδιάγραμμα ζωγραφίζει και τα ΠΕΝΤΕ στάδιά της',
   ['Η αιτία, και η διχοτόμηση που βγαίνει από αυτήν',
    'Το εμπόδιο δεν ήταν η γεωλογία — ήταν ο νόμος',
    'Το Λαύριο — και τα σκουπίδια που έγιναν κοίτασμα',
    'Ο κατάλογος που πέφτει σε εξετάσεις',
    'Το μόνο ποσοτικό στήριγμα: ο Πίνακας 3 του ίδιου βιβλίου']
     .every(x => (B4D.painted['panel-diagram'] || '').includes(x)));
ok('⭐ Β.4 · ο ΠΙΝΑΚΑΣ 3 μπαίνει ΟΛΟΚΛΗΡΟΣ, και με τα δύο ζεύγη στηλών',
   ['31%', '63%', '36%', '75%', '24%', '7%', '30%', '2%', '12%', '17%', '18%', '22%']
     .every(n => (B4D.painted['panel-diagram'] || '').includes(n)));
/* ⛔ ΔΥΟ ΑΠΟΚΛΙΣΕΙΣ ΤΟΥ ΠΙΝΑΚΑ, ΚΑΙ ΟΙ ΔΥΟ ΔΗΛΩΜΕΝΕΣ ΣΤΗ ΣΕΛΙΔΑ.
   Η «ΠΟΛΗ» είναι αντιγραφικό υπόλειμμα (το ίδιο βρήκε και η Β.1)· και οι
   τρεις γραμμές ΔΕΝ αθροίζουν σε 100%, άρα ο πίνακας ΔΕΝ είναι το σύνολο
   του εμπορίου. Ένας πίνακας που παρουσιάζεται σαν πλήρης ενώ δεν είναι,
   είναι ΛΑΘΟΣ ΝΟΥΜΕΡΟ στο γραπτό — όχι αισθητικό θέμα. */
ok('⭐ Β.4 · και οι ΔΥΟ αποκλίσεις του Πίνακα 3 δηλώνονται ΡΗΤΑ',
   (B4D.painted['panel-diagram'] || '').includes('ΠΟΛΗ')
   && (B4D.painted['panel-diagram'] || '').includes('ΔΕΝ αθροίζουν σε 100%')
   && ['87%', '99%', '67%', '84%'].every(n => (B4D.painted['panel-diagram'] || '').includes(n)));
ok('⭐ Β.4 · οι τρεις αναγνώσεις δηλώνονται ΔΙΚΕΣ ΜΟΥ, όχι του βιβλίου',
   (B4D.painted['panel-diagram'] || '').includes('ΔΙΚΕΣ ΜΟΥ ΠΡΑΞΕΙΣ')
   && (B4D.painted['panel-diagram'] || '').includes('Μη γράψεις καμία από τις τρεις σαν νούμερο του βιβλίου'));
/* ⭐⭐ Ο ΟΡΦΑΝΟΣ ΑΣΤΕΡΙΣΚΟΣ, ΔΕΥΤΕΡΗ ΦΟΡΑ ΣΤΗΝ ΙΔΙΑ ΣΕΛΙΔΑ (μετά τη Β.3).
   Τέσσερις αστερίσκοι σε ΟΛΟ το index1_3.html, κανένας με υποσημείωση.
   Ο δείκτης μένει· η σελίδα εξηγεί ΓΙΑΤΙ μένει. */
ok('⭐ Β.4 · ο ορφανός αστερίσκος εξηγείται μέσα στο σχεδιάγραμμα',
   (B4D.painted['panel-diagram'] || '').includes('θηραϊκή γη*')
   && (B4D.painted['panel-diagram'] || '').includes('η υποσημείωση δεν υπάρχει πουθενά'));
ok('⭐ Β.4 · ο τίτλος της μπαίνει στο hero', (B4D.painted.hero || '').includes('Η εκμετάλλευση των ορυχείων'));
const B4S = boot('#/k1-b4/sources');
ok('⭐ Β.4 · οι «Πηγές» φέρνουν την ΠΗΓΗ ΕΠΟΧΗΣ (Percy Martin, 1913)',
   (B4S.painted['panel-sources'] || '').includes('Percy Martin')
   && (B4S.painted['panel-sources'] || '').includes('12 ή 14 ώρες'));
ok('  και δηλώνει ΡΗΤΑ ότι ο Martin περιγράφει ΕΡΓΟΣΤΑΣΙΑ, όχι ορυχεία',
   (B4S.painted['panel-sources'] || '').includes('περιγράφει ΕΡΓΟΣΤΑΣΙΑ, όχι ορυχεία')
   && (B4S.painted['panel-sources'] || '').includes('Λαύριο, 1896'));
ok('  τον ΠΙΝΑΚΑ 3 ως δεύτερη πηγή, με τη γραμμή «Πρώτες ύλες»',
   (B4S.painted['panel-sources'] || '').includes('Πίνακας 3')
   && (B4S.painted['panel-sources'] || '').includes('17% (1860-1870) → 22% (1900-1910)'));
ok('  και τη ΔΙΑΦΩΝΙΑ: η Β.6 δίνει ημερομηνία λήξης στην πρώτη πρόταση',
   (B4S.painted['panel-sources'] || '').includes('τάσεις ανάπτυξης της βαριάς βιομηχανίας')
   && (B4S.painted['panel-sources'] || '').includes('«Τάσεις ανάπτυξης», όχι «βιομηχανοποίηση»'));

const B4 = CHAPTERS.find(c => c.id === 'k1-b4');
if (B4) {
  const f4 = B4.paragraphs.join('\n');
  /* ⭐⭐ ΕΝΑ ΤΥΠΟΓΡΑΦΙΚΟ, ΚΑΙ ΕΙΝΑΙ Ο ΙΔΙΟΣ ΟΡΦΑΝΟΣ ΑΣΤΕΡΙΣΚΟΣ ΤΗΣ Β.3 */
  is('⭐ Β.4 · ΕΝΑ τυπογραφικό: ο ορφανός αστερίσκος', B4.sic.length, 1);
  is('  και είναι η «θηραϊκή γη*»', B4.sic[0].m, 'θηραϊκή γη*');
  ok('  ⛔ δεύτερη φορά στην ΙΔΙΑ σελίδα — η Β.3 κρατάει τον δικό της',
     (CHAPTERS.find(c => c.id === 'k1-b3') || { sic: [] }).sic.some(x => x.m === 'επί της γης*'));
  /* ⚠️ ΓΙ' ΑΥΤΟ ΔΕΝ ΜΠΗΚΕ ΛΗΜΜΑ «θηραϊκή γη»: θα έπεφτε πάνω στο sic.
     Ίδια απόφαση με την «Πολυπλοκότητα» της Β.3. */
  ok('  ⚠️ και κανένα λήμμα δεν πατάει πάνω στον αστερίσκο',
     !B4.glossary.some(g => g.m.includes('θηραϊκή')));
  /* ⛔⛔ ΤΟ ΧΡΟΝΟΛΟΓΙΟ ΕΙΝΑΙ ΚΑΘΑΡΑ ΤΟΥ ΚΕΙΜΕΝΟΥ */
  is('⭐ Β.4 · τέσσερα book:true, ΟΛΑ της πρόζας',
     B4.timeline.events.filter(e => e.book).map(e => e.label).join(','), '1860,1866,1869,1870');
  ok('⛔ Β.4 · καμία χρονολογία του ΠΙΝΑΚΑ 3 δεν έγινε γεγονός (1900-1910)',
     !B4.timeline.events.some(e => e.book && /1900|1910/.test(String(e.label))));
  ok('⛔ Β.4 · καμία χρονολογία της ΠΗΓΗΣ Martin δεν έγινε γεγονός (1909 · 1913)',
     !B4.timeline.events.some(e => /\b(1909|1913)\b/.test(String(e.label))));
  /* ⚠️ «τέλη του 19ου αιώνα» ΕΙΝΑΙ φράση του βιβλίου αλλά ΔΕΝ είναι
     χρονολογία. Ένα y:1890 βαφτισμένο «του βιβλίου» θα περνούσε τον
     έλεγχο για ΛΑΘΟΣ ΛΟΓΟ — ίδιο δίλημμα με τη Γ.2. */
  ok('⭐ Β.4 · τα «τέλη του 19ου αιώνα» έμειναν ΠΛΑΙΣΙΟ, όχι «του βιβλίου»',
     B4.timeline.events.some(e => e.id === 'cend19' && !e.book && /χρονιά δεν γράφεται/.test(e.note)));
  /* ⭐⭐⭐ ΜΕΤΡΗΘΗΚΕ, ΔΕΝ ΕΚΤΙΜΗΘΗΚΕ: η ενότητα δεν δίνει ΚΑΝΕΝΑ νούμερο
     ποσότητας. Η πρώτη γραφή του fun fact έλεγε «τα μόνα ψηφία είναι
     τέσσερις χρονιές» — και ήταν ΨΕΥΔΗΣ: το «19ου αιώνα» είναι κι αυτό
     ψηφία, τρεις φορές. Ο ισχυρισμός κλειδώνεται εδώ με ΑΡΙΘΜΟ. */
  is('⭐⭐ Β.4 · ΕΠΤΑ ομάδες ψηφίων σε όλη την ενότητα, ούτε μία παραπάνω',
     (f4.match(/\d+/g) || []).join(','), '19,1860,1869,1866,1870,19,19');
  is('  τρεις από αυτές είναι το «19ου αιώνα», όχι νούμερα',
     (f4.match(/19ου αιώνα/g) || []).length, 3);
  ok('  ⛔ ούτε ένα ποσό: η λέξη «δραχμών» γράφεται ΧΩΡΙΣ αριθμό μπροστά',
     /πολλών εκατομμυρίων δραχμών/.test(f4) && !/\d[\d.,]*\s*(δραχμ|τόνο|στρέμ)/.test(f4));
  ok('  …και η σελίδα το λέει ΡΗΤΑ αντί να το αφήσει να περάσει απαρατήρητο',
     JSON.stringify(B4.facts).includes('ΕΠΤΑ ομάδες ψηφίων'));
  /* ⭐ Η ΠΑΥΛΑ ΤΗΣ «γαλλο-ιταλική» ΕΙΝΑΙ ΣΥΝΘΕΤΗΣ ΛΕΞΗΣ ΚΑΙ ΜΕΝΕΙ ΚΟΛΛΗΤΗ.
     Είναι το ίδιο σχήμα με το «Αμβρακικού-Παγασητικού» της Α.1, που
     ο τρίτος εξαγωγέας παρά λίγο να το σβήσει. */
  ok('⭐ Β.4 · οι παύλες των σύνθετων μένουν κολλητές, χωρίς κενό',
     f4.includes('γαλλο-ιταλική') && f4.includes('(Σερπιέρι-Ρου)')
     && !f4.includes('γαλλο- ιταλική') && !f4.includes('γαλλο ιταλική'));
  /* ⭐ ΤΟ ΣΟΥΕΖ ΜΕΤΡΑΕΙ ΔΥΟ ΦΟΡΕΣ — ΚΑΙ Η ΣΕΛΙΔΑ ΤΟ ΛΕΕΙ ΔΥΟ ΦΟΡΕΣ */
  ok('⭐ Β.4 · και οι ΔΥΟ μηχανισμοί του Σουέζ είναι χωριστές πράξεις',
     B4.explain.acts.some(a => a.quote === 'τα έργα για τη διάνοιξη της διώρυγας του Σουέζ')
     && B4.explain.acts.some(a => a.quote === 'αλλά και το ίδιο το άνοιγμα της διώρυγας'));
}

/* ── Β.5 «Η δημιουργία τραπεζικού συστήματος» (als-v559) ─────────────
   ⭐ Ο εξαγωγέας ξανατρέχτηκε ΑΝΑΔΡΟΜΙΚΑ στις ΔΕΚΑ έτοιμες ενότητες πριν
   αγγίξει τη Β.5: 10/10 ταυτόσημες. Λεπτομέρειες στο αρχείο γείωσης. */
['explain', 'diagram', 'timeline', 'glossary', 'facts', 'text', 'sources'].forEach(id => {
  const r = boot('#/k1-b5/' + id);
  is('Β.5 · η καρτέλα «' + id + '» ζωγραφίζει χωρίς σφάλμα', r.error || 'NONE', 'NONE');
});
const B5D = boot('#/k1-b5/diagram');
ok('⭐ Β.5 · το σχεδιάγραμμα ζωγραφίζει και τα ΠΕΝΤΕ στάδιά της',
   ['Τι ζήτησε το κράτος από την πρώτη μέρα',
    'Η αφετηρία: ένα κύκλωμα, όχι ένα σύστημα',
    '1841 · η Εθνική Τράπεζα — ποιοι την έφτιαξαν και από τι ζούσε',
    'Η εξάπλωση, η κυριαρχία — και τα ιδρύματα που ακολούθησαν',
    'Τα νούμερα που η ενότητα δεν δίνει: ο Πίνακας 6']
     .every(x => (B5D.painted['panel-diagram'] || '').includes(x)));
ok('⭐ Β.5 · ο ΠΙΝΑΚΑΣ 6 μπαίνει ΟΛΟΚΛΗΡΟΣ, και με τις δύο στήλες ποσών',
   ['120.000.000', '58.000.000', '100.000.000', '185.000.000', '176.000.000',
    '30.000.000', '125.000.000', '45.000.000', '123.000.000', '15.000.000',
    '20.000.000', '818.500.000'].every(n => (B5D.painted['panel-diagram'] || '').includes(n)));
/* ⛔⛔ ΤΡΙΤΗ ΦΟΡΑ ΠΟΥ ΕΝΑΣ ΠΙΝΑΚΑΣ ΤΟΥ ΒΙΒΛΙΟΥ ΕΧΕΙ ΔΟΜΙΚΗ ΑΠΟΚΛΙΣΗ
   (Β.1 «ΠΟΛΗ» · Β.4 δεν αθροίζει σε 100% · εδώ γραμμή με ένα κελί λιγότερο).
   Και στις τρεις: τα ΔΕΔΟΜΕΝΑ μένουν αυτούσια, η απόκλιση ΔΗΛΩΝΕΤΑΙ. */
ok('⭐ Β.5 · και οι ΔΥΟ αποκλίσεις του Πίνακα 6 δηλώνονται ΡΗΤΑ',
   (B5D.painted['panel-diagram'] || '').includes('τελευταία γραμμή έχει ΤΡΙΑ κελιά')
   && (B5D.painted['panel-diagram'] || '').includes('αθροίζουν 640.000.000'));
ok('⭐ Β.5 · οι τρεις αναγνώσεις δηλώνονται ΔΙΚΕΣ ΜΟΥ, όχι του βιβλίου',
   (B5D.painted['panel-diagram'] || '').includes('ΔΙΚΕΣ ΜΟΥ ΠΡΑΞΕΙΣ')
   && (B5D.painted['panel-diagram'] || '').includes('Μη γράψεις καμία από τις τρεις σαν νούμερο του βιβλίου'));
/* ⭐⭐ Η ΛΕΖΑΝΤΑ ΟΝΟΜΑΖΕΙ ΤΡΑΠΕΖΑ ΠΟΥ Η ΠΡΟΖΑ ΔΕΝ ΕΧΕΙ — ΜΕΤΡΗΘΗΚΕ. */
ok('⭐ Β.5 · η «Λαϊκή Τράπεζα» της λεζάντας δηλώνεται ως ΕΚΤΟΣ πρόζας',
   (B5D.painted['panel-diagram'] || '').includes('Λαϊκή Τράπεζα')
   && (B5D.painted['panel-diagram'] || '').includes('ΜΟΝΟ στη λεζάντα'));
ok('⭐ Β.5 · το τονικό τυπογραφικό εξηγείται μέσα στο σχεδιάγραμμα',
   (B5D.painted['panel-diagram'] || '').includes('η δυνατότητα της')
   && (B5D.painted['panel-diagram'] || '').includes('η δραστηριότητά της'));
ok('⭐ Β.5 · ο τίτλος της μπαίνει στο hero', (B5D.painted.hero || '').includes('Η δημιουργία τραπεζικού συστήματος'));
const B5S = boot('#/k1-b5/sources');
ok('⭐ Β.5 · οι «Πηγές» φέρνουν την ΠΗΓΗ ΕΠΟΧΗΣ (Μανσόλας, 1867)',
   (B5S.painted['panel-sources'] || '').includes('Μανσόλα')
   && (B5S.painted['panel-sources'] || '').includes('29.836')
   && (B5S.painted['panel-sources'] || '').includes('29 τον αριθμόν'));
ok('  και δηλώνει ΡΗΤΑ ότι ΔΕΝ μιλάει για τράπεζες',
   (B5S.painted['panel-sources'] || '').includes('ΔΕΝ μιλάει για τράπεζες'));
ok('  τον ΠΙΝΑΚΑ 6 ως δεύτερη πηγή, με το δάνειο που ξεπέρασε τα έσοδα',
   (B5S.painted['panel-sources'] || '').includes('Πίνακας 6')
   && (B5S.painted['panel-sources'] || '').includes('ΜΕΓΑΛΥΤΕΡΟ από τα δημόσια έσοδα'));
ok('  και τη ΔΙΑΦΩΝΙΑ: η κεντρική τράπεζα ήρθε ΕΝΑΝΤΙΑ στην Εθνική',
   (B5S.painted['panel-sources'] || '').includes('Παρά τις αντιδράσεις της Εθνικής Τράπεζας')
   && (B5S.painted['panel-sources'] || '').includes('ΟΧΙ κεντρική τράπεζα'));

const B5 = CHAPTERS.find(c => c.id === 'k1-b5');
if (B5) {
  const f5 = B5.paragraphs.join('\n');
  /* ⭐⭐⭐ ΤΕΤΑΡΤΟ ΣΥΝΕΧΟΜΕΝΟ ΤΟΝΙΚΟ ΛΑΘΟΣ ΤΟΥ ΤΜΗΜΑΤΟΣ Β — ΚΑΙ ΤΟ
     ΑΠΟΔΕΙΚΝΥΕΙ Η ΙΔΙΑ Η ΠΑΡΑΓΡΑΦΟΣ: δύο προτάσεις νωρίτερα το βιβλίο
     γράφει «δραστηριότητά της» ΣΩΣΤΑ. Σωστό και λάθος δίπλα-δίπλα.
     Το tools/istoria-unit.js ανέφερε «0 τυπογραφικά»: δεν ψάχνει τόνους. */
  is('⭐ Β.5 · ΕΝΑ τυπογραφικό: ο δεύτερος τόνος που λείπει', B5.sic.length, 1);
  is('  και είναι το «δυνατότητα της»', B5.sic[0].m, 'δυνατότητα της');
  ok('⭐⭐ Β.5 · η ΙΔΙΑ παράγραφος γράφει και τη ΣΩΣΤΗ μορφή «δραστηριότητά της»',
     B5.paragraphs[2].includes('δραστηριότητά της') && B5.paragraphs[2].includes('δυνατότητα της'));
  ok('  ⛔ τέταρτο συνεχόμενο τονικό του τμήματος Β — τα άλλα τρία ζουν ακόμη',
     ['k1-b1', 'k1-b2', 'k1-b3'].every(id => (CHAPTERS.find(c => c.id === id) || { sic: [] }).sic.length >= 1));
  ok('  ⚠️ και κανένα λήμμα δεν πατάει πάνω στο τυπογραφικό',
     !B5.glossary.some(g => g.m.includes('δυνατότητ')));
  /* ⛔⛔ ΤΟ ΧΡΟΝΟΛΟΓΙΟ ΕΙΝΑΙ ΚΑΘΑΡΑ ΤΟΥ ΚΕΙΜΕΝΟΥ */
  is('⭐ Β.5 · πέντε book:true, ΟΛΑ της πρόζας',
     B5.timeline.events.filter(e => e.book).map(e => e.label).join(','), '1839,1841,1845,1846,1860');
  ok('⛔ Β.5 · καμία χρονολογία του ΠΙΝΑΚΑ 6 δεν έγινε γεγονός (1880-1892)',
     !B5.timeline.events.some(e => /\b(1880|1883|1884|1887|1889|1890|1891|1892)\b/.test(String(e.label))));
  ok('⛔ Β.5 · καμία χρονολογία της ΠΗΓΗΣ Μανσόλα δεν έγινε γεγονός (1830 · 1859 · 1867)',
     !B5.timeline.events.some(e => /\b(1830|1859|1867)\b/.test(String(e.label))));
  /* ⭐⭐ ΕΝΑ ΚΑΙ ΜΟΝΟ ΝΟΥΜΕΡΟ ΠΟΣΟΤΗΤΑΣ — ΜΕΤΡΗΘΗΚΕ, ΔΕΝ ΕΚΤΙΜΗΘΗΚΕ.
     Η Β.4 δίδαξε ότι ένας τέτοιος ισχυρισμός πρέπει να κλειδώνεται με
     ΑΡΙΘΜΟ: εκεί η πρώτη γραφή ήταν μετρήσιμα ΨΕΥΔΗΣ. */
  is('⭐⭐ Β.5 · ΕΞΙ ομάδες ψηφίων σε όλη την ενότητα, ούτε μία παραπάνω',
     (f5.match(/\d+/g) || []).join(','), '1841,20,1845,1846,1860,1839');
  ok('  πέντε είναι χρονολογίες και ΜΙΑ είναι ποσότητα: το 20% του κράτους',
     f5.includes('(20% του αρχικού κεφαλαίου)') && !/\d[\d.,]*\s*(δραχμ|εκατομμυρ)/.test(f5));
  ok('  …και η σελίδα το λέει ΡΗΤΑ αντί να το αφήσει να περάσει απαρατήρητο',
     JSON.stringify(B5.facts).includes('ΕΞΙ ομάδες ψηφίων'));
  /* ⭐⭐⭐ Η ΚΑΡΔΙΑ ΤΗΣ ΕΝΟΤΗΤΑΣ: Η ΕΘΝΙΚΗ ΔΕΝ ΗΤΑΝ ΚΕΝΤΡΙΚΗ ΤΡΑΠΕΖΑ.
     Η πρώτη πρόταση ζητάει «κεντρική τράπεζα»· η λέξη ΔΕΝ ξαναγράφεται
     πουθενά στην ενότητα — μετρήθηκε. */
  ok('⭐⭐ Β.5 · η λέξη «κεντρικ» γράφεται ΜΟΝΟ στην πρώτη παράγραφο',
     /κεντρικής τράπεζας/.test(B5.paragraphs[0])
     && !B5.paragraphs.slice(1).some(p => /κεντρικ[ήής]ς? τράπεζ/.test(p)));
  ok('  και η σελίδα το κάνει ρητή ΕΝΝΟΙΑ, όχι υπονοούμενο',
     B5.explain.concepts.some(c => c.t.includes('Εθνική Τράπεζα ≠ κεντρική τράπεζα')));
  /* ⚠️ Η ΙΟΝΙΚΗ ΕΙΝΑΙ ΠΑΛΑΙΟΤΕΡΗ ΑΠΟ ΤΗΝ ΕΘΝΙΚΗ — ΕΤΟΙΜΗ ΠΑΓΙΔΑ */
  ok('⭐ Β.5 · η παγίδα της Ιονικής (1839 < 1841) έχει δική της παγίδα και λήμμα',
     B5.explain.pitfalls.some(p => p.ok.includes('ΔΥΟ ΧΡΟΝΙΑ ΠΡΙΝ την Εθνική'))
     && B5.glossary.some(g => g.m === 'Ιονική Τράπεζα'));
}

/* ── Β.6 «Η βιομηχανία» (als-v560) ───────────────────────────────────
   ⭐ Ο ΤΡΙΤΟΣ εξαγωγέας ξανατρέχτηκε ΑΝΑΔΡΟΜΙΚΑ πριν αγγίξει τη Β.6 και
   αναπαρήγαγε 9/9 τις ενότητες της οικογένειας «div.title» (Β.1-Β.5, Γ.2-Γ.5)
   χαρακτήρα προς χαρακτήρα. Και οι δύο παγίδες του εξαγωγέα βρέθηκαν ΕΚΕΙ,
   όχι εδώ — λεπτομέρειες στο αρχείο γείωσης. */
['explain', 'diagram', 'timeline', 'glossary', 'facts', 'text', 'sources'].forEach(id => {
  const r = boot('#/k1-b6/' + id);
  is('Β.6 · η καρτέλα «' + id + '» ζωγραφίζει χωρίς σφάλμα', r.error || 'NONE', 'NONE');
});
const B6D = boot('#/k1-b6/diagram');
ok('⭐ Β.6 · το σχεδιάγραμμα ζωγραφίζει και τα ΠΕΝΤΕ στάδιά της',
   ['Η πρώτη πρόταση είναι ΑΡΝΗΣΗ',
    'Οι πρώτες μονάδες: παράρτημα της γεωργίας',
    'Η μία και μοναδική απόπειρα — και πόσο κράτησε',
    'Το πρώτο πραγματικό δυναμικό — και οι πέντε ελλείψεις που έμειναν',
    'Ο Πίνακας 3 μετράει αυτό που η Β.6 αφήνει αμέτρητο']
     .every(x => (B6D.painted['panel-diagram'] || '').includes(x)));
ok('⭐ Β.6 · ο ΠΙΝΑΚΑΣ 3 μπαίνει ΟΛΟΚΛΗΡΟΣ, και με τις τέσσερις στήλες',
   ['31%', '63%', '36%', '75%', '24%', '7%', '30%', '2%', '12%', '17%', '18%', '22%']
     .every(n => (B6D.painted['panel-diagram'] || '').includes(n)));
/* ⛔⛔ ΤΕΤΑΡΤΗ ΦΟΡΑ ΠΟΥ ΕΝΑΣ ΠΙΝΑΚΑΣ ΤΟΥ ΒΙΒΛΙΟΥ ΕΧΕΙ ΔΟΜΙΚΗ ΑΠΟΚΛΙΣΗ
   (Β.1 «ΠΟΛΗ» · Β.4 δεν αθροίζει σε 100% · Β.5 γραμμή με ένα κελί λιγότερο).
   Και στις τέσσερις: τα ΔΕΔΟΜΕΝΑ μένουν αυτούσια, η απόκλιση ΔΗΛΩΝΕΤΑΙ. */
ok('⭐ Β.6 · και οι ΔΥΟ αποκλίσεις του Πίνακα 3 δηλώνονται ΡΗΤΑ',
   (B6D.painted['panel-diagram'] || '').includes('επικεφαλίδας γράφει «ΠΟΛΗ»')
   && (B6D.painted['panel-diagram'] || '').includes('Καμία στήλη δεν αθροίζει 100%'));
ok('⭐ Β.6 · οι τρεις αναγνώσεις δηλώνονται ΔΙΚΕΣ ΜΟΥ, όχι του βιβλίου',
   (B6D.painted['panel-diagram'] || '').includes('ΔΙΚΕΣ ΜΟΥ ΠΡΑΞΕΙΣ')
   && (B6D.painted['panel-diagram'] || '').includes('Μη γράψεις καμία από τις τρεις σαν νούμερο του βιβλίου'));
ok('⭐ Β.6 · οι ΔΥΟ τετράδες κλάδων μπαίνουν και οι δύο ολόκληρες',
   ['Αλευρόμυλοι', 'Ελαιοτριβεία', 'Βυρσοδεψεία', 'Κλωστήρια',
    'Βαριά βιομηχανία', 'Μεταλλουργία', 'Ναυπηγική', 'Τσιμεντοβιομηχανία']
     .every(x => (B6D.painted['panel-diagram'] || '').includes(x)));
ok('⭐ Β.6 · οι ΠΕΝΤΕ ελλείψεις της 4ης παραγράφου ζωγραφίζονται χωριστά',
   ['Κεφάλαια', 'Βάση εξάπλωσης', 'Πρώτες ύλες', 'Εργατικά χέρια', 'Παιδεία']
     .every(x => (B6D.painted['panel-diagram'] || '').includes(x)));
ok('⭐ Β.6 · ο τίτλος της μπαίνει στο hero', (B6D.painted.hero || '').includes('Η βιομηχανία'));
const B6S = boot('#/k1-b6/sources');
ok('⭐ Β.6 · οι «Πηγές» φέρνουν την ΠΗΓΗ ΕΠΟΧΗΣ (Percy Martin, 1913)',
   (B6S.painted['panel-sources'] || '').includes('Percy Martin')
   && (B6S.painted['panel-sources'] || '').includes('Ελάχιστα καινούρια εργοστάσια υπάρχουν')
   && (B6S.painted['panel-sources'] || '').includes('σ. 176-177'));
ok('  και δηλώνει ΡΗΤΑ ότι ΔΕΝ είναι αντίφαση του βιβλίου',
   (B6S.painted['panel-sources'] || '').includes('ΔΕΝ είναι αντίφαση του βιβλίου'));
ok('  τον ΠΙΝΑΚΑ 3 ως δεύτερη πηγή, με την πτώση των εξαγωγών',
   (B6S.painted['panel-sources'] || '').includes('Πίνακας 3')
   && (B6S.painted['panel-sources'] || '').includes('7% → 2%'));
ok('  και την ΤΡΙΠΛΗ διασταύρωση Β.4 · Β.8 · Γ.2',
   ['Η απουσία βαριάς βιομηχανίας', 'Στην Ελλάδα δεν υπήρχε ούτε το ένα, ούτε το άλλο',
    'Η απουσία μεγάλων σύγχρονων βιομηχανικών μονάδων']
     .every(x => (B6S.painted['panel-sources'] || '').includes(x)));

const B6 = CHAPTERS.find(c => c.id === 'k1-b6');
if (B6) {
  const f6 = B6.paragraphs.join('\n');
  /* ⛔ ΤΟ ΤΥΠΟΓΡΑΦΙΚΟ ΕΙΝΑΙ ΠΑΡΕΝΘΕΤΙΚΗ ΠΑΥΛΑ, ΟΠΩΣ ΣΤΗ Β.2 ΚΑΙ ΤΗ Γ.2 */
  is('⭐ Β.6 · ΕΝΑ τυπογραφικό: οι παρενθετικές παύλες', B6.sic.length, 1);
  ok('  και το κείμενο τις κρατάει ΑΥΤΟΥΣΙΕΣ',
     f6.includes('ασφυκτικά περιορισμένη -εδαφικά και πληθυσμιακά- βάση'));
  ok('  ⛔ ούτε ενωμένες («πληθυσμιακά-βάση») ούτε «διορθωμένες»',
     !f6.includes('πληθυσμιακά-βάση') && !f6.includes('πληθυσμιακά— βάση'));
  /* ⚠️⚠️ ΤΟ ΠΙΟ ΣΗΜΑΝΤΙΚΟ ΕΥΡΗΜΑ ΕΙΝΑΙ ΑΡΝΗΤΙΚΟ: ΤΟ ΤΟΝΙΚΟ ΣΕΡΙ ΤΩΝ Β.1,
     Β.2, Β.3, Β.5 ΔΕΝ ΣΥΝΕΧΙΖΕΤΑΙ ΕΔΩ. Μια σειρά που δεν συνεχίζεται δεν
     ανακοινώνεται σαν να συνεχίζεται — και κλειδώνεται ΘΕΤΙΚΑ. */
  ok('⭐⭐ Β.6 · το μόνο πραγματικό εγκλιτικό ΕΧΕΙ τον δεύτερο τόνο του',
     f6.includes('την ανάδειξή της') && !f6.includes('την ανάδειξη της'));
  ok('  ⛔ και κανένα λήμμα δεν πατάει πάνω στη φράση του sic',
     !B6.glossary.some(g => /ασφυκτικ|εδαφικ|πληθυσμιακ/.test(g.m) || g.m === 'βάση'));
  /* ⛔⛔ ΤΟ ΧΡΟΝΟΛΟΓΙΟ ΕΙΝΑΙ ΚΑΘΑΡΑ ΤΟΥ ΚΕΙΜΕΝΟΥ */
  is('⭐ Β.6 · επτά book:true, ΟΛΑ της πρόζας',
     B6.timeline.events.filter(e => e.book).map(e => e.label).join(','),
     'πρώτες δεκαετίες,1864,1870,1881,χρόνια 19ου αιώνα,πρώτα χρόνια 20ού,1912-1913');
  ok('⛔ Β.6 · καμία χρονολογία του ΠΙΝΑΚΑ 3 δεν έγινε γεγονός (1860-1870 · 1900-1910)',
     !B6.timeline.events.some(e => /\b(1860|1870|1900|1910)\b/.test(String(e.label)) && e.book && e.label !== '1870'));
  ok('⛔ Β.6 · καμία χρονολογία της ΠΗΓΗΣ Percy Martin δεν έγινε γεγονός του βιβλίου',
     /* ⚠️ Η πρώτη γραφή έψαχνε «1913» ΟΠΟΥΔΗΠΟΤΕ στην ετικέτα και έσκαγε
        πάνω στο «1912-1913» — που ΓΡΑΦΕΤΑΙ στο βιβλίο. Ο έλεγχος είναι
        ΤΑΥΤΟΤΗΤΑ ετικέτας, όχι υποσυμβολοσειρά: σταθ. 42, ξανά. */
     !B6.timeline.events.some(e => e.book && ['1909', '1913'].includes(String(e.label))));
  ok('  …και όσα «Πλαίσιο» φέρνουν χρονολογία άλλης ενότητας το ΔΗΛΩΝΟΥΝ',
     B6.timeline.events.filter(e => !e.book).every(e => !!e.note));
  /* ⭐⭐ ΜΕΤΡΗΘΗΚΕ, ΔΕΝ ΕΚΤΙΜΗΘΗΚΕ. Η Β.4 δίδαξε ότι ένας τέτοιος
     ισχυρισμός πρέπει να κλειδώνεται με ΑΡΙΘΜΟ. */
  is('⭐⭐ Β.6 · ΟΚΤΩ ομάδες ψηφίων σε όλη την ενότητα, ούτε μία παραπάνω',
     (f6.match(/\d+/g) || []).join(','), '19,1870,19,20,1864,1881,1912,1913');
  ok('  …και ΚΑΜΙΑ τους δεν είναι ποσότητα: οι δύο ποσότητες είναι με ΓΡΑΜΜΑΤΑ',
     f6.includes('σαράντα περίπου χρόνια') && f6.includes('περισσότερων από εκατό')
     && !/\d[\d.,]*\s*(%|δραχμ|εκατομμυρ|χιλιάδ)/.test(f6));
  ok('  …και η σελίδα το λέει ΡΗΤΑ αντί να το αφήσει να περάσει απαρατήρητο',
     JSON.stringify(B6.facts).includes('Οκτώ ομάδες ψηφίων'));
  /* ⭐⭐⭐ Η ΜΟΝΗ ΕΝΟΤΗΤΑ ΧΩΡΙΣ ΟΝΟΜΑ ΠΡΟΣΩΠΟΥ — ΜΕΤΡΗΘΗΚΕ ΑΠΕΝΑΝΤΙ ΣΤΙΣ
     ΑΛΛΕΣ ΤΟΥ ΤΜΗΜΑΤΟΣ Β, ΟΧΙ ΔΗΛΩΘΗΚΕ. */
  ok('⭐⭐ Β.6 · καμία από τις προσωπικότητες του τμήματος Β δεν εμφανίζεται',
     ['Σερπιέρι', 'Εϋνάρδος', 'Σταύρου', 'Σκουζές', 'Ράλλης', 'Τρικούπη']
       .every(n => !f6.includes(n)));
  ok('  ⚠️ …ενώ ΟΛΕΣ οι γειτονικές ενότητες ονομάζουν τουλάχιστον μία',
     ['k1-b4', 'k1-b5'].every(id => {
       const c = CHAPTERS.find(x => x.id === id) || { paragraphs: [] };
       return /Σερπιέρι|Εϋνάρδος|Σταύρου/.test(c.paragraphs.join(' '));
     }));
  /* ⭐⭐ ΟΙ ΔΥΟ ΤΕΤΡΑΔΕΣ ΚΛΑΔΩΝ ΕΙΝΑΙ Η ΚΑΡΔΙΑ ΤΗΣ ΕΝΟΤΗΤΑΣ */
  ok('⭐ Β.6 · και οι οκτώ κλάδοι υπάρχουν ΑΥΤΟΥΣΙΟΙ στο κείμενο',
     ['αλευρομύλων', 'ελαιοτριβείων', 'βυρσοδεψείων', 'κλωστηρίων',
      'βαριάς βιομηχανίας', 'μεταλλουργίας', 'ναυπηγικής', 'τσιμεντοβιομηχανίας']
       .every(x => f6.includes(x)));
  ok('  και ο καθένας τους έχει δικό του λήμμα στο λεξικό',
     ['αλευρομύλων', 'ελαιοτριβείων', 'βυρσοδεψείων', 'κλωστηρίων',
      'βαριάς βιομηχανίας', 'μεταλλουργίας', 'ναυπηγικής', 'τσιμεντοβιομηχανίας']
       .every(m => B6.glossary.some(g => g.m === m)));
  /* ⭐ Η ΠΙΟ ΣΥΧΝΗ ΠΑΓΙΔΕΣ ΤΗΣ ΕΝΟΤΗΤΑΣ ΕΧΟΥΝ ΔΙΚΗ ΤΟΥΣ ΕΓΓΡΑΦΗ */
  ok('⭐ Β.6 · η παγίδα «1870 = βιομηχανοποίηση» απαντιέται ΡΗΤΑ',
     B6.explain.pitfalls.some(p => p.ok.includes('ΕΠΕΣΤΡΕΨΑΝ ΣΤΗΝ ΥΦΕΣΗ ΚΑΙ ΤΗ ΣΤΑΣΙΜΟΤΗΤΑ')));
  ok('⭐ Β.6 · και η παγίδα «μετά το 1912-13 έγινε κινητήρια δύναμη»',
     B6.explain.pitfalls.some(p => p.ok.includes('ΣΥΝΕΧΙΣΑΝ ΝΑ ΕΜΠΟΔΙΖΟΥΝ')));
  ok('⭐⭐ Β.6 · η ταύτιση «πίεση των εισαγόμενων» ≡ «εξωτερικός ανταγωνισμός» είναι ρητή ΕΝΝΟΙΑ',
     B6.explain.concepts.some(c => c.b.includes('το πρόβλημα δεν άλλαξε ποτέ, μόνο το όνομά του')));
}

/* ── Β.7 «Τα δημόσια έργα» (als-v561) ────────────────────────────────
   ⛔⛔⛔ ΕΔΩ ΟΙ ΕΞΑΓΩΓΕΙΣ ΔΙΑΦΩΝΗΣΑΝ, ΚΑΙ ΤΟ ΛΑΘΟΣ ΗΤΑΝ ΔΙΚΟ ΜΟΥ: το βιβλίο
   έχει ΔΥΟ ΑΚΛΕΙΣΤΑ <p> και το «<p>(.*?)</p>» συγχώνευε ΤΡΕΙΣ παραγράφους σε
   μία — 3 αντί για 5, σιωπηλά. Ο εξαγωγέας διορθώθηκε (κανόνας browser) και
   ξανατρέχτηκε ΑΝΑΔΡΟΜΙΚΑ: 10/10 έτοιμες ενότητες ταυτόσημες. Λεπτομέρειες
   στο αρχείο γείωσης. */
['explain', 'diagram', 'timeline', 'glossary', 'facts', 'text', 'sources'].forEach(id => {
  const r = boot('#/k1-b7/' + id);
  is('Β.7 · η καρτέλα «' + id + '» ζωγραφίζει χωρίς σφάλμα', r.error || 'NONE', 'NONE');
});
const B7D = boot('#/k1-b7/diagram');
ok('⭐ Β.7 · το σχεδιάγραμμα ζωγραφίζει και τα ΠΕΝΤΕ στάδιά της',
   ['Η αφετηρία έχει χρονολογία και μία λέξη',
    'Γιατί δεν ήρθαν οι ιδιώτες — και με τι πλήρωσε το κράτος',
    'Η στροφή: το οδικό δίκτυο γίνεται προτεραιότητα',
    'Το «κυριότερο» άλλο έργο: οι αποξηράνσεις',
    'Η διώρυγα της Κορίνθου — και τα νούμερα που η ενότητα δεν δίνει']
     .every(x => (B7D.painted['panel-diagram'] || '').includes(x)));
ok('⭐ Β.7 · και οι ΠΕΝΤΕ υποδομές της 1ης παραγράφου ζωγραφίζονται χωριστά',
   ['Γέφυρες', 'Αμαξιτοί δρόμοι', 'Λιμάνια', 'Υδραγωγεία', 'Δημόσια κτίρια']
     .every(x => (B7D.painted['panel-diagram'] || '').includes(x)));
ok('⭐ Β.7 · οι ΤΕΣΣΕΡΙΣ προωθητικοί και οι ΔΥΟ ανασταλτικοί, όλοι',
   ['Η οικονομική ανάπτυξη', 'ρυθμοί αστικοποίησης', 'κεντρικών σιδηροδρομικών αξόνων',
    'ανάπτυξη του εσωτερικού εμπορίου', 'ορεινά εδάφη', 'θαλάσσιων συγκοινωνιών']
     .every(x => (B7D.painted['panel-diagram'] || '').includes(x)));
ok('⭐ Β.7 · οι ΤΡΕΙΣ γραμμές του Πίνακα 6 που ονομάζουν τα έργα',
   ['45.000.000', '15.000.000', '20.000.000', '123.000.000', 'Σιδηροδρόμων', 'Εθνικών δρόμων']
     .every(n => (B7D.painted['panel-diagram'] || '').includes(n)));
ok('⭐ Β.7 · οι τρεις αναγνώσεις δηλώνονται ΔΙΚΕΣ ΜΟΥ, όχι του βιβλίου',
   (B7D.painted['panel-diagram'] || '').includes('ΔΙΚΕΣ ΜΟΥ ΠΡΑΞΕΙΣ')
   && (B7D.painted['panel-diagram'] || '').includes('Μη γράψεις καμία από τις τρεις σαν νούμερο του βιβλίου'));
ok('⭐⭐ Β.7 · το τονικό εξηγείται μέσα στο σχεδιάγραμμα, ΜΕ το αντιπαράδειγμα της Β.5',
   (B7D.painted['panel-diagram'] || '').includes('η δραστηριότητα του')
   && (B7D.painted['panel-diagram'] || '').includes('δραστηριότητά της'));
ok('⭐ Β.7 · ο τίτλος της μπαίνει στο hero', (B7D.painted.hero || '').includes('Τα δημόσια έργα'));
const B7S = boot('#/k1-b7/sources');
ok('⭐ Β.7 · οι «Πηγές» φέρνουν την ΠΗΓΗ ΕΠΟΧΗΣ (Μανσόλας, 1867) με ΑΛΛΗ ανάγνωση από τη Β.5',
   (B7S.painted['panel-sources'] || '').includes('Μανσόλα')
   && (B7S.painted['panel-sources'] || '').includes('29 τον αριθμόν')
   && (B7S.painted['panel-sources'] || '').includes('ΠΑΡΑΚΕΙΜΕΝΩΝ'));
ok('  και δηλώνει ΡΗΤΑ ότι ο Μανσόλας ΔΕΝ μιλάει για δρόμους',
   (B7S.painted['panel-sources'] || '').includes('ΔΕΝ μιλάει για δρόμους'));
ok('  τον ΠΙΝΑΚΑ 6 ως δεύτερη πηγή, με τα δάνεια που ονομάζουν τα έργα',
   (B7S.painted['panel-sources'] || '').includes('Πίνακας 6')
   && (B7S.painted['panel-sources'] || '').includes('Εθνικών δρόμων'));
ok('  και την ΤΡΙΠΛΗ διασταύρωση Β.8 · Γ.2 · Β.10',
   ['περίπου 30%', 'εργάστηκαν πολλοί Ιταλοί', 'αδυναμία να εξυπηρετήσει τα τοκοχρεολύσια']
     .every(x => (B7S.painted['panel-sources'] || '').includes(x)));

const B7 = CHAPTERS.find(c => c.id === 'k1-b7');
if (B7) {
  const f7 = B7.paragraphs.join('\n');
  /* ⭐⭐⭐ ΤΟ ΤΥΠΟΓΡΑΦΙΚΟ, ΚΑΙ ΤΟ ΑΝΤΙΠΑΡΑΔΕΙΓΜΑ ΖΕΙ ΣΤΗ Β.5 */
  is('⭐ Β.7 · ΕΝΑ τυπογραφικό: ο δεύτερος τόνος που λείπει', B7.sic.length, 1);
  is('  και είναι το «Η δραστηριότητα του ήταν»', B7.sic[0].m, 'Η δραστηριότητα του ήταν');
  ok('⭐⭐⭐ Β.7 · η Β.5 γράφει την ΙΔΙΑ λέξη ΣΩΣΤΑ — το βιβλίο ξέρει τον τύπο και τον χάνει',
     (CHAPTERS.find(c => c.id === 'k1-b5') || { paragraphs: [] }).paragraphs.join('\n').includes('δραστηριότητά της')
     && f7.includes('δραστηριότητα του') && !f7.includes('δραστηριότητά του'));
  ok('  ⭐ πέμπτο τονικό του τμήματος Β, αλλά ΟΧΙ πέμπτο συνεχόμενο: η Β.4 και η Β.6 δεν έχουν κανένα',
     ['k1-b1', 'k1-b2', 'k1-b3', 'k1-b5'].every(id => (CHAPTERS.find(c => c.id === id) || { sic: [] }).sic.length >= 1)
     && (CHAPTERS.find(c => c.id === 'k1-b4') || {}).sic.every(s => !/τονο|τόνος/.test(s.fix))
     && (CHAPTERS.find(c => c.id === 'k1-b6') || {}).sic.every(s => !/τόνος/.test(s.fix)));
  ok('  ⚠️ και κανένα λήμμα δεν πατάει πάνω στο τυπογραφικό',
     !B7.glossary.some(g => g.m.includes('δραστηριότητ')));
  /* ⛔⛔ ΤΟ ΧΡΟΝΟΛΟΓΙΟ ΕΙΝΑΙ ΚΑΘΑΡΑ ΤΟΥ ΚΕΙΜΕΝΟΥ */
  is('⭐ Β.7 · επτά book:true, ΟΛΑ της πρόζας',
     B7.timeline.events.filter(e => e.book).map(e => e.label).join(','),
     '1830,1870,1881,1893,τέλος 19ου,αρχές 20ού,μέσα 20ού');
  ok('⛔ Β.7 · καμία χρονολογία του ΠΙΝΑΚΑ 6 δεν έγινε γεγονός του βιβλίου (1880-1892)',
     !B7.timeline.events.some(e => e.book && /\b(1880|1883|1884|1887|1889|1890|1891|1892)\b/.test(String(e.label))));
  ok('⛔ Β.7 · ούτε του Μανσόλα (1859 · 1867) — και το 1830 είναι της ΠΡΩΤΗΣ ΛΕΞΗΣ της ενότητας',
     !B7.timeline.events.some(e => /\b(1859|1867)\b/.test(String(e.label)))
     && B7.paragraphs[0].startsWith('Το 1830,'));
  ok('  …και όσα «Πλαίσιο» φέρνουν χρονολογία άλλης ενότητας το ΔΗΛΩΝΟΥΝ',
     B7.timeline.events.filter(e => !e.book).every(e => !!e.note));
  /* ⭐⭐ ΜΕΤΡΗΘΗΚΕ, ΔΕΝ ΕΚΤΙΜΗΘΗΚΕ */
  is('⭐⭐ Β.7 · ΕΠΤΑ ομάδες ψηφίων σε όλη την ενότητα, ούτε μία παραπάνω',
     (f7.match(/\d+/g) || []).join(','), '1830,1870,19,20,20,1881,1893');
  ok('  …και ΚΑΜΙΑ τους δεν είναι ποσότητα: ούτε δραχμή, ούτε χιλιόμετρο',
     !/\d[\d.,]*\s*(%|δραχμ|εκατομμυρ|χιλιόμ|χλμ|στρέμ)/.test(f7));
  ok('  …και η σελίδα το λέει ΡΗΤΑ αντί να το αφήσει να περάσει απαρατήρητο',
     JSON.stringify(B7.facts).includes('Επτά ομάδες ψηφίων')
     && JSON.stringify(B7.facts).includes('ούτε ένα χιλιόμετρο δρόμου'));
  /* ⭐⭐ ΔΕΥΤΕΡΗ ΣΥΝΕΧΟΜΕΝΗ ΕΝΟΤΗΤΑ ΧΩΡΙΣ ΟΝΟΜΑ — ΚΑΙ ΟΥΤΕ ΕΤΑΙΡΕΙΑ */
  ok('⭐⭐ Β.7 · κανένα όνομα προσώπου, ούτε καν το πιο προφανές («Τρικούπης»)',
     ['Τρικούπ', 'Σερπιέρι', 'Εϋνάρδος', 'Σταύρου', 'Ράλλης'].every(n => !f7.includes(n)));
  ok('  ⚠️ …και ούτε η εταιρεία της διώρυγας δεν ονομάζεται',
     f7.includes('μια υπερβολικά αισιόδοξη γαλλική τεχνική εταιρεία'));
  ok('  ⭐ ενώ η Β.8, δίπλα της, ονομάζει τον Χαρίλαο Τρικούπη — άρα η σιωπή είναι ΕΠΙΛΟΓΗ',
     JSON.stringify(B7.sources).includes('Β.8') && !f7.includes('Χαρίλαο'));
  /* ⭐⭐⭐ Η ΣΥΜΠΤΩΣΗ ΠΟΥ ΚΡΑΤΑΕΙ ΟΛΗ ΤΗΝ ΕΝΟΤΗΤΑ: 1893 ΔΥΟ ΦΟΡΕΣ */
  ok('⭐⭐ Β.7 · το 1893 της διώρυγας ΚΑΙ το 1893 της πτώχευσης, χωριστά γεγονότα',
     B7.timeline.events.filter(e => String(e.label) === '1893').length === 2
     && B7.timeline.events.some(e => String(e.label) === '1893' && e.book)
     && B7.timeline.events.some(e => String(e.label) === '1893' && !e.book && /Β\.10/.test(e.note + e.text)));
  /* ⭐ ΟΙ ΠΙΟ ΣΥΧΝΕΣ ΠΑΓΙΔΕΣ ΕΧΟΥΝ ΔΙΚΗ ΤΟΥΣ ΕΓΓΡΑΦΗ */
  ok('⭐ Β.7 · η παγίδα «οι ιδιώτες απέτυχαν» απαντιέται ΡΗΤΑ',
     B7.explain.pitfalls.some(p => p.ok.includes('ΔΕΝ ΗΡΘΑΝ')));
  ok('⭐ Β.7 · και η παγίδα «η θάλασσα βοήθησε τους δρόμους»',
     B7.explain.pitfalls.some(p => p.no.includes('θαλάσσιες συγκοινωνίες βοήθησαν')));
  ok('⭐⭐ Β.7 · η αγγαρεία γίνεται ρητή ΕΝΝΟΙΑ, όχι υποσημείωση',
     B7.explain.concepts.some(c => c.t.includes('αγγαρεία') || c.t.includes('Η αγγαρεία')));
}

/* ── Β.8 «Το δίκτυο των σιδηροδρόμων» (als-v562) ──────────────────────
   ⛔⛔⛔ ΚΑΙ ΕΔΩ ΟΙ ΕΞΑΓΩΓΕΙΣ ΔΙΑΦΩΝΗΣΑΝ — 5 ΕΝΑΝΤΙ 6 — ΚΑΙ ΤΟ ΛΑΘΟΣ ΗΤΑΝ
   ΠΑΛΙ ΔΙΚΟ ΜΟΥ, ΔΥΟ ΦΟΡΕΣ: (α) όταν μια παράγραφος τερματίζεται από το
   ΕΠΟΜΕΝΟ <p>, ο δείκτης πρέπει να πάει στην ΑΡΧΗ του, όχι μετά — αλλιώς
   χάνεται σιωπηλά ολόκληρη η επόμενη παράγραφος (εδώ η 2η)· (β) το «σβήσε
   κάθε <table> χωρίς container» τρώει ΠΙΝΑΚΕΣ ΔΙΑΤΑΞΗΣ που έχουν μέσα
   τους αληθινή πρόζα (Β.1, Β.11) — τα δεδομένα έχουν ΟΛΑ border="1".
   Ο εξαγωγέας διορθώθηκε και ξανατρέχτηκε ΑΝΑΔΡΟΜΙΚΑ: 11/11 ταυτόσημες.
   Λεπτομέρειες στο αρχείο γείωσης. */
['explain', 'diagram', 'timeline', 'glossary', 'facts', 'text', 'sources'].forEach(id => {
  const r = boot('#/k1-b8/' + id);
  is('Β.8 · η καρτέλα «' + id + '» ζωγραφίζει χωρίς σφάλμα', r.error || 'NONE', 'NONE');
});
const B8D = boot('#/k1-b8/diagram');
ok('⭐ Β.8 · το σχεδιάγραμμα ζωγραφίζει και τα ΠΕΝΤΕ στάδιά της',
   ['Τι είναι ο σιδηρόδρομος ΕΞΩ από την Ελλάδα',
    'Γιατί η Ελλάδα τον ήθελε — και γιατί δεν τον έκανε',
    'Μισός αιώνας αναμονή: ΜΙΑ γραμμή, εννιά χιλιόμετρα',
    'Η στροφή και η «μεγάλη ώθηση»',
    'Τι βγήκε: μετρικό, κρατικό, ζημιογόνο — και ο απολογισμός']
     .every(x => (B8D.painted['panel-diagram'] || '').includes(x)));
ok('⭐ Β.8 · και τα ΤΡΙΑ στάδια της 1ης παραγράφου ζωγραφίζονται χωριστά',
   ['Εμφάνιση', 'Εξάπλωση', 'Κυριαρχία']
     .every(x => (B8D.painted['panel-diagram'] || '').includes(x)));
ok('⭐⭐ Β.8 · ο ΟΡΙΣΜΟΣ του «αποδοτικού» ζωγραφίζεται ΜΕ ΤΟΥΣ ΔΥΟ όρους του',
   ['μεταφορά πρώτων υλών, ζωτικών για τη βιομηχανία',
    'καταναλωτικών αγαθών, που οι τοπικές αγορές θα ήταν σε θέση να απορροφήσουν',
    'Στην Ελλάδα δεν υπήρχε ούτε το ένα, ούτε το άλλο']
     .every(x => (B8D.painted['panel-diagram'] || '').includes(x)));
ok('⭐ Β.8 · η σύγκριση 9 ↔ 900 χιλιομέτρων είναι ΣΤΗ ΣΕΛΙΔΑ, όχι μόνο σε σχόλιο',
   (B8D.painted['panel-diagram'] || '').includes('χλμ. σε δώδεκα χρόνια')
   && (B8D.painted['panel-diagram'] || '').includes('χλμ. σε δέκα χρόνια')
   && (B8D.painted['panel-diagram'] || '').includes('Εκατονταπλάσιο μήκος στον μισό χρόνο'));
ok('⭐⭐ Β.8 · και δηλώνεται ΡΗΤΑ ότι η διαίρεση είναι ΔΙΚΗ ΜΟΥ πράξη',
   (B8D.painted['panel-diagram'] || '').includes('ΔΙΚΗ σου πράξη'));
ok('⭐ Β.8 · οι ΔΥΟ γραμμές του Πίνακα 6 που ονομάζουν το έργο',
   ['45.000.000', '15.000.000', '123.000.000', '818.500.000', 'Σιδηροδρόμων']
     .every(n => (B8D.painted['panel-diagram'] || '').includes(n)));
ok('  …και η ΠΑΓΙΔΑ του πίνακα δηλώνεται: σταματά το 1892, το δίκτυο τελείωσε το 1909',
   (B8D.painted['panel-diagram'] || '').includes('ΔΕΝ δείχνει το συνολικό κόστος του έργου'));
ok('⭐⭐ Β.8 · το τονικό εξηγείται μέσα στο σχεδιάγραμμα, ΜΕ το αντιπαράδειγμα της ΙΔΙΑΣ ενότητας',
   (B8D.painted['panel-diagram'] || '').includes('είσοδο τους')
   && (B8D.painted['panel-diagram'] || '').includes('έσοδά του'));
ok('⭐ Β.8 · ο τίτλος της μπαίνει στο hero', (B8D.painted.hero || '').includes('Το δίκτυο των σιδηροδρόμων'));
const B8S = boot('#/k1-b8/sources');
ok('⭐ Β.8 · οι «Πηγές» φέρνουν την ΠΗΓΗ ΕΠΟΧΗΣ (Μανσόλας, 1867) από ΑΛΛΕΣ σελίδες από τη Β.5/Β.7',
   (B8S.painted['panel-sources'] || '').includes('Μανσόλα')
   && (B8S.painted['panel-sources'] || '').includes('σ. 43-44')
   && (B8S.painted['panel-sources'] || '').includes('προβληματικήν την αλήθειαν των διδομένων'));
ok('  και δηλώνει ΡΗΤΑ ότι ο Μανσόλας ΔΕΝ μιλάει για σιδηροδρόμους',
   (B8S.painted['panel-sources'] || '').includes('ΔΕΝ μιλάει πουθενά για σιδηροδρόμους'));
ok('  …και ότι είναι ΑΛΛΕΣ σελίδες από εκείνες της Β.5 και της Β.7',
   (B8S.painted['panel-sources'] || '').includes('ΑΛΛΕΣ ΣΕΛΙΔΕΣ'));
ok('  τον ΠΙΝΑΚΑ 6 ως δεύτερη πηγή, με τις δύο γραμμές «Σιδηροδρόμων»',
   (B8S.painted['panel-sources'] || '').includes('Πίνακας 6')
   && (B8S.painted['panel-sources'] || '').includes('45.000.000')
   && (B8S.painted['panel-sources'] || '').includes('15.000.000'));
ok('  ⭐⭐ και τη ΔΙΑΦΩΝΙΑ ΜΕΣΑ ΣΤΟ ΙΔΙΟ ΒΙΒΛΙΟ (κεφ. 2, Γ.1 + Γ.3)',
   ['του συγκοινωνιακού δικτύου της χώρας', 'εξάντληση των φορολογουμένων',
    'Το 1893 το κράτος κήρυξε πτώχευση', 'δεν πραγματοποιήθηκε']
     .every(x => (B8S.painted['panel-sources'] || '').includes(x)));

const B8 = CHAPTERS.find(c => c.id === 'k1-b8');
if (B8) {
  const f8 = B8.paragraphs.join('\n');
  /* ⭐⭐⭐ ΤΟ ΤΥΠΟΓΡΑΦΙΚΟ, ΚΑΙ ΤΟ ΑΝΤΙΠΑΡΑΔΕΙΓΜΑ ΖΕΙ ΣΤΗΝ ΙΔΙΑ ΕΝΟΤΗΤΑ */
  is('⭐ Β.8 · ΕΝΑ τυπογραφικό: ο δεύτερος τόνος που λείπει', B8.sic.length, 1);
  is('  και είναι το «την είσοδο τους»', B8.sic[0].m, 'την είσοδο τους');
  ok('⭐⭐⭐ Β.8 · η ΙΔΙΑ ενότητα γράφει το εγκλιτικό ΣΩΣΤΑ τρεις παραγράφους παρακάτω',
     f8.includes('στα έσοδά του') && f8.includes('την είσοδο τους') && !f8.includes('την είσοδό τους'));
  ok('  ⭐ έκτο τονικό του τμήματος Β, αλλά ΟΧΙ έκτο συνεχόμενο: η Β.4 και η Β.6 δεν έχουν κανένα',
     ['k1-b1', 'k1-b2', 'k1-b3', 'k1-b5', 'k1-b7'].every(id => (CHAPTERS.find(c => c.id === id) || { sic: [] }).sic.length >= 1)
     && (CHAPTERS.find(c => c.id === 'k1-b4') || { sic: [] }).sic.every(s => !/τόνος|τονο/.test(s.fix))
     && (CHAPTERS.find(c => c.id === 'k1-b6') || { sic: [] }).sic.every(s => !/τόνος/.test(s.fix)));
  ok('  ⚠️ και κανένα λήμμα δεν πατάει πάνω στο τυπογραφικό',
     !B8.glossary.some(g => g.m.includes('είσοδο')));
  /* ⛔⛔ ΤΟ ΧΡΟΝΟΛΟΓΙΟ ΕΙΝΑΙ ΚΑΘΑΡΑ ΤΟΥ ΚΕΙΜΕΝΟΥ */
  is('⭐ Β.8 · έξι book:true, ΟΛΑ της πρόζας',
     B8.timeline.events.filter(e => e.book).map(e => e.label).join(','),
     '1835,1880,1881,1882-1892,1890,1909');
  ok('⛔ Β.8 · καμία χρονολογία του ΠΙΝΑΚΑ 6 που ΔΕΝ γράφεται και στην πρόζα (1883-1892)',
     !B8.timeline.events.some(e => e.book && /\b(1883|1884|1887|1889|1891)\b/.test(String(e.label))));
  ok('⛔ Β.8 · ούτε του Μανσόλα (1836 · 1867) — και το 1880/1890 τα γράφει η ΙΔΙΑ η πρόζα',
     !B8.timeline.events.some(e => /\b(1836|1867)\b/.test(String(e.label)))
     && f8.includes('Μέχρι τη δεκαετία του 1880') && f8.includes('στη δεκαετία του 1890'));
  ok('  …και όσα «Πλαίσιο» φέρνουν χρονολογία άλλης ενότητας το ΔΗΛΩΝΟΥΝ',
     B8.timeline.events.filter(e => !e.book).every(e => !!e.note));
  /* ⭐⭐ ΔΥΟ ΧΡΟΝΟΛΟΓΙΕΣ ΠΟΥ ΕΜΦΑΝΙΖΟΝΤΑΙ ΔΥΟ ΦΟΡΕΣ, ΩΣ ΧΩΡΙΣΤΑ ΓΕΓΟΝΟΤΑ */
  ok('⭐⭐ Β.8 · το 1909 του δικτύου ΚΑΙ το 1909 του Γουδί, χωριστά γεγονότα',
     B8.timeline.events.filter(e => String(e.label) === '1909').length === 2
     && B8.timeline.events.some(e => String(e.label) === '1909' && e.book)
     && B8.timeline.events.some(e => String(e.label) === '1909' && !e.book && /Γουδί/.test(e.text)));
  ok('⭐ Β.8 · και το 1881 των «προϋποθέσεων» ΚΑΙ το 1881 της διώρυγας',
     B8.timeline.events.filter(e => String(e.label) === '1881').length === 2
     && B8.timeline.events.some(e => String(e.label) === '1881' && !e.book && /Β\.7/.test(e.note)));
  /* ⭐⭐ ΜΕΤΡΗΘΗΚΕ, ΔΕΝ ΕΚΤΙΜΗΘΗΚΕ — Η ΠΡΩΤΗ ΜΟΥ ΜΕΤΡΗΣΗ ΗΤΑΝ ΛΑΘΟΣ */
  is('⭐⭐ Β.8 · ΔΕΚΑΠΕΝΤΕ ομάδες ψηφίων σε όλη την ενότητα, ούτε μία παραπάνω',
     (f8.match(/\d+/g) || []).join(','), '19,19,1835,1880,9,1881,1880,1882,1892,900,1890,1909,1,56,30');
  is('  ⭐ και ΔΕΚΑ από αυτές είναι χρονολογίες ή αιώνες — οι ΠΕΝΤΕ είναι μετρήσεις',
     (f8.match(/\d+/g) || []).filter(x => /^1\d{3}$/.test(x) || x === '19').length, 10);
  ok('  …και ΚΑΜΙΑ τους δεν είναι ποσό: ούτε δραχμή, ούτε εκατομμύριο',
     !/\d[\d.,]*\s*(δραχμ|εκατομμυρ)/.test(f8));
  ok('  …και η σελίδα λέει ΡΗΤΑ τη σωστή μέτρηση, όχι την πρώτη λαθεμένη',
     JSON.stringify(B8.facts).includes('Οι ΔΕΚΑ είναι χρονολογίες ή αιώνες')
     && !JSON.stringify(B8.facts).includes('Οι εννέα είναι χρονολογίες'));
  /* ⭐ ΤΟ ΜΟΝΑΔΙΚΟ ΟΝΟΜΑ, ΔΥΟ ΦΟΡΕΣ, ΜΕ ΜΙΚΡΟ ΟΝΟΜΑ ΜΟΝΟ ΤΗ ΔΕΥΤΕΡΗ */
  is('⭐ Β.8 · ο Τρικούπης εμφανίζεται ΑΚΡΙΒΩΣ δύο φορές', (f8.match(/Τρικούπη/g) || []).length, 2);
  ok('  …και το μικρό του όνομα ΜΟΝΟ τη δεύτερη, ενώ η πρώτη είναι σε παρένθεση',
     (f8.match(/Χαρίλαου/g) || []).length === 1
     && f8.includes('(με πρωθυπουργό τον Τρικούπη, κυρίως)'));
  ok('  ⭐⭐ ενώ η Β.7, ακριβώς πριν, ΔΕΝ τον ανέφερε καθόλου — άρα η σιωπή της ήταν ΕΠΙΛΟΓΗ',
     !(CHAPTERS.find(c => c.id === 'k1-b7') || { paragraphs: [] }).paragraphs.join('\n').includes('Τρικούπ'));
  ok('  ⚠️ και κανένα άλλο όνομα προσώπου δεν μπήκε',
     ['Δηλιγιάνν', 'Συγγρ', 'Θεοτόκ', 'Βενιζέλ'].every(n => !f8.includes(n)));
  /* ⭐ ΟΙ ΠΙΟ ΣΥΧΝΕΣ ΠΑΓΙΔΕΣ ΕΧΟΥΝ ΔΙΚΗ ΤΟΥΣ ΕΓΓΡΑΦΗ */
  ok('⭐ Β.8 · η παγίδα «ο Τρικούπης ολοκλήρωσε το δίκτυο» απαντιέται ΡΗΤΑ',
     B8.explain.pitfalls.some(p => p.ok.includes('ΟΛΟΚΛΗΡΩΘΗΚΕ ΜΟΛΙΣ ΤΟ 1909')));
  ok('⭐ Β.8 · και η παγίδα «η θάλασσα βοήθησε τον σιδηρόδρομο»',
     B8.explain.pitfalls.some(p => p.no.includes('Η θάλασσα βοήθησε')));
  ok('⭐⭐ Β.8 · το ΜΕΤΡΙΚΟ πλάτος γίνεται ρητή ΕΝΝΟΙΑ, όχι υποσημείωση',
     B8.explain.concepts.some(c => c.t.includes('ΜΕΤΡΙΚΟ')));
  ok('⭐⭐⭐ Β.8 · και ο ΟΡΙΣΜΟΣ του «αποδοτικού» είναι ΕΝΝΟΙΑ που ΕΠΙΣΤΡΕΦΕΙ στην 5η παράγραφο',
     B8.explain.concepts.some(c => c.b.includes('το βιβλίο επιστρέφει να ελέγξει τον ορισμό του')));
  /* ⛔ Η ΑΝΤΙΦΑΣΗ ΣΚΟΠΟΥ ↔ ΑΠΟΤΕΛΕΣΜΑΤΟΣ ΕΙΝΑΙ ΤΟΥ ΒΙΒΛΙΟΥ, ΚΑΙ ΖΕΙ ΣΤΗ ΣΕΛΙΔΑ */
  ok('⭐⭐ Β.8 · ο δηλωμένος σκοπός και το αποτέλεσμα είναι ΚΑΙ ΤΑ ΔΥΟ στο κείμενο',
     f8.includes('ώστε να συνδεθεί η χώρα με τους διεθνείς άξονες')
     && f8.includes('χωρίς φιλοδοξίες να αποτελέσει τμήμα του διεθνούς δικτύου'));
}

/* ── Β.9 «Τα εθνικά δάνεια» (als-v563) ────────────────────────────────
   ⭐⭐⭐ Η ΠΡΩΤΗ ΕΝΟΤΗΤΑ ΠΟΥ ΤΟΝ ΠΙΝΑΚΑ ΤΟΝ ΕΧΕΙ ΔΙΚΟ ΤΗΣ. Ο Πίνακας 6
   τυπώνεται ΜΕΣΑ στο παράθυρό της· η Β.5, η Β.7 και η Β.8 τον δανείζονταν.
   Γι' αυτό εδώ ο πειρασμός του χρονολογίου είναι ο μεγαλύτερος όλων, και ο
   έλεγχος απαγορεύει ΟΝΟΜΑΣΤΙΚΑ τα έτη που ζουν ΜΟΝΟ στον πίνακα.
   ⭐⭐ Και είναι η τρίτη ενότητα ΧΩΡΙΣ τυπογραφικό — αρνητικό εύρημα που
   κλειδώνεται ΘΕΤΙΚΑ, όχι με απουσία ελέγχου. */
['explain', 'diagram', 'timeline', 'glossary', 'facts', 'text', 'sources'].forEach(id => {
  const r = boot('#/k1-b9/' + id);
  is('Β.9 · η καρτέλα «' + id + '» ζωγραφίζει χωρίς σφάλμα', r.error || 'NONE', 'NONE');
});
const B9D = boot('#/k1-b9/diagram');
ok('⭐ Β.9 · το σχεδιάγραμμα ζωγραφίζει και τα ΠΕΝΤΕ στάδιά της',
   ['Γιατί ο δανεισμός ήταν «φυσικό»',
    'Η άρνηση — και η τιμωρία δεν ήρθε από κυβερνήσεις, ήρθε από τις αγορές',
    'Η επιστροφή στις αγορές — και το παράδοξο',
    'Πού πήγαν: τέσσερις προορισμοί',
    'Ο Πίνακας 6, στο σπίτι του']
     .every(x => (B9D.painted['panel-diagram'] || '').includes(x)));
ok('⭐⭐ Β.9 · και οι ΤΕΣΣΕΡΙΣ προορισμοί των δανείων ζωγραφίζονται χωριστά, μαζί με τον πέμπτο',
   ['Τρέχοντα ελλείμματα', 'Στρατιωτικές κινητοποιήσεις', 'Εξοπλισμοί',
    'Αποπληρωμή παλαιότερων δανείων', 'Παραγωγικές επενδύσεις και δημόσια έργα']
     .every(x => (B9D.painted['panel-diagram'] || '').includes(x)));
ok('⭐⭐⭐ Β.9 · ο ΠΙΝΑΚΑΣ 6 ζωγραφίζεται ΟΛΟΚΛΗΡΟΣ — και οι εννέα γραμμές δανείων',
   ['120.000.000', '58.000.000', '100.000.000', '185.000.000', '176.000.000',
    '30.000.000', '125.000.000', '45.000.000', '15.000.000', '20.000.000', '818.500.000']
     .every(n => (B9D.painted['panel-diagram'] || '').includes(n)));
ok('  ⛔ …με τις ΔΥΟ αποκλίσεις του δηλωμένες, όχι σιωπηλά διορθωμένες',
   (B9D.painted['panel-diagram'] || '').includes('τελευταία γραμμή έχει ΤΡΙΑ κελιά')
   && (B9D.painted['panel-diagram'] || '').includes('αθροίζουν 640.000.000'));
ok('  ⭐ και οι τέσσερις αναγνώσεις δηλώνονται ΔΙΚΕΣ ΜΟΥ, όχι του βιβλίου',
   (B9D.painted['panel-diagram'] || '').includes('ΔΙΚΕΣ ΜΟΥ ΠΡΑΞΕΙΣ')
   && (B9D.painted['panel-diagram'] || '').includes('Μη γράψεις καμία από τις τέσσερις σαν νούμερο του βιβλίου'));
ok('⭐⭐ Β.9 · ο φαύλος κύκλος εξηγείται ΜΕΣΑ στο σχεδιάγραμμα',
   (B9D.painted['panel-diagram'] || '').includes('δανείζεσαι για να')
   && (B9D.painted['panel-diagram'] || '').includes('σβήνει το προηγούμενο'));
ok('⛔⛔ Β.9 · και το «όμως» της τελευταίας πρότασης ΔΕΝ λείπει από το σχεδιάγραμμα',
   (B9D.painted['panel-diagram'] || '').includes('ΜΗΝ ΚΛΕΙΣΕΙΣ ΣΤΟ «ΜΙΚΡΟ ΜΕΡΟΣ»')
   && (B9D.painted['panel-diagram'] || '').includes('ΔΕΝ ΘΑ ΜΠΟΡΟΥΣΑΝ ΝΑ ΟΛΟΚΛΗΡΩΘΟΥΝ'));
ok('⭐ Β.9 · ο τίτλος της μπαίνει στο hero', (B9D.painted.hero || '').includes('Τα εθνικά δάνεια'));
const B9S = boot('#/k1-b9/sources');
ok('⭐ Β.9 · οι «Πηγές» δηλώνουν ότι ο ΠΙΝΑΚΑΣ ΕΙΝΑΙ ΔΙΚΟΣ ΤΗΣ',
   (B9S.painted['panel-sources'] || '').includes('τυπωμένος ΜΕΣΑ στο παράθυρο αυτής της υποενότητας'));
ok('  ⭐⭐ την ΠΗΓΗ ΕΠΟΧΗΣ του 1909 — και ΔΕΝ είναι ο Μανσόλας, για πρώτη φορά',
   (B9S.painted['panel-sources'] || '').includes('επαγγελματικών σωματείων')
   && (B9S.painted['panel-sources'] || '').includes('των επί της καταναλώσεως')
   && !(B9S.painted['panel-sources'] || '').includes('Μανσόλα'));
ok('  ⚠️ …με ΚΑΙ ΤΑ ΔΥΟ όριά της δηλωμένα: είναι του 1909 και ΔΕΝ μιλάει για δάνεια',
   (B9S.painted['panel-sources'] || '').includes('δεκαεπτά χρόνια μετά')
   && (B9S.painted['panel-sources'] || '').includes('ΔΕΝ αναφέρει λέξη για δάνεια'));
ok('  ⭐⭐⭐ και τη ΔΙΑΦΩΝΙΑ ΤΩΝ ΤΡΙΩΝ ΦΩΝΩΝ (Β.9 · κεφ. 2 · Β.10)',
   ['εξάντληση των φορολογουμένων', 'Τα αποτελέσματα ήταν θετικά',
    'το 1/3 των εθνικών εσόδων', 'μπορούσαν να χαρακτηριστούν υγιή']
     .every(x => (B9S.painted['panel-sources'] || '').includes(x)));

const B9 = CHAPTERS.find(c => c.id === 'k1-b9');
if (B9) {
  const f9 = B9.paragraphs.join('\n');
  /* ⭐⭐ ΑΡΝΗΤΙΚΟ ΕΥΡΗΜΑ, ΚΛΕΙΔΩΜΕΝΟ ΘΕΤΙΚΑ */
  is('⭐⭐ Β.9 · ΚΑΝΕΝΑ τυπογραφικό — και είναι ΑΠΟΦΑΣΗ, όχι παράλειψη', B9.sic.length, 0);
  ok('  ⭐ και τα ΤΕΣΣΕΡΑ υποψήφια ζευγάρια είναι ΑΡΘΡΟ, όχι εγκλιτικό — τα κρατάει το κείμενο',
     ['παράμετρος της λειτουργίας', 'συνόδευσε την άφιξη',
      'αρνήθηκαν την αποπληρωμή', 'αδύνατη την εξοικονόμηση'].every(x => f9.includes(x))
     && !/παράμετρός|συνόδευσέ|αρνήθηκάν|αδύνατή/.test(f9));
  /* ⛔⛔ Ο ΠΡΩΤΟΣ ΜΟΥ ΙΣΧΥΡΙΣΜΟΣ ΕΔΩ ΗΤΑΝ ΨΕΥΔΗΣ, ΚΑΙ ΤΟΝ ΕΡΙΞΕ Ο ΦΡΟΥΡΟΣ:
     είχα γράψει ότι «η Β.4 και η Β.6 δεν έχουν τυπογραφικό». ΕΧΟΥΝ — απλώς
     ΑΛΛΟΥ ΕΙΔΟΥΣ (αστερίσκος υποσημείωσης η Β.4, παρενθετικές παύλες η Β.6).
     Το μετρημένο εύρημα είναι δύο πράγματα, και είναι και τα δύο ισχυρότερα:
     (α) η Β.9 είναι η ΜΟΝΗ ενότητα του τμήματος Β με ΜΗΔΕΝ τυπογραφικά
         ΟΠΟΙΟΥΔΗΠΟΤΕ είδους·
     (β) η οικογένεια «λείπει ο δεύτερος τόνος» έχει ΤΕΣΣΕΡΑ μέλη — Β.3 · Β.5 ·
         Β.7 · Β.8 — και η Β.9 τη σταματάει.
     ⭐ Ένας ισχυρισμός για «σερί» ΠΡΕΠΕΙ να μετριέται πάνω στα δεδομένα, όχι
     να γράφεται από μνήμης. */
  const bSic = CHAPTERS.filter(c => /^k1-b\d+$/.test(c.id));
  /* ⚠️ Η als-v563 έγραφε εδώ «η ΜΟΝΗ ενότητα». Η Β.10 το ακύρωσε την επόμενη
     μέρα, ο φρουρός ΕΣΚΑΣΕ, και ο ισχυρισμός ξαναγράφτηκε μετρημένος. Έτσι
     ακριβώς πρέπει να δουλεύει ένας ισχυρισμός για «σερί». */
  is('  ⭐⭐ ΔΥΟ ενότητες του τμήματος Β με ΜΗΔΕΝ τυπογραφικά — και είναι ΔΙΑΔΟΧΙΚΕΣ',
     bSic.filter(c => c.sic.length === 0).map(c => 'Β.' + c.num).join(','), 'Β.9,Β.10');
  is('  ⭐ και η οικογένεια «λείπει ο δεύτερος τόνος» έχει ΤΕΣΣΕΡΑ μέλη, με κενά ανάμεσά τους',
     bSic.filter(c => c.sic.some(s => /δεύτερος τόνος/.test(s.fix)))
         .map(c => 'Β.' + c.num).sort((x, y) => +x.slice(2) - +y.slice(2)).join(','),
     'Β.3,Β.5,Β.7,Β.8');
  ok('  ⚠️ …ενώ η Β.4 και η Β.6 ΕΧΟΥΝ τυπογραφικό, απλώς ΑΛΛΟΥ είδους (αστερίσκος · παύλες)',
     (CHAPTERS.find(c => c.id === 'k1-b4') || { sic: [] }).sic.length === 1
     && (CHAPTERS.find(c => c.id === 'k1-b6') || { sic: [] }).sic.length === 1
     && !(CHAPTERS.find(c => c.id === 'k1-b4') || { sic: [] }).sic.some(s => /δεύτερος τόνος/.test(s.fix))
     && !(CHAPTERS.find(c => c.id === 'k1-b6') || { sic: [] }).sic.some(s => /δεύτερος τόνος/.test(s.fix)));
  ok('  …και η σελίδα το λέει ΡΗΤΑ στον μαθητή, αντί να το αφήσει να μοιάζει με παράλειψη',
     JSON.stringify(B9.facts).includes('ΧΩΡΙΣ τυπογραφικό'));
  /* ⛔⛔ ΤΟ ΧΡΟΝΟΛΟΓΙΟ ΕΙΝΑΙ ΚΑΘΑΡΑ ΤΟΥ ΚΕΙΜΕΝΟΥ — ΚΑΙ Ο ΠΙΝΑΚΑΣ ΕΙΝΑΙ ΕΔΩ */
  is('⭐ Β.9 · επτά book:true, ΟΛΑ της πρόζας',
     B9.timeline.events.filter(e => e.book).map(e => e.label).join(','),
     '1832,1860,1861,1877-1880,1880,1885-1886,1889');
  ok('  ⭐ …και η σειρά που ζωγραφίζεται είναι ΧΡΟΝΟΛΟΓΙΚΗ — ο renderer ΔΕΝ ταξινομεί, τη σειρά τη δίνει ο πίνακας',
     B9.timeline.events.map(e => +String(e.label).slice(0, 4)).every((y, i, a) => i === 0 || a[i - 1] <= y));
  ok('⛔⛔ Β.9 · ΚΑΜΙΑ χρονολογία που ζει ΜΟΝΟ στον Πίνακα 6 δεν μπήκε στο χρονολόγιο — ούτε ως «Πλαίσιο»',
     !B9.timeline.events.some(e => /\b(1883|1884|1887|1890|1891|1892)\b/.test(String(e.label))));
  ok('  ⭐ …και τα δύο έτη που ΕΙΝΑΙ και στον πίνακα (1880 · 1889) τα γράφει ΚΑΙ η πρόζα',
     /\b1880\b/.test(f9) && /\b1889\b/.test(f9));
  ok('  …και όσα «Πλαίσιο» φέρνουν χρονολογία άλλης ενότητας το ΔΗΛΩΝΟΥΝ',
     B9.timeline.events.filter(e => !e.book).every(e => !!e.note));
  /* ⭐⭐ ΜΕΤΡΗΘΗΚΕ, ΔΕΝ ΕΚΤΙΜΗΘΗΚΕ */
  is('⭐⭐ Β.9 · ΔΩΔΕΚΑ ομάδες ψηφίων σε όλη την ενότητα, ούτε μία παραπάνω',
     (f9.match(/\d+/g) || []).join(','), '1832,1861,1860,1880,1877,1880,1885,1886,26,000,000,1889');
  is('  ⭐ και οι ΕΝΝΕΑ είναι χρονολογίες — οι τρεις είναι ΕΝΑ ποσό, τα 26.000.000',
     (f9.match(/\d+/g) || []).filter(x => /^1\d{3}$/.test(x)).length, 9);
  ok('  ⚠️ …και είναι το ΜΟΝΑΔΙΚΟ ποσό σε δραχμές — και είναι για ΘΩΡΗΚΤΑ',
     (f9.match(/δραχμ/g) || []).length === 1 && f9.includes('26.000.000 δραχμές')
     && f9.includes('ναυπήγηση τριών θωρηκτών'));
  ok('  …και η σελίδα το λέει ΡΗΤΑ αντί να το αφήσει απαρατήρητο',
     JSON.stringify(B9.facts).includes('ΜΟΝΑΔΙΚΟ ποσό σε δραχμές ολόκληρης της ενότητας'));
  /* ⭐ ΜΗΔΕΝ ΟΝΟΜΑΤΑ — ΚΑΙ ΕΝΑ ΜΟΝΟ ΘΕΣΜΙΚΟ ΥΠΟΚΕΙΜΕΝΟ */
  ok('⭐ Β.9 · κανένα όνομα προσώπου· ούτε ο Όθωνας, ούτε ο Τρικούπης',
     ['Όθων', 'Τρικούπ', 'Δηλιγιάνν', 'Κουμουνδούρ'].every(n => !f9.includes(n))
     && f9.includes('την άφιξη των Βαυαρών'));
  ok('  ⭐⭐ ενώ η Β.8, ακριβώς δίπλα, ονομάζει τον Τρικούπη ΔΥΟ φορές — άρα η σιωπή είναι ΕΠΙΛΟΓΗ',
     ((CHAPTERS.find(c => c.id === 'k1-b8') || { paragraphs: [] }).paragraphs.join('\n').match(/Τρικούπη/g) || []).length === 2);
  ok('  ⭐ και το ΜΟΝΟ κατονομασμένο υποκείμενο είναι θεσμός',
     f9.includes('Οι Οθωνικές κυβερνήσεις αρνήθηκαν'));
  /* ⭐⭐⭐ Η ΤΕΛΕΥΤΑΙΑ ΠΡΟΤΑΣΗ ΔΕΝ ΕΠΙΤΡΕΠΕΤΑΙ ΝΑ ΧΑΘΕΙ */
  ok('⭐⭐⭐ Β.9 · το «όμως» της τελευταίας πρότασης έχει ΔΙΚΗ του παγίδα και δική του πράξη',
     B9.explain.pitfalls.some(p => p.no.includes('τα δάνεια πήγαν χαμένα'))
     && B9.explain.acts.some(a => a.quote.includes('ποσό όμως απαραίτητο')));
  ok('⭐ Β.9 · η παγίδα «τα δάνεια πήγαν σε έργα» απαντιέται ΡΗΤΑ',
     B9.explain.pitfalls.some(p => p.ok.includes('ΜΙΚΡΟ ΜΕΡΟΣ ΑΠΕΜΕΝΕ')));
  ok('⭐ Β.9 · και η παγίδα «κρίση, όχι ανάπτυξη»',
     B9.explain.pitfalls.some(p => p.ok.includes('ΟΧΙ κρίση — ΑΝΑΠΤΥΞΗ')));
  ok('⭐⭐ Β.9 · ο φαύλος κύκλος γίνεται ρητή ΕΝΝΟΙΑ, όχι υποσημείωση',
     B9.explain.concepts.some(c => c.t.includes('ΦΑΥΛΟΣ ΚΥΚΛΟΣ')));
  ok('⭐⭐ Β.9 · και το «γιατί το χρέος μετριέται σε προϋπολογισμούς»',
     B9.explain.concepts.some(c => c.t.includes('ΠΡΟΫΠΟΛΟΓΙΣΜΟΥΣ, ΟΧΙ ΣΕ ΔΡΑΧΜΕΣ')));
}

/* ⭐ Ο ΠΙΝΑΚΑΣ 6 ΕΧΕΙ ΠΛΕΟΝ ΣΠΙΤΙ, ΚΑΙ ΟΛΕΣ ΟΙ ΠΑΡΑΠΟΜΠΕΣ ΤΟ ΞΕΡΟΥΝ.
   Πριν από την als-v563 τέσσερις παραπομπές έστελναν τον μαθητή στη Β.5,
   που τον είχε απλώς δανειστεί. Δεν ήταν ψευδείς — έγιναν ξεπερασμένες τη
   στιγμή που μπήκε η ενότητα στην οποία ΑΝΗΚΕΙ ο πίνακας. */
is('⛔ καμία παραπομπή δεν στέλνει πια τον Πίνακα 6 στο σχεδιάγραμμα της Β.5',
   (PAGE.match(/ζει στο σχεδιάγραμμα της (<b>)?Β\.5/g) || []).length, 0);
const tblPtr = [...PAGE.matchAll(/ζει στο σχεδιάγραμμα της (?:<b>)?Β\.(\d+)/g)].map(m => m[1]);
is('  ⭐ και ΚΑΘΕ τέτοια παραπομπή ονομάζει τη Β.9 — όπου ο πίνακας είναι τυπωμένος στο βιβλίο',
   [...new Set(tblPtr)].sort().join(','), '9');
ok('  …και υπάρχουν όντως τέτοιες παραπομπές (ο σαρωτής δεν γύρισε άδειος)', tblPtr.length >= 4);

/* ── Β.10 «Η πτώχευση του 1893 και ο Διεθνής Οικονομικός Έλεγχος» (als-v564) ──
   ⭐⭐⭐ Η ΤΕΛΕΥΤΑΙΑ ΕΝΤΟΣ ΥΛΗΣ ΥΠΟΕΝΟΤΗΤΑ ΤΟΥ ΤΜΗΜΑΤΟΣ Β, και η ΜΟΝΗ που
   τελειώνει ΘΕΤΙΚΑ. Το παράθυρό της στο βιβλίο είναι ΕΝΤΕΛΩΣ ΓΥΜΝΟ — μηδέν
   πίνακας, εικόνα, λεζάντα, πλαίσιο πηγής — και ταυτόχρονα είναι η πιο
   πλούσια σε νούμερα. Και οι τρεις πηγές έρχονται από αλλού, δηλωμένα.
   ⭐⭐ Το χρονολόγιό της «πληρώνει» τις Β.7 · Β.8 · Β.9: το 1893 και το 1909
   εμφανίζονται ΔΥΟ φορές το καθένα, ως χωριστά γεγονότα. */
['explain', 'diagram', 'timeline', 'glossary', 'facts', 'text', 'sources'].forEach(id => {
  const r = boot('#/k1-b10/' + id);
  is('Β.10 · η καρτέλα «' + id + '» ζωγραφίζει χωρίς σφάλμα', r.error || 'NONE', 'NONE');
});
const BAD = boot('#/k1-b10/diagram');
ok('⭐ Β.10 · το σχεδιάγραμμα ζωγραφίζει και τα ΠΕΝΤΕ στάδιά της',
   ['1893: τι ακριβώς δεν μπόρεσε να πληρωθεί',
    '1897: ο πόλεμος κόβει τις διαπραγματεύσεις',
    'Τι είναι ο Διεθνής Οικονομικός Έλεγχος — και τι ΔΕΝ είναι',
    'Τι έκανε ο Έλεγχος — και η λέξη που γυρίζει την ενότητα',
    '1910: ο απολογισμός']
     .every(x => (BAD.painted['panel-diagram'] || '').includes(x)));
ok('⭐⭐ Β.10 · και τα ΕΞΙ κράτη ζωγραφίζονται ονομαστικά',
   ['Αγγλία', 'Γαλλία', 'Αυστρία', 'Γερμανία', 'Ρωσία', 'Ιταλία']
     .every(x => (BAD.painted['panel-diagram'] || '').includes(x)));
ok('⭐⭐ Β.10 · και τα ΕΝΝΙΑ έσοδα του ΔΟΕ, χωριστά — με το «κ.λπ.» δηλωμένο',
   ['Αλάτι', 'Φωτιστικό πετρέλαιο', 'Σπίρτα', 'Παιγνιόχαρτα', 'Χαρτί σιγαρέτων',
    'Σμύριδα της Νάξου', 'Καπνού · χαρτοσήμου', 'Λιμάνι του Πειραιά']
     .every(x => (BAD.painted['panel-diagram'] || '').includes(x))
   && (BAD.painted['panel-diagram'] || '').includes('η λίστα ΔΕΝ είναι πλήρης'));
ok('⛔ Β.10 · οι ΤΡΕΙΣ παγίδες του ΔΟΕ απαντιούνται μέσα στο σχεδιάγραμμα',
   ['ΔΕΝ είναι κατοχή', 'ΔΕΝ είναι ξένη κυβέρνηση', 'ΔΕΝ είναι κατάσχεση']
     .every(x => (BAD.painted['panel-diagram'] || '').includes(x)));
ok('⭐⭐⭐ Β.10 · και η λέξη που γυρίζει την ενότητα ζωγραφίζεται ΡΗΤΑ',
   (BAD.painted['panel-diagram'] || '').includes('ΕΠΙΠΡΟΣΘΕΤΑ ως ΤΕΧΝΙΚΟ ΣΥΜΒΟΥΛΕΥΤΙΚΟ ΣΩΜΑ')
   && (BAD.painted['panel-diagram'] || '').includes('θα ήταν μόνο εισπράκτορας'));
ok('⚠️⚠️ Β.10 · τα ΔΥΟ «παρά» του 1910 είναι ΚΑΙ ΤΑ ΔΥΟ στη σελίδα',
   (BAD.painted['panel-diagram'] || '').includes('ΣΤΑΦΙΔΙΚΗΣ ΚΡΙΣΗΣ')
   && (BAD.painted['panel-diagram'] || '').includes('ΤΟ 1/3 ΤΩΝ ΕΘΝΙΚΩΝ ΕΣΟΔΩΝ')
   && (BAD.painted['panel-diagram'] || '').includes('λες τη μισή αλήθεια'));
ok('⭐ Β.10 · ο τίτλος της μπαίνει στο hero', (BAD.painted.hero || '').includes('Η πτώχευση του 1893'));
const B10S = boot('#/k1-b10/sources');
ok('⭐ Β.10 · οι «Πηγές» δηλώνουν ότι ο ΠΙΝΑΚΑΣ 6 ανήκει στη Β.9, όχι εδώ',
   (B10S.painted['panel-sources'] || '').includes('Ο ΠΙΝΑΚΑΣ ΑΝΗΚΕΙ ΣΤΗ Β.9')
   && (B10S.painted['panel-sources'] || '').includes('818.500.000'));
ok('  ⭐⭐ την ΠΗΓΗ ΕΠΟΧΗΣ του Αυγούστου 1909 — και είναι η ΤΕΤΑΡΤΗ διαφορετική του τμήματος Β',
   (B10S.painted['panel-sources'] || '').includes('Στρατιωτικού Συνδέσμου')
   && (B10S.painted['panel-sources'] || '').includes('όπως τα οικονομικά ανορθωθώσι')
   && !(B10S.painted['panel-sources'] || '').includes('Μανσόλα'));
ok('  ⚠️ …με ΚΑΙ ΤΑ ΔΥΟ όριά της δηλωμένα: δεν μιλάει για ΔΟΕ, και τα οικονομικά μπαίνουν ΤΕΛΕΥΤΑΙΑ',
   (B10S.painted['panel-sources'] || '').includes('ΔΕΝ αναφέρει ούτε τον Διεθνή Οικονομικό Έλεγχο')
   && (B10S.painted['panel-sources'] || '').includes('μπαίνουν ΤΕΛΕΥΤΑΙΑ στη λίστα'));
ok('  ⭐⭐⭐ και τη ΔΙΑΦΩΝΙΑ με το 2ο κεφάλαιο, που καλύπτει ΤΑ ΙΔΙΑ χρόνια',
   ['δεν πραγματοποιήθηκε', 'επέτεινε το πολιτικό αδιέξοδο',
    'διοικητικού χαρακτήρα', 'εκδηλώθηκε κίνημα στο Γουδί']
     .every(x => (B10S.painted['panel-sources'] || '').includes(x)));
ok('  ⚠️ …και δηλώνεται ΡΗΤΑ ότι ΔΕΝ είναι αντίφαση',
   (B10S.painted['panel-sources'] || '').includes('ΔΕΝ είναι αντίφαση, και είναι λάθος να τη γράψεις έτσι'));

const B10 = CHAPTERS.find(c => c.id === 'k1-b10');
if (B10) {
  const f10 = B10.paragraphs.join('\n');
  /* ⭐⭐ ΑΡΝΗΤΙΚΟ ΕΥΡΗΜΑ, ΚΛΕΙΔΩΜΕΝΟ ΘΕΤΙΚΑ */
  is('⭐⭐ Β.10 · ΚΑΝΕΝΑ τυπογραφικό — δεύτερη συνεχόμενη φορά μετά τη Β.9', B10.sic.length, 0);
  ok('  ⭐ και τα ΔΥΟ πραγματικά εγκλιτικά της ενότητας έχουν ΟΞΥΤΟΝΗ προηγούμενη λέξη',
     f10.includes('των εξωτερικών της δανείων') && f10.includes('το βασικό της ρόλο')
     && !/εξωτερικών|βασικό/.test('') && !/των εξωτερικών τής|το βασικό τής/.test(f10));
  ok('  …και η σελίδα το λέει ΡΗΤΑ στον μαθητή, αντί να μοιάζει με παράλειψη',
     JSON.stringify(B10.facts).includes('ΧΩΡΙΣ τυπογραφικό'));
  /* ⛔⛔ ΤΟ ΧΡΟΝΟΛΟΓΙΟ ΕΙΝΑΙ ΚΑΘΑΡΑ ΤΟΥ ΚΕΙΜΕΝΟΥ */
  is('⭐ Β.10 · τέσσερα book:true, ΟΛΑ της πρόζας — και είναι ΟΛΕΣ οι χρονολογίες της',
     B10.timeline.events.filter(e => e.book).map(e => e.label).join(','), '1893,1897,1898,1910');
  is('  ⭐ και το κείμενο δεν έχει ΚΑΜΙΑ άλλη χρονολογία',
     [...new Set((f10.match(/\b1\d{3}\b/g) || []))].sort().join(','), '1893,1897,1898,1910');
  ok('⛔⛔ Β.10 · ΚΑΜΙΑ χρονολογία του Πίνακα 6 δεν μπήκε — ο πίνακας ανήκει στη Β.9',
     !B10.timeline.events.some(e => /\b(1880|1883|1884|1887|1889|1890|1891|1892)\b/.test(String(e.label))));
  ok('  …και όσα «Πλαίσιο» φέρνουν χρονολογία άλλης ενότητας το ΔΗΛΩΝΟΥΝ',
     B10.timeline.events.filter(e => !e.book).every(e => !!e.note));
  /* ⭐⭐ ΤΟ ΧΡΟΝΟΛΟΓΙΟ ΠΛΗΡΩΝΕΙ ΤΙΣ Β.7 · Β.8 · Β.9 */
  ok('⭐⭐ Β.10 · το 1893 της αδυναμίας ΚΑΙ το 1893 της διώρυγας (Β.7), χωριστά γεγονότα',
     B10.timeline.events.filter(e => String(e.label) === '1893').length === 2
     && B10.timeline.events.some(e => String(e.label) === '1893' && e.book)
     && B10.timeline.events.some(e => String(e.label) === '1893' && !e.book && /Β\.7/.test(e.note)));
  ok('⭐⭐ Β.10 · και το 1909 του σιδηροδρόμου (Β.8) ΚΑΙ το 1909 του Γουδί (κεφ. 2)',
     B10.timeline.events.filter(e => String(e.label) === '1909').length === 2
     && B10.timeline.events.some(e => String(e.label) === '1909' && /Β\.8/.test(e.note))
     && B10.timeline.events.some(e => String(e.label) === '1909' && /Γουδί/.test(e.text)));
  ok('  ⭐ και η σειρά που ζωγραφίζεται είναι ΧΡΟΝΟΛΟΓΙΚΗ — ο renderer ΔΕΝ ταξινομεί',
     B10.timeline.events.map(e => +String(e.label).slice(0, 4)).every((y, i, a) => i === 0 || a[i - 1] <= y));
  /* ⭐⭐ ΜΕΤΡΗΘΗΚΕ, ΔΕΝ ΕΚΤΙΜΗΘΗΚΕ */
  is('⭐⭐ Β.10 · ΔΕΚΑΠΕΝΤΕ ομάδες ψηφίων, ούτε μία παραπάνω',
     (f10.match(/\d+/g) || []).join(','), '1893,1897,28,000,000,30,000,000,92,000,000,1898,1910,1,3');
  is('  ⭐ οι ΤΕΣΣΕΡΙΣ είναι χρονολογίες· οι υπόλοιπες ΕΝΤΕΚΑ είναι τρία ποσά και το «1/3»',
     (f10.match(/\d+/g) || []).filter(x => /^1\d{3}$/.test(x)).length, 4);
  ok('  ⭐⭐ …και είναι η ΠΙΟ ΠΛΟΥΣΙΑ σε νούμερα του τμήματος Β, με το ΓΥΜΝΟΤΕΡΟ παράθυρο',
     JSON.stringify(B10.facts).includes('ΕΝΤΕΛΩΣ ΓΥΜΝΟ')
     && (f10.match(/δραχμ/g) || []).length === 2);
  /* ⭐⭐⭐ Η ΜΟΝΗ ΕΝΟΤΗΤΑ ΤΟΥ Β ΠΟΥ ΤΕΛΕΙΩΝΕΙ ΘΕΤΙΚΑ — ΜΕΤΡΗΜΕΝΟ */
  const bAll = CHAPTERS.filter(c => /^k1-b\d+$/.test(c.id));
  is('⭐⭐⭐ Β.10 · η ΜΟΝΗ υποενότητα του τμήματος Β που τελειώνει θετικά (μετρημένο στις τελευταίες παραγράφους)',
     bAll.filter(c => /Τα αποτελέσματα ήταν θετικά|χαρακτηριστούν υγιή/.test(c.paragraphs[c.paragraphs.length - 1]))
         .map(c => 'Β.' + c.num).join(','), 'Β.10');
  ok('  …και η σελίδα δηλώνει ΚΑΙ την ανατροπή: το θετικό ήρθε από ΞΕΝΟ ΕΛΕΓΧΟ',
     JSON.stringify(B10.facts).includes('ήρθε από τον ΞΕΝΟ ΕΛΕΓΧΟ'));
  /* ⭐ ΤΟ ΜΟΝΟ ΟΝΟΜΑ, ΚΑΙ Η ΔΙΠΛΗ ΑΙΤΙΑ ΤΟΥ ΒΕΝΙΖΕΛΟΥ */
  is('⭐ Β.10 · ΕΝΑ όνομα προσώπου, και είναι ο Βενιζέλος', (f10.match(/Βενιζέλ/g) || []).length, 1);
  ok('  ⭐⭐ και η σελίδα αντιπαραθέτει τις ΔΥΟ αιτίες του ερχομού του (ΜΕΣΑ ↔ ΕΥΚΑΙΡΙΑ)',
     B10.explain.pitfalls.some(p => p.ok.includes('έδωσε τα ΜΕΣΑ, όχι την ΕΥΚΑΙΡΙΑ')));
  ok('  ⚠️ …ενώ ο Τρικούπης της Β.8 ΔΕΝ εμφανίζεται εδώ', !f10.includes('Τρικούπ'));
  /* ⭐ ΟΙ ΠΙΟ ΣΥΧΝΕΣ ΠΑΓΙΔΕΣ ΕΧΟΥΝ ΔΙΚΗ ΤΟΥΣ ΕΓΓΡΑΦΗ */
  ok('⭐ Β.10 · η παγίδα «η πτώχευση ήταν ελληνική ιδιαιτερότητα» απαντιέται ΡΗΤΑ',
     B10.explain.pitfalls.some(p => p.ok.includes('ΔΕΝ ΗΤΑΝ ΑΣΥΝΗΘΙΣΤΗ ΕΠΙΛΟΓΗ ΤΩΝ ΦΤΩΧΟΤΕΡΩΝ ΚΡΑΤΩΝ')));
  ok('⭐ Β.10 · και η παγίδα «ο ΔΟΕ ήταν ξένη κατοχή»',
     B10.explain.pitfalls.some(p => p.no.includes('ξένη κατοχή')));
  ok('⭐⭐ Β.10 · ο ορισμός του ΔΟΕ γίνεται ρητή ΕΝΝΟΙΑ, με το «τι ΔΕΝ είναι»',
     B10.explain.concepts.some(c => c.b.includes('ΤΡΙΑ ΠΡΑΓΜΑΤΑ ΠΟΥ ΔΕΝ ΕΙΝΑΙ')));
  ok('⭐⭐ Β.10 · και η διάκριση «δημόσια οικονομικά ≠ ευημερία του λαού»',
     B10.explain.concepts.some(c => c.t.includes('ΕΥΗΜΕΡΙΑ ΤΟΥ ΛΑΟΥ')));
}

/* ⭐⭐⭐ ΤΟ ΤΜΗΜΑ Β ΕΚΛΕΙΣΕ — ΟΛΕΣ ΟΙ ΕΝΤΟΣ ΥΛΗΣ ΥΠΟΕΝΟΤΗΤΕΣ ΤΟΥ ΕΙΝΑΙ ΕΤΟΙΜΕΣ.
   Η Β.11 «Το εξωελλαδικό ελληνικό κεφάλαιο» είναι ΕΚΤΟΣ ύλης (yli:false), άρα
   δεν μετράει. Ο έλεγχος βγάζει τη λίστα ΑΠΟ ΤΟΝ ΧΑΡΤΗ, όχι από καρφωμένο
   νούμερο — αν κάποτε αλλάξει η ύλη, θα το πει. */
{
  const yliB = (JSON.parse((PAGE.match(/const YLI = (\[[\s\S]*?\]);\n<\/script>/) || [])[1] || '[]')[0] || { secs: [] })
    .secs.filter(s => s.L === 'Β').flatMap(s => s.units).filter(u => u.yli).map(u => u.id).sort();
  const doneB = CHAPTERS.filter(c => /^k1-b\d+$/.test(c.id)).map(c => c.id).sort();
  is('⭐⭐⭐ ΤΟ ΤΜΗΜΑ Β ΕΚΛΕΙΣΕ: κάθε ΕΝΤΟΣ ΥΛΗΣ υποενότητά του είναι έτοιμη',
     yliB.filter(id => doneB.indexOf(id) < 0).join(',') || 'ΚΑΜΙΑ ΛΕΙΠΕΙ', 'ΚΑΜΙΑ ΛΕΙΠΕΙ');
  ok('  ⚠️ και η Β.11 μένει έξω γιατί είναι ΕΚΤΟΣ ύλης, όχι επειδή ξεχάστηκε',
     yliB.indexOf('k1-b11') < 0 && doneB.indexOf('k1-b11') < 0);
}

/* ── Γ.1 «Το αγροτικό ζήτημα» (als-v566) ──────────────────────────────
   ⭐⭐⭐ Η ΠΡΩΤΗ ΥΠΟΕΝΟΤΗΤΑ ΤΟΥ ΤΜΗΜΑΤΟΣ Γ ΠΟΥ ΓΡΑΦΤΗΚΕ ΜΕΤΑ ΤΟ ΚΛΕΙΣΙΜΟ
   ΤΟΥ Β, και το παράθυρό της στο βιβλίο είναι το ΠΛΟΥΣΙΟΤΕΡΟ που έχει
   συναντήσει το βοήθημα: 3 εικόνες, 2 λεζάντες, ο ΠΙΝΑΚΑΣ 7 και ένα
   ολόκληρο πλαίσιο πηγής εποχής (Μανσόλας, 1867) — και τα δύο τελευταία
   τυπωμένα ΜΕΣΑ στην ίδια την ενότητα, όχι δανεισμένα από αλλού.
   ⭐⭐ Η σπονδυλική στήλη της ενότητας είναι ΔΙΚΗ ΤΗΣ: το ζήτημα μπαίνει
   στη χώρα ΔΥΟ φορές μαζί με έδαφος (1881 · 1913) και εκτελείται μόνο
   υπό την πίεση των προσφύγων — που το βιβλίο τη γράφει ΔΥΟ φορές. */
['explain', 'diagram', 'timeline', 'glossary', 'facts', 'text', 'sources'].forEach(id => {
  const r = boot('#/k1-g1/' + id);
  is('Γ.1 · η καρτέλα «' + id + '» ζωγραφίζει χωρίς σφάλμα', r.error || 'NONE', 'NONE');
});
const G1D = boot('#/k1-g1/diagram');
ok('⭐ Γ.1 · το σχεδιάγραμμα ζωγραφίζει και τα ΠΕΝΤΕ στάδιά της',
   ['Γιατί άνοιξε ο δρόμος — η αιτία είναι παγκόσμια, όχι ελληνική',
    'Η ελληνική εξαίρεση — και πώς τελείωσε με δύο διευρύνσεις',
    'Τα θεσσαλικά τσιφλίκια: ποιοι τα πήραν και πώς κέρδιζαν',
    '1907: ο νόμος υπήρχε — και δεν άλλαξε τίποτα για δέκα χρόνια',
    '1917 και μετά: η απόφαση, ο καταλύτης, το αποτέλεσμα']
     .every(x => (G1D.painted['panel-diagram'] || '').includes(x)));
ok('⭐⭐⭐ Γ.1 · η ΑΙΤΙΑ της μεταρρύθμισης ζωγραφίζεται ΡΗΤΑ, και δεν είναι η αδικία',
   (G1D.painted['panel-diagram'] || '').includes('ΠΗΓΗ ΕΞΟΥΣΙΑΣ')
   && (G1D.painted['panel-diagram'] || '').includes('η γη μοιράστηκε επειδή έπαψε να δίνει δύναμη'));
ok('⭐⭐ Γ.1 · και οι ΤΡΕΙΣ αρνήσεις του ορισμού («τι ΔΕΝ είναι η μεταρρύθμιση»)',
   ['εθνικοποίηση', 'κολεκτιβοποίηση', 'επανάσταση']
     .every(x => (G1D.painted['panel-diagram'] || '').includes(x)));
ok('⚠️⚠️ Γ.1 · η πιο συχνή λάθος απάντηση απαντιέται ΜΕΣΑ στο σχεδιάγραμμα',
   (G1D.painted['panel-diagram'] || '').includes('ΟΙ ΝΕΟΙ ΤΣΙΦΛΙΚΑΔΕΣ ΗΤΑΝ ΕΛΛΗΝΕΣ, ΟΧΙ ΟΘΩΜΑΝΟΙ'));
ok('⭐ Γ.1 · και τα ΤΡΙΑ ρήματα των τριών βημάτων, χωριστά',
   ['ΕΠΕΤΡΕΠΑΝ', 'ΑΠΟΦΑΣΙΣΕ', 'ΟΛΟΚΛΗΡΩΘΗΚΕ']
     .every(x => (G1D.painted['panel-diagram'] || '').includes(x)));
ok('⭐⭐⭐ Γ.1 · ο ΠΙΝΑΚΑΣ 7 ζωγραφίζεται ολόκληρος, με τα τρία του νούμερα',
   ['1917-1920', '1921-1922', '1923-1925', '1.203']
     .every(x => (G1D.painted['panel-diagram'] || '').includes(x))
   && (G1D.painted['panel-diagram'] || '').includes('μετράει'));
ok('  ⛔ …και δηλώνεται ότι μετράει ΠΡΑΞΕΙΣ, όχι στρέμματα',
   (G1D.painted['panel-diagram'] || '').includes('δεν δίνει στρέμματα'));
ok('⭐ Γ.1 · ο τίτλος της μπαίνει στο hero', (G1D.painted.hero || '').includes('Το αγροτικό ζήτημα'));
const G1S = boot('#/k1-g1/sources');
ok('⭐⭐ Γ.1 · οι «Πηγές» δίνουν την ΠΗΓΗ ΕΠΟΧΗΣ που είναι τυπωμένη ΜΕΣΑ στην ενότητα',
   (G1S.painted['panel-sources'] || '').includes('Μανσόλα')
   && (G1S.painted['panel-sources'] || '').includes('δεν έχομεν'));
ok('  ⚠️ …με ΚΑΙ ΤΑ ΔΥΟ όριά της δηλωμένα: είναι του 1867 και δεν ξέρει τσιφλίκια',
   (G1S.painted['panel-sources'] || '').includes('η πηγή είναι του 1867')
   && (G1S.painted['panel-sources'] || '').includes('δεν αναφέρει ΚΑΘΟΛΟΥ τσιφλίκια'));
ok('  ⛔⛔ …και ΔΗΛΩΝΕΤΑΙ ότι το ΤΥΠΩΜΕΝΟ ΒΙΒΛΙΟ έχει τυπογραφικά μέσα στην πηγή',
   (G1S.painted['panel-sources'] || '').includes('θετικός')
   && (G1S.painted['panel-sources'] || '').includes('καλλιεγησίμων')
   && (G1S.painted['panel-sources'] || '').includes('το βιβλίο δεν είναι αλάθητο'));
ok('  ⭐⭐⭐ και τη ΔΙΑΦΩΝΙΑ με τη Β.3, που αφηγείται ΤΟ ΙΔΙΟ θέμα πολύ πιο σκληρά',
   ['συναντούσε πολλά προβλήματα στην πράξη', '1870-1871', '600.000 στρέμματα',
    'δεν ήταν στις προθέσεις των πλουσίων']
     .every(x => (G1S.painted['panel-sources'] || '').includes(x)));
ok('  ⚠️ …και δηλώνεται ΡΗΤΑ ότι ΔΕΝ είναι αντίφαση αλλά διαφορά κλίμακας',
   (G1S.painted['panel-sources'] || '').includes('ΔΕΝ ΕΙΝΑΙ ΑΝΤΙΦΑΣΗ, ΕΙΝΑΙ ΔΙΑΦΟΡΑ ΚΛΙΜΑΚΑΣ'));

const G1 = CHAPTERS.find(c => c.id === 'k1-g1');
if (G1) {
  const f1 = G1.paragraphs.join('\n');
  /* ⭐⭐ ΑΡΝΗΤΙΚΟ ΕΥΡΗΜΑ, ΚΛΕΙΔΩΜΕΝΟ ΘΕΤΙΚΑ — ΚΑΙ ΧΩΡΙΣ ΥΠΕΡΒΟΛΙΚΟ ΙΣΧΥΡΙΣΜΟ.
     ΔΕΝ λέμε «η μόνη» ούτε «η τρίτη συνεχόμενη»: ο ισχυρισμός είναι ακριβώς
     όσο μεγάλος τον σηκώνει η μέτρηση. */
  is('⭐⭐ Γ.1 · ΚΑΝΕΝΑ τυπογραφικό', G1.sic.length, 0);
  ok('  ⭐ και τα ΤΡΙΑ πραγματικά εγκλιτικά της ενότητας έχουν ΟΞΥΤΟΝΗ προηγούμενη λέξη',
     f1.includes('Η εφαρμογή τους αποδείχθηκε') && f1.includes('Με τη σειρά της η νέα')
     && f1.includes('την παραγωγή τους και έπεφταν')
     && !/εφαρμογή τής|σειρά τής|παραγωγή τούς/.test(f1));
  ok('  …και η σελίδα το λέει ΡΗΤΑ στον μαθητή, αντί να μοιάζει με παράλειψη',
     JSON.stringify(G1.facts).includes('ΧΩΡΙΣ τυπογραφικό'));
  /* ⛔⛔ Η ΠΑΡΕΝΘΕΤΙΚΗ ΠΑΥΛΑ — ΤΡΙΤΗ ΕΝΟΤΗΤΑ ΜΕ ΤΟ ΙΔΙΟ ΜΟΤΙΒΟ (Γ.2 · Γ.3 · Γ.1),
     αλλά ΑΛΛΗ ΓΡΑΦΗ: εδώ οι παύλες κολλάνε στη ΜΕΣΑΙΑ λέξη και έχουν κενό
     απ' έξω, ενώ στη Γ.2/Γ.3 η κλειστική κολλάει στη λέξη ΠΡΙΝ. */
  ok('⭐⭐ Γ.1 · κρατάει την παρενθετική παύλα: «κοινωνικού -ταξικού- κύρους»',
     f1.includes('κοινωνικού -ταξικού- κύρους'));
  ok('  ⛔ και ΔΕΝ έχει καμία ενωμένη μορφή της',
     !f1.includes('κοινωνικού-ταξικού') && !f1.includes('ταξικού-κύρους'));
  ok('  ⭐ …και η σελίδα εξηγεί στον μαθητή ΓΙΑΤΙ δεν είναι τυπογραφικό',
     JSON.stringify(G1.facts).includes('παρενθετικές'));
  /* ⛔⛔ ΤΟ ΧΡΟΝΟΛΟΓΙΟ ΕΙΝΑΙ ΚΑΘΑΡΑ ΤΟΥ ΚΕΙΜΕΝΟΥ */
  is('⭐ Γ.1 · επτά book:true, ΟΛΑ της πρόζας',
     G1.timeline.events.filter(e => e.book).map(e => e.label).join(','),
     '1821-1828,1864,1881,1907,1910,1913,1917');
  is('  ⭐ και μαζί καλύπτουν ΑΚΡΙΒΩΣ τις χρονολογίες που γράφει το κείμενο',
     [...new Set((f1.match(/\b1\d{3}\b/g) || []))].sort().join(','),
     [...new Set(G1.timeline.events.filter(e => e.book)
        .flatMap(e => String(e.label).match(/\d{4}/g) || []))].sort().join(','));
  ok('⛔⛔ Γ.1 · ΚΑΜΙΑ χρονολογία του ΠΙΝΑΚΑ 7 δεν μπήκε στο χρονολόγιο',
     !G1.timeline.events.some(e => /\b(1918|1919|1920|1921|1923|1924|1925)\b/.test(String(e.label))));
  ok('⛔⛔ …ούτε καμία της ΠΗΓΗΣ του Μανσόλα (1836 · 1867)',
     !G1.timeline.events.some(e => /\b(1836|1867)\b/.test(String(e.label))));
  ok('  …και όσα «Πλαίσιο» φέρνουν χρονολογία άλλης ενότητας το ΔΗΛΩΝΟΥΝ',
     G1.timeline.events.filter(e => !e.book).every(e => !!e.note));
  ok('  ⭐ και η σειρά που ζωγραφίζεται είναι ΧΡΟΝΟΛΟΓΙΚΗ — ο renderer ΔΕΝ ταξινομεί',
     G1.timeline.events.map(e => +String(e.label).slice(0, 4)).every((y, i, a) => i === 0 || a[i - 1] <= y));
  /* ⭐⭐ ΜΕΤΡΗΘΗΚΕ, ΔΕΝ ΕΚΤΙΜΗΘΗΚΕ */
  is('⭐⭐ Γ.1 · ΔΩΔΕΚΑ ομάδες ψηφίων, ούτε μία παραπάνω',
     (f1.match(/\d+/g) || []).join(','), '19,1821,1828,1864,1881,1907,1910,1913,1917,85,68,40');
  is('  ⭐ οι ΟΚΤΩ είναι χρονολογίες· οι υπόλοιπες τέσσερις είναι ο «19ο αιώνα» και τρία ποσοστά',
     (f1.match(/\d+/g) || []).filter(x => /^1\d{3}$/.test(x)).length, 8);
  is('  ⭐⭐ και τα ΤΡΙΑ ποσοστά είναι ΟΛΑ της αναδιανομής — κανένα άλλο νούμερο',
     (f1.match(/\d+%/g) || []).join(','), '85%,68%,40%');
  /* ⭐⭐⭐ Η ΣΠΟΝΔΥΛΙΚΗ ΣΤΗΛΗ: ΤΟ ΖΗΤΗΜΑ ΜΠΑΙΝΕΙ ΜΕ ΤΑ ΣΥΝΟΡΑ, ΔΥΟ ΦΟΡΕΣ */
  ok('⭐⭐⭐ Γ.1 · και οι ΔΥΟ διευρύνσεις που φέρνουν μεγάλη ιδιοκτησία είναι στο κείμενο',
     f1.includes('έφερε στο προσκήνιο το ζήτημα της μεγάλης ιδιοκτησίας')
     && f1.includes('μέσα στα νέα όρια της χώρας υπήρχαν πλέον και μουσουλμάνοι ιδιοκτήτες'));
  ok('  …και η σελίδα το ονομάζει ως ΜΗΧΑΝΗ, όχι ως δύο ξεχωριστά περιστατικά',
     JSON.stringify(G1.facts).includes('προσαρτήθηκε'));
  /* ⭐⭐⭐ Ο ΚΑΤΑΛΥΤΗΣ ΛΕΓΕΤΑΙ ΔΥΟ ΦΟΡΕΣ — ΜΕΤΡΗΜΕΝΟ ΣΤΟ ΥΛΙΚΟ */
  is('⭐⭐⭐ Γ.1 · το βιβλίο ονομάζει τους ΠΡΟΣΦΥΓΕΣ ως αιτία ΔΥΟ φορές, σε δύο παραγράφους',
     G1.paragraphs.filter(p => /προσφύγων|προσφυγικού/.test(p)).length, 2);
  ok('  ⭐ και η σελίδα το δηλώνει ΡΗΤΑ ως τον πραγματικό καταλύτη',
     G1.facts.some(f => f.title.includes('πραγματικό καταλύτη')));
  /* ⭐ ΤΟ ΜΟΝΟ ΟΝΟΜΑ, ΤΟ ΜΟΝΟ ΧΩΡΙΟ */
  is('⭐ Γ.1 · ΕΝΑ όνομα προσώπου, και είναι ο Βενιζέλος', (f1.match(/Βενιζέλ/g) || []).length, 1);
  is('  ⭐ και ΕΝΑ μόνο χωριό σε ολόκληρη την ενότητα', (f1.match(/Κιλελέρ/g) || []).length, 1);
  /* ⭐ ΟΙ ΠΙΟ ΣΥΧΝΕΣ ΠΑΓΙΔΕΣ ΕΧΟΥΝ ΔΙΚΗ ΤΟΥΣ ΕΓΓΡΑΦΗ */
  ok('⭐ Γ.1 · η παγίδα «οι τσιφλικάδες ήταν Οθωμανοί» απαντιέται ΡΗΤΑ',
     G1.explain.pitfalls.some(p => p.no.includes('ανήκαν σε Οθωμανούς')
       && p.ok.includes('ΑΓΟΡΑΣΤΗΚΑΝ ΑΠΟ ΠΛΟΥΣΙΟΥΣ ΕΛΛΗΝΕΣ ΤΟΥ ΕΞΩΤΕΡΙΚΟΥ')));
  ok('⭐ Γ.1 · και η παγίδα «το 85% αφορούσε όλη την Ελλάδα»',
     G1.explain.pitfalls.some(p => p.ok.includes('το 85% είναι ΤΟΠΙΚΟ νούμερο')));
  ok('⭐⭐ Γ.1 · και η παγίδα «το 1917 ολοκληρώθηκε» — τρία ρήματα, τρία βήματα',
     G1.explain.pitfalls.some(p => p.ok.includes('ΑΠΟΦΑΣΙΣΕ την ολοκλήρωση')));
  ok('⭐⭐ Γ.1 · ο ορισμός της μεταρρύθμισης γίνεται ρητή ΕΝΝΟΙΑ, με το «τι ΔΕΝ είναι»',
     G1.explain.concepts.some(c => c.b.includes('ΤΡΙΑ ΠΡΑΓΜΑΤΑ ΠΟΥ ΔΕΝ ΕΙΝΑΙ')));
  ok('⭐⭐ Γ.1 · και η διάκριση ΚΟΛΙΓΟΣ ≠ ΑΚΤΗΜΟΝΑΣ ≠ ΜΙΚΡΟΚΑΛΛΙΕΡΓΗΤΗΣ',
     G1.explain.concepts.some(c => c.t.includes('ΚΟΛΙΓΟΣ') && c.t.includes('ΜΙΚΡΟΚΑΛΛΙΕΡΓΗΤΗΣ')));
}

/* ── Γ.6 «Η ελληνική οικονομία κατά την περίοδο του μεσοπολέμου» (als-v567) ──
   ⭐⭐⭐ Η ΠΙΟ ΜΙΚΡΗ ΕΝΟΤΗΤΑ ΟΛΟΚΛΗΡΟΥ ΤΟΥ CORPUS, ΚΑΙ Η ΜΟΝΗ ΠΟΥ ΔΕΝ
   ΑΦΗΓΕΙΤΑΙ: δεν έχει ούτε ένα γεγονός, και οι δύο μόνες χρονολογίες της
   ζουν μέσα στην ίδια παρένθεση, «(1919-1939)» — είναι ο ΟΡΙΣΜΟΣ της
   περιόδου, όχι γεγονότα. Το παράθυρό της στο βιβλίο είναι εντελώς γυμνό.
   ⛔⛔ ΚΑΙ ΤΟ ΕΡΓΑΛΕΙΟ ΕΙΠΕ ΞΑΝΑ «0 ΤΥΠΟΓΡΑΦΙΚΑ» ΚΑΙ ΕΙΧΕ ΑΔΙΚΟ: το
   «αστικοποίηση της» είναι κτητικό εγκλιτικό μετά από προπαροξύτονο.
   ⭐⭐ Οι ισχυρισμοί «πιο μικρή» και «μόνη σε α' πληθυντικό» ΔΕΝ είναι
   καρφωμένοι: βγαίνουν από ΜΕΤΡΗΣΗ πάνω σε ΟΛΟ το CHAPTERS, και σκάνε
   μόνοι τους αν κάποτε προστεθεί ενότητα που τους ακυρώνει. */
['explain', 'diagram', 'timeline', 'glossary', 'facts', 'text', 'sources'].forEach(id => {
  const r = boot('#/k1-g6/' + id);
  is('Γ.6 · η καρτέλα «' + id + '» ζωγραφίζει χωρίς σφάλμα', r.error || 'NONE', 'NONE');
});
const G6D = boot('#/k1-g6/diagram');
ok('⭐ Γ.6 · το σχεδιάγραμμα ζωγραφίζει και τα ΠΕΝΤΕ στάδιά της',
   ['Τι είδους κείμενο είναι αυτό — και γιατί δεν έχει ούτε ένα γεγονός',
    'Τα πέντε πλεονεκτήματα, με τη σειρά του βιβλίου',
    'Το «ΠΑΡΑ» δεν αντέχει — πέρασε τα πέντε ένα-ένα',
    'Ο κοσμοπολιτισμός: το ίδιο βιβλίο τον μετράει με τρία διαφορετικά πρόσημα',
    'Η δεύτερη παράγραφος αλλάζει επίπεδο: από κράτος σε ανθρώπους']
     .every(x => (G6D.painted['panel-diagram'] || '').includes(x)));
ok('⭐⭐⭐ Γ.6 · και τα ΠΕΝΤΕ πλεονεκτήματα ζωγραφίζονται χωριστά, αριθμημένα',
   ['Πλεονέκτημα 1', 'Πλεονέκτημα 2', 'Πλεονέκτημα 3', 'Πλεονέκτημα 4', 'Πλεονέκτημα 5']
     .every(x => (G6D.painted['panel-diagram'] || '').includes(x)));
ok('⭐⭐⭐ Γ.6 · η κεντρική σύνθεση («ΕΞΑΙΤΙΑΣ», όχι «παρά») ζωγραφίζεται ΡΗΤΑ',
   (G6D.painted['panel-diagram'] || '').includes('το ακριβέστερο δεν είναι «παρά» αλλά «ΕΞΑΙΤΙΑΣ»')
   && (G6D.painted['panel-diagram'] || '').includes('Η σύνδεση είναι <b>ΔΙΚΗ ΣΟΥ</b>'));
ok('⭐⭐ Γ.6 · και τα ΤΡΙΑ πρόσημα του κοσμοπολιτισμού, με τις ενότητές τους',
   ['Γ.3 — ΠΛΟΥΤΟΣ', 'Γ.6 — ΘΕΤΙΚΟ ΠΟΥ ΕΦΥΓΕ', 'Ε.2 — ΠΡΟΣΟΝ']
     .every(x => (G6D.painted['panel-diagram'] || '').includes(x))
   && (G6D.painted['panel-diagram'] || '').includes('ΜΕΤΑΚΟΜΙΣΕ'));
ok('⛔ Γ.6 · το τυπογραφικό εξηγείται ΜΕΣΑ στο σχεδιάγραμμα, με την απόδειξή του',
   (G6D.painted['panel-diagram'] || '').includes('ΑΝΩ ΤΕΛΕΙΑ')
   && (G6D.painted['panel-diagram'] || '').includes('αστικοποίησή της'));
ok('⭐⭐ Γ.6 · και η μέτρηση «μηδέν γεγονότα» ζωγραφίζεται ως εύρημα',
   (G6D.painted['panel-diagram'] || '').includes('ΜΗΔΕΝ ΓΕΓΟΝΟΤΑ')
   && (G6D.painted['panel-diagram'] || '').includes('είναι ο <b>ΟΡΙΣΜΟΣ</b> της περιόδου'));
ok('⭐ Γ.6 · ο τίτλος της μπαίνει στο hero',
   (G6D.painted.hero || '').includes('Η ελληνική οικονομία κατά την περίοδο του μεσοπολέμου'));
const G6S = boot('#/k1-g6/sources');
ok('⭐⭐⭐ Γ.6 · οι «Πηγές» δίνουν ΔΥΟ αυθεντικές μαρτυρίες προσφύγων, με την έκδοσή τους',
   (G6S.painted['panel-sources'] || '').includes('Κέντρου Μικρασιατικών Σπουδών')
   && (G6S.painted['panel-sources'] || '').includes('καλούτσικα περνάμε εδώ')
   && (G6S.painted['panel-sources'] || '').includes('Άλλος ζητιάνευε'));
ok('  ⚠️ …και δηλώνεται ΡΗΤΑ ότι η Γ.6 παραλείπει την τριβή με τους γηγενείς',
   (G6S.painted['panel-sources'] || '').includes('που η ενότητα δεν αναφέρει καθόλου')
   && (G6S.painted['panel-sources'] || '').includes('αγροφύλακες'));
ok('  ⭐⭐ τον ΠΙΝΑΚΑ 1 ως τον ΧΑΡΤΗ του κοσμοπολιτισμού, με το σύνολό του',
   (G6S.painted['panel-sources'] || '').includes('1.221.849')
   && (G6S.painted['panel-sources'] || '').includes('1.104.216')
   && (G6S.painted['panel-sources'] || '').includes('90,4%'));
ok('  ⚠️ …με δηλωμένο ότι ΔΕΝ είναι το «1.230.000» της Γ.5',
   (G6S.painted['panel-sources'] || '').includes('ΔΕΝ είναι το ίδιο μέγεθος'));
ok('  ⭐⭐⭐ και τη ΔΙΑΦΩΝΙΑ τριών ενοτήτων από δύο κεφάλαια',
   ['ισχυρή ελληνική οικονομική παρουσία', 'κοσμοπολίτικος χαρακτήρας της ζωής τους',
    'επιχειρηματικό πνεύμα'].every(x => (G6S.painted['panel-sources'] || '').includes(x)));
ok('  ⚠️ …δηλωμένη ΡΗΤΑ ως διαφορά ερωτήματος, όχι ως αντίφαση',
   (G6S.painted['panel-sources'] || '').includes('ΔΕΝ ΕΙΝΑΙ ΑΝΤΙΦΑΣΗ, ΚΑΙ ΕΙΝΑΙ ΛΑΘΟΣ ΝΑ ΤΗ ΓΡΑΨΕΙΣ ΕΤΣΙ'));

const G6 = CHAPTERS.find(c => c.id === 'k1-g6');
if (G6) {
  const f6 = G6.paragraphs.join('\n');
  /* ⛔⛔ ΤΟ ΤΥΠΟΓΡΑΦΙΚΟ ΠΟΥ ΤΟ ΕΡΓΑΛΕΙΟ ΕΧΑΣΕ */
  is('⛔⛔ Γ.6 · ΕΝΑ τυπογραφικό, δηλωμένο — και το εργαλείο είχε πει «κανένα»', G6.sic.length, 1);
  ok('  ⭐ και είναι το «αστικοποίηση της», που ακολουθείται από ΑΝΩ ΤΕΛΕΙΑ',
     f6.includes('την αστικοποίηση της: το 1/3') && G6.sic[0].m === 'αστικοποίηση της');
  ok('  ⭐⭐ η απόδειξη ζει στην ΙΔΙΑ πρόταση: παράλληλο κτητικό «αγροτική ΤΗΣ μεταρρύθμιση»',
     f6.includes('την αγροτική της μεταρρύθμιση'));
  ok('  ⛔ και η διόρθωση ΔΕΝ μπήκε στο κείμενο', !f6.includes('αστικοποίησή της'));
  ok('  …και η σελίδα το εξηγεί στον μαθητή αντί να το σβήσει σιωπηλά',
     JSON.stringify(G6.facts).includes('το εργαλείο είπε «κανένα»'));
  /* ⛔⛔ ΤΟ ΧΡΟΝΟΛΟΓΙΟ ΕΙΝΑΙ ΚΑΘΑΡΑ ΤΟΥ ΚΕΙΜΕΝΟΥ — ΚΑΙ ΕΙΝΑΙ ΟΡΙΑ, ΟΧΙ ΓΕΓΟΝΟΤΑ */
  is('⭐ Γ.6 · ΔΥΟ book:true, και είναι τα δύο άκρα του μεσοπολέμου',
     G6.timeline.events.filter(e => e.book).map(e => e.label).join(','), '1919,1939');
  is('  ⭐⭐ και το κείμενο δεν γράφει ΚΑΜΙΑ άλλη χρονολογία',
     [...new Set((f6.match(/\b1\d{3}\b/g) || []))].sort().join(','), '1919,1939');
  ok('  ⭐⭐⭐ …και ΚΑΙ ΟΙ ΔΥΟ ζουν μέσα στην ίδια παρένθεση — είναι ΟΡΙΣΜΟΣ, όχι γεγονός',
     f6.includes('(1919-1939)')
     && (f6.match(/1919/g) || []).length === 1 && (f6.match(/1939/g) || []).length === 1);
  ok('  …και όσα «Πλαίσιο» φέρνουν χρονολογία άλλης ενότητας το ΔΗΛΩΝΟΥΝ',
     G6.timeline.events.filter(e => !e.book).every(e => !!e.note));
  ok('  ⭐ και η σειρά που ζωγραφίζεται είναι ΧΡΟΝΟΛΟΓΙΚΗ — ο renderer ΔΕΝ ταξινομεί',
     G6.timeline.events.map(e => +String(e.label).slice(0, 4)).every((y, i, a) => i === 0 || a[i - 1] <= y));
  ok('⛔ Γ.6 · καμία χρονολογία των ΠΗΓΩΝ δεν μπήκε στο χρονολόγιο (π.χ. το 1925 της μαρτυρίας)',
     !G6.timeline.events.some(e => /\b(1925|1920)\b/.test(String(e.label))));
  /* ⭐⭐ ΜΕΤΡΗΘΗΚΕ, ΔΕΝ ΕΚΤΙΜΗΘΗΚΕ */
  is('⭐⭐ Γ.6 · ΠΕΝΤΕ ομάδες ψηφίων, ούτε μία παραπάνω',
     (f6.match(/\d+/g) || []).join(','), '1919,1939,7,1,3');
  is('  ⭐ δύο χρονολογίες, ένα ποσοστό και ένα κλάσμα',
     (f6.match(/\d+%/g) || []).join(',') + ' | ' + ((f6.match(/\d\/\d/g) || []).join(',')), '7% | 1/3');
  /* ⭐⭐⭐ Ο ΕΛΕΓΧΟΣ ΜΕΓΕΘΟΥΣ ΜΕΤΑΚΟΜΙΣΕ ΣΤΟ ΤΕΛΟΣ ΤΟΥ ΤΜΗΜΑΤΟΣ 9:
     αφορά ΟΛΟ το corpus, όχι μία ενότητα, και η Γ.7 τον ακύρωσε. */
  /* ⛔⛔⛔ ΣΤΑΘ. 42, ΞΑΝΑ, ΚΑΙ ΜΕ ΤΟΝ ΧΕΙΡΟΤΕΡΟ ΤΡΟΠΟ: ΤΟ \b ΕΙΝΑΙ ΤΥΦΛΟ ΣΤΑ
     ΕΛΛΗΝΙΚΑ. Η πρώτη γραφή αυτού του ελέγχου σάρωνε με /\b(μπορούμε|…)\b/ και
     γύριζε ΑΔΕΙΑ ΓΙΑ ΟΛΕΣ ΤΙΣ ΕΝΟΤΗΤΕΣ — δηλαδή ο «σαρωτής» δεν είχε βρει
     ΤΙΠΟΤΑ, ούτε καν στη Γ.6, και πάνω σε αυτό το τίποτα είχε γραφτεί ο
     ισχυρισμός «η ΜΟΝΗ ενότητα». Με σωστά όρια λέξης οι ενότητες είναι ΔΥΟ:
     η Β.4 («μπορούμε να εντάξουμε και τις αλυκές») και η Γ.6.
     ⭐ Ο ισχυρισμός ξαναγράφτηκε μετρημένος και ΔΕΝ είναι πια «μοναδικότητα»:
     η Γ.6 είναι η μόνη που το κάνει ΔΥΟ φορές, και η μόνη όπου το πρώτο
     πληθυντικό ΚΡΙΝΕΙ αντί να ταξινομεί. */
  const GR = '[Α-Ωα-ωΆ-ώ]';
  const FP = new RegExp('(^|[^' + GR.slice(1, -1) + '])(μπορούμε|μπορούσαμε|θεωρούμε|βλέπουμε|λέμε|ονομάζουμε|διαπιστώνουμε|παρατηρούμε|προσθέσουμε|εντάξουμε|πούμε|δούμε)([^' + GR.slice(1, -1) + ']|$)');
  ok('⛔ ο σαρωτής α΄ πληθυντικού ΔΕΝ γυρίζει άδειος (το \\b ήταν τυφλό και το έκανε)',
     CHAPTERS.some(c => FP.test(c.paragraphs.join('\n'))));
  is('⭐⭐⭐ α΄ πληθυντικό: ΔΥΟ ενότητες σε όλο το corpus, μετρημένες — όχι μία',
     CHAPTERS.filter(c => FP.test(c.paragraphs.join('\n'))).map(c => c.id).sort().join(','), 'k1-b4,k1-g6');
  ok('  ⭐ και μόνο η Γ.6 το κάνει ΔΥΟ φορές, με τα δικά της λόγια',
     f6.includes('Με λίγα λόγια') && f6.includes('θα μπορούσαμε να προσθέσουμε'));
  ok('  ⭐⭐ …και η σελίδα δηλώνει ΚΑΙ ΤΗ Β.4 ΚΑΙ τη διαφορά ΤΑΞΙΝΟΜΕΙ/ΚΡΙΝΕΙ',
     JSON.stringify(G6.facts).includes('Β.4') && JSON.stringify(G6.facts).includes('ΤΑΞΙΝΟΜΕΙ')
     && JSON.stringify(G6.explain.pitfalls).includes('ΘΑ ΜΠΟΡΟΥΣΑΜΕ ΝΑ ΠΡΟΣΘΕΣΟΥΜΕ'));
  ok('  ⚠️ …και ομολογεί ΡΗΤΑ ότι ο πρώτος ισχυρισμός ήταν λάθος',
     JSON.stringify(G6.facts).includes('ΗΤΑΝ ΛΑΘΟΣ'));
  /* ⚠️⚠️ ΤΟ 7% ΚΑΙ ΤΟ 6% ΔΕΝ ΕΙΝΑΙ ΤΟ ΙΔΙΟ ΜΕΓΕΘΟΣ */
  ok('⚠️⚠️ Γ.6 · η σελίδα ΞΕΧΩΡΙΖΕΙ ρητά το 7% της ενότητας από το 6% του 3ου κεφαλαίου',
     G6.explain.pitfalls.some(p => p.ok.includes('ΔΕΝ είναι το ίδιο μέγεθος'))
     && JSON.stringify(G6.facts).includes('μη Έλληνες ορθόδοξους'));
  /* ⭐ ΟΙ ΠΙΟ ΣΥΧΝΕΣ ΠΑΓΙΔΕΣ ΕΧΟΥΝ ΔΙΚΗ ΤΟΥΣ ΕΓΓΡΑΦΗ */
  ok('⭐ Γ.6 · η παγίδα «η ενότητα αφηγείται τον μεσοπόλεμο» απαντιέται ΡΗΤΑ',
     G6.explain.pitfalls.some(p => p.ok.includes('δεν έχει ΟΥΤΕ ΕΝΑ γεγονός')));
  ok('⭐ Γ.6 · και η παγίδα «η Γ.6 είναι η συνέχεια της Γ.5»',
     G6.explain.pitfalls.some(p => p.ok.includes('ΕΠΙΚΑΛΥΠΤΟΝΤΑΙ')));
  ok('⭐⭐ Γ.6 · το «παρά» γίνεται ρητή ΕΝΝΟΙΑ, με τα πέντε πλεονεκτήματα ένα-ένα',
     G6.explain.concepts.some(c => c.t.includes('ΠΑΡΑΠΛΑΝΗΤΙΚΗ')));
  ok('⭐⭐ Γ.6 · και ο «κοσμοπολιτισμός» ορίζεται ως ΟΙΚΟΝΟΜΙΚΟ γεγονός, όχι ως κοσμοθεωρία',
     G6.explain.concepts.some(c => c.b.includes('ΟΙΚΟΝΟΜΙΚΟ ΓΕΓΟΝΟΣ') && c.b.includes('δευτερεύον πεδίο')));
}


/* ── Γ.7 «Οι μεγάλες επενδύσεις» (als-v568) ───────────────────────────
   ⭐⭐⭐ Η ΝΕΑ ΜΙΚΡΟΤΕΡΗ ΕΝΟΤΗΤΑ ΤΟΥ CORPUS (1.138 χαρακτήρες) — και
   ακύρωσε τον ισχυρισμό της Γ.6 την επόμενη κιόλας μέρα. Το κεντρικό της
   εύρημα είναι ΑΔΗΛΩΤΟ στο βιβλίο: τρεις εθνικότητες σε τέσσερις γραμμές
   και ΚΑΜΙΑ ελληνική εταιρεία.
   ⭐⭐ Το `sic: []` εδώ έχει ΑΛΛΗ αιτιολόγηση από της Γ.6: δεν υπάρχει
   ούτε ένα κτητικό εγκλιτικό, άρα το μοτίβο δεν είχε καν ευκαιρία. */
['explain', 'diagram', 'timeline', 'glossary', 'facts', 'text', 'sources'].forEach(id => {
  const r = boot('#/k1-g7/' + id);
  is('Γ.7 · η καρτέλα «' + id + '» ζωγραφίζει χωρίς σφάλμα', r.error || 'NONE', 'NONE');
});
const G7D = boot('#/k1-g7/diagram');
ok('⭐ Γ.7 · το σχεδιάγραμμα ζωγραφίζει και τα ΠΕΝΤΕ στάδιά της',
   ['Η αιτία: η πίεση, όχι η ανάπτυξη',
    'Τέσσερα δίκτυα — και ποιος έχτισε το καθένα',
    'Γιατί όλες οι εταιρείες είναι ξένες — τρεις φράσεις από τρεις ενότητες',
    'Η δεύτερη παράγραφος: μία πρόταση για ολόκληρη την υπόλοιπη Ελλάδα',
    'Ενενήντα πέντε χρόνια νωρίτερα, η ίδια φιλοδοξία είχε αποτύχει']
     .every(x => (G7D.painted['panel-diagram'] || '').includes(x)));
ok('⭐⭐ Γ.7 · και τα ΤΕΣΣΕΡΑ δίκτυα ζωγραφίζονται χωριστά, με τον κατασκευαστή τους',
   ['ΝΕΡΟ', 'ΕΝΕΡΓΕΙΑ', 'ΜΕΤΑΦΟΡΕΣ', 'ΕΠΙΚΟΙΝΩΝΙΕΣ']
     .every(x => (G7D.painted['panel-diagram'] || '').includes(x))
   && ['ΟΥΛΕΝ', 'ΠΑΟΥΕΡ', 'Γερμανικές εταιρείες']
     .every(x => (G7D.painted['panel-diagram'] || '').includes(x)));
ok('⭐⭐⭐ Γ.7 · το κεντρικό εύρημα ζωγραφίζεται ΡΗΤΑ, με δηλωμένο ότι είναι δική του ανάγνωση',
   (G7D.painted['panel-diagram'] || '').includes('ΚΑΜΙΑ ΕΛΛΗΝΙΚΗ ΕΤΑΙΡΕΙΑ')
   && (G7D.painted['panel-diagram'] || '').includes('η παρατήρηση είναι <b>δική σου</b>'));
ok('⭐⭐ Γ.7 · και οι ΤΡΕΙΣ φράσεις που το εξηγούν, με τις ενότητές τους',
   ['Β.7 — ΤΟ ΚΙΝΗΤΡΟ', 'Β.6 — Η ΙΚΑΝΟΤΗΤΑ', 'Β.10 — Η ΑΞΙΟΠΙΣΤΙΑ']
     .every(x => (G7D.painted['panel-diagram'] || '').includes(x)));
ok('⭐⭐⭐ Γ.7 · η εικόνα του ρωμαϊκού υδραγωγείου, με την απόσταση ΚΑΙ την επιφύλαξη',
   (G7D.painted['panel-diagram'] || '').includes('περίπου δεκαοκτώ αιώνες')
   && (G7D.painted['panel-diagram'] || '').includes('δεν δίνει χρονολογία'));
ok('⚠️ Γ.7 · και η μέτρηση 979/158 ζωγραφίζεται ως ΠΙΝΑΚΑΣ, με το όριο της ανάγνωσης',
   (G7D.painted['panel-diagram'] || '').includes('979 χαρ.')
   && (G7D.painted['panel-diagram'] || '').includes('158 χαρ.')
   && (G7D.painted['panel-diagram'] || '').includes('η <b>ανάγνωση</b> είναι δική σου'));
ok('⭐ Γ.7 · ο τίτλος της μπαίνει στο hero', (G7D.painted.hero || '').includes('Οι μεγάλες επενδύσεις'));
const G7S = boot('#/k1-g7/sources');
ok('⭐⭐⭐ Γ.7 · οι «Πηγές» δίνουν το ΠΡΙΝ και το ΜΕΤΑ με δύο μαρτυρίες προσφύγων',
   (G7S.painted['panel-sources'] || '').includes('ένας αέρας και τις παίρνει τις παράγκες')
   && (G7S.painted['panel-sources'] || '').includes('Τη νύχτα θα κλειδώνουμε την πόρτα'));
ok('  ⚠️ …με ΚΑΙ ΤΑ ΤΡΙΑ όριά τους δηλωμένα',
   (G7S.painted['panel-sources'] || '').includes('ΔΕΝ αφορά την Αθήνα')
   && (G7S.painted['panel-sources'] || '').includes('μιλούν για ΣΤΕΓΗ')
   && (G7S.painted['panel-sources'] || '').includes('δείχνουν και δεν αποδεικνύουν'));
ok('  ⭐ …και δηλώνεται ότι η ΙΔΙΑ σειρά πηγών χρησιμοποιήθηκε στη Γ.6 για ΑΛΛΟ ερώτημα',
   (G7S.painted['panel-sources'] || '').includes('χρησιμοποιήθηκε και στη Γ.6'));
ok('  ⭐⭐ τον ΠΙΝΑΚΑ 3 με τον Πειραιά στο 40% — ΚΑΙ με το ότι η Αθήνα ΛΕΙΠΕΙ',
   (G7S.painted['panel-sources'] || '').includes('Πειραιάς 40%')
   && (G7S.painted['panel-sources'] || '').includes('Η ΑΘΗΝΑ ΔΕΝ ΕΙΝΑΙ ΣΤΗ ΔΕΚΑΔΑ')
   && (G7S.painted['panel-sources'] || '').includes('τον ΠΛΑΙΣΙΩΝΕΙ'));
ok('  ⭐⭐⭐ και την ΤΡΙΒΗ με τη Β.7, με τη λέξη «υδραγωγεία» μέσα στη λίστα του 1830',
   ['υδραγωγεία', 'αδυναμία εξεύρεσης των αναγκαίων οικονομικών πόρων',
    'η έλλειψη του ιδιωτικού ενδιαφέροντος ήταν δεδομένη',
    'υπερβολικά αισιόδοξη γαλλική τεχνική εταιρεία']
     .every(x => (G7S.painted['panel-sources'] || '').includes(x)));
ok('  ⚠️ …και το «τι ΔΕΝ άλλαξε» δηλώνεται ρητά',
   (G7S.painted['panel-sources'] || '').includes('ΞΕΝΟ και τις δύο φορές'));

const G7 = CHAPTERS.find(c => c.id === 'k1-g7');
if (G7) {
  const f7 = G7.paragraphs.join('\n');
  /* ⛔⛔ ΤΟ ΧΡΟΝΟΛΟΓΙΟ ΕΙΝΑΙ ΚΑΘΑΡΑ ΤΟΥ ΚΕΙΜΕΝΟΥ */
  is('⭐ Γ.7 · ΕΝΑ book:true, και είναι το 1925 της ΟΥΛΕΝ',
     G7.timeline.events.filter(e => e.book).map(e => e.label).join(','), '1925');
  is('  ⭐⭐ και το κείμενο δεν γράφει ΚΑΜΙΑ άλλη χρονολογία',
     [...new Set((f7.match(/\b1\d{3}\b/g) || []))].sort().join(','), '1925');
  ok('  ⛔ η ΠΑΟΥΕΡ ΔΕΝ πήρε χρονολογία — το βιβλίο γράφει «την ίδια περίπου εποχή»',
     f7.includes('Την ίδια περίπου εποχή')
     && !G7.timeline.events.some(e => /ΠΑΟΥΕΡ/.test(String(e.title)) && e.book));
  ok('  …και όσα «Πλαίσιο» φέρνουν χρονολογία άλλης ενότητας το ΔΗΛΩΝΟΥΝ',
     G7.timeline.events.filter(e => !e.book).every(e => !!e.note));
  ok('  ⭐ και η σειρά που ζωγραφίζεται είναι ΧΡΟΝΟΛΟΓΙΚΗ — ο renderer ΔΕΝ ταξινομεί',
     G7.timeline.events.map(e => +String(e.label).slice(0, 4)).every((y, i, a) => i === 0 || a[i - 1] <= y));
  ok('⛔ Γ.7 · καμία χρονολογία ΠΗΓΗΣ στο χρονολόγιο (ούτε το 1928 του πίνακα, ούτε το 1922 της μαρτυρίας ως γεγονός της)',
     !G7.timeline.events.some(e => String(e.label) === '1928'));
  /* ⭐⭐ ΜΕΤΡΗΘΗΚΕ, ΔΕΝ ΕΚΤΙΜΗΘΗΚΕ */
  is('⭐⭐ Γ.7 · ΔΥΟ ομάδες ψηφίων σε ολόκληρη την ενότητα: ένα μέγεθος και μία χρονολογία',
     (f7.match(/[\d.]*\d/g) || []).join(','), '1.000.000,1925');
  /* ⭐⭐⭐ ΤΟ ΚΕΝΤΡΙΚΟ ΕΥΡΗΜΑ, ΒΓΑΛΜΕΝΟ ΑΠΟ ΤΟ ΥΛΙΚΟ */
  is('⭐⭐⭐ Γ.7 · ΤΡΕΙΣ εθνικότητες εταιρειών, μετρημένες στο κείμενο',
     (f7.match(/αμερικανική|βρετανική|γερμανικές/g) || []).sort().join(','),
     'αμερικανική,βρετανική,γερμανικές');
  is('  ⛔ και ΚΑΜΙΑ ελληνική εταιρεία — ούτε η λέξη «ελληνικ» δίπλα σε «εταιρεία»',
     (f7.match(/ελληνικ\w*\s+εταιρ\w*/g) || []).join(','), '');
  ok('  …και η σελίδα το δηλώνει ως ΔΙΚΗ ΤΟΥ ανάγνωση, όχι ως θέση του βιβλίου',
     JSON.stringify(G7.facts).includes('Το βιβλίο ΔΕΝ το σχολιάζει καθόλου'));
  /* ⭐⭐ Η ΑΝΙΣΟΤΗΤΑ ΤΩΝ ΠΑΡΑΓΡΑΦΩΝ — ΤΑ ΝΟΥΜΕΡΑ ΤΗΣ ΣΕΛΙΔΑΣ ΕΙΝΑΙ ΑΛΗΘΙΝΑ */
  ok('⭐⭐ Γ.7 · τα νούμερα 979/158 που γράφει η σελίδα συμφωνούν με τη ΜΕΤΡΗΣΗ',
     G7.paragraphs[0].length === 979 && G7.paragraphs[1].length === 158
     && JSON.stringify(G7.facts).includes('979') && JSON.stringify(G7.facts).includes('158'));
  /* ⭐⭐ ΤΟ `sic: []` ΜΕ ΤΗ ΔΙΚΗ ΤΟΥ ΑΙΤΙΟΛΟΓΗΣΗ */
  is('⭐⭐ Γ.7 · ΚΑΝΕΝΑ τυπογραφικό', G7.sic.length, 0);
  ok('  ⭐ και ο λόγος είναι ΑΛΛΟΣ από της Γ.6: δεν υπάρχει ούτε ένα κτητικό εγκλιτικό',
     JSON.stringify(G7.facts).includes('ΟΥΤΕ ΕΝΑ κτητικό εγκλιτικό'));
  ok('  ⚠️ …και η συντακτική χαλαρότητα «το 1.000.000 κατοίκους» ΔΗΛΩΝΕΤΑΙ, χωρίς να μπει στο sic',
     f7.includes('το 1.000.000 κατοίκους')
     && JSON.stringify(G7.facts).includes('ΔΕΝ το δηλώνω ως τυπογραφικό'));
  /* ⭐ ΟΙ ΠΙΟ ΣΥΧΝΕΣ ΠΑΓΙΔΕΣ */
  ok('⭐ Γ.7 · η παγίδα «τα έργα τα έκανε το ελληνικό κράτος» απαντιέται ΡΗΤΑ',
     G7.explain.pitfalls.some(p => p.no.includes('από το ελληνικό κράτος')));
  ok('⭐ Γ.7 · και η παγίδα «η ΠΑΟΥΕΡ έκανε δύο άσχετα έργα»',
     G7.explain.pitfalls.some(p => p.ok.includes('Είναι το ΙΔΙΟ έργο')));
  ok('⭐⭐ Γ.7 · η υποδομή γίνεται ρητή ΕΝΝΟΙΑ, με το γιατί θέλει μεγάλο κεφάλαιο',
     G7.explain.concepts.some(c => c.b.includes('Είναι ΔΙΚΤΥΟ')));
}

/* ⭐⭐⭐ Ο ΕΛΕΓΧΟΣ ΚΑΤΑΤΑΞΗΣ ΜΕΓΕΘΟΥΣ ΑΠΟΣΥΡΘΗΚΕ ΣΤΗΝ als-v569.
   Σάπισε ΤΡΕΙΣ φορές σε ΤΡΕΙΣ μέρες (Γ.6 → Γ.7 → Γ.8). Ο αναλλοίωτος
   έλεγχος ζει τώρα στο τέλος του μπλοκ της Γ.8: κάθε ενότητα γράφει
   ΜΟΝΟ το δικό της μέγεθος, και κανένας υπερθετικός δεν επιβιώνει. */


/* ── Γ.8 «Η Τράπεζα της Ελλάδος» (als-v569) ───────────────────────────
   ⭐⭐⭐ Η ΕΝΟΤΗΤΑ ΠΟΥ ΑΠΟΔΕΙΚΝΥΕΙ ΤΟ ΛΑΘΟΣ ΤΗΣ Γ.6: εδώ το βιβλίο γράφει
   «αποθέματά της» ΜΕ τον δεύτερο τόνο, ενώ στη Γ.6 έγραψε «αστικοποίηση
   της» χωρίς αυτόν. Ίδια κατασκευή, δύο γραφές — άρα λάθος, όχι στιλ.
   ⭐⭐ Και η καθαρότερη απόδειξη είναι στη Β.5, ΜΕΣΑ ΣΤΗΝ ΙΔΙΑ ΠΑΡΑΓΡΑΦΟ:
   «δραστηριότητά της» (σωστό) δίπλα σε «δυνατότητα της» (λάθος).
   ⛔ Ο έλεγχος γράφεται σε CODEPOINTS, όχι σε γράμματα (σταθ.: OXIA). */
['explain', 'diagram', 'timeline', 'glossary', 'facts', 'text', 'sources'].forEach(id => {
  const r = boot('#/k1-g8/' + id);
  is('Γ.8 · η καρτέλα «' + id + '» ζωγραφίζει χωρίς σφάλμα', r.error || 'NONE', 'NONE');
});
const G8D = boot('#/k1-g8/diagram');
ok('⭐ Γ.8 · το σχεδιάγραμμα ζωγραφίζει και τα ΠΕΝΤΕ στάδιά της',
   ['Η αφορμή είναι ξένη — και είναι η πρώτη λέξη της ενότητας',
    'Δύο δυνάμεις σε μία φράση: μια ελληνική ενάντια, μια ξένη υπέρ',
    'Ο μηχανισμός της σταθερότητας — δοσμένος ολόκληρος, χωρίς το τίμημά του',
    'Η αλυσίδα των συνεπειών: πέντε κρίκοι σε μία πρόταση',
    'Η τελευταία πρόταση παίρνει όλα τα προηγούμενα πίσω']
     .every(x => (G8D.painted['panel-diagram'] || '').includes(x)));
ok('⭐⭐ Γ.8 · και οι ΤΡΕΙΣ αρμοδιότητες ζωγραφίζονται χωριστά, αριθμημένες',
   ['Αρμοδιότητα 1', 'Αρμοδιότητα 2', 'Αρμοδιότητα 3']
     .every(x => (G8D.painted['panel-diagram'] || '').includes(x))
   && (G8D.painted['panel-diagram'] || '').includes('καμία δεν είναι «να δανείζει»'));
ok('⭐⭐⭐ Γ.8 · ο ΜΗΧΑΝΙΣΜΟΣ του κανόνα χρυσού ζωγραφίζεται ως αλυσίδα τεσσάρων βημάτων',
   ['Βήμα 1', 'Βήμα 2', 'Βήμα 3', 'ΜΕΤΑΤΡΕΨΙΜΟΤΗΤΑ']
     .every(x => (G8D.painted['panel-diagram'] || '').includes(x)));
ok('  ⚠️ …και το ΤΙΜΗΜΑ δηλώνεται ρητά ως κάτι που το βιβλίο ΔΕΝ γράφει',
   (G8D.painted['panel-diagram'] || '').includes('ΤΟ ΒΙΒΛΙΟ ΔΕΝ ΤΟ ΓΡΑΦΕΙ ΠΟΥΘΕΝΑ')
   && (G8D.painted['panel-diagram'] || '').includes('δεν είναι δώρο'));
ok('⛔⛔ Γ.8 · η σύγκρουση με την Εθνική εξηγείται ΜΕΣΑ στο σχεδιάγραμμα, με τη φράση της Β.5',
   (G8D.painted['panel-diagram'] || '').includes('ΚΥΡΙΑ ΠΗΓΗ ΕΣΟΔΩΝ ΤΗΣ')
   && (G8D.painted['panel-diagram'] || '').includes('ΕΚΔΟΤΙΚΟ ΔΙΚΑΙΩΜΑ')
   && (G8D.painted['panel-diagram'] || '').includes('δεν ήταν ιδεολογική'));
ok('⭐⭐⭐ Γ.8 · και ο πίνακας του τόνου, με τις τρεις γραφές δίπλα-δίπλα',
   ['αποθέματά της', 'αστικοποίηση της', 'δραστηριότητά της', 'δυνατότητα της']
     .every(x => (G8D.painted['panel-diagram'] || '').includes(x))
   && (G8D.painted['panel-diagram'] || '').includes('U+03AC'));
ok('⭐ Γ.8 · ο τίτλος της μπαίνει στο hero', (G8D.painted.hero || '').includes('Η Τράπεζα της Ελλάδος'));
const G8S = boot('#/k1-g8/sources');
ok('⭐⭐ Γ.8 · οι «Πηγές» δίνουν το Σύνταγμα του 1927 — ΚΑΙ το όριό του',
   (G8S.painted['panel-sources'] || '').includes('Το Ελληνικόν Κράτος είναι Δημοκρατία')
   && (G8S.painted['panel-sources'] || '').includes('ΔΕΝ ΛΕΕΙ ΟΥΤΕ ΛΕΞΗ ΓΙΑ ΤΡΑΠΕΖΑ'));
ok('  ⭐⭐⭐ …και καλύπτουν το κενό της Γ.8 για τις «πρωτοβουλίες» 1928-1932',
   (G8S.painted['panel-sources'] || '').includes('οικονομική ανόρθωση της χώρας, την παιδεία και την εξωτερική πολιτική')
   && (G8S.painted['panel-sources'] || '').includes('υπέστησαν μεγάλες απώλειες'));
ok('  ⭐ τον ΠΙΝΑΚΑ 6 για «τα χρέη» — με το όριο των 35 ετών δηλωμένο',
   (G8S.painted['panel-sources'] || '').includes('818.500.000')
   && (G8S.painted['panel-sources'] || '').includes('ΤΡΙΑΝΤΑ ΠΕΝΤΕ ΧΡΟΝΙΑ')
   && (G8S.painted['panel-sources'] || '').includes('ΜΗΝ γράψεις ότι το 818.500.000'));
ok('  ⭐⭐⭐ και την ΤΡΙΒΗ με τη Β.5, που εξηγεί το μόνο αδικαιολόγητο της ενότητας',
   ['το εκδοτικό δικαίωμα', 'κυρίαρχο τραπεζικό συγκρότημα', 'κυρίως από το εξωτερικό']
     .every(x => (G8S.painted['panel-sources'] || '').includes(x))
   && (G8S.painted['panel-sources'] || '').includes('ΣΥΓΚΡΟΥΣΗ ΣΥΜΦΕΡΟΝΤΩΝ'));

const G8 = CHAPTERS.find(c => c.id === 'k1-g8');
if (G8) {
  const f8 = G8.paragraphs.join('\n');
  /* ⭐⭐⭐ Ο ΤΟΝΟΣ, ΕΛΕΓΜΕΝΟΣ ΣΕ CODEPOINTS — ΟΧΙ ΣΕ ΓΡΑΜΜΑΤΑ */
  /* ⛔⛔ ΣΤΑΘ.: ΓΡΑΨΕ CODEPOINTS, ΟΧΙ ΓΡΑΜΜΑΤΑ — ΚΑΙ ΜΕΤΑ ΕΛΕΓΞΕ ΠΟΙΟ ΓΡΑΜΜΑ
     ΕΙΝΑΙ ΤΟΝΙΣΜΕΝΟ. Η πρώτη γραφή αυτού του ελέγχου έψαχνε «αστικοποάηση»
     επειδή υπέθεσα ότι ο τόνος πέφτει στο «α». Πέφτει στο «ι»: U+03AF. Το
     ίδιο και στη Β.5, όπου τα «δραστηριότητά»/«δυνατότητα» έχουν «ό» U+03CC. */
  const OXIA_E = String.fromCharCode(0x03AD);   // έ
  const OXIA_A = String.fromCharCode(0x03AC);   // ά
  const OXIA_I = String.fromCharCode(0x03AF);   // ί
  const OXIA_O = String.fromCharCode(0x03CC);   // ό
  is('⭐⭐⭐ Γ.8 · «αποθέματά της» γράφεται ΜΕ τον δεύτερο τόνο (codepoints)',
     f8.includes('αποθ' + OXIA_E + 'ματ' + OXIA_A + ' της'), true);
  ok('  ⛔ …και ΔΕΝ υπάρχει η άτονη μορφή «αποθέματα της»',
     !f8.includes('αποθ' + OXIA_E + 'ματα της'));
  ok('  ⭐ το δεύτερο εγκλιτικό της ενότητας είναι ΠΑΡΟΞΥΤΟΝΟ, άρα σωστά χωρίς τόνο',
     f8.includes('τη λειτουργίας της'.replace('ς της', ' της')));
  /* ⭐⭐ Η ΑΠΟΔΕΙΞΗ ΑΠΕΝΑΝΤΙ ΣΤΗ Γ.6 ΚΑΙ ΣΤΗ Β.5 — ΒΓΑΛΜΕΝΗ ΑΠΟ ΤΟ ΥΛΙΚΟ */
  const G6u = CHAPTERS.find(c => c.id === 'k1-g6');
  const B5u = CHAPTERS.find(c => c.id === 'k1-b5');
  ok('⭐⭐⭐ η Γ.6 έχει την ΙΔΙΑ κατασκευή ΧΩΡΙΣ τον τόνο — άρα λάθος, όχι στιλ',
     !!G6u && G6u.paragraphs.join('\n').includes('αστικοπο' + OXIA_I + 'ηση της')
     && G6u.sic.some(x => x.m === 'αστικοποίηση της'));
  ok('  ⭐⭐ και η Β.5 έχει ΚΑΙ ΤΙΣ ΔΥΟ ΓΡΑΦΕΣ ΜΕΣΑ ΣΤΗΝ ΙΔΙΑ ΠΑΡΑΓΡΑΦΟ',
     !!B5u && B5u.paragraphs.some(p => p.includes('δραστηρι' + OXIA_O + 'τητ' + OXIA_A + ' της')
                                    && p.includes('δυνατ' + OXIA_O + 'τητα της')));
  ok('  …και η σελίδα το δηλώνει στον μαθητή ως ΑΠΟΔΕΙΞΗ, όχι ως λεπτομέρεια',
     JSON.stringify(G8.facts).includes('αποδεικνύει ότι η Γ.6 είχε ΛΑΘΟΣ')
     || JSON.stringify(G8.facts).includes('ΔΕΝ πρόκειται για «στιλ του βιβλίου»'));
  /* ⛔⛔ ΤΟ ΧΡΟΝΟΛΟΓΙΟ ΕΙΝΑΙ ΚΑΘΑΡΑ ΤΟΥ ΚΕΙΜΕΝΟΥ */
  is('⭐ Γ.8 · τέσσερα book:true, και είναι ΟΛΕΣ οι χρονολογίες της',
     G8.timeline.events.filter(e => e.book).map(e => e.label).join(','), '1927,1928-1932,1929,1932');
  is('  ⭐ και ταυτίζονται με όσα γράφει το κείμενο',
     [...new Set((f8.match(/\b1\d{3}\b/g) || []))].sort().join(','), '1927,1928,1929,1932');
  ok('⛔⛔ Γ.8 · η ΕΝΑΡΞΗ ΛΕΙΤΟΥΡΓΙΑΣ ΔΕΝ πήρε δικό της γεγονός «1928»',
     f8.includes('ένα χρόνο αργότερα')
     && G8.timeline.events.filter(e => String(e.label) === '1928').length === 0);
  ok('  ⭐ και το 1928 υπάρχει στο κείμενο ΜΟΝΟ μέσα στο «(1928-1932)»',
     (f8.match(/1928/g) || []).length === 1 && f8.includes('(1928-1932)'));
  ok('  …και όσα «Πλαίσιο» φέρνουν χρονολογία άλλης ενότητας το ΔΗΛΩΝΟΥΝ',
     G8.timeline.events.filter(e => !e.book).every(e => !!e.note));
  ok('  ⭐ και η σειρά που ζωγραφίζεται είναι ΧΡΟΝΟΛΟΓΙΚΗ — ο renderer ΔΕΝ ταξινομεί',
     G8.timeline.events.map(e => +String(e.label).slice(0, 4)).every((y, i, a) => i === 0 || a[i - 1] <= y));
  /* ⭐⭐ ΜΕΤΡΗΘΗΚΕ */
  is('⭐⭐ Γ.8 · ΕΞΙ ομάδες ψηφίων, ούτε μία παραπάνω',
     (f8.match(/\d+/g) || []).join(','), '1927,1927,1928,1932,1932,1929');
  is('  ⭐ κανένα ποσό και κανένα ποσοστό σε ολόκληρη την ενότητα',
     (f8.match(/\d+%|\d+\.\d{3}/g) || []).join(','), '');
  is('  ⭐ ΜΙΑ παράγραφος, πέντε προτάσεις', G8.paragraphs.length, 1);
  /* ⭐⭐⭐ ΟΙ ΕΠΑΝΑΛΗΨΕΙΣ ΦΡΑΣΕΩΝ ΜΕ ΤΗ Β.10, ΜΕΤΡΗΜΕΝΕΣ ΣΤΟ ΥΛΙΚΟ */
  const B10u = CHAPTERS.find(c => c.id === 'k1-b10');
  ok('⭐⭐⭐ η φράση «πιστοληπτική ικανότητα του κράτους» υπάρχει ΚΑΙ στη Β.10 ΚΑΙ στη Γ.8',
     !!B10u && B10u.paragraphs.join('\n').includes('πιστοληπτική ικανότητα του κράτους')
     && f8.includes('πιστοληπτική ικανότητα του κράτους'));
  ok('  ⭐⭐ και το ρήμα «επέτρεψε» για τον Βενιζέλο, επίσης και στις δύο',
     !!B10u && /επέτρεψε/.test(B10u.paragraphs.join('\n')) && /επέτρεψε/.test(f8));
  /* ⭐ ΤΕΤΑΡΤΗ ΣΥΝΕΧΟΜΕΝΗ ΞΕΝΗ ΩΘΗΣΗ — ΒΓΑΛΜΕΝΗ ΑΠΟ ΤΟ ΥΛΙΚΟ */
  {
    const want = { 'k1-g1': 'κάτω από την πίεση του προσφυγικού προβλήματος',
                   'k1-g6': 'κάτω από το βάρος των πιέσεων',
                   'k1-g8': 'κάτω από την πίεση των ξένων συμβούλων' };
    const missing = Object.keys(want).filter(id => {
      const c = CHAPTERS.find(x => x.id === id);
      return !c || !c.paragraphs.join('\n').includes(want[id]);
    });
    is('⭐⭐⭐ και οι τρεις φράσεις «πίεσης» υπάρχουν αυτούσιες στις ενότητές τους',
       missing.join(',') || 'ΚΑΜΙΑ ΛΕΙΠΕΙ', 'ΚΑΜΙΑ ΛΕΙΠΕΙ');
    ok('  ⭐ και η Γ.7 συμπληρώνει το μοτίβο με τις τρεις ξένες εταιρείες',
       (CHAPTERS.find(x => x.id === 'k1-g7') || { paragraphs: [] }).paragraphs.join('\n')
         .match(/αμερικανική|βρετανική|γερμανικές/g).length === 3);
    ok('  …και η σελίδα το δηλώνει ως ΔΙΚΗ ΤΟΥ σύνθεση, όχι ως θέση του βιβλίου',
       JSON.stringify(G8.facts).includes('Η σύνδεση των τεσσάρων είναι ΔΙΚΗ σου'));
  }
  /* ⭐ ΟΙ ΠΙΟ ΣΥΧΝΕΣ ΠΑΓΙΔΕΣ */
  ok('⭐ Γ.8 · η παγίδα «ιδρύθηκε για να δανείζει» απαντιέται ΡΗΤΑ',
     G8.explain.pitfalls.some(p => p.no.includes('για να δανείζει τους Έλληνες')));
  ok('⭐ Γ.8 · και η παγίδα «άρχισε να λειτουργεί το 1927»',
     G8.explain.pitfalls.some(p => p.ok.includes('ΕΝΑ ΧΡΟΝΟ ΑΡΓΟΤΕΡΑ')));
  ok('⭐⭐ Γ.8 · και η παγίδα «η κρίση χτύπησε την Ελλάδα το 1929»',
     G8.explain.pitfalls.some(p => p.no.includes('Η κρίση χτύπησε την Ελλάδα το 1929')));
  ok('⭐⭐ Γ.8 · η «κεντρική τράπεζα» γίνεται ρητή ΕΝΝΟΙΑ, με το τι ΔΕΝ είναι',
     G8.explain.concepts.some(c => c.b.includes('δεν έχει πελάτες')));
  ok('⭐⭐ Γ.8 · και ο κανόνας χρυσού, με το τίμημά του δηλωμένο ως ΔΙΚΗ του παρατήρηση',
     G8.explain.concepts.some(c => c.b.includes('ΤΟ ΒΙΒΛΙΟ ΔΕΝ ΓΡΑΦΕΙ ΠΟΥΘΕΝΑ')));
}

/* ⭐⭐⭐ ΤΡΕΙΣ ΦΟΡΕΣ ΣΕ ΤΡΕΙΣ ΜΕΡΕΣ ΕΝΑΣ ΥΠΕΡΘΕΤΙΚΟΣ ΜΕΓΕΘΟΥΣ ΣΑΠΙΣΕ.
   Η Γ.6 είπε «η πιο μικρή ενότητα» (17/09) · η Γ.7 το ακύρωσε (18/09) ·
   η Γ.8 ξαναμοίρασε την κατάταξη την ίδια μέρα. Κάθε φορά ο φρουρός
   έσκαγε σωστά, και κάθε φορά ξαναγραφόταν το ίδιο είδος ισχυρισμού.
   ⛔ ΣΤΗΝ als-v569 Ο ΥΠΕΡΘΕΤΙΚΟΣ ΑΦΑΙΡΕΘΗΚΕ ΑΠΟ ΤΟ ΥΛΙΚΟ, ΟΧΙ ΑΠΟ ΤΟΝ
   ΦΡΟΥΡΟ: κάθε ενότητα γράφει ΜΟΝΟ το δικό της μέγεθος. Ο έλεγχος είναι
   πλέον ΑΝΑΛΛΟΙΩΤΟΣ — δεν εξαρτάται από το ποιος κρατάει τον τίτλο. */
{
  const dot = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const bad = [];
  CHAPTERS.filter(c => /^k1-/.test(c.id)).forEach(c => {
    const len = c.paragraphs.join('\n').length;
    const txt = JSON.stringify(c.facts || []);
    const claimed = [...txt.matchAll(/(\d\.\d{3}) χαρακτήρες σε \d+ παρ/g)].map(m => m[1]);
    claimed.forEach(x => { if (x !== dot(len)) bad.push(c.id + ' λέει ' + x + ' αλλά μετρήθηκε ' + dot(len)); });
  });
  is('⭐⭐⭐ κάθε ενότητα που γράφει το μέγεθός της, το γράφει ΣΩΣΤΑ', bad.join(' | '), '');
  ok('  ⭐ και υπάρχουν όντως τέτοιες μετρήσεις (ο σαρωτής δεν γύρισε άδειος)',
     CHAPTERS.some(c => /\d\.\d{3} χαρακτήρες σε \d+ παρ/.test(JSON.stringify(c.facts || []))));
  /* ⛔⛔ ΜΙΑ ΑΝΑΚΛΗΣΗ ΔΕΝ ΕΙΝΑΙ ΙΣΧΥΡΙΣΜΟΣ — ΚΑΙ Η ΛΙΣΤΑ ΔΕΙΚΤΩΝ ΕΙΝΑΙ Η ΤΡΥΠΑ.
     Η πρώτη γραφή έσκαγε πάνω στις ΙΔΙΕΣ τις ομολογίες («ΕΔΩ ΕΛΕΓΕ …»,
     «ΔΕΝ γράφω …»), δηλαδή τιμωρούσε ακριβώς τη διόρθωση. Η δεύτερη πρόσθεσε
     λίστα δεικτών ανάκλησης (ΕΛΕΓΕ|ΕΓΡΑΦΕ|…) και ΞΑΝΑΕΣΚΑΣΕ, γιατί η Γ.7
     χρησιμοποιεί «έσβησα» και «είπε». Μια λίστα εξαιρέσεων ΕΙΝΑΙ η τρύπα.
     ⭐ Ο ΑΝΑΛΛΟΙΩΤΟΣ ΚΑΝΟΝΑΣ ΕΙΝΑΙ ΤΥΠΟΓΡΑΦΙΚΟΣ, ΟΧΙ ΛΕΞΙΛΟΓΙΚΟΣ:
     ένας υπερθετικός ΜΕΣΑ σε «» ΑΝΑΦΕΡΕΤΑΙ· ένας υπερθετικός ΕΞΩ από «»
     ΙΣΧΥΡΙΖΕΤΑΙ. Αφαιρούμε κάθε φράση σε «» και ελέγχουμε ό,τι έμεινε. */
  const QUOTED = /«[^»]*»/g;
  const SUP = /(ΠΙΟ ΜΙΚΡΗ|πιο μικρή|μόνη μονοπαράγραφη|ΜΟΝΗ μονοπαράγραφη)/;
  const survivors = CHAPTERS.filter(c => SUP.test(JSON.stringify(c.facts || []).replace(QUOTED, '')));
  is('⛔⛔ κανένας ΕΝΕΡΓΟΣ υπερθετικός μεγέθους δεν επιβίωσε στη σελίδα',
     survivors.map(c => c.id).join(','), '');
  ok('  ⭐ και ο σαρωτής ΒΛΕΠΕΙ όντως τέτοιες φράσεις μέσα σε «» (δεν γύρισε άδειος)',
     CHAPTERS.some(c => SUP.test(JSON.stringify(c.facts || []))));
}


/* ── Γ.9 «Η κρίση του 1932» (als-v570) ────────────────────────────────
   ⭐⭐⭐ ΜΕ ΑΥΤΗΝ ΚΛΕΙΝΕΙ ΟΛΟΚΛΗΡΟ ΤΟ ΚΕΦΑΛΑΙΟ 1. Ένα ΟΙΚΟΝΟΜΙΚΟ κεφάλαιο
   τελειώνει σε ΔΙΚΤΑΤΟΡΙΑ — και το βιβλίο το δηλώνει ρητά: «Οι πιο
   σημαντικές επιπτώσεις, όμως… βρίσκονταν στο πολιτικό πεδίο».
   ⛔⛔ ΤΟ ΕΡΓΑΛΕΙΟ ΕΙΧΕ ΣΤΑΜΑΤΗΣΕΙ («4 vs 5»): η τελευταία ενότητα κάθε
   σελίδας κατάπινε το <script> του Matomo. Η διόρθωση μπήκε ΣΤΟΝ
   ΕΞΑΓΩΓΕΑ και είναι δομική· μετρήθηκε πριν/μετά σε ΟΛΑ τα ids. */
['explain', 'diagram', 'timeline', 'glossary', 'facts', 'text', 'sources'].forEach(id => {
  const r = boot('#/k1-g9/' + id);
  is('Γ.9 · η καρτέλα «' + id + '» ζωγραφίζει χωρίς σφάλμα', r.error || 'NONE', 'NONE');
});
const G9D = boot('#/k1-g9/diagram');
ok('⭐ Γ.9 · το σχεδιάγραμμα ζωγραφίζει και τα ΠΕΝΤΕ στάδιά της',
   ['Η κρίση βρίσκει την Ελλάδα σε «ευημερία» — και η λέξη είναι σε εισαγωγικά',
    'Η άμυνα καίει το ίδιο το θεμέλιο που υπερασπίζεται',
    'Κλήριγκ: εμπόριο χωρίς χρήμα — και η σιωπή του βιβλίου',
    'Η αλυσίδα οικονομία → πολιτική, δοσμένη ρητά σε τέσσερα βήματα',
    'Η τελευταία πρόταση ολόκληρου του κεφαλαίου']
     .every(x => (G9D.painted['panel-diagram'] || '').includes(x)));
ok('⭐⭐⭐ Γ.9 · ο πίνακας Γ.8 ↔ Γ.9 ζωγραφίζει ΚΑΙ ΤΑ ΔΥΟ ζεύγη λέξεων',
   ['ΣΤΗΡΙΖΟΝΤΑΣ', 'ΕΞΑΝΤΛΗΣΑΝ', 'ΕΞΑΣΦΑΛΙΖΟΝΤΑΣ', 'ΑΝΑΣΤΟΛΗ']
     .every(x => (G9D.painted['panel-diagram'] || '').includes(x))
   && (G9D.painted['panel-diagram'] || '').includes('καις το θεμέλιό της'));
ok('⭐⭐ Γ.9 · και η αλυσίδα οικονομία → πολιτική, με τα τέσσερα βήματα αριθμημένα',
   ['Βήμα 1', 'Βήμα 2', 'Βήμα 3', 'Βήμα 4']
     .every(x => (G9D.painted['panel-diagram'] || '').includes(x))
   && (G9D.painted['panel-diagram'] || '').includes('ΔΕΝ ΞΕΦΥΓΕ ΑΠΟ ΤΟ ΓΕΝΙΚΟ ΚΑΝΟΝΑ'));
ok('⭐⭐⭐ Γ.9 · το εύρημα του επιθέτου «ισχυρός» ζωγραφίζεται ΡΗΤΑ, με δηλωμένη πατρότητα',
   (G9D.painted['panel-diagram'] || '').includes('ταξιδεύει από την οικονομία στην πολιτική')
   && (G9D.painted['panel-diagram'] || '').includes('Η παρατήρηση για το επίθετο είναι <b>δική σου</b>'));
ok('⛔⛔ Γ.9 · η σιωπή για τα «θετικά στοιχεία» δηλώνεται ως σιωπή, όχι ως γνώση',
   (G9D.painted['panel-diagram'] || '').includes('η πρόταση τελειώνει εκεί')
   && (G9D.painted['panel-diagram'] || '').includes('Μην το παρουσιάσεις ως θέση του βιβλίου'));
ok('⭐ Γ.9 · ο τίτλος της μπαίνει στο hero', (G9D.painted.hero || '').includes('Η κρίση του 1932'));
const G9S = boot('#/k1-g9/sources');
ok('⭐⭐⭐ Γ.9 · οι «Πηγές» δίνουν ΔΥΟ αγορεύσεις της Βουλής του Απριλίου 1936',
   (G9S.painted['panel-sources'] || '').includes('μίαν γενναίαν δόσιν υποκρισίας')
   && (G9S.painted['panel-sources'] || '').includes('εχρεωκοπήσαμεν ως Κοινοβουλευτισμός')
   && (G9S.painted['panel-sources'] || '').includes('120'));
ok('  ⚠️ …με ΚΑΙ ΤΑ ΤΡΙΑ όριά τους δηλωμένα',
   (G9S.painted['panel-sources'] || '').includes('ΔΕΝ αναφέρει την οικονομική κρίση')
   && (G9S.painted['panel-sources'] || '').includes('ΔΕΝ είναι ουδέτερες περιγραφές')
   && (G9S.painted['panel-sources'] || '').includes('ΔΕΝ δικαιολογεί τη δικτατορία'));
ok('  ⭐⭐ τον ΠΙΝΑΚΑ 8 — και ΔΗΛΩΝΕΙ ότι το 15.000 ΔΕΝ είναι η χαμηλότερη τιμή του',
   (G9S.painted['panel-sources'] || '').includes('1931-1935: 15.000')
   && (G9S.painted['panel-sources'] || '').includes('ΔΕΝ είναι η χαμηλότερη τιμή του πίνακα')
   && (G9S.painted['panel-sources'] || '').includes('ένα όγδοο'));
ok('  ⭐⭐⭐ και την ΤΡΙΒΗ με τη Γ.8, με τα δύο ζεύγη λέξεων αντικριστά',
   ['ΣΤΗΡΙΖΟΝΤΑΣ', 'ΕΞΑΝΤΛΗΣΑΝ', 'ΕΞΑΣΦΑΛΙΖΟΝΤΑΣ', 'ΑΝΑΣΤΟΛΗ']
     .every(x => (G9S.painted['panel-sources'] || '').includes(x))
   && (G9S.painted['panel-sources'] || '').includes('ΔΕΝ ΕΙΝΑΙ ΑΝΤΙΦΑΣΗ'));

const G9 = CHAPTERS.find(c => c.id === 'k1-g9');
if (G9) {
  const f9 = G9.paragraphs.join('\n');
  const OXIA_A = String.fromCharCode(0x03AC);   // ά
  const OXIA_E = String.fromCharCode(0x03AD);   // έ
  /* ⭐⭐⭐ ΤΟ ΖΕΥΓΟΣ ΠΟΥ ΚΛΕΙΝΕΙ ΤΟ ΝΗΜΑ ΤΟΥ ΤΟΝΟΥ — ΣΕ CODEPOINTS */
  const G8u = CHAPTERS.find(c => c.id === 'k1-g8');
  ok('⭐⭐⭐ Γ.9 · «αποθέματα ΤΗΣ ΧΩΡΑΣ» — το «της» είναι ΑΡΘΡΟ, άρα ΧΩΡΙΣ δεύτερο τόνο',
     f9.includes('αποθ' + OXIA_E + 'ματα της χώρας σε χρυσό και συνάλλαγμα'));
  ok('  ⭐⭐ …ενώ η Γ.8 γράφει «αποθέματά ΤΗΣ» με τον τόνο, γιατί εκεί είναι ΚΤΗΤΙΚΟ',
     !!G8u && G8u.paragraphs.join('\n').includes('αποθ' + OXIA_E + 'ματ' + OXIA_A + ' της σε χρυσό και συνάλλαγμα'));
  ok('  ⭐ ΙΔΙΟ ουσιαστικό, ΙΔΙΑ κατάληξη φράσης, ΔΥΟ ρόλοι — και τα δύο σωστά',
     f9.includes('σε χρυσό και συνάλλαγμα')
     && !!G8u && G8u.paragraphs.join('\n').includes('σε χρυσό και συνάλλαγμα'));
  is('⭐ Γ.9 · ΚΑΝΕΝΑ τυπογραφικό', G9.sic.length, 0);
  ok('  ⭐ και το μόνο κτητικό εγκλιτικό της ενότητας είναι ΟΞΥΤΟΝΟ',
     f9.includes('με τη σειρά της στο χώρο'));
  /* ⛔⛔ ΤΟ ΧΡΟΝΟΛΟΓΙΟ ΕΙΝΑΙ ΚΑΘΑΡΑ ΤΟΥ ΚΕΙΜΕΝΟΥ */
  is('⭐ Γ.9 · τέσσερα book:true, και είναι ΟΛΕΣ οι χρονολογίες της',
     G9.timeline.events.filter(e => e.book).map(e => e.label).join(','), '1920,1930,1932,1936');
  is('  ⭐ και ταυτίζονται με όσα γράφει το κείμενο',
     [...new Set((f9.match(/\b1\d{3}\b/g) || []))].sort().join(','), '1920,1930,1932,1936');
  ok('⛔⛔ Γ.9 · το 1929 και η «Νέα Υόρκη» ΔΕΝ γράφονται εδώ — ζουν στη Γ.8',
     !f9.includes('1929') && !f9.includes('Νέα Υόρκη')
     && G9.timeline.events.some(e => String(e.label) === '1929' && !e.book && /Γ\.8/.test(e.note)));
  ok('  …και όσα «Πλαίσιο» φέρνουν χρονολογία άλλης ενότητας το ΔΗΛΩΝΟΥΝ',
     G9.timeline.events.filter(e => !e.book).every(e => !!e.note));
  ok('  ⭐ και η σειρά που ζωγραφίζεται είναι ΧΡΟΝΟΛΟΓΙΚΗ — ο renderer ΔΕΝ ταξινομεί',
     G9.timeline.events.map(e => +String(e.label).slice(0, 4)).every((y, i, a) => i === 0 || a[i - 1] <= y));
  /* ⭐⭐ ΜΕΤΡΗΘΗΚΕ */
  is('⭐⭐ Γ.9 · ΠΕΝΤΕ ομάδες ψηφίων: τέσσερις χρονολογίες και το «4» της 4ης Αυγούστου',
     (f9.match(/\d+/g) || []).join(','), '1920,1932,1930,4,1936');
  is('  ⭐ ΤΡΙΑ ζεύγη εισαγωγικών, και τα δύο πρώτα είναι η ΙΔΙΑ λέξη',
     (f9.match(/«[^»]*»/g) || []).join(','), '«ευημερίας»,«ευημερία»,«κλήριγκ»');
  /* ⭐⭐⭐ ΤΟ ΕΠΙΘΕΤΟ ΠΟΥ ΤΑΞΙΔΕΥΕΙ — ΜΕΤΡΗΜΕΝΟ ΣΤΟ ΥΛΙΚΟ */
  ok('⭐⭐⭐ Γ.9 · το «ισχυρός» εμφανίζεται ΚΑΙ στην οικονομία ΚΑΙ στην πολιτική',
     f9.includes('ισχυρού κρατικού παρεμβατισμού') && f9.includes('ισχυρά συγκεντρωτικά κράτη'));
  ok('  ⭐ και η σύνδεση είναι ΑΙΤΙΑΚΗ με λόγια του βιβλίου',
     f9.includes('μέσα απ' + String.fromCharCode(39) + ' αυτές τις διαδικασίες'));
  ok('  …και η σελίδα το δηλώνει ως ΔΙΚΗ ΤΟΥ παρατήρηση',
     JSON.stringify(G9.facts).includes('Η παρατήρηση για το επίθετο είναι ΔΙΚΗ σου'));
  /* ⭐⭐ Η ΣΤΡΟΦΗ ΠΡΟΣ ΤΗΝ ΠΟΛΙΤΙΚΗ, ΜΕ ΛΟΓΙΑ ΤΟΥ ΒΙΒΛΙΟΥ */
  ok('⭐⭐⭐ Γ.9 · το βιβλίο δηλώνει ΡΗΤΑ ότι οι πιο σημαντικές επιπτώσεις ήταν πολιτικές',
     f9.includes('Οι πιο σημαντικές επιπτώσεις, όμως, αυτών των εξελίξεων βρίσκονταν στο πολιτικό πεδίο'));
  ok('  ⭐⭐ και η τελευταία πρόταση του ΚΕΦΑΛΑΙΟΥ είναι η επιβολή δικτατορίας',
     /επιβολή δικτατορίας\.?$/.test(G9.paragraphs[G9.paragraphs.length - 1].trim()));
  ok('  ⭐ με ΔΥΟ πράξεις, όχι μία, και με μοιρασμένη ευθύνη',
     f9.includes('κατάλυση του κοινοβουλευτικού καθεστώτος και στην επιβολή δικτατορίας')
     && f9.includes('με την ανοχή του παλατιού'));
  /* ⭐ ΟΙ ΠΙΟ ΣΥΧΝΕΣ ΠΑΓΙΔΕΣ */
  ok('⭐ Γ.9 · η παγίδα «η κρίση βρήκε την Ελλάδα σε κακή κατάσταση» απαντιέται ΡΗΤΑ',
     G9.explain.pitfalls.some(p => p.no.includes('σε κακή οικονομική κατάσταση')));
  ok('⭐ Γ.9 · και η παγίδα «η κρίση χτύπησε την Ελλάδα το 1929»',
     G9.explain.pitfalls.some(p => p.no.includes('το 1929')));
  ok('⭐⭐ Γ.9 · και η παγίδα «οι σημαντικότερες συνέπειες ήταν οικονομικές»',
     G9.explain.pitfalls.some(p => p.no.includes('ήταν οικονομικές')));
  ok('⭐⭐ Γ.9 · η κλειστή οικονομία γίνεται ρητή ΕΝΝΟΙΑ, με τους τρεις όρους της',
     G9.explain.concepts.some(c => c.b.includes('ποιος αποφασίζει') && c.b.includes('ποιος είναι ο στόχος')));
  ok('⭐⭐ Γ.9 · και το κλήριγκ, με τη σύνδεσή του με την αναστολή',
     G9.explain.concepts.some(c => c.t.includes('ΚΛΗΡΙΓΚ')));
}

/* ⭐⭐⭐ ΤΟ ΚΕΦΑΛΑΙΟ 1 ΕΚΛΕΙΣΕ — ΟΛΕΣ ΟΙ ΕΝΤΟΣ ΥΛΗΣ ΥΠΟΕΝΟΤΗΤΕΣ ΕΙΝΑΙ ΕΤΟΙΜΕΣ.
   Η Β.11 «Το εξωελλαδικό ελληνικό κεφάλαιο» είναι ΕΚΤΟΣ ύλης (yli:false),
   άρα δεν μετράει. Ο έλεγχος βγάζει τη λίστα ΑΠΟ ΤΟΝ ΧΑΡΤΗ, όχι από
   καρφωμένο νούμερο — αν κάποτε αλλάξει η ύλη, θα το πει. */
{
  const yli1 = (JSON.parse((PAGE.match(/const YLI = (\[[\s\S]*?\]);\n<\/script>/) || [])[1] || '[]')[0] || { secs: [] })
    .secs.flatMap(s => s.units);
  const want = yli1.filter(u => u.yli).map(u => u.id).sort();
  const done = CHAPTERS.filter(c => /^k1-/.test(c.id)).map(c => c.id).sort();
  is('⭐⭐⭐ ΤΟ ΚΕΦΑΛΑΙΟ 1 ΕΚΛΕΙΣΕ: κάθε ΕΝΤΟΣ ΥΛΗΣ υποενότητά του είναι έτοιμη',
     want.filter(id => done.indexOf(id) < 0).join(',') || 'ΚΑΜΙΑ ΛΕΙΠΕΙ', 'ΚΑΜΙΑ ΛΕΙΠΕΙ');
  ok('  ⚠️ και η Β.11 μένει έξω γιατί είναι ΕΚΤΟΣ ύλης, όχι επειδή ξεχάστηκε',
     want.indexOf('k1-b11') < 0 && done.indexOf('k1-b11') < 0);
  ok('  ⭐ και τα τρία τμήματα είναι πλήρη: Α (2) · Β (10) · Γ (9)',
     done.filter(id => /^k1-a/.test(id)).length === 2
     && done.filter(id => /^k1-b/.test(id)).length === 10
     && done.filter(id => /^k1-g/.test(id)).length === 9);
}

/* ⛔⛔⛔ Ο ΕΞΑΓΩΓΕΑΣ ΔΙΟΡΘΩΘΗΚΕ ΔΟΜΙΚΑ, ΚΑΙ Ο ΚΑΝΟΝΑΣ ΚΛΕΙΔΩΝΕΤΑΙ ΕΔΩ.
   Η τελευταία υποενότητα ΚΑΘΕ σελίδας κατάπινε το <script> του Matomo,
   γιατί το segmentFor() δεν είχε επόμενο τίτλο για να κόψει. Η διόρθωση
   ΔΕΝ είναι λίστα εξαιρέσεων: κώδικας δεν είναι ποτέ κείμενο βιβλίου. */
{
  const TOOL = fs.readFileSync(path.join(ALS, 'tools', 'istoria-unit.js'), 'utf8');
  /* ⚠️ Η πρώτη γραφή αυτού του ελέγχου έψαχνε το ΚΕΙΜΕΝΟ «</script>» μέσα
     στο αρχείο — αλλά εκεί ζει ως ΚΑΝΟΝΙΚΗ ΕΚΦΡΑΣΗ, με ανάποδη κάθετο.
     Ο έλεγχος έσκαγε πάνω σε ΣΩΣΤΟ κώδικα. Κοιτάμε ΤΟ ΣΩΜΑ της
     stripChrome και τη ΣΕΙΡΑ των κανόνων, όχι μια ακριβή συμβολοσειρά. */
  const body = TOOL.slice(TOOL.indexOf("function stripChrome"), TOOL.indexOf("function extractA"));
  ok("⛔⛔ ο εξαγωγέας πετάει <script> και <noscript> μέσα στην stripChrome",
     /replace\(\/<script/.test(body) && /replace\(\/<noscript/.test(body));
  ok("  ⭐ και τα πετάει ΠΡΙΝ από κάθε άλλο κανόνα — κώδικας δεν είναι ποτέ κείμενο",
     body.indexOf("<script") < body.indexOf("image_text"));
  ok("  ⭐ και ο λόγος ζει δίπλα στον κανόνα, όχι σε commit message",
     body.includes("ΚΑΤΑΠΙΝΕΙ ΤΟ MATOMO"));
}


/* ⭐⭐ Η ΚΑΡΤΑ «Το βοήθημα» ΤΗΣ istoria.html ΑΠΑΡΙΘΜΕΙ ΤΙ ΕΙΝΑΙ ΕΤΟΙΜΟ — ΚΑΙ
   ΕΙΧΕ ΗΔΗ ΣΑΠΙΣΕΙ: έλεγε ως τη Β.7 ενώ ζούσαν και οι Β.8 · Β.9 · Β.10.
   ⛔ Μια λίστα που συντηρείται με το χέρι λέει ψέματα σιωπηλά. Ο έλεγχος
   βγάζει τις ετικέτες ΑΠΟ ΤΟ ΥΛΙΚΟ (CHAPTERS × YLI) — κανένα καρφωμένο
   νούμερο, και σκάει ΜΟΝΟ όταν η κάρτα μείνει πίσω. */
{
  const yli = JSON.parse((PAGE.match(/const YLI = (\[[\s\S]*?\]);\n<\/script>/) || [])[1] || '[]');
  const label = {};
  yli.forEach(k => k.secs.forEach(s => s.units.forEach(u => { label[u.id] = s.L + '.' + u.n; })));
  const missing = CHAPTERS.map(c => label[c.id])
    .filter(l => !l || !new RegExp(l.replace('.', '\\.') + '(?!\\d)').test(HOME));
  is('⭐⭐ η κάρτα «Το βοήθημα» ονομάζει ΚΑΘΕ έτοιμη ενότητα', missing.join(',') || 'ΚΑΜΙΑ ΛΕΙΠΕΙ', 'ΚΑΜΙΑ ΛΕΙΠΕΙ');
  ok('  …και ο σαρωτής βρήκε ετικέτα για κάθε ενότητα (δεν γύρισε άδειος)',
     CHAPTERS.every(c => !!label[c.id]));
}


/* ── Κεφ.2 · Α.1 «Πελατειακά δίκτυα επί τουρκοκρατίας» (als-v589) ─────
   ⭐⭐⭐ Η ΠΡΩΤΗ ΕΝΟΤΗΤΑ ΕΞΩ ΑΠΟ ΤΟ ΚΕΦΑΛΑΙΟ 1, ΚΑΙ ΕΦΕΡΕ ΔΥΟ BUG ΤΟΥ
   ΕΡΓΑΛΕΙΟΥ ΣΤΟ ΦΩΣ — κανένα δεν θα είχε φανεί μέσα στο κεφ. 1:
     (α) το `corpusFor()` κρατούσε μόνο το «a1» από το «k2-a1» και ΕΠΙΑΝΕ
         το «a1a» του κεφ. 1 (δημογραφικά δεδομένα), οπότε «αποδείκνυε» ότι
         η σελίδα των πελατειακών δικτύων δεν συμφωνεί μαζί τους·
     (β) η ενότητα έχει ΚΟΥΚΙΔΟΛΙΣΤΑ (<ul> με τρία <li>) — σχήμα που δεν
         υπάρχει σε καμία ενότητα του κεφ. 1. Ο εξαγωγέας Α μαζεύει μόνο
         <p>, άρα ΕΧΑΝΕ τους τρεις λόγους· ο Β τους έβλεπε. 3 vs 4.
   ⭐ Και τα δύο διορθώθηκαν ΔΟΜΙΚΑ, και οι 22 ενότητες του κεφ. 1 ξανατρέχτηκαν
   πριν και μετά: βγήκαν ΒΥΤΕ-ΤΑΥΤΟΣΗΜΕΣ.
   ⛔ Τα δύο τυπογραφικά της είναι ΚΟΛΛΗΜΕΝΕΣ ΛΕΞΕΙΣ («σταοποία», «Οιφορείς»)
   και ΔΕΝ τα πιάνει ο αυτόματος κανόνας — μπαίνουν με το μάτι, δηλωμένα. */
['explain', 'diagram', 'timeline', 'glossary', 'facts', 'text', 'sources'].forEach(id => {
  const r = boot('#/k2-a1/' + id);
  is('Κεφ.2 Α.1 · η καρτέλα «' + id + '» ζωγραφίζει χωρίς σφάλμα', r.error || 'NONE', 'NONE');
});
const K2A1D = boot('#/k2-a1/diagram');
ok('⭐ Κεφ.2 Α.1 · το σχεδιάγραμμα ζωγραφίζει και τα ΠΕΝΤΕ στάδιά της',
   ['Το σημείο εκκίνησης: καμία δυνατότητα για κόμμα',
    'Οι τρεις λόγοι — τους δίνει το βιβλίο με κουκκίδες',
    'Η καταφυγή: μη κρατικοί φορείς',
    'Ποιος ήταν ο πάτρωνας σε κάθε περιοχή',
    'Γιατί τα κατοπινά κόμματα ΔΕΝ είναι μετεξέλιξη των δικτύων']
     .every(x => (K2A1D.painted['panel-diagram'] || '').includes(x)));
ok('⭐⭐ Κεφ.2 Α.1 · ΚΑΙ ΟΙ ΤΡΕΙΣ λόγοι ζωγραφίζονται χωριστά — είναι το υλικό που ο Α εξαγωγέας ΕΧΑΝΕ',
   ['Ανταγωνισμός μεταξύ προσώπων', 'Ελλιπής παροχή προστασίας',
    'Απουσία συστήματος κοινωνικής πρόνοιας']
     .every(x => (K2A1D.painted['panel-diagram'] || '').includes(x)));
ok('⭐⭐ Κεφ.2 Α.1 · και οι ΤΡΕΙΣ περιοχές με τους τρεις διαφορετικούς φορείς',
   ['οικογένειες προκρίτων', 'Μεγαλοαρματολοί', 'Οικογένειες μεγάλων πλοιοκτητών']
     .every(x => (K2A1D.painted['panel-diagram'] || '').includes(x)));
ok('⭐⭐⭐ Κεφ.2 Α.1 · το σχεδιάγραμμα ΑΝΤΙΠΑΡΑΘΕΤΕΙ δίκτυο ↔ κόμμα, γιατί ΕΚΕΙ κρίνεται η ενότητα',
   (K2A1D.painted['panel-diagram'] || '').includes('Τι θέλει ένα κόμμα')
   && (K2A1D.painted['panel-diagram'] || '').includes('λείπουν και τα τρία'));
ok('⚠️ Κεφ.2 Α.1 · …και ξεχωρίζει το ΚΑΘΕΤΟ από το ΟΡΙΖΟΝΤΙΟ δέσιμο — μόνο το ένα είναι πελατειακό',
   (K2A1D.painted['panel-diagram'] || '').includes('Πελατειακό είναι <b>μόνο το κάθετο</b>'));
ok('⭐ Κεφ.2 Α.1 · ο τίτλος της μπαίνει στο hero',
   (boot('#/k2-a1/explain').painted.hero || '').includes('Πελατειακά δίκτυα επί τουρκοκρατίας'));
const K2A1S = boot('#/k2-a1/sources');
ok('⭐⭐ Κεφ.2 Α.1 · οι «Πηγές» είναι ΟΙ ΤΡΕΙΣ ΥΠΟΣΗΜΕΙΩΣΕΙΣ ΤΟΥ ΒΙΒΛΙΟΥ, ονομαστικά',
   ['Κοντογιώργης', 'Reinhart Beck', 'Πετρόπουλος'].every(x => (K2A1S.painted['panel-sources'] || '').includes(x)));
ok('  ⭐⭐⭐ …και η τρίτη δηλώνεται ρητά ως η πηγή που ΤΕΝΤΩΝΕΙ το κείμενο: θεσμοί ≠ συμπεριφορές',
   (K2A1S.painted['panel-sources'] || '').includes('ΤΕΝΤΩΝΕΙ το κυρίως κείμενο')
   && (K2A1S.painted['panel-sources'] || '').includes('το βιβλίο για ΘΕΣΜΟΥΣ, η πηγή για ΣΥΜΠΕΡΙΦΟΡΕΣ'));
ok('  ⛔ …και προειδοποιεί ΡΗΤΑ ότι οι τρεις πηγές ΔΕΝ γράφονται ως πρόζα του βιβλίου',
   (K2A1S.painted['panel-sources'] || '').includes('ΔΕΝ είναι κείμενο του βιβλίου και ΔΕΝ γράφονται ως πρόζα'));

const K2A1 = CHAPTERS.find(c => c.id === 'k2-a1');
if (K2A1) {
  const fK = K2A1.paragraphs.join('\n');
  /* ⭐ Η ΚΟΥΚΙΔΟΛΙΣΤΑ ΕΙΝΑΙ ΠΑΡΑΓΡΑΦΟΣ 2, ΚΑΙ ΕΙΝΑΙ ΟΛΟΚΛΗΡΗ.
     Αν ο εξαγωγέας Α ξαναγίνει ο μόνος που μετράει, αυτή η παράγραφος
     εξαφανίζεται — και μαζί της οι τρεις λόγοι, που είναι έτοιμη ερώτηση. */
  is('⭐⭐ Κεφ.2 Α.1 · ΤΕΣΣΕΡΙΣ παράγραφοι — η 2η είναι η κουκκιδολίστα', K2A1.paragraphs.length, 4);
  ok('  ⭐⭐⭐ και οι ΤΡΕΙΣ λόγοι είναι ΟΛΟΙ μέσα στη 2η παράγραφο, αυτούσιοι',
     ['ο ανταγωνισμός μεταξύ προσώπων για την κατάληψη θέσεων εξουσίας',
      'η ελλιπής παροχή προστασίας από μέρους της οθωμανικής διοίκησης',
      'η απουσία συστήματος κοινωνικής πρόνοιας'].every(x => K2A1.paragraphs[1].includes(x)));
  ok('  ⛔ …και η 2η παράγραφος ΔΕΝ κουβαλάει κουκκίδες ή σημάδια λίστας',
     !/[•·*•]|^-\s/.test(K2A1.paragraphs[1]));
  /* ⛔ ΤΑ ΔΥΟ ΤΥΠΟΓΡΑΦΙΚΑ — ΚΟΛΛΗΜΕΝΕΣ ΛΕΞΕΙΣ, ΚΑΙ ΤΑ ΔΥΟ ΣΤΗΝ 4η ΠΑΡΑΓΡΑΦΟ */
  is('⛔ Κεφ.2 Α.1 · κρατάει ΚΑΙ ΤΑ ΔΥΟ τυπογραφικά του βιβλίου', K2A1.sic.length, 2);
  ok('  ⭐ «σταοποία» και «Οιφορείς» ζουν ΑΥΤΟΥΣΙΑ στην 4η παράγραφο',
     K2A1.paragraphs[3].includes('σταοποία') && K2A1.paragraphs[3].includes('Οιφορείς'));
  ok('  ⛔ και καμία από τις δύο διορθώσεις ΔΕΝ μπήκε στο κείμενο',
     !fK.includes('στα οποία') && !fK.includes('Οι φορείς'));
  /* ⛔⛔ ΤΟ ΧΡΟΝΟΛΟΓΙΟ ΕΙΝΑΙ ΚΑΘΑΡΑ ΤΟΥ ΚΕΙΜΕΝΟΥ. Η πρόζα δίνει ΜΙΑ περίοδο:
     «1715-1821». Το 1977 και το 1986 των δύο ΟΡΙΣΜΩΝ είναι πηγές, και το
     «1821-1843» είναι τίτλος ΤΜΗΜΑΤΟΣ — τίποτε από αυτά δεν είναι γεγονός. */
  is('⛔⛔ Κεφ.2 Α.1 · ΜΙΑ ΜΟΝΟ χρονολογία βιβλίου, και είναι η περίοδος 1715-1821',
     K2A1.timeline.events.filter(e => e.book).map(e => e.label).join(','), '1715-1821');
  ok('  ⛔ καμία χρονολογία ΠΗΓΗΣ στο χρονολόγιο (1977 · 1986)',
     !K2A1.timeline.events.some(e => [1977, 1986].includes(e.y)));
  ok('  ⛔ και το 1843 της επικεφαλίδας του τμήματος ΔΕΝ μπήκε ως γεγονός',
     !K2A1.timeline.events.some(e => e.y === 1843));
  ok('  ⭐ το 1821 μπαίνει ΜΟΝΟ ως «Πλαίσιο», με δηλωμένο γιατί',
     K2A1.timeline.events.some(e => e.y === 1821 && !e.book && /ΔΕΝ τη γράφει εδώ ως γεγονός/.test(e.note || '')));
  /* ⭐⭐ Η ΑΡΝΗΣΗ ΕΙΝΑΙ Η ΕΝΟΤΗΤΑ. Αν φύγει από τη σελίδα, ο μαθητής θα
     γράψει ότι τα δίκτυα ΕΓΙΝΑΝ κόμματα — το αντίθετο του βιβλίου. */
  ok('⭐⭐⭐ Κεφ.2 Α.1 · η ΑΡΝΗΣΗ του βιβλίου ζει στο lede, σε act, σε pitfall ΚΑΙ στο σχεδιάγραμμα',
     /δεν αποτελούν απλή μετεξέλιξη/.test(K2A1.explain.lede)
     && K2A1.explain.acts.some(a => /ΔΕΝ είναι μετεξέλιξη/.test(a.title))
     && K2A1.explain.pitfalls.some(p => /πρώτα ελληνικά κόμματα/.test(p.no))
     /* ⚠️ Το σχεδιάγραμμα ΔΕΝ ζει μέσα στο αντικείμενο: ανατίθεται στο ΔΕΥΤΕΡΟ
        <script>, άρα το `CHAPTERS` που διαβάζει ο φρουρός δεν το έχει. Ο έλεγχος
        γίνεται πάνω στο ΖΩΓΡΑΦΙΣΜΕΝΟ πάνελ, που είναι και το μόνο που βλέπει αυτός. */
     && /δεν αποτελούν απλή μετεξέλιξη/.test(K2A1D.painted['panel-diagram'] || ''));
  ok('⭐ Κεφ.2 Α.1 · οι τρεις λόγοι είναι ΚΑΙ pitfall — το «ένας από τρεις» χάνει τα δύο τρίτα',
     K2A1.explain.pitfalls.some(p => /ΕΝΑΣ από ΤΡΕΙΣ/.test(p.ok)));
  ok('⭐ Κεφ.2 Α.1 · ο ΟΡΙΣΜΟΣ της πελατειακής σχέσης σπάει σε ΤΕΣΣΕΡΑ συστατικά',
     K2A1.sources.list.some(s => /Τέσσερα συστατικά/.test((s.keep || []).join(' '))));
  /* ⚠️ Ο ΜΑΡΚΑΔΟΡΟΣ ΦΩΤΙΖΕΙ ΤΟ ΠΡΩΤΟ indexOf ΑΝΑ ΣΗΜΑΔΙ, άρα δύο σημάδια
     στο ΙΔΙΟ σημείο του κειμένου χάνονται σιωπηλά (μάθημα της Β.3). */
  {
    const rng = [...K2A1.glossary.map(g => g.m), ...K2A1.sic.map(x => x.m)]
      .map(m => ({ m, s: fK.indexOf(m), e: fK.indexOf(m) + m.length }))
      .sort((a, b) => a.s - b.s);
    const clash = rng.filter((x, i) => i > 0 && x.s < rng[i - 1].e).map(x => x.m);
    is('⚠️ Κεφ.2 Α.1 · κανένα σημάδι γλωσσαρίου/sic δεν πέφτει πάνω σε άλλο',
       clash.join(',') || 'ΚΑΜΙΑ ΕΠΙΚΑΛΥΨΗ', 'ΚΑΜΙΑ ΕΠΙΚΑΛΥΨΗ');
  }
  /* ⛔ ΤΑ Α1 ΚΑΙ ΟΙ ΠΛΑΓΙΟΤΙΤΛΟΙ ΕΙΝΑΙ ΔΙΚΑ ΤΟΥ — Η ΣΕΛΙΔΑ ΔΕΝ ΤΑ ΓΡΑΦΕΙ */
  is('⛔ Κεφ.2 Α.1 · κανένας όρος Α1 γραμμένος από μένα', (K2A1.terms || []).length, 0);
}


/* ── Κεφ.2 · Α.4 «Τα κόμματα ως εκφραστές του πνεύματος της εποχής» ─────
   ⭐⭐ ΔΥΟ ΑΠΟ ΤΙΣ ΠΕΝΤΕ ΠΑΡΑΓΡΑΦΟΥΣ ΕΙΝΑΙ ΓΥΜΝΟ ΚΕΙΜΕΝΟ ΣΤΟ EBOOK, ΟΧΙ <p>:
   η 3η ανοίγει νέα σελίδα κατευθείαν μέσα σε <td>, η 5η κάθεται μετά τον
   πίνακα διάταξης. Ο εξαγωγέας Α τις ΕΧΑΝΕ (3 vs 5). Η διόρθωση μπήκε στο
   κοινό stripChrome() — και οι 69 ενότητες που έβγαιναν ήδη βγήκαν ΒΥΤΕ-
   ΤΑΥΤΟΣΗΜΕΣ πριν και μετά.
   ⛔ Εδώ ελέγχεται ότι ΑΥΤΕΣ ΑΚΡΙΒΩΣ οι δύο υπάρχουν, ονομαστικά — αν ο Α
   ξαναγίνει ο μόνος που μετράει, χάνονται η κοινή βάση της οικονομίας,
   η Εθνική Τράπεζα και η επαναστατική βία. */
[['explain',   'panel-explain',  'Ένας τόπος που δεν καταλάβαινε τη διαφωνία'],
 ['diagram',   'panel-diagram',  'Το πνεύμα της εποχής: η διαφωνία ως ηθική κατάπτωση'],
 ['timeline',  'panel-timeline', 'Ιδρύεται η Εθνική Τράπεζα'],
 ['glossary',  'ggrid',          'Ασύστολη ιδιοτέλεια'],
 ['facts',     'panel-facts',    'Γιατί η πλατεία λέγεται «Συντάγματος»'],
 ['text',      'rtext',          'Αυτό επηρέασε και την'],
 ['sources',   'panel-sources',  'Die politischen Parteien in Griechenland']].forEach(([id, key, mark]) => {
  const r = boot('#/k2-a4/' + id);
  is('Κεφ.2 Α.4 · η καρτέλα «' + id + '» ζωγραφίζει χωρίς σφάλμα', r.error || 'NONE', 'NONE');
  ok('  …και ζωγραφίζει ΤΟ ΔΙΚΟ ΤΗΣ σημάδι: «' + mark + '»', (r.painted[key] || '').includes(mark));
});
const K2A4D = boot('#/k2-a4/diagram').painted['panel-diagram'] || '';
ok('⭐ Κεφ.2 Α.4 · το σχεδιάγραμμα ζωγραφίζει και τα ΠΕΝΤΕ στάδιά της',
   ['Το πνεύμα της εποχής: η διαφωνία ως ηθική κατάπτωση',
    'Πού ΔΕΝ διέφεραν: η οικονομική πολιτική',
    'Τι τα απασχολούσε στην οικονομική πολιτική',
    'Τι τους έλειπε — και γιατί ήταν σχεδόν αναπόφευκτο',
    'Η έσχατη λύση: επαναστατική βία'].every(x => K2A4D.includes(x)));
ok('⭐⭐ Κεφ.2 Α.4 · και οι ΤΕΣΣΕΡΙΣ πυλώνες της οικονομίας, χωριστά — είναι υλικό της 3ης παραγράφου, που ο Α ΕΧΑΝΕ',
   ['<b>Αγροτική</b> παραγωγή', '<b>Βιοτεχνική</b> παραγωγή', '<b>Εμπόριο</b>', '<b>Ναυτιλία</b>'].every(x => K2A4D.includes(x)));
ok('⭐ Κεφ.2 Α.4 · «η προστασία ΤΟΥ» είναι του ΔΙΚΤΥΟΥ — το σχεδιάγραμμα το δένει στο σωστό κουτί',
   /Το συγκοινωνιακό δίκτυο<\/b><span>[^<]*<b>προώθησή<\/b>[^<]*<b>προστασία του από ληστές και πειρατές<\/b>/.test(K2A4D));
ok('⛔ Κεφ.2 Α.4 · το .oc κουβαλάει ΕΝΑ <b> στην αρχή και κανένα μέσα στο span (σταθ. της Α.1)',
   [...K2A4D.matchAll(/class="oc [a-z]+">[\s\S]*?<span>([\s\S]*?)<\/span>/g)].every(m => !/<b>/.test(m[1])));
ok('⭐ Κεφ.2 Α.4 · ο τίτλος της μπαίνει στο hero',
   (boot('#/k2-a4/explain').painted.hero || '').includes('Τα κόμματα ως εκφραστές του πνεύματος της εποχής'));
const K2A4S = boot('#/k2-a4/sources').painted['panel-sources'] || '';
ok('⭐⭐ Κεφ.2 Α.4 · οι «Πηγές»: οι ΔΥΟ υποσημειώσεις του βιβλίου (8 · 9) + η Α.3, ονομαστικά',
   ['Gunnar Hering', '«Αθηνά» του Εμμ. Αντωνιάδη', 'Κεφ. 2 · Α.3'].every(x => K2A4S.includes(x)));
ok('  ⭐⭐ …και ο Hering δηλώνεται ως η φωνή που ΤΕΝΤΩΝΕΙ το κείμενο: «και σε άλλες χώρες»',
   K2A4S.includes('ΤΕΝΤΩΝΕΙ το κυρίως κείμενο') && K2A4S.includes('περιφρονούνταν και σε άλλες χώρες'));
ok('  ⚠️ …και το «Κονμαριανού» της υποσημ. 9 μένει ΟΠΩΣ το τυπώνει το βιβλίο, ΔΗΛΩΜΕΝΟ',
   K2A4S.includes('Αικατερίνη Κονμαριανού') && K2A4S.includes('Το «Κονμαριανού» είναι τυπογραφικό'));

const K2A4 = CHAPTERS.find(c => c.id === 'k2-a4');
if (K2A4) {
  const fA = K2A4.paragraphs.join('\n');
  is('⭐⭐ Κεφ.2 Α.4 · ΠΕΝΤΕ παράγραφοι — όχι τρεις', K2A4.paragraphs.length, 5);
  ok('  ⭐⭐⭐ η 3η είναι η ΓΥΜΝΗ της αρχής σελίδας («Όλα τα κόμματα συμφωνούσαν…»)',
     (K2A4.paragraphs[2] || '').indexOf('Όλα τα κόμματα συμφωνούσαν να στηριχθεί η οικονομία') === 0);
  ok('  ⭐⭐⭐ και η 5η η γυμνή μετά τον πίνακα («Σε ακραίες περιπτώσεις…»)',
     /* `|| ''`: μια παράγραφος που ΕΛΕΙΨΕ πρέπει να κοκκινίζει, όχι να ρίχνει
        το test — ένα crash διαβάζεται «χαλασμένο test», όχι «χάθηκε ύλη». */
     (K2A4.paragraphs[4] || '').indexOf('Σε ακραίες περιπτώσεις τα κόμματα κατέφευγαν') === 0);
  ok('  ⛔ καμία υποσημείωση δεν γλίστρησε στην πρόζα (Hering · «Αθηνά» · δείκτες 8/9)',
     !/Hering|Αθηνά|θεσιθηρία|φατρίαι|ιδιοτέλειας8|Ρωσικό9/.test(fA));
  is('⭐ Κεφ.2 Α.4 · μηδέν τυπογραφικά στην πρόζα — ελέγχθηκε με το μάτι', K2A4.sic.length, 0);
  ok('  ⭐ η ίσια απόστροφος του βιβλίου μένει («σ\' αυτό», U+0027)', fA.includes("Μέσα σ' αυτό"));
  /* ⛔⛔ ΤΟ ΧΡΟΝΟΛΟΓΙΟ ΕΙΝΑΙ ΚΑΘΑΡΑ ΤΟΥ ΚΕΙΜΕΝΟΥ: η πρόζα γράφει 1841 και 1844. */
  is('⛔⛔ Κεφ.2 Α.4 · ΔΥΟ χρονολογίες βιβλίου, και είναι το 1841 και το 1844',
     K2A4.timeline.events.filter(e => e.book).map(e => e.label).join(','), '1841,1844');
  ok('  ⛔ καμία χρονολογία ΠΗΓΗΣ στο χρονολόγιο (1838 «Αθηνά» · 1992 / 1936 Hering)',
     !K2A4.timeline.events.some(e => [1838, 1992, 1936].includes(e.y)));
  ok('  ⛔ και το 1843 της επικεφαλίδας του τμήματος ΔΕΝ μπήκε ως γεγονός',
     !K2A4.timeline.events.some(e => e.y === 1843));
  ok('  ⭐ οι δύο περίοδοι μπαίνουν ΜΟΝΟ ως «Πλαίσιο», με δηλωμένο γιατί',
     K2A4.timeline.events.filter(e => !e.book).every(e => /δεν γράφεται στο βιβλίο/.test(e.note || '')));
  ok('⭐⭐ Κεφ.2 Α.4 · η ΖΥΓΑΡΙΑ «Πέρα από τις διαφορές τους» ζει σε act ΚΑΙ σε pitfall — δεν συμφωνούσαν σε όλα',
     K2A4.explain.acts.some(a => /Πέρα από τις διαφορές τους/.test(a.body))
     && K2A4.explain.pitfalls.some(p => /δεν διαφωνούσαν σε τίποτα/.test(p.no)));
  ok('⭐ Κεφ.2 Α.4 · 1841 ≠ 1844 — η τράπεζα και το σύνταγμα είναι pitfall',
     K2A4.explain.pitfalls.some(p => /1841/.test(p.ok) && /1844/.test(p.ok)));
  ok('⭐ Κεφ.2 Α.4 · «σε ακραίες περιπτώσεις» — η βία δεν ήταν ο κανόνας',
     K2A4.explain.pitfalls.some(p => /ακραίες περιπτώσεις/.test(p.ok)));
  is('⛔ Κεφ.2 Α.4 · κανένας όρος Α1 γραμμένος από μένα', (K2A4.terms || []).length, 0);
}


/* ── Κεφ.2 · Α.2 «Η διαμόρφωση νέων δεδομένων κατά την Επανάσταση» ─────
   ⭐ Η ενότητα πριν από την als-v592 ΣΤΑΜΑΤΟΥΣΕ (8 vs 7): ο υπότιτλος-τίτλος
   ζούσε σε <div class="title"> και ο Α τον μετρούσε παράγραφο. Τώρα εξάγεται
   καθαρά, και ο τρίτος (δεντρικός) εξαγωγέας συμφώνησε 7/7.
   ⛔ ΤΕΣΣΕΡΙΣ υποσημειώσεις του βιβλίου (4-7), αλλά οι «Πηγές» είναι ΠΑΝΤΑ
   τρεις (πηγή · κείμενο/αριθμοί · ιστορικός): η 4η (Βακαλόπουλος) ζει στην
   πράξη του δεύτερου εμφυλίου — ελέγχεται κι αυτό, ώστε καμία να μη χαθεί. */
[['explain',   'panel-explain',  'Από την ομόνοια στη σύγκρουση'],
 ['diagram',   'panel-diagram',  'Ο Υψηλάντης απέναντι στους προκρίτους'],
 ['timeline',  'panel-timeline', 'Ο δεύτερος εμφύλιος (β΄ εξάμηνο)'],
 ['glossary',  'ggrid',          'Κλεφτοκαπεταναίοι'],
 ['facts',     'panel-facts',    'Η Τροιζήνα εξέλεξε τον Καποδίστρια'],
 ['text',      'rtext',          'Όσο οι Έλληνες ήταν'],
 ['sources',   'panel-sources',  'Ιστορικοί Αναμνήσεις']].forEach(([id, key, mark]) => {
  const r = boot('#/k2-a2/' + id);
  is('Κεφ.2 Α.2 · η καρτέλα «' + id + '» ζωγραφίζει χωρίς σφάλμα', r.error || 'NONE', 'NONE');
  ok('  …και ζωγραφίζει ΤΟ ΔΙΚΟ ΤΗΣ σημάδι: «' + mark + '»', (r.painted[key] || '').includes(mark));
});
const K2A2D = boot('#/k2-a2/diagram').painted['panel-diagram'] || '';
ok('⭐ Κεφ.2 Α.2 · το σχεδιάγραμμα ζωγραφίζει και τα ΠΕΝΤΕ στάδιά της',
   ['Από την ομόνοια στη σύγκρουση', 'Ο Υψηλάντης απέναντι στους προκρίτους',
    'Επίδαυρος και Άστρος: η εξουσία αλλάζει χέρια', 'Δύο εμφύλιοι μέσα σε ένα χρόνο',
    'Τρία κόμματα — και τι σήμαιναν τα ονόματά τους'].every(x => K2A2D.includes(x)));
ok('⭐⭐ Κεφ.2 Α.2 · τα δύο επιχειρήματα του Άστρους είναι σε ΣΩΣΤΗ πλευρά',
   /Πρόκριτοι: η εξουσία σε όσους ξέρουν <b>πολιτικούς χειρισμούς<\/b>/.test(K2A2D)
   && /Κλεφτοκαπεταναίοι: η εξουσία σε όσους <b>διεξάγουν τον πόλεμο<\/b>/.test(K2A2D));
ok('⭐⭐ Κεφ.2 Α.2 · το σχεδιάγραμμα κρατάει τη ΔΙΑΨΕΥΣΗ του βιβλίου για τα «ξενικά» ονόματα',
   K2A2D.includes('Η άποψη όμως αυτή δεν επιβεβαιώνεται από τα γεγονότα'));
ok('⛔ Κεφ.2 Α.2 · κανένα <b> μέσα σε span του .oc',
   [...K2A2D.matchAll(/class="oc [a-z]+">[\s\S]*?<span>([\s\S]*?)<\/span>/g)].every(m => !/<b>/.test(m[1])));
ok('⭐ Κεφ.2 Α.2 · ο τίτλος της μπαίνει στο hero',
   (boot('#/k2-a2/explain').painted.hero || '').includes('Η διαμόρφωση νέων δεδομένων κατά την Επανάσταση'));
const K2A2S = boot('#/k2-a2/sources').painted['panel-sources'] || '';
ok('⭐⭐ Κεφ.2 Α.2 · οι «Πηγές»: Δραγούμης · σύνταγμα Τροιζήνας · Δεσποτόπουλος, ονομαστικά',
   ['Νικόλαος Δραγούμης', 'Εθνοσυνέλευσης (Τροιζήνας)', 'Αλέξανδρος Δεσποτόπουλος'].every(x => K2A2S.includes(x)));
ok('  ⭐⭐ …και ο Δραγούμης δηλώνεται ως η φωνή που ΤΕΝΤΩΝΕΙ το κείμενο (ενθουσιασμός ≠ ρήγμα)',
   K2A2S.includes('ΤΕΝΤΩΝΕΙ το κυρίως κείμενο') && K2A2S.includes('ΡΗΓΜΑΤΟΣ'));

const K2A2 = CHAPTERS.find(c => c.id === 'k2-a2');
if (K2A2) {
  const fB = K2A2.paragraphs.join('\n');
  is('⭐ Κεφ.2 Α.2 · ΕΠΤΑ παράγραφοι', K2A2.paragraphs.length, 7);
  ok('  ⛔ ο υπότιτλος του βιβλίου ΔΕΝ μπήκε ως παράγραφος (το 8 vs 7)',
     !K2A2.paragraphs.some(p => /^2\.\s*Η διαμόρφωση/.test(p)));
  ok('  ⛔ καμία υποσημείωση δεν γλίστρησε στην πρόζα (Δραγούμης · Κασομούλης · άρθρα Τροιζήνας · Δεσποτόπουλος)',
     !/Δραγούμης|Κασομούλης|ενυπάρχει|Νομοτελεστική|Δεσποτόπουλος|Εθνοσυνέλευση4/.test(fB));
  ok('  ⛔ καμία λεζάντα στην πρόζα (Πετρόμπεης · «ευρωπαϊκός αυλάς»)', !/Πετρόμπεη|αυλάς/.test(fB));
  ok('  ⭐ ο διακριτικός τόνος «τη δομή τού υπό ίδρυση» μένει — δεν είναι τυπογραφικό',
     fB.includes('τη δομή τού υπό ίδρυση') && K2A2.sic.length === 0);
  /* ⛔⛔ ΤΟ ΧΡΟΝΟΛΟΓΙΟ ΕΙΝΑΙ ΚΑΘΑΡΑ ΤΟΥ ΚΕΙΜΕΝΟΥ */
  is('⛔⛔ Κεφ.2 Α.2 · οι χρονολογίες βιβλίου είναι ΑΚΡΙΒΩΣ της πρόζας',
     K2A2.timeline.events.filter(e => e.book).map(e => e.label).join(','), '1822,1823,1824,1824,1825');
  ok('  ⛔ καμία χρονολογία ΠΗΓΗΣ ή ΛΕΖΑΝΤΑΣ (1770 Κασομούλη · 1973 Δραγούμη)',
     !K2A2.timeline.events.some(e => [1770, 1973].includes(e.y)));
  ok('  ⭐ ό,τι δεν χρονολογεί το βιβλίο μπαίνει ΜΟΝΟ ως «Πλαίσιο», με δηλωμένο γιατί',
     K2A2.timeline.events.filter(e => !e.book).every(e => /δεν γράφεται στο βιβλίο/.test(e.note || '')));
  ok('⭐⭐ Κεφ.2 Α.2 · η ΔΙΑΨΕΥΣΗ («δεν επιβεβαιώνεται») ζει σε act, σε έννοια ΚΑΙ σε pitfall',
     K2A2.explain.acts.some(a => /δεν επιβεβαιώνεται από τα γεγονότα/.test(a.body))
     && K2A2.explain.concepts.some(c => /δεν επιβεβαιώνεται από τα γεγονότα/.test(c.b))
     && K2A2.explain.pitfalls.some(p => /όργανα των ξένων Δυνάμεων/.test(p.no)));
  ok('⭐ Κεφ.2 Α.2 · η 4η υποσημείωση (Βακαλόπουλος/Κασομούλης) δεν χάθηκε: ζει στην πράξη του 2ου εμφυλίου',
     K2A2.explain.acts.some(a => /υποσημείωση 5/.test(a.body) && /Κασομούλης/.test(a.body)));
  ok('⭐ Κεφ.2 Α.2 · τα επιχειρήματα του Άστρους είναι pitfall — τα μπερδεύουν',
     K2A2.explain.pitfalls.some(p => /πολιτικούς χειρισμούς/.test(p.no) && /ΠΡΟΚΡΙΤΟΙ/.test(p.ok)));
  is('⛔ Κεφ.2 Α.2 · κανένας όρος Α1 γραμμένος από μένα', (K2A2.terms || []).length, 0);
}


/* ══ Κεφ.2 · Β.1 «Το σύνταγμα του 1844» (als-v597) ═══════════════════
   ⭐ Πρώτη ενότητα από το index2_3. ΠΕΝΤΕ τυπογραφικά στην πρόζα, ανάμεσά
   τους ένα ΛΑΤΙΝΙΚΟ «v» («vέους») και ο αριθμός υποσημείωσης κολλημένος
   στη λέξη («ψηφοφορίας10»). ΜΙΑ υποσημείωση δίπλα της (10)· οι άλλες δύο
   πηγές (12 · 16) είναι του ίδιου αρχείου, από τη Β.2 και τη Β.4, δηλωμένα. */
[['explain',   'panel-explain',  'Τρία κόμματα, ένα «ναι» στο σύνταγμα'],
 ['diagram',   'panel-diagram',  'Οι τρεις ηγέτες στο τιμόνι'],
 ['timeline',  'panel-timeline', 'Η Εθνοσυνέλευση με τους τρεις ηγέτες'],
 ['glossary',  'ggrid',          'Προσυπογραφή'],
 ['facts',     'panel-facts',    'Μαυροκορδάτος · Κωλέττης · Μεταξάς'],
 ['text',      'rtext',          'Η επανάσταση της 3ης Σεπτεμβρίου 1843'],
 ['sources',   'panel-sources',  'Νικηφόρος Διαμαντούρος']].forEach(([id, key, mark]) => {
  const r = boot('#/k2-b1/' + id);
  is('Κεφ.2 Β.1 · η καρτέλα «' + id + '» ζωγραφίζει χωρίς σφάλμα', r.error || 'NONE', 'NONE');
  ok('  …και ζωγραφίζει ΤΟ ΔΙΚΟ ΤΗΣ σημάδι: «' + mark + '»', (r.painted[key] || '').includes(mark));
});
const K2B1D = boot('#/k2-b1/diagram').painted['panel-diagram'] || '';
ok('⭐ Κεφ.2 Β.1 · το σχεδιάγραμμα ζωγραφίζει και τα ΠΕΝΤΕ στάδιά της',
   ['Από την επανάσταση στο σύνταγμα', 'Οι τρεις ηγέτες στο τιμόνι', 'Τα δικαιώματα — και η αδυναμία',
    'Ο βασιλιάς και οι νέοι θεσμοί', 'Μίμηση της Δύσης ή δικός μας δρόμος;'].every(x => K2B1D.includes(x)));
ok('⭐⭐ Κεφ.2 Β.1 · και τα ΕΞΙ δικαιώματα είναι στο σχεδιάγραμμα',
   ['Ισότητα', 'Απαγόρευση', 'Απαραβίαστο', 'Ελευθερία', 'Προστασία', 'Δωρεάν'].every(x => K2B1D.includes('<b>' + x + '</b>')));
ok('⭐⭐ Κεφ.2 Β.1 · η προσυπογραφή ζει ΜΕΣΑ στην κάρτα του βασιλιά, ως περιορισμός (WARN)',
   /<h4>Ο βασιλιάς<\/h4>[\s\S]*?\{\{WARN\}\}<span>[^<]*<b>καμία πράξη του δεν είχε ισχύ<\/b>/.test(PAGE));
ok('⛔ Κεφ.2 Β.1 · κανένα <b> μέσα σε span του .oc',
   [...K2B1D.matchAll(/class="oc [a-z]+">[\s\S]*?<span>([\s\S]*?)<\/span>/g)].every(m => !/<b>/.test(m[1])));
ok('⭐ Κεφ.2 Β.1 · ο τίτλος της μπαίνει στο hero',
   (boot('#/k2-b1/explain').painted.hero || '').includes('Το σύνταγμα του 1844'));
const K2B1S = boot('#/k2-b1/sources').painted['panel-sources'] || '';
ok('⭐⭐ Κεφ.2 Β.1 · οι «Πηγές»: Διαμαντούρος · Δραγούμης τ. 2 · σύνταγμα 1864, ονομαστικά',
   ['Νικηφόρος Διαμαντούρος', 'τ. 2, σ. 93', 'Αλέξανδρος Σβώλος'].every(x => K2B1S.includes(x)));
ok('  ⭐⭐ …και ο Δραγούμης δηλώνεται ως η φωνή που ΤΕΝΤΩΝΕΙ το κείμενο (δικαίωμα ≠ πράξη)',
   K2B1S.includes('ΤΕΝΤΩΝΕΙ το κυρίως κείμενο') && K2B1S.includes('ΠΡΑΞΗ'));

const K2B1 = CHAPTERS.find(c => c.id === 'k2-b1');
if (K2B1) {
  const fB = K2B1.paragraphs.join('\n');
  is('⭐ Κεφ.2 Β.1 · ΕΝΝΙΑ παράγραφοι (οι διατάξεις α · β · γ είναι χωριστές)', K2B1.paragraphs.length, 9);
  ok('  ⭐ οι τρεις διατάξεις ξεκινούν με α) β) γ), με τη σειρά',
     /^α\)/.test(K2B1.paragraphs[3]) && /^β\)/.test(K2B1.paragraphs[4]) && /^γ\)/.test(K2B1.paragraphs[5]));
  ok('  ⛔ ο υπότιτλος του τμήματος/ενότητας ΔΕΝ μπήκε ως παράγραφος',
     !K2B1.paragraphs.some(p => /ΧΕΙΡΑΦΕΤΗΣΗ|^1\.\s*Το σύνταγμα/.test(p)));
  ok('  ⛔ καμία υποσημείωση στην πρόζα (Εκλογικός Νόμος · Διαμαντούρος · νοθεία · Σβώλος)',
     !/Εκλογικός Νόμος|Διαμαντούρος|σαπουνοκασέλαι|Σβώλος|άρρενες/.test(fB));
  ok('  ⛔ καμία λεζάντα στην πρόζα (λιθογραφία · Λάβαρο · Μουσείο)', !/λιθογραφία|Λάβαρο|Μουσείο/.test(fB));
  /* ⛔ ΤΑ ΠΕΝΤΕ ΤΥΠΟΓΡΑΦΙΚΑ ΜΕΝΟΥΝ — ονομαστικά */
  is('⭐⭐ Κεφ.2 Β.1 · κρατάει και τα ΠΕΝΤΕ τυπογραφικά του βιβλίου',
     K2B1.sic.map(x => x.m).join(' | '), 'διαφορές Πάντως | ψηφοφορίας10 | παγκοσμία | Συνδυασμων | vέους');
  ok('  ⭐ το «v» του «vέους» είναι ΛΑΤΙΝΙΚΟ (U+0076) — στο κείμενο ΚΑΙ στο sic',
     fB.includes('vέους') && !fB.includes('νέους όρους') && K2B1.sic[4].m.charCodeAt(0) === 0x76);
  /* ⛔⛔ ΤΟ ΧΡΟΝΟΛΟΓΙΟ ΕΙΝΑΙ ΚΑΘΑΡΑ ΤΟΥ ΚΕΙΜΕΝΟΥ */
  is('⛔⛔ Κεφ.2 Β.1 · οι χρονολογίες βιβλίου είναι ΑΚΡΙΒΩΣ της πρόζας',
     K2B1.timeline.events.filter(e => e.book).map(e => e.label).join(','), '1843,1843-44');
  ok('  ⭐ ψήφιση 1844 · 1862 · 1864 μόνο ως «Πλαίσιο», με δηλωμένο γιατί',
     K2B1.timeline.events.filter(e => !e.book).map(e => e.y).join(',') === '1844,1862,1864'
     && K2B1.timeline.events.filter(e => !e.book).every(e => /δεν γράφεται/i.test(e.note || '')));
  ok('  ⭐ η σειρά του χρονολογίου είναι χρονολογική (ο renderer ΔΕΝ ταξινομεί)',
     K2B1.timeline.events.every((e, i, a) => !i || a[i - 1].y <= e.y));
  ok('⭐⭐ Κεφ.2 Β.1 · η «αδυναμία» (συνέρχεσθαι) ζει σε act, έννοια, pitfall ΚΑΙ στην πηγή του 1864',
     K2B1.explain.acts.some(a => /συνέρχεσθαι και συνεταιρίζεσθαι/.test(a.body))
     && K2B1.explain.concepts.some(c => /Συνέρχεσθαι/.test(c.t))
     && K2B1.explain.pitfalls.some(p => /συνέρχεσθαι/.test(p.no))
     && K2B1.sources.list.some(x => /Άρθρον 10/.test(x.gist)));
  ok('⭐⭐ Κεφ.2 Β.1 · το «Ίσως… Όμως» είναι pitfall — η μίμηση ΔΕΝ είναι το συμπέρασμα του βιβλίου',
     K2B1.explain.pitfalls.some(p => /μίμηση/.test(p.no) && /Όμως/.test(p.ok)));
  ok('⭐ Κεφ.2 Β.1 · «για τους άνδρες»: η καθολική ψηφοφορία δεν παρουσιάζεται ποτέ ως και για γυναίκες',
     K2B1.explain.pitfalls.some(p => /γυναίκες/.test(p.no) && /για τους άνδρες/.test(p.ok)));
  is('⛔ Κεφ.2 Β.1 · κανένας όρος Α1 γραμμένος από μένα', (K2B1.terms || []).length, 0);
}

/* ══ 10 · Η ΥΛΗ ΚΑΙ ΤΑ ID ════════════════════════════════════════════
   Τα id είναι ΣΥΜΒΟΛΑΙΟ: κουβαλάνε τις σημειώσεις του. Ένα διπλό id
   σημαίνει δύο ενότητες που μοιράζονται πλαγιότιτλους — αθόρυβα. */
section('10 · Ο ΣΚΕΛΕΤΟΣ ΟΛΟΥ ΤΟΥ ΒΙΒΛΙΟΥ');
const yliBlock = PAGE.match(/const YLI = (\[[\s\S]*?\]);\n<\/script>/);
const Y = yliBlock ? JSON.parse(yliBlock[1]) : [];
is('πέντε κεφάλαια', Y.length, 5);
const allU = Y.flatMap(c => c.secs.flatMap(sx => sx.units));
is('105 ενότητες συνολικά', allU.length, 105);
const ids = allU.map(u => u.id);
const dups = ids.filter((x, i) => ids.indexOf(x) !== i);
is('⭐ ΜΗΔΕΝ διπλά id', dups.length + (dups.length ? ' → ' + [...new Set(dups)].join(', ') : ''), 0);
ok('⭐ το «k1-g4» υπάρχει και είναι η έτοιμη ενότητα', ids.includes('k1-g4'));
ok('κάθε έτοιμη ενότητα των CHAPTERS έχει θέση στον χάρτη',
   PAGE.match(/id: "([^"]+)",\n  num:/g).map(m => m.match(/"([^"]+)"/)[1]).every(id => ids.includes(id)));
/* Το κεφ. 3 έχει ΔΥΟ μέρη που ξεκινούν και τα δύο από το «Α». */
const k3 = ids.filter(i => i.indexOf('k3-') === 0), k3b = ids.filter(i => i.indexOf('k3b-') === 0);
ok('⭐ ο 20ός αιώνας του Προσφυγικού πήρε δικό του πρόθεμα (k3b-)', k3b.length >= 10);
ok('  και ο 19ος κράτησε το k3-', k3.length >= 11);
ok('  ώστε «Η μέριμνα» και «Η έξοδος» να ΜΗΝ μοιράζονται id',
   ids.includes('k3-b1') && ids.includes('k3b-b1'));
/* Το «1.Η έξοδος» γράφεται ΧΩΡΙΣ κενό στο βιβλίο και το είχα χάσει. */
ok('⚠️ «Η έξοδος» υπάρχει (χάθηκε μια φορά επειδή το βιβλίο γράφει «1.Η»)',
   allU.some(u => u.title === 'Η έξοδος'));
ok('⚠️ «Τα δημογραφικά δεδομένα» υπάρχει (ζει σε span.bold, όχι div.title)',
   allU.some(u => u.title === 'Τα δημογραφικά δεδομένα'));
ok('⚠️ «Η «νέα γενιά»» υπάρχει (γράφεται «3.Η» χωρίς κενό)',
   allU.some(u => u.title.indexOf('νέα γενιά') >= 0));
is('εντός εξεταστέας ύλης', allU.filter(u => u.yli).length, 69);
ok('και το εκτός ύλης ΔΕΝ κρύβεται — απλώς σημειώνεται',
   allU.some(u => !u.yli) && PAGE.includes('>Εκτός ύλης<'));
/* ⚠️ ΑΝΤΙΘΕΣΗ: το --faint μετράει 2,69:1 πάνω σε κάρτα. Απαγορεύεται
   σε ΟΤΙΔΗΠΟΤΕ διαβάζεται ή πατιέται (σταθ. 52 · als-v525). */
ok('⭐ η ετικέτα «Εκτός ύλης» ΔΕΝ φοράει το --faint', /\.urow \.tag\{[^}]*color:var\(--muted\)/.test(CSS));
ok('⭐ ούτε το ✕ που σβήνει πλαγιότιτλο', /\.xbtn\{[^}]*color:var\(--muted\)/.test(CSS));
/* ⚠️ Το κεχριμπαρένιο φόντο της έτοιμης κάρτας ρίχνει το --muted σε
   4,34:1. ΜΕΣΑ σε αυτό το κουτί τίποτα δεν το φοράει. */
ok('⭐ και τίποτα μέσα στην ΕΤΟΙΜΗ κάρτα (φόντο --pen-soft → 4,34:1)',
   !/\.ucard \.(un|um)\{[^}]*color:var\(--muted\)/.test(CSS));
is('καμία κάρτα δεν κρατάει τον αέρα της διπλανής (align-items:start)',
   (CSS.match(/align-items:start\}/g) || []).length >= 6, true);
ok('οι τίτλοι κεφαλαίων γράφονται με τόνους, όχι κεφαλαία',
   Y.every(c => c.title !== c.title.toUpperCase()));
ok('  και κρατούν τις λέξεις του βιβλίου',
   Y[0].title === 'Από την αγροτική οικονομία στην αστικοποίηση'
   && Y[4].title === 'Παρευξείνιος Ελληνισμός');
ok('η σελίδα ονομάζει την Υ.Α. που στηρίζει τη σήμανση', PAGE.includes('90176/Δ2/06-07-2026'));
ok('⛔ κανένα @media(min-width) μπήκε με τις νέες οθόνες',
   !/@media[^{]*min-width/.test(CSS));

console.log('\n' + (fail ? '✗' : '✓') + ' ' + pass + ' πέρασαν · ' + fail + ' απέτυχαν');
process.exit(fail ? 1 : 0);
