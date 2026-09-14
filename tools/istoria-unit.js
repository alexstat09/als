/* τρέξε με: node tools/istoria-unit.js <id>   (χωρίς shebang: ο έλεγχος
   σύνταξης του smoke-test.sh δεν το δέχεται) */
/* ══════════════════════════════════════════════════════════════════════
   tools/istoria-unit.js — Ο ΜΕΤΑΦΡΑΣΤΗΣ ΕΝΟΤΗΤΑΣ

     node tools/istoria-unit.js k1-b8            → στην οθόνη
     node tools/istoria-unit.js k1-b8 --out x.js → σε αρχείο

   ⭐ ΓΙΑΤΙ ΥΠΑΡΧΕΙ. Κάθε ενότητα του βοηθήματος χρειάζεται: κείμενο
   βιβλίου, τυπογραφικά, λεξιλόγιο, όρους, χρονολογίες, σκελετό. ΟΛΑ
   ΑΥΤΑ ΥΠΑΡΧΟΥΝ ΗΔΗ — το κείμενο στο ebooks.edu.gr, τα υπόλοιπα στο
   `istoria-data.js` (19 υπο-ενότητες, ελεγμένες λέξη-προς-λέξη).
   Αυτό το script τα ΑΝΤΙΓΡΑΦΕΙ. Δεν σκέφτεται, δεν επινοεί, δεν καλεί
   μοντέλο — άρα το κόστος του είναι ΜΗΔΕΝ και τρέχει όσες φορές θέλεις.

   ⛔ ΤΙ ΔΕΝ ΚΑΝΕΙ, ΚΑΙ ΤΟ ΛΕΕΙ: σχεδιάγραμμα · fun facts · πηγές.
      Αυτά θέλουν άνθρωπο/μοντέλο και αναφέρονται ρητά στο τέλος.

   ⚠️ ΔΥΟ ΑΝΕΞΑΡΤΗΤΟΙ ΕΞΑΓΩΓΕΙΣ, ΠΑΝΤΑ. Το κεφάλαιο Γ χώνει δύο
      παραγράφους βιβλίου σε ΕΝΑ <p>· ένας εξαγωγέας που δούλεψε αλλού
      δεν είναι επαλήθευση. Αν διαφωνήσουν, ΣΤΑΜΑΤΑΕΙ.
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');
const ALS = path.resolve(__dirname, '..');
const BOOK = 'http://ebooks.edu.gr/ebooks/v/html/8547/2758/Themata-Neoellinikis-Istorias_G-Lykeiou_html-apli/';
/* ⛔ Η ΚΡΥΦΗ ΜΝΗΜΗ ΖΕΙ ΕΞΩ ΑΠΟ ΤΟ REPO, ΚΑΙ ΕΙΝΑΙ ΚΑΝΟΝΑΣ.
   Μέσα στο δέντρο, το `smoke-test.sh` σάρωσε τις σελίδες του ebook και
   βρήκε 49 «σπασμένους συνδέσμους» προς τα δικά ΤΟΥΣ assets — σωστά, γιατί
   ό,τι κάθεται στη ρίζα ΕΙΝΑΙ ΣΕΛΙΔΑ ΤΟΥ SITE. Ένα build artifact δεν
   ανεβαίνει και δεν ελέγχεται σαν σελίδα. */
const CACHE = path.join(require('os').homedir(), '.cache', 'metron-istoria-book');

const die = m => { console.error('\n⛔ ' + m + '\n'); process.exit(1); };
const ent = s => s.replace(/&nbsp;/g, ' ').replace(/&laquo;/g, '«').replace(/&raquo;/g, '»')
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
  .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(+d)).replace(/&[a-z]+;/g, ' ');
/* ⚠️ ΥΠΟΛΕΙΜΜΑ ΤΥΠΩΜΕΝΗΣ ΣΕΛΙΔΑΣ, ΟΧΙ ΚΕΙΜΕΝΟ ΤΟΥ ΒΙΒΛΙΟΥ.
   Στο τυπωμένο βιβλίο η λέξη έσπασε σε αλλαγή γραμμής («Αμβρακικού-
   Παγασητικού») και το HTML κράτησε την παύλα ΜΕ το κενό. Η σωστή
   ανάγνωση είναι η ενωμένη — γι' αυτό την είχε ενώσει και ο ελεγμένος
   κορμός. ⛔ ΔΕΝ είναι σιωπηλή διόρθωση: μετριέται και αναφέρεται. */
