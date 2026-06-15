// Returns the public VAPID key so the client can subscribe to push.
// Public by design — safe to expose.
module.exports = function (req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ key: process.env.VAPID_PUBLIC_KEY || '' });
};
