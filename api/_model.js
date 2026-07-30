// ════════════════════════════════════════════════════════════════
// THE MODEL CHAIN — one brain-stem for every model call in the app.
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
// Three roles are Groq (`text`, `vision`, `web`) and one is not: `video` goes
// to Gemini, because it is the only provider here that can watch a YouTube URL
// rather than read text about it. Same contract either way — the caller names
// the role and never learns which company answered.
//
// `_` prefix = NOT routed as a serverless function. vercel.json lists its 12
// function paths explicitly, so helpers here are free (7 already live here).
// ════════════════════════════════════════════════════════════════
'use strict';

var GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
var GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/';

// Ordered best → last resort. Verified against Groq's deprecation page 17/07/26.
var CHAINS = {
  // gpt-oss-120b beats llama-3.3-70b on GPQA/MMLU and exposes reasoning depth.
  // llama-3.3-70b stays last: it dies 16/08/26 but until then it's a live net.
  text: ['openai/gpt-oss-120b', 'qwen/qwen3.6-27b', 'llama-3.3-70b-versatile'],
  // Groq's ONLY image-capable model as of 17/07/26, and it is PREVIEW —
  // the same status llama-4-scout had the day before it was pulled. There is
  // no second option to fall back to. If this goes, photo macros must SAY so
  // (see meal-photo.js) rather than quietly returning zeros.
  vision: ['qwen/qwen3.6-27b'],
  /* ── The one role that is NOT Groq ────────────────────────────────
     Groq has no model that can watch a video, and YouTube's caption endpoint
     is locked (re-verified 22/07/26, three InnerTube clients, zero tracks), so
     for the Library's whole life a "YouTube lesson" was a summary of the
     creator's marketing copy. Gemini takes a YouTube URL directly and ingests
     the real audio and frames — Google owns YouTube, so there is nothing to
     scrape and nothing to break.
     Flash tier on purpose: 1M context, and the free tier allows 8 hours of
     YouTube a day, which is far more than one person watches.
     GA as of 07/26; 2.0 was shut down 01/06/26, so nothing older is listed. */
  video: ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.5-flash-lite']
};

// Each role keeps the env var that already pointed at it, so nothing in
// Vercel needs to change. An env value PREPENDS to the chain rather than
// replacing it — a typo'd override degrades to the next model instead of
// bricking the endpoint.
var ENV = { text: 'GROQ_MODEL', vision: 'GROQ_VISION_MODEL', web: 'GROQ_WEB_PARSE_MODEL', video: 'GEMINI_VIDEO_MODEL' };

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

/* ⚠️⚠️ GEMINI'S 503 MEANS SOMETHING DIFFERENT FROM GROQ'S.
   The rule above is right for Groq, where a 5xx is the whole platform having a
   bad minute and walking the chain only makes it worse. Google returns **503
   UNAVAILABLE per MODEL** — "The model is overloaded", which the page showed
   Alex as *"This model is currently experiencing high demand."* That is the
   single most model-specific failure there is, and the one case a fallback
   chain exists for. Because `watch()` reused Groq's predicate, a 503 on
   `gemini-3.6-flash` returned instantly and **the other two models in the
   chain were never tried.**
   Two providers, two meanings for one status code — so the video path gets its
   own predicate rather than bending the shared one and changing Groq's
   behaviour underneath four other callers. */
function isOverloaded(status, body) {
  if (status === 503 || status === 500) return true;
  var m = ((body && body.error && body.error.message) || '').toString();
  var s = ((body && body.error && body.error.status) || '').toString();
  return /UNAVAILABLE/i.test(s) || /overload|high demand|try again later|capacity/i.test(m);
}
function geminiFallThrough(status, body) {
  return shouldFallThrough(status) || isOverloaded(status, body);
}

/* Groq's JSON mode is a VALIDATOR, not just a hint: if the model's output
   isn't valid JSON (usually truncated, because reasoning tokens eat the
   budget), Groq rejects the whole call with a 400 instead of returning what
   it produced. That took photo macros AND label reading down together, and
   the model itself was fine — only the strict mode failed.
   We already rescue an object embedded in prose (see parse()), so the right
   answer is to ask the SAME model again without the validator. */
