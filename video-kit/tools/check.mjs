// Automatic QA — run after every build, BEFORE looking at stills (it finds in 20 s what took rounds of stills in k2-a1).
//   node tools/check.mjs episodes/<ep>            exit code 1 if anything is ⛔
// 1) runtime: seek() every shot at 6 points → no JS error (a missing id names itself: «missing element #S13-l4»)
// 2) tiling: shots cover 0 → DUR with no gap/overlap
// 3) late cues: a cue landing < 0.8 s before its shot's cut is not readable (QA «visible ≥0.8 s») → ⚠️ list
// 4) subtitles: non-title chunks of timing.json == book.txt, verbatim
// 5) audio.json: every event's cue exists (a typo'd cue silently drops the sound)
import { chromium } from 'playwright';
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
const ep = process.argv[2];
if (!ep) { console.error('usage: node tools/check.mjs episodes/<ep>'); process.exit(2); }
execFileSync('node', [path.join(ep, 'scenes.mjs')], { stdio: 'inherit' });
let bad = 0; const no = m => { bad++; console.log('⛔', m); }, warn = m => console.log('⚠️ ', m);

const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
const pageErr = []; p.on('pageerror', e => pageErr.push(e.message));
await p.goto(pathToFileURL(path.resolve(ep, 'build/video.html')).href);
const D = await p.evaluate(() => ({ C: window.D.C, shots: window.D.shots, subs: window.D.subs }));
pageErr.forEach(e => no('page load: ' + e));

// 1) runtime
let rt = 0;
for (const s of D.shots) for (const f of [0.005, .2, .4, .6, .8, .995]) {
  const t = s.a + (s.b - s.a) * f;
  const e = await p.evaluate(t => { try { seek(t); return null; } catch (e) { return e.message; } }, t);
  if (e) { rt++; no(`${s.id} @${t.toFixed(2)}s: ${e}`); }
}
await b.close();
if (!rt) console.log(`✓ runtime: ${D.shots.length} shots × 6 seeks, no errors`);

// 2) tiling
const sh = [...D.shots].sort((x, y) => x.a - y.a); let tile = 0;
if (sh[0].a > 0.001) { tile++; no(`first shot starts at ${sh[0].a}s, not 0`); }
for (let i = 1; i < sh.length; i++) if (Math.abs(sh[i].a - sh[i - 1].b) > 0.001) { tile++; no(`${sh[i - 1].id}→${sh[i].id}: ${sh[i - 1].b.toFixed(2)} vs ${sh[i].a.toFixed(2)} (gap/overlap)`); }
for (const s of sh) if (s.b - s.a < 1.2) warn(`${s.id} lasts only ${(s.b - s.a).toFixed(2)}s`);
if (!tile) console.log('✓ tiling: shots cover 0 → ' + sh[sh.length - 1].b.toFixed(2) + 's');

// 3) late cues: a cue USED BY shot X (C.k inside F.X in shots.js) must leave ≥0.8 s before X's cut. A cue that merely
//    falls in the previous shot's tail (it starts the next shot) is not a problem, so usage decides, not position.
const src = fs.readFileSync(path.join(ep, 'shots.js'), 'utf8');
const shotSrc = {}; src.split(/^(?=F\.(S\d+)\s*=)/m).forEach(part => { const m = part.match(/^F\.(S\d+)\s*=/); if (m) shotSrc[m[1]] = part; });
const late = [], unused = [];
for (const [k, t] of Object.entries(D.C)) {
  if (typeof t !== 'number' || ['end', 'DUR'].includes(k)) continue;
  // every use, with its offset: C.k, C.k + .7, C.k - .3 → the EARLIEST moment that shot starts reacting to the cue
  const re = new RegExp('C\\.' + k + '(?![\\w$])(?:\\s*([+-])\\s*([\\d.]+))?', 'g');
  const users = [];
  for (const s of sh) {
    if (!shotSrc[s.id]) continue;
    // a blink keyed to a cue is secondary motion, not a beat — it may land anywhere
    const offs = [...shotSrc[s.id].matchAll(re)].filter(m => !/blinkAt\([^)]*$/.test(shotSrc[s.id].slice(Math.max(0, m.index - 80), m.index)))
      .map(m => m[1] ? (m[1] === '-' ? -1 : 1) * Number(m[2]) : 0);
    if (offs.length) users.push([s, t + Math.min(...offs)]);
  }
  if (!users.length) { unused.push(k); continue; }
  for (const [s, te] of users) {
    if (te >= s.b) late.push(`${k}=${te.toFixed(2)} used by ${s.id} but AFTER its cut ${s.b.toFixed(2)} — never visible`);
    else if (te > s.a && s.b - te < 0.8) late.push(`${k}=${te.toFixed(2)} (${s.id}, ${(s.b - te).toFixed(2)}s before the cut)`);
  }
}
if (unused.length) warn(`cues defined but used by no shot (audio-only is fine): ${unused.join(' ')}`);
late.length ? warn(`cues visible < 0.8 s — check each one with stills (bind the visual earlier or hold the shot):\n     ${late.join('\n     ')}`)
  : console.log('✓ cues: every cue has ≥0.8 s before its cut');

// 4) subtitles verbatim (title chunks = the ones before the first book word)
const T = JSON.parse(fs.readFileSync(path.join(ep, 'timing.json'), 'utf8'));
const want = fs.readFileSync(path.join(ep, 'book.txt'), 'utf8').split(/\s+/).filter(Boolean).join(' ');
const ch = T.chunks.map(c => c.text), k0 = ch.findIndex(c => want.startsWith(c));
const body = k0 < 0 ? '' : ch.slice(k0).join(' ');
if (body === want) console.log(`✓ subtitles == book.txt verbatim (${ch.length - k0} chunks after ${k0} title chunks)`);
else { const i = [...want].findIndex((c, j) => body[j] !== c); no(`subtitles ≠ book.txt at char ${i}: «${body.slice(Math.max(0, i - 20), i + 30)}» vs «${want.slice(Math.max(0, i - 20), i + 30)}»`); }

// 5) audio.json cues
const A = path.join(ep, 'audio.json');
if (fs.existsSync(A)) {
  const AJ = JSON.parse(fs.readFileSync(A, 'utf8')), ev = Array.isArray(AJ) ? AJ : (AJ.events || []); const miss = ev.filter(e => e.cue != null && !(e.cue in D.C));
  miss.length ? miss.forEach(e => no(`audio.json: cue «${e.cue}» does not exist`)) : console.log(`✓ audio.json: ${ev.length} events, all cues exist`);
  const ts = ev.map(e => (D.C[e.cue] ?? e.t ?? 0) + (e.dt || 0)).sort((x, y) => x - y);
  const dur = D.C.end || ts[ts.length - 1]; if (ts.length > dur / 3.2) warn(`${ts.length} SFX in ${dur.toFixed(0)}s — more than ~1 per 4 s?`);
}
if (fs.existsSync(path.join(ep, 'VOICE_IS_DRAFT.txt'))) warn('DRAFT voice (Melina) — fine for building; ship.mjs will refuse it. Real one: python3 tools/voice.py use ' + ep);
console.log(bad ? `\n${bad} ⛔ — fix before stills/render` : '\nCHECK OK');
process.exit(bad ? 1 : 0);
