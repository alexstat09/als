/* ══════════════════════════════════════════════════════════════════════
   tests/arxaia-gnosto-page.test.js — Η ΛΕΞΗ ΠΡΕΠΕΙ ΝΑ ΑΝΑΒΕΙ

   ⭐⭐⭐ ΓΙΑΤΙ ΥΠΑΡΧΕΙ. Δικά του λόγια, als-v522:
     «προσπαθω να πατησω λεξη πανω του οπως λεει για να αντιστοιχισει και
      μαθω οπως ειναι στην ενοτητα 1η και δεν γινεται τιποτα»

   Και είχε δίκιο. Το `openLesson` έδενε ακροατή στο `#gnLb` **σε κάθε
   άνοιγμα**. Το `innerHTML` αλλάζει τα ΠΑΙΔΙΑ — το `#gnLb` ΕΠΙΒΙΩΝΕΙ —
   άρα οι ακροατές ΣΥΣΣΩΡΕΥΟΝΤΑΝ: 1η ενότητα → 1, 2η → 2, 3η → 3.
   Και επειδή το `alnLight()` κάνει TOGGLE (`k === alnLit` σβήνει), ΔΥΟ
   ακροατές σημαίνουν άναψε-και-έσβησε στο ΙΔΙΟ κλικ:

       ΑΡΤΙΟ πλήθος ανοιγμάτων  →  η λέξη δεν κάνει ΤΙΠΟΤΑ
       ΠΕΡΙΤΤΟ πλήθος           →  δουλεύει κανονικά

   Δηλαδή ζούσε ή πέθαινε ανάλογα με το ΠΟΣΑ μαθήματα είχε ανοίξει, που
   είναι ο χειρότερος τρόπος να σπάει κάτι: κανένα σφάλμα, καμία σιωπηλή
   εξαίρεση, και «δούλευε στην 1η» επειδή η 1η ήταν συνήθως η ΠΡΩΤΗ που
   άνοιγε. Ζωντανό από την als-v460, δηλαδή από τη μέρα που ο Γνωστός
   απέκτησε δεύτερη ενότητα.

   ⚠️⚠️ ΚΑΙ ΤΟ ΔΙΚΟ ΜΟΥ ΕΡΓΑΛΕΙΟ ΤΟ ΕΙΧΕ ΒΓΑΛΕΙ ΠΡΑΣΙΝΟ (σταθ. 37).
   Το render της als-v521 άνοιξε ΜΙΑ ενότητα σε φρέσκια σελίδα — ένας
   ακροατής, περιττό πλήθος, όλα καλά. **Ένα harness που δεν πλοηγεί δεν
   ελέγχει πλοήγηση.** Γι' αυτό αυτό το αρχείο ανοίγει ΠΟΛΛΕΣ φορές.

   ΤΙ ΕΛΕΓΧΕΙ, και τρέχει τον ΑΛΗΘΙΝΟ κώδικα κομμένο από τη σελίδα:
     Α · πέντε ανοίγματα → ΕΝΑΣ ακροατής
     Β · ένα κλικ → το `alnLight` καλείται ΑΚΡΙΒΩΣ ΜΙΑ φορά
     Γ · ⭐ Η ΜΕΤΑΛΛΑΞΗ: χωρίς τον φρουρό, το ΣΕΝΑΡΙΟ ΤΟΥ ΑΛΕΞ πεθαίνει
     Δ · ο handler διαβάζει το ΤΡΕΧΟΝ `cur`, όχι κλείσιμο στην πρώτη ενότητα
     Ε · στατικά: ΕΝΑ μόνο `lb.addEventListener`, και μέσα στον φρουρό
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
/* ⚠️ ΤΑ ΣΧΟΛΙΑ ΒΓΑΙΝΟΥΝ ΠΡΩΤΑ (σταθ. 19). Το μπλοκ που διορθώθηκε
   ΠΕΡΙΓΡΑΦΕΙ το bug μέσα σε σχόλιο, οπότε ένας φρουρός που διαβάζει το
   ωμό αρχείο θα μέτραγε τη ΠΕΡΙΓΡΑΦΗ για κώδικα. */
