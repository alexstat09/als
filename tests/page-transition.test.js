/* tests/page-transition.test.js — οι μεταβάσεις σελίδων (als-v622).
   1 · το μπλοκ VT είναι ΙΔΙΟ σε aurora.css και kentro-exit.css (δύο αντίγραφα = δύο αλήθειες με καθυστέρηση)
   2 · ΚΑΘΕ σελίδα είτε δηλώνει μετάβαση (στατικό CSS στο <head>) είτε είναι στο NO_VT του topbar.js —
       αλλιώς το topbar πλοηγεί ΑΜΕΣΑ προς σελίδα που δεν κάνει crossfade = απότομο κόψιμο.
   3 · οι σελίδες χωρίς topbar που φοράνε kx-exit φορτώνουν το kentro-exit.js (κατεύθυνση «πίσω»). */
'use strict';
var fs = require('fs'), path = require('path');
var ROOT = path.join(__dirname, '..');
var pass = 0, fail = 0;
function ok(c, m) { if (c) pass++; else { fail++; console.error('  ✗ ' + m); } }
function rd(f) { return fs.readFileSync(path.join(ROOT, f), 'utf8'); }
function block(s) { var a = s.indexOf('/* ═══ VT-BEGIN'), b = s.indexOf('VT-END'); return a >= 0 && b > a ? s.slice(a, b) : null; }

var A = block(rd('aurora.css')), K = block(rd('kentro-exit.css'));
ok(A && K, 'το μπλοκ VT υπάρχει και στα δύο CSS');
ok(A === K, 'και είναι byte-για-byte ίδιο');
ok(/@view-transition\s*\{\s*navigation:\s*auto;\s*\}/.test(A || ''), 'δηλώνει navigation:auto');
ok(/prefers-reduced-motion[\s\S]*view-transition-new\(\*\)/.test(A || ''), 'σέβεται το reduced-motion');

var tb = rd('topbar.js');
var m = /const NO_VT = (\/.*\/);/.exec(tb);
ok(!!m, 'το topbar.js δηλώνει NO_VT');
var NO_VT = m ? eval(m[1]) : /$^/;
ok(/function vtTo\(/.test(tb) && /'onpagereveal' in window/.test(tb), 'το topbar ανιχνεύει cross-document VT');
ok(!/[`]/.test((tb.match(/const NO_VT[^\n]*/) || [''])[0]), 'καμία ανάποδη απόστροφος στη γραμμή NO_VT');

var pages = fs.readdirSync(ROOT).filter(function (f) { return /\.html$/.test(f) && f[0] !== '_'; });
pages.forEach(function (f) {
  var s = rd(f), head = s.split(/<\/head>/i)[0];
  var opted = /href="(aurora|kentro-exit)\.css"/.test(head);
  var redirect = /location\.replace\(/.test(s) && s.length < 6000;
  ok(opted || redirect || NO_VT.test(f), f + ': ούτε δηλώνει μετάβαση στο <head> ούτε είναι στο NO_VT');
  if (opted) ok(!NO_VT.test(f) || f === 'health.html', f + ': δηλώνει μετάβαση αλλά είναι στο NO_VT (θα έχανε το crossfade)');
  if (/class="(exit )?kx-exit"/.test(s) && !/src="topbar\.js"/.test(s))
    ok(/src="kentro-exit\.js"/.test(s), f + ': φοράει kx-exit χωρίς topbar → χρειάζεται kentro-exit.js');
});
/* ⛔ Η ΔΙΠΛΗ ΚΙΝΗΣΗ: η είσοδος του body καταπνίγεται με ΜΟΝΙΜΗ κλάση (vt-in),
   ΠΟΤΕ με :active-view-transition — εκείνο λήγει μόλις τελειώσει η μετάβαση και
   τότε το _tbIn ξεκινάει από opacity 0: η σελίδα θα εμφανιζόταν ΔΥΟ φορές. */
ok(!/:active-view-transition\)?\s*\{?\s*html:active-view-transition body/.test(A || '') && !/html:active-view-transition body/.test(A || ''),
   'το μπλοκ VT ΔΕΝ καταπνίγει το body με :active-view-transition');
ok(/html\.vt-in body[^{]*\{\s*animation:\s*none !important/.test(A || ''), 'καταπνίγει με τη μόνιμη html.vt-in');
var mark = tb.indexOf('markViewTransitionArrival'), cssAt = tb.indexOf('const css = ');
ok(mark > 0 && cssAt > mark, 'η vt-in μπαίνει ΠΡΙΝ φτιαχτεί το CSS του topbar');
var initT = tb.slice(tb.indexOf('function initTransitions'), tb.indexOf('function initTransitions') + 1400);
ok(initT.indexOf("classList.add('vt-back')") < 0, 'το initTransitions ΔΕΝ βάζει vt-back αργά (θα ξανάρχιζε την κίνηση)');
ok(/addEventListener\('pagereveal'[\s\S]{0,260}vt-back/.test(tb), 'η κατεύθυνση «πίσω» μπαίνει μέσα στο pagereveal');
var sw = rd('sw.js');
ok(sw.indexOf("'kentro-exit.js'") > 0 && sw.indexOf("'kentro-exit.css'") > 0, 'kentro-exit.css/js στο SW CORE');

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
