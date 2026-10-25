/* ══════════════════════════════════════════════════════════════════════
   ΑΡΧΑΙΑ · ΓΝΩΣΤΟ — ΤΟ ΜΗΧΑΝΙΚΟ ΤΕΛΟΣ ΜΙΑΣ ΕΝΟΤΗΤΑΣ, ΜΕ ΜΙΑ ΕΝΤΟΛΗ.
     node tools/gnosto/finish.js gkN

   Ό,τι δεν θέλει κρίση, με τη σειρά, και σταματάει στο ΠΡΩΤΟ σφάλμα:
     (κείμενο, αν υπάρχει gkN.text.json και ⟪gkN⟫/καμία ενότητα) keimeno check → keimeno wire
     fmt → validate (περιλαμβάνει την ΑΠΛΗ, κανόνες 9/9β — ΥΠΟΧΡΕΩΤΙΚΗ) → build → wire
     tests: arxaia-gnosto · arxaia-gnosto-organo (όλες οι ενότητες, με φωτογραφίες) ·
            arxaia-gnosto-page · launcher · smoke
   Τυπώνει ΜΟΝΟ: ένα ✓/✗ ανά βήμα, τις γραμμές ✗ (ως 40), τις 4 φωτογραφίες που
   πρέπει να ΔΕΙΣ, το CACHE και τα αρχεία για το commit. Το πλήρες output κάθε
   βήματος μένει στο $TMPDIR/gnosto-gkN/finish-*.log (το ανοίγεις ΜΟΝΟ αν κάτι σκάσει).
   Δεν κάνει commit/push — αυτά είναι δικά σου, αφού δεις τις φωτογραφίες.
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
var fs = require('fs'), path = require('path'), cp = require('child_process'), os = require('os');
var L = require('./lib.js');
var ROOT = L.ROOT;

var id = process.argv[2];
if (!/^gk\d+$/.test(id || '')) { console.error('χρήση: node tools/gnosto/finish.js gkN'); process.exit(2); }
var TMP = path.join(process.env.TMPDIR || os.tmpdir(), 'gnosto-' + id);
var SHOTS = path.join(TMP, 'shots');
fs.mkdirSync(SHOTS, { recursive: true });

var failed = false, nStep = 0;
/* τρέχει, κρατάει το log, και κρίνει: exit code ΚΑΙ (όπου υπάρχει) η γραμμή «N/0» ή «N πέρασαν, 0 απέτυχαν» */
function step(name, cmd, args, env, judge){
  var r = cp.spawnSync(cmd, args, { cwd: ROOT, encoding: 'utf8', env: Object.assign({}, process.env, env || {}), maxBuffer: 64 * 1024 * 1024 });
  var out = (r.stdout || '') + (r.stderr || '');
  /* αριθμός βήματος στο όνομα: τα ελληνικά ονόματα «καθαρισμένα» με \w γίνονταν όλα «test_» */
  var log = path.join(TMP, 'finish-' + String(++nStep).padStart(2, '0') + '.log');
  fs.writeFileSync(log, out);
  var ok = r.status === 0 && (!judge || judge(out));
  var last = out.trim().split('\n').filter(Boolean).slice(-1)[0] || '';
  console.log((ok ? '✓ ' : '✗ ') + name + (last ? ' — ' + last.trim().slice(0, 140) : ''));
  if (!ok){
    var bad = out.split('\n').filter(function(l){ return /^\s*✗/.test(l); }).slice(0, 40);
    if (bad.length) console.log(bad.join('\n'));
    else console.log(out.trim().split('\n').slice(-15).join('\n'));
    console.log('  (όλο το output: ' + log + ')');
    failed = true;
  }
  return ok;
}
function stop(){ console.log('\n✗ ΣΤΑΜΑΤΗΣΕ — διόρθωσε το JSON (ποτέ τον κανόνα) και ξανάτρεξε: node tools/gnosto/finish.js ' + id); process.exit(1); }
var node = process.execPath;
/* ⚠️ ΟΧΙ `\b` γύρω από ελληνικά: το \b της JS ξέρει μόνο [A-Za-z0-9_], οπότε «0 απέτυχαν\b» δεν ταιριάζει ΠΟΤΕ */
var zeroFail = function(o){ return /(^|\n)\s*\d+\s*\/\s*0\s*$/.test(o.trim()) || /(^|\s)0 απέτυχαν(\s|$)/.test(o) || /(^|\s)0 failed(\s|$)/.test(o); };

