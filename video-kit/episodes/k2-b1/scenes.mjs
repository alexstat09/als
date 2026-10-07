// Κεφ.2 Β.1 «Το σύνταγμα του 1844» (k2-b1) — SCENES (node side).
// Run from the kit root:  node episodes/k2-b1/scenes.mjs   →  build/video.html + build/cues.json
// ⚠️ EVERY time is derived from the narration (S/E/Wt) — never a literal second — so a new voice re-times the film.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { P, W, H, INK, BLUE, RED, YEL, NIGHT, cueTools, G, T, sky, night, clouds, vign, buildPage, makeSubs } from '../../engine/page.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const { timing, PH, S, E, Wt } = cueTools(path.join(HERE, 'timing.json'));

// episode colours (STORYBOARD.md → «Colour meaning»)
const ENC = '#3E9C94', FRC = '#8A5BB0', RUC = '#D9822B', GOLD = '#D8A93B', GRN = '#6aa84f', PAPER = '#F1E2BC';
const PARTY = { en: [ENC, 'ΑΓΓΛΙΚΟ'], fr: [FRC, 'ΓΑΛΛΙΚΟ'], ru: [RUC, 'ΡΩΣΙΚΟ'] };

// ---------- cues ----------
const C = {
  t1: 0.05, chap: S(1), y1844: Wt(1, 'χίλια'), t2: S(2), t3: S(3),
  rev: Wt(4, 'επανάσταση'), sept: Wt(4, 'Σεπτεμβρίου'), edr: Wt(4, 'έδρασε'), kat: Wt(4, 'καταλυτικά'), diam4: Wt(4, 'διαμόρφωση'),
  idl: Wt(5, 'ιδεολογικές'), ekfr: Wt(5, 'εκφράστηκαν'), safi: Wt(5, 'σαφήνεια'), megal: Wt(5, 'μεγαλύτερη'), mid5: +(Wt(5, 'και τα κόμματα') - .12).toFixed(2), energ: Wt(5, 'ενεργότερο'), zoi5: Wt(5, 'πολιτική ζωή'),
  syz: Wt(6, 'συζητήσεων'), safest: Wt(6, 'σαφέστερες'), diaf: Wt(6, 'διαφορές'),
  tria: Wt(7, 'τρία'), tax: Wt(7, 'τάχθηκαν'), yper: Wt(7, 'υπέρ'),
  ros: Wt(8, 'ρωσικό'), psif: Wt(8, 'ψήφιση'), monad: Wt(8, 'μοναδική'),
  dynat: Wt(9, 'δυνατόν'), anatr: Wt(9, 'ανατραπεί'),
  zit: Wt(10, 'ζητούμενο'), perior: Wt(10, 'περιορισμός'), exous10: Wt(10, 'εξουσιών'),
  dyn: Wt(11, 'δυναμική'), apod: Wt(11, 'αποδεικνύεται'), gegon: Wt(11, 'γεγονός'), mid11: +(Wt(11, 'οι τρεις') - .12).toFixed(2),
  treis: Wt(11, 'τρεις'), diith: Wt(11, 'διηύθυναν'), ethn: Wt(11, 'Εθνοσυνέλευσης'), y1843: Wt(11, 'χίλια'),
  apof: Wt(12, 'αποφύγουν'), akr: Wt(12, 'ακραίες'),
  epiv: Wt(13, 'επιβληθούν'), rizo: Wt(13, 'ριζοσπαστικές'), mid13: +(Wt(13, 'και να πάρουν') - .12).toFixed(2), koin: Wt(13, 'κοινού'), apof13: Wt(13, 'αποφάσεις'),
  symf: Wt(14, 'συμφώνησαν'), katox: Wt(14, 'κατοχυρωθούν'), them: Wt(14, 'θεμελιώδη'),
  isot: Wt(15, 'ισότητα'), doul: Wt(16, 'δουλείας'), asyl: Wt(17, 'απαραβίαστο'), gnom: Wt(18, 'γνώμης'), idiok: Wt(19, 'ιδιοκτησίας'), dore: Wt(20, 'δωρεάν'),
  synei: Wt(21, 'συνειδητοποίησαν'), axies: Wt(21, 'αξίες'), prost: Wt(21, 'προστατευτούν'), afth: Wt(21, 'αυθαιρεσία'),
  adyn: Wt(22, 'αδυναμία'), denk: Wt(22, 'δεν κατοχυρώθηκε'), synerx: Wt(22, 'συνέρχεσθαι'), synet: Wt(22, 'συνεταιρίζεσθαι'),
  pragma: S(23), empod: Wt(23, 'εμπόδια'), synkr: Wt(23, 'συγκρότηση'),
  kathor: Wt(24, 'καθορίστηκαν'), vasex: Wt(24, 'βασιλικές'),
  symmet: Wt(25, 'συμμετοχή'), nomoth: Wt(25, 'νομοθετικής'), arxig: Wt(25, 'αρχηγία'),
  omos26: S(26), praxi: Wt(27, 'πράξη'), isxy: Wt(27, 'ισχύ'), prosyp: Wt(27, 'προσυπογραφή'),
  diat: Wt(28, 'διατάξεις'), a29: S(29), elax: Wt(30, 'ελάχιστους'), kathol: Wt(31, 'καθολικής'), andres: Wt(31, 'άνδρες'),
  pagk: Wt(32, 'παγκόσμια'), protop: Wt(32, 'πρωτοπορία'),
  b33: S(33), eklog: Wt(33, 'εκλογική'), thet: Wt(34, 'θετική'), osous: Wt(34, 'όσους'), ypops: Wt(34, 'υποψηφίους'),
  psifod: Wt(35, 'ψηφοδέλτια'), diafsyn: Wt(36, 'διαφορετικών'),
  g37: S(37), voul: Wt(37, 'Βουλής'), gerous: Wt(37, 'Γερουσίας'),
  geroust: Wt(38, 'γερουσιαστές'), dior: Wt(38, 'διορίζονταν'), diatir: Wt(38, 'διατηρούσαν'), isov: Wt(38, 'ισόβια'),
  provl: Wt(39, 'πρόβλεψη'), komm39: Wt(39, 'κόμματα'), denyp: Wt(39, 'δεν υπήρξε'),
  kanon: Wt(40, 'κανονισμός'), synth: Wt(40, 'σύνθεση'), epitr: Wt(40, 'επιτροπών'), klir: Wt(40, 'κλήρωση'),
  anagk: Wt(41, 'αναγκαστικά'), diavoul: Wt(41, 'διαβουλεύσεις'), orism: S(42), synain: Wt(43, 'συναίνεση'),
  kathol44: Wt(44, 'καθολικής'), neous: Wt(44, 'νέους'), polit44: Wt(44, 'πολιτική'),
  pedio: Wt(45, 'πεδίο'), symmet45: Wt(45, 'συμμετοχή'), dieuk: Wt(45, 'διευκολύνθηκε'),
  isos: S(46), fileleu: Wt(46, 'φιλελεύθερες'), mikr: Wt(46, 'μικρής'),
  antap47: Wt(47, 'ανταποκρίνονταν'), mimis47: Wt(47, 'μίμηση'),
  efarm: Wt(48, 'εφαρμογή'), param: Wt(48, 'παραμορφώθηκαν'), mikrou: Wt(48, 'μικρού'),
  omos49: S(49), anex: Wt(50, 'ανεξάρτητα'), epidr: Wt(50, 'επιδράσεις'),
  koinov: Wt(51, 'κοινοβουλευτισμός'), rizose: Wt(51, 'ρίζωσε'), akol: Wt(51, 'ακολούθησε'),
  anagk52: Wt(52, 'ανάγκες'), provl53: Wt(53, 'προβλήματα'), aitim: Wt(53, 'αιτήματα'),
  exallou: S(54), energop: Wt(55, 'ενεργοποίηση'), stadiak: Wt(55, 'σταδιακή'), dikaiou: Wt(55, 'δικαίου'),
  arkouse: Wt(56, 'αρκούσε'),
  anagkai: Wt(57, 'αναγκαιότητα'), antap57: Wt(57, 'ανταποκρίνονταν'), anthr: Wt(57, 'ανθρώπων'),
  pant58: S(58), simer: Wt(59, 'σημερινούς'), arist: Wt(59, 'αριστερά'), dexia: Wt(59, 'δεξιά'), prood: Wt(60, 'προοδευτικά'), synt60: Wt(60, 'συντηρητικά'),
  end: E(PH.length - 1),
};
const cut = i => i === 0 ? 0 : +(S(i) - .15).toFixed(2);

// ---------- small builders ----------
const shots = [];
const shot = (id, a, b, inner) => shots.push({ id, a: +a.toFixed(2), b: +b.toFixed(2), svg: `<g id="${id}" class="shot" style="display:none">${inner}</g>` });
const line = (id, x1, y1, x2, y2, c = INK, w = 8, extra = '') => `<path id="${id}" d="M ${x1} ${y1} L ${x2} ${y2}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" fill="none" pathLength="1000" stroke-dasharray="1000 1000" stroke-dashoffset="1000" ${extra}/>`;
const xMark = (c = RED, s = 70, w = 26) => `<path d="M ${-s} ${-s} L ${s} ${s} M ${s} ${-s} L ${-s} ${s}" stroke="${INK}" stroke-width="${w + 10}" stroke-linecap="round"/><path d="M ${-s} ${-s} L ${s} ${s} M ${s} ${-s} L ${-s} ${s}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
const tick = (c = GRN, s = 60) => { const d = `M ${-s} ${-s * .05} L ${-s * .3} ${s * .6} L ${s} ${-s * .75}`; return `<path d="${d}" stroke="${INK}" stroke-width="${s * .5}" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" stroke="${c}" stroke-width="${s * .3}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`; };
const txt = (s, x, y, size, fill = INK, anchor = 'middle', extra = '') => `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="Fira Sans Extra Condensed" font-weight="900" font-size="${size}" fill="${fill}" ${extra}>${s}</text>`;
const otxt = (s, x, y, size, fill = '#fff', sw = 8) => txt(s, x, y, size, fill, 'middle', `stroke="${INK}" stroke-width="${sw}" paint-order="stroke"`);
const wide = (c, x0 = -400, w = 4600, y0 = -300, h = H + 600) => `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="${c}"/><rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="#000" filter="url(#paper)" opacity=".2"/>`;
// interior: plastered wall with pilasters + wooden floor (oversized)
const hall = (x0 = -400, w = W + 800, wall = '#d9c8a4', floorY = 860) => `<rect x="${x0}" y="-300" width="${w}" height="${floorY + 300}" fill="${wall}"/>
  ${Array.from({ length: Math.ceil(w / 360) }, (_, i) => `<rect x="${x0 + 120 + i * 360}" y="-300" width="56" height="${floorY + 300}" fill="#cbb892" stroke="${INK}" stroke-width="4"/>`).join('')}
  <rect x="${x0}" y="${floorY}" width="${w}" height="${H - floorY + 400}" fill="#9a7b52" stroke="${INK}" stroke-width="5"/>
  ${Array.from({ length: Math.ceil(w / 160) }, (_, i) => `<path d="M ${x0 + i * 160} ${floorY} L ${x0 + i * 160 - 60} ${H + 100}" stroke="#7e6240" stroke-width="4"/>`).join('')}
  <rect x="${x0}" y="-300" width="${w}" height="${H + 600}" fill="#000" filter="url(#paper)" opacity=".16"/>`;
const pm = (p, k, o = {}) => P.partyMan(`${p}${k}`.toLowerCase(), k, PARTY[k][0], o);
// the three party men in a row (feet at y), each a G `${p}-${k}`; tags under the feet in party colour
function trio(p, xs, y = 860, s = .85, o = {}, tags = true) {
  return ['en', 'fr', 'ru'].map((k, i) => G(`${p}-${k}`, pm(p, k, o), xs[i], y, s) + (tags ? T(`${p}-tg${i}`, PARTY[k][1], xs[i], y + 46, 36, PARTY[k][0], 'middle', 8) : '')).join('');
}
const torch = `<g transform="translate(66,-90)"><rect x="-6" y="-150" width="12" height="160" rx="4" fill="#6b4a2b" stroke="${INK}" stroke-width="4"/><path d="M 0 -150 Q -28 -190 -6 -232 Q 0 -200 14 -214 Q 30 -180 0 -150 Z" fill="#ffb02e" stroke="${INK}" stroke-width="4"/><path d="M 0 -160 Q -10 -184 0 -204 Q 10 -184 0 -160 Z" fill="#fff3c4"/></g>`;
const rifle = `<g transform="translate(70,-60) rotate(-8)"><rect x="-5" y="-170" width="10" height="170" rx="3" fill="#6b4a2b" stroke="${INK}" stroke-width="4"/><rect x="-3" y="-200" width="6" height="34" fill="#888" stroke="${INK}" stroke-width="3"/></g>`;
// 1840s soldier: dark-blue tunic, light trousers — not the khaki P.soldier (that is a WWI look)
const soldier1843 = (id, extra = {}) => P.person({ id, coat: '#24365e', pants: '#d8d2c4', hat: 'kepi', hatC: '#1d2a44', face: 'stache', hairC: '#3a2a20', prop: rifle, ...extra });
const deputy = (id, i, extra = {}) => [P.villager, P.minister, P.prokritos, P.citizen][i % 4](id, extra);
const bubbleScrib = `<path d="M -50 -10 q 15 -25 30 0 q 15 25 30 0 q 15 -25 30 0" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><text x="70" y="22" font-family="Fira Sans Extra Condensed" font-weight="900" font-size="64" fill="${RED}">!</text>`;
const paper = (w, h, c = PAPER) => `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="8" fill="${c}" stroke="${INK}" stroke-width="7"/><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="8" fill="#000" filter="url(#paper)" opacity=".15"/>`;
const bolt = c => `<path d="M 0 0 L -28 70 L 4 62 L -20 140 L 40 40 L 8 48 L 26 0 Z" fill="${c}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`;
const boltHead = `<circle r="30" fill="#9aa1aa" stroke="${INK}" stroke-width="6"/><path d="M -16 0 L 16 0 M 0 -16 L 0 16" stroke="${INK}" stroke-width="6"/>`;
const sceptre = `<g transform="translate(78,-100) rotate(18)"><rect x="-6" y="-190" width="12" height="190" rx="5" fill="#D8A93B" stroke="${INK}" stroke-width="4"/><circle cx="0" cy="-200" r="20" fill="#F2C14E" stroke="${INK}" stroke-width="5"/></g>`;
const baton = `<rect x="-4" y="-120" width="8" height="120" rx="4" fill="#fbf8f0" stroke="${INK}" stroke-width="3"/>`;
const board = (w, h, c = '#2f3b2f') => `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="10" fill="#7a5232" stroke="${INK}" stroke-width="7"/><rect x="${-w / 2 + 18}" y="${-h / 2 + 18}" width="${w - 36}" height="${h - 36}" rx="6" fill="${c}" stroke="${INK}" stroke-width="4"/>`;
// one continuous sky + ground across a WIDE world (sky() is only W+800 wide: a pan would show its seam)
const skyW = (x0, w, gy, top = '#bfe0ea', bot = '#f2f7f1', ground = '#c9b98d') => `<defs><linearGradient id="skw${x0}${w}${gy}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bot}"/></linearGradient></defs><rect x="${x0}" y="-300" width="${w}" height="${H + 600}" fill="url(#skw${x0}${w}${gy})"/><rect x="${x0}" y="${gy}" width="${w}" height="${H - gy + 400}" fill="${ground}" stroke="${INK}" stroke-width="5"/><rect x="${x0}" y="-300" width="${w}" height="${H + 600}" fill="#000" filter="url(#paper)" opacity=".18"/>`;
const stars = (p, ox = -240, span = 2400) => Array.from({ length: 34 }, (_, i) => `<circle id="${p}-st${i}" cx="${ox + (i * 197) % span}" cy="${(i * 113) % 560 - 40}" r="${2 + (i % 3)}" fill="#fff8d6"/>`).join('');

