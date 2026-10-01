/* ══════════════════════════════════════════════════════════════════════
   tests/latinika-lectio.test.js — ΟΙ ΤΡΕΙΣ ΕΝΟΤΗΤΕΣ ΤΩΝ ΛΑΤΙΝΙΚΩΝ

   als-v502. Δική του εντολή, 22/08/26: «πρόσθεσε αυτές τις δύο μεταφράσεις
   ΟΠΩΣ ΕΙΝΑΙ ΑΚΡΙΒΩΣ … και σβήσε αυτό με τις κλίσεις που έχει μέσα».
   Η `latinika.html` έπαψε να είναι μηχανή κλίσεων και έγινε ΒΙΒΛΙΟΘΗΚΗ.

   Άρα αυτό το test φυλάει τέσσερα πράγματα:

     1. ⭐ ΤΑ ΔΥΟ ΠΑΚΕΤΑ, ΜΕ HASH. Μπήκαν αυτούσια· η ΜΟΝΗ επιτρεπτή διαφορά
        είναι η μία γραμμή «← Λατινικά». Ίδιο σχήμα εγγύησης με το
        tests/arxaia-gnosto.test.js §9 — και εκεί ήταν που αποδείχθηκε ότι
        χρειάζεται: ένα «μικρό φτιάξιμο» μέσα σε δικό του κείμενο δεν
        φαίνεται πουθενά αλλού.
     2. ⭐⭐ ΤΑ ΝΟΥΜΕΡΑ ΤΗΣ ΒΙΒΛΙΟΘΗΚΗΣ ΕΙΝΑΙ ΜΕΤΡΗΜΕΝΑ, ΟΧΙ ΓΡΑΜΜΕΝΑ ΜΕ ΤΟ
        ΜΑΤΙ. «16 προτάσεις», «11 ενότητες», «5 παγίδες» — καθένα από αυτά
        διαβάζεται από ΤΟ ΙΔΙΟ ΤΟ ΠΑΚΕΤΟ και συγκρίνεται με ό,τι λέει η
        κάρτα. (Στα Αρχαία τα είχα γράψει με το μάτι και ο Πλάτων ήταν
        λάθος — σταθ. 33: κανένα επινοημένο νούμερο.)
     3. ⛔ ΟΤΙ Η ΜΗΧΑΝΗ ΚΛΙΣΕΩΝ ΕΦΥΓΕ ΑΠΟ ΤΗ ΣΕΛΙΔΑ ΑΛΛΑ ΟΧΙ ΑΠΟ ΤΟ REPO.
        Το `lat:v1` συγχρονίζεται ακόμη, το `latin-engine.js` ζει, και
        ολόκληρη η παλιά σελίδα σώζεται στο `archive/latinika-drill.html`.
        «Σβήστηκε από τη σελίδα» και «χάθηκε» είναι δύο διαφορετικά πράγματα.
     4. ⭐⭐ ΤΟ XVIII ΚΛΕΙΔΩΝΕΤΑΙ ΜΕ ΑΛΛΟ ΤΡΟΠΟ (als-v516). Τα XVI/XVII τα
        ΕΣΤΕΙΛΕ έτοιμα, άρα τα φυλάει sha256. Το XVIII το έγραψα ΕΓΩ από τη
        φωτογραφία της σελ. 27 του φυλλαδίου — ένα sha256 πάνω σε δικό μου
        αρχείο δεν εγγυάται τίποτα, θα συμφωνούσε με κάθε λάθος μου τέλεια.
        Άρα παίρνει τη ΓΕΙΩΣΗ της Ιστορίας και των Αρχαίων: το λατινικό
        κείμενο του βιβλίου ζει ΧΩΡΙΣΤΑ στο tests/latinika-lectio18.source.txt
        (curl στο ebooks.edu.gr) και το test απαιτεί οι 11 ενότητες, ενωμένες,
        να το δίνουν ΑΥΤΟΛΕΞΕΙ — με ΔΥΟ δηλωμένες αποκλίσεις και καμία τρίτη.
     4γ. ⭐⭐ ΚΑΙ ΤΟ XXII ΤΟ ΙΔΙΟ (als-v578) — με ΔΥΟ διαφορές που μετράνε.
        (α) Το Β΄ ΤΕΥΧΟΣ ΕΙΝΑΙ ΑΛΛΟ ΒΙΒΛΙΟ: το Α΄ σταματάει στο XX, και το
        `index22.htm` της παλιάς διεύθυνσης γυρίζει **404 με κανονική
        σελίδα** — ένα curl χωρίς έλεγχο κωδικού θα κατέβαζε το μενού του
        αποθετηρίου και θα το περνούσε για βιβλίο. Η XXII ζει στο
        `8547/2708/…/indexB_22.html`.
        (β) ⭐ ΜΙΑ ΜΟΝΟ δηλωμένη απόκλιση, όχι δύο: οι δέκα αστερίσκοι.
        Τυπογραφικό ΔΕΝ ΒΡΕΘΗΚΕ — και αυτό το λέει το test ΘΕΤΙΚΑ, γιατί
        μετά από «proximan» (XVIII) και «coniuārvit» (XIX) το «δεν βρήκα»
        πρέπει να είναι εύρημα, όχι παράλειψη.
     4β. ⭐⭐ ΚΑΙ ΤΟ XIX ΤΟ ΙΔΙΟ (als-v535). Ούτε αυτό ήρθε ως αρχείο του:
        η φωτογραφία του φυλλαδίου έδωσε τη ΜΕΤΑΦΡΑΣΗ και το ΣΥΝΤΑΚΤΙΚΟ, το
        ebooks.edu.gr (index19.htm) το ΛΑΤΙΝΙΚΟ. Ίδια γείωση, δικό του
        source.txt, ΔΥΟ δηλωμένες αποκλίσεις — και η δεύτερη είναι ξανά
        τυπογραφικό ΤΟΥ ΒΙΒΛΙΟΥ («coniuārvit», αντιμετάθεση δύο χαρακτήρων).
     5. ⛔ ΟΤΙ ΤΑ ΚΛΕΙΔΙΑ ΤΩΝ ΕΝΟΤΗΤΩΝ ΔΕΝ ΣΥΓΧΡΟΝΙΖΟΝΤΑΙ. Το `lectio16:v1`
        είναι ΠΙΝΑΚΑΣ ΑΠΟ ΠΡΩΤΟΓΟΝΑ: πέφτει στο `allPrim` του mergeArray και
        ΕΝΩΝΕΤΑΙ. Αν έμπαινε στο sync, το «μηδένισε» θα γύριζε πίσω από την
        άλλη συσκευή σαν να μην έγινε ποτέ (σταθ. 31).
   ══════════════════════════════════════════════════════════════════════ */
'use strict';

var fs = require('fs');
var vm = require('vm');
var path = require('path');
var crypto = require('crypto');

var ALS = path.join(__dirname, '..');
var R = function (f) { return fs.readFileSync(path.join(ALS, f), 'utf8'); };

/* ⭐ ΤΑ ΔΥΟ ΠΑΚΕΤΑ, ΜΕ ΤΟ ΑΠΟΤΥΠΩΜΑ ΤΟΥΣ.
   Το `sha` είναι το sha256 του αρχείου ΧΩΡΙΣ τη γραμμή «← Λατινικά».
   ⭐ ΤΟ 8596fc… ΤΟΥ XVII ΔΕΝ ΕΙΝΑΙ ΑΠΛΩΣ ΕΝΑ HASH: είναι, byte προς byte,
   το hash ΤΟΥ ΑΡΧΕΙΟΥ ΠΟΥ ΕΣΤΕΙΛΕ (~/Downloads/lectio17_1.html). Δηλαδή η
   απόδειξη ότι η μοναδική διαφορά είναι όντως η μία γραμμή επιστροφής. */
var PACKS = [
  { id: '16', file: 'latinika-lectio16.html', v: 'SC', sha: 'cae5f04d02391cd44411d5634591aa553faf65d2e74cef0304810b7487725c5c' },
  { id: '17', file: 'latinika-lectio17.html', v: 'S',  sha: '8596fc903d1a2a4e54f5cb569530f9b7a5168568721fe9bb1d5dc5869c36ddbd' },
  /* ⛔ ΧΩΡΙΣ sha ΕΠΙΤΗΔΕΣ. Το XVIII δεν ήρθε ως αρχείο του — γράφτηκε εδώ.
     Το φυλάει το §2β, που το συγκρίνει με ΤΟ ΒΙΒΛΙΟ, όχι με τον εαυτό του. */
  { id: '18', file: 'latinika-lectio18.html', v: 'S' },
  /* ⛔ ΚΑΙ ΤΟ XIX ΧΩΡΙΣ sha, ΓΙΑ ΤΟΝ ΙΔΙΟ ΛΟΓΟ. Το φυλάει το §2γ. */
  { id: '19', file: 'latinika-lectio19.html', v: 'S' },
  /* ⛔ ΚΑΙ ΤΟ XXII. Το φυλάει το §2δ. */
  { id: '22', file: 'latinika-lectio22.html', v: 'S' }
];

var pass = 0, fail = 0, sect = '';
function section(t) { sect = t; console.log('\n── ' + t); }
function ok(cond, msg) { if (cond) pass++; else { fail++; console.error('  ✗ ' + msg); } }
function eq(a, b, msg) { ok(a === b, msg + '\n      περίμενα: ' + b + '\n      πήρα:     ' + a); }

/* Διαβάζει τον πίνακα δεδομένων ΑΠΟ ΤΟ ΖΩΝΤΑΝΟ ΑΡΧΕΙΟ, χωρίς DOM. Ο μόνος
   τρόπος να μετρήσεις κάτι χωρίς να το ξαναγράψεις κάπου αλλού. */
function data(file, name) {
  var src = R(file);
  var start = src.indexOf('const ' + name + ' = [');
  var end = src.indexOf('\n];', start);
  ok(start > 0 && end > start, file + ': βρέθηκε ο πίνακας ' + name);
  var ctx = {};
  vm.createContext(ctx);
  vm.runInContext('var ' + src.slice(start + 6, end + 3), ctx);
  return ctx[name];
}

/* ══ 1 · ΤΑ ΠΑΚΕΤΑ ΜΠΗΚΑΝ ΑΥΤΟΥΣΙΑ ═══════════════════════════════════ */
section('1 · τα πέντε πακέτα (τα δύο δικά του, με hash)');

