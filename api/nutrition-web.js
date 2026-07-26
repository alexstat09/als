// ════════════════════════════════════════════════════════════════
// "Find me this food, exactly."  POST { text } → one answer with receipts.
//
// The previous version had one strategy for every food: search the web, let a
// model read the snippets, trust what it said. Measured live, that produced:
//   • "τυρόπιτα από φούρνο" → 60 kcal / 28 g   (a fried cheese pie is ~300)
//   • "born winner protein bar" → 400/40/40/14, confidence 1.0, from thin air
//   • "chicken gyros pita" → sourced from arise-app.com, an AI content farm
//   • "ΓΙΩΤΗΣ κρέμα στιγμής" → FUNCTION_INVOCATION_TIMEOUT (advanced depth +
//     raw content + 5 results does not fit in 15s), which the page rendered
//     as an ordinary estimate — a hard failure wearing a success costume.
//
// What replaced it:
//   1. CLASSIFY first (_food-know). A packaged product has a label to find; a
//      homemade dish does not, and hunting one is what produced the worst
//      numbers above. Dishes are COSTED FROM INGREDIENTS against the verified
//      core DB instead — traceable, and better than any recipe blog.
//   2. RETRIEVE with a budget. Basic depth, two phrasings (his words + an
//      English rewrite), every leg on an AbortController. The endpoint answers
//      or says why; it never dies mid-flight.
//   3. EXTRACT WITH CITATIONS. The model must say which snippet each number
//      came from, and we then check the digits are really in that snippet.
//   4. VERIFY (_nut-check). Grounding + label arithmetic + category priors.
//      `found` is COMPUTED HERE. The model no longer grades its own homework.
//
// Needs GROQ_API_KEY (parse) + TAVILY_API_KEY (search).
// ════════════════════════════════════════════════════════════════
'use strict';
var auth = require('./_auth');
var model = require('./_model');
var KNOW = require('./_food-know.js');
var CHECK = require('./_nut-check.js');
var CORE = require('./_core-foods.js');
var TAVILY_URL = 'https://api.tavily.com/search';

function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  try { return JSON.parse(req.body || '{}'); } catch (e) { return {}; }
}
var num = CHECK.num;
function r0(n) { return Math.round(n); }
function domainOf(u) { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return ''; } }

// Every outbound call is bounded. A slow upstream must cost us a leg, never
// the whole request — that is what turned a Greek product into a 504.
function withTimeout(promise, ms) {
  return Promise.race([promise, new Promise(function (res) { setTimeout(function () { res(null); }, ms); })]);
}
async function tavily(q, key, ms) {
  var ctl = new AbortController();
  var t = setTimeout(function () { try { ctl.abort(); } catch (e) {} }, ms);
  try {
    var r = await fetch(TAVILY_URL, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        api_key: key, query: q,
        search_depth: 'basic',        // 'advanced' + raw content is what timed out
        max_results: 6, include_answer: false, include_raw_content: false
      }),
      signal: ctl.signal
    });
    if (!r.ok) return null;
    return await r.json();
  } catch (e) { return null; }
  finally { clearTimeout(t); }
}

// Keep the nutrition-dense part of a snippet; drop marketing copy.
function nutWindow(content) {
  if (!content) return '';
  content = String(content).replace(/\s+/g, ' ');
  if (content.length <= 700) return content;
  var lc = content.toLowerCase();
  var kw = ['per 100', 'per100', 'ανα 100', '100 g', '100g', 'typical values', 'nutrition', 'θρεπτικ', 'energy', 'ενεργεια', 'kcal', 'protein', 'πρωτε', 'carbohydrate', 'υδατανθρακ', 'of which', 'sugars', 'σακχαρ', 'saturate', 'κορεσμεν', 'fibre', 'fiber', 'sodium', 'salt', 'αλατι', 'λιπαρ', 'serving'];
  var best = -1, bestScore = 0;
  for (var i = 0; i < content.length; i += 120) {
    var seg = lc.slice(i, i + 640), sc = 0;
    for (var j = 0; j < kw.length; j++) if (seg.indexOf(kw[j]) !== -1) sc++;
    if (sc > bestScore) { bestScore = sc; best = i; }
  }
  if (best < 0 || bestScore < 2) return content.slice(0, 520);
  return content.slice(Math.max(0, best - 100), best + 660);
}

