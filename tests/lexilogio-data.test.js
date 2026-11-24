/* ══════════════════════════════════════════════════════════════════════
   tests/lexilogio-data.test.js — Η ΔΕΥΤΕΡΗ ΑΝΕΞΑΡΤΗΤΗ ΜΕΤΑΓΡΑΦΗ (kit §7.2)

   Η σελ. 170 του φυλλαδίου του Πυθαγόρα ΜΕΤΑΓΡΑΜΜΕΝΗ ΞΑΝΑ ΑΠΟ ΤΗ ΦΩΤΟΓΡΑΦΙΑ
   (IMG_3623.jpeg), ΟΠΩΣ ΕΙΝΑΙ ΤΥΠΩΜΕΝΗ — με τα τυπογραφικά της. ⛔ ΜΗΝ την
   παράγεις ποτέ από το data/lexilogio.json: τότε συμφωνεί με κάθε λάθος του.

   Οι διαφορές ανάμεσα στο τυπωμένο και στο `front` είναι ΔΗΛΩΜΕΝΕΣ μία-μία
   στο FIXED, και η καθεμία ΠΡΕΠΕΙ να έχει δικό της `note` στην κάρτα — ώστε
   ο Αλεξ να ξέρει κάθε σημείο όπου η σελίδα του λέει άλλο από το φυλλάδιο.
   Το `back` είναι αυτολεξεί: ΚΑΜΙΑ διαφορά επιτρεπτή.

   ⚠️ Το kit δήλωνε 4 διαφορές. Η μεταγραφή αυτή βρήκε ΑΚΟΜΗ 4 που δεν είχαν
   σημείωση (οξεία→βαρεία ×2, «και»→«καὶ», «είς»→«εἰς»). Οι διορθώσεις είναι
   σωστές, αλλά ήταν σιωπηλές — τώρα έχουν `note` και τις κλειδώνει αυτό το test.
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const ROOT = path.resolve(__dirname, '..');
let P = 0, F = 0;
const ok = (n, c, x) => { c ? P++ : F++; console.log((c ? '  ✓ ' : '  ✗ FAIL ') + n + (c ? '' : '   ' + JSON.stringify(x === undefined ? null : x))); };
const N = s => String(s).normalize('NFC');

/* ── Η ΦΩΤΟΓΡΑΦΙΑ, ΣΤΗΛΗ-ΣΤΗΛΗ, ΟΠΩΣ ΤΥΠΩΝΕΤΑΙ ─────────────────────── */
const PRINTED = [
  ['ἄβατος', 'απαραβίαστος'], ['ἀβέλτερος', 'ανόητος'], ['ἀβίωτος', 'ανυπόφορος'],
  ['ἀβοητί', 'χωρίς βοή'], ['ἀβουλία', 'έλλειψη σκέψης'], ['ἄβουλος', 'απερίσκεπτος'],
  ['ἀβρός', 'χαριτωμένος'], ['ἀγαθός', 'καλός, ανδρείος'],
  ['ἀγαθά φρονῶ', 'έχω καλά αισθήματα'], ['ἀγαθά πάσχω', 'ευεργετούμαι'],
  ['ἄγαμαι', 'θαυμάζω, επαινώ'], ['ἄγαν', 'πολύ'], ['ἀγαπῶ τινί', 'αρκούμαι σε κάτι'],
  ['ἀγγέλλω', 'αναγγέλλω'], ['ἄγγελος', 'αγγελιαφόρος'], ['ἀγνώμων', 'απερίσκεπτος'],
  ['ἀγορεύω', 'δημηγορώ, μιλάω σε δίκη/συνέλευση'], ['κακῶς ἀγορεύω', 'κακολογώ'],
  ['ἀγχίνοια', 'ευστροφία'], ['ἄγω', 'οδηγώ, φέρω'], ['ἄγω εἰρήνην', 'έχω ειρήνη'],
  ['ἄγω ἡσυχίαν', 'καθησυχάζω'], ['ἄγω και φέρω', 'λεηλατώ'],
  ['ἄγω είς δίκην', 'σύρω στο δικαστήριο'], ['ἄγομαι φόνου', 'κατηγορούμαι για φόνο'],
  // δεύτερη στήλη
  ['ἀγών', 'δικαστικός αγώνας'], ['καθίστημι τινά είς ἀγῶνα', 'εμπλέκω κάποιον σε δίκη'],
  ['ἄδηλος', 'αφανής'], ['Ἀθήναζε', 'προς την Αθήνα'], ['Ἀθήνησι', 'στην Αθήνα'],
  ['Ἀθήναθεν', 'από την Αθήνα'], ['ἀθρόος', 'συγκεντρωμένος, πυκνός'],
  ['αἰδοῦμαι', 'ντρέπομαι, σέβομαι'], ['αἰδώς', 'ντροπή'], ['αἰκισμός', 'κακοποίηση, βασανισμός'],
  ['αἰνίττομαι', 'μιλώ αινιγματικά, υπονοώ'], ['αἵρεσις', 'άλωση (πόλης), εκλογή, προτίμηση'],
  ['αἱρῶ', 'συλλαμβάνω, κυριεύω'], ['αἱροῦμαι', 'εκλέγω, προτιμώ'],
  ['αἴρω', 'υψώνω, μεταφέρω, απομακρύνω'], ['αἴρω τεῖχος', 'υψώνω τείχος'],
  ['αἴρω ναῦς', 'απομακρύνω τα πλοία'], ['αἴρω ταῖς ναυσί', 'αποπλέω'],
  ['αἴρω τῷ στρατῷ', 'ξεκινώ με το στρατό'], ['αἴρομαι κίνδυνον', 'αναλαμβάνω κίνδυνο'],
  ['αἰσχύνη', 'ντροπή'], ['αἰσχύνω', 'ντροπιάζω'], ['αἰσχύνομαι', 'ντρέπομαι, σέβομαι'],
  ['αἰτῶ, αἰτοῦμαι', 'ζητώ, παρακαλώ'], ['αἰτία', 'κατηγορία']
].map(([f, b]) => [N(f), N(b)]);

