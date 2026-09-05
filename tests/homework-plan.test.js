/* ══════════════════════════════════════════════════════════════════════
   tests/homework-plan.test.js — Ο PARSER, Η ΣΥΣΤΑΣΗ, Η ΑΦΑΙΡΕΣΗ ΤΟΥ ΧΡΟΝΟΥ,
   ΚΑΙ Ο ΦΡΟΥΡΟΣ ΜΟΝΟ-ΑΝΑΓΝΩΣΗΣ.

   Οι συναρτήσεις κάτω είναι ΟΙ ΑΠΟΣΤΕΛΛΟΜΕΝΕΣ, κομμένες από την homework.html.
   Ένα αντίγραφό τους εδώ θα απεδείκνυε μόνο ότι δύο αντίγραφα του ίδιου λάθους
   συμφωνούν.

   ⭐ Ο πιο σημαντικός έλεγχος είναι ο τελευταίος: η σελίδα ΔΕΝ ΓΡΑΦΕΙ ΠΟΤΕ
   καμία από τις πέντε αποθήκες μελέτης (σταθερή αρχή 16). Μια τέτοια εγγραφή
   δεν σκάει — είναι σιωπηλό no-op με καθυστερημένη απώλεια, και δεν υπάρχει
   άλλος τρόπος να πιαστεί εκτός από αυτόν.
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const ALS = path.resolve(__dirname, '..');

let pass = 0, fail = 0;
function is(name, got, want) {
  const good = JSON.stringify(got) === JSON.stringify(want);
  good ? pass++ : fail++;
  console.log((good ? '  ✓ ' : '  ✗ FAIL ') + name +
    (good ? '' : `\n      got  ${JSON.stringify(got)}\n      want ${JSON.stringify(want)}`));
}
function ok(name, cond) { is(name, !!cond, true); }
function section(s) { console.log('\n' + s); }

const PAGE = fs.readFileSync(path.join(ALS, 'homework.html'), 'utf8');

/* ══ ⛔⛔ Ο ΦΡΟΥΡΟΣ ΤΟΥ ΤΕΡΜΑΤΙΣΜΟΥ ΖΕΙ ΕΔΩ, ΣΤΗΝ ΑΡΧΗ, ΚΑΙ ΕΙΝΑΙ ΑΠΟΦΑΣΗ.
   Ως την als-v490 ένα `process.exit()` καθόταν στη ΜΕΣΗ αυτού του αρχείου και
   ολόκληρη η ενότητα 8 (ΤΟ ΠΡΟΓΡΑΜΜΑ, als-v485) ήταν νεκρός κώδικας — 92
   βεβαιώσεις που το suite δεν έτρεξε ΠΟΤΕ, ενώ τύπωνε «passed».
   ⭐⭐ Ο ΛΟΓΟΣ ΠΟΥ ΕΙΝΑΙ ΠΡΩΤΟΣ: γράφτηκε πρώτα στο ΤΕΛΟΣ, και η μετάλλαξη
   «βάλε δεύτερο τερματισμό στη μέση» ΠΕΡΑΣΕ ΚΑΘΑΡΗ — γιατί ο φρουρός ζούσε
   πίσω από το πράγμα που φυλούσε. **Ένας φρουρός δεν μπορεί να φυλάξει κάτι
   που συμβαίνει πριν από αυτόν.**
   ⚠️ Η βελόνα γράφεται ΚΟΜΜΕΝΗ, αλλιώς μετράει τον εαυτό της (σταθ. 19). */
/* ⭐⭐ ΚΑΙ Ο ΤΕΛΕΥΤΑΙΟΣ ΦΡΟΥΡΟΣ ΕΙΝΑΙ EXIT HOOK, ΓΙΑΤΙ ΤΙΠΟΤΑ ΑΛΛΟ ΔΕΝ
   ΜΠΟΡΕΙ ΝΑ ΠΙΑΣΕΙ ΕΝΑ `process.exit()` ΣΤΗ ΜΕΣΗ. Δοκιμάστηκε: με τον έλεγχο
   ως ΒΕΒΑΙΩΣΗ (είτε στην αρχή είτε στο τέλος) η μετάλλαξη «βάλε τερματισμό στο
   9c» ΠΕΡΝΑΕΙ ΚΑΘΑΡΗ — ο μετρητής κοκκινίζει κανονικά, αλλά το exit(0) φεύγει
   πριν τυπωθεί ο απολογισμός, οπότε το CI βλέπει κωδικό 0 και σιωπή.
   ⭐ Ο κανόνας: **ένα test που τερματίζει ΧΩΡΙΣ να τυπώσει τον απολογισμό του
   είναι σπασμένο, όποιος κι αν το τερμάτισε.** Ο hook τρέχει ακόμη και μετά
   από `process.exit`, και ΑΛΛΑΖΕΙ τον κωδικό εξόδου — που είναι το μόνο πράγμα
   που το CI διαβάζει. */
let REPORTED = false;
process.on('exit', function (code) {
  if (REPORTED) return;
  process.stdout.write('\n\u274c ΤΟ ΑΡΧΕΙΟ ΤΕΡΜΑΤΙΣΕ ΧΩΡΙΣ ΑΠΟΛΟΓΙΣΜΟ — ' +
    'κάποιος τερματισμός στη μέση έκανε τις υπόλοιπες βεβαιώσεις ΚΕΙΜΕΝΟ.\n');
  process.exitCode = 1;
  if (code === 0) process.reallyExit(1);
});

