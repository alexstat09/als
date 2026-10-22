/* ══════════════════════════════════════════════════════════════════════
   tools/latinika/lib.js — ΟΙ ΚΑΝΟΝΕΣ ΤΩΝ ΠΑΚΕΤΩΝ ΛΑΤΙΝΙΚΩΝ, ΜΙΑ ΦΟΡΑ.

   Ένα πακέτο = tools/latinika/lectioNN.json → (build.js) → latinika-lectioNN.html.
   Τους κανόνες εδώ τους διαβάζουν ΚΑΙ το validate.js (σταματάει ΠΡΙΝ γραφτεί
   σελίδα) ΚΑΙ το tests/latinika-lectio.test.js (σε κάθε τρέξιμο). Δύο
   αντίγραφα του ίδιου κανόνα είναι δύο κανόνες με καθυστέρηση (σταθ. 15).

   ⛔ Κανένα dependency, κανένα require πέρα από fs/path (σταθ. 25).
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..', '..');
const DIR = __dirname;

/* ── ονόματα και αριθμοί ─────────────────────────────────────────────── */
function roman(n) {
  const T = [[50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
  let o = '';
  T.forEach(p => { while (n >= p[0]) { o += p[1]; n -= p[0]; } });
  return o;
}
/* Θηλυκό (ενότητες) και ουδέτερο (κείμενα). Ως 40 — η ύλη τελειώνει στο L,
   και από το XVI είναι το πολύ 35 πακέτα. */
const U_F = ['', 'μία', 'δύο', 'τρεις', 'τέσσερις', 'πέντε', 'έξι', 'επτά', 'οκτώ', 'εννέα'];
const U_N = ['', 'ένα', 'δύο', 'τρία', 'τέσσερα', 'πέντε', 'έξι', 'επτά', 'οκτώ', 'εννέα'];
const TEENS_F = { 10: 'δέκα', 11: 'έντεκα', 12: 'δώδεκα', 13: 'δεκατρείς', 14: 'δεκατέσσερις', 15: 'δεκαπέντε', 16: 'δεκαέξι', 17: 'δεκαεπτά', 18: 'δεκαοκτώ', 19: 'δεκαεννέα' };
const TEENS_N = { 10: 'δέκα', 11: 'έντεκα', 12: 'δώδεκα', 13: 'δεκατρία', 14: 'δεκατέσσερα', 15: 'δεκαπέντε', 16: 'δεκαέξι', 17: 'δεκαεπτά', 18: 'δεκαοκτώ', 19: 'δεκαεννέα' };
const TENS = { 2: 'είκοσι', 3: 'τριάντα', 4: 'σαράντα' };
function numWord(n, neuter) {
  const U = neuter ? U_N : U_F, TE = neuter ? TEENS_N : TEENS_F;
  if (n < 10) return U[n];
  if (n < 20) return TE[n];
  const t = Math.floor(n / 10), u = n % 10;
  return TENS[t] + (u ? ' ' + U[u] : '');
}
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
/* «Εννέα» — όπως το γράφει ο τίτλος της βιβλιοθήκης. */
function ordF(n) { return cap(numWord(n, false)); }

/* Φακοί: [ετικέτα, άρθρο]. Η ΙΔΙΑ λίστα με το LENSES του προτύπου. */
const LENS = {
  sub: ['Υποτακτικές', 'τις'], inf: ['Απαρέμφατα', 'τα'], part: ['Μετοχές', 'τις'], dep: ['Αποθετικά', 'τα'],
  verb: ['Ρήματα', 'τα'], noun: ['Ουσιαστικά', 'τα'], adj: ['Επίθετα', 'τα'], pron: ['Αντωνυμίες', 'τις'],
  abl: ['Απόλυτες αφαιρετικές', 'τις'], imp: ['Προσταγές', 'τις']
};

function tefxos(nn) { return nn <= 20 ? 'Α΄' : 'Β΄'; }
/* ⚠️ Δύο ΔΙΑΦΟΡΕΤΙΚΑ ebook: το Α΄ Τεύχος ως το XX, το Β΄ από το XXI. */
function bookUrl(nn) {
  return nn <= 20
    ? 'http://ebooks.edu.gr/ebooks/v/html/8547/2706/Latinika-A_G-Lykeiou-AnthrSp_html-empl/index' + nn + '.htm'
    : 'http://ebooks.edu.gr/ebooks/v/html/8547/2708/Latinika-B_G-Lykeiou-AnthrSp_html-empl/indexB_' + nn + '.html';
}

/* ── αρχεία ──────────────────────────────────────────────────────────── */
const jsonPath = nn => path.join(DIR, 'lectio' + nn + '.json');
const s4ePath = nn => path.join(DIR, 'lectio' + nn + '.s4e.json');
const htmlPath = nn => path.join(REPO, 'latinika-lectio' + nn + '.html');
const srcPath = nn => path.join(REPO, 'tests', 'latinika-lectio' + nn + '.source.txt');
function load(nn) { return JSON.parse(fs.readFileSync(jsonPath(nn), 'utf8')); }
function loadS4e(nn) { return fs.existsSync(s4ePath(nn)) ? JSON.parse(fs.readFileSync(s4ePath(nn), 'utf8')) : null; }
function listPacks() {
  return fs.readdirSync(DIR).map(f => /^lectio(\d+)\.json$/.exec(f)).filter(Boolean).map(m => +m[1]).sort((a, b) => a - b);
}

/* ── η πηγή: σχόλια # · το λατινικό · @@@ · η μετάφραση ─────────────── */
function parseSource(txt) {
  const body = txt.split('\n').filter(l => l.charAt(0) !== '#').join('\n').trim().split('@@@');
  return { text: txt, book: (body[0] || '').trim(), sheet: (body[1] || '').trim() };
}
function readSource(nn) { return fs.existsSync(srcPath(nn)) ? parseSource(fs.readFileSync(srcPath(nn), 'utf8')) : null; }
/* Οι αστερίσκοι είναι παραπομπές του βιβλίου, όχι κείμενο. Κάθε άλλη
   απόκλιση πρέπει να είναι ΔΗΛΩΜΕΝΗ στο `fixes` (π.χ. proximan → proximam). */
function expectBook(book, fixes) {
  let s = book.replace(/\*/g, '');
  (fixes || []).forEach(f => { s = s.split(f.from).join(f.to); });
  return s;
}
const clean = w => w.replace(/[«»"“”.,;:?!*]/g, '');
function stars(book) { return (book.match(/\S+\*/g) || []).map(clean); }

/* ── το πακέτο ───────────────────────────────────────────────────────── */
function units(p) { const o = []; p.S.forEach(sc => sc.s.forEach(u => o.push(u))); return o; }
/* Ο ΙΔΙΟΣ υπολογισμός ετικετών με το πρότυπο (WORDS) — αλλιώς ο αριθμός του
   εξωφύλλου και ο φακός θα έλεγαν άλλο νούμερο. */
function tagsOf(w, M) {
  const lem = w.m && M[w.m], tags = [];
  if (lem) {
    tags.push({ v: 'verb', n: 'noun', a: 'adj', p: 'pron', x: 'akl' }[lem.p]);
    if (lem.dep) tags.push('dep');
  }
  const f = w.f || '';
  if (/υποτ\./.test(f)) tags.push('sub');
  if (/απαρ\./.test(f)) tags.push('inf');
  if (/μτχ\./.test(f)) tags.push('part');
  /* η απόλυτη αφαιρετική σημαδεύεται στο f της λέξης-πυρήνα (XXI: Brenno duce = χωρίς μετοχή) */
  if (/απόλ\. αφαιρ\./.test(f)) tags.push('abl');
  /* XXV: προστακτική ή απαγόρευση (nolite + απαρ. · ne/nemo + υποτ. παρακ.) — σημάδι «απαγόρ.» στο f */
  if (/προστ\.|απαγόρ\./.test(f)) tags.push('imp');
  return tags;
}
function words(p) {
  const o = [];
  units(p).forEach((u, ui) => u.la.forEach((w, i) => o.push(Object.assign({ u: ui, i, tags: tagsOf(w, p.M) }, w))));
  return o;
}
function lensWords(p, k) { return words(p).filter(w => w.tags.includes(k)); }
const joinLa = S => S.map(sc => sc.s.map(u => u.la.map(w => w.w).join(' ')).join(' ')).join(' ');
const joinGr = S => S.map(sc => sc.s.map(u => u.gr.map(g => g.t).join(' ')).join(' ')).join(' ');

/* ── κανονικοποίηση για σύγκριση με το study4exams ──────────────────────
   Τα μακρά/βραχέα ΔΕΝ μετράνε (το s4e γράφει «venῑre» με ΕΛΛΗΝΙΚΟ ῑ). */
function norm(s) {
  return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ι/g, 'i')
    .toLowerCase().replace(/[—–‒]/g, '-').replace(/\s+/g, '');
}

/* Πρώτη διαφορά δύο κειμένων, σε λέξεις — το μήνυμα λέει ΠΟΥ, όχι μόνο «διαφέρει». */
function firstDiff(a, b) {
  const A = a.split(' '), B = b.split(' ');
  for (let i = 0; i < Math.max(A.length, B.length); i++) {
    if (A[i] !== B[i]) return 'λέξη ' + (i + 1) + ': πηγή «' + (B[i] || '∅') + '», πακέτο «' + (A[i] || '∅') + '» (… ' + A.slice(Math.max(0, i - 3), i).join(' ') + ' …)';
  }
  return '';
}

const GREEK = /[Ͱ-Ͽἀ-῿]/;
/* Τα είδη αντωνυμιών — η ΙΔΙΑ σειρά με το catOf του προτύπου. */
const PRON_KINDS = ['προσωπική', 'δεικτική', 'οριστική', 'κτητική', 'ερωτηματική', 'αναφορική', 'αόριστη'];
/* Emoji / σύμβολα διεπαφής (CLAUDE.md §④). Τα βελάκια → ↔ ΕΠΙΤΡΕΠΟΝΤΑΙ: είναι
   σημειογραφία του συντακτικού, όχι διακόσμηση. */
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}⭐️]/u;

/* ══ ΟΙ ΚΑΝΟΝΕΣ ═══════════════════════════════════════════════════════════
   Επιστρέφει ΟΛΟΥΣ τους ελέγχους ως [{ok, msg}] — το test μετράει κάθε έναν,
   το validate τυπώνει μόνο όσους πέφτουν. ctx = {src, s4e}. */
function rules(p, ctx) {
  ctx = ctx || {};
  const out = [];
  const R = roman(p.nn);
  const ok = (c, m) => out.push({ ok: !!c, msg: R + ': ' + m });
  const M = p.M || {}, CL = p.CL || {}, NT = p.NOTE_T || {};
  const noteIds = (p.notes || []).map(n => n.id);

  ok(Number.isInteger(p.nn) && p.nn >= 16 && p.nn <= 50, 'το nn είναι αριθμός μαθήματος (16–50)');
  ['ordinal', 'h1', 'lead', 'face', 'row', 'S', 'M', 'CL', 'NOTE_T', 'traps', 'notes', 'notesSub', 'foot'].forEach(k =>
    ok(p[k] != null, 'υπάρχει το πεδίο «' + k + '»'));
  ok(p.face && LENS[p.face.lens], 'ο φακός του εξωφύλλου (' + (p.face && p.face.lens) + ') είναι ένας από ' + Object.keys(LENS).join('/'));

  /* ── 1 · βιβλίο και φυλλάδιο, αυτολεξεί ── */
  const src = ctx.src;
  ok(!!src, 'υπάρχει η πηγή tests/latinika-lectio' + p.nn + '.source.txt (fetch-book)');
  if (src) {
    const exp = expectBook(src.book, p.fixes), got = joinLa(p.S);
    ok(got === exp, '⛔ τα λατινικά ενωμένα ≠ βιβλίο · ' + firstDiff(got, exp));
    (p.fixes || []).forEach(f => {
      ok(src.book.indexOf(f.from) >= 0, 'η δηλωμένη διόρθωση «' + f.from + '→' + f.to + '» βρίσκει το τυπογραφικό στην πηγή (αλλιώς είναι σιωπηλό no-op)');
      ok(!!f.why, 'η διόρθωση «' + f.from + '» λέει γιατί');
    });
    const sheetReady = src.sheet && !/^ΣΥΜΠΛΗΡΩΣΕ/.test(src.sheet);
    ok(sheetReady, 'η μετάφραση του φυλλαδίου υπάρχει στο source.txt (μετά το @@@)');
    if (sheetReady) ok(joinGr(p.S) === src.sheet, '⛔ τα ελληνικά ενωμένα ≠ φυλλάδιο · ' + firstDiff(joinGr(p.S), src.sheet));
    ok(!/\s{2}/.test(src.sheet), 'καμία διπλή κενή στη μετάφραση της πηγής');
  }

  /* ── 2 · κάθε λέξη ── */
  const usedM = {}, usedQ = {};
  units(p).forEach((u, ui) => {
    const tag = 'ενότητα ' + (ui + 1);
    const laG = {};
    u.la.forEach(w => {
      const t = tag + ' «' + w.w + '»';
      ok(!!w.w && !!w.d && !!w.x, t + ': έχει λέξη, μετάφραση ΚΑΙ συντακτικό');
      ok(Number.isInteger(w.g) && w.g > 0, t + ': έχει ομάδα g');
      laG[w.g] = 1;
      ok(!!w.m && !!M[w.m], t + ': το m («' + w.m + '») είναι λήμμα που υπάρχει στο M');
      ok(CL[w.q] != null, t + ': το q (' + w.q + ') είναι πρόταση που υπάρχει στο CL');
      if (M[w.m]) { usedM[w.m] = 1; if (M[w.m].p !== 'x') ok(!!w.f, t + ': κλιτή λέξη με ΤΥΠΟ (f)'); }
      usedQ[w.q] = 1;
      (w.n || []).forEach(k => ok(NT[k] != null && noteIds.indexOf(k) >= 0, t + ': η σημείωση «' + k + '» υπάρχει (NOTE_T + notes)'));
      ok(!EMOJI.test([w.w, w.d, w.x, w.f || ''].join(' ')), t + ': κανένα emoji');
    });
    u.gr.forEach(g => {
      ok(typeof g.t === 'string' && g.t.length > 0, tag + ': ελληνικό κομμάτι με κείμενο');
      if (g.g) ok(laG[g.g] === 1, tag + ': ⛔ ορφανό g ' + g.g + ' («' + g.t + '») — δεν υπάρχει στα λατινικά');
    });
  });

  /* ── 3 · λήμματα, προτάσεις, σημειώσεις ── */
  Object.keys(M).forEach(k => {
    const L = M[k];
    ok(['v', 'n', 'a', 'p', 'x'].indexOf(L.p) >= 0, 'λήμμα ' + k + ': p ∈ v/n/a/p/x');
    ok(!!L.l && !!L.k, 'λήμμα ' + k + ': έχει l και k');
    ok(!GREEK.test(L.l), '⛔ λήμμα ' + k + ': ελληνικά μέσα στο l («' + L.l + '») — τυπώνεται σε λατινικό serif → Georgia (als-v504)');
    if (L.p === 'n') ok(!!L.g, 'λήμμα ' + k + ': ουσιαστικό με γένος');
    /* Η «Κατά κατηγορία» της Γραμματικής ομαδοποιεί ΑΠΟ ΤΟ k — ένα k εκτός
       σχήματος θα έπεφτε σιωπηλά σε ομάδα «άλλα». */
    if (L.p === 'v') ok(/^[αβγδ]΄ συζυγία/.test(L.k) || /^(βοηθητικό|ανώμαλο|ελλειπτικό)/.test(L.k),
      'λήμμα ' + k + ': το k («' + L.k + '») ξεκινά με «α΄/β΄/γ΄/δ΄ συζυγία» ή «βοηθητικό/ανώμαλο/ελλειπτικό»');
    if (L.p === 'n' || L.p === 'a') ok(/^[αβγδε]΄ κλίση/.test(L.k), 'λήμμα ' + k + ': το k («' + L.k + '») ξεκινά με «α΄…ε΄ κλίση»');
    if (L.p === 'p') ok(PRON_KINDS.indexOf(L.k.split(/[\s-]/)[0]) >= 0,
      'λήμμα ' + k + ': το k («' + L.k + '») ξεκινά με είδος αντωνυμίας (' + PRON_KINDS.join('/') + ')');
    ok(!EMOJI.test(JSON.stringify(L)), 'λήμμα ' + k + ': κανένα emoji');
    ok(usedM[k] === 1, 'λήμμα ' + k + ': το χρησιμοποιεί κάποια λέξη (αλλιώς είναι νεκρό)');
  });
  Object.keys(CL).forEach(q => {
    ok(CL[q].d === 0 || CL[q].d === 1, 'πρόταση ' + q + ': d = 0 (κύρια) ή 1 (δευτερεύουσα)');
    ok(!!CL[q].t && !!CL[q].s, 'πρόταση ' + q + ': έχει t και s');
    ok(usedQ[q] === 1, 'πρόταση ' + q + ': ανήκει σε κάποια λέξη');
  });
  Object.keys(NT).forEach(k => ok(noteIds.indexOf(k) >= 0, 'NOTE_T «' + k + '»: έχει κάρτα στις σημειώσεις'));
  noteIds.forEach(k => ok(NT[k] != null, 'σημείωση «' + k + '»: έχει τίτλο στο NOTE_T'));
  (p.notes || []).forEach(n => ok(!!n.id && !!n.src && !!n.h4 && Array.isArray(n.body) && n.body.length > 0, 'σημείωση «' + n.id + '»: id, src, h4, body'));
  ok((p.traps || []).length > 0, 'υπάρχει τουλάχιστον μία παγίδα');
  (p.traps || []).forEach((t, i) => ok(!!t.lat && !!t.fix && !!t.why, 'παγίδα ' + (i + 1) + ': lat, fix, why'));

  /* ── 4 · ο φακός του εξωφύλλου == οι λέξεις με αστερίσκο ── */
  if (src && p.face && LENS[p.face.lens]) {
    const st = stars(src.book);
    if (st.length) {
      const lw = lensWords(p, p.face.lens).map(w => clean(w.w));
      ok(lw.join(' ') === st.join(' '), '⛔ ' + LENS[p.face.lens][0].toLowerCase() + ' ≠ λέξεις με αστερίσκο · πακέτο: ' + lw.join(' ') + ' · βιβλίο: ' + st.join(' '));
    }
  }

  /* ── 5 · αρχικοί χρόνοι και γένη απέναντι στο study4exams ── */
  const s4e = ctx.s4e, diffs = p.s4eDiffs || {};
  if (s4e) {
    const seen = {};
    const byNorm = {}; Object.keys(M).forEach(k => { byNorm[norm(k)] = k; });
    Object.keys(s4e.v || {}).forEach(dk => {
      const k = byNorm[dk], L = k && M[k]; if (!L) return; seen[k] = 1;
      if (L.p !== 'v') return;
      const D = s4e.v[dk], same = norm(L.l) === norm(D.l);
      ok(same || !!diffs[k], '⛔ αρχικοί χρόνοι του ' + k + ': πακέτο «' + L.l + '» · s4e «' + D.l + '» — διόρθωσε ή δήλωσε s4eDiffs.' + k);
      if (same) ok(!diffs[k], 'το s4eDiffs.' + k + ' είναι μπαγιάτικο — πια συμφωνούν');
      if (D.conj) ok(L.k.indexOf(D.conj) === 0 || !!diffs[k], '⛔ συζυγία του ' + k + ': πακέτο «' + L.k + '» · s4e «' + D.conj + '»');
    });
    Object.keys(s4e.n || {}).forEach(dk => {
      const k = byNorm[dk], L = k && M[k], D = s4e.n[dk]; if (!L) return; seen[k] = 1;
      if (L.p !== 'n') return;
      const [ml, mg] = splitLemma(L.l), [dl, dg] = splitLemma(D.l);
      const genOk = norm(ml) === norm(dl) && (norm(mg) === norm(dg) || (dg.charAt(0) === '-' && norm(mg).replace(/^-/, '').endsWith(norm(dg).slice(1))));
      ok(genOk || !!diffs[k], '⛔ ' + k + ': ονομ.–γεν. πακέτο «' + L.l + '» · s4e «' + D.l + '»');
      ok((L.g || '').indexOf(D.g) === 0 || !!diffs[k], '⛔ γένος του ' + k + ': πακέτο «' + L.g + '» · s4e «' + D.g + '»');
      if (D.decl) ok(L.k.indexOf(D.decl) === 0 || !!diffs[k], '⛔ κλίση του ' + k + ': πακέτο «' + L.k + '» · s4e «' + D.decl + '»');
    });
    Object.keys(diffs).forEach(k => ok(seen[k] === 1, 's4eDiffs.' + k + ': το λήμμα υπάρχει στο πρόχειρο του s4e'));
  }
  return out;
}
function splitLemma(l) {
  const s = String(l).trim();
  const i = s.search(/,|\s-/);
  return i < 0 ? [s, ''] : [s.slice(0, i), s.slice(i).replace(/^,?\s*/, '')];
}

/* ══ ΤΑ ΕΙΔΙΚΑ ΤΟΥ ΚΑΘΕ ΚΕΙΜΕΝΟΥ — `checks` του JSON ══════════════════
   Ό,τι ήταν χειρόγραφη βεβαίωση για ένα μόνο πακέτο ζει πλέον στο ΔΙΚΟ ΤΟΥ
   JSON, και τρέχει από εδώ. Νέο κείμενο = μηδέν γραμμές στο test. */
function runChecks(p, html, src) {
  const out = [], C = p.checks || {}, R = roman(p.nn);
  const ok = (c, m) => out.push({ ok: !!c, msg: R + ': ' + m });
  const U = units(p), W = words(p), M = p.M;
  if (C.scenes != null) ok(p.S.length === C.scenes, C.scenes + ' σκηνές (' + p.S.length + ')');
  if (C.units != null) ok(U.length === C.units, C.units + ' ενότητες (' + U.length + ')');
  if (C.verbs != null) { const n = W.filter(w => M[w.m] && M[w.m].p === 'v').length; ok(n === C.verbs, C.verbs + ' ρηματικοί τύποι στη Γραμματική (' + n + ')'); }
  if (C.notes != null) ok((p.notes || []).length === C.notes, C.notes + ' κάρτες σημειώσεων');
  if (src) {
    if (C.stars != null) ok((src.book.match(/\*/g) || []).length === C.stars, 'η πηγή κρατάει ' + C.stars + ' αστερίσκους');
    if (C.sha) ok(src.text.indexOf(C.sha) > 0, 'η πηγή καρφώνει το sha256 του κατεβάσματος');
    (C.srcHas || []).forEach(s => ok(src.text.indexOf(s) > 0, 'η πηγή γράφει «' + s + '»'));
    (C.sheetHas || []).forEach(s => ok(src.sheet.indexOf(s) >= 0, 'η μετάφραση κρατάει «' + s + '»'));
  }
  if (C.lens) ok(lensWords(p, p.face.lens).map(w => clean(w.w)).join(' ') === C.lens, 'ο φακός του εξωφύλλου ανάβει ΑΚΡΙΒΩΣ: ' + C.lens);
  Object.keys(C.parts || {}).forEach(k => ok(M[k] && M[k].l === C.parts[k], 'αρχικοί χρόνοι του ' + k + ' == η δεύτερη, ανεξάρτητη γραφή'));
  Object.keys(C.gender || {}).forEach(k => ok(M[k] && M[k].g === C.gender[k], 'το ' + k + ' είναι ' + C.gender[k]));
  Object.keys(C.decl || {}).forEach(k => ok(M[k] && M[k].k.indexOf(C.decl[k]) === 0, 'το ' + k + ' είναι ' + C.decl[k] + ' κλίσης'));
  (C.dep || []).forEach(k => ok(M[k] && M[k].dep === 1, k + ' = αποθετικό (φακός «Αποθετικά»)'));
  (C.forms || []).forEach(r => {
    const re = new RegExp(r.w), hit = W.filter(w => re.test(w.w) && w.tags.includes(p.face.lens));
    ok(hit.length > 0 && hit.every(w => new RegExp(r.f).test(w.f) && (r.x || []).every(s => w.x.indexOf(s) >= 0)),
      '/' + r.w + '/ = ' + r.f + (r.x ? ' · και το συντακτικό λέει ' + r.x.join(' + ') : ''));
  });
  if (html) {
    (C.html || []).forEach(s => ok(html.indexOf(s) > 0, 'η σελίδα γράφει «' + s.slice(0, 60) + '»'));
    (C.htmlRe || []).forEach(s => ok(new RegExp(s).test(html), 'η σελίδα ταιριάζει /' + s.slice(0, 60) + '/'));
  }
  return out;
}

module.exports = {
  REPO, DIR, roman, numWord, ordF, LENS, tefxos, bookUrl,
  jsonPath, s4ePath, htmlPath, srcPath, load, loadS4e, listPacks,
  parseSource, readSource, expectBook, clean, stars,
  units, words, tagsOf, lensWords, joinLa, joinGr, norm, firstDiff,
  rules, runChecks, splitLemma, GREEK, EMOJI, PRON_KINDS
};