/* ── ΟΙ ΔΗΛΩΜΕΝΕΣ ΔΙΑΦΟΡΕΣ: τυπωμένο → `front` ─────────────────────── */
const FIXED = {
  'ἀβρός': 'ἁβρός',                                   // δασεία (kit §5)
  'ἀγαπῶ τινί': 'ἀγαπῶ τινι',                          // εγκλιτικό μετά από περισπωμένη (kit §5)
  'καθίστημι τινά είς ἀγῶνα': 'καθίστημί τινα εἰς ἀγῶνα', // εγκλιτικό + προκλιτικό (kit §5 + εδώ)
  'Ἀθήναθεν': 'Ἀθήνηθεν',                             // αττικός τύπος (kit §5)
  'ἀγαθά φρονῶ': 'ἀγαθὰ φρονῶ',                        // βαρεία μέσα σε φράση (ΝΕΟ)
  'ἀγαθά πάσχω': 'ἀγαθὰ πάσχω',                        // βαρεία μέσα σε φράση (ΝΕΟ)
  'ἄγω και φέρω': 'ἄγω καὶ φέρω',                      // πολυτονικό «καὶ» (ΝΕΟ)
  'ἄγω είς δίκην': 'ἄγω εἰς δίκην'                     // προκλιτικό, άτονο (ΝΕΟ)
};
const FX = {}; Object.keys(FIXED).forEach(k => { FX[N(k)] = N(FIXED[k]); });

const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/lexilogio.json'), 'utf8'));
const page = data.pages.find(p => p.id === 'p170');
const cards = page ? page.cards : [];

