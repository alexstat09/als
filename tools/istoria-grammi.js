/* ══════════════════════════════════════════════════════════════════════
   tools/istoria-grammi.js — «Κατάλαβέ το» γραμμή γραμμή, ανά ενότητα.

   Γράφεις ΜΟΝΟ tools/istoria-grammi/<id>.json. Το script κόβει τις παραγράφους
   της σελίδας σε προτάσεις, βρίσκει πού τελειώνει κάθε γραμμή (`to`) και
   ξαναγράφει το πεδίο `grammi` του κεφαλαίου στην istoria-voithima.html.

     node tools/istoria-grammi.js show <id>     οι προτάσεις + τα κλειδιά του Λεξικού
     node tools/istoria-grammi.js check [id…]   μόνο έλεγχος, η σελίδα δεν αλλάζει
     node tools/istoria-grammi.js build [id…]   έλεγχος και εγγραφή (χωρίς id: όλα)

   Στο json κάθε κρίκος έχει `ps` (πόσες παραγράφους πιάνει, 1 αν λείπει) και
   `lines`: "κείμενο" = μία πρόταση · ["κείμενο", 2] = δύο προτάσεις σε μία γραμμή ·
   {"to":"…","s":"…"} = δικό σου όριο. Στο κείμενο: **κίτρινο** (λέξεις του βιβλίου),
   [[λέξη|κλειδί Λεξικού]], {ΟΜΩΣ} {ΓΙΑΤΙ} {ΑΡΑ}.
   ⭐ Η γραμμή ΕΞΗΓΕΙ («δηλαδή τι σημαίνει, γιατί οδηγεί στο επόμενο»), δεν συμπυκνώνει: δική του
   ετυμηγορία, η σύνοψη δεν τον βοήθησε. Δική του εντολή: «μη φοβάσαι, απλά μην υπερβάλεις». Το όριο (3× ή +30 λέξεις) πιάνει μόνο το φούσκωμα. Καμία αιτία εκτός βιβλίου.
   `plag: true` στην ενότητα: κάθε κρίκος = ΜΙΑ παράγραφος του ΒΙΒΛΙΟΥ (όχι κομμάτι της σελίδας: όρια από τις εσοχές του PDF) και ο τίτλος του = ο πλαγιότιτλός της. `ps: 0` + γραμμές {p,to,s}: παράγραφος που αρχίζει μέσα σε κομμάτι. Ερωτήσεις: `at:[n]` μία ολόκληρη παράγραφος (Β θέμα), μία ανά κρίκο · `whole:true, at:[]` όλη η ενότητα (Γ θέμα).
   Σταματά χωρίς να γράψει αν κάτι δεν στέκει. Ο φρουρός του app είναι το
   tests/istoria-voithima.test.js.
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..'), PAGE = path.join(ROOT, 'istoria-voithima.html'), DIR = path.join(__dirname, 'istoria-grammi'), STORY = 'k2-story.json';

function chapters(src) {
  const ctx = {}; vm.createContext(ctx);
  for (const [, s] of src.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
    if (!/id: "k2-a1"/.test(s)) continue;
    const cut = s.search(/\n\/\* ─── |\nconst \$ =/);
    return vm.runInContext('(function(){' + (cut > 0 ? s.slice(0, cut) : s) + ';return CHAPTERS})()', ctx);
  }
  throw new Error('δεν βρέθηκαν τα CHAPTERS');
}
function sentences(p) {
  const keep = /^(?:π\.χ|κ\.ά|κ\.λπ|δηλ|Δημ|[Α-ΩΆ-Ώ]{1,2}|Χαρ|Στ|Αλ)$/, out = [];
  const re = /[.;]+(?=\s+[«(]?[Α-ΩΆ-Ώ])/g; let m, cur = 0;
  while ((m = re.exec(p))) {
    const last = p.slice(cur, m.index).split(/\s+/).pop();
    if (keep.test(last)) continue;
    out.push(p.slice(cur, m.index + m[0].length).trim());
    cur = m.index + m[0].length;
  }
  if (p.slice(cur).trim()) out.push(p.slice(cur).trim());
  return out;
}
const flat = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').toLowerCase().trim();
const plain = s => s.replace(/\{[^}]+\}/g, ' ').replace(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g, '$1').replace(/\*\*/g, '');
const tail = (p, end) => { /* το μικρότερο τέλος πρότασης που βρίσκεται μοναδικά από εκεί και πέρα */
  for (let n = 3; n <= 40; n++) { const t = end.split(/\s+/).slice(-n).join(' '); if (p.split(t).length === 2 || t === end) return t; }
  return end;
};

