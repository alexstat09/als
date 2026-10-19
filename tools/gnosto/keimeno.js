/* ══════════════════════════════════════════════════════════════════════
   ΤΟ ΚΕΙΜΕΝΟ ΜΙΑΣ ΕΝΟΤΗΤΑΣ ΤΟΥ ΓΝΩΣΤΟΥ — αρχαίο + μετάφραση + `align`.
   Το μοντέλο γράφει ΜΟΝΟ `tools/gnosto/gkN.text.json`· όλα τα άλλα
   (πηγή, sha, block στο arxaia-gnosto-data.js, CACHE) τα παράγει αυτό.

     node tools/gnosto/keimeno.js scaffold gkN [--dry]  σελίδες · γεωμετρία · ΠΡΟΤΕΙΝΟΜΕΝΑ rect · σκελετός JSON
     node tools/gnosto/keimeno.js source gkN [--force]  κόβει, διασταυρώνει, γράφει πηγή + sha, ΣΑΡΩΝΕΙ ύποπτα (+ PNG)
     node tools/gnosto/keimeno.js check gkN             όλοι οι κανόνες (και ξανά-κόψιμο από το PDF αν υπάρχει)
     node tools/gnosto/keimeno.js wire gkN              block ⟪gkN⟫ στο UNITS (ιδεμπότητο) + CACHE
     node tools/gnosto/keimeno.js import gkN            ζωντανό unit → gkN.text.json (round-trip αποδεδειγμένο)
     node tools/gnosto/keimeno.js block gkN             τυπώνει το block που θα έγραφε το wire

   ΣΥΜΠΑΓΗΣ ΜΟΡΦΗ (μία πηγή αλήθειας — τα ancient[]/text[] ΠΑΡΑΓΟΝΤΑΙ από τα segs):
     segs:  [{ a: "⟨Τί δέ|a1⟩; ", m: "⟨Τότε|a1⟩; ", end: true }]
            ⟨κείμενο|κλειδί⟩ = κομμάτι με κλειδί · ό,τι είναι έξω = κομμάτι 0 ·
            «¦» χωρίζει δύο διαδοχικά κομμάτια 0 (μετράνε για τη Δομή του οργάνου) ·
            end = τέλος ατάκας/παραγράφου (και στις δύο πλευρές μαζί).
     pairs: { a1: ["Τί δέ", "Τότε", "εξήγηση"] }
     fixes: [[από, σε, γιατί]] — εφαρμόζονται στον ΑΧΥΡΩΝΑ, ποτέ στην πηγή.
     counts:[[regex, n, γιατί, "m"?]] — μετρημένο στο αρχαίο (ή στη μετάφραση με "m").
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
var fs = require('fs'), path = require('path'), os = require('os'), crypto = require('crypto');
var cp = require('child_process');
var L = require('./lib.js');
var F = require('./fmt.js');
var ROOT = L.ROOT;
var DATA = path.join(ROOT, 'arxaia-gnosto-data.js');

var CHAPTER = 'Τα κείμενα · γνωστό';
function sectionOf(n){ return 'Ενότητα ' + n + 'η'; }
function sha(s){ return crypto.createHash('sha256').update(s, 'utf8').digest('hex'); }
function fileOf(id){ return path.join(__dirname, id + '.text.json'); }

/* ══ 1 · ΚΩΔΙΚΟΠΟΙΗΣΗ ════════════════════════════════════════════════ */
function encSide(chunks){
  var out = '', prev0 = false;
  chunks.forEach(function(c){
    if (c[1]){ out += '⟨' + c[0] + '|' + c[1] + '⟩'; prev0 = false; }
    else { if (prev0) out += '¦'; out += c[0]; prev0 = true; }
  });
  return out;
}
function decSide(str, where, errs){
  var out = [], re = /⟨([^⟨⟩]*?)\|([^⟨⟩|]*)⟩|¦|[^⟨⟩¦]+|[⟨⟩]/g, m, lastSep = true;
  if (typeof str !== 'string'){ errs.push(where + ': λείπει (πρέπει να είναι κείμενο)'); return out; }
  while ((m = re.exec(str))){
    var t = m[0];
    if (t === '⟨' || t === '⟩'){ errs.push(where + ': μισό «' + t + '» στη θέση ' + m.index + ' — «…' + str.slice(Math.max(0, m.index - 15), m.index + 15) + '…»'); continue; }
    if (t === '¦'){
      if (lastSep || !out.length || out[out.length - 1][1]) errs.push(where + ': περιττό «¦» στη θέση ' + m.index + ' (μόνο ανάμεσα σε δύο κομμάτια 0)');
      lastSep = true; continue;
    }
    if (m[1] !== undefined){
      if (!m[1]) errs.push(where + ': άδειο κομμάτι με κλειδί «' + m[2] + '»');
      if (!/^[A-Za-z_]\w*$/.test(m[2])) errs.push(where + ': κακό κλειδί «' + m[2] + '» (γράμμα + γράμματα/ψηφία, π.χ. b12)');
      out.push([m[1], m[2]]); lastSep = false; continue;
    }
    out.push([t, 0]); lastSep = false;
  }
  if (out.length && str.slice(-1) === '¦') errs.push(where + ': «¦» στο τέλος');
  return out;
}
var KNOWN = { id: 1, added: 1, title: 1, short: 1, gist: 1, author: 1, cite: 1, translator: 1, simple: 1, text: 1, ancient: 1, align: 1,
  section: 1, chapter: 1, mark: 1, byHeart: 1, onlyAlign: 1 };
var DEFAULTS = { mark: null, chapter: CHAPTER, byHeart: true, onlyAlign: true };

/* unit → συμπαγές. Πετάει αν τα segs δεν ομαδοποιούνται ΑΚΡΙΒΩΣ στις παραγράφους. */
function encode(u){
  var N = +u.id.slice(2), J = { id: u.id, added: u.added, title: u.title, short: u.short, gist: u.gist, author: u.author };
  if (u.cite !== undefined) J.cite = u.cite;
  if (u.translator !== undefined) J.translator = u.translator;
  J.simple = u.simple;
  var segs = u.align.segs, A = u.ancient.map(function(b){ return b.p; }), M = u.text.map(function(b){ return b.p; });
  if (A.length !== M.length) throw new Error(u.id + ': αρχαίο ' + A.length + ' παράγραφοι, μετάφραση ' + M.length);
  var pi = 0, accA = '', accM = '';
  J.segs = segs.map(function(s, i){
    if (s.n !== i + 1) throw new Error(u.id + ': segs[' + i + '].n = ' + s.n + ' (περίμενα ' + (i + 1) + ')');
    var extra = Object.keys(s).filter(function(k){ return k !== 'n' && k !== 'a' && k !== 'm'; });
    if (extra.length) throw new Error(u.id + ': segs[' + i + '] έχει άγνωστα πεδία ' + extra.join(','));
    accA += s.a.map(function(c){ return c[0]; }).join(''); accM += s.m.map(function(c){ return c[0]; }).join('');
    var o = { a: encSide(s.a), m: encSide(s.m) };
    if (accA.trim() === A[pi]){
      if (accM.trim() !== M[pi]) throw new Error(u.id + ': η παράγραφος ' + (pi + 1) + ' κλείνει στο αρχαίο αλλά όχι στη μετάφραση');
      o.end = true; pi++; accA = accM = '';
    }
    return o;
  });
  if (pi !== A.length || accA) throw new Error(u.id + ': οι περίοδοι δεν ομαδοποιούνται στις ' + A.length + ' παραγράφους');
  var ak = Object.keys(u.align).filter(function(k){ return k !== 'pairs' && k !== 'segs'; });
  if (ak.length){ J.alignExtra = {}; ak.forEach(function(k){ J.alignExtra[k] = u.align[k]; }); }   /* gk1: `fams` */
  J.pairs = {};
  Object.keys(u.align.pairs).forEach(function(k){
    var p = u.align.pairs[k], pk = Object.keys(p).filter(function(x){ return x !== 'a' && x !== 'm' && x !== 'w'; });
    if (pk.length) throw new Error(u.id + ': ζευγάρι ' + k + ' έχει άγνωστα πεδία ' + pk.join(','));
    J.pairs[k] = [p.a, p.m, p.w];
  });
  var extra = {}, drop = [];
  Object.keys(u).forEach(function(k){ if (!KNOWN[k]) extra[k] = u[k]; });
  Object.keys(DEFAULTS).forEach(function(k){
    if (!(k in u)) drop.push(k);
    else if (JSON.stringify(u[k]) !== JSON.stringify(DEFAULTS[k])) extra[k] = u[k];
  });
  if (u.section !== sectionOf(N)) extra.section = u.section;
  if (Object.keys(extra).length) J.extra = extra;
  if (drop.length) J.drop = drop;
  return J;
}