console.log('\nΑ · ΔΥΟ ΜΕΤΑΓΡΑΦΕΣ, ΛΕΞΗ ΠΡΟΣ ΛΕΞΗ');
ok('η σελίδα p170 υπάρχει, φυλλάδιο σ. 170, Σελίδα 1', !!page && page.bookPage === 170 && page.n === 1);
ok('50 λέξεις και στις δύο μεταγραφές', PRINTED.length === 50 && cards.length === 50, { printed: PRINTED.length, data: cards.length });
PRINTED.forEach(([f, b], i) => {
  const c = cards[i] || {}, want = FX[f] || f;
  ok(`#${i + 1} ${f}${FX[f] ? ' → ' + want : ''}`, c.front === want && c.back === b, { front: c.front, back: c.back });
});

console.log('\nΒ · ΚΑΘΕ ΔΙΟΡΘΩΣΗ ΕΙΝΑΙ ΔΗΛΩΜΕΝΗ');
Object.keys(FX).forEach(printed => {
  const c = cards.find(k => k.front === FX[printed]);
  ok(`«${printed}» → «${FX[printed]}» έχει σημείωση`, !!(c && c.note && c.note.length > 20), c && c.note);
  ok(`…και η σημείωση λέει τι τυπώνει το φυλλάδιο ή τι αλλάζει`, !!(c && c.note && /φυλλάδιο|φωτογραφία/.test(c.note)), c && c.note);
});
const fixedFronts = new Set(Object.values(FX));
const extra = cards.filter(c => c.note && !fixedFronts.has(c.front));
ok('καμία άλλη κάρτα δεν φοράει σημείωση διόρθωσης', extra.length === 0, extra.map(c => c.front));

console.log('\nΓ · ΣΧΗΜΑ');
ok('όλα σε NFC (front, back, hook, trap, note)', cards.every(c => ['front', 'back', 'hook', 'trap', 'note'].every(k => c[k] == null || c[k] === c[k].normalize('NFC'))));
ok('ids μοναδικά, μορφή s170-<στήλη>-<αα>', new Set(cards.map(c => c.id)).size === 50 && cards.every(c => /^s170-[12]-\d\d$/.test(c.id)));
ok('καμία ΟΞΕΙΑ-OXIA (U+1F71…) — μόνο tonos μετά το NFC', !cards.some(c => /[άέήίόύώ]/.test(c.front + c.back)));

console.log('\nΕ · ΣΕΛΙΔΕΣ 171–173 (από το extra στο data/, als-v627, ΙΔΙΑ ids)');
/* Μεταγράφηκαν από φωτογραφία, μία-μία, και μπήκαν πρώτα στο S.extra του
   Αλεξ με αυτά ακριβώς τα ids· αν άλλαζε ένα id, η πρόοδός του θα χανόταν. */
