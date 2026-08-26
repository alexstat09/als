/* arxaia-engine.js — οι κανόνες γύρω από την ύλη, als-v454.
 *
 * ΤΙ ΔΕΝ ΚΑΝΕΙ ΑΥΤΟ ΤΟ ΑΡΧΕΙΟ: δεν παράγει τύπους. Στα Λατινικά η μηχανή
 * κλίνει, γιατί η λατινική μορφολογία είναι ντετερμινιστική. Εδώ όχι — οι
 * αρχικοί χρόνοι είναι εξ ορισμού το κομμάτι που ΔΕΝ βγαίνει με κανόνα. Κάθε
 * τύπος έρχεται μεταγραμμένος από το arxaia-data.js και δεν αγγίζεται.
 *
 * ΤΙ ΚΑΝΕΙ: τρία πράγματα, και τα τρία είναι ασφάλεια.
 *
 *  1. ΕΛΕΓΧΟΣ ΣΧΗΜΑΤΟΣ (audit). Το θέμα ενός ρήματος είναι απρόβλεπτο, η
 *     ΚΑΤΑΛΗΞΗ όχι: ένας παρακείμενος μέσης φωνής τελειώνει σε -μαι, πάντα.
 *     Μαζί με τον έλεγχο αύξησης και τον έλεγχο πολυτονικού, αυτό πιάνει
 *     μηχανικά το λάθος πληκτρολόγησης που κανένα μάτι δεν πιάνει στην 40ή
 *     γραμμή. Δεν διορθώνει το φυλλάδιο — ελέγχει τη μεταγραφή μου.
 *
 *  2. Η ΠΥΛΗ ΤΗΣ ΜΟΝΑΔΙΚΟΤΗΤΑΣ. «ἤγγελμαι — ποιος χρόνος;» έχει νόημα μόνο αν
 *     ο τύπος εμφανίζεται σε ΕΝΑ κελί του ρήματος. Αν ο ίδιος τύπος στέκει σε
 *     δύο χρόνους, η ερώτηση δεν έχει μία σωστή απάντηση — και το να τον
 *     κόψει η σελίδα ενώ έχει δίκιο είναι χειρότερο από το να μη ρωτήσει.
 *
 *  3. ΟΙ ΠΑΓΙΔΕΣ. Οι εναλλακτικές απαντήσεις βγαίνουν από ΓΕΙΤΟΝΙΚΑ κελιά του
 *     ΙΔΙΟΥ ρήματος (ἤγγειλα / ἤγγελκα / ἤγγελλον / ἀγγελῶ). Είναι όλες
 *     αληθινοί τύποι — δεν τυπώνουμε ποτέ ανύπαρκτο τύπο στην οθόνη, ούτε ως
 *     λάθος επιλογή — αλλά μοιάζουν τόσο που η αναγνώριση από μόνη της δεν
 *     τον περνάει. Αυτό ακριβώς ζητάει η εξέταση.
 */
