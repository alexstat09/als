'use strict';
// ════════════════════════════════════════════════════════════════
// Price courier for the Money page's practice portfolio.
// `_` prefix = NOT a routed function (free), called by run-reminders.js:
//   ?prices        → live EUR prices for the curated instrument list
//
// Everything here is free and key-less, which is the whole constraint:
//   • CoinGecko  /simple/price      → crypto, quoted directly in EUR
//   • Yahoo      /v8/finance/chart  → UCITS ETFs listed on XETRA, already EUR
// Both are quoted in EUR at source, so there is no FX conversion to get wrong.
//
// The instrument list is CURATED and closed. This is a 17-year-old learning
// how markets feel, not a brokerage: a fixed set of broad index funds, gold and
// the two largest coins is enough to teach volatility and patience, and it means
// every symbol here is one we have actually verified resolves. An open ticker
// box would invite penny stocks and meme coins, which teach the opposite lesson.
// ════════════════════════════════════════════════════════════════

var UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

// id → what it is. `kind` decides which upstream answers for it.
var INSTRUMENTS = [
  { id: 'VWCE.DE', kind: 'etf',    name: 'FTSE All-World',  blurb: 'Every big company on earth, in one holding' },
  { id: 'EUNL.DE', kind: 'etf',    name: 'MSCI World',      blurb: 'The developed world’s largest companies' },
  { id: 'SXR8.DE', kind: 'etf',    name: 'S&P 500',         blurb: 'The 500 biggest companies in America' },
  { id: '4GLD.DE', kind: 'etf',    name: 'Gold',            blurb: 'Physical gold, held for you in Frankfurt' },
  { id: 'bitcoin', kind: 'crypto', name: 'Bitcoin',         blurb: 'The original crypto — and the most volatile thing here' },
  { id: 'ethereum',kind: 'crypto', name: 'Ethereum',        blurb: 'The second largest crypto' }
];

async function cryptoPrices(ids) {
  if (!ids.length) return {};
  var u = 'https://api.coingecko.com/api/v3/simple/price?ids=' + encodeURIComponent(ids.join(',')) +
    '&vs_currencies=eur&include_24hr_change=true';
  var r = await fetch(u, { headers: { 'User-Agent': UA, 'Accept': 'application/json' } });
  if (!r.ok) throw new Error('coingecko ' + r.status);
  var j = await r.json();
  var out = {};
  ids.forEach(function (id) {
    var row = j[id];
    if (row && typeof row.eur === 'number') out[id] = { eur: row.eur, chg: +row.eur_24h_change || 0 };
  });
  return out;
}

// One ETF. Yahoo's chart endpoint carries both the live price and the previous
// close, so the day's move needs no second request.
async function etfPrice(sym) {
  var u = 'https://query1.finance.yahoo.com/v8/finance/chart/' + encodeURIComponent(sym) + '?range=5d&interval=1d';
  var r = await fetch(u, { headers: { 'User-Agent': UA, 'Accept': 'application/json' } });
  if (!r.ok) throw new Error('yahoo ' + r.status);
  var j = await r.json();
  var meta = j && j.chart && j.chart.result && j.chart.result[0] && j.chart.result[0].meta;
  if (!meta || typeof meta.regularMarketPrice !== 'number') return null;
  // Guard the currency: these are XETRA lines quoted in EUR, and silently
  // returning a USD number as if it were EUR would corrupt every holding.
  if (meta.currency && String(meta.currency).toUpperCase() !== 'EUR') return null;
  var prev = (typeof meta.chartPreviousClose === 'number') ? meta.chartPreviousClose
           : (typeof meta.previousClose === 'number') ? meta.previousClose : 0;
  var chg = prev ? ((meta.regularMarketPrice - prev) / prev) * 100 : 0;
  return { eur: meta.regularMarketPrice, chg: chg };
}

/* Live EUR prices for every curated instrument. A failure on one upstream must
   not blank the other: crypto and ETFs are fetched independently, and anything
   that doesn't resolve is simply ABSENT from the map. The page renders a holding
   with no price as "price unavailable" rather than as zero — a missing quote is
   not a value of nothing, and pretending otherwise would show him a portfolio
   that had apparently gone to zero overnight. */
async function prices() {
  var cryptoIds = INSTRUMENTS.filter(function (i) { return i.kind === 'crypto'; }).map(function (i) { return i.id; });
  var etfIds    = INSTRUMENTS.filter(function (i) { return i.kind === 'etf'; }).map(function (i) { return i.id; });

  var results = await Promise.allSettled([
    cryptoPrices(cryptoIds),
    Promise.allSettled(etfIds.map(function (s) { return etfPrice(s); }))
  ]);

  var map = {};
  if (results[0].status === 'fulfilled') Object.assign(map, results[0].value);
  if (results[1].status === 'fulfilled') {
    results[1].value.forEach(function (res, i) {
      if (res.status === 'fulfilled' && res.value) map[etfIds[i]] = res.value;
    });
  }
  return { instruments: INSTRUMENTS, prices: map, ts: Date.now() };
}

module.exports = { prices: prices, INSTRUMENTS: INSTRUMENTS };