const LATER = { p171: [2, 171, 50, 8], p172: [3, 172, 50, 7], p173: [4, 173, 52, 11], p174: [5, 174, 49, 5], p175: [6, 175, 52, 14], p176: [7, 176, 50, 9], p177: [8, 177, 50, 7], p178: [9, 178, 50, 9], p179: [10, 179, 51, 5], p180: [11, 180, 30, 5] };
Object.keys(LATER).forEach(id => {
  const [n, bp, len, notes] = LATER[id], pg = data.pages.find(p => p.id === id), cs = pg ? pg.cards : [];
  ok(`${id}: Σελίδα ${n}, φυλλάδιο σ. ${bp}, ${len} λέξεις`, !!pg && pg.n === n && pg.bookPage === bp && cs.length === len, pg && { n: pg.n, bp: pg.bookPage, len: cs.length });
  ok(`${id}: ids s${bp}-<στήλη>-<αα>, κάθε κάρτα έχει front/back/family`, cs.every(c => new RegExp('^s' + bp + '-[12]-\\d\\d$').test(c.id) && c.front && c.back && c.family));
  ok(`${id}: NFC, καμία OXIA`, cs.every(c => ['front', 'back', 'hook', 'trap', 'note'].every(k => c[k] == null || c[k] === c[k].normalize('NFC'))) && !cs.some(c => /[\u1F71\u1F73\u1F75\u1F77\u1F79\u1F7B\u1F7D]/.test(c.front + c.back)));
  const ns = cs.filter(c => c.note);
  ok(`${id}: ${notes} δηλωμένες διορθώσεις, καθεμία λέει τι τυπώνει το φυλλάδιο ή η φωτογραφία`, ns.length === notes && ns.every(c => /φυλλάδιο|φωτογραφία/.test(c.note)), ns.length);
});
const allIds = data.pages.flatMap(p => [p.id].concat(p.cards.map(c => c.id)));
ok('κανένα διπλό id σε όλο το αρχείο', new Set(allIds).size === allIds.length);
ok('οι σελίδες είναι 1–11 στη σειρά', data.pages.map(p => p.n).join() === '1,2,3,4,5,6,7,8,9,10,11');
const eik = (data.pages.find(p => p.id === 'p174') || { cards: [] }).cards.find(c => c.id === 's174-1-10');
ok('p174: η υποσημείωση 25 (εἰκός ← ἔοικα) ζει στο hook του «εἰκός ἐστι», αυτολεξεί', !!eik && eik.front === 'εἰκός ἐστι' && eik.hook.includes('εἰκός = μετοχή ΠΡΚ του ἔοικα (παρακείμενος με σημασία ΕΝΣ) που σημαίνει «μοιάζω», «φαίνομαι».') && eik.hook.includes('ΑΠΡ: ἐοικέναι/εἰκέναι, ΥΠΤ: ἐοίκω, ΕΥΚ: ἐοίκοιμι.'), eik && eik.hook);
const later = crypto.createHash('sha256').update(JSON.stringify(data.pages.filter(p => LATER[p.id]))).digest('hex');
ok('περιεχόμενο 171–180 κλειδωμένο (sha256) — νόμιμη αλλαγή = νέος αριθμός στο ΙΔΙΟ commit', later === 'dfce6f3b87c78395e2ede23adb84434421a038f3c5c75eac4698d5fb17dbe3f7', later.slice(0, 12));

console.log('\nΔ · Ο CORE ΕΙΝΑΙ ΤΟΥ KIT, ΑΥΤΟΥΣΙΟΣ');
const sha = crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT, 'lexilogio-core.js'))).digest('hex');
ok('lexilogio-core.js = core.js του kit, byte προς byte (sha256)', sha === '0449b70213b6d5440c7331b8881be534a1889c2e3a619ab4dce12c9c5977c3d9', sha.slice(0, 12));

console.log('\nΣΤ · ΟΙ ΕΝΟΤΗΤΕΣ (data/lexilogio-units.json, als-v780)');
/* Μόνο ομαδοποίηση: ids που δείχνουν στο data/lexilogio.json. Οι κανόνες είναι
   δικοί του (24/11): κάθε λέξη ΑΚΡΙΒΩΣ μία φορά · μια οικογένεια ΠΟΤΕ σε δύο
   ενότητες (οι «Μεμονωμένες» δεν είναι ρίζα, μοιράζονται σε θέματα) · 20–30
   λέξεις. Τα «δίδυμα» είναι κρίση ανάγνωσης, άρα κλειδώνονται ΟΝΟΜΑΣΤΙΚΑ. */
