#!/usr/bin/env node
/* fetch-book.js NN [--force] [--print]
   curl στο ebooks.edu.gr → tests/latinika-lectioNN.source.txt (το λατινικό ΩΜΟ,
   με μακρά και αστερίσκους). Τη μετάφραση μετά το @@@ τη γράφει το μοντέλο
   από τη φωτογραφία του φυλλαδίου.

   Σταματάει με ακριβές μήνυμα αν: HTTP ≠ 200 · δεν υπάρχει ΑΚΡΙΒΩΣ ένα
   <p class="lusidaFont"> (η «σελίδα-404» του αποθετηρίου είναι κανονική
   σελίδα με 200, χωρίς αυτό το <p>) · ο τίτλος δεν είναι «ΜΑΘΗΜΑ <ρωμαϊκός>». */
'use strict';
const fs = require('fs'), os = require('os'), path = require('path'), crypto = require('crypto');
const { execFileSync } = require('child_process');
const L = require('/Users/alexstathatos/ALS DASHBOARD ALL FILES/als/tools/latinika/lib.js');

const NN = +process.argv[2];
if (!NN) { console.error('χρήση: fetch-book.js NN [--force] [--print]'); process.exit(2); }
const R = L.roman(NN), url = L.bookUrl(NN);
const tmp = path.join(os.tmpdir(), 'latinika-book-' + NN + '.html');
const code = execFileSync('curl', ['-s', '-o', tmp, '-w', '%{http_code}', url]).toString().trim();
if (code !== '200') { console.error('⛔ HTTP ' + code + ' — ' + url); process.exit(1); }
const raw = fs.readFileSync(tmp);
const sha = crypto.createHash('sha256').update(raw).digest('hex');
const H = raw.toString('utf8');
const ps = H.match(/<p class="lusidaFont">[\s\S]*?<\/p>/g) || [];
if (ps.length !== 1) { console.error('⛔ βρέθηκαν ' + ps.length + ' <p class="lusidaFont"> (θέλω 1) — μάλλον η σελίδα-404 του αποθετηρίου · ' + url); process.exit(1); }
if (!new RegExp('ΜΑΘΗΜΑ\\s+' + R + '\\b').test(H)) { console.error('⛔ η σελίδα δεν γράφει «ΜΑΘΗΜΑ ' + R + '»'); process.exit(1); }

