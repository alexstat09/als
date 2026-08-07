/* ══════════════════════════════════════════════════════════════════════
   lesson-grade.js — Ο ΒΑΘΜΟΛΟΓΗΤΗΣ ΤΗΣ ΑΝΑΚΛΗΣΗΣ, ΜΙΑ ΦΟΡΑ.

   Η Ιστορία και τα Αρχαία-ΓΝΩΣΤΟ είναι το ίδιο είδος μαθήματος: κείμενο
   που δεν παράγεται από κανόνα, σπασμένο σε σημεία, τα σημεία σπασμένα σε
   ΣΤΟΙΧΕΙΑ, και μια απαγγελία που βαθμολογείται ΜΙΑ φορά στο τέλος.

   ⭐ ΣΤΑΘΕΡΗ ΑΡΧΗ 15: μια εγγύηση που ισχύει σε ένα μονοπάτι και όχι στο
   δίδυμό του δεν είναι εγγύηση, είναι σύμπτωση με καλή φήμη. Ο κανόνας
   «ένα σημείο είναι πλήρες μόνο αν ειπώθηκαν ΟΛΑ τα στοιχεία του» κόστισε
   μια ολόκληρη έκδοση (als-v452) — δεν επιτρέπεται να υπάρχει σε δύο
   αντίγραφα που μπορούν να αποκλίνουν σιωπηλά.

   ⚠️ ΣΤΑΘΕΡΗ ΑΡΧΗ 25: ΑΥΤΟ ΤΟ ΑΡΧΕΙΟ ΔΕΝ ΚΑΝΕΙ require ΚΑΝΕΝΑ ΑΠΟ ΤΑ ΔΥΟ
   ΠΑΙΔΙΑ ΤΟΥ. Εξαρτάται μόνο από το `greek-ear.js`, που με τη σειρά του δεν
   εξαρτάται από τίποτα. Ένας κύκλος στο Node δεν πετάει σφάλμα — δίνει
   μισοχτισμένο module, δηλαδή silent-empty μέσα στο require graph.

   ⚠️ ΤΟ `istoria-data.js` ΚΡΑΤΑΕΙ ΑΚΟΜΗ ΤΑ ΔΙΚΑ ΤΟΥ ΑΝΤΙΓΡΑΦΑ, επίτηδες: δεν
   ξεβιδώνω μια σελίδα που δουλεύει και τη χρησιμοποιεί κάθε μέρα. Αντ' αυτού
   το `tests/arxaia-gnosto.test.js` συγκρίνει τις δύο υλοποιήσεις
   ΣΥΝΑΡΤΗΣΗ-ΠΡΟΣ-ΣΥΝΑΡΤΗΣΗ και σκάει αν αποκλίνουν. Αν ποτέ χρειαστεί
   αλλαγή στη βαθμολόγηση, αλλάζουν ΚΑΙ ΤΑ ΔΥΟ ή κανένα.
   ══════════════════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  var EAR = (typeof module !== 'undefined' && module.exports && typeof require === 'function')
    ? require('./greek-ear.js') : root.GREEKEAR;
  /* ⚠️ Σταθερή αρχή 10: ένα αυτί που δεν φορτώθηκε δεν επιτρέπεται να μοιάζει
     με αυτί που δεν ακούει. Σκάει δυνατά, δεν επιστρέφει σιωπηλά. */
  if (!EAR) throw new Error('lesson-grade.js: λείπει το greek-ear.js');

  var pho = EAR.pho, expand = EAR.expand, ALIAS_MIN = EAR.ALIAS_MIN;

  /* ⚠️ ΟΙ ΠΕΝΤΕ ΣΥΝΑΡΤΗΣΕΙΣ ΠΑΡΑΚΑΤΩ ΕΙΝΑΙ ΑΥΤΟΛΕΞΕΙ ΑΝΤΙΓΡΑΦΑ ΤΟΥ
     istoria-data.js. Μην τις «βελτιώσεις» εδώ μόνο — το test τις συγκρίνει. */

  function matched(el, heard, extra) {
    var hay = pho(expand(heard)), i, j, alts = (el && el.say) || [], ok, a;
    for (i = 0; i < alts.length; i++) {
      if (!alts[i] || !alts[i].length) continue;
      ok = true;
      for (j = 0; j < alts[i].length; j++) {
        if (hay.indexOf(pho(alts[i][j])) < 0) { ok = false; break; }
      }
      if (ok) return true;
    }
    for (i = 0; extra && i < extra.length; i++) {
      a = pho(extra[i]);
      if (a.length >= ALIAS_MIN && hay.indexOf(a) >= 0) return true;
    }
    return false;
  }

  function gradePoint(point, heard, alias) {
    var must = (point && point.must) || [], hits = [], n = 0, i;
    for (i = 0; i < must.length; i++) {
      var h = matched(must[i], heard, alias && alias[i]);
      hits.push(h); if (h) n++;
    }
    return { hits: hits, n: n, total: must.length, full: must.length > 0 && n === must.length, part: n > 0 && n < must.length };
  }

  function gradeUnit(unit, heard, aliases) {
    var pts = (unit && unit.skeleton && unit.skeleton.points) || [];
    var out = [], said = 0, total = 0, i, j, a;
    for (i = 0; i < pts.length; i++) {
      a = null;
      if (aliases) {
        a = [];
        for (j = 0; j < ((pts[i].must) || []).length; j++) a.push(aliases[i + ':' + j] || null);
      }
      var g = gradePoint(pts[i], heard, a);
      out.push(g); said += g.n; total += g.total;
    }
    return { points: out, said: said, total: total, coverage: total ? said / total : 0 };
  }

  function bodyOf(u) {
    var out = [], i;
    for (i = 0; i < (u.text || []).length; i++) out.push(u.text[i].p);
    return out.join('\n');
  }

  var LADDER = [0, 3, 10, 30, 90];

  function nextDue(reviews, from) {
    var step = LADDER[Math.min(reviews, LADDER.length - 1)];
    return (from || Date.now()) + step * 86400000;
  }

  root.LESSONGRADE = {
    matched: matched,
    gradePoint: gradePoint,
    gradeUnit: gradeUnit,
    bodyOf: bodyOf,
    nextDue: nextDue,
    LADDER: LADDER,
    PASS: 0.9
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = root.LESSONGRADE;

})(typeof window !== 'undefined' ? window : globalThis);
