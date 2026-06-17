// ════════════════════════════════════════════════════════════════
// Photo → meal estimate. POST { image: dataURL } → a Groq vision model
// looks at the photo and returns ONE strict JSON object with estimated
// macros for the whole plate. Same shape + clamping as nutrition-estimate.
// Key stays server-side. Model is env-overridable (GROQ_VISION_MODEL).
// ════════════════════════════════════════════════════════════════
'use strict';
var GROQ_MODEL = process.env.GROQ_VISION_MODEL || 'meta-llama/llama-4-scout-17b-16e-instruct';
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
  'You estimate the nutrition of food from a PHOTO for a fitness tracker.',
  'Identifying the foods is usually easy. The HARD part is portion WEIGHT, and vision models like you SYSTEMATICALLY OVERESTIMATE grams — so be deliberately conservative and lean to the LOWER end of what looks plausible.',
  'Method: list each distinct food; count the discrete pieces you can see; multiply by a realistic per-unit weight using these reference weights:',
  '1 slice of bread/toast ~35g (a slice of sourdough ~45g); 1 egg ~50g; 1 medium banana ~120g; 1 apple ~180g; 1 cooked chicken breast ~150g; 1 cup cooked rice or pasta ~180g; 1 tbsp oil/butter ~14g; 1 tbsp nut butter ~16g; a small handful of nuts ~25g; 1 medium potato ~150g; a typical restaurant meat portion ~150-220g; 1 cup milk/yogurt ~245g.',
  'Do NOT inflate. A normal home plate of a single food is usually 80-250g total, not more, unless the photo clearly shows an unusually large serving. Two slices of bread is ~80-90g, NOT 200g+.',
  'Return ONLY a single minified JSON object, no prose, with exactly these keys:',
  '{"name": short meal label, "items":[{"name": food, "grams": int}], "grams": total g (the sum of items), "kcal": total calories, "p": protein g, "c": carbs g, "f": fat g, "fiber": g, "sugar": g, "sodium": mg, "satfat": g, "confidence": 0..1}',
  'All numbers, no units in values. Set confidence HONESTLY to reflect portion uncertainty: for most photos it should be 0.3-0.6 because exact grams cannot be known from an image — only use above 0.7 when portions are genuinely clear. Never refuse; give your best conservative estimate.'
].join(' ');

module.exports = async function (req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method !== 'POST') { res.status(405).json({ error: 'POST only' }); return; }

  var key = (process.env.GROQ_API_KEY || '').trim();
  if (!key) { res.status(200).json({ error: 'no-key', message: 'Photo logging needs GROQ_API_KEY (see NOVA_SETUP.md).' }); return; }

  var image = (readBody(req).image || '').toString();
  if (!image || image.indexOf('data:image') !== 0) { res.status(400).json({ error: 'no image' }); return; }
  if (image.length > 8000000) { res.status(200).json({ error: 'too-big', message: 'Photo too large — try again.' }); return; }

  var payload = {
    model: GROQ_MODEL,
    messages: [
      { role: 'system', content: SYS },
      { role: 'user', content: [
        { type: 'text', text: 'Estimate the nutrition of the food in this photo.' },
        { type: 'image_url', image_url: { url: image } }
      ] }
    ],
    max_tokens: 500,
    temperature: 0.2,
    response_format: { type: 'json_object' }
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
    res.status(200).json({ error: 'upstream', status: r.status, message: d }); return;
  }

  var raw = '';
  try { var j = await r.json(); raw = (j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || ''; } catch (e) {}
  var obj = {};
  try { obj = JSON.parse(raw); } catch (e) {
    var m = raw.match(/\{[\s\S]*\}/); if (m) { try { obj = JSON.parse(m[0]); } catch (e2) {} }
  }
  if (!obj || typeof obj !== 'object') { res.status(200).json({ error: 'parse', message: 'Could not read the photo clearly — try AI Describe.' }); return; }

  var items = [];
  if (Array.isArray(obj.items)) {
    obj.items.slice(0, 12).forEach(function (it) {
      if (!it) return;
      var nm = (it.name || '').toString().trim().slice(0, 48);
      var g = Math.round(num(it.grams, 5000));
      if (nm && g > 0) items.push({ name: nm, grams: g });
    });
  }
  var itemsSum = items.reduce(function (s, x) { return s + x.grams; }, 0);
  var totalG = itemsSum > 0 ? itemsSum : (Math.round(num(obj.grams, 5000)) || 100);

  res.status(200).json({
    name: (obj.name || 'Photo meal').toString().slice(0, 80),
    items: items,
    grams: Math.max(1, totalG),
    kcal: Math.round(num(obj.kcal, 10000)),
    p: num(obj.p, 1000), c: num(obj.c, 2000), f: num(obj.f, 1000),
    fiber: num(obj.fiber, 500), sugar: num(obj.sugar, 1000),
    sodium: Math.round(num(obj.sodium, 50000)), satfat: num(obj.satfat, 500),
    confidence: Math.max(0, Math.min(1, num(obj.confidence, 1))),
    source: 'ai'
  });
};
