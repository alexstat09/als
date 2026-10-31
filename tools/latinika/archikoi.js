/* ══ ΑΡΧΙΚΟΙ ΧΡΟΝΟΙ XVI–XXVII → latinika-archikoi.html ════════════════════
   Μία σελίδα με ΚΑΘΕ ρήμα των κειμένων: ανά κείμενο, ανά κατηγορία, και
   κάρτες (ένα ρήμα = μία κάρτα) ως να τα ξέρει όλα απέξω.

   Πηγές — καμία δεύτερη αντιγραφή:
     XXI–XXVII  tools/latinika/lectioNN.json → οι λέξεις με M[w.m].p === 'v',
                ΑΚΡΙΒΩΣ όπως ο πίνακας «Αρχικοί χρόνοι» της σελίδας τους
                (ίδιο φίλτρο με το buildGram() του lectio.tpl).
     XVI–XX     tools/latinika/archikoi.xvi-xx.json (study4exams· δες το «_»).
   Λήμμα που υπάρχει και στα δύο → η μορφή των XXI–XXVII (ένα ρήμα, μία μορφή).
   Το look = το CSS του lectio.tpl, αυτούσιο (κόβεται από εκεί σε κάθε build).

     node tools/latinika/archikoi.js           → γράφει τη σελίδα
     node tools/latinika/archikoi.js --check   → μόνο έλεγχοι, exit 1 σε ✗     */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const ROMAN = {16:'XVI',17:'XVII',18:'XVIII',19:'XIX',20:'XX',21:'XXI',22:'XXII',23:'XXIII',24:'XXIV',25:'XXV',26:'XXVI',27:'XXVII'};
const strip = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const fails = [];
const need = (c, m) => { if (!c) fails.push(m); };

/* ── 1 · τίτλοι από τη βιβλιοθήκη (ό,τι βλέπει ήδη στη latinika.html) ── */
const hub = rd('latinika.html');
function titleOf(n){
  const i = hub.indexOf('data-lec="' + n + '"');
  const m = i < 0 ? null : /<div class="t">([^<]+)<\/div>/.exec(hub.slice(i, i + 900));
  need(m, 'τίτλος του ' + ROMAN[n] + ' στη latinika.html');
  return m ? m[1].trim() : ROMAN[n];
}

/* ── 2 · όσα κείμενα έχουν JSON (σήμερα XXI–XXVII· όποιο από τα XVI–XX περάσει
       σε JSON, έρχεται από εδώ αυτόματα και αγνοείται στο xvi-xx) ── */
