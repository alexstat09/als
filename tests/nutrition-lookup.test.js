// Nutrition lookup hardening (als-v413).
// Every case below is a REAL failure measured against the live endpoints on
// 2026-07-25, or a bug found in the fix itself. Locking them so they can't
// come back.
'use strict';
var assert = require('assert');
var KNOW = require('../api/_food-know.js');
var CHECK = require('../api/_nut-check.js');

var pass = 0;
function t(name, fn) { fn(); pass++; console.log('  ✓ ' + name); }

console.log('\n— classification: the road each food takes —');

t('a homemade Greek dish routes to ingredients, not a product search', function () {
  // live: "τυρόπιτα από φούρνο" was product-searched and returned 60 kcal/28g
  assert.strictEqual(KNOW.classify('τυρόπιτα από φούρνο').kind, 'dish');
  assert.strictEqual(KNOW.classify('μακαρόνια με κιμά').kind, 'dish');
  assert.strictEqual(KNOW.classify('chicken gyros pita').kind, 'dish');
});

t('a branded product still routes to a label lookup', function () {
  assert.strictEqual(KNOW.classify('kinder bueno').kind, 'branded');
  assert.strictEqual(KNOW.classify('born winner protein bar').kind, 'branded');
  assert.strictEqual(KNOW.classify('ΓΙΩΤΗΣ κρέμα στιγμής').kind, 'branded');
});

t('a brand outranks a dish word (Misko pasta is a package)', function () {
  assert.strictEqual(KNOW.classify('μακαρόνια misko').kind, 'branded');
});

console.log('\n— quantity: his own words carry the count —');

t('a weight is a size, never a count', function () {
  // regression: the digit run backtracked, so "200g chicken" read as 20 portions
  assert.strictEqual(KNOW.quantityOf('200g chicken'), 1);
  assert.strictEqual(KNOW.quantityOf('500ml milk'), 1);
  assert.strictEqual(KNOW.quantityOf('150 γρ ρύζι'), 1);
});

t('a real count is kept', function () {
  assert.strictEqual(KNOW.quantityOf('2 τυρόπιτες'), 2);
  assert.strictEqual(KNOW.quantityOf('3 x oreo'), 3);
  assert.strictEqual(KNOW.quantityOf('μισή πίτα'), 0.5);
});

console.log('\n— query rewriting —');

t('Greek dishes gain English search terms', function () {
  var en = KNOW.classify('λουκουμάδες').en;
  assert.ok(/loukoumades/.test(en), 'expected an English rewrite, got: ' + en);
});

t('a substring never steers the query to the wrong food', function () {
  // regression: 'πιτα' matched inside 'τυροπιτα' and appended "pita bread"
  var en = KNOW.classify('τυρόπιτα').en;
  assert.ok(/cheese pie/.test(en), 'expected cheese pie terms: ' + en);
  assert.ok(!/pita bread/.test(en), 'πίτα leaked into a cheese-pie query: ' + en);
});

console.log('\n— source trust —');

t('manufacturers and label databases outrank content farms', function () {
  assert.strictEqual(KNOW.sourceTier('ferrero.com'), 0);
  assert.strictEqual(KNOW.sourceTier('sklavenitis.gr'), 0);
  assert.strictEqual(KNOW.sourceTier('openfoodfacts.org'), 1);
  assert.strictEqual(KNOW.sourceTier('nutracheck.co.uk'), 3);
  // the three that produced live garbage
  assert.strictEqual(KNOW.sourceTier('arise-app.com'), 4);
  assert.strictEqual(KNOW.sourceTier('fitvibestd.com'), 4);
  assert.strictEqual(KNOW.sourceTier('dietandfitnesstoday.com'), 4);
});

t('an unrecognised site can never confirm a result on its own', function () {
  assert.ok(KNOW.canConfirmAlone(0));
  assert.ok(KNOW.canConfirmAlone(2));
  assert.ok(!KNOW.canConfirmAlone(3));
  assert.ok(!KNOW.canConfirmAlone(4));
});

console.log('\n— grounding: the test a fabrication cannot pass —');

t('a number present in the page is grounded', function () {
  assert.ok(CHECK.appearsIn(571, 'Energy 571 kcal per 100g'));
  assert.ok(CHECK.appearsIn(8.5, 'Protein 8,5 g'), 'comma decimals are how EU labels print');
  assert.ok(CHECK.appearsIn(120, 'Energy 502 kJ'), 'kJ-only labels still ground kcal');
});

t('a number absent from the page is NOT grounded', function () {
  assert.ok(!CHECK.appearsIn(400, 'Protein 30g carbohydrate 25g fat 12g'));
});

t('digit boundaries are respected', function () {
  assert.ok(!CHECK.appearsIn(45, 'net weight 1450 g'), '45 must not match inside 1450');
});

