#!/usr/bin/env bash
# ════════════════════════════════════════════════════════════════
# AURORA smoke-test — catches the two failure modes that silently
# white-screen a static PWA, with no Node/CI required (uses jsc):
#   1. JavaScript syntax errors — every .js file AND every inline
#      <script> in every .html is parsed.
#   2. Broken local links — every href/src in the HTML must resolve
#      to a file that actually exists in the repo.
# Exits non-zero if anything is wrong, so it can gate a deploy.
#
# Usage:  ./smoke-test.sh        (run from the repo; uses macOS jsc)
#         JSC=/path/to/jsc ./smoke-test.sh
# Assumes the flat page layout (all .html in the repo root); links
# are resolved relative to the repo root.
# ════════════════════════════════════════════════════════════════
set -u
cd "$(dirname "$0")" || exit 2
JSC="${JSC:-/System/Library/Frameworks/JavaScriptCore.framework/Versions/A/Helpers/jsc}"
[ -x "$JSC" ] || { echo "✗ jsc not found at: $JSC  (set JSC=/path/to/jsc)"; exit 2; }

LIST="$(mktemp /tmp/als_smoke_files.XXXXXX)"
PROG="$(mktemp /tmp/als_smoke_impl.XXXXXX.js)"
trap 'rm -f "$LIST" "$PROG"' EXIT

# Files to check: the LIVE app's own .html + .js. Excludes vendored code,
# archive/ (retired pages, kept for reference — not deployed), _quarantine/
# (throwaways + the May-28 fossil clone, which still carries the OLD anon-key
# bug and would otherwise trip the auth check), and the _*.html / render-*.html
# throwaways a headless render leaves behind.
find . -type f \( -name '*.html' -o -name '*.js' \) \
  -not -path './vendor/*' -not -path './node_modules/*' \
  -not -path './archive/*' -not -path './docs/*' -not -path './als/*' \
  -not -path './_quarantine/*' \
  -not -name '_*.html' -not -name 'render-*.html' \
  | sed 's|^\./||' | sort > "$LIST"

cat > "$PROG" <<JS
'use strict';
var LIST = '$LIST';
var files = read(LIST).split('\n').filter(function (s) { return s.trim(); });
var problems = 0, jsN = 0, htmlN = 0, linkN = 0;

