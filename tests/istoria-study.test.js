/* ══════════════════════════════════════════════════════════════════════
   tests/istoria-study.test.js

   ΤΟ ΥΛΙΚΟ ΜΕΣΑ ΣΤΗ ΣΕΛΙΔΑ — `docs/MATHIMA_SPEC.md`, φάσεις 0–4.

   Δικά του λόγια: «όσα δεν τα έχω πει απέξω κρατάει μόνο να με εξετάσει
   παρά να μου δείξει τη σελίδα που με βοηθάει να καταλάβω».

   ⭐⭐ Η ΕΓΓΥΗΣΗ ΠΟΥ ΚΛΕΙΔΩΝΕΤΑΙ ΕΔΩ: ΑΥΤΟ ΠΟΥ ΔΙΑΒΑΖΕΙ ΕΙΝΑΙ ΑΚΡΙΒΩΣ ΑΥΤΟ
   ΠΟΥ ΘΑ ΤΟΥ ΖΗΤΗΘΕΙ. Το υλικό δεν είναι δεύτερη εκδοχή της ύλης — βγαίνει
   από την ΙΔΙΑ `I.paraPoints()` που χτίζει την απαγγελία (`I.pointsOf`). Αν
   οι δύο αποκλίνουν, η σελίδα του διδάσκει άλλα και τον εξετάζει σε άλλα,
   ΧΩΡΙΣ κανένα error — ακριβώς η κατηγορία σφάλματος των als-v433/452.

   ⚠️ ΚΑΜΙΑ ΑΝΤΙΓΡΑΦΗ ΚΑΝΟΝΑ. Οι συναρτήσεις ΚΟΒΟΝΤΑΙ ΑΠΟ ΤΟ ΑΡΧΕΙΟ και
   τρέχουν σε vm. Ένα αντίγραφο μέσα στο test θα συμφωνούσε με κάθε λάθος
   μου τέλεια (σταθερή αρχή: η διπλή μεταγραφή των Αρχαίων).

   node tests/istoria-study.test.js
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

const PAGE = fs.readFileSync(path.join(ALS, 'istoria-demo.html'), 'utf8');
const I = require(path.join(ALS, 'istoria-data.js'));

/* ── Κόψε ΜΙΑ συνάρτηση από το αρχείο, με ισοζύγιο αγκυλών ────────────
   Σκάει δυνατά αν λείπει: μια βεβαίωση που δεν βρίσκει τον κώδικά της δεν
   επιτρέπεται να περάσει σιωπηλά (σταθερή αρχή 19). */
function slice(name) {
  const at = PAGE.indexOf('function ' + name + '(');
  if (at < 0) throw new Error('istoria-demo.html: λείπει η function ' + name + ' — η εγγύηση έφυγε');
  let i = PAGE.indexOf('{', at), depth = 0, j = i;
  for (; j < PAGE.length; j++) {
    if (PAGE[j] === '{') depth++;
    else if (PAGE[j] === '}') { depth--; if (!depth) break; }
  }
  return PAGE.slice(at, j + 1);
}

/* Το περιβάλλον της σελίδας σε μικρογραφία: ΜΟΝΟ ό,τι ακουμπάνε οι κομμένες
   συναρτήσεις. Καμία σελίδα, κανένα DOM, καμία επαφή με δίκτυο. */
function ctx(extra) {
  const box = Object.assign({
    I, JSON, Object, Array, Date, Math, String, Number, RegExp, console,
    state: { v: 1, units: {}, els: {}, days: [], heard: {}, plag: {}, sessions: [], pace: { secs: 0, els: 0 } },
    toast() { }, save() { }
  }, extra || {});
  vm.createContext(box);
  vm.runInContext(slice('esc'), box);
  vm.runInContext(slice('has'), box);
  return box;
}

/* ══════════════════════════════════════════════════════════════════════ */
section('⭐⭐ 1 · ΤΟ ΥΛΙΚΟ ΕΙΝΑΙ ΑΚΡΙΒΩΣ Η ΕΞΕΤΑΣΗ');

