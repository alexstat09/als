/* (No shebang: smoke-test.sh parses every .js with jsc, which chokes on '#'.)
   ══════════════════════════════════════════════════════════════════════════
   GARMIN PROBE — a throwaway that answers three questions before we write
   one line of production code.

     1. Can we log into Chrissie's Garmin Connect at all (and does 2FA fire)?
     2. Does her night actually carry bedtime / wake / stages / restlessness —
        the things intervals.icu structurally cannot give us?
     3. What are the REAL field names, on HER account, today? (Garmin has no
        public docs for this; every field map on the internet is someone's
        guess from their own watch. We map it from her FR265 or not at all.)

   This runs ON A MAC, never on the server. It is not deployed, not imported
   by the app, and not linked from any page. If the answer to (1) or (2) is
   no, we delete this file and take the iPhone → Apple Health route, having
   lost nothing.

   WHAT IT WRITES (next to this script, all git-ignored by intent — do not
   commit them):
     garmin-probe-out/session.json   the long-lived OAuth1 token. THIS is what
                                     later goes into Vercel, so the server
                                     never sees her password.
     garmin-probe-out/sleep-*.json   the raw night, unedited, for field mapping.

   USAGE
     export PATH="$HOME/.local/node-v24.18.0-darwin-arm64/bin:$PATH"
     node tests/garmin-probe.js
     …optionally with a date:  node tests/garmin-probe.js 2026-07-22

   It PROMPTS for her email and password (password hidden, never echoed) so
   neither ends up in shell history. If 2FA is on, it stops and asks for the
   emailed code too.
   ══════════════════════════════════════════════════════════════════════════ */

'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const OUT_DIR = path.join(__dirname, 'garmin-probe-out');

const SSO = 'https://sso.garmin.com/sso';
const SSO_EMBED = SSO + '/embed';
const API = 'https://connectapi.garmin.com';
const CONSUMER_URL = 'https://thegarth.s3.amazonaws.com/oauth_consumer.json';

// Garmin serves a different (and much fussier) login page to anything that
// doesn't look like a browser, and rejects the oauth-service calls from
// anything that doesn't look like the mobile app. Two agents, on purpose.
const UA_BROWSER = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const UA_MOBILE = 'com.garmin.android.apps.connectmobile';

/* ── tiny cookie jar ──────────────────────────────────────────────────────
   fetch() has no jar and the SSO flow is entirely cookie-driven (the signin
   POST is only accepted if it carries what /embed and GET /signin set). */
const jar = new Map();
function stashCookies(res) {
  const raw = typeof res.headers.getSetCookie === 'function'
    ? res.headers.getSetCookie()
    : (res.headers.get('set-cookie') ? [res.headers.get('set-cookie')] : []);
  raw.forEach(function (line) {
    const first = String(line).split(';')[0];
    const eq = first.indexOf('=');
    if (eq > 0) jar.set(first.slice(0, eq).trim(), first.slice(eq + 1).trim());
  });
}
function cookieHeader() {
  const out = [];
  jar.forEach(function (v, k) { out.push(k + '=' + v); });
  return out.join('; ');
}

async function req(url, opts) {
  opts = opts || {};
  const headers = Object.assign({ Cookie: cookieHeader() }, opts.headers || {});
  const res = await fetch(url, Object.assign({ redirect: 'follow' }, opts, { headers: headers }));
  stashCookies(res);
  return res;
}

/* ── OAuth 1.0a signing (HMAC-SHA1) ───────────────────────────────────────
   Garmin's oauth-service still speaks OAuth1 to get you an OAuth2 bearer.
   No library: this is 30 lines and a dependency here would be a liability. */
function pct(s) {
  return encodeURIComponent(String(s)).replace(/[!*'()]/g, function (c) {
    return '%' + c.charCodeAt(0).toString(16).toUpperCase();
  });
}
function oauth1Header(method, url, consumer, token) {
  const u = new URL(url);
  const base = u.origin + u.pathname;
  const params = {
    oauth_consumer_key: consumer.key,
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: String(Math.floor(Date.now() / 1000)),
    oauth_version: '1.0'
  };
  if (token && token.oauth_token) params.oauth_token = token.oauth_token;

  // Query-string params take part in the signature; body params don't, because
  // every call we make here has an empty body.
  const all = Object.assign({}, params);
  u.searchParams.forEach(function (v, k) { all[k] = v; });

  const normalized = Object.keys(all).sort().map(function (k) {
    return pct(k) + '=' + pct(all[k]);
  }).join('&');

  const sigBase = [method.toUpperCase(), pct(base), pct(normalized)].join('&');
  const key = pct(consumer.secret) + '&' + pct((token && token.oauth_token_secret) || '');
  params.oauth_signature = crypto.createHmac('sha1', key).update(sigBase).digest('base64');

  return 'OAuth ' + Object.keys(params).sort().map(function (k) {
    return pct(k) + '="' + pct(params[k]) + '"';
  }).join(', ');
}

