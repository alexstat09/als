// latinika-archikoi.html — οι αρχικοί χρόνοι XVI–XXVII. Η σελίδα ΠΑΡΑΓΕΤΑΙ
// (tools/latinika/archikoi.js) — το test απαιτεί build === αρχείο, τρέχει τους
// ελέγχους δεδομένων του builder, και ΤΡΕΧΕΙ τη σελίδα σε vm (σταθ. 57).
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('✗ ' + m); } };
/* XXIX: τα κείμενα = XVI–XX + κάθε lectioNN.json (όχι σκληρή λίστα ως το XXVII) */
const JS = require(path.join(ROOT, 'tools/latinika/lib')).listPacks().filter(n => n >= 21);
const WANT = [16, 17, 18, 19, 20].concat(JS);

/* 1 · έλεγχοι δεδομένων + η σελίδα είναι ΑΚΡΙΒΩΣ το build */
const before = read('latinika-archikoi.html');
let out = '';
try { out = cp.execFileSync(process.execPath, [path.join(ROOT, 'tools/latinika/archikoi.js')], {encoding:'utf8'}); ok(true, ''); }
catch (e) { ok(false, 'ο builder έσκασε: ' + (e.stdout || e.message)); }
ok(new RegExp('✓ ' + WANT.length + ' κείμενα').test(out), 'ο builder βλέπει ' + WANT.length + ' κείμενα');
const PAGE = read('latinika-archikoi.html');
ok(PAGE === before, 'η σελίδα στο repo = το build (μην την αγγίζεις με το χέρι)');
ok(!/\{\{[A-Z_]+\}\}/.test(PAGE), 'κανένα placeholder δεν έμεινε');
ok(!/<script[^>]*\ssrc=/i.test(PAGE), 'κανένα script src (σταθ. 8)');
ok(/href="latinika-archikoi\.html"/.test(read('latinika.html')), 'η βιβλιοθήκη δείχνει στη σελίδα');
ok(/'latinika-archikoi\.html'/.test(read('sw.js')), 'SW CORE');
ok(PAGE.includes('<a href="latinika.html">'), 'έξοδος προς τα Λατινικά');

/* 2 · τα δεδομένα */
const script = PAGE.slice(PAGE.lastIndexOf('<script>') + 8, PAGE.lastIndexOf('</script>'));
const data = new Function(script.slice(0, script.indexOf('/* ══ Η ΜΗΧΑΝΗ')) + '; return {LEX, TEXTS};')();
ok(data.TEXTS.map(t => t.n).join() === WANT.join(), 'XVI…XX + ' + JS.join(',') + ' με τη σειρά');
ok(data.TEXTS.every(t => t.rows.length && t.rows.every(r => data.LEX[r.m] && r.f && r.ctx.includes('<b>'))), 'κάθε τύπος: λήμμα + τύπος + πρόταση με τη λέξη');
/* ένα ρήμα = μία μορφή: τα κοινά παίρνουν τη μορφή των XXI–XXVII */
const first = {};
for (const n of JS){ const M = JSON.parse(read('tools/latinika/lectio' + n + '.json')).M; for (const k in M) if (M[k].p === 'v' && !first[k]) first[k] = M[k].l; }
ok(Object.keys(first).every(k => data.LEX[k] && data.LEX[k].l === first[k]), 'κάθε ρήμα των XXI–XXVII = ίδια μορφή με τη σελίδα του (ένα ρήμα, μία μορφή)');
ok(data.LEX.fio && data.TEXTS[4].rows.find(r => r.w === 'factus est').m === 'fio', 'XX factus est → fio (όχι sum)');
ok(data.LEX.miseror.l === 'miseror, miseratus sum, miserāri', 'αποθετικό χωρίς σουπίνο, όπως το βιβλίο');

/* 3 · η σελίδα ΤΡΕΧΕΙ (στουμπωμένο DOM) */
const els = {};
function El(id){
  const cls = new Set(), attrs = {};
  return els[id] = { id, innerHTML:'', textContent:'', style:{}, dataset:{}, onclick:null, _h:{},
    classList:{ add:c => cls.add(c), remove:c => cls.delete(c), toggle:(c, on) => (on === undefined ? (cls.has(c) ? cls.delete(c) : cls.add(c)) : on ? cls.add(c) : cls.delete(c)), contains:c => cls.has(c) },
    setAttribute:(k, v) => { attrs[k] = String(v); }, getAttribute:k => (k in attrs ? attrs[k] : null),
    addEventListener(t, f){ this._h[t] = f; }, querySelectorAll:() => [], querySelector:() => null,
    getBoundingClientRect:() => ({top:0}), scrollIntoView(){}, closest:() => null };
}
const store = {};
const doc = {
  getElementById:id => els[id] || El(id),
  querySelector:s => els['q:' + s] || El('q:' + s),
  querySelectorAll:() => [],
  addEventListener(){}
};
const mk = () => ({ document:doc, localStorage:{ getItem:k => (k in store ? store[k] : null), setItem:(k, v) => { store[k] = String(v); } },
  location:{hash:''}, history:{replaceState(){}}, console, Date, Math, JSON, Set, Map, Object, Array, String, Number });
