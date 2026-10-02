// Ενότητα 4 — per-shot animation code (runs in the browser after engine/runtime.js)
// Screen shakes & flashes for this episode (time, amplitude, duration)
[[C.t1, 8], [C.dix, 22, .45], [C.y1915, 10], [C.diasp, 24, .8], [C.ethn, 6], [C.sygkr, 14], [C.ypon + .9, 16, .6], [C.enop + .9, 18, .5], [C.y1917, 10], [C.kostos, 10], [C.enekr, 14], [C.lires, 10], [C.fragka, 10], [C.dolaria, 10], [C.dothik, 12], [C.elegx, 10], [C.y1920, 10], [C.kon, 16, .45], [C.xoris40, 12], [C.pathit, 14], [C.adiex, 20, .5], [C.dixot, 22, .5], [C.omol, 8], [C.dis, 10], [C.y1926, 10], [C.mikras, 18, .6]].forEach(a => shk(...a));
[C.dix, C.diasp, C.dixot, C.mikras].forEach(t => fl(t, .45));

F.S1 = t => {
  waves('S1', t);
  cam('S1-cam', t, [[0, 1010, 540, .27], [2.6, 1000, 540, 1], [4.1, 1000, 540, 1.05]]);
  slam('S1-t1', t, C.t1 + .1, { from: 2.6, rot: -8 }); slam('S1-t2', t, C.t2, { from: 2.2, rot: 4 });
};
F.S2 = t => {
  waves('S2', t); cam('S2-cam', t, [[4.1, 1000, 540, 1.05], [10.6, 1010, 560, 1.18]]);
  draw('S2-scr', t, 4.4, C.complex - 4.4 + .6, x => x);
  [4.9, 5.6, C.complex, 6.6, 7.3].forEach((t0, i) => popIn('S2-q' + i, t, t0, { rot: i % 2 ? 12 : -12 }));
  const k = P(t, C.complex, C.complex + .6); $('S2-scr').setAttribute('stroke-width', 9 + 6 * k);
  slam('S2-lbl', t, C.difficult - .1, { from: 1.8 });
};
F.S3 = t => {
  cam('S3-cam', t, [[10.62, 960, 540, 1], [15.5, 960, 560, 1.06]]);
  slide('S3-pal', t, 10.62, .4, -600, 0); slide('S3-K', t, 10.62, .4, -600, 0);
  drop('S3-V', t, C.veni - .25); idle('s3k', t, 0); idle('s3v', t, .7);
  const ang = t > C.veni + .3; expr('s3k', ang ? 'angry' : 'neutral'); expr('s3v', ang ? 'angry' : 'neutral');
  headTilt('s3v', ang ? -6 : 0);
  op('S3-spark', ang ? (Math.floor(t * 15) % 3 ? 1 : .3) : 0);
  slam('S3-n1', t, C.palace - .05); slam('S3-n2', t, C.veni + .1);
  slam('S3-stamp', t, C.dix, { from: 3, rot: -14, dur: .35 });
  if (t >= C.dix) { const b = B('S3-stamp'); b.e.setAttribute('transform', b.e.getAttribute('transform').replace(/rotate\(([-\d.e]+)\)/, (m, r) => `rotate(${+r - 6})`)); }
};
F.S4 = t => {
  cam('S4-cam', t, [[15.55, 960, 540, 1.04], [20.4, 960, 540, 1]]);
  for (let i = 0; i < 4; i++) { slide('S4-s' + i, t, 15.55 + i * .07, .3, -500, 0); idle('s4s' + i, t, i * .4); const yawn = t > C.askopi + i * .25 && t < C.askopi + 1.4 + i * .25; expr('s4s' + i, yawn ? 'yawn' : (blinkAt(t, [16.4 + i * .3, 19.1 + i * .2]) ? 'blink' : 'neutral')); }
  slam('S4-l1', t, C.askopi, { rot: -5 }); slam('S4-l2', t, C.dapan, { rot: 5 });
  popIn('S4-bag', t, 15.75);
  for (let i = 0; i < 14; i++) { const t0 = C.dapan + i * .28, k = t - t0, c = $('S4-c' + i);
    if (k < 0 || k > 1.2) { c.setAttribute('opacity', 0); continue; }
    c.setAttribute('opacity', 1 - Math.max(0, k - .9) / .3); c.setAttribute('cx', 1600 + k * 160 + (i % 3) * 20); c.setAttribute('cy', 760 + 400 * k * k - 120 * k); }
  popIn('S4-arr', t, C.dapan + .2); if (t > C.dapan + .5) put('S4-arr', { dy: Math.abs(Math.sin(t * 6)) * 18 });
  if (t > C.dapan) put('S4-bag', { s: 1 - .25 * eOut(P(t, C.dapan, 20.4)), o: 1 });
  slam('S4-y', t, C.y1915 - .05, { from: 2.6, rot: -8 }); slam('S4-t', t, C.y1915 + .2, { from: 1.8 });
};
F.S5 = t => {
  waves('S5', t); cam('S5-cam', t, [[20.42, 960, 540, 1], [27.8, 960, 540, 1.04]]);
  const ck = C.diasp; draw('S5-crA', t, ck, .55); draw('S5-crB', t, ck, .55);
  $('S5-sc').setAttribute('r', 1400 * eIO(P(t, C.ethn, C.ethn + 2.2)));
  const pd = (id, t0) => { const p = P(t, t0, t0 + .5); put(id, { dy: -280 * (1 - bounce(p)), o: t < t0 ? 0 : 1 }); };
  pd('S5-pT', C.thess7 - .3); pd('S5-pA', C.thess7 + .5);
  slam('S5-lT', t, C.thess7, { from: 2.2, rot: -6 }); slam('S5-lT2', t, C.ethn, { from: 2.4, rot: 5 });
  slam('S5-lA', t, C.thess7 + .7, { from: 2.2, rot: -6 }); slam('S5-lA2', t, C.thess7 + .9, { from: 2.4, rot: 5 });
  slam('S5-y', t, 20.5, { from: 2.6, rot: -10 });
  const kd = drop('S5-K', t, 21.5), vd = drop('S5-V', t, 22.1);
  idle('s5k', t, 0); idle('s5v', t, .6);
  const turn = t > C.diasp + .2; expr('s5k', turn ? 'angry' : (blinkAt(t, [22.6]) ? 'blink' : 'neutral')); expr('s5v', turn ? 'angry' : 'neutral');
  if (turn) { headTilt('s5k', 6 + Math.sin(q15(t) * 9) * .6); headTilt('s5v', -6 + Math.sin(q15(t) * 8) * .6); }
  op('S5-spark', t > C.diasp + .3 ? (Math.floor(t * 15) % 3 === 0 ? .35 : 1) : 0);
  slam('S5-dyo', t, C.dyo, { from: 2.8, rot: -5 });
};
F.S6 = t => {
  cam('S6-cam', t, [[27.82, 960, 540, 1.06], [30.55, 1000, 540, 1]]);
  [0, 1, 2, 3].forEach(i => { slide('S6-sh' + i, t, 27.82 + i * .12, .6, 900, 0); const b = B('S6-sh' + i); if (t > 28.5) put('S6-sh' + i, { dy: Math.sin(t * 2 + i) * 4, r: Math.sin(t * 1.6 + i) * 1.2 }); });
  const bp = P(t, 28.2, 29.6); put('S6-boat', { dx: bp < .5 ? -500 * eOut(bp * 2) : -500 + 700 * eIn((bp - .5) * 2), dy: Math.sin(t * 3) * 5, sx: bp < .5 ? 1 : -1, o: 1 });
  popIn('S6-x', t, 28.9, { rot: 20 });
  slam('S6-l', t, C.apokl, { from: 1.9 });
  popIn('S6-clash', t, C.sygkr, { rot: -20 }); slam('S6-l2', t, C.sygkr + .15);
  if (t > C.sygkr) put('S6-clash', { r: Math.sin(t * 30) * 4, s: 1 + Math.sin(t * 20) * .03, o: 1 });
};
F.S7 = t => {
  [[0, C.oik], [1, C.koin]].forEach(([i, t0]) => { fadeIn('S7-m' + i, t, t0 - .35, .25); $('S7-f' + i).setAttribute('width', 888 * eOut(P(t, t0, t0 + 1.1))); popIn('S7-w' + i, t, t0 + 1.0, { rot: 10 }); });
};
F.S8 = t => {
  cam('S8-cam', t, [[34.62, 960, 540, 1], [39.3, 960, 560, 1.05]]);
  popIn('S8-dig', t, 34.7); idle('s8d', t, 0, 2); expr('s8d', 'happy');
  draw('S8-tun', t, C.ypon - .2, 1.6, x => x);
  const dp = P(t, C.ypon - .2, C.ypon + 1.4); put('S8-dig', { x: lerp(300, 1150, eIO(dp)), dy: Math.sin(q15(t) * 20) * 6 });
  const sink = eIn(P(t, C.ypon + .9, C.ypon + 2.6)); put('S8-bld', { dy: 140 * sink, r: -6 * sink, o: 1 });
  op('S8-cracks', t > C.ypon + .9 ? 1 : 0); $('S8-cracks').setAttribute('transform', `translate(0,${140 * sink})`);
  slam('S8-l', t, C.ypon, { from: 2, rot: -6 });
};
F.S9 = t => {
  waves('S9', t); cam('S9-cam', t, [[39.32, 960, 540, 1], [46.6, 960, 560, 1.06]]);
  const push = eIO(P(t, C.epemv, C.epemv + 1.4));
  put('S9-hL', { dx: 900 * push - (t > C.epemv + 1.6 ? 900 * eIn(P(t, C.epemv + 1.6, C.epemv + 2.2)) : 0) });
  put('S9-hR', { dx: -900 * push + (t > C.epemv + 1.6 ? 900 * eIn(P(t, C.epemv + 1.6, C.epemv + 2.2)) : 0) });
  slam('S9-ep', t, C.epemv, { from: 1.8 });
  const seal = P(t, C.enop, C.enop + .8); $('S9-cr').setAttribute('stroke-dashoffset', 1000 * eIO(seal));
  $('S9-sc').setAttribute('r', 1500 * eIO(P(t, C.enop + .4, C.enop + 2.6)));
  slam('S9-en', t, C.enop + .1, { from: 2.4, rot: -4 }); slam('S9-y', t, C.y1917, { from: 2.6, rot: -10 });
  drop('S9-V', t, C.venUnder - .3); idle('s9v', t, 0); expr('s9v', 'happy');
};
F.S10 = t => {
  const lift = Math.sin(q15(t) * 26) * 3;
  put('S10-wt', { dy: -60 + lift, o: 1 }); put('S10-V', { sy: .97 + Math.sin(q15(t) * 26) * .01 });
  idle('s10v', t, 0, .5); expr('s10v', 'strain');
  op('S10-sweat', t > 47.4 ? 1 : 0); $('S10-sweat').setAttribute('transform', `translate(0,${(t * 60) % 30})`);
  slam('S10-l2', t, C.adyn + .2, { from: 2.3, rot: 6 }); slam('S10-l', t, C.xoris, { from: 1.8 });
  fadeIn('S10-help', t, C.xoris + .1, .4);
  if (t > C.kostos) { const p = P(t, C.kostos, C.kostos + .7); put('S10-wt', { dy: -60 + 30 * eIn(p) + lift }); put('S10-V', { sy: .97 - .1 * eIn(p) }); }
};
F.S11 = t => {
  cam('S11-cam', t, [[52.8, 960, 540, 1], [C.odyn - .2, 990, 540, 1.02], [C.odyn + .5, 3560, 540, 1], [60.45, 3560, 520, 1.05]]);
  drop('S11-V', t, 52.85, { h: 0, fall: .01 }); idle('s11v', t, 0);
  slide('S11-fr', t, C.symm16 - .1, .4, 900, 0); slide('S11-uk', t, C.symm16, .4, 900, 0); slide('S11-us', t, C.symm16 + .1, .4, 900, 0);
  ['s11f', 's11u', 's11s'].forEach((id, i) => idle(id, t, i * .5));
  popIn('S11-scr', t, C.daneism, { rot: -10 });
  if (t > C.daneism) put('S11-scr', { dy: Math.sin(t * 3) * 8, r: Math.sin(t * 2) * 3, o: 1 });
  expr('s11v', t > C.daneism + .4 ? 'happy' : 'neutral');
  slam('S11-l', t, C.daneism + .1, { from: 1.8 });
  slam('S11-fut', t, C.mellon, { from: 2.2 }); slam('S11-od', t, C.odyn + .4, { from: 1.8 });
  put('S11-storm', { dy: Math.sin(t * 1.4) * 10 });
};
F.S12 = t => {
  cam('S12-cam', t, [[60.45, 960, 540, 1.05], [67.7, 960, 540, 1]]);
  [[0, C.gal], [1, C.vret], [2, C.ipa]].forEach(([i, t0]) => { drop(['S12-fr', 'S12-uk', 'S12-us'][i], t, t0 - .3); slam('S12-n' + i, t, t0 + .1, { from: 1.8 }); popIn('S12-f' + i, t, t0 + .05, { rot: -10 }); });
  ['s12f', 's12u', 's12s'].forEach((id, i) => { idle(id, t, i * .5); expr(id, blinkAt(t, [63.2 + i * .4, 66 + i * .3]) ? 'blink' : 'happy'); });
  slam('S12-st', t, C.enekr, { from: 3, rot: -12, dur: .35 }); slam('S12-ar', t, C.pros - .1, { from: 1.8 });
};
F.S13 = t => {
  [[0, C.lires, 12000000], [1, C.fragka, 300000000], [2, C.dolaria, 50000000]].forEach(([i, t0, v]) => {
    const p = P(t, t0 - .45, t0 - .1); put('S13-b' + i, { dy: -900 * (1 - eIn(p)), o: t < t0 - .45 ? 0 : 1, sy: t > t0 - .1 ? 1 - .12 * Math.exp(-8 * (t - t0 + .1)) * Math.cos(20 * (t - t0)) : 1 });
    popIn('S13-fl' + i, t, t0, { rot: 8 }); count('S13-v' + i, t, t0, .6, v); op('S13-v' + i, t > t0 ? 1 : 0); slam('S13-n' + i, t, t0 + .2, { from: 1.6 });
  });
};
F.S14 = t => {
  cam('S14-cam', t, [[76.12, 960, 540, 1], [83.3, 960, 540, 1.05]]);
  const ghost = P(t, C.theor, C.theor + .8);
  [0, 1, 2].forEach(i => { put('S14-b' + i, { dy: -30 * ghost + Math.sin(t * 2.4 + i) * 10 * ghost, o: 1 - .72 * ghost }); B('S14-b' + i).e.setAttribute('stroke-dasharray', ghost > .5 ? '12 10' : ''); });
  slam('S14-l', t, C.theor, { from: 2.2, rot: 6 }); popIn('S14-gr', t, 76.2);
  slam('S14-grl', t, 76.4);
  op('S14-arr', t > C.ektam - .4 ? clamp((t - C.ektam + .4) / .3) : 0);
  slam('S14-x', t, C.dothik, { from: 2.6, rot: 30 }); slam('S14-l2', t, C.dothik + .15, { from: 1.8 });
};
F.S15 = t => {
  cam('S15-cam', t, [[83.32, 900, 540, 1], [92.8, 960, 540, 1.04]]);
  fadeIn('S15-cover', t, C.kalymma - .2, .5); $('S15-cover').setAttribute('transform', `translate(0,${Math.sin(t * 2) * 8})`);
  slam('S15-kl', t, C.kalymma, { from: 2 });
  const press = Math.max(0, Math.sin((t - C.ekdosi) * 7)); $('pressPlate').setAttribute('transform', t > C.ekdosi ? `translate(0,${press * 70})` : '');
  for (let i = 0; i < 8; i++) { const t0 = C.ekdosi + .4 + i * .55, k = (t - t0) / 1.6; if (k < 0 || k > 1) { op('S15-n' + i, 0); continue; }
    put('S15-n' + i, { x: lerp(760, 1500, eIO(k)), y: lerp(820, 700, eIO(k)) - Math.sin(k * Math.PI) * 220, r: lerp(0, 20, k) + Math.sin(k * 9) * 8, o: 1, s: lerp(.8, .6, k) }); }
  slam('S15-l', t, C.xartonom, { from: 1.8 });
  idle('s15v', t, 0); expr('s15v', 'happy');
  if (t > C.polem25) { popIn('S15-war', t, C.polem25); put('S15-V', { dx: -260 * eOut(P(t, C.polem25, C.polem25 + .4)) }); put('S15-war', { dx: 160, o: 1, s: eBack(P(t, C.polem25, C.polem25 + .4)) }); } else op('S15-war', 0);
  ['s15s1', 's15s2'].forEach((id, i) => idle(id, t, i));
  slam('S15-l2', t, C.polem25 + .1, { from: 1.8 });
};
F.S16 = t => {
  cam('S16-cam', t, [[92.8, 985, 540, 1.04], [100.45, 960, 540, 1]]);
  popIn('S16-gold', t, C.xrys - .1); popIn('S16-fx', t, C.synal - .1);
  slam('S16-g', t, C.xrys); slam('S16-f', t, C.synal); slam('S16-l', t, C.apoth, { from: 2 });
  $('vaultWheel').setAttribute('transform', `rotate(${t * 40},0,-150)`);
  slam('S16-lock', t, C.elegx - .1, { from: 2.6, rot: -12 });
  idle('s16v', t, 0);
  const reach = eOut(P(t, C.elegx - .8, C.elegx - .1)), back = eOut(P(t, C.elegx + .1, C.elegx + .5));
  put('S16-V', { dx: 340 * reach - 200 * back }); expr('s16v', t > C.elegx ? 'shock' : 'neutral');
  slam('S16-x', t, C.elegx + .2, { from: 1.8 });
};
F.S17 = t => {
  waves('S17', t);
  const T0 = 100.45;
  cam('S17-cam', t, [[T0, 1000, 480, 1.0], [C.maked - .3, 930, 260, 1.5], [C.maked + 1.8, 930, 260, 1.5], [C.oukr - .3, 1500, -170, .48], [C.krim + .8, 1550, -170, .48], [C.mikra34 - .3, 1250, 470, .9], [114.5, 1250, 470, .95]]);
  draw('S17-mf2', t, C.maked, 1.6);
  slam('S17-l1', t, C.maked + .2, { from: 2 });
  if (t > C.oukr - .6) op('S17-l1', 1 - P(t, C.oukr - .6, C.oukr - .3));
  op('S17-r1', t > C.oukr - .9 ? 1 : 0); $('S17-r1').setAttribute('stroke-dashoffset', -t * 60);
  op('S17-r2', t > C.krim - .4 ? 1 : 0); $('S17-r2').setAttribute('stroke-dashoffset', -t * 60);
  op('S17-r3', t > C.mikra34 - .4 ? 1 : 0); $('S17-r3').setAttribute('stroke-dashoffset', -t * 60);
  const pd = (id, t0) => { const p = P(t, t0, t0 + .5); put(id, { dy: -400 * (1 - bounce(p)), o: t < t0 ? 0 : 1, s: 2.2 }); };
  pd('S17-pO', C.oukr - .2); pd('S17-pS', C.krim - .2); pd('S17-pM', C.mikra34 - .1);
  slam('S17-l2', t, C.oukr, { from: 2 }); slam('S17-l3', t, C.krim, { from: 2 }); slam('S17-l4', t, C.mikra34 + .1, { from: 2 });
  const fly = (id, t0, from, to) => { const k = P(t, t0, t0 + 1.2); if (t < t0 || k >= 1) { op(id, 0); return; } put(id, { x: lerp(from[0], to[0], eIO(k)), y: lerp(from[1], to[1], eIO(k)) - Math.sin(k * Math.PI) * 160, r: Math.sin(k * 12) * 14, o: 1, s: 1.3 }); };
  fly('S17-n1', C.maked - .4, PP.athens, PP.thess); fly('S17-n2', C.oukr - .6, PP.thess, PP.odessa); fly('S17-n3', C.mikra34 - .3, PP.athens, PP.smyrna);
  put('S17-hud', { r: Math.sin(t * 3) * 4 }); slam('S17-hudt', t, C.ellada30 + .4, { from: 1.6 });
};
F.S18 = t => {
  const t0 = 114.55;
  const tilt = t < C.isorr ? Math.sin((t - t0) * 3) * 4 : (t < C.fanoun ? Math.sin((t - t0) * 6) * 9 * P(t, C.isorr, C.fanoun) + Math.sin((t - t0) * 3) * 4 : lerp(0, 22, eBack(P(t, C.fanoun, C.fanoun + .5), 3)));
  $('beam').setAttribute('transform', `rotate(${tilt},0,-300)`);
  ['panL', 'panR'].forEach(id => { const g = $(id); g.setAttribute('transform', g.getAttribute('transform').replace(/ rotate\([^)]*\)/, '') + ` rotate(${-tilt})`); });
  slam('S18-l', t, t0 + .1, { from: 1.8 }); slam('S18-q', t, C.fanoun - .4, { from: 2, rot: 6 });
};
F.S19 = t => {
  cam('S19-cam', t, [[120.32, 960, 540, 1], [C.anelav, 960, 540, 1.04], [C.kon - .4, 960, 500, 1.08], [135.8, 960, 520, 1.12]]);
  slam('S19-y', t, C.y1920 - .2, { from: 2.6, rot: -8 }); popIn('S19-box', t, 120.4);
  idle('s19v', t, 0); expr('s19v', t > C.exase + .2 ? 'sad' : 'neutral'); slam('S19-res', t, C.exase + .1, { from: 2, rot: -5 });
  put('S19-V', { dy: t > C.exase + .2 ? 18 * eOut(P(t, C.exase + .2, C.exase + .6)) : 0, sy: t > C.exase + .2 ? 1 - .06 * eOut(P(t, C.exase + .2, C.exase + .6)) : 1 });
  drop('S19-r1', t, C.anelav - .3); drop('S19-r2', t, C.anelav - .05); idle('s19a', t, .2); idle('s19b', t, .8);
  slam('S19-fv', t, C.anelav + .2, { from: 1.8 });
  if (t > C.epanaf - .2) { put('S19-box', { dx: 0, o: 1 - P(t, C.epanaf - .2, C.epanaf + .1) }); drop('S19-K', t, C.epanaf); idle('s19k', t, 0); expr('s19k', 'happy'); popIn('S19-crown', t, C.epanaf + .4); }
  else op('S19-K', 0);
  if (t > C.kon) put('S19-crown', { dy: Math.sin(t * 4) * 8 });
  const gone = P(t, C.anepith - .4, C.anepith - .1); if (gone > 0) { op('S19-V', 1 - gone); op('S19-r1', 1 - gone); op('S19-r2', 1 - gone); op('S19-res', 1 - gone); op('S19-fv', 1 - gone); }
  [['S19-fr', 's19f'], ['S19-uk', 's19u']].forEach(([g, id], i) => { drop(g, t, C.anepith - .2 + i * .15); idle(id, t, .3); expr(id, 'angry'); });
  slam('S19-an', t, C.anepith + .1, { from: 1.8 });
};
F.S20 = t => {
  cam('S20-cam', t, [[135.8, 960, 540, 1.04], [147.8, 960, 540, 1]]);
  ['s20f', 's20u'].forEach((id, i) => { idle(id, t, i * .5); expr(id, 'angry'); });
  slam('S20-l', t, C.antip, { from: 2.2, rot: -4 });
  const pull = eIn(P(t, C.aposyr, C.aposyr + 1));
  [0, 1, 2].forEach(i => put('S20-gb' + i, { dx: (i - 1) * 300 * pull + (i === 1 ? 0 : 0), dy: -700 * pull + Math.sin(t * 2 + i) * 8, r: (i - 1) * 20 * pull }));
  const hollow = P(t, C.xoris40 - .4, C.xoris40 + .5);
  for (let i = 0; i < 6; i++) { const k = Math.max(0, t - C.aposyr - .6 - i * .12); put('S20-n' + i, { dy: k > 0 ? Math.sin(k * 3 + i) * 14 + k * 8 : 0, r: k > 0 ? Math.sin(k * 2 + i) * 10 : 0, o: 1 - .55 * hollow }); }
  slam('S20-l2', t, C.xoris40, { from: 2.4, rot: 5 });
};
F.S21 = t => {
  cam('S21-cam', t, [[147.8, 960, 520, 1.06], [154.8, 960, 540, 1]]);
  slam('S21-y', t, C.y1918, { from: 2.6, rot: -8 }); slam('S21-t', t, C.y1918 + .3, { from: 1.6 });
  for (let i = 0; i < 4; i++) { $('S21-i' + i).setAttribute('width', 200 * eOut(P(t, C.y1918 + .6 + i * .3, C.y1918 + 1 + i * .3)) * (0.6 + (i % 2) * .2)); $('S21-e' + i).setAttribute('width', 260 * eOut(P(t, C.y1918 + .8 + i * .3, C.y1918 + 1.3 + i * .3)) * (1 + i * .05)); }
  slam('S21-m', t, C.pathit, { from: 2.6, rot: -10 }); slam('S21-l', t, C.pathit + .1, { from: 2 });
};
F.S22 = t => {
  waves('S22', t);
  cam('S22-cam', t, [[154.8, 1500, 560, .62], [161.4, 1900, 520, .66]]);
  draw('S22-adv', t, C.mikra44 - .2, 3.2, eIO); op('S22-adv2', t > C.mikra44 + 2.4 ? 1 : 0);
  slam('S22-l', t, C.mikra44, { from: 1.8 }); slam('S22-l2', t, C.sklir, { from: 1.8, rot: 4 });
  const pts = [[2280, 530], [2520, 560], [2700, 470], [2850, 430]];
  for (let i = 0; i < 4; i++) { put('S22-bx' + i, { x: pts[i][0], y: pts[i][1] }); popIn('S22-bx' + i, t, C.sklir + .1 + i * .3, { s: 1.6, x: pts[i][0], y: pts[i][1] }); if (t > C.sklir + .5 + i * .3) put('S22-bx' + i, { x: pts[i][0], y: pts[i][1], s: 1.6 + Math.sin(t * 12 + i) * .06, r: Math.sin(t * 9 + i) * 6 }); }
  popIn('S22-drain', t, C.dapan44 - .2); if (t > C.dapan44) put('S22-drain', { s: 1 - .4 * eOut(P(t, C.dapan44, 161.4)), r: Math.sin(t * 10) * 5, o: 1 });
};
F.S23 = t => {
  cam('S23-cam', t, [[161.45, 960, 540, 1], [C.adiex, 1000, 540, 1.05], [171.9, 900, 540, 1.08]]);
  slam('S23-y', t, C.y1922 - .1, { from: 2.6, rot: -8 });
  const run = eIn(P(t, 162.2, C.adiex)); put('S23-M', { dx: 560 * run, dy: -Math.abs(Math.sin(q15(t) * 14)) * 22 * (run > 0 && run < 1 ? 1 : 0) });
  idle('s23m', t, 0); expr('s23m', t > C.adiex ? (t > C.aprosm ? 'happy' : 'shock') : 'neutral');
  if (t > C.adiex) { const k = t - C.adiex; put('S23-M', { dx: 560 - 120 * eOut(clamp(k / .35)), r: -8 * Math.exp(-4 * k) * Math.cos(12 * k) }); }
  slam('S23-ad', t, C.adiex, { from: 2.6, rot: 8 });
  if (t > C.adiex && t < C.aprosm) { put('S23-stars', { x: 1080 + Math.cos(t * 6) * 10, y: 400, r: t * 220, o: 1 }); } else op('S23-stars', 0);
  popIn('S23-bulb', t, C.aprosm - .15, { x: 960, y: 330, s: 1.4 }); slam('S23-ap', t, C.aprosm, { from: 2 });
  put('S23-tag', { dx: 560 * run - (t > C.adiex ? 120 * eOut(clamp((t - C.adiex) / .35)) : 0) });
};
F.S24 = t => {
  waves('S24', t); cam('S24-cam', t, [[171.95, 1900, 520, .66], [176.45, 2050, 520, .74]]);
  slam('S24-l', t, C.liges + .1, { from: 1.8 });
  op('S24-cr', t > C.katarr ? (Math.floor(t * 8) % 2 ? 1 : .4) : 0);
  $('S24-hand').setAttribute('transform', `rotate(${t * 360 / 2})`); put('S24-clock', { s: 1 + Math.max(0, Math.sin(t * 2 * Math.PI)) * .05 });
};
F.S25 = t => {
  cam('S25-cam', t, [[176.45, 960, 540, 1], [183.25, 960, 540, 1.08]]);
  popIn('S25-note', t, 176.5, { rot: -6 });
  slam('S25-st0', t, C.anagk - .05, { from: 2.4, rot: -6 });
  const sc = P(t, C.dixot - .7, C.dixot + .25);
  if (t > C.dixot - .9) { op('S25-sc', 1); const snip = Math.abs(Math.sin((t - C.dixot) * 18)) * 18; put('S25-sc', { y: lerp(260, 860, eIO(sc)), r: 90 }); $('bladeA').setAttribute('transform', `rotate(${-snip})`); $('bladeB').setAttribute('transform', `rotate(${snip})`); } else op('S25-sc', 0);
  op('S25-cut', t > C.dixot - .7 && t < C.dixot + .3 ? 1 : 0);
  const split = eOut(P(t, C.dixot + .25, C.dixot + .8));
  $('S25-L').setAttribute('transform', `translate(${-90 * split},0) rotate(${-6 * split})`); $('S25-R').setAttribute('transform', `translate(${90 * split},0) rotate(${6 * split})`);
  slam('S25-dx', t, C.dixot, { from: 2.6, rot: 6 });
};
F.S26 = t => {
  cam('S26-cam', t, [[183.25, 960, 540, 1], [192.95, 960, 540, 1.04]]);
  slam('S26-ar', t, C.aristero, { from: 1.8 }); slam('S26-de', t, C.dexio, { from: 1.8 });
  // left half travels between citizens
  const lp = P(t, C.aristero + .4, C.aristero + 4.5); const lx = lerp(760, 340, eIO(lp)), ly = 520 + Math.sin(lp * Math.PI * 3) * -60;
  put('S26-L', { x: lx, y: ly, r: Math.sin(t * 2) * 6 });
  slam('S26-50', t, C.pente, { from: 2.6, rot: -8 }); slam('S26-kyk', t, C.pente + .3, { from: 1.6 });
  ['s26c1', 's26c2'].forEach((id, i) => { idle(id, t, i * .6); expr(id, t > C.pente ? 'happy' : 'neutral'); });
  // right half → state, bond back
  const rp = P(t, C.dexio + .1, C.dexio + 1.2); put('S26-R', { x: lerp(1160, 1640, eIO(rp)), y: lerp(520, 640, eIO(rp)), s: lerp(1, .5, rp), o: 1 - P(t, C.dexio + 1.0, C.dexio + 1.3) });
  idle('s26m', t, 0);
  popIn('S26-bond', t, C.omol - .1, { rot: 10 }); slam('S26-om', t, C.omol + .1, { from: 1.8 });
  if (t > C.omol + .4) put('S26-bond', { dy: Math.sin(t * 2) * 8, r: Math.sin(t * 1.5) * 4 });
};
F.S27 = t => {
  cam('S27-cam', t, [[192.95, 960, 540, 1.05], [204.1, 960, 540, 1]]);
  popIn('S27-wr', t, C.epityx - .2, { rot: -20 }); slam('S27-ep', t, C.epityx, { from: 2.2 });
  if (t > C.epityx + .4) put('S27-wr', { r: Math.sin(t * 1.5) * 3, s: 1 + Math.sin(t * 3) * .02 });
  count('S27-num', t, C.dis - .2, .6, 1200000000); op('S27-num', t > C.dis - .3 ? 1 : 0); slam('S27-dr', t, C.dis + 1.4, { from: 1.8 });
  popIn('S27-rep', t, C.peir, { rot: -90 }); if (t > C.peir + .4) put('S27-rep', { r: (t - C.peir) * -200 });
  slam('S27-y', t, C.y1926, { from: 2.6, rot: -8 });
};
F.S28 = t => {
  waves('S28', t); cam('S28-cam', t, [[204.15, 2050, 520, .74], [C.mikras, 1950, 520, .8], [216, 1900, 520, .9]]);
  slam('S28-q', t, C.elig, { from: 1.8 });
  // the "money patch" tries to hold the front, then falls
  const np = P(t, C.elig + .3, C.proll); put('S28-note', { o: t > C.elig + .2 ? 1 - P(t, C.mikras + .3, C.mikras + .8) : 0, dy: t > C.mikras ? 300 * eIn(P(t, C.mikras, C.mikras + .8)) : 0, r: Math.sin(t * 8) * 6 * np, s: 1 });
  const ret = P(t, C.proll, C.mikras + .3); $('S28-adv').setAttribute('stroke-dashoffset', 1000 * eIO(ret) * .92); op('S28-ret', t > C.proll ? 1 : 0); $('S28-ret').setAttribute('stroke-dashoffset', -t * 80);
  if (t > C.mikras) { op('S28-smoke', 1); popIn('S28-fire', t, C.mikras, { s: 1.4 }); for (let i = 0; i < 5; i++) { const k = ((t - C.mikras) * .5 + i * .2) % 1; const c = $('S28-sm' + i); c.setAttribute('cy', PP.smyrna[1] - 40 - k * 260); c.setAttribute('cx', PP.smyrna[0] + Math.sin(k * 6 + i) * 30 + k * 60); c.setAttribute('r', 22 + k * 50); c.setAttribute('opacity', 1 - k); } } else { op('S28-smoke', 0); op('S28-fire', 0); }
  op('S28-dark', .55 * P(t, C.mikras, C.mikras + 1));
  slam('S28-l', t, C.mikras + .1, { from: 2.2, rot: -4 }); slam('S28-y', t, C.mikras + .5, { from: 2.4, rot: 6 });
  op('S28-black', P(t, C.end + .6, C.end + 2.0));
};