/* Collect search hits from every query into ONE numbered evidence list, best
   sources first. Numbering matters: the model cites by index, and we verify
   against exactly the snippet it named. */
function buildEvidence(results) {
  var seen = {}, rows = [];
  results.forEach(function (tj) {
    ((tj && tj.results) || []).forEach(function (res) {
      var dom = domainOf(res.url);
      if (!dom || seen[dom + (res.title || '')]) return;
      seen[dom + (res.title || '')] = 1;
      var body = nutWindow(res.content || '');
      if (!body) return;
      rows.push({ domain: dom, tier: KNOW.sourceTier(dom), title: String(res.title || '').slice(0, 120), text: body });
    });
  });
  rows.sort(function (a, b) { return a.tier - b.tier; });
  rows = rows.slice(0, 7);
  var text = rows.map(function (r, i) {
    return '[' + (i + 1) + '] (' + r.domain + ') ' + r.title + ' — ' + r.text;
  }).join('\n');
  return { rows: rows, text: text.slice(0, 8000) };
}

var EXTRACT_SYS = [
  'You extract nutrition facts for a food product from numbered web search results.',
  'Use ONLY numbers that literally appear in the results. Never recall a value from memory, never estimate, never round to a tidy number. If a value is not present, use 0.',
  'Read values PER 100 g (or per 100 ml). If a result only gives per-serving values, convert using the serving size stated in that same result.',
  'Energy printed as kJ converts with kcal = kJ / 4.184. Salt in grams converts with sodium_mg = salt_g * 400.',
  'Reply with ONLY a single minified JSON object, no prose, exactly these keys:',
  '{"name": full product name incl. brand, "cite": the NUMBER of the result you took the values from, "serving_g": one serving in grams as printed else 0, "serving_name": unit word for one serving e.g. "bar"/"slice"/"biscuit"/"pot" else "", "package_g": net weight of the whole package if stated else 0, "servings_per_container": if stated else 0, "per100":{"kcal":,"p":,"c":,"f":,"fiber":,"sugar":,"sodium":mg,"satfat":}, "has_data": true only if the results genuinely contain this product\'s nutrition numbers}',
  'All numbers, no units. `cite` must be the index of the ONE result the per100 values came from — this is checked, so citing a result that does not contain the numbers is worse than setting has_data to false.',
  'If the results do not contain real nutrition data for this product, set has_data=false and all per100 values to 0. That is a correct and useful answer.'
].join(' ');

