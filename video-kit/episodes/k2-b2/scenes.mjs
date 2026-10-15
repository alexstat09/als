// Κεφ.2 Β.2 «Η παρακμή των «ξενικών» κομμάτων» (k2-b2) — SCENES (node side).
// Run from the kit root:  node episodes/k2-b2/scenes.mjs   →  build/video.html + build/cues.json
// ⚠️ EVERY time is derived from the narration (S/E/Wt) — never a literal second — so a new voice re-times the film.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { P, CH, W, H, INK, BLUE, RED, YEL, cueTools, G, T, clouds, vign, buildPage, makeSubs } from '../../engine/page.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const { timing, PH, S, E, Wt, CK, Wr } = cueTools(path.join(HERE, 'timing.json'));

// episode colours (STORYBOARD.md → «Colour meaning»)
const GOLD = '#D8A93B', GRN = '#6aa84f', PAPER = '#F1E2BC', GREY = '#9a958b';
const ENC = '#3E9C94', FRC = '#8A5BB0', RUC = '#D9822B';   // the k2-b1 «ξενικά» party colours

// ---------- cues ----------
const mid = (i, w) => +(Wt(i, w) - .12).toFixed(2);       // a cut INSIDE a long phrase, just before word w
// Phrase 6 reads «(1844-1864)» as eight spoken words → measure its two halves separately (engine CK/Wr).
const OUS = CK('ουσιαστικά'), w6a = w => Wr(6, w, null, 'ουσιαστικά', S(6), OUS), w6b = w => Wr(6, w, 'ουσιαστικά', null, OUS, E(6));
const C = {
  t1: 0.05, t2: S(1),
  komm: Wt(2, 'κόμματα'), anapt: Wt(3, 'αναπτυχθούν'), synt: Wt(3, 'συνταγματικό'),
  sympt: Wt(4, 'συμπτώματα'), stasim: Wt(4, 'στασιμότητας'), anag: Wt(4, 'ανάγκες'),
  parak: Wt(5, 'παρακμή'),
  metax: w6a('μεταξύ'), y1844: w6a('χίλια'), y1864: w6a('έως'),
  ousi: OUS, ikan: w6b('ικανοποιήθηκαν'), aitim: w6b('αιτήματα'), rosik: w6b('ρωσικού'),
  orth7: Wt(7, 'Ορθόδοξη'),
  napai: Wt(8, 'ναπαίοι'), kind: Wt(8, 'κίνδυνο'), orth8: Wt(8, 'Ορθοδοξία'),
  zit: Wt(9, 'ζητήματα'), lyth: Wt(9, 'λυθεί'), oloi: Wt(9, 'όλοι'), dogma: Wt(9, 'δόγμα'),
  logos: Wt(10, 'λόγο'), theseis: Wt(11, 'θέσεις'), epik: Wt(11, 'επίκαιρα'),
  kol: S(12), arch: Wt(13, 'αρχηγός'), gall13: Wt(13, 'γαλλικού'),
  kyv: Wt(14, 'κυβερνητική'), enis14: Wt(14, 'ενίσχυε'), vasil14: Wt(14, 'βασιλιά'),
  ypon: Wt(15, 'υπονομεύοντας'), koinv: Wt(15, 'κοινοβουλευτισμό'),
  via: Wt(16, 'βία'), noth: Wt(16, 'νοθεία'), trom: Wt(16, 'τρομοκρατεί'),
  psif: Wt(17, 'ψηφίζουν'), komm17: Wt(17, 'κόμματός'),
  y1846: Wt(18, 'χίλια'), y1847a: Wt(18, 'με χίλια'), pente: Wt(18, 'πέντε'), ypourg: Wt(18, 'υπουργεία'),
};
Object.assign(C, {
  parous: Wt(19, 'παρουσιαζόταν'), kath: Wt(19, 'καθόλου'), koinov: Wt(19, 'Κοινοβούλιο'),
  kathis: Wt(19, 'καθιστούσε'), adyn: Wt(19, 'αδύνατο'), ekt: Wt(19, 'εκτελεστικής'),
  epev: Wt(20, 'Επέβαλε'), dikt: Wt(20, 'δικτατορίας'),
  than: Wt(21, 'θάνατο'), y1847b: Wt(22, 'χίλια'),
  gall23: Wt(23, 'γαλλικό'), parak23: Wt(23, 'παρακμής'),
  diam: Wt(24, 'διαμάχη'), diad: Wt(24, 'διαδοχή'),
  otto: Wt(25, 'Όθωνα'), enis25: Wt(25, 'ενισχύσει'), ypops: Wt(25, 'υποψηφίους'), ekl: Wt(25, 'εκλογές'),
  odig: Wt(25, 'οδήγησε'), antip: Wt(25, 'αντιπολίτευσης'), sygkr: Wt(25, 'σύγκρουση'), avli: Wt(25, 'αυλή'),
  diaf: Wt(26, 'διαφωνίες'), apal: Wt(26, 'απαλυνθεί'),
  krim: Wt(27, 'Κριμαϊκού'), angl27: Wt(27, 'αγγλικό'), empist: Wt(27, 'εμπιστοσύνη'), opad: Wt(27, 'οπαδών'),
  viai: Wt(28, 'βίαιη'), angl28: Wt(28, 'Αγγλίας'), gall28: Wt(28, 'Γαλλίας'), ell: Wt(28, 'Ελλάδα'),
  naft: Wt(29, 'ναυτικό'), apok: Wt(29, 'αποκλεισμό'),
  proig: Wt(30, 'προηγηθεί'), pats: Wt(30, 'Πατσίφικο'),
  dysx: Wt(31, 'δυσχεράνει'), sxes: Wt(31, 'σχέσεις'),
  prosor: Wt(32, 'προσωρινά'), kerdi: Wt(32, 'κέρδη'),
  itta: Wt(33, 'ήττα'), rosias: Wt(33, 'Ρωσίας'), apodyn: Wt(33, 'αποδυνάμωση'),
  stad: Wt(34, 'σταδιακά'), exaf: Wt(34, 'εξαφανίστηκε'), skini: Wt(34, 'σκηνή'),
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
let skN = 0;
const skyW = (x0, w, gy, top = '#bfe0ea', bot = '#f2f7f1', ground = '#c9b98d') => { const id = `k2sky${skN++}`; return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bot}"/></linearGradient></defs><rect x="${x0}" y="-300" width="${w}" height="${H + 600}" fill="url(#${id})"/><rect x="${x0}" y="${gy}" width="${w}" height="${H - gy + 400}" fill="${ground}" stroke="${INK}" stroke-width="5"/><rect x="${x0}" y="-300" width="${w}" height="${H + 600}" fill="#000" filter="url(#paper)" opacity=".18"/>`; };
const room = (wall = '#d9c8a4', floorY = 880, x0 = -400, w = W + 800) => `<rect x="${x0}" y="-300" width="${w}" height="${floorY + 300}" fill="${wall}"/><rect x="${x0}" y="${floorY}" width="${w}" height="${H - floorY + 400}" fill="#9a7b52" stroke="${INK}" stroke-width="5"/>${Array.from({ length: Math.ceil(w / 160) }, (_, i) => `<path d="M ${x0 + i * 160} ${floorY} L ${x0 + i * 160 - 60} ${H + 100}" stroke="#7e6240" stroke-width="4"/>`).join('')}<rect x="${x0}" y="-300" width="${w}" height="${H + 600}" fill="#000" filter="url(#paper)" opacity=".16"/>`;
const paper = (w, h, c = PAPER) => `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="8" fill="${c}" stroke="${INK}" stroke-width="7"/><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="8" fill="#000" filter="url(#paper)" opacity=".15"/>`;
const card = (s, c = '#efe4c9', fs = 52, tc = INK) => { const w = s.length * fs * .5 + 60; return `<g><rect x="${-w / 2}" y="${-fs * .9}" width="${w}" height="${fs * 1.6}" rx="18" fill="${c}" ${st(7)}/>${txt(s, 0, fs * .36, fs, tc)}</g>`; };
const tag = (s, c = '#fff', fs = 38) => { const w = s.length * fs * .52 + 40; return `<g><rect x="${-w / 2}" y="${-fs * .8}" width="${w}" height="${fs * 1.3}" rx="12" fill="${c}" ${st(5)}/>${txt(s, 0, fs * .32, fs, INK)}</g>`; };
const flagP = (c, w = 120, h = 80, pole = 300) => `<g><rect x="-6" y="${-pole}" width="12" height="${pole}" rx="4" fill="#7a5232" ${st(4)}/><path d="M 6 ${-pole + 6} Q ${w * .5} ${-pole - 14} ${w} ${-pole + 6} L ${w} ${-pole + 6 + h} Q ${w * .5} ${-pole + h - 14} 6 ${-pole + 6 + h} Z" fill="${c}" ${st(5)}/></g>`;
const natFlag = (k, w = 120, h = 80, pole = 260) => `<g><rect x="-6" y="${-pole}" width="12" height="${pole}" rx="4" fill="#7a5232" ${st(4)}/><g transform="translate(6,${-pole + 4})">${P.flag(k, w, h)}</g></g>`;
const arrowUp = (c = GRN, s = 1, dash = '') => `<path transform="scale(${s})" d="M -40 60 L -40 -10 L -80 -10 L 0 -100 L 80 -10 L 40 -10 L 40 60 Z" fill="${dash ? 'none' : c}" ${st(7)} ${dash ? `stroke-dasharray="${dash}" stroke="${c}"` : ''}/>`;
const arrowDn = (c = RED, s = 1) => `<path transform="scale(${s})" d="M -40 -60 L -40 10 L -80 10 L 0 100 L 80 10 L 40 10 L 40 -60 Z" fill="${c}" ${st(7)}/>`;
const bolt = (c = YEL) => `<path d="M -30 -90 L 20 -90 L -4 -20 L 40 -20 L -30 90 L -10 10 L -50 10 Z" fill="${c}" ${st(6)}/>`;
const bubble = (w, h, inner = '') => `<g><ellipse cx="0" cy="0" rx="${w / 2}" ry="${h / 2}" fill="#fff" ${st(6)}/><path d="M -20 ${h / 2 - 6} L -46 ${h / 2 + 40} L 14 ${h / 2 - 4} Z" fill="#fff" ${st(6)}/><rect x="-24" y="${h / 2 - 16}" width="40" height="16" fill="#fff"/>${inner}</g>`;
const church = () => `<g><rect x="-170" y="-230" width="340" height="230" fill="#efe4c9" ${st(6)}/><path d="M -120 -230 Q -120 -380 0 -380 Q 120 -380 120 -230 Z" fill="#5D8BD0" ${st(6)}/><rect x="-6" y="-470" width="12" height="96" fill="${GOLD}" ${st(4)}/><rect x="-34" y="-446" width="68" height="12" fill="${GOLD}" ${st(4)}/><path d="M -50 0 L -50 -110 Q -50 -160 0 -160 Q 50 -160 50 -110 L 50 0 Z" fill="#7a5232" ${st(5)}/>${[-130, 130].map(x => `<path d="M ${x - 22} -110 L ${x - 22} -170 Q ${x - 22} -196 ${x} -196 Q ${x + 22} -196 ${x + 22} -170 L ${x + 22} -110 Z" fill="#9fc3d6" ${st(4)}/>`).join('')}</g>`;
const openBook = (label) => `<g><path d="M -560 0 Q -280 -40 0 0 L 0 110 Q -280 70 -560 110 Z" fill="#f6eedc" ${st(7)}/><path d="M 560 0 Q 280 -40 0 0 L 0 110 Q 280 70 560 110 Z" fill="#f6eedc" ${st(7)}/><path d="M -560 110 Q -280 70 0 110 Q 280 70 560 110 L 560 130 Q 280 90 0 130 Q -280 90 -560 130 Z" fill="#8a3b22" ${st(6)}/>${txt(label, 0, 78, 56, '#8a3b22')}</g>`;
const ballotC = (c, label = '') => `<g><path d="M -150 0 L -130 -200 L 130 -200 L 150 0 Z" fill="${c}" ${st(6)}/><rect x="-60" y="-212" width="120" height="16" rx="6" fill="${INK}"/>${label ? txt(label, 0, -80, 44, '#fff', 'middle', `stroke="${INK}" stroke-width="7" paint-order="stroke"`) : ''}</g>`;
const ballot = `<g><rect x="-30" y="-40" width="60" height="80" rx="4" fill="#fbf8f0" ${st(4)}/><path d="M -16 -16 H 16 M -16 0 H 10 M -16 16 H 16" stroke="#b9a57c" stroke-width="5"/></g>`;
const club = `<g><path d="M -10 0 L -16 -150 Q 0 -180 16 -150 L 10 0 Z" fill="#7a5232" ${st(5)}/></g>`;
const door = (w = 170, h = 330) => `<g><rect x="${-w / 2}" y="${-h}" width="${w}" height="${h}" rx="6" fill="#7a5232" ${st(6)}/><rect x="${-w / 2 + 18}" y="${-h + 110}" width="${w - 36}" height="${h - 130}" rx="4" fill="#8f6640" ${st(4)}/><circle cx="${w / 2 - 26}" cy="${-h / 2 + 30}" r="9" fill="${GOLD}" ${st(3)}/></g>`;
const cobweb = `<g opacity=".8"><path d="M 0 0 L 90 0 M 0 0 L 0 90 M 0 0 L 70 70 M 30 0 Q 22 22 0 30 M 60 0 Q 44 44 0 60 M 88 0 Q 66 66 0 88" fill="none" stroke="#f4f1ea" stroke-width="3"/></g>`;
const cone = `<g transform="translate(64,-200) rotate(-12)"><path d="M 0 -18 L 90 -48 L 90 48 L 0 18 Z" fill="#c9a46a" ${st(5)}/></g>`;
const placard = (s = '') => `<g><rect x="-6" y="0" width="12" height="230" fill="#7a5232" ${st(4)}/><rect x="-130" y="-120" width="260" height="140" rx="8" fill="#fbf8f0" ${st(6)}/>${s ? txt(s, 0, -26, 90, INK) : ''}</g>`;
const bellows = `<g><path d="M 0 -60 L 150 -26 L 150 26 L 0 60 Z" fill="#9a6a3a" ${st(6)}/><path d="M 40 -50 L 40 50 M 80 -40 L 80 40 M 115 -32 L 115 32" stroke="#6b4a2b" stroke-width="5"/><rect x="150" y="-10" width="70" height="20" fill="#9aa1aa" ${st(4)}/><rect x="-60" y="-12" width="70" height="24" rx="10" fill="#6b4a2b" ${st(4)}/></g>`;

// ---------- generic figures: ONE design = ONE role in this episode (STORYBOARD «Cast») ----------
const HAIRY = ['#5a3a22', '#3a2a20', '#7a4a2a', '#2a2420'];
const en = (id, extra = {}) => P.partyMan(id, 'en', ENC, extra);                                                                        // αγγλικό κόμμα
const ru = (id, extra = {}) => P.partyMan(id, 'ru', RUC, extra);                                                                        // ρωσικό κόμμα / ναπαίοι
const frm = (id, extra = {}) => P.person({ id, coat: '#4a3a5a', vest: '#e9e3d6', sleeveC: '#fbf8f0', legs: 'vraka', vrakaC: '#3a2e48', hat: 'flat', hatC: '#2a2420', face: 'stache', faceC: '#3a2a20', hairC: '#3a2a20', sash: [FRC], ...extra });   // γαλλικό κόμμα (μέλος)
const kol = (id, extra = {}) => CH.kolettis(id, extra);                                                                                 // Ιωάννης Κωλέττης
const otto = (id, extra = {}) => P.otto(id, extra);                                                                                     // Όθων
const voter = (id, extra = {}) => P.villager(id, extra);                                                                                // εκλογείς
const thug = (id, extra = {}) => P.person({ id, coat: '#5d5a52', vest: '#3b3a36', sleeveC: '#d8d0be', legs: 'vraka', vrakaC: '#4a4a42', hair: 'short', hairC: '#2a2420', face: 'goatee', faceC: '#2a2420', ...extra });   // μπράβοι (ΧΩΡΙΣ φέσι/φουστανέλα — να μη μοιάζουν με τον Κωλέττη)
const mp = (id, extra = {}) => P.minister(id, extra);                                                                                   // βουλευτές
const cand = (id, i = 0, extra = {}) => P.person({ id, coat: '#3d6b4f', pants: '#2f3b33', vest: '#efe8d6', hat: 'bowler', hatC: '#2a2420', face: 'stache', faceC: HAIRY[i % 4], hair: 'short', hairC: HAIRY[i % 4], ...extra });   // κυβερνητικοί υποψήφιοι
const courtier = (id, extra = {}) => P.person({ id, coat: '#7b2f4a', vest: GOLD, pants: '#f4efe4', hair: 'side', hairC: '#e8e4dc', face: 'sideburns', faceC: '#e8e4dc', ...extra });   // η Αυλή
const cit = (id, i = 0, extra = {}) => P.citizen(id, { hairC: HAIRY[i % 4], ...extra });                                               // οπαδοί / λαός
const hellas = (id, extra = {}) => P.person({ id, female: true, dress: true, coat: '#f4efe4', dressC: '#f4efe4', sleeveC: '#f4efe4', hair: 'long', hairC: '#3a2a20', sash: ['#0D5EAF'], ...extra });   // Ελλάδα (λευκό φόρεμα)

// ================= SHOTS =================
// S1 title — the three «ξενικά» party flags before a sky
shot('S1', 0, cut(2), `<g id="S1-cam">${skyW(-400, W + 800, 870, '#bfe0ea', '#f2f7f1')}${clouds('S1', [[260, 160, .9], [1650, 130, 1]])}
  ${[ENC, FRC, RUC].map((c, i) => G(`S1-f${i}`, flagP(c, 190, 120, 330), 560 + i * 400, 880, 1)).join('')}</g>${vign}
  ${T('S1-t1', 'ΕΝΟΤΗΤΑ 2', 960, 210, 92, YEL, 'middle', 12)}${T('S1-t2', 'Η ΠΑΡΑΚΜΗ ΤΩΝ «ΞΕΝΙΚΩΝ» ΚΟΜΜΑΤΩΝ', 960, 350, 104, '#fff', 'middle', 15)}
  ${T('S1-t3', 'ΣΥΝΤΑΓΜΑΤΙΚΗ ΜΟΝΑΡΧΙΑ', 960, 470, 64, '#fff', 'middle', 10)}`);

// S2 «Τα πολιτικά κόμματα … νέο συνταγματικό καθεστώς» — three party men on the open book of the constitution; a dashed «could grow» arrow
shot('S2', cut(2), cut(4), `<g id="S2-cam">${skyW(-400, W + 800, 880, '#cfe6ee', '#f6f4ea')}${clouds('S2', [[300, 150, .8], [1600, 120, .9]])}
  ${G('S2-bk', openBook('ΣΥΝΤΑΓΜΑ'), 960, 790, 1)}
  ${G('S2-a', en('s2a'), 680, 790, .85)}${G('S2-b', frm('s2b'), 960, 790, .85)}${G('S2-c', ru('s2c'), 1240, 790, .85)}
  ${G('S2-ar', arrowUp(GRN, 2.2, '18 14'), 1600, 640, 1)}</g>${vign}
  ${T('S2-l', 'ΠΟΛΙΤΙΚΑ ΚΟΜΜΑΤΑ', 960, 150, 96, '#fff', 'middle', 14)}${T('S2-l2', 'ΑΝΑΠΤΥΞΗ;', 1600, 330, 60, GRN, 'middle', 10)}`);

// S3 «έδειξαν συμπτώματα στασιμότητας … νέες ανάγκες» — stuck gauge + cobwebs on the men; citizens with new needs, ignored
shot('S3', cut(4), cut(5), `<g id="S3-cam">${room('#d8c39a', 880)}
  ${G('S3-g', `<path d="M -150 0 A 150 150 0 0 1 150 0 Z" fill="#fbf8f0" ${st(6)}/><path d="M -150 0 A 150 150 0 0 1 -50 -141" fill="none" stroke="${RED}" stroke-width="18"/><path d="M 50 -141 A 150 150 0 0 1 150 0" fill="none" stroke="${GRN}" stroke-width="18"/>${G('S3-n', `<rect x="-6" y="-120" width="12" height="120" rx="6" fill="${INK}"/>`, 0, 0, 1)}<circle r="16" fill="${INK}"/>`, 560, 480, 1)}
  ${[0, 1, 2].map(i => G(`S3-m${i}`, [en, frm, ru][i](`s3m${i}`, { start: 'yawn' }), 360 + i * 200, 880, .78)).join('')}
  ${[0, 1, 2].map(i => G(`S3-w${i}`, cobweb, 300 + i * 200, 610, 1)).join('')}
  ${[0, 1, 2].map(i => G(`S3-c${i}`, cit(`s3c${i}`, i, { arms: 'up' }), 1250 + i * 200, 880, .8)).join('')}
  ${[0, 1, 2].map(i => G(`S3-b${i}`, bubble(130, 100, txt('!', 0, 26, 76, RED)), 1290 + i * 200, 470 - (i % 2) * 40, 1)).join('')}</g>${vign}
  ${T('S3-l', 'ΣΥΜΠΤΩΜΑΤΑ ΣΤΑΣΙΜΟΤΗΤΑΣ', 560, 160, 74, '#fff', 'middle', 12)}${T('S3-l2', 'ΝΕΕΣ ΑΝΑΓΚΕΣ', 1450, 250, 74, YEL, 'middle', 12)}`);

// S4 «κάτι που τα οδήγησε σε παρακμή» — the three flags droop and grey
shot('S4', cut(5), cut(6), `<g id="S4-cam">${skyW(-400, W + 800, 870, '#c9d3d6', '#eef0ea', '#b9ab88')}
  ${[ENC, FRC, RUC].map((c, i) => G(`S4-f${i}`, `${flagP(c, 190, 120, 420)}<g id="S4-g${i}" opacity="0">${flagP(GREY, 190, 120, 420)}</g>`, 480 + i * 380, 880, 1)).join('')}
  ${G('S4-ar', arrowDn(RED, 1.6), 1640, 520, 1)}</g>${vign}
  ${T('S4-l', 'ΠΑΡΑΚΜΗ', 960, 200, 140, RED, 'middle', 16)}`);

// S5 «Στην περίοδο μεταξύ των δύο συνταγμάτων (1844-1864)» — two constitution scrolls joined by a timeline
shot('S5', cut(6), +(OUS - .12).toFixed(2), `<g id="S5-cam">${room('#e2cfa6', 900)}
  ${line('S5-bar', 420, 620, 1500, 620, INK, 22)}${line('S5-bar2', 420, 620, 1500, 620, GOLD, 12)}
  ${G('S5-s0', P.scroll('ΣΥΝΤΑΓΜΑ', 300), 420, 620, 1)}${G('S5-s1', P.scroll('ΣΥΝΤΑΓΜΑ', 300), 1500, 620, 1)}</g>${vign}
  ${T('S5-l', 'ΜΕΤΑΞΥ ΤΩΝ ΔΥΟ ΣΥΝΤΑΓΜΑΤΩΝ', 960, 160, 84, '#fff', 'middle', 13)}
  ${T('S5-y0', '1844', 420, 430, 120, YEL, 'middle', 14)}${T('S5-y1', '1864', 1500, 430, 120, YEL, 'middle', 14)}`);

// S6 «ουσιαστικά ικανοποιήθηκαν όλα τα αιτήματα του ρωσικού κόμματος» — the Russian party's list gets ticked
shot('S6', +(OUS - .12).toFixed(2), cut(7), `<g id="S6-cam">${room('#d9c8a4', 880)}
  ${G('S6-m', ru('s6m'), 620, 880, 1.15)}
  ${G('S6-p', `${paper(420, 470)}${txt('ΑΙΤΗΜΑΤΑ', 0, -170, 54)}${[0, 1, 2].map(i => `<path d="M -150 ${-80 + i * 100} H 90" stroke="#b9a57c" stroke-width="12" stroke-linecap="round"/>`).join('')}`, 1230, 560, 1)}
  ${[0, 1, 2].map(i => G(`S6-k${i}`, tick(GRN, 46), 1380, 480 + i * 100, 1)).join('')}</g>${vign}
  ${T('S6-l', 'ΙΚΑΝΟΠΟΙΗΘΗΚΑΝ', 960, 160, 100, GRN, 'middle', 14)}${G('S6-tg', tag('ΡΩΣΙΚΟ ΚΟΜΜΑ', RUC, 40), 620, 330, 1)}`);

// S7 «τα οποία είχαν σχέση με την Ορθόδοξη Εκκλησία» — the list points to a church
shot('S7', cut(7), cut(8), `<g id="S7-cam">${skyW(-400, W + 800, 860, '#cfe6ee', '#f6f4ea')}${clouds('S7', [[350, 140, .8], [1650, 170, 1]])}
  ${G('S7-p', `${paper(260, 300)}${[0, 1, 2].map(i => `<path d="M -90 ${-80 + i * 70} H 60" stroke="#b9a57c" stroke-width="10" stroke-linecap="round"/>`).join('')}`, 470, 560, 1)}
  ${line('S7-ln', 620, 560, 1100, 560, INK, 8)}
  ${G('S7-ch', church(), 1330, 870, 1.25)}</g>${vign}
  ${T('S7-l', 'ΟΡΘΟΔΟΞΗ ΕΚΚΛΗΣΙΑ', 960, 150, 96, '#fff', 'middle', 14)}`);

// S8 «Οι ναπαίοι προέβαλλαν … τον κίνδυνο για την Ορθοδοξία» — the Russian party shouts danger at the church
shot('S8', cut(8), cut(9), `<g id="S8-cam">${skyW(-400, W + 800, 860, '#d6dde0', '#f2f0e6')}
  ${G('S8-ch', church(), 1260, 870, 1.1)}
  ${G('S8-m', ru('s8m', { prop: cone, start: 'angry' }), 560, 880, 1.15)}
  ${[0, 1, 2].map(i => `<path id="S8-w${i}" d="M ${780 + i * 60} 470 Q ${810 + i * 60} 520 ${780 + i * 60} 570" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round" opacity="0"/>`).join('')}
  ${G('S8-sg', `<path d="M 0 -120 L 110 70 L -110 70 Z" fill="${YEL}" ${st(8)}/>${txt('!', 0, 50, 130, INK)}`, 1700, 420, 1)}</g>${vign}
  ${T('S8-l', 'ΟΡΘΟΔΟΞΙΑ', 960, 150, 96, '#fff', 'middle', 14)}${T('S8-l2', 'ΚΙΝΔΥΝΟΣ', 1700, 570, 64, RED, 'middle', 10)}
  ${G('S8-tg', tag('ΝΑΠΑΙΟΙ', RUC, 44), 560, 330, 1)}`);

// S9 «καθώς όμως τα μεγάλα εκκλησιαστικά ζητήματα είχαν λυθεί» — a padlock on the church door opens
shot('S9', cut(9), mid(9, 'πολιτικοί'), `<g id="S9-cam">${room('#e6d8b8', 900)}
  ${G('S9-dr', door(420, 640), 960, 900, 1)}
  ${G('S9-lk', `${G('S9-sh', `<path d="M -60 -40 V -110 Q -60 -180 0 -180 Q 60 -180 60 -110 V -40" fill="none" stroke="${INK}" stroke-width="30"/><path d="M -60 -40 V -110 Q -60 -180 0 -180 Q 60 -180 60 -110 V -40" fill="none" stroke="#aab" stroke-width="16"/>`, 0, 0, 1)}<rect x="-100" y="-60" width="200" height="160" rx="18" fill="${GOLD}" ${st(7)}/><circle cx="0" cy="0" r="18" fill="${INK}"/><rect x="-7" y="6" width="14" height="44" fill="${INK}"/>`, 960, 560, 1)}
  ${G('S9-key', P.key(), 1500, 560, 1)}${G('S9-k', tick(GRN, 70), 1220, 430, 1)}</g>${vign}
  ${T('S9-l', 'ΕΚΚΛΗΣΙΑΣΤΙΚΑ ΖΗΤΗΜΑΤΑ', 960, 150, 88, '#fff', 'middle', 13)}${T('S9-l2', 'ΛΥΘΗΚΑΝ', 1500, 330, 84, GRN, 'middle', 12)}`);

// S10 «και όλοι οι πολιτικοί πρέσβευαν το ορθόδοξο δόγμα» — every politician under the same cross
const cross = `<g><rect x="-9" y="-60" width="18" height="120" rx="4" fill="${GOLD}" ${st(5)}/><rect x="-40" y="-30" width="80" height="18" rx="4" fill="${GOLD}" ${st(5)}/></g>`;
shot('S10', mid(9, 'πολιτικοί'), cut(10), `<g id="S10-cam">${skyW(-400, W + 800, 870, '#cfe6ee', '#f6f4ea')}${clouds('S10', [[250, 160, .8], [1700, 140, .9]])}
  ${[0, 1, 2].map(i => G(`S10-m${i}`, [en, frm, ru][i](`s10m${i}`, { start: 'happy' }), 560 + i * 400, 880, 1)).join('')}
  ${[0, 1, 2].map(i => G(`S10-x${i}`, cross, 560 + i * 400, 430, 1)).join('')}</g>${vign}
  ${T('S10-l', 'ΟΛΟΙ ΟΙ ΠΟΛΙΤΙΚΟΙ', 960, 150, 88, '#fff', 'middle', 13)}${T('S10-l2', 'ΟΡΘΟΔΟΞΟ ΔΟΓΜΑ', 960, 270, 80, YEL, 'middle', 12)}`);

// S11 «δεν είχε λόγο ύπαρξης, εφόσον δεν είχε θέσεις για πιο επίκαιρα θέματα» — blank placard; current issues fly past
shot('S11', cut(10), cut(12), `<g id="S11-cam">${skyW(-400, W + 800, 870, '#c9d3d6', '#eef0ea', '#b9ab88')}
  ${G('S11-m', ru('s11m', { start: 'sad' }), 560, 880, 1.1)}${G('S11-pl', placard(''), 820, 640, 1)}${G('S11-q', txt('?', 0, 0, 110, INK), 820, 560, 1)}
  ${[0, 1, 2].map(i => G(`S11-n${i}`, P.newspaper('ΕΦΗΜΕΡΙΣ'), 1300 + i * 170, 470 + (i % 2) * 120, .55)).join('')}
  ${G('S11-x', xMark(RED, 60, 22), 960, 155, 1)}</g>${vign}
  ${T('S11-l', 'ΛΟΓΟΣ ΥΠΑΡΞΗΣ', 960, 170, 96, '#fff', 'middle', 14)}${T('S11-l2', 'ΕΠΙΚΑΙΡΑ ΘΕΜΑΤΑ', 1470, 300, 70, YEL, 'middle', 11)}`);

// S12 «Ο Κωλέττης, ως αρχηγός του γαλλικού κόμματος» — Kolettis lands before the French-party banner
shot('S12', cut(12), cut(14), `<g id="S12-cam">${skyW(-400, W + 800, 880, '#d9cde6', '#f6f2ea')}
  ${G('S12-f', flagP(FRC, 360, 230, 640), 1350, 900, 1)}${G('S12-ff', P.flag('fr', 120, 80), 1540, 360, 1)}
  ${[0, 1].map(i => G(`S12-b${i}`, frm(`s12b${i}`), [380, 1660][i], 880, .7)).join('')}
  ${G('S12-k', kol('s12k'), 960, 890, 1.25)}</g>${vign}
  ${T('S12-l', 'ΑΡΧΗΓΟΣ ΓΑΛΛΙΚΟΥ ΚΟΜΜΑΤΟΣ', 960, 150, 84, '#fff', 'middle', 13)}${G('S12-tg', card('ΚΩΛΕΤΤΗΣ', '#efe4c9', 54), 960, 330, 1)}`);

// S13 «επεδίωκε μια κυβερνητική πολιτική που θα ενίσχυε το ρόλο του βασιλιά» — Kolettis pumps the King up
shot('S13', cut(14), cut(15), `<g id="S13-cam">${room('#d9c8a4', 880)}
  ${G('S13-th', P.throne('#B8323A'), 1320, 880, 1.15)}${G('S13-o', otto('s13o'), 1320, 885, 1)}
  ${G('S13-k', kol('s13k'), 520, 885, 1)}${G('S13-bl', bellows, 680, 650, 1)}
  ${G('S13-ar', arrowUp(GRN, 1.3), 1640, 520, 1)}</g>${vign}
  ${T('S13-l', 'ΚΥΒΕΡΝΗΤΙΚΗ ΠΟΛΙΤΙΚΗ', 960, 140, 76, '#fff', 'middle', 12)}${T('S13-l2', 'ΡΟΛΟΣ ΤΟΥ ΒΑΣΙΛΙΑ', 1320, 250, 74, YEL, 'middle', 12)}
  ${G('S13-tg', tag('ΟΘΩΝ', '#fff', 40), 1100, 360, 1)}`);

// S14 «υπονομεύοντας έτσι τον κοινοβουλευτισμό» — Kolettis digs a tunnel under parliament, it tilts
shot('S14', cut(15), cut(16), `<defs><clipPath id="S14-under"><rect x="-400" y="640" width="${W + 800}" height="700"/></clipPath></defs><g id="S14-cam">${skyW(-400, W + 800, 640, '#cfe6ee', '#f6f4ea', '#8a6a46')}
  <g clip-path="url(#S14-under)"><path id="S14-tun" d="M 420 900 Q 700 880 900 820 Q 1060 780 1160 700" fill="none" stroke="#3b2a1c" stroke-width="90" stroke-linecap="round" pathLength="1000" stroke-dasharray="1000 1000" stroke-dashoffset="1000"/>
  ${G('S14-k', kol('s14k', { prop: `<g transform="translate(70,-180) rotate(30) scale(.7)">${P.shovel()}</g>` }), 520, 900, .8)}</g>
  ${G('S14-b', P.building('ΚΟΙΝΟΒΟΥΛΙΟ'), 1180, 642, 1.35)}</g>${vign}
  ${T('S14-l', 'ΚΟΙΝΟΒΟΥΛΕΥΤΙΣΜΟΣ', 960, 150, 92, '#fff', 'middle', 14)}`);

// S15 «Δεν δίσταζε να χρησιμοποιεί βία και νοθεία για να τρομοκρατεί τους εκλογείς» — thugs, stuffed ballots, scared voters
shot('S15', cut(16), cut(17), `<g id="S15-cam">${skyW(-400, W + 800, 880, '#d6dde0', '#f2f0e6')}
  ${G('S15-bx', P.ballotBox(), 980, 880, 1.15)}
  ${[0, 1].map(i => G(`S15-t${i}`, thug(`s15t${i}`, { start: 'angry' }), 320 + i * 280, 885, .95)).join('')}
  ${[0, 1].map(i => G(`S15-c${i}`, club, 400 + i * 280, 640, 1)).join('')}
  ${[0, 1, 2].map(i => G(`S15-v${i}`, voter(`s15v${i}`), 1300 + i * 170, 885, .9)).join('')}
  ${[0, 1, 2].map(i => G(`S15-p${i}`, ballot, 980, 560, 1)).join('')}</g>${vign}
  ${T('S15-l', 'ΒΙΑ', 470, 220, 120, RED, 'middle', 15)}${T('S15-l2', 'ΝΟΘΕΙΑ', 980, 220, 120, RED, 'middle', 15)}${T('S15-l3', 'ΕΚΛΟΓΕΙΣ', 1550, 330, 70, '#fff', 'middle', 11)}`);

// S16 «ώστε να ψηφίζουν υπέρ του κόμματός του» — ballots fly into the purple French-party box
shot('S16', cut(17), cut(18), `<g id="S16-cam">${room('#e2cfa6', 880)}
  ${G('S16-bx', ballotC(FRC, 'ΓΑΛΛΙΚΟ'), 1250, 880, 1.25)}
  ${[0, 1, 2].map(i => G(`S16-v${i}`, voter(`s16v${i}`, { start: 'sad' }), 380 + i * 210, 885, .9)).join('')}
  ${[0, 1, 2].map(i => G(`S16-p${i}`, ballot, 420 + i * 210, 560, 1)).join('')}${G('S16-k', tick(FRC, 60), 1480, 420, 1)}</g>${vign}
  ${T('S16-l', 'ΥΠΕΡ ΤΟΥ ΚΟΜΜΑΤΟΣ ΤΟΥ', 960, 160, 84, '#fff', 'middle', 13)}`);

// S17 «Το 1846/1847 κατείχε πέντε από τα επτά υπουργεία» — a corridor of seven doors, five wear his portrait
const ME = [0, 1, 3, 4, 6];   // the five doors that become his
shot('S17', cut(18), cut(19), `<defs><clipPath id="S17-clip"><circle cx="0" cy="0" r="62"/></clipPath></defs><g id="S17-cam">${room('#d3bf94', 880, -400, W + 1200)}
  ${Array.from({ length: 7 }, (_, i) => G(`S17-d${i}`, door(170, 330), 120 + i * 280, 880, 1)).join('')}
  ${Array.from({ length: 7 }, (_, i) => G(`S17-q${i}`, `<circle r="70" fill="#efe4c9" ${st(6)}/>`, 120 + i * 280, 470, 1)).join('')}
  ${ME.map(i => G(`S17-k${i}`, `<circle r="70" fill="#d9cde6" ${st(6)}/><g clip-path="url(#S17-clip)"><g transform="translate(0,75) scale(.34)">${kol(`s17k${i}`)}</g></g><circle r="70" fill="none" ${st(7)}/>`, 120 + i * 280, 470, 1)).join('')}</g>${vign}
  ${T('S17-y', '1846/1847', 960, 170, 120, YEL, 'middle', 15)}${T('S17-l', 'ΥΠΟΥΡΓΕΙΑ', 960, 300, 80, '#fff', 'middle', 12)}`);

// S18 «δεν παρουσιαζόταν όμως σχεδόν καθόλου στο Κοινοβούλιο» — benches of MPs, his seat empty with a cobweb
const bench = `<g><rect x="-150" y="-120" width="300" height="40" rx="8" fill="#8a5a32" ${st(6)}/><rect x="-140" y="-80" width="24" height="80" fill="#5a3a1e" ${st(4)}/><rect x="116" y="-80" width="24" height="80" fill="#5a3a1e" ${st(4)}/></g>`;
shot('S18', cut(19), mid(19, 'καθιστούσε'), `<g id="S18-cam">${room('#d8c39a', 880)}
  ${[0, 1, 2].map(i => G(`S18-m${i}`, mp(`s18m${i}`), [330, 750, 1590][i], 860, .82)).join('')}
  ${[0, 1, 2].map(i => G(`S18-be${i}`, bench, [330, 750, 1590][i], 900, 1)).join('')}
  ${G('S18-e', `${bench}${G('S18-pl', card('ΚΩΛΕΤΤΗΣ', '#d9cde6', 34), 0, -150, 1)}`, 1170, 900, 1)}${G('S18-w', cobweb, 1060, 640, 1.4)}</g>${vign}
  ${T('S18-l', 'ΚΟΙΝΟΒΟΥΛΙΟ', 960, 150, 96, '#fff', 'middle', 14)}${G('S18-st', P.stamp('ΑΠΩΝ', RED, 300, 80), 1170, 450, 1)}`);

// S19 «και καθιστούσε αδύνατο τον έλεγχο της εκτελεστικής εξουσίας» — the magnifier of control bounces off a locked door
shot('S19', mid(19, 'καθιστούσε'), cut(20), `<g id="S19-cam">${room('#e2cfa6', 900)}
  ${G('S19-dr', door(380, 600), 1260, 900, 1)}${G('S19-lk', P.padlock('#D8A93B'), 1260, 620, 1.4)}
  ${G('S19-m', mp('s19m'), 460, 905, 1.05)}${G('S19-mg', P.magnifier(), 760, 560, .8)}
  ${G('S19-x', xMark(RED, 80, 26), 1010, 560, 1)}</g>${vign}
  ${T('S19-l', 'ΕΚΤΕΛΕΣΤΙΚΗ ΕΞΟΥΣΙΑ', 1260, 170, 80, '#fff', 'middle', 12)}${T('S19-l2', 'ΕΛΕΓΧΟΣ', 700, 400, 64, YEL, 'middle', 10)}${T('S19-l3', 'ΑΔΥΝΑΤΟ', 1010, 400, 64, RED, 'middle', 10)}`);

// S20 «Επέβαλε έτσι ένα είδος κοινοβουλευτικής δικτατορίας» — Kolettis towers on a podium over tiny MPs
shot('S20', cut(20), cut(21), `<g id="S20-cam">${room('#cdb88c', 900)}
  ${G('S20-pd', `<rect x="-170" y="-330" width="340" height="330" fill="#8a5a32" ${st(7)}/><rect x="-200" y="-350" width="400" height="40" rx="8" fill="#6b4422" ${st(6)}/>`, 960, 900, 1)}
  ${G('S20-k', kol('s20k', { start: 'angry', arms: 'up' }), 960, 560, 1.05)}
  ${[0, 1, 2, 3].map(i => G(`S20-m${i}`, mp(`s20m${i}`, { start: 'shock' }), [300, 520, 1400, 1620][i], 905, .62)).join('')}</g>${vign}
  ${G('S20-st', P.stamp('ΚΟΙΝΟΒΟΥΛΕΥΤΙΚΗ ΔΙΚΤΑΤΟΡΙΑ', RED, 1180, 74), 960, 115, 1)}`);

// S21 «Μετά το θάνατο του Κωλέττη, το 1847» — his portrait with a black ribbon and a candle
shot('S21', cut(21), cut(23), `<defs><clipPath id="S21-clip"><rect x="-200" y="-250" width="400" height="500"/></clipPath></defs><g id="S21-cam">${room('#3b3540', 900)}
  ${G('S21-fr', `<rect x="-200" y="-250" width="400" height="500" fill="#d9cde6"/><g clip-path="url(#S21-clip)"><g transform="translate(0,235) scale(1.05)">${kol('s21k')}</g></g>${P.frame(400, 500)}`, 960, 470, .9)}
  ${G('S21-rb', `<path d="M -230 -290 L -150 -290 L 230 210 L 150 210 Z" fill="${INK}" opacity=".92"/>`, 960, 470, .9)}
  ${G('S21-cd', `<rect x="-22" y="-160" width="44" height="160" rx="6" fill="#f4efe4" ${st(5)}/>${G('S21-fl', `<path d="M 0 -230 Q 26 -196 0 -166 Q -26 -196 0 -230 Z" fill="#FFD54A" ${st(4)}/>`, 0, 0, 1)}`, 1400, 860, 1)}</g>${vign}
  ${T('S21-y', '1847', 960, 140, 120, YEL, 'middle', 15)}${T('S21-l', 'ΘΑΝΑΤΟΣ', 1400, 500, 72, '#fff', 'middle', 11)}`);

// S22 «το γαλλικό κόμμα πέρασε σε φάση παρακμής» — the purple flag withers to grey and sinks
shot('S22', cut(23), cut(24), `<g id="S22-cam">${skyW(-400, W + 800, 880, '#c9c3d6', '#eeeaf0', '#b9ab88')}
  ${G('S22-f', `${flagP(FRC, 360, 230, 640)}<g id="S22-g" opacity="0">${flagP(GREY, 360, 230, 640)}</g>`, 860, 900, 1)}
  ${G('S22-ar', arrowDn(RED, 1.6), 1500, 520, 1)}</g>${vign}
  ${T('S22-l', 'ΓΑΛΛΙΚΟ ΚΟΜΜΑ', 960, 190, 92, '#fff', 'middle', 14)}${T('S22-l2', 'ΠΑΡΑΚΜΗ', 1500, 300, 110, RED, 'middle', 14)}`);

// S23 «καθώς επικράτησε διαμάχη για τη διαδοχή» — two members tug the empty leader's chair
const chair = `<g><rect x="-80" y="-300" width="160" height="210" rx="20" fill="${FRC}" ${st(6)}/><rect x="-100" y="-100" width="200" height="40" rx="10" fill="#6b4a7a" ${st(6)}/><rect x="-90" y="-60" width="22" height="60" fill="#5a3a1e" ${st(4)}/><rect x="68" y="-60" width="22" height="60" fill="#5a3a1e" ${st(4)}/></g>`;
shot('S23', cut(24), cut(25), `<g id="S23-cam">${room('#d9c8a4', 880)}
  ${G('S23-ch', chair, 960, 880, 1.15)}
  ${G('S23-a', frm('s23a', { start: 'angry', arms: 'hold' }), 640, 885, 1)}${G('S23-b', frm('s23b', { start: 'angry', arms: 'hold', faceC: '#7a4a2a', hairC: '#7a4a2a' }), 1280, 885, 1)}
  ${G('S23-bt', bolt(), 960, 380, .9)}</g>${vign}
  ${T('S23-l', 'ΔΙΑΜΑΧΗ', 960, 150, 110, RED, 'middle', 14)}${T('S23-l2', 'ΔΙΑΔΟΧΗ', 960, 270, 80, '#fff', 'middle', 12)}`);

// S24 «Η τακτική του βασιλιά Όθωνα … κυβερνητικούς υποψηφίους στις εκλογές» — Otto lifts his candidates on a podium
shot('S24', cut(25), mid(25, 'οδήγησε'), `<g id="S24-cam">${skyW(-400, W + 800, 880, '#cfe6ee', '#f6f4ea')}
  ${G('S24-pd', `<rect x="-330" y="-140" width="660" height="140" fill="${GOLD}" ${st(7)}/>${G('S24-cs', [0, 1, 2].map(i => G(`S24-c${i}`, cand(`s24c${i}`, i, { start: 'happy' }), -200 + i * 200, -140, .8)).join(''), 0, 0, 1)}`, 900, 880, 1)}
  ${G('S24-o', otto('s24o', { arms: 'up' }), 380, 885, 1)}${G('S24-ar', arrowUp(GRN, 1.1), 1310, 620, 1)}${G('S24-bx', P.ballotBox(), 1560, 880, .9)}</g>${vign}
  ${T('S24-l', 'ΚΥΒΕΡΝΗΤΙΚΟΙ ΥΠΟΨΗΦΙΟΙ', 900, 150, 84, '#fff', 'middle', 13)}${T('S24-l2', 'ΕΚΛΟΓΕΣ', 1560, 520, 72, YEL, 'middle', 11)}`);

// S25 «οδήγησε τα κόμματα της αντιπολίτευσης σε διαρκή σύγκρουση με την αυλή» — opposition vs the palace, bolts between
shot('S25', mid(25, 'οδήγησε'), cut(26), `<g id="S25-cam">${skyW(-400, W + 800, 880, '#d6dde0', '#f2f0e6')}
  ${G('S25-pa', P.palace('grland'), 1360, 880, 1)}${G('S25-ct', courtier('s25ct', { start: 'angry' }), 1720, 885, 1)}
  ${[0, 1, 2].map(i => G(`S25-m${i}`, [en, frm, ru][i](`s25m${i}`, { start: 'angry' }), 280 + i * 200, 885, .85)).join('')}
  ${[0, 1, 2].map(i => G(`S25-b${i}`, bolt(), 900 + i * 90, 460 + (i % 2) * 120, .8)).join('')}</g>${vign}
  ${T('S25-l', 'ΑΝΤΙΠΟΛΙΤΕΥΣΗ', 480, 230, 72, '#fff', 'middle', 11)}${T('S25-l2', 'ΑΥΛΗ', 1500, 230, 90, YEL, 'middle', 13)}${T('S25-l3', 'ΣΥΓΚΡΟΥΣΗ', 960, 110, 96, RED, 'middle', 14)}`);

// S26 «σε μια περίοδο που οι διαφωνίες τους είχαν απαλυνθεί» — a zig-zag between the three softens into a wave
shot('S26', cut(26), cut(27), `<g id="S26-cam">${skyW(-400, W + 800, 880, '#d9ecef', '#f8f6ee')}${clouds('S26', [[300, 150, .8], [1650, 140, .9]])}
  ${[0, 1, 2].map(i => G(`S26-m${i}`, [en, frm, ru][i](`s26m${i}`), 460 + i * 500, 885, .95)).join('')}
  <g transform="translate(0,-140)"><path id="S26-zz" d="M 520 520 L 600 460 L 680 580 L 760 460 L 840 580 L 920 460 L 1000 580 L 1080 460 L 1160 580 L 1240 460 L 1320 580 L 1400 520" fill="none" stroke="${RED}" stroke-width="16" stroke-linejoin="round"/>
  <path id="S26-wv" d="M 520 520 Q 600 480 680 520 Q 760 560 840 520 Q 920 480 1000 520 Q 1080 560 1160 520 Q 1240 480 1320 520 Q 1360 540 1400 520" fill="none" stroke="${GRN}" stroke-width="16" opacity="0"/></g></g>${vign}
  ${T('S26-l', 'ΔΙΑΦΩΝΙΕΣ', 960, 160, 100, '#fff', 'middle', 14)}${T('S26-l2', 'ΑΠΑΛΥΝΘΗΚΑΝ', 960, 300, 76, GRN, 'middle', 12)}`);

// S27 «Κατά την περίοδο του Κριμαϊκού πολέμου» — a battlefield: Russia against Britain + France
const cannon = `<g><rect x="-20" y="-70" width="150" height="44" rx="20" fill="#3a3f48" ${st(6)}/><circle cx="-10" cy="-24" r="40" fill="#7a5232" ${st(6)}/></g>`;
shot('S27', cut(27), mid(27, 'αγγλικό'), `<g id="S27-cam">${skyW(-400, W + 800, 860, '#c9c3bd', '#ece4d6', '#a99a74')}
  ${G('S27-l', `${G('S27-ca', cannon, 0, 0, 1)}${G('S27-fr', natFlag('ru', 130, 86, 280), -160, 0, 1)}`, 480, 870, 1)}
  ${G('S27-r', `<g transform="scale(-1,1)">${cannon}</g>${G('S27-fu', natFlag('uk', 130, 80, 280), 140, 0, 1)}${G('S27-ff', natFlag('fr', 130, 86, 280), 300, 0, 1)}`, 1400, 870, 1)}
  ${[0, 1, 2, 3].map(i => G(`S27-s${i}`, `<circle r="60" fill="#e8e4dc" ${st(5)}/><circle cx="50" cy="-20" r="44" fill="#e8e4dc" ${st(5)}/>`, 700 + i * 170, 700 - (i % 2) * 90, .9)).join('')}</g>${vign}
  ${T('S27-t', 'ΚΡΙΜΑΙΚΟΣ ΠΟΛΕΜΟΣ', 960, 170, 104, '#fff', 'middle', 15)}`);

// S28 «το αγγλικό και γαλλικό κόμμα έχασαν την εμπιστοσύνη των οπαδών τους» — the followers turn away, a heart cracks
shot('S28', mid(27, 'αγγλικό'), cut(28), `<g id="S28-cam">${skyW(-400, W + 800, 880, '#d6dde0', '#f2f0e6')}
  ${G('S28-a', en('s28a', { start: 'shock' }), 380, 885, 1)}${G('S28-b', frm('s28b', { start: 'shock' }), 620, 885, 1)}
  ${[0, 1, 2, 3].map(i => G(`S28-c${i}`, cit(`s28c${i}`, i), 1150 + i * 180, 885, .85)).join('')}
  ${G('S28-hl', `<path d="M 0 -40 Q -70 -110 -120 -50 Q -150 10 0 120 L 10 40 L -12 0 L 8 -36 Z" fill="${RED}" ${st(6)}/>`, 960, 470, 1)}
  ${G('S28-hr', `<path d="M 0 -40 Q 70 -110 120 -50 Q 150 10 0 120 L 10 40 L -12 0 L 8 -36 Z" fill="${RED}" ${st(6)}/>`, 960, 470, 1)}</g>${vign}
  ${T('S28-l', 'ΕΜΠΙΣΤΟΣΥΝΗ', 960, 160, 96, '#fff', 'middle', 14)}${T('S28-l2', 'ΟΠΑΔΟΙ', 1420, 330, 72, YEL, 'middle', 11)}
  ${G('S28-t1', tag('ΑΓΓΛΙΚΟ', ENC, 36), 380, 400, 1)}${G('S28-t2', tag('ΓΑΛΛΙΚΟ', FRC, 36), 620, 330, 1)}`);

// S29 «μετά τη βίαιη συμπεριφορά της Αγγλίας και της Γαλλίας απέναντι στην Ελλάδα» — John Bull and Marianne loom over Hellas
shot('S29', cut(28), cut(29), `<g id="S29-cam">${skyW(-400, W + 800, 880, '#c9d3d6', '#eef0ea')}
  ${G('S29-j', P.johnbull('s29j', { start: 'angry', arms: 'up' }), 520, 885, 1.3)}${G('S29-m', P.marianne('s29m', { start: 'angry' }), 1400, 885, 1.3)}
  ${G('S29-h', hellas('s29h', { start: 'shock' }), 960, 885, .8)}</g>${vign}
  ${T('S29-l', 'ΒΙΑΙΗ ΣΥΜΠΕΡΙΦΟΡΑ', 960, 140, 84, RED, 'middle', 13)}
  ${G('S29-t1', tag('ΑΓΓΛΙΑ', '#fff', 40), 520, 320, 1)}${G('S29-t2', tag('ΓΑΛΛΙΑ', '#fff', 40), 1400, 320, 1)}${G('S29-t3', tag('ΕΛΛΑΔΑ', '#9fc3e8', 40), 960, 520, 1)}`);

// S30 «με το ναυτικό αποκλεισμό της χώρας» — British and French sailing warships chained across the port
shot('S30', cut(29), cut(30), `<g id="S30-cam"><rect x="-400" y="-300" width="${W + 800}" height="${H + 600}" fill="#bfe0ea"/><rect x="-400" y="560" width="${W + 800}" height="800" fill="#79AFC4" stroke="${INK}" stroke-width="5"/>
  ${G('S30-ld', `<path d="M -300 0 L -300 -120 Q -150 -170 0 -130 Q 120 -100 200 0 Z" fill="#E6D3A8" ${st(6)}/>${G('S30-hs', P.house(), -120, -120, .6)}${G('S30-gf', natFlag('grland', 90, 60, 200), 60, -110, 1)}`, 240, 600, 1)}
  ${[0, 1, 2].map(i => G(`S30-s${i}`, `${P.sailship(i === 1 ? '#3a4a6b' : '#7a5232')}<g transform="translate(98,-478)">${P.flag(i === 1 ? 'fr' : 'uk', 90, 60)}</g>`, 820 + i * 380, 780, .62)).join('')}
  ${line('S30-ch', 650, 790, 1700, 790, '#5a5f6a', 16)}</g>${vign}
  ${T('S30-l', 'ΝΑΥΤΙΚΟΣ ΑΠΟΚΛΕΙΣΜΟΣ', 960, 140, 92, '#fff', 'middle', 14)}`);

// S31 «Είχε προηγηθεί και η υπόθεση Πατσίφικο» — the clock spins back, a dossier drops
shot('S31', cut(30), cut(31), `<g id="S31-cam">${room('#d9c8a4', 880)}
  ${G('S31-ck', `<circle r="150" fill="#fbf8f0" ${st(8)}/>${Array.from({ length: 12 }, (_, i) => `<path d="M 0 -130 L 0 -112" transform="rotate(${i * 30})" stroke="${INK}" stroke-width="7"/>`).join('')}${G('S31-h', `<rect x="-6" y="-110" width="12" height="110" rx="6" fill="${INK}"/>`, 0, 0, 1)}<circle r="14" fill="${INK}"/><path d="M -190 -40 A 190 190 0 0 1 -60 -180" fill="none" stroke="${RED}" stroke-width="12"/><path d="M -60 -180 L -96 -196 L -84 -160 Z" fill="${RED}"/>`, 520, 520, 1)}
  ${G('S31-d', `<path d="M -240 -170 L -80 -170 L -50 -140 L 240 -140 L 240 170 L -240 170 Z" fill="#d9b66a" ${st(7)}/>${txt('ΥΠΟΘΕΣΗ', 0, -40, 64)}${txt('ΠΑΤΣΙΦΙΚΟ', 0, 60, 76, RED)}`, 1300, 560, 1)}</g>${vign}
  ${T('S31-l', 'ΕΙΧΕ ΠΡΟΗΓΗΘΕΙ', 520, 170, 80, '#fff', 'middle', 12)}`);

// S32 «η οποία είχε δυσχεράνει τις σχέσεις των χωρών» — the rope between the flags frays and snaps
shot('S32', cut(31), cut(32), `<g id="S32-cam">${skyW(-400, W + 800, 880, '#cfd8dc', '#f2f0e6')}
  ${G('S32-gr', natFlag('grland', 200, 134, 520), 340, 880, 1)}
  ${G('S32-uk', natFlag('uk', 200, 120, 520), 1450, 880, 1)}${G('S32-fr', natFlag('fr', 200, 134, 520), 1640, 880, .8)}
  ${G('S32-rl', `<path d="M 0 0 Q 260 60 520 20" fill="none" stroke="#9a6a3a" stroke-width="16" stroke-linecap="round"/>`, 360, 420, 1)}
  ${G('S32-rr', `<path d="M 0 20 Q 260 60 520 0" fill="none" stroke="#9a6a3a" stroke-width="16" stroke-linecap="round"/>`, 900, 420, 1)}
  ${G('S32-bt', bolt(), 900, 440, .8)}</g>${vign}
  ${T('S32-l', 'ΣΧΕΣΕΙΣ', 960, 170, 110, '#fff', 'middle', 14)}`);

// S33 «Το ρωσικό κόμμα είχε κάποια προσωρινά κέρδη από αυτό» — coins rise for the Russian party; an hourglass runs
shot('S33', cut(32), cut(33), `<g id="S33-cam">${room('#e2cfa6', 880)}
  ${G('S33-m', ru('s33m', { start: 'happy', arms: 'up' }), 700, 885, 1.15)}
  ${[0, 1, 2, 3].map(i => G(`S33-c${i}`, `<circle r="34" fill="#E8B83A" ${st(5)}/><circle r="20" fill="none" stroke="#b8862a" stroke-width="5"/>`, 560 + i * 90, 420, 1)).join('')}
  ${G('S33-hg', `<path d="M -80 -150 L 80 -150 L 10 0 L 80 150 L -80 150 L -10 0 Z" fill="#fbf8f0" ${st(7)}/><rect x="-100" y="-170" width="200" height="24" rx="8" fill="#7a5232" ${st(5)}/><rect x="-100" y="146" width="200" height="24" rx="8" fill="#7a5232" ${st(5)}/>${G('S33-st', `<path d="M -60 -130 L 60 -130 L 4 -10 L -4 -10 Z" fill="#E8B83A"/>`, 0, 0, 1)}${G('S33-sb', `<path d="M -66 140 L 66 140 L 0 60 Z" fill="#E8B83A"/>`, 0, 0, 1)}`, 1400, 560, 1)}</g>${vign}
  ${T('S33-l', 'ΚΕΡΔΗ', 700, 220, 110, GRN, 'middle', 14)}${T('S33-l2', 'ΠΡΟΣΩΡΙΝΑ', 1400, 290, 76, YEL, 'middle', 12)}`);

// S34 «Η ήττα όμως της Ρωσίας … αποδυνάμωση του κόμματος» — the Russian flag snaps; the party man shrinks
shot('S34', cut(33), cut(34), `<g id="S34-cam">${skyW(-400, W + 800, 880, '#c9c3bd', '#ece4d6', '#a99a74')}
  ${G('S34-f', natFlag('ru', 220, 146, 560), 520, 880, 1)}
  ${G('S34-m', ru('s34m', { start: 'sad' }), 1300, 885, 1.15)}</g>${vign}
  ${T('S34-l', 'ΗΤΤΑ ΤΗΣ ΡΩΣΙΑΣ', 700, 160, 92, RED, 'middle', 14)}${T('S34-l2', 'ΑΠΟΔΥΝΑΜΩΣΗ', 1300, 300, 76, '#fff', 'middle', 12)}`);

// S35 «το οποίο σταδιακά εξαφανίστηκε από την πολιτική σκηνή» — on a stage the Russian party fades and the curtain closes
shot('S35', cut(34), C.end + 2.4, `<g id="S35-cam">${room('#3b3540', 900)}
  <rect x="160" y="720" width="1600" height="180" fill="#8a5a32" stroke="${INK}" stroke-width="6"/>
  ${G('S35-m', ru('s35m', { start: 'sad' }), 960, 760, 1.05)}
  ${G('S35-cl', `<rect x="-1000" y="-60" width="1000" height="900" fill="#9c2a2a" ${st(6)}/>${[1, 2, 3, 4].map(i => `<path d="M ${-i * 200} -60 V 840" stroke="#7a1f1f" stroke-width="10"/>`).join('')}`, 160, 0, 1)}
  ${G('S35-cr', `<rect x="0" y="-60" width="1000" height="900" fill="#9c2a2a" ${st(6)}/>${[1, 2, 3, 4].map(i => `<path d="M ${i * 200} -60 V 840" stroke="#7a1f1f" stroke-width="10"/>`).join('')}`, 1760, 0, 1)}
  <rect x="100" y="-40" width="1720" height="110" fill="#6b1f2a" stroke="${INK}" stroke-width="6"/></g>${vign}
  ${T('S35-l', 'ΠΟΛΙΤΙΚΗ ΣΚΗΝΗ', 960, 200, 96, YEL, 'middle', 14)}
  <rect id="S35-black" width="${W}" height="${H}" fill="#000" opacity="0"/>`);

// ---------- page ----------
const HL = ['παρακμή', 'συνταγματικό καθεστώς', 'συμπτώματα στασιμότητας', 'νέεςανάγκες', '(1844-1864)', 'ρωσικού κόμματος', 'Ορθόδοξη Εκκλησία', 'ναπαίοι',
  'ορθόδοξο δόγμα', 'λόγο ύπαρξης', 'επίκαιρα θέματα', 'Κωλέττης', 'γαλλικού κόμματος', 'ρόλο του βασιλιά', 'κοινοβουλευτισμό', 'βία και νοθεία', '1846/1847',
  'πέντε από τα επτά υπουργεία', 'έλεγχο της εκτελεστικής εξουσίας', 'κοινοβουλευτικής δικτατορίας', '1847', 'διαδοχή', 'κυβερνητικούς υποψηφίους',
  'σύγκρουση με την αυλή', 'απαλυνθεί', 'Κριμαϊκού πολέμου', 'εμπιστοσύνη', 'ναυτικό αποκλεισμό', 'υπόθεση Πατσίφικο', 'προσωρινά κέρδη', 'ήττα', 'αποδυνάμωση', 'πολιτική σκηνή'];
const subs = makeSubs(timing, HL, { skipBefore: S(2) - .2 });
const n = buildPage({ out: path.join(HERE, 'build/video.html'), shots, subs, C, extraDefs: '', data: {},
  runtimeJs: '../../../engine/runtime.js', shotsJs: '../shots.js' });
fs.writeFileSync(path.join(HERE, 'build/cues.json'), JSON.stringify({ ...C, DUR: C.end + 2.4 }, null, 1));
for (let i = 1; i < shots.length; i++) if (shots[i].a !== shots[i - 1].b) throw new Error(`shots do not tile at ${shots[i].id}`);
console.log('built', (n / 1e6).toFixed(2), 'MB,', shots.length, 'shots, duration', (C.end + 2.4).toFixed(1), 's');
