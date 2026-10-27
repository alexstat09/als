/* tools/eisagogi/arxaia/scaffold.js — ΠΗΓΗ + ΣΚΕΛΕΤΟΣ ενός νέου κεφαλαίου, με μία εντολή.
     node tools/eisagogi/arxaia/scaffold.js <id> "<url>[::<αρχή επικεφαλίδας>]" [άλλο url…] [--lead] [--file x.html]
   π.χ. node tools/eisagogi/arxaia/scaffold.js sokratis-d3 \
          "https://old.ebooks.edu.gr/modules/ebook/show.php/DSGL-C128/680/4510,20309/::Δ3." --file arxaia-sokratis.html

   Τι κάνει (κανένα βήμα δεν θέλει κρίση):
     1 · curl κάθε σελίδα του βιβλίου (στο $TMPDIR, ποτέ στο repo) → το <div id="eclass_ebook_body">
     2 · κόβει την ενότητα: από την κεντραρισμένη επικεφαλίδα που αρχίζει με «<αρχή>» ως την επόμενη
         επικεφαλίδα (χωρίς «::» = όλη η σελίδα). Οι λεζάντες εικόνων ΔΕΝ μπαίνουν (μετριούνται).
         Οι υποσημειώσεις μπαίνουν ΜΟΝΟ όσες δείχνει η ενότητα (<sup>), ως @@NOTEn@@.
         --lead = και η τελευταία παράγραφος ΠΡΙΝ από την ενότητα, ως @@LEAD@@ (όπως στο Δ2).
     3 · <strong>/<b> → @@B@@…@@/B@@ · markup έξω · NFC (oxia → tonos) · μία παράγραφος ανά γραμμή
     4 · tests/arxaia-eisagogi-<id>.source.txt με κεφαλίδα (#) + sha, και <id>.json-σκελετό:
         ένας σταθμός ανά έντονο πλαγιότιτλο (ή ανά παράγραφο, αν δεν έχει), xy σε κύμα, κλειδί
         eisarx-<id>-v1, file/route/back. Κάθε «⟪…⟫» είναι κενό που ο validator ΑΡΝΕΙΤΑΙ.
   Τυπώνει ΜΟΝΟ περίληψη (σταθμοί, προτάσεις, πολυτονικά, αριθμοί, ονόματα). ⛔ Όχι όλη την πηγή.
   ⛔ Αρνείται αν υπάρχει ήδη <id>.json ή η πηγή του — ένα κεφάλαιο δεν ξαναστήνεται από πάνω του. */
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const cp = require('child_process');
const crypto = require('crypto');
const L = require('./lib');

