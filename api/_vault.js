// =============================================================
// THE VAULT — automatic daily backup.
//
// Why this exists: Supabase's free tier has NO backups. The whole account
// lives in one `app_state` table. And the likeliest way data dies isn't a
// server dying — it's a bad write that syncs everywhere and is noticed days
// later (it happened once: the weigh-in corruption). A single "latest" copy is
// useless against that, because it gets overwritten with the damage. So this
// keeps DATED, APPEND-ONLY history in a DIFFERENT failure domain:
//
//   • GitHub (private repo) — one commit per day, forever. Immutable, free,
//     off-site. This is the layer that survives losing Supabase entirely.
//   • Supabase `backup:snap:<date>` rows — the last KEEP_DAYS, for instant
//     one-tap rollback in the app. Same failure domain as the data, so this is
//     the CONVENIENCE copy, never the disaster copy.
//
// No 13th function: `_`-prefixed files are not routed by Vercel. This is called
// from the existing hourly reminder cron (see run-reminders.js).
// =============================================================
'use strict';
var supa = require('./_supa');

var KEEP_DAYS = 14;                 // Supabase rollback window. GitHub keeps everything.
var MAX_BYTES = 20 * 1024 * 1024;   // refuse to ship something absurd

// Rows the snapshot must NOT contain:
//   backup:*      — a snapshot must never contain snapshots. Without this, day 2
//                   holds day 1, day 3 holds both... it explodes within a week.
//   run:inbox     — the courier's transient buffer: base64 FIT files, up to 4MB
//                   EACH, 20 buffered. It is a delivery queue, not data. Including
//                   it could turn a ~1MB backup into ~80MB.
// (run:inbox-ack IS kept — it's a tiny id list, and losing it could re-import
//  Chrissie's runs as duplicates.)
//   als-full-backup — the old one-tap "cloud snapshot" row. It is ITSELF a full
//                   copy of every localStorage key, so including it stored a
//                   second, staler copy of everything inside each snapshot —
//                   roughly HALVING the useful size. It is a backup, not data.
//                   (The row itself is left alone; it just isn't re-backed-up.)
//   __test__ / __sync_test__ — connectivity-probe junk.
function isExcluded(key) {
  if (!key) return true;
  if (key.indexOf('backup:') === 0) return true;
  if (key === 'run:inbox') return true;
  if (key === 'als-full-backup') return true;
  if (key.indexOf('__') === 0) return true;
  return false;
}

function ymd(d) { return new Date(d).toISOString().slice(0, 10); }

// A human-countable census of a snapshot: "412 workouts, 1203 meals".
// Generic on purpose — it works for keys that don't exist yet.
function census(rows) {
  var out = {};
  Object.keys(rows).forEach(function (k) {
    var v = rows[k], n = 0;
    if (Array.isArray(v)) n = v.length;
    else if (v && typeof v === 'object') {
      Object.keys(v).forEach(function (c) {
        var child = v[c];
        if (Array.isArray(child)) n += child.length;
        else if (child && typeof child === 'object') n += Object.keys(child).length;
        else n += 1;
      });
    } else if (v != null) n = 1;
    if (n) out[k] = n;
  });
  return out;
}
function total(c) { return Object.keys(c).reduce(function (s, k) { return s + c[k]; }, 0); }

// ── GitHub: one commit per day, forever ───────────────────────────
async function ghPut(path, contentB64, message) {
  var repo = (process.env.GITHUB_BACKUP_REPO || '').trim();
  var token = (process.env.GITHUB_TOKEN || '').trim();
  if (!repo || !token) return { skipped: 'github not configured' };

  var url = 'https://api.github.com/repos/' + repo + '/contents/' + path;
  var h = {
    Authorization: 'Bearer ' + token,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
    'User-Agent': 'aurora-vault'
  };
  // Same-day re-run overwrites that day's file, so we need its blob sha.
  var sha = null;
  try {
    var g = await fetch(url, { headers: h });
    if (g.ok) { var gj = await g.json(); sha = gj && gj.sha ? gj.sha : null; }
  } catch (e) {}

  var body = { message: message, content: contentB64 };
  if (sha) body.sha = sha;
  try {
    var r = await fetch(url, { method: 'PUT', headers: h, body: JSON.stringify(body) });
    if (!r.ok) {
      var txt = '';
      try { txt = (await r.text()).slice(0, 180); } catch (e) {}
      return { error: 'github ' + r.status + ' ' + txt };
    }
    var j = await r.json();
    return { ok: true, sha: (j && j.content && j.content.sha) || null };
  } catch (e) { return { error: 'github ' + String((e && e.message) || e) }; }
}

