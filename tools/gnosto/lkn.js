/* ══════════════════════════════════════════════════════════════════════
   ΚΑΘΕ ΟΜΟΡΡΙΖΟ ΣΤΟ ΛΕΞΙΚΟ ΤΗΣ ΚΟΙΝΗΣ ΝΕΟΕΛΛΗΝΙΚΗΣ (Τριανταφυλλίδης).
     node tools/gnosto/lkn.js gk9
   Για κάθε λέξη του `rel` στα `lexika` του gkN.json που ΔΕΝ έχει ήδη τεκμήριο
   στο tools/gnosto/lkn.json, ρωτάει το greek-language.gr (σειριακά, με παύση —
   παράλληλα αιτήματα πέφτουν σε timeout) και γράφει το τεκμήριο.
   Τυπώνει όσες ΔΕΝ υπάρχουν και βγαίνει με 1: αυτές ΔΕΝ μπαίνουν — βρες
   άλλη που υπάρχει (ή βγάλ' την). Και διάβασε την ετυμολογία που τυπώνει:
   «υπάρχει» ≠ «είναι ομόρριζο» (π.χ. «ειδοποίηση»: «σφαλερή ταύτιση εἶδος–εἴδησις»).
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs'), path = require('path');
const id = process.argv[2];
if (!/^gk\d+$/.test(id || '')) { console.error('χρήση: node tools/gnosto/lkn.js gkN'); process.exit(2); }
const SPEC = path.join(__dirname, id + '.json'), EV = path.join(__dirname, 'lkn.json');
const spec = JSON.parse(fs.readFileSync(SPEC, 'utf8'));
const ev = JSON.parse(fs.readFileSync(EV, 'utf8'));
ev[id] = ev[id] || {};
const all = [...new Set(spec.lexika.reduce((a, x) => a.concat(x.rel || []), []))];
/* τεκμήριο από ΑΛΛΗ ενότητα μετράει (ίδια λέξη, ίδιο λεξικό) */
const known = w => Object.keys(ev).some(k => k !== '_' && ev[k] && w in ev[k]);
const todo = all.filter(w => !known(w));
const sleep = n => new Promise(r => setTimeout(r, n));
const clean = s => s.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ');
async function look(w){
  const u = 'https://www.greek-language.gr/greekLang/modern_greek/tools/lexica/triantafyllides/search.html?lq=' + encodeURIComponent(w) + '&dq=';
  for (let t = 0; t < 4; t++){
    try {
      const r = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(30000) });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const txt = clean(await r.text());
      if (/δεν επέστρεψε κανένα αποτέλεσμα/.test(txt)) return { ok: false };
      const ety = (txt.match(/\[([^\]]{3,300})\]/g) || []).map(x => x.slice(1, -1).trim()).filter(x => !/Μετάβαση/.test(x)).slice(0, 3).join(' || ');
      return { ok: true, ety };
    } catch (e) { await sleep(2500); }
  }
  return { ok: null };
}
(async () => {
  console.log(id + ': ' + all.length + ' ομόρριζα · ' + (all.length - todo.length) + ' ήδη ελεγμένα · ' + todo.length + ' για έλεγχο');
  const no = [], err = [];
  for (const w of todo){
    const r = await look(w);
    if (r.ok === true){ ev[id][w] = r.ety; console.log('  ✓ ' + w + '  │ ' + r.ety.slice(0, 110)); }
    else if (r.ok === false) { no.push(w); console.log('  ✗ ΔΕΝ ΥΠΑΡΧΕΙ: ' + w); }
    else { err.push(w); console.log('  ? δίκτυο: ' + w); }
    await sleep(1100);
  }
  ev[id] = Object.fromEntries(Object.entries(ev[id]).sort((a, b) => a[0].localeCompare(b[0], 'el')));
  fs.writeFileSync(EV, JSON.stringify(ev, null, 1) + '\n');
  if (no.length) console.log('\n✗ ΔΕΝ ΥΠΑΡΧΟΥΝ στο ΛΚΝ (' + no.length + '): ' + no.join(', ') + '\n  → άλλαξέ τες με λέξεις που υπάρχουν ή βγάλ\' τες, και ξανατρέξε.');
  if (err.length) console.log('\n? ΔΕΝ ΑΠΑΝΤΗΣΕ ο server (' + err.length + '): ' + err.join(', ') + '  → ξανατρέξε (τα ελεγμένα μένουν).');
  if (!no.length && !err.length) console.log('\n✓ ' + id + ': κάθε ομόρριζο βρέθηκε στο ΛΚΝ — τεκμήριο στο tools/gnosto/lkn.json');
  process.exit(no.length || err.length ? 1 : 0);
})();
