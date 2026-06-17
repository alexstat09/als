// ════════════════════════════════════════════════════════════════
// Food database proxy. GET ?q=<text> → search, GET ?barcode=<code> → lookup.
// Aggregates the world's biggest FREE food databases in parallel so the search
// effectively reaches "everything":
//   • Open Food Facts — ~3M+ branded/packaged products worldwide (no key, incl.
//     Greek/EU products MyFitnessPal misses) + barcodes.
//   • USDA FoodData Central — ~600k whole/generic/prepared/branded foods with
//     full micros (free key USDA_API_KEY; Foundation + SR Legacy + FNDDS survey
//     + Branded). Degrades gracefully to OFF-only if the key isn't set.
// Results are normalized to one shape (values per 100g), merged, de-duplicated,
// and ranked by relevance + data completeness. Keys stay server-side.
// ════════════════════════════════════════════════════════════════
'use strict';

function n(v) { var x = typeof v === 'number' ? v : parseFloat(v); return isFinite(x) && x >= 0 ? Math.round(x * 10) / 10 : 0; }
function clip(s, len) { return (s == null ? '' : String(s)).trim().slice(0, len || 90); }
function withTimeout(p, ms) { return Promise.race([p, new Promise(function (res) { setTimeout(function () { res(null); }, ms || 8500); })]); }

// ── Open Food Facts ──────────────────────────────────────────────
function deriveKcal(kcal, p, c, f) { return (!kcal && (p || c || f)) ? Math.round(4 * p + 4 * c + 9 * f) : kcal; }
function offRow(prod) {
  if (!prod) return null;
  var nu = prod.nutriments || {};
  var name = clip(prod.product_name || prod.product_name_en || prod.generic_name);
  if (!name) return null;
  var kcal = nu['energy-kcal_100g'];
  if (kcal == null && nu['energy_100g'] != null) kcal = nu['energy_100g'] / 4.184; // kJ→kcal fallback
  var p = n(nu.proteins_100g), c = n(nu.carbohydrates_100g), f = n(nu.fat_100g);
  kcal = deriveKcal(Math.round(n(kcal)), p, c, f);
  return {
    name: name, brand: clip(prod.brands, 40), per: '100g',
    servingG: n(prod.serving_quantity) || 0,
    kcal: kcal, p: p, c: c, f: f,
    fiber: n(nu.fiber_100g), sugar: n(nu.sugars_100g),
    sodium: Math.round(n(nu.sodium_100g) * 1000), satfat: n(nu['saturated-fat_100g']),
    barcode: clip(prod.code, 20), source: 'off'
  };
}
var OFF_FIELDS = 'code,product_name,product_name_en,generic_name,brands,serving_quantity,nutriments';
function offClean(rows) { return rows.map(offRow).filter(function (x) { return x && (x.kcal || x.p || x.c || x.f); }); }
// Modern search-a-licious (Elasticsearch) — fast + reliable, the primary path.
async function offSAL(q) {
  var url = 'https://search.openfoodfacts.org/search?q=' + encodeURIComponent(q) + '&page_size=50&fields=' + OFF_FIELDS;
  var r = await fetch(url, { headers: { 'User-Agent': 'ALS-Dashboard/1.0 (personal)' } });
  if (!r.ok) return [];
  var j = await r.json();
  return offClean(j.hits || []);
}
// Legacy CGI free-text search — fallback only (rate-limited/flaky under load).
async function offCGI(q) {
  var url = 'https://world.openfoodfacts.org/cgi/search.pl?search_terms=' + encodeURIComponent(q) +
    '&search_simple=1&action=process&json=1&page_size=50&fields=' + OFF_FIELDS;
  var r = await fetch(url, { headers: { 'User-Agent': 'ALS-Dashboard/1.0 (personal)' } });
  if (!r.ok) return [];
  var j = await r.json();
  return offClean(j.products || []);
}
async function offSearch(q) {
  var a = await offSAL(q).catch(function () { return []; });
  if (a && a.length) return a;
  return await offCGI(q).catch(function () { return []; });
}
async function offBarcode(code) {
  var r = await fetch('https://world.openfoodfacts.org/api/v0/product/' + encodeURIComponent(code) + '.json',
    { headers: { 'User-Agent': 'ALS-Dashboard/1.0 (personal)' } });
  if (!r.ok) return null;
  var j = await r.json();
  if (j.status !== 1 || !j.product) return null;
  return offRow(j.product);
}

