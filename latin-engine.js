/* latin-engine.js — Λατινικά morphology, als-v449.
 *
 * WHY THIS FILE EXISTS SEPARATELY FROM latinika.html
 * Latin morphology is the one thing in this app that is fully deterministic:
 * given a lemma, its genitive (or its four principal parts) and a pattern id,
 * every form is computable. That makes it testable — and it MUST be tested,
 * because a generator that emits a wrong form teaches Alex a wrong form with
 * total confidence. So the rules live here, in a DOM-free module that
 * tests/latin-engine.test.js checks against hand-verified paradigms.
 *
 * THE SAFETY CONTRACT (three rules, do not weaken any of them):
 *   1. A pattern is drillable only if it appears in VERIFIED — and a pattern
 *      only gets into VERIFIED once the test file holds a full hand-checked
 *      paradigm for it. Adding a pattern without its table fails the suite.
 *   2. Irregular verbs are never generated. They are literal tables (IRREGULAR).
 *   3. Reverse-identification questions ("hostium — τι είναι;") are only ever
 *      built from forms that are UNIQUE inside their own paradigm. fugae is
 *      gen.sg AND dat.sg AND nom.pl AND voc.pl, so asking it has no single
 *      right answer. uniqueForms() is what stops the app marking him wrong
 *      for an answer that is in fact correct.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.LatinEngine = api;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var CASES = ['nom', 'gen', 'dat', 'acc', 'voc', 'abl'];
  var NUMBERS = ['sg', 'pl'];
  var TENSES = ['pres', 'impf', 'fut', 'perf', 'plup', 'futp'];
  var VOICES = ['act', 'pass'];

  var CASE_EL = { nom: 'ονομαστική', gen: 'γενική', dat: 'δοτική', acc: 'αιτιατική', voc: 'κλητική', abl: 'αφαιρετική' };
  var CASE_SHORT = { nom: 'ονομ.', gen: 'γεν.', dat: 'δοτ.', acc: 'αιτ.', voc: 'κλητ.', abl: 'αφαιρ.' };
  var NUM_EL = { sg: 'ενικού', pl: 'πληθυντικού' };
  var NUM_SHORT = { sg: 'εν.', pl: 'πληθ.' };
  var TENSE_EL = {
    pres: 'ενεστώτα', impf: 'παρατατικού', fut: 'μέλλοντα',
    perf: 'παρακειμένου', plup: 'υπερσυντελίκου', futp: 'συντ. μέλλοντα'
  };
  var TENSE_SHORT = { pres: 'ΕΝΣ', impf: 'ΠΡΤ', fut: 'ΜΕΛ', perf: 'ΠΡΚ', plup: 'ΥΠΡ', futp: 'ΣΜΛ' };
  var VOICE_EL = { act: 'ενεργητικής', pass: 'παθητικής' };
  var PERSON_EL = ['α΄ ενικό', 'β΄ ενικό', 'γ΄ ενικό', 'α΄ πληθυντικό', 'β΄ πληθυντικό', 'γ΄ πληθυντικό'];
  var PERSON_LAT = ['ego', 'tu', 'is', 'nos', 'vos', 'ii'];

  /* ══════════════════════════════════════════════════════════════════
     ΟΥΣΙΑΣΤΙΚΑ
     Each pattern lists sg then pl in CASES order. A null means "the form is
     the lemma itself" (3rd-declension nominatives, 2nd-declension -er), which
     is exactly where a rule cannot predict the nominative from the stem.
     ══════════════════════════════════════════════════════════════════ */
  var NOUN_PATTERNS = {
    n1:     { decl: 1, gender: 'f', cut: 2,  label: 'Α΄ κλίση',
              sg: ['a', 'ae', 'ae', 'am', 'a', 'a'],
              pl: ['ae', 'arum', 'is', 'as', 'ae', 'is'] },
    n2m:    { decl: 2, gender: 'm', cut: 1,  label: 'Β΄ κλίση · αρσ.',
              sg: ['us', 'i', 'o', 'um', 'e', 'o'],
              pl: ['i', 'orum', 'is', 'os', 'i', 'is'] },
    n2er:   { decl: 2, gender: 'm', cut: 1,  label: 'Β΄ κλίση · αρσ. σε -er',
              sg: [null, 'i', 'o', 'um', null, 'o'],
              pl: ['i', 'orum', 'is', 'os', 'i', 'is'] },
    n2n:    { decl: 2, gender: 'n', cut: 1,  label: 'Β΄ κλίση · ουδ.',
              sg: ['um', 'i', 'o', 'um', 'um', 'o'],
              pl: ['a', 'orum', 'is', 'a', 'a', 'is'] },
    n3mf:   { decl: 3, gender: 'm', cut: 2,  label: 'Γ΄ κλίση · περιττοσύλλαβο',
              sg: [null, 'is', 'i', 'em', null, 'e'],
              pl: ['es', 'um', 'ibus', 'es', 'es', 'ibus'] },
    n3mfi:  { decl: 3, gender: 'm', cut: 2,  label: 'Γ΄ κλίση · ισοσύλλαβο',
              sg: [null, 'is', 'i', 'em', null, 'e'],
              pl: ['es', 'ium', 'ibus', 'es', 'es', 'ibus'],
              alt: { 'pl.acc': 'is' } },
    n3n:    { decl: 3, gender: 'n', cut: 2,  label: 'Γ΄ κλίση · ουδ.',
              sg: [null, 'is', 'i', null, null, 'e'],
              pl: ['a', 'um', 'ibus', 'a', 'a', 'ibus'] },
    n3ni:   { decl: 3, gender: 'n', cut: 2,  label: 'Γ΄ κλίση · ουδ. καθαρό -i',
              sg: [null, 'is', 'i', null, null, 'i'],
              pl: ['ia', 'ium', 'ibus', 'ia', 'ia', 'ibus'] },
    n4m:    { decl: 4, gender: 'm', cut: 2,  label: 'Δ΄ κλίση · αρσ.',
              sg: ['us', 'us', 'ui', 'um', 'us', 'u'],
              pl: ['us', 'uum', 'ibus', 'us', 'us', 'ibus'] },
    n4n:    { decl: 4, gender: 'n', cut: 2,  label: 'Δ΄ κλίση · ουδ.',
              sg: ['u', 'us', 'u', 'u', 'u', 'u'],
              pl: ['ua', 'uum', 'ibus', 'ua', 'ua', 'ibus'] },
    n5:     { decl: 5, gender: 'f', cut: 2,  label: 'Ε΄ κλίση',
              sg: ['es', 'ei', 'ei', 'em', 'es', 'e'],
              pl: ['es', 'erum', 'ebus', 'es', 'es', 'ebus'] }
  };

  /* ══════════════════════════════════════════════════════════════════
     ΡΗΜΑΤΑ — present system. The perfect system is identical for every
     conjugation, so it lives once in PERF_ENDINGS below.
     ══════════════════════════════════════════════════════════════════ */
  var VERB_PATTERNS = {
    v1: { conj: 1, infCut: 3, label: 'Α΄ συζυγία',
      act:  { pres: ['o', 'as', 'at', 'amus', 'atis', 'ant'],
              impf: ['abam', 'abas', 'abat', 'abamus', 'abatis', 'abant'],
              fut:  ['abo', 'abis', 'abit', 'abimus', 'abitis', 'abunt'] },
      pass: { pres: ['or', 'aris', 'atur', 'amur', 'amini', 'antur'],
              impf: ['abar', 'abaris', 'abatur', 'abamur', 'abamini', 'abantur'],
              fut:  ['abor', 'aberis', 'abitur', 'abimur', 'abimini', 'abuntur'] } },

    v2: { conj: 2, infCut: 3, label: 'Β΄ συζυγία',
      act:  { pres: ['eo', 'es', 'et', 'emus', 'etis', 'ent'],
              impf: ['ebam', 'ebas', 'ebat', 'ebamus', 'ebatis', 'ebant'],
              fut:  ['ebo', 'ebis', 'ebit', 'ebimus', 'ebitis', 'ebunt'] },
      pass: { pres: ['eor', 'eris', 'etur', 'emur', 'emini', 'entur'],
              impf: ['ebar', 'ebaris', 'ebatur', 'ebamur', 'ebamini', 'ebantur'],
              fut:  ['ebor', 'eberis', 'ebitur', 'ebimur', 'ebimini', 'ebuntur'] } },

    v3: { conj: 3, infCut: 3, label: 'Γ΄ συζυγία',
      act:  { pres: ['o', 'is', 'it', 'imus', 'itis', 'unt'],
              impf: ['ebam', 'ebas', 'ebat', 'ebamus', 'ebatis', 'ebant'],
              fut:  ['am', 'es', 'et', 'emus', 'etis', 'ent'] },
      pass: { pres: ['or', 'eris', 'itur', 'imur', 'imini', 'untur'],
              impf: ['ebar', 'ebaris', 'ebatur', 'ebamur', 'ebamini', 'ebantur'],
              fut:  ['ar', 'eris', 'etur', 'emur', 'emini', 'entur'] } },

    v3io: { conj: 3, infCut: 3, label: 'Γ΄ συζυγία σε -io',
      act:  { pres: ['io', 'is', 'it', 'imus', 'itis', 'iunt'],
              impf: ['iebam', 'iebas', 'iebat', 'iebamus', 'iebatis', 'iebant'],
              fut:  ['iam', 'ies', 'iet', 'iemus', 'ietis', 'ient'] },
      pass: { pres: ['ior', 'eris', 'itur', 'imur', 'imini', 'iuntur'],
              impf: ['iebar', 'iebaris', 'iebatur', 'iebamur', 'iebamini', 'iebantur'],
              fut:  ['iar', 'ieris', 'ietur', 'iemur', 'iemini', 'ientur'] } },

    v4: { conj: 4, infCut: 3, label: 'Δ΄ συζυγία',
      act:  { pres: ['io', 'is', 'it', 'imus', 'itis', 'iunt'],
              impf: ['iebam', 'iebas', 'iebat', 'iebamus', 'iebatis', 'iebant'],
              fut:  ['iam', 'ies', 'iet', 'iemus', 'ietis', 'ient'] },
      pass: { pres: ['ior', 'iris', 'itur', 'imur', 'imini', 'iuntur'],
              impf: ['iebar', 'iebaris', 'iebatur', 'iebamur', 'iebamini', 'iebantur'],
              fut:  ['iar', 'ieris', 'ietur', 'iemur', 'iemini', 'ientur'] } }
  };

  /* Perfect system — one table, every conjugation, built on the perfect stem. */
  var PERF_ENDINGS = {
    perf: ['i', 'isti', 'it', 'imus', 'istis', 'erunt'],
    plup: ['eram', 'eras', 'erat', 'eramus', 'eratis', 'erant'],
    futp: ['ero', 'eris', 'erit', 'erimus', 'eritis', 'erint']
  };
  /* The alternative 3rd-plural perfect (-ere) that Alex writes above his own
     tables. Accepted as correct input, never offered as the printed answer. */
  var PERF_ALT_3PL = 'ere';
  /* The auxiliary is sum itself, in the matching tense — present for the
     perfect, imperfect for the pluperfect, FUTURE for the future perfect.
     ⚠️ The future of sum ends in -erunt, not -erint: -erint belongs to the
     ACTIVE future perfect of an ordinary verb (nuntiaverint). Writing erint
     here produces "nuntiati erint", which is not a Latin form at all. The
     hand-written table in tests/latin-engine.test.js caught exactly this. */
  var AUX = {
    perf: ['sum', 'es', 'est', 'sumus', 'estis', 'sunt'],
    plup: ['eram', 'eras', 'erat', 'eramus', 'eratis', 'erant'],
    futp: ['ero', 'eris', 'erit', 'erimus', 'eritis', 'erunt']
  };

  /* Patterns whose full paradigm is hand-verified in tests/latin-engine.test.js.
     Anything absent from this list is refused by drillable(). */
  var VERIFIED = {
    n1: 1, n2m: 1, n2er: 1, n2n: 1, n3mf: 1, n3mfi: 1, n3n: 1, n3ni: 1, n4m: 1, n4n: 1, n5: 1,
    v1: 1, v2: 1, v3: 1, v3io: 1, v4: 1
  };

  /* ── helpers ─────────────────────────────────────────────── */
  function stemOf(lemma, gen, pat) {
    if (!gen) return null;
    var g = String(gen).trim();
    if (g.length <= pat.cut) return null;
    return g.slice(0, g.length - pat.cut);
  }
  function endingsFor(pat, num) { return num === 'sg' ? pat.sg : pat.pl; }

  /* ── ΟΥΣΙΑΣΤΙΚΟ ──────────────────────────────────────────── */
  function declineNoun(word) {
    var pat = NOUN_PATTERNS[word && word.pat];
    if (!pat) return null;
    var stem = stemOf(word.lemma, word.gen, pat);
    if (stem === null) return null;
    var out = { sg: {}, pl: {}, stem: stem, pat: word.pat, label: pat.label, gender: word.gender || pat.gender };
    for (var n = 0; n < NUMBERS.length; n++) {
      var num = NUMBERS[n], ends = endingsFor(pat, num);
      for (var c = 0; c < CASES.length; c++) {
        var e = ends[c];
        out[num][CASES[c]] = (e === null) ? word.lemma : stem + e;
      }
    }
    if (pat.alt) {
      out.alt = {};
      for (var k in pat.alt) { if (Object.prototype.hasOwnProperty.call(pat.alt, k)) out.alt[k] = stem + pat.alt[k]; }
    }
    return out;
  }

  /* ── ΡΗΜΑ ────────────────────────────────────────────────── */
  function verbStems(word) {
    var pat = VERB_PATTERNS[word && word.pat];
    if (!pat) return null;
    var inf = String(word.inf || '').trim();
    var perf1 = String(word.perf || '').trim();
    var sup = String(word.sup || '').trim();
    if (inf.length <= pat.infCut) return null;
    var pres = inf.slice(0, inf.length - pat.infCut);
    /* perfect stem = 1st sg minus its -i; supine stem = supine minus -um */
    var pstem = /i$/.test(perf1) ? perf1.slice(0, -1) : null;
    var sstem = /um$/.test(sup) ? sup.slice(0, -2) : null;
    return { pres: pres, perf: pstem, sup: sstem, pat: pat };
  }

  function conjugate(word) {
    var st = verbStems(word);
    if (!st || !st.perf) return null;
    if (word.irregular && IRREGULAR[word.id]) return IRREGULAR[word.id];
    var pat = st.pat, out = { act: {}, pass: {}, stems: st, pat: word.pat, label: pat.label };
    var t, i;

    for (t in pat.act) {
      if (!Object.prototype.hasOwnProperty.call(pat.act, t)) continue;
      out.act[t] = pat.act[t].map(function (e) { return st.pres + e; });
      out.pass[t] = pat.pass[t].map(function (e) { return st.pres + e; });
    }
    for (t in PERF_ENDINGS) {
      if (!Object.prototype.hasOwnProperty.call(PERF_ENDINGS, t)) continue;
      out.act[t] = PERF_ENDINGS[t].map(function (e) { return st.perf + e; });
    }
    /* Passive perfect system is periphrastic: participle + sum / eram / ero.
       Kept as display strings — they are what he has to write on paper. */
    if (st.sup) {
      for (t in AUX) {
        if (!Object.prototype.hasOwnProperty.call(AUX, t)) continue;
        out.pass[t] = AUX[t].map(function (a, idx) {
          return (idx < 3 ? st.sup + 'us, -a, -um ' : st.sup + 'i, -ae, -a ') + a;
        });
      }
      out.participle = st.sup + 'us, -a, -um';
    }
    out.altPerf3pl = st.perf + PERF_ALT_3PL;
    return out;
  }

  /* ── ΑΝΩΜΑΛΑ — literal tables, never generated ───────────── */
  var IRREGULAR = {
    sum: {
      label: 'ανώμαλο', pat: 'irr', irregular: true,
      act: {
        pres: ['sum', 'es', 'est', 'sumus', 'estis', 'sunt'],
        impf: ['eram', 'eras', 'erat', 'eramus', 'eratis', 'erant'],
        fut:  ['ero', 'eris', 'erit', 'erimus', 'eritis', 'erunt'],
        perf: ['fui', 'fuisti', 'fuit', 'fuimus', 'fuistis', 'fuerunt'],
        plup: ['fueram', 'fueras', 'fuerat', 'fueramus', 'fueratis', 'fuerant'],
        futp: ['fuero', 'fueris', 'fuerit', 'fuerimus', 'fueritis', 'fuerint']
      },
      pass: {}
    },
    possum: {
      label: 'ανώμαλο', pat: 'irr', irregular: true,
      act: {
        pres: ['possum', 'potes', 'potest', 'possumus', 'potestis', 'possunt'],
        impf: ['poteram', 'poteras', 'poterat', 'poteramus', 'poteratis', 'poterant'],
        fut:  ['potero', 'poteris', 'poterit', 'poterimus', 'poteritis', 'poterunt'],
        perf: ['potui', 'potuisti', 'potuit', 'potuimus', 'potuistis', 'potuerunt'],
        plup: ['potueram', 'potueras', 'potuerat', 'potueramus', 'potueratis', 'potuerant'],
        futp: ['potuero', 'potueris', 'potuerit', 'potuerimus', 'potueritis', 'potuerint']
      },
      pass: {}
    }
  };

  /* ── ΤΙ ΕΙΝΑΙ ΑΣΦΑΛΕΣ ΝΑ ΡΩΤΗΘΕΙ ─────────────────────────── */

  /* Forms that appear exactly once in a paradigm. Only these can be used for
     "τι είναι αυτός ο τύπος;" — everything else has more than one true answer. */
  function uniqueForms(para) {
    var count = {}, slots = [], i, n, c;
    for (n = 0; n < NUMBERS.length; n++) {
      for (c = 0; c < CASES.length; c++) {
        var f = para[NUMBERS[n]][CASES[c]];
        count[f] = (count[f] || 0) + 1;
        slots.push({ form: f, num: NUMBERS[n], cas: CASES[c] });
      }
    }
    var out = [];
    for (i = 0; i < slots.length; i++) if (count[slots[i].form] === 1) out.push(slots[i]);
    return out;
  }

  function uniqueVerbForms(conj) {
    var count = {}, slots = [], t, v, i;
    for (v = 0; v < VOICES.length; v++) {
      var voice = conj[VOICES[v]] || {};
      for (t in voice) {
        if (!Object.prototype.hasOwnProperty.call(voice, t)) continue;
        for (i = 0; i < voice[t].length; i++) {
          count[voice[t][i]] = (count[voice[t][i]] || 0) + 1;
          slots.push({ form: voice[t][i], voice: VOICES[v], tense: t, person: i });
        }
      }
    }
    var out = [];
    for (i = 0; i < slots.length; i++) if (count[slots[i].form] === 1) out.push(slots[i]);
    return out;
  }

  /* Wrong answers pulled from neighbouring cells of the SAME word, so
     recognition alone never gets him there. Never returns the answer itself,
     never returns duplicates. */
  function distractors(pool, answer, n) {
    var seen = {}, out = [];
    seen[answer] = 1;
    var bag = pool.slice();
    for (var i = bag.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = bag[i]; bag[i] = bag[j]; bag[j] = t; }
    for (var k = 0; k < bag.length && out.length < n; k++) {
      if (!seen[bag[k]]) { seen[bag[k]] = 1; out.push(bag[k]); }
    }
    return out;
  }

  function nounPool(para) {
    var out = [], n, c;
    for (n = 0; n < NUMBERS.length; n++) for (c = 0; c < CASES.length; c++) out.push(para[NUMBERS[n]][CASES[c]]);
    return out;
  }
  function verbPool(conj) {
    var out = [], v, t, i;
    for (v = 0; v < VOICES.length; v++) {
      var voice = conj[VOICES[v]] || {};
      for (t in voice) { if (!Object.prototype.hasOwnProperty.call(voice, t)) continue; for (i = 0; i < voice[t].length; i++) out.push(voice[t][i]); }
    }
    return out;
  }

  /* ── ΚΕΛΙΑ (what mastery is measured on) ─────────────────── */
  /* Deliberately keyed by PATTERN, not by word: "γεν. πληθ. γ΄ κλίσης" is the
     thing he either knows or doesn't, and it should carry over from hostis to
     the next 3rd-declension word he meets. */
  function nounCell(word, num, cas) { return 'n' + (NOUN_PATTERNS[word.pat] ? NOUN_PATTERNS[word.pat].decl : '?') + ':' + cas + ':' + num; }
  function verbCell(word, voice, tense, person) {
    var c = VERB_PATTERNS[word.pat] ? VERB_PATTERNS[word.pat].conj : '?';
    return 'v' + c + ':' + voice + ':' + tense + ':' + person;
  }

  function cellLabel(cell) {
    var p = String(cell).split(':');
    if (p[0].charAt(0) === 'n') return CASE_SHORT[p[1]] + ' ' + NUM_SHORT[p[2]];
    return TENSE_SHORT[p[2]] + ' ' + (p[1] === 'act' ? 'ε.' : 'π.') + ' ' + (+p[3] + 1) + (+p[3] < 3 ? 'εν' : 'πλ');
  }

  function drillable(word) {
    if (!word || !word.pat) return false;
    if (!VERIFIED[word.pat]) return false;
    if (word.kind === 'noun') return !!declineNoun(word);
    if (word.kind === 'verb') return !!conjugate(word);
    return false;
  }

  /* Accepts the alternative 3rd-plural perfect and ignores case / stray
     spacing, but nothing else — a near-miss is still a miss. */
  function normalise(s) {
    return String(s == null ? '' : s).toLowerCase().replace(/[̄́]/g, '')
      .replace(/\s+/g, ' ').trim();
  }
  function isCorrect(given, expected, alt) {
    var g = normalise(given);
    if (!g) return false;
    if (g === normalise(expected)) return true;
    if (alt && g === normalise(alt)) return true;
    return false;
  }

  return {
    CASES: CASES, NUMBERS: NUMBERS, TENSES: TENSES, VOICES: VOICES,
    CASE_EL: CASE_EL, CASE_SHORT: CASE_SHORT, NUM_EL: NUM_EL, NUM_SHORT: NUM_SHORT,
    TENSE_EL: TENSE_EL, TENSE_SHORT: TENSE_SHORT, VOICE_EL: VOICE_EL,
    PERSON_EL: PERSON_EL, PERSON_LAT: PERSON_LAT,
    NOUN_PATTERNS: NOUN_PATTERNS, VERB_PATTERNS: VERB_PATTERNS,
    VERIFIED: VERIFIED, IRREGULAR: IRREGULAR,
    declineNoun: declineNoun, conjugate: conjugate, verbStems: verbStems,
    uniqueForms: uniqueForms, uniqueVerbForms: uniqueVerbForms,
    distractors: distractors, nounPool: nounPool, verbPool: verbPool,
    nounCell: nounCell, verbCell: verbCell, cellLabel: cellLabel,
    drillable: drillable, normalise: normalise, isCorrect: isCorrect
  };
}));