// ── DISH ROUTE ───────────────────────────────────────────────────
// No label exists, so build the number from parts we already trust. Every
// ingredient is priced against the verified core DB where possible, which is
// why this beats a recipe page: each line is auditable.
// Words that mark a PART or DERIVATIVE of a food rather than the food. Asking
// for "egg" and being costed as "egg white" is a 3× error (52 vs 143 kcal), and
// it scores identically to "egg, whole" without this — both are one extra word.
var DERIVATIVE = { white: 1, whites: 1, yolk: 1, yolks: 1, powder: 1, powdered: 1, concentrate: 1, extract: 1, essence: 1, skin: 1, skinless: 0, shell: 1, substitute: 1, imitation: 1, flavored: 1, flavoured: 1, dried: 1, dehydrated: 1, juice: 1, liquid: 1 };
// Words that describe the SAME food rather than a different one, so leaving
// them unmatched shouldn't be held against a candidate ("egg" vs "Egg, whole").
var GENERIC_QUAL = { whole: 1, raw: 1, cooked: 1, plain: 1, fresh: 1, medium: 1, large: 1, small: 1, all: 1, purpose: 1, natural: 1, regular: 1, ordinary: 1, boiled: 1, unsalted: 1, salted: 1 };
// ⚠️ A prefix match must not change the food. Unbounded, "water" matched
// "Watermelon" (watermelon.indexOf('water')===0) and a loukoumades breakdown
// was costed with 40 g of watermelon in it. Plurals and inflections differ by
// a letter or two; a different food differs by more.
function tokEq(a, b) {
  if (a === b) return true;
  if (a.length < 4 || b.length < 4) return false;
  if (Math.abs(a.length - b.length) > 2) return false;
  return a.indexOf(b) === 0 || b.indexOf(a) === 0;
}
function coreLookup(name) {
  // "olive oil (for frying)" is olive oil — the aside is not part of the food
  var qt = KNOW.toks(String(name).replace(/\([^)]*\)/g, ' '));
  if (!qt.length) return null;
  var best = null, bestScore = -1;
  CORE.forEach(function (cf) {
    // aliases help us FIND a food but are not part of its name, so they must
    // not count against coverage (the Greek alias on "Phyllo pastry (φύλλο
    // κρούστας)" would otherwise read as three unexplained words)
    var nameT = KNOW.toks(String(cf.name).replace(/\([^)]*\)/g, ' '));
    var allT = nameT.concat(KNOW.toks(cf.alias || ''));
    if (!nameT.length) return;

    var hits = 0, matchedName = {};
    qt.forEach(function (t) {
      if (allT.some(function (x) { return tokEq(x, t); })) hits++;
      nameT.forEach(function (x) { if (tokEq(x, t)) matchedName[x] = 1; });
    });
    if (!hits) return;

    // BOTH directions must hold. How much of the query is explained, AND how
    // much of the food's name is explained. One word of "Magnum ice cream bar"
    // is not an ingredient match — precision matters more than recall here,
    // because a miss falls back to a sane estimate while a WRONG match silently
    // poisons the meal (a loukoumades breakdown costed with watermelon in it).
    // "whole", "raw", "plain" describe the same food; "cheese" makes it a
    // different one. Only the latter should count as an unexplained word.
    var contentT = nameT.filter(function (x) { return !GENERIC_QUAL[x]; });
    if (!contentT.length) contentT = nameT;
    var matchedContent = contentT.filter(function (x) { return matchedName[x]; }).length;

    var qCov = hits / qt.length;
    var nCov = matchedContent / contentT.length;
    var score = 10 * qCov * nCov + (qCov === 1 ? 3 : 0);
    // a qualifier the query never asked for narrows the food to something else
    allT.forEach(function (x) { if (DERIVATIVE[x] && qt.indexOf(x) === -1) score -= 3; });
    if (score > bestScore) { bestScore = score; best = cf; }
  });
  return bestScore >= 7 ? best : null;
}

var DISH_SYS = [
  'You break a cooked or homemade dish into its ingredients for a nutrition tracker. There is no packaged label for this food, so it must be costed from parts.',
  'List the ingredients of ONE typical portion as actually served, with realistic RAW-or-as-used weights in grams. Include cooking fat and oil — they are usually the largest hidden source of calories.',
  'Be conservative and realistic about the total portion weight. A single bakery cheese pie is ~150 g total, not 400 g. A plate of pasta is ~300-350 g cooked.',
  'Use plain, searchable ingredient names in English (e.g. "feta cheese", "filo pastry", "olive oil", "minced beef", "cooked white rice").',
  'Reply with ONLY a single minified JSON object, no prose:',
  '{"name": short English name of the dish, "portion_g": total grams of one served portion, "ingredients":[{"name": ingredient, "grams": int, "kcal_100": kcal per 100g of that ingredient, "p_100":, "c_100":, "f_100":}]}',
  'Give per-100g values for every ingredient — they are cross-checked against a verified food database and replaced where it has better data. Never refuse; give your best structured breakdown.'
].join(' ');

