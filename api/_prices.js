'use strict';
// ════════════════════════════════════════════════════════════════
// Price courier for the Money page's practice portfolio.
// `_` prefix = NOT a routed function (free), called by run-reminders.js:
//   ?prices        → live EUR prices for the curated instrument list
//
// CoinGecko's /simple/price, quoted directly in EUR so there is no FX
// conversion to get wrong. Free, key-less, and it answers servers.
//
// ⚠️ EQUITY PRICES ARE DELIBERATELY ABSENT. Yahoo's chart endpoint serves the
// XETRA UCITS lines beautifully to a browser and refuses a server: an identical
// request with a browser user-agent returns 200 from curl and 429 from Node, and
// deployed to Vercel it returned 0 of 4 while crypto returned 2 of 2. It is
// fingerprinting the client, not rate-limiting the volume. Fetching them anyway
// would add four guaranteed-failing round trips to every request.
//
// So the Money page teaches long-run behaviour from REAL CLOSING PRICES embedded
// in the page itself, which cannot break, and uses this endpoint only for the
// live crypto strip. If a free server-friendly equity source ever appears, add
// it here — but never let the page's central lesson depend on it again.
// ════════════════════════════════════════════════════════════════

// id → what it is.
var INSTRUMENTS = [
  { id: 'bitcoin',  kind: 'crypto', name: 'Bitcoin',  blurb: 'The original crypto — and the most volatile thing here' },
  { id: 'ethereum', kind: 'crypto', name: 'Ethereum', blurb: 'The second largest crypto' }
];

async function cryptoPrices(ids) {
  if (!ids.length) return {};
  var u = 'https://api.coingecko.com/api/v3/simple/price?ids=' + encodeURIComponent(ids.join(',')) +
    '&vs_currencies=eur&include_24hr_change=true';
  var r = await fetch(u, { headers: { 'Accept': 'application/json' } });
  if (!r.ok) throw new Error('coingecko ' + r.status);
  var j = await r.json();
  var out = {};
  ids.forEach(function (id) {
    var row = j[id];
    if (row && typeof row.eur === 'number') out[id] = { eur: row.eur, chg: +row.eur_24h_change || 0 };
  });
  return out;
}

/* Live EUR prices for the curated list. */
async function prices() {
  var ids = INSTRUMENTS.map(function (i) { return i.id; });
  var map = {};
  // A failure here must leave the map EMPTY, never zeroed: the page renders a
  // missing quote as "unavailable" rather than as a value of nothing.
  try { map = await cryptoPrices(ids); } catch (e) { map = {}; }
  return { instruments: INSTRUMENTS, prices: map, ts: Date.now() };
}

module.exports = { prices: prices, INSTRUMENTS: INSTRUMENTS };