const box1 = ctx();
vm.runInContext(slice('studyParas'), box1);
vm.runInContext(slice('studyPoints'), box1);

function keysOf(list) { return list.map(x => x.unitId + ':' + x.pointIndex); }

/* Το υλικό όπως το ζωγραφίζει η σελίδα, ισοπεδωμένο στη σειρά που φαίνεται. */
function materialKeys(box, t) {
  const paras = box.studyParas(t);
  let out = [];
  for (const pr of paras) out = out.concat(keysOf(box.studyPoints(t, pr.u, pr.p)));
  return out;
}

/* Φτιάξε πλαγιότιτλο πάνω στο ΑΛΗΘΙΝΟ corpus: οι δύο πρώτες παράγραφοι της
   πρώτης ενότητας που έχει τουλάχιστον δύο. */
const bigUnit = I.UNITS.find(u => (u.text || []).length >= 2);
ok('βρέθηκε ενότητα με ≥2 παραγράφους στο corpus', !!bigUnit);

const plag = { id: 'p_t1', title: 'Δοκιμαστικός πλαγιότιτλος', picks: [{ u: bigUnit.id, p: 0 }, { u: bigUnit.id, p: 1 }], drop: [] };
const T = { kind: 'plag', rec: plag };

is('το υλικό δίνει ΑΚΡΙΒΩΣ τα σημεία της απαγγελίας, στην ΙΔΙΑ σειρά',
  materialKeys(box1, T), keysOf(I.pointsOf(plag)));
ok('…και δεν είναι κενό (αλλιώς η ισότητα είναι κενή)', materialKeys(box1, T).length > 0);

/* Με `drop`: ο ΙΔΙΟΣ κανόνας πρέπει να ισχύει και στις δύο πλευρές. */
const allK = keysOf(I.pointsOf(plag));
const plagD = Object.assign({}, plag, { drop: [allK[0]] });
const TD = { kind: 'plag', rec: plagD };
is('το `drop` αφαιρεί το ΙΔΙΟ σημείο από υλικό και εξέταση',
  materialKeys(box1, TD), keysOf(I.pointsOf(plagD)));
ok('…και όντως αφαίρεσε ένα', materialKeys(box1, TD).length === allK.length - 1);

/* Η ίδια παράγραφος δύο φορές δεν διπλασιάζει το υλικό — όπως δεν
   διπλασιάζει και τα στοιχεία (`seen` στο `pointsOf`). */
const plagDup = { id: 'p_t2', title: 'δις', picks: [{ u: bigUnit.id, p: 0 }, { u: bigUnit.id, p: 0 }], drop: [] };
is('διπλή επιλογή της ίδιας παραγράφου → μία φορά, όπως στην εξέταση',
  materialKeys(box1, { kind: 'plag', rec: plagDup }), keysOf(I.pointsOf(plagDup)));

/* Ενότητα ΧΩΡΙΣ πλαγιότιτλους = όλες οι παράγραφοί της, καμία λιγότερη. */
const TU = { kind: 'unit', rec: bigUnit };
is('ενότητα → όσες παράγραφοι έχει', box1.studyParas(TU).length, (bigUnit.text || []).length);

/* ══════════════════════════════════════════════════════════════════════ */
section('2 · Η ΕΥΘΥΓΡΑΜΜΙΣΗ ΕΙΝΑΙ ΑΛΗΘΙΝΗ ΣΕ ΟΛΟ ΤΟ CORPUS');

let checked = 0, wrong = 0, para0 = 0;
for (const un of I.UNITS) {
  for (let p = 0; p < (un.text || []).length; p++) {
    const pts = I.paraPoints(un.id, p);
    if (!pts.length) para0++;
    for (const x of pts) {
      checked++;
      /* Το σημείο κάθεται δίπλα σε ΑΥΤΗ την παράγραφο· η άγκυρά του πρέπει να
         ζει ΜΕΣΑ της. Αλλιώς η στήλη δεξιά λέει ψέματα για το αριστερά. */
      if (I.fold(un.text[p].p).indexOf(I.fold(x.point.anchor || '')) < 0) wrong++;
    }
  }
}
ok('ελέγχθηκαν σημεία σε πραγματικές παραγράφους', checked > 50);
is('κάθε σημείο που δείχνεται δίπλα σε παράγραφο ΑΝΗΚΕΙ σε αυτήν', wrong, 0);
is('καμία παράγραφος του corpus δεν μένει χωρίς σημεία', para0, 0);

