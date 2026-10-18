/* ══════════════════════════════════════════════════════════════════════
   ΑΡΧΑΙΑ · ΓΝΩΣΤΟ — ΤΟ «ΟΡΓΑΝΟ» ΜΙΑΣ ΕΝΟΤΗΤΑΣ: οι κανόνες.
   ΚΟΙΝΟΙ σε validate.js, build.js και tests/arxaia-gk9.test.js — ένας
   κανόνας γραμμένος δύο φορές αποκλίνει σιωπηλά (σταθ. 10).

   ΤΡΙΑ ΕΠΙΠΕΔΑ ΑΛΗΘΕΙΑΣ, όπως παντού στα Αρχαία:
     1. ΤΟ ΚΕΙΜΕΝΟ (αρχαίο + Σκουτερόπουλος + `align`) — ΔΕΝ γράφεται εδώ.
        Διαβάζεται ΑΥΤΟΥΣΙΟ από το arxaia-gnosto-data.js (μία πηγή).
     2. ΟΣΑ ΤΥΠΩΝΕΙ Ο ΦΑΚΕΛΟΣ (εισαγωγή, Γρυπάρης, σχόλια, δραστηριότητες,
        παράλληλα) — πρέπει να υπάρχουν ΑΥΤΟΛΕΞΕΙ στην καρφωμένη πηγή.
     3. ΔΙΚΑ ΜΟΥ (κάρτα λέξης, δομή, υποδείγματα, ομόρριζα) — φέρουν
        ετικέτα στη σελίδα. Κάθε «…» με πολυτονικό μέσα σε δικό μου κείμενο
        πρέπει να υπάρχει ΑΥΤΟΛΕΞΕΙ στο αρχαίο: δεν «παραθέτω» ό,τι δεν λέει.
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
var fs = require('fs'), path = require('path'), crypto = require('crypto');

var ROOT = path.join(__dirname, '..', '..');

/* Η ΙΔΙΑ κανονικοποίηση με το tests/arxaia-gnosto.test.js (1-3, 5): NFC,
   soft hyphen + ό,τι κενό ακολουθεί, αλλαγές γραμμής, «¯» → παύλα,
   απόστροφοι → ', κενά. ⛔ Κανένα «μπάλωμα για ασφάλεια». */
