// ════════════════════════════════════════════════════════════════
// THE MODEL CHAIN — one brain-stem for every Groq call in the app.
//
// Groq retires models on a published schedule and every file that hardcoded
// one died with it: llama-4-scout shut down 17/07/26 (photo macros),
// llama-3.3-70b shuts down 16/08/26 (Nova, nutrition). Four files each named
// their own model behind three different env vars, so they drifted apart and
// nothing warned us.
//
// So: no caller names a model. Callers name a ROLE, and this walks a chain
// until one answers. A retirement becomes a fallback instead of an outage.
//
// `_` prefix = NOT routed as a serverless function. vercel.json lists its 12
// function paths explicitly, so helpers here are free (7 already live here).
// ════════════════════════════════════════════════════════════════
'use strict';

var GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Ordered best → last resort. Verified against Groq's deprecation page 17/07/26.
var CHAINS = {
  // gpt-oss-120b beats llama-3.3-70b on GPQA/MMLU and exposes reasoning depth.
  // llama-3.3-70b stays last: it dies 16/08/26 but until then it's a live net.
  text: ['openai/gpt-oss-120b', 'qwen/qwen3.6-27b', 'llama-3.3-70b-versatile'],
  // Groq's ONLY image-capable model as of 17/07/26, and it is PREVIEW —
  // the same status llama-4-scout had the day before it was pulled. There is
  // no second option to fall back to. If this goes, photo macros must SAY so
  // (see meal-photo.js) rather than quietly returning zeros.
  vision: ['qwen/qwen3.6-27b']
};

// Each role keeps the env var that already pointed at it, so nothing in
// Vercel needs to change. An env value PREPENDS to the chain rather than
// replacing it — a typo'd override degrades to the next model instead of
// bricking the endpoint.
var ENV = { text: 'GROQ_MODEL', vision: 'GROQ_VISION_MODEL', web: 'GROQ_WEB_PARSE_MODEL' };

function chainFor(role) {
  var base = CHAINS[role] || CHAINS.text;
  var name = ENV[role];
  var pick = name ? (process.env[name] || '').trim() : '';
  if (!pick) return base.slice();
  return [pick].concat(base.filter(function (m) { return m !== pick; }));
}

function key() { return (process.env.GROQ_API_KEY || '').trim(); }

/* Per-model payload tuning. Callers ask for what they want generically and
   this maps it to whatever the chosen model actually accepts — a param sent
   to a model that doesn't know it is a 400, which would defeat the chain. */
function tune(model, payload) {
  var p = {};
  for (var k in payload) if (Object.prototype.hasOwnProperty.call(payload, k)) p[k] = payload[k];
  p.model = model;

  var wants = p.reasoning;   // generic ask: 'high' | 'medium' | 'low'
  delete p.reasoning;

  if (model.indexOf('openai/gpt-oss') === 0) {
    // gpt-oss accepts low|medium|high and returns its thinking in a separate
    // `reasoning` field. We never display that, so don't ship it over the wire.
    if (wants) p.reasoning_effort = wants;
    p.include_reasoning = false;
  } else if (model.indexOf('qwen/') === 0) {
    // qwen only knows none|default for effort — 'high' is a 400. And its
    // default reasoning_format is "raw", which wraps thinking in <think> tags
    // INSIDE message.content. On any turn without tools or JSON mode that
    // would stream Nova's inner monologue to the user. Force it out.
    p.reasoning_format = 'hidden';
  }
  // llama-3.3-70b is not a reasoning model: no <think>, and it rejects these
  // params outright. Send neither.
  return p;
}

/* A model-shaped failure: this model is gone, or won't accept this payload.
   Both mean "try the next model", never "give up". Deliberately NOT matched:
   401 (key is wrong — every model will fail), 429 (rate limit — burning the
   chain makes it worse), 5xx (Groq-wide, not model-specific). */
function shouldFallThrough(status) { return status === 404 || status === 400; }

/* Groq's signal that the model emitted prose where a tool call belonged.
   gpt-oss-120b is reported to do this. It is NOT a reason to switch models —
   the same model can answer fine once you stop offering it tools. */
function isToolFailure(body) {
  var c = ((body && body.error && (body.error.code || body.error.type)) || '').toString();
  var m = ((body && body.error && body.error.message) || '').toString();
  return c.indexOf('tool_use_failed') >= 0 || m.indexOf('tool_use_failed') >= 0;
}

function errMsg(body) {
  return ((body && body.error && body.error.message) || '').toString();
}

async function post(model, payload, k) {
  return fetch(GROQ_URL, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + k, 'content-type': 'application/json' },
    body: JSON.stringify(tune(model, payload))
  });
}

/* ── STREAMING (Nova) ─────────────────────────────────────────────
   Returns the live upstream Response for the caller to iterate, or a typed
   failure. tool_use_failed short-circuits the chain: it's the model fumbling
   a tool call, not the model being dead, so the caller retries it toolless. */