const HAS = n => fs.existsSync(path.join(ROOT, 'tools/latinika/lectio' + n + '.json'));
const LEX = {}, TEXTS = [];
function addLemma(k, L, n){
  if (!LEX[k]) LEX[k] = {l:L.l, k:L.k, tr:L.tr || '', from:n};
}
for (let n = 16; n <= 27; n++){
  if (!HAS(n)) continue;
  const j = JSON.parse(rd('tools/latinika/lectio' + n + '.json'));
  const rows = [];
  j.S.forEach(sc => sc.s.forEach(u => u.la.forEach((w, i) => {
    const L = w.m && j.M[w.m];
    if (!L || L.p !== 'v') return;
    addLemma(w.m, L, n);
    const ctx = u.la.map((x, k) => k === i ? '<b>' + x.w + '</b>' : x.w).join(' ');
    rows.push({w:w.w.replace(/[«»"“”.,;:?!]/g, ''), m:w.m, f:w.f || '', d:w.d || '', ctx});
  })));
  TEXTS.push({n, r:ROMAN[n], t:titleOf(n), rows});
}

/* ── 3 · XVI–XX από το study4exams ── */
const X = JSON.parse(rd('tools/latinika/archikoi.xvi-xx.json'));
function bookText(n){
  if (n >= 18){
    const s = rd('tests/latinika-lectio' + n + '.source.txt').split('\n').filter(l => !l.startsWith('#')).join(' ');
    return s.split('@@@')[0].replace(/\*/g, '').replace(/\s+/g, ' ').trim();
  }
  /* XVI–XVII: δεν έχουν source.txt — το κείμενο (= του βιβλίου, όπως το δίνει το
     study4exams) είναι στο «text» του xvi-xx.json */
  return X.text[n];
}
for (let n = 16; n <= 20; n++){
  if (HAS(n)) continue;
  const T = X.T[n]; need(T && T.length, 'archikoi.xvi-xx.json: λείπει το ' + n);
  const txt = bookText(n);
  const sents = txt.split(/(?<=[.;:?!])\s+/);
  const rows = (T || []).map(([w, m, f, d]) => {
    const L = LEX[m] || X.M[m];
    need(L, ROMAN[n] + ' ' + w + ': το λήμμα «' + m + '» δεν υπάρχει πουθενά');
    if (!LEX[m] && L) addLemma(m, L, n);
    need(!(LEX[m] && X.M[m] && HAS(LEX[m].from)), ROMAN[n] + ': το «' + m + '» υπάρχει ήδη στο ' + ROMAN[LEX[m] && LEX[m].from] + ' — σβήσ\' το από το M του xvi-xx');
    /* ο τύπος πρέπει να ΒΡΙΣΚΕΤΑΙ στο κείμενο (λέξη-λέξη, χωρίς μακρά) */
    const first = strip(w.split(' ')[0]);
    const s = sents.find(x => x.split(/[\s,.;:?!()]+/).some(t => strip(t) === first || (m === 'coniuro' && strip(t) === 'coniuarvit')));
    need(s, ROMAN[n] + ': ο τύπος «' + w + '» δεν βρέθηκε στο κείμενο');
    const ctx = s ? s.split(' ').map(t => { const b = strip(t.replace(/[.,;:?!()]/g, '')); return (b === first || b === 'coniuarvit') ? '<b>' + t + '</b>' : t; }).join(' ') : '';
    return {w, m, f, d, ctx};
  });
  TEXTS.push({n, r:ROMAN[n], t:titleOf(n), rows});
}
TEXTS.sort((a, b) => a.n - b.n);

/* ── 4 · έλεγχοι ── */
for (const t of TEXTS){
  need(t.rows.length > 0, t.r + ': μηδέν ρήματα');
  for (const r of t.rows){
    need(r.f, t.r + ' ' + r.w + ': κενός τύπος');
    need(/^[a-zāēīōūăĕĭŏŭ]/i.test(strip(LEX[r.m].l)), t.r + ' ' + r.m + ': αρχικοί χρόνοι χωρίς λατινικό');
    need(!/[ῑἰ]/.test(LEX[r.m].l), r.m + ': ελληνικό ι μέσα στους αρχικούς χρόνους');
  }
}
for (const k in LEX){
  const L = LEX[k];
  need(L.k, k + ': χωρίς συζυγία/είδος');
  need(strip(L.l.split(/[,\s]/)[0]) === strip(k), k + ': ο 1ος αρχικός χρόνος δεν είναι το λήμμα (' + L.l + ')');
  if (/αποθετικό/.test(L.k) && !/ημιαποθετικό/.test(L.k)) need(/ sum,/.test(L.l), k + ': αποθετικό χωρίς «… sum»');
}
/* XXI–XXVII: ίδιο πλήθος με τον πίνακα της σελίδας τους (το «tcG») */
for (const t of TEXTS.filter(t => HAS(t.n))){
  const j = JSON.parse(rd('tools/latinika/lectio' + t.n + '.json'));
  let c = 0; j.S.forEach(sc => sc.s.forEach(u => u.la.forEach(w => { if (w.m && j.M[w.m] && j.M[w.m].p === 'v') c++; })));
  need(c === t.rows.length, t.r + ': ' + t.rows.length + ' γραμμές ≠ ' + c + ' της σελίδας');
}
const nForms = TEXTS.reduce((a, t) => a + t.rows.length, 0), nLem = Object.keys(LEX).length;
if (fails.length){ fails.forEach(f => console.log('✗ ' + f)); console.log(fails.length + ' ✗'); process.exit(1); }
console.log('✓ ' + TEXTS.length + ' κείμενα · ' + nForms + ' τύποι · ' + nLem + ' ρήματα');
if (process.argv.includes('--check')) process.exit(0);

/* ── 5 · η σελίδα ── */
const tpl = rd('tools/latinika/lectio.tpl');
const head = tpl.slice(0, tpl.indexOf('</style>')).replace('{{TITLE}}', 'Λατινικά · Αρχικοί χρόνοι XVI–XXVII');
const page = rd('tools/latinika/archikoi.tpl')
  .replace('{{HEAD}}', () => head)
  .replaceAll('{{N_LEM}}', String(nLem)).replaceAll('{{N_FORMS}}', String(nForms)).replaceAll('{{N_TEXTS}}', String(TEXTS.length))
  .replace('{{DATA}}', () => 'const LEX = ' + JSON.stringify(LEX) + ';\nconst TEXTS = ' + JSON.stringify(TEXTS) + ';');
if (/\{\{[A-Z_]+\}\}/.test(page)){ console.log('✗ έμεινε placeholder: ' + page.match(/\{\{[A-Z_]+\}\}/)[0]); process.exit(1); }
fs.writeFileSync(path.join(ROOT, 'latinika-archikoi.html'), page);
console.log('→ latinika-archikoi.html (' + Math.round(page.length / 1024) + ' KB)');
