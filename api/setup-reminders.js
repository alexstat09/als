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
    if (existing.length && force) {
      for (var i = 0; i < existing.length; i++) {
        try { await fetch(qstash + '/v2/schedules/' + encodeURIComponent(existing[i].scheduleId), { method: 'DELETE', headers: { Authorization: 'Bearer ' + token } }); } catch (e) {}
      }
    }

    var schedHeaders = { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json', 'Upstash-Cron': '0 * * * *' };
    if (cronSecret) schedHeaders['Upstash-Forward-Authorization'] = 'Bearer ' + cronSecret;

    var r = await fetch(qstash + '/v2/schedules/' + encodeURIComponent(dest), {
      method: 'POST',
      headers: schedHeaders,
      body: '{}'
    });
    var j = await r.json().catch(function () { return {}; });
    res.status(200).json({ ok: r.ok, status: r.ok ? (force ? 're-scheduled hourly' : 'scheduled hourly') : 'failed', secured: !!cronSecret, scheduleId: j.scheduleId || null });
  } catch (e) {
    res.status(200).json({ ok: false, error: String((e && e.message) || e) });
  }
};
