// ════════════════════════════════════════════════════════════════
// Photo → meal estimate. POST { image: dataURL } → a Groq vision model
// looks at the photo and returns ONE strict JSON object with estimated
// macros for the whole plate. Same shape + clamping as nutrition-estimate.
// Key stays server-side. Model comes from the 'vision' chain (_model.js),
// still overridable with GROQ_VISION_MODEL.
//
// ⚠️ Vision has NO safety net: qwen3.6-27b is Groq's only image-capable model
// and it is PREVIEW — exactly what llama-4-scout was before it was pulled on
// 17/07/26 and took this endpoint down. So every failure path below must SAY
// the photo could not be read. It must never fall back to zeros: a 0-kcal
// meal silently logged is worse than no meal logged.
// ════════════════════════════════════════════════════════════════
'use strict';
var auth = require('./_auth');
var model = require('./_model');

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

// ── LABEL MODE ───────────────────────────────────────────────────
// The single most certain input in the whole app. A photo of the nutrition
// table IS the ground truth — it is the exact document every food database
// copies from. So when no database has a product, this beats any web search:
// there is nothing to hallucinate, only text to read.
// Reading is TRANSCRIPTION, not estimation, so the prompt forbids inference.
var LABEL_SYS = [
  'You TRANSCRIBE a nutrition label from a photo. This is transcription, not estimation.',
  'Read the nutrition table exactly as printed. Labels may be in Greek (Θρεπτικά συστατικά, Ενέργεια, Πρωτεΐνες, Υδατάνθρακες, εκ των οποίων σάκχαρα, Λιπαρά, εκ των οποίων κορεσμένα, Εδώδιμες ίνες, Αλάτι) or any other language.',
  'Report values PER 100 g (or per 100 ml). If the table only gives per-serving values, convert using the printed serving size.',
  'Energy is often printed as "kJ / kcal" — take the kcal figure. If only kJ is printed, divide by 4.184.',
  'SALT is not SODIUM: if the label states salt in grams, sodium_mg = salt_g * 400. If it states sodium directly, use it.',
  'Return ONLY a single minified JSON object, no prose, exactly these keys:',
  '{"name": product name as printed (incl. brand if visible), "per100":{"kcal":,"p":,"c":,"f":,"fiber":,"sugar":,"sodium":mg,"satfat":}, "serving_g": printed serving size in grams else 0, "serving_name": the unit word for one serving e.g. "bar"/"slice"/"biscuit" else "", "package_g": total net weight of the package if printed else 0, "readable": true only if you could actually READ a nutrition table in the image, "unreadable_reason": short reason if readable is false else ""}',
  'All numbers, no units. Use 0 for a value that is genuinely not printed on the label.',
  'CRITICAL: never guess, infer or recall a number from memory. If the image is blurry, cropped, or shows no nutrition table, set readable=false and leave per100 zeros. A refusal to guess is the correct answer here.'
].join(' ');

async function readLabel(image, res) {
  var r = await model.json('vision', {
    messages: [
      { role: 'system', content: LABEL_SYS },
      { role: 'user', content: [
        { type: 'text', text: 'Transcribe the nutrition label in this photo.' },
        { type: 'image_url', image_url: { url: image } }
      ] }
    ],
    max_tokens: 900, temperature: 0, response_format: { type: 'json_object' }
  });
  if (!r.ok) {
    res.status(200).json(model.fail(r, {
      'no-key': 'Label reading needs GROQ_API_KEY (see NOVA_SETUP.md).',
      // The vision chain is ONE model deep and PREVIEW, so "exhausted" means
      // image reading is genuinely down. Carry Groq's own reason: without it
      // the outage is unfixable from the outside, which is the same disease as
      // rendering "no data" when the read failed.
      exhausted: 'Label reading is unavailable right now' + (r.message ? ' — ' + String(r.message).slice(0, 200) : ' (the vision model is not responding)') + '.'
    }));
    return;
  }
  var o = r.obj;
  if (!o) { res.status(200).json({ error: 'parse', message: 'Could not read that label — try a straighter, closer photo.' }); return; }
  if (o.readable === false) {
    res.status(200).json({ error: 'unreadable', message: (o.unreadable_reason || 'No nutrition table visible') + ' — get the label square in frame, close enough to read the numbers.' });
    return;
  }

  var p = o.per100 || {};
  var P = num(p.p, 100), C = num(p.c, 100), F = num(p.f, 100), K = num(p.kcal, 1000);
  // A label with no energy and no macros was not actually read, whatever the
  // model claimed. Never let that render as a 0-kcal food.
  if (!K && !P && !C && !F) { res.status(200).json({ error: 'unreadable', message: 'No numbers came through — try a closer, straighter photo of the table.' }); return; }
  if (!K && (P || C || F)) K = Math.round(4 * P + 4 * C + 9 * F);

  res.status(200).json({
    name: (o.name || 'Label product').toString().slice(0, 90),
    per100: { kcal: Math.round(K), p: P, c: C, f: F, fiber: num(p.fiber, 100), sugar: num(p.sugar, 100), sodium: Math.round(num(p.sodium, 50000)), satfat: num(p.satfat, 100) },
    serving_g: Math.round(num(o.serving_g, 5000)),
    serving_name: (o.serving_name || '').toString().toLowerCase().replace(/[^a-z ]/g, '').trim().slice(0, 16),
    package_g: Math.round(num(o.package_g, 50000)),
    source: 'label', source_label: 'label', found: true, confidence: 0.97
  });
}

module.exports = async function (req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method !== 'POST') { res.status(405).json({ error: 'POST only' }); return; }
  if (!auth.guard(req, res, { name: 'photo', rateMax: 15 })) return;

  var key = (process.env.GROQ_API_KEY || '').trim();
  if (!key) { res.status(200).json({ error: 'no-key', message: 'Photo logging needs GROQ_API_KEY (see NOVA_SETUP.md).' }); return; }

  var body = readBody(req);
  var image = (body.image || '').toString();
  if (!image || image.indexOf('data:image') !== 0) { res.status(400).json({ error: 'no image' }); return; }
  if (image.length > 8000000) { res.status(200).json({ error: 'too-big', message: 'Photo too large — try again.' }); return; }

  // Same slot, same vision model, a completely different job (§12-function cap).
  if (body.mode === 'label') { await readLabel(image, res); return; }

  var r = await model.json('vision', {
    messages: [
      { role: 'system', content: SYS },
      { role: 'user', content: [
        { type: 'text', text: 'Estimate the nutrition of the food in this photo.' },
        { type: 'image_url', image_url: { url: image } }
      ] }
    ],
    // 500 was not enough headroom for a multi-item plate once the model's own
    // reasoning counted against the budget — the JSON came back truncated and
    // Groq's validator rejected the whole call with a 400.
    max_tokens: 900,
    temperature: 0.2,
    response_format: { type: 'json_object' }
  });

  if (!r.ok) {
    res.status(200).json(model.fail(r, {
      'no-key': 'Photo logging needs GROQ_API_KEY (see NOVA_SETUP.md).',
      // The chain is one model deep here, so "exhausted" means photo reading
      // is genuinely unavailable. Say that, and point at the path that works.
      exhausted: 'Photo reading is unavailable right now' + (r.message ? ' — ' + String(r.message).slice(0, 200) : ' (the vision model is not responding)') + '. Use AI Describe instead.'
    }));
    return;
  }

  var obj = r.obj;
  if (!obj) { res.status(200).json({ error: 'parse', message: 'Could not read the photo clearly — try AI Describe.' }); return; }

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