/* ΔΑΓΚΩΝΕΙ; Μια άγκυρα που δεν υπάρχει δεν επιστρέφεται ποτέ. */
is('παράγραφος εκτός ορίων → κανένα σημείο (ποτέ σιωπηλή πρώτη)',
  I.paraPoints(bigUnit.id, 999).length, 0);
is('άγνωστη ενότητα → κανένα σημείο', I.paraPoints('δεν-υπάρχει', 0).length, 0);

/* ══════════════════════════════════════════════════════════════════════ */
section('3 · Η ΣΗΜΑΝΣΗ ΔΕΝ ΑΓΓΙΖΕΙ ΤΑ ΛΟΓΙΑ ΤΟΥ ΒΙΒΛΙΟΥ');

const box3 = ctx();
vm.runInContext(slice('markAnchors'), box3);

function unmark(html) {
  return html.replace(/<\/?mark[^>]*>/g, '')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
}

const rawP = bigUnit.text[0].p;
const ptsP = I.paraPoints(bigUnit.id, 0);
const marked = box3.markAnchors(rawP, ptsP);

is('⭐ το κείμενο βγαίνει ΧΑΡΑΚΤΗΡΑ ΠΡΟΣ ΧΑΡΑΚΤΗΡΑ όπως μπήκε', unmark(marked), rawP);
ok('τουλάχιστον μία άγκυρα σημάνθηκε', /<mark class="sd-anchor"/.test(marked));
is('τα <mark> είναι ισοζυγισμένα',
  (marked.match(/<mark /g) || []).length, (marked.match(/<\/mark>/g) || []).length);
ok('κάθε mark κουβαλάει το κλειδί του σημείου του',
  /data-pt="[^"]+:\d+"/.test(marked));

/* ⛔ ΜΙΑ ΑΓΚΥΡΑ ΠΟΥ ΔΕΝ ΥΠΑΡΧΕΙ ΑΥΤΟΛΕΞΕΙ ΔΕΝ ΑΝΑΒΕΙ ΤΙΠΟΤΑ. Ποτέ fold, ποτέ
   «περίπου εκεί»: ένας δείκτης από folded κείμενο δείχνει σε λάθος θέση και
   θα έκοβε τη λέξη του βιβλίου στη μέση. */
const fake = [{ unitId: 'x', pointIndex: 0, point: { anchor: 'ΑΥΤΟ ΔΕΝ ΥΠΑΡΧΕΙ ΠΟΥΘΕΝΑ', must: [] } }];
is('άγκυρα που δεν υπάρχει → καμία σήμανση, κείμενο ανέπαφο',
  box3.markAnchors(rawP, fake), box3.esc(rawP));

/* Τονισμένη παραλλαγή = ΔΕΝ είναι αυτολεξεί → δεν ανάβει. Αποδεικνύει ότι
   δεν υπάρχει σιωπηλό fold πουθενά στη διαδρομή. */
const anch = (ptsP[0] && ptsP[0].point.anchor) || '';
if (anch) {
  const off = [{ unitId: 'x', pointIndex: 0, point: { anchor: anch.toUpperCase(), must: [] } }];
  is('παραλλαγή κεφαλαίων ΔΕΝ θεωρείται άγκυρα', box3.markAnchors(rawP, off), box3.esc(rawP));
}

