// ===== Historically-style video engine: PAGE BUILDER (node side) =====
// Helpers to build an episode's static SVG scene graph + the final HTML page.
// An episode's scenes.mjs imports these, defines its cues (C) and shots, then calls buildPage().
import fs from 'fs';
import path from 'path';
import { fontCSS } from './render.mjs';
import { venizelos, konstantinos } from './chars.mjs';
import * as P from './props.mjs';
export { P };

export const W = 1920, H = 1080;
// Palette — keep consistent across ALL episodes (see docs/STYLE_BIBLE.md)
export const INK = P.INK, BLUE = '#5D8BD0', RED = '#DE5B45', SAND = '#E6D3A8', YEL = '#FFD54A', SEA = '#79AFC4', NIGHT = '#2f3b4a';

/* ---------- timing / cues ---------- */
const vow = /(αι|ει|οι|υι|ου|αυ|ευ|ηυ|[αεηιουωάέήίόύώϊϋΐΰ])/gi;
export const syl = s => Math.max(1, (s.match(vow) || []).length);
/** Load timing.json (made by tools/align.py + tools/subs.py) and return cue helpers.
 *  S(i)=phrase start, E(i)=phrase end, Wt(i,'word')=estimated time the word starts (syllable interpolation, ±0.3s). */
export function cueTools(timingPath) {
  const timing = JSON.parse(fs.readFileSync(timingPath));
  const PH = timing.phrases;
  const S = i => PH[i].start, E = i => PH[i].end;
  function Wt(i, sub, after = false) {
    const p = PH[i]; const k = p.text.indexOf(sub);
    if (k < 0) throw new Error(`cue word not found in phrase ${i}: "${sub}"  →  ${p.text}`);
    const pre = p.text.slice(0, after ? k + sub.length : k);
    return +(p.start + (p.end - p.start) * ((pre.trim() ? syl(pre) : 0) / syl(p.text))).toFixed(2);
  }
  return { timing, PH, S, E, Wt };
}

/* ---------- element builders ---------- */
// Every animatable element is a <g> with data-x/y/s base transform; runtime put()/slam()/... animate relative to it.
export const G = (id, inner, x = 0, y = 0, s = 1, extra = '') => `<g id="${id}" data-x="${x}" data-y="${y}" data-s="${s}" transform="translate(${x},${y}) scale(${s})" ${extra}>${inner}</g>`;
// Big "Historically" label: white (or colour) heavy condensed caps with thick ink outline. Write Greek CAPS WITHOUT accents.
export const T = (id, str, x, y, size, fill = '#fff', anchor = 'middle', sw = 10, extra = '') =>
  G(id, `<text x="0" y="0" font-family="Fira Sans Extra Condensed" font-weight="900" font-size="${size}" fill="${fill}" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round" paint-order="stroke" text-anchor="${anchor}" letter-spacing="0.5" ${extra}>${str}</text>`, x, y);
let gradN = 0;
// Flat illustrated outdoor/indoor background: gradient sky + ground strip + paper grain. Extra-wide so camera moves never reveal edges.
export const sky = (top = '#9fd0e3', bot = '#e9f3f0', ground = '#c9b98d', gy = 860) => { const id = `skyg${gradN++}`; return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bot}"/></linearGradient></defs>
  <rect x="-400" y="-300" width="${W + 800}" height="${H + 600}" fill="url(#${id})"/>
  <rect x="-400" y="${gy}" width="${W + 800}" height="${H - gy + 400}" fill="${ground}" stroke="${INK}" stroke-width="5"/><rect x="-400" y="-300" width="${W + 800}" height="${H + 600}" fill="#000" filter="url(#paper)" opacity=".18"/>`; };
export const night = (c = NIGHT) => `<rect x="-400" y="-300" width="${W + 800}" height="${H + 600}" fill="${c}"/><rect x="-400" y="-300" width="${W + 800}" height="${H + 600}" fill="#000" filter="url(#paper)" opacity=".25"/>`;
export const clouds = (p, list = [[260, 170, 1], [820, 110, .8], [1500, 190, 1.1]]) => list.map(([x, y, s], i) => G(`${p}-cl${i}`, `<path d="M -90 0 Q -100 -40 -60 -44 Q -50 -80 -10 -70 Q 20 -100 56 -70 Q 100 -76 100 -36 Q 130 -20 100 0 Z" fill="#fff" stroke="${INK}" stroke-width="4" opacity=".95"/>`, x, y, s)).join('');
export const vign = `<rect x="-100" y="-100" width="${W + 200}" height="${H + 200}" fill="url(#vig)" pointer-events="none"/>`;
export const pin = (c) => `<path d="M0 0 C -24 -27 -24 -56 0 -56 C 24 -56 24 -27 0 0 Z" fill="${c}" stroke="${INK}" stroke-width="5"/><circle cx="0" cy="-34" r="8" fill="#fff" stroke="${INK}" stroke-width="4"/>`;
export const K = (id, start = 'neutral') => konstantinos({ id, ink: INK, lw: 5.5, start });
export const V = (id, start = 'neutral') => venizelos({ id, ink: INK, lw: 5.5, start });
export const arrowHead = (id, c = INK) => `<marker id="${id}" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="${c}"/></marker>`;

/* ---------- map helpers (use with engine/map.mjs) ---------- */
// mapDefs(M) puts big paths ONCE in <defs>; shots reference them with <use> (keeps the page small & fast).
export const mapDefs = (M) => `
  <path id="m-land" d="${M.land}"/>
  <path id="m-main" d="${M.mainland}"/><path id="m-north" d="${M.north}"/><path id="m-south" d="${M.south}"/><path id="m-foreign" d="${M.foreign}"/>
  <clipPath id="c-north"><path d="${M.northClip}"/></clipPath><clipPath id="c-thrace"><path d="${M.thraceClip}"/></clipPath><clipPath id="c-occ"><path d="${M.occClip}"/></clipPath>`;
export const seaLand = (p) => `<rect x="-2600" y="-2600" width="7800" height="5300" fill="${SEA}"/><rect id="${p}-waves" x="-2600" y="-2600" width="7800" height="5300" fill="url(#waves)"/>
  <use href="#m-land" fill="${SAND}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><use href="#m-land" fill="#000" filter="url(#paper)" opacity=".42"/>`;