PACKS.forEach(function (pk) {
  var abs = path.join(ALS, pk.file);
  if (!fs.existsSync(abs)) { ok(false, 'λείπει το πακέτο ' + pk.file); return; }
  var raw = R(pk.file);

  var backs = raw.split('\n').filter(function (l) { return l.indexOf('href="latinika.html"') >= 0; });
  eq(backs.length, 1, pk.file + ': ακριβώς μία γραμμή επιστροφής «← Λατινικά»');

  var stripped = raw.split('\n').filter(function (l) { return l.indexOf('href="latinika.html"') < 0; }).join('\n');
  if (pk.sha) eq(crypto.createHash('sha256').update(stripped, 'utf8').digest('hex'), pk.sha,
    '⛔ ΤΟ ΠΑΚΕΤΟ ' + pk.file + ' ΑΛΛΑΞΕ. Μπήκε αυτούσιο κατόπιν ρητής εντολής\n' +
    '      («όπως είναι ακριβώς»). Αν η αλλαγή είναι σκόπιμη, ΑΥΤΟΣ είναι ο νέος\n' +
    '      hash — και θέλει τη δική του κουβέντα μαζί του, όχι σιωπηλό update.');

  ok(/<html lang="el">/.test(raw), pk.file + ': είναι αυτοτελής σελίδα στα ελληνικά');
  ok(/<meta charset="UTF-8">|<meta charset="utf-8">/i.test(raw), pk.file + ': δηλώνει UTF-8 — τα ελληνικά δεν γίνονται mojibake');
  ok(R('sw.js').indexOf("'" + pk.file + "'") > 0, pk.file + ': είναι στο SW CORE — αλλιώς πεθαίνει offline');
});

/* ══ 2 · ΤΑ ΔΕΔΟΜΕΝΑ ΤΩΝ ΜΑΘΗΜΑΤΩΝ ═══════════════════════════════════ */
section('2 · τα κείμενα στέκουν μόνα τους');

var SC = data('latinika-lectio16.html', 'SC');
var S17 = data('latinika-lectio17.html', 'S');
var S18 = data('latinika-lectio18.html', 'S');
var S19 = data('latinika-lectio19.html', 'S');
var S22 = data('latinika-lectio22.html', 'S');

var n16 = SC.reduce(function (a, s) { return a + s.s.length; }, 0);
var n17 = S17.reduce(function (a, s) { return a + s.s.length; }, 0);
var n18 = S18.reduce(function (a, s) { return a + s.s.length; }, 0);
var n19 = S19.reduce(function (a, s) { return a + s.s.length; }, 0);
var n22 = S22.reduce(function (a, s) { return a + s.s.length; }, 0);
eq(SC.length, 3, 'XVI: τρεις σκηνές');
eq(n16, 16, 'XVI: δεκαέξι προτάσεις');
eq(S17.length, 3, 'XVII: τρεις σκηνές');
eq(n17, 11, 'XVII: έντεκα ενότητες');
eq(S18.length, 3, 'XVIII: τρεις σκηνές');
eq(n18, 11, 'XVIII: έντεκα ενότητες');
eq(S19.length, 3, 'XIX: τρεις σκηνές');
eq(n19, 10, 'XIX: δέκα ενότητες');
eq(S22.length, 3, 'XXII: τρεις σκηνές');
eq(n22, 11, 'XXII: έντεκα ενότητες');

/* ⚠️ Το `o` είναι η ΕΛΛΗΝΙΚΗ ΣΕΙΡΑ των ίδιων κομματιών. Αν δεν είναι
   μετάθεση των δεικτών, η μετάφραση χάνει ή διπλασιάζει ένα κομμάτι
   ΣΙΩΠΗΛΑ — τίποτα δεν σκάει, απλώς λείπει μια λέξη από τα ελληνικά. */
SC.forEach(function (sc) {
  sc.s.forEach(function (sn, i) {
    var tag = 'XVI ' + sc.n + '/' + (i + 1);
    sn.c.forEach(function (c, k) {
      ok(!!c.la && !!c.el && !!c.t, tag + ' κομμάτι ' + k + ': έχει λατινικά, ελληνικά ΚΑΙ σημείωση');
    });
    if (!sn.o) return;
    eq(sn.o.length, sn.c.length, tag + ': το `o` καλύπτει όλα τα κομμάτια');
    var srt = sn.o.slice().sort(function (a, b) { return a - b; });
    var perm = srt.every(function (v, k) { return v === k; });
    ok(perm, tag + ': το `o` είναι μετάθεση, δεν χάνει ούτε διπλασιάζει κομμάτι');
  });
});

/* Στα XVII τα χρώματα δένουν λατινικά με ελληνικά μέσω του `g`. Ένα `g` που
   ζει μόνο στη μια πλευρά είναι ένας δεσμός που δεν ανάβει ποτέ. */
[['XVII', S17], ['XVIII', S18], ['XIX', S19], ['XXII', S22]].forEach(function (pair) {
pair[1].forEach(function (sc) {
  sc.s.forEach(function (sn, i) {
    var tag = pair[0] + ' ' + sc.n + '/' + (i + 1);
    var la = {}, gr = {};
    sn.la.forEach(function (w) {
      ok(!!w.w && !!w.d && !!w.x, tag + ' «' + w.w + '»: έχει λέξη, μετάφραση ΚΑΙ συντακτικό');
      if (w.g) la[w.g] = 1;
    });
    sn.gr.forEach(function (g) { if (g.g) gr[g.g] = 1; });
    Object.keys(gr).forEach(function (g) {
      ok(la[g] === 1, tag + ': η ομάδα ' + g + ' των ελληνικών υπάρχει και στα λατινικά');
    });
  });
});
});

/* ══ 2β · ⭐⭐ ΤΟ XVIII ΕΝΑΝΤΙ ΤΟΥ ΒΙΒΛΙΟΥ, ΟΧΙ ΤΟΥ ΕΑΥΤΟΥ ΤΟΥ ═══════════
   Ο μόνος έλεγχος που έχει σημασία σε σελίδα που έγραψα ΕΓΩ: ενώνω τις 11
   ενότητες και απαιτώ να ξαναδίνουν, γράμμα προς γράμμα, το κείμενο του
   σχολικού βιβλίου (curl στο ebooks.edu.gr, index18.htm) και τη μετάφραση
   του φυλλαδίου. Ένα χαμένο «et», ένας τόνος, ένα μακρό — σκάει εδώ.

   ⚠️ ΔΥΟ ΑΠΟΚΛΙΣΕΙΣ ΕΙΝΑΙ ΔΗΛΩΜΕΝΕΣ ΚΑΙ ΚΑΜΙΑ ΤΡΙΤΗ ΔΕΝ ΠΕΡΝΑΕΙ:
     · οι αστερίσκοι είναι παραπομπές του βιβλίου, όχι κείμενο,
     · «proximan» είναι ΤΥΠΟΓΡΑΦΙΚΟ ΤΟΥ ΒΙΒΛΙΟΥ (spelunca θηλυκό σε
       αιτιατική → proximam). Η σελίδα έχει δίκιο, το βιβλίο όχι.
   Και οι δύο επιβάλλονται ΘΕΤΙΚΑ: αν το βιβλίο πάψει να τις χρειάζεται, ο
   μετασχηματισμός γίνεται σιωπηλά no-op και θα έκρυβε πραγματική απόκλιση. */
section('2β · το XVIII λέει ό,τι λέει το βιβλίο');

var SRC18 = R('tests/latinika-lectio18.source.txt')
  .split('\n').filter(function (l) { return l.charAt(0) !== '#'; }).join('\n').trim().split('@@@');
var bookLa = SRC18[0].trim();
var sheetGr = SRC18[1].trim();

ok(bookLa.indexOf('*') > 0, 'η πηγή κρατάει τους αστερίσκους του βιβλίου (αλλιώς η αφαίρεση είναι no-op)');
ok(bookLa.indexOf('proximan') > 0, '⭐ η πηγή κρατάει το «proximan» του βιβλίου — το λάθος μένει ορατό στην πηγή');
var expectLa = bookLa.replace(/\*/g, '').replace(/proximan/g, 'proximam');

function joinPack(pack, pick) {
  return pack.map(function (sc) {
    return sc.s.map(function (u) { return pick(u).join(' '); }).join(' ');
  }).join(' ');
}
function pickLa(u) { return u.la.map(function (w) { return w.w; }); }
function pickGr(u) { return u.gr.map(function (g) { return g.t; }); }
var pageLa = joinPack(S18, pickLa);
var pageGr = joinPack(S18, pickGr);

eq(pageLa, expectLa,
  '⛔ ΤΟ ΛΑΤΙΝΙΚΟ ΤΟΥ XVIII ΔΕΝ ΕΙΝΑΙ ΤΟΥ ΒΙΒΛΙΟΥ ΠΙΑ. Η πηγή είναι το\n' +
  '      ebooks.edu.gr (ΜΑΘΗΜΑ XVIII) — αν άλλαξε η σελίδα, έχει άδικο η σελίδα.');
eq(pageGr, sheetGr,
  '⛔ Η ΜΕΤΑΦΡΑΣΗ ΤΟΥ XVIII ΔΕΝ ΕΙΝΑΙ ΤΟΥ ΦΥΛΛΑΔΙΟΥ ΠΙΑ. Δεν είναι δική μου\n' +
  '      μετάφραση να τη «βελτιώσω» — είναι τα λόγια του καθηγητή του.');

ok(pageLa.indexOf('proximam') > 0, '   και η ίδια η σελίδα γράφει proximam');
ok(pageLa.indexOf('*') < 0, '   και δεν κουβαλάει τους αστερίσκους του βιβλίου');

/* Η ΜΕΤΑΦΡΑΣΗ ΕΙΝΑΙ ΜΕΤΑΓΡΑΜΜΕΝΗ ΑΠΟ ΦΩΤΟΓΡΑΦΙΑ — και το λέει. Σταθερά:
   μια όμορφη σελίδα με λάθος λέξεις για Πανελλήνιες είναι χειρότερη από
   καμία σελίδα, άρα η αβεβαιότητα ΓΡΑΦΕΤΑΙ, δεν σιωπάται. */
ok(R('tests/latinika-lectio18.source.txt').indexOf('φωτογραφία') > 0,
  '⚠️ η πηγή ομολογεί ότι η μετάφραση ήρθε από φωτογραφία, όχι από αρχείο');
ok(R('latinika-lectio18.html').indexOf('ebooks.edu.gr') > 0,
  '   και η ίδια η σελίδα λέει στον αναγνώστη από πού είναι το κείμενο');