(function (root, factory) {
  var isNode = (typeof module === 'object' && module.exports);
  var data = isNode ? require('./arxaia-data.js') : root.ArxaiaData;
  var api = factory(data);
  if (isNode) module.exports = api;
  else root.ArxaiaEngine = api;
}(typeof self !== 'undefined' ? self : this, function (D) {
  'use strict';

  /* ══════════════════════════════════════════════════════════════════
     1 · ΠΟΛΥΤΟΝΙΚΟ — χαμηλού επιπέδου εργαλεία
     Δουλεύουμε πάνω σε NFD: το ἤ διασπάται σε η + ψιλή + οξεία, οπότε τα
     διακριτικά γίνονται μετρήσιμα αντί για 200 προσυντεθειμένους χαρακτήρες.
     ══════════════════════════════════════════════════════════════════ */
  var PSILI = '̓', DASIA = '̔';
  var OXEIA = '́', VAREIA = '̀', PERISPWMENI = '͂';
  var YPOGEGRAMMENI = 'ͅ';
  var VOWELS = 'αεηιουω';

  function nfd(s) { return String(s || '').normalize ? String(s).normalize('NFD') : String(s || ''); }

  /* Γυμνή μορφή: χωρίς τόνους, πνεύματα, υπογεγραμμένη — και τελικό σ.
     Χρησιμοποιείται ΜΟΝΟ όταν πληκτρολογεί, γιατί το ελληνικό πληκτρολόγιο
     του κινητού δεν βγάζει πολυτονικό. Στις επιλογές με το δάχτυλο η
     σύγκριση είναι πάντα ακριβής, τόνο προς τόνο. */
  function strip(s) {
    return nfd(s).replace(/[̀-ͯ]/g, '').replace(/ς/g, 'σ').toLowerCase().trim();
  }

  function marks(ch) { return ch; }

  /* Σπάει μια λέξη σε [γράμμα, διακριτικά] ώστε να ρωτηθεί το πρώτο φωνήεν. */
  function letters(word) {
    var d = nfd(word), out = [], i, ch;
    for (i = 0; i < d.length; i++) {
      ch = d.charAt(i);
      if (ch >= '̀' && ch <= 'ͯ') { if (out.length) out[out.length - 1].m += ch; }
      else out.push({ c: ch, m: '' });
    }
    return out;
  }

  function words(form) {
    return String(form || '').split(/[\s ]+/).filter(function (w) { return w.length; });
  }

  /* ══════════════════════════════════════════════════════════════════
     2 · ΥΠΟΓΡΑΦΕΣ ΚΑΤΑΛΗΞΕΩΝ
     Ό,τι ισχύει για ΚΑΘΕ ρήμα της αρχαίας, ανεξάρτητα από θέμα. Γι' αυτό
     είναι ασφαλής έλεγχος: δεν υποθέτει τίποτα για τη ρίζα.
     ══════════════════════════════════════════════════════════════════ */
  var ENDINGS = {
    act: {
      /* ⚠️ ΤΟ `-ῶ` ΕΛΕΙΠΕ, ΚΑΙ ΔΕΝ ΗΤΑΝ ΕΞΑΙΡΕΣΗ — ΗΤΑΝ ΚΕΝΟ.
         Τα ΣΥΝΗΡΗΜΕΝΑ (δοκῶ, διψῶ, βιῶ, ἐῶ) τελειώνουν σε -ῶ στον
         ενεστώτα, και είναι U+1FF6 — ΑΛΛΟΣ χαρακτήρας από το ω. Κανένα
         συνηρημένο δεν υπήρχε στο corpus ως την als-v514, οπότε το κενό
         δεν είχε φανεί ποτέ. Ο μέλλοντας το είχε ήδη σωστά. */
      ens: { re: /(ω|ῶ|μι)$/,            say: '-ω / -ῶ (συνηρημένο) / -μι' },
      prt: { re: /(ον|ων|ουν|α|ην|ειν)$/,  say: '-ον / -ων / -ουν / -ην' },
      mel: { re: /(ω|ῶ)$/,                say: '-σω / -ξω / -ψω / -ῶ' },
      aor: { re: /(α|ον|ην|ων)$/,          say: '-σα / -α / -ον (β΄) / -ην' },
      prk: { re: /(α)$/,                   say: '-κα ή -α' },
      ypr: { re: /(ειν|η|εσαν)$/,          say: '-κειν / -ειν' }
    },
    mp: {
      ens: { re: /(μαι)$/,      say: '-μαι' },
      prt: { re: /(μην)$/,      say: '-μην' },
      mel: { re: /(μαι)$/,      say: '-σομαι / -οῦμαι / -θήσομαι' },
      aor: { re: /(μην|ην)$/,   say: '-άμην (μέσος) / -θην, -ην (παθητικός)' },
      prk: { re: /(μαι)$/,      say: '-μαι' },
      ypr: { re: /(μην)$/,      say: '-μην' }
    }
  };

  /* Οι ιστορικοί χρόνοι παίρνουν αύξηση. Ελέγχουμε ότι ΤΟΥΛΑΧΙΣΤΟΝ ΕΝΑΣ
     τύπος του κελιού την έχει, όχι όλοι: το φυλλάδιο δίνει συνειδητά και
     αναύξητους δευτερεύοντες τύπους (ἀγηόχειν δίπλα στο ἠγηόχειν). */
  var HISTORIC = { prt: 1, aor: 1, ypr: 1 };
  var AUG_START = ['ἠ', 'ἡ', 'ᾐ', 'ᾑ', 'ἐ', 'ἑ', 'ὠ', 'ὡ', 'ᾠ', 'ᾡ', 'εἰ', 'ηὐ', 'ᾔ', 'ἤ', 'ἦ', 'ἔ', 'ἕ', 'ἥ', 'ἣ'];

  function hasAugment(form, compound) {
    var w = String(form || '');
    if (compound) {
      if (w.indexOf(compound) === 0) w = w.slice(compound.length);
      else return true;                    /* διαφορετική ρίζα — δεν κρίνεται */
    }
    var bare = strip(w), first = bare.charAt(0), ls = letters(w);
    if (!ls.length) return false;
    /* συλλαβική ή χρονική αύξηση: το πρώτο φωνήεν είναι ε, η, ω ή δίφθογγος ει/ηυ */
    if (first === 'ε' || first === 'η' || first === 'ω') return true;
    /* ᾐ / ᾠ: μακρό με υπογεγραμμένη — αύξηση από αι-, οι- */
    if (ls[0].m.indexOf(YPOGEGRAMMENI) >= 0 && (first === 'η' || first === 'ω')) return true;
    return false;
  }

  /* ══════════════════════════════════════════════════════════════════
     3 · AUDIT — ο έλεγχος της μεταγραφής
     Επιστρέφει ΛΙΣΤΑ ΠΡΟΒΛΗΜΑΤΩΝ. Άδεια λίστα = καθαρό.
     ══════════════════════════════════════════════════════════════════ */
  function auditForm(v, voice, tense, form) {
    var out = [], where = v.lemma + ' · ' + D.VOICE_SHORT[voice] + ' ' + D.TENSE_SHORT[tense] + ' · ' + form;
    var ws = words(form), i, ls, w;

    if (!ws.length) { out.push(where + ': κενός τύπος'); return out; }

    for (i = 0; i < ws.length; i++) {
      w = ws[i];
      ls = letters(w);
      if (!ls.length) continue;

      /* μόνο ελληνικά γράμματα */
      if (/[^Ͱ-Ͽἀ-῿̀-ͯͅ]/.test(nfd(w))) {
        out.push(where + ': μη ελληνικός χαρακτήρας');
      }
      /* κάθε λέξη θέλει τόνο */
      if (nfd(w).indexOf(OXEIA) < 0 && nfd(w).indexOf(VAREIA) < 0 && nfd(w).indexOf(PERISPWMENI) < 0) {
        out.push(where + ': λείπει ο τόνος');
      }
      /* αρχικό φωνήεν → υποχρεωτικό πνεύμα. Αυτό πιάνει μονοτονικό κείμενο:
         το «ήγγειλα» δεν έχει ψιλή, το «ἤγγειλα» έχει. */
      if (VOWELS.indexOf(strip(ls[0].c)) >= 0) {
        if (ls[0].m.indexOf(PSILI) < 0 && ls[0].m.indexOf(DASIA) < 0) {
          /* σε δίφθογγο το πνεύμα πάει στο δεύτερο φωνήεν (αἰ-, εἰ-, αὐ-) */
          var second = ls.length > 1 ? ls[1].m : '';
          if (second.indexOf(PSILI) < 0 && second.indexOf(DASIA) < 0) {
            out.push(where + ': λείπει το πνεύμα στο αρχικό φωνήεν');
          }
        }
      }
      /* αρχικό ρ → δασεία */
      if (strip(ls[0].c) === 'ρ' && ls[0].m.indexOf(DASIA) < 0) {
        out.push(where + ': αρχικό ρ χωρίς δασεία');
      }
    }

    /* κατάληξη */
    /* ⭐⭐ ΔΗΛΩΜΕΝΗ ΑΠΟΚΛΙΣΗ, ΟΧΙ ΧΑΛΑΡΩΜΕΝΟΣ ΦΡΟΥΡΟΣ (als-v512).
       Υπάρχουν κελιά που ΝΟΜΙΜΑ σπάνε την υπογραφή της κατάληξης:
         · ΜΕΣΟΣ ΜΕΛΛΟΝΤΑΣ σε ΕΝΕΡΓΗΤΙΚΟ ρήμα — ἀκούσομαι, βήσομαι,
           γνώσομαι. Ενεργητική σημασία, μέσος τύπος.
         · ΑΘΕΜΑΤΙΚΟΣ ΠΑΡΑΤΑΤΙΚΟΣ των ρημάτων σε -μι — ἐδείκνυν.
       ⛔ Η θεραπεία ΔΕΝ είναι να πλατύνουν τα ENDINGS: τότε ο έλεγχος
       σταματάει να πιάνει το ΑΛΗΘΙΝΟ λάθος (ένα *ἀγγελοῦμαι γραμμένο στην
       ενεργητική). Το ρήμα ΔΗΛΩΝΕΙ ρητά ποιο κελί αποκλίνει και ΓΙΑΤΙ, το
       test απαιτεί κάθε δήλωση να είναι γνωστή κατηγορία, και η σελίδα τη
       ΔΕΙΧΝΕΙ — γιατί αυτές ακριβώς οι αποκλίσεις εξετάζονται. */
    if (v && v.dev && v.dev[voice + '.' + tense]) return out;
    var sig = ENDINGS[voice][tense];
    var last = ws[ws.length - 1];
    if (sig && !sig.re.test(last)) {
      out.push(where + ': η κατάληξη δεν ταιριάζει σε ' + D.TENSE_EL[tense] + ' ' + D.VOICE_GEN[voice] + ' (περιμέναμε ' + sig.say + ')');
    }
    return out;
  }

  function audit(v) {
    var out = [], vi, voice, tense, forms, i, j, cell, anyAug;

    if (!v.id || !v.lemma) out.push('ρήμα χωρίς id ή lemma');
    if (!v.fam || !D.FAMS[v.fam]) out.push(v.lemma + ': άγνωστη οικογένεια «' + v.fam + '»');
    if (!v.act && !v.mp) out.push(v.lemma + ': δεν έχει καμία φωνή');

    for (vi = 0; vi < D.VOICES.length; vi++) {
      voice = D.VOICES[vi];
      if (!v[voice]) continue;
      for (i = 0; i < D.TENSES.length; i++) {
        tense = D.TENSES[i];
        forms = v[voice][tense];
        if (forms === null || forms === undefined) continue;
        if (!Array.isArray(forms) || !forms.length) { out.push(v.lemma + ' · ' + voice + '.' + tense + ': το κελί δεν είναι πίνακας τύπων'); continue; }
        anyAug = false;
        for (j = 0; j < forms.length; j++) {
          out = out.concat(auditForm(v, voice, tense, forms[j]));
          if (hasAugment(forms[j], v.compound)) anyAug = true;
        }
        /* ⚠️ Η ΔΗΛΩΜΕΝΗ ΑΠΟΚΛΙΣΗ ΚΑΛΥΠΤΕΙ ΚΑΙ ΤΗΝ ΑΥΞΗΣΗ, γιατί υπάρχει
           πραγματική κατηγορία με ΑΟΡΑΤΗ αύξηση: στο ἀφικνέομαι η αύξηση
           είναι η ΕΚΤΑΣΗ του ι (ἱκνοῦμαι → ἱκνούμην), που δεν γράφεται.
           ⛔ Δεν χαλαρώνει ο έλεγχος — το ΡΗΜΑ δηλώνει το κελί ονομαστικά. */
        if (HISTORIC[tense] && !anyAug && !(v.dev && v.dev[voice + '.' + tense])) {
          out.push(v.lemma + ' · ' + D.VOICE_SHORT[voice] + ' ' + D.TENSE_SHORT[tense] + ': κανένας τύπος δεν έχει αύξηση');
        }
      }
      /* κάθε φωνή που υπάρχει πρέπει να έχει τουλάχιστον ενεστώτα */
      if (!v[voice].ens) out.push(v.lemma + ' · ' + voice + ': φωνή χωρίς ενεστώτα');
    }

    /* τα noDrill πρέπει να δείχνουν σε υπαρκτό κελί */
    if (v.noDrill) {
      for (i = 0; i < v.noDrill.length; i++) {
        cell = v.noDrill[i].split('.');
        if (!v[cell[0]] || !v[cell[0]][cell[1]]) out.push(v.lemma + ': noDrill «' + v.noDrill[i] + '» δεν αντιστοιχεί σε κελί');
      }
    }
    return out;
  }

  function auditAll(verbs) {
    var out = [], seen = {}, i;
    for (i = 0; i < verbs.length; i++) {
      if (seen[verbs[i].id]) out.push('διπλό id: ' + verbs[i].id);
      seen[verbs[i].id] = 1;
      out = out.concat(audit(verbs[i]));
    }
    return out;
  }

  /* ══════════════════════════════════════════════════════════════════
     4 · ΚΕΛΙΑ
     ══════════════════════════════════════════════════════════════════ */
  function cellId(verbId, voice, tense) { return verbId + '.' + voice + '.' + tense; }

  function noDrilled(v, voice, tense) {
    if (!v.noDrill) return false;
    return v.noDrill.indexOf(voice + '.' + tense) >= 0;
  }

  function cellsOf(v) {
    var out = [], vi, voice, i, tense, forms;
    for (vi = 0; vi < D.VOICES.length; vi++) {
      voice = D.VOICES[vi];
      if (!v[voice]) continue;
      for (i = 0; i < D.TENSES.length; i++) {
        tense = D.TENSES[i];
        forms = v[voice][tense];
        if (!forms || !forms.length) continue;
        out.push({
          id: cellId(v.id, voice, tense), verb: v, voice: voice, tense: tense,
          forms: forms, drillable: !noDrilled(v, voice, tense)
        });
      }
    }
    return out;
  }

  function drillCells(verbs) {
    var out = [], i, cs, j;
    for (i = 0; i < verbs.length; i++) {
      cs = cellsOf(verbs[i]);
      for (j = 0; j < cs.length; j++) if (cs[j].drillable) out.push(cs[j]);
    }
    return out;
  }

  /* Η ΣΤΗΛΗ — έξι κελιά στη σειρά που τα λες φωναχτά. Τα άδεια μένουν μέσα
     ως null, γιατί «δεν έχει παρακείμενο» είναι κι αυτό κάτι που ξέρεις. */
  function chain(v, voice) {
    var out = [], i, tense, forms;
    if (!v[voice]) return out;
    for (i = 0; i < D.TENSES.length; i++) {
      tense = D.TENSES[i];
      forms = v[voice][tense];
      out.push({
        id: cellId(v.id, voice, tense), verb: v, voice: voice, tense: tense,
        forms: (forms && forms.length) ? forms : null,
        drillable: !!(forms && forms.length) && !noDrilled(v, voice, tense)
      });
    }
    return out;
  }

  /* ⭐ ΟΤΙ ΓΡΑΦΕΤΑΙ ΜΕΣΑ ΣΤΗΝ ΕΡΩΤΗΣΗ ΔΕΝ ΡΩΤΙΕΤΑΙ ΚΑΙ ΔΕΝ ΠΑΓΙΔΕΥΕΙ.
     Το λήμμα «αἰδέομαι – αἰδοῦμαι» κουβαλάει ολόκληρο τον ενεστώτα του μέσα
     του. Δύο συνέπειες, ίδιος κανόνας: μια ΕΡΩΤΗΣΗ που γράφει την απάντησή
     της («ἀγγέλλω → ενεστώτας;») δεν εξετάζει τίποτα, και μια ΠΑΓΙΔΑ που
     φαίνεται μέσα στο ερώτημα αποκλείεται χωρίς καμία γνώση — άρα οι τέσσερις
     επιλογές γίνονται σιωπηλά δύο. Βρέθηκε κοιτάζοντας ένα render. */
  function lemmaWords(v) {
    var ws = words(v.lemma), out = {}, i;
    for (i = 0; i < ws.length; i++) out[ws[i]] = 1;
    return out;
  }
  function givenAway(v, cell) {
    var lw = lemmaWords(v), i;
    for (i = 0; i < cell.forms.length; i++) if (lw[cell.forms[i]]) return true;
    return false;
  }

  function askLabel(voice, tense) { return D.TENSE_EL[tense] + ' ' + D.VOICE_GEN[voice]; }
  function askShort(voice, tense) { return D.TENSE_SHORT[tense] + ' · ' + D.VOICE_SHORT[voice]; }

  /* ══════════════════════════════════════════════════════════════════
     5 · Η ΠΥΛΗ ΤΗΣ ΜΟΝΑΔΙΚΟΤΗΤΑΣ
     ══════════════════════════════════════════════════════════════════ */
  /* form → cellId, μόνο για τύπους που στέκουν σε ΕΝΑ κελί του ρήματος. */
  function uniqueInVerb(v) {
    var seen = {}, cs = cellsOf(v), i, j, f, out = {};
    for (i = 0; i < cs.length; i++) for (j = 0; j < cs[i].forms.length; j++) {
      f = cs[i].forms[j];
      if (seen[f] === undefined) seen[f] = cs[i].id;
      else if (seen[f] !== cs[i].id) seen[f] = null;
    }
    for (f in seen) if (Object.prototype.hasOwnProperty.call(seen, f) && seen[f]) out[f] = seen[f];
    return out;
  }

  /* form → verbId, για τύπους μοναδικούς σε ΟΛΗ την ύλη. */
  function uniqueGlobal(verbs) {
    var seen = {}, i, cs, j, k, f, out = {};
    for (i = 0; i < verbs.length; i++) {
      cs = cellsOf(verbs[i]);
      for (j = 0; j < cs.length; j++) for (k = 0; k < cs[j].forms.length; k++) {
        f = cs[j].forms[k];
        if (seen[f] === undefined) seen[f] = verbs[i].id;
        else if (seen[f] !== verbs[i].id) seen[f] = null;
      }
    }
    for (f in seen) if (Object.prototype.hasOwnProperty.call(seen, f) && seen[f]) out[f] = seen[f];
    return out;
  }

  /* ══════════════════════════════════════════════════════════════════
     6 · ΕΡΩΤΗΣΕΙΣ
     ══════════════════════════════════════════════════════════════════ */
  function shuffle(arr, rnd) {
    var a = arr.slice(), i, j, t;
    for (i = a.length - 1; i > 0; i--) {
      j = Math.floor((rnd || Math.random)() * (i + 1));
      t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* Γείτονες: αληθινοί τύποι ΑΛΛΩΝ κελιών του ίδιου ρήματος. Προτεραιότητα
     στα κελιά της ίδιας φωνής — εκεί μοιάζουν περισσότερο και εκεί μπερδεύεται. */
  function distractors(v, cell, n, rnd) {
    var cs = cellsOf(v), mine = {}, same = [], other = [], i, j, f;
    var lw = lemmaWords(v);
    for (i = 0; i < cell.forms.length; i++) mine[cell.forms[i]] = 1;
    for (i = 0; i < cs.length; i++) {
      if (cs[i].id === cell.id) continue;
      for (j = 0; j < cs[i].forms.length; j++) {
        f = cs[i].forms[j];
        if (mine[f]) continue;                    /* ποτέ σωστό ως λάθος */
        if (lw[f]) continue;                      /* γράφεται στο ίδιο το ερώτημα */
        (cs[i].voice === cell.voice ? same : other).push(f);
      }
    }
    var pool = shuffle(same, rnd).concat(shuffle(other, rnd)), out = [], seen = {};
    for (i = 0; i < pool.length && out.length < n; i++) {
      if (seen[pool[i]]) continue;
      seen[pool[i]] = 1; out.push(pool[i]);
    }
    return out;
  }

  /* ΠΑΡΑΓΩΓΗ — «ἀγγέλλω → αόριστος ενεργητικής;» */
  function production(v, cell, rnd) {
    if (givenAway(v, cell)) return null;          /* το λήμμα το λέει ήδη */
    var dis = distractors(v, cell, 3, rnd);
    if (dis.length < 2) return null;              /* πολύ φτωχό ρήμα για επιλογές */
    return {
      type: 'prod', cell: cell.id, verb: v, voice: cell.voice, tense: cell.tense,
      prompt: v.lemma, ask: askLabel(cell.voice, cell.tense),
      answers: cell.forms.slice(), answer: cell.forms[0],
      options: shuffle([cell.forms[0]].concat(dis), rnd)
    };
  }

  /* ΑΝΑΓΝΩΡΙΣΗ — «ἤγγειλα — ποιος χρόνος;» Μόνο για μοναδικό τύπο. */
  function reverse(v, cell, rnd) {
    var uniq = uniqueInVerb(v), form = null, i, j;
    for (i = 0; i < cell.forms.length; i++) if (uniq[cell.forms[i]] === cell.id) { form = cell.forms[i]; break; }
    if (!form) return null;

    var cs = cellsOf(v), opts = [{ id: cell.id, label: askShort(cell.voice, cell.tense) }], seen = {};
    seen[cell.id] = 1;
    var pool = shuffle(cs, rnd);
    for (j = 0; j < pool.length && opts.length < 4; j++) {
      if (seen[pool[j].id]) continue;
      seen[pool[j].id] = 1;
      opts.push({ id: pool[j].id, label: askShort(pool[j].voice, pool[j].tense) });
    }
    if (opts.length < 3) return null;
    return {
      type: 'rev', cell: cell.id, verb: v, voice: cell.voice, tense: cell.tense,
      prompt: form, ask: 'σε ποιον χρόνο και φωνή;',
      answers: [cell.id], answer: cell.id,
      options: shuffle(opts, rnd)
    };
  }

  /* ΤΟ ΡΗΜΑ — «ἠγόρευκα — από ποιο ρήμα;» Αυτό ρωτάει το διαγώνισμα: σου
     δίνει τον τύπο, όχι το λήμμα. Μόνο για τύπο μοναδικό σε όλη την ύλη. */
  function whichVerb(verbs, v, cell, rnd) {
    if (verbs.length < 3) return null;
    var uniq = uniqueGlobal(verbs), form = null, i;
    for (i = 0; i < cell.forms.length; i++) if (uniq[cell.forms[i]] === v.id) { form = cell.forms[i]; break; }
    if (!form) return null;

    var others = shuffle(verbs.filter(function (x) { return x.id !== v.id; }), rnd).slice(0, 3);
    if (others.length < 2) return null;
    var opts = [{ id: v.id, label: v.lemma }];
    for (i = 0; i < others.length; i++) opts.push({ id: others[i].id, label: others[i].lemma });
    return {
      type: 'lemma', cell: cell.id, verb: v, voice: cell.voice, tense: cell.tense,
      prompt: form, ask: 'από ποιο ρήμα;',
      answers: [v.id], answer: v.id,
      options: shuffle(opts, rnd)
    };
  }

  /* Σωστό ή όχι. Στις επιλογές συγκρίνουμε ΑΚΡΙΒΩΣ. Στην πληκτρολόγηση
     αγνοούμε τόνους/πνεύματα, γιατί το κινητό δεν τα βγάζει — και το λέμε
     καθαρά στην οθόνη αντί να το κρύψουμε. */
  function correct(q, given, typed) {
    var i;
    if (typed) {
      for (i = 0; i < q.answers.length; i++) if (strip(q.answers[i]) === strip(given)) return true;
      return false;
    }
    for (i = 0; i < q.answers.length; i++) if (q.answers[i] === given) return true;
    return false;
  }

  /* ══════════════════════════════════════════════════════════════════
     7 · ΟΙΚΟΓΕΝΕΙΕΣ
     ══════════════════════════════════════════════════════════════════ */
  function byFamily(verbs) {
    var map = {}, order = [], i, f;
    for (i = 0; i < verbs.length; i++) {
      f = verbs[i].fam;
      if (!map[f]) { map[f] = []; order.push(f); }
      map[f].push(verbs[i]);
    }
    return order.map(function (k) {
      return { fam: k, info: D.FAMS[k], verbs: map[k] };
    });
  }

  return {
    /* πολυτονικό */
    strip: strip, letters: letters, words: words, hasAugment: hasAugment,
    /* έλεγχος */
    ENDINGS: ENDINGS, HISTORIC: HISTORIC, audit: audit, auditAll: auditAll, auditForm: auditForm,
    givenAway: givenAway, lemmaWords: lemmaWords,
    /* κελιά */
    cellId: cellId, cellsOf: cellsOf, drillCells: drillCells, chain: chain,
    askLabel: askLabel, askShort: askShort, noDrilled: noDrilled,
    /* πύλη */
    uniqueInVerb: uniqueInVerb, uniqueGlobal: uniqueGlobal,
    /* ερωτήσεις */
    distractors: distractors, production: production, reverse: reverse, whichVerb: whichVerb,
    correct: correct, shuffle: shuffle,
    /* οικογένειες */
    byFamily: byFamily
  };
}));
