// Diagnoses the configured VAPID public key and generates a valid replacement
// pair (using the web-push lib already installed here). A browser's
// applicationServerKey must be the raw 65-byte uncompressed P-256 point
// (base64url). Keys made with openssl/PEM decode to a different length and get
// rejected with "applicationServerKey must contain a valid P-256 public key".
// Open this once to confirm the problem and copy a known-good pair into Vercel.
'use strict';
var webpush = require('web-push');

function decodedBytes(s) {
  try {
    s = (s || '').trim().replace(/-/g, '+').replace(/_/g, '/');
    var pad = '='.repeat((4 - (s.length % 4)) % 4);
    return Buffer.from(s + pad, 'base64').length;
  } catch (e) { return -1; }
}

module.exports = function (req, res) {
  res.setHeader('Cache-Control', 'no-store');
  var cur = process.env.VAPID_PUBLIC_KEY || '';
  var len = decodedBytes(cur);
  var valid = (len === 65);

  var fresh = {};
  try { fresh = webpush.generateVAPIDKeys(); } catch (e) { fresh = { error: String((e && e.message) || e) }; }

  res.status(200).json({
    current_public_key: cur,
    current_decoded_bytes: len,
    current_valid_p256: valid,
    diagnosis: valid
      ? 'Your VAPID public key looks valid (decodes to 65 bytes). The subscribe error is elsewhere.'
      : 'Your VAPID public key is INVALID for browsers (should decode to 65 bytes, got ' + len + '). Replace both env vars with the fresh pair below, then redeploy.',
    fresh_public_key: fresh.publicKey || null,
    fresh_private_key: fresh.privateKey || null,
    how_to_fix: 'Vercel ▸ als ▸ Settings ▸ Environment Variables (Production): set VAPID_PUBLIC_KEY = fresh_public_key and VAPID_PRIVATE_KEY = fresh_private_key (keep VAPID_SUBJECT). Then Redeploy.'
  });
};