// Greece (1913-1919 borders: no W.Thrace, no Dodecanese) in one colour
export const greeceOne = (c, id = '') => `<g ${id ? `id="${id}"` : ''} stroke="${INK}" stroke-width="4" stroke-linejoin="round">
  <use href="#m-main" fill="${c}"/><use href="#m-north" fill="${c}"/><use href="#m-south" fill="${c}"/>
  <use href="#m-main" fill="${SAND}" clip-path="url(#c-thrace)"/><use href="#m-foreign" fill="${SAND}"/></g>`;
export const paperOver = `<use href="#m-main" fill="#000" filter="url(#paper)" opacity=".35"/>`;

/* ---------- page ---------- */
/** Assemble the episode page.
 *  shots: [{id, a, b, svg}]  (svg = <g id=.. class="shot" style="display:none">…</g>)
 *  subs:  [{a, b, h}]  subtitle chunks (h = html with <b> highlights)
 *  C: cue object (available in browser as D.C);  data: extra JSON for the browser (D.*)
 *  extraDefs: svg defs string (map defs, clipPaths used across shots, patterns)
 *  shotsJs: path (relative to the html) of the episode's shots.js */
export function buildPage({ out, shots, subs, C, data = {}, extraDefs = '', shotsJs = 'shots.js', runtimeJs }) {
  const html = `<!doctype html><html lang="el"><meta charset="utf-8"><style>${fontCSS}
html,body{margin:0;width:${W}px;height:${H}px;overflow:hidden;background:#000}
#sub{position:absolute;left:180px;right:180px;bottom:34px;text-align:center;font-family:Commissioner;font-weight:700;font-size:38px;line-height:1.3;color:#fff;-webkit-text-stroke:8px ${INK};paint-order:stroke fill}
#sub b{color:${YEL};font-weight:800}
</style>
<svg id="root" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="position:absolute;inset:0">
<defs>${extraDefs}${P.ukFlagPattern}${arrowHead('ah')}
  <filter id="paper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="3" seed="4" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 .35  0 0 0 0 .26  0 0 0 0 .16  0 0 0 .55 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>
  <filter id="boil" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence id="boilT" type="fractalNoise" baseFrequency=".035" numOctaves="1" seed="1" result="t"/><feDisplacementMap in="SourceGraphic" in2="t" scale="3" xChannelSelector="R" yChannelSelector="G"/></filter>
  <radialGradient id="vig" cx="50%" cy="48%" r="75%"><stop offset="55%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#0c1a24" stop-opacity=".5"/></radialGradient>
  <pattern id="waves" width="90" height="46" patternUnits="userSpaceOnUse"><path d="M8 30 q10 -9 20 0 q10 9 20 0" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="3" stroke-linecap="round"/></pattern>
</defs>
<g id="stage">${shots.map(s => s.svg).join('\n')}</g>
<rect id="flash" width="${W}" height="${H}" fill="#fff" opacity="0"/>
</svg>
<div id="sub"></div>
<script>window.D=${JSON.stringify({ C, shots: shots.map(s => ({ id: s.id, a: s.a, b: s.b })), subs, ...data })};</script>
<script src="${runtimeJs}"></script>
<script src="${shotsJs}"></script>
<script>window.seek(0);</script>`;
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
  return html.length;
}

/** Subtitle chunks from timing.json with yellow highlights for key terms (book-verbatim text!). */
export function makeSubs(timing, highlights, { skipBefore = 0 } = {}) {
  return timing.chunks.filter(c => c.a >= skipBefore).map(c => {
    let h = c.text.replace(/&/g, '&amp;');
    for (const w of [...highlights].sort((a, b) => b.length - a.length)) h = h.split(w).join(`\u0001${w}\u0002`);
    h = h.replace(/\u0001/g, '<b>').replace(/\u0002/g, '</b>');
    return { a: c.a, b: c.b, h };
  });
}
