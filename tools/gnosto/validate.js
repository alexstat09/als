/* Σταματάει ΠΡΙΝ γίνει σελίδα: `node tools/gnosto/validate.js gk9`.
   Οι κανόνες είναι οι ίδιοι με του test (lib.check). */
'use strict';
var path = require('path');
var L = require('./lib.js');
var id = process.argv[2] || 'gk9';
var spec = L.loadSpec(id), unit = L.loadUnit(id);
if (!unit) { console.error('✗ δεν υπάρχει ενότητα ' + id + ' στο arxaia-gnosto-data.js'); process.exit(1); }
var src = L.readSource(path.join(L.ROOT, spec.source));
var errs = L.check(spec, unit, src);
if (errs.length){
  errs.forEach(function(e){ console.error('✗ ' + e); });
  console.error('\n' + errs.length + ' σφάλματα — η σελίδα ΔΕΝ χτίζεται.');
  process.exit(1);
}
console.log('✓ ' + id + ': ' + Object.keys(spec.words).length + ' κάρτες λέξεων · ' +
  Object.keys(spec.structure.clauses).length + ' προτάσεις · ' + spec.scholia.length + ' σχόλια · ' +
  spec.activities.reduce(function(n, g){ return n + g.items.length; }, 0) + ' + ' +
  spec.parallels.reduce(function(n, p){ return n + p.items.length; }, 0) + ' ερμηνευτικά · ' +
  spec.lexika.length + ' λεξιλογικά');