// =====================================================================
// S1 title: night palace; the two headings the voice reads
shot('S1', 0, cut(4), `${wide('#1b2433')}<g id="S1-cam">${stars('S1')}
  <defs><radialGradient id="S1-rg"><stop offset="0" stop-color="#ffe9a8" stop-opacity=".5"/><stop offset="1" stop-color="#ffe9a8" stop-opacity="0"/></radialGradient></defs>
  <circle id="S1-glow" cx="960" cy="640" r="560" fill="url(#S1-rg)" opacity="0"/>
  <rect x="-400" y="960" width="2720" height="420" fill="#3a3326" stroke="${INK}" stroke-width="5"/>
  ${G('S1-pal', P.palace(null), 960, 990, 1.05)}</g>${vign}
  ${T('S1-a', 'Β. ΧΕΙΡΑΦΕΤΗΣΗ ΚΑΙ ΑΝΑΜΟΡΦΩΣΗ', 960, 250, 80, '#fff', 'middle', 13)}${T('S1-b', '1844-1880', 960, 360, 74, YEL, 'middle', 12)}
  ${T('S1-t1', 'ΕΝΟΤΗΤΑ 1', 960, 250, 92, YEL, 'middle', 12)}${T('S1-t2', 'ΤΟ ΣΥΝΤΑΓΜΑ ΤΟΥ 1844', 960, 400, 124, '#fff', 'middle', 16)}`);

// S2 the revolution of 3 Sept 1843 → «έδρασε καταλυτικά»: camera whips to a flask that foams
const crowd2 = [[-260, 'v'], [-90, 's'], [80, 'c'], [250, 'v'], [1180, 's'], [1350, 'c'], [1520, 'v']];
shot('S2', cut(4), cut(5), `${wide('#1b2433')}<g id="S2-cam">${stars('S2')}
  <rect x="-400" y="860" width="4600" height="520" fill="#4a4030" stroke="${INK}" stroke-width="5"/>
  ${G('S2-pal', P.palace(null), 760, 880, 1.35)}
  ${crowd2.map(([x, k], i) => G(`S2-c${i}`, k === 's' ? soldier1843(`s2c${i}`, { start: 'angry' }) : (k === 'v' ? P.villager(`s2c${i}`, { start: 'angry', prop: torch }) : P.citizen(`s2c${i}`, { start: 'angry', prop: torch })), [150, 300, 450, 1080, 1230, 1380, 1530][i], 920, .62)).join('')}
  ${G('S2-fl', P.flask('', '#9fd8c4', 'S2f'), 2700, 900, 1.45)}
  ${G('S2-foam', `<path d="M -70 0 Q -90 -60 -40 -70 Q -20 -120 20 -96 Q 70 -110 76 -60 Q 110 -30 70 0 Z" fill="#fff" stroke="${INK}" stroke-width="5"/>`, 2700, 495, 1, 'opacity="0"')}
  ${G('S2-sp', `<path d="M 0 -40 L 10 -12 L 40 0 L 10 12 L 0 40 L -10 12 L -40 0 L -10 -12 Z" fill="${YEL}" stroke="${INK}" stroke-width="5"/>`, 2700, 120, 1.2, 'opacity="0"')}
  ${T('S2-fl2', 'ΠΟΛΙΤΙΚΑ', 2290, 690, 64, '#fff', 'middle', 11)}${T('S2-fl3', 'ΠΡΑΓΜΑΤΑ', 2290, 770, 64, '#fff', 'middle', 11)}
  ${T('S2-l2', 'ΕΔΡΑΣΕ ΚΑΤΑΛΥΤΙΚΑ', 2700, 220, 104, YEL, 'middle', 15)}</g>${vign}
  ${T('S2-d', '3 ΣΕΠΤΕΜΒΡΙΟΥ 1843', 64, 120, 74, YEL, 'start', 12)}${T('S2-l', 'Η ΕΠΑΝΑΣΤΑΣΗ', 1150, 200, 100, '#fff', 'middle', 15)}`);

// S3 the parties' views come into FOCUS (blurred thought-clouds → sharp)
const xs3 = [520, 960, 1400];
shot('S3', cut(5), C.mid5, `<g id="S3-cam">${sky('#c9dde6', '#f3efe4', '#c9b98d', 860)}
  <filter id="S3-f" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur id="S3-gb" stdDeviation="16"/></filter>
  ${trio('S3', xs3)}
  ${xs3.map((x, i) => G(`S3-b${i}`, `${P.bubble(300, 190, -40, 150)}<g filter="url(#S3-f)"><rect x="-110" y="-62" width="220" height="124" rx="10" fill="${PAPER}" stroke="${INK}" stroke-width="5"/>${[0, 1, 2].map(j => `<path d="M -84 ${-34 + j * 34} H ${j === 2 ? 30 : 84}" stroke="${Object.values(PARTY)[i][0]}" stroke-width="13" stroke-linecap="round"/>`).join('')}</g>`, x + 40, 380, 1, 'opacity="0"')).join('')}
  ${G('S3-foc', ['M -200 -150 h 60 M -200 -150 v 60', 'M 200 -150 h -60 M 200 -150 v 60', 'M -200 150 h 60 M -200 150 v -60', 'M 200 150 h -60 M 200 150 v -60'].map(d => `<path d="${d}" stroke="${INK}" stroke-width="18" stroke-linecap="round"/><path d="${d}" stroke="${YEL}" stroke-width="9" stroke-linecap="round"/>`).join(''), 1000, 380, 1, 'opacity="0"')}
  ${T('S3-l', 'ΙΔΕΟΛΟΓΙΚΕΣ ΑΝΤΙΛΗΨΕΙΣ', 960, 120, 84, '#fff', 'middle', 13)}${T('S3-l2', 'ΜΕ ΜΕΓΑΛΥΤΕΡΗ ΣΑΦΗΝΕΙΑ', 960, 205, 62, YEL, 'middle', 10)}</g>${vign}`);

// S4 a more active role in political life: they walk out onto a lit stage
const cone = (id, x) => `<path id="${id}" d="M ${x - 30} -100 L ${x - 230} 860 L ${x + 230} 860 L ${x + 30} -100 Z" fill="#fff6c9" opacity="0"/>`;
shot('S4', C.mid5, cut(6), `<g id="S4-cam"><rect x="-400" y="-300" width="2720" height="1680" fill="#2b2230"/>
  <rect x="-400" y="860" width="2720" height="520" fill="#8a6a46" stroke="${INK}" stroke-width="5"/>
  ${cone('S4-k0', 620)}${cone('S4-k1', 960)}${cone('S4-k2', 1300)}
  <path d="M -400 -300 L 300 -300 Q 220 300 260 860 L -400 860 Z" fill="#9b2e2e" stroke="${INK}" stroke-width="6"/><path d="M 2320 -300 L 1620 -300 Q 1700 300 1660 860 L 2320 860 Z" fill="#9b2e2e" stroke="${INK}" stroke-width="6"/>
  ${[0, 1, 2, 3].map(i => `<path d="M ${-300 + i * 140} -300 Q ${-330 + i * 140} 300 ${-300 + i * 140} 860 M ${2220 - i * 140} -300 Q ${2250 - i * 140} 300 ${2220 - i * 140} 860" stroke="#7a2222" stroke-width="7" fill="none"/>`).join('')}
  <path d="M -400 -300 H 2320 V -60 Q 960 40 -400 -60 Z" fill="#b13a3a" stroke="${INK}" stroke-width="6"/>
  ${trio('S4', [620, 960, 1300], 860, .85, { start: 'happy' }, false)}
  ${G('S4-sign', `<rect x="-300" y="-56" width="600" height="112" rx="14" fill="${PAPER}" stroke="${INK}" stroke-width="7"/>${txt('ΠΟΛΙΤΙΚΗ ΖΩΗ', 0, 22, 66)}`, 960, 120, 1)}
  ${T('S4-l', 'ΕΝΕΡΓΟΤΕΡΟΣ ΡΟΛΟΣ', 960, 270, 96, YEL, 'middle', 14)}</g>${vign}`);

