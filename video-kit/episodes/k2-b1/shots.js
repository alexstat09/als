// Κεφ.2 Β.1 — per-shot animation (browser, after engine/runtime.js). seek(t) is PURE.
// ⚠️ No literal seconds: everything is a cue (C.*) or a shot bound (SH.Sx.a / .b), so a new voice re-times it all.
const SH = {}; D.shots.forEach(s => { SH[s.id] = s; });
const bob = (t, f = 2, a = 8, ph = 0) => Math.sin(t * f + ph) * a;
const twinkle = (p, t) => { for (let i = 0; i < 34; i++) { const e = $('' + p + '-st' + i); if (e) e.setAttribute('opacity', .45 + .55 * Math.abs(Math.sin(t * (1.3 + (i % 5) * .4) + i))); } };
const trioIdle = (p, t, ex) => ['en', 'fr', 'ru'].forEach((k, i) => { idle(p.toLowerCase() + k, t, i * .4); if (ex) expr(p.toLowerCase() + k, ex(i)); });
const tags = (p, t, t0) => [0, 1, 2].forEach(i => popIn(p + '-tg' + i, t, t0 + i * .1));
// a beat that hides a label once the next one arrives
const fadeOut = (id, t, t0, d = .25) => { if (t > t0) put(id, { o: 1 - P(t, t0, t0 + d) }); };

// screen shakes & flashes (time, amplitude, duration)
[[C.t3, 8], [C.rev, 10], [C.kat + .25, 14], [C.diaf, 14], [C.yper, 12], [C.dynat, 8], [C.anatr, 12], [C.perior + .2, 14], [C.apod + .45, 8],
 [C.epiv + .5, 8], [C.katox, 6], [C.katox + .2, 6], [C.katox + .4, 6], [C.katox + .6, 6], [C.doul, 10], [C.afth + .3, 18, .5], [C.adyn, 10],
 [C.empod + .25, 16], [C.isxy, 10], [C.prosyp + .6, 10], [C.protop, 8], [C.denyp, 10], [C.synain, 8], [C.neous + .2, 10], [C.omos49, 22, .5],
 [C.rizose, 8], [C.arkouse, 12], [C.simer, 8]].forEach(a => shk(...a));
[C.t3, C.kat + .25, C.afth + .3, C.omos49].forEach(t => fl(t, .4));

