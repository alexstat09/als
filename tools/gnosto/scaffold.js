/* ══════════════════════════════════════════════════════════════════════
   ΣΚΑΛΩΣΙΑ ΓΙΑ ΤΟ «ΟΡΓΑΝΟ» ΜΙΑΣ ΕΝΟΤΗΤΑΣ — δύο φάσεις, ίδια εντολή:

     node tools/gnosto/scaffold.js gkN

   ΦΑΣΗ 1 (δεν υπάρχει gkN.json): βρίσκει τις σελίδες της ενότητας στον
     Φάκελο, γράφει gkN.json με `fakelos.blocks` ΠΡΟΤΕΙΝΟΜΕΝΑ από τη
     γεωμετρία (εισαγωγή · 2η μετάφραση · σχόλια · σελίδες δραστηριοτήτων)
     και τυπώνει φύλλο εργασίας με κάθε γραμμή σημαδεμένη:
       [ΑΡΧ] αρχαίο · [ΜΑΘ] η μετάφραση που μαθαίνει · [2η] η άλλη ·
       [ΥΠΟ] υπογραφή «(μετάφραση …)» · [ΤΙΤ] τίτλος/κεφαλίδα
     ⭐ Η στήλη αναγνωρίζεται από ΤΟ ΚΕΙΜΕΝΟ, όχι από το x: μια γραμμή που
     υπάρχει στη μετάφραση του Γνωστού είναι [ΜΑΘ]. Ό,τι άλλο βρίσκεται στις
     σελίδες των μεταφράσεων είναι [2η].
     → Ελέγχεις τα rect, τρέχεις `node tools/gnosto/source.js gkN`.

   ΦΑΣΗ 2 (υπάρχει gkN.json ΚΑΙ η πηγή του): γεμίζει ΜΟΝΟ ό,τι είναι κενό —
     εισαγωγή, δραστηριότητες και παράλληλα (από τις σελίδες), κλειδιά
     καρτών, κενές περίοδοι Δομής — και γράφει το φύλλο εργασίας με τα
     ζευγάρια, τα κομμάτια κάθε περιόδου και τα σχόλια με τη γεωμετρία τους.
     ⛔ Δεν σβήνει και δεν ξαναγράφει τίποτα που έχει ήδη τιμή.
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
var fs = require('fs'), path = require('path'), os = require('os');
var L = require('./lib.js');
var SRC = require('./source.js');
var F = require('./fmt.js');

function die(m){ console.error('✗ ' + m); process.exit(1); }
/* Σύγκριση κειμένων: χωρίς κενά, soft hyphens, απόστροφους και παύλες (το PDF
   γράφει «¯» εκεί που η μεταγραφή έχει «—»). */
