// Put a finished render into the app — the steps k2-a1 did by hand, in one command.
//   node tools/ship.mjs episodes/<ep> <unit-id> [--poster 3.5]
//   e.g. node tools/ship.mjs episodes/k2-a2 k2-a2
// 1) refuses a stale encode (page or mix changed since render.mjs stamped it = an old cut of the film)
// 2) remux (no re-encode) → ../videos/istoria/<id>.mp4 with +faststart (plays before it fully downloads)
// 3) poster → ../videos/istoria/<id>.jpg (1280w) from --poster seconds (default 3.5 = the title card)
// 4) final contact sheet → <ep>/build/final_sheet.jpg (one frame / 6 s) — LOOK at it before you push
// 5) prints duration, size (GitHub rejects >100 MB, keep <50), loudness, and the CHAPTERS line to paste
import { execFileSync, spawnSync } from 'child_process';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
const [ep, id, ...rest] = process.argv.slice(2);
if (!ep || !id) { console.error('usage: node tools/ship.mjs episodes/<ep> <unit-id> [--poster S]'); process.exit(2); }
const pi = rest.indexOf('--poster'), posterT = pi >= 0 ? Number(rest[pi + 1]) : 3.5;
const B = path.join(ep, 'build'), web = path.join(B, 'final_web.mp4'), page = path.join(B, 'video.html');
const out = path.resolve('..', 'videos', 'istoria'), mp4 = path.join(out, id + '.mp4'), jpg = path.join(out, id + '.jpg');
const die = m => { console.error('⛔ ' + m); process.exit(1); };
if (fs.existsSync(path.join(ep, 'VOICE_IS_DRAFT.txt'))) die('voice.mp3 is the DRAFT (Melina) voice — get the ElevenLabs file: python3 tools/voice.py use ' + ep);
if (!fs.existsSync(web)) die(`${web} missing — run: node tools/render.mjs ${ep}`);
// stale-encode guard by CONTENT (render.mjs stamps page+mix hashes). Not by mtime: check/stills rebuild an identical page.
const h = f => fs.existsSync(f) ? crypto.createHash('sha1').update(fs.readFileSync(f)).digest('hex') : '-';
const stampF = path.join(B, 'final.stamp');
if (!fs.existsSync(stampF)) console.warn('⚠️  no build/final.stamp (rendered before stamping existed) — cannot prove this encode is current.');
else if (fs.readFileSync(stampF, 'utf8').trim() !== h(page) + ' ' + h(path.join(B, 'mix.wav')))
  die('the page or the mix changed AFTER this encode — it is an older cut. Re-run: node tools/render.mjs ' + ep);
fs.mkdirSync(out, { recursive: true });
const ff = (...a) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...a], { stdio: ['ignore', 'pipe', 'pipe'] });
ff('-i', web, '-c', 'copy', '-movflags', '+faststart', mp4);
ff('-ss', String(posterT), '-i', mp4, '-frames:v', '1', '-vf', 'scale=1280:-1', '-q:v', '4', jpg);
ff('-i', mp4, '-vf', 'fps=1/6,scale=480:-1,tile=6x6', '-frames:v', '1', path.join(B, 'final_sheet.jpg'));
const probe = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration:stream=codec_name,width,height', '-of', 'compact', mp4]).toString().trim();
// volumedetect reports on stderr; healthy mix ≈ mean −20 dB, peak ≤ −1 dB (mix.py targets −16 LUFS)
const vd = spawnSync('ffmpeg', ['-hide_banner', '-i', mp4, '-af', 'volumedetect', '-vn', '-f', 'null', '-']).stderr.toString();
const loud = (vd.match(/mean_volume: [-\d.]+ dB/) || ['mean ?'])[0] + ' · ' + (vd.match(/max_volume: [-\d.]+ dB/) || ['max ?'])[0];
const mb = fs.statSync(mp4).size / 1048576;
console.log(probe);
console.log(loud + (/max_volume: (-?0(\.0)?|[1-9])/.test(vd) ? '  ⚠️ CLIPPING' : ''));
console.log(`size ${mb.toFixed(1)} MB${mb > 50 ? '  ⚠️ over 50 MB — re-encode web at a higher crf' : ''}`);
console.log(`→ ${path.relative(path.resolve('..'), mp4)}\n→ ${path.relative(path.resolve('..'), jpg)}\n→ ${path.join(B, 'final_sheet.jpg')}  (LOOK at it)`);
console.log(`\nIn istoria-voithima.html, unit "${id}":\n  video: { src: "videos/istoria/${id}.mp4", poster: "videos/istoria/${id}.jpg" },`);