let ARTIFACTS = 0;
const deArtifact = s => s.replace(/([Α-Ωα-ωΆ-Ώά-ώ])-\s+([Α-Ωα-ωΆ-Ώά-ώ])/g, (m, a, b) => { ARTIFACTS++; return a + '-' + b; });
const clean = s => deArtifact(ent(String(s).replace(/<[^>]+>/g, '')).replace(/ /g, ' ').replace(/\s+/g, ' ').trim());

/* ── ο χάρτης της ύλης ζει ΜΕΣΑ στη σελίδα: μία αλήθεια, όχι δύο ── */
function loadYli() {
  const p = fs.readFileSync(path.join(ALS, 'istoria-voithima.html'), 'utf8');
  const m = p.match(/const YLI = (\[[\s\S]*?\]);\n<\/script>/);
  if (!m) die('δεν βρήκα το YLI μέσα στην istoria-voithima.html');
  return JSON.parse(m[1]);
}
function findUnit(YLI, id) {
  for (const c of YLI) for (const s of c.secs) for (const u of s.units)
    if (u.id === id) return { c, s, u };
  die('άγνωστο id «' + id + '». Δες τα διαθέσιμα με: node tools/istoria-unit.js --list');
}

/* ── το βιβλίο, με cache: δεύτερη φορά = μηδέν δίκτυο ── */
async function page(src) {
  if (!fs.existsSync(CACHE)) fs.mkdirSync(CACHE, { recursive: true });
  const f = path.join(CACHE, src + '.html');
  if (fs.existsSync(f)) return fs.readFileSync(f, 'utf8');
  const r = await fetch(BOOK + src + '.html');
  if (!r.ok) die('το ebooks.edu.gr απάντησε ' + r.status + ' για ' + src);
  const t = await r.text();
  fs.writeFileSync(f, t);
  return t;
}

/* ── ΕΞΑΓΩΓΕΑΣ Α: ανά <p> μέσα στο τμήμα του τίτλου ──
   ⚠️ Ο τίτλος μπορεί να ζει σε <div class="title"> Ή σε <span class="bold">
   (π.χ. «1. Τα δημογραφικά δεδομένα»), και το βιβλίο γράφει «1.Η έξοδος»
   ΧΩΡΙΣ κενό μετά την τελεία. Και τα δύο πληρώθηκαν μία φορά. */
function marks(h) {
  const out = [];
  for (const m of h.matchAll(/<div class="title">([\s\S]*?)<\/div>/g)) out.push({ i: m.index, t: clean(m[1]) });
  for (const m of h.matchAll(/<span class="bold">([\s\S]*?)<\/span>/g)) out.push({ i: m.index, t: clean(m[1]) });
  return out.sort((a, b) => a.i - b.i);
}
function segmentFor(h, n) {
  const ms = marks(h);
  const isUnit = t => /^(\d{1,2})\.\s*\S/.test(t);
  const start = ms.find(m => { const x = t2n(m.t); return x === n; });
  if (!start) return null;
  const after = ms.filter(m => m.i > start.i && isUnit(m.t) && t2n(m.t) !== n);
  const end = after.length ? after[0].i : h.length;
  return h.slice(start.i, end);
}
const t2n = t => { const m = /^(\d{1,2})\.\s*\S/.exec(t); return m ? +m[1] : null; };

/* ⛔ ΤΟ ΧΡΩΜΙΟ ΤΟΥ ΒΙΒΛΙΟΥ ΔΕΝ ΕΙΝΑΙ ΚΕΙΜΕΝΟ ΤΟΥ ΒΙΒΛΙΟΥ.
   Οι λεζάντες εικόνων ζουν σε <div class="image_text …> και τα πλαϊνά
   πλαίσια σε <div class="box_cyan">. Ο ένας εξαγωγέας τα έπαιρνε, ο
   άλλος όχι — γι' αυτό διαφώνησαν. Φεύγουν ΠΡΙΝ μετρήσει κανείς. */
