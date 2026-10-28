/* tools/eisagogi/arxaia/build.js — <κεφάλαιο>.json + page.tpl → η σελίδα.
   node tools/eisagogi/arxaia/build.js sokratis-d2
   Τρέχει ΠΡΩΤΑ τους κανόνες του lib.js· με ένα σφάλμα δεν γράφει τίποτα.
   Το επόμενο κεφάλαιο (Δ3, Πλάτων, Πρωταγόρας…) = ΕΝΑ νέο json, τίποτα άλλο. */
'use strict';
const fs = require('fs');
const path = require('path');
const L = require('./lib');

function build(name) {
  const d = L.load(name), src = L.readSource(d.source.file);
  const errs = L.validate(d, src);          /* γεμίζει και τα quote.t από την πηγή */
  if (errs.length) throw new Error('ο validator αρνείται (' + errs.length + '):\n  ' + errs.join('\n  '));
  const tpl = fs.readFileSync(path.join(__dirname, 'page.tpl'), 'utf8');
  const payload = Object.assign({}, d);
  ['_', 'source', 'traps', 'counted', 'names', 'file', 'key', 'back', 'plate', 'fixes'].forEach(k => delete payload[k]);
  /* ⚠️ σταθ. 58: ποτέ .replace(string, string) — τα $ τρώγονται· εδώ split/join.
     Κάθε «<» του json γίνεται escape u003c, ώστε ένα «</script>» μέσα σε κείμενο να μη σπάσει τη σελίδα. */
  const json = JSON.stringify(payload).replace(/</g, '\\u003c');
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const marks = { '/*@@DATA@@*/null': json, '@@KEY@@': d.key, '@@TITLE@@': esc(d.title), '@@NAME@@': name,
    /* ο τίτλος του χάρτη· χωρίς mapTitle = του Δ2 (byte-ίδιος). Κάθε ΝΕΟ κεφάλαιο τον δίνει (validate). */
    '@@MAPTITLE@@': esc(d.mapTitle || 'Από τον χρησμό ως το συμπέρασμα'),
    /* ⭐ Η ΜΙΑ γραμμή επιστροφής του πακέτου (το arxaia-gnosto.test.js μετράει ακριβώς μία). */
    '@@BACK@@': '<a class="back" href="' + esc(d.back.href) + '" aria-label="Πίσω στα ' + esc(d.back.label) + '">← ' + esc(d.back.label) + '</a>' };
  let out = tpl;
  Object.keys(marks).forEach(m => {
    if (out.indexOf(m) < 0) throw new Error('λείπει το σημάδι ' + m + ' από το πρότυπο');
    out = out.split(m).join(marks[m]);       /* split/join: κανένα $ δεν ερμηνεύεται */
  });
  return { html: out, file: d.file };
}

if (require.main === module) {
  const name = process.argv[2] || 'sokratis-d2';
  try {
    const r = build(name);
    fs.writeFileSync(path.join(L.REPO, r.file), r.html);
    console.log('✓ ' + r.file + ' (' + Math.round(r.html.length / 1024) + ' KB)');
  } catch (e) { console.error('⛔ ' + e.message); process.exit(1); }
}
module.exports = { build };