function expand(C, u, errs) {
  let pi = 0;
  const acts = u.acts.map((a, ai) => {
    const lines = [], n = a.ps === 0 ? 0 : a.ps || 1;
    const q = [];
    for (let k = 0; k < n; k++) sentences(C.paragraphs[pi + k]).forEach(s => q.push({ s, p: pi + k }));
    let qi = 0, cur = -1, off = 0;
    a.lines.forEach((l, li) => {
      const tag = `${C.id} κρίκος ${ai + 1} γρ. ${li + 1}`;
      if (l && l.to) {
        const p = l.p != null ? l.p : pi; lines.push({ p, to: l.to, s: l.s });
        const para = C.paragraphs[p];
        if (para.indexOf(l.to) < 0) errs.push(`${tag}: δεν βρέθηκε «${l.to}»`);
        (l.s.match(/\*\*(.+?)\*\*/g) || []).forEach(b => { if (!flat(para).includes(flat(plain(b)))) errs.push(`${tag}: κίτρινο εκτός «${plain(b)}»`); });
        for (const m of l.s.matchAll(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g)) {
          const key = m[2] || m[1];
          if (!C.glossary.some(g => g.m === key) && !(u.words || {})[key]) errs.push(`${tag}: χωρίς εξήγηση «${key}»`);
        }
        return;
      }
      const [s, take] = Array.isArray(l) ? l : [l, 1], got = q.slice(qi, qi + take);
      qi += take;
      if (got.length < take) return errs.push(`${tag}: τελείωσαν οι προτάσεις`);
      if (got[0].p !== got[got.length - 1].p) errs.push(`${tag}: η γραμμή πιάνει δύο παραγράφους`);
      const bk = got.map(x => x.s).join(' ');
      const nb = bk.split(/\s+/).length, np = plain(s).trim().split(/\s+/).length;
      if (np > Math.max(nb * 3, nb + 30)) errs.push(`${tag}: ${np} λέξεις, το βιβλίο ${nb} «${bk.slice(0, 50)}»`);
      const para = C.paragraphs[got[0].p];
      (s.match(/\*\*(.+?)\*\*/g) || []).forEach(b => { if (!flat(para).includes(flat(plain(b)))) errs.push(`${tag}: κίτρινο εκτός «${plain(b)}»`); });
      for (const m of s.matchAll(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g)) {
        const key = m[2] || m[1];
        if (!C.glossary.some(g => g.m === key) && !(u.words || {})[key]) errs.push(`${tag}: χωρίς εξήγηση «${key}»`);
      }
      lines.push({ p: got[0].p, to: tail(para, got[got.length - 1].s), s });
    });
    if (!a.lines.some(l => l && l.to) && qi !== q.length) errs.push(`${C.id} κρίκος ${ai + 1}: ${q.length} προτάσεις, ${qi} γραμμές · επόμενη «${(q[qi] || {}).s}»`);
    pi += n;
    const { ps, ...head } = a;
    return { ...head, lines };
  });
  if (pi !== C.paragraphs.length) errs.push(`${C.id}: οι κρίκοι πιάνουν ${pi} από ${C.paragraphs.length} παραγράφους`);
  const book = flat(C.paragraphs.join(' '));
  (u.questions || []).forEach(q => [q.start, ...q.take].forEach(w => { if (!book.includes(flat(w))) errs.push(`${C.id} ερώτηση: εκτός βιβλίου «${w}»`); }));
  const { acts: _, ...rest } = u;
  return { ...rest, acts };
}
function emit(g) {
  const J = x => JSON.stringify(x);
  const L = ['  grammi: {'];
  for (const k of Object.keys(g)) {
    if (k !== 'acts') { L.push(`    ${k}: ${J(g[k])},`); continue; }
    L.push('    acts: [');
    g.acts.forEach(a => {
      const { lines, ...h } = a;
      L.push(`      Object.assign(${J(h)}, { lines: [`);
      lines.forEach(l => L.push('        ' + J(l) + ','));
      L.push('      ] }),');
    });
    L.push('    ],');
  }
  L.push('  },', '', '');
  return L.join('\n');
}
function write(src, id, g) {
  const i = src.indexOf(`  id: "${id}",`); if (i < 0) throw new Error('χωρίς κεφάλαιο ' + id);
  const j = src.indexOf('  paragraphs: [', i);
  let head = src.slice(i, j);
  const g0 = head.indexOf('  grammi: {');
  if (g0 >= 0) head = head.slice(0, g0);
  head = head.replace(/ *\/\* «Κατάλαβέ το» γραμμή γραμμή\.[\s\S]*?\*\/\s*$/, '');
  return src.slice(0, i) + head.replace(/\s*$/, '\n\n') + emit(g) + src.slice(j);
}

