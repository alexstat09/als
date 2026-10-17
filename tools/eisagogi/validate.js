/* tools/eisagogi/validate.js — σταματάει ΠΡΙΝ γραφτεί σελίδα.
   Exit 0 = μπορεί να τρέξει το build. Exit 1 = τυπώνει κάθε αποτυχία. */
'use strict';
const L = require('./lib');
let d;
try { d = L.load(); } catch (e) { console.error('⛔ δεν διαβάζεται το eisagogi.json: ' + e.message); process.exit(1); }
const src = L.readSource();
const errs = L.validate(d, src);
errs.forEach(e => console.log('✗ ' + e));
const nMarks = Object.keys(d.marks).reduce((a, k) => a + d.marks[k].length, 0);
console.log((errs.length ? '✗ ' : '✓ ') + 'πηγή ' + src.length + ' παράγραφοι · ' + nMarks + ' σημάδια · ' +
  d.pairs.length + ' ζεύγη · ' + errs.length + ' σφάλματα');
process.exit(errs.length ? 1 : 0);
