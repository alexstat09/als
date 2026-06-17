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
  'You are a precise nutrition estimator for a fitness app. You are shown a PHOTO of food the user is about to eat.',
  'Identify the foods on the plate and estimate the TOTAL nutrition for the WHOLE portion visible (not per 100g). Judge portion size from the image using normal plate/utensil references.',
  'Return ONLY a single minified JSON object, no prose, with exactly these keys:',
  '{"name": short label of the meal, "grams": total weight in g (integer), "kcal": calories, "p": protein g, "c": carbs g, "f": fat g, "fiber": g, "sugar": g, "sodium": mg, "satfat": g, "confidence": 0..1}',
  'All numbers, no units in values. confidence reflects how sure you are given image clarity and portion ambiguity. If unsure, give your best single estimate (never refuse).'
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
    max_tokens: 400,
    temperature: 0.3,
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

  res.status(200).json({
    name: (obj.name || 'Photo meal').toString().slice(0, 80),
    grams: Math.max(1, Math.round(num(obj.grams, 5000)) || 100),
    kcal: Math.round(num(obj.kcal, 10000)),
    p: num(obj.p, 1000), c: num(obj.c, 2000), f: num(obj.f, 1000),
    fiber: num(obj.fiber, 500), sugar: num(obj.sugar, 1000),
    sodium: Math.round(num(obj.sodium, 50000)), satfat: num(obj.satfat, 500),
    confidence: Math.max(0, Math.min(1, num(obj.confidence, 1))),
    source: 'ai'
  });
};
