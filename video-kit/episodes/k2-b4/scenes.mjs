// Κεφ.2 Β.4 «Η Εθνοσυνέλευση του 1862-1864» (k2-b4) — SCENES (node side).
// Run from the kit root:  node episodes/k2-b4/scenes.mjs   →  build/video.html + build/cues.json
// ⚠️ EVERY time is derived from the narration (S/E/Wt) — never a literal second — so a new voice re-times the film.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildMap } from '../../engine/map.mjs';
import { P, CH, W, H, INK, BLUE, RED, YEL, SAND, NIGHT, cueTools, G, T, sky, night, clouds, vign, mapDefs, seaLand, buildPage, makeSubs } from '../../engine/page.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const { timing, PH, S, E, Wt } = cueTools(path.join(HERE, 'timing.json'));

// episode colours (STORYBOARD.md → «Colour meaning»)
const PED = '#7FAF4A', ORE = '#A0683A', KOM = '#C2477A', EKL = '#7D86A8', GOLD = '#D8A93B', GRN = '#6aa84f', PAPER = '#F1E2BC';
const ENC = '#3E9C94', FRC = '#8A5BB0', RUC = '#D9822B';   // the k2-b1 «ξενικά» party colours

// ---------- cues ----------
const mid = (i, w) => +(Wt(i, w) - .12).toFixed(2);       // a cut INSIDE a long phrase, just before word w
const C = {
  t1: 0.05, t2: S(1), y62: Wt(1, 'χίλια'),
  epan: S(2), prok: Wt(2, 'προκήρυξαν'), ekl2: Wt(2, 'εκλογές'), ethn2: Wt(2, 'Εθνοσυνέλευση'),
  psif3: Wt(3, 'ψήφιζε'), neo3: Wt(3, 'νέο'), synt3: Wt(3, 'σύνταγμα'),
  ekl4: Wt(4, 'εκλογές'), noem: Wt(4, 'Νοέμβριο'), y1862: Wt(4, 'χίλια'),
  pleio: Wt(5, 'πλειονότητα'), eklex: Wt(5, 'εκλέχθηκαν'), topika: Wt(5, 'τοπικά'), xoris: Wt(5, 'χωρίς'), komm5: Wt(5, 'κομματικές'), parem5: Wt(5, 'παρεμβάσεις'),
  apod: Wt(6, 'απόδειξη'), xenika: Wt(6, 'ξενικά'), xreo: Wt(6, 'χρεοκοπήσει'),
  synkr7: Wt(7, 'συγκροτήθηκαν'), pyr: Wt(7, 'πυρήνες'), dyo7: Wt(7, 'δύο'),
  ped8: Wt(8, 'πεδινών'), ore8: Wt(8, 'ορεινών'), onom: Wt(9, 'ονομάστηκαν'),
  ped10: S(10), igeti: Wt(10, 'ηγέτη'), voulg: Wt(10, 'Δημήτριο'),
  ypon: Wt(11, 'υπονόμευε'), koin11: Wt(11, 'κοινοβουλευτικούς'), thes11: Wt(11, 'θεσμούς'),
  parem12: Wt(12, 'παρεμβάσεις'), strat12: Wt(12, 'στρατό'), dimi12: Wt(12, 'δημιουργία'), prai: Wt(12, 'πραιτωριανών'),
  mid12: mid(12, 'για να'), exasf: Wt(12, 'εξασφαλίσει'), param: Wt(12, 'παραμονή'), exous12: Wt(12, 'εξουσία'),
  empod: S(13), epid: Wt(13, 'επιδιώξεις'), polom: Wt(13, 'πολιτικές'), thes13: Wt(13, 'θεσμοί'),
  opad: Wt(14, 'οπαδούς'), dior: Wt(14, 'διοριστεί'), paran: Wt(14, 'παράνομα'), strat14: Wt(14, 'στρατό'), dimos: Wt(14, 'δημόσιο'),
  fov: Wt(15, 'φοβούνταν'), xas: Wt(15, 'χάσουν'), thesi: Wt(15, 'θέση'), koin15: Wt(15, 'κοινοβουλευτικής'), nom15: Wt(15, 'νομιμότητας'),
  anerg: Wt(16, 'άνεργους'), ptyx: Wt(16, 'πτυχιούχους'), mikr16: Wt(16, 'μικροκαλλιεργητές'),
  ore17: S(17), diaf17: Wt(17, 'διάφορες'), griv: Wt(17, 'Γρίβα'),
  mid17: mid(17, 'με κοινό'), koin17: Wt(17, 'κοινό'), antist: Wt(17, 'αντίσταση'), ped17: Wt(17, 'πεδινών'),
  ypost: Wt(18, 'υποστηρικτές'), mikr18: Wt(18, 'μικροκαλλιεργητών'), ktin: Wt(19, 'κτηνοτρόφων'), empor: Wt(20, 'εμπόρων'), ploio: Wt(20, 'πλοιοκτητών'),
  laos: S(21), energ: Wt(21, 'ενεργά'), dyo21: Wt(21, 'δύο'),
  mikrot: S(22), apix: Wt(22, 'απήχηση'), alloi: Wt(22, 'άλλοι'),
  komit: S(23), epam: Wt(24, 'Επαμεινώνδα'), delig: Wt(24, 'Δεληγιώργη'),
  anapt25: Wt(25, 'ανάπτυξη'), koin25: Wt(25, 'κοινοβουλευτισμού'), eksyn: Wt(25, 'εκσυγχρονισμό'),
  oikon: S(26), metar: Wt(26, 'μεταρρυθμίσεις'), dioik: Wt(26, 'διοίκηση'), strat26: Wt(26, 'στρατό'),
  polit27: S(27), exapl: Wt(27, 'εξάπλωση'), othom: Wt(27, 'Οθωμανική'),
  eklek: S(28), eterok: Wt(28, 'ετερόκλητη'), polit28: Wt(28, 'πολιτικών'), logion: S(29), axiom: Wt(29, 'αξιωματικών'),
  metrio: Wt(30, 'μετριοπαθείς'), mesol: Wt(31, 'μεσολαβεί'), allon: Wt(31, 'άλλων'), stath31: Wt(31, 'σταθερές'), kyv31: Wt(31, 'κυβερνήσεις'),
};
Object.assign(C, {
  asta32: Wt(32, 'αστάθειας'), emfyl: Wt(32, 'εμφυλίου'),
  dyo33: Wt(33, 'δύο'), xron33: Wt(33, 'χρόνια'), psif33: Wt(33, 'ψήφιση'),
  polit34: Wt(34, 'πολίτευμα'), vasil34: Wt(34, 'βασιλευομένη'), dimok: Wt(34, 'δημοκρατία'), anti34: Wt(34, 'αντί'), synmon: Wt(34, 'συνταγματικής'),
  katox: S(35), laik: Wt(35, 'λαϊκής'), kyr: Wt(35, 'κυριαρχίας'),
  amesi: S(36), myst: S(37), kathol: Wt(37, 'καθολική'), andr: Wt(37, 'ανδρικό'), psifos: Wt(37, 'ψήφος'), sfair: Wt(37, 'σφαιρίδια'),
  anex: Wt(38, 'ανεξαρτησία'), dikai: Wt(38, 'δικαιοσύνης'), eleft38: Wt(38, 'ελευθερία'), synerx: Wt(38, 'συνέρχεσθαι'), synet: Wt(38, 'συνεταιρίζεσθαι'),
  anoige: Wt(39, 'άνοιγε'), dromo: Wt(39, 'δρόμο'), eleft39: Wt(39, 'ελεύθερη'), komm39: Wt(39, 'κομμάτων'),
  komm40: S(40), apar: Wt(40, 'απαραίτητα'), ekfr: Wt(40, 'έκφραση'), koini: Wt(40, 'κοινής'),
  enall: Wt(41, 'εναλλακτική'), synom: Wt(41, 'συνωμοτικοί'), via: Wt(41, 'βιαιοπραγίες'),
  antid: Wt(42, 'αντίδραση'), georg42: Wt(42, 'Γεωργίου'),
  epev: Wt(43, 'επέβαλε'), proer: Wt(43, 'προέρχεται'), kyv43: Wt(43, 'κυβέρνηση'), pleio43: Wt(43, 'πλειοψηφία'),
  saf44: Wt(44, 'σαφήνεια'), dioti: S(45), afton: Wt(45, 'αυτονόητο'),
  ofeile46: Wt(46, 'όφειλε'), entoli46: Wt(46, 'εντολή'), vouleft46: Wt(46, 'βουλευτή'), empist46: Wt(46, 'εμπιστοσύνη'), pleio46: Wt(46, 'πλειοψηφίας'),
  rep47: S(47), entoli47: Wt(47, 'εντολή'), vouleft47: Wt(47, 'βουλευτή'), pleio47: Wt(47, 'πλειοψηφίας'),
  georg48: S(48), ekmet: Wt(48, 'εκμεταλλεύτηκε'), asaf: Wt(48, 'ασάφεια'), dior49: Wt(49, 'διορίζει'), aresk: Wt(49, 'αρεσκείας'),
  psif50: Wt(50, 'ψήφιση'), dedil50: Wt(50, 'δεδηλωμένης'), y1875: Wt(50, 'χίλια'),
  idea: S(51), neo51: Wt(51, 'νέο'), trik51: Wt(51, 'Χαρίλαο'),
  dimos52: Wt(52, 'δημόσια'), moni: Wt(52, 'μόνη'), asta52: Wt(52, 'αστάθειας'), dyo52: Wt(52, 'δύο'), exous52: Wt(52, 'εξουσίας'),
  agl: Wt(53, 'Αγγλίας'), protyp: Wt(53, 'πρότυπο'),
  dynat54: S(54), anath: Wt(55, 'αναθέτει'), entoli55: Wt(55, 'εντολή'), mono55: Wt(55, 'μόνο'),
  mid55: mid(55, 'ο οποίος σαφώς'), safos: Wt(55, 'σαφώς'), dedil55: Wt(55, 'δεδηλωμένη'), pleio55: Wt(55, 'πλειοψηφίας'),
  ster: Wt(56, 'στερούσε'), meio: Wt(56, 'μειοψηφίας'), dyn56: Wt(56, 'δυνατότητα'), kyv56: Wt(56, 'κυβέρνηση'),
  oth: Wt(57, 'ωθούσε'), synen: Wt(57, 'συνένωση'), apotel: Wt(57, 'αποτέλεσμα'), stath57: Wt(57, 'σταθερότερες'),
  vas58: S(58), piesi: Wt(59, 'πίεση'), antip: Wt(59, 'αντιπολίτευσης'), anavr: Wt(59, 'αναβρασμού'),
  yiot: Wt(60, 'υιοθέτησε'), trik60: Wt(60, 'Τρικούπη'),
  tomi: Wt(61, 'τομή'), istor: Wt(61, 'ιστορία'), metav: Wt(62, 'μεταβολή'), topio: Wt(62, 'τοπίου'),
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
const hall = (x0 = -400, w = W + 800, wall = '#d9c8a4', floorY = 860) => `<rect x="${x0}" y="-300" width="${w}" height="${floorY + 300}" fill="${wall}"/>
  ${Array.from({ length: Math.ceil(w / 360) }, (_, i) => `<rect x="${x0 + 120 + i * 360}" y="-300" width="56" height="${floorY + 300}" fill="#cbb892" stroke="${INK}" stroke-width="4"/>`).join('')}
  <rect x="${x0}" y="${floorY}" width="${w}" height="${H - floorY + 400}" fill="#9a7b52" stroke="${INK}" stroke-width="5"/>
  ${Array.from({ length: Math.ceil(w / 160) }, (_, i) => `<path d="M ${x0 + i * 160} ${floorY} L ${x0 + i * 160 - 60} ${H + 100}" stroke="#7e6240" stroke-width="4"/>`).join('')}
  <rect x="${x0}" y="-300" width="${w}" height="${H + 600}" fill="#000" filter="url(#paper)" opacity=".16"/>`;
const skyW = (x0, w, gy, top = '#bfe0ea', bot = '#f2f7f1', ground = '#c9b98d') => `<defs><linearGradient id="skw${x0}${w}${gy}${top.slice(1)}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bot}"/></linearGradient></defs><rect x="${x0}" y="-300" width="${w}" height="${H + 600}" fill="url(#skw${x0}${w}${gy}${top.slice(1)})"/><rect x="${x0}" y="${gy}" width="${w}" height="${H - gy + 400}" fill="${ground}" stroke="${INK}" stroke-width="5"/><rect x="${x0}" y="-300" width="${w}" height="${H + 600}" fill="#000" filter="url(#paper)" opacity=".18"/>`;
const paper = (w, h, c = PAPER) => `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="8" fill="${c}" stroke="${INK}" stroke-width="7"/><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="8" fill="#000" filter="url(#paper)" opacity=".15"/>`;
const card = (w, h, c = '#efe4c9') => `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="22" fill="${c}" ${st(7)}/>`;
const flagP = (c, w = 120, h = 80, pole = 300) => `<g><rect x="-6" y="${-pole}" width="12" height="${pole}" rx="4" fill="#7a5232" ${st(4)}/><path d="M 6 ${-pole + 6} Q ${w * .5} ${-pole - 14} ${w} ${-pole + 6} L ${w} ${-pole + 6 + h} Q ${w * .5} ${-pole + h - 14} 6 ${-pole + 6 + h} Z" fill="${c}" ${st(5)}/></g>`;
const handFlag = c => `<g transform="translate(62,-84)">${flagP(c, 80, 54, 190)}</g>`;   // a person's prop: small flag in the right hand
const bench = (x, y, w = 520) => `<g transform="translate(${x},${y})"><rect x="${-w / 2}" y="-60" width="${w}" height="34" rx="8" fill="#8a5a32" ${st(5)}/><rect x="${-w / 2}" y="-26" width="${w}" height="26" rx="6" fill="#6e4524" ${st(5)}/><rect x="${-w / 2 + 20}" y="0" width="20" height="40" fill="#5a3a1e" ${st(4)}/><rect x="${w / 2 - 40}" y="0" width="20" height="40" fill="#5a3a1e" ${st(4)}/></g>`;
const chair = (c = '#8a5a32', label = '') => `<g><rect x="-70" y="-260" width="140" height="170" rx="16" fill="${c}" ${st(6)}/><rect x="-90" y="-100" width="180" height="34" rx="10" fill="${c}" ${st(6)}/><rect x="-80" y="-66" width="20" height="66" fill="#5a3a1e" ${st(4)}/><rect x="60" y="-66" width="20" height="66" fill="#5a3a1e" ${st(4)}/>${label ? txt(label, 0, -168, 34, '#fff', 'middle', `stroke="${INK}" stroke-width="6" paint-order="stroke"`) : ''}</g>`;
const table = (label, c = '#8a5a32') => `<g><rect x="-230" y="-150" width="460" height="40" rx="10" fill="${c}" ${st(6)}/><rect x="-200" y="-110" width="26" height="110" fill="#5a3a1e" ${st(5)}/><rect x="174" y="-110" width="26" height="110" fill="#5a3a1e" ${st(5)}/>${txt(label, 0, -170, 50, '#fff', 'middle', `stroke="${INK}" stroke-width="8" paint-order="stroke"`)}</g>`;
const tag = (s, c = '#fff', fs = 38) => { const w = s.length * fs * .52 + 40; return `<g><rect x="${-w / 2}" y="${-fs * .8}" width="${w}" height="${fs * 1.3}" rx="12" fill="${c}" ${st(5)}/>${txt(s, 0, fs * .32, fs, INK)}</g>`; };
const stars = (p, ox = -240, span = 2400) => Array.from({ length: 30 }, (_, i) => `<circle id="${p}-st${i}" cx="${ox + (i * 197) % span}" cy="${(i * 113) % 520 - 40}" r="${2 + (i % 3)}" fill="#fff8d6"/>`).join('');
const sweat = `<path d="M 0 0 q 10 18 0 26 q -10 -8 0 -26 Z" fill="#7fc1e8" ${st(3)}/>`;
const heart = c => `<path d="M 0 30 C -60 -10 -40 -60 0 -30 C 40 -60 60 -10 0 30 Z" fill="${c}" ${st(5)}/>`;
const roman = `<path d="M -10 -330 Q -60 -420 40 -430 Q 120 -420 70 -330 Z" fill="#c0392b" ${st(4)}/>${[-20, 10, 40].map(x => `<path d="M ${x} -340 Q ${x + 6} -390 ${x + 18} -420" stroke="#8a1f1f" stroke-width="4" fill="none"/>`).join('')}`;  // praetorian crest (sits on the kepi)
const bubbles = (p, n = 5) => Array.from({ length: n }, (_, i) => `<circle id="${p}-bu${i}" cx="${(i - 2) * 70}" cy="0" r="${16 + (i % 3) * 8}" fill="#fff" ${st(4)} opacity="0"/>`).join('');

// ---------- generic figures: ONE design = ONE role in this episode (STORYBOARD «Cast») ----------
const rifle = `<g transform="translate(70,-60) rotate(-8)"><rect x="-5" y="-170" width="10" height="170" rx="3" fill="#6b4a2b" stroke="${INK}" stroke-width="4"/><rect x="-3" y="-200" width="6" height="34" fill="#888" stroke="${INK}" stroke-width="3"/></g>`;
const HAIR = ['#3a2a20', '#6b4a30', '#1d1a17', '#8a8a8a', '#5a3a22', '#2a2420'];
const dep = (id, i = 0, extra = {}) => P.person({ id, coat: '#56606e', pants: '#3a3f48', vest: '#e2dccd', hair: 'short', hairC: HAIR[i % HAIR.length], face: 'stache', faceC: HAIR[i % HAIR.length], ...extra });       // αντιπρόσωπος / βουλευτής
const soldier62 = (id, extra = {}) => P.person({ id, coat: '#24365e', pants: '#d8d2c4', hat: 'kepi', hatC: '#1d2a44', face: 'stache', hairC: '#3a2a20', prop: rifle, ...extra }); // στρατός
const clerk = (id, extra = {}) => P.person({ id, coat: '#7a7f5a', pants: '#4a4a3a', vest: '#efe8d6', hair: 'short', hairC: '#7a4a2a', glasses: true,
  chest: `<rect x="-66" y="-120" width="22" height="40" rx="6" fill="#efe8d6" stroke="${INK}" stroke-width="3"/><rect x="44" y="-120" width="22" height="40" rx="6" fill="#efe8d6" stroke="${INK}" stroke-width="3"/>`, ...extra });  // δημόσιος υπάλληλος (μανικέτια)
const diploma = `<g transform="translate(70,-110) rotate(-20)"><rect x="-16" y="-80" width="32" height="110" rx="10" fill="#fbf8f0" stroke="${INK}" stroke-width="4"/><path d="M -18 -20 H 18" stroke="#B8323A" stroke-width="8"/></g>`;
const grad = (id, extra = {}) => P.person({ id, coat: '#5a4a7a', pants: '#3a3350', hair: 'short', hairC: '#8a5a2a', prop: diploma, ...extra });   // πτυχιούχος (no moustache: young)
const crook = `<g transform="translate(74,-40)"><path d="M 0 40 L 0 -250 Q 0 -300 34 -296 Q 60 -290 52 -262" fill="none" stroke="${INK}" stroke-width="16" stroke-linecap="round"/><path d="M 0 40 L 0 -250 Q 0 -300 34 -296 Q 60 -290 52 -262" fill="none" stroke="#9a6b3a" stroke-width="8" stroke-linecap="round"/></g>`;
const herder = (id, extra = {}) => P.person({ id, coat: '#e8dfc9', sleeveC: '#e8dfc9', legs: 'vraka', vrakaC: '#5a4a3a', hat: 'kalpak', hatC: '#3a2e22', beard: true, beardC: '#4a3a2a', hairC: '#4a3a2a', face: 'stache', prop: crook, ...extra }); // κτηνοτρόφος (κάπα + γκλίτσα)
const scales = `<g transform="translate(76,-96)"><path d="M -40 0 H 40 M 0 0 V -40" stroke="${INK}" stroke-width="5"/><path d="M -52 0 Q -40 24 -28 0 Z M 28 0 Q 40 24 52 0 Z" fill="${GOLD}" ${st(3)}/></g>`;
const merchant = (id, extra = {}) => P.person({ id, coat: '#7a3b2a', vest: GOLD, pants: '#3a2e22', hat: 'bowler', face: 'stache', hairC: '#3a2a20', prop: scales, ...extra }); // έμπορος
const bookProp = `<g transform="translate(70,-104) rotate(-10)"><rect x="-30" y="-40" width="60" height="78" rx="6" fill="#3e6fb0" stroke="${INK}" stroke-width="4"/><rect x="-22" y="-32" width="44" height="62" fill="#fbf8f0" stroke="${INK}" stroke-width="2"/></g>`;
const scholar = (id, extra = {}) => P.person({ id, coat: '#4a3a5a', pants: '#2e2838', hair: 'long', hairC: '#5a3a20', face: 'stache', faceC: '#5a3a20', prop: bookProp, ...extra });  // λόγιος
const people = (id, i, extra = {}) => (i % 2 ? P.villagerW : P.citizen)(id, extra);   // ο λαός

// =====================================================================
// S1 title — the empty assembly hall at dawn
shot('S1', 0, cut(2), `<g id="S1-cam">${hall(-400, W + 800, '#e2cfa6', 880)}
  <defs><radialGradient id="S1-rg"><stop offset="0" stop-color="#fff2c4" stop-opacity=".7"/><stop offset="1" stop-color="#fff2c4" stop-opacity="0"/></radialGradient></defs>
  <circle id="S1-glow" cx="960" cy="420" r="700" fill="url(#S1-rg)" opacity="0"/>
  ${G('S1-tri', `<rect x="-300" y="-120" width="600" height="120" fill="#8a5a32" ${st(6)}/><rect x="-250" y="-200" width="500" height="80" fill="#a87444" ${st(6)}/>`, 960, 880, 1)}
  ${G('S1-b0', bench(0, 0, 760), 960, 960, 1)}${G('S1-b1', bench(0, 0, 980), 960, 1060, 1)}</g>${vign}
  ${T('S1-t1', 'ΕΝΟΤΗΤΑ 4', 960, 300, 92, YEL, 'middle', 12)}${T('S1-t2', 'Η ΕΘΝΟΣΥΝΕΛΕΥΣΗ', 960, 440, 132, '#fff', 'middle', 16)}${T('S1-t3', 'ΤΟΥ 1862-1864', 960, 570, 108, YEL, 'middle', 15)}`);

// S2 «προκήρυξαν εκλογές αντιπροσώπων» — the revolutionaries paste the proclamation on a wall
const brush = `<g transform="translate(72,-140) rotate(30)"><rect x="-6" y="-60" width="12" height="80" fill="#8a6a46" stroke="${INK}" stroke-width="4"/><rect x="-22" y="-92" width="44" height="34" rx="6" fill="#efe4c9" stroke="${INK}" stroke-width="4"/></g>`;
shot('S2', cut(2), cut(3), `<g id="S2-cam">${skyW(-400, 2720, 900, '#f2c992', '#fbeedd', '#bda57a')}
  <rect x="200" y="140" width="1520" height="760" fill="#e8d6b0" ${st(6)}/>${Array.from({ length: 8 }, (_, i) => `<path d="M 200 ${230 + i * 90} H 1720" stroke="#cdb88e" stroke-width="4"/>`).join('')}
  <rect x="200" y="140" width="1520" height="760" fill="#000" filter="url(#paper)" opacity=".18"/>
  ${G('S2-post', `${paper(720, 560, '#fbf3dc')}${txt('ΠΡΟΚΗΡΥΞΗ', 0, -170, 70, RED)}<path d="M -300 -140 H 300" ${st(5)}/>${txt('ΕΚΛΟΓΕΣ', 0, -40, 118, INK)}${txt('ΑΝΤΙΠΡΟΣΩΠΩΝ', 0, 60, 92, INK)}<g id="S2-ethn">${txt('ΓΙΑ ΕΘΝΟΣΥΝΕΛΕΥΣΗ', 0, 170, 64, '#7a1f1f')}</g>`, 960, 480, 1)}
  ${G('S2-p0', P.citizen('s2p0', { prop: brush }), 430, 950, 1.05)}${G('S2-p1', P.villagerW('s2p1'), 1500, 950, 1.05)}</g>${vign}
  ${T('S2-l', 'ΟΙ ΕΠΑΝΑΣΤΑΤΕΣ', 64, 120, 80, YEL, 'start', 12)}`);

// S3 «θα ψήφιζε νέο σύνταγμα» — a blank new constitution; the assembly raises hands
shot('S3', cut(3), cut(4), `<g id="S3-cam">${night('#2f3b4a')}${stars('S3')}
  ${G('S3-sc', `<rect x="-420" y="-230" width="840" height="460" fill="${PAPER}" ${st(7)}/><rect x="-450" y="-250" width="40" height="500" rx="20" fill="#d9c08c" ${st(6)}/><rect x="410" y="-250" width="40" height="500" rx="20" fill="#d9c08c" ${st(6)}/>
     ${txt('ΝΕΟ ΣΥΝΤΑΓΜΑ', 0, -120, 92, INK)}${[0, 1, 2, 3].map(i => `<path d="M -330 ${-20 + i * 56} H ${[330, 260, 330, 120][i]}" stroke="#bfa877" stroke-width="12" stroke-linecap="round" stroke-dasharray="26 22"/>`).join('')}`, 960, 430, 1)}
  <rect x="-400" y="945" width="2720" height="500" fill="#243040" stroke="#1d1a17" stroke-width="5"/>${G('S3-q', `<g transform="rotate(30)">${P.quill()}</g>`, 1240, 420, 1.2)}
  ${[0, 1, 2, 3].map(i => G(`S3-d${i}`, dep(`s3d${i}`, i, { arms: 'up' }), [260, 520, 1400, 1660][i], 950, .7)).join('')}</g>${vign}
  ${T('S3-l', 'ΘΑ ΨΗΦΙΖΕ', 960, 140, 100, YEL, 'middle', 14)}`);

// S4 «Νοέμβριο του 1862» — autumn: a calendar flips, leaves fall, voters walk to the polls
shot('S4', cut(4), cut(5), `<g id="S4-cam">${skyW(-400, 2720, 860, '#e8b77a', '#f6e4c4', '#b89a68')}${clouds('S4', [[300, 140, .9], [1600, 120, 1]])}
  ${[[180, 860, 1.1], [1640, 860, 1.15]].map(([x, y, s], i) => G(`S4-tr${i}`, `<rect x="-18" y="-260" width="36" height="260" fill="#6b4a2b" ${st(5)}/><circle cx="0" cy="-320" r="130" fill="#d9822b" ${st(6)}/><circle cx="-70" cy="-260" r="70" fill="#c9661f" ${st(5)}/><circle cx="76" cy="-270" r="74" fill="#e8a23b" ${st(5)}/>`, x, y, s)).join('')}
  ${Array.from({ length: 9 }, (_, i) => G(`S4-lf${i}`, `<path d="M 0 -18 Q 16 0 0 18 Q -16 0 0 -18 Z" fill="${['#d9822b', '#c9661f', '#e8a23b'][i % 3]}" ${st(3)}/>`, 100 + i * 210, -40, 1.2)).join('')}
  ${G('S4-door', `<rect x="-130" y="-330" width="260" height="330" fill="#7a5232" ${st(6)}/><rect x="-100" y="-300" width="200" height="300" fill="#3a2a1e" ${st(4)}/><g transform="translate(0,-380)">${tag('ΕΚΛΟΓΕΣ', '#fbf3dc', 44)}</g>`, 1400, 860, 1)}
  ${G('S4-cal', `${card(380, 420, '#fbf8f0')}<rect x="-190" y="-210" width="380" height="96" rx="20" fill="${RED}" ${st(7)}/><circle cx="-110" cy="-210" r="14" fill="${INK}"/><circle cx="110" cy="-210" r="14" fill="${INK}"/>
     <g id="S4-pgA">${txt('ΟΚΤΩΒΡΙΟΣ', 0, -144, 52, '#fff')}${[0, 1, 2, 3].map(r => [0, 1, 2, 3, 4].map(c => `<rect x="${-140 + c * 58}" y="${-80 + r * 64}" width="40" height="40" rx="6" fill="#e3d9c3"/>`).join('')).join('')}</g><g id="S4-pgB" opacity="0">${txt('ΝΟΕΜΒΡΙΟΣ', 0, -144, 52, '#fff')}${txt('1862', 0, 40, 130, INK)}</g>`, 600, 470, 1)}
  ${[0, 1, 2, 3].map(i => G(`S4-v${i}`, people(`s4v${i}`, i), 800 + i * 130, 880, .62)).join('')}</g>${vign}
  ${T('S4-d', 'ΝΟΕΜΒΡΙΟΣ 1862', 64, 120, 80, YEL, 'start', 12)}${T('S4-l', 'ΟΙ ΕΚΛΟΓΕΣ', 1250, 200, 96, '#fff', 'middle', 14)}`);

// S5 «η πλειονότητα … από τοπικά ψηφοδέλτια χωρίς κομματικές παρεμβάσεις»
const sleeveArm = c => `<path d="M 600 0 L 80 0" stroke="${INK}" stroke-width="66" stroke-linecap="round"/><path d="M 600 0 L 80 0" stroke="${c}" stroke-width="52" stroke-linecap="round"/><circle cx="60" cy="0" r="36" fill="#F7F1E8" ${st(6)}/>`;
shot('S5', cut(5), cut(6), `<g id="S5-cam">${hall(-400, W + 800, '#c8d4c0', 880)}
  ${[0, 1, 2, 3, 4, 5].map(i => G(`S5-d${i}`, dep(`s5d${i}`, i), 260 + i * 200, 900, .72) + G(`S5-tg${i}`, tag(i < 4 ? 'ΤΟΠΙΚΟ' : '?', i < 4 ? '#e9f2d8' : '#eee', 30), 260 + i * 200, 610, 1)).join('')}
  ${G('S5-bar', `<rect x="0" y="0" width="900" height="60" rx="30" fill="#efe4c9" ${st(6)}/><rect id="S5-fill" x="6" y="6" width="0" height="48" rx="24" fill="${GRN}"/><path d="M 450 -16 V 76" stroke="${INK}" stroke-width="6" stroke-dasharray="10 8"/>`, 510, 330, 1)}
  ${G('S5-arm', sleeveArm(ENC), 1420, 520, 1)}${G('S5-x', xMark(RED, 60, 24), 1480, 520, 1, 'opacity="0"')}</g>${vign}
  ${T('S5-l', 'ΠΛΕΙΟΝΟΤΗΤΑ', 960, 280, 72, '#fff', 'middle', 11)}${T('S5-l2', 'ΤΟΠΙΚΑ ΨΗΦΟΔΕΛΤΙΑ', 960, 150, 96, YEL, 'middle', 14)}${T('S5-l3', 'ΧΩΡΙΣ ΚΟΜΜΑΤΙΚΕΣ ΠΑΡΕΜΒΑΣΕΙΣ', 1100, 445, 54, '#fff', 'middle', 9)}`);

// S6 «απόδειξη ότι τα «ξενικά» κόμματα είχαν χρεοκοπήσει» — the party shop goes bankrupt
shot('S6', cut(6), cut(7), `<g id="S6-cam">${skyW(-400, 2720, 880, '#c9dde6', '#f3efe4', '#c9b98d')}
  <rect x="330" y="150" width="1260" height="730" fill="#e9dcc0" ${st(7)}/><rect x="330" y="150" width="1260" height="730" fill="#000" filter="url(#paper)" opacity=".15"/>
  <path d="M 300 330 L 1620 330 L 1560 420 L 360 420 Z" fill="${RED}" ${st(6)}/>${[0, 1, 2, 3, 4, 5].map(i => `<path d="M ${360 + i * 200} 420 L ${460 + i * 200} 420 L ${410 + i * 200} 470 Z" fill="#fff" ${st(4)}/>`).join('')}
  ${G('S6-sign', `<rect x="-420" y="-70" width="840" height="140" rx="12" fill="#2f2a26" ${st(6)}/>${txt('«ΞΕΝΙΚΑ» ΚΟΜΜΑΤΑ', 0, 30, 84, '#f6e9c8')}`, 960, 240, 1)}
  ${[['en', ENC], ['fr', FRC], ['ru', RUC]].map(([k, c], i) => G(`S6-${k}`, P.partyMan(`s6${k}`, k, c), [620, 960, 1300][i], 890, .78)).join('')}
  ${G('S6-bag', P.moneyBag('0', '#c9a46a'), 1460, 890, .8)}
  ${G('S6-mag', P.magnifier(), 1460, 700, .9, 'opacity="0"')}${G('S6-st', P.stamp('ΧΡΕΟΚΟΠΙΑ', '#C0392B', 640, 96), 960, 560, 1, 'opacity="0"')}</g>${vign}
  ${T('S6-l', 'ΑΠΟΔΕΙΞΗ', 1460, 480, 64, YEL, 'middle', 10)}`);

// S7 «συγκροτήθηκαν οι πυρήνες των δύο μεγάλων παρατάξεων» — deputies gather around two glowing cores
const glowDefs = `<defs><radialGradient id="S7-g"><stop offset="0" stop-color="#fff6c9"/><stop offset=".6" stop-color="#ffe27a" stop-opacity=".7"/><stop offset="1" stop-color="#ffe27a" stop-opacity="0"/></radialGradient></defs>`;
shot('S7', cut(7), cut(8), `<g id="S7-cam">${hall(-400, W + 800, '#d2c09a', 880)}${glowDefs}
  ${[0, 1].map(k => G(`S7-c${k}`, `<circle r="190" fill="url(#S7-g)"/><circle r="56" fill="#fff3b0" ${st(6)}/>`, [480, 1440][k], 560, 1, 'opacity="0"')).join('')}
  ${Array.from({ length: 8 }, (_, i) => G(`S7-d${i}`, dep(`s7d${i}`, i), [150, 1700, 520, 1280, 880, 1050, 300, 1500][i], 900, .62)).join('')}</g>${vign}
  ${T('S7-l', 'ΠΥΡΗΝΕΣ', 960, 300, 92, YEL, 'middle', 13)}${T('S7-l2', 'ΔΥΟ ΜΕΓΑΛΕΣ ΠΑΡΑΤΑΞΕΙΣ', 960, 150, 96, '#fff', 'middle', 14)}`);

// S8 «των πεδινών και των ορεινών, όπως ονομάστηκαν» — the plain and the mountain get their name signs
const mountain = (c, s = 1) => `<g transform="scale(${s})"><path d="M -520 0 L -200 -520 L -60 -300 L 120 -640 L 520 0 Z" fill="${c}" ${st(7)}/><path d="M 120 -640 L 40 -480 L 120 -520 L 190 -470 Z" fill="#fbf8f0" ${st(5)}/><path d="M -200 -520 L -250 -430 L -190 -460 L -150 -430 Z" fill="#fbf8f0" ${st(5)}/></g>`;
const signBoard = (s, c) => `<g><rect x="-8" y="-230" width="16" height="230" fill="#7a5232" ${st(5)}/><rect x="-230" y="-330" width="460" height="120" rx="14" fill="${c}" ${st(7)}/>${txt(s, 0, -246, 76, '#fff', 'middle', `stroke="${INK}" stroke-width="9" paint-order="stroke"`)}</g>`;
shot('S8', cut(8), cut(10), `<g id="S8-cam">${skyW(-400, 3300, 860, '#a9d4e6', '#eef6f2', PED)}
  <rect x="1250" y="700" width="1700" height="900" fill="${ORE}" ${st(6)}/>
  ${G('S8-mt', mountain(ORE, 1.15), 1720, 880, 1)}${G('S8-mt2', mountain('#b97b48', .8), 2300, 900, 1)}
  ${Array.from({ length: 7 }, (_, i) => `<path d="M ${-300 + i * 230} 940 q 20 -40 40 0 q 20 -40 40 0" fill="none" stroke="#5f8a34" stroke-width="7" stroke-linecap="round"/>`).join('')}
  ${G('S8-sp', signBoard('ΠΕΔΙΝΟΙ', PED), 480, 860, 1)}${G('S8-so', signBoard('ΟΡΕΙΝΟΙ', ORE), 1720, 640, 1)}
  ${[0, 1, 2].map(i => G(`S8-fp${i}`, flagP(PED, 100, 66, 240), 220 + i * 180, 1000, .9)).join('')}${[0, 1, 2].map(i => G(`S8-fo${i}`, flagP(ORE, 100, 66, 240), 1960 + i * 160, 820 - i * 30, .9)).join('')}</g>${vign}
  ${T('S8-l', 'ΟΠΩΣ ΟΝΟΜΑΣΤΗΚΑΝ', 1250, 150, 84, '#fff', 'middle', 13)}`);

// S9 «ηγέτη τον Δημήτριο Βούλγαρη»
shot('S9', cut(10), cut(11), `<g id="S9-cam">${skyW(-400, 2720, 860, '#a9d4e6', '#eef6f2', PED)}${clouds('S9', [[300, 160, .9], [1580, 120, 1.1]])}
  ${G('S9-pod', `<path d="M -260 0 L -220 -110 L 220 -110 L 260 0 Z" fill="#6f9a3e" ${st(7)}/>`, 960, 880, 1)}
  ${G('S9-v', CH.voulgaris('s9v', { sash: [PED] }), 960, 770, 1.35)}
  ${[0, 1, 2, 3].map(i => G(`S9-f${i}`, flagP(PED, 110, 70, 280), [260, 470, 1450, 1660][i], 960, .95)).join('')}</g>${vign}
  ${T('S9-n', 'ΔΗΜΗΤΡΙΟΣ ΒΟΥΛΓΑΡΗΣ', 960, 250, 84, '#fff', 'middle', 13)}${T('S9-l', 'ΗΓΕΤΗΣ ΤΩΝ ΠΕΔΙΝΩΝ', 64, 120, 72, YEL, 'start', 11)}`);

// S10 «υπονόμευε τους κοινοβουλευτικούς θεσμούς» — he tunnels under the building, it cracks and tilts
shot('S10', cut(11), cut(12), `<g id="S10-cam">${skyW(-400, 2720, 560, '#bfe0ea', '#f2f7f1', '#8a6440')}
  ${Array.from({ length: 14 }, (_, i) => `<circle cx="${(i * 173) % 2400 - 200}" cy="${640 + (i * 97) % 400}" r="${8 + i % 4 * 4}" fill="#6e4e30"/>`).join('')}
  <path id="S10-tun" d="M 260 900 Q 600 980 900 820 Q 1060 740 1180 760" fill="none" stroke="#3b2a1a" stroke-width="120" stroke-linecap="round" pathLength="1000" stroke-dasharray="1000 1000" stroke-dashoffset="1000"/>
  ${G('S10-b', `${P.building('ΘΕΣΜΟΙ')}${txt('ΚΟΙΝΟΒΟΥΛΕΥΤΙΚΟΙ', 0, -360, 46, INK)}<path id="S10-cr" d="M -40 0 L -10 -60 L -50 -120 L 0 -190 L -20 -260" fill="none" stroke="${INK}" stroke-width="8" pathLength="1000" stroke-dasharray="1000 1000" stroke-dashoffset="1000"/>`, 1180, 560, 1.25)}
  ${G('S10-v', CH.voulgaris('s10v', { sash: [PED], prop: `<g transform="translate(40,-210) rotate(-30)">${P.shovel()}</g>` }), 260, 940, .6)}</g>${vign}
  ${T('S10-l', 'ΥΠΟΝΟΜΕΥΕ', 64, 120, 92, YEL, 'start', 13)}`);

// S11 «παρεμβάσεις στο στρατό … σώματος «πραιτωριανών»» — green badges, then Roman crests on the kepis
shot('S11', cut(12), C.mid12, `<g id="S11-cam">${skyW(-400, 2720, 880, '#c9d8e0', '#f2f2ea', '#b9a77d')}
  ${G('S11-bar', `<rect x="-900" y="-400" width="1800" height="400" fill="#c9b48a" ${st(6)}/>${Array.from({ length: 9 }, (_, i) => `<rect x="${-860 + i * 200}" y="-330" width="90" height="140" fill="#3a2a1e" ${st(4)}/>`).join('')}`, 960, 880, 1)}
  ${[0, 1, 2, 3].map(i => G(`S11-s${i}`, soldier62(`s11s${i}`) + G(`S11-cr${i}`, roman, 0, 0, 1, 'opacity="0"') + G(`S11-bd${i}`, `<circle r="18" fill="${PED}" ${st(4)}/>`, -28, -120, 1, 'opacity="0"'), 700 + i * 280, 900, .82)).join('')}
  ${G('S11-v', CH.voulgaris('s11v', { sash: [PED] }), 300, 900, .9)}</g>${vign}
  ${T('S11-l', 'ΠΑΡΕΜΒΑΣΕΙΣ ΣΤΟ ΣΤΡΑΤΟ', 960, 150, 86, '#fff', 'middle', 13)}${T('S11-l2', '«ΠΡΑΙΤΩΡΙΑΝΟΙ»', 1120, 300, 96, YEL, 'middle', 14)}`);

// S12 «για να εξασφαλίσει την παραμονή του στην εξουσία» — the praetorians ring his chair
shot('S12', C.mid12, cut(13), `<g id="S12-cam">${hall(-400, W + 800, '#cdb68c', 880)}
  ${G('S12-pod', `<rect x="-280" y="-120" width="560" height="120" fill="#8a5a32" ${st(6)}/>`, 960, 880, 1)}
  ${G('S12-ch', P.throne(PED), 960, 760, 1.1)}${T('S12-chl', 'ΕΞΟΥΣΙΑ', 960, 365, 56, '#fff', 'middle', 9)}
  ${G('S12-v', CH.voulgaris('s12v', { sash: [PED], arms: 'hold' }), 960, 700, .8)}
  ${[0, 1, 2, 3].map(i => G(`S12-s${i}`, soldier62(`s12s${i}`) + roman, [330, 560, 1360, 1590][i], 920, .78)).join('')}</g>${vign}
  ${T('S12-l', 'ΠΑΡΑΜΟΝΗ ΣΤΗΝ ΕΞΟΥΣΙΑ', 960, 150, 92, YEL, 'middle', 14)}`);

// S13 «Εμπόδιο … πολιτικές ομάδες και θεσμοί» — two blocks drop in his way; bonk
const block = (s, c) => `<g><rect x="-200" y="-320" width="400" height="320" rx="10" fill="${c}" ${st(7)}/>${Array.from({ length: 3 }, (_, r) => `<path d="M -200 ${-80 - r * 80} H 200" stroke="${INK}" stroke-width="4" opacity=".35"/>`).join('')}${txt(s, 0, -136, 52, '#fff', 'middle', `stroke="${INK}" stroke-width="8" paint-order="stroke"`)}</g>`;
shot('S13', cut(13), cut(14), `<g id="S13-cam">${skyW(-400, 2720, 880, '#c9dde6', '#f3efe4', '#c9b98d')}${clouds('S13', [[400, 150, .9], [1500, 120, 1]])}
  ${G('S13-b0', block('ΠΟΛΙΤΙΚΕΣ<tspan x="0" dy="60">ΟΜΑΔΕΣ</tspan>', '#5d7aa8'), 1180, 880, 1)}${G('S13-b1', block('ΘΕΣΜΟΙ', '#8a6a9a'), 1590, 880, 1)}
  ${G('S13-v', CH.voulgaris('s13v', { sash: [PED] }), 560, 900, .95)}
  ${G('S13-stars', [0, 1, 2].map(i => `<path transform="translate(${(i - 1) * 70},${-Math.abs(i - 1) * 20}) scale(.5)" d="M 0 -40 L 10 -12 L 40 0 L 10 12 L 0 40 L -10 12 L -40 0 L -10 -12 Z" fill="${YEL}" ${st(6)}/>`).join(''), 820, 560, 1, 'opacity="0"')}</g>${vign}
  ${T('S13-l', 'ΕΜΠΟΔΙΟ', 960, 160, 110, RED, 'middle', 15)}${T('S13-l2', 'ΣΤΙΣ ΕΠΙΔΙΩΞΕΙΣ ΤΟΥ', 960, 270, 64, '#fff', 'middle', 10)}`);

// S14 «οπαδούς … διοριστεί παράνομα στο στρατό ή στο δημόσιο»
shot('S14', cut(14), cut(15), `<g id="S14-cam">${hall(-400, W + 800, '#d8c0a8', 880)}
  ${G('S14-v', CH.voulgaris('s14v', { sash: [PED], arms: 'hold' }), 330, 900, .95)}
  ${G('S14-s', soldier62('s14s'), 1020, 900, .88)}${G('S14-c', clerk('s14c'), 1500, 900, .88)}
  ${[0, 1].map(i => G(`S14-p${i}`, `${paper(220, 150, '#fbf3dc')}${txt('ΔΙΟΡΙΣΜΟΣ', 0, -26, 40, INK)}<path d="M -80 20 H 80 M -80 46 H 40" stroke="#b9a877" stroke-width="7"/>`, [1020, 1500][i], 470, 1, 'opacity="0"')).join('')}
  ${[0, 1].map(i => G(`S14-st${i}`, P.stamp('ΠΑΡΑΝΟΜΑ', '#C0392B', 300, 50), [1020, 1500][i], 470, 1, 'opacity="0"')).join('')}
  ${[0, 1].map(i => G(`S14-f${i}`, flagP(PED, 80, 54, 200), [1100, 1580][i], 830, 1, 'opacity="0"')).join('')}</g>${vign}
  ${T('S14-l', 'ΟΠΑΔΟΙ', 64, 120, 84, YEL, 'start', 12)}${T('S14-ls', 'ΣΤΡΑΤΟΣ', 1020, 300, 58, '#fff', 'middle', 9)}${T('S14-lc', 'ΔΗΜΟΣΙΟ', 1500, 300, 58, '#fff', 'middle', 9)}`);

// S15 «φοβούνταν μη χάσουν τη θέση τους … κοινοβουλευτικής νομιμότητας» — the sun of legality rises, the chair wobbles
shot('S15', cut(15), cut(16), `<g id="S15-cam">${skyW(-400, 2720, 860, '#f2d29a', '#fbf1dc', '#c9b98d')}
  <defs><radialGradient id="S15-rg"><stop offset="0" stop-color="#fff6c9"/><stop offset="1" stop-color="#ffd54a" stop-opacity="0"/></radialGradient></defs>
  ${G('S15-sun', `<circle r="420" fill="url(#S15-rg)"/><circle r="170" fill="#ffd54a" ${st(7)}/>${Array.from({ length: 12 }, (_, i) => `<path d="M 0 -200 L 0 -260" transform="rotate(${i * 30})" stroke="${INK}" stroke-width="12" stroke-linecap="round"/>`).join('')}`, 1420, 980, 1)}
  <path d="M -400 860 Q 600 780 1100 860 Q 1600 940 2320 860 L 2320 1400 L -400 1400 Z" fill="#c9b98d" ${st(6)}/>
  ${G('S15-ch', chair('#8a5a32', 'ΘΕΣΗ'), 640, 930, 1.2)}
  ${G('S15-c', clerk('s15c', { arms: 'hold' }), 640, 860, .9)}${G('S15-sw', sweat, 760, 520, 1.6, 'opacity="0"')}</g>${vign}
  ${T('S15-l', 'ΦΟΒΟΥΝΤΑΝ', 64, 120, 84, YEL, 'start', 12)}${T('S15-l2', 'ΚΟΙΝΟΒΟΥΛΕΥΤΙΚΗ', 1420, 250, 70, '#fff', 'middle', 11)}${T('S15-l3', 'ΝΟΜΙΜΟΤΗΤΑ', 1420, 350, 84, YEL, 'middle', 12)}`);

// S16 «άνεργους πτυχιούχους και … μικροκαλλιεργητές»
shot('S16', cut(16), cut(17), `<g id="S16-cam">${skyW(-400, 2720, 860, '#bfe0ea', '#f2f7f1', '#c9b98d')}${clouds('S16', [[300, 140, .9], [1500, 120, 1]])}
  ${G('S16-plot', `<rect x="-200" y="-30" width="400" height="90" rx="10" fill="#7a5a38" ${st(5)}/>${[0, 1, 2, 3, 4].map(i => `<path d="M ${-160 + i * 80} -30 q -10 -50 0 -80 q 10 30 0 80" fill="#6aa84f" ${st(3)}/>`).join('')}`, 1350, 900, 1)}
  ${G('S16-g', grad('s16g'), 560, 900, 1)}${G('S16-f', P.villager('s16f'), 1350, 880, 1)}
  ${G('S16-sg', tag('ΑΝΕΡΓΟΣ', '#f3d6d0', 40), 560, 470, 1, 'opacity="0"')}
  ${[0, 1].map(i => G(`S16-fl${i}`, flagP(PED, 90, 60, 230), [700, 1490][i], 860, 1, 'opacity="0"')).join('')}</g>${vign}
  ${T('S16-l', 'ΑΝΕΡΓΟΙ ΠΤΥΧΙΟΥΧΟΙ', 560, 220, 76, '#fff', 'middle', 12)}${T('S16-l2', 'ΜΙΚΡΟΚΑΛΛΙΕΡΓΗΤΕΣ', 1350, 220, 76, YEL, 'middle', 12)}`);

// S17 «Οι ορεινοί … από διάφορες ομάδες (υπό τον Δ. Γρίβα» — groups climb the mountain and join; Grivas on top
shot('S17', cut(17), C.mid17, `<g id="S17-cam">${skyW(-400, 2720, 900, '#a9cfe2', '#eef4f2', ORE)}${clouds('S17', [[260, 200, .9], [1650, 160, 1]])}
  ${G('S17-mt', mountain(ORE, 1.35), 960, 980, 1)}
  ${['#5d7aa8', '#c9661f', '#8a6a9a', '#3E9C94'].map((c, i) => G(`S17-g${i}`, flagP(c, 90, 60, 220), [380, 620, 1320, 1560][i], [900, 760, 760, 900][i], 1, 'opacity="0"')).join('')}
  ${G('S17-big', flagP(ORE, 170, 110, 320), 1250, 170, .8, 'opacity="0"')}
  ${G('S17-gr', CH.grivas('s17gr', { sash: [ORE] }), 1122, 150, .62)}</g>${vign}
  ${T('S17-l', 'ΟΙ ΟΡΕΙΝΟΙ', 64, 120, 88, YEL, 'start', 13)}${T('S17-l2', 'ΔΙΑΦΟΡΕΣ ΟΜΑΔΕΣ', 960, 640, 70, '#fff', 'middle', 11)}${T('S17-n', 'Δ. ΓΡΙΒΑΣ', 720, 290, 80, '#fff', 'middle', 12)}`);

// S18 «με κοινό στόχο την αντίσταση στην πολιτική των πεδινών» — a green push breaks on a brown shield wall
shot('S18', C.mid17, cut(18), `<g id="S18-cam">${skyW(-400, 2720, 880, '#c9dde6', '#f3efe4', '#c9b98d')}
  ${G('S18-ar', `<path d="M -620 -90 L 60 -90 L 60 -190 L 300 0 L 60 190 L 60 90 L -620 90 Z" fill="${PED}" ${st(8)}/>${txt('ΠΟΛΙΤΙΚΗ ΤΩΝ ΠΕΔΙΝΩΝ', -260, 22, 58, '#fff', 'middle', `stroke="${INK}" stroke-width="8" paint-order="stroke"`)}`, 400, 560, 1)}
  ${[0, 1, 2].map(i => G(`S18-sh${i}`, P.shield(ORE), 1300 + i * 30, 360 + i * 200, 1.15)).join('')}
  ${G('S18-gr', CH.grivas('s18gr', { sash: [ORE], start: 'angry' }), 1620, 900, .9)}
  ${G('S18-tg', `<circle r="90" fill="#fff" ${st(7)}/><circle r="60" fill="${RED}" ${st(5)}/><circle r="28" fill="#fff" ${st(5)}/>`, 1620, 240, 1, 'opacity="0"')}</g>${vign}
  ${T('S18-n', 'Δ. ΓΡΙΒΑΣ', 1620, 560, 52, '#fff', 'middle', 8)}${T('S18-l', 'ΚΟΙΝΟΣ ΣΤΟΧΟΣ', 1620, 110, 60, '#fff', 'middle', 10)}${T('S18-l2', 'ΑΝΤΙΣΤΑΣΗ', 820, 290, 110, YEL, 'middle', 15)}`);

// S19 supporters of the ορεινοί: small farmers, herders, merchants, shipowners
const xs19 = [380, 780, 1180, 1580];
shot('S19', cut(18), cut(21), `<g id="S19-cam">${skyW(-400, 2720, 900, '#a9cfe2', '#eef4f2', '#b98a5a')}
  <path d="M -400 900 Q 960 640 2320 900 Z" fill="${ORE}" ${st(6)}/>
  ${G('S19-f', P.villager('s19f'), xs19[0], 860, .82)}${G('S19-h', herder('s19h'), xs19[1], 800, .82)}${G('S19-m', merchant('s19m'), xs19[2], 800, .82)}${G('S19-s', P.shipowner('s19s', { hatC: '#22345e', tasselC: '#D8A93B' }), xs19[3], 860, .82)}
  ${xs19.map((x, i) => G(`S19-fl${i}`, flagP(ORE, 80, 54, 200), x + 70, [800, 740, 740, 800][i], 1, 'opacity="0"')).join('')}
  ${['ΜΙΚΡΟΚΑΛΛΙΕΡΓΗΤΕΣ', 'ΚΤΗΝΟΤΡΟΦΟΙ', 'ΕΜΠΟΡΟΙ', 'ΠΛΟΙΟΚΤΗΤΕΣ'].map((s, i) => T(`S19-t${i}`, s, xs19[i], [430, 370, 370, 430][i], 46, '#fff', 'middle', 8)).join('')}</g>${vign}
  ${T('S19-l', 'ΥΠΟΣΤΗΡΙΚΤΕΣ ΤΩΝ ΟΡΕΙΝΩΝ', 960, 140, 88, YEL, 'middle', 13)}`);

// S20 «Ο λαός συμμετείχε ενεργά» — the square waves green AND brown flags
shot('S20', cut(21), cut(22), `<g id="S20-cam">${skyW(-400, 2720, 880, '#bfe0ea', '#f2f7f1', '#d9c8a4')}
  <rect x="-400" y="300" width="2720" height="580" fill="#e8d6b0" ${st(5)}/>${Array.from({ length: 12 }, (_, i) => `<rect x="${-300 + i * 230}" y="400" width="90" height="140" fill="#7a5a3a" ${st(4)}/>`).join('')}
  ${Array.from({ length: 8 }, (_, i) => G(`S20-p${i}`, people(`s20p${i}`, i, { prop: `<g transform="translate(62,-84)">${flagP(i % 2 ? ORE : PED, 100, 66, 330)}</g>`, start: 'happy' }), 170 + i * 225, 950, .68)).join('')}</g>${vign}
  ${T('S20-l', 'Ο ΛΑΟΣ', 64, 120, 92, YEL, 'start', 13)}${T('S20-l2', 'ΣΥΜΜΕΤΕΙΧΕ ΕΝΕΡΓΑ', 960, 200, 96, '#fff', 'middle', 14)}`);

// S21 «Μικρότερη απήχηση είχαν άλλοι πολιτικοί σχηματισμοί» — two big loudspeakers vs two tiny ones
const horn = c => `<g><path d="M 0 -40 L 160 -130 L 160 130 L 0 40 Z" fill="${c}" ${st(7)}/><rect x="-70" y="-46" width="76" height="92" rx="10" fill="#7a7f88" ${st(6)}/></g>`;
const waveArcs = (p, n = 3) => Array.from({ length: n }, (_, i) => `<path id="${p}-w${i}" d="M ${190 + i * 70} -110 Q ${250 + i * 70} 0 ${190 + i * 70} 110" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round" opacity="0"/>`).join('');
shot('S21', cut(22), cut(23), `<g id="S21-cam">${night('#2f3b4a')}
  ${[[PED, 300, 1.25], [ORE, 300, 1.25], [KOM, 300, .6], [EKL, 300, .6]].map(([c, , s], i) => G(`S21-h${i}`, horn(c) + waveArcs(`S21-h${i}`), [200, 200, 1190, 1190][i], [380, 720, 380, 720][i], s)).join('')}
  ${[0, 1, 2, 3].map(i => G(`S21-m${i}`, `<rect x="0" y="-26" width="420" height="52" rx="26" fill="#efe4c9" ${st(5)}/><rect id="S21-mf${i}" x="5" y="-21" width="0" height="42" rx="21" fill="${[PED, ORE, KOM, EKL][i]}"/>`, [660, 660, 1430, 1430][i], [380, 720, 380, 720][i], 1)).join('')}</g>${vign}
  ${T('S21-l', 'ΜΙΚΡΟΤΕΡΗ ΑΠΗΧΗΣΗ', 960, 170, 88, YEL, 'middle', 13)}${T('S21-l2', 'ΑΛΛΟΙ ΣΧΗΜΑΤΙΣΜΟΙ', 1460, 900, 60, '#fff', 'middle', 10)}`);

// S22 «Το Εθνικόν Κομιτάτον, υπό τον Επαμεινώνδα Δεληγιώργη»
shot('S22', cut(23), cut(25), `<g id="S22-cam">${hall(-400, W + 800, '#e2d2b0', 880)}
  ${G('S22-ban', `<rect x="-480" y="-12" width="960" height="24" rx="12" fill="#7a5232" ${st(5)}/><g id="S22-cloth"><path d="M -440 12 H 440 V 260 L 0 310 L -440 260 Z" fill="${KOM}" ${st(7)}/>${txt('ΕΘΝΙΚΟΝ', 0, 120, 92, '#fff', 'middle', `stroke="${INK}" stroke-width="10" paint-order="stroke"`)}${txt('ΚΟΜΙΤΑΤΟΝ', 0, 230, 92, '#fff', 'middle', `stroke="${INK}" stroke-width="10" paint-order="stroke"`)}</g>`, 960, 90, 1)}
  ${G('S22-d', CH.deligiorgis('s22d', { sash: [KOM] }), 960, 920, 1.08)}</g>${vign}
  ${T('S22-n', 'ΕΠΑΜΕΙΝΩΝΔΑΣ ΔΕΛΗΓΙΩΡΓΗΣ', 960, 500, 76, YEL, 'middle', 12)}`);

// S23 «ανάπτυξη του κοινοβουλευτισμού και τον εκσυγχρονισμό της χώρας» — the Βουλή grows; an ox-cart becomes a locomotive
const cart = `<g><rect x="-160" y="-150" width="320" height="90" rx="8" fill="#9a6b3a" ${st(6)}/><circle cx="-100" cy="-50" r="50" fill="#7a5232" ${st(6)}/><circle cx="100" cy="-50" r="50" fill="#7a5232" ${st(6)}/><path d="M 160 -110 L 280 -110" ${st(8)}/><ellipse cx="330" cy="-130" rx="70" ry="50" fill="#d9c7a0" ${st(6)}/><path d="M 360 -176 l 20 -30 M 316 -176 l -10 -30" ${st(6)}/></g>`;
const loco = `<g><rect x="-200" y="-230" width="140" height="170" rx="8" fill="#2f3b4a" ${st(6)}/><rect x="-60" y="-170" width="290" height="110" rx="50" fill="#3a4a5e" ${st(6)}/><rect x="150" y="-260" width="44" height="90" fill="#2f3b4a" ${st(6)}/><path d="M 230 -60 L 290 0 L 200 0 Z" fill="${RED}" ${st(5)}/>${[-140, -10, 120].map(x => `<circle cx="${x}" cy="-40" r="44" fill="${RED}" ${st(6)}/><circle cx="${x}" cy="-40" r="12" fill="${INK}"/>`).join('')}</g>`;
shot('S23', cut(25), cut(26), `<g id="S23-cam">${skyW(-400, 2720, 860, '#bfe0ea', '#f2f7f1', '#c9b98d')}${clouds('S23', [[300, 140, .9], [1500, 110, 1]])}
  ${G('S23-v', P.building('ΒΟΥΛΗ'), 520, 860, 1.25)}
  <rect x="980" y="860" width="1300" height="18" fill="#7a6a5a" ${st(4)}/>
  ${G('S23-cart', cart, 1430, 860, 1)}${G('S23-loco', loco, 1430, 860, 1.15, 'opacity="0"')}
  ${[0, 1, 2].map(i => G(`S23-sm${i}`, `<circle r="${40 + i * 12}" fill="#efefef" ${st(5)}/>`, 1650, 520, 1, 'opacity="0"')).join('')}
  ${G('S23-d', CH.deligiorgis('s23d', { sash: [KOM] }), 960, 930, .6)}</g>${vign}
  ${T('S23-l', 'ΚΟΙΝΟΒΟΥΛΕΥΤΙΣΜΟΣ', 520, 200, 70, '#fff', 'middle', 11)}${T('S23-l2', 'ΕΚΣΥΓΧΡΟΝΙΣΜΟΣ', 1450, 200, 76, YEL, 'middle', 12)}`);

// S24 «οικονομική ανάπτυξη και μεταρρυθμίσεις στη διοίκηση και στο στρατό» — three cards
const wrench = `<g transform="rotate(-35)"><rect x="-14" y="-10" width="28" height="170" rx="12" fill="#9aa1aa" ${st(5)}/><path d="M -40 -40 Q -46 -90 0 -96 Q 46 -90 40 -40 L 20 -60 L 20 -10 L -20 -10 L -20 -60 Z" fill="#9aa1aa" ${st(5)}/></g>`;
const kepiIcon = `<g transform="translate(0,40) scale(1.1)"><path d="M -74 -262 L -66 -326 Q 0 -336 66 -326 L 74 -262 Z" fill="#1d2a44" ${st(6)} transform="translate(0,262)"/><path d="M -86 0 Q 0 22 86 0 Q 70 14 0 16 Q -70 14 -86 0 Z" fill="#2a2a22" ${st(5)}/></g>`;
shot('S24', cut(26), cut(27), `<g id="S24-cam">${night()}
  ${G('S24-c0', `${card(460, 480)}<path d="M -170 140 H 170 M -170 140 V -160" ${st(7)}/>${[0, 1, 2, 3].map(i => `<rect x="${-140 + i * 80}" y="${130 - (i + 1) * 60}" width="56" height="${(i + 1) * 60}" fill="${GRN}" ${st(5)}/>`).join('')}<path id="S24-ar" d="M -150 80 L -40 0 L 40 30 L 160 -130" fill="none" stroke="${RED}" stroke-width="16" stroke-linecap="round" pathLength="1000" stroke-dasharray="1000 1000" stroke-dashoffset="1000"/>`, 400, 560, 1, 'opacity="0"')}
  ${G('S24-c1', `${card(460, 480)}<g id="S24-gear">${P.gear(110, '#9aa1aa', 10)}</g><g transform="translate(90,90)">${wrench}</g>`, 960, 560, 1, 'opacity="0"')}
  ${G('S24-c2', `${card(460, 480)}${kepiIcon}<g transform="translate(110,110)">${wrench}</g>`, 1520, 560, 1, 'opacity="0"')}
  ${['ΟΙΚΟΝΟΜΙΚΗ ΑΝΑΠΤΥΞΗ', 'ΔΙΟΙΚΗΣΗ', 'ΣΤΡΑΤΟΣ'].map((s, i) => T(`S24-t${i}`, s, [400, 960, 1520][i], 880, 52, '#fff', 'middle', 9)).join('')}</g>${vign}
  ${T('S24-l', 'ΜΕΤΑΡΡΥΘΜΙΣΕΙΣ', 1240, 170, 92, YEL, 'middle', 14)}`);

// S25 «πολιτισμική εξάπλωση στην Οθωμανική αυτοκρατορία» — MAP 1862–64: books fly into Ottoman lands
const M = buildMap({ box: [[390, 10], [1630, 1070]], clip: [[-2600, -2600], [5200, 2700]] });
const pl = { athens: [23.73, 37.98], ioan: [20.85, 39.66], lar: [22.42, 39.64], thess: [22.94, 40.64], kpoli: [28.97, 41.01], smyrna: [27.14, 38.42], crete: [24.9, 35.3] };
const PP = Object.fromEntries(Object.entries(pl).map(([k, v]) => [k, M.pt(v)]));
// the Kingdom 1832–1864 (approx.): south of the Arta–Volos line + Euboea, N. Sporades, Cyclades — Ionian (British till May 1864), Kythera, Crete, Ottoman Aegean excluded
const kRing = 'M' + [[20.97, 36.3], [20.97, 38.62], [20.86, 38.9], [21.15, 39.02], [21.6, 39.0], [22.3, 39.1], [22.8, 39.16], [23.25, 39.12], [23.3, 39.35], [24.95, 39.35], [24.95, 37.5], [25.95, 37.5], [25.95, 36.2], [23.35, 36.2], [23.35, 36.4], [22.8, 36.4], [22.8, 36.3]].map(M.pt).map(p => p.join(',')).join('L') + 'Z';
shot('S25', cut(27), cut(28), `<g id="S25-cam">${seaLand('S25')}
  <use href="#m-main" fill="#2f5fb3" clip-path="url(#c-k1832)" stroke="${INK}" stroke-width="6"/><use href="#m-south" fill="#2f5fb3" clip-path="url(#c-k1832)" stroke="${INK}" stroke-width="6"/>
  <use href="#m-main" fill="#000" filter="url(#paper)" opacity=".3" clip-path="url(#c-k1832)"/>
  ${['ioan', 'lar', 'thess', 'kpoli', 'smyrna', 'crete'].map((k, i) => G(`S25-bk${i}`, `<g transform="scale(.42)">${P.book(['#3e6fb0', '#B8323A', '#6aa84f', '#D8A93B', '#8A5BB0', '#3E9C94'][i])}</g>`, PP.athens[0], PP.athens[1], 1, 'opacity="0"')).join('')}
  ${G('S25-ath', `<circle r="16" fill="#fff" ${st(5)}/>`, PP.athens[0], PP.athens[1], 1)}</g>${vign}
  ${T('S25-l', 'ΠΟΛΙΤΙΣΜΙΚΗ ΕΞΑΠΛΩΣΗ', 64, 120, 80, YEL, 'start', 12)}${T('S25-l2', 'ΟΘΩΜΑΝΙΚΗ ΑΥΤΟΚΡΑΤΟΡΙΑ', 1420, 430, 70, '#fff', 'middle', 12)}`);

// S26 «Οι Εκλεκτικοί … ετερόκλητη … πολιτικών, λογίων και αξιωματικών»
const piece = (c, k) => `<path d="${['M -60 -60 H 0 Q 0 -90 30 -90 Q 60 -90 60 -60 V 60 H -60 Z', 'M -60 -60 H 60 V 0 Q 90 0 90 30 Q 90 60 60 60 H -60 Z', 'M -60 -60 H 60 V 60 H 20 Q 20 20 -20 20 Q -60 20 -60 60 Z'][k]}" fill="${c}" ${st(6)}/>`;
shot('S26', cut(28), cut(30), `<g id="S26-cam">${hall(-400, W + 800, '#c0c8d8', 880)}
  ${G('S26-ban', `<rect x="-420" y="-80" width="840" height="160" rx="16" fill="${EKL}" ${st(7)}/>${txt('ΕΚΛΕΚΤΙΚΟΙ', 0, 34, 100, '#fff', 'middle', `stroke="${INK}" stroke-width="10" paint-order="stroke"`)}`, 960, 170, 1)}
  ${G('S26-a', P.minister('s26a', { sash: [EKL] }), 520, 910, .9)}${G('S26-b', scholar('s26b', { sash: [EKL] }), 960, 910, .9)}${G('S26-c', soldier62('s26c', { sash: [EKL] }), 1400, 910, .9)}
  ${['ΠΟΛΙΤΙΚΟΙ', 'ΛΟΓΙΟΙ', 'ΑΞΙΩΜΑΤΙΚΟΙ'].map((s, i) => T(`S26-t${i}`, s, [520, 960, 1400][i], 450, 54, '#fff', 'middle', 9)).join('')}
  ${[0, 1, 2].map(i => G(`S26-pz${i}`, piece(['#e8a23b', '#5d7aa8', '#6aa84f'][i], i), [1460, 1570, 1680][i], 200, .7, 'opacity="0"')).join('')}</g>${vign}
  ${T('S26-l', 'ΕΤΕΡΟΚΛΗΤΗ', 1560, 340, 62, YEL, 'middle', 10)}`);

// S27 «μετριοπαθείς … να μεσολαβεί … και να υποστηρίζει σταθερές κυβερνήσεις» — he levels the seesaw, then steadies the table
shot('S27', cut(30), cut(32), `<g id="S27-cam">${skyW(-400, 3800, 880, '#c9dde6', '#f3efe4', '#c9b98d')}
  ${G('S27-ful', `<path d="M -60 0 L 0 -110 L 60 0 Z" fill="#7a5232" ${st(6)}/>`, 760, 880, 1)}
  ${G('S27-see', `<rect x="-560" y="-16" width="1120" height="32" rx="12" fill="#a87444" ${st(6)}/>
     <g transform="translate(-420,-16)">${flagP(PED, 110, 72, 230)}<rect x="-80" y="-90" width="160" height="90" rx="10" fill="${PED}" ${st(6)}/></g>
     <g transform="translate(420,-16)">${flagP(ORE, 110, 72, 230)}<rect x="-80" y="-90" width="160" height="90" rx="10" fill="${ORE}" ${st(6)}/></g>`, 760, 770, 1)}
  ${G('S27-e', P.minister('s27e', { sash: [EKL] }), -100, 754, .62)}
  ${G('S27-tab', table('ΚΥΒΕΡΝΗΣΗ'), 2200, 880, 1.2)}${G('S27-e2', P.minister('s27e2', { sash: [EKL], arms: 'hold' }), 2560, 900, .85)}</g>${vign}
  ${T('S27-l', 'ΜΕΤΡΙΟΠΑΘΕΙΣ ΘΕΣΕΙΣ', 64, 120, 76, YEL, 'start', 12)}${T('S27-l2', 'ΜΕΣΟΛΑΒΕΙ', 960, 230, 92, '#fff', 'middle', 14)}${T('S27-l3', 'ΣΤΑΘΕΡΕΣ ΚΥΒΕΡΝΗΣΕΙΣ', 960, 230, 92, YEL, 'middle', 14)}`);

// S28 «κυβερνητικής αστάθειας και εμφυλίου πολέμου» — a merry-go-round of government chairs; pan → green vs brown clash
shot('S28', cut(32), cut(33), `<g id="S28-cam">${skyW(-400, 4000, 880, '#e8b28a', '#f6dcc4', '#a88a62')}
  ${G('S28-rot', `<circle r="300" fill="none" stroke="${INK}" stroke-width="6" stroke-dasharray="20 16"/>${[0, 1, 2, 3].map(i => `<g id="S28-ch${i}">${chair(['#8a5a32', '#6e4524', '#a87444', '#5a3a1e'][i], 'ΚΥΒ.')}</g>`).join('')}`, 760, 560, 1)}
  ${[0, 1, 2].map(i => G(`S28-a${i}`, soldier62(`s28a${i}`, { sash: [PED, PED], start: 'angry', chest: `<circle cx="0" cy="-110" r="26" fill="${PED}" stroke="${INK}" stroke-width="4"/>` }), 1840 + i * 150, 920, .7)).join('')}
  ${[0, 1, 2].map(i => G(`S28-b${i}`, soldier62(`s28b${i}`, { sash: [ORE, ORE], start: 'angry', chest: `<circle cx="0" cy="-110" r="26" fill="${ORE}" stroke="${INK}" stroke-width="4"/>` }), 2560 + i * 150, 920, .7)).join('')}
  ${G('S28-fa', flagP(PED, 170, 110, 380), 1700, 900, 1)}${G('S28-fb', flagP(ORE, 170, 110, 380), 3030, 900, 1)}
  ${[0, 1, 2, 3, 4].map(i => G(`S28-sm${i}`, `<circle r="${60 + (i % 3) * 20}" fill="#e9e4da" ${st(5)}/>`, 2300 + (i - 2) * 90, 520 - (i % 2) * 80, 1, 'opacity="0"')).join('')}</g>${vign}
  ${T('S28-l', 'ΚΥΒΕΡΝΗΤΙΚΗ ΑΣΤΑΘΕΙΑ', 960, 150, 88, '#fff', 'middle', 13)}${T('S28-l2', 'ΕΜΦΥΛΙΟΣ ΠΟΛΕΜΟΣ', 960, 150, 104, RED, 'middle', 15)}`);

// S29 «χρειάστηκε δύο ολόκληρα χρόνια για να φτάσει στην ψήφιση συντάγματος» — waiting: pages fly, cobwebs, beards grow; ✓
shot('S29', cut(33), cut(34), `<g id="S29-cam">${hall(-400, W + 800, '#cbb892', 880)}
  <path id="S29-web" d="M 1700 -10 Q 1760 120 1930 140 M 1760 -10 L 1930 90 M 1820 -10 Q 1850 40 1930 40 M 1716 40 Q 1800 60 1860 -10 M 1740 100 Q 1830 110 1880 -10" fill="none" stroke="#fff" stroke-width="4" opacity="0"/>
  ${G('S29-b', bench(0, 0, 900), 860, 900, 1)}
  ${[0, 1, 2].map(i => G(`S29-d${i}`, dep(`s29d${i}`, i + 1) + `<g id="S29-bd${i}" opacity="0"><path d="M -64 -198 Q -62 -96 0 -70 Q 62 -96 64 -198 Q 52 -168 22 -164 Q 0 -162 -22 -164 Q -52 -168 -64 -198 Z" fill="#d9d4ca" stroke="${INK}" stroke-width="4"/></g>`, 610 + i * 250, 850, .72)).join('')}
  ${Array.from({ length: 6 }, (_, i) => G(`S29-pg${i}`, `${card(150, 170, '#fbf8f0')}<rect x="-75" y="-85" width="150" height="40" rx="12" fill="${RED}" ${st(5)}/>`, 1500, 520, 1, 'opacity="0"')).join('')}
  ${G('S29-sc', `<g transform="scale(1.3)">${P.scroll('ΣΥΝΤΑΓΜΑ', 420)}</g>`, 1450, 560, 1, 'opacity="0"')}${G('S29-tk', tick(GRN, 90), 1720, 470, 1, 'opacity="0"')}</g>${vign}
  ${T('S29-l', 'ΔΥΟ ΟΛΟΚΛΗΡΑ ΧΡΟΝΙΑ', 960, 160, 100, YEL, 'middle', 14)}${T('S29-l2', 'ΨΗΦΙΣΗ ΣΥΝΤΑΓΜΑΤΟΣ', 1450, 330, 66, '#fff', 'middle', 10)}`);

// S30 «βασιλευομένη δημοκρατία αντί της … συνταγματικής μοναρχίας» — the crown rests on a cushion the PEOPLE hold up
shot('S30', cut(34), cut(35), `<g id="S30-cam">${skyW(-400, 2720, 880, '#bfe0ea', '#f2f7f1', '#c9b98d')}${clouds('S30', [[300, 150, .9], [1600, 120, 1]])}
  ${G('S30-cush', `<path d="M -240 -40 Q 0 -90 240 -40 Q 260 0 240 20 Q 0 60 -240 20 Q -260 0 -240 -40 Z" fill="#B8323A" ${st(7)}/>${[-240, 240].map(x => `<circle cx="${x}" cy="0" r="22" fill="${GOLD}" ${st(5)}/>`).join('')}`, 760, 820, 1)}
  ${G('S30-cr', `<path d="M -110 0 L -126 -126 L -66 -64 L -34 -150 L 0 -74 L 34 -150 L 66 -64 L 126 -126 L 110 0 Q 0 -20 -110 0 Z" fill="#F2C14E" ${st(7)}/>${[-60, 0, 60].map((x, i) => `<circle cx="${x}" cy="-24" r="13" fill="${i === 1 ? '#c0392b' : '#2b5fa8'}" ${st(4)}/>`).join('')}`, 760, 775, 1)}
  ${[0, 1, 2, 3].map(i => G(`S30-p${i}`, people(`s30p${i}`, i, { arms: 'up' }), 460 + i * 200, 1010, .78)).join('')}
  ${G('S30-old', `${card(660, 200, '#e9e1cf')}${txt('ΣΥΝΤΑΓΜΑΤΙΚΗ', 0, -14, 56, '#6a6458')}${txt('ΜΟΝΑΡΧΙΑ', 0, 60, 56, '#6a6458')}`, 1520, 640, 1, 'opacity="0"')}${G('S30-x', `<path d="M -290 -12 L 290 -12" stroke="${INK}" stroke-width="20" stroke-linecap="round"/><path d="M -290 -12 L 290 -12" stroke="${RED}" stroke-width="10" stroke-linecap="round"/>`, 1520, 640, 1, 'opacity="0"')}</g>${vign}
  ${T('S30-l0', 'ΠΟΛΙΤΕΥΜΑ', 64, 120, 76, '#fff', 'start', 12)}${T('S30-l', 'ΒΑΣΙΛΕΥΟΜΕΝΗ ΔΗΜΟΚΡΑΤΙΑ', 760, 300, 88, YEL, 'middle', 14)}${T('S30-l2', 'ΑΝΤΙ', 1520, 470, 70, '#fff', 'middle', 11)}`);

// S31 «η αρχή της λαϊκής κυριαρχίας» — the people raise the sceptre
const sceptreBig = `<g><rect x="-16" y="-620" width="32" height="620" rx="12" fill="${GOLD}" ${st(7)}/><circle cx="0" cy="-660" r="64" fill="#F2C14E" ${st(7)}/><path d="M -40 -720 L 0 -800 L 40 -720 Z" fill="#F2C14E" ${st(6)}/></g>`;
shot('S31', cut(35), cut(36), `<g id="S31-cam">${night('#2a3446')}
  ${G('S31-rays', Array.from({ length: 16 }, (_, i) => `<path d="M 0 0 L ${Math.cos(i * Math.PI / 8) * 1400} ${Math.sin(i * Math.PI / 8) * 1400} L ${Math.cos(i * Math.PI / 8 + .1) * 1400} ${Math.sin(i * Math.PI / 8 + .1) * 1400} Z" fill="#ffe27a" opacity=".16"/>`).join(''), 960, 300, 1, 'opacity="0"')}
  ${G('S31-sc', sceptreBig, 960, 900, 1)}
  ${[0, 1, 2, 3, 4].map(i => G(`S31-p${i}`, people(`s31p${i}`, i, { arms: 'up', start: 'happy' }), [560, 760, 1160, 1360, 960][i], [1010, 990, 990, 1010, 1060][i], [.72, .72, .72, .72, .5][i])).join('')}</g>${vign}
  ${T('S31-l0', 'ΚΑΤΟΧΥΡΩΘΗΚΑΝ', 64, 120, 70, '#fff', 'start', 11)}${T('S31-l', 'ΛΑΪΚΗ ΚΥΡΙΑΡΧΙΑ', 1450, 330, 92, YEL, 'middle', 14)}`);

// S32 «άμεση, μυστική και καθολική (για τον ανδρικό πληθυσμό) ψήφος με σφαιρίδια» — the 1864 ball box
shot('S32', cut(36), cut(38), `<g id="S32-cam">${hall(-400, W + 800, '#d9c8a4', 880)}
  ${G('S32-box', P.ballBox('S32b'), 1060, 880, 1.25)}
  ${G('S32-v', P.citizen('s32v', { arms: 'up' }), 600, 900, 1.05)}${G('S32-ball', `<circle r="14" fill="#6e747c" ${st(4)}/>`, 520, 600, 1.3)}
  ${['ΑΜΕΣΗ', 'ΜΥΣΤΙΚΗ', 'ΚΑΘΟΛΙΚΗ'].map((s, i) => G(`S32-t${i}`, tag(s, '#fbf3dc', 52), 1580, 330 + i * 110, 1, 'opacity="0"')).join('')}
  ${G('S32-t3', tag('(ΓΙΑ ΤΟΝ ΑΝΔΡΙΚΟ ΠΛΗΘΥΣΜΟ)', '#efe4c9', 40), 1580, 640, 1, 'opacity="0"')}</g>${vign}
  ${T('S32-l', 'ΨΗΦΟΣ ΜΕ ΣΦΑΙΡΙΔΙΑ', 64, 120, 84, YEL, 'start', 12)}`);

// S33 «ανεξαρτησία της δικαιοσύνης … συνέρχεσθαι και συνεταιρίζεσθαι»
shot('S33', cut(38), cut(39), `<g id="S33-cam">${skyW(-400, 3800, 880, '#c9dde6', '#f3efe4', '#c9b98d')}
  ${G('S33-bal', P.balance(), 640, 880, 1.15)}
  ${G('S33-cr', `<path d="M -66 0 L -76 -76 L -40 -38 L -20 -90 L 0 -44 L 20 -90 L 40 -38 L 76 -76 L 66 0 Q 0 -12 -66 0 Z" fill="#F2C14E" ${st(6)}/>`, 160, 320, 1)}
  ${[0, 1, 2, 3, 4].map(i => G(`S33-ln${i}`, `<ellipse rx="26" ry="16" fill="none" stroke="#7a7f88" stroke-width="10"/>`, 230 + i * 70, 340 + i * 40, 1)).join('')}
  ${[0, 1, 2, 3].map(i => G(`S33-p${i}`, people(`s33p${i}`, i, { start: 'happy' }), 1920 + i * 170, 920, .7)).join('')}
  ${G('S33-ring', `<ellipse rx="420" ry="90" fill="none" stroke="${YEL}" stroke-width="12" stroke-dasharray="30 20"/>`, 2175, 930, 1, 'opacity="0"')}</g>${vign}
  ${T('S33-l', 'ΑΝΕΞΑΡΤΗΣΙΑ ΤΗΣ ΔΙΚΑΙΟΣΥΝΗΣ', 960, 150, 84, '#fff', 'middle', 13)}${T('S33-l2', 'ΣΥΝΕΡΧΕΣΘΑΙ', 960, 150, 96, YEL, 'middle', 14)}${T('S33-l3', 'ΣΥΝΕΤΑΙΡΙΖΕΣΘΑΙ', 960, 270, 84, '#fff', 'middle', 13)}`);

// S34 «άνοιγε το δρόμο για την ελεύθερη συγκρότηση κομμάτων» — the barrier lifts, party banners march
shot('S34', cut(39), cut(40), `<g id="S34-cam">${skyW(-400, 2720, 760, '#bfe0ea', '#f2f7f1', '#9fbf6a')}
  <path d="M 700 760 L 1220 760 L 2320 1400 L -400 1400 Z" fill="#c9b48a" ${st(6)}/><path d="M 960 780 L 960 1400" stroke="#fff" stroke-width="14" stroke-dasharray="50 40"/>
  ${G('S34-post', `<rect x="-20" y="-200" width="40" height="200" fill="#7a5232" ${st(5)}/>`, 600, 900, 1)}
  ${G('S34-bar', `<rect x="0" y="-22" width="760" height="44" rx="10" fill="#fff" ${st(6)}/>${[0, 1, 2, 3].map(i => `<rect x="${60 + i * 180}" y="-22" width="80" height="44" fill="${RED}"/>`).join('')}<rect x="0" y="-22" width="760" height="44" rx="10" fill="none" ${st(6)}/>`, 600, 740, 1)}
  ${[PED, ORE, KOM, EKL].map((c, i) => G(`S34-f${i}`, flagP(c, 150, 100, 320), 960, 860, 1, 'opacity="0"')).join('')}</g>${vign}
  ${T('S34-l', 'ΑΝΟΙΓΕ ΤΟ ΔΡΟΜΟ', 64, 120, 80, YEL, 'start', 12)}${T('S34-l2', 'ΕΛΕΥΘΕΡΗ ΣΥΓΚΡΟΤΗΣΗ ΚΟΜΜΑΤΩΝ', 960, 300, 80, '#fff', 'middle', 12)}`);

// S35 «τα κόμματα … απαραίτητα για την έκφραση … της κοινής γνώμης» — voices pour into a megaphone «ΚΟΜΜΑΤΑ» aimed at the Βουλή
shot('S35', cut(40), cut(41), `<g id="S35-cam">${skyW(-400, 2720, 880, '#c9dde6', '#f3efe4', '#c9b98d')}
  ${[0, 1, 2, 3].map(i => G(`S35-p${i}`, people(`s35p${i}`, i, { start: 'happy' }), 140 + i * 150, 940, .62)).join('')}
  ${[0, 1, 2, 3, 4].map(i => G(`S35-bb${i}`, P.bubble(120, 80, -30, 70, `<path d="M -30 0 q 10 -16 20 0 q 10 16 20 0" fill="none" stroke="${INK}" stroke-width="5"/>`), 300, 520, .8, 'opacity="0"')).join('')}
  ${G('S35-mg', `<g transform="scale(1.6)">${horn(GOLD)}</g>${txt('ΚΟΜΜΑΤΑ', 120, 20, 66, '#fff', 'middle', `stroke="${INK}" stroke-width="8" paint-order="stroke"`)}`, 900, 560, 1)}
  <g transform="translate(1000,560)">${waveArcs('S35-mw', 3)}</g>
  ${G('S35-v', P.building('ΒΟΥΛΗ'), 1640, 880, 1.2)}</g>${vign}
  ${T('S35-l', 'ΑΠΑΡΑΙΤΗΤΑ', 960, 160, 100, YEL, 'middle', 14)}${T('S35-l2', 'ΚΟΙΝΗ ΓΝΩΜΗ', 360, 300, 76, '#fff', 'middle', 12)}`);

// S36 «η εναλλακτική λύση είναι οι συνωμοτικοί κύκλοι ή οι βιαιοπραγίες»
const hooded = (i) => `<g><path d="M -70 0 Q -80 -200 0 -260 Q 80 -200 70 0 Z" fill="#2a2630" ${st(6)}/><path d="M -46 -150 Q 0 -230 46 -150 Q 30 -120 0 -120 Q -30 -120 -46 -150 Z" fill="#14121a"/><circle cx="-14" cy="-160" r="5" fill="#fff"/><circle cx="14" cy="-160" r="5" fill="#fff"/></g>`;
const club = `<g><path d="M -12 0 L -20 -170 Q 0 -200 20 -170 L 12 0 Z" fill="#8a6a46" ${st(5)}/></g>`;
shot('S36', cut(41), cut(42), `<g id="S36-cam">${skyW(-400, 2720, 880, '#9aa9b8', '#dfe2e2', '#a89878')}
  ${G('S36-sp', `${P.signpost('ΕΝΑΛΛΑΚΤΙΚΗ', -1, '#f1e2bc')}<g transform="translate(0,90)">${P.signpost('ΛΥΣΗ', 1, '#f1e2bc')}</g>`, 960, 900, 1.1)}
  ${[0, 1, 2, 3].map(i => G(`S36-h${i}`, hooded(i), 420 + Math.cos(i * Math.PI / 2) * 150, 860 + Math.sin(i * Math.PI / 2) * 30, .9)).join('')}
  ${G('S36-cl', `<path d="M -220 0 Q -260 -120 -150 -170 Q -100 -280 20 -230 Q 140 -280 190 -170 Q 280 -120 220 0 Z" fill="#e9e4da" ${st(7)}/>${[0, 1, 2].map(i => `<g transform="translate(${(i - 1) * 110},-80) rotate(${(i - 1) * 30})">${club}</g>`).join('')}`, 1500, 860, 1)}
  ${G('S36-x0', xMark(RED, 80, 26), 420, 620, 1, 'opacity="0"')}${G('S36-x1', xMark(RED, 80, 26), 1500, 620, 1, 'opacity="0"')}</g>${vign}
  ${T('S36-l', 'ΣΥΝΩΜΟΤΙΚΟΙ ΚΥΚΛΟΙ', 420, 260, 66, '#fff', 'middle', 11)}${T('S36-l2', 'ΒΙΑΙΟΠΡΑΓΙΕΣ', 1500, 260, 76, '#fff', 'middle', 12)}`);

// S37 «Παρά την έντονη αντίδραση του βασιλιά Γεωργίου του Πρώτου» — George I stamps his foot
shot('S37', cut(42), cut(43), `<g id="S37-cam">${hall(-400, W + 800, '#c9b0d0', 880)}
  ${G('S37-th', P.throne(BLUE), 1240, 880, 1.25)}
  ${G('S37-g', CH.georgeI('s37g'), 900, 900, 1.2)}
  ${[0, 1, 2].map(i => G(`S37-st${i}`, `<circle r="${30 + i * 8}" fill="#fff" ${st(5)}/>`, 860 + (i - 1) * 70, 400, 1, 'opacity="0"')).join('')}</g>${vign}
  ${T('S37-n', 'ΓΕΩΡΓΙΟΣ Α΄', 1450, 300, 92, '#fff', 'middle', 14)}${T('S37-l', 'ΕΝΤΟΝΗ ΑΝΤΙΔΡΑΣΗ', 64, 120, 80, RED, 'start', 12)}`);

// S38 «η Εθνοσυνέλευση επέβαλε την αρχή να προέρχεται η κυβέρνηση από την κοινοβουλευτική πλειοψηφία»
const gavel = `<g><rect x="-14" y="-10" width="28" height="200" rx="10" fill="#8a5a32" ${st(5)}/><rect x="-90" y="-60" width="180" height="70" rx="16" fill="#6e4524" ${st(6)}/></g>`;
shot('S38', cut(43), cut(44), `<g id="S38-cam">${hall(-400, W + 800, '#d9c8a4', 880)}
  ${G('S38-gav', gavel, 1650, 420, 1, 'opacity="0"')}
  ${[0, 1, 2, 3, 4].map(i => G(`S38-m${i}`, dep(`s38m${i}`, i, { arms: 'up' }), 380 + i * 150, 930, .64)).join('')}
  ${[0, 1].map(i => G(`S38-n${i}`, dep(`s38n${i}`, i + 3), 1500 + i * 150, 930, .64)).join('')}
  ${G('S38-ch', chair('#B8323A', 'ΚΥΒ.'), 680, 600, 1.1, 'opacity="0"')}</g>${vign}
  ${T('S38-l', 'ΕΠΕΒΑΛΕ', 64, 120, 96, YEL, 'start', 14)}${T('S38-l2', 'ΚΟΙΝΟΒΟΥΛΕΥΤΙΚΗ ΠΛΕΙΟΨΗΦΙΑ', 960, 200, 78, '#fff', 'middle', 12)}${T('S38-l3', 'ΚΥΒΕΡΝΗΣΗ', 680, 285, 60, YEL, 'middle', 10)}`);

// S39 «Αυτό που δεν ορίστηκε με σαφήνεια, διότι θεωρήθηκε αυτονόητο» — one clause of the constitution is foggy
shot('S39', cut(44), cut(46), `<g id="S39-cam">${night('#33405a')}
  ${G('S39-doc', `${paper(760, 640, '#fbf3dc')}${txt('ΣΥΝΤΑΓΜΑ', 0, -230, 76, INK)}${[0, 1, 2, 3, 4].map(i => `<path d="M -300 ${-140 + i * 80} H ${[300, 240, 300, 200, 280][i]}" stroke="#b9a877" stroke-width="16" stroke-linecap="round"/>`).join('')}
     <g id="S39-fog" opacity="0">${[-200, -60, 80, 220].map((x, i) => `<circle cx="${x}" cy="${100 + (i % 2) * 16}" r="${90 + (i % 2) * 20}" fill="#d9dde2" ${st(4)}/>`).join('')}</g>`, 760, 560, 1)}
  ${[0, 1].map(i => G(`S39-d${i}`, dep(`s39d${i}`, i + 2, { arms: 'up' }), 1450 + i * 220, 1000, .7)).join('')}
  ${G('S39-bb', P.bubble(260, 170, -60, 140, tick(GRN, 46)), 1560, 470, 1, 'opacity="0"')}</g>${vign}
  ${T('S39-l', 'ΔΕΝ ΟΡΙΣΤΗΚΕ ΜΕ ΣΑΦΗΝΕΙΑ', 760, 150, 80, '#fff', 'middle', 13)}${T('S39-l2', 'ΑΥΤΟΝΟΗΤΟ', 1560, 260, 88, YEL, 'middle', 14)}`);

// S40 «ο βασιλιάς όφειλε να δώσει την εντολή … σε βουλευτή του κόμματος … πλειοψηφίας της Βουλής»
const envelope = (s = 'ΕΝΤΟΛΗ') => `<g><rect x="-110" y="-70" width="220" height="140" rx="8" fill="#fbf8f0" ${st(6)}/><path d="M -110 -70 L 0 10 L 110 -70" fill="none" ${st(5)}/><circle cx="0" cy="12" r="20" fill="#B8323A" ${st(4)}/>${txt(s, 0, 60, 30, INK)}</g>`;
shot('S40', cut(46), cut(47), `<g id="S40-cam">${hall(-400, 3200, '#d2c09a', 880)}
  ${G('S40-g', CH.georgeI('s40g', { arms: 'hold' }), 360, 900, 1.05)}${G('S40-env', envelope(), 470, 760, 1, 'opacity="0"')}
  ${G('S40-big', `<rect x="-420" y="-90" width="840" height="90" rx="10" fill="#8a5a32" ${st(6)}/>`, 1600, 880, 1)}
  ${[0, 1, 2, 3, 4].map(i => G(`S40-m${i}`, dep(`s40m${i}`, i), 1280 + i * 160, 800, .6)).join('')}
  ${G('S40-lead', dep('s40lead', 2, { arms: 'up', sash: [YEL] }), 1600, 790, .82)}
  ${G('S40-sm', `<rect x="-160" y="-60" width="320" height="60" rx="10" fill="#8a5a32" ${st(6)}/>`, 2350, 880, 1)}${[0, 1].map(i => G(`S40-n${i}`, dep(`s40n${i}`, i + 4), 2280 + i * 140, 830, .6)).join('')}
  ${G('S40-bar', `<rect x="0" y="0" width="760" height="50" rx="25" fill="#efe4c9" ${st(6)}/><rect id="S40-fill" x="5" y="5" width="0" height="40" rx="20" fill="${YEL}"/><path d="M 380 -14 V 64" stroke="${INK}" stroke-width="6" stroke-dasharray="10 8"/>`, 1220, 300, 1, 'opacity="0"')}</g>${vign}
  ${T('S40-l', 'ΟΦΕΙΛΕ', 64, 120, 92, YEL, 'start', 14)}${T('S40-l2', 'ΕΝΤΟΛΗ ΣΧΗΜΑΤΙΣΜΟΥ ΚΥΒΕΡΝΗΣΗΣ', 960, 210, 72, '#fff', 'middle', 11)}${T('S40-l3', 'ΠΛΕΙΟΨΗΦΙΑ ΤΗΣ ΒΟΥΛΗΣ', 1380, 260, 70, YEL, 'middle', 11)}`);

// S41 the same sentence again (the book repeats it) — the rule seen from above: the hemicycle
const seats = Array.from({ length: 5 }, (_, r) => Array.from({ length: 9 + r * 2 }, (_, k) => { const n = 9 + r * 2, a = Math.PI * (1 - (k + .5) / n), R = 220 + r * 90; return [Math.cos(a) * R, -Math.sin(a) * R, k / (n - 1)]; })).flat();
shot('S41', cut(47), cut(48), `<g id="S41-cam">${night('#2f3b4a')}${stars('S41')}
  ${G('S41-hemi', seats.map(([x, y, f], i) => `<circle id="S41-s${i}" data-f="${f.toFixed(3)}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="26" fill="#8a8f98" ${st(4)}/>`).join(''), 960, 800, 1)}
  ${G('S41-cr', `<path d="M -66 0 L -76 -76 L -40 -38 L -20 -90 L 0 -44 L 20 -90 L 40 -38 L 76 -76 L 66 0 Q 0 -12 -66 0 Z" fill="#F2C14E" ${st(6)}/>`, 960, 860, .9)}
  <path id="S41-arr" d="M 960 780 Q 820 560 640 470" fill="none" stroke="${YEL}" stroke-width="14" stroke-linecap="round" marker-end="url(#ah)" pathLength="1000" stroke-dasharray="1000 1000" stroke-dashoffset="1000"/>
  ${G('S41-lead', dep('s41lead', 2, { arms: 'up', sash: [YEL] }), 640, 520, .36, 'opacity="0"')}${G('S41-rep', `<path d="M 40 -10 A 44 44 0 1 0 30 34" fill="none" stroke="#fff" stroke-width="14" stroke-linecap="round"/><path d="M 22 -40 L 52 -8 L 12 4 Z" fill="#fff"/>`, 1800, 130, 1, 'opacity="0"')}</g>${vign}
  ${T('S41-l', 'ΕΝΤΟΛΗ', 330, 330, 70, YEL, 'middle', 11)}${T('S41-l2', 'ΠΛΕΙΟΨΗΦΙΑ', 960, 160, 96, '#fff', 'middle', 14)}`);

// S42 «εκμεταλλεύτηκε αυτήν την ασάφεια … κυβερνήσεις της αρεσκείας του»
shot('S42', cut(48), cut(50), `<g id="S42-cam">${hall(-400, W + 800, '#c9b0d0', 880)}
  ${G('S42-fog', [-260, -90, 80, 250, -170, 160].map((x, i) => `<circle cx="${x}" cy="${i > 3 ? -110 : 0}" r="${130 + (i % 3) * 30}" fill="#e3e6ea" ${st(5)}/>`).join(''), 1300, 560, 1)}
  ${G('S42-g', CH.georgeI('s42g', { arms: 'hold' }), 520, 900, 1.05)}
  ${G('S42-ch', chair('#B8323A', 'ΚΥΒ.'), 860, 930, 1.05)}
  ${G('S42-m', P.minister('s42m', { start: 'happy' }), 1300, 700, .5)}
  ${[0, 1, 2].map(i => G(`S42-h${i}`, heart('#e06a8a'), 640 + i * 110, 300 - (i % 2) * 40, .9, 'opacity="0"')).join('')}</g>${vign}
  ${T('S42-l', 'ΑΣΑΦΕΙΑ', 1300, 250, 100, '#fff', 'middle', 15)}${T('S42-l2', 'ΤΗΣ ΑΡΕΣΚΕΙΑΣ ΤΟΥ', 64, 120, 80, YEL, 'start', 12)}`);

// S43 «μέχρι την ψήφιση της αρχής της δεδηλωμένης το 1875» — the stamp
shot('S43', cut(50), cut(51), `<g id="S43-cam">${night('#2f3b4a')}${stars('S43')}
  ${G('S43-doc', `${paper(900, 560, '#fbf3dc')}${[0, 1, 2, 3, 4].map(i => `<path d="M -360 ${-180 + i * 80} H ${[360, 300, 360, 260, 340][i]}" stroke="#b9a877" stroke-width="16" stroke-linecap="round"/>`).join('')}`, 960, 600, 1)}
  ${G('S43-st', P.stamp('ΑΡΧΗ ΤΗΣ ΔΕΔΗΛΩΜΕΝΗΣ', '#C0392B', 860, 76), 960, 600, 1, 'opacity="0"')}</g>${vign}
  ${T('S43-d', '1875', 64, 130, 110, YEL, 'start', 15)}${T('S43-l', 'ΨΗΦΙΣΗ', 960, 220, 84, '#fff', 'middle', 13)}`);

// S44 «Η ιδέα ανήκε στον νέο τότε πολιτικό Χαρίλαο Τρικούπη»
shot('S44', cut(51), cut(52), `<g id="S44-cam">${skyW(-400, 2720, 880, '#bfe0ea', '#f2f7f1', '#c9b98d')}${clouds('S44', [[300, 150, .9], [1600, 120, 1]])}
  ${G('S44-t', CH.trikoupis('s44t'), 960, 920, 1.3)}${G('S44-bulb', P.bulb(), 960, 330, 1.2, 'opacity="0"')}</g>${vign}
  ${T('S44-l', 'Η ΙΔΕΑ', 64, 120, 92, YEL, 'start', 14)}${T('S44-n', 'ΧΑΡΙΛΑΟΣ ΤΡΙΚΟΥΠΗΣ', 1440, 430, 80, '#fff', 'middle', 13)}${T('S44-l2', 'ΝΕΟΣ ΤΟΤΕ ΠΟΛΙΤΙΚΟΣ', 1440, 530, 56, YEL, 'middle', 9)}`);

// S45 «υποστήριξε δημόσια … πολιτικής αστάθειας … δύο μεγάλων κομμάτων εξουσίας»
const pillar = (s, c) => `<g><rect x="-110" y="-520" width="220" height="520" fill="${c}" ${st(7)}/>${[-60, 0, 60].map(x => `<path d="M ${x} -500 V -20" stroke="${INK}" stroke-width="4" opacity=".3"/>`).join('')}<rect x="-140" y="-560" width="280" height="50" rx="8" fill="#efe4c9" ${st(6)}/><rect x="-140" y="-20" width="280" height="40" rx="8" fill="#efe4c9" ${st(6)}/>${txt(s, 0, -260, 52, '#fff', 'middle', `stroke="${INK}" stroke-width="8" paint-order="stroke"`)}</g>`;
shot('S45', cut(52), cut(53), `<g id="S45-cam">${hall(-400, 3200, '#d9c8a4', 880)}
  ${G('S45-t', CH.trikoupis('s45t', { arms: 'hold' }), 420, 900, 1.05)}${G('S45-np', `<g transform="scale(.8)">${P.newspaper('ΕΦΗΜΕΡΙΣ')}</g>`, 560, 640, 1, 'opacity="0"')}
  ${Array.from({ length: 6 }, (_, i) => G(`S45-c${i}`, chair(['#8a5a32', '#6e4524', '#a87444', '#5a3a1e', '#8a5a32', '#6e4524'][i]), 950 + i * 130, 880, .62)).join('')}
  ${[0, 1].map(i => G(`S45-p${i}`, pillar('ΚΟΜΜΑ', ['#5d7aa8', '#b0563a'][i]), [1050, 1450][i], 880, 1, 'opacity="0"')).join('')}</g>${vign}
  ${T('S45-l0', 'ΔΗΜΟΣΙΑ', 64, 120, 80, YEL, 'start', 12)}${T('S45-l', 'ΠΟΛΙΤΙΚΗ ΑΣΤΑΘΕΙΑ', 1300, 300, 76, '#fff', 'middle', 12)}${T('S45-l2', 'ΔΥΟ ΜΕΓΑΛΑ ΚΟΜΜΑΤΑ ΕΞΟΥΣΙΑΣ', 960, 200, 80, YEL, 'middle', 12)}`);

// S46 «σύμφωνα με το πρότυπο της Αγγλίας» — John Bull before a Gothic hall with two facing benches
const gothic = `<g><rect x="-420" y="-360" width="840" height="360" fill="#d9c49a" ${st(7)}/>${Array.from({ length: 7 }, (_, i) => `<path d="M ${-360 + i * 120} -40 V -260 Q ${-330 + i * 120} -310 ${-300 + i * 120} -260 V -40 Z" fill="#a8916a" ${st(4)}/>`).join('')}
  <rect x="300" y="-760" width="160" height="760" fill="#d9c49a" ${st(7)}/><path d="M 290 -760 L 380 -900 L 470 -760 Z" fill="#a8916a" ${st(6)}/><circle cx="380" cy="-640" r="54" fill="#fbf8f0" ${st(6)}/><path d="M 380 -640 V -676 M 380 -640 H 404" ${st(5)}/></g>`;
shot('S46', cut(53), cut(54), `<g id="S46-cam">${skyW(-400, 2720, 880, '#b9cbd8', '#eef0ee', '#a9a48c')}${clouds('S46', [[300, 140, .9], [1500, 110, 1]])}
  ${G('S46-h', gothic, 1180, 880, .8)}${G('S46-fl', `<rect x="-5" y="-240" width="10" height="240" fill="#7a5232" ${st(4)}/><g transform="translate(5,-240)">${P.flag('uk', 120, 72)}</g>`, 920, 592, 1, 'opacity="0"')}
  ${G('S46-bA', `<rect x="-200" y="-60" width="400" height="60" rx="10" fill="#3e7a4a" ${st(6)}/>`, 600, 960, 1)}${G('S46-bB', `<rect x="-200" y="-60" width="400" height="60" rx="10" fill="#3e7a4a" ${st(6)}/>`, 1300, 960, 1)}
  ${G('S46-jb', P.johnbull('s46jb'), 380, 900, 1)}</g>${vign}
  ${T('S46-l', 'ΠΡΟΤΥΠΟ ΤΗΣ ΑΓΓΛΙΑΣ', 960, 150, 92, YEL, 'middle', 14)}`);

// S47 «Για να καταστεί αυτό δυνατόν, έπρεπε ο βασιλιάς να αναθέτει την εντολή … μόνο σε πολιτικό»
const gate = `<g><rect x="-30" y="-460" width="60" height="460" fill="#7a5232" ${st(6)}/><rect x="270" y="-460" width="60" height="460" fill="#7a5232" ${st(6)}/><rect x="-40" y="-500" width="380" height="60" rx="10" fill="#8a5a32" ${st(6)}/></g>`;
shot('S47', cut(54), C.mid55, `<g id="S47-cam">${hall(-400, W + 800, '#c9b0d0', 880)}
  ${G('S47-g', CH.georgeI('s47g', { arms: 'hold' }), 340, 900, 1)}${G('S47-env', envelope(), 450, 760, 1)}
  ${G('S47-gate', gate, 860, 880, 1)}${G('S47-door', `<rect x="0" y="-440" width="240" height="440" fill="#5a3a1e" ${st(6)}/>${Array.from({ length: 5 }, (_, i) => `<path d="M ${30 + i * 45} -430 V -10" stroke="#3a2a1e" stroke-width="10"/>`).join('')}`, 890, 880, 1)}
  ${[0, 1, 2].map(i => G(`S47-q${i}`, P.minister(`s47q${i}`), 1360 + i * 190, 900, .7)).join('')}</g>${vign}
  ${T('S47-l', 'ΑΝΑΘΕΤΕΙ ΤΗΝ ΕΝΤΟΛΗ', 960, 160, 88, '#fff', 'middle', 13)}${T('S47-l2', 'ΜΟΝΟ', 1050, 290, 72, YEL, 'middle', 12)}`);

// S48 «ο οποίος σαφώς είχε τη «δεδηλωμένη» εμπιστοσύνη της πλειοψηφίας των βουλευτών» — hands go up, the bar passes half, the gate opens
shot('S48', C.mid55, cut(56), `<g id="S48-cam">${hall(-400, W + 800, '#b9c9d6', 880)}
  ${[0, 1, 2, 3, 4, 5, 6].map(i => G(`S48-d${i}`, dep(`s48d${i}`, i), 180 + i * 165, 930, .58) + G(`S48-u${i}`, dep(`s48u${i}`, i, { arms: 'up', start: 'happy' }), 180 + i * 165, 930, .58, 'opacity="0"')).join('')}
  ${G('S48-bar', `<rect x="0" y="0" width="760" height="54" rx="27" fill="#efe4c9" ${st(6)}/><rect id="S48-fill" x="5" y="5" width="0" height="44" rx="22" fill="${GRN}"/><path d="M 380 -16 V 70" stroke="${INK}" stroke-width="6" stroke-dasharray="10 8"/>`, 300, 380, 1)}
  ${G('S48-tk', tick(GRN, 70), 1150, 400, 1, 'opacity="0"')}
  ${G('S48-p', P.minister('s48p', { start: 'happy' }), 1620, 900, .85)}${G('S48-env', envelope(), 300, 560, 1, 'opacity="0"')}</g>${vign}
  ${T('S48-l', '«ΔΕΔΗΛΩΜΕΝΗ» ΕΜΠΙΣΤΟΣΥΝΗ', 960, 160, 84, YEL, 'middle', 13)}${T('S48-l2', 'ΠΛΕΙΟΨΗΦΙΑ', 680, 340, 56, '#fff', 'middle', 9)}`);

// S49 «θα στερούσε από τα κόμματα μειοψηφίας τη δυνατότητα να σχηματίζουν κυβέρνηση» — padlocked door
shot('S49', cut(56), cut(57), `<g id="S49-cam">${hall(-400, W + 800, '#d6c2b9', 880)}
  ${G('S49-door', `<rect x="-170" y="-520" width="340" height="520" fill="#6e4524" ${st(7)}/><rect x="-140" y="-490" width="280" height="460" fill="#8a5a32" ${st(5)}/>${txt('ΚΥΒΕΡΝΗΣΗ', 0, -540, 56, '#fff', 'middle', `stroke="${INK}" stroke-width="8" paint-order="stroke"`)}`, 1300, 880, 1)}
  ${G('S49-lock', P.padlock(), 1300, 600, 1.1, 'opacity="0"')}
  ${[0, 1, 2].map(i => G(`S49-s${i}`, P.minister(`s49s${i}`, { sash: [['#5d7aa8', '#c9661f', '#3E9C94'][i]] }), 360 + i * 200, 900, .55)).join('')}
  ${G('S49-x', xMark(RED, 80, 26), 1300, 470, 1, 'opacity="0"')}</g>${vign}
  ${T('S49-l', 'ΚΟΜΜΑΤΑ ΜΕΙΟΨΗΦΙΑΣ', 560, 300, 74, '#fff', 'middle', 12)}${T('S49-l2', 'ΣΤΕΡΟΥΣΕ', 64, 120, 84, RED, 'start', 12)}`);

// S50 «θα τα ωθούσε σε συνένωση με τα μεγάλα … σταθερότερες κυβερνήσεις πλειοψηφίας»
const blob = (c, r) => `<circle r="${r}" fill="${c}" ${st(6)}/><circle cx="${-r * .3}" cy="${-r * .25}" r="${r * .12}" fill="${INK}"/><circle cx="${r * .3}" cy="${-r * .25}" r="${r * .12}" fill="${INK}"/><path d="M ${-r * .25} ${r * .2} Q 0 ${r * .4} ${r * .25} ${r * .2}" fill="none" stroke="${INK}" stroke-width="5"/>`;
shot('S50', cut(57), cut(58), `<g id="S50-cam">${skyW(-400, 4000, 880, '#c9dde6', '#f3efe4', '#c9b98d')}
  ${G('S50-A', blob('#5d7aa8', 170), 560, 700, 1)}${G('S50-B', blob('#b0563a', 170), 1360, 700, 1)}
  ${[0, 1, 2, 3].map(i => G(`S50-s${i}`, blob(['#3E9C94', '#c9661f', '#8a6a9a', '#e8a23b'][i], 60), [240, 860, 1060, 1680][i], 820, 1)).join('')}
  ${G('S50-tab', table('ΚΥΒΕΡΝΗΣΗ'), 2500, 880, 1.3)}${G('S50-tA', blob('#5d7aa8', 90), 2320, 760, 1)}${G('S50-tB', blob('#b0563a', 90), 2680, 760, 1)}</g>${vign}
  ${T('S50-l', 'ΣΥΝΕΝΩΣΗ ΜΕ ΤΑ ΜΕΓΑΛΑ', 960, 160, 84, '#fff', 'middle', 13)}${T('S50-l2', 'ΣΤΑΘΕΡΟΤΕΡΕΣ ΚΥΒΕΡΝΗΣΕΙΣ', 960, 160, 84, YEL, 'middle', 13)}`);

// S51 «Ο βασιλιάς, υπό την πίεση της αντιπολίτευσης και του επαναστατικού αναβρασμού του λαού» — squeezed; the crowd boils
const gauge = `<g><circle r="120" fill="#fbf8f0" ${st(8)}/><path d="M -90 40 A 100 100 0 1 1 90 40" fill="none" stroke="#e3d6b6" stroke-width="22"/><path d="M 40 -92 A 100 100 0 0 1 90 40" fill="none" stroke="${RED}" stroke-width="22"/><g id="S51-ndl"><path d="M 0 0 L 0 -96" stroke="${INK}" stroke-width="10" stroke-linecap="round"/></g><circle r="16" fill="${INK}"/></g>`;
shot('S51', cut(58), cut(60), `<g id="S51-cam">${hall(-400, W + 800, '#c9b0d0', 880)}
  ${G('S51-wl', `<rect x="-60" y="-640" width="120" height="640" fill="#7a7f88" ${st(7)}/>${txt('ΑΝΤΙΠΟΛΙΤΕΥΣΗ', 0, -300, 46, '#fff', 'middle', `transform="rotate(-90 0 -300)" stroke="${INK}" stroke-width="7" paint-order="stroke"`)}`, 420, 880, 1)}
  ${G('S51-pr', `<rect x="-16" y="-700" width="32" height="680" fill="#7a7f88" ${st(6)}/><rect x="-170" y="-30" width="340" height="44" rx="8" fill="#5e646c" ${st(6)}/>`, 760, 360, 1)}${G('S51-g', CH.georgeI('s51g'), 760, 900, 1.05)}
  ${G('S51-cau', `<path d="M -330 -260 L 330 -260 L 290 0 Q 0 40 -290 0 Z" fill="#3a3a40" ${st(8)}/>${[0, 1, 2, 3, 4].map(i => `<g transform="translate(${-240 + i * 120},-250)">${people(`s51p${i}`, i, { arms: 'up', start: 'angry' }).replace(/<g id="(s51p\d)"/, '<g id="$1" transform="scale(.55)"')}</g>`).join('')}<path d="M -330 -270 L 330 -270 L 320 -230 L -320 -230 Z" fill="#2a2a30" ${st(6)}/>`, 1450, 920, 1)}
  ${[0, 1, 2, 3, 4].map(i => G(`S51-st${i}`, `<circle r="${36 + (i % 3) * 14}" fill="#fff" ${st(5)} opacity=".9"/>`, 1250 + i * 100, 540, 1, 'opacity="0"')).join('')}
  ${G('S51-ga', gauge, 1080, 300, .85)}</g>${vign}
  ${T('S51-l', 'ΠΙΕΣΗ', 64, 120, 92, RED, 'start', 14)}${T('S51-l2', 'ΑΝΑΒΡΑΣΜΟΣ ΤΟΥ ΛΑΟΥ', 1450, 300, 70, YEL, 'middle', 11)}`);

// S52 «υιοθέτησε τελικά την άποψη του Τρικούπη»
shot('S52', cut(60), cut(61), `<g id="S52-cam">${skyW(-400, 2720, 880, '#bfe0ea', '#f2f7f1', '#c9b98d')}${clouds('S52', [[300, 140, .9], [1500, 110, 1]])}
  ${G('S52-g', CH.georgeI('s52g', { arms: 'hold' }), 600, 900, 1.1)}${G('S52-t', CH.trikoupis('s52t', { arms: 'hold', start: 'happy' }), 1340, 900, 1.1)}
  ${G('S52-pp', `${paper(260, 190, '#fbf3dc')}${txt('Η ΑΠΟΨΗ', 0, -30, 44, INK)}${txt('ΤΟΥ ΤΡΙΚΟΥΠΗ', 0, 30, 38, INK)}`, 1180, 560, 1)}
  ${G('S52-st', `${tick(GRN, 60)}`, 1320, 470, 1, 'opacity="0"')}</g>${vign}
  ${T('S52-l', 'ΥΙΟΘΕΤΗΣΕ', 960, 170, 110, YEL, 'middle', 15)}`);

// S53 «τομή στην πολιτική ιστορία … μεταβολή του πολιτικού τοπίου» — the timeline is cut; the landscape changes; fade
shot('S53', cut(61), C.end + 2.4, `<g id="S53-cam">${skyW(-400, 2720, 860, '#bfe0ea', '#f2f7f1', '#c9b98d')}${clouds('S53', [[300, 140, .9], [1500, 110, 1]])}
  ${G('S53-rib', `<g id="S53-ra"><rect x="-820" y="-34" width="820" height="68" rx="8" fill="${PAPER}" ${st(6)}/></g><g id="S53-rb"><rect x="0" y="-34" width="820" height="68" rx="8" fill="${PAPER}" ${st(6)}/></g>`, 960, 330, 1)}
  ${G('S53-sc', P.scissors(), 830, 330, 1)}
  ${Array.from({ length: 7 }, (_, i) => G(`S53-hl${i}`, `<path d="M -110 0 Q 0 -160 110 0 Z" fill="${['#9fbf6a', '#b98a5a', '#c9661f', '#8a6a9a', '#5d7aa8', '#e8a23b', '#3E9C94'][i]}" ${st(6)}/>`, 200 + i * 250, 870, 1)).join('')}
  ${[0, 1].map(i => G(`S53-M${i}`, mountain(['#5d7aa8', '#b0563a'][i], .9), [620, 1360][i], 880, 1, 'opacity="0"')).join('')}</g>${vign}
  ${T('S53-l', 'ΤΟΜΗ', 960, 200, 120, RED, 'middle', 16)}${T('S53-l2', 'ΜΕΤΑΒΟΛΗ ΤΟΥ ΠΟΛΙΤΙΚΟΥ ΤΟΠΙΟΥ', 960, 170, 80, YEL, 'middle', 13)}
  <rect id="S53-black" width="${W}" height="${H}" fill="#000" opacity="0"/>`);

// ---------- page ----------
const HL = ['Εθνοσυνέλευση', 'Νοέμβριο του 1862', 'τοπικά ψηφοδέλτια χωρίς κομματικές παρεμβάσεις', 'είχαν χρεοκοπήσει', 'πεδινών', 'ορεινών', 'Δημήτριο Βούλγαρη',
  'υπονόμευε τους κοινοβουλευτικούς θεσμούς', '«πραιτωριανών»', 'Δ. Γρίβα', 'αντίσταση στην πολιτική των πεδινών', 'Εθνικόν Κομιτάτον', 'Επαμεινώνδα Δεληγιώργη',
  'Εκλεκτικοί', 'μετριοπαθείς θέσεις', 'εμφυλίου πολέμου', 'δύο ολόκληρα χρόνια', 'βασιλευομένη δημοκρατία', 'συνταγματικής μοναρχίας', 'λαϊκής κυριαρχίας',
  'ψήφος με σφαιρίδια', 'ανεξαρτησία της δικαιοσύνης', 'συνέρχεσθαι και συνεταιρίζεσθαι', 'ελεύθερη συγκρότηση κομμάτων', 'συνωμοτικοί κύκλοι', 'βιαιοπραγίες',
  'Γεωργίου Α\'', 'κοινοβουλευτική πλειοψηφία', 'ασάφεια', 'αρχής της δεδηλωμένης το 1875', 'Χαρίλαο Τρικούπη', 'δύο μεγάλων κομμάτων εξουσίας', 'πρότυπο της Αγγλίας',
  '«δεδηλωμένη»', 'σταθερότερες κυβερνήσεις πλειοψηφίας', 'τομή', 'μεταβολή του πολιτικού τοπίου'];
const subs = makeSubs(timing, HL, { skipBefore: S(2) - .2 });
const extraDefs = mapDefs(M) + `<clipPath id="c-k1832"><path d="${kRing}"/></clipPath>`;
const n = buildPage({ out: path.join(HERE, 'build/video.html'), shots, subs, C, extraDefs, data: { PP },
  runtimeJs: '../../../engine/runtime.js', shotsJs: '../shots.js' });
fs.writeFileSync(path.join(HERE, 'build/cues.json'), JSON.stringify({ ...C, DUR: C.end + 2.4 }, null, 1));
for (let i = 1; i < shots.length; i++) if (shots[i].a !== shots[i - 1].b) throw new Error(`shots do not tile at ${shots[i].id}`);
console.log('built', (n / 1e6).toFixed(2), 'MB,', shots.length, 'shots, duration', (C.end + 2.4).toFixed(1), 's');
