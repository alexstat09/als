// Original chibi character designs (local coords: feet centre at 0,0; ~ 330 units tall)
// Parts are addressable for animation: #<id>-body, #<id>-head (pivot 0,-150),
// expression groups #<id>-x-<name> (neutral | angry | blink | shock), #<id>-stache, #<id>-glint
const defaults = { ink: '#1b1a1f', lw: 5, skin: '#F7F1E8', shade: 'rgba(0,0,0,.10)', blush: 'rgba(232,110,90,.28)', id: 'c' };

const headBase = o => `
  <circle cx="0" cy="-228" r="84" fill="${o.skin}" stroke="${o.ink}" stroke-width="${o.lw}"/>
  <path d="M -62 -180 Q 0 -138 62 -180 Q 40 -150 0 -146 Q -40 -150 -62 -180 Z" fill="${o.shade}"/>`;

const expr = (o, name, inner, show) => `<g id="${o.id}-x-${name}" style="display:${show ? 'inline' : 'none'}">${inner}</g>`;

export function venizelos(opts = {}) {
  const o = { ...defaults, ...opts };
  const coat = o.coat || '#2a2b31', beard = o.beard || '#D9D5CE', ink = o.ink, lw = o.lw;
  const brow = (l, r) => `<path d="${l}" stroke="${ink}" stroke-width="${lw * 1.1}" stroke-linecap="round" fill="none"/><path d="${r}" stroke="${ink}" stroke-width="${lw * 1.1}" stroke-linecap="round" fill="none"/>`;
  const start = o.start || 'angry';
  return `
  <g id="${o.id}">
   <ellipse cx="0" cy="0" rx="78" ry="12" fill="rgba(0,0,0,.20)"/>
   <g id="${o.id}-body">
    <rect x="-32" y="-58" width="24" height="54" rx="8" fill="#34353c" stroke="${ink}" stroke-width="${lw}"/>
    <rect x="8" y="-58" width="24" height="54" rx="8" fill="#34353c" stroke="${ink}" stroke-width="${lw}"/>
    <ellipse cx="-24" cy="-4" rx="20" ry="9" fill="${ink}"/>
    <ellipse cx="24" cy="-4" rx="20" ry="9" fill="${ink}"/>
    <path d="M -46 -156 Q -74 -110 -66 -46 Q 0 -36 66 -46 Q 74 -110 46 -156 Q 0 -168 -46 -156 Z" fill="${coat}" stroke="${ink}" stroke-width="${lw}" stroke-linejoin="round"/>
    <path d="M -20 -158 L 0 -116 L 20 -158 Z" fill="#fbfaf7" stroke="${ink}" stroke-width="${lw * .6}" stroke-linejoin="round"/>
    <path d="M -10 -146 L 0 -140 L 10 -146 L 10 -134 L 0 -140 L -10 -134 Z" fill="${ink}"/>
    <rect x="-60" y="-122" width="120" height="30" rx="15" fill="${coat}" stroke="${ink}" stroke-width="${lw}"/>
    <path d="M -44 -112 Q 0 -96 44 -112" fill="none" stroke="${ink}" stroke-width="${lw * .6}" stroke-linecap="round"/>
    <circle cx="48" cy="-114" r="11" fill="${o.skin}" stroke="${ink}" stroke-width="${lw * .8}"/>
    <circle cx="-46" cy="-100" r="11" fill="${o.skin}" stroke="${ink}" stroke-width="${lw * .8}"/>
   </g>
   <g id="${o.id}-head">
    ${headBase(o)}
    <path d="M -84 -238 q -10 18 4 36 q 10 -6 12 -18 q -6 -10 -16 -18 Z" fill="${beard}" stroke="${ink}" stroke-width="${lw * .7}" stroke-linejoin="round"/>
    <path d="M 84 -238 q 10 18 -4 36 q -10 -6 -12 -18 q 6 -10 16 -18 Z" fill="${beard}" stroke="${ink}" stroke-width="${lw * .7}" stroke-linejoin="round"/>
    <path d="M -34 -296 Q -10 -308 18 -302" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".9"/>
    <path d="M -50 -196 Q -54 -168 -30 -150 Q -12 -136 0 -128 Q 12 -136 30 -150 Q 54 -168 50 -196 Q 36 -178 18 -176 Q 0 -172 -18 -176 Q -36 -178 -50 -196 Z" fill="${beard}" stroke="${ink}" stroke-width="${lw * .8}" stroke-linejoin="round"/>
    <path d="M -16 -160 l 4 7 M 0 -156 l 0 8 M 16 -160 l -4 7" stroke="rgba(0,0,0,.16)" stroke-width="3" stroke-linecap="round"/>
    <path d="M -8 -176 Q 0 -172 8 -176" fill="none" stroke="${ink}" stroke-width="${lw * .6}" stroke-linecap="round"/>
    <g id="${o.id}-stache"><path d="M 0 -196 Q -16 -206 -36 -196 Q -30 -182 -10 -186 Q -2 -188 0 -192 Q 2 -188 10 -186 Q 30 -182 36 -196 Q 16 -206 0 -196 Z" fill="${beard}" stroke="${ink}" stroke-width="${lw * .7}" stroke-linejoin="round"/></g>
    <circle cx="-30" cy="-230" r="19" fill="rgba(255,255,255,.35)" stroke="${ink}" stroke-width="${lw * .75}"/>
    <circle cx="30" cy="-230" r="19" fill="rgba(255,255,255,.35)" stroke="${ink}" stroke-width="${lw * .75}"/>
    <path d="M -11 -232 Q 0 -238 11 -232" fill="none" stroke="${ink}" stroke-width="${lw * .6}"/>
    ${expr(o, 'neutral', `<ellipse cx="-30" cy="-229" rx="4.5" ry="6.5" fill="${ink}"/><ellipse cx="30" cy="-229" rx="4.5" ry="6.5" fill="${ink}"/>${brow('M -46 -258 Q -30 -264 -16 -258', 'M 46 -258 Q 30 -264 16 -258')}`, start === 'neutral')}
    ${expr(o, 'angry', `<ellipse cx="-37" cy="-228" rx="4.5" ry="6.5" fill="${ink}"/><ellipse cx="23" cy="-228" rx="4.5" ry="6.5" fill="${ink}"/>${brow('M -50 -262 L -16 -252', 'M 50 -262 L 16 -252')}`, start === 'angry')}
    ${expr(o, 'blink', `<path d="M -40 -229 Q -30 -224 -20 -229 M 20 -229 Q 30 -224 40 -229" stroke="${ink}" stroke-width="${lw * .8}" stroke-linecap="round" fill="none"/>${brow('M -46 -258 Q -30 -264 -16 -258', 'M 46 -258 Q 30 -264 16 -258')}`, false)}
    ${expr(o, 'shock', `<circle cx="-30" cy="-230" r="3.2" fill="${ink}"/><circle cx="30" cy="-230" r="3.2" fill="${ink}"/>${brow('M -46 -266 Q -30 -276 -16 -268', 'M 46 -266 Q 30 -276 16 -268')}`, false)}
    ${expr(o, 'happy', `<path d="M -40 -226 Q -30 -238 -20 -226 M 20 -226 Q 30 -238 40 -226" fill="none" stroke="${ink}" stroke-width="${lw * .8}" stroke-linecap="round"/>${brow('M -46 -260 Q -30 -268 -16 -260', 'M 46 -260 Q 30 -268 16 -260')}`, start === 'happy')}
    ${expr(o, 'sad', `<ellipse cx="-30" cy="-226" rx="4.5" ry="5.5" fill="${ink}"/><ellipse cx="30" cy="-226" rx="4.5" ry="5.5" fill="${ink}"/>${brow('M -46 -252 L -16 -262', 'M 46 -252 L 16 -262')}<path d="M 44 -214 q 5 11 0 15 q -5 -4 0 -15 Z" fill="#7fc1e8"/>`, start === 'sad')}
    <g id="${o.id}-glint" opacity="0"><path d="M -44 -222 L -24 -246 L -18 -240 L -38 -216 Z M 16 -222 L 36 -246 L 42 -240 L 22 -216 Z" fill="#fff"/></g>
    <ellipse cx="-58" cy="-204" rx="10" ry="6" fill="${o.blush}"/>
    <ellipse cx="58" cy="-204" rx="10" ry="6" fill="${o.blush}"/>
   </g>
  </g>`;
}

