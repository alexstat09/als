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
    '\nreturn { parseLine:parseLine, budget:budget, candidates:candidates, reload:reload,' +
    ' addTask:addTask, dropTask:dropTask, sweepDone:sweepDone, taskList:taskList,' +
    ' estimate:estimate, recordSample:recordSample, save:save, blocksFor:blocksFor,' +
    ' pileDay:pileDay, bringForward:bringForward, doorOf:doorOf, tonightView:tonightView,' +
    ' myLessons:myLessons, setLessons:setLessons, clearLessons:clearLessons, lessonsFor:lessonsFor,' +
    ' calState:calState, today:today,' +
    ' dowMon:dowMon, offDate:offDate, nextDow:nextDow, ladders:ladders, subjectOfText:subjectOfText,' +
    ' state:function(){ return state; } };})()';
  const api = vm.runInContext(src, ctx, { filename: 'homework.html:script' });
  api.reload();
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
/* ⭐ als-v485: το corpus `gn*` ΕΙΝΑΙ το ΓΝΩΣΤΟ, άρα η απάντηση έγινε ΠΙΟ
   ακριβής χωρίς να αλλάξει ο κανόνας — το μάθημα βγαίνει από το corpus. */
is('μια ενότητα χωρίς μάθημα δίνει το μάθημα από το corpus, όχι από εικασία',
  P('gn1 απέξω').subject, 'arxaia_gn');

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
  is('και ο λόγος το λέει με λέξεις', pool[0].why, ['έληξε πριν 4 μέρες', 'αδύνατο']);
  is('τα Λατινικά λένε μόνο ό,τι ισχύει γι\' αυτά', pool[1].why, ['έληξε σήμερα']);
  ok('κανένα σκορ δεν φτάνει ποτέ στην οθόνη', PAGE.indexOf('c.score') < 0 && PAGE.indexOf('esc(c.score') < 0);
  ok('η Ιστορία φεύγει με ΒΑΘΥ σύνδεσμο στη σωστή ενότητα', pool[0].href === 'istoria.html#recall:a1a');
  ok('τα Λατινικά ΔΕΝ επινοούν hash που η σελίδα τους δεν διαβάζει', pool[1].href === 'latinika.html');
}
{
  /* ΙΣΟΠΑΛΙΑ: δύο πανομοιότυπα χρέη, ίδια μέρα, καμία αδυναμία. Σπάει προς το
     ΒΑΡΥΤΕΡΟ μάθημα — Αρχαία 30% έναντι Λατινικά 20%. Δικοί του αριθμοί. */
  const TIE = {
    'lat:v1': JSON.stringify({ v: 1, cells: [{ id: 'x', r: 20, w: 0, box: 3, due: NOWMS - 60000, ts: 1 }] }),
    'ton:v1': JSON.stringify({ v: 1, cells: { dasia: { r: 20, w: 0, due: NOWMS - 60000, streak: 3 } } })
  };
  const F = makeEnv({ now: TUE, store: TIE });
  const pool = F.api.candidates(245);
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
  is('και ΟΛΑ δείχνουν στο unknown',
    (PAGE.match(/SUBJ\[t\.subject\] \|\| SUBJ\.unknown/g) || []).length, 3);
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
ok("and the task row pushes it only when non-null", /if \(eb\) bits\.push\(eb\)/.test(PAGE));

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
  ok('and both places wire them through ONE implementation',
    (PAGE.match(/wireTaskActs\(/g) || []).length === 3);
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
  ok('το ΚΕΝΤΡΟ είναι μία κεντραρισμένη στήλη, όχι δύο',
    /body:not\(\.hw-door\) \.hw-wrap\{ max-width:560px; \}/.test(PAGE) &&
    /body:not\(\.hw-door\) \.hw-cols\{ display:flex; flex-direction:column; \}/.test(PAGE));
  ok('⛔ και τα ΔΩΜΑΤΙΑ δεν αγγίχτηκαν — κρατάνε τα δικά τους πλάτη',
    /body\.hw-door-mathimata \.hw-wrap\{ max-width:1080px/.test(PAGE) &&
    /body\.hw-door-ergasies \.hw-wrap\{ max-width:840px/.test(PAGE));
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
  ok('καμία αναδιάταξη δεν ζει ΕΞΩ από media query',
    (PAGE.match(ORDER_RE) || []).length ===
    (phone.match(ORDER_RE) || []).length + (laptop.match(ORDER_RE) || []).length);
  ok('και κάθε σειρά του laptop ισχύει ΜΟΝΟ στο κέντρο, ποτέ πίσω από πόρτα',
    (laptop.match(ORDER_RE) || []).length > 0 &&
    (laptop.match(/body:not\(\.hw-door\) \.hw-[a-z0-9]+\{ order:/g) || []).length ===
    (laptop.match(ORDER_RE) || []).length);
}

section('4f · φάση 2 · the 21:45 door is the SAME reader, not a second copy');
{
  /* σταθερή αρχή 15: μία εγγύηση σε δύο θέσεις, ή είναι σύμπτωση με καλή φήμη.
     Μία δήλωση + δύο κλήσεις (η ΜΕΡΑ και η πόρτα). */
  /* ⚠️ als-v484: ήταν ΤΡΕΙΣ (δήλωση + ΜΕΡΑ + πόρτα). Η ΜΕΡΑ κόπηκε, άρα δύο.
     Ο αριθμός δεν είναι ο κανόνας — ο κανόνας είναι ΜΙΑ δήλωση, και κάθε
     αναγνώστης να περνάει από ΑΥΤΗΝ. Γι' αυτό ελέγχεται και το δεύτερο. */
  is('tonightView() is declared once and read from every reader',
    (CODE.match(/tonightView\(/g) || []).length, 2);
  /* ⚠️ Η ΠΡΩΤΗ ΓΡΑΦΗ ΑΥΤΟΥ ΔΕΝ ΔΑΓΚΩΝΕ, και ο λόγος γενικεύεται: έψαχνε «κάπου
     μέσα στα επόμενα 300 chars υπάρχει tv.state», που παραμένει ΑΛΗΘΕΣ αν
     καρφώσεις μια τιμή ΜΠΡΟΣΤΑ από τον σωστό υπολογισμό. Ένας φρουρός που
     ελέγχει ΠΑΡΟΥΣΙΑ αντί για ΣΧΗΜΑ περνάει κάθε μετάλλαξη που προσθέτει.
     Τώρα ελέγχεται ότι η ΑΝΑΘΕΣΗ ΞΕΚΙΝΑΕΙ από τον αναγνώστη, και ότι είναι μία. */
  is('η πόρτα «Απόψε» γράφεται ΜΙΑ φορά', (CODE.match(/\$\('hwDoorsN'\)\.textContent =/g) || []).length, 1);
  ok('και η ανάθεσή της ΞΕΚΙΝΑΕΙ από το tonightView(), όχι από καρφωμένη τιμή',
    /\$\('hwDoorsN'\)\.textContent =\s*\n\s*\(tv\.state === 'live' \|\| tv\.state === 'mine'\)/.test(CODE));
  ok('and the three calendar states are three DIFFERENT sentences, not two',
    /TONIGHT_TXT = \{[\s\S]{0,400}unknown:[\s\S]{0,400}none:/.test(PAGE));
  ok('«δεν έχω ημερολόγιο» is not written as «δεν έχεις μάθημα»',
    PAGE.indexOf('Δεν ξέρω τα σημερινά σου μαθήματα χωρίς το ημερολόγιο') > -1 &&
    PAGE.indexOf('Το ημερολόγιο δεν δείχνει μάθημα σήμερα') > -1);
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
  ok('και ΔΕΝ γράφει ποτέ μηδέν για κάτι που δεν μετρήθηκε (σταθ. 33)',
    CODE.indexOf("'δεν ξέρω ακόμη'") > -1);
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
  const v = E3.api.tonightView();
  is('η πόρτα λέει ΑΓΝΩΣΤΑ', v.state, 'unknown');
  is('χωρίς να επινοεί μάθημα', v.items, []);
  /* ⭐ ΤΟ ΚΡΙΤΗΡΙΟ. Τρία πατήματα και ένα «Έτοιμο», σε συσκευή χωρίς GCal. */
  ok('τα λέει ο ίδιος, και γράφονται', E3.api.setLessons(E3.api.today(), ['arxaia', 'istoria', 'latinika']));
  const w = E3.api.tonightView();
  is('ΤΟ 21:45 ΓΕΜΙΣΕ ΧΩΡΙΣ ΗΜΕΡΟΛΟΓΙΟ', w.state, 'mine');
  is('με τα τρία, ΣΤΗ ΣΕΙΡΑ ΠΟΥ ΤΑ ΠΑΤΗΣΕ', w.items.map(x => x.subject), ['arxaia', 'istoria', 'latinika']);
  is('και με ελληνικά ονόματα, ποτέ τιμές μηχανής', w.items.map(x => x.title), ['Αρχαία', 'Ιστορία', 'Λατινικά']);
  is('η πηγή δηλώνεται σε κάθε γραμμή', w.items.map(x => x.src), ['mine', 'mine', 'mine']);
  /* ⭐ σταθερή αρχή 33: η ώρα εδώ δεν είναι ΑΓΝΩΣΤΗ μέτρηση, είναι μέγεθος που
     ΔΕΝ ΥΠΑΡΧΕΙ — και μια στήλη με τρεις παύλες διαβάζεται ως σφάλμα. */
  is('καμία επινοημένη ώρα', w.items.map(x => x.at), [null, null, null]);
  ok('και η γραμμή του δεν ζωγραφίζει ΚΑΘΟΛΟΥ στήλη ώρας',
    /x\.src === 'mine' \? '' :[\s\S]{0,220}x\.at == null \? '—'/.test(PAGE));
}

section('4h · φάση 3 · «δεν είχα μάθημα» ΕΙΝΑΙ απάντηση, και όχι η ίδια με «δεν ξέρω»');
{
  const E3 = makeEnv({});
  is('πριν πει οτιδήποτε, δεν υπάρχει εγγραφή', E3.api.myLessons(E3.api.today()), null);
  ok('λέει ότι δεν είχε', E3.api.setLessons(E3.api.today(), []));
  is('και ΑΥΤΟ είναι εγγραφή, όχι απουσία', E3.api.myLessons(E3.api.today()), []);
  is('με δική της πρόταση', E3.api.tonightView().state, 'mineNone');
  /* Οι τέσσερις προτάσεις είναι τέσσερις ΔΙΑΦΟΡΕΤΙΚΕΣ προτάσεις. */
  const T = (PAGE.match(/var TONIGHT_TXT = \{[\s\S]*?\n  \};/) || [''])[0];
  ['unknown:', 'none:', 'mineNone:'].forEach(k => ok('TONIGHT_TXT έχει ' + k, T.indexOf(k) > -1));
  const said = (T.match(/'([^']{20,})'/g) || []);
  is('και είναι τρεις ξεχωριστές', new Set(said).size, 3);
  /* ⛔ Η ΠΑΛΙΑ ΠΡΟΤΑΣΗ ΗΤΑΝ ΑΔΙΕΞΟΔΟ ΜΕΤΑ ΤΗ ΦΑΣΗ 3: έστελνε σε μια ρύθμιση
     άλλης σελίδας για κάτι που λύνεται με τέσσερα πατήματα εδώ. */
  /* ⚠️ ΣΤΑΘΕΡΗ ΑΡΧΗ 19, ΓΙΑ ΤΡΙΤΗ ΦΟΡΑ ΣΕ ΑΥΤΟ ΤΟ ΑΡΧΕΙΟ: η πρώτη γραφή αυτού
     έψαχνε στο PAGE και έπιανε το ΣΧΟΛΙΟ που τεκμηριώνει την ίδια την
     αφαίρεση. Οι απαγορεύσεις ελέγχονται πάνω στον ΚΩΔΙΚΑ. */
  ok('καμία άδεια κατάσταση δεν στέλνει πια στο ημερολόγιο ως μόνη λύση',
    CODE.indexOf('άνοιξέ το και θα γεμίζει μόνο του') < 0);
  ok('και κάθε μία από τις τέσσερις καταστάσεις κουβαλάει το ΙΔΙΟ κουμπί',
    /pickBtn\(tv\.state\)/.test(CODE) && (CODE.match(/pickBtn\(/g) || []).length === 2);
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
  const cal = E3.api.tonightView();
  is('και γεμίζει μόνο του', cal.state, 'live');
  is('με τα τρία σωστά μαθήματα (σταθερή αρχή 38)', cal.items.map(x => x.subject), ['istoria', 'arxaia', 'latinika']);
  is('και τις ΑΛΗΘΙΝΕΣ τους ώρες', cal.items.map(x => x.at), [915, 975, 1035]);

  /* Ο καθηγητής άλλαξε το τρίτο. Η διόρθωσή ΤΟΥ είναι η αλήθεια. */
  ok('διορθώνει', E3.api.setLessons(E3.api.today(), ['istoria', 'ekthesi']));
  const fix = E3.api.tonightView();
  is('η επιλογή του κερδίζει το ημερολόγιο', fix.state, 'mine');
  is('και είναι ΑΚΡΙΒΩΣ ό,τι είπε — καμία ένωση με το ημερολόγιο', fix.items.map(x => x.subject), ['istoria', 'ekthesi']);
  /* Και μπορεί να την πάρει πίσω: ένα χειριστήριο που δεν αναιρείται δεν είναι
     διόρθωση, είναι μονόδρομος. */
  ok('την ακυρώνει', E3.api.clearLessons(E3.api.today()));
  is('και η μέρα γυρίζει στο ημερολόγιο', E3.api.tonightView().state, 'live');
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
  E3.api.tonightView();
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
  is('και η πόρτα πέφτει τίμια πίσω στο ημερολόγιο', E4.api.tonightView().state, 'unknown');
  ok('⚠️ και ΔΕΝ σβήστηκε — η αποθήκη του δεν είναι ποτέ σε εύρος',
    JSON.parse(E4.store[KEY]).lessons[t].subjects === 'όχι πίνακας');
}

section('4h · φάση 3 · η καλωδίωση που κάνει τη σφραγίδα να ισχύει');
{
  /* ⚠️ ΣΤΑΘΕΡΗ ΑΡΧΗ 35: ένα πεδίο που λείπει από blank() Ή από load() σβήνεται
     σιωπηλά στην επόμενη φόρτωση — και με sync σβήνεται η δουλειά ΑΛΛΗΣ συσκευής. */
  ok('το lessons υπάρχει στο blank()', /function blank\(\)\{ return \{ v:1, tasks:\{\}, samples:\{\}, lessons:\{\}, timetable:\{\} \}; \}/.test(PAGE));
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
    /return state \? \[state\.tasks, state\.samples, state\.lessons, state\.timetable\] : \[\];/.test(PAGE));
  ok('και η ταφόπλακά του είναι στο ΦΩΛΙΑΣΜΕΝΟ μονοπάτι, όπως των εργασιών',
    /tombPath\(KEY, \['lessons'\], dk, ts\)/.test(PAGE));
  /* ⛔ ΑΠΑΝΤΑΕΙ «ΤΙ ΕΙΧΑ», ΠΟΤΕ «ΤΙ ΘΑ ΕΧΩ». Το «αύριο το έχεις» της κατάταξης
     μένει ημερολόγιο· μια χειροκίνητη καταγραφή του παρελθόντος δεν προβλέπει. */
  const cand = (CODE.match(/function candidates\(free\)\{[\s\S]*?\n  \}/) || [''])[0];
  ok('η χειροκίνητη επιλογή ΔΕΝ τροφοδοτεί την πρόβλεψη του αύριο',
    cand.indexOf('myLessons') < 0 && /var tomorrow = lessonsFor\(1\);/.test(cand));
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
  ok('και το σώμα δέχεται εστίαση χωρίς να ζωγραφίζει δαχτυλίδι',
    (PAGE.match(/<div class="hw-sheet" tabindex="-1">/g) || []).length === 3 &&
    /\.hw-sheet\{[^}]*outline:none/.test(PAGE));
  /* ⭐ ΣΤΑΘΕΡΗ ΑΡΧΗ 15: ΚΑΙ ΤΑ ΔΥΟ ΦΥΛΛΑ, ή είναι σύμπτωση με καλή φήμη. Το
     παράθυρο γραψίματος φορούσε το ίδιο δαχτυλίδι από την als-v470 και θα
     έμενε το μόνο που το φοράει. */
  is('ΚΑΝΕΝΑ φύλλο δεν ανοίγει παρακάμπτοντας τον κοινό δρόμο',
    (CODE.match(/showModal\(\)/g) || []).length, 1);
  is('και ΟΛΑ περνούν από αυτόν', (CODE.match(/openSheet\('/g) || []).length, 5);
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
  ok('«δεν ξέρω το ημερολόγιο» ΔΕΝ γράφεται σαν «δεν έχεις μάθημα»',
    PAGE.indexOf('Δεν ξέρω τα σημερινά σου μαθήματα χωρίς το ημερολόγιο') > -1 &&
    PAGE.indexOf('Το ημερολόγιο δεν δείχνει μάθημα σήμερα') > -1);
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

  /* Η πόρτα είναι δηλωμένη, άρα ένα άγνωστο hash δεν ανοίγει τίποτα. */
  ok('το `mathimata` είναι ΔΗΛΩΜΕΝΗ πόρτα', /var DOORS = \{[^}]*mathimata:/.test(PAGE));
  ['hw-door-mathimata', 'hw-lessons4', 'hw-doors', 'hw-doorlink', 'hw-l4grid', 'hw-l4']
    .forEach(c => ok('η κλάση ' + c + ' ορίζεται στο CSS',
      new RegExp('\\.' + c + '[\\s,{:]').test(PAGE)));

  /* Κρυφό παντού, ορατό ΜΟΝΟ πίσω από το δικό του hash. */
  ok('το δωμάτιο είναι κρυφό εξ ορισμού', /\.hw-lessons4\{ display:none/.test(PAGE));
  ok('και ανοίγει μόνο στην πόρτα του',
    /body\.hw-door-mathimata \.hw-lessons4\{ display:block/.test(PAGE));

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
  ok('τα δύο Αρχαία μοιράζονται ΕΝΑ γραπτό, άρα έναν συντελεστή',
    (LADSRC.match(/exam: 'arxaia'/g) || []).length === 3 &&
    (LADSRC.match(/weight: 30/g) || []).length === 3);
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
    const PR = CODE.slice(CODE.indexOf('function renderProgramma('),
                          CODE.indexOf('var whenId = null;'));
    ok('ο ζωγράφος του προγράμματος ΔΕΝ γράφει', !/\bsave\s*\(|setItem/.test(PR));
    ok('και ο σπόρος τρέχει στο BOOT, όχι σε render',
      /reload\(\);[\s\S]{0,400}ttSeedIfEmpty\(\);[\s\S]{0,60}paint\(\);/.test(CODE));
  }
  ok('η κεφαλίδα και η πόρτα λένε το ΙΔΙΟ, από τον ίδιο υπολογισμό',
    /hwL4S'\)\.textContent = say;[\s\S]{0,80}hwDoorsS'\)\.textContent = say;/.test(L4));
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
  ok('αλλά κρύβεται στα μαθήματα',
    /body\.hw-door-mathimata \.hw-grab\{ display:none/.test(PAGE));

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
  ok('η συσσώρευση ζωγραφίζεται κι αυτή, στη νέα της θέση',
    /\n\s{4}renderOver\(pool\);/.test(PAINT) &&
    /<section class="hw-tasks"[\s\S]{0,700}id="hwOver"/.test(PAGE));
}

section('7b · Η ΠΛΟΗΓΗΣΗ — ένα μέρος με δωμάτια');
{
  ok('η γραμμή υπάρχει', PAGE.indexOf('class="hw-nav"') > -1);
  ['#kentro', '#ergasies', '#mathimata'].forEach(h =>
    ok('οδηγεί στο ' + h, PAGE.indexOf('href="' + h + '"') > -1));
  ok('δείχνει ΠΟΥ είσαι', /aria-current/.test(PAGE));
  /* ⛔ Οι ΣΤΙΓΜΕΣ δεν είναι μέρη: το push των 18:00 και το 21:45 έχουν ΕΝΑ
     πράγμα να κάνουν, και η μπάρα τους κρατάει τη μία έξοδο. */
  ok('η πλοήγηση φεύγει στις στιγμές',
    /body\.hw-door-capture \.hw-nav, body\.hw-door-tonight \.hw-nav\{ display:none/.test(PAGE));

  /* ⚠️ ΜΕΤΡΗΜΕΝΟ: οι πόρτες ζουν σε στήλη ~300px. Δύο στήλες τις έκοβαν στη
     μέση («Τα μαθήματά μου 3 έ…»). Η διάταξη του δείγματος ήταν για ΠΛΗΡΕΣ
     πλάτος και δεν μεταφέρεται χωρίς αυτό. */
  ok('οι πόρτες είναι ΜΙΑ στήλη', /\.hw-doors\{ display:grid; grid-template-columns:1fr;/.test(PAGE));
  ok('και είναι ΤΕΣΣΕΡΙΣ μετά το πρόγραμμα', (PAGE.match(/class="hw-doorlink"/g) || []).length === 4);
  ok('η τρίτη είναι το «Απόψε», που αλλιώς θα έμενε χωρίς είσοδο',
    /href="#tonight"[\s\S]{0,60}Απόψε/.test(PAGE));
  /* Κάθε πόρτα λέει τι χρωστάει, από τον ΙΔΙΟ υπολογισμό με την κεφαλίδα της. */
  ok('η πόρτα των εργασιών μετράει τις ανοιχτές', PAGE.indexOf("$('hwDoorsT').textContent") > -1);
  ok('και δεν λέει «0» για καμία', PAGE.indexOf("'καμία ακόμη'") > -1);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

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
    /state\.lessons, state\.timetable\] : \[\]/.test(CODE));
  ok('⚠️ σταθ. 35 — και ζει ΚΑΙ στο blank() ΚΑΙ στον load()',
    /timetable:\{\} \}; \}/.test(PAGE) && /b\.timetable = /.test(PAGE));
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
  ok('η παραγόμενη ημερομηνία δηλώνεται στην οθόνη', /dd\.auto \? ' \(η επόμενη\)' : ''/.test(PAGE));
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