// S5 debating the constitution: bubbles → lightning «ΔΙΑΦΟΡΕΣ»
shot('S5', cut(6), cut(7), `<g id="S5-cam">${hall()}
  ${G('S5-ru', pm('S5', 'ru'), 960, 770, .8)}
  <g><rect x="640" y="700" width="640" height="56" rx="8" fill="#7a5232" stroke="${INK}" stroke-width="6"/><rect x="680" y="756" width="26" height="110" fill="#5a3d24" stroke="${INK}" stroke-width="5"/><rect x="1214" y="756" width="26" height="110" fill="#5a3d24" stroke="${INK}" stroke-width="5"/></g>
  ${G('S5-sc', P.scroll('ΣΥΝΤΑΓΜΑ', 340), 960, 712, .45)}
  ${G('S5-en', pm('S5', 'en'), 420, 860, .85)}${G('S5-fr', pm('S5', 'fr'), 1500, 860, .85)}
  ${[[420, 330, 60], [960, 260, -50], [1500, 330, -60]].map(([x, y, tx], i) => G(`S5-bb${i}`, P.bubble(220, 120, tx, 100, bubbleScrib), x, y, .9, 'opacity="0"')).join('')}
  ${[0, 1].map(i => G(`S5-z${i}`, bolt(YEL), i ? 1240 : 600, 430, 1.1, `opacity="0"`)).join('')}
  ${G('S5-neq', `<circle r="80" fill="${PAPER}" stroke="${INK}" stroke-width="8"/>${txt('≠', 0, 44, 140, RED)}`, 960, 470, 1, 'opacity="0"')}
  ${T('S5-l', 'ΣΥΖΗΤΗΣΕΙΣ ΓΙΑ ΤΟ ΣΥΝΤΑΓΜΑ', 960, 120, 80, '#fff', 'middle', 13)}
  ${T('S5-d', 'ΔΙΑΦΟΡΕΣ', 1500, 160 + 80, 84, RED, 'middle', 13)}</g>${vign}`);

// S6 all three parties FOR the constitution: arms up + green «ΥΠΕΡ»
shot('S6', cut(7), cut(8), `<g id="S6-cam">${sky('#bfe0ea', '#f2f7f1', '#c2b48a', 860)}${clouds('S6', [[260, 160, .9], [1680, 150, 1]])}
  ${['en', 'fr', 'ru'].map((k, i) => G(`S6-${k}`, pm('S6', k, { start: 'happy' }), [520, 960, 1400][i], 860, .85) + G(`S6-${k}U`, P.partyMan(`s6${k}u`, k, PARTY[k][0], { arms: 'up', start: 'happy' }), [520, 960, 1400][i], 860, .85, 'opacity="0"') + T(`S6-tg${i}`, PARTY[k][1], [520, 960, 1400][i], 906, 36, PARTY[k][0], 'middle', 8)).join('')}
  ${G('S6-sc', P.scroll('ΣΥΝΤΑΓΜΑ', 520), 960, 330, 1)}
  ${G('S6-st', P.stamp('ΥΠΕΡ', GRN, 300, 84), 960, 500, 1, 'opacity="0"')}
  ${T('S6-l', 'ΚΑΙ ΤΑ ΤΡΙΑ ΚΟΜΜΑΤΑ', 960, 140, 96, '#fff', 'middle', 14)}</g>${vign}`);

// S7 «even the Russian party: the ONLY solution» — one golden key fits the door
shot('S7', cut(8), cut(9), `${night()}<g id="S7-cam">
  <path d="M 700 -120 L 420 880 L 1100 880 L 820 -120 Z" fill="#fff6c9" opacity=".16"/>
  <rect x="-400" y="880" width="2720" height="500" fill="#3a3326" stroke="${INK}" stroke-width="5"/>
  ${G('S7-ru', pm('S7', 'ru', { arms: 'hold' }), 760, 880, 1)}
  <rect id="S7-light" x="1330" y="330" width="300" height="550" fill="#fff3c4" opacity="0"/>
  ${G('S7-door', `<rect x="0" y="-550" width="300" height="550" fill="#7a5232" stroke="${INK}" stroke-width="7"/><rect x="30" y="-510" width="240" height="200" fill="#8a6240" stroke="${INK}" stroke-width="5"/><rect x="30" y="-280" width="240" height="200" fill="#8a6240" stroke="${INK}" stroke-width="5"/><circle cx="250" cy="-290" r="16" fill="${INK}"/><rect x="244" y="-284" width="12" height="30" fill="${INK}"/>`, 1330, 880, 1)}
  ${G('S7-dl', `<rect x="-150" y="-50" width="300" height="100" rx="12" fill="${PAPER}" stroke="${INK}" stroke-width="6"/>${txt('ΛΥΣΗ', 0, 24, 70)}`, 1480, 260, 1)}
  ${G('S7-key', P.key(), 980, 600, .75, 'opacity="0"')}${T('S7-kl', 'ΣΥΝΤΑΓΜΑ', 1060, 520, 52, YEL, 'middle', 9)}
  ${T('S7-l', 'ΑΚΟΜΗ ΚΑΙ ΤΟ ΡΩΣΙΚΟ', 760, 130, 88, RUC, 'middle', 13)}${T('S7-l2', 'ΜΟΝΑΔΙΚΗ ΛΥΣΗ', 1480, 140, 96, YEL, 'middle', 14)}</g>${vign}`);

// S8 Otto could not be toppled: the throne is bolted down, the three push and strain
shot('S8', cut(9), cut(10), `<g id="S8-cam">${hall()}
  ${G('S8-thr', P.throne(BLUE), 960, 860, 1.15)}${G('S8-ot', P.otto('s8ot', { arms: 'crossed', start: 'happy' }), 960, 870, .82)}
  ${[[860, 860], [1060, 860]].map(([x, y], i) => G(`S8-bo${i}`, boltHead, x + (i ? 70 : -70), y - 10, .9, 'opacity="0"')).join('')}
  ${G('S8-en', pm('S8', 'en', { start: 'strain', arms: 'hold' }), 560, 870, .8)}${G('S8-ru', pm('S8', 'ru', { start: 'strain', arms: 'hold' }), 380, 870, .8)}${G('S8-fr', pm('S8', 'fr', { start: 'strain', arms: 'hold' }), 1360, 870, .8)}
  ${T('S8-on', 'Ο ΟΘΩΝ', 960, 430, 72, YEL, 'middle', 11)}
  ${T('S8-l', 'ΔΕΝ ΗΤΑΝ ΔΥΝΑΤΟΝ', 960, 130, 88, '#fff', 'middle', 13)}${T('S8-l2', 'ΝΑ ΑΝΑΤΡΑΠΕΙ', 960, 230, 88, RED, 'middle', 13)}</g>${vign}`);

// S9 the goal: LIMIT the king's powers — rays shrink inside a frame
const rays = Array.from({ length: 10 }, (_, i) => `<path d="M 0 0 L ${Math.cos(i * Math.PI / 5) * 520 - Math.sin(i * Math.PI / 5) * 40} ${Math.sin(i * Math.PI / 5) * 420 + Math.cos(i * Math.PI / 5) * 40} L ${Math.cos(i * Math.PI / 5) * 520 + Math.sin(i * Math.PI / 5) * 40} ${Math.sin(i * Math.PI / 5) * 420 - Math.cos(i * Math.PI / 5) * 40} Z" fill="#F2C14E" stroke="${INK}" stroke-width="5" opacity=".9"/>`).join('');
shot('S9', cut(10), cut(11), `<g id="S9-cam">${hall(-400, W + 800, '#cdbb95')}
  ${G('S9-rays', rays, 960, 560, 1)}
  ${G('S9-thr', P.throne(BLUE), 960, 860, 1.15)}${G('S9-ot', P.otto('s9ot', { start: 'happy' }), 960, 870, .82)}
  ${G('S9-fr', P.frame(560, 620), 960, 560, 1, 'opacity="0"')}
  ${G('S9-tg', `<circle r="90" fill="#fff" stroke="${INK}" stroke-width="7"/><circle r="60" fill="${RED}" stroke="${INK}" stroke-width="6"/><circle r="30" fill="#fff" stroke="${INK}" stroke-width="5"/><circle r="10" fill="${RED}"/>`, 260, 420, 1, 'opacity="0"')}
  ${T('S9-zl', 'ΤΟ ΖΗΤΟΥΜΕΝΟ', 260, 580, 56, '#fff', 'middle', 10)}
  ${T('S9-ex', 'ΕΞΟΥΣΙΕΣ', 1600, 420, 64, YEL, 'middle', 11)}
  ${T('S9-l', 'ΠΕΡΙΟΡΙΣΜΟΣ', 960, 130, 104, '#fff', 'middle', 15)}${T('S9-l2', 'ΤΩΝ ΕΞΟΥΣΙΩΝ ΤΟΥ ΒΑΣΙΛΙΑ', 960, 225, 70, YEL, 'middle', 11)}</g>${vign}`);

// S10 the dynamic presence of the parties is PROVED: banners shoot up; magnifier + «ΑΠΟΔΕΙΞΗ»
const banner = (c, name) => `<rect x="-8" y="-560" width="16" height="560" fill="#6b4a2b" stroke="${INK}" stroke-width="5"/><path d="M 8 -550 L 230 -550 L 200 -470 L 230 -390 L 8 -390 Z" fill="${c}" stroke="${INK}" stroke-width="6"/>${otxt(name, 112, -456, 40)}`;
shot('S10', cut(11), C.mid11, `${night()}<g id="S10-cam">
  ${['en', 'fr', 'ru'].map((k, i) => G(`S10-f${i}`, banner(PARTY[k][0], PARTY[k][1]), 260 + i * 330, 900, 1)).join('')}
  ${[0, 1, 2].map(i => `<g id="S10-e${i}" opacity="0">${[-1, 1].map(s => `<path d="M ${260 + i * 330 + s * 40} 860 v -120 M ${260 + i * 330 + s * 70} 880 v -70" stroke="${YEL}" stroke-width="9" stroke-linecap="round"/>`).join('')}</g>`).join('')}
  ${G('S10-doc', `${paper(320, 400)}${txt('ΓΕΓΟΝΟΣ', 0, -120, 56)}${[0, 1, 2, 3].map(j => `<path d="M -110 ${-60 + j * 44} H ${j % 2 ? 60 : 110}" stroke="#b9a57c" stroke-width="10" stroke-linecap="round"/>`).join('')}`, 1530, 540, 1, 'opacity="0"')}
  ${G('S10-mg', P.magnifier(), 1450, 520, .9, 'opacity="0"')}
  ${G('S10-st', P.stamp('ΑΠΟΔΕΙΞΗ', GRN, 330, 66), 1540, 700, 1, 'opacity="0"')}
  ${T('S10-l', 'ΔΥΝΑΜΙΚΗ ΠΑΡΟΥΣΙΑ', 700, 130, 92, '#fff', 'middle', 14)}${T('S10-l2', 'ΤΩΝ ΚΟΜΜΑΤΩΝ', 700, 225, 70, YEL, 'middle', 11)}</g>${vign}`);

// S11 the three leaders CONDUCT the National Assembly 1843-1844
const tier = (p, x0, n, y, s, k0 = 0) => Array.from({ length: n }, (_, i) => G(`${p}${i}`, deputy(`${p}${i}`.toLowerCase(), i + k0, { start: 'happy' }), x0 + i * 120, y, s)).join('');
shot('S11', C.mid11, cut(12), `<g id="S11-cam">${hall(-400, W + 800, '#d2c09a', 900)}
  <path d="M -400 520 Q 960 420 2320 520 L 2320 900 L -400 900 Z" fill="#b89a6a" stroke="${INK}" stroke-width="5"/>
  <g id="S11-tA">${tier('S11-a', 40, 5, 640, .42)}${tier('S11-b', 1400, 5, 640, .42, 2)}</g>
  <g id="S11-tB">${tier('S11-c', -20, 6, 800, .5, 1)}${tier('S11-d', 1320, 6, 800, .5, 3)}</g>
  <rect x="660" y="740" width="600" height="160" rx="10" fill="#7a5232" stroke="${INK}" stroke-width="6"/>${txt('ΕΘΝΟΣΥΝΕΛΕΥΣΗ', 960, 840, 50, '#f1e2bc')}
  ${['en', 'fr', 'ru'].map((k, i) => G(`S11-${k}`, P.partyMan(`s11${k}`, k, PARTY[k][0], { arms: 'up', start: 'happy' }), 760 + i * 200, 750, .62)).join('')}
  ${[0, 1, 2].map(i => G(`S11-bt${i}`, baton, 760 + i * 200 + 47, 750 - 136, 1)).join('')}
  ${T('S11-l', 'ΟΙ ΤΡΕΙΣ ΗΓΕΤΕΣ', 960, 130, 92, '#fff', 'middle', 14)}${T('S11-l2', 'ΔΙΗΥΘΥΝΑΝ ΤΙΣ ΕΡΓΑΣΙΕΣ', 960, 225, 64, YEL, 'middle', 10)}</g>${vign}
  ${T('S11-y', '1843-1844', 64, 120, 80, YEL, 'start', 13)}`);

