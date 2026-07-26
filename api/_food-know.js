// ════════════════════════════════════════════════════════════════
// What kind of food is this, and what do we already know about it?
//
// The old pipeline sent EVERY query down one road: "find the exact product on
// the web." That is right for a packaged product and actively wrong for a
// homemade dish — there is no exact τυρόπιτα to find, so the model would grab
// whichever SEO page ranked and report it with confidence. Live proof, before
// this file existed: "τυρόπιτα από φούρνο" → 60 kcal / 28 g, sourced from
// eatthismuch.com, while the app's own verified DB held 316 kcal/100g at 120 g.
//
// So the FIRST decision is what kind of thing was asked for, and each kind gets
// a different road. This file holds that decision plus the static knowledge it
// needs. No model, no network — pure data, so it is free and testable.
//
// `_` prefix = NOT routed. The 12-function ceiling is untouched.
// ════════════════════════════════════════════════════════════════
'use strict';

function fold(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ς/g, 'σ').trim();
}
function toks(s) { return fold(s).split(/[^a-z0-9α-ω]+/).filter(Boolean); }

// ── Greek → English, for foods the English-language web actually indexes ──
// Query rewriting, not translation: the goal is the phrase a nutrition site
// would use. Greeks routinely type without accents, so keys are folded.
var GR_EN = {
  'τυροπιτα': 'greek cheese pie tiropita filo feta',
  'σπανακοπιτα': 'greek spinach pie spanakopita filo',
  'μπουγατσα': 'bougatsa greek custard filo pastry',
  'κουλουρι': 'koulouri greek sesame bread ring',
  'λουκουμαδες': 'loukoumades greek honey doughnuts fried',
  'γαλακτομπουρεκο': 'galaktoboureko greek semolina custard syrup pastry',
  'μπακλαβας': 'baklava filo nuts syrup',
  'καταιφι': 'kataifi shredded filo nuts syrup',
  'μελομακαρονο': 'melomakarono greek honey cookie',
  'κουραμπιες': 'kourabies greek almond butter cookie',
  'τσουρεκι': 'tsoureki greek sweet brioche bread',
  'μουσακας': 'moussaka eggplant potato mince bechamel',
  'παστιτσιο': 'pastitsio greek baked pasta mince bechamel',
  'γεμιστα': 'gemista stuffed tomatoes peppers rice',
  'ντολμαδες': 'dolmades stuffed vine leaves rice',
  'σουβλακι': 'souvlaki grilled pork skewer',
  'γυρος': 'gyros pork chicken pita',
  'πιτογυρο': 'gyros wrapped in pita with tzatziki',
  'κεφτεδες': 'keftedes greek meatballs fried',
  'μπιφτεκι': 'bifteki greek beef patty',
  'σουτζουκακια': 'soutzoukakia greek meatballs tomato sauce',
  'φασολαδα': 'fasolada greek white bean soup',
  'φακες': 'lentil soup greek fakes',
  'ρεβυθια': 'chickpeas stew greek revithia',
  'μπριαμ': 'briam greek roasted vegetables olive oil',
  'χωριατικη': 'greek village salad tomato cucumber feta olive oil',
  'τζατζικι': 'tzatziki yogurt cucumber garlic dip',
  'ταραμοσαλατα': 'taramosalata fish roe dip',
  'μελιτζανοσαλατα': 'eggplant dip melitzanosalata',
  'σαγανακι': 'fried cheese saganaki',
  'παιδακια': 'grilled lamb chops',
  'κοκκινιστο': 'braised in tomato sauce greek',
  'λαδερα': 'greek vegetables cooked in olive oil',
  'χορτα': 'boiled wild greens horta olive oil',
  'φρυγανια': 'greek rusk toast dry bread',
  'παξιμαδι': 'greek barley rusk paximadi',
  'κριτσινι': 'greek breadstick',
  'γκοφρετα': 'wafer chocolate bar',
  'κρεμα': 'custard cream dessert',
  'χαλβας': 'halva sesame tahini sweet',
  'ριζογαλο': 'rice pudding greek rizogalo',
  'γιαουρτι': 'greek yogurt',
  'φετα': 'feta cheese',
  'ελιες': 'olives',
  'πιτα': 'pita bread'
};

