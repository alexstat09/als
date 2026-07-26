// ════════════════════════════════════════════════════════════════
// Does this nutrition data survive contact with reality?
//
// The old check was one line: Atwater ±20%. A live lookup for a Born Winner bar
// returned 400 kcal / 40 p / 40 c / 14 f with confidence 1.0 — numbers that
// appear on no label anywhere. Atwater says 446, inside tolerance, so it passed
// and went straight into the diary. Self-consistent is not the same as TRUE.
//
// Three independent tests, because a fabrication usually passes one of them:
//   1. GROUNDING — does the number literally appear in the page we read?
//      A model cannot cite a source for something it invented.
//   2. INTERNAL   — Atwater, and the arithmetic a real label must satisfy
//      (sugar ⊆ carbs, satfat ⊆ fat, P+C+F ≤ 100 g per 100 g).
//   3. PRIOR      — is this plausible for this KIND of food at all?
//      (a fried cheese pie is never 60 kcal/100g)
//
// Nothing here throws. Everything downgrades: a failed test costs confidence
// and, past a threshold, the right to call itself "confirmed". Silent-empty is
// this project's disease, and its cousin is silent-confident.
// ════════════════════════════════════════════════════════════════
'use strict';
var KNOW = require('./_food-know.js');

function num(v, max) {
  var n = typeof v === 'number' ? v : parseFloat(v);
  if (!isFinite(n) || n < 0) n = 0;
  if (max != null && n > max) n = max;
  return Math.round(n * 10) / 10;
}

