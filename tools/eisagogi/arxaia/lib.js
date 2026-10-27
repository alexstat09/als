/* tools/eisagogi/arxaia/lib.js — ΤΟ ΚΑΛΟΥΠΙ ΤΗΣ ΕΙΣΑΓΩΓΗΣ ΤΩΝ ΑΡΧΑΙΩΝ.
   Ένα κεφάλαιο = ΕΝΑ json (π.χ. sokratis-d2.json) + η πηγή του (το βιβλίο,
   καρφωμένο με sha). Ο κανόνας είναι διπλός και ΑΟΡΑΤΟΣ στη σελίδα:
     (α) ΚΑΝΕΝΑ ΚΕΝΟ — κάθε πρόταση του βιβλίου πιάνεται από μια άγκυρα
         (`a`) του ΔΙΑΒΑΣΜΑΤΟΣ· άρα ό,τι μπορεί να ρωτηθεί είναι στη σελίδα.
     (β) ΚΑΝΕΝΑ ΔΙΚΟ ΜΟΥ ΓΕΓΟΝΟΣ — κάθε άγκυρα είναι αυτολεξεί στο βιβλίο, το
         κείμενο του σημείου ΛΕΕΙ την άγκυρά του (λέξεις της μέσα του), και
         νούμερα / ονόματα / πολυτονικό μέσα στο κείμενο υπάρχουν στο βιβλίο.
   Ό,τι ΔΕΝ είναι του βιβλίου ζει σε ΔΗΛΩΜΕΝΑ πεδία: `mine` (οι χειρόγραφες
   σημειώσεις του), `mnem` (μνημονικά), `wrong` (λάθος επιλογές κουίζ).
   ⛔ Το HTML δεν γράφεται ποτέ με το χέρι: build.js το παράγει από εδώ. */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const REPO = path.join(__dirname, '..', '..', '..');

/* ── μικρή σήμανση κειμένου ──────────────────────────────────────────────
   *λέξη*  → όρος (GFS Didot πλάγια, χρώμα του μαθήματος)
   **λέξη** → έμφαση
   Τίποτα άλλο· κανένα HTML μέσα στο json (σταθ. 60). */