export function konstantinos(opts = {}) {
  const o = { ...defaults, ...opts };
  const tunic = o.tunic || '#22304d', gold = o.gold || '#D8A93B', hair = '#4a3326', ink = o.ink, lw = o.lw;
  const brow = (l, r) => `<path d="${l}" stroke="${ink}" stroke-width="${lw * 1.2}" stroke-linecap="round" fill="none"/><path d="${r}" stroke="${ink}" stroke-width="${lw * 1.2}" stroke-linecap="round" fill="none"/>`;
  const start = o.start || 'angry';
  return `
  <g id="${o.id}">
   <ellipse cx="0" cy="0" rx="80" ry="12" fill="rgba(0,0,0,.20)"/>
   <g id="${o.id}-body">
    <rect x="-34" y="-60" width="26" height="58" rx="8" fill="#1f2333" stroke="${ink}" stroke-width="${lw}"/>
    <rect x="8" y="-60" width="26" height="58" rx="8" fill="#1f2333" stroke="${ink}" stroke-width="${lw}"/>
    <path d="M -34 -30 h 26 M 8 -30 h 26" stroke="${ink}" stroke-width="${lw * .6}"/>
    <ellipse cx="-24" cy="-4" rx="21" ry="9" fill="${ink}"/>
    <ellipse cx="24" cy="-4" rx="21" ry="9" fill="${ink}"/>
    <path d="M -40 -146 Q -92 -120 -74 -84 Q -60 -76 -48 -86" fill="none" stroke="${ink}" stroke-width="${30 + lw * 2}" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M -40 -146 Q -92 -120 -74 -84 Q -60 -76 -48 -86" fill="none" stroke="${tunic}" stroke-width="30" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M 40 -146 Q 92 -120 74 -84 Q 60 -76 48 -86" fill="none" stroke="${ink}" stroke-width="${30 + lw * 2}" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M 40 -146 Q 92 -120 74 -84 Q 60 -76 48 -86" fill="none" stroke="${tunic}" stroke-width="30" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="-66" cy="-84" r="12" fill="${o.skin}" stroke="${ink}" stroke-width="${lw * .8}"/>
    <circle cx="66" cy="-84" r="12" fill="${o.skin}" stroke="${ink}" stroke-width="${lw * .8}"/>
    <path d="M -48 -158 Q -64 -110 -58 -50 Q 0 -42 58 -50 Q 64 -110 48 -158 Q 0 -170 -48 -158 Z" fill="${tunic}" stroke="${ink}" stroke-width="${lw}" stroke-linejoin="round"/>
    <rect x="-60" y="-86" width="120" height="16" rx="5" fill="#6b4a2b" stroke="${ink}" stroke-width="${lw * .7}"/>
    <rect x="-10" y="-89" width="20" height="22" rx="4" fill="${gold}" stroke="${ink}" stroke-width="${lw * .6}"/>
    <circle cx="0" cy="-140" r="4.5" fill="${gold}"/><circle cx="0" cy="-122" r="4.5" fill="${gold}"/><circle cx="0" cy="-104" r="4.5" fill="${gold}"/>
    <path d="M -44 -150 L 40 -92 L 50 -104 L -34 -160 Z" fill="#3f7fc4" opacity=".95" stroke="${ink}" stroke-width="${lw * .5}"/>
    <rect x="-66" y="-166" width="34" height="14" rx="7" fill="${gold}" stroke="${ink}" stroke-width="${lw * .7}"/>
    <rect x="32" y="-166" width="34" height="14" rx="7" fill="${gold}" stroke="${ink}" stroke-width="${lw * .7}"/>
    <path d="M -64 -152 v 8 M -58 -152 v 9 M -52 -152 v 9 M -46 -152 v 9 M -40 -152 v 8 M 40 -152 v 8 M 46 -152 v 9 M 52 -152 v 9 M 58 -152 v 9 M 64 -152 v 8" stroke="${gold}" stroke-width="3"/>
    <path d="M -24 -164 Q 0 -150 24 -164 L 22 -150 Q 0 -140 -22 -150 Z" fill="${tunic}" stroke="${ink}" stroke-width="${lw * .6}"/>
   </g>
   <g id="${o.id}-head">
    ${headBase(o)}
    <path d="M -82 -232 q -4 22 6 34 l 8 -6 q -4 -14 -2 -30 Z" fill="${hair}"/>
    <path d="M 82 -232 q 4 22 -6 34 l -8 -6 q 4 -14 2 -30 Z" fill="${hair}"/>
    <path d="M -80 -262 Q -86 -330 0 -334 Q 86 -330 80 -262 Z" fill="${tunic}" stroke="${ink}" stroke-width="${lw}" stroke-linejoin="round"/>
    <rect x="-82" y="-276" width="164" height="18" rx="5" fill="${gold}" stroke="${ink}" stroke-width="${lw * .7}"/>
    <path d="M -84 -260 Q 0 -238 84 -260 Q 70 -248 0 -244 Q -70 -248 -84 -260 Z" fill="#111" stroke="${ink}" stroke-width="${lw * .6}"/>
    <path d="M -14 -284 L -14 -300 L -7 -292 L 0 -304 L 7 -292 L 14 -300 L 14 -284 Z" fill="${gold}" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"/>
    ${expr(o, 'neutral', `<ellipse cx="-30" cy="-216" rx="5" ry="7" fill="${ink}"/><ellipse cx="30" cy="-216" rx="5" ry="7" fill="${ink}"/>${brow('M -46 -236 Q -30 -242 -14 -236', 'M 46 -236 Q 30 -242 14 -236')}`, start === 'neutral')}
    ${expr(o, 'angry', `<ellipse cx="-24" cy="-216" rx="5" ry="7" fill="${ink}"/><ellipse cx="36" cy="-216" rx="5" ry="7" fill="${ink}"/>${brow('M -48 -240 L -12 -226', 'M 56 -240 L 22 -226')}`, start === 'angry')}
    ${expr(o, 'blink', `<path d="M -40 -216 Q -30 -211 -20 -216 M 20 -216 Q 30 -211 40 -216" stroke="${ink}" stroke-width="${lw * .8}" stroke-linecap="round" fill="none"/>${brow('M -46 -236 Q -30 -242 -14 -236', 'M 46 -236 Q 30 -242 14 -236')}`, false)}
    ${expr(o, 'shock', `<circle cx="-30" cy="-218" r="9" fill="#fff" stroke="${ink}" stroke-width="3"/><circle cx="30" cy="-218" r="9" fill="#fff" stroke="${ink}" stroke-width="3"/><circle cx="-30" cy="-218" r="3" fill="${ink}"/><circle cx="30" cy="-218" r="3" fill="${ink}"/>`, false)}
    ${expr(o, 'happy', `<path d="M -40 -214 Q -30 -226 -20 -214 M 20 -214 Q 30 -226 40 -214" fill="none" stroke="${ink}" stroke-width="${lw * .8}" stroke-linecap="round"/>${brow('M -46 -238 Q -30 -246 -14 -238', 'M 46 -238 Q 30 -246 14 -238')}`, start === 'happy')}
    <g id="${o.id}-stache"><path d="M 0 -192 Q -24 -206 -50 -194 Q -66 -186 -62 -206 Q -70 -176 -42 -178 Q -16 -180 0 -186 Q 16 -180 42 -178 Q 70 -176 62 -206 Q 66 -186 50 -194 Q 24 -206 0 -192 Z" fill="${hair}" stroke="${ink}" stroke-width="${lw * .6}" stroke-linejoin="round"/></g>
    <path d="M -10 -166 Q 0 -172 10 -166" fill="none" stroke="${ink}" stroke-width="${lw * .7}" stroke-linecap="round"/>
    <ellipse cx="-58" cy="-196" rx="10" ry="6" fill="${o.blush}"/>
    <ellipse cx="58" cy="-196" rx="10" ry="6" fill="${o.blush}"/>
   </g>
  </g>`;
}
