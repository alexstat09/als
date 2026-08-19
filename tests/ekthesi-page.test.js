/* ══════════════════════════════════════════════════════════════════════
   tests/ekthesi-page.test.js — Ο ΒΡΟΧΟΣ ΤΗΣ ΕΞΑΣΚΗΣΗΣ, ΟΔΗΓΗΜΕΝΟΣ ΑΛΗΘΙΝΑ

   Οδηγεί την ΑΛΗΘΙΝΗ `ekthesi.html` — το inline script της, την αληθινή
   μηχανή, τα αληθινά δεδομένα, το αληθινό `study-stamp.js` — μέσα σε `vm`
   με στουμπωμένο DOM. ΠΟΤΕ αντίγραφο: ένα αντίγραφο συμφωνεί με κάθε bug
   τέλεια (ίδιος νόμος με το tonos-sessions.test.js).

   Υπάρχει επειδή η σελίδα ξαναγράφτηκε ΟΛΟΚΛΗΡΗ όταν ο Αλεξ είπε ότι ο
   καθηγητής ΔΕΝ βαθμολογεί, και η μηχανή (183 βεβαιώσεις) δεν αγγίζει
   τίποτα από αυτά: η σκάλα, η ουρά και το τι ανάβει ζουν ΜΟΝΟ εδώ.

   Τι αποδεικνύει, με τη σειρά που θα έσπαγε:
     Α · ΠΛΑΤΟΣ ΠΡΙΝ ΒΑΘΟΣ — οι πρώτες 16 ερωτήσεις είναι 16 ΔΙΑΦΟΡΕΤΙΚΕΣ λέξεις
     Β · ΔΕΝ ξαναρωτάει ποτέ ό,τι κατέχει
     Γ · ⭐ ΤΟ ΝΗΜΑ ΔΕΝ ΤΙΜΩΡΕΙ — σωστό με νήμα ΔΕΝ ρίχνει κουτί
     Δ · δέχεται ΟΠΟΙΟΔΗΠΟΤΕ στοιχείο της στήλης, όχι μόνο το προγραμματισμένο
     Ε · λάθος στήλη → ξαναρωτάει, δεν χρεώνει τίποτα
     ΣΤ · γράφεται ΜΟΝΟ το `ekt:v1` (σταθερή αρχή 16)
     Ζ · το `load()` ΔΕΝ σβήνει συνεδρίες που ήρθαν από άλλη συσκευή
     Η · λέξη ΑΓΓΙΧΤΗ ≠ λέξη άθικτη — η άθικτη δεν χρωστάει τίποτα
     Θ · το `ladders.js` διαβάζει ΑΥΤΟ ΑΚΡΙΒΩΣ που έγραψε η σελίδα
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

const PAGE = fs.readFileSync(path.join(ALS, 'ekthesi.html'), 'utf8');
const D = require(path.join(ALS, 'ekthesi-data.js'));
const E = require(path.join(ALS, 'ekthesi-engine.js'));
const L = require(path.join(ALS, 'ladders.js'));

/* ⚠️ Η βελόνα είναι το inline μπλοκ που κουβαλάει τον βρόχο. Αν πάψει να
   υπάρχει ακριβώς ένα, το συμβόλαιο άλλαξε και το test το λέει δυνατά. */
const inline = (PAGE.match(/<script>([\s\S]*?)<\/script>/g) || [])
  .map(b => b.replace(/^<script>/, '').replace(/<\/script>$/, ''));