// Look the table up by FOLDED key. Greek final sigma means the literal key
// 'λουκουμαδες' is never equal to the folded token 'λουκουμαδεσ', so an
// unfolded map silently matches nothing — the rewrite would go missing for
// exactly the words it exists to translate.
var GR_EN_FOLDED = {};
Object.keys(GR_EN).forEach(function (k) { GR_EN_FOLDED[fold(k)] = GR_EN[k]; });

// A dish is a THING SOMEONE COOKED. There is no label for it, so it must be
// costed from its ingredients rather than searched for as a product.
var DISH_WORDS = [
  'τυροπιτα','σπανακοπιτα','μπουγατσα','λουκουμαδες','μουσακας','παστιτσιο','γεμιστα','ντολμαδες',
  'σουβλακι','γυρος','πιτογυρο','κεφτεδες','μπιφτεκι','σουτζουκακια','φασολαδα','φακες','ρεβυθια',
  'μπριαμ','χωριατικη','σαγανακι','παιδακια','κοκκινιστο','λαδερα','χορτα','ριζογαλο','ομελετα',
  'σαλατα','σουπα','μακαρονια','κιμα','ψητο','τηγανητο','βραστο','γιουβετσι','στιφαδο','κοτοπουλο',
  // …and the same dishes typed in Latin letters, which is how he often writes
  // them. Without these, "chicken gyros pita" was product-searched and came
  // back from an AI content farm at 175 kcal/100g.
  'gyros','souvlaki','tiropita','tyropita','spanakopita','moussaka','mousaka','pastitsio','loukoumades',
  'baklava','kataifi','bougatsa','koulouri','dolmades','keftedes','giouvetsi','stifado','horta','tzatziki',
  'pie','stew','soup','salad','sandwich','wrap','burger','omelette','omelet','curry','stir fry','stirfry',
  'casserole','bake','roast','risotto','pasta with','homemade','home made','my mum','my mom','my mother',
  'plate of','bowl of','portion of','serving of','με ','και '
];
// …unless one of these is present: a brand or a package makes it a product again.
var PRODUCT_HINTS = [
  'protein bar','protein shake','bar','χυμος','juice','yogurt drink','cereal','biscuit','μπισκοτο',
  'σοκολατα','chocolate','crisps','chips','τσιπς','κρουασαν','croissant','γαλα','milk','ζελε'
];

// Brands worth recognising by name — his shelf, plus what a Greek supermarket
// stocks. A brand match means the product HAS a label, so aim for the label.
var BRANDS = [
  'kinder','ferrero','nutella','oreo','lotus','biscoff','milka','lacta','ion','pavlidis','papadopoulou',
  'lu','digestive','mcvities','bahlsen','haribo','mars','snickers','twix','bounty','kitkat','toblerone',
  'nesquik','nestle','kelloggs','quaker','fitness','corn flakes','coco pops','special k',
  'fage','total','kri kri','krikri','delta','olympos','mevgal','dodoni','epiros','vlachas','noynoy','nounou',
  'jotis','γιωτης','misko','μισκο','melissa','μελισσα','barilla','knorr','maggi','heinz','hellmanns',
  'coca cola','pepsi','sprite','fanta','monster','red bull','powerade','gatorade','amita','ivi','loux',
  'born winner','hungry not','myprotein','optimum nutrition','grenade','quest','warrior','trec','biotech',
  'gerolymatos','lanes','solgar','now foods','sklavenitis','ab','my market','masoutis','veropoulos',
  'creta farms','nikas','ifantis','uncle statis','tasty','ολυμπος','3αλφα','αλλατινι','elite','everest',
  'goodys','grigoris','mcdonalds','kfc','burger king','dominos','starbucks','coffee island','mikel'
];

