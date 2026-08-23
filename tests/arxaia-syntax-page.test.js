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
const CARRY = inline.filter(b => /function renderDrill\(/.test(b) && /function compare\(/.test(b));
if (CARRY.length !== 1) throw new Error('arxaia.html δεν έχει πια ΑΚΡΙΒΩΣ ένα inline script με renderDrill() + compare()');
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

/* ══ Α · ΤΟ ΡΑΦΙ ═══════════════════════════════════════════════════ */
section('Α · ΤΟ ΡΑΦΙ ΤΟΥ ΣΥΝΤΑΚΤΙΚΟΥ');
{
  const E = makeEnv();
  const rows = E.el('synCards').innerHTML;
  is('τρεις γραμμές περιεχομένων', (rows.match(/data-unit="/g) || []).length, 3);
  ok('ίδιο markup με τους αρχικούς χρόνους (ένα φύλλο στυλ για τα δύο ράφια)',
     rows.includes('class="ar-row"') && rows.includes('class="tx"') && rows.includes('class="l"'));
  ok('με ρωμαϊκό αριθμό', rows.includes('<span class="rn">II</span>'));
  ok('και τον τίτλο του κεφαλαίου', rows.includes('Το υποκείμενο και τα απρόσωπα'));
  ok('η γραμμή περιεχομένων ΜΕΤΡΙΕΤΑΙ από την ύλη',
     rows.includes('Ο χάρτης · 6 διακόπτες · 19 ερωτήσεις'));
  ok('⭐ «αδιάβαστο» ΛΕΓΕΤΑΙ — δεν τυπώνεται 0/15', rows.includes('αδιάβαστο') && !rows.includes('>0/'));
  ok('χωρίς πρόοδο δεν υπάρχει μπάρα', !rows.includes('class="bar"'));
  is('η επικεφαλίδα του ραφιού', E.el('synN').textContent, '3 κεφάλαια');
  is('ΤΙΠΟΤΑ δεν γράφτηκε σε localStorage από ένα render', E.writes, []);
}

/* ══ Β · ΤΑ ΤΡΙΑ ΣΧΗΜΑΤΑ ════════════════════════════════════════════
   ⭐ Η ΚΑΡΔΙΑ ΤΗΣ als-v506. Η ύλη δεν είναι ένα είδος· ένας renderer για
   όλα ήταν το λάθος της προηγούμενης έκδοσης. */
section('Β1 · ΤΟ ΔΕΝΤΡΟ (σελ. 91)');
{
  const E = makeEnv();
  fire(E.el('synCards'), 'click', tgt({ dataset:{ unit:'syn1' } }));
  const h = E.el('synBody').innerHTML;
  ok('η όψη άνοιξε', E.el('synLesson').classList.contains('on'));
  ok('⛔ ΚΑΜΙΑ αριθμημένη λίστα — αυτό ήταν το παράπονο', !h.includes('<ol'));
  ok('υπάρχει ρίζα', h.includes('class="tr-root"') && h.includes('ΟΙ ΠΡΟΤΑΣΕΙΣ'));
  is('δύο δέντρα, με φωλιασμένα κλαδιά', (h.match(/class="tr-kids/g) || []).length, 4);
  ok('τα φύλλα είναι εκεί', h.includes('Ενδοιαστικές') && h.includes('Συμπερασματικές'));
  ok('με την εκφορά τους', h.includes('εκφέρονται με υποτακτική, ευκτική, προστακτική'));
  is('⭐ Η ΠΑΓΙΔΑ ΕΙΝΑΙ ΟΡΑΤΗ: το ◆ μπαίνει ΑΚΡΙΒΩΣ δύο φορές',
     (h.match(/class="mk">◆/g) || []).length, 2);
  ok('και εξηγείται', h.includes('το μόνο είδος που εμφανίζεται ΚΑΙ στις δύο ομάδες'));
}

section('Β2 · Η ΑΝΤΙΠΑΡΑΒΟΛΗ (σελ. 93)');
{
  const E = makeEnv();
  fire(E.el('synCards'), 'click', tgt({ dataset:{ unit:'syn3' } }));
  const h = E.el('synBody').innerHTML;
  is('ο τίτλος της όψης', E.el('synLt').textContent, 'Σελ. 93 · Η δοτική προσωπική · απαρέμφατο και μετοχή');
  is('τρεις αντιπαραβολές', (h.match(/class="cmp-g"/g) || []).length, 3);
  ok('η πρώτη έχει πέντε στήλες', h.includes('repeat(5,minmax(178px,1fr))'));
  ok('και τα πέντε ονόματα', ['κτητική','του ενεργούντος προσώπου','του κρίνοντος προσώπου','(αντι)χαριστική','ηθική']
     .every(n => h.includes('<span class="cmp-nm">' + n + '</span>')));
  ok('⭐ οι γραμμές είναι τα πεδία σύγκρισης', h.includes('ΤΟ ΣΗΜΑΔΙ') && h.includes('ΦΑΝΕΡΩΝΕΙ') && h.includes('ΠΑΡΑΔΕΙΓΜΑ'));
  ok('⭐ η ΜΟΝΗ διαφορά των δύο που μπερδεύονται στοιχίζεται',
     h.includes('ΩΦΕΛΕΙΑ ή ΒΛΑΒΗ') && h.includes('ΧΑΡΑ ή ΛΥΠΗ'));
  ok('και ονομάζεται', h.includes('Η παγίδα') && h.includes('πραγματικό κέρδος ή ζημιά, έναντι συναισθήματος'));
  ok('⛔ ΤΟ ΦΥΛΛΑΔΙΟ ΚΑΘΕΤΑΙ ΑΥΤΟΥΣΙΟ ΑΠΟ ΚΑΤΩ — η συμπύκνωση δεν το κρύβει',
     h.includes('Το φυλλάδιο') && h.includes('Φανερώνει τον κτήτορα. Βρίσκεται κοντά στα ρήματα εἰμί, ὑπάρχω, γίγνομαι π.χ. ἦσαν τῷ πατρὶ παῖδες δύο.'));
  ok('όπου το φυλλάδιο ΔΕΝ δίνει παράδειγμα, το κελί το λέει', h.includes('class="none">—'));
  ok('ο όρος του κρίνοντος είναι σημασμένος ως προειδοποίηση',
     h.includes('class="cmp-warn">⚠ ΜΟΝΟ όταν ΔΕΝ είναι απρόσωπα'));
  ok('ΤΑ ΚΕΝΑ ΦΑΙΝΟΝΤΑΙ', h.includes('Τι δεν διάβασα') && h.includes('class="sy-gap"'));
}

section('Β3 · Η ΠΛΑΚΑ (σελ. 92)');
{
  const E = makeEnv();
  fire(E.el('synCards'), 'click', tgt({ dataset:{ unit:'syn2' } }));
  const h = E.el('synBody').innerHTML;
  is('τα 7 υποκείμενα + τα 21 απρόσωπα = 28 δείγματα', (h.match(/class="pl-i"/g) || []).length, 28);
  ok('το φυλλάδιο είναι εκεί', h.includes('Το υποκείμενο του ρήματος μιας πρότασης μπορεί να είναι:'));
  ok('με τη σημασία των ρημάτων', h.includes('είναι στην εξουσία κάποιου'));
  ok('η ΕΞΑΙΡΕΣΗ της αττικής σύνταξης, σημασμένη', h.includes('τὰ παιδία παίζει') && h.includes('sy-note warn'));
  ok('υπάρχει αναζήτηση', h.includes('id="plSearch"'));
  /* Ο δείκτης αναζήτησης είναι ΧΩΡΙΣ τόνους: «μετ» πρέπει να πιάνει και τα
     δύο. Το φιλτράρισμα ζει στο DOM, ο δείκτης εδώ — και ο δείκτης είναι
     αυτό που μπορεί να είναι σιωπηλά λάθος. */
  const idx = [...h.matchAll(/data-f="([^"]*)"/g)].map(m => m[1]);
  /* Δείκτη έχει ΜΟΝΟ η πλάκα με αναζήτηση (τα 21 ρήματα). Τα 7 υποκείμενα
     δεν έχουν — επτά δείγματα δεν ψάχνονται, διαβάζονται. */
  is('δείκτη έχουν τα 21 ρήματα, όχι τα 7 υποκείμενα', idx.length, 21);
  is('⭐ «μετ» πιάνει ΚΑΙ το μέτεστι ΚΑΙ το μεταμέλει',
     idx.filter(x => x.indexOf('μετ') === 0).length, 2);
  ok('ο δείκτης δεν κρατάει τόνους', !/[άέήίόύώἀ-῾]/.test(idx.join('')));
  ok('⛔ το ΚΕΙΜΕΝΟ όμως κρατάει τους τόνους του', h.includes('<b>μέτεστι</b>'));
}

section('Β4 · ΟΙ ΔΙΑΚΟΠΤΕΣ ΚΑΙ ΤΑ ΔΙΚΑ ΤΟΥ');
{
  const E = makeEnv();
  fire(E.el('synCards'), 'click', tgt({ dataset:{ unit:'syn2' } }));
  const h = E.el('synBody').innerHTML;
  ok('οι διακόπτες έχουν δική τους ενότητα και δική τους όψη',
     h.includes('Οι διακόπτες') && h.includes('δικά μου λόγια') && h.includes('class="sy-sw"'));
  ok('τα ΔΙΚΑ ΤΟΥ χειρόγραφα, χωριστά και σε δικό τους χρώμα',
     h.includes('Τα δικά σου') && h.includes('class="sy-mine"'));
  ok('και ΔΕΝ φοράνε την όψη του φυλλαδίου', !h.includes('<div class="sy-note"><p>θρυλεῖται'));
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
  ok('το ράφι δείχνει ακόμη «αδιάβαστο» — ένα σωστό δεν είναι πρόοδος',
     E.el('synCards').innerHTML.includes('αδιάβαστο'));

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
  ok('η γραμμή περιεχομένων μετράει σωστά',
     E2.el('synCards').innerHTML.includes('<span class="t">' + (u.drill.length - 1) + '/' + u.drill.length + '</span>'));
  ok('και το ράφι συνολικά', E2.el('synN').textContent === (u.drill.length - 1) + '/' + S.totalDrill() + ' έφυγαν');
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


/* ══ Κ · Η ΔΡΟΜΟΛΟΓΗΣΗ ΧΩΡΙΣ ΠΟΡΤΑ ═════════════════════════════════
   ⭐⭐ ΤΟ ΠΙΟ ΕΠΙΚΙΝΔΥΝΟ ΚΟΜΜΑΤΙ ΤΗΣ als-v506. Η πόρτα ήταν το δίχτυ:
   ό,τι δεν αναγνωριζόταν προσγειωνόταν σε αυτήν. Τώρα δεν υπάρχει, οπότε
   ΚΑΘΕ διαδρομή πρέπει να καταλήγει σε κόσμο — αλλιώς λευκή οθόνη, που
   είναι η ασθένεια αυτού του project και ΔΕΝ φαίνεται ως σφάλμα.

   Τραβάει τις ΑΛΗΘΙΝΕΣ `pickWorld` / `fromHash` από τη σελίδα (ταίριασμα
   αγκυλών, όχι αντιγραφή) και τις τρέχει με στουμπωμένους κόσμους. */
section('Κ · ΚΑΘΕ ΔΙΑΔΡΟΜΗ ΚΑΤΑΛΗΓΕΙ ΣΕ ΚΟΣΜΟ');
{
  function grab(src, name){
    const at = src.indexOf('function ' + name + '(');
    if (at < 0) throw new Error('η arxaia.html δεν έχει πια function ' + name + '()');
    let i = src.indexOf('{', at), d = 0;
    for (let j = i; j < src.length; j++){
      if (src[j] === '{') d++;
      else if (src[j] === '}'){ d--; if (!d) return src.slice(at, j + 1); }
    }
    throw new Error('δεν έκλεισε η ' + name);
  }
  const gn = inline.filter(b => /function fromHash\(/.test(b))[0];
  ok('η δρομολόγηση ζει σε ΕΝΑ σημείο', !!gn);

  function route(hash){
    const seen = { gn:false, ag:false, toast:null };
    const box = {
      location:{ hash }, console,
      WAG:{ hidden:true }, WGN:{ hidden:true },
      document:{ body:{ style:{} } },
      window:{},
      reveal(w){ if (w === box.WAG) seen.ag = true; if (w === box.WGN) seen.gn = true; w.hidden = false; },
      renderHome(){}, toast(m){ seen.toast = m; }
    };
    box.window.scrollTo = function(){};
    vm.createContext(box);
    vm.runInContext(grab(gn, 'pickWorld') + '\n' + grab(gn, 'fromHash') + '\nfromHash();', box);
    return seen;
  }

  let r = route('#gn');
  is('#gn → Γνωστό', [r.gn, r.ag], [true, false]);
  r = route('#gnosto');
  ok('#gnosto επίσης', r.gn);
  r = route('#ag');
  is('#ag → Άγνωστο', [r.gn, r.ag], [false, true]);
  r = route('#agnosto');
  ok('#agnosto επίσης', r.ag);
  r = route('#syn');
  ok('⭐ ο ΠΑΛΙΟΣ σύνδεσμος #syn δεν πεθαίνει — πάει στο Άγνωστο', r.ag);
  ok('και σιωπηλά, χωρίς μήνυμα λάθους', !r.toast);
  r = route('');
  is('⛔ ΣΚΕΤΟ arxaia.html → Άγνωστο, ΠΟΤΕ κενό', [r.ag, r.toast], [true, null]);
  r = route('#αστειο');
  ok('άγνωστο hash → ΠΑΛΙ κόσμος, όχι λευκή οθόνη', r.ag);
  ok('και το ΛΕΕΙ ότι δεν το κατάλαβε', !!r.toast && /Άγνωστο/.test(r.toast));
}

/* ══ Λ · Η ΠΟΡΤΑ ΕΦΥΓΕ ΟΛΟΚΛΗΡΗ ════════════════════════════════════ */
section('Λ · ΚΑΝΕΝΑ ΛΕΙΨΑΝΟ ΤΗΣ ΠΟΡΤΑΣ');
{
  ['agDoor', 'ag-door', 'ag-pick', 'paintDoorStatus', 'openDoor', '__synDoorStatus', 'data-door', 'synWrap']
    .forEach(t => ok('δεν υπάρχει «' + t + '»', PAGE.indexOf(t) === -1));
  is('δύο σύνδεσμοι πίσω στο School Studies (ένας ανά κόσμο)',
     (PAGE.match(/class="ag-back" href="homework\.html"/g) || []).length, 2);
}

console.log(`\n${fail ? '✗' : '✓'} arxaia-syntax-page: ${pass} πέρασαν, ${fail} έπεσαν\n`);
process.exit(fail ? 1 : 0);