async function dishRoute(text, cls, res) {
  var r = await model.json('text', {
    messages: [{ role: 'system', content: DISH_SYS }, { role: 'user', content: text }],
    max_tokens: 700, temperature: 0.2, reasoning: 'low', response_format: { type: 'json_object' }
  });
  if (!r.ok) { res.status(200).json(model.fail(r, { exhausted: 'Couldn’t break that dish down — try Search or a barcode.' })); return; }
  var o = r.obj;
  if (!o || !Array.isArray(o.ingredients) || !o.ingredients.length) {
    res.status(200).json({ error: 'no-results', message: 'Couldn’t break that dish into ingredients — try describing it more simply.' });
    return;
  }

  var items = [], tot = { kcal: 0, p: 0, c: 0, f: 0, fiber: 0, sugar: 0, sodium: 0, satfat: 0 }, gTot = 0, verified = 0;
  o.ingredients.slice(0, 14).forEach(function (ing) {
    if (!ing) return;
    var nm = String(ing.name || '').trim().slice(0, 48);
    var g = Math.round(num(ing.grams, 3000));
    if (!nm || !(g > 0)) return;
    var cf = coreLookup(nm);
    var per = cf
      ? { kcal: cf.kcal, p: cf.p, c: cf.c, f: cf.f, fiber: cf.fiber || 0, sugar: cf.sugar || 0, sodium: cf.sodium || 0, satfat: cf.satfat || 0 }
      : { kcal: num(ing.kcal_100, 900), p: num(ing.p_100, 100), c: num(ing.c_100, 100), f: num(ing.f_100, 100), fiber: 0, sugar: 0, sodium: 0, satfat: 0 };
    if (cf) verified++;
    var k = g / 100;
    ['kcal', 'p', 'c', 'f', 'fiber', 'sugar', 'sodium', 'satfat'].forEach(function (key) { tot[key] += (per[key] || 0) * k; });
    gTot += g;
    items.push({ name: cf ? cf.name : nm, grams: g, verified: !!cf, kcal: r0((per.kcal || 0) * k) });
  });

  if (!items.length || !(gTot > 0)) { res.status(200).json({ error: 'no-results', message: 'Couldn’t cost that dish — try Search instead.' }); return; }

  // Prefer a known real-world portion over the model's own total weight.
  var prior = KNOW.portionPrior(text);
  var portion = Math.round(num(o.portion_g, 4000)) || gTot;
  if (prior && Math.abs(portion - prior.g) > prior.g * 0.5) portion = prior.g;
  var qty = cls.qty || 1;

  var per100 = {};
  ['kcal', 'p', 'c', 'f', 'fiber', 'sugar', 'sodium', 'satfat'].forEach(function (key) { per100[key] = Math.round(tot[key] / gTot * 1000) / 10; });
  per100.kcal = r0(per100.kcal); per100.sodium = r0(per100.sodium);

  // The ingredient sum is its own evidence — every number came from a weight
  // times a per-100g value we can show, so grounding is not the question here.
  // What IS worth checking is whether the result is plausible for the category.
  var pv = CHECK.prior(cls.en || text, per100);
  var iv = CHECK.internal(per100);
  var why = pv.flags.concat(iv.flags);
  var conf = Math.max(0.3, Math.min(0.85, 0.5 + 0.3 * (verified / items.length) - 0.2 * why.length));

  var grams = Math.round(portion * qty);
  var k = grams / 100;
  res.status(200).json({
    name: (o.name || text).toString().slice(0, 90),
    kind: 'dish',
    source: 'ingredients', source_label: 'dish',
    found: false,                                   // never claim a label we did not read
    confirmed: false,
    method: 'Built from ' + items.length + ' ingredients' + (verified ? ', ' + verified + ' from your verified food database' : ''),
    why: why,
    confidence: Math.round(conf * 100) / 100,
    grams: grams, serving_name: (prior && prior.unit) || 'portion',
    portion_note: prior ? ('typical for ' + prior.label) : '',
    qty: qty,
    items: items,
    per100: per100,
    kcal: r0(per100.kcal * k), p: num(per100.p * k, 2000), c: num(per100.c * k, 2000), f: num(per100.f * k, 1000),
    fiber: num(per100.fiber * k, 500), sugar: num(per100.sugar * k, 1000),
    sodium: r0(per100.sodium * k), satfat: num(per100.satfat * k, 500)
  });
}