// ── the run ───────────────────────────────────────────────────────
// force=true re-runs even if today is already done (the app's "Back up now").
async function runBackup(opts) {
  var force = !!(opts && opts.force);
  var index = await supa.readRow('backup:index');
  var days = Array.isArray(index.days) ? index.days.slice() : [];
  var today = ymd(Date.now());

  if (!force && index.lastDate === today) {
    return { skipped: 'already backed up today', lastDate: index.lastDate, days: days.length };
  }

  var all = await supa.readAllRows();
  // HARD SAFETY: a failed read must never be written as an empty snapshot. An
  // empty backup that someone later restores would erase everything.
  if (all === null) return { error: 'could not read app_state — nothing written' };
  if (!all.length) return { error: 'app_state returned 0 rows — refusing to write an empty snapshot' };

  var rows = {};
  all.forEach(function (r) { if (r && r.key && !isExcluded(r.key)) rows[r.key] = r.data; });
  var keyCount = Object.keys(rows).length;
  if (!keyCount) return { error: 'no backupable rows — refusing to write an empty snapshot' };

  var snap = { v: 1, takenAt: new Date().toISOString(), date: today, source: 'vault', rows: rows };
  var counts = census(rows);
  snap.counts = counts;

  var json = JSON.stringify(snap);
  var bytes = Buffer.byteLength(json, 'utf8');
  if (bytes > MAX_BYTES) return { error: 'snapshot too large (' + bytes + ' bytes) — not written' };

  // Did the account suddenly shrink? Never blocks the backup (history is
  // append-only and more history is always better) — but it's recorded so the
  // app can flag it, which is how you CATCH a corruption instead of burying it.
  var prev = days.length ? days[days.length - 1] : null;
  var prevTotal = prev && prev.records ? prev.records : 0;
  var nowTotal = total(counts);
  var shrank = prevTotal > 0 && nowTotal < prevTotal * 0.5;

  // 1) GitHub — the permanent, off-site, immutable copy.
  var gh = await ghPut(
    'backups/' + today + '.json',
    Buffer.from(json, 'utf8').toString('base64'),
    'backup ' + today + ' · ' + keyCount + ' keys · ' + nowTotal + ' records'
  );

  // 2) Supabase — the last KEEP_DAYS, for instant in-app rollback.
  await supa.writeRow('backup:snap:' + today, snap);

  days = days.filter(function (d) { return d && d.date !== today; });
  days.push({
    date: today, at: snap.takenAt, bytes: bytes, keys: keyCount, records: nowTotal,
    counts: counts, github: gh.ok ? (gh.sha || 'ok') : null,
    githubError: gh.error || gh.skipped || null,
    shrank: shrank || undefined
  });
  days.sort(function (a, b) { return a.date < b.date ? -1 : 1; });

  // Prune Supabase copies beyond the window. GitHub history is never pruned.
  var drop = days.length > KEEP_DAYS ? days.slice(0, days.length - KEEP_DAYS) : [];
  for (var i = 0; i < drop.length; i++) await supa.deleteRow('backup:snap:' + drop[i].date);
  var kept = days.slice(-KEEP_DAYS);

  await supa.writeRow('backup:index', {
    lastDate: today, lastAt: snap.takenAt, lastBytes: bytes, lastRecords: nowTotal,
    lastGithub: gh.ok ? (gh.sha || 'ok') : null, lastGithubError: gh.error || gh.skipped || null,
    days: kept
  });

  return {
    ok: true, date: today, keys: keyCount, records: nowTotal, bytes: bytes,
    github: gh.ok ? 'committed' : (gh.error || gh.skipped), shrank: shrank,
    pruned: drop.length, window: kept.length
  };
}

module.exports = { runBackup: runBackup, census: census, isExcluded: isExcluded, KEEP_DAYS: KEEP_DAYS };