/* ══ 2γ · ⭐⭐ ΤΟ XIX ΕΝΑΝΤΙ ΤΟΥ ΒΙΒΛΙΟΥ, ΟΧΙ ΤΟΥ ΕΑΥΤΟΥ ΤΟΥ ════════════
   als-v535. Ίδια σταθ. 50: η σελίδα γράφτηκε ΕΔΩ, άρα ένα sha256 πάνω της
   δεν εγγυάται τίποτα. Το λατινικό ζει χωριστά στο
   tests/latinika-lectio19.source.txt (curl στο ebooks.edu.gr, index19.htm)
   και οι 10 ενότητες, ενωμένες, πρέπει να το ξαναδίνουν ΑΥΤΟΛΕΞΕΙ.

   ⚠️ ΔΥΟ ΑΠΟΚΛΙΣΕΙΣ ΔΗΛΩΜΕΝΕΣ, ΚΑΜΙΑ ΤΡΙΤΗ:
     · οι αστερίσκοι είναι παραπομπές του βιβλίου στις ΠΑΡΑΤΗΡΗΣΕΙΣ,
     · «coniuārvit» είναι ΤΥΠΟΓΡΑΦΙΚΟ ΤΟΥ ΒΙΒΛΙΟΥ — αντιμετάθεση δύο
       χαρακτήρων· ο τύπος του coniūro είναι coniurāvit, και έτσι τον
       τυπώνει το φυλλάδιο. Η σελίδα έχει δίκιο, το βιβλίο όχι.
   Και οι δύο επιβάλλονται ΘΕΤΙΚΑ: ένας μετασχηματισμός που δεν χτυπάει
   τίποτα είναι ένας έλεγχος που δεν ελέγχει τίποτα. */
section('2γ · το XIX λέει ό,τι λέει το βιβλίο');

var SRC19 = R('tests/latinika-lectio19.source.txt')
  .split('\n').filter(function (l) { return l.charAt(0) !== '#'; }).join('\n').trim().split('@@@');
var bookLa19 = SRC19[0].trim();
var sheetGr19 = SRC19[1].trim();

ok(bookLa19.indexOf('*') > 0, 'η πηγή του XIX κρατάει τους αστερίσκους του βιβλίου (αλλιώς η αφαίρεση είναι no-op)');
ok(bookLa19.indexOf('coniuārvit') > 0, '⭐ η πηγή κρατάει το «coniuārvit» του βιβλίου — το λάθος μένει ορατό στην πηγή');
var expectLa19 = bookLa19.replace(/\*/g, '').replace(/coniuārvit/g, 'coniurāvit');

var pageLa19 = joinPack(S19, pickLa);
var pageGr19 = joinPack(S19, pickGr);

eq(pageLa19, expectLa19,
  '⛔ ΤΟ ΛΑΤΙΝΙΚΟ ΤΟΥ XIX ΔΕΝ ΕΙΝΑΙ ΤΟΥ ΒΙΒΛΙΟΥ ΠΙΑ. Η πηγή είναι το\n' +
  '      ebooks.edu.gr (ΜΑΘΗΜΑ XIX) — αν άλλαξε η σελίδα, έχει άδικο η σελίδα.');
eq(pageGr19, sheetGr19,
  '⛔ Η ΜΕΤΑΦΡΑΣΗ ΤΟΥ XIX ΔΕΝ ΕΙΝΑΙ ΤΟΥ ΦΥΛΛΑΔΙΟΥ ΠΙΑ. Δεν είναι δική μου\n' +
  '      μετάφραση να τη «βελτιώσω» — είναι τα λόγια του καθηγητή του.');

ok(pageLa19.indexOf('coniurāvit') > 0, '   και η ίδια η σελίδα γράφει coniurāvit');
ok(pageLa19.indexOf('coniuārvit') < 0, '   και ΠΟΤΕ το ανακατεμένο του βιβλίου');
ok(pageLa19.indexOf('*') < 0, '   και δεν κουβαλάει τους αστερίσκους του βιβλίου');

/* Η ΑΒΕΒΑΙΟΤΗΤΑ ΓΡΑΦΕΤΑΙ, ΔΕΝ ΣΙΩΠΑΤΑΙ — και εδώ δεν είναι μόνο η μετάφραση
   που ήρθε από φωτογραφία, είναι ΚΑΙ ΤΟ ΣΥΝΤΑΚΤΙΚΟ (το χέρι του καθηγητή). */
ok(R('tests/latinika-lectio19.source.txt').indexOf('φωτογραφία') > 0,
  '⚠️ η πηγή ομολογεί ότι η μετάφραση ήρθε από φωτογραφία, όχι από αρχείο');
ok(R('tests/latinika-lectio19.source.txt').indexOf('ΣΥΝΤΑΚΤΙΚΟ') > 0,
  '⚠️ και ότι το ίδιο ισχύει για το ΣΥΝΤΑΚΤΙΚΟ των λέξεων');
ok(R('latinika-lectio19.html').indexOf('ebooks.edu.gr') > 0,
  '   και η ίδια η σελίδα λέει στον αναγνώστη από πού είναι το κείμενο');
ok(R('latinika-lectio19.html').indexOf('coniuārvit') > 0,
  '⭐ ΚΑΙ ΤΟ ΛΕΕΙ ΚΑΙ ΣΤΟΝ ΙΔΙΟ: το υποσέλιδο εξηγεί γιατί η σελίδα διαφωνεί\n' +
  '      με το βιβλίο σε μία λέξη. Μια σιωπηλή διόρθωση σε κείμενο Πανελληνίων\n' +
  '      είναι ακριβώς το πράγμα που δεν επιτρέπεται να είναι σιωπηλό.');

/* ══ 2δ · ⭐⭐ ΤΟ XXII ΕΝΑΝΤΙ ΤΟΥ ΒΙΒΛΙΟΥ, ΟΧΙ ΤΟΥ ΕΑΥΤΟΥ ΤΟΥ ═══════════
   als-v578. Σταθ. 50 για τρίτη φορά: η σελίδα γράφτηκε ΕΔΩ, άρα sha256
   πάνω της δεν εγγυάται τίποτα. Το λατινικό ζει χωριστά στο
   tests/latinika-lectio22.source.txt — curl στο **Β΄ ΤΕΥΧΟΣ**
   (8547/2708/…/indexB_22.html), ΟΧΙ στο index22.htm του Α΄ που είναι 404.

   ⚠️ ΜΙΑ ΑΠΟΚΛΙΣΗ ΔΗΛΩΜΕΝΗ, ΚΑΜΙΑ ΔΕΥΤΕΡΗ:
     · οι ΔΕΚΑ αστερίσκοι είναι παραπομπές του βιβλίου στις ΠΑΡΑΤΗΡΗΣΕΙΣ
       για την υποτακτική — και είναι ακριβώς δέκα επειδή σημαδεύουν ΚΑΘΕ
       προτρεπτική υποτακτική του κειμένου. Γι' αυτό μετριούνται, δεν
       σβήνονται απλώς.
   ⭐⭐ ΚΑΙ ΤΟ «ΔΕΝ ΒΡΕΘΗΚΕ ΤΥΠΟΓΡΑΦΙΚΟ» ΕΙΝΑΙ ΕΥΡΗΜΑ, ΟΧΙ ΠΑΡΑΛΕΙΨΗ.
   Η XVIII είχε «proximan», η XIX «coniuārvit» — δύο στη σειρά, δηλαδή
   μοτίβο. Εδώ το κείμενο διαβάστηκε λέξη-λέξη πριν καρφωθεί και η αλυσίδα
   έσπασε. Το test το δηλώνει ΘΕΤΙΚΑ (το expect δεν έχει δεύτερο replace)
   ώστε η επόμενη ενότητα να ξαναψαχτεί από την αρχή. */
section('2δ · το XXII λέει ό,τι λέει το βιβλίο');

var SRC22 = R('tests/latinika-lectio22.source.txt')
  .split('\n').filter(function (l) { return l.charAt(0) !== '#'; }).join('\n').trim().split('@@@');
var bookLa22 = SRC22[0].trim();
var sheetGr22 = SRC22[1].trim();

var stars22 = (bookLa22.match(/\*/g) || []).length;
eq(stars22, 10,
  '⭐ Η ΠΗΓΗ ΚΡΑΤΑΕΙ ΚΑΙ ΤΟΥΣ ΔΕΚΑ ΑΣΤΕΡΙΣΚΟΥΣ — ένας λιγότερος σημαίνει ότι\n' +
  '      μια προτρεπτική υποτακτική ξέφυγε, όχι ότι το βιβλίο άλλαξε στίξη.');
var expectLa22 = bookLa22.replace(/\*/g, '');

var pageLa22 = joinPack(S22, pickLa);
var pageGr22 = joinPack(S22, pickGr);

eq(pageLa22, expectLa22,
  '⛔ ΤΟ ΛΑΤΙΝΙΚΟ ΤΟΥ XXII ΔΕΝ ΕΙΝΑΙ ΤΟΥ ΒΙΒΛΙΟΥ ΠΙΑ. Η πηγή είναι το\n' +
  '      ebooks.edu.gr (Β΄ Τεύχος, ΜΑΘΗΜΑ XXII) — αν άλλαξε η σελίδα, έχει\n' +
  '      άδικο η σελίδα.');
eq(pageGr22, sheetGr22,
  '⛔ Η ΜΕΤΑΦΡΑΣΗ ΤΟΥ XXII ΔΕΝ ΕΙΝΑΙ ΤΟΥ ΦΥΛΛΑΔΙΟΥ ΠΙΑ. Δεν είναι δική μου\n' +
  '      μετάφραση να τη «βελτιώσω» — είναι τα λόγια του καθηγητή του.');

ok(pageLa22.indexOf('*') < 0, '   και δεν κουβαλάει τους αστερίσκους του βιβλίου');

/* ⭐ ΟΙ ΔΕΚΑ ΠΡΟΤΡΕΠΤΙΚΕΣ, ΟΝΟΜΑΣΤΙΚΑ. Είναι ΟΛΟ το μάθημα (υποτακτική
   ενεστώτα), άρα δεν αρκεί να «υπάρχει το κείμενο» — πρέπει να υπάρχει
   κάθε μία από τις δέκα, και να είναι ακριβώς αυτές που σημαδεύει το
   βιβλίο με αστερίσκο. */
var ADH = ['Imitēmur', 'Amēmus', 'pareāmus', 'consulāmus', 'neglegāmus',
           'serviāmus', 'putēmus', 'sperēmus', 'ferāmus', 'arbitrēmur'];
eq(ADH.length, stars22, '   και οι δέκα αστερίσκοι αντιστοιχούν σε δέκα ονομασμένες προτροπές');
/* ⚠️ `>= 0`, ΟΧΙ `> 0`: το «Imitēmur» είναι η ΠΡΩΤΗ λέξη του κειμένου, άρα
   κάθεται στη θέση 0 — και το `indexOf(...) > 0` το έλεγε «λείπει» δύο
   φορές. Το ίδιο λάθος στην αρχή ενός κειμένου δεν το πιάνει κανένα μάτι. */