// S12 they AVOIDED the extreme positions: walking the middle of a ridge
shot('S12', cut(12), cut(13), `<g id="S12-cam">${sky('#a9cfe0', '#eef4ee', '#3b3a40', 2000)}
  <path d="M -400 1400 L -400 900 Q 300 940 520 860 L 1400 860 Q 1620 940 2320 900 L 2320 1400 Z" fill="#2a2830"/>
  <path d="M 520 860 L 1400 860 L 1480 1400 L 440 1400 Z" fill="#c9b98d" stroke="${INK}" stroke-width="6"/>
  <path d="M 520 860 L 440 1400 M 1400 860 L 1480 1400" stroke="${INK}" stroke-width="8"/>
  ${G('S12-sL', P.signpost('ΑΚΡΑΙΑ', -1, '#f6c7bd'), 470, 880, .9)}${G('S12-sR', P.signpost('ΑΚΡΑΙΑ', 1, '#f6c7bd'), 1450, 880, .9)}
  ${trio('S12', [740, 960, 1180], 860, .74, { start: 'neutral' }, false)}
  ${T('S12-l', 'ΑΠΕΦΥΓΑΝ', 960, 130, 92, '#fff', 'middle', 14)}${T('S12-l2', 'ΤΙΣ ΑΚΡΑΙΕΣ ΘΕΣΕΙΣ', 960, 225, 76, RED, 'middle', 12)}</g>${vign}`);

// S13 they prevailed over the radical groups of their parties
const grp = (p, x, k) => `${[-110, 110].map((dx, j) => G(`${p}-r${j}`, P.villager(`${p}r${j}`.toLowerCase(), { arms: 'up', start: 'angry', vest: PARTY[k][0] }), x + dx, 790, .55)).join('')}
  ${G(`${p}-b`, P.bubble(150, 90, 0, 70, `<text x="0" y="20" text-anchor="middle" font-family="Fira Sans Extra Condensed" font-weight="900" font-size="60" fill="${RED}">!!</text>`), x, 470, 1, 'opacity="0"')}
  ${G(`${p}-L`, pm(p, k), x, 880, .75)}${G(`${p}-U`, P.partyMan(`${p}u`.toLowerCase(), k, PARTY[k][0], { arms: 'up' }), x, 880, .75, 'opacity="0"')}`;
shot('S13', cut(13), C.mid13, `<g id="S13-cam">${sky('#f0bf86', '#fbe7cc', '#cdb68a', 860)}
  ${grp('S13A', 380, 'en')}${grp('S13B', 960, 'fr')}${grp('S13C', 1540, 'ru')}
  ${T('S13-l', 'ΕΠΙΒΛΗΘΗΚΑΝ', 960, 130, 96, GRN, 'middle', 14)}${T('S13-l2', 'ΣΤΙΣ ΡΙΖΟΣΠΑΣΤΙΚΕΣ ΟΜΑΔΕΣ', 960, 225, 70, '#fff', 'middle', 11)}</g>${vign}`);

// S14 decisions taken JOINTLY: three arms hold one quill on the constitution
const arm = (id, d, c) => `<g id="${id}"><path d="${d}" stroke="${INK}" stroke-width="64" stroke-linecap="round" fill="none"/><path d="${d}" stroke="${c}" stroke-width="50" stroke-linecap="round" fill="none"/></g>`;
shot('S14', C.mid13, cut(14), `<g id="S14-cam"><rect x="-400" y="-300" width="2720" height="1680" fill="#6b4a2b"/><rect x="-400" y="-300" width="2720" height="1680" fill="#000" filter="url(#paper)" opacity=".25"/>
  ${G('S14-pp', `${paper(1100, 560)}${txt('ΣΥΝΤΑΓΜΑΤΙΚΕΣ ΡΥΘΜΙΣΕΙΣ', 0, -190, 60)}`, 960, 560, 1)}
  ${[0, 1, 2, 3, 4].map(j => line(`S14-ln${j}`, 520, 470 + j * 64, j % 2 ? 1250 : 1400, 470 + j * 64, '#5a4a38', 10)).join('')}
  <g id="S14-hand">${arm('S14-a0', 'M -560 300 Q -300 220 -40 40', ENC)}${arm('S14-a1', 'M 0 520 Q 20 300 10 70', FRC)}${arm('S14-a2', 'M 560 300 Q 300 220 50 40', RUC)}
  <circle cx="-30" cy="40" r="26" fill="#F7F1E8" stroke="${INK}" stroke-width="5"/><circle cx="10" cy="62" r="26" fill="#F7F1E8" stroke="${INK}" stroke-width="5"/><circle cx="44" cy="40" r="26" fill="#F7F1E8" stroke="${INK}" stroke-width="5"/>
  <g transform="translate(0,40)">${P.quill()}</g></g>
  ${T('S14-l', 'ΑΠΟ ΚΟΙΝΟΥ', 960, 175, 104, YEL, 'middle', 15)}</g>${vign}`);

// S15 agreed to SECURE fundamental rights in the constitution: handshake → bolted plaque
shot('S15', cut(14), cut(15), `<g id="S15-cam">${sky('#bfe0ea', '#f2f7f1', '#c2b48a', 900)}
  ${G('S15-pl', `<rect x="-420" y="-150" width="840" height="300" rx="20" fill="#e9dcc0" stroke="${INK}" stroke-width="8"/><rect x="-390" y="-120" width="780" height="240" rx="12" fill="none" stroke="#a8823c" stroke-width="5"/>${txt('ΘΕΜΕΛΙΩΔΗ', 0, -20, 92)}${txt('ΔΙΚΑΙΩΜΑΤΑ', 0, 80, 92)}`, 960, 430, 1, 'opacity="0"')}
  ${[[-420, -150], [420, -150], [-420, 150], [420, 150]].map(([x, y], i) => G(`S15-bo${i}`, boltHead, 960 + x, 430 + y, 1, 'opacity="0"')).join('')}
  <g id="S15-hs"><g transform="translate(0,-170)">${arm('S15-a0', 'M 360 980 Q 600 860 900 770', ENC)}${arm('S15-a1', 'M 960 1180 Q 980 950 960 790', FRC)}${arm('S15-a2', 'M 1560 980 Q 1320 860 1020 770', RUC)}
  <circle cx="930" cy="770" r="34" fill="#F7F1E8" stroke="${INK}" stroke-width="6"/><circle cx="990" cy="770" r="34" fill="#F7F1E8" stroke="${INK}" stroke-width="6"/><circle cx="960" cy="800" r="34" fill="#F7F1E8" stroke="${INK}" stroke-width="6"/></g></g>
  ${T('S15-sy', 'ΣΥΜΦΩΝΗΣΑΝ', 960, 470, 76, '#fff', 'middle', 12)}
  ${T('S15-l', 'ΚΑΤΟΧΥΡΩΣΗ ΣΤΟ ΣΥΝΤΑΓΜΑ', 960, 140, 88, YEL, 'middle', 13)}</g>${vign}`);

// S16 the six rights — a gallery, the camera glides frame to frame
const FX = i => 360 + i * 620;
const rightIcon = [
  `<g transform="translate(0,120) scale(.55)">${P.balance()}</g>`,
  `<g id="S16-ch">${P.brokenChain('S16c')}</g>`,
  `<g transform="translate(0,110) scale(1.1)">${P.house()}</g><g transform="translate(0,90) scale(.5)">${P.padlock()}</g>`,
  `<g transform="translate(-60,10) scale(.55)">${P.newspaper()}</g><g transform="translate(90,-50) scale(.6)">${P.bubble(200, 120, -60, 100, `<text x="0" y="20" text-anchor="middle" font-family="Fira Sans Extra Condensed" font-weight="900" font-size="56" fill="${INK}">!</text>`)}</g>`,
  `<g transform="translate(0,100) scale(1.05)">${P.house('#efe4c9', '#6aa84f')}</g><path d="M -150 100 H 150 M -150 70 H 150" stroke="#7a5232" stroke-width="10"/>${[-140, -80, 80, 140].map(x => `<rect x="${x - 6}" y="50" width="12" height="60" fill="#7a5232" stroke="${INK}" stroke-width="3"/>`).join('')}`,
  `<g transform="translate(0,90) scale(.8)">${P.book()}</g><g transform="translate(60,-10) rotate(30)"><rect x="-8" y="-90" width="16" height="120" fill="${YEL}" stroke="${INK}" stroke-width="4"/><path d="M -8 30 L 0 50 L 8 30 Z" fill="#f2d2a0" stroke="${INK}" stroke-width="3"/></g>`,
];
const rightName = ['ΙΣΟΤΗΤΑ', 'ΟΧΙ ΔΟΥΛΕΙΑ', 'ΟΙΚΟΓΕΝΕΙΑΚΟ ΑΣΥΛΟ', 'ΓΝΩΜΗ ΚΑΙ ΤΥΠΟΣ', 'ΙΔΙΟΚΤΗΣΙΑ', 'ΔΩΡΕΑΝ ΕΚΠΑΙΔΕΥΣΗ'];
shot('S16', cut(15), cut(21), `<g id="S16-cam">${hall(-400, 4900, '#e3d3ae', 900)}
  ${rightIcon.map((ic, i) => G(`S16-f${i}`, `<rect x="-230" y="-190" width="460" height="380" fill="#fbf6e8"/>${ic}${P.frame(460, 380)}`, FX(i), 480, 1, 'opacity="0"') + T(`S16-n${i}`, rightName[i], FX(i), 790, 58, '#fff', 'middle', 10)).join('')}</g>${vign}
  ${T('S16-l', 'ΘΕΜΕΛΙΩΔΗ ΔΙΚΑΙΩΜΑΤΑ', 960, 110, 70, YEL, 'middle', 11)}`);

// S17 they realised (bulbs) that rights must be protected from the state's arbitrariness (shield vs stamp)
shot('S17', cut(21), cut(22), `<g id="S17-cam">${hall(-400, 3900, '#d9c8a4', 880)}
  ${[0, 1, 2, 3, 4].map(i => G(`S17-d${i}`, deputy(`s17d${i}`, i), 180 + i * 190, 880, .58) + G(`S17-bu${i}`, P.bulb(), 180 + i * 190, 600 - 30 * (i % 2), .7, 'opacity="0"')).join('')}
  ${G('S17-cz', P.villager('s17cz', { arms: 'up', start: 'shock' }), 2100, 890, .9)}
  ${G('S17-sh', `${P.shield(GRN)}${otxt('ΔΙΚΑΙΩΜΑΤΑ', 0, 0, 40)}`, 2100, 520, 1.5, 'opacity="0"')}
  ${G('S17-stp', `<rect x="-26" y="-330" width="52" height="200" rx="14" fill="#6b4a2b" stroke="${INK}" stroke-width="6"/><rect x="-300" y="-140" width="600" height="140" rx="14" fill="${RED}" stroke="${INK}" stroke-width="8"/>${otxt('ΑΥΘΑΙΡΕΣΙΑ', 0, -46, 70)}`, 2100, -200, 1)}
  ${T('S17-l', 'ΣΥΝΕΙΔΗΤΟΠΟΙΗΣΑΝ', 600, 130, 92, '#fff', 'middle', 14)}
  ${T('S17-l2', 'ΤΗΣ ΚΡΑΤΙΚΗΣ', 2690, 420, 64, YEL, 'middle', 10)}${T('S17-l3', 'ΕΞΟΥΣΙΑΣ', 2690, 500, 64, YEL, 'middle', 10)}</g>${vign}`);

