/* tools/eisagogi/arxaia/build.js — <κεφάλαιο>.json + page.tpl → η σελίδα.
   node tools/eisagogi/arxaia/build.js sokratis-d2
   Τρέχει ΠΡΩΤΑ τους κανόνες του lib.js· με ένα σφάλμα δεν γράφει τίποτα.
   Το επόμενο κεφάλαιο (Δ3, Πλάτων, Πρωταγόρας…) = ΕΝΑ νέο json, τίποτα άλλο. */
'use strict';
const fs = require('fs');
const path = require('path');
const L = require('./lib');

/* ⭐ v2 (16/11/26): τα νέα πεδία ζουν ΜΟΝΟ στη σελίδα -v2. Η παλιά σελίδα δεν τα βλέπει,
   ώστε να βγαίνει byte-ίδια από το ίδιο json (και ο Δ2, που δεν τα έχει, πάντα). */
const V2_TOP = ['acts', 'eye', 'outline'], V2_ST = ['fig', 'sl', 'match', 'bridge'];
function build(name, opt) {
  opt = Object.assign({}, opt || {});
  const d = L.load(name), src = L.readSource(d.source.file);
  /* `"tpl": 2` = το κεφάλαιο ΖΕΙ στο νέο καλούπι, στο ΙΔΙΟ URL (Πολιτεία 1/2 από als-v761· το παλιό στο archive/) */
  const home2 = d.tpl === 2;
  if (home2) opt.v2 = true;
  const errs = L.validate(d, src);          /* γεμίζει και τα quote.t από την πηγή */
  if (errs.length) throw new Error('ο validator αρνείται (' + errs.length + '):\n  ' + errs.join('\n  '));
  const tpl = fs.readFileSync(path.join(__dirname, opt.v2 ? 'page2.tpl' : 'page.tpl'), 'utf8');
  const payload = Object.assign({}, d);
  ['_', 'source', 'traps', 'counted', 'names', 'file', 'key', 'back', 'plate', 'fixes', 'tpl'].forEach(k => delete payload[k]);
  if (!opt.v2) {
    V2_TOP.forEach(k => delete payload[k]);
    payload.stations = d.stations.map(st => { const c = Object.assign({}, st); V2_ST.forEach(k => delete c[k]); return c; });
  }
  /* ⚠️ σταθ. 58: ποτέ .replace(string, string) — τα $ τρώγονται· εδώ split/join.
     Κάθε «<» του json γίνεται escape u003c, ώστε ένα «</script>» μέσα σε κείμενο να μη σπάσει τη σελίδα. */
  const json = JSON.stringify(payload).replace(/</g, '\\u003c');
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const marks = { '/*@@DATA@@*/null': json, '@@KEY@@': d.key, '@@TITLE@@': esc(d.title), '@@NAME@@': name,
    /* ο τίτλος του χάρτη· χωρίς mapTitle = του Δ2 (byte-ίδιος). Κάθε ΝΕΟ κεφάλαιο τον δίνει (validate). */
    ...(opt.v2 ? {} : { '@@MAPTITLE@@': esc(d.mapTitle || 'Από τον χρησμό ως το συμπέρασμα') }),
    /* ⭐ Η ΜΙΑ γραμμή επιστροφής του πακέτου (το arxaia-gnosto.test.js μετράει ακριβώς μία). */
    '@@BACK@@': '<a class="back" href="' + esc(d.back.href) + '" aria-label="Πίσω στα ' + esc(d.back.label) + '">← ' + esc(d.back.label) + '</a>' };
  let out = tpl;
  Object.keys(marks).forEach(m => {
    if (out.indexOf(m) < 0) throw new Error('λείπει το σημάδι ' + m + ' από το πρότυπο');
    out = out.split(m).join(marks[m]);       /* split/join: κανένα $ δεν ερμηνεύεται */
  });
  return { html: out, file: opt.v2 && !home2 ? d.file.replace(/\.html$/, '-v2.html') : d.file };
}

if (require.main === module) {
  const name = process.argv[2] || 'sokratis-d2', v2 = process.argv.indexOf('--v2') > 0;
  try {
    const r = build(name, { v2 });
    fs.writeFileSync(path.join(L.REPO, r.file), r.html);
    console.log('✓ ' + r.file + ' (' + Math.round(r.html.length / 1024) + ' KB)');
  } catch (e) { console.error('⛔ ' + e.message); process.exit(1); }
}
module.exports = { build };
