// Ενότητα 4 «Ο Α΄ Παγκόσμιος πόλεμος» — SCENES (node side). Worked example for the kit.
// Run from the kit root:  node episodes/enotita-04/scenes.mjs   →  episodes/enotita-04/build/video.html
import path from 'path';
import { fileURLToPath } from 'url';
import { buildMap } from '../../engine/map.mjs';
import { P, W, H, INK, BLUE, RED, SAND, YEL, SEA, cueTools, G, T, sky, clouds, vign, pin, K, V, mapDefs, seaLand, greeceOne, paperOver, buildPage, makeSubs } from '../../engine/page.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const { timing, PH, S, E, Wt } = cueTools(path.join(HERE, 'timing.json'));

// ---------- cues: every visual beat is keyed to a word of the narration ----------
const C = {
  // intro
  t1: 0.05, t2: S(1),
  complex: Wt(2, 'περίπλοκες'), difficult: Wt(2, 'δύσκολες'),
  palace: Wt(3, 'παλατιού'), veni: Wt(3, 'Βενιζέλο'), dix: S(4),
  askopi: Wt(6, 'άσκοπη'), dapan: Wt(6, 'δαπανηρή'), y1915: Wt(6, 'χίλια'),
  ethn: Wt(7, 'Εθνικής'), thess7: Wt(7, 'Θεσσαλονίκη'), diasp: Wt(7, 'διάσπαση'), dyo: Wt(7, 'δυο'),
  apokl: S(8), sygkr: Wt(8, 'συγκρούσεις'),
  oik: Wt(9, 'οικονομικό'), koin: Wt(9, 'κοινωνικό'), ypon: Wt(9, 'υπονόμευσαν'), kekt: Wt(9, 'κεκτημένα'),
  epemv: S(11), enop: S(12), y1917: Wt(12, 'χίλια'), venUnder: Wt(12, 'Βενιζέλο'),
  adyn: S(13), xoris: S(14), kostos: S(15),
  symm16: S(16), daneism: Wt(16, 'ιδιόμορφο'), odyn: Wt(17, 'οδυνηρές'), mellon: Wt(17, 'μέλλον'),
  gal: S(18), vret: Wt(19, 'Μεγάλη'), ipa: Wt(19, 'ΗΠΑ'), enekr: Wt(19, 'ενέκριναν'), pros: Wt(19, 'προς'),
  lires: S(20), fragka: S(21), dolaria: Wt(21, 'πενήντα'),
  theor: Wt(22, 'θεωρητικός'), ektam: Wt(23, 'εκταμιεύτηκαν'), dothik: Wt(23, 'δόθηκαν'),
  kalymma: Wt(24, 'κάλυμμα'), ekdosi: Wt(24, 'έκδοση'), xartonom: Wt(24, 'χαρτονομίσματος'), polem25: Wt(25, 'πολεμική'),
  apoth: Wt(26, 'αποθέματος'), xrys: Wt(28, 'χρυσό'), synal: Wt(28, 'συνάλλαγμα'), elegx: Wt(29, 'έλεγχο'),
  ellada30: S(30), maked: Wt(32, 'μακεδονικό'), oukr: Wt(33, 'Ουκρανία'), krim: Wt(33, 'Κριμαία'), mikra34: Wt(34, 'Μικρά'),
  synep35: S(35), isorr: Wt(35, 'ισορροπίας'), fanoun: Wt(35, 'φανούν'),
  y1920: Wt(36, 'χίλια'), exase: Wt(36, 'έχασε'), anelav: Wt(36, 'ανέλαβαν'), epanaf: Wt(36, 'επαναφέρουν'), anepith: Wt(36, 'ανεπιθύμητο'), kon: Wt(36, 'Κωνσταντίνο'),
  symm37: S(37), antip: S(38), aposyr: Wt(39, 'αποσύρουν'), xoris40: Wt(40, 'χωρίς'),
  y1918: Wt(42, 'χίλια'), pathit: Wt(43, 'παθητικό'), mikra44: Wt(44, 'Μικρά'), sklir: Wt(44, 'σκληρό'), dapan44: Wt(44, 'δαπανηρό'),
  y1922: Wt(45, 'χίλια'), adiex: Wt(45, 'αδιέξοδο'), aprosm: Wt(46, 'απρόσμενο'),
  liges: S(47), katarr: Wt(47, 'κατάρρευση'),
  kyv48: S(48), anagk: Wt(48, 'αναγκαστικό'), dixot: Wt(49, 'διχοτόμηση'),
  aristero: S(50), pente: Wt(50, 'πενήντα'), dexio: Wt(51, 'δεξιό'), omol: Wt(51, 'ομολογίες'),
  epityx: Wt(52, 'στέφθηκε'), kratos: S(53), dis: Wt(53, 'δισεκατομμύριο'), peir: Wt(53, 'πείραμα'), y1926: Wt(53, 'χίλια'),
  fysika: S(54), elig: Wt(55, 'ελιγμός'), proll: Wt(55, 'προλάβει'), mikras: Wt(55, 'Μικρασιατική'), synep55: Wt(55, 'βαρύτατες'),
  end: E(55),
};

// ---------- maps ----------
const M = buildMap({ box: [[390, 10], [1630, 1070]], clip: [[-2600, -2600], [5200, 2700]] });
const pl = { thess: [22.94, 40.64], athens: [23.73, 37.98], piraeus: [23.64, 37.94], odessa: [30.73, 46.48], sevast: [33.52, 44.62], kherson: [32.62, 46.64], smyrna: [27.14, 38.42], ankara: [32.86, 39.93], sakarya: [31.95, 39.62], usak: [29.4, 38.68], eski: [30.52, 39.78], afyon: [30.54, 38.76], istanbul: [28.98, 41.01] };
const PP = Object.fromEntries(Object.entries(pl).map(([k, v]) => [k, M.pt(v)]));
const line = pts => 'M' + pts.map(p => M.pt(p).join(',')).join('L');
const crackPts = (() => { let s = 11; const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280) - .5;
  const xy = [[20.72, 40.35], [20.9, 40.28], [21.5, 40.06], [22.2, 39.99], [22.75, 39.96], [23.25, 39.86]].map(M.pt), out = [];
  for (let i = 0; i < xy.length - 1; i++) { const [x0, y0] = xy[i], [x1, y1] = xy[i + 1], dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
    for (let k = 0; k < 7; k++) { const t = k / 7, j = (k === 0 && i === 0) ? 0 : rnd() * 20; out.push([x0 + dx * t + nx * j, y0 + dy * t + ny * j]); } }
  out.push(xy[xy.length - 1]); return out; })();