// S18 a WEAKNESS: assembly and association were NOT secured — two dashed empty frames
const ghostMeet = `<g opacity=".6">${[-70, 0, 70].map((x, i) => `<g transform="translate(${x},${70 - (i % 2) * 20}) scale(.28)">${P.villager('s18g' + i, { start: 'happy' })}</g>`).join('')}</g>`;
const ghostClub = `<g opacity=".6"><rect x="-120" y="-110" width="240" height="60" rx="8" fill="${PAPER}" stroke="${INK}" stroke-width="4"/>${txt('ΣΩΜΑΤΕΙΟ', 0, -68, 36)}${[-60, 60].map((x, i) => `<g transform="translate(${x},90) scale(.3)">${P.citizen('s18h' + i, { start: 'happy' })}</g>`).join('')}<path d="M -40 10 H 40" stroke="${INK}" stroke-width="8"/></g>`;
shot('S18', cut(22), cut(23) + .4, `<g id="S18-cam">${wide('#e9dcc0', -400, 2720)}
  ${rightName.map((n, i) => G(`S18-c${i}`, `<rect x="-118" y="-70" width="236" height="140" rx="12" fill="#fbf6e8" stroke="${INK}" stroke-width="5"/>${txt(n.split(' ').slice(-1)[0], 0, -14, 36)}<g transform="translate(0,34) scale(.45)">${tick()}</g>`, 260 + i * 280, 320, 1)).join('')}
  ${[ghostMeet, ghostClub].map((g, i) => G(`S18-g${i}`, `<rect x="-200" y="-150" width="400" height="300" rx="16" fill="#fff" fill-opacity=".5" stroke="${INK}" stroke-width="7" stroke-dasharray="26 18"/>${g}`, [700, 1220][i], 640, 1, 'opacity="0"') + T(`S18-n${i}`, ['ΣΥΝΕΡΧΕΣΘΑΙ', 'ΣΥΝΕΤΑΙΡΙΖΕΣΘΑΙ'][i], [700, 1220][i], 860, 58, YEL, 'middle', 10) + G(`S18-x${i}`, xMark(RED, 80, 26), [700, 1220][i], 640, 1, 'opacity="0"')).join('')}
  ${line('S18-cr', 120, 470, 1800, 470, RED, 10, 'stroke-dasharray="40 20"')}
  ${T('S18-l', 'ΜΙΑ ΑΔΥΝΑΜΙΑ', 960, 140, 100, RED, 'middle', 15)}</g>${vign}`);

// S19 obstacles to building party machinery: the gear machine jams on a roadblock
shot('S19', cut(23) + .4, cut(24), `${night('#33404f')}<g id="S19-cam">
  <rect x="520" y="300" width="880" height="520" rx="30" fill="#4b5563" stroke="${INK}" stroke-width="7"/>
  ${G('S19-g0', P.gear(120, '#9aa1aa', 12), 760, 560)}${G('S19-g1', P.gear(80, '#b8bfc7', 9), 952, 440)}${G('S19-g2', P.gear(100, '#9aa1aa', 11), 1150, 620)}
  ${G('S19-blk', `<rect x="-260" y="-34" width="520" height="68" rx="10" fill="#fff" stroke="${INK}" stroke-width="7"/>${[-200, -100, 0, 100, 200].map(x => `<path d="M ${x - 30} -34 L ${x + 20} 34 L ${x + 60} 34 L ${x + 10} -34 Z" fill="${RED}"/>`).join('')}<rect x="-260" y="-34" width="520" height="68" rx="10" fill="none" stroke="${INK}" stroke-width="7"/>`, 960, 540, 1, 'opacity="0"')}
  ${[0, 1, 2].map(i => G(`S19-sp${i}`, `<path d="M 0 -30 L 8 -8 L 30 0 L 8 8 L 0 30 L -8 8 L -30 0 L -8 -8 Z" fill="${YEL}" stroke="${INK}" stroke-width="4"/>`, [870, 1050, 960][i], [470, 520, 620][i], 1, 'opacity="0"')).join('')}
  ${G('S19-plate', `<rect x="-330" y="-46" width="660" height="92" rx="12" fill="${PAPER}" stroke="${INK}" stroke-width="6"/>${txt('ΚΟΜΜΑΤΙΚΟΣ ΜΗΧΑΝΙΣΜΟΣ', 0, 20, 56)}`, 960, 900 - 40, 1)}
  ${G('S19-en', pm('S19', 'en', { start: 'neutral' }), 280, 900, .62)}${G('S19-fr', pm('S19', 'fr', { start: 'neutral' }), 1640, 900, .62)}
  ${T('S19-l', 'ΕΜΠΟΔΙΑ', 960, 150, 120, RED, 'middle', 16)}${T('S19-l2', 'ΣΤΗ ΣΥΓΚΡΟΤΗΣΗ', 960, 245, 64, '#fff', 'middle', 10)}</g>${vign}`);

// S20 the king's powers were DEFINED in the constitution: a boundary is drawn around Otto
shot('S20', cut(24), cut(25), `<g id="S20-cam">${hall(-400, W + 800, '#cdbb95')}
  ${G('S20-thr', P.throne(BLUE), 960, 860, 1.15)}${G('S20-ot', P.otto('s20ot', { start: 'neutral', arms: 'hold' }), 960, 870, .82)}
  ${G('S20-sc', P.scroll('ΣΥΝΤΑΓΜΑ', 300), 1460, 560, .8)}
  <path id="S20-bx" d="M 660 300 H 1260 V 900 H 660 Z" fill="none" stroke="${YEL}" stroke-width="12" stroke-dasharray="30 20" pathLength="1000" stroke-dashoffset="1000"/>
  ${T('S20-l', 'ΚΑΘΟΡΙΣΤΗΚΑΝ', 960, 130, 92, '#fff', 'middle', 14)}${T('S20-l2', 'ΟΙ ΒΑΣΙΛΙΚΕΣ ΕΞΟΥΣΙΕΣ', 960, 228, 74, YEL, 'middle', 12)}</g>${vign}`);

// S21 the king takes PART in legislation · head of state and army
shot('S21', cut(25), cut(26), `<g id="S21-cam">${hall(-400, 2200, '#d9c8a4', 880)}
  <rect x="1780" y="-300" width="2500" height="1180" fill="#24324a"/>${stars('S21', 1800, 2400)}
  <rect x="1780" y="880" width="2500" height="500" fill="#4a4030" stroke="${INK}" stroke-width="5"/>
  ${G('S21-ot', P.otto('s21ot', { arms: 'hold', start: 'happy' }), 560, 880, .9)}${G('S21-dp', P.minister('s21dp', { arms: 'hold', start: 'happy', pin: '' }), 1060, 880, .9)}
  ${G('S21-lw', P.scroll('ΝΟΜΟΣ', 260), 810, 640, .9)}
  ${G('S21-pal', P.palace(null), 2740, 860, 1.45)}
  ${G('S21-ot2', P.otto('s21ou', { start: 'happy' }), 2740, 920, .62)}
  ${[2260, 2390, 3090, 3220].map((x, i) => G(`S21-s${i}`, soldier1843(`s21s${i}`, { start: 'neutral' }), x, 900, .72)).join('')}
  ${T('S21-l', 'ΣΥΜΜΕΤΟΧΗ ΣΤΗ', 810, 130, 80, '#fff', 'middle', 13)}${T('S21-l2', 'ΝΟΜΟΘΕΤΙΚΗ ΕΞΟΥΣΙΑ', 810, 228, 80, YEL, 'middle', 13)}
  ${T('S21-m', 'ΑΡΧΗΓΟΣ ΤΟΥ ΚΡΑΤΟΥΣ', 2740, 130, 80, '#fff', 'middle', 13)}${T('S21-m2', 'ΚΑΙ ΤΟΥ ΣΤΡΑΤΟΥ', 2740, 228, 80, YEL, 'middle', 13)}</g>${vign}`);

// S22 BUT no act of his was valid without the countersignature of the competent minister
shot('S22', cut(26), cut(28), `<g id="S22-cam">${hall(-400, W + 800, '#d2c09a')}
  <rect x="560" y="700" width="800" height="50" rx="8" fill="#7a5232" stroke="${INK}" stroke-width="6"/>
  ${G('S22-ot', P.otto('s22ot', { arms: 'hold', start: 'neutral' }), 400, 880, .85)}
  ${G('S22-dc', P.decree('ΠΡΑΞΗ', 'S22d'), 960, 470, 1.15)}
  ${G('S22-no', P.stamp('ΧΩΡΙΣ ΙΣΧΥ', RED, 380, 64), 960, 440, 1, 'opacity="0"')}
  ${G('S22-ok', P.stamp('ΙΣΧΥΕΙ', GRN, 320, 80), 960, 440, 1, 'opacity="0"')}
  ${G('S22-mn', P.minister('s22mn', { arms: 'hold', start: 'neutral' }), 1540, 880, .85)}${T('S22-mt', 'ΥΠΟΥΡΓΟΣ', 1540, 920, 40, '#fff', 'middle', 8)}
  ${T('S22-l', 'ΠΡΟΣΥΠΟΓΡΑΦΗ', 960, 120, 96, YEL, 'middle', 14)}${T('S22-l2', 'ΤΟΥ ΑΡΜΟΔΙΟΥ ΥΠΟΥΡΓΟΥ', 960, 205, 58, '#fff', 'middle', 10)}</g>${vign}
  ${T('S22-om', 'ΟΜΩΣ', 70, 130, 96, RED, 'start', 14)}`);

// S23 α) universal suffrage for men, minimal restrictions: men of every kind step over a LOW hurdle and vote
const Q = [1120, 950, 780, 610, 440, 270];
const voters = [P.villager, P.citizen, P.prokritos, P.shipowner, P.armatolos, P.minister];
shot('S23', cut(28), cut(32), `<g id="S23-cam">${sky('#bfe0ea', '#f2f7f1', '#c9b98d', 880)}${clouds('S23', [[300, 150, .9], [1500, 110, 1]])}
  ${G('S23-bx', P.ballotBox(), 1450, 880, 1.15)}
  ${G('S23-h', `<rect x="-90" y="-46" width="180" height="16" rx="6" fill="#fff" stroke="${INK}" stroke-width="5"/><rect x="-86" y="-30" width="12" height="30" fill="#7a5232" stroke="${INK}" stroke-width="3"/><rect x="74" y="-30" width="12" height="30" fill="#7a5232" stroke="${INK}" stroke-width="3"/>`, 1250, 880, 1)}
  ${voters.map((f, i) => G(`S23-v${i}`, f(`s23v${i}`, { start: 'happy' }), Q[i], 880, .66)).join('')}
  ${G('S23-pp', `<rect x="-34" y="-22" width="68" height="44" fill="#fff" stroke="${INK}" stroke-width="4"/><path d="M -20 -6 H 20 M -20 8 H 10" stroke="#888" stroke-width="4"/>`, 1450, 560, 1, 'opacity="0"')}
  ${G('S23-sg', P.signpost('ΕΛΑΧΙΣΤΟΙ ΠΕΡΙΟΡΙΣΜΟΙ', 1), 1200, 640, .6, 'opacity="0"')}
  ${T('S23-d', 'ΜΕ ΑΛΛΕΣ ΔΙΑΤΑΞΕΙΣ', 960, 130, 80, '#fff', 'middle', 13)}${T('S23-a', 'Α)', 70, 130, 96, YEL, 'start', 14)}
  ${T('S23-l', 'ΚΑΘΟΛΙΚΗ ΨΗΦΟΦΟΡΙΑ', 960, 130, 92, YEL, 'middle', 14)}${T('S23-l2', 'ΓΙΑ ΤΟΥΣ ΑΝΔΡΕΣ', 960, 228, 72, '#fff', 'middle', 12)}</g>${vign}`);

// S24 a world first: the Greek voter wins the race; France (1848) and Britain (1918) behind
shot('S24', cut(32), cut(33), `<g id="S24-cam">${sky('#bfe0ea', '#f2f7f1', '#7fb069', 760)}
  <rect id="S24-lanes" x="-400" y="760" width="3000" height="600" fill="url(#S24-lp)"/>
  <defs><pattern id="S24-lp" width="160" height="110" patternUnits="userSpaceOnUse"><rect width="160" height="110" fill="#c86e4e"/><path d="M 0 108 H 90" stroke="#fff" stroke-width="7"/></pattern></defs>
  ${G('S24-gr', P.villager('s24gr', { start: 'happy', arms: 'up' }), 1300, 920, .78)}${G('S24-fr', P.marianne('s24fr', { start: 'shock' }), 860, 900, .72)}${G('S24-uk', P.johnbull('s24uk', { start: 'shock' }), 470, 880, .72)}
  ${T('S24-tg', 'ΕΛΛΑΔΑ', 1300, 560, 44, '#fff', 'middle', 8)}${T('S24-tf', 'ΓΑΛΛΙΑ', 860, 570, 40, '#fff', 'middle', 8)}${T('S24-tu', 'ΒΡΕΤΑΝΙΑ', 470, 570, 40, '#fff', 'middle', 8)}
  <g><rect x="1620" y="300" width="20" height="600" fill="#fff" stroke="${INK}" stroke-width="5"/>${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(j => `<rect x="1620" y="${300 + j * 60}" width="20" height="30" fill="${INK}"/>`).join('')}</g>
  ${G('S24-wr', P.wreath(), 1300, 650, .55, 'opacity="0"')}
  ${T('S24-l', 'ΠΑΓΚΟΣΜΙΑ ΠΡΩΤΟΠΟΡΙΑ', 960, 140, 104, YEL, 'middle', 15)}</g>${vign}`);

