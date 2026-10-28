/* tools/eisagogi/arxaia/wire.js — ΚΑΛΩΔΙΩΝΕΙ ένα κεφάλαιο στην εφαρμογή. Ιδεμπότητο: δεύτερο τρέξιμο = καμία αλλαγή.
     node tools/eisagogi/arxaia/wire.js <id>
   1 · arxaia.html: η γραμμή του κεφαλαίου στο #gnWrap, ΜΕΣΑ ΣΤΗΝ ΚΑΡΤΑ ΤΟΥ ΦΙΛΟΣΟΦΟΥ ΤΗΣ, στη ΣΕΙΡΑ
       ΤΟΥ ΒΙΒΛΙΟΥ (BOOK), και ξαναμέτρημα «N κεφάλαια» + το πλήθος κάθε φιλοσόφου. als-v681: η
       πλάκα έγινε ΓΡΑΜΜΗ (τίτλος + δύο νούμερα) — έφυγαν σχεδιάγραμμα, περιγραφή, «Πακέτο N» και οι
       οθόνες· το `plate.d` του json δεν διαβάζεται πια. Τίτλος και μετρητές ξαναγράφονται πάντα από το
       json· οι χειροποίητες γραμμές (Πρωταγόρας, Αριστοτέλης) μένουν όπως είναι.
   2 · tests/arxaia-gnosto.test.js: η γραμμή του PACKS → { mine, ground: arxaia-eisagogi.test.js, stores }
   3 · sw.js: η σελίδα (+ η προτομή) στο CORE, και CACHE = HEAD+1 (ποτέ πίσω, ποτέ +2)
   4 · topbar.js: η σελίδα στο NO_VT, αν δεν πιάνεται ήδη (δεν φοράει aurora/kentro-exit — page-transition.test)
   5 · MAP.md: μία γραμμή κάτω από «ΚΕΦΑΛΑΙΑ ΤΟΥ ΚΑΛΟΥΠΙΟΥ»
   archive(d): ένα ΠΑΛΙΟ πακέτο (όχι του καλουπιού) πάει στο archive/ ΠΡΙΝ το build γράψει από πάνω —
   ποτέ σβήσιμο (als-v615) — μαζί με τη δική του γείωση (test + source), αν είχε. Το καλεί το finish.js. */
'use strict';
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const L = require('./lib');

/* η σειρά του βιβλίου (Φιλοσοφικός Λόγος, εισαγωγή) ΚΑΙ ο φιλόσοφος κάθε κεφαλαίου — η κάρτα όπου μπαίνει.
   ⛔ Κεφάλαιο που λείπει από εδώ ΣΤΑΜΑΤΑΕΙ το wire (σταθ. 40: ποτέ σιωπηλή ομάδα «άλλα»). */
const BOOK = [
  ['arxaia-sokratis-ideas.html', 'Σωκράτης'], ['arxaia-sokratis.html', 'Σωκράτης'],
  ['arxaia-platon.html', 'Πλάτων'], ['arxaia-platon-erga.html', 'Πλάτων'], ['arxaia-protagoras-eisagogi.html', 'Πλάτων'],
  ['arxaia-politeia-eisagogi.html', 'Πλάτων'],
  ['arxaia-aristotelis.html', 'Αριστοτέλης'], ['arxaia-ithika-eisagogi.html', 'Αριστοτέλης'], ['arxaia-politika-eisagogi.html', 'Αριστοτέλης']];
const BOOK_AT = f => BOOK.findIndex(b => b[0] === f);
const START = '<div class="gn-phs">', END = '<!-- /gn-phs -->';
const R = f => path.join(L.REPO, f);
const read = f => fs.readFileSync(R(f), 'utf8');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const isTpl = f => fs.existsSync(R(f)) && read(f).indexOf('const KEY="eisarx-') >= 0;

