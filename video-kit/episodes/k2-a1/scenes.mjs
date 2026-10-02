// Κεφ.2 Α.1 «Πελατειακά δίκτυα επί τουρκοκρατίας» (k2-a1) — SCENES (node side).
// Run from the kit root:  node episodes/k2-a1/scenes.mjs   →  build/video.html + build/cues.json
// ⚠️ EVERY time is derived from the narration (S/E/Wt) — never a literal second — so the final ElevenLabs voice
//    re-times the whole film by re-running align.py + subs.py. shots.js reads shot bounds from D.shots, never numbers.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildMap } from '../../engine/map.mjs';
import { P, W, H, INK, RED, SAND, YEL, SEA, NIGHT, cueTools, G, T, sky, night, clouds, vign, pin, mapDefs, seaLand, buildPage, makeSubs } from '../../engine/page.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const { timing, PH, S, E, Wt } = cueTools(path.join(HERE, 'timing.json'));

// episode colours (STORYBOARD.md → «Colour meaning»)
const OTT = '#B8323A', GOLD = '#D8A93B', TEAL = '#3E9C94', PURP = '#8A5BB0', AMB = '#F2B84B';

// ---------- cues ----------
const C = {
  t1: 0.05, t2: S(1),
  proep: Wt(2, 'προεπαναστατική'), antik: Wt(3, 'αντικειμενικούς'),
  ellines: Wt(4, 'Έλληνες'), sygkr: Wt(4, 'συγκροτήσουν'), kommata4: Wt(4, 'κόμματα'),
  alli: Wt(5, 'άλλη'), ypost: Wt(5, 'υποστήριξης'), symf: Wt(5, 'συμφερόντων'),
  pelat: Wt(6, 'πελατειακά'), organ: Wt(7, 'οργάνωση'), logoi: Wt(7, 'λόγοι'), exis: Wt(7, 'εξής'), odig: Wt(7, 'οδήγησαν'),
  antag: Wt(8, 'ανταγωνισμός'), katal: Wt(8, 'κατάληψη'), theseon: Wt(8, 'θέσεων'),
  ellip: Wt(9, 'ελλιπής'), prost: Wt(9, 'προστασίας'), othom9: Wt(9, 'οθωμανικής'), afth: Wt(9, 'αυθαιρεσιών'), ypik: Wt(9, 'υπηκόους'), perip: Wt(9, 'περιπτώσεις'),
  apous: Wt(10, 'απουσία'), pron: Wt(10, 'πρόνοιας'),
  diark: Wt(11, 'διαρκή'), avev: Wt(11, 'αβεβαιότητας'),
  katafeug: Wt(12, 'καταφεύγουν'), kratik: Wt(12, 'κρατικούς'), asfal: Wt(13, 'ασφάλεια'), stoix: Wt(13, 'στοιχειώδη'),
  protos: Wt(14, 'πρώτος'), evryt: Wt(14, 'ευρύτερη'),
  orizon: Wt(15, 'οριζόντια'), katheta: Wt(15, 'κάθετα'), patron: Wt(15, 'πάτρωνες'), ypsil: Wt(16, 'υψηλότερη'),
  pelop: Wt(17, 'Πελοπόννησο'), xilia: Wt(19, 'χίλια'), anapt: Wt(19, 'αναπτύχθηκαν'), dyo: Wt(19, 'δύο'), patr19: Wt(19, 'πατρωνίας'),
  koryfi: Wt(20, 'κορυφή'), prokr: Wt(20, 'προκρίτων'),
  entonos: Wt(21, 'έντονος'), epirr: Wt(21, 'επιρροής'), epipeda: Wt(21, 'επίπεδα'), dimth: Wt(21, 'δημοσίων'),
  sterea: Wt(22, 'Στερεά'), armat: Wt(22, 'μεγαλοαρματολοί'), nisia: Wt(23, 'νησιά'),
  igesia: Wt(25, 'ηγεσία'), ploio: Wt(25, 'πλοιοκτητών'), megal25: Wt(25, 'μεγάλων'),
  katop: Wt(26, 'κατοπινά'), den26: Wt(26, 'δεν'), metex: Wt(26, 'μετεξέλιξη'),
  plaisio: Wt(27, 'πλαίσιο'), dedom: Wt(27, 'δεδομένο'), anamf: Wt(27, 'αναμφισβήτητο'), kyriarx: Wt(28, 'κυριαρχία'), othom28: Wt(28, 'οθωμανική'),
  diafon: Wt(29, 'διαφωνίες'), axiom: Wt(29, 'αξιωμάτων'), mikro: Wt(29, 'μικροπροβλημάτων'),
  texn: Wt(30, 'τεχνικής'), erga: Wt(32, 'έργων'),
  logo: Wt(33, 'λόγο'), nomoth: Wt(33, 'νομοθεσίας'), exot: Wt(33, 'εξωτερικής'),
  diamorf: Wt(34, 'διαμόρφωναν'), diaf34: Wt(34, 'διαφορετικές'), polit34: Wt(34, 'πολιτικές'), apopseis: Wt(34, 'απόψεις'),
  oroi: Wt(36, 'όρους'), anagk: Wt(36, 'ανάγκες'),
  end: E(PH.length - 1),
};
const cut = i => i === 0 ? 0 : +(S(i) - .15).toFixed(2);

// ---------- map ----------
const M = buildMap({ box: [[390, 10], [1630, 1070]], clip: [[-2600, -2600], [5200, 2700]] });
const pl = {
  pelop: [22.25, 37.45], sterea: [22.6, 38.75], hydra: [23.47, 37.33], spetses: [23.15, 37.24], psara: [25.57, 38.56],
  // network nodes (abstract — no town is claimed for either network)
  n1: [21.75, 37.95], n2: [22.35, 37.55], n3: [22.05, 37.05], n4: [22.75, 37.6], n5: [22.5, 37.1], n6: [21.6, 37.55], n7: [22.85, 37.85], n8: [22.95, 36.85],
  s1: [21.5, 38.75], s2: [22.2, 38.95], s3: [22.9, 38.6], s4: [23.4, 38.35], s5: [21.9, 38.5],
};
const PP = Object.fromEntries(Object.entries(pl).map(([k, v]) => [k, M.pt(v)]));
const ring = pts => 'M' + pts.map(p => M.pt(p).join(',')).join('L') + 'Z';
const pelopClip = ring([[20.6, 38.45], [21.2, 38.42], [21.78, 38.31], [22.5, 38.15], [22.96, 37.95], [23.2, 37.7], [23.7, 37.55], [23.7, 36.1], [20.6, 36.1]]);
const stereaClip = ring([[20.6, 39.2], [21.6, 39.05], [22.5, 39.0], [23.2, 38.95], [24.3, 38.75], [24.3, 37.55], [23.7, 37.55], [23.2, 37.7], [22.96, 37.95], [22.5, 38.15], [21.78, 38.31], [21.2, 38.42], [20.6, 38.45]]);

