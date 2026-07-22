// ════════════════════════════════════════════════════════════════
// GARMIN — the night her watch actually measured.
//
// WHY THIS EXISTS. Her sleep already arrives via intervals.icu, but that wire
// carries exactly four numbers: duration, restingHR, hrv, and Garmin's own
// score. It cannot carry when she fell asleep, when she woke, the stages, or
// whether the night was continuous — intervals is a training platform and
// Garmin's partner API never hands it sleep onset/offset. Verified against her
// own account 2026-07-22: this endpoint carries all ten of those things, and
// intervals carries four. So we go to the source for sleep, and leave the
// intervals courier standing as the fallback.
//
// NOT A 13th FUNCTION. `_`-prefixed, so Vercel never routes or counts it.
// Called from api/run-reminders.js on the tick that already exists.
//
// NO PASSWORD ON THE SERVER. Alex logs in ONCE on his Mac (tests/garmin-probe.js)
// and pastes the resulting long-lived OAuth1 token into Vercel as
// GARMIN_OAUTH1_TOKEN / GARMIN_OAUTH1_SECRET. This module only ever exchanges
// that for a short-lived bearer. Her password is never transmitted from here
// and is not recoverable from what is stored.
//
// KNOWN EXPIRY: Garmin retires OAuth1 on 2026-12-31. When it goes, the
// replacement is the iPhone → Apple Health route; the item shape below is
// deliberately source-agnostic so the consumer never has to change.
// ════════════════════════════════════════════════════════════════
'use strict';

var crypto = require('crypto');

var API = 'https://connectapi.garmin.com';
var CONSUMER_URL = 'https://thegarth.s3.amazonaws.com/oauth_consumer.json';
var UA = 'com.garmin.android.apps.connectmobile';

function env(name) { return (process.env[name] || '').trim(); }
function pad(n) { return n < 10 ? '0' + n : '' + n; }

// ── OAuth 1.0a (HMAC-SHA1) ───────────────────────────────────────
// Garmin still speaks OAuth1 to issue an OAuth2 bearer. Hand-rolled on purpose:
// this is 25 lines, and a dependency in a serverless bundle for 25 lines is a
// liability, not a convenience.
function pct(s) {
  return encodeURIComponent(String(s)).replace(/[!*'()]/g, function (c) {
    return '%' + c.charCodeAt(0).toString(16).toUpperCase();
  });
}
function oauth1Header(method, url, consumer, token) {
  var u = new URL(url);
  var params = {
    oauth_consumer_key: consumer.key,
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: String(Math.floor(Date.now() / 1000)),
    oauth_version: '1.0'
  };
  if (token && token.oauth_token) params.oauth_token = token.oauth_token;
  var all = {};
  Object.keys(params).forEach(function (k) { all[k] = params[k]; });
  u.searchParams.forEach(function (v, k) { all[k] = v; });
  var normalized = Object.keys(all).sort().map(function (k) { return pct(k) + '=' + pct(all[k]); }).join('&');
  var sigBase = [method.toUpperCase(), pct(u.origin + u.pathname), pct(normalized)].join('&');
  var key = pct(consumer.secret) + '&' + pct((token && token.oauth_token_secret) || '');
  params.oauth_signature = crypto.createHmac('sha1', key).update(sigBase).digest('base64');
  return 'OAuth ' + Object.keys(params).sort().map(function (k) {
    return pct(k) + '="' + pct(params[k]) + '"';
  }).join(', ');
}

// ── token + profile, cached for the life of a warm lambda ────────
// The bearer is good for ~an hour and the cron ticks hourly, so a warm
// container usually needs zero extra round-trips. displayName never changes.
var _consumer = null, _bearer = null, _bearerExp = 0, _displayName = null;

async function consumer() {
  if (_consumer) return _consumer;
  // Overridable by env so a Garmin change to the public consumer file can be
  // worked around without a deploy.
  if (env('GARMIN_CONSUMER_KEY') && env('GARMIN_CONSUMER_SECRET')) {
    _consumer = { key: env('GARMIN_CONSUMER_KEY'), secret: env('GARMIN_CONSUMER_SECRET') };
    return _consumer;
  }
  var r = await fetch(CONSUMER_URL);
  if (!r.ok) throw new Error('consumer HTTP ' + r.status);
  var j = await r.json();
  _consumer = { key: j.consumer_key, secret: j.consumer_secret };
  return _consumer;
}

