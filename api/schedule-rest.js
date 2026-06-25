// Schedules a delayed Web Push for when the rest timer ends, using QStash
// (Upstash) to call /api/fire-push at the right second — works even when the
// app is fully closed. Returns the QStash messageId so the client can cancel.
const auth = require('./_auth');

function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  try { return JSON.parse(req.body || '{}'); } catch (e) { return {}; }
}

module.exports = async function (req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'POST only' }); return; }
  if (!auth.guard(req, res, { name: 'sched-rest' })) return;
  try {
    const body = readBody(req);
    const subscription = body.subscription;
    const endAt = +body.endAt || 0;
    if (!subscription || !endAt) { res.status(400).json({ error: 'missing subscription/endAt' }); return; }

    const token = process.env.QSTASH_TOKEN;
    if (!token) { res.status(200).json({ skipped: 'QStash not configured' }); return; }

    const delaySec = Math.max(1, Math.round((endAt - Date.now()) / 1000));
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const dest = proto + '://' + host + '/api/fire-push';
    const qstash = (process.env.QSTASH_URL || 'https://qstash.upstash.io').replace(/\/+$/, '');

    // Headers QStash receives (auth = QStash token) + headers it FORWARDS to the
    // destination (Upstash-Forward-*). The forwarded bearer is how /api/fire-push
    // recognises a legit cron call vs. a stranger once CRON_SECRET is set.
    const pubHeaders = {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json',
      'Upstash-Delay': delaySec + 's'
    };
    const cronSecret = (process.env.CRON_SECRET || '').trim();
    if (cronSecret) pubHeaders['Upstash-Forward-Authorization'] = 'Bearer ' + cronSecret;

    const r = await fetch(qstash + '/v2/publish/' + encodeURIComponent(dest), {
      method: 'POST',
      headers: pubHeaders,
      body: JSON.stringify({
        subscription: subscription,
        title: body.title || 'Rest complete 💪',
        body: body.body || 'Time for your next set.',
        tag: 'als-rest'
      })
    });
    const j = await r.json().catch(function () { return {}; });
    res.status(200).json({ messageId: j.messageId || null });
  } catch (e) {
    res.status(200).json({ error: String((e && e.message) || e) });
  }
};