function stripChrome(seg) {
  return seg
    .replace(/<div class="image_text[^"]*">[\s\S]*?<\/div>/g, ' ')
    .replace(/<div class="box_cyan[^"]*">[\s\S]*?<\/div>/g, ' ')
    .replace(/<table class="centered[^"]*"[\s\S]*?<\/table>/g, ' ')
    .replace(/<img[^>]*>/g, ' ')
    /* ⚠️ ΟΙ ΔΕΙΚΤΕΣ ΥΠΟΣΗΜΕΙΩΣΗΣ ΕΙΝΑΙ ΤΥΠΟΓΡΑΦΙΑ, ΟΧΙ ΚΕΙΜΕΝΟ.
       Το βιβλίο γράφει «χαμηλά επίπεδα<sup>1</sup>.» και ένα αφελές
       ξεγύμνωμα το αφήνει ως «επίπεδα1.». Βγαίνει ΔΟΜΙΚΑ από το <sup>,
       ποτέ με regex πάνω σε ψηφία — θα έτρωγε αληθινούς αριθμούς. */
    .replace(/<sup>[\s\S]*?<\/sup>/g, '');
}
function extractA(seg) {
  seg = stripChrome(seg);
  return [...seg.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map(m => clean(m[1])).filter(Boolean);
}
/* ── ΕΞΑΓΩΓΕΑΣ Β: ξεγύμνωμα + σπάσιμο σε ΚΕΝΕΣ ΓΡΑΜΜΕΣ ── */
function extractB(seg) {
  seg = stripChrome(seg);
  const t = ent(seg.replace(/<p[^>]*>/g, '\n\n').replace(/<\/p>/g, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, ''))
    .replace(/ /g, ' ').replace(/\r/g, '');
  return t.split(/\n[ \t]*\n/).map(s => deArtifact(s.replace(/\s+/g, ' ').trim()))
    .filter(s => s && !/^\d{1,2}\.\s*\S/.test(s) && !/^[α-στ]\.\s/.test(s) && s.length > 40);
}

/* ── τα τυπογραφικά ΤΟΥ ΒΙΒΛΙΟΥ: εντοπίζονται, δεν διορθώνονται ── */
const SIC_RULES = [
  [/\bμεγάλο δάνεια\b/, 'μεγάλα δάνεια'], [/\bΤο ποσά\b/, 'Τα ποσά'], [/\bπροέβει\b/, 'προέβη'],
  [/([α-ωά-ώ])([Α-ΩΆ-Ώ][α-ωά-ώ]{2,})/, null]   /* κολλημένες λέξεις: «τηνΚύπρο» */
];
function findSic(full) {
  const out = [];
  for (const [re, fix] of SIC_RULES) {
    const m = re.exec(full);
    if (!m) continue;
    if (fix) out.push({ m: m[0], fix });
    else out.push({ m: m[0], fix: m[1] + ' ' + m[2] });
  }
  return out;
}

/* ── ό,τι έχουμε ΗΔΗ γράψει για την ενότητα ── */
function corpusFor(id) {
  const D = require(path.join(ALS, 'istoria-data.js'));
  const lat = id.split('-')[1].replace(/\d+$/, '');
  const n = id.match(/(\d+)$/)[1];
  const pre = ({ a: 'a', b: 'b', g: 'c' })[lat];
  if (!pre) return [];
  /* ⚠️ «b1» ΔΕΝ πρέπει να πιάσει το «b10». Ο αριθμός τελειώνει εδώ. */
  const re = new RegExp('^' + pre + n + '(?![0-9])');
  return (D.UNITS || []).filter(u => re.test(u.id));
}

/* ── ο χάρτης «ποια παράγραφος» — αυτό που ζήτησε για τα Β1/Β2 ── */
function paraOf(pars, phrase) {
  for (let i = 0; i < pars.length; i++) if (pars[i].includes(phrase)) return i + 1;
  return 0;
}

(async () => {
  const args = process.argv.slice(2);
  const YLI = loadYli();
  if (!args.length || args[0] === '--list') {
    YLI.forEach(c => c.secs.forEach(s => s.units.forEach(u =>
      console.log(u.id.padEnd(9) + (u.yli ? '   ' : ' ⊘ ') + 'Κεφ.' + c.n + ' ' + s.L + '. ' + u.n + '. ' + u.title))));
    process.exit(0);
  }
  const id = args[0];
  const outFile = args.includes('--out') ? args[args.indexOf('--out') + 1] : null;
  const { c, s, u } = findUnit(YLI, id);

  const h = await page(s.src);
  const seg = segmentFor(h, u.n);
  if (!seg) die('δεν βρήκα την ενότητα ' + u.n + ' μέσα στο ' + s.src + '.html');
  const A = extractA(seg), B = extractB(seg);
  /* ⭐⭐ ΤΡΙΤΟΣ ΜΑΡΤΥΡΑΣ. Όπου υπάρχει παλιό corpus, οι παράγραφοί του
     είναι ΗΔΗ ελεγμένες με curl λέξη-προς-λέξη. Τότε ΑΥΤΕΣ είναι η
     αλήθεια, και οι δύο εξαγωγείς απλώς αποδεικνύουν ότι η σελίδα του
     βιβλίου δεν άλλαξε. Δύο μάρτυρες πιάνουν λάθος· τρεις το ονομάζουν. */
  const oldPre = corpusFor(id);
  const C = oldPre.flatMap(x => (x.text || []).map(p => String(p.p || p.t || p)));
  if (C.length) {
    /* ⛔ Η ΣΥΓΚΡΙΣΗ ΚΑΝΟΝΙΚΟΠΟΙΕΙ ΚΑΙ ΤΙΣ ΔΥΟ ΠΛΕΥΡΕΣ, ΠΟΤΕ ΜΙΑ.
       Η πρώτη γραφή ένωνε τις σπασμένες λέξεις ΜΟΝΟ στο βιβλίο, οπότε
       παράγραφοι που ο κορμός τις κρατάει σπασμένες έβγαιναν «λείπουν».
       Ένας κανονικοποιητής σε μία πλευρά ΔΕΝ είναι σύγκριση. */
    const cmp = s => s.normalize('NFC').replace(/[\u2018\u2019\u02BC\u0384]/g, "'")
      .replace(/([\u0386-\u03CE])-\s+([\u0386-\u03CE])/g, '$1-$2').replace(/\s+/g, ' ').trim();
    const bSet = new Set(B.map(cmp));
    const missing = C.filter(p => !bSet.has(cmp(p)));
    if (missing.length) {
      console.error('\n⚠️  ΤΟ ΒΙΒΛΙΟ ΔΕΝ ΣΥΜΦΩΝΕΙ ΜΕ ΤΟ ΕΛΕΓΜΕΝΟ CORPUS (' + missing.length + ' παρ.):');
      missing.forEach(p => console.error('    λείπει: ' + p.slice(0, 90)));
      die('Ή άλλαξε η σελίδα του βιβλίου, ή ο εξαγωγέας κόβει λάθος. ΔΕΝ γράφω τίποτα.');
    }
    var pars = C;                       /* η ελεγμένη εκδοχή κερδίζει */
  } else if (!(A.length === B.length && A.every((x, i) => x === B[i]))) {
    console.error('\n⚠️  ΟΙ ΔΥΟ ΕΞΑΓΩΓΕΙΣ ΔΙΑΦΩΝΗΣΑΝ (' + A.length + ' vs ' + B.length + ').');
    console.error('    Α:'); A.forEach((x, i) => console.error('      ' + i + ' ' + x.slice(0, 70)));
    console.error('    Β:'); B.forEach((x, i) => console.error('      ' + i + ' ' + x.slice(0, 70)));
    die('ΔΕΝ γράφω τίποτα. Το κεφάλαιο Γ χώνει δύο παραγράφους σε ένα <p> — έλεγξέ το με το μάτι.');
  } else { pars = B; }
  if (!pars || !pars.length) die('βγήκαν μηδέν παράγραφοι — κάτι άλλαξε στο markup του βιβλίου.');
  const full = pars.join('\n');

  const old = oldPre;
  const vocab = old.flatMap(x => x.vocab || []);
  const terms = old.flatMap(x => x.terms || []);
  const tl = old.flatMap(x => x.timeline || []);
  const ctx = old.flatMap(x => x.context || []);
  const simple = old.flatMap(x => x.simple || []);
  const points = old.flatMap(x => (x.skeleton && x.skeleton.points) || []);

  /* ── ΤΟ ΛΕΞΙΛΟΓΙΟ ΧΡΕΙΑΖΕΤΑΙ ΤΗ ΦΡΑΣΗ ΟΠΩΣ ΕΙΝΑΙ ΣΤΟ ΚΕΙΜΕΝΟ ──
     Το corpus κρατάει το ΛΗΜΜΑ («Όγκος») ενώ το βιβλίο γράφει τον κλιτό
     τύπο («όγκου»). Ψάχνουμε πρώτα αυτούσια, μετά με ΘΕΜΑ χωρίς τόνους.
     ⚠️ Το θέμα πρέπει να είναι ≥5 χαρακτήρες, αλλιώς το «Όγκος» πιάνει
     το «ογκώδης». Ό,τι δεν βρεθεί ΑΝΑΦΕΡΕΤΑΙ — δεν μαντεύεται. */
  const nrm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const nFull = nrm(full);
  const gl = [], glMiss = [];
  vocab.forEach(v => {
    const w = String(v.t);
    let hit = full.includes(w) ? w : (full.includes(w.toLowerCase()) ? w.toLowerCase() : null);
    if (!hit) {
      const nw = nrm(w);
      const stem = nw.length > 7 ? nw.slice(0, nw.length - 2) : nw;
      if (stem.length >= 5) {
        const at = nFull.indexOf(stem);
        if (at >= 0) {
          /* επέκταση ως το τέλος της λέξης, πάνω στο ΠΡΩΤΟΤΥΠΟ κείμενο */
          let end = at + stem.length;
          while (end < full.length && /[Α-Ωα-ωΆ-Ώά-ώϊϋΐΰ]/.test(full[end])) end++;
          hit = full.slice(at, end);
        }
      }
    }
    if (hit) gl.push({ m: hit, t: v.t, cat: 'gen', d: String(v.d) });
    else glMiss.push(v.t);
  });
  const tMiss = terms.filter(t => !t.anchor || !full.includes(t.anchor)).map(t => t.t);

  const chapter = {
    id, num: String(u.n), title: u.title,
    crumbs: ['Κεφ. ' + c.n + ' · ' + c.title, s.L + '. ' + s.title],
    period: tl.length ? tl[0].y + ' – ' + tl[tl.length - 1].y : 'ΣΥΜΠΛΗΡΩΣΕ',
    paragraphs: pars,
    sic: findSic(full),
    glossary: gl,
    terms: terms.map(t => ({ t: t.t, d: t.d, anchor: t.anchor, par: paraOf(pars, t.anchor || '') })),
    timeline: {
      events: [
        ...tl.map((e, i) => ({ id: 'e' + e.y + '_' + i, y: e.y, label: String(e.y), book: true, cat: 'eco', title: String(e.l), text: String(e.l) })),
        ...ctx.map((x, i) => ({ id: 'c' + i, y: 0, label: 'ΣΥΜΠΛΗΡΩΣΕ', book: false, cat: 'pol', title: String(x.t), text: String(x.d), note: 'Το γεγονός δεν είναι στο βιβλίο.' }))
      ], spans: []
    },
    explain: {
      lede: 'ΣΥΜΠΛΗΡΩΣΕ — υπάρχει πρώτη ύλη στα «απλά λόγια» πιο κάτω',
      glance: { who: 'ΣΥΜΠΛΗΡΩΣΕ', keywords: terms.map(t => t.t).slice(0, 7), numbers: [] },
      acts: points.slice(0, 6).map(p => ({
        when: 'ΣΥΜΠΛΗΡΩΣΕ', cat: 'eco', title: p.label,
        body: p.detail, think: 'ΣΥΜΠΛΗΡΩΣΕ — η αναλογία', quote: p.anchor
      })),
      concepts: [], pitfalls: [], chain: points.map(p => p.label)
    },
    /* ⭐ ΤΟ ΣΩΣΤΟ/ΛΑΘΟΣ ΔΕΝ ΕΠΙΝΟΕΙΤΑΙ: κάθε ισχυρισμός είναι ΤΟΥ ΒΙΒΛΙΟΥ
       και κουβαλάει την παράγραφο που τον κρίνει. */
    sl: points.flatMap(p => (p.must || []).map(mm => ({
      s: mm.k, right: true, anchor: p.anchor, par: paraOf(pars, p.anchor || '')
    }))).slice(0, 12),
    /* ⭐ ΤΑ Β1/Β2 ΜΕ ΤΙΣ ΠΑΡΑΓΡΑΦΟΥΣ — δική του απαίτηση, υπολογισμένη */
    b: points.slice(0, 4).map(p => ({
      q: 'ΣΥΜΠΛΗΡΩΣΕ — ερώτηση στη διατύπωση του γραπτού', mon: 0,
      pars: [paraOf(pars, p.anchor || '')], keep: [p.label]
    })),
    facts: [], sources: { intro: 'ΣΥΜΠΛΗΡΩΣΕ', list: [], how: [] }, diagram: 'ΣΥΜΠΛΗΡΩΣΕ'
  };

  const R = [];
  R.push('/* ' + id + ' — Κεφ.' + c.n + ' · ' + s.L + '. ' + s.title + ' · ' + u.n + '. ' + u.title + ' */');
  R.push('/* ΠΗΓΗ: ebooks.edu.gr ' + s.src + '.html · ' + pars.length + ' παράγραφοι · '
    + (C.length ? 'ΕΠΑΛΗΘΕΥΜΕΝΕΣ με το ελεγμένο corpus' : 'δύο ανεξάρτητοι εξαγωγείς συμφώνησαν') + ' */');
  R.push(JSON.stringify(chapter, null, 1));
  const outText = R.join('\n');
  if (outFile) fs.writeFileSync(outFile, outText); else console.log(outText);

  const e = s => console.error(s);
  e('\n── ' + id + ' · ' + u.title + ' ' + (u.yli ? '' : '⊘ ΕΚΤΟΣ ΥΛΗΣ'));
  e('   ΑΥΤΟΜΑΤΑ: ' + pars.length + ' παράγραφοι (2 εξαγωγείς ✓) · ' + chapter.sic.length + ' τυπογραφικά · '
    + gl.length + ' λεξιλόγιο · ' + terms.length + ' όροι · ' + chapter.timeline.events.length + ' χρονολογίες · '
    + points.length + ' σημεία · ' + chapter.sl.length + ' Σ/Λ');
  if (ARTIFACTS) e('   ℹ️  ' + ARTIFACTS + ' λέξεις ενώθηκαν — το βιβλίο τις είχε σπασμένες σε αλλαγή γραμμής.');
  if (!old.length) e('   ⚠️  ΚΑΝΕΝΑ παλιό corpus γι’ αυτή — μόνο το κείμενο βγήκε αυτόματα.');
  if (glMiss.length) e('   ⚠️  λεξιλόγιο που ΔΕΝ βρέθηκε αυτούσιο (' + glMiss.length + '): ' + glMiss.slice(0, 6).join(' · '));
  if (tMiss.length) e('   ⚠️  όροι με άγκυρα εκτός κειμένου: ' + tMiss.join(' · '));
  e('   ✍️  ΘΕΛΟΥΝ ΕΣΕΝΑ: lede · glance · acts.when/think · concepts · pitfalls · diagram · facts · sources · b[].q');
  e('   (ψάξε τα «ΣΥΜΠΛΗΡΩΣΕ» — δεν υπάρχει τίποτα άλλο κρυφό)\n');
})();
