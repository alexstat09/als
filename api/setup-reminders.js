// Idempotently ensures an hourly QStash schedule exists that calls
// /api/run-reminders. Called automatically the first time the user turns on
// reminders (and safe to hit again — it won't create duplicates). The hourly
// run is cheap: it computes the user's local hour and only acts when a
// reminder is actually due.
//
// If CRON_SECRET is set, the schedule is registered with an
// Upstash-Forward-Authorization header so /api/run-reminders can tell a real
// cron call from a stranger. Hit with ?force=1 once after FIRST setting
// CRON_SECRET to replace an old (header-less) schedule.
'use strict';
var auth = require('./_auth');
module.exports = async function (req, res) {
  if (!auth.guard(req, res, { name: 'setup-rem' })) return;
  try {
    var token = process.env.QSTASH_TOKEN;
    if (!token) { res.status(200).json({ ok: false, error: 'QStash not configured' }); return; }

    var host = req.headers['x-forwarded-host'] || req.headers.host;
    var proto = req.headers['x-forwarded-proto'] || 'https';
    var dest = proto + '://' + host + '/api/run-reminders';
    var qstash = (process.env.QSTASH_URL || 'https://qstash.upstash.io').replace(/\/+$/, '');
    var cronSecret = (process.env.CRON_SECRET || '').trim();

    var force = false;
    try { force = new URL(req.url, 'http://x').searchParams.get('force') === '1'; } catch (e) {}

    // Already scheduled? Don't create a second one (unless force-replacing to
    // pick up the new forwarded auth header).
    var listR = await fetch(qstash + '/v2/schedules', { headers: { Authorization: 'Bearer ' + token } });
    var list = await listR.json().catch(function () { return []; });
    var existing = Array.isArray(list) ? list.filter(function (s) {
      return s && s.destination && s.destination.indexOf('/api/run-reminders') !== -1;
    }) : [];
    if (existing.length && !force) { res.status(200).json({ ok: true, status: 'already scheduled', scheduleId: existing[0].scheduleId, cron: existing[0].cron }); return; }

    // CREATE FIRST, delete the old one only once the replacement exists.
    // The old order (delete → create) left the account with NO schedule at all
    // when the create failed — no reminders, no nightly Vault backup, and a
    // response that just said "failed" without saying why.
    var schedHeaders = { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json', 'Upstash-Cron': '0 * * * *' };
    if (cronSecret) schedHeaders['Upstash-Forward-Authorization'] = 'Bearer ' + cronSecret;

    // The destination goes on the path RAW — QStash parses it as a URL.
    // encodeURIComponent turned it into https%3A%2F%2F… and QStash rejected it
    // with "endpoint has invalid scheme". (Only the scheduleId gets encoded.)
    var r = await fetch(qstash + '/v2/schedules/' + dest, {
      method: 'POST',
      headers: schedHeaders,
      body: '{}'
    });
    var raw = await r.text();
    var j = {}; try { j = JSON.parse(raw); } catch (e) {}

    if (!r.ok) {
      // Surface QStash's actual complaint — a silent "failed" is unfixable.
      res.status(200).json({
        ok: false, status: 'failed', secured: !!cronSecret, scheduleId: null,
        qstashStatus: r.status,
        qstashError: String(raw || '').slice(0, 300),
        keptExisting: existing.length,          // the old schedule is still alive
        hint: existing.length ? 'Your previous schedule was NOT deleted — reminders still run.' : 'No schedule exists yet.'
      });
      return;
    }

    // New one is live → now retire the old ones.
    for (var i = 0; i < existing.length; i++) {
      if (existing[i].scheduleId === j.scheduleId) continue;
      try { await fetch(qstash + '/v2/schedules/' + encodeURIComponent(existing[i].scheduleId), { method: 'DELETE', headers: { Authorization: 'Bearer ' + token } }); } catch (e) {}
    }
    res.status(200).json({ ok: true, status: force ? 're-scheduled hourly' : 'scheduled hourly', secured: !!cronSecret, scheduleId: j.scheduleId || null, replaced: existing.length });
  } catch (e) {
    res.status(200).json({ ok: false, error: String((e && e.message) || e) });
  }
};
