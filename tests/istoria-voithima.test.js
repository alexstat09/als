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
                  'k1-b5': 'istoria-voithima-b5.source.txt' };

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
    (String(e.label).match(/\d{4}/g) || [String(e.y)]).forEach(y => {
      if (!inBook.has(y)) badYears.push(C.id + ' ' + e.id + ' → ' + y);
    });
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
const thin = [], hollow = [], dup = [];
CHAPTERS.forEach(C => {
  const floor = [['πράξεις', C.explain.acts.length, 5], ['έννοιες', C.explain.concepts.length, 3],
                 ['παγίδες', C.explain.pitfalls.length, 5], ['λεξικό', C.glossary.length, 35],
                 ['fun facts', C.facts.length, 8], ['πηγές', C.sources.list.length, 3],
                 ['«πώς το γράφω»', C.sources.how.length, 3], ['χρονολόγιο', C.timeline.events.length, 5],
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
is('⭐ κανένα κενό πεδίο σε πράξη, πηγή, παγίδα, έννοια ή λήμμα', hollow.join(' | '), '');
is('⛔ δύο λήμματα πάνω στην ίδια φράση (το ένα θα έσβηνε το άλλο)', dup.join(' | '), '');
is('⛔ έμεινε «ΣΥΜΠΛΗΡΩΣΕ» από τον σκελετό του tools/istoria-unit.js',
   CHAPTERS.filter(C => JSON.stringify(C).indexOf('ΣΥΜΠΛΗΡΩΣΕ') >= 0).map(C => C.id).join(' | '), '');
is('⭐ κάθε ενότητα έχει το δικό της σχεδιάγραμμα στο δεύτερο <script>',
   CHAPTERS.map((C, i) => PAGE.includes('CHAPTERS[' + i + '].diagram = `') ? '' : C.id).filter(Boolean).join(' | '), '');
ok('  και οι πηγές είναι ΠΑΝΤΑ τρεις — πηγή/αριθμοί/διαφωνία',
   CHAPTERS.every(C => C.sources.list.length === 3));

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
is('ακριβώς 7 καρτέλες', TABS.length, 7);
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
is('χτίζονται 7 πάνελ', ((C.painted.panels || '').match(/role="tabpanel"/g) || []).length, 7);
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
