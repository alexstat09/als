/* ══════════════════════════════════════════════════════════════════════
   ΑΡΧΑΙΑ · ΓΝΩΣΤΟ — ΧΤΙΖΕΙ ΤΟ «ΟΡΓΑΝΟ» ΜΙΑΣ ΕΝΟΤΗΤΑΣ.
     node tools/gnosto/build.js gk9          → γράφει arxaia-gk9.html
     node tools/gnosto/build.js gk9 --check  → μόνο συγκρίνει (για το test)

   ⭐ ΜΙΑ ΠΗΓΗ ΓΙΑ ΤΟ ΚΕΙΜΕΝΟ: το αρχαίο, η μετάφραση που μαθαίνει,
   τα ζευγάρια και τα «γιατί» διαβάζονται ΑΥΤΟΥΣΙΑ από το
   arxaia-gnosto-data.js — δεν αντιγράφονται σε δεύτερο αρχείο, άρα δεν
   μπορούν να αποκλίνουν σιωπηλά (σταθ. 10). Ο validator τρέχει ΠΡΩΤΟΣ:
   με ένα σφάλμα, η σελίδα δεν γράφεται.
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
var fs = require('fs'), path = require('path');
var L = require('./lib.js');

function bareNoSpace(s){ return L.norm(s).replace(/\s+/g, ''); }

/* Κάθε περίοδος ανήκει σε μία ΑΤΑΚΑ (παράγραφο του αρχαίου). Βγαίνει από
   το ίδιο το κείμενο: οι περίοδοι, ενωμένες χωρίς κενά, πρέπει να δίνουν
   ακριβώς τις παραγράφους, με τη σειρά. Αλλιώς σκάει. */
function paraOf(unit){
  var paras = unit.ancient.map(function(b){ return bareNoSpace(b.p); });
  var out = {}, pi = 0, acc = '';
  unit.align.segs.forEach(function(s){
    var t = bareNoSpace(s.a.map(function(c){ return c[0]; }).join(''));
    if (pi >= paras.length) throw new Error('η περίοδος ' + s.n + ' περισσεύει από τις παραγράφους');
    acc += t;
    out[s.n] = pi;
    if (paras[pi].indexOf(acc) !== 0) throw new Error('η περίοδος ' + s.n + ' δεν ταιριάζει στην παράγραφο ' + (pi + 1));
    if (acc === paras[pi]){ pi++; acc = ''; }
  });
  if (pi !== paras.length || acc) throw new Error('οι περίοδοι δεν καλύπτουν ακριβώς τις ' + paras.length + ' παραγράφους');
  return out;
}

function dataOf(spec, unit){
  var para = paraOf(unit);
  var sch = {};
  spec.scholia.forEach(function(s, i){ s.keys.forEach(function(k){ (sch[k] = sch[k] || []).push(i); }); });
  var pairs = {};
  Object.keys(unit.align.pairs).forEach(function(k){
    var p = unit.align.pairs[k], w = spec.words[k];
    var t = L.tagsOf(w[1], w[3]);
    if (sch[k]) t.push('sch');
    pairs[k] = { a: p.a, m: p.m, w: p.w || '', l: w[0], f: w[1], s: w[2], t: t, sch: sch[k] || [] };
  });
  return {
    id: unit.id,
    cite: unit.cite || '',
    translator: unit.translator || '',
    simple: unit.simple || [],
    anc: unit.ancient.map(function(b){ return b.p; }),
    skout: unit.text.map(function(b){ return b.p; }),
    second: spec.second.paras,
    secondName: spec.second.name,
    intro: spec.intro,
    segs: unit.align.segs.map(function(s){
      return { n: s.n, p: para[s.n], a: s.a, m: s.m, runs: spec.structure.runs[s.n] };
    }),
    pairs: pairs,
    clauses: spec.structure.clauses,
    scholia: spec.scholia.map(function(s){ return { lemma: s.lemma, body: s.body, keys: s.keys }; }),
    acts: spec.activities,
    pars: spec.parallels,
    lexika: spec.lexika,
    lenses: L.LENSES
  };
}

/* Το υποσέλιδο: δύο γραμμές ΙΔΙΕΣ σε κάθε ενότητα (τι είναι του βιβλίου, τι
   δικό μου) + ό,τι δηλώνει το JSON της (`foot`: τυπογραφικά που μένουν,
   ενωμένες λέξεις). Οι σελίδες βγαίνουν από τη ΔΙΚΗ της πηγή. */
