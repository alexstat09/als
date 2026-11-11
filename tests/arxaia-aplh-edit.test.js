/* ══════════════════════════════════════════════════════════════════════
   ΑΡΧΑΙΑ · ΓΝΩΣΤΟ — «ΔΙΟΡΘΩΣΕ» ΔΕΝ ΣΠΑΕΙ ΠΟΤΕ ΤΑ ΖΕΥΓΑΡΙΑ (als-v722).

   Δική του αναφορά 11/11/26: «πήγα να αλλάξω μια λέξη και σταμάτησε να
   δουλεύει όλο το sync μεταξύ αρχαίων και μετάφρασης· ό,τι και να γίνει
   πρέπει αυτό να μη χαλάει ποτέ, και η νέα λέξη να αντιστοιχεί στην ίδια
   που αντιστοιχούσε πριν».

   Αιτία: η διόρθωση αποθηκευόταν ως σκέτο κείμενο και η περίοδος σχεδιαζόταν
   ΧΩΡΙΣ λέξεις-κουμπιά. Τώρα το `apAlign` (gk.tpl) ξαναβρίσκει τα ζευγάρια
   λέξη-λέξη από την απόδοση από την οποία ξεκίνησε.

   Τρέχει τη ΣΥΝΑΡΤΗΣΗ ΤΗΣ ΣΕΛΙΔΑΣ (κομμένη από κάθε arxaia-gkN.html) πάνω
   σε ΟΛΕΣ τις περιόδους ΟΛΩΝ των οργάνων.
   node tests/arxaia-aplh-edit.test.js
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  ✗ ' + m); } };

const PUNCT = /^[\s,.;:·’'—–()«»!?\[\]…]+$/;
const keysOf = ch => ch.filter(c => c[1] && !PUNCT.test(c[0].replace(/\s+$/, ''))).map(c => c[1]);
const join = ch => ch.map(c => c[0]).join('');

const files = fs.readdirSync(ROOT).filter(f => /^arxaia-gk\d+\.html$/.test(f)).sort();
const specs = fs.readdirSync(path.join(ROOT, 'tools/gnosto')).filter(f => /^gk\d+\.json$/.test(f)).map(f => 'arxaia-' + f.replace('.json', '.html')).sort();
ok(specs.length >= 5 && JSON.stringify(specs) === JSON.stringify(files), 'κάθε tools/gnosto/gkN.json έχει όργανο και ελέγχεται (' + files.join(', ') + ')');

for (const f of files) {
  const html = fs.readFileSync(path.join(ROOT, f), 'utf8');
  const m = html.match(/\/\* ⟪apAlign \*\/([\s\S]*?)\/\* apAlign⟫ \*\//);
  ok(m, f + ': η σελίδα έχει το apAlign (αλλιώς η διόρθωση σπάει τα ζευγάρια)');
  if (!m) continue;
  const dm = html.match(/const D = (\{[\s\S]*?\});\n/);
  const D = JSON.parse(dm[1]);
  const apAlign = new Function('D', m[1] + '\nreturn apAlign;')(D);
  if (!D.aplh || !D.aplh.align) continue;
  let periods = 0;
  for (const s of D.segs) {
    const base = D.aplh.align[s.n]; if (!base) continue;
    periods++;
    const text = join(base).replace(/\s+/g, ' ').trim();
    const before = keysOf(base);

    /* 1 · ίδιο κείμενο → ίδια ζευγάρια, ίδια σειρά */
    const same = apAlign(text, s);
    ok(JSON.stringify(keysOf(same)) === JSON.stringify(before), f + ' #' + s.n + ': ίδιο κείμενο κρατά ΟΛΑ τα ζευγάρια');
    ok(join(same) === text, f + ' #' + s.n + ': το κείμενο μένει αυτολεξεί');

    /* 2 · αλλάζω ΜΙΑ λέξη σε κάθε κομμάτι με κλειδί → η νέα λέξη παίρνει το κλειδί της παλιάς, οι άλλες μένουν */
    base.forEach((c, ci) => {
      if (!c[1] || PUNCT.test(c[0].replace(/\s+$/, ''))) return;
      const w = (c[0].match(/[^\s,.;·:!?«»()\[\]—–’']+/g) || []).pop(); if (!w) return;
      const nb = base.map((x, xi) => xi === ci ? [x[0].replace(new RegExp(w + '(?![^\\s]*' + w + ')'), 'ΝΕΑΛΕΞΗ'), x[1]] : x);
      const t2 = join(nb).replace(/\s+/g, ' ').trim();
      const got = apAlign(t2, s);
      ok(join(got) === t2, f + ' #' + s.n + ': η διόρθωση μένει αυτολεξεί');
      const hit = got.find(g => g[0].indexOf('ΝΕΑΛΕΞΗ') >= 0);
      ok(hit && hit[1] === c[1], f + ' #' + s.n + ': «' + w + '» → «ΝΕΑΛΕΞΗ» ανάβει ΤΟ ΙΔΙΟ «' + (D.pairs[c[1]] || {}).a + '» (' + c[1] + '), όχι ' + (hit ? hit[1] : 'τίποτα'));
      const others = keysOf(got).filter(k => k !== c[1]), want = before.filter(k => k !== c[1]);
      ok(JSON.stringify(others) === JSON.stringify(want), f + ' #' + s.n + ': και ΟΛΑ τα άλλα ζευγάρια μένουν (' + c[1] + ')');
    });

    /* 3 · προσθέτω λέξη στο τέλος, σβήνω την πρώτη λέξη → τα υπόλοιπα ζευγάρια μένουν */
    const add = apAlign(text + ' επιπλέον', s);
    ok(JSON.stringify(keysOf(add).filter(k => before.indexOf(k) >= 0)) === JSON.stringify(before), f + ' #' + s.n + ': λέξη στο τέλος δεν χαλάει κανένα ζευγάρι');
    /* 4 · κάτι εντελώς δικό του → δεν σκάει, κρατά το κείμενο */
    const free = apAlign('Κάτι εντελώς δικό μου', s);
    ok(join(free) === 'Κάτι εντελώς δικό μου', f + ' #' + s.n + ': εντελώς δικό του κείμενο μένει αυτολεξεί');
    /* 5 · ξεκίνησε από τον ΜΕΤΑΦΡΑΣΤΗ («Εδώ η κανονική» → Διόρθωσε) → ζευγάρια του μεταφραστή */
    const book = join(s.m).replace(/\s+/g, ' ').trim();
    ok(JSON.stringify(keysOf(apAlign(book, s))) === JSON.stringify(keysOf(s.m)), f + ' #' + s.n + ': από την κανονική κρατά τα ζευγάρια του βιβλίου');
  }
  ok(periods > 0, f + ': ελέγχθηκαν περίοδοι (' + periods + ')');
}

/* Η ΠΡΑΓΜΑΤΙΚΗ του περίπτωση: gk8 περ. 6, «χωρίσματά» → «παραβάν» (και ανάποδα) ανάβει το «τὰ παραφράγματα» */
{
  const html = fs.readFileSync(path.join(ROOT, 'arxaia-gk8.html'), 'utf8');
  const m = html.match(/\/\* ⟪apAlign \*\/([\s\S]*?)\/\* apAlign⟫ \*\//);
  if (m) {
    const D = JSON.parse(html.match(/const D = (\{[\s\S]*?\});\n/)[1]);
    const apAlign = new Function('D', m[1] + '\nreturn apAlign;')(D);
    const s = D.segs.find(x => x.n === 6);
    const t = join(D.aplh.align[6]).replace('τα χωρίσματά τους', 'τα παραβάν τους');
    const got = apAlign(t, s), hit = got.find(c => c[0].indexOf('παραβάν') >= 0);
    ok(hit && hit[1] === 'f10' && D.pairs.f10.a === 'τὰ παραφράγματα', 'gk8 #6: η λέξη που άλλαξε ανάβει «τὰ παραφράγματα» (f10)');
  }
}

console.log(`\narxaia-aplh-edit: ${pass} πέρασαν, ${fail} απέτυχαν`);
process.exit(fail ? 1 : 0);