// ── PRODUCT ROUTE ────────────────────────────────────────────────
async function productRoute(text, cls, tavKey, res) {
  var q1 = text + ' nutrition per 100g energy protein carbohydrate fat';
  var q2 = (cls.en !== text ? cls.en : text) + ' nutrition facts label per 100g';
  var searches = await Promise.all([
    withTimeout(tavily(q1, tavKey, 9000), 10000),
    withTimeout(tavily(q2, tavKey, 9000), 10000)
  ]);
  var ev = buildEvidence(searches.filter(Boolean));

  if (!ev.rows.length) {
    res.status(200).json({ error: 'no-results', message: 'Web search came back empty — scan the barcode or photograph the label for an exact answer.' });
    return;
  }

  var r = await model.json('web', {
    messages: [
      { role: 'system', content: EXTRACT_SYS },
      { role: 'user', content: 'PRODUCT: ' + text + '\n\nRESULTS:\n' + ev.text }
    ],
    max_tokens: 450, temperature: 0, reasoning: 'low', response_format: { type: 'json_object' }
  });
  if (!r.ok) {
    res.status(200).json(model.fail(r, {
      rate: 'Busy for a moment — try again.',
      upstream: 'Couldn’t read the web results — photograph the label instead.',
      exhausted: 'Couldn’t read the web results — photograph the label instead.'
    }));
    return;
  }
  var o = r.obj;
  if (!o) { res.status(200).json({ error: 'parse', message: 'Couldn’t read a clear result — scan the barcode or photograph the label.' }); return; }

  var p = o.per100 || {};
  var per100 = {
    kcal: num(p.kcal, 1000), p: num(p.p, 100), c: num(p.c, 100), f: num(p.f, 100),
    fiber: num(p.fiber, 100), sugar: num(p.sugar, 100), sodium: r0(num(p.sodium, 50000)), satfat: num(p.satfat, 100)
  };

  if (o.has_data === false || (!per100.kcal && !per100.p && !per100.c && !per100.f)) {
    res.status(200).json({
      error: 'no-label', searched: ev.rows.length,
      message: 'Nothing online carries a real label for that — photograph the nutrition table and I’ll read it exactly.'
    });
    return;
  }

  // Verify against the ONE snippet it cited, then against everything we read.
  var idx = parseInt(o.cite, 10);
  var cited = (idx >= 1 && idx <= ev.rows.length) ? ev.rows[idx - 1] : null;
  var citedText = cited ? cited.text : '';
  var allText = ev.rows.map(function (x) { return x.text; }).join(' ');

  var vCited = cited ? CHECK.grounding(per100, citedText) : { ratio: 0, checked: 0, missing: [] };
  var vAll = CHECK.grounding(per100, allText);
  // Trust the better of the two: a label split across two results is common and
  // is not dishonesty. What we refuse to accept is numbers in NEITHER.
  var evidenceText = (vCited.ratio >= vAll.ratio) ? citedText : allText;
  var tier = cited ? cited.tier : Math.min.apply(null, ev.rows.map(function (x) { return x.tier; }));

  // consensus: how many DISTINCT sources contain this energy figure
  var agree = 1;
  if (per100.kcal > 0) {
    agree = ev.rows.filter(function (row) { return CHECK.appearsIn(per100.kcal, row.text); }).length || 1;
  }

  var verdict = CHECK.verify({ per100: per100, evidence: evidenceText, name: (o.name || text) + ' ' + cls.en, tier: tier, agree: agree });

  // Portion: prefer the printed serving, but never below a sane floor for a
  // food eaten whole. "Kinder Bueno = 21 g" is a real label serving AND the
  // wrong answer to "how much did I eat".
  var prior = KNOW.portionPrior(text);
  var serv = Math.round(num(o.serving_g, 5000));
  var portionNote = '';
  if (prior && (!serv || serv < prior.g * 0.7)) { serv = prior.g; portionNote = 'typical for ' + prior.label; }
  if (!serv) serv = 100;
  var qty = cls.qty || 1;
  var grams = Math.round(serv * qty);
  var k = grams / 100;

  var srcDomain = cited ? cited.domain : (ev.rows[0] && ev.rows[0].domain) || '';
  res.status(200).json({
    name: (o.name || text).toString().slice(0, 90),
    kind: 'product',
    source: srcDomain, source_label: 'web',
    sources: ev.rows.slice(0, 4).map(function (x) { return x.domain; }),
    found: verdict.confirmed,             // COMPUTED here, never self-reported
    confirmed: verdict.confirmed,
    confidence: verdict.confidence,
    why: verdict.why,
    agree: agree,
    method: verdict.confirmed
      ? ('Read from the label on ' + srcDomain + (agree > 1 ? ' · ' + agree + ' sources agree' : ''))
      : 'Best available — not fully verifiable',
    grams: grams, qty: qty,
    serving_name: (o.serving_name || (prior && prior.unit) || '').toString().toLowerCase().replace(/[^a-z ]/g, '').trim().slice(0, 16),
    portion_note: portionNote,
    package_g: r0(num(o.package_g, 50000)), servings_per_container: num(o.servings_per_container, 999),
    per100: per100,
    kcal: r0(per100.kcal * k), p: num(per100.p * k, 2000), c: num(per100.c * k, 2000), f: num(per100.f * k, 1000),
    fiber: num(per100.fiber * k, 500), sugar: num(per100.sugar * k, 1000),
    sodium: r0(per100.sodium * k), satfat: num(per100.satfat * k, 500)
  });
}