// ── USDA FoodData Central ────────────────────────────────────────
function usdaNutr(food, numbers) {
  var arr = food.foodNutrients || [];
  for (var i = 0; i < arr.length; i++) {
    var a = arr[i];
    var id = String(a.nutrientNumber || (a.nutrient && a.nutrient.number) || '');
    if (numbers.indexOf(id) !== -1) return n(a.value != null ? a.value : (a.amount));
  }
  return 0;
}
function usdaRow(food) {
  var name = clip(food.description);
  if (!name) return null;
  var p = usdaNutr(food, ['203', '1003']), c = usdaNutr(food, ['205', '1005']), f = usdaNutr(food, ['204', '1004']);
  var kcal = deriveKcal(Math.round(usdaNutr(food, ['208', '1008'])), p, c, f); // some USDA rows omit energy
  return {
    name: name, brand: clip(food.brandOwner || food.brandName, 40), per: '100g',
    servingG: n(food.servingSize) || 0,
    kcal: kcal, p: p, c: c, f: f,
    fiber: usdaNutr(food, ['291', '1079']), sugar: usdaNutr(food, ['269', '2000']),
    sodium: Math.round(usdaNutr(food, ['307', '1093'])), satfat: usdaNutr(food, ['606', '1258']),
    barcode: clip(food.gtinUpc, 20), source: 'usda', dataType: food.dataType || '', generic: true
  };
}
// Only the GENERIC whole/prepared-food datasets (raw/cooked staples) — NOT
// Branded; OFF already covers packaged products, and branded clutter is exactly
// what we want to push down.
async function usdaSearch(q, key) {
  var url = 'https://api.nal.usda.gov/fdc/v1/foods/search?api_key=' + encodeURIComponent(key) +
    '&query=' + encodeURIComponent(q) + '&pageSize=50' +
    '&dataType=' + encodeURIComponent('Foundation,SR Legacy,Survey (FNDDS)');
  var r = await fetch(url);
  if (!r.ok) return [];
  var j = await r.json();
  return (j.foods || []).map(usdaRow).filter(function (x) { return x && (x.kcal || x.p || x.c || x.f); });
}

