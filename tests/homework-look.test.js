/* ══════════════════════════════════════════════════════════════════
   ΤΟ ΔΩΜΑΤΙΟ ΤΩΝ ΕΡΓΑΣΙΩΝ — ΣΥΜΒΟΛΑΙΟ ΟΨΗΣ (als-v508)

   Αντιγραμμένο από το `tests/arxaia-laptop.test.js`, γιατί ο κανόνας είναι
   ο ίδιος: **ΤΟ ΛΑΠΤΟΠ ΔΕΝ ΕΙΝΑΙ ΜΕΓΑΛΟ ΚΙΝΗΤΟ** (σταθ. 51). Δικά του
   λόγια: *«οτιδηποτε σου ζητω να φτιαχνεις παντα το κανεις σε μορφη κινητου
   και ασχημο… απο το λαπτοπ θα διαβαζω»*.

   ⚠️ ΑΥΤΟ ΤΟ ΑΡΧΕΙΟ ΔΕΝ ΕΛΕΓΧΕΙ ΓΟΥΣΤΟ. Ελέγχει τα ΝΟΥΜΕΡΑ που μετρήθηκαν
   σε render 1440×900 του live και ήταν η αιτία που η σελίδα «έμοιαζε
   κινητού»: το πλάτος του γονέα, τα `min-width` που σπάνε ανάποδα, την
   ιεραρχία μεγεθών, και το ότι η αλλαγή ΔΕΝ διέρρευσε στις άλλες πόρτες.
   ══════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');

const PAGE = fs.readFileSync(path.join(__dirname, '..', 'homework.html'), 'utf8');
const CSS = PAGE.slice(PAGE.indexOf('<style>') + 7, PAGE.indexOf('</style>'));
/* Οι απαγορεύσεις ελέγχονται πάνω στον ΚΩΔΙΚΑ, ποτέ στα σχόλια — αλλιώς ο
   φρουρός πιάνει το σχόλιο που τεκμηριώνει την ίδια την απαγόρευση και
   κάποιος τον χαλαρώνει (σταθ. 19, τέσσερις φορές σε αυτό το repo). */
