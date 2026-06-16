// Shared Supabase REST helpers for the serverless reminder engine.
// Files in /api prefixed with "_" are NOT turned into routes by Vercel, so this
// is a private library. Uses the same publishable key the client syncs with
// (SELECT/INSERT/UPDATE granted; DELETE is not — we only ever upsert + read).
'use strict';
var SUPABASE_URL = (process.env.SUPABASE_URL || 'https://oiyvadqfldwbjroiknjc.supabase.co').replace(/\/+$/, '');
var SUPABASE_KEY = process.env.SUPABASE_KEY || 'sb_publishable_fGKn40f1Ek1Y4j0VComsFA_l4aXkKM-';

function headers(extra) {
  var h = { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY, 'Content-Type': 'application/json' };
  if (extra) for (var k in extra) h[k] = extra[k];
  return h;
}

// Read one app_state row's `data` JSON by key. Returns {} on miss/error.
async function readRow(key) {
  try {
    var r = await fetch(SUPABASE_URL + '/rest/v1/app_state?select=data&key=eq.' + encodeURIComponent(key), { headers: headers() });
    if (!r.ok) return {};
    var j = await r.json();
    return (j && j[0] && j[0].data) ? j[0].data : {};
  } catch (e) { return {}; }
}

// Upsert one app_state row (whole-row replace, same as the client's flush).
async function writeRow(key, data) {
  try {
    await fetch(SUPABASE_URL + '/rest/v1/app_state?on_conflict=key', {
      method: 'POST',
      headers: headers({ Prefer: 'resolution=merge-duplicates,return=minimal' }),
      body: JSON.stringify({ key: key, data: data, updated_at: new Date().toISOString() })
    });
  } catch (e) {}
}

module.exports = { readRow: readRow, writeRow: writeRow };
