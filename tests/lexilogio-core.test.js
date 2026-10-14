// tests/lexilogio-core.test.js — τα 13 τεστ του kit «Λεξιλόγιο», αυτούσια (μόνο οι διαδρομές).
// node --test tests/lexilogio-core.test.js   (ή node tests/lexilogio-core.test.js)
const test = require('node:test');
const assert = require('node:assert');
const path = require('path');
const C = require(path.join(__dirname, '..', 'lexilogio-core.js'));
const data = require(path.join(__dirname, '..', 'data', 'lexilogio.json'));
const page = data.pages[0];
const rng = (() => { let x = 7; return () => (x = (x * 16807) % 2147483647) / 2147483647; })();

test('νέα σελίδα: χωρίς ρολόι μέχρι το πρώτο πέρασμα', () => {
  assert.equal(C.pageStatus(undefined, '2026-10-14').kind, 'new');
});

test('το ρολόι ξεκινάει από τη μέρα του πρώτου περάσματος', () => {
  const st = C.pageStatus(C.finishFirstPass('2026-10-16'), '2026-10-16');
  assert.equal(st.kind, 'later'); assert.equal(st.next, '2026-10-17');
});

test('σκάλα 1 → 3 → 7 → 21 → 30 → 30', () => {
  let ps = C.finishFirstPass('2026-10-14'), day = '2026-10-15';
  [3, 7, 21, 30, 30].forEach(gap => {
    ps = C.finishReview(ps, 1, day);
    const st = C.pageStatus(ps, day);
    assert.equal(C.diffDays(day, st.next), gap); day = st.next;
  });
});

test('αργοπορία: μετράει από τη μέρα που ΕΚΑΝΕ την επανάληψη, χωρίς ποινή', () => {
  let ps = C.finishFirstPass('2026-10-14');
  assert.equal(C.pageStatus(ps, '2026-10-18').kind, 'waiting');
  ps = C.finishReview(ps, 0.9, '2026-10-18');
  assert.equal(C.pageStatus(ps, '2026-10-18').next, '2026-10-21');
});

test('κάτω από 80%: ίδιο σκαλί, ποτέ πίσω', () => {
  let ps = C.finishReview(C.finishFirstPass('2026-10-14'), 1, '2026-10-15');
  ps = C.finishReview(ps, 0.3, '2026-10-18');
  assert.equal(ps.stage, 1);
});

test('κομμάτια: ≤6 λέξεις, καλύπτουν όλη τη σελίδα, οικογένειες δεν σπάνε άσκοπα', () => {
  const ch = C.buildChunks(page.cards);
  ch.forEach(c => assert.ok(c.ids.length <= C.CHUNK_MAX && c.ids.length > 0));
  const all = ch.flatMap(c => c.ids);
  assert.equal(all.length, page.cards.length); assert.equal(new Set(all).size, page.cards.length);
  const agw = ch.find(c => c.groups.some(g => g.family === 'ἄγω'));
  assert.equal(agw.groups.find(g => g.family === 'ἄγω').ids.length, 6);
});

test('πρώτο πέρασμα: γνωριμία ΠΡΙΝ από κάθε ερώτηση, 3 σωστά ανά λέξη', () => {
  const s = C.newFirstPass(page.cards);
  const seen = new Set(); let previews = 0, n = 0, done = false;
  while (!done && n < 2000) {
    const cur = C.firstCurrent(s);
    if (cur.type === 'preview') { cur.chunk.ids.forEach(id => seen.add(id)); previews++; C.firstAckPreview(s, rng); continue; }
    assert.ok(seen.has(cur.id), 'ερωτήθηκε πριν τη δει: ' + cur.id);
    done = C.firstAnswer(s, n % 6 !== 0, rng); n++;
  }
  assert.ok(done); assert.equal(previews, s.chunks.length);
  Object.values(s.right).forEach(r => assert.ok(r >= 3));
  assert.equal(C.firstProgress(s).pct, 100);
});