function plateHTML(d) {
  const q = d.check.recall.length + d.check.tf.length + d.check.mc.length;
  return '      <a class="gn-pl" href="' + d.file + '">\n' +
    '        <span class="t">' + esc(L.plain(d.title)) + '</span>\n' +
    '        <span class="pl-n"><b><i>Σταθμοί</i><u>' + d.stations.length + '</u></b><b><i>Ερωτήσεις</i><u>' + q + '</u></b></span>\n' +
    '        <span class="pl-go" aria-hidden="true">↗</span>\n' +
    '      </a>\n';
}
const fileOf = x => (/href="([^"]+)"/.exec(x) || [])[1];
/* Οι γραμμές, ταξινομημένες στη σειρά του βιβλίου, μοιρασμένες στις κάρτες των φιλοσόφων. */
function blockHTML(pl) {
  const miss = pl.map(fileOf).filter(f => BOOK_AT(f) < 0);
  if (miss.length) throw new Error('το ' + miss.join(', ') + ' δεν είναι στο BOOK του wire.js — γράψ\' το εκεί με τον φιλόσοφό του');
  const rows = pl.slice().sort((x, y) => BOOK_AT(fileOf(x)) - BOOK_AT(fileOf(y)));
  const groups = [];
  rows.forEach(x => {
    const who = BOOK[BOOK_AT(fileOf(x))][1];
    let g = groups.find(g => g.who === who);
    if (!g) groups.push(g = { who, rows: [] });
    g.rows.push(x);
  });
  return START + '\n' + groups.map(g =>
    '    <section class="gn-ph">\n' +
    '      <div class="gn-who"><h3>' + esc(g.who) + '</h3><span>' + g.rows.length + '</span></div>\n' +
    g.rows.join('') +
    '    </section>\n').join('') + '    </div>' + END;
}

/* ── 1 · η γραμμή του κεφαλαίου ── */
function wirePlate(d) {
  let page = read('arxaia.html');
  const g0 = page.indexOf('id="gnWrap"'), s0 = page.indexOf(START, g0), s1 = page.indexOf(END, g0);
  if (g0 < 0 || s0 < 0 || s1 < s0 || page.indexOf(START, s0 + 1) >= 0) throw new Error('arxaia.html: δεν βρέθηκε ΕΝΑ μπλοκ «' + START + '» … «' + END + '» στο #gnWrap');
  const head = page.slice(0, s0), tail = page.slice(s1 + END.length);
  const pl = (page.slice(s0, s1).match(/<a class="gn-pl"[\s\S]*?<\/a>/g) || []).map(x => '      ' + x + '\n');
  const at = pl.findIndex(x => fileOf(x) === d.file);
  if (at >= 0) pl[at] = plateHTML(d); else pl.push(plateHTML(d));
  const block = blockHTML(pl);
  const N = (block.match(/<a class="gn-pl"/g) || []).length;
  const h2 = head.replace(/<span class="k">\d+ κεφάλαια · χωρίς βαθμό<\/span>/, '<span class="k">' + N + ' κεφάλαια · χωρίς βαθμό</span>');
  if (h2.indexOf('<span class="k">' + N + ' κεφάλαια · χωρίς βαθμό</span>') < 0) throw new Error('arxaia.html: δεν βρέθηκε η κεφαλίδα «N κεφάλαια · χωρίς βαθμό»');
  const next = h2 + block + tail;
  if (next !== page) fs.writeFileSync(R('arxaia.html'), next);
  return { n: N, changed: next !== page };
}

