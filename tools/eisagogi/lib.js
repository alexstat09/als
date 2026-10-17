/* ══════════════════════════════════════════════════════════════════════
   tools/eisagogi/lib.js — Η ΕΙΣΑΓΩΓΗ: ΟΙ ΚΑΝΟΝΕΣ, ΜΙΑ ΦΟΡΑ.

   tools/eisagogi/eisagogi.json → (build.js) → latinika-eisagogi.html.
   Κάθε σημάδι είναι ΔΕΙΚΤΗΣ σε θέση της πηγής ({l,t,n}), ποτέ δικό του
   κείμενο. Τους κανόνες εδώ τους τρέχουν ΚΑΙ το validate.js ΚΑΙ το test.
   ⛔ Κανένα require πέρα από fs/path (σταθ. 25).
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..', '..');
const SRC = path.join(REPO, 'tests', 'latinika-eisagogi.source.txt');

function readSource() {
  const L = fs.readFileSync(SRC, 'utf8').split('\n');
  if (L[L.length - 1] === '') L.pop();
  return L;
}
function load() { return JSON.parse(fs.readFileSync(path.join(__dirname, 'eisagogi.json'), 'utf8')); }

/* n-οστή εμφάνιση του t στη γραμμή — ΙΔΙΑ συνάρτηση με του προτύπου */
function find(line, t, n) {
  let at = -1, from = 0;
  for (let k = 0; k <= (n || 0); k++) {
    at = line.indexOf(t, from);
    if (at < 0) return -1;
    from = at + t.length;
  }
  return at;
}
const isPtr = o => o && typeof o === 'object' && typeof o.l === 'number' && typeof o.t === 'string';
const KINDS = ['gr', 'ro', 'la', 'date', 'st', 'ax', 'wk', 'era'];

/* ══ ΟΙ ΜΟΝΑΔΕΣ ΚΑΘΕ ΚΕΦΑΛΑΙΟΥ — με την ΙΔΙΑ σειρά και τις ΙΔΙΕΣ θέσεις
   χαρακτήρων με την als-v579. Οι πλαγιότιτλοι/ορισμοί του είναι
   αποθηκευμένοι ως {s,e} μέσα σε αυτό το κείμενο: αν αλλάξει έστω ένας
   χαρακτήρας, κάθε σημείωσή του μετακινείται σιωπηλά. ══ */
function unitLines(d, ch) {
  const out = [];
  const per = id => (d.people.find(p => p.id === id) || { ls: [] }).ls;
  ch.blocks.forEach(B => {
    if (B.b === 'p') out.push(B.l);
    else if (B.b === 'num') B.ls.forEach(l => out.push(l));
    else if (B.b === 'dots') B.items.forEach(it => { out.push(it.l); (it.more || []).forEach(l => out.push(l)); });
    else if (B.b === 'genre') B.ls.forEach(l => out.push(l));
    else if (B.b === 'per') per(B.who).forEach(l => out.push(l));
  });
  return out;
}
/* το κείμενο μιας μονάδας = η γραμμή ΧΩΡΙΣ τους δείκτες υποσημείωσης */
function plainOf(d, src, l) {
  let t = src[l - 1];
  (d.sups || []).filter(s => s.l === l).forEach(s => {
    const at = find(t, s.t, s.n);
    if (at >= 0) t = t.slice(0, at) + t.slice(at + s.t.length);
  });
  return t;
}
function chapterFull(d, src, ch) { return unitLines(d, ch).map(l => plainOf(d, src, l)).join('\n\n'); }