ADH.forEach(function (v) {
  ok(bookLa22.indexOf(v + '*') >= 0, '   το βιβλίο σημαδεύει με αστερίσκο το «' + v + '»');
  ok(pageLa22.indexOf(v) >= 0, '   και η σελίδα το κρατάει καθαρό: ' + v);
});

/* ⛔ ΚΑΙ ΤΟ ΠΙΟ ΕΥΚΟΛΟ ΛΑΘΟΣ ΤΟΥ ΚΕΙΜΕΝΟΥ: «quos» ΣΤΗΝ ΑΡΧΗ ΠΕΡΙΟΔΟΥ ΕΙΝΑΙ
   ΚΥΡΙΑ ΠΡΟΤΑΣΗ (quos = eos, το λέει το λεξιλόγιο του ίδιου του βιβλίου).
   Είναι το πρώτο που γράφει με κόκκινο ο καθηγητής του πάνω δεξιά στη
   φωτογραφία — αν φύγει από τη σελίδα, φεύγει η μισή ερώτηση. */
var X22 = R('latinika-lectio22.html');
ok(X22.indexOf('quos = eos') > 0 || X22.indexOf('quos = eos') > 0,
  '⭐ η σελίδα λέει ρητά «quos = eos» — αναφορική στην αρχή περιόδου = ΚΥΡΙΑ');
ok(X22.indexOf('ΠΡΟΤΡΕΠΤΙΚΗ') > 0, '   και ονομάζει την προτρεπτική υποτακτική');
ok(X22.indexOf('ne</b>') > 0 || X22.indexOf('<b>ne</b>') > 0,
  '   και ότι η άρνησή της είναι ne, όχι non');

/* Η ΑΒΕΒΑΙΟΤΗΤΑ ΓΡΑΦΕΤΑΙ, ΔΕΝ ΣΙΩΠΑΤΑΙ — μετάφραση ΚΑΙ συντακτικό από τη
   φωτογραφία, και εδώ υπάρχει ΚΑΙ δεύτερος μάρτυρας που διαφωνεί. */
ok(R('tests/latinika-lectio22.source.txt').indexOf('φωτογραφία') > 0,
  '⚠️ η πηγή ομολογεί ότι η μετάφραση ήρθε από φωτογραφία, όχι από αρχείο');
ok(R('tests/latinika-lectio22.source.txt').indexOf('ΣΥΝΤΑΚΤΙΚΟ') > 0,
  '⚠️ και ότι το ίδιο ισχύει για το ΣΥΝΤΑΚΤΙΚΟ των λέξεων');
ok(R('tests/latinika-lectio22.source.txt').indexOf('404') > 0,
  '⭐ και ότι η παλιά διεύθυνση γυρίζει 404 — ο επόμενος δεν θα το ξαναψάξει');
ok(R('tests/latinika-lectio22.source.txt').indexOf('22.JPG') > 0,
  '⭐ και ονομάζει τον ΔΕΥΤΕΡΟ ΜΑΡΤΥΡΑ (η μετάφραση του βιβλίου, ως εικόνα)');
ok(X22.indexOf('ebooks.edu.gr') > 0,
  '   και η ίδια η σελίδα λέει στον αναγνώστη από πού είναι το κείμενο');
ok(X22.indexOf('χορεία') > 0 && X22.indexOf('δίνω μια θέση') > 0,
  '⭐⭐ ΚΑΙ ΤΟ ΛΕΕΙ ΚΑΙ ΣΤΟΝ ΙΔΙΟ: το υποσέλιδο δείχνει ΚΑΙ ΤΙΣ ΔΥΟ αποδόσεις,\n' +
  '      του φυλλαδίου και του βιβλίου, και ποια διάλεξε η σελίδα. Αν δει κάτι\n' +
  '      άλλο στο βιβλίο, πρέπει να ξέρει ότι δεν είναι λάθος — είναι επιλογή.');
ok(X22.indexOf('proximan') > 0 && X22.indexOf('coniuārvit') > 0,
  '⭐⭐ και ότι ΕΔΩ δεν βρέθηκε τυπογραφικό, ονομάζοντας τα δύο προηγούμενα —\n' +
  '      ένα «δεν βρήκα» που δεν γράφεται πουθενά μοιάζει με «δεν κοίταξα».');

/* ══ 3 · ⭐⭐ ΤΑ ΝΟΥΜΕΡΑ ΤΗΣ ΣΕΙΡΑΣ ΕΙΝΑΙ ΜΕΤΡΗΜΕΝΑ ═══════════════════
   als-v587 — ΤΟ ΕΞΩΦΥΛΛΟ: η κάρτα έγινε ΣΕΙΡΑ μέσα σε ένα πλαίσιο, και
   κάθε νούμερο ζει πλέον ΔΥΟ φορές: ως `data-*` (τι διαβάζει Η ΜΗΧΑΝΗ για
   τον χάρτη και την ταινία των μετρήσεων) και ως ψηφίο με ετικέτα (τι
   διαβάζει ΑΥΤΟΣ). Αν τα δύο αποκλίνουν, η σελίδα δείχνει στον άνθρωπο
   άλλο νούμερο από αυτό που αθροίζει ο κώδικας — και κανένα από τα δύο
   δεν θα φαινόταν λάθος μόνο του. Άρα ελέγχονται ΚΑΙ ΤΑ ΔΥΟ, και τα δύο
   απέναντι στο ΠΑΚΕΤΟ.
   ⛔ ΚΑΙ Η ΕΤΙΚΕΤΑ ΕΙΝΑΙ ΤΟΥ ΠΑΚΕΤΟΥ, ΟΧΙ ΔΙΚΗ ΜΟΥ: το XVI μετράει
   «προτάσεις», τα υπόλοιπα «ενότητες» (έτσι το λέει το lede τους), και το
   XVII έχει ΣΗΜΕΙΩΣΕΙΣ — δεν έχει καν μπλοκ «παγίδες». Μια στήλη που τα
   έλεγε όλα «παγίδες» θα ήταν ωραία και ψεύτικη. */
section('3 · η βιβλιοθήκη λέει ό,τι μετράνε τα πακέτα');

var HUB = R('latinika.html');
var L16 = R('latinika-lectio16.html');
var L17 = R('latinika-lectio17.html');
var L18 = R('latinika-lectio18.html');
var L19 = R('latinika-lectio19.html');
var L22 = R('latinika-lectio22.html');

function rowBlock(lec) {
  var i = HUB.indexOf('data-lec="' + lec + '"');
  if (i < 0) return '';
  var open = HUB.lastIndexOf('<a ', i), j = HUB.indexOf('</a>', i);
  return HUB.slice(open, j);
}
function attrOf(block, name) {
  var m = new RegExp(name + '="(\\d+)"').exec(block);
  return m ? +m[1] : null;
}
/* Τα ψηφία της σειράς, κλειδωμένα στην ΕΤΙΚΕΤΑ τους — ποτέ σε θέση μέσα σε
   πίνακα: μια αναδιάταξη στηλών θα περνούσε αθόρυβα έναν έλεγχο θέσης. */
function statsOf(block) {
  var out = {}, re = /<b>(\d+)<\/b><i>([^<]+)<\/i>/g, m;
  while ((m = re.exec(block))) out[m[2]] = +m[1];
  return out;
}
function count(src, tagOpen) {
  var n = 0, i = 0;
  while ((i = src.indexOf(tagOpen, i)) >= 0) { n++; i += tagOpen.length; }
  return n;
}

var ROWS = {};
PACKS.forEach(function (pk) {
  ROWS[pk.id] = rowBlock(pk.id);
  ok(ROWS[pk.id].length > 0, 'υπάρχει σειρά για το ' + pk.file);
});

/* Οι «παγίδες» και οι «σημειώσεις» είναι χειροποίητες λίστες μέσα στα
   πακέτα — μετριούνται από ΕΚΕΙ, ποτέ από το μάτι μου (σταθ. 33). */
var traps16 = count(L16.slice(L16.indexOf('class="traps"'), L16.indexOf('class="plan"')), '<li>');
var notes17 = count(L17.slice(L17.indexOf('class="notes"'), L17.indexOf('class="foot"')), '<li>');
var traps18 = count(L18.slice(L18.indexOf('class="traps"'), L18.indexOf('class="notes"')), '<li>');
var notes18 = count(L18.slice(L18.indexOf('class="notes"'), L18.indexOf('class="foot"')), '<li>');
var traps19 = count(L19.slice(L19.indexOf('class="traps"'), L19.indexOf('class="notes"')), '<li>');
var notes19 = count(L19.slice(L19.indexOf('class="notes"'), L19.indexOf('class="foot"')), '<li>');
var traps22 = count(L22.slice(L22.indexOf('class="traps"'), L22.indexOf('class="notes"')), '<li>');
var notes22 = count(L22.slice(L22.indexOf('class="notes"'), L22.indexOf('class="foot"')), '<li>');

ok(L17.indexOf('class="traps"') < 0,
  '⭐ ΤΟ XVII ΔΕΝ ΕΧΕΙ ΚΑΝ ΜΠΛΟΚ «ΠΑΓΙΔΕΣ» — γι᾽ αυτό η σειρά του λέει\n' +
  '      «σημειώσεις». Η στήλη δεν ενοποιεί λέξεις που το υλικό ξεχωρίζει.');
ok(notes18 >= 1, 'XVIII: και το μπλοκ των σημειώσεων στέκει ακόμη (' + notes18 + ')');
ok(notes19 >= 1, 'XIX: και το μπλοκ των σημειώσεων στέκει ακόμη (' + notes19 + ')');
ok(notes22 >= 1, 'XXII: και το μπλοκ των σημειώσεων στέκει ακόμη (' + notes22 + ')');

function checkRow(id, scenes, units, unitWord, third, thirdWord) {
  var blk = ROWS[id], st = statsOf(blk);
  eq(st[unitWord], units, id + ': οι «' + unitWord + '» της σειράς == του πακέτου');
  eq(st['σκηνές'], scenes, id + ': οι σκηνές της σειράς == του πακέτου');
  eq(st[thirdWord], third, id + ': οι «' + thirdWord + '» της σειράς == του πακέτου');
  eq(attrOf(blk, 'data-n'), units, id + ': ⭐ και το data-n — ό,τι διαβάζει Ο ΧΑΡΤΗΣ — συμφωνεί με το ψηφίο');
  eq(attrOf(blk, 'data-sc'), scenes, id + ': ⭐ και το data-sc — ό,τι αθροίζει Η ΤΑΙΝΙΑ — συμφωνεί');
  eq(attrOf(blk, 'data-tr'), third, id + ': ⭐ και το data-tr συμφωνεί');
}
checkRow('16', SC.length,  n16, 'προτάσεις', traps16, 'παγίδες');
checkRow('17', S17.length, n17, 'ενότητες',  notes17, 'σημειώσεις');
checkRow('18', S18.length, n18, 'ενότητες',  traps18, 'παγίδες');
checkRow('19', S19.length, n19, 'ενότητες',  traps19, 'παγίδες');
checkRow('22', S22.length, n22, 'ενότητες',  traps22, 'παγίδες');

