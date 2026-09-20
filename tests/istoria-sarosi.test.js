/* ══════════════════════════════════════════════════════════════════════
   tests/istoria-sarosi.test.js — Η ΣΑΡΩΣΗ

   ⭐ Η ΔΙΑΦΟΡΑ ΑΠΟ ΤΟΝ ΦΡΟΥΡΟ ΤΟΥ ΓΡΑΠΤΟΥ, ΚΑΙ ΕΙΝΑΙ ΤΟ ΝΟΗΜΑ ΤΗΣ ΣΕΛΙΔΑΣ:
   εκεί το στοιχείο γειωνόταν σε μια ΟΜΑΔΑ παραγράφων· εδώ γειώνεται στη
   ΜΙΑ παράγραφο κάτω από την οποία τυπώνεται. Είναι αυστηρότερο επίτηδες.
   Ο Αλεξ ήρθε εδώ επειδή δεν ξέρει ΠΩΣ ΑΡΧΙΖΕΙ η κάθε παράγραφος και τι
   πάει πού· ένα σωστό σημείο κάτω από λάθος παράγραφο του δίνει ακριβώς
   τη λάθος σειρά — δηλαδή χαλάει το μόνο πράγμα που ήρθε να φτιάξει.

   Δύο έλεγχοι, ο πρώτος απόλυτος:
     Α. ΚΑΘΕ ΑΡΙΘΜΟΣ σημείου υπάρχει αυτούσιος ΣΤΗ ΔΙΚΗ ΤΟΥ παράγραφο.
     Β. ΤΑ 2/3 του λεξιλογίου κάθε σημείου ζουν στη δική του παράγραφο,
        σε σύγκριση ΘΕΜΑΤΟΣ (κόβει ως 3 χαρακτήρες κατάληξης) — αλλιώς η
        ελληνική κλίση βγάζει ψεύτικα σφάλματα (σταθ. 42).
   ⛔ Καμία λίστα εξαιρέσεων: μια λίστα εξαιρέσεων ΕΙΝΑΙ η τρύπα.
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ALS = path.resolve(__dirname, '..');

let pass = 0, fail = 0;
function ok (n, c) { c ? pass++ : fail++; console.log((c ? '  ✓ ' : '  ✗ FAIL ') + n); }
function section (s) { console.log('\n' + s); }

const PAGE = fs.readFileSync(path.join(ALS, 'istoria-sarosi.html'), 'utf8');
const SW   = fs.readFileSync(path.join(ALS, 'sw.js'), 'utf8');
const AID  = fs.readFileSync(path.join(ALS, 'istoria-voithima.html'), 'utf8');
const SRC  = fs.readFileSync(path.join(__dirname, 'istoria-grapto.source.txt'), 'utf8');

const ctx = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(ALS, 'istoria-themata-index.js'), 'utf8'), ctx);
vm.runInContext(fs.readFileSync(path.join(ALS, 'istoria-sarosi-data.js'), 'utf8'), ctx);
const { THI_UNITS, THI_PARA, SW_PTS } = ctx;

const CSS = PAGE.slice(PAGE.indexOf('<style>'), PAGE.indexOf('</style>')).replace(/\/\*[\s\S]*?\*\//g, '');
const JS  = PAGE.slice(PAGE.indexOf('</style>')).replace(/\/\*[\s\S]*?\*\//g, '').replace(/<!--[\s\S]*?-->/g, '');

const BOOK = {};
SRC.split(/\n#####\s+/).slice(1).forEach(b => {
  const code = b.slice(0, b.indexOf(' ')).trim();
  BOOK[code] = {};
  b.split(/\n\[/).slice(1).forEach(p => { BOOK[code][parseInt(p, 10)] = p.slice(p.indexOf(']') + 1).trim(); });
});

const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ς/g, 'σ');
const digits = s => (String(s).match(/\d[\d.,]*/g) || []).map(x => x.replace(/[.,]/g, '')).filter(Boolean);
const STOP = new Set(['ειναι','ηταν','ομωσ','αυτο','αυτη','αυτα','αυτεσ','αυτων','καθε','μονο','παρα','τουσ','των','στο','στη','στην','στον','στουσ','στισ','μετα','πριν','προσ','απο','για','και','που','δεν','ενα','μια','οταν','ενω','οπωσ','ολα','πολυ','περιπου','δηλαδη','ετσι','ηδη','χωρισ','μεσα','κατω','πανω','μεταξυ','καθωσ','λογω','μεχρι','μεσω','ειχε','ειχαν','εγινε','γινει','αλλα','αλλο','αλλη','αλλων','πρωτο','πρωτη','πρωτα','επισησ','τοτε','ορισμοσ','αιτιο','παραγραφοσ']);
function words (s) { return [...new Set(norm(s).split(/[^a-zα-ω0-9]+/).filter(w => w.length >= 6 && !STOP.has(w)))]; }
function stem (w) { return w.slice(0, Math.max(5, w.length - 3)); }

