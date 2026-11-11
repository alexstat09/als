/* ══════════════════════════════════════════════════════════════════════
   ΑΡΧΑΙΑ · ΓΝΩΣΤΟ — «ΤΙ ΓΙΝΕΤΑΙ ΕΔΩ» (`flow`, als-v723).

   Δική του ζήτηση (11/11/26): «κάτι στην κάρτα δίπλα που με βοηθάει να
   καταλάβω τι γίνεται, που συνδέει τις περιόδους σιγά σιγά — δεν καταλαβαίνω
   τίποτα όσο διαβάζω τη μετάφραση».

   Τα κείμενα της κάρτας είναι ΔΙΚΑ ΜΟΥ, άρα ό,τι μπορεί να ελεγχθεί μηχανικά
   το ελέγχει ο validator (lib.js §10). Αυτό το test αποδεικνύει ότι ο validator
   ΔΑΓΚΩΝΕΙ: κάθε είδος λάθους που μπορώ να κάνω γράφοντας την κάρτα μπαίνει
   επίτηδες, και ο validator ΠΡΕΠΕΙ να το αρνηθεί. Και ότι η σελίδα κουβαλάει
   ΑΚΡΙΒΩΣ το `flow` του JSON.
   node tests/arxaia-flow.test.js
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const L = require(path.join(ROOT, 'tools/gnosto/lib.js'));
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  ✗ ' + m); } };
const clone = x => JSON.parse(JSON.stringify(x));

const ids = fs.readdirSync(path.join(ROOT, 'tools/gnosto')).filter(f => /^gk\d+\.json$/.test(f)).map(f => f.replace('.json', ''));
const withFlow = ids.filter(id => L.loadSpec(id).flow);
ok(withFlow.indexOf('gk8') >= 0, 'η gk8 (που διαβάζει τώρα) έχει «Τι γίνεται εδώ»');

for (const id of withFlow) {
  const spec = L.loadSpec(id), unit = L.loadUnit(id), src = L.sourceOf(spec);
  const FE = s => L.check(s, unit, src).filter(e => /Τι γίνεται εδώ/.test(e));
  ok(FE(spec).length === 0, id + ': το «Τι γίνεται εδώ» περνάει τον validator' + (FE(spec).length ? ' — ' + FE(spec)[0] : ''));
  const ns = unit.align.segs.map(s => String(s.n)), last = ns[ns.length - 1], mid = ns[Math.floor(ns.length / 2)];
  ok(ns.every(n => spec.flow.segs[n]), id + ': κάθε περίοδος (' + ns.length + ') έχει κάρτα');

  /* η σελίδα κουβαλάει ΑΚΡΙΒΩΣ το flow του JSON */
  const html = fs.readFileSync(path.join(ROOT, 'arxaia-' + id + '.html'), 'utf8');
  const D = JSON.parse(html.match(/const D = (\{[\s\S]*?\});\n/)[1]);
  ok(JSON.stringify(D.flow) === JSON.stringify(spec.flow), id + ': η σελίδα έχει ΑΚΡΙΒΩΣ το flow του JSON (ξαναχτίσου αν όχι)');
  ok(html.indexOf('{{') < 0, id + ': καμία διπλή αγκύλη ορατή στον κώδικα της σελίδας (μοιάζει με κενό του προτύπου)');

  /* ΜΕΤΑΛΛΑΞΕΙΣ — καθεμία ΠΡΕΠΕΙ να απορριφθεί */
  const M = [
    ['λείπει μια περίοδος', s => { delete s.flow.segs[mid]; }],
    ['περίοδος που δεν υπάρχει', s => { s.flow.segs['999'] = clone(s.flow.segs[mid]); }],
    ['σύνδεσμος που ΔΕΝ είναι στην επόμενη περίοδο', s => { s.flow.segs[ns[0]].to.an = 'ἐπειδὴ ἐσπούδαζον'; }],
    ['αρχαίο έξω από διπλές αγκύλες', s => { s.flow.segs[mid].why += ' Το ἀληθὲς.'; }],
    ['«αρχαίο» μέσα σε αγκύλες που δεν είναι στο κείμενο', s => { s.flow.segs[mid].say = 'Λέει {{ἐπιστήμη ἀνθρώπων}}.'; }],
    ['αναφορά σε περίοδο που δεν υπάρχει', s => { s.flow.segs[mid].why += ' (περ. 99)'; }],
    ['αναφορά σε σχόλιο που δεν υπάρχει', s => { s.flow.segs[mid].why += ' (σχόλιο «φιλοσοφία»)'; }],
    ['σύμβολο αντί για λέξη', s => { s.flow.segs[mid].say = '⭐ ' + s.flow.segs[mid].say; }],
    ['κενό «τι λέει»', s => { s.flow.segs[mid].say = ''; }],
    ['πολύ μακρύ «τι λέει» (>40 λέξεις)', s => { s.flow.segs[mid].say = Array(45).fill('λέξη').join(' '); }],
    ['η τελευταία με «επόμενη»', s => { s.flow.segs[last].to = { an: 'x', x: 'y' }; }],
    ['μη τελευταία χωρίς σύνδεσμο', s => { delete s.flow.segs[ns[0]].to; }],
    ['κόμβοι με κενό', s => { if (s.flow.nodes.length > 1) s.flow.nodes[1].from += 1; else s.flow.nodes[0].to -= 1; }],
    ['κόμβοι που δεν φτάνουν ως το τέλος', s => { s.flow.nodes[s.flow.nodes.length - 1].to -= 1; }],
    ['κόμβος με πολυτονικό τίτλο', s => { s.flow.nodes[0].t = 'Ὁμοίους'; }]
  ];
  if (spec.flow.who) M.push(['ομιλητές ανάποδα (`who` χωρίς 2 ονόματα)', s => { s.flow.who = ['Σωκράτης']; }]);
  for (const [label, f] of M) {
    const s = clone(spec); f(s);
    ok(FE(s).length > 0, id + ': ο validator ΑΡΝΕΙΤΑΙ — ' + label);
  }
  /* ο ομιλητής: ένα «ἔφη» στην 1η ατάκα (του αφηγητή) πρέπει να σκάσει */
  if (spec.flow.who) {
    const u2 = clone(unit), p0 = L.paraOf(u2);
    const lastOf0 = u2.align.segs.filter(s => p0[s.n] === 0).pop();
    u2.ancient[0].p += ' ἔφη'; lastOf0.a[lastOf0.a.length - 1][0] += ' ἔφη';
    ok(L.check(spec, u2, src).some(e => /ατάκα 1 έχει «ἔφη»/.test(e)), id + ': ο validator πιάνει ομιλητή που δεν ταιριάζει με το «ἔφη»');
  }
}

console.log(`\narxaia-flow: ${pass} πέρασαν, ${fail} απέτυχαν`);
process.exit(fail ? 1 : 0);