/* ⭐ Ο ΛΑΤΙΝΙΚΟΣ ΑΡΙΘΜΟΣ ΤΗΣ ΣΕΙΡΑΣ ΕΙΝΑΙ Η ΘΕΣΗ ΤΗΣ, όχι ο αριθμός του
   βιβλίου — και η JS τον ΠΑΡΑΓΕΙ για την κάρτα «συνέχισε». Αν οι δύο
   διαφωνούσαν, η κάρτα θα έδειχνε «III» για τη σειρά που γράφει «II». */
var ORDN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
PACKS.forEach(function (pk, k) {
  ok(ROWS[pk.id].indexOf('<div class="rn">' + ORDN[k] + '</div>') > 0,
    pk.file + ': ο αριθμός της σειράς είναι η ΘΕΣΗ της (' + ORDN[k] + ')');
});

/* Και το σύνολο του hero. Ένα «27» γραμμένο στο χέρι θα ξεχνιόταν με την
   τρίτη ενότητα· εδώ το πληρώνει το test την ίδια μέρα. */
var TOTAL = n16 + n17 + n18 + n19 + n22;
ok(HUB.indexOf('<b>' + TOTAL + '</b> προτάσεις') > 0,
  'το hero λέει το ΑΘΡΟΙΣΜΑ των πακέτων (' + TOTAL + ')');

/* ⭐ ΚΑΙ ΟΙ ΛΕΞΕΙΣ ΤΟΥ HERO ΜΕΤΡΑΝΕ ΟΣΟ ΚΑΙ ΤΑ ΝΟΥΜΕΡΑ. Το «Τρεις ενότητες»
   έμεινε αληθινό για τρεις εκδόσεις και θα γινόταν ψέμα σιωπηλά. */
/* ⭐⭐⭐ Ο ΑΝΑΛΛΟΙΩΤΟΣ ΒΓΗΚΕ ΑΠΟ ΤΟ ΥΛΙΚΟ. Πρώτα έλεγε «όχι τρεις, τέσσερις»
   και ΞΑΝΑΣΚΑΣΕ μόλις μπήκε η πέμπτη ενότητα — δηλαδή το νούμερο ήταν
   καρφωμένο ΜΕΣΑ ΣΤΟΝ ΦΡΟΥΡΟ. Τώρα ο κανόνας είναι: «το hero λέει το
   αριθμητικό ΤΩΝ ΠΑΚΕΤΩΝ ΠΟΥ ΥΠΑΡΧΟΥΝ, και κανένα άλλο». Πρόσθεσε έκτη
   ενότητα και περνάει μόνο του.
   ⚠️ als-v587: Ο ΕΛΕΓΧΟΣ ΕΙΝΑΙ ΣΤΗ ΦΡΑΣΗ, ΟΧΙ ΣΤΟ MARKUP. Ο τίτλος του
   εξωφύλλου σπάει σε τρεις σειρές με <br>, άρα ένα σκέτο indexOf πάνω στο
   HTML θα έλεγε «λείπει» για κάτι που ο αναγνώστης ΔΙΑΒΑΖΕΙ ολόκληρο. */
/* ⚠️⚠️ ΚΑΙ ΤΟ ΞΕΓΥΜΝΩΜΑ ΘΕΛΕΙ ΟΡΙΟ. Ένα `replace(/<[^>]+>/g)` πάνω σε ΟΛΟ
   το αρχείο καταβροχθίζει κώδικα: το `first < next.arr.length` μοιάζει με
   άνοιγμα ετικέτας και σβήνει τα πάντα ως το επόμενο `>` — έφαγε ολόκληρη
   τη φράση «Και οι πέντε ενότητες κλειδωμένες» και κατηγόρησε σωστό
   περιεχόμενο (σταθ. 42/44 ξανά). Το markup ξεγυμνώνεται, το <script> ΟΧΙ. */
var CUT = HUB.lastIndexOf('<script>');
var TEXT = HUB.slice(0, CUT).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ') + ' ' + HUB.slice(CUT);
var ORD = { 1: 'Μία', 2: 'Δύο', 3: 'Τρεις', 4: 'Τέσσερις', 5: 'Πέντε', 6: 'Έξι', 7: 'Επτά', 8: 'Οκτώ' };
var WORD = ORD[PACKS.length];
ok(!!WORD, 'υπάρχει ελληνικό αριθμητικό για ' + PACKS.length + ' πακέτα (αλλιώς συμπλήρωσέ το)');
ok(TEXT.indexOf(WORD + ' ενότητες') > 0 && TEXT.indexOf(WORD.toLowerCase() + ' ενότητες') > 0,
  '   το hero λέει «' + WORD.toLowerCase() + ' ενότητες», και στον τίτλο και στο κλείσιμο');
Object.keys(ORD).forEach(function (k) {
  if (+k === PACKS.length) return;
  var w = ORD[k];
  ok(TEXT.indexOf(w + ' ενότητες') < 0 && TEXT.indexOf(w.toLowerCase() + ' ενότητες') < 0,
    '⛔ και ΔΕΝ λέει πουθενά «' + w.toLowerCase() + ' ενότητες» — είναι ' + WORD.toLowerCase());
});
ok(HUB.indexOf('Τρεις απαντήσεις') > 0,
  '⚠️ ΚΑΙ ΤΟ ΣΧΟΛΙΟ ΤΗΣ ΣΤΑΘ. 10 ΕΜΕΙΝΕ: «Τρεις απαντήσεις, όχι δύο» δεν\n' +
  '      είναι μετρητής ενοτήτων — ένα τυφλό search/replace θα το είχε φάει.');

/* ⭐ Η ΤΥΠΟΓΡΑΦΙΑ ΤΟΥ ΕΞΩΦΥΛΛΟΥ (CLAUDE.md §③). Η Instrument Serif έχει
   ΜΗΔΕΝ ελληνικά γλυφά και πέφτει στη Georgia — η αιτία του «οι τόνοι δεν
   είναι σωστοί» (als-v504). Ο φρουρός είναι αντιγραμμένος από το
   tests/homework-look.test.js §7b, όπως λέει το CLAUDE.md. */
ok(HUB.indexOf('fonts.googleapis.com/css2?family=GFS+Didot') > 0,
  '⭐ η GFS Didot φορτώνεται — η ελληνική φωνή της σελίδας');
ok(/--lt-gr:"GFS Didot"/.test(HUB), '   και ζει σε δικό της token (--lt-gr)');
[['.lt-h', 'ο τίτλος του εξωφύλλου'], ['.lt-sh h2', 'οι κεφαλίδες ενοτήτων'],
 ['.lt-row .t', 'οι τίτλοι των κειμένων']].forEach(function (p) {
  var i = HUB.indexOf('  ' + p[0] + '{');
  ok(i > 0 && HUB.slice(i, HUB.indexOf('}', i)).indexOf('var(--lt-gr)') > 0,
    '⛔ ' + p[1] + ' (' + p[0] + ') φοράει --lt-gr, ΠΟΤΕ --au-serif (ελληνικά)');
});
/* ⚠️ Ο ΕΛΕΓΧΟΣ ΘΕΛΕΙ ΤΟ ΠΛΑΙΣΙΟ, ΟΧΙ ΤΗ ΛΕΞΗ (σταθ. 19). Ένα σκέτο
   indexOf('Georgia') θα απαγόρευε την ΙΔΙΑ ΤΗΝ ΕΞΗΓΗΣΗ στην κορυφή της
   σελίδας — που είναι ο λόγος που ξέρουμε γιατί απαγορεύεται. */
ok(!/font-family:[^;}]*Georgia/.test(HUB) && !/--[a-z-]+:[^;}]*Georgia/.test(HUB),
  '⛔ και η Georgia δεν είναι ΓΡΑΜΜΑΤΟΣΕΙΡΑ πουθενά, ούτε ως fallback');

