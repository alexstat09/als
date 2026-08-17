/* ══════════════════════════════════════════════════════════════════════
   tests/istoria-plag-sync.test.js

   ⭐⭐ ΔΥΟ ΑΠΩΛΕΙΕΣ ΠΟΥ ΕΧΟΥΝ ΗΔΗ ΣΥΜΒΕΙ ΣΕ ΑΥΤΟ ΤΟ REPO, ΤΩΡΑ ΣΕ ΝΕΟ ΣΧΗΜΑ.

   1 · ΣΤΑΘΕΡΗ ΑΡΧΗ 31 — Ο ΠΛΑΓΙΟΤΙΤΛΟΣ ΕΙΝΑΙ ΦΩΛΙΑΣΜΕΝΟΣ ΧΑΡΤΗΣ ΜΕ ΒΑΘΜΩΤΑ.
      Ακριβώς σαν το `units`, που κόστισε την als-v468: ο Αλεξ απήγγειλε, η
      σελίδα είπε «τέλεια, ξανά σε 10 μέρες», και μόλις γύρισε πίσω το σπίτι
      έλεγε «έληξε χθες». Το `mergeObject` κρατάει το ΑΠΟΜΑΚΡΥΣΜΕΝΟ βαθμωτό
      για να συγκλίνει, οπότε ΚΑΘΕ δεύτερη απαγγελία κάθε πλαγιότιτλου
      αναιρείται σε ~400ms. Ντετερμινιστικά, όχι race.

   2 · ΣΤΑΘΕΡΗ ΑΡΧΗ 32 — ΤΟ ✕ ΠΡΙΝ ΞΕΚΙΝΗΣΕΙ Ο ENGINE.
      Η als-v469: η Chrissie πατούσε ✕ και η συνεδρία ξαναγύριζε ένα
      δευτερόλεπτο μετά, γιατί ο interceptor του `sync.js` δεν υπήρχε ακόμη
      και η διαγραφή δεν άφηνε ταφόπλακα. Αυτή η σελίδα ζωγραφίζει ΠΛΗΡΩΣ
      διαδραστική ραχοκοκαλιά στο boot, άρα έχει το ίδιο παράθυρο.

   ⚠️ ΟΧΙ ΠΡΟΣΟΜΟΙΩΣΗ ΤΟΥ MERGE. Τρέχει το ΑΛΗΘΙΝΟ `sync.js` και το ΑΛΗΘΙΝΟ
   `study-stamp.js` σε vm — το bug ΗΤΑΝ στο πραγματικό merge, και ένα
   αντίγραφο του κανόνα μέσα στο test θα συμφωνούσε με το λάθος τέλεια.

   node tests/istoria-plag-sync.test.js
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const ALS = path.join(__dirname, '..');

let pass = 0, fail = 0;
const is = (n, g, w) => {
  const ok = JSON.stringify(g) === JSON.stringify(w);
  ok ? pass++ : fail++;
  console.log((ok ? '  ✓ ' : '  ✗ FAIL ') + n + (ok ? '' : `\n      got  ${JSON.stringify(g)}\n      want ${JSON.stringify(w)}`));
};
const ok = (n, c) => is(n, !!c, true);
const section = s => console.log('\n' + s);

const DAY = 86400000;
const NOW = Date.parse('2026-08-12T20:00:00Z');
const KEY = 'ist:v1', APP = 'istoria', TOMB = '__synctomb__' + APP;

/* ── το ΑΛΗΘΙΝΟ study-stamp.js ────────────────────────────────────── */
function loadStamp() {
  const box = { window: {}, JSON, Object, Array, Date, Math, String, Number };
  box.window.window = box.window;
  vm.createContext(box);
  vm.runInContext(fs.readFileSync(path.join(ALS, 'study-stamp.js'), 'utf8'), box, { filename: 'study-stamp.js' });
  return box.window.StudyStamp;
}
const StudyStamp = loadStamp();

/* Η σελίδα σε μικρογραφία: ΤΟ ΙΔΙΟ σχήμα και ο ΙΔΙΟΣ κύκλος
   load → seed → μεταλλαγή → stamp → setItem, με τους ΤΡΕΙΣ χάρτες + τον ρυθμό. */
