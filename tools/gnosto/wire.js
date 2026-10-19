/* ══════════════════════════════════════════════════════════════════════
   ΚΑΛΩΔΙΩΣΗ ΤΟΥ «ΟΡΓΑΝΟΥ» — `node tools/gnosto/wire.js gkN`
   Ίδια εντολή όσες φορές θες: γράφει ΜΟΝΟ ό,τι λείπει.
     1. arxaia.html  → η γραμμή της ενότητας στη λίστα του Γνωστού γίνεται
        σύνδεσμος ΚΑΤΕΥΘΕΙΑΝ στο όργανο (`INSTRUMENT`, als-v645 — το παλιό
        μάθημα δεν ανοίγει πια), ξαναχτισμένο από τα gk*.json που έχουν σελίδα — με τη σειρά.
     2. sw.js        → η σελίδα στο CORE (αλλιώς χάνεται offline) + bump του
        CACHE ΜΙΑ φορά ανά commit (συγκρίνει με το HEAD).
     3. tests/launcher.test.js → η σελίδα στα CHILDREN (ο γονιός της).
   ⛔ Το NO_VT του topbar.js έχει ήδη `gk\d+` — καμία αλλαγή εκεί.
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
var fs = require('fs'), path = require('path'), cp = require('child_process');
var L = require('./lib.js');
var ROOT = L.ROOT;

function die(m){ console.error('✗ ' + m); process.exit(1); }
var id = process.argv[2];
if (!/^gk\d+$/.test(id || '')) die('χρήση: node tools/gnosto/wire.js gkN');
var page = 'arxaia-' + id + '.html';
if (!fs.existsSync(path.join(ROOT, page))) die(page + ' δεν υπάρχει — πρώτα `node tools/gnosto/build.js ' + id + '`');
var said = [];

/* 1 · arxaia.html */
(function(){
  var f = path.join(ROOT, 'arxaia.html'), s = fs.readFileSync(f, 'utf8');
  var a = s.indexOf('  var INSTRUMENT = {'), b = s.indexOf('\n  };', a);
  if (a < 0 || b < 0) die('δεν βρέθηκε το `var INSTRUMENT = {` στο arxaia.html');
  var ids = fs.readdirSync(__dirname).map(function(x){ return (/^(gk\d+)\.json$/.exec(x) || [])[1]; })
    .filter(function(x){ return x && fs.existsSync(path.join(ROOT, 'arxaia-' + x + '.html')); })
    .sort(function(x, y){ return +x.slice(2) - +y.slice(2); });
  var body = ids.map(function(x){
    return "    " + x + ": 'href=\"arxaia-" + x + ".html\"'";
  }).join(',\n');
  var next = s.slice(0, a) + '  var INSTRUMENT = {\n' + body + s.slice(b);
  if (next !== s){ fs.writeFileSync(f, next); said.push('arxaia.html: πόρτα για ' + ids.join(', ')); }
})();

/* 2 · sw.js */
(function(){
  var f = path.join(ROOT, 'sw.js'), s = fs.readFileSync(f, 'utf8');
  if (s.indexOf("'" + page + "'") < 0){
    var anchors = s.match(/'arxaia-gk\d+\.html', /g) || [];
    var at = anchors.length ? anchors[anchors.length - 1] : "'arxaia-protagoras-eisagogi.html', ";
    if (s.indexOf(at) < 0) die('δεν βρήκα πού να μπει στο CORE του sw.js');
    s = s.replace(at, at + "'" + page + "', ");
    said.push('sw.js: ' + page + ' στο CORE');
  }
  var b = L.bumpCache(s); s = b.s; if (b.msg) said.push(b.msg);
  fs.writeFileSync(f, s);
})();

/* 3 · tests/launcher.test.js */
(function(){
  var f = path.join(ROOT, 'tests', 'launcher.test.js'), s = fs.readFileSync(f, 'utf8');
  if (s.indexOf("'" + page + "': 'arxaia.html'") >= 0) return;
  var at = "  'arxaia-sokratis.html': 'arxaia.html', 'arxaia-platon.html': 'arxaia.html',\n";
  if (s.indexOf(at) < 0) die('δεν βρέθηκε το CHILDREN στο tests/launcher.test.js');
  var lines = s.match(/  'arxaia-gk\d+\.html': 'arxaia\.html',\n/g) || [];
  var after = lines.length ? lines[lines.length - 1] : at;
  fs.writeFileSync(f, s.replace(after, after + "  '" + page + "': 'arxaia.html',\n"));
  said.push('launcher.test.js: ' + page + ' → arxaia.html');
})();

console.log(said.length ? '✓ ' + said.join(' · ') : '✓ ήδη καλωδιωμένο — καμία αλλαγή');