/* Επικάλυψη: δύο άγκυρες που πιάνονται δεν βγάζουν φωλιασμένο markup. */
const A = rawP.slice(10, 40), B = rawP.slice(20, 50);
const over = box3.markAnchors(rawP, [
  { unitId: 'u', pointIndex: 0, point: { anchor: A, must: [] } },
  { unitId: 'u', pointIndex: 1, point: { anchor: B, must: [] } }
]);
is('επικάλυψη → κερδίζει η πρώτη, κείμενο ακέραιο', unmark(over), rawP);
is('επικάλυψη → ακριβώς ΕΝΑ mark', (over.match(/<mark /g) || []).length, 1);

/* Escaping: το `<` δεν επιτρέπεται να βγει ωμό στη σελίδα. */
is('τα < > &  δραπετεύουν σωστά γύρω από τη σήμανση',
  unmark(box3.markAnchors('α <b> & "γ" δ', [{ unitId: 'u', pointIndex: 0, point: { anchor: '<b>', must: [] } }])),
  'α <b> & "γ" δ');
ok('…και το ωμό <b> δεν επιβίωσε',
  box3.markAnchors('α <b> δ', [{ unitId: 'u', pointIndex: 0, point: { anchor: '<b>', must: [] } }]).indexOf('<b>') < 0);

/* ══════════════════════════════════════════════════════════════════════ */
section('4 · ΣΤΑΘΕΡΗ ΑΡΧΗ 35 — Ο `load()` ΔΕΝ ΣΒΗΝΕΙ Ο,ΤΙ ΔΕΝ ΞΕΡΕΙ');