function isJsonValidateFailure(body) {
  var c = ((body && body.error && (body.error.code || body.error.type)) || '').toString();
  var m = ((body && body.error && body.error.message) || '').toString();
  return c.indexOf('json_validate') >= 0 || /failed to validate json/i.test(m);
}

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
    // Strict JSON mode refused this model's output. The model is not the
    // problem — retry it once with the validator off and rescue the object
    // ourselves. Only then fall through the chain.
    if (r.status === 400 && isJsonValidateFailure(body) && payload.response_format) {
      var relaxed = {};
      for (var kk in payload) if (Object.prototype.hasOwnProperty.call(payload, kk)) relaxed[kk] = payload[kk];
      delete relaxed.response_format;
      console.warn('[_model] ' + role + ': ' + chain[i] + ' failed JSON validation — retrying without response_format');
      var r2 = null;
      try { r2 = await post(chain[i], relaxed, k); } catch (e2) { r2 = null; }
      if (r2 && r2.ok) {
        var b2 = null;
        try { b2 = await r2.json(); } catch (e3) {}
        var raw2 = (b2 && b2.choices && b2.choices[0] && b2.choices[0].message && b2.choices[0].message.content) || '';
        var obj2 = parse(raw2);
        // Only accept it if we could actually READ an object out of it —
        // otherwise this is no better than the failure we started with.
        if (obj2) return { ok: true, obj: obj2, raw: raw2, model: chain[i], relaxed: true };
      }
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

/* ── WATCHING A VIDEO (Gemini) ────────────────────────────────────
   The only call in this app that does not go to Groq, and the only one that
   sees a video rather than text about a video. `url` is a public YouTube watch
   URL handed straight to Gemini as a file part — no download, no transcript
   scrape, no third-party service.

   Two failure modes are handled here rather than left to the caller, because
   both are silent by nature and this project has been bitten by each before:

   1. ⚠️ `mediaResolution` is a newer generationConfig field. If a model in the
      chain does not know it, that is a 400 — and falling through the chain on
      it would burn every model for a field none of them accept. So a 400 is
      retried ONCE against the same model with the config trimmed to its safe
      core, exactly as json() does for response_format.
   2. ⚠️ These are thinking models. Thinking is billed against the same output
      budget, so a generous maxOutputTokens can still come back with EMPTY text
      and finishReason MAX_TOKENS — the gpt-oss trap in a different provider's
      clothes. That is reported as its own kind, never as an empty recap. */
function geminiKey() { return (process.env.GEMINI_API_KEY || '').trim(); }

function gemBody(opts, full) {
  var parts = [{ text: String(opts.prompt || '') }];
  if (opts.url) {
    var vp = { file_data: { file_uri: String(opts.url) } };
    /* ⭐ CLIPPING IS WHAT MAKES A LONG VIDEO POSSIBLE AT ALL.
       Every invocation of `run-reminders.js` is capped at 60s, and no amount
       of tuning gets a 50-minute video through one of them. `videoMetadata`
       lets us ask for a SLICE, so a long video becomes several ordinary
       requests instead of one impossible one. The caller orchestrates; this
       just carries the window.
       ⚠️ Offsets are `{seconds}` objects, not bare numbers. */
    var vm = null;
    if (opts.clip && (opts.clip.end > opts.clip.start)) {
      vm = {
        startOffset: { seconds: Math.max(0, Math.floor(opts.clip.start)) },
        endOffset: { seconds: Math.floor(opts.clip.end) }
      };
    }
    /* Frames are sampled at 1/second by default. For a talking video that is
       enormous waste: the argument lives in the AUDIO, which is billed at a
       flat 32 tokens/second whatever we do here. Dropping to one frame every
       five seconds cuts the frame half by 5× and is the difference between a
       slice finishing inside the window and not. Still enough to catch a slide
       or a chart being held up. */
    if (full) { vm = vm || {}; vm.fps = opts.fps || 0.2; }
    if (vm) vp.video_metadata = vm;
    parts.push(vp);
  }
  var cfg = {
    temperature: opts.temperature == null ? 0.3 : opts.temperature,
    maxOutputTokens: opts.maxTokens || 8192
  };
  if (full) {
    // Low media resolution is ~100 tokens/sec of video against ~300 at default,
    // and for a talking video the value is in what is SAID, not in reading small
    // text off the frames. It is what makes an hour-long video affordable.
    cfg.mediaResolution = 'MEDIA_RESOLUTION_LOW';
    /* ⚠️⚠️ THIS LINE IS WHY THE FIRST BUILD RETURNED 504.
       **Gemini 3 defaults `thinking_level` to HIGH.** On a video that means it
       reasons over the whole thing before writing a word, and the request
       comfortably outran `run-reminders.js`'s 60s ceiling — Vercel killed the
       function and the page got an opaque gateway 504 that said nothing.
       A recap is a summarisation job, not a reasoning one: the material is
       already there, it just has to be written down well. `low` is the right
       level for it AND the difference between finishing and being killed.
       ⚠️ `thinkingLevel` is a Gemini-3 field — on anything older it is an
       error, which is exactly what the trimmed retry below exists to survive. */
    cfg.thinkingConfig = { thinkingLevel: 'low' };
  }
  var b = { contents: [{ role: 'user', parts: parts }], generationConfig: cfg };
  if (opts.system) b.systemInstruction = { parts: [{ text: String(opts.system) }] };
  return b;
}

function gemText(body) {
  var c = (body && body.candidates && body.candidates[0]) || null;
  if (!c) return { text: '', finish: '' };
  var ps = (c.content && c.content.parts) || [];
  var out = '';
  ps.forEach(function (p) { if (p && typeof p.text === 'string') out += p.text; });
  return { text: out.trim(), finish: (c.finishReason || '').toString() };
}

/* ⚠️ A DEADLINE WE OWN, INSIDE THE ONE THE PLATFORM OWNS.
   `run-reminders.js` is capped at 60s in vercel.json. When Gemini runs past
   that, Vercel kills the whole function and answers with its own gateway 504 —
   an HTML page, not our JSON — so the page rendered the literal string
   "The server said 504." and Alex had no idea what had happened or what to do.
   That is hard constraint 10 with a stopwatch: a timeout and a failure must
   not look the same, and neither may be mute.
   So we abort FIRST, with room to spare, and return a typed failure the page
   can turn into a real sentence. */
var GEM_DEADLINE_MS = 48000;
// Below this there is no point starting another attempt: it cannot finish, and
// burning the remaining seconds turns a reportable overload into a bare
// timeout that says less.
var GEM_MIN_ATTEMPT_MS = 7000;

async function gemPost(m, opts, full, k, ms) {
  var ctl = typeof AbortController === 'function' ? new AbortController() : null;
  var timer = ctl ? setTimeout(function () { ctl.abort(); }, ms || opts.deadlineMs || GEM_DEADLINE_MS) : null;
  try {
    return await fetch(GEMINI_URL + encodeURIComponent(m) + ':generateContent?key=' + encodeURIComponent(k), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(gemBody(opts, full)),
      signal: ctl ? ctl.signal : undefined
    });
  } finally { if (timer) clearTimeout(timer); }
}

