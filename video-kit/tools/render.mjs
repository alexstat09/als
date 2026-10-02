// Parallel renderer + encoder.
//   node tools/render.mjs episodes/<ep> [--workers N] [--from S] [--to S] [--no-encode]
// 1) builds the page (runs <ep>/scenes.mjs), 2) renders frames with N parallel browser workers (default: CPU cores - 1),
// 3) if <ep>/build/mix.wav exists, encodes build/final_hq.mp4 (crf 18) and build/final_web.mp4 (crf 26, ~30MB per 3.5 min).
// Re-running is cheap: existing frames are skipped. After changing a shot, delete only that shot's frames (see --clear).
//   node tools/render.mjs episodes/<ep> --clear 52.8 60.5    → deletes frames in that time range, then re-renders them
import { spawn, execFileSync } from 'child_process';
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
  console.log('encoded →', hq, 'and', web);
} else if (!fs.existsSync(mix)) console.log('No build/mix.wav yet → run tools/mix.py, then re-run this (frames are kept).');
