/* ══════════════════════════════════════════════════════════════════════
   tests/tonos-sessions.test.js — ΤΟ ΣΥΜΒΟΛΑΙΟ, ΑΠΟ ΤΗ ΜΕΡΙΑ ΤΟΥ ΓΡΑΦΕΑ

   Ο Τονισμός είναι η ΠΡΩΤΗ σελίδα που αναφέρει πίσω στο command center, και
   διαλέχτηκε επειδή είναι η μικρότερη με καθαρό κύκλο συνεδρίας: ένα λάθος
   εδώ κοστίζει λιγότερο απ' ό,τι σε πέντε σελίδες μαζί (ΤΟ ΧΡΕΟΣ V2, §2.3).

   Οδηγεί την ΑΛΗΘΙΝΗ `tonos.html` — το inline script της, τη μηχανή της και
   το αληθινό `study-stamp.js` — μέσα σε `vm` με στουμπωμένο DOM. Ποτέ
   αντίγραφο: ένα αντίγραφο συμφωνεί με κάθε bug τέλεια.

   Τι αποδεικνύει, με τη σειρά που θα έσπαγε:
     Α · μια ΤΕΛΕΙΩΜΕΝΗ εξέταση γράφει ΜΙΑ εγγραφή, με πραγματική διάρκεια
     Β · μια ΠΑΡΑΤΗΜΕΝΗ γράφει `fin:0` — το πεδίο που δεν κρατάει κανείς
     Γ · ένα άνοιγμα χωρίς απάντηση δεν γράφει τίποτα (παραπάτημα ≠ σήμα)
     Δ · ⚠️ το `load()` ΔΕΝ σβήνει συνεδρίες που ήρθαν από άλλη συσκευή
     Ε · γράφεται ΜΟΝΟ το `ton:v1` (σταθερή αρχή 16)
     ΣΤ · το `ladders.js` διαβάζει ΑΥΤΟ ΑΚΡΙΒΩΣ που έγραψε η σελίδα —
          ο κύκλος κλείνει σε ένα test, όχι σε δύο που συμφωνούν κατά τύχη
     Ζ · τα υπάρχοντα (`cells`, `days`, η σκάλα) δεν άλλαξαν

   ⚠️ ΑΝΑΙΡΕΣΗ ΤΗΣ ΔΙΟΡΘΩΣΗΣ ΠΡΕΠΕΙ ΝΑ ΤΟ ΚΟΚΚΙΝΙΣΕΙ: βγάλε το
   `base.sessions = …` από το `load()` και πέφτει το Δ· βγάλε το
   `logSession(0)` από το `endSession()` και πέφτει το Β.
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

const PAGE = fs.readFileSync(path.join(ALS, 'tonos.html'), 'utf8');
const ENGINE = fs.readFileSync(path.join(ALS, 'tonos-engine.js'), 'utf8');
const STAMPJS = fs.readFileSync(path.join(ALS, 'study-stamp.js'), 'utf8');
const L = require(path.join(ALS, 'ladders.js'));

/* ── το inline script της σελίδας, χωρίς κανένα αντίγραφο ─────────────
   ⚠️ Η βελόνα είναι το `src=` ΠΛΑΙΣΙΟ (σταθερή αρχή 19): τα `<script src>`
   της σελίδας δεν εκτελούνται εδώ — φορτώνουμε ρητά τα δύο που χρειάζεται. */
const inline = (PAGE.match(/<script>([\s\S]*?)<\/script>/g) || [])
  .map(b => b.replace(/^<script>/, '').replace(/<\/script>$/, ''));
const CARRY = inline.filter(b => /function logSession/.test(b));
if (CARRY.length !== 1) throw new Error('tonos.html no longer has exactly one inline <script> carrying logSession — the contract is gone');
const BODY = CARRY[0];

/* ══════════════════════════════════════════════════════════════════════
   ΤΟ ΣΤΟΥΜΠΩΜΕΝΟ DOM — αρκετό για να ΟΔΗΓΗΘΕΙ η σελίδα, όχι για να
   ζωγραφιστεί. Τα κουμπιά επιλογών γεννιούνται από το ΙΔΙΟ το markup που
   γράφει η σελίδα, ώστε ένα κλικ να τρέχει τον αληθινό `answer()`.
   ══════════════════════════════════════════════════════════════════════ */
