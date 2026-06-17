// Generates the nut:meals seed from Alex's MFP saved meals, sourcing every
// item from the verified core DB. Run via JSC (see bottom). Prints JSON + a
// per-item audit (matched core food, computed vs MFP kcal) for review.
'use strict';
var CORE = module.exports;
function fold(s){ return String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/ς/g,'σ'); }
function toks(s){ return fold(s).split(/[^a-z0-9α-ω]+/).filter(Boolean); }
function tokEq(a,b){ return a===b || (a.length>=4 && b.length>=4 && (a.indexOf(b)===0 || b.indexOf(a)===0)); }
function find(q){
  var qt = toks(q);
  for (var i=0;i<CORE.length;i++){
    var nt = toks(CORE[i].name + ' ' + (CORE[i].alias||''));
    if (qt.every(function(t){ return nt.some(function(x){ return tokEq(x,t); }); })) return CORE[i];
  }
  return null;
}
function r0(n){ return Math.round(n); }
function r1(n){ return Math.round(n*10)/10; }
function item(q, g){
  var cf = find(q);
  if (!cf) { print('  !! NO MATCH for "' + q + '"'); return null; }
  var k = g/100;
  return { _q:q, _core:cf.name, name:cf.name, grams:g, source:'core',
    kcal:r0(cf.kcal*k), p:r1(cf.p*k), c:r1(cf.c*k), f:r1(cf.f*k),
    fiber:r1((cf.fiber||0)*k), sugar:r1((cf.sugar||0)*k), sodium:r0((cf.sodium||0)*k), satfat:r1((cf.satfat||0)*k) };
}
// [name, mfpKcal(for audit), [[query, grams], ...]]
var MEALS = [
  ['Protein yogurt snack', 378, [['greek yogurt 0%',400],['protein drink mix',23],['coco pops',15]]],
  ['Gnocci tuna', 582, [['tomato basil pasta sauce',100],['whole wheat pasta',80],['parmesan',10],['tuna canned',170]]],
  ['Sourdough w eggs', 512, [['egg whole',200],['sourdough bread',80],['honey',10]]],
  ['Kalamari risotto', 527, [['bell pepper',50],['onion',15],['garlic',4],['sweet chilli sauce zero',50],['calamari raw',265],['white rice dry',77]]],
  ['Fakes (lentil soup, 2 portions)', 1048, [['canned tomatoes',250],['onion',120],['stock cube',250],['lentils dry',250]]],
  ['Shrimp salmon rice', 580, [['salmon cooked',130],['white rice dry',58],['shrimp cooked',100],['lemon',10]]],
  ['Organic breakfast whole foods', 522, [['egg whole',200],['banana',100],['blueberries',50],['avocado',50],['honey',10]]],
  ['Salmon w rice', 561, [['salmon cooked',130],['green beans',100],['ketchup zero',70],['white rice dry',67]]],
  ['L/Beef veggie fried rice', 522, [['white rice dry',67],['mixed vegetables',100],['ground beef 93% lean raw',130],['ketchup zero',40],['stock cube',250]]],
  ['L/Grilled chicken w basmati rice', 508, [['white rice dry',67],['chicken breast cooked',130],['green beans',100],['ketchup zero',70]]],
  ['Sillz genius yogurt bowl', 515, [['blueberries',150],['honey',20],['greek yogurt 0%',300],['chocolate brownie batter',12],['ion dark chocolate',15],['kiwi',100]]],
  ['Staple yogurt low kcal', 576, [['blueberries',30],['banana',50],['kiwi',120],['honey',10],['brazil nuts',10],['greek yogurt 0%',300],['chocolate brownie batter',12],['almond butter',20]]],
  ['S/dark yogurt bowl', 591, [['blueberries',60],['honey',10],['brazil nuts',10],['greek yogurt 0%',300],['chocolate brownie batter',12],['almond butter',20],['cocoa powder',20],['hemp seeds',10]]],
  ['Steak w eggs', 704, [['beef brizola lean raw',250],['egg whole',220],['lemon',10]]],
  ['L/Salmon w sweet potato', 520, [['salmon cooked',130],['green beans',100],['ketchup zero',70],['sweet potato',250]]],
  ['Egg honey school sandwich', 482, [['parmesan',20],['egg whole',120],['honey',10],['rye sourdough',80]]],
  ['S/Yogurt bowl', 679, [['blueberries',30],['greek yogurt 0%',350],['banana',50],['kiwi',120],['almond butter',20],['honey',10],['chocolate brownie batter',16],['ion dark chocolate',10],['brazil nuts',10]]],
  ['L/Chicken n potatoes', 455, [['chicken breast cooked',130],['green beans',100],['ketchup zero',70],['potato raw',250]]],
  ['Flank steak w potatoes', 617, [['potato raw',250],['green beans',100],['beef brizola lean raw',250],['lemon',10]]],
  ['Veal liver w potatoes', 614, [['potato raw',250],['green beans',100],['veal liver',200],['lemon',10]]],
  ['S/Oats', 447, [['oats',60],['ion dark chocolate',15],['protein donut',40]]],
  ['Spaghetti w turkey bacon', 656, [['olive oil',7],['egg yolk',34],['turkey bacon',40],['pasta dry',80],['parmesan',37]]],
  ['Tortiglioni chicken bake', 656, [['whole wheat pasta',70],['chicken breast cooked',80],['fresko gala',60],['greek yogurt 0%',55],['parmesan',25],['onion',40],['bell pepper',50],['spinach',30],['tomato paste',15],['olive oil',7]]],
  ['Salmon w potato', 546, [['salmon cooked',130],['green beans',100],['ketchup zero',70],['potato raw',300]]],
  ['Nutrient dense pasta', 587, [['ground beef 93% lean raw',80],['tomato basil pasta sauce',100],['spinach',100],['whole wheat pasta',80],['parmesan',25]]]
];

var seed = [];
MEALS.forEach(function(m){
  var items = m[2].map(function(it){ return item(it[0], it[1]); });
  if (items.indexOf(null) !== -1) { print('MEAL "' + m[0] + '" had an unmatched item — fix query.'); return; }
  var kc = items.reduce(function(s,e){ return s+e.kcal; }, 0);
  print(m[0] + ': computed ' + kc + ' kcal  (MFP ' + m[1] + ', Δ' + (kc-m[1]) + ')');
  items.forEach(function(e){ print('     · ' + e._q + ' ' + e.grams + 'g → ' + e._core + ' (' + e.kcal + ')'); });
  // strip audit fields for the real seed
  var clean = items.map(function(e){ var c={}; for (var k in e){ if (k[0] !== '_') c[k]=e[k]; } return c; });
  var id = 'seedmeal-' + m[0].toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  seed.push({ id:id, name:m[0], items:clean });
});

print('\n===SEED_JSON_START===');
print(JSON.stringify(seed));
print('===SEED_JSON_END===');
print('\nTotal meals: ' + seed.length);