function parseOK(src, label) {
  try { new Function(src); return true; }
  catch (e) { print('  ✗ SYNTAX   ' + label + '  →  ' + e); problems++; return false; }
}
function exists(p) { try { read(p); return true; } catch (e) { return false; } }
function isLocal(u) {
  if (!u) return false;
  if (/^(https?:)?\/\//i.test(u)) return false;
  if (/^(data:|mailto:|tel:|blob:|javascript:|#)/i.test(u)) return false;
  return true;
}
function clean(u) { return u.split('#')[0].split('?')[0].trim(); }

files.forEach(function (f) {
  var src;
  try { src = read(f); } catch (e) { print('  ✗ READ     ' + f); problems++; return; }

  if (/\.js$/.test(f)) {
    jsN++;
    // ES-module .js (has top-level import/export) — strip those lines new Function() can't parse, still check the logic.
    var js = /^\s*(import|export)\s/m.test(src) ? src.replace(/^\s*import\s.*$/gm, '').replace(/^\s*export\s.*$/gm, '') : src;
    parseOK(js, f); return;
  }

  htmlN++;
  var re = /<script(\s[^>]*)?>([\s\S]*?)<\/script>/g, m, i = 0;
  while ((m = re.exec(src)) !== null) {
    var attrs = m[1] || ''; if (/\bsrc\s*=/.test(attrs)) continue;
    var tm = attrs.match(/\btype\s*=\s*["']([^"']+)["']/i), type = tm ? tm[1].toLowerCase() : '';
    if (type === 'importmap' || type.indexOf('json') >= 0) continue;   // JSON payloads, not JS
    var body = m[2]; if (!body.trim()) continue;
    // ES modules: strip top-level import/export lines new Function() can't parse, still check the logic.
    if (type === 'module') body = body.replace(/^\s*import\s.*$/gm, '').replace(/^\s*export\s.*$/gm, '');
    i++; parseOK(body, f + '  inline#' + i);
  }

  var lre = /(?:href|src)\s*=\s*["']([^"']+)["']/gi, lm, seen = {};
  while ((lm = lre.exec(src)) !== null) {
    var raw = lm[1]; if (!isLocal(raw)) continue;
    var p = clean(raw); if (!p || p === './' || p === '.' || seen[p]) continue; seen[p] = 1;
    linkN++;
    if (!exists(p)) { print('  ✗ MISSING  ' + f + '  →  ' + raw); problems++; }
  }
});

print('');
print('— smoke-test: ' + htmlN + ' html · ' + jsN + ' js · ' + linkN + ' links checked —');
print(problems ? ('SMOKE_FAIL ' + problems) : 'SMOKE_OK');
JS

OUT="$("$JSC" "$PROG" 2>&1)"
echo "$OUT"

# ── Guardrail: no live file may send the PUBLIC key as the Supabase auth token.
# RLS returns/accepts a user's rows only for their signed-in session JWT; the
# anon publishable key as a Bearer reads nothing and its writes are rejected —
# which once silently emptied gym/weigh-in history on a freshly-installed PWA.
# The correct form always falls back THROUGH the token, e.g.
#   'Bearer ' + (SESSION_TOKEN || KEY)
# so this pattern (a bare '+ <anything>KEY', incl. SB_KEY / ICU_SB_KEY) matches
# only the broken shape — the correct form has a '(' right after the '+'.
# api/ is SERVER code: it legitimately uses the service-role key as Bearer (it is
# meant to bypass RLS), so it's excluded — this rule is about CLIENT code, which
# must carry the signed-in user's token.
BADAUTH="$(grep -rnE "Bearer '[[:space:]]*\+[[:space:]]*[A-Za-z_]*KEY\b" \
  --include='*.js' --include='*.html' . 2>/dev/null \
  | grep -vE '/(vendor|node_modules|archive|docs|als|api|_quarantine)/' \
  | grep -vE '/_[^/]*\.html:')"
if [ -n "$BADAUTH" ]; then
  echo ""
  echo "  ✗ AUTH     a live file sends the public key as the Supabase Bearer token."
  echo "             Use the signed-in session token, e.g. 'Bearer ' + (SESSION_TOKEN || KEY):"
  echo "$BADAUTH" | sed 's/^/               /'
  echo "SMOKE_FAIL auth"
  exit 1
fi

# ── Nova is one heartbeat ────────────────────────────────────────
# Nova's geometry is inline in each host on purpose (flat files, no flash, no
# JS dependency), so nothing structural stops the copies drifting apart — which
# is exactly how the old diamond survived in 14 places for a year. Pin it here:
# the beat lives in aurora.css, the path must be byte-identical everywhere, and
# the diamond must never come back. nova-lab.html is exempt — it quotes the old
# Nova deliberately, as the comparison.
ECG='M18.8 50 H38.3 L42.2 55.1 L48.8 25 L56.3 75 L62.1 46.1 L66.8 50 H81.3'
# Matches the diamond at ANY viewBox. The old pattern was 'rotate(45 50 50)',
# which is the 100x100 form — so morning.html's 24x24 'rotate(45 12 12)' sailed
# through and the last diamond in the app survived on the page he reads daily.
OLDNOVA="$(grep -rlE 'transform="rotate\(45 [0-9.]+ [0-9.]+\)"' --include='*.html' --include='*.js' . 2>/dev/null \
  | grep -vE '/(vendor|node_modules|archive|docs|_quarantine)/' | grep -v 'nova-lab.html')"
if [ -n "$OLDNOVA" ]; then
  echo ""
  echo "  ✗ NOVA     the old diamond is back. Nova is the Pulse — see aurora.css."
  echo "$OLDNOVA" | sed 's/^/               /'
  echo "SMOKE_FAIL nova"
  exit 1
fi
BADBEAT="$(grep -rlE '@keyframes (novaTrace|novaNode|novaRingBeat)' --include='*.html' . 2>/dev/null \
  | grep -vE '/(archive|_quarantine)/')"
if [ -n "$BADBEAT" ]; then
  echo ""
  echo "  ✗ NOVA     a page redefines Nova's beat. It belongs in aurora.css, once:"
  echo "$BADBEAT" | sed 's/^/               /'
  echo "SMOKE_FAIL nova"
  exit 1
fi
DRIFT="$(grep -rho 'd="M18\.8 50[^"]*"' --include='*.html' --include='*.js' . 2>/dev/null \
  | sed 's/^d="//; s/"$//' | sort -u | grep -vxF "$ECG")"
if [ -n "$DRIFT" ]; then
  echo ""
  echo "  ✗ NOVA     a copy of the heartbeat has drifted from icon.svg's:"
  echo "$DRIFT" | sed 's/^/               /'
  echo "SMOKE_FAIL nova"
  exit 1
fi

# ── SYNC ──────────────────────────────────────────────────────────
# On 14/07/26 four days of weigh-ins lived on one phone because the engines
# marked data as "already pushed" BEFORE the write was confirmed. The failure
# then left that marker lying, so the 15s reconciler compared local against it,
# saw no drift, and never retried. `lastJson` may ONLY advance on a confirmed
# write. These pin the exact shapes that caused it.
OPTIMISTIC="$(grep -rn "lastJson = json; lastPushAt\|lastJson = bJson; push(\|lastJson = bJson; tombDropped" --include='*.js' . 2>/dev/null \
  | grep -vE '/(archive|docs|_quarantine|node_modules)/')"
if [ -n "$OPTIMISTIC" ]; then
  echo ""
  echo "  ✗ SYNC     a sync engine marks data pushed BEFORE the cloud confirms it."
  echo "             That is the 14/07/26 bug: the failed push leaves the marker"
  echo "             lying, the reconciler sees no drift, and it never retries."
  echo "$OPTIMISTIC" | sed 's/^/               /'
  echo "SMOKE_FAIL sync"
  exit 1
fi
# A push whose result is never inspected cannot be retried or reported.
FLOATING="$(grep -rn "try { supa.from('app_state').upsert" --include='*.js' . 2>/dev/null \
  | grep -vE '/(archive|docs|_quarantine)/')"
if [ -n "$FLOATING" ]; then
  echo ""
  echo "  ✗ SYNC     an upsert is fired without awaiting it — an async rejection"
  echo "             cannot be caught by the surrounding try/catch, so the failure"
  echo "             is invisible."
  echo "$FLOATING" | sed 's/^/               /'
  echo "SMOKE_FAIL sync"
  exit 1
fi

# ── MODEL ─────────────────────────────────────────────────────────
# Groq retires models on a published schedule and every file that hardcoded
# one died with it: llama-4-scout took photo macros down on 17/07/26 without a
# single warning. Groq announces these months ahead, so a dead ID has no
# business reaching main. When one here goes dark, add it to the list and the
# next push tells you which file to fix.
# Live schedule: https://console.groq.com/docs/deprecations
DEAD='llama-4-scout|llama-4-maverick|llama-3\.1-8b-instant|llama3-70b-8192|llama3-8b-8192|gemma2-9b-it|mixtral-8x7b|kimi-k2-instruct|deepseek-r1-distill|qwen/qwen3-32b|llama-guard-4-12b|playai-tts|mistral-saba'
DEADHIT="$(grep -rnE "$DEAD" --include='*.js' api/ 2>/dev/null | grep -v '^\s*//' | grep -vE '//.*(shut down|pulled|retired|died|was before)')"
if [ -n "$DEADHIT" ]; then
  echo ""
  echo "  ✗ MODEL    a retired Groq model is still referenced in api/:"
  echo "$DEADHIT" | sed 's/^/               /'
  echo "             chain lives in api/_model.js — see console.groq.com/docs/deprecations"
  echo "SMOKE_FAIL model"
  exit 1
fi
# llama-3.3-70b is NOT dead yet (16/08/26) — it is the last rung of the text
# chain on purpose. But it must never be the FIRST thing we reach for again.
if grep -qE "^\s*text:\s*\['llama-3\.3-70b" api/_model.js 2>/dev/null; then
  echo ""
  echo "  ✗ MODEL    the text chain leads with llama-3.3-70b, which dies 16/08/26."
  echo "SMOKE_FAIL model"
  exit 1
fi
# Every Groq call must go through the chain. A raw endpoint URL in an endpoint
# file means someone hardcoded a model again and re-opened this whole hole.
RAWGROQ="$(grep -rln 'api\.groq\.com' --include='*.js' api/ 2>/dev/null | grep -v '_model.js')"
if [ -n "$RAWGROQ" ]; then
  echo ""
  echo "  ✗ MODEL    a file calls Groq directly instead of via _model.js:"
  echo "$RAWGROQ" | sed 's/^/               /'
  echo "SMOKE_FAIL model"
  exit 1
fi

echo "$OUT" | grep -q '^SMOKE_OK$' && exit 0
exit 1
