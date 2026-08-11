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
is('· αρχ', P('αρχ γνωστό').subject, 'arxaia');
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
  is('τα λόγια του μένουν αυτούσια, με τόνους και κεφαλαία', r.title, '4-7');
  is('και η προθεσμία λύνεται κανονικά', r.due, '2026-08-18');
}
is('μια ενότητα χωρίς μάθημα δίνει το μάθημα από το corpus, όχι από εικασία',
  P('gn1 απέξω').subject, 'arxaia');

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
   5 · ΑΔΕΙΟ ≠ ΣΦΑΛΜΑ ≠ ΑΓΝΩΣΤΟ (σταθερή αρχή 10)
   ══════════════════════════════════════════════════════════════════════ */
section('5 · three states of the calendar produce three different sentences');
{
  const sentences = [
    'Από το ημερολόγιό σου, σε αυτή τη συσκευή.',
    'Δεν έχω το ημερολόγιο σε αυτή τη συσκευή',
    'Το ημερολόγιο είναι συνδεδεμένο αλλά δεν το διάβασα ακόμη',
    'Δεν φόρτωσε το gcal.js'
  ];
  sentences.forEach(s => ok('the page carries: “' + s.slice(0, 42) + '…”', PAGE.indexOf(s) > -1));
  ok('all four are distinct strings', new Set(sentences).size === 4);
  ok('a store it could not read is called UNKNOWN, never zero',
    PAGE.indexOf('είναι <b>άγνωστο</b> — όχι μηδέν') > -1);
  ok('a task with no deadline says so rather than inventing one',
    PAGE.indexOf("'χωρίς ημερομηνία'") > -1);
}
/* ⭐ ΟΙ ΠΡΟΤΑΣΕΙΣ ΤΟΥ ΑΔΕΙΟΥ, ΚΛΕΙΔΩΜΕΝΕΣ. Η πρώτη έκδοση αυτής της σελίδας
   έγραφε «0 κομμάτια ζωντανά» και «όλα ζωντανά» για πέντε αποθήκες που δεν
   είχαν ανοίξει ΠΟΤΕ — ένα μηδέν που μοιάζει μέτρηση, και ένα ψέμα με
   καθησυχαστικό τόνο. Φάνηκε μόνο ρεντεράροντας τη σελίδα ΑΔΕΙΑ. */
section('5c · «δεν ξεκίνησε» is never written as a zero');
[
  ['δεν το έχεις ξεκινήσει ακόμη', 'a store that was never opened'],
  ['καμία δεν ξεκίνησε', 'the section header for the same case'],
  ['Άδειο, όχι τελειωμένο.', 'and the recommendation refuses to say «Τελείωσες»'],
  ['Τελείωσες.', 'which it still says when there really is nothing left']
].forEach(pair => ok(pair[1], PAGE.indexOf(pair[0]) > -1));
ok('the four are four different sentences',
  new Set(['δεν το έχεις ξεκινήσει ακόμη', 'καμία δεν ξεκίνησε', 'Άδειο, όχι τελειωμένο.', 'Τελείωσες.']).size === 4);

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

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
