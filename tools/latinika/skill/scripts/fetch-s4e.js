#!/usr/bin/env node
/* fetch-s4e.js NN [ID] [--out DIR]
   study4exams.gr (Moodle, ΙΤΥΕ «Διόφαντος») → όλοι οι πόροι της LECTIO ως
   κείμενο στο scratchpad + ΠΡΟΧΕΙΡΟ λημμάτων στο tools/latinika/lectioNN.s4e.json.

   ⭐ Το ID το βρίσκει ΜΟΝΟ ΤΟΥ από τον κατάλογο latin/course/index.php (ΜΙΑ σελίδα,
   όλα τα LECTIO με τα ids τους — als-v648: η WebSearch site:study4exams.gr ΔΕΝ βρήκε
   τίποτα). Δεύτερο όρισμα = χειροκίνητο ID, μόνο αν ο κατάλογος αλλάξει.
   ⛔ ΠΟΤΕ σάρωση ids (rate-limit, και το απέρριψε ρητά).
   ⭐ Το πρόχειρο καθαρίζεται μόνο του από τα σφάλματα που βρέθηκαν στα XXI/XXV:
   «–»→«-», ελληνικά γράμματα μέσα σε λατινικά λήμματα (Cato –οnis), βοηθητικά ρήματα
   που κρατούσαν τη συζυγία της προηγούμενης επικεφαλίδας (sum «δ΄»), και λήμματα που
   συνεχίζουν σε δεύτερη γραμμή με ανοιχτή παρένθεση (scio … (προστακτική: / scito …)).

   ⚠️ Θέλει cookie: πρώτα latin/index.php, μετά course/view.php?id=ID.
   ⚠️ ΜΟΝΟ www.study4exams.gr — το σκέτο study4exams.gr έχει πιστοποιητικό
      για άλλο host και το curl αποτυγχάνει σιωπηλά (HTTP 000). */
'use strict';
const fs = require('fs'), os = require('os'), path = require('path');
const { execFileSync } = require('child_process');
const L = require('/Users/alexstathatos/ALS DASHBOARD ALL FILES/als/tools/latinika/lib.js');

const NN = +process.argv[2];
let ID = +process.argv[3] || 0;
if (!NN) { console.error('χρήση: fetch-s4e.js NN [ID] [--out DIR]'); process.exit(2); }
const R = L.roman(NN);
const oi = process.argv.indexOf('--out');
const OUT = oi > 0 ? process.argv[oi + 1] : path.join(process.env.TMPDIR || os.tmpdir(), 'latinika-s4e-' + NN);
fs.mkdirSync(OUT, { recursive: true });
const JAR = path.join(OUT, 'cookies.txt');
const B = 'https://www.study4exams.gr/latin';
function get(url, file) {
  const code = execFileSync('curl', ['-sL', '-c', JAR, '-b', JAR, '-o', file, '-w', '%{http_code}', url]).toString().trim();
  if (code !== '200') { console.error('⛔ HTTP ' + code + ' — ' + url); process.exit(1); }
  return fs.readFileSync(file, 'utf8');
}
get(B + '/index.php', path.join(OUT, 'index.html'));
if (!ID) {
  const cat = get(B + '/course/index.php', path.join(OUT, 'catalog.html'));
  const hit = new RegExp('course/view\\.php\\?id=(\\d+)"[^>]*>\\s*LECTIO\\s+' + R + '\\b').exec(cat);
  if (!hit) { console.error('⛔ ο κατάλογος δεν έχει LECTIO ' + R + ' — δώσε το ID με το χέρι'); process.exit(1); }
  ID = +hit[1];
  console.log('✓ κατάλογος: LECTIO ' + R + ' = course ' + ID);
}
const course = get(B + '/course/view.php?id=' + ID, path.join(OUT, 'course.html'));
const title = (/<title>([^<]*)/.exec(course) || [])[1] || '';
if (!new RegExp('LECTIO\\s+' + R + '\\b').test(title)) { console.error('⛔ το course ' + ID + ' είναι «' + title.trim() + '», όχι LECTIO ' + R + ' — λάθος id'); process.exit(1); }

const dec = s => s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#(\d+);/g, (m, d) => String.fromCodePoint(+d));
const toText = h => dec(h.replace(/<br\s*\/?>/gi, '\n').replace(/<\/(tr|div|p|li|h\d)>/gi, '\n').replace(/<[^>]+>/g, ''))
  .replace(/[ \t\r]+/g, ' ').replace(/\n\s*\n+/g, '\n').trim();