function footOf(spec, unit){
  var pages = [];
  (spec.fakelos.blocks || []).forEach(function(b){
    if (b.page != null) pages.push(b.page);
    (b.parts || []).forEach(function(p){ pages.push(p.page); });
  });
  var lo = Math.min.apply(null, pages), hi = Math.max.apply(null, pages);
  return [
    '<b>Τι είναι του βιβλίου.</b> Το αρχαίο και η μετάφραση που μαθαίνεις' + (unit.translator ? ' (' + unit.translator + ')' : '') +
      ' είναι τα ΙΔΙΑ με την ενότητα του Γνωστού, ελεγμένα πάνω στο PDF του Φακέλου Υλικού. Η εισαγωγή, η 2η μετάφραση (' + spec.second.name +
      '), τα σχόλια, οι δραστηριότητες και τα παράλληλα κείμενα είναι αυτολεξεί από τον Φάκελο (σελ. ' + (lo === hi ? lo : lo + '–' + hi) +
      ') — και ένα test αρνείται ό,τι δεν βρίσκει εκεί.',
    '<b>Τι είναι δικό μου.</b> Λήμμα, τύπος και συντακτικό κάθε λέξης, η ανάλυση σε προτάσεις, τα υποδείγματα απαντήσεων και τα ομόρριζα. Φέρουν ετικέτα «δικά μου»· αν κάτι διαφωνεί με τον καθηγητή σου, κερδίζει ο καθηγητής.'
  ].concat(spec.foot || []).join('<br>');
}

function render(id){
  var spec = L.loadSpec(id), unit = L.loadUnit(id);
  if (!unit) throw new Error('δεν υπάρχει ενότητα ' + id);
  var src = L.sourceOf(spec);
  var errs = L.check(spec, unit, src);
  if (errs.length) throw new Error('ο validator αρνήθηκε:\n  ✗ ' + errs.join('\n  ✗ '));
  var tpl = fs.readFileSync(path.join(__dirname, 'gk.tpl'), 'utf8');
  var D = dataOf(spec, unit);
  var json = JSON.stringify(D).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  var esc = function(s){ return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };
  var map = {
    TITLE: 'Αρχαία · ' + esc(unit.section) + ' · ' + esc(unit.short),
    ID: id,
    CRUMB: 'Αρχαία · ' + esc(unit.section),
    SECTION: esc(unit.section),
    KICKER: esc(spec.kicker),
    H1: spec.h1,
    LEAD: spec.lead,
    FACE: esc(spec.face),
    FACE_LABEL: spec.faceLabel,
    FOOT: footOf(spec, unit),
    DATA: json
  };
  var out = tpl.replace(/\{\{([A-Z0-9_]+)\}\}/g, function(m, k){
    if (!(k in map)) throw new Error('άγνωστο placeholder ' + m);
    return map[k];
  });
  /* ⚠️ Ένα placeholder που ΔΕΝ ταίριαξε στο μοτίβο μένει σιωπηλά στη σελίδα
     («{{H1}}» στον τίτλο — το είδε μόνο το render). Δεν επιτρέπεται κανένα. */
  var left = out.match(/\{\{[^}]*\}\}/);
  if (left) throw new Error('έμεινε placeholder στη σελίδα: ' + left[0]);
  return { file: path.join(L.ROOT, spec.file), html: out };
}

module.exports = { render: render, dataOf: dataOf, paraOf: paraOf };

if (require.main === module){
  var id = process.argv[2] || 'gk9', check = process.argv.indexOf('--check') >= 0;
  var r;
  try { r = render(id); } catch (e){ console.error(e.message); process.exit(1); }
  if (check){
    var cur = fs.existsSync(r.file) ? fs.readFileSync(r.file, 'utf8') : '';
    if (cur !== r.html){ console.error('✗ ' + path.basename(r.file) + ' ΔΕΝ είναι η έξοδος του build — ξανάτρεξε χωρίς --check'); process.exit(1); }
    console.log('✓ ' + path.basename(r.file) + ' = έξοδος του build');
  } else {
    fs.writeFileSync(r.file, r.html);
    console.log('✓ έγραψα ' + path.basename(r.file) + ' (' + Math.round(r.html.length / 1024) + ' KB)');
  }
}
