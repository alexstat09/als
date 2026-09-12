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

/* ── οι παράγραφοι της σελίδας, όπως τις γράφει το CHAPTERS ── */
const parBlock = PAGE.match(/paragraphs: \[([\s\S]*?)\n  \],/);
const PARS = parBlock ? eval('[' + parBlock[1] + ']') : [];

/* ── οι παράγραφοι του ΒΙΒΛΙΟΥ, από το ανεξάρτητο αρχείο ── */
const BOOK = SRC.split(/@@P\d+/).slice(1).map(s => s.trim()).filter(Boolean);

/* ══ 1 · Η ΓΕΙΩΣΗ ════════════════════════════════════════════════════ */
section('1 · ΤΟ ΚΕΙΜΕΝΟ ΕΙΝΑΙ ΤΟΥ ΒΙΒΛΙΟΥ, ΧΑΡΑΚΤΗΡΑ ΠΡΟΣ ΧΑΡΑΚΤΗΡΑ');
is('τρεις παράγραφοι στη σελίδα', PARS.length, 3);
is('τρεις παράγραφοι στην πηγή',  BOOK.length, 3);
PARS.forEach((p, i) => is('παράγραφος ' + (i + 1) + ' ταυτόσημη με το βιβλίο', p, BOOK[i] || '(λείπει)'));
ok('η πηγή δηλώνει το sha256 του κατεβάσματος', /sha256 [0-9a-f]{64}/.test(SRC));
ok('η πηγή δηλώνει τη διεύθυνση στο ebooks.edu.gr', SRC.includes('ebooks.edu.gr'));

/* ══ 2 · ΤΑ ΤΥΠΟΓΡΑΦΙΚΑ ΤΟΥ ΒΙΒΛΙΟΥ ══════════════════════════════════ */
section('2 · ΤΑ ΤΡΙΑ ΤΥΠΟΓΡΑΦΙΚΑ ΜΕΝΟΥΝ — ΤΟ ΒΙΒΛΙΟ ΔΕΝ «ΔΙΟΡΘΩΝΕΤΑΙ»');
const sicBlock = PAGE.match(/sic: \[([\s\S]*?)\n  \],/);
const SIC = sicBlock ? eval('[' + sicBlock[1] + ']') : [];
is('τρία δηλωμένα τυπογραφικά', SIC.length, 3);
const FULL = PARS.join('\n');
SIC.forEach(s => {
  ok('«' + s.m + '» υπάρχει ΑΥΤΟΥΣΙΟ στο κείμενο', FULL.includes(s.m));
  ok('και η διόρθωση «' + s.fix + '» ΔΕΝ έχει μπει στο κείμενο', !FULL.includes(s.fix));
});

/* ══ 3 · ΚΑΘΕ ΑΓΚΥΡΑ ΔΕΙΧΝΕΙ ΣΕ ΠΡΑΓΜΑΤΙΚΗ ΦΡΑΣΗ ════════════════════ */
section('3 · ΟΙ ΑΓΚΥΡΕΣ — ΚΑΝΕΝΑ ΚΟΥΜΠΙ ΔΕΝ ΔΕΙΧΝΕΙ ΣΤΟ ΠΟΥΘΕΝΑ');
const anchors = [];
for (const re of [/\bquote: "([^"]+)"/g, /\bq: "([^"]+)"/g, /\blink: "([^"]+)"/g, /\{ m: "([^"]+)"/g]) {
  let m; while ((m = re.exec(PAGE))) anchors.push(m[1]);
}
const orphan = anchors.filter(a => !FULL.includes(a));
is('αγκύρες που ΔΕΝ υπάρχουν αυτολεξεί στο κείμενο', orphan.length + (orphan.length ? ' → ' + orphan.join(' | ') : ''), 0);
ok('και είναι πολλές, όχι δείγμα', anchors.length >= 40);

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
ok('και το CACHE προχώρησε (σταθ. 2)', cache && +cache[1].slice(5) >= 542);
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

function boot(hash){
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
  const ls = {};
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
   && (B.painted.viewHome || '').includes('Δεν έχει φτιαχτεί ακόμα') && (B.painted.viewHome || '').includes('Εκτός εξεταστέας ύλης'));
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
   allU.some(u => !u.yli) && PAGE.includes('ΕΚΤΟΣ ΥΛΗΣ'));
ok('η σελίδα ονομάζει την Υ.Α. που στηρίζει τη σήμανση', PAGE.includes('90176/Δ2/06-07-2026'));
ok('⛔ κανένα @media(min-width) μπήκε με τις νέες οθόνες',
   !/@media[^{]*min-width/.test(CSS));

console.log('\n' + (fail ? '✗' : '✓') + ' ' + pass + ' πέρασαν · ' + fail + ' απέτυχαν');
process.exit(fail ? 1 : 0);