function makeEnv(seed) {
  const store = {};
  const writes = [];                       /* ΚΑΘΕ κλειδί που γράφτηκε ποτέ */
  const localStorage = {
    getItem(k) { return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
    setItem(k, v) { writes.push(k); store[k] = String(v); },
    removeItem(k) { writes.push(k); delete store[k]; }
  };

  function classList() {
    const s = new Set();
    return { add: c => s.add(c), remove: c => s.delete(c), contains: c => s.has(c), toggle: c => (s.has(c) ? s.delete(c) : s.add(c)) };
  }
  function kid(attr, val) {
    const b = {
      _on: {}, classList: classList(), style: {},
      getAttribute: n => (n === attr ? val : null),
      setAttribute() { }, removeAttribute() { }, focus() { },
      addEventListener(t, f) { (b._on[t] = b._on[t] || []).push(f); },
      click() { (b._on.click || []).forEach(f => f.call(b, {})); }
    };
    return b;
  }
  /* Ένα «στοιχείο» ξέρει μόνο ό,τι του έγραψε η σελίδα. Το `tnOpts` ζει
     ΜΕΣΑ στο `tnQ`, οπότε δείχνει στο ίδιο markup — αλλιώς ο `answer()` δεν
     θα έβρισκε ποτέ τα κουμπιά που μόλις ζωγράφισε ο `renderCard()`. */
  const ALIAS = { tnOpts: 'tnQ' };
  const els = {};
  function el(id) {
    if (els[id]) return els[id];
    const e = els[id] = {
      id, textContent: '', scrollTop: 0, onclick: null,
      _html: '', _kids: {}, _on: {}, classList: classList(), style: {},
      get innerHTML() { return e._html; },
      set innerHTML(v) {
        e._html = String(v);
        e._kids = {};
        ['data-n', 'data-cell', 'data-w'].forEach(a => {
          const re = new RegExp(a + '="([^"]*)"', 'g');
          const out = []; let m;
          while ((m = re.exec(e._html))) out.push(kid(a, m[1]));
          e._kids[a] = out;
        });
      },
      addEventListener(t, f) { (e._on[t] = e._on[t] || []).push(f); },
      removeEventListener() { }, setAttribute() { }, removeAttribute() { },
      getAttribute() { return null; }, focus() { }, close() { }, showModal() { },
      querySelectorAll(sel) { const a = (sel.match(/data-[a-z]+/) || [])[0]; return (e._kids[a] || []).slice(); },
      querySelector(sel) { return e.querySelectorAll(sel)[0] || null; },
      /* ⚠️⚠️ ΤΟ DOM ΑΝΤΙΓΡΑΦΕΙ ΤΗ ΛΙΣΤΑ ΑΚΡΟΑΤΩΝ ΠΡΙΝ ΤΗ ΔΙΑΝΟΜΗ, και το
         `onclick` που ανατίθεται ΜΕΣΑ σε έναν handler ΔΕΝ τρέχει για το ίδιο
         συμβάν. Η πρώτη γραφή αυτού του harness το διάβαζε ΜΕΤΑ τους
         ακροατές, οπότε το «τελευταία απάντηση» και το «Τέλος» έπεφταν σε
         ΕΝΑ κλικ — και ένα πραγματικό bug έμενε αόρατο πίσω από πράσινο.
         Σταθερή αρχή 30: πριν πιστέψεις μια αποτυχία ή μια επιτυχία, έλεγξε
         το όργανο. */
      fire(t) {
        const ls = (e._on[t] || []).slice();
        const oc = e.onclick;
        ls.forEach(f => f.call(e, {}));
        if (t === 'click' && typeof oc === 'function') oc.call(e, {});
      }
    };
    return e;
  }
  const document = {
    body: { style: {} },
    getElementById: id => el(ALIAS[id] || id),
    querySelector: () => null,
    addEventListener() { }, removeEventListener() { },
    createElement: () => el('_tmp' + Math.random())
  };

  const clock = { t: Date.parse('2026-08-11T09:00:00') };
  const ctx = {
    document, localStorage, console,
    setTimeout: () => 0, clearTimeout: () => { }, setInterval: () => 0,
    JSON, Math, Object, Array, String, Number, Boolean, isFinite, isNaN, parseInt, parseFloat, Error, RegExp
  };
  ctx.window = ctx;
  ctx.global = ctx;
  vm.createContext(ctx);

  /* ⚠️ Ένα ΔΙΚΟ ΤΟΥ Date.now, ώστε το `ms` να είναι ΜΕΤΡΗΣΗ και όχι
     «κάτι μικρό και θετικό». Μια βεβαίωση που δέχεται οποιονδήποτε αριθμό
     δεν ελέγχει διάρκεια, ελέγχει ότι δεν έσκασε.
     Και ένα ΝΤΕΤΕΡΜΙΝΙΣΤΙΚΟ Math.random, ώστε η ίδια εντολή να δίνει την
     ίδια εξέταση σε κάθε μηχανή. */
  ctx.__clock = clock;
  ctx.__seed = seed;
  vm.runInContext(
    'Date.now = function(){ return __clock.t; };' +
    'Math.random = (function(){ var s = __seed; return function(){ s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; }; })();',
    ctx);

  vm.runInContext(ENGINE, ctx, { filename: 'tonos-engine.js' });
  vm.runInContext(STAMPJS, ctx, { filename: 'study-stamp.js' });

  return {
    ctx, store, writes, clock, el,
    boot() { vm.runInContext(BODY, ctx, { filename: 'tonos.html' }); },
    tick(ms) { clock.t += ms; },
    read() { return JSON.parse(store['ton:v1'] || 'null'); }
  };
}

/* ══════════════════════════════════════════════════════════════════════
   Α · ΜΙΑ ΤΕΛΕΙΩΜΕΝΗ ΕΞΕΤΑΣΗ
   ══════════════════════════════════════════════════════════════════════ */
section('Α · μια τελειωμένη εξέταση γράφει ΜΙΑ εγγραφή, με αληθινή διάρκεια');

/* Παίζει μια εξέταση όπως θα την έπαιζε άνθρωπος: μία επιλογή ανά ερώτηση,
   «Επόμενη» μετά, και **«Τέλος» πάνω στη σύνοψη** — αυτό το τελευταίο κλικ
   είναι που έκρυβε ένα πραγματικό bug. `stop` = παρατάει μετά από N.
   `per` = πόσα ms κρατάει κάθε ερώτηση. */
function play(env, opts) {
  opts = opts || {};
  env.boot();
  const tnQ = env.el('tnQ'), tnNext = env.el('tnNext');
  env.el('tnCta').fire('click');
  let answered = 0;
  for (; ;) {
    const btns = tnQ.querySelectorAll('[data-n]');
    if (!btns.length) break;                         /* η σύνοψη είναι στην οθόνη */
    if (opts.stop && answered === opts.stop) return answered;
    btns[opts.wrong ? btns.length - 1 : 0].click();
    answered++;
    if (opts.per) env.tick(opts.per);
    tnNext.fire('click');
  }
  if (!opts.keepOpen) tnNext.fire('click');          /* «Τέλος» */
  return answered;
}

/* Μια πλήρη εξέταση 12 ερωτήσεων, με 30 δευτερόλεπτα ανά ερώτηση. */
{
  const env = makeEnv(7);
  const answered = play(env, { per: 30000 });
  const st = env.read();
  is('απαντήθηκαν και οι 12', answered, 12);
  is('γράφτηκε ΑΚΡΙΒΩΣ μία συνεδρία', st.sessions.length, 1);
  const s = st.sessions[0];
  is('τελειωμένη', s.fin, 1);
  is('η διάρκεια είναι 12 × 30″ = 6 λεπτά, μετρημένη', s.ms, 12 * 30000);
  is('η έναρξη είναι η ώρα που πάτησε ΞΕΚΙΝΑ', s.ts, Date.parse('2026-08-11T09:00:00'));
  is('asked = όσες απάντησε', s.asked, 12);
  is('το mode είναι το λεξιλόγιο ΤΗΣ σελίδας', s.mode, 'drill');
  ok('το id είναι μοναδικό και όχι σκέτο timestamp', /^t[a-z0-9]{9,}$/.test(s.id));
  ok('το right είναι μεταξύ 0 και asked', s.right >= 0 && s.right <= s.asked);
  is('μια μεικτή εξέταση δεν ισχυρίζεται ένα κελί', s.unit, '');
  is('το pass είναι το «καθαρό πέρασμα» της σκάλας της', s.pass, s.right === s.asked ? 1 : 0);

  section('Α.1 · και η μέρα ΔΕΝ διπλομετρήθηκε');
  /* Το «Τέλος» πυροδοτεί ΚΑΙ τον listener του tnNext ΚΑΙ το onclick που του
     έβαλε ο summary(). Χωρίς φρουρό ο summary() ξανατρέχει και προσθέτει
     δεύτερη φορά 12 ερωτήσεις στο `days` — ένα νούμερο στην οθόνη του
     («N έγιναν σήμερα») διπλάσιο από την αλήθεια. */
  is('μία μέρα, 12 ερωτήσεις — όχι 24', st.days.map(d => d.q), [12]);
  is('και μία μόνο συνεδρία, όχι δύο', st.sessions.length, 1);
}

/* ══════════════════════════════════════════════════════════════════════
   Β · Η ΕΓΚΑΤΑΛΕΙΨΗ
   ══════════════════════════════════════════════════════════════════════ */
section('Β · μια παρατημένη εξέταση είναι ΣΗΜΑ, όχι σιωπή');
{
  const env = makeEnv(11);
  play(env, { per: 20000, stop: 4 });
  env.el('tnClose').fire('click');            /* το ✕ */
  const st = env.read();
  is('γράφτηκε, όχι σιωπηλά χαμένη', st.sessions.length, 1);
  const s = st.sessions[0];
  is('⭐ fin:0 — το πεδίο που δεν καταγράφει κανείς άλλος', s.fin, 0);
  is('asked = μόνο όσες πρόλαβε', s.asked, 4);
  is('η διάρκεια είναι 4 × 20″', s.ms, 4 * 20000);
  is('μια παρατημένη δεν περνάει ποτέ', s.pass, 0);
  is('και η μέρα ΔΕΝ πήρε εγγραφή — ο summary δεν έτρεξε', st.days.length, 0);
}

section('Γ · ένα άνοιγμα χωρίς καμία απάντηση είναι παραπάτημα, όχι σήμα');
{
  const env = makeEnv(3);
  env.boot();
  env.el('tnCta').fire('click');
  env.tick(1500);
  env.el('tnClose').fire('click');
  const st = env.read();
  is('καμία συνεδρία', (st && st.sessions ? st.sessions.length : 0), 0);
}

/* ══════════════════════════════════════════════════════════════════════
   Δ · ⚠️ ΤΟ `load()` ΞΑΝΑΧΤΙΖΕΙ ΤΗΝ ΚΑΤΑΣΤΑΣΗ ΑΠΟ ΤΟ `blank()`
   Αντιγράφει ΜΟΝΟ όσα πεδία ονομάζει ρητά, οπότε ένα `sessions` που
   κατέβηκε από άλλη συσκευή θα εξαφανιζόταν στο επόμενο `save()` — και
   σιωπηλά, γιατί η οθόνη δεν το δείχνει πουθενά.
   ══════════════════════════════════════════════════════════════════════ */
section('Δ · μια συνεδρία από άλλη συσκευή επιβιώνει μιας φόρτωσης');
{
  const env = makeEnv(5);
  const OLD = { id: 'cloud1', ts: Date.parse('2026-08-09T21:00:00'), ms: 420000, unit: '', mode: 'drill', asked: 12, right: 9, pass: 0, fin: 1 };
  env.store['ton:v1'] = JSON.stringify({
    v: 1,
    cells: { spirit: { r: 4, w: 1, due: 0, streak: 2 } },
    days: [{ id: '2026-08-09', q: 12, r: 9 }],
    sessions: [OLD]
  });
  play(env, { per: 15000 });
  const st = env.read();
  is('η παλιά είναι ακόμη εκεί', st.sessions.filter(s => s.id === 'cloud1').length, 1);
  is('και η καινούργια μπήκε δίπλα της', st.sessions.length, 2);
  is('η προϋπάρχουσα πρόοδος του κελιού δεν χάθηκε', st.cells.spirit.r >= 4, true);
  is('ούτε η προϋπάρχουσα μέρα', st.days.filter(d => d.id === '2026-08-09').length, 1);
}

/* ══════════════════════════════════════════════════════════════════════
   Ε · ΣΤΑΘΕΡΗ ΑΡΧΗ 16 — γράφεται ΜΟΝΟ η δική της αποθήκη
   ══════════════════════════════════════════════════════════════════════ */
section('Ε · η σελίδα γράφει ΜΟΝΟ το ton:v1');
{
  const env = makeEnv(9);
  play(env, { per: 10000 });
  env.el('tnClose').fire('click');
  const uniq = Array.from(new Set(env.writes));
  is('ένα κλειδί, το δικό της', uniq, ['ton:v1']);
  ok('καμία νέα αποθήκη για τις συνεδρίες', uniq.indexOf('ton:sessions') < 0);
}

/* ══════════════════════════════════════════════════════════════════════
   ΣΤ · Ο ΚΥΚΛΟΣ ΚΛΕΙΝΕΙ — το ladders.js διαβάζει ΑΥΤΟ που έγραψε η σελίδα
   Δύο tests που συμφωνούν σε ένα fixture μπορεί να συμφωνούν σε ένα λάθος.
   Εδώ ο γραφέας τροφοδοτεί τον αναγνώστη απευθείας.
   ══════════════════════════════════════════════════════════════════════ */
section('ΣΤ · ό,τι γράφει ο Τονισμός, το διαβάζει το command center');
{
  const raw = { v: 1, cells: {}, days: [], sessions: [] };
  /* Τρεις πραγματικές εξετάσεις, γραμμένες από την ΙΔΙΑ τη σελίδα. */
  [[7, 20000], [11, 40000], [5, 60000]].forEach(([seed, per], n) => {
    const env = makeEnv(seed);
    env.store['ton:v1'] = JSON.stringify(raw);
    env.clock.t = Date.parse('2026-08-0' + (5 + n) + 'T10:00:00');
    play(env, { per });
    Object.assign(raw, JSON.parse(env.store['ton:v1']));
  });
  is('τρεις συνεδρίες γράφτηκαν από τη σελίδα', raw.sessions.length, 3);

  const R = L.read({ get: k => (k === 'ton:v1' ? JSON.stringify(raw) : null), now: Date.parse('2026-08-11T12:00:00') });
  const st = R.byKey['ton:v1'];
  is('το ladders.js τις διαβάζει όλες', st.sessions.length, 3);
  ok('όλες τελειωμένες', st.sessions.every(s => s.fin === 1));
  /* ΣΤΟ ΧΕΡΙ: 12 ερωτήσεις × 20″ / 40″ / 60″ = 4′ / 8′ / 12′ → διάμεσος 8′. */
  is('⭐ η ΔΙΑΡΚΕΙΑ φτάνει στο command center: διάμεσος 8 λεπτά', st.typical.drill, 8);
  is('και σε ms', st.typicalMs.drill, 8 * 60000);
  is('καμία εγκατάλειψη σε αυτές τις τρεις', st.abandoned, { of: 3, count: 0 });
  is('καμία εγγραφή δεν απορρίφθηκε — ο γραφέας και ο αναγνώστης συμφωνούν', st.sessionsDropped, 0);
  is('και το byHour τις βάζει στις 10:00', [st.byHour[10].n, st.byHour[10].done], [3, 3]);
}

/* ══════════════════════════════════════════════════════════════════════
   Ζ · ΤΙΠΟΤΑ ΥΠΑΡΧΟΝ ΔΕΝ ΑΛΛΑΞΕ
   ══════════════════════════════════════════════════════════════════════ */
section('Ζ · η σκάλα, τα κελιά και η στατική δομή μένουν όπως ήταν');
{
  const env = makeEnv(13);
  play(env, { per: 5000 });
  const st = env.read();
  ok('το `cells` είναι ακόμη ΧΑΡΤΗΣ, όχι πίνακας', st.cells && !Array.isArray(st.cells));
  ok('κάθε κελί κρατάει r/w/due/streak', Object.keys(st.cells).every(k => {
    const c = st.cells[k];
    return typeof c.r === 'number' && typeof c.w === 'number' && 'due' in c && 'streak' in c;
  }));
  ok('το `days` κρατιέται στα 90', st.days.length <= 90);
  is('το v δεν άλλαξε', st.v, 1);

  section('Ζ.1 · το `sessions` ΔΕΝ σφραγίζεται από το study-stamp');
  /* Το `readMaps` του `study-stamp.js` επιστρέφει ΜΟΝΟ τα `cells`. Ένας
     πίνακας από `{id, ts}` λύνεται από το `mergeArray` κατά ένωση — ένα
     `_ts` εκεί θα ήταν σφραγίδα σε κάτι που δεν ξαναγράφεται ποτέ. */
  ok('καμία συνεδρία δεν κουβαλάει _ts', st.sessions.every(s => !('_ts' in s)));
  ok('ενώ τα κελιά που άγγιξε ΚΟΥΒΑΛΑΝΕ (σταθερή αρχή 31)',
    Object.keys(st.cells).some(k => '_ts' in st.cells[k]));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
