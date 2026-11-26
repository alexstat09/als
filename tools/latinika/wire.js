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
const title = p.h1.replace(/\s*<br>\s*/g, ' ');

/* ── 1 · latinika.html ── (als-v773: η γλώσσα του βοηθήματος Ιστορίας — ένα
   <details> ανά κείμενο. Το καλούπι ζει ΕΔΩ· ποτέ μία σειρά με το χέρι.
   Η «αρχή του κειμένου» = η 1η ενότητα ΑΥΤΟΛΕΞΕΙ από το JSON· οι σκηνές = οι
   τίτλοι των S· η Γραμματική = ο τίτλος (h2) του μαθήματος του πακέτου.) */
let hub = rd('latinika.html'); const hub0 = hub;
const LA = p.S[0].s[0].la.map(w => w.w).join(' ');
const LES = (Object.values(p.lesson || {}).find(x => x && x.h2) || {}).h2 || 'Η γραμματική του κειμένου';
const NOTES = (p.notes || []).length;
const SCN = p.S.map((sc, i) => '<li><i>' + L.roman(i + 1) + '</i><span>' + sc.title + '</span></li>').join('');
const row =
  '    <details class="lt-row" data-lec="' + nn + '" data-n="' + U + '" data-sc="' + SC + '" data-tr="' + T + '" data-href="' + file + '">\n' +
  '      <summary>\n' +
  '        <span class="rn">' + R + '</span>\n' +
  '        <span class="tt"><span class="t">' + title + '</span><span class="src"><span class="lo">Lectio ' + p.ordinal + '</span> · <span class="pct">—</span><em class="nxt"></em></span></span>\n' +
  '        <span class="mb"><span class="dash lt-rdash"></span><span class="cnt">— / ' + U + '</span></span>\n' +
  '        <span class="chev" aria-hidden="true"></span>\n' +
  '      </summary>\n' +
  '      <div class="lt-body">\n' +
  '        <div class="lt-bt">\n' +
  '          <p class="d">' + p.row.d + '</p>\n' +
  '          <span class="lt-sts"><span class="lt-st"><b>' + U + '</b><i>ενότητες</i></span><span class="lt-st"><b>' + SC + '</b><i>σκηνές</i></span><span class="lt-st"><b>' + T + '</b><i>παγίδες</i></span></span>\n' +
  '        </div>\n' +
  '        <a class="lt-open" href="' + file + '"><span class="lt-k">Η αρχή του κειμένου</span><span class="la">' + LA + '</span><span class="go">Άνοιξε το κείμενο <i>→</i></span></a>\n' +
  '        <div class="lt-tools">\n' +
  '          <a class="tc" href="' + file + '#keimeno"><span class="g lat">I–' + L.roman(SC) + '</span><b>Κείμενο</b><small>' + U + ' ενότητες σε ' + SC + ' σκηνές</small></a>\n' +
  '          <a class="tc" href="' + file + '#grammatiki"><span class="g">§</span><b>Γραμματική</b><small>' + LES + '</small></a>\n' +
  '          <a class="tc" href="' + file + '#simeioseis"><span class="g">' + (T + NOTES) + '</span><b>Σημειώσεις</b><small>' + T + ' παγίδες · ' + NOTES + ' σημειώσεις</small></a>\n' +
  '          <a class="tc" href="' + file + '#kartes"><span class="g">?</span><b>Κάρτες</b><small>Επανάληψη ώσπου να μη μείνει καμία</small></a>\n' +
  '        </div>\n' +
  '        <div class="lt-scn"><span class="lt-k">Οι σκηνές</span><ol class="scn">' + SCN + '</ol></div>\n' +
  '      </div>\n' +
  '    </details>\n';
const open = '    <details class="lt-row" data-lec="' + nn + '"';
const at = hub.indexOf(open);
if (at >= 0) {
  const end = hub.indexOf('    </details>\n', at) + '    </details>\n'.length;
  hub = hub.slice(0, at) + row + hub.slice(end);
} else {
  /* μετά από τη σειρά με το μεγαλύτερο data-lec < nn· αλλιώς στη θέση του Β΄ τεύχους */
  const rows = [...hub.matchAll(/    <details class="lt-row" data-lec="(\d+)"[\s\S]*?    <\/details>\n/g)];
  must(rows.length, 'δεν βρέθηκε καμία σειρά στη latinika.html');
  const prev = rows.filter(m => +m[1] < nn).pop();
  const mark = hub.indexOf('<!--LT-ROWS-B-->');
  let ins;
  if (prev && +prev[1] <= 20 && nn > 20) { must(mark >= 0, 'δεν βρέθηκε το <!--LT-ROWS-B-->'); ins = mark; }
  else ins = prev ? prev.index + prev[0].length : rows[0].index;
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
const all = [...hub.matchAll(/<details class="lt-row" data-lec="\d+" data-n="(\d+)"/g)];
const N = all.length, TOTAL = all.reduce((a, m) => a + +m[1], 0), W = L.ordF(N);
const rep = (re, by, what) => { must(re.test(hub), 'δεν βρέθηκε ' + what); hub = hub.replace(re, () => by); };
rep(/<span class="lt-tot" id="ltHead">[^<]* ενότητες · <b>\d+<\/b> προτάσεις<\/span>/, '<span class="lt-tot" id="ltHead">' + W + ' ενότητες · <b>' + TOTAL + '</b> προτάσεις</span>', 'τον τίτλο ltHead');
rep(/<span id="stKnownOf">\/\d+<\/span>/, '<span id="stKnownOf">/' + TOTAL + '</span>', 'το stKnownOf');
rep(/<span id="stDoneOf">\/\d+<\/span>/, '<span id="stDoneOf">/' + N + '</span>', 'το stDoneOf');
rep(/'Και οι [^']+ ενότητες κλειδωμένες\.'/, "'Και οι " + W.toLowerCase() + " ενότητες κλειδωμένες.'", 'το «Και οι … κλειδωμένες»');
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
/* XXXI: η κάρτα «Σύνταξε μόνος σου» της βιβλιοθήκης μετράει τα TEXTS (το test το ελέγχει) */
{ let h = rd('latinika.html'); const h0 = h;
  must(/<span class="g" id="synN">\d+<\/span>/.test(h), 'δεν βρέθηκε το synN στη latinika.html');
  h = h.replace(/<span class="g" id="synN">\d+<\/span>/, '<span class="g" id="synN">' + nTexts + '</span>');
  wr('latinika.html', h0, h); }

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
  /* XXXI: ΕΝΑ bump ανά commit — δεύτερο τρέξιμο του wire δεν ξαναπηδάει (έβγαζε v787 αντί v786) */
  let head = null; try { head = /var CACHE = "als-v(\d+)";/.exec(require('child_process').execSync('git show HEAD:sw.js', { cwd: L.REPO, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })); } catch (e) {}
  if (head && +v[1] > +head[1]) console.log('  sw.js: ήδη als-v' + v[1] + ' (HEAD als-v' + head[1] + ') — κανένα δεύτερο bump');
  else {
  sw = sw.replace(v[0], () => 'var CACHE = "als-v' + (+v[1] + 1) + '";');
  console.log('  sw.js: als-v' + v[1] + ' → als-v' + (+v[1] + 1));
  }
}
wr('sw.js', sw0, sw);

console.log('✓ ' + R + ' καλωδιωμένο · βιβλιοθήκη: ' + N + ' ενότητες, ' + TOTAL + ' προτάσεις · syntaxi: ' + nTexts + ' κείμενα');
console.log('  άλλαξαν: ' + (changed.length ? changed.join(', ') : 'τίποτα'));