async function bearer() {
  if (_bearer && Date.now() < _bearerExp) return _bearer;
  var tok = { oauth_token: env('GARMIN_OAUTH1_TOKEN'), oauth_token_secret: env('GARMIN_OAUTH1_SECRET') };
  if (!tok.oauth_token || !tok.oauth_token_secret) throw new Error('garmin env not set');
  var c = await consumer();
  var url = API + '/oauth-service/oauth/exchange/user/2.0';
  var r = await fetch(url, {
    method: 'POST',
    headers: {
      'User-Agent': UA,
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: oauth1Header('POST', url, c, tok)
    },
    body: ''
  });
  var text = await r.text();
  if (!r.ok) throw new Error('exchange ' + r.status + ' ' + text.slice(0, 160));
  var j = JSON.parse(text);
  _bearer = j.access_token;
  // Refresh a minute early rather than discover expiry mid-flight.
  _bearerExp = Date.now() + Math.max(60, (j.expires_in || 3600) - 60) * 1000;
  return _bearer;
}

async function get(pathname) {
  var b = await bearer();
  var r = await fetch(API + pathname, {
    headers: { 'User-Agent': UA, Authorization: 'Bearer ' + b, Accept: 'application/json' }
  });
  var text = await r.text();
  if (!r.ok) throw new Error(pathname.split('?')[0] + ' ' + r.status + ' ' + text.slice(0, 160));
  return JSON.parse(text);
}

async function displayName() {
  if (_displayName) return _displayName;
  if (env('GARMIN_DISPLAY_NAME')) { _displayName = env('GARMIN_DISPLAY_NAME'); return _displayName; }
  var p = await get('/userprofile-service/socialProfile');
  _displayName = p && p.displayName;
  if (!_displayName) throw new Error('no displayName on profile');
  return _displayName;
}

// ── shaping one night ────────────────────────────────────────────
// Garmin's *Local timestamps are epoch-ms already shifted into her timezone, so
// they must be read with UTC getters. Reading them with local getters would
// apply the offset a second time — the server is UTC and her watch is +3, so
// a 00:39 bedtime would silently render as 03:39. Verified: local − GMT is
// exactly her offset, so nothing here is hardcoded to Athens.
function hhmm(msLocal) {
  if (!(msLocal > 0)) return null;
  var d = new Date(msLocal);
  return pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes());
}
function mins(sec) { return (sec > 0) ? Math.round(sec / 60) : 0; }
function num(v) { return (typeof v === 'number' && isFinite(v)) ? v : null; }

// activityLevel → stage. NOT guessed: proven against her 2026-07-22 night by
// summing each level's segments and matching the DTO totals exactly
// (0 = 2940s = deepSleepSeconds, 1 = 17040s = light, 2 = 4440s = rem).
var LEVEL = { 0: 'deep', 1: 'light', 2: 'rem', 3: 'awake' };

function shape(raw) {
  var d = raw && raw.dailySleepDTO;
  if (!d || !d.calendarDate) return null;
  var asleepSec = num(d.sleepTimeSeconds);
  // A night with no measured sleep is not a night. Publishing a zero would
  // overwrite a real intervals reading with nothing.
  if (!(asleepSec > 0)) return null;

  var startL = num(d.sleepStartTimestampLocal), endL = num(d.sleepEndTimestampLocal);
  var startG = num(d.sleepStartTimestampGMT);

  // The hypnogram, compacted to [offsetMinFromSleepStart, durationMin, stage].
  // 13 segments on a typical night — small enough to ride the synced row.
  var hypno = [];
  if (Array.isArray(raw.sleepLevels) && startG > 0) {
    raw.sleepLevels.forEach(function (s) {
      if (!s || !s.startGMT || !s.endGMT) return;
      // No zone suffix on these — they are GMT, so say so explicitly rather
      // than let the runtime guess.
      var a = Date.parse(s.startGMT + 'Z'), b = Date.parse(s.endGMT + 'Z');
      if (!(a > 0) || !(b > a)) return;
      var stage = LEVEL[s.activityLevel];
      if (!stage) return;
      hypno.push([Math.round((a - startG) / 60000), Math.round((b - a) / 60000), stage]);
    });
  }

  var scores = d.sleepScores || {};
  return {
    dateKey: String(d.calendarDate).slice(0, 10),
    // Hours, 2dp — same unit and precision the page already stores.
    asleepMeasured: Math.round((asleepSec / 3600) * 100) / 100,
    bedMeasured: hhmm(startL),
    wakeMeasured: hhmm(endL),
    stages: {
      deep: mins(d.deepSleepSeconds), light: mins(d.lightSleepSeconds),
      rem: mins(d.remSleepSeconds), awake: mins(d.awakeSleepSeconds)
    },
    hypno: hypno,
    awakeCount: num(d.awakeCount),
    restless: num(raw.restlessMomentsCount),
    overnightHR: num(d.avgHeartRate),
    restingHR: num(raw.restingHeartRate),
    hrv: num(raw.avgOvernightHrv),
    hrvStatus: raw.hrvStatus || null,
    resp: num(d.averageRespirationValue),
    respLow: num(d.lowestRespirationValue),
    stress: num(d.avgSleepStress),
    bodyBattery: num(raw.bodyBatteryChange),
    spo2: num(raw.averageSpO2Value),
    // Garmin's own verdict. Carried for COMPARISON ONLY and must never feed her
    // score — two scores disagreeing is what got sleep.html rebuilt.
    garminScore: (scores.overall && num(scores.overall.value)) || null,
    measuredBy: 'garmin'
  };
}

