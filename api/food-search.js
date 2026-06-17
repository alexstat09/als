// ════════════════════════════════════════════════════════════════
// Food database proxy. GET ?q=<text> → search, GET ?barcode=<code> → lookup.
// Tier order: USDA FoodData Central (free key, whole-food micros) → Open Food
// Facts (no key, branded + barcodes, Greek/EU). Both normalized to one shape
// (values per 100g). Keys stay server-side. Works on Open Food Facts alone if
// USDA_API_KEY isn't set.
// ════════════════════════════════════════════════════════════════
'use strict';

function n(v) { var x = typeof v === 'number' ? v : parseFloat(v); return isFinite(x) && x >= 0 ? Math.round(x * 10) / 10 : 0; }
function clip(s, len) { return (s == null ? '' : String(s)).trim().slice(0, len || 90); }

// ── Open Food Facts ──────────────────────────────────────────────
function offRow(p) {
  if (!p) return null;
  var nu = p.nutriments || {};
  var name = clip(p.product_name || p.product_name_en || p.generic_name);
  if (!name) return null;
  var kcal = nu['energy-kcal_100g'];
  if (kcal == null && nu['energy_100g'] != null) kcal = nu['energy_100g'] / 4.184; // kJ→kcal fallback
  return {
    name: name, brand: clip(p.brands, 40), per: '100g',
    servingG: n(p.serving_quantity) || 0,
    kcal: Math.round(n(kcal)), p: n(nu.proteins_100g), c: n(nu.carbohydrates_100g), f: n(nu.fat_100g),
    fiber: n(nu.fiber_100g), sugar: n(nu.sugars_100g),
    sodium: Math.round(n(nu.sodium_100g) * 1000), satfat: n(nu['saturated-fat_100g']),
    barcode: clip(p.code, 20), source: 'off'
  };
}
async function offSearch(q) {
  var url = 'https://world.openfoodfacts.org/cgi/search.pl?search_terms=' + encodeURIComponent(q) +
    '&search_simple=1&action=process&json=1&page_size=20' +
    '&fields=code,product_name,product_name_en,generic_name,brands,serving_quantity,nutriments';
  var r = await fetch(url, { headers: { 'User-Agent': 'ALS-Dashboard/1.0 (personal)' } });
  if (!r.ok) return [];
  var j = await r.json();
  return (j.products || []).map(offRow).filter(function (x) { return x && (x.kcal || x.p || x.c || x.f); });
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
  return {
    name: name, brand: clip(food.brandOwner || food.brandName, 40), per: '100g',
    servingG: n(food.servingSize) || 0,
    kcal: Math.round(usdaNutr(food, ['208', '1008'])),
    p: usdaNutr(food, ['203', '1003']), c: usdaNutr(food, ['205', '1005']), f: usdaNutr(food, ['204', '1004']),
    fiber: usdaNutr(food, ['291', '1079']), sugar: usdaNutr(food, ['269', '2000']),
    sodium: Math.round(usdaNutr(food, ['307', '1093'])), satfat: usdaNutr(food, ['606', '1258']),
    barcode: clip(food.gtinUpc, 20), source: 'usda'
  };
}
async function usdaSearch(q, key) {
  var url = 'https://api.nal.usda.gov/fdc/v1/foods/search?api_key=' + encodeURIComponent(key) +
    '&query=' + encodeURIComponent(q) + '&pageSize=8&dataType=' + encodeURIComponent('Foundation,SR Legacy,Branded');
  var r = await fetch(url);
  if (!r.ok) return [];
  var j = await r.json();
  return (j.foods || []).map(usdaRow).filter(function (x) { return x && (x.kcal || x.p || x.c || x.f); });
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
  var tasks = [offSearch(q).catch(function () { return []; })];
  if (key) tasks.unshift(usdaSearch(q, key).catch(function () { return []; }));

  try {
    var lists = await Promise.all(tasks);
    var out = [];
    lists.forEach(function (l) { (l || []).forEach(function (x) { out.push(x); }); });
    // de-dup by name+brand, cap
    var seen = {}, dedup = [];
    for (var i = 0; i < out.length && dedup.length < 24; i++) {
      var k = (out[i].name + '|' + out[i].brand).toLowerCase();
      if (seen[k]) continue; seen[k] = 1; dedup.push(out[i]);
    }
    res.status(200).json({ results: dedup });
  } catch (e) {
    res.status(200).json({ results: [], error: String((e && e.message) || e) });
  }
};