function norm(s){
  return String(s)
    .normalize('NFC')
    .replace(/­\s*/g, '')
    .replace(/¯/g, '—')
    .replace(/[‘’ʼ´΄]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/* Η πηγή: γραμμές «#» = σχόλια· το σώμα κόβεται σε μπλοκ «@@όνομα». */
function readSource(file){
  var raw = fs.readFileSync(file, 'utf8');
  var body = raw.split('\n').filter(function(l){ return l[0] !== '#'; }).join('\n');
  var sha = crypto.createHash('sha256').update(body, 'utf8').digest('hex');
  var blocks = {}, cur = null;
  body.split('\n').forEach(function(l){
    var m = /^@@(\w+)$/.exec(l);
    if (m){ cur = m[1]; blocks[cur] = []; return; }
    if (cur) blocks[cur].push(l);
  });
  /* 4 · ΔΗΛΩΜΕΝΕΣ ενώσεις λέξεων που έσπασαν με ΟΡΑΤΗ παύλα στο τέλος
     γραμμής (όχι soft hyphen, άρα δεν τις πιάνει το 2). Μία-μία, με όνομα. */
  var JOIN = [['ανθρώ- πινη', 'ανθρώπινη']];
  Object.keys(blocks).forEach(function(k){
    var t = norm(blocks[k].join('\n'));
    JOIN.forEach(function(j){ t = t.split(j[0]).join(j[1]); });
    blocks[k] = t;
  });
  return { sha: sha, blocks: blocks };
}

/* Πολυτονικό = εκτεταμένα ελληνικά ή συνδυαστικά σημάδια. */
var POLY = /[ἀ-῿]|[̀-ͯ]/;

/* Οι ΦΑΚΟΙ: η ετικέτα βγαίνει από τον ΤΥΠΟ (`f`), όχι από δεύτερη λίστα. */
function tagsOf(f, t){
  if (Array.isArray(t)) return t.slice();
  var out = [];
  if (/μετοχή/.test(f)) out.push('part');
  if (/απαρέμφατο/.test(f)) out.push('inf');
  if (/^ρήμα|\+ ρήμα| ρήμα /.test(f)) out.push('verb');
  if (/αντωνυμία|αντωνυμίες/.test(f)) out.push('pron');
  if (/ρηματικό επίθετο/.test(f)) out.push('vadj');
  return out;
}
var LENSES = [
  ['verb', 'Ρήματα'], ['part', 'Μετοχές'], ['inf', 'Απαρέμφατα'],
  ['vadj', 'Ρηματικό επίθετο'], ['pron', 'Αντωνυμίες'], ['sch', 'Σχόλια του βιβλίου']
];

/* Η ΜΟΡΦΗ ελέγχει την ΕΤΙΚΕΤΑ: ένα «απαρέμφατο» που δεν τελειώνει σε
   κατάληξη απαρεμφάτου είναι εύλογο λάθος, όχι error — εδώ γίνεται error. */
function bare(w){ return w.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^α-ωςϊϋ ]/g, ''); }
var INF_END = /(ειν|αι|ναι|σθαι|αν)$/;
var PART_END = /(ων|ουσα|ον|ουσαι|ουσης|ουσαν|οντος|οντι|οντες|ντες|ντων|μενος|μενη|μενου|μενω|μεναι|μενοι|μενης|σα|ν|ς)$/;

function lastWordMatching(phrase, re){
  return bare(phrase).split(/\s+/).filter(Boolean).some(function(w){ return re.test(w); });
}