// ---------- small builders ----------
const shots = [];
const shot = (id, a, b, inner) => shots.push({ id, a: +a.toFixed(2), b: +b.toFixed(2), svg: `<g id="${id}" class="shot" style="display:none">${inner}</g>` });
const line = (id, x1, y1, x2, y2, c = INK, w = 8, extra = '') => `<path id="${id}" d="M ${x1} ${y1} L ${x2} ${y2}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" fill="none" pathLength="1000" stroke-dasharray="1000 1000" stroke-dashoffset="1000" ${extra}/>`;
const xMark = (c = RED, s = 70, w = 26) => `<path d="M ${-s} ${-s} L ${s} ${s} M ${s} ${-s} L ${-s} ${s}" stroke="${INK}" stroke-width="${w + 10}" stroke-linecap="round"/><path d="M ${-s} ${-s} L ${s} ${s} M ${s} ${-s} L ${-s} ${s}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
const dot = (r, c) => `<circle r="${r}" fill="${c}" stroke="${INK}" stroke-width="5"/>`;
const sack = txt => `<g><path d="M -150 0 Q -190 -150 -90 -190 L -110 -230 Q 0 -256 110 -230 L 90 -190 Q 190 -150 150 0 Q 0 22 -150 0 Z" fill="#c9a46a" stroke="${INK}" stroke-width="6"/><path d="M -90 -190 Q 0 -176 90 -190" fill="none" stroke="${INK}" stroke-width="6"/><text x="0" y="-70" text-anchor="middle" font-family="Fira Sans Extra Condensed" font-weight="900" font-size="50" fill="#fff" stroke="${INK}" stroke-width="8" paint-order="stroke">${txt}</text></g>`;
const block = (ch, c) => `<g><rect x="-46" y="-46" width="92" height="92" rx="10" fill="${c}" stroke="${INK}" stroke-width="6"/><text x="0" y="24" text-anchor="middle" font-family="Fira Sans Extra Condensed" font-weight="900" font-size="72" fill="#fff" stroke="${INK}" stroke-width="7" paint-order="stroke">${ch}</text></g>`;
const qm = (c = '#fff') => `<text x="0" y="0" text-anchor="middle" font-family="Fira Sans Extra Condensed" font-weight="900" font-size="110" fill="${c}" stroke="${INK}" stroke-width="10" paint-order="stroke">?</text>`;
const bolt = c => `<path d="M 0 0 L -28 70 L 4 62 L -20 140 L 40 40 L 8 48 L 26 0 Z" fill="${c}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`;
const sea = (gy) => `<rect x="-400" y="${gy}" width="${W + 800}" height="${H - gy + 400}" fill="${SEA}" stroke="${INK}" stroke-width="5"/>`;
// a small web: centre node + k satellites (returns svg and the node coords for pulses)
function web(id, cx, cy, R, c, k = 6, rot = 0, persons = false) {
  const pts = Array.from({ length: k }, (_, i) => { const a = rot + i * 2 * Math.PI / k; return [Math.round(cx + Math.cos(a) * R), Math.round(cy + Math.sin(a) * R * .8)]; });
  const lines = pts.map(([x, y], i) => line(`${id}-l${i}`, cx, cy, x, y, c, 10)).join('') + pts.map(([x, y], i) => { const [x2, y2] = pts[(i + 1) % k]; return line(`${id}-r${i}`, x, y, x2, y2, c, 5, 'opacity=".7"'); }).join('');
  const nodes = pts.map(([x, y], i) => G(`${id}-n${i}`, persons ? `<circle r="46" fill="#f4efe4" stroke="${c}" stroke-width="10"/><g transform="translate(0,58) scale(.26)">${P.villager(`${id}v${i}`.toLowerCase())}</g>` : dot(20, '#f4efe4'), x, y)).join('');
  const hub = G(`${id}-hub`, persons ? `<circle r="70" fill="${GOLD}" stroke="${INK}" stroke-width="7"/><g transform="translate(0,82) scale(.36)">${P.prokritos(`${id}p`.toLowerCase())}</g>` : dot(34, GOLD), cx, cy);
  return { svg: `<g id="${id}">${lines}${nodes}${hub}</g>`, pts };
}

// =====================================================================
// S1 title: sepia map, patronage lines draw between nodes
const titleNet = [['n1', 'n2'], ['n2', 'n3'], ['n2', 'n4'], ['n4', 'n7'], ['n3', 'n5'], ['n6', 'n1'], ['s1', 's5'], ['s5', 's2'], ['s2', 's3'], ['s3', 's4'], ['n7', 's4']];
shot('S1', 0, cut(2), `<g id="S1-cam">${seaLand('S1')}<use href="#m-land" fill="#c99a52" opacity=".22"/>
  ${titleNet.map(([a, b], i) => line(`S1-l${i}`, PP[a][0], PP[a][1], PP[b][0], PP[b][1], '#7a4a1e', 7)).join('')}
  ${[...new Set(titleNet.flat())].map((k, i) => G(`S1-n${i}`, dot(14, GOLD), PP[k][0], PP[k][1])).join('')}</g>${vign}
  ${T('S1-t1', 'ΕΝΟΤΗΤΑ 1', 960, 430, 92, YEL, 'middle', 12)}${T('S1-t2', 'ΠΕΛΑΤΕΙΑΚΑ ΔΙΚΤΥΑ', 960, 560, 132, '#fff', 'middle', 16)}${T('S1-t3', 'ΕΠΙ ΤΟΥΡΚΟΚΡΑΤΙΑΣ', 960, 670, 86, '#fff', 'middle', 13)}`);

// S2 pre-revolution period + objective reasons: timeline, Ottoman banner drops over it
shot('S2', cut(2), cut(4), `${night()}<g id="S2-cam">
  <rect x="160" y="610" width="1600" height="26" rx="13" fill="#5b6675" stroke="${INK}" stroke-width="5"/>
  <rect id="S2-fill" x="166" y="616" width="0" height="14" rx="7" fill="${GOLD}"/>
  ${G('S2-pin', pin(RED), 1420, 606, 1.4)}${T('S2-1821', '1821', 1420, 760, 74, '#fff', 'middle', 12)}
  ${G('S2-flag', `<path d="M 0 -440 V 0" stroke="${INK}" stroke-width="14"/><g transform="translate(6,-430)">${P.ottomanFlag(420, 280)}</g>`, 520, 680, 1)}
  ${T('S2-l1', 'ΠΡΟΕΠΑΝΑΣΤΑΤΙΚΗ ΠΕΡΙΟΔΟΣ', 790, 180, 92, '#fff', 'middle', 13)}
  ${T('S2-l2', 'ΑΝΤΙΚΕΙΜΕΝΙΚΟΙ ΛΟΓΟΙ', 790, 880, 84, YEL, 'middle', 12)}</g>${vign}`);