function sq(s){ return String(s).normalize('NFC').replace(/[\s\u00AD’'΄ʼ—–¯-]+/g, ''); }
var AUT = /κε[ιί]μεν[οα]\s+αυτενεργει/i;
/* Κανονικοποίηση ΓΙΑ ΕΜΦΑΝΙΣΗ: όπως το norm, αλλά κρατάει τις απόστροφους του βιβλίου. */
function dnorm(s, joins){
  var t = String(s).normalize('NFC').replace(/­\s*/g, '').replace(/¯/g, '—').replace(/\s+/g, ' ').trim();
  (joins || []).forEach(function(j){ t = t.split(j[0]).join(j[1]); });
  return t;
}

var id = process.argv[2];
if (!/^gk\d+$/.test(id || '')) die('χρήση: node tools/gnosto/scaffold.js gkN');
var N = +id.slice(2);
var unit = L.loadUnit(id);
if (!unit) die('η ' + id + ' δεν υπάρχει στο arxaia-gnosto-data.js — η ενότητα μπαίνει ΠΡΩΤΑ στον Γνωστό (αρχαίο + μετάφραση + align)');
if (!unit.align || !unit.align.segs || !unit.align.pairs) die('η ' + id + ' δεν έχει `align` — χωρίς ζευγάρια δεν υπάρχει κάρτα λέξης');
var specFile = path.join(__dirname, id + '.json');
var WORK = path.join(os.tmpdir(), 'gnosto-' + id);
fs.mkdirSync(WORK, { recursive: true });
var pdf = SRC.PDF_DEFAULT;
SRC.checkPdf(pdf);

var ANC = sq(unit.ancient.map(function(b){ return b.p; }).join(''));
var MOD = sq(unit.text.map(function(b){ return b.p; }).join(''));

function geom(i){
  return SRC.run(pdf, ['lines', i]).split('\n').filter(Boolean).map(function(l){
    var m = /^\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+) \| (.*)$/.exec(l);
    if (!m) return null;
    var t = m[5].replace(/⏎/g, '\n');
    return { x0: +m[1], y0: +m[2], x1: +m[3], y1: +m[4], t: t, h: +m[4] - +m[2] };
  }).filter(Boolean);
}
function role(l){
  var s = sq(l.t);
  if (!s) return '';
  if (/^\(?μετάφραση\s/.test(l.t.trim())) return 'ΥΠΟ';
  if (/^\d+$/.test(s)) return 'ΣΕΛ';
  if (s.length >= 6 && ANC.indexOf(s) >= 0) return 'ΑΡΧ';
  if (s.length >= 6 && MOD.indexOf(s) >= 0) return 'ΜΑΘ';
  if (l.h > 16.5) return 'ΤΙΤ';
  return '';
}
function bbox(ls){
  var x0 = Math.min.apply(null, ls.map(function(l){ return l.x0; })), y0 = Math.min.apply(null, ls.map(function(l){ return l.y0; }));
  var x1 = Math.max.apply(null, ls.map(function(l){ return l.x1; })), y1 = Math.max.apply(null, ls.map(function(l){ return l.y1; }));
  /* ⚠️ Περιθώριο 8 δεξιά: ένα rect ακριβώς στο maxX ΤΡΩΕΙ τον τελευταίο χαρακτήρα. */
  return [Math.floor(x0 - 7), Math.floor(y0 - 3), Math.ceil(x1 - x0 + 15), Math.ceil(y1 - y0 + 6)];
}

/* ══ ΦΑΣΗ 1 ════════════════════════════════════════════════════════════ */
if (!fs.existsSync(specFile)){
  var start = +SRC.run(pdf, ['find', N]).trim().split('\n')[0];
  var next = SRC.run(pdf, ['find', N + 1]).trim().split('\n')[0];
  if (isNaN(start)) die('δεν βρέθηκε «ΔΙΔΑΚΤΙΚΗ ΕΝΟΤΗΤΑ ' + N + '» στον Φάκελο');
  var end = next ? +next - 1 : start + 9;
  var sheet = [], pages = {};
  for (var i = start; i <= end; i++){
    var g = geom(i); pages[i] = g;
    sheet.push('════════ idx ' + i + ' ════════');
    g.forEach(function(l){ var r = role(l); l.role = r;
      sheet.push((r ? '[' + r + ']' : '     ') + ' ' + [l.x0, l.y0, l.x1, l.y1].map(function(v){ return v.toFixed(1); }).join(' ') + ' | ' + l.t.replace(/\n/g, '⏎').slice(0, 110));
    });
  }
  /* Οι προτάσεις — ΜΟΝΟ προτάσεις: κάθε rect ελέγχεται ξανά από το source.js. */
  var blocks = [];
  var sg = pages[start], kei = sg.findIndex(function(l){ return /ΚΕΙΜΕΝΟ ΑΝΑΦΟΡΑΣ/.test(l.t); });
  var introL = (kei > 0 ? sg.slice(0, kei) : []).filter(function(l){ return !l.role && l.h < 16.5 && sq(l.t); });
  introL.forEach(function(l){ l.role = 'ΕΙΣ'; });
  /* Μικρές γραμμές («Ναί.», ένα κομμάτι λέξης) δεν αναγνωρίζονται από το κείμενο:
     παίρνουν τον ρόλο του πλησιέστερου ΑΡΧ/ΜΑΘ γείτονα (≤20pt κάθετα, με
     οριζόντια επικάλυψη). Αλλιώς μένουν στην «άλλη» στήλη. */
  Object.keys(pages).forEach(function(pi){
    var gl = pages[pi];
    gl.forEach(function(l){
      if (l.role || sq(l.t).length >= 6) return;
      var yc = (l.y0 + l.y1) / 2, best = null, bd = 21;
      gl.forEach(function(o){
        if (o === l || (o.role !== 'ΑΡΧ' && o.role !== 'ΜΑΘ')) return;
        var d = Math.abs((o.y0 + o.y1) / 2 - yc);
        if (d < bd && o.x0 <= l.x1 + 2 && l.x0 <= o.x1 + 2){ bd = d; best = o; }
      });
      if (best) l.role = best.role;
    });
  });
  /* το φύλλο ξαναγράφεται με τους τελικούς ρόλους */
  sheet = [];
  Object.keys(pages).forEach(function(pi){
    sheet.push('════════ idx ' + pi + ' ════════');
    pages[pi].forEach(function(l){ sheet.push((l.role ? '[' + l.role + ']' : '     ') + ' ' + [l.x0, l.y0, l.x1, l.y1].map(function(v){ return v.toFixed(1); }).join(' ') + ' | ' + l.t.replace(/\n/g, '⏎').slice(0, 110)); });
  });
  blocks.push({ name: 'intro', parts: introL.length ? [{ page: start, rect: bbox(introL) }] : [{ page: start, rect: null }] });
  var secParts = [], schPages = [], actPages = [], seenAct = false;
  for (i = start; i <= end; i++){
    var gl = pages[i], txt = gl.map(function(l){ return l.t; }).join('\n');
    var ai = txt.search(AUT);
    if (ai >= 0 && !/Ενδεικτικ|παρ[αά]λληλα/i.test(txt.slice(0, ai))) break;
    var hasMath = gl.some(function(l){ return l.role === 'ΜΑΘ'; });
    if (hasMath){
      var other = gl.filter(function(l){ return !l.role && sq(l.t) && l.h < 16.5; });
      if (other.length) secParts.push({ page: i, rect: bbox(other) });
      continue;
    }
    if (/^Ενδεικτικ/m.test(txt) || /^παρ[αά]λληλα/im.test(txt)){ actPages.push(i); seenAct = true; continue; }
    if (!seenAct && i > start) schPages.push(i);
  }
  blocks.push({ name: 'second', parts: secParts });
  blocks.push({ name: 'scholia', parts: schPages.map(function(p){
    return { page: p, rect: bbox(pages[p].filter(function(l){ return l.role !== 'ΣΕΛ' && sq(l.t); })) };
  }) });
  actPages.forEach(function(p){ blocks.push({ name: 'p' + p, page: p }); });
  var cite = (unit.cite || '').replace(/-/g, '–');
  var spec = {
    id: id, file: 'arxaia-' + id + '.html', source: 'tests/arxaia-' + id + '-fakelos.source.txt', sourceSha: '',
    fakelos: { pdf: '~/.cache/metron-arxaia/fakelos.pdf', pdfSha: SRC.PDF_SHA, unit: N, blocks: blocks, joins: [] },
    h1: '', kicker: [unit.author, (unit.short || '') + (cite ? ' ' + cite : '')].filter(Boolean).join(' · '),
    face: String(N), faceLabel: 'διδακτική<br>ενότητα', lead: '',
    intro: '', second: { name: '', paras: [] },
    structure: { clauses: {}, runs: {} }, words: {},
    scholia: [], activities: [], parallels: [], lexika: [], foot: []
  };
  fs.writeFileSync(specFile, F.fmt(spec));
  var ws = path.join(WORK, 'geometry.txt');
  fs.writeFileSync(ws, sheet.join('\n') + '\n');
  console.log('✓ ΦΑΣΗ 1 · ' + id + '.json · σελ. ' + start + '–' + end + ' · προτάσεις: intro ' + (introL.length ? 'ok' : '⚠️ ΚΕΝΟ') +
    ' · 2η μετάφραση σε ' + secParts.length + ' σελ. · σχόλια ' + schPages.join(',') + ' · δραστηριότητες/παράλληλα ' + actPages.join(','));
  console.log('  φύλλο γεωμετρίας: ' + ws);
  console.log('  → έλεγξε τα rect (και ότι η 2η μετάφραση ΔΕΝ πιάνει [ΜΑΘ] γραμμές), μετά: node tools/gnosto/source.js ' + id);
  process.exit(0);
}

/* ══ ΦΑΣΗ 2 ════════════════════════════════════════════════════════════ */
var spec2 = JSON.parse(fs.readFileSync(specFile, 'utf8'));
var srcFile = path.join(L.ROOT, spec2.source);
if (!fs.existsSync(srcFile) || !spec2.sourceSha) die('δεν υπάρχει ακόμη η πηγή — τρέξε `node tools/gnosto/source.js ' + id + '`');
var src = L.sourceOf(spec2);
if (src.sha !== spec2.sourceSha) die('η πηγή δεν ταιριάζει με το sourceSha του JSON — ξανατρέξε source.js');
var joins = spec2.fakelos.joins || [];
/* τα ΩΜΑ μπλοκ (με τις αλλαγές γραμμής), για ανάλυση σε γραμμές */
var raw = {}, cur = null;
fs.readFileSync(srcFile, 'utf8').split('\n').filter(function(l){ return l[0] !== '#'; }).forEach(function(l){
  var m = /^@@(\w+)$/.exec(l); if (m){ cur = m[1]; raw[cur] = []; return; } if (cur) raw[cur].push(l);
});
var filled = [];

if (!spec2.intro){ spec2.intro = dnorm(raw.intro.join('\n'), joins); filled.push('intro'); }

var pageLines = Object.keys(raw).filter(function(k){ return /^p\d+$/.test(k); })
  .sort(function(a, b){ return +a.slice(1) - +b.slice(1); })
  .reduce(function(a, k){ return a.concat(raw[k]); }, []);
var STOP = /^(παρ[αά]λληλα κε[ιί]μενα|κε[ιί]μεν[οα]\s+αυτενεργει)/i;
var NAME = /^\d+\.\s+[^a-zα-ωάέήίόύώϊϋΐΰ]+$/;   /* «1. ΕΠΙΚΟΥΡΟΣ,» — όνομα σε κεφαλαία */

if (!spec2.activities.length){
  var a0 = pageLines.findIndex(function(l){ return /^Ενδεικτικ(ές|ή)\s+Δραστηριότητ/.test(l.trim()); });
  if (a0 >= 0){
    var groups = [], g = null, it = null, LAT = { 'Α': 'A', 'Β': 'B', 'Γ': 'C', 'Δ': 'D', 'Ε': 'E' };
    for (var j = a0 + 1; j < pageLines.length; j++){
      var ln = pageLines[j].trim();
      if (STOP.test(ln)) break;
      var gm = /^([ΑΒΓΔΕ])\.\s+(.+)$/.exec(ln), im = /^(\d+)\.\s+(.+)$/.exec(ln);
      if (gm){ g = { id: LAT[gm[1]], title: dnorm(ln, joins), items: [] }; groups.push(g); it = null; continue; }
      if (im){
        if (!g){ g = { id: 'A', title: dnorm(pageLines[a0].trim(), joins), items: [] }; groups.push(g); }
        it = { id: g.id + im[1], q: im[2], model: [] }; g.items.push(it); continue;
      }
      if (it) it.q += '\n' + ln;
      else if (g && !g.items.length) g.title += ' ' + ln;
    }
    groups.forEach(function(gr){ gr.title = dnorm(gr.title, joins); gr.items.forEach(function(x){ x.q = dnorm(x.q, joins); }); });
    if (groups.length){ spec2.activities = groups; filled.push('activities (' + groups.reduce(function(n, x){ return n + x.items.length; }, 0) + ')'); }
  }
}

if (!spec2.parallels.length){
  var p0 = pageLines.findIndex(function(l){ return /^παρ[αά]λληλα κε[ιί]μενα/i.test(l.trim()); });
  if (p0 >= 0){
    var pars = [], P = null, mode = '';
    for (var k = p0 + 1; k < pageLines.length; k++){
      var t = pageLines[k].trim();
      if (/^κε[ιί]μεν[οα]\s+αυτενεργει/i.test(t)) break;
      if (!t) continue;
      if (NAME.test(t)){ P = { id: 'P' + (pars.length + 1), head: t, intro: '', text: '', translator: '', items: [] }; pars.push(P); mode = 'head2'; continue; }
      if (!P) continue;
      if (mode === 'head2'){ P.head += ' ' + t; mode = 'body'; continue; }
      var tm = /^\((μετάφραση [^)]*)\)?$/.exec(t);
      if (mode === 'body' && tm){ P.translator = tm[1]; mode = 'after'; continue; }
      if (/^Ενδεικτικ(ές|ή)\s+Δραστηριότητ/.test(t)){ mode = 'items'; continue; }
      if (mode === 'body'){ P.text += (P.text ? '\n' : '') + t; continue; }
      if (mode === 'items'){
        var nm = /^(\d+)\.\s+(.+)$/.exec(t);
        if (nm || !P.items.length) P.items.push({ id: P.id + String.fromCharCode(97 + P.items.length), q: nm ? nm[2] : t, model: [] });
        else P.items[P.items.length - 1].q += '\n' + t;
      }
    }
    pars.forEach(function(x){ x.head = dnorm(x.head, joins); x.text = dnorm(x.text, joins); x.items.forEach(function(y){ y.q = dnorm(y.q, joins); }); });
    if (pars.length){ spec2.parallels = pars; filled.push('parallels (' + pars.length + ' — ⚠️ χώρισε intro/text)'); }
  }
}

var nk = 0;
Object.keys(unit.align.pairs).forEach(function(key){ if (!spec2.words[key]){ spec2.words[key] = ['', '', '']; nk++; } });
if (nk) filled.push(nk + ' κενές κάρτες λέξεων');
var nr = 0;
unit.align.segs.forEach(function(s){ if (!spec2.structure.runs[s.n]){ spec2.structure.runs[s.n] = []; nr++; } });
if (nr) filled.push(nr + ' κενές περίοδοι Δομής');
fs.writeFileSync(specFile, F.fmt(spec2));

/* το φύλλο εργασίας */
var out = [];
out.push('══ ΣΤΟΙΧΕΙΑ · ' + id + ' · ' + unit.title);
out.push('μετάφραση που μαθαίνει: ' + (unit.translator || '⚠️ ΑΓΝΩΣΤΗ (unit.translator)'));
/* οι υπογραφές ζουν ΚΑΤΩ από τις στήλες, άρα στις σελίδες των μεταφράσεων */
var trPages = [];
(spec2.fakelos.blocks || []).forEach(function(bl){ if (bl.name === 'second' || bl.name === 'grypari') (bl.parts || []).forEach(function(pt){ trPages.push(pt.page); }); });
var trSig = trPages.map(function(pg){ return SRC.run(pdf, ['page', pg]); }).join('\n').match(/\(μετάφραση [^)]*\)/g) || [];
out.push('υπογραφές κάτω από τις μεταφράσεις: ' + (trSig.join(' · ') || '—') + '   ⇒ η 2η = όποια ΔΕΝ είναι η παραπάνω');
out.push('υπογραφές στα παράλληλα: ' + ((pageLines.join('\n').match(/\(μετάφραση [^)]*\)/g) || []).join(' · ') || '—'));
/* ⚠️ λέξεις σπασμένες με ΟΡΑΤΟ σημάδι (δεν τις πιάνει η κανονικοποίηση):
   «Γ ερμανός», «ανθρώ- πινη», «ερ γαλείο». Δηλώνονται στο fakelos.joins. */
