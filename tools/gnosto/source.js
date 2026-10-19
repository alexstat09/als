/* ══════════════════════════════════════════════════════════════════════
   Η ΠΗΓΗ ΤΟΥ ΦΑΚΕΛΟΥ ΓΙΑ ΜΙΑ ΕΝΟΤΗΤΑ → tests/arxaia-gkN-fakelos.source.txt

     node tools/gnosto/source.js gkN            γράφει την πηγή + το sourceSha στο JSON
     node tools/gnosto/source.js gkN --check    μόνο συγκρίνει με το αρχείο που υπάρχει
     node tools/gnosto/source.js find N         σε ποιο pageAtIndex αρχίζει η ενότητα N
     node tools/gnosto/source.js lines I        γεωμετρία γραμμών της σελίδας I (για τα rect)
     node tools/gnosto/source.js page I         ολόκληρη η σελίδα I

   Διαβάζει ΤΟ `fakelos` του gkN.json: για κάθε μπλοκ είτε `parts` με rect
   (μετρημένα από το `lines`), είτε `page` = ολόκληρη η σελίδα χωρίς τον
   αριθμό της. ⭐ ΚΑΘΕ rect διασταυρώνεται με το page.string (σύγκριση χωρίς
   κενά/soft hyphens): ένα rect που ΤΡΩΕΙ τον τελευταίο χαρακτήρα της γραμμής
   (als-v550, als-v640) σταματάει εδώ, ποτέ σιωπηλά στη σελίδα.
   ⚠️ Το PDF ελέγχεται με sha256 πριν από οτιδήποτε.
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
var fs = require('fs'), path = require('path'), os = require('os'), crypto = require('crypto');
var cp = require('child_process');
var L = require('./lib.js');

var PDF_DEFAULT = path.join(os.homedir(), '.cache', 'metron-arxaia', 'fakelos.pdf');
var PDF_SHA = '7ae3f28f3f5afd5aa26b761021e1264f6ee7e84c4b1b965c703f6d0ad9ff2f84';

function die(m){ console.error('✗ ' + m); process.exit(1); }
function expand(p){ return p && p[0] === '~' ? path.join(os.homedir(), p.slice(1)) : p; }

/* Ο αναγνώστης: fakelos.swift, μεταγλωττισμένο ΜΙΑ φορά ανά αλλαγή του. */
function reader(){
  var swift = path.join(__dirname, 'fakelos.swift');
  var st = fs.statSync(swift);
  var bin = path.join(os.tmpdir(), 'gnosto-fakelos-' + Math.round(st.mtimeMs));
  if (!fs.existsSync(bin)){
    try { cp.execFileSync('swiftc', ['-O', swift, '-o', bin], { stdio: ['ignore', 'ignore', 'pipe'] }); }
    catch (e){ die('δεν μεταγλωττίστηκε το fakelos.swift (θέλει Xcode command line tools): ' + String(e.stderr || e.message).slice(0, 300)); }
  }
  return bin;
}
function run(pdf, args){
  return cp.execFileSync(reader(), [args[0], pdf].concat(args.slice(1).map(String)), { encoding: 'utf8', maxBuffer: 64 << 20 });
}
function checkPdf(pdf, want){
  if (!fs.existsSync(pdf)) die('δεν υπάρχει το PDF του Φακέλου: ' + pdf + '\n  (κατεβάζεται από ebooks.edu.gr — «Αρχαία Ελληνικά Γ΄ Λυκείου, Φάκελος Υλικού»)');
  var sha = crypto.createHash('sha256').update(fs.readFileSync(pdf)).digest('hex');
  if (sha !== (want || PDF_SHA)) die('το PDF δεν είναι αυτό που καρφώθηκε (sha ' + sha.slice(0, 12) + '…)');
}
function squash(s){ return String(s).normalize('NFC').replace(/[\s­]+/g, ''); }

/* Ολόκληρη σελίδα: χωρίς τις κενές γραμμές στο τέλος και χωρίς τον αριθμό της. */
function pageBlock(pdf, i){
  var lines = run(pdf, ['page', i]).split('\n');
  while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
  if (!/^\d+$/.test((lines[lines.length - 1] || '').trim())) die('η σελίδα ' + i + ' δεν τελειώνει σε αριθμό σελίδας — έλεγξε τη με `lines ' + i + '`');
  lines.pop();
  while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
  return lines.join('\n');
}
function rectBlock(pdf, part, label){
  var r = part.rect;
  if (!Array.isArray(r) || r.length !== 4) die(label + ': το rect πρέπει να είναι [x, y, w, h]');
  var t = run(pdf, ['rect', part.page].concat(r)).replace(/\n+$/, '');
  if (!t.trim()) die(label + ': το rect στη σελίδα ' + part.page + ' είναι ΑΔΕΙΟ');
  var whole = squash(run(pdf, ['page', part.page]));
  if (whole.indexOf(squash(t)) < 0)
    die(label + ': το rect στη σελίδα ' + part.page + ' ΔΕΝ ταιριάζει με ολόκληρη τη σελίδα — πιθανότατα τρώει γράμματα στην άκρη. Μέτρα ξανά με `lines ' + part.page + '` (maxX των γραμμών) και φάρδυνε το rect.');
  return t;
}

