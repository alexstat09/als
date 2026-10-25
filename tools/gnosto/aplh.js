/* ══════════════════════════════════════════════════════════════════════
   ΑΡΧΑΙΑ · ΓΝΩΣΤΟ — Η ΑΠΛΗ ΜΕΤΑΦΡΑΣΗ ΜΙΑΣ ΕΝΟΤΗΤΑΣ (πεδίο `aplh` του gkN.json).
   Πρότυπο: gk10 (als-v663→666) — «συμφώνησα, την έμαθα, τη λάτρεψα».

     node tools/gnosto/aplh.js gkN --init   → στήνει το `aplh` ΑΠΟ ΤΟΝ ΜΕΤΑΦΡΑΣΤΗ:
                                             `align` = τα κομμάτια του βιβλίου αυτούσια
                                             (κάθε ζευγάρι ήδη σωστό), `segs` = ενωμένα.
                                             Αν υπάρχει ήδη `aplh`: δεν αγγίζει τίποτα (exit 0).
     node tools/gnosto/aplh.js gkN          → φύλλο εργασίας: ανά περίοδο οι λέξεις του
                                             αρχαίου (A), ο μεταφραστής (M), η απλή (S)
                                             και τι άλλαξε· στο τέλος ΟΛΑ τα σφάλματα
                                             του validator που αφορούν την απλή.
     node tools/gnosto/aplh.js gkN --segs   → ξαναγράφει τα `segs` από τα `align`
                                             (ένα σημείο αλήθειας: γράφεις ΜΟΝΟ align).
     node tools/gnosto/aplh.js gkN --patch Φ.json
                                           → ⭐ ο ΦΘΗΝΟΣ τρόπος να γράψεις την απλή: το Φ.json
                                             έχει ΜΟΝΟ ό,τι αλλάζεις —
                                             { "align": { "N": [[κείμενο, κλειδί|0], …] },  ← ΟΛΗ η περίοδος
                                               "none": { κλειδί: "γιατί" },                 ← συγχωνεύεται
                                               "changes": [[βιβλίο, εδώ, γιατί], …] }        ← ΑΝΤΙΚΑΘΙΣΤΑ
                                             Γράφει, ξαναβγάζει τα `segs`, και τυπώνει ΜΟΝΟ
                                             τα σφάλματα της απλής (0 ✗ = έτοιμο).

   Ο μόνος γραφέας του JSON εδώ είναι το fmt (ίδια μορφή, και αρνείται αν η
   μορφοποίηση αλλάξει περιεχόμενο).
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
var fs = require('fs'), path = require('path');
var L = require('./lib.js'), F = require('./fmt.js');

var PUNCT = /^[\s,.;:·’'—–()«»!?]+$/;

function save(id, spec){
  var f = path.join(__dirname, id + '.json');
  var out = F.fmt(spec);
  if (JSON.stringify(JSON.parse(out)) !== JSON.stringify(spec)) throw new Error('η μορφοποίηση άλλαξε περιεχόμενο — ΔΕΝ γράφτηκε');
  fs.writeFileSync(f, out);
}

/* Τα κομμάτια του βιβλίου για μια περίοδο, χωρίς το τελικό κενό (η απλή είναι
   trim-αρισμένη)· ό,τι μείνει άδειο φεύγει. */
function bookChunks(s){
  var al = s.m.map(function(c){ return [c[0], c[1] || 0]; });
  while (al.length){
    var last = al[al.length - 1], t = last[0].replace(/\s+$/, '');
    if (t){ last[0] = t; break; }
    al.pop();
  }
  return al;
}

function init(id, spec, unit){
  /* ξανατρέξιμο της αλυσίδας του skill: ΠΟΤΕ πάνω σε δουλειά, και χωρίς να σπάσει το && */
  if (spec.aplh){ console.log('· ' + id + ': υπάρχει ήδη `aplh` — το --init δεν γράφει πάνω σε δουλειά (τίποτα δεν άλλαξε)'); return; }
  var align = {}, segs = {};
  unit.align.segs.forEach(function(s){
    align[s.n] = bookChunks(s);
    segs[s.n] = align[s.n].map(function(c){ return c[0]; }).join('');
  });
  var out = {};
  Object.keys(spec).forEach(function(k){
    out[k] = spec[k];
    if (k === 'easy') out.aplh = null;
  });
  if (!('aplh' in out)) out.aplh = null;   /* χωρίς `easy`: μπαίνει στο τέλος (η σειρά των κλειδιών δεν μετράει) */
  out.aplh = {
    name: 'Απλή',
    /* το `translator` είναι σε ονομαστική («Ν. Μ. Σκουτερόπουλος») → γενική στην τελευταία λέξη (als-v669) */
    note: 'Βάση η μετάφραση ' + (unit.translator ? 'του ' + unit.translator.replace(/ος$/, 'ου').replace(/ης$/, 'η').replace(/ας$/, 'α') : 'του βιβλίου') + ', με απλές λέξεις και πιο κοντά στο αρχαίο. Ελεγμένη πάνω στο αρχαίο — όχι του βιβλίου.',
    segs: segs, changes: [], align: align, none: {}
  };
  save(id, out);
  console.log('✓ ' + id + ': στήθηκε `aplh` από τον μεταφραστή (' + unit.align.segs.length + ' περίοδοι). Τώρα άλλαξε ΜΟΝΟ τα `align`, μετά --segs.');
}

