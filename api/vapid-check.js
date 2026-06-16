// Diagnoses the configured VAPID public key and generates a valid replacement
// pair (using the web-push lib already installed here). A browser's
// applicationServerKey must be the raw 65-byte uncompressed P-256 point
// (base64url). Keys made with openssl/PEM decode to a different length and get
// rejected with "applicationServerKey must contain a valid P-256 public key".
// Open this once to confirm the problem and copy a known-good pair into Vercel.
'use strict';
var webpush = require('web-push');
var crypto = require('crypto');

function b64uToBuf(s) {
  s = (s || '').trim().replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(s + '='.repeat((4 - (s.length % 4)) % 4), 'base64');
}
function bufToB64u(b) {
  return b.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function decodedBytes(s) { try { return b64uToBuf(s).length; } catch (e) { return -1; } }

// Derive the public key the private key actually belongs to, so we can tell if
// the configured pair matches (a mismatch passes browser subscribe but fails
// to send — exactly the "test nudge won't send" symptom).
function derivePublic(privB64u) {
  try {
    var ecdh = crypto.createECDH('prime256v1');
    ecdh.setPrivateKey(b64uToBuf(privB64u));
    return bufToB64u(ecdh.getPublicKey());
  } catch (e) { return null; }
}

module.exports = function (req, res) {
  res.setHeader('Cache-Control', 'no-store');
  var cur = process.env.VAPID_PUBLIC_KEY || '';
  var priv = process.env.VAPID_PRIVATE_KEY || '';
  var subject = process.env.VAPID_SUBJECT || '';
  var len = decodedBytes(cur);
  var valid = (len === 65);
  var derived = derivePublic(priv);
  var keysMatch = !!derived && derived === cur;
  var subjectOk = /^mailto:.+@.+/.test(subject) || /^https?:\/\//.test(subject);

  var fresh = {};
  try { fresh = webpush.generateVAPIDKeys(); } catch (e) { fresh = { error: String((e && e.message) || e) }; }

  var diagnosis;
  if (!valid) diagnosis = 'Public key is INVALID for browsers (should decode to 65 bytes, got ' + len + '). Use the fresh pair below.';
  else if (!derived) diagnosis = 'Private key is missing or unreadable — set VAPID_PRIVATE_KEY (use the fresh pair below, set BOTH).';
  else if (!keysMatch) diagnosis = 'Public and private keys DO NOT MATCH — that is why the test nudge fails to send. Set BOTH from the same fresh pair below, then redeploy.';
  else if (!subjectOk) diagnosis = 'Keys match, but VAPID_SUBJECT is missing/invalid — set it to mailto:astathatos09@gmail.com, then redeploy.';
  else diagnosis = 'Everything checks out: public key valid, pair matches, subject ok. Push should send.';

  res.status(200).json({
    current_public_key: cur,
    current_decoded_bytes: len,
    current_valid_p256: valid,
    private_key_present: !!priv,
    keys_match: keysMatch,
    subject: subject,
    subject_ok: subjectOk,
    diagnosis: diagnosis,
    fresh_public_key: fresh.publicKey || null,
    fresh_private_key: fresh.privateKey || null,
    how_to_fix: 'Vercel ▸ als ▸ Settings ▸ Environment Variables (Production): set VAPID_PUBLIC_KEY = fresh_public_key AND VAPID_PRIVATE_KEY = fresh_private_key from the SAME response here, keep VAPID_SUBJECT, then Redeploy. After redeploy, re-toggle reminders on your phone so it re-subscribes to the new key.'
  });
};
