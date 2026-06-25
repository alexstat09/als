// ════════════════════════════════════════════════════════════════
// Inbound-auth gate for the public API surface.
//
// This is a single-user personal dashboard. The realistic threat is NOT a
// targeted attacker — it's a scanner or a copy-pasted script discovering one
// of these endpoint URLs and hammering it, burning the (free-tier) 3rd-party
// API quota behind it (Groq / Tavily / USDA) or spamming push notifications.
//
// Defenses, layered so the REAL app never trips them:
//   • sameOrigin(req) — the request must come FROM the app's own page.
//       Browsers attach `Origin` on POST/CORS and `Referer` on navigations;
//       we require its host to match the host the request arrived on. A bare
//       curl / cross-site script (no Origin, or a foreign one) is rejected.
//       This is domain-agnostic: it works on any Vercel URL or custom domain
//       with nothing hard-coded.
//   • cronOk(req) — server-to-server callers (QStash) present
//       `Authorization: Bearer <CRON_SECRET>` (forwarded by QStash).
//   • rateLimit(...) — best-effort fixed-window limiter. On serverless this
//       is per-warm-instance only (not global), but it still blunts a runaway
//       loop hammering one instance, which is the common accident.
//
// Nothing here logs or stores request data.
// ════════════════════════════════════════════════════════════════
'use strict';

function hostOf(u) { try { return new URL(u).host.toLowerCase(); } catch (e) { return ''; } }

function selfHost(req) {
  return (req.headers['x-forwarded-host'] || req.headers.host || '').toLowerCase();
}

function isLocal(h) { return /^(localhost|127\.0\.0\.1|\[::1\]|::1)(:\d+)?$/.test(h || ''); }

// True when the request demonstrably originated from the app's own page.
function sameOrigin(req) {
  var self = selfHost(req);
  if (!self) return false;
  var o = req.headers.origin ? hostOf(req.headers.origin) : '';
  var r = req.headers.referer ? hostOf(req.headers.referer) : '';
  if (o && o === self) return true;
  if (r && r === self) return true;
  // Local dev: vite/static server, where Origin may be absent on GET.
  if (isLocal(self) && (isLocal(o) || isLocal(r) || (!o && !r))) return true;
  return false;
}

// True when the caller presents the shared cron secret (set CRON_SECRET in
// Vercel and forward it from QStash via Upstash-Forward-Authorization).
function cronOk(req) {
  var secret = (process.env.CRON_SECRET || '').trim();
  if (!secret) return false;
  var auth = (req.headers.authorization || '').trim();
  if (auth.indexOf('Bearer ') === 0 && auth.slice(7).trim() === secret) return true;
  if ((req.headers['x-cron-secret'] || '').trim() === secret) return true;
  return false;
}

// ── best-effort fixed-window rate limiter (per warm instance) ──
var _hits = Object.create(null);
function rateLimit(key, max, windowMs) {
  var now = Date.now();
  var e = _hits[key];
  if (!e || now - e.start >= windowMs) { _hits[key] = { start: now, n: 1 }; return true; }
  e.n++;
  if (e.n % 50 === 0) { // occasional cleanup so the map can't grow unbounded
    for (var k in _hits) { if (now - _hits[k].start >= windowMs) delete _hits[k]; }
  }
  return e.n <= max;
}
function clientKey(req) {
  var xff = (req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return xff || (req.socket && req.socket.remoteAddress) || 'ip';
}

function deny(res, code, msg) {
  try {
    res.statusCode = code;
    if (code === 429) res.setHeader('Retry-After', '60');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.end(JSON.stringify({ error: msg }));
  } catch (e) { /* response already started */ }
}

// Gate for the browser-facing AI/data endpoints. Returns true if allowed;
// otherwise writes the error response and returns false.
//   opts: { name, rateMax, rateWindowMs, allowCron }
function guard(req, res, opts) {
  opts = opts || {};
  if (!sameOrigin(req) && !(opts.allowCron && cronOk(req))) { deny(res, 403, 'forbidden'); return false; }
  if (opts.rateMax) {
    var ok = rateLimit((opts.name || 'x') + ':' + clientKey(req), opts.rateMax, opts.rateWindowMs || 60000);
    if (!ok) { deny(res, 429, 'rate-limited'); return false; }
  }
  return true;
}

// Gate for cron-only endpoints (QStash) that may also be triggered from the
// app. Accepts the cron secret OR a same-origin call. If CRON_SECRET is NOT
// set, it stays OPEN (current behaviour) so push/reminders don't silently
// break before the secret is configured — set CRON_SECRET to lock it down.
function guardCron(req, res, opts) {
  opts = opts || {};
  if (cronOk(req)) return true;
  if (sameOrigin(req)) return true;
  if (!(process.env.CRON_SECRET || '').trim()) return true; // not yet configured → fail open
  deny(res, 403, 'forbidden');
  return false;
}

module.exports = { sameOrigin, cronOk, rateLimit, clientKey, guard, guardCron, deny };
