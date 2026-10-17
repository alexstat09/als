/* tools/eisagogi/build.js — eisagogi.json + eisagogi.tpl → latinika-eisagogi.html.
   Τρέχει ΠΡΩΤΑ τους κανόνες του lib.js· με ένα σφάλμα δεν γράφει τίποτα. */
'use strict';
const fs = require('fs');
const path = require('path');
const L = require('./lib');

function build() {
  const d = L.load(), src = L.readSource();
  const errs = L.validate(d, src);
  if (errs.length) throw new Error('ο validator αρνείται:\n  ' + errs.join('\n  '));
  const tpl = fs.readFileSync(path.join(__dirname, 'eisagogi.tpl'), 'utf8');
  const payload = Object.assign({}, d, { src });
  delete payload._;
  /* ⚠️ σταθ. 58: ΣΥΝΑΡΤΗΣΗ αντικατάστασης, ποτέ string — αλλιώς τα $ τρώγονται */
  const json = JSON.stringify(payload).replace(/</g, '\\u003c');
  if (tpl.indexOf('/*@@EIS@@*/null') < 0) throw new Error('λείπει το σημάδι /*@@EIS@@*/ από το πρότυπο');
  return tpl.replace('/*@@EIS@@*/null', () => json);
}

if (require.main === module) {
  const out = path.join(L.REPO, 'latinika-eisagogi.html');
  try {
    fs.writeFileSync(out, build());
    console.log('✓ ' + path.basename(out));
  } catch (e) { console.error('⛔ ' + e.message); process.exit(1); }
}
module.exports = { build };
