/* Λεξιλόγιο · core logic v2 (καθαρές συναρτήσεις, χωρίς DOM).
   Μονάδα = ΣΕΛΙΔΑ του φυλλαδίου. Ημερομηνίες: τοπικές "YYYY-MM-DD". */
(function (root) {
  'use strict';

  const LADDER = [1, 3, 7, 21, 30];   // μέρες μέχρι την επόμενη· μετά μένει 30
  const PROMOTE_AT = 0.8;             // ≥80% σωστά με την πρώτη → επόμενο σκαλί (ποτέ πίσω)
  const CHUNK_MAX = 6;                // λέξεις ανά «γνωριμία» στο πρώτο πέρασμα
  const CONSOLIDATE_NEED = 2;         // σωστά ανά λέξη στο ανακατεμένο κομμάτι (σύνολο 1+2 = 3)
  const HARD_FROM_PASS = 2;           // ≥2 λάθη στο πρώτο πέρασμα → Δύσκολες
  const HARD_EXIT_STREAK = 2;         // σωστή με την πρώτη 2 διαφορετικές μέρες στη σειρά → βγαίνει
  const SEC_PER_REVIEW = 7, SEC_PER_FIRST = 22; // εκτίμηση χρόνου

  /* ---------- ημερομηνίες ---------- */
  const pad = n => String(n).padStart(2, '0');
  function toISO(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
  function parseISO(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d, 12); }
  function addDays(iso, n) { const d = parseISO(iso); d.setDate(d.getDate() + n); return toISO(d); }
  function diffDays(a, b) { return Math.round((parseISO(b) - parseISO(a)) / 864e5); }
  const DAYS = ['Κυρ', 'Δευ', 'Τρί', 'Τετ', 'Πέμ', 'Παρ', 'Σάβ'];
  function prettyDate(iso) { const d = parseISO(iso); return `${DAYS[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`; }
  function whenText(today, iso) {
    const n = diffDays(today, iso);
    if (n === 1) return `αύριο, ${prettyDate(iso)}`;
    return `σε ${n} μέρες, ${prettyDate(iso)}`;
  }

  /* ---------- σελίδες ---------- */
  function intervalFor(stage) { return LADDER[Math.min(stage, LADDER.length - 1)]; }

  // pageState: undefined | {status:'learning', pass} | {status:'active', stage, lastDone, started, history}
  function pageStatus(ps, today) {
    if (!ps) return { kind: 'new' };
    if (ps.status === 'learning') return { kind: 'learning', progress: firstProgress(ps.pass) };
    const next = addDays(ps.lastDone, intervalFor(ps.stage));
    const inDays = diffDays(today, next);
    const kind = inDays > 0 ? 'later' : inDays === 0 ? 'due' : 'waiting'; // «waiting»: περιμένει, χωρίς μετρητή
    return { kind, next, inDays, stage: ps.stage };
  }
  function finishFirstPass(today) {
    return { status: 'active', stage: 0, lastDone: today, started: today, history: [{ date: today, type: 'first' }] };
  }
  function finishReview(ps, acc, today) {
    const stage = acc >= PROMOTE_AT ? ps.stage + 1 : ps.stage;
    return Object.assign({}, ps, { stage, lastDone: today,
      history: (ps.history || []).concat([{ date: today, type: 'review', acc: Math.round(acc * 100) / 100 }]) });
  }

  /* ---------- βοηθητικά ---------- */
  function shuffle(arr, rng) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  function insertAt(q, item, pos) { q.splice(Math.min(pos, q.length), 0, item); }

  /* ---------- πρώτο πέρασμα: γνωριμία → ανάκληση → ανακάτεμα ----------
     Η σελίδα χωρίζεται σε «κομμάτια» (οικογένειες, ≤6 λέξεις· μικρές οικογένειες ενώνονται).
     Για κάθε κομμάτι: 1) τις ΒΛΕΠΕΙΣ μαζί (γνωριμία), 2) τις λες μία-μία μέχρι κάθε μία σωστή 1 φορά.
     Στο τέλος: όλη η σελίδα ανακατεμένη, κάθε λέξη σωστή άλλες 2 φορές. Σύνολο 3 σωστά/λέξη. */
  function buildChunks(cards) {
    const fams = [], byFam = {};
    cards.forEach(c => { if (!byFam[c.family]) { byFam[c.family] = []; fams.push(c.family); } byFam[c.family].push(c.id); });
    const chunks = [];
    let cur = null;
    fams.forEach(f => {
      let ids = byFam[f];
      while (ids.length > CHUNK_MAX) { // μεγάλη οικογένεια → ίσα μισά
        const parts = Math.ceil(ids.length / CHUNK_MAX), size = Math.ceil(ids.length / parts);
        chunks.push({ groups: [{ family: f, ids: ids.slice(0, size) }] }); ids = ids.slice(size);
      }
      const n = ids.length;
      if (cur && cur.size + n <= CHUNK_MAX && (n <= 2 || cur.small)) { cur.groups.push({ family: f, ids }); cur.size += n; cur.small = cur.small && n <= 2; }
      else { cur = { groups: [{ family: f, ids }], size: n, small: n <= 2 }; chunks.push(cur); }
    });
    return chunks.map(c => ({ groups: c.groups, ids: c.groups.flatMap(g => g.ids) }));
  }

  function newFirstPass(cards) {
    const chunks = buildChunks(cards), right = {}, wrongs = {};
    cards.forEach(c => { right[c.id] = 0; wrongs[c.id] = 0; });
    return { mode: 'first', chunks, ci: 0, step: 'preview', queue: [], right, wrongs,
             total: cards.length * (1 + CONSOLIDATE_NEED) };
  }
  // Τρέχον στοιχείο: {type:'preview', chunk} | {type:'card', id, phase} | null (τέλος)
  function firstCurrent(s) {
    if (s.step === 'preview') return { type: 'preview', chunk: s.chunks[s.ci], index: s.ci, count: s.chunks.length };
    if (!s.queue.length) return null;
    return { type: 'card', id: s.queue[0], phase: s.step };
  }
  function firstAckPreview(s, rng) {
    s.step = 'learn'; s.queue = shuffle(s.chunks[s.ci].ids, rng);
  }
  function firstAnswer(s, ok, rng) {
    const id = s.queue.shift();
    if (ok) {
      s.right[id] += 1;
      if (s.step === 'consolidate' && s.right[id] < 1 + CONSOLIDATE_NEED) insertAt(s.queue, id, 4 + Math.floor(rng() * 4));
    } else {
      s.wrongs[id] += 1;
      insertAt(s.queue, id, 2 + Math.floor(rng() * 2));
    }
    if (s.queue.length) return false;
    if (s.step === 'learn') {
      s.ci += 1;
      if (s.ci < s.chunks.length) { s.step = 'preview'; return false; }
      s.step = 'consolidate';
      s.queue = shuffle(Object.keys(s.right), rng);
      return false;
    }
    return true; // consolidate άδειασε → τέλος
  }
  function firstProgress(s) {
    const done = Object.values(s.right).reduce((a, n) => a + Math.min(n, 1 + CONSOLIDATE_NEED), 0);
    return { done, total: s.total, pct: Math.round(100 * done / s.total) };
  }
  function passHardCards(s) { return Object.keys(s.wrongs).filter(id => s.wrongs[id] >= HARD_FROM_PASS); }

  /* ---------- «Σήμερα»: μία συνεδρία, σελίδα-σελίδα, Δύσκολες στο τέλος ----------
     Κάθε σελίδα «κλειδώνει» μόλις τελειώσει, οπότε αν κλείσεις στη μέση κρατιούνται όσες έγιναν. */
  function newDaily(pages, hardIds, rng) {
    const segs = pages.map(p => ({ kind: 'page', pageId: p.id, ids: p.cardIds.slice() }));
    if (hardIds.length) segs.push({ kind: 'hard', ids: hardIds.slice() });
    segs.forEach(sg => { sg.queue = shuffle(sg.ids, rng); sg.first = {}; sg.ids.forEach(id => { sg.first[id] = null; }); });
    return { mode: 'daily', segs, si: 0, total: segs.reduce((a, sg) => a + sg.ids.length, 0) };
  }
  function dailyCurrent(s) {
    const sg = s.segs[s.si]; if (!sg) return null;
    return { type: 'card', id: sg.queue[0], seg: sg, segIndex: s.si };
  }
  // Επιστρέφει {segDone: seg|null, finished: bool}
  function dailyAnswer(s, ok, rng) {
    const sg = s.segs[s.si], id = sg.queue.shift();
    if (sg.first[id] === null) sg.first[id] = !!ok;
    if (!ok) insertAt(sg.queue, id, 3 + Math.floor(rng() * 3));
    if (sg.queue.length) return { segDone: null, finished: false };
    s.si += 1;
    return { segDone: sg, finished: s.si >= s.segs.length };
  }
  function dailyProgress(s) {
    const done = s.segs.reduce((a, sg) => a + sg.ids.filter(id => sg.first[id] !== null && !sg.queue.includes(id)).length, 0);
    return { done, total: s.total, pct: Math.round(100 * done / s.total) };
  }
  function segAccuracy(sg) { const v = Object.values(sg.first); return v.length ? v.filter(Boolean).length / v.length : 1; }
  function segMisses(sg) { return Object.keys(sg.first).filter(id => sg.first[id] === false); }

  /* ---------- Δύσκολες ---------- */
  function addHard(hard, ids, today) {
    const h = Object.assign({}, hard);
    // lastDay = σήμερα: μόλις την είδε, οπότε οι Δύσκολες την ξαναπροτείνουν από αύριο
    ids.forEach(id => { h[id] = h[id] ? Object.assign({}, h[id], { streak: 0, lastDay: today }) : { added: today, streak: 0, lastDay: today }; });
    return h;
  }
  function applyHardSeg(hard, sg, today) {
    const h = Object.assign({}, hard), graduated = [];
    Object.keys(sg.first).forEach(id => {
      const e = h[id]; if (!e || e.lastDay === today) return;
      if (sg.first[id]) {
        const streak = e.streak + 1;
        if (streak >= HARD_EXIT_STREAK) { delete h[id]; graduated.push(id); }
        else h[id] = Object.assign({}, e, { streak, lastDay: today });
      } else h[id] = Object.assign({}, e, { streak: 0, lastDay: today });
    });
    return { hard: h, graduated };
  }
  function hardPendingToday(hard, today) { return Object.keys(hard).filter(id => hard[id].lastDay !== today); }


  /* ---------- πρόβλεψη εβδομάδας (μόνο επαναλήψεις, υποθέτοντας ότι κάθε φορά ανεβαίνει σκαλί) ----------
     pages: [{state, nCards}] · επιστρέφει [{date, cards, predicted}] για days μέρες από σήμερα. */
  function forecast(pages, today, days) {
    const out = [];
    for (let i = 0; i < days; i++) out.push({ date: addDays(today, i), cards: 0, predicted: i > 0 });
    pages.forEach(({ state, nCards }) => {
      if (!state || state.status !== 'active') return;
      let stage = state.stage, next = addDays(state.lastDone, intervalFor(stage));
      if (diffDays(today, next) < 0) next = today;          // ό,τι περιμένει, μετράει σήμερα
      while (diffDays(today, next) < days) {
        out[diffDays(today, next)].cards += nCards;
        stage += 1; next = addDays(next, intervalFor(stage));
      }
    });
    return out;
  }

  /* ---------- εκτίμηση χρόνου ---------- */
  function minutes(nCards, mode) { return Math.max(1, Math.round(nCards * (mode === 'first' ? SEC_PER_FIRST : SEC_PER_REVIEW) / 60)); }
  function minutesText(nCards, mode) { const m = minutes(nCards, mode); return m === 1 ? 'περίπου 1 λεπτό' : `περίπου ${m} λεπτά`; }

  /* ---------- αναζήτηση ---------- */
  function fold(s) { return (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/ς/g, 'σ'); }

  /* ---------- εισαγωγή σελίδας ---------- */
  function validateImport(obj, existingIds) {
    const errors = [];
    const pages = obj && (obj.pages || (obj.page ? [obj.page] : null));
    if (!Array.isArray(pages) || !pages.length) return { ok: false, errors: ['Δεν βρέθηκε "page".'] };
    const seen = new Set(existingIds);
    pages.forEach((p, i) => {
      if (!p.id || !p.bookPage || !Array.isArray(p.cards) || !p.cards.length) errors.push(`Σελίδα ${i + 1}: λείπει id, bookPage ή cards.`);
      if (seen.has(p.id)) errors.push(`Η σελίδα ${p.id} υπάρχει ήδη.`);
      seen.add(p.id);
      (p.cards || []).forEach((k, j) => {
        if (!k.id || !k.front || !k.back || !k.family) errors.push(`Κάρτα ${j + 1}: λείπει id/front/back/family.`);
        if (seen.has(k.id)) errors.push(`Διπλό id κάρτας: ${k.id}`);
        seen.add(k.id);
      });
    });
    const norm = pages.map(p => Object.assign({}, p, {
      cards: p.cards.map(k => Object.assign({ hook: null, trap: null, note: null }, k, {
        front: String(k.front).normalize('NFC'), back: String(k.back).normalize('NFC') })) }));
    return { ok: errors.length === 0, errors, pages: norm };
  }

  const api = {
    LADDER, PROMOTE_AT, CHUNK_MAX, CONSOLIDATE_NEED, HARD_FROM_PASS, HARD_EXIT_STREAK,
    toISO, addDays, diffDays, prettyDate, whenText, intervalFor,
    pageStatus, finishFirstPass, finishReview,
    buildChunks, newFirstPass, firstCurrent, firstAckPreview, firstAnswer, firstProgress, passHardCards,
    newDaily, dailyCurrent, dailyAnswer, dailyProgress, segAccuracy, segMisses,
    addHard, applyHardSeg, hardPendingToday, minutes, minutesText, forecast, fold, validateImport, shuffle
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.LexCore = api;
})(typeof window !== 'undefined' ? window : globalThis);
