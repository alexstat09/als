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

/* ══ Ε · ΣΤΑΤΙΚΑ: ΕΝΑ ΜΟΝΟ ΣΗΜΕΙΟ ΔΕΣΙΜΑΤΟΣ ════════════════════════ */
section('Ε · ΚΑΝΕΝΑ ΔΕΥΤΕΡΟ ΔΕΣΙΜΟ ΔΕΝ ΞΑΝΑΜΠΑΙΝΕΙ');
{
  const binds = (CODE.match(/lb\.addEventListener\(\s*'click'/g) || []).length;
  is('ΑΚΡΙΒΩΣ ένα lb.addEventListener(\'click\'', binds, 1);
  ok('και κάθεται ΜΕΣΑ στον φρουρό __alnBound', /lb\.addEventListener\(\s*'click'/.test(GUARD));
  ok('ο φρουρός σφραγίζει το στοιχείο, όχι local', /lb\.__alnBound\s*=\s*1/.test(GUARD));
  ok('ο handler διαβάζει `cur`, ποτέ `un`',
     /\bcur\b/.test(GUARD) && !/\bun\b/.test(GUARD));
}

console.log('\n  ' + pass + ' πέρασαν, ' + fail + ' απέτυχαν\n');
process.exit(fail ? 1 : 0);
