/* ══════════════════════════════════════════════════════════════════════
   tools/latinika/build.js — lectioNN.json → latinika-lectioNN.html

     node tools/latinika/build.js 24            γράφει latinika-lectio24.html
     node tools/latinika/build.js 24 --check    ΔΕΝ γράφει· exit 1 αν διαφέρει
     node tools/latinika/build.js 24 --fmt      ξαναγράφει το JSON στην κανονική μορφή

   ⭐ Το look και η μηχανή ζουν ΜΙΑ φορά, στο lectio.tpl. Το πακέτο
   είναι ΜΟΝΟ δεδομένα. Το test απαιτεί build(json) === αρχείο για κάθε
   πακέτο, άρα ένα χέρι που αγγίζει την HTML σκάει το build.

   ⛔ Το `const S = [` μένει inline, μία λέξη ανά γραμμή, στη μορφή που
   διαβάζουν η βιβλιοθήκη, η «Σύνταξε μόνος σου» και τα tests.
   ⛔ Κάθε αντικατάσταση με ΣΥΝΑΡΤΗΣΗ — το `$$` στο δεύτερο όρισμα της
   replace είναι ειδικό (σταθ. 58).
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');
const L = require('./lib');

const TEMPLATE = path.join(__dirname, 'lectio.tpl');
const J = v => JSON.stringify(v);
const IDENT = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const key = k => (IDENT.test(k) || /^\d+$/.test(k)) ? k : J(k);

/* ── σειριοποίηση: ΜΙΑ σταθερή μορφή ── */
function serWord(w) {
  const o = [];
  ['w', 'g', 'd', 'x', 'm', 'f', 'q', 'n'].forEach(k => { if (w[k] != null) o.push(k + ':' + J(w[k])); });
  const extra = Object.keys(w).filter(k => ['w', 'g', 'd', 'x', 'm', 'f', 'q', 'n'].indexOf(k) < 0);
  if (extra.length) throw new Error('άγνωστο πεδίο λέξης «' + extra.join(',') + '» στο «' + w.w + '» (επιτρέπονται w g d x m f q n)');
  return '{' + o.join(',') + '}';
}
function serS(S) {
  return 'const S = [\n' + S.map(sc =>
    '{n:' + J(sc.n) + ', title:' + J(sc.title) + ', flow:' + J(sc.flow) + ', s:[\n' +
    sc.s.map(u =>
      ' {\n  la:[\n' + u.la.map(w => '   ' + serWord(w)).join(',\n') + '\n  ],\n' +
      '  gr:[' + u.gr.map(g => '{t:' + J(g.t) + ',g:' + J(g.g) + '}').join(',') + ']\n }'
    ).join(',\n') + '\n]}'
  ).join(',\n') + '\n];';
}
function serM(M) {
  const ORDER = ['p', 'l', 'g', 'k', 'dep', 'tr'];
  let prev = null, out = '';
  Object.keys(M).forEach((k, i) => {
    const e = M[k];
    Object.keys(e).forEach(f => { if (ORDER.indexOf(f) < 0) throw new Error('άγνωστο πεδίο λήμματος «' + f + '» στο ' + k); });
    const line = '  ' + key(k) + ':{' + ORDER.filter(f => e[f] != null).map(f => f + ':' + J(e[f])).join(',') + '}';
    out += (i ? ',\n' + (e.p !== prev ? '\n' : '') : '') + line;
    prev = e.p;
  });
  return 'const M = {\n' + out + '\n};';
}
function serCL(CL) {
  return 'const CL = {\n' + Object.keys(CL).map(q => '  ' + key(q) + ':{d:' + J(CL[q].d) + ',t:' + J(CL[q].t) + ',s:' + J(CL[q].s) + '}').join(',\n') + '\n};';
}
function serNT(NT) {
  return 'const NOTE_T = {\n' + Object.keys(NT).map(k => '  ' + key(k) + ':' + J(NT[k])).join(',\n') + '\n};';
}
function serTraps(T) {
  return T.map((t, i) => '        <li><div class="n">' + (i + 1) + '</div><span class="lat">' + t.lat + '</span><span class="fix">' + t.fix + '</span><span class="why">' + t.why + '</span></li>').join('\n');
}
function serNotes(N) {
  return N.map(n => '        <li class="nt" id="n-' + n.id + '">\n' +
    '          <div class="src">' + n.src + '</div>\n' +
    '          <h4>' + n.h4 + '</h4>\n' +
    n.body.map(l => '          ' + l).join('\n') + '\n        </li>').join('\n');
}

function serLesson(o) {
  const ks = Object.keys(o);
  if (!ks.length) return '{}';
  return '{\n' + ks.map(k => '  ' + key(k) + ': ' + (Array.isArray(o[k].boxes)
    ? '{h2:' + J(o[k].h2) + ', sub:' + J(o[k].sub) + ', boxes:[\n' + o[k].boxes.map(b => '    ' + J(b)).join(',\n') + '\n  ]}'
    : J(o[k]))).join(',\n') + '\n}';
}

