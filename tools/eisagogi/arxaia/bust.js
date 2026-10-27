/* tools/eisagogi/arxaia/bust.js — Η ΠΡΟΤΟΜΗ του εξωφύλλου, από χαρακτικό κοινού κτήματος.
   ΒΗΜΑ 1 · node tools/eisagogi/arxaia/bust.js <id> "<όνομα στα αγγλικά/λατινικά>" [--q "<άλλη αναζήτηση>"]
            Wikimedia Commons (API) → ΜΟΝΟ Public domain / CC0 (από το extmetadata, ποτέ από τον τίτλο)
            → ως 3 υποψήφια, σε ΕΝΑ φύλλο με αριθμούς: $TMPDIR/eisagogi-<id>/bust-sheet.png (αυτό κοιτάς).
   ΒΗΜΑ 2 · node tools/eisagogi/arxaia/bust.js <id> --pick N [--crop x,y,s]
            x,y = πάνω-αριστερή γωνία, s = πλευρά τετραγώνου, ΚΛΑΣΜΑΤΑ (0–1) του ΠΛΑΤΟΥΣ της εικόνας
            (χωρίς --crop: το κεντρικό τετράγωνο του πάνω μέρους). Κοπή (sips) → 480×480 → σβήσιμο βρωμιάς
            στο κενό περιθώριο (despeckle.py) → cwebp -q 80 → eisagogi-<id>.webp στη ρίζα του repo,
            και cover.seal.img + credit στο json (μέσω fmt — ποτέ JSON.stringify όλου του αρχείου).
            Τυπώνει ΕΝΑ PNG ζουμ για έλεγχο: $TMPDIR/eisagogi-<id>/bust-final.png
   ⚠️ Το Gemini image έχει όριο 0 στο δωρεάν πλάνο — δεν χρησιμοποιείται. Κεφάλαιο χωρίς πρόσωπο
   (π.χ. εισαγωγή Ηθικών) → καμία προτομή: μένουν τα seal.mark + seal.ring που υπάρχουν ήδη ως fallback. */
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const cp = require('child_process');
const L = require('./lib');
const { format } = require('./fmt');

