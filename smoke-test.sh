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

# ── Guardrail: a row is addressed by (user_id, key), never by key alone ──
# app_state's primary key is (user_id, key). There is NO unique index on `key`,
# so an upsert targeting `on_conflict=key` is rejected by Postgres itself with
#   42P10: there is no unique or exclusion constraint matching the ON CONFLICT
# as a hard HTTP 400 — before RLS is even consulted, and on every single attempt.
# pocoach-sync.js shipped that shape, which meant EVERY weigh-in push failed from
# the day the multi-user migration ran. It cost three separate rounds of missing
# weigh-ins, and it was invisible: the retry logic was honest and correct, and it
# spent months faithfully retrying a request that could never succeed.
# The correct form derives the target from whether an owner is known, e.g.
#   'on_conflict=' + (SESSION_UID ? 'user_id,key' : 'key')
# api/ is SERVER code and already does this in _supa.js; the literal below only
# matches the hardcoded broken shape.
# tests/ is excluded: sync-regression.js sends the broken shape ON PURPOSE, to
# assert the database rejects it. That test is the guardrail's twin, not a leak.
BADCONFLICT="$(grep -rnE "on_conflict=key[\"'&]|onConflict: *['\"]key['\"]" \
  --include='*.js' --include='*.html' . 2>/dev/null \
  | grep -vE '/(vendor|node_modules|archive|docs|als|api|tests|_quarantine)/' \
  | grep -vE '/_[^/]*\.html:')"
if [ -n "$BADCONFLICT" ]; then
  echo ""
  echo "  ✗ UPSERT   a live file upserts app_state with on_conflict=key."
  echo "             The row is keyed (user_id, key) — Postgres rejects that 42P10/400 every time:"
  echo "$BADCONFLICT" | sed 's/^/               /'
  echo "SMOKE_FAIL upsert"
  exit 1
fi

# ── Guardrail: every synced key must be known to the Vault ───────
# backup.html's BUNDLES maps a localStorage key to its cloud row. restoreFromData
# SKIPS any key whose bundle it doesn't know (`var ak = bundleFor(k); if (!ak)
# return;`), so a store missing from that map syncs between devices perfectly and
# then silently fails to restore — at the one moment it matters. It had drifted by
# four whole rows and six keys before anyone checked. Fail the build instead.
if command -v node >/dev/null 2>&1; then
  BADBUNDLE="$(node -e '
    var fs=require("fs"), apps={};
    fs.readdirSync(".").filter(f=>/\.(html|js)$/.test(f)&&!/^_|^render-/.test(f)).forEach(function(f){
      var s=fs.readFileSync(f,"utf8"), i=-1;
      while((i=s.indexOf("initCloudSync({",i+1))>=0){
        var blk=s.slice(i,i+1200);
        if(/readOnly\s*:\s*true/.test(blk.slice(0,300))) continue;
        var ak=(blk.match(/appKey\s*:\s*.([^"\x27]+)./)||[])[1]; if(!ak) continue;
        apps[ak]=apps[ak]||{keys:{},prefixes:{}};
        var kb=(blk.match(/syncedKeys\s*:\s*\[([^\]]*)\]/)||[])[1]||"";
        (kb.match(/\x27([^\x27]+)\x27/g)||[]).forEach(q=>apps[ak].keys[q.slice(1,-1)]=1);
        var pb=(blk.match(/syncedPrefixes\s*:\s*\[([^\]]*)\]/)||[])[1]||"";
        (pb.match(/\x27([^\x27]+)\x27/g)||[]).forEach(q=>apps[ak].prefixes[q.slice(1,-1)]=1);
      }
    });
    var po=fs.readFileSync("pocoach-sync.js","utf8").match(/var KEYS\s*=\s*\[([\s\S]*?)\];/);
    apps["po-coach"]={keys:{},prefixes:{"po_coach_logs:":1}};
    (po[1].match(/\x27([^\x27]+)\x27/g)||[]).forEach(q=>apps["po-coach"].keys[q.slice(1,-1)]=1);
    var b=fs.readFileSync("backup.html","utf8"), bs=b.indexOf("var BUNDLES"), be=b.indexOf("};",bs), cur={};
    b.slice(bs,be).split("\n").forEach(function(l){
      var m=l.match(/\x27([a-z-]+)\x27:\s*\{\s*keys:\[([^\]]*)\],\s*prefixes:\[([^\]]*)\]/); if(!m) return;
      cur[m[1]]={keys:(m[2].match(/\x27([^\x27]+)\x27/g)||[]).map(x=>x.slice(1,-1)),
                 prefixes:(m[3].match(/\x27([^\x27]+)\x27/g)||[]).map(x=>x.slice(1,-1))};
    });
    var out=[];
    Object.keys(apps).sort().forEach(function(ak){
      var c=cur[ak];
      if(!c){ out.push(ak+" — the whole row is missing from BUNDLES"); return; }
      var mk=Object.keys(apps[ak].keys).filter(k=>c.keys.indexOf(k)<0 && !c.prefixes.some(p=>k.indexOf(p)===0));
      var mp=Object.keys(apps[ak].prefixes).filter(p=>c.prefixes.indexOf(p)<0);
      if(mk.length||mp.length) out.push(ak+" — not in BUNDLES: "+mk.concat(mp.map(p=>p+"*")).join(", "));
    });
    process.stdout.write(out.join("\n"));
  ' 2>/dev/null)"
  if [ -n "$BADBUNDLE" ]; then
    echo ""
    echo "  ✗ VAULT    a synced store is unknown to backup.html BUNDLES."
    echo "             It would sync fine and then NOT restore from a backup:"
    echo "$BADBUNDLE" | sed 's/^/               /'
    echo "SMOKE_FAIL vault"
    exit 1
  fi
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
