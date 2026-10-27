/* tools/eisagogi/arxaia/fmt.js — η ΜΟΡΦΗ ενός κεφαλαίου, ίδια με το sokratis-d2.json.
   node tools/eisagogi/arxaia/fmt.js <id>          → ξαναγράφει το <id>.json (μόνο αν αλλάζει)
   node tools/eisagogi/arxaia/fmt.js <id> --check  → κωδικός 1 αν δεν είναι ήδη στη μορφή
   ⛔ als-v674: ένα JSON.stringify(d, null, 2) ολόκληρου του αρχείου άλλαξε τη μορφή κάθε γραμμής
   και έκανε το diff αδιάβαστο. Εδώ η μορφή είναι ΚΑΝΟΝΑΣ ανά θέση· το test απαιτεί
   fmt(sokratis-d2.json) === sokratis-d2.json, byte προς byte.
   Οι κανόνες:
     · ανοιχτά (μία γραμμή ανά κλειδί/στοιχείο): η ρίζα, source, counted, cover, check, το
       diagram, και κάθε πίνακας αντικειμένων (stations, prose, points, gloss, traps, check.*,
       οι πίνακες του σχεδίου) και ο colophon
     · ο σταθμός: «n, short, xy» στην πρώτη γραμμή, μετά ένα κλειδί ανά γραμμή
     · prose/points: { "t": … ,⏎ "a": […] } — η άγκυρα κάτω από το κείμενο
     · όλα τα άλλα σε μία γραμμή: { "k": v, … } και [a, b] */
'use strict';
const fs = require('fs');
const path = require('path');

const s = v => JSON.stringify(v);
function inline(v) {
  if (Array.isArray(v)) return '[' + v.map(inline).join(', ') + ']';
  if (v && typeof v === 'object') {
    const k = Object.keys(v);
    return k.length ? '{ ' + k.map(x => s(x) + ': ' + inline(v[x])).join(', ') + ' }' : '{}';
  }
  return s(v);
}
const isObjArr = v => Array.isArray(v) && v.length && v.every(x => x && typeof x === 'object' && !Array.isArray(x));

function arr(v, ind, item) {
  if (!v.length) return '[]';
  const p = ' '.repeat(ind + 2);
  return '[\n' + v.map(x => p + item(x, ind + 2)).join(',\n') + '\n' + ' '.repeat(ind) + ']';
}
function obj(v, ind, val) {
  const p = ' '.repeat(ind + 2);
  return '{\n' + Object.keys(v).map(k => p + s(k) + ': ' + val(k, v[k], ind + 2)).join(',\n') + '\n' + ' '.repeat(ind) + '}';
}
/* prose/points: το κείμενο, και η άγκυρα από κάτω (δύο κενά πιο μέσα) */
function ta(x, ind) {
  const k = Object.keys(x);
  if (k[0] !== 't' || k.indexOf('a') < 0) return inline(x);
  const rest = k.filter(q => q !== 't' && q !== 'a');
  return '{ "t": ' + s(x.t) + rest.map(q => ', ' + s(q) + ': ' + inline(x[q])).join('') + ',\n' +
    ' '.repeat(ind + 2) + '"a": ' + inline(x.a) + ' }';
}
function diagram(d, ind) {
  return obj(d, ind, (k, v, i) => isObjArr(v) ? arr(v, i, inline) : inline(v));
}
function station(st, ind) {
  const p = ' '.repeat(ind + 2), head = ['n', 'short', 'xy'].filter(k => k in st);
  const lines = [head.map(k => s(k) + ': ' + inline(st[k])).join(', ')];
  Object.keys(st).filter(k => head.indexOf(k) < 0).forEach(k => {
    const v = st[k];
    let out;
    if (k === 'la' && 'label' in st) return;     /* η άγκυρα της ετικέτας κάθεται δίπλα της */
    if (k === 'label' && st.la) { lines.push(s(k) + ': ' + inline(v) + ', "la": ' + inline(st.la)); return; }
    if (k === 'prose' || k === 'points') out = arr(v, ind + 2, ta);
    else if (k === 'diagram') out = diagram(v, ind + 2);
    else if (isObjArr(v)) out = arr(v, ind + 2, inline);
    else out = inline(v);
    lines.push(s(k) + ': ' + out);
  });
  return '{\n' + lines.map(l => p + l).join(',\n') + '\n' + ' '.repeat(ind) + '}';
}
const OPEN = new Set(['source', 'counted', 'cover']);
function format(d) {
  return obj(d, 0, (k, v, i) => {
    if (k === 'stations') return arr(v, i, station);
    if (k === 'check') return obj(v, i, (k2, v2, i2) => isObjArr(v2) ? arr(v2, i2, inline) : inline(v2));
    if (k === 'colophon' || isObjArr(v)) return arr(v, i, inline);
    if (OPEN.has(k) && v && typeof v === 'object' && !Array.isArray(v)) return obj(v, i, (k2, v2) => inline(v2));
    return inline(v);
  }) + '\n';
}

if (require.main === module) {
  const id = process.argv[2];
  if (!/^[a-z0-9-]+$/.test(id || '')) { console.error('χρήση: node tools/eisagogi/arxaia/fmt.js <id> [--check]'); process.exit(2); }
  const f = path.join(__dirname, id + '.json');
  const raw = fs.readFileSync(f, 'utf8');
  let d;
  try { d = JSON.parse(raw); } catch (e) { console.error('⛔ ' + id + '.json δεν είναι έγκυρο JSON: ' + e.message); process.exit(1); }
  const out = format(d);
  if (JSON.stringify(JSON.parse(out)) !== JSON.stringify(d)) { console.error('⛔ η μορφοποίηση άλλαξε τα δεδομένα — δεν γράφω'); process.exit(1); }
  if (out === raw) { console.log('✓ ' + id + '.json ήδη στη μορφή'); process.exit(0); }
  if (process.argv.includes('--check')) { console.error('✗ ' + id + '.json δεν είναι στη μορφή (node tools/eisagogi/arxaia/fmt.js ' + id + ')'); process.exit(1); }
  fs.writeFileSync(f, out);
  console.log('✓ ' + id + '.json μορφοποιήθηκε');
}
module.exports = { format };
