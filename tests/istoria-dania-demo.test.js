/* ══════════════════════════════════════════════════════════════════════
   Η ΔΟΚΙΜΗ ΜΟΡΦΗΣ ΤΩΝ ΕΘΝΙΚΩΝ ΔΑΝΕΙΩΝ — istoria-dania-demo.html

   Μια δοκιμή είναι σελίδα σαν όλες τις άλλες: μπορεί να γράψει σε ζωντανά
   δεδομένα, μπορεί να ανοίξει άδεια, μπορεί να πει ψέματα.  Αυτό το αρχείο
   κλειδώνει τα τέσσερα που θα το έκαναν άχρηστο ή επικίνδυνο.
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
var fs = require('fs');
var path = require('path');
var vm = require('vm');

var pass = 0, fail = 0;
function ok(msg, cond){ if (cond) { pass++; } else { fail++; console.log('  ✗ ' + msg); } }
function eq(a, b, msg){ ok(msg + '  (got ' + JSON.stringify(a) + ')', a === b); }

var ROOT = path.join(__dirname, '..');
var PAGE = fs.readFileSync(path.join(ROOT, 'istoria-dania-demo.html'), 'utf8');
/* ⚠️ Οι απαγορεύσεις ελέγχονται πάνω στον ΚΩΔΙΚΑ, όχι στη σελίδα: αλλιώς ο
   φρουρός σκαλώνει στο σχόλιο που τον τεκμηριώνει (σταθ. 19, πληρωμένη
   τέσσερις φορές σε αυτό το repo). */
