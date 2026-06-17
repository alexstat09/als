// JSC-compatible accuracy harness. Run:
//   /System/Library/Frameworks/JavaScriptCore.framework/Versions/A/Helpers/jsc \
//     -e "var module={exports:{}};" api/_core-foods.js api/_validate-jsc.js
// (_core-foods.js sets module.exports; this file then reads + checks it.)
'use strict';
var CORE = module.exports;
function log(s){ print(s); }

function recon() {
  var flags = [];
  CORE.forEach(function (f) {
    var atwater = 4 * f.p + 4 * f.c + 9 * f.f - 2 * (f.fiber || 0);
    var diff = f.kcal - atwater, pct = f.kcal ? Math.abs(diff) / f.kcal : 0;
    if (Math.abs(diff) > 25 && pct > 0.12)
      flags.push('  ' + f.name + ': stated ' + f.kcal + ' vs calc ' + Math.round(atwater) + ' (' + (diff>0?'+':'') + Math.round(diff) + ')');
  });
  return flags;
}
function integrity() {
  var flags = [], seen = {};
  CORE.forEach(function (f) {
    if (!f.name) flags.push('  missing name');
    ['kcal','p','c','f'].forEach(function (k){ if (typeof f[k] !== 'number' || f[k] < 0) flags.push('  ' + f.name + ': bad ' + k); });
    if (!f.s) flags.push('  ' + f.name + ': no serving');
    var nk = f.name.toLowerCase();
    if (seen[nk]) flags.push('  DUPLICATE: ' + f.name);
    seen[nk] = 1;
  });
  return flags;
}
function fold(s){ return String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/ς/g,'σ'); }
function toks(s){ return fold(s).split(/[^a-z0-9α-ω]+/).filter(Boolean); }
function tokEq(a,b){ return a===b || (a.length>=4 && b.length>=4 && (a.indexOf(b)===0 || b.indexOf(a)===0)); }
function coreHit(q){
  var qt = toks(q); if (!qt.length) return null;
  for (var i=0;i<CORE.length;i++){
    var nt = toks(CORE[i].name + ' ' + (CORE[i].alias||''));
    var ok = qt.every(function(t){ return nt.some(function(x){ return tokEq(x,t); }); });
    if (ok) return CORE[i].name;
  }
  return null;
}
var BENCH = [
  'chicken breast','σολομος','salmon','egg','αυγο','basmati rice','ρυζι','oats','βρωμη',
  'feta','φετα','ρυζι','greek yogurt','fage','galpo','kri kri','philadelphia','regato','kefir',
  'basmati','milk chocolate','σοκολατα γαλακτος','dark chocolate','ion','γκοφρετα','kinder bueno',
  'ferrero rocher','biscoff','oreo','marzipan','haribo','cupcake','cookie','κορμος',
  'granola','almond butter','peanut butter','magnum','gelato','χωνακι','vanilla ice cream',
  'protein bar','born winner','hungry not','coco pops','sourdough','σιτου σικαλη',
  'κουλουρι θεσσαλονικης','λαγανα','pita','μακαρονια με κιμα','κοτοπουλο κοκκινιστο',
  'τυροπιτα','σπανακοπιτα','σουβλακι κοτοπουλο','πιτογυρο','gyros','quiche','καλαμαρι',
  'ground beef','κιμας','flank steak','συκωτι','veal liver','turkey bacon','egg yolk',
  'kiwi','pineapple','μανταρινι','garlic','σκορδο','tomato paste','πελτες','brazil nuts',
  'zero ketchup','sweet chilli','pizza','burrito','kfc','cheeseburger','monster energy',
  'banana','blueberries','honey','olive oil','avocado','sweet potato','whey','tuna'
];
function coverage(){ var m=[]; BENCH.forEach(function(q){ if (!coreHit(q)) m.push('  MISS: "'+q+'"'); }); return m; }

var r = recon(), i = integrity(), c = coverage();
log('CORE DB: ' + CORE.length + ' foods\n');
log('— kcal reconciliation flags (' + r.length + '):'); log(r.length ? r.join('\n') : '  all within tolerance');
log('\n— integrity flags (' + i.length + '):'); log(i.length ? i.join('\n') : '  clean');
log('\n— coverage misses (' + c.length + ' of ' + BENCH.length + '):'); log(c.length ? c.join('\n') : '  every benchmark food hits a verified core item');