// Household-unit weights for things people eat WHOLE. The web keeps answering
// "per 100 g" or, worse, per sub-unit: live, "kinder bueno" resolved to 21 g —
// ONE FINGER of a two-finger bar. Correct macros on the wrong mass is still a
// wrong log, so the as-eaten portion is a first-class answer, not a default.
var PORTION_PRIORS = [
  { re: /πιτογυρ|γυρο[σς]? (σε )?πιτα|gyros? (pita|wrap)|souvlaki (pita|wrap)/, g: 320, unit: 'wrap', label: 'a gyros in pita' },
  { re: /καλαμακ|σουβλακι(?! πιτα)|souvlaki skewer|pork skewer/, g: 90, unit: 'skewer', label: 'one skewer' },
  { re: /τυροπιτ|spanakopit|σπανακοπιτ|cheese pie|spinach pie/, g: 150, unit: 'pie', label: 'a bakery pie' },
  { re: /μπουγατσ|bougatsa/, g: 180, unit: 'piece', label: 'a bakery portion' },
  { re: /κουλουρ|koulouri/, g: 90, unit: 'ring', label: 'one koulouri' },
  { re: /τοστ|toast(ie)?|sandwich|σαντουιτσ/, g: 160, unit: 'sandwich', label: 'one sandwich' },
  { re: /κρουασαν|croissant/, g: 70, unit: 'croissant', label: 'one croissant' },
  { re: /φετα ψωμι|slice of bread|φρυγανι/, g: 35, unit: 'slice', label: 'one slice' },
  { re: /kinder bueno(?! mini)/, g: 43, unit: 'bar', label: 'the whole 2-finger bar' },
  { re: /protein bar|μπαρα πρωτεινη/, g: 60, unit: 'bar', label: 'one bar' },
  { re: /μερ[ιί]δα|plate of|bowl of|πιατο/, g: 350, unit: 'plate', label: 'a full plate' },
  { re: /μακαρονια|pasta|ζυμαρικ|ρυζι|rice/, g: 300, unit: 'plate', label: 'a cooked plate' },
  { re: /σαλατα|salad/, g: 250, unit: 'bowl', label: 'a salad bowl' },
  { re: /σουπα|soup/, g: 350, unit: 'bowl', label: 'a bowl' },
  { re: /γιαουρτι|yogurt|yoghurt/, g: 200, unit: 'pot', label: 'a pot' },
  { re: /καφε|coffee|φραπε|freddo|cappuccino|latte/, g: 240, unit: 'cup', label: 'a cup' }
];

// Plausible kcal per 100 g by food family. A number outside its own family is
// not a small error, it is a different food — live, a fried cheese pie came
// back at 60 kcal/100g, which no pastry on earth is. Priors catch that class.
var CATEGORY_PRIORS = [
  { re: /oil|λαδι|ελαιολαδο|butter|βουτυρο|ghee|λιπος/, lo: 700, hi: 900, name: 'fats and oils' },
  { re: /nuts?|αμυγδαλ|καρυδ|φυστικ|κασιου|ταχιν|tahini|peanut butter|almond butter/, lo: 480, hi: 720, name: 'nuts and seeds' },
  { re: /chocolate|σοκολατ|γκοφρετ|wafer|praline/, lo: 400, hi: 620, name: 'chocolate' },
  { re: /crisps|chips|τσιπς|τηγανητ|fried|deep.?fry/, lo: 250, hi: 600, name: 'fried food' },
  { re: /πιτα(?!ς? γυρο)|pie|pastry|φυλλο|filo|croissant|μπουγατσ|τυροπιτ|σπανακοπιτ|baklava|μπακλαβ/, lo: 220, hi: 480, name: 'pastry' },
  { re: /biscuit|cookie|μπισκοτ|κρακερ|cracker/, lo: 380, hi: 560, name: 'biscuits' },
  { re: /protein bar|μπαρα πρωτ/, lo: 300, hi: 450, name: 'protein bars' },
  { re: /bread|ψωμι|κουλουρ|τοστ|baguette|ζυμη/, lo: 200, hi: 340, name: 'bread' },
  { re: /ριζι|rice|pasta|μακαρονι|ζυμαρικ|oats|βρωμη|quinoa|couscous/, lo: 320, hi: 400, name: 'dry grains' },
  { re: /cooked rice|cooked pasta|βρασμεν/, lo: 100, hi: 180, name: 'cooked grains' },
  { re: /cheese|τυρι|φετα|γραβιερα|κασερι|parmesan|cheddar|gouda/, lo: 200, hi: 420, name: 'cheese' },
  { re: /yogurt|yoghurt|γιαουρτι|κεφιρ|kefir/, lo: 35, hi: 140, name: 'yogurt' },
  { re: /milk|γαλα(?!κτ)/, lo: 30, hi: 80, name: 'milk' },
  { re: /chicken breast|στηθος|turkey breast|cod|μπακαλιαρ|τονο|tuna in water|γαριδ|shrimp/, lo: 90, hi: 180, name: 'lean protein' },
  { re: /beef|μοσχαρ|pork|χοιριν|lamb|αρνι|κιμα|mince|salmon|σολομ/, lo: 130, hi: 350, name: 'meat and oily fish' },
  { re: /λαχανικ|vegetable|σαλατα(?! με)|χορτα|μαρουλ|ντοματ|αγγουρ|μπροκολ|σπανακ|κολοκυθ/, lo: 10, hi: 90, name: 'vegetables' },
  { re: /φρουτ|fruit|μηλο|apple|banana|μπανανα|πορτοκαλ|orange|berry|μουρ/, lo: 25, hi: 110, name: 'fruit' },
  { re: /juice|χυμο|soft drink|αναψυκτικ|cola|σοδα/, lo: 0, hi: 60, name: 'drinks' },
  { re: /sugar|ζαχαρη|μελι|honey|συροπ|syrup|jam|μαρμελαδ/, lo: 250, hi: 410, name: 'sugars and syrups' }
];

