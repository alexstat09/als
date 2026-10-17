/* ══════════════════════════════════════════════════════════════════════
   tools/latinika/wire.js NN [--no-bump] — καλωδιώνει ένα πακέτο παντού.

     latinika.html          η σειρά του (data-n/sc/tr ΥΠΟΛΟΓΙΣΜΕΝΑ από το JSON),
                            το SHAPE, ο τίτλος («Δέκα ενότητες. 122 προτάσεις»),
                            το «/122» της ταινίας, το «Και οι δέκα … κλειδωμένες»
     latinika-syntaxi.html  το TEXTS
     tests/latinika-syntaxi.test.js  το πλήθος των κειμένων
     sw.js                  CORE + bump του CACHE

   ⭐ Τα σύνολα ΔΕΝ γράφονται με το χέρι: βγαίνουν από τα data-n ΟΛΩΝ των
   σειρών της βιβλιοθήκης, αφού μπει η νέα (σταθ. 33). Ξανατρεγμένο σε
   πακέτο που είναι ήδη μέσα = καμία αλλαγή εκτός από το bump.
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');
const L = require('./lib');

const nn = +process.argv[2];
if (!nn) { console.error('χρήση: node tools/latinika/wire.js NN [--no-bump]'); process.exit(2); }
const p = L.load(nn), R = L.roman(nn);
const F = f => path.join(L.REPO, f);
const rd = f => fs.readFileSync(F(f), 'utf8');
const changed = [];
function wr(f, before, after) { if (before !== after) { fs.writeFileSync(F(f), after); changed.push(f); } }
function must(cond, msg) { if (!cond) { console.error('⛔ ' + msg); process.exit(1); } }

const file = 'latinika-lectio' + nn + '.html';
must(fs.existsSync(F(file)), 'δεν υπάρχει το ' + file + ' — τρέξε πρώτα build');
const U = L.units(p).length, SC = p.S.length, T = p.traps.length;
const title = p.h1.replace(/<br>/g, ' ');

/* ── 1 · latinika.html ── */
let hub = rd('latinika.html'); const hub0 = hub;
const row =
  '    <a class="lt-row" href="' + file + '" data-lec="' + nn + '" data-n="' + U + '" data-sc="' + SC + '" data-tr="' + T + '">\n' +
  '      <div class="rn">' + R + '</div>\n' +
  '      <div>\n' +
  '        <div class="src"><span class="lo">Lectio ' + p.ordinal + '</span> <em class="nxt"></em></div>\n' +
  '        <div class="t">' + title + '</div>\n' +
  '        <div class="d">' + p.row.d + '</div>\n' +
  '      </div>\n' +
  '      <div class="lt-mt">\n' +
  '        <div class="lt-sts">\n' +
  '          <span class="lt-st"><b>' + U + '</b><i>ενότητες</i></span>\n' +
  '          <span class="lt-st"><b>' + SC + '</b><i>σκηνές</i></span>\n' +
  '          <span class="lt-st"><b>' + T + '</b><i>παγίδες</i></span>\n' +
  '        </div>\n' +
  '        <div class="dash lt-rdash"></div>\n' +
  '        <div class="lt-prf"><span class="pct">—</span><span class="cnt">— / ' + U + '</span></div>\n' +
  '      </div>\n' +
  '      <span class="lt-go" aria-hidden="true">↗</span>\n' +
  '    </a>\n';