// S25 β) the electoral procedure: positive votes for as many candidates as he wished
const cand = [ENC, FRC, ENC, FRC, ENC];
shot('S25', cut(33), cut(35), `<g id="S25-cam">${hall(-400, W + 800, '#d9c8a4', 880)}
  <rect x="200" y="760" width="1520" height="60" rx="10" fill="#7a5232" stroke="${INK}" stroke-width="6"/>
  ${cand.map((c, i) => G(`S25-c${i}`, P.citizen(`s25c${i}`, { start: 'neutral', sash: [c] }), 360 + i * 300, 760, .6)).join('')}
  ${[0, 2, 3].map((i, j) => G(`S25-t${j}`, tick(GRN, 56), 360 + i * 300, 400, 1, 'opacity="0"')).join('')}
  ${T('S25-l', 'Β) ΕΚΛΟΓΙΚΗ ΔΙΑΔΙΚΑΣΙΑ', 960, 130, 92, '#fff', 'middle', 14)}${T('S25-l2', 'ΘΕΤΙΚΗ ΨΗΦΟΣ ΣΕ ΟΣΟΥΣ ΗΘΕΛΑΝ', 960, 228, 66, YEL, 'middle', 11)}
  ${T('S25-y', 'ΥΠΟΨΗΦΙΟΙ', 960, 880, 52, '#fff', 'middle', 9)}</g>${vign}`);

// S26 filling in ballots, even from DIFFERENT lists
const rowsY = [0, 1, 2, 3].map(r => -60 + r * 70);
shot('S26', cut(35), cut(37), `<g id="S26-cam"><rect x="-400" y="-300" width="2720" height="1680" fill="#3a4a5a"/><rect x="-400" y="-300" width="2720" height="1680" fill="#000" filter="url(#paper)" opacity=".25"/>
  ${G('S26-bl', `${paper(1000, 600, '#fbf8f0')}${txt('ΨΗΦΟΔΕΛΤΙΟ', 0, -220, 60)}
    ${[[-250, ENC], [250, FRC]].map(([x, c]) => `<rect x="${x - 210}" y="-170" width="420" height="60" rx="8" fill="${c}" stroke="${INK}" stroke-width="5"/>${otxt('ΣΥΝΔΥΑΣΜΟΣ', x, -126, 40)}${rowsY.map(y => `<rect x="${x - 190}" y="${y - 6}" width="44" height="44" fill="#fff" stroke="${INK}" stroke-width="4"/><path d="M ${x - 120} ${y + 16} H ${x + 180}" stroke="#9a9384" stroke-width="12" stroke-linecap="round"/>`).join('')}`).join('')}`, 960, 560, 1)}
  ${[[-250, 0], [-250, 2], [250, 1], [250, 3]].map(([x, r], i) => G(`S26-k${i}`, tick(i < 2 ? ENC : FRC, 30), 960 + x - 168, 560 + rowsY[r] + 16, 1, 'opacity="0"')).join('')}
  ${G('S26-q', P.quill(), 700, 640, 1)}
  ${T('S26-l', 'ΣΥΜΠΛΗΡΩΝΟΝΤΑΣ ΨΗΦΟΔΕΛΤΙΑ', 960, 120, 76, '#fff', 'middle', 12)}${T('S26-l2', 'ΚΑΙ ΔΙΑΦΟΡΕΤΙΚΩΝ ΣΥΝΔΥΑΣΜΩΝ', 960, 940 - 10, 64, YEL, 'middle', 10)}</g>${vign}`);

// S27 γ) a Parliament AND a Senate
shot('S27', cut(37), cut(38), `<g id="S27-cam">${sky('#a9cfe0', '#eef4ee', '#c9b98d', 880)}${clouds('S27')}
  ${G('S27-v', P.building('ΒΟΥΛΗ'), 600, 880, 1.35, 'opacity="0"')}${G('S27-g', P.building('ΓΕΡΟΥΣΙΑ'), 1320, 880, 1.35, 'opacity="0"')}
  ${T('S27-l', 'Γ) ΒΟΥΛΗ ΚΑΙ ΓΕΡΟΥΣΙΑ', 960, 140, 100, '#fff', 'middle', 15)}</g>${vign}`);

// S28 senators appointed by the king, for life
const senator = (id, extra = {}) => P.person({ id, coat: '#3a3f55', pants: '#2b2f3a', hair: 'side', hairC: '#d8d8d8', face: 'stache', faceC: '#d8d8d8', ...extra });
shot('S28', cut(38), cut(39), `<g id="S28-cam">${hall(-400, W + 800, '#cdbb95')}
  ${[0, 1, 2].map(i => G(`S28-ch${i}`, `<g transform="scale(.75)">${P.throne('#5a6a8a')}</g>`, 900 + i * 320, 880, 1) + G(`S28-s${i}`, senator(`s28s${i}`, { start: 'neutral' }), 900 + i * 320, 890, .62) + G(`S28-sa${i}`, `<path d="M -30 -94 L 26 -50 L 32 -58 L -24 -102 Z" fill="${BLUE}" stroke="${INK}" stroke-width="3"/>`, 900 + i * 320, 890, .62 * 1.7, 'opacity="0"') + G(`S28-sp${i}`, `<path d="M 0 -30 L 8 -8 L 30 0 L 8 8 L 0 30 L -8 8 L -30 0 L -8 -8 Z" fill="${YEL}" stroke="${INK}" stroke-width="4"/>`, 900 + i * 320, 600, 1, 'opacity="0"')).join('')}
  ${G('S28-ot', P.otto('s28ot', { start: 'happy', prop: sceptre }), 420, 890, .9)}
  ${[0, 1, 2, 3, 4].map(i => G(`S28-pg${i}`, `<rect x="-40" y="-50" width="80" height="100" rx="6" fill="#fff" stroke="${INK}" stroke-width="4"/><rect x="-40" y="-50" width="80" height="24" fill="${RED}" stroke="${INK}" stroke-width="4"/>`, 1700, 700, .9, 'opacity="0"')).join('')}
  ${T('S28-inf', '∞', 1700, 560, 220, YEL, 'middle', 14)}
  ${T('S28-l', 'ΔΙΟΡΙΖΟΝΤΑΝ ΑΠΟ ΤΟΝ ΒΑΣΙΛΙΑ', 960, 130, 84, '#fff', 'middle', 13)}${T('S28-l2', 'ΙΣΟΒΙΑ', 1700, 260, 96, YEL, 'middle', 14)}</g>${vign}`);

// S29 NO constitutional provision for the parties: the magnifier finds nothing
shot('S29', cut(39), cut(40), `<g id="S29-cam">${wide('#3a4a5a', -400, 2720)}
  ${G('S29-pp', `${paper(1100, 520)}${txt('ΣΥΝΤΑΓΜΑ', 0, -180, 64)}${Array.from({ length: 8 }, (_, j) => `<path d="M ${j % 2 ? 40 : -460} ${-110 + Math.floor(j / 2) * 70} H ${j % 2 ? 460 : -40}" stroke="#b9a57c" stroke-width="12" stroke-linecap="round"/>`).join('')}`, 960, 520, 1)}
  ${G('S29-mg', P.magnifier(), 560, 480, .9)}
  ${G('S29-q', `<rect x="-170" y="-46" width="340" height="92" rx="12" fill="#fff" stroke="${INK}" stroke-width="6" stroke-dasharray="18 12"/>${txt('ΚΟΜΜΑΤΑ;', 0, 22, 56)}`, 1380, 700, 1, 'opacity="0"')}
  ${G('S29-x', xMark(RED, 70, 24), 1380, 700, 1, 'opacity="0"')}
  ${trio('S29', [240, 1640, 1820], 930, .62, { start: 'neutral' }, false)}
  ${T('S29-l', 'ΣΥΝΤΑΓΜΑΤΙΚΗ ΠΡΟΒΛΕΨΗ', 960, 120, 84, '#fff', 'middle', 13)}${T('S29-l2', 'ΓΙΑ ΤΑ ΚΟΜΜΑΤΑ', 960, 205, 64, YEL, 'middle', 10)}${T('S29-l3', 'ΔΕΝ ΥΠΗΡΞΕ', 1380, 850, 72, RED, 'middle', 12)}</g>${vign}`);

// S30 the Rules of Procedure: committees made up by LOT (a lottery drum mixes the colours)
const balls = [ENC, FRC, RUC, FRC, ENC, RUC, RUC, ENC, FRC];
shot('S30', cut(40), cut(41) + .6, `<g id="S30-cam">${hall(-400, W + 800, '#d9c8a4', 880)}
  <rect x="250" y="600" width="160" height="280" fill="#7a5232" stroke="${INK}" stroke-width="6"/>${G('S30-bk', P.book('#8a2f24'), 330, 600, .8)}
  ${T('S30-bt', 'ΚΑΝΟΝΙΣΜΟΣ', 330, 380, 58, '#fff', 'middle', 9)}${T('S30-bt2', 'ΤΗΣ ΒΟΥΛΗΣ', 330, 445, 58, '#fff', 'middle', 9)}
  ${G('S30-ld', P.lotteryDrum('S30'), 900, 880, 1.15)}
  ${[0, 1].map(i => `<rect x="${1340 + i * 300 - 120}" y="760" width="240" height="40" rx="8" fill="#7a5232" stroke="${INK}" stroke-width="5"/>${otxt('ΕΠΙΤΡΟΠΗ', 1340 + i * 300, 860, 50)}`).join('')}
  ${balls.map((c, i) => G(`S30-b${i}`, `<circle r="26" fill="${c}" stroke="${INK}" stroke-width="5"/><circle cx="-8" cy="-8" r="7" fill="#fff" opacity=".6"/>`, 1118, 640, 1, 'opacity="0"')).join('')}
  ${T('S30-l', 'ΚΛΗΡΩΣΗ', 960, 140, 120, YEL, 'middle', 16)}${T('S30-l2', 'ΤΩΝ ΚΟΙΝΟΒΟΥΛΕΥΤΙΚΩΝ ΕΠΙΤΡΟΠΩΝ', 960, 240, 62, '#fff', 'middle', 10)}</g>${vign}`);

// S31 forced into deliberation; only SOMETIMES consensus (one table of two shakes hands)
const tableT = (p, x, ks) => `${ks.map((k, i) => G(`${p}-m${i}`, P.partyMan(`${p}m${i}`.toLowerCase(), k, PARTY[k][0], { start: 'angry', arms: 'crossed' }), x - 210 + i * 210, 830, .6)).join('')}
  <rect x="${x - 330}" y="740" width="660" height="56" rx="10" fill="#7a5232" stroke="${INK}" stroke-width="6"/><rect x="${x - 300}" y="796" width="24" height="90" fill="#5a3d24" stroke="${INK}" stroke-width="5"/><rect x="${x + 276}" y="796" width="24" height="90" fill="#5a3d24" stroke="${INK}" stroke-width="5"/>
  ${[0, 1].map(j => G(`${p}-b${j}`, P.bubble(170, 100, j ? -40 : 40, 80, bubbleScrib), x - 120 + j * 240, 380, .85, 'opacity="0"')).join('')}`;
shot('S31', cut(41) + .6, cut(44), `<g id="S31-cam">${hall(-400, W + 800, '#d2c09a', 880)}
  ${tableT('S31A', 520, ['en', 'fr', 'ru'])}${tableT('S31B', 1400, ['ru', 'en', 'fr'])}
  ${G('S31-hs', `<circle r="90" fill="#fff" stroke="${INK}" stroke-width="7"/><g transform="translate(0,6) scale(.9)">${tick(GRN, 60)}</g>`, 1400, 420, 1, 'opacity="0"')}
  ${T('S31-sn', 'ΣΥΝΑΙΝΕΣΗ', 1400, 580, 64, GRN, 'middle', 11)}
  ${T('S31-l', 'ΔΙΑΒΟΥΛΕΥΣΕΙΣ', 960, 130, 100, '#fff', 'middle', 15)}${T('S31-l2', 'ΚΑΙ ΟΡΙΣΜΕΝΕΣ ΦΟΡΕΣ…', 960, 225, 64, YEL, 'middle', 10)}</g>${vign}`);