/* συμπαγές → unit. Επιστρέφει { unit, errs } — ποτέ δεν πετάει. */
function decode(J){
  var errs = [];
  var N = +String(J.id || '').slice(2);
  var segs = [], ancient = [], text = [], accA = '', accM = '';
  (J.segs || []).forEach(function(s, i){
    var w = 'S' + (i + 1);
    var a = decSide(s.a, w + '.a', errs), m = decSide(s.m, w + '.m', errs);
    segs.push({ n: i + 1, a: a, m: m });
    accA += a.map(function(c){ return c[0]; }).join(''); accM += m.map(function(c){ return c[0]; }).join('');
    if (s.end){ ancient.push({ p: accA.trim() }); text.push({ p: accM.trim() }); accA = accM = ''; }
  });
  if ((J.segs || []).length && (accA || accM)) errs.push('S' + J.segs.length + ': η τελευταία περίοδος δεν έχει end:true — κάθε παράγραφος κλείνει με end');
  var pairs = {};
  Object.keys(J.pairs || {}).forEach(function(k){
    var p = J.pairs[k];
    if (!Array.isArray(p) || p.length !== 3) errs.push('pairs.' + k + ': θέλει [αρχαίο, μετάφραση, εξήγηση]');
    pairs[k] = { a: (p || [])[0], m: (p || [])[1], w: (p || [])[2] };
  });
  var u = { id: J.id, added: J.added, mark: null, chapter: CHAPTER, section: sectionOf(N), title: J.title, byHeart: true,
    short: J.short, gist: J.gist, author: J.author };
  if (J.cite !== undefined) u.cite = J.cite;
  if (J.translator !== undefined) u.translator = J.translator;
  u.simple = J.simple; u.onlyAlign = true; u.text = text; u.ancient = ancient; u.align = { pairs: pairs, segs: segs };
  Object.keys(J.alignExtra || {}).forEach(function(k){ u.align[k] = J.alignExtra[k]; });
  Object.keys(J.extra || {}).forEach(function(k){ u[k] = J.extra[k]; });
  (J.drop || []).forEach(function(k){ delete u[k]; });
  return { unit: u, errs: errs };
}

/* ══ 2 · Ο ΑΧΥΡΩΝΑΣ ══════════════════════════════════════════════════
   ΙΔΙΑ κανονικοποίηση με το tests/arxaia-gnosto.test.js: NFC (oxia→tonos),
   soft hyphen + ό,τι κενό ακολουθεί, κενά → ένα, και ΜΕΤΑ οι ΔΗΛΩΜΕΝΕΣ
   διορθώσεις, και τέλος τα αποστρόφια διπλώνουν σε «'». */
function flat(s){ return String(s).normalize('NFC').replace(/­\s*/g, '').replace(/\s+/g, ' ').trim(); }
function fold(s){ return String(s).replace(/[‘’ʼ´΄]/g, "'").replace(/\s+/g, ' ').trim(); }
function bodyOf(raw){ return raw.split('\n').filter(function(l){ return l[0] !== '#'; }).join('\n'); }
function sides(body){
  var i = body.indexOf('\n@@@\n');
  if (i < 0) return null;
  return { anc: body.slice(0, i), mod: body.slice(i + 5) };
}
function hayOf(J, body){
  var r = sides(body), out = { raw: {}, anc: '', mod: '' };
  if (!r) return out;
  ['anc', 'mod'].forEach(function(k){
    var t = flat(r[k]); out.raw[k] = t;
    (J.fixes || []).forEach(function(f){ t = t.split(f[0]).join(f[1]); });
    out[k] = fold(t);
  });
  return out;
}

/* ══ 3 · ΟΙ ΚΑΝΟΝΕΣ (κοινοί με το test) ═══════════════════════════════ */
function strings(v, p, out){
  if (typeof v === 'string') out.push([p, v]);
  else if (Array.isArray(v)) v.forEach(function(x, i){ strings(x, p + '[' + i + ']', out); });
  else if (v && typeof v === 'object') Object.keys(v).forEach(function(k){ strings(v[k], p ? p + '.' + k : k, out); });
  return out;
}
function firstDiff(a, b){ var i = 0; while (i < a.length && a[i] === b[i]) i++; return i; }
function around(s, i){ return '«…' + s.slice(Math.max(0, i - 25), i) + '⟦' + s.slice(i, i + 25) + '…»'; }

