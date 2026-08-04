/* tonos-engine.js — ο τονισμός των Αρχαίων, ως κανόνες.
 *
 * ⚠️ ΓΙΑΤΙ ΑΥΤΟ ΤΟ ΑΡΧΕΙΟ ΕΙΝΑΙ ΧΩΡΙΣ DOM
 * Ίδιος λόγος με το latin-engine.js: μια γεννήτρια που βγάζει λάθος τύπο
 * διδάσκει λάθος τύπο με απόλυτη σιγουριά. Το tests/tonos-engine.test.js
 * κρατάει ΣΤΟ ΧΕΡΙ τη σωστή μορφή κάθε λέξης του corpus, και η μηχανή
 * πρέπει να την αναπαράγει. Ποτέ μη φτιάξεις τις προσδοκίες από τη μηχανή.
 *
 * ⭐ Η ΘΕΜΕΛΙΩΔΗΣ ΙΔΕΑ
 * Το corpus ΔΕΝ αποθηκεύει «πού πέφτει ο τόνος». Αποθηκεύει την ΤΟΝΙΣΜΕΝΗ
 * λέξη (γραμμένη στο χέρι) + τις ποσότητες μόνο των ΔΙΧΡΟΝΩΝ (α, ι, υ), που
 * είναι το μόνο που δεν βγαίνει από κανόνα. Όλα τα υπόλοιπα — συλλαβισμός,
 * θέση τόνου, είδος τόνου, πνεύμα, ονομασία — τα ΔΙΑΒΑΖΕΙ η μηχανή από τη
 * λέξη και μετά τα ΕΛΕΓΧΕΙ απέναντι στους νόμους. Αν μια δήλωση ποσότητας
 * είναι λάθος, ή αν έγραψα λάθος τόνο, το verify() το βρίσκει.
 */