// S3 Greeks could not form political parties: blocks Κ-Ο-Μ-Μ-Α-Τ-Α stack then crumble
const KOM = 'ΚΟΜΜΑΤΑ'.split('');
const b3 = +(cut(5) + .5).toFixed(2), b14 = +(cut(21) + .5).toFixed(2), b19 = +(cut(29) + .7).toFixed(2);
shot('S3', cut(4), b3, `<g id="S3-cam">${sky('#a9cfe0', '#eef4ee', '#c9b98d', 880)}${clouds('S3')}
  ${G('S3-ott', `<path d="M 0 0 V -360" stroke="${INK}" stroke-width="10"/><g transform="translate(4,-356)">${P.ottomanFlag(150, 100)}</g>`, 140, 880, 1)}
  ${G('S3-a', P.villager('s3a'), 600, 900, 1.05)}${G('S3-b', P.villagerW('s3b'), 960, 900, 1.05)}${G('S3-c', P.villager('s3c', { coat: '#5a4a38', vrakaC: '#3d5a46', hairC: '#6b4a2b' }), 1320, 900, 1.05)}
  ${KOM.map((ch, i) => G(`S3-k${i}`, block(ch, [TEAL, PURP, GOLD, OTT, '#4a7fbf', '#6aa84f', '#c27a3a'][i]), 960 + (i - 3) * 104, 420, 1)).join('')}
  ${G('S3-x', xMark(RED, 90, 30), 960, 420, 1, 'opacity="0"')}
  ${T('S3-l', 'ΔΕΝ ΕΙΧΑΝ ΤΗ ΔΥΝΑΤΟΤΗΤΑ', 960, 170, 88, '#fff', 'middle', 13)}${T('S3-l2', 'ΠΟΛΙΤΙΚΑ ΚΟΜΜΑΤΑ', 960, 290, 64, YEL, 'middle', 10)}</g>${vign}`);

// S4 another form of support of their interests: villager under sack, a gold brace props it up
shot('S4', b3, cut(6), `<g id="S4-cam">${sky('#d7c4a2', '#f3eadb', '#b29a72', 880)}${clouds('S4', [[300, 170, .9], [1600, 140, 1]])}
  ${G('S4-v', P.villager('s4v', { arms: 'up', start: 'strain' }), 900, 900, 1.15)}
  ${G('S4-sack', sack('ΣΥΜΦΕΡΟΝΤΑ'), 900, 640, 1.15)}
  ${G('S4-brace', `<rect x="-26" y="-290" width="52" height="290" rx="10" fill="${GOLD}" stroke="${INK}" stroke-width="7"/><rect x="-80" y="-310" width="160" height="40" rx="12" fill="${GOLD}" stroke="${INK}" stroke-width="7"/><rect x="-70" y="-24" width="140" height="28" rx="8" fill="#a8823c" stroke="${INK}" stroke-width="6"/>`, 985, 900, 1)}
  ${T('S4-l', 'ΑΛΛΗ ΜΟΡΦΗ ΥΠΟΣΤΗΡΙΞΗΣ', 960, 170, 92, '#fff', 'middle', 13)}</g>${vign}`);

// S5 clientelist networks: a web grows; then 3 reason cards
const w5 = web('S5-w', 800, 560, 330, GOLD, 7, -.4, true);
shot('S5', cut(6), cut(8), `${night()}<g id="S5-cam">${w5.svg}
  ${G('S5-c0', `<rect x="-120" y="-120" width="240" height="240" rx="24" fill="#efe4c9" stroke="${INK}" stroke-width="7"/><g transform="translate(0,95) scale(.52)">${P.throne(OTT)}</g>`, 1560, 260, 1)}
  ${G('S5-c1', `<rect x="-120" y="-120" width="240" height="240" rx="24" fill="#efe4c9" stroke="${INK}" stroke-width="7"/><g transform="translate(0,-10) scale(.4)">${P.umbrella(OTT)}</g><circle cx="-36" cy="-40" r="16" fill="#efe4c9" stroke="${INK}" stroke-width="4"/><circle cx="34" cy="-24" r="12" fill="#efe4c9" stroke="${INK}" stroke-width="4"/>`, 1560, 540, 1)}
  ${G('S5-c2', `<rect x="-120" y="-120" width="240" height="240" rx="24" fill="#efe4c9" stroke="${INK}" stroke-width="7"/><path d="M -80 10 Q 0 80 80 10" fill="none" stroke="${INK}" stroke-width="6" stroke-dasharray="14 12"/><path d="M -40 40 L -40 -10 M 0 50 L 0 0 M 40 40 L 40 -10" stroke="${INK}" stroke-width="5" stroke-dasharray="10 10"/><g transform="translate(0,-34) scale(.7)">${qm(RED)}</g>`, 1560, 820, 1)}
  </g>${vign}
  ${T('S5-l', 'ΠΕΛΑΤΕΙΑΚΑ ΔΙΚΤΥΑ', 800, 150, 120, YEL, 'middle', 16)}${T('S5-l2', 'ΟΙ ΕΞΗΣ ΛΟΓΟΙ:', 1560, 90, 60, '#fff', 'middle', 10)}`);

// S6 competition for positions of power: two notables race for the seat
shot('S6', cut(8), cut(9), `<g id="S6-cam">${sky('#f0bf86', '#fbe7cc', '#cdb68a', 900)}${clouds('S6')}
  <g><rect x="700" y="800" width="520" height="100" fill="#d8c8a6" stroke="${INK}" stroke-width="6"/><rect x="780" y="720" width="360" height="90" fill="#e6d8b8" stroke="${INK}" stroke-width="6"/></g>
  ${G('S6-thr', P.throne(OTT), 960, 724, 1.05)}
  ${G('S6-a', P.prokritos('s6a', { coat: '#6b3f2a' }), 360, 910, 1)}${G('S6-b', P.prokritos('s6b', { coat: '#3f4f6b', robeC: '#3f4f6b', sleeveC: '#3f4f6b', hatC: '#4a3a2e' }), 1560, 910, 1)}
  <g id="S6-spark" stroke="${INK}" stroke-width="9" stroke-linecap="round" opacity="0"><path d="M 900 300 l -50 -30 M 960 280 l 0 -60 M 1020 300 l 50 -30"/></g>
  ${T('S6-l', 'ΑΝΤΑΓΩΝΙΣΜΟΣ', 960, 170, 120, '#fff', 'middle', 16)}${T('S6-l2', 'ΘΕΣΕΙΣ ΕΞΟΥΣΙΑΣ', 1430, 470, 70, YEL, 'middle', 11)}</g>${vign}`);