test('Σήμερα: κάθε σελίδα κλειδώνει μόλις τελειώσει, ακρίβεια μόνο με την πρώτη', () => {
  const s = C.newDaily([{ id: 'p1', cardIds: ['a', 'b', 'c', 'd'] }, { id: 'p2', cardIds: ['e', 'f'] }], ['x'], rng);
  const missed = new Set(); const done = [];
  let fin = false;
  while (!fin) {
    const cur = C.dailyCurrent(s);
    const ok = !(cur.id === 'a' && !missed.has('a')); if (!ok) missed.add('a');
    const r = C.dailyAnswer(s, ok, rng); if (r.segDone) done.push(r.segDone); fin = r.finished;
  }
  assert.deepEqual(done.map(d => d.kind), ['page', 'page', 'hard']);
  assert.equal(C.segAccuracy(done[0]), 0.75); assert.deepEqual(C.segMisses(done[0]), ['a']);
});

test('Δύσκολες: βγαίνει μετά από 2 διαφορετικές μέρες σωστή με την πρώτη', () => {
  let hard = C.addHard({}, ['x'], '2026-10-14');
  assert.deepEqual(C.hardPendingToday(hard, '2026-10-14'), []);        // όχι ξανά την ίδια μέρα
  assert.deepEqual(C.hardPendingToday(hard, '2026-10-15'), ['x']);
  const day = (d, ok) => { const sg = { first: { x: ok } }; return C.applyHardSeg(hard, sg, d); };
  let r = day('2026-10-15', true); hard = r.hard; assert.equal(hard.x.streak, 1);
  r = day('2026-10-15', true); hard = r.hard; assert.equal(hard.x.streak, 1);
  r = day('2026-10-16', false); hard = r.hard; assert.equal(hard.x.streak, 0);
  r = day('2026-10-17', true); hard = r.hard; r = day('2026-10-18', true); hard = r.hard;
  assert.ok(!hard.x); assert.deepEqual(r.graduated, ['x']);
});

test('αναζήτηση χωρίς τόνους/πνεύματα', () => {
  assert.equal(C.fold('αἱροῦμαι'), C.fold('αιρουμαι'));
  assert.equal(C.fold('Ἀθήνηθεν'), 'αθηνηθεν');
});

test('δεδομένα: 50 κάρτες, μοναδικά ids, NFC, γεμάτα πεδία', () => {
  assert.equal(page.cards.length, 50);
  const ids = new Set();
  page.cards.forEach(c => {
    assert.ok(!ids.has(c.id)); ids.add(c.id);
    ['front', 'back', 'family', 'hook'].forEach(k => assert.ok(c[k], `${c.id}.${k}`));
    assert.equal(c.front, c.front.normalize('NFC'));
  });
});

test('εισαγωγή σελίδας: απορρίπτει διπλά, δέχεται σωστή', () => {
  const existing = [page.id, ...page.cards.map(k => k.id)];
  assert.equal(C.validateImport({ page }, existing).ok, false);
  const good = C.validateImport({ page: { id: 'p171', bookPage: 171, cards: [{ id: 'p171-01', front: 'αἰτίαν ἔχω', back: 'κατηγορούμαι', family: 'αἰτῶ' }] } }, existing);
  assert.equal(good.ok, true);
});

test('πρόβλεψη εβδομάδας: σελίδα από χθες → σήμερα, μετά +3', () => {
  const ps = C.finishFirstPass('2026-10-13');
  const f = C.forecast([{ state: ps, nCards: 50 }], '2026-10-14', 7);
  assert.equal(f[0].cards, 50); assert.equal(f[3].cards, 50); assert.equal(f[1].cards, 0);
  assert.equal(f.reduce((a, d) => a + d.cards, 0), 100);
  assert.equal(C.forecast([{ state: undefined, nCards: 50 }], '2026-10-14', 7).every(d => d.cards === 0), true);
});
