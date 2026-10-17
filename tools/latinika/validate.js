/* ══════════════════════════════════════════════════════════════════════
   tools/latinika/validate.js NN — σταματάει ΠΡΙΝ γραφτεί σελίδα.

   Τρέχει τους κανόνες του lib.js (ΙΔΙΟΥΣ με το test) πάνω στο
   tools/latinika/lectioNN.json, με την πηγή (tests/latinika-lectioNN.source.txt)
   και το πρόχειρο του study4exams (tools/latinika/lectioNN.s4e.json), συν τα
   `checks` του ίδιου του πακέτου πάνω στη σελίδα που ΘΑ έβγαινε.

   Exit 0 = μπορείς να τρέξεις build. Exit 1 = τυπώνει ΚΑΘΕ αποτυχία, με το πού.
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
const L = require('./lib');
const { build } = require('./build');

const nn = +process.argv[2];
if (!nn) { console.error('χρήση: node tools/latinika/validate.js NN'); process.exit(2); }
let p;
try { p = L.load(nn); } catch (e) { console.error('⛔ δεν διαβάζεται το tools/latinika/lectio' + nn + '.json: ' + e.message); process.exit(1); }
const src = L.readSource(nn), s4e = L.loadS4e(nn);
if (!s4e) console.log('⚠️  χωρίς πρόχειρο s4e (fetch-s4e) — οι αρχικοί χρόνοι ΔΕΝ συγκρίνονται');

let html = null;
try { html = build(p); } catch (e) { console.error('⛔ build: ' + e.message); process.exit(1); }
const all = L.rules(p, { src, s4e }).concat(L.runChecks(p, html, src));
const bad = all.filter(r => !r.ok);
bad.forEach(r => console.log('✗ ' + r.msg));
console.log((bad.length ? '✗ ' : '✓ ') + (all.length - bad.length) + '/' + all.length + ' κανόνες · ' +
  L.units(p).length + ' ενότητες · ' + L.words(p).length + ' λέξεις · ' + Object.keys(p.M).length + ' λήμματα');
process.exit(bad.length ? 1 : 0);
