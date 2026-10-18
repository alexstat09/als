/* ══════════════════════════════════════════════════════════════════════
   Μορφή του gkN.json: ό,τι είναι «απλό» (αριθμοί, κείμενα, πίνακες τους)
   σε ΜΙΑ γραμμή — μία κάρτα λέξης ανά γραμμή, μία πρόταση ανά γραμμή.
   `node tools/gnosto/fmt.js gk9` ξαναγράφει το αρχείο (ίδιο περιεχόμενο).
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
var fs = require('fs'), path = require('path');

function prim(v){ return v === null || typeof v !== 'object'; }
function simple(v){ return prim(v) || (Array.isArray(v) && v.every(function(x){ return prim(x) || (Array.isArray(x) && x.every(prim)); })); }
function one(v){ return JSON.stringify(v).replace(/","/g, '", "').replace(/\],\[/g, '], ['); }

function fmt(v, ind){
  ind = ind || '';
  var in2 = ind + '  ';
  if (simple(v)) return one(v);
  if (Array.isArray(v)){
    if (v.every(function(x){ return !Array.isArray(x) && x && typeof x === 'object' && Object.keys(x).every(function(k){ return simple(x[k]); }); }))
      return '[\n' + v.map(function(x){ return in2 + one(x); }).join(',\n') + '\n' + ind + ']';
    return '[\n' + v.map(function(x){ return in2 + fmt(x, in2); }).join(',\n') + '\n' + ind + ']';
  }
  var keys = Object.keys(v);
  if (!keys.length) return '{}';
  return '{\n' + keys.map(function(k){ return in2 + JSON.stringify(k) + ': ' + fmt(v[k], in2); }).join(',\n') + '\n' + ind + '}';
}

module.exports = { fmt: function(o){ return fmt(o) + '\n'; } };

if (require.main === module){
  var id = process.argv[2];
  if (!/^gk\d+$/.test(id || '')) { console.error('χρήση: node tools/gnosto/fmt.js gkN'); process.exit(2); }
  var f = path.join(__dirname, id + '.json');
  var o = JSON.parse(fs.readFileSync(f, 'utf8'));
  var out = module.exports.fmt(o);
  if (JSON.stringify(JSON.parse(out)) !== JSON.stringify(o)) { console.error('✗ η μορφοποίηση άλλαξε περιεχόμενο — ΔΕΝ γράφτηκε'); process.exit(1); }
  fs.writeFileSync(f, out);
  console.log('✓ ' + id + '.json μορφοποιήθηκε (' + out.split('\n').length + ' γραμμές)');
}