/* ── 2 · PACKS ── */
function wirePacks(d) {
  const F = 'tests/arxaia-gnosto.test.js';
  const src = read(F), lines = src.split('\n');
  const a = lines.findIndex(l => /^var PACKS = \[/.test(l)), b = lines.findIndex((l, i) => i > a && /^\];/.test(l));
  if (a < 0 || b < 0) throw new Error(F + ': δεν βρέθηκε το PACKS');
  const entry = "{ file: '" + d.file + "', mine: true, ground: 'arxaia-eisagogi.test.js', stores: '" + d.key + "' }";
  const ix = lines.findIndex((l, i) => i > a && i < b && l.indexOf("{ file: '" + d.file + "'") >= 0);
  let old = null;
  if (ix >= 0) {
    old = lines[ix];
    /* το Δ2 κρατάει το δικό του λεπτό test ως γείωση — δεν ξαναγράφεται */
    if (/mine: true/.test(old) && old.indexOf("stores: '" + d.key + "'") >= 0) return { changed: false };
    const comma = /\},\s*$/.test(old) ? ',' : '';
    lines[ix] = old.replace(/\{ file:.*\}/, entry).replace(/\}\s*,?\s*$/, '}' + comma);
  } else {
    const last = lines.slice(a, b).map((l, k) => [l, a + k]).filter(([l]) => /^\s*\{ file: '/.test(l)).pop();
    if (!/,\s*$/.test(lines[last[1]])) lines[last[1]] = lines[last[1]].replace(/\s*$/, ',');
    lines.splice(last[1] + 1, 0, '  ' + entry);
  }
  fs.writeFileSync(R(F), lines.join('\n'));
  return { changed: true, old };
}

/* ── 3 · sw.js ── */
function wireSW(d) {
  let sw = read('sw.js');
  const add = [d.file].concat(d.cover.seal && d.cover.seal.img ? [d.cover.seal.img] : []);
  let changed = false;
  add.forEach(f => {
    if (sw.indexOf("'" + f + "'") >= 0) return;
    if (!fs.existsSync(R(f))) throw new Error('το ' + f + ' δεν υπάρχει — δεν μπαίνει στο CORE αρχείο που λείπει');
    sw = sw.replace("'arxaia-sokratis-ideas.html', ", m => m + "'" + f + "', ");
    changed = true;
  });
  if (add.some(f => sw.indexOf("'" + f + "'") < 0)) throw new Error('sw.js: δεν βρέθηκε θέση στο CORE');
  const head = cp.spawnSync('git', ['show', 'HEAD:sw.js'], { cwd: L.REPO, encoding: 'utf8' }).stdout || '';
  const hv = +((/var CACHE = "als-v(\d+)";/.exec(head) || [])[1] || 0), cv = +((/var CACHE = "als-v(\d+)";/.exec(sw) || [])[1] || 0);
  if (!hv || !cv) throw new Error('sw.js: δεν διαβάστηκε το CACHE');
  if (cv <= hv) { sw = sw.replace('var CACHE = "als-v' + cv + '";', 'var CACHE = "als-v' + (hv + 1) + '";'); changed = true; }
  if (changed) fs.writeFileSync(R('sw.js'), sw);
  return { cache: 'als-v' + Math.max(cv, hv + 1), changed };
}

/* ── 4 · topbar NO_VT ── */
function wireTopbar(d) {
  let tb = read('topbar.js');
  const m = /const NO_VT = (\/.*\/);/.exec(tb);
  if (!m) throw new Error('topbar.js: δεν βρέθηκε το NO_VT');
  const re = eval(m[1]); // eslint-disable-line no-eval — η ίδια η γραμμή του αρχείου, όχι είσοδος
  if (re.test(d.file)) return { changed: false };
  const stem = d.file.replace(/^arxaia-/, '').replace(/\.html$/, '');
  if (!/^arxaia-/.test(d.file) || !/^[a-z0-9-]+$/.test(stem)) throw new Error('topbar.js: ' + d.file + ' δεν ταιριάζει στο σχήμα arxaia-*.html');
  tb = tb.replace('const NO_VT = /^(arxaia-(', 'const NO_VT = /^(arxaia-(' + stem + '|');
  fs.writeFileSync(R('topbar.js'), tb);
  return { changed: true };
}

/* ── 5 · MAP.md ── */
const MAP_HEAD = '  ⭐ ΚΕΦΑΛΑΙΑ ΤΟΥ ΚΑΛΟΥΠΙΟΥ (μία γραμμή το καθένα, τη γράφει το `tools/eisagogi/arxaia/wire.js`):';
function wireMap(d, id) {
  let map = read('MAP.md');
  const h = map.indexOf(MAP_HEAD);
  if (h < 0) throw new Error('MAP.md: λείπει η γραμμή «' + MAP_HEAD.trim().slice(0, 40) + '…»');
  const line = '  - `' + d.file + '` — ' + d.route + ' «' + L.plain(d.title) + '» · `tools/eisagogi/arxaia/' + id + '.json` · κλειδί `' + d.key + '`';
  const end = map.indexOf('\n', h) + 1;
  let k = end;
  const rows = [];
  while (map.startsWith('  - `', k)) { const e = map.indexOf('\n', k) + 1; rows.push(map.slice(k, e - 1)); k = e; }
  const at = rows.findIndex(r => r.indexOf('`tools/eisagogi/arxaia/' + id + '.json`') >= 0);
  if (at >= 0 && rows[at] === line) return { changed: false };
  if (at >= 0) rows[at] = line; else rows.push(line);
  map = map.slice(0, end) + rows.map(r => r + '\n').join('') + map.slice(k);
  fs.writeFileSync(R('MAP.md'), map);
  return { changed: true };
}

/* ── το παλιό πακέτο στο archive/, ΠΡΙΝ το build ── */
function archive(d) {
  if (!fs.existsSync(R(d.file)) || isTpl(d.file)) return [];
  const moved = [];
  const keep = (rel) => {
    const to = path.join('archive', path.basename(rel));
    if (fs.existsSync(R(to))) {
      if (fs.readFileSync(R(to), 'utf8') !== read(rel)) throw new Error('archive/' + path.basename(rel) + ' υπάρχει ήδη και ΔΙΑΦΕΡΕΙ — δεν γράφω από πάνω (δες το με το μάτι)');
    } else fs.copyFileSync(R(rel), R(to));
    moved.push(to);
  };
  keep(d.file);
  /* η παλιά γείωση (test + source) πάει μαζί, αλλιώς τρέχει πάνω σε σελίδα που δεν υπάρχει πια */
  const packs = read('tests/arxaia-gnosto.test.js');
  const m = new RegExp("\\{ file: '" + d.file.replace(/[.]/g, '\\.') + "'[^}]*ground: '([^']+)'").exec(packs);
  if (m && m[1] !== 'arxaia-eisagogi.test.js' && m[1] !== 'arxaia-sokratis-ideas.test.js') {
    const t = 'tests/' + m[1], s = t.replace(/\.test\.js$/, '.source.txt');
    [t, s].forEach(f => {
      if (!fs.existsSync(R(f))) return;
      const to = 'archive/' + path.basename(f);
      if (fs.existsSync(R(to))) throw new Error(to + ' υπάρχει ήδη — δεν γράφω από πάνω');
      fs.renameSync(R(f), R(to));
      moved.push(to);
    });
  }
  return moved;
}

function wire(id) {
  const d = L.load(id);
  const p = wirePlate(d), k = wirePacks(d), s = wireSW(d), t = wireTopbar(d), m = wireMap(d, id);
  return { plates: p.n, cache: s.cache, changed: [p.changed && 'arxaia.html', k.changed && 'tests/arxaia-gnosto.test.js', s.changed && 'sw.js', t.changed && 'topbar.js', m.changed && 'MAP.md'].filter(Boolean) };
}

if (require.main === module) {
  const id = process.argv[2];
  if (!/^[a-z0-9-]+$/.test(id || '')) { console.error('χρήση: node tools/eisagogi/arxaia/wire.js <id>'); process.exit(2); }
  try {
    const r = wire(id);
    console.log('✓ wire ' + id + ': ' + r.plates + ' πλάκες · ' + r.cache + ' · ' + (r.changed.length ? 'άλλαξαν ' + r.changed.join(', ') : 'τίποτα δεν άλλαξε'));
  } catch (e) { console.error('⛔ ' + e.message); process.exit(1); }
}
module.exports = { wire, archive, blockHTML, BOOK };