/* Όλοι οι έλεγχοι. Επιστρέφει λίστα σφαλμάτων· άδεια = χτίζεται. */
function validate(d, src) {
  const errs = [];
  function chk(p, where) {
    const line = src[p.l - 1];
    if (line == null) { errs.push(where + ': η γραμμή ' + p.l + ' δεν υπάρχει'); return -1; }
    if (!p.t) { errs.push(where + ': κενό κείμενο'); return -1; }
    const at = find(line, p.t, p.n);
    if (at < 0) errs.push(where + ': «' + p.t + '» ΔΕΝ βρίσκεται αυτολεξεί στη γραμμή ' + p.l + (p.n ? ' (εμφάνιση ' + (p.n + 1) + ')' : ''));
    return at;
  }
  /* 1. κάθε δείκτης, οπουδήποτε μέσα στο JSON */
  (function walk(o, where) {
    if (Array.isArray(o)) return o.forEach((x, i) => walk(x, where + '[' + i + ']'));
    if (!o || typeof o !== 'object') return;
    if (isPtr(o)) chk(o, where);
    Object.keys(o).forEach(k => { if (k !== 'marks') walk(o[k], where + '.' + k); });
  })(d, '');

  /* 2. τα σημάδια: υπάρχουν, δεν επικαλύπτονται, οι χρονολογίες λένε ό,τι γράφει το κείμενο */
  Object.keys(d.marks || {}).forEach(l => {
    const spans = [];
    d.marks[l].forEach((m, i) => {
      const w = 'marks.' + l + '[' + i + ']';
      if (KINDS.indexOf(m.k) < 0) errs.push(w + ': άγνωστο είδος «' + m.k + '»');
      const at = chk({ l: +l, t: m.t, n: m.n }, w);
      if (at >= 0) spans.push([at, at + m.t.length, m.t]);
      if (m.k === 'la' && /[Ͱ-Ͽἀ-῿]/.test(m.t)) errs.push(w + ': λατινικός όρος με ελληνικά γράμματα — η Instrument Serif δεν έχει ελληνικά');
      if (m.k !== 'la' && /^[A-Za-z ]+$/.test(m.t)) errs.push(w + ': λατινικοί χαρακτήρες σε σημάδι «' + m.k + '» — θέλει «la»');
      if (m.k === 'date') {
        if (typeof m.y !== 'number') errs.push(w + ': χρονολογία χωρίς y');
        [[m.y, m.c], [m.y2, m.c2]].forEach(([y, c]) => {
          if (y === undefined) return;
          if (c !== undefined) {
            if (m.t.indexOf(String(c)) < 0) errs.push(w + ': ο αιώνας ' + c + ' δεν γράφεται στο «' + m.t + '»');
            if (Math.abs(y) !== c * 100 - 50) errs.push(w + ': ο αιώνας ' + c + ' πρέπει να γίνει μέσα του (±' + (c * 100 - 50) + ')');
          } else if (m.t.indexOf(String(Math.abs(y))) < 0) errs.push(w + ': το έτος ' + y + ' δεν γράφεται στο «' + m.t + '»');
          if (m.t.indexOf(y < 0 ? 'π.Χ.' : 'μ.Χ.') < 0) errs.push(w + ': λάθος πρόσημο για ' + y);
        });
      }
    });
    spans.sort((a, b) => a[0] - b[0]);
    for (let i = 1; i < spans.length; i++)
      if (spans[i][0] < spans[i - 1][1]) errs.push('marks.' + l + ': επικάλυψη «' + spans[i - 1][2] + '» / «' + spans[i][2] + '»');
  });

  /* 3. κάθε άκρο ζεύγους είναι σημάδι του σωστού είδους, και τα δύο στην ΙΔΙΑ γραμμή */
  const isMark = (p, k) => (d.marks[p.l] || []).some(m => m.t === p.t && (m.n || 0) === (p.n || 0) && m.k === k);
  (d.pairs || []).forEach((p, i) => {
    if (p.gr.l !== p.ro.l) errs.push('ζεύγος ' + i + ': πρότυπο και μιμητής σε διαφορετικές γραμμές');
    if (!isMark(p.gr, 'gr')) errs.push('ζεύγος ' + i + ': «' + p.gr.t + '» δεν είναι σημάδι ελληνικού προτύπου');
    if (!isMark(p.ro, 'ro')) errs.push('ζεύγος ' + i + ': «' + p.ro.t + '» δεν είναι σημάδι Ρωμαίου');
  });

  /* 4. η ταινία */
  const ats = d.band.ticks.map(t => t.at);
  d.band.ticks.forEach((t, i) => {
    const want = t.cent ? String(t.cent) : String(Math.abs(t.at));
    if (t.p.t.indexOf(want) < 0) errs.push('band.ticks[' + i + ']: το ' + t.at + ' δεν διαβάζεται στο «' + t.p.t + '»');
  });
  d.band.eras.forEach((e, i) => {
    if (ats.indexOf(e.a) < 0 || ats.indexOf(e.b) < 0) errs.push('band.eras[' + i + ']: άκρο εκτός άξονα');
    if (!(e.b > e.a)) errs.push('band.eras[' + i + ']: αρνητική διάρκεια');
  });
  d.chapters.forEach(c => { if (c.era && (ats.indexOf(c.era[0]) < 0 || ats.indexOf(c.era[1]) < 0)) errs.push('κεφ. ' + c.n + ': άκρο εκτός άξονα'); });

  /* 5. ο συγκριτικός πίνακας: η ετικέτα γραμμής ανοίγει ΚΑΘΕ κελί */
  d.compare.rows.forEach((r, i) => r.cells.forEach((cell, j) => {
    const first = src[cell[0] - 1] || '';
    if (first.slice(0, 60).indexOf(r.label) < 0) errs.push('compare.rows[' + i + '] κελί ' + j + ': η ετικέτα «' + r.label + '» δεν ανοίγει τη γραμμή ' + cell[0]);
  }));

  /* 6. ΚΑΘΕ γραμμή της πηγής μπαίνει ΑΚΡΙΒΩΣ ΜΙΑ φορά στα κεφάλαια */
  const used = {};
  const use = (l, w) => { used[l] = (used[l] || []).concat(w); };
  const ppl = {}; d.people.forEach(p => { ppl[p.id] = p; });
  d.chapters.forEach(ch => ch.blocks.forEach(B => {
    const w = 'κεφ. ' + ch.n;
    if (B.l) use(B.l, w);
    (B.ls || []).forEach(l => use(l, w));
    (B.items || []).forEach(it => { if (it.l) { use(it.l, w); (it.more || []).forEach(l => use(l, w)); } });
    if (B.fig) use(B.fig, w);
    if (B.b === 'per') {
      if (!ppl[B.who]) errs.push(w + ': άγνωστο πρόσωπο «' + B.who + '»');
      else { ppl[B.who].ls.forEach(l => use(l, w)); if (ppl[B.who].fig) use(ppl[B.who].fig, w); }
    }
    (B.people || []).forEach(id => { if (!ppl[id]) errs.push(w + ': άγνωστο πρόσωπο «' + id + '»'); });
  }));
  for (let l = 1; l <= src.length; l++) {
    if (!used[l]) errs.push('η γραμμή ' + l + ' της πηγής ΔΕΝ μπαίνει πουθενά');
    else if (used[l].length > 1) errs.push('η γραμμή ' + l + ' μπαίνει ' + used[l].length + ' φορές (' + used[l].join(', ') + ')');
  }
  /* μια γραμμή μένει μέσα στο κεφάλαιο που δηλώνει */
  d.chapters.forEach(ch => Object.keys(used).forEach(l => {
    if (used[l][0] === 'κεφ. ' + ch.n && (l < ch.lines[0] || l > ch.lines[1])) errs.push('η γραμμή ' + l + ' είναι έξω από το κεφ. ' + ch.n);
  }));

  /* 7. τα πρόσωπα: τα ονόματά τους υπάρχουν, κάθε όνομα-δείκτης είναι σημάδι Ρωμαίου */
  d.people.forEach(P => {
    P.forms.forEach(f => { if (!src.some(l => l.indexOf(f) >= 0)) errs.push('πρόσωπο ' + P.id + ': η μορφή «' + f + '» δεν υπάρχει στην πηγή'); });
    if (P.forms.indexOf(P.name.t) < 0) errs.push('πρόσωπο ' + P.id + ': το όνομα δεν είναι στις μορφές του');
    if (!d.chapters.some(c => c.n === P.ch)) errs.push('πρόσωπο ' + P.id + ': άγνωστο κεφάλαιο');
  });
  return errs;
}