function build(p, template) {
  template = template || fs.readFileSync(TEMPLATE, 'utf8');
  const R = L.roman(p.nn), lens = L.LENS[p.face.lens];
  if (!lens) throw new Error('άγνωστος φακός εξωφύλλου: ' + p.face.lens);
  const nFace = L.lensWords(p, p.face.lens).length;
  const V = {
    NN: String(p.nn), ROMAN: R, PREV_ROMAN: L.roman(p.nn - 1), ORDINAL: p.ordinal, TEFXOS: L.tefxos(p.nn),
    TITLE: 'Lectio ' + R + ' — ' + p.h1.replace(/<br>/g, ' '),
    H1: p.h1, LEAD: p.lead,
    FACE_N: String(nFace), FACE_LENS: p.face.lens, FACE_LABEL: lens[0].toLowerCase(),
    FACE_EX: lens[1] + ' ' + nFace + ' ' + lens[0].toLowerCase(),
    UNITS: String(L.units(p).length),
    TRAPS: serTraps(p.traps), NOTES_SUB: p.notesSub, NOTES: serNotes(p.notes),
    FOOT: p.foot.join('<br>\n    '),
    S: serS(p.S), M: serM(p.M), CL: serCL(p.CL), NOTE_T: serNT(p.NOTE_T),
    LESSON: serLesson(p.lesson || {}), ATTN: J(p.attn || ''),
    CARDS_AKL: J(p.cardsAkl || [])
  };
  Object.keys(V).forEach(k => { if (/\{\{[A-Z0-9_]+\}\}/.test(V[k])) throw new Error('το πεδίο ' + k + ' περιέχει {{…}}'); });
  const html = template.replace(/\{\{([A-Z0-9_]+)\}\}/g, (m, k) => {
    if (!(k in V)) throw new Error('άγνωστη θέση {{' + k + '}} στο πρότυπο');
    return V[k];
  });
  return html;
}

/* ── η κανονική μορφή του JSON: μία λέξη ανά γραμμή, για να διαβάζεται
   και να κάνει μικρά diff ── */
function fmt(p) {
  const top = Object.keys(p).filter(k => k !== 'S');
  const lines = ['{'];
  const parts = top.map(k => '  ' + J(k) + ': ' + (['traps', 'notes', 'foot'].indexOf(k) >= 0 && Array.isArray(p[k])
    ? '[\n' + p[k].map(x => '    ' + J(x)).join(',\n') + '\n  ]'
    : ['M', 'CL', 'NOTE_T', 's4eDiffs'].indexOf(k) >= 0 && p[k] && typeof p[k] === 'object'
      ? (Object.keys(p[k]).length ? '{\n' + Object.keys(p[k]).map(q => '    ' + J(q) + ': ' + J(p[k][q])).join(',\n') + '\n  }' : '{}')
      : JSON.stringify(p[k], null, 1).replace(/\n/g, '\n  ')));
  const S = '  "S": [\n' + p.S.map(sc =>
    '   {"n": ' + J(sc.n) + ', "title": ' + J(sc.title) + ', "flow": ' + J(sc.flow) + ', "s": [\n' +
    sc.s.map(u => '    {"la": [\n' + u.la.map(w => '      ' + J(w)).join(',\n') + '\n     ],\n     "gr": ' + J(u.gr) + '}').join(',\n') +
    '\n    ]}').join(',\n') + '\n  ]';
  const sIdx = Object.keys(p).indexOf('S');
  parts.splice(sIdx < 0 ? parts.length : sIdx, 0, S);
  return lines.concat(parts.join(',\n')).join('\n') + '\n}\n';
}

module.exports = { build, fmt, serS, serM, TEMPLATE };

if (require.main === module) {
  const nn = +process.argv[2];
  if (!nn) { console.error('χρήση: node tools/latinika/build.js NN [--check|--fmt]'); process.exit(2); }
  const p = L.load(nn);
  if (process.argv.includes('--fmt')) {
    const f = fmt(p);
    if (JSON.stringify(JSON.parse(f)) !== JSON.stringify(p)) throw new Error('η μορφοποίηση άλλαξε δεδομένα');
    fs.writeFileSync(L.jsonPath(nn), f);
    console.log('μορφοποιήθηκε', L.jsonPath(nn));
    process.exit(0);
  }
  const html = build(p);
  const out = L.htmlPath(nn);
  if (process.argv.includes('--check')) {
    const cur = fs.existsSync(out) ? fs.readFileSync(out, 'utf8') : '';
    if (cur === html) { console.log('✓ ' + path.basename(out) + ' == build(lectio' + nn + '.json)'); process.exit(0); }
    const a = cur.split('\n'), b = html.split('\n');
    for (let i = 0; i < Math.max(a.length, b.length); i++) if (a[i] !== b[i]) { console.error('✗ γραμμή ' + (i + 1) + '\n  αρχείο: ' + (a[i] || '∅').slice(0, 160) + '\n  build:  ' + (b[i] || '∅').slice(0, 160)); break; }
    process.exit(1);
  }
  fs.writeFileSync(out, html);
  console.log('έγραψα', out, html.length, 'bytes');
}
