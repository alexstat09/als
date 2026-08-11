/* ══════════════════════════════════════════════════════════════════════
   ladders.js — ΟΙ ΠΕΝΤΕ ΣΚΑΛΕΣ, ΔΙΑΒΑΣΜΕΝΕΣ ΜΙΑ ΦΟΡΑ

   ⭐⭐ ΓΙΑΤΙ ΥΠΑΡΧΕΙ. Οι πέντε αποθήκες μελέτης έχουν ΤΕΣΣΕΡΑ ΔΙΑΦΟΡΕΤΙΚΑ
   ΣΧΗΜΑΤΑ, μετρημένα στα ζωντανά αρχεία — όχι υποτιθέμενα:

     lat:v1  .cells   ΠΙΝΑΚΑΣ  [{id, r, w, box, due, ts}]      latinika.html:338
     ton:v1  .cells   ΧΑΡΤΗΣ   {cellId: {r, w, due, streak}}    tonos.html:419
     arx:v1  .pages   ΧΑΡΤΗΣ   {pageId: {learnedAt, due, …}}    arxaia.html:774
             .cells   ΧΑΡΤΗΣ   {vid:voice:tense: {r, w}}        arxaia.html:782
                      ⚠️ ήταν ΠΙΝΑΚΑΣ ως την als-v458 — και τα δύο ζωντανά
     ist:v1  .units   ΧΑΡΤΗΣ   {unitId: {learnedAt, due, …}}    istoria.html:467
             .els     ΧΑΡΤΗΣ   {unitId:pi:ei: {r, w}}           istoria.html:493
     arx:gn  .units   ΧΑΡΤΗΣ   ίδιο σχήμα με το ist:v1          arxaia.html:1519
             .els     ΧΑΡΤΗΣ   {unitId:j:k: {r, w}}             arxaia.html:1525

   Ένας αφελής «διάβασε τα πέντε ladders» (`store.cells.forEach`) επιστρέφει
   ΣΙΩΠΗΛΟ ΜΗΔΕΝ για τουλάχιστον δύο από τα πέντε: καμία εξαίρεση, καμία άδεια
   κατάσταση, απλώς μια σελίδα που δηλώνει με σιγουριά ότι δεν χρωστάει τίποτα.
   Είναι η σταθερή αρχή 10 με πέντε πρόσωπα.

   ⭐ ΓΙΑΤΙ ΕΝΑ ΑΡΧΕΙΟ ΚΑΙ ΟΧΙ ΕΝΑ ΑΝΤΙΓΡΑΦΟ. Το `home-live.js` είχε ΤΕΣΣΕΡΙΣ
   δικούς του αναγνώστες αυτών ακριβώς των αποθηκών. Ένα πέμπτο αντίγραφο στο
   `homework.html` είναι η σταθερή αρχή 15 (μια εγγύηση που ισχύει στον έναν
   δρόμο και όχι στον δίδυμό του δεν είναι εγγύηση, είναι σύμπτωση με καλή
   φήμη) — και ΘΑ αποκλίνει την πρώτη φορά που θα ξανααλλάξει σχήμα μια
   αποθήκη, πράγμα που έχει ΗΔΗ συμβεί μία φορά (arx:v1, als-v458).

   ⚠️ ΣΤΑΘΕΡΗ ΑΡΧΗ 25: ΔΕΝ ΚΑΝΕΙ require/ΔΕΝ ΔΙΑΒΑΖΕΙ ΤΙΠΟΤΑ. Ούτε DOM, ούτε
   corpora, ούτε άλλο module. Δύο αδέλφια (`home-live.js`, `homework.html`) το
   μοιράζονται, άρα δεν επιτρέπεται να εξαρτάται από κανένα τους. Ο αναγνώστης
   της αποθήκης δίνεται ΑΠ' ΕΞΩ (`opts.get`), γι' αυτό και δουλεύει αυτούσιο
   μέσα σε ένα `vm` του Node.

   ⚠️ ΣΤΑΘΕΡΗ ΑΡΧΗ 10: ΜΙΑ ΑΠΟΘΗΚΗ ΠΟΥ ΔΕΝ ΔΙΑΒΑΖΕΤΑΙ ΕΙΝΑΙ `ok:false`,
   ΠΟΤΕ ΜΗΔΕΝ. «Δεν μπόρεσα να διαβάσω τα Λατινικά» και «δεν χρωστάς Λατινικά»
   είναι δύο διαφορετικές προτάσεις και δεν επιτρέπεται να ζωγραφίζονται ίδια.

   ⚠️ ΣΤΑΘΕΡΗ ΑΡΧΗ 16: ΔΙΑΒΑΖΕΙ. ΔΕΝ ΓΡΑΦΕΙ. Δεν υπάρχει `setItem` σε αυτό το
   αρχείο και δεν πρόκειται να μπει: κάθε μία από τις πέντε αποθήκες ανήκει στη
   σελίδα της, και μια εγγραφή από εδώ είναι σιωπηλή απώλεια με καθυστέρηση.

   ⭐⭐ ΤΟ ΣΥΜΒΟΛΑΙΟ (als-v471). Ως εδώ αυτό το αρχείο διάβαζε ΜΟΝΟ `due`:
   πέντε timestamps, δηλαδή αρκετά για να ταξινομήσεις και ποτέ αρκετά για να
   καταλάβεις. Δεν μπορούσε να ξέρει ότι η ανάκληση κράτησε 18 λεπτά, ότι
   παρατήθηκε στη μέση, ότι τα Λατινικά πάνε καλά το πρωί και άσχημα στις
   23:00. Κάθε σελίδα μελέτης χρωστάει τώρα ένα `sessions` μέσα ΣΤΗ ΔΙΚΗ ΤΗΣ
   αποθήκη (καμία νέα, καμία αλλαγή σε `BUNDLES`/`BUNDLE`), και αυτό εδώ είναι
   ο μοναδικός αναγνώστης του. Το σχήμα ζει στο `docs/HOMEWORK_SPEC.md` και
   στο `ΤΟ ΧΡΕΟΣ V2` §2.1· επαναλαμβάνεται στο `cleanSession()` παρακάτω.

   ΧΡΗΣΗ
       var L = ALSLadders.read();          // ή read({ get: fn, now: ms })
       L.stores    → πέντε περιλήψεις, ΣΤΑΘΕΡΗ ΣΕΙΡΑ
       L.byKey     → { 'ist:v1': …, … }
       L.items     → κάθε γραμμή κάθε σκάλας, μία μορφή:
                     { store, page, unitId, label, due, accuracy, learned, samples }
       L.sessions  → ΚΑΘΕ συνεδρία ΚΑΘΕ αποθήκης, καθαρισμένη, ΑΥΞΟΥΣΑ κατά ts

   και ανά αποθήκη, τα παράγωγα που κανείς άλλος δεν μπορεί να βγάλει:
       .sessions        οι δικές της, αύξουσα
       .sessionsOk      false ΜΟΝΟ αν το πεδίο υπάρχει και έχει λάθος σχήμα
       .sessionsDropped πόσες εγγραφές απορρίφθηκαν (bug του γραφέα, ορατό)
       .typicalMs       { mode: ΔΙΑΜΕΣΟΣ ms | null }  ΜΟΝΟ ΤΕΛΕΙΩΜΕΝΕΣ, ≥3
       .typical         το ίδιο σε ΛΕΠΤΑ, στρογγυλεμένο
       .byHour          24 γραμμές ωμών μετρήσεων + διάμεσος όπου ≥3
       .abandoned       { of: πόσες κοιτάχτηκαν, count: πόσες παρατήθηκαν }
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var has = Object.prototype.hasOwnProperty;

  /* Η σκάλα είναι ΜΙΑ και ίδια και στις πέντε: 0 / +3 / +10 / +30 / +90.
     Δεν την ΕΦΑΡΜΟΖΕΙ αυτό το αρχείο — την εφαρμόζει η σελίδα που κατέχει την
     αποθήκη. Είναι εδώ μόνο για να μπορεί να λέει ο καλών «σε πόσες μέρες». */
  var LADDER = [0, 3, 10, 30, 90];

  /* Κάτω από τρία δείγματα δεν λέγεται «συνήθως». Δύο μετρήσεις είναι δύο
     μετρήσεις, όχι συνήθεια — και ένα «συνήθως 4′» βγαλμένο από μία φορά
     είναι επινοημένος αριθμός με ρούχα μέτρησης (σταθερή αρχή 33). */
  var MIN_SAMPLES = 3;
  /* «πόσες παρατήθηκαν τις ΤΕΛΕΥΤΑΙΕΣ 10». Το `abandoned` βγαίνει ΖΕΥΓΟΣ
     `{of, count}` κι όχι σκέτος αριθμός: με 7 συνεδρίες συνολικά, ένα «2»
     που διαβάζεται «2 στις 10» είναι ψέμα κατά 30%. */
  var ABANDON_WINDOW = 10;

  /* ── ΤΑ ΠΕΝΤΕ, ΔΗΛΩΜΕΝΑ ──────────────────────────────────────────────
     `kind` λέει ΠΟΥ ζει η σκάλα, γιατί αυτό ακριβώς διαφέρει:
       'units' → χάρτης εγγραφών με learnedAt/due + ξεχωριστός χάρτης
                 ακρίβειας (`acc`), με κλειδιά που ΑΡΧΙΖΟΥΝ από το unitId.
       'cells' → μία δομή που κουβαλάει ΚΑΙ τη σκάλα ΚΑΙ την ακρίβεια.
     `weight` = ο συντελεστής του μαθήματος στα μόριά του, ΔΙΚΟΣ ΤΟΥ αριθμός:
       Έκθεση 30 · Αρχαία 30 · Ιστορία 20 · Λατινικά 20. Ο Τονισμός δεν έχει
       δικό του συντελεστή γιατί δεν είναι δικό του μάθημα — δασείες και
       δίφθογγοι είναι ύλη των Αρχαίων, οπότε δανείζεται τον δικό τους. Ο
       αριθμός χρησιμοποιείται ΜΟΝΟ για ισοπαλία, ποτέ δεν βγαίνει στην οθόνη. */
  var STORES = [
    { key: 'ist:v1', page: 'istoria.html',  subject: 'istoria',  label: 'Ιστορία',
      kind: 'units', ladder: 'units', acc: 'els',   weight: 20, deep: 'recall' },
    { key: 'arx:gn', page: 'arxaia.html',   subject: 'arxaia',   label: 'Αρχαία · γνωστό',
      kind: 'units', ladder: 'units', acc: 'els',   weight: 30, deep: null },
    { key: 'arx:v1', page: 'arxaia.html',   subject: 'arxaia',   label: 'Αρχαία · αρχικοί χρόνοι',
      kind: 'units', ladder: 'pages', acc: 'cells', weight: 30, deep: null },
    { key: 'lat:v1', page: 'latinika.html', subject: 'latinika', label: 'Λατινικά',
      kind: 'cells', ladder: 'cells', acc: null,    weight: 20, deep: null },
    { key: 'ton:v1', page: 'tonos.html',    subject: 'arxaia',   label: 'Τονισμός',
      kind: 'cells', ladder: 'cells', acc: null,    weight: 30, deep: null }
  ];

  /* ── εργαλεία ─────────────────────────────────────────────────────── */

  function num(v) { var n = +v; return (typeof n === 'number' && isFinite(n)) ? n : 0; }
  function isObj(o) { return !!o && typeof o === 'object'; }
  function isMap(o) { return isObj(o) && !Array.isArray(o); }

  /* Ένας ΕΝΙΑΙΟΣ επαναλήπτης για ΠΙΝΑΚΑ και για ΧΑΡΤΗ. Αυτό ακριβώς είναι το
     σημείο όπου ένας αφελής αναγνώστης γυρίζει μηδέν: το `arx:v1.cells` ήταν
     πίνακας ως την als-v458 και είναι χάρτης από τότε, και ΚΑΙ ΤΑ ΔΥΟ
     σχήματα ζουν ακόμη σε συσκευές. `Object.keys` δουλεύει και στα δύο, αλλά
     για πίνακα δίνει δείκτες — άρα το `id` πρέπει να έρχεται από την εγγραφή
     όταν υπάρχει (`rec.id`), αλλιώς από το κλειδί. */
  function each(container, fn) {
    if (Array.isArray(container)) {
      for (var i = 0; i < container.length; i++) {
        var r = container[i];
        if (!isMap(r)) continue;
        fn(String(r.id != null ? r.id : i), r);
      }
      return;
    }
    if (!isMap(container)) return;
    for (var k in container) {
      if (!has.call(container, k)) continue;
      var v = container[k];
      if (!isMap(v)) continue;
      fn(String(v.id != null ? v.id : k), v);
    }
  }

  /* ⚠️ ΔΕΝ πιάνει το σφάλμα εδώ. Το Safari σε ιδιωτική περιήγηση ΠΕΤΑΕΙ στο
     `getItem`, και αυτό είναι ακριβώς το «δεν μπόρεσα να διαβάσω» που πρέπει
     να φτάσει έξω σαν `ok:false`. Ένα `catch` που γυρίζει κενό εδώ θα το
     μετέτρεπε σε «δεν χρωστάς τίποτα». */
  function defaultGet(k) { return localStorage.getItem(k); }

  /* Τρεις απαντήσεις, όχι δύο:
       {ok:true,  data:{…}}  διαβάστηκε
       {ok:true,  data:null} διαβάστηκε και είναι ΑΔΕΙΟ (δεν ξεκίνησε ποτέ)
       {ok:false}            ΔΕΝ διαβάστηκε (σπασμένο JSON, κλειδωμένος δίσκος)
     Το τρίτο δεν επιτρέπεται ποτέ να ζωγραφιστεί σαν το δεύτερο. */
  function readRaw(get, key) {
    var raw;
    try { raw = get(key); } catch (e) { return { ok: false, why: 'read' }; }
    if (raw === null || raw === undefined || raw === '') return { ok: true, data: null };
    var v;
    try { v = JSON.parse(raw); } catch (e) { return { ok: false, why: 'parse' }; }
    if (!isMap(v)) return { ok: false, why: 'shape' };
    return { ok: true, data: v };
  }

  /* ══════════════════════════════════════════════════════════════════
     ΟΙ ΣΥΝΕΔΡΙΕΣ — ΤΟ ΣΥΜΒΟΛΑΙΟ, ΑΠΟ ΤΗ ΜΕΡΙΑ ΤΟΥ ΑΝΑΓΝΩΣΤΗ

     Η εγγραφή, όπως τη γράφει η σελίδα που κατέχει την αποθήκη:

       { id,     μοναδικό, σταθερό
         ts,     ΕΝΑΡΞΗ σε ms
         ms,     ΔΙΑΡΚΕΙΑ — αυτό ακριβώς δεν μπορεί να υπολογίσει κανείς εδώ
         unit,   ποιο id ΤΗΣ ΣΚΑΛΑΣ της· '' όταν η συνεδρία ήταν μεικτή
         mode,   'recall' | 'drill' | 'lesson' — το λεξιλόγιο της σελίδας
         asked,  πόσα του μπήκαν μπροστά ΚΑΙ τα απάντησε
         right,  πόσα τα πήρε
         pass,   0|1 — το PASS ΤΗΣ ΔΙΚΗΣ ΤΗΣ σκάλας
         fin }   0|1 — ⭐ ΤΟ ΤΕΛΕΙΩΣΕ Ή ΤΟ ΠΑΡΑΤΗΣΕ

     ⚠️ ΤΟ `mergeArray` ΤΟΥ `sync.js` ΕΝΩΝΕΙ ΧΩΡΙΣ ΝΑ ΤΑΞΙΝΟΜΕΙ: γεμίζει έναν
     χάρτη με τα remote και μετά γράφει από πάνω τα local, οπότε η σειρά
     εξόδου είναι σειρά ΧΑΡΤΗ, όχι χρόνου. Άρα ταξινομούμε ΕΔΩ. Ένα «τις
     τελευταίες 10» πάνω σε ατακτοποίητο πίνακα είναι δέκα τυχαίες.

     ⚠️ ΚΑΝΕΝΑ `_ts`, ΚΑΙ ΕΙΝΑΙ ΑΣΦΑΛΕΣ ΕΞ ΟΡΙΣΜΟΥ: η σταθερή αρχή 31 αφορά
     εγγραφές που ΞΑΝΑΓΡΑΦΟΝΤΑΙ. Καμία συνεδρία δεν αλλάζει ποτέ αφού
     γραφτεί, άρα δεν υπάρχει σύγκρουση να λυθεί — μόνο ένωση κατά `id`.
     ══════════════════════════════════════════════════════════════════ */

  function byTs(a, b) { return a.ts - b.ts; }

  /* Μια εγγραφή περνάει ΜΟΝΟ αν κάθε αριθμός της είναι όντως αριθμός. Ένα
     `ms: undefined` που περνάει σαν 0 δεν είναι «μηδέν λεπτά» — είναι
     απουσία μέτρησης, και η διαφορά είναι όλη η σταθερή αρχή 33. */
  function cleanSession(rec, def, i) {
    if (!isMap(rec)) return null;
    var ts = +rec.ts, ms = +rec.ms, asked = +rec.asked, right = +rec.right;
    if (!isFinite(ts) || ts <= 0) return null;
    if (!isFinite(ms) || ms < 0) return null;
    if (!isFinite(asked) || asked < 0) return null;
    if (!isFinite(right) || right < 0) return null;
    return {
      id: String(rec.id != null ? rec.id : def.key + ':' + i),
      store: def.key, page: def.page, subject: def.subject,
      ts: ts, ms: ms,
      unit: rec.unit == null ? '' : String(rec.unit),
      mode: rec.mode == null ? '' : String(rec.mode),
      asked: asked, right: right,
      pass: rec.pass ? 1 : 0,
      fin: rec.fin ? 1 : 0
    };
  }

  /* ΔΙΑΜΕΣΟΣ, ποτέ μέσος όρος. Μία φορά που ξέχασε τη σελίδα ανοιχτή όλο το
     απόγευμα μετακινεί έναν μέσο όρο κατά ώρες και μια διάμεσο κατά μηδέν. */
  function median(a) {
    if (!a.length) return null;
    var s = a.slice().sort(function (x, y) { return x - y; });
    var m = s.length >> 1;
    return (s.length % 2) ? s[m] : (s[m - 1] + s[m]) / 2;
  }

  /* ⭐ ΜΟΝΟ ΟΙ ΤΕΛΕΙΩΜΕΝΕΣ ΜΕΤΡΑΝΕ ΓΙΑ ΤΟ «ΠΟΣΟ ΚΡΑΤΑΕΙ». Μια εγκατάλειψη
     στα 40 δευτερόλεπτα είναι αληθινό σήμα για το ΑΝ θα το κάνει, και ψέμα
     για το ΠΟΣΟ θέλει — και τα chips «έχω 20 λεπτά» φιλτράρουν πάνω σε αυτό
     ακριβώς το νούμερο. Τα modes όμως τα δίνουν ΟΛΕΣ, ώστε «δεν το έχει
     ξανακάνει» και «το έχει κάνει, δεν φτάνουν τα δείγματα» να είναι δύο
     διαφορετικές απαντήσεις: κλειδί απόν vs κλειδί με `null`. */
  function typicalOf(sess) {
    var by = {}, i, s, m;
    for (i = 0; i < sess.length; i++) {
      s = sess[i];
      if (!has.call(by, s.mode)) by[s.mode] = [];
      if (s.fin) by[s.mode].push(s.ms);
    }
    var ms = {}, mins = {};
    for (m in by) {
      if (!has.call(by, m)) continue;
      var v = by[m].length >= MIN_SAMPLES ? median(by[m]) : null;
      ms[m] = v;
      mins[m] = (v === null) ? null : Math.round(v / 60000);
    }
    return { ms: ms, min: mins };
  }

  /* Ωμές μετρήσεις ανά ΤΟΠΙΚΗ ώρα — «μετά τις 22:00» σημαίνει τη δική του
     ώρα, όχι UTC. Καμία κρίση εδώ: `n`/`done` βγαίνουν έξω ώστε ο καλών να
     μπορεί να αρνηθεί να πει κάτι πάνω σε ένα δείγμα. */
  function hourTable(sess) {
    var rows = [], durs = [], i;
    for (i = 0; i < 24; i++) { rows.push({ hour: i, n: 0, done: 0, asked: 0, right: 0, accuracy: null, ms: null }); durs.push([]); }
    for (i = 0; i < sess.length; i++) {
      var s = sess[i], h = new Date(s.ts).getHours();
      if (!(h >= 0 && h < 24)) continue;
      var r = rows[h];
      r.n++; r.asked += s.asked; r.right += s.right;
      if (s.fin) { r.done++; durs[h].push(s.ms); }
    }
    for (i = 0; i < 24; i++) {
      rows[i].accuracy = rows[i].asked ? rows[i].right / rows[i].asked : null;
      rows[i].ms = durs[i].length >= MIN_SAMPLES ? median(durs[i]) : null;
    }
    return rows;
  }

  function abandonedIn(sess) {
    var take = sess.slice(-ABANDON_WINDOW), c = 0, i;
    for (i = 0; i < take.length; i++) if (!take[i].fin) c++;
    return { of: take.length, count: c };
  }

  /* ── μία αποθήκη ──────────────────────────────────────────────────── */

  function readStore(def, get, now) {
    var out = {
      key: def.key, page: def.page, subject: def.subject, label: def.label,
      weight: def.weight, deep: def.deep,
      ok: true, why: '', started: false,
      items: [],
      right: 0, wrong: 0, samples: 0, accuracy: null,
      learned: 0, untouched: 0, overdue: 0, nextDue: null,
      /* ΤΟ ΣΥΜΒΟΛΑΙΟ. Όλα `null` όσο δεν έχει μετρηθεί τίποτα — ποτέ 0. */
      sessions: [], sessionsOk: true, sessionsDropped: 0,
      typical: null, typicalMs: null, byHour: null, abandoned: null
    };

    var got = readRaw(get, def.key);
    if (!got.ok) { out.ok = false; out.why = got.why; return out; }
    var st = got.data;
    if (!st) return out;                       /* διαβάστηκε, δεν ξεκίνησε */
    out.started = true;

    /* ── ΟΙ ΣΥΝΕΔΡΙΕΣ ──
       Τρεις καταστάσεις, τρεις απαντήσεις:
         απόν πεδίο  → η σελίδα δεν αναφέρει ΑΚΟΜΗ (κενό, `sessionsOk:true`)
         λάθος σχήμα → `sessionsOk:false` — δεν είναι «δεν έκανε τίποτα»
         πίνακας     → καθαρίζεται, ταξινομείται, και μετριέται */
    var rawSess = st.sessions;
    if (rawSess !== undefined && rawSess !== null) {
      if (!Array.isArray(rawSess)) {
        out.sessionsOk = false;
      } else {
        for (var si = 0; si < rawSess.length; si++) {
          var cs = cleanSession(rawSess[si], def, si);
          if (cs) out.sessions.push(cs); else out.sessionsDropped++;
        }
        out.sessions.sort(byTs);
        if (out.sessions.length) {
          var tp = typicalOf(out.sessions);
          out.typicalMs = tp.ms;
          out.typical = tp.min;
          out.byHour = hourTable(out.sessions);
          out.abandoned = abandonedIn(out.sessions);
        }
      }
    }

    /* ── η ΑΚΡΙΒΕΙΑ ──
       Για τα 'units' ζει σε ξεχωριστό χάρτη με κλειδιά `unitId:…`, οπότε
       μαζεύεται ΑΝΑ ΕΝΟΤΗΤΑ με πρόθεμα. Για τα 'cells' ζει μέσα στην ίδια
       την εγγραφή της σκάλας. */
    var accByUnit = {};
    if (def.acc) {
      each(st[def.acc], function (k, rec) {
        var r = num(rec.r), w = num(rec.w);
        out.right += r; out.wrong += w;
        /* ⚠️ Το `arx:v1.cells` έχει κλειδιά `vid:voice:tense` — ΡΗΜΑΤΑ, όχι
           σελίδες — άρα ΔΕΝ αντιστοιχούν στα ids της σκάλας του (`pages`).
           Δεν το μαντεύουμε: η ακρίβεια εκεί μένει `null` ανά γραμμή και
           υπάρχει μόνο συνολικά. Η σταθερή αρχή 10 ισχύει και για ένα
           ποσοστό: ένα μηδέν που σημαίνει «δεν ξέρω» είναι ψέμα. */
        var uid = String(k).split(':')[0];
        if (!accByUnit[uid]) accByUnit[uid] = { r: 0, w: 0 };
        accByUnit[uid].r += r; accByUnit[uid].w += w;
      });
    }

    /* ── η ΣΚΑΛΑ ── */
    var ladder = st[def.ladder];
    each(ladder, function (id, rec) {
      var due = num(rec.due) || null;
      var samples, right, wrong, learned;

      if (def.kind === 'cells') {
        right = num(rec.r); wrong = num(rec.w); samples = right + wrong;
        out.right += right; out.wrong += wrong;
        learned = samples > 0;
        /* Η σκάλα των κελιών: `box` (Λατινικά) ή `streak` (Τονισμός). Μηδέν
           σημαίνει «έπεσε στο σκαλί 0», δηλαδή το έχει μόλις χάσει. */
        var rung = ('box' in rec) ? num(rec.box) : ('streak' in rec) ? num(rec.streak) : 0;
        out.items.push({
          store: def.key, page: def.page, subject: def.subject, unitId: id,
          label: id, due: due, accuracy: samples ? right / samples : null,
          learned: learned, samples: samples, rung: rung, weight: def.weight
        });
      } else {
        var a = accByUnit[id] || null;
        right = a ? a.r : 0; wrong = a ? a.w : 0; samples = right + wrong;
        learned = !!num(rec.learnedAt);
        out.items.push({
          store: def.key, page: def.page, subject: def.subject, unitId: id,
          label: id, due: due, accuracy: a && samples ? right / samples : null,
          learned: learned, samples: samples, rung: num(rec.reviews), weight: def.weight
        });
      }

      /* ⚠️ ΤΟ ΧΡΕΟΣ ΜΕΤΡΙΕΤΑΙ ΟΠΩΣ ΤΟ ΜΕΤΡΑΕΙ Η ΣΕΛΙΔΑ ΠΟΥ ΤΟ ΚΑΤΕΧΕΙ
         (σταθερή αρχή 23). Και οι δύο σελίδες κελιών προσπερνούν τα άθικτα
         κελιά ΠΡΙΝ κοιτάξουν το `due` (`if (!t) continue;`, tonos.html:669 ·
         latinika.html:867), και τα `units` έχουν `due` μόνο αφού μαθευτούν.
         Άρα: άθικτο ≠ ληξιπρόθεσμο. Είναι δύο διαφορετικές προτάσεις και
         βγαίνουν σε δύο διαφορετικούς μετρητές. */
      var touched = (def.kind === 'cells') ? samples > 0 : learned;
      if (!touched) { out.untouched++; return; }
      out.learned++;
      if (due && now >= due) out.overdue++;
      else if (due && (out.nextDue === null || due < out.nextDue)) out.nextDue = due;
    });

    out.samples = out.right + out.wrong;
    out.accuracy = out.samples ? out.right / out.samples : null;
    return out;
  }

  /* ── δημόσιο ──────────────────────────────────────────────────────── */

  function read(opts) {
    opts = opts || {};
    var get = (typeof opts.get === 'function') ? opts.get : defaultGet;
    var now = (typeof opts.now === 'number') ? opts.now : Date.now();
    var stores = [], byKey = {}, items = [], sessions = [], i;
    for (i = 0; i < STORES.length; i++) {
      var s = readStore(STORES[i], get, now);
      stores.push(s); byKey[s.key] = s;
      if (s.ok) { items = items.concat(s.items); sessions = sessions.concat(s.sessions); }
    }
    sessions.sort(byTs);
    return { stores: stores, byKey: byKey, items: items, sessions: sessions, now: now };
  }

  /* Πόσο ληξιπρόθεσμο, σε ΗΜΕΡΟΛΟΓΙΑΚΕΣ μέρες — ποτέ σε ώρες που πέρασαν.
     Το ίδιο λάθος διορθώθηκε ήδη στο `home-live.js` (`relDay`): συγκρίνοντας
     ένα μεσάνυχτο με ένα `new Date()` που κουβαλάει ώρα, κάθε απόγευμα
     στρογγύλευε προς τα πάνω κατά μία μέρα. */
  function daysLate(due, now) {
    if (!due) return 0;
    var a = new Date(due); a.setHours(0, 0, 0, 0);
    var b = new Date(typeof now === 'number' ? now : Date.now()); b.setHours(0, 0, 0, 0);
    return Math.round((b - a) / 86400000);
  }

  var API = {
    STORES: STORES,
    LADDER: LADDER,
    MIN_SAMPLES: MIN_SAMPLES,
    ABANDON_WINDOW: ABANDON_WINDOW,
    read: read,
    daysLate: daysLate,
    /* εκτεθειμένα για τα tests: το σχήμα είναι το bug, άρα ελέγχεται χωριστά */
    _each: each,
    _readStore: readStore,
    _median: median,
    _cleanSession: cleanSession
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  if (typeof window !== 'undefined') window.ALSLadders = API;
})();