function plain(s) { return String(s || '').replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1'); }

/* ── κανονικοποίηση για συγκρίσεις ─────────────────────────────────────
   Απόστροφοι σε μία, εισαγωγικά «» "" σε τίποτα, κενά σε ένα. Ο τόνος ΜΕΝΕΙ
   για την αυτολεξεί σύγκριση· φεύγει μόνο στο «λέει την άγκυρά του». */
function apo(s) { return String(s).replace(/[’ʼ᾽᾿‘]/g, "'"); }
function norm(s) { return apo(s).replace(/\s+/g, ' ').trim(); }
function bare(s) {   /* χωρίς τόνους/πνεύματα, πεζά */
  return String(s).normalize('NFD').replace(/[̀-ͯ͂̓̈́ͅ]/g, '').toLowerCase()
    .replace(/ς/g, 'σ');
}

const POLY = /[ἀ-῿]|[̓̔͂]/;   /* πολυτονικό (μετά από NFC) */
const OXIA = /[άέήίόύώΆΈΉΊΎΌΏΐΰ]/;

/* ── η πηγή ─────────────────────────────────────────────────────────── */
function readSource(file) {
  const raw = fs.readFileSync(path.join(REPO, file), 'utf8');
  const sha = crypto.createHash('sha256').update(raw, 'utf8').digest('hex');
  /* Τα μπλοκ: @@LEAD@@ … @@/LEAD@@, @@NOTEn@@ … (υποσημειώσεις), και το σώμα.
     Οι γραμμές με # είναι κεφαλίδα. Οι @@B@@ σημάνσεις φεύγουν (είναι έντονα). */
  const lines = raw.split('\n').filter(l => l.charAt(0) !== '#');
  const text = lines.join('\n').replace(/@@\/?(LEAD|NOTE\d+)@@/g, '\n').replace(/@@\/?B@@/g, '');
  const flat = norm(text);
  return { raw, sha, text, flat, sentences: sentences(text) };
}

/* ── προτάσεις ──────────────────────────────────────────────────────────
   Όριο = . ; ? ! (και » αμέσως μετά) + κενό + κεφαλαίο / « / ( .
   ⚠️ ΟΧΙ μετά από συντομογραφία: «σελ.», «κ.εξ.», ένα γράμμα («a»), ψηφίο
   ακολουθούμενο από τελεία μέσα σε παραπομπή. Ένα «τι λέει άραγε ο θεός;»
   ΜΕΣΑ σε απόσπασμα δεν σπάει αν ακολουθεί πεζό — αυτό είναι ελληνικό
   ερωτηματικό με συνέχεια, όχι νέα πρόταση. */
const ABBR = /(?:σελ|κ\.εξ|π\.Χ|μ\.Χ|βλ)\.$/;
function sentences(text) {
  const out = [];
  text.split('\n').map(l => norm(l)).filter(Boolean).forEach(line => {
    let start = 0;
    const re = /[.;?!]["»”]?\)?(?=\s+["«(]?[\p{Lu}0-9])/gu;
    let m;
    while ((m = re.exec(line))) {
      const end = m.index + m[0].length;
      const piece = line.slice(start, end);
      if (ABBR.test(piece) || /\s[a-zα-ω]\.$/.test(piece)) continue;
      out.push(piece.trim());
      start = end;
    }
    const tail = line.slice(start).trim();
    if (tail) out.push(tail);
  });
  /* Κομμάτια μικρότερα από 4 λέξεις κολλάνε στο επόμενο (π.χ. ο αριθμός
     υποσημείωσης «2» στην αρχή της). */
  const merged = [];
  out.forEach(s => {
    if (merged.length && s.split(' ').length < 3) merged[merged.length - 1] += ' ' + s;
    else merged.push(s);
  });
  return merged;
}

/* ── τα δεδομένα ────────────────────────────────────────────────────── */
function load(name) {
  const f = path.join(__dirname, name.endsWith('.json') ? name : name + '.json');
  return JSON.parse(fs.readFileSync(f, 'utf8'));
}

/* ⭐ Τα αποσπάσματα ΔΕΝ πληκτρολογούνται: το json λέει από πού ως πού
   (`from`/`to`) και το κείμενο κόβεται ΑΥΤΟΥΣΙΟ από την πηγή. Ένα
   αντιγραμμένο απόσπασμα είναι ένα απόσπασμα με τυπογραφικό λάθος. */
function resolve(d, src) {
  const errs = [];
  d.stations.forEach(st => {
    const q = st.quote; if (!q) return;
    const i = src.flat.indexOf(norm(q.from));
    const j = i < 0 ? -1 : src.flat.indexOf(norm(q.to), i);
    if (i < 0 || j < 0) { errs.push('σταθμός ' + st.n + '.quote: δεν βρέθηκε στο βιβλίο το «' + (i < 0 ? q.from : q.to) + '»'); q.t = ''; return; }
    q.t = src.flat.slice(i, j + norm(q.to).length);
  });
  return errs;
}

/* Όλα τα «κομμάτια κειμένου» ενός κεφαλαίου, με το πού ζουν και αν
   δεσμεύονται από το βιβλίο. `reading` = μετράει για την κάλυψη (α).
   `gloss` = απόδοση/μετάφραση: δεν χρειάζεται να «λέει» τις λέξεις της
   άγκυρας, αλλά νούμερα/ονόματα/αρχαία της ελέγχονται κανονικά. */
function items(d) {
  const out = [];
  const add = (where, text, a, opt) => out.push(Object.assign({ where, text: text || '', a: a || [] }, opt || {}));
  add('cover.title', d.title, [d.title], { reading: true, short: true });
  add('cover.sub', d.cover.sub.t, d.cover.sub.a, { reading: true, short: true });
  add('cover.motto', d.cover.motto.gr, d.cover.motto.a, { reading: true, verbatim: true });
  add('cover.motto.tr', d.cover.motto.tr, d.cover.motto.a, { gloss: true });
  d.stations.forEach(st => {
    const w = 'σταθμός ' + st.n;
    add(w + '.title', st.title, [], { free: true });
    add(w + '.label', st.label, st.la || [], st.la ? { reading: true, short: true } : { free: true });
    if (st.mine) add(w + '.πλαγιότιτλος', st.mine, [], { mine: true });
    (st.prose || []).forEach((p, i) => add(w + '.prose' + (i + 1), p.t, p.a, { reading: true }));
    if (st.quote) {
      add(w + '.quote', st.quote.t, [st.quote.t].concat(st.quote.a || []), { reading: true, verbatim: true });
      add(w + '.quote.cite', st.quote.cite + ' ' + (st.quote.lead || ''), st.quote.a, { short: true, gloss: true });
    }
    (st.points || []).forEach((p, i) => add(w + '.point' + (i + 1), p.t, p.a, { reading: true }));
    diagramTexts(st.diagram).forEach((x, i) => add(w + '.σχέδιο' + (i + 1), x.t, x.a, { reading: true, short: true }));
    (st.gloss || []).forEach((g, i) => {
      if (g.mine) return add(w + '.λεξ' + (i + 1), g.k + ' ' + g.d, [], { mine: true });
      add(w + '.λεξ' + (i + 1) + '.όρος', g.k, g.plain ? g.a : [g.k], { term: !g.plain, short: true, gloss: !!g.plain });
      add(w + '.λεξ' + (i + 1), g.d, g.a, { reading: true, gloss: true });
    });
    if (st.mnem) add(w + '.μνημονικό', st.mnem.k + ' ' + st.mnem.t, st.mnem.a, { mnem: true });
  });
  /* Η ΕΡΩΤΗΣΗ μπορεί νόμιμα να γράφει την παγίδα («Ήταν ο πρώτος…;») — ο
     φρουρός των παγίδων κοιτάει την ΑΠΑΝΤΗΣΗ. Το «λέει την άγκυρά του»
     μετράει ερώτηση + απάντηση μαζί, γιατί μαζί διαβάζονται. */
  (d.check.recall || []).forEach(c => {
    add('ανάκληση ' + c.id + '.ερώτηση', c.q, c.a, { question: true, claim: true });
    add('ανάκληση ' + c.id, c.q + '. ' + c.r, c.a, { question: true });
    add('ανάκληση ' + c.id + '.απάντηση', c.r, c.a, { claim: true });
  });
  (d.check.tf || []).forEach(c => {
    add('Σ/Λ ' + c.id + '.πρόταση', c.t, c.a, { claim: true, trap: c.ok !== false });
    add('Σ/Λ ' + c.id, (c.ok ? c.t + ' ' : '') + c.why, c.a);
  });
  (d.check.mc || []).forEach(c => {
    add('πολλαπλή ' + c.id + '.ερώτηση', c.q, c.a, { question: true, claim: true });
    add('πολλαπλή ' + c.id, c.q + '. ' + c.o[c.ok] + '. ' + (c.why || ''), c.a, { question: true });
    add('πολλαπλή ' + c.id + '.απάντηση', c.o[c.ok] + '. ' + (c.why || ''), c.a, { claim: true });
  });
  (d.check.numbers || []).forEach((c, i) => add('νούμερο ' + (i + 1), c.v + ' ' + c.l, c.a, { gloss: true }));
  (d.check.pitfalls || []).forEach((c, i) => add('παγίδα ' + (i + 1), c.t, c.a, { claim: !!c.claim }));
  if (d.check.idea) add('μεγάλη ιδέα', d.check.idea.t, d.check.idea.a, { mnem: true });
  return out;
}

/* Κάθε σχέδιο, όποιος κι αν είναι ο τύπος του: ΚΑΘΕ αντικείμενο {t, a}
   μέσα του είναι κείμενο που φαίνεται, άρα ελέγχεται. Ένας νέος τύπος
   σχεδίου δεν χρειάζεται να «δηλωθεί» εδώ για να φυλαχτεί. */
function diagramTexts(dg) {
  const out = [];
  (function walk(o) {
    if (!o || typeof o !== 'object') return;
    if (Array.isArray(o)) return o.forEach(walk);
    if (typeof o.t === 'string') out.push({ t: o.t + (o.w ? ' ' + o.w : ''), a: o.a || [] });
    else if (typeof o.l === 'string' && typeof o.r === 'string') out.push({ t: o.l + ' ' + o.r, a: o.a || [] });
    Object.keys(o).forEach(k => { if (k !== 'a' && k !== 't') walk(o[k]); });
  })(dg);
  return out;
}

/* οι τύποι σχεδίου που ξέρει το καλούπι: τα κλειδιά του `var DG = {` στο page.tpl */
function dgTypes() {
  const t = fs.readFileSync(path.join(__dirname, 'page.tpl'), 'utf8');
  const a = t.indexOf('var DG = {'), b = t.indexOf('\n};', a);
  return (t.slice(a, b).match(/^  ([a-z]+): function/gm) || []).map(x => x.trim().split(':')[0]);
}

/* ── ο έλεγχος ──────────────────────────────────────────────────────── */
const STOP = new Set('και του της την τον των τους τις στο στη στην στον στα στις στους ενώ αλλά όμως ότι πως που από για με σε ως ένα μια μία είναι ήταν δεν θα να τα το τη οι ο η ένας αυτό αυτή αυτός αυτοί όπως ούτε είτε ακόμα μόνο κάθε δηλαδή'.split(' ').map(bare));
function words(s) { return bare(plain(s)).split(/[^\p{Ll}0-9]+/u).filter(w => w.length >= 4 && !STOP.has(w)); }
function stem(w) { return w.slice(0, Math.max(4, Math.min(6, w.length - 2))); }
/* ⭐ «Η ίδια λέξη» στα ελληνικά = κοινό πρόθεμα, όχι ίδια κατάληξη:
   νομίζω/νομίζει, Δελφών/Δελφούς, αδικίας/αδικία. Απαιτείται πρόθεμα
   max(3, min(5, μήκος−2)) — αρκετό για να μη συμπίπτουν άσχετες λέξεις. */
function prefix(a, b) { let i = 0; while (i < a.length && a[i] === b[i]) i++; return i; }
function said(word, pool, need) {
  need = need || Math.max(3, Math.min(5, word.length - 2));
  return pool.some(t => prefix(word, t) >= need);
}

function validate(d, src) {
  const errs = resolve(d, src);
  const E = (w, m) => errs.push(w + ': ' + m);
  if (src.sha !== d.source.sha) E('πηγή', 'το sha της πηγής άλλαξε (' + src.sha + ') — το βιβλίο δεν διορθώνεται με το χέρι');
  if (OXIA.test(JSON.stringify(d))) E('json', 'OXIA μέσα στα δεδομένα (U+1F71 κ.λπ.) — NFC');
  if (!/^[a-z0-9-]+$/.test(d.key || '')) E('key', 'λείπει/άκυρο το κλειδί προόδου');
  /* ο σκελετός του scaffold.js: κάθε «⟪…⟫» είναι κενό που δεν γέμισε */
  (JSON.stringify(d).match(/⟪[^⟫]*⟫/g) || []).slice(0, 8).forEach(x => E('ασυμπλήρωτο', x + ' — γέμισέ το (reference/schema.md)'));

  const S = src.flat, SB = bare(S);
  const srcNums = new Set((S.match(/\d+/g) || []));
  const srcStems = new Set(words(S).map(stem));
  const srcCaps = (S.match(/\p{Lu}\p{L}+/gu) || []).map(w => bare(w));
  const COUNTED = d.counted || {};
  const ids = new Set();

  const all = items(d);
  all.forEach(it => {
    const w = it.where;
    if (it.mine || it.free) return;
    const txt = plain(it.text);
    if (/[<>]/.test(it.text)) E(w, 'HTML μέσα στο κείμενο — μόνο *όρος* και **έμφαση**');
    /* ⭐ Το πολυτονικό ΕΞΩ από *όρο* τυλίγεται από τη σελίδα σε GFS Didot
       λέξη-λέξη (το Commissioner δεν έχει πολυτονικό)· ο φρουρός ζει στο test. */
    /* (β1) οι άγκυρες είναι αυτολεξεί στο βιβλίο */
    if (!it.mnem && !it.term && !it.a.length && !/^cover\.title/.test(w)) E(w, 'καμία άγκυρα — κάθε κομμάτι δένεται σε φράση του βιβλίου');
    it.a.forEach(a => {
      if (S.indexOf(norm(a)) < 0) E(w, 'η άγκυρα ΔΕΝ είναι αυτολεξεί στο βιβλίο: «' + a + '»');
      else if (!it.term && norm(a).length < 10 && !it.short) E(w, 'πολύ κοντή άγκυρα «' + a + '» — δεν δένει τίποτα');
    });
    if (it.mnem) return;
    /* (β2) το κείμενο ΛΕΕΙ την άγκυρά του: λέξεις της άγκυρας μέσα του */
    if (!it.term && !it.verbatim && !it.claim && !it.gloss) {
      const mine = words(txt);
      it.a.forEach(a => {
        const aw = words(a);
        if (!aw.length) return;
        const hit = aw.filter(x => said(x, mine)).length;
        const need = it.short ? 1 : Math.max(1, Math.ceil(aw.length * 0.5));
        if (hit < need) E(w, 'το κείμενο δεν λέει την άγκυρά του «' + a.slice(0, 50) + '» (' + hit + '/' + aw.length + ' λέξεις)');
      });
    }
    /* (β3) νούμερα του κειμένου υπάρχουν στο βιβλίο, ή είναι δηλωμένο μέτρημα */
    (txt.match(/\d+/g) || []).forEach(n => {
      if (!srcNums.has(n) && COUNTED[n] === undefined) E(w, 'το νούμερο «' + n + '» δεν υπάρχει στο βιβλίο ούτε ως δηλωμένο μέτρημα');
    });
    /* (β4) πολυτονικό: κάθε τέτοια λέξη υπάρχει στο βιβλίο */
    (txt.match(/[^\s.,;·«»"'()[\]…:!?-]+/g) || []).filter(t => POLY.test(t)).forEach(t => {
      if (S.indexOf(t) < 0) E(w, 'η αρχαία λέξη «' + t + '» δεν υπάρχει στο βιβλίο');
    });
    /* (β5) κύρια ονόματα (κεφαλαίο ΜΕΣΑ σε πρόταση): το θέμα τους στο βιβλίο */
    const toks = txt.split(/\s+/);
    toks.forEach((t, i) => {
      const prev = toks[i - 1] || '';
      if (!i || /[.;!?:»]$/.test(prev) || /^[«"(]/.test(t)) return;
      const m = t.replace(/[^\p{L}]/gu, '');
      if (!/^\p{Lu}/u.test(m) || m.length < 3 || m === m.toUpperCase()) return;
      const bm = bare(m);
      if (!said(bm, srcCaps, Math.min(4, bm.length - 1)) && !(d.names || []).includes(m)) E(w, 'το όνομα «' + m + '» δεν εμφανίζεται στο βιβλίο');
    });
  });

  /* (γ) οι παγίδες: ισχυρισμοί που το βιβλίο λέει ΑΝΤΙΘΕΤΑ δεν γράφονται
     πουθενά — εκτός από Σ/Λ που είναι δηλωμένα ΛΑΘΟΣ και τις λάθος επιλογές. */
  const reading = all.filter(it => (!it.claim || it.trap) && !it.mine && !it.question);
  (d.traps || []).forEach(t => {
    reading.forEach(it => { if (bare(plain(it.text)).indexOf(bare(t.claim)) >= 0) E(it.where, '⛔ ΠΑΓΙΔΑ: «' + t.claim + '» — ' + t.why); });
  });

  /* (α) ΚΑΝΕΝΑ ΚΕΝΟ: κάθε πρόταση του βιβλίου πιάνεται από το ΔΙΑΒΑΣΜΑ */
  const anchors = all.filter(it => it.reading).reduce((acc, it) => acc.concat(it.a.map(norm)), []);
  const gaps = [];
  /* ⭐ Όχι «μία άγκυρα ανά πρόταση» — μια μακριά πρόταση με ΜΙΑ άγκυρα θα
     άφηνε τα μισά της απ' έξω. Οι άγκυρες ΜΕΣΑ στην πρόταση πρέπει μαζί να
     πιάνουν το COVER των λέξεών της (λέξεις ≥4 γραμμάτων, χωρίς τόνους). */
  const COVER = 0.75;
  src.sentences.forEach((s, i) => {
    const ns = norm(s);
    /* μια άγκυρα μέσα στην πρόταση, Ή η πρόταση ολόκληρη μέσα σε άγκυρα
       (το αυτούσιο απόσπασμα της Ἀπολογίας πιάνει όλες τις προτάσεις του) */
    const nq = x => x.replace(/[«»"]/g, '').replace(/\s+/g, ' ').trim();
    const inside = anchors.filter(a => ns.indexOf(a) >= 0 || nq(a).indexOf(nq(ns)) >= 0);
    const sw = words(ns).map(stem);
    const got = new Set(words(inside.join(' ')).map(stem));
    const hit = sw.filter(x => got.has(x)).length;
    if (!inside.length || (sw.length && hit / sw.length < COVER)) {
      const miss = words(ns).filter(x => !got.has(stem(x)));
      gaps.push('[' + i + '] ' + Math.round(100 * hit / (sw.length || 1)) + '% · ' + s.slice(0, 90) + '…\n        λείπουν: ' + miss.join(' '));
    }
  });
  gaps.forEach(g => E('ΚΕΝΟ', 'η πρόταση του βιβλίου δεν καλύπτεται από κανένα σημείο του Διαβάσματος:\n      ' + g));

  /* ids του ελέγχου: μοναδικά, και δείχνουν σε σταθμό που υπάρχει */
  const st = new Set(d.stations.map(s => s.n));
  ['recall', 'tf', 'mc'].forEach(k => (d.check[k] || []).forEach(c => {
    if (ids.has(c.id)) E(k + ' ' + c.id, 'διπλό id');
    ids.add(c.id);
    if (!st.has(c.s)) E(k + ' ' + c.id, 'δείχνει σε σταθμό που δεν υπάρχει: ' + c.s);
  }));
  (d.check.mc || []).forEach(c => {
    if (!Array.isArray(c.o) || c.o.length !== 4 || new Set(c.o).size !== 4) E('πολλαπλή ' + c.id, 'θέλει 4 διαφορετικές επιλογές');
    if (!(c.ok >= 0 && c.ok < 4)) E('πολλαπλή ' + c.id, 'η σωστή εκτός εύρους');
    /* σταθ. 27: καμία επιλογή δεν είναι γραμμένη μέσα στην ερώτηση */
    c.o.forEach((o, i) => { if (i !== c.ok && bare(c.q).indexOf(bare(o)) >= 0) E('πολλαπλή ' + c.id, 'λάθος επιλογή γραμμένη μέσα στην ερώτηση'); });
  });
  const spread = new Set((d.check.mc || []).map(c => c.ok));
  if ((d.check.mc || []).length >= 8 && spread.size < 4) E('πολλαπλή', 'η σωστή δεν κάθεται σε όλες τις θέσεις');
  (d.check.tf || []).forEach(c => { if (typeof c.ok !== 'boolean') E('Σ/Λ ' + c.id, 'ok πρέπει να είναι true/false'); });
  d.stations.forEach(s => { if (!s.diagram || !s.diagram.type) E('σταθμός ' + s.n, 'κάθε σταθμός έχει το δικό του σχέδιο'); });
  /* ο τύπος σχεδίου ΥΠΑΡΧΕΙ στο DG του καλουπιού — αλλιώς η σελίδα γράφει «Λείπει ο σχεδιαστής» */
  const dg = dgTypes();
  d.stations.forEach(s => { if (s.diagram && s.diagram.type && dg.indexOf(s.diagram.type) < 0 && !/⟪/.test(s.diagram.type)) E('σταθμός ' + s.n, 'ο τύπος σχεδίου «' + s.diagram.type + '» δεν υπάρχει στο DG του page.tpl (' + dg.join(' · ') + ') — νέος τύπος = DG + CSS + test στο ίδιο commit'); });
  /* ίδια φράση (3 λέξεις) σε ΤΡΙΑ ή περισσότερα σημεία του ίδιου σταθμού = επανάληψη, όχι διάβασμα (als-v674) */
  d.stations.forEach(s => {
    const seen = {};
    (s.points || []).forEach((p, i) => {
      const w = bare(plain(p.t)).split(/[^\p{Ll}0-9]+/u).filter(x => x.length >= 3), g = new Set();
      for (let k = 0; k + 2 < w.length; k++) g.add(w.slice(k, k + 3).join(' '));
      g.forEach(x => { (seen[x] = seen[x] || new Set()).add(i); });
    });
    Object.keys(seen).filter(x => seen[x].size >= 3).slice(0, 2).forEach(x => E('σταθμός ' + s.n, 'η φράση «' + x + '» επαναλαμβάνεται σε ' + seen[x].size + ' σημεία — πες την μία φορά'));
  });
  return errs;
}

module.exports = { REPO, load, readSource, sentences, resolve, validate, items, plain, norm, bare, words, dgTypes };
