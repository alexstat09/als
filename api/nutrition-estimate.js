// ════════════════════════════════════════════════════════════════
// AI food estimate — the "describe what you ate" path.
// POST { text } → Groq returns ONE strict JSON object with the estimated
// macros/micros for the described portion. Key stays server-side. Validates
// and clamps the model output so the client always gets clean numbers.
// ════════════════════════════════════════════════════════════════
'use strict';
var auth = require('./_auth');
var GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
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
  'You are a precise nutrition estimator for a fitness app. The user describes food they ate (free text, any language incl. Greek).',
  'Estimate the TOTAL nutrition for the WHOLE portion described (not per 100g). Use realistic portion sizes for what was described.',
  'Return ONLY a single minified JSON object, no prose, with exactly these keys:',
  '{"name": short label, "grams": total weight in g (integer), "kcal": calories, "p": protein g, "c": carbs g, "f": fat g, "fiber": g, "sugar": g, "sodium": mg, "satfat": g, "confidence": 0..1}',
  'All numbers, no units in values. If unsure, give your best single estimate (never refuse).'
].join(' ');

module.exports = async function (req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method !== 'POST') { res.status(405).json({ error: 'POST only' }); return; }
  if (!auth.guard(req, res, { name: 'est', rateMax: 30 })) return;

  var key = (process.env.GROQ_API_KEY || '').trim();
  if (!key) { res.status(200).json({ error: 'no-key', message: 'AI estimate needs GROQ_API_KEY (see NOVA_SETUP.md).' }); return; }

  var text = (readBody(req).text || '').toString().slice(0, 600).trim();
  if (!text) { res.status(400).json({ error: 'no text' }); return; }

  var payload = {
    model: GROQ_MODEL,
    messages: [{ role: 'system', content: SYS }, { role: 'user', content: text }],
    max_tokens: 300,
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
    if (r.status === 429) { res.status(200).json({ error: 'rate', message: "Busy for a moment — try again in a few seconds." }); return; }
    res.status(200).json({ error: 'upstream', status: r.status, message: d }); return;
  }

  var raw = '';
  try { var j = await r.json(); raw = (j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || ''; } catch (e) {}
  var obj = {};
  try { obj = JSON.parse(raw); } catch (e) {
    var m = raw.match(/\{[\s\S]*\}/); if (m) { try { obj = JSON.parse(m[0]); } catch (e2) {} }
  }
  if (!obj || typeof obj !== 'object') { res.status(200).json({ error: 'parse' }); return; }

  res.status(200).json({
    name: (obj.name || text).toString().slice(0, 80),
    grams: Math.max(1, Math.round(num(obj.grams, 5000)) || 100),
    kcal: Math.round(num(obj.kcal, 10000)),
    p: num(obj.p, 1000), c: num(obj.c, 2000), f: num(obj.f, 1000),
    fiber: num(obj.fiber, 500), sugar: num(obj.sugar, 1000),
    sodium: Math.round(num(obj.sodium, 50000)), satfat: num(obj.satfat, 500),
    confidence: Math.max(0, Math.min(1, num(obj.confidence, 1))),
    source: 'ai'
  });
};