/* ⭐ ΤΟ ΛΑΠΤΟΠ ΔΕΝ ΕΙΝΑΙ ΜΕΓΑΛΟ ΚΙΝΗΤΟ (σταθ. 51). */
ok(/\.lt-wrap\{ max-width:1180px/.test(HUB), '⭐ κέλυφος 1180px, όχι στήλη κινητού');
ok(HUB.indexOf('min-width:') >= 0, '(η σελίδα χρησιμοποιεί min-width μόνο ως ιδιότητα flex)');
ok(!/@media \([^)]*min-width/.test(HUB),
  '⛔ ΚΑΝΕΝΑ media query σε `min-width` — μετράει το VIEWPORT ενώ η στήλη\n' +
  '      ζει μέσα σε ΓΟΝΕΑ (σταθ. 51)');

/* Και ότι υπάρχει όντως πόρτα προς κάθε πακέτο. */
PACKS.forEach(function (pk) {
  ok(HUB.indexOf('href="' + pk.file + '"') > 0, 'η βιβλιοθήκη ανοίγει το ' + pk.file);
});

/* ══ 4 · Η ΜΗΧΑΝΗ ΚΛΙΣΕΩΝ ΕΦΥΓΕ — ΚΑΙ ΔΕΝ ΧΑΘΗΚΕ ════════════════════ */
section('4 · «σβήσε αυτό με τις κλίσεις» — από τη σελίδα, όχι από το repo');

/* ⚠️ Ο έλεγχος είναι στο <script src>, ΟΧΙ σε σκέτη αναφορά: το σχόλιο στην
   κορυφή της σελίδας ΠΡΕΠΕΙ να μπορεί να λέει πού πήγε η μηχανή. Ένα
   `indexOf('latin-engine.js')` θα απαγόρευε την ίδια την εξήγηση. */
ok(HUB.indexOf('src="latin-engine.js"') < 0, 'δεν φορτώνεται πια το latin-engine.js');
['ltMapBody', 'startFill', 'Κλίση ολόκληρη', 'ltWordList', 'declineNoun', 'LatinEngine'].forEach(function (gone) {
  ok(HUB.indexOf(gone) < 0, 'έφυγε από τη σελίδα: ' + gone);
});

ok(fs.existsSync(path.join(ALS, 'archive', 'latinika-drill.html')),
  '⭐ αλλά ΟΛΟΚΛΗΡΗ η παλιά σελίδα σώζεται στο archive/latinika-drill.html');
ok(R('archive/latinika-drill.html').indexOf('Κλίση ολόκληρη') > 0,
  '   και το αρχείο είναι όντως η μηχανή, όχι ένα άδειο κέλυφος');
ok(fs.existsSync(path.join(ALS, 'latin-engine.js')), 'το latin-engine.js δεν σβήστηκε');
ok(fs.existsSync(path.join(ALS, 'tests', 'latin-engine.test.js')), 'ούτε τα 137 assertions του');

/* ⚠️ ΤΟ ΠΙΟ ΕΥΚΟΛΟ ΛΑΘΟΣ ΟΛΗΣ ΤΗΣ ΑΛΛΑΓΗΣ: να φύγει η μηχανή και μαζί της,
   αθόρυβα, ο συγχρονισμός — και τα κελιά του να μείνουν ορφανά σε μία
   συσκευή. Το `lat:v1` το διαβάζουν ακόμη ladders.js, home-live.js,
   backup.html και api/mcp.js. */
ok(HUB.indexOf("appKey:'latinika'") > 0, '⭐ το appKey «latinika» συνεχίζει να συγχρονίζεται');
ok(HUB.indexOf("syncedKeys:['lat:v1']") > 0, '⭐ και το κλειδί lat:v1 μαζί του');
ok(R('ladders.js').indexOf("key: 'lat:v1'") > 0, 'το ladders.js εξακολουθεί να το διαβάζει');

/* ⛔ ΚΑΙ Η ΒΙΒΛΙΟΘΗΚΗ ΔΕΝ ΓΡΑΦΕΙ. Είναι αναγνώστης δύο ξένων κλειδιών·
   ένας αναγνώστης που γράφει είναι ακριβώς ο τρόπος που χάνεται πρόοδος. */
ok(HUB.indexOf('setItem') < 0, '⛔ η βιβλιοθήκη δεν γράφει τίποτα — κανένα setItem');

/* ══ 5 · ΤΑ ΚΛΕΙΔΙΑ ΤΩΝ ΕΝΟΤΗΤΩΝ ΜΕΝΟΥΝ ΤΟΠΙΚΑ ═════════════════════ */
section('5 · και μένουν τοπικά, επίτηδες');

eq(count(L16, 'lectio16:v1') > 0, true, 'το XVI κρατάει το δικό του κλειδί');
eq(count(L17, 'lectio17_known_v1') > 0, true, 'το XVII κρατάει το δικό του κλειδί');
eq(count(L18, 'lectio18_known_v1') > 0, true, 'το XVIII κρατάει το δικό του κλειδί');
eq(count(L19, 'lectio19_known_v1') > 0, true, 'το XIX κρατάει το δικό του κλειδί');
eq(count(L22, 'lectio22_known_v1') > 0, true, 'το XXII κρατάει το δικό του κλειδί');
ok(L18.indexOf('lectio17_known_v1') < 0,
  '⛔ και ΔΕΝ κληρονόμησε το κλειδί του XVII με copy-paste — θα μοιράζονταν πρόοδο');
ok(L19.indexOf('lectio17_known_v1') < 0 && L19.indexOf('lectio18_known_v1') < 0,
  '⛔ ούτε το XIX — ΤΕΣΣΕΡΑ πακέτα μοιράζονται τώρα την ίδια μηχανή, άρα ένα\n' +
  '      ξεχασμένο κλειδί θα έδειχνε την ίδια πρόοδο σε τέσσερις κάρτες');
ok(L22.indexOf('lectio17_known_v1') < 0 && L22.indexOf('lectio18_known_v1') < 0 &&
   L22.indexOf('lectio19_known_v1') < 0,
  '⛔ ούτε το XXII — γράφτηκε με copy-paste ΤΗΣ ΜΗΧΑΝΗΣ του XIX, και ακριβώς\n' +
  '      εκεί ξεχνιέται το κλειδί: η κάρτα θα έδειχνε αληθοφανή πρόοδο που δεν\n' +
  '      έγινε ποτέ σε αυτή την ενότητα');
['lectio16:v1', 'lectio17_known_v1', 'lectio18_known_v1', 'lectio19_known_v1',
 'lectio22_known_v1'].forEach(function (k) {
  ok(HUB.indexOf(k) > 0, 'η βιβλιοθήκη ΔΙΑΒΑΖΕΙ το ' + k);
});

/* Η απόδειξη, όχι η υπόσχεση: τα δύο κλειδιά δεν εμφανίζονται πουθενά μέσα
   στη γραμμή του initCloudSync. */
var syncLine = HUB.slice(HUB.indexOf('initCloudSync({ appKey'), HUB.indexOf('initCloudSync({ appKey') + 120);
ok(syncLine.indexOf('lectio') < 0,
  '⛔ ΚΑΙ ΔΕΝ ΜΠΑΙΝΟΥΝ ΣΤΟ SYNC: το lectio16:v1 είναι πίνακας από πρωτόγονα,\n' +
  '      το mergeArray θα τα ΕΝΩΝΕ και το «μηδένισε» θα γύριζε πίσω (σταθ. 31)');

/* Και ότι το ίδιο το mergeArray όντως συμπεριφέρεται έτσι — η αιτία που
   γράφτηκε ο κανόνας, αποδεδειγμένη αντί για δηλωμένη. */
ok(R('sync.js').indexOf('allPrim') > 0,
  '   (η ένωση πρωτογόνων ζει όντως στο sync.js — γι\' αυτό ο κανόνας)');

/* ══ 6 · ⭐⭐ Η ΣΕΛΙΔΑ ΟΔΗΓΕΙΤΑΙ ΑΛΗΘΙΝΑ ═════════════════════════════
   Οι έλεγχοι 1-5 διαβάζουν ΚΕΙΜΕΝΟ. Αυτός ΤΡΕΧΕΙ το ίδιο το <script> της
   `latinika.html` μέσα σε `vm`, με ψεύτικο localStorage και ένα DOM όσο
   ακριβώς χρειάζεται. Είναι το ίδιο σχήμα με το tests/ekthesi-page.test.js
   — εκεί ήταν που βρέθηκαν δύο ζωντανά bugs που 140 πράσινα assertions
   δεν είχαν δει. Τα πράγματα που πρέπει να αποδειχθούν:
     · τα ΤΡΙΑ διαφορετικά σχήματα (πίνακας / χάρτης sN / χάρτης εισαγωγής),
     · «άδειο» και «δεν διαβάστηκε» ΔΕΝ ζωγραφίζονται ίδια (σταθ. 10),
     · χαλασμένα δεδομένα δεν γίνονται σιωπηλό μηδέν,
     · ⭐ als-v587: ο ΧΑΡΤΗΣ βάζει ΜΙΑ ΓΡΑΜΜΗ ΑΝΑ ΠΡΟΤΑΣΗ και την ανάβει
       ΣΤΗ ΣΩΣΤΗ ΘΕΣΗ — ένα `[0,3,7]` που θα ζωγράφιζε τις τρεις πρώτες θα
       ήταν απολύτως αληθοφανές και εντελώς λάθος,
     · ⭐ και η ΤΑΙΝΙΑ αθροίζει ΤΑ ΙΔΙΑ data-* που ελέγχει το §3. */
section('6 · η ίδια η σελίδα, οδηγημένη');

/* ⚠️ ΤΟ STUB ΠΡΕΠΕΙ ΝΑ ΣΥΜΠΕΡΙΦΕΡΕΤΑΙ ΣΑΝ DOM, ΟΧΙ ΣΑΝ ΑΝΤΙΚΕΙΜΕΝΟ JS:
   το πραγματικό `textContent = 15` αποθηκεύει τη ΣΥΜΒΟΛΟΣΕΙΡΑ "15". Ένα
   στείρο `{textContent:''}` κρατάει αριθμό και κάνει το test να βλέπει
   διαφορά που ο browser δεν έχει — ψεύτικο κόκκινο. */
function El() {
  var o = { innerHTML: '', className: '', _a: {}, _t: '' };
  Object.defineProperty(o, 'textContent', {
    get: function () { return this._t; },
    set: function (v) { this._t = String(v); },
    enumerable: true
  });
  o.getAttribute = function (k) { return (k in this._a) ? this._a[k] : null; };
  o.setAttribute = function (k, v) { this._a[k] = String(v); };
  return o;
}
var IDS = ['ltMap', 'ltN', 'ltSub', 'ltHead', 'stKnown', 'stKnownOf', 'stDone', 'stDoneOf',
  'stScenes', 'stTraps', 'eisPct', 'eisCnt', 'eisDash',
  'nxKind', 'nxLec', 'nxRn', 'nxTtl', 'nxDash', 'nxNext', 'nxCnt', 'nxGo', 'nxGoT'];

/* Η σειρά φτιάχνεται ΑΠΟ ΤΟ ΙΔΙΟ ΤΟ HTML της σελίδας — όχι από έναν πίνακα
   εδώ μέσα που θα μπορούσε να διαφωνήσει μαζί της. */
function makeRow(id) {
  var blk = ROWS[id], r = El();
  r._a = {
    'data-lec': id,
    'data-n': String(attrOf(blk, 'data-n')),
    'data-sc': String(attrOf(blk, 'data-sc')),
    'data-tr': String(attrOf(blk, 'data-tr')),
    'href': /href="([^"]+)"/.exec(blk)[1]
  };
  r.pct = El(); r.cnt = El(); r.dash = El(); r.nxt = El(); r.ttl = El();
  r.ttl.textContent = /<div class="t">([^<]+)<\/div>/.exec(blk)[1];
  r.querySelector = function (sel) {
    return sel === '.pct' ? r.pct : sel === '.cnt' ? r.cnt : sel === '.dash' ? r.dash
         : sel === '.t' ? r.ttl : sel === '.nxt' ? r.nxt : null;
  };
  return r;
}

function drive(store) {
  var rows = PACKS.map(function (pk) { return makeRow(pk.id); });
  var byId = {}; IDS.forEach(function (k) { byId[k] = El(); });
  var doc = {
    querySelectorAll: function (sel) {
      return sel === '.lt-row[data-lec]' ? rows : [];
    },
    getElementById: function (id) { return byId[id] || null; }
  };
  var sandbox = {
    document: doc,
    localStorage: {
      getItem: function (k) {
        if (store[k] === '__THROW__') throw new Error('SecurityError');
        return (k in store) ? store[k] : null;
      }
    },
    setTimeout: function () { },
    requestAnimationFrame: function () { },
    window: {}
  };
  sandbox.window = sandbox;
  var src = HUB.slice(HUB.lastIndexOf('<script>') + 8, HUB.lastIndexOf('</script>'));
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox);
  var cards = {};
  PACKS.forEach(function (pk, i) { cards[pk.id] = rows[i]; });
  return { cards: cards, els: byId, rows: rows };
}

