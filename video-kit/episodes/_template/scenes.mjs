// Ενότητα NN «ΤΙΤΛΟΣ» — SCENES (node side). Copy patterns from ../enotita-04/scenes.mjs.
// Run from the kit root:  node episodes/<ep>/scenes.mjs   →  build/video.html + build/cues.json
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildMap } from '../../engine/map.mjs';
import { P, W, H, INK, BLUE, RED, SAND, YEL, SEA, NIGHT, cueTools, G, T, sky, night, clouds, vign, pin, K, V, mapDefs, seaLand, greeceOne, paperOver, buildPage, makeSubs } from '../../engine/page.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const { timing, PH, S, E, Wt } = cueTools(path.join(HERE, 'timing.json'));

// ---------- cues (one per visual beat; Wt(phrase, 'word') — words exactly as in voice.txt) ----------
const C = {
  t1: 0.05, t2: S(1),
  // e.g. dix: Wt(4, 'Διχασμός'),
  end: E(PH.length - 1),
};

// ---------- map (only if the episode uses maps) ----------
const M = buildMap({ box: [[390, 10], [1630, 1070]], clip: [[-2600, -2600], [5200, 2700]] });
const pl = { athens: [23.73, 37.98], thess: [22.94, 40.64] };           // add places used by this episode
const PP = Object.fromEntries(Object.entries(pl).map(([k, v]) => [k, M.pt(v)]));

// ---------- shots (must tile 0 → C.end + 2.4) ----------
const shots = [];
const shot = (id, a, b, inner) => shots.push({ id, a, b, svg: `<g id="${id}" class="shot" style="display:none">${inner}</g>` });
// cut(i) = the boundary 0.15 s before phrase i (QA «shot boundaries 0.1–0.2 s before the phrase»). Use it for EVERY bound:
// no literal seconds anywhere, so a new voice re-times the film (k2-a1 was built on a draft voice and re-timed for free).
// Need a shot to hold longer (a label landing late)? cut(i) + .5 — still relative, still survives a new voice.
const cut = i => i === 0 ? 0 : +(S(i) - .15).toFixed(2);

shot('S1', cut(0), cut(2), `<g id="S1-cam">${seaLand('S1')}${greeceOne(BLUE)}${paperOver}</g>${vign}
  ${T('S1-t1', 'ΕΝΟΤΗΤΑ NN', 960, 470, 92, YEL, 'middle', 12)}${T('S1-t2', 'ΤΙΤΛΟΣ ΕΝΟΤΗΤΑΣ', 960, 600, 128, '#fff', 'middle', 16)}`);

shot('S2', cut(2), C.end + 2.4, `<g id="S2-cam">${sky()}${clouds('S2')}
  ${G('S2-V', V('s2v'), 960, 880, 1.2)}${T('S2-l', 'ΛΕΞΗ-ΚΛΕΙΔΙ', 960, 160, 96)}</g>${vign}
  <rect id="S2-black" width="${W}" height="${H}" fill="#000" opacity="0"/>`);

// ---------- page ----------
const HL = [/* key exam terms to highlight in subtitles, exactly as in book.txt */];
const subs = makeSubs(timing, HL, { skipBefore: S(2) - .2 });
const extraDefs = mapDefs(M);
const n = buildPage({ out: path.join(HERE, 'build/video.html'), shots, subs, C, extraDefs, data: { PP },
  runtimeJs: '../../../engine/runtime.js', shotsJs: '../shots.js' });
fs.writeFileSync(path.join(HERE, 'build/cues.json'), JSON.stringify({ ...C, DUR: C.end + 2.4 }, null, 1));
console.log('built', (n / 1e6).toFixed(2), 'MB,', shots.length, 'shots, duration', (C.end + 2.4).toFixed(1), 's');