const CODE = PAGE.replace(/\/\*[\s\S]*?\*\//g, '');

/* ══ Η ΒΕΛΟΝΑ: ο φρουρός, κομμένος ΑΥΤΟΥΣΙΟΣ από τη σελίδα ═══════════
   Κόβεται με ΜΕΤΡΗΜΑ ΑΓΚΥΛΩΝ, όχι με regex: το σώμα του handler έχει
   δικά του `{}` και ένα λαίμαργο regex θα έκοβε λάθος. */
function sliceGuard(src){
  const start = src.indexOf('if (!lb.__alnBound){');
  if (start < 0) throw new Error('δεν βρέθηκε ο φρουρός `lb.__alnBound` στην arxaia.html');
  let depth = 0, i = src.indexOf('{', start);
  for (let j = i; j < src.length; j++){
    if (src[j] === '{') depth++;
    else if (src[j] === '}'){ depth--; if (!depth) return src.slice(start, j + 1); }
  }
  throw new Error('ο φρουρός δεν κλείνει');
}
const GUARD = sliceGuard(CODE);

/* ══ ΤΟ ΣΤΟΥΜΠΩΜΕΝΟ DOM — αρκετό για να ΟΔΗΓΗΘΕΙ ═══════════════════ */
function makeEnv(){
  const calls = [];
  const lb = {
    _on: [],
    addEventListener(t, f){ if (t === 'click') lb._on.push(f); }
  };
  const env = {
    lb,
    calls,
    cur: null,
    /* Το `alnLight` της σελίδας κάνει TOGGLE. Το αναπαράγω ΑΥΤΟΥΣΙΟ, γιατί
       ο toggle ΕΙΝΑΙ ο λόγος που δύο ακροατές ισοδυναμούν με μηδέν. */
    alnLit: null,
    alnLight(k){
      calls.push(k);
      if (!k || k === env.alnLit){ env.alnLit = null; return; }
      env.alnLit = k;
    },
    G: { alignCheck(){ return []; } },
    /* Ένα κλικ, όπως το παράγει ο browser: ΕΝΑ event, μοιρασμένο σε
       ΟΛΟΥΣ τους ακροατές. */
    click(word){
      const target = {
        closest(sel){
          if (sel === '.al-m.hid') return null;
          if (sel === '.al-k') return { dataset: { alk: word } };
          return null;
        }
      };
      lb._on.slice().forEach(f => f({ target }));
    }
  };
  return env;
}
function open(env, unit, opts){
  const sandbox = Object.assign({ un: unit }, env);
  sandbox.cur = unit;
  env.cur = unit;
  /* ο handler κλείνει πάνω σε ΑΥΤΟ το context, οπότε το `cur` πρέπει να
     ζει στο ΙΔΙΟ αντικείμενο για κάθε άνοιγμα */
  if (!env._ctx){
    env._ctx = vm.createContext({
      lb: env.lb, G: env.G, alnLight: env.alnLight, cur: unit, un: unit
    });
  }
  env._ctx.un = unit;
  env._ctx.cur = unit;
  if (opts && opts.noGuard) env.lb.__alnBound = 0;   /* ΜΕΤΑΛΛΑΞΗ */
  vm.runInContext(GUARD, env._ctx, { filename: 'arxaia.html#alignGuard' });
}

const U1 = { id: 'gk1', align: { pairs: { p1: {} } } };
const U2 = { id: 'gk2', align: { pairs: { p1: {} } } };
const U3 = { id: 'gk3', align: { pairs: { a1: {} } } };

/* ══ Α · ΠΕΝΤΕ ΑΝΟΙΓΜΑΤΑ, ΕΝΑΣ ΑΚΡΟΑΤΗΣ ════════════════════════════ */
section('Α · Ο ΑΚΡΟΑΤΗΣ ΔΕΝΕΤΑΙ ΜΙΑ ΜΟΝΟ ΦΟΡΑ');
{
  const E = makeEnv();
  [U1, U2, U3, U1, U3].forEach(u => open(E, u));
  is('πέντε ανοίγματα → ΕΝΑΣ ακροατής στο #gnLb', E.lb._on.length, 1);
}

/* ══ Β · ΕΝΑ ΚΛΙΚ = ΜΙΑ ΚΛΗΣΗ ══════════════════════════════════════ */
section('Β · ΕΝΑ ΚΛΙΚ ΚΑΛΕΙ ΤΟ alnLight ΑΚΡΙΒΩΣ ΜΙΑ ΦΟΡΑ');
{
  const E = makeEnv();
  [U1, U2, U3].forEach(u => open(E, u));
  E.click('a1');
  is('μία κλήση', E.calls.length, 1);
  is('και η λέξη ΕΜΕΙΝΕ αναμμένη', E.alnLit, 'a1');
}

/* ══ Γ · ⭐ Η ΜΕΤΑΛΛΑΞΗ — ΤΟ ΣΕΝΑΡΙΟ ΤΟΥ ΑΛΕΞ ══════════════════════
   Χωρίς τον φρουρό, «1η → πίσω → 3η» δίνει ΔΥΟ ακροατές, το κλικ
   ανάβει-και-σβήνει, και η λέξη δεν κάνει τίποτα. Αν αυτή η βεβαίωση
   πάψει να δαγκώνει, ο φρουρός έχει φύγει. */
section('Γ · ΧΩΡΙΣ ΤΟΝ ΦΡΟΥΡΟ, Η ΛΕΞΗ ΠΕΘΑΙΝΕΙ (μετάλλαξη)');
{
  const E = makeEnv();
  open(E, U1, { noGuard: true });
  open(E, U3, { noGuard: true });
  is('το bug αναπαράγεται: ΔΥΟ ακροατές', E.lb._on.length, 2);
  E.click('a1');
  is('το κλικ κάλεσε ΔΥΟ φορές', E.calls.length, 2);
  is('⛔ ΚΑΙ Η ΛΕΞΗ ΕΣΒΗΣΕ — αυτό έβλεπε ο Άλεξ', E.alnLit, null);
}

/* ══ Δ · Ο HANDLER ΔΙΑΒΑΖΕΙ ΤΟ ΤΡΕΧΟΝ `cur` ════════════════════════
   ⚠️ Ένας ΜΟΝΙΜΟΣ ακροατής που κρατούσε το `un` της ΠΡΩΤΗΣ ενότητας θα
   βαθμολογούσε για πάντα με τα ζευγάρια εκείνης. Ο έλεγχος: μετά από
   άνοιγμα της 3ης, μια ενότητα με σπασμένη αντιστοιχία ΚΟΒΕΙ το κλικ. */
section('Δ · Ο HANDLER ΑΚΟΛΟΥΘΕΙ ΤΗΝ ΕΝΟΤΗΤΑ ΠΟΥ ΕΙΝΑΙ ΑΝΟΙΧΤΗ');
{
  const E = makeEnv();
  open(E, U1);
  open(E, U3);
  E.click('a1');
  is('ανοιχτή η 3η → το κλικ περνάει', E.calls.length, 1);
  /* τώρα «ανοίγει» ενότητα που η αντιστοιχία της ΔΕΝ συμφωνεί */
  E._ctx.G = { alignCheck(){ return ['ασύμφωνη']; } };
  E._ctx.cur = { id: 'gkX', align: { pairs: {} } };
  E.click('a1');
  is('ασύμφωνη αντιστοιχία → το κλικ ΔΕΝ περνάει', E.calls.length, 1);
  E._ctx.G = { alignCheck(){ return []; } };
  E._ctx.cur = null;
  E.click('a1');
  is('χωρίς ανοιχτή ενότητα → το κλικ ΔΕΝ σκάει και δεν περνάει', E.calls.length, 1);
}

/* ══ Ε · ΣΤΑΤΙΚΑ: ΚΑΘΕ ΔΕΣΙΜΟ ΕΧΕΙ ΤΟΝ ΦΡΟΥΡΟ ΤΟΥ ════════════════════
   ⭐⭐ als-v533 — Η ΒΕΒΑΙΩΣΗ ΗΤΑΝ ΜΕΤΡΗΜΑ ΚΑΙ ΕΓΙΝΕ ΙΔΙΟΤΗΤΑ.
   Έλεγε «ΑΚΡΙΒΩΣ ένα lb.addEventListener», που ήταν σωστό όσο υπήρχε ένας
   ακροατής — αλλά αυτό που κρατάει την als-v522 κλειστή ΔΕΝ είναι το
   πλήθος: είναι ότι ΚΑΘΕ ακροατής στο `lb` κάθεται πίσω από δικό του
   φρουρό στο ΣΤΟΙΧΕΙΟ. Με το μέτρημα, η μπάρα των κουμπιών (σωστά δεμένη,
   με δικό της `__tabBound`) κοκκίνιζε· και ένας δεύτερος ΑΦΡΟΥΡΗΤΟΣ που
   αντικαθιστούσε τον πρώτο θα περνούσε. Η βεβαίωση κοίταζε το λάθος
   πράγμα προς ΚΑΙ ΤΙΣ ΔΥΟ κατευθύνσεις. */
section('Ε · ΚΑΝΕΝΑ ΑΦΡΟΥΡΗΤΟ ΔΕΣΙΜΟ ΣΤΟ #gnLb');
{
  const re = /lb\.addEventListener\(\s*'click'/g;
  const spots = [];
  let m;
  while ((m = re.exec(CODE))) spots.push(m.index);
  ok('υπάρχει τουλάχιστον ένα lb.addEventListener(\'click\'', spots.length >= 1);
  const naked = spots.filter(i => !/if \(!lb\.__[A-Za-z]+\)\s*\{\s*lb\.__[A-Za-z]+\s*=\s*1;/
    .test(CODE.slice(Math.max(0, i - 400), i)));
  is('⛔ κάθε δέσιμο κάθεται πίσω από φρουρό `if (!lb.__…Bound)`', naked.length, 0);
  ok('και ο φρουρός σφραγίζει το ΣΤΟΙΧΕΙΟ, όχι local', /lb\.__alnBound\s*=\s*1/.test(GUARD));
  ok('ο handler της αντιστοιχίας διαβάζει `cur`, ποτέ `un`',
     /\bcur\b/.test(GUARD) && !/\bun\b/.test(GUARD));
}

/* ══ ΣΤ · Η ΚΡΙΣΗ ΑΝΑ ΠΕΡΙΟΔΟ (als-v524) ═════════════════════════════
   Τρέχει τις ΑΛΗΘΙΝΕΣ συναρτήσεις, κομμένες από τη σελίδα με μέτρημα
   αγκυλών. ⚠️ Το `function load(){` υπάρχει ΤΡΕΙΣ φορές στο αρχείο (τρία
   IIFE με ίδια ονόματα — σταθ. 44), οπότε ο σωστός βρίσκεται ΑΠΟ ΤΟ ΜΗΝΥΜΑ
   ΤΟΥ ΓΝΩΣΤΟΥ και ΠΡΟΣ ΤΑ ΠΙΣΩ. Ένα σκέτο indexOf θα έκοβε τον Άγνωστο. */
function sliceFrom(src, at){
  let depth = 0;
  for (let j = src.indexOf('{', at); j < src.length; j++){
    if (src[j] === '{') depth++;
    else if (src[j] === '}'){ depth--; if (!depth) return src.slice(at, j + 1); }
  }
  throw new Error('δεν κλείνει');
}
/* ⚠️⚠️ ΣΤΑΘ. 44, ΚΑΙ ΤΟ ΕΠΙΑΣΕ Η ΑΠΟΤΥΧΙΑ ΤΟΥ ΙΔΙΟΥ ΜΟΥ ΤΟΥ TEST:
   `blank`, `load`, `u`, `save` υπάρχουν **ΤΡΕΙΣ ΦΟΡΕΣ** στο αρχείο (Άγνωστο /
   Γνωστό / Συντακτικό), με ΤΑ ΙΔΙΑ ΟΝΟΜΑΤΑ. Ένα σκέτο `indexOf` πιάνει το
   ΠΡΩΤΟ, δηλαδή του ΑΓΝΩΣΤΟΥ — και το `blank()` εκείνου δεν έχει `per`, οπότε
   το test κατηγορούσε σωστό κώδικα. Κόβω ΜΟΝΟ μέσα από την περιοχή του
   Γνωστού, που αρχίζει στο δικό του `KEY`. */
const GNSTART = CODE.indexOf("var KEY = 'arx:gn';");
if (GNSTART < 0) throw new Error("δεν βρέθηκε η περιοχή του Γνωστού (var KEY = 'arx:gn')");
const GN = CODE.slice(GNSTART);
function fn(name){
  const at = GN.indexOf('function ' + name + '(');
  if (at < 0) throw new Error('δεν βρέθηκε η ' + name + ' μέσα στον Γνωστό');
  return sliceFrom(GN, at);
}
function gnostoLoad(){ return fn('load'); }

function gnEnv(stored){
  const store = {};
  if (stored != null) store[(/var KEY = '([^']+)'/.exec(CODE.slice(GNSTART))||[])[1]] = JSON.stringify(stored);
  /* ⚠️ Το `KEY` ζει ΕΞΩ από τον `load()`, στο IIFE. Χωρίς αυτό το sandbox
     διαβάζει `getItem(undefined)`, ο `load()` γυρίζει σωστά `blank()`, και το
     test κατηγορεί σωστό κώδικα για απώλεια δεδομένων. Σταθ. 30, ξανά — και
     το διαβάζω από το ΑΡΧΕΙΟ, ώστε μια μετονομασία κλειδιού να σκάσει εδώ. */
  const KEY = (/var KEY = '([^']+)'/.exec(CODE.slice(GNSTART)) || [])[1];
  if (!KEY) throw new Error('δεν διαβάστηκε το KEY του Γνωστού');
  const sb = {
    KEY: KEY, state: null, toasts: [],
    localStorage: { getItem: k => (k in store ? store[k] : null), setItem: (k,v)=>{store[k]=String(v);} },
    JSON, Object, Array, Math, Date, console
  };
  sb.toast = m => sb.toasts.push(m);
  vm.createContext(sb);
  ['blank','pr','prGot','prSeen','prTally','tallyText'].forEach(n => vm.runInContext(fn(n), sb, {filename:'arxaia.html#'+n}));
  vm.runInContext(gnostoLoad(), sb, {filename:'arxaia.html#gnLoad'});
  vm.runInContext('state = load();', sb);
  return sb;
}

section('ΣΤ1 · ⚠️ ΣΤΑΘ. 35 — Ο load() ΔΕΝ ΕΙΝΑΙ ΛΙΣΤΑ ΕΠΙΤΡΕΠΟΜΕΝΩΝ');
{
  /* Ένα πεδίο που ΔΕΝ ονομάζει ο load() πρέπει να επιβιώνει, αλλιώς μια
     εγγραφή που κατέβηκε από ΑΛΛΗ ΣΥΣΚΕΥΗ σβήνεται στο πρώτο render και το
     push κάνει το σβήσιμο αλήθεια παντού. Αυτή ήταν 🔴 ΠΑΓΙΔΑ στο `arx:gn`
     από την als-v471, και κλείνει εδώ. */
  const E = gnEnv({ v:1, units:{a:{last:1}}, els:{}, per:{'gk3:1':{g:5,m:0}},
                    days:[1], heard:{x:1}, sessions:[{id:'ΑΛΛΗ_ΣΥΣΚΕΥΗ'}] });
  is('⭐ άγνωστο πεδίο ΕΠΙΒΙΩΝΕΙ της φόρτωσης',
     JSON.stringify(E.state.sessions), JSON.stringify([{id:'ΑΛΛΗ_ΣΥΣΚΕΥΗ'}]));
  is('το `per` φορτώνεται', JSON.stringify(E.state.per['gk3:1']), JSON.stringify({g:5,m:0}));
  is('τα γνωστά πεδία μένουν ανέπαφα', JSON.stringify(E.state.units), JSON.stringify({a:{last:1}}));
  /* Και ο load() ΔΕΝ σκάει σε σκουπίδια. */
  const B = gnEnv({ v:1, units:'ΟΧΙ ΑΝΤΙΚΕΙΜΕΝΟ', per:null, days:'ΟΧΙ ΠΙΝΑΚΑΣ' });
  is('λάθος τύποι κανονικοποιούνται, δεν σκάνε', 
     [typeof B.state.units, typeof B.state.per, Array.isArray(B.state.days)].join(','), 'object,object,true');
  const N = gnEnv(null);
  is('άδεια αποθήκη → καθαρό blank με `per`', JSON.stringify(N.state.per), '{}');
}

section('ΣΤ2 · Η ΜΝΗΜΗ ΑΝΑ ΠΕΡΙΟΔΟ');
{
  const E = gnEnv({ v:1 });
  const run = expr => vm.runInContext(expr, E);
  run(`pr('gk3', 1).g = 100;`);
  run(`pr('gk3', 2).m = 200;`);
  run(`pr('gk3', 3).g = 300; pr('gk3', 3).m = 400;`);   /* άλλαξε γνώμη → ΔΕΝ την έχει */
  run(`pr('gk3', 4).m = 500; pr('gk3', 4).g = 600;`);   /* άλλαξε γνώμη → την ΕΧΕΙ */
  is('«το είχα» → την έχει',            run(`prGot('gk3',1)`), true);
  is('«όχι ακόμη» → δεν την έχει',      run(`prGot('gk3',2)`), false);
  is('⭐ νικάει το ΝΕΟΤΕΡΟ πάτημα (g→m)', run(`prGot('gk3',3)`), false);
  is('⭐ και προς την άλλη κατεύθυνση (m→g)', run(`prGot('gk3',4)`), true);
  is('περίοδος που δεν άγγιξε ποτέ',    run(`prSeen('gk3',9)`), false);
  is('⛔ και ΔΕΝ γεννιέται εγγραφή από ΑΝΑΓΝΩΣΗ (το bug του nut:streak)',
     run(`(prGot('gk3',9), prSeen('gk3',9), state.per['gk3:9'] === undefined)`), true);
  const t = run(`prTally({ id:'gk3', align:{ segs:[{n:1},{n:2},{n:3},{n:4},{n:5}] } })`);
  is('ο μετρητής μετράει σωστά', JSON.stringify(t), JSON.stringify({got:2, seen:4, all:5}));
}

section('ΣΤ3 · ⛔ ΤΡΕΙΣ ΚΑΤΑΣΤΑΣΕΙΣ, ΤΡΕΙΣ ΠΡΟΤΑΣΕΙΣ, ΚΑΜΙΑ ΒΑΘΜΟΛΟΓΙΑ');
{
  const E = gnEnv({ v:1 });
  const say = o => vm.runInContext('tallyText(' + JSON.stringify(o) + ')', E);
  const none = say({got:0,seen:0,all:11}), some = say({got:7,seen:9,all:11}), all = say({got:11,seen:11,all:11});
  ok('«δεν ξεκίνησες» δεν τυπώνει αριθμό (σταθ. 33)', !/\d/.test(none) && none.length > 0);
  ok('«τόσα από τόσα» τα λέει και τα δύο', /7/.test(some) && /11/.test(some));
  /* ⚠️ Η ΠΡΩΤΗ ΓΡΑΦΗ ΑΥΤΗΣ ΤΗΣ ΓΡΑΜΜΗΣ ΔΕΝ ΔΑΓΚΩΝΕ, και το έδειξε η
     μετάλλαξη: με το «τα έχεις όλα» σβησμένο, βγαίνει «Τις έχεις 11 από 11»
     — που είναι ΔΙΑΦΟΡΕΤΙΚΟ από το «7 από 11» και περιέχει «11», άρα
     περνούσε. Το «11 από 11» όμως είναι ΑΚΡΙΒΩΣ η πρόταση που δεν θέλουμε:
     όταν τα έχει όλα, ο μετρητής δεν είναι μέτρηση, είναι νέα. Ο έλεγχος
     πρέπει να αρνείται το ΠΡΟΤΥΠΟ «N από N», όχι απλώς μια διαφορά. */
  ok('«τα έχεις όλα» ΔΕΝ λέει «N από N»', all !== some && /11/.test(all) && all.indexOf('από') < 0);
  is('⛔ και οι τρεις είναι ΔΙΑΦΟΡΕΤΙΚΕΣ', new Set([none, some, all]).size, 3);
  is('⛔ κανένα ποσοστό πουθενά', [none,some,all].filter(x => x.indexOf('%') >= 0).length, 0);
}

section('ΣΤ4 · Η ΚΑΛΩΔΙΩΣΗ ΠΟΥ ΣΩΖΕΙ ΤΑ ΔΕΔΟΜΕΝΑ');
{
  /* ⚠️ ΣΤΑΘ. 31: φωλιασμένος χάρτης ΧΩΡΙΣ `_ts` δουλεύει την ΠΡΩΤΗ φορά και
     γυρίζει πίσω από τη ΔΕΥΤΕΡΗ — σπάει ακριβώς τη μέρα που μετράει. */
  ok('το `per` δηλώνεται στο readMaps του STAMP',
     /\[state\.units,\s*state\.els,\s*state\.per\]/.test(CODE));
  ok('και ο δείκτης 2 δηλώνει το δικό του legacy `last`',
     /i === 2\)\s*return Math\.max\(rec\.g/.test(CODE));
  ok('το `per` υπάρχει στο blank()', /blank\(\)\{ return \{ v:1, units:\{\}, els:\{\}, per:\{\}/.test(CODE));
  ok('η κρίση ΓΡΑΦΕΙ (καλεί save)', /function alnJudge\([\s\S]{0,400}?save\(\);/.test(CODE));
  /* ⛔ Η κρίση είναι ΔΗΛΩΣΗ. Δεν επιτρέπεται να αγγίξει τη σκάλα, αλλιώς
     ένας ισχυρισμός θα γινόταν μετρημένη πρόοδος (το μάθημα της als-v456). */
  const judge = fn('alnJudge');
  is('⛔ η κρίση ΔΕΝ αγγίζει τη σκάλα',
     ['reviews','due','learnedAt','best','runs','claimed'].filter(k => judge.indexOf(k) >= 0).join(','), '');
  ok('⛔ και ΔΕΝ ξαναχτίζει την όψη (θα έσβηνε το κρυμμένο κείμενο)',
     judge.indexOf('openLesson') < 0 && judge.indexOf('innerHTML') < 0);
}

/* ══ als-v530 · Ο ΣΥΝΔΕΣΜΟΣ ΦΤΑΝΕΙ ΩΣ ΤΗΝ ΕΝΟΤΗΤΑ ══════════════════════
   Δικά του: «γιατί δεν βλέπω καμία αλλαγή στην ενότητα 3η; νιώθω ότι δεν
   έχει περάσει τίποτα στο dashboard». Είχε περάσει· ο σύνδεσμος του School
   Studies τον άφηνε στο `#gn` — στη ΛΙΣΤΑ — και όλη η δουλειά ζει ΜΕΣΑ στο
   μάθημα. Δηλαδή η οθόνη που έβλεπε ήταν όντως απαράλλαχτη.
   ⚠️ Αυτό είναι ΤΟ ΙΔΙΟ ΓΕΝΟΣ ΣΦΑΛΜΑΤΟΣ με το silent-empty αυτού του
   project: τίποτα δεν έσπασε, απλώς η αλήθεια δεν έφτασε στην οθόνη. */
{
  const H = fs.readFileSync(path.join(ALS, 'arxaia.html'), 'utf8');
  const W = fs.readFileSync(path.join(ALS, 'homework.html'), 'utf8');
  const from = /function fromHash\(\)\{[\s\S]*?\n  \}/.exec(H);
  ok('η fromHash δέχεται «#gn/<id>»',
     !!from && /\^\(\?:gn\|gnosto\)\[/.test(from[0]));
  ok('και ανοίγει το μάθημα', !!from && /openLesson\(un\.id\)/.test(from[0]));
  /* ⛔ ΠΟΤΕ ΛΕΥΚΗ ΟΘΟΝΗ, ΠΟΤΕ ΣΙΩΠΗ: άγνωστο id το ΛΕΕΙ και αφήνει λίστα. */
  ok('⛔ άγνωστη ενότητα το ΛΕΕΙ αντί να σιωπήσει',
     !!from && /toast\('Δεν βρήκα την ενότητα/.test(from[0]));
  ok('και το σκέτο «#gn» σημαίνει ό,τι σήμαινε',
     !!from && /h === 'gn' \|\| h === 'gnosto'/.test(from[0]));

  /* Και η ΑΛΛΗ άκρη: χωρίς αυτήν, ο βαθύς σύνδεσμος δεν παράγεται ποτέ. */
  ok('το School Studies χτίζει «arxaia.html#gn/<id>»',
     /return 'arxaia\.html#gn\/' \+ encodeURIComponent\(unitId\)/.test(W));
  ok('και οι ενότητες του Γνωστού δηλώνονται deep',
     /subject:'arxaia_gn'[^}]*deep:true/.test(W));
  /* ⚠️ Ο ΑΓΝΩΣΤΟΣ ΔΕΝ διαβάζει ενότητα — αν γίνει ποτέ deep χωρίς να
     μάθει να τη διαβάζει, ο σύνδεσμος προσγειώνεται σε αδιέξοδο. */
  ok('⛔ ο Άγνωστος μένει ρητά ΟΧΙ-deep',
     /subject:'arxaia_agn'[^}]*deep:false/.test(W));
}

console.log('\n  ' + pass + ' πέρασαν, ' + fail + ' απέτυχαν\n');
process.exit(fail ? 1 : 0);