function checkText(J, body){
  var errs = [];
  function e(m){ errs.push(m); }
  var id = J.id || '?', N = +String(id).slice(2);
  if (!/^gk\d+$/.test(id)) e('id: «' + id + '» δεν είναι gkN');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(J.added || '')) e('added: θέλει ΕΕΕΕ-ΜΜ-ΗΗ');
  ['title', 'short', 'gist', 'author', 'cite', 'translator'].forEach(function(k){ if (!J[k]) e(k + ': κενό'); });
  if (J.short && J.short === J.title) e('short: αντιγραφή του title');
  if (!Array.isArray(J.simple) || J.simple.length < 3) e('simple: τουλάχιστον 3 γραμμές «με απλά λόγια»');
  (J.simple || []).forEach(function(s, i){ if (/[ἀ-῿]/.test(s)) e('simple[' + i + ']: πολυτονικό σε νεοελληνικό κείμενο'); });
  strings(J, '', []).forEach(function(x){
    var bad = x[1].split('').filter(function(c){ return c.normalize('NFC') !== c; });
    if (bad.length) e(x[0] + ': OXIA αντί για ΤΟΝΟ (U+' + bad[0].charCodeAt(0).toString(16).toUpperCase() + ') — τρέξε NFC');
  });

  var D = decode(J); D.errs.forEach(e);
  var u = D.unit, segs = u.align.segs, P = u.align.pairs;
  if (!segs.length) e('segs: καμία περίοδος');

  /* η πηγή */
  if (!body) e('πηγή: δεν υπάρχει (' + (J.source || '?') + ') — `keimeno.js source ' + id + '`');
  else {
    if (sha(body) !== J.sourceSha) e('πηγή: sha ' + sha(body).slice(0, 12) + ' ≠ sourceSha ' + String(J.sourceSha).slice(0, 12) + ' — η πηγή άλλαξε ή δεν καρφώθηκε');
    if (!sides(body)) e('πηγή: λείπει το «@@@» ανάμεσα σε αρχαίο και μετάφραση');
  }
  var H = body ? hayOf(J, body) : { raw: { anc: '', mod: '' }, anc: '', mod: '' };

  /* οι διορθώσεις: η καθεμία υπάρχει στο ωμό, λείπει μετά, και λέει γιατί */
  (J.fixes || []).forEach(function(f, i){
    if (!Array.isArray(f) || f.length !== 3 || !f[2]) return e('fixes[' + i + ']: θέλει [από, σε, γιατί] με αιτιολογία');
    if (H.raw.anc.indexOf(f[0]) < 0 && H.raw.mod.indexOf(f[0]) < 0) e('fixes[' + i + ']: το «' + f[0] + '» ΔΕΝ υπάρχει στην ωμή πηγή — η διόρθωση δεν χτυπάει τίποτα');
    var after = [H.raw.anc, H.raw.mod].map(function(t){ (J.fixes || []).forEach(function(g){ t = t.split(g[0]).join(g[1]); }); return t; });
    if (after.some(function(t){ return t.indexOf(f[0]) >= 0; })) e('fixes[' + i + ']: το «' + f[0] + '» ΥΠΑΡΧΕΙ ακόμη μετά τις διορθώσεις');
  });

  /* ένωση = πηγή, ΑΥΤΟΛΕΞΕΙ, και στις δύο πλευρές */
  [['anc', u.ancient, 'a', 'αρχαίο'], ['mod', u.text, 'm', 'μετάφραση']].forEach(function(x){
    var got = fold(x[1].map(function(b){ return b.p; }).join(' ')), want = H[x[0]];
    if (!body || got === want) return;
    var i = firstDiff(got, want), acc = 0, where = '?';
    for (var s = 0; s < segs.length; s++){
      acc += fold(segs[s][x[2]].map(function(c){ return c[0]; }).join('')).length + 1;
      if (acc > i){ where = 'S' + (s + 1) + '.' + x[2]; break; }
    }
    e(x[3] + ' (' + where + '): η ένωση ΔΕΝ είναι η πηγή αυτολεξεί — JSON ' + around(got, i) + ' · πηγή ' + around(want, i));
  });

  /* κλειδιά: και στις δύο πλευρές, κανένα ορφανό, πλήρη ζευγάρια */
  var used = {}, ka = [], km = [];
  segs.forEach(function(s){
    s.a.forEach(function(c){ if (c[1]){ (used[c[1]] = used[c[1]] || {}).a = 1; if (ka.indexOf(c[1]) < 0) ka.push(c[1]); } });
    s.m.forEach(function(c){ if (c[1]){ (used[c[1]] = used[c[1]] || {}).m = 1; if (km.indexOf(c[1]) < 0) km.push(c[1]); } });
  });
  Object.keys(used).forEach(function(k){
    var at = segs.filter(function(s){ return s.a.concat(s.m).some(function(c){ return c[1] === k; }); })[0];
    if (!P[k]) e('S' + at.n + ': κλειδί «' + k + '» χωρίς ζευγάρι στο pairs');
    else if (!used[k].a || !used[k].m) e('S' + at.n + ': το «' + k + '» λείπει από ' + (used[k].a ? 'τη μετάφραση (m)' : 'το αρχαίο (a)'));
  });
  Object.keys(P).forEach(function(k){
    if (!used[k]) e('pairs.' + k + ': δεν χρησιμοποιείται σε καμία περίοδο');
    if (!P[k].a || !P[k].m || !P[k].w) e('pairs.' + k + ': θέλει αρχαίο, μετάφραση ΚΑΙ εξήγηση');
  });
  if (ka.length && ka.join() === km.join()) e('κλειδιά: ίδια σειρά και στις δύο γλώσσες — η αντιστοιχία δεν προσθέτει τίποτα (λάθος κόψιμο;)');
  if (u.ancient.length !== u.text.length || !u.ancient.length) e('παράγραφοι: αρχαίο ' + u.ancient.length + ' ≠ μετάφραση ' + u.text.length);

  /* στίξη: ό,τι κλείνει πρόταση ακολουθείται από κενό · κάθε παράγραφος κλείνει με τελικό σημείο */
  u.ancient.concat(u.text).forEach(function(b, i){
    var lab = (i < u.ancient.length ? 'αρχαίο §' + (i + 1) : 'μετάφραση §' + (i + 1 - u.ancient.length));
    var m = /[,;·!:](?=\p{L})|\.(?=\p{L}{2})/u.exec(b.p);
    if (m) e(lab + ': στίξη κολλημένη σε λέξη ' + around(b.p, m.index));
    if (!/[.;!·»)…]$/.test(b.p)) e(lab + ': δεν κλείνει με τελικό σημείο (.;!) — λείπει κομμάτι ή end σε λάθος περίοδο');
  });

  /* μετρήσεις: κάθε αριθμός που λένε οι εξηγήσεις είναι μετρημένος στην πηγή */
  (J.counts || []).forEach(function(c, i){
    if (!Array.isArray(c) || c.length < 3 || !c[2]) return e('counts[' + i + ']: θέλει [regex, n, γιατί]');
    var re; try { re = new RegExp(c[0], 'gu'); } catch (x){ return e('counts[' + i + ']: κακό regex — ' + x.message); }
    var n = (H[c[3] === 'm' ? 'mod' : 'anc'].match(re) || []).length;
    if (n !== c[1]) e('counts[' + i + ']: /' + c[0] + '/ μετράει ' + n + ', το JSON λέει ' + c[1] + ' (' + c[2] + ')');
  });

  /* κανένα χρώμιο σελίδας μέσα στα μπλοκ */
  if (body){
    var both = H.anc + ' ' + H.mod;
    if (/\d/.test(both)) e('πηγή: ψηφίο μέσα στο κείμενο ' + around(both, both.search(/\d/)) + ' — αριθμός σελίδας ή παραπομπή μέσα στο rect');
    if (/ΕΝ[ΟΌ]ΤΗΤΑ|ΚΕΙΜΕΝΟ ΑΝΑΦΟΡΑΣ/.test(both)) e('πηγή: κεφαλίδα της σελίδας μέσα στο κείμενο');
    if (/\(?μετάφραση\s/.test(H.mod)) e('πηγή: η υπογραφή «(μετάφραση …)» μπήκε στη μετάφραση — το rect πιάνει μία γραμμή πιο κάτω');
    var sur = String(J.translator || '').split(/\s+/).pop();
    if (sur && sur.length > 3 && H.mod.indexOf(sur) >= 0) e('πηγή: το όνομα του μεταφραστή «' + sur + '» μέσα στη μετάφραση');
    if (H.anc.indexOf(String(J.cite || '@@')) >= 0) e('πηγή: η παραπομπή «' + J.cite + '» μέσα στο αρχαίο');
    if (/[Ͱ-Ͽ]/.test(H.anc) && !L.POLY.test(H.anc)) e('πηγή: το αρχαίο δεν έχει ούτε ένα πολυτονικό σημάδι — λάθος στήλη;');
  }
  return errs;
}

