// Κεφ.2 Β.3 «Η «νέα γενιά»» (k2-b3) — SCENES (node side).
// Run from the kit root:  node episodes/k2-b3/scenes.mjs   →  build/video.html + build/cues.json
// ⚠️ EVERY time is derived from the narration (S/E/Wt) — never a literal second — so a new voice re-times the film.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { P, CH, W, H, INK, BLUE, RED, YEL, cueTools, G, T, clouds, vign, buildPage, makeSubs } from '../../engine/page.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const { timing, PH, S, E, Wt } = cueTools(path.join(HERE, 'timing.json'));

// episode colours (STORYBOARD.md → «Colour meaning»)
const OLD = '#9C7A54', NEW = '#4E9A5A', GOLD = '#D8A93B', GRN = '#6aa84f', PAPER = '#F1E2BC';
const ENC = '#3E9C94', FRC = '#8A5BB0', RUC = '#D9822B';   // the k2-b1 «ξενικά» party colours

// ---------- cues ----------
const mid = (i, w) => +(Wt(i, w) - .12).toFixed(2);       // a cut INSIDE a long phrase, just before word w
const C = {
  t1: 0.05, t2: S(1),
  parak: Wt(2, 'παρακμή'), xenik: Wt(2, 'ξενικών'), anad: Wt(2, 'ανάδειξη'), nea2: Wt(2, 'νέας'), noot2: Wt(2, 'νοοτροπία'), katav: Wt(2, 'καταβολές'),
  igetik: Wt(3, 'ηγετικές'), vios: Wt(3, 'βιώσει'), noot3: Wt(3, 'νοοτροπία'),
  idan: Wt(4, 'ιδανικά'), apop: Wt(5, 'απόψεις'), diam: Wt(5, 'διαμορφωθεί'), proep: Wt(5, 'προεπαναστατική'),
  epom: Wt(6, 'επόμενη'), istor: Wt(7, 'ιστορία'), anik: Wt(7, 'ανήκε'),
  ragd: Wt(8, 'ραγδαίες'), polit8: Wt(8, 'πολιτικών'), oikon8: Wt(8, 'οικονομικής'), techn: Wt(8, 'τεχνικής'),
  akol: S(9), protog: Wt(9, 'πρωτόγνωρους'),
  oikon10: Wt(10, 'οικονομική'), koin10: Wt(10, 'κοινωνική'), them: Wt(10, 'θεμελίων'), antil: Wt(10, 'αντίληψης'),
  stam: Wt(11, 'σταμάτησαν'), progon: Wt(11, 'πρόγονοί'),
  astik: Wt(12, 'αστικός'), kentra: Wt(13, 'κέντρα'), enim: Wt(13, 'ενημέρωσης'),
  meios: Wt(14, 'μείωση'), analf: Wt(14, 'αναλφάβητων'), andr: Wt(14, 'ανδρικό'),
  diad: Wt(15, 'διάδοση'), paid: Wt(15, 'παιδείας'), entas: Wt(15, 'εντάσεις'),
  apait: Wt(16, 'απαιτήσεις'), ayx16: Wt(16, 'αυξήθηκαν'),
  imim: Wt(17, 'ημιμαθείς'), epikr: Wt(17, 'επικρίνουν'), dysl17: Wt(17, 'δυσλειτουργίες'), kath: Wt(17, 'καθυστέρηση'), dysis: Wt(17, 'Δύσης'),
  epith: Wt(18, 'επιθυμία'), symm18: Wt(18, 'συμμετοχή'),
  empeir: Wt(19, 'εμπειρίες'), tourk: Wt(19, 'τουρκοκρατία'), epan20: S(20), antiv: S(21),
  voith: S(22), dynam: Wt(22, 'Δυνάμεων'), krisim: Wt(22, 'κρίσιμες'), apost: Wt(22, 'αποστασιοποιήθηκε'), antip: Wt(22, 'αντιπαραθέσεις'), komm22: Wt(22, 'κόμματα'),
  kritik: Wt(23, 'κριτική'), palai: Wt(23, 'παλαιότερους'), synt: Wt(23, 'συνταγματικό'), anapt: Wt(23, 'αναπτυχθεί'),
  empod: Wt(24, 'εμπόδιζαν'), avli: Wt(24, 'Αυλή'), vasil24: Wt(24, 'βασιλιάς'),
  theor: Wt(25, 'θεωρούσε'), atal: Wt(25, 'ατάλαντο'),
};
Object.assign(C, {
  teli: Wt(26, 'τέλη'), y1850: Wt(26, 'χίλια'), fanr: Wt(26, 'φανερή'), dysar26: Wt(26, 'δυσαρέσκεια'), megal: Wt(26, 'μεγάλων'),
  dyspr: Wt(26, 'δυσπραγίας'), dysl26: Wt(26, 'δυσλειτουργίας'), synkr: Wt(26, 'συγκροτήθηκαν'), antipol: Wt(26, 'αντιπολιτευτικοί'), eksyg: Wt(26, 'εκσυγχρονιστικά'), aitim26: Wt(26, 'αιτήματα'),
  ekl: Wt(27, 'εκλογές'), forol: S(28), elafr: Wt(28, 'ελάφρυνση'), agrot28: Wt(28, 'αγροτών'),
  epend: S(29), ypod: Wt(29, 'υποδομής'), trap: S(30), trap2: Wt(30, 'τραπεζών'), dioik: S(31),
  exefr: Wt(32, 'εξέφρασε'), drasi: Wt(32, 'δράση'), alex: Wt(32, 'Αλέξανδρος'),
  feb: Wt(33, 'Φεβρουάριο'), y1862a: Wt(33, 'χίλια'), dysar33: Wt(33, 'δυσαρέσκεια'), epan33: Wt(33, 'επανάσταση'),
  aitim34: Wt(34, 'αίτημα'), apom: Wt(34, 'απομάκρυνση'), vasil34: Wt(34, 'βασιλιά'),
  symm35: Wt(35, 'συμμετείχαν'), axiom: Wt(35, 'αξιωματικοί'),
  anerg: Wt(36, 'άνεργοι'), apof: Wt(36, 'απόφοιτοι'), panep: Wt(36, 'πανεπιστημίου'), denith: Wt(36, 'δεν ήθελαν'), agrot36: Wt(36, 'αγροτικής'), viot: Wt(36, 'βιοτεχνικής'), adik: Wt(36, 'αδικημένοι'),
  anot: Wt(37, 'ανώτερων'), strom: Wt(37, 'στρωμάτων'), efk: Wt(38, 'ευκαιρίες'), energ: Wt(38, 'ενεργότερη'), pragm38: Wt(38, 'πράγματα'),
  d12: S(39), y1862b: Wt(39, 'χίλια'), othon: Wt(39, 'Όθων'), anagk: Wt(39, 'αναγκάστηκε'), egkat: Wt(39, 'εγκαταλείψει'),
  end: E(PH.length - 1),
});
const cut = i => i === 0 ? 0 : +(S(i) - .15).toFixed(2);

