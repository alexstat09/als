/* tools/eisagogi/arxaia/wire.js — ΚΑΛΩΔΙΩΝΕΙ ένα κεφάλαιο στην εφαρμογή. Ιδεμπότητο: δεύτερο τρέξιμο = καμία αλλαγή.
     node tools/eisagogi/arxaia/wire.js <id>
   1 · arxaia.html: η πλάκα στο #gnWrap, στη ΣΕΙΡΑ ΤΟΥ ΒΙΒΛΙΟΥ (BOOK), και ξαναμέτρημα «Πακέτο N» /
       «Σχεδιάγραμμα · N» / «N πακέτα». Το σχεδιάγραμμα έχει ΜΙΑ φύλλο-κουτί ανά κόμμα της περιγραφής
       (το απαιτεί το arxaia-gnosto.test.js). Πλάκα που είναι ήδη του καλουπιού κρατάει περιγραφή+σχέδιο
       (εκτός αν το json δίνει plate.d)· τίτλος, μετρητές και οθόνες ξαναγράφονται πάντα από το json.
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

/* η σειρά του βιβλίου (Φιλοσοφικός Λόγος, εισαγωγή): ό,τι λείπει από εδώ μπαίνει στο τέλος */
const BOOK = ['arxaia-sokratis-ideas.html', 'arxaia-sokratis.html', 'arxaia-platon.html', 'arxaia-protagoras-eisagogi.html',
  'arxaia-politeia-eisagogi.html', 'arxaia-aristotelis.html', 'arxaia-ithika-eisagogi.html', 'arxaia-politika-eisagogi.html'];
const SCREENS = '<div class="pl-sc"><i>Διάβασμα</i><i>Ανάκληση</i><i>Σωστό ή λάθος</i><i>Τα κενά μου</i></div>';
const R = f => path.join(L.REPO, f);
const read = f => fs.readFileSync(R(f), 'utf8');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const isTpl = f => fs.existsSync(R(f)) && read(f).indexOf('const KEY="eisarx-') >= 0;

function leavesSVG(n) {
  const rw = n <= 4 ? 30 : n === 5 ? 24 : Math.max(12, Math.floor((150 - (n - 1) * 6) / n));
  const xs = Array.from({ length: n }, (_, i) => n === 1 ? 80 - rw / 2 : Math.round(5 + (n === 4 ? 3 : 0) + i * (150 - (n === 4 ? 6 : 0) - rw) / (n - 1)));
  const cs = xs.map(x => x + rw / 2);
  let s = '<svg viewBox="0 0 160 104" aria-hidden="true"><rect class="nd" x="56" y="8" width="48" height="14" rx="3"/><path class="ln" d="M80 22V40"/>';
  if (n > 1) s += '<path class="ln" d="M' + cs[0] + ' 40H' + cs[n - 1] + '"/>';
  cs.forEach(c => { s += '<path class="ln" d="M' + c + ' 40V52"/>'; });
  xs.forEach(x => { s += '<rect class="nd" x="' + x + '" y="52" width="' + rw + '" height="13" rx="3"/>'; });
  return s + '</svg>';
}
function plateHTML(d, desc, svg, i) {
  const q = d.check.recall.length + d.check.tf.length + d.check.mc.length;
  return '      <a class="gn-pl" href="' + d.file + '">\n' +
    '        <div class="pl-th">' + svg + '<em>Σχεδιάγραμμα · ' + i + '</em></div>\n' +
    '        <div>\n' +
    '          <span class="pl-k">Πακέτο ' + i + '</span>\n' +
    '          <span class="t">' + esc(L.plain(d.title)) + '</span>\n' +
    '          <span class="d">' + esc(desc) + '</span>\n' +
    '          <span class="pl-n"><b><i>Σταθμοί</i><u>' + d.stations.length + '</u></b><b><i>Ερωτήσεις</i><u>' + q + '</u></b></span>\n' +
    '        </div>\n' +
    '        ' + SCREENS + '\n' +
    '        <span class="pl-go" aria-hidden="true">↗</span>\n' +
    '      </a>\n';
}
function descFrom(d) {
  if (d.plate && d.plate.d) return d.plate.d;
  const parts = d.stations.map((s, i) => { const t = L.plain(s.label).replace(/\.$/, ''); return i ? t.charAt(0).toLowerCase() + t.slice(1) : t; });
  if (parts.some(p => p.indexOf(', ') >= 0)) throw new Error('μια ετικέτα σταθμού έχει «, » — δώσε plate.d στο json (ένα κόμμα ανά μέρος του κεφαλαίου)');
  return parts.join(', ');
}

/* ── 1 · η πλάκα ── */
function wirePlate(d) {
  let page = read('arxaia.html');
  const a = page.indexOf('<span class="k">'), s0 = page.lastIndexOf('\n', page.indexOf('<a class="gn-pl"')) + 1, s1 = page.indexOf('<p class="gn-note">');
  if (s0 < 0 || s1 < s0 || a < 0 || a > s0) throw new Error('arxaia.html: δεν βρέθηκε το μπλοκ των πλακών (#gnWrap)');
  const head = page.slice(0, s0), block = page.slice(s0, s1), tail = page.slice(s1);
  const pl = block.split(/(?=      <a class="gn-pl")/).map(x => x.replace(/^\s+/, '')).filter(Boolean)
    .map(x => '      ' + x.replace(/\s*$/, '\n'));
  const fileOf = x => (/href="([^"]+)"/.exec(x) || [])[1];
  const at = pl.findIndex(x => fileOf(x) === d.file);
  let desc, svg;
  if (at >= 0 && isTpl(d.file) && !(d.plate && d.plate.d)) {
    desc = (/<span class="d">([^<]*)<\/span>/.exec(pl[at]) || [])[1].replace(/&amp;/g, '&');
    svg = (/<div class="pl-th">(<svg[\s\S]*?<\/svg>)/.exec(pl[at]) || [])[1];
  } else { desc = descFrom(d); svg = leavesSVG(desc.split(', ').length); }
  const mine = plateHTML(d, desc, svg, 0);
  if (at >= 0) pl[at] = mine;
  else {
    const bi = f => { const k = BOOK.indexOf(f); return k < 0 ? 1e9 : k; };
    pl.push(mine);
    /* νέα πλάκα → ΟΛΕΣ στη σειρά του βιβλίου (σταθερή ταξινόμηση· ό,τι λείπει από το BOOK μένει στο τέλος).
       Ένα ξανατρέξιμο σε υπάρχουσα πλάκα δεν μετακινεί τίποτα. */
    pl.sort((x, y) => bi(fileOf(x)) - bi(fileOf(y)));
  }
  /* ξαναμέτρημα, όλες οι πλάκες */
  const out = pl.map((x, i) => x.replace(/<em>Σχεδιάγραμμα · \d+<\/em>/, '<em>Σχεδιάγραμμα · ' + (i + 1) + '</em>')
    .replace(/<span class="pl-k">Πακέτο \d+<\/span>/, '<span class="pl-k">Πακέτο ' + (i + 1) + '</span>'));
  const h2 = head.replace(/<span class="k">\d+ πακέτα · χωρίς βαθμό<\/span>/, '<span class="k">' + out.length + ' πακέτα · χωρίς βαθμό</span>');
  /* το διάστημα ανάμεσα στις πλάκες: μία κενή γραμμή, όπως ήταν */
  const next = h2 + out.join('\n') + '\n    ' + tail;
  if (next !== page) fs.writeFileSync(R('arxaia.html'), next);
  return { n: out.length, changed: next !== page };
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
module.exports = { wire, archive, leavesSVG, BOOK };