const CARRY = inline.filter(b => /function queue\(/.test(b) && /function bump\(/.test(b));
if (CARRY.length !== 1) throw new Error('ekthesi.html δεν έχει πια ΑΚΡΙΒΩΣ ένα inline script με queue() + bump()');
const BODY = CARRY[0];

/* ══════════════════════════════════════════════════════════════════════
   ΤΟ ΣΤΟΥΜΠΩΜΕΝΟ DOM — αρκετό για να ΟΔΗΓΗΘΕΙ, όχι για να ζωγραφιστεί.
   ══════════════════════════════════════════════════════════════════════ */
function makeEnv(seed) {
  const store = Object.assign({}, seed || {});
  const writes = [];
  const localStorage = {
    getItem(k) { return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
    setItem(k, v) { writes.push(k); store[k] = String(v); },
    removeItem(k) { writes.push(k); delete store[k]; }
  };
  function classList() {
    const s = new Set();
    return { add: c => s.add(c), remove: c => s.delete(c), contains: c => s.has(c) };
  }
  const els = {};
  function el(id) {
    if (els[id]) return els[id];
    const e = els[id] = {
      id, textContent: '', value: '', scrollTop: 0, onclick: null, disabled: false,
      _html: '', _on: {}, _q: {}, classList: classList(), style: {},
      get innerHTML() { return e._html; },
      set innerHTML(v) { e._html = String(v); },
      addEventListener(t, f) { (e._on[t] = e._on[t] || []).push(f); },
      removeEventListener() {}, setAttribute() {}, removeAttribute() {},
      getAttribute() { return null; }, focus() {},
      /* Ένας επιλογέας δίνει ΠΑΝΤΑ το ίδιο αντικείμενο, ώστε ένα `style.display`
         που γράφτηκε μια φορά να φαίνεται και την επόμενη. */
      querySelector(sel) {
        if (/^#/.test(sel)) return el(sel.slice(1));
        return e._q[sel] || (e._q[sel] = { style: {}, classList: classList(), scrollTop: 0 });
      },
      querySelectorAll() { return []; },
      fire(t) {
        const ls = (e._on[t] || []).slice(), oc = e.onclick;
        ls.forEach(f => f.call(e, { preventDefault() {} }));
        if (t === 'click' && typeof oc === 'function') oc.call(e, {});
      }
    };
    return e;
  }
  const document = {
    body: { style: {} },
    getElementById: id => el(id),
    querySelector: () => null,
    addEventListener() {}, removeEventListener() {}
  };
  const win = {
    EkthesiData: D, EkthesiEngine: E, GREEKEAR: require(path.join(ALS, 'greek-ear.js')),
    innerWidth: 390, localStorage, document,
    addEventListener() {}, removeEventListener() {},
    setTimeout() { return 0; }, clearTimeout() {}   /* κόβει το retry του sync */
  };
  win.window = win;
  const ctx = vm.createContext(win);
  vm.runInContext(fs.readFileSync(path.join(ALS, 'study-stamp.js'), 'utf8'), ctx);
  vm.runInContext(BODY, ctx);
  return { el, store, writes, ctx };
}

/* ── ο οδηγός: παίζει σαν άνθρωπος που ξέρει το βιβλίο ────────────── */
function currentQ(env) {
  const h = env.el('dIn').innerHTML;
  const w = (h.match(/<div class="d-q">([^<]*)<\/div>/) || [])[1] || '';
  const a = (h.match(/<div class="d-ask">([^<]*)<\/div>/) || [])[1] || '';
  return { word: w, group: a === 'Αντώνυμο' ? 'ant' : 'syn' };
}
function cardByQ(word) { return D.ALL.filter(c => c.q === word)[0] || null; }
function groupOf(card, gid) { return card.groups.filter(g => g.id === gid)[0] || null; }
function saved(env) { try { return JSON.parse(env.store['ekt:v1'] || 'null'); } catch (e) { return null; } }
function box(env, k) { const s = saved(env); return (s && s.els[k] && +s.els[k].box) || 0; }

/* ⭐ ΣΤΗΝΕΙ ΚΑΤΑΣΤΑΣΗ ΟΠΟΥ ΜΟΝΟ ΤΟ ΣΤΟΧΕΥΜΕΝΟ ΣΤΟΙΧΕΙΟ ΕΙΝΑΙ ΣΕ ΠΑΙΧΝΙΔΙ.
   Χωρίς αυτό η ουρά γεμίζει με τα 88 άλλα και η ερώτηση που έρχεται δεν είναι
   αυτή που νομίζει το test — που ήταν ακριβώς το λάθος της πρώτης γραφής εδώ:
   τρεις βεβαιώσεις κοίταζαν κουτί που δεν αγγίχτηκε ποτέ. Σταθερή αρχή 30. */
const FAR = 90 * 86400000;
function seedOnly(target) {
  const now = Date.now(), els = {};
  D.ALL.forEach(c => c.groups.forEach(g => g.items.forEach((_, i) => {
    els[c.id + ':' + g.id + ':' + i] = { box: 5, due: now + FAR, r: 5, w: 0, last: now - 1000 };
  })));
  els[target.k] = { box: target.box, due: now - 86400000, r: target.box, w: 0, last: now - 86400000 };
  return { 'ekt:v1': JSON.stringify({ v: 2, words: {}, els, sessions: [] }) };
}

/* ═══════════════════════════════════════════════════════════════════
   Α · ΠΛΑΤΟΣ ΠΡΙΝ ΒΑΘΟΣ
   ═══════════════════════════════════════════════════════════════════ */
section('Α · πλάτος πριν βάθος');
{
  const env = makeEnv();
  env.el('ekCta').fire('click');
  const seen = [];
  for (let n = 0; n < 16; n++) {
    const q = currentQ(env);
    seen.push(q.word);
    env.el('dTa').value = '';           /* απαντάει λάθος· η σειρά μας νοιάζει */
    env.el('dBtn').fire('click');       /* έλεγχος */
    env.el('dBtn').fire('click');       /* επόμενο */
  }
  is('οι πρώτες 16 ερωτήσεις είναι 16 ΔΙΑΦΟΡΕΤΙΚΕΣ λέξεις',
     new Set(seen).size, 16);
  is('και είναι όλες οι λέξεις της σελίδας',
     new Set(seen).size, D.SETS[0].cards.length);
}

/* ═══════════════════════════════════════════════════════════════════
   Β · ΔΕΝ ΞΑΝΑΡΩΤΑΕΙ Ο,ΤΙ ΕΧΕΙΣ   +   Δ · δέχεται οποιοδήποτε της στήλης
   ═══════════════════════════════════════════════════════════════════ */
section('Β/Δ · ό,τι κέρδισες φεύγει από την ουρά');
{
  const env = makeEnv();
  env.el('ekCta').fire('click');
  const answered = {};
  const asked = [];
  for (let n = 0; n < 24; n++) {
    const q = currentQ(env);
    const c = cardByQ(q.word), g = groupOf(c, q.group);
    const tag = c.id + ':' + q.group;
    asked.push(tag);
    /* ⭐ Απαντάει ΤΟ ΤΕΛΕΥΤΑΙΟ στοιχείο της στήλης — σχεδόν ποτέ αυτό που
       προγραμμάτισε η σελίδα. Αν το δεχτεί, η υπόσχεση «δώσε ένα συνώνυμο»
       είναι αληθινή· αν όχι, η σελίδα λέει «λάθος» σε λέξη του βιβλίου. */
    const idx = g.items.length - 1 - (answered[tag] || 0);
    answered[tag] = (answered[tag] || 0) + 1;
    env.el('dTa').value = idx >= 0 ? g.items[idx].w : '';
    env.el('dBtn').fire('click');
    env.el('dBtn').fire('click');
  }
  const s = saved(env);
  const won = Object.keys(s.els).filter(k => +s.els[k].box >= 1);
  is('24 απαντήσεις με ΟΠΟΙΟΔΗΠΟΤΕ στοιχείο → 24 κερδισμένα', won.length, 24);

  /* το ίδιο ζευγάρι λέξη+στήλη δεν ξαναρωτήθηκε πριν εξαντληθεί η σελίδα */
  const firstPass = asked.slice(0, 16);
  is('καμία επανάληψη ζεύγους στις πρώτες 16', new Set(firstPass).size, 16);
}

/* ═══════════════════════════════════════════════════════════════════
   Γ · ⭐⭐ ΤΟ ΝΗΜΑ ΔΕΝ ΤΙΜΩΡΕΙ
   ⚠️ ΑΥΤΟ ΗΤΑΝ BUG ΚΑΙ ΕΠΙΑΣΤΗΚΕ ΜΟΝΟ ΕΔΩ: σωστή απάντηση ΜΕ νήμα έριχνε
   κουτί, δηλαδή τον έκανε να χάνει έδαφος επειδή ζήτησε βοήθεια — ο πιο
   σίγουρος τρόπος να μη ζητήσει ποτέ ξανά.
   ═══════════════════════════════════════════════════════════════════ */
section('Γ · το νήμα δεν τιμωρεί');
{
  /* Αδαής / συνώνυμα / «ανίδεος» — ΚΑΤΕΧΟΜΕΝΟ (κουτί 3) και ΛΗΞΙΠΡΟΘΕΣΜΟ.
     ⭐⭐ Αυτή η κατάσταση είναι η ΕΠΑΝΑΛΗΨΗ, και μόνο εδώ φάνηκε ότι η σελίδα
     την απέρριπτε με «το έχεις ήδη, δώσε άλλο» — ατέρμονος βρόχος στην τρίτη
     βραδιά, αόρατος ως τότε. */
  const c = D.card('p547-adais'), g = c.groups[0], k = 'p547-adais:syn:0';
  const seed = seedOnly({ k, box: 3 });

  const Z = makeEnv(seed);
  Z.el('ekCta').fire('click');
  is('η ΕΠΑΝΑΛΗΨΗ έρχεται μπροστά του', [currentQ(Z).word, currentQ(Z).group], [c.q, 'syn']);
  ok('και ΔΕΝ του τυπώνει την απάντηση από πάνω',
     Z.el('dIn').innerHTML.indexOf(g.items[0].w) < 0);

  const A = makeEnv(seed);
  A.el('ekCta').fire('click');
  A.el('dTa').value = g.items[0].w;
  A.el('dBtn').fire('click');
  /* ⚠️ Η ΕΤΥΜΗΓΟΡΙΑ ΓΡΑΦΕΤΑΙ ΣΤΟ `dAns`, ΟΧΙ ΣΤΟ `dIn`. Στο αληθινό DOM το
     ένα ζει μέσα στο άλλο· εδώ είναι δύο αντικείμενα, και η πρώτη γραφή
     κοίταζε το λάθος. Σταθερή αρχή 30, τρίτη φορά σε αυτό το αρχείο. */
  ok('σωστό ΧΩΡΙΣ νήμα → απαντήθηκε, δεν απορρίφθηκε',
     A.el('dAns').innerHTML.indexOf('d-verdict') > -1);
  is('και το κουτί ανεβαίνει', box(A, k), 4);

  const B = makeEnv(seed);
  B.el('ekCta').fire('click');
  B.el('dCue').fire('click');
  B.el('dTa').value = g.items[0].w;
  B.el('dBtn').fire('click');
  is('σωστό ΜΕ νήμα → το κουτί ΜΕΝΕΙ (δεν πέφτει)', box(B, k), 3);

  const C = makeEnv(seed);
  C.el('ekCta').fire('click');
  C.el('dTa').value = 'τιποτα σχετικο';
  C.el('dBtn').fire('click');
  is('λάθος → πέφτει ΕΝΑ κουτί, όχι στο μηδέν', box(C, k), 2);
}

/* ═══════════════════════════════════════════════════════════════════
   Ε · ΛΑΘΟΣ ΣΤΗΛΗ → ΞΑΝΑΡΩΤΑΕΙ
   ═══════════════════════════════════════════════════════════════════ */
section('Ε · σωστή λέξη, λάθος στήλη');
{
  /* ⚠️ Στοχευμένα το «Αδαής», που ΕΧΕΙ και τις δύο στήλες. Η πρώτη γραφή
     έπαιρνε ό,τι ερχόταν πρώτο και έπεφτε στην «Αγωνιστικότητα», που δεν
     έχει αντώνυμα στο βιβλίο — το test απέτυχε χωρίς να φταίει η σελίδα. */
  const c = D.card('p547-adais');
  const env = makeEnv(seedOnly({ k: 'p547-adais:syn:0', box: 0 }));
  env.el('ekCta').fire('click');
  is('ρωτάει συνώνυμο του Αδαής', [currentQ(env).word, currentQ(env).group], [c.q, 'syn']);

  env.el('dTa').value = c.groups[1].items[0].w;     /* «ειδικός» = ΑΝΤΩΝΥΜΟ */
  env.el('dBtn').fire('click');
  const h = env.el('dAns').innerHTML;
  ok('το λέει καθαρά ότι είναι αντώνυμο', /αντώνυμο του «/.test(h));
  ok('ΔΕΝ αποκάλυψε απάντηση', h.indexOf('d-verdict') < 0);
  is('και δεν χρέωσε το στοιχείο', box(env, 'p547-adais:syn:0'), 0);
}

/* ═══════════════════════════════════════════════════════════════════
   ΣΤ/Ζ/Η/Θ · ΤΟ ΓΡΑΨΙΜΟ, Η ΕΠΙΒΙΩΣΗ, ΚΑΙ Ο ΑΝΑΓΝΩΣΤΗΣ
   ═══════════════════════════════════════════════════════════════════ */
section('ΣΤ/Ζ/Η/Θ · γράψιμο, επιβίωση, ladders');
{
  const alien = { id: 'zz-remote', ts: 1, ms: 1000, unit: '', mode: 'recall', asked: 2, right: 2, pass: 1, fin: 1 };
  const seed = { 'ekt:v1': JSON.stringify({ v: 2, words: {}, els: {}, sessions: [alien] }) };
  const env = makeEnv(seed);
  env.el('ekCta').fire('click');
  for (let n = 0; n < 3; n++) {
    const q = currentQ(env), c = cardByQ(q.word), g = groupOf(c, q.group);
    env.el('dTa').value = g.items[0].w;
    env.el('dBtn').fire('click');
    env.el('dBtn').fire('click');
  }
  env.el('dX').fire('click');                        /* το παρατάει */

  is('ΣΤ · γράφτηκε ΜΟΝΟ το ekt:v1', Array.from(new Set(env.writes)), ['ekt:v1']);

  const s = saved(env);
  ok('Ζ · η ξένη συνεδρία επέζησε του load()', s.sessions.some(x => x.id === 'zz-remote'));
  ok('Ζ · και γράφτηκε και η δική του', s.sessions.length >= 2);
  ok('Ζ · με fin:0 — το παράτησε', s.sessions.some(x => x.id !== 'zz-remote' && x.fin === 0));

  /* Η · μόνο οι ΑΓΓΙΧΤΕΣ λέξεις έχουν εγγραφή. Μια άθικτη με `due:0` θα
     διαβαζόταν ληξιπρόθεσμη και θα του χρέωνε λέξεις που δεν είδε ποτέ. */
  is('Η · τρεις απαντήσεις → τρεις λέξεις στο words', Object.keys(s.words).length, 3);
  ok('Η · καμία εγγραφή δεν έχει learnedAt 0',
     Object.keys(s.words).every(k => +s.words[k].learnedAt > 0));

  /* Θ · ο ΚΟΙΝΟΣ αναγνώστης πάνω σε ό,τι μόλις γράφτηκε — ο κύκλος κλείνει
     σε ΕΝΑ test, όχι σε δύο που συμφωνούν κατά τύχη. */
  const R = L.read({ get: k => env.store[k] || null, now: Date.now() });
  const st = R.byKey['ekt:v1'];
  ok('Θ · το ladders.js το διάβασε', st.ok === true);
  is('Θ · και βλέπει τις τρεις λέξεις', st.items.length, 3);
  is('Θ · τρία σωστά, μηδέν λάθη', [st.right, st.wrong], [3, 0]);
  is('Θ · καμία δεν χρωστάει ακόμη', st.overdue, 0);
  is('Θ · και οι τρεις μετρήθηκαν μαθεμένες', st.learned, 3);
}

console.log('\n' + (fail ? '✗ ' + fail + ' αποτυχίες, ' : '✓ ') + pass + ' πέρασαν');
process.exit(fail ? 1 : 0);
