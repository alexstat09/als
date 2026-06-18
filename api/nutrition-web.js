// ════════════════════════════════════════════════════════════════
// Web-grounded nutrition lookup. POST { text } → Groq's web-search-capable
// "compound" agent browses for a named product's OFFICIAL nutrition label,
// returns per-100g values + the source it used. We then VALIDATE the numbers
// (Atwater reconciliation + bounds), scale to the serving, and return clean
// macros. Reuses GROQ_API_KEY. Model env-overridable (GROQ_WEB_MODEL).
// ════════════════════════════════════════════════════════════════
'use strict';
// compound-mini keeps the request small enough for the free tier (the full
// compound model pulls more web content and can hit Groq's 413 request limit).
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
function r0(n) { return Math.round(n); }

var SYS = [
  'You are a meticulous nutrition researcher WITH WEB SEARCH. The user names a food — usually a SPECIFIC branded product (brand + flavour + variant).',
  'Steps you MUST follow:',
  '1) Search the web for the EXACT product. Prefer the manufacturer\'s official page; otherwise a major retailer or a reputable nutrition database. Cross-check if two sources disagree.',
  '2) Read the real nutrition label. Record values PER 100 g (or per 100 ml for drinks) — this is the standard label format. Also note one labelled serving size in grams.',
  '3) Only report numbers you actually saw on a label. Do NOT invent values.',
  'Reply with ONLY a single minified JSON object — no prose, no markdown, no citations text — exactly these keys:',
  '{"name": full product name incl. brand, "source": the website domain you used (e.g. "per4m.com"), "serving_g": one serving in grams, "per100": {"kcal":,"p":,"c":,"f":,"fiber":,"sugar":,"sodium":mg,"satfat":}, "found": true only if you actually saw the real label else false, "confidence": 0..1}',
  'All numbers, no units in values. per100 values are PER 100g. If you cannot find the real product label, set found=false and per100 to your best conservative estimate. Never refuse.'
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
    messages: [{ role: 'system', content: SYS }, { role: 'user', content: 'Find the official nutrition label for: ' + text }],
    max_tokens: 512,
    temperature: 0.1
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
    if (r.status === 413) { res.status(200).json({ error: 'too-large', message: 'Web search pulled too much data for the free tier.' }); return; }
    res.status(200).json({ error: 'upstream', status: r.status, message: d || 'Web model unavailable — set GROQ_WEB_MODEL or use the estimate.' }); return;
  }

  var raw = '';
  try { var j = await r.json(); raw = (j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || ''; } catch (e) {}
  // compound can wrap JSON in prose — try direct, then the largest/last {...} block
  var obj = null;
  try { obj = JSON.parse(raw); } catch (e) {
    var m = raw.match(/\{[\s\S]*\}/); if (m) { try { obj = JSON.parse(m[0]); } catch (e2) {
      var small = raw.match(/\{[^{}]*\}/g); if (small) { for (var i = small.length - 1; i >= 0 && !obj; i--) { try { obj = JSON.parse(small[i]); } catch (e3) {} } }
    } }
  }
  if (!obj || typeof obj !== 'object') { res.status(200).json({ error: 'parse', message: 'Couldn’t read a clear result — try a barcode or the estimate.' }); return; }

  var p100 = obj.per100 || {};
  var P = num(p100.p, 100), C = num(p100.c, 100), F = num(p100.f, 100);
  var kcal100 = num(p100.kcal, 1000);
  var conf = Math.max(0, Math.min(1, num(obj.confidence, 1)));
  var found = obj.found === true;

  // ── validate: reconcile per-100g kcal against the macros (Atwater) ──
  var atwater = 4 * P + 4 * C + 9 * F;
  var off = Math.abs(kcal100 - atwater);
  if ((P + C + F) > 0) {
    if (off > Math.max(45, 0.20 * atwater)) {       // numbers don't add up → distrust the kcal
      kcal100 = r0(atwater);                         // physically-grounded fallback
      conf = Math.min(conf, 0.45);
      found = false;                                 // flag as not-verified
    }
    // sanity bounds (per 100g): nothing edible exceeds ~9 kcal/g or these macro caps
    if (kcal100 > 950 || P > 95 || C > 105 || F > 100) { conf = Math.min(conf, 0.4); found = false; }
  } else if (kcal100 <= 0) {
    res.status(200).json({ error: 'parse', message: 'No usable label found — try a barcode or the estimate.' }); return;
  }

  // ── scale per-100g to one serving ──
  var serv = Math.max(1, Math.round(num(obj.serving_g, 5000)) || 100);
  var k = serv / 100;
  var name = (obj.name || text).toString().slice(0, 90);
  var source = (obj.source || '').toString().replace(/^https?:\/\//, '').replace(/\/.*$/, '').slice(0, 48);

  res.status(200).json({
    name: name, source: source, found: found, confidence: conf, grams: serv,
    kcal: r0(kcal100 * k),
    p: num(P * k, 1000), c: num(C * k, 2000), f: num(F * k, 1000),
    fiber: num(num(p100.fiber, 100) * k, 500), sugar: num(num(p100.sugar, 100) * k, 1000),
    sodium: r0(num(p100.sodium, 50000) * k), satfat: num(num(p100.satfat, 100) * k, 500),
    source_label: 'web'
  });
};