const ENT = { nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', laquo: '«', raquo: '»', rsquo: '’', lsquo: '‘', hellip: '…', ndash: '–', mdash: '—' };
let t = ps[0].replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '')
  .replace(/&#(\d+);/g, (m, d) => String.fromCodePoint(+d)).replace(/&#x([0-9a-f]+);/gi, (m, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&([a-z]+);/gi, (m, e) => ENT[e] != null ? ENT[e] : m);
t = t.normalize('NFC').replace(/\s+/g, ' ').trim();
if (/&[a-z]+;/i.test(t)) { console.error('⛔ έμεινε HTML entity: ' + t.match(/&[a-z]+;/i)[0]); process.exit(1); }
if (/[̀-ͯ]/.test(t)) { console.error('⛔ combining mark μέσα στο κείμενο μετά το NFC'); process.exit(1); }

const nonAscii = [...new Set([...t].filter(c => c.charCodeAt(0) > 127))].join(' ');
const starred = L.stars(t);
const titleM = /<title>([^<]*)<\/title>/.exec(H);
const date = new Date().toLocaleDateString('el-GR', { day: 'numeric', month: 'long', year: 'numeric' });
console.log('✓ HTTP 200 · 1 <p class="lusidaFont"> · ΜΑΘΗΜΑ ' + R);
console.log('  sha256 ' + sha);
console.log('  ' + t.split(' ').length + ' λέξεις · μη-ASCII: ' + (nonAscii || '—'));
console.log('  αστερίσκοι: ' + starred.length + (starred.length ? ' → ' + starred.join(' · ') : ''));
/* ⭐ ο ΤΙΤΛΟΣ, το ΛΕΞΙΛΟΓΙΟ (αρχικοί χρόνοι με μακρά, γένη, «βλ. παρατηρήσεις») και οι ΠΑΡΑΤΗΡΗΣΕΙΣ
   (= το μάθημα) — πηγή 5 του §4 και η αυθεντία για τους αρχικούς χρόνους. Σε αρχείο, για ΕΝΑ Read. */
const pageTxt = H.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, '').replace(/<(br|\/p|\/div|\/tr|\/li|\/h\d)[^>]*>/gi, '\n')
  .replace(/<[^>]+>/g, ' ').replace(/&#(\d+);/g, (m, d) => String.fromCodePoint(+d)).replace(/&#x([0-9a-f]+);/gi, (m, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&([a-z]+);/gi, (m, e) => ENT[e] != null ? ENT[e] : m).replace(/&lt;/g, '<').normalize('NFC')
  .split('\n').map(s => s.replace(/\s+/g, ' ').trim()).filter(Boolean).join('\n');
const bookTxt = path.join(os.tmpdir(), 'latinika-book-' + NN + '.txt');
fs.writeFileSync(bookTxt, pageTxt.slice(Math.max(0, pageTxt.indexOf('ΜΑΘΗΜΑ ' + R))) + '\n');
const isT = x => /^[Α-ΩΆ-Ώ\s«»,.'-]{4,}$/.test(x) && !/ΜΑΘΗΜΑ|LECTIO|ΛΕΞΙΛΟΓΙΟ|ΠΑΡΑΤΗΡΗΣΕΙΣ|ΑΣΚΗΣΕΙΣ/.test(x);
const PL = pageTxt.split('\n'), t0 = PL.findIndex(x => isT(x) && x.length >= 8);
let gTitle = ''; for (let i = t0; t0 >= 0 && i < PL.length && isT(PL[i]); i++) gTitle += (gTitle ? ' ' : '') + PL[i].trim();
console.log('  τίτλος βιβλίου: ' + (gTitle || '— (δες το αρχείο)'));
console.log('  λεξιλόγιο + παρατηρήσεις → ' + bookTxt);
if (process.argv.includes('--print')) { console.log('\n' + t); process.exit(0); }

const out = L.srcPath(NN);
if (fs.existsSync(out) && !process.argv.includes('--force')) {
  const cur = L.parseSource(fs.readFileSync(out, 'utf8')).book;
  console.log(cur === t ? '✓ το υπάρχον ' + path.basename(out) + ' έχει ΑΚΡΙΒΩΣ αυτό το κείμενο' : '⛔ το υπάρχον ' + path.basename(out) + ' ΔΙΑΦΕΡΕΙ: ' + L.firstDiff(cur, t));
  process.exit(cur === t ? 0 : 1);
}
const head = [
  '# ══════════════════════════════════════════════════════════════════════',
  '# Η ΠΗΓΗ ΤΗΣ LECTIO ' + R + ' — ΑΥΤΟΥΣΙΑ ΑΠΟ ΤΟ ΕΠΙΣΗΜΟ ΒΙΒΛΙΟ + ΤΟ ΦΥΛΛΑΔΙΟ.',
  '#',
  '# ⛔ ΜΗΝ ΤΟ ΑΚΟΥΜΠΗΣΕΙΣ ΜΕ ΤΟ ΧΕΡΙ. Το λατινικό μπλοκ είναι το ΩΜΟ κείμενο',
  '# του σχολικού βιβλίου, με τα μακρά του και τους αστερίσκους του.',
  '#',
  '# ΠΗΓΗ:  Λατινικά Γ΄ Λυκείου Ανθρωπιστικών Σπουδών, ' + L.tefxos(NN) + ' Τεύχος, ΜΑΘΗΜΑ ' + R + '.',
  '#        ' + (titleM ? titleM[1].trim() : ''),
  '#        ' + url,
  '# ΠΩΣ:   tools fetch-book.js — curl -s (HTTP 200), το ΕΝΑ <p class="lusidaFont">,',
  '#        ξεγύμνωμα tags, ' + date + '. NFC. Μη-ASCII: ' + (nonAscii || '—') + '.',
  '#        sha256 του κατεβασμένου ' + path.basename(url) + ':',
  '#        ' + sha,
  '#',
  '# ⭐ ΓΙΑΤΙ ΓΕΙΩΣΗ ΚΑΙ ΟΧΙ sha256 ΤΗΣ ΣΕΛΙΔΑΣ (σταθ. 50): το πακέτο ' + R + ' το',
  '# ΕΓΡΑΨΑ ΕΓΩ.',
  '#',
  '# ΑΣΤΕΡΙΣΚΟΙ: ' + starred.length + (starred.length ? ' (' + starred.join(' · ') + ') — παραπομπές του βιβλίου στις Παρατηρήσεις, όχι κείμενο.' : ' — κανένας.'),
  '#',
  '# ⭐⭐ ΤΥΠΟΓΡΑΦΙΚΟ: ΣΥΜΠΛΗΡΩΣΕ — «ΔΕΝ ΒΡΕΘΗΚΕ» ή η λέξη και η διόρθωση (fixes στο JSON).',
  '#',
  '# ── ΤΟ ΔΕΥΤΕΡΟ ΜΠΛΟΚ (μετά το @@@) ────────────────────────────────────────',
  '# Η ΜΕΤΑΦΡΑΣΗ ΕΙΝΑΙ ΤΟΥ ΦΥΛΛΑΔΙΟΥ ΤΟΥ, ΑΥΤΟΛΕΞΕΙ, από τη φωτογραφία.',
  '# ══════════════════════════════════════════════════════════════════════',
  ''
].join('\n');
fs.writeFileSync(out, head + t + '\n@@@\nΣΥΜΠΛΗΡΩΣΕ: η μετάφραση του φυλλαδίου, αυτολεξεί, σε μία παράγραφο.\n');
console.log('έγραψα ' + out);
