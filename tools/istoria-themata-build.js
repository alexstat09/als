/* τρέξε με: node tools/istoria-themata-build.js   (χωρίς shebang: ο έλεγχος
   smoke-test.sh παρσάρει ΚΑΘΕ .js με jsc, που σκάει στο '#') */
/* ══════════════════════════════════════════════════════════════════════
   ΡΑΝΤΑΡ ΕΚΦΩΝΗΣΕΩΝ — ο γεννήτορας του ευρετηρίου λέξεων.

   Γράφει το `istoria-themata-index.js` ΑΠΟ ΤΟ ΒΙΒΛΙΟ, ποτέ από το μυαλό
   μου: για κάθε ενότητα του Κεφ. 1 ζητάει τις ελεγμένες παραγράφους από
   το `tools/istoria-unit.js` (δύο ανεξάρτητοι εξαγωγείς πρέπει να
   συμφωνήσουν) και βγάζει:

     THI_UNITS  — οι 21 ενότητες εντός ύλης, με μέγεθος
     THI_IDX    — λέξη (χωρίς τόνους) -> [ενότητες όπου ζει]
     THI_SIG    — ανά ενότητα, οι λέξεις που ζουν ΜΟΝΟ εκεί
     THI_PARA   — ανά ενότητα, η ΠΡΩΤΗ ΦΡΑΣΗ κάθε παραγράφου, με τη σειρά.
                  ⭐ Είναι ο σκελετός: ξέροντας πώς ΑΝΟΙΓΕΙ κάθε παράγραφος
                  ξέρεις πού πατάς για να ξεκινήσεις να γράφεις. Βγαίνει από
                  το βιβλίο — ΠΟΤΕ μην πληκτρολογήσεις τέτοια φράση με το χέρι.

   ⛔ Μην γράψεις λέξη με το χέρι σε αυτά τα τρία. Ό,τι λέει το ευρετήριο
   πρέπει να είναι μετρήσιμο πάνω στο βιβλίο, αλλιώς η σελίδα λέει ψέματα
   με σιγουριά — που είναι χειρότερο από το να μην τη φτιάξουμε.

   Οι ΕΚΦΩΝΗΣΕΙΣ δεν είναι εδώ: ζουν στο `istoria-themata-themes.js`,
   γιατί εκείνες ΔΕΝ παράγονται — αντιγράφονται από τα πραγματικά θέματα.

   Τρέξιμο:  node tools/istoria-themata-build.js
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT = path.resolve(__dirname, '..');
const IDS = ['a1','a2','b1','b2','b3','b4','b5','b6','b7','b8','b9','b10',
             'g1','g2','g3','g4','g5','g6','g7','g8','g9'];

/* Β.11 «Το εξωελλαδικό ελληνικό κεφάλαιο» λείπει επίτηδες: το
   tools/istoria-unit.js το σημαδεύει ⊘ ΕΚΤΟΣ ΥΛΗΣ. Μια σελίδα που του
   δείχνει εκτός ύλης ενότητα του κλέβει χρόνο που δεν έχει. */

const STOP = new Set(('και με για από ως που η ο το τα οι του της των στο στη στην στον στους στις ή να δεν θα τον την ένα μια μία είναι ήταν αυτό αυτή αυτά αυτές αυτών αυτούς κατά μετά πριν σε επί προς αλλά όμως ενώ όταν οποία οποίο οποίοι οποίων οποίες οποίους πολύ πιο κάθε μόνο περίπου δηλαδή ακόμα ακόμη έτσι είχαν είχε ήδη εκείνη εκείνο χωρίς μέσα έξω πάνω κάτω μεταξύ καθώς λόγω μέχρι μέσω περί υπό παρά ένας πρέπει μπορούσε μπορεί γίνει έγινε τόσο όσο άλλα άλλες άλλο άλλων όλα όλη όλο όλες όλους πολλά πολλές πολλοί πρώτα πρώτη πρώτο πρώτος')
  .split(' ').map(norm));

function norm (s) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
          .replace(/ς/g, 'σ');
}

function unit (id) {
  const out = path.join(os.tmpdir(), 'thi-' + id + '.js');
  execFileSync(process.execPath, [path.join(ROOT, 'tools/istoria-unit.js'), 'k1-' + id, '--out', out],
               { stdio: ['ignore', 'ignore', 'inherit'] });
  const raw = fs.readFileSync(out, 'utf8').replace(/^\/\*[\s\S]*?\*\/\s*/, '').replace(/^\/\*[\s\S]*?\*\/\s*/, '');
  fs.unlinkSync(out);
  return JSON.parse(raw);
}