let U = null;
try { U = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/lexilogio-units.json'), 'utf8')); } catch (e) { ok('το data/lexilogio-units.json διαβάζεται', false, String(e.message)); }
if (U) {
  const units = Array.isArray(U.units) ? U.units : [];
  const byId = {}; data.pages.forEach(p => p.cards.forEach(c => { byId[c.id] = c; }));
  const all = units.flatMap(u => u.ids || []);
  ok(`${units.length} ενότητες (περίπου 20)`, units.length >= 18 && units.length <= 24, units.length);
  ok('και οι 534 λέξεις μπαίνουν: ' + new Set(all).size + '/' + Object.keys(byId).length, Object.keys(byId).length === 534 && Object.keys(byId).every(id => all.includes(id)), Object.keys(byId).filter(id => !all.includes(id)));
  ok('κανένα διπλό id (' + all.length + ' εγγραφές)', all.length === new Set(all).size, all.filter((id, i) => all.indexOf(id) !== i));
  ok('κανένα ανύπαρκτο id', all.every(id => byId[id]), all.filter(id => !byId[id]));
  const famUnit = {}, broken = new Set();
  units.forEach(u => (u.ids || []).forEach(id => { const f = byId[id] && byId[id].family; if (!f || f === 'Μεμονωμένες') return; if (famUnit[f] && famUnit[f] !== u.id) broken.add(f); famUnit[f] = famUnit[f] || u.id; }));
  ok('καμία οικογένεια σπασμένη σε δύο ενότητες (εκτός «Μεμονωμένες»)', broken.size === 0, [...broken]);
  units.forEach(u => ok(`${u.id} «${u.title}»: ${(u.ids || []).length} λέξεις (20–30)`, (u.ids || []).length >= 20 && (u.ids || []).length <= 30, (u.ids || []).length));
  ok('ids u01…, αριθμοί 1…N στη σειρά', units.every((u, i) => u.id === 'u' + String(i + 1).padStart(2, '0') && u.n === i + 1));
  ok('τίτλοι μοναδικοί, μη κενοί, NFC', new Set(units.map(u => u.title)).size === units.length && units.every(u => typeof u.title === 'string' && u.title.trim().length > 5 && u.title === u.title.normalize('NFC')));
  const unitOfFront = f => { const c = Object.values(byId).find(k => k.front === f); return c && units.find(u => u.ids.includes(c.id)); };
  const together = [['ἵημι', 'ἵστημι'], ['αἴρω', 'αἱρῶ'], ['ἑκών', 'ἄκων'], ['εἰμί', 'εἶμι'], ['ἥκω', 'οἴχομαι'], ['μέλλω', 'μέλω'], ['σπονδή', 'σπουδή'], ['ἄκρατος', 'ἀκρατής'], ['ἔθος', 'εὐήθης'], ['εὖ ποιῶ', 'εὖ πάσχω'], ['εὖ λέγω', 'εὖ ἀκούω'], ['γιγνώσκω', 'παραγίγνομαι'], ['λανθάνω', 'λαγχάνω'], ['ἀποκάμνω', 'ἀπαυδῶ'], ['πιπράσκω', 'ὠνοῦμαι'], ['ἀβουλία', 'εὐβουλία'], ['οἰμωγή (από το οἰμώζω)', 'κλαυθμός'], ['ἀνάντης', 'ἀνωφερής'], ['ἀγαπῶ τινι', 'στέργω']];
  together.forEach(([a, b]) => { const ua = unitOfFront(a), ub = unitOfFront(b); ok(`«${a}» και «${b}» στην ΙΔΙΑ ενότητα`, !!ua && ua === ub, [ua && ua.id, ub && ub.id]); });
  const sizes = units.map(u => u.ids.reduce((m, id) => { const f = byId[id].family; m[f] = (m[f] || 0) + 1; return m; }, {}));
  ok('οι 4 πρώτες ενότητες ξεκινούν από τις μεγάλες ρίζες (εἰμί · ἵστημι · ἄγω · γιγνώσκω)', ['εἰμί', 'ἵστημι', 'ἄγω', 'γιγνώσκω'].every((f, i) => byId[units[i].ids[0]].family === f));
  ok('οι 3 τελευταίες είναι θέματα από μικρές οικογένειες (καμία οικογένεια > 3 λέξεις)', sizes.slice(-3).every(m => Object.keys(m).every(f => { const tot = Object.values(byId).filter(c => c.family === f).length; return f === 'Μεμονωμένες' || tot <= 3; })));
}

console.log('\nlexilogio-data: ' + P + ' πέρασαν, ' + F + ' έπεσαν');
process.exit(F ? 1 : 0);
