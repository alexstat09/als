/* ══════════════════════════════════════════════════════════════════════
   tests/istoria-themata.test.js — ΤΟ ΡΑΝΤΑΡ ΤΩΝ ΘΕΜΑΤΩΝ

   ⭐ ΓΙΑΤΙ ΥΠΑΡΧΕΙ, ΚΑΙ ΕΙΝΑΙ ΜΙΑ ΠΡΟΤΑΣΗ: αυτή η σελίδα λέει στον μαθητή
   «ΑΥΤΟ ΕΧΕΙ ΠΕΣΕΙ». Αν λέει ψέματα, του παίρνει ώρες από την πιο ακριβή
   νύχτα της χρονιάς. Άρα ο φρουρός δεν ελέγχει «σχήμα» — ελέγχει ΑΛΗΘΕΙΑ:

     Α. ΓΕΙΩΣΗ. Κάθε εκφώνηση με σήμα «Πανελλαδικές» (k:"pan") ή
        «Διαγώνισμα» (k:"diag") πρέπει να υπάρχει ΑΥΤΟΥΣΙΑ μέσα στο
        tests/istoria-themata.source.txt, που κατέβηκε ΑΝΕΞΑΡΤΗΤΑ με curl
        από minedu.gov.gr / edu.klimaka.gr / filologika.gr. Δεν παράγεται
        από τη σελίδα — αλλιώς θα συμφωνούσε τέλεια με κάθε λάθος της.
        ⛔⛔ Η ΣΥΓΚΡΙΣΗ ΓΙΝΕΤΑΙ ΧΩΡΙΣ ΚΕΝΑ. Τα PDF σπάνε λέξεις στη μέση
        («με ταλλευτικής», «Μονάδες 1 5»), οπότε σύγκριση με κενά θα
        απέτυχε σε ΣΩΣΤΟ κείμενο και θα με έσπρωχνε να χαλαρώσω τον έλεγχο.
     Β. ΤΟ ΣΗΜΑ ΔΕΝ ΓΛΙΣΤΡΑΕΙ. «mine» = δεν έχει πέσει, άρα ΑΠΑΓΟΡΕΥΕΤΑΙ
        να κουβαλάει χρονιά ή πηγή. «panx» = απόδοση, άρα ΔΕΝ ελέγχεται
        για αυτούσιο — και ακριβώς γι' αυτό πρέπει να δηλώνει πηγή.
     Γ. ΚΑΜΙΑ ΕΝΟΤΗΤΑ ΧΩΡΙΣ ΤΙΠΟΤΑ. 21 εντός ύλης· αν κάποια μείνει άδεια,
        η σελίδα του λέει σιωπηλά «εδώ δεν έχεις να φοβάσαι».
     Δ. ΤΟ ΕΥΡΕΤΗΡΙΟ ΕΙΝΑΙ ΠΑΡΑΓΟΜΕΝΟ. Δείχνουμε «λέξεις που ζουν ΜΟΝΟ
        εδώ»· αν το αρχείο γραφτεί με το χέρι, ο ισχυρισμός γίνεται γούστο.

   ⚠️⚠️ ΤΟ ΜΑΘΗΜΑ ΠΟΥ ΠΛΗΡΩΘΗΚΕ ΗΔΗ, ΠΡΙΝ ΚΑΝ ΤΡΕΞΕΙ Ο ΦΡΟΥΡΟΣ: είχα
   γράψει τα Α1 ως «Να δώσετε το περιεχόμενο του ακόλουθου όρου: ΠΑΟΥΕΡ»
   και τα είχα σημαδέψει ΑΥΤΟΥΣΙΑ. Το γραπτό ζητάει ΤΡΕΙΣ όρους μαζί· το
   να κρατήσω τον έναν είναι ΠΕΡΙΛΗΨΗ, όχι αντιγραφή. Ένα «αυτούσιο» που
   κόβει τα δύο τρίτα της εκφώνησης κρύβει ακριβώς αυτό που πρέπει να δει
   ο μαθητής: ότι το Α1 ΠΟΤΕ δεν μένει σε ένα κεφάλαιο.

   ⛔ ΜΗΝ «ΔΙΟΡΘΩΣΕΙΣ» ΝΟΥΜΕΡΟ ΕΔΩ ΕΠΕΙΔΗ ΠΡΟΣΘΕΣΕΣ ΕΚΦΩΝΗΣΗ. Δεν υπάρχει
   κανένα καρφωμένο πλήθος σε αυτό το αρχείο, επίτηδες: κάθε έλεγχος είναι
   αναλλοίωτο πάνω στο ΥΛΙΚΟ («κάθε pan υπάρχει στην πηγή»), όχι μέτρημα.
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ALS = path.resolve(__dirname, '..');

let pass = 0, fail = 0;
function ok (name, cond) { cond ? pass++ : fail++; console.log((cond ? '  ✓ ' : '  ✗ FAIL ') + name); }
function is (name, got, want) {
  const good = String(got) === String(want);
  good ? pass++ : fail++;
  console.log((good ? '  ✓ ' : '  ✗ FAIL ') + name + (good ? '' : `\n      got ${got} · want ${want}`));
}
function section (s) { console.log('\n' + s); }

const PAGE   = fs.readFileSync(path.join(ALS, 'istoria-themata.html'), 'utf8');
const SW     = fs.readFileSync(path.join(ALS, 'sw.js'), 'utf8');
const HOME   = fs.readFileSync(path.join(ALS, 'istoria.html'), 'utf8');
const AID    = fs.readFileSync(path.join(ALS, 'istoria-voithima.html'), 'utf8');
const SOURCE = fs.readFileSync(path.join(__dirname, 'istoria-themata.source.txt'), 'utf8');

/* ΤΑ ΣΧΟΛΙΑ ΒΓΑΙΝΟΥΝ ΠΡΩΤΑ, ΠΑΝΤΑ — αλλιώς ο φρουρός «βρίσκει» την ίδια
   την περιγραφή του bug μέσα σε σχόλιο και περνάει χαρούμενος. */