/* Οι γραμμές του χάρτη, διαβασμένες όπως τις βλέπει το μάτι. */
function lines(html) {
  var out = [], re = /<i(?: class="([^"]*)")?><\/i>/g, m;
  while ((m = re.exec(html))) out.push(m[1] || '');
  return out;
}
function onAt(html) {
  return lines(html).map(function (c, i) { return c === 'on' ? i : -1; })
    .filter(function (i) { return i >= 0; });
}
function nowAt(html) {
  var L = lines(html);
  for (var i = 0; i < L.length; i++) if (L[i] === 'now') return i;
  return -1;
}

/* — καθαρή εγκατάσταση: τίποτα δεν ξεκίνησε — */
var A = drive({});
PACKS.forEach(function (pk) {
  eq(A.cards[pk.id].pct.textContent, 'δεν ξεκίνησε', 'άδειο ' + pk.id + ' → «δεν ξεκίνησε»');
  eq(A.cards[pk.id].pct.className, 'pct', '   και χωρίς χρώμα — το μηδέν δεν βάφεται');
});
eq(A.cards['16'].cnt.textContent, '0 / ' + n16, 'και ο μετρητής λέει 0 / ' + n16);
eq(lines(A.cards['16'].dash.innerHTML).length, n16,
  '⭐ ΠΛΗΘΟΣ = ΠΛΗΘΟΣ: μία γραμμή ανά πρόταση (' + n16 + '), όχι ένα ποσοστό');
eq(onAt(A.cards['16'].dash.innerHTML).length, 0, '   και καμία αναμμένη');
eq(nowAt(A.cards['16'].dash.innerHTML), -1,
  '   ⭐ ούτε «επόμενη» σε ενότητα που δεν ξεκίνησε — θα ήταν επινοημένη θέση');
eq(A.els.ltN.textContent, PACKS.length + ' ενότητες · ' + TOTAL + ' προτάσεις', 'ο μετρητής της ενότητας');
eq(A.els.stKnown.textContent, '0', 'η ταινία: μηδέν γνωστές');
eq(A.els.stKnown.className, '', '   ⭐ και ΑΒΑΦΤΗ — ένα κοράλλι «0» διαβάζεται επίτευγμα');
eq(A.els.stDone.textContent, '0', 'η ταινία: καμία ενότητα δεν έκλεισε');
eq(A.els.stKnownOf.textContent, '/' + TOTAL, '   και το σύνολο βγαίνει από τις σειρές');
eq(A.els.stDoneOf.textContent, '/' + PACKS.length, '   όπως και το πλήθος των ενοτήτων');

/* ⭐ Η ΤΑΙΝΙΑ ΑΘΡΟΙΖΕΙ ΤΑ ΙΔΙΑ data-* ΠΟΥ ΕΛΕΓΞΕ ΤΟ §3 — ένα δεύτερο
   άθροισμα γραμμένο με το χέρι θα διαφωνούσε σιωπηλά (σταθ. 15). */
var SUM_SC = PACKS.reduce(function (a, pk) { return a + attrOf(ROWS[pk.id], 'data-sc'); }, 0);
var SUM_TR = PACKS.reduce(function (a, pk) { return a + attrOf(ROWS[pk.id], 'data-tr'); }, 0);
eq(A.els.stScenes.textContent, String(SUM_SC), 'οι σκηνές της ταινίας == το άθροισμα των σειρών (' + SUM_SC + ')');
eq(A.els.stTraps.textContent, String(SUM_TR), 'οι παγίδες+σημειώσεις == το άθροισμα των σειρών (' + SUM_TR + ')');
ok(HUB.indexOf('Παγίδες και σημειώσεις') > 0,
  '⛔ και η ΕΤΙΚΕΤΑ της λέει και τα δύο: το XVII δίνει σημειώσεις, όχι παγίδες');

/* — η κάρτα «συνέχισε» σε καθαρή εγκατάσταση — */
eq(A.els.nxKind.textContent, '— ξεκίνα', '⭐ τίποτα δεν ξεκίνησε → λέει «ξεκίνα», όχι «συνέχισε»');
eq(A.els.nxLec.textContent, 'Lectio XVI', '   και δείχνει το πρώτο κείμενο');
eq(A.els.nxRn.textContent, 'I', '   με τη ΘΕΣΗ του, όχι τον αριθμό του βιβλίου');
eq(A.els.nxTtl.textContent, 'Η τελευταία μάχη του Καίσαρα στη Γαλατία', '   και τον τίτλο του, από την ίδια τη σειρά');
eq(A.els.nxNext.textContent, 'επόμενη: πρόταση 1', '   η επόμενη πράξη είναι η πρόταση 1');
eq(A.els.nxCnt.textContent, '0 / ' + n16, '   0 / ' + n16);
eq(A.els.nxGo.getAttribute('href'), 'latinika-lectio16.html', '   και το κουμπί πάει όντως εκεί');
ok(A.cards['16'].className.indexOf('is-next') >= 0, '   η σειρά του σημαδεύεται ως επόμενη');
eq(A.cards['16'].nxt.textContent, '— επόμενο', '   και το λέει με λέξεις');
ok(A.cards['17'].className.indexOf('is-next') < 0, '⛔ και ΜΟΝΟ αυτή — όχι δεύτερη «επόμενη»');
eq(A.els.eisPct.textContent, 'δεν ξεκίνησε', 'η εισαγωγή: δεν ξεκίνησε');
eq(A.els.eisCnt.textContent, '0 / 8', '   0 / 8 κεφάλαια');

/* — ⭐ ΤΑ ΔΥΟ ΣΧΗΜΑΤΑ. ΠΙΝΑΚΑΣ αριστερά, ΧΑΡΤΗΣ δεξιά, στην ίδια σελίδα. — */
var B = drive({
  'lectio16:v1': JSON.stringify([0, 3, 7, 15]),
  'lectio17_known_v1': JSON.stringify({ s1: true, s2: false, s5: true, s9: true }),
  'lectio18_known_v1': JSON.stringify({ s2: true, s3: true }),
  'lectio19_known_v1': JSON.stringify({ s1: true, s4: true, s7: false, s10: true }),
  'lectio22_known_v1': JSON.stringify({ s2: true, s6: true, s8: false, s9: true, s11: true })
});
eq(B.cards['16'].cnt.textContent, '4 / 16', '⭐ ΠΙΝΑΚΑΣ: 4 δείκτες → 4');
eq(B.cards['17'].cnt.textContent, '3 / 11', '⭐ ΧΑΡΤΗΣ: τα `false` ΔΕΝ μετράνε → 3');
eq(B.cards['18'].cnt.textContent, '2 / 11', '⭐ και το τρίτο κλειδί μετριέται χωριστά');
eq(B.cards['19'].cnt.textContent, '3 / 10', '⭐ και το ΤΕΤΑΡΤΟ — τα `false` ξανά δεν μετράνε');
eq(B.cards['22'].cnt.textContent, '4 / 11', '⭐ και το ΠΕΜΠΤΟ — τα `false` ξανά δεν μετράνε');
PACKS.forEach(function (pk) {
  eq(B.cards[pk.id].pct.textContent, 'σε εξέλιξη', pk.id + ': ξεκίνησε και δεν έκλεισε → «σε εξέλιξη»');
  eq(B.cards[pk.id].pct.className, 'pct on', '   και ανάβει');
});

/* ⭐⭐ Η ΘΕΣΗ, ΟΧΙ ΜΟΝΟ ΤΟ ΠΛΗΘΟΣ. Ένας χάρτης που άναβε τις 4 ΠΡΩΤΕΣ
   γραμμές για το `[0,3,7,15]` θα έδειχνε το ίδιο νούμερο και θα έλεγε
   ψέματα για το ΠΟΥ βρίσκεται μέσα στο κείμενο — που είναι ο λόγος που
   υπάρχει ο χάρτης. */
eq(onAt(B.cards['16'].dash.innerHTML).join(','), '0,3,7,15',
  '⭐⭐ ΠΙΝΑΚΑΣ: οι αναμμένες γραμμές είναι ΑΚΡΙΒΩΣ οι δείκτες του (0-based)');
eq(onAt(B.cards['17'].dash.innerHTML).join(','), '0,4,8',
  '⭐⭐ ΧΑΡΤΗΣ: το `s1` είναι η ΠΡΩΤΗ γραμμή (1-based → 0-based), όχι η δεύτερη');
eq(nowAt(B.cards['16'].dash.innerHTML), 1,
  '⭐ και η «επόμενη» είναι η πρώτη ΑΣΒΗΣΤΗ (η 2η), όχι η επόμενη μετά την τελευταία αναμμένη');
eq(B.els.stKnown.textContent, '16', 'η ταινία αθροίζει και τις πέντε');
eq(B.els.stKnown.className, 'hot', '   και τώρα βάφεται, γιατί δεν είναι μηδέν');
eq(B.els.stDone.textContent, '0', '   καμία δεν έκλεισε ακόμη');
eq(B.els.nxRn.textContent, 'I', 'η κάρτα δείχνει την ΠΡΩΤΗ ανοιχτή ενότητα');
eq(B.els.nxKind.textContent, '— συνέχισε', '   και τώρα λέει «συνέχισε»');
eq(B.els.nxNext.textContent, 'επόμενη: πρόταση 2', '   με την πρώτη πρόταση που λείπει');

/* Ο χάρτης: πέντε ομάδες, και η καθεμιά με τον ΛΟΓΟ της ως --n. */
eq(count(B.els.ltMap.innerHTML, '<div class="lt-mg'), PACKS.length, 'ο χάρτης έχει μία ομάδα ανά ενότητα');
PACKS.forEach(function (pk) {
  ok(B.els.ltMap.innerHTML.indexOf('--n:' + attrOf(ROWS[pk.id], 'data-n')) > 0,
    '   το πλάτος της ομάδας ' + pk.id + ' είναι ΟΙ ΠΡΟΤΑΣΕΙΣ της (--n), όχι ίσο μερίδιο');
});
eq(lines(B.els.ltMap.innerHTML).length, TOTAL,
  '⭐ και όλος ο χάρτης έχει ΑΚΡΙΒΩΣ ' + TOTAL + ' γραμμές — μία ανά πρόταση');

/* ⛔ ΤΟ ΠΙΟ ΕΥΚΟΛΟ ΛΑΘΟΣ ΤΗΣ ΠΡΟΣΘΗΚΗΣ: τα XVII-XXII μοιράζονται μηχανή,
   άρα ένα copy-paste κλειδί θα έδειχνε την ΙΔΙΑ πρόοδο σε δύο σειρές και
   κανείς δεν θα το πρόσεχε — και οι δύο θα ήταν «αληθινές». */
