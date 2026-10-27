/* node tools/eisagogi/arxaia/validate.js sokratis-d2 — τρέχει τους κανόνες
   του lib.js και τυπώνει ό,τι αρνείται. Κωδικός εξόδου 1 με ένα σφάλμα. */
'use strict';
const L = require('./lib');
const name = process.argv[2] || 'sokratis-d2';
const d = L.load(name), src = L.readSource(d.source.file);
const errs = L.validate(d, src);
if (errs.length) { console.error('⛔ ' + errs.length + ' σφάλματα\n  ' + errs.join('\n  ')); process.exit(1); }
console.log('✓ ' + name + ': ' + src.sentences.length + ' προτάσεις του βιβλίου, όλες καλυμμένες · ' + L.items(d).length + ' κομμάτια ελεγμένα');