var CODE = PAGE.replace(/<!--[\s\S]*?-->/g, '').replace(/\/\*[\s\S]*?\*\//g, '');

console.log('\nΤΑ ΕΘΝΙΚΑ ΔΑΝΕΙΑ — δοκιμή μορφής\n');

/* ══ Α · ⛔⛔ ΜΙΑ ΔΟΚΙΜΗ ΔΕΝ ΑΓΓΙΖΕΙ ΠΟΤΕ ΔΕΔΟΜΕΝΑ ═══════════════════════
   Σταθερή αρχή 8.  Το περιστατικό των ζυγίσεων έγινε επειδή ένα harness
   κουβαλούσε scripts συγχρονισμού· μια δοκιμή που ζει ΜΕΣΑ στο repo και
   φεύγει στο deploy είναι το ίδιο πράγμα με μόνιμη διεύθυνση. */
{
  var srcs = (PAGE.match(/<script[^>]+src="([^"]+)"/g) || [])
    .map(function (m) { return /src="([^"]+)"/.exec(m)[1]; });
  eq(srcs.length, 2, 'ΑΚΡΙΒΩΣ δύο εξωτερικά script');
  ['sync.js', 'pocoach-sync.js', 'vendor/supabase.min.js', 'topbar.js',
   'als-profile.js', 'als-sync-status.js', 'water.js'].forEach(function (bad) {
    ok('⛔ καμία δέσμη συγχρονισμού/ταυτότητας: ' + bad, srcs.indexOf(bad) < 0);
  });
  ['localStorage', 'sessionStorage', 'initCloudSync', 'supabase', 'fetch(',
   'XMLHttpRequest'].forEach(function (bad) {
    ok('⛔ ο κώδικας δεν αναφέρει ' + bad, CODE.indexOf(bad) < 0);
  });
}

/* ══ Β · ⛔⛔ ΤΟ `greek-ear.js` ΠΡΩΤΑ, ΚΑΙ ΕΙΝΑΙ ΥΠΟΧΡΕΩΤΙΚΟ ══════════════
   ΣΤΑΘΕΡΗ ΑΡΧΗ 37, ΚΑΙ ΤΗΝ ΠΛΗΡΩΣΕ ΑΥΤΗ Η ΣΕΛΙΔΑ.  Το `istoria-data.js`
   απαιτεί το αυτί με `throw` ΣΤΗ ΦΟΡΤΩΣΗ — σωστά, δεν σιωπά — οπότε χωρίς
   αυτό το `window.ISTORIA` μένει undefined για όλη τη ζωή της σελίδας και η
   δοκιμή ανοίγει ΑΔΕΙΑ.  Η πρώτη γραφή δήλωνε μόνο το `istoria-data.js` και
   ρεντεραρίστηκε κενή· **το είδε μόνο το console του render**, ποτέ η οθόνη.
   ⚠️ Η ΣΕΙΡΑ είναι μέρος του κανόνα: σωστή λίστα με λάθος σειρά είναι το
   ίδιο κενό. */
{
  var iEar = PAGE.indexOf('src="greek-ear.js"');
  var iDat = PAGE.indexOf('src="istoria-data.js"');
  ok('φορτώνει το greek-ear.js', iEar > 0);
  ok('φορτώνει το istoria-data.js', iDat > 0);
  ok('⛔ το greek-ear.js έρχεται ΠΡΙΝ τα δεδομένα', iEar > 0 && iEar < iDat);
}

/* ══ Γ · Η ΜΗΧΑΝΗ ΤΩΝ ΚΟΥΜΠΙΩΝ, ΤΡΕΧΟΝΤΑΣ ══════════════════════════════
   Το inline script οδηγείται σε `vm` με ψεύτικο DOM: χτίζει αληθινές
   στρώσεις πάνω στην ΑΛΗΘΙΝΗ `b9` και μας αφήνει να ρωτήσουμε τι έφτιαξε. */
{
  var win = {};
  new Function('window', fs.readFileSync(path.join(ROOT, 'greek-ear.js'), 'utf8'))(win);
  new Function('window', fs.readFileSync(path.join(ROOT, 'istoria-data.js'), 'utf8'))(win);
  var I = win.ISTORIA;
  ok('η ύλη φορτώνει έξω από φυλλομετρητή', !!(I && I.unit('b9')));

  var un = I.unit('b9');

  /* ── οι στρώσεις που ΠΡΕΠΕΙ να υπάρχουν, από τα ίδια τα δεδομένα ── */
  var wanted = [
    ['simple', (un.simple || []).length >= 3],
    ['text', (un.text || []).length >= 1],
    ['skel', !!un.skeleton],
    ['time', (un.timeline || []).length >= 1],
    ['table', (un.tables || []).length >= 1],
    ['words', ((un.terms || []).length + (un.vocab || []).length + (un.context || []).length) > 0]
  ];
  wanted.forEach(function (w) {
    ok('η b9 δικαιολογεί τη στρώση «' + w[0] + '»', w[1]);
    ok('η σελίδα χτίζει τη στρώση «' + w[0] + '»', CODE.indexOf("tab('" + w[0] + "'") > 0);
  });

  /* ⭐⭐ ΤΟ ΠΡΩΤΟ ΚΟΥΜΠΙ ΕΙΝΑΙ ΤΑ «ΑΠΛΑ ΛΟΓΙΑ», ΚΑΙ ΕΛΕΓΧΕΤΑΙ ΤΡΕΧΟΝΤΑΣ.
     Δικό του: «όταν μπαίνω ας ανοίγει το απλά λόγια».
     ⚠️⚠️ Η ΠΡΩΤΗ ΓΡΑΦΗ ΗΤΑΝ `indexOf("tab('simple'")` ΚΑΙ ΔΕΝ ΔΑΓΚΩΝΕ:
     ένα `if (0)` μπροστά της αφήνει το κείμενο ΣΤΗΝ ΙΔΙΑ ΘΕΣΗ με τον κώδικα
     ΝΕΚΡΟ, και ο φρουρός βγαίνει πράσινος πάνω σε σελίδα που ανοίγει στο
     λάθος κουμπί.  Σταθερή αρχή 40, δοκιμασμένη με μετάλλαξη: **έναν φρουρό
     που μπορεί να ικανοποιηθεί από κείμενο τον ικανοποιεί κάποια στιγμή
     κείμενο.**  Άρα κόβεται η ΠΕΡΙΟΧΗ που χτίζει τις στρώσεις και τρέχει. */
  (function () {
    var i0 = CODE.indexOf('var tabs = [];');
    var i1 = CODE.indexOf("h += '<nav class=\"tabs\"");
    ok('βρέθηκε η περιοχή που χτίζει τις στρώσεις', i0 > 0 && i1 > i0);
    var region = CODE.slice(i0, i1);

    /* Ό,τι χρειάζεται η περιοχή, στουμπωμένο — μας ενδιαφέρει ΠΟΙΕΣ στρώσεις
       γεννιούνται και ΜΕ ΤΙ ΣΕΙΡΑ, όχι τι HTML βγάζει η καθεμία. */
    var sandbox = {
      un: un, I: I, sk: un.skeleton, paras: un.text || [],
      nEls: 0, console: console,
      esc: function (x) { return String(x); },
      weigh: function (l) { return { w: 0, t: l }; },
      markAnchors: function (t) { return t; },
      defs: function (list) { return (list || []).length ? 'x' : ''; }
    };
    vm.createContext(sandbox);
    vm.runInContext(region + '\n;__out = tabs;', sandbox);
    var built = sandbox.__out.map(function (t) { return t.id; });

    eq(built[0], 'simple', '⛔ Η ΠΡΩΤΗ στρώση που γεννιέται είναι τα «απλά λόγια»');
    eq(built.join(','), 'simple,text,skel,time,table,words',
      'και οι έξι στρώσεις γεννιούνται με τη σειρά που τις δείχνει η μπάρα');
    eq(sandbox.__out[0].label, 'Με απλά λόγια', 'με την ετικέτα που λέει η πινακίδα');
  })();

  ok("το πρώτο κουμπί γεννιέται ανοιχτό", /\(i \? '' : ' on'\)/.test(CODE));
  ok('και μόνο το πρώτο φύλλο είναι ορατό', /\(i \? ' hidden' : ''\)/.test(CODE));

  /* ⛔ `data-lay`, ΠΟΤΕ `data-go` — το `data-go` ανήκει στον router των
     Αρχαίων· εδώ δεν υπάρχει router, αλλά το όνομα είναι πιασμένο και μια
     δοκιμή που το υιοθετεί το διδάσκει στην επόμενη σελίδα. */
  ok('⛔ κανένα `data-go` στη σελίδα', CODE.indexOf('data-go') < 0);
  ok('τα κουμπιά φέρουν `data-lay`', CODE.indexOf('data-lay="') > 0);
}

/* ══ Δ · ⭐⭐ ΤΑ ΑΣΤΕΡΙΑ ΤΟΥ CORPUS ΕΙΝΑΙ ΒΑΡΥΤΗΤΑ, ΟΧΙ ΚΕΙΜΕΝΟ ═══════════
   Κάθε γραμμή των «απλών λόγων» της Ιστορίας αρχίζει με ⭐/⭐⭐/⭐⭐⭐.  Είναι
   καθαρή ιεράρχηση, γραμμένη σαν κείμενο επειδή δεν υπήρχε αλλού να ζήσει —
   και τυπωμένη αυτούσια μοιάζει με emoji σε σελίδα ανάγνωσης.
   ⛔ ΚΟΒΕΤΑΙ ΜΟΝΟ Η ΑΡΧΙΚΗ ΣΕΙΡΑ.  Τα ⚠️/⛔/⭐ ΜΕΣΑ στην πρόταση είναι
   μέρος του νοήματος και μένουν — αυτό είναι δηλωμένο, όχι παράλειψη. */
{
  var m = /function weigh\(line\)\{[\s\S]*?\n  \}/.exec(CODE);
  ok('υπάρχει η weigh()', !!m);
  var weigh = new Function('return (' + m[0].replace(/^function/, 'function') + ')')();

  var t3 = weigh('⭐⭐⭐ ΚΑΙ ΤΟ ΝΟΥΜΕΡΟ. ⚠️ Μένει.');
  eq(t3.w, 3, 'τρία αστέρια → βαρύτητα 3');
  eq(t3.t, 'ΚΑΙ ΤΟ ΝΟΥΜΕΡΟ. ⚠️ Μένει.', '⛔ το ⚠️ ΜΕΣΑ στην πρόταση ΔΕΝ αγγίζεται');

  eq(weigh('⭐ Ένα.').w, 1, 'ένα αστέρι → βαρύτητα 1');
  eq(weigh('Χωρίς αστέρι.').w, 0, 'καμία αρχική σειρά → βαρύτητα 0');
  eq(weigh('Χωρίς αστέρι.').t, 'Χωρίς αστέρι.', 'και το κείμενο μένει ακέραιο');

  /* ⚠️ Το «⭐» είναι U+2B50 και σε κάποιες πηγές έρχεται με variation
     selector U+FE0F.  Ολόιδιο στην όψη, και χωρίς αυτό μένει ένα ΑΟΡΑΤΟ
     ορφανό στην αρχή της πρότασης — το είδος του λάθους που κανείς δεν
     ψάχνει γιατί δεν φαίνεται. */
  eq(weigh('⭐️⭐️ Δύο.').t, 'Δύο.',
    '⚠️ κόβεται και η μορφή ΜΕ variation selector');
  eq(weigh('⭐️⭐️ Δύο.').w, 2, 'και μετράει σωστά τη βαρύτητα');
}

/* ══ Ε · ⛔ Η ΠΙΝΑΚΙΔΑ ΔΕΝ ΟΝΟΜΑΖΕΙ ΟΘΟΝΗ ΠΟΥ ΔΕΝ ΥΠΑΡΧΕΙ ════════════════
   Το λάθος της als-v499, που ξαναχτύπησε στην als-v532 από την ανάποδη:
   σωστός κώδικας που τυπώνει ψεύτικο κείμενο, και καμία βεβαίωση δεν το
   αγγίζει.  Ό,τι ονομάζει η πινακίδα ΠΡΕΠΕΙ να υπάρχει ως κουμπί. */
{
  var sign = /<p class="sign">[\s\S]*?<\/p>/.exec(CODE);
  ok('υπάρχει η πινακίδα', !!sign);
  var txt = sign ? sign[0] : '';
  [['Με απλά λόγια', 'simple'], ['Το κείμενο', 'text']].forEach(function (p) {
    ok('η πινακίδα ονομάζει «' + p[0] + '» ΚΑΙ το κουμπί υπάρχει',
      txt.indexOf(p[0]) > 0 && CODE.indexOf("tab('" + p[1] + "', '" + p[0] + "'") > 0);
  });
  ok('⛔ η πινακίδα δεν υπόσχεται βαθμό', !/βαθμ/.test(txt));
}

console.log('\n' + (fail ? '✗' : '✓') + ` istoria-dania-demo: ${pass} πέρασαν, ${fail} έπεσαν\n`);
process.exit(fail ? 1 : 0);
