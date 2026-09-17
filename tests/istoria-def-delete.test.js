/* ══════════════════════════════════════════════════════════════════════
   Ο ΟΡΙΣΜΟΣ ΠΟΥ ΞΑΝΑΕΜΦΑΝΙΖΟΤΑΝ — als-v565

   Δικά του λόγια: «πήγα να σβήσω έναν ορισμό, και αφού πάτησα το Χ και
   σβήστηκε, εμφανίστηκε λίγο μετά».

   ΔΥΟ ΑΙΤΙΕΣ, ΚΑΙ Η ΜΙΑ ΗΤΑΝ ΚΡΥΜΜΕΝΗ ΚΑΤΩ ΑΠΟ ΤΗΝ ΑΛΛΗ:

   (1) ΤΟ ΠΑΡΑΘΥΡΟ ΕΚΚΙΝΗΣΗΣ. Το sync.js στήνει το φίλτρο του πάνω στο
       localStorage.setItem ΜΕΣΑ στο initCloudSync, που η istoria-voithima.html
       το καλεί με polling ως και 8 δευτερόλεπτα μετά το άνοιγμα. Ένα ✕ σε
       εκείνο το παράθυρο σβήνει τον ορισμό ΤΟΠΙΚΑ, δεν αφήνει tombstone, και
       το επόμενο pull τον ΕΠΑΝΑΦΕΡΕΙ από το cloud (σταθ. 11 · als-v469).

   (2) ⭐⭐ ΚΑΙ ΤΟ ΙΔΙΟ ΤΟ ALSSync.drop ΔΕΝ ΜΠΟΡΟΥΣΕ ΝΑ ΤΟ ΔΙΟΡΘΩΣΕΙ, γιατί
       έγραφε σε ΛΑΘΟΣ ΕΠΙΠΕΔΟ. Όλοι οι παλιοί καλούντες (nut:logs, nut:favs)
       έχουν ΠΙΝΑΚΑ στο top level. Το «istoria:notes:<id>» είναι ΑΝΤΙΚΕΙΜΕΝΟ
       ({heads:[…], defs:[…], mine:[…]}), και το diffTomb αποθηκεύει το
       tombstone ΕΝΑ ΕΠΙΠΕΔΟ ΚΑΤΩ — tomb[key].defs['id:x']. Το drop το
       έγραφε στο tomb[key]['id:x'], οπότε το subTomb(tomb,'defs') δεν έβρισκε
       ΤΙΠΟΤΑ και ο union merge έφερνε τον ορισμό πίσω.

   Η δοκιμή τρέχει το ΠΡΑΓΜΑΤΙΚΟ sync.js σε vm, με ψεύτικο Supabase που
   κρατάει ακόμη τον ορισμό, και απαιτεί να ΜΗΝ επανέλθει.
   ⚠️ Δοκιμάζει ΚΑΙ την αναίρεση: ένας ορισμός που ξαναμπήκε ΔΕΝ σβήνεται.
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const ALS = path.join(__dirname, '..');

let pass = 0, fail = 0;
function ok(name, cond) { cond ? pass++ : fail++; console.log((cond ? '  ✓ ' : '  ✗ FAIL ') + name); }
function is(name, got, want) {
  const good = JSON.stringify(got) === JSON.stringify(want);
  good ? pass++ : fail++;
  console.log((good ? '  ✓ ' : '  ✗ FAIL ') + name + (good ? '' : `\n      got  ${JSON.stringify(got)}\n      want ${JSON.stringify(want)}`));
}
function section(s) { console.log('\n' + s); }

const KEY = 'istoria:notes:k1-b9';
const APP = 'istoria';
const TOMB = '__synctomb__' + APP;

/* ── ένα localStorage που συμπεριφέρεται σαν αληθινό ──────────────── */
function makeLS() {
  const m = new Map();
  return {
    getItem: k => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => { m.set(k, String(v)); },
    removeItem: k => { m.delete(k); },
    key: i => Array.from(m.keys())[i],
    get length() { return m.size; },
    _dump: () => Object.fromEntries(m),
  };
}