const args = process.argv.slice(2), id = args[0];
const flag = k => { const i = args.indexOf(k); return i < 0 ? null : args[i + 1]; };
if (!/^[a-z0-9-]+$/.test(id || '') || args.length < 2) {
  console.error('χρήση: bust.js <id> "<όνομα>" [--q "…"]   ή   bust.js <id> --pick N [--crop x,y,s]'); process.exit(2);
}
const JSONF = path.join(__dirname, id + '.json');
if (!fs.existsSync(JSONF)) { console.error('⛔ δεν υπάρχει ' + id + '.json — πρώτα scaffold.js'); process.exit(1); }
const TMP = path.join(process.env.TMPDIR || os.tmpdir(), 'eisagogi-' + id);
fs.mkdirSync(TMP, { recursive: true });
const CANDS = path.join(TMP, 'bust-candidates.json');
const UA = 'metron-eisagogi/1.0 (personal study app; commons API)';
const run = (cmd, a) => { const r = cp.spawnSync(cmd, a, { encoding: 'utf8' }); if (r.status !== 0) { console.error('⛔ ' + cmd + ' απέτυχε: ' + ((r.stderr || '') + (r.stdout || '')).trim().slice(0, 300)); process.exit(1); } return r.stdout; };
const get = (url, out) => run('curl', ['-sSL', '-m', '60', '-A', UA, '-o', out, url]);
const strip = s => String(s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const FREE = v => /^(pd|cc0)$/.test(v) || /^pd[-_]/.test(v) || /^public domain$/i.test(v);

function search(q) {
  const qs = new URLSearchParams({ action: 'query', format: 'json', generator: 'search', gsrsearch: q + ' filetype:bitmap',
    gsrnamespace: '6', gsrlimit: '20', prop: 'imageinfo', iiprop: 'url|size|extmetadata|mime', iiurlwidth: '1200',
    iiextmetadatafilter: 'LicenseShortName|License|Artist|ObjectName|ImageDescription|DateTimeOriginal' });
  const f = path.join(TMP, 'search.json');
  get('https://commons.wikimedia.org/w/api.php?' + qs, f);
  let d; try { d = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { console.error('⛔ το Commons δεν γύρισε JSON'); process.exit(1); }
  return Object.values((d.query || {}).pages || {}).sort((a, b) => a.index - b.index).map(p => {
    const ii = p.imageinfo[0], m = ii.extmetadata || {};
    const lic = String((m.License || {}).value || '').toLowerCase();
    return { title: p.title, page: ii.descriptionurl, thumb: ii.thumburl, w: ii.width, h: ii.height, mime: ii.mime, lic,
      licName: strip((m.LicenseShortName || {}).value), artist: strip((m.Artist || {}).value), object: strip((m.ObjectName || {}).value),
      date: strip((m.DateTimeOriginal || {}).value) };
  });
}

if (!args.includes('--pick')) {
  /* ── ΒΗΜΑ 1 ── */
  const name = args[1], q = flag('--q');
  const seen = new Set(), all = [];
  (q ? [q] : [name + ' bust engraving', name + ' engraving', name + ' woodcut bust']).forEach(s => search(s).forEach(c => {
    if (seen.has(c.title)) return; seen.add(c.title); all.push(c);
  }));
  const ok = all.filter(c => FREE(c.lic) && /jpeg|png|tiff/.test(c.mime) && Math.min(c.w, c.h) >= 400);
  console.log('Commons: ' + all.length + ' αποτελέσματα · ' + ok.length + ' κοινό κτήμα/CC0 · ' + (all.length - ok.length) + ' απορρίφθηκαν (άδεια/μέγεθος)');
  const pick = ok.slice(0, 3);
  if (!pick.length) { console.log('✗ κανένα ελεύθερο χαρακτικό — δοκίμασε --q "<άλλη φράση>", ή μείνε στη σφραγίδα (mark + ring)'); process.exit(1); }
  pick.forEach((c, i) => { c.file = path.join(TMP, 'bust-' + (i + 1) + (/png/.test(c.mime) ? '.png' : '.jpg')); get(c.thumb, c.file); });
  fs.writeFileSync(CANDS, JSON.stringify(pick, null, 1));
  /* ΕΝΑ φύλλο με τα υποψήφια, για ΕΝΑ Read */
  const sheet = path.join(TMP, 'bust-sheet.png'), html = path.join(TMP, 'bust-sheet.html');
  fs.writeFileSync(html, '<!doctype html><meta charset=utf-8><body style="margin:0;background:#fff;font:600 22px system-ui;display:flex;gap:14px;padding:14px">' +
    pick.map((c, i) => '<figure style="margin:0;width:420px"><div style="height:520px;display:flex;align-items:center;justify-content:center;background:#eee"><img src="file://' + c.file + '" style="max-width:420px;max-height:520px"></div><figcaption>' + (i + 1) + ' · ' + c.licName + ' · ' + c.w + '×' + c.h + '</figcaption></figure>').join('') + '</body>');
  const pw = path.join(L.REPO, 'video-kit', 'node_modules', 'playwright');
  const js = "const {chromium}=require(" + JSON.stringify(pw) + ");(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:" + (14 + pick.length * 434) + ",height:600}});await p.goto(" + JSON.stringify('file://' + html) + ");await p.waitForTimeout(400);await p.screenshot({path:" + JSON.stringify(sheet) + "});await b.close();})().catch(e=>{console.error(e.message);process.exit(1)})";
  run(process.execPath, ['-e', js]);
  pick.forEach((c, i) => console.log('  ' + (i + 1) + ' · ' + c.title.replace(/^File:/, '').slice(0, 70) + ' · ' + c.licName + ' · ' + (c.artist || '—').slice(0, 40)));
  console.log('Δες (Read): ' + sheet);
  console.log('Μετά: node tools/eisagogi/arxaia/bust.js ' + id + ' --pick N --crop x,y,s   (κλάσματα του πλάτους· τετράγωνο γύρω από το κεφάλι)');
  process.exit(0);
}

/* ── ΒΗΜΑ 2 ── */
if (!fs.existsSync(CANDS)) { console.error('⛔ πρώτα το βήμα 1 (αναζήτηση)'); process.exit(1); }
const cands = JSON.parse(fs.readFileSync(CANDS, 'utf8'));
const c = cands[(+flag('--pick') || 0) - 1];
if (!c) { console.error('⛔ --pick 1…' + cands.length); process.exit(1); }
if (!FREE(c.lic)) { console.error('⛔ η άδεια «' + c.licName + '» δεν είναι κοινό κτήμα/CC0'); process.exit(1); }
const crop = (flag('--crop') || '').split(',').map(Number);
const big = path.join(TMP, 'bust-big.png');
run('sips', ['-s', 'format', 'png', c.file, '--out', big]);
const dim = run('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', big]);
const W = +/pixelWidth: (\d+)/.exec(dim)[1], Hh = +/pixelHeight: (\d+)/.exec(dim)[1];
let [cx, cy, cs] = crop.length === 3 && crop.every(v => v >= 0 && v <= 1) ? crop : [0, 0, 1];
let side = Math.round(cs * W), ox = Math.round(cx * W), oy = Math.round(cy * W);
side = Math.min(side, W - ox, Hh - oy);
if (side < 200) { console.error('⛔ το τετράγωνο βγαίνει ' + side + 'px — πολύ μικρό (μεγάλωσε το s ή μίκρυνε το x/y)'); process.exit(1); }
const cut = path.join(TMP, 'bust-cut.png'), clean = path.join(TMP, 'bust-clean.png');
run('sips', ['-c', String(side), String(side), '--cropOffset', String(oy), String(ox), big, '--out', cut]);
run('sips', ['-z', '480', '480', '-s', 'format', 'png', cut, '--out', cut]);
console.log(run('python3', ['-I', path.join(__dirname, 'despeckle.py'), cut, clean]).trim());
const webp = 'eisagogi-' + id + '.webp';
run('cwebp', ['-quiet', '-q', '80', clean, '-o', path.join(L.REPO, webp)]);
run('dwebp', ['-quiet', path.join(L.REPO, webp), '-o', path.join(TMP, 'bust-final.png')]);
const d = JSON.parse(fs.readFileSync(JSONF, 'utf8'));
const who = c.artist || 'άγνωστος χαράκτης';
/* νέα επιλογή = νέα εικόνα = νέο credit· τα mark/ring/label μένουν (fallback) */
d.cover.seal = Object.assign({}, d.cover.seal, { img: webp, credit: who +(c.object ? ', ' + c.object : '') + ((/\b(1[0-9]{3})\b/.exec(c.date) || [])[1] ? ' (' + /\b(1[0-9]{3})\b/.exec(c.date)[1] + ')' : '') + ' · ' + (/cc0/.test(c.lic) ? 'CC0' : 'κοινό κτήμα') + ' · Wikimedia Commons' });
if (!/Wikimedia Commons/.test(d.cover.seal.credit)) d.cover.seal.credit += ' · Wikimedia Commons';
fs.writeFileSync(JSONF, format(d));
console.log('✓ ' + webp + ' (' + Math.round(fs.statSync(path.join(L.REPO, webp)).size / 1024) + ' KB, 480×480) · seal.img + credit στο json');
console.log('  credit: ' + d.cover.seal.credit.slice(0, 140) + '  ← γράψ\' το στα ελληνικά αν θες, όπως του Δ2');
console.log('Δες (Read): ' + path.join(TMP, 'bust-final.png'));