function makePage(store) {
  let state = null, STAMP = null;
  function load() {
    let s = null;
    try { s = JSON.parse(store.get(KEY) || 'null'); } catch (e) {}
    const b = { v: 1, units: {}, els: {}, days: [], heard: {}, plag: {}, pace: { secs: 0, els: 0 } };
    if (s && typeof s === 'object') {
      for (const k in s) if (Object.prototype.hasOwnProperty.call(s, k)) b[k] = s[k];
      b.units = s.units || {}; b.els = s.els || {}; b.days = s.days || [];
      b.heard = s.heard || {}; b.plag = s.plag || {};
      b.pace = (s.pace && typeof s.pace === 'object') ? s.pace : { secs: 0, els: 0 };
    }
    return b;
  }
  function reload() {
    state = load();
    if (!STAMP) STAMP = StudyStamp(
      () => (state ? [state.units, state.els, state.plag, { pace: state.pace }] : []),
      (i, k, rec) => {
        if (i === 0) return rec.last || rec.learnedAt || 0;
        if (i === 1) { const p = state.units[k.split(':')[0]]; return p ? (p.last || p.learnedAt || 0) : 0; }
        if (i === 2) return rec.last || rec.learnedAt || rec.ts || 0;
        return 0;
      }
    );
    STAMP.seed();
  }
  function save(now) { STAMP.stamp(now); store.set(KEY, JSON.stringify(state)); }
  /* Η ΑΚΡΙΒΩΣ ίδια ταφόπλακα με τη σελίδα — ο κανόνας αντιγράφεται ΚΑΤΑ ΛΕΞΗ. */
  function tombPlag(id, ts) {
    let t = {};
    try { t = JSON.parse(store.get(TOMB) || '{}') || {}; } catch (e) { t = {}; }
    let node = t[KEY]; if (!node || typeof node !== 'object') { node = {}; t[KEY] = node; }
    let nx = node['plag']; if (!nx || typeof nx !== 'object') { nx = {}; node['plag'] = nx; }
    const cr = (typeof nx[id] === 'number') ? nx[id] : 0;
    nx[id] = Math.max(cr, NOW, (+ts || 0) + 1);
    store.set(TOMB, JSON.stringify(t));
  }
  return {
    reload, save, tombPlag,
    get state() { return state; },
    plag(id) {
      if (!state.plag[id]) state.plag[id] = { id: id, ord: 1, ts: NOW - 20 * DAY, title: 'τίτλος', picks: [], drop: [], tables: [], note: '', learnedAt: 0, reviews: 0, due: 0, best: 0, last: 0, runs: 0, claimed: 0 };
      return state.plag[id];
    }
  };
}

/* ── το ΑΛΗΘΙΝΟ sync.js, με ένα cloud που θυμάται ─────────────────── */
function makeSync({ store, cloudRow }) {
  const box = {
    console: { warn() {}, log() {} }, JSON, Object, Array, Date, Math, String, Number, Promise,
    localStorage: {
      getItem: k => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, String(v)),
      removeItem: k => store.delete(k),
      get length() { return store.size; },
      key: i => [...store.keys()][i]
    },
    setTimeout: () => 0, clearTimeout() {}, setInterval: () => 0,
    fetch: () => Promise.resolve({ ok: true, status: 200 }),
    document: { addEventListener() {} },
    navigator: { onLine: true }
  };
  box.window = box;
  box.addEventListener = () => {};
  const cloud = { row: JSON.parse(JSON.stringify(cloudRow)), pushes: 0 };
  const q = () => ({
    select() { return this; }, eq() { return this; }, limit() { return Promise.resolve({ error: null }); },
    maybeSingle() { return Promise.resolve({ data: { data: cloud.row, updated_at: 'r1' }, error: null }); },
    upsert(row) { cloud.pushes++; cloud.row = JSON.parse(JSON.stringify(row.data)); return Promise.resolve({ error: null }); }
  });
  box.supabase = {
    createClient: () => ({
      from: q, channel: () => ({ on() { return this; }, subscribe() {} }),
      auth: {
        getSession: () => Promise.resolve({ data: { session: { access_token: 'jwt', user: { id: 'u1' } } } }),
        onAuthStateChange() {}
      }
    })
  };
  vm.createContext(box);
  vm.runInContext(fs.readFileSync(path.join(ALS, 'sync.js'), 'utf8'), box, { filename: 'sync.js' });
  box.initCloudSync({ appKey: APP, syncedKeys: [KEY] });
  const settle = () => new Promise(r => setImmediate(() => setImmediate(() => setImmediate(() => setImmediate(() => setImmediate(r))))));
  return { cloud, settle };
}