/* ══════════════════ Α · ΤΟ ΣΧΗΜΑ ══════════════════ */
section('Α · κάθε ενότητα, κάθε παράγραφος');

ok('υπάρχουν σημεία για ΟΛΕΣ τις ενότητες εντός ύλης',
   THI_UNITS.every((u, i) => Array.isArray(SW_PTS[i])));
const wrong = THI_UNITS.map((u, i) => (SW_PTS[i] || []).length === THI_PARA[i].length ? null :
   u.code + ': ' + (SW_PTS[i] || []).length + ' αντί ' + THI_PARA[i].length).filter(Boolean);
ok('κάθε ενότητα έχει ΑΚΡΙΒΩΣ όσες ομάδες σημείων και παραγράφους' +
   (wrong.length ? ' — ' + wrong.join(', ') : ''), wrong.length === 0);
ok('καμία παράγραφος δεν μένει χωρίς σημεία',
   THI_UNITS.every((u, i) => (SW_PTS[i] || []).every(g => Array.isArray(g) && g.length >= 1)));

/* ══════════════════ Β · Η ΓΕΙΩΣΗ, ΑΝΑ ΠΑΡΑΓΡΑΦΟ ══════════════════ */
section('Β · κάθε σημείο πατάει στη ΔΙΚΗ ΤΟΥ παράγραφο');

let badNum = [], nNum = 0, weak = [], nPt = 0;
THI_UNITS.forEach((u, i) => {
  (SW_PTS[i] || []).forEach((group, pi) => {
    const par = (BOOK[u.code] || {})[pi + 1] || '';
    const have = new Set(digits(par));
    const text = norm(par);
    group.forEach(pt => {
      nPt++;
      digits(pt).forEach(d => { nNum++; if (!have.has(d)) badNum.push(u.code + ' π' + (pi + 1) + ' → ' + d); });
      const w = words(pt);
      if (w.length < 3) return;
      const hit = w.filter(x => text.indexOf(stem(x)) !== -1).length;
      if (hit / w.length < 0.66) weak.push(u.code + ' π' + (pi + 1) + ' ' + Math.round(hit / w.length * 100) + '% «' + pt.slice(0, 64) + '»');
    });
  });
});
ok('κανένας αριθμός εκτός της παραγράφου του (' + nNum + ' ελέγχθηκαν)' +
   (badNum.length ? '\n      ' + badNum.slice(0, 14).join('\n      ') : ''), badNum.length === 0);
ok('κάθε σημείο ≥66% λεξιλόγιο στη δική του παράγραφο (' + nPt + ' σημεία)' +
   (weak.length ? '\n      ' + weak.slice(0, 14).join('\n      ') : ''), weak.length === 0);
ok('ο έλεγχος ΜΠΟΡΕΙ να αποτύχει (αρνητικό δείγμα)',
   !new Set(digits((BOOK['Γ.8'] || {})[1] || '')).has('4444'));

/* ══════════════════ Γ · Η ΣΕΛΙΔΑ ══════════════════ */
section('Γ · η σελίδα');
ok('φορτώνει τα δεδομένα', /src="istoria-themata-index\.js"/.test(PAGE) && /src="istoria-sarosi-data\.js"/.test(PAGE));
ok('τυπώνει τις αρχές των παραγράφων από το βιβλίο', /THI_PARA/.test(JS));
ok('⛔ ΚΑΜΙΑ topbar.js', !/topbar\.js/.test(PAGE.replace(/<!--[\s\S]*?-->/g, '')));
ok('⛔ ΚΑΝΕΝΑ sync.js', !/sync\.js/.test(PAGE.replace(/<!--[\s\S]*?-->/g, '')));
ok('⛔ κανένα @media (min-width)', !/@media[^{]*min-width/.test(CSS));
const back = PAGE.indexOf('class="back top"'), body = PAGE.indexOf('id="units"');
ok('ο δρόμος πίσω είναι ΠΑΝΩ-ΠΑΝΩ', back > 0 && body > 0 && back < body);
ok('υπάρχει πλοήγηση ΟΛΩΝ των ενοτήτων για γρήγορο πήδημα', /id="jump"/.test(PAGE));

section('Δ · offline + ο δρόμος');
['istoria-sarosi.html', 'istoria-sarosi-data.js'].forEach(f =>
  ok('το sw.js προφορτώνει ' + f, SW.indexOf("'" + f + "'") !== -1));
ok('υπάρχει δρόμος από την ΑΡΧΙΚΗ του βοηθήματος', /href="istoria-sarosi\.html"/.test(AID));

console.log('\n' + (fail ? '✗ ' : '✓ ') + pass + ' πέρασαν · ' + fail + ' απέτυχαν');
process.exit(fail ? 1 : 0);