// S32 universal suffrage created NEW TERMS for political and party action: the rule board flips
shot('S32', cut(44), cut(45), `<g id="S32-cam">${sky('#bfe0ea', '#f2f7f1', '#c9b98d', 880)}${clouds('S32', [[300, 140, .9]])}
  ${G('S32-bx', P.ballotBox(), 560, 880, 1.25)}${T('S32-bt', 'ΚΑΘΟΛΙΚΗ ΨΗΦΟΦΟΡΙΑ', 560, 560, 52, '#fff', 'middle', 9)}
  ${G('S32-bd', `${board(720, 460)}${txt('ΚΑΝΟΝΕΣ', 0, -60, 84, '#e8e4d6')}<path d="M -260 30 H 260 M -260 100 H 160" stroke="#cfcab8" stroke-width="10" stroke-linecap="round"/>`, 1340, 500, 1)}
  ${G('S32-bn', `${board(720, 460)}${txt('ΝΕΟΙ ΟΡΟΙ', 0, -50, 110, YEL)}${txt('ΠΟΛΙΤΙΚΗ', 0, 50, 56, '#e8e4d6')}${txt('ΚΟΜΜΑΤΙΚΗ ΔΡΑΣΗ', 0, 120, 56, '#e8e4d6')}`, 1340, 500, 1, 'opacity="0"')}
  ${T('S32-l', 'ΔΗΜΙΟΥΡΓΗΣΕ ΝΕΟΥΣ ΟΡΟΥΣ', 960, 130, 84, '#fff', 'middle', 13)}</g>${vign}`);

// S33 a wide field opened up; claiming interests got easier (sack up a ramp)
shot('S33', cut(45), cut(46), `<g id="S33-cam">${skyW(-400, 4700, 820, '#bfe0ea', '#f2f7f1', '#8fc06b')}
  ${G('S33-gL', `<rect x="-260" y="-360" width="260" height="360" fill="#a8823c" stroke="${INK}" stroke-width="7"/>${[1, 2, 3].map(j => `<rect x="${-260 + j * 62}" y="-360" width="14" height="360" fill="#7a5232"/>`).join('')}`, 960, 860, 1)}
  ${G('S33-gR', `<rect x="0" y="-360" width="260" height="360" fill="#a8823c" stroke="${INK}" stroke-width="7"/>${[1, 2, 3].map(j => `<rect x="${j * 62}" y="-360" width="14" height="360" fill="#7a5232"/>`).join('')}`, 960, 860, 1)}
  ${[0, 1, 2, 3, 4, 5].map(i => G(`S33-p${i}`, [P.villager, P.citizen, P.villagerW][i % 3](`s33p${i}`, { start: 'happy' }), 760 + i * 170 - 300, 900, .55)).join('')}
  ${['en', 'fr', 'ru'].map((k, i) => G(`S33-f${i}`, `<g transform="scale(.6)">${banner(PARTY[k][0], PARTY[k][1])}</g>`, 1250 + i * 210, 860, 1)).join('')}
  <path d="M 2500 900 L 3200 560 L 3200 900 Z" fill="#cdbd9c" stroke="${INK}" stroke-width="7"/>
  ${G('S33-sk', `<path d="M -110 0 Q -140 -110 -66 -140 L -80 -170 Q 0 -190 80 -170 L 66 -140 Q 140 -110 110 0 Q 0 16 -110 0 Z" fill="#c9a46a" stroke="${INK}" stroke-width="6"/>${otxt('ΣΥΜΦΕΡΟΝΤΑ', 0, -60, 34)}`, 2600, 860, 1)}
  ${G('S33-pu', P.villager('s33pu', { start: 'strain', arms: 'hold' }), 2440, 900, .6)}
  ${T('S33-l', 'ΕΥΡΥ ΠΕΔΙΟ', 960, 140, 110, YEL, 'middle', 16)}${T('S33-l2', 'ΓΙΑ ΤΗ ΣΥΜΜΕΤΟΧΗ', 960, 240, 64, '#fff', 'middle', 10)}
  ${T('S33-m', 'ΔΙΕΚΔΙΚΗΣΗ ΣΥΜΦΕΡΟΝΤΩΝ', 2860, 160, 80, YEL, 'middle', 13)}${T('S33-m2', 'ΔΙΕΥΚΟΛΥΝΘΗΚΕ', 2860, 255, 64, '#fff', 'middle', 10)}</g>${vign}`);

// S34–S36 the «ΙΣΩΣ» view: a dashed thought-frame
const isosFrame = p => `<rect id="${p}-fr" x="120" y="300" width="1680" height="620" rx="70" fill="none" stroke="#fff" stroke-width="10" stroke-dasharray="34 22"/>${T(`${p}-is`, 'ΙΣΩΣ;', 70, 140, 96, YEL, 'start', 14)}`;
const tophat = (id) => P.minister(id, { start: 'happy', pin: '' });
shot('S34', cut(46), cut(47), `${night('#2c3546')}<g id="S34-cam">
  <rect x="820" y="600" width="280" height="300" fill="#cfc1a0" stroke="${INK}" stroke-width="7"/><rect x="790" y="580" width="340" height="40" fill="#e0d3b4" stroke="${INK}" stroke-width="6"/>
  ${[0, 1, 2, 3].map(i => G(`S34-e${i}`, tophat(`s34e${i}`), 845 + i * 77, 584, .4)).join('')}
  ${G('S34-bld', P.building('ΘΕΣΜΟΙ'), 1440, 900, .75, 'opacity="0"')}
  ${Array.from({ length: 12 }, (_, i) => G(`S34-c${i}`, P.villager(`s34c${i}`, { start: 'neutral', coat: '#6a6a6a', vest: '#4a4a4a', vrakaC: '#7a7a7a' }), 260 + i * 112 + (i > 5 ? 160 : 0), 900, .3)).join('')}</g>
  ${isosFrame('S34')}
  ${T('S34-l', 'ΦΙΛΕΛΕΥΘΕΡΕΣ ΔΙΑΔΙΚΑΣΙΕΣ', 1080, 135, 70, '#fff', 'middle', 11)}${T('S34-l2', 'ΜΙΚΡΗ ΗΓΕΤΙΚΗ ΟΜΑΔΑ', 960, 395, 64, YEL, 'middle', 11)}${vign}`);

shot('S35', cut(47), cut(48), `${night('#2c3546')}<g id="S35-cam">
  <rect x="340" y="700" width="560" height="200" fill="#cfc1a0" stroke="${INK}" stroke-width="7"/>${txt('ΔΥΤΙΚΑ ΠΡΟΤΥΠΑ', 620, 820, 52)}
  ${G('S35-ma', P.marianne('s35ma', { arms: 'hold', start: 'happy' }), 500, 700, .7)}${G('S35-jb', P.johnbull('s35jb', { arms: 'hold', start: 'happy' }), 740, 700, .7)}
  ${G('S35-gr', P.villager('s35gr', { arms: 'hold', start: 'neutral' }), 1360, 900, .8)}
  ${G('S35-hat', `<path d="M -70 -70 L -64 -200 L 64 -200 L 70 -70 Z" fill="#222" stroke="${INK}" stroke-width="6"/><path d="M -120 -64 Q 0 -84 120 -64 Q 110 -50 0 -54 Q -110 -50 -120 -64 Z" fill="#222" stroke="${INK}" stroke-width="6"/>`, 1360, 900 - 210 * .8, 1.05, 'opacity="0"')}
  ${line('S35-mr', 1000, 300, 1000, 900, '#fff', 8, 'stroke-dasharray="20 18"')}
  ${G('S35-sg', `<rect x="-260" y="-52" width="520" height="104" rx="12" fill="${PAPER}" stroke="${INK}" stroke-width="6"/>${txt('ΑΝΑΓΚΕΣ ΤΗΣ ΚΟΙΝΩΝΙΑΣ', 0, 18, 44)}`, 1390, 470, 1, 'opacity="0"')}${G('S35-x', xMark(RED, 46, 18), 1720, 470, 1, 'opacity="0"')}</g>
  ${isosFrame('S35')}
  ${T('S35-l', 'ΚΑΤΑ ΜΙΜΗΣΗ', 1080, 120, 80, '#fff', 'middle', 13)}${T('S35-l2', 'ΔΥΤΙΚΩΝ ΠΡΟΤΥΠΩΝ', 1080, 205, 64, YEL, 'middle', 10)}${vign}`);

shot('S36', cut(48), cut(49), `${night('#2c3546')}<g id="S36-cam">
  ${G('S36-bp', `<rect x="-300" y="-230" width="600" height="460" fill="#2f5d8a" stroke="${INK}" stroke-width="7"/><g transform="translate(0,200) scale(1.2)" fill="none" stroke="#e6f0ff" stroke-width="4"><rect x="-170" y="-260" width="340" height="260"/><path d="M -195 -260 L 0 -330 L 195 -260 Z"/>${[0, 1, 2, 3].map(i => `<rect x="${-130 + i * 72}" y="-200" width="44" height="150"/>`).join('')}</g>${txt('ΠΡΟΤΥΠΟ', 0, -180, 50, '#e6f0ff')}`, 560, 560, .95)}
  ${G('S36-bl', P.building('ΘΕΣΜΟΙ'), 1380, 690, .95)}
  <rect x="1200" y="690" width="360" height="34" fill="#8a7a62" stroke="${INK}" stroke-width="6"/>
  ${G('S36-m', `<rect x="0" y="0" width="420" height="44" rx="22" fill="#efe4c9" stroke="${INK}" stroke-width="6"/><rect id="S36-mf" x="4" y="4" width="0" height="36" rx="18" fill="${RED}"/>`, 1170, 820, 1)}
  ${T('S36-ml', 'ΜΙΚΡΟΣ ΒΑΘΜΟΣ ΑΝΑΠΤΥΞΗΣ', 1380, 800, 40, '#fff', 'middle', 8)}</g>
  ${isosFrame('S36')}
  ${T('S36-l', 'ΠΑΡΑΜΟΡΦΩΘΗΚΑΝ', 1080, 130, 92, RED, 'middle', 14)}${T('S36-l2', 'ΣΤΗΝ ΕΦΑΡΜΟΓΗ', 1080, 225, 60, '#fff', 'middle', 10)}${vign}`);

// S37 «ΟΜΩΣ»: the dashed frame shatters
shot('S37', cut(49), cut(51), `${night('#2c3546')}<g id="S37-cam">
  ${Array.from({ length: 8 }, (_, i) => { const x = 200 + (i % 4) * 440, y = i < 4 ? 300 : 920; return G(`S37-p${i}`, `<path d="M -180 0 H 180" stroke="#fff" stroke-width="10" stroke-dasharray="34 22"/>`, x + 180, y, 1); }).join('')}
  ${G('S37-ma', P.marianne('s37ma', { start: 'shock' }), 420, 880, .6)}${G('S37-jb', P.johnbull('s37jb', { start: 'shock' }), 1500, 880, .6)}
  ${T('S37-om', 'ΟΜΩΣ', 960, 560, 260, YEL, 'middle', 24)}
  ${T('S37-l', 'ΑΝΕΞΑΡΤΗΤΑ ΑΠΟ ΤΙΣ', 960, 720, 64, '#fff', 'middle', 10)}${T('S37-l2', 'ΕΠΙΔΡΑΣΕΙΣ ΔΥΤΙΚΩΝ ΠΡΟΤΥΠΩΝ', 960, 805, 64, '#fff', 'middle', 10)}</g>${vign}`);