module.exports = async function (req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method !== 'POST') { res.status(405).json({ error: 'POST only' }); return; }
  if (!auth.guard(req, res, { name: 'nweb', rateMax: 20 })) return;

  var body = readBody(req);
  var text = (body.text || '').toString().slice(0, 300).trim();
  if (!text) { res.status(400).json({ error: 'no text' }); return; }

  var groqKey = (process.env.GROQ_API_KEY || '').trim();
  if (!groqKey) { res.status(200).json({ error: 'no-key', message: 'This needs GROQ_API_KEY (see NOVA_SETUP.md).' }); return; }

  var cls = KNOW.classify(text);
  // The caller may force a route (the client offers "it's a packaged product"
  // when the dish guess was wrong) — his correction always beats our guess.
  var kind = (body.kind === 'dish' || body.kind === 'product') ? body.kind : (cls.kind === 'dish' ? 'dish' : 'product');

  try {
    if (kind === 'dish') { await dishRoute(text, cls, res); return; }

    var tavKey = (process.env.TAVILY_API_KEY || '').trim();
    if (!tavKey) {
      // No web search available: a dish breakdown is still a real, traceable
      // answer, so degrade to it rather than to a bare guess.
      await dishRoute(text, cls, res); return;
    }
    await productRoute(text, cls, tavKey, res);
  } catch (e) {
    res.status(200).json({ error: 'failed', message: 'That lookup broke — photograph the label and I’ll read it exactly.' });
  }
};

// Exposed for tests only. Vercel invokes module.exports as the handler; extra
// properties on it are ignored. Ingredient matching is where a dish breakdown
// silently goes wrong, so it needs to be assertable.
module.exports._coreLookup = coreLookup;
module.exports._tokEq = tokEq;