function syncSegs(id, spec){
  if (!spec.aplh || !spec.aplh.align) throw new Error(id + ': δεν υπάρχει `aplh.align` — τρέξε πρώτα --init');
  var n = 0;
  Object.keys(spec.aplh.align).forEach(function(k){
    var t = spec.aplh.align[k].map(function(c){ return c[0]; }).join('');
    if (spec.aplh.segs[k] !== t){ spec.aplh.segs[k] = t; n++; }
  });
  save(id, spec);
  console.log('✓ ' + id + ': ' + n + ' περίοδοι ξαναγράφτηκαν από τα `align`');
}

function patch(id, spec, unit, file){
  if (!spec.aplh || !spec.aplh.align) throw new Error(id + ': δεν υπάρχει `aplh.align` — τρέξε πρώτα --init');
  var P = JSON.parse(fs.readFileSync(file, 'utf8'));
  var ns = unit.align.segs.map(function(s){ return String(s.n); });
  var bad = [];
  Object.keys(P.align || {}).forEach(function(n){
    var al = P.align[n];
    if (ns.indexOf(String(n)) < 0) return bad.push('περίοδος ' + n + ' δεν υπάρχει');
    if (!Array.isArray(al) || !al.length || al.some(function(c){ return !Array.isArray(c) || c.length !== 2 || typeof c[0] !== 'string' || !c[0] || !(c[1] === 0 || typeof c[1] === 'string'); }))
      return bad.push('περίοδος ' + n + ': κάθε κομμάτι = [κείμενο, κλειδί|0]');
    spec.aplh.align[n] = al;
  });
  if (bad.length) throw new Error('το patch αρνήθηκε (τίποτα δεν γράφτηκε): ' + bad.join(' · '));
  Object.keys(P.none || {}).forEach(function(k){ spec.aplh.none[k] = P.none[k]; });
  if (P.changes) spec.aplh.changes = P.changes;
  Object.keys(spec.aplh.align).forEach(function(k){ spec.aplh.segs[k] = spec.aplh.align[k].map(function(c){ return c[0]; }).join(''); });
  save(id, spec);
  var errs = L.check(spec, unit, L.sourceOf(spec)).filter(function(e){ return /απλή μετάφραση|στοίχιση απλής/.test(e); });
  console.log('✓ ' + id + ': ' + Object.keys(P.align || {}).length + ' περίοδοι · ' + spec.aplh.changes.length + ' αλλαγές · ' +
    (errs.length ? errs.length + ' ✗\n  ✗ ' + errs.join('\n  ✗ ') : '0 ✗ στην απλή'));
  if (errs.length) process.exitCode = 1;
}

function sheet(id, spec, unit){
  var AP = spec.aplh || {};
  unit.align.segs.forEach(function(s){
    console.log('\n#' + s.n);
    console.log('A: ' + s.a.filter(function(c){ return c[1]; }).map(function(c){ return c[1] + '=' + c[0].trim(); }).join(' | '));
    console.log('M: ' + s.m.map(function(c){ return c[0]; }).join('').trim());
    if (AP.segs) console.log('S: ' + AP.segs[s.n] + (AP.segs[s.n] === s.m.map(function(c){ return c[0]; }).join('').trim() ? '   (= ο μεταφραστής)' : ''));
    if (AP.align && AP.align[s.n]){
      var miss = [];
      var have = {}; AP.align[s.n].forEach(function(c){ if (c[1]) have[c[1]] = 1; });
      s.a.forEach(function(c){ if (c[1] && !have[c[1]] && miss.indexOf(c[1]) < 0) miss.push(c[1]); });
      console.log('   ' + AP.align[s.n].filter(function(c){ return c[1] && !PUNCT.test(c[0]); }).map(function(c){ return c[1] + '→' + c[0].trim(); }).join(' · ') +
        (miss.length ? '   ⚠ δεν ανάβουν: ' + miss.map(function(k){ return k + (AP.none && AP.none[k] ? ' (none)' : ''); }).join(', ') : ''));
    }
  });
  var errs = L.check(spec, unit, L.sourceOf(spec)).filter(function(e){ return /απλή μετάφραση|στοίχιση απλής/.test(e); });
  console.log('\n' + (AP.changes ? AP.changes.length + ' αλλαγές στον πίνακα · ' : '') + (errs.length ? errs.length + ' ✗\n  ✗ ' + errs.join('\n  ✗ ') : '0 ✗ στην απλή'));
  if (errs.length) process.exitCode = 1;
}

if (require.main === module){
  var id = process.argv[2];
  if (!/^gk\d+$/.test(id || '')) { console.error('χρήση: node tools/gnosto/aplh.js gkN [--init | --segs | --patch Φ.json]'); process.exit(2); }
  try {
    var spec = L.loadSpec(id), unit = L.loadUnit(id);
    if (!unit) throw new Error('δεν υπάρχει ενότητα ' + id + ' στο arxaia-gnosto-data.js');
    if (process.argv.indexOf('--init') >= 0) init(id, spec, unit);
    else if (process.argv.indexOf('--segs') >= 0) syncSegs(id, spec);
    else if (process.argv.indexOf('--patch') >= 0) patch(id, spec, unit, process.argv[process.argv.indexOf('--patch') + 1] || '');
    else sheet(id, spec, unit);
  } catch (e){ console.error('✗ ' + e.message); process.exit(1); }
}

module.exports = { bookChunks: bookChunks };