const units = [], idx = Object.create(null), per = [], para = [];

/* Η πρώτη πρόταση μιας παραγράφου: κόβει στην πρώτη τελεία/άνω τελεία που
   ΔΕΝ είναι μέσα σε αριθμό, συντομογραφία ή παρένθεση χρονολογίας.
   ⚠️ Το αφελές /\./ έσπαγε στο «1821-1830).» και στο «κ.λπ.» — γι' αυτό
   απαιτείται κενό + κεφαλαίο μετά, και ελάχιστο μήκος. */
function firstSentence (p) {
  const m = p.match(/^[\s\S]{40,}?[.;](?=\s+[Α-ΩΆΈΉΊΌΎΏ«])/);
  let t = m ? m[0] : p;
  if (t.length > 210) t = t.slice(0, 207).replace(/\s+\S*$/, '') + '…';
  return t.trim();
}

IDS.forEach((id, k) => {
  const u = unit(id);
  const text = u.paragraphs.join(' ') + ' ' + u.title;
  /* Α.1 / Β.5 / Γ.9 — ίδια γραφή με το βιβλίο και με την κάρτα της
     istoria.html. Ο κωδικός είναι το ΟΝΟΜΑ με το οποίο τα λέει ο Αλεξ. */
  const code = { a: 'Α', b: 'Β', g: 'Γ' }[id[0]] + '.' + id.slice(1);
  units.push({
    id: 'k1-' + id,
    code: code,
    title: u.title,
    par: u.paragraphs.length,
    words: text.split(/\s+/).filter(Boolean).length
  });
  const seen = new Map();
  text.split(/[^A-Za-zΑ-Ωα-ωΆ-ώϊϋΐΰ]+/).forEach(w => {
    if (w.length < 5) return;
    const n = norm(w);
    if (n.length < 5 || STOP.has(n)) return;
    if (!seen.has(n)) seen.set(n, w);
  });
  per.push(seen);
  para.push(u.paragraphs.map(firstSentence));
  seen.forEach((disp, n) => {
    /* ⭐ Το ευρετήριο κρατάει ΜΟΝΟ τον ατονικό τύπο. Ο τονισμένος τύπος
       ζει στο THI_SIG, που είναι το μόνο σημείο που τυπώνει λέξεις — έτσι
       το αρχείο μένει 60KB αντί για 155KB, και ο τόνος δεν χάνεται. */
    if (!idx[n]) idx[n] = [];
    idx[n].push(k);
  });
});

/* τα σημάδια: οι λέξεις που ζουν ΜΟΝΟ σε αυτή την ενότητα. Ταξινομημένα
   κατά μήκος γιατί η μακριά λέξη είναι πιο αναγνωρίσιμη σε εκφώνηση. */
const sig = per.map(seen => {
  const only = [];
  seen.forEach((disp, n) => { if (idx[n].length === 1) only.push(disp); });
  return only.sort((a, b) => b.length - a.length || a.localeCompare(b, 'el')).slice(0, 24);
});

const keys = Object.keys(idx).sort();
const compact = {};
keys.forEach(k => { compact[k] = idx[k]; });

const head = `/* ⚠️ ΠΑΡΑΓΟΜΕΝΟ ΑΡΧΕΙΟ — μην το πειράξεις με το χέρι.
   Ξαναγράφεται με:  node tools/istoria-themata-build.js
   Πηγή: οι ελεγμένες παράγραφοι του βιβλίου (ebooks.edu.gr) μέσω του
   tools/istoria-unit.js. ${units.length} ενότητες εντός ύλης, ${keys.length} λέξεις. */\n`;

fs.writeFileSync(path.join(ROOT, 'istoria-themata-index.js'),
  head +
  'var THI_UNITS=' + JSON.stringify(units) + ';\n' +
  'var THI_IDX=' + JSON.stringify(compact) + ';\n' +
  'var THI_SIG=' + JSON.stringify(sig) + ';\n' +
  'var THI_PARA=' + JSON.stringify(para) + ';\n');

console.log('✓ istoria-themata-index.js — ' + units.length + ' ενότητες, ' + keys.length + ' λέξεις, ' +
            keys.filter(k => idx[k].length === 1).length + ' μοναδικές');