const crackD = 'M' + crackPts.map(p => p.map(v => v.toFixed(1)).join(',')).join('L');
const macFront = line([[20.75, 41.02], [21.1, 41.08], [21.35, 41.13], [21.6, 41.0], [21.8, 40.98], [21.95, 41.14], [22.25, 41.17], [22.5, 41.2], [22.75, 41.22], [23.05, 41.22], [23.35, 41.2], [23.6, 41.05], [23.8, 40.85]]);
const seaRoute = line([[22.94, 40.55], [23.9, 40.0], [25.2, 39.95], [26.2, 40.05], [26.45, 40.25], [26.7, 40.42], [27.6, 40.75], [28.95, 41.0], [29.1, 41.25], [29.6, 42.4], [30.4, 44.2], [30.73, 46.3]]);
const seaRoute2 = line([[29.6, 42.4], [31.6, 43.6], [33.4, 44.5]]);
const amRoute = line([[23.6, 37.9], [24.6, 38.0], [25.8, 38.3], [27.0, 38.42]]);
const amAdvance = line([[27.14, 38.42], [28.2, 38.6], [29.4, 38.68], [30.54, 38.76], [30.6, 39.3], [31.4, 39.55], [31.95, 39.62]]);
const amRetreat = line([[31.95, 39.62], [30.6, 39.2], [29.4, 38.68], [28.2, 38.55], [27.2, 38.43]]);

// ---------- shots ----------
const shots = [];
const shot = (id, a, b, inner) => shots.push({ id, a, b, svg: `<g id="${id}" class="shot" style="display:none">${inner}</g>` });

// S1 intro: zoom from Europe, titles
shot('S1', 0, 4.1, `<g id="S1-cam">${seaLand('S1')}${greeceOne(BLUE)}${paperOver}</g>${vign}
  ${T('S1-t1', 'ΕΝΟΤΗΤΑ 4', 960, 470, 92, YEL, 'middle', 12)}${T('S1-t2', 'Ο Α΄ ΠΑΓΚΟΣΜΙΟΣ ΠΟΛΕΜΟΣ', 960, 600, 128, '#fff', 'middle', 16)}`);