async function night(dateKey) {
  var name = await displayName();
  var raw = await get('/wellness-service/wellness/dailySleepData/' + encodeURIComponent(name) +
    '?date=' + encodeURIComponent(dateKey) + '&nonSleepBufferMinutes=60');
  return shape(raw);
}

function ymd(d) { return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()); }

// ── what the courier calls ───────────────────────────────────────
// Deliberately frugal. Garmin needs one request PER DAY, and re-pulling a week
// every hour would be ~170 requests/day at an endpoint that is not ours to
// hammer. Steady state here is ONE request per tick: today, which is the only
// night that can still change. Older days are fetched only to fill a gap —
// after an outage, a new device, or the first ever run.
async function recentNights(opts) {
  opts = opts || {};
  var have = opts.have || {};                  // dateKey → already delivered?
  var backfill = opts.backfill == null ? 3 : opts.backfill;
  var window = opts.window == null ? 10 : opts.window;

  var todayKey = ymd(new Date());
  var wanted = [todayKey];
  for (var i = 1; i < window && wanted.length < 1 + backfill; i++) {
    var k = ymd(new Date(Date.now() - i * 86400000));
    if (!have[k]) wanted.push(k);
  }

  var out = [], errors = [];
  for (var j = 0; j < wanted.length; j++) {
    try {
      var it = await night(wanted[j]);
      if (it) out.push(it);
    } catch (e) {
      errors.push(wanted[j] + ': ' + String((e && e.message) || e));
      // One bad day must not cost the others — but an auth failure will fail
      // every day identically, so stop rather than hammer.
      if (/exchange|env not set|401|403/.test(String((e && e.message) || e))) break;
    }
  }
  return { items: out, errors: errors };
}

// ── diagnostic ───────────────────────────────────────────────────
// A 401 from the exchange means "this signature is wrong"; a 403/429 means
// "this IP is unwelcome". They demand opposite fixes, and from the outside a
// failed courier looks identical either way. This reports enough to tell them
// apart and to prove whether the token in Vercel is byte-for-byte the token
// that worked on the laptop — WITHOUT ever returning the secret. Length plus a
// SHA-256 prefix is comparable against the local file and reveals nothing.
function fingerprint(v) {
  if (!v) return { set: false };
  return {
    set: true,
    len: v.length,
    sha: crypto.createHash('sha256').update(v).digest('hex').slice(0, 12),
    // The paste artifacts that actually happen, named rather than guessed at.
    looksQuoted: /^["']|["']$/.test(v),
    looksJson: /^\s*[{[]/.test(v),
    hasSpace: /\s/.test(v)
  };
}
async function diag() {
  var out = {
    token: fingerprint(env('GARMIN_OAUTH1_TOKEN')),
    secret: fingerprint(env('GARMIN_OAUTH1_SECRET')),
    displayNameSet: !!env('GARMIN_DISPLAY_NAME')
  };
  if (!out.token.set || !out.secret.set) { out.verdict = 'env missing'; return out; }
  try {
    var c = await consumer();
    out.consumerKeyLen = c.key ? c.key.length : 0;
    var url = API + '/oauth-service/oauth/exchange/user/2.0';
    var r = await fetch(url, {
      method: 'POST',
      headers: {
        'User-Agent': UA,
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: oauth1Header('POST', url, c, {
          oauth_token: env('GARMIN_OAUTH1_TOKEN'), oauth_token_secret: env('GARMIN_OAUTH1_SECRET')
        })
      },
      body: ''
    });
    out.status = r.status;
    out.body = (await r.text()).slice(0, 200);
    out.verdict = r.ok ? 'OK — token is good'
      : (r.status === 401 ? 'signature/token rejected — the value in Vercel is not the one that worked'
      : (r.status === 403 || r.status === 429 ? 'Garmin is refusing this IP, not this token'
      : 'unexpected ' + r.status));
  } catch (e) {
    out.verdict = 'threw: ' + String((e && e.message) || e);
  }
  return out;
}

module.exports = {
  configured: function () { return !!(env('GARMIN_OAUTH1_TOKEN') && env('GARMIN_OAUTH1_SECRET')); },
  diag: diag,
  recentNights: recentNights,
  night: night,
  _shape: shape
};