const store = {};
const box4 = ctx({
  KEY: 'ist:v1',
  localStorage: {
    getItem: k => (Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: k => { delete store[k]; }
  }
});
vm.runInContext(slice('blank'), box4);
vm.runInContext(slice('load'), box4);

ok('το `blank()` δηλώνει το `sessions` (σταθ. 35: ΚΑΙ εδώ ΚΑΙ στον load)',
  Array.isArray(box4.blank().sessions));

store['ist:v1'] = JSON.stringify({
  v: 1, units: { a: { runs: 2 } }, plag: { p1: { id: 'p1' } },
  sessions: [{ id: 's1', ts: 1, ms: 2, unit: 'a', mode: 'recall', asked: 3, right: 3, pass: 1, fin: 1 }],
  ΑΓΝΩΣΤΟ_ΠΕΔΙΟ: { από: 'άλλη συσκευή' }
});
const loaded = box4.load();
is('ένα ΑΓΝΩΣΤΟ πεδίο επιβιώνει της φόρτωσης', loaded['ΑΓΝΩΣΤΟ_ΠΕΔΙΟ'], { από: 'άλλη συσκευή' });
is('το `sessions` επιβιώνει', loaded.sessions.length, 1);
is('…και τα γνωστά πεδία κανονικοποιούνται', loaded.units.a.runs, 2);

store['ist:v1'] = JSON.stringify({ v: 1, sessions: 'σκουπίδια' });
is('`sessions` λάθος τύπου → άδειος πίνακας, ποτέ σκάσιμο', box4.load().sessions, []);

/* ══════════════════════════════════════════════════════════════════════ */
section('5 · ΤΟ ΣΥΜΒΟΛΑΙΟ — `sessions` (XREOS_V2 §2)');

function runSession(opts) {
  const b = ctx({ heardFinal: opts.heard || '', heardTmp: '' });
  b.sess = {
    pts: opts.pts,
    marks: opts.pts.map(() => (opts.tapped ? 1 : 0)),
    graded: opts.graded || null,
    t0: Date.now() - (opts.ms || 5000),
    logged: false
  };
  vm.runInContext(slice('sessTouched'), b);
  vm.runInContext(slice('logSession'), b);
  b.logSession(opts.fin ? 1 : 0);
  return b.state.sessions;
}

const realPts = I.pointsOf(plag);
const gradedPass = { total: I.elCount(realPts), said: I.elCount(realPts), cov: 1 };
const S1 = runSession({ pts: realPts, heard: 'κάτι είπε', graded: gradedPass, fin: 1, ms: 84000 });

is('μια τελειωμένη ανάκληση γράφει ΜΙΑ συνεδρία', S1.length, 1);
is('τα πεδία του συμβολαίου είναι όλα εκεί',
  Object.keys(S1[0]).sort(), ['asked', 'fin', 'id', 'ms', 'mode', 'pass', 'right', 'ts', 'unit'].sort());
is('mode = recall', S1[0].mode, 'recall');
is('fin = 1 σε τελειωμένη', S1[0].fin, 1);
is('pass = 1 όταν cov ≥ I.PASS', S1[0].pass, 1);
is('unit = η ΜΙΑ ενότητα που άγγιξε', S1[0].unit, bigUnit.id);
ok('ms μετρημένο, όχι μηδέν', S1[0].ms >= 80000 && S1[0].ms < 200000);
ok('το id είναι μοναδικό ανά συνεδρία',
  runSession({ pts: realPts, heard: 'x', graded: gradedPass, fin: 1 })[0].id !== S1[0].id);

const gradedFail = { total: I.elCount(realPts), said: 1, cov: 0.2 };
is('pass = 0 όταν cov < I.PASS',
  runSession({ pts: realPts, heard: 'μία λέξη', graded: gradedFail, fin: 1 })[0].pass, 0);

/* ⭐ Η ΕΓΚΑΤΑΛΕΙΨΗ. Το `fin:0` δεν το γράφει καμία άλλη σελίδα. */
const S2 = runSession({ pts: realPts, heard: 'πρόλαβα να πω κάτι', fin: 0 });
is('παρατημένη ανάκληση καταγράφεται', S2.length, 1);
is('…με fin = 0', S2[0].fin, 0);
is('…και pass = 0', S2[0].pass, 0);
is('…και `asked` = τα στοιχεία που είχε μπροστά του', S2[0].asked, I.elCount(realPts));

/* Ένα άνοιγμα χωρίς λέξη και χωρίς πάτημα είναι παραπάτημα, όχι εγκατάλειψη. */
is('άνοιγμα χωρίς τίποτα → ΚΑΜΙΑ συνεδρία', runSession({ pts: realPts, heard: '', fin: 0 }).length, 0);
is('πάτημα κενού μετράει ως άγγιγμα', runSession({ pts: realPts, heard: '', tapped: true, fin: 0 }).length, 1);

/* Πλαγιότιτλος πάνω σε ΔΥΟ ενότητες → το `unit` είναι '' (τίμιο), ποτέ η πρώτη. */
const twoUnits = I.UNITS.filter(x => (x.text || []).length).slice(0, 2);
if (twoUnits.length === 2) {
  const mixed = I.pointsOf({ picks: [{ u: twoUnits[0].id, p: 0 }, { u: twoUnits[1].id, p: 0 }], drop: [] });
  const S3 = runSession({ pts: mixed, heard: 'μεικτή', graded: gradedPass, fin: 1 });
  is('μεικτή απαγγελία → unit = "" και όχι η πρώτη ενότητα', S3[0].unit, '');
}

/* Διπλή κλήση δεν διπλογράφει (ο ίδιος φρουρός με το `sess.summed`). */
const bDouble = ctx({ heardFinal: 'ναι', heardTmp: '' });
bDouble.sess = { pts: realPts, marks: realPts.map(() => 0), graded: gradedPass, t0: Date.now() - 9000, logged: false };
vm.runInContext(slice('sessTouched'), bDouble);
vm.runInContext(slice('logSession'), bDouble);
bDouble.logSession(1); bDouble.logSession(1); bDouble.logSession(0);
is('τρεις κλήσεις → ΜΙΑ συνεδρία', bDouble.state.sessions.length, 1);

/* ══════════════════════════════════════════════════════════════════════ */
section('6 · Η ΔΗΛΩΣΗ ΔΕΝ ΓΙΝΕΤΑΙ ΜΕΤΡΗΣΗ (ΝΟΜΟΣ 3)');

const src = PAGE;
ok('το «Το ξέρω απέξω» υπάρχει στο ΤΩΡΑ, όχι μόνο στη λεπτομέρεια',
  /id="ipClaimNow"/.test(src) && /paintClaim\('ipClaimNow'/.test(src));

const doClaimSrc = slice('doClaim');
ok('⛔ η δήλωση ΔΕΝ αγγίζει `reviews`', !/\breviews\s*=/.test(doClaimSrc));
ok('⛔ η δήλωση ΔΕΝ αγγίζει `best`', !/\bbest\s*=/.test(doClaimSrc));
ok('⛔ η δήλωση ΔΕΝ αγγίζει `runs`', !/\bruns\s*=/.test(doClaimSrc));
ok('η δήλωση παρκάρει το `due` κατά CLAIM_DAYS', /due\s*=\s*Date\.now\(\)\s*\+\s*CLAIM_DAYS/.test(doClaimSrc));
ok('μια μετρημένη ανάκληση φρουρεί τη δήλωση (`rec.runs` → άρνηση)', /if\s*\(rec\.runs\)/.test(doClaimSrc));

const claimedOnlySrc = slice('claimedOnly');
ok('δηλωμένο = claimed ΚΑΙ καμία μέτρηση — μια αληθινή ανάκληση το σβήνει',
  /!!s\.claimed\s*&&\s*!s\.runs/.test(claimedOnlySrc));
ok('η δηλωμένη κατάσταση λέει ΠΟΤΕ ξαναγυρίζει', /Σε ξαναρωτάω '\s*\+\s*esc\(inDays\(rec\.due\)\)/.test(slice('claimInner')));

/* ══════════════════════════════════════════════════════════════════════ */
section('7 · Ο ΝΟΜΟΣ 1 ΕΙΝΑΙ ΚΑΛΩΔΙΩΜΕΝΟΣ');

ok('το υλικό ζωγραφίζεται σε ΚΑΘΕ render της αρχικής',
  /renderNow\(\);\s*renderStudy\(\);/.test(src));
ok('το υλικό ζει ΜΕΣΑ στο <main>, όχι σε overlay',
  src.indexOf('id="ipStudy"') > src.indexOf('<main class="ip-main">') &&
  src.indexOf('id="ipStudy"') < src.indexOf('</main>'));
ok('⛔ καμία στρώση δεν είναι διπλωμένη ΚΛΕΙΣΤΗ by default',
  !/<details class="sd-more"(?!\s+open)/.test(src));
ok('το «Πες το» υπάρχει και στο τέλος του υλικού',
  (src.match(/>Πες το<\/button>/g) || []).length >= 2);
ok('η καλωδίωση του ανάμματος γίνεται ΜΙΑ φορά, στο boot', /\n\s*wireStudy\(\);/.test(src));

/* ⛔⛔ ΤΑ ΤΡΙΑ ΕΠΙΠΕΔΑ ΑΛΗΘΕΙΑΣ. Βρέθηκε ΜΟΝΟ με ρέντερ: η πρώτη γραφή έδειχνε
   τα «με απλά λόγια» και το αυτολεξεί κείμενο ΧΩΡΙΣ ετικέτα, το ένα κάτω από
   το άλλο — δικά ΜΟΥ λόγια με την εμφάνιση των λογίων του βιβλίου. Είναι ο
   κανόνας που γέννησε τη σελίδα (als-v451) και καμία βεβαίωση δεν τον βλέπει,
   οπότε κλειδώνεται εδώ ΣΤΑΤΙΚΑ. */
const studySrc = slice('renderStudy');
ok('τα «με απλά λόγια» δηλώνονται ΩΣ ΔΙΚΑ ΜΟΥ ΛΟΓΙΑ',
  /layer\('01', *'Με απλά λόγια', *'δικά μου λόγια'/.test(studySrc));
ok('το κείμενο δηλώνεται ΩΣ ΑΥΤΟΛΕΞΕΙ ΤΟΥ ΒΙΒΛΙΟΥ',
  /layer\('02', *'Το κείμενο', *'αυτολεξεί από το βιβλίο'/.test(studySrc));
ok('το υλικό κουβαλάει την πηγή του βιβλίου', /Θέματα Νεοελληνικής Ιστορίας/.test(studySrc));
ok('το ΕΚΤΟΣ ΥΛΗΣ μένει σημασμένο ως εκτός ύλης',
  /Πλαίσιο · ΕΚΤΟΣ ύλης/.test(slice('wordsOf')));
ok('τα δικά μου λόγια στο λεξιλόγιο μένουν σημασμένα',
  /Λεξιλόγιο · δικά μου λόγια/.test(slice('wordsOf')));
ok('οι όροι του βιβλίου μένουν σημασμένοι ως του βιβλίου',
  /Όροι · λόγια του βιβλίου/.test(slice('wordsOf')));

/* ⚠️ Σταθερή αρχή 26: κανένα μονογράμματο class name μέσα σε ένθετο. */
const sdClasses = (src.match(/class="sd-[a-z-]+/g) || []).map(s => s.replace('class="', ''));
ok('όλα τα νέα class names είναι ονόματα, όχι γράμματα',
  sdClasses.length > 0 && sdClasses.every(c => c.length > 4));

/* ⚠️ Σταθερή αρχή 16: αυτή η σελίδα γράφει ΜΟΝΟ το δικό της store. */
const writes = (src.match(/localStorage\.setItem\(([^,)]*)/g) || []).map(s => s.split('(')[1].trim());
ok('γράφει μόνο μέσω του KEY της (κανένα ξένο store)',
  writes.every(w => w === 'KEY' || w === 'k' || /TOMB/.test(w)));

/* ══════════════════════════════════════════════════════════════════════ */
section('8 · ΤΟ ΜΑΘΗΜΑ ΣΕ ΤΡΕΙΣ ΖΩΝΕΣ (als-v477)');

/* ⛔⛔ Η ΓΡΑΜΜΗ ΠΟΥ ΑΝ ΦΥΓΕΙ, Η ΔΙΑΤΑΞΗ ΚΑΤΑΡΡΕΕΙ ΣΙΩΠΗΛΑ.
   Το `#ipLb` κουβαλάει `is-vwrap` = `max-width:660px`. Χωρίς την υπέρβαση, η
   νέα διάταξη ζει μέσα σε αυτό το κλουβί και η στήλη κειμένου μαζεύεται στα
   **48px** — μετρημένο, και ΚΑΝΕΝΑ assertion δεν το βλέπει, γιατί το markup
   είναι σωστό και μόνο η γεωμετρία είναι λάθος. */
ok('το κλουβί των 660px είναι σπασμένο ΜΟΝΟ για το μάθημα',
  /#ipLb\.is-vwrap\{\s*max-width:none/.test(src));
ok('…και οι αδελφές όψεις (συντάκτης/ανάκληση) ΜΕΝΟΥΝ στενές',
  !/#ipEb\.is-vwrap\{\s*max-width:none/.test(src) && !/#ipRb\.is-vwrap\{\s*max-width:none/.test(src));

ok('το κείμενο ΔΕΝ απλώνεται — μένει 640px, το σωστό μήκος γραμμής',
  /grid-template-columns:minmax\(0,640px\) minmax\(230px,300px\)/.test(src));
ok('οι τρεις ζώνες ανοίγουν στα ≥1180px', /@media \(min-width:1180px\)/.test(src));
ok('η ράχη είναι sticky, ΠΟΤΕ fixed (σταθ. 18)',
  /\.ls-rail\{[^}]*position:sticky/.test(src) && !/\.ls-rail\{[^}]*position:fixed/.test(src));
ok('⛔ κανένα overscroll-behavior:contain στη ράχη (σταθ. 22)',
  !/\.ls-rail\{[^}]*overscroll-behavior/.test(src));
ok('η ράχη χρησιμοποιεί 100dvh, όχι 100vh', /\.ls-rail\{[^}]*100dvh/.test(src));

const lesSrc = slice('openLesson');
ok('κάθε παράγραφος γίνεται ΖΩΝΗ με τα σημεία της δίπλα', /class="ls-band"/.test(lesSrc));
ok('⭐ το `detail` ΔΕΝ ξαναγράφεται στη λίστα σημείων — είναι ήδη αριστερά',
  !/x\.point\.detail/.test(lesSrc) && !/class="dt"/.test(lesSrc));
ok('οι γάντζοι βγαίνουν σε ΠΛΗΡΕΣ ΠΛΑΤΟΣ, δεν κρύβονται',
  /class="ls-hooks"/.test(lesSrc) && /\.ls-hooks\{[^}]*\}/.test(src) &&
  /grid-column:1 \/ -1/.test(src));
ok('η ράχη είναι πλοήγηση: πας στη ζώνη', /scrollIntoView/.test(lesSrc));
ok('ο πίνακας βγαίνει από τη στήλη κειμένου', /class="ls-full"/.test(lesSrc));
ok('οι λέξεις γίνονται πλέγμα στο laptop',
  /\.ls-defs\{[^}]*grid-template-columns:repeat\(3/.test(src));

/* ⭐⭐ Η ΣΕΛΙΔΑ ΒΑΦΕΙ ΜΕ ΤΑ ΔΙΚΑ ΤΟΥ ΛΑΘΗ — ΚΑΙ ΔΕΝ ΓΡΑΦΕΙ ΠΟΤΕ. */
const accSrc = slice('pointAcc');
ok('⛔ ο μετρητής αδυναμίας ΔΙΑΒΑΖΕΙ, δεν δημιουργεί εγγραφή (καμία κλήση `el(`)',
  !/\bel\(/.test(accSrc) && /state\.els\[/.test(accSrc));
ok('«δεν εξετάστηκε ποτέ» ΔΕΝ είναι μηδέν (σταθ. 33)',
  /tested:false, acc:null/.test(accSrc));

const box8 = ctx();
vm.runInContext(slice('pointAcc'), box8);
const pt = { must: [{ k: 'a' }, { k: 'b' }] };
is('χωρίς μετρήσεις → tested:false', box8.pointAcc('u', 0, pt), { tested: false, acc: null });
box8.state.els['u:0:0'] = { r: 1, w: 4 };
box8.state.els['u:0:1'] = { r: 0, w: 3 };
const w1 = box8.pointAcc('u', 0, pt);
ok('με μετρήσεις → tested:true και ακρίβεια κάτω του κατωφλιού', w1.tested && w1.acc < 0.7);
box8.state.els['u:0:0'] = { r: 9, w: 0 };
box8.state.els['u:0:1'] = { r: 9, w: 0 };
ok('καθαρή ιστορία → πάνω από το κατώφλι, δεν τραβάει το μάτι', box8.pointAcc('u', 0, pt).acc >= 0.7);
is('…και ο μετρητής ΔΕΝ δημιούργησε καμία νέα εγγραφή',
  Object.keys(box8.state.els).sort(), ['u:0:0', 'u:0:1']);

ok('⛔ η αδυναμία ΔΕΝ γίνεται τέταρτο χρώμα — λέγεται με κουκκίδα και φως',
  /\.ls-pt\.weak \.ls-pt-lb::before/.test(src) && !/--warn/.test(slice('openLesson')));

/* ⚠️ ΜΙΑ ΚΑΛΩΔΙΩΣΗ ΓΙΑ ΤΙΣ ΔΥΟ ΕΠΙΦΑΝΕΙΕΣ (σταθ. 15): το άναμμα δουλεύει
   ΚΑΙ στο «Το υλικό του» ΚΑΙ στο μάθημα, από τον ίδιο χειριστή. */
ok('το άναμμα καλωδιώνεται και στις δύο επιφάνειες',
  /\['ipStudy', 'ipLb'\]/.test(slice('wireStudy')));

/* ══════════════════════════════════════════════════════════════════════ */
console.log('\n' + (fail ? `✗ ${fail} FAILED, ${pass} passed` : `✓ ${pass} assertions passed`));
process.exit(fail ? 1 : 0);