/* Όλοι οι κανόνες. Επιστρέφει λίστα σφαλμάτων· κενή = περνάει. */
function check(spec, unit, src){
  var errs = [];
  function e(m){ errs.push(m); }
  var P = unit.align.pairs, segs = unit.align.segs;
  var ANC = norm(unit.ancient.map(function(b){ return b.p; }).join(' '));
  var MOD = norm(unit.text.map(function(b){ return b.p; }).join(' '));
  var GRY = src.blocks.grypari || '';

  /* 1 · η πηγή ΕΙΝΑΙ αυτή που καρφώθηκε */
  if (src.sha !== spec.sourceSha) e('η πηγή άλλαξε: sha ' + src.sha + ' ≠ ' + spec.sourceSha);

  /* 2 · κάθε κλειδί του `align` έχει κάρτα, και καμία κάρτα δεν είναι ορφανή */
  Object.keys(P).forEach(function(k){
    var w = spec.words[k];
    if (!w) return e('λείπει κάρτα λέξης για ' + k + ' («' + P[k].a + '»)');
    if (!Array.isArray(w) || w.length < 3 || !w[0] || !w[1] || !w[2]) e('ελλιπής κάρτα ' + k);
  });
  Object.keys(spec.words).forEach(function(k){ if (!P[k]) e('κάρτα για κλειδί που δεν υπάρχει: ' + k); });

  /* 3 · ετικέτα ↔ μορφή */
  Object.keys(spec.words).forEach(function(k){
    var w = spec.words[k]; if (!P[k] || !Array.isArray(w)) return;
    var tg = tagsOf(w[1], w[3]), a = P[k].a.replace(/…/g, ' ');
    if (tg.indexOf('inf') >= 0 && !lastWordMatching(a, INF_END)) e(k + ': «απαρέμφατο» αλλά το «' + P[k].a + '» δεν έχει κατάληξη απαρεμφάτου');
    if (tg.indexOf('part') >= 0 && !lastWordMatching(a, PART_END)) e(k + ': «μετοχή» αλλά το «' + P[k].a + '» δεν έχει κατάληξη μετοχής');
    if (tg.indexOf('vadj') >= 0 && !/τεον/.test(bare(a))) e(k + ': «ρηματικό επίθετο» χωρίς -τέον');
  });

  /* 4 · η Δομή: κάθε περίοδος καλύπτεται, κάθε πρόταση υπάρχει */
  var used = {};
  segs.forEach(function(s){
    var st = spec.structure.runs[s.n];
    if (!st || !st.length) return e('η περίοδος ' + s.n + ' δεν έχει Δομή');
    if (st[0][0] !== 0) e('η Δομή της περιόδου ' + s.n + ' δεν αρχίζει από το κομμάτι 0');
    var last = -1;
    st.forEach(function(r){
      if (r[0] <= last || r[0] >= s.a.length) e('περίοδος ' + s.n + ': κακή θέση ' + r[0]);
      last = r[0];
      if (!spec.structure.clauses[r[1]]) e('περίοδος ' + s.n + ': άγνωστη πρόταση ' + r[1]);
      used[r[1]] = 1;
    });
  });
  Object.keys(spec.structure.clauses).forEach(function(c){ if (!used[c]) e('η πρόταση ' + c + ' δεν εμφανίζεται πουθενά'); });

  /* 5 · ΤΟΥ ΦΑΚΕΛΟΥ = ΑΥΤΟΛΕΞΕΙ */
  function verb(x, where, hay){ if (norm(hay).indexOf(norm(x)) < 0) e('ΔΕΝ είναι αυτολεξεί στον Φάκελο (' + where + '): «' + norm(x).slice(0, 70) + '…»'); }
  verb(spec.intro, 'εισαγωγή', src.blocks.intro);
  if (spec.grypari.length !== unit.ancient.length) e('ο Γρυπάρης έχει ' + spec.grypari.length + ' παραγράφους, το αρχαίο ' + unit.ancient.length);
  if (norm(spec.grypari.join(' ')) !== GRY) e('ο Γρυπάρης, ενωμένος, ΔΕΝ είναι ακριβώς η στήλη του PDF');
  spec.scholia.forEach(function(s, i){
    verb(s.lemma + ': ' + s.body, 'σχόλιο ' + (i + 1), src.blocks.scholia);
    (s.keys || []).forEach(function(k){ if (!P[k]) e('σχόλιο ' + (i + 1) + ': άγνωστο κλειδί ' + k); });
    if (!(s.keys || []).length) e('σχόλιο ' + (i + 1) + ': δεν δένεται σε καμία λέξη');
  });
  var sch = spec.scholia.map(function(s){ return s.lemma + ': ' + s.body; }).join(' ');
  if (norm(sch) !== src.blocks.scholia) e('τα σχόλια, ενωμένα, ΔΕΝ είναι ΟΛΑ τα σχόλια του βιβλίου (λείπει ή περισσεύει κάτι)');
  var PAGES = src.blocks.p92 + ' ' + src.blocks.p93 + ' ' + src.blocks.p94;
  spec.activities.forEach(function(g){
    verb(g.title, 'ομάδα ' + g.id, PAGES);
    g.items.forEach(function(it){ verb(it.q, 'ερώτηση ' + it.id, PAGES); });
  });
  spec.parallels.forEach(function(p){
    [p.head, p.intro, p.text, '(' + p.translator + ')'].forEach(function(x){ verb(x, 'παράλληλο ' + p.id, PAGES); });
    p.items.forEach(function(it){ verb(it.q, 'ερώτηση ' + it.id, PAGES); });
  });

  /* 6 · ΔΙΚΑ ΜΟΥ: κάθε παράθεμα υπάρχει εκεί που λέει */
  function quotes(txt, where){
    (String(txt).match(/«[^»]+»/g) || []).forEach(function(q){
      var inner = q.slice(1, -1);
      if (POLY.test(inner) && ANC.indexOf(norm(inner).replace(/\s*…\s*/g, ' ')) < 0){
        /* «… » μέσα στο παράθεμα = παράλειψη: κάθε κομμάτι πρέπει να υπάρχει */
        var bits = norm(inner).split(/\s*…\s*/).filter(Boolean);
        if (!bits.every(function(b){ return ANC.indexOf(b) >= 0; })) e(where + ': το παράθεμα «' + inner + '» ΔΕΝ υπάρχει στο αρχαίο');
      }
    });
  }
  function blocks(list, where, pText){
    (list || []).forEach(function(b){
      quotes(b.x, where);
      if (b.k === 'q' && ANC.indexOf(norm(b.an).replace(/\s*…\s*/g, ' ')) < 0){
        var bits = norm(b.an).split(/\s*…\s*/).filter(Boolean);
        if (!bits.every(function(x){ return ANC.indexOf(x) >= 0; })) e(where + ': το παράθεμα «' + b.an + '» ΔΕΝ υπάρχει στο αρχαίο');
      }
      if (b.k === 'tq'){
        var hay = b.who === 'gryp' ? GRY : MOD;
        if (hay.indexOf(norm(b.an)) < 0) e(where + ': η μετάφραση «' + b.an + '» ΔΕΝ είναι αυτολεξεί του ' + (b.who === 'gryp' ? 'Γρυπάρη' : 'Σκουτερόπουλου'));
      }
      if (b.k === 'pq' && norm(pText || '').indexOf(norm(b.an)) < 0) e(where + ': το παράθεμα «' + b.an + '» ΔΕΝ υπάρχει στο παράλληλο κείμενο');
      if (b.k === 'iq' && src.blocks.intro.indexOf(norm(b.an)) < 0) e(where + ': το «' + b.an + '» ΔΕΝ υπάρχει στην εισαγωγή του βιβλίου');
    });
  }
  spec.activities.forEach(function(g){ g.items.forEach(function(it){
    if (!it.model || !it.model.length) e('η ' + it.id + ' δεν έχει υπόδειγμα');
    blocks(it.model, 'υπόδειγμα ' + it.id);
  }); });
  spec.parallels.forEach(function(p){ p.items.forEach(function(it){
    if (!it.model || !it.model.length) e('η ' + it.id + ' δεν έχει υπόδειγμα');
    blocks(it.model, 'υπόδειγμα ' + it.id, p.text);
  }); });
  Object.keys(spec.words).forEach(function(k){ var w = spec.words[k]; if (Array.isArray(w)) { quotes(w[1], 'κάρτα ' + k); quotes(w[2], 'κάρτα ' + k); } });
  Object.keys(spec.structure.clauses).forEach(function(c){ quotes(spec.structure.clauses[c].s, 'πρόταση ' + c); });

  /* 7 · λεξιλογικά: η λέξη ΥΠΑΡΧΕΙ στο κείμενο */
  spec.lexika.forEach(function(x){
    if (!P[x.key]) e('λεξιλογικό «' + x.w + '»: άγνωστο κλειδί ' + x.key);
    else if (norm(P[x.key].a).indexOf(norm(x.w)) < 0) e('λεξιλογικό «' + x.w + '»: δεν είναι η λέξη του ' + x.key);
    if (!x.rel || x.rel.length < 3) e('λεξιλογικό «' + x.w + '»: λιγότερα από 3 ομόρριζα');
  });
  return errs;
}

function loadUnit(id){
  var G = require(path.join(ROOT, 'arxaia-gnosto-data.js'));
  return G.unit(id);
}
function loadSpec(id){ return JSON.parse(fs.readFileSync(path.join(__dirname, id + '.json'), 'utf8')); }

module.exports = { ROOT: ROOT, norm: norm, readSource: readSource, tagsOf: tagsOf, LENSES: LENSES,
  check: check, loadUnit: loadUnit, loadSpec: loadSpec, POLY: POLY };