// ── Source trust. A domain is not a fact, but it predicts one. ──
// Live, before tiering existed: "chicken gyros pita" came back from
// arise-app.com and "born winner" from an aggregator that had invented
// 40 p / 40 c / 14 f. Those cannot be allowed to outrank a manufacturer.
var TIER = [
  // 0 — the people who print the label, and the shops that copy it verbatim
  { t: 0, re: /(^|\.)(ferrero|kinder|nestle|mars|mondelezinternational|milka|oreo|lotusbakeries|haribo|kelloggs|quaker|barilla|heinz|unilever|danone|pepsico|coca-?cola)\.[a-z.]+$/ },
  { t: 0, re: /(^|\.)(jotis|kri-?kri|fage|delta|olympos|mevgal|dodoni|misko|melissa|papadopoulou|ion|nikas|ifantis|cretafarms|3alfa|allatini|elite|everest|goodys|grigoris)\.[a-z.]+$/ },
  { t: 0, re: /(^|\.)(sklavenitis|ab|my-?market|masoutis|kritikos|bazaar|lidl-?hellas|lidl|carrefour|tesco|sainsburys|ocado|waitrose|asda|morrisons)\.[a-z.]+$/ },
  { t: 0, re: /(^|\.)(mcdonalds|kfc|burgerking|dominos|starbucks|subway|goody-?s)\.[a-z.]+$/ },
  // 1 — open, crowd-verified label databases (photos of the actual pack)
  { t: 1, re: /openfoodfacts\.(org|net)$/ },
  // 2 — national / institutional food composition data
  { t: 2, re: /(^|\.)(usda\.gov|nal\.usda\.gov|fdc\.nal\.usda\.gov|efsa\.europa\.eu|gov\.uk|canada\.ca|nutritionvalue\.org|nutritiondata\.self\.com)$/ },
  // 3 — commercial trackers: usually right, occasionally user-submitted junk
  { t: 3, re: /(^|\.)(fatsecret|myfitnesspal|nutracheck|mynetdiary|cronometer|calorieking|eatthismuch|carbmanager|lifesum|yazio)\.[a-z.]+$/ }
];
var TIER_UNKNOWN = 4;   // blogs, recipe farms, AI-generated content sites
function sourceTier(domain) {
  var d = String(domain || '').toLowerCase().replace(/^www\./, '');
  if (!d) return TIER_UNKNOWN;
  for (var i = 0; i < TIER.length; i++) if (TIER[i].re.test(d)) return TIER[i].t;
  return TIER_UNKNOWN;
}
// Tier 4 is where the fabrications came from. It may CORROBORATE a better
// source but must never be the sole basis of a "confirmed" result.
function canConfirmAlone(tier) { return tier <= 2; }

// ── classification ───────────────────────────────────────────────
function hasAny(f, list) { for (var i = 0; i < list.length; i++) if (f.indexOf(fold(list[i])) !== -1) return true; return false; }