var B2 = drive({ 'lectio17_known_v1': JSON.stringify({ s1: true, s2: true, s3: true }) });
eq(B2.cards['17'].cnt.textContent, '3 / 11', 'το XVII βλέπει το δικό του κλειδί');
eq(B2.cards['18'].cnt.textContent, '0 / 11', '⛔ και το XVIII ΔΕΝ δανείζεται την πρόοδό του');
eq(B2.cards['19'].cnt.textContent, '0 / 10', '⛔ ούτε το XIX');
eq(B2.cards['22'].cnt.textContent, '0 / 11', '⛔ ούτε το XXII');
eq(B2.els.nxRn.textContent, 'I', '   και η κάρτα δείχνει το XVI, που δεν ξεκίνησε καν');

var B3 = drive({ 'lectio19_known_v1': JSON.stringify({ s1: true, s2: true }) });
eq(B3.cards['19'].cnt.textContent, '2 / 10', 'το XIX βλέπει το δικό του κλειδί');
eq(B3.cards['17'].cnt.textContent, '0 / 11', '   και δεν το δανείζει στο XVII');
eq(B3.cards['18'].cnt.textContent, '0 / 11', '   ούτε στο XVIII');
eq(B3.cards['22'].cnt.textContent, '0 / 11', '   ούτε στο XXII');

var B4 = drive({ 'lectio22_known_v1': JSON.stringify({ s1: true, s2: true, s3: true }) });
eq(B4.cards['22'].cnt.textContent, '3 / 11', 'το XXII βλέπει το δικό του κλειδί');
eq(B4.cards['17'].cnt.textContent, '0 / 11', '   και δεν το δανείζει στο XVII');
eq(B4.cards['18'].cnt.textContent, '0 / 11', '   ούτε στο XVIII');
eq(B4.cards['19'].cnt.textContent, '0 / 10', '   ούτε στο XIX');

/* ⭐ ΚΑΙ Η ΕΙΣΑΓΩΓΗ ΕΧΕΙ ΤΟ ΔΙΚΟ ΤΗΣ, ΤΡΙΤΟ ΣΧΗΜΑ — κλειδιά που ΔΕΝ είναι
   `sN`. Ένας μετρητής που έψαχνε `sN` θα γύριζε σιωπηλό μηδέν εδώ. */
var G = drive({ 'eisagogi:v1': JSON.stringify({ a: true, g: true, d: false, z: true }) });
eq(G.els.eisPct.textContent, 'σε εξέλιξη', 'η εισαγωγή μετριέται με ΤΑ ΔΙΚΑ ΤΗΣ κλειδιά');
eq(G.els.eisCnt.textContent, '3 / 8', '   3 από 8, και τα `false` δεν μετράνε');
eq(G.els.stKnown.textContent, '0',
  '⛔ και ΔΕΝ μπαίνει στο σύνολο των προτάσεων — είναι ΑΝΑΓΝΩΣΜΑ, όχι εξάσκηση');

/* — ⛔ Η ΑΣΘΕΝΕΙΑ: κλειδωμένος δίσκος. ΔΕΝ επιτρέπεται «δεν ξεκίνησε». — */
var C = drive({
  'lectio16:v1': '__THROW__', 'lectio17_known_v1': '__THROW__',
  'lectio18_known_v1': '__THROW__', 'lectio19_known_v1': '__THROW__',
  'lectio22_known_v1': '__THROW__', 'eisagogi:v1': '__THROW__'
});
PACKS.forEach(function (pk) {
  eq(C.cards[pk.id].pct.textContent, 'δεν διαβάστηκε', '⛔ getItem πετάει → «δεν διαβάστηκε», ΟΧΙ 0');
  eq(C.cards[pk.id].pct.className, 'pct dead', '   και ζωγραφίζεται στο ΔΙΚΟ του κανάλι');
  eq(C.cards[pk.id].cnt.textContent, '— / ' + attrOf(ROWS[pk.id], 'data-n'),
    '   και ο μετρητής λέει «—», όχι «0»');
  ok(C.cards[pk.id].dash.className.indexOf('dead') >= 0,
    '   ⭐ και ΟΙ ΠΑΥΛΙΤΣΕΣ το λένε κι αυτές — σβηστές γραμμές χωρίς σήμανση\n' +
    '         διαβάζονται «δεν ξέρεις καμία», που είναι άλλο πράγμα');
  eq(onAt(C.cards[pk.id].dash.innerHTML).length, 0, '   και καμία αναμμένη');
});
eq(C.els.stKnown.textContent, '—', '⛔ ούτε η ταινία επινοεί μηδέν');
eq(C.els.stKnown.className, 'dead', '   και το λέει στο κανάλι του σφάλματος');
eq(C.els.stDone.textContent, '—', '   το ίδιο και οι κλειστές ενότητες');
ok(C.els.ltSub.innerHTML.indexOf('Δεν μπόρεσα να διαβάσω') >= 0, '   και το λέει και το εξώφυλλο');
eq(C.els.nxKind.textContent, '— δεν διαβάστηκε', '⛔ και η κάρτα δεν προτείνει «ξεκίνα από το XVI»');
eq(C.els.nxTtl.textContent, 'Δεν ξέρω πού έμεινες', '   το λέει με λέξεις');
eq(C.els.eisPct.textContent, 'δεν διαβάστηκε', '   και η εισαγωγή το ίδιο');
ok(C.els.ltMap.innerHTML.indexOf('lt-mg dead') > 0, '   και ο χάρτης σημαδεύει τις ομάδες του');

/* ⭐ ΚΑΙ ΤΟ ΜΕΡΙΚΟ ΣΦΑΛΜΑ ΕΧΕΙ ΔΙΚΗ ΤΟΥ ΦΩΝΗ: τέσσερις σειρές αληθινές,
   μία άγνωστη. Ένα σκέτο «όλα καλά» θα έκρυβε ότι ένα νούμερο λείπει. */
var H = drive({ 'lectio18_known_v1': '__THROW__', 'lectio16:v1': JSON.stringify([0, 1]) });
eq(H.cards['18'].pct.textContent, 'δεν διαβάστηκε', 'η μία σειρά λέει ότι δεν διαβάστηκε');
eq(H.cards['16'].cnt.textContent, '2 / 16', '   και οι υπόλοιπες μετράνε κανονικά');
ok(H.els.ltSub.innerHTML.indexOf('Κάποιες ενότητες δεν διαβάστηκαν') >= 0,
  '⭐ και το εξώφυλλο το ΛΕΕΙ, αντί να δείξει ένα σύνολο που λείπει κομμάτι');

/* — σπασμένο JSON, και λάθος σχήμα στο σωστό κλειδί — */
var D = drive({
  'lectio16:v1': '{not json', 'lectio17_known_v1': JSON.stringify([1, 2, 3]),
  'lectio18_known_v1': JSON.stringify([1, 2, 3]), 'lectio19_known_v1': JSON.stringify([1, 2, 3]),
  'lectio22_known_v1': JSON.stringify([1, 2, 3]), 'eisagogi:v1': JSON.stringify([1, 2])
});
eq(D.cards['16'].pct.textContent, 'δεν διαβάστηκε', 'σπασμένο JSON → «δεν διαβάστηκε»');
eq(D.cards['17'].pct.textContent, 'δεν διαβάστηκε', '⭐ ΠΙΝΑΚΑΣ σε κλειδί ΧΑΡΤΗ → «δεν διαβάστηκε», ΟΧΙ 0');
eq(D.cards['18'].pct.textContent, 'δεν διαβάστηκε', '   και στο XVIII, που μοιράζεται τον ίδιο μετρητή');
eq(D.cards['19'].pct.textContent, 'δεν διαβάστηκε', '   και στο XIX');
eq(D.cards['22'].pct.textContent, 'δεν διαβάστηκε', '   και στο XXII');
eq(D.els.eisPct.textContent, 'δεν διαβάστηκε', '   και η εισαγωγή με πίνακα αντί για χάρτη');

/* — και ένα παλιό αρχείο με παραπάνω δείκτες δεν ξεχειλίζει τον χάρτη — */
var E = drive({ 'lectio16:v1': JSON.stringify([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18]) });
eq(E.cards['16'].cnt.textContent, '16 / 16', 'δεν ξεπερνάει ποτέ το σύνολο');
eq(E.cards['16'].pct.textContent, 'ολοκληρώθηκε', '   και λέει ότι έκλεισε');
eq(lines(E.cards['16'].dash.innerHTML).length, n16, '   και ο χάρτης κρατάει ' + n16 + ' γραμμές, ούτε μία παραπάνω');
eq(nowAt(E.cards['16'].dash.innerHTML), -1, '   ⛔ και καμία «επόμενη» σε ενότητα που έκλεισε');
eq(E.els.stDone.textContent, '1', '   η ταινία μετράει μία κλειστή');
eq(E.els.nxRn.textContent, 'II', '⭐ και η κάρτα προχωράει μόνη της στην επόμενη ανοιχτή');

/* — όλα κλειστά: ΤΟ ΜΟΝΟ ΣΗΜΕΙΟ ΠΟΥ ΛΕΕΙ «πέντε ενότητες» ΠΕΖΑ — */
var all16 = []; for (var z = 0; z < n16; z++) all16.push(z);
function allMap(n) { var o = {}; for (var i2 = 1; i2 <= n; i2++) o['s' + i2] = true; return o; }
var F = drive({
  'lectio16:v1': JSON.stringify(all16),
  'lectio17_known_v1': JSON.stringify(allMap(n17)),
  'lectio18_known_v1': JSON.stringify(allMap(n18)),
  'lectio19_known_v1': JSON.stringify(allMap(n19)),
  'lectio22_known_v1': JSON.stringify(allMap(n22))
});
eq(F.els.stKnown.textContent, String(TOTAL), 'όλα κλειστά → η ταινία λέει ' + TOTAL);
eq(F.els.stDone.textContent, String(PACKS.length), '   και ' + PACKS.length + ' ενότητες έκλεισαν');
eq(F.els.nxTtl.textContent, 'Και οι ' + WORD.toLowerCase() + ' ενότητες κλειδωμένες.',
  '⭐ και η κάρτα αλλάζει φωνή αντί να δείχνει κενό');
eq(F.els.nxGoT.textContent, 'Ξανά από την αρχή', '   με την επόμενη πράξη, όχι με συγχαρητήρια');
PACKS.forEach(function (pk) {
  ok(F.cards[pk.id].className.indexOf('is-next') < 0, '⛔ και καμία σειρά δεν είναι «επόμενη» (' + pk.id + ')');
});

console.log('\n  ' + pass + ' πέρασαν, ' + fail + ' απέτυχαν\n');
if (fail) process.exit(1);