const CODE = CSS.replace(/\/\*[\s\S]*?\*\//g, ' ');

let pass = 0, fail = 0;
const ok = (m, c) => { c ? (pass++, console.log('  ✓ ' + m))
                         : (fail++, console.log('  ✗ FAIL ' + m)); };
const section = t => console.log('\n' + t);

/* ─────────────────────────────────────────────────────────────── */
section('1 · ΤΟ ΚΛΟΥΒΙ — μέτρα τον γονέα πριν σχεδιάσεις μέσα του');

ok('το δωμάτιο των εργασιών φαρδαίνει στα 1180 για laptop',
  /body\.hw-door-ergasies \.hw-wrap\{\s*max-width:1180px/.test(CODE));
ok('⛔ και οι ΑΛΛΕΣ πόρτες μένουν στα 720 — εκεί το πλάτος θα ήταν λάθος',
  /body\.hw-door \.hw-wrap\{\s*max-width:720px/.test(CODE));
/* ⭐⭐ als-v580 · ΤΟ ΚΕΝΤΡΟ ΑΓΓΙΧΤΗΚΕ, ΕΠΙΤΗΔΕΣ, ΚΑΙ ΜΕ ΤΟΝ ΙΔΙΟ ΚΑΝΟΝΑ.
   Η als-v508 είχε δίκιο να το αφήσει στα 880: τότε το Κέντρο ήταν τέσσερα
   πράγματα σε μία στήλη. Τώρα είναι εξώφυλλο + ταινία + ΠΕΝΤΕ κάρτες σε δύο
   σειρές τριών στηλών + η μέρα, δηλαδή ο ΟΓΚΟΣ άλλαξε ξανά — και η σταθ. 36
   λέει ότι τότε ξαναμετριέται η διάταξη, όχι ότι κρατιέται. Μετρημένο: στα
   880 η κάθε κάρτα της πρώτης σειράς έβγαινε 273px.
   ⛔ Αυτό που ΔΕΝ αλλάζει είναι η ΠΡΟΖΑ στα 560 — δες την ενότητα 1 του
   `tests/homework-plan.test.js`, που το κλειδώνει ξεχωριστά. */
ok('το ΚΕΝΤΡΟ πιάνει πλάτος λάπτοπ, όπως και το δωμάτιο',
  /body:not\(\.hw-door\) \.hw-wrap\{\s*max-width:1180px/.test(CODE));

section('2 · ⛔⛔ ΚΑΝΕΝΑ min-width — η ανάποδη θραύση');
/* Ένα `@media(min-width:…)` μετράει το VIEWPORT, όχι τον γονέα: μέσα σε
   γονέα 620px άνοιξε δύο στήλες των 280px σε οθόνη 2000px. ΑΥΤΟ είναι η
   «μορφή κινητού» που βλέπει. Η πλήρης όψη γράφεται ΠΡΩΤΑ και το τηλέφωνο
   τη ΜΑΖΕΥΕΙ με max-width.
   ⚠️ Το `min-width:1000px` του ΚΕΝΤΡΟΥ προϋπάρχει και δεν το εισάγει αυτή η
   αλλαγή — εξαιρείται ΟΝΟΜΑΣΤΙΚΑ ώστε η εξαίρεση να είναι ορατή, όχι κρυφή. */
/* ⚠️ Η ΠΡΩΤΗ ΓΡΑΦΗ ΑΠΑΙΤΟΥΣΕ «μόνο 1000px» ΚΑΙ ΚΟΚΚΙΝΙΣΕ ΓΙΑ ΚΑΤΙ ΣΩΣΤΟ: η
   σελίδα έχει ΚΑΙ ένα προϋπάρχον `min-width:1300px`. Ήταν στιγμιότυπο, όχι
   ιδιότητα (als-v453, ο ίδιος κανόνας). Αυτό που πρέπει να ισχύει ΓΙΑ ΠΑΝΤΑ
   είναι ότι **το δωμάτιο των εργασιών δεν χτίζεται ΠΟΤΕ σε min-width** — εκεί
   γεννιέται η ανάποδη θραύση, γιατί το media query μετράει το VIEWPORT ενώ η
   στήλη ζει μέσα σε γονέα. Τι κάνουν οι ΑΛΛΕΣ όψεις δεν το ορίζει αυτό το
   αρχείο. */
const MINQ = (CODE.match(/@media \(min-width:\d+px\)\{[\s\S]*?\n  \}/g) || []);
ok('υπάρχουν min-width blocks να ελεγχθούν (προϋπάρχοντα)', MINQ.length > 0);
ok('⛔ και ΚΑΝΕΝΑ δεν αγγίζει το δωμάτιο των εργασιών',
  MINQ.every(q => q.indexOf('hw-door-ergasies') < 0));
ok('η σειρά του δωματίου ζει ΜΟΝΟ σε max-width, ποτέ σε min-width',
  /@media \(max-width:999px\)\{[\s\S]*?body\.hw-door-ergasies \.hw-grab\{ order:1/.test(CODE));

section('3 · Η ΙΕΡΑΡΧΙΑ — η ετικέτα δεν φωνάζει πιο δυνατά από το περιεχόμενο');
/* Μετρημένο στο live: το μεγαλύτερο στοιχείο ήταν 20px και ήταν η ΕΤΙΚΕΤΑ
   ΤΟΥ INPUT· οι εργασίες ήταν 14.5px, το 4ο μεγαλύτερο. */
const tok = n => {
  const m = CODE.match(new RegExp('--t-' + n + ':\\s*([\\d.]+)px'));
  return m ? parseFloat(m[1]) : null;
};
const T = { mono: tok('mono'), meta: tok('meta'), body: tok('body'),
            title: tok('title'), loud: tok('loud'), mast: tok('mast') };
ok('και τα έξι μεγέθη της κλίμακας δηλώνονται', Object.values(T).every(v => v));
ok('η κλίμακα είναι ΑΥΞΟΥΣΑ, χωρίς ισοπαλίες',
  T.mono < T.meta && T.meta < T.body && T.body < T.title &&
  T.title < T.loud && T.loud < T.mast);
ok('η ΕΡΓΑΣΙΑ είναι μεγαλύτερη από κάθε ετικέτα', T.body > T.meta && T.body > T.mono);
ok('το ΕΚΠΡΟΘΕΣΜΟ είναι μεγαλύτερο από την κανονική εργασία', T.loud > T.body);
ok('ο τίτλος της εργασίας διαβάζεται σε serif, όχι σε sans',
  /body\.hw-door-ergasies \.hw-title\{[^}]*font-family:var\(--hw-gr\)/.test(CODE));

section('4 · ⛔ Η GEORGIA ΑΠΑΓΟΡΕΥΕΤΑΙ, ΑΚΟΜΗ ΚΑΙ ΩΣ FALLBACK');
/* σταθ. 43 + als-v504: η Instrument Serif έχει ΜΗΔΕΝ ελληνικά γλυφά, οπότε
   κάθε ελληνικός serif τίτλος έπεφτε στη Georgia — που έχει 74 ελληνικά και
   ΜΗΔΕΝ πολυτονικά. Ήταν η ΑΙΤΙΑ του «οι τόνοι δεν είναι σωστοί». */
const GR = (CODE.match(/--hw-gr:([^;]+);/) || [])[1] || '';
ok('η σελίδα δηλώνει δική της ελληνική serif στοίβα', GR.length > 0);
ok('και ξεκινάει από GFS Didot, όπως κατέληξαν τα Αρχαία', /GFS Didot/.test(GR));
ok('⛔ και ΔΕΝ αναφέρει Georgia πουθενά μέσα της', !/Georgia/i.test(GR));
ok('ο τίτλος του δωματίου φοράει ΑΥΤΗ τη στοίβα, όχι την --au-serif',
  /\.hw-emast h2\{[^}]*font-family:var\(--hw-gr\)/.test(CODE));

section('5 · Η ΔΕΞΙΑ ΖΩΝΗ — 214px νεκρού κενού έγιναν 104');
ok('η ζώνη της ημερομηνίας είναι 104px στο δωμάτιο',
  /body\.hw-door-ergasies \.hw-tright\{[^}]*width:104px/.test(CODE));
ok('⛔ και το ΑΡΧΙΚΟ min-width:214px δεν ισχύει εκεί — παρακάμπτεται με min-width:0',
  /body\.hw-door-ergasies \.hw-tright\{[^}]*min-width:0/.test(CODE));

section('6 · ΤΟ ΧΡΩΜΑ ΕΙΝΑΙ ΠΕΡΙΟΧΗ, ΟΧΙ ΓΡΑΤΖΟΥΝΙΑ 2×13px');
ok('η ομάδα γίνεται κάρτα με ράγα στο ύψος της',
  /body\.hw-door-ergasies \.hw-tg::before\{[^}]*width:3px/.test(CODE));
ok('και η παλιά τρίχα των 2px κρύβεται, αντί να λέει το ίδιο δεύτερη φορά',
  /body\.hw-door-ergasies \.hw-tghd \.tg-b\{ display:none/.test(CODE));
ok('το «πέρασε» έχει ΔΙΚΟ του κανάλι, χωριστό από το χρώμα του μαθήματος',
  /body\.hw-door-ergasies \.hw-task\.hw-late::before\{[^}]*--hw-late/.test(CODE));
/* ⚠️ ΤΟ -13 ΕΙΝΑΙ ΜΕΤΡΗΜΕΝΟ: στο -23 έπεφτε ΠΑΝΩ στη ράγα της ομάδας (η
   κάρτα έχει padding-left:23px), το βιολετί γινόταν δίχρωμο και διαβαζόταν
   ΣΠΑΣΜΕΝΟ αντί για επείγον. Δύο σήματα δεν μοιράζονται pixel. */
ok('και ΔΕΝ κάθεται πάνω στη ράγα της ομάδας',
  /body\.hw-door-ergasies \.hw-task\.hw-late::before\{[^}]*left:-13px/.test(CODE));

section('7 · ⛔ Η ΑΛΛΑΓΗ ΔΕΝ ΔΙΑΡΡΕΕΙ — κάθε κανόνας είναι σκοπευμένος');
/* Ο πιο ακριβός τρόπος να σπάσει αυτή η αλλαγή είναι ένας γυμνός κανόνας που
   τον φοράει ΚΑΙ άλλη πόρτα (σταθ. 26: το `.hw-tacts` άφησε τα κουμπιά της
   κάρτας ΜΙΑ ΑΠΟΦΑΣΗ μόνιμα αόρατα). Κάθε νέα γραμμή ξεκινάει με το scope. */
/* ⚠️⚠️ Η ΠΡΩΤΗ ΓΡΑΦΗ ΑΥΤΟΥ ΤΟΥ ΦΡΟΥΡΟΥ ΗΤΑΝ ΛΑΘΟΣ ΚΑΙ ΚΑΤΗΓΟΡΟΥΣΕ ΣΩΣΤΟ CSS
   (σταθ. 30). Απαιτούσε να ΜΗΝ υπάρχει καμία γυμνή `.hw-tg` / `.hw-task` /
   `.hw-title` — αλλά αυτές είναι οι ΒΑΣΙΚΕΣ κλάσεις της σελίδας, προϋπάρχουν
   της als-v508 και ΠΡΕΠΕΙ να υπάρχουν γυμνές· τις φοράει και το ΚΕΝΤΡΟ.
   Ο κανόνας που φυλάμε δεν είναι «καμία γυμνή κλάση», είναι **καμία ΝΕΑ
   ΔΗΛΩΣΗ έξω από το scope**. Άρα ψάχνουμε τις υπογραφές που εισήγαγε αυτή η
   αλλαγή και απαιτούμε ο κανόνας που τις κουβαλάει να ονομάζει την πόρτα. */
/* ⚠️⚠️ als-v580: ΤΟ `font-family:var(--hw-gr)` ΒΓΗΚΕ ΑΠΟ ΑΥΤΗ ΤΗ ΛΙΣΤΑ, ΚΑΙ
   ΔΕΝ ΕΙΝΑΙ ΧΑΛΑΡΩΣΗ — ΕΙΝΑΙ ΔΙΟΡΘΩΣΗ ΤΟΥ ΤΙ ΦΥΛΑΕΙ Ο ΦΡΟΥΡΟΣ. Ήταν εδώ ως
   «υπογραφή του δωματίου των εργασιών». Δεν είναι: είναι Η ΕΛΛΗΝΙΚΗ SERIF
   ΤΗΣ ΣΕΛΙΔΑΣ (σταθ. 43 — η `--au-serif` είναι Instrument Serif, με ΜΗΔΕΝ
   ελληνικά γλυφά, άρα κάθε ελληνικός τίτλος που τη φοράει πέφτει στη
   Georgia, που απαγορεύεται ρητά εδώ). Από τη στιγμή που το Κέντρο απέκτησε
   ελληνικούς serif τίτλους, ΠΡΕΠΕΙ να τη φοράει κι αυτό.
   ⭐ Στη θέση του μπαίνει ο έλεγχος που ΟΝΤΩΣ μετράει, στην ενότητα 7b:
   ποιος φοράει ελληνική serif και ποιος λατινική. */
const SIGS = [
  'grid-template-columns:21px',           /* η νέα γραμμή */
  'var(--t-loud)', 'var(--t-mast)',       /* η νέα κλίμακα */
  'width:104px'                           /* η μαζεμένη δεξιά ζώνη */
];
/* Κάθε κανόνας = ό,τι υπάρχει ανάμεσα στο προηγούμενο `}` και το `{`. */
const RULES = CODE.split('}').map(chunk => {
  const i = chunk.indexOf('{');
  return i < 0 ? null : { sel: chunk.slice(0, i), body: chunk.slice(i + 1) };
}).filter(Boolean);
SIGS.forEach(sig => {
  const carriers = RULES.filter(r => r.body.indexOf(sig) > -1);
  ok('η υπογραφή «' + sig + '» υπάρχει στο φύλλο', carriers.length > 0);
  ok('  και ΚΑΘΕ κανόνας που τη φοράει ονομάζει την πόρτα ή είναι token',
    carriers.every(r => r.sel.indexOf('hw-door-ergasies') > -1 ||
                        r.sel.indexOf(':root') > -1 ||
                        r.sel.indexOf('.hw-emast') > -1));
});

section('7b · ⭐⭐ ΕΛΛΗΝΙΚΗ SERIF ΣΤΑ ΕΛΛΗΝΙΚΑ, ΛΑΤΙΝΙΚΗ ΣΤΑ ΛΑΤΙΝΙΚΑ (σταθ. 43)');
/* ⛔ Η `--au-serif` είναι "Instrument Serif" και έχει ΜΗΔΕΝ ελληνικά γλυφά.
   Ένας ελληνικός τίτλος που τη φοράει πέφτει σιωπηλά στη **Georgia** — που
   είναι η ΑΙΤΙΑ του «οι τόνοι δεν είναι σωστοί» των Αρχαίων (als-v504) και
   απαγορεύεται ρητά σε αυτή τη σελίδα. Κανένα κοκκίνισμα, κανένα σφάλμα:
   απλώς λάθος γράμματα. Γι' αυτό ο έλεγχος είναι ΑΝΑ ΚΑΝΟΝΑ, με ονόματα.
   ⚠️ Το ΑΝΤΙΣΤΡΟΦΟ είναι εξίσου λάθος: «School Studies» και τα ΝΟΥΜΕΡΑ είναι
   λατινικά, και η GFS Didot εκεί δεν είναι η γραμματοσειρά που διάλεξε. */
{
  const GREEK_SERIF = [
    '.ks-sh h2',            /* «Τα μαθήματά μου», «Δευτέρα στο φροντιστήριο» */
    '.hw-l4 h3',            /* «Αρχαία · γνωστό», «Ιστορία», «Λατινικά»      */
    '.hw-l4 .hw-face p',    /* το ΑΥΤΟΛΕΞΕΙ κείμενο του βιβλίου              */
    '.ks-moodk p',          /* «Γιατί το κάνεις.»                            */
    '.hw-emast h2'          /* «Οι εργασίες μου» — προϋπάρχον                 */
  ];
  const LATIN_SERIF = [
    '.ks-mast h1',                    /* School Studies */
    '.ks-mast .ks-lead',              /* Dream big, study hard…              */
    '.ks-cdn b', '.ks-big b',         /* ΝΟΥΜΕΡΑ                              */
    '.hw-l4 .hw-face.is-num b'        /* ΝΟΥΜΕΡΑ                              */
  ];
  const decl = sel => {
    const re = new RegExp(sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\{([^}]*)\\}');
    const m = CODE.match(re);
    return m ? m[1] : null;
  };
  GREEK_SERIF.forEach(sel => {
    const d = decl(sel);
    ok('ο κανόνας «' + sel + '» υπάρχει', !!d);
    ok('  και φοράει την ΕΛΛΗΝΙΚΗ στοίβα (--hw-gr)', !!d && /font-family:var\(--hw-gr\)/.test(d));
    ok('  ⛔ και ΠΟΤΕ την --au-serif', !!d && !/var\(--au-serif/.test(d));
  });
  LATIN_SERIF.forEach(sel => {
    const d = decl(sel);
    ok('ο κανόνας «' + sel + '» υπάρχει', !!d);
    ok('  και φοράει τη ΛΑΤΙΝΙΚΗ στοίβα (--au-serif)', !!d && /font-family:var\(--au-serif/.test(d));
  });
  /* ⛔ ΚΑΙ Η ΑΙΤΙΑ ΔΕΝ ΓΥΡΙΖΕΙ ΑΠΟ ΤΗΝ ΠΙΣΩ ΠΟΡΤΑ: καμία Georgia ως fallback
     σε κανέναν από τους ελληνικούς κανόνες. */
  ok('⛔ κανένας ελληνικός serif κανόνας δεν αναφέρει Georgia',
    GREEK_SERIF.every(sel => { const d = decl(sel); return !d || !/Georgia/i.test(d); }));
}

section('7c · ⭐ ΤΟ ΚΕΝΤΡΟ ΔΕΝ ΣΒΗΝΕΙ ΔΥΝΑΤΟΤΗΤΑ — ΤΗ ΜΕΤΑΚΟΜΙΖΕΙ');
/* ⛔⛔ Ο ΠΙΟ ΑΚΡΙΒΟΣ ΤΡΟΠΟΣ ΝΑ ΣΠΑΣΕΙ ΑΥΤΗ Η ΑΛΛΑΓΗ: να κρυφτεί κάτι από το
   Κέντρο και να ΜΗΝ εμφανιστεί πουθενά αλλού. Τότε μια δυνατότητα πεθαίνει
   σιωπηλά, με όλα τα tests πράσινα — το `#programma` έζησε 50 εκδόσεις έτσι.
   Κάθε μπλοκ που κρύβεται εδώ ΠΡΕΠΕΙ να έχει κανόνα που το ξαναδείχνει. */
{
  const HIDDEN = ['hw-start', 'hw-doors', 'hw-grab', 'hw-apog'];
  const hideRule = (CODE.match(/body:not\(\.hw-door\) \.hw-cover,[\s\S]*?\{ display:none; \}/) || [])[0] || '';
  ok('υπάρχει ο κανόνας που ξακρίζει το Κέντρο', hideRule.length > 0);
  HIDDEN.forEach(c => {
    ok('το «' + c + '» κρύβεται στο Κέντρο', hideRule.indexOf('.' + c + '{') > -1 ||
       hideRule.indexOf('.' + c + ',') > -1 || hideRule.indexOf('.' + c + '\n') > -1);
  });
  ok('⭐ και η ΣΥΛΛΗΨΗ ξαναφαίνεται στο δωμάτιο των εργασιών',
    /\.hw-tasks\{ display:none; \}/.test(CODE) &&
    /body\.hw-door-ergasies \.hw-tasks\{ display:block; \}/.test(CODE) &&
    !/body\.hw-door(-\w+)? \.hw-grab\{ display:none/.test(CODE.replace(/body\.hw-door-(tonight|diagonismata) \.hw-grab\{ display:none; \}/g, '')));
  ok('⭐ η ΜΙΑ ΑΠΟΦΑΣΗ ξαναφαίνεται εκεί, με ΡΗΤΗ ειδικότητα',
    /body\.hw-door\.hw-door-ergasies \.hw-start\{ display:block/.test(CODE));
  ok('⭐ και οι ΠΟΡΤΕΣ το ίδιο',
    /body\.hw-door\.hw-door-ergasies \.hw-doors\{ display:grid/.test(CODE));
  ok('⛔ αλλά ΟΧΙ ο σύνδεσμος προς το δωμάτιο που ήδη είσαι',
    /body\.hw-door-ergasies \.hw-doors > a\[href="#ergasies"\]\{ display:none; \}/.test(CODE));
  /* ⚠️ ΚΑΙ ΤΑ ΤΕΣΣΕΡΑ HASH ΖΟΥΝ: δύο από αυτά είναι προορισμοί PUSH (18:00
     και 21:45). Ένα σπασμένο hash εκεί είναι ειδοποίηση που πάει σε τοίχο. */
  ['capture', 'tonight', 'ergasies', 'programma', 'diagonismata'].forEach(d => {
    ok('η πόρτα «' + d + '» έχει ΚΑΙ toggle ΚΑΙ κανόνα CSS',
      new RegExp("cl\\.toggle\\('hw-door-" + d + "'").test(PAGE) &&
      new RegExp("hw-door-" + d + " \\.").test(CODE));
  });
}

/* Και το masthead είναι ΤΟ ΙΔΙΟ κρυφό παντού αλλού, οπότε οι δικοί του
   κανόνες επιτρέπεται να μην ονομάζουν την πόρτα. */
ok('το masthead είναι κρυφό παντού εκτός από το δωμάτιο',
  /\.hw-emast\{ display:none/.test(CODE) &&
  /body\.hw-door-ergasies \.hw-emast\{ display:block/.test(CODE));

section('8 · ⛔ ΠΙΣΩ ΑΠΟ ΠΟΡΤΑ ΤΙΠΟΤΑ ΔΕΝ ΓΕΝΝΙΕΤΑΙ ΑΟΡΑΤΟ (σταθ. 39)');
/* ⚠️ Η ΠΡΩΤΗ ΓΡΑΦΗ ΕΨΑΧΝΕ `/hw-emast[^>]*data-rise/` ΣΕ ΟΛΗ ΤΗ ΣΕΛΙΔΑ και
   κοκκίνιζε ΨΕΥΤΙΚΑ: το `[^>]*` περνούσε μέσα από το CSS — όπου δεν υπάρχει
   `>` — από τους κανόνες `.hw-emast` ως τον φρουρό `body.hw-door [data-rise]`.
   Ο έλεγχος πρέπει να γίνει στο ΣΤΟΙΧΕΙΟ, όχι στο αρχείο. */
  const EMTAG = (PAGE.match(/<header class="hw-emast"[^>]*>/) || [''])[0];
  ok('η υπογραφή υπάρχει ως στοιχείο', EMTAG.length > 0);
  ok('και ΔΕΝ φοράει data-rise', EMTAG.indexOf('data-rise') < 0);
  ok('ούτε μπαίνει στον αυτόματο επιλογέα του page-motion',
    (PAGE.match(/__pmAutoSel='([^']*)'/) || ['',''])[1].indexOf('hw-emast') < 0);
ok('και ο φρουρός του page-motion για τις πόρτες είναι ακόμη εκεί',
  /body\.hw-door \[data-rise\]\{ opacity:1 !important/.test(CODE));

section('9 · ΤΟ ΟΝΟΜΑ ΔΕΝ ΛΕΓΕΤΑΙ ΔΥΟ ΦΟΡΕΣ (als-v477 · v487 · v508)');
ok('η μπάρα της πόρτας σωπαίνει όταν ο τίτλος το λέει ήδη',
  /body\.hw-door-ergasies \.hw-doorbar \.hw-dn\{ display:none/.test(CODE));
ok('⛔ αλλά η ΕΞΟΔΟΣ μένει — μια πόρτα χωρίς έξοδο είναι αδιέξοδο',
  !/body\.hw-door-ergasies[^\n]*\.hw-dx\{[^}]*display:none/.test(CODE) &&
  /data-door="full"/.test(PAGE));
ok('και ο διπλός μετρητής κρύβεται, αφού το lead τον λέει σε πρόταση',
  /body\.hw-door-ergasies \.hw-tasks > \.hw-sec-count\{ display:none/.test(CODE));

section('10 · Η ΓΕΩΜΕΤΡΙΑ ΤΩΝ ΣΥΝΤΕΛΕΣΤΩΝ — ΑΝΑ exam, ΠΟΤΕ ΑΝΑ ΚΛΕΙΔΙ');
/* Τρία κλειδιά των Αρχαίων δηλώνουν ΟΛΑ 30 γιατί το ΓΡΑΠΤΟ είναι ΕΝΑ. Ανά
   κλειδί το άθροισμα βγαίνει 140% — επινοημένος αριθμός (σταθ. 33). */
const EW = PAGE.slice(PAGE.indexOf('function examWeights'),
                      PAGE.indexOf('function renderTasks'));
ok('το examWeights υπάρχει και μπορεί να κοπεί', EW.length > 0);
ok('αθροίζει ΑΝΑ exam', /m\.exam \|\| k/.test(EW) && /if \(seen\[ex\]\) return;/.test(EW));
ok('⛔ και ΔΕΝ οδηγείται από το L4_GROUPS, που ενώνει Ιστορία+Λατινικά',
  EW.indexOf('L4_GROUPS') < 0);
ok('η σειρά της μπάρας διαβάζει τον ΙΔΙΟ taskGroupRank με τις κάρτες',
  /rank:taskGroupRank\(ex\)/.test(EW));

/* ⚠️ Η ΑΡΙΘΜΗΤΙΚΗ ΤΡΕΧΕΤΑΙ, ΔΕΝ ΔΗΛΩΝΕΤΑΙ. Ένα regex θα περνούσε και τη
   μέρα που το `weight` γίνει λάθος. Κόβεται το SUBJ + το SUBJ_ORDER και
   αθροίζονται πραγματικά. */
section('11 · και το άθροισμα ΤΡΕΧΕΙ, δεν το πιστεύουμε');
/* ⚠️ Η ΠΡΩΤΗ ΓΡΑΦΗ ΕΚΟΒΕ «SUBJ → subjRgb» και κουβαλούσε κώδικα που δεν
   στέκει μόνος του σε vm, οπότε το catch σιωπούσε και ο φρουρός κοκκίνιζε για
   λάθος λόγο. Κόβεται ΜΟΝΟ το object literal, με μέτρημα αγκυλών — ένα regex
   σταματάει στο πρώτο `}` και το SUBJ έχει φωλιασμένα αντικείμενα. */
const vm = require('vm');
const S0 = PAGE.indexOf('  var SUBJ = {');
let depth = 0, S1 = -1;
for (let i = PAGE.indexOf('{', S0); i < PAGE.length; i++){
  if (PAGE[i] === '{') depth++;
  else if (PAGE[i] === '}'){ depth--; if (!depth){ S1 = i + 1; break; } }
}
ok('το SUBJ μπορεί να κοπεί ως ένα ολόκληρο literal', S0 > -1 && S1 > S0);
const ctx = { SUBJ: null };
vm.createContext(ctx);
vm.runInContext(PAGE.slice(S0, S1) + ';\n this.SUBJ = SUBJ;', ctx);
ok('και τρέχει', ctx.SUBJ && Object.keys(ctx.SUBJ).length > 3);

const seen = {}; let total = 0; const per = {};
Object.keys(ctx.SUBJ || {}).forEach(k => {
  const m = ctx.SUBJ[k];
  if (!m || !m.weight || k === 'unknown') return;
  const ex = m.exam || k;
  if (seen[ex]) return;
  seen[ex] = 1; total += m.weight; per[ex] = m.weight;
});
ok('τα βάρη ανά ΓΡΑΠΤΟ αθροίζουν ΑΚΡΙΒΩΣ 100 (μετρημένο: ' + total + ')', total === 100);
/* ⛔ Η ΑΠΟΔΕΙΞΗ ΟΤΙ Ο ΚΑΝΟΝΑΣ ΔΑΓΚΩΝΕΙ: ανά ΚΛΕΙΔΙ το ίδιο άθροισμα σκάει.
   Χωρίς αυτό, ένα «100» θα μπορούσε να είναι σύμπτωση. */
let naive = 0;
Object.keys(ctx.SUBJ || {}).forEach(k => {
  const m = ctx.SUBJ[k];
  if (m && m.weight && k !== 'unknown') naive += m.weight;
});
ok('και ΑΝΑ ΚΛΕΙΔΙ θα έβγαινε λάθος — γι\' αυτό υπάρχει ο κανόνας (' + naive + ')',
  naive !== 100 && naive > 100);
ok('τα Αρχαία μετριούνται ΜΙΑ φορά, στο 30', per.arxaia === 30);

console.log('\n' + pass + ' passed, ' + fail + ' failed');
if (fail) process.exit(1);
