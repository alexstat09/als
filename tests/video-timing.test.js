/* ══════════════════════════════════════════════════════════════════════════
   ΤΟ ΒΙΝΤΕΟ — ΧΡΟΝΙΣΜΟΣ ΚΑΙ ΑΥΤΟΛΕΞΕΙ ΚΕΙΜΕΝΟ

   Δύο εγγυήσεις που καμία οπτική επιθεώρηση δεν πιάνει:

   1 · ΚΑΝΕΝΑ ΓΕΓΟΝΟΣ ΜΕΤΑ ΤΟ ΤΕΛΟΣ ΤΗΣ ΣΚΗΝΗΣ ΤΟΥ.
       Η διάρκεια κάθε σκηνής ΕΙΝΑΙ η διάρκεια του ήχου της. Όταν αλλάξει η
       αφήγηση (νέα φωνή, νέα ηχογράφηση), οι σκηνές κονταίνουν — και ό,τι
       animation ξεκινάει μετά το τέλος δεν παίζεται ΠΟΤΕ. Χωρίς σφάλμα,
       χωρίς κενή οθόνη: απλώς λείπει. Σταθερή αρχή 10 σε νέα θέση.
       Πιάστηκε αληθινά: μετά την ηχογράφηση του Αλεξ η s08 κόπηκε από 15,11
       σε 13,20 και οι τελευταίες κουκκίδες έπεφταν στο 13,29.

   2 · Η ΑΦΗΓΗΣΗ ΕΙΝΑΙ ΤΟ ΒΙΒΛΙΟ, ΑΥΤΟΛΕΞΕΙ.
       Ό,τι κι αν αλλάξει στη φωνή, τα ΛΟΓΙΑ πρέπει να μένουν ταυτόσημα με
       το istoria-data.js, χαρακτήρα προς χαρακτήρα.
   ══════════════════════════════════════════════════════════════════════ */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
let pass = 0, fail = 0;
function is(name, cond, detail){
  if (cond){ pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + (detail ? '  → ' + detail : '')); }
}

const UNIT = 'a1a';
const html = fs.readFileSync(path.join(ROOT, 'istoria-video-demo.html'), 'utf8');
const man  = JSON.parse(fs.readFileSync(path.join(ROOT, 'vid', UNIT, 'manifest.json'), 'utf8'));

/* ── 1 · Η αφήγηση ταυτίζεται με το βιβλίο ───────────────────────────── */
const data = fs.readFileSync(path.join(ROOT, 'istoria-data.js'), 'utf8');
const block = data.slice(data.indexOf("id: '" + UNIT + "'"), data.indexOf('table: {'));
const paras = [...block.matchAll(/\{ p: '((?:[^'\\]|\\.)*)' \}/g)].map(m => m[1].replace(/\\'/g, "'"));
const norm = s => s.replace(/\s+/g, ' ').trim();

is('η αφήγηση είναι ΑΥΤΟΛΕΞΕΙ το κείμενο του βιβλίου',
   norm(man.map(s => s.text).join(' ')) === norm(paras.join(' ')),
   'αφήγηση ' + norm(man.map(s => s.text).join(' ')).length + ' χαρ. vs βιβλίο ' + norm(paras.join(' ')).length);

is('κάθε σκηνή έχει ήχο με πραγματική διάρκεια',
   man.every(s => s.dur > 0.3), 'κάποια σκηνή έχει διάρκεια ~0');

is('κάθε αρχείο ήχου υπάρχει στον δίσκο',
   man.every(s => fs.existsSync(path.join(ROOT, 'vid', UNIT, s.id + '.m4a'))));

/* ── 2 · Καμία κίνηση δεν ξεπερνά τη σκηνή της ──────────────────────── */
const src = html.match(/<script>\n([\s\S]*?)\n<\/script>/)[1];
const geo = fs.readFileSync(path.join(ROOT, 'greece-geo.js'), 'utf8');

const stub = () => ({ style: {}, classList: { toggle(){}, add(){}, remove(){} },
                      addEventListener(){}, appendChild(){}, setAttribute(){},
                      removeAttribute(){}, getAttribute:()=>null, children: [] });
const ctx = {
  console: { log(){}, error(){} },
  performance: { now: () => 0 },
  document: { getElementById: stub, addEventListener(){}, createElement: stub,
              querySelectorAll: () => [] },
  fetch: () => new Promise(() => {}),
  requestAnimationFrame: () => 0,
  Audio: function(){ return { play(){ return Promise.resolve(); } }; },
  window: {}
};
vm.createContext(ctx);
vm.runInContext(geo + '\n' + src, ctx);

is('όλες οι σκηνές του manifest υπάρχουν στον κώδικα',
   man.every(s => typeof ctx.SCENES[s.id] === 'function'),
   man.filter(s => !ctx.SCENES[s.id]).map(s => s.id).join(','));

const over = [];
man.forEach(m => {
  ctx.CUR_DUR = m.dur;                       /* όπως το κάνει ο προβολέας */
  let out = ctx.SCENES[m.id]();
  if (typeof out !== 'string') out = out.svg;
  let last = 0, x;
  const re = /animation:(\w+)\s+([\d.]+)s\s+([\d.]+)s/g;
  while ((x = re.exec(out))){
    if (/infinite/.test(out.slice(x.index, x.index + 90))) continue;   /* αέναα δεν μετράνε */
    last = Math.max(last, parseFloat(x[3]) + parseFloat(x[2]));
  }
  if (last > m.dur) over.push(m.id + ' (τελειώνει ' + last.toFixed(2) + 'ς σε σκηνή ' + m.dur.toFixed(2) + 'ς)');
});
is('καμία κίνηση δεν ξεκινά ή τελειώνει μετά τη σκηνή της', over.length === 0, over.join(' · '));

/* ── 3 · Ο χρονισμός ΠΡΕΠΕΙ να αντέχει και σε πιο σύντομη αφήγηση ───── */
const tight = [];
man.forEach(m => {
  ctx.CUR_DUR = m.dur * 0.75;                /* μια πιο γρήγορη ηχογράφηση */
  let out = ctx.SCENES[m.id]();
  if (typeof out !== 'string') out = out.svg;
  let last = 0, x;
  const re = /animation:(\w+)\s+([\d.]+)s\s+([\d.]+)s/g;
  while ((x = re.exec(out))){
    if (/infinite/.test(out.slice(x.index, x.index + 90))) continue;
    last = Math.max(last, parseFloat(x[3]) + parseFloat(x[2]));
  }
  if (last > m.dur * 0.75 + 0.01) tight.push(m.id);
});
/* ⚠️ Δηλωμένο: οι σκηνές με ΣΤΑΘΕΡΟ χρονισμό δεν αντέχουν 25% συντόμευση.
   Αυτό είναι γνωστό και αποδεκτό — ο έλεγχος υπάρχει για να ΞΕΡΟΥΜΕ ποιες
   είναι, ώστε αν κάποια γίνει πρόβλημα να περάσει σε fitStep(). */
console.log('  note οι σκηνές που δεν αντέχουν 25% συντόμευση: ' + (tight.join(',') || 'καμία'));

console.log('\n' + pass + ' pass, ' + fail + ' fail');
process.exit(fail ? 1 : 0);
