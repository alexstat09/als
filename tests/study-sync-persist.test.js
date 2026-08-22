/* ══════════════════════════════════════════════════════════════════════
   tests/study-sync-persist.test.js

   ⭐⭐ Η ΕΠΑΝΑΛΗΨΗ ΠΟΥ ΜΟΛΙΣ ΕΓΙΝΕ ΠΡΕΠΕΙ ΝΑ ΕΠΙΒΙΩΝΕΙ ΤΟΥ ΕΠΟΜΕΝΟΥ SYNC.

   Το bug (9 Αυγ 2026): είπε ολόκληρο το 1ο κεφάλαιο της Ιστορίας, η σελίδα
   είπε «τέλεια, ξανά σε 10 μέρες», γύρισε πίσω και το σπίτι έλεγε «έληξε
   χθες». Το `sync.js` κατεβαίνει μέσα στο `units` και για κάθε ΒΑΘΜΩΤΟ
   πεδίο που διαφέρει κρατάει το remote, οπότε η φρέσκια τιμή επανερχόταν
   ντετερμινιστικά μέσα σε ~400ms — και σπρωχνόταν και πίσω στο cloud.

   ⚠️ ΟΧΙ ΠΡΟΣΟΜΟΙΩΣΗ ΤΟΥ MERGE. Τρέχει το ΑΛΗΘΙΝΟ `sync.js` σε vm, όπως η
   `reinstall-safety.js`, γιατί το bug ΗΤΑΝ στο πραγματικό merge: ένα
   αντίγραφο του κανόνα μέσα στο test θα συμφωνούσε με το λάθος τέλεια.
   Και το ΑΛΗΘΙΝΟ `study-stamp.js`, με τα ΑΛΗΘΙΝΑ σχήματα των σελίδων.

   Τα μέρη:
     1 · η ίδια η σκηνή του — δεύτερη ανάκληση πάνω σε παλιά εγγραφή cloud
     2 · ο νόμος προς ΚΑΙ ΤΙΣ ΔΥΟ κατευθύνσεις (δεν κερδίζει «πάντα ο τοπικός»)
     3 · οι τρεις άμυνες της σφραγίδας (άδειο / σπορά / παλιός χρόνος)
     4 · στατικά: ότι ΚΑΘΕ σελίδα μελέτης είναι όντως καλωδιωμένη
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
const NOW = Date.parse('2026-08-09T18:00:00Z');

/* ── το study-stamp.js, το αληθινό ────────────────────────────────── */
function loadStamp() {
  const box = { window: {}, JSON, Object, Array, Date, Math, String, Number };
  box.window.window = box.window;
  vm.createContext(box);
  vm.runInContext(fs.readFileSync(path.join(ALS, 'study-stamp.js'), 'utf8'), box, { filename: 'study-stamp.js' });
  return box.window.StudyStamp;
}
const StudyStamp = loadStamp();

/* Η σελίδα Ιστορίας σε μικρογραφία: ΤΟ ΙΔΙΟ σχήμα, ο ίδιος κύκλος
   load → seed → μεταλλαγή → stamp → setItem. Ό,τι κάνει η αληθινή. */
function makePage(store, KEY) {
  let state = null, STAMP = null;
  function load() {
    let s = null;
    try { s = JSON.parse(store.get(KEY) || 'null'); } catch (e) {}
    const b = { v: 1, units: {}, els: {}, days: [], heard: {} };
    if (s && typeof s === 'object') { b.units = s.units || {}; b.els = s.els || {}; b.days = s.days || []; b.heard = s.heard || {}; }
    return b;
  }
  function reload() {
    state = load();
    if (!STAMP) STAMP = StudyStamp(
      () => (state ? [state.units, state.els] : []),
      (i, k, rec) => {
        if (i === 0) return rec.last || rec.learnedAt || 0;
        const p = state.units[k.split(':')[0]];
        return p ? (p.last || p.learnedAt || 0) : 0;
      }
    );
    STAMP.seed();
  }
  function save(now) { STAMP.stamp(now); store.set(KEY, JSON.stringify(state)); }
  return {
    reload, save,
    get state() { return state; },
    unit(id) {
      if (!state.units[id]) state.units[id] = { learnedAt: 0, reviews: 0, due: 0, best: 0, last: 0, runs: 0, claimed: 0 };
      return state.units[id];
    },
    el(k) { if (!state.els[k]) state.els[k] = { r: 0, w: 0 }; return state.els[k]; }
  };
}