(function (global) {
  'use strict';

  /* ── 1 · τα συνδυαστικά σημάδια (NFD) ─────────────────────────────
     Δουλεύουμε πάντα αποσυντεθειμένα: ἄ = α + ψιλή + οξεία. Έτσι ένα
     σημάδι μπορεί να μπει, να βγει ή να μετακινηθεί χωρίς πίνακα 300
     προσυντεθειμένων χαρακτήρων. */
  var PSILI = '̓', DASIA = '̔';
  var OXIA = '́', VARIA = '̀', PERISP = '͂';
  var DIAL = '̈', YPO = 'ͅ';

  var VOWELS = 'αεηιουωΑΕΗΙΟΥΩ';
  /* Οι κύριοι δίφθογγοι. ωυ είναι σπάνιος αλλά υπαρκτός. */
  var DIPH = { 'αι':1, 'ει':1, 'οι':1, 'υι':1, 'αυ':1, 'ευ':1, 'ου':1, 'ηυ':1, 'ωυ':1 };

  function isVowel(ch) { return VOWELS.indexOf(ch) >= 0; }
  function low(ch) { return ch.toLowerCase(); }

  /* ── 2 · parse / emit ─────────────────────────────────────────────
     parse() → πίνακας από tokens. Κάθε φωνήεν κρατάει το δικό του σετ
     σημαδιών. emit() τα ξαναγράφει σε ΚΑΝΟΝΙΚΗ σειρά (πνεύμα → τόνος →
     υπογεγραμμένη) και επιστρέφει NFC, γιατί αυτό βλέπει ο χρήστης. */
  function parse(word) {
    var s = String(word).normalize('NFD'), out = [], i;
    for (i = 0; i < s.length; i++) {
      var ch = s[i];
      if (isVowel(ch)) {
        var t = { ch: ch, v: true, br: '', ac: '', di: '', yp: '' };
        while (i + 1 < s.length) {
          var m = s[i + 1];
          if (m === PSILI || m === DASIA) { t.br = m; i++; }
          else if (m === OXIA || m === VARIA || m === PERISP) { t.ac = m; i++; }
          else if (m === DIAL) { t.di = m; i++; }
          else if (m === YPO) { t.yp = m; i++; }
          else break;
        }
        out.push(t);
      } else {
        var c = { ch: ch, v: false, br: '', ac: '', di: '', yp: '' };
        /* το ρ παίρνει δασεία, οπότε κι αυτό κουβαλάει πνεύμα */
        while (i + 1 < s.length && (s[i + 1] === PSILI || s[i + 1] === DASIA)) { c.br = s[i + 1]; i++; }
        out.push(c);
      }
    }
    return out;
  }

  function emit(toks) {
    var s = '', i;
    for (i = 0; i < toks.length; i++) {
      var t = toks[i];
      s += t.ch + (t.br || '') + (t.di || '') + (t.ac || '') + (t.yp || '');
    }
    return s.normalize('NFC');
  }

  /* ── 3 · συλλαβισμός (φωνηεντικοί πυρήνες) ────────────────────────
     Δεν χρειαζόμαστε πλήρη συλλαβισμό — μόνο τους πυρήνες, γιατί ο τόνος
     και η ποσότητα ζουν εκεί. Δύο γειτονικά φωνήεντα ενώνονται σε δίφθογγο
     μόνο αν σχηματίζουν έναν από τους 9, ΚΑΙ το δεύτερο δεν έχει διαλυτικά
     (ἀΐδιος: τα διαλυτικά είναι ακριβώς η δήλωση «δεν είμαστε δίφθογγος»). */
  function nuclei(toks) {
    var out = [], i;
    for (i = 0; i < toks.length; i++) {
      if (!toks[i].v) continue;
      var pair = null;
      if (i + 1 < toks.length && toks[i + 1].v && !toks[i + 1].di && !toks[i].yp) {
        var d = low(toks[i].ch) + low(toks[i + 1].ch);
        if (DIPH[d]) pair = d;
      }
      if (pair) { out.push({ idx: [i, i + 1], v: pair, diph: true }); i++; }
      else { out.push({ idx: [i], v: low(toks[i].ch), diph: false, ypo: !!toks[i].yp }); }
    }
    return out;
  }

  /* ── 4 · analyze ──────────────────────────────────────────────────
     Τι ΕΙΝΑΙ γραμμένο πάνω στη λέξη. Καμία κρίση εδώ — μόνο ανάγνωση. */
  function analyze(word) {
    var toks = parse(word), nuc = nuclei(toks), i, j;
    var accIdx = 0, accType = null, breath = null, breathOn = -1;

    for (i = 0; i < nuc.length; i++) {
      for (j = 0; j < nuc[i].idx.length; j++) {
        var t = toks[nuc[i].idx[j]];
        if (t.ac) {
          accIdx = nuc.length - i;                       /* 1 = λήγουσα */
          accType = (t.ac === PERISP) ? 'π' : (t.ac === VARIA ? 'β' : 'ο');
        }
      }
    }
    /* το πνεύμα ζει πάντα στην ΑΡΧΗ της λέξης — στο πρώτο token, ή στο
       δεύτερο φωνήεν αν η αρχή είναι δίφθογγος */
    for (i = 0; i < toks.length; i++) {
      if (toks[i].br) { breath = (toks[i].br === DASIA) ? 'δ' : 'ψ'; breathOn = i; break; }
    }

    return {
      word: String(word).normalize('NFC'),
      toks: toks, nuc: nuc, n: nuc.length,
      accIdx: accIdx, accType: accType,
      breath: breath, breathOn: breathOn,
      needsBreath: toks.length > 0 && (toks[0].v || low(toks[0].ch) === 'ρ')
    };
  }

  /* ── 5 · ΠΟΣΟΤΗΤΑ ─────────────────────────────────────────────────
     Ο μόνος υπολογισμός που το corpus δεν μπορεί να κάνει μόνο του, γιατί
     τα δίχρονα δεν φαίνονται. Επιστρέφει 'μ' | 'β' | null (=άγνωστο).
       ε, ο            → βραχέα, πάντα
       η, ω, ᾳ ῃ ῳ     → μακρά, πάντα
       δίφθογγοι       → μακροί… ΕΚΤΟΣ τελικού -αι / -οι, που μετρούν
                         ΒΡΑΧΕΑ — εκτός ευκτικής (entry.opt) και του οἴκοι.
       α, ι, υ         → δίχρονα → από τη δήλωση του corpus */
  function quantity(entry, pos) {
    var a = entry._a || (entry._a = analyze(entry.w));
    var i = a.n - pos;
    if (i < 0 || i >= a.n) return null;
    var nu = a.nuc[i], v = nu.v, isFinal = (pos === 1);

    if (nu.diph) {
      if (isFinal && (v === 'αι' || v === 'οι') && !entry.opt) return 'β';
      return 'μ';
    }
    if (nu.ypo) return 'μ';
    if (v === 'ε' || v === 'ο') return 'β';
    if (v === 'η' || v === 'ω') return 'μ';
    /* δίχρονο */
    var q = entry.q || {};
    return q[pos] || null;
  }

  /* ── 6 · ΟΙ ΝΟΜΟΙ ─────────────────────────────────────────────────
     Τι ΕΠΙΤΡΕΠΕΤΑΙ, δοθέντων των ποσοτήτων. Επιστρέφει παραβιάσεις — άδειος
     πίνακας σημαίνει «η λέξη είναι νόμιμη». Το verify() στο test τρέχει
     αυτό πάνω σε ΟΛΟ το corpus: αν δήλωσα λάθος δίχρονο, σκάει εδώ. */
  function laws(entry) {
    var a = entry._a || (entry._a = analyze(entry.w));
    var bad = [];
    var ult = quantity(entry, 1), pen = quantity(entry, 2);
    var accQ = quantity(entry, a.accIdx);

    if (!a.accIdx) bad.push('άτονη λέξη');
    if (a.accIdx > 3) bad.push('νόμος τρισυλλαβίας: ο τόνος δεν πάει πάνω από την προπαραλήγουσα');
    if (a.accIdx === 3 && ult === 'μ') bad.push('νόμος της λήγουσας: μακρά λήγουσα δεν επιτρέπει τόνο στην προπαραλήγουσα');
    if (a.accIdx === 3 && a.accType === 'π') bad.push('περισπωμένη στην προπαραλήγουσα είναι αδύνατη');
    if (a.accType === 'π' && accQ === 'β') bad.push('περισπωμένη σε βραχύ φωνήεν είναι αδύνατη');
    if (a.accIdx === 2 && a.accType === 'ο' && pen === 'μ' && ult === 'β')
      bad.push('μακρή τονισμένη παραλήγουσα + βραχεία λήγουσα απαιτεί ΠΕΡΙΣΠΩΜΕΝΗ');
    if (a.accIdx === 2 && a.accType === 'π' && ult === 'μ')
      bad.push('μακρή λήγουσα δεν επιτρέπει περισπωμένη στην παραλήγουσα');
    if (a.needsBreath && !a.breath) bad.push('λείπει το πνεύμα');
    if (!a.needsBreath && a.breath) bad.push('πνεύμα σε λέξη που δεν αρχίζει από φωνήεν ή ρ');

    return bad;
  }

  /* Τι ΠΡΕΠΕΙ να είναι ο τόνος της παραλήγουσας. Μόνο για accIdx === 2 —
     στη λήγουσα αποφασίζει η μορφολογία (ψυχή vs τιμῶ), όχι κανόνας. */
  function forcedType(entry) {
    var a = entry._a || (entry._a = analyze(entry.w));
    if (a.accIdx !== 2) return null;
    var ult = quantity(entry, 1), pen = quantity(entry, 2);
    if (ult == null || pen == null) return null;
    return (pen === 'μ' && ult === 'β') ? 'π' : 'ο';
  }

  /* Πόσο πίσω ΕΠΙΤΡΕΠΕΤΑΙ να πάει ο τόνος (1 λήγ. / 2 παραλ. / 3 προπαραλ.) */
  function maxBack(entry) {
    var a = entry._a || (entry._a = analyze(entry.w));
    var ult = quantity(entry, 1);
    return Math.min(a.n, ult === 'μ' ? 2 : 3);
  }

  var NAMES = { '1ο': 'οξύτονη', '1π': 'περισπώμενη', '2ο': 'παροξύτονη', '2π': 'προπερισπώμενη', '3ο': 'προπαροξύτονη' };
  function nameOf(entry) {
    var a = entry._a || (entry._a = analyze(entry.w));
    return NAMES[a.accIdx + (a.accType || '')] || null;
  }

  /* ── 7 · restrike — γράψε τη λέξη ΑΛΛΙΩΣ ──────────────────────────
     Από αυτό βγαίνουν οι επιλογές. Οι λάθος απαντήσεις είναι πραγματικές
     γειτονικές μορφές της ΙΔΙΑΣ λέξης, όχι τυχαίες άλλες λέξεις — αλλιώς
     η αναγνώριση θα τον περνούσε χωρίς να ξέρει τον κανόνα. */
  function restrike(entry, opts) {
    var a = analyze(entry.w);
    var toks = a.toks.map(function (t) { return { ch: t.ch, v: t.v, br: t.br, ac: t.ac, di: t.di, yp: t.yp }; });
    var i;

    if (opts.idx != null || opts.type != null) for (i = 0; i < toks.length; i++) toks[i].ac = '';
    if (opts.breath != null) for (i = 0; i < toks.length; i++) toks[i].br = '';

    if (opts.idx != null) {
      var nu = a.nuc[a.n - opts.idx];
      if (!nu) return null;
      /* Ο τόνος και το πνεύμα πάνε στο ΔΕΥΤΕΡΟ φωνήεν του διφθόγγου.
         Το opts.first το σπάει επίτηδες, για να γίνει λάθος επιλογή. */
      var at = opts.first ? nu.idx[0] : nu.idx[nu.idx.length - 1];
      toks[at].ac = (opts.type === 'π') ? PERISP : OXIA;
    } else if (opts.type != null && a.accIdx) {
      var cur = a.nuc[a.n - a.accIdx];
      toks[cur.idx[cur.idx.length - 1]].ac = (opts.type === 'π') ? PERISP : OXIA;
    }

    if (opts.breath != null) {
      var f = a.nuc[0];
      if (a.toks[0] && !a.toks[0].v) toks[0].br = (opts.breath === 'δ') ? DASIA : PSILI;   /* ῥ */
      else if (f) {
        var bt = opts.breathFirst ? f.idx[0] : f.idx[f.idx.length - 1];
        toks[bt].br = (opts.breath === 'δ') ? DASIA : PSILI;
      }
    }
    return emit(toks);
  }

  function bare(entry) {
    var toks = parse(entry.w), i, s = '';
    for (i = 0; i < toks.length; i++) s += toks[i].ch + (toks[i].di || '') + (toks[i].yp || '');
    return s.normalize('NFC');
  }

  /* ── 8 · ΤΑ ΚΕΛΙΑ ─────────────────────────────────────────────────
     Η μαστορική μετριέται ΑΝΑ ΚΑΝΟΝΑ, όχι ανά λέξη — «δασεία ή ψιλή» δεν
     είναι γνώση για το ὕπνος, είναι γνώση που ταξιδεύει σε κάθε λέξη. */
  var CELLS = [
    { id: 'qty',    label: 'Η ποσότητα',            short: 'ΠΟΣΟΤΗΤΑ' },
    { id: 'final',  label: 'Τα τελικά -αι / -οι',   short: 'ΤΕΛΙΚΑ -ΑΙ/-ΟΙ' },
    { id: 'spirit', label: 'Δασεία ή ψιλή',         short: 'ΠΝΕΥΜΑ' },
    { id: 'spos',   label: 'Πού μπαίνει το σημάδι', short: 'ΘΕΣΗ ΣΗΜΑΔΙΟΥ' },
    { id: 'ultima', label: 'Ο νόμος της λήγουσας',  short: 'ΝΟΜΟΣ ΛΗΓΟΥΣΑΣ' },
    { id: 'penult', label: 'Οξεία ή περισπωμένη',   short: 'ΟΞΕΙΑ/ΠΕΡΙΣΠ.' },
    { id: 'name',   label: 'Η ονομασία',            short: 'ΟΝΟΜΑΣΙΑ' },
    { id: 'rule',   label: 'Οι κανόνες',            short: 'ΚΑΝΟΝΕΣ' },
    { id: 'full',   label: 'Ολόκληρη η λέξη',       short: 'ΟΛΗ Η ΛΕΞΗ' }
  ];
  function cellLabel(id) { for (var i = 0; i < CELLS.length; i++) if (CELLS[i].id === id) return CELLS[i].label; return id; }

  /* ── 9 · ΤΟ CORPUS ────────────────────────────────────────────────
     w  = η ΣΩΣΤΗ τονισμένη μορφή, γραμμένη στο χέρι
     g  = η σημασία
     q  = ποσότητα ΔΙΧΡΟΝΟΥ ανά θέση από το τέλος (1 = λήγουσα)
     d  = το παράγωγο που προδίδει το πνεύμα (ο κανόνας του «h»)
     opt= ευκτική → τα τελικά -αι/-οι ξαναγίνονται μακρά                */
  var WORDS = [
    { w: 'ἄνθρωπος', g: 'άνθρωπος', d: 'anthropology · χωρίς h' },
    { w: 'ἀνθρώπων', g: 'των ανθρώπων', d: 'anthropology · χωρίς h' },
    { w: 'ἀνθρώπου', g: 'του ανθρώπου', d: 'anthropology · χωρίς h' },
    { w: 'δῶρον', g: 'δώρο' },
    { w: 'δώρου', g: 'του δώρου' },
    { w: 'δῶρα', g: 'δώρα', q: { 1: 'β' } },
    { w: 'δώρων', g: 'των δώρων' },
    { w: 'νῆσος', g: 'νησί' },
    { w: 'νήσου', g: 'του νησιού' },
    { w: 'οἶκος', g: 'σπίτι', d: 'economy · χωρίς h' },
    { w: 'οἴκου', g: 'του σπιτιού', d: 'economy · χωρίς h' },
    { w: 'οἶκοι', g: 'σπίτια', d: 'economy · χωρίς h' },
    { w: 'ὕπνος', g: 'ύπνος', q: { 2: 'β' }, d: 'hypnosis · αρχικό υ ΠΑΝΤΑ δασεία' },
    { w: 'ὅπλα', g: 'όπλα', q: { 1: 'β' }, d: 'από τη λίστα-παγίδα: δασύνεται' },
    { w: 'ὅπλων', g: 'των όπλων', d: 'από τη λίστα-παγίδα: δασύνεται' },
    { w: 'ἡμέρα', g: 'μέρα', q: { 1: 'μ' }, d: 'ἐφ-ήμερος: το π γίνεται φ → δασεία' },
    { w: 'ἡμερῶν', g: 'των ημερών', d: 'ἐφ-ήμερος: το π γίνεται φ → δασεία' },
    { w: 'ὥρα', g: 'ώρα', q: { 1: 'μ' }, d: 'hour · με h' },
    { w: 'χώρα', g: 'χώρα', q: { 1: 'μ' } },
    { w: 'γλῶσσα', g: 'γλώσσα', q: { 1: 'β' } },
    { w: 'θάλασσα', g: 'θάλασσα', q: { 1: 'β', 2: 'β' } },
    { w: 'σῶμα', g: 'σώμα', q: { 1: 'β' } },
    { w: 'σώματα', g: 'σώματα', q: { 1: 'β', 2: 'β' } },
    { w: 'σωμάτων', g: 'των σωμάτων', q: { 2: 'β' } },
    { w: 'πολίτης', g: 'πολίτης', q: { 2: 'μ' } },
    { w: 'πολῖται', g: 'πολίτες', q: { 2: 'μ' } },
    { w: 'πολιτῶν', g: 'των πολιτών', q: { 2: 'μ' } },
    { w: 'ποιητής', g: 'ποιητής' },
    { w: 'ποιηταί', g: 'ποιητές' },
    { w: 'Ἀθηναῖος', g: 'Αθηναίος', d: 'Athens · χωρίς h' },
    { w: 'Ἀθηναῖοι', g: 'Αθηναίοι', d: 'Athens · χωρίς h' },
    { w: 'Ἕλλην', g: 'Έλληνας', d: 'Hellenic · με h' },
    { w: 'Ἕλληνες', g: 'Έλληνες', d: 'Hellenic · με h' },
    { w: 'Ἑλλήνων', g: 'των Ελλήνων', d: 'Hellenic · με h' },
    { w: 'ἵππος', g: 'άλογο', q: { 2: 'β' }, d: 'hippopotamus · με h' },
    { w: 'ἵπποι', g: 'άλογα', q: { 2: 'β' }, d: 'hippopotamus · με h' },
    { w: 'ἱερός', g: 'ιερός', d: 'hierarchy · με h' },
    { w: 'ἱστορία', g: 'ιστορία', q: { 1: 'μ', 2: 'β' }, d: 'history · με h' },
    { w: 'ὁδός', g: 'δρόμος', d: 'μέθ-οδος → method · με h' },
    { w: 'ὁδοῦ', g: 'του δρόμου', d: 'μέθ-οδος → method · με h' },
    { w: 'ὁδοί', g: 'δρόμοι', d: 'μέθ-οδος → method · με h' },
    { w: 'οὐρανός', g: 'ουρανός', q: { 2: 'β' }, d: 'Uranus · χωρίς h' },
    { w: 'αὐτός', g: 'αυτός', d: 'automatic · χωρίς h' },
    { w: 'εὑρίσκω', g: 'βρίσκω', q: { 2: 'μ' }, d: 'heuristic · με h' },
    { w: 'ἥλιος', g: 'ήλιος', q: { 2: 'β' }, d: 'helium · με h' },
    { w: 'ἔργον', g: 'έργο', d: 'energy · χωρίς h' },
    { w: 'ἔργα', g: 'έργα', q: { 1: 'β' }, d: 'energy · χωρίς h' },
    { w: 'ἔργων', g: 'των έργων', d: 'energy · χωρίς h' },
    { w: 'ὄνομα', g: 'όνομα', q: { 1: 'β' }, d: 'onomatopoeia · χωρίς h' },
    { w: 'ὀνόματα', g: 'ονόματα', q: { 1: 'β', 2: 'β' }, d: 'onomatopoeia · χωρίς h' },
    { w: 'ὀνομάτων', g: 'των ονομάτων', q: { 2: 'β' }, d: 'onomatopoeia · χωρίς h' },
    { w: 'ψυχή', g: 'ψυχή', q: { 2: 'β' } },
    { w: 'ψυχῆς', g: 'της ψυχής', q: { 2: 'β' } },
    { w: 'ψυχαί', g: 'ψυχές', q: { 2: 'β' } },
    { w: 'γῆ', g: 'γη' },
    { w: 'πῦρ', g: 'φωτιά', q: { 1: 'μ' } },
    { w: 'νοῦς', g: 'νους' },
    { w: 'παιδεύω', g: 'εκπαιδεύω' },
    { w: 'παιδεύεται', g: 'εκπαιδεύεται' },
    { w: 'παιδεύονται', g: 'εκπαιδεύονται' },
    { w: 'παιδεύοι', g: 'να εκπαίδευε (ευκτική)', opt: true },
    { w: 'τιμῶ', g: 'τιμώ', q: { 2: 'β' } },
    { w: 'φιλῶ', g: 'αγαπώ', q: { 2: 'β' } },
    { w: 'δαίμων', g: 'θεότητα' },
    { w: 'δαίμονες', g: 'θεότητες' },
    { w: 'δαιμόνων', g: 'των θεοτήτων' },
    { w: 'πρᾶγμα', g: 'πράγμα', q: { 1: 'β', 2: 'μ' } },
    { w: 'πράγματα', g: 'πράγματα', q: { 1: 'β', 2: 'β' } },
    { w: 'πραγμάτων', g: 'των πραγμάτων', q: { 2: 'β' } },
    { w: 'στρατιώτης', g: 'στρατιώτης' },
    { w: 'στρατιῶται', g: 'στρατιώτες' },
    { w: 'ἀγαθός', g: 'καλός', d: 'Agatha · χωρίς h' },
    { w: 'ἀγαθοῦ', g: 'του καλού', d: 'Agatha · χωρίς h' },
    { w: 'ἀληθής', g: 'αληθινός', d: 'χωρίς h' },
    { w: 'πατήρ', g: 'πατέρας' },
    { w: 'μήτηρ', g: 'μητέρα' },
    { w: 'ναῦς', g: 'πλοίο' },
    { w: 'οὗτος', g: 'αυτός', d: 'δεικτική αντωνυμία · δασύνεται' },
    { w: 'αὕτη', g: 'αυτή', d: 'δεικτική αντωνυμία · δασύνεται' },
    { w: 'τοῦτο', g: 'αυτό' },
    { w: 'ταῦτα', g: 'αυτά', q: { 1: 'β' } },
    { w: 'ὑπέρ', g: 'πάνω από', d: 'hyper · αρχικό υ ΠΑΝΤΑ δασεία' },
    { w: 'ὑπό', g: 'κάτω από', d: 'hypo · αρχικό υ ΠΑΝΤΑ δασεία' },
    { w: 'ὕδωρ', g: 'νερό', q: { 2: 'β' }, d: 'hydro · αρχικό υ ΠΑΝΤΑ δασεία' },
    { w: 'ὄρος', g: 'βουνό', d: 'oro-graphy · χωρίς h' },
    { w: 'ὅμοιος', g: 'όμοιος', d: 'homogeneous · με h' },
    { w: 'ἕκαστος', g: 'καθένας', q: { 2: 'β' }, d: 'από τη λίστα-παγίδα: δασύνεται' },
    { w: 'ἕτερος', g: 'ο άλλος', d: 'heterogeneous · με h' },
    { w: 'ἑπτά', g: 'επτά', q: { 1: 'β' }, d: 'heptagon · με h' },
    { w: 'ἕξ', g: 'έξι', d: 'hexagon · με h' },
    { w: 'ἵνα', g: 'για να', q: { 1: 'β', 2: 'β' }, d: 'από τη λίστα-παγίδα: δασύνεται' },
    { w: 'ἡγεμών', g: 'αρχηγός', d: 'hegemony · με h' },
    { w: 'αἷμα', g: 'αίμα', q: { 1: 'β' }, d: 'haemoglobin · με h' },
    { w: 'ῥήτωρ', g: 'ρήτορας', d: 'rhetoric · αρχικό ρ ΠΑΝΤΑ δασεία' },
    { w: 'ἀρχή', g: 'αρχή', d: 'architect · χωρίς h' },
    { w: 'ἐλευθερία', g: 'ελευθερία', q: { 1: 'μ', 2: 'β' }, d: 'Eleutheria · χωρίς h' },
    { w: 'ἔχω', g: 'έχω', d: 'χωρίς h · αλλά ο μέλλοντας ἕξω παίρνει δασεία!' }
  ];

  /* ── 10 · Σωστό / Λάθος πάνω στους ίδιους τους κανόνες ────────────
     Γραμμένα στο χέρι επίτηδες: δεν παράγονται από τη μηχανή, γιατί ο
     σκοπός τους είναι να ελέγξουν αν ξέρει τον ΚΑΝΟΝΑ, όχι μια λέξη. */
  var RULES = [
    { s: 'Η περισπωμένη μπορεί να μπει στην προπαραλήγουσα.', a: false, why: 'Ποτέ. Φτάνει το πολύ ως την παραλήγουσα.' },
    { s: 'Τα τελικά -αι και -οι μετρούν πάντα ως μακρά.', a: false, why: 'Στο τέλος της λέξης μετρούν ΒΡΑΧΕΑ — εκτός ευκτικής και του «οἴκοι».' },
    { s: 'Η βαρεία μπαίνει μόνο στη λήγουσα.', a: true, why: 'Και μόνο όταν ακολουθεί άλλη λέξη χωρίς σημείο στίξης.' },
    { s: 'Το ε και το ο είναι πάντα βραχέα.', a: true, why: 'Όπως το η και το ω είναι πάντα μακρά. Δίχρονα είναι μόνο τα α, ι, υ.' },
    { s: 'Αν η λήγουσα είναι μακρά, ο τόνος μπορεί να πάει στην προπαραλήγουσα.', a: false, why: 'Όχι: μακρή λήγουσα κρατάει τον τόνο το πολύ στην παραλήγουσα (ἄνθρωπος → ἀνθρώπων).' },
    { s: 'Η περισπωμένη μπορεί να μπει σε βραχύ φωνήεν.', a: false, why: 'Ποτέ. Θέλει η, ω, δίφθογγο ή μακρό δίχρονο.' },
    { s: 'Κάθε λέξη που αρχίζει από φωνήεν παίρνει υποχρεωτικά πνεύμα.', a: true, why: 'Ή ψιλή ή δασεία — ποτέ τίποτα.' },
    { s: 'Κάθε αρχικό υ- παίρνει δασεία.', a: true, why: 'Χωρίς καμία εξαίρεση: ὕπνος, ὕδωρ, ὑπέρ, ὑμεῖς.' },
    { s: 'Στον δίφθογγο, το πνεύμα μπαίνει στο πρώτο φωνήεν.', a: false, why: 'Στο ΔΕΥΤΕΡΟ: οἶκος, εὑρίσκω, αὐτός. Εξαίρεση οι καταχρηστικοί ᾳ ῃ ῳ.' },
    { s: 'Στα κεφαλαία, το πνεύμα μπαίνει πριν από το γράμμα.', a: true, why: 'Ἀθηναῖος, Ἕλλην — ποτέ πάνω στο κεφαλαίο.' },
    { s: 'Το τελικό -α στα ουδέτερα του πληθυντικού (δῶρα) είναι βραχύ.', a: true, why: 'Γι\' αυτό δῶρα με περισπωμένη, αλλά δώρων με οξεία.' },
    { s: 'Ο τόνος μπορεί να ανέβει πάνω από την προπαραλήγουσα σε μεγάλες λέξεις.', a: false, why: 'Νόμος της τρισυλλαβίας: ποτέ πάνω από την τρίτη από το τέλος.' },
    { s: 'Στην ευκτική, το τελικό -οι μετράει μακρό.', a: true, why: 'Γι\' αυτό παιδεύοι και όχι «παίδευοι».' },
    { s: 'Μακρή τονισμένη παραλήγουσα + βραχεία λήγουσα δίνει περισπωμένη.', a: true, why: 'δῶρον, νῆσος, γλῶσσα, οἶκος. Δεν το διαλέγεις — επιβάλλεται.' },
    { s: 'Το αρχικό ρ- παίρνει ψιλή.', a: false, why: 'Δασεία πάντα: ῥήτωρ, ῥόδον. Γι\' αυτό rhetoric με «rh».' }
  ];

  var LETTERS = [
    { c: 'ε', k: 'β' }, { c: 'ο', k: 'β' },
    { c: 'η', k: 'μ' }, { c: 'ω', k: 'μ' },
    { c: 'α', k: 'δ' }, { c: 'ι', k: 'δ' }, { c: 'υ', k: 'δ' }
  ];

  /* ── 11 · ΟΙ ΕΡΩΤΗΣΕΙΣ ────────────────────────────────────────────
     Κάθε γεννήτρια επιστρέφει null όταν η λέξη δεν κάνει γι' αυτήν. Αυτό
     είναι σκόπιμο: καλύτερα να μη ρωτήσεις, παρά να βαθμολογήσεις λάθος
     μια σωστή απάντηση (το μάθημα του uniqueForms() στα Λατινικά).      */
  function shuffled(arr, rnd) {
    var a = arr.slice(), i, j, t;
    for (i = a.length - 1; i > 0; i--) { j = Math.floor(rnd() * (i + 1)); t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function pack(opts, correct, rnd) {
    var uniq = [], i;
    for (i = 0; i < opts.length; i++) if (opts[i] != null && uniq.indexOf(opts[i]) < 0) uniq.push(opts[i]);
    if (uniq.indexOf(correct) < 0) return null;
    var s = shuffled(uniq, rnd);
    return { opts: s, ans: s.indexOf(correct) };
  }
  var POS = { 1: 'λήγουσα', 2: 'παραλήγουσα', 3: 'προπαραλήγουσα' };

  var GEN = {
    qty: function (e, rnd) {
      /* μισές φορές γράμμα, μισές συλλαβή μέσα σε λέξη */
      if (rnd() < 0.4) {
        var L = LETTERS[Math.floor(rnd() * LETTERS.length)];
        var names = { 'β': 'Βραχύ', 'μ': 'Μακρό', 'δ': 'Δίχρονο' };
        var p = pack(['Βραχύ', 'Μακρό', 'Δίχρονο'], names[L.k], rnd);
        return { cell: 'qty', tag: 'Η ΠΟΣΟΤΗΤΑ', word: L.c, plain: true,
          ask: 'Τι είναι αυτό το φωνήεν;', opts: p.opts, ans: p.ans,
          why: L.k === 'δ' ? 'Τα α, ι, υ είναι ΔΙΧΡΟΝΑ — άλλοτε μακρά, άλλοτε βραχέα.'
             : L.k === 'β' ? 'Το ε και το ο είναι πάντα βραχέα.'
                           : 'Το η και το ω είναι πάντα μακρά.' };
      }
      var a = analyze(e.w), pos = (a.n >= 2 && rnd() < 0.5) ? 2 : 1;
      var q = quantity(e, pos);
      if (!q) return null;
      var nu = a.nuc[a.n - pos];
      var p2 = pack(['Μακρά', 'Βραχεία'], q === 'μ' ? 'Μακρά' : 'Βραχεία', rnd);
      return { cell: 'qty', tag: 'Η ΠΟΣΟΤΗΤΑ', word: e.w,
        ask: 'Η <b>' + POS[pos] + '</b> (<b>' + nu.v + '</b>) είναι μακρά ή βραχεία;',
        opts: p2.opts, ans: p2.ans, plain: true,
        why: nu.diph ? (q === 'β'
              ? 'Δίφθογγος, αλλά ΤΕΛΙΚΟΣ -' + nu.v + ' → μετράει βραχύς.'
              : 'Οι δίφθογγοι είναι μακροί' + (pos === 1 ? '' : ' (και δεν είναι τελικός).'))
            : (nu.v === 'ε' || nu.v === 'ο') ? 'Το ' + nu.v + ' είναι πάντα βραχύ.'
            : (nu.v === 'η' || nu.v === 'ω') ? 'Το ' + nu.v + ' είναι πάντα μακρό.'
            : 'Το ' + nu.v + ' είναι δίχρονο — εδώ ' + (q === 'μ' ? 'μακρό' : 'βραχύ') + '. Το μαθαίνεις από τη λέξη.' };
    },

    final: function (e, rnd) {
      var a = analyze(e.w), nu = a.nuc[a.n - 1];
      if (!nu || !nu.diph || (nu.v !== 'αι' && nu.v !== 'οι')) return null;
      var q = quantity(e, 1);
      var p = pack(['Μακρό', 'Βραχύ'], q === 'μ' ? 'Μακρό' : 'Βραχύ', rnd);
      return { cell: 'final', tag: 'ΤΑ ΤΕΛΙΚΑ -ΑΙ / -ΟΙ', word: e.w, plain: true,
        ask: 'Το τελικό <b>-' + nu.v + '</b> εδώ μετράει μακρό ή βραχύ;',
        opts: p.opts, ans: p.ans,
        why: e.opt ? 'ΕΥΚΤΙΚΗ — η μία εξαίρεση. Εκεί το -' + nu.v + ' ξαναγίνεται ΜΑΚΡΟ, γι\' αυτό ο τόνος δεν ανεβαίνει.'
                   : 'Στο τέλος της λέξης τα -αι και -οι μετρούν ΒΡΑΧΕΑ, γι\' αυτό ο τόνος μπορεί να ανέβει.' };
    },

    spirit: function (e, rnd) {
      var a = analyze(e.w);
      if (!a.needsBreath || !a.breath) return null;
      var right = e.w;
      var wrong = restrike(e, { breath: a.breath === 'δ' ? 'ψ' : 'δ' });
      var p = pack([right, wrong], right, rnd);
      if (!p) return null;
      return { cell: 'spirit', tag: 'ΔΑΣΕΙΑ Ή ΨΙΛΗ', word: bare(e), gloss: e.g,
        ask: 'Ποιο πνεύμα παίρνει;', opts: p.opts, ans: p.ans,
        why: (a.breath === 'δ' ? 'ΔΑΣΕΙΑ. ' : 'ΨΙΛΗ. ') + (e.d || '') };
    },

    spos: function (e, rnd) {
      var a = analyze(e.w);
      if (!a.needsBreath || !a.breath || !a.nuc.length || !a.nuc[0].diph) return null;
      var right = e.w;
      var wrong = restrike(e, { breath: a.breath, breathFirst: true });
      var p = pack([right, wrong], right, rnd);
      if (!p) return null;
      return { cell: 'spos', tag: 'ΠΟΥ ΜΠΑΙΝΕΙ ΤΟ ΣΗΜΑΔΙ', word: bare(e), gloss: e.g,
        ask: 'Ποια γραφή είναι σωστή;', opts: p.opts, ans: p.ans,
        why: 'Στον δίφθογγο, τόνος και πνεύμα πάνε στο ΔΕΥΤΕΡΟ φωνήεν: ' + right + '.' };
    },

    ultima: function (e, rnd) {
      var a = analyze(e.w);
      if (a.n < 3) return null;
      var ult = quantity(e, 1);
      if (!ult) return null;
      var mb = maxBack(e);
      var p = pack(['Λήγουσα', 'Παραλήγουσα', 'Προπαραλήγουσα'],
        mb === 3 ? 'Προπαραλήγουσα' : 'Παραλήγουσα', rnd);
      return { cell: 'ultima', tag: 'Ο ΝΟΜΟΣ ΤΗΣ ΛΗΓΟΥΣΑΣ', word: bare(e), plain: true, gloss: e.g,
        ask: 'Η λήγουσα είναι <b>' + (ult === 'μ' ? 'μακρά' : 'βραχεία') + '</b>. Πιο πίσω από πού ΔΕΝ μπορεί να πάει ο τόνος;',
        opts: p.opts, ans: p.ans,
        why: ult === 'μ' ? 'Μακρή λήγουσα ⇒ ο τόνος μένει το πολύ στην παραλήγουσα. (' + e.w + ')'
                         : 'Βραχεία λήγουσα ⇒ ο τόνος μπορεί να φτάσει ως την προπαραλήγουσα. (' + e.w + ')' };
    },

    penult: function (e, rnd) {
      var a = analyze(e.w);
      if (a.accIdx !== 2) return null;
      var f = forcedType(e);
      if (!f) return null;
      var right = e.w;
      var wrong = restrike(e, { idx: 2, type: f === 'π' ? 'ο' : 'π' });
      var p = pack([right, wrong], right, rnd);
      if (!p) return null;
      var ult = quantity(e, 1), pen = quantity(e, 2);
      return { cell: 'penult', tag: 'ΟΞΕΙΑ Ή ΠΕΡΙΣΠΩΜΕΝΗ', word: bare(e), gloss: e.g,
        ask: 'Ο τόνος πέφτει στην παραλήγουσα. Οξεία ή περισπωμένη;',
        opts: p.opts, ans: p.ans,
        why: f === 'π'
          ? 'Παραλήγουσα ΜΑΚΡΗ + λήγουσα ΒΡΑΧΕΙΑ ⇒ περισπωμένη. Επιβάλλεται, δεν το διαλέγεις.'
          : (ult === 'μ' ? 'Η λήγουσα είναι ΜΑΚΡΗ ⇒ οξεία. Περισπωμένη θέλει βραχεία λήγουσα.'
                         : 'Η παραλήγουσα (' + a.nuc[a.n - 2].v + ') είναι ΒΡΑΧΕΙΑ ⇒ δεν σηκώνει περισπωμένη.') };
    },

    name: function (e, rnd) {
      var nm = nameOf(e);
      if (!nm) return null;
      var all = ['οξύτονη', 'παροξύτονη', 'προπαροξύτονη', 'περισπώμενη', 'προπερισπώμενη'];
      var others = shuffled(all.filter(function (x) { return x !== nm; }), rnd).slice(0, 3);
      var p = pack(others.concat([nm]), nm, rnd);
      var a = analyze(e.w);
      return { cell: 'name', tag: 'Η ΟΝΟΜΑΣΙΑ', word: e.w, plain: true,
        ask: 'Πώς λέγεται αυτή η λέξη;', opts: p.opts, ans: p.ans,
        why: (a.accType === 'π' ? 'Περισπωμένη' : 'Οξεία') + ' στη' +
             (a.accIdx === 1 ? ' λήγουσα' : a.accIdx === 2 ? 'ν παραλήγουσα' : 'ν προπαραλήγουσα') + ' ⇒ ' + nm + '.' };
    },

    rule: function (e, rnd) {
      var r = RULES[Math.floor(rnd() * RULES.length)];
      var p = pack(['Σωστό', 'Λάθος'], r.a ? 'Σωστό' : 'Λάθος', rnd);
      return { cell: 'rule', tag: 'ΟΙ ΚΑΝΟΝΕΣ', word: null, statement: r.s, plain: true,
        ask: 'Σωστό ή λάθος;', opts: p.opts, ans: p.ans, why: r.why };
    },

    full: function (e, rnd) {
      var a = analyze(e.w);
      if (!a.accIdx) return null;
      var right = e.w, cand = [];
      var other = a.accType === 'π' ? 'ο' : 'π';

      /* γείτονες: άλλο είδος τόνου · τόνος μία θέση πίσω/μπροστά · άλλο πνεύμα */
      cand.push(restrike(e, { idx: a.accIdx, type: other }));
      if (a.accIdx + 1 <= Math.min(a.n, 3)) cand.push(restrike(e, { idx: a.accIdx + 1, type: 'ο' }));
      if (a.accIdx - 1 >= 1) cand.push(restrike(e, { idx: a.accIdx - 1, type: 'ο' }));
      if (a.breath) cand.push(restrike(e, { breath: a.breath === 'δ' ? 'ψ' : 'δ' }));
      if (a.breath && a.nuc[0] && a.nuc[0].diph) cand.push(restrike(e, { breath: a.breath, breathFirst: true }));

      cand = cand.filter(function (x) { return x && x !== right; });
      if (cand.length < 2) return null;
      var p = pack([right].concat(shuffled(cand, rnd).slice(0, 3)), right, rnd);
      if (!p) return null;

      var bits = [];
      if (a.breath) bits.push(a.breath === 'δ' ? 'δασεία' : 'ψιλή');
      bits.push((a.accType === 'π' ? 'περισπωμένη' : 'οξεία') + ' στη' +
        (a.accIdx === 1 ? ' λήγουσα' : a.accIdx === 2 ? 'ν παραλήγουσα' : 'ν προπαραλήγουσα'));
      return { cell: 'full', tag: 'ΟΛΟΚΛΗΡΗ Η ΛΕΞΗ', word: bare(e), gloss: e.g,
        ask: 'Τόνισέ την σωστά.', opts: p.opts, ans: p.ans,
        why: right + ' — ' + bits.join(' + ') + '.' };
    }
  };

  /* Παράγει μία ερώτηση για το ζητούμενο κελί, δοκιμάζοντας λέξεις μέχρι
     να βρει μία που κάνει. Επιστρέφει null αν κανένα από τα 40 δείγματα
     δεν ταιριάζει — ο καλών προχωράει στο επόμενο κελί. */
  function question(cell, rnd, words) {
    var ws = words || WORDS, gen = GEN[cell], i;
    if (!gen) return null;
    for (i = 0; i < 40; i++) {
      var q = gen(ws[Math.floor(rnd() * ws.length)], rnd);
      if (q) return q;
    }
    return null;
  }

  /* ── 12 · Η ΣΥΝΕΔΡΙΑ ──────────────────────────────────────────────
     Βαρύτητα σε (α) ό,τι είναι για επανάληψη σήμερα και (β) ό,τι κόβει.
     Ίδια σκάλα με τα Λατινικά και το Notion: ίδιο βράδυ → +3 → +10 → +30 → +90. */
  var LADDER = [0, 3, 10, 30, 90];
  function nextDue(streak) {
    var d = LADDER[Math.min(streak, LADDER.length - 1)];
    return Date.now() + d * 86400000;
  }

  function build(n, stats, rnd, only) {
    rnd = rnd || Math.random;
    stats = stats || {};
    var pool = [], i, c, s, weight;
    for (i = 0; i < CELLS.length; i++) {
      c = CELLS[i].id;
      if (only && only.indexOf(c) < 0) continue;
      s = stats[c] || { r: 0, w: 0, due: 0 };
      var t = s.r + s.w;
      weight = 1;
      if (!t) weight = 2.2;                                   /* αδοκίμαστο — δείξ' το */
      else {
        var acc = s.r / t;
        weight = 1 + (1 - acc) * 2.5;                          /* χαμηλή ακρίβεια → βαρύτερο */
        if (Date.now() >= (s.due || 0)) weight += 1.2;         /* ήρθε η ώρα του */
      }
      for (var k = 0; k < Math.round(weight * 10); k++) pool.push(c);
    }
    if (!pool.length) return [];

    var out = [], guard = 0, lastCell = null;
    while (out.length < n && guard++ < n * 25) {
      var cell = pool[Math.floor(rnd() * pool.length)];
      if (cell === lastCell && out.length && rnd() < 0.6) continue;   /* μη σερβίρεις δύο ίδια στη σειρά */
      var q = question(cell, rnd);
      if (!q) continue;
      out.push(q);
      lastCell = cell;
    }
    return out;
  }

  /* ── 13 · verify — το δίχτυ ασφαλείας ─────────────────────────────
     Τρέχει πάνω σε ΟΛΟ το corpus. Κάθε λέξη πρέπει να είναι νόμιμη ΚΑΙ,
     αν ο τόνος είναι στην παραλήγουσα, το είδος του να είναι ακριβώς
     αυτό που επιβάλλουν οι ποσότητες. Μια λάθος δήλωση δίχρονου σκάει εδώ. */
  function verify(words) {
    var ws = words || WORDS, bad = [], i;
    for (i = 0; i < ws.length; i++) {
      var e = ws[i], v = laws(e);
      if (v.length) bad.push({ w: e.w, why: v });
      var f = forcedType(e), a = analyze(e.w);
      if (f && a.accType !== f) bad.push({ w: e.w, why: ['ο τόνος έπρεπε να είναι ' + (f === 'π' ? 'περισπωμένη' : 'οξεία')] });
      if (a.accIdx > maxBack(e)) bad.push({ w: e.w, why: ['ο τόνος είναι πιο πίσω απ\' ό,τι επιτρέπει η λήγουσα'] });
    }
    return bad;
  }

  global.TonosEngine = {
    WORDS: WORDS, CELLS: CELLS, RULES: RULES, LADDER: LADDER,
    analyze: analyze, quantity: quantity, laws: laws, forcedType: forcedType,
    maxBack: maxBack, nameOf: nameOf, restrike: restrike, bare: bare,
    cellLabel: cellLabel, question: question, build: build,
    nextDue: nextDue, verify: verify
  };
})(typeof window !== 'undefined' ? window : global);

if (typeof module !== 'undefined' && module.exports) module.exports = (typeof window !== 'undefined' ? window : global).TonosEngine;