/* ── the SSO dance ────────────────────────────────────────────────────────
   Mirrors what the Garmin login widget itself does: prime cookies on /embed,
   pull the CSRF token off GET /signin, POST credentials, then read a
   one-shot service ticket (ST-…) out of the success page. */
const SSO_PARAMS = new URLSearchParams({
  id: 'gauth-widget',
  embedWidget: 'true',
  gauthHost: SSO_EMBED,
  service: SSO_EMBED,
  source: SSO_EMBED,
  redirectAfterAccountLoginUrl: SSO_EMBED,
  redirectAfterAccountCreationUrl: SSO_EMBED
});

function dump(name, text) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const p = path.join(OUT_DIR, name);
  fs.writeFileSync(p, text);
  return p;
}
function csrfOf(html) {
  const m = html.match(/name="_csrf"\s+value="([^"]+)"/);
  return m ? m[1] : null;
}
function titleOf(html) {
  const m = html.match(/<title>([\s\S]*?)<\/title>/i);
  return m ? m[1].trim() : '(no title)';
}
function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(function (resolve) {
    rl.question(question, function (a) { rl.close(); resolve(a.trim()); });
  });
}
// Same, but nothing echoes. Her Garmin password should not end up in
// ~/.zsh_history, which is exactly where an inline env var puts it.
function askSecret(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  return new Promise(function (resolve) {
    const onData = function (ch) {
      // Let newline/carriage-return/EOT through so the line can actually end.
      if (['\n', '\r', ''].indexOf(ch.toString('utf8')) < 0) rl.output.write('\x1B[2K\x1B[200D' + question);
    };
    process.stdin.on('data', onData);
    rl.question(question, function (a) {
      process.stdin.removeListener('data', onData);
      rl.output.write('\n');
      rl.close();
      resolve(a.trim());
    });
  });
}