const [cmd, ...ids] = process.argv.slice(2);
const src = fs.readFileSync(PAGE, 'utf8'), CH = chapters(src);
if (cmd === 'show') {
  ids.forEach(id => { const c = CH.find(x => x.id === id); console.log('\n## ' + id + ' ' + c.title);
    c.paragraphs.forEach((p, i) => { console.log('P' + (i + 1)); sentences(p).forEach((s, j) => console.log(' ' + (j + 1) + '. ' + s)); });
    console.log('M: ' + c.glossary.map(g => g.m).join(' | ')); });
} else if (cmd === 'build' || cmd === 'check') {
  const all = ids.length ? ids : fs.readdirSync(DIR).filter(f => f.endsWith('.json') && f !== STORY).map(f => f.slice(0, -5));
  const errs = [], out = {}; let tb = 0, tp = 0;
  all.forEach(id => {
    const C = CH.find(x => x.id === id); if (!C) return errs.push('χωρίς κεφάλαιο ' + id);
    const u = JSON.parse(fs.readFileSync(path.join(DIR, id + '.json'), 'utf8'));
    out[id] = expand(C, u, errs);
    const w = out[id].acts.flatMap(a => a.lines).reduce((n, l) => n + plain(l.s).trim().split(/\s+/).length, 0), b = C.paragraphs.join(' ').split(/\s+/).length;
    tb += b; tp += w; console.log(`  ${id}: ${out[id].acts.length} κρίκοι · ${w}/${b} λέξεις (${Math.round(w * 100 / b)}%) · ${out[id].questions.length} ερωτήσεις`);
  });
  if (errs.length) { console.error('✗\n' + errs.join('\n')); process.exit(1); }
  if (cmd === 'check') { console.log(`✓ έλεγχος χωρίς εγγραφή · ${tp}/${tb} λέξεις (${Math.round(tp * 100 / tb)}%)`); process.exit(0); }
  let s = src; all.forEach(id => { s = write(s, id, out[id]); });
  fs.writeFileSync(PAGE, s); console.log(`✓ ${all.length} ενότητες · ${tp}/${tb} λέξεις (${Math.round(tp * 100 / tb)}%)`);
} else if (cmd === 'story') {
  /* «Το κεφάλαιο σαν μία ιστορία» (#/kefalaio-2): το κείμενο ζει στο k2-story.json και μπαίνει
     στη σελίδα ως μία γραμμή `const K2STORY = …;`. Ο έλεγχος (έντονα + αριθμοί μέσα στο βιβλίο)
     είναι στο tests/istoria-voithima.test.js. */
  const j = JSON.stringify(JSON.parse(fs.readFileSync(path.join(DIR, STORY), 'utf8')));
  const re = /\nconst K2STORY = .*;\n/;
  if (!re.test(src)) { console.error('✗ δεν βρέθηκε η γραμμή const K2STORY'); process.exit(1); }
  fs.writeFileSync(PAGE, src.replace(re, () => '\nconst K2STORY = ' + j + ';\n')); console.log('✓ K2STORY · ' + j.length + ' χαρακτήρες');
} else { console.error('show <id> | build [id…] | story'); process.exit(1); }