// "2 τυρόπιτες", "3 slices", "μισή πίτα" — his own words carry the count, and
// throwing it away is a silent multiplication error.
var WORD_QTY = { 'μιση': 0.5, 'μισο': 0.5, 'μισος': 0.5, 'half': 0.5, 'ενα': 1, 'ενας': 1, 'μια': 1, 'one': 1, 'δυο': 2, 'two': 2, 'τρια': 3, 'τρεις': 3, 'three': 3, 'τεσσερα': 4, 'four': 4, 'πεντε': 5, 'five': 5 };
// ⚠️ Match the number WHOLE. An earlier version let the digit run backtrack, so
// "200g chicken" matched "20" (leaving "0g" to dodge the unit lookahead) and
// silently multiplied the meal by twenty. Take the full number first, then ask
// separately whether it is a weight — a weight is a size, never a count.
var UNIT_AFTER = /^\s*(g|gr|gram|grams|γρ|γραμ|kg|ml|cl|l|λιτρ|kcal|cal|θερμιδ)\b/;
function quantityOf(text) {
  var f = fold(text);
  var re = /(\d+(?:[.,]\d+)?)/g, m;
  while ((m = re.exec(f)) !== null) {
    var rest = f.slice(m.index + m[0].length);
    if (UNIT_AFTER.test(rest)) continue;              // "200 g" is a mass
    var v = parseFloat(m[1].replace(',', '.'));
    if (v > 0 && v <= 50) return v;                   // a plausible piece count
  }
  var t = toks(f);
  for (var i = 0; i < t.length; i++) if (WORD_QTY[t[i]]) return WORD_QTY[t[i]];
  return 1;
}

function classify(text) {
  var f = fold(text);
  var t = toks(text);
  var brand = '';
  for (var i = 0; i < BRANDS.length; i++) { if (f.indexOf(fold(BRANDS[i])) !== -1) { brand = BRANDS[i]; break; } }

  var dishy = hasAny(f, DISH_WORDS);
  var producty = !!brand || hasAny(f, PRODUCT_HINTS) || /\d+\s*(g|gr|γρ|ml)\b/.test(f);

  // A brand beats a dish word: "kinder bueno" contains no dish word, but
  // "μακαρόνια Misko" is a packaged product even though μακαρόνια is a dish.
  var kind = brand ? 'branded' : (dishy && !producty ? 'dish' : (producty ? 'branded' : 'staple'));

  // English rewrite for the web leg — Greek queries return Greek SEO farms.
  // Match on WHOLE WORDS: 'πιτα' is a substring of 'τυροπιτα', and a plain
  // indexOf appended "pita bread" to a cheese-pie query, steering the search
  // toward the wrong food entirely.
  var en = text, seen = {};
  t.forEach(function (word) {
    if (GR_EN_FOLDED[word] && !seen[word]) { seen[word] = 1; en += ' ' + GR_EN_FOLDED[word]; }
  });
  // multi-word keys still need a substring pass, but only they
  Object.keys(GR_EN_FOLDED).forEach(function (k) {
    if (k.indexOf(' ') === -1 || seen[k]) return;
    if (f.indexOf(k) !== -1) { seen[k] = 1; en += ' ' + GR_EN_FOLDED[k]; }
  });

  return { kind: kind, brand: brand, en: en.slice(0, 240), qty: quantityOf(text), tokens: t };
}

function portionPrior(text) {
  var f = fold(text);
  for (var i = 0; i < PORTION_PRIORS.length; i++) if (PORTION_PRIORS[i].re.test(f)) return PORTION_PRIORS[i];
  return null;
}
function categoryPrior(text) {
  var f = fold(text);
  for (var i = 0; i < CATEGORY_PRIORS.length; i++) if (CATEGORY_PRIORS[i].re.test(f)) return CATEGORY_PRIORS[i];
  return null;
}

module.exports = {
  fold: fold, toks: toks, classify: classify, quantityOf: quantityOf,
  portionPrior: portionPrior, categoryPrior: categoryPrior,
  sourceTier: sourceTier, canConfirmAlone: canConfirmAlone,
  GR_EN: GR_EN, BRANDS: BRANDS, PORTION_PRIORS: PORTION_PRIORS, CATEGORY_PRIORS: CATEGORY_PRIORS
};