async function ssoTicket(email, password) {
  await req(SSO_EMBED + '?' + new URLSearchParams({
    id: 'gauth-widget', embedWidget: 'true', gauthHost: SSO
  }).toString(), { headers: { 'User-Agent': UA_BROWSER } });

  const signinUrl = SSO + '/signin?' + SSO_PARAMS.toString();
  let res = await req(signinUrl, { headers: { 'User-Agent': UA_BROWSER, Referer: SSO_EMBED } });
  let html = await res.text();
  let csrf = csrfOf(html);
  if (!csrf) {
    const p = dump('signin-page.html', html);
    throw new Error('No CSRF token on the login page (HTTP ' + res.status + '). Saved: ' + p);
  }

  res = await req(signinUrl, {
    method: 'POST',
    headers: {
      'User-Agent': UA_BROWSER,
      'Content-Type': 'application/x-www-form-urlencoded',
      Referer: signinUrl
    },
    body: new URLSearchParams({ username: email, password: password, embed: 'true', _csrf: csrf }).toString()
  });
  html = await res.text();

  // 2FA: Garmin swaps the success page for an MFA page and expects the code
  // posted back with a FRESH csrf from that page.
  if (/verifyMFA|mfa-code|Enter the code/i.test(html) && !/embed\?ticket=/.test(html)) {
    console.log('\n  → Two-factor is ON for this account. Garmin has sent a code.');
    const mfaCsrf = csrfOf(html) || csrf;
    const code = await ask('  Enter the Garmin verification code: ');
    const mfaUrl = SSO + '/verifyMFA/loginEnterMfaCode?' + SSO_PARAMS.toString();
    res = await req(mfaUrl, {
      method: 'POST',
      headers: {
        'User-Agent': UA_BROWSER,
        'Content-Type': 'application/x-www-form-urlencoded',
        Referer: signinUrl
      },
      body: new URLSearchParams({
        'mfa-code': code, embed: 'true', _csrf: mfaCsrf, fromPage: 'setSecurityQuestion'
      }).toString()
    });
    html = await res.text();
  }

  const t = html.match(/embed\?ticket=([^"&]+)["&]/);
  if (!t) {
    // Read Garmin's OWN words back before crying "the integration is broken".
    // A rejected password and a blocked IP look identical from the outside and
    // send you down completely different roads — the first cost us a run.
    const p = dump('signin-result.html', html);
    if (/Invalid sign in/i.test(html)) {
      throw new Error('Garmin says: "Invalid sign in. (Passwords are case sensitive.)"\n' +
        '    The login flow itself worked — CSRF accepted, no captcha, no lockout.\n' +
        '    This is only the email or password. Saved: ' + p);
    }
    if (/captchaEnabled\s*=\s*(?!null)/i.test(html) || /recaptcha/i.test(titleOf(html))) {
      throw new Error('Garmin is demanding a captcha — that IS the blocked-client signal.\n' +
        '    Saved: ' + p);
    }
    if (/locked|too many/i.test(html)) {
      throw new Error('Account appears rate-limited or locked. Wait, then retry. Saved: ' + p);
    }
    throw new Error('Login did not yield a service ticket. Page title: "' + titleOf(html) +
      '" (HTTP ' + res.status + '). Saved: ' + p);
  }
  return t[1];
}

async function oauth1Token(ticket, consumer) {
  const url = API + '/oauth-service/oauth/preauthorized?' + new URLSearchParams({
    ticket: ticket, 'login-url': SSO_EMBED, 'accepts-mfa-tokens': 'true'
  }).toString();
  const res = await req(url, {
    headers: { 'User-Agent': UA_MOBILE, Authorization: oauth1Header('GET', url, consumer, null) }
  });
  const text = await res.text();
  if (!res.ok) throw new Error('preauthorized failed: HTTP ' + res.status + ' — ' + text.slice(0, 300));
  const q = new URLSearchParams(text);
  const tok = { oauth_token: q.get('oauth_token'), oauth_token_secret: q.get('oauth_token_secret') };
  if (!tok.oauth_token || !tok.oauth_token_secret) throw new Error('preauthorized returned no token: ' + text.slice(0, 300));
  return tok;
}

async function oauth2Token(consumer, token) {
  const url = API + '/oauth-service/oauth/exchange/user/2.0';
  const res = await req(url, {
    method: 'POST',
    headers: {
      'User-Agent': UA_MOBILE,
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: oauth1Header('POST', url, consumer, token)
    },
    body: ''
  });
  const text = await res.text();
  if (!res.ok) {
    // This is the step reported failing from datacenter IPs in 2026. From a
    // home Mac it should be fine — which is exactly why we test here first.
    throw new Error('exchange failed: HTTP ' + res.status + ' — ' + text.slice(0, 300));
  }
  return JSON.parse(text);
}

async function api(pathname, bearer) {
  const res = await req(API + pathname, {
    headers: { 'User-Agent': UA_MOBILE, Authorization: 'Bearer ' + bearer, 'Accept': 'application/json' }
  });
  const text = await res.text();
  if (!res.ok) throw new Error(pathname + ' → HTTP ' + res.status + ' — ' + text.slice(0, 300));
  return JSON.parse(text);
}

/* ── the actual question this probe exists to answer ──────────────────────
   Not "did it return 200" but "does it carry the seven things intervals.icu
   cannot". Printed as a checklist so the answer is unmissable. */
function verdict(sleep) {
  const d = (sleep && sleep.dailySleepDTO) || {};
  const has = function (v) { return v !== null && v !== undefined && v !== ''; };
  const rows = [
    ['Bedtime',            has(d.sleepStartTimestampLocal), d.sleepStartTimestampLocal],
    ['Wake time',          has(d.sleepEndTimestampLocal),   d.sleepEndTimestampLocal],
    ['Deep / Light / REM', has(d.deepSleepSeconds) && has(d.lightSleepSeconds) && has(d.remSleepSeconds),
                           [d.deepSleepSeconds, d.lightSleepSeconds, d.remSleepSeconds].join(' / ') + ' s'],
    ['Awake (continuity)', has(d.awakeSleepSeconds),        d.awakeSleepSeconds + ' s'],
    ['Stage timeline',     Array.isArray(sleep && sleep.sleepLevels) && sleep.sleepLevels.length > 0,
                           (sleep && sleep.sleepLevels ? sleep.sleepLevels.length : 0) + ' segments'],
    ['Restless moments',   has(sleep && sleep.restlessMomentsCount), sleep && sleep.restlessMomentsCount],
    ['Overnight HR',       has(sleep && sleep.avgOvernightHrv) || has(sleep && sleep.restingHeartRate),
                           'hrv ' + (sleep && sleep.avgOvernightHrv) + ' · rhr ' + (sleep && sleep.restingHeartRate)],
    ['Respiration',        has(d.averageRespirationValue),  d.averageRespirationValue],
    ['Body battery',       has(sleep && sleep.bodyBatteryChange), sleep && sleep.bodyBatteryChange],
    ['Garmin sleep score', !!(d.sleepScores && d.sleepScores.overall),
                           d.sleepScores && d.sleepScores.overall && d.sleepScores.overall.value]
  ];
  console.log('\n  ── Does her night carry what intervals.icu cannot? ──');
  let got = 0;
  rows.forEach(function (r) {
    if (r[1]) got++;
    console.log('   ' + (r[1] ? '✓' : '✗') + ' ' + r[0].padEnd(20) + (r[1] ? String(r[2]) : '— absent'));
  });
  console.log('   ' + got + '/' + rows.length + ' present.');
  return got;
}

(async function main() {
  // This lives in tests/ but is an interactive TOOL, not a test. The documented
  // workflow runs `for f in tests/*.js; do node "$f"; done` — without this, that
  // loop stops dead here waiting for an email address nobody is there to type.
  let email = (process.env.GARMIN_EMAIL || '').trim();
  let password = process.env.GARMIN_PASSWORD || '';
  if (!process.stdin.isTTY && (!email || !password)) {
    console.log('  garmin-probe: skipped (interactive tool — run it directly to re-issue the token)');
    process.exit(0);
  }
  // Prompted, not passed in. An inline `GARMIN_PASSWORD=…` lands her password
  // in ~/.zsh_history forever; env vars are honoured if already set, but the
  // default path leaves no trace.
  if (!email) email = await ask('  Her Garmin email: ');
  if (!password) password = await askSecret('  Her Garmin password (hidden): ');

  // Garmin locks an account after a handful of bad attempts, so a run that is
  // guaranteed to fail must never reach their server. The first run of this
  // probe burned an attempt on the example values from the instructions.
  const PLACEHOLDERS = ['her@email', 'her@email.com', 'hers', 'password', 'your@email', '…'];
  if (!email || !password || PLACEHOLDERS.indexOf(email) >= 0 || PLACEHOLDERS.indexOf(password) >= 0 ||
      email.indexOf('@') < 0) {
    console.error('\n  ✗ Those are the placeholder values, not her real login.');
    console.error('    Not sending them — Garmin locks accounts after repeated failures.');
    process.exit(2);
  }
  // Sleep is filed under the date you WOKE UP, so "today" is the right default.
  const date = process.argv[2] || new Date().toISOString().slice(0, 10);

  try {
    console.log('  1/5  fetching Garmin OAuth consumer…');
    const cRes = await fetch(CONSUMER_URL);
    if (!cRes.ok) throw new Error('consumer fetch HTTP ' + cRes.status);
    const c = await cRes.json();
    const consumer = { key: c.consumer_key, secret: c.consumer_secret };

    console.log('  2/5  signing in as ' + email + '…');
    const ticket = await ssoTicket(email, password);

    console.log('  3/5  exchanging ticket for tokens…');
    const t1 = await oauth1Token(ticket, consumer);
    const t2 = await oauth2Token(consumer, t1);

    const sessPath = dump('session.json', JSON.stringify({
      oauth1: t1, savedAt: new Date().toISOString()
    }, null, 2));
    console.log('       ✓ logged in. Long-lived token saved → ' + sessPath);
    console.log('         (this, not her password, is what would go to Vercel)');

    console.log('  4/5  resolving profile…');
    const prof = await api('/userprofile-service/socialProfile', t2.access_token);
    console.log('       ✓ ' + prof.displayName + '  (' + (prof.userName || prof.fullName || '?') + ')');

    console.log('  5/5  pulling the night of ' + date + '…');
    const sleep = await api('/wellness-service/wellness/dailySleepData/' +
      encodeURIComponent(prof.displayName) +
      '?date=' + encodeURIComponent(date) + '&nonSleepBufferMinutes=60', t2.access_token);

    const raw = dump('sleep-' + date + '.json', JSON.stringify(sleep, null, 2));
    verdict(sleep);
    console.log('\n  Raw night saved → ' + raw);
    console.log('  Top-level keys: ' + Object.keys(sleep || {}).join(', '));
  } catch (e) {
    console.error('\n  ✗ ' + e.message);
    console.error('\n  This is a real answer, not a dead end — it tells us to take the');
    console.error('  iPhone → Apple Health route instead. Paste the error back.');
    process.exit(1);
  }
})();
