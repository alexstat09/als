// ════════════════════════════════════════════════════════════════
// Web-grounded nutrition lookup — reliable architecture.
// POST { text } →
//   1) WE run the web search (Tavily: searches the whole web, returns clean
//      snippets + an answer). We cap the context size → no provider 413.
//   2) A fast Groq model reads ONLY those snippets and extracts the official
//      per-100g label as strict JSON (+ source domain + found flag).
//   3) We VALIDATE (Atwater reconcile + bounds) and scale to the serving.
// Needs GROQ_API_KEY (parse) + TAVILY_API_KEY (search, free/no-card at tavily.com).
// ════════════════════════════════════════════════════════════════
'use strict';
var auth = require('./_auth');
var model = require('./_model');   // role 'web' keeps the GROQ_WEB_PARSE_MODEL override
var TAVILY_URL = 'https://api.tavily.com/search';

function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  try { return JSON.parse(req.body || '{}'); } catch (e) { return {}; }
}
function num(v, max) {
  var n = typeof v === 'number' ? v : parseFloat(v);
  if (!isFinite(n) || n < 0) n = 0;
  if (max != null && n > max) n = max;
  return Math.round(n * 10) / 10;
}
function r0(n) { return Math.round(n); }
function domainOf(u) { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return ''; } }

// ── 1. web search (Tavily) — advanced depth + full page content so we get the
// real nutrition table, not just a marketing snippet. We still cap size below. ──
async function webSearch(q, key) {
  var r = await fetch(TAVILY_URL, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ api_key: key, query: q, search_depth: 'advanced', chunks_per_source: 3, max_results: 5, include_answer: 'advanced', include_raw_content: true })
  });
  if (!r.ok) return null;
  return await r.json();
}
// Pull the nutrition-dense window out of a page's content (the bit with the
// "per 100g / energy / protein" table), so the model reads real numbers.
function nutWindow(content) {
  if (!content) return '';
  content = String(content);
  if (content.length <= 900) return content;
  var lc = content.toLowerCase();
  var kw = ['per 100', 'per100', 'typical values', 'nutrition', 'energy', 'kcal', 'calorie', 'protein', 'carbohydrate', 'of which', 'sugars', 'saturate', 'fibre', 'fiber', 'sodium', 'salt', 'serving'];
  var best = -1, bestScore = 0;
  for (var i = 0; i < content.length; i += 140) {
    var seg = lc.slice(i, i + 760), sc = 0;
    for (var j = 0; j < kw.length; j++) { if (seg.indexOf(kw[j]) !== -1) sc++; }
    if (sc > bestScore) { bestScore = sc; best = i; }
  }
  if (best < 0 || bestScore < 2) return content.slice(0, 500);
  return content.slice(Math.max(0, best - 120), best + 820);
}
function buildContext(tj) {
  var parts = [], cites = [];
  if (tj.answer) parts.push('SUMMARY: ' + String(tj.answer).slice(0, 1200));
  (tj.results || []).slice(0, 5).forEach(function (res) {
    var dom = domainOf(res.url); if (dom) cites.push(dom);
    var body = nutWindow(res.raw_content || res.content || '');
    parts.push('[' + (dom || 'web') + '] ' + String(res.title || '').slice(0, 130) + ' — ' + body.replace(/\s+/g, ' '));
  });
  return { text: parts.join('\n').slice(0, 7000), cites: cites };
}

var SYS = [
  'You are given REAL web search results about a food product. Extract its official nutrition facts from them.',
  'Use ONLY numbers present in the results — never invent. Read values PER 100 g (or per 100 ml). Also note one labelled serving size in grams.',
  'Reply with ONLY a single minified JSON object — no prose — exactly these keys:',
  '{"name": full product name incl. brand, "source": the website domain the numbers came from, "serving_g": one serving in grams, "serving_name": the unit word for ONE serving e.g. "bar"/"scoop"/"slice"/"piece"/"biscuit"/"can"/"cup" (else "serving"), "package_g": total grams of the whole product/package if stated else 0, "servings_per_container": servings per package if stated else 0, "per100": {"kcal":,"p":,"c":,"f":,"fiber":,"sugar":,"sodium":mg,"satfat":}, "found": true ONLY if the results actually contain the product\'s nutrition numbers else false, "confidence": 0..1}',
  'If a label only shows PER SERVING values, convert them to per 100 g using the stated serving size.',
  'All numbers, no units. per100 is PER 100g. If the results do not contain real nutrition data for this product, set found=false and give a conservative estimate.'
].join(' ');

