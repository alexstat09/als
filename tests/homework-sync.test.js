/* ══════════════════════════════════════════════════════════════════════
   tests/homework-sync.test.js — ΟΙ ΔΥΟ ΤΡΟΠΟΙ ΠΟΥ ΑΥΤΗ Η ΣΕΛΙΔΑ ΘΑ ΕΧΑΝΕ
   ΔΟΥΛΕΙΑ ΤΟΥ, ΚΑΙ ΚΑΝΕΝΑΣ ΤΟΥΣ ΔΕΝ ΣΚΑΕΙ.

   Α · ΣΤΑΘΕΡΗ ΑΡΧΗ 31 — Ο ΧΑΡΤΗΣ ΕΓΓΡΑΦΩΝ.
       Το `mergeObject` του sync.js κατεβαίνει ως τα βαθμωτά και λύνει κάθε
       διαφορά με `out[key] = rv` — «κερδίζει το remote, για να συγκλίνει».
       Άρα μια εργασία που ΥΠΑΡΧΕΙ ήδη στο cloud δεν έχει καμία τοπική αλλαγή
       που να επιβιώνει: γράφεις, το pull φέρνει το παλιό αντίγραφο πίσω, το
       applyLocal το γράφει στον δίσκο, και ο ίδιος κύκλος σπρώχνει την
       επαναφορά προς τα πάνω. Ντετερμινιστικό, όχι κούρσα — και ΚΡΥΒΕΤΑΙ,
       γιατί η ΠΡΩΤΗ εγγραφή κάθε εγγραφής δουλεύει πάντα.

   Β · ΣΤΑΘΕΡΗ ΑΡΧΗ 32 — ΤΟ ΠΑΡΑΘΥΡΟ ΠΡΙΝ ΥΠΑΡΞΕΙ Η ΜΗΧΑΝΗ.
       Το sync.js σφραγίζει ταφόπλακες από τον interceptor του setItem, κι
       εκείνος υπάρχει μόνο αφού τρέξει το initCloudSync (0,5–3s σε κρύα
       εκκίνηση PWA, ως 12s). Η σελίδα ζωγραφίζει διαδραστική λίστα στο boot.
       Ένα ✕ σε εκείνο το παράθυρο δεν άφηνε ταφόπλακα, το πρώτο pull το
       ξανάφερνε, και το push έκανε την ανάσταση αλήθεια του cloud.

   Οδηγεί το ΑΛΗΘΙΝΟ sync.js, το ΑΛΗΘΙΝΟ study-stamp.js και τους ΑΛΗΘΙΝΟΥΣ
   βοηθούς κομμένους από τη homework.html — ποτέ αντίγραφο κανενός, γιατί ένα
   αντίγραφο συμφωνεί με κάθε bug τέλεια.

   ⚠️ ΑΝΑΙΡΕΣΗ ΤΗΣ ΔΙΟΡΘΩΣΗΣ ΠΡΕΠΕΙ ΝΑ ΤΟ ΚΟΚΚΙΝΙΣΕΙ: βγάλε το study-stamp
   από το save() και πέφτει το Α· βγάλε το tombTask() από το dropTask() και
   πέφτει το Β.
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
const SYNC = fs.readFileSync(path.join(ALS, 'sync.js'), 'utf8');

const START = '  function $(id){ return document.getElementById(id); }';
const END = '     ΖΩΓΡΑΦΙΚΗ';
const BODY = PAGE.slice(PAGE.indexOf(START), PAGE.lastIndexOf('/* ═', PAGE.indexOf(END)));
if (!BODY) throw new Error('homework.html no longer has the block this suite slices');

const CONSTS = ['KEY', 'PKEY', 'APP'].map(n => {
  const m = PAGE.match(new RegExp('var\\s+' + n + '\\s*=\\s*\'([^\']+)\''));
  if (!m) throw new Error('homework.html no longer declares ' + n);
  return m[0] + ';';
});
const KEY = 'hw:v1', APP = 'homework', TOMB = '__synctomb__' + APP;

section('0 · the two ends of the protocol agree on the key');
ok('homework.html derives the tombstone key from the appKey, like sync.js does',
  PAGE.indexOf("var TOMB_KEY = '__synctomb__' + APP;") > -1);
ok("sync.js derives it the same way", SYNC.indexOf("'__synctomb__' + appKey") > -1);
ok('sync.js exempts that key from its own interception', /k === TOMB_KEY\) return false/.test(SYNC));
ok('the page stamps a tombstone for its NESTED task map, not just top level',
  /tombPath\(KEY,\s*\['tasks'\]/.test(PAGE));
ok('and mirrors the rule verbatim: T = max(now, ts + 1)',
  /Math\.max\(cur, Date\.now\(\), \(\+ts \|\| 0\) \+ 1\)/.test(PAGE));

/* ── ένα Supabase που συμπεριφέρεται σαν το αληθινό, με ΜΙΑ γραμμή ───── */
function makeEnv(cloudRow) {
  const store = {};
  const localStorage = {
    get length() { return Object.keys(store).length; },
    key(i) { return Object.keys(store)[i]; },
    getItem(k) { return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
    setItem(k, v) { store[k] = String(v); },
    removeItem(k) { delete store[k]; }
  };
  const cloud = {
    row: cloudRow ? JSON.parse(JSON.stringify(cloudRow)) : null,
    stamp: '2026-08-11T10:00:00.000Z',
    pushes: []
  };
  function builder() {
    const b = {
      select() { return b; },
      eq() { return b; },
      limit() { return Promise.resolve({ data: [], error: null }); },
      maybeSingle() {
        return Promise.resolve({
          data: cloud.row ? { data: cloud.row, updated_at: cloud.stamp } : null, error: null
        });
      },
      upsert(row) {
        cloud.row = JSON.parse(JSON.stringify(row.data));
        cloud.stamp = row.updated_at;
        cloud.pushes.push(row.data);
        return Promise.resolve({ error: null });
      }
    };
    return b;
  }
  const supa = {
    from() { return builder(); },
    auth: {
      getSession() { return Promise.resolve({ data: { session: { user: { id: 'alex-uuid' }, access_token: 'jwt' } } }); },
      onAuthStateChange() {}
    },
    channel() { const c = { on() { return c; }, subscribe() { return c; } }; return c; }
  };
  function node() {
    return {
      textContent: '', innerHTML: '', value: '', style: {}, open: false, files: null,
      classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
      addEventListener() {}, querySelectorAll() { return []; }, querySelector() { return null; },
      setAttribute() {}, getAttribute() { return null; }, removeAttribute() {},
      showModal() {}, close() {}, click() {}, appendChild() {}
    };
  }
  const nodes = {};
  const document = {
    getElementById(id) { return (nodes[id] || (nodes[id] = node())); },
    createElement() { return node(); },
    addEventListener() {}, hidden: false
  };
  /* window === global, όπως στον browser. */
  const win = {
    localStorage, document, supabase: { createClient: () => supa },
    console: { log() {}, warn() {}, error() {} },
    setTimeout, clearTimeout, setInterval: () => 0, clearInterval,
    addEventListener() {}, removeEventListener() {},
    JSON, Date, Object, Array, String, Number, Math, Promise, RegExp,
    isNaN, isFinite, encodeURIComponent
  };
  win.window = win; win.self = win; win.globalThis = win;
  const ctx = vm.createContext(win);
  vm.runInContext(SYNC, ctx, { filename: 'sync.js' });
  vm.runInContext(fs.readFileSync(path.join(ALS, 'ladders.js'), 'utf8'), ctx, { filename: 'ladders.js' });
  vm.runInContext(fs.readFileSync(path.join(ALS, 'study-stamp.js'), 'utf8'), ctx, { filename: 'study-stamp.js' });
  const api = vm.runInContext(
    '(function(){' + CONSTS.join('\n') + '\n' + BODY +
    '\nreturn { reload:reload, save:save, addTask:addTask, dropTask:dropTask, sweepDone:sweepDone,' +
    ' taskList:taskList, myLessons:myLessons, setLessons:setLessons, clearLessons:clearLessons,' +
    ' state:function(){ return state; } };})()',
    ctx, { filename: 'homework.html:script' });
  return { ctx, store, cloud, api, localStorage };
}

const sleep = ms => new Promise(r => setTimeout(r, ms));
function startEngine(env) {
  env.ctx.window.initCloudSync({ appKey: APP, syncedKeys: [KEY, 'hw:pics'], onApplied() {} });
}
function tasksIn(env) {
  const s = JSON.parse(env.store[KEY] || '{}');
  return Object.keys(s.tasks || {}).sort();
}
function cloudTasks(env) {
  const s = (env.cloud.row && env.cloud.row[KEY]) || {};
  return Object.keys(s.tasks || {}).sort();
}
function tombsFor(env) {
  const t = JSON.parse(env.store[TOMB] || '{}');
  return Object.keys((t[KEY] && t[KEY].tasks) || {}).sort();
}
function task(id, ts, extra) {
  return Object.assign({
    id, ts, _ts: ts, subject: 'istoria', title: 'b2 απέξω', due: '2026-08-12',
    kind: 'apexo', link: null, est: null, done: 0, src: null, note: '', elapsed: 0
  }, extra || {});
}

(async function main() {
  /* ⚠️ ΣΧΕΤΙΚΑ ΜΕ ΤΟ ΑΛΗΘΙΝΟ ΡΟΛΟΪ, ΠΟΤΕ ΜΙΑ ΚΑΡΦΩΤΗ ΗΜΕΡΟΜΗΝΙΑ. Το
     study-stamp.js σφραγίζει με `Date.now()`, οπότε ένα fixture καρφωμένο στο
     μέλλον θα έκανε κάθε φρέσκια σφραγίδα να χάνει από το cloud — και το test
     θα κατηγορούσε σωστό κώδικα. Μια ώρα πριν: το ίδιο σενάριο, με το ρολόι
     να δείχνει προς τη σωστή μεριά. */
  const T = Date.now() - 3600e3;

  /* ══════════════════════════════════════════════════════════════════
     Α · Η ΔΕΥΤΕΡΗ ΑΛΛΑΓΗ ΣΤΗΝ ΙΔΙΑ ΕΡΓΑΣΙΑ ΕΠΙΒΙΩΝΕΙ ΤΗΣ ΣΥΓΧΩΝΕΥΣΗΣ
     ══════════════════════════════════════════════════════════════════ */
  section('Α · σταθερή αρχή 31 — a SECOND edit to the same task survives a merge');
  {
    /* Το cloud κρατάει ήδη την εργασία, ανοιχτή, με παλιά σφραγίδα. Αυτό είναι
       ΑΚΡΙΒΩΣ η σκηνή που έκρυβε το bug: η πρώτη εγγραφή μιας εργασίας δουλεύει
       πάντα (το κλειδί λείπει από το cloud → παίρνει τον τοπικό κλάδο), οπότε
       μόνο η ΔΕΥΤΕΡΗ γυρνάει πίσω. */
    const old = task('t1', T - 60000, { done: 0, title: 'b2 απέξω' });
    const env = makeEnv({ 'hw:v1': { v: 1, tasks: { t1: JSON.parse(JSON.stringify(old)) }, samples: {} } });
    env.store[KEY] = JSON.stringify({ v: 1, tasks: { t1: JSON.parse(JSON.stringify(old)) }, samples: {} });
    env.api.reload();
    startEngine(env);
    await sleep(120);

    /* Την τσεκάρει «έγινε» — δεύτερη αλλαγή σε εγγραφή που ΥΠΑΡΧΕΙ στο cloud. */
    const st = env.api.state();
    st.tasks.t1.done = Date.now();
    ok('the page marked it done locally', env.api.save() === true);
    await sleep(900);   /* schedulePush 400ms → pull + merge + push */

    const local = JSON.parse(env.store[KEY]).tasks.t1;
    ok('ΤΟ «ΕΓΙΝΕ» ΜΕΝΕΙ ΕΓΙΝΕ στη συσκευή', !!local.done);
    ok('και η σφραγίδα προχώρησε (αυτό είναι που το κάνει να επιβιώνει)', local._ts > old._ts);
    const up = env.cloud.row[KEY].tasks.t1;
    ok('ΚΑΙ ΤΟ CLOUD ΤΟ ΕΜΑΘΕ', !!up.done);
  }
  {
    /* Ο έλεγχος-καθρέφτης: μια εγγραφή ΧΩΡΙΣ `_ts` χάνει από το cloud. Αυτό
       είναι το bug, αναπαραγμένο πάνω στο ΑΛΗΘΙΝΟ sync.js — η απόδειξη ότι το
       παραπάνω μετράει κάτι πραγματικό και όχι τον εαυτό του. */
    const cloudOld = { id: 't2', ts: T - 60000, done: 0, title: 'παλιό' };
    const env = makeEnv({ 'hw:v1': { v: 1, tasks: { t2: cloudOld }, samples: {} } });
    env.store[KEY] = JSON.stringify({ v: 1, tasks: { t2: { id: 't2', ts: T - 60000, done: T, title: 'παλιό' } }, samples: {} });
    startEngine(env);
    await sleep(900);
    const local = JSON.parse(env.store[KEY]).tasks.t2;
    is('ΧΩΡΙΣ σφραγίδα, το cloud ξεκάνει το «έγινε» — αυτό είναι το bug', local.done, 0);
  }

  {
    /* ⭐⭐ Η ΣΚΗΝΗ ΠΟΥ ΧΑΝΕΙ ΠΡΑΓΜΑΤΙΚΑ ΔΟΥΛΕΙΑ, ΚΑΙ ΕΙΝΑΙ Η ΜΟΝΗ ΠΟΥ ΤΟ
       ΑΠΟΔΕΙΚΝΥΕΙ. Στις δύο παραπάνω σκηνές οι δύο πλευρές έχουν την ΙΔΙΑ
       σφραγίδα, οπότε το LWW του sync.js σπάει την ισοπαλία ΠΡΟΣ ΤΑ ΤΟΠΙΚΑ και
       η αλλαγή θα επιβίωνε ακόμη και χωρίς φρέσκια σφραγίδα — δηλαδή θα
       περνούσαν με ΑΝΑΙΡΕΜΕΝΗ τη διόρθωση, που είναι ένα test που δεν μετράει
       τίποτα.
       Η αληθινή σκηνή έχει ΔΥΟ ΣΥΣΚΕΥΕΣ: το κινητό έγραψε στο φροντιστήριο και
       έσπρωξε (σφραγίδα ΝΕΟΤΕΡΗ), το laptop κρατάει ένα παλιό αντίγραφο και
       γράφει από πάνω του. Χωρίς φρέσκια σφραγίδα, το laptop χάνει σιωπηλά —
       σωστή οθόνη, σωστό localStorage, εξαφανισμένο σε 400ms. */
    const localTs = T, cloudTs = T + 1800e3;      /* το κινητό έγραψε μισή ώρα μετά */
    const env = makeEnv({ 'hw:v1': { v: 1, tasks: { t3: task('t3', T, { _ts: cloudTs, note: 'από το κινητό' }) }, samples: {} } });
    env.store[KEY] = JSON.stringify({ v: 1, tasks: { t3: task('t3', T, { _ts: localTs, note: 'παλιό αντίγραφο' }) }, samples: {} });
    env.api.reload();
    startEngine(env);
    await sleep(120);

    const st = env.api.state();
    st.tasks.t3.done = Date.now();
    st.tasks.t3.note = 'το τσέκαρα στο laptop';
    env.api.save();
    await sleep(900);

    const local = JSON.parse(env.store[KEY]).tasks.t3;
    ok('ΤΟ LAPTOP ΝΙΚΑΕΙ ΤΟ ΝΕΟΤΕΡΟ CLOUD, γιατί η σφραγίδα του είναι φρέσκια', !!local.done);
    is('και η αλλαγή του δεν χάθηκε στη διαδρομή', local.note, 'το τσέκαρα στο laptop');
    ok('η φρέσκια σφραγίδα ΚΥΡΙΑΡΧΕΙ πάνω στη σφραγίδα του κινητού', local._ts > cloudTs);
    ok('και το cloud πήρε τη νεότερη αλήθεια', !!env.cloud.row[KEY].tasks.t3.done);
  }

  /* ══════════════════════════════════════════════════════════════════
     Β · ΤΟ ✕ ΠΡΙΝ ΞΕΚΙΝΗΣΕΙ Η ΜΗΧΑΝΗ
     ══════════════════════════════════════════════════════════════════ */
  section('Β · ✕ tapped while the engine is already running (was always fine)');
  {
    const two = { a1: task('a1', T), a2: task('a2', T) };
    const env = makeEnv({ 'hw:v1': { v: 1, tasks: JSON.parse(JSON.stringify(two)), samples: {} } });
    env.store[KEY] = JSON.stringify({ v: 1, tasks: JSON.parse(JSON.stringify(two)), samples: {} });
    env.api.reload();
    startEngine(env);
    await sleep(120);
    is('both tasks are there to begin with', tasksIn(env), ['a1', 'a2']);
    env.api.dropTask('a2');
    await sleep(900);
    is('local', tasksIn(env), ['a1']);
    is('his cloud row', cloudTasks(env), ['a1']);
    is('tombstone, on the NESTED path', tombsFor(env), ['a2']);
  }

  section('Β · ✕ tapped BEFORE the engine starts — THE BUG (als-v469, new shape)');
  {
    const two = { b1: task('b1', T), b2: task('b2', T) };
    const env = makeEnv({ 'hw:v1': { v: 1, tasks: JSON.parse(JSON.stringify(two)), samples: {} } });
    env.store[KEY] = JSON.stringify({ v: 1, tasks: JSON.parse(JSON.stringify(two)), samples: {} });
    env.api.reload();
    /* ΚΑΜΙΑ ΜΗΧΑΝΗ ΑΚΟΜΗ. Η σελίδα ζωγραφίζει διαδραστική λίστα στο boot, και
       το ✕ έρχεται μέσα στο πρώτο δευτερόλεπτο. */
    env.api.dropTask('b2');
    is('the delete lands on disk immediately', tasksIn(env), ['b1']);
    is('AND the page stamped the tombstone itself', tombsFor(env), ['b2']);

    startEngine(env);            /* η συνεδρία φτάνει δύο δευτερόλεπτα αργότερα */
    await sleep(900);
    is('the first pull does NOT resurrect it', tasksIn(env), ['b1']);
    is('and the push does not make the resurrection the cloud’s truth', cloudTasks(env), ['b1']);
  }

  section('Β · the BULK delete needs the same rule, not just the ✕');
  {
    const three = { c1: task('c1', T, { done: T }), c2: task('c2', T, { done: T }), c3: task('c3', T) };
    const env = makeEnv({ 'hw:v1': { v: 1, tasks: JSON.parse(JSON.stringify(three)), samples: {} } });
    env.store[KEY] = JSON.stringify({ v: 1, tasks: JSON.parse(JSON.stringify(three)), samples: {} });
    env.api.reload();
    is('«καθάρισε τα τελειωμένα» removed two', env.api.sweepDone(), 2);
    is('both are tombstoned, not just filtered', tombsFor(env), ['c1', 'c2']);
    startEngine(env);
    await sleep(900);
    is('and the cloud keeps only the open one', cloudTasks(env), ['c3']);
  }

  section('Β · a delete that could not be WRITTEN must not be tombstoned');
  {
    /* Μια ταφόπλακα πάνω σε κάτι που είναι ακόμη εκεί σβήνει κάτι που κράτησε
       ο χρήστης. Η σφραγίδα μπαίνει ΜΟΝΟ μετά από επιβεβαιωμένο persist. */
    const one = { d1: task('d1', T) };
    const env = makeEnv({ 'hw:v1': { v: 1, tasks: JSON.parse(JSON.stringify(one)), samples: {} } });
    env.store[KEY] = JSON.stringify({ v: 1, tasks: JSON.parse(JSON.stringify(one)), samples: {} });
    env.api.reload();
    const realSet = env.ctx.window.localStorage.setItem;
    env.ctx.window.localStorage.setItem = function (k, v) {
      if (k === KEY) { const e = new Error('QuotaExceededError'); e.name = 'QuotaExceededError'; throw e; }
      return realSet.call(this, k, v);
    };
    env.api.dropTask('d1');
    env.ctx.window.localStorage.setItem = realSet;
    is('the task is still on disk, because the write failed', tasksIn(env), ['d1']);
    is('and NOTHING was tombstoned', tombsFor(env), []);
    is('the in-memory state was rolled back to match the disk', Object.keys(env.api.state().tasks), ['d1']);
  }

  /* ══════════════════════════════════════════════════════════════════
     Γ · ⭐⭐ ΦΑΣΗ 3 — ΜΙΑ ΔΙΟΡΘΩΣΗ ΤΩΝ ΣΗΜΕΡΙΝΩΝ ΔΕΝ ΓΙΝΕΤΑΙ ΠΡΟΣΘΕΣΗ

     Αυτή είναι Η σκηνή που κάνει το σχήμα του §7.1 υποχρεωτικό, και ο λόγος
     που το `lessons` είναι ΧΑΡΤΗΣ ΕΓΓΡΑΦΩΝ αντί για σκέτο πίνακα από strings.
     Ένας πίνακας από strings πέφτει στο `allPrim` του `mergeArray` και
     ΕΝΩΝΕΤΑΙ — άρα «διόρθωσα, ήταν Λατινικά και όχι Ιστορία» γυρίζει από το
     cloud ως «Ιστορία ΚΑΙ Λατινικά». Το βράδυ των 21:45 θα ξαναδιάβαζε ένα
     μάθημα που δεν έκανε ποτέ, και τίποτα στην οθόνη δεν θα το έλεγε.
     ══════════════════════════════════════════════════════════════════ */
  const DK = '2026-08-14';
  function lessonsIn(env) {
    const s = JSON.parse(env.store[KEY] || '{}');
    return ((s.lessons || {})[DK] || {}).subjects || null;
  }

  section('Γ · φάση 3 — a CORRECTION on a second device stays a correction');
  {
    /* Το κινητό έγραψε [ιστορία] και έσπρωξε ΜΙΣΗ ΩΡΑ ΜΕΤΑ από την τελευταία
       γνωστή κατάσταση του laptop — δηλαδή το cloud είναι ΝΕΟΤΕΡΟ. Μετά ο
       Αλεξ κάθεται στο laptop και διορθώνει. Χωρίς φρέσκια σφραγίδα, το laptop
       χάνει σιωπηλά· χωρίς ΕΓΓΡΑΦΗ (σκέτος πίνακας), κερδίζουν ΚΑΙ ΤΑ ΔΥΟ. */
    const cloudTs = T + 1800e3;
    const env = makeEnv({ 'hw:v1': { v: 1, tasks: {}, samples: {},
      lessons: { [DK]: { subjects: ['istoria'], _ts: cloudTs } } } });
    env.store[KEY] = JSON.stringify({ v: 1, tasks: {}, samples: {},
      lessons: { [DK]: { subjects: ['istoria'], _ts: T } } });
    env.api.reload();
    startEngine(env);
    await sleep(120);

    ok('η διόρθωση γράφτηκε', env.api.setLessons(DK, ['latinika']));
    await sleep(900);          /* schedulePush 400ms → pull + merge + push */

    is('⭐ ΤΟ LAPTOP ΚΡΑΤΑΕΙ ΑΚΡΙΒΩΣ ΟΣΑ ΕΙΠΕ — καμία ένωση', lessonsIn(env), ['latinika']);
    is('ΚΑΙ ΤΟ CLOUD ΤΟ ΕΜΑΘΕ ΩΣ ΔΙΟΡΘΩΣΗ', env.cloud.row[KEY].lessons[DK].subjects, ['latinika']);
    ok('γιατί η σφραγίδα της μέρας προχώρησε πάνω από του κινητού',
      +JSON.parse(env.store[KEY]).lessons[DK]._ts > cloudTs);
  }

  section('Γ · ο καθρέφτης — ΧΩΡΙΣ σφραγίδα, η ίδια σκηνή ΕΝΩΝΕΙ (αυτό είναι το bug)');
  {
    /* Η απόδειξη ότι το παραπάνω μετράει κάτι πραγματικό και όχι τον εαυτό του:
       η ΙΔΙΑ σκηνή, με την εγγραφή της μέρας ΧΩΡΙΣ `_ts`, πάνω στο ΑΛΗΘΙΝΟ
       sync.js. Το `mergeObject` δεν σταματάει στην εγγραφή, κατεβαίνει ως τον
       πίνακα, και ο πίνακας από strings ΕΝΩΝΕΤΑΙ. */
    const env = makeEnv({ 'hw:v1': { v: 1, tasks: {}, samples: {},
      lessons: { [DK]: { subjects: ['istoria'] } } } });
    env.store[KEY] = JSON.stringify({ v: 1, tasks: {}, samples: {},
      lessons: { [DK]: { subjects: ['latinika'] } } });
    startEngine(env);
    await sleep(900);
    is('ΧΩΡΙΣ σφραγίδα η διόρθωση γίνεται ΠΡΟΣΘΕΣΗ — αυτό είναι το bug',
      lessonsIn(env), ['istoria', 'latinika']);
  }

  section('Γ · «δεν είχα μάθημα» επιβιώνει κι αυτό — ένα άδειο ΔΕΝ είναι απουσία');
  {
    /* Το πιο εύθραυστο σχήμα: ο τοπικός πίνακας είναι ΑΔΕΙΟΣ. Ένα `mergeArray`
       που κατέβαινε ως εδώ θα έδινε πίσω ΟΛΟΚΛΗΡΟ τον πίνακα του cloud, και η
       δήλωσή του «σήμερα δεν είχα μάθημα» θα εξαφανιζόταν αθόρυβα. */
    const env = makeEnv({ 'hw:v1': { v: 1, tasks: {}, samples: {},
      lessons: { [DK]: { subjects: ['istoria', 'arxaia'], _ts: T + 1800e3 } } } });
    env.store[KEY] = JSON.stringify({ v: 1, tasks: {}, samples: {},
      lessons: { [DK]: { subjects: ['istoria', 'arxaia'], _ts: T } } });
    env.api.reload();
    startEngine(env);
    await sleep(120);
    ok('το λέει', env.api.setLessons(DK, []));
    await sleep(900);
    is('και το άδειο ΜΕΝΕΙ άδειο', lessonsIn(env), []);
    is('σε κάθε συσκευή', env.cloud.row[KEY].lessons[DK].subjects, []);
  }

  section('Γ · η ακύρωση σφραγίζεται, αλλιώς το πρώτο pull την ξανακάνει επιλογή');
  {
    const env = makeEnv({ 'hw:v1': { v: 1, tasks: {}, samples: {},
      lessons: { [DK]: { subjects: ['istoria'], _ts: T } } } });
    env.store[KEY] = JSON.stringify({ v: 1, tasks: {}, samples: {},
      lessons: { [DK]: { subjects: ['istoria'], _ts: T } } });
    env.api.reload();
    /* ΚΑΜΙΑ ΜΗΧΑΝΗ ΑΚΟΜΗ — σταθερή αρχή 32, το ίδιο παράθυρο με το ✕. */
    ok('«άσε το ημερολόγιο» πριν ξεκινήσει ο συγχρονισμός', env.api.clearLessons(DK));
    const t = JSON.parse(env.store[TOMB] || '{}');
    is('η σελίδα σφράγισε μόνη της, στο ΦΩΛΙΑΣΜΕΝΟ μονοπάτι',
      Object.keys((t[KEY] && t[KEY].lessons) || {}), [DK]);
    startEngine(env);
    await sleep(900);
    is('και το pull ΔΕΝ την ανασταίνει', lessonsIn(env), null);
    ok('ούτε το push την ξαναγράφει στο cloud',
      !((env.cloud.row[KEY].lessons || {})[DK]));
  }

  section('Γ · μια ακύρωση που ΔΕΝ γράφτηκε δεν σφραγίζεται ποτέ');
  {
    const env = makeEnv({ 'hw:v1': { v: 1, tasks: {}, samples: {},
      lessons: { [DK]: { subjects: ['istoria'], _ts: T } } } });
    env.store[KEY] = JSON.stringify({ v: 1, tasks: {}, samples: {},
      lessons: { [DK]: { subjects: ['istoria'], _ts: T } } });
    env.api.reload();
    const realSet = env.ctx.window.localStorage.setItem;
    env.ctx.window.localStorage.setItem = function (k, v) {
      if (k === KEY) { const e = new Error('QuotaExceededError'); e.name = 'QuotaExceededError'; throw e; }
      return realSet.call(this, k, v);
    };
    is('η ακύρωση αναφέρει αποτυχία', env.api.clearLessons(DK), false);
    env.ctx.window.localStorage.setItem = realSet;
    is('η επιλογή είναι ακόμη στον δίσκο', lessonsIn(env), ['istoria']);
    is('και στη μνήμη — καμία απόκλιση οθόνης/δίσκου', env.api.myLessons(DK), ['istoria']);
    is('και ΤΙΠΟΤΑ δεν σφραγίστηκε',
      Object.keys(((JSON.parse(env.store[TOMB] || '{}'))[KEY] || {}).lessons || {}), []);
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