t('THE LIVE FABRICATION: Born Winner 400/40/40/14 is rejected', function () {
  // measured live 2026-07-25: confidence 1.0, numbers on no label anywhere
  var v = CHECK.verify({
    per100: { kcal: 400, p: 40, c: 40, f: 14 },
    evidence: 'Born Winner protein bar cookies and cream 60g bar high protein',
    name: 'born winner protein bar', tier: 3
  });
  assert.strictEqual(v.confirmed, false, 'ungrounded numbers must never be confirmed');
  assert.ok(v.confidence <= 0.4, 'confidence should collapse, got ' + v.confidence);
  assert.ok(/do not appear/.test(v.why.join(' ')), 'must SAY why: ' + v.why.join(' · '));
});

console.log('\n— label arithmetic —');

t('sugars cannot exceed carbohydrate', function () {
  assert.ok(/sugars exceed/.test(CHECK.internal({ kcal: 400, p: 5, c: 20, f: 10, sugar: 30 }).flags.join(' ')));
});

t('saturates cannot exceed fat', function () {
  assert.ok(/saturates exceed/.test(CHECK.internal({ kcal: 400, p: 5, c: 20, f: 10, satfat: 14 }).flags.join(' ')));
});

t('macros cannot exceed 100 g per 100 g', function () {
  assert.ok(/exceed 100/.test(CHECK.internal({ kcal: 700, p: 40, c: 40, f: 40 }).flags.join(' ')));
});

t('a clean real label passes silently', function () {
  // Kinder Bueno, actual label
  assert.deepStrictEqual(CHECK.internal({ kcal: 571, p: 8.5, c: 49.5, f: 37.3, sugar: 42, satfat: 23.5, fiber: 2 }).flags, []);
});

console.log('\n— category priors: is this even the right kind of food? —');

t('THE LIVE ERROR: a 60 kcal/100g cheese pie is flagged', function () {
  var v = CHECK.prior('τυρόπιτα cheese pie', { kcal: 60, p: 2, c: 10.1, f: 2 });
  assert.ok(v.flags.length, 'a fried pastry at 60 kcal/100g must be caught');
});

t('a real pastry passes', function () {
  assert.deepStrictEqual(CHECK.prior('τυρόπιτα cheese pie', { kcal: 316, p: 9, c: 26, f: 19 }).flags, []);
});

t('olive oil is allowed to be 884 kcal', function () {
  assert.deepStrictEqual(CHECK.prior('olive oil', { kcal: 884, p: 0, c: 0, f: 100 }).flags, []);
});

console.log('\n— portions: correct macros on the wrong mass is still wrong —');

t('THE LIVE ERROR: a Kinder Bueno is the whole bar, not one finger', function () {
  // live: serving resolved to 21 g — half of what he actually eats
  var p = KNOW.portionPrior('kinder bueno');
  assert.ok(p && p.g === 43, 'expected the 43 g two-finger bar, got ' + (p && p.g));
});

t('a gyros in pita is a real meal, not 100 g', function () {
  assert.ok(KNOW.portionPrior('πιτόγυρο').g >= 300);
});

t('a bakery cheese pie has a real weight', function () {
  assert.strictEqual(KNOW.portionPrior('τυρόπιτα').g, 150);
});

console.log('\n— consensus —');

t('independent sources agreeing raises confidence', function () {
  var c = CHECK.consensus([
    { per100: { kcal: 571 }, tier: 0 },
    { per100: { kcal: 565 }, tier: 1 },
    { per100: { kcal: 320 }, tier: 4 }
  ]);
  assert.strictEqual(c.agree, 2);
  assert.strictEqual(c.best.tier, 0, 'the most trustworthy source leads');
});

t('a confirmed verdict needs grounding AND a source allowed to confirm', function () {
  var good = CHECK.verify({
    per100: { kcal: 571, p: 8.5, c: 49.5, f: 37.3 },
    evidence: 'Kinder Bueno per 100g energy 571 kcal protein 8.5 carbohydrate 49.5 fat 37.3',
    name: 'kinder bueno chocolate', tier: 0, agree: 2
  });
  assert.strictEqual(good.confirmed, true);
  assert.ok(good.confidence >= 0.85, 'got ' + good.confidence);

  // identical numbers, but the only source is a content farm
  var farm = CHECK.verify({
    per100: { kcal: 571, p: 8.5, c: 49.5, f: 37.3 },
    evidence: 'Kinder Bueno per 100g energy 571 kcal protein 8.5 carbohydrate 49.5 fat 37.3',
    name: 'kinder bueno chocolate', tier: 4, agree: 1
  });
  assert.strictEqual(farm.confirmed, false, 'a tier-4 site cannot confirm alone');
});

console.log('\n— never silently confident —');

t('every downgraded verdict explains itself', function () {
  var v = CHECK.verify({ per100: { kcal: 60, p: 2, c: 10, f: 2 }, evidence: 'nothing here', name: 'τυρόπιτα cheese pie', tier: 4 });
  assert.ok(v.why.length >= 2, 'a bad result must say what is wrong with it');
  assert.strictEqual(v.confirmed, false);
});

console.log('\n' + pass + ' assertions groups passed — nutrition lookup\n');
