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
  { file: 'latinika-lectio16.html', v: 'SC', sha: 'cae5f04d02391cd44411d5634591aa553faf65d2e74cef0304810b7487725c5c' },
  { file: 'latinika-lectio17.html', v: 'S',  sha: '8596fc903d1a2a4e54f5cb569530f9b7a5168568721fe9bb1d5dc5869c36ddbd' },
  /* ⛔ ΧΩΡΙΣ sha ΕΠΙΤΗΔΕΣ. Το XVIII δεν ήρθε ως αρχείο του — γράφτηκε εδώ.
     Το φυλάει το §2β, που το συγκρίνει με ΤΟ ΒΙΒΛΙΟ, όχι με τον εαυτό του. */
  { file: 'latinika-lectio18.html', v: 'S' }
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
section('1 · τα τρία πακέτα (τα δύο δικά του, με hash)');

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

var n16 = SC.reduce(function (a, s) { return a + s.s.length; }, 0);
var n17 = S17.reduce(function (a, s) { return a + s.s.length; }, 0);
var n18 = S18.reduce(function (a, s) { return a + s.s.length; }, 0);
eq(SC.length, 3, 'XVI: τρεις σκηνές');
eq(n16, 16, 'XVI: δεκαέξι προτάσεις');
eq(S17.length, 3, 'XVII: τρεις σκηνές');
eq(n17, 11, 'XVII: έντεκα ενότητες');
eq(S18.length, 3, 'XVIII: τρεις σκηνές');
eq(n18, 11, 'XVIII: έντεκα ενότητες');

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
[['XVII', S17], ['XVIII', S18]].forEach(function (pair) {
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

function join18(pick) {
  return S18.map(function (sc) {
    return sc.s.map(function (u) { return pick(u).join(' '); }).join(' ');
  }).join(' ');
}
var pageLa = join18(function (u) { return u.la.map(function (w) { return w.w; }); });
var pageGr = join18(function (u) { return u.gr.map(function (g) { return g.t; }); });

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

/* ══ 3 · ⭐⭐ ΤΑ ΝΟΥΜΕΡΑ ΤΗΣ ΚΑΡΤΑΣ ΕΙΝΑΙ ΜΕΤΡΗΜΕΝΑ ═══════════════════ */
section('3 · η βιβλιοθήκη λέει ό,τι μετράνε τα πακέτα');

var HUB = R('latinika.html');
var L16 = R('latinika-lectio16.html');
var L17 = R('latinika-lectio17.html');
var L18 = R('latinika-lectio18.html');

function chips(lec) {
  var i = HUB.indexOf('data-lec="' + lec + '"');
  var j = HUB.indexOf('</a>', i);
  var block = HUB.slice(i, j);
  var out = [], re = /<i>([^<]+)<\/i>/g, m;
  while ((m = re.exec(block))) out.push(m[1]);
  return out;
}
function count(src, tagOpen) {
  var n = 0, i = 0;
  while ((i = src.indexOf(tagOpen, i)) >= 0) { n++; i += tagOpen.length; }
  return n;
}

var c16 = chips('16'), c17 = chips('17'), c18 = chips('18');
eq(c16[0], SC.length + ' σκηνές', 'XVI: οι σκηνές της κάρτας == οι σκηνές του πακέτου');
eq(c16[1], n16 + ' προτάσεις', 'XVI: οι προτάσεις της κάρτας == οι προτάσεις του πακέτου');
eq(c17[0], S17.length + ' σκηνές', 'XVII: οι σκηνές της κάρτας == οι σκηνές του πακέτου');
eq(c17[1], n17 + ' ενότητες', 'XVII: οι ενότητες της κάρτας == οι ενότητες του πακέτου');
eq(c18[0], S18.length + ' σκηνές', 'XVIII: οι σκηνές της κάρτας == οι σκηνές του πακέτου');
eq(c18[1], n18 + ' ενότητες', 'XVIII: οι ενότητες της κάρτας == οι ενότητες του πακέτου');

/* Οι «παγίδες» και οι «σημειώσεις» είναι χειροποίητες λίστες μέσα στα
   πακέτα — μετριούνται από ΕΚΕΙ, ποτέ από το μάτι μου. */
var traps = count(L16.slice(L16.indexOf('class="traps"'), L16.indexOf('class="plan"')), '<li>');
var notes = count(L17.slice(L17.indexOf('class="notes"'), L17.indexOf('class="foot"')), '<li>');
eq(c16[2], traps + ' παγίδες', 'XVI: οι παγίδες της κάρτας == οι παγίδες του πακέτου');
eq(c17[2], notes + ' σημειώσεις', 'XVII: οι σημειώσεις της κάρτας == οι σημειώσεις του πακέτου');

/* Το XVIII κουβαλάει ΚΑΙ τα δύο μπλοκ — παγίδες (σαν το XVI) και σημειώσεις
   (σαν το XVII). Η κάρτα διαφημίζει τις παγίδες· μετριούνται κι οι δύο, για
   να μη σβήσει ποτέ σιωπηλά το ένα. */
var traps18 = count(L18.slice(L18.indexOf('class="traps"'), L18.indexOf('class="notes"')), '<li>');
var notes18 = count(L18.slice(L18.indexOf('class="notes"'), L18.indexOf('class="foot"')), '<li>');
eq(c18[2], traps18 + ' παγίδες', 'XVIII: οι παγίδες της κάρτας == οι παγίδες του πακέτου');
ok(notes18 >= 1, 'XVIII: και το μπλοκ των σημειώσεων στέκει ακόμη (' + notes18 + ')');

/* Και το σύνολο του hero. Ένα «27» γραμμένο στο χέρι θα ξεχνιόταν με την
   τρίτη ενότητα· εδώ το πληρώνει το test την ίδια μέρα. */
ok(HUB.indexOf('<b>' + (n16 + n17 + n18) + '</b> προτάσεις') > 0,
  'το hero λέει το ΑΘΡΟΙΣΜΑ των τριών πακέτων (' + (n16 + n17 + n18) + ')');

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
ok(L18.indexOf('lectio17_known_v1') < 0,
  '⛔ και ΔΕΝ κληρονόμησε το κλειδί του XVII με copy-paste — θα μοιράζονταν πρόοδο');
ok(HUB.indexOf('lectio16:v1') > 0 && HUB.indexOf('lectio17_known_v1') > 0 &&
   HUB.indexOf('lectio18_known_v1') > 0,
  'η βιβλιοθήκη τα ΔΙΑΒΑΖΕΙ και τα τρία');

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
   δεν είχαν δει. Τα τρία πράγματα που πρέπει να αποδειχθούν:
     · τα ΔΥΟ διαφορετικά σχήματα (πίνακας vs χάρτης) μετριούνται σωστά,
     · «άδειο» και «δεν διαβάστηκε» ΔΕΝ ζωγραφίζονται ίδια (σταθ. 10),
     · χαλασμένα δεδομένα δεν γίνονται σιωπηλό μηδέν. */
section('6 · η ίδια η σελίδα, οδηγημένη');

function drive(store) {
  var cards = {};
  ['16', '17', '18'].forEach(function (id) {
    cards[id] = {
      bar: { style: {} },
      pct: { textContent: '', className: 'pct' }
    };
    cards[id].querySelector = function (sel) {
      return sel === '.bar i' ? cards[id].bar : cards[id].pct;
    };
  });
  var els = { ltHead: { innerHTML: '' }, ltSub: { innerHTML: '' }, ltN: { textContent: '' } };
  var raf = [];
  var doc = {
    querySelector: function (sel) {
      var m = sel.match(/data-lec="(\d+)"/);
      return m ? cards[m[1]] : null;
    },
    getElementById: function (id) { return els[id] || null; }
  };
  var sandbox = {
    document: doc,
    localStorage: {
      getItem: function (k) {
        if (store[k] === '__THROW__') throw new Error('SecurityError');
        return (k in store) ? store[k] : null;
      }
    },
    requestAnimationFrame: function (fn) { raf.push(fn); },
    setTimeout: function () { },
    window: {}
  };
  sandbox.window = sandbox;
  var src = HUB.slice(HUB.lastIndexOf('<script>') + 8, HUB.lastIndexOf('</script>'));
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox);
  /* Δύο περάσματα rAF — η μπάρα κινείται στο δεύτερο frame επίτηδες. */
  for (var p = 0; p < 3; p++) { var q = raf; raf = []; q.forEach(function (fn) { fn(); }); }
  return { cards: cards, els: els };
}

/* — καθαρή εγκατάσταση: τίποτα δεν ξεκίνησε — */
var A = drive({});
eq(A.cards['16'].pct.textContent, 'δεν ξεκίνησε', 'άδειο XVI → «δεν ξεκίνησε»');
eq(A.cards['17'].pct.textContent, 'δεν ξεκίνησε', 'άδειο XVII → «δεν ξεκίνησε»');
eq(A.cards['18'].pct.textContent, 'δεν ξεκίνησε', 'άδειο XVIII → «δεν ξεκίνησε»');
eq(A.els.ltN.textContent, '3 · 38 προτάσεις', 'ο μετρητής της ενότητας');
ok(A.els.ltHead.innerHTML.indexOf('<b>38</b>') >= 0, 'το hero δείχνει το σύνολο, όχι πρόοδο');

/* — ⭐ ΤΑ ΔΥΟ ΣΧΗΜΑΤΑ. ΠΙΝΑΚΑΣ αριστερά, ΧΑΡΤΗΣ δεξιά, στην ίδια σελίδα. — */
var B = drive({
  'lectio16:v1': JSON.stringify([0, 3, 7, 15]),
  'lectio17_known_v1': JSON.stringify({ s1: true, s2: false, s5: true, s9: true }),
  'lectio18_known_v1': JSON.stringify({ s2: true, s3: true })
});
eq(B.cards['16'].pct.textContent, '4/16 τα ξέρεις', '⭐ ΠΙΝΑΚΑΣ: 4 δείκτες → 4');
eq(B.cards['17'].pct.textContent, '3/11 τα ξέρεις', '⭐ ΧΑΡΤΗΣ: τα `false` ΔΕΝ μετράνε → 3');
eq(B.cards['18'].pct.textContent, '2/11 τα ξέρεις', '⭐ και το τρίτο κλειδί μετριέται χωριστά');
eq(B.cards['16'].bar.style.transform, 'scaleX(0.25)', 'και η μπάρα του XVI κινήθηκε');
ok(B.els.ltHead.innerHTML.indexOf('<b>9</b> από <b>38</b>') >= 0, 'το hero αθροίζει και τα τρία');
ok(B.els.ltSub.innerHTML.indexOf('<b>29</b>') >= 0, 'και λέει πόσα μένουν');

/* ⛔ ΤΟ ΠΙΟ ΕΥΚΟΛΟ ΛΑΘΟΣ ΤΗΣ ΠΡΟΣΘΗΚΗΣ: τα XVII και XVIII μοιράζονται
   μηχανή, άρα ένα copy-paste κλειδί θα έδειχνε την ΙΔΙΑ πρόοδο σε δύο
   κάρτες και κανείς δεν θα το πρόσεχε — και οι δύο θα ήταν «αληθινές». */
var B2 = drive({ 'lectio17_known_v1': JSON.stringify({ s1: true, s2: true, s3: true }) });
eq(B2.cards['17'].pct.textContent, '3/11 τα ξέρεις', 'το XVII βλέπει το δικό του κλειδί');
eq(B2.cards['18'].pct.textContent, 'δεν ξεκίνησε', '⛔ και το XVIII ΔΕΝ δανείζεται την πρόοδό του');

/* — ⛔ Η ΑΣΘΕΝΕΙΑ: κλειδωμένος δίσκος. ΔΕΝ επιτρέπεται «δεν ξεκίνησε». — */
var C = drive({ 'lectio16:v1': '__THROW__', 'lectio17_known_v1': '__THROW__', 'lectio18_known_v1': '__THROW__' });
eq(C.cards['16'].pct.textContent, 'δεν διαβάστηκε', '⛔ getItem πετάει → «δεν διαβάστηκε», ΟΧΙ 0');
eq(C.cards['16'].pct.className, 'pct dead', '   και ζωγραφίζεται διαφορετικά');
eq(C.cards['18'].pct.textContent, 'δεν διαβάστηκε', '   το ίδιο και το τρίτο');
ok(C.els.ltSub.innerHTML.indexOf('Δεν μπόρεσα να διαβάσω') >= 0, '   και το λέει και το hero');

/* — σπασμένο JSON, και λάθος σχήμα στο σωστό κλειδί — */
var D = drive({ 'lectio16:v1': '{not json', 'lectio17_known_v1': JSON.stringify([1, 2, 3]),
                'lectio18_known_v1': JSON.stringify([1, 2, 3]) });
eq(D.cards['16'].pct.textContent, 'δεν διαβάστηκε', 'σπασμένο JSON → «δεν διαβάστηκε»');
eq(D.cards['17'].pct.textContent, 'δεν διαβάστηκε', '⭐ ΠΙΝΑΚΑΣ σε κλειδί ΧΑΡΤΗ → «δεν διαβάστηκε», ΟΧΙ 0');
eq(D.cards['18'].pct.textContent, 'δεν διαβάστηκε', '   και στο XVIII, που μοιράζεται τον ίδιο μετρητή');

/* — και ένα παλιό αρχείο με παραπάνω δείκτες δεν ξεχειλίζει τη μπάρα — */
var E = drive({ 'lectio16:v1': JSON.stringify([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18]) });
eq(E.cards['16'].pct.textContent, '16/16 τα ξέρεις', 'δεν ξεπερνάει ποτέ το σύνολο');
eq(E.cards['16'].bar.style.transform, 'scaleX(1)', 'και η μπάρα σταματάει στο 100%');

console.log('\n  ' + pass + ' πέρασαν, ' + fail + ' απέτυχαν\n');
if (fail) process.exit(1);