/* ── ένα Supabase που κρατάει ΤΗ ΔΙΚΗ ΤΟΥ εκδοχή της γραμμής ──────── */
function makeSupa(remoteData) {
  const state = { row: { data: remoteData, updated_at: '2026-09-17T10:00:00Z' }, pushes: [] };
  const q = () => {
    const api = {
      select: () => api, eq: () => api, limit: () => api,
      maybeSingle: async () => ({ data: state.row, error: null }),
      upsert: async body => { state.pushes.push(body); state.row = { data: body.data, updated_at: new Date().toISOString() }; return { data: null, error: null }; },
      then: undefined,
    };
    /* `select('user_id').limit(1)` περιμένεται awaitable */
    api.then = (res) => res({ data: [], error: null });
    return api;
  };
  return {
    state,
    client: {
      from: () => q(),
      auth: {
        getSession: async () => ({ data: { session: { user: { id: 'alex' }, access_token: 'tok' } } }),
        onAuthStateChange: () => {},
      },
      channel: () => ({ on() { return this; }, subscribe() { return this; } }),
    },
  };
}

/* ── στήνει ένα «παράθυρο» και φορτώνει το ΠΡΑΓΜΑΤΙΚΟ sync.js ─────── */
function boot(localData, remoteData) {
  const ls = makeLS();
  if (localData !== undefined) ls.setItem(KEY, JSON.stringify(localData));
  const supa = makeSupa(remoteData);
  const timers = [];
  const win = {
    localStorage: ls,
    supabase: { createClient: () => supa.client },
    addEventListener: () => {},
    removeEventListener: () => {},
    setTimeout: (fn, ms) => { timers.push(fn); return timers.length; },
    clearTimeout: () => {},
    setInterval: () => 0, clearInterval: () => {},
    document: { addEventListener: () => {}, removeEventListener: () => {}, visibilityState: 'visible' },
    navigator: { onLine: true, sendBeacon: () => true },
    fetch: async () => ({ ok: true, status: 200, json: async () => [], text: async () => '[]' }),
    console: { log(){}, warn(){}, error(){} },
  };
  win.window = win; win.self = win; win.globalThis = win;
  const ctx = vm.createContext(win);
  vm.runInContext(fs.readFileSync(path.join(ALS, 'sync.js'), 'utf8'), ctx, { filename: 'sync.js' });
  return { ctx, win, ls, supa, timers };
}

const wait = () => new Promise(r => setImmediate(() => setImmediate(() => setImmediate(r))));

/* ══ ΤΟ ΣΕΝΑΡΙΟ ═════════════════════════════════════════════════════ */
const DEF = { id: 'd-abc', ts: 1758000000000, term: 'Τοκοχρεολύσιο', free: true, text: 'τόκος + χρεολύσιο' };
const OTHER = { id: 'd-keep', ts: 1758000000001, term: 'Εγγύηση', free: true, text: 'πληρώνει ο εγγυητής' };
const REMOTE = { [KEY]: { heads: [], defs: [DEF, OTHER], mine: [], updatedAt: 1758000000002 } };
const LOCAL_AFTER_DELETE = { heads: [], defs: [OTHER], mine: [], updatedAt: 1758000009999 };

(async () => {
  section('1 · ΤΟ ΣΦΑΛΜΑ ΟΠΩΣ ΤΟ ΕΙΔΕ: ΔΙΑΓΡΑΦΗ ΧΩΡΙΣ TOMBSTONE');
  {
    const b = boot(LOCAL_AFTER_DELETE, REMOTE);
    b.ctx.initCloudSync({ appKey: APP, syncedPrefixes: ['istoria:notes:'] });
    await wait(); await wait();
    const merged = JSON.parse(b.ls.getItem(KEY));
    ok('⛔ χωρίς tombstone ο union merge ΕΠΑΝΑΦΕΡΕΙ τον ορισμό — αυτό ήταν το bug',
       merged.defs.some(d => d.id === 'd-abc'));
    ok('  (και ο άλλος ορισμός μένει, άρα ο merge όντως έτρεξε)',
       merged.defs.some(d => d.id === 'd-keep'));
  }

  section('2 · ⭐⭐ ΤΟ ΠΑΛΙΟ drop(key,id) ΓΡΑΦΕΙ ΣΕ ΛΑΘΟΣ ΕΠΙΠΕΔΟ ΓΙΑ ΕΝΘΕΤΟ ΠΙΝΑΚΑ');
  {
    const b = boot(LOCAL_AFTER_DELETE, REMOTE);
    b.ctx.initCloudSync({ appKey: APP, syncedPrefixes: ['istoria:notes:'] });
    await wait();
    b.win.ALSSync.drop(KEY, 'd-abc');                       /* ΧΩΡΙΣ πεδίο — η παλιά υπογραφή */
    const t = JSON.parse(b.ls.getItem(TOMB) || '{}');
    ok('το στίγμα πέφτει στο tomb[key][\'id:…\'] — ΕΝΑ ΕΠΙΠΕΔΟ ΨΗΛΑ από το diffTomb',
       typeof t[KEY]['id:d-abc'] === 'number' && !t[KEY].defs);
    /* και γι᾽ αυτό ΔΕΝ σώζει τη διαγραφή */
    b.ls.setItem(KEY, JSON.stringify(LOCAL_AFTER_DELETE));
    const b2 = boot(LOCAL_AFTER_DELETE, REMOTE);
    b2.ls.setItem(TOMB, JSON.stringify({ [KEY]: { 'id:d-abc': Date.now() } }));
    b2.ctx.initCloudSync({ appKey: APP, syncedPrefixes: ['istoria:notes:'] });
    await wait(); await wait();
    ok('⛔ …και ο ορισμός ΞΑΝΑΕΡΧΕΤΑΙ παρά το «tombstone»',
       JSON.parse(b2.ls.getItem(KEY)).defs.some(d => d.id === 'd-abc'));
  }

  section('3 · ⭐⭐⭐ Η ΔΙΟΡΘΩΣΗ: drop(key, id, ΠΕΔΙΟ, ts)');
  {
    const b = boot(LOCAL_AFTER_DELETE, REMOTE);
    b.ctx.initCloudSync({ appKey: APP, syncedPrefixes: ['istoria:notes:'] });
    await wait();
    b.win.ALSSync.drop(KEY, 'd-abc', 'defs', DEF.ts);
    const t = JSON.parse(b.ls.getItem(TOMB) || '{}');
    ok('το στίγμα μπαίνει ΜΕΣΑ στο «defs», εκεί ακριβώς που το ψάχνει το subTomb()',
       t[KEY] && t[KEY].defs && typeof t[KEY].defs['id:d-abc'] === 'number');
    ok('⭐ και ΚΥΡΙΑΡΧΕΙ πάνω στο ts του ίδιου του ορισμού (ρολόι μπροστά)',
       t[KEY].defs['id:d-abc'] > DEF.ts);
  }

  section('4 · ⭐⭐⭐ ΜΕ ΤΟ TOMBSTONE ΣΤΗ ΣΩΣΤΗ ΘΕΣΗ, Ο ΟΡΙΣΜΟΣ ΔΕΝ ΓΥΡΙΖΕΙ');
  {
    const b = boot(LOCAL_AFTER_DELETE, REMOTE);
    b.ls.setItem(TOMB, JSON.stringify({ [KEY]: { defs: { 'id:d-abc': DEF.ts + 1 } } }));
    b.ctx.initCloudSync({ appKey: APP, syncedPrefixes: ['istoria:notes:'] });
    await wait(); await wait();
    const merged = JSON.parse(b.ls.getItem(KEY));
    is('✅ ο διαγραμμένος ορισμός ΕΜΕΙΝΕ σβηστός', merged.defs.map(d => d.id), ['d-keep']);
    ok('  …και το tombstone ΤΑΞΙΔΕΨΕ στο cloud, ώστε να μη γυρίσει ούτε από άλλη συσκευή',
       b.supa.state.pushes.length > 0
       && b.supa.state.pushes[b.supa.state.pushes.length - 1].data._deletes[KEY].defs['id:d-abc'] > 0);
  }

  section('5 · ⚠️ Η ΑΝΑΙΡΕΣΗ ΔΕΝ ΕΠΙΤΡΕΠΕΤΑΙ ΝΑ ΣΒΗΣΤΕΙ ΑΡΓΟΤΕΡΑ');
  {
    /* Ο ορισμός ξαναμπήκε τοπικά με ΤΟ ΙΔΙΟ id (η «Αναίρεση» επαναφέρει
       αυτούσιο το αντικείμενο). Το recordTomb καθαρίζει το στίγμα στο
       ΕΠΟΜΕΝΟ setItem — άρα δεν πρέπει να χαθεί ξανά. */
    const b = boot(LOCAL_AFTER_DELETE, REMOTE);
    b.ls.setItem(TOMB, JSON.stringify({ [KEY]: { defs: { 'id:d-abc': DEF.ts + 1 } } }));
    b.ctx.initCloudSync({ appKey: APP, syncedPrefixes: ['istoria:notes:'] });
    await wait();
    b.win.localStorage.setItem(KEY, JSON.stringify({ heads: [], defs: [OTHER, DEF], mine: [], updatedAt: Date.now() }));
    const t = JSON.parse(b.ls.getItem(TOMB) || '{}');
    ok('⭐ μια επαναφορά με το ΙΔΙΟ id καθαρίζει το tombstone',
       !(t[KEY] && t[KEY].defs && t[KEY].defs['id:d-abc']));
  }

  section('6 · ⛔ ΟΙ ΠΑΛΙΟΙ ΚΑΛΟΥΝΤΕΣ (top-level πίνακες) ΜΕΝΟΥΝ ΑΝΕΠΑΦΟΙ');
  {
    const b = boot(undefined, {});
    b.ls.setItem('nut:logs', JSON.stringify([{ id: 'n1', ts: 1 }]));
    b.ctx.initCloudSync({ appKey: 'nutrition', syncedPrefixes: ['nut:'] });
    await wait();
    b.win.ALSSync.drop('nut:logs', 'n1');                  /* δύο ορίσματα, όπως πάντα */
    const t = JSON.parse(b.ls.getItem('__synctomb__nutrition') || '{}');
    ok('⭐ drop(key,id) χωρίς πεδίο γράφει ΑΚΟΜΗ στο top level',
       t['nut:logs'] && typeof t['nut:logs']['id:n1'] === 'number');
  }

  section('7 · Η ΣΕΛΙΔΑ ΚΡΑΤΑΕΙ ΟΥΡΑ ΓΙΑ ΟΣΑ ΣΒΗΝΟΝΤΑΙ ΠΡΙΝ ΣΗΚΩΘΕΙ Η ΜΗΧΑΝΗ');
  {
    const P = fs.readFileSync(path.join(ALS, 'istoria-voithima.html'), 'utf8');
    ok('⭐ και οι ΔΥΟ διαγραφές (ορισμός · πλαγιότιτλος) δηλώνουν την πρόθεσή τους',
       /data-dd[\s\S]{0,260}dropSynced\("defs", gone\)/.test(P)
       && /data-dh[\s\S]{0,260}dropSynced\("heads", gone\)/.test(P));
    ok('⭐ η ουρά ρίχνεται ΜΟΛΙΣ σηκωθεί η μηχανή συγχρονισμού',
       /initCloudSync\(\{ appKey: "istoria"[\s\S]{0,200}flushDrops\(\);/.test(P));
    ok('⚠️ το κλειδί της ουράς είναι ΕΚΤΟΣ του συγχρονιζόμενου προθέματος',
       /const DROPQ = "istoria:dropq"/.test(P) && P.indexOf('"istoria:notes:dropq"') < 0);
    ok('⭐ μια ΑΝΑΙΡΕΜΕΝΗ διαγραφή δεν εκτελείται αργότερα (έλεγχος «ξαναζεί»)',
       /if \(!live\[d\.k\] \|\| !live\[d\.k\]\[d\.id\]\)/.test(P));
    ok('⛔ ΣΤΑΘ. 17: η αποτυχία εγγραφής της ουράς ΔΕΝ σιωπά',
       /catch \(e\) \{ toast\("Η διαγραφή δεν καταγράφηκε/.test(P));
    ok('⭐ και το drop καλείται ΜΕ πεδίο και ΜΕ το ts του αντικειμένου',
       /ALSSync\.drop\(d\.k, d\.id, d\.f, d\.ts\)/.test(P));
  }

  console.log('\n' + (fail ? '✗' : '✓') + ' ' + pass + ' πέρασαν · ' + fail + ' απέτυχαν');
  process.exit(fail ? 1 : 0);
})();