var susp = [];
Object.keys(raw).forEach(function(k){
  var t = dnorm(raw[k].join('\n'));
  (t.match(/(^|[\s(«])[ΑΒΓΔΕΖΘΙΚΛΜΝΞΠΡΣΤΥΦΧΨΩ] [α-ωάέήίόύώ]{2,}/g) || [])   /* όχι Η/Ο: είναι άρθρα */.concat(t.match(/[α-ωάέήίόύώ]- [α-ωάέήίόύώ]{2,}/g) || [])
    .forEach(function(m){ susp.push(k + ': «' + m.trim() + '»'); });
});
out.push('πιθανά σπασμένες λέξεις (→ fakelos.joins + foot, ή άφησέ τες αν είναι του βιβλίου): ' + (susp.join(' · ') || 'καμία'));
out.push('\n══ Η 2η ΜΕΤΑΦΡΑΣΗ (σπάσ’ την σε ' + unit.ancient.length + ' παραγράφους, όσες το αρχαίο) ══');
out.push(dnorm((raw.second || raw.grypari || []).join('\n'), joins));
out.push('\n══ ΤΑ ΣΧΟΛΙΑ (ωμές γραμμές· το λήμμα είναι η αρχή κάθε σχολίου, ως το πρώτο «:») ══');
(raw.scholia || []).forEach(function(l){ out.push('  ' + l); });
out.push('\n══ ΟΙ ΠΕΡΙΟΔΟΙ — τα κομμάτια με αριθμό (για το structure.runs) ══');
unit.align.segs.forEach(function(s){
  out.push('S' + s.n + ': ' + s.a.map(function(c, i){ return i + ':' + c[0].trim() + (c[1] ? '/' + c[1] : ''); }).join('  '));
});
out.push('\n══ ΤΑ ΖΕΥΓΑΡΙΑ — κάθε κλειδί θέλει [λήμμα, τύπος, συντακτικό] ══');
unit.align.segs.forEach(function(s){
  var seen = {};
  s.a.forEach(function(c){ var key = c[1]; if (!key || seen[key]) return; seen[key] = 1;
    var pp = unit.align.pairs[key];
    out.push(key + ' | ' + pp.a + ' | ' + pp.m + ' | ' + String(pp.w || '').replace(/\s+/g, ' ').slice(0, 220));
  });
});
var ws2 = path.join(WORK, 'worksheet.txt');
fs.writeFileSync(ws2, out.join('\n') + '\n');
console.log('✓ ΦΑΣΗ 2 · ' + id + '.json · γέμισαν: ' + (filled.join(' · ') || 'τίποτα (ήταν ήδη γεμάτα)'));
console.log('  φύλλο εργασίας: ' + ws2);
console.log('  → γράψε τα «δικά σου» (§3 του skill), μετά: node tools/gnosto/validate.js ' + id);