module.exports = async function (req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method !== 'POST') { res.status(405).json({ error: 'POST only' }); return; }
  if (!auth.guard(req, res, { name: 'nweb', rateMax: 20 })) return;

  var groqKey = (process.env.GROQ_API_KEY || '').trim();
  var tavKey = (process.env.TAVILY_API_KEY || '').trim();
  var text = (readBody(req).text || '').toString().slice(0, 600).trim();
  if (!text) { res.status(400).json({ error: 'no text' }); return; }
  if (!tavKey) { res.status(200).json({ error: 'no-search', message: 'Add a free TAVILY_API_KEY (tavily.com — no card, 1000 searches/mo) in Vercel to enable real web search.' }); return; }
  if (!groqKey) { res.status(200).json({ error: 'no-key', message: 'Web lookup needs GROQ_API_KEY (see NOVA_SETUP.md).' }); return; }

  // 1) search the web ourselves (small, controlled context → no 413)
  var ctx = null;
  try {
    var tj = await webSearch(text + ' nutritional information per 100g energy protein carbohydrate fat', tavKey);
    if (tj) ctx = buildContext(tj);
  } catch (e) { /* fall through */ }
  if (!ctx || !ctx.text) { res.status(200).json({ error: 'no-results', message: 'Web search found nothing usable — try a barcode or the estimate.' }); return; }

  // 2) parse the snippets into nutrition JSON (tiny request — cannot 413)
  var r = await model.json('web', {
    messages: [{ role: 'system', content: SYS }, { role: 'user', content: 'PRODUCT: ' + text + '\n\nWEB RESULTS:\n' + ctx.text }],
    max_tokens: 400, temperature: 0.1, response_format: { type: 'json_object' }
  });
  if (!r.ok) {
    res.status(200).json(model.fail(r, {
      rate: 'Busy for a moment — try again.',
      upstream: 'Couldn’t parse the web results — use the estimate.',
      exhausted: 'Couldn’t parse the web results — use the estimate.'
    }));
    return;
  }

  var obj = r.obj;
  if (!obj) { res.status(200).json({ error: 'parse', message: 'Couldn’t read a clear result — try a barcode.' }); return; }

  var p100 = obj.per100 || {};
  var P = num(p100.p, 100), C = num(p100.c, 100), F = num(p100.f, 100);
  var kcal100 = num(p100.kcal, 1000);
  var conf = Math.max(0, Math.min(1, num(obj.confidence, 1)));
  var found = obj.found === true;

  // validate: kcal must agree with the macros, else distrust + self-correct
  var atwater = 4 * P + 4 * C + 9 * F;
  if ((P + C + F) > 0) {
    if (Math.abs(kcal100 - atwater) > Math.max(45, 0.20 * atwater)) { kcal100 = r0(atwater); conf = Math.min(conf, 0.45); found = false; }
    if (kcal100 > 950 || P > 95 || C > 105 || F > 100) { conf = Math.min(conf, 0.4); found = false; }
  } else if (kcal100 <= 0) {
    res.status(200).json({ error: 'no-results', message: 'No usable label in the web results — try a barcode or the estimate.' }); return;
  }

  var serv = Math.max(1, Math.round(num(obj.serving_g, 5000)) || 100);
  var k = serv / 100;
  var source = (obj.source || ctx.cites[0] || '').toString().replace(/^https?:\/\//, '').replace(/\/.*$/, '').slice(0, 48);

  var servName = (obj.serving_name || '').toString().toLowerCase().replace(/[^a-z ]/g, '').trim().slice(0, 16);
  res.status(200).json({
    name: (obj.name || text).toString().slice(0, 90),
    source: source, found: found, confidence: conf, grams: serv,
    serving_name: servName, package_g: r0(num(obj.package_g, 50000)), servings_per_container: num(obj.servings_per_container, 999),
    kcal: r0(kcal100 * k),
    p: num(P * k, 1000), c: num(C * k, 2000), f: num(F * k, 1000),
    fiber: num(num(p100.fiber, 100) * k, 500), sugar: num(num(p100.sugar, 100) * k, 1000),
    sodium: r0(num(p100.sodium, 50000) * k), satfat: num(num(p100.satfat, 100) * k, 500),
    source_label: 'web'
  });
};