const blankStore = extra => Object.assign({ v: 1, units: {}, els: {}, days: [], heard: {}, plag: {}, pace: { secs: 0, els: 0 } }, extra || {});

(async () => {

  /* ══ 1 · Η ΔΕΥΤΕΡΗ ΑΠΑΓΓΕΛΙΑ ΤΟΥ ΠΛΑΓΙΟΤΙΤΛΟΥ ════════════════════ */
  section('1 · Δύο απαγγελίες του ΙΔΙΟΥ πλαγιότιτλου: το `due` επιβιώνει του pull');
  {
    /* Το cloud κρατάει την προχθεσινή αποτυχημένη προσπάθεια: `due` = ΧΘΕΣ. */
    const stale = { id: 'p_a', ord: 1, ts: NOW - 20 * DAY, title: 'Οι συνέπειες της σταφιδικής κρίσης',
      picks: [{ u: 'a1b', p: 1 }], drop: [], tables: [], note: '',
      learnedAt: NOW - 5 * DAY, reviews: 1, due: NOW - DAY, best: 0.72, last: NOW - 2 * DAY, runs: 3, claimed: 0 };
    const cloudRow = { 'ist:v1': blankStore({ plag: { p_a: stale } }) };

    const store = new Map([[KEY, JSON.stringify(cloudRow['ist:v1'])]]);
    const page = makePage(store);
    page.reload();

    /* Η σημερινή ανάκληση: καθαρή, η σκάλα ανεβαίνει, +10 μέρες. */
    const p = page.plag('p_a');
    p.runs = 4; p.last = NOW; p.best = 1; p.reviews = 2; p.due = NOW + 10 * DAY;
    page.save(NOW);
    is('πριν το sync, το κινητό λέει +10 μέρες', JSON.parse(store.get(KEY)).plag.p_a.due, NOW + 10 * DAY);

    const { cloud, settle } = makeSync({ store, cloudRow });
    await settle();

    const after = JSON.parse(store.get(KEY)).plag.p_a;
    is('⭐ ΤΟ SYNC ΔΕΝ ΓΥΡΙΖΕΙ ΠΙΣΩ ΤΗΝ ΕΠΑΝΑΛΗΨΗ ΤΟΥ ΠΛΑΓΙΟΤΙΤΛΟΥ', after.due, NOW + 10 * DAY);
    is('…ούτε τη σκάλα του', after.reviews, 2);
    is('…ούτε τη μετρημένη ακρίβειά του', after.best, 1);
    is('⭐ καμία μισή εγγραφή: όλα τα πεδία από την ΙΔΙΑ γενιά',
      [after.reviews, after.runs, after.last], [2, 4, NOW]);
    is('…και ο τίτλος ΤΟΥ ΚΑΘΗΓΗΤΗ ταξιδεύει μαζί, άθικτος',
      after.title, 'Οι συνέπειες της σταφιδικής κρίσης');
    is('…όπως και οι παράγραφοί του', after.picks, [{ u: 'a1b', p: 1 }]);
    is('⭐ και το cloud κρατάει την ΙΔΙΑ εγγραφή', cloud.row['ist:v1'].plag.p_a.due, NOW + 10 * DAY);
  }

  section('1β · Και προς την ΑΛΛΗ κατεύθυνση — κερδίζει ο ΝΕΟΤΕΡΟΣ, όχι ο τοπικός');
  {
    const mine = { id: 'p_a', ts: NOW - 20 * DAY, ord: 1, title: 'ο τίτλος', picks: [{ u: 'a1a', p: 0 }],
      learnedAt: NOW - 9 * DAY, reviews: 1, due: NOW + 3 * DAY, best: 0.9, last: NOW - 3 * DAY, runs: 2, claimed: 0, _ts: NOW - 3 * DAY };
    const theirs = Object.assign({}, mine, { reviews: 2, due: NOW + 10 * DAY, best: 1, last: NOW, runs: 3, _ts: NOW });
    const store = new Map([[KEY, JSON.stringify(blankStore({ plag: { p_a: mine } }))]]);
    const cloudRow = { 'ist:v1': blankStore({ plag: { p_a: theirs } }) };

    const { settle } = makeSync({ store, cloudRow });
    await settle();
    const after = JSON.parse(store.get(KEY)).plag.p_a;
    is('⭐ η ΝΕΟΤΕΡΗ απομακρυσμένη απαγγελία κερδίζει τη δική μου παλιότερη', after.reviews, 2);
    is('…και φέρνει ΟΛΗ τη δική της εγγραφή μαζί', [after.due, after.runs], [NOW + 10 * DAY, 3]);
  }

  section('1γ · Η ΕΠΕΞΕΡΓΑΣΙΑ του πλαγιότιτλου επιβιώνει κι αυτή');
  {
    /* Δεν είναι μόνο η σκάλα: αν ΑΛΛΑΞΕΙ τις παραγράφους ή τον τίτλο και το
       sync τα γυρίσει πίσω, η επόμενη απαγγελία ζητάει ΑΛΛΑ στοιχεία. */
    const old = { id: 'p_a', ts: NOW - 20 * DAY, ord: 1, title: 'παλιός τίτλος',
      picks: [{ u: 'a1b', p: 0 }], drop: [], tables: [], note: '',
      learnedAt: 0, reviews: 0, due: 0, best: 0, last: 0, runs: 0, claimed: 0 };
    const cloudRow = { 'ist:v1': blankStore({ plag: { p_a: old } }) };
    const store = new Map([[KEY, JSON.stringify(cloudRow['ist:v1'])]]);
    const page = makePage(store);
    page.reload();
    const p = page.plag('p_a');
    p.title = 'ο τίτλος που έδωσε ΤΩΡΑ ο καθηγητής';
    p.picks = [{ u: 'a1b', p: 0 }, { u: 'a1b', p: 1 }];
    p.drop = ['a1b:2'];
    page.save(NOW);
    const { settle } = makeSync({ store, cloudRow });
    await settle();
    const after = JSON.parse(store.get(KEY)).plag.p_a;
    is('⭐ ο νέος τίτλος επιβιώνει', after.title, 'ο τίτλος που έδωσε ΤΩΡΑ ο καθηγητής');
    is('…και οι νέες παράγραφοι', after.picks, [{ u: 'a1b', p: 0 }, { u: 'a1b', p: 1 }]);
    is('…και το ξεδιάλεγμα', after.drop, ['a1b:2']);
  }

  section('1δ · Ο ΡΥΘΜΟΣ (τα «~4 λεπτά») δεν γυρίζει πίσω');
  {
    const cloudRow = { 'ist:v1': blankStore({ pace: { secs: 200, els: 60 } }) };
    const store = new Map([[KEY, JSON.stringify(cloudRow['ist:v1'])]]);
    const page = makePage(store);
    page.reload();
    page.state.pace.secs = 340; page.state.pace.els = 92;
    page.save(NOW);
    const { settle } = makeSync({ store, cloudRow });
    await settle();
    is('⭐ ο μετρημένος ρυθμός επιβιώνει του pull', JSON.parse(store.get(KEY)).pace, { secs: 340, els: 92, _ts: NOW });
  }

  /* ══ 2 · ΤΟ ✕ ΜΕΝΕΙ ΣΒΗΣΜΕΝΟ ═════════════════════════════════════ */
  section('2 · Σβήνει πλαγιότιτλο ΠΡΙΝ ξεκινήσει ο engine — και δεν επιστρέφει');
  {
    const rec = { id: 'p_x', ts: NOW - 30 * DAY, ord: 1, title: 'αυτός φεύγει',
      picks: [{ u: 'a1a', p: 0 }], drop: [], tables: [], note: '',
      learnedAt: NOW - 9 * DAY, reviews: 1, due: NOW + DAY, best: .8, last: NOW - 9 * DAY, runs: 1, claimed: 0, _ts: NOW - 9 * DAY };
    const keep = { id: 'p_k', ts: NOW - 30 * DAY, ord: 2, title: 'αυτός μένει',
      picks: [{ u: 'a1a', p: 1 }], drop: [], tables: [], note: '',
      learnedAt: 0, reviews: 0, due: 0, best: 0, last: 0, runs: 0, claimed: 0, _ts: NOW - 30 * DAY };
    const cloudRow = { 'ist:v1': blankStore({ plag: { p_x: rec, p_k: keep } }) };

    const store = new Map([[KEY, JSON.stringify(cloudRow['ist:v1'])]]);
    const page = makePage(store);
    page.reload();

    /* Το ✕ μέσα στο πρώτο δευτερόλεπτο: ΚΑΝΕΝΑΣ interceptor δεν υπάρχει. */
    delete page.state.plag.p_x;
    page.save(NOW);
    page.tombPlag('p_x', Math.max(rec._ts, rec.ts));

    ok('η ταφόπλακα γράφτηκε στο κλειδί που διαβάζει το sync.js', !!store.get(TOMB));
    const t = JSON.parse(store.get(TOMB));
    ok('…και είναι ΦΩΛΙΑΣΜΕΝΗ κάτω από `plag`', typeof t[KEY].plag.p_x === 'number');
    ok('…με T > ts της εγγραφής (ο κανόνας max(now, ts+1))', t[KEY].plag.p_x > rec.ts && t[KEY].plag.p_x > rec._ts);

    const { cloud, settle } = makeSync({ store, cloudRow });
    await settle();

    const after = JSON.parse(store.get(KEY)).plag;
    ok('⭐ ΤΟ ✕ ΜΕΝΕΙ ΣΒΗΣΜΕΝΟ μετά το pull', !after.p_x);
    ok('…και ο διπλανός του ΔΕΝ πειράχτηκε', !!after.p_k && after.p_k.title === 'αυτός μένει');
    ok('⭐ και το cloud δεν τον ξανακάνει αλήθεια', !cloud.row['ist:v1'].plag.p_x);
  }

  section('2β · Ένας ΝΕΟΣ πλαγιότιτλος με το ίδιο id (re-add) ΔΕΝ πνίγεται από την ταφόπλακα');
  {
    /* Ο κανόνας του sync.js είναι «ταφόπλακα T εκτός αν ξαναμπήκε ΜΕΤΑ το T».
       Αν το χάσουμε αυτό, μια μελλοντική διαγραφή θα σκότωνε σιωπηλά κάθε
       επόμενη εγγραφή που τύχει να πάρει το ίδιο id. */
    const store = new Map();
    const page = makePage(store);
    page.reload();
    page.tombPlag('p_x', NOW - 10 * DAY);
    const fresh = { id: 'p_x', ts: NOW + 60000, ord: 1, title: 'καινούργιος, ίδιο id',
      picks: [{ u: 'a1a', p: 0 }], drop: [], tables: [], note: '',
      learnedAt: 0, reviews: 0, due: 0, best: 0, last: 0, runs: 0, claimed: 0 };
    store.set(KEY, JSON.stringify(blankStore({ plag: { p_x: fresh } })));
    const cloudRow = { 'ist:v1': blankStore({ plag: {} }) };
    const { settle } = makeSync({ store, cloudRow });
    await settle();
    ok('⭐ ο νέος επιβιώνει, γιατί μπήκε ΜΕΤΑ την ταφόπλακα',
      !!JSON.parse(store.get(KEY)).plag.p_x);
  }

  /* ══ 3 · ΟΙ ΑΜΥΝΕΣ ΤΗΣ ΣΦΡΑΓΙΔΑΣ, ΣΤΟΝ ΝΕΟ ΧΑΡΤΗ ════════════════ */
  section('3 · Οι άμυνες της σφραγίδας ισχύουν και για το `plag`');
  {
    /* 3α — μια ΑΔΕΙΑ εγγραφή που έφτιαξε ένα render δεν σφραγίζεται, αλλιώς
       θα νικούσε την αληθινή του cloud και θα την έσβηνε. */
    const real = { id: 'p_a', ts: NOW - 20 * DAY, ord: 1, title: 'η αληθινή',
      picks: [{ u: 'a1a', p: 0 }], drop: [], tables: [], note: '',
      learnedAt: NOW - 4 * DAY, reviews: 2, due: NOW + 10 * DAY, best: 1, last: NOW - DAY, runs: 5, claimed: 0 };
    const cloudRow = { 'ist:v1': blankStore({ plag: { p_a: real } }) };
    const store = new Map([[KEY, JSON.stringify(blankStore())]]);
    const page = makePage(store);
    page.reload();
    /* Ένα render αγγίζει το κέλυφος. ⚠️ Το `u(id)`-ισοδύναμο εδώ ΕΧΕΙ `ts` και
       `title`, άρα ΔΕΝ είναι μηδενικό — γι' αυτό δοκιμάζουμε ρητά το πραγματικά
       άδειο κέλυφος, το `pace`. */
    page.state.pace.secs = 0; page.state.pace.els = 0;
    page.save(NOW);
    ok('ένα render δεν σφραγίζει άδειο `pace`', page.state.pace._ts === undefined);

    const { settle } = makeSync({ store, cloudRow });
    await settle();
    is('⭐ το άδειο κέλυφος ΔΕΝ έσβησε την αληθινή πρόοδο του cloud',
      JSON.parse(store.get(KEY)).plag.p_a.due, NOW + 10 * DAY);
  }
  {
    /* 3β — παλιά εγγραφή (γραμμένη πριν υπάρξει σφραγίδα) παίρνει τον
       ΠΡΑΓΜΑΤΙΚΟ της χρόνο, ποτέ το τώρα. */
    const legacy = { id: 'p_a', ts: NOW - 30 * DAY, ord: 1, title: 'παλιά',
      picks: [{ u: 'a1a', p: 0 }], drop: [], tables: [], note: '',
      learnedAt: NOW - 9 * DAY, reviews: 1, due: NOW + 2 * DAY, best: .9, last: NOW - 2 * DAY, runs: 2, claimed: 0 };
    const store = new Map([[KEY, JSON.stringify(blankStore({ plag: { p_a: legacy } }))]]);
    const page = makePage(store);
    page.reload();
    is('⭐ παλιά εγγραφή παίρνει το `last` της, όχι το τώρα', page.state.plag.p_a._ts, NOW - 2 * DAY);
  }
  {
    /* 3γ — ένας πλαγιότιτλος που ΔΕΝ ειπώθηκε ποτέ δανείζεται τον χρόνο
       ΓΕΝΝΗΣΗΣ του (`ts`). Χωρίς αυτό θα έμενε ασφράγιστος για πάντα και το
       cloud θα μπορούσε να τον ξαναγράψει με μια παλιότερη εκδοχή του. */
    const born = { id: 'p_b', ts: NOW - 3 * DAY, ord: 2, title: 'δεν ειπώθηκε ποτέ',
      picks: [{ u: 'a1a', p: 1 }], drop: [], tables: [], note: '',
      learnedAt: 0, reviews: 0, due: 0, best: 0, last: 0, runs: 0, claimed: 0 };
    const store = new Map([[KEY, JSON.stringify(blankStore({ plag: { p_b: born } }))]]);
    const page = makePage(store);
    page.reload();
    is('⭐ ο ανείπωτος πλαγιότιτλος σφραγίζεται με τη γέννησή του', page.state.plag.p_b._ts, NOW - 3 * DAY);
  }

  /* ══ 4 · Ο ΝΟΜΟΣ ΠΟΥ ΣΤΗΡΙΖΕΙ ΤΑ ΠΑΡΑΠΑΝΩ ═══════════════════════ */
  section('4 · Το opt-in του sync.js υπάρχει ακόμη');
  {
    const s = fs.readFileSync(path.join(ALS, 'sync.js'), 'utf8');
    ok('το mergeValue τιμά το `_ts` (LWW ανά αντικείμενο)', /\('_ts' in lv\) \|\| \('_ts' in rv\)/.test(s));
    ok('…και το mergeObject το τιμά ΚΑΙ ΦΩΛΙΑΣΜΕΝΑ (εκεί ζει το plag)',
      (s.match(/\('_ts' in lv\) \|\| \('_ts' in rv\)/g) || []).length >= 2);
    ok('το tombed() κατεβαίνει σε φωλιασμένους χάρτες (subTomb)', /subTomb\(tomb, key\)/.test(s));
    ok('…και μια ταφόπλακα δεν πνίγει ό,τι ξαναμπήκε ΜΕΤΑ', /addedAt\(val\) <= t/.test(s));
  }

  section('4β · Η σελίδα σφραγίζει και ταφοπλακώνει ΜΕ ΤΟΝ ΙΔΙΟ κανόνα');
  {
    const p = fs.readFileSync(path.join(ALS, 'istoria.html'), 'utf8');
    ok('η σελίδα δίνει και τους τρεις χάρτες + τον ρυθμό στη σφραγίδα',
      /\[state\.units, state\.els, state\.plag, \{ pace: state\.pace \}\]/.test(p));
    ok('η ταφόπλακα της σελίδας ξεπερνάει ΚΑΙ τα δύο timestamps',
      /Math\.max\(\+rec\._ts \|\| 0, \+rec\.ts \|\| 0\)/.test(p));
    ok('…και μπαίνει ΜΟΝΟ μετά από επιβεβαιωμένο γράψιμο',
      /save\(\);[\s\S]{0,400}?back\.plag && has\(back\.plag, id\)[\s\S]{0,400}?tombPlag\(id, ts\)/.test(p));
  }

  console.log('\n' + pass + ' πέρασαν, ' + fail + ' απέτυχαν');
  process.exit(fail ? 1 : 0);
})();