/* ── 1 · το ΚΕΙΜΕΝΟ (μόνο για ενότητα που φτιάχνει το keimeno.js) ── */
var textJson = path.join(__dirname, id + '.text.json');
var data = fs.readFileSync(path.join(ROOT, 'arxaia-gnosto-data.js'), 'utf8');
var mine = data.indexOf('⟪' + id + '⟫') >= 0 || !L.loadUnit(id);
if (fs.existsSync(textJson) && mine){
  if (!step('κείμενο · check', node, ['tools/gnosto/keimeno.js', 'check', id])) stop();
  if (!step('κείμενο · wire', node, ['tools/gnosto/keimeno.js', 'wire', id])) stop();
} else if (!L.loadUnit(id)) {
  console.log('✗ η ενότητα ' + id + ' δεν υπάρχει ούτε ως κείμενο — πρώτα το skill arxaia-gnosto-enotita'); process.exit(1);
}

/* ── 2 · το ΟΡΓΑΝΟ ── */
var specFile = path.join(__dirname, id + '.json');
if (!fs.existsSync(specFile)){ console.log('· το κείμενο είναι έτοιμο — τώρα το όργανο (skill arxaia-gnosto-organo, βήμα 1)'); process.exit(failed ? 1 : 0); }
if (!L.loadSpec(id).aplh){ console.log('✗ λείπει η ΑΠΛΗ ΜΕΤΑΦΡΑΣΗ (υποχρεωτική): node tools/gnosto/aplh.js ' + id + ' --init, μετά §4β'); process.exit(1); }
if (!step('fmt', node, ['tools/gnosto/fmt.js', id])) stop();
if (!step('validate (+ απλή)', node, ['tools/gnosto/validate.js', id])) stop();
if (!step('build', node, ['tools/gnosto/build.js', id])) stop();
if (!step('wire', node, ['tools/gnosto/wire.js', id])) stop();

/* ── 3 · tests (όλα, ακόμη κι αν σκάσει ένα — για να τα δεις μαζί) ── */
step('test · arxaia-gnosto', node, ['tests/arxaia-gnosto.test.js'], null, zeroFail);
step('test · όργανο (όλες, Chrome)', node, ['tests/arxaia-gnosto-organo.test.js'], { GK_SHOTS: SHOTS }, zeroFail);
step('test · σελίδα Γνωστού', node, ['tests/arxaia-gnosto-page.test.js'], null, zeroFail);
step('test · launcher', node, ['tests/launcher.test.js'], null, zeroFail);
step('smoke', 'bash', ['smoke-test.sh'], null, function(o){ return /SMOKE_OK/.test(o); });

/* ── 4 · τι μένει σε σένα ── */
var sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
var cache = (/var CACHE = "(als-v\d+)";/.exec(sw) || [])[1];
var st = cp.spawnSync('git', ['status', '--porcelain'], { cwd: ROOT, encoding: 'utf8' }).stdout.split('\n')
  .map(function(l){ return l.slice(3); })
  .filter(function(f){ return f && (f.indexOf(id) >= 0 || /^(arxaia\.html|arxaia-gnosto-data\.js|sw\.js|tests\/launcher\.test\.js)$/.test(f)); });
console.log('\n' + (failed ? '✗ ΚΑΤΙ ΣΚΑΣΕ — δες τα ✗ πάνω.' : '✓ ΟΛΑ ΠΡΑΣΙΝΑ.') + ' CACHE ' + cache);
console.log('Δες (Read) αυτές τις 4:');
['-01-read', '-06-aplh-pair', '-06-aplh-whole', '-10-phone-aplh'].forEach(function(s){
  var f = path.join(SHOTS, id + s + '.png');
  console.log('  ' + f + (fs.existsSync(f) ? '' : '   ⚠ ΔΕΝ βγήκε'));
});
console.log('Για το commit (+ MAP.md, CLAUDE.md): ' + (st.join(' ') || '(τίποτα;)'));
process.exit(failed ? 1 : 0);
