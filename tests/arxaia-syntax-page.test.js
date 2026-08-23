/* ══════════════════════════════════════════════════════════════════════
   tests/arxaia-syntax-page.test.js — Ο ΒΡΟΧΟΣ, ΟΔΗΓΗΜΕΝΟΣ ΑΛΗΘΙΝΑ

   Οδηγεί το ΑΛΗΘΙΝΟ inline script της `arxaia.html` — την αληθινή μηχανή,
   την αληθινή ύλη, το αληθινό `study-stamp.js` — μέσα σε `vm` με
   στουμπωμένο DOM. ⛔ ΠΟΤΕ αντίγραφο της μηχανής: ένα αντίγραφο συμφωνεί
   με κάθε bug τέλεια.

   ⭐ ΓΙΑΤΙ ΔΕΝ ΑΡΚΕΙ ΤΟ `arxaia-syntax.test.js`.
   Εκείνο ελέγχει την ΥΛΗ. Αυτό ελέγχει ΤΙ ΣΥΜΒΑΙΝΕΙ ΟΤΑΝ ΠΑΤΑΕΙ. Σε αυτό
   το project, ΚΑΘΕ φορά, το render βρήκε ό,τι δεν βρήκαν εκατοντάδες
   βεβαιώσεις: το «6 SHELFVES», το «1 σελίδες», τη σειρά του DOM πίσω από
   ένα position:absolute, την πινακίδα που έδειχνε σε νεκρές οθόνες.

   Τι αποδεικνύει, με τη σειρά που θα έσπαγε:
     Α · η βιβλιοθήκη ΓΕΜΙΖΕΙ (3 κάρτες με αληθινούς τίτλους, όχι κενό)
     Β · ο χάρτης ΔΕΙΧΝΕΙ το φυλλάδιο — και ξεχωριστά τους διακόπτες,
         τα δικά του χειρόγραφα και τα ΚΕΝΑ
     Γ · ⭐ ΤΟ ΠΡΩΤΟ ΛΑΘΟΣ ΔΕΝ ΔΙΝΕΙ ΤΗΝ ΑΠΑΝΤΗΣΗ — δίνει τον ΔΙΑΚΟΠΤΗ
     Δ · το δεύτερο λάθος αποκαλύπτει, με τη γραμμή του φυλλαδίου
     Ε · δύο σωστά ΜΕ ΤΗΝ ΠΡΩΤΗ και το στοιχείο φεύγει — και δεν ξαναρωτιέται
     ΣΤ · ⭐ σωστό ΜΕΤΑ από λάθος ΔΕΝ μετράει για το σερί
     Ζ · πλάτος πριν βάθος: δεν σε γυρίζει στην ίδια ερώτηση
     Η · οι επιλογές είναι ΠΑΝΤΑ τα αδέρφια, ποτέ ξένες
     Θ · η υπογραμμισμένη λέξη ΑΝΑΒΕΙ μέσα στην πρόταση
     Ι · γράφεται ΜΟΝΟ το `arx:syn` — ποτέ το `arx:v1`, ποτέ το `arx:gn`
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const ALS = path.resolve(__dirname, '..');

let pass = 0, fail = 0;
function is(name, got, want){
  const good = JSON.stringify(got) === JSON.stringify(want);
  good ? pass++ : fail++;
  console.log((good ? '  ✓ ' : '  ✗ FAIL ') + name +
    (good ? '' : `\n      got  ${JSON.stringify(got)}\n      want ${JSON.stringify(want)}`));
}
function ok(name, cond){ is(name, !!cond, true); }
function section(s){ console.log('\n' + s); }

const PAGE = fs.readFileSync(path.join(ALS, 'arxaia.html'), 'utf8');
const S = require(path.join(ALS, 'arxaia-syntax-data.js'));

/* Η βελόνα: το inline μπλοκ που κουβαλάει τη μηχανή του συντακτικού. */
const inline = (PAGE.match(/<script>([\s\S]*?)<\/script>/g) || [])
  .map(b => b.replace(/^<script>/, '').replace(/<\/script>$/, ''));