async function stream(role, payload) {
  var k = key();
  if (!k) return { ok: false, kind: 'no-key' };
  var chain = chainFor(role);
  var first = null;

  for (var i = 0; i < chain.length; i++) {
    var r;
    try { r = await post(chain[i], payload, k); }
    catch (e) { return { ok: false, kind: 'network' }; }

    if (r.ok && r.body) return { ok: true, upstream: r, model: chain[i] };

    var body = null;
    try { body = await r.json(); } catch (e) {}

    if (r.status === 400 && isToolFailure(body)) {
      return { ok: false, kind: 'tool_use_failed', model: chain[i] };
    }
    if (!shouldFallThrough(r.status)) {
      return { ok: false, kind: r.status === 429 ? 'rate' : 'upstream', status: r.status, message: errMsg(body) };
    }
    // A fall-through is never routine: the model we WANTED is gone or refused
    // our payload, and everything downstream is now running on a weaker one.
    // Say so out loud — silently riding a fallback for months is the same
    // disease as rendering "no data" when the read failed.
    console.warn('[_model] ' + role + ': ' + chain[i] + ' refused (' + r.status + (errMsg(body) ? ': ' + errMsg(body) : '') + ') — trying next in chain');
    if (!first) first = { status: r.status, message: errMsg(body), model: chain[i] };
  }
  // Every model refused. Surface the FIRST failure — it names the model we
  // most wanted and its reason, which is what a human needs to fix this.
  return { ok: false, kind: 'exhausted', status: first && first.status, message: first && first.message, model: first && first.model };
}

/* ── ONE-SHOT JSON (photo, estimate, web parse) ───────────────────
   Walks the same chain and hands back parsed content, so callers stop
   duplicating fetch + !r.ok + r.json() + regex-rescue four times over. */
async function json(role, payload) {
  var k = key();
  if (!k) return { ok: false, kind: 'no-key' };
  var chain = chainFor(role);
  var first = null;

  for (var i = 0; i < chain.length; i++) {
    var r;
    try { r = await post(chain[i], payload, k); }
    catch (e) { return { ok: false, kind: 'network' }; }

    var body = null;
    try { body = await r.json(); } catch (e) {}

    if (r.ok) {
      var raw = (body && body.choices && body.choices[0] && body.choices[0].message && body.choices[0].message.content) || '';
      return { ok: true, obj: parse(raw), raw: raw, model: chain[i] };
    }
    if (!shouldFallThrough(r.status)) {
      return { ok: false, kind: r.status === 429 ? 'rate' : 'upstream', status: r.status, message: errMsg(body) };
    }
    // A fall-through is never routine: the model we WANTED is gone or refused
    // our payload, and everything downstream is now running on a weaker one.
    // Say so out loud — silently riding a fallback for months is the same
    // disease as rendering "no data" when the read failed.
    console.warn('[_model] ' + role + ': ' + chain[i] + ' refused (' + r.status + (errMsg(body) ? ': ' + errMsg(body) : '') + ') — trying next in chain');
    if (!first) first = { status: r.status, message: errMsg(body), model: chain[i] };
  }
  return { ok: false, kind: 'exhausted', status: first && first.status, message: first && first.message, model: first && first.model };
}

/* Strict JSON first, then rescue an object embedded in prose. Returns null
   when there's nothing parseable — callers must treat null as "we failed to
   read it", never as "the answer was empty". */
function parse(raw) {
  if (!raw) return null;
  try { var v = JSON.parse(raw); return (v && typeof v === 'object') ? v : null; } catch (e) {}
  var m = raw.match(/\{[\s\S]*\}/);
  if (m) { try { var w = JSON.parse(m[0]); return (w && typeof w === 'object') ? w : null; } catch (e2) {} }
  return null;
}

/* Map a typed failure onto the { error } shape the pages already branch on.
   These codes are a contract with the client — nutrition.html and friends
   match on them, so keep them stable. `msgs` overrides the wording only. */
function fail(r, msgs) {
  msgs = msgs || {};
  if (r.kind === 'no-key') return { error: 'no-key', message: msgs['no-key'] || 'This needs GROQ_API_KEY (see NOVA_SETUP.md).' };
  if (r.kind === 'network') return { error: 'network' };
  if (r.kind === 'rate') return { error: 'rate', message: msgs.rate || 'Busy for a moment — try again in a few seconds.' };
  if (r.kind === 'exhausted') {
    // Every model in the chain refused. Name the one we wanted — that string
    // is what turns a 3am outage into a two-minute fix.
    return { error: 'upstream', status: r.status, message: msgs.exhausted || ('No model accepted the request' + (r.model ? ' (tried ' + r.model + ' first)' : '') + (r.message ? ': ' + r.message : '')) };
  }
  return { error: 'upstream', status: r.status, message: msgs.upstream || r.message || '' };
}

module.exports = { stream: stream, json: json, parse: parse, fail: fail, chainFor: chainFor, tune: tune, CHAINS: CHAINS, GROQ_URL: GROQ_URL };