function compose(spec){
  var fk = spec.fakelos;
  if (!fk || !Array.isArray(fk.blocks) || !fk.blocks.length) die('το ' + spec.id + '.json δεν έχει fakelos.blocks');
  var pdf = expand(fk.pdf) || PDF_DEFAULT;
  checkPdf(pdf, fk.pdfSha);
  var names = {}, body = '', pages = [];
  fk.blocks.forEach(function(b){
    if (!/^(intro|second|grypari|scholia|p\d+)$/.test(b.name || '')) die('άγνωστο όνομα μπλοκ «' + b.name + '» (intro · second · scholia · pNN)');
    if (names[b.name]) die('διπλό μπλοκ ' + b.name); names[b.name] = 1;
    var t;
    if (b.page != null){ t = pageBlock(pdf, b.page); pages.push(b.page); }
    else if (Array.isArray(b.parts) && b.parts.length){
      t = b.parts.map(function(p, i){ pages.push(p.page); return rectBlock(pdf, p, b.name + '[' + i + ']'); }).join('\n');
    } else die('το μπλοκ ' + b.name + ' δεν έχει ούτε page ούτε parts');
    if (/^@@/m.test(t)) die('το κείμενο του μπλοκ ' + b.name + ' έχει γραμμή που αρχίζει με @@');
    body += '@@' + b.name + '\n' + t + '\n';
  });
  ['intro', 'scholia'].forEach(function(n){ if (!names[n]) die('λείπει το μπλοκ ' + n); });
  if (!names.second && !names.grypari) die('λείπει το μπλοκ second (η 2η μετάφραση)');
  if (!Object.keys(names).some(function(n){ return /^p\d+$/.test(n); })) die('λείπει σελίδα δραστηριοτήτων (pNN)');
  return { body: body, sha: crypto.createHash('sha256').update(body, 'utf8').digest('hex'),
    lo: Math.min.apply(null, pages), hi: Math.max.apply(null, pages) };
}

function header(spec, c){
  var fk = spec.fakelos;
  return [
    '# ══════════════════════════════════════════════════════════════════════',
    '# Η ΠΗΓΗ ΤΟΥ «ΟΡΓΑΝΟΥ» ΤΗΣ ' + spec.id.toUpperCase() + ' — Ο ΦΑΚΕΛΟΣ ΥΛΙΚΟΥ, ΔΙΔΑΚΤΙΚΗ ΕΝΟΤΗΤΑ ' + (fk.unit || '?') + '.',
    '#',
    '# ⛔ ΜΗΝ ΤΟ ΑΚΟΥΜΠΗΣΕΙΣ ΜΕ ΤΟ ΧΕΡΙ. Ωμό κείμενο από το PDFKit (tools/gnosto/source.js),',
    '# PDF sha256 ' + (fk.pdfSha || PDF_SHA).slice(0, 8) + '…, σελ. ' + c.lo + '–' + c.hi + ' (pageAtIndex).',
    '# Το sha256 του σώματος (χωρίς τις γραμμές «#») είναι το `sourceSha` του ' + spec.id + '.json.',
    '#'
  ].concat(fk.blocks.map(function(b){
    return '#   @@' + b.name + (b.page != null ? '  ολόκληρη η σελίδα ' + b.page
      : '  ' + b.parts.map(function(p){ return 'idx ' + p.page + ' rect(' + p.rect.join(',') + ')'; }).join(' + '));
  })).concat([
    '# Κάθε rect διασταυρώθηκε με το page.string της σελίδας του: ταυτίζεται.',
    '# ══════════════════════════════════════════════════════════════════════', ''
  ]).join('\n');
}

module.exports = { compose: compose, run: run, checkPdf: checkPdf, rectBlock: rectBlock, squash: squash, PDF_DEFAULT: PDF_DEFAULT, PDF_SHA: PDF_SHA, pageBlock: pageBlock };

if (require.main === module){
  var a = process.argv.slice(2);
  if (a[0] === 'find' || a[0] === 'lines' || a[0] === 'page'){
    checkPdf(PDF_DEFAULT);
    process.stdout.write(run(PDF_DEFAULT, [a[0], a[1]]));
    process.exit(0);
  }
  var id = a[0];
  if (!/^gk\d+$/.test(id || '')) { console.error('χρήση: node tools/gnosto/source.js gkN [--check] | find N | lines I | page I'); process.exit(2); }
  var specFile = path.join(__dirname, id + '.json');
  if (!fs.existsSync(specFile)) die('δεν υπάρχει το ' + id + '.json — πρώτα `node tools/gnosto/scaffold.js ' + id + '`');
  var spec = JSON.parse(fs.readFileSync(specFile, 'utf8'));
  var c = compose(spec);
  var out = path.join(L.ROOT, spec.source || ('tests/arxaia-' + id + '-fakelos.source.txt'));
  var cur = fs.existsSync(out) ? L.readSource(out) : null;
  if (a.indexOf('--check') >= 0){
    if (!cur) die(path.basename(out) + ' δεν υπάρχει');
    if (cur.sha !== c.sha) die('η πηγή ' + path.basename(out) + ' ΔΕΝ είναι αυτό που βγάζει τώρα το PDF (' + cur.sha.slice(0, 12) + ' ≠ ' + c.sha.slice(0, 12) + ')');
    console.log('✓ ' + path.basename(out) + ' = ό,τι βγάζει το PDF (sha ' + c.sha.slice(0, 12) + '…)');
    process.exit(0);
  }
  if (cur && cur.sha !== c.sha && a.indexOf('--force') < 0)
    die(path.basename(out) + ' υπάρχει ήδη με ΑΛΛΟ περιεχόμενο. Αν άλλαξες σκόπιμα rect/σελίδες: --force (και ξανάτρεξε validate).');
  if (!cur || cur.sha !== c.sha) fs.writeFileSync(out, header(spec, c) + c.body);
  if (spec.sourceSha !== c.sha){
    spec.sourceSha = c.sha;
    fs.writeFileSync(specFile, require('./fmt.js').fmt(spec));
  }
  console.log('✓ ' + path.basename(out) + ' · sha ' + c.sha.slice(0, 12) + '… · σελ. ' + c.lo + '–' + c.hi + ' · ' + spec.fakelos.blocks.length + ' μπλοκ');
}