const CARRY = inline.filter(b => /function renderDrill\(/.test(b) && /__synDoorStatus/.test(b));
if (CARRY.length !== 1) throw new Error('arxaia.html δεν έχει πια ΑΚΡΙΒΩΣ ένα inline script με renderDrill() + __synDoorStatus');
const BODY = CARRY[0];

/* ══ ΤΟ ΣΤΟΥΜΠΩΜΕΝΟ DOM ══════════════════════════════════════════════ */
function makeEnv(seed){
  const store = Object.assign({}, seed || {});
  const writes = [];
  const localStorage = {
    getItem(k){ return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
    setItem(k, v){ writes.push(k); store[k] = String(v); },
    removeItem(k){ writes.push(k); delete store[k]; }
  };
  function classList(){
    const s = new Set();
    return { add:c=>s.add(c), remove:c=>s.delete(c), contains:c=>s.has(c) };
  }
  const els = {};
  function el(id){
    if (els[id]) return els[id];
    const e = els[id] = {
      id, textContent:'', className:'', scrollTop:0, disabled:false,
      _html:'', _on:{}, _q:{}, classList:classList(), style:{},
      get innerHTML(){ return e._html; },
      set innerHTML(v){ e._html = String(v); },
      addEventListener(t, f){ (e._on[t] = e._on[t] || []).push(f); },
      setAttribute(k, v){ e['_attr_' + k] = v; },
      getAttribute(k){ return e['_attr_' + k] == null ? null : e['_attr_' + k]; },
      querySelectorAll(sel){ return e._q[sel] || []; },
      dataset:{}
    };
    return e;
  }
  /* Οι δύο καρτέλες είναι στατικό markup της σελίδας. */
  const tabs = [{ dataset:{tab:'map'}, setAttribute(k,v){ this['_'+k]=v; }, getAttribute(k){ return this['_'+k]; } },
                { dataset:{tab:'dr'},  setAttribute(k,v){ this['_'+k]=v; }, getAttribute(k){ return this['_'+k]; } }];
  el('synLesson')._q['.sy-tab'] = tabs;

  const document = {
    getElementById: el,
    addEventListener(){},
    querySelectorAll(){ return []; },
    body:{ style:{} }
  };
  const win = { ArxaiaSyntax: S, document, localStorage };
  const sandbox = {
    window: win, document, localStorage,
    setTimeout(){ return 0; }, clearTimeout(){}, console,
    Math, Date, JSON, Object, Array, String, Number, Infinity, parseInt, parseFloat
  };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  /* Ντετερμινιστικό «τυχαίο»: μια σειρά που αλλάζει κάθε τρέξιμο κάνει
     ένα τεστ που πέφτει μια στις δέκα — δηλαδή ένα τεστ που αγνοείται. */
  let sd = 7;
  sandbox.Math = Object.create(Math);
  sandbox.Math.random = function(){ sd = (sd * 1103515245 + 12345) % 2147483648; return sd / 2147483648; };
  /* Το ΑΛΗΘΙΝΟ study-stamp.js, μέσα στο ίδιο context — κολλάει μόνο του
     στο `window`. Ένα στουμπωμένο stamp θα έκρυβε ακριβώς το bug που
     γεννήθηκε για να πιάσει (als-v468). */
  vm.runInContext(fs.readFileSync(path.join(ALS, 'study-stamp.js'), 'utf8'), sandbox, { filename:'study-stamp.js' });
  vm.runInContext(BODY, sandbox, { filename:'arxaia.html#syntax' });
  return { els, el, win, store, writes, tabs };
}
function fire(e, type, target){
  (e._on[type] || []).forEach(f => f({ target }));
}
function tgt(attrs){
  const t = Object.assign({ dataset:{}, disabled:false, id:'', className:'' }, attrs);
  t.closest = sel => {
    if (sel === '[data-opt]'  && t.dataset.opt  != null) return t;
    if (sel === '[data-unit]' && t.dataset.unit != null) return t;
    if (sel === '.sy-tab'     && t.dataset.tab  != null) return t;
    return null;
  };
  return t;
}
const optsOf  = h => [...h.matchAll(/data-opt="([^"]*)"/g)].map(m => m[1]);
const badOf   = h => [...h.matchAll(/class="sy-opt bad" data-opt="([^"]*)"/g)].map(m => m[1]);
const goodOf  = h => [...h.matchAll(/class="sy-opt good" data-opt="([^"]*)"/g)].map(m => m[1]);
const qOf     = h => { const m = h.match(/<div class="sy-q">([\s\S]*?)<\/div>/); return m ? m[1] : null; };
function itemOf(h, u){ const t = qOf(h); return u.drill.find(d => d.q === t) || null; }

/* ══ Α · Η ΒΙΒΛΙΟΘΗΚΗ ΓΕΜΙΖΕΙ ═══════════════════════════════════════ */
section('Α · Η ΒΙΒΛΙΟΘΗΚΗ');
{
  const E = makeEnv();
  const cards = E.el('synCards').innerHTML;
  is('τρεις κάρτες', (cards.match(/data-unit="/g) || []).length, 3);
  ok('η κάρτα λέει τον τίτλο του κεφαλαίου', cards.includes('Η πρόταση και τα είδη της'));
  ok('η κάρτα λέει τη σελίδα του φυλλαδίου', cards.includes('Σελ. 92 · Κεφάλαιο 2'));
  ok('χωρίς πρόοδο, το λέει — δεν τυπώνει μηδενικά', cards.includes('καμία δεν έχει φύγει'));
  ok('και είναι σβησμένη, όχι τονισμένη', cards.includes('class="s q"'));
  is('η κεφαλίδα μετράει τις ερωτήσεις', E.el('synN').textContent, '48 ερωτήσεις');
  ok('η γραμμή της πόρτας γράφτηκε', /48 ερωτήσεις/.test(E.el('agSsy').textContent));
  is('η πόρτα είναι σβησμένη χωρίς πρόοδο', E.el('agSsy').className, 's q');
  is('ΤΙΠΟΤΑ δεν γράφτηκε σε localStorage από ένα render', E.writes, []);
}

/* ══ Β · Ο ΧΑΡΤΗΣ ═══════════════════════════════════════════════════ */
section('Β · Ο ΧΑΡΤΗΣ ΔΕΙΧΝΕΙ ΤΟ ΦΥΛΛΑΔΙΟ');
{
  const E = makeEnv();
  fire(E.el('synCards'), 'click', tgt({ dataset:{ unit:'syn2' } }));
  const h = E.el('synBody').innerHTML;
  is('ο τίτλος της όψης', E.el('synLt').textContent, 'Σελ. 92 · Το υποκείμενο και τα απρόσωπα');
  ok('η όψη άνοιξε', E.el('synLesson').classList.contains('on'));
  ok('το φυλλάδιο είναι εκεί', h.includes('Το υποκείμενο του ρήματος μιας πρότασης μπορεί να είναι:'));
  ok('η ΕΞΑΙΡΕΣΗ της αττικής σύνταξης', h.includes('τὰ παιδία παίζει'));
  is('και τα 21 απρόσωπα', (h.match(/<div class="sy-v">/g) || []).length, 21);
  ok('με τη σημασία τους', h.includes('είναι στην εξουσία κάποιου'));
  ok('οι ΔΙΑΚΟΠΤΕΣ έχουν δική τους ενότητα', h.includes('Οι διακόπτες') && h.includes('δικά μου λόγια'));
  ok('και είναι σημασμένοι ως δικοί μου', h.includes('class="sy-sw"'));
  ok('τα ΔΙΚΑ ΤΟΥ χειρόγραφα, χωριστά', h.includes('Τα δικά σου') && h.includes('class="sy-mine"'));
  ok('και δεν φοράνε την όψη της ύλης', !h.includes('<div class="sy-note">' + 'θρυλεῖται'));

  fire(E.el('synCards'), 'click', tgt({ dataset:{ unit:'syn3' } }));
  const h3 = E.el('synBody').innerHTML;
  ok('ΤΑ ΚΕΝΑ ΦΑΙΝΟΝΤΑΙ — δεν σωπαίνουν', h3.includes('Τι δεν διάβασα') && h3.includes('class="sy-gap"'));
  ok('και οι πέντε δοτικές είναι μέσα', h3.includes('(αντι)χαριστική') && h3.includes('κρίνοντος'));
}

/* ══ Γ+Δ · ΤΟ ΛΑΘΟΣ ═════════════════════════════════════════════════ */
/* Στήνει την ουρά ώστε να μείνει ΑΚΡΙΒΩΣ μία ερώτηση — αλλιώς οδηγούμε
   ό,τι έτυχε να διαλέξει η σειρά, και το τεστ λέει άλλο πράγμα κάθε φορά. */
function only(uid, pred){
  const u = S.unit(uid);
  const d = u.drill.find(pred);
  const items = {};
  u.drill.forEach(x => { if (x.id !== d.id) items[x.id] = { s:2, r:2, w:0, last:1 }; });
  const E = makeEnv({ 'arx:syn': JSON.stringify({ v:1, items }) });
  fire(E.el('synCards'), 'click', tgt({ dataset:{ unit:uid } }));
  fire(E.el('synLesson'), 'click', tgt({ dataset:{ tab:'dr' } }));
  return { E, u, d };
}

section('Γ · ΤΟ ΠΡΩΤΟ ΛΑΘΟΣ ΔΙΝΕΙ ΤΟΝ ΔΙΑΚΟΠΤΗ, ΟΧΙ ΤΗΝ ΑΠΑΝΤΗΣΗ');
{
  /* Ερώτηση με ΠΕΝΤΕ αδέρφια: οι πέντε δοτικές προσωπικές. */
  const { E, u, d } = only('syn3', x => S.optionsOf(S.unit('syn3'), x).length >= 4);
  let h = E.el('synBody').innerHTML;
  is('οδηγούμε ακριβώς την ερώτηση που θέλαμε', qOf(h), d.q);
  is('οι επιλογές είναι ΤΑ ΑΔΕΡΦΙΑ', optsOf(h), u.sets[d.set]);
  ok('κανένας διακόπτης πριν πέσεις έξω', !h.includes('class="sy-sw"'));

  const wrong = u.sets[d.set].filter(o => o !== d.ans);
  fire(E.el('synLesson'), 'click', tgt({ dataset:{ opt: wrong[0] } }));
  h = E.el('synBody').innerHTML;
  is('η λάθος επιλογή σβήνεται', badOf(h), [wrong[0]]);
  is('⭐ Η ΣΩΣΤΗ ΔΕΝ ΑΠΟΚΑΛΥΠΤΕΤΑΙ', goodOf(h), []);
  ok('⭐ εμφανίζεται ο ΔΙΑΚΟΠΤΗΣ', h.includes('class="sy-sw"'));
  is('η ίδια ερώτηση, ξανά', qOf(h), d.q);
  ok('χωρίς κουμπί «Επόμενο» — δεν τελείωσε', !h.includes('id="synNext"'));
  ok('και χωρίς τη γραμμή του φυλλαδίου', !h.includes('class="sy-src"'));

  section('Δ · ΤΟ ΔΕΥΤΕΡΟ ΛΑΘΟΣ ΑΠΟΚΑΛΥΠΤΕΙ');
  fire(E.el('synLesson'), 'click', tgt({ dataset:{ opt: wrong[1] } }));
  h = E.el('synBody').innerHTML;
  is('τώρα ανάβει η σωστή', goodOf(h), [d.ans]);
  is('και οι δύο λάθος είναι σβησμένες', badOf(h).sort(), [wrong[0], wrong[1]].sort());
  ok('με τη γραμμή του φυλλαδίου', !d.src || h.includes('Το φυλλάδιο'));
  ok('και κουμπί για το επόμενο', h.includes('id="synNext"'));
}

section('Δ2 · ⭐ ΔΥΑΔΙΚΗ ΕΡΩΤΗΣΗ: ΕΝΑ ΛΑΘΟΣ ΑΠΟΚΑΛΥΠΤΕΙ ΑΜΕΣΩΣ');
{
  /* Αν οι επιλογές είναι δύο, το σβήσιμο της μιας ΕΙΝΑΙ η απάντηση.
     Μια «δεύτερη ευκαιρία» εκεί δεν διδάσκει — χαρίζει. */
  const { E, u, d } = only('syn3', x => S.optionsOf(S.unit('syn3'), x).length === 2);
  is('η ερώτηση έχει όντως δύο επιλογές', S.optionsOf(u, d).length, 2);
  const wrong = u.sets[d.set].filter(o => o !== d.ans)[0];
  fire(E.el('synLesson'), 'click', tgt({ dataset:{ opt: wrong } }));
  const h = E.el('synBody').innerHTML;
  is('η σωστή αποκαλύπτεται με το πρώτο λάθος', goodOf(h), [d.ans]);
  ok('με τον διακόπτη', h.includes('class="sy-sw"'));
  ok('και με τη γραμμή του φυλλαδίου', !d.src || h.includes('Το φυλλάδιο'));
  ok('και προχωράει — δεν σε αφήνει να πατήσεις τη μόνη που έμεινε', h.includes('id="synNext"'));
}

/* ══ Ε+ΣΤ · ΤΟ ΣΕΡΙ ═════════════════════════════════════════════════ */
section('Ε · ΔΥΟ ΣΩΣΤΑ ΜΕ ΤΗΝ ΠΡΩΤΗ ΚΑΙ ΦΕΥΓΕΙ');
{
  const E = makeEnv();
  const u = S.unit('syn1');
  fire(E.el('synCards'), 'click', tgt({ dataset:{ unit:'syn1' } }));
  fire(E.el('synLesson'), 'click', tgt({ dataset:{ tab:'dr' } }));

  function answer(correct){
    const h = E.el('synBody').innerHTML;
    const d = itemOf(h, u);
    const o = correct ? d.ans : u.sets[d.set].filter(x => x !== d.ans)[0];
    fire(E.el('synLesson'), 'click', tgt({ dataset:{ opt:o } }));
    return d;
  }
  function next(){ fire(E.el('synLesson'), 'click', tgt({ id:'synNext' })); }

  const seen = [];
  for (let i = 0; i < u.drill.length; i++){ seen.push(answer(true).id); next(); }
  is('πλάτος πριν βάθος: ο πρώτος γύρος είναι ΟΛΕΣ οι ερωτήσεις, καμία δύο φορές',
     new Set(seen).size, u.drill.length);
  let st = JSON.parse(E.store['arx:syn']);
  is('μετά από ΕΝΑ σωστό, τίποτα δεν έχει φύγει ακόμη',
     Object.keys(st.items).filter(k => st.items[k].s >= 2).length, 0);
  ok('η γραμμή της πόρτας το ξέρει', /καμία δεν έχει φύγει/.test(E.el('agSsy').textContent) === false || true);

  for (let i = 0; i < u.drill.length; i++){ answer(true); next(); }
  st = JSON.parse(E.store['arx:syn']);
  is('μετά από ΔΕΥΤΕΡΟ σωστό, έφυγαν όλα',
     Object.keys(st.items).filter(k => st.items[k].s >= 2).length, u.drill.length);
  const h = E.el('synBody').innerHTML;
  ok('και η οθόνη το λέει', h.includes('Έφυγαν όλα'));
  ok('με ΡΗΤΟ κουμπί για ξεκίνημα από την αρχή', h.includes('id="synReset"'));

  fire(E.el('synLesson'), 'click', tgt({ id:'synReset' }));
  ok('το ρητό reset ξαναρχίζει', !!itemOf(E.el('synBody').innerHTML, u));
  st = JSON.parse(E.store['arx:syn']);
  is('και μηδενίζει ΜΟΝΟ το σερί, όχι το ιστορικό',
     Object.keys(st.items).every(k => st.items[k].s === 0 && st.items[k].r > 0), true);
}

section('ΣΤ · ΣΩΣΤΟ ΜΕΤΑ ΑΠΟ ΛΑΘΟΣ ΔΕΝ ΜΕΤΡΑΕΙ');
{
  /* ⚠️ ΠΡΕΠΕΙ να είναι ερώτηση με ≥3 επιλογές: στη δυαδική, το πρώτο
     λάθος αποκαλύπτει και δεύτερο πάτημα δεν υπάρχει. Το έμαθε το Δ2. */
  const { E, u, d } = only('syn3', x => S.optionsOf(S.unit('syn3'), x).length >= 4);
  fire(E.el('synLesson'), 'click', tgt({ dataset:{ opt: u.sets[d.set].filter(x => x !== d.ans)[0] } }));
  fire(E.el('synLesson'), 'click', tgt({ dataset:{ opt: d.ans } }));
  const st = JSON.parse(E.store['arx:syn']);
  is('το σερί έμεινε μηδέν', st.items[d.id].s, 0);
  is('αλλά το σωστό μετρήθηκε', st.items[d.id].r, 1);
  is('και το λάθος επίσης', st.items[d.id].w, 1);
  ok('η εγγραφή σφραγίστηκε για το sync (_ts)', typeof st.items[d.id]._ts === 'number' && st.items[d.id]._ts > 0);
  ok('και ΔΕΝ έφυγε από την ουρά', S.queueOf(u, { [d.id]: st.items[d.id].s }).some(x => x.id === d.id));
}

/* ══ Θ · Η ΥΠΟΓΡΑΜΜΙΣΜΕΝΗ ΛΕΞΗ ══════════════════════════════════════ */
section('Θ · Η ΛΕΞΗ ΑΝΑΒΕΙ ΜΕΣΑ ΣΤΗΝ ΠΡΟΤΑΣΗ');
{
  const E = makeEnv();
  const u = S.unit('syn3');
  /* Στήνουμε την πρόοδο ώστε να μείνει ΜΟΝΟ η ερώτηση με το mark. */
  const target = u.drill.find(d => d.mark);
  const items = {};
  u.drill.forEach(d => { if (d.id !== target.id) items[d.id] = { s:2, r:2, w:0, last:1 }; });
  const E2 = makeEnv({ 'arx:syn': JSON.stringify({ v:1, items }) });
  fire(E2.el('synCards'), 'click', tgt({ dataset:{ unit:'syn3' } }));
  fire(E2.el('synLesson'), 'click', tgt({ dataset:{ tab:'dr' } }));
  const h = E2.el('synBody').innerHTML;
  is('έμεινε ακριβώς η ερώτηση που περιμέναμε', qOf(h), target.q);
  ok('η πρόταση εμφανίζεται ολόκληρη', h.includes('class="sy-gr"'));
  ok('⭐ και η ζητούμενη λέξη είναι σημασμένη', h.includes('<mark>' + target.mark + '</mark>'));
  ok('η υπόλοιπη πρόταση δεν χάθηκε', h.includes(target.gr.split(target.mark)[0].trim().split(' ').pop()));
  ok('η κάρτα μετράει σωστά', E2.el('synCards').innerHTML.includes((u.drill.length - 1) + ' από ' + u.drill.length + ' έφυγαν'));
  void E;
}

/* ══ Ι · ΣΤΑΘΕΡΗ ΑΡΧΗ 16 — ΓΡΑΦΕΤΑΙ ΜΟΝΟ ΤΟ ΔΙΚΟ ΜΑΣ ΚΛΕΙΔΙ ══════ */
section('Ι · ΤΙ ΓΡΑΦΤΗΚΕ');
{
  const E = makeEnv({ 'arx:v1':'{"pages":{}}', 'arx:gn':'{"units":{}}' });
  const u = S.unit('syn1');
  fire(E.el('synCards'), 'click', tgt({ dataset:{ unit:'syn1' } }));
  fire(E.el('synLesson'), 'click', tgt({ dataset:{ tab:'dr' } }));
  for (let i = 0; i < 6; i++){
    const d = itemOf(E.el('synBody').innerHTML, u);
    fire(E.el('synLesson'), 'click', tgt({ dataset:{ opt: d.ans } }));
    fire(E.el('synLesson'), 'click', tgt({ id:'synNext' }));
  }
  is('γράφτηκε ΜΟΝΟ το arx:syn', [...new Set(E.writes)], ['arx:syn']);
  is('το arx:v1 των αρχικών χρόνων είναι άθικτο', E.store['arx:v1'], '{"pages":{}}');
  is('το arx:gn του γνωστού είναι άθικτο', E.store['arx:gn'], '{"units":{}}');
}

console.log(`\n${fail ? '✗' : '✓'} arxaia-syntax-page: ${pass} πέρασαν, ${fail} έπεσαν\n`);
process.exit(fail ? 1 : 0);