/* ══ 4 · ΤΟ BLOCK ΣΤΟ arxaia-gnosto-data.js ══════════════════════════ */
function lit(v){ return JSON.stringify(v); }
function key(k){ return /^[A-Za-z_$][\w$]*$/.test(k) ? k : lit(k); }
function blockOf(J){
  var u = decode(J).unit, id = J.id, out = [];
  out.push('  /* ⟪' + id + '⟫ — ΠΑΡΑΓΕΤΑΙ από tools/gnosto/' + id + '.text.json · `node tools/gnosto/keimeno.js wire ' + id + '`.');
  out.push('     ⛔ Μην το αγγίξεις με το χέρι: αλλάζεις το JSON και ξανατρέχεις wire. Πηγή: ' + J.source + ' */');
  out.push('  {');
  var order = ['id', 'added', 'mark', 'chapter', 'section', 'title', 'byHeart', 'short', 'gist', 'author', 'cite', 'translator', 'simple', 'onlyAlign', 'text', 'ancient'];
  Object.keys(u).forEach(function(k){ if (order.indexOf(k) < 0 && k !== 'align') order.push(k); });
  order.forEach(function(k){
    if (!(k in u)) return;
    var v = u[k];
    if (k === 'simple') out.push('    simple: [\n' + v.map(function(s){ return '      ' + lit(s); }).join(',\n') + '\n    ],');
    else if (k === 'text' || k === 'ancient') out.push('    ' + k + ': [\n' + v.map(function(b){ return '      { p: ' + lit(b.p) + ' }'; }).join(',\n') + '\n    ],');
    else out.push('    ' + key(k) + ': ' + lit(v) + ',');
  });
  out.push('    align: {');
  out.push('      pairs: {\n' + Object.keys(u.align.pairs).map(function(k){
    var p = u.align.pairs[k];
    return '        ' + key(k) + ': { a: ' + lit(p.a) + ', m: ' + lit(p.m) + ', w: ' + lit(p.w) + ' }';
  }).join(',\n') + '\n      },');
  out.push('      segs: [\n' + u.align.segs.map(function(s){
    return '        { n: ' + s.n + ',\n          a: ' + lit(s.a) + ',\n          m: ' + lit(s.m) + ' }';
  }).join(',\n') + '\n      ]' + (J.alignExtra ? ',' : ''));
  Object.keys(J.alignExtra || {}).forEach(function(k, i, ks){ out.push('      ' + key(k) + ': ' + lit(J.alignExtra[k]) + (i + 1 < ks.length ? ',' : '')); });
  out.push('    }');
  out.push('  }');
  out.push('  /* ⟪/' + id + '⟫ */');
  return out.join('\n');
}
/* Γράφει/αντικαθιστά ΙΔΕΜΠΟΤΕΝΤΑ. Επιστρέφει το νέο κείμενο του αρχείου. */
function spliceBlock(src, J){
  var id = J.id, block = blockOf(J);
  var A = '  /* ⟪' + id + '⟫', Z = '/* ⟪/' + id + '⟫ */';
  var a = src.indexOf(A);
  if (a >= 0){
    var z = src.indexOf(Z, a);
    if (z < 0) throw new Error('βρέθηκε ⟪' + id + '⟫ χωρίς ⟪/' + id + '⟫');
    return src.slice(0, a) + block + src.slice(z + Z.length);
  }
  var u0 = src.indexOf('var UNITS = ['), close = src.indexOf('\n  ];', u0);
  if (u0 < 0 || close < 0) throw new Error('δεν βρέθηκε το `var UNITS = [ … ];`');
  if (new RegExp("\\n\\s*id: '" + id + "',").test(src.slice(u0, close)))
    throw new Error(id + ' υπάρχει ήδη ως ΧΕΙΡΟΠΟΙΗΤΟ block στο UNITS — το wire γράφει μόνο ⟪' + id + '⟫ blocks· ποτέ πάνω σε χειροποίητο');
  /* σειρά: πριν από το πρώτο ⟪gkM⟫ με M > N, αλλιώς στο τέλος */
  var N = +id.slice(2), re = /\n {2}\/\* ⟪gk(\d+)⟫/g, m, at = -1;
  re.lastIndex = u0;
  while ((m = re.exec(src)) && m.index < close){ if (+m[1] > N){ at = m.index + 1; break; } }
  if (at >= 0) return src.slice(0, at) + block + ',\n' + src.slice(at);
  var end = close; while (/\s/.test(src[end - 1])) end--;
  return src.slice(0, end) + ',\n' + block + src.slice(end);
}

/* ══ 5 · ΒΟΗΘΗΤΙΚΑ ════════════════════════════════════════════════════ */
function die(m){ console.error('✗ ' + m); process.exit(1); }
function loadJ(id){
  var f = fileOf(id);
  if (!fs.existsSync(f)) die('δεν υπάρχει το ' + path.basename(f) + ' — πρώτα `node tools/gnosto/keimeno.js scaffold ' + id + '`');
  try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (x){ die(path.basename(f) + ': άκυρο JSON — ' + x.message); }
}
function saveJ(J){
  var order = ['id', 'added', 'title', 'short', 'gist', 'author', 'cite', 'translator', 'simple', 'source', 'sourceSha', 'src', 'fixes', 'counts', 'segs', 'pairs', 'alignExtra', 'extra', 'drop'];
  var o = {};
  order.forEach(function(k){ if (k in J) o[k] = J[k]; });
  Object.keys(J).forEach(function(k){ if (!(k in o)) o[k] = J[k]; });
  fs.writeFileSync(fileOf(J.id), F.fmt(o));
}
function readBody(J){
  var f = path.join(ROOT, J.source || '');
  return J.source && fs.existsSync(f) ? bodyOf(fs.readFileSync(f, 'utf8')) : '';
}
function listTexts(){
  return fs.readdirSync(__dirname).filter(function(x){ return /^gk\d+\.text\.json$/.test(x); }).sort().map(function(x){
    var J = JSON.parse(fs.readFileSync(path.join(__dirname, x), 'utf8'));
    var f = path.join(ROOT, J.source || ''), raw = J.source && fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : '';
    return { id: J.id, J: J, body: raw ? bodyOf(raw) : '', head: raw.split('\n').filter(function(l){ return l[0] === '#'; }).join('\n'), file: x };
  });
}

