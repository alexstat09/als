// Sends a Web Push to one subscription. Called by QStash at the rest end-time
// (or directly). The subscription is passed in the body, so no DB is needed.
const webpush = require('web-push');

function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  try { return JSON.parse(req.body || '{}'); } catch (e) { return {}; }
}

module.exports = async function (req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'POST only' }); return; }
  try {
    const body = readBody(req);
    const sub = body.subscription;
    if (!sub || !sub.endpoint) { res.status(400).json({ error: 'no subscription' }); return; }
    if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
      res.status(200).json({ error: 'VAPID not configured' }); return;
    }
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || 'mailto:nobody@example.com',
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
    const payload = JSON.stringify({
      title: body.title || 'ALS Dashboard',
      body: body.body || '',
      tag: body.tag || 'als'
    });
    await webpush.sendNotification(sub, payload);
    res.status(200).json({ sent: true });
  } catch (e) {
    // 200 so QStash doesn't retry-storm on a dead subscription
    res.status(200).json({ error: String((e && e.message) || e) });
  }
};