const open = '    <a class="lt-row" href="' + file + '"';
const at = hub.indexOf(open);
if (at >= 0) {
  const end = hub.indexOf('    </a>\n', at) + '    </a>\n'.length;
  hub = hub.slice(0, at) + row + hub.slice(end);
} else {
  /* μετά από τη σειρά με το μεγαλύτερο data-lec < nn */
  const rows = [...hub.matchAll(/    <a class="lt-row" href="latinika-lectio(\d+)\.html"[\s\S]*?    <\/a>\n/g)];
  must(rows.length, 'δεν βρέθηκε καμία σειρά στη latinika.html');
  const prev = rows.filter(m => +m[1] < nn).pop();
  const ins = prev ? prev.index + prev[0].length : rows[0].index;
  hub = hub.slice(0, ins) + (prev ? '\n' : '') + row + (prev ? '' : '\n') + hub.slice(ins);
}
/* SHAPE */
const keyLine = "    '" + nn + "': { key:'lectio" + nn + "_known_v1', kind:'map'  }";
if (hub.indexOf("'" + nn + "': { key:'lectio" + nn + "_known_v1'") < 0) {
  const sh = /  var SHAPE = \{\n([\s\S]*?)\n  \};/.exec(hub);
  must(sh, 'δεν βρέθηκε το SHAPE');
  const lines = sh[1].split('\n').map(l => l.replace(/,$/, ''));
  lines.push(keyLine);
  lines.sort((a, b) => +/'(\d+)'/.exec(a)[1] - +/'(\d+)'/.exec(b)[1]);
  hub = hub.replace(sh[0], () => '  var SHAPE = {\n' + lines.join(',\n') + '\n  };');
}
/* σύνολα, από ΟΛΕΣ τις σειρές */
const all = [...hub.matchAll(/<a class="lt-row" href="latinika-lectio(\d+)\.html" data-lec="\d+" data-n="(\d+)"/g)];
const N = all.length, TOTAL = all.reduce((a, m) => a + +m[2], 0), W = L.ordF(N);
const rep = (re, by, what) => { must(re.test(hub), 'δεν βρέθηκε ' + what); hub = hub.replace(re, () => by); };
rep(/<h1 class="lt-h" id="ltHead">[^<]*<br>ενότητες\.<br><b>\d+<\/b> προτάσεις\.<\/h1>/, '<h1 class="lt-h" id="ltHead">' + W + '<br>ενότητες.<br><b>' + TOTAL + '</b> προτάσεις.</h1>', 'τον τίτλο ltHead');
rep(/<span id="stKnownOf">\/\d+<\/span>/, '<span id="stKnownOf">/' + TOTAL + '</span>', 'το stKnownOf');
rep(/'Και οι [^']+ ενότητες κλειδωμένες\.'/, "'Και οι " + W.toLowerCase() + " ενότητες κλειδωμένες.'", 'το «Και οι … κλειδωμένες»');
hub = hub.replace(/στριμώξει \d+ γραμμές σε 400px:\n       [^ ]+ πλήρεις σειρές/, () => 'στριμώξει ' + TOTAL + ' γραμμές σε 400px:\n       ' + W.toLowerCase() + ' πλήρεις σειρές');
wr('latinika.html', hub0, hub);

/* ── 2 · latinika-syntaxi.html ── */
let syn = rd('latinika-syntaxi.html'); const syn0 = syn;
if (syn.indexOf("file:'" + file + "'") < 0) {
  const m = /var TEXTS = \[\n([\s\S]*?)\n\];/.exec(syn);
  must(m, 'δεν βρέθηκε το TEXTS');
  const lines = m[1].split('\n').map(l => l.replace(/,$/, ''));
  const num = ("num:'" + R + "',").padEnd(12);
  lines.push("  { id:'" + nn + "', " + num + " file:'" + file + "' }");
  lines.sort((a, b) => +/id:'(\d+)'/.exec(a)[1] - +/id:'(\d+)'/.exec(b)[1]);
  syn = syn.replace(m[0], () => 'var TEXTS = [\n' + lines.join(',\n') + '\n];');
}
wr('latinika-syntaxi.html', syn0, syn);
const nTexts = (/var TEXTS = \[\n([\s\S]*?)\n\];/.exec(syn)[1].match(/file:'/g) || []).length;
let st = rd('tests/latinika-syntaxi.test.js'); const st0 = st;
st = st.replace(/ok\(ids\.length === \d+, '[^']+ κείμενα \(' \+ ids\.length \+ '\)'\);/,
  () => "ok(ids.length === " + nTexts + ", '" + L.numWord(nTexts, true) + " κείμενα (' + ids.length + ')');");
must(/ok\(ids\.length === \d+, /.test(st), 'δεν βρέθηκε το πλήθος στο tests/latinika-syntaxi.test.js');
wr('tests/latinika-syntaxi.test.js', st0, st);

/* ── 3 · sw.js ── */
let sw = rd('sw.js'); const sw0 = sw;
if (sw.indexOf("'" + file + "'") < 0) {
  const prev = [...sw.matchAll(/'latinika-lectio(\d+)\.html', /g)].filter(m => +m[1] < nn).pop();
  must(prev, 'δεν βρέθηκε θέση για το ' + file + ' στο CORE');
  sw = sw.slice(0, prev.index + prev[0].length) + "'" + file + "', " + sw.slice(prev.index + prev[0].length);
}
if (!process.argv.includes('--no-bump')) {
  const v = /var CACHE = "als-v(\d+)";/.exec(sw);
  must(v, 'δεν βρέθηκε το CACHE στο sw.js');
  sw = sw.replace(v[0], () => 'var CACHE = "als-v' + (+v[1] + 1) + '";');
  console.log('  sw.js: als-v' + v[1] + ' → als-v' + (+v[1] + 1));
}
wr('sw.js', sw0, sw);

console.log('✓ ' + R + ' καλωδιωμένο · βιβλιοθήκη: ' + N + ' ενότητες, ' + TOTAL + ' προτάσεις · syntaxi: ' + nTexts + ' κείμενα');
console.log('  άλλαξαν: ' + (changed.length ? changed.join(', ') : 'τίποτα'));
