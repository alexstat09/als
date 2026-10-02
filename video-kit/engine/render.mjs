import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const fontDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../node_modules/@fontsource');
export const fontCSS = (() => {
  const faces = [
    ['Fira Sans Extra Condensed', 'fira-sans-extra-condensed', [600, 700, 800, 900], ['normal']],
    ['Commissioner', 'commissioner', [400, 500, 600, 700, 800], ['normal']],
    ['Noto Serif Display', 'noto-serif-display', [300, 400, 500, 600], ['italic', 'normal']],
    ['JetBrains Mono', 'jetbrains-mono', [400, 500, 600], ['normal']],
  ];
  let css = '';
  for (const [fam, dir, ws, styles] of faces) for (const w of ws) for (const s of styles) for (const sub of ['greek', 'latin']) {
    const f = `${fontDir}/${dir}/files/${dir}-${sub}-${w}-${s}.woff2`;
    if (!fs.existsSync(f)) continue;
    css += `@font-face{font-family:'${fam}';font-weight:${w};font-style:${s};src:url(${pathToFileURL(f).href}) format('woff2');}\n`;
  }
  return css;
})();

export async function render(pages) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const fullPage = true;
  for (const [html, out] of pages) {
    const file = path.resolve(out.replace(/\.png$/, '.html'));
    fs.writeFileSync(file, `<!doctype html><html lang="el"><meta charset="utf-8"><style>${fontCSS} html,body{margin:0;min-width:1920px;min-height:1080px}</style>${html}`);
    await page.goto(pathToFileURL(file).href);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(200);
    await page.screenshot({ path: out, fullPage });
  }
  await browser.close();
}