/* ══ 6 · ΓΕΩΜΕΤΡΙΑ (scaffold) ════════════════════════════════════════ */
function S(){ return require('./source.js'); }
function geom(pdf, i){
  return S().run(pdf, ['lines', i]).split('\n').filter(Boolean).map(function(l){
    var m = /^\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+) \| (.*)$/.exec(l);
    if (!m) return null;
    return { x0: +m[1], y0: +m[2], x1: +m[3], y1: +m[4], t: m[5].replace(/⏎/g, '\n'), h: +m[4] - +m[2], page: i };
  }).filter(Boolean);
}
/* η ψηλότερη γραμμή της αριστερής στήλης που έχει ΔΙΠΛΑ της γραμμή της δεξιάς */
function twoColTop(g){
  var t = null;
  g.forEach(function(l){
    if (l.x0 < 200 && l.x1 < 320 && !isSig(l) && !isNum(l) &&
        g.some(function(r){ return r.x0 >= 300 && r.x0 < 400 && Math.abs(r.y0 - l.y0) < 3; }) && (!t || l.y1 > t.y1)) t = l;
  });
  return t;
}
var isSig = function(l){ return /^\(?μετάφραση\s/.test(l.t.trim()); };
var isNum = function(l){ return /^\d+$/.test(l.t.trim()); };
function r1(v){ return Math.round(v * 10) / 10; }
function bareUp(s){ return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase(); }

function propose(N){
  var pdf = S().PDF_DEFAULT; S().checkPdf(pdf);
  var start = +S().run(pdf, ['find', N]).trim().split('\n')[0];
  if (isNaN(start)) die('δεν βρέθηκε «ΔΙΔΑΚΤΙΚΗ ΕΝΟΤΗΤΑ ' + N + '» στον Φάκελο');
  var nx = S().run(pdf, ['find', N + 1]).trim().split('\n')[0];
  var end = nx ? +nx - 1 : start + 6;
  var P = {}, warn = [];
  for (var i = start; i <= end; i++) P[i] = geom(pdf, i);
  var g0 = P[start];
  var head = g0.filter(function(l){ return new RegExp('ΕΝ[ΟΌ]ΤΗΤΑ\\s*' + N + '\\s').test(l.t); })[0];
  var kei = g0.findIndex(function(l){ return /ΚΕΙΜΕΝΟ ΑΝΑΦΟΡΑΣ/.test(l.t); });
  var citeL = kei >= 0 ? g0[kei + 1] : null;
  if (!citeL) warn.push('δεν βρέθηκε η γραμμή παραπομπής κάτω από «ΚΕΙΜΕΝΟ ΑΝΑΦΟΡΑΣ»');
  /* το αρχαίο: ΟΛΗ η ζώνη ανάμεσα στην παραπομπή και την ΠΡΩΤΗ γραμμή δύο στηλών
     (αριστερή + δεξιά στο ίδιο ύψος). ⚠️ ΟΧΙ με ύψος γραμματοσειράς: γραμμές της
     μετάφρασης με soft hyphen ή «¯» βγαίνουν 15,5pt, όσο το αρχαίο (gk5 σελ. 51). */
  var anc = [], ancParts = [];
  for (i = start; i <= end; i++){
    var gi = P[i], tc = twoColTop(gi);
    var top = i === start && citeL ? citeL.y0 : 1e9;
    var ls = gi.filter(function(l){ return l.y1 <= top + 0.5 && (!tc || l.y0 > tc.y1 - 0.5) && !isNum(l) && !isSig(l) && l.h <= 16.5; });
    if (i > start && !ls.some(function(l){ return L.POLY.test(l.t); })) break;
    if (!ls.length) break;
    ls.sort(function(a, b){ return b.y0 - a.y0; });
    var lo = ls[ls.length - 1], hi = ls[0];
    var above = gi.filter(function(l){ return l.y0 >= hi.y1 - 0.5 && l !== hi; }).sort(function(a, b){ return a.y0 - b.y0; })[0];
    var below = gi.filter(function(l){ return l.y1 <= lo.y0 + 0.5 && l !== lo; }).sort(function(a, b){ return b.y1 - a.y1; })[0];
    var yT = above ? (hi.y1 + above.y0) / 2 : hi.y1 + 6, yB = below ? (lo.y0 + below.y1) / 2 : lo.y0 - 6;
    ancParts.push({ page: i, rect: [0, r1(yB), 600, r1(yT - yB)] });
    anc = anc.concat(ls);
    if (tc) break;
  }
  if (!anc.length) warn.push('δεν βρέθηκαν γραμμές αρχαίου κάτω από την παραπομπή');
  var ancPage = ancParts.length ? ancParts[ancParts.length - 1].page : start;
  var ancLow = anc.length ? Math.min.apply(null, anc.filter(function(l){ return l.page === ancPage; }).map(function(l){ return l.y0; })) : 1e9;
  /* η μετάφραση που μαθαίνει: η ΑΡΙΣΤΕΡΗ στήλη, ως την υπογραφή της */
  var modParts = [], sigL = null, sigR = [];
  for (i = ancPage; i <= end && !sigL; i++){
    var g = P[i], cut = i === ancPage ? ancLow : 1e9;
    /* δεξιά στήλη = ό,τι αρχίζει από x≥300· ένα κομμάτι γραμμής («λι» στο 292, gk9 σελ. 90) ανήκει στην αριστερή */
    var rMin = Math.min.apply(null, g.filter(function(l){ return l.x0 >= 300 && l.x0 < 400 && !isSig(l); }).map(function(l){ return l.x0; }).concat([1e9]));
    var ls2 = g.filter(function(l){ return l.y1 <= cut + 0.5 && l.x0 < 300 && l.x1 < Math.min(rMin, 320) && !isNum(l); });
    var sl = ls2.filter(isSig)[0];
    g.filter(function(l){ return isSig(l) && l.x0 >= 250; }).forEach(function(l){ sigR.push(l); });
    if (sl){ sigL = sl; ls2 = ls2.filter(function(l){ return l.y1 > sl.y1 + 1; }); }
    ls2 = ls2.filter(function(l){ return !isSig(l); });
    if (!ls2.length) continue;
    var yLo = Math.min.apply(null, ls2.map(function(l){ return l.y0; })), yHi = Math.max.apply(null, ls2.map(function(l){ return l.y1; }));
    var maxX = Math.max.apply(null, ls2.map(function(l){ return l.x1; }));
    var right = g.filter(function(l){ return l.x0 >= 300 && l.x0 < 400 && l.x0 > maxX && !isSig(l) && l.y1 > yLo - 1 && l.y0 < yHi + 1; });
    var minX = right.length ? Math.min.apply(null, right.map(function(l){ return l.x0; })) : maxX + 30;
    var w = r1((maxX + minX) / 2);
    var lo2 = ls2.filter(function(l){ return l.y0 === yLo; })[0], hi2 = ls2.filter(function(l){ return l.y1 === yHi; })[0];
    var bl = sl || g.filter(function(l){ return l.y1 <= yLo + 0.5 && l !== lo2 && l.x0 < w; }).sort(function(a, b){ return b.y1 - a.y1; })[0];
    var ab = i === ancPage && anc.length ? { y0: ancLow } : g.filter(function(l){ return l.y0 >= yHi - 0.5 && l !== hi2 && l.x0 < w; }).sort(function(a, b){ return a.y0 - b.y0; })[0];
    var yT2 = ab ? (yHi + ab.y0) / 2 : yHi + 6;
    /* ⚠️ η υπογραφή μπορεί να ΕΠΙΚΑΛΥΠΤΕΙ την τελευταία γραμμή (gk7 σελ. 68: 0,5pt):
       δοκίμασε κάτω όρια και κράτα το πρώτο που ΠΕΡΙΕΧΕΙ την τελευταία γραμμή
       και ΔΕΝ περιέχει την υπογραφή — με πραγματικό κόψιμο, όχι με αριθμητική. */
    var cands = [bl ? (yLo + bl.y1) / 2 : yLo - 6, yLo - 0.3, yLo - 1, yLo - 2, yLo - 3.5], yB2 = null;
    for (var ci = 0; ci < cands.length && yB2 === null; ci++){
      var tt = squash(S().run(pdf, ['rect', i, 0, r1(cands[ci]), w, r1(yT2 - cands[ci])]));
      if (tt.indexOf(squash(lo2.t)) >= 0 && tt.indexOf(squash(hi2.t)) >= 0 && !/μετάφραση/.test(tt)) yB2 = cands[ci];
    }
    if (yB2 === null){ yB2 = cands[0]; warn.push('σελ. ' + i + ': κανένα κάτω όριο δεν πιάνει την τελευταία γραμμή χωρίς την υπογραφή — μέτρα με το χέρι'); }
    modParts.push({ page: i, rect: [0, r1(yB2), w, r1(yT2 - yB2)], lines: ls2.length, maxX: maxX, minX: minX });
  }
  if (!sigL) warn.push('δεν βρέθηκε υπογραφή «(μετάφραση …)» της αριστερής στήλης');
  var cite = citeL ? citeL.t.replace(/\s+/g, ' ').trim() : '';
  var parts = cite.split(/,\s*/), au = parts.shift() || '', work = (parts.shift() || '').trim();
  var wm = /^(.*?)\s+(\S*\d.*)$/.exec(work), short = wm ? wm[1] : work, cit = [wm ? wm[2] : ''].concat(parts).filter(Boolean).join(', ');
  var G = require(DATA), author = (G.UNITS.map(function(u){ return u.author; }).filter(function(a){ return a && bareUp(a) === bareUp(au); })[0]);
  if (!author){ author = au.charAt(0) + au.slice(1).toLowerCase(); warn.push('συγγραφέας «' + author + '» μαντεμένος από κεφαλαία — βάλε τόνο'); }
  var headT = head ? [head].concat(g0.filter(function(l){ return l !== head && l.h > 18 && l.y0 < head.y0 && l.y1 > head.y0 - 30 && !/ΚΕΙΜΕΝΟ|ΔΙΔΑΚΤΙΚ/.test(l.t); })).map(function(l){ return l.t; }).join(' ') : '';
  var ht = head ? headT.replace(/\s+/g, ' ').replace(new RegExp('^.*ΕΝ[ΟΌ]ΤΗΤΑ\\s*' + N + '\\s+'), '').trim() : '';
  var trans = sigL ? sigL.t.trim().replace(/^\(?μετάφραση\s+/, '').replace(/\)\s*$/, '') : '';
  return { N: N, start: start, end: end, pages: P, anc: ancParts, mod: modParts, warn: warn,
    author: author, short: short, cite: cit, citeLine: cite, heading: ht, translator: trans,
    others: sigR.map(function(l){ return l.t.trim(); }),
    title: author + ', ' + short + (cit ? ' ' + cit : '') + (ht ? ' — ' + ht.charAt(0).toLowerCase() + ht.slice(1) : '') };
}

/* ══ 7 · ΣΑΡΩΣΗ ΥΠΟΠΤΩΝ (source) ═════════════════════════════════════ */
var CLITIC = ('ο η το οι τα του της των τον την τη τους τις στο στη στον στην στα στους στις σε με για να θα δεν μη μην και κι αν ως ' +
  'που πως πια μου σου μας σας ναι ή ας ό,τι αυτό ενώ όχι μα αλλά από προς εκεί πάλι ίδιο ίδια όλα όλη όλο καν ούτε μήτε ' +
  'μια ένα σαν τι δε εξ εκ δα').split(' ');
var ACCMONO = ['πού', 'πώς', 'ή', 'μού', 'σού', 'τού'];
/* συλλαβές ≈ ομάδες φωνηέντων + χασμωδίες (τονισμένο φωνήεν πριν από φωνήεν: «ζώ-α») */
function sylls(w){ return (w.match(/[αεηιουωάέήίόύώϊϋΐΰ]+/g) || []).length + (w.match(/[άέήίόύώ](?=[αεηιουω])/g) || []).length; }
function accd(w){ return /[άέήίόύώΐΰ]/.test(w); }
function suspects(side, text){
  var out = [], m;
  if (side === 'mod'){
    var toks = text.split(' ');
    for (var i = 0; i + 1 < toks.length; i++){
      var a = toks[i], b = toks[i + 1];
      if (!/^[α-ωάέήίόύώϊϋΐΰς]+$/i.test(a) || !/^[α-ωάέήίόύώϊϋΐΰς]+/.test(b) || /['’]/.test(b)) continue;
      var bw = b.replace(/[^α-ωάέήίόύώϊϋΐΰς]+$/, ''), al = a.toLowerCase();
      if (a.length > 4 || CLITIC.indexOf(al) >= 0 || !bw) continue;
      var b1 = sylls(bw) === 1;
      var hit = (!accd(al) && sylls(al) >= 2) ||                                   /* «ασχο ληθούν»: πολυσύλλαβο άτονο */
        (b1 && accd(bw) && ACCMONO.indexOf(bw) < 0) ||                             /* «μπο ρούν»: τονισμένο μονοσύλλαβο */
        (b1 && !accd(bw) && CLITIC.indexOf(bw) < 0 && (accd(al) || sylls(al) === 1)); /* «επί σης», «τέ λος» */
      if (hit) out.push({ kind: 'κενό μέσα σε λέξη', frag: a + ' ' + bw });
    }
  }
  var R = [[/[\p{L}]- \p{Ll}+/gu, 'ορατή παύλα σε αλλαγή γραμμής'], [/\S+\. \p{Ll}\S*/gu, '«. πεζό» — μάλλον ΑΝΩ ΤΕΛΕΙΑ (·) που το PDF γράφει «.»'], [/\S*¯\S*/g, '«¯» αντί για παύλα']];
  R.forEach(function(r){ r[0].lastIndex = 0; while ((m = r[0].exec(text))) out.push({ kind: r[1], frag: m[0] }); });
  return out;
}
function squash(s){ return String(s).normalize('NFC').replace(/[\s­]+/g, ''); }

/* ══ 8 · ΟΙ ΕΝΤΟΛΕΣ ══════════════════════════════════════════════════ */
function cmdScaffold(id, dry){
  var N = +id.slice(2), f = fileOf(id);
  if (!dry && fs.existsSync(f)) die(path.basename(f) + ' υπάρχει ήδη — δεν το ξαναγράφω (σβήσ’ το ή διόρθωσε τα src χειροκίνητα)');
  var p = propose(N), WORK = path.join(os.tmpdir(), 'gnosto-' + id);
  fs.mkdirSync(WORK, { recursive: true });
  var sheet = [];
  Object.keys(p.pages).forEach(function(pi){
    sheet.push('════════ idx ' + pi + ' ════════');
    p.pages[pi].forEach(function(l){
      var r = isSig(l) ? 'ΥΠΟ' : isNum(l) ? 'ΣΕΛ' : (p.anc.some(function(a){ return a.page === +pi && l.y0 >= a.rect[1] && l.y1 <= a.rect[1] + a.rect[3]; }) ? 'ΑΡΧ'
        : p.mod.some(function(a){ return a.page === +pi && l.y0 >= a.rect[1] && l.y1 <= a.rect[1] + a.rect[3] && l.x1 <= a.rect[2]; }) ? 'ΜΑΘ' : '');
      sheet.push((r ? '[' + r + ']' : '     ') + ' ' + [l.x0, l.y0, l.x1, l.y1].map(function(v){ return v.toFixed(1); }).join(' ') + ' h' + l.h.toFixed(1) + ' | ' + l.t.replace(/\n/g, '⏎').slice(0, 100));
    });
  });
  var gf = path.join(WORK, 'geometry.txt');
  fs.writeFileSync(gf, sheet.join('\n') + '\n');
  var J = {
    id: id, added: new Date().toISOString().slice(0, 10), title: p.title, short: p.short, gist: '', author: p.author, cite: p.cite, translator: p.translator, simple: [],
    source: 'tests/arxaia-enotita' + N + '.source.txt', sourceSha: '',
    src: { unit: N, anc: p.anc.map(function(x){ return { page: x.page, rect: x.rect }; }), mod: p.mod.map(function(x){ return { page: x.page, rect: x.rect }; }) },
    fixes: [], counts: [], segs: [], pairs: {}
  };
  console.log((dry ? '· (dry) ' : '✓ ') + id + ' · σελ. ' + p.start + '–' + p.end + ' · «' + p.citeLine + '»');
  console.log('  title: ' + p.title);
  console.log('  μεταφραστής (αριστερή στήλη): ' + (p.translator || '⚠️ ;') + (p.others.length ? '   · άλλη: ' + p.others.join(' · ') : ''));
  console.log('  αρχαίο: ' + p.anc.map(function(x){ return 'idx ' + x.page + ' [' + x.rect.join(', ') + ']'; }).join(' + '));
  console.log('  μετάφραση: ' + p.mod.map(function(x){ return 'idx ' + x.page + ' [' + x.rect.join(', ') + '] (' + x.lines + ' γρ., αριστερή ως ' + x.maxX + ', δεξιά από ' + x.minX + ')'; }).join(' + '));
  p.warn.forEach(function(w){ console.log('  ⚠️ ' + w); });
  console.log('  γεωμετρία: ' + gf);
  if (dry) return J;
  saveJ(J);
  console.log('  → έλεγξε τα rect στο φύλλο, μετά: node tools/gnosto/keimeno.js source ' + id);
}

/* Κόψιμο με ΔΙΠΛΗ διασταύρωση: (α) υποσυμβολοσειρά του page.string, ή — όπου το
   PDF διαβάζει τις δύο στήλες ΕΝΑΛΛΑΞ ανά γραμμή (gk2 σελ. 23) — (β) ίσο με τις
   γραμμές της γεωμετρίας που κάθονται ΟΛΟΚΛΗΡΕΣ μέσα στο rect. Ένα rect που τρώει
   το τελευταίο γράμμα αποτυγχάνει και στα δύο. */
function rectText(pdf, p, label){
  var Sx = S(), r = p.rect;
  if (!Array.isArray(r) || r.length !== 4) throw new Error(label + ': το rect πρέπει να είναι [x, y, w, h]');
  var t = Sx.run(pdf, ['rect', p.page].concat(r)).replace(/\n+$/, '');
  if (!t.trim()) throw new Error(label + ': το rect στη σελίδα ' + p.page + ' είναι ΑΔΕΙΟ');
  if (squash(Sx.run(pdf, ['page', p.page])).indexOf(squash(t)) >= 0) return t;
  var inside = geom(pdf, p.page).filter(function(l){ return l.x0 >= r[0] - 0.5 && l.x1 <= r[0] + r[2] + 0.5 && l.y0 >= r[1] - 0.5 && l.y1 <= r[1] + r[3] + 0.5; })
    .sort(function(a, b){ return b.y0 - a.y0 || a.x0 - b.x0; }).map(function(l){ return l.t; }).join('');
  if (squash(inside) === squash(t)) return t;
  throw new Error(label + ': το rect στη σελίδα ' + p.page + ' ΔΕΝ ταιριάζει ούτε με τη σελίδα ούτε με τις γραμμές του — τρώει γράμματα στην άκρη ή πιάνει μισή γραμμή. Μέτρα με `node tools/gnosto/source.js lines ' + p.page + '`.');
}
function compose(J){
  var Sx = S(), pdf = Sx.PDF_DEFAULT; Sx.checkPdf(pdf);
  if (!J.src || !(J.src.anc || []).length || !(J.src.mod || []).length) die(J.id + ': λείπει src.anc / src.mod (rect ανά σελίδα)');
  var parts = { anc: [], mod: [] };
  ['anc', 'mod'].forEach(function(k){
    J.src[k].forEach(function(p, i){ parts[k].push({ page: p.page, rect: p.rect, t: rectText(pdf, p, k + '[' + i + ']') }); });
  });
  var body = parts.anc.map(function(p){ return p.t; }).join('\n') + '\n@@@\n' + parts.mod.map(function(p){ return p.t; }).join('\n') + '\n';
  return { body: body, sha: sha(body), parts: parts, pdf: pdf };
}
function header(J){
  var r = function(xs){ return xs.map(function(p){ return 'idx ' + p.page + ' rect(' + p.rect.join(', ') + ')'; }).join(' + '); };
  return [
    '# ══════════════════════════════════════════════════════════════════════',
    '# Η ΠΗΓΗ ΤΟΥ ΚΕΙΜΕΝΟΥ ΤΗΣ ' + J.id.toUpperCase() + ' — ΦΑΚΕΛΟΣ ΥΛΙΚΟΥ, ΔΙΔΑΚΤΙΚΗ ΕΝΟΤΗΤΑ ' + J.src.unit + '.',
    '#',
    '# ⛔ ΜΗΝ ΤΟ ΑΚΟΥΜΠΗΣΕΙΣ ΜΕ ΤΟ ΧΕΡΙ. Ωμό PDFKit (`node tools/gnosto/keimeno.js source ' + J.id + '`),',
    '# PDF sha256 ' + S().PDF_SHA.slice(0, 8) + '… — soft hyphens, OXIA, σπασμένες λέξεις ανέπαφα.',
    '# Το sha256 του σώματος (χωρίς τις γραμμές «#») = `sourceSha` του tools/gnosto/' + J.id + '.text.json.',
    '# Κάθε διόρθωση ζει στο `fixes` εκεί, με αιτιολογία — ΠΟΤΕ εδώ.',
    '#   αρχαίο:    ' + r(J.src.anc),
    '#   μετάφραση: ' + r(J.src.mod) + ' — ' + (J.translator || '?'),
    '# Κάθε rect διασταυρώθηκε με το page.string της σελίδας του: ταυτίζεται.',
    '# ΔΟΜΗ: αρχαίο, @@@, η μετάφραση που μαθαίνει.',
    '# ══════════════════════════════════════════════════════════════════════', ''
  ].join('\n');
}
function cmdSource(id, force){
  var J = loadJ(id), c, out = path.join(ROOT, J.source);
  try { c = compose(J); } catch (x){ die(x.message); }
  var cur = fs.existsSync(out) ? bodyOf(fs.readFileSync(out, 'utf8')) : null;
  if (cur !== null && sha(cur) !== c.sha && !force) die(path.basename(out) + ' υπάρχει με ΑΛΛΟ περιεχόμενο. Αν άλλαξες σκόπιμα rect: --force (και ξανά check).');
  if (cur === null || sha(cur) !== c.sha) fs.writeFileSync(out, header(J) + c.body);
  if (J.sourceSha !== c.sha){ J.sourceSha = c.sha; saveJ(J); }
  console.log('✓ ' + path.basename(out) + ' · sha ' + c.sha.slice(0, 12) + '… · αρχαίο ' + c.parts.anc.length + ' + μετάφραση ' + c.parts.mod.length + ' κόψιμο');
  /* η σάρωση */
  var WORK = path.join(os.tmpdir(), 'gnosto-' + id); fs.mkdirSync(WORK, { recursive: true });
  var list = [], n = 0, G = {};
  function lineOf(page, frag){
    var g = G[page] = G[page] || geom(c.pdf, page), q = squash(frag);
    var one = g.filter(function(l){ return squash(l.t).indexOf(q) >= 0; })[0];
    if (one) return [one];
    var w0 = squash(frag.split(' ')[0]);
    var k = g.findIndex(function(l){ var s = squash(l.t); return s.length >= w0.length && s.slice(-w0.length) === w0; });
    return k >= 0 ? g.slice(k, k + 2) : [];
  }
  function shot(page, ls, tag){
    if (!ls.length) return '(γραμμή δεν βρέθηκε)';
    var x0 = Math.min.apply(null, ls.map(function(l){ return l.x0; })) - 4, x1 = Math.max.apply(null, ls.map(function(l){ return l.x1; })) + 4;
    var y0 = Math.min.apply(null, ls.map(function(l){ return l.y0; })) - 3, y1 = Math.max.apply(null, ls.map(function(l){ return l.y1; })) + 3;
    var png = path.join(WORK, 's' + String(++n).padStart(2, '0') + '-' + tag + '.png');
    S().run(c.pdf, ['render', page, r1(x0), r1(y0), r1(x1 - x0), r1(y1 - y0), png]);
    return png;
  }
  ['anc', 'mod'].forEach(function(k){
    var ps = c.parts[k];
    ps.forEach(function(p, i){
      suspects(k, flat(p.t)).forEach(function(s){
        list.push(k + ' · idx ' + p.page + ' · ' + s.kind + ': «' + s.frag + '» → ' + shot(p.page, lineOf(p.page, s.frag), k));
      });
      if (i + 1 < ps.length){
        var last = flat(p.t).split(' ').pop().replace(/[^\p{L}]/gu, ''), first = flat(ps[i + 1].t).split(' ')[0].replace(/[^\p{L}]/gu, '');
        if (last && last === first){
          var g1 = G[p.page] = G[p.page] || geom(c.pdf, p.page), g2 = G[ps[i + 1].page] = G[ps[i + 1].page] || geom(c.pdf, ps[i + 1].page);
          var l1 = g1.filter(function(l){ return squash(l.t).slice(-last.length) === last && l.y0 >= p.rect[1]; }).sort(function(a, b){ return a.y0 - b.y0; })[0];
          var l2 = g2.filter(function(l){ return squash(l.t).indexOf(first) === 0 && l.y1 <= ps[i + 1].rect[1] + ps[i + 1].rect[3]; }).sort(function(a, b){ return b.y0 - a.y0; })[0];
          list.push(k + ' · idx ' + p.page + '→' + ps[i + 1].page + ' · ΛΕΞΗ ΔΥΟ ΦΟΡΕΣ στην αλλαγή σελίδας: «' + last + '» → ' +
            shot(p.page, l1 ? [l1] : [], 'end') + ' + ' + shot(ps[i + 1].page, l2 ? [l2] : [], 'start'));
        }
      }
    });
  });
  fs.writeFileSync(path.join(WORK, 'suspects.txt'), list.join('\n') + '\n');
  console.log(list.length ? '⚠️ ' + list.length + ' ύποπτα — `Read` κάθε PNG, δήλωσε ό,τι ισχύει στο `fixes` [από, σε, γιατί]:\n  ' + list.join('\n  ')
    : '✓ κανένα ύποπτο (κενό μέσα σε λέξη · «. πεζό» · ορατή παύλα · «¯» · διπλή λέξη σε αλλαγή σελίδας)');
}

function cmdCheck(id){
  var J = loadJ(id), body = readBody(J), errs = checkText(J, body);
  var pdf = S().PDF_DEFAULT;
  if (fs.existsSync(pdf) && J.src){
    try { var c = compose(J); if (c.sha !== sha(body)) errs.push('src: τα rect του JSON ΔΕΝ ξαναβγάζουν την πηγή (' + c.sha.slice(0, 12) + ' ≠ ' + sha(body).slice(0, 12) + ') — άλλαξε rect; τρέξε source --force'); }
    catch (x){ errs.push('src: ' + x.message); }
  } else console.log('· το PDF λείπει — τα rect ΔΕΝ ξαναελέγχθηκαν');
  if (errs.length){ errs.forEach(function(x){ console.error('✗ ' + x); }); console.error('\n' + errs.length + ' σφάλματα — διορθώνεις το JSON, ποτέ τον κανόνα.'); process.exit(1); }
  var u = decode(J).unit;
  console.log('✓ ' + id + ': ' + u.ancient.length + ' παράγραφοι · ' + u.align.segs.length + ' περίοδοι · ' + Object.keys(u.align.pairs).length + ' ζευγάρια · ' +
    (J.fixes || []).length + ' διορθώσεις · ' + (J.counts || []).length + ' μετρήσεις — ένωση = πηγή αυτολεξεί');
}

function freshUnit(id){
  var js = 'var G=require(' + JSON.stringify(DATA) + ');var u=G.unit(' + JSON.stringify(id) + ');process.stdout.write(JSON.stringify({u:u,bad:u?G.alignCheck(u):["λείπει"]}))';
  return JSON.parse(cp.execFileSync(process.execPath, ['-e', js], { encoding: 'utf8', maxBuffer: 64 << 20 }));
}
function deepEq(a, b){ try { require('assert').deepStrictEqual(a, b); return ''; } catch (x){ return x.message.split('\n').slice(0, 12).join('\n'); } }

function cmdWire(id){
  var J = loadJ(id), errs = checkText(J, readBody(J));
  if (errs.length){ errs.forEach(function(x){ console.error('✗ ' + x); }); die(errs.length + ' σφάλματα — το wire αρνείται. Πρώτα `check ' + id + '`.'); }
  var before = fs.readFileSync(DATA, 'utf8'), next;
  try { next = spliceBlock(before, J); } catch (x){ die(x.message); }
  var said = [];
  if (next !== before){
    fs.writeFileSync(DATA, next);
    var f = freshUnit(id), d = f.u ? deepEq(f.u, decode(J).unit) : 'δεν βρέθηκε';
    if (d || f.bad.length){ fs.writeFileSync(DATA, before); die('το block ΔΕΝ ξαναδίνει το JSON (επαναφορά): ' + (d || f.bad.join(' · '))); }
    said.push('arxaia-gnosto-data.js: ⟪' + id + '⟫ (deep-equal με το JSON)');
  }
  var sw = path.join(ROOT, 'sw.js'), s = fs.readFileSync(sw, 'utf8'), b = L.bumpCache(s);
  if (b.s !== s){ fs.writeFileSync(sw, b.s); said.push(b.msg); }
  console.log(said.length ? '✓ ' + said.join(' · ') : '✓ ήδη καλωδιωμένο — καμία αλλαγή');
}

function cmdImport(id){
  var G = require(DATA), u = G.unit(id);
  if (!u) die(id + ' δεν υπάρχει στο arxaia-gnosto-data.js');
  var J; try { J = encode(u); } catch (x){ die(x.message); }
  var d = deepEq(decode(J).unit, u);
  if (d) die('η αποκωδικοποίηση ΔΕΝ ξαναδίνει το unit:\n' + d);
  var f = fileOf(id), old = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : {};
  ['source', 'sourceSha', 'src', 'fixes', 'counts'].forEach(function(k){ if (k in old) J[k] = old[k]; });
  saveJ(J);
  console.log('✓ ' + path.basename(f) + ' από το ζωντανό unit · ' + J.segs.length + ' περίοδοι · ' + Object.keys(J.pairs).length + ' ζευγάρια · round-trip deep-equal' +
    (J.source ? '' : ' · ⚠️ χωρίς source/src/fixes/counts (το import δεν τα εφευρίσκει)'));
}

module.exports = { encode: encode, decode: decode, encSide: encSide, decSide: decSide, flat: flat, fold: fold, bodyOf: bodyOf, sides: sides,
  hayOf: hayOf, checkText: checkText, propose: propose, rectText: rectText, blockOf: blockOf, spliceBlock: spliceBlock, listTexts: listTexts, suspects: suspects, sha: sha, sectionOf: sectionOf };

if (require.main === module){
  var a = process.argv.slice(2), cmd = a[0], id = a[1];
  if (!/^(scaffold|source|check|wire|import|block)$/.test(cmd || '') || !/^gk\d+$/.test(id || ''))
    die('χρήση: node tools/gnosto/keimeno.js (scaffold [--dry] | source [--force] | check | wire | import | block) gkN');
  if (cmd === 'scaffold') cmdScaffold(id, a.indexOf('--dry') >= 0);
  else if (cmd === 'source') cmdSource(id, a.indexOf('--force') >= 0);
  else if (cmd === 'check') cmdCheck(id);
  else if (cmd === 'wire') cmdWire(id);
  else if (cmd === 'import') cmdImport(id);
  else process.stdout.write(blockOf(loadJ(id)) + '\n');
}