F.S1 = t => {
  const { a, b } = SH.S1; twinkle('S1', t);
  cam('S1-cam', t, [[a, 960, 600, 1.12], [C.t2, 960, 560, 1.02], [b, 960, 540, 1.06]]);
  slide('S1-pal', t, a, .9, 0, 260);
  slam('S1-a', t, C.t1 + .15, { from: 2.4, rot: -5 }); slam('S1-b', t, C.y1844, { from: 2, rot: 4 });
  fadeOut('S1-a', t, C.t2 - .3); fadeOut('S1-b', t, C.t2 - .3);
  slam('S1-t1', t, C.t2, { from: 2.6, rot: -8 }); slam('S1-t2', t, C.t3, { from: 2.2, rot: 4 });
  op('S1-glow', .9 * eOut(P(t, C.t3, C.t3 + 1.2)));
};
F.S2 = t => {
  const { a, b } = SH.S2; twinkle('S2', t);
  cam('S2-cam', t, [[a, 900, 560, 1.08], [C.edr - .35, 960, 540, 1], [C.edr + .3, 2700, 540, 1], [b, 2700, 520, 1.06]]);
  for (let i = 0; i < 7; i++) {
    const t0 = C.rev - .5 + i * .12, from = i < 3 ? -900 : 900;
    slide('S2-c' + i, t, t0, .7, from, 0);
    if (t > t0 + .7) put('S2-c' + i, { dy: -Math.abs(Math.sin(q15(t) * 6 + i)) * 10, o: 1 });
    idle('s2c' + i, t, i * .3, 1.4); expr('s2c' + i, 'angry');
  }
  slam('S2-d', t, C.sept - .1, { from: 2.4, rot: -6 }); slam('S2-l', t, C.rev, { from: 2.2, rot: 4 }); fadeOut('S2-l', t, C.edr - .35); fadeOut('S2-d', t, C.edr - .35);
  // the spark falls into the flask on «καταλυτικά»; it foams and boils
  const sp = P(t, C.kat - .45, C.kat + .05); put('S2-sp', { dy: 380 * eIn(sp), r: t * 300, o: t > C.kat - .45 && t < C.kat + .1 ? 1 : 0 });
  const boil = P(t, C.kat, C.kat + .6), lv = -110 - 260 * eOut(boil);
  $('S2f-liq').setAttribute('y', lv); $('S2f-liq').setAttribute('height', 140 + 260 * eOut(boil));
  for (let i = 0; i < 5; i++) { const k = ((t - C.kat) * (1.2 + i * .25) + i * .2) % 1; $('S2f-b' + i).setAttribute('cy', t < C.kat ? -30 : 0 - k * 380); $('S2f-b' + i).setAttribute('opacity', t < C.kat ? .2 : .85 * (1 - k)); }
  popIn('S2-foam', t, C.kat + .4, { rot: -6 }); if (t > C.kat + .8) put('S2-foam', { s: 1 + .06 * Math.sin(t * 8), o: 1 });
  put('S2-fl', { r: t > C.kat ? Math.sin(q15(t) * 30) * 1.5 * (1 - P(t, C.kat + 1.5, C.kat + 2.5)) : 0 });
  slam('S2-fl2', t, C.edr + .25, { from: 1.8 }); slam('S2-fl3', t, C.edr + .4, { from: 1.8 }); slam('S2-l2', t, C.kat, { from: 2.6, rot: -6 });
};
F.S3 = t => {
  const { a, b } = SH.S3;
  cam('S3-cam', t, [[a, 960, 560, 1.06], [C.megal - .2, 960, 520, 1.02], [b, 960, 500, 1.1]]);
  ['en', 'fr', 'ru'].forEach((k, i) => drop('S3-' + k, t, a + .05 + i * .12, { h: 700 }));
  trioIdle('S3', t, i => blinkAt(t, [a + 1 + i * .4]) ? 'blink' : (t > C.megal ? 'happy' : 'neutral')); tags('S3', t, a + .3);
  for (let i = 0; i < 3; i++) { popIn('S3-b' + i, t, C.idl - .2 + i * .15, { rot: i % 2 ? 6 : -6 }); if (t > C.idl + .5) put('S3-b' + i, { dy: bob(t, 2, 5, i), o: 1 }); }
  $('S3-gb').setAttribute('stdDeviation', 16 * (1 - eOut(P(t, C.megal - .15, C.megal + .4))));
  popIn('S3-foc', t, C.megal - .15, { s: 1.3 }); if (t > C.megal + .25) put('S3-foc', { s: 1 + .03 * Math.sin(t * 6), o: 1 - P(t, C.megal + 1.4, C.megal + 1.8) });
  slam('S3-l', t, C.idl - .1, { from: 2.2, rot: -4 }); slam('S3-l2', t, C.megal, { from: 2, rot: 3 });
};
F.S4 = t => {
  const { a, b } = SH.S4;
  cam('S4-cam', t, [[a, 960, 560, 1.12], [C.energ, 960, 540, 1.02], [b, 960, 520, 1.06]]);
  [['en', -900], ['fr', 0], ['ru', 900]].forEach(([k, fx], i) => { if (fx) slide('S4-' + k, t, a + .1 + i * .1, .9, fx, 0); else drop('S4-' + k, t, a + .3, { h: 600 }); idle('s4' + k, t, i * .4); expr('s4' + k, t > C.energ ? 'happy' : 'neutral'); });
  for (let i = 0; i < 3; i++) $('S4-k' + i).setAttribute('opacity', t < C.energ - .1 + i * .08 ? 0 : (Math.floor((t - C.energ) * 20) % 7 === 0 && t < C.energ + .5 ? .1 : .38));
  slam('S4-sign', t, a + .2, { from: 1.6 }); slam('S4-l', t, C.energ, { from: 2.2, rot: -4 });
};
F.S5 = t => {
  const { a, b } = SH.S5;
  cam('S5-cam', t, [[a, 960, 600, 1.12], [C.diaf - .3, 960, 560, 1.02], [b, 960, 540, 1.06]]);
  ['en', 'fr', 'ru'].forEach((k, i) => { idle('s5' + k, t, i * .5, t > C.diaf ? 1.6 : 1); expr('s5' + k, t > C.diaf ? 'angry' : (t > C.syz ? 'neutral' : 'happy')); headTilt('s5' + k, t > C.diaf ? [8, -8, 0][i] : 0); });
  popIn('S5-sc', t, a + .2);
  for (let i = 0; i < 3; i++) { popIn('S5-bb' + i, t, C.syz + i * .3, { rot: i === 1 ? 6 : -6 }); if (t > C.syz + .9) put('S5-bb' + i, { dy: bob(t, 6, 5, i), o: 1 }); }
  for (let i = 0; i < 2; i++) { if (t < C.diaf) { op('S5-z' + i, 0); continue; } put('S5-z' + i, { o: Math.floor((t - C.diaf) * 12) % 3 ? 1 : .2, s: 1 + .1 * Math.sin(t * 30), r: i ? 20 : -20 }); }
  popIn('S5-neq', t, C.diaf + .1, { rot: 20 });
  slam('S5-l', t, C.syz - .1, { from: 2, rot: -4 }); slam('S5-d', t, C.diaf, { from: 2.4, rot: 6 });
};
F.S6 = t => {
  const { a, b } = SH.S6;
  cam('S6-cam', t, [[a, 960, 560, 1.08], [C.yper, 960, 540, 1], [b, 960, 530, 1.03]]);
  const up = t > C.tax - .05;
  ['en', 'fr', 'ru'].forEach((k, i) => { op('S6-' + k, up ? 0 : 1); op('S6-' + k + 'U', up ? 1 : 0); idle('s6' + k, t, i * .4); idle('s6' + k + 'u', t, i * .4, 1.5); if (up) put('S6-' + k + 'U', { dy: -Math.abs(Math.sin(q15(t) * 8 + i)) * 14, o: 1 }); });
  tags('S6', t, a + .2);
  popIn('S6-sc', t, a + .15); slam('S6-st', t, C.yper, { from: 3, rot: -12 });
  slam('S6-l', t, C.tria - .1, { from: 2.2, rot: -4 });
};
F.S7 = t => {
  const { a, b } = SH.S7;
  cam('S7-cam', t, [[a, 800, 560, 1.12], [C.psif, 1000, 540, 1.02], [b, 1080, 540, 1.04]]);
  idle('s7ru', t, 0); expr('s7ru', t > C.monad + .2 ? 'happy' : (blinkAt(t, [a + .8]) ? 'blink' : 'neutral'));
  slide('S7-ru', t, a, .5, -600, 0); slam('S7-dl', t, a + .3, { from: 1.6 });
  const into = P(t, C.monad - .25, C.monad + .15);
  popIn('S7-key', t, C.psif - .1, { rot: -30 });
  if (t > C.psif + .3) put('S7-key', { x: lerp(980, 1500, eIO(into)), y: lerp(600 + bob(t, 2.4, 6), 594, eIO(into)), r: into * 0, o: 1 });
  if (t < C.psif - .1) op('S7-kl', 0); else put('S7-kl', { x: lerp(1060, 1590, eIO(into)), y: lerp(520, 520, into), o: 1 - P(t, C.monad + .3, C.monad + .6) });
  const open = eOut(P(t, C.monad + .15, C.monad + .6));
  put('S7-door', { sx: 1 - .75 * open, o: 1 }); op('S7-light', .9 * open);
  slam('S7-l', t, C.ros - .1, { from: 2.2, rot: -4 }); slam('S7-l2', t, C.monad, { from: 2.6, rot: 5 });
};
F.S8 = t => {
  const { a, b } = SH.S8;
  cam('S8-cam', t, [[a, 960, 600, 1.12], [C.anatr, 960, 560, 1.02], [b, 960, 540, 1.06]]);
  const push = Math.max(0, Math.sin(q15(t) * 9));
  [['en', 1], ['ru', 1], ['fr', -1]].forEach(([k, s], i) => { put('S8-' + k, { dx: s * push * 16, r: s * 12, o: 1 }); idle('s8' + k, t, i * .3); expr('s8' + k, 'strain'); });
  idle('s8ot', t, 0, .6); expr('s8ot', blinkAt(t, [a + 1.2]) ? 'blink' : 'happy');
  put('S8-thr', { dx: Math.sin(q15(t) * 40) * 1.2 }); put('S8-ot', { dx: Math.sin(q15(t) * 40) * 1.2 });
  for (let i = 0; i < 2; i++) slam('S8-bo' + i, t, C.dynat + i * .15, { from: 3 });
  slam('S8-l', t, C.dynat - .1, { from: 2, rot: -4 }); slam('S8-l2', t, C.anatr, { from: 2.4, rot: 4 }); slam('S8-on', t, C.anatr + .3, { from: 1.8 });
};
F.S9 = t => {
  const { a, b } = SH.S9;
  cam('S9-cam', t, [[a, 960, 560, 1.04], [C.perior - .2, 960, 560, 1], [C.perior + .6, 960, 560, 1.08], [b, 960, 550, 1.1]]);
  const shrink = eBack(P(t, C.perior, C.perior + .55), 1.4);
  put('S9-rays', { s: lerp(1, .5, shrink) * (1 + .03 * Math.sin(t * 3)), r: t * 6, o: 1 });
  idle('s9ot', t, 0); expr('s9ot', t > C.perior + .1 ? 'shock' : 'happy');
  popIn('S9-tg', t, C.zit - .2, { rot: 20 }); slam('S9-zl', t, C.zit, { from: 1.8 });
  const dropF = P(t, C.perior - .25, C.perior + .1); put('S9-fr', { dy: -700 * (1 - bounce(dropF)), o: t > C.perior - .25 ? 1 : 0 });
  slam('S9-ex', t, a + .5, { from: 1.6 }); fadeOut('S9-ex', t, C.perior);
  slam('S9-l', t, C.perior, { from: 2.4, rot: -4 }); slam('S9-l2', t, C.exous10 - .1, { from: 1.8 });
};
F.S10 = t => {
  const { a, b } = SH.S10;
  cam('S10-cam', t, [[a, 760, 560, 1.06], [C.apod - .3, 820, 540, 1.02], [C.apod + .3, 1060, 540, 1], [b, 1100, 540, 1.04]]);
  for (let i = 0; i < 3; i++) { const t0 = C.dyn - .2 + i * .18, p = eBack(P(t, t0, t0 + .5), 1.8); put('S10-f' + i, { dy: 600 * (1 - p) + bob(t, 2, 4, i), r: Math.sin(t * 3 + i) * 2, o: t > t0 ? 1 : 0 }); $('S10-e' + i).setAttribute('opacity', t > t0 + .3 ? .5 + .5 * Math.abs(Math.sin(t * 7 + i)) : 0); }
  popIn('S10-doc', t, C.apod - .3); popIn('S10-mg', t, C.apod, { rot: -20 }); if (t > C.apod + .4) put('S10-mg', { dx: Math.sin(t * 2.2) * 60, dy: Math.cos(t * 2.2) * 30, o: 1 });
  slam('S10-st', t, C.apod + .45, { from: 3, rot: -10 });
  slam('S10-l', t, C.dyn - .1, { from: 2.2, rot: -4 }); slam('S10-l2', t, C.dyn + .4, { from: 1.8 });
};
F.S11 = t => {
  const { a, b } = SH.S11;
  cam('S11-cam', t, [[a, 960, 600, 1.15], [C.diith - .2, 960, 560, 1.04], [C.ethn, 960, 540, 1], [b, 960, 530, 1.03]]);
  const conduct = t > C.diith - .1, beat = Math.sin(q15(t) * 7);
  ['en', 'fr', 'ru'].forEach((k, i) => { drop('S11-' + k, t, a + .1 + i * .12, { h: 600 }); idle('s11' + k, t, i * .3, conduct ? 1.6 : 1); });
  for (let i = 0; i < 3; i++) { const bt = $('S11-bt' + i); if (t < a + .5) op('S11-bt' + i, 0); else put('S11-bt' + i, { r: conduct ? beat * 35 : 0, o: 1 }); }
  ['S11-tA', 'S11-tB'].forEach((id, j) => $(id).setAttribute('transform', `translate(0,${conduct ? -Math.abs(beat) * (6 + j * 4) : 0})`));
  slam('S11-l', t, C.treis - .1, { from: 2.2, rot: -4 }); slam('S11-l2', t, C.diith, { from: 1.8 }); slam('S11-y', t, C.y1843 - .1, { from: 2.6, rot: -6 });
};
F.S12 = t => {
  const { a, b } = SH.S12;
  cam('S12-cam', t, [[a, 960, 620, 1.1], [C.akr - .2, 960, 580, 1], [b, 960, 560, 1.04]]);
  // they drift toward an edge, see the drop, step back to the middle
  const wob = Math.sin((t - a) * 1.6) * 60 * (1 - P(t, C.akr + .3, C.akr + 1.2));
  ['en', 'fr', 'ru'].forEach((k, i) => { put('S12-' + k, { dx: wob, dy: -Math.abs(Math.sin(q15(t) * 6 + i)) * 8, o: 1 }); idle('s12' + k, t, i * .3); expr('s12' + k, Math.abs(wob) > 40 ? 'shock' : (t > C.akr + .5 ? 'happy' : 'neutral')); });
  slam('S12-sL', t, C.akr - .2, { from: 2, rot: -8 }); slam('S12-sR', t, C.akr, { from: 2, rot: 8 });
  slam('S12-l', t, C.apof - .1, { from: 2.2, rot: -4 }); slam('S12-l2', t, C.akr, { from: 2, rot: 3 });
};
F.S13 = t => {
  const { a, b } = SH.S13;
  cam('S13-cam', t, [[a, 960, 600, 1.08], [C.epiv, 960, 560, 1.02], [b, 960, 540, 1.05]]);
  const calm = t > C.epiv + .5;
  ['S13A', 'S13B', 'S13C'].forEach((p, g) => {
    for (let j = 0; j < 2; j++) { const id = (p + 'r' + j).toLowerCase(); idle(id, t, j + g, calm ? .5 : 2); expr(id, calm ? 'neutral' : 'angry'); put(p + '-r' + j, { dy: calm ? 20 * eOut(P(t, C.epiv + .5, C.epiv + .9)) : -Math.abs(Math.sin(q15(t) * 9 + j + g)) * 16, s: calm ? 1 - .08 * P(t, C.epiv + .5, C.epiv + .9) : 1, o: 1 }); }
    popIn(p + '-b', t, a + .2 + g * .15); if (t > a + .6) put(p + '-b', { dy: bob(t, 9, 4, g), o: 1 - P(t, C.epiv + .4, C.epiv + .7) });
    const lid = (p + ['en', 'fr', 'ru'][g]).toLowerCase(), uid = (p + 'u').toLowerCase(); idle(lid, t, g); idle(uid, t, g);
    op(p + '-L', t > C.epiv ? 0 : 1); op(p + '-U', t > C.epiv ? 1 : 0); expr(uid, 'angry');
  });
  slam('S13-l', t, C.epiv, { from: 2.4, rot: -4 }); slam('S13-l2', t, C.rizo, { from: 1.8 });
};
F.S14 = t => {
  const { a, b } = SH.S14;
  cam('S14-cam', t, [[a, 960, 580, 1.04], [b, 960, 560, 1.0]]);
  popIn('S14-pp', t, a + .05);
  for (let j = 0; j < 5; j++) draw('S14-ln' + j, t, C.koin + .2 + j * .5, .5);
  // the shared quill follows the line being written
  const wj = clamp(Math.floor((t - C.koin - .2) / .5), 0, 4), wp = P(t, C.koin + .2 + wj * .5, C.koin + .7 + wj * .5);
  const qx = t < C.koin + .2 ? 520 : lerp(520, wj % 2 ? 1250 : 1400, wp), qy = 470 + wj * 64 - 40;
  $('S14-hand').setAttribute('transform', `translate(${qx},${qy + Math.sin(q15(t) * 20) * 4}) scale(.62)`);
  op('S14-hand', t > a + .2 ? 1 : 0);
  slam('S14-l', t, C.koin - .1, { from: 2.6, rot: -5 });
};
F.S15 = t => {
  const { a, b } = SH.S15;
  cam('S15-cam', t, [[a, 960, 640, 1.12], [C.katox - .4, 960, 620, 1.08], [C.katox + .2, 960, 540, 1], [b, 960, 530, 1.03]]);
  const hs = eBack(P(t, a + .1, C.symf + .1), 1.3);
  $('S15-hs').setAttribute('transform', `translate(0,${300 * (1 - hs) + (t > C.symf + .1 ? Math.sin(q15(t) * 10) * 6 : 0)})`); op('S15-hs', t > a + .1 ? 1 : 0);
  slam('S15-sy', t, C.symf, { from: 2, rot: -4 }); fadeOut('S15-sy', t, C.katox - .2);
  popIn('S15-pl', t, C.katox - .3, { s: 1 });
  for (let i = 0; i < 4; i++) slam('S15-bo' + i, t, C.katox + i * .2, { from: 3.2, rot: 90 });
  slam('S15-l', t, C.katox + .25, { from: 2.2, rot: -4 });
};
F.S16 = t => {
  const { a, b } = SH.S16;
  const R = [C.isot, C.doul, C.asyl, C.gnom, C.idiok, C.dore];
  const FX = i => 360 + i * 620;
  const keys = [[a, FX(0), 520, 1.3]]; for (let i = 0; i < 6; i++) { keys.push([R[i] - .55, i ? FX(i - 1) : FX(0), 520, 1.3]); keys.push([R[i] - .1, FX(i), 520, 1.3]); } keys.push([b - .8, FX(5), 520, 1.3]); keys.push([b, FX(5) - 40, 520, 1.36]);
  cam('S16-cam', t, keys.sort((x, y) => x[0] - y[0]));
  for (let i = 0; i < 6; i++) { popIn('S16-f' + i, t, R[i] - .35, { rot: i % 2 ? 4 : -4 }); slam('S16-n' + i, t, R[i] + .05, { from: 1.8 }); if (i < 5 && t > R[i + 1] - .55) put('S16-n' + i, { o: 1 - P(t, R[i + 1] - .55, R[i + 1] - .3) }); }
  // slavery: the chain snaps on «δουλείας»
  const br = eOut(P(t, C.doul, C.doul + .4)); put('S16c-L', { dx: -40 * br, r: -14 * br }); put('S16c-R', { dx: 40 * br, r: 14 * br });
  slam('S16-l', t, a + .1, { from: 1.8 });
};
F.S17 = t => {
  const { a, b } = SH.S17;
  cam('S17-cam', t, [[a, 600, 560, 1.04], [C.axies - .3, 620, 540, 1], [C.axies + .5, 2100, 540, 1], [b, 2100, 520, 1.05]]);
  for (let i = 0; i < 5; i++) { idle('s17d' + i, t, i * .3); expr('s17d' + i, t > C.synei + i * .12 ? 'happy' : 'neutral'); popIn('S17-bu' + i, t, C.synei + i * .12, { rot: 10 }); if (t > C.synei + i * .12 + .4) put('S17-bu' + i, { dy: bob(t, 3, 5, i), o: 1 }); }
  idle('s17cz', t, 0, 1.4); expr('s17cz', t > C.afth + .4 ? 'happy' : 'shock');
  popIn('S17-sh', t, C.prost - .2, { rot: -10 });
  const fall = P(t, C.afth - .1, C.afth + .3); const hit = t > C.afth + .3;
  put('S17-stp', { dy: hit ? 510 - 50 * Math.exp(-6 * (t - C.afth - .3)) * Math.abs(Math.cos((t - C.afth - .3) * 14)) : 520 * eIn(fall), o: t > C.afth - .1 ? 1 : 0 });
  slam('S17-l', t, C.synei - .1, { from: 2.2, rot: -4 }); slam('S17-l2', t, C.afth + .1, { from: 1.8 }); slam('S17-l3', t, C.afth + .3, { from: 1.8 });
};
F.S18 = t => {
  const { a, b } = SH.S18;
  cam('S18-cam', t, [[a, 960, 480, 1.04], [C.denk, 960, 540, 1], [b, 960, 560, 1.04]]);
  for (let i = 0; i < 6; i++) popIn('S18-c' + i, t, a + .05 + i * .06);
  draw('S18-cr', t, C.adyn - .1, .5);
  for (let i = 0; i < 2; i++) { const t0 = i ? C.synet : C.synerx; popIn('S18-g' + i, t, C.denk - .1 + i * .15, { rot: i ? 4 : -4 }); slam('S18-n' + i, t, t0 - .1, { from: 1.8 }); slam('S18-x' + i, t, t0 + .25, { from: 2.4, rot: 30 }); }
  slam('S18-l', t, C.adyn - .15, { from: 2.4, rot: -5 });
};
F.S19 = t => {
  const { a, b } = SH.S19;
  cam('S19-cam', t, [[a, 960, 560, 1.06], [C.empod, 960, 540, 1], [b, 960, 530, 1.05]]);
  const jam = C.empod + .2, run = Math.min(t, jam) - a, jit = t > jam ? Math.sin(q15(t) * 60) * 3 : 0;
  put('S19-g0', { r: run * 40 + jit }); put('S19-g1', { r: -run * 60 - jit }); put('S19-g2', { r: run * 48 + jit });
  const d = P(t, C.empod - .25, jam); put('S19-blk', { dy: -500 * (1 - eIn(d)), r: -6 + (t > jam ? Math.sin(q15(t) * 50) * 1.5 : 0), o: t > C.empod - .25 ? 1 : 0 });
  for (let i = 0; i < 3; i++) { if (t < jam) { op('S19-sp' + i, 0); continue; } put('S19-sp' + i, { s: .6 + .6 * Math.abs(Math.sin(t * 13 + i)), r: t * 200, o: (Math.floor(t * 10 + i) % 3) ? 1 : 0 }); }
  popIn('S19-plate', t, a + .2);
  ['en', 'fr'].forEach((k, i) => { idle('s19' + k, t, i); expr('s19' + k, t > jam ? 'sad' : 'happy'); });
  slam('S19-l', t, C.empod, { from: 2.6, rot: -5 }); slam('S19-l2', t, C.synkr - .05, { from: 1.8 });
};
F.S20 = t => {
  const { a, b } = SH.S20;
  cam('S20-cam', t, [[a, 960, 580, 1.1], [C.vasex, 960, 560, 1.02], [b, 960, 540, 1.05]]);
  idle('s20ot', t, 0); expr('s20ot', blinkAt(t, [a + .7]) ? 'blink' : 'neutral');
  popIn('S20-sc', t, a + .2, { rot: 8 }); if (t > a + .6) put('S20-sc', { dy: bob(t, 2, 5), o: 1 });
  draw('S20-bx', t, C.kathor - .1, .8);
  slam('S20-l', t, C.kathor - .1, { from: 2.2, rot: -4 }); slam('S20-l2', t, C.vasex, { from: 1.8 });
};
F.S21 = t => {
  const { a, b } = SH.S21; twinkle('S21', t);
  cam('S21-cam', t, [[a, 810, 560, 1.08], [C.arxig - .45, 820, 540, 1], [C.arxig + .3, 2740, 540, 1], [b, 2740, 520, 1.04]]);
  idle('s21ot', t, 0); idle('s21dp', t, .5); expr('s21ot', 'happy'); expr('s21dp', 'happy');
  popIn('S21-lw', t, C.symmet - .1, { rot: -8 }); if (t > C.symmet + .3) put('S21-lw', { dy: bob(t, 2, 4), o: 1 });
  idle('s21ou', t, .2);
  for (let i = 0; i < 4; i++) { idle('s21s' + i, t, i * .3, .5); put('S21-s' + i, { dy: t > C.arxig + .5 ? -Math.abs(Math.sin(q15(t) * 5 + i)) * 4 : 0, o: 1 }); }
  slam('S21-l', t, C.symmet - .1, { from: 2, rot: -4 }); slam('S21-l2', t, C.nomoth - .1, { from: 1.8 });
  slam('S21-m', t, C.arxig, { from: 2, rot: -4 }); slam('S21-m2', t, C.arxig + .5, { from: 1.8 });
};
F.S22 = t => {
  const { a, b } = SH.S22;
  cam('S22-cam', t, [[a, 900, 560, 1.06], [C.prosyp - .3, 960, 540, 1], [b, 980, 530, 1.05]]);
  idle('s22ot', t, 0); expr('s22ot', t > C.isxy + .1 && t < C.prosyp + .5 ? 'sad' : 'happy');
  popIn('S22-dc', t, a + .1, { rot: -4 });
  draw('S22d-sig', t, C.praxi - .2, .6);
  slam('S22-no', t, C.isxy - .05, { from: 2.6, rot: -14 }); if (t > C.prosyp + .5) put('S22-no', { o: 1 - P(t, C.prosyp + .5, C.prosyp + .7), r: 0 });
  slide('S22-mn', t, C.prosyp - 1.2, .7, 700, 0); slide('S22-mt', t, C.prosyp - 1.2, .7, 700, 0); idle('s22mn', t, .4); expr('s22mn', 'neutral');
  draw('S22d-sig2', t, C.prosyp - .1, .6); popIn('S22d-seal', t, C.prosyp + .45, { rot: 30 });
  slam('S22-ok', t, C.prosyp + .6, { from: 2.8, rot: 10 });
  slam('S22-om', t, C.omos26, { from: 2.4, rot: -6 });
  slam('S22-l', t, C.prosyp - .1, { from: 2.2, rot: -4 }); slam('S22-l2', t, C.prosyp + .3, { from: 1.8 });
};
F.S23 = t => {
  const { a, b } = SH.S23;
  cam('S23-cam', t, [[a, 960, 560, 1.06], [C.kathol, 1000, 540, 1], [b, 1020, 530, 1.03]]);
  slam('S23-d', t, C.diat - .2, { from: 2, rot: -4 }); fadeOut('S23-d', t, C.a29 - .1);
  // an ENDLESS queue (universal suffrage): the front man votes, fades into the box, and someone new joins at the back
  const n = 6, T0 = C.a29 + .2, dt = 1.05, Q = [1120, 950, 780, 610, 440, 270], md = k => ((k % n) + n) % n;
  const done = t < T0 ? 0 : Math.floor((t - T0) / dt) + 1, p = done ? eIO(P(t, T0 + (done - 1) * dt, T0 + (done - 1) * dt + .5)) : 0;
  for (let i = 0; i < n; i++) {
    const prev = md(i - (done - 1)), cur = md(i - done);
    let x = Q[i], o = 1, hop = 0;
    if (done) {
      if (prev === 0) { x = lerp(Q[0], 1330, p); o = 1 - P(p, .55, 1); if (p >= 1) { x = Q[5]; o = P(t, T0 + (done - 1) * dt + .5, T0 + (done - 1) * dt + .8); } }
      else { x = lerp(Q[prev], Q[cur], p); }
      hop = p > 0 && p < 1 ? Math.sin(p * Math.PI) * (prev === 0 ? 70 : 22) : 0;
    }
    put('S23-v' + i, { x, dy: -hop, o }); idle('s23v' + i, t, i * .3);
  }
  const pk = done ? t - (T0 + (done - 1) * dt) : -1; put('S23-pp', { dy: 280 * eIn(clamp((pk - .35) / .35)), o: pk > .35 && pk < .72 ? 1 : 0 });
  slam('S23-a', t, C.a29, { from: 2.4, rot: -6 });
  popIn('S23-sg', t, C.elax - .1, { rot: -6 });
  slam('S23-l', t, C.kathol - .1, { from: 2.2, rot: -4 }); slam('S23-l2', t, C.kathol + .6, { from: 1.8 });
};
F.S24 = t => {
  const { a, b } = SH.S24;
  cam('S24-cam', t, [[a, 900, 560, 1.06], [C.protop, 1000, 540, 1], [b, 1020, 530, 1.03]]);
  $('S24-lanes').setAttribute('transform', `translate(${-((t * 520) % 160)},0)`);
  [['gr', 0], ['fr', 1.2], ['uk', 2.1]].forEach(([k, ph], i) => { const id = 's24' + k; idle(id, t, ph, 1.6); put('S24-' + k, { dy: -Math.abs(Math.sin(q15(t) * 9 + ph)) * 26, r: -8, o: 1 }); });
  expr('s24gr', 'happy'); slam('S24-tg', t, a + .2, { from: 1.6 }); slam('S24-tf', t, a + .35, { from: 1.6 }); slam('S24-tu', t, a + .5, { from: 1.6 });
  popIn('S24-wr', t, C.protop - .1, { rot: 20 }); if (t > C.protop + .3) put('S24-wr', { dy: -Math.abs(Math.sin(q15(t) * 9)) * 26, o: 1 });
  slam('S24-l', t, C.pagk - .1, { from: 2.4, rot: -5 });
};
F.S25 = t => {
  const { a, b } = SH.S25;
  cam('S25-cam', t, [[a, 960, 560, 1.08], [C.thet, 960, 540, 1], [b, 960, 530, 1.03]]);
  for (let i = 0; i < 5; i++) { drop('S25-c' + i, t, a + .1 + i * .1, { h: 600 }); idle('s25c' + i, t, i * .3); expr('s25c' + i, [0, 2, 3].includes(i) && t > C.osous ? 'happy' : 'neutral'); }
  [C.thet, C.osous, C.ypops].forEach((t0, j) => { popIn('S25-t' + j, t, t0, { rot: -20 }); if (t > t0 + .4) put('S25-t' + j, { dy: bob(t, 3, 5, j), o: 1 }); });
  slam('S25-l', t, C.b33 - .05, { from: 2.2, rot: -4 }); slam('S25-l2', t, C.thet - .1, { from: 1.8 }); popIn('S25-y', t, a + .4);
};
F.S26 = t => {
  const { a, b } = SH.S26;
  cam('S26-cam', t, [[a, 960, 560, 1.08], [C.diafsyn, 960, 540, 1], [b, 960, 540, 1.04]]);
  popIn('S26-bl', t, a + .05);
  const T0 = [C.psifod - .2, C.psifod + .3, C.diafsyn - .1, C.diafsyn + .35];
  T0.forEach((t0, i) => popIn('S26-k' + i, t, t0, { rot: -20 }));
  const rx = [-250, -250, 250, 250], ry = [0, 2, 1, 3].map(r => -60 + r * 70);
  let k = 0; for (let i = 0; i < 4; i++) if (t > T0[i] - .3) k = i;
  put('S26-q', { x: 960 + rx[k] - 150, y: 560 + ry[k] + 30 + Math.sin(q15(t) * 18) * 6, o: 1 });
  slam('S26-l', t, C.psifod - .2, { from: 2, rot: -4 }); slam('S26-l2', t, C.diafsyn, { from: 2, rot: 3 });
};
F.S27 = t => {
  const { a, b } = SH.S27;
  cam('S27-cam', t, [[a, 960, 560, 1.06], [b, 960, 540, 1]]);
  drop('S27-v', t, a, { h: 800 }); drop('S27-g', t, a + .2, { h: 800 });
  [['S27-v', C.voul], ['S27-g', C.gerous]].forEach(([id, t0]) => { if (t > a + 1.2) put(id, { s: 1 + .08 * Math.exp(-5 * Math.max(0, t - t0)) * (t > t0 ? 1 : 0), o: 1 }); });
  slam('S27-l', t, C.g37, { from: 1.5, rot: -2 });
};
F.S28 = t => {
  const { a, b } = SH.S28;
  cam('S28-cam', t, [[a, 900, 560, 1.06], [C.isov - .3, 1100, 540, 1], [b, 1150, 530, 1.03]]);
  idle('s28ot', t, 0); expr('s28ot', 'happy');
  for (let i = 0; i < 3; i++) {
    const t0 = C.dior + i * .35; idle('s28s' + i, t, i * .4); expr('s28s' + i, t > t0 ? 'happy' : 'neutral');
    popIn('S28-sa' + i, t, t0 + .1); popIn('S28-sp' + i, t, t0, { s: 1.2 }); if (t > t0 + .3) put('S28-sp' + i, { o: 1 - P(t, t0 + .3, t0 + .6), s: 1.2 });
  }
  for (let i = 0; i < 5; i++) { const k = ((t - C.isov) * .9 + i * .2) % 1; if (t < C.isov) { op('S28-pg' + i, 0); continue; } put('S28-pg' + i, { dx: (i - 2) * 50 * k, dy: -320 * k, r: (i - 2) * 30 * k, o: 1 - k }); }
  slam('S28-inf', t, C.isov - .05, { from: 2.6 }); if (t > C.isov + .4) put('S28-inf', { r: Math.sin(t * 2) * 6, o: 1 });
  slam('S28-l', t, C.dior - .1, { from: 2.2, rot: -4 }); slam('S28-l2', t, C.isov, { from: 2.2, rot: 4 });
};
F.S29 = t => {
  const { a, b } = SH.S29;
  cam('S29-cam', t, [[a, 960, 540, 1.06], [b, 980, 540, 1]]);
  popIn('S29-pp', t, a + .05);
  const sc = P(t, C.provl - .2, C.denyp - .3);
  put('S29-mg', { x: lerp(560, 1360, eIO(sc)), y: 480 + Math.sin(sc * Math.PI * 3) * 70, o: 1 });
  popIn('S29-q', t, C.komm39 - .1); slam('S29-x', t, C.denyp - .05, { from: 2.6, rot: 25 }); slam('S29-l3', t, C.denyp, { from: 2 });
  ['en', 'fr', 'ru'].forEach((k, i) => { idle('s29' + k, t, i * .3); expr('s29' + k, t > C.denyp ? 'sad' : 'neutral'); headTilt('s29' + k, t > C.denyp ? (i ? -10 : 10) : 0); });
  slam('S29-l', t, C.provl - .15, { from: 2, rot: -4 }); slam('S29-l2', t, C.komm39 - .1, { from: 1.8 });
};
F.S30 = t => {
  const { a, b } = SH.S30;
  cam('S30-cam', t, [[a, 700, 560, 1.06], [C.synth, 960, 540, 1], [b, 1000, 530, 1.03]]);
  popIn('S30-bk', t, C.kanon - .1, { rot: -6 }); slam('S30-bt', t, C.kanon, { from: 1.8 });
  const spin = t < C.synth ? 0 : (t - C.synth) * 320; $('S30-drum').setAttribute('transform', `translate(0,-210) rotate(${spin})`);
  const T = [1340, 1640];
  for (let i = 0; i < 9; i++) {
    const t0 = C.epitr - .2 + i * .18, p = P(t, t0, t0 + .55), tx = T[i % 2] - 90 + Math.floor(i / 2) * 45;
    if (t < t0) { op('S30-b' + i, 0); continue; }
    put('S30-b' + i, { x: lerp(1118, tx, eOut(p)), y: lerp(640, 740, p) - Math.sin(p * Math.PI) * 180, o: 1 });
  }
  slam('S30-l', t, C.klir - .3, { from: 2.6, rot: -5 }); slam('S30-l2', t, C.epitr - .1, { from: 1.8 });
};
F.S31 = t => {
  const { a, b } = SH.S31;
  cam('S31-cam', t, [[a, 960, 560, 1.04], [C.orism, 1100, 540, 1], [b, 1150, 530, 1.03]]);
  ['S31A', 'S31B'].forEach((p, g) => {
    for (let i = 0; i < 3; i++) { const id = (p + 'm' + i).toLowerCase(); idle(id, t, i * .3 + g); const agree = g === 1 && t > C.synain - .2; expr(id, agree ? 'happy' : (t > C.diavoul ? 'neutral' : 'angry')); }
    for (let j = 0; j < 2; j++) { popIn(p + '-b' + j, t, C.diavoul - .2 + j * .25 + g * .1, { rot: j ? 6 : -6 }); if (t > C.diavoul + .4) put(p + '-b' + j, { dy: bob(t, 7, 4, j), o: g === 1 && t > C.synain - .3 ? 1 - P(t, C.synain - .3, C.synain) : 1 }); }
  });
  popIn('S31-hs', t, C.synain - .1, { rot: -10 }); slam('S31-sn', t, C.synain, { from: 2.2, rot: -4 });
  slam('S31-l', t, C.diavoul - .1, { from: 2.2, rot: -4 }); slam('S31-l2', t, C.orism - .05, { from: 1.8 });
};
F.S32 = t => {
  const { a, b } = SH.S32;
  cam('S32-cam', t, [[a, 900, 560, 1.06], [C.neous, 1100, 540, 1], [b, 1120, 530, 1.03]]);
  popIn('S32-bx', t, a + .1); slam('S32-bt', t, C.kathol44 - .1, { from: 1.8 });
  // the board flips on «νέους»: old side squashes away, new side unfolds
  const f = P(t, C.neous - .15, C.neous + .35);
  put('S32-bd', { sy: Math.max(.001, 1 - 2 * f), o: f < .5 ? 1 : 0 }); put('S32-bn', { sy: Math.max(.001, 2 * f - 1), o: f > .5 ? 1 : 0 });
  slam('S32-l', t, C.neous - .3, { from: 2, rot: -4 });
};
F.S33 = t => {
  const { a, b } = SH.S33;
  cam('S33-cam', t, [[a, 960, 560, 1.06], [C.dieuk - .9, 1000, 540, 1], [C.dieuk - .3, 2860, 540, 1], [b, 2860, 520, 1.04]]);
  const open = eOut(P(t, C.pedio - .2, C.pedio + .4));
  put('S33-gL', { sx: 1 - .85 * open }); put('S33-gR', { sx: 1 - .85 * open });
  for (let i = 0; i < 6; i++) { slide('S33-p' + i, t, C.symmet45 - .3 + i * .12, .7, -900, 0); idle('s33p' + i, t, i * .3, 1.4); if (t > C.symmet45 + i * .12 + .4) put('S33-p' + i, { dy: -Math.abs(Math.sin(q15(t) * 8 + i)) * 12, o: 1 }); }
  for (let i = 0; i < 3; i++) slide('S33-f' + i, t, C.symmet45 + i * .15, .6, 0, 500);
  const up = eIO(P(t, C.dieuk - .2, C.dieuk + 1.2)); put('S33-sk', { x: lerp(2600, 3050, up), y: lerp(860, 640, up), r: -26 * Math.min(1, up * 4) }); put('S33-pu', { x: lerp(2440, 2900, up), y: lerp(900, 690, up), r: -20 * Math.min(1, up * 4) });
  idle('s33pu', t, 0); expr('s33pu', up >= 1 ? 'happy' : 'strain');
  slam('S33-l', t, C.pedio - .1, { from: 2.4, rot: -4 }); slam('S33-l2', t, C.symmet45, { from: 1.8 });
  slam('S33-m', t, C.dieuk - .2, { from: 2, rot: -4 }); slam('S33-m2', t, C.dieuk + .2, { from: 1.8 });
};
const isosOn = (p, t, t0) => { const e = $(p + '-fr'); e.setAttribute('stroke-dashoffset', -t * 40); e.setAttribute('opacity', clamp((t - t0) / .3)); slam(p + '-is', t, t0, { from: 2.2, rot: -6 }); };
F.S34 = t => {
  const { a, b } = SH.S34;
  cam('S34-cam', t, [[a, 960, 600, 1.12], [C.mikr - .2, 960, 560, 1.04], [b, 960, 560, 1.08]]);
  isosOn('S34', t, C.isos);
  for (let i = 0; i < 4; i++) { idle('s34e' + i, t, i * .3); put('S34-e' + i, { dy: -Math.abs(Math.sin(q15(t) * 6 + i)) * 6, o: 1 }); }
  popIn('S34-bld', t, C.fileleu, { rot: -6 });
  for (let i = 0; i < 12; i++) idle('s34c' + i, t, i * .2, .5);
  slam('S34-l', t, C.fileleu - .1, { from: 1.8 }); slam('S34-l2', t, C.mikr - .1, { from: 2.2, rot: -4 });
};
F.S35 = t => {
  const { a, b } = SH.S35;
  cam('S35-cam', t, [[a, 960, 560, 1.04], [b, 980, 560, 1.08]]);
  isosOn('S35', t, a - 2);
  const pose = Math.sin(q15(t) * 2.4) * 8;
  ['s35ma', 's35jb', 's35gr'].forEach((id, i) => { idle(id, t, i * .3); headTilt(id, i === 2 ? -pose : pose); });
  expr('s35gr', t > C.antap47 + .3 ? 'sad' : 'neutral');
  put('S35-gr', { r: -pose * .4 }); put('S35-ma', { r: pose * .4 }); put('S35-jb', { r: pose * .4 });
  draw('S35-mr', t, C.mimis47 - .3, .5);
  popIn('S35-hat', t, C.mimis47 + .2, { rot: 20 }); if (t > C.mimis47 + .6) put('S35-hat', { dy: 30 + Math.sin(t * 3) * 6, r: Math.sin(t * 2) * 8, o: 1 });
  popIn('S35-sg', t, C.antap47 - .1); slam('S35-x', t, C.antap47 + .3, { from: 2.4, rot: 30 });
  slam('S35-l', t, C.mimis47 - .1, { from: 2.2, rot: -4 }); slam('S35-l2', t, C.mimis47 + .3, { from: 1.8 });
};
F.S36 = t => {
  const { a, b } = SH.S36;
  cam('S36-cam', t, [[a, 960, 560, 1.04], [C.param, 1000, 560, 1], [b, 1020, 560, 1.05]]);
  isosOn('S36', t, a - 4);
  popIn('S36-bp', t, a, { rot: -4 });
  const w = t > C.param ? Math.sin((t - C.param) * 5) * 7 * (.6 + .4 * Math.sin(t * 1.3)) : 0;
  put('S36-bl', { r: w, sx: 1 + w * .01, sy: 1 - Math.abs(w) * .006 });
  $('S36-mf').setAttribute('width', 90 * eOut(P(t, C.mikrou - .2, C.mikrou + .5)));
  slam('S36-ml', t, C.mikrou - .1, { from: 1.8 });
  slam('S36-l', t, C.param - .1, { from: 2.4, rot: -5 }); slam('S36-l2', t, C.efarm - .1, { from: 1.8 });
};
F.S37 = t => {
  const { a, b } = SH.S37;
  cam('S37-cam', t, [[a, 960, 540, 1.04], [C.omos49, 960, 540, 1], [b, 960, 560, 1.06]]);
  for (let i = 0; i < 8; i++) { const k = eOut(P(t, C.omos49 + .05, C.omos49 + .8)); put('S37-p' + i, { dx: (i % 4 - 1.5) * 300 * k, dy: (i < 4 ? -1 : 1) * 400 * k, r: (i % 2 ? 1 : -1) * 120 * k, o: 1 - k }); }
  ['s37ma', 's37jb'].forEach((id, i) => idle(id, t, i));
  const gone = P(t, C.epidr, C.epidr + .5); put('S37-ma', { o: 1 - gone, dx: -200 * gone }); put('S37-jb', { o: 1 - gone, dx: 200 * gone });
  slam('S37-om', t, C.omos49, { from: 3, rot: -8 }); if (t > C.omos49 + .5) put('S37-om', { s: 1 + .03 * Math.sin(t * 5), o: 1 });
  slam('S37-l', t, C.anex - .05, { from: 1.8 }); slam('S37-l2', t, C.anex + .3, { from: 1.8 });
};
F.S38 = t => {
  const { a, b } = SH.S38;
  cam('S38-cam', t, [[a, 800, 520, 1.06], [C.rizose, 800, 560, 1.02], [C.akol, 960, 540, 1], [b, 1000, 520, 1.03]]);
  popIn('S38-tr', t, C.koinov - .2, { dur: .6 }); if (t > C.koinov + .5) put('S38-tr', { r: Math.sin(t * 1.4) * 1.2, o: 1 });
  for (let i = 0; i < 5; i++) draw('S38t-r' + i, t, C.rizose - .1 + i * .08, .6);
  draw('S38-rd', t, C.akol - .2, .8); popIn('S38-sg', t, C.akol + .4, { rot: -8 });
  slam('S38-l', t, C.koinov - .1, { from: 2.2, rot: -4 }); slam('S38-r', t, C.rizose, { from: 2.4, rot: -6 });
};
F.S39 = t => {
  const { a, b } = SH.S39;
  cam('S39-cam', t, [[a, 960, 560, 1.06], [b, 960, 540, 1]]);
  const T0 = [C.anagk52, C.provl53, C.aitim];
  for (let i = 0; i < 3; i++) {
    const id = 's39v' + i; idle(id, t, i * .4); expr(id, t > T0[i] + .3 ? 'happy' : 'neutral');
    popIn('S39-s' + i, t, a + .1 + i * .12, { rot: i % 2 ? 5 : -5 }); if (t > a + .5) put('S39-s' + i, { dy: bob(t, 2.2, 5, i), o: 1 });
    const p = P(t, T0[i] - .35, T0[i]); put('S39-t' + i, { dy: -360 * (1 - bounce(p)), o: t > T0[i] - .35 ? 1 : 0 });
  }
  slam('S39-l', t, C.provl53 - .1, { from: 1.8 });
};
F.S40 = t => {
  const { a, b } = SH.S40;
  cam('S40-cam', t, [[a, 960, 560, 1.06], [C.stadiak - .5, 980, 540, 1], [C.stadiak + .2, 2900, 540, 1], [b, 2900, 520, 1.04]]);
  slam('S40-ex', t, C.exallou, { from: 2, rot: -6 });
  $('S40-cm').setAttribute('values', eOut(P(t, C.energop - .1, C.energop + .6)));
  for (let i = 0; i < 12; i++) { const on = t > C.energop + i * .03; idle('s40c' + i, t, i * .2, on ? 1.5 : .3); expr('s40c' + i, on ? 'happy' : 'neutral'); if (on) put('S40-c' + i, { dy: -Math.abs(Math.sin(q15(t) * 6 + i)) * 10, o: 1 }); }
  for (let i = 0; i < 6; i++) { const t0 = C.stadiak - .1 + i * .18, p = P(t, t0, t0 + .28); put('S40-k' + i, { dy: -500 * (1 - bounce(p)), o: t > t0 ? 1 : 0 }); }
  popIn('S40-roof', t, C.stadiak + 1.05); popIn('S40-bal', t, C.dikaiou, { rot: -10 });
  slam('S40-l', t, C.energop - .1, { from: 2.2, rot: -4 }); slam('S40-l2', t, C.energop + .4, { from: 1.8 });
  slam('S40-m', t, C.stadiak, { from: 2, rot: -4 });
};
F.S41 = t => {
  const { a, b } = SH.S41;
  cam('S41-cam', t, [[a, 960, 560, 1.06], [b, 960, 540, 1]]);
  const flut = Math.sin(q15(t) * 12) * 3, blow = P(t, C.arkouse + .4, C.arkouse + 1.4);
  put('S41-gh', { dx: 900 * eIn(blow) + flut, dy: -200 * eIn(blow), r: 30 * eIn(blow) + flut * .4, o: 1 - blow });
  slam('S41-x', t, C.arkouse, { from: 2.6, rot: 30 }); if (t > C.arkouse + .4) put('S41-x', { dx: 900 * eIn(blow), dy: -200 * eIn(blow), o: 1 - blow });
  slam('S41-l', t, C.arkouse - .05, { from: 2.4, rot: -5 }); slam('S41-l2', t, a + .2, { from: 1.8 });
};
F.S42 = t => {
  const { a, b } = SH.S42;
  cam('S42-cam', t, [[a, 960, 560, 1.08], [b, 960, 540, 1]]);
  for (let i = 0; i < 6; i++) { const t0 = a + .2 + i * .45, p = P(t, t0, t0 + .3); put('S42-k' + i, { dy: -500 * (1 - bounce(p)), o: t > t0 ? 1 : 0 }); }
  popIn('S42-roof', t, a + .2 + 6 * .45);
  for (let i = 0; i < 4; i++) { idle('s42p' + i, t, i * .3, 1.3); put('S42-p' + i, { dy: -Math.abs(Math.sin(q15(t) * 6 + i)) * 10, o: 1 }); popIn('S42-t' + i, t, C.anthr - .2 + i * .12, { rot: -15 }); }
  slam('S42-l', t, Math.min(a + .15, C.anagkai - .1), { from: 2.2, rot: -4 }); slam('S42-l2', t, C.antap57, { from: 1.8 });
};
F.S43 = t => {
  const { a, b } = SH.S43;
  cam('S43-cam', t, [[a, 960, 560, 1.06], [C.simer, 960, 540, 1], [b, 960, 520, 1.08]]);
  const T0 = [C.arist, C.dexia, C.prood, C.synt60], TX = [560, 1360, 960, 560];
  trioIdle('S43', t, i => T0.some(t0 => t > t0 && t < t0 + .7) ? 'shock' : 'neutral'); tags('S43', t, a + .2);
  for (let i = 0; i < 4; i++) {
    const t0 = T0[i] - .45, p = P(t, t0, T0[i]), back = P(t, T0[i], T0[i] + .7);
    if (t < t0) { op('S43-k' + i, 0); op('S43-x' + i, 0); continue; }
    const x = t < T0[i] ? lerp(2300, TX[i], eIn(p)) : TX[i] + 500 * back, y = t < T0[i] ? lerp(300, 480, p) : 480 - 300 * back + 400 * back * back;
    put('S43-k' + i, { x, y, r: t < T0[i] ? -10 : 200 * back, o: 1 - P(t, T0[i] + .5, T0[i] + .7) });
    popIn('S43-x' + i, t, T0[i], { rot: 30 }); if (t > T0[i] + .5) put('S43-x' + i, { o: 1 - P(t, T0[i] + .5, T0[i] + .9) });
  }
  slam('S43-l', t, C.simer - .1, { from: 2.2, rot: -4 });
  op('S43-black', P(t, C.end + .6, C.end + 2));
};
