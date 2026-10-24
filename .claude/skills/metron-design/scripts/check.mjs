// MÉTRON scorecard: node check.mjs <file.html|URL> [...]
// Checks at 1440/1180/390: horizontal overflow, JS errors; plus min-width media queries,
// Greek text in a face without Greek glyphs, low-contrast / tiny reading text.
// Exit code 1 if any hard rule fails. Uses Playwright from the als repo's video-kit.
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';
// Playwright lives in the repo's video-kit (this file sits at .claude/skills/metron-design/scripts/).
const here = path.dirname(fs.realpathSync(fileURLToPath(import.meta.url)));
const vk = [path.resolve(here, '../../../../video-kit/package.json'), '/Users/alexstathatos/ALS DASHBOARD ALL FILES/als/video-kit/package.json'].find(f => fs.existsSync(f));
if (!vk) { console.log('Playwright not found: run `npm i && npx playwright install chromium` inside video-kit/'); process.exit(2); }
const require = createRequire(vk);
const { chromium } = require('playwright');
const ids = process.argv.slice(2);
if (!ids.length) { console.log('usage: node check.mjs <file.html|URL> ...'); process.exit(2); }
let failed = false;
const browser = await chromium.launch();
for (const id of ids) {
  const file = /^https?:/.test(id) ? id : 'file://' + path.resolve(id);
  const html = /^https?:/.test(id) ? await (await fetch(id)).text() : fs.readFileSync(id, 'utf8');
  const css = (html.match(/<style[^>]*>[\s\S]*?<\/style>/g) || []).join('\n').replace(/\/\*[\s\S]*?\*\//g, '');
  const minWidthMQ = (css.match(/@media[^{]*min-width/g) || []).length;
  const r = { id, bytes: html.length, minWidthMQ, widths: {} };
  for (const w of [1440, 1180, 390]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
    page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)); });
    await page.goto(file, { waitUntil: 'load' });
    await page.waitForTimeout(1500);
    const m = await page.evaluate(async () => {
      await document.fonts.ready;
      const de = document.documentElement;
      const overflow = Math.max(0, de.scrollWidth - de.clientWidth);
      const GR = /[Ͱ-Ͽἀ-῿]/;
      const cv = document.createElement('canvas'); cv.width = cv.height = 1; const cx = cv.getContext('2d', { willReadFrequently: true }); const rgba = c => { cx.clearRect(0, 0, 1, 1); cx.fillStyle = '#000'; cx.fillStyle = c; cx.fillRect(0, 0, 1, 1); const d = cx.getImageData(0, 0, 1, 1).data; return 'rgba(' + d[0] + ',' + d[1] + ',' + d[2] + ',' + (d[3] / 255) + ')'; };
      const lum = c0 => { const c = rgba(c0); const v = c.match(/[\d.]+/g).map(Number); const f = x => { x /= 255; return x <= .03928 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4; }; return [.2126 * f(v[0]) + .7152 * f(v[1]) + .0722 * f(v[2]), v[3] == null ? 1 : v[3]]; };
      const bgOf = el => { for (let e = el; e; e = e.parentElement) { const b = rgba(getComputedStyle(e).backgroundColor); const a = b.match(/[\d.]+/g); if (a && (a[3] == null || +a[3] > .5)) return b; } return getComputedStyle(document.body).backgroundColor || 'rgb(255,255,255)'; };
      const ctx = document.createElement('canvas').getContext('2d');
      const lacksGreek = fam => { const s = 'Ατζέντα Ιστορία λύω'; ctx.font = '40px ' + fam + ', monospace'; const a = ctx.measureText(s).width; ctx.font = '40px monospace'; const b = ctx.measureText(s).width; ctx.font = '40px ' + fam + ', serif'; const c = ctx.measureText(s).width; ctx.font = '40px serif'; const d = ctx.measureText(s).width; return Math.abs(a - b) < .5 && Math.abs(c - d) < .5; };
      const famCache = {}; const badFonts = new Set();
      let reading = 0, lowContrast = 0, tooSmall = 0; const samples = [];
      for (const el of document.querySelectorAll('body *')) {
        if (!el.offsetParent && getComputedStyle(el).position !== 'fixed') continue;
        const own = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim();
        if (!own || !GR.test(own)) continue;
        const cs = getComputedStyle(el);
        const fam = cs.fontFamily.split(',')[0].trim();
        if (!(fam in famCache)) famCache[fam] = lacksGreek(fam);
        if (famCache[fam]) badFonts.add(fam);
        const isLabel = cs.textTransform === 'uppercase' || own.length < 12;
        if (isLabel) continue;
        reading++;
        const fs = parseFloat(cs.fontSize);
        const [L1, a1] = lum(cs.color); const [L2] = lum(bgOf(el));
        // blend text alpha onto bg luminance (approx)
        const Lt = a1 * L1 + (1 - a1) * L2;
        const cr = (Math.max(Lt, L2) + .05) / (Math.min(Lt, L2) + .05);
        if (cr < 4.5) { lowContrast++; if (samples.length < 4) samples.push(own.slice(0, 40) + ' (' + cr.toFixed(2) + ':1)'); }
        if (fs < 13.5) tooSmall++;
      }
      const main = [...document.querySelectorAll('body *')].reduce((m, e) => { const r = e.getBoundingClientRect(); return (r.height > 300 && r.width > m) ? r.width : m; }, 0);
      return { overflow, badGreekFonts: [...badFonts], reading, lowContrast, tooSmall, samples, widestBlock: Math.round(main), dialogs: document.querySelectorAll('dialog').length };
    });
    r.widths[w] = { ...m, errors: errs.slice(0, 5) };
    await ctx.close();
  }
  const a = r.widths[1440];
  const ov = [1440, 1180, 390].map(w => r.widths[w].overflow);
  const errs = [1440, 1180, 390].flatMap(w => r.widths[w].errors);
  const bad = [];
  if (ov.some(v => v > 0)) bad.push('sideways scroll ' + ov.join('/'));
  if (minWidthMQ) bad.push(minWidthMQ + ' min-width media queries');
  if (a.badGreekFonts.length) bad.push('Greek in non-Greek font: ' + a.badGreekFonts.join(', '));
  if (a.lowContrast) bad.push(a.lowContrast + ' low-contrast reading texts e.g. ' + a.samples.join(' | '));
  if (errs.length) bad.push('JS errors: ' + errs.slice(0, 3).join(' | '));
  console.log((bad.length ? '✗ ' : '✓ ') + id + '  overflow ' + ov.join('/') + ' · min-width ' + minWidthMQ + ' · reading ' + a.reading + ' (low-contrast ' + a.lowContrast + ', <13.5px ' + a.tooSmall + ') · dialogs ' + a.dialogs);
  bad.forEach(b => console.log('    - ' + b));
  if (bad.length) failed = true;
}
await browser.close();
process.exit(failed ? 1 : 0);
