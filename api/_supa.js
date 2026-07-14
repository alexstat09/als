// Shared Supabase REST helpers for the serverless reminder engine + Nova brief.
// Files in /api prefixed with "_" are NOT turned into routes by Vercel, so this
// is a private library. Prefers the SERVICE-ROLE key (server-only, bypasses RLS)
// so cron/Nova keep working once row-level security is on; falls back to the
// publishable key when the service role isn't configured.
//
// ── OWNER SCOPING (migration 001) ────────────────────────────────────────────
// app_state rows are keyed by (user_id, key): more than one account can have a
// row called 'sleep'. The service-role key BYPASSES row-level security, so this
// file is the one place that could quietly read the WRONG person's data —
// `key=eq.sleep` on its own would return whichever row Postgres handed back.
// Everything here is therefore pinned to the owner: the cron reminders, Nova's
// brief, the run importer and the Vault are ALEX's, and must never read,
// snapshot or overwrite another account's rows.
//
// OWNER_ID must be set in Vercel (Settings → Environment Variables) to Alex's
// auth.users id. If it is missing we fall back to unscoped queries — correct
// only while he is the sole account — and say so loudly in the log.
'use strict';
var SUPABASE_URL = (process.env.SUPABASE_URL || 'https://oiyvadqfldwbjroiknjc.supabase.co').replace(/\/+$/, '');
var SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || 'sb_publishable_fGKn40f1Ek1Y4j0VComsFA_l4aXkKM-';
// A misconfigured id is worse than a missing one: `user_id=eq.<garbage>` matches
// nothing, so every read silently returns {} and the app looks empty rather than
// broken. So validate the shape and SHOUT if it's wrong.
var UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function cleanId(name) {
  var v = (process.env[name] || '').trim();
  if (!v) return '';
  if (!UUID_RE.test(v)) {
    console.error('[_supa] ' + name + ' is NOT a valid uuid (' + v.length + ' chars: "' + v.slice(0, 12) + '…"). ' +
                  'Every scoped query would match zero rows. Ignoring it — falling back to unscoped.');
    return '';
  }
  return v;
}
var OWNER_ID = cleanId('OWNER_ID');
// The runner (Chrissie). Her app is run.html and her data lives in HER account,
// so the intervals.icu courier must deliver `run:inbox` to her rows, not Alex's.
// Until she has an account this is empty and everything stays with the owner.
var RUNNER_ID = cleanId('RUNNER_ID');

var warned = false;
// Every helper takes an optional `who` (a user uuid). Default: the owner.
function uid(who) { return who || OWNER_ID; }
function ownerFilter(who) {
  var u = uid(who);
  if (u) return '&user_id=eq.' + encodeURIComponent(u);
  if (!warned) { warned = true; console.warn('[_supa] OWNER_ID not set — queries are UNSCOPED. Safe only while there is exactly one account.'); }
  return '';
}

function headers(extra) {
  var h = { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY, 'Content-Type': 'application/json' };
  if (extra) for (var k in extra) h[k] = extra[k];
  return h;
}

// Read one app_state row by key, for the owner (or `who`). {} on miss/error.
async function readRow(key, who) {
  try {
    var r = await fetch(SUPABASE_URL + '/rest/v1/app_state?select=data&key=eq.' + encodeURIComponent(key) + ownerFilter(who), { headers: headers() });
    if (!r.ok) return {};
    var j = await r.json();
    return (j && j[0] && j[0].data) ? j[0].data : {};
  } catch (e) { return {}; }
}

// Upsert one app_state row (whole-row replace, like the client's flush) for the
// owner, or for `who`. Stamped with that user; conflicts resolve on
// (user_id, key) to match the primary key created by migration 001.
async function writeRow(key, data, who) {
  try {
    var u = uid(who);
    var row = { key: key, data: data, updated_at: new Date().toISOString() };
    var conflict = 'key';
    if (u) { row.user_id = u; conflict = 'user_id,key'; }
    await fetch(SUPABASE_URL + '/rest/v1/app_state?on_conflict=' + conflict, {
      method: 'POST',
      headers: headers({ Prefer: 'resolution=merge-duplicates,return=minimal' }),
      body: JSON.stringify(row)
    });
  } catch (e) {}
}

// Read every app_state row BELONGING TO THE OWNER: [{key, data, updated_at}, ...].
// Used by the Vault to snapshot the account. Returns null on error (never a
// partial lie — a caller must not mistake "the fetch failed" for "you have no
// data"). Scoping matters doubly here: an unscoped snapshot would sweep someone
// else's private data into Alex's backup repo.
async function readAllRows(who) {
  try {
    var r = await fetch(SUPABASE_URL + '/rest/v1/app_state?select=key,data,updated_at' + ownerFilter(who), { headers: headers() });
    if (!r.ok) return null;
    var j = await r.json();
    return Array.isArray(j) ? j : null;
  } catch (e) { return null; }
}

// Delete one row by key, for the owner (or `who`). Only ever used to prune old
// backup:snap:* rows.
async function deleteRow(key, who) {
  try {
    await fetch(SUPABASE_URL + '/rest/v1/app_state?key=eq.' + encodeURIComponent(key) + ownerFilter(who), {
      method: 'DELETE', headers: headers({ Prefer: 'return=minimal' })
    });
  } catch (e) {}
}

// ── Who is calling? ─────────────────────────────────────────────────────────
// Endpoints that return PERSONAL data (Nova) must serve the signed-in caller,
// not the owner. Reading OWNER_ID's rows for whoever asks would show Chrissie
// Alex's training, meals and weight — a cross-account leak dressed up as a
// feature. So: verify the caller's Supabase access token and use THEIR id.
// Returns null when the token is missing/expired/forged — callers must then
// refuse, never fall back to the owner.
var ANON_KEY = process.env.SUPABASE_KEY || 'sb_publishable_fGKn40f1Ek1Y4j0VComsFA_l4aXkKM-';
async function uidFromRequest(req) {
  try {
    var auth = (req && req.headers && (req.headers.authorization || req.headers.Authorization)) || '';
    var token = String(auth).replace(/^Bearer\s+/i, '').trim();
    if (!token) return null;
    var r = await fetch(SUPABASE_URL + '/auth/v1/user', {
      headers: { apikey: ANON_KEY, Authorization: 'Bearer ' + token }
    });
    if (!r.ok) return null;                       // expired / invalid → not signed in
    var j = await r.json();
    return (j && j.id) ? j.id : null;             // Supabase verified the JWT for us
  } catch (e) { return null; }
}

module.exports = {
  readRow: readRow, writeRow: writeRow, readAllRows: readAllRows, deleteRow: deleteRow,
  uidFromRequest: uidFromRequest,
  OWNER_ID: OWNER_ID, RUNNER_ID: RUNNER_ID
};