const args = process.argv.slice(2);
const id = args[0];
const flag = k => { const i = args.indexOf(k); return i < 0 ? null : (args[i + 1] || ''); };
const urls = args.slice(1).filter((a, i, all) => /^https?:\/\//.test(a) && all[i - 1] !== '--file');
if (!/^[a-z0-9-]+$/.test(id || '') || !urls.length) {
  console.error('χρήση: node tools/eisagogi/arxaia/scaffold.js <id> "<url>[::<αρχή επικεφαλίδας>]" … [--lead] [--file x.html]');
  process.exit(2);
}
const JSONF = path.join(__dirname, id + '.json');
const SRCREL = 'tests/arxaia-eisagogi-' + id + '.source.txt';
const SRCF = path.join(L.REPO, SRCREL);
if (fs.existsSync(JSONF) || fs.existsSync(SRCF)) { console.error('⛔ υπάρχει ήδη ' + (fs.existsSync(JSONF) ? id + '.json' : SRCREL) + ' — δεν γράφω από πάνω'); process.exit(1); }
const TMP = path.join(process.env.TMPDIR || os.tmpdir(), 'eisagogi-' + id);
fs.mkdirSync(TMP, { recursive: true });

/* ── κείμενο ενός μπλοκ ── */
const ent = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', laquo: '«', raquo: '»', middot: '·' };
function unesc(s) {
  return s.replace(/&#x([0-9a-f]+);/gi, (m, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (m, d) => String.fromCodePoint(+d))
    .replace(/&([a-z]+);/gi, (m, n) => ent[n.toLowerCase()] != null ? ent[n.toLowerCase()] : m);
}
function text(inner) {
  let t = inner.replace(/<sup[^>]*>\s*(\d+)\s*<\/sup>/gi, '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>/gi, (m, tag, x) => '@@B@@' + x + '@@/B@@')
    .replace(/<[^>]+>/g, '');
  t = unesc(t).replace(/ /g, ' ').replace(/\s+/g, ' ').trim().normalize('NFC');
  /* έντονο που άδειασε ή κόλλησε με το επόμενο: «@@/B@@@@B@@» ενώνεται, κενά μένουν έξω */
  return t.replace(/@@\/B@@\s*@@B@@/g, ' ').replace(/@@B@@\s*@@\/B@@/g, '').replace(/@@B@@\s+/g, ' @@B@@').replace(/\s+@@\/B@@/g, '@@/B@@').trim();
}
function blocks(html) {
  const i = html.indexOf('eclass_ebook_body');
  if (i < 0) throw new Error('δεν βρέθηκε το eclass_ebook_body — άλλαξε η σελίδα του βιβλίου;');
  let b = html.slice(i);
  const sc = b.indexOf('<script'); if (sc > 0) b = b.slice(0, sc);
  const out = [];
  const re = /<(p|h\d)\b([^>]*)>([\s\S]*?)<\/\1>/gi;
  let m;
  while ((m = re.exec(b))) {
    const attr = m[2];
    let t = text(m[3]);
    if (!t) continue;
    let sups = (m[3].match(/<sup[^>]*>\s*(\d+)\s*<\/sup>/gi) || []).map(x => x.replace(/\D/g, ''));
    let kind = 'p';
    if (/^h/i.test(m[1])) kind = 'h';
    else if (/lezanta/.test(attr)) kind = 'cap';
    else if (/class="smal/.test(attr)) {
      /* υποσημείωση: ο αριθμός της είναι <sup> (κόβεται από το text) ή ψηφίο στην αρχή — ξαναμπαίνει μπροστά, όπως στο Δ2 */
      const k = sups[0] || (/^(\d+)\s/.exec(t) || [])[1];
      if (k) { kind = 'note'; t = k + ' ' + t.replace(/^\d+\s+/, ''); sups = []; }
    }
    else if (/align="center"/.test(attr) && !/class="paragraph"/.test(attr)) kind = 'h';
    out.push({ kind, t, sups });
  }
  return out;
}

/* ── 1+2 · κατέβασμα και κοπή ── */
const parts = [], when = new Date().toISOString().slice(0, 10);
let lead = null, heading = null, captions = 0;
urls.forEach((u, k) => {
  const [url, sec] = u.split('::');
  const f = path.join(TMP, 'page' + (k + 1) + '.html');
  const r = cp.spawnSync('curl', ['-sSL', '-m', '40', '-o', f, url], { encoding: 'utf8' });
  if (r.status !== 0 || !fs.existsSync(f)) { console.error('⛔ curl απέτυχε για ' + url + ': ' + (r.stderr || '').trim()); process.exit(1); }
  const all = blocks(fs.readFileSync(f, 'utf8'));
  let from = 0, to = all.length;
  if (sec) {
    from = all.findIndex(b => b.kind === 'h' && b.t.replace(/@@\/?B@@/g, '').startsWith(sec));
    if (from < 0) { console.error('⛔ στη σελίδα ' + (k + 1) + ' δεν υπάρχει επικεφαλίδα που αρχίζει με «' + sec + '». Υπάρχουν:\n  ' + all.filter(b => b.kind === 'h').map(b => b.t.slice(0, 70)).join('\n  ')); process.exit(1); }
    const nx = all.findIndex((b, i) => i > from && (b.kind === 'h' || b.kind === 'note'));
    to = nx < 0 ? all.length : nx;
    if (!k && args.includes('--lead')) lead = all.slice(0, from).filter(b => b.kind === 'p').slice(-1)[0] || null;
  }
  const body = all.slice(from, to);
  if (!heading) heading = (body.find(b => b.kind === 'h') || {}).t || null;
  captions += body.filter(b => b.kind === 'cap').length;
  /* η υποσημείωση μπαίνει αν τη δείχνει η ενότητα — ή το @@LEAD@@ της (η 2 του Δ2 κρέμεται από το Δ1) */
  const used = new Set([].concat(...body.map(b => b.sups), (!k && lead) ? lead.sups : []));
  const notes = all.filter(b => b.kind === 'note' && used.has(b.t.split(' ')[0]));
  parts.push({ url, sec: sec || '', body: body.filter(b => b.kind === 'p' || (b.kind === 'h' && sec)), notes });
});

/* ── 3 · η πηγή ── */
const H = [];
H.push('# ══════════════════════════════════════════════════════════════════════');
H.push('# ΕΙΣΑΓΩΓΗ ΑΡΧΑΙΩΝ · ' + (heading || id).replace(/@@\/?B@@/g, ''));
H.push('#');
H.push('# ⛔ ΜΗΝ ΤΟ ΑΚΟΥΜΠΗΣΕΙΣ ΜΕ ΤΟ ΧΕΡΙ. Είναι το κείμενο του σχολικού βιβλίου, κατεβασμένο');
H.push('# με curl από το tools/eisagogi/arxaia/scaffold.js. Το sha256 του είναι στο ' + id + '.json·');
H.push('# κάθε αλλαγή σκάει τον validator. ⛔ Ποτέ μεταγραφή από φωτογραφία.');
H.push('#');
H.push('# ΠΗΓΗ:  Αρχαία Ελληνικά — Φιλοσοφικός Λόγος, Γ\' Λυκείου Ανθρωπιστικών Σπουδών,');
H.push('#        Βιβλίο Μαθητή (Εμπλουτισμένο), ΥΠΑΙΘ / ΙΤΥΕ Διόφαντος.');
parts.forEach(p => H.push('#        ' + p.url + (p.sec ? '   (ενότητα «' + p.sec + '…»)' : '   (όλη η σελίδα)')));
H.push('# ΠΩΣ:   curl → <div id="eclass_ebook_body"> → markup έξω· <strong> → «@@B@@…@@/B@@»·');
H.push('#        οι λεζάντες εικόνων ΕΞΩ (' + captions + ')· υποσημειώσεις μόνο όσες δείχνει το κείμενο.');
H.push('# ⚠️ NFC: oxia → tonos. Ο validator απαγορεύει OXIA.');
if (lead) H.push('# ⭐ Το @@LEAD@@ είναι η τελευταία παράγραφος ΠΡΙΝ από την ενότητα (το πλαίσιό της).');
H.push('# ΠΟΤΕ:  ' + when + '.');
H.push('# ══════════════════════════════════════════════════════════════════════');
const B = [];
if (lead) B.push('@@LEAD@@', lead.t, '@@/LEAD@@');
parts.forEach(p => {
  p.body.forEach(b => B.push(b.t));
  p.notes.forEach(n => { const k = n.t.split(' ')[0]; B.push('', '@@NOTE' + k + '@@', n.t, '@@/NOTE' + k + '@@'); });
});
const raw = H.join('\n') + '\n' + B.join('\n') + '\n';
if (/[άέήίόύώΆΈΉΐΊΰΎΌΏ]/.test(raw)) { console.error('⛔ OXIA μετά το NFC — δεν γράφω'); process.exit(1); }
fs.writeFileSync(SRCF, raw);
const src = L.readSource(SRCREL);

/* ── 4 · ο σκελετός ── */
const paras = parts.reduce((a, p) => a.concat(p.body.filter(b => b.kind === 'p')), []);
const groups = [];
paras.forEach(b => {
  const m = /^@@B@@(.*?)@@\/B@@/.exec(b.t);
  if (m || !groups.length) groups.push({ head: m ? m[1].replace(/[.:·]\s*$/, '') : null, ps: [] });
  groups[groups.length - 1].ps.push(b.t.replace(/@@\/?B@@/g, ''));
});
/* καθόλου έντονοι πλαγιότιτλοι → ένας σταθμός ανά παράγραφο */
const st = groups.length > 1 ? groups : paras.map(b => ({ head: null, ps: [b.t.replace(/@@\/?B@@/g, '')] }));
const N = st.length;
const xy = i => [Math.round(110 + i * (N > 1 ? 875 / (N - 1) : 0)), i % 2 ? (Math.floor(i / 2) % 2 ? 100 : 112) : (Math.floor(i / 2) % 2 ? 230 : 248)];
const TODO = w => '⟪' + w + '⟫';
const hd = (heading || '').replace(/@@\/?B@@/g, '');
const route = (/^([Α-Ω]\d+)\./.exec(hd) || [])[1] || TODO('route, π.χ. Δ3');
const title = hd.replace(/^[Α-Ω]\d+\.\s*/, '').replace(/\.$/, '') || TODO('τίτλος του βιβλίου');
const file = flag('--file') || ('arxaia-' + id + '.html');
const d = {
  _: route + ' · ' + title + '. ⛔ Μόνο εδώ γράφεται το κεφάλαιο· η σελίδα βγαίνει με node tools/eisagogi/arxaia/finish.js ' + id + '. Πεδία: a = άγκυρες αυτολεξεί στο βιβλίο · mine = χειρόγραφο δικό του · mnem = μνημονικό. *όρος* · **έμφαση**.',
  file, key: 'eisarx-' + id + '-v1', route,
  back: { href: 'arxaia.html#gn', label: 'Αρχαία' },
  source: { file: SRCREL, sha: src.sha },
  title,
  counted: {},
  cover: {
    kicker: 'Κεφάλαιο ' + route + ' · ' + N + ' σταθμοί',
    sub: { t: TODO('υπότιτλος: μία πρόταση, λόγια του βιβλίου'), a: [TODO('άγκυρα')] },
    motto: { gr: TODO('μότο στα αρχαία, αυτολεξεί'), tr: TODO('απόδοση'), a: [TODO('άγκυρα')] },
    seal: { mark: TODO('μονόγραμμα'), ring: TODO('ΕΠΙΓΡΑΦΗ ΣΕ ΚΥΚΛΟ ·'), label: TODO('περιγραφή της σφραγίδας για αναγνώστη οθόνης') }
  },
  core: TODO('η φράση στη μέση του αστερισμού'),
  fin: { line: TODO('«Ο … έκλεισε.»'), next: 'Πέρνα στον Έλεγχο: ό,τι δεν ξέρεις ακόμα θα βρει μόνο του τον σταθμό του.' },
  stations: st.map((g, i) => ({
    n: i + 1, short: g.head ? g.head.split(/\s+/).slice(0, 3).join(' ') : TODO('2–3 λέξεις'), xy: xy(i),
    label: g.head || TODO('ετικέτα'), title: TODO('τίτλος σταθμού'),
    prose: [{ t: TODO('πρόζα'), a: [TODO('άγκυρα')] }],
    diagram: { type: TODO('flow|repeat|split|fork|dialogue|descent|ladder|scales') },
    points: [{ t: TODO('σημείο'), a: [TODO('άγκυρα')] }],
    gloss: []
  })),
  traps: [],
  check: { recall: [], tf: [], mc: [], numbers: [], numbersNote: '', pitfalls: [], idea: { t: TODO('η μεγάλη ιδέα'), a: [TODO('άγκυρα')] } },
  colophon: ['Το κείμενο είναι το «' + route + '. ' + title + '» του σχολικού βιβλίου (Φιλοσοφικός Λόγος Γ΄ Λυκείου), κατεβασμένο ' + when + '.']
};
fs.writeFileSync(JSONF, require('./fmt').format(d));

/* ── η περίληψη (το ΜΟΝΟ που διαβάζει το μοντέλο) ── */
const S = src.sentences, flat = src.flat;
const stOf = s => { for (let i = st.length - 1; i >= 0; i--) if (st[i].ps.some(p => L.norm(p).indexOf(s.slice(0, 40)) >= 0)) return i + 1; return 0; };
const per = {}; S.forEach(s => { const k = stOf(L.norm(s)); per[k] = (per[k] || 0) + 1; });
const uniq = a => [...new Set(a)];
const poly = uniq((flat.match(/[^\s.,;·«»"'()[\]…:!?-]+/g) || []).filter(t => /[ἀ-῿]/.test(t)));
const nums = uniq(flat.match(/\d+(?:\/\d+)?/g) || []);
const toks = flat.split(/\s+/), names = [];
toks.forEach((t, i) => { const w = t.replace(/[^\p{L}]/gu, ''); if (i && !/[.;!?:»]$/.test(toks[i - 1]) && /^\p{Lu}\p{Ll}{2,}/u.test(w) && !/[ἀ-῿]/.test(w)) names.push(w); });
const sha = crypto.createHash('sha256').update(raw).digest('hex');
console.log('✓ πηγή  ' + SRCREL + '  (' + S.length + ' προτάσεις, ' + paras.length + ' παράγραφοι, sha ' + sha.slice(0, 12) + '…)');
console.log('✓ json  tools/eisagogi/arxaia/' + id + '.json  →  ' + file + ' · κλειδί eisarx-' + id + '-v1 · ' + route + ' «' + title + '»');
if (lead) console.log('  + @@LEAD@@ (η παράγραφος πριν): «' + lead.t.slice(0, 60) + '…»');
parts.forEach(p => p.notes.length && console.log('  + υποσημειώσεις: ' + p.notes.map(n => n.t.split(' ')[0]).join(', ')));
if (captions) console.log('  − λεζάντες εικόνων έξω: ' + captions);
console.log('Σταθμοί (σκελετός — ξανασπάσε όπου θέλεις, κράτα τη σειρά του βιβλίου):');
st.forEach((g, i) => console.log('  ' + String(i + 1).padStart(2) + ' · ' + (g.head ? '«' + g.head.slice(0, 50) + '»' : '(χωρίς πλαγιότιτλο) «' + g.ps[0].slice(0, 40) + '…»') + ' — ' + g.ps.length + ' παρ., ' + (per[i + 1] || 0) + ' προτάσεις'));
console.log('Πολυτονικά (' + poly.length + '): ' + poly.slice(0, 14).join(' ') + (poly.length > 14 ? ' …' : ''));
console.log('Αριθμοί: ' + (nums.join(' ') || '—'));
console.log('Ονόματα: ' + uniq(names).slice(0, 24).join(' '));
console.log('Επόμενο: node tools/eisagogi/arxaia/bust.js ' + id + ' "<όνομα>"   ·   μετά γράψε το json (reference/schema.md)');
