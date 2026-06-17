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
  // legacy CGI search, sorted by scan popularity so well-filled real products win
  var url = 'https://world.openfoodfacts.org/cgi/search.pl?search_terms=' + encodeURIComponent(q) +
    '&search_simple=1&action=process&json=1&page_size=50&sort_by=unique_scans_n' +
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
    '&query=' + encodeURIComponent(q) + '&pageSize=25' +
    '&dataType=' + encodeURIComponent('Foundation,SR Legacy,Survey (FNDDS),Branded');
  var r = await fetch(url);
  if (!r.ok) return [];
  var j = await r.json();
  return (j.foods || []).map(usdaRow).filter(function (x) { return x && (x.kcal || x.p || x.c || x.f); });
}

// ── ranking ──────────────────────────────────────────────────────
function toks(s) { return String(s || '').toLowerCase().split(/[^a-z0-9À-ɏͰ-Ͽἀ-῿]+/).filter(Boolean); }
function score(row, qToks, qPhrase) {
  var hay = (row.name + ' ' + (row.brand || '')).toLowerCase();
  var nTok = toks(row.name);
  var s = 0, hit = 0;
  qToks.forEach(function (t) { if (hay.indexOf(t) !== -1) { s += 10; hit++; } });
  if (hit === qToks.length) s += 12;                       // all query words present
  if (hay.indexOf(qPhrase) !== -1) s += 16;                // exact phrase
  if (nTok[0] && qToks.indexOf(nTok[0]) !== -1) s += 6;    // name starts with a query word
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
    dedup.sort(function (a, b) { return score(b, qToks, qPhrase) - score(a, qToks, qPhrase); });

    res.status(200).json({ results: dedup.slice(0, 40), sources: key ? ['off', 'usda'] : ['off'] });
  } catch (e) {
    res.status(200).json({ results: [], error: String((e && e.message) || e) });
  }
};
