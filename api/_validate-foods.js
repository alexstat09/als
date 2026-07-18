// Throwaway accuracy harness for the core food DB. Run: node api/_validate-foods.js
'use strict';
var CORE = require('./_core-foods.js');

// ── 1. kcal reconciliation: stated kcal vs 4P+4C+9F ──────────────
// Fiber is mostly indigestible, so Atwater OVERESTIMATES high-fiber foods;
// we subtract fiber*2 as a rough correction before comparing.
function recon() {
  var flags = [];
  CORE.forEach(function (f) {
    // ethanol contributes 7 kcal/g and is NOT in P/C/F — count it for spirits/wine/beer
    var atwater = 4 * f.p + 4 * f.c + 9 * f.f - 2 * (f.fiber || 0) + 7 * (f.alc || 0);
    var diff = f.kcal - atwater;
    var pct = f.kcal ? Math.abs(diff) / f.kcal : 0;
    if (Math.abs(diff) > 25 && pct > 0.12) {
      flags.push('  ' + f.name + ': stated ' + f.kcal + ' vs calc ' + Math.round(atwater) + ' (Δ' + Math.round(diff) + ')');
    }
  });
  return flags;
}

// ── 2. integrity: required fields, dup names ─────────────────────
function integrity() {
  var flags = [], seen = {};
  CORE.forEach(function (f) {
    if (!f.name) flags.push('  missing name');
    ['kcal', 'p', 'c', 'f'].forEach(function (k) {
      if (typeof f[k] !== 'number' || f[k] < 0) flags.push('  ' + f.name + ': bad ' + k);
    });
    if (!f.s) flags.push('  ' + f.name + ': no serving size');
    var nk = f.name.toLowerCase();
    if (seen[nk]) flags.push('  DUPLICATE name: ' + f.name);
    seen[nk] = 1;
  });
  return flags;
}

// ── 3. coverage: every food Alex eats returns a core hit ─────────
// mirror the real server (food-search.js): fold diacritics + final sigma so
// unaccented Greek queries match accented names/aliases, then tokenize
function fold(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ς/g, 'σ'); }
function toks(s) { return fold(s).split(/[^a-z0-9α-ω]+/).filter(Boolean); }
function tokEq(a, b) { return a === b || (a.length >= 4 && b.length >= 4 && (a.indexOf(b) === 0 || b.indexOf(a) === 0)); }
function coreHit(q) {
  var qt = toks(q); if (!qt.length) return null;
  var hits = CORE.filter(function (cf) {
    var nt = toks(cf.name + ' ' + (cf.alias || ''));
    return qt.every(function (t) { return nt.some(function (x) { return tokEq(x, t); }); });
  });
  return hits.length ? hits[0].name : null;
}
var BENCH = [
  'chicken breast', 'σολομός', 'salmon', 'egg', 'αυγό', 'basmati rice', 'ριζι', 'oats', 'βρωμη',
  'feta', 'φετα', 'greek yogurt', 'fage', 'galpo', 'kri kri', 'philadelphia', 'regato', 'kefir',
  'milk chocolate', 'σοκολατα γαλακτος', 'dark chocolate', 'ion', 'γκοφρετα', 'kinder bueno',
  'ferrero rocher', 'biscoff', 'oreo', 'marzipan', 'haribo', 'cupcake', 'cookie', 'κορμος',
  'granola', 'almond butter', 'peanut butter', 'magnum', 'gelato', 'χωνακι', 'vanilla ice cream',
  'protein bar', 'born winner', 'hungry not', 'coco pops', 'sourdough', 'σιτου σικαλη',
  'κουλουρι θεσσαλονικης', 'λαγανα', 'pita', 'μακαρονια με κιμα', 'κοτοπουλο κοκκινιστο',
  'τυροπιτα', 'σπανακοπιτα', 'σουβλακι κοτοπουλο', 'πιτογυρο', 'gyros', 'quiche', 'καλαμαρι',
  'ground beef', 'κιμας', 'flank steak', 'συκωτι', 'veal liver', 'turkey bacon', 'egg yolk',
  'kiwi', 'pineapple', 'μανταρινι', 'garlic', 'σκορδο', 'tomato paste', 'πελτες', 'brazil nuts',
  'zero ketchup', 'sweet chilli', 'pizza', 'burrito', 'kfc', 'cheeseburger', 'monster energy',
  'banana', 'blueberries', 'honey', 'olive oil', 'avocado', 'sweet potato', 'whey', 'tuna'
];
function coverage() {
  var misses = [];
  BENCH.forEach(function (q) { if (!coreHit(q)) misses.push('  MISS: "' + q + '"'); });
  return misses;
}

var r = recon(), i = integrity(), c = coverage();
console.log('CORE DB: ' + CORE.length + ' foods\n');
console.log('— kcal reconciliation flags (' + r.length + '):'); console.log(r.join('\n') || '  ✓ all within tolerance');
console.log('\n— integrity flags (' + i.length + '):'); console.log(i.join('\n') || '  ✓ clean');
console.log('\n— coverage misses (' + c.length + ' of ' + BENCH.length + '):'); console.log(c.join('\n') || '  ✓ every benchmark food hits a verified core item');