/* ΟΛΕΣ οι αναφορές ενός προσώπου στο κείμενο (όχι λεζάντες/υποσημειώσεις).
   Οι μορφές είναι φωλιασμένες («Κικέρων» ⊂ «Κικέρωνα») — η μακρύτερη πρώτα
   και σημαδεύεται ΟΛΟ το εύρος, αλλιώς μετριέται δύο φορές. ΙΔΙΑ με του προτύπου. */
function mentions(d, src, P) {
  const skip = (d.figs || []).concat(d.fns || []), out = [];
  const forms = P.forms.slice().sort((a, b) => b.length - a.length);
  src.forEach((line, i) => {
    if (skip.indexOf(i + 1) >= 0) return;
    const taken = {};
    forms.forEach(f => {
      let from = 0, at;
      while ((at = line.indexOf(f, from)) >= 0) {
        let free = true;
        for (let z = at; z < at + f.length; z++) if (taken[z]) free = false;
        if (free) { for (let z = at; z < at + f.length; z++) taken[z] = 1; out.push({ l: i + 1, at: at, len: f.length }); }
        from = at + f.length;
      }
    });
  });
  return out.sort((a, b) => a.l - b.l || a.at - b.at);
}

module.exports = { REPO, readSource, load, find, validate, unitLines, plainOf, chapterFull, mentions };
