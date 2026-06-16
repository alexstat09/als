// Idempotently ensures an hourly QStash schedule exists that calls
// /api/run-reminders. Called automatically the first time the user turns on
// reminders (and safe to hit again — it won't create duplicates). The hourly
// run is cheap: it computes the user's local hour and only acts when a
// reminder is actually due.
'use strict';
module.exports = async function (req, res) {
  try {
    var token = process.env.QSTASH_TOKEN;
    if (!token) { res.status(200).json({ ok: false, error: 'QStash not configured' }); return; }

    var host = req.headers['x-forwarded-host'] || req.headers.host;
    var proto = req.headers['x-forwarded-proto'] || 'https';
    var dest = proto + '://' + host + '/api/run-reminders';
    var qstash = (process.env.QSTASH_URL || 'https://qstash.upstash.io').replace(/\/+$/, '');

    // Already scheduled? Don't create a second one.
    var listR = await fetch(qstash + '/v2/schedules', { headers: { Authorization: 'Bearer ' + token } });
    var list = await listR.json().catch(function () { return []; });
    var existing = Array.isArray(list) ? list.filter(function (s) {
      return s && s.destination && s.destination.indexOf('/api/run-reminders') !== -1;
    }) : [];
    if (existing.length) { res.status(200).json({ ok: true, status: 'already scheduled', scheduleId: existing[0].scheduleId, cron: existing[0].cron }); return; }

    var r = await fetch(qstash + '/v2/schedules/' + encodeURIComponent(dest), {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json', 'Upstash-Cron': '0 * * * *' },
      body: '{}'
    });
    var j = await r.json().catch(function () { return {}; });
    res.status(200).json({ ok: r.ok, status: r.ok ? 'scheduled hourly' : 'failed', scheduleId: j.scheduleId || null });
  } catch (e) {
    res.status(200).json({ ok: false, error: String((e && e.message) || e) });
  }
};