const res = [];
const re = /GetResourceById\((\d+), 'shm', this\);"[^>]*>([\s\S]*?)<\/a>/g;
let m;
while ((m = re.exec(course))) res.push({ id: +m[1], title: dec(m[2].replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim() });
if (!res.length) { console.error('⛔ κανένας πόρος στο course ' + ID); process.exit(1); }
const pdfs = [...new Set(course.match(/\.\.\/pdf\/[^"']+\.pdf/g) || [])];
let vocab = null;
res.forEach((r, i) => {
  const h = get(B + '/mod/resource/my_view_e.php?id=' + r.id, path.join(OUT, 'r' + r.id + '.html'));
  const txt = toText(h);
  const f = path.join(OUT, String(i + 1).padStart(2, '0') + '-' + r.id + '.txt');
  fs.writeFileSync(f, r.title + '\n\n' + txt + '\n');
  r.file = f; r.chars = txt.length;
  if (/ταξινομημένο λεξιλόγιο/i.test(r.title)) vocab = txt;
});
console.log('✓ ' + title.trim() + ' · ' + res.length + ' πόροι → ' + OUT);
res.forEach(r => console.log('  ' + r.id + '  ' + String(r.chars).padStart(6) + ' χαρ.  ' + r.title + '\n         ' + r.file));
if (pdfs.length) console.log('  PDF (δεν κατεβαίνουν): ' + pdfs.map(p => B + '/course/' + p).join(' · '));

/* ── το ΠΡΟΧΕΙΡΟ των λημμάτων από το «Γραμματικά ταξινομημένο λεξιλόγιο» ── */
if (!vocab) { console.error('⚠️ δεν βρέθηκε «Γραμματικά ταξινομημένο λεξιλόγιο» — χωρίς πρόχειρο, το validate δεν συγκρίνει αρχικούς χρόνους'); process.exit(0); }
const LET = { A: 'α', 'Α': 'α', B: 'β', 'Β': 'β', 'Γ': 'γ', 'Δ': 'δ', E: 'ε', 'Ε': 'ε' };
const CONJ = { '1': 'α΄', '2': 'β΄', '3': 'γ΄', '4': 'δ΄' };
const draft = { source: { course: ID, title: title.trim(), url: B + '/course/view.php?id=' + ID, date: new Date().toISOString().slice(0, 10) }, v: {}, n: {}, other: [] };
let mode = null, decl = null, conj = null;
const head = s => L.norm(s.split(/[\s,(-]/)[0]);
/* ελληνικά «διπλότυπα» λατινικών γραμμάτων που γράφει το s4e μέσα σε λήμματα */
const GL = { 'ο': 'o', 'Ο': 'O', 'α': 'a', 'Α': 'A', 'ε': 'e', 'Ε': 'E', 'ι': 'i', 'Ι': 'I', 'κ': 'k', 'Κ': 'K', 'τ': 't', 'Τ': 'T', 'ν': 'v', 'Ν': 'N', 'Μ': 'M', 'Β': 'B', 'Η': 'H', 'Χ': 'X', 'Ρ': 'P', 'Ζ': 'Z', 'υ': 'u' };
const clean = l => l.replace(/[–—‒]/g, '-').replace(/-{2,}/g, '-').replace(/[\u0370-\u03ff]/g, (c, i, w) => /[a-zāēīōūăĕĭŏŭ]/i.test(w.slice(Math.max(0, i - 2), i + 3).replace(c, '')) && GL[c] ? GL[c] : c).replace(/\s+/g, ' ').trim();
let cont = false;
vocab.split('\n').map(s => s.trim()).filter(Boolean).forEach(line => {
  if (/^ΟΥΣΙΑΣΤΙΚΑ/.test(line)) { mode = 'n'; return; }
  if (/^ΡΗΜΑΤΑ/.test(line)) { mode = 'v'; conj = null; return; }
  if (/^(ΕΠΙΘΕΤΑ|ΜΕΤΟΧΕΣ|ΑΝΤΩΝΥΜΙΕΣ|ΕΠΙΡΡΗΜΑΤΑ|ΠΡΟΘΕΣΕΙΣ|ΣΥΝΔΕΣΜΟΙ|ΜΟΡΙΑ)/.test(line)) { mode = 'o'; return; }
  let k;
  if ((k = /^([AΑBΒΓΔEΕ])΄\s*κλίση/.exec(line))) { decl = LET[k[1]] + '΄'; return; }
  if ((k = /^(\d)η\s*Συζυγία/i.exec(line))) { conj = CONJ[k[1]]; return; }
  if (/^(Βοηθητικ|ΒΟΗΘΗΤΙΚ|Ανώμαλ|ΑΝΩΜΑΛ|Ελλειπτ|ΕΛΛΕΙΠΤ|Αποθετικ|ΑΠΟΘΕΤΙΚ)/.test(line)) { if (/ΡΗΜΑΤΑ|ρήματα/.test(line) || /^(ΒΟΗΘ|ΑΝΩΜ|ΕΛΛΕΙΠ)/.test(line)) mode = 'v'; conj = null; return; }
  /* συνέχεια λήμματος που άνοιξε παρένθεση στην προηγούμενη γραμμή: πετιέται */
  if (cont) { if (/\)/.test(line)) cont = false; draft.other.push(line); return; }
  if (mode === 'n') {
    const n = /^(.+?):\s*(αρσενικό|θηλυκό|ουδέτερο)/.exec(line);
    if (n) { const l = clean(n[1]).replace(/([a-zāēīōū])-/g, '$1 -'); draft.n[head(l)] = { l, g: n[2], decl }; return; }
  }
  if (mode === 'v' && /,/.test(line) || mode === 'v' && /^inquam/.test(line)) {
    if (/\([^)]*$/.test(line)) cont = true;
    const l = clean(line.replace(/\([^)]*\)/g, '').replace(/\([^)]*$/, '').replace(/\s+\d+\s*$/, ''));
    draft.v[head(l)] = conj ? { l, conj } : { l };
    return;
  }
  draft.other.push(line);
});
fs.writeFileSync(L.s4ePath(NN), JSON.stringify(draft, null, 1) + '\n');
console.log('✓ πρόχειρο: ' + Object.keys(draft.v).length + ' ρήματα · ' + Object.keys(draft.n).length + ' ουσιαστικά → ' + L.s4ePath(NN));
