// Worker: renders frames [from, to) of an episode page to JPEGs. Resumable (skips frames that already exist).
// node tools/capture.mjs <video.html> <framesDir> <fromSec> <toSec> [fps=30]
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
const [html, dir, a, b, fpsArg] = process.argv.slice(2);
const fps = Number(fpsArg || 30);
fs.mkdirSync(dir, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const errs = [];
page.on('pageerror', e => errs.push(e.message));
await page.goto(pathToFileURL(path.resolve(html)).href);
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(300);
if (errs.length) { console.error('PAGE ERRORS:', errs.slice(0, 5)); process.exit(1); }
const f0 = Math.round(Number(a) * fps), f1 = Math.round(Number(b) * fps);
for (let f = f0; f < f1; f++) {
  const out = path.join(dir, `f${String(f).padStart(5, '0')}.jpg`);
  if (fs.existsSync(out) && fs.statSync(out).size > 1000) continue;
  await page.evaluate(t => window.seek(t), f / fps);
  await page.screenshot({ path: out, type: 'jpeg', quality: 93 });
  if (errs.length) { console.error(`PAGE ERROR at t=${(f / fps).toFixed(2)}:`, errs[0]); process.exit(1); }
  if (f % 60 === 0) process.stdout.write(`.${f}`);
}
await browser.close();
