// Cancels a scheduled rest push (when you come back to the app before the
// timer ends) by deleting the QStash message.
function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  try { return JSON.parse(req.body || '{}'); } catch (e) { return {}; }
}

module.exports = async function (req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'POST only' }); return; }
  try {
    const body = readBody(req);
    const id = body.messageId;
    const token = process.env.QSTASH_TOKEN;
    if (!id || !token) { res.status(200).json({ skipped: true }); return; }
    const qstash = (process.env.QSTASH_URL || 'https://qstash.upstash.io').replace(/\/+$/, '');
    await fetch(qstash + '/v2/messages/' + encodeURIComponent(id), {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + token }
    });
    res.status(200).json({ cancelled: true });
  } catch (e) {
    res.status(200).json({ error: String((e && e.message) || e) });
  }
};