// S7 inadequate protection from the Ottoman administration against arbitrariness: holed umbrella, storm
shot('S7', cut(9), cut(10), `<g id="S7-cam">${sky('#9aa6b4', '#dde3e6', '#a59a7c', 900)}
  ${G('S7-cloud', `${P.cloudStorm().replace(/<path d="M -40 10[^>]*\/>/, '')}<text x="0" y="-60" text-anchor="middle" font-family="Fira Sans Extra Condensed" font-weight="900" font-size="54" fill="#fff" stroke="${INK}" stroke-width="8" paint-order="stroke">ΑΥΘΑΙΡΕΣΙΕΣ</text>`, 1240, 300, 1.25)}
  ${G('S7-off', P.ottoman('s7o', { arms: 'hold' }), 960, 910, 1.1)}
  ${G('S7-umb', `${P.umbrella(OTT)}<text x="0" y="-80" text-anchor="middle" font-family="Fira Sans Extra Condensed" font-weight="900" font-size="58" fill="#fff" stroke="${INK}" stroke-width="8" paint-order="stroke">ΠΡΟΣΤΑΣΙΑ</text>
    ${[[-195, -50, 24], [175, -55, 22], [-110, -158, 18], [110, -165, 20]].map(([x, y, r], i) => `<circle id="S7-h${i}" cx="${x}" cy="${y}" r="${r}" fill="#c6ced5" stroke="${INK}" stroke-width="5" opacity="0"/>`).join('')}`, 1110, 520, .9)}
  ${G('S7-v', P.villager('s7v'), 1240, 910, 1.05)}
  ${[0, 1, 2].map(i => G(`S7-b${i}`, bolt(i === 1 ? YEL : '#ff7a4d'), [1209, 1268, 1238][i], 470, 1, 'opacity="0"')).join('')}
  ${T('S7-l', 'ΕΛΛΙΠΗΣ ΠΡΟΣΤΑΣΙΑ', 560, 170, 86, '#fff', 'middle', 13)}${T('S7-l2', 'ΟΘΩΜΑΝΙΚΗ ΔΙΟΙΚΗΣΗ', 530, 620, 56, '#fff', 'middle', 9)}${G('S7-ar', `<path d="M 0 0 L 150 50" stroke="${INK}" stroke-width="8" marker-end="url(#ah)"/>`, 700, 650, 1, 'opacity="0"')}</g>${vign}`);

// S8 absence of social welfare: tightrope, dashed (missing) safety net
shot('S8', cut(10), cut(11), `<g id="S8-cam">${sky('#a9cfe0', '#eef4ee', '#c9b98d', 960)}
  <rect x="150" y="460" width="40" height="520" fill="#7a5232" stroke="${INK}" stroke-width="6"/><rect x="1730" y="460" width="40" height="520" fill="#7a5232" stroke="${INK}" stroke-width="6"/>
  <path d="M 170 480 Q 960 510 1750 480" fill="none" stroke="${INK}" stroke-width="8"/>
  ${G('S8-v', P.villager('s8v', { arms: 'up', start: 'shock' }), 960, 498, .78)}
  <g id="S8-net" opacity="0"><path d="M 400 790 Q 960 900 1520 790" fill="none" stroke="#f4efe4" stroke-width="10" stroke-dasharray="26 20"/>${[560, 760, 960, 1160, 1360].map(x => `<path d="M ${x} 790 L ${x} 860" stroke="#f4efe4" stroke-width="6" stroke-dasharray="12 12"/>`).join('')}
   <text x="960" y="740" text-anchor="middle" font-family="Fira Sans Extra Condensed" font-weight="900" font-size="58" fill="#fff" stroke="${INK}" stroke-width="9" paint-order="stroke" opacity=".85">ΚΟΙΝΩΝΙΚΗ ΠΡΟΝΟΙΑ</text></g>
  ${G('S8-q', qm(RED), 1600, 760, 1, 'opacity="0"')}
  ${T('S8-l', 'ΑΠΟΥΣΙΑ', 960, 160, 130, RED, 'middle', 16)}</g>${vign}`);

// S9 constant feeling of uncertainty: close-up, ? orbit
shot('S9', cut(11), cut(12), `<g id="S9-cam">${sky('#b8c4cf', '#e8ecef', '#a59a7c', 1400)}
  ${G('S9-v', P.villager('s9v', { start: 'sad' }), 960, 1600, 4.0)}
  ${[0, 1, 2, 3, 4].map(i => G(`S9-q${i}`, qm(i % 2 ? YEL : '#fff'), 960, 540, 1.7)).join('')}
  ${T('S9-l', 'ΔΙΑΡΚΗΣ ΑΒΕΒΑΙΟΤΗΤΑ', 960, 170, 104, '#fff', 'middle', 15)}</g>${vign}`);

// S10 they turn to non-state bodies for basic security
shot('S10', cut(12), cut(14), `<g id="S10-cam">${sky('#a9cfe0', '#eef4ee', '#c9b98d', 900)}${clouds('S10', [[200, 150, .9], [700, 110, .8]])}
  ${G('S10-off', `${P.building('ΔΙΟΙΚΗΣΗ')}<path d="M 0 -330 V -420" stroke="${INK}" stroke-width="8"/><g transform="translate(4,-420)">${P.ottomanFlag(96, 64)}</g>`, 330, 900, 1.15)}
  <rect id="S10-door" x="285" y="760" width="90" height="140" fill="#5a3d24" stroke="${INK}" stroke-width="6" opacity="0"/>
  ${G('S10-x', xMark(RED, 55, 22), 330, 830, 1, 'opacity="0"')}
  ${G('S10-house', P.house('#efe4c9', '#b0563a'), 1500, 900, 1.5)}
  ${G('S10-f1', P.villagerW('s10w'), 1300, 905, .85)}${G('S10-f2', P.prokritos('s10p'), 1700, 905, .85)}
  ${G('S10-v', P.villager('s10v'), 700, 905, .95)}
  ${G('S10-sh', P.shield(TEAL), 1500, 470, 1.1, 'opacity="0"')}
  ${T('S10-l', 'ΜΗ ΚΡΑΤΙΚΟΙ ΦΟΡΕΙΣ', 1260, 170, 92, '#fff', 'middle', 13)}${T('S10-l2', 'ΣΤΟΙΧΕΙΩΔΗΣ ΑΣΦΑΛΕΙΑ', 1260, 290, 66, YEL, 'middle', 11)}</g>${vign}`);

// S11 the first body was the extended family: camera pulls back as relatives pop in
const fam = [[-640, 'w', '#5d4a7a'], [-470, 'm', '#4a3b30'], [-300, 'w', '#7a4a3a'], [300, 'm', '#3d5a46'], [470, 'w', '#5d6a3a'], [640, 'm', '#5a4a38']];
shot('S11', cut(14), cut(15), `<g id="S11-cam">${sky('#bfe0ea', '#f2f7f1', '#c2b48a', 900)}${clouds('S11', [[300, 150, 1], [960, 110, .8], [1620, 160, 1]])}
  ${G('S11-h', P.house(), 960, 900, 1.6)}
  ${fam.map(([dx, k, c], i) => G(`S11-r${i}`, k === 'w' ? P.villagerW(`s11r${i}`, { dressC: c, start: 'happy' }) : P.villager(`s11r${i}`, { coat: c, start: 'happy' }), 960 + dx, 910, .82)).join('')}
  ${G('S11-a', P.villager('s11a', { start: 'happy' }), 870, 910, .95)}${G('S11-b', P.villagerW('s11b', { start: 'happy' }), 1050, 910, .95)}
  ${T('S11-l', 'Ο ΠΡΩΤΟΣ ΦΟΡΕΑΣ', 960, 170, 80, '#fff', 'middle', 12)}${T('S11-l2', 'ΕΥΡΥΤΕΡΗ ΟΙΚΟΓΕΝΕΙΑ', 960, 290, 96, YEL, 'middle', 14)}</g>${vign}`);

// S12 horizontal ties between families, vertical ties to patrons with higher social position
const grpX = [360, 960, 1560];
shot('S12', cut(15), cut(17), `<g id="S12-cam">${sky('#a9cfe0', '#eef4ee', '#c9b98d', 990)}${clouds('S12', [[240, 100, .8], [1700, 120, .9]])}
  ${grpX.map((x, i) => line(`S12-v${i}`, x, 790, 960 + (i - 1) * 150, 520, GOLD, 12)).join('')}
  ${line('S12-h0', 470, 820, 850, 820, '#7a4a1e', 12)}${line('S12-h1', 1070, 820, 1450, 820, '#7a4a1e', 12)}
  ${grpX.map((x, i) => G(`S12-g${i}`, `<g transform="translate(-60,0)">${P.villager(`s12m${i}`, { coat: ['#4a3b30', '#3d5a46', '#5a4a38'][i] })}</g><g transform="translate(60,0)">${P.villagerW(`s12w${i}`, { dressC: ['#5d4a7a', '#7a4a3a', '#3d5a6a'][i] })}</g>`, x, 1000, .72)).join('')}
  ${G('S12-plat', `<rect x="-260" y="0" width="520" height="56" rx="14" fill="${GOLD}" stroke="${INK}" stroke-width="7"/><path d="M -200 56 L -170 160 L 170 160 L 200 56" fill="#a8823c" stroke="${INK}" stroke-width="6"/><g transform="translate(-80,0) scale(.72)">${P.prokritos('s12p')}</g><g transform="translate(80,0) scale(.72)">${P.villagerW('s12pw', { dressC: '#8a2f24', coat: '#6b3f2a', hatC: GOLD })}</g>`, 960, 470, 1)}
  ${T('S12-o', 'ΟΡΙΖΟΝΤΙΑ', 660, 790, 54, '#fff', 'middle', 9)}${T('S12-k', 'ΚΑΘΕΤΑ', 1640, 620, 60, '#fff', 'middle', 10)}
  ${T('S12-p', 'ΠΑΤΡΩΝΕΣ-ΠΡΟΣΤΑΤΕΣ', 960, 150, 88, YEL, 'middle', 13)}${T('S12-y', 'ΥΨΗΛΟΤΕΡΗ ΚΟΙΝΩΝΙΚΗ ΘΕΣΗ', 960, 250, 62, '#fff', 'middle', 10)}</g>${vign}`);

// S13 Peloponnese 1715-1821: two big patronage networks
const netA = ['n1', 'n2', 'n3', 'n6', 'n5'], netB = ['n4', 'n7', 'n2', 'n8', 'n5'];
const netSvg = (id, list, c, hub) => `<g id="${id}">${list.filter(k => k !== hub).map((k, i) => line(`${id}-l${i}`, PP[hub][0], PP[hub][1], PP[k][0], PP[k][1], c, 9)).join('')}${list.map((k, i) => G(`${id}-n${i}`, dot(k === hub ? 22 : 13, k === hub ? GOLD : c), PP[k][0], PP[k][1])).join('')}</g>`;
shot('S13', cut(17), cut(20), `<g id="S13-cam">${seaLand('S13')}
  <use id="S13-hl" href="#m-main" fill="${AMB}" clip-path="url(#c-pelop)" stroke="${INK}" stroke-width="4" opacity="0"/>
  ${netSvg('S13-A', netA, TEAL, 'n2')}${netSvg('S13-B', netB, PURP, 'n4')}
  ${T('S13-pe', 'ΠΕΛΟΠΟΝΝΗΣΟΣ', PP.pelop[0] - 250, PP.pelop[1] - 150, 50, '#fff', 'middle', 9)}</g>${vign}
  ${T('S13-y', '1715-1821', 64, 120, 84, YEL, 'start', 13)}
  ${T('S13-l', 'ΔΥΟ ΜΕΓΑΛΑ ΔΙΚΤΥΑ ΠΑΤΡΩΝΙΑΣ', 1040, 150, 76, '#fff', 'middle', 12)}`);

// S14 at the top: families of prokritoi (two human pyramids)
const pyr = (id, x, c) => {
  const row = [[-150, 0], [0, 0], [150, 0], [-75, -168], [75, -168]];
  return `${row.map(([dx, dy], i) => G(`${id}-c${i}`, P.villager(`${id}c${i}`.toLowerCase(), { vest: c, start: 'strain' }), x + dx, 980 + dy, .55)).join('')}
  ${G(`${id}-top`, `<g transform="translate(-48,0)">${P.prokritos(`${id}p`.toLowerCase(), { start: 'happy' })}</g><g transform="translate(70,0) scale(.9)">${P.villagerW(`${id}w`.toLowerCase(), { dressC: c, start: 'happy' })}</g>`, x, 980 - 336, .58)}`;
};
shot('S14', cut(20), b14, `<g id="S14-cam">${sky('#bfe0ea', '#f2f7f1', '#c2b48a', 980)}${clouds('S14', [[960, 140, .9]])}
  ${pyr('S14A', 560, TEAL)}${pyr('S14B', 1360, PURP)}
  <g id="S14-ka" opacity="0"><path d="M 860 470 L 720 560" stroke="${INK}" stroke-width="9" marker-end="url(#ah)"/><path d="M 1060 470 L 1200 560" stroke="${INK}" stroke-width="9" marker-end="url(#ah)"/></g>${T('S14-k', 'ΚΟΡΥΦΗ', 960, 450, 70, '#fff', 'middle', 11)}
  ${T('S14-l', 'ΟΙΚΟΓΕΝΕΙΕΣ ΠΡΟΚΡΙΤΩΝ', 960, 170, 100, YEL, 'middle', 15)}</g>${vign}`);

// S15 fierce competition at every level of public life: tug-of-war + tower floors flip
const floorsY = [740, 610, 480, 350];
shot('S15', b14, cut(22), `<g id="S15-cam">${sky('#f0bf86', '#fbe7cc', '#cdb68a', 900)}
  <g>${floorsY.map((y, i) => `<rect id="S15-f${i}" x="770" y="${y}" width="380" height="130" fill="#e9dcc0" stroke="${INK}" stroke-width="6"/>${[0, 1, 2].map(j => `<path d="M ${815 + j * 115} ${y + 108} V ${y + 56} Q ${845 + j * 115} ${y + 22} ${875 + j * 115} ${y + 56} V ${y + 108} Z" fill="#5a4632" stroke="${INK}" stroke-width="4"/>`).join('')}${i ? `<rect x="758" y="${y + 122}" width="404" height="14" fill="#8a6a46" stroke="${INK}" stroke-width="4"/>` : ''}`).join('')}
   <path d="M 730 352 L 960 268 L 1190 352 Z" fill="#b0563a" stroke="${INK}" stroke-width="6"/>
   <rect x="800" y="296" width="320" height="0"/></g>
  ${T('S15-tw', 'ΔΗΜΟΣΙΑ ΖΩΗ', 960, 330, 40, INK, 'middle', 0)}
  ${floorsY.map((y, i) => G(`S15-ch${i}`, `<g transform="scale(.28)">${P.throne(i % 2 ? PURP : TEAL)}</g>`, i % 2 ? 1105 : 815, y + 128, 1, 'opacity="0"')).join('')}
  <path id="S15-rope" d="M 470 790 L 1450 790" stroke="#a8823c" stroke-width="16" stroke-linecap="round"/><path d="M 470 790 L 1450 790" stroke="${INK}" stroke-width="3" stroke-dasharray="14 18"/>
  ${G('S15-knot', `<rect x="-16" y="-34" width="32" height="68" rx="8" fill="${RED}" stroke="${INK}" stroke-width="5"/>`, 960, 790)}
  ${G('S15-a', P.prokritos('s15a', { start: 'strain', arms: 'hold', vest: TEAL }), 420, 910, 1)}${G('S15-b', P.prokritos('s15b', { start: 'strain', arms: 'hold', coat: '#3f4f6b', robeC: '#3f4f6b', sleeveC: '#3f4f6b', vest: PURP }), 1500, 910, 1)}
  ${T('S15-l', 'ΕΝΤΟΝΟΣ ΑΝΤΑΓΩΝΙΣΜΟΣ', 960, 150, 92, '#fff', 'middle', 14)}
  ${T('S15-e', 'ΕΠΙΡΡΟΗ', 360, 330, 64, YEL, 'middle', 10)}${T('S15-d', 'ΔΗΜΟΣΙΕΣ ΘΕΣΕΙΣ', 1560, 330, 64, YEL, 'middle', 10)}</g>${vign}`);

// S16 map: Sterea Ellada → megaloarmatoloi; then the islands, ships
shot('S16', cut(22), cut(25), `<g id="S16-cam">${seaLand('S16')}
  <use id="S16-hl" href="#m-main" fill="${AMB}" clip-path="url(#c-sterea)" stroke="${INK}" stroke-width="4" opacity="0"/>
  ${['s1', 's2', 's3', 's4', 's5'].map((k, i) => `${line(`S16-sl${i}`, PP.sterea[0], PP.sterea[1], PP[k][0], PP[k][1], '#7a4a1e', 7)}${G(`S16-sn${i}`, dot(12, '#f4efe4'), PP[k][0], PP[k][1])}`).join('')}
  ${G('S16-ar', P.armatolos('s16a', { start: 'happy' }), PP.sterea[0], PP.sterea[1] + 30, .62)}
  ${['hydra', 'spetses', 'psara'].map((k, i) => G(`S16-sh${i}`, P.sailship(), PP[k][0] + [40, -40, 40][i], PP[k][1] + 10, .2, 'opacity="0"')).join('')}
  
  ${T('S16-ns', 'ΝΗΣΙΑ', PP.hydra[0] + 300, PP.hydra[1] + 40, 64, '#fff', 'middle', 10)}</g>${vign}
  ${T('S16-st', 'ΣΤΕΡΕΑ ΕΛΛΑΔΑ', 64, 120, 76, '#fff', 'start', 12)}${T('S16-l', 'ΜΕΓΑΛΟΑΡΜΑΤΟΛΟΙ', 1060, 160, 96, YEL, 'middle', 14)}`);

// S17 the islands: leadership held by families of big shipowners
shot('S17', cut(25), cut(26), `<g id="S17-cam">${sky('#bfe0ea', '#f2f7f1', SEA, 760)}${clouds('S17', [[300, 150, 1], [1500, 120, .9]])}
  <rect x="-400" y="760" width="${W + 800}" height="700" fill="url(#waves)"/>
  ${[[300, 900, 'A'], [1650, 880, 'B'], [1480, 820, 'C']].map(([x, y], i) => `${line(`S17-l${i}`, 960, 760, x, y - 30, GOLD, 7, 'stroke-dasharray="20 16"')}${G(`S17-s${i}`, P.sailship('#6b4a2b'), x, y, .32)}`).join('')}
  ${G('S17-ship', `${P.sailship('#7a3a24')}<g transform="translate(-140,-70) scale(.55)">${P.shipowner('s17o', { start: 'happy' })}</g><g transform="translate(-20,-70) scale(.5)">${P.villagerW('s17w', { dressC: '#22345e', start: 'happy' })}</g>`, 960, 800, 1.15)}
  ${T('S17-l', 'ΣΤΗΝ ΗΓΕΣΙΑ', 960, 140, 64, '#fff', 'middle', 10)}${T('S17-l2', 'ΜΕΓΑΛΟΙ ΠΛΟΙΟΚΤΗΤΕΣ', 960, 240, 100, YEL, 'middle', 15)}</g>${vign}`);

// S18 later parties are NOT a simple evolution of the patronage networks
const w18 = web('S18-w', 420, 560, 170, GOLD, 6, 0, false);
shot('S18', cut(26), cut(27), `${night()}<g id="S18-cam">${w18.svg}
  ${T('S18-n1', 'ΔΙΚΤΥΑ ΠΑΤΡΩΝΙΑΣ', 420, 820, 56, '#fff', 'middle', 9)}
  ${G('S18-bld', P.building('ΚΟΜΜΑ'), 1500, 720, 1.1)}${T('S18-n2', 'ΚΑΤΟΠΙΝΑ ΚΟΜΜΑΤΑ', 1500, 820, 56, '#fff', 'middle', 9)}
  ${line('S18-ar', 680, 560, 1250, 560, '#f4efe4', 16, 'marker-end="url(#ahw)"')}
  ${G('S18-brk', `<path d="M -20 -60 L 10 -10 L -14 10 L 16 60" fill="none" stroke="${RED}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>`, 965, 560, 1, 'opacity="0"')}
  ${G('S18-x', xMark(RED, 70, 26), 965, 420, 1, 'opacity="0"')}
  ${T('S18-l', 'ΔΕΝ ΑΠΟΤΕΛΟΥΝ ΑΠΛΗ ΜΕΤΕΞΕΛΙΞΗ', 960, 170, 88, '#fff', 'middle', 13)}</g>${vign}`);

// S19 the political frame was given and undisputed: Ottoman rule
shot('S19', cut(27), b19, `<g id="S19-cam">${sky('#cfc3ad', '#efe7d8', '#a99b7c', 940)}
  <clipPath id="S19-in"><rect x="560" y="300" width="800" height="460"/></clipPath>
  <rect x="560" y="300" width="800" height="460" fill="#f6edd6"/>
  <g clip-path="url(#S19-in)"><circle id="S19-fill" cx="960" cy="530" r="0" fill="${OTT}"/>
   ${G('S19-cres', `<circle r="120" fill="#fff"/><circle cx="38" r="96" fill="${OTT}"/>`, 930, 530, 1, 'opacity="0"')}</g>
  ${G('S19-fr', P.frame(800, 460), 960, 530, 1)}
  ${[[560, 300], [1360, 300], [560, 760], [1360, 760]].map(([x, y], i) => G(`S19-bo${i}`, `<circle r="30" fill="#9aa1aa" stroke="${INK}" stroke-width="6"/><path d="M -16 0 L 16 0 M 0 -16 L 0 16" stroke="${INK}" stroke-width="6"/>`, x, y, 1, 'opacity="0"')).join('')}
  ${G('S19-v', P.villager('s19v', { arms: 'up', start: 'strain' }), 1560, 950, .9)}
  ${T('S19-l', 'ΠΟΛΙΤΙΚΟ ΠΛΑΙΣΙΟ', 960, 190, 96, '#fff', 'middle', 14)}
  ${T('S19-d1', 'ΔΕΔΟΜΕΝΟ', 290, 470, 58, YEL, 'middle', 10)}${T('S19-d2', 'ΑΝΑΜΦΙΣΒΗΤΗΤΟ', 290, 600, 58, YEL, 'middle', 10)}
  ${T('S19-k', 'ΟΘΩΜΑΝΙΚΗ ΚΥΡΙΑΡΧΙΑ', 960, 910, 90, '#fff', 'middle', 14)}</g>${vign}
  ${T('S19-hud', 'ΕΠΙ ΤΟΥΡΚΟΚΡΑΤΙΑΣ', 64, 110, 56, YEL, 'start', 10)}`);

// S20 disagreements were EITHER about public offices OR about everyday micro-problems
const scrib = `<path d="M -50 -10 q 15 -25 30 0 q 15 25 30 0 q 15 -25 30 0" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><text x="70" y="22" font-family="Fira Sans Extra Condensed" font-weight="900" font-size="64" fill="${RED}">!</text>`;
shot('S20', b19, cut(30), `<g id="S20-cam">${sky('#a9cfe0', '#eef4ee', '#c9b98d', 920)}
  ${G('S20-p0', `<rect x="-290" y="-200" width="580" height="400" rx="26" fill="#efe4c9" stroke="${INK}" stroke-width="7"/><g transform="translate(-110,150) scale(.62)">${P.throne(OTT)}</g><g transform="translate(110,30) scale(.62)">${P.scroll('ΑΞΙΩΜΑ', 220)}</g>`, 470, 380, 1)}
  ${G('S20-p1', `<rect x="-290" y="-200" width="580" height="400" rx="26" fill="#efe4c9" stroke="${INK}" stroke-width="7"/><g transform="translate(0,160) scale(1.2)">${P.house('#efe4c9', '#b0563a')}</g><path d="M -20 -120 l 40 30 l -30 20" fill="none" stroke="${INK}" stroke-width="6"/><circle id="S20-drip" cx="0" cy="-70" r="12" fill="#7fc1e8" stroke="${INK}" stroke-width="4"/>`, 1450, 380, 1)}
  ${T('S20-e0', 'ΕΙΤΕ', 470, 145, 54, '#fff', 'middle', 9)}${T('S20-t0', 'ΔΗΜΟΣΙΑ ΑΞΙΩΜΑΤΑ', 470, 650, 58, YEL, 'middle', 10)}
  ${T('S20-e1', 'ΕΙΤΕ', 1450, 145, 54, '#fff', 'middle', 9)}${T('S20-t1', 'ΜΙΚΡΟΠΡΟΒΛΗΜΑΤΑ', 1450, 650, 58, YEL, 'middle', 10)}
  ${G('S20-a', P.villager('s20a', { start: 'angry' }), 830, 940, .82)}${G('S20-b', P.villager('s20b', { start: 'angry', coat: '#3d5a46', hairC: '#6b4a2b' }), 1090, 940, .82)}
  ${G('S20-ba', P.bubble(220, 120, 60, 100, scrib), 740, 520, .9, 'opacity="0"')}${G('S20-bb', P.bubble(220, 120, -60, 100, scrib), 1180, 520, .9, 'opacity="0"')}
  ${T('S20-l', 'ΔΙΑΦΩΝΙΕΣ', 960, 800 - 380, 64, '#fff', 'middle', 10)}</g>${vign}`);

// S21 «technical» matters, e.g. public works: villagers repair a stone bridge
shot('S21', cut(30), cut(33), `<g id="S21-cam">${sky('#bfe0ea', '#f2f7f1', '#b9c27e', 880)}${clouds('S21')}
  <path d="M -400 900 Q 960 960 2320 900 L 2320 1500 L -400 1500 Z" fill="${SEA}" stroke="${INK}" stroke-width="5"/>
  ${G('S21-br', P.bridge(), 960, 900, 1.6)}
  ${[0, 1, 2].map(i => G(`S21-st${i}`, `<rect x="-46" y="-24" width="92" height="48" fill="#bfae8e" stroke="${INK}" stroke-width="5"/>`, [820, 960, 1100][i], 640, 1, 'opacity="0"')).join('')}
  ${G('S21-a', P.villager('s21a', { start: 'happy', arms: 'up', prop: `<g transform="translate(76,-230) rotate(20)"><rect x="-6" y="-80" width="12" height="90" fill="#6b4a2b" stroke="${INK}" stroke-width="4"/><rect x="-26" y="-100" width="52" height="28" rx="5" fill="#888" stroke="${INK}" stroke-width="4"/></g>` }), 460, 880, .95)}
  ${G('S21-b', P.villager('s21b', { start: 'happy', arms: 'hold', coat: '#5a4a38' }), 1330, 880, .95)}
  ${G('S21-sign', `<rect x="-6" y="-200" width="12" height="200" fill="#7a5232" stroke="${INK}" stroke-width="5"/><rect x="-170" y="-280" width="340" height="96" rx="12" fill="#f1e2bc" stroke="${INK}" stroke-width="6"/><text x="0" y="-216" text-anchor="middle" font-family="Fira Sans Extra Condensed" font-weight="900" font-size="54" fill="${INK}">ΔΗΜΟΣΙΑ ΕΡΓΑ</text>`, 1680, 900, .9, 'opacity="0"')}
  ${T('S21-l', '«ΤΕΧΝΙΚΗΣ» ΥΦΗΣ', 960, 170, 108, YEL, 'middle', 15)}</g>${vign}`);

// S22 patrons had no say on legislation or foreign policy: locked doors
const door = (txt) => `<rect x="-150" y="-430" width="300" height="430" fill="#7a5232" stroke="${INK}" stroke-width="7"/><rect x="-118" y="-396" width="236" height="170" fill="#8a6240" stroke="${INK}" stroke-width="5"/><rect x="-118" y="-196" width="236" height="170" fill="#8a6240" stroke="${INK}" stroke-width="5"/><g transform="translate(0,-170) scale(.8)">${P.padlock(OTT)}</g><text x="0" y="-460" text-anchor="middle" font-family="Fira Sans Extra Condensed" font-weight="900" font-size="54" fill="#fff" stroke="${INK}" stroke-width="9" paint-order="stroke">${txt}</text>`;
shot('S22', cut(33), cut(34), `<g id="S22-cam">${sky('#c8c2b6', '#efebe4', '#a3967b', 900)}
  ${G('S22-d0', door('ΝΟΜΟΘΕΣΙΑ'), 1180, 900, 1)}${G('S22-d1', door('ΕΞΩΤΕΡΙΚΗ ΠΟΛΙΤΙΚΗ'), 1620, 900, 1)}
  ${G('S22-a', P.prokritos('s22a'), 260, 905, .85)}${G('S22-b', P.armatolos('s22b'), 480, 905, .85)}${G('S22-c', P.shipowner('s22c'), 700, 905, .85)}
  ${G('S22-bub', P.bubble(240, 130, -60, 110, `<text x="0" y="22" text-anchor="middle" font-family="Fira Sans Extra Condensed" font-weight="900" font-size="64" fill="${INK}">!</text>`), 420, 330, 1, 'opacity="0"')}
  ${G('S22-x', xMark(RED, 60, 24), 420, 330, 1, 'opacity="0"')}
  ${T('S22-l', 'ΔΕΝ ΕΙΧΑΝ ΛΟΓΟ', 480, 170, 100, RED, 'middle', 14)}</g>${vign}`);

// S23 networks did not shape different political views: two webs, two EMPTY bubbles, '='
const w23a = web('S23-a', 520, 640, 170, TEAL, 6, .3), w23b = web('S23-b', 1400, 640, 170, PURP, 6, .3);
shot('S23', cut(34), cut(35), `${night()}<g id="S23-cam">${w23a.svg}${w23b.svg}
  ${G('S23-ba', P.bubble(260, 150, -40, 120), 560, 340, 1, 'opacity="0"')}${G('S23-bb', P.bubble(260, 150, -40, 120), 1440, 340, 1, 'opacity="0"')}
  ${T('S23-eq', '=', 960, 690, 200, '#fff', 'middle', 16)}
  ${T('S23-l', 'ΔΙΑΦΟΡΕΤΙΚΕΣ ΠΟΛΙΤΙΚΕΣ ΑΠΟΨΕΙΣ', 960, 150, 82, '#fff', 'middle', 13)}
  <path id="S23-slash" d="M 330 130 L 1590 130" stroke="${RED}" stroke-width="16" stroke-linecap="round" pathLength="1000" stroke-dasharray="1000 1000" stroke-dashoffset="1000"/></g>${vign}`);

// S24 not the same terms, not the same needs as the later parties
shot('S24', cut(35), C.end + 2.4, `<g id="S24-cam"><rect x="-400" y="-300" width="1360" height="1680" fill="#d9c49c"/><rect x="960" y="-300" width="1360" height="1680" fill="#bcd2e0"/>
  <rect x="-400" y="-300" width="2720" height="1680" fill="#000" filter="url(#paper)" opacity=".2"/><rect x="-400" y="900" width="2720" height="600" fill="#a99b7c" stroke="${INK}" stroke-width="5"/>
  ${web('S24-w', 480, 380, 125, GOLD, 6, .2).svg}${G('S24-p', P.prokritos('s24p'), 480, 910, .9)}
  ${G('S24-bld', P.building('ΚΟΜΜΑ'), 1440, 590, .95)}${G('S24-c1', P.villager('s24c1', { start: 'happy' }), 1280, 910, .75)}${G('S24-c2', P.villagerW('s24c2', { start: 'happy' }), 1600, 910, .75)}
  <rect x="954" y="-300" width="12" height="1680" fill="${INK}"/>
  ${T('S24-n1', 'ΔΙΚΤΥΑ ΠΑΤΡΩΝΙΑΣ', 480, 150, 74, '#fff', 'middle', 12)}${T('S24-n2', 'ΚΑΤΟΠΙΝΑ ΚΟΜΜΑΤΑ', 1440, 150, 74, '#fff', 'middle', 12)}
  ${G('S24-neq', `<circle r="100" fill="#efe4c9" stroke="${INK}" stroke-width="8"/><text x="0" y="52" text-anchor="middle" font-family="Fira Sans Extra Condensed" font-weight="900" font-size="170" fill="${RED}">≠</text>`, 960, 470, 1)}
  ${T('S24-o', 'ΟΡΟΙ', 960, 660, 70, YEL, 'middle', 11)}${T('S24-a', 'ΑΝΑΓΚΕΣ', 960, 760, 70, YEL, 'middle', 11)}</g>${vign}
  <rect id="S24-black" width="${W}" height="${H}" fill="#000" opacity="0"/>`);

// ---------- page ----------
const HL = ['προεπαναστατική περίοδο', 'αντικειμενικούς λόγους', 'πολιτικά κόμματα', 'πελατειακά δίκτυα', 'ανταγωνισμός', 'θέσεων εξουσίας', 'ελλιπής παροχή προστασίας', 'οθωμανικής', 'αυθαιρεσιών', 'κοινωνικής πρόνοιας', 'αβεβαιότητας', 'μη κρατικούς φορείς', 'στοιχειώδη ασφάλεια', 'ευρύτερη οικογένεια', 'οριζόντια', 'κάθετα', 'πάτρωνες-προστάτες', 'υψηλότερη κοινωνική θέση', 'Πελοπόννησο', '1715-1821', 'δύο μεγάλα δίκτυα πατρωνίας', 'προκρίτων', 'έντονος ανταγωνισμός', 'Στερεά Ελλάδα', 'μεγαλοαρματολοί', 'νησιά', 'μεγάλων πλοιοκτητών', 'απλή μετεξέλιξη', 'δεδομένο και αναμφισβήτητο', 'οθωμανική κυριαρχία', 'δημοσίων αξιωμάτων', 'μικροπροβλημάτων', '«τεχνικής»', 'δημοσίων έργων', 'νομοθεσίας', 'εξωτερικής πολιτικής', 'διαφορετικές πολιτικές απόψεις', 'ίδιους όρους', 'ίδιες ανάγκες'];
const subs = makeSubs(timing, HL, { skipBefore: S(2) - .2 });
const extraDefs = mapDefs(M) + `<marker id="ahw" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="#f4efe4"/></marker><clipPath id="c-pelop"><path d="${pelopClip}"/></clipPath><clipPath id="c-sterea"><path d="${stereaClip}"/></clipPath>`;
const n = buildPage({ out: path.join(HERE, 'build/video.html'), shots, subs, C, extraDefs, data: { PP, w5: w5.pts },
  runtimeJs: '../../../engine/runtime.js', shotsJs: '../shots.js' });
fs.writeFileSync(path.join(HERE, 'build/cues.json'), JSON.stringify({ ...C, DUR: C.end + 2.4 }, null, 1));
for (let i = 1; i < shots.length; i++) if (shots[i].a !== shots[i - 1].b) throw new Error(`shots do not tile at ${shots[i].id}`);
console.log('built', (n / 1e6).toFixed(2), 'MB,', shots.length, 'shots, duration', (C.end + 2.4).toFixed(1), 's');