function isAbort(e) {
  return !!e && (e.name === 'AbortError' || e.name === 'TimeoutError' || /abort/i.test(String(e.message || '')));
}

function napFor(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

/* ⚠️⚠️ THE BUDGET IS SHARED BY THE WHOLE CALL, NOT BY EACH REQUEST.
   The deadline started life as a per-fetch timeout, which was fine while the
   chain never actually walked. The moment an overloaded model began falling
   through to the next one, three models × 48s became 144 seconds against a
   60-second function — so the very fix that lets us survive an overload would
   have guaranteed the 504 it was meant to prevent.
   `left()` is what keeps every attempt, every retry and every wait inside one
   envelope, and it is why nothing below may use a fixed timeout. */
async function watch(opts) {
  opts = opts || {};
  var k = geminiKey();
  if (!k) return { ok: false, kind: 'no-key' };
  var chain = chainFor('video');
  var first = null, sawOverload = false;
  var started = Date.now(), budget = opts.budgetMs || GEM_DEADLINE_MS;
  function left() { return budget - (Date.now() - started); }
  function outOfTime(model) {
    // If a model told us it was BUSY, that is the more useful thing to report:
    // "everything is busy, try in a minute" is actionable in a way that "it
    // took too long" is not.
    if (sawOverload) return { ok: false, kind: 'overloaded', status: first && first.status, message: first && first.message, model: first && first.model };
    return { ok: false, kind: 'timeout', model: model };
  }

  for (var i = 0; i < chain.length; i++) {
    /* ⚠️ TWO REASONS TO RETRY THE SAME MODEL, AND THEY MUST NOT SHARE A FLAG.
       `trimmed` drops the newer config fields after a 400. `overloadRetried`
       waits out a demand spike. The first version reused one `pass` counter
       for both — so an overload retry silently went out with the config
       ALREADY TRIMMED, which throws away `thinkingLevel:'low'`, the single
       setting that makes this call fit inside 60 seconds. It would have
       retried its way straight into the timeout it was avoiding. */
    var trimmed = false, overloadRetried = false, nextModel = false;

    while (!nextModel) {
      if (left() < GEM_MIN_ATTEMPT_MS) return outOfTime(chain[i]);

      var r;
      try { r = await gemPost(chain[i], opts, !trimmed, k, left()); }
      catch (e) {
        // ⚠️ A deadline is NOT a network error and must not walk the chain —
        // every model would take just as long, so we would spend three
        // timeouts to report one.
        if (isAbort(e)) return outOfTime(chain[i]);
        return { ok: false, kind: 'network' };
      }

      var body = null;
      try { body = await r.json(); } catch (e2) {}

      if (r.ok) {
        var got = gemText(body);
        if (got.text) return { ok: true, text: got.text, model: chain[i], finish: got.finish };
        // A 200 with no text is NOT an empty answer. Name why, so the page can
        // say something true instead of rendering a blank recap.
        return {
          ok: false,
          kind: got.finish === 'MAX_TOKENS' ? 'truncated' : 'empty',
          status: 200, model: chain[i], message: got.finish || 'no text in reply'
        };
      }

      // The config was refused. Drop the newer fields and ask again — once.
      if (r.status === 400 && !trimmed) {
        console.warn('[_model] video: ' + chain[i] + ' refused the config (' + errMsg(body) + ') — retrying without the newer fields');
        trimmed = true;
        continue;
      }

      /* ⭐ AN OVERLOADED MODEL IS THE ONE THING A CHAIN EXISTS FOR.
         Google's 503 is per-MODEL — "high demand" on gemini-3.6-flash says
         nothing about 3.5-flash-lite, which is older and far less contended.
         A spike is usually seconds long, so one short wait on the same model
         is worth more than jumping straight to a weaker one. Both the wait and
         the retry are charged against the shared budget. */
      if (isOverloaded(r.status, body)) {
        sawOverload = true;
        if (!first) first = { status: r.status, message: errMsg(body), model: chain[i] };
        if (!overloadRetried && left() > GEM_MIN_ATTEMPT_MS + 1600) {
          console.warn('[_model] video: ' + chain[i] + ' is overloaded — one short wait, then the SAME model with its config intact');
          overloadRetried = true;
          await napFor(1200);
          continue;
        }
        console.warn('[_model] video: ' + chain[i] + ' still overloaded — falling through to the next model');
        nextModel = true;
        break;
      }

      if (!geminiFallThrough(r.status, body)) {
        return { ok: false, kind: r.status === 429 ? 'rate' : 'upstream', status: r.status, message: errMsg(body) };
      }
      // A fall-through is never routine: the model we WANTED is gone or
      // refused our payload, and everything downstream now runs on a weaker
      // one. Say so out loud.
      console.warn('[_model] video: ' + chain[i] + ' refused (' + r.status + (errMsg(body) ? ': ' + errMsg(body) : '') + ') — trying next in chain');
      if (!first) first = { status: r.status, message: errMsg(body), model: chain[i] };
      nextModel = true;
    }
  }
  // Every model was busy. That is a different sentence from "no model accepted
  // the request", and it is the one that says: just try again in a minute.
  if (sawOverload) return { ok: false, kind: 'overloaded', status: first && first.status, message: first && first.message, model: first && first.model };
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
  // A 200 that carried no text. Never collapse either of these into "empty
  // result" — one means the model spent its whole budget thinking, the other
  // means it answered with nothing, and they need different fixes.
  if (r.kind === 'timeout') return { error: 'timeout', message: msgs.timeout || 'It took too long and had to be stopped.' };
  // Google's own 503. Distinct from `rate` (our quota is spent, which is our
  // problem and lasts a day) — this is THEIR capacity, and it lasts minutes.
  if (r.kind === 'overloaded') return { error: 'overloaded', message: msgs.overloaded || 'Google’s video models are busy right now. This usually clears in a minute.' };
  if (r.kind === 'truncated') return { error: 'truncated', message: msgs.truncated || 'The model ran out of room before it finished writing. Try again.' };
  if (r.kind === 'empty') return { error: 'empty', message: msgs.empty || 'The model returned nothing at all.' };
  if (r.kind === 'exhausted') {
    // Every model in the chain refused. Name the one we wanted — that string
    // is what turns a 3am outage into a two-minute fix.
    return { error: 'upstream', status: r.status, message: msgs.exhausted || ('No model accepted the request' + (r.model ? ' (tried ' + r.model + ' first)' : '') + (r.message ? ': ' + r.message : '')) };
  }
  return { error: 'upstream', status: r.status, message: msgs.upstream || r.message || '' };
}

module.exports = {
  stream: stream, json: json, watch: watch, parse: parse, fail: fail,
  chainFor: chainFor, tune: tune, CHAINS: CHAINS,
  GROQ_URL: GROQ_URL, GEMINI_URL: GEMINI_URL,
  _gemBody: gemBody, _gemText: gemText
};