const ctx = mk();
try { vm.runInNewContext(script, ctx); ok(true, ''); } catch (e) { ok(false, 'η σελίδα σκάει στη φόρτωση: ' + e.message); }
const rows = h => (h.match(/<tr[^>]*><td class="n">/g) || []).length;
/* XXIX: τα πλήθη ΥΠΟΛΟΓΙΖΟΝΤΑΙ από τα δεδομένα (ήταν 255 / 156 ως το XXVII) */
const N_FORMS = data.TEXTS.reduce((a, t) => a + t.rows.length, 0), N_LEM = Object.keys(data.LEX).length;
ok(rows(els.tabs.innerHTML) === N_FORMS, 'ανά κείμενο: ' + N_FORMS + ' γραμμές (' + rows(els.tabs.innerHTML) + ')');
ok(data.TEXTS.every(t => els.tabs.innerHTML.includes(t.t)), 'κάθε κείμενο έχει τον τίτλο του');
ok(els.bDue.textContent === N_LEM, 'κάρτες για σήμερα = ' + N_LEM + ' νέες');
/* κατά κατηγορία: κάθε ρήμα ΜΙΑ φορά */
const ctx2 = mk();
try {
  vm.runInNewContext(script + `;ui.grp='cat';fillTables();this.__cat=document.getElementById('tabs').innerHTML;
    startDeck('t:19');this.__xix=document.getElementById('stage').innerHTML;
    flip();rate('x');this.__red=document.getElementById('bRed').textContent;`, ctx2);
} catch (e) { ok(false, 'οδήγηση: ' + e.message); }
ok(rows(ctx2.__cat || '') === N_LEM, 'κατά κατηγορία: ' + N_LEM + ' ρήματα, το καθένα μία φορά (' + rows(ctx2.__cat || '') + ')');
ok(/coniurāvit/.test(ctx2.__xix || ''), 'η τράπουλα του XIX ξεκινάει από την 1η λέξη του κειμένου');
ok(ctx2.__red === 1, 'ένα ✗ → «Για ξανά» = 1');
ok(/"v:coniuro"/.test(store.latarx_cards_v1 || ''), 'η κάρτα σώθηκε στο latarx_cards_v1');

/* 4 · «μου είναι δύσκολο»: ανά ρήμα, ανάβει σε κάθε γραμμή του, δική του τράπουλα + φίλτρο */
const ctx3 = mk();
try {
  vm.runInNewContext(script + `;this.__e=document.getElementById('hsum').innerHTML;
    toggleHard('coniuro');toggleHard('fio');
    this.__n=document.getElementById('bHard').textContent;this.__s=document.getElementById('hsum').innerHTML;
    ui.onlyH=true;ui.grp='txt';fillTables();this.__f=document.getElementById('tabs').innerHTML;
    startDeck('hard');this.__q=queue.length+(cur?1:0);
    toggleHard('fio');this.__n2=document.getElementById('bHard').textContent;`, ctx3);
} catch (e) { ok(false, 'δύσκολα: ' + e.message); }
ok(/Τι σε δυσκολεύει/.test(ctx3.__e || ''), 'χωρίς δύσκολα: η κάρτα λέει τι να κάνει');
ok(ctx3.__n === 2 && /data-find="coniuro"/.test(ctx3.__s || '') && /hcr/.test(ctx3.__s || ''), 'δύο σημειωμένα → 2, chips + κατηγορίες');
const occN = data.TEXTS.reduce((a, t) => a + t.rows.filter(r => r.m === 'coniuro' || r.m === 'fio').length, 0);
ok(rows(ctx3.__f || '') === occN && /class="hard"/.test(ctx3.__f || ''), 'μόνο τα δύσκολα: ' + occN + ' γραμμές (' + rows(ctx3.__f || '') + ')');
ok(ctx3.__q === 2, 'η τράπουλα «Δύσκολα» = 2 κάρτες');
ok(ctx3.__n2 === 1 && /"coniuro"/.test(store.latarx_hard_v1) && !/"fio"/.test(store.latarx_hard_v1), 'το ξε-σημείωμα σβήνει από το latarx_hard_v1');

console.log('latinika-archikoi: ' + pass + ' pass, ' + fail + ' fail');
process.exit(fail ? 1 : 0);