// ---------- small builders ----------
const shots = [];
const shot = (id, a, b, inner) => shots.push({ id, a: +a.toFixed(2), b: +b.toFixed(2), svg: `<g id="${id}" class="shot" style="display:none">${inner}</g>` });
const st = (w = 5) => `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
const line = (id, x1, y1, x2, y2, c = INK, w = 8, extra = '') => `<path id="${id}" d="M ${x1} ${y1} L ${x2} ${y2}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" fill="none" pathLength="1000" stroke-dasharray="1000 1000" stroke-dashoffset="1000" ${extra}/>`;
const xMark = (c = RED, s = 70, w = 26) => `<path d="M ${-s} ${-s} L ${s} ${s} M ${s} ${-s} L ${-s} ${s}" stroke="${INK}" stroke-width="${w + 10}" stroke-linecap="round"/><path d="M ${-s} ${-s} L ${s} ${s} M ${s} ${-s} L ${-s} ${s}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
const tick = (c = GRN, s = 60) => { const d = `M ${-s} ${-s * .05} L ${-s * .3} ${s * .6} L ${s} ${-s * .75}`; return `<path d="${d}" stroke="${INK}" stroke-width="${s * .5}" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" stroke="${c}" stroke-width="${s * .32}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`; };
const txt = (s, x, y, size, fill = INK, anchor = 'middle', extra = '') => `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="Fira Sans Extra Condensed" font-weight="900" font-size="${size}" fill="${fill}" ${extra}>${s}</text>`;
const wide = (c, x0 = -400, w = 4600, y0 = -300, h = H + 600) => `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="${c}"/><rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="#000" filter="url(#paper)" opacity=".2"/>`;
let skN = 0;
const skyW = (x0, w, gy, top = '#bfe0ea', bot = '#f2f7f1', ground = '#c9b98d') => { const id = `k3sky${skN++}`; return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bot}"/></linearGradient></defs><rect x="${x0}" y="-300" width="${w}" height="${H + 600}" fill="url(#${id})"/><rect x="${x0}" y="${gy}" width="${w}" height="${H - gy + 400}" fill="${ground}" stroke="${INK}" stroke-width="5"/><rect x="${x0}" y="-300" width="${w}" height="${H + 600}" fill="#000" filter="url(#paper)" opacity=".18"/>`; };
const room = (wall = '#d9c8a4', floorY = 880, x0 = -400, w = W + 800) => `<rect x="${x0}" y="-300" width="${w}" height="${floorY + 300}" fill="${wall}"/><rect x="${x0}" y="${floorY}" width="${w}" height="${H - floorY + 400}" fill="#9a7b52" stroke="${INK}" stroke-width="5"/>${Array.from({ length: Math.ceil(w / 160) }, (_, i) => `<path d="M ${x0 + i * 160} ${floorY} L ${x0 + i * 160 - 60} ${H + 100}" stroke="#7e6240" stroke-width="4"/>`).join('')}<rect x="${x0}" y="-300" width="${w}" height="${H + 600}" fill="#000" filter="url(#paper)" opacity=".16"/>`;
const paper = (w, h, c = PAPER) => `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="8" fill="${c}" stroke="${INK}" stroke-width="7"/><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="8" fill="#000" filter="url(#paper)" opacity=".15"/>`;
const card = (s, c = '#efe4c9', fs = 52, tc = INK) => { const w = s.length * fs * .5 + 60; return `<g><rect x="${-w / 2}" y="${-fs * .9}" width="${w}" height="${fs * 1.6}" rx="18" fill="${c}" ${st(7)}/>${txt(s, 0, fs * .36, fs, tc)}</g>`; };
const tag = (s, c = '#fff', fs = 38) => { const w = s.length * fs * .52 + 40; return `<g><rect x="${-w / 2}" y="${-fs * .8}" width="${w}" height="${fs * 1.3}" rx="12" fill="${c}" ${st(5)}/>${txt(s, 0, fs * .32, fs, INK)}</g>`; };
const flagP = (c, w = 120, h = 80, pole = 300) => `<g><rect x="-6" y="${-pole}" width="12" height="${pole}" rx="4" fill="#7a5232" ${st(4)}/><path d="M 6 ${-pole + 6} Q ${w * .5} ${-pole - 14} ${w} ${-pole + 6} L ${w} ${-pole + 6 + h} Q ${w * .5} ${-pole + h - 14} 6 ${-pole + 6 + h} Z" fill="${c}" ${st(5)}/></g>`;
const grFlag = (w = 120, h = 80, pole = 260) => `<g><rect x="-6" y="${-pole}" width="12" height="${pole}" rx="4" fill="#7a5232" ${st(4)}/><g transform="translate(6,${-pole + 4})">${P.flag('grland', w, h)}</g></g>`;
const arrowUp = (c = GRN, s = 1) => `<path transform="scale(${s})" d="M -40 60 L -40 -10 L -80 -10 L 0 -100 L 80 -10 L 40 -10 L 40 60 Z" fill="${c}" ${st(7)}/>`;
const arrowDn = (c = RED, s = 1) => `<path transform="scale(${s})" d="M -40 -60 L -40 10 L -80 10 L 0 100 L 80 10 L 40 10 L 40 -60 Z" fill="${c}" ${st(7)}/>`;
const bolt = (c = YEL) => `<path d="M -30 -90 L 20 -90 L -4 -20 L 40 -20 L -30 90 L -10 10 L -50 10 Z" fill="${c}" ${st(6)}/>`;
const swords = `<g><path d="M -70 60 L 60 -70" stroke="${INK}" stroke-width="18" stroke-linecap="round"/><path d="M -70 60 L 60 -70" stroke="#d6dbe0" stroke-width="10" stroke-linecap="round"/><path d="M 70 60 L -60 -70" stroke="${INK}" stroke-width="18" stroke-linecap="round"/><path d="M 70 60 L -60 -70" stroke="#d6dbe0" stroke-width="10" stroke-linecap="round"/><path d="M -84 34 L -44 74 M 84 34 L 44 74" stroke="${GOLD}" stroke-width="14" stroke-linecap="round"/></g>`;
const thought = (w = 520, h = 260) => `<g><ellipse cx="0" cy="0" rx="${w / 2}" ry="${h / 2}" fill="#fff" ${st(7)}/>${[[-w * .28, h * .5, 26], [-w * .36, h * .78, 16]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" ${st(6)}/>`).join('')}</g>`;
const table = (label, c = '#8a5a32') => `<g><rect x="-200" y="-150" width="400" height="36" rx="10" fill="${c}" ${st(6)}/><rect x="-170" y="-114" width="24" height="114" fill="#5a3a1e" ${st(5)}/><rect x="146" y="-114" width="24" height="114" fill="#5a3a1e" ${st(5)}/>${label ? txt(label, 0, -170, 44, '#fff', 'middle', `stroke="${INK}" stroke-width="8" paint-order="stroke"`) : ''}</g>`;
const portrait = (inner, wall) => `<g><rect x="-120" y="-150" width="240" height="300" fill="#e8d6b0" ${st(5)}/>${inner}<rect x="-140" y="150" width="280" height="200" fill="${wall}"/><rect x="-120" y="-150" width="240" height="300" fill="#b08a4a" opacity=".25"/><rect x="-120" y="-150" width="240" height="300" fill="none" stroke="#7a5a2a" stroke-width="24"/><rect x="-120" y="-150" width="240" height="300" fill="none" ${st(5)}/><rect x="-132" y="-162" width="264" height="324" fill="none" ${st(4)}/></g>`;
const gearC = (id, r, c, n, label) => G(id, `${P.gear(r, c, n)}`, 0, 0, 1);
const diploma = `<g transform="translate(78,-96) rotate(-24)"><rect x="-44" y="-14" width="88" height="28" rx="14" fill="#f6f1e4" stroke="${INK}" stroke-width="4"/><rect x="-6" y="-16" width="12" height="32" fill="#B8323A" stroke="${INK}" stroke-width="3"/></g>`;
const halfBook = `<g transform="translate(70,-92)"><rect x="-34" y="-22" width="68" height="46" fill="#f6f1e4" stroke="${INK}" stroke-width="4"/><path d="M -26 -10 H 0 M -26 2 H -4 M 6 -10 H 26" stroke="#9a9384" stroke-width="5" stroke-linecap="round"/><path d="M 0 -22 V 24" stroke="${INK}" stroke-width="3"/></g>`;
const sack = (s = 1, c = '#b08a5a') => `<g transform="scale(${s})"><path d="M -90 0 Q -120 -120 -60 -170 L -36 -200 L 36 -200 L 60 -170 Q 120 -120 90 0 Z" fill="${c}" ${st(6)}/><path d="M -40 -186 Q 0 -170 40 -186" fill="none" ${st(5)}/></g>`;

// ---------- generic figures: ONE design = ONE role in this episode (STORYBOARD «Cast») ----------
const HAIRY = ['#5a3a22', '#3a2a20', '#7a4a2a', '#2a2420'];
const old = (id, extra = {}) => P.person({ id, coat: OLD, vest: '#c9a46a', sleeveC: '#fbf8f0', legs: 'fustanella', hat: 'kalpak', hatC: '#2a2420', beard: true, beardC: '#d8d3ca', face: 'stache', faceC: '#d8d3ca', hairC: '#d8d3ca', ...extra });   // ηγέτες των ξενικών κομμάτων
const young = (id, i = 0, extra = {}) => P.person({ id, coat: NEW, pants: '#3a3f48', vest: '#efe8d6', hair: 'short', hairC: HAIRY[i % HAIRY.length], ...extra });                                    // η νέα γενιά
const semi = (id, extra = {}) => P.person({ id, coat: '#b08a3a', pants: '#5a4a30', hat: 'bowler', hatC: '#3a2f24', face: 'stache', faceC: '#4a3020', hair: 'short', hairC: '#4a3020', prop: halfBook, ...extra }); // ημιμαθής
const gold = [-140, -118, -96, -74].map(y => `<circle cx="0" cy="${y}" r="5" fill="#E8B83A" stroke="${INK}" stroke-width="2.5"/>`).join('');
const officer = (id, i = 0, extra = {}) => P.person({ id, coat: '#2b3e66', pants: '#e8e2d4', hat: 'kepi', hatC: '#1d2a44', face: 'stache', faceC: HAIRY[i % 4], hairC: HAIRY[i % 4], chest: gold, ...extra });   // αξιωματικοί 1862
const grad = (id, i = 0, extra = {}) => P.person({ id, coat: '#6a4f86', pants: '#3a3348', vest: '#efe8d6', hair: 'short', hairC: HAIRY[(i + 1) % 4], glasses: true, prop: diploma, ...extra });           // άνεργοι απόφοιτοι
const courtier = (id, extra = {}) => P.person({ id, coat: '#7b2f4a', vest: GOLD, pants: '#f4efe4', hair: 'side', hairC: '#e8e4dc', face: 'sideburns', faceC: '#e8e4dc', ...extra });                        // η Αυλή
const cit = (id, i = 0, extra = {}) => P.citizen(id, { hairC: HAIRY[i % 4], ...extra });                                                                                                                   // πληθυσμός
const vil = (id, extra = {}) => P.villager(id, extra);                                                                                                                                                     // αγρότες
const upper = (id, extra = {}) => P.minister(id, extra);                                                                                                                                                   // ανώτερα στρώματα

// ================= SHOTS =================
// S1 title — a sepia portrait frame (old) beside a green one (new)
shot('S1', 0, cut(2), `<g id="S1-cam">${room('#e2cfa6', 900)}
  ${G('S1-fo', `${P.frame(420, 420)}<rect x="-184" y="-184" width="368" height="368" fill="#e8d6b0"/><rect x="-184" y="-184" width="368" height="368" fill="${OLD}" opacity=".35"/>${G('s1o-w', old('s1o'), 0, 190, .95)}`, 560, 640, 1)}
  ${G('S1-fy', `${P.frame(420, 420)}<rect x="-184" y="-184" width="368" height="368" fill="#dff0de"/>${G('s1y-w', young('s1y', 0), 0, 190, .95)}`, 1360, 640, 1)}</g>${vign}
  ${T('S1-t1', 'ΕΝΟΤΗΤΑ 3', 960, 210, 92, YEL, 'middle', 12)}${T('S1-t2', 'Η «ΝΕΑ ΓΕΝΙΑ»', 960, 360, 140, '#fff', 'middle', 16)}`);

// S2 «Η παρακμή των ξενικών κομμάτων» — the three party banners wilt and grey out
shot('S2', cut(2), mid(2, 'ανάδειξη'), `<g id="S2-cam">${skyW(-400, W + 800, 860, '#c9d3d6', '#eef0ea', '#b9ab88')}${clouds('S2', [[300, 160, .9], [1550, 130, 1]])}
  ${[ENC, FRC, RUC].map((c, i) => G(`S2-f${i}`, `${flagP(c, 170, 110, 380)}<g id="S2-g${i}" opacity="0">${flagP('#9a958b', 170, 110, 380)}</g>`, 520 + i * 440, 870, 1)).join('')}
  ${[0, 1, 2].map(i => G(`S2-o${i}`, old(`s2o${i}`), 400 + i * 440, 880, .85)).join('')}</g>${vign}
  ${T('S2-l0', 'ΞΕΝΙΚΑ ΚΟΜΜΑΤΑ', 960, 160, 96, '#fff', 'middle', 14)}${T('S2-l', 'ΠΑΡΑΚΜΗ', 960, 290, 110, RED, 'middle', 15)}`);

// S3 «ανάδειξη μιας νέας γενιάς … διαφορετική νοοτροπία και καταβολές» — sunrise: the young rise, bulbs, roots
shot('S3', mid(2, 'ανάδειξη'), cut(3), `<g id="S3-cam">${skyW(-400, W + 800, 820, '#ffd9a0', '#fff4dc', '#b7a06e')}
  ${G('S3-sun', `<circle r="170" fill="#FFD54A" ${st(7)}/>${Array.from({ length: 12 }, (_, i) => `<path d="M 0 -200 L 0 -250" transform="rotate(${i * 30})" stroke="#f2a93b" stroke-width="14" stroke-linecap="round"/>`).join('')}`, 960, 760, 1)}
  <rect x="-400" y="820" width="${W + 800}" height="${H}" fill="#b7a06e" ${st(5)}/>
  ${[0, 1, 2, 3].map(i => { const x = 480 + i * 320; return `<path id="S3-r${i}" d="M ${x - 10} 840 q -30 20 -20 45 q 10 25 -40 40" stroke="#6b4a2b" stroke-width="12" stroke-linecap="round" fill="none" pathLength="1000" stroke-dasharray="1000 1000" stroke-dashoffset="1000"/><path id="S3-rb${i}" d="M ${x + 10} 840 q 30 15 25 40 q -5 20 45 35" stroke="#6b4a2b" stroke-width="9" stroke-linecap="round" fill="none" pathLength="1000" stroke-dasharray="1000 1000" stroke-dashoffset="1000"/>`; }).join('')}
  ${[0, 1, 2, 3].map(i => G(`S3-y${i}`, young(`s3y${i}`, i, { arms: i % 2 ? 'up' : undefined }), 480 + i * 320, 840, 1)).join('')}
  ${[0, 1, 2, 3].map(i => G(`S3-b${i}`, P.bulb(), 480 + i * 320, 420, .6)).join('')}</g>${vign}
  ${T('S3-l', 'ΝΕΑ ΓΕΝΙΑ', 960, 170, 130, '#fff', 'middle', 16)}${T('S3-l2', 'ΝΟΟΤΡΟΠΙΑ', 620, 300, 74, YEL, 'middle', 12)}${T('S3-l3', 'ΚΑΤΑΒΟΛΕΣ', 1300, 300, 74, YEL, 'middle', 12)}`);

// S4 «Οι ηγετικές προσωπικότητες … είχαν βιώσει την Επανάσταση» — three old leaders; a memory cloud of 1821
shot('S4', cut(3), cut(4), `<g id="S4-cam">${room('#d8c39a', 880)}
  ${G('S4-pod', `<rect x="-640" y="-50" width="1280" height="50" rx="10" fill="#8a5a32" ${st(6)}/>`, 960, 880, 1)}
  ${[0, 1, 2].map(i => G(`S4-o${i}`, old(`s4o${i}`), 560 + i * 400, 830, 1.05)).join('')}
  ${[0, 1, 2].map(i => G(`S4-st${i}`, `<path d="M 0 -26 L 8 -8 L 28 -8 L 12 4 L 18 24 L 0 12 L -18 24 L -12 4 L -28 -8 L -8 -8 Z" fill="${YEL}" ${st(4)}/>`, 600 + i * 400, 700, 1.3)).join('')}
  ${G('S4-cl', `${thought(560, 280)}${G('S4-cf', grFlag(110, 74, 170), -120, 80, 1)}${G('S4-sw', swords, 120, 0, .9)}`, 960, 330, 1)}</g>${vign}
  ${T('S4-l', 'ΗΓΕΤΙΚΕΣ ΠΡΟΣΩΠΙΚΟΤΗΤΕΣ', 960, 150, 88, '#fff', 'middle', 13)}${T('S4-l2', 'ΒΙΩΣΑΝ ΤΗΝ ΕΠΑΝΑΣΤΑΣΗ', 960, 150, 88, YEL, 'middle', 13)}`);

// S5 «τα ιδανικά τους, οι απόψεις τους είχαν διαμορφωθεί στην προεπαναστατική περίοδο» — a mould sets the ideas in sepia
shot('S5', cut(4), cut(6), `<g id="S5-cam">${wide('#cdb88e')}
  ${G('S5-o', old('s5o'), 470, 1030, 2.2)}
  ${G('S5-c0', `${card('ΙΔΑΝΙΚΑ', '#fff', 62)}<g id="S5-s0" opacity="0">${card('ΙΔΑΝΙΚΑ', '#c9a46a', 62)}</g>`, 1300, 330, 1)}
  ${G('S5-c1', `${card('ΑΠΟΨΕΙΣ', '#fff', 62)}<g id="S5-s1" opacity="0">${card('ΑΠΟΨΕΙΣ', '#c9a46a', 62)}</g>`, 1300, 520, 1)}
  ${G('S5-m', `<rect x="-260" y="-150" width="520" height="140" rx="14" fill="#6b5442" ${st(7)}/><rect x="-30" y="-420" width="60" height="280" fill="#7a6250" ${st(6)}/><rect x="-120" y="-460" width="240" height="50" rx="12" fill="#5b4636" ${st(6)}/>`, 1300, 300, 1)}</g>${vign}
  ${G('S5-st', P.stamp('ΠΡΟΕΠΑΝΑΣΤΑΤΙΚΗ ΠΕΡΙΟΔΟΣ', '#B8323A', 760, 56), 1300, 760, 1)}`);

// S6 «Για την αμέσως επόμενη γενιά, η Επανάσταση ανήκε στην ιστορία» — the 1821 scene shrinks into a history book
shot('S6', cut(6), cut(8), `<g id="S6-cam">${room('#dfe8d8', 880)}
  ${G('S6-y', young('s6y', 0), 470, 880, 1.25)}
  ${G('S6-sc', `<rect x="-260" y="-190" width="520" height="380" rx="10" fill="#f0d9a8" ${st(7)}/><rect x="-260" y="-190" width="520" height="380" rx="10" fill="${OLD}" opacity=".3"/>${G('S6-sf', grFlag(110, 74, 230), -140, 160, 1)}${G('S6-sw', swords, 110, 30, .9)}`, 1320, 420, 1)}
  ${G('S6-bo', P.book('#3e6fb0'), 1320, 850, 1.3)}
  ${G('S6-bc', `<rect x="-170" y="-130" width="340" height="140" rx="12" fill="#2f5a94" ${st(7)}/><rect x="-170" y="-130" width="34" height="140" fill="#24477a" ${st(5)}/>${txt('ΙΣΤΟΡΙΑ', 20, -40, 62, '#fff', 'middle', `stroke="${INK}" stroke-width="8" paint-order="stroke"`)}`, 1320, 840, 1.3)}</g>${vign}
  ${T('S6-l', 'ΕΠΟΜΕΝΗ ΓΕΝΙΑ', 470, 300, 80, '#fff', 'middle', 12)}${T('S6-l2', 'ΑΝΗΚΕ ΣΤΗΝ ΙΣΤΟΡΙΑ', 1320, 150, 84, YEL, 'middle', 13)}`);

// S7 «Η γενιά αυτή βίωνε ραγδαίες αλλαγές» — the young man on a whirling platform
shot('S7', cut(8), mid(8, 'πολιτικών'), `<g id="S7-cam">${skyW(-400, W + 800, 860, '#bfe0ea', '#f2f7f1', '#c9b98d')}${clouds('S7', [[260, 170, .9], [1600, 150, 1]])}
  <g transform="translate(960,850) scale(1,.32)">${G('S7-sp', `<circle r="420" fill="#d9822b" ${st(10)}/>${Array.from({ length: 8 }, (_, i) => `<path d="M 0 0 L 0 -420" transform="rotate(${i * 45})" stroke="#f2c14e" stroke-width="40"/>`).join('')}<circle r="420" fill="none" ${st(10)}/><circle r="60" fill="${INK}"/>`, 0, 0, 1)}</g>
  ${[0, 1, 2, 3, 4].map(i => G(`S7-w${i}`, `<path d="M -120 0 Q 0 -40 120 0" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round"/>`, 960 + (i - 2) * 300, 420 + (i % 2) * 140, 1)).join('')}
  ${G('S7-y', young('s7y', 1, { arms: 'up' }), 960, 840, 1.25)}</g>${vign}
  ${T('S7-l', 'ΡΑΓΔΑΙΕΣ ΑΛΛΑΓΕΣ', 960, 170, 120, '#fff', 'middle', 16)}`);

// S8 «πολιτικών μεταβολών … οικονομικής και τεχνικής ανάπτυξης, που ακολουθούσαν πρωτόγνωρους ρυθμούς» — three gears + gauge
shot('S8', mid(8, 'πολιτικών'), cut(10), `<g id="S8-cam">${wide('#2f3b4a')}
  ${[['ΠΟΛΙΤΙΚΕΣ', 'ΜΕΤΑΒΟΛΕΣ', '#5D8BD0'], ['ΟΙΚΟΝΟΜΙΚΗ', 'ΑΝΑΠΤΥΞΗ', GOLD], ['ΤΕΧΝΙΚΗ', 'ΑΝΑΠΤΥΞΗ', '#9aa1aa']].map(([a, b, c], i) => G(`S8-g${i}`, `${G(`S8-gr${i}`, P.gear(130, c, 10), 0, 0, 1)}${txt(a, 0, 230, 54, '#fff', 'middle', `stroke="${INK}" stroke-width="8" paint-order="stroke"`)}${txt(b, 0, 290, 54, '#fff', 'middle', `stroke="${INK}" stroke-width="8" paint-order="stroke"`)}`, 480 + i * 480, 580, 1)).join('')}
  ${G('S8-ga', `<path d="M -170 0 A 170 170 0 0 1 170 0 Z" fill="#efe4c9" ${st(7)}/><path d="M 120 -120 A 170 170 0 0 1 170 0 L 120 0 Z" fill="${RED}" opacity=".85"/><path d="M -170 0 A 170 170 0 0 1 170 0" fill="none" ${st(7)}/>${G('S8-nd', `<path d="M -10 0 L 0 -150 L 10 0 Z" fill="${INK}"/><circle r="18" fill="${INK}"/>`, 0, 0, 1)}`, 960, 330, 1)}</g>${vign}
  ${T('S8-l', 'ΠΡΩΤΟΓΝΩΡΟΙ ΡΥΘΜΟΙ', 960, 110, 84, YEL, 'middle', 13)}`);

// S9 «Η οικονομική και κοινωνική μεταβολή … εκ θεμελίων μεταβολή της αντίληψης για τη ζωή» — the house's foundations swapped
shot('S9', cut(10), cut(11), `<g id="S9-cam">${skyW(-400, W + 800, 880, '#bfe0ea', '#f2f7f1', '#c9b98d')}
  ${G('S9-fo', `<rect x="-300" y="0" width="600" height="80" fill="#9a958b" ${st(6)}/><path d="M -200 0 L -170 40 L -190 80 M 120 0 L 150 50" fill="none" ${st(5)}/>`, 960, 800, 1)}
  ${G('S9-fn', `<rect x="-300" y="0" width="600" height="80" fill="${NEW}" ${st(6)}/>${txt('ΝΕΑ ΘΕΜΕΛΙΑ', 0, 56, 46, '#fff', 'middle', `stroke="${INK}" stroke-width="6" paint-order="stroke"`)}`, 960, 800, 1)}
  ${G('S9-h', `${P.building('')}${txt('ΑΝΤΙΛΗΨΗ', 0, -218, 40, INK)}`, 960, 800, 1.35)}
  ${G('S9-r0', `${card('ΟΙΚΟΝΟΜΙΚΗ', '#fff', 44)}<path d="M 170 0 L 260 0" ${st(14)}/><path d="M 250 -26 L 290 0 L 250 26 Z" fill="${INK}"/>`, 330, 560, 1)}
  ${G('S9-r1', `${card('ΚΟΙΝΩΝΙΚΗ', '#fff', 44)}<path d="M -160 0 L -250 0" ${st(14)}/><path d="M -240 -26 L -280 0 L -240 26 Z" fill="${INK}"/>`, 1600, 560, 1)}</g>${vign}
  ${T('S9-l', 'ΕΚ ΘΕΜΕΛΙΩΝ ΜΕΤΑΒΟΛΗ', 960, 150, 96, YEL, 'middle', 14)}${T('S9-l2', 'ΤΗΣ ΑΝΤΙΛΗΨΗΣ ΓΙΑ ΤΗ ΖΩΗ', 960, 250, 66, '#fff', 'middle', 11)}`);

// S10 «Οι άνθρωποι σταμάτησαν να ζουν όπως οι πρόγονοί τους» — sepia ancestors frown; the young walk the other way
shot('S10', cut(11), cut(12), `<g id="S10-cam">${room('#cfbf9c', 900)}
  ${[0, 1, 2].map(i => G(`S10-p${i}`, portrait(G(`s10a${i}-w`, old(`s10a${i}`), 0, 190, .78), '#cfbf9c'), 560 + i * 400, 360, .85)).join('')}
  ${[0, 1].map(i => G(`S10-y${i}`, young(`s10y${i}`, i + 1), 780 + i * 220, 900, 1)).join('')}</g>${vign}
  ${T('S10-l', 'ΟΠΩΣ ΟΙ ΠΡΟΓΟΝΟΙ', 960, 130, 96, '#fff', 'middle', 14)}${line('S10-x', 600, 100, 1320, 112, RED, 16)}`);

// S11 «Αυξήθηκε ο αστικός πληθυσμός» — the town grows; villagers walk to it
const tower = (w, h, c) => `<g><rect x="${-w / 2}" y="${-h}" width="${w}" height="${h}" fill="${c}" ${st(6)}/>${Array.from({ length: Math.floor(h / 70) }, (_, r) => [-1, 1].map(k => `<rect x="${k * w / 4 - 14}" y="${-h + 30 + r * 70}" width="28" height="36" fill="#fff6d6" ${st(3)}/>`).join('')).join('')}<path d="M ${-w / 2 - 10} ${-h} L 0 ${-h - 50} L ${w / 2 + 10} ${-h} Z" fill="#b0563a" ${st(5)}/></g>`;
shot('S11', cut(12), mid(13, 'κέντρα'), `<g id="S11-cam">${skyW(-400, W + 800, 860, '#bfe0ea', '#f2f7f1', '#c9b98d')}${clouds('S11', [[300, 150, .8], [1300, 120, .9]])}
  ${[0, 1].map(i => G(`S11-v${i}`, P.house('#efe4c9', '#b0563a'), 120 + i * 200, 860, .6)).join('')}
  ${[[1100, 160, 320, '#e9dcc0'], [1290, 180, 460, '#dccfb2'], [1490, 150, 380, '#efe4c9'], [1680, 170, 520, '#e2d3b4'], [1860, 150, 300, '#efe4c9']].map(([x, w, h, c], i) => G(`S11-t${i}`, tower(w, h, c), x, 860, 1)).join('')}
  ${[0, 1, 2].map(i => G(`S11-p${i}`, vil(`s11p${i}`), 300 + i * 150, 880, .85)).join('')}
  ${G('S11-ar', arrowUp(GRN, 1.3), 640, 400, 1)}</g>${vign}
  ${T('S11-l', 'ΑΣΤΙΚΟΣ ΠΛΗΘΥΣΜΟΣ', 960, 160, 104, '#fff', 'middle', 15)}`);

// S12 «πιο κοντά στα κέντρα λήψης αποφάσεων … δυνατότητα ενημέρωσης» — townsfolk by the seat of power; newspapers fly in
shot('S12', mid(13, 'κέντρα'), cut(14), `<g id="S12-cam">${skyW(-400, W + 800, 880, '#bfe0ea', '#f2f7f1', '#c9b98d')}
  ${G('S12-b', P.building(''), 600, 880, 1.2)}
  ${[0, 1, 2].map(i => G(`S12-c${i}`, cit(`s12c${i}`, i), 1180 + i * 230, 890, 1)).join('')}
  ${[0, 1, 2].map(i => G(`S12-n${i}`, P.newspaper('ΕΦΗΜΕΡΙΣ'), 1220 + i * 230, 700, .32)).join('')}</g>${vign}
  ${T('S12-l', 'ΚΕΝΤΡΑ ΛΗΨΗΣ ΑΠΟΦΑΣΕΩΝ', 600, 150, 76, '#fff', 'middle', 12)}${T('S12-l2', 'ΕΝΗΜΕΡΩΣΗ', 1410, 330, 86, YEL, 'middle', 13)}`);

// S13 «η μείωση των αναλφάβητων στον ανδρικό πληθυσμό» — thumb-print ✕ turn into signatures
shot('S13', cut(14), cut(15), `<g id="S13-cam">${room('#e2d6b8', 900)}
  ${[0, 1, 2, 3, 4].map(i => G(`S13-m${i}`, cit(`s13m${i}`, i), 420 + i * 270, 900, .95)).join('')}
  ${[0, 1, 2, 3, 4].map(i => G(`S13-k${i}`, `${paper(170, 120, '#f6f1e4')}<g id="S13-x${i}">${xMark('#7a5a3a', 30, 12)}</g><path id="S13-sg${i}" d="M -60 10 q 15 -30 30 0 q 15 30 30 -10 q 14 -20 30 4 q 10 10 20 -6" fill="none" stroke="#2b4a8b" stroke-width="7" stroke-linecap="round" pathLength="1000" stroke-dasharray="1000 1000" stroke-dashoffset="1000"/>`, 420 + i * 270, 430, 1)).join('')}</g>${vign}
  ${T('S13-l', 'ΜΕΙΩΣΗ ΑΝΑΛΦΑΒΗΤΩΝ', 900, 150, 96, '#fff', 'middle', 14)}${G('S13-ar', arrowDn(RED, .8), 1530, 140, 1)}${T('S13-l2', 'ΑΝΔΡΙΚΟΣ ΠΛΗΘΥΣΜΟΣ', 960, 265, 60, YEL, 'middle', 10)}`);

// S14 «η σχετικά γρήγορη διάδοση της παιδείας αύξησε τις κοινωνικές εντάσεις» — books fly from a school; sparks between groups
shot('S14', cut(15), cut(16), `<g id="S14-cam">${skyW(-400, W + 800, 880, '#bfe0ea', '#f2f7f1', '#c9b98d')}
  ${G('S14-sch', `${P.building('')}${txt('ΣΧΟΛΕΙΟ', 0, -218, 44, INK)}`, 330, 880, 1.25)}
  ${[0, 1, 2, 3].map(i => G(`S14-bk${i}`, P.book(['#3e6fb0', '#b0563a', NEW, GOLD][i]), 330, 560, .32)).join('')}
  ${[0, 1].map(i => G(`S14-c${i}`, cit(`s14c${i}`, i), 880 + i * 170, 890, .95)).join('')}
  ${[0, 1].map(i => G(`S14-u${i}`, vil(`s14u${i}`), 1520 + i * 170, 890, .95)).join('')}
  ${[0, 1, 2].map(i => G(`S14-z${i}`, bolt(YEL), 1290, 560 + (i - 1) * 110, .7 + i * .1)).join('')}</g>${vign}
  ${T('S14-l', 'ΔΙΑΔΟΣΗ ΤΗΣ ΠΑΙΔΕΙΑΣ', 760, 150, 84, '#fff', 'middle', 13)}${T('S14-l2', 'ΚΟΙΝΩΝΙΚΕΣ ΕΝΤΑΣΕΙΣ', 1290, 300, 80, RED, 'middle', 13)}`);

// S15 «Οι απαιτήσεις των ανθρώπων αυξήθηκαν» — scrolls unroll longer and longer
shot('S15', cut(16), cut(17), `<g id="S15-cam">${room('#d9e2e6', 900)}
  ${[0, 1, 2].map(i => G(`S15-c${i}`, cit(`s15c${i}`, i + 2, { arms: 'up' }), 600 + i * 360, 900, 1.05)).join('')}
  ${[0, 1, 2].map(i => G(`S15-sc${i}`, `<rect x="-60" y="0" width="120" height="300" fill="#f6f1e4" ${st(5)}/>${[0, 1, 2, 3, 4, 5].map(k => `<path d="M -40 ${30 + k * 44} H 40" stroke="#b9a57c" stroke-width="8" stroke-linecap="round"/>`).join('')}<rect x="-74" y="-16" width="148" height="28" rx="14" fill="#d9c7a0" ${st(5)}/>`, 600 + i * 360 + 120, 250, 1)).join('')}</g>${vign}
  ${T('S15-l', 'ΑΠΑΙΤΗΣΕΙΣ', 900, 170, 120, '#fff', 'middle', 16)}${G('S15-ar', arrowUp(GRN, .8), 1330, 140, 1)}`);

// S16 «ακόμη και οι ημιμαθείς άρχισαν να επικρίνουν τις δυσλειτουργίες του κράτους» — a jammed, smoking state machine
shot('S16', cut(17), mid(17, 'και την καθυστέρηση'), `<g id="S16-cam">${room('#d6d0c4', 900)}
  ${G('S16-s', semi('s16s'), 470, 900, 1.25)}
  ${G('S16-mc', `<rect x="-300" y="-380" width="600" height="380" rx="20" fill="#8a949c" ${st(8)}/><rect x="-220" y="-450" width="440" height="80" rx="12" fill="#efe4c9" ${st(6)}/>${txt('ΚΡΑΤΟΣ', 0, -394, 58, INK)}${G('S16-g0', P.gear(90, '#c9a46a', 9), -110, -200, 1)}${G('S16-g1', P.gear(70, '#d9822b', 8), 90, -150, 1)}`, 1320, 900, 1)}
  ${[0, 1, 2].map(i => G(`S16-sm${i}`, `<circle r="${40 + i * 10}" fill="#9a958b" ${st(5)}/>`, 1320 + (i - 1) * 90, 380 - i * 40, 1)).join('')}</g>${vign}
  ${T('S16-l0', 'ΗΜΙΜΑΘΕΙΣ', 470, 330, 76, YEL, 'middle', 12)}${T('S16-l', 'ΔΥΣΛΕΙΤΟΥΡΓΙΕΣ ΤΟΥ ΚΡΑΤΟΥΣ', 1100, 150, 84, RED, 'middle', 13)}`);

// S17 «την καθυστέρηση σε σχέση με τις χώρες της Δύσης» — a Greek cart far behind a train
const wheel = r => `<g><circle r="${r}" fill="#7a5232" ${st(6)}/>${[0, 60, 120].map(a => `<path d="M ${-r} 0 L ${r} 0" transform="rotate(${a})" ${st(5)}/>`).join('')}</g>`;
shot('S17', mid(17, 'και την καθυστέρηση'), cut(18), `<g id="S17-cam">${skyW(-400, 3200, 820, '#bfe0ea', '#f2f7f1', '#c9b98d')}
  ${Array.from({ length: 30 }, (_, i) => `<rect x="${-400 + i * 110}" y="732" width="24" height="30" fill="#5a3d24"/>`).join('')}<rect x="-400" y="738" width="3200" height="14" fill="#7a5232" ${st(4)}/>
  <rect x="-400" y="830" width="3200" height="70" fill="#b39a6e" ${st(4)}/>
  ${G('S17-cart', `<rect x="-140" y="-120" width="280" height="80" rx="10" fill="#b08a5a" ${st(6)}/>${G('S17-wa', wheel(42), -80, -30, 1)}${G('S17-wb', wheel(42), 80, -30, 1)}<g transform="translate(-100,-120)">${grFlag(90, 60, 160)}</g>`, 420, 880, 1)}
  ${G('S17-tr', `${[0, 1, 2].map(k => `<rect x="${-560 + k * 300}" y="-180" width="270" height="150" rx="12" fill="${['#5D8BD0', '#4a6fb0', '#3a5a94'][k]}" ${st(6)}/>${[-500, -380].map(x => `<circle cx="${x + k * 300}" cy="-24" r="34" fill="#333" ${st(5)}/>`).join('')}`).join('')}<rect x="340" y="-260" width="240" height="230" rx="16" fill="#2f3b4a" ${st(6)}/><rect x="460" y="-340" width="56" height="90" fill="#2f3b4a" ${st(5)}/><circle cx="400" cy="-24" r="40" fill="#333" ${st(5)}/><circle cx="520" cy="-24" r="40" fill="#333" ${st(5)}/>${txt('ΔΥΣΗ', -260, -84, 70, '#fff', 'middle', `stroke="${INK}" stroke-width="8" paint-order="stroke"`)}`, 1500, 740, .8)}
  ${[0, 1, 2].map(i => G(`S17-sm${i}`, `<circle r="${36 + i * 12}" fill="#e9e9e9" ${st(4)}/>`, 1900 - i * 70, 440 - i * 50, 1)).join('')}</g>${vign}
  ${T('S17-l', 'ΚΑΘΥΣΤΕΡΗΣΗ', 520, 300, 96, RED, 'middle', 14)}${T('S17-l2', 'ΧΩΡΕΣ ΤΗΣ ΔΥΣΗΣ', 1350, 160, 92, '#fff', 'middle', 14)}`);

// S18 «ενώ εντάθηκε η επιθυμία για συμμετοχή στα πολιτικά πράγματα» — the young crowd at the door of politics
const hallFront = (label, door = true) => `<g><rect x="-460" y="-480" width="920" height="480" fill="#e9dcc0" ${st(7)}/><path d="M -500 -480 L 0 -620 L 500 -480 Z" fill="#efe4c9" ${st(7)}/>${[-360, -200, 200, 360].map(x => `<rect x="${x - 30}" y="-440" width="60" height="440" fill="#f6eedc" ${st(5)}/>`).join('')}${door ? `<rect x="-110" y="-300" width="220" height="300" rx="10" fill="#6b4a2b" ${st(6)}/>` : ''}<rect x="-300" y="-560" width="600" height="60" fill="#fff8e6" ${st(5)}/>${txt(label, 0, -515, 44, INK)}</g>`;
shot('S18', cut(18), cut(19), `<g id="S18-cam">${skyW(-400, W + 800, 900, '#bfe0ea', '#f2f7f1', '#c9b98d')}
  ${G('S18-h', hallFront('ΠΟΛΙΤΙΚΑ ΠΡΑΓΜΑΤΑ'), 960, 900, 1)}
  ${[0, 1, 2, 3, 4].map(i => G(`S18-y${i}`, young(`s18y${i}`, i, { arms: 'up' }), 560 + i * 200, 960, .95)).join('')}</g>${vign}
  ${T('S18-l', 'ΣΥΜΜΕΤΟΧΗ', 960, 150, 120, YEL, 'middle', 16)}`);

// S19 «δεν είχε τις εμπειρίες της προηγούμενης (τουρκοκρατία, επανάσταση, αντιβασιλεία,» — the old leader's sack fills
shot('S19', cut(19), cut(22), `<g id="S19-cam">${room('#dcc9a4', 900)}
  ${G('S19-os', `<rect x="-80" y="-260" width="160" height="200" rx="30" fill="#8a5a32" ${st(6)}/><path d="M -80 -230 Q 0 -280 80 -230 L 80 -190 Q 0 -230 -80 -190 Z" fill="#6b4224" ${st(5)}/>`, 470, 900, 1.1)}${G('S19-o', old('s19o'), 560, 900, 1.1)}
  ${G('S19-ys', `<rect x="-70" y="-230" width="140" height="110" rx="26" fill="#cfc7b2" ${st(6)}/><path d="M -50 -200 H 50" stroke="#a89f88" stroke-width="6"/>`, 1470, 900, 1.1)}${G('S19-y', young('s19y', 0), 1380, 900, 1.1)}
  ${[['ΤΟΥΡΚΟΚΡΑΤΙΑ', '#e6c79a'], ['ΕΠΑΝΑΣΤΑΣΗ', '#f2d27a'], ['ΑΝΤΙΒΑΣΙΛΕΙΑ', '#d9b8a0']].map(([s, c], i) => G(`S19-c${i}`, card(s, c, 50), 560, 200 + i * 120, 1)).join('')}
  ${G('S19-e', `<path d="M -60 0 Q 0 -40 60 0" fill="none" ${st(6)}/>${txt('?', 0, -50, 90, INK)}`, 1560, 640, 1)}</g>${vign}
  ${T('S19-l', 'ΟΧΙ ΤΙΣ ΙΔΙΕΣ ΕΜΠΕΙΡΙΕΣ', 1380, 300, 64, '#fff', 'middle', 11)}`);

// S20 «βοήθεια των Δυνάμεων σε κρίσιμες στιγμές)» — three sailing ships (Britain, France, Russia); the 4th card
const sship = fl => `${P.sailship('#7a5232')}<g transform="translate(98,-478)">${P.flag(fl, 96, 60)}</g>`;
shot('S20', cut(22), mid(22, 'και αποστασιοποιήθηκε'), `<g id="S20-cam">${skyW(-400, W + 800, 720, '#bfe0ea', '#f2f7f1', '#79AFC4')}
  ${[['uk', 460], ['fr', 960], ['ru', 1460]].map(([f, x], i) => G(`S20-s${i}`, sship(f), x, 860, .62)).join('')}
  <rect x="-400" y="860" width="${W + 800}" height="400" fill="#5f97ad" ${st(5)}/>
  ${G('S20-c', card('ΒΟΗΘΕΙΑ ΤΩΝ ΔΥΝΑΜΕΩΝ', '#cfe0ea', 58), 960, 150, 1)}</g>${vign}
  ${T('S20-l', 'ΣΕ ΚΡΙΣΙΜΕΣ ΣΤΙΓΜΕΣ', 960, 290, 70, YEL, 'middle', 12)}`);

// S21 «αποστασιοποιήθηκε από τις αντιπαραθέσεις … και από τα κόμματα» — old leaders argue; the young man steps back
shot('S21', mid(22, 'και αποστασιοποιήθηκε'), cut(23), `<g id="S21-cam">${skyW(-400, W + 800, 880, '#c9d3d6', '#eef0ea', '#b9ab88')}
  ${[ENC, FRC, RUC].map((c, i) => G(`S21-f${i}`, flagP(c, 110, 70, 300), 360 + i * 300, 880, 1)).join('')}
  ${G('S21-o0', old('s21o0'), 560, 890, 1.05)}${G('S21-o1', old('s21o1'), 900, 890, 1.05, 'data-flip="1"')}
  ${G('S21-z', bolt(YEL), 730, 520, .9)}
  ${G('S21-y', young('s21y', 2), 1560, 890, 1.1)}
  ${G('S21-ar', `<path d="M -110 0 L 110 0" ${st(16)}/><path d="M 100 -36 L 150 0 L 100 36 Z" fill="${INK}"/>`, 1560, 420, 1)}</g>${vign}
  ${T('S21-l', 'ΑΝΤΙΠΑΡΑΘΕΣΕΙΣ', 730, 150, 92, RED, 'middle', 14)}${T('S21-l2', 'ΑΠΟΣΤΑΣΙΟΠΟΙΗΘΗΚΕ', 1450, 300, 66, '#fff', 'middle', 11)}`);

// S22 «Η νέα γενιά ασκούσε έντονη κριτική στους παλαιότερους» — the young man points; the old leaders shrink
shot('S22', cut(23), mid(23, 'και φρονούσε'), `<g id="S22-cam">${skyW(-400, W + 800, 900, '#e8c9a0', '#f6ead6', '#b9a37a')}
  ${[0, 1, 2].map(i => G(`S22-o${i}`, old(`s22o${i}`), 440 + i * 230, 900, 1)).join('')}
  ${G('S22-y', young('s22y', 3), 1460, 900, 1.2)}
  ${G('S22-ar', `<path d="M 120 0 L -120 0" ${st(16)}/><path d="M -110 -36 L -160 0 L -110 36 Z" fill="${INK}"/>`, 1150, 560, 1)}</g>${vign}
  ${T('S22-l', 'ΕΝΤΟΝΗ ΚΡΙΤΙΚΗ', 1150, 150, 110, RED, 'middle', 15)}${T('S22-l2', 'ΣΤΟΥΣ ΠΑΛΑΙΟΤΕΡΟΥΣ', 600, 300, 68, '#fff', 'middle', 11)}`);

// S23 «το συνταγματικό πολίτευμα δεν μπορούσε να αναπτυχθεί» — a sapling under a heavy lid
// S24 continues the same set: the courtiers and the king sit on the lid
const lidSet = p => `${skyW(-400, W + 800, 880, '#bfe0ea', '#f2f7f1', '#c9b98d')}
  ${G(`${p}-tr`, P.tree(`${p}-tre`, NEW), 960, 880, .66)}
  ${G(`${p}-lid`, `<rect x="-420" y="-50" width="840" height="90" rx="14" fill="#8f8a80" ${st(8)}/><path d="M -300 -50 L -280 40 M 180 -50 L 210 40" ${st(4)}/>`, 960, 500, 1)}
  ${[-1, 1].map(k => `<rect x="${960 + k * 380 - 22}" y="540" width="44" height="340" fill="#7a7468" ${st(6)}/>`).join('')}`;
shot('S23', mid(23, 'και φρονούσε'), cut(24), `<g id="S23-cam">${lidSet('S23')}</g>${vign}
  ${T('S23-l', 'ΣΥΝΤΑΓΜΑΤΙΚΟ ΠΟΛΙΤΕΥΜΑ', 960, 150, 90, '#fff', 'middle', 14)}${T('S23-l2', 'ΔΕΝ ΜΠΟΡΟΥΣΕ ΝΑ ΑΝΑΠΤΥΧΘΕΙ', 960, 260, 66, RED, 'middle', 11)}`);
shot('S24', cut(24), cut(25), `<g id="S24-cam">${lidSet('S24')}
  ${[0, 1, 2].map(i => G(`S24-c${i}`, courtier(`s24c${i}`), [640, 820, 1280][i], 452, .8)).join('')}
  ${G('S24-ot', P.otto('s24ot'), 1060, 452, .9)}</g>${vign}
  ${T('S24-l', 'Η ΑΥΛΗ', 330, 430, 92, '#fff', 'middle', 14)}${G('S24-n', tag('ΟΘΩΝ', YEL, 52), 1060, 110, 1)}${T('S24-l2', 'ΚΑΙ Ο ΒΑΣΙΛΙΑΣ', 1600, 420, 66, '#fff', 'middle', 11)}`);

// S25 «τον οποίο θεωρούσε πολιτικά ατάλαντο» — Όθων fumbles three balls
shot('S25', cut(25), cut(26), `<g id="S25-cam">${room('#cfd8e6', 900)}
  ${G('S25-ot', P.otto('s25ot', { arms: 'up' }), 860, 900, 1.3)}
  ${[0, 1, 2].map(i => G(`S25-b${i}`, `<circle r="40" fill="${['#5D8BD0', GOLD, '#B8323A'][i]}" ${st(6)}/>`, 860, 300, 1)).join('')}</g>${vign}
  ${G('S25-st', P.stamp('ΠΟΛΙΤΙΚΑ ΑΤΑΛΑΝΤΟΣ', '#B8323A', 640, 60), 1420, 320, 1)}`);

// S26 «Περί τα τέλη της δεκαετίας του 1850» — calendar pages flip
const calPage = (head, big) => `<g><rect x="-330" y="-260" width="660" height="520" rx="16" fill="#fbf6e8" ${st(8)}/><rect x="-330" y="-260" width="660" height="110" rx="16" fill="#B8323A" ${st(8)}/>${head ? txt(head, 0, -186, 62, '#fff') : ''}${big ? txt(big, 0, 90, 190, INK) : `${[0, 1, 2, 3].map(r => [0, 1, 2, 3, 4, 5].map(c => `<rect x="${-280 + c * 94}" y="${-110 + r * 88}" width="78" height="70" rx="6" fill="none" stroke="#c9bfa8" stroke-width="4"/>`).join('')).join('')}`}<circle cx="-200" cy="-262" r="16" fill="${INK}"/><circle cx="200" cy="-262" r="16" fill="${INK}"/></g>`;
shot('S26', cut(26), mid(26, 'έγινε'), `<g id="S26-cam">${wide('#2f3b4a')}
  ${G('S26-pf', calPage('ΤΕΛΗ ΔΕΚΑΕΤΙΑΣ', '1850'), 960, 560, 1)}
  ${[0, 1, 2].map(i => G(`S26-p${i}`, calPage('', ''), 960, 560, 1)).join('')}</g>${vign}`);

// S27 «φανερή μια συνολική δυσαρέσκεια μεγάλων τμημάτων του πληθυσμού» — a big frowning crowd under a storm cloud
shot('S27', mid(26, 'έγινε'), mid(26, 'λόγω'), `<g id="S27-cam">${skyW(-400, W + 800, 880, '#8f9aa6', '#cfd3d4', '#a89a78')}
  ${G('S27-cl', P.cloudStorm(), 960, 420, 1.6)}
  ${[0, 1, 2, 3, 4, 5, 6].map(i => G(`S27-p${i}`, i % 3 === 2 ? vil(`s27p${i}`) : cit(`s27p${i}`, i), 300 + i * 220, 900 + (i % 2) * 40, .9)).join('')}</g>${vign}
  ${T('S27-l', 'ΣΥΝΟΛΙΚΗ ΔΥΣΑΡΕΣΚΕΙΑ', 960, 150, 100, '#fff', 'middle', 15)}`);

// S28 «λόγω της οικονομικής δυσπραγίας και της δυσλειτουργίας του πολιτικού συστήματος» — empty purse + broken machine
shot('S28', mid(26, 'λόγω'), mid(26, 'και συγκροτήθηκαν'), `<g id="S28-cam">${wide('#d6cdb8')}
  ${G('S28-bag', P.moneyBag('', '#c9a46a'), 500, 720, 1.5)}
  ${G('S28-mo', `<ellipse rx="22" ry="12" fill="#8a7a6a" ${st(4)}/><path d="M -4 -4 Q -40 -40 -50 0 Q -30 10 -4 4 M 4 -4 Q 40 -40 50 0 Q 30 10 4 4" fill="#b9ab98" ${st(4)}/>`, 500, 440, 2.2)}
  ${G('S28-mc', `<rect x="-260" y="-320" width="520" height="320" rx="20" fill="#8a949c" ${st(8)}/>${G('S28-g0', P.gear(80, '#c9a46a', 9), -100, -160, 1)}${G('S28-g1', P.gear(60, '#d9822b', 8), 80, -110, 1)}<path d="M -60 -320 L -20 -240 L -70 -170 L -30 -90" fill="none" stroke="${INK}" stroke-width="8"/>`, 1400, 880, 1)}
  ${[0, 1].map(i => G(`S28-sm${i}`, `<circle r="${44 + i * 14}" fill="#9a958b" ${st(5)}/>`, 1400 + (i ? 80 : -60), 480 - i * 50, 1)).join('')}</g>${vign}
  ${T('S28-l', 'ΟΙΚΟΝΟΜΙΚΗ ΔΥΣΠΡΑΓΙΑ', 500, 170, 72, RED, 'middle', 12)}${T('S28-l2', 'ΔΥΣΛΕΙΤΟΥΡΓΙΑ ΤΟΥ', 1400, 150, 64, RED, 'middle', 11)}${T('S28-l3', 'ΠΟΛΙΤΙΚΟΥ ΣΥΣΤΗΜΑΤΟΣ', 1400, 225, 64, RED, 'middle', 11)}`);

// S29 «συγκροτήθηκαν αντιπολιτευτικοί όμιλοι με εκσυγχρονιστικά … αιτήματα:» — groups gather round tables; a demands board
shot('S29', mid(26, 'και συγκροτήθηκαν'), cut(27), `<g id="S29-cam">${room('#e2d6b8', 900)}
  ${[0, 1].map(k => `${G(`S29-t${k}`, table(''), 520 + k * 520, 900, 1)}${[0, 1].map(j => G(`S29-y${k}${j}`, young(`s29y${k}${j}`, k * 2 + j), 520 + k * 520 + (j ? 150 : -150), 900, .9)).join('')}`).join('')}
  ${G('S29-bd', `${paper(420, 520, '#fbf6e8')}${txt('ΑΙΤΗΜΑΤΑ:', 0, -180, 64, INK)}${[0, 1, 2, 3, 4].map(r => `<path d="M -150 ${-90 + r * 70} H 150" stroke="#c9bfa8" stroke-width="10" stroke-linecap="round"/>`).join('')}`, 1600, 560, 1)}</g>${vign}
  ${T('S29-l', 'ΑΝΤΙΠΟΛΙΤΕΥΤΙΚΟΙ ΟΜΙΛΟΙ', 700, 150, 84, '#fff', 'middle', 13)}${T('S29-l2', 'ΕΚΣΥΓΧΡΟΝΙΣΤΙΚΑ', 700, 260, 62, YEL, 'middle', 10)}`);

// S30 «ελεύθερες εκλογές, φορολογική μεταρρύθμιση με στόχο την ελάφρυνση των αγροτών,»
shot('S30', cut(27), cut(29), `<g id="S30-cam">${skyW(-400, W + 800, 880, '#bfe0ea', '#f2f7f1', '#c9b98d')}
  ${G('S30-bx', P.ballotBox(), 500, 880, 1.4)}${G('S30-bal', `<rect x="-60" y="-40" width="120" height="80" fill="#fff" ${st(5)}/>${tick(GRN, 26)}`, 500, 400, 1)}
  ${G('S30-f', vil('s30f'), 1260, 880, 1.15)}
  ${G('S30-sk', sack(1.5, '#a8823c'), 1480, 880, 1)}</g>${vign}
  ${T('S30-l', 'ΕΛΕΥΘΕΡΕΣ ΕΚΛΟΓΕΣ', 500, 160, 80, '#fff', 'middle', 13)}${T('S30-l2', 'ΦΟΡΟΛΟΓΙΚΗ ΜΕΤΑΡΡΥΘΜΙΣΗ', 1360, 160, 72, '#fff', 'middle', 12)}${T('S30-l3', 'ΕΛΑΦΡΥΝΣΗ ΤΩΝ ΑΓΡΟΤΩΝ', 1360, 260, 60, YEL, 'middle', 10)}`);

// S31 «κρατικές επενδύσεις σε έργα υποδομής, ίδρυση αγροτικών τραπεζών, απλούστερη διοίκηση.» — the camera walks three panels
shot('S31', cut(29), cut(32), `<g id="S31-cam">${skyW(-400, 4600, 880, '#bfe0ea', '#f2f7f1', '#c9b98d')}
  <rect x="360" y="880" width="480" height="200" fill="#79AFC4" ${st(5)}/>${G('S31-br', P.bridge(), 600, 880, 1.1)}
  ${txt('ΚΡΑΤΙΚΕΣ ΕΠΕΝΔΥΣΕΙΣ', 600, 170, 70, '#fff', 'middle', `stroke="${INK}" stroke-width="11" paint-order="stroke"`)}${txt('ΣΕ ΕΡΓΑ ΥΠΟΔΟΜΗΣ', 600, 250, 62, YEL, 'middle', `stroke="${INK}" stroke-width="10" paint-order="stroke"`)}
  ${G('S31-bk', `${P.building('')}${txt('ΤΡΑΠΕΖΑ', 0, -218, 46, INK)}`, 1500, 880, 1.3)}${G('S31-v', vil('s31v'), 1820, 890, .95)}
  ${G('S31-co', P.moneyBag('', GOLD), 1740, 760, .5)}
  ${G('S31-l2', txt('ΙΔΡΥΣΗ ΑΓΡΟΤΙΚΩΝ ΤΡΑΠΕΖΩΝ', 0, 0, 70, '#fff', 'middle', `stroke="${INK}" stroke-width="11" paint-order="stroke"`), 1500, 200, 1)}
  <path id="S31-tg" d="M 2700 700 C 2800 450 2900 850 3000 560 S 2780 380 3100 620 S 2900 820 2820 600" fill="none" stroke="#B8323A" stroke-width="16" stroke-linecap="round" pathLength="1000" stroke-dasharray="1000 1000" stroke-dashoffset="0"/>
  ${G('S31-st', `<path d="M -260 0 L 220 0" ${st(18)}/><path d="M 210 -44 L 280 0 L 210 44 Z" fill="${GRN}" ${st(6)}/><path d="M -260 0 L 220 0" stroke="${GRN}" stroke-width="10" stroke-linecap="round"/>`, 2900, 600, 1)}
  ${txt('ΑΠΛΟΥΣΤΕΡΗ ΔΙΟΙΚΗΣΗ', 2900, 200, 70, '#fff', 'middle', `stroke="${INK}" stroke-width="11" paint-order="stroke"`)}</g>${vign}`);

// S32 «Τα αιτήματα αυτά εξέφρασε … ο Αλέξανδρος Κουμουνδούρος» — he gathers the five demands
const DEM = ['ΕΛΕΥΘΕΡΕΣ ΕΚΛΟΓΕΣ', 'ΦΟΡΟΛΟΓΙΚΗ ΜΕΤΑΡΡΥΘΜΙΣΗ', 'ΕΡΓΑ ΥΠΟΔΟΜΗΣ', 'ΑΓΡΟΤΙΚΕΣ ΤΡΑΠΕΖΕΣ', 'ΑΠΛΟΥΣΤΕΡΗ ΔΙΟΙΚΗΣΗ'];
const DEMXY = [[400, 360], [400, 560], [400, 760], [1540, 450], [1540, 680]];
shot('S32', cut(32), cut(33), `<g id="S32-cam">${room('#e6dcc4', 900)}
  ${G('S32-k', CH.koumoundouros('s32k'), 960, 900, 1.3)}
  ${DEM.map((s, i) => G(`S32-c${i}`, card(s, '#fff', 50), DEMXY[i][0], DEMXY[i][1], 1)).join('')}</g>${vign}
  ${G('S32-n', tag('ΑΛΕΞΑΝΔΡΟΣ ΚΟΥΜΟΥΝΔΟΥΡΟΣ', YEL, 56), 960, 150, 1)}`);

// S33 «Το Φεβρουάριο του 1862» — calendar
shot('S33', cut(33), mid(33, 'η δυσαρέσκεια'), `<g id="S33-cam">${wide('#3a2f36')}
  ${G('S33-pg', calPage('ΦΕΒΡΟΥΑΡΙΟΣ', ''), 960, 560, 1)}${G('S33-y', `${txt('1862', 0, 0, 200, YEL, 'middle', `stroke="${INK}" stroke-width="16" paint-order="stroke"`)}`, 960, 640, 1)}</g>${vign}`);

// S34 «η δυσαρέσκεια κατέληξε σε επανάσταση» — the cloud bursts; townsfolk and officers raise flags
shot('S34', mid(33, 'η δυσαρέσκεια'), cut(34), `<g id="S34-cam">${skyW(-400, W + 800, 880, '#7d8796', '#c9c4b8', '#a89a78')}
  ${G('S34-cl', `${P.cloudStorm()}${txt('ΔΥΣΑΡΕΣΚΕΙΑ', 0, -70, 40, '#fff')}`, 1340, 330, 1.2)}
  ${[0, 1, 2, 3, 4, 5].map(i => G(`S34-p${i}`, (i % 2 ? officer(`s34p${i}`, i) : cit(`s34p${i}`, i, { arms: 'up' })), 380 + i * 230, 900, .9)).join('')}
  ${[0, 1, 2].map(i => G(`S34-f${i}`, grFlag(110, 74, 240), 470 + i * 460, 760, 1)).join('')}</g>${vign}
  ${T('S34-l', 'ΕΠΑΝΑΣΤΑΣΗ', 620, 170, 130, RED, 'middle', 16)}`);

// S35 «με αίτημα την απομάκρυνση του βασιλιά» — the throne (and Όθων) pushed out of the frame
shot('S35', cut(34), cut(35), `<g id="S35-cam">${room('#cfd8e6', 900)}
  ${G('S35-th', `${P.throne('#5D8BD0')}${G('S35-ot', P.otto('s35ot'), 0, 0, .9)}`, 1060, 900, 1.1)}
  ${[0, 1].map(i => G(`S35-h${i}`, cit(`s35h${i}`, i + 1, { arms: 'hold' }), 640 - i * 190, 900, 1)).join('')}</g>${vign}
  ${G('S35-tg', tag('ΑΙΤΗΜΑ', '#fff', 52), 500, 300, 1)}${T('S35-l', 'ΑΠΟΜΑΚΡΥΝΣΗ ΤΟΥ ΒΑΣΙΛΙΑ', 1060, 150, 86, RED, 'middle', 13)}`);

// S36 «Στην επανάσταση συμμετείχαν κατά κύριο λόγο αξιωματικοί» — officers line up
shot('S36', cut(35), cut(36), `<g id="S36-cam">${skyW(-400, W + 800, 900, '#d8cbb0', '#efe6d2', '#b9ab88')}
  <rect x="-400" y="520" width="${W + 800}" height="380" fill="#c9b48a" ${st(5)}/>${Array.from({ length: 14 }, (_, i) => `<rect x="${-300 + i * 200}" y="580" width="70" height="110" rx="35" fill="#8a7a5a" ${st(4)}/>`).join('')}
  ${[0, 1, 2, 3].map(i => G(`S36-o${i}`, officer(`s36o${i}`, i), 480 + i * 320, 920, 1.05)).join('')}</g>${vign}
  ${T('S36-l', 'ΑΞΙΩΜΑΤΙΚΟΙ', 960, 160, 120, '#fff', 'middle', 16)}`);

// S37 «άνεργοι απόφοιτοι πανεπιστημίου» — graduates with diplomas before a university
shot('S37', cut(36), mid(36, 'που δεν'), `<g id="S37-cam">${skyW(-400, W + 800, 920, '#bfe0ea', '#f2f7f1', '#c9b98d')}
  ${G('S37-u', hallFront('ΠΑΝΕΠΙΣΤΗΜΙΟ', false), 960, 920, .95)}
  ${[0, 1, 2].map(i => G(`S37-g${i}`, grad(`s37g${i}`, i), 620 + i * 340, 960, 1)).join('')}</g>${vign}
  ${T('S37-l', 'ΑΝΕΡΓΟΙ', 960, 150, 120, RED, 'middle', 16)}${T('S37-l2', 'ΑΠΟΦΟΙΤΟΙ ΠΑΝΕΠΙΣΤΗΜΙΟΥ', 960, 250, 64, '#fff', 'middle', 11)}`);

// S38 «δεν ήθελαν να εργαστούν … αγροτικής και βιοτεχνικής παραγωγής και αισθάνονταν κοινωνικά αδικημένοι»
shot('S38', mid(36, 'που δεν'), cut(37), `<g id="S38-cam">${skyW(-400, W + 800, 880, '#bfe0ea', '#f2f7f1', '#c9b98d')}
  ${G('S38-sp0', P.signpost('ΑΓΡΟΤΙΚΗ ΠΑΡΑΓΩΓΗ', 1), 640, 880, 1.1)}${G('S38-sp1', P.signpost('ΒΙΟΤΕΧΝΙΚΗ ΠΑΡΑΓΩΓΗ', -1), 640, 1020, 1.1)}
  ${G('S38-x0', xMark(RED, 46, 18), 1080, 605, 1)}${G('S38-x1', xMark(RED, 46, 18), 1080, 755, 1)}
  ${G('S38-g', grad('s38g', 1), 1480, 890, 1.15)}
  ${G('S38-cl', `${P.cloudStorm()}`, 1480, 280, .7)}</g>${vign}
  ${T('S38-l', 'ΚΟΙΝΩΝΙΚΑ ΑΔΙΚΗΜΕΝΟΙ', 1300, 150, 80, '#fff', 'middle', 13)}`);

// S39 «πολλά άτομα ανώτερων κοινωνικών στρωμάτων» — top-hat men step down from the top of the social pyramid
shot('S39', cut(37), cut(38), `<g id="S39-cam">${skyW(-400, W + 800, 900, '#bfe0ea', '#f2f7f1', '#c9b98d')}
  ${G('S39-py', `<path d="M -420 0 L 420 0 L 280 -170 L -280 -170 Z" fill="#c9b98d" ${st(6)}/><path d="M -280 -170 L 280 -170 L 150 -330 L -150 -330 Z" fill="#d9c7a0" ${st(6)}/><path d="M -150 -330 L 150 -330 L 0 -470 Z" fill="${GOLD}" ${st(6)}/>`, 620, 900, 1)}
  ${[0, 1, 2].map(i => G(`S39-u${i}`, upper(`s39u${i}`), 540 + i * 80, 560, .55)).join('')}
  ${[0, 1, 2].map(i => G(`S39-c${i}`, i === 1 ? officer(`s39c${i}`, 2) : cit(`s39c${i}`, i), 1300 + i * 180, 900, .9)).join('')}</g>${vign}
  ${T('S39-l', 'ΑΝΩΤΕΡΑ ΚΟΙΝΩΝΙΚΑ ΣΤΡΩΜΑΤΑ', 960, 150, 84, '#fff', 'middle', 13)}`);

// S40 «ζητούσαν ευκαιρίες για ενεργότερη συμμετοχή στα πολιτικά πράγματα» — they climb the stairs of opportunity
shot('S40', cut(38), cut(39), `<g id="S40-cam">${skyW(-400, W + 800, 920, '#bfe0ea', '#f2f7f1', '#c9b98d')}
  ${G('S40-h', hallFront('ΠΟΛΙΤΙΚΑ ΠΡΑΓΜΑΤΑ'), 1450, 520, .62)}
  ${[0, 1, 2, 3, 4].map(i => `<rect x="${360 + i * 180}" y="${920 - (i + 1) * 80}" width="${1300 - i * 180}" height="${(i + 1) * 80}" fill="#d9cfb8" ${st(5)}/>`).join('')}
  ${G('S40-tg', tag('ΕΥΚΑΙΡΙΕΣ', YEL, 48), 700, 640, 1)}
  ${[0, 1].map(i => G(`S40-u${i}`, upper(`s40u${i}`), 300 - i * 120, 920, .8)).join('')}</g>${vign}
  ${T('S40-l', 'ΕΝΕΡΓΟΤΕΡΗ ΣΥΜΜΕΤΟΧΗ', 900, 150, 90, '#fff', 'middle', 14)}`);

// S41 «Στις 12 Οκτωβρίου 1862 ο Όθων αναγκάστηκε να εγκαταλείψει τη χώρα» — the king sails away; fade
shot('S41', cut(39), C.end + 2.4, `<g id="S41-cam">${skyW(-400, W + 800, 760, '#f2c79a', '#fbe7cf', '#79AFC4')}
  <rect x="-400" y="760" width="${W + 800}" height="500" fill="#5f97ad" ${st(5)}/>
  <rect x="-400" y="800" width="1380" height="300" fill="#a89a78" ${st(6)}/>
  ${G('S41-sh', P.sailship('#5a3d24'), 1150, 880, .75)}
  ${G('S41-ot', P.otto('s41ot'), 260, 810, .85)}</g>${vign}
  ${G('S41-cal', card('12 ΟΚΤΩΒΡΙΟΥ 1862', '#fbf6e8', 70), 960, 150, 1)}${G('S41-n', tag('ΟΘΩΝ', YEL, 52), 300, 330, 1)}${T('S41-l', 'ΕΓΚΑΤΕΛΕΙΨΕ ΤΗ ΧΩΡΑ', 1150, 300, 80, '#fff', 'middle', 13)}
  <rect id="S41-black" width="${W}" height="${H}" fill="#000" opacity="0"/>`);

// ---------- page ----------
const HL = ['παρακμή των ξενικών κομμάτων', 'νέας γενιάς', 'βιώσει την Επανάσταση', 'προεπαναστατική περίοδο', 'ανήκε στην ιστορία', 'ραγδαίες αλλαγές',
  'πρωτόγνωρους ρυθμούς', 'εκ θεμελίων', 'πρόγονοι', 'αστικός πληθυσμός', 'κέντρα λήψης αποφάσεων', 'μείωση των αναλφάβητων', 'διάδοση της παιδείας', 'κοινωνικές εντάσεις',
  'ημιμαθείς', 'χώρες της Δύσης', 'συμμετοχή στα πολιτικά πράγματα', 'τουρκοκρατία', 'αντιβασιλεία', 'βοήθεια των Δυνάμεων', 'αποστασιοποιήθηκε', 'έντονη κριτική',
  'συνταγματικό πολίτευμα', 'η Αυλή', 'πολιτικά ατάλαντο', '1850', 'συνολική δυσαρέσκεια', 'οικονομικής δυσπραγίας', 'αντιπολιτευτικοί όμιλοι', 'ελεύθερες εκλογές',
  'φορολογική μεταρρύθμιση', 'έργα υποδομής', 'αγροτικών τραπεζών', 'απλούστερη διοίκηση', 'Αλέξανδρος Κουμουνδούρος', 'Φεβρουάριο του 1862', 'απομάκρυνση του βασιλιά',
  'αξιωματικοί', 'άνεργοι απόφοιτοι πανεπιστημίου', 'κοινωνικά αδικημένοι', 'ανώτερων κοινωνικών στρωμάτων', 'ενεργότερη συμμετοχή', '12 Οκτωβοίου 1862', 'Όθων'];
const subs = makeSubs(timing, HL, { skipBefore: S(2) - .2 });
const n = buildPage({ out: path.join(HERE, 'build/video.html'), shots, subs, C, extraDefs: '', data: {},
  runtimeJs: '../../../engine/runtime.js', shotsJs: '../shots.js' });
fs.writeFileSync(path.join(HERE, 'build/cues.json'), JSON.stringify({ ...C, DUR: C.end + 2.4 }, null, 1));
for (let i = 1; i < shots.length; i++) if (shots[i].a !== shots[i - 1].b) throw new Error(`shots do not tile at ${shots[i].id}`);
console.log('built', (n / 1e6).toFixed(2), 'MB,', shots.length, 'shots, duration', (C.end + 2.4).toFixed(1), 's');
