// QA: render stills at given times + one contact sheet you can LOOK at (always do this before a full render).
//   node tools/stills.mjs episodes/<ep> 8 13 19.5 44 ...        (times in seconds)
//   node tools/stills.mjs episodes/<ep> --every 3                (one still every 3 s over the whole video)
// Output: <ep>/build/stills/t0008.00.jpg ... and <ep>/build/stills/sheet.jpg (labelled grid)
import { chromium } from 'playwright';
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
const [ep, ...rest] = process.argv.slice(2);
execFileSync('node', [path.join(ep, 'scenes.mjs')], { stdio: 'inherit' });
const cues = JSON.parse(fs.readFileSync(path.join(ep, 'build/cues.json')));
let times = rest.map(Number);
if (rest[0] === '--every') { const s = Number(rest[1]); times = []; for (let t = 0.5; t < cues.DUR; t += s) times.push(+t.toFixed(2)); }
const dir = path.join(ep, 'build/stills'); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const errs = []; page.on('pageerror', e => errs.push(e.message));
await page.goto(pathToFileURL(path.resolve(ep, 'build/video.html')).href);
await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(300);
const files = [];
for (const t of times) {
  try { await page.evaluate(t => window.seek(t), t); } catch (e) { console.error('seek error at', t, e.message.slice(0, 300)); }
  const f = path.join(dir, `t${t.toFixed(2).padStart(7, '0')}.jpg`); await page.screenshot({ path: f, type: 'jpeg', quality: 80 }); files.push([t, f]);
}
if (errs.length) console.error('PAGE ERRORS:', [...new Set(errs)].slice(0, 8));
// contact sheet (4 columns, 480x270 thumbs, time label below each so it never hides content)
const cols = 4, w = 480, h = 270;
const grid = `<html><body style="margin:0;background:#111;display:grid;grid-template-columns:repeat(${cols},${w}px);gap:6px;padding:6px;width:${cols * (w + 6) + 6}px">${files.map(([t, f]) => `<div><img src="${pathToFileURL(path.resolve(f)).href}" style="width:${w}px;height:${h}px;display:block"><div style="color:#fff;font:14px monospace;padding:2px 0">${t.toFixed(2)}s</div></div>`).join('')}</body></html>`;
const gf = path.join(dir, 'sheet.html'); fs.writeFileSync(gf, grid);
const rows = Math.ceil(files.length / cols);
await page.setViewportSize({ width: cols * (w + 6) + 6, height: rows * (h + 26) + 12 });
await page.goto(pathToFileURL(path.resolve(gf)).href); await page.waitForTimeout(300);
await page.screenshot({ path: path.join(dir, 'sheet.jpg'), type: 'jpeg', quality: 80, fullPage: true });
await browser.close();
console.log('stills →', dir, '(open sheet.jpg)');
