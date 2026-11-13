/* ══════════════════════════════════════════════════════════════════════
   grammatiki-core.js — η ΜΗΧΑΝΗ της σελίδας «Γραμματική» (arxaia-grammatiki.html).
   Καθαρή λογική, χωρίς DOM και χωρίς αποθήκη: τρέχει ίδια στο Node
   (tests/grammatiki.test.js) και στη σελίδα.

   ⭐ ΜΙΑ ΠΗΓΗ. Κάθε ενότητα είναι ένα αρχείο data/grammatiki/<id>.json.
   Η σελίδα ΚΑΙ οι κάρτες βγαίνουν από αυτό — ένας τύπος γράφεται μία φορά,
   άρα δεν γίνεται να λέει άλλο ο πίνακας και άλλο το κουίζ.

   ⭐ ΕΤΟΙΜΗ ΓΙΑ ΟΛΑ. Ένα υπόδειγμα είναι ΠΙΝΑΚΑΣ (γραμμές × στήλες):
     · ουσιαστικό: sg/pl (5 πτώσεις × 2 αριθμοί) — συντομογραφία
     · επίθετο/ρήμα: table:{rows:[…], cols:[…], cells:[[…]]}
   Κάθε κελί 'στέλεχος|κατάληξη'. Οι κάρτες ΔΕΝ ξέρουν τι είναι ουσιαστικό·
   ξέρουν μόνο κελιά, ετικέτες, «κλίνονται έτσι» και κανόνες.

   ΤΑ 4 ΕΙΔΗ ΚΑΡΤΑΣ
     f  Φτιάξε τον τύπο     «τῆς θαλάσσ__ · γεν. ενικού» → ‑ης
     r  Αναγνώρισε τον τύπο «θαλάσσῃ» → δοτική ενικού (ίδιοι τύποι = μία απάντηση)
     m  Ποιο υπόδειγμα      «μέλισσα» → θάλασσα
     w  Γιατί               «τῆς θαλάσσης» → ο κανόνας
   ΣΚΑΛΑ (ίδια με το Λεξιλόγιο): 1 · 3 · 7 · 21 · 30 μέρες.
   ══════════════════════════════════════════════════════════════════════ */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.GramCore = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var CASES = ['Ονομαστική', 'Γενική', 'Δοτική', 'Αιτιατική', 'Κλητική'];
  var CASES_S = ['Ον.', 'Γεν.', 'Δοτ.', 'Αιτ.', 'Κλ.'];
  var ART = {
    m: { sg: ['ὁ', 'τοῦ', 'τῷ', 'τὸν', 'ὦ'], pl: ['οἱ', 'τῶν', 'τοῖς', 'τοὺς', 'ὦ'] },
    f: { sg: ['ἡ', 'τῆς', 'τῇ', 'τὴν', 'ὦ'], pl: ['αἱ', 'τῶν', 'ταῖς', 'τὰς', 'ὦ'] },
    n: { sg: ['τὸ', 'τοῦ', 'τῷ', 'τὸ', 'ὦ'], pl: ['τὰ', 'τῶν', 'τοῖς', 'τὰ', 'ὦ'] }
  };
  var LADDER = [1, 3, 7, 21, 30];
  var NEW_PER_DAY = 15;

  var nfc = function (s) { return String(s == null ? '' : s).normalize('NFC'); };
  var plain = function (c) { return nfc(c).replace('|', ''); };
  var split = function (c) { var s = nfc(c), i = s.indexOf('|'); return i < 0 ? [s, ''] : [s.slice(0, i), s.slice(i + 1)]; };

  /* ── ημερομηνίες (τοπικές, ISO) ── */
  function toISO(d) { var m = d.getMonth() + 1, x = d.getDate(); return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (x < 10 ? '0' : '') + x; }
  function addDays(iso, n) { var p = iso.split('-').map(Number); return toISO(new Date(p[0], p[1] - 1, p[2] + n, 12)); }

  /* ── ένα υπόδειγμα → πίνακας ──
     Επιστρέφει { rows, cols, cells[r][c] = 'στέλ|κατ' ή null, arts[r][c] } */
  function table(m) {
    if (m.table) {
      return { rows: m.table.rows, cols: m.table.cols, cells: m.table.cells,
               arts: m.table.arts || m.table.cells.map(function (r) { return r.map(function () { return ''; }); }) };
    }
    var cols = [], cells = CASES.map(function () { return []; }), arts = CASES.map(function () { return []; });
    var g = ART[m.g] || ART.m;
    if (m.sg) { cols.push(m.alt ? m.w : 'Ενικός'); m.sg.forEach(function (c, i) { cells[i].push(c); arts[i].push(g.sg[i]); }); }
    if (m.alt) { cols.push(m.from); m.alt.forEach(function (c, i) { cells[i].push(c); arts[i].push(g.sg[i]); }); }
    if (m.pl) { cols.push('Πληθυντικός'); m.pl.forEach(function (c, i) { cells[i].push(c); arts[i].push(g.pl[i]); }); }
    return { rows: CASES_S, cols: cols, cells: cells, arts: arts };
  }
  /* «γενική ενικού» — η ετικέτα ενός κελιού, όπως τη λέμε */
  function cellName(m, t, r, c) {
    if (m.table) return (m.table.names && m.table.names[r] && m.table.names[r][c]) || (t.rows[r] + ' · ' + t.cols[c]);
    var col = t.cols[c], num = col === 'Πληθυντικός' ? 'πληθυντικού' : 'ενικού';
    return CASES[r].toLowerCase() + ' ' + num + (m.alt ? ' (' + col + ')' : '');
  }

  function allModels(u) { return (u.models || []).concat((u.contracted && u.contracted.models) || []); }

  /* ── ΤΑ ΧΑΡΤΙΑ ── ντετερμινιστικά ids: ίδιο αρχείο → ίδιες κάρτες → η
     πρόοδος δεν χάνεται όταν προστεθεί μια ενότητα. */
  function cards(u) {
    var out = [], ms = allModels(u), pool = {};
    var isC = function (m) { return !!(u.contracted && u.contracted.models.indexOf(m) >= 0); };

    // ποιες καταλήξεις κυκλοφορούν στην ενότητα (για παραπλανητικές)
    ms.forEach(function (m) {
      var t = table(m);
      t.cells.forEach(function (row) { row.forEach(function (c) { if (c) pool[split(c)[1]] = 1; }); });
    });
    var allEnd = Object.keys(pool).filter(Boolean);

    ms.forEach(function (m) {
      var t = table(m), forms = {};
      t.cells.forEach(function (row, r) {
        row.forEach(function (c, ci) {
          if (!c) return;
          var sp = split(c), name = cellName(m, t, r, ci), art = t.arts[r][ci];
          // f — φτιάξε τον τύπο
          if (sp[1]) {
            var mine = [];
            t.cells.forEach(function (rr) { rr.forEach(function (x) { if (x) mine.push(split(x)[1]); }); });
            out.push({ id: 'f:' + u.id + ':' + m.id + ':' + r + ':' + ci, k: 'f', unit: u.id, model: m.id,
              q: { art: art, stem: sp[0], name: name, w: plain(c) === nfc(m.w) ? '' : m.w },   /* σταθ. 27: το υπόδειγμα δεν δείχνεται όταν ΕΙΝΑΙ η απάντηση */
              /* σταθ. 27: η λάθος κατάληξη έχει τόνο ΑΚΡΙΒΩΣ όπως η σωστή — αλλιώς
                 το «ταμί + ‑ῆν» (δύο τόνοι) ή «ταμι + ‑ων» (κανένας) αποκλείεται χωρίς γνώση */
              a: sp[1], pool: uniq(mine.concat(allEnd)).filter(function (e) { return e && e !== sp[1] && hasAcc(e) === hasAcc(sp[1]); }),
              full: (art ? art + ' ' : '') + plain(c) });
          }
          var p = plain(c);
          (forms[p] = forms[p] || []).push(name);
        });
      });
      // r — αναγνώρισε τον τύπο (ίδιοι τύποι → μία απάντηση με «ή»)
      var names = [];
      t.cells.forEach(function (row, r) { row.forEach(function (c, ci) { if (c) names.push(cellName(m, t, r, ci)); }); });
      Object.keys(forms).forEach(function (f) {
        var a = forms[f].join(' ή ');
        out.push({ id: 'r:' + u.id + ':' + m.id + ':' + f, k: 'r', unit: u.id, model: m.id,
          q: { form: f, w: f === nfc(m.w) ? '' : m.w }, a: a,
          pool: names.filter(function (n) { return forms[f].indexOf(n) < 0; }) });
      });
      // m — ποιο υπόδειγμα
      var group = ms.filter(function (x) { return isC(x) === isC(m); });
      (m.like || []).forEach(function (w) {
        out.push({ id: 'm:' + u.id + ':' + nfc(w), k: 'm', unit: u.id, model: m.id,
          q: { word: nfc(w) }, a: m.w,
          /* σταθ. 27: λάθος επιλογές ΜΟΝΟ από την ίδια ομάδα (ασυναίρετα με ασυναίρετα)·
             ένα «συκῆ» δίπλα στο «Αἰνείας» αποκλείεται χωρίς γνώση. Αν η ομάδα δεν
             φτάνει για 3, συμπληρώνει από την άλλη. */
          pool: (function () {
            var same = group.filter(function (x) { return x !== m; }).map(function (x) { return x.w; });
            return same.length >= 3 ? same : same.concat(ms.filter(function (x) { return group.indexOf(x) < 0; }).map(function (x) { return x.w; }));
          })() });
      });
      // w — γιατί
      (m.why || []).forEach(function (y, i) {
        var rule = u.rules[y.rule];
        out.push({ id: 'w:' + u.id + ':' + m.id + ':' + i, k: 'w', unit: u.id, model: m.id,
          q: { form: y.form, w: m.w }, a: rule.t, why: y.d,
          pool: u.rules.filter(function (x) { return x !== rule; }).map(function (x) { return x.t; }) });
      });
    });
    return out;
  }
  function hasAcc(s) { return /[\u0301\u0300\u0342]/.test(nfc(s).normalize('NFD')); }
  function uniq(a) { var s = {}, o = []; a.forEach(function (x) { if (!s[x]) { s[x] = 1; o.push(x); } }); return o; }

  /* 4 επιλογές: η σωστή + 3 από το pool, ανακατεμένες. rng για τα tests. */
  function options(card, rng) {
    rng = rng || Math.random;
    var p = shuffle(uniq(card.pool).filter(function (x) { return x !== card.a; }), rng).slice(0, 3);
    return shuffle(p.concat([card.a]), rng);
  }
  function shuffle(a, rng) {
    a = a.slice(); rng = rng || Math.random;
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  /* ── ΣΚΑΛΑ ──
     rec = { box, due, first, last }  (το _ts το βάζει η σελίδα, study-stamp)
     firstTry: σωστό με την πρώτη. Λάθος → box 0, ξανά αύριο. */
  function grade(rec, firstTry, today) {
    var r = rec ? copy(rec) : { box: 0, first: today };
    if (!r.first) r.first = today;
    r.last = today;
    if (firstTry) { r.box = Math.min((r.box || 0) + 1, LADDER.length); r.due = addDays(today, LADDER[r.box - 1]); }
    else { r.box = 0; r.due = addDays(today, 1); }
    return r;
  }
  function copy(o) { var x = {}; for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) x[k] = o[k]; return x; }

  /* Για σήμερα: όσες έληξαν (από ενότητες που ΞΕΚΙΝΗΣΕΣ) + έως 15 νέες τη μέρα. */
  function todayQueue(all, recs, started, today, rng) {
    recs = recs || {}; started = started || {};
    var due = [], fresh = [], newToday = 0;
    Object.keys(recs).forEach(function (id) { if (recs[id] && recs[id].first === today) newToday++; });
    all.forEach(function (c) {
      if (!started[c.unit]) return;
      var r = recs[c.id];
      if (!r) fresh.push(c);
      else if (!r.due || r.due <= today) due.push(c);
    });
    var room = Math.max(0, NEW_PER_DAY - newToday);
    // νέες με τη σειρά του βιβλίου (υπόδειγμα προς υπόδειγμα), αλλά μέσα σε
    // κάθε υπόδειγμα ΕΝΑΛΛΑΞ τα 4 είδη — αλλιώς η 1η μέρα είναι 15 «φτιάξε
    // τον τύπο» του ταμίας και τίποτα άλλο.
    return shuffle(due, rng).concat(shuffle(interleave(fresh).slice(0, room), rng));
  }
  function interleave(list) {
    var order = [], by = {};
    list.forEach(function (c) {
      var k = c.unit + '/' + c.model;
      if (!by[k]) { by[k] = { f: [], r: [], m: [], w: [] }; order.push(k); }
      by[k][c.k].push(c);
    });
    var out = [];
    order.forEach(function (k) {
      var b = by[k], more = true;
      for (var i = 0; more; i++) {
        more = false;
        ['f', 'r', 'm', 'w'].forEach(function (t) { if (b[t][i]) { out.push(b[t][i]); more = true; } });
      }
    });
    return out;
  }
  function counts(all, recs, started, today) {
    recs = recs || {}; started = started || {};
    var due = 0, fresh = 0, learned = 0, total = 0, newToday = 0;
    Object.keys(recs).forEach(function (id) { if (recs[id] && recs[id].first === today) newToday++; });
    all.forEach(function (c) {
      if (!started[c.unit]) return;
      total++;
      var r = recs[c.id];
      if (!r) fresh++; else if (!r.due || r.due <= today) due++;
      if (r && r.box >= 3) learned++;
    });
    return { due: due, fresh: Math.min(fresh, Math.max(0, NEW_PER_DAY - newToday)), freshAll: fresh, learned: learned, total: total };
  }

  /* ── έλεγχος δεδομένων: ό,τι θα έσπαγε τη σελίδα ή θα έδινε λάθος κάρτα ── */
  function validate(u) {
    var errs = [], ms = allModels(u);
    if (!u.id || !u.title) errs.push('χωρίς id/title');
    if (!Array.isArray(u.rules)) errs.push('χωρίς rules');
    var seen = {};
    ms.forEach(function (m) {
      if (seen[m.id]) errs.push('διπλό id ' + m.id); seen[m.id] = 1;
      var t = table(m);
      t.cells.forEach(function (row, r) {
        if (row.length !== t.cols.length) errs.push(m.id + ': γραμμή ' + r + ' έχει ' + row.length + ' κελιά');
        row.forEach(function (c) {
          if (c == null) return;
          if (c !== nfc(c)) errs.push(m.id + ': όχι NFC ' + c);
          if (c.split('|').length !== 2) errs.push(m.id + ': χωρίς ένα | → ' + c);
        });
      });
      (m.why || []).forEach(function (y) { if (!u.rules[y.rule]) errs.push(m.id + ': why χωρίς κανόνα ' + y.rule); });
      (m.like || []).forEach(function (w) { if (/[,·.]/.test(w)) errs.push(m.id + ': like με σημεία στίξης «' + w + '»'); });
    });
    // καμία λέξη σε δύο υποδείγματα
    var lk = {};
    ms.forEach(function (m) { (m.like || []).forEach(function (w) { if (lk[w]) errs.push('η «' + w + '» και σε ' + lk[w] + ' και σε ' + m.id); lk[w] = m.id; }); });
    // κάθε κάρτα: η σωστή να μη φαίνεται και ως παραπλανητική, να έχει ≥3 λάθος
    cards(u).forEach(function (c) {
      if (c.pool.indexOf(c.a) >= 0) errs.push(c.id + ': η σωστή είναι και στις λάθος');
      if (uniq(c.pool).length < 3) errs.push(c.id + ': λιγότερες από 3 λάθος επιλογές');
    });
    return errs;
  }

  return { CASES: CASES, CASES_S: CASES_S, ART: ART, LADDER: LADDER, NEW_PER_DAY: NEW_PER_DAY,
    nfc: nfc, plain: plain, split: split, toISO: toISO, addDays: addDays,
    table: table, cellName: cellName, allModels: allModels, cards: cards, options: options, shuffle: shuffle,
    grade: grade, todayQueue: todayQueue, counts: counts, validate: validate };
});
