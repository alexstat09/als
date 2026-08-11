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

   ΧΡΗΣΗ
       var L = ALSLadders.read();          // ή read({ get: fn, now: ms })
       L.stores    → πέντε περιλήψεις, ΣΤΑΘΕΡΗ ΣΕΙΡΑ
       L.byKey     → { 'ist:v1': …, … }
       L.items     → κάθε γραμμή κάθε σκάλας, μία μορφή:
                     { store, page, unitId, label, due, accuracy, learned, samples }
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var has = Object.prototype.hasOwnProperty;

  /* Η σκάλα είναι ΜΙΑ και ίδια και στις πέντε: 0 / +3 / +10 / +30 / +90.
     Δεν την ΕΦΑΡΜΟΖΕΙ αυτό το αρχείο — την εφαρμόζει η σελίδα που κατέχει την
     αποθήκη. Είναι εδώ μόνο για να μπορεί να λέει ο καλών «σε πόσες μέρες». */
  var LADDER = [0, 3, 10, 30, 90];

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

  /* ── μία αποθήκη ──────────────────────────────────────────────────── */

  function readStore(def, get, now) {
    var out = {
      key: def.key, page: def.page, subject: def.subject, label: def.label,
      weight: def.weight, deep: def.deep,
      ok: true, why: '', started: false,
      items: [],
      right: 0, wrong: 0, samples: 0, accuracy: null,
      learned: 0, untouched: 0, overdue: 0, nextDue: null
    };

    var got = readRaw(get, def.key);
    if (!got.ok) { out.ok = false; out.why = got.why; return out; }
    var st = got.data;
    if (!st) return out;                       /* διαβάστηκε, δεν ξεκίνησε */
    out.started = true;

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
    var stores = [], byKey = {}, items = [], i;
    for (i = 0; i < STORES.length; i++) {
      var s = readStore(STORES[i], get, now);
      stores.push(s); byKey[s.key] = s;
      if (s.ok) items = items.concat(s.items);
    }
    return { stores: stores, byKey: byKey, items: items, now: now };
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
    read: read,
    daysLate: daysLate,
    /* εκτεθειμένα για τα tests: το σχήμα είναι το bug, άρα ελέγχεται χωριστά */
    _each: each,
    _readStore: readStore
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  if (typeof window !== 'undefined') window.ALSLadders = API;
})();