/* ── το αληθινό sync.js, με ένα cloud που θυμάται ─────────────────── */
function makeSync({ store, cloudRow, appKey, keys }) {
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
  box.initCloudSync({ appKey, syncedKeys: keys });
  const settle = () => new Promise(r => setImmediate(() => setImmediate(() => setImmediate(() => setImmediate(() => setImmediate(r))))));
  return { cloud, settle };
}

/* Μια εγγραφή ενότητας όπως τη γράφει η σελίδα. */
const unit = o => Object.assign({ learnedAt: 0, reviews: 0, due: 0, best: 0, last: 0, runs: 0, claimed: 0 }, o);

(async () => {

  /* ══ 1 · Η ΣΚΗΝΗ ΤΟΥ ═══════════════════════════════════════════════ */
  section('1 · Η δεύτερη ανάκληση: «τέλεια, σε 10 μέρες» πρέπει να μείνει');
  {
    const KEY = 'ist:v1';
    /* Το cloud κρατάει την ΠΡΟΧΘΕΣΙΝΗ αποτυχημένη προσπάθεια: είχε γραφτεί
       `due = τότε + 1 μέρα`, δηλαδή ΧΘΕΣ. Ακριβώς αυτό που έβλεπε. */
    const stale = unit({ learnedAt: NOW - 5 * DAY, reviews: 1, due: NOW - DAY, best: 0.72, last: NOW - 2 * DAY, runs: 3 });
    const cloudRow = { 'ist:v1': { v: 1, units: { a1a: stale }, els: { 'a1a:0:0': { r: 2, w: 1 } }, days: [], heard: {} } };

    const store = new Map([[KEY, JSON.stringify(cloudRow['ist:v1'])]]);
    const page = makePage(store, KEY);
    page.reload();

    /* Η σημερινή ανάκληση: 100%, η σκάλα ανεβαίνει, +10 μέρες. */
    const s = page.unit('a1a');
    s.runs = 4; s.last = NOW; s.best = 1; s.reviews = 2; s.due = NOW + 10 * DAY;
    const e = page.el('a1a:0:0'); e.r = 3; e.w = 1;
    page.save(NOW);

    is('πριν το sync, το κινητό λέει +10 μέρες', JSON.parse(store.get(KEY)).units.a1a.due, NOW + 10 * DAY);

    const { cloud, settle } = makeSync({ store, cloudRow, appKey: 'istoria', keys: [KEY] });
    await settle();

    const after = JSON.parse(store.get(KEY)).units.a1a;
    is('⭐ ΤΟ SYNC ΔΕΝ ΓΥΡΙΖΕΙ ΠΙΣΩ ΤΗΝ ΕΠΑΝΑΛΗΨΗ (due)', after.due, NOW + 10 * DAY);
    is('…ούτε τη σκάλα (reviews)', after.reviews, 2);
    is('…ούτε τη μετρημένη ακρίβεια (best)', after.best, 1);
    is('…ούτε τον μετρητή προσπαθειών (runs)', after.runs, 4);
    is('⭐ και το cloud κρατάει την ΙΔΙΑ εγγραφή, όχι την παλιά',
      cloud.row['ist:v1'].units.a1a.due, NOW + 10 * DAY);

    /* Το χειρότερο μισό του παλιού bug: το merge ήταν ΑΝΑ ΠΕΔΙΟ, οπότε μια
       εγγραφή μπορούσε να βγει μισή-παλιά/μισή-καινούρια. Τα πεδία μιας
       μέτρησης ταξιδεύουν μαζί ή δεν είναι μέτρηση. */
    is('⭐ καμία μισή εγγραφή: όλα τα πεδία από την ΙΔΙΑ γενιά',
      [after.reviews, after.runs, after.last], [2, 4, NOW]);
    is('τα στοιχεία (r/w) ακολούθησαν κι αυτά',
      [JSON.parse(store.get(KEY)).els['a1a:0:0'].r, JSON.parse(store.get(KEY)).els['a1a:0:0'].w], [3, 1]);
  }

  section('1β · Η ίδια απώλεια, μία συσκευή πιο πέρα');
  {
    /* ⚠️ Η ΣΠΟΡΑ ΜΟΝΗ ΤΗΣ ΔΕΝ ΑΡΚΕΙ, ΚΑΙ ΤΟ ΜΕΤΡΗΣΑ. Στη σκηνή 1 καμία
       πλευρά δεν είχε σφραγίδα, οπότε ΚΑΙ ΜΟΝΟ η σπορά την έσωζε: ισοπαλία
       και «ο τοπικός κερδίζει». Αυτό κρύβει το άλλο μισό του νόμου.

       Εδώ είναι η σκηνή που χρειάζεται ΟΠΩΣΔΗΠΟΤΕ σφραγίδα σε κάθε αλλαγή:
       το laptop απήγγειλε στις T1 και το ανέβασε· το κινητό, που κρατούσε
       ακόμη το T0, απαγγέλλει ΑΡΓΟΤΕΡΑ στις T2. Χωρίς φρέσκια σφραγίδα η
       παλιότερη απαγγελία του laptop νικάει τη νεότερη του κινητού και τη
       σβήνει — η ίδια απώλεια που περιέγραψε, με δύο συσκευές. */
    const KEY = 'ist:v1';
    const T0 = NOW - 3 * DAY, T1 = NOW - 2 * DAY, T2 = NOW;
    const mineOld = unit({ learnedAt: NOW - 9 * DAY, reviews: 1, due: NOW + 3 * DAY, best: 0.8, last: T0, runs: 2, _ts: T0 });
    const laptop  = unit({ learnedAt: NOW - 9 * DAY, reviews: 2, due: T1 + 10 * DAY, best: 0.95, last: T1, runs: 3, _ts: T1 });

    const store = new Map([[KEY, JSON.stringify({ v: 1, units: { a1a: mineOld }, els: {}, days: [], heard: {} })]]);
    const cloudRow = { 'ist:v1': { v: 1, units: { a1a: laptop }, els: {}, days: [], heard: {} } };

    const page = makePage(store, KEY);
    page.reload();
    const s = page.unit('a1a');
    s.runs = 3; s.last = T2; s.best = 1; s.reviews = 2; s.due = T2 + 10 * DAY;
    page.save(T2);

    const { settle } = makeSync({ store, cloudRow, appKey: 'istoria', keys: [KEY] });
    await settle();
    is('⭐ η ΣΗΜΕΡΙΝΗ απαγγελία νικάει την προχθεσινή του άλλου μηχανήματος',
      JSON.parse(store.get(KEY)).units.a1a.due, T2 + 10 * DAY);
  }

  /* ══ 2 · Ο ΝΟΜΟΣ ΠΑΕΙ ΚΑΙ ΠΡΟΣ ΤΙΣ ΔΥΟ ΜΕΡΙΕΣ ═════════════════════ */
  section('2 · Δεν κερδίζει «ο τοπικός», κερδίζει ο ΝΕΟΤΕΡΟΣ');
  {
    const KEY = 'ist:v1';
    /* Το άλλο κινητό έκανε την ανάκληση ΤΩΡΑ· αυτή η συσκευή κρατάει μια
       παλιότερη σφραγισμένη εγγραφή και δεν την άγγιξε από τότε. */
    const mine = unit({ learnedAt: NOW - 9 * DAY, reviews: 1, due: NOW + 3 * DAY, best: 0.9, last: NOW - 3 * DAY, runs: 2, _ts: NOW - 3 * DAY });
    const theirs = unit({ learnedAt: NOW - 9 * DAY, reviews: 2, due: NOW + 10 * DAY, best: 1, last: NOW, runs: 3, _ts: NOW });
    const store = new Map([[KEY, JSON.stringify({ v: 1, units: { a1a: mine }, els: {}, days: [], heard: {} })]]);
    const cloudRow = { 'ist:v1': { v: 1, units: { a1a: theirs }, els: {}, days: [], heard: {} } };

    const { settle } = makeSync({ store, cloudRow, appKey: 'istoria', keys: [KEY] });
    await settle();
    const after = JSON.parse(store.get(KEY)).units.a1a;
    is('⭐ η ΝΕΟΤΕΡΗ απομακρυσμένη ανάκληση κερδίζει τη δική μου παλιότερη', after.reviews, 2);
    is('…και φέρνει ΟΛΗ τη δική της εγγραφή μαζί', [after.due, after.runs], [NOW + 10 * DAY, 3]);
  }

  /* ══ 3 · ΟΙ ΤΡΕΙΣ ΑΜΥΝΕΣ ═══════════════════════════════════════════ */
  section('3 · Οι τρεις άμυνες της σφραγίδας');
  {
    /* 3α ⭐ Ένα μηδενικό κέλυφος που έφτιαξε ένα render ΔΕΝ σφραγίζεται —
       αλλιώς θα νικούσε την αληθινή εγγραφή του cloud και θα την έσβηνε.
       Είναι η σταθερή αρχή «ένα default δεν είναι δεδομένο», με write. */
    const KEY = 'ist:v1';
    const real = unit({ learnedAt: NOW - 4 * DAY, reviews: 2, due: NOW + 10 * DAY, best: 1, last: NOW - DAY, runs: 5 });
    const cloudRow = { 'ist:v1': { v: 1, units: { a1a: real }, els: {}, days: [], heard: {} } };

    const store = new Map([[KEY, JSON.stringify({ v: 1, units: {}, els: {}, days: [], heard: {} })]]);
    const page = makePage(store, KEY);
    page.reload();
    page.unit('a1a');            // ΜΟΝΟ ένα render το άγγιξε
    page.save(NOW);
    ok('ένα render δεν σφραγίζει άδεια εγγραφή', page.state.units.a1a._ts === undefined);

    const { settle } = makeSync({ store, cloudRow, appKey: 'istoria', keys: [KEY] });
    await settle();
    is('⭐ το άδειο κέλυφος ΔΕΝ έσβησε την αληθινή πρόοδο του cloud',
      JSON.parse(store.get(KEY)).units.a1a.due, NOW + 10 * DAY);
  }
  {
    /* 3β ⭐ Η ΣΠΟΡΑ ΔΕΝ ΕΙΝΑΙ ΣΦΡΑΓΙΣΜΑ. Ό,τι μόλις ήρθε από το cloud δεν
       επιτρέπεται να πάρει σημερινή σφραγίδα επειδή απλώς το διαβάσαμε. */
    const KEY = 'ist:v1';
    const incoming = unit({ learnedAt: NOW - 4 * DAY, reviews: 2, due: NOW + 10 * DAY, best: 1, last: NOW - DAY, runs: 5, _ts: NOW - DAY });
    const store = new Map([[KEY, JSON.stringify({ v: 1, units: { a1a: incoming }, els: {}, days: [], heard: {} })]]);
    const page = makePage(store, KEY);
    page.reload();
    page.save(NOW);              // ένα save χωρίς καμία αλλαγή
    is('⭐ save χωρίς αλλαγή δεν μετακινεί τη σφραγίδα', page.state.units.a1a._ts, NOW - DAY);

    page.unit('a1a').due = NOW + 30 * DAY;
    page.save(NOW);
    is('…και μια ΑΛΗΘΙΝΗ αλλαγή τη μετακινεί', page.state.units.a1a._ts, NOW);
  }
  {
    /* 3γ ⭐ Οι εγγραφές που υπάρχουν ΗΔΗ στο κινητό του γράφτηκαν πριν από
       αυτό το αρχείο και δεν έχουν σφραγίδα. Παίρνουν την ώρα της
       τελευταίας ΑΛΗΘΙΝΗΣ δραστηριότητας, ποτέ το τώρα. */
    const KEY = 'ist:v1';
    const legacy = unit({ learnedAt: NOW - 9 * DAY, reviews: 1, due: NOW + 2 * DAY, best: 0.9, last: NOW - 2 * DAY, runs: 2 });
    const store = new Map([[KEY, JSON.stringify({ v: 1, units: { a1a: legacy }, els: { 'a1a:0:0': { r: 4, w: 1 } }, days: [], heard: {} })]]);
    const page = makePage(store, KEY);
    page.reload();
    is('⭐ παλιά εγγραφή παίρνει το `last` της, όχι το τώρα', page.state.units.a1a._ts, NOW - 2 * DAY);
    is('…και το στοιχείο δανείζεται το `last` της ενότητάς του', page.state.els['a1a:0:0']._ts, NOW - 2 * DAY);
  }

  /* ══ 4 · ΚΑΘΕ ΣΕΛΙΔΑ ΜΕΛΕΤΗΣ ΕΙΝΑΙ ΟΝΤΩΣ ΚΑΛΩΔΙΩΜΕΝΗ ══════════════ */
  section('4 · Η καλωδίωση, σε κάθε σελίδα που κρατάει χάρτη εγγραφών');
  {
    const pages = ['istoria.html', 'arxaia.html', 'tonos.html'];
    pages.forEach(function (f) {
      const src = fs.readFileSync(path.join(ALS, f), 'utf8');
      const code = src.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/<!--[\s\S]*?-->/g, ' ');
      ok(f + ' φορτώνει το study-stamp.js', /<script src="study-stamp\.js">/.test(src));

      /* ⭐ Ο ΠΡΑΓΜΑΤΙΚΟΣ ΚΙΝΔΥΝΟΣ ΕΙΝΑΙ ΕΔΩ. Ένα σκέτο `state = load()` που
         ξεφεύγει δεν σπάει τίποτα ορατό: η σελίδα δουλεύει, η οθόνη είναι
         σωστή, και μόνο το ΕΠΟΜΕΝΟ save σφραγίζει σαν δικό μας ό,τι ήρθε
         από το cloud. Αόρατο μέχρι να χαθεί πάλι μια επανάληψη. */
      const bare = (code.match(/state = load\(\)/g) || []).length;
      const reloads = (code.match(/function reload\(\)\s*\{\s*state = load\(\);\s*STAMP\.seed\(\);\s*\}/g) || []).length;
      ok(f + ': κάθε `state = load()` ζει μέσα σε reload() ' + '(' + bare + ' κλήσεις, ' + reloads + ' reload)',
        reloads > 0 && bare === reloads);

      /* Κάθε μηχανή της σελίδας σφραγίζει μέσα στο δικό της save(). */
      const saves = (code.match(/function save\(\)\s*\{\s*STAMP\.stamp\(\);/g) || []).length;
      ok(f + ': κάθε save() σφραγίζει πρώτα (' + saves + ')', saves === reloads);

      /* Και δεν σωπαίνει αν λείψει το αρχείο — σταθερή αρχή: ένας φρουρός
         που λείπει το λέει. */
      ok(f + ': λέει αν δεν φόρτωσε το study-stamp.js', src.indexOf('Δεν φόρτωσε το study-stamp.js') >= 0);
    });

    /* ⭐ als-v502 — ΤΑ ΛΑΤΙΝΙΚΑ ΑΛΛΑΞΑΝ ΡΟΛΟ, Η ΕΓΓΥΗΣΗ ΟΧΙ.
       Τα Λατινικά επιβίωναν ήδη με άλλο σχήμα: πίνακας κελιών με `id`+`ts`,
       που το mergeArray κρατάει «ο νεότερος κερδίζει». Δική του εντολή
       (22/08/26) η `latinika.html` έγινε ΒΙΒΛΙΟΘΗΚΗ ΕΝΟΤΗΤΩΝ και δεν γράφει
       πια ούτε ένα κελί — άρα δεν έχει τι να σφραγίσει, και ένα
       `ok(/c\.ts/)` πάνω της θα ήταν φρουρός που φυλάει άδειο δωμάτιο.
       Δύο πράγματα παίρνουν τη θέση του, και είναι πιο δυνατά μαζί:
         · η ζωντανή σελίδα ΔΕΝ γράφει — άρα δεν μπορεί να ξανασφραγίσει
           σαν δικό της ό,τι ήρθε από το cloud (ήταν ΑΚΡΙΒΩΣ ο κίνδυνος),
         · και η μηχανή, με τη σφραγίδα της, σώζεται αυτούσια στο archive/
           ώστε αν ξαναζωντανέψει, να ξαναζωντανέψει ΣΩΣΤΗ. */
    const lat = fs.readFileSync(path.join(ALS, 'latinika.html'), 'utf8');
    ok('latinika.html δεν γράφει πια στο lat:v1 — τίποτα να σφραγίσει',
      lat.indexOf('setItem') < 0);
    ok('…αλλά συνεχίζει να το ΣΥΓΧΡΟΝΙΖΕΙ, ώστε να μη μείνει ορφανό',
      /syncedKeys:\s*\['lat:v1'\]/.test(lat));
    const drill = path.join(ALS, 'archive', 'latinika-drill.html');
    ok('η μηχανή κλίσεων σώζεται στο archive/latinika-drill.html', fs.existsSync(drill));
    ok('και σφραγίζει ακόμη κάθε κελί με ts (αν ποτέ ξαναζωντανέψει)',
      /c\.ts = Date\.now\(\)/.test(fs.readFileSync(drill, 'utf8')));
  }

  /* ⚠️ Ο ΝΟΜΟΣ ΤΟΥ SYNC.JS ΠΟΥ ΣΤΗΡΙΖΕΙ ΟΛΑ ΤΑ ΠΑΡΑΠΑΝΩ. Αν κάποτε
     αφαιρεθεί το per-object LWW, τα μέρη 1-3 θα έσπαγαν με μυστηριώδη τρόπο·
     εδώ σπάει με το όνομά του. */
  section('5 · Το opt-in του sync.js υπάρχει ακόμη');
  {
    const s = fs.readFileSync(path.join(ALS, 'sync.js'), 'utf8');
    ok("το mergeValue τιμά το `_ts` (LWW ανά αντικείμενο)",
      /\('_ts' in lv\) \|\| \('_ts' in rv\)/.test(s));
    ok('…και το mergeObject το τιμά και ΦΩΛΙΑΣΜΕΝΑ (εκεί ζουν τα units)',
      (s.match(/\('_ts' in lv\) \|\| \('_ts' in rv\)/g) || []).length >= 2);
  }

  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
})();