// S38 parliamentarism TOOK ROOT in Greece and followed its OWN roads
shot('S38', cut(51), cut(52), `<g id="S38-cam">${sky('#bfe0ea', '#f2f7f1', '#8a6a46', 760)}
  <rect x="-400" y="760" width="2720" height="20" fill="#7fb069" stroke="${INK}" stroke-width="5"/>
  ${G('S38-tr', P.tree('S38t'), 700, 770, 1)}
  ${line('S38-rd', 840, 760, 1700, 760, '#e9dcc0', 26)}
  ${G('S38-sg', P.signpost('ΔΙΚΟΙ ΤΟΥ ΔΡΟΜΟΙ', 1), 1500, 770, .85, 'opacity="0"')}
  ${T('S38-l', 'Ο ΚΟΙΝΟΒΟΥΛΕΥΤΙΣΜΟΣ', 960, 130, 92, '#fff', 'middle', 14)}${T('S38-r', 'ΡΙΖΩΣΕ', 330, 900, 84, YEL, 'middle', 13)}</g>${vign}`);

// S39 … to answer the needs, problems and demands of Greek society
shot('S39', cut(52), cut(54), `<g id="S39-cam">${sky('#bfe0ea', '#f2f7f1', '#c9b98d', 880)}
  ${['ΑΝΑΓΚΕΣ', 'ΠΡΟΒΛΗΜΑΤΑ', 'ΑΙΤΗΜΑΤΑ'].map((s, i) => G(`S39-v${i}`, (i === 1 ? P.villagerW : P.villager)(`s39v${i}`, { arms: 'up', start: 'neutral' }), 520 + i * 440, 880, .72) + G(`S39-s${i}`, `<rect x="-170" y="-50" width="340" height="100" rx="10" fill="${PAPER}" stroke="${INK}" stroke-width="6"/>${txt(s, 0, 20, 54)}`, 520 + i * 440, 880 - 300 * .72 - 70, 1) + G(`S39-t${i}`, tick(GRN, 46), 520 + i * 440, 880 - 300 * .72 - 175, 1, 'opacity="0"')).join('')}
  ${T('S39-l', 'Η ΕΛΛΗΝΙΚΗ ΚΟΙΝΩΝΙΑ', 960, 260, 84, '#fff', 'middle', 13)}</g>${vign}`);

// S40 political activation of large parts of the population; GRADUAL building of a state of law
shot('S40', cut(54), cut(56), `<g id="S40-cam">${skyW(-400, 4400, 880)}
  <filter id="S40-gs"><feColorMatrix id="S40-cm" type="saturate" values="0"/></filter>
  <g filter="url(#S40-gs)">${Array.from({ length: 12 }, (_, i) => G(`S40-c${i}`, [P.villager, P.citizen, P.villagerW, P.prokritos][i % 4](`s40c${i}`, { start: 'happy' }), 200 + (i % 6) * 280 + (i > 5 ? 140 : 0), i > 5 ? 935 : 860, i > 5 ? .5 : .42)).join('')}</g>
  ${Array.from({ length: 6 }, (_, i) => G(`S40-k${i}`, `<rect x="-120" y="-60" width="240" height="120" rx="6" fill="${['#e9dcc0', '#d8c8a6'][i % 2]}" stroke="${INK}" stroke-width="6"/>`, 2900 + (i % 2 ? 120 : -120), 820 - Math.floor(i / 2) * 120, 1, 'opacity="0"')).join('')}
  ${G('S40-roof', `<path d="M -300 0 L 0 -150 L 300 0 Z" fill="#efe4c9" stroke="${INK}" stroke-width="7"/>${txt('ΚΡΑΤΟΣ ΔΙΚΑΙΟΥ', 0, -30, 44)}`, 2900, 520, 1, 'opacity="0"')}
  ${G('S40-bal', `<g transform="scale(.42)">${P.balance()}</g>`, 2900, 370, 1, 'opacity="0"')}
  ${T('S40-l', 'ΠΟΛΙΤΙΚΗ ΕΝΕΡΓΟΠΟΙΗΣΗ', 960, 130, 88, '#fff', 'middle', 13)}${T('S40-l2', 'ΤΟΥ ΠΛΗΘΥΣΜΟΥ', 960, 225, 64, YEL, 'middle', 10)}
  ${T('S40-m', 'ΣΤΑΔΙΑΚΗ ΣΥΓΚΡΟΤΗΣΗ', 2900, 130, 84, '#fff', 'middle', 13)}</g>${vign}
  ${T('S40-ex', 'ΕΞΑΛΛΟΥ', 64, 120, 64, YEL, 'start', 10)}`);

// S41 a process of IMITATION would not have been enough
shot('S41', cut(56), cut(57), `<g id="S41-cam">${sky('#bfe0ea', '#f2f7f1', '#c9b98d', 880)}
  ${Array.from({ length: 6 }, (_, i) => G(`S41-k${i}`, `<rect x="-120" y="-60" width="240" height="120" rx="6" fill="${['#e9dcc0', '#d8c8a6'][i % 2]}" stroke="${INK}" stroke-width="6"/>`, 1340 + (i % 2 ? 120 : -120), 820 - Math.floor(i / 2) * 120, 1)).join('')}
  ${G('S41-roof', `<path d="M -300 0 L 0 -150 L 300 0 Z" fill="#efe4c9" stroke="${INK}" stroke-width="7"/>${txt('ΚΡΑΤΟΣ ΔΙΚΑΙΟΥ', 0, -30, 44)}`, 1340, 520, 1)}
  ${G('S41-gh', `<g fill="none" stroke="#fff" stroke-width="7" stroke-dasharray="22 16"><rect x="-240" y="-360" width="480" height="360"/><path d="M -300 -360 L 0 -510 L 300 -360 Z"/></g>${otxt('ΜΙΜΗΣΗ', 0, -170, 70, '#fff', 10)}`, 560, 880, 1)}
  ${G('S41-x', xMark(RED, 100, 30), 560, 640, 1, 'opacity="0"')}
  ${T('S41-l', 'ΔΕΝ ΘΑ ΑΡΚΟΥΣΕ', 960, 130, 104, RED, 'middle', 15)}${T('S41-l2', 'ΜΙΑ ΔΙΑΔΙΚΑΣΙΑ ΜΙΜΗΣΗΣ', 960, 225, 64, '#fff', 'middle', 10)}</g>${vign}`);

// S42 parties were a NECESSITY of the era and answered the needs of the people who formed them
shot('S42', cut(57), cut(58), `<g id="S42-cam">${sky('#bfe0ea', '#f2f7f1', '#c9b98d', 880)}${clouds('S42', [[300, 150, .9], [1650, 120, 1]])}
  ${Array.from({ length: 6 }, (_, i) => G(`S42-k${i}`, `<rect x="-110" y="-55" width="220" height="110" rx="6" fill="${['#e9dcc0', '#d8c8a6'][i % 2]}" stroke="${INK}" stroke-width="6"/>`, 960 + (i % 2 ? 110 : -110), 825 - Math.floor(i / 2) * 110, 1, 'opacity="0"')).join('')}
  ${G('S42-roof', `<path d="M -280 0 L 0 -140 L 280 0 Z" fill="#b0563a" stroke="${INK}" stroke-width="7"/>${otxt('ΚΟΜΜΑ', 0, -34, 56)}`, 960, 550, 1, 'opacity="0"')}
  ${[0, 1, 2, 3].map(i => G(`S42-p${i}`, [P.villager, P.citizen, P.villagerW, P.minister][i](`s42p${i}`, { start: 'happy', arms: 'up' }), [380, 560, 1360, 1540][i], 880, .62) + G(`S42-t${i}`, tick(GRN, 40), [380, 560, 1360, 1540][i], 600, 1, 'opacity="0"')).join('')}
  ${T('S42-l', 'ΑΝΑΓΚΑΙΟΤΗΤΑ ΤΗΣ ΕΠΟΧΗΣ', 960, 130, 92, YEL, 'middle', 14)}${T('S42-l2', 'ΑΝΤΑΠΟΚΡΙΝΟΝΤΑΝ ΣΤΙΣ ΑΝΑΓΚΕΣ', 960, 225, 60, '#fff', 'middle', 10)}</g>${vign}`);

// S43 the parties of the period cannot be described with today's terms — modern stickers bounce off
const sticker = (s, c) => `<rect x="-${s.length * 15 + 30}" y="-40" width="${s.length * 30 + 60}" height="80" rx="40" fill="${c}" stroke="${INK}" stroke-width="6"/>${otxt(s, 0, 16, 46)}`;
const STK = [['ΑΡΙΣΤΕΡΑ', '#c0392b', 'arist'], ['ΔΕΞΙΑ', '#2b5fa8', 'dexia'], ['ΠΡΟΟΔΕΥΤΙΚΑ', '#e08a2b', 'prood'], ['ΣΥΝΤΗΡΗΤΙΚΑ', '#4a5a7a', 'synt60']];
shot('S43', cut(58), C.end + 2.4, `<g id="S43-cam">${hall(-400, W + 800, '#d9c8a4', 860)}
  ${trio('S43', [560, 960, 1360], 860, .85, { start: 'neutral' })}
  ${STK.map(([s, c], i) => G(`S43-k${i}`, sticker(s, c), 960, 480, 1, 'opacity="0"') + G(`S43-x${i}`, xMark(RED, 34, 14), [560, 1360, 960, 560][i], [520, 520, 500, 520][i], 1, 'opacity="0"')).join('')}
  ${T('S43-l', 'ΟΧΙ ΜΕ ΣΗΜΕΡΙΝΟΥΣ ΟΡΟΥΣ', 960, 140, 96, '#fff', 'middle', 14)}</g>${vign}
  <rect id="S43-black" width="${W}" height="${H}" fill="#000" opacity="0"/>`);

// ---------- page ----------
const HL = ['επανάσταση της 3ης Σεπτεμβρίου 1843', 'έδρασε καταλυτικά', 'μεγαλύτερη σαφήνεια', 'ενεργότερο ρόλο', 'διαφορές', 'τα τρία κόμματα τάχθηκαν υπέρ του συντάγματος', 'το ρωσικό', 'μοναδική λύση', 'δεν ήταν δυνατόν να ανατραπεί ο Όθων', 'ο περιορισμός των εξουσιών του βασιλιά', 'οι τρεις ηγέτες', 'Εθνοσυνέλευσης', '1843-1844', 'ακραίες θέσεις', 'ριζοσπαστικές ομάδες', 'από κοινού', 'θεμελιώδη δικαιώματα', 'ισότητα', 'απαγόρευση της δουλείας', 'απαραβίαστο του οικογενειακού ασύλου', 'ελευθερία γνώμης και τύπου', 'προστασία της ιδιοκτησίας', 'δωρεάν εκπαίδευση', 'αυθαιρεσία της κρατικής εξουσίας', 'αδυναμία', 'συνέρχεσθαι', 'συνεταιρίζεσθαι', 'κομματικών μηχανισμών', 'βασιλικές εξουσίες', 'νομοθετικής εξουσίας', 'αρχηγία του κράτους και του στρατού', 'προσυπογραφή του αρμόδιου υπουργού', 'καθολικής ψηφοφορίας', 'για τους άνδρες', 'πρωτοπορία', 'θετική ψήφο', 'διαφορετικών Συνδυασμων', 'Βουλής και Γερουσίας', 'διορίζονταν από τον βασιλιά', 'ισόβια', 'Συνταγματική πρόβλεψη για τα κόμματα δεν υπήρξε', 'κλήρωση', 'διαβουλεύσεις', 'συναίνεση', 'vέους όρους', 'ευρύ πεδίο', 'διεκδίκηση συμφερόντων', 'μικρής πολιτικής ηγετικής ομάδας', 'κατά μίμηση δυτικών προτύπων', 'παραμορφώθηκαν', 'ρίζωσε', 'τους δικούς του δρόμους', 'κράτους δικαίου', 'διαδικασία μίμησης', 'αναγκαιότητα της εποχής', 'σημερινούς όρους'];
const subs = makeSubs(timing, HL, { skipBefore: S(4) - .2 });
const n = buildPage({ out: path.join(HERE, 'build/video.html'), shots, subs, C, data: {},
  runtimeJs: '../../../engine/runtime.js', shotsJs: '../shots.js' });
fs.writeFileSync(path.join(HERE, 'build/cues.json'), JSON.stringify({ ...C, DUR: C.end + 2.4 }, null, 1));
for (let i = 1; i < shots.length; i++) if (shots[i].a !== shots[i - 1].b) throw new Error(`shots do not tile at ${shots[i].id}`);
console.log('built', (n / 1e6).toFixed(2), 'MB,', shots.length, 'shots, duration', (C.end + 2.4).toFixed(1), 's');