// ── ranking ──────────────────────────────────────────────────────
function toks(s) { return String(s || '').toLowerCase().split(/[^a-z0-9À-ɏͰ-Ͽἀ-῿]+/).filter(Boolean); }
// coarse tier so the cleanest generics always sit above branded clutter:
//  0 = USDA pure staple (Foundation/SR Legacy raw/cooked)  1 = USDA prepared
//  (FNDDS)  2 = un-branded OFF  3 = branded
function tier(row) {
  if (row.generic) { var dt = row.dataType || ''; return (dt === 'Foundation' || dt === 'SR Legacy') ? 0 : 1; }
  return row.brand ? 3 : 2;
}
// processed/composite prefixes that should never beat the plain staple
var STOP_PREFIX = { snacks: 1, lunchmeat: 1, candies: 1, babyfood: 1, beverages: 1, restaurant: 1, sauce: 1, soup: 1 };
// processing words — present anywhere, lightly demote so plain raw/cooked cuts win
var PROCESSED = { breaded: 1, tenders: 1, nuggets: 1, roll: 1, deli: 1, canned: 1, paste: 1, powder: 1, dehydrated: 1, dried: 1, fried: 1, flavored: 1, mix: 1, smoked: 1, cured: 1 };
// query tokens appear as a contiguous run in the name tokens (punctuation-tolerant)
function tokenPhrase(nTok, qToks) {
  if (qToks.length < 2) return false;
  for (var i = 0; i + qToks.length <= nTok.length; i++) {
    var ok = true;
    for (var j = 0; j < qToks.length; j++) { if (nTok[i + j] !== qToks[j]) { ok = false; break; } }
    if (ok) return true;
  }
  return false;
}
function score(row, qToks, qPhrase) {
  var hay = (row.name + ' ' + (row.brand || '')).toLowerCase();
  var nTok = toks(row.name);
  var s = 0, hit = 0, proc = 0;
  qToks.forEach(function (t) { if (hay.indexOf(t) !== -1) { s += 10; hit++; } });
  if (hit === qToks.length) s += 12;                       // all query words present
  if (hay.indexOf(qPhrase) !== -1 || tokenPhrase(nTok, qToks)) s += 16; // phrase (punctuation-tolerant)
  if (nTok[0] && qToks.indexOf(nTok[0]) !== -1) s += 30;   // name STARTS with the food → pure staple
  if (nTok[0] && STOP_PREFIX[nTok[0]]) s -= 25;            // "Snacks,"/"Lunchmeat," → demote
  nTok.forEach(function (t) { if (PROCESSED[t]) proc++; });
  s -= Math.min(14, proc * 6);                             // plain cuts beat processed forms
  s += ((row.kcal > 0) + (row.p > 0) + (row.c > 0) + (row.f > 0)) * 3; // data completeness
  if (row.source === 'usda' && !row.brand) s += 4;         // clean generic whole foods
  s -= Math.min(6, Math.floor(hay.length / 22));           // prefer concise names over noise
  return s;
}

module.exports = async function (req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  var u;
  try { u = new URL(req.url, 'http://x'); } catch (e) { res.status(400).json({ error: 'bad url' }); return; }
  var barcode = (u.searchParams.get('barcode') || '').replace(/[^0-9]/g, '').slice(0, 20);
  var q = (u.searchParams.get('q') || '').toString().slice(0, 100).trim();

  // Barcode → Open Food Facts product
  if (barcode) {
    try { var item = await offBarcode(barcode); res.status(200).json({ results: item ? [item] : [] }); }
    catch (e) { res.status(200).json({ results: [], error: 'lookup-failed' }); }
    return;
  }
  if (!q) { res.status(400).json({ error: 'no query' }); return; }

  var key = (process.env.USDA_API_KEY || '').trim();
  var tasks = [withTimeout(offSearch(q).catch(function () { return []; }))];
  if (key) tasks.push(withTimeout(usdaSearch(q, key).catch(function () { return []; })));

  try {
    var lists = await Promise.all(tasks);
    var out = [];
    lists.forEach(function (l) { (l || []).forEach(function (x) { if (x) out.push(x); }); });

    // de-dup by normalized name+brand (keep the most complete copy)
    var byKey = {};
    out.forEach(function (x) {
      var k = (x.name + '|' + x.brand).toLowerCase().replace(/\s+/g, ' ').trim();
      var prev = byKey[k];
      if (!prev) { byKey[k] = x; return; }
      var cx = (x.kcal > 0) + (x.p > 0) + (x.c > 0) + (x.f > 0) + (x.fiber > 0) + (x.sodium > 0);
      var cp = (prev.kcal > 0) + (prev.p > 0) + (prev.c > 0) + (prev.f > 0) + (prev.fiber > 0) + (prev.sodium > 0);
      if (cx > cp) byKey[k] = x;
    });
    var dedup = Object.keys(byKey).map(function (k) { return byKey[k]; });

    var qToks = toks(q), qPhrase = q.toLowerCase();
    dedup.sort(function (a, b) {
      var ta = tier(a), tb = tier(b);
      if (ta !== tb) return ta - tb;                       // generics before branded
      return score(b, qToks, qPhrase) - score(a, qToks, qPhrase);
    });

    res.status(200).json({ results: dedup.slice(0, 40), sources: key ? ['off', 'usda'] : ['off'] });
  } catch (e) {
    res.status(200).json({ results: [], error: String((e && e.message) || e) });
  }
};