section('0b · ΤΟ STYLESHEET ΚΛΕΙΝΕΙ');
{
  /* ⛔⛔ ΕΝΑ `{` ΠΑΡΑΠΑΝΩ ΚΑΝΕΙ ΚΑΘΕ ΕΠΟΜΕΝΟ ΚΑΝΟΝΑ ΝΑ ΖΕΙ ΜΕΣΑ ΣΤΟ ΤΕΛΕΥΤΑΙΟ
     ΑΝΟΙΧΤΟ BLOCK. Συνέβη στην als-v490: προσθέτοντας δύο κανόνες στο
     `@media (max-width:999px)` έφυγε το κλείσιμό του, και **ΟΛΟ το CSS από
     εκείνο το σημείο και κάτω ίσχυε μόνο κάτω από 999px** — δηλαδή η μισή
     σελίδα ήταν άστυλη στο laptop, που είναι το 99% της ανάγνωσής του.
     ⭐ Δεν το είδε κανένα μάτι και καμία από τις 500+ βεβαιώσεις. Το έπιασε η
     ΜΕΤΡΗΣΗ: `document.scrollWidth` 1698 σε viewport 1440. */
  const css = PAGE.slice(PAGE.indexOf('<style>') + 7, PAGE.indexOf('</style>'))
    .replace(/\/\*[\s\S]*?\*\//g, '');
  is('οι αγκύλες του stylesheet ισορροπούν',
    (css.match(/\{/g) || []).length - (css.match(/\}/g) || []).length, 0);
  is('και υπάρχει ΑΚΡΙΒΩΣ ΕΝΑ </style>', (PAGE.match(/<\/style>/g) || []).length, 1);
}

section('0 · ΤΟ ΑΡΧΕΙΟ ΤΡΕΧΕΙ ΟΛΟΚΛΗΡΟ');
{
  const SELF = fs.readFileSync(__filename, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
  const NEEDLE = 'process' + '.exit(';
  is('υπάρχει ΑΚΡΙΒΩΣ ΕΝΑΣ τερματισμός σε όλο το αρχείο',
    SELF.split(NEEDLE).length - 1, 1);
  const lastAssert = Math.max(SELF.lastIndexOf('  ok('), SELF.lastIndexOf('  is('));
  ok('και είναι ΜΕΤΑ την τελευταία βεβαίωση', SELF.lastIndexOf(NEEDLE) > lastAssert);
}

/* ── ΤΟ ΚΟΨΙΜΟ ────────────────────────────────────────────────────────
   Το inline script είναι ένα IIFE δεμένο στο DOM που δεν εξάγει τίποτα, οπότε
   κόβεται. Οι δείκτες ελέγχονται, ώστε ένα refactor να σκάει ΕΔΩ, δυνατά,
   αντί να ελέγχει σιωπηλά το τίποτα. */
const START = '  function $(id){ return document.getElementById(id); }';
const END = '     ΖΩΓΡΑΦΙΚΗ';
section('harness');
ok('homework.html still opens its helper block where we slice from', PAGE.indexOf(START) > -1);
ok('and still has the ΖΩΓΡΑΦΙΚΗ marker we slice to', PAGE.indexOf(END) > PAGE.indexOf(START));
const BODY = PAGE.slice(PAGE.indexOf(START), PAGE.lastIndexOf('/* ═', PAGE.indexOf(END)));

/* ⚠️ ΣΤΑΘΕΡΗ ΑΡΧΗ 19, ΚΑΙ ΜΕ ΚΟΣΤΟΣΕ ΔΥΟ ΨΕΥΤΙΚΕΣ ΑΠΟΤΥΧΙΕΣ ΣΕ ΑΥΤΟ ΤΟ
   ΑΡΧΕΙΟ: κάθε φρουρός «αυτό δεν υπάρχει πια» έπιανε το ΣΧΟΛΙΟ που τεκμηριώνει
   την ίδια την απαγόρευση. Ένας φρουρός που φωνάζει «λύκος» είναι ένας φρουρός
   που κάποιος χαλαρώνει. Οι απαγορεύσεις ελέγχονται πάνω στον ΚΩΔΙΚΑ. */
const CODE = PAGE.replace(/\/\*[\s\S]*?\*\//g, ' ');

/* ⭐⭐ Η ΟΜΑΔΟΠΟΙΗΣΗ ΕΙΝΑΙ ΛΟΓΙΚΗ, ΟΧΙ ΖΩΓΡΑΦΙΚΗ, άρα ΔΟΚΙΜΑΖΕΤΑΙ.
   Ζει σε ΕΝΑ συνεχόμενο μπλοκ (`subjRgb` → ο φρουρός «ΤΕΛΟΣ ΤΗΣ
   ΟΜΑΔΟΠΟΙΗΣΗΣ»), που κόβεται εδώ και τρέχει στο ΙΔΙΟ vm με το `SUBJ`.
   ⛔ Αν κάποιος βάλει ζωγραφική μέσα στο μπλοκ, η φέτα το φέρνει εδώ και
   σκάει — δυνατά, όχι σιωπηλά. */
const GSTART = PAGE.indexOf('  function subjRgb(sub)');
const GSENT = PAGE.indexOf('ΤΕΛΟΣ ΤΗΣ ΟΜΑΔΟΠΟΙΗΣΗΣ');
ok('η ομαδοποίηση ζει σε ΕΝΑ κομμάτι που μπορεί να κοπεί', GSTART > -1 && GSENT > GSTART);
const GROUPING = PAGE.slice(GSTART, PAGE.lastIndexOf('/*', GSENT));
ok('και το κομμάτι ΔΕΝ κουβαλάει ζωγραφική', !/\$\('hw[A-Z]/.test(GROUPING));

/* Οι σταθερές του αρχείου κόβονται μαζί — αν η σελίδα μετονομάσει ένα κλειδί,
   τα tests πρέπει να μετακομίσουν μαζί της αντί να ελέγχουν ένα string που το
   πιστεύει μόνο το test. */
const CONSTS = ['KEY', 'PKEY', 'APP'].map(n => {
  const m = PAGE.match(new RegExp('var\\s+' + n + '\\s*=\\s*\'([^\']+)\''));
  if (!m) throw new Error('homework.html no longer declares ' + n);
  return { name: n, value: m[1], src: m[0] + ';' };
});
const KEY = CONSTS[0].value, PKEY = CONSTS[1].value, APP = CONSTS[2].value;

section('0 · the keys this page owns, and the ones it must never touch');
is('it owns hw:v1', KEY, 'hw:v1');
is('and hw:pics', PKEY, 'hw:pics');
is('and syncs under appKey homework', APP, 'homework');
/* ⚠️ Ο φρουρός του smoke-test.sh που ελέγχει ότι κάθε συγχρονισμένο κλειδί
   υπάρχει στα BUNDLES του backup.html διαβάζει `appKey: '…'` ΜΟΝΟ σαν literal.
   Μια σταθερά εκεί κάνει τον έλεγχο να προσπεράσει σιωπηλά όλη τη σελίδα. */
ok('initCloudSync names the appKey LITERALLY, so the Vault guard can see it',
  PAGE.indexOf("appKey: '" + APP + "'") > -1);
ok('the tombstone key is derived exactly as sync.js derives it',
  PAGE.indexOf("var TOMB_KEY = '__synctomb__' + APP;") > -1);

/* ── ένα DOM αρκετά αληθινό ώστε να τρέξει ο κώδικας που στέλνουμε ───── */
function makeEnv(opts) {
  opts = opts || {};
  const store = Object.assign({}, opts.store || {});
  const writes = [];
  const localStorage = {
    getItem(k) { return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
    setItem(k, v) { writes.push(k); store[k] = String(v); },
    removeItem(k) { writes.push(k); delete store[k]; },
    get length() { return Object.keys(store).length; },
    key(i) { return Object.keys(store)[i]; }
  };
  const nodes = {};
  function node() {
    return {
      textContent: '', innerHTML: '', value: '', style: {}, open: false, files: null,
      classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
      addEventListener() {}, querySelectorAll() { return []; }, querySelector() { return null; },
      setAttribute() {}, getAttribute() { return null; }, removeAttribute() {},
      showModal() {}, close() {}, click() {}, appendChild() {}
    };
  }
  const document = {
    getElementById(id) { return (nodes[id] || (nodes[id] = node())); },
    createElement() { return node(); },
    addEventListener() {}, hidden: false
  };
  /* ⚠️ ΣΤΟΝ BROWSER ΤΟ `window` ΕΙΝΑΙ ΤΟ ΙΔΙΟ ΤΟ GLOBAL. Ένα context όπου το
     `window` είναι απλώς μια ιδιότητα κάνει κάθε σκέτο `GCal.…` της σελίδας να
     πετάει ReferenceError — που το try/catch της μεταφράζει σε μια εύλογη
     ΛΑΘΟΣ κατάσταση ημερολογίου. Το όργανο κατηγορούσε σωστό κώδικα, που είναι
     ακριβώς η σταθερή αρχή 30: πριν πιστέψεις μια αποτυχία, έλεγξε το όργανο.
     `self` γιατί τα corpora γράφουν `typeof self !== 'undefined' ? self : this`
     και το `this` είναι undefined σε strict module scope μέσα σε vm. */
  const win = {
    localStorage, document,
    console: { log() {}, warn() {}, error() {} },
    setTimeout, clearTimeout, setInterval: () => 0, clearInterval,
    JSON, Date, Object, Array, String, Number, Math, Promise, RegExp,
    isNaN, isFinite, encodeURIComponent, module: undefined
  };
  win.window = win; win.self = win; win.globalThis = win;
  const ctx = vm.createContext(win);
  /* Τα ΑΛΗΘΙΝΑ κοινά αρχεία, ποτέ μίμησή τους — και ΤΑ ΑΛΗΘΙΝΑ corpora, γιατί
     οι ενότητες που ξέρει ο parser βγαίνουν από εκεί. Ένας parser ελεγμένος
     πάνω σε μια χειρόγραφη λίστα ids θα συμφωνούσε με τον εαυτό του και θα
     ξέμενε πίσω την πρώτη φορά που θα προστεθεί ενότητα. */
  ['ladders.js', 'study-stamp.js', 'greek-ear.js', 'lesson-grade.js',
   'istoria-data.js', 'arxaia-gnosto-data.js', 'arxaia-data.js', 'gcal.js']
    .forEach(f => vm.runInContext(fs.readFileSync(path.join(ALS, f), 'utf8'), ctx, { filename: f }));
  if (opts.now) {
    const RealDate = ctx.Date, PIN = new RealDate(opts.now);
    class PinnedDate extends RealDate {
      constructor(...a) { if (a.length === 0) super(PIN.getTime()); else super(...a); }
      static now() { return PIN.getTime(); }
    }
    ctx.Date = PinnedDate;
  }
  const src = '(function(){' + CONSTS.map(c => c.src).join('\n') + '\n' + BODY +
    '\n' + GROUPING +
    '\nreturn { taskGroups:taskGroups, taskGroupId:taskGroupId, taskGroupRank:taskGroupRank,' +
    ' l4Groups:l4Groups, SUBJ_ORDER:SUBJ_ORDER,' +
    ' parseLine:parseLine, budget:budget, candidates:candidates, reload:reload,' +
    ' addTask:addTask, dropTask:dropTask, sweepDone:sweepDone, taskList:taskList,' +
    ' estimate:estimate, recordSample:recordSample, save:save, blocksFor:blocksFor,' +
    ' pileDay:pileDay, bringForward:bringForward, doorOf:doorOf,' +
    /* als-v492 · ΤΟ ΣΧΕΔΙΟ. Το `tonightView` έφυγε μαζί με το ξαναδιάβασμα. */
    ' planFor:planFor, planDay:planDay, planCount:planCount, nextSchoolDay:nextSchoolDay,' +
    ' slotsOfDay:slotsOfDay, nextLessonFor:nextLessonFor, dueOf:dueOf,'+
    ' ttSeedIfEmpty:ttSeedIfEmpty, ttSubjects:ttSubjects, fmtDue:fmtDue, fmtPast:fmtPast,' +
    ' myLessons:myLessons, setLessons:setLessons, clearLessons:clearLessons, lessonsFor:lessonsFor,' +
    ' calState:calState, today:today,' +
    ' dowMon:dowMon, offDate:offDate, nextDow:nextDow, ladders:ladders, subjectOfText:subjectOfText,' +
    ' state:function(){ return state; } };})()';
  const api = vm.runInContext(src, ctx, { filename: 'homework.html:script' });
  api.reload();
  /* ⚠️ ΤΟ HARNESS ΠΡΕΠΕΙ ΝΑ ΜΙΜΕΙΤΑΙ ΤΗ ΣΕΙΡΑ ΤΟΥ BOOT, ΑΛΛΙΩΣ ΕΞΕΤΑΖΕΙ ΜΙΑ
     ΣΕΛΙΔΑ ΠΟΥ ΔΕΝ ΥΠΑΡΧΕΙ (σταθ. 37). Ο σπόρος του προγράμματος τρέχει στο
     boot — ΜΕΤΑ τον reload() και ΠΡΙΝ το πρώτο paint — δηλαδή ΜΕΤΑ τον δείκτη
     ΖΩΓΡΑΦΙΚΗ όπου κόβει η φέτα. Χωρίς αυτή τη γραμμή το `timetable` έμενε
     άδειο μόνο στο test, και κάθε «τι έχω για αύριο» απαντούσε ΤΙΠΟΤΑ. */
  api.ttSeedIfEmpty();
  return { api, ctx, store, writes };
}

/* ══════════════════════════════════════════════════════════════════════
   1 · Ο PARSER
   ══════════════════════════════════════════════════════════════════════ */
section('1 · the parser is deterministic and closed');
/* Τρίτη 11 Αυγ 2026, 12:00 — καρφωμένη ώρα, ώστε κάθε ημερομηνία να ελέγχεται
   με το χέρι. */
const TUE = '2026-08-11T12:00:00';
const E = makeEnv({ now: TUE });
const P = E.api.parseLine.bind(E.api);

{
  const r = P('Ιστορία b2 απέξω Τρίτη');
  is('η γραμμή του παραδείγματος: μάθημα', r.subject, 'istoria');
  is('ενότητα', r.unit && r.unit.id, 'b2');
  is('είδος', r.kind, 'apexo');
  /* ⭐ Ένα weekday λύνεται στην ΕΠΟΜΕΝΗ εμφάνισή του. Σήμερα ΕΙΝΑΙ Τρίτη, άρα
     «Τρίτη» σημαίνει την επόμενη — αν εννοούσε σήμερα θα έλεγε «σήμερα». */
  is('«Τρίτη» ειπωμένο Τρίτη → η ΕΠΟΜΕΝΗ Τρίτη', r.due, '2026-08-18');
  is('και δεν έμεινε σκουπίδι στον τίτλο', r.title, '');
}
is('κάθε συντομογραφία μαθήματος · ιστ', P('ιστ απέξω').subject, 'istoria');
/* ⭐ als-v485: ΗΤΑΝ 'arxaia' και έγινε ΠΙΟ ΑΚΡΙΒΕΣ — το «γνωστό» δεν είναι
   πια alias του γενικού, είναι ΤΟ ΜΑΘΗΜΑ. Ο κανόνας («το μάθημα βγαίνει από
   τη γραμμή, ποτέ από εικασία») δεν άλλαξε· η γραμμή λέει περισσότερα. */
is('· αρχ + γνωστό → το ΓΝΩΣΤΟ', P('αρχ γνωστό').subject, 'arxaia_gn');
is('· σκέτο αρχ μένει κληρονομικό', P('αρχ b2 απέξω').subject, 'arxaia');
is('· λατ', P('λατ ασκήσεις').subject, 'latinika');
is('· εκθ', P('εκθ αύριο').subject, 'ekthesi');
is('· και η πλήρης λέξη', P('Λατινικά άσκηση').subject, 'latinika');
is('μια Έκθεση είναι ΓΡΑΠΤΟ εξ ορισμού, όχι μαντεψιά', P('εκθ αύριο').kind, 'grapto');
is('οτιδήποτε άλλο πέφτει στο δηλωμένο default', P('ιστ κάτι').kind, 'askisi');

is('αύριο', P('λατ αύριο').due, '2026-08-12');
is('μεθαύριο', P('λατ μεθαύριο').due, '2026-08-13');
is('σήμερα', P('λατ σήμερα').due, '2026-08-11');
is('dd/mm μπροστά μας', P('λατ 20/8').due, '2026-08-20');
/* Μια ημερομηνία που πέρασε φέτος σημαίνει του χρόνου — ποτέ στο παρελθόν. */
is('dd/mm που πέρασε → του χρόνου, ποτέ πίσω', P('λατ 3/1').due, '2027-01-03');
is('Πέμπτη → η επόμενη Πέμπτη', P('ιστ Πέμπτη').due, '2026-08-13');
is('Δευτέρα → η επόμενη Δευτέρα', P('ιστ Δευτέρα').due, '2026-08-17');

{
  /* ⭐ ΤΙΠΟΤΑ ΔΕΝ ΜΑΝΤΕΥΕΤΑΙ. Ένα token που δεν αναγνωρίζεται μένει στον
     τίτλο, με τα δικά του λόγια, ΑΥΤΟΥΣΙΑ. */
  const r = P('κάτι εντελώς άσχετο');
  is('τίποτα δεν αναγνωρίστηκε → μάθημα null', r.subject, null);
  is('→ καμία ενότητα', r.unit, null);
  is('→ ΚΑΜΙΑ ΗΜΕΡΟΜΗΝΙΑ (η κάρτα θα πει «χωρίς ημερομηνία»)', r.due, null);
  is('→ και η γραμμή του επιβιώνει ολόκληρη', r.title, 'κάτι εντελώς άσχετο');
}
{
  const r = P('Ιστορία ΖΖΖ9 απέξω');
  is('ένα ΑΓΝΩΣΤΟ id ενότητας δεν μαντεύεται…', r.unit, null);
  is('…μένει στον τίτλο', r.title, 'ΖΖΖ9');
}
{
  const r = P('Λατινικά ασκήσεις 4-7 για Τρίτη');
  /* ⚠️ ΤΟ ΔΗΛΩΜΕΝΟ ΤΙΜΗΜΑ ΤΟΥ ΑΥΤΟΥΣΙΟΥ ΤΙΤΛΟΥ. Το «για» ΟΡΦΑΝΕΨΕ επειδή
     πήραμε τη λέξη του («Τρίτη»), και μένει. Το να το διώξουμε «επειδή
     κρέμεται» είναι ακριβώς η ξαναγραφή που η als-v479 έβγαλε, με καλύτερη
     δικαιολογία — και η ίδια ακριβώς γραμμή κώδικα θα έτρωγε το «για την» της
     Κρήτης από κάτω. */
  is('τα λόγια του μένουν αυτούσια — ΚΑΙ η ορφανή πρόθεση, που είναι δική του', r.title, '4-7 για');
  is('και η προθεσμία λύνεται κανονικά', r.due, '2026-08-18');
}
/* ⭐ als-v485: το corpus του ΓΝΩΣΤΟΥ ΕΙΝΑΙ η πηγή, άρα η απάντηση έγινε ΠΙΟ
   ακριβής χωρίς να αλλάξει ο κανόνας — το μάθημα βγαίνει από το corpus.
   ⚠️ als-v497: η δοκιμή ρωτούσε `gn1`. Οι έξι `gn*` ήταν η ΕΙΣΑΓΩΓΗ και
   βγήκαν από τη μηχανή ανάκλησης, οπότε ο parser σωστά δεν τις ξέρει πια.
   Ο κανόνας που ελέγχεται εδώ δεν άλλαξε — άλλαξε το παράδειγμα. */
is('μια ενότητα χωρίς μάθημα δίνει το μάθημα από το corpus, όχι από εικασία',
  P('gk1 απέξω').subject, 'arxaia_gn');

section('1b · σταθερή αρχή 5 — η εβδομάδα είναι Δευτέρα→Κυριακή');
is('Τρίτη → 1', E.api.dowMon(new Date('2026-08-11T12:00:00')), 1);
is('Κυριακή → 6, ποτέ 0', E.api.dowMon(new Date('2026-08-16T12:00:00')), 6);
is('Δευτέρα → 0', E.api.dowMon(new Date('2026-08-10T12:00:00')), 0);

/* ══════════════════════════════════════════════════════════════════════
   2 · Η ΑΦΑΙΡΕΣΗ ΤΟΥ ΧΡΟΝΟΥ — ο αριθμός ΒΓΑΙΝΕΙ από τις γραμμές
   ══════════════════════════════════════════════════════════════════════ */
section('2 · the time budget adds up, by construction');
{
  /* 12:00, Τρίτη, χωρίς εξουσιοδοτημένο ημερολόγιο → το ΔΗΛΩΜΕΝΟ πρόγραμμα. */
  const b = E.api.budget();
  is('ο ορίζοντας είναι το ξαναδιάβασμα', b.horizonName.indexOf('21:45') > -1, true);
  is('μεικτός χρόνος = 21:45 − 12:00 = 9ω 45λ', b.gross, 585);
  /* φροντιστήριο 15:15–18:00 = 165 · γυμναστήριο 18:45–20:30 = 105 ·
     φαγητό 21:00–21:40 = 40 · δρόμος ×2 = 30.  Γραμμένο στο χέρι. */
  is('αφαιρέθηκαν 340 λεπτά', b.spent, 340);
  is('μένουν 245', b.free, 245);
  ok('ΚΑΙ ΤΟ ΑΘΡΟΙΣΜΑ ΤΩΝ ΓΡΑΜΜΩΝ ΕΙΝΑΙ ΑΚΡΙΒΩΣ ΑΥΤΟ ΠΟΥ ΑΦΑΙΡΕΘΗΚΕ',
    b.lines.reduce((s, l) => s + l.mins, 0) === b.spent);
  ok('gross − spent = free, χωρίς υπόλοιπο', b.gross - b.spent === b.free);
  ok('ο δρόμος έχει ΔΙΚΗ ΤΟΥ γραμμή, άρα ελέγχεται', b.lines.some(l => /Δρόμος/.test(l.label)));
  is('και ο πηγαίος λέει ότι είναι το πρόγραμμα, όχι το ημερολόγιο', b.cal, 'unauthorised');
}
{
  /* 08:00: η ώρα ΠΡΙΝ ανοίξει το παράθυρο δεν επιτρέπεται να φουσκώνει το
     «μένουν». Παίρνει όνομα και μπαίνει σαν κανονική αφαίρεση. */
  const E8 = makeEnv({ now: '2026-08-11T08:00:00' });
  const b = E8.api.budget();
  ok('στις 08:00 η ώρα πριν το παράθυρο ονομάζεται και αφαιρείται',
    b.lines.some(l => /Πριν το παράθυρο/.test(l.label)));
  ok('και το άθροισμα εξακολουθεί να βγαίνει',
    b.lines.reduce((s, l) => s + l.mins, 0) === b.spent && b.gross - b.spent === b.free);
}
{
  /* Ένα Σάββατο δεν έχει φροντιστήριο στο δηλωμένο πρόγραμμα — και δεν
     επιτρέπεται να ισχυριστούμε ότι έχει. */
  const ESat = makeEnv({ now: '2026-08-15T12:00:00' });
  const b = ESat.api.budget();
  ok('Σάββατο: κανένα φροντιστήριο, κανένας δρόμος',
    !b.lines.some(l => /Φροντιστήριο|Δρόμος/.test(l.label)));
  ok('και το άθροισμα βγαίνει κι εκεί', b.gross - b.spent === b.free);
}

/* ══════════════════════════════════════════════════════════════════════
   3 · Η ΣΥΣΤΑΣΗ — η απάντηση είναι γνωστή με το χέρι
   ══════════════════════════════════════════════════════════════════════ */
section('3 · the recommendation, on a fixture whose answer is knowable by hand');
const DAY = 86400000;
const NOWMS = Date.parse(TUE);
const LADFIX = {
  /* Ιστορία: η a1a έληξε ΠΡΙΝ 4 ΜΕΡΕΣ και είναι αδύναμη (60% σε 20 μετρήσεις). */
  'ist:v1': JSON.stringify({
    v: 1,
    units: { a1a: { learnedAt: NOWMS - 40 * DAY, reviews: 2, due: NOWMS - 4 * DAY, best: .6, last: 1, runs: 3, claimed: 0 } },
    els: { 'a1a:0:0': { r: 12, w: 8 } }
  }),
  /* Λατινικά: έληξε ΜΟΛΙΣ ΣΗΜΕΡΑ και είναι δυνατό. */
  'lat:v1': JSON.stringify({ v: 1, cells: [{ id: 'n3:gen:pl', r: 19, w: 1, box: 3, due: NOWMS - 60000, ts: 1 }] })
};
{
  const F = makeEnv({ now: TUE, store: LADFIX });
  const pool = F.api.candidates(245);
  ok('και τα δύο χρέη μπαίνουν στη δεξαμενή', pool.length === 2);
  is('πρώτη είναι η Ιστορία: έληξε πιο παλιά ΚΑΙ είναι αδύναμη', pool[0].store, 'ist:v1');
  /* ⭐ Ο ΛΟΓΟΣ ΕΙΝΑΙ Η ΙΔΙΑ ΠΡΑΞΗ ΠΟΥ ΠΑΡΗΓΑΓΕ ΤΗΝ ΚΑΤΑΤΑΞΗ: κάθε όρος
     προσθέτει ΤΑΥΤΟΧΡΟΝΑ βάρος και μία λέξη. Δεν υπάρχει τρόπος να
     διαφωνήσουν, γιατί είναι το ίδιο πράγμα. */
  /* ⭐⭐ als-v492: ΤΟ «ΤΟ ΕΧΕΙΣ <ΜΕΡΑ>» ΕΙΝΑΙ ΚΑΙΝΟΥΡΓΙΟ ΕΔΩ, ΚΑΙ ΕΙΝΑΙ ΔΙΟΡΘΩΣΗ.
     Ως την als-v491 ο όρος αυτός διάβαζε το Google Calendar, που είναι
     ΤΟΠΙΚΟ στη συσκευή (`gcal:*` δεν συγχρονίζεται) — άρα σε κάθε συσκευή
     χωρίς εξουσιοδοτημένο ημερολόγιο, δηλαδή σε αυτό εδώ το fixture, ΔΕΝ
     ΑΝΑΒΕ ΠΟΤΕ. Τώρα διαβάζει το πρόγραμμα, όπως και η προθεσμία δίπλα του.
     ⭐ Και λέει τη ΣΩΣΤΗ μέρα: στις 12:00 μιας Τρίτης το φροντιστήριο των
     15:15 είναι ΜΠΡΟΣΤΑ του, άρα «σήμερα» — ποτέ ένα σκέτο «αύριο». */
  is('και ο λόγος το λέει με λέξεις', pool[0].why, ['έληξε πριν 4 μέρες', 'αδύνατο', 'το έχεις σήμερα']);
  is('τα Λατινικά λένε μόνο ό,τι ισχύει γι\' αυτά', pool[1].why, ['έληξε σήμερα', 'το έχεις σήμερα']);
  /* ⛔ ΚΑΙ Η ΩΡΑ ΑΛΛΑΖΕΙ ΤΗΝ ΑΠΑΝΤΗΣΗ: το ΙΔΙΟ fixture, την ΙΔΙΑ μέρα, τρεις
     ώρες μετά το σχόλασμα, δεν λέει πια «σήμερα». Χωρίς αυτόν τον φρουρό ένα
     καρφωμένο «αύριο» θα περνούσε καθαρό — και θα έλεγε ψέματα όλο το πρωί. */
  const EVE = makeEnv({ now: '2026-08-11T21:00:00', store: LADFIX }).api.candidates(245);
  ok('η ΙΔΙΑ μέρα στις 21:00 λέει «αύριο», ποτέ «σήμερα»',
    EVE[0].why.indexOf('το έχεις αύριο') > -1 && EVE[0].why.indexOf('το έχεις σήμερα') < 0);
  ok('κανένα σκορ δεν φτάνει ποτέ στην οθόνη', PAGE.indexOf('c.score') < 0 && PAGE.indexOf('esc(c.score') < 0);
  /* ⭐ als-v489: ο σύνδεσμος δηλώνει ΤΩΡΑ και τη ΜΟΝΑΔΑ — `u` = υποενότητα,
     `p` = πλαγιότιτλος. Το fixture δεν έχει πλαγιότιτλους, άρα το ladders.js
     διαβάζει τις υποενότητες και ο σύνδεσμος πρέπει να λέει `u`. */
  ok('η Ιστορία φεύγει με ΒΑΘΥ σύνδεσμο στη σωστή ενότητα', pool[0].href === 'istoria.html#recall:u:a1a');
  ok('τα Λατινικά ΔΕΝ επινοούν hash που η σελίδα τους δεν διαβάζει', pool[1].href === 'latinika.html');
}
{
  /* ΙΣΟΠΑΛΙΑ: δύο πανομοιότυπα χρέη, ίδια μέρα, καμία αδυναμία. Σπάει προς το
     ΒΑΡΥΤΕΡΟ μάθημα — Αρχαία 30% έναντι Λατινικά 20%. Δικοί του αριθμοί.
     ⚠️⚠️ als-v492: Η ΩΡΑ ΤΟΥ FIXTURE ΕΓΙΝΕ 21:00, ΚΑΙ ΕΙΝΑΙ ΑΠΑΡΑΙΤΗΤΟ.
     Στις 12:00 μιας Τρίτης η επόμενη μέρα είναι Η ΙΔΙΑ Η ΤΡΙΤΗ, που ΕΧΕΙ
     Λατινικά — άρα τα Λατινικά έπαιρναν +15 και Η ΙΣΟΠΑΛΙΑ ΔΕΝ ΥΠΗΡΧΕ ΚΑΝ:
     το test θα «περνούσε» ελέγχοντας κάτι άλλο. Στις 21:00 η επόμενη μέρα
     είναι Τετάρτη (Ιστορία · Αρχαία άγνωστο · Έκθεση), όπου ΚΑΝΕΝΑ από τα δύο
     δεν είναι προγραμματισμένο — οπότε ο συντελεστής είναι πράγματι ο μόνος
     διαχωριστής. ⭐ Ένα fixture που δεν μπορεί να δείξει τη διαφορά που
     ισχυρίζεται δεν ελέγχει τίποτα. */
  const TIE = {
    'ist:v1': JSON.stringify({ v: 1,
      units: { a1a: { learnedAt: 1, reviews: 3, due: NOWMS - 60000, best: 1, last: 1, runs: 3, claimed: 0 } },
      els: { 'a1a:0:0': { r: 20, w: 0 } } }),
    'ton:v1': JSON.stringify({ v: 1, cells: { dasia: { r: 20, w: 0, due: NOWMS - 60000, streak: 3 } } })
  };
  const F = makeEnv({ now: '2026-08-11T21:00:00', store: TIE });
  const pool = F.api.candidates(245);
  /* ⭐ Ο ΦΡΟΥΡΟΣ ΤΗΣ ΙΣΟΠΑΛΙΑΣ: ΚΑΙ ΤΑ ΔΥΟ παίρνουν τον ΙΔΙΟ όρο «το έχεις
     αύριο», άρα αλληλοαναιρείται και μένει ΜΟΝΟ ο συντελεστής. Χωρίς αυτό, το
     test θα «περνούσε» επειδή το ένα πήρε +15 — σωστή απάντηση, λάθος λόγος. */
  is('η ισοπαλία ΕΙΝΑΙ ισοπαλία — και τα δύο τα έχει την επόμενη φορά',
    pool.map(c => c.why.indexOf('το έχεις αύριο') > -1), [true, true]);
  is('ισοπαλία → κερδίζει ο μεγαλύτερος συντελεστής', pool[0].store, 'ton:v1');
}
{
  /* ΤΕΛΕΙΩΣΕΣ είναι αληθινή απάντηση: τίποτα δεν λήγει, οπότε η δεξαμενή
     είναι άδεια και η σελίδα ΔΕΝ κατασκευάζει δουλειά. */
  const CLEAN = {
    'ist:v1': JSON.stringify({ v: 1, units: { a1a: { learnedAt: 1, reviews: 3, due: NOWMS + 9 * DAY } }, els: { 'a1a:0:0': { r: 10, w: 0 } } })
  };
  const F = makeEnv({ now: TUE, store: CLEAN });
  is('τίποτα ληξιπρόθεσμο, τίποτα ανοιχτό → καμία υποψηφιότητα', F.api.candidates(245).length, 0);
}

section('3b · ΠΟΤΕ ΕΠΙΝΟΗΜΕΝΗ ΕΚΤΙΜΗΣΗ ΧΡΟΝΟΥ (η αρχή της als-v433)');
{
  const F = makeEnv({ now: TUE });
  is('καμία μέτρηση → null, ποτέ μηδέν', F.api.estimate('istoria', 'askisi'), null);
  F.api.recordSample('istoria', 'askisi', 20); F.api.save();
  is('μία μέτρηση δεν αρκεί', F.api.estimate('istoria', 'askisi'), null);
  F.api.recordSample('istoria', 'askisi', 14); F.api.save();
  is('ούτε δύο', F.api.estimate('istoria', 'askisi'), null);
  F.api.recordSample('istoria', 'askisi', 18); F.api.save();
  is('τρεις → ο ΔΙΑΜΕΣΟΣ, όχι ο μέσος όρος', F.api.estimate('istoria', 'askisi'), 18);
  F.api.recordSample('istoria', 'askisi', 900); F.api.save();
  is('ένα ξεχασμένο χρονόμετρο (15 ώρες) ΔΕΝ είναι μέτρηση', F.api.estimate('istoria', 'askisi'), 18);
}

/* ══════════════════════════════════════════════════════════════════════
   4 · ⭐ Ο ΦΡΟΥΡΟΣ — `hw:*` ΕΙΝΑΙ ΤΟ ΜΟΝΟ ΠΟΥ ΓΡΑΦΕΤΑΙ
   ══════════════════════════════════════════════════════════════════════ */
section('4 · σταθερή αρχή 16 — the five study stores are READ-ONLY here');
{
  const F = makeEnv({ now: TUE, store: LADFIX });
  F.api.ladders();                                    /* διαβάζει και τις πέντε */
  const id = F.api.addTask({ subject: 'istoria', title: 'b2 απέξω', due: '2026-08-12', kind: 'apexo' });
  ok('μια εργασία γράφτηκε κανονικά', !!id);
  F.api.recordSample('istoria', 'apexo', 12); F.api.save();
  F.api.dropTask(id);
  F.api.sweepDone();

  const written = Array.from(new Set(F.writes)).sort();
  is('γράφτηκαν ΜΟΝΟ τα δικά της κλειδιά', written, ['__synctomb__homework', 'hw:v1']);
  ['ist:v1', 'arx:v1', 'arx:gn', 'lat:v1', 'ton:v1'].forEach(k => {
    ok('ΠΟΤΕ δεν γράφτηκε το ' + k, F.writes.indexOf(k) < 0);
  });
  ok('και το ist:v1 στον δίσκο είναι byte-identical με ό,τι βρήκε',
    F.store['ist:v1'] === LADFIX['ist:v1']);
  ok('όπως και το lat:v1', F.store['lat:v1'] === LADFIX['lat:v1']);
}

/* ══════════════════════════════════════════════════════════════════════
   4b · ⛔⛔ ΜΙΑ ΓΡΑΜΜΗ ΠΟΥ ΔΕΝ ΑΝΑΓΝΩΡΙΣΤΗΚΕ ΔΕΝ ΕΙΝΑΙ ΕΚΘΕΣΗ

   Ο `addTask` έγραφε `p.subject || 'ekthesi'`, οπότε «δεν κατάλαβα ποιο
   μάθημα» φακελωνόταν ΣΙΩΠΗΛΑ στο μάθημα με τον μεγαλύτερο συντελεστή.
   Μετρημένο στα αληθινά του δεδομένα: η μοναδική εργασία που είχε γράψει
   ποτέ («ΜΤΦΡΑΣΗ 1ης ενοτητας…» — ΑΡΧΑΙΑ) καθόταν στην Έκθεση.
   Σταθερή αρχή 10: «δεν ξέρω» και «Έκθεση» δεν ζωγραφίζονται ίδια.
   ══════════════════════════════════════════════════════════════════════ */
section('4b · «δεν ξέρω ποιο μάθημα» δεν γίνεται ΠΟΤΕ Έκθεση');
{
  const F = makeEnv({ now: TUE });

  const blind = F.api.addTask({ title: 'κάτι που δεν αναγνωρίζεται', kind: 'askisi' });
  const t = F.api.taskList().filter(x => x.id === blind)[0];
  is('χωρίς μάθημα → unknown, ΠΟΤΕ ekthesi', t.subject, 'unknown');

  /* Η Έκθεση παραμένει κανονικό μάθημα όταν ΟΝΤΩΣ ειπώθηκε. */
  const real = F.api.addTask({ subject: 'ekthesi', title: 'παραγωγή λόγου', kind: 'grapto' });
  is('όταν το λέει, είναι Έκθεση', F.api.taskList().filter(x => x.id === real)[0].subject, 'ekthesi');

  /* ⚠️ Η ταυτότητα υπάρχει, έχει ΟΝΟΜΑ, και δεν κερδίζει ποτέ συντελεστή. */
  const SUBJ = (PAGE.match(/var SUBJ = \{[\s\S]*?\n  \};/) || [''])[0];
  ok('το unknown είναι δηλωμένο στο SUBJ', /unknown:\s*\{/.test(SUBJ));
  ok('με βάρος 0 — δεν κλέβει ισοπαλία συντελεστή',
    /unknown:[^}]*weight:\s*0\b/.test(SUBJ));
  ok('και χωρίς σελίδα να ανοίξει', /unknown:[^}]*page:\s*null/.test(SUBJ));
  ok('δεν μπαίνει στο φύλλο των σημερινών — κανείς δεν «είχε» άγνωστο μάθημα',
    /var SUBJ_ORDER = \[[^\]]*\];/.test(PAGE) &&
    (PAGE.match(/var SUBJ_ORDER = \[([^\]]*)\]/) || ['',''])[1].indexOf('unknown') < 0);

  /* Και τα δύο σημεία που ζωγραφίζουν εργασία πέφτουν στο unknown, όχι στην
     Έκθεση — μια εγγύηση σε ένα μονοπάτι και όχι στο δίδυμό του (σταθ. 15). */
  is('κανένα fallback δεν δείχνει πια στην Έκθεση',
    (PAGE.match(/SUBJ\[t\.subject\] \|\| SUBJ\.ekthesi/g) || []).length, 0);
  /* als-v485: τρίτο σημείο — το φύλλο «Πότε» ζωγραφίζει κι αυτό εργασία. */
  /* ⚠️ als-v487: τα σημεία έγιναν ΠΕΝΤΕ — η ομαδοποίηση πρόσθεσε δύο
     (`taskGroupId` + `taskGroups`). Ο αριθμός δεν είναι το ζητούμενο· το
     ζητούμενο είναι ότι **κανένα** δεν πέφτει στην Έκθεση. Γι' αυτό ο
     έλεγχος είναι ΚΑΙ ο μηδενικός από πάνω, που δαγκώνει σε κάθε νέο δρόμο. */
  /* ⚠️ als-v492: ΕΞΙ — η γραμμή του σχεδίου (`planRow`) είναι το έκτο σημείο
     που ζωγραφίζει εργασία. Ο αριθμός ΔΕΝ είναι ο κανόνας· ο κανόνας είναι ο
     μηδενικός από κάτω. Ανεβαίνει με κάθε νέα επιφάνεια, και ΠΡΕΠΕΙ. */
  is('και ΟΛΑ δείχνουν στο unknown',
    (PAGE.match(/SUBJ\[[a-z.]+\] \|\| SUBJ\.unknown/g) || []).length, 6);
  is('κανένα fallback δεν δείχνει σε ΜΑΘΗΜΑ',
    (PAGE.match(/\|\| SUBJ\.(?!unknown)[a-z_]+/g) || []).length, 0);
}
/* Και στατικά, γιατί ένας δυναμικός έλεγχος βλέπει μόνο τους δρόμους που
   πέρασε: καμία από τις πέντε αποθήκες δεν εμφανίζεται ποτέ σαν όρισμα
   εγγραφής. ⚠️ Η βελόνα είναι η ΚΛΗΣΗ, όχι η λέξη — τα ονόματα των αποθηκών
   εμφανίζονται δεκάδες φορές σε σχόλια, και ένας φρουρός που φωνάζει «λύκος»
   είναι ένας φρουρός που κάποιος θα χαλαρώσει (σταθερή αρχή 19). */
section('4b · and statically, on the call context rather than the word');
['ist:v1', 'arx:v1', 'arx:gn', 'lat:v1', 'ton:v1'].forEach(k => {
  ok('no setItem / persist call names ' + k,
    !new RegExp("(setItem|persist)\\s*\\(\\s*'" + k.replace(':', ':') + "'").test(PAGE));
});
ok('the page contains exactly one initCloudSync registration',
  (PAGE.match(/initCloudSync\(\{/g) || []).length === 1);
ok('and it declares both of its keys', /syncedKeys:\s*\[KEY,\s*PKEY\]/.test(PAGE));

/* ══════════════════════════════════════════════════════════════════════
   4c · ⭐⭐ ΤΟ HARNESS ΔΕΝ ΕΠΙΤΡΕΠΕΤΑΙ ΝΑ ΦΟΡΤΩΝΕΙ ΠΕΡΙΣΣΟΤΕΡΑ ΑΠ' ΟΣΑ Η ΣΕΛΙΔΑ

   Αυτή η βεβαίωση γεννήθηκε από πραγματικό, ΖΩΝΤΑΝΟ σφάλμα της als-v470 που
   επέζησε 97 πράσινων βεβαιώσεων: η `homework.html` φόρτωνε τα τρία corpora
   ΧΩΡΙΣ το `greek-ear.js` / `lesson-grade.js`, που εκείνα απαιτούν με `throw`
   στη φόρτωση. Άρα `ISTORIA`/`ARXGN`/`ArxaiaData` ήταν **undefined στη
   ζωντανή σελίδα**: ο parser δεν αναγνώριζε ΚΑΜΙΑ ενότητα και κάθε τίτλος
   έπεφτε στο id («b1b», «n3:gen:pl»). Το test δεν το έβλεπε επειδή ΤΟ ΙΔΙΟ
   φόρτωνε τα δύο που έλειπαν — δηλαδή εξέταζε σελίδα που δεν υπάρχει.

   ⭐ Ο κανόνας που μένει: ένα harness που φορτώνει ΠΑΡΑΠΑΝΩ από τη σελίδα δεν
   την ελέγχει, την κολακεύει. Κάθε αρχείο του context πρέπει να είναι και
   `<script src>` της σελίδας.
   ══════════════════════════════════════════════════════════════════════ */
section('4c · every file the test context loads is also loaded by the PAGE');
const PAGE_SRCS = (PAGE.match(/<script[^>]*\ssrc="([^"]+)"/g) || [])
  .map(s => s.replace(/^.*src="/, '').replace(/".*$/, ''));
const CTX_FILES = ['ladders.js', 'study-stamp.js', 'greek-ear.js', 'lesson-grade.js',
  'istoria-data.js', 'arxaia-gnosto-data.js', 'arxaia-data.js', 'gcal.js'];
CTX_FILES.forEach(f => ok('homework.html itself loads ' + f, PAGE_SRCS.indexOf(f) > -1));
/* Και η άλλη κατεύθυνση: ό,τι ΠΕΤΑΕΙ χωρίς εξάρτηση, η σελίδα πρέπει να το
   φορτώνει ΠΡΙΝ από αυτό — μια σωστή λίστα με λάθος σειρά είναι το ίδιο κενό. */
[['greek-ear.js', 'istoria-data.js'], ['greek-ear.js', 'arxaia-gnosto-data.js'],
 ['lesson-grade.js', 'arxaia-gnosto-data.js'], ['greek-ear.js', 'arxaia-data.js']]
  .forEach(pair => ok(pair[0] + ' is loaded BEFORE ' + pair[1],
    PAGE_SRCS.indexOf(pair[0]) > -1 && PAGE_SRCS.indexOf(pair[0]) < PAGE_SRCS.indexOf(pair[1])));
/* Και ότι ο parser ΟΝΤΩΣ βλέπει ενότητες — αλλιώς όλα τα παραπάνω μπορεί να
   ισχύουν και το corpus να είναι άδειο για άλλο λόγο. */
ok('and with them the parser really resolves a unit id', E.api.parseLine('ιστ b2').unit !== null);

/* ══════════════════════════════════════════════════════════════════════
   4d · ΦΑΣΗ 1 — ΤΟ ΞΑΚΡΙΣΜΑ: ΤΙ ΕΦΥΓΕ, ΚΑΙ ΤΙ ΔΕΝ ΛΕΓΕΤΑΙ ΔΥΟ ΦΟΡΕΣ
   ══════════════════════════════════════════════════════════════════════ */
section('4d · φάση 1 · no control exists that cannot control something');
ok('the 10′/20′/45′/90′ chips are GONE', PAGE.indexOf('data-win') < 0);
ok('and so is the window filter they drove', PAGE.indexOf('windowPick') < 0);
ok('the horizon SECTION is gone — no seven-bar week grid',
  PAGE.indexOf('hw-week-grid') < 0 && PAGE.indexOf('hwWeekGrid') < 0);
ok('and the invented per-item minutes went with it',
  PAGE.indexOf('e == null ? 25 : e') < 0);
/* ⭐⭐ ΤΟ ΞΑΚΡΙΣΜΑ (als-v484): ΕΝΑ μπλοκ, όχι τρία. Η αρχική οθόνη είναι
   ΟΝΟΜΑ · ΣΥΛΛΗΨΗ · ΜΙΑ ΑΠΟΦΑΣΗ · ΤΡΕΙΣ ΠΟΡΤΕΣ — και τα τρία τελευταία είναι
   πράξεις ή δρόμοι προς πράξη. Η μόνη ενότητα που έμεινε είναι η ΣΥΛΛΗΨΗ. */
is('η αρχική οθόνη έχει ΕΝΑ μπλοκ `hw-sec` — τη ΣΥΛΛΗΨΗ',
  (PAGE.match(/class="hw-sec /g) || []).length, 1);
ok('και είναι η σύλληψη', PAGE.indexOf('class="hw-sec hw-grab"') > -1);
/* ⭐ Η ερώτηση χωρίς κουμπί ήταν κριτήριο αποδοχής που έπεφτε. Είτε υπάρχει
   κουμπί που την εκτελεί, είτε δεν υπάρχει ερώτηση. */
ok('the old buttonless question is gone',
  PAGE.indexOf('Θέλεις να φέρω το ελαφρύτερο μία μέρα μπροστά;') < 0);
ok('and the sentence that replaced it carries a real button', PAGE.indexOf('data-fwd=') > -1);
ok('which is wired to a function that performs it', /\[data-fwd\][\s\S]{0,400}bringForward\(/.test(PAGE));

section('4d · «—» is never printed for a measurement that cannot exist');
ok('no ladder card prints an est placeholder', CODE.indexOf('estText') < 0);
ok('a measured est is printed only when it exists',
  PAGE.indexOf("e == null ? null : '~' + e") > -1);
ok("and the task row pushes it only when non-null", /if \(eb\) meta\.push\(eb\)/.test(PAGE));

section('4d · the ΧΡΕΟΣ / ΑΠΟΦΑΣΗ overlap is closed');
{
  /* Η κάρτα δείχνει ΕΝΑ· η λίστα δείχνει ΤΑ ΥΠΟΛΟΙΠΑ. Ο έλεγχος είναι στο
     ίδιο το `paint()`: μία κατάταξη, ένα `featured`, τρεις παραλήπτες. */
  /* Μία δήλωση + ΜΙΑ κλήση. Πριν τη φάση 1 υπήρχαν ΔΥΟ κλήσεις μέσα σε ένα
     paint (η κάρτα και η ΜΕΡΑ), που μπορούσαν να διαφωνήσουν. */
  is('candidates() is declared once and CALLED once per paint',
    (CODE.match(/candidates\(/g) || []).length, 2);
  /* ⭐⭐ ΤΟ ΞΑΚΡΙΣΜΑ ΕΚΛΕΙΣΕ ΤΗΝ ΕΠΙΚΑΛΥΨΗ ΜΕ ΔΙΑΓΡΑΦΗ, ΟΧΙ ΜΕ ΣΥΝΤΟΝΙΣΜΟ.
     Ο `renderDebt()` υπήρχε για να δείχνει ΤΑ ΥΠΟΛΟΙΠΑ της ίδιας κατάταξης
     δίπλα στην κάρτα — δηλαδή ολόκληρη η λύση ήταν να μη λένε το ίδιο δύο
     μπλοκ που δεν έπρεπε να συνυπάρχουν εξαρχής. Έφυγε το ένα. */
  ok('ο renderDebt() ΔΕΝ υπάρχει πια πουθενά',
    CODE.indexOf('renderDebt') < 0 && CODE.indexOf('hwDebt') < 0);
  ok('και το `featured` δεν χρειάζεται πλέον να μοιραστεί',
    /renderStart\(pool\);/.test(PAGE));
  /* ⭐⭐ ΦΑΣΗ 2 ΑΝΤΙΣΤΡΕΦΕΙ ΑΥΤΟ, ΚΑΙ ΕΙΝΑΙ ΑΠΟΦΑΣΗ, ΟΧΙ ΠΑΛΙΝΔΡΟΜΗΣΗ.
     Η επικάλυψη υπήρχε επειδή κάρτα και λίστα ήταν στην ΙΔΙΑ οθόνη. Τώρα η
     λίστα ζει στο δικό της δωμάτιο (`#ergasies`) και δεν είναι ΠΟΤΕ ταυτόχρονα
     ορατή με την κάρτα — άρα δεν υπάρχει τίποτα να αφαιρεθεί, και μια λίστα
     «όλες μου οι εργασίες» που κρύβει μία δεν είναι λίστα.
     Ο μηχανισμός ΜΕΝΕΙ στη συνάρτηση (δέχεται `featured` και τον τιμά), αλλά
     το `paint()` της δίνει ρητά `null`. */
  ok('but the task LIST is handed null — it lives in its own room now',
    /renderTasks\(null\)/.test(PAGE));
  ok('and the omit mechanism still exists, unused, for a screen that shares both',
    PAGE.indexOf("list.filter(function(t){ return t.id !== upId; })") > -1);
  ok('and the day window counts instead of re-listing the top three',
    PAGE.indexOf('candidates(free).slice(0, 3)') < 0);
  /* ⚠️ Αν η κάρτα κρύβει την εργασία από τη λίστα, ΠΡΕΠΕΙ να κουβαλάει τις
     πράξεις της — αλλιώς η πιο επείγουσα είναι η μόνη που δεν σβήνεται. */
  ok('the card carries the hidden task\'s own actions', /acts = '<div class="hw-tacts">/.test(PAGE));
  /* ⚠️ als-v492: ΠΕΝΤΕ — δήλωση + κάρτα + λίστα + ΤΟ ΣΧΕΔΙΟ σε ΔΥΟ οθόνες
     (το μπλοκ της αρχικής και η πόρτα «Απόψε»). Ο κύκλος «Έγινε» του σχεδίου
     είναι ΤΟ ΙΔΙΟ `data-done` με τις εργασίες, άρα περνάει από τον ΙΔΙΟ
     handler — ποτέ δεύτερο αντίγραφο που θα σβήνει με άλλον τρόπο. */
  /* ⚠️ als-v508: ΕΞΙ — προστέθηκε ο host της ΡΑΓΑΣ (`hwDoneWrap`), όπου
     ζωγραφίζεται πλέον το δίπλωμα των τελειωμένων. Ο αριθμός ανεβαίνει ΜΟΝΟ
     όταν προστίθεται ΘΕΣΗ· αν κάποτε ανέβει επειδή γράφτηκε δεύτερος handler,
     αυτός ο φρουρός δεν το βλέπει — γι' αυτό δίπλα του ζει η βεβαίωση ότι τα
     τελειωμένα καλωδιώνονται ΚΑΙ αυτά (αλλιώς κύκλοι που δεν γυρίζουν). */
  ok('and both places wire them through ONE implementation',
    (PAGE.match(/wireTaskActs\(/g) || []).length === 6);
  ok('και ο host της ράγας καλωδιώνεται ΚΑΙ ΑΥΤΟΣ',
    /if \(dhost && dhtml\) wireTaskActs\(dhost\);/.test(PAGE));
}

section('4d · the move writes hw:v1 and NOTHING else, and never into the past');
{
  const F = makeEnv({ now: TUE, store: LADFIX });
  /* Πέμπτη 13/8 → η μετακίνηση πάει Τετάρτη 12/8, που είναι ΑΥΡΙΟ. */
  const id = F.api.addTask({ subject: 'latinika', title: 'ασκήσεις', due: '2026-08-13', kind: 'askisi' });
  const before = F.writes.length;
  const r = F.api.bringForward(id);
  is('it moved exactly one day back', r && r.to, '2026-08-12');
  is('and the store agrees', F.api.taskList().filter(t => t.id === id)[0].due, '2026-08-12');
  const touched = Array.from(new Set(F.writes.slice(before)));
  is('and the ONLY key it wrote is hw:v1', touched, ['hw:v1']);

  /* ⛔ Μια εργασία για ΣΗΜΕΡΑ δεν έχει πού να πάει. Ποτέ στο χθες. */
  const id2 = F.api.addTask({ subject: 'latinika', title: 'σήμερα', due: '2026-08-11', kind: 'askisi' });
  is('a task due TODAY is refused, never moved into yesterday', F.api.bringForward(id2), null);
  is('and it is untouched on disk', F.api.taskList().filter(t => t.id === id2)[0].due, '2026-08-11');
}

section('4d · the pile is named only when it is real, in the FUTURE, and countable');
{
  const F = makeEnv({ now: TUE, store: LADFIX });
  is('two things on a day is not a pile', F.api.pileDay([]), null);
  ['α', 'β', 'γ'].forEach(n => F.api.addTask({ subject: 'latinika', title: n, due: '2026-08-13', kind: 'askisi' }));
  const p = F.api.pileDay(F.api.candidates(null));
  ok('three IS a pile', !!p);
  is('and it counts THINGS, never invented minutes', p.items, 3);
  is('the day before it is offered', p.prevKey, '2026-08-12');
  ok('and something movable was chosen', !!p.move);
  /* ⛔ Ένα διαγώνισμα δεν μετακινείται από εδώ — την ημερομηνία δεν την ορίζουμε εμείς. */
  const G = makeEnv({ now: TUE, store: LADFIX });
  ['α', 'β', 'γ'].forEach(n => G.api.addTask({ subject: 'latinika', title: n, due: '2026-08-13', kind: 'diagonisma' }));
  const q = G.api.pileDay(G.api.candidates(null));
  is('a pile of exams is stated as a fact…', q.items, 3);
  is('…with NO button', q.move, null);
}

/* ══════════════════════════════════════════════════════════════════════
   4e · ⭐⭐ ΦΑΣΗ 2 · ΤΑ ΛΟΓΙΑ ΤΟΥ ΑΠΟΘΗΚΕΥΟΝΤΑΙ ΑΥΤΟΥΣΙΑ

   Ζωντανό λάθος από την als-v470 ως την als-v478: ο parser έκοβε τα
   «για/το/τα/τη/την/στο/στη» από ΟΠΟΥΔΗΠΟΤΕ μέσα στη γραμμή. Η σελίδα
   ξανάγραφε τα λόγια του και μετά τα έδειχνε σαν δικά του — που είναι
   χειρότερο από το να μην τα κρατούσε καθόλου, γιατί δεν φαίνεται.
   ⭐ Ο κανόνας του §6.2: φεύγουν ΜΟΝΟ όταν είναι ΟΛΟΚΛΗΡΟΣ ο τίτλος.
   ══════════════════════════════════════════════════════════════════════ */
section('4e · φάση 2 · his words, VERBATIM');
{
  /* ⭐ Η ΓΡΑΜΜΗ ΤΟΥ BRIEF, ΚΑΤΑ ΛΕΞΗ. Αυτή είναι ΟΛΟΚΛΗΡΟ το κριτήριο. */
  const LINE = 'διάβασε το κείμενο για την Κρήτη';
  const r = P(LINE);
  is('«διάβασε το κείμενο για την Κρήτη» αποθηκεύεται ΑΚΡΙΒΩΣ έτσι', r.title, LINE);
  is('τίποτα δεν μαντεύτηκε ως μάθημα', r.subject, null);
  is('καμία ενότητα', r.unit, null);
  is('καμία ημερομηνία', r.due, null);
  /* ⚠️ ΤΟ ΔΕΥΤΕΡΟ ΜΙΣΟ ΤΟΥ ΙΔΙΟΥ ΛΑΘΟΥΣ: το «κείμενο» ήταν alias των ΓΡΑΠΤΩΝ,
     οπότε η λέξη ΚΑΤΑΝΑΛΩΝΟΤΑΝ (έφευγε από τον τίτλο) ΚΑΙ η εργασία
     κατατασσόταν ως παραγωγή γραπτού — ενώ «διάβασε το κείμενο» είναι
     ανάγνωση. Το σήμα του γραπτού είναι το ΡΗΜΑ, όπως το λέει και το §6.2. */
  is('και «κείμενο» δεν είναι πια ΓΡΑΠΤΟ — είναι ουσιαστικό της γλώσσας του', r.kind, 'askisi');
}
is('το ΡΗΜΑ είναι το σήμα του γραπτού · γράψε', P('γράψε έκθεση 300 λέξεις').kind, 'grapto');
is('· γράψτε', P('λατ γράψτε παράγραφο').kind, 'grapto');
is('και ο τίτλος του γραπτού κρατάει τα λόγια του', P('γράψε έκθεση 300 λέξεις').title, '300 λέξεις');
{
  /* Η ΜΟΝΗ περίπτωση που φεύγουν: όταν δεν έχει μείνει τίποτα άλλο. Τότε δεν
     είναι τίτλος, είναι υπόλειμμα σύνταξης. */
  const r = P('ιστ για την Τρίτη');
  is('μια γραμμή που άφησε ΜΟΝΟ λέξεις-σκουπίδια δίνει κενό τίτλο', r.title, '');
  is('και τα πραγματικά της πεδία λύθηκαν κανονικά', [r.subject, r.due], ['istoria', '2026-08-18']);
}
ok('η θέση της λέξης ΔΕΝ την κρίνει πια — ο έλεγχος είναι σε ΟΛΟΚΛΗΡΟ τον τίτλο',
  CODE.indexOf("w === 'για' || w === 'το'") < 0 && /allStop/.test(CODE));
ok('και ο πίνακας των λέξεων ζει σε ΕΝΑ σημείο', (CODE.match(/TITLE_STOP\s*=/g) || []).length === 1);

/* ══════════════════════════════════════════════════════════════════════
   4e2 · ⛔⛔ ΤΟ ΛΑΘΟΣ ΠΟΥ ΕΛΕΓΕ «ΙΣΤΟΡΙΑ» ΓΙΑ ΟΛΑ ΤΟΥ ΤΑ ΜΑΘΗΜΑΤΑ

   Ζωντανό από την als-v470. Το `subjectOfText` έψαχνε ΥΠΟΣΥΜΒΟΛΟΣΕΙΡΑ μέσα σε
   ΟΛΟΚΛΗΡΟ τον τίτλο του γεγονότος, και η λέξη «φροντιστήριο» περιέχει
   «ιστ» (φροντ-ΙΣΤ-ήριο). Άρα ΚΑΘΕ μάθημα στο ημερολόγιό του γυρνούσε
   `istoria`: το ξαναδιάβασμα των 21:45 ονόμαζε λάθος μάθημα, το «αύριο το
   έχεις» έδινε βάρος στη λάθος σκάλα, το διαγώνισμα χρεωνόταν λάθος.
   ⭐ ΚΑΜΙΑ από τις 140 βεβαιώσεις δεν το έβλεπε, γιατί καμία δεν έδινε στη
   συνάρτηση ΤΙΤΛΟ ΗΜΕΡΟΛΟΓΙΟΥ — μόνο πληκτρολογημένες γραμμές, όπου ο parser
   συγκρίνει ΑΝΑ TOKEN. Βρέθηκε ρεντεράροντας την πόρτα `#tonight` με αληθινό
   ημερολόγιο και ΔΙΑΒΑΖΟΝΤΑΣ τις τρεις γραμμές.
   ══════════════════════════════════════════════════════════════════════ */
section('4e2 · a subject is matched as a WORD, never as a substring');
{
  const S = E.api.subjectOfText;
  is('«Ιστορία — φροντιστήριο» → istoria', S('Ιστορία — φροντιστήριο'), 'istoria');
  /* ⛔ ΑΥΤΕΣ ΟΙ ΔΥΟ ΕΛΕΓΑΝ «istoria». Είναι ΟΛΟΚΛΗΡΟ το bug. */
  is('«Αρχαία — φροντιστήριο» → arxaia, ΟΧΙ istoria', S('Αρχαία — φροντιστήριο'), 'arxaia');
  is('«Λατινικά — φροντιστήριο» → latinika, ΟΧΙ istoria', S('Λατινικά — φροντιστήριο'), 'latinika');
  is('και σκέτο «Φροντιστήριο» δεν είναι ΚΑΝΕΝΑ μάθημα', S('Φροντιστήριο'), null);
  is('«Έκθεση — φροντιστήριο» → ekthesi', S('Έκθεση — φροντιστήριο'), 'ekthesi');
  /* Το πρόθεμα μένει επιτρεπτό: εκεί η ΛΕΞΗ ξεκινάει με το μάθημα. */
  /* ⭐⭐ als-v485 ΚΑΙ ΤΟ ΠΙΟ ΕΠΙΚΙΝΔΥΝΟ ΖΕΥΓΟΣ ΤΗΣ ΣΕΛΙΔΑΣ: το «γνωστο» ΕΙΝΑΙ
     υποσυμβολοσειρά του «αγνωστο». Σώζεται ΜΟΝΟ επειδή ο ταιριαστής δουλεύει
     ανά TOKEN με πρόθεμα. Ελέγχονται ΚΑΙ ΤΑ ΔΥΟ, σε δύο κατευθύνσεις. */
  is('«Αρχαία(Άγνωστο)» λύνεται στο ΑΓΝΩΣΤΟ', S('Αρχαία(Άγνωστο)'), 'arxaia_agn');
  is('και «Αρχαία γνωστό» ΔΕΝ παρασύρεται στο άγνωστο', S('Αρχαία γνωστό'), 'arxaia_gn');
  is('το σκέτο «Αρχαία» μένει το κληρονομικό, χωρίς εικασία', S('Αρχαία'), 'arxaia');
  is('όπως και μια σκέτη συντομογραφία', S('Λατ 3ο'), 'latinika');
  is('ένας άσχετος τίτλος δεν αποκτά μάθημα', S('Γυμναστήριο'), null);
  ok('και το υπερβολικά κοντό «ισ» δεν είναι πια alias', PAGE.indexOf("'ιστ','ισ'") < 0);
}

/* ══════════════════════════════════════════════════════════════════════
   4f · ⭐⭐ ΦΑΣΗ 2 · ΟΙ ΤΡΕΙΣ ΠΟΡΤΕΣ

   Ένα αρχείο, τρεις στιγμές. Η ΣΥΛΛΗΨΗ στις 18:00 είναι υπαρξιακή: αν η
   εργασία δεν μπαίνει, το μισό προϊόν είναι για πάντα άδειο. Ως την als-v478
   ήταν το ΤΕΤΑΡΤΟ πράγμα στο κινητό.
   ══════════════════════════════════════════════════════════════════════ */
section('4f · φάση 2 · the doors are DECLARED, never guessed');
{
  const D = E.api.doorOf;
  is('#capture ανοίγει την πόρτα της σύλληψης', D('#capture'), 'capture');
  is('#tonight την πόρτα των 21:45', D('#tonight'), 'tonight');
  is('χωρίς hash → ολόκληρη η σελίδα', D(''), '');
  is('και ένα ΑΓΝΩΣΤΟ hash δεν κρύβει τίποτα — δεν επινοείται πόρτα', D('#recall:a1a'), '');
  is('ούτε καν ένα που μοιάζει', D('#captures'), '');
  is('null/undefined είναι επίσης «ολόκληρη»', D(null), '');
}
/* ⚠️ ΣΤΑΘΕΡΗ ΑΡΧΗ 12: κάθε κλάση που εναλλάσσεται από JS ΠΡΕΠΕΙ να υπάρχει στο
   CSS. Μια κλάση χωρίς κανόνα είναι σιωπηλό no-op — εδώ θα σήμαινε «η πόρτα
   δεν έκρυψε τίποτα» και η σελίδα θα φαινόταν απλώς… ίδια. */
['hw-door', 'hw-door-capture', 'hw-door-tonight', 'hw-tonight', 'hw-doorbar'].forEach(c => {
  ok('the class ' + c + ' is toggled AND defined in CSS', PAGE.indexOf('.' + c + '{') > -1 || PAGE.indexOf('.' + c + ' ') > -1);
});
ok('a door hides the other blocks rather than duplicating them',
  /body\.hw-door \.hw-hero[\s\S]{0,160}display:none/.test(PAGE));
ok('but NEVER the banner — a save error behind a door would be silent loss',
  PAGE.indexOf('body.hw-door .hw-banner') < 0);
ok('every door has a way out, so it is not a dead end', PAGE.indexOf('data-door="full"') > -1);
ok('and the way out is wired to something that performs it',
  /\[data-door\][\s\S]{0,400}applyDoor\(\)/.test(PAGE));
ok('arriving at a door later (push into an open tab) is handled',
  /hashchange[\s\S]{0,80}applyDoor/.test(PAGE));
/* ⛔⛔ ΤΟ ΠΙΟ ΑΚΡΙΒΟ ΠΟΥ ΒΡΗΚΕ ΤΟ RENDER ΤΗΣ ΦΑΣΗΣ 2. Πίσω από το `#capture`
   το `.hw-grab` είναι ΤΟ ΜΟΝΟ περιεχόμενο, και το page-motion.js το γεννάει
   `opacity:0` περιμένοντας IntersectionObserver. Ρεντεραρίστηκε ΑΚΡΙΒΩΣ έτσι:
   μπάρα ορατή, πεδίο ΑΦΑΝΤΟ — μαύρη οθόνη στη μία στιγμή που όλη η δυνατότητα
   υπάρχει γι' αυτήν. Μια πόρτα δεν έχει είσοδο· ΕΙΝΑΙ η είσοδος. */
ok('nothing behind a door is born invisible waiting for an observer',
  /body\.hw-door \[data-rise\]\{ opacity:1 !important/.test(PAGE));
ok('and the capture field does not stretch to the full laptop width',
  /body\.hw-door \.hw-wrap\{ max-width:720px/.test(PAGE));

section('4f · φάση 2 · ONE markup tree — the phone reorders, the laptop does not');
{
  /* ⛔ Δύο δέντρα markup είναι δύο σελίδες με καθυστέρηση: η μία διορθώνεται
     και η άλλη όχι. Η αναδιάταξη γίνεται με `order`, όχι με αντίγραφο. */
  is('η σύλληψη υπάρχει ΜΙΑ φορά στο markup', (PAGE.match(/class="hw-sec hw-grab"/g) || []).length, 1);
  is('όπως και το πεδίο της', (PAGE.match(/id="hwLine"/g) || []).length, 1);
  const phone = (PAGE.match(/@media \(max-width:999px\)\{([\s\S]*?)\n  \}/) || [])[1] || '';
  ok('υπάρχει media query ΜΟΝΟ για το κινητό', phone.length > 0);
  const orderOf = cls => {
    const m = phone.match(new RegExp('\\.' + cls + '\\{[^}]*order:(\\d+)'));
    return m ? +m[1] : null;
  };
  const grab = orderOf('hw-grab');
  ok('η ΣΥΛΛΗΨΗ έχει δηλωμένη σειρά στο κινητό', grab !== null);
  [['hw-hero', 'ο τίτλος'], ['hw-start', 'η απόφαση'],
   ['hw-doors', 'οι πόρτες']].forEach(p => {
    const o = orderOf(p[0]);
    ok('στο κινητό η σύλληψη έρχεται ΠΡΙΝ ' + p[1], o !== null && grab < o);
  });
  ok('τα δύο δοχεία διαλύονται ώστε τα εγγόνια να ταξινομούνται μεταξύ τους',
    /\.hw-spine, \.hw-main\{ display:contents/.test(phone));
  /* ⛔ ΤΟ LAPTOP ΔΕΝ ΑΓΓΙΧΤΗΚΕ — 99% της ανάγνωσής του γίνεται εκεί. */
  /* ⭐⭐ als-v484 ΑΛΛΑΖΕΙ ΑΥΤΟΝ ΤΟΝ ΚΑΝΟΝΑ ΕΠΙΤΗΔΕΣ, ΚΑΙ ΤΟ ΕΔΕΙΞΕ ΤΟ RENDER.
     Οι δύο στήλες υπήρχαν για να μη μένει μαύρο το 55% της οθόνης στα 1280 —
     σωστό όσο η δεξιά στήλη κρατούσε ΤΕΣΣΕΡΑ μπλοκ. Μετά το ξάκρισμα κρατούσε
     ΕΝΑ: μετρημένο στα 1440, **146px περιεχομένου σε 790px στήλη**. Άρα το
     ΚΕΝΤΡΟ γίνεται μία κεντραρισμένη στήλη, και τα ΔΩΜΑΤΙΑ (που έχουν όγκο)
     κρατάνε τα δικά τους πλάτη ανέπαφα. */
  /* ⭐⭐ als-v486 ΞΑΝΑΓΥΡΙΖΕΙ ΤΟΝ ΙΔΙΟ ΚΑΝΟΝΑ, ΚΑΙ ΓΙ' ΑΥΤΟ ΜΕΤΡΙΕΤΑΙ ΞΑΝΑ.
     Ο κανόνας δεν είναι «560» — είναι «η διάταξη απαντάει στον ΟΓΚΟ». Στην
     als-v484 ο όγκος ήταν ΕΝΑ μπλοκ, άρα 560. Τώρα οι πέντε κάρτες μπήκαν
     στην αρχική οθόνη, άρα το κέντρο φαρδαίνει στα 880 — ΚΑΙ Η ΠΡΟΖΑ ΜΕΝΕΙ
     ΣΤΑ 560, γιατί ο κανόνας των 75 χαρακτήρων δεν καταργήθηκε. */
  ok('το ΚΕΝΤΡΟ είναι μία κεντραρισμένη στήλη, όχι δύο',
    /body:not\(\.hw-door\) \.hw-wrap\{ max-width:880px; \}/.test(PAGE) &&
    /body:not\(\.hw-door\) \.hw-cols\{ display:flex; flex-direction:column; \}/.test(PAGE));
  ok('⛔ αλλά η ΠΡΟΖΑ και τα ΠΕΔΙΑ μένουν στα 560 — ένα input 880px είναι λάθος',
    /body:not\(\.hw-door\) \.hw-grab\{ width:100%; max-width:560px/.test(PAGE) &&
    ['hw-hero', 'hw-banner', 'hw-start', 'hw-doors'].every(c =>
      new RegExp('body:not\\(\\.hw-door\\) \\.' + c + ',').test(PAGE)));
  /* ⭐ als-v508: ΤΟ ΔΩΜΑΤΙΟ ΤΩΝ ΕΡΓΑΣΙΩΝ ΦΑΡΔΑΙΝΕΙ ΕΠΙΤΗΔΕΣ, 840 → 1180.
     Μετρήθηκε: στα 840 η στήλη ήταν 804px σε οθόνη 1440, δηλαδή **44% μαύρο
     περιθώριο** — ΤΟ ΛΑΠΤΟΠ ΔΕΝ ΕΙΝΑΙ ΜΕΓΑΛΟ ΚΙΝΗΤΟ (σταθ. 51).
     ⛔ Ο φρουρός φυλάει τώρα αυτό που ΠΡΕΠΕΙ: ότι φαρδαίνει ΜΟΝΟ αυτή η
     πόρτα. Το `#capture` και το `#tonight` είναι ΕΝΑ πεδίο και τρεις γραμμές
     — εκεί το 720 είναι σωστό, και ένα φαρδύτερο input είναι το λάθος των
     1.144px της als-v477. */
  ok('⭐ το ΔΩΜΑΤΙΟ των εργασιών φαρδαίνει για laptop',
    /body\.hw-door-ergasies \.hw-wrap\{ max-width:1180px/.test(PAGE));
  ok('⛔ αλλά ΜΟΝΟ αυτό — οι άλλες πόρτες μένουν στα 720',
    /body\.hw-door \.hw-wrap\{ max-width:720px/.test(PAGE) &&
    !/body\.hw-door-(capture|tonight|programma) \.hw-wrap\{ max-width:(?!720)/.test(PAGE));
  /* ⚠️ ΠΡΙΝ ΠΙΣΤΕΨΕΙΣ ΜΙΑ ΑΠΟΤΥΧΙΑ, ΕΛΕΓΞΕ ΤΟ ΟΡΓΑΝΟ (σταθερή αρχή 30). Η
     πρώτη γραφή αυτού ήταν σκέτο `/order:\d/`, που ταιριάζει μέσα στο
     `border:1px` — και κατηγόρησε σωστό CSS σε ολόκληρο το αρχείο. Η ιδιότητα
     ξεκινάει πάντα μετά από `{`, `;` ή κενό. */
  const ORDER_RE = /[;{\s]order:\s*\d/g;
  /* ⭐ Η ΣΕΙΡΑ ΖΕΙ ΠΛΕΟΝ ΣΕ ΔΥΟ MEDIA QUERIES, ΚΑΙ ΕΙΝΑΙ ΑΠΟΦΑΣΗ: στο κινητό
     πρώτη η ΣΥΛΛΗΨΗ (18:00, όρθιος με την τσάντα — δική του εντολή, als-v479)·
     στο laptop πρώτα ΔΙΑΒΑΖΕΙ και γράφει όταν θυμηθεί. Ο κανόνας που μένει
     φορτίο είναι ότι ΚΑΜΙΑ σειρά δεν ζει ΕΞΩ από media query — αλλιώς θα
     εφαρμοζόταν και πίσω από τις πόρτες, όπου δεν υπάρχει flex να την τιμήσει. */
  const laptop = (PAGE.match(/@media \(min-width:1000px\)\{[\s\S]*?\n  \}/g) || []).join('');
  /* ⚠️⚠️ ΤΟ ΟΡΓΑΝΟ ΗΤΑΝ ΛΑΘΟΣ ΚΑΙ ΚΑΤΗΓΟΡΗΣΕ ΣΩΣΤΟ CSS (σταθ. 30, ξανά).
     Το `phone` παραπάνω είναι `match` ΧΩΡΙΣ `/g`, άρα κρατάει ΜΟΝΟ ΤΟ ΠΡΩΤΟ
     `@media (max-width:999px)` της σελίδας — σωστό για το `orderOf`, που
     ρωτάει για τη σειρά ΤΟΥ ΚΕΝΤΡΟΥ και δεν πρέπει να μπερδεύεται με άλλα
     block. Λάθος όμως εδώ: μόλις η als-v508 πρόσθεσε ΔΕΥΤΕΡΟ phone block (η
     σειρά του δωματίου των εργασιών), οι τρεις σειρές του μετρήθηκαν στο
     ΣΥΝΟΛΟ και όχι στο άθροισμα, και ο φρουρός κοκκίνισε για κανόνα που
     ΤΗΡΕΙΤΑΙ. Ο κανόνας που φυλάει είναι «καμία σειρά ΕΞΩ από media query»,
     άρα πρέπει να δει ΟΛΑ τα phone blocks. Δύο σταθερές, μία δουλειά η καθεμία. */
  const phoneAll = (PAGE.match(/@media \(max-width:999px\)\{[\s\S]*?\n  \}/g) || []).join('');
  ok('καμία αναδιάταξη δεν ζει ΕΞΩ από media query',
    (PAGE.match(ORDER_RE) || []).length ===
    (phoneAll.match(ORDER_RE) || []).length + (laptop.match(ORDER_RE) || []).length);
  /* ⭐ ΒΕΒΑΙΩΣΕ ΤΗΝ ΙΔΙΟΤΗΤΑ, ΟΧΙ ΕΝΑ ΣΤΙΓΜΙΟΤΥΠΟ ΤΗΣ (als-v453, ξανά). Η
     πρώτη γραφή απαιτούσε ΑΚΡΙΒΩΣ `body:not(.hw-door) .hw-x{ order:`, οπότε
     κοκκίνισε μπροστά σε `body:not(.hw-door).hw-t-capture .hw-apog{ order:3 }`
     — που ΤΗΡΕΙ τον κανόνα και είναι απλώς πιο ειδικό. Ένας φρουρός που κράζει
     λύκο είναι φρουρός που κάποιος χαλαρώνει (σταθ. 19), άρα ελέγχει ΚΑΘΕ
     γραμμή με `order:` ότι ο επιλογέας της αποκλείει τις πόρτες. */
  const laptopOrderLines = laptop.split('\n').filter(l => /[;{\s]order:\s*\d/.test(l));
  ok('υπάρχουν σειρές laptop να ελεγχθούν', laptopOrderLines.length > 0);
  ok('και κάθε σειρά του laptop ισχύει ΜΟΝΟ στο κέντρο, ποτέ πίσω από πόρτα',
    laptopOrderLines.every(l => l.indexOf('body:not(.hw-door)') > -1));
}

section('4f · φάση 2 · the 21:45 door is the SAME reader, not a second copy');
{
  /* σταθερή αρχή 15: μία εγγύηση σε δύο θέσεις, ή είναι σύμπτωση με καλή φήμη.
     Μία δήλωση + δύο κλήσεις (η ΜΕΡΑ και η πόρτα). */
  /* ⚠️ als-v484: ήταν ΤΡΕΙΣ (δήλωση + ΜΕΡΑ + πόρτα). Η ΜΕΡΑ κόπηκε, άρα δύο.
     Ο αριθμός δεν είναι ο κανόνας — ο κανόνας είναι ΜΙΑ δήλωση, και κάθε
     αναγνώστης να περνάει από ΑΥΤΗΝ. Γι' αυτό ελέγχεται και το δεύτερο. */
  /* ⭐⭐ als-v492 · Ο ΑΝΑΓΝΩΣΤΗΣ ΑΛΛΑΞΕ ΟΝΟΜΑ ΚΑΙ ΕΡΩΤΗΣΗ, Ο ΚΑΝΟΝΑΣ ΟΧΙ.
     Το `tonightView()` έδειχνε ΤΑ ΣΗΜΕΡΙΝΑ ΜΑΘΗΜΑΤΑ για ξαναδιάβασμα· ο
     `planFor()` απαντάει «τι έχω για την επόμενη μέρα». Παραμένει ΜΙΑ δήλωση
     με δύο αναγνώστες — το μπλοκ της αρχικής (`renderPlan`) και η πόρτα
     (`renderTonight`) — γιατί δύο μετρήσεις είναι δύο απαντήσεις για το ίδιο
     βράδυ, με καθυστέρηση (σταθ. 15). */
  is('planFor() δηλώνεται ΜΙΑ φορά', (CODE.match(/function planFor\(/g) || []).length, 1);
  is('και διαβάζεται από ΚΑΙ ΤΟΥΣ ΔΥΟ αναγνώστες, ποτέ από τρίτη μέτρηση',
    (CODE.match(/planFor\(\)/g) || []).length, 2);
  is('το σώμα ζωγραφίζεται από ΜΙΑ υλοποίηση', (CODE.match(/function planBody\(/g) || []).length, 1);
  /* ⚠️ ΤΡΙΑ, ΚΑΙ ΔΕΝ ΕΙΝΑΙ ΛΑΘΟΣ: `function planBody(p){` ταιριάζει κι αυτό.
     Μία ΔΗΛΩΣΗ + ΔΥΟ κλήσεις — που είναι ακριβώς ο κανόνας που ελέγχεται. */
  is('που την καλούν και οι δύο οθόνες', (CODE.match(/planBody\(p\)/g) || []).length, 3);
  /* ⚠️ Ο ΙΔΙΟΣ ΦΡΟΥΡΟΣ ΣΧΗΜΑΤΟΣ ΜΕ ΠΡΙΝ, ΚΑΙ ΓΙΑ ΤΟΝ ΙΔΙΟ ΛΟΓΟ: ένας έλεγχος
     ΠΑΡΟΥΣΙΑΣ («υπάρχει κάπου παρακάτω το p.day») περνάει κάθε μετάλλαξη που
     καρφώνει τιμή ΜΠΡΟΣΤΑ από τον σωστό υπολογισμό. Ελέγχεται η ΑΝΑΘΕΣΗ. */
  is('η πόρτα «Απόψε» γράφεται ΜΙΑ φορά', (CODE.match(/\$\('hwDoorsN'\)\.textContent =/g) || []).length, 1);
  ok('και η ανάθεσή της ΞΕΚΙΝΑΕΙ από το σχέδιο, όχι από καρφωμένη τιμή',
    /\$\('hwDoorsN'\)\.textContent = planTally\(p\);/.test(CODE));
  /* ⛔⛔ ΤΟ ΞΑΝΑΔΙΑΒΑΣΜΑ ΕΦΥΓΕ ΑΠΟ ΤΗΝ ΟΘΟΝΗ — ΚΑΙ Ο ΦΡΟΥΡΟΣ ΕΙΝΑΙ ΟΤΙ Η
     ΑΠΟΘΗΚΗ ΕΜΕΙΝΕ. «Ο,τι σβήστηκε είναι ΟΘΟΝΗ, ποτέ αποθήκη» (als-v484): αν
     κάποιος «καθαρίσει» και το `lessons`, η απογραφή σταματάει να καταγράφει
     τη μέρα και το μπλοκ ξαναρωτάει «τι σου έβαλαν;» κάθε βράδυ. */
  ok('ο νεκρός αναγνώστης του ξαναδιαβάσματος ΔΕΝ επιβιώνει σε καμία μορφή',
    CODE.indexOf('tonightView') < 0 && CODE.indexOf('TONIGHT_TXT') < 0);
  ok('⭐ αλλά η ΑΠΟΘΗΚΗ των μαθημάτων γράφεται ακόμη από την απογραφή',
    /setLessons\(dkOf\(apogRefDate\(\)\), subs\)/.test(CODE));
  ok('⭐ και το «πες μου τα σημερινά» ΕΠΙΒΙΩΣΕ — ήταν η ΜΟΝΗ του είσοδος',
    (CODE.match(/pickBtn\(/g) || []).length >= 2 && (CODE.match(/wirePick\(/g) || []).length >= 2);
  /* ⭐ Ο σύνδεσμος προς την πόρτα υπάρχει ΜΟΝΟ όταν η πόρτα έχει περιεχόμενο.
     ⚠️ Η φάση 3 πρόσθεσε ΔΕΥΤΕΡΗ γεμάτη κατάσταση (`mine`), οπότε η συνθήκη
     ονομάστηκε `filled` αντί να γίνει `||` σε δύο σημεία — δύο αντίγραφα της
     ίδιας συνθήκης είναι δύο συνθήκες με καθυστέρηση (σταθερή αρχή 15). */
  /* ⭐⭐ als-v484 ΑΝΤΙΣΤΡΕΦΕΙ ΤΟΝ ΚΑΝΟΝΑ ΤΗΣ ΕΙΣΟΔΟΥ, ΚΑΙ ΕΙΝΑΙ ΑΝΑΒΑΘΜΙΣΗ.
     Πριν, ο σύνδεσμος προς το `#tonight` εμφανιζόταν ΜΟΝΟ αν η πόρτα είχε
     περιεχόμενο — σωστό όσο ζούσε μέσα στη ΜΕΡΑ, γιατί ήταν ένα «Μόνο αυτό»
     δίπλα στα ίδια τα μαθήματα. Κόβοντας τη ΜΕΡΑ, μια πόρτα που εμφανίζεται
     ΜΟΝΟ όταν ξέρουμε τα μαθήματα είναι πόρτα που ΔΕΝ μπορείς να ανοίξεις για
     να μας ΠΕΙΣ τα μαθήματα — δηλαδή αδιέξοδο ακριβώς στην κατάσταση που
     υπάρχει για να λυθεί. Άρα: η πόρτα είναι ΜΟΝΙΜΗ, και η υπογραμμή της λέει
     την αλήθεια για κάθε κατάσταση. */
  ok('η πόρτα «Απόψε» υπάρχει ΠΑΝΤΑ, γιατί είναι ο δρόμος να μας πεις τι είχες',
    /href="#tonight"[\s\S]{0,160}id="hwDoorsN"/.test(PAGE));
  /* ⭐ σταθ. 33, στη νέα της θέση: «δεν έχω πρόγραμμα» ΔΕΝ γράφεται σαν
     «δεν χρωστάς τίποτα». Το πρώτο είναι άγνοια, το δεύτερο μέτρηση. */
  ok('και ΔΕΝ γράφει ποτέ μηδέν για κάτι που δεν μετρήθηκε (σταθ. 33)',
    CODE.indexOf("'δεν ξέρω τις μέρες σου'") > -1 && CODE.indexOf("'τίποτα για '") > -1);
  ok('the door is NOT a fifth block — it never wears hw-sec',
    PAGE.indexOf('class="hw-tonight"') > -1 && PAGE.indexOf('hw-sec hw-tonight') < 0);
}
/* Και ο μετρητής των μπλοκ ΔΕΝ κουνήθηκε: η φάση 1 τα έκανε τέσσερα και η
   φάση 2 δεν έχει δικαίωμα να προσθέσει πέμπτο. */
is('και ο μετρητής των μπλοκ μένει ΕΝΑ', (PAGE.match(/class="hw-sec /g) || []).length, 1);

/* ══════════════════════════════════════════════════════════════════════
   4g · ⭐⭐ ΦΑΣΗ 2 · ΤΟ PUSH ΤΩΝ 18:00 — ΚΑΙ ΤΑ ΤΕΣΣΕΡΑ ΑΚΡΑ ΤΟΥ

   Ένα βαθύ link είναι πρωτόκολλο με τέσσερις συμμετέχοντες: ο cron που το
   στέλνει, το payload που το κουβαλάει, ο service worker που το ανοίγει, και
   η σελίδα που το διαβάζει. Αν ΕΝΑΣ δεν συμμετέχει, το πάτημα προσγειώνεται
   αλλού και ΚΑΝΕΝΑ test της σελίδας δεν το βλέπει (σταθερή αρχή 23).
   ══════════════════════════════════════════════════════════════════════ */
section('4g · φάση 2 · the 18:00 push lands ON the capture field');
{
  const REM = fs.readFileSync(path.join(ALS, 'api/run-reminders.js'), 'utf8');
  const SW = fs.readFileSync(path.join(ALS, 'sw.js'), 'utf8');
  const CLIENT = fs.readFileSync(path.join(ALS, 'reminders.js'), 'utf8');

  /* ① ο cron το στέλνει, στις 18:00, με προορισμό */
  const entry = (REM.match(/\{ id: 'homework',[\s\S]{0,600}?\n    \} \},/) || [])[0] || '';
  ok('run-reminders has a homework reminder', entry.length > 0);
  ok('it fires at 18:00', /defHour: 18/.test(entry));
  const URL_ = (entry.match(/url: '([^']+)'/) || [])[1];
  is('and it names a destination', URL_, 'homework.html#capture');
  ok('it does not nag on a day he already wrote something down', /!c\.capturedToday/.test(entry));
  ok('nor at the weekend, when there is no φροντιστήριο', /c\.schoolDay/.test(entry));
  ok('and both facts are actually computed from his row',
    /capturedToday: capturedToday, openTasks: openTasks, schoolDay: schoolDay/.test(REM));
  /* ⚠️ σταθερή αρχή 23: ένας αναγνώστης που αγνοεί τις ταφόπλακες λέει λάθος
     απάντηση σιωπηλά. Το ίδιο λάθος έλεγε 4.671 kcal αντί για 1.461. */
  ok('the server READS the tombstones it is handed, like every other reader',
    /_deletes[\s\S]{0,120}hw:v1[\s\S]{0,80}tasks/.test(REM) && /tombed\(hwTomb, id, t\)/.test(REM));

  /* ② το payload το κουβαλάει */
  ok('the payload carries the url', /tag: 'als-' \+ r\.id, url: r\.url \|\| ''/.test(REM));

  /* ③ ο service worker το ανοίγει — ΚΑΙ ΤΑ ΔΥΟ ΑΚΡΑ ΤΟΥ, γιατί το
        notificationclick δεν βλέπει ποτέ το αρχικό payload */
  ok('showNotification stores the url in data', /data: \{ url: data\.url \|\| '' \}/.test(SW));
  ok('and notificationclick reads it back', /e\.notification\.data && e\.notification\.data\.url/.test(SW));
  ok('an open tab is NAVIGATED, not just focused', /'navigate' in c[\s\S]{0,120}c\.navigate\(url\)/.test(SW));
  ok('a rejected navigate still focuses something, never nothing', /\.catch\(function \(\) \{ return c\.focus\(\); \}\)/.test(SW));
  ok('a push with NO url behaves exactly as before', /openWindow\(url \|\| 'gym\.html'\)/.test(SW));

  /* ④ η σελίδα το διαβάζει — και αυτή είναι η βεβαίωση που κάνει το link
        ΔΗΛΩΜΕΝΟ αντί για επινοημένο */
  /* ⚠️ ΠΟΤΕ ΜΗΝ ΑΦΗΣΕΙΣ ΤΟΝ ΦΡΟΥΡΟ ΝΑ ΠΕΤΑΞΕΙ ΑΝΤΙ ΝΑ ΚΟΚΚΙΝΙΣΕΙ: στη μετάλλαξη
     «βγάλε το url» αυτό έσκαγε με stack trace αντί για μια γραμμή που λέει τι
     χάλασε — και ένα crash είναι ένα αποτέλεσμα που κάποιος διαβάζει ως «το
     test είναι χαλασμένο». */
  const file = String(URL_ || '').split('#')[0], hash = '#' + String(URL_ || '').split('#')[1];
  ok('the file the server sends actually exists', !!file && fs.existsSync(path.join(ALS, file)));
  is('and the page opens the capture door on exactly that hash', E.api.doorOf(hash), 'capture');

  /* ⑤ ο χρήστης μπορεί να τη σβήσει, όπως κάθε άλλη */
  ok('the reminder is visible and switchable in the settings card', /homework: \{ on: true, hour: 18/.test(CLIENT));
  ok('and it is in the rendered order', /'caffeine', 'homework'/.test(CLIENT));

  /* ⛔ ΚΑΝΕΝΑ 13ο api/*.js — τα deploys σπάνε. Δουλειά server = μέσα σε
     υπάρχουσα συνάρτηση. */
  const fns = JSON.parse(fs.readFileSync(path.join(ALS, 'vercel.json'), 'utf8')).functions || {};
  ok('no 13th serverless function was added', Object.keys(fns).length <= 12);
}

/* ══════════════════════════════════════════════════════════════════════
   4h · ⭐⭐ ΦΑΣΗ 3 · ΤΑ ΤΡΙΑ ΣΗΜΕΡΙΝΑ — ΤΟ 21:45 ΓΕΜΙΖΕΙ ΧΩΡΙΣ ΗΜΕΡΟΛΟΓΙΟ

   Το κριτήριο αποδοχής είναι μία πρόταση: «το 21:45 γεμίζει ΧΩΡΙΣ ημερολόγιο,
   και οι τρεις καταστάσεις ημερολογίου βγάζουν τρεις διαφορετικές προτάσεις».
   Άρα ελέγχεται ΑΚΡΙΒΩΣ αυτό, σε συσκευή που ΔΕΝ έχει ημερολόγιο — που είναι
   και η μόνη συσκευή στην οποία ΘΑ χρησιμοποιηθεί (τα `gcal:*` είναι τοπικά).
   ══════════════════════════════════════════════════════════════════════ */
section('4h · φάση 3 · χωρίς ημερολόγιο, η μέρα είναι ΑΓΝΩΣΤΗ — όχι άδεια');
{
  const E3 = makeEnv({});
  is('η συσκευή όντως δεν έχει ημερολόγιο', E3.api.calState(), 'unauthorised');
  is('και δεν το μαντεύει', E3.api.lessonsFor(0), null);
  /* ⭐⭐ als-v492: ΤΟ ΒΡΑΔΥ ΔΕΝ ΕΞΑΡΤΑΤΑΙ ΠΙΑ ΑΠΟ ΤΟ ΗΜΕΡΟΛΟΓΙΟ ΚΑΘΟΛΟΥ.
     Η φάση 3 έλυσε το «το 21:45 γεμίζει χωρίς GCal» βάζοντάς τον να ΠΕΙ τα
     σημερινά του. Το σχέδιο το λύνει από τη ρίζα: διαβάζει το ΠΡΟΓΡΑΜΜΑ, που
     είναι συγχρονισμένη αποθήκη — άρα γεμίζει σε ΚΑΘΕ συσκευή, χωρίς να
     ρωτηθεί τίποτα. Το κριτήριο μένει· η απάντηση έγινε φθηνότερη. */
  const p = E3.api.planFor();
  ok('ΤΟ ΒΡΑΔΥ ΞΕΡΕΙ ΤΗ ΜΕΡΑ ΤΟΥ ΧΩΡΙΣ ΗΜΕΡΟΛΟΓΙΟ', !!p.day);
  ok('και τη γεμίζει με τα μαθήματα του προγράμματος', p.slots.length > 0);
  ok('που είναι όλα αναγνωρίσιμα μαθήματα, ποτέ σκουπίδι',
    p.slots.every(s => typeof s.subject === 'string' && s.subject.length > 0));
  /* ⛔ ΚΑΙ ΠΟΤΕ Η ΣΗΜΕΡΙΝΗ ΜΕΡΑ ΩΣ «ΕΠΟΜΕΝΗ» ΜΕΤΑ ΤΙΣ 18:00 — αυτό ακριβώς
     ήταν το παράπονό του: του έδειχνε τα ΣΗΜΕΡΙΝΑ σαν να ήταν το χρέος. */
  const nx = E3.api.nextSchoolDay(E3.api.today());
  ok('η επόμενη μέρα φροντιστηρίου είναι ΑΥΣΤΗΡΑ μετά τη σημερινή',
    nx === null || nx > E3.api.today());
  ok('και ΠΟΤΕ δεν είναι Σαββατοκύριακο — γυρίζει σε μέρα που όντως έχει μάθημα',
    nx === null || E3.api.slotsOfDay(nx).length > 0);
  /* Η επιλογή του για τη ΣΗΜΕΡΙΝΗ μέρα εξακολουθεί να γράφεται και να διαβάζεται
     — η αποθήκη δεν αγγίχτηκε όταν έφυγε το ξαναδιάβασμα από την οθόνη. */
  ok('τα λέει ο ίδιος, και γράφονται', E3.api.setLessons(E3.api.today(), ['arxaia', 'istoria', 'latinika']));
  is('και διαβάζονται πίσω, ΣΤΗ ΣΕΙΡΑ ΠΟΥ ΤΑ ΠΑΤΗΣΕ',
    E3.api.myLessons(E3.api.today()), ['arxaia', 'istoria', 'latinika']);
}

section('4h · φάση 3 · «δεν είχα μάθημα» ΕΙΝΑΙ απάντηση, και όχι η ίδια με «δεν ξέρω»');
{
  const E3 = makeEnv({});
  is('πριν πει οτιδήποτε, δεν υπάρχει εγγραφή', E3.api.myLessons(E3.api.today()), null);
  ok('λέει ότι δεν είχε', E3.api.setLessons(E3.api.today(), []));
  is('και ΑΥΤΟ είναι εγγραφή, όχι απουσία', E3.api.myLessons(E3.api.today()), []);
  /* ⭐ als-v492: η ΔΙΑΚΡΙΣΗ ΕΠΙΒΙΩΝΕΙ ΣΤΗΝ ΑΠΟΘΗΚΗ, που είναι εκεί που μετράει.
     `null` = δεν είπε τίποτα · `[]` = ΕΙΠΕ ότι δεν είχε. Δύο διαφορετικά
     πράγματα, και ο αναγνώστης δεν τα ισοπεδώνει (σταθ. 33). Οι τρεις
     προτάσεις του ξαναδιαβάσματος έφυγαν ΜΑΖΙ με την οθόνη τους. */
  const E9 = makeEnv({});
  is('σε άλλη συσκευή, «δεν είπε τίποτα» μένει null', E9.api.myLessons(E9.api.today()), null);
  ok('και τα δύο ΔΕΝ είναι η ίδια τιμή',
    JSON.stringify(E3.api.myLessons(E3.api.today())) !== JSON.stringify(E9.api.myLessons(E9.api.today())));
  /* ⛔ Η ΠΑΛΙΑ ΠΡΟΤΑΣΗ ΗΤΑΝ ΑΔΙΕΞΟΔΟ ΜΕΤΑ ΤΗ ΦΑΣΗ 3: έστελνε σε μια ρύθμιση
     άλλης σελίδας για κάτι που λύνεται με τέσσερα πατήματα εδώ. */
  /* ⚠️ ΣΤΑΘΕΡΗ ΑΡΧΗ 19, ΓΙΑ ΤΡΙΤΗ ΦΟΡΑ ΣΕ ΑΥΤΟ ΤΟ ΑΡΧΕΙΟ: η πρώτη γραφή αυτού
     έψαχνε στο PAGE και έπιανε το ΣΧΟΛΙΟ που τεκμηριώνει την ίδια την
     αφαίρεση. Οι απαγορεύσεις ελέγχονται πάνω στον ΚΩΔΙΚΑ. */
  ok('καμία άδεια κατάσταση δεν στέλνει πια στο ημερολόγιο ως μόνη λύση',
    CODE.indexOf('άνοιξέ το και θα γεμίζει μόνο του') < 0);
  ok('και το κουμπί «πες μου τα σημερινά» δηλώνεται ΜΙΑ φορά και καλείται ΜΙΑ',
    (CODE.match(/pickBtn\(/g) || []).length === 2);
}

section('4h · φάση 3 · η επιλογή του ΝΙΚΑΕΙ το ημερολόγιο, γιατί είναι διόρθωση');
{
  /* Ένα αληθινό ημερολόγιο, με τους τίτλους που γράφει ΕΚΕΙΝΟΣ — «φροντιστήριο»
     μέσα σε κάθε έναν, που είναι η λέξη που κόστισε τη σταθερή αρχή 38. */
  const d = new Date(); d.setHours(0, 0, 0, 0);
  const at = (h, m) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, m).toISOString();
  const evs = [
    { id: 'e1', title: 'Ιστορία — φροντιστήριο', start: at(15, 15), end: at(16, 15) },
    { id: 'e2', title: 'Αρχαία — φροντιστήριο', start: at(16, 15), end: at(17, 15) },
    { id: 'e3', title: 'Λατινικά — φροντιστήριο', start: at(17, 15), end: at(18, 0) }
  ];
  const E3 = makeEnv({ store: {
    'gcal:connected': '1',
    'gcal:events': JSON.stringify({ ts: Date.now(), events: evs, cals: [] })
  } });
  is('το ημερολόγιο διαβάζεται', E3.api.calState(), 'live');
  const cal = E3.api.lessonsFor(0);
  is('και γεμίζει μόνο του', cal.length, 3);
  is('με τα τρία σωστά μαθήματα (σταθερή αρχή 38)', cal.map(x => x.subject), ['istoria', 'arxaia', 'latinika']);
  is('και τις ΑΛΗΘΙΝΕΣ τους ώρες', cal.map(x => x.at), [915, 975, 1035]);

  /* Ο καθηγητής άλλαξε το τρίτο. Η διόρθωσή ΤΟΥ είναι η αλήθεια. */
  ok('διορθώνει', E3.api.setLessons(E3.api.today(), ['istoria', 'ekthesi']));
  const fix = E3.api.myLessons(E3.api.today());
  ok('η επιλογή του κερδίζει το ημερολόγιο', fix !== null);
  is('και είναι ΑΚΡΙΒΩΣ ό,τι είπε — καμία ένωση με το ημερολόγιο', fix, ['istoria', 'ekthesi']);
  /* Και μπορεί να την πάρει πίσω: ένα χειριστήριο που δεν αναιρείται δεν είναι
     διόρθωση, είναι μονόδρομος. */
  ok('την ακυρώνει', E3.api.clearLessons(E3.api.today()));
  is('και η μέρα γυρίζει στο ημερολόγιο', E3.api.myLessons(E3.api.today()), null);
  /* ⚠️ ΠΟΤΕ ΜΗΝ ΑΦΗΣΕΙΣ ΤΟΝ ΦΡΟΥΡΟ ΝΑ ΠΕΤΑΞΕΙ ΑΝΤΙ ΝΑ ΚΟΚΚΙΝΙΣΕΙ (als-v479,
     ξανά): η πρώτη γραφή αυτού έκανε `[KEY].lessons` σε σκέτο literal, οπότε
     στη μετάλλαξη «βγάλε την ταφόπλακα» έσκαγε με stack trace — και ένα crash
     είναι αποτέλεσμα που κάποιος διαβάζει ως «το test είναι χαλασμένο». */
  const tmb = JSON.parse(E3.store['__synctomb__' + APP] || '{}');
  is('με ταφόπλακα, αλλιώς το πρώτο pull την ξαναφέρνει',
    Object.keys(((tmb[KEY] || {}).lessons) || {}), [E3.api.today()]);
}

section('4h · φάση 3 · ο αναγνώστης δεν γράφει, και ο γραφέας γράφει ΜΟΝΟ hw:v1');
{
  const E3 = makeEnv({});
  const before = E3.writes.length;
  E3.api.myLessons(E3.api.today());
  /* ⭐ als-v492: ο ΝΕΟΣ αναγνώστης μπαίνει στον ΙΔΙΟ φρουρό. Το `planFor()`
     διαβάζει εργασίες, πρόγραμμα και ημερομηνίες — τρεις αφορμές να γεννήσει
     κέλυφος κατά λάθος, που είναι ακριβώς το bug του `nut:streak`. */
  E3.api.planFor();
  E3.api.planDay();
  E3.api.nextSchoolDay(E3.api.today());
  is('⭐ ΜΙΑ ΑΝΑΓΝΩΣΗ ΔΕΝ ΓΡΑΦΕΙ ΠΟΤΕ (το bug του nut:streak)', E3.writes.length, before);
  E3.api.setLessons(E3.api.today(), ['istoria']);
  is('και η εγγραφή αγγίζει ΜΟΝΟ το hw:v1', E3.writes.slice(before), [KEY]);
  const rec = JSON.parse(E3.store[KEY]).lessons[E3.api.today()];
  ok('⭐⭐ Η ΕΓΓΡΑΦΗ ΤΗΣ ΜΕΡΑΣ ΚΟΥΒΑΛΑΕΙ `_ts` — χωρίς αυτό η διόρθωση γίνεται πρόσθεση',
    typeof rec._ts === 'number' && rec._ts > 0);
  is('και κρατάει τον πίνακα των μαθημάτων', rec.subjects, ['istoria']);

  /* ⚠️ ΣΤΑΘΕΡΗ ΑΡΧΗ 17: ΜΙΑ ΑΠΟΤΥΧΗΜΕΝΗ ΕΓΓΡΑΦΗ ΔΕΝ ΕΠΙΤΡΕΠΕΤΑΙ ΝΑ ΜΟΙΑΖΕΙ ΜΕ
     ΠΕΤΥΧΗΜΕΝΗ, ΚΑΙ Η ΜΝΗΜΗ ΔΕΝ ΕΠΙΤΡΕΠΕΤΑΙ ΝΑ ΑΠΟΚΛΙΝΕΙ ΑΠΟ ΤΟΝ ΔΙΣΚΟ. Χωρίς
     επαναφορά, η οθόνη θα έδειχνε τη νέα επιλογή, το φύλλο θα έκλεινε, και το
     επόμενο επιτυχημένο save θα την έγραφε ΣΑΝ ΝΑ ΤΗΝ ΕΙΧΕ ΔΙΑΛΕΞΕΙ — δηλαδή
     ένα σιωπηλό ψέμα με καθυστέρηση. */
  const t9 = E3.api.today(), realSet = E3.ctx.window.localStorage.setItem;
  E3.ctx.window.localStorage.setItem = function (k) {
    if (k === KEY) { const e = new Error('QuotaExceededError'); e.name = 'QuotaExceededError'; throw e; }
    return realSet.apply(this, arguments);
  };
  is('μια αλλαγή που δεν γράφτηκε αναφέρει αποτυχία', E3.api.setLessons(t9, ['arxaia', 'latinika']), false);
  E3.ctx.window.localStorage.setItem = realSet;
  is('ο δίσκος κρατάει την ΠΑΛΙΑ επιλογή', JSON.parse(E3.store[KEY]).lessons[t9].subjects, ['istoria']);
  is('ΚΑΙ Η ΜΝΗΜΗ ΤΟ ΙΔΙΟ — καμία απόκλιση οθόνης/δίσκου', E3.api.myLessons(t9), ['istoria']);

  /* Και η ΠΡΩΤΗ επιλογή μιας μέρας, που δεν είχε τι να επαναφέρει: το κλειδί
     δεν επιτρέπεται να μείνει πίσω σαν φάντασμα. */
  const E8 = makeEnv({}), t8 = E8.api.today(), rs8 = E8.ctx.window.localStorage.setItem;
  E8.ctx.window.localStorage.setItem = function (k) {
    if (k === KEY) { const e = new Error('QuotaExceededError'); e.name = 'QuotaExceededError'; throw e; }
    return rs8.apply(this, arguments);
  };
  is('η πρώτη επιλογή που απέτυχε αναφέρει κι αυτή αποτυχία', E8.api.setLessons(t8, ['istoria']), false);
  E8.ctx.window.localStorage.setItem = rs8;
  is('και ΔΕΝ αφήνει φάντασμα στη μνήμη', E8.api.myLessons(t8), null);
}

section('4h · φάση 3 · τρία το πολύ, καμία διπλοεγγραφή, καμία άγνωστη τιμή');
{
  const E3 = makeEnv({}), t = E3.api.today();
  E3.api.setLessons(t, ['istoria', 'arxaia', 'latinika', 'ekthesi']);
  /* ⚠️ ΚΑΙ ΤΑ ΔΥΟ ΑΚΡΑ, ΧΩΡΙΣΤΑ. Μετρημένο: με έλεγχο μόνο μέσω `myLessons` η
     μετάλλαξη «βγάλε το όριο του γραφέα» περνούσε ΚΑΘΑΡΗ, γιατί το όριο του
     αναγνώστη την έκρυβε. Ο δίσκος δεν επιτρέπεται να κρατάει κάτι που η οθόνη
     δεν μπορεί να παραγάγει — αλλιώς μια επόμενη έκδοση που «απλοποιεί» τον
     αναγνώστη το ξαναβγάζει στην επιφάνεια. */
  is('ο ΓΡΑΦΕΑΣ κρατάει τρία στον δίσκο', JSON.parse(E3.store[KEY]).lessons[t].subjects.length, 3);
  is('και ο ΑΝΑΓΝΩΣΤΗΣ τρία στην οθόνη', E3.api.myLessons(t).length, 3);
  E3.api.setLessons(t, ['istoria', 'istoria', 'arxaia']);
  is('και ένα διπλό μετράει μία φορά', E3.api.myLessons(t), ['istoria', 'arxaia']);
  E3.api.setLessons(t, ['istoria', 'xxx', 'arxaia']);
  is('ο ΓΡΑΦΕΑΣ δεν αποθηκεύει τιμή που δεν είναι μάθημα',
    JSON.parse(E3.store[KEY]).lessons[t].subjects, ['istoria', 'arxaia']);
  /* ⚠️ ΚΑΙ Ο ΑΝΑΓΝΩΣΤΗΣ ΧΩΡΙΣΤΑ, ΓΙΑΤΙ ΕΙΝΑΙ ΑΛΛΟ ΑΚΡΟ ΤΟΥ ΙΔΙΟΥ ΠΡΩΤΟΚΟΛΛΟΥ
     (σταθερή αρχή 23). Η πρώτη γραφή αυτού περνούσε από τον `setLessons`, άρα
     έλεγχε ΔΥΟ ΦΟΡΕΣ τον γραφέα και ΠΟΤΕ τον αναγνώστη — μετρημένο: η
     μετάλλαξη «βγάλε το φίλτρο του myLessons» περνούσε ΚΑΘΑΡΗ. Η αληθινή πηγή
     μιας άγνωστης τιμής είναι μια ΑΛΛΗ έκδοση ή μια άλλη συσκευή, που γράφει
     κατευθείαν στην αποθήκη — άρα έτσι σπέρνεται. */
  const E5 = makeEnv({ store: { [KEY]: JSON.stringify({ v: 1, tasks: {}, samples: {},
    lessons: { [t]: { subjects: ['istoria', 'xxx', 'arxaia', 'istoria', 'ekthesi'], _ts: 1 } } }) } });
  is('και ο ΑΝΑΓΝΩΣΤΗΣ την πετάει κι αυτός, όσο κι αν την έγραψε άλλος',
    E5.api.myLessons(t), ['istoria', 'arxaia', 'ekthesi']);
  is('και κόβει στα τρία ό,τι κι αν βρει', E5.api.myLessons(t).length, 3);
  /* Σκουπίδια από άλλη έκδοση/συσκευή ΔΕΝ σκάνε και ΔΕΝ ζωγραφίζονται. */
  const E4 = makeEnv({ store: { [KEY]: JSON.stringify({ v: 1, tasks: {}, samples: {}, lessons: { [t]: { subjects: 'όχι πίνακας' } } }) } });
  is('ένα σχήμα που δεν αναγνωρίζεται διαβάζεται ως «δεν είπε τίποτα»', E4.api.myLessons(t), null);
  ok('και το βράδυ δεν σκάει — διαβάζει το πρόγραμμα, όχι τη χαλασμένη εγγραφή',
    !!E4.api.planFor().day);
  ok('⚠️ και ΔΕΝ σβήστηκε — η αποθήκη του δεν είναι ποτέ σε εύρος',
    JSON.parse(E4.store[KEY]).lessons[t].subjects === 'όχι πίνακας');
}

section('4h · φάση 3 · η καλωδίωση που κάνει τη σφραγίδα να ισχύει');
{
  /* ⚠️ ΣΤΑΘΕΡΗ ΑΡΧΗ 35: ένα πεδίο που λείπει από blank() Ή από load() σβήνεται
     σιωπηλά στην επόμενη φόρτωση — και με sync σβήνεται η δουλειά ΑΛΛΗΣ συσκευής. */
  ok('το lessons υπάρχει στο blank()', /function blank\(\)\{ return \{ v:1, tasks:\{\}, samples:\{\}, lessons:\{\}, timetable:\{\}, exams:\{\} \}; \}/.test(PAGE));
  /* ⚠️ ΣΤΑΘΕΡΗ ΑΡΧΗ 35, για το ΝΕΟ πεδίο: ΚΑΙ στο blank() ΚΑΙ στον load(). */
  ok('και το timetable κανονικοποιείται στον load()',
    /b\.timetable = \(s\.timetable && typeof s\.timetable === 'object' && !Array\.isArray\(s\.timetable\)\) \? s\.timetable : \{\};/.test(PAGE));
  /* ⭐⭐ ΚΑΙ ΤΟ `load()` ΕΛΕΓΧΕΤΑΙ ΜΕ ΣΥΜΠΕΡΙΦΟΡΑ, ΟΧΙ ΜΕ REGEX. Μετρημένο σε
     αυτή τη συνεδρία: η μετάλλαξη «βγάλε το lessons από τον load()» (ένα
     `if(0)` μπροστά) περνούσε ΚΑΘΑΡΗ από τον στατικό φρουρό, γιατί το μοτίβο
     εξακολουθούσε να υπάρχει στο αρχείο. Η σταθερή αρχή 35 ζητάει ακριβώς
     αυτό: σπείρε πεδίο, κάνε load+save, ζήτα το πίσω από τον ΔΙΣΚΟ. */
  const DKX = '2026-08-10';
  const E6 = makeEnv({ store: { [KEY]: JSON.stringify({
    v: 1, tasks: {}, samples: {},
    lessons: { [DKX]: { subjects: ['latinika'], _ts: 12345 } },
    /* Ένα πεδίο που ΔΕΝ ξέρει ο load(): αν επιβιώνει, η μορφή «αντίγραψε πρώτα
       ΟΛΑ τα κλειδιά» είναι πραγματικά εκεί και όχι λίστα επιτρεπομένων. */
    apoAlliEkdosi: { hello: 1 }
  }) } });
  ok('η επιλογή του επιβιώνει ενός load + save', E6.api.save() === true);
  const disk = JSON.parse(E6.store[KEY]);
  is('ΚΑΙ ΕΙΝΑΙ ΑΚΡΙΒΩΣ ΟΤΙ ΗΤΑΝ', ((disk.lessons || {})[DKX] || {}).subjects, ['latinika']);
  is('χωρίς να της αλλάξει η σφραγίδα — μια σπορά ΔΕΝ είναι σφράγισμα', disk.lessons[DKX]._ts, 12345);
  ok('και ένα ΑΓΝΩΣΤΟ πεδίο άλλης έκδοσης δεν σβήνεται σιωπηλά (σταθ. 35)',
    disk.apoAlliEkdosi && disk.apoAlliEkdosi.hello === 1);
  /* ⚠️ ΚΑΙ ΤΩΡΑ ΤΟ ΚΟΜΜΑΤΙ ΠΟΥ Η ΠΡΟΗΓΟΥΜΕΝΗ ΒΕΒΑΙΩΣΗ ΔΕΝ ΜΠΟΡΟΥΣΕ ΝΑ ΔΕΙ.
     Μετρημένο: η μετάλλαξη «βγάλε τη γραμμή του lessons από τον load()»
     περνούσε ΚΑΘΑΡΗ ακόμη και με τη συμπεριφορική βεβαίωση, γιατί το
     `for (k in s) b[k] = s[k]` ΗΔΗ αντιγράφει το πεδίο — άρα εκείνη η γραμμή
     δεν κάνει επιβίωση, κάνει ΚΑΝΟΝΙΚΟΠΟΙΗΣΗ ΤΥΠΟΥ. Άρα ελέγχεται με ΛΑΘΟΣ
     ΤΥΠΟ, που είναι το μόνο πράγμα που κάνει. */
  const E7 = makeEnv({ store: { [KEY]: JSON.stringify({ v: 1, tasks: {}, samples: {}, lessons: ['όχι χάρτης'] }) } });
  const st7 = E7.api.state();
  ok('ένα lessons λάθος τύπου κανονικοποιείται σε χάρτη, δεν πέφτει στη σελίδα',
    st7.lessons && typeof st7.lessons === 'object' && !Array.isArray(st7.lessons));
  is('και η μέρα διαβάζεται ως «δεν είπε τίποτα»', E7.api.myLessons(E7.api.today()), null);
  ok('ενώ ο γραφέας εξακολουθεί να μπορεί να γράψει από πάνω του',
    E7.api.setLessons(E7.api.today(), ['istoria']) === true);
  /* ⭐ Και το πιο σημαντικό: μπαίνει στο readMaps του study-stamp.js, αλλιώς
     καμία εγγραφή δεν παίρνει ποτέ `_ts` και το merge τις ΕΝΩΝΕΙ. */
  ok('το state.lessons είναι στο readMaps του STAMP',
    /return state \? \[state\.tasks, state\.samples, state\.lessons, state\.timetable, state\.exams\] : \[\];/.test(PAGE));
  ok('και η ταφόπλακά του είναι στο ΦΩΛΙΑΣΜΕΝΟ μονοπάτι, όπως των εργασιών',
    /tombPath\(KEY, \['lessons'\], dk, ts\)/.test(PAGE));
  /* ⛔ ΑΠΑΝΤΑΕΙ «ΤΙ ΕΙΧΑ», ΠΟΤΕ «ΤΙ ΘΑ ΕΧΩ», και ο κανόνας ισχύει ΠΙΟ ΔΥΝΑΤΑ
     μετά την als-v492: η πρόβλεψη βγαίνει τώρα από το ΠΡΟΓΡΑΜΜΑ — δηλωμένη,
     συγχρονισμένη, ίδια σε κάθε συσκευή — ενώ πριν βγαίνει από το ημερολόγιο,
     που είναι ΤΟΠΙΚΟ και έλειπε από τη μισή ζωή της σελίδας. Μια χειροκίνητη
     καταγραφή του ΠΑΡΕΛΘΟΝΤΟΣ εξακολουθεί να μην προβλέπει τίποτα. */
  const cand = (CODE.match(/function candidates\(free\)\{[\s\S]*?\n  \}/) || [''])[0];
  ok('η κατάταξη κόπηκε από τη σελίδα', cand.length > 400);
  ok('η χειροκίνητη επιλογή ΔΕΝ τροφοδοτεί την πρόβλεψη του αύριο',
    cand.indexOf('myLessons') < 0);
  ok('⭐ και η πρόβλεψη διαβάζει το ΠΡΟΓΡΑΜΜΑ, ποτέ πια το τοπικό ημερολόγιο',
    /var planDk = planDay\(\);/.test(cand) && cand.indexOf('lessonsFor(1)') < 0);
}

section('4h · φάση 3 · το φύλλο είναι χειριστήριο που χειρίζεται');
{
  /* σταθερή αρχή 4: native <dialog>, και το display ΜΟΝΟ στο [open]. Το φύλλο
     δανείζεται το ΥΠΑΡΧΟΝ `dialog.hw-dlg`, άρα ο κανόνας δεν ξαναγράφεται. */
  ok('είναι native <dialog> με την υπάρχουσα κλάση', /<dialog class="hw-dlg" id="hwLessons">/.test(PAGE));
  ok('και ανοίγει με showModal', /function openSheet\(id\)\{[\s\S]{0,200}showModal\(\)/.test(CODE));
  ok("και ανοίγει ΜΕΣΩ του openSheet, όχι με δικό του showModal", /openSheet\('hwLessons'\)/.test(CODE));
  /* ⭐⭐ ΤΟ ΜΠΛΕ ΔΑΧΤΥΛΙΔΙ, ΚΑΙ ΤΟ ΕΙΔΕ ΜΟΝΟ ΤΟ PNG. Το `showModal()` εστιάζει
     το ΠΡΩΤΟ εστιάσιμο παιδί, οπότε το φύλλο άνοιγε με το «Ιστορία» φωτισμένο
     σε χρώμα συστήματος — και έμοιαζε ΕΠΙΛΕΓΜΕΝΟ ενώ δεν ήταν, σε ένα φύλλο
     που όλη του η δουλειά είναι «τι έχεις επιλέξει». Ίδιο εύρημα με als-v443
     και als-v454. Καμία βεβαίωση δεν βλέπει χρώμα δαχτυλιδιού· αυτή βλέπει τον
     μηχανισμό που το αποτρέπει. */
  ok('η εστίαση πάει στο ΣΩΜΑ του φύλλου, όχι στο πρώτο κουμπί',
    /var body = d\.querySelector\('\.hw-sheet'\);[\s\S]{0,90}body\.focus\(\)/.test(CODE));
  /* ⚠️ ΤΕΣΣΕΡΑ ΑΠΟ ΤΗΝ als-v537 — μπήκε το φύλλο του ΒΑΘΜΟΥ. Ο αριθμός είναι
     επίτηδες καρφωτός: ένα ΝΕΟ φύλλο που θα ξεχνούσε το `tabindex="-1"` θα
     άνοιγε φορώντας το μπλε δαχτυλίδι του Chrome, και κανένα άλλο assertion
     δεν βλέπει χρώμα. Ανεβάζεις τον αριθμό ΜΟΝΟ αφού δώσεις στο νέο φύλλο τον
     ίδιο δρόμο (σταθ. 15). */
  ok('και το σώμα δέχεται εστίαση χωρίς να ζωγραφίζει δαχτυλίδι',
    (PAGE.match(/<div class="hw-sheet" tabindex="-1">/g) || []).length === 4 &&
    /\.hw-sheet\{[^}]*outline:none/.test(PAGE));
  /* ⭐ ΣΤΑΘΕΡΗ ΑΡΧΗ 15: ΚΑΙ ΤΑ ΔΥΟ ΦΥΛΛΑ, ή είναι σύμπτωση με καλή φήμη. Το
     παράθυρο γραψίματος φορούσε το ίδιο δαχτυλίδι από την als-v470 και θα
     έμενε το μόνο που το φοράει. */
  is('ΚΑΝΕΝΑ φύλλο δεν ανοίγει παρακάμπτοντας τον κοινό δρόμο',
    (CODE.match(/showModal\(\)/g) || []).length, 1);
  is('και ΟΛΑ περνούν από αυτόν', (CODE.match(/openSheet\('/g) || []).length, 6);
  ok('το display μένει δηλωμένο ΜΟΝΟ στο [open]', PAGE.indexOf('dialog.hw-dlg[open]{ display:flex') > -1);
  ok('και δεν γεννήθηκε δεύτερος κανόνας που να το νικάει', (PAGE.match(/dialog\.hw-dlg\{/g) || []).length === 1);
  /* Κάθε κλάση που εναλλάσσεται από JS υπάρχει στο CSS (σταθερή αρχή 12). */
  ['hw-pick', 'hw-pick-b', 'hw-ord', 'hw-hint'].forEach(c =>
    ok('η κλάση ' + c + ' ορίζεται στο CSS', PAGE.indexOf('.' + c + '{') > -1 || PAGE.indexOf('.' + c + ' ') > -1));
  /* ⭐ Το τέταρτο πάτημα δεν είναι σιωπηλό no-op: το κουμπί απενεργοποιείται
     ΚΑΙ ο λόγος γράφεται. */
  ok('στα τρία, τα υπόλοιπα απενεργοποιούνται', /!on && full \? ' disabled' : ''/.test(CODE));
  ok('και το γιατί λέγεται με λέξεις', PAGE.indexOf('Τρία το πολύ') > -1);
  /* ⚠️ Ένα φύλλο που κλείνει πάνω σε αποτυχημένη εγγραφή λέει ψέματα. */
  ok('το «Έτοιμο» κλείνει ΜΟΝΟ σε επιβεβαιωμένη εγγραφή',
    /if \(!setLessons\(pickDay, pickBuf\)\) return;[\s\S]{0,80}closePicker\(\)/.test(CODE));
  ok('και η ακύρωση το ίδιο', /if \(!clearLessons\(pickDay\)\) return;[\s\S]{0,60}closePicker\(\)/.test(CODE));
  ok('«Άσε το ημερολόγιο» εμφανίζεται ΜΟΝΟ όταν υπάρχει ημερολόγιο να γυρίσεις',
    /hwPickCal'\)\.classList\.toggle\('hw-off', !\(has && live\)\)/.test(CODE));
  ok('τίποτα δεν γράφεται στον δίσκο πριν το «Έτοιμο» — το pickBuf είναι προσωρινό',
    /var pickBuf = null, pickDay = null;/.test(CODE));
  /* ⭐ §7.1: «ΠΡΟ-ΣΥΜΠΛΗΡΩΜΕΝΟ ΑΠΟ ΤΟ GCal ΟΤΑΝ ΥΠΑΡΧΕΙ». Χωρίς αυτό, σε
     συνδεδεμένη συσκευή το «δεν ήταν αυτά» θα κόστιζε τέσσερα πατήματα αντί
     για ένα, και «διορθώνω» δεν θα ήταν πια η ίδια κίνηση με «συμπληρώνω».
     ⚠️ Ελέγχεται ΣΤΑΤΙΚΑ επειδή ο `openLessons` ζει κάτω από το όριο που κόβει
     αυτό το suite· η συμπεριφορά επαληθεύτηκε ΚΑΙ σε render (h-cal-then-mine,
     1440px: τα τρία του ημερολογίου ήρθαν ήδη επιλεγμένα, 1·2·3, με τη σειρά
     της ώρας τους). Μια βεβαίωση που δεν δαγκώνει είναι διακόσμηση: η
     μετάλλαξη «σβήσε την προ-συμπλήρωση» ΠΡΕΠΕΙ να κοκκινίσει εδώ. */
  ok('το φύλλο προ-συμπληρώνεται από το ημερολόγιο όταν δεν έχει πει τίποτα',
    /var cal = lessonsFor\(0\) \|\| \[\];[\s\S]{0,400}pickBuf\.push\(l\.subject\)/.test(CODE));
  ok('και η προ-συμπλήρωση σέβεται το ίδιο όριο και την ίδια μοναδικότητα',
    /pickBuf\.indexOf\(l\.subject\) < 0 && pickBuf\.length < MAX_LESSONS/.test(CODE));
  ok('ενώ μια ΥΠΑΡΧΟΥΣΑ επιλογή του δεν ξαναγράφεται ποτέ από το ημερολόγιο',
    /if \(mine\)\{\s*\n\s*pickBuf = mine\.slice\(\);/.test(CODE));
}

/* ══════════════════════════════════════════════════════════════════════
   5 · ΑΔΕΙΟ ≠ ΣΦΑΛΜΑ ≠ ΑΓΝΩΣΤΟ (σταθερή αρχή 10)
   ══════════════════════════════════════════════════════════════════════ */
section('5 · three states of the calendar produce three different sentences');
{
  /* ⭐⭐ als-v484 · ΟΙ ΤΕΣΣΕΡΙΣ ΠΡΟΤΑΣΕΙΣ ΤΟΥ ΡΟΛΟΓΙΟΥ ΕΦΥΓΑΝ ΜΕ ΤΟ ΡΟΛΟΙ, ΚΑΙ
     ΑΥΤΟ ΕΙΝΑΙ ΔΗΛΩΜΕΝΟ ΑΝΤΑΛΛΑΓΜΑ, ΟΧΙ ΠΑΡΑΒΛΕΨΗ.
     Υπήρχαν επειδή η κορυφή της σελίδας ΔΗΛΩΝΕ έναν αριθμό βγαλμένο από το
     ημερολόγιο («μένουν 2ω 18λ»), και ένας τέτοιος αριθμός ΠΡΕΠΕΙ να λέει από
     πού βγήκε. Κανένας αριθμός δεν δηλώνεται πια, άρα δεν υπάρχει ισχυρισμός
     να συνοδευτεί. Το `budget()` τρέχει ακόμη — τροφοδοτεί το «χωράει» της
     κατάταξης — αλλά δεν ζωγραφίζει τίποτα.
     ⛔ ΤΟ ΜΙΣΟ ΠΟΥ ΕΙΝΑΙ ΦΟΡΤΙΟ ΕΠΙΒΙΩΝΕΙ ΑΚΕΡΑΙΟ, ΚΑΙ ΕΛΕΓΧΕΤΑΙ ΕΔΩ: το «δεν
     ξέρω» δεν επιτρέπεται ΠΟΤΕ να γραφτεί σαν «δεν έχεις» (σταθ. 10). */
  ok('το `budget()` ΔΕΝ σβήστηκε — τρέφει την κατάταξη', /var b = budget\(\);/.test(CODE));
  ok('και ο ελεύθερος χρόνος φτάνει στο «χωράει»', /candidates\(b\.free\)/.test(CODE));
  ok('κανένας αριθμός χρόνου δεν ΔΗΛΩΝΕΤΑΙ πια στην οθόνη',
    CODE.indexOf('hwClock') < 0 && CODE.indexOf('hw-sum-row') < 0);
  /* ⚠️ als-v492: ΟΙ ΠΡΟΤΑΣΕΙΣ ΤΟΥ ΗΜΕΡΟΛΟΓΙΟΥ ΕΦΥΓΑΝ ΜΑΖΙ ΜΕ ΤΗΝ ΟΘΟΝΗ ΤΟΥΣ,
     αλλά ΟΧΙ ο κανόνας. Η ίδια διάκριση ζει τώρα πάνω στο ΠΡΟΓΡΑΜΜΑ: «δεν ξέρω
     τις μέρες σου» (άγνοια, με δρόμο προς λύση) ≠ «τίποτα για αύριο»
     (μέτρηση). Δύο προτάσεις, δύο διαφορετικά πράγματα (σταθ. 10/33). */
  ok('«δεν ξέρω το πρόγραμμα» ΔΕΝ γράφεται σαν «δεν έχεις τίποτα»',
    CODE.indexOf('δεν ξέρω τις μέρες σου') > -1 &&
    CODE.indexOf('Δεν βλέπω επόμενη μέρα φροντιστηρίου') > -1 &&
    CODE.indexOf('Δεν χρωστάς καμία εργασία για ') > -1);
  ok('μια αδιάβαστη αποθήκη λέγεται ΑΓΝΩΣΤΗ, ποτέ μηδέν',
    PAGE.indexOf('σημαίνει «δεν ξέρω»') > -1 && CODE.indexOf("'άγνωστο'") > -1);
  ok('a task with no deadline says so rather than inventing one',
    PAGE.indexOf("'χωρίς ημερομηνία'") > -1);
}
/* ⭐ ΟΙ ΠΡΟΤΑΣΕΙΣ ΤΟΥ ΑΔΕΙΟΥ, ΚΛΕΙΔΩΜΕΝΕΣ. Η πρώτη έκδοση αυτής της σελίδας
   έγραφε «0 κομμάτια ζωντανά» και «όλα ζωντανά» για πέντε αποθήκες που δεν
   είχαν ανοίξει ΠΟΤΕ — ένα μηδέν που μοιάζει μέτρηση, και ένα ψέμα με
   καθησυχαστικό τόνο. Φάνηκε μόνο ρεντεράροντας τη σελίδα ΑΔΕΙΑ. */
section('5c · «δεν ξεκίνησε» is never written as a zero');
/* ⚠️ als-v484: οι δύο πρώτες ζούσαν στο «Τι ξεχνάω». Κόβοντας το μπλοκ, ο
   κανόνας ΔΕΝ κόπηκε — μετακόμισε στο δωμάτιο των μαθημάτων, που είναι πλέον
   ο ΜΟΝΟΣ αναγνώστης των σκαλών. Ελέγχεται στη νέα του θέση, όχι στην παλιά. */
[
  ['δεν το έχεις ξεκινήσει', 'μια αποθήκη που δεν άνοιξε ποτέ'],
  ['δεν έχεις ξεκινήσει', 'η κεφαλίδα για την ίδια περίπτωση'],
  ['Άδειο, όχι τελειωμένο.', 'and the recommendation refuses to say «Τελείωσες»'],
  ['Τελείωσες.', 'which it still says when there really is nothing left']
].forEach(pair => ok(pair[1], PAGE.indexOf(pair[0]) > -1));
ok('the four are four different sentences',
  new Set(['δεν το έχεις ξεκινήσει', 'δεν έχεις ξεκινήσει', 'Άδειο, όχι τελειωμένο.', 'Τελείωσες.']).size === 4);

section('5b · nothing in this page reads a photograph — or the network');
/* ⚠️ Η βελόνα είναι η ΚΛΗΣΗ, όχι η λέξη. Ένα σκέτο /vision/ πιάνει το σχόλιο
   που τεκμηριώνει την ίδια την απαγόρευση, και ένας φρουρός που φωνάζει
   «λύκος» είναι ένας φρουρός που κάποιος θα χαλαρώσει (σταθερή αρχή 19).
   Η αληθινή εγγύηση είναι απλούστερη και ισχυρότερη: το script της σελίδας δεν
   αγγίζει ΚΑΘΟΛΟΥ το δίκτυο. Ό,τι ζωγραφίζει υπολογίζεται στη συσκευή, οπότε
   δεν υπάρχει server να διαβάσει μια φωτογραφία ακόμη κι αν το ήθελε κάποιος. */
const SCRIPT = PAGE.slice(PAGE.lastIndexOf('<script>'), PAGE.lastIndexOf('</script>'));
ok('the page script never calls fetch()', !/\bfetch\s*\(/.test(SCRIPT));
ok('nor XMLHttpRequest', !/XMLHttpRequest/.test(SCRIPT));
ok('nor sendBeacon', !/sendBeacon/.test(SCRIPT));
ok('and it adds no server code at all — no api/ endpoint is referenced', PAGE.indexOf('/api/') < 0);
ok('the photograph is stored and shown, never interpreted',
  PAGE.indexOf('Ποτέ δεν διαβάζεται από μηχανή.') > -1);

/* ══════════════════════════════════════════════════════════════════════
   6 · ΦΑΣΗ 1 — ΤΑ ΜΑΘΗΜΑΤΑ ΓΙΝΟΝΤΑΙ ΔΩΜΑΤΙΟ

   Οι τέσσερις σελίδες μελέτης ήταν ΑΔΕΡΦΙΑ στο Home, ποτέ δωμάτια. Αυτό το
   δωμάτιο είναι η πρώτη φορά που η εφαρμογή λέει «αυτά είναι τα μαθήματά μου».
   ⛔ Είναι ΠΡΟΣΘΕΤΙΚΟ: τίποτα υπάρχον δεν άλλαξε συμπεριφορά.
   ══════════════════════════════════════════════════════════════════════ */
section('6 · ΤΑ ΜΑΘΗΜΑΤΑ — δωμάτιο, όχι πέμπτο μπλοκ');
{
  /* Η σελίδα παραμένει ΤΕΣΣΕΡΑ μπλοκ. Το δωμάτιο, όπως και το «Απόψε»,
     δεν φοράει ποτέ `hw-sec` — αλλιώς μεγαλώνει η αρχική οθόνη. */
  is('τα μπλοκ μένουν ΕΝΑ `hw-sec`', (PAGE.match(/class="hw-sec /g) || []).length, 1);
  ok('το δωμάτιο ΔΕΝ φοράει hw-sec',
    PAGE.indexOf('class="hw-lessons4"') > -1 && PAGE.indexOf('hw-sec hw-lessons4') < 0);

  /* ⭐⭐ als-v486 — ΤΟ ΔΩΜΑΤΙΟ ΠΕΘΑΝΕ ΚΑΙ ΤΟ ΠΕΡΙΕΧΟΜΕΝΟ ΤΟΥ ΒΓΗΚΕ ΜΠΡΟΣΤΑ.
     ⛔ Η ΠΟΡΤΑ ΔΕΝ ΕΠΙΤΡΕΠΕΤΑΙ ΝΑ ΞΑΝΑΔΗΛΩΘΕΙ: αν ξαναμπεί στο `DOORS` ενώ οι
     κάρτες είναι μπροστά, ο σύνδεσμος οδηγεί σε αντίγραφο του τι μόλις είδες
     — ακριβώς η αμαρτία που έδιωξε το «Τι ξεχνάω» στην als-v484. */
  ok('το `mathimata` ΔΕΝ είναι πια πόρτα — δεν υπάρχει δωμάτιο να ανοίξει',
    !/mathimata:/.test(PAGE) && !/hw-door-mathimata/.test(PAGE.replace(/\/\*[\s\S]*?\*\//g, '')));
  ['hw-lessons4', 'hw-doors', 'hw-doorlink', 'hw-l4grid', 'hw-l4', 'hw-l4g', 'hw-plate']
    .forEach(c => ok('η κλάση ' + c + ' ορίζεται στο CSS',
      new RegExp('\\.' + c + '[\\s,{:]').test(PAGE)));

  /* Ορατό στην ΑΡΧΙΚΗ οθόνη, κρυφό πίσω από ΚΑΘΕ πόρτα. */
  ok('τα μαθήματα είναι ορατά εξ ορισμού', /\.hw-lessons4\{ display:block/.test(PAGE));
  ok('και κρύβονται πίσω από κάθε πόρτα',
    /body\.hw-door [^{]*\.hw-lessons4/.test(PAGE));

  /* ⛔⛔ ΤΟ ΒΡΗΚΕ ΤΟ RENDER: η πόρτα ζωγραφιζόταν ΜΕΣΑ στο δωμάτιο — ένας
     σύνδεσμος προς εκεί που ήδη βρίσκεσαι. Σωστό markup, λάθος θέση. */
  ok('η πόρτα κρύβεται πίσω από ΚΑΘΕ πόρτα',
    /body\.hw-door \.hw-doors/.test(PAGE));

  /* ⚠️⚠️ ΜΕΤΡΗΜΕΝΟ: το `.hw-l4grid` δηλώνεται ΜΕΤΑ το media query των 999px,
     οπότε με ίδια ειδικότητα κέρδιζε ο βασικός κανόνας και οι κάρτες έμεναν
     ΔΥΟ ΣΤΗΛΕΣ στο κινητό (`mq999=true` αλλά `cols=170.5px 170.5px`).
     Το query ΠΡΕΠΕΙ να έρχεται μετά. */
  const baseAt = PAGE.indexOf('.hw-l4grid{ display:grid');
  const mqAt = PAGE.indexOf('.hw-l4grid{ grid-template-columns:1fr; }');
  ok('ο βασικός κανόνας του πλέγματος υπάρχει', baseAt > -1);
  ok('η κατάρρευση σε ΜΙΑ στήλη υπάρχει', mqAt > -1);
  ok('και έρχεται ΜΕΤΑ τον βασικό, αλλιώς δεν ισχύει ποτέ', mqAt > baseAt);

  /* ΤΡΕΙΣ ΚΑΤΑΣΤΑΣΕΙΣ, ΤΡΕΙΣ ΠΡΟΤΑΣΕΙΣ (σταθ. 33). «Δεν ξεκίνησες» δεν είναι
     «δεν χρωστάς», και καμία από τις δύο δεν είναι «δεν διάβασα». */
  ['δεν έχεις ξεκινήσει', 'όλα στην ώρα τους', 'κάτι δεν διαβάστηκε',
   'δεν υπάρχει σελίδα ακόμη'].forEach(s =>
    ok('λέει «' + s + '»', PAGE.indexOf(s) > -1));
  ok('«δεν ξεκίνησες» και «όλα στην ώρα τους» είναι ΞΕΧΩΡΙΣΤΕΣ προτάσεις',
    /!anyStarted \? 'δεν έχεις ξεκινήσει'/.test(PAGE));

  /* ⚠️ «ΞΕΚΙΝΗΜΕΝΑ», ΟΧΙ «ΤΑ ΞΕΡΕΙΣ»: το `learned` του ladders.js είναι
     `samples > 0` — το άγγιξες, δεν το κατέχεις. Η αισιόδοξη λέξη δίπλα σε
     «1 έληξε» είναι αντίφαση στην ίδια κάρτα. */
  ok('η ετικέτα λέει «Ξεκινημένα»', PAGE.indexOf('<span>Ξεκινημένα</span>') > -1);
  ok('και ΠΟΤΕ «Τα ξέρεις»', PAGE.indexOf('<span>Τα ξέρεις</span>') < 0);

  /* Η ομαδοποίηση ΔΙΑΒΑΖΕΤΑΙ, δεν επινοείται εδώ (σταθ. 15): το `ton:v1`
     είναι δηλωμένο `subject:'arxaia'` μέσα στο ladders.js. */
  const LADSRC = fs.readFileSync(path.join(ALS, 'ladders.js'), 'utf8');
  /* ⭐ als-v485: ο τονισμός ανήκει στο ΑΓΝΩΣΤΟ — εκεί τον έβαλε ο ίδιος και
     εκεί τον εξετάζει ο ίδιος καθηγητής. Και τα δύο Αρχαία δηλώνουν το ΙΔΙΟ
     `exam`, ώστε ο συντελεστής να μη διπλομετρηθεί (110% των μορίων του). */
  ok('ο τονισμός ανήκει στο ΑΓΝΩΣΤΟ, και το λέει ο ΚΟΙΝΟΣ αναγνώστης',
    /key: 'ton:v1'[\s\S]{0,200}subject: 'arxaia_agn'/.test(LADSRC));
  /* ⚠️⚠️ ΑΥΤΟΣ Ο ΕΛΕΓΧΟΣ ΜΕΤΡΟΥΣΕ ΛΑΘΟΣ ΠΡΑΓΜΑ (als-v495). Έλεγε
     «(weight: 30) === 3», που ίσχυε ΚΑΤΑ ΣΥΜΠΤΩΣΗ όσο μόνο τα τρία Αρχαία
     κουβαλούσαν 30άρι. Μόλις η Έκθεση απέκτησε σκάλα — δικό της γραπτό, δικό
     της 30% — ο έλεγχος έσκασε χωρίς να έχει σπάσει τίποτα. Ένας έλεγχος που
     σκάει σε σωστή αλλαγή είναι χειρότερος από κανέναν: διδάσκει να τον
     αγνοείς. Τώρα λέει ΑΥΤΟ ΠΟΥ ΕΝΝΟΟΥΣΕ — ότι κάθε συντελεστής 30
     ανήκει σε ΕΝΑ γραπτό, και τα δύο Αρχαία δηλώνουν το ΙΔΙΟ. */
  {
    const LAD = require(path.join(ALS, 'ladders.js'));
    const thirty = LAD.STORES.filter(s => s.weight === 30);
    const exams = {};
    thirty.forEach(s => { exams[s.exam || s.subject] = (exams[s.exam || s.subject] || 0) + 1; });
    is('τα δύο Αρχαία μοιράζονται ΕΝΑ γραπτό, άρα έναν συντελεστή',
      exams, { arxaia: 3, ekthesi: 1 });
    ok('και κανένα 30άρι δεν κρέμεται χωρίς γραπτό',
      thirty.every(s => !!(s.exam || s.subject)));
  }
  ok('το δωμάτιο δεν ξαναγράφει τη δική του ομαδοποίηση',
    PAGE.indexOf("byS[s.subject]") > -1);

  /* ⛔ ΔΙΑΒΑΖΕΙ, ΔΕΝ ΓΡΑΦΕΙ. */
  /* ⚠️ ΤΟ ΟΡΓΑΝΟ ΗΤΑΝ ΛΑΘΟΣ ΠΡΩΤΑ (σταθ. 30): η φέτα τελείωνε στον
     `renderTonight`, οπότε μόλις μπήκαν ΑΝΑΜΕΣΑ ο `renderProgramma` και ο
     `openWhen` (που ΣΩΣΤΑ γράφει), ο έλεγχος «ο ζωγράφος δεν γράφει»
     κοκκίνισε για κώδικα που δεν είναι ζωγράφος. Η φέτα κόβει στον ΑΜΕΣΩΣ
     επόμενο ορισμό, ποτέ σε έναν μακρινό. */
  const L4 = PAGE.slice(PAGE.indexOf('function renderLessons4'),
                        PAGE.indexOf('function renderProgramma'));
  ok('ο renderer δεν γράφει ΠΟΤΕ σε αποθήκη', !/setItem|removeItem/.test(L4));
  ok('ούτε καλεί save()', !/\bsave\s*\(/.test(L4));
  /* ⛔ ΚΑΙ Ο ΝΕΟΣ ΖΩΓΡΑΦΟΣ ΤΟΥ ΠΡΟΓΡΑΜΜΑΤΟΣ ΔΕΝ ΓΡΑΦΕΙ. Ο σπόρος είναι ΕΓΓΡΑΦΗ
     και ζει στο boot· ένας renderer που σπέρνει είναι το bug του `nut:streak`
     (als-v436) — «δεν το διάβασα ακόμη» γίνεται «δεν υπάρχει» ΜΕ σφραγίδα. */
  {
    /* ⚠️⚠️ ΣΤΑΘ. 44, ΠΛΗΡΩΜΕΝΗ ΣΤΗΝ als-v537: η φέτα τελείωνε στο
       `var whenId = null;` και ανάμεσά τους μπήκαν ΟΙ ΔΙΑΓΩΝΙΣΜΑΤΑ — που
       περιέχουν `save()` νόμιμα, στον γραφέα τους. Η φέτα ρούφηξε ξένο κώδικα
       και κατηγόρησε τον renderProgramma για γραφή που δεν κάνει. **Το όριο
       μιας φέτας είναι το ΕΠΟΜΕΝΟ ΟΝΟΜΑ, όχι το επόμενο που θυμόμουν** — και
       ψάχνεται ΜΕΤΑ την αρχή της, αλλιώς ένα δεύτερο `examList` πιο πάνω θα
       γύριζε αρνητικό μήκος. */
    const prAt = CODE.indexOf('function renderProgramma(');
    const prEnd = CODE.indexOf('function examList(){', prAt);
    if (prAt < 0 || prEnd < 0) throw new Error('homework.html: η φέτα του renderProgramma δεν βρέθηκε');
    const PR = CODE.slice(prAt, prEnd);
    ok('ο ζωγράφος του προγράμματος ΔΕΝ γράφει', !/\bsave\s*\(|setItem/.test(PR));
    /* ⛔ ΚΑΙ Ο ΖΩΓΡΑΦΟΣ ΤΩΝ ΔΙΑΓΩΝΙΣΜΑΤΩΝ, ΜΕ ΤΟΝ ΙΔΙΟ ΚΑΝΟΝΑ (σταθ. 15): ο
       σπόρος του `examSeedOnce` είναι ΕΓΓΡΑΦΗ και ζει στο boot. Ένας renderer
       που σπέρνει είναι το bug του `nut:streak`. */
    const dgAt = CODE.indexOf('function renderDiag(){');
    const dgEnd = CODE.indexOf('var dgEditId = null', dgAt);
    if (dgAt < 0 || dgEnd < 0) throw new Error('homework.html: η φέτα του renderDiag δεν βρέθηκε');
    ok('ούτε ο ζωγράφος των διαγωνισμάτων γράφει',
      !/\bsave\s*\(|setItem/.test(CODE.slice(dgAt, dgEnd)));
    ok('και ο σπόρος τρέχει στο BOOT, όχι σε render',
      /reload\(\);[\s\S]{0,400}ttSeedIfEmpty\(\);[\s\S]{0,60}paint\(\);/.test(CODE));
  }
  /* ⛔⛔ als-v486: ΤΟ `hwDoorsS` ΔΕΝ ΥΠΑΡΧΕΙ ΠΙΑ, ΚΑΙ ΑΥΤΟ ΕΙΝΑΙ ΕΠΙΚΙΝΔΥΝΟ
     ΑΚΡΙΒΩΣ ΕΠΕΙΔΗ ΕΙΝΑΙ ΣΙΩΠΗΛΟ: μια γραφή σε `$('hwDoorsS').textContent`
     πάνω σε null πετάει TypeError μέσα στο `paint()` και ΣΤΑΜΑΤΑΕΙ τη ζωγραφιά
     πριν το πρόγραμμα — η σελίδα βγαίνει μισή, χωρίς κανένα ορατό σφάλμα. */
  ok('ΚΑΝΕΝΑΣ δεν γράφει στο νεκρό hwDoorsS', !/hwDoorsS'\)\s*\./.test(CODE));
  ok('η περίληψη βγαίνει από ΕΝΑ σημείο, με τις τρεις καταστάσεις',
    /function l4Summary\(totalLate, anyBlind, anyStarted\)/.test(CODE) &&
    /anyBlind \? 'κάτι δεν διαβάστηκε'/.test(CODE) &&
    /!anyStarted \? 'δεν έχεις ξεκινήσει'/.test(CODE));

  /* ⭐⭐ ΟΙ ΟΜΑΔΕΣ ΚΑΛΥΠΤΟΥΝ ΚΑΘΕ ΜΑΘΗΜΑ — ΑΛΛΙΩΣ ΕΝΑ ΜΑΘΗΜΑ ΕΞΑΦΑΝΙΖΕΤΑΙ
     ΑΠΟ ΤΗΝ ΟΘΟΝΗ ΧΩΡΙΣ ΣΦΑΛΜΑ. Δύο λίστες που πρέπει να συμφωνούν είναι ο
     τρόπος που γεννιέται το σιωπηλό-άδειο αυτού του project. */
  {
    const ord = (CODE.match(/var SUBJ_ORDER = \[([^\]]+)\]/) || [])[1] || '';
    const subs = ord.split(',').map(s => s.trim().replace(/'/g, '')).filter(Boolean);
    const grp = (CODE.match(/var L4_GROUPS = \[([\s\S]*?)\n  \];/) || [])[1] || '';
    const inGroups = (grp.match(/'[a-z_]+'/g) || []).map(s => s.replace(/'/g, ''));
    is('κάθε μάθημα του SUBJ_ORDER ανήκει σε ομάδα',
      subs.filter(s => inGroups.indexOf(s) < 0).join(',') || '(κανένα)', '(κανένα)');
    ok('και καμία ομάδα δεν ονομάζει μάθημα που δεν υπάρχει',
      inGroups.every(s => subs.indexOf(s) > -1));
    /* ⚠️⚠️ ΑΥΤΟ ΗΤΑΝ REGEX ΚΑΙ ΔΕΝ ΔΑΓΚΩΝΕ: ένα `if (0)` μπροστά στην κλήση
       άφηνε το κείμενο στη θέση του και ο έλεγχος περνούσε ΕΝΩ ΤΟ ΔΙΧΤΥ ΗΤΑΝ
       ΝΕΚΡΟ (η ίδια παγίδα με το σχολιασμένο `renderLessons4()` της
       als-v484). Ελέγχεται ΣΥΜΠΕΡΙΦΟΡΙΚΑ τώρα, πάνω στην πραγματική έξοδο. */
    {
      const E2 = makeEnv({ now: TUE });
      const covered = {};
      E2.api.l4Groups().forEach(g => g.subs.forEach(x => { covered[x] = 1; }));
      is('⛔ ΚΑΘΕ μάθημα του SUBJ_ORDER βγαίνει ΣΤΗΝ ΟΘΟΝΗ, όχι μόνο στη δήλωση',
        E2.api.SUBJ_ORDER.filter(x => !covered[x]).join(',') || '(κανένα)', '(κανένα)');
    }
  }

  /* ⚠️ ΤΟ 30% ΓΡΑΦΕΤΑΙ ΜΙΑ ΦΟΡΑ ΑΝΑ ΓΡΑΠΤΟ. Δύο κάρτες Αρχαίων με «30% των
     μορίων» η καθεμία διαβάζονται 60 — ο κανόνας βγαίνει από το `exam`, όχι
     από το πλήθος των καρτών, γιατί Ιστορία+Λατινικά είναι ΔΥΟ ξεχωριστά 20%. */
  ok('το κοινό βάρος βγαίνει από το `exam`, όχι από το πλήθος',
    /function l4SharedExam\(subs\)/.test(CODE) &&
    /subs\.every\(function\(s\)\{ return \(SUBJ\[s\] \|\| \{\}\)\.exam === e; \}\)/.test(CODE));
  ok('και όταν είναι κοινό, η κάρτα φοράει το ΤΙ ΤΗ ΞΕΧΩΡΙΖΕΙ',
    /shared \? esc\(l4Kicker\(sub\)\)/.test(CODE));
}

section('6b · το όνομα είναι «School Studies» παντού που το βλέπει');
{
  const idx = fs.readFileSync(path.join(ALS, 'index.html'), 'utf8');
  const lau = fs.readFileSync(path.join(ALS, 'launcher.js'), 'utf8');
  const mot = fs.readFileSync(path.join(ALS, 'home-motion.js'), 'utf8');
  ok('ο τίτλος της καρτέλας', PAGE.indexOf('<title>School Studies · MÉTRON</title>') > -1);
  ok('το εικονίδιο της αρχικής οθόνης του iPhone',
    PAGE.indexOf('content="School Studies"') > -1);
  ok('ο τίτλος μέσα στη σελίδα', PAGE.indexOf('>School Studies</h1>') > -1);
  ok('το πλακίδιο στο Home', idx.indexOf('<div class="name">School Studies</div>') > -1);
  ok('η γραμμή στο ALL', lau.indexOf("name: 'School Studies'") > -1);
  ok('και η αναζήτηση', mot.indexOf("['School Studies', 'homework.html', 'Study']") > -1);
  /* ⚠️ Ο ΦΑΚΕΛΟΣ ΚΑΙ ΤΑ ΚΛΕΙΔΙΑ ΕΙΝΑΙ ΠΑΓΩΜΕΝΑ — τα διαβάζει ΜΗΧΑΝΗ. */
  ok('το αρχείο μένει homework.html', lau.indexOf("href: 'homework.html'") > -1);
  ok('και το κλειδί μένει hw:v1', PAGE.indexOf("'hw:v1'") > -1);
  /* Ελληνικός δρόμος αναζήτησης: δεν ψάχνει «School» στα ελληνικά. */
  ok('βρίσκεται ΚΑΙ στα ελληνικά', mot.indexOf("['Εργασίες', 'homework.html', 'Study']") > -1);
}

/* ══════════════════════════════════════════════════════════════════════
   7 · ΦΑΣΗ 2+3 — ΤΡΙΑ ΔΩΜΑΤΙΑ, ΜΙΑ ΠΛΟΗΓΗΣΗ
   ══════════════════════════════════════════════════════════════════════ */
section('7 · ΟΙ ΕΡΓΑΣΙΕΣ γίνονται δωμάτιο');
{
  ok('το `ergasies` είναι ΔΗΛΩΜΕΝΗ πόρτα', /DOORS = \{[\s\S]{0,140}ergasies:/.test(PAGE));
  ok('το δωμάτιο υπάρχει', PAGE.indexOf('class="hw-tasks"') > -1);
  ok('και ΔΕΝ είναι πέμπτο μπλοκ', PAGE.indexOf('hw-sec hw-tasks') < 0);
  is('τα μπλοκ μένουν ΕΝΑ', (PAGE.match(/class="hw-sec /g) || []).length, 1);
  ok('κρυφό εξ ορισμού', /\.hw-tasks\{ display:none/.test(PAGE));
  ok('ορατό μόνο στην πόρτα του', /body\.hw-door-ergasies \.hw-tasks\{ display:block/.test(PAGE));

  /* ⭐⭐ Η ΛΙΣΤΑ ΔΕΙΧΝΕΙ ΟΛΕΣ. Αυτό είναι το σημείο που θα «έχανε» εργασία. */
  ok('το paint δίνει null, άρα καμία εργασία δεν κρύβεται', /renderTasks\(null\)/.test(PAGE));

  /* Η σύλληψη ΜΕΝΕΙ ορατή εδώ: το δωμάτιο των εργασιών είναι ακριβώς το μέρος
     που θυμάσαι μια ακόμη. Κρύβεται μόνο στα ΜΑΘΗΜΑΤΑ. */
  ok('η σύλληψη δεν κρύβεται στις εργασίες',
    PAGE.indexOf('body.hw-door-ergasies .hw-grab{ display:none') < 0);

  /* ⭐⭐ als-v484: Η ΜΝΗΜΗ ΔΕΝ ΕΧΕΙ ΠΙΑ ΔΙΚΟ ΤΗΣ ΜΠΛΟΚ, ΚΑΙ ΔΕΝ ΧΑΘΗΚΕ.
     Το «Τι ξεχνάω» έλεγε ΑΚΡΙΒΩΣ ό,τι λέει το δωμάτιο «Τα μαθήματά μου» — ίδιες
     σκάλες, ίδιες ληξιπρόθεσμες, ίδιοι σύνδεσμοι. Δύο θέσεις για μία αλήθεια
     είναι δύο ευκαιρίες να διαφωνήσουν (σταθ. 15). Έμεινε η μία. */
  /* ⚠️ ΣΤΑΘΕΡΗ ΑΡΧΗ 19, ΤΕΤΑΡΤΗ ΦΟΡΑ ΣΕ ΑΥΤΟ ΤΟ ΑΡΧΕΙΟ: η πρώτη γραφή έψαχνε
     τη σκέτη φράση «Τι ξεχνάω» και έπιανε το ΣΧΟΛΙΟ HTML που τεκμηριώνει την
     αφαίρεση. Η βελόνα είναι το MARKUP της ενότητας, όχι η λέξη. */
  ok('το μπλοκ «Τι ξεχνάω» δεν υπάρχει στην αρχική οθόνη',
    PAGE.indexOf('hw-sec hw-debt') < 0 &&
    PAGE.indexOf('<span class="hw-n">Τι ξεχνάω</span>') < 0);
  ok('και οι εργασίες δεν είναι πια υπο-λίστα του', PAGE.indexOf('hw-sub2') < 0);
  /* ⛔ ΤΟ ΞΑΚΡΙΣΜΑ ΣΒΗΝΕΙ ΟΘΟΝΗ, ΠΟΤΕ ΑΠΟΘΗΚΗ. Ο αναγνώστης των πέντε σκαλών
     μένει ακέραιος και τον διαβάζει το δωμάτιο. */
  /* ⚠️ ΚΑΙ ΑΥΤΟΣ ΔΕΝ ΔΑΓΚΩΝΕ ΜΕ ΤΗΝ ΠΡΩΤΗ ΓΡΑΦΗ: το `CODE` σβήνει μόνο σχόλια
     μπλοκ, οπότε ένα `// renderLessons4();` άφηνε το κείμενο στη θέση του και ο
     έλεγχος περνούσε ενώ η κλήση ήταν ΝΕΚΡΗ. Ελέγχεται πλέον το ΣΩΜΑ του
     `paint()` και η κλήση στην αρχή γραμμής — ένα `//` μπροστά τη χαλάει. */
  const PAINT = CODE.slice(CODE.indexOf('function paint(){'),
                           CODE.indexOf('function paint(){') + 1200);
  ok('το ladders.js διαβάζεται ακόμη σε κάθε paint', /\n\s{4}ladders\(\);/.test(PAINT));
  ok('και η μνήμη ζωγραφίζεται ΟΛΟΚΛΗΡΗ πίσω από την πόρτα των μαθημάτων',
    /\n\s{4}renderLessons4\(\);/.test(PAINT) && PAGE.indexOf('id="hwL4Grid"') > -1);
  /* ⚠️ Το παράθυρο ήταν 700 και έσπασε στην als-v487 όταν μπήκε ένα σχόλιο
     στο markup. Ένα παράθυρο χαρακτήρων μετράει ΣΧΟΛΙΑ, όχι δομή — γι' αυτό
     μετράει πια ότι το `hwOver` είναι ΜΕΣΑ στο ίδιο `<section>`, που είναι το
     πράγμα που πραγματικά μας νοιάζει (η αιτία δίπλα στο αποτέλεσμα). */
  ok('η συσσώρευση ζωγραφίζεται κι αυτή, στη νέα της θέση',
    /\n\s{4}renderOver\(pool\);/.test(PAINT) &&
    /<section class="hw-tasks"[\s\S]*?id="hwOver"[\s\S]*?<\/section>/.test(PAGE));
}

section('7b · Η ΠΛΟΗΓΗΣΗ — ένα μέρος με δωμάτια');
{
  ok('η γραμμή υπάρχει', PAGE.indexOf('class="hw-nav"') > -1);
  /* ⭐ ΔΥΟ tabs, ΟΧΙ ΤΡΙΑ (als-v486): τα μαθήματα δεν είναι δωμάτιο πια, είναι
     η αρχική οθόνη — και μια πλοήγηση δεν δείχνει στον τόπο που ήδη πατάς. */
  ['#kentro', '#ergasies'].forEach(h =>
    ok('οδηγεί στο ' + h, PAGE.indexOf('href="' + h + '"') > -1));
  ok('και ΔΕΝ οδηγεί σε δωμάτιο που δεν υπάρχει', PAGE.indexOf('href="#mathimata"') < 0);
  ok('δείχνει ΠΟΥ είσαι', /aria-current/.test(PAGE));
  /* ⛔ Οι ΣΤΙΓΜΕΣ δεν είναι μέρη: το push των 18:00 και το 21:45 έχουν ΕΝΑ
     πράγμα να κάνουν, και η μπάρα τους κρατάει τη μία έξοδο. */
  ok('η πλοήγηση φεύγει στις στιγμές',
    /body\.hw-door-capture \.hw-nav, body\.hw-door-tonight \.hw-nav\{ display:none/.test(PAGE));

  /* ⚠️ ΜΕΤΡΗΜΕΝΟ: οι πόρτες ζουν σε στήλη ~300px. Δύο στήλες τις έκοβαν στη
     μέση («Τα μαθήματά μου 3 έ…»). Η διάταξη του δείγματος ήταν για ΠΛΗΡΕΣ
     πλάτος και δεν μεταφέρεται χωρίς αυτό. */
  ok('οι πόρτες είναι ΜΙΑ στήλη', /\.hw-doors\{ display:grid; grid-template-columns:1fr;/.test(PAGE));
  /* ⭐ ΤΕΣΣΕΡΙΣ ΑΠΟ ΤΗΝ als-v537, ΚΑΙ Ο ΟΡΙΣΜΟΣ ΔΕΝ ΑΛΛΑΞΕ: ό,τι μένει εδώ
     είναι ΕΡΓΑΛΕΙΟ (εργασίες · απόψε · πρόγραμμα · διαγωνίσματα). Τα ΜΑΘΗΜΑΤΑ
     πήραν κάρτα, γιατί μια πόρτα που οδηγεί σε αντίγραφο της οθόνης που ήδη
     βλέπεις είναι ύψος — και τα διαγωνίσματα περνούν τον κανόνα επειδή είναι
     ΔΡΟΜΟΣ ΠΡΟΣ ΠΡΑΞΗ, όχι κατάλογος να τον κοιτάς. */
  is('και είναι ΤΕΣΣΕΡΙΣ — μόνο εργαλεία', (PAGE.match(/class="hw-doorlink"/g) || []).length, 4);
  ok('καμία τους δεν είναι μάθημα', PAGE.indexOf('<span class="dl-n">Τα μαθήματά μου</span>') < 0);
  ok('η τρίτη είναι το «Απόψε», που αλλιώς θα έμενε χωρίς είσοδο',
    /href="#tonight"[\s\S]{0,60}Απόψε/.test(PAGE));
  /* Κάθε πόρτα λέει τι χρωστάει, από τον ΙΔΙΟ υπολογισμό με την κεφαλίδα της. */
  ok('η πόρτα των εργασιών μετράει τις ανοιχτές', PAGE.indexOf("$('hwDoorsT').textContent") > -1);
  ok('και δεν λέει «0» για καμία', PAGE.indexOf("'καμία ακόμη'") > -1);
}


/* ══════════════════════════════════════════════════════════════════════
   12 · als-v487 · ΟΙ ΕΡΓΑΣΙΕΣ ΓΙΝΟΝΤΑΙ ΟΜΑΔΕΣ

   ⛔⛔ ΤΟ FIXTURE ΕΙΝΑΙ ΟΙ ΑΛΗΘΙΝΕΣ ΤΟΥ ΕΡΓΑΣΙΕΣ, τραβηγμένες από το MCP
   πριν σχεδιαστεί οτιδήποτε — και είναι ΟΛΟ το νόημα αυτής της ενότητας:
   **οι ΤΡΕΙΣ από τις έξι ανοιχτές κάθονται στο ΠΑΛΙΟ σκέτο `arxaia`**, που
   ΔΕΝ υπάρχει στο `SUBJ_ORDER`. Μια ομαδοποίηση οδηγημένη από εκείνη τη
   λίστα θα τις εξαφάνιζε ΣΙΩΠΗΛΑ. Ένα επινοημένο fixture με καθαρά
   `arxaia_gn`/`arxaia_agn` θα περνούσε και δεν θα απεδείκνυε τίποτα.
   ══════════════════════════════════════════════════════════════════════ */
section('12 · οι εργασίες γίνονται ομάδες (als-v487)');
{
  const T = (id, subject, kind, title, done) => ({
    id, ts: 1, subject, kind, title, due: null, link: null,
    est: null, done: done || 0, src: null, note: '', elapsed: 0
  });
  const REAL = [
    T('t1', 'ekthesi',  'askisi', 'ΜΤΦΡΑΣΗ 1ης ενοτητας…', 1),
    T('t2', 'arxaia',   'apexo',  'Αρχαία άγνωστο Αρχικοί χρόνοι'),
    T('t3', 'arxaia',   'apexo',  'Αρχαία άγνωστο επανάληψη α β γ κλίση'),
    T('t4', 'arxaia',   'askisi', 'Αρχαία γνωστό παλιά άσκηση Α1'),
    T('t5', 'latinika', 'askisi', 'Λατινικά εισαγωγή διάβασμα'),
    T('t6', 'istoria',  'askisi', 'Ιστορία πηγή'),
    T('t7', 'istoria',  'apexo',  'Ιστορία διάβασμα απέξω αγροτικό ζήτημα')
  ];
  const G = makeEnv({ now: TUE });
  const open = REAL.filter(t => !t.done);
  const gs = G.api.taskGroups(open);

  /* ⭐ Η ΑΠΟΔΕΙΞΗ: ΚΑΜΙΑ εργασία δεν πέφτει στο πάτωμα. */
  is('καμία από τις 6 ανοιχτές δεν χάνεται',
    gs.reduce((n, g) => n + g.items.length, 0), open.length);
  is('και οι τρεις του ΠΑΛΙΟΥ `arxaia` κάθονται μαζί, κάτω από «Αρχαία»',
    gs.filter(g => g.id === 'arxaia').map(g => g.items.length), [3]);
  is('τρεις ομάδες, με τη σειρά των συντελεστών',
    gs.map(g => g.id), ['arxaia', 'istoria', 'latinika']);
  is('και το βάρος κάθε ομάδας βγαίνει από τα δεδομένα',
    gs.map(g => g.weight), [30, 20, 20]);

  /* ⚠️ Ό,τι δηλώνει το ΙΔΙΟ γραπτό μπαίνει στην ΙΔΙΑ ομάδα — αλλιώς το «30%»
     γράφεται δύο φορές και διαβάζεται 60 (η αριθμητική της als-v485, στο μάτι). */
  ['arxaia', 'arxaia_gn', 'arxaia_agn'].forEach(s =>
    is('το ' + s + ' δείχνει στο γραπτό «arxaia»',
      G.api.taskGroupId({ subject: s }), 'arxaia'));
  is('ενώ η Ιστορία μένει δική της', G.api.taskGroupId({ subject: 'istoria' }), 'istoria');

  /* ⛔ ΤΙΠΟΤΑ ΔΕΝ ΚΡΥΒΕΤΑΙ: ένα άγνωστο μάθημα παίρνει την τελευταία θέση,
     ΠΟΤΕ καμία. Αυτό είναι το δίχτυ κάτω από τη δηλωμένη σειρά. */
  is('ένα ΑΓΝΩΣΤΟ μάθημα παίρνει την τελευταία θέση, όχι καμία',
    G.api.taskGroupRank('κατι-ανυπαρκτο'), 99);
  {
    const withUnknown = open.concat([T('t8', 'unknown', 'askisi', 'κάτι που δεν κατάλαβα')]);
    const gu = G.api.taskGroups(withUnknown);
    is('και εμφανίζεται, τελευταίο', gu[gu.length - 1].items.length, 1);
    is('χωρίς να χάσει τις υπόλοιπες',
      gu.reduce((n, g) => n + g.items.length, 0), withUnknown.length);
  }

  /* Η ΣΕΙΡΑ ΔΕΝ ΕΠΙΝΟΕΙΤΑΙ ΕΔΩ — διαβάζεται από το `L4_GROUPS`, δηλαδή από
     την ίδια δήλωση που ταξινομεί τις κάρτες της αρχικής οθόνης. */
  ok('η σειρά διαβάζεται από το L4_GROUPS, δεν ξαναγράφεται',
    /for \(var i = 0; i < L4_GROUPS\.length; i\+\+\)/.test(CODE));

  /* ⭐ ΣΕ ΗΡΕΜΙΑ Η ΓΡΑΜΜΗ ΔΕΙΧΝΕΙ ΜΗΔΕΝ ΚΟΥΜΠΙΑ — αυτό ήταν το παράπονο. */
  ok('οι πράξεις κρύβονται σε ηρεμία', /\.hw-tacts\{[^}]*opacity:0/.test(PAGE));
  ok('και έρχονται στο hover ΧΩΡΙΣ να κουνήσουν τη διάταξη',
    /\.hw-task:hover \.hw-tacts[^{]*\{ opacity:1/.test(PAGE) &&
    /\.hw-tacts\{ position:absolute/.test(PAGE));
  /* ⛔⛔ ΚΑΙ ΣΤΟ ΚΙΝΗΤΟ ΞΑΝΑΕΜΦΑΝΙΖΟΝΤΑΙ. Χωρίς αυτό, η μοναδική διαδρομή
     προς το ✕ κρύβεται πίσω από χειρονομία που η συσκευή ΔΕΝ έχει. */
  ok('στο κινητό οι πράξεις είναι ΠΑΝΤΑ ορατές',
    /@media \(max-width:999px\)\{[\s\S]*?\.hw-tacts\{ position:static[^}]*opacity:1/.test(PAGE));

  /* Ο κύκλος ΑΝΤΙΚΑΘΙΣΤΑ το κουμπί, δεν προσθέτει δεύτερο δρόμο (σταθ. 15). */
  ok('ο κύκλος κουβαλάει το ΙΔΙΟ data-done', /class="hw-ck"[^>]*data-done=/.test(CODE));
  /* ⛔⛔ ΚΑΙ Η ΚΑΡΤΑ ΜΙΑ ΑΠΟΦΑΣΗ ΦΟΡΑΕΙ ΤΟ ΙΔΙΟ `.hw-tacts` ΧΩΡΙΣ ΝΑ ΕΙΝΑΙ
     `.hw-task` — σταθερή αρχή 26. Ένας γυμνός κανόνας που κρύβει το
     `.hw-tacts` αφήνει τα κουμπιά της κάρτας ΜΟΝΙΜΑ ΑΟΡΑΤΑ, δηλαδή η πιο
     επείγουσα εργασία γίνεται η μόνη που δεν σβήνεται. */
  ok('η απόκρυψη είναι ΣΤΕΝΗ — μόνο μέσα στη γραμμή',
    /\.hw-task \.hw-tacts\{[^}]*opacity:0/.test(PAGE) &&
    !/^\s*\.hw-tacts\{[^}]*opacity:0/m.test(PAGE));
  ok('και η κάρτα κρατάει τις δικές της πράξεις ορατές',
    /\.hw-tacts\{ display:flex; gap:6px; margin-top:9px/.test(PAGE));

  /* Τα τελειωμένα φεύγουν από τη ροή — «τι χρωστάω» και «τι έκανα» είναι δύο
     ερωτήσεις, και ως τώρα απαντιόνταν από την ίδια στήλη. */
  ok('τα τελειωμένα ζουν σε δίπλωμα', /<details class="hw-fold">/.test(CODE));
  ok('και το σκούπισμα ζει ΜΕΣΑ του', /data-sweep="1"[\s\S]{0,80}<\/details>/.test(CODE));
  ok('δεμένο στο δοχείο, όχι σε κουμπί που ξαναγεννιέται',
    /\$\('hwTasks'\)\.addEventListener\('click'/.test(CODE));
  /* ⚠️ Ένα δεν είναι πληθυντικός — το είδε ΜΟΝΟ το render. */
  ok('και το ΕΝΑ δεν γράφεται πληθυντικός',
    /doneL\.length === 1 \? 'Έγινε' : 'Έγιναν'/.test(CODE) &&
    /dn === 1 \? ' έγινε' : ' έγιναν'/.test(CODE));

  /* Το όνομα του δωματίου δεν λέγεται δύο φορές (η μπάρα το γράφει ήδη). */
  is('το όνομα «Οι εργασίες μου» δεν επαναλαμβάνεται μέσα στο δωμάτιο',
    (PAGE.match(/<span class="hw-n">Οι εργασίες μου<\/span>/g) || []).length, 0);

  /* ⭐ ΤΡΕΙΣ ΚΑΤΑΣΤΑΣΕΙΣ ΗΜΕΡΟΜΗΝΙΑΣ, ΤΡΙΑ ΒΑΡΗ (σταθ. 10). */
  ok('η δική του ημερομηνία ξεχωρίζει από την παραγόμενη',
    /if \(!dd\.auto\) dcls \+= ' is-own'/.test(CODE) &&
    /dd\.auto \? ' <i>· η επόμενη<\/i>' : ''/.test(CODE));
  ok('και το ληξιπρόθεσμο χρώμα ΔΕΝ μπαίνει σε τελειωμένη',
    /if \(!t\.done && dd\.key < today\(\)\)/.test(CODE));
  /* ⛔ Και μια τελειωμένη δεν τυπώνει ΚΑΘΟΛΟΥ προθεσμία: η ημερομηνία εκεί
     είναι παραγόμενη από το πρόγραμμα, δηλαδή απαντάει σε ερώτηση που δεν
     έγινε. Δεν είναι άγνωστη μέτρηση, είναι μέγεθος που δεν υπάρχει. */
  ok('μια τελειωμένη εργασία δεν τυπώνει προθεσμία',
    /if \(t\.done\)\{\s*dtxt = '';/.test(CODE));
}

/* ⛔⛔ ΕΔΩ ΚΑΘΟΤΑΝ ΕΝΑ `process.exit()`, ΣΤΗ ΜΕΣΗ ΤΟΥ ΑΡΧΕΙΟΥ, ΚΑΙ ΚΑΘΕ
   ΒΕΒΑΙΩΣΗ ΑΠΟ ΚΑΤΩ ΗΤΑΝ ΚΕΙΜΕΝΟ. Ολόκληρη η ενότητα 8 (ΤΟ ΠΡΟΓΡΑΜΜΑ,
   als-v485) δεν έτρεξε ΠΟΤΕ — 92 βεβαιώσεις που το suite μετρούσε ως
   ανύπαρκτες ενώ τύπωνε «passed». Βρέθηκε στην als-v490 προσθέτοντας από
   κάτω και βλέποντας ότι δεν εμφανίζονταν.
   ⭐ Σταθερή αρχή 40 σε νέα μορφή: **ένας φρουρός μετά από `process.exit`
   ΕΙΝΑΙ κείμενο.** Ο απολογισμός ζει ΜΟΝΟ στο τέλος, και υπάρχει βεβαίωση
   που μετράει ότι ο τερματισμός είναι ΕΝΑΣ. */

/* ══════════════════════════════════════════════════════════════════════
   8 · ⭐⭐ ΤΟ ΠΡΟΓΡΑΜΜΑ — als-v485

   Δικά του: *«βάλε και το πρόγραμμα του φροντιστηρίου μου μέσα εκεί, καθώς
   και να βάζω για ποια μέρα έχω το homework»*. Τα δύο είναι ΕΝΑ: εκείνος δεν
   σκέφτεται «για τις 18 Αυγούστου», σκέφτεται «για την επόμενη φορά που έχω
   Ιστορία». Άρα το πρόγραμμα είναι η ΜΗΧΑΝΗ της ημερομηνίας.
   ══════════════════════════════════════════════════════════════════════ */
section('8 · το πρόγραμμα είναι ΑΠΟΘΗΚΗ, όχι σταθερά');
{
  ok('ζει μέσα στο hw:v1 — καμία νέα αποθήκη, κανένα νέο appKey',
    /timetable:\{\}/.test(PAGE) && !/localStorage\.setItem\('hw:tt/.test(CODE));
  /* ⛔⛔ Ο ΣΠΟΡΟΣ ΔΕΝ ΣΦΡΑΓΙΖΕΤΑΙ ΜΕ `now`. Με `now`, μια καθαρή εγκατάσταση
     θα έγραφε ΝΕΟΤΕΡΗ σφραγίδα από μια αληθινή διόρθωση στο κινητό και το LWW
     θα την έσβηνε: ΑΚΡΙΒΩΣ το bug του `nut:streak` (als-v436) σε νέο σχήμα. */
  ok('ο σπόρος σφραγίζεται με ΣΤΑΘΕΡΗ στιγμή, ποτέ με now()',
    /var SEED_TS = Date\.UTC\(2026, 7, 14\);/.test(CODE) &&
    /_ts: SEED_TS/.test(CODE) &&
    !/_ts: *Date\.now\(\)[\s\S]{0,200}TT_SEED/.test(CODE));
  ok('και σπέρνει ΜΟΝΟ σε εντελώς άδειο (εμπρός-φρουρός `any`)',
    /if \(any\) return;/.test(CODE));
  ok('⚠️ σταθ. 31 — το timetable σφραγίζεται από τον STAMP',
    /state\.lessons, state\.timetable, state\.exams\] : \[\]/.test(CODE));
  ok('⚠️ σταθ. 35 — και ζει ΚΑΙ στο blank() ΚΑΙ στον load()',
    /timetable:\{\}, exams:\{\} \}; \}/.test(PAGE) && /b\.timetable = /.test(PAGE));
}

section('8b · «για την επόμενη φορά» — και ΠΟΤΕ σήμερα');
{
  /* ⛔ Η εργασία γεννιέται ΜΕΣΑ στο μάθημα των 15:15–18:00, άρα «η επόμενη
     φορά» είναι εξ ορισμού ΜΕΤΑ τη σημερινή: ένα «για σήμερα» θα ήταν
     προθεσμία που έχει ήδη περάσει τη στιγμή που γράφεται. */
  ok('ο βρόχος ξεκινάει από ΑΥΡΙΟ', /for \(var i = 1; i <= 14; i\+\+\)/.test(CODE));
  /* ⛔ ΚΑΙ ΠΟΤΕ ΓΙΑ ΤΟ ΚΛΗΡΟΝΟΜΙΚΟ «arxaia»: δύο καθηγητές, δύο μέρες — μια
     αυθαίρετη επιλογή ανάμεσά τους είναι ΕΥΛΟΓΗ ΛΑΘΟΣ ΤΙΜΗ, το ακριβότερο
     είδος σφάλματος αυτού του repo (als-v433). */
  ok('το κληρονομικό «Αρχαία» ΔΕΝ παίρνει ποτέ αυτόματη μέρα',
    /if \(!sub \|\| !SUBJ\[sub\] \|\| SUBJ\[sub\]\.legacy\) return null;/.test(CODE));
  /* ⭐⭐ Η ΠΡΟΘΕΣΜΙΑ ΠΑΡΑΓΕΤΑΙ, ΔΕΝ ΓΡΑΦΕΤΑΙ — αλλιώς οι εργασίες που ήρθαν
     από τη συζήτηση δεν θα έπαιρναν ΠΟΤΕ ημερομηνία, και τον Σεπτέμβρη που
     αλλάζει το πρόγραμμα θα έμεναν όλες κολλημένες στις παλιές μέρες. */
  ok('το dueOf() ΔΙΑΒΑΖΕΙ, δεν γράφει',
    /function dueOf\(t\)\{[\s\S]{0,400}return \{ key:n, auto:!!n \};/.test(CODE.replace(/\s+/g,' ').replace('function dueOf(t){','function dueOf(t){')) ||
    /function dueOf\(t\)\{/.test(CODE.replace(/\s+/g,'')) );
  {
    const DO = CODE.slice(CODE.indexOf('function dueOf('), CODE.indexOf('function dueOf(') + 400);
    ok('και δεν αγγίζει ΠΟΤΕ την αποθήκη', !/save\s*\(|setItem|t\.due *=/.test(DO));
    ok('ό,τι διάλεξε ΡΗΤΑ νικάει το πρόγραμμα', /if \(t\.due\) return \{ key:t\.due, auto:false \};/.test(DO));
  }
  /* Μια ΠΑΡΑΓΟΜΕΝΗ ημερομηνία το λέει: «Τρίτη» και «Τρίτη, την υπολόγισα εγώ»
     είναι δύο διαφορετικά πράγματα (σταθ. 10 σε μορφή ημερομηνίας). */
  /* ⭐ Η ΙΔΙΟΤΗΤΑ, ΟΧΙ Η ΔΙΑΤΥΠΩΣΗ. Το κείμενο άλλαξε στην als-v487 σε
     «<i>· η επόμενη</i>» και αυτή η γραμμή έψαχνε ακόμη το παλιό string.
     Κανείς δεν το είδε επειδή ζούσε κάτω από τον τερματισμό. */
  ok('η παραγόμενη ημερομηνία δηλώνεται στην οθόνη',
    /dd\.auto \?[^:]*η επόμενη/.test(PAGE));
}

section('8c · ΤΟ ΓΕΝΙΚΟ ΔΕΝ ΝΙΚΑΕΙ ΤΟ ΕΙΔΙΚΟ — το δεύτερο πέρασμα');
{
  const S = E.api.subjectOfText, P2 = E.api.parseLine;
  /* ⛔⛔ Η σειρά στον ΠΙΝΑΚΑ των aliases ΔΕΝ αποφασίζει: ο βρόχος είναι πάνω
     στα TOKENS, οπότε το πρώτο token («αρχαια») επέστρεφε ΑΜΕΣΩΣ το γενικό και
     η λέξη «γνωστό» δεν διαβαζόταν ποτέ. Το έπιασε βεβαίωση πριν τον δει
     άνθρωπος — ίδια οικογένεια με τη σταθ. 38. */
  is('«Αρχαία γνωστό» → ΓΝΩΣΤΟ, όχι γενικό', S('Αρχαία γνωστό σημειώσεις'), 'arxaia_gn');
  is('«Αρχαία άγνωστο» → ΑΓΝΩΣΤΟ', S('Αρχαία άγνωστο Αρχικοί χρόνοι'), 'arxaia_agn');
  is('και η ΠΛΗΚΤΡΟΛΟΓΗΜΕΝΗ γραμμή το ίδιο (σταθ. 15)',
    P2('Αρχαία γνωστό άσκηση Α1').subject, 'arxaia_gn');
  is('και η πληκτρολογημένη του ΑΓΝΩΣΤΟΥ', P2('Αρχαία άγνωστο κλίση').subject, 'arxaia_agn');
  /* Το ημερολόγιό του γράφει «Αρχαία ΑΓΝ → Λατινικά → Έκθεση». */
  is('η συντομογραφία του ημερολογίου του διαβάζεται', S('ΔΕΥΤΕΡΑ · Αρχαία ΑΓΝ'), 'arxaia_agn');
  is('και η άλλη', S('ΤΡΙΤΗ · Ιστορία → Αρχαία ΓΝ'), 'istoria');
  /* ⚠️ ΤΑ ALIASES ΔΥΟ ΧΑΡΑΚΤΗΡΩΝ ΤΑΙΡΙΑΖΟΥΝ ΑΚΡΙΒΩΣ, ΠΟΤΕ ΩΣ ΠΡΟΘΕΜΑ — το
     λάθος που πλήρωσε η als-v479 («ισ» → «Ισπανικά», «ιστ» → «φροντιστήριο»). */
  is('«γνωρίζω» ΔΕΝ είναι μάθημα', S('Αρχαία γνωρίζω τα πάντα'), 'arxaia');
  ok('και ο έλεγχος των δύο χαρακτήρων είναι ΑΚΡΙΒΗΣ, όχι πρόθεμα',
    /f === 'αγν' \|\| f\.indexOf\('αγνωστ'\) === 0/.test(CODE) &&
    /f === 'γν'  \|\| f\.indexOf\('γνωστ'\)  === 0/.test(CODE));
}

section('8d · ΕΝΑ ΓΡΑΠΤΟ, ΕΝΑΣ ΣΥΝΤΕΛΕΣΤΗΣ');
{
  /* Το 30% είναι γεγονός για το ΓΡΑΠΤΟ των Πανελληνίων, που είναι ΕΝΑ. Ένα
     15/15 θα ήταν επινοημένος αριθμός (σταθ. 33). */
  ok('και τα δύο Αρχαία δηλώνουν το ΙΔΙΟ γραπτό',
    /arxaia_gn:  \{[^}]*exam:'arxaia'/.test(PAGE) &&
    /arxaia_agn: \{[^}]*exam:'arxaia'/.test(PAGE));
  ok('με το ΙΔΙΟ 30, χωρίς να μοιραστεί στα δύο',
    (PAGE.match(/weight:30/g) || []).length >= 3);
  /* ⛔ Το παλιό σκέτο «arxaia» ΔΕΝ σβήνεται ΠΟΤΕ: κάθε εργασία που έγραψε πριν
     το κουβαλάει, και ένα κλειδί χωρίς εγγραφή θα την έκανε ΓΚΡΙ «χωρίς
     μάθημα» — θα «έχανε» δουλειά του για δική μας αναδιοργάνωση. */
  ok('το κληρονομικό «arxaia» ζει, βάφεται και μετράει',
    /arxaia:   \{ label:'Αρχαία'[^}]*legacy:true \}/.test(PAGE));
  ok('αλλά ΔΕΝ προσφέρεται σε νέα επιλογή',
    /SUBJ_ORDER = \['istoria','arxaia_gn','arxaia_agn','latinika','ekthesi'\]/.test(PAGE));
}

section('8e · Η ΠΟΡΤΑ ΚΑΙ ΟΙ ΤΡΕΙΣ ΚΑΤΑΣΤΑΣΕΙΣ ΤΗΣ ΜΕΡΑΣ');
{
  ok('τέταρτη πόρτα, δηλωμένη στον ΚΛΕΙΣΤΟ πίνακα', /programma:'Το πρόγραμμα'/.test(CODE));
  ok('με κλάση που ΥΠΑΡΧΕΙ στο CSS (σταθ. 12)',
    /body\.hw-door-programma \.hw-programma\{ display:block; \}/.test(PAGE));
  ok('⛔ και ΔΕΝ είναι μπλοκ — τα hw-sec μένουν ΕΝΑ',
    (PAGE.match(/class="hw-sec /g) || []).length === 1 &&
    PAGE.indexOf('hw-sec hw-programma') < 0);
  /* ⭐ ΤΡΕΙΣ ΚΑΤΑΣΤΑΣΕΙΣ, ΤΡΕΙΣ ΠΡΟΤΑΣΕΙΣ: «δεν ξέρω αυτή τη μέρα» δεν είναι
     «χωρίς φροντιστήριο» (σταθ. 10/33). Ένα κενό κελί δεν λέει ποιο από τα δύο. */
  ['δεν ξέρω αυτή τη μέρα', 'χωρίς φροντιστήριο'].forEach(t =>
    ok('η σελίδα λέει «' + t + '»', PAGE.indexOf(t) > -1));
  ok('και ο αναγνώστης γυρίζει null για ΑΓΝΩΣΤΗ μέρα, [] για ΑΔΕΙΑ',
    /if \(!sl\) return null;/.test(CODE));
}

section('8f · ΠΟΤΕ ΘΑ ΤΟ ΚΑΝΩ — μέρες, όχι μετατοπίσεις');
{
  ok('υπάρχει τρόπος να αλλάξει η μέρα ΥΠΑΡΧΟΥΣΑΣ εργασίας', /function openWhen\(id\)\{/.test(CODE.replace(/\s+/g,' ').replace('function openWhen(id){','function openWhen(id){')) || /function openWhen\(/.test(CODE));
  /* ⭐ ΚΑΙ ΣΤΙΣ ΔΥΟ ΘΕΣΕΙΣ (σταθ. 15): η κάρτα ΜΙΑ ΑΠΟΦΑΣΗ δείχνει την πιο
     επείγουσα και η λίστα ΔΕΝ τη δείχνει — αν το κουμπί ζούσε μόνο στη λίστα,
     η μία εργασία που ΘΕΛΕΙ ημερομηνία θα ήταν η μόνη χωρίς τρόπο να την πάρει. */
  is('το κουμπί υπάρχει ΚΑΙ στην κάρτα ΚΑΙ στη λίστα',
    (PAGE.match(/data-when="/g) || []).length, 2);
  ok('και δένεται μία φορά, στον κοινό δρόμο', (CODE.match(/\[data-when\]/g) || []).length === 1);
  /* ⛔ «Άσε το πρόγραμμα να αποφασίσει» ΣΒΗΝΕΙ την τιμή. Μια παραγόμενη τιμή
     που γράφτηκε στην αποθήκη παύει να είναι παραγόμενη και ΠΑΓΩΝΕΙ την
     επόμενη φορά που θα αλλάξει το πρόγραμμα. */
  ok('η επιστροφή στο αυτόματο ΣΒΗΝΕΙ, δεν γράφει τιμή',
    /var v = b\.getAttribute\('data-day'\) \|\| null/.test(CODE));
  ok('και μια αποτυχία αποθήκευσης ΕΠΑΝΑΦΕΡΕΙ (σταθ. 17)',
    /if \(!save\(\)\)\{ t2\.due = old; return; \}/.test(CODE));
  /* Η μετακίνηση ΥΛΟΠΟΙΕΙ την παραγόμενη ημερομηνία πριν την κουνήσει. */
  ok('το «φέρ’ το μια μέρα πριν» ξεκινάει από την ΙΣΧΥΟΥΣΑ ημερομηνία',
    /var from = dueOf\(t\)\.key;/.test(CODE));
}


/* ══════════════════════════════════════════════════════════════════════
   9 · als-v490 — Η ΑΠΟΓΡΑΦΗ, Η ΥΛΗ, ΤΟ ΦΩΣ

   ⭐⭐ ΟΙ ΦΡΟΥΡΟΙ ΕΙΝΑΙ ΣΥΜΠΕΡΙΦΟΡΙΚΟΙ ΟΠΟΥ ΜΠΟΡΟΥΝ: κόβεται η ΑΛΗΘΙΝΗ
   συνάρτηση από τη σελίδα και τρέχει σε vm. Έναν φρουρό που ικανοποιείται
   από ΚΕΙΜΕΝΟ τον ικανοποιεί κάποια στιγμή κείμενο (σταθ. 40).
   ══════════════════════════════════════════════════════════════════════ */
section('9a · als-v490 · ΤΟ ΚΕΝΟ ΚΟΥΤΙ ΔΕΝ ΓΕΝΝΑΕΙ ΕΡΓΑΣΙΑ');
{
  /* ⚠️ als-v492: ο ΤΕΡΜΑΤΙΚΟΣ ΔΕΙΚΤΗΣ ΜΕΤΑΚΟΜΙΣΕ ΜΑΖΙ ΜΕ ΤΟΝ ΚΩΔΙΚΑ. Το
     `renderApogOrder` έγινε `planHead` — και αν το κόψιμο δεν βρει τον δείκτη,
     το `indexOf` γυρίζει −1 και η φέτα γίνεται ΑΔΕΙΑ, δηλαδή σιωπηλό μηδέν.
     Γι' αυτό υπάρχει ο έλεγχος μήκους από κάτω, και γι' αυτό δαγκώνει. */
  const slice = CODE.slice(CODE.indexOf('function apografiSave()'),
                           CODE.indexOf('function planHead('));
  ok('η apografiSave κόπηκε από τη σελίδα', slice.length > 400);

  function runSave(values) {
    const added = [], lessons = [];
    const inputs = values.map((v, i) => ({
      value: v, getAttribute: () => ['istoria', 'arxaia_gn', 'latinika'][i]
    }));
    const el = () => ({ textContent:'', classList:{add(){},remove(){}}, querySelectorAll:() => inputs });
    const ctx = {
      SUBJ:{ istoria:{label:'Ιστορία'}, arxaia_gn:{label:'Αρχαία · γνωστό'}, latinika:{label:'Λατινικά'} },
      $: () => el(),
      addTask: (o) => { added.push(o); return 'id' + added.length; },
      setLessons: (dk, subs) => { lessons.push(subs); return true; },
      dkOf: () => '2026-08-18', apogRefDate: () => new Date(),
      banner: () => {}, paint: () => {},
      esc: String, apogFace: null
    };
    ctx.window = ctx; vm.createContext(ctx);
    vm.runInContext(slice + '\napografiSave();', ctx);
    return { added, lessons };
  }

  /* ⚠️ ΤΟ FIXTURE ΕΧΕΙ ΚΕΦΑΛΑΙΑ ΚΑΙ ΤΟΝΟΥΣ ΕΠΙΤΗΔΕΣ. Η πρώτη γραφή έδινε
     «β4 απέξω», που είναι ΗΔΗ πεζό — οπότε ένα `toLowerCase()` στον γραφέα
     περνούσε απαρατήρητο. Ένα fixture που δεν μπορεί να δείξει τη διαφορά
     δεν ελέγχει τίποτα. */
  const r1 = runSave(['ΜΤΦΡΑΣΗ 1ης Ενότητας + Σχόλια', 'μετάφραση 3ης', '']);
  is('ΔΥΟ γεμάτα + ΕΝΑ κενό → ΔΥΟ εργασίες, ποτέ τρεις', r1.added.length, 2);
  is('και τα λόγια του μπαίνουν ΑΥΤΟΥΣΙΑ, με τα κεφαλαία του',
    r1.added[0].title, 'ΜΤΦΡΑΣΗ 1ης Ενότητας + Σχόλια');
  /* ⭐ ΤΟ ΜΑΘΗΜΑ ΔΙΝΕΤΑΙ ΑΠΟ ΤΟ ΠΡΟΓΡΑΜΜΑ — γι' αυτό είναι `arxaia_gn` και ΟΧΙ
     το legacy `arxaia`, που δεν παίρνει ΠΟΤΕ αυτόματη ημερομηνία. */
  is('και το μάθημα είναι το ΣΩΣΤΟ κλειδί, όχι το legacy', r1.added[1].subject, 'arxaia_gn');
  is('η ΜΕΡΑ γράφεται με ΟΛΑ τα μαθήματα, όχι μόνο όσα είχαν εργασία',
    r1.lessons[0], ['istoria', 'arxaia_gn', 'latinika']);

  const r2 = runSave(['', '', '']);
  is('ΚΑΝΕΝΑ γεμάτο → ΚΑΜΙΑ εργασία', r2.added.length, 0);
  is('αλλά η μέρα κρατιέται ΚΑΙ ΤΟΤΕ — «τι είχα» δεν εξαρτάται από «τι μου έβαλαν»',
    r2.lessons[0], ['istoria', 'arxaia_gn', 'latinika']);
  is('τα σκέτα κενά δεν μετράνε ως περιεχόμενο', runSave(['  ', 'κάτι', '   ']).added.length, 1);
}

section('9b · ΣΑΒΒΑΤΟΚΥΡΙΑΚΟ: ΚΑΜΙΑ ΑΠΟΓΡΑΦΗ');
{
  const slice = CODE.slice(CODE.indexOf('function apogRefDate('), CODE.indexOf('  var apogFace'));
  const mk = (slots) => {
    const ctx = { SUBJ:{ istoria:{}, latinika:{} },
      TT_DAYS:['mon','tue','wed','thu','fri','sat','sun'],
      dowMon: (d) => (d.getDay() + 6) % 7,
      ttDay: (d) => slots[d] === undefined ? null : slots[d] };
    ctx.window = ctx; vm.createContext(ctx); vm.runInContext(slice, ctx); return ctx;
  };
  const weekday = mk({ tue:[{at:'15:15',subject:'istoria'}] });
  const sat = mk({ sat: [] });
  const unknown = mk({});
  const TUE = new Date('2026-08-18T18:15:00'), SAT = new Date('2026-08-22T18:15:00');

  is('καθημερινή με πρόγραμμα → slots', weekday.apogSlots(TUE).length, 1);
  is('ΣΑΒΒΑΤΟ με ΑΔΕΙΑ εγγραφή → μηδέν slots', sat.apogSlots(SAT).length, 0);
  is('μέρα ΧΩΡΙΣ εγγραφή → null, ποτέ άδειος πίνακας (σταθ. 33)', unknown.apogSlots(TUE), null);
  is('«έχει slots;» false το Σάββατο', sat.apogHasSlots(SAT), false);
  is('«έχει slots;» false και σε άγνωστη μέρα', unknown.apogHasSlots(TUE), false);
  is('στις 02:30 η απογραφή ρωτάει για ΧΘΕΣ', weekday.apogRefDate(new Date('2026-08-19T02:30:00')).getDate(), 18);
  is('στις 18:15 ρωτάει για ΣΗΜΕΡΑ', weekday.apogRefDate(TUE).getDate(), 18);

  /* ⭐⭐ ΣΥΜΠΕΡΙΦΟΡΙΚΟ, ΚΑΙ als-v492 ΑΛΛΑΞΕ ΤΟΝ ΚΑΝΟΝΑ ΠΡΟΣ ΤΟ ΚΑΛΥΤΕΡΟ.
     Ως την als-v491 το Σαββατοκύριακο ΕΣΒΗΝΕ ολόκληρο το μπλοκ — δηλαδή η
     μόνη μέρα που έχει χρόνο να προλάβει τη Δευτέρα ήταν η μόνη χωρίς
     απάντηση. Τώρα κρύβεται ΜΟΝΟ όταν δεν έχει να πει ΤΙΠΟΤΑ και για τα δύο:
     ούτε απογραφή να πάρει, ούτε μέρα να σχεδιάσει. */
  const aslice = CODE.slice(CODE.indexOf('function apogCanCapture()'),
                            CODE.indexOf('function renderCapture()'));
  ok('το μπλοκ της απόφασης προσώπου κόπηκε από τη σελίδα', aslice.length > 200);
  function faceWith(slots, planDay, said) {
    const cls = { off:false }, drew = [];
    const sec = { classList:{ add:(c)=>{ if(c==='hw-off') cls.off=true; },
                              remove:(c)=>{ if(c==='hw-off') cls.off=false; } } };
    const ctx = { $: () => sec, apogSlots: () => slots,
      apogRefDate: () => new Date('2026-08-22T21:15:00'), dkOf: () => '2026-08-22',
      myLessons: () => said, apogFace: null,
      planFor: () => ({ day:planDay, slots:[], items:[], late:[], undated:0 }),
      renderCapture: () => drew.push('capture'), renderPlan: () => drew.push('plan') };
    ctx.window = ctx; vm.createContext(ctx);
    /* ⚠️ Μια μετάλλαξη δεν επιτρέπεται να ΠΕΤΑΞΕΙ το suite (als-v479). */
    try { vm.runInContext(aslice + '\nrenderApog();', ctx); }
    catch (e) { return { hidden:'THREW: ' + e.message.slice(0, 40), drew:['THREW'] }; }
    return { hidden: cls.off, drew };
  }
  is('ΣΑΒΒΑΤΟ χωρίς μαθήματα ΚΑΙ χωρίς επόμενη μέρα → ΚΡΥΒΕΤΑΙ',
    faceWith([], null, null).hidden, true);
  is('άγνωστη μέρα (null slots) και καμία επόμενη → κρύβεται ΚΑΙ ΤΟΤΕ',
    faceWith(null, null, null).hidden, true);
  /* ⭐ ΤΟ ΚΕΡΔΟΣ ΤΗΣ als-v492, ΚΛΕΙΔΩΜΕΝΟ: Κυριακή βράδυ. */
  is('ΚΥΡΙΑΚΗ ΒΡΑΔΥ: καμία απογραφή, ΑΛΛΑ υπάρχει Δευτέρα → ΔΕΝ κρύβεται',
    faceWith([], '2026-08-24', null).hidden, false);
  is('και δείχνει ΤΟ ΣΧΕΔΙΟ, ποτέ κουτιά που δεν έχει να συμπληρώσει',
    faceWith([], '2026-08-24', null).drew, ['plan']);
  /* Καθημερινή: η ερώτηση «τι σου έβαλαν;» γίνεται ΜΙΑ φορά. */
  is('καθημερινή, μέρα ΑΚΑΤΑΓΡΑΦΗ → ρωτάει τι του έβαλαν',
    faceWith([{at:'15:15',subject:'istoria'}], '2026-08-24', null).drew, ['capture']);
  is('⭐ ΙΔΙΑ ΜΕΡΑ, ΑΦΟΥ ΤΗΝ ΚΑΤΑΓΡΑΨΕ → απαντάει, δεν ξαναρωτάει',
    faceWith([{at:'15:15',subject:'istoria'}], '2026-08-24', ['istoria']).drew, ['plan']);
  is('και «είπε ότι δεν είχε» μετράει κι αυτό ως απαντημένη ερώτηση',
    faceWith([{at:'15:15',subject:'istoria'}], '2026-08-24', []).drew, ['plan']);

  /* Και η ίδια η ΣΥΛΛΗΨΗ ζωγραφίζει κουτί με το μάθημα ΑΠΟ ΤΟ ΠΡΟΓΡΑΜΜΑ. */
  const rslice = CODE.slice(CODE.indexOf('function renderCapture()'),
                            CODE.indexOf('function apografiSave()'));
  ok('η renderCapture κόπηκε από τη σελίδα', rslice.length > 400);
  const host = { innerHTML:'', classList:{add(){},remove(){}} };
  const rctx = { SUBJ:{ istoria:{label:'Ιστορία'} }, esc:String,
    apogSlots: () => [{at:'15:15',subject:'istoria'}],
    apogRefDate: () => new Date('2026-08-18T18:15:00'),
    $: (id) => id === 'hwApogFill' ? host : { textContent:'', classList:{add(){},remove(){}} } };
  rctx.window = rctx; vm.createContext(rctx);
  vm.runInContext(rslice + '\nrenderCapture();', rctx);
  ok('και ζωγραφίζει κουτί με το μάθημα ΑΠΟ ΤΟ ΠΡΟΓΡΑΜΜΑ',
    host.innerHTML.indexOf('data-apog="istoria"') > -1);
  ok('⛔ και το κενό κουτί ΛΕΕΙ ότι επιτρέπεται να μείνει κενό',
    host.innerHTML.indexOf('κεν') > -1 || PAGE.indexOf('Κενό κουτί = δεν σου έβαλε τίποτα') > -1);
}

section('9c · ΤΟ ΦΩΣ ΚΑΙ Η ΦΑΣΗ');
{
  const slice = CODE.slice(CODE.indexOf('function hwLite('), CODE.indexOf('function paintPhase('));
  const ctx = { document:{ documentElement:{ style:{ setProperty(){} } } }, apogHasSlots: () => true };
  ctx.window = ctx; vm.createContext(ctx); vm.runInContext(slice, ctx);
  const at = (h2, m) => ctx.hwLite(new Date(2026, 7, 18, h2, m));
  ok('το φως κορυφώνει το απόγευμα', at(15, 0) > 0.99);
  ok('και πέφτει τα μεσάνυχτα', at(3, 0) < 0.05);
  ok('το βράδυ είναι πιο σκοτεινό από το απόγευμα', at(21, 30) < at(18, 15));
  ok('και μένει πάντα μέσα στο 0..1', [0,4,9,14,19,23].every(x => at(x,0) >= 0 && at(x,0) <= 1));
  const ph = (h2, m) => ctx.hwPhase(new Date(2026, 7, 18, h2, m));
  is('στις 18:15 η φάση είναι capture', ph(18, 15), 'capture');
  is('στις 21:30 δεν είναι', ph(21, 30), 'idle');
  is('στις 16:00 (φροντιστήριο) δεν είναι', ph(16, 0), 'idle');
  /* Μια μέρα χωρίς μαθήματα δεν έχει ποτέ φάση σύλληψης. */
  const ctx2 = { document:ctx.document, apogHasSlots: () => false };
  ctx2.window = ctx2; vm.createContext(ctx2); vm.runInContext(slice, ctx2);
  is('Σαββατοκύριακο → ποτέ capture', ctx2.hwPhase(new Date(2026,7,22,18,15)), 'idle');
}

section('9d · Η ΥΛΗ ΒΓΑΙΝΕΙ ΑΠΟ CORPUS, ΠΟΤΕ ΓΡΑΜΜΕΝΗ ΣΤΟ ΧΕΡΙ');
{
  const face = CODE.slice(CODE.indexOf('function faceFor('), CODE.indexOf('function barFor('));
  ok('η faceFor διαβάζει το ΙΣΤΟΡΙΑ corpus', /ISTORIA\.UNITS/.test(face));
  ok('και το ΑΡΧΑΙΑ ΓΝΩΣΤΟ corpus', /ARXGN\.UNITS/.test(face));
  ok('και τα ΡΗΜΑΤΑ του ΑΓΝΩΣΤΟΥ', /ArxaiaData\.VERBS/.test(face));
  ok('και γυρίζει ΚΕΝΟ όταν δεν υπάρχει αληθινό κείμενο', /if \(!txt\) return '';/.test(face));
  ok('ο ΠΛΑΓΙΟΤΙΤΛΟΣ παίρνει τίτλο από την ΕΓΓΡΑΦΗ, όχι από corpus', /unitKind === 'plag'/.test(face));
  const bare = face.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
  ok('ΚΑΝΕΝΑ μακρύ ελληνικό literal μέσα στη faceFor (μηδέν ύλη στο χέρι)',
    !/['"][^'"]*[α-ωΑ-Ωἀ-ῼ][^'"]{40,}['"]/.test(bare));
}

section('9e · ΚΑΝΕΝΑΣ ΕΠΙΝΟΗΜΕΝΟΣ ΑΡΙΘΜΟΣ (σταθ. 33)');
{
  const ctx = {}; ctx.window = ctx; vm.createContext(ctx);
  vm.runInContext(CODE.slice(CODE.indexOf('function barFor(')).split('\n').slice(0, 7).join('\n'), ctx);
  is('ΜΗΔΕΝ κομμάτια → ΚΑΜΙΑ μπάρα (μια άδεια μπάρα διαβάζεται 0%)', ctx.barFor(0, 0), '');
  ok('με κομμάτια → μπάρα', ctx.barFor(9, 7).indexOf('hw-bar') > -1);
  ok('και το νούμερο είναι ΞΕΚΙΝΗΜΕΝΑ, ποτέ «τα ξέρεις»', ctx.barFor(9, 7).indexOf('ΞΕΚΙΝΗΜΕΝΑ') > -1);
  ok('7 από 9 γράφεται όπως μετρήθηκε', ctx.barFor(9, 7).indexOf('7 ΑΠΟ 9') > -1);
}

section('9f · ΟΙ ΦΩΤΟΓΡΑΦΙΕΣ ΕΙΝΑΙ ΑΡΧΕΙΑ, ΠΟΤΕ BYTES ΣΕ ΑΠΟΘΗΚΗ (σταθ. 34)');
{
  const IMGS = ['hw-cover.jpg', 'hw-consistency.jpg', 'hw-side.jpg', 'hw-banner.jpg'];
  const SW = fs.readFileSync(path.join(ALS, 'sw.js'), 'utf8');
  IMGS.forEach(f => {
    ok('υπάρχει το αρχείο ' + f, fs.existsSync(path.join(ALS, f)));
    ok('η σελίδα το ζητάει ως ΑΡΧΕΙΟ: ' + f, PAGE.indexOf('src="' + f + '"') > -1);
    ok('και είναι στο SW CORE: ' + f, SW.indexOf("'" + f + "'") > -1 || SW.indexOf('"' + f + '"') > -1);
  });
  ok('ΚΑΜΙΑ base64 εικόνα μέσα στη σελίδα', PAGE.indexOf('data:image/') < 0);
  ok('και το hw:pics δεν απέκτησε νέο γραφέα', (CODE.match(/hw:pics/g) || []).length <= 6);
}

section('9g · ΤΙ ΚΡΥΒΕΙ ΠΙΣΩ ΑΠΟ ΠΟΡΤΑ, ΚΑΙ ΠΩΣ');
{
  const doorRule = PAGE.slice(PAGE.indexOf('body.hw-door .hw-cover'),
                              PAGE.indexOf('body.hw-door .hw-cover') + 260);
  ok('η ατμόσφαιρα κρύβεται με display:none', /display:none/.test(doorRule));
  ok('και ΠΟΤΕ με opacity:0 (σταθ. 39)', !/opacity:\s*0/.test(doorRule));
  ok('η ΑΠΟΓΡΑΦΗ ξαναγυρίζει μέσα στην πόρτα #capture',
    /body\.hw-door-capture \.hw-apog\{ display:block; \}/.test(PAGE));
  ok('ό,τι ΚΡΥΒΕΙ νικάει ό,τι ΤΟΠΟΘΕΤΕΙ (σταθ. 4)',
    /\.hw-apog \.ap-ft\.hw-off[\s\S]{0,200}display:none !important/.test(PAGE));
  const phase = CODE.slice(CODE.indexOf('function paintPhase('), CODE.indexOf('function apogRefDate('));
  ok('η φάση αλλάζει ΜΟΝΟ κλάση, δεν σβήνει τίποτα',
    !/display\s*=|\.remove\(\)|innerHTML/.test(phase));
}

section('9g2 · ΤΟ ΠΕΡΙΘΩΡΙΟ ΕΙΝΑΙ ΣΤΑΣΙΜΟ ΩΣ ΠΡΟΣ ΤΗ ΣΕΛΙΔΑ, ΟΧΙ ΤΗΝ ΟΘΟΝΗ');
{
  /* ⭐⭐ ΤΟ ΜΑΘΗΜΑ ΤΗΣ als-v490, ΚΑΙ ΓΕΝΙΚΕΥΕΤΑΙ: «στάσιμο» σημαίνει κολλημένο
     σε σημείο της ΣΕΛΙΔΑΣ, όχι της οθόνης. Το πρώτο περιθώριο ήταν
     `position:fixed` — μετρημένο σωστά fixed (`top:232` σε κάθε scroll) — και
     ακριβώς γι' αυτό λάθος: έμενε ακίνητο στην οθόνη ενώ όλο το κείμενο
     γλιστρούσε από δίπλα, και ο Αλεξ το ανέφερε ως «πηγαίνουν πάνω-κάτω».
     ⛔ Ο,ΤΙ ΜΕΝΕΙ ΑΚΙΝΗΤΟ ΣΤΗΝ ΟΘΟΝΗ ΚΙΝΕΙΤΑΙ ΩΣ ΠΡΟΣ ΤΟ ΠΕΡΙΕΧΟΜΕΝΟ. */
  const gut = PAGE.slice(PAGE.indexOf('.hw-gut{'), PAGE.indexOf('body.hw-door .hw-gut'));
  ok('το περιθώριο ΔΕΝ είναι fixed', !/position:fixed/.test(gut));
  ok('είναι absolute μέσα σε relative άγκυρα', /position:relative/.test(gut) && /position:absolute/.test(gut));
  /* ⭐ ΥΨΟΣ ΜΗΔΕΝ: η άγκυρα δεν επιτρέπεται να σπρώξει τίποτα, αλλιώς μια
     διακοσμητική εικόνα αλλάζει τη διάταξη του κειμένου. */
  ok('η άγκυρα έχει ύψος ΜΗΔΕΝ', /\.hw-gut\{[^}]*height:0/.test(gut.replace(/\s+/g, ' ')));
  /* ⚠️ ΚΑΙ ΤΑ ΔΥΟ ΔΗΛΩΝΟΥΝ ORDER. Χωρίς αυτό παίρνουν 0 και πάνε ΠΡΩΤΑ — το
     μέτρησα: pageY 157, μέσα στην κουβέρτα, αντί για 556. */
  ok('το αριστερό δηλώνει order', /\.hw-gut-l\{ order:\d/.test(PAGE));
  ok('και το δεξί δηλώνει order', /\.hw-gut-r\{ order:\d/.test(PAGE));
  /* Το αριστερό κάθεται ΔΕΞΙΑ του κειμένου-ανάποδα (βγαίνει έξω αριστερά),
     το δεξί βγαίνει έξω δεξιά. Δύο διαφορετικές πλευρές, δική του απόφαση. */
  ok('το αριστερό βγαίνει ΑΡΙΣΤΕΡΑ από το κέντρο', /\.hw-gut-l > \.hw-pic\{ right:calc\(100% \+/.test(PAGE));
  ok('και το δεξί ΔΕΞΙΑ', /\.hw-gut-r > \.hw-pic\{ left:calc\(100% \+/.test(PAGE));
  /* ⚠️ ΤΟ BREAKPOINT ΕΙΝΑΙ ΑΡΙΘΜΗΤΙΚΗ, ΟΧΙ ΓΟΥΣΤΟ: 880 κέντρο + 2 × (176 + 28)
     = 1288. Κάτω από αυτό ΔΕΝ χωράνε, άρα δεν υπάρχουν — ποτέ πάνω από κείμενο. */
  ok('εμφανίζονται μόνο όπου χωράνε (≥1300px)', /@media \(min-width:1300px\)/.test(PAGE));
  ok('και είναι κρυμμένα εξ ορισμού', /\.hw-gut\{ display:none; \}/.test(PAGE));
  ok('και φεύγουν πίσω από πόρτα', /body\.hw-door \.hw-gut\{ display:none; \}/.test(PAGE));
  /* ⛔ ΤΟ ΠΑΛΙΟ RAIL ΔΕΝ ΕΠΙΤΡΕΠΕΤΑΙ ΝΑ ΕΠΙΣΤΡΕΨΕΙ. */
  /* ⚠️ Η ΒΕΛΟΝΑ ΕΙΝΑΙ Η ΧΡΗΣΗ, ΟΧΙ Η ΛΕΞΗ (σταθ. 19). Η πρώτη γραφή έψαχνε
     γυμνό «hw-rail» και σκάλωνε στο ΣΧΟΛΙΟ που τεκμηριώνει γιατί έφυγε — ένας
     φρουρός που κράζει λύκο είναι φρουρός που κάποιος χαλαρώνει. */
  ok('κανένα ζωντανό υπόλειμμα του fixed rail',
    PAGE.indexOf('class="hw-rail"') < 0 && PAGE.indexOf('.hw-rail{') < 0
    && PAGE.indexOf('.hw-rail ') < 0);
}

section('9h · Η ΣΕΙΡΑ ΤΟΥ FLEX — κάθε αδελφός με order ΔΗΛΩΝΕΙ order');
{
  const i = PAGE.indexOf('als-v490');
  const desk = PAGE.slice(PAGE.indexOf('@media (min-width:1000px){', i));
  ['hw-strip','hw-banner','hw-start','hw-apog','hw-lessons4','hw-doors','hw-grab'].forEach(c => {
    ok('το .' + c + ' δηλώνει order στο laptop', new RegExp('\\.' + c + '\\{ order:\\d').test(desk));
  });
}

section('9i · Η ΣΕΛΙΔΑ ΠΑΡΑΜΕΝΕΙ ΜΟΝΟ-ΑΝΑΓΝΩΣΗΣ ΣΤΙΣ ΠΕΝΤΕ ΑΠΟΘΗΚΕΣ (σταθ. 16)');
{
  ['ist:v1','arx:gn','arx:v1','lat:v1','ton:v1'].forEach(k => {
    ok('καμία εγγραφή στο ' + k,
      !new RegExp("(setItem|lsSet)\\s*\\(\\s*['\"]" + k.replace(':','\\:')).test(CODE));
  });
  ok('και κανένα corpus δεν γράφεται',
    !/ISTORIA\.[A-Z]+\s*=|ARXGN\.[A-Z]+\s*=|ArxaiaData\.[A-Z]+\s*=/.test(CODE));
}

REPORTED = true;

/* ══════════════════════════════════════════════════════════════════════
   13 · ⭐⭐⭐ als-v492 · ΤΟ ΣΧΕΔΙΟ — «ΤΙ ΕΧΩ ΝΑ ΔΙΑΒΑΣΩ ΓΙΑ ΑΥΡΙΟ»

   ⭐ ΣΤΑΘ. 40: ΤΑ ΔΕΔΟΜΕΝΑ ΕΙΝΑΙ ΤΑ ΔΙΚΑ ΤΟΥ, ΤΡΑΒΗΓΜΕΝΑ ΑΠΟ ΤΟ MCP ΠΡΙΝ
   ΣΧΕΔΙΑΣΤΕΙ ΓΡΑΜΜΗ — και άλλαξαν την απάντηση. Ένα «εύλογο» fixture με τρεις
   εργασίες γραμμένες σήμερα θα περνούσε πράσινο και δεν θα απεδείκνυε ΤΙΠΟΤΑ,
   γιατί το ίδιο το παράπονό του είναι ότι οι σημερινές ΔΕΝ είναι οι αυριανές.

   Δικά του, 18/08/26: «αύριο έχω άλλο πρόγραμμα, άρα δεν έχω να διαβάσω τα
   μαθήματα που μου έβαλαν σήμερα, μόνο 1 από τα 3».
   ══════════════════════════════════════════════════════════════════════ */
section('13 · als-v492 · ΤΟ ΣΧΕΔΙΟ, ΠΑΝΩ ΣΤΑ ΑΛΗΘΙΝΑ ΤΟΥ ΔΕΔΟΜΕΝΑ');
{
  const T18 = Date.parse('2026-08-18T17:53:00');   /* η ώρα που τα έγραψε */
  const REAL = { v: 1, samples: {}, lessons: {}, tasks: {
    /* ΤΑ ΤΡΙΑ ΠΟΥ ΕΓΡΑΨΕ ΤΗΝ ΤΡΙΤΗ — δύο από αυτά ΔΕΝ είναι για την Τετάρτη */
    a: { id:'a', ts:T18, _ts:T18, due:null, done:0, kind:'askisi', subject:'arxaia_gn',
         title:'εισαγωγη σελιδα 8 και 9 και ασκηση στο τετραδιο' },
    b: { id:'b', ts:T18, _ts:T18, due:'2026-08-19', done:0, kind:'askisi', subject:'istoria',
         title:'β4 απεξω' },
    c: { id:'c', ts:T18, _ts:T18, due:null, done:0, kind:'askisi', subject:'latinika',
         title:'κειμενο 2 μτφραση συνταξη αρχικοι χρονοι ΤΑ ΠΑΝΤΑ' },
    /* ΚΑΙ ΤΑ ΤΕΣΣΕΡΑ ΠΟΥ ΤΟΥ ΕΒΑΛΑΝ ΤΗ ΔΕΥΤΕΡΑ, ΓΙΑ ΤΗΝ ΤΕΤΑΡΤΗ */
    d: { id:'d', ts:T18, _ts:T18, due:'2026-08-19', done:0, kind:'askisi', subject:'arxaia_agn',
         title:'αρχικοι χρονοι σελιδα 146' },
    e: { id:'e', ts:T18, _ts:T18, due:'2026-08-19', done:0, kind:'askisi', subject:'arxaia_agn',
         title:'σελ 16-7 επαναληψη' },
    f: { id:'f', ts:T18, _ts:T18, due:'2026-08-19', done:0, kind:'apexo', subject:'ekthesi',
         title:'1η σελιδα απο λεξικο συνωνυμων και αντωνυμων αντιθετων' },
    /* ⭐ ΤΕΛΕΙΩΜΕΝΗ: ΔΕΝ επιτρέπεται να εμφανιστεί ΠΟΤΕ στο βράδυ */
    g: { id:'g', ts:T18, _ts:T18, due:'2026-08-19', done:T18, kind:'askisi', subject:'arxaia_agn',
         title:'κλιση ουσιαστικων' },
    /* ⛔ ΚΛΗΡΟΝΟΜΙΚΟ `arxaia`: ΔΕΝ παίρνει ΠΟΤΕ αυτόματη μέρα (δύο καθηγητές) */
    h: { id:'h', ts:T18, _ts:T18, due:null, done:0, kind:'apexo', subject:'arxaia',
         title:'Αρχαία άγνωστο Αρχικοί χρόνοι' }
  } };
  const seed = { [KEY]: JSON.stringify(REAL) };

  /* ── ΤΡΙΤΗ 21:00 · η σκηνή του παραπόνου του ─────────────────────── */
  const E = makeEnv({ now: '2026-08-18T21:00:00', store: seed });
  const p = E.api.planFor();
  is('η μέρα που σχεδιάζουμε είναι Η ΤΕΤΑΡΤΗ, όχι η σημερινή Τρίτη', p.day, '2026-08-19');
  is('και τα μαθήματά της βγαίνουν ΑΠΟ ΤΟ ΠΡΟΓΡΑΜΜΑ, με τη σειρά της ώρας',
    p.slots.map(s => s.subject), ['istoria', 'arxaia_agn', 'ekthesi']);

  /* ⭐⭐ ΤΟ ΚΡΙΤΗΡΙΟ, ΓΡΑΜΜΕΝΟ ΜΕ ΤΟ ΧΕΡΙ ΑΠΟ ΤΑ ΔΕΔΟΜΕΝΑ ΤΟΥ. */
  is('ΤΕΣΣΕΡΙΣ εργασίες για αύριο, με τη ΣΕΙΡΑ ΤΩΝ ΩΡΩΝ της Τετάρτης',
    p.items.map(x => x.task.id), ['b', 'd', 'e', 'f']);
  is('και κάθε μία κουβαλάει την ώρα που θα ρωτηθεί',
    p.items.map(x => x.at), ['15:15', '16:15', '16:15', '17:15']);
  is('τίποτα εκπρόθεσμο ακόμη', p.late.length, 0);

  /* ⭐ ΤΟ ΜΙΣΟ ΤΟΥ ΠΑΡΑΠΟΝΟΥ: τα δύο σημερινά που ΔΕΝ είναι για αύριο. */
  const shown = p.items.map(x => x.task.id);
  ok('τα ΑΡΧΑΙΑ ΓΝΩΣΤΟΥ που του έβαλαν ΣΗΜΕΡΑ δεν είναι απόψε — είναι Παρασκευή',
    shown.indexOf('a') < 0);
  ok('ούτε τα ΛΑΤΙΝΙΚΑ που του έβαλαν σήμερα', shown.indexOf('c') < 0);
  is('και η προθεσμία τους λέει ΠΟΙΑ Παρασκευή, παραγόμενη από το πρόγραμμα',
    [E.api.dueOf(REAL.tasks.a).key, E.api.dueOf(REAL.tasks.c).key],
    ['2026-08-21', '2026-08-21']);
  /* ⭐ ΤΟ ΑΛΛΟ ΜΙΣΟ: τρία που ΕΙΝΑΙ για αύριο και του τα έβαλαν ΑΛΛΗ ΜΕΡΑ. */
  ok('ενώ τα ΑΡΧΑΙΑ ΑΓΝΩΣΤΟΥ και η ΕΚΘΕΣΗ, από άλλη μέρα, ΕΙΝΑΙ απόψε',
    shown.indexOf('d') > -1 && shown.indexOf('e') > -1 && shown.indexOf('f') > -1);

  ok('⛔ μια ΤΕΛΕΙΩΜΕΝΗ εργασία δεν εμφανίζεται ποτέ', shown.indexOf('g') < 0);
  /* ⛔⛔ ΣΤΑΘ. 33: η ΑΧΡΟΝΗ ΔΕΝ ΕΞΑΦΑΝΙΖΕΤΑΙ ΣΙΩΠΗΛΑ. Το κληρονομικό `arxaia`
     δεν μπορεί να πάρει μέρα, άρα ΔΕΝ μπαίνει στη λίστα — αλλά ΜΕΤΡΙΕΤΑΙ, και
     μια ήσυχη γραμμή τη δείχνει. Χωρίς αυτό θα έλειπε από ΚΑΘΕ οθόνη. */
  is('η άχρονη εργασία μετριέται χωριστά, ΠΟΤΕ δεν πέφτει στο πάτωμα', p.undated, 1);
  ok('και δεν μπήκε στη λίστα του βραδιού', shown.indexOf('h') < 0);
  is('η πόρτα μετράει εκπρόθεσμα ΚΑΙ αυριανά, ποτέ μόνο τα μισά',
    E.api.planCount(p), 4);

  /* ── ΤΡΙΤΗ 11:00 · Η ΩΡΑ ΕΙΝΑΙ ΜΕΡΟΣ ΤΗΣ ΕΡΩΤΗΣΗΣ ───────────────── */
  const M = makeEnv({ now: '2026-08-18T11:00:00', store: seed }).api.planFor();
  is('⭐ ΣΤΙΣ 11:00 ΤΟ ΦΡΟΝΤΙΣΤΗΡΙΟ ΤΩΝ 15:15 ΕΙΝΑΙ ΜΠΡΟΣΤΑ ΤΟΥ — άρα ΣΗΜΕΡΑ',
    M.day, '2026-08-18');
  is('και τα μαθήματα είναι της ΤΡΙΤΗΣ', M.slots.map(s => s.subject),
    ['istoria', 'arxaia_gn', 'latinika']);

  /* ── ΠΑΡΑΣΚΕΥΗ ΒΡΑΔΥ ΚΑΙ ΣΑΒΒΑΤΟΚΥΡΙΑΚΟ · ΠΟΤΕ ΚΕΝΗ ΟΘΟΝΗ ──────── */
  const FRI = makeEnv({ now: '2026-08-21T22:00:00', store: seed }).api.planFor();
  is('Παρασκευή βράδυ δείχνει ΔΕΥΤΕΡΑ, ποτέ Σάββατο', FRI.day, '2026-08-24');
  const SUN = makeEnv({ now: '2026-08-23T20:00:00', store: seed }).api.planFor();
  is('και η Κυριακή το ίδιο — η μέρα που έχει χρόνο δεν μένει χωρίς απάντηση',
    SUN.day, '2026-08-24');

  /* ⭐⭐⭐ Η ΑΠΟΔΕΙΞΗ ΟΤΙ ΤΟ «ΔΕΝ ΦΑΙΝΟΝΤΑΙ ΚΑΘΟΛΟΥ» ΕΙΝΑΙ ΑΣΦΑΛΕΣ.
     Δική του απόφαση 18/08: ό,τι είναι για αργότερα δεν εμφανίζεται απόψε. Αυτό
     είναι ασφαλές ΜΟΝΟ επειδή η προθεσμία καρφώθηκε: μόλις περάσει η μέρα τους,
     γίνονται ΕΚΠΡΟΘΕΣΜΑ και ανεβαίνουν ΠΑΝΩ ΠΑΝΩ μόνα τους. Αν το `dueOf`
     ξαναμετρήσει από το `today()`, αυτή η βεβαίωση κοκκινίζει. */
  ok('⭐ τα κρυμμένα της Παρασκευής ΓΙΝΟΝΤΑΙ ΕΚΠΡΟΘΕΣΜΑ, δεν χάνονται',
    SUN.late.map(x => x.task.id).indexOf('a') > -1 &&
    SUN.late.map(x => x.task.id).indexOf('c') > -1);
  /* Και ΟΛΑ τα υπόλοιπα μαζί τους: ως την Κυριακή έχει λήξει και η Τετάρτη.
     ⭐ Η ΣΕΙΡΑ ΕΙΝΑΙ ΤΟ ΠΑΛΑΙΟΤΕΡΟ ΠΡΩΤΟ — αυτό που περιμένει περισσότερο. */
  is('με τη σειρά της προθεσμίας, το παλαιότερο πρώτο',
    SUN.late.map(x => x.due),
    ['2026-08-19', '2026-08-19', '2026-08-19', '2026-08-19', '2026-08-21', '2026-08-21']);
  is('τίποτα δεν έμεινε στα «αυριανά» — η Δευτέρα δεν χρωστάει τίποτα δικό της',
    SUN.items.length, 0);
  /* ⛔⛔ ΚΑΙ ΕΔΩ ΕΙΝΑΙ Η ΟΛΗ ΑΠΟΔΕΙΞΗ: η προθεσμία των δύο της Παρασκευής
     ΕΜΕΙΝΕ Παρασκευή. Αν το `dueOf` ξαναμετρήσει από το `today()`, γίνεται
     «Τρίτη», φεύγουν από τα εκπρόθεσμα και η σελίδα τα συγχωρεί σιωπηλά. */
  is('η προθεσμία ΔΕΝ γλίστρησε μαζί με τη μέρα',
    SUN.late.filter(x => x.task.id === 'a' || x.task.id === 'c').map(x => x.due),
    ['2026-08-21', '2026-08-21']);

  /* ⛔⛔ Ο ΦΡΟΥΡΟΣ ΤΟΥ ΓΛΙΣΤΡΗΜΑΤΟΣ, ΞΕΧΩΡΙΣΤΑ ΚΑΙ ΣΥΜΠΕΡΙΦΟΡΙΚΑ. Πριν την
     als-v492 η αυτόματη μέρα μετριόταν από το ΣΗΜΕΡΑ, οπότε την Κυριακή αυτή η
     εργασία θα έδειχνε ήσυχα «Τρίτη» και τίποτα δεν γινόταν ποτέ εκπρόθεσμο. */
  is('η αυτόματη μέρα μετριέται από τη ΜΕΡΑ ΠΟΥ ΓΡΑΦΤΗΚΕ, όχι από σήμερα',
    makeEnv({ now: '2026-08-23T20:00:00', store: seed }).api.dueOf(REAL.tasks.a).key,
    '2026-08-21');
  is('και μια εργασία ΧΩΡΙΣ `ts` πέφτει πίσω στην παλιά συμπεριφορά, ποτέ σε σφάλμα',
    makeEnv({ now: '2026-08-18T21:00:00', store: seed })
      .api.dueOf({ subject:'latinika', due:null }).key, '2026-08-21');

  /* ⛔ ΤΟ ΜΑΘΗΜΑ ΕΚΤΟΣ ΠΡΟΓΡΑΜΜΑΤΟΣ ΔΕΝ ΕΞΑΦΑΝΙΖΕΤΑΙ (ο κλασικός τρόπος που
     γεννιέται σιωπηλό μηδέν εδώ — σταθ. 40). Ρητό `due` σε μέρα που ΔΕΝ έχει
     αυτό το μάθημα: μπαίνει ΤΕΛΕΥΤΑΙΟ, ποτέ έξω. */
  const ODD = JSON.parse(JSON.stringify(REAL));
  ODD.tasks.z = { id:'z', ts:T18, _ts:T18, due:'2026-08-19', done:0, kind:'askisi',
                  subject:'latinika', title:'Λατινικά που ΔΕΝ έχει την Τετάρτη' };
  const O = makeEnv({ now: '2026-08-18T21:00:00', store: { [KEY]: JSON.stringify(ODD) } }).api.planFor();
  ok('εργασία μαθήματος εκτός της αυριανής μέρας ΔΕΝ πέφτει στο πάτωμα',
    O.items.map(x => x.task.id).indexOf('z') > -1);
  is('και πάει ΤΕΛΕΥΤΑΙΑ, χωρίς να επινοεί ώρα',
    [O.items[O.items.length - 1].task.id, O.items[O.items.length - 1].at], ['z', '']);
}



/* ⛔⛔ als-v492 · Ο ΔΙΑΧΩΡΙΣΤΗΣ ΔΕΝ ΕΠΙΤΡΕΠΕΤΑΙ ΝΑ ΖΕΙ ΜΕΣΑ ΣΤΑ ΟΝΟΜΑΤΑ.
   Το είδε ΜΟΝΟ το render: «Ιστορία · Αρχαία · άγνωστο · Έκθεση» είναι ΤΡΙΑ
   μαθήματα γραμμένα σαν τέσσερα, επειδή οι ετικέτες των Αρχαίων περιέχουν
   ήδη ` · `. Ο κανόνας γενικεύεται σε κάθε λίστα που ενώνει ονόματα. */
section('13b · als-v492 · ο διαχωριστής δεν συγκρούεται με τα ονόματα');
{
  /* ⛔ Το παλιό κείμενο της κατάταξης ΔΕΝ επιτρέπεται να επιβιώσει: περιέγραφε
     μια σειρά που ο ίδιος διάλεγε με βελάκια, και τα βελάκια έφυγαν. */
  /* ⚠️ ΣΤΑΘ. 19 ΓΙΑ ΤΕΤΑΡΤΗ ΦΟΡΑ ΣΕ ΑΥΤΟ ΤΟ ΑΡΧΕΙΟ: το `CODE` σβήνει ΜΟΝΟ
     σχόλια JS. Ο φρουρός σκάλωσε στο HTML σχόλιο που τεκμηριώνει την ίδια την
     αφαίρεση — γι' αυτό σβήνονται ΚΑΙ τα δύο είδη πριν την αναζήτηση. */
  const MARKUP = PAGE.replace(/<!--[\s\S]*?-->/g, ' ').replace(/\/\*[\s\S]*?\*\//g, ' ');
  ok('καμία υπόσχεση «σειράς της βραδιάς» δεν επιβιώνει',
    MARKUP.indexOf('Αυτή είναι η σειρά της βραδιάς') < 0);
  ok('και η γραμμή λέει ΓΙΑΤΙ είναι αυτή η σειρά',
    PAGE.indexOf('Με τη σειρά που θα σε ρωτήσουν') > -1);
  const sep  = (CODE.match(/var SEP = '([^']+)';/) || [])[1];
  const sepQ = (CODE.match(/var SEP_Q = '([^']+)';/) || [])[1];
  ok('και οι δύο διαχωριστές δηλώνονται ΜΙΑ φορά ο καθένας', !!sep && !!sepQ);
  const labels = (PAGE.match(/label:'([^']+)'/g) || []).map(m => m.slice(7, -1));
  ok('υπάρχουν ετικέτες να ελεγχθούν', labels.length >= 5);
  is('⛔ ΚΑΜΙΑ ετικέτα μαθήματος δεν περιέχει κανέναν από τους δύο',
    labels.filter(l => l.indexOf(sep.trim()) > -1 || l.indexOf(sepQ.trim()) > -1), []);
  /* Και ο φρουρός δαγκώνει: με ` · ` η ίδια βεβαίωση πέφτει, γιατί οι δύο
     ετικέτες των Αρχαίων τον κουβαλάνε αυτούσιο. */
  ok('και η απόδειξη ότι δαγκώνει: με « · » θα υπήρχαν συγκρούσεις',
    labels.filter(l => l.indexOf('·') > -1).length >= 2);
}


/* ⛔⛔ als-v492 · ΤΑ ΕΛΛΗΝΙΚΑ ΤΟΥ ΕΚΠΡΟΘΕΣΜΟΥ — ΤΑ ΕΠΙΑΣΕ ΤΟ RENDER, ΟΧΙ ΒΕΒΑΙΩΣΗ.
   Η Κυριακή είναι η μόνη σκηνή όπου φαίνονται και τα δύο: «ήταν ΠΕΡΑΣΕ 4
   μέρες» (το `fmtDue` απαντάει ΑΠΟΣΤΑΣΗ, όχι ΜΕΡΑ) και «6 εκπρόθεσμΗΣ». */
section('13c · als-v492 · το εκπρόθεσμο λέει ΠΟΙΑ μέρα ήταν, σε σωστά ελληνικά');
{
  const E = makeEnv({ now: '2026-08-23T20:00:00' });
  const f = E.api.fmtPast;
  is('χθες', f('2026-08-22'), 'χθες');
  is('προχθές', f('2026-08-21'), 'προχθές');
  is('μέσα στη βδομάδα → με το ΟΝΟΜΑ της μέρας', f('2026-08-19'), 'την Τετάρτη');
  is('πιο πίσω → ημερομηνία', f('2026-08-10'), 'στις 10/8');
  /* ⛔ ΚΑΙ Ο ΛΟΓΟΣ ΠΟΥ ΥΠΑΡΧΕΙ: το `fmtDue` ΔΕΝ κάνει αυτή τη δουλειά. */
  ok('το fmtDue απαντάει ΑΠΟΣΤΑΣΗ, γι\' αυτό δεν μπαίνει μετά από «ήταν»',
    E.api.fmtDue('2026-08-19').indexOf('πέρασε') > -1);
  /* ⛔⛔ ΤΟ ΤΡΙΤΟ ΠΟΥ ΕΠΙΑΣΕ Η ΚΥΡΙΑΚΗ: «ήταν ΓΙΑ προχθές». Κάθε μορφή που
     γυρίζει το `fmtPast` πρέπει να στέκει ΜΕΤΑ από τη λέξη «ήταν» — αλλιώς η
     πρόταση σπάει μόνο για ΜΕΡΙΚΕΣ ημερομηνίες, που είναι ο χειρότερος τρόπος
     να σπάει. Ελέγχονται ΟΛΕΣ οι διακλαδώσεις, όχι μία. */
  ['2026-08-22','2026-08-21','2026-08-19','2026-08-10','2026-08-23'].forEach(function(dk){
    ok('«ήταν ' + f(dk) + '» στέκει στα ελληνικά', f(dk).indexOf('πέρασε') < 0 && f(dk).indexOf('για') !== 0);
  });
  ok('και η γραμμή του εκπρόθεσμου χρησιμοποιεί το fmtPast, ποτέ το fmtDue',
    /'ήταν ' \+ fmtPast\(r\.due\)/.test(CODE));
  /* Ο πληθυντικός, και στα δύο σημεία που τον γράφουν. */
  ok('η κεφαλίδα της ομάδας κλίνεται', /'Εκπρόθεσμη' : 'Εκπρόθεσμα'/.test(CODE));
  ok('και η πόρτα το ίδιο, ποτέ «εκπρόθεσμης»',
    /' εκπρόθεσμη' : ' εκπρόθεσμες'/.test(CODE) && CODE.indexOf('εκπρόθεσμη\' + (') < 0);
  /* ⭐ Και ο ΙΔΙΟΣ αριθμός δεν λέγεται δύο φορές όταν όλα είναι εκπρόθεσμα. */
  ok('όταν ΟΛΑ είναι εκπρόθεσμα, ο αριθμός λέγεται ΜΙΑ φορά',
    /if \(late === n\) return late \+/.test(CODE));
  /* ⭐ ΜΙΑ ΔΙΑΤΥΠΩΣΗ, ΔΥΟ ΘΕΣΕΙΣ: η πόρτα και το μπλοκ ΔΕΝ επιτρέπεται να
     ονομάζουν αλλιώς τον ίδιο αριθμό (σταθ. 15). */
  is('η μέτρηση δηλώνεται ΜΙΑ φορά', (CODE.match(/function planTally\(/g) || []).length, 1);
  is('και τη διαβάζουν ΚΑΙ Η ΠΟΡΤΑ ΚΑΙ ΤΟ ΜΠΛΟΚ', (CODE.match(/planTally\(p\)/g) || []).length, 3);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);