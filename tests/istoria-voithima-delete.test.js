/* ══════════════════════════════════════════════════════════════════════
   Ο ΠΛΑΓΙΟΤΙΤΛΟΣ ΠΟΥ ΞΑΝΑΕΜΦΑΝΙΣΤΗΚΕ — als-v572

   Δικά του λόγια (19 Σεπ 2026): «είχα βάλει έναν λάθος πλαγιότιτλο και πήγα
   να τον σβήσω· σβήστηκε και ξαναεμφανίστηκε 5 δευτερόλεπτα μετά. Στο χα
   ξαναπεί και είχε φτιαχτεί, αλλά ξαναεμφανίστηκε το πρόβλημα.»

   ΚΑΙ ΕΙΧΕ ΟΝΤΩΣ ΦΤΙΑΧΤΕΙ — ΤΟ ΜΙΣΟ. Η als-v565 (`istoria-def-delete.test.js`)
   έκλεισε ΔΥΟ πόρτες: τα ✕ της πλαϊνής λίστας. Η σελίδα είχε ΠΕΝΤΕ:

     1. ✕ πλαγιότιτλου στη λίστα      [data-dh]  → είχε ταφόπλακα
     2. ✕ ορισμού στη λίστα           [data-dd]  → είχε ταφόπλακα
     3. «Διαγραφή» στο αναδυόμενο του πλαγιότιτλου  → ΚΑΜΙΑ
     4. «Διαγραφή» στο αναδυόμενο του ορισμού       → ΚΑΜΙΑ
     5. «Διαγραφή» πηγής                            → ΚΑΜΙΑ

   Η 3 είναι ΑΚΡΙΒΩΣ η πόρτα που χρησιμοποιεί κάποιος που μόλις έγραψε λάθος
   τίτλο: πατάει πάνω στο σημάδι, ανοίγει το αναδυόμενο, πατάει Διαγραφή.

   ⚠️⚠️ ΤΟ ΜΑΘΗΜΑ: ΕΝΑ TEST ΠΟΥ ΑΠΑΡΙΘΜΕΙ ΔΥΟ ΑΠΟ ΠΕΝΤΕ ΚΟΥΜΠΙΑ ΔΕΝ ΕΙΝΑΙ
   ΑΠΟΓΡΑΦΗ, ΕΙΝΑΙ ΔΕΙΓΜΑ — και πρασίνιζε με τρεις πόρτες ορθάνοιχτες.
   Γι᾽ αυτό το §1 εδώ ΔΕΝ ονομάζει κουμπιά: σαρώνει ΟΛΟ το αρχείο και απαιτεί
   καμία αφαίρεση από τα notes.heads/defs/mine να μη ζει έξω από το removeNote.

   ⭐⭐ ΚΑΙ Η ΔΕΥΤΕΡΗ ΑΙΤΙΑ: η μονιμότητα ενός σβησίματος εξαρτιόταν από το αν
   θα προλάβει να σηκωθεί το initCloudSync (ουρά `istoria:dropq`). Τώρα η
   σελίδα γράφει η ΙΔΙΑ την ταφόπλακα, τη στιγμή του σβησίματος. Τα §3–§5
   τρέχουν με τη μηχανή ΤΕΛΕΙΩΣ ΚΑΤΩ την ώρα της διαγραφής — το σενάριό του.

   Τρέχει ΠΡΑΓΜΑΤΙΚΟ κώδικα: τις ίδιες τις συναρτήσεις της σελίδας κομμένες
   από το αρχείο, και το ΠΡΑΓΜΑΤΙΚΟ sync.js σε vm με ψεύτικο Supabase που
   κρατάει ακόμη τον πλαγιότιτλο.
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const ALS = path.join(__dirname, '..');
const PAGE = fs.readFileSync(path.join(ALS, 'istoria-voithima.html'), 'utf8');

let pass = 0, fail = 0;
function ok(name, cond) { cond ? pass++ : fail++; console.log((cond ? '  ✓ ' : '  ✗ FAIL ') + name); }
function is(name, got, want) {
  const good = JSON.stringify(got) === JSON.stringify(want);
  good ? pass++ : fail++;
  console.log((good ? '  ✓ ' : '  ✗ FAIL ') + name + (good ? '' : `\n      got  ${JSON.stringify(got)}\n      want ${JSON.stringify(want)}`));
}
function section(s) { console.log('\n' + s); }

const CHID = 'k1-g9';
const KEY  = 'istoria:notes:' + CHID;
const APP  = 'istoria';
const TOMB = '__synctomb__' + APP;

/* ── κόβει ΠΡΑΓΜΑΤΙΚΕΣ συναρτήσεις από τη σελίδα ───────────────────────
   Όλες είναι top-level στο inline script, άρα η κλείνουσα αγκύλη τους είναι
   στη ΣΤΗΛΗ 0 — ντετερμινιστικό κόψιμο, χωρίς μέτρημα αγκυλών μέσα σε
   συμβολοσειρές. Αν κάποια μετακομίσει μέσα σε άλλη, το κόψιμο σκάει εδώ
   αντί να «περάσει» σιωπηλά. */
function grab(name, src) {
  const decl = 'function ' + name + '(';
  const i = src.indexOf(decl);
  if (i < 0) throw new Error('δεν βρέθηκε η ' + name);
  if (i > 0 && src[i - 1] !== '\n') throw new Error('η ' + name + ' δεν είναι top-level');
  const j = src.indexOf('\n}\n', i);
  if (j < 0) throw new Error('δεν βρέθηκε το τέλος της ' + name);
  return src.slice(i, j + 3);
}
function grabLine(re, src) {
  const m = re.exec(src);
  if (!m) throw new Error('δεν βρέθηκε: ' + re);
  return m[0];
}

/* ── ένα localStorage που συμπεριφέρεται σαν αληθινό ──────────────── */
function makeLS() {
  const m = new Map();
  let broken = null, swallow = null;
  return {
    /* ο δίσκος «γεμίζει» ΜΕΤΑ τη σπορά — αλλιώς δεν υπάρχει τίποτα να σβηστεί.
       ⚠️⚠️ ΔΥΟ ΤΡΟΠΟΙ ΝΑ ΑΠΟΤΥΧΕΙ ΕΝΑ ΓΡΑΨΙΜΟ, ΚΑΙ Ο ΔΕΥΤΕΡΟΣ ΕΙΝΑΙ Ο ΚΑΚΟΣ:
       ή πετάει (_breakOn, το πιάνει κάθε try/catch), ή ΔΕΝ ΓΡΑΦΕΙ ΚΑΙ ΣΩΠΑΙΝΕΙ
       (_swallowOn). Μόνο το ΞΑΝΑΔΙΑΒΑΣΜΑ ξεχωρίζει τον δεύτερο από την επιτυχία. */
    _breakOn(fn) { broken = fn; },
    _swallowOn(fn) { swallow = fn; },
    getItem: k => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => { if (broken && broken(k)) throw new Error('QuotaExceededError'); if (swallow && swallow(k)) return; m.set(k, String(v)); },
    removeItem: k => { m.delete(k); },
    key: i => Array.from(m.keys())[i],
    get length() { return m.size; },
    _dump: () => Object.fromEntries(m),
  };
}

/* ── ΤΟ ΚΟΜΜΑΤΙ ΤΗΣ ΣΕΛΙΔΑΣ, ΖΩΝΤΑΝΟ ΣΕ vm ────────────────────────────
   Στάση: η μηχανή συγχρονισμού ΔΕΝ έχει σηκωθεί (window.ALSSync άγνωστο),
   ακριβώς όπως στα πρώτα δευτερόλεπτα του PWA. */
function page(src, ls, seed) {
  const toasts = [];
  const body = [
    grabLine(/const NOTE_FIELDS = \[[^\]]*\];/, src),
    grabLine(/const TOMB_KEY = "[^"]*";/, src),
    grabLine(/const DROPQ = "[^"]*";/, src),
    grab('notesKey', src), grab('tombNote', src), grab('untombNotes', src),
    grab('repaintNotes', src), grab('removeNote', src), grab('persist', src),
    grab('undo', src), grab('normNotes', src), grab('dropQueue', src), grab('flushDrops', src),
  ].join('\n');
  const prelude = `
    var CH = { id: ${JSON.stringify(CHID)} };
    var notes = ${JSON.stringify(seed)};
    var undoStack = [], cloudOn = false, painted = 0;
    var store = {
      get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
      set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
    };
    function $(s) { return null; }           /* καμία καρτέλα ρεντεραρισμένη */
    function renderReader() {} function renderSide() {} function renderMine() { painted++; }
    function setSync() {}
    function toast(m, a) { __toasts.push(m); }
  `;
  const ctx = vm.createContext({ localStorage: ls, __toasts: toasts, Date, JSON, Object, Array, console });
  ctx.window = ctx; ctx.globalThis = ctx;
  vm.runInContext(prelude + '\n' + body, ctx, { filename: 'istoria-voithima.html#slice' });
  return { ctx, toasts };
}

/* ── ένα Supabase που κρατάει ΤΗ ΔΙΚΗ ΤΟΥ εκδοχή της γραμμής ──────── */
function makeSupa(remoteData) {
  const state = { row: { data: remoteData, updated_at: '2026-09-19T10:00:00Z' }, pushes: [] };
  const q = () => {
    const api = {
      select: () => api, eq: () => api, limit: () => api,
      maybeSingle: async () => ({ data: state.row, error: null }),
      upsert: async body => { state.pushes.push(body); state.row = { data: body.data, updated_at: new Date().toISOString() }; return { data: null, error: null }; },
    };
    api.then = res => res({ data: [], error: null });
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
function boot(ls, remoteData) {
  const supa = makeSupa(remoteData);
  const win = {
    localStorage: ls,
    supabase: { createClient: () => supa.client },
    addEventListener: () => {}, removeEventListener: () => {},
    setTimeout: fn => { fn(); return 1; }, clearTimeout: () => {},
    setInterval: () => 0, clearInterval: () => {},
    document: { addEventListener: () => {}, removeEventListener: () => {}, visibilityState: 'visible' },
    navigator: { onLine: true, sendBeacon: () => true },
    fetch: async () => ({ ok: true, status: 200, json: async () => [], text: async () => '[]' }),
    console: { log() {}, warn() {}, error() {} },
  };
  win.window = win; win.self = win; win.globalThis = win;
  const ctx = vm.createContext(win);
  vm.runInContext(fs.readFileSync(path.join(ALS, 'sync.js'), 'utf8'), ctx, { filename: 'sync.js' });
  return { ctx, win, ls, supa };
}
const wait = () => new Promise(r => setImmediate(() => setImmediate(() => setImmediate(r))));

/* ══ ΤΟ ΥΛΙΚΟ ═══════════════════════════════════════════════════════ */
const HEAD  = { id: 'h-bad',  ts: 1758200000000, s: 10, e: 40, title: 'Λάθος πλαγιότιτλος' };
const KEEP  = { id: 'h-keep', ts: 1758200000001, s: 60, e: 90, title: 'Ο σωστός' };
const DEF   = { id: 'd-1',    ts: 1758200000002, free: true, term: 'Διχασμός', text: 'ο διχασμός' };
const SRC   = { id: 'm-1',    ts: 1758200000003, title: 'Πηγή', text: 'κείμενο', note: '' };
const seed  = () => JSON.parse(JSON.stringify({ heads: [HEAD, KEEP], defs: [DEF], mine: [SRC], updatedAt: 1758200000004 }));
const REMOTE = () => ({ [KEY]: seed() });

(async () => {

section('1 · ⭐⭐⭐ ΑΠΟΓΡΑΦΗ, ΟΧΙ ΔΕΙΓΜΑ: ΚΑΜΙΑ ΔΕΥΤΕΡΗ ΠΟΡΤΑ ΣΒΗΣΙΜΑΤΟΣ');
{
  const rn = PAGE.indexOf('function removeNote(');
  const rnEnd = PAGE.indexOf('\n}\n', rn);
  ok('υπάρχει ΜΙΑ removeNote, top-level', rn > 0 && rnEnd > rn && PAGE.split('function removeNote(').length === 2);

  /* κάθε αφαίρεση από τους τρεις πίνακες σημειώσεων */
  const cuts = [];
  const re = /notes\s*(?:\.(?:heads|defs|mine)|\[[^\]\n]+\])\s*(?:=[^=]|\.splice\(|\.pop\(|\.shift\()/g;
  let m;
  while ((m = re.exec(PAGE))) cuts.push({ i: m.index, t: m[0].trim() });
  ok('το regex ΟΝΤΩΣ πιάνει αναθέσεις στους πίνακες σημειώσεων (θετικός έλεγχος)', cuts.length >= 2);
  const outside = cuts.filter(c => !(c.i > rn && c.i < rnEnd));
  is('⛔ ΚΑΜΙΑ αφαίρεση σημείωσης έξω από το removeNote', outside.map(c => c.t), []);

  /* και κάθε κουμπί διαγραφής δείχνει εκεί */
  const btns = PAGE.match(/\[data-(del|dh|dd|dm)\][^\n]*onclick[^\n]*/g) || [];
  is('πέντε κουμπιά διαγραφής — τόσα ακριβώς έχει η σελίδα', btns.length, 5);
  is('⭐ και ΚΑΘΕ ΕΝΑ τους καλεί το removeNote', btns.filter(b => !/removeNote\(/.test(b)), []);

  ok('⛔ η ουρά istoria:dropq ΔΕΝ έχει πια γραφέα (μόνο αποστράγγιση)',
     !/dropSynced/.test(PAGE) && (PAGE.match(/localStorage\.setItem\(DROPQ/g) || []).length === 1
     && /const left = q\.filter/.test(PAGE));
}

section('2 · Η ΣΕΛΙΔΑ ΓΡΑΦΕΙ ΤΗΝ ΤΑΦΟΠΛΑΚΑ ΜΟΝΗ ΤΗΣ, ΜΕ ΤΗ ΜΗΧΑΝΗ ΚΑΤΩ');
{
  const ls = makeLS(); ls.setItem(KEY, JSON.stringify(seed()));
  const p = page(PAGE, ls, seed());
  const sealed = p.ctx.removeNote('heads', 'h-bad', 'Ο πλαγιότιτλος');
  ok('το removeNote επιστρέφει ΑΛΗΘΕΣ μόνο όταν σφράγισε', sealed === true);
  is('ο πλαγιότιτλος έφυγε από το localStorage', JSON.parse(ls.getItem(KEY)).heads.map(h => h.id), ['h-keep']);
  const t = JSON.parse(ls.getItem(TOMB) || '{}');
  ok('⭐ η ταφόπλακα μπαίνει στο tomb[key].heads["id:…"] — εκεί που ψάχνει το subTomb()',
     t[KEY] && t[KEY].heads && typeof t[KEY].heads['id:h-bad'] === 'number');
  ok('⭐ και ΚΥΡΙΑΡΧΕΙ πάνω στο ts του ίδιου του αντικειμένου (ρολόι μπροστά)',
     t[KEY].heads['id:h-bad'] > HEAD.ts);
  ok('⚠️ το κλειδί της ταφόπλακας είναι ΕΚΤΟΣ του συγχρονιζόμενου προθέματος',
     TOMB.indexOf('istoria:notes:') < 0);
  ok('του το είπε με λέξεις', p.toasts.some(x => /διαγράφηκε/.test(x)));
  /* ⛔ Ούτε ταφόπλακα σε φάντασμα: ένα id που δεν υπάρχει θα σφράγιζε μια
     μελλοντική εγγραφή με το ΙΔΙΟ id — και θα την έσβηνε χωρίς να το ζητήσει. */
  const depth = p.ctx.undoStack.length;
  ok('⛔ διαγραφή ανύπαρκτου: ΨΕΥΔΕΣ, καμία ταφόπλακα, καμία αναίρεση στη στοίβα',
     p.ctx.removeNote('heads', 'δεν-υπάρχει', 'Ο πλαγιότιτλος') === false
     && !JSON.parse(ls.getItem(TOMB))[KEY].heads['id:δεν-υπάρχει']
     && p.ctx.undoStack.length === depth);
}

section('3 · ⭐⭐⭐ ΤΟ ΣΕΝΑΡΙΟ ΤΟΥ: ΣΒΗΣΙΜΟ ΜΕ ΤΗ ΜΗΧΑΝΗ ΚΑΤΩ, ΜΕΤΑ ΣΥΓΧΡΟΝΙΣΜΟΣ');
{
  const ls = makeLS(); ls.setItem(KEY, JSON.stringify(seed()));
  page(PAGE, ls, seed()).ctx.removeNote('heads', 'h-bad', 'Ο πλαγιότιτλος');
  const b = boot(ls, REMOTE());                       /* το cloud τον κρατάει ΑΚΟΜΗ */
  b.ctx.initCloudSync({ appKey: APP, syncedPrefixes: ['istoria:notes:'] });
  await wait(); await wait();
  const merged = JSON.parse(ls.getItem(KEY));
  is('✅ Ο ΠΛΑΓΙΟΤΙΤΛΟΣ ΔΕΝ ΞΑΝΑΓΥΡΙΣΕ', merged.heads.map(h => h.id), ['h-keep']);
  is('  …και τίποτε άλλο δεν χάθηκε στην πορεία',
     [merged.defs.map(d => d.id), merged.mine.map(x => x.id)], [['d-1'], ['m-1']]);
  const last = b.supa.state.pushes[b.supa.state.pushes.length - 1];
  ok('⭐ η ταφόπλακα ΤΑΞΙΔΕΨΕ στο cloud, ώστε να μη γυρίσει ούτε από άλλη συσκευή',
     !!(last && last.data._deletes && last.data._deletes[KEY].heads['id:h-bad'] > 0));
  ok('  …και ο πλαγιότιτλος έφυγε και από τη γραμμή του cloud',
     !b.supa.state.row.data[KEY].heads.some(h => h.id === 'h-bad'));
}

section('3β · ⚠️ ΡΟΛΟΙ ΑΛΛΗΣ ΣΥΣΚΕΥΗΣ ΜΠΡΟΣΤΑ — Η ΤΑΦΟΠΛΑΚΑ ΠΡΕΠΕΙ ΝΑ ΚΥΡΙΑΡΧΕΙ');
{
  /* Το κινητό που έγραψε τον πλαγιότιτλο έχει ρολόι 10 λεπτά μπροστά. Μια
     ταφόπλακα στο σκέτο `now` ΔΕΝ τον σκοτώνει: το tombed() κρύβει μόνο ό,τι
     προστέθηκε ΠΡΙΝ από αυτήν, άρα ο πλαγιότιτλος νικάει την ίδια του την
     ταφόπλακα και γυρίζει για πάντα. Γι᾽ αυτό T = max(now, ts + 1). */
  const future = { id: 'h-skew', ts: Date.now() + 600000, s: 5, e: 9, title: 'Από το κινητό' };
  const st = { heads: [future, KEEP], defs: [], mine: [], updatedAt: 1 };
  const ls = makeLS(); ls.setItem(KEY, JSON.stringify(st));
  page(PAGE, ls, JSON.parse(JSON.stringify(st))).ctx.removeNote('heads', 'h-skew', 'Ο πλαγιότιτλος');
  const b = boot(ls, { [KEY]: JSON.parse(JSON.stringify(st)) });
  b.ctx.initCloudSync({ appKey: APP, syncedPrefixes: ['istoria:notes:'] });
  await wait(); await wait();
  is('✅ σβήνει ακόμη κι όταν το ts του είναι στο ΜΕΛΛΟΝ',
     JSON.parse(ls.getItem(KEY)).heads.map(h => h.id), ['h-keep']);
}

section('4 · ΙΔΙΟ ΑΠΟΤΕΛΕΣΜΑ ΓΙΑ ΟΡΙΣΜΟ ΚΑΙ ΓΙΑ ΠΗΓΗ (οι άλλες δύο ξεχασμένες πόρτες)');
for (const [field, id] of [['defs', 'd-1'], ['mine', 'm-1']]) {
  const ls = makeLS(); ls.setItem(KEY, JSON.stringify(seed()));
  page(PAGE, ls, seed()).ctx.removeNote(field, id, 'Το');
  const b = boot(ls, REMOTE());
  b.ctx.initCloudSync({ appKey: APP, syncedPrefixes: ['istoria:notes:'] });
  await wait(); await wait();
  is('✅ ' + field + ': σβήστηκε και ΕΜΕΙΝΕ σβηστό', JSON.parse(ls.getItem(KEY))[field].map(x => x.id), []);
}

section('5 · ⚠️ Η ΑΝΑΙΡΕΣΗ ΔΕΝ ΕΠΙΤΡΕΠΕΤΑΙ ΝΑ ΑΝΑΙΡΕΘΕΙ ΜΟΝΗ ΤΗΣ');
{
  const ls = makeLS(); ls.setItem(KEY, JSON.stringify(seed()));
  const p = page(PAGE, ls, seed());
  p.ctx.removeNote('heads', 'h-bad', 'Ο πλαγιότιτλος');
  p.ctx.undo();
  const t = JSON.parse(ls.getItem(TOMB) || '{}');
  ok('⭐ η αναίρεση ΣΗΚΩΝΕΙ την ταφόπλακα (ίδιο id, παλιό ts — αλλιώς πεθαίνει ξανά)',
     !(t[KEY] && t[KEY].heads && t[KEY].heads['id:h-bad']));
  const b = boot(ls, REMOTE());
  b.ctx.initCloudSync({ appKey: APP, syncedPrefixes: ['istoria:notes:'] });
  await wait(); await wait();
  ok('✅ …και επιβιώνει ολόκληρου του κύκλου pull → merge → push',
     JSON.parse(ls.getItem(KEY)).heads.some(h => h.id === 'h-bad'));
}

section('6 · ⛔ ΣΤΑΘ. 10: ΑΠΟΤΥΧΗΜΕΝΟ ΓΡΑΨΙΜΟ ΔΕΝ ΜΟΙΑΖΕΙ ΜΕ ΠΕΤΥΧΗΜΕΝΟ');
{
  /* Ο δίσκος αρνείται ΜΟΝΟ την ταφόπλακα: το σβήσιμο έγινε, η σφραγίδα όχι. */
  const ls = makeLS(); ls.setItem(KEY, JSON.stringify(seed())); ls._breakOn(k => k === TOMB);
  const p = page(PAGE, ls, seed());
  const sealed = p.ctx.removeNote('heads', 'h-bad', 'Ο πλαγιότιτλος');
  ok('επιστρέφει ΨΕΥΔΕΣ', sealed === false);
  ok('⭐ και ΤΟΥ ΤΟ ΛΕΕΙ ότι μπορεί να ξαναγυρίσει',
     p.toasts.some(x => /ΔΕΝ σφραγίστηκε/.test(x)));

  /* Ο δίσκος αρνείται το ΙΔΙΟ το σβήσιμο: τότε ΚΑΜΙΑ ταφόπλακα. */
  const ls2 = makeLS(); ls2.setItem(KEY, JSON.stringify(seed())); ls2._breakOn(k => k === KEY);
  const p2 = page(PAGE, ls2, seed());
  /* ⭐⭐ Ο ΣΙΩΠΗΛΟΣ ΔΙΣΚΟΣ: γράφει «εντάξει» και δεν κρατάει τίποτα. */
  const ls4 = makeLS(); ls4.setItem(KEY, JSON.stringify(seed())); ls4._swallowOn(k => k === TOMB);
  const p4 = page(PAGE, ls4, seed());
  const s4 = p4.ctx.removeNote('heads', 'h-bad', 'Ο πλαγιότιτλος');
  ok('⭐⭐ δίσκος που ΣΩΠΑΙΝΕΙ αντί να πετάξει: μόνο το ξαναδιάβασμα τον πιάνει',
     s4 === false && p4.toasts.some(x => /ΔΕΝ σφραγίστηκε/.test(x)));

  ok('⭐ ταφόπλακα ΜΟΝΟ μετά από επιβεβαιωμένο γράψιμο — καμία σφραγίδα εδώ',
     p2.ctx.removeNote('heads', 'h-bad', 'Ο πλαγιότιτλος') === false
     && !JSON.parse(ls2.getItem(TOMB) || '{}')[KEY]);
}

section('7 · ⭐⭐ ΔΥΟ ΜΗΧΑΝΕΣ ΣΤΗΝ ΙΔΙΑ ΣΕΛΙΔΑ: ΤΟ drop ΒΡΙΣΚΕΙ ΤΗ ΣΩΣΤΗ');
{
  const ls = makeLS();
  ls.setItem(KEY, JSON.stringify(seed()));
  ls.setItem('nut:logs', JSON.stringify([{ id: 'n1', ts: 1 }]));
  const b = boot(ls, {});
  b.ctx.initCloudSync({ appKey: APP, syncedPrefixes: ['istoria:notes:'] });
  b.ctx.initCloudSync({ appKey: 'nutrition', syncedPrefixes: ['nut:'] });   /* σηκώνεται ΔΕΥΤΕΡΗ */
  await wait();
  ok('⛔ (πριν) η τελευταία μηχανή θα έτρωγε σιωπηλά το drop της πρώτης — τώρα όχι',
     b.win.ALSSync.drop(KEY, 'h-bad', 'heads', HEAD.ts) === true);
  const t = JSON.parse(ls.getItem(TOMB) || '{}');
  ok('η ταφόπλακα γράφτηκε στη ΔΙΚΗ ΤΗΣ μηχανή (__synctomb__istoria)',
     t[KEY] && t[KEY].heads && t[KEY].heads['id:h-bad'] > HEAD.ts);
  ok('⭐ οι παλιοί καλούντες (top-level πίνακας) δουλεύουν ακριβώς όπως πριν',
     b.win.ALSSync.drop('nut:logs', 'n1') === true
     && JSON.parse(ls.getItem('__synctomb__nutrition'))['nut:logs']['id:n1'] > 0);
  ok('⛔ κλειδί που δεν ανήκει σε καμία μηχανή επιστρέφει ΨΕΥΔΕΣ, δεν σωπαίνει',
     b.win.ALSSync.drop('ist:v1', 'p_x', 'plag', 1) === false);
  ls._breakOn(k => k === TOMB);   /* το saveTomb() του sync.js καταπίνει το σφάλμα */
  ok('⭐⭐ το drop() του sync.js δεν λέει «σφράγισα» χωρίς να ξαναδιαβάσει τον δίσκο',
     b.win.ALSSync.drop(KEY, 'h-keep', 'heads', KEEP.ts) === false);
  ls._breakOn(null);

  ok('⭐ και μια read-only εγγραφή ΔΕΝ σφραγίζει διαγραφές',
     (function () {
       const ls2 = makeLS(); const b2 = boot(ls2, {});
       ls2.setItem('nut:logs', JSON.stringify([{ id: 'n9', ts: 1 }]));
       b2.ctx.initCloudSync({ appKey: 'nutrition', syncedPrefixes: ['nut:'], readOnly: true });
       return b2.win.ALSSync.drop('nut:logs', 'n9') === false;
     })());
}

section('8 · Η ΠΑΛΙΑ ΟΥΡΑ ΑΠΟΣΤΡΑΓΓΙΖΕΤΑΙ ΚΑΙ ΔΕΝ ΧΑΝΕΤΑΙ');
{
  const ls = makeLS(); ls.setItem(KEY, JSON.stringify({ heads: [KEEP], defs: [], mine: [], updatedAt: 1 }));
  ls.setItem('istoria:dropq', JSON.stringify([{ k: KEY, id: 'h-bad', f: 'heads', ts: HEAD.ts }]));
  const b = boot(ls, {});
  b.ctx.initCloudSync({ appKey: APP, syncedPrefixes: ['istoria:notes:'] });
  await wait();
  const p = page(PAGE, ls, { heads: [KEEP], defs: [], mine: [], updatedAt: 1 });
  p.ctx.window.ALSSync = b.win.ALSSync;
  p.ctx.flushDrops();
  ok('⭐ μια πρόθεση από παλιά έκδοση γίνεται ταφόπλακα', 
     JSON.parse(ls.getItem(TOMB))[KEY].heads['id:h-bad'] > HEAD.ts);
  ok('  …και η ουρά αδειάζει', !ls.getItem('istoria:dropq'));

  /* και ό,τι ΔΕΝ επιβεβαιώθηκε ΜΕΝΕΙ */
  const ls3 = makeLS(); ls3.setItem(KEY, JSON.stringify({ heads: [KEEP], defs: [], mine: [], updatedAt: 1 }));
  ls3.setItem('istoria:dropq', JSON.stringify([{ k: 'ist:v1', id: 'p_x', f: 'plag', ts: 1 }]));
  const p3 = page(PAGE, ls3, { heads: [KEEP], defs: [], mine: [], updatedAt: 1 });
  p3.ctx.window.ALSSync = { drop: () => false };
  p3.ctx.flushDrops();
  is('⛔ πρόθεση που ΔΕΝ σφραγίστηκε δεν σβήνεται από την ουρά',
     (JSON.parse(ls3.getItem('istoria:dropq') || '[]') || []).map(d => d.id), ['p_x']);
}

console.log('\n' + (fail ? '✗' : '✓') + ' ' + pass + ' πέρασαν · ' + fail + ' απέτυχαν');
process.exit(fail ? 1 : 0);
})();