// S2 complicated conditions: tangled scribble around Greece
const scribble = (() => { let s = 5; const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280); const c = [1000, 540]; const pts = [];
  for (let i = 0; i < 40; i++) { const a = i * 1.05 + r() * .8, rad = 330 + r() * 200; pts.push([c[0] + Math.cos(a) * rad * 1.15, c[1] + Math.sin(a) * rad * .85]); }
  let d = `M${pts[0][0].toFixed(0)},${pts[0][1].toFixed(0)}`;
  for (let i = 1; i < pts.length - 2; i++) { const p0 = pts[i - 1], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1.map(v => v.toFixed(0))} ${c2.map(v => v.toFixed(0))} ${p2.map(v => v.toFixed(0))}`; } return d; })();
shot('S2', 4.1, 10.62, `<g id="S2-cam">${seaLand('S2')}${greeceOne(BLUE)}${paperOver}
  <path id="S2-scr" d="${scribble}" fill="none" stroke="${INK}" stroke-width="9" stroke-linejoin="round" stroke-linecap="round" pathLength="1000" stroke-dasharray="1000 1000" stroke-dashoffset="1000" opacity=".85"/>
  ${['?', '?', '!', '?', '?'].map((q, i) => T(`S2-q${i}`, q, [620, 1450, 700, 1380, 1050][i], [300, 360, 820, 760, 180][i], 130, i === 2 ? RED : '#fff', 'middle', 12)).join('')}</g>${vign}
  ${T('S2-lbl', 'ΔΥΣΚΟΛΕΣ & ΠΕΡΙΠΛΟΚΕΣ ΣΥΝΘΗΚΕΣ', 960, 140, 76, '#fff', 'middle', 12)}`);

// S3 palace vs Venizelos + ΔΙΧΑΣΜΟΣ stamp
shot('S3', 10.62, 15.55, `<g id="S3-cam">${sky('#f3c58f', '#fbe9cf', '#d4c08e', 880)}${clouds('S3')}
  ${G('S3-pal', P.palace(), 560, 880, 1.45)}${G('S3-K', K('s3k'), 560, 900, 1.0)}
  ${G('S3-V', V('s3v'), 1400, 880, 1.15)}
  <g id="S3-spark" stroke="${INK}" stroke-width="9" stroke-linecap="round" opacity="0"><path d="M 900 420 l 70 -20 M 905 480 l 80 6 M 900 540 l 66 30"/><path d="M 1150 420 l -70 -20 M 1145 480 l -80 6 M 1150 540 l -66 30"/></g>
  ${T('S3-n1', 'ΠΑΛΑΤΙ', 560, 240, 64)}${T('S3-n2', 'ΒΕΝΙΖΕΛΟΣ', 1400, 330, 64)}</g>${vign}
  ${G('S3-stamp', P.stamp('ΔΙΧΑΣΜΟΣ', '#C0392B', 760, 128), 960, 540, 1, 'opacity="0"')}`);

// S4 mobilisation 1915: bored soldiers + leaking money sack
shot('S4', 15.55, 20.42, `<g id="S4-cam">${sky('#a8d4e6', '#eef6f0', '#b9c27e', 860)}${clouds('S4')}
  ${[0, 1, 2, 3].map(i => G(`S4-s${i}`, P.soldier(`s4s${i}`, { start: 'neutral' }), 240 + i * 250, 860, .95)).join('')}
  ${G('S4-bag', P.moneyBag('δρχ', '#c9a46a'), 1520, 860, 1.5)}
  <g id="S4-coins">${Array.from({ length: 14 }, (_, i) => `<circle id="S4-c${i}" r="16" fill="#F2C14E" stroke="${INK}" stroke-width="4" cx="0" cy="0" opacity="0"/>`).join('')}</g>
  ${G('S4-arr', `<path d="M 0 -60 V 40" stroke="${RED}" stroke-width="26" stroke-linecap="round"/><path d="M -40 10 L 0 60 L 40 10" fill="none" stroke="${RED}" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>`, 1760, 600, 1, 'opacity="0"')}
  ${T('S4-l1', 'ΑΣΚΟΠΗ', 615, 470, 84, '#fff')}${T('S4-l2', 'ΔΑΠΑΝΗΡΗ', 1520, 470, 84, '#fff')}</g>${vign}
  ${T('S4-y', '1915', 160, 150, 110, YEL, 'start', 14)}${T('S4-t', 'ΕΠΙΣΤΡΑΤΕΥΣΗ', 160, 250, 76, '#fff', 'start', 12)}`);

// S5 the split (map) — from the approved test
shot('S5', 20.42, 27.82, `<g id="S5-cam">${seaLand('S5')}
  <g stroke="${INK}" stroke-width="4" stroke-linejoin="round">
   <use href="#m-main" fill="${BLUE}"/><use href="#m-north" fill="${BLUE}"/><use href="#m-south" fill="${BLUE}"/>
   <g clip-path="url(#S5-spread)"><use href="#m-main" fill="${RED}" clip-path="url(#c-north)"/><use href="#m-north" fill="${RED}"/></g>
   <use href="#m-main" fill="${SAND}" clip-path="url(#c-occ)"/><use href="#m-main" fill="${SAND}" clip-path="url(#c-thrace)"/><use href="#m-foreign" fill="${SAND}"/></g>${paperOver}
  <path id="S5-crA" d="${crackD}" fill="none" stroke="${INK}" stroke-width="22" stroke-linecap="round" pathLength="1000" stroke-dasharray="1000 1000" stroke-dashoffset="1000"/>
  <path id="S5-crB" d="${crackD}" transform="translate(0,-3)" fill="none" stroke="#FFE9A8" stroke-width="5" stroke-linecap="round" pathLength="1000" stroke-dasharray="1000 1000" stroke-dashoffset="1000"/>
  ${G('S5-pT', pin(RED), PP.thess[0], PP.thess[1])}${G('S5-pA', pin(BLUE), PP.athens[0], PP.athens[1])}
  ${T('S5-lT', 'ΘΕΣΣΑΛΟΝΙΚΗ', PP.thess[0] + 34, PP.thess[1] - 60, 46, '#fff', 'start')}${T('S5-lT2', 'ΕΘΝΙΚΗ ΑΜΥΝΑ', PP.thess[0] + 36, PP.thess[1] - 22, 32, YEL, 'start', 8)}
  ${T('S5-lA', 'ΑΘΗΝΑ', PP.athens[0] + 34, PP.athens[1] - 6, 46, '#fff', 'start')}${T('S5-lA2', 'ΠΑΛΑΤΙ', PP.athens[0] + 36, PP.athens[1] + 32, 32, YEL, 'start', 8)}</g>${vign}
  <defs><clipPath id="S5-spread"><circle id="S5-sc" cx="${PP.thess[0]}" cy="${PP.thess[1]}" r="0"/></clipPath></defs>
  <g id="S5-spark" stroke="${INK}" stroke-width="7" stroke-linecap="round" opacity="0"><path d="M520 560 l 46 -12 M528 600 l 50 4 M520 640 l 44 20"/><path d="M1410 560 l -46 -12 M1402 600 l -50 4 M1410 640 l -44 20"/></g>
  <g filter="url(#boil)">${G('S5-K', K('s5k'), 300, 1010, 1.62)}${G('S5-V', V('s5v'), 1630, 1010, 1.62)}</g>
  ${T('S5-y', '1916', 64, 110, 72, YEL, 'start', 12)}${T('S5-dyo', 'ΔΥΟ ΚΡΑΤΗ', 960, 200, 150, '#fff', 'middle', 18)}`);

// S6 Allied blockade + clashes
shot('S6', 27.82, 30.55, `<g id="S6-cam">${sky('#b7d7e4', '#e8f1ef', SEA, 640)}
  <path d="M -100 640 L 640 640 Q 700 560 760 520 L 980 470 L 1100 520 L 1200 640 L 2100 640" fill="none"/>
  <path d="M -100 640 L -100 470 Q 200 430 420 470 Q 560 500 640 560 L 700 640 Z" fill="${SAND}" stroke="${INK}" stroke-width="5"/>
  <g transform="translate(300,470)"><path d="M -90 0 L -80 -40 L 80 -40 L 90 0 Z" fill="#efe4c9" stroke="${INK}" stroke-width="4"/>${Array.from({ length: 6 }, (_, i) => `<rect x="${-70 + i * 26}" y="-84" width="12" height="44" fill="#f6eedc" stroke="${INK}" stroke-width="3"/>`).join('')}<path d="M -84 -84 L 0 -112 L 84 -84 Z" fill="#efe4c9" stroke="${INK}" stroke-width="4"/></g>
  ${T('S6-pir', 'ΠΕΙΡΑΙΑΣ', 300, 330, 54)}
  <rect x="-100" y="640" width="2200" height="500" fill="url(#waves)"/>
  ${[['fr', 900, 700], ['uk', 1250, 760], ['fr', 1600, 700], ['uk', 1950, 770]].map(([f, x, y], i) => G(`S6-sh${i}`, P.ship(f, .9), x, y)).join('')}
  ${G('S6-boat', `<path d="M -70 0 L 70 0 L 50 30 L -50 30 Z" fill="#a0764c" stroke="${INK}" stroke-width="4"/><rect x="-40" y="-36" width="34" height="36" fill="#d9b77a" stroke="${INK}" stroke-width="4"/><rect x="0" y="-30" width="30" height="30" fill="#c99f5a" stroke="${INK}" stroke-width="4"/><path d="M -30 -36 q 6 -14 12 0 M -20 -36 v -10" stroke="${INK}" stroke-width="3" fill="none"/>`, 1100, 940, 1.3)}
  ${G('S6-x', `<path d="M -40 -40 L 40 40 M 40 -40 L -40 40" stroke="${RED}" stroke-width="18" stroke-linecap="round"/>`, 1100, 860, 1, 'opacity="0"')}
  ${T('S6-l', 'ΣΥΜΜΑΧΙΚΟΣ ΑΠΟΚΛΕΙΣΜΟΣ', 960, 150, 88)}
  ${G('S6-clash', `<circle r="120" fill="#efe4c9" stroke="${INK}" stroke-width="6"/><path d="M -80 80 L 70 -70 M 80 80 L -70 -70" stroke="#9aa" stroke-width="18" stroke-linecap="round"/><path d="M -80 80 L 70 -70 M 80 80 L -70 -70" stroke="${INK}" stroke-width="4" stroke-linecap="round" fill="none"/>`, 520, 300, 1, 'opacity="0"')}
  ${T('S6-l2', 'ΣΥΓΚΡΟΥΣΕΙΣ', 520, 480, 64, YEL)}</g>${vign}`);

// S7 cost meters
shot('S7', 30.55, 34.62, `<rect width="${W}" height="${H}" fill="#2f3b4a"/><rect width="${W}" height="${H}" fill="#000" filter="url(#paper)" opacity=".25"/>
  ${[['ΟΙΚΟΝΟΜΙΚΟ ΚΟΣΤΟΣ', 360], ['ΚΟΙΝΩΝΙΚΟ ΚΟΣΤΟΣ', 640]].map(([l, y], i) => `<g id="S7-m${i}" opacity="0"><text x="510" y="${y - 30}" font-family="Fira Sans Extra Condensed" font-weight="900" font-size="60" fill="#fff" stroke="${INK}" stroke-width="10" paint-order="stroke">${l}</text>
   <rect x="510" y="${y}" width="900" height="80" rx="40" fill="#efe4c9" stroke="${INK}" stroke-width="6"/><rect id="S7-f${i}" x="516" y="${y + 6}" width="0" height="68" rx="34" fill="${RED}"/>
   <rect x="510" y="${y}" width="900" height="80" rx="40" fill="none" stroke="${INK}" stroke-width="6"/>${G(`S7-w${i}`, `<text font-family="Fira Sans Extra Condensed" font-weight="900" font-size="72" fill="${YEL}" stroke="${INK}" stroke-width="10" paint-order="stroke" text-anchor="middle">ΜΕΓΑΛΟ!</text>`, 1560, y + 64, 1, 'opacity="0"')}</g>`).join('')}${vign}`);

// S8 undermined achievements
shot('S8', 34.62, 39.32, `<g id="S8-cam">${sky('#a8d4e6', '#eef6f0', '#b38d5f', 760)}${clouds('S8')}
  <rect x="-200" y="760" width="2400" height="400" fill="#8a6a46" stroke="${INK}" stroke-width="5"/>
  <path id="S8-tun" d="M 160 1080 L 160 900 Q 160 860 220 860 L 1300 860" fill="none" stroke="#3a2a1e" stroke-width="90" stroke-linecap="round" pathLength="1000" stroke-dasharray="1000 1000" stroke-dashoffset="1000"/>
  ${G('S8-bld', P.building('ΚΕΚΤΗΜΕΝΑ'), 1100, 760, 1.6)}
  <defs><clipPath id="S8-under"><rect x="-400" y="764" width="2800" height="600"/></clipPath></defs><g clip-path="url(#S8-under)">${G('S8-dig', P.person({ id: 's8d', coat: '#5a4636', pants: '#3a2e24', hat: 'flat', start: 'happy', prop: `<g transform="translate(70,-90) rotate(30)"><rect x="-5" y="-90" width="10" height="120" fill="#6b4a2b" stroke="${INK}" stroke-width="4"/><path d="M -26 -110 Q 0 -80 26 -110 L 10 -88 L -10 -88 Z" fill="#999" stroke="${INK}" stroke-width="4"/></g>` }), 300, 930, .5)}</g>
  <g id="S8-cracks" stroke="${INK}" stroke-width="7" fill="none" opacity="0"><path d="M 900 420 l 40 60 l -30 50 l 40 60"/><path d="M 1300 380 l -30 70 l 30 40 l -20 80"/></g>
  ${T('S8-l', 'ΥΠΟΝΟΜΕΥΣΑΝ', 960, 170, 110, YEL, 'middle', 14)}</g>${vign}`);

// S9 reunification 1917
shot('S9', 39.32, 46.62, `<g id="S9-cam">${seaLand('S9')}
  <g stroke="${INK}" stroke-width="4" stroke-linejoin="round">
   <use href="#m-main" fill="${BLUE}"/><use href="#m-south" fill="${BLUE}"/><use href="#m-main" fill="${RED}" clip-path="url(#c-north)"/><use href="#m-north" fill="${RED}"/>
   <g clip-path="url(#S9-spread)"><use href="#m-main" fill="${RED}"/><use href="#m-south" fill="${RED}"/></g>
   <use href="#m-main" fill="${SAND}" clip-path="url(#c-thrace)"/><use href="#m-foreign" fill="${SAND}"/></g>${paperOver}
  <path id="S9-cr" d="${crackD}" fill="none" stroke="${INK}" stroke-width="22" stroke-linecap="round" pathLength="1000" stroke-dasharray="1000 1000" stroke-dashoffset="0"/>
  <defs><clipPath id="S9-spread"><circle id="S9-sc" cx="${PP.athens[0]}" cy="${PP.athens[1] - 200}" r="0"/></clipPath></defs></g>${vign}
  ${G('S9-hL', `<path d="M -400 0 L -60 0" stroke="${INK}" stroke-width="64" stroke-linecap="round"/><path d="M -400 0 L -60 0" stroke="#0055A4" stroke-width="50" stroke-linecap="round"/><circle cx="-40" cy="0" r="56" fill="#F7F1E8" stroke="${INK}" stroke-width="6"/><g transform="translate(-330,-34)">${P.flag('fr', 90, 60)}</g>`, -200, 560)}
  ${G('S9-hR', `<path d="M 400 0 L 60 0" stroke="${INK}" stroke-width="64" stroke-linecap="round"/><path d="M 400 0 L 60 0" stroke="#012169" stroke-width="50" stroke-linecap="round"/><circle cx="40" cy="0" r="56" fill="#F7F1E8" stroke="${INK}" stroke-width="6"/><g transform="translate(240,-34)">${P.flag('uk', 90, 60)}</g>`, 2120, 560)}
  ${T('S9-ep', 'ΕΠΕΜΒΑΣΗ ΤΩΝ ΣΥΜΜΑΧΩΝ', 960, 150, 82)}
  <g filter="url(#boil)">${G('S9-V', V('s9v', 'happy'), 960, 1010, 1.35)}</g>
  ${T('S9-y', '1917', 64, 110, 72, YEL, 'start', 12)}${T('S9-en', 'ΕΝΟΠΟΙΗΣΗ', 960, 280, 120, '#fff', 'middle', 16)}`);

// S10 can't carry the cost alone
shot('S10', 46.62, 52.8, `<g id="S10-cam">${sky('#cbb7a0', '#efe3d2', '#9c8a6a', 900)}
  ${G('S10-wt', P.weightBlock('ΚΟΣΤΟΣ ΠΟΛΕΜΟΥ'), 960, 690, 1.3)}
  ${G('S10-V', P.person({ id: 's10v', coat: '#2a2b31', pants: '#34353c', hair: 'side', hairC: '#D9D5CE', face: 'goatee', faceC: '#D9D5CE', arms: 'up', start: 'strain', glasses: true }), 960, 900, 1.25)}
  <g id="S10-sweat" opacity="0">${[[860, 420], [1060, 410], [840, 520]].map(([x, y]) => `<path d="M ${x} ${y} q 10 22 0 30 q -10 -8 0 -30 Z" fill="#7fc1e8" stroke="${INK}" stroke-width="3"/>`).join('')}</g>
  <g id="S10-help" opacity="0">${[420, 1500].map(x => `<g transform="translate(${x},900)"><path d="M -60 -300 Q -60 -360 0 -360 Q 60 -360 60 -300 L 60 0 L -60 0 Z" fill="none" stroke="${INK}" stroke-width="6" stroke-dasharray="18 14"/><text x="0" y="-150" text-anchor="middle" font-family="Fira Sans Extra Condensed" font-weight="900" font-size="120" fill="${INK}" opacity=".5">?</text></g>`).join('')}</g>
  ${T('S10-l', 'ΧΩΡΙΣ ΕΞΩΤΕΡΙΚΗ ΑΡΩΓΗ', 960, 130, 80, '#fff')}${T('S10-l2', 'ΑΔΥΝΑΤΟ!', 1560, 330, 96, RED, 'middle', 12)}</g>${vign}`);

// S11 Allies offer the peculiar loan; ominous future
shot('S11', 52.8, 60.45, `<g id="S11-cam">${sky('#bfe0ea', '#f2f7f1', '#c2b48a', 880)}${clouds('S11')}
  <g transform="translate(2600,0)">${sky('#56606f', '#8b8f99', '#6f6a5a', 880).replace(/id="g-56606f"/, 'id="g-56606f"').replace(/x="-200"/, 'x="-400"')}</g>
  ${G('S11-V', V('s11v', 'neutral'), 520, 880, 1.25)}
  ${G('S11-fr', P.marianne('s11f', { start: 'happy' }), 1180, 880, 1.1)}${G('S11-uk', P.johnbull('s11u', { start: 'happy' }), 1450, 880, 1.1)}${G('S11-us', P.unclesam('s11s', { start: 'happy' }), 1720, 880, 1.1)}
  ${G('S11-scr', P.scroll('ΔΑΝΕΙΟ', 340), 880, 560, 1)}
  ${T('S11-l', 'ΙΔΙΟΜΟΡΦΟΣ ΔΑΝΕΙΣΜΟΣ', 960, 150, 88)}
  ${G('S11-storm', P.cloudStorm(), 2600 + 960, 420, 1.5)}${T('S11-fut', 'ΜΕΛΛΟΝ', 2600 + 960, 760, 110, '#fff', 'middle', 14)}${T('S11-od', 'ΟΔΥΝΗΡΕΣ ΣΥΝΕΠΕΙΕΣ', 2600 + 960, 160, 84, YEL)}</g>${vign}`);

// S12 three lenders approve
shot('S12', 60.45, 67.72, `<g id="S12-cam">${sky('#bfe0ea', '#f2f7f1', '#c2b48a', 880)}${clouds('S12')}
  ${G('S12-fr', P.marianne('s12f', { start: 'happy' }), 420, 880, 1.15)}${G('S12-uk', P.johnbull('s12u', { start: 'happy' }), 960, 880, 1.15)}${G('S12-us', P.unclesam('s12s', { start: 'happy' }), 1500, 880, 1.15)}
  ${T('S12-n0', 'ΓΑΛΛΙΑ', 420, 980, 64)}${T('S12-n1', 'ΜΕΓΑΛΗ ΒΡΕΤΑΝΙΑ', 960, 980, 64)}${T('S12-n2', 'ΗΠΑ', 1500, 980, 64)}
  ${G('S12-f0', P.flag('fr', 120, 80), 360, 200)}${G('S12-f1', P.flag('uk', 120, 80), 900, 200)}${G('S12-f2', P.flag('us', 120, 80), 1440, 200)}
  ${G('S12-st', P.stamp('ΕΓΚΡΙΘΗΚΑΝ', '#2e8b57', 640, 104), 960, 520, 1, 'opacity="0"')}
  ${T('S12-ar', 'ΔΑΝΕΙΑ → ΕΛΛΑΔΑ', 960, 140, 84, YEL, 'middle', 12)}</g>${vign}`);

// S13 three bags with amounts
shot('S13', 67.72, 76.12, `<rect width="${W}" height="${H}" fill="#2f3b4a"/><rect width="${W}" height="${H}" fill="#000" filter="url(#paper)" opacity=".25"/>
  ${[['£', '#c9a46a', 'uk', 'ΛΙΡΕΣ ΑΓΓΛΙΑΣ'], ['₣', '#b8c4d9', 'fr', 'ΓΑΛΛΙΚΑ ΦΡΑΓΚΑ'], ['$', '#bcd9b8', 'us', 'ΔΟΛΑΡΙΑ ΗΠΑ']].map(([s, c, f, n], i) => `
   ${G(`S13-b${i}`, P.moneyBag(s, c), 400 + i * 560, 680, 1.9)}
   ${G(`S13-fl${i}`, P.flag(f, 96, 64), 352 + i * 560, 180)}
   ${T(`S13-v${i}`, '0', 400 + i * 560, 790, 80, YEL, 'middle', 12)}${T(`S13-n${i}`, n, 400 + i * 560, 855, 48, '#fff', 'middle', 9)}`).join('')}${vign}`);

// S14 theoretical: bags turn to ghosts, never delivered
shot('S14', 76.12, 83.32, `<g id="S14-cam">${sky('#bfe0ea', '#f2f7f1', '#c2b48a', 880)}
  ${[['£', '#c9a46a'], ['₣', '#b8c4d9'], ['$', '#bcd9b8']].map(([s, c], i) => G(`S14-b${i}`, P.moneyBag(s, c), 1200 + i * 230, 800, 1.1)).join('')}
  ${G('S14-gr', `${P.flag('gr', 210, 140)}`, 260, 520)}${T('S14-grl', 'ΕΛΛΑΔΑ', 365, 720, 64)}
  <path id="S14-arr" d="M 1150 640 Q 900 520 640 600" fill="none" stroke="${INK}" stroke-width="14" stroke-dasharray="30 22" marker-end="url(#ah)" opacity="0"/>
  ${G('S14-x', `<path d="M -70 -70 L 70 70 M 70 -70 L -70 70" stroke="${RED}" stroke-width="30" stroke-linecap="round"/>`, 890, 560, 1, 'opacity="0"')}
  ${T('S14-l', 'ΘΕΩΡΗΤΙΚΟΣ', 1430, 300, 110, YEL, 'middle', 14)}${T('S14-l2', 'ΔΕΝ ΔΟΘΗΚΑΝ ΣΤΗΝ ΕΛΛΑΔΑ', 960, 150, 80, '#fff')}</g>${vign}`);

// S15 ghost cover → extra banknotes printed → war effort
shot('S15', 83.32, 92.8, `<g id="S15-cam">${sky('#d9c7a6', '#f3eadb', '#a08562', 900)}
  ${G('S15-pr', P.press(), 760, 900, 1.3)}
  <g id="S15-cover" opacity="0">${[0, 1, 2].map(i => G(`S15-gb${i}`, P.moneyBag(['£', '₣', '$'][i], ['#c9a46a', '#b8c4d9', '#bcd9b8'][i]), 560 + i * 200, 330, .8)).join('')}<path d="M 440 360 Q 760 250 1080 360" fill="none" stroke="${INK}" stroke-width="8" stroke-dasharray="16 12"/></g>
  ${T('S15-kl', 'ΚΑΛΥΜΜΑ', 760, 160, 92, YEL, 'middle', 12)}
  <g id="S15-notes">${Array.from({ length: 8 }, (_, i) => G(`S15-n${i}`, P.banknote(220, 110, '100'), 760, 820, 1, 'opacity="0"')).join('')}</g>
  ${G('S15-V', V('s15v', 'happy'), 1560, 900, 1.05)}
  ${G('S15-war', `<g transform="translate(-90,0)">${P.soldier('s15s1', { start: 'neutral' })}</g><g transform="translate(90,0)">${P.soldier('s15s2', { start: 'neutral' })}</g>`, 1560, 900, .7, 'opacity="0"')}
  ${T('S15-l', 'ΠΡΟΣΘΕΤΟ ΧΑΡΤΟΝΟΜΙΣΜΑ', 1380, 470, 66, '#fff')}${T('S15-l2', 'ΠΟΛΕΜΙΚΗ ΠΡΟΣΠΑΘΕΙΑ', 1500, 300, 64, YEL)}</g>${vign}`);

// S16 reserve under foreign control
shot('S16', 92.8, 100.45, `<g id="S16-cam">${sky('#c3c9d0', '#eceff2', '#8d939b', 900)}
  ${G('S16-vault', P.vault(), 1150, 900, 1.6)}
  ${G('S16-gold', P.goldBars(), 960, 470, 1.5, 'opacity="0"')}${G('S16-fx', P.fxStack(), 1360, 450, 1.4, 'opacity="0"')}
  ${T('S16-l', 'ΑΠΟΘΕΜΑ', 960, 140, 110, YEL, 'middle', 14)}${T('S16-g', 'ΧΡΥΣΟΣ', 960, 360, 58)}${T('S16-f', 'ΣΥΝΑΛΛΑΓΜΑ', 1360, 360, 58)}
  ${G('S16-lock', `<g transform="translate(0,0)">${P.padlock()}</g><g transform="translate(-70,-150)">${P.flag('fr', 54, 36)}</g><g transform="translate(-14,-150)">${P.flag('uk', 54, 36)}</g><g transform="translate(42,-150)">${P.flag('us', 54, 36)}</g>`, 1150, 760, 1.3, 'opacity="0"')}
  ${G('S16-V', V('s16v', 'neutral'), 380, 900, 1.15)}
  ${T('S16-x', 'ΟΧΙ ΥΠΟ ΤΟΝ ΕΛΕΓΧΟ ΤΗΣ ΧΩΡΑΣ', 960, 250, 66, RED, 'middle', 10)}</g>${vign}`);

// S17 map tour: Macedonian front, Ukraine & Crimea, Asia Minor
shot('S17', 100.45, 114.55, `<g id="S17-cam">${seaLand('S17')}${greeceOne(RED)}${paperOver}
  <path id="S17-mf" d="${macFront}" fill="none" stroke="${INK}" stroke-width="16" stroke-linecap="round" stroke-dasharray="4 26" pathLength="1000"/>
  <path id="S17-mf2" d="${macFront}" fill="none" stroke="${YEL}" stroke-width="7" stroke-linecap="round" pathLength="1000" stroke-dasharray="1000 1000" stroke-dashoffset="1000"/>
  <path id="S17-r1" d="${seaRoute}" fill="none" stroke="${INK}" stroke-width="12" stroke-dasharray="24 18" pathLength="1000" marker-end="url(#ah)" opacity="0"/>
  <path id="S17-r2" d="${seaRoute2}" fill="none" stroke="${INK}" stroke-width="12" stroke-dasharray="24 18" marker-end="url(#ah)" opacity="0"/>
  <path id="S17-r3" d="${amRoute}" fill="none" stroke="${INK}" stroke-width="12" stroke-dasharray="24 18" marker-end="url(#ah)" opacity="0"/>
  ${T('S17-l1', 'ΜΑΚΕΔΟΝΙΚΟ ΜΕΤΩΠΟ', PP.thess[0], PP.thess[1] - 150, 56)}
  ${G('S17-pO', pin(RED), PP.odessa[0], PP.odessa[1])}${G('S17-pS', pin(RED), PP.sevast[0], PP.sevast[1])}${G('S17-pM', pin(RED), PP.smyrna[0], PP.smyrna[1])}
  ${T('S17-l2', 'ΟΥΚΡΑΝΙΑ', PP.odessa[0] - 60, PP.odessa[1] - 150, 120, '#fff', 'middle', 16)}${T('S17-l3', 'ΚΡΙΜΑΙΑ', PP.sevast[0] + 60, PP.sevast[1] + 170, 120, '#fff', 'middle', 16)}${T('S17-l4', 'ΜΙΚΡΑ ΑΣΙΑ', PP.smyrna[0] + 300, PP.smyrna[1] + 40, 90, '#fff', 'middle', 13)}
  ${['n1', 'n2', 'n3'].map(n => G(`S17-${n}`, P.banknote(120, 60, '100'), 0, 0, 1, 'opacity="0"')).join('')}</g>${vign}
  ${G('S17-hud', `${P.banknote(200, 100, '100')}`, 180, 140, 1)}${T('S17-hudt', 'ΧΡΗΜΑΤΟΔΟΤΗΣΗ', 300, 155, 52, '#fff', 'start', 9)}`);

// S18 balance tips
shot('S18', 114.55, 120.32, `<rect width="${W}" height="${H}" fill="#2f3b4a"/><rect width="${W}" height="${H}" fill="#000" filter="url(#paper)" opacity=".25"/>
  ${G('S18-bal', P.balance().replace('<g id="panLc"></g>', `<g id="panLc" transform="translate(0,140) scale(.32)">${P.banknote(300, 150, '100')}<g transform="translate(10,-40)">${P.banknote(300, 150, '100')}</g></g>`).replace('<g id="panRc"></g>', `<g id="panRc" transform="translate(0,150) scale(.45)" opacity=".35" stroke-dasharray="10 8">${P.moneyBag('£', '#c9a46a')}</g>`), 960, 980, 2)}${T('S18-l', 'ΝΟΜΙΣΜΑΤΙΚΗ ΙΣΟΡΡΟΠΙΑ', 960, 150, 88)}${T('S18-q', '…ΓΙΑ ΠΟΣΟ;', 960, 260, 72, YEL)}${vign}`);

// S19 Nov 1920 elections, Constantine returns
shot('S19', 120.32, 135.8, `<g id="S19-cam">${sky('#bcd2e0', '#eef2f2', '#c2b48a', 900)}${clouds('S19')}
  ${G('S19-box', P.ballotBox(), 960, 900, 1.3)}
  ${G('S19-V', V('s19v', 'neutral'), 420, 900, 1.1)}
  ${G('S19-r1', P.minister('s19a', { start: 'happy' }), 1380, 900, 1.0)}${G('S19-r2', P.minister('s19b', { start: 'happy', face: 'goatee', faceC: '#444' }), 1640, 900, 1.0)}
  ${G('S19-K', K('s19k', 'happy'), 960, 900, 1.2, 'opacity="0"')}
  ${G('S19-fr', P.marianne('s19f', { start: 'angry' }), 420, 900, 1.05, 'opacity="0"')}${G('S19-uk', P.johnbull('s19u', { start: 'angry' }), 1500, 900, 1.05, 'opacity="0"')}
  ${T('S19-res', 'ΕΧΑΣΕ ΤΙΣ ΕΚΛΟΓΕΣ', 420, 330, 70, RED, 'middle', 10)}${T('S19-fv', 'ΦΙΛΟΒΑΣΙΛΙΚΑ ΚΟΜΜΑΤΑ', 1510, 330, 60)}
  ${T('S19-an', 'ΑΝΕΠΙΘΥΜΗΤΟΣ ΣΤΟΥΣ ΣΥΜΜΑΧΟΥΣ', 960, 230, 74, YEL, 'middle', 12)}
  ${G('S19-crown', `<path d="M -60 0 L -60 -50 L -30 -20 L 0 -70 L 30 -20 L 60 -50 L 60 0 Z" fill="${YEL}" stroke="${INK}" stroke-width="6"/>`, 960, 470, 1.3, 'opacity="0"')}</g>${vign}
  ${T('S19-y', 'ΝΟΕΜΒΡΙΟΣ 1920', 64, 110, 72, YEL, 'start', 12)}`);

// S20 cover withdrawn → notes without backing
shot('S20', 135.8, 147.8, `<g id="S20-cam">${sky('#d9c7a6', '#f3eadb', '#a08562', 900)}
  <g id="S20-notes">${Array.from({ length: 6 }, (_, i) => G(`S20-n${i}`, P.banknote(260, 130, '100'), 560 + (i % 3) * 300, 620 + Math.floor(i / 3) * 170, 1)).join('')}</g>
  <g id="S20-cover">${[0, 1, 2].map(i => G(`S20-gb${i}`, P.moneyBag(['£', '₣', '$'][i], ['#c9a46a', '#b8c4d9', '#bcd9b8'][i]), 560 + i * 300, 400, .9)).join('')}</g>
  ${G('S20-fr', P.marianne('s20f', { start: 'angry', arms: 'hold' }), 230, 900, .95)}${G('S20-uk', P.johnbull('s20u', { start: 'angry', arms: 'hold' }), 1690, 900, .95)}
  ${T('S20-l', 'ΑΝΤΙΠΟΙΝΑ', 960, 150, 100, '#fff', 'middle', 14)}${T('S20-l2', 'ΧΩΡΙΣ ΑΝΤΙΚΡΥΣΜΑ', 960, 260, 100, RED, 'middle', 14)}</g>${vign}`);

// S21 deficit ledger
shot('S21', 147.8, 155.8, `<g id="S21-cam">${sky('#d7d0c0', '#f2ede2', '#a99b7c', 980)}
  ${G('S21-led', P.ledger(), 960, 620, 1.6)}
  <g id="S21-in">${[0, 1, 2].map(i => `<rect x="${-460 + i * 0}" y="0" width="0" height="0"/>`).join('')}</g>
  ${T('S21-m', '−', 1240, 760, 260, RED, 'middle', 16)}${T('S21-l', 'ΠΑΘΗΤΙΚΟ', 960, 870, 110, RED, 'middle', 14)}
  <g id="S21-bars">${[0, 1, 2, 3].map(i => `<rect id="S21-e${i}" x="${1040}" y="${480 + i * 54}" width="0" height="30" rx="6" fill="${RED}" stroke="${INK}" stroke-width="4"/><rect id="S21-i${i}" x="${420}" y="${480 + i * 54}" width="0" height="30" rx="6" fill="#4caf72" stroke="${INK}" stroke-width="4"/>`).join('')}</g></g>${vign}
  ${T('S21-y', 'ΑΠΟ ΤΟ 1918', 64, 110, 72, YEL, 'start', 12)}${T('S21-t', 'ΚΡΑΤΙΚΟΣ ΙΣΟΛΟΓΙΣΜΟΣ', 64, 200, 60, '#fff', 'start', 10)}`);

// S22 Asia Minor: hard, costly war
shot('S22', 155.8, 161.45, `<g id="S22-cam">${seaLand('S22')}${greeceOne(BLUE)}${paperOver}
  <path id="S22-adv" d="${amAdvance}" fill="none" stroke="${BLUE}" stroke-width="40" stroke-linecap="round" pathLength="1000" stroke-dasharray="1000 1000" stroke-dashoffset="1000" opacity=".9"/>
  <path id="S22-adv2" d="${amAdvance}" fill="none" stroke="${INK}" stroke-width="8" stroke-dasharray="20 16" marker-end="url(#ah)" pathLength="1000" opacity="0"/>
  ${G('S22-pM', pin(BLUE), PP.smyrna[0], PP.smyrna[1])}${T('S22-sm', 'ΣΜΥΡΝΗ', PP.smyrna[0] - 20, PP.smyrna[1] + 70, 50)}
  ${Array.from({ length: 4 }, (_, i) => G(`S22-bx${i}`, `<circle r="46" fill="#efe4c9" stroke="${INK}" stroke-width="5"/><path d="M -28 28 L 22 -22 M 28 28 L -22 -22" stroke="${INK}" stroke-width="9" stroke-linecap="round"/>`, 0, 0, 1, 'opacity="0"')).join('')}</g>${vign}
  ${T('S22-l', 'ΜΙΚΡΑ ΑΣΙΑ', 960, 140, 100, '#fff', 'middle', 14)}${T('S22-l2', 'ΣΚΛΗΡΟΣ & ΔΑΠΑΝΗΡΟΣ ΠΟΛΕΜΟΣ', 960, 250, 74, YEL)}
  ${G('S22-drain', P.moneyBag('δρχ', '#c9a46a'), 1720, 900, 1)}`);

// S23 dead end 1922 → unexpected idea
shot('S23', 161.45, 171.95, `<g id="S23-cam">${sky('#c9c2b4', '#efebe4', '#9c917c', 900)}
  ${G('S23-wall', P.wall(), 1180, 900, 1.6)}${T('S23-ad', 'ΑΔΙΕΞΟΔΟ', 1420, 380, 92, '#fff', 'middle', 12)}
  ${G('S23-M', P.minister('s23m', { start: 'neutral' }), 520, 900, 1.15)}
  ${T('S23-tag', 'ΚΥΒΕΡΝΗΣΗ', 520, 470, 58)}
  ${G('S23-stars', `<g stroke="${INK}" stroke-width="5">${[0, 1, 2].map(i => `<path transform="rotate(${i * 120})" d="M 0 -60 l 10 22 l 24 2 l -18 16 l 6 24 l -22 -12 l -22 12 l 6 -24 l -18 -16 l 24 -2 Z" fill="${YEL}"/>`).join('')}</g>`, 0, 0, .6, 'opacity="0"')}
  ${G('S23-bulb', P.bulb(), 0, 0, 1.4, 'opacity="0"')}${T('S23-ap', 'ΑΠΡΟΣΜΕΝΟΣ ΤΡΟΠΟΣ!', 960, 160, 88, YEL, 'middle', 12)}</g>${vign}
  ${T('S23-y', 'ΜΑΡΤΙΟΣ 1922', 64, 110, 72, YEL, 'start', 12)}`);

// S24 months before the collapse (ominous front)
shot('S24', 171.95, 176.45, `<g id="S24-cam">${seaLand('S24')}${greeceOne(BLUE)}${paperOver}
  <path d="${amAdvance}" fill="none" stroke="${BLUE}" stroke-width="40" stroke-linecap="round" opacity=".9"/>
  <path id="S24-cr" d="${amAdvance}" fill="none" stroke="${INK}" stroke-width="10" stroke-dasharray="6 10" opacity="0"/>
  ${G('S24-pM', pin(BLUE), PP.smyrna[0], PP.smyrna[1])}</g>${vign}
  ${T('S24-l', 'ΛΙΓΟΥΣ ΜΗΝΕΣ ΠΡΙΝ ΤΗΝ ΚΑΤΑΡΡΕΥΣΗ…', 960, 160, 82, '#fff', 'middle', 12)}
  ${G('S24-clock', `<circle r="70" fill="#efe4c9" stroke="${INK}" stroke-width="7"/><path id="S24-hand" d="M 0 0 L 0 -52" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><circle r="8" fill="${INK}"/>`, 1700, 900)}`);

// S25 forced loan: banknote cut in half
shot('S25', 176.45, 183.25, `<g id="S25-cam"><rect width="${W}" height="${H}" fill="#3a3f4b"/><rect width="${W}" height="${H}" fill="#000" filter="url(#paper)" opacity=".25"/>
  
  ${G('S25-note', `<g id="S25-L" clip-path="url(#S25-cl)">${P.banknote(760, 380, '100')}</g><g id="S25-R" clip-path="url(#S25-cr)">${P.banknote(760, 380, '100')}</g>`, 960, 580, 1)}
  <path id="S25-cut" d="M 960 340 L 960 820" stroke="#fff" stroke-width="6" stroke-dasharray="20 14" opacity="0"/>
  ${G('S25-sc', P.scissors(), 960, 260, 1.4, 'opacity="0"')}
  ${T('S25-st0', 'ΑΝΑΓΚΑΣΤΙΚΟ ΔΑΝΕΙΟ', 960, 150, 96, '#fff', 'middle', 14)}${T('S25-dx', 'ΔΙΧΟΤΟΜΗΣΗ!', 960, 905, 120, YEL, 'middle', 16)}</g>${vign}`);

// S26 left half 50% circulates, right half → bonds
shot('S26', 183.25, 192.95, `<g id="S26-cam">${sky('#cfe3df', '#f3f6ef', '#bfb48e', 900)}
  ${G('S26-L', `<g clip-path="url(#S25-cl)">${P.banknote(760, 380, '100')}</g>`, 760, 520, .45)}${G('S26-R', `<g clip-path="url(#S25-cr)">${P.banknote(760, 380, '100')}</g>`, 1160, 520, .45)}
  ${T('S26-50', '50%', 620, 380, 140, YEL, 'middle', 16)}${T('S26-kyk', 'ΚΥΚΛΟΦΟΡΕΙ', 620, 470, 54)}
  ${G('S26-c1', P.citizen('s26c1', { start: 'neutral' }), 200, 900, .85)}${G('S26-c2', P.citizen('s26c2', { start: 'neutral', coat: '#4a5a48', hat: 'none', hair: 'short' }), 470, 900, .85)}
  ${G('S26-st', P.minister('s26m', { start: 'happy' }), 1680, 900, .95)}${T('S26-dim', 'ΔΗΜΟΣΙΟ', 1680, 540, 58)}
  ${G('S26-bond', P.bond(), 1400, 600, 1, 'opacity="0"')}${T('S26-om', 'ΟΜΟΛΟΓΙΕΣ ΤΟΥ ΔΗΜΟΣΙΟΥ', 1400, 300, 64, YEL, 'middle', 10)}</g>${vign}
  ${T('S26-ar', 'ΑΡΙΣΤΕΡΟ ΤΜΗΜΑ', 520, 150, 70)}${T('S26-de', 'ΔΕΞΙΟ ΤΜΗΜΑ', 1400, 150, 70)}`);

// S27 success: wreath + 1.2 billion + repeat 1926
shot('S27', 192.95, 204.15, `<rect width="${W}" height="${H}" fill="#2f3b4a"/><rect width="${W}" height="${H}" fill="#000" filter="url(#paper)" opacity=".25"/>
  <g id="S27-cam">${G('S27-wr', P.wreath(), 960, 470, 1.6, 'opacity="0"')}${T('S27-ep', 'ΕΠΙΤΥΧΙΑ', 960, 500, 110, YEL, 'middle', 14)}
  ${T('S27-num', '0', 960, 820, 130, '#fff', 'middle', 16)}${T('S27-dr', 'ΔΡΑΧΜΕΣ', 960, 900, 60, YEL)}
  ${G('S27-rep', `<circle r="90" fill="#efe4c9" stroke="${INK}" stroke-width="7"/><path d="M -40 -30 A 50 50 0 1 1 -48 20" fill="none" stroke="${INK}" stroke-width="14" stroke-linecap="round"/><path d="M -70 -46 L -36 -26 L -66 -6 Z" fill="${INK}"/>`, 1560, 300, 1, 'opacity="0"')}
  ${T('S27-y', 'ΞΑΝΑ ΤΟ 1926', 1560, 470, 72, YEL, 'middle', 12)}</g>${vign}`);

// S28 not enough to prevent the Asia Minor Catastrophe
shot('S28', 204.15, 216, `<g id="S28-cam">${seaLand('S28')}${greeceOne(BLUE)}${paperOver}
  <path id="S28-adv" d="${amAdvance}" fill="none" stroke="${BLUE}" stroke-width="40" stroke-linecap="round" pathLength="1000" stroke-dasharray="1000 1000" stroke-dashoffset="0" opacity=".9"/>
  <path id="S28-ret" d="${amRetreat}" fill="none" stroke="${INK}" stroke-width="10" stroke-dasharray="22 16" marker-end="url(#ah)" opacity="0"/>
  ${G('S28-note', `<g clip-path="url(#S25-cl)">${P.banknote(760, 380, '100')}</g>`, PP.smyrna[0] + 250, PP.smyrna[1] - 120, .25, 'opacity="0"')}
  <g id="S28-smoke" opacity="0">${[0, 1, 2, 3, 4].map(i => `<circle id="S28-sm${i}" cx="${PP.smyrna[0]}" cy="${PP.smyrna[1]}" r="30" fill="#555" stroke="${INK}" stroke-width="4"/>`).join('')}</g>
  ${G('S28-fire', `<path d="M 0 0 Q -40 -40 -10 -90 Q 0 -50 20 -70 Q 40 -30 30 0 Z" fill="#ff8a3d" stroke="${INK}" stroke-width="5"/><path d="M 4 -4 Q -10 -30 4 -56 Q 14 -30 20 -18 Z" fill="${YEL}"/>`, PP.smyrna[0], PP.smyrna[1] - 10, 1.4, 'opacity="0"')}</g>
  <rect id="S28-dark" width="${W}" height="${H}" fill="#120d0b" opacity="0"/>${vign}
  ${T('S28-l', 'ΜΙΚΡΑΣΙΑΤΙΚΗ ΚΑΤΑΣΤΡΟΦΗ', 960, 500, 120, '#fff', 'middle', 16)}${T('S28-y', '1922', 960, 640, 110, YEL, 'middle', 14)}
  ${T('S28-q', 'ΔΕΝ ΣΤΑΘΗΚΕ ΙΚΑΝΟΣ', 960, 150, 80, '#fff', 'middle', 12)}
  <rect id="S28-black" width="${W}" height="${H}" fill="#000" opacity="0"/>`);


// ---------- page ----------
const HL = ['Διχασμός', 'Εθνικής Άμυνας', 'δυο ουσιαστικά κράτη', 'επιστράτευση', '1915', '1917', '1918', '1920', '1922', '1926', 'συμμαχικός αποκλεισμός', 'οικονομικό και κοινωνικό κόστος', 'υπονόμευσαν', 'κεκτημένα', 'ενοποιήθηκε', 'ιδιόμορφο δανεισμό', 'θεωρητικός', 'κάλυμμα', 'πρόσθετου χαρτονομίσματος', 'αποθέματος', 'χρυσό', 'συνάλλαγμα', 'έλεγχο της χώρας', 'μακεδονικό μέτωπο', 'Ουκρανία', 'Κριμαία', 'Μικρά Ασία', 'χωρίς αντίκρυσμα', 'παθητικό', 'αδιέξοδο', 'αναγκαστικό δάνειο', 'διχοτόμηση του χαρτονομίσματος', '50%', 'ομολογίες του Δημοσίου', '1.200.000.000 δραχμές', 'Μικρασιατική', 'καταστροφή', '12.000.000 λίρες Αγγλίας', '300.000.000 γαλλικά φράγκα', '50.000.000 δολάρια ΗΠΑ', 'έχασε τις εκλογές', 'φιλοβασιλικά κόμματα', 'βασιλιά Κωνσταντίνο', 'αποσύρουν την κάλυψη'];
const subs = makeSubs(timing, HL, { skipBefore: 3.6 });   // skip the title card
const extraDefs = mapDefs(M) + `<clipPath id="S25-cl"><rect x="-400" y="-300" width="400" height="600"/></clipPath><clipPath id="S25-cr"><rect x="0" y="-300" width="400" height="600"/></clipPath>`;
const n = buildPage({ out: path.join(HERE, 'build/video.html'), shots, subs, C, extraDefs, data: { PP, crack: crackPts.map(p => p.map(v => +v.toFixed(1))) },
  runtimeJs: '../../../engine/runtime.js', shotsJs: '../shots.js' });
import fs from 'fs';
fs.writeFileSync(path.join(HERE, 'build/cues.json'), JSON.stringify({ ...C, DUR: C.end + 2.4 }, null, 1));
console.log('built', (n / 1e6).toFixed(2), 'MB,', shots.length, 'shots, duration', (C.end + 2.4).toFixed(1), 's');