// ── 1. GROUNDING ─────────────────────────────────────────────────
// Did this number come from the retrieved text, or from the model's memory?
// We look for the digits in the evidence, tolerating the ways a label writes
// them: "12.5" / "12,5" / "12.50" / "13" (rounded) and kJ for kcal.
function appearsIn(value, evidence) {
  if (!(value > 0)) return true;                 // a zero claims nothing
  var hay = String(evidence || '');
  if (!hay) return false;
  var cands = {};
  var v = Math.round(value * 10) / 10;
  cands[String(v)] = 1;
  cands[String(Math.round(v))] = 1;
  cands[v.toFixed(1)] = 1;
  cands[String(v).replace('.', ',')] = 1;
  cands[v.toFixed(1).replace('.', ',')] = 1;
  if (v >= 10) { cands[String(Math.round(v / 10) * 10)] = 1; }   // "180" for 178
  var kj = Math.round(v * 4.184);                                 // energy is often only in kJ
  cands[String(kj)] = 1; cands[String(Math.round(kj / 10) * 10)] = 1;
  var keys = Object.keys(cands);
  for (var i = 0; i < keys.length; i++) {
    if (!keys[i] || keys[i] === '0') continue;
    // digit-boundary match so "45" doesn't match inside "1450"
    var re = new RegExp('(^|[^\\d.,])' + keys[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '([^\\d]|$)');
    if (re.test(hay)) return true;
  }
  return false;
}

// How much of the label is actually traceable to the evidence we retrieved?
function grounding(per100, evidence) {
  var checked = 0, found = 0, missing = [];
  [['kcal', per100.kcal], ['p', per100.p], ['c', per100.c], ['f', per100.f]].forEach(function (pair) {
    if (!(pair[1] > 0)) return;
    checked++;
    if (appearsIn(pair[1], evidence)) found++; else missing.push(pair[0]);
  });
  return { checked: checked, found: found, missing: missing, ratio: checked ? found / checked : 0 };
}

// ── 2. INTERNAL consistency ──────────────────────────────────────
function internal(per100) {
  var P = num(per100.p), C = num(per100.c), F = num(per100.f), K = num(per100.kcal);
  var fib = num(per100.fiber), sug = num(per100.sugar), sat = num(per100.satfat), na = num(per100.sodium);
  var flags = [];

  // Atwater, corrected for fibre (largely indigestible) — same convention the
  // core-DB harness already uses, so the two agree with each other.
  var atwater = 4 * P + 4 * C + 9 * F - 2 * fib;
  var kcalOff = 0;
  if (P + C + F > 0) {
    kcalOff = Math.abs(K - atwater);
    if (kcalOff > Math.max(35, 0.15 * Math.max(atwater, 1))) flags.push('energy disagrees with the macros');
  }
  // A label's own arithmetic. "of which sugars" is a SUBSET of carbohydrate;
  // "of which saturates" a subset of fat. Violations mean it was not read.
  if (sug > C + 0.5) flags.push('sugars exceed carbohydrate');
  if (fib > C + 25) flags.push('fibre exceeds carbohydrate');
  if (sat > F + 0.5) flags.push('saturates exceed fat');
  if (P + C + F > 101) flags.push('macros exceed 100 g per 100 g');
  if (K > 902) flags.push('energy above pure fat');
  if (na > 15000) flags.push('implausible sodium');
  if (P > 92 || C > 100 || F > 100) flags.push('a single macro is out of range');

  return { flags: flags, atwater: Math.round(atwater), kcalOff: Math.round(kcalOff) };
}

// ── 3. CATEGORY prior ────────────────────────────────────────────
function prior(name, per100) {
  var cat = KNOW.categoryPrior(name);
  if (!cat) return { flags: [], cat: null };
  var K = num(per100.kcal);
  if (!(K > 0)) return { flags: [], cat: cat };
  // generous margin — priors exist to catch a different FOOD, not a variant
  var lo = cat.lo * 0.6, hi = cat.hi * 1.4;
  if (K < lo || K > hi) {
    return { flags: ['at ' + Math.round(K) + ' kcal/100g this is outside the normal range for ' + cat.name + ' (' + cat.lo + '–' + cat.hi + ')'], cat: cat };
  }
  return { flags: [], cat: cat };
}

// ── consensus across independent sources ─────────────────────────
// Two sources that never spoke to each other landing within 12% is the
// strongest signal available without holding the physical package.
function consensus(cands) {
  var ok = (cands || []).filter(function (c) { return c && c.per100 && c.per100.kcal > 0; });
  if (ok.length < 2) return { agree: 0, spread: null, best: ok[0] || null };
  // ⚠️ NOT `a.tier || 9` — tier 0 is the manufacturer, the BEST source, and it
  // is falsy, so that idiom sorts the most trustworthy result to last.
  var tierOf = function (x) { return typeof x.tier === 'number' ? x.tier : 9; };
  var sorted = ok.slice().sort(function (a, b) { return tierOf(a) - tierOf(b); });
  var ref = sorted[0].per100.kcal, agree = 1;
  for (var i = 1; i < sorted.length; i++) {
    if (Math.abs(sorted[i].per100.kcal - ref) <= Math.max(12, 0.12 * ref)) agree++;
  }
  var vals = ok.map(function (c) { return c.per100.kcal; });
  var spread = Math.max.apply(null, vals) - Math.min.apply(null, vals);
  return { agree: agree, spread: Math.round(spread), best: sorted[0] };
}

/* The whole verdict in one call.
   Returns { confidence, confirmed, why[], per100 } — `why` is written for a
   HUMAN to read on the card, because a number you cannot question is worse
   than one you can. */
function verify(opts) {
  var per100 = opts.per100 || {};
  var evidence = opts.evidence || '';
  var name = opts.name || '';
  var tier = typeof opts.tier === 'number' ? opts.tier : 4;
  var agree = opts.agree || 1;

  var g = grounding(per100, evidence);
  var iv = internal(per100);
  var pv = prior(name, per100);
  var why = [];
  var conf = 0.5;

  // grounding dominates: it is the only test a fabrication cannot fake
  if (g.checked === 0) { conf = 0.35; why.push('no numbers to verify'); }
  else if (g.ratio === 1) { conf = 0.9; }
  else if (g.ratio >= 0.5) { conf = 0.6; why.push('only part of the label is traceable to the source (' + g.missing.join(', ') + ' not found in the page)'); }
  else { conf = 0.3; why.push('these numbers do not appear in the page they are credited to'); }

  // source quality
  if (tier === 0) conf += 0.06;
  else if (tier === 1) conf += 0.04;
  else if (tier >= 4) { conf -= 0.15; why.push('the only source is an unrecognised site'); }

  if (agree >= 3) { conf += 0.1; }
  else if (agree === 2) { conf += 0.07; }

  iv.flags.forEach(function (f) { why.push(f); });
  if (iv.flags.length) conf -= 0.15 * iv.flags.length;

  pv.flags.forEach(function (f) { why.push(f); });
  if (pv.flags.length) conf -= 0.25;

  conf = Math.max(0.05, Math.min(0.98, Math.round(conf * 100) / 100));

  // "Confirmed" is a promise about the WORLD, not about the model's mood, so
  // it needs real grounding, a source allowed to confirm, and clean arithmetic.
  var confirmed = g.ratio >= 0.75 && KNOW.canConfirmAlone(tier) && iv.flags.length === 0 && pv.flags.length === 0;
  if (!confirmed && agree >= 2 && g.ratio >= 0.5 && iv.flags.length === 0 && pv.flags.length === 0) confirmed = true;

  return { confidence: conf, confirmed: confirmed, why: why, grounding: g, internal: iv, prior: pv };
}

module.exports = { verify: verify, grounding: grounding, internal: internal, prior: prior, consensus: consensus, appearsIn: appearsIn, num: num };
