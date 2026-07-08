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

# Files to check: our own .html + .js, excluding vendored/3rd-party + this test.
find . -type f \( -name '*.html' -o -name '*.js' \) \
  -not -path './vendor/*' -not -path './node_modules/*' \
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
echo "$OUT" | grep -q '^SMOKE_OK$' && exit 0
exit 1
