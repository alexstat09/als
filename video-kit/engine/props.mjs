// Reusable characters & props (original designs). Local coords: characters stand at (0,0), ~330 units tall.
export const INK = '#1d1a17';
const SK = '#F7F1E8';
const st = (lw = 5) => `stroke="${INK}" stroke-width="${lw}" stroke-linejoin="round" stroke-linecap="round"`;

/* ---------- generic chibi person ---------- */
export function person(o) {
  const id = o.id, lw = o.lw ?? 5.5, coat = o.coat ?? '#3b4a6b', pants = o.pants ?? '#2b2f3a', skin = o.skin ?? SK;
  const hairC = o.hairC ?? '#3a2a20';
  let legs = o.dress ? `<path d="M -54 -60 Q -62 -20 -58 -6 L 58 -6 Q 62 -20 54 -60 Z" fill="${o.dressC ?? coat}" ${st(lw)}/>
     <ellipse cx="-22" cy="-3" rx="17" ry="8" fill="${INK}"/><ellipse cx="22" cy="-3" rx="17" ry="8" fill="${INK}"/>`
    : `<rect x="-32" y="-60" width="25" height="56" rx="8" fill="${pants}" ${st(lw)}/><rect x="7" y="-60" width="25" height="56" rx="8" fill="${pants}" ${st(lw)}/>
     ${o.stripes ? `<path d="M -26 -58 v 50 M -14 -58 v 50 M 14 -58 v 50 M 26 -58 v 50" stroke="#c0392b" stroke-width="4"/>` : ''}
     <ellipse cx="-23" cy="-4" rx="20" ry="9" fill="${INK}"/><ellipse cx="23" cy="-4" rx="20" ry="9" fill="${INK}"/>`;
  // period legs (Greek lands before 1821): white pleated φουστανέλα, baggy βράκα, or a long fur-trimmed robe (notables / officials)
  const stock = (c = '#f4efe4') => `<rect x="-30" y="-26" width="22" height="24" rx="6" fill="${c}" ${st(lw * .8)}/><rect x="8" y="-26" width="22" height="24" rx="6" fill="${c}" ${st(lw * .8)}/>`;
  const tsarouchi = `<path d="M -42 -6 Q -40 -14 -14 -12 L -8 -2 Q -26 2 -42 -6 Z M 42 -6 Q 40 -14 14 -12 L 8 -2 Q 26 2 42 -6 Z" fill="#8a2a1e" ${st(lw * .7)}/><circle cx="-44" cy="-8" r="7" fill="${INK}"/><circle cx="44" cy="-8" r="7" fill="${INK}"/>`;
  if (o.legs === 'fustanella') legs = `${stock()}<rect x="-30" y="-24" width="22" height="6" fill="${INK}"/><rect x="8" y="-24" width="22" height="6" fill="${INK}"/>
     <path d="M -54 -70 L -84 -24 Q 0 -10 84 -24 L 54 -70 Z" fill="#fbf8f0" ${st(lw)}/>${[-60, -40, -20, 0, 20, 40, 60].map(x => `<path d="M ${x * .62} -66 L ${x} -22" stroke="#c9c2b2" stroke-width="3"/>`).join('')}${tsarouchi}`;
  else if (o.legs === 'vraka') legs = `${stock()}<path d="M -60 -70 Q -92 -40 -62 -22 Q -30 -12 0 -22 Q 30 -12 62 -22 Q 92 -40 60 -70 Z" fill="${o.vrakaC ?? '#2e4a78'}" ${st(lw)}/><path d="M 0 -60 L 0 -24" stroke="${INK}" stroke-width="${lw * .6}"/>
     <ellipse cx="-22" cy="-4" rx="18" ry="8" fill="${INK}"/><ellipse cx="22" cy="-4" rx="18" ry="8" fill="${INK}"/>`;
  else if (o.legs === 'robe') legs = `<path d="M -54 -150 Q -80 -70 -80 -10 Q 0 4 80 -10 Q 80 -70 54 -150 Z" fill="${o.robeC ?? coat}" ${st(lw)}/>
     <path d="M -12 -150 Q -16 -70 -18 -6 L 18 -6 Q 16 -70 12 -150 Z" fill="${o.trimC ?? '#6b4a2b'}" ${st(lw * .6)}/>
     <path d="M -80 -14 Q 0 0 80 -14 L 80 -2 Q 0 12 -80 -2 Z" fill="${o.trimC ?? '#6b4a2b'}" ${st(lw * .6)}/>
     <ellipse cx="-26" cy="0" rx="18" ry="7" fill="${INK}"/><ellipse cx="26" cy="0" rx="18" ry="7" fill="${INK}"/>`;
  const torso = `<path d="M -48 -158 Q -68 -110 -60 -50 Q 0 -40 60 -50 Q 68 -110 48 -158 Q 0 -170 -48 -158 Z" fill="${coat}" ${st(lw)}/>`;
  const vest = o.vest ? `<path d="M -26 -156 L -30 -60 Q 0 -52 30 -60 L 26 -156 Q 0 -150 -26 -156 Z" fill="${o.vest}" ${st(lw * .6)}/>` : '';
  const shirt = o.noShirt ? '' : `<path d="M -16 -160 L 0 -128 L 16 -160 Z" fill="#fbfaf7" ${st(lw * .5)}/>`;
  const sash = o.sash ? o.sash.map((c, i) => `<path d="M ${-44 + i * 9} -152 L ${40 + i * 9} -84 L ${48 + i * 9} -94 L ${-36 + i * 9} -160 Z" fill="${c}" ${st(lw * .35)}/>`).join('') : '';
  const pin = o.pin ? `<g transform="translate(-28,-130)"><circle r="11" fill="${o.pin}" ${st(3)}/><path d="M -6 3 L -6 -4 L -3 0 L 0 -6 L 3 0 L 6 -4 L 6 3 Z" fill="#FFD54A"/></g>` : '';
  let arms = '';
  const sleeve = (d, c = o.sleeveC ?? coat) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${28 + lw * 2}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="28" stroke-linecap="round"/>`;
  const hand = (x, y) => `<circle cx="${x}" cy="${y}" r="12" fill="${skin}" ${st(lw * .8)}/>`;
  if (o.arms === 'crossed') arms = `<rect x="-60" y="-122" width="120" height="30" rx="15" fill="${coat}" ${st(lw)}/>${hand(48, -110)}${hand(-46, -102)}`;
  else if (o.arms === 'up') arms = `<g id="${id}-armL">${sleeve('M -40 -146 Q -70 -170 -76 -214')}${hand(-76, -218)}</g><g id="${id}-armR">${sleeve('M 40 -146 Q 70 -170 76 -214')}${hand(76, -218)}</g>`;
  else if (o.arms === 'hold') arms = `<g id="${id}-armL">${sleeve('M -40 -146 Q -64 -120 -40 -100')}${hand(-36, -98)}</g><g id="${id}-armR">${sleeve('M 40 -146 Q 76 -130 84 -108')}${hand(86, -104)}</g>`;
  else arms = `<g id="${id}-armL">${sleeve('M -40 -146 Q -66 -120 -62 -86')}${hand(-62, -82)}</g><g id="${id}-armR">${sleeve('M 40 -146 Q 66 -120 62 -86')}${hand(62, -82)}</g>`;
  const armsBehind = o.arms !== 'crossed';
  // head features
  let hairBack = '', hairFront = '', hat = '', face = '';
  if (o.hair === 'long') { hairBack = `<path d="M -92 -236 Q -100 -150 -70 -120 L 70 -120 Q 100 -150 92 -236 Q 80 -320 0 -320 Q -80 -320 -92 -236 Z" fill="${hairC}" ${st(lw)}/>`; hairFront = `<path d="M -84 -246 Q -60 -300 0 -306 Q 60 -300 84 -246 Q 50 -276 0 -272 Q -40 -276 -84 -246 Z" fill="${hairC}" ${st(lw * .8)}/>`; }
  else if (o.hair === 'short') hairFront = `<path d="M -82 -238 Q -84 -310 0 -314 Q 84 -310 82 -238 Q 70 -276 30 -280 Q 0 -266 -30 -280 Q -70 -276 -82 -238 Z" fill="${hairC}" ${st(lw * .8)}/>`;
  else if (o.hair === 'side') hairFront = `<path d="M -84 -238 q -8 18 4 34 q 10 -6 12 -18 Z M 84 -238 q 8 18 -4 34 q -10 -6 -12 -18 Z" fill="${hairC}" ${st(lw * .7)}/>`;
  if (o.hat === 'top') hat = `<path d="M -60 -290 L -54 -400 L 54 -400 L 60 -290 Z" fill="${o.hatC ?? '#222'}" ${st(lw)}/><rect x="-60" y="-312" width="120" height="16" fill="${o.bandC ?? '#7a1f1f'}" ${st(lw * .6)}/><path d="M -96 -284 Q 0 -300 96 -284 Q 90 -272 0 -276 Q -90 -272 -96 -284 Z" fill="${o.hatC ?? '#222'}" ${st(lw)}/>`;
  if (o.hat === 'sam') hat = `<path d="M -56 -290 L -50 -420 L 50 -420 L 56 -290 Z" fill="#fff" ${st(lw)}/><path d="M -46 -400 L 46 -400 M -48 -370 L 48 -370 M -50 -340 L 50 -340 M -52 -310 L 52 -310" stroke="#c0392b" stroke-width="13"/><rect x="-56" y="-302" width="112" height="22" fill="#2b4a8b" ${st(lw * .6)}/>${[-36, -12, 12, 36].map(x => `<path d="M ${x} -298 l 3 7 l 7 0 l -6 4 l 2 7 l -6 -4 l -6 4 l 2 -7 l -6 -4 l 7 0 Z" fill="#fff"/>`).join('')}<path d="M -100 -282 Q 0 -298 100 -282 Q 92 -270 0 -274 Q -92 -270 -100 -282 Z" fill="#2b4a8b" ${st(lw)}/>`;
  if (o.hat === 'bowler') hat = `<path d="M -66 -276 Q -70 -360 0 -364 Q 70 -360 66 -276 Z" fill="#2a2420" ${st(lw)}/><path d="M -98 -276 Q 0 -294 98 -276 Q 92 -262 0 -266 Q -92 -262 -98 -276 Z" fill="#2a2420" ${st(lw)}/>`;
  if (o.hat === 'phrygian') hat = `<path d="M -84 -262 Q -96 -336 -10 -350 Q 60 -362 92 -330 Q 104 -300 80 -290 Q 70 -312 40 -312 Q 84 -290 84 -262 Q 0 -280 -84 -262 Z" fill="#c8102e" ${st(lw)}/><g transform="translate(-50,-286)"><circle r="16" fill="#0055A4" ${st(3)}/><circle r="10" fill="#fff"/><circle r="5" fill="#EF4135"/></g>`;
  if (o.hat === 'kepi') hat = `<path d="M -74 -262 L -66 -326 Q 0 -336 66 -326 L 74 -262 Z" fill="${o.hatC ?? '#7d7348'}" ${st(lw)}/><path d="M -86 -262 Q 0 -240 86 -262 Q 70 -248 0 -246 Q -70 -248 -86 -262 Z" fill="#2a2a22" ${st(lw * .7)}/><circle cx="0" cy="-292" r="10" fill="#2b5fa8" ${st(3)}/><circle cx="0" cy="-292" r="4" fill="#fff"/>`;
  if (o.hat === 'flat') hat = `<path d="M -84 -256 Q -90 -322 0 -326 Q 90 -322 86 -260 Q 0 -246 -84 -256 Z" fill="${o.hatC ?? '#5a4a3a'}" ${st(lw)}/><path d="M -60 -258 Q 30 -236 100 -252 Q 80 -264 20 -268 Z" fill="${o.hatC ?? '#5a4a3a'}" ${st(lw * .7)}/>`;
  // period hats: καλπάκι (fur, notables), σαρίκι/turban (Ottoman officials — NOT the fez, which arrived only in 1827–29), φέσι/σκούφια (red, tassel), μαντήλι (women)
  if (o.hat === 'kalpak') hat = `<path d="M -72 -276 L -64 -398 Q 0 -414 64 -398 L 72 -276 Z" fill="${o.hatC ?? '#2a221d'}" ${st(lw)}/>${[-48, -24, 0, 24, 48].map((x, i) => `<path d="M ${x - 6} ${-300 - (i % 2) * 40} q 6 -10 12 0 q 6 10 12 0" fill="none" stroke="#5a4a40" stroke-width="4" stroke-linecap="round"/>`).join('')}<path d="M -82 -262 Q 0 -246 82 -262 L 78 -286 Q 0 -270 -78 -286 Z" fill="${o.bandC ?? '#3b2f28'}" ${st(lw * .8)}/>`;
  if (o.hat === 'turban') hat = `<path d="M -40 -320 Q -36 -370 0 -372 Q 36 -370 40 -320 Z" fill="${o.hatC ?? '#B8323A'}" ${st(lw * .8)}/>
    <path d="M -100 -270 Q -112 -346 0 -350 Q 112 -346 100 -270 Q 0 -244 -100 -270 Z" fill="#fbf8f0" ${st(lw)}/>
    <path d="M -96 -290 Q 0 -262 98 -312 M -92 -314 Q 0 -290 90 -334 M -60 -338 Q 10 -318 60 -346" fill="none" stroke="#cfc6b4" stroke-width="5" stroke-linecap="round"/>`;
  if (o.hat === 'fesi') hat = `<path d="M -80 -262 Q -86 -328 -10 -336 Q 70 -340 96 -300 Q 92 -270 80 -262 Q 0 -278 -80 -262 Z" fill="${o.hatC ?? '#c0392b'}" ${st(lw)}/>
    <path d="M 64 -326 Q 108 -306 106 -250" fill="none" stroke="${INK}" stroke-width="4"/><path d="M 100 -254 L 112 -254 L 118 -212 L 94 -212 Z" fill="${o.tasselC ?? '#1d1a17'}" ${st(3)}/>`;
  if (o.hat === 'scarf') hat = `<path d="M -96 -226 Q -104 -332 0 -334 Q 104 -332 96 -226 L 92 -150 Q 70 -132 56 -156 Q 76 -248 0 -268 Q -76 -248 -56 -156 Q -70 -132 -92 -150 Z" fill="${o.hatC ?? '#7a3b5a'}" ${st(lw)}/>`;
  if (o.face === 'stache') face += `<path d="M 0 -196 Q -18 -206 -40 -196 Q -34 -184 -12 -188 Q -2 -190 0 -192 Q 2 -190 12 -188 Q 34 -184 40 -196 Q 18 -206 0 -196 Z" fill="${o.faceC ?? hairC}" ${st(lw * .6)}/>`;
  if (o.face === 'goatee') face += `<path d="M -22 -176 Q -20 -130 0 -112 Q 20 -130 22 -176 Q 0 -168 -22 -176 Z" fill="${o.faceC ?? '#eee'}" ${st(lw * .7)}/>`;
  if (o.face === 'sideburns') face += `<path d="M -84 -232 q -6 40 18 54 l 8 -10 q -14 -18 -12 -44 Z M 84 -232 q 6 40 -18 54 l -8 -10 q 14 -18 12 -44 Z" fill="${o.faceC ?? '#b5651d'}" ${st(lw * .6)}/>`;
  if (o.beard) face += `<path d="M -64 -198 Q -62 -126 0 -110 Q 62 -126 64 -198 Q 52 -168 22 -164 Q 0 -162 -22 -164 Q -52 -168 -64 -198 Z" fill="${o.beardC ?? hairC}" ${st(lw * .7)}/>`;
  if (o.bigStache) face += `<path d="M 0 -194 Q -26 -210 -56 -196 Q -78 -186 -72 -212 Q -84 -174 -48 -178 Q -18 -182 0 -188 Q 18 -182 48 -178 Q 84 -174 72 -212 Q 78 -186 56 -196 Q 26 -210 0 -194 Z" fill="${o.faceC ?? hairC}" ${st(lw * .6)}/>`;
  const brow = (l, r, w = 1.1) => `<path d="${l}" stroke="${INK}" stroke-width="${lw * w}" stroke-linecap="round" fill="none"/><path d="${r}" stroke="${INK}" stroke-width="${lw * w}" stroke-linecap="round" fill="none"/>`;
  const E = (n, inner) => `<g id="${id}-x-${n}" style="display:${(o.start ?? 'neutral') === n ? 'inline' : 'none'}">${inner}</g>`;
  const eyes = (dx = 0, ry = 7) => `<ellipse cx="${-30 + dx}" cy="-222" rx="5" ry="${ry}" fill="${INK}"/><ellipse cx="${30 + dx}" cy="-222" rx="5" ry="${ry}" fill="${INK}"/>`;
  const nb = brow('M -46 -246 Q -30 -252 -14 -246', 'M 46 -246 Q 30 -252 14 -246');
  const lash = o.female ? `<path d="M -38 -230 l -8 -6 M 38 -230 l 8 -6" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>` : '';
  const exprs = [
    E('neutral', eyes() + nb + lash + `<path d="M -10 -176 Q 0 -170 10 -176" fill="none" stroke="${INK}" stroke-width="${lw * .7}" stroke-linecap="round"/>`),
    E('happy', `<path d="M -40 -220 Q -30 -232 -20 -220 M 20 -220 Q 30 -232 40 -220" fill="none" stroke="${INK}" stroke-width="${lw * .8}" stroke-linecap="round"/>` + nb + `<path d="M -18 -182 Q 0 -160 18 -182 Z" fill="#7a2a2a" ${st(lw * .6)}/>`),
    E('angry', eyes(4) + brow('M -48 -252 L -14 -238', 'M 52 -252 L 18 -238', 1.2) + `<path d="M -12 -172 L 12 -172" stroke="${INK}" stroke-width="${lw * .7}" stroke-linecap="round"/>`),
    E('sad', eyes(0, 6) + brow('M -46 -240 L -16 -250', 'M 46 -240 L 16 -250') + `<path d="M -12 -168 Q 0 -178 12 -168" fill="none" stroke="${INK}" stroke-width="${lw * .7}" stroke-linecap="round"/><path d="M 34 -212 q 4 10 0 14 q -4 -4 0 -14 Z" fill="#7fc1e8"/>`),
    E('shock', `<circle cx="-30" cy="-224" r="10" fill="#fff" ${st(3)}/><circle cx="30" cy="-224" r="10" fill="#fff" ${st(3)}/><circle cx="-30" cy="-224" r="3.5" fill="${INK}"/><circle cx="30" cy="-224" r="3.5" fill="${INK}"/>` + brow('M -46 -254 Q -30 -264 -14 -256', 'M 46 -254 Q 30 -264 14 -256') + `<ellipse cx="0" cy="-172" rx="9" ry="12" fill="#5a1f1f" ${st(lw * .6)}/>`),
    E('yawn', `<path d="M -40 -222 Q -30 -216 -20 -222 M 20 -222 Q 30 -216 40 -222" fill="none" stroke="${INK}" stroke-width="${lw * .8}" stroke-linecap="round"/>` + nb + `<ellipse cx="0" cy="-176" rx="13" ry="17" fill="#5a1f1f" ${st(lw * .6)}/>`),
    E('blink', `<path d="M -40 -222 Q -30 -216 -20 -222 M 20 -222 Q 30 -216 40 -222" fill="none" stroke="${INK}" stroke-width="${lw * .8}" stroke-linecap="round"/>` + nb),
    E('strain', `<path d="M -42 -228 L -20 -220 L -42 -214 M 42 -228 L 20 -220 L 42 -214" fill="none" stroke="${INK}" stroke-width="${lw * .8}" stroke-linecap="round" stroke-linejoin="round"/>` + `<rect x="-20" y="-184" width="40" height="16" rx="4" fill="#fff" ${st(lw * .6)}/><path d="M -10 -184 v 16 M 0 -184 v 16 M 10 -184 v 16" stroke="${INK}" stroke-width="2"/>`),
  ].join('');
  return `<g id="${id}">
   <ellipse cx="0" cy="0" rx="78" ry="12" fill="rgba(0,0,0,.2)"/>
   <g id="${id}-body">${legs}${armsBehind ? arms : ''}${torso}${vest}${shirt}${sash}${pin}${o.chest ?? ''}${armsBehind ? '' : arms}${o.prop ?? ''}</g>
   <g id="${id}-head">${hairBack}
    <circle cx="0" cy="-228" r="84" fill="${skin}" ${st(lw)}/>
    <path d="M -62 -180 Q 0 -138 62 -180 Q 40 -150 0 -146 Q -40 -150 -62 -180 Z" fill="rgba(0,0,0,.08)"/>
    ${hairFront}${exprs}${face}${o.glasses ? `<circle cx="-30" cy="-226" r="19" fill="rgba(255,255,255,.3)" ${st(lw * .75)}/><circle cx="30" cy="-226" r="19" fill="rgba(255,255,255,.3)" ${st(lw * .75)}/><path d="M -11 -228 Q 0 -234 11 -228" fill="none" ${st(lw * .6)}/><path d="M -34 -296 Q -10 -308 18 -302" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/>` : ''}${hat}
    <ellipse cx="-58" cy="-198" rx="10" ry="6" fill="rgba(232,110,90,.28)"/><ellipse cx="58" cy="-198" rx="10" ry="6" fill="rgba(232,110,90,.28)"/>
   </g></g>`;
}
export const marianne = (id, extra = {}) => person({ id, female: true, dress: true, coat: '#2b4a8b', dressC: '#2b4a8b', hair: 'long', hairC: '#6b3f22', hat: 'phrygian', sash: ['#0055A4', '#ffffff', '#EF4135'], noShirt: false, ...extra });
export const johnbull = (id, extra = {}) => person({ id, coat: '#8a3b22', vest: 'url(#ukflag)', pants: '#d8c9a3', hat: 'top', hatC: '#2a2420', bandC: '#2a2420', face: 'sideburns', faceC: '#b5651d', hair: 'side', hairC: '#b5651d', ...extra });
export const unclesam = (id, extra = {}) => person({ id, coat: '#2b4a8b', pants: '#fff', stripes: true, hat: 'sam', face: 'goatee', faceC: '#eeeeee', hair: 'side', hairC: '#e8e8e8', vest: '#c0392b', ...extra });
export const soldier = (id, extra = {}) => person({ id, coat: '#7d7348', pants: '#6b623d', hat: 'kepi', face: 'stache', hairC: '#3a2a20', prop: `<g transform="translate(70,-60) rotate(-8)"><rect x="-5" y="-170" width="10" height="170" rx="3" fill="#6b4a2b" ${st(4)}/><rect x="-3" y="-200" width="6" height="34" fill="#888" ${st(3)}/></g>`, ...extra });
export const citizen = (id, extra = {}) => person({ id, coat: '#6b5a48', vest: '#3b3a36', pants: '#3b3a36', hat: 'flat', hair: 'short', face: 'stache', ...extra });
export const minister = (id, extra = {}) => person({ id, coat: '#26272c', pants: '#26272c', hat: 'top', face: 'stache', hair: 'short', hairC: '#555', pin: '#5D8BD0', ...extra });

// ---- Greek lands under Ottoman rule (before 1821) — added for k2-a1 «Πελατειακά δίκτυα επί τουρκοκρατίας» ----
export const villager = (id, extra = {}) => person({ id, coat: '#4a3b30', vest: '#2f2a26', sleeveC: '#f4efe4', legs: 'vraka', vrakaC: '#34507e', hair: 'short', hairC: '#3a2a20', face: 'stache', chest: `<path d="M -60 -64 Q 0 -54 60 -64 L 60 -78 Q 0 -68 -60 -78 Z" fill="#b5372b" stroke="${INK}" stroke-width="3"/>`, ...extra });
export const villagerW = (id, extra = {}) => person({ id, female: true, dress: true, coat: '#6a4c3b', dressC: '#5d4a7a', sleeveC: '#f4efe4', hat: 'scarf', hatC: '#9c3d54', hair: 'none', ...extra });
export const prokritos = (id, extra = {}) => person({ id, coat: '#6b3f2a', legs: 'robe', robeC: '#6b3f2a', trimC: '#3b2a20', sleeveC: '#6b3f2a', hat: 'kalpak', face: 'stache', hairC: '#2a1e18', sash: ['#D8A93B'], ...extra });
export const armatolos = (id, extra = {}) => person({ id, coat: '#8a2f24', vest: '#1f2a44', sleeveC: '#fbf8f0', legs: 'fustanella', hat: 'fesi', bigStache: true, hairC: '#2a1e18', faceC: '#2a1e18',
  prop: `<g transform="translate(78,-40) rotate(-12)"><rect x="-6" y="-230" width="12" height="230" rx="4" fill="#6b4a2b" stroke="${INK}" stroke-width="4"/><rect x="-4" y="-270" width="8" height="48" fill="#999" stroke="${INK}" stroke-width="3"/><path d="M -10 -40 L 10 -40 L 14 0 L -14 0 Z" fill="#8a6a46" stroke="${INK}" stroke-width="4"/></g>`, ...extra });
export const shipowner = (id, extra = {}) => person({ id, coat: '#1f2a44', vest: '#a8323a', sleeveC: '#fbf8f0', legs: 'vraka', vrakaC: '#22345e', hat: 'fesi', face: 'stache', hairC: '#2a1e18', sash: ['#D8A93B'], ...extra });
export const ottoman = (id, extra = {}) => person({ id, coat: '#B8323A', legs: 'robe', robeC: '#B8323A', trimC: '#7a1f24', sleeveC: '#B8323A', hat: 'turban', beard: true, beardC: '#2a1e18', face: 'stache', hairC: '#2a1e18', ...extra });

/* ---------- props ---------- */
export const ukFlagPattern = `<pattern id="ukflag" width="60" height="36" patternUnits="userSpaceOnUse"><rect width="60" height="36" fill="#012169"/><path d="M0 0 L60 36 M60 0 L0 36" stroke="#fff" stroke-width="7"/><path d="M0 0 L60 36 M60 0 L0 36" stroke="#C8102E" stroke-width="2.5"/><path d="M30 0 V36 M0 18 H60" stroke="#fff" stroke-width="11"/><path d="M30 0 V36 M0 18 H60" stroke="#C8102E" stroke-width="6"/></pattern>`;
export function flag(kind, w = 90, h = 60) {
  const r = `stroke="${INK}" stroke-width="3"`;
  if (kind === 'fr') return `<g><rect width="${w / 3}" height="${h}" fill="#0055A4"/><rect x="${w / 3}" width="${w / 3}" height="${h}" fill="#fff"/><rect x="${2 * w / 3}" width="${w / 3}" height="${h}" fill="#EF4135"/><rect width="${w}" height="${h}" fill="none" ${r}/></g>`;
  if (kind === 'uk') return `<g><rect width="60" height="36" fill="url(#ukflag)" transform="scale(${w / 60},${h / 36})"/><rect width="${w}" height="${h}" fill="none" ${r}/></g>`;
  if (kind === 'us') return `<g>${`<rect width="${w}" height="${h}" fill="#fff"/>` + Array.from({ length: 7 }, (_, i) => `<rect y="${2 * i * h / 13}" width="${w}" height="${h / 13}" fill="#B22234"/>`).join('')}<rect width="${w * .42}" height="${h * .54}" fill="#3C3B6E"/>${Array.from({ length: 9 }, (_, i) => `<circle cx="${6 + (i % 3) * 12}" cy="${6 + Math.floor(i / 3) * 10}" r="2.2" fill="#fff"/>`).join('')}<rect width="${w}" height="${h}" fill="none" ${r}/></g>`;
  if (kind === 'gr') return `<g>${Array.from({ length: 9 }, (_, i) => `<rect y="${i * h / 9}" width="${w}" height="${h / 9}" fill="${i % 2 ? '#fff' : '#0D5EAF'}"/>`).join('')}<rect width="${h * 5 / 9}" height="${h * 5 / 9}" fill="#0D5EAF"/><rect x="${h * 2 / 9}" width="${h / 9}" height="${h * 5 / 9}" fill="#fff"/><rect y="${h * 2 / 9}" width="${h * 5 / 9}" height="${h / 9}" fill="#fff"/><rect width="${w}" height="${h}" fill="none" ${r}/></g>`;
  return '';
}
export function moneyBag(sym, c = '#c9a46a', label = '') {
  return `<g><path d="M -70 -10 Q -96 -120 -36 -150 L -50 -178 Q 0 -196 50 -178 L 36 -150 Q 96 -120 70 -10 Q 0 6 -70 -10 Z" fill="${c}" ${st(5)}/>
  <path d="M -40 -150 Q 0 -140 40 -150" fill="none" ${st(5)}/><path d="M -10 -150 q -10 -14 -22 -6 M 10 -150 q 10 -14 22 -6" fill="none" stroke="#6b4a2b" stroke-width="5" stroke-linecap="round"/>
  <text x="0" y="-52" text-anchor="middle" font-family="Fira Sans Extra Condensed" font-weight="900" font-size="78" fill="#3a2a10">${sym}</text>${label}</g>`;
}
export function banknote(w = 360, h = 180, val = '100', id = '') {
  return `<g ${id ? `id="${id}"` : ''}><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="8" fill="#9fc7a8" ${st(5)}/>
  <rect x="${-w / 2 + 12}" y="${-h / 2 + 12}" width="${w - 24}" height="${h - 24}" rx="5" fill="none" stroke="#3d6b4c" stroke-width="3" stroke-dasharray="7 5"/>
  <circle cx="${-w / 4}" cy="0" r="${h * .3}" fill="#c8e0cc" stroke="#3d6b4c" stroke-width="3"/><path d="M ${-w / 4 - 18} 14 Q ${-w / 4} -26 ${-w / 4 + 18} 14 Z" fill="#3d6b4c"/>
  <text x="${w / 6}" y="${h * .1}" text-anchor="middle" font-family="Fira Sans Extra Condensed" font-weight="900" font-size="${h * .42}" fill="#24452f">${val}</text>
  <text x="${w / 6}" y="${h * .34}" text-anchor="middle" font-family="Fira Sans Extra Condensed" font-weight="800" font-size="${h * .14}" fill="#24452f" letter-spacing="3">ΔΡΑΧΜΑΙ</text></g>`;
}
export function scroll(text, w = 300) {
  return `<g><rect x="${-w / 2}" y="-70" width="${w}" height="140" fill="#F1E2BC" ${st(5)}/>
  <rect x="${-w / 2 - 18}" y="-80" width="24" height="160" rx="12" fill="#d9c08c" ${st(5)}/><rect x="${w / 2 - 6}" y="-80" width="24" height="160" rx="12" fill="#d9c08c" ${st(5)}/>
  <text x="0" y="-8" text-anchor="middle" font-family="Fira Sans Extra Condensed" font-weight="900" font-size="54" fill="${INK}">${text}</text>
  <path d="M ${-w / 2 + 30} 26 H ${w / 2 - 30} M ${-w / 2 + 30} 46 H ${w / 2 - 70}" stroke="#a8916a" stroke-width="5" stroke-linecap="round"/></g>`;
}
export function stamp(text, c = '#C0392B', w = 420, fs = 72) {
  return `<g><rect x="${-w / 2}" y="-60" width="${w}" height="120" rx="10" fill="rgba(255,255,255,.1)" stroke="${c}" stroke-width="10"/><rect x="${-w / 2 + 12}" y="-48" width="${w - 24}" height="96" rx="6" fill="none" stroke="${c}" stroke-width="4"/>
  <text x="0" y="${fs * .34}" text-anchor="middle" font-family="Fira Sans Extra Condensed" font-weight="900" font-size="${fs}" fill="${c}" letter-spacing="2">${text}</text></g>`;
}
export function ship(fl, s = 1) {
  return `<g transform="scale(${s})"><path d="M -170 0 L 170 0 L 140 46 L -150 46 Z" fill="#6f7a84" ${st(5)}/><rect x="-90" y="-50" width="140" height="50" fill="#8a949c" ${st(5)}/><rect x="-60" y="-100" width="34" height="52" fill="#555f68" ${st(5)}/><rect x="-6" y="-92" width="30" height="44" fill="#555f68" ${st(5)}/>
  <path d="M 80 -30 L 150 -42" ${st(9)}/><path d="M -150 -6 L 160 -6" stroke="#4b545c" stroke-width="5"/>
  <path d="M 110 0 V -150" ${st(5)}/><g transform="translate(110,-150)">${flag(fl, 66, 44)}</g>
  <g class="smoke" opacity=".8"><circle cx="-44" cy="-122" r="16" fill="#ddd" ${st(3)}/><circle cx="-58" cy="-150" r="20" fill="#e9e9e9" ${st(3)}/></g></g>`;
}
export function palace() {
  const cols = Array.from({ length: 6 }, (_, i) => `<rect x="${-150 + i * 56}" y="-230" width="24" height="200" fill="#f4ecd8" ${st(4)}/>`).join('');
  return `<g><rect x="-260" y="-260" width="520" height="260" fill="#e9dcc0" ${st(5)}/><path d="M -290 -260 L 0 -360 L 290 -260 Z" fill="#efe4c9" ${st(5)}/>
  <rect x="-180" y="-250" width="360" height="20" fill="#d8c8a6" ${st(4)}/>${cols}<rect x="-210" y="-30" width="420" height="30" fill="#d8c8a6" ${st(4)}/>
  <rect x="-240" y="-200" width="50" height="70" fill="#7a8fa6" ${st(4)}/><rect x="190" y="-200" width="50" height="70" fill="#7a8fa6" ${st(4)}/>
  <path d="M 0 -360 V -420" ${st(5)}/><g transform="translate(0,-420)">${flag('gr', 70, 46)}</g>
  <rect x="-150" y="-140" width="300" height="20" fill="#cdbb95" ${st(4)}/></g>`;
}
export function cloudStorm() {
  return `<g><path d="M -200 0 Q -240 -70 -170 -96 Q -150 -170 -60 -150 Q -10 -220 80 -170 Q 170 -190 190 -110 Q 260 -80 210 0 Z" fill="#4a4f5c" ${st(6)}/>
  <path d="M -40 10 L -70 90 L -36 80 L -60 160 L 10 60 L -24 70 L 0 10 Z" fill="#FFD54A" ${st(5)}/></g>`;
}
export function weightBlock(text) {
  return `<g><rect x="-230" y="-200" width="460" height="200" rx="18" fill="#5b5f68" ${st(6)}/><rect x="-200" y="-176" width="400" height="20" rx="8" fill="#6c717b"/>
  <text x="0" y="-80" text-anchor="middle" font-family="Fira Sans Extra Condensed" font-weight="900" font-size="64" fill="#fff" stroke="${INK}" stroke-width="7" paint-order="stroke">${text}</text>
  <text x="0" y="-22" text-anchor="middle" font-family="Fira Sans Extra Condensed" font-weight="900" font-size="38" fill="#FFD54A" stroke="${INK}" stroke-width="5" paint-order="stroke">∞ ΤΟΝΟΙ</text></g>`;
}
export function vault() {
  return `<g><rect x="-230" y="-300" width="460" height="300" rx="20" fill="#7b818a" ${st(6)}/><circle cx="0" cy="-150" r="120" fill="#9aa1aa" ${st(6)}/><circle cx="0" cy="-150" r="96" fill="#878e97" ${st(4)}/>
  <g id="vaultWheel"><circle cx="0" cy="-150" r="30" fill="#5e646c" ${st(5)}/>${[0, 60, 120].map(a => `<rect x="-6" y="-210" width="12" height="120" rx="6" fill="#5e646c" ${st(4)} transform="rotate(${a},0,-150)"/>`).join('')}</g></g>`;
}
export function goldBars() {
  const bar = (x, y) => `<path d="M ${x - 40} ${y} L ${x - 28} ${y - 26} L ${x + 28} ${y - 26} L ${x + 40} ${y} Z" fill="#F2C14E" ${st(4)}/><path d="M ${x - 22} ${y - 20} L ${x + 22} ${y - 20}" stroke="#fff3c4" stroke-width="4"/>`;
  return `<g>${bar(-44, 0)}${bar(44, 0)}${bar(0, -28)}</g>`;
}
export function fxStack() {
  return `<g><rect x="-60" y="-40" width="120" height="70" rx="6" fill="#d7d2f0" ${st(4)}/><rect x="-54" y="-54" width="120" height="70" rx="6" fill="#e6e1ff" ${st(4)}/><text x="6" y="-8" text-anchor="middle" font-family="Fira Sans Extra Condensed" font-weight="900" font-size="34" fill="#3C3B6E">£ $ ₣</text></g>`;
}
export function padlock(c = '#d9a93b') {
  return `<g><path d="M -34 -40 V -70 Q -34 -110 0 -110 Q 34 -110 34 -70 V -40" fill="none" stroke="${INK}" stroke-width="18"/><path d="M -34 -40 V -70 Q -34 -110 0 -110 Q 34 -110 34 -70 V -40" fill="none" stroke="#aab" stroke-width="10"/>
  <rect x="-56" y="-48" width="112" height="90" rx="12" fill="${c}" ${st(6)}/><circle cx="0" cy="-10" r="11" fill="${INK}"/><rect x="-4" y="-6" width="8" height="26" fill="${INK}"/></g>`;
}
export function press() {
  return `<g><rect x="-200" y="-60" width="400" height="60" fill="#5b4636" ${st(6)}/><rect x="-170" y="-280" width="40" height="230" fill="#6b5442" ${st(6)}/><rect x="130" y="-280" width="40" height="230" fill="#6b5442" ${st(6)}/>
  <rect x="-190" y="-300" width="380" height="40" rx="8" fill="#7a6250" ${st(6)}/><g id="pressPlate"><rect x="-120" y="-210" width="240" height="40" fill="#9aa1aa" ${st(5)}/><rect x="-8" y="-262" width="16" height="56" fill="#888" ${st(4)}/></g>
  <rect x="-130" y="-80" width="260" height="22" fill="#cfc7b2" ${st(4)}/></g>`;
}
export function ballotBox() {
  return `<g><path d="M -150 0 L -130 -200 L 130 -200 L 150 0 Z" fill="#c9a46a" ${st(6)}/><rect x="-60" y="-212" width="120" height="16" rx="6" fill="${INK}"/><path d="M -110 -150 H 110" stroke="#a8823c" stroke-width="6"/>
  <text x="0" y="-70" text-anchor="middle" font-family="Fira Sans Extra Condensed" font-weight="900" font-size="54" fill="${INK}">ΚΑΛΠΗ</text></g>`;
}
export function ledger() {
  const rows = Array.from({ length: 6 }, (_, i) => `<path d="M 30 ${-150 + i * 34} H 330" stroke="#c9b892" stroke-width="3"/>`).join('');
  return `<g><path d="M -340 -220 Q -170 -250 0 -210 Q 170 -250 340 -220 L 340 60 Q 170 30 0 70 Q -170 30 -340 60 Z" fill="#f6edd6" ${st(6)}/><path d="M 0 -210 V 70" ${st(5)}/>
  <text x="-170" y="-150" text-anchor="middle" font-family="Fira Sans Extra Condensed" font-weight="900" font-size="44" fill="${INK}">ΕΣΟΔΑ</text>
  <text x="170" y="-150" text-anchor="middle" font-family="Fira Sans Extra Condensed" font-weight="900" font-size="44" fill="${INK}">ΕΞΟΔΑ</text>${rows}${rows.replace(/M 30/g, 'M -330').replace(/H 330/g, 'H -30')}</g>`;
}
export function balance() {
  return `<g><path d="M -60 0 L 60 0 L 20 -30 L -20 -30 Z" fill="#8a6b3c" ${st(5)}/><rect x="-8" y="-300" width="16" height="272" fill="#a8823c" ${st(5)}/><circle cx="0" cy="-300" r="16" fill="#d9a93b" ${st(5)}/>
  <g id="beam"><rect x="-260" y="-308" width="520" height="16" rx="8" fill="#a8823c" ${st(5)}/>
   <g id="panL" transform="translate(-250,-300)"><path d="M 0 0 L -60 150 M 0 0 L 60 150" stroke="${INK}" stroke-width="4"/><path d="M -90 150 Q 0 196 90 150 Z" fill="#d9a93b" ${st(5)}/><g id="panLc"></g></g>
   <g id="panR" transform="translate(250,-300)"><path d="M 0 0 L -60 150 M 0 0 L 60 150" stroke="${INK}" stroke-width="4"/><path d="M -90 150 Q 0 196 90 150 Z" fill="#d9a93b" ${st(5)}/><g id="panRc"></g></g></g></g>`;
}
export function scissors() {
  return `<g><g id="bladeA"><path d="M 0 0 L 230 -18 L 230 6 Z" fill="#cfd5dc" ${st(5)}/><circle cx="-60" cy="22" r="34" fill="none" stroke="${INK}" stroke-width="20"/><circle cx="-60" cy="22" r="34" fill="none" stroke="#c0392b" stroke-width="12"/></g>
  <g id="bladeB"><path d="M 0 0 L 230 18 L 230 -6 Z" fill="#e3e8ec" ${st(5)}/><circle cx="-60" cy="-22" r="34" fill="none" stroke="${INK}" stroke-width="20"/><circle cx="-60" cy="-22" r="34" fill="none" stroke="#c0392b" stroke-width="12"/></g><circle r="9" fill="#888" ${st(4)}/></g>`;
}
export function wreath() {
  const leaves = (side) => Array.from({ length: 9 }, (_, i) => { const a = (200 + i * 18) * Math.PI / 180, x = Math.cos(a) * 150 * side, y = Math.sin(a) * 150; return `<ellipse cx="${x}" cy="${y}" rx="26" ry="11" fill="#6aa84f" ${st(3.5)} transform="rotate(${(i * 18 + 110) * side},${x},${y})"/>`; }).join('');
  return `<g>${leaves(1)}${leaves(-1)}</g>`;
}
export function bond() {
  return `<g><rect x="-150" y="-100" width="300" height="200" fill="#f4ead2" ${st(5)}/><rect x="-136" y="-86" width="272" height="172" fill="none" stroke="#9b7b3a" stroke-width="4"/>
  <text x="0" y="-36" text-anchor="middle" font-family="Fira Sans Extra Condensed" font-weight="900" font-size="40" fill="${INK}">ΟΜΟΛΟΓΙΑ</text>
  <text x="0" y="6" text-anchor="middle" font-family="Fira Sans Extra Condensed" font-weight="800" font-size="30" fill="${INK}">ΤΟΥ ΔΗΜΟΣΙΟΥ</text>
  <circle cx="90" cy="54" r="22" fill="#c0392b" ${st(3)}/><path d="M -110 50 H 40" stroke="#b3a27c" stroke-width="5"/></g>`;
}
export function wall() {
  const bricks = []; for (let r = 0; r < 9; r++) for (let c = 0; c < 4; c++) bricks.push(`<rect x="${(r % 2 ? -40 : 0) + c * 80}" y="${-r * 44 - 44}" width="80" height="44" fill="#b0563a" ${st(4)}/>`);
  return `<g><clipPath id="wallClip"><rect x="0" y="-396" width="300" height="396"/></clipPath><g clip-path="url(#wallClip)">${bricks.join('')}</g><rect x="0" y="-396" width="300" height="396" fill="none" ${st(6)}/></g>`;
}
export function bulb() {
  return `<g><circle cx="0" cy="-60" r="56" fill="#FFE066" ${st(6)}/><rect x="-26" y="-12" width="52" height="34" rx="6" fill="#aaa" ${st(5)}/><path d="M -18 -60 Q 0 -90 18 -60" fill="none" stroke="#e0a800" stroke-width="6"/>
  ${[0, 45, 90, 135, 180].map(a => `<path d="M 0 -60 m ${Math.cos((a + 180) * Math.PI / 180) * 76} ${Math.sin((a + 180) * Math.PI / 180) * 76} l ${Math.cos((a + 180) * Math.PI / 180) * 26} ${Math.sin((a + 180) * Math.PI / 180) * 26}" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`).join('')}</g>`;
}
export function building(text) {
  return `<g><rect x="-170" y="-260" width="340" height="260" fill="#e9dcc0" ${st(6)}/><path d="M -195 -260 L 0 -330 L 195 -260 Z" fill="#efe4c9" ${st(6)}/>
  ${Array.from({ length: 4 }, (_, i) => `<rect x="${-130 + i * 72}" y="-200" width="44" height="150" fill="#f6eedc" ${st(4)}/>`).join('')}
  <rect x="-150" y="-252" width="300" height="44" fill="#fff8e6" ${st(4)}/>
  <text x="0" y="-220" text-anchor="middle" font-family="Fira Sans Extra Condensed" font-weight="900" font-size="36" fill="${INK}">${text}</text></g>`;
}
export function meter(label) {
  return `<g><text x="0" y="-26" font-family="Fira Sans Extra Condensed" font-weight="900" font-size="48" fill="#fff" stroke="${INK}" stroke-width="8" paint-order="stroke">${label}</text>
  <rect x="0" y="0" width="900" height="64" rx="32" fill="#efe4c9" ${st(6)}/><clipPath id="clip-${label.length}-${label.charCodeAt(0)}"><rect x="0" y="0" width="900" height="64" rx="32"/></clipPath></g>`;
}

/* ---------- props added for k2-a1 (Ottoman period) ---------- */
// Ottoman banner 1715–1821: red field + white crescent (no star: the star appears on naval flags only from 1793, national flag 1844)
export function ottomanFlag(w = 90, h = 60) {
  const cx = w * .44, cy = h / 2, R = h * .3;
  return `<g><rect width="${w}" height="${h}" fill="#B8323A"/><circle cx="${cx}" cy="${cy}" r="${R}" fill="#fff"/><circle cx="${cx + R * .32}" cy="${cy}" r="${R * .8}" fill="#B8323A"/><rect width="${w}" height="${h}" fill="none" stroke="${INK}" stroke-width="3"/></g>`;
}
// umbrella: canopy origin = top of the shaft; handle hangs down to y≈+300
export function umbrella(c = '#B8323A') {
  const sc = Array.from({ length: 6 }, (_, i) => `Q ${-217 + i * 87} -30 ${-173 + i * 87} 0`).join(' ');
  return `<g><path d="M 0 -200 V 300 Q 0 340 -34 340 Q -60 340 -60 312" fill="none" stroke="${INK}" stroke-width="16" stroke-linecap="round"/><path d="M 0 -200 V 300 Q 0 340 -34 340 Q -60 340 -60 312" fill="none" stroke="#6b4a2b" stroke-width="8" stroke-linecap="round"/>
  <path d="M -260 0 Q -250 -200 0 -210 Q 250 -200 260 0 Q 217 -30 173 0 Q 130 -30 87 0 Q 43 -30 0 0 Q -43 -30 -87 0 Q -130 -30 -173 0 Q -217 -30 -260 0 Z" fill="${c}" ${st(6)}/>
  <path d="M 0 -210 Q -60 -120 -87 0 M 0 -210 Q 60 -120 87 0 M 0 -210 Q -170 -120 -260 0 M 0 -210 Q 170 -120 260 0" fill="none" stroke="rgba(0,0,0,.25)" stroke-width="4"/><circle cx="0" cy="-214" r="10" fill="${INK}"/></g>`;
}
// ornate seat of power (bottom-centre origin, ~330 tall)
export function throne(c = '#B8323A') {
  return `<g><rect x="-110" y="-330" width="220" height="250" rx="30" fill="#D8A93B" ${st(6)}/><rect x="-80" y="-300" width="160" height="200" rx="20" fill="${c}" ${st(5)}/>
  <circle cx="-110" cy="-330" r="20" fill="#f2c14e" ${st(5)}/><circle cx="110" cy="-330" r="20" fill="#f2c14e" ${st(5)}/>
  <rect x="-130" y="-120" width="260" height="50" rx="14" fill="#D8A93B" ${st(6)}/><rect x="-118" y="-110" width="236" height="26" rx="10" fill="${c}"/>
  <rect x="-120" y="-72" width="26" height="72" fill="#a8823c" ${st(5)}/><rect x="94" y="-72" width="26" height="72" fill="#a8823c" ${st(5)}/></g>`;
}
// 18th-century brig (waterline-centre origin), plain pennant (no national flag asserted)
export function sailship(hull = '#7a5232') {
  const sail = (x, y, w, h) => `<path d="M ${x - w / 2} ${y} Q ${x} ${y + 18} ${x + w / 2} ${y} L ${x + w / 2 + 8} ${y + h} Q ${x} ${y + h + 26} ${x - w / 2 - 8} ${y + h} Z" fill="#fbf6e8" ${st(5)}/>`;
  return `<g><path d="M -250 -70 L 250 -70 L 214 30 Q 0 52 -214 30 Z" fill="${hull}" ${st(6)}/><path d="M -238 -40 L 238 -40" stroke="#f2c14e" stroke-width="12"/><path d="M -238 -40 L 238 -40" stroke="${INK}" stroke-width="2" opacity=".4"/>
  ${[-150, -90, -30, 30, 90, 150].map(x => `<rect x="${x - 10}" y="-30" width="20" height="16" fill="${INK}"/>`).join('')}
  <path d="M 250 -70 L 330 -110" ${st(8)}/><rect x="-104" y="-420" width="12" height="352" fill="#5a3d24" ${st(4)}/><rect x="86" y="-450" width="12" height="382" fill="#5a3d24" ${st(4)}/>
  ${sail(-98, -400, 160, 90)}${sail(-98, -296, 190, 110)}${sail(92, -430, 170, 96)}${sail(92, -318, 200, 120)}
  <path d="M 92 -450 L 170 -436 L 92 -422 Z" fill="#fbf6e8" ${st(4)}/></g>`;
}
// gilded picture frame (centre origin)
export function frame(w = 900, h = 560) {
  return `<g><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" fill="none" stroke="${INK}" stroke-width="64"/><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" fill="none" stroke="#D8A93B" stroke-width="52"/>
  <rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" fill="none" stroke="#f2d27a" stroke-width="10" stroke-dasharray="18 22"/>
  <rect x="${-w / 2 + 26}" y="${-h / 2 + 26}" width="${w - 52}" height="${h - 52}" fill="none" stroke="${INK}" stroke-width="5"/><rect x="${-w / 2 - 26}" y="${-h / 2 - 26}" width="${w + 52}" height="${h + 52}" fill="none" stroke="${INK}" stroke-width="5"/></g>`;
}
// little stone arch bridge (bottom-centre origin, 520 wide)
export function bridge() {
  const stones = []; for (let r = 0; r < 3; r++) for (let c = 0; c < 9; c++) stones.push(`<rect x="${-260 + c * 58 + (r % 2) * 29}" y="${-150 + r * 30}" width="58" height="30" fill="#bfae8e" ${st(3)}/>`);
  return `<g><clipPath id="brClip"><path d="M -260 0 L -260 -150 L 260 -150 L 260 0 L 150 0 Q 150 -110 0 -110 Q -150 -110 -150 0 Z"/></clipPath>
  <path d="M -260 0 L -260 -150 L 260 -150 L 260 0 L 150 0 Q 150 -110 0 -110 Q -150 -110 -150 0 Z" fill="#cdbd9c"/><g clip-path="url(#brClip)">${stones.join('')}</g>
  <path d="M -260 0 L -260 -150 L 260 -150 L 260 0 L 150 0 Q 150 -110 0 -110 Q -150 -110 -150 0 Z" fill="none" ${st(6)}/><path d="M -280 -150 H 280" ${st(10)}/></g>`;
}
// speech bubble (centre origin), tail toward (tx,ty) relative to centre
export function bubble(w = 240, h = 150, tx = -60, ty = 130, inner = '') {
  return `<g><path d="M ${-w / 2 + 30} ${h / 2 - 4} L ${tx} ${ty} L ${-w / 2 + 80} ${h / 2 - 4} Z" fill="#fff" ${st(5)}/><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${h / 2.4}" fill="#fff" ${st(5)}/><path d="M ${-w / 2 + 34} ${h / 2 - 3} L ${-w / 2 + 76} ${h / 2 - 3}" stroke="#fff" stroke-width="8"/>${inner}</g>`;
}
export function shield(c = '#5D8BD0') {
  return `<g><path d="M 0 -120 Q 60 -96 100 -100 Q 104 20 0 90 Q -104 20 -100 -100 Q -60 -96 0 -120 Z" fill="${c}" ${st(6)}/><path d="M 0 -96 Q 46 -78 78 -80 Q 80 10 0 64 Q -80 10 -78 -80 Q -46 -78 0 -96 Z" fill="none" stroke="#fff" stroke-width="8" opacity=".7"/></g>`;
}
// small village house (bottom-centre origin)
export function house(c = '#efe4c9', roof = '#b0563a') {
  return `<g><rect x="-90" y="-130" width="180" height="130" fill="${c}" ${st(5)}/><path d="M -112 -126 L 0 -210 L 112 -126 Z" fill="${roof}" ${st(5)}/><rect x="-24" y="-74" width="48" height="74" fill="#7a5232" ${st(4)}/><rect x="40" y="-100" width="32" height="32" fill="#9fc3d6" ${st(4)}/></g>`;
}