const CSS = PAGE.slice(PAGE.indexOf('<style>'), PAGE.indexOf('</style>')).replace(/\/\*[\s\S]*?\*\//g, '');
const JS  = PAGE.slice(PAGE.indexOf('</style>')).replace(/\/\*[\s\S]*?\*\//g, '').replace(/<!--[\s\S]*?-->/g, '');

/* ── τα δύο αρχεία δεδομένων, φορτωμένα ΟΠΩΣ τα φορτώνει ο browser ── */
const ctx = vm.createContext({ console });
vm.runInContext(fs.readFileSync(path.join(ALS, 'istoria-themata-index.js'), 'utf8'), ctx);
vm.runInContext(fs.readFileSync(path.join(ALS, 'istoria-themata-themes.js'), 'utf8'), ctx);
const { THI_UNITS, THI_IDX, THI_SIG, THI_THEMES, THI_SRC } = ctx;

const strip = s => String(s).replace(/\s+/g, '')
                            .replace(/[«»"'`´’‘]/g, '')
                            .replace(/[‐-―]/g, '-');
const SRC_FLAT = strip(SOURCE);

/* ══════════════════ Α · Η ΓΕΙΩΣΗ ══════════════════ */
section('Α · κάθε «αυτούσιο» υπάρχει στην ΑΝΕΞΑΡΤΗΤΗ πηγή');

const verbatim = THI_THEMES.filter(t => t.k === 'pan' || t.k === 'diag');
ok('υπάρχουν εκφωνήσεις σημαδεμένες ως αυτούσιες', verbatim.length > 0);

let missing = [];
verbatim.forEach(t => {
  if (SRC_FLAT.indexOf(strip(t.t)) === -1) missing.push((t.y || '—') + ' ' + (t.th || '') + ' :: ' + t.t.slice(0, 80));
});
ok('ΚΑΜΙΑ αυτούσια εκφώνηση δεν λείπει από την πηγή (' + verbatim.length + ' ελέγχθηκαν)' +
   (missing.length ? '\n      ' + missing.join('\n      ') : ''), missing.length === 0);

/* Ο έλεγχος πρέπει να μπορεί ΝΑ ΑΠΟΤΥΧΕΙ — αλλιώς είναι διακοσμητικός.
   Αν το SRC_FLAT περιέχει τα πάντα, δεν αποδεικνύει τίποτα. */
ok('ο έλεγχος γείωσης ΜΠΟΡΕΙ να αποτύχει (αρνητικό δείγμα)',
   SRC_FLAT.indexOf(strip('Να αναφερθείτε στην εμπορική ναυτιλία της Ισλανδίας')) === -1);

/* ══════════════════ Β · ΤΟ ΣΗΜΑ ══════════════════ */
section('Β · το σήμα προέλευσης δεν γλιστράει');

const KINDS = ['pan', 'panx', 'diag', 'mine'];
ok('κανένα άγνωστο είδος', THI_THEMES.every(t => KINDS.indexOf(t.k) !== -1));
ok('κάθε αληθινή εκφώνηση δηλώνει πηγή',
   THI_THEMES.filter(t => t.k !== 'mine').every(t => t.src && THI_SRC[t.src] && /^https:\/\//.test(THI_SRC[t.src].u)));
ok('καμία «δική μου» δεν παριστάνει χρονιά ή πηγή',
   THI_THEMES.filter(t => t.k === 'mine').every(t => !t.y && !t.s && !t.src));
ok('κάθε εκφώνηση έχει κείμενο, μονάδες και τουλάχιστον μία ενότητα',
   THI_THEMES.every(t => typeof t.t === 'string' && t.t.length > 20 &&
                         typeof t.mon === 'number' && t.mon > 0 &&
                         Array.isArray(t.u) && t.u.length > 0));
ok('κάθε δείκτης ενότητας υπάρχει πραγματικά',
   THI_THEMES.every(t => t.u.every(i => Number.isInteger(i) && i >= 0 && i < THI_UNITS.length)));
ok('καμία εκφώνηση δεν δείχνει δύο φορές την ίδια ενότητα',
   THI_THEMES.every(t => new Set(t.u).size === t.u.length));

/* ⚠️ Το «1 από 5» δεν είναι καλλωπισμός: το 2 είναι ΔΙΚΗ ΜΟΥ διαίρεση του
   10 διά 5, και το γραπτό δεν δίνει μονάδες ανά πρόταση. Όποιο Α2 χάσει
   αυτή τη σήμανση, αρχίζει να δείχνει εφευρημένο νούμερο ως γεγονός. */
ok('κάθε μεμονωμένη πρόταση Α2 δηλώνεται ως 1 από 5',
   THI_THEMES.filter(t => /^Α2 /.test(t.th || '')).every(t => t.one === 1));
ok('η σελίδα ΤΥΠΩΝΕΙ τη σήμανση «1 από 5»', /t\.one \?/.test(JS) && /1 από 5/.test(JS));

/* ══════════════════ Γ · Η ΚΑΛΥΨΗ ══════════════════ */
section('Γ · καμία ενότητα δεν μένει σιωπηλή');

is('ενότητες εντός ύλης', THI_UNITS.length, 21);
ok('η Β.11 (εκτός ύλης) ΔΕΝ είναι εδώ', !THI_UNITS.some(u => /εξωελλαδικό/i.test(u.title)));
const empty = THI_UNITS.map((u, i) => THI_THEMES.some(t => t.u.indexOf(i) !== -1) ? null : u.code).filter(Boolean);
ok('κάθε ενότητα έχει τουλάχιστον μία εκφώνηση' + (empty.length ? ' — λείπουν: ' + empty.join(', ') : ''), empty.length === 0);

/* Το κενό του Αλεξ. Αν η Γ.3 πάψει να δείχνει ότι έχει πέσει, χάνεται
   ακριβώς το εύρημα που τον έστειλε να τη διαβάσει. */
const g3 = THI_UNITS.findIndex(u => /1910-1922/.test(u.title));
ok('η Γ.3 υπάρχει', g3 >= 0);
ok('η Γ.3 κουβαλάει ΑΛΗΘΙΝΟ θέμα, όχι μόνο δικές μου κατασκευές',
   THI_THEMES.some(t => t.u.indexOf(g3) !== -1 && t.k !== 'mine'));
const b4 = THI_UNITS.findIndex(u => /ορυχείων/.test(u.title));
ok('τα ορυχεία (Β.4) κουβαλάνε το θέμα των 25 μονάδων του 2022',
   THI_THEMES.some(t => t.u.indexOf(b4) !== -1 && t.k === 'pan' && t.mon === 25));

/* ══════════════════ Δ · ΤΟ ΕΥΡΕΤΗΡΙΟ ══════════════════ */
section('Δ · το ευρετήριο είναι μετρημένο, όχι γραμμένο');

const IDXFILE = fs.readFileSync(path.join(ALS, 'istoria-themata-index.js'), 'utf8');
ok('το αρχείο δηλώνει ότι είναι παραγόμενο', /ΠΑΡΑΓΟΜΕΝΟ ΑΡΧΕΙΟ/.test(IDXFILE));
ok('ο γεννήτορας υπάρχει', fs.existsSync(path.join(ALS, 'tools/istoria-themata-build.js')));
ok('κάθε ενότητα έχει μέγεθος', THI_UNITS.every(u => u.par > 0 && u.words > 0));
ok('κάθε λίστα ευρετηρίου είναι ταξινομημένη και χωρίς διπλά',
   Object.keys(THI_IDX).every(k => {
     const v = THI_IDX[k];
     return Array.isArray(v) && v.length && new Set(v).size === v.length &&
            v.every((x, i) => i === 0 || x > v[i - 1]);
   }));
is('τα σημάδια είναι όσες και οι ενότητες', THI_SIG.length, THI_UNITS.length);

/* ⛔ Ο πυρήνας του ισχυρισμού: «λέξεις που ζουν ΜΟΝΟ εδώ». Αν έστω μία
   λέξη του THI_SIG ζει και αλλού, η κάρτα ψεύδεται. */
let leaky = [];
THI_SIG.forEach((list, i) => list.forEach(w => {
  const n = String(w).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ς/g, 'σ');
  const where = THI_IDX[n];
  if (!where || where.length !== 1 || where[0] !== i) leaky.push(THI_UNITS[i].code + ':' + w);
}));
ok('κάθε «σημάδι» ζει ΟΝΤΩΣ σε μία μόνο ενότητα' + (leaky.length ? ' — ' + leaky.slice(0, 6).join(', ') : ''), leaky.length === 0);

/* Και η απόδειξη ότι η λέξη-παγίδα ΕΙΝΑΙ παγίδα — το εύρημα που γέννησε
   τη σελίδα. Χωρίς αυτό, το «ράνταρ» θα μπορούσε να είναι διακοσμητικό. */
ok('«βιομηχαν» ανοίγει πολλές ενότητες (παγίδα)',
   Object.keys(THI_IDX).filter(k => k.indexOf('βιομηχαν') === 0)
     .reduce((s, k) => { THI_IDX[k].forEach(u => s.add(u)); return s; }, new Set()).size >= 5);
ok('«κληριγκ» ανοίγει ακριβώς μία (δείκτης)',
   THI_IDX['κληριγκ'] && THI_IDX['κληριγκ'].length === 1);

/* ⛔⛔ ΜΙΑ ΜΕΤΡΗΣΗ ΠΟΥ ΖΕΙ ΜΟΝΟ ΣΕ ΣΧΟΛΙΟ ΣΑΠΙΖΕΙ, ΚΑΙ ΣΑΠΙΣΕ ΗΔΗ.
   Είχα γράψει στα σχόλια «6 παράγραφοι, 753 λέξεις» ενώ η ίδια κάρτα
   τύπωνε 757 — δύο νούμερα για το ίδιο πράγμα, στην ίδια οθόνη, και το
   λάθος ήταν ΤΟΥ ΧΕΡΙΟΥ. Το μέγεθος το μετράει ο γεννήτορας· το σχόλιο
   ΑΠΑΓΟΡΕΥΕΤΑΙ να το ξαναλέει. */
section('Ε0 · κανένα μέγεθος γραμμένο με το χέρι μέσα στα σχόλια');
const handCount = THI_THEMES.filter(t => t.n && /\d+\s*(λέξεις|παράγραφο)/.test(t.n))
                            .map(t => (t.y || '—') + ' ' + (t.th || ''));
ok('κανένα σχόλιο δεν ξαναγράφει μέγεθος ενότητας' + (handCount.length ? ' — ' + handCount.join(', ') : ''),
   handCount.length === 0);

/* ⛔ Ο ΛΟΓΟΣ ΠΟΥ Η ΣΕΛΙΔΑ ΕΒΓΑΖΕ 1.820px ΣΕ ΟΘΟΝΗ 400px: δύο <code> χωρίς
   κενό ανάμεσά τους ΔΕΝ έχουν ευκαιρία αλλαγής γραμμής. Δεν φταίει το
   πλάτος τους, φταίει ότι είναι inline και κολλητά. Η θεραπεία είναι
   δοχείο flex-wrap — και ελέγχεται ΘΕΤΙΚΑ, γιατί το σύμπτωμα είναι
   αόρατο σε λάπτοπ. */
section('Ε1 · οι λέξεις-πλακίδια ΣΠΑΝΕ σε στενή οθόνη');
['\\.sig\\{', '\\.hits\\{'].forEach(sel => {
  const m = CSS.match(new RegExp(sel + '([^}]*)\\}'));
  ok(sel.replace(/\\/g, '') + ' είναι flex-wrap', !!m && /display:flex/.test(m[1]) && /flex-wrap:wrap/.test(m[1]));
});

/* ══════════════════ Ε · Η ΣΕΛΙΔΑ ══════════════════ */
section('Ε · η σελίδα, όπως τη φορτώνει ο browser');

ok('φορτώνει και τα δύο αρχεία δεδομένων',
   /src="istoria-themata-index\.js"/.test(PAGE) && /src="istoria-themata-themes\.js"/.test(PAGE));
ok('⛔ ΚΑΜΙΑ topbar.js (σταθ. 18)', !/topbar\.js/.test(PAGE.replace(/<!--[\s\S]*?-->/g, '')));
ok('⛔ ΚΑΝΕΝΑ sync.js — ο αναγνώστης δεν γράφει', !/sync\.js/.test(PAGE.replace(/<!--[\s\S]*?-->/g, '')));
ok('⛔ κανένα @media (min-width) — ο Αλεξ διαβάζει από λάπτοπ', !/@media[^{]*min-width/.test(CSS));
/* ⛔⛔ ΕΛΕΓΧΟΣ ΘΕΣΗΣ, ΟΧΙ ΥΠΑΡΞΗΣ — και είναι το ίδιο μάθημα με τη λωρίδα
   των 684px: ο σύνδεσμος ΥΠΗΡΧΕ, αλλά κάτω από 21 κάρτες ενοτήτων. Ο Αλεξ
   είπε «δεν έχει back button» και είχε δίκιο: ό,τι ζει μετά από δύο οθόνες
   κύλισης δεν υπάρχει. Ο έλεγχος απαιτεί να είναι ΠΡΙΝ τις κάρτες. */
const backTop  = PAGE.indexOf('class="back top"');
const unitsBox = PAGE.indexOf('id="units"');
ok('υπάρχει δρόμος πίσω ΠΑΝΩ-ΠΑΝΩ, πριν από τις κάρτες',
   backTop > 0 && unitsBox > 0 && backTop < unitsBox);
ok('και ο κάτω δρόμος πίσω μένει', /class="back" href="istoria-voithima\.html"/.test(PAGE));
ok('κάθε πρόσβαση σε localStorage είναι σε try/catch',
   (JS.match(/localStorage/g) || []).length === (JS.match(/try \{[^}]*localStorage/g) || []).length);
ok('το υποσέλιδο εξηγεί ΤΙ σημαίνει κάθε σήμα', /δεν έχει πέσει ποτέ/.test(PAGE));
ok('η λεζάντα των σημάτων υπάρχει στο markup', /class="legend"/.test(PAGE));

/* Η σελίδα ΔΕΝ πρέπει να τυπώνει καρφωμένα πλήθη — τα μετράει. */
ok('τα νούμερα της κεφαλίδας υπολογίζονται, δεν γράφονται',
   /realCount = T\.filter/.test(JS) && /uniqWords = KEYS\.filter/.test(JS));

/* ══════════════════ ΣΤ · Η ΕΓΚΑΤΑΣΤΑΣΗ ══════════════════ */
section('ΣΤ · offline + ο δρόμος προς τη σελίδα');

['istoria-themata.html', 'istoria-themata-index.js', 'istoria-themata-themes.js'].forEach(f => {
  ok('το sw.js προφορτώνει ' + f, SW.indexOf("'" + f + "'") !== -1);
});
ok('υπάρχει δρόμος προς τη σελίδα από την istoria.html', /istoria-themata\.html/.test(HOME));
/* ⛔⛔ ΚΑΙ ΑΠΟ ΤΟ ΒΟΗΘΗΜΑ, ΠΟΥ ΕΙΝΑΙ ΤΟ ΜΟΝΟ ΠΟΥ ΜΕΤΡΑΕΙ: το «Ιστορία» της
   School Studies ΠΡΟΣΓΕΙΩΝΕΤΑΙ στο βοήθημα (MAP: SUBJ.istoria.door), όχι
   στην istoria.html. Μια κάρτα μόνο στην istoria.html είναι δρόμος σε
   σελίδα που δεν βλέπει ποτέ — γι' αυτό «δεν το βρίσκω μέσα από τη Ιστορία».
   Ο έλεγχος απαιτεί ΚΑΙ ΤΙΣ ΔΥΟ πόρτες, ώστε να μην ξανακλείσει η σωστή. */
ok('υπάρχει δρόμος από την ΑΡΧΙΚΗ του βοηθήματος (εκεί προσγειώνεται)',
   /href="istoria-themata\.html"/.test(AID));

console.log('\n' + (fail ? '✗ ' : '✓ ') + pass + ' πέρασαν · ' + fail + ' απέτυχαν');
process.exit(fail ? 1 : 0);
