// ════════════════════════════════════════════════════════════════
// Web-grounded nutrition lookup. POST { text } → Groq's web-search-capable
// "compound" model actually browses for the exact product's nutrition label
// and returns ONE strict JSON object. Slower than the plain estimate, but it
// finds real branded products. Falls back to its own best estimate (found:false)
// if it can't locate the label. Key stays server-side. Model env-overridable.
// ════════════════════════════════════════════════════════════════
'use strict';
var GROQ_MODEL = process.env.GROQ_WEB_MODEL || 'groq/compound-mini';
var GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

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

var SYS = [
  'You are a nutrition researcher with web search. The user names a food, often a SPECIFIC branded product (brand + flavour + variant).',
  'Search the web for the EXACT product and find its official nutrition facts (manufacturer site, retailer, or a nutrition database). Use the real label values.',
  'Estimate the nutrition for the portion the user describes (default to one labelled serving if no amount is given).',
  'Reply with ONLY a single minified JSON object — no prose, no markdown, no citations — with exactly these keys:',
  '{"name": exact product name you found, "grams": serving weight g (integer), "kcal": calories, "p": protein g, "c": carbs g, "f": fat g, "fiber": g, "sugar": g, "sodium": mg, "satfat": g, "found": true if you located the real product label else false, "confidence": 0..1}',
  'All numbers, no units in values. If you genuinely cannot find the product, set found=false and give your best conservative estimate. Never refuse.'
].join(' ');

module.exports = async function (req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method !== 'POST') { res.status(405).json({ error: 'POST only' }); return; }

  var key = (process.env.GROQ_API_KEY || '').trim();
  if (!key) { res.status(200).json({ error: 'no-key', message: 'Web lookup needs GROQ_API_KEY (see NOVA_SETUP.md).' }); return; }

  var text = (readBody(req).text || '').toString().slice(0, 600).trim();
  if (!text) { res.status(400).json({ error: 'no text' }); return; }

  var payload = {
    model: GROQ_MODEL,
    messages: [{ role: 'system', content: SYS }, { role: 'user', content: 'Find the exact nutrition facts for: ' + text }],
    max_tokens: 700,
    temperature: 0.2
  };

  var r;
  try {
    r = await fetch(GROQ_URL, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + key, 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (e) { res.status(200).json({ error: 'network' }); return; }

  if (!r.ok) {
    var d = ''; try { var ej = await r.json(); d = (ej && ej.error && ej.error.message) || ''; } catch (e) {}
    if (r.status === 429) { res.status(200).json({ error: 'rate', message: 'Busy for a moment — try again in a few seconds.' }); return; }
    res.status(200).json({ error: 'upstream', status: r.status, message: d || 'Web model unavailable — set GROQ_WEB_MODEL or use the estimate.' }); return;
  }

  var raw = '';
  try { var j = await r.json(); raw = (j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || ''; } catch (e) {}
  // compound models can wrap the JSON in prose — take the last balanced {...} block
  var obj = null;
  try { obj = JSON.parse(raw); } catch (e) {
    var matches = raw.match(/\{[^{}]*\}/g);
    if (matches && matches.length) { for (var i = matches.length - 1; i >= 0 && !obj; i--) { try { obj = JSON.parse(matches[i]); } catch (e2) {} } }
    if (!obj) { var m = raw.match(/\{[\s\S]*\}/); if (m) { try { obj = JSON.parse(m[0]); } catch (e3) {} } }
  }
  if (!obj || typeof obj !== 'object') { res.status(200).json({ error: 'parse', message: 'Couldn’t read a clear result — try a barcode or the estimate.' }); return; }

  res.status(200).json({
    name: (obj.name || text).toString().slice(0, 90),
    grams: Math.max(1, Math.round(num(obj.grams, 5000)) || 100),
    kcal: Math.round(num(obj.kcal, 10000)),
    p: num(obj.p, 1000), c: num(obj.c, 2000), f: num(obj.f, 1000),
    fiber: num(obj.fiber, 500), sugar: num(obj.sugar, 1000),
    sodium: Math.round(num(obj.sodium, 50000)), satfat: num(obj.satfat, 500),
    found: obj.found === true,
    confidence: Math.max(0, Math.min(1, num(obj.confidence, 1))),
    source: 'ai'
  });
};
