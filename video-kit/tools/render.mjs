// Parallel renderer + encoder.
//   node tools/render.mjs episodes/<ep> [--workers N] [--from S] [--to S] [--no-encode]
// 1) builds the page (runs <ep>/scenes.mjs), 2) renders frames with N parallel browser workers (default: CPU cores - 1),
// 3) if <ep>/build/mix.wav exists, encodes build/final_hq.mp4 (crf 18) and build/final_web.mp4 (crf 26, ~30MB per 3.5 min).
// Re-running is cheap: existing frames are skipped — but only while the page is unchanged (stale-frame guard below wipes
// them when video.html changed). After changing ONE shot, keep the rest with --clear on just that range.
//   node tools/render.mjs episodes/<ep> --clear 52.8 60.5    → deletes frames in that time range, then re-renders them
import { spawn, execFileSync } from 'child_process';
import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';
const args = process.argv.slice(2);
const ep = args[0];
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const FPS = 30;
execFileSync('node', [path.join(ep, 'scenes.mjs')], { stdio: 'inherit' });
const cues = JSON.parse(fs.readFileSync(path.join(ep, 'build/cues.json')));
const html = path.join(ep, 'build/video.html'), dir = path.join(ep, 'build/frames');
fs.mkdirSync(dir, { recursive: true });
// Stale-frame guard: frames are skipped when they exist, so frames from an OLDER build (draft voice, previous fix) would
// silently end up in the final video. Each frames/ folder is stamped with the hash of the page it came from; if the page
// changed and you did not say which range to redo (--clear), ALL frames are deleted (a full render is only a few min).
const stampF = path.join(dir, '.stamp'), stamp = crypto.createHash('sha1').update(fs.readFileSync(html)).digest('hex');
const oldStamp = fs.existsSync(stampF) ? fs.readFileSync(stampF, 'utf8') : null;
const old = fs.readdirSync(dir).filter(f => f.endsWith('.jpg'));
if (old.length && oldStamp !== stamp && !args.includes('--clear')) {
  old.forEach(f => fs.unlinkSync(path.join(dir, f)));
  console.log(`page changed since the last render → deleted ${old.length} stale frames (use --clear A B to redo only a range)`);
}
fs.writeFileSync(stampF, stamp);
const ci = args.indexOf('--clear');
if (ci >= 0) {
  const a = Math.round(Number(args[ci + 1]) * FPS), b = Math.round(Number(args[ci + 2]) * FPS);
  for (let f = a; f < b; f++) { const p = path.join(dir, `f${String(f).padStart(5, '0')}.jpg`); if (fs.existsSync(p)) fs.unlinkSync(p); }
  console.log(`cleared frames ${a}-${b}`);
}
const from = Number(opt('--from', 0)), to = Number(opt('--to', cues.DUR));
const N = Number(opt('--workers', Math.max(1, os.cpus().length - 1)));
const span = (to - from) / N;
console.log(`rendering ${from.toFixed(1)}–${to.toFixed(1)}s with ${N} workers…`);
const t0 = Date.now();
await Promise.all(Array.from({ length: N }, (_, i) => new Promise((res, rej) => {
  const a = from + i * span, b = i === N - 1 ? to : from + (i + 1) * span;
  const p = spawn('node', [path.join('tools', 'capture.mjs'), html, dir, String(a), String(b), String(FPS)], { stdio: ['ignore', 'inherit', 'inherit'] });
  p.on('exit', c => c === 0 ? res() : rej(new Error(`worker ${i} failed`)));
})));
console.log(`\nframes done in ${((Date.now() - t0) / 60000).toFixed(1)} min`);
const total = Math.round(cues.DUR * FPS);
const have = fs.readdirSync(dir).filter(f => f.endsWith('.jpg')).length;
if (have < total) console.log(`NOTE: ${have}/${total} frames present (partial render).`);
const mix = path.join(ep, 'build/mix.wav');
if (!args.includes('--no-encode') && have >= total && fs.existsSync(mix)) {
  const hq = path.join(ep, 'build/final_hq.mp4'), web = path.join(ep, 'build/final_web.mp4');
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(dir, 'f%05d.jpg'), '-i', mix, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-tune', 'animation', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', hq], { stdio: 'inherit' });
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', hq, '-c:v', 'libx264', '-crf', '26', '-preset', 'medium', '-tune', 'animation', '-maxrate', '2500k', '-bufsize', '5000k', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', web], { stdio: 'inherit' });
  // what this encode was made FROM — ship.mjs refuses to publish it once the page or the mix has moved on
  const h = f => crypto.createHash('sha1').update(fs.readFileSync(f)).digest('hex');
  fs.writeFileSync(path.join(ep, 'build/final.stamp'), h(html) + ' ' + h(mix));
  console.log('encoded →', hq, 'and', web);
} else if (!fs.existsSync(mix)) console.log('No build/mix.wav yet → run tools/mix.py, then re-run this (frames are kept).');
