// Κεφ.2 Β.4 — per-shot animation (browser, after engine/runtime.js). seek(t) is PURE.
// ⚠️ No literal seconds: everything is a cue (C.*) or a shot bound (SH.Sx.a / .b), so a new voice re-times it all.
const SH = {}; D.shots.forEach(s => { SH[s.id] = s; });
const bob = (t, f = 2, a = 8, ph = 0) => Math.sin(t * f + ph) * a;
const twinkle = (p, t) => { for (let i = 0; i < 30; i++) { const e = $('' + p + '-st' + i); if (e) e.setAttribute('opacity', .45 + .55 * Math.abs(Math.sin(t * (1.3 + (i % 5) * .4) + i))); } };
const fadeOut = (id, t, t0, d = .25) => { if (t > t0) put(id, { o: 1 - P(t, t0, t0 + d) }); };
const hop = (t, i, a = 10) => -Math.abs(Math.sin(q15(t) * 6 + i)) * a;
// a G that pops in at t0 and then floats
const popBob = (id, t, t0, o = {}) => { popIn(id, t, t0, o); if (t > t0 + (o.dur ?? .38)) put(id, { dy: bob(t, 2, o.amp ?? 6, o.ph ?? 0), o: 1 }); };
// flight along an arc: G `id` from (x0,y0) to (x1,y1) between t0 and t0+d (absolute x/y)
const fly = (id, t, t0, d, x0, y0, x1, y1, h = 120, o = {}) => {
  if (t < t0) { op(id, 0); return 0; }
  const p = eIO(P(t, t0, t0 + d)); put(id, { x: lerp(x0, x1, p), y: lerp(y0, y1, p) - h * Math.sin(Math.PI * p), s: o.s ?? 1, r: (o.r ?? 0) * p, o: 1 }); return p;
};

// screen shakes & flashes (time, amplitude, duration)
[[C.y62, 8], [C.prok, 10], [C.xreo, 14], [C.koin11 + .6, 16, .5], [C.prai, 8], [C.polom + .05, 14], [C.thes13 - .05, 10], [C.paran, 10], [C.paran + .12, 8],
 [C.antist, 16], [C.griv - .1, 8], [C.eksyn, 8], [C.emfyl, 18, .5], [C.psif33 + .2, 8], [C.synmon, 12], [C.dikai + .1, 12], [C.antid + .1, 12], [C.epev, 14],
 [C.dedil50, 20, .5], [C.ster, 12], [C.dyn56, 10], [C.anavr, 10], [C.tomi, 16], [C.yiot + .15, 8]].forEach(a => shk(...a));
[C.y62, C.emfyl, C.dedil50, C.tomi].forEach(t => fl(t, .4));

F.S1 = t => {
  const { a, b } = SH.S1;
  cam('S1-cam', t, [[a, 960, 640, 1.12], [C.t2, 960, 560, 1.03], [b, 960, 540, 1.07]]);
  slide('S1-tri', t, a, .8, 0, 320); slide('S1-b0', t, a + .1, .8, 0, 300); slide('S1-b1', t, a + .2, .8, 0, 300);
  op('S1-glow', .9 * eOut(P(t, C.t2, C.t2 + 1.4)));
  slam('S1-t1', t, C.t1 + .1, { from: 2.6, rot: -8 }); slam('S1-t2', t, C.t2, { from: 2.2, rot: 4 }); slam('S1-t3', t, C.y62, { from: 2.4, rot: -4 });
};
F.S2 = t => {
  const { a, b } = SH.S2;
  cam('S2-cam', t, [[a, 960, 580, 1.1], [C.prok, 960, 520, 1.02], [b, 960, 500, 1.08]]);
  slide('S2-p0', t, a, .6, -700, 0); slide('S2-p1', t, a + .1, .6, 700, 0);
  if (t > a + .6) { put('S2-p0', { r: t < C.prok ? -4 + bob(t, 9, 4) : 0, o: 1 }); put('S2-p1', { dy: hop(t, 1, 6), o: 1 }); }
  idle('s2p0', t, 0, 1.3); idle('s2p1', t, .4, 1.3); expr('s2p0', t > C.prok ? 'happy' : 'neutral'); expr('s2p1', t > C.prok + .2 ? 'happy' : 'neutral');
  slam('S2-post', t, C.prok, { from: 1.6, rot: -6 }); op('S2-ethn', clamp((t - C.ethn2) / .15));
  slam('S2-l', t, C.epan, { from: 2.2, rot: -4 });
};
F.S3 = t => {
  const { a, b } = SH.S3; twinkle('S3', t);
  cam('S3-cam', t, [[a, 960, 520, 1.08], [b, 960, 540, 1.0]]);
  if (t < a) op('S3-sc', 0); else put('S3-sc', { sx: Math.max(.02, eBack(P(t, a, a + .5), 1.6)), o: 1 });
  popIn('S3-q', t, C.neo3 - .3, { rot: -20 }); if (t > C.neo3) put('S3-q', { dx: -300 * P(t, C.neo3, b) + bob(t, 14, 10), dy: bob(t, 11, 8), o: 1 });
  for (let i = 0; i < 4; i++) { popIn('S3-d' + i, t, C.psif3 - .1 + i * .08); idle('s3d' + i, t, i * .3, 1.4); expr('s3d' + i, 'happy'); }
  slam('S3-l', t, C.psif3, { from: 2.2, rot: -4 });
};
F.S4 = t => {
  const { a, b } = SH.S4;
  cam('S4-cam', t, [[a, 760, 560, 1.08], [C.noem, 760, 530, 1.03], [b, 1000, 520, 1.06]]);
  for (let i = 0; i < 9; i++) put('S4-lf' + i, { dx: bob(t, 1.6, 40, i), dy: ((t - a) * 170 + i * 123) % 1100, r: t * 90 + i * 40, o: 1 });
  for (let i = 0; i < 2; i++) put('S4-tr' + i, { r: bob(t, 1.2, 1.2, i) });
  popIn('S4-door', t, a + .1); popIn('S4-cal', t, a);
  if (t > a + .4) { const fp = P(t, C.noem - .2, C.noem + .2); put('S4-cal', { sy: Math.max(.05, Math.abs(Math.cos(fp * Math.PI))), o: 1 }); }
  op('S4-pgA', t < C.noem ? 1 : 0); op('S4-pgB', t < C.noem ? 0 : 1);
  for (let i = 0; i < 4; i++) { if (t < a) { op('S4-v' + i, 0); continue; } put('S4-v' + i, { dx: (t - a) * 42, dy: hop(t, i, 8), o: 1 }); idle('s4v' + i, t, i * .3); }
  slam('S4-l', t, C.ekl4, { from: 2, rot: 3 }); slam('S4-d', t, C.y1862, { from: 2.4, rot: -6 });
};
F.S5 = t => {
  const { a, b } = SH.S5;
  cam('S5-cam', t, [[a, 960, 580, 1.08], [C.topika - .3, 960, 530, 1.0], [C.komm5 - .2, 1150, 530, 1.05], [b, 1000, 540, 1.03]]);
  for (let i = 0; i < 6; i++) {
    popIn('S5-d' + i, t, a + i * .07); idle('s5d' + i, t, i * .3); expr('s5d' + i, t > C.topika && i < 4 ? 'happy' : 'neutral');
    popBob('S5-tg' + i, t, C.topika + i * .1, { ph: i, amp: 4 });
  }
  popIn('S5-bar', t, C.pleio - .1); $('S5-fill').setAttribute('width', 888 * .68 * eOut(P(t, C.pleio, C.pleio + 1.2)));
  if (t < C.komm5 - .5) op('S5-arm', 0); else put('S5-arm', { dx: 700 * (1 - eOut(P(t, C.komm5 - .5, C.komm5))) + 820 * eIn(P(t, C.parem5 + .45, C.parem5 + .95)), o: 1 });
  popIn('S5-x', t, C.parem5, { rot: 30 }); if (t > C.parem5 + .8) put('S5-x', { o: 1 - P(t, C.parem5 + .8, C.parem5 + 1.1) });
  slam('S5-l', t, C.pleio, { from: 1.8 }); slam('S5-l2', t, C.topika, { from: 2.2, rot: -4 }); slam('S5-l3', t, C.xoris, { from: 1.8, rot: 3 });
};
F.S6 = t => {
  const { a, b } = SH.S6;
  cam('S6-cam', t, [[a, 960, 580, 1.06], [C.apod, 1080, 560, 1.03], [C.xreo - .3, 960, 540, 1.0], [b, 960, 520, 1.07]]);
  ['en', 'fr', 'ru'].forEach((k, i) => { slide('S6-' + k, t, a + i * .1, .45, [-900, 0, 900][i], i === 1 ? 500 : 0); idle('s6' + k, t, i * .4); expr('s6' + k, t > C.xreo + .6 ? 'sad' : (t > C.xreo ? 'shock' : 'neutral')); });
  popIn('S6-sign', t, a + .1); popIn('S6-bag', t, a + .4); if (t > a + .8) put('S6-bag', { r: bob(t, 3, 4), o: 1 });
  if (t < C.apod - .3) op('S6-mag', 0); else put('S6-mag', { dx: 500 * (1 - eOut(P(t, C.apod - .3, C.apod + .2))) + bob(t, 2.5, 20), dy: bob(t, 3.1, 14), o: 1 });
  slam('S6-l', t, C.apod, { from: 2 });
  slam('S6-st', t, C.xreo, { from: 2.6, rot: -10 });
};
F.S7 = t => {
  const { a, b } = SH.S7;
  cam('S7-cam', t, [[a, 960, 580, 1.06], [C.pyr, 960, 540, 1.0], [b, 960, 520, 1.05]]);
  const X0 = [150, 1700, 520, 1280, 880, 1050, 300, 1500], X1 = [300, 1620, 540, 1380, 660, 1260, 420, 1500];
  for (let i = 0; i < 8; i++) {
    if (t < a) { op('S7-d' + i, 0); continue; }
    const p = eIO(P(t, C.synkr7 + i * .05, C.synkr7 + 1.2 + i * .05)), walking = p > 0 && p < 1;
    put('S7-d' + i, { x: lerp(X0[i], X1[i], p), dy: walking ? hop(t, i, 12) : 0, s: Math.min(1, eBack(P(t, a, a + .3))), o: 1 });
    idle('s7d' + i, t, i * .25); expr('s7d' + i, t > C.pyr ? 'happy' : 'neutral');
  }
  for (let k = 0; k < 2; k++) { popIn('S7-c' + k, t, C.pyr + k * .15, { s: 1 }); if (t > C.pyr + .5) put('S7-c' + k, { s: 1 + .06 * Math.sin(t * 5 + k), o: 1 }); }
  slam('S7-l', t, C.pyr, { from: 2 }); slam('S7-l2', t, C.dyo7, { from: 2.2, rot: -4 });
};
F.S8 = t => {
  const { a, b } = SH.S8;
  cam('S8-cam', t, [[a, 700, 560, 1.04], [C.ore8 - .25, 1300, 540, 1.0], [C.onom - .2, 1150, 520, .93], [b, 1150, 520, .96]]);
  drop('S8-sp', t, C.ped8 - .3, { h: 800 }); drop('S8-so', t, C.ore8 - .3, { h: 800 });
  if (t > C.onom) { const k = t - C.onom, w = Math.exp(-5 * k) * Math.sin(k * 16); put('S8-sp', { sy: 1 + .12 * w, o: 1 }); put('S8-so', { sy: 1 + .12 * w, o: 1 }); }
  for (let i = 0; i < 3; i++) { popIn('S8-fp' + i, t, C.ped8 + .2 + i * .08); if (t > C.ped8 + .6) put('S8-fp' + i, { r: bob(t, 3, 3, i), o: 1 }); popIn('S8-fo' + i, t, C.ore8 + .2 + i * .08); if (t > C.ore8 + .6) put('S8-fo' + i, { r: bob(t, 3, 3, i + 2), o: 1 }); }
  slam('S8-l', t, C.onom, { from: 2, rot: 3 });
};
F.S9 = t => {
  const { a, b } = SH.S9;
  cam('S9-cam', t, [[a, 960, 620, 1.12], [C.voulg, 960, 540, 1.0], [b, 960, 520, 1.05]]);
  slide('S9-pod', t, a, .3, 0, 300); drop('S9-v', t, a, { h: 500, fall: .24 }); idle('s9v', t, 0, 1.2);
  expr('s9v', blinkAt(t, [C.voulg + .8]) ? 'blink' : (t > C.igeti ? 'happy' : 'neutral'));
  for (let i = 0; i < 4; i++) { popIn('S9-f' + i, t, a + i * .06); if (t > a + .8) put('S9-f' + i, { r: bob(t, 2.6, 3, i), o: 1 }); }
  slam('S9-l', t, C.igeti, { from: 2.2, rot: -4 }); slam('S9-n', t, C.voulg, { from: 2.2, rot: 3 });
};
F.S10 = t => {
  const { a, b } = SH.S10, SINK = C.koin11 + .5;
  cam('S10-cam', t, [[a, 760, 640, 1.08], [C.koin11, 900, 600, 1.0], [b, 960, 560, 1.06]]);
  draw('S10-tun', t, a + .15, SINK - a - .15, x => x);
  const p = P(t, a + .15, SINK);
  if (t < a) op('S10-v', 0); else put('S10-v', { x: lerp(260, 1080, p), y: lerp(940, 800, p), r: t < SINK ? Math.sin(q15(t) * 20) * 8 : 0, o: 1 });
  idle('s10v', t, 0, 1.4); expr('s10v', t > SINK ? 'happy' : 'strain');
  draw('S10-cr', t, C.koin11 + .2, .5);
  const sink = eOut(P(t, SINK, SINK + .7)); put('S10-b', { dy: 70 * sink, r: 7 * sink + (t > C.koin11 ? Math.sin(t * 30) * .6 * (1 - sink) : 0) });
  slam('S10-l', t, C.ypon, { from: 2.4, rot: -6 });
};
F.S11 = t => {
  const { a, b } = SH.S11;
  cam('S11-cam', t, [[a, 760, 580, 1.08], [C.prai - .3, 960, 540, 1.0], [b, 1000, 520, 1.06]]);
  for (let i = 0; i < 4; i++) {
    popIn('S11-s' + i, t, a + i * .06); idle('s11s' + i, t, i * .3); expr('s11s' + i, t > C.prai ? 'happy' : 'neutral');
    popIn('S11-bd' + i, t, C.parem12 + .1 + i * .3, { s: 1 });
    popIn('S11-cr' + i, t, C.prai + i * .1, { rot: -20 });
  }
  slide('S11-v', t, a, .6, -500, 0); idle('s11v', t, 0, 1.3); expr('s11v', 'happy');
  if (t > a + .6) put('S11-v', { dx: 60 * Math.sin(P(t, C.parem12, C.prai) * Math.PI), o: 1 });
  slam('S11-l', t, C.parem12 - .1, { from: 2.2, rot: -4 }); slam('S11-l2', t, C.prai, { from: 2.4, rot: 5 });
};
F.S12 = t => {
  const { a, b } = SH.S12;
  cam('S12-cam', t, [[a, 960, 600, 1.1], [C.param, 960, 540, 1.0], [b, 960, 520, 1.05]]);
  slide('S12-pod', t, a, .4, 0, 200); popIn('S12-ch', t, a + .05); slam('S12-chl', t, a + .15, { from: 1.6 });
  drop('S12-v', t, a + .1, { h: 800 }); idle('s12v', t, 0, 1.2); expr('s12v', t > C.exous12 ? 'happy' : 'neutral');
  for (let i = 0; i < 4; i++) { slide('S12-s' + i, t, C.exasf - .3 + i * .08, .5, i < 2 ? -900 : 900, 0); idle('s12s' + i, t, i * .3); expr('s12s' + i, 'angry'); }
  slam('S12-l', t, C.param, { from: 2.2, rot: -4 });
};
F.S13 = t => {
  const { a, b } = SH.S13;
  cam('S13-cam', t, [[a, 760, 560, 1.06], [C.polom, 900, 540, 1.02], [b, 1050, 520, 1.06]]);
  drop('S13-b0', t, C.polom - .36, { h: 900 }); drop('S13-b1', t, C.thes13 - .36, { h: 900 });
  const walk = P(t, a, C.polom), knock = t > C.polom ? 90 * eOut(P(t, C.polom, C.polom + .3)) : 0;
  if (t < a) op('S13-v', 0); else put('S13-v', { x: lerp(200, 880, walk) - knock, dy: t < C.polom ? hop(t, 0, 14) : 0, r: t > C.polom ? -8 * Math.exp(-4 * (t - C.polom)) : 0, o: 1 });
  idle('s13v', t, 0, 1.2); expr('s13v', t > C.polom + .9 ? 'angry' : (t > C.polom ? 'shock' : 'neutral'));
  popIn('S13-stars', t, C.polom + .05); if (t > C.polom + .4) put('S13-stars', { r: (t - C.polom) * 120, o: 1 - P(t, C.polom + 1.6, C.polom + 2) });
  slam('S13-l', t, C.empod, { from: 2.6, rot: -6 }); slam('S13-l2', t, C.epid, { from: 1.8 });
};
F.S14 = t => {
  const { a, b } = SH.S14;
  cam('S14-cam', t, [[a, 760, 580, 1.06], [C.dior - .3, 1100, 540, 1.02], [C.paran + .4, 1260, 520, 1.06], [b, 960, 540, 1.02]]);
  idle('s14v', t, 0, 1.2); expr('s14v', 'happy');
  drop('S14-s', t, a, { h: 450, fall: .24 }); drop('S14-c', t, a + .1, { h: 450, fall: .24 }); idle('s14s', t, .3); idle('s14c', t, .6);
  expr('s14s', t > C.opad ? 'happy' : 'neutral'); expr('s14c', t > C.opad ? 'happy' : 'neutral');
  for (let i = 0; i < 2; i++) { popBob('S14-p' + i, t, C.dior + i * .15, { ph: i }); slam('S14-st' + i, t, C.paran + i * .12, { from: 2.2, rot: -10 }); popIn('S14-f' + i, t, C.opad + .2 + i * .12); if (t > C.opad + .7) put('S14-f' + i, { r: bob(t, 3, 4, i), o: 1 }); }
  slam('S14-l', t, C.opad, { from: 2.2, rot: -4 }); slam('S14-ls', t, C.strat14, { from: 1.8 }); slam('S14-lc', t, C.strat14 + .45, { from: 1.8 });
};
F.S15 = t => {
  const { a, b } = SH.S15;
  cam('S15-cam', t, [[a, 760, 600, 1.1], [C.koin15 - .3, 1000, 540, 1.0], [b, 1000, 520, 1.06]]);
  put('S15-sun', { dy: -330 * eOut(P(t, C.koin15 - .7, C.nom15 + .3)), r: t * 8 });
  const wob = P(t, C.xas, C.koin15) * (1 + P(t, C.koin15, C.nom15));
  put('S15-ch', { r: Math.sin(t * 15) * 5 * wob }); put('S15-c', { r: Math.sin(t * 15) * 5 * wob, dy: Math.abs(Math.sin(t * 15)) * -6 * wob });
  idle('s15c', t, 0, 1.4); expr('s15c', t > C.fov ? 'shock' : 'neutral');
  if (t < C.xas) op('S15-sw', 0); else put('S15-sw', { dy: ((t - C.xas) * 90) % 90, o: 1 - (((t - C.xas) * 1) % 1) * .6 });
  slam('S15-l', t, C.fov, { from: 2.2, rot: -4 }); slam('S15-l2', t, C.koin15, { from: 1.8 }); slam('S15-l3', t, C.nom15, { from: 2.2, rot: 3 });
};
F.S16 = t => {
  const { a, b } = SH.S16;
  cam('S16-cam', t, [[a, 700, 560, 1.06], [C.mikr16 - .4, 1200, 540, 1.04], [b, 1050, 540, 1.04]]);
  slide('S16-plot', t, a, .4, 0, 200); drop('S16-g', t, a, { h: 450, fall: .24 }); drop('S16-f', t, a + .1, { h: 450, fall: .24 });
  idle('s16g', t, 0); idle('s16f', t, .5); expr('s16g', t > C.ptyx + .3 ? 'neutral' : 'sad'); expr('s16f', t > C.mikr16 ? 'happy' : 'neutral');
  popBob('S16-sg', t, C.anerg, { amp: 4 });
  popIn('S16-fl0', t, C.ptyx + .2); popIn('S16-fl1', t, C.mikr16 + .2);
  for (let i = 0; i < 2; i++) if (t > [C.ptyx, C.mikr16][i] + .6) put('S16-fl' + i, { r: bob(t, 3, 4, i), o: 1 });
  slam('S16-l', t, C.anerg, { from: 2.2, rot: -4 }); slam('S16-l2', t, C.mikr16, { from: 2.2, rot: 3 });
};
F.S17 = t => {
  const { a, b } = SH.S17;
  cam('S17-cam', t, [[a, 960, 700, 1.1], [C.diaf17, 960, 560, 1.0], [C.griv, 1000, 420, 1.06], [b, 1000, 400, 1.1]]);
  slide('S17-mt', t, a, .5, 0, 300);
  const GX = [380, 620, 1320, 1560], GY = [900, 760, 760, 900];
  for (let i = 0; i < 4; i++) {
    const t0 = C.diaf17 + i * .15; if (t < t0) { op('S17-g' + i, 0); continue; }
    const m = eIO(P(t, C.griv - .9, C.griv - .2));
    put('S17-g' + i, { x: lerp(GX[i], 1122, m), y: lerp(GY[i], 200, m), s: Math.max(.01, eBack(P(t, t0, t0 + .35)) * (1 - .6 * m)), r: bob(t, 3, 4, i), o: 1 - P(t, C.griv - .3, C.griv - .1) });
  }
  popIn('S17-big', t, C.griv - .15, { rot: -10 }); if (t > C.griv + .3) put('S17-big', { r: bob(t, 2.4, 3), o: 1 });
  drop('S17-gr', t, C.griv - .45, { h: 700 }); idle('s17gr', t, 0, 1.2); expr('s17gr', t > C.griv + .2 ? 'happy' : 'neutral');
  slam('S17-l', t, C.ore17, { from: 2.2, rot: -4 }); slam('S17-l2', t, C.diaf17, { from: 1.8 }); slam('S17-n', t, C.griv, { from: 2.2, rot: 3 });
};
F.S18 = t => {
  const { a, b } = SH.S18;
  cam('S18-cam', t, [[a, 960, 580, 1.06], [C.antist, 960, 540, 1.0], [b, 960, 520, 1.04]]);
  if (t < a + .1) op('S18-ar', 0);
  else { const hit = t > C.antist, back = P(t, C.antist, C.antist + .4); put('S18-ar', { dx: hit ? 480 - 70 * eOut(back) : lerp(-900, 480, eIn(P(t, a + .1, C.antist))), sx: hit ? 1 - .12 * Math.exp(-5 * (t - C.antist)) : 1, o: 1 }); }
  for (let i = 0; i < 3; i++) { popIn('S18-sh' + i, t, a + .15 + i * .1); if (t > C.antist) put('S18-sh' + i, { dx: Math.sin((t - C.antist) * 40) * 8 * Math.exp(-5 * (t - C.antist)), o: 1 }); }
  drop('S18-gr', t, a + .05, { h: 700 }); idle('s18gr', t, 0, 1.2); expr('s18gr', t > C.antist + .3 ? 'happy' : 'angry');
  popIn('S18-tg', t, C.koin17); if (t > C.koin17 + .4) put('S18-tg', { s: 1 + .04 * Math.sin(t * 6), o: 1 });
  slam('S18-l', t, C.koin17, { from: 1.8 }); slam('S18-l2', t, C.antist, { from: 2.4, rot: -5 });
};
F.S19 = t => {
  const { a, b } = SH.S19;
  cam('S19-cam', t, [[a, 560, 600, 1.12], [C.ktin, 820, 560, 1.06], [C.empor, 1120, 560, 1.04], [C.ploio + .3, 960, 540, 1.0], [b, 960, 530, 1.02]]);
  const ids = ['f', 'h', 'm', 's'], T0 = [C.mikr18, C.ktin, C.empor, C.ploio];
  for (let i = 0; i < 4; i++) {
    drop('S19-' + ids[i], t, i ? T0[i] - .35 : Math.min(a + .05, T0[i] - .35), { h: 800 }); idle('s19' + ids[i], t, i * .3); expr('s19' + ids[i], t > T0[i] + .3 ? 'happy' : 'neutral');
    slam('S19-t' + i, t, T0[i], { from: 1.8 }); popIn('S19-fl' + i, t, T0[i] + .3); if (t > T0[i] + .7) put('S19-fl' + i, { r: bob(t, 3, 4, i), o: 1 });
  }
  slam('S19-l', t, C.ypost, { from: 2.2, rot: -4 });
};
F.S20 = t => {
  const { a, b } = SH.S20;
  cam('S20-cam', t, [[a, 960, 600, 1.1], [C.energ, 960, 540, 1.0], [b, 960, 520, 1.05]]);
  for (let i = 0; i < 8; i++) { const landed = drop('S20-p' + i, t, a + i * .07, { h: 500 }); if (landed && t > a + i * .07 + .9) put('S20-p' + i, { dy: hop(t, i, t > C.energ - .2 ? 30 : 8), r: bob(t, 5, 3, i), o: 1 }); idle('s20p' + i, t, i * .2, 1.4); }
  slam('S20-l', t, C.laos, { from: 2.2, rot: -4 }); slam('S20-l2', t, C.energ, { from: 2.2, rot: 3 });
};
F.S21 = t => {
  const { a, b } = SH.S21;
  cam('S21-cam', t, [[a, 960, 560, 1.06], [b, 960, 540, 1.0]]);
  for (let i = 0; i < 4; i++) {
    popIn('S21-h' + i, t, a + i * .12); if (t > a + .6) put('S21-h' + i, { s: 1 + (i < 2 ? .04 : .01) * Math.sin(t * 30 + i), o: 1 });
    for (let k = 0; k < 3; k++) { const ph = ((t - a) * 2 + k / 3) % 1; $('S21-h' + i + '-w' + k).setAttribute('opacity', t < a + .5 ? 0 : (i < 2 ? 1 - ph : (k === 0 ? .35 * (1 - ph) : 0))); }
    popIn('S21-m' + i, t, C.apix - .4 + i * .08); $('S21-mf' + i).setAttribute('width', (i < 2 ? 410 : 70) * eOut(P(t, C.apix - .2, C.apix + .6)));
  }
  slam('S21-l', t, C.apix, { from: 2.2, rot: -4 }); slam('S21-l2', t, C.alloi, { from: 1.8 });
};
F.S22 = t => {
  const { a, b } = SH.S22;
  cam('S22-cam', t, [[a, 960, 440, 1.1], [C.epam, 960, 540, 1.0], [b, 960, 560, 1.04]]);
  slide('S22-ban', t, a, .4, 0, -300); $('S22-cloth').setAttribute('transform', `scale(1,${Math.max(.02, eBack(P(t, a + .2, a + .8), 1.4))})`);
  drop('S22-d', t, C.epam - .35, { h: 900 }); idle('s22d', t, 0, 1.2); expr('s22d', blinkAt(t, [C.epam + 1.3]) ? 'blink' : (t > C.epam + .4 ? 'happy' : 'neutral'));
  slam('S22-n', t, C.epam + .35, { from: 2.2, rot: 3 });
};
F.S23 = t => {
  const { a, b } = SH.S23;
  cam('S23-cam', t, [[a, 560, 600, 1.1], [C.koin25, 620, 560, 1.04], [C.eksyn - .3, 1300, 560, 1.02], [b, 1100, 540, 1.04]]);
  if (t < a) op('S23-v', 0); else put('S23-v', { sy: lerp(.45, 1, eBack(P(t, C.koin25 - .1, C.koin25 + .5), 2)), o: 1 });
  const tr = t > C.eksyn; put('S23-cart', { dx: (t - a) * 30, o: tr ? 1 - P(t, C.eksyn, C.eksyn + .15) : 1 });
  if (!tr) op('S23-loco', 0); else put('S23-loco', { dx: (t - a) * 30 + 140 * eIn(P(t, C.eksyn + .4, b)), s: eBack(P(t, C.eksyn, C.eksyn + .35)), o: 1 });
  for (let i = 0; i < 3; i++) { const ph = ((t - C.eksyn) * 1.2 + i / 3) % 1; if (!tr) { op('S23-sm' + i, 0); continue; } put('S23-sm' + i, { dx: (t - a) * 30 + 140 * eIn(P(t, C.eksyn + .4, b)) - 40 * ph, dy: -200 * ph, s: .6 + ph, o: 1 - ph }); }
  idle('s23d', t, 0, 1.2); expr('s23d', 'happy'); popIn('S23-d', t, a);
  slam('S23-l', t, C.koin25, { from: 2 }); slam('S23-l2', t, C.eksyn, { from: 2.2, rot: -4 });
};
F.S24 = t => {
  const { a, b } = SH.S24;
  cam('S24-cam', t, [[a, 960, 560, 1.06], [C.dioik, 960, 540, 1.0], [b, 1100, 540, 1.08]]);
  const T0 = [a, C.dioik - .1, C.dioik + .45];
  for (let i = 0; i < 3; i++) { popIn('S24-c' + i, t, T0[i], { rot: [-6, 4, -4][i] }); slam('S24-t' + i, t, T0[i] + .1, { from: 1.8 }); }
  draw('S24-ar', t, T0[0] + .3, .7); $('S24-gear').setAttribute('transform', `rotate(${t > T0[1] ? (t - T0[1]) * 90 : 0})`);
  slam('S24-l', t, C.metar, { from: 2.2, rot: -4 });
};
F.S25 = t => {
  const { a, b } = SH.S25, A = PP.athens; waves('S25', t);
  cam('S25-cam', t, [[a, A[0], A[1], 1.5], [C.exapl, A[0] + 120, A[1] - 160, 1.0], [b, A[0] + 160, A[1] - 180, .96]]);
  ['ioan', 'lar', 'thess', 'kpoli', 'smyrna', 'crete'].forEach((k, i) => { const t0 = C.exapl - .2 + i * .17; fly('S25-bk' + i, t, t0, .9, A[0], A[1], PP[k][0], PP[k][1], 140, { s: 1, r: 360 }); if (t > t0 + .9) put('S25-bk' + i, { x: PP[k][0], y: PP[k][1] + bob(t, 3, 6, i), o: 1 }); });
  put('S25-ath', { s: 1 + .2 * Math.sin(t * 6) });
  slam('S25-l', t, C.polit27, { from: 2.2, rot: -4 }); slam('S25-l2', t, C.othom, { from: 2, rot: 3 });
};
F.S26 = t => {
  const { a, b } = SH.S26;
  cam('S26-cam', t, [[a, 960, 560, 1.08], [C.polit28, 760, 540, 1.02], [C.logion, 960, 540, 1.02], [C.axiom, 1160, 540, 1.02], [b, 960, 540, 1.0]]);
  slam('S26-ban', t, C.eklek, { from: 1.8, rot: -3 });
  const ids = ['a', 'b', 'c'], T0 = [C.polit28, C.logion, C.axiom - .1];
  for (let i = 0; i < 3; i++) { drop('S26-' + ids[i], t, T0[i] - .35, { h: 800 }); idle('s26' + ids[i], t, i * .3); slam('S26-t' + i, t, T0[i], { from: 1.8 }); }
  for (let i = 0; i < 3; i++) { popIn('S26-pz' + i, t, C.eterok + i * .12, { rot: 40 }); if (t > C.eterok + .6) put('S26-pz' + i, { r: bob(t, 4, 12, i * 2), dx: bob(t, 3, 10, i), o: 1 }); }
  slam('S26-l', t, C.eterok, { from: 2, rot: 3 });
};
F.S27 = t => {
  const { a, b } = SH.S27;
  cam('S27-cam', t, [[a, 760, 560, 1.04], [C.mesol, 760, 540, 1.0], [C.stath31 - .7, 760, 540, 1.0], [C.stath31 - .1, 2300, 560, 1.04], [b, 2320, 540, 1.06]]);
  const lev = eOut(P(t, C.mesol, C.mesol + .8));
  put('S27-see', { r: (1 - lev) * 11 * Math.sin(t * 2.4) });
  const w = P(t, a + .2, C.mesol);
  if (t < a + .2) op('S27-e', 0); else put('S27-e', { x: lerp(-100, 760, w), dy: w < 1 ? hop(t, 0, 10) : 0, o: 1 });
  idle('s27e', t, 0, 1.2); expr('s27e', t > C.mesol ? 'happy' : 'neutral');
  const steady = P(t, C.stath31, C.stath31 + .4);
  put('S27-tab', { r: (1 - steady) * 5 * Math.sin(t * 14) }); idle('s27e2', t, .5, 1.2); expr('s27e2', t > C.stath31 ? 'happy' : 'strain');
  slam('S27-l', t, C.metrio, { from: 2.2, rot: -4 }); slam('S27-l2', t, C.mesol, { from: 2, rot: 3 }); fadeOut('S27-l2', t, C.stath31 - .7);
  slam('S27-l3', t, C.stath31, { from: 2.2, rot: -3 });
};
F.S28 = t => {
  const { a, b } = SH.S28;
  cam('S28-cam', t, [[a, 760, 560, 1.04], [C.emfyl - .6, 760, 540, 1.0], [C.emfyl - .1, 2400, 560, 1.0], [b, 2400, 540, 1.06]]);
  const spin = (t - a) * (90 + 120 * P(t, a, C.emfyl)); popIn('S28-rot', t, a);
  for (let i = 0; i < 4; i++) { const g = spin + i * 90; $('S28-ch' + i).setAttribute('transform', `rotate(${g}) translate(300,0) rotate(${-g}) translate(0,130) scale(.7)`); }
  for (let i = 0; i < 3; i++) {
    const p = eOut(P(t, C.emfyl - .2, C.emfyl + .6));
    put('S28-a' + i, { dx: 60 * p + (t > C.emfyl ? bob(t, 18, 6, i) : 0), r: 7 * p, o: 1 }); put('S28-b' + i, { dx: -60 * p + (t > C.emfyl ? bob(t, 18, 6, i + 3) : 0), sx: -1, r: -7 * p, o: 1 });
    idle('s28a' + i, t, i * .3, 1.5); idle('s28b' + i, t, i * .3 + .2, 1.5); expr('s28a' + i, 'angry'); expr('s28b' + i, 'angry');
  }
  popIn('S28-fa', t, C.emfyl - .3); popIn('S28-fb', t, C.emfyl - .2);
  for (let i = 0; i < 5; i++) { popIn('S28-sm' + i, t, C.emfyl + i * .1); if (t > C.emfyl + .5) put('S28-sm' + i, { s: 1 + .12 * Math.sin(t * 4 + i), dy: -20 * (t - C.emfyl), o: 1 }); }
  slam('S28-l', t, C.asta32, { from: 2.2, rot: -4 }); fadeOut('S28-l', t, C.emfyl - .6); slam('S28-l2', t, C.emfyl, { from: 2.6, rot: 5 });
};
F.S29 = t => {
  const { a, b } = SH.S29;
  cam('S29-cam', t, [[a, 960, 580, 1.06], [C.xron33, 900, 540, 1.0], [C.psif33 - .3, 1200, 540, 1.02], [b, 1200, 520, 1.06]]);
  for (let i = 0; i < 3; i++) {
    popIn('S29-d' + i, t, a + i * .08); idle('s29d' + i, t, i * .4, .8);
    expr('s29d' + i, t > C.psif33 + .2 ? 'happy' : (t > C.dyo33 && Math.floor((t - C.dyo33) * 1.3 + i) % 3 === 0 ? 'yawn' : 'neutral'));
    op('S29-bd' + i, clamp((t - C.xron33 - i * .2) / .4));
  }
  op('S29-web', clamp((t - C.dyo33 - .3) / .5));
  for (let i = 0; i < 6; i++) { const t0 = C.dyo33 + i * .25, p = P(t, t0, t0 + .7); put('S29-pg' + i, { dx: 600 * p, dy: -520 * p, r: 220 * p, o: t < t0 ? 0 : 1 - p }); }
  popIn('S29-sc', t, C.psif33 - .2); popIn('S29-tk', t, C.psif33 + .2, { rot: -20 });
  slam('S29-l', t, C.dyo33, { from: 2.2, rot: -4 }); slam('S29-l2', t, C.psif33, { from: 1.8 });
};
F.S30 = t => {
  const { a, b } = SH.S30;
  cam('S30-cam', t, [[a, 760, 580, 1.06], [C.dimok, 760, 520, 1.0], [C.anti34 - .2, 1100, 520, 1.0], [b, 1100, 540, 1.04]]);
  for (let i = 0; i < 4; i++) { drop('S30-p' + i, t, a + i * .06, { h: 400, fall: .22 }); idle('s30p' + i, t, i * .3, 1.2); expr('s30p' + i, t > C.dimok ? 'happy' : 'neutral'); }
  slide('S30-cush', t, C.vasil34 - .55, .5, 0, -900); slide('S30-cr', t, C.vasil34 - .45, .5, 0, -960);
  if (t > C.vasil34) { put('S30-cush', { dy: bob(t, 3, 5), o: 1 }); put('S30-cr', { dy: bob(t, 3, 5), r: bob(t, 2, 2), o: 1 }); }
  popIn('S30-old', t, C.anti34); if (t < C.synmon) op('S30-x', 0); else put('S30-x', { sx: Math.max(.01, eOut(P(t, C.synmon, C.synmon + .25))), r: -8, o: 1 });
  slam('S30-l0', t, C.polit34, { from: 2 }); slam('S30-l', t, C.vasil34, { from: 2.2, rot: -4 }); slam('S30-l2', t, C.anti34, { from: 1.8 });
};
F.S31 = t => {
  const { a, b } = SH.S31;
  cam('S31-cam', t, [[a, 960, 600, 1.1], [C.laik, 960, 520, 1.0], [b, 960, 500, 1.04]]);
  put('S31-rays', { r: t * 10, o: eOut(P(t, C.laik, C.laik + .6)) });
  if (t < a) op('S31-sc', 0); else put('S31-sc', { dy: 520 * (1 - eBack(P(t, C.laik - .4, C.laik + .25), 1.6)), o: 1 });
  for (let i = 0; i < 5; i++) { popIn('S31-p' + i, t, a + i * .06); idle('s31p' + i, t, i * .3, 1.4); expr('s31p' + i, t > C.laik ? 'happy' : 'neutral'); }
  slam('S31-l0', t, C.katox, { from: 2 }); slam('S31-l', t, C.laik, { from: 2.4, rot: -5 });
};
F.S32 = t => {
  const { a, b } = SH.S32;
  cam('S32-cam', t, [[a, 800, 580, 1.06], [C.myst, 1000, 540, 1.0], [b, 1000, 520, 1.04]]);
  popIn('S32-box', t, a); op('S32b-ball', 0);
  const go = eIO(P(t, C.myst - .2, C.myst + .5));
  if (t < a) op('S32-v', 0); else put('S32-v', { dx: 170 * go, dy: go > 0 && go < 1 ? hop(t, 0, 10) : 0, o: 1 });
  idle('s32v', t, 0, 1.2); expr('s32v', t > C.amesi ? 'happy' : 'neutral');
  // ONE lead ball, shown high (the committee must see it), then into the tube — nobody sees which side
  const hx = 680 + 170 * go, hy = 640;
  if (t < C.amesi - .3) op('S32-ball', 0);
  else if (t < C.psifos - .4) put('S32-ball', { x: hx, y: hy + bob(t, 5, 6), s: eBack(P(t, C.amesi - .3, C.amesi)), o: 1 });
  else { const p = eIn(P(t, C.psifos - .4, C.psifos)); put('S32-ball', { x: lerp(hx, 1060, p), y: lerp(hy, 330, p) + 60 * P(t, C.psifos, C.psifos + .2), o: 1 - P(t, C.psifos, C.psifos + .2) }); }
  const T0 = [C.amesi, C.myst, C.kathol, C.andr];
  for (let i = 0; i < 4; i++) { popIn('S32-t' + i, t, T0[i], { rot: i % 2 ? 6 : -6 }); if (t > T0[i] + .4) put('S32-t' + i, { dy: bob(t, 2.4, 4, i), o: 1 }); }
  slam('S32-l', t, C.psifos, { from: 2.2, rot: -4 });
};
F.S33 = t => {
  const { a, b } = SH.S33;
  cam('S33-cam', t, [[a, 640, 580, 1.04], [C.eleft38 - .45, 640, 540, 1.0], [C.eleft38 + .2, 2175, 560, 1.0], [b, 2175, 540, 1.06]]);
  popIn('S33-bal', t, a); $('beam').setAttribute('transform', `rotate(${bob(t, 1.5, 3)},0,-300)`);
  const BRK = C.dikai + .1, br = t > BRK, fall = t - BRK;
  put('S33-cr', { dx: br ? -300 * eOut(P(t, BRK, BRK + .6)) : 0, dy: br ? -200 * eOut(P(t, BRK, BRK + .6)) : bob(t, 3, 4), r: br ? -40 * P(t, BRK, BRK + .6) : 0, o: br ? 1 - P(t, BRK + .3, BRK + .7) : 1 });
  for (let i = 0; i < 5; i++) put('S33-ln' + i, { dy: br ? 900 * fall * fall : 0, r: br ? (i - 2) * 80 * fall : i * 30, o: 1 });
  const XS = [-500, -350, 350, 500];
  for (let i = 0; i < 4; i++) { const p = eOut(P(t, C.synerx - .45 + i * .05, C.synerx + .2)); put('S33-p' + i, { dx: XS[i] * (1 - p), dy: p < 1 ? hop(t, i, 10) : 0, o: t < C.eleft38 - .4 ? 0 : 1 }); idle('s33p' + i, t, i * .3, 1.3); expr('s33p' + i, t > C.synet ? 'happy' : 'neutral'); }
  popIn('S33-ring', t, C.synet); if (t > C.synet + .4) put('S33-ring', { s: 1 + .03 * Math.sin(t * 6), o: 1 });
  slam('S33-l', t, C.anex, { from: 2.2, rot: -4 }); fadeOut('S33-l', t, C.eleft38 - .45);
  slam('S33-l2', t, C.synerx, { from: 2.2, rot: 3 }); slam('S33-l3', t, C.synet, { from: 1.8 });
};
F.S34 = t => {
  const { a, b } = SH.S34;
  cam('S34-cam', t, [[a, 960, 580, 1.08], [C.anoige, 960, 540, 1.02], [b, 960, 520, 1.06]]);
  put('S34-bar', { r: -80 * eOut(P(t, C.anoige, C.anoige + .6)) });
  const LX = [520, 800, 1120, 1400];
  for (let i = 0; i < 4; i++) { const t0 = C.dromo + i * .35, p = eOut(P(t, t0, t0 + 2.2)); if (t < t0) { op('S34-f' + i, 0); continue; } put('S34-f' + i, { x: lerp(960, LX[i], p), y: lerp(790, 1060, p) + hop(t, i, 8 * p), s: lerp(.25, 1, p), r: bob(t, 3, 3, i), o: 1 }); }
  slam('S34-l', t, C.anoige, { from: 2.2, rot: -4 }); slam('S34-l2', t, C.eleft39, { from: 2 });
};
F.S35 = t => {
  const { a, b } = SH.S35;
  cam('S35-cam', t, [[a, 960, 580, 1.06], [C.ekfr, 960, 540, 1.0], [b, 1040, 540, 1.04]]);
  for (let i = 0; i < 4; i++) { popIn('S35-p' + i, t, a + i * .08); idle('s35p' + i, t, i * .3, 1.3); expr('s35p' + i, 'happy'); }
  for (let i = 0; i < 5; i++) { const t0 = C.ekfr - .6 + i * .3; const p = fly('S35-bb' + i, t, t0, .8, 200 + i * 60, 560, 780, 560, 60, { s: .8 }); if (p >= 1) op('S35-bb' + i, 0); }
  popIn('S35-mg', t, a + .2); if (t > C.ekfr) put('S35-mg', { s: 1 + .04 * Math.sin(t * 28), o: 1 });
  for (let k = 0; k < 3; k++) { const ph = ((t - C.ekfr) * 2 + k / 3) % 1; $('S35-mw-w' + k).setAttribute('opacity', t < C.ekfr ? 0 : 1 - ph); }
  popIn('S35-v', t, a + .1);
  slam('S35-l', t, C.apar, { from: 2.2, rot: -4 }); slam('S35-l2', t, C.ekfr + .4, { from: 1.8 });
};
F.S36 = t => {
  const { a, b } = SH.S36;
  cam('S36-cam', t, [[a, 960, 580, 1.04], [C.synom - .2, 860, 560, 1.06], [C.via - .4, 1060, 560, 1.06], [b, 960, 540, 1.0]]);
  popIn('S36-sp', t, a);
  for (let i = 0; i < 4; i++) { const g = t * 1.4 + i * Math.PI / 2; if (t < a) { op('S36-h' + i, 0); continue; } put('S36-h' + i, { x: 420 + Math.cos(g) * 150, y: 860 + Math.sin(g) * 30, s: (.85 + .1 * Math.sin(g)) * eBack(P(t, a + .05, a + .4)), o: 1 }); }
  popIn('S36-cl', t, C.via - .5); if (t > C.via - .1) put('S36-cl', { dx: bob(t, 31, 10), dy: bob(t, 27, 8), o: 1 });
  popIn('S36-x0', t, C.synom + .6, { rot: 30 }); popIn('S36-x1', t, C.via, { rot: 30 });
  slam('S36-l', t, C.synom, { from: 2 }); slam('S36-l2', t, C.via - .1, { from: 2 });
};
F.S37 = t => {
  const { a, b } = SH.S37;
  cam('S37-cam', t, [[a, 960, 600, 1.1], [C.antid, 900, 540, 1.0], [b, 900, 520, 1.06]]);
  popIn('S37-th', t, a); const ld = drop('S37-g', t, a + .05, { h: 900 }); idle('s37g', t, 0, t > C.antid ? 2 : 1);
  expr('s37g', t > C.antid ? 'angry' : 'neutral'); if (ld && t > C.antid) put('S37-g', { dy: -Math.abs(Math.sin((t - C.antid) * 9)) * 22, sx: 1 + .03 * Math.sin(t * 18), o: 1 });
  for (let i = 0; i < 3; i++) { const ph = ((t - C.antid) * 1.5 + i / 3) % 1; if (t < C.antid + .2) { op('S37-st' + i, 0); continue; } put('S37-st' + i, { dy: -180 * ph, s: .6 + ph, o: 1 - ph }); }
  slam('S37-l', t, C.antid, { from: 2.2, rot: -4 }); slam('S37-n', t, C.georg42, { from: 2.2, rot: 3 });
};
F.S38 = t => {
  const { a, b } = SH.S38;
  cam('S38-cam', t, [[a, 960, 580, 1.06], [C.epev, 1100, 540, 1.02], [C.kyv43, 760, 540, 1.04], [b, 960, 540, 1.0]]);
  if (t < C.epev - .4) op('S38-gav', 0); else put('S38-gav', { r: lerp(-70, 0, eIn(P(t, C.epev - .3, C.epev))) - 8 * Math.exp(-6 * Math.max(0, t - C.epev)) * Math.sin((t - C.epev) * 20), o: 1 });
  for (let i = 0; i < 5; i++) { popIn('S38-m' + i, t, a + i * .06); idle('s38m' + i, t, i * .3, 1.3); expr('s38m' + i, t > C.kyv43 ? 'happy' : 'neutral'); }
  for (let i = 0; i < 2; i++) { popIn('S38-n' + i, t, a + .3 + i * .06); idle('s38n' + i, t, i * .3); expr('s38n' + i, t > C.kyv43 ? 'sad' : 'neutral'); }
  slide('S38-ch', t, C.kyv43 - .2, .6, 0, 320); if (t > C.kyv43 + .4) put('S38-ch', { dy: bob(t, 3, 6), o: 1 });
  slam('S38-l', t, C.epev, { from: 2.4, rot: -6 }); slam('S38-l2', t, C.pleio43, { from: 2 }); slam('S38-l3', t, C.kyv43, { from: 1.8 });
};
F.S39 = t => {
  const { a, b } = SH.S39;
  cam('S39-cam', t, [[a, 760, 580, 1.08], [C.saf44, 760, 560, 1.12], [C.dioti, 1000, 540, 1.0], [b, 1060, 540, 1.04]]);
  popIn('S39-doc', t, a); op('S39-fog', clamp((t - C.saf44 + .1) / .5)); $('S39-fog').setAttribute('transform', `translate(${bob(t, 1.3, 24)},${bob(t, 1.7, 8)})`);
  for (let i = 0; i < 2; i++) { popIn('S39-d' + i, t, C.dioti + i * .1); idle('s39d' + i, t, i * .4, 1.3); expr('s39d' + i, t > C.afton ? 'happy' : 'neutral'); }
  popIn('S39-bb', t, C.afton - .1); slam('S39-l', t, a + .15, { from: 1.3 }); slam('S39-l2', t, C.afton, { from: 2.2, rot: -4 });
};
F.S40 = t => {
  const { a, b } = SH.S40;
  cam('S40-cam', t, [[a, 520, 580, 1.08], [C.entoli46, 540, 540, 1.04], [C.vouleft46 - .3, 1100, 540, 1.0], [C.empist46, 1600, 520, 1.06], [C.pleio46, 1700, 540, 1.0], [b, 1300, 540, .82]]);
  idle('s40g', t, 0, 1.2); expr('s40g', t > C.ofeile46 + .6 ? 'neutral' : 'blink');
  if (t < C.vouleft46 - .6) popBob('S40-env', t, C.entoli46, { amp: 5 });
  else fly('S40-env', t, C.vouleft46 - .6, 1.0, 470, 760, 1600, 440, 260, { r: 360 });
  for (let i = 0; i < 5; i++) { idle('s40m' + i, t, i * .3); expr('s40m' + i, t > C.vouleft46 + .4 ? 'happy' : 'neutral'); }
  for (let i = 0; i < 2; i++) idle('s40n' + i, t, i * .3);
  idle('s40lead', t, 0, 1.4); expr('s40lead', t > C.vouleft46 + .4 ? 'happy' : 'neutral'); if (t > C.vouleft46 + .4) put('S40-lead', { dy: hop(t, 0, 14) * (1 - P(t, C.vouleft46 + 1.4, C.vouleft46 + 1.6)), o: 1 });
  popIn('S40-bar', t, C.empist46 - .2); $('S40-fill').setAttribute('width', 750 * .7 * eOut(P(t, C.empist46, C.pleio46 + .3)));
  slam('S40-l', t, C.ofeile46, { from: 2.2, rot: -4 }); slam('S40-l2', t, C.entoli46, { from: 1.8 }); fadeOut('S40-l2', t, C.empist46 - .4);
  slam('S40-l3', t, C.pleio46, { from: 2.2, rot: 3 });
};
const YEL_ = '#FFD54A';
F.S42 = t => {
  const { a, b } = SH.S42;
  cam('S42-cam', t, [[a, 900, 580, 1.06], [C.asaf, 1100, 540, 1.0], [C.dior49, 900, 560, 1.04], [b, 820, 540, 1.08]]);
  put('S42-fog', { dx: bob(t, 1.1, 30), dy: bob(t, 1.6, 10), s: 1 + .03 * Math.sin(t * 2) });
  idle('s42g', t, 0, 1.2); expr('s42g', t > C.dior49 ? 'happy' : 'neutral'); put('S42-g', { r: 6 * Math.sin(Math.PI * P(t, C.ekmet, C.dior49)) });
  popIn('S42-ch', t, a + .1);
  if (t < C.ekmet) op('S42-m', 0); else { const p = eIO(P(t, C.dior49 - .6, C.dior49 + .2)); put('S42-m', { x: lerp(1300, 860, p), y: lerp(700, 830, p) - 160 * Math.sin(Math.PI * p), o: clamp((t - C.ekmet) / .4) }); }
  idle('s42m', t, .4, 1.2); expr('s42m', 'happy');
  for (let i = 0; i < 3; i++) { popIn('S42-h' + i, t, C.aresk + i * .1); if (t > C.aresk + .5) put('S42-h' + i, { dy: bob(t, 3, 8, i), s: 1 + .08 * Math.sin(t * 8 + i), o: 1 }); }
  slam('S42-l', t, C.asaf, { from: 2 }); slam('S42-l2', t, C.aresk, { from: 2.2, rot: -4 });
};
F.S43 = t => {
  const { a, b } = SH.S43; twinkle('S43', t);
  cam('S43-cam', t, [[a, 960, 620, 1.1], [C.dedil50, 960, 580, 1.0], [b, 960, 560, 1.05]]);
  popIn('S43-doc', t, a); slam('S43-st', t, C.dedil50, { from: 2.8, rot: -12 });
  slam('S43-l', t, C.psif50, { from: 1.8 }); slam('S43-d', t, C.y1875, { from: 2.6, rot: -6 });
};
F.S44 = t => {
  const { a, b } = SH.S44;
  cam('S44-cam', t, [[a, 960, 620, 1.1], [C.trik51, 1060, 540, 1.0], [b, 1060, 520, 1.04]]);
  drop('S44-t', t, a, { h: 500, fall: .24 }); idle('s44t', t, 0, 1.2); expr('s44t', blinkAt(t, [C.trik51 + .9]) ? 'blink' : (t > C.idea + .4 ? 'happy' : 'neutral'));
  popIn('S44-bulb', t, C.idea + .15, { rot: -15 }); if (t > C.idea + .6) put('S44-bulb', { s: 1 + .05 * Math.sin(t * 9), dy: bob(t, 2.5, 6), o: 1 });
  slam('S44-l', t, C.idea, { from: 2.2, rot: -4 }); slam('S44-n', t, C.trik51, { from: 2.2, rot: 3 }); slam('S44-l2', t, C.neo51, { from: 1.8 });
};
F.S45 = t => {
  const { a, b } = SH.S45;
  cam('S45-cam', t, [[a, 460, 580, 1.1], [C.dimos52, 540, 540, 1.02], [C.asta52 - .3, 1100, 540, 1.0], [C.dyo52, 1050, 540, 1.0], [b, 940, 530, 1.02]]);
  idle('s45t', t, 0, 1.2); expr('s45t', t > C.dimos52 ? 'happy' : 'neutral'); popIn('S45-t', t, a);
  popIn('S45-np', t, C.dimos52); if (t > C.dimos52 + .4) put('S45-np', { r: bob(t, 2, 3), o: 1 });
  const PX = [1050, 1050, 1050, 1450, 1450, 1450];
  for (let i = 0; i < 6; i++) {
    const t0 = C.moni + i * .08; if (t < t0) { op('S45-c' + i, 0); continue; }
    const m = eIn(P(t, C.dyo52 - .1, C.dyo52 + .4));
    put('S45-c' + i, { x: lerp(950 + i * 130, PX[i], m), dy: -200 * m, s: eBack(P(t, t0, t0 + .3)) * (1 - .7 * m), r: t > C.asta52 ? 9 * Math.sin(t * 13 + i) * (1 - m) : 0, o: 1 - P(t, C.dyo52 + .3, C.dyo52 + .45) });
  }
  for (let i = 0; i < 2; i++) slide('S45-p' + i, t, C.dyo52 + .3 + i * .1, .5, 0, 600);
  slam('S45-l0', t, C.dimos52, { from: 2 }); slam('S45-l', t, C.asta52, { from: 2, rot: 3 }); fadeOut('S45-l', t, C.dyo52);
  slam('S45-l2', t, C.dyo52 + .1, { from: 2.2, rot: -4 });
};
F.S46 = t => {
  const { a, b } = SH.S46;
  cam('S46-cam', t, [[a, 960, 600, 1.1], [b, 960, 540, 1.02]]);
  slide('S46-h', t, a, .5, 0, 400); slide('S46-bA', t, a + .15, .4, -800, 0); slide('S46-bB', t, a + .15, .4, 800, 0);
  drop('S46-jb', t, a + .05, { h: 800 }); idle('s46jb', t, 0, 1.2); expr('s46jb', 'happy');
  popIn('S46-fl', t, C.protyp - .1); if (t > C.protyp + .3) put('S46-fl', { r: bob(t, 3, 2), o: 1 });
  slam('S46-l', t, C.protyp, { from: 2.2, rot: -4 });
};
F.S47 = t => {
  const { a, b } = SH.S47;
  cam('S47-cam', t, [[a, 520, 580, 1.08], [C.anath, 600, 540, 1.02], [C.mono55 - .3, 1000, 540, 1.0], [b, 1100, 520, 1.04]]);
  popIn('S47-g', t, a); idle('s47g', t, 0, 1.2); expr('s47g', 'neutral');
  popBob('S47-env', t, a + .1, { amp: 5 }); if (t > C.mono55) put('S47-env', { dx: 30 * Math.sin((t - C.mono55) * 12) * Math.exp(-2 * (t - C.mono55)), o: 1 });
  popIn('S47-gate', t, a + .1); popIn('S47-door', t, a + .15);
  for (let i = 0; i < 3; i++) { drop('S47-q' + i, t, a + .2 + i * .1, { h: 700 }); idle('s47q' + i, t, i * .3); expr('s47q' + i, t > C.mono55 ? 'shock' : 'neutral'); }
  slam('S47-l', t, C.anath, { from: 2.2, rot: -4 }); slam('S47-l2', t, C.mono55, { from: 2.4, rot: 4 });
};
F.S48 = t => {
  const { a, b } = SH.S48;
  cam('S48-cam', t, [[a, 800, 580, 1.06], [C.dedil55, 800, 540, 1.0], [b, 1000, 540, 1.04]]);
  for (let i = 0; i < 7; i++) {
    const up = t > C.dedil55 + i * .08; op('S48-d' + i, t < a ? 0 : (up ? 0 : 1)); op('S48-u' + i, up ? 1 : 0);
    idle('s48d' + i, t, i * .25); idle('s48u' + i, t, i * .25, 1.4); expr('s48u' + i, 'happy');
    if (up) put('S48-u' + i, { dy: -14 * Math.exp(-6 * (t - C.dedil55 - i * .08)), o: 1 });
  }
  popIn('S48-bar', t, C.safos - .2); $('S48-fill').setAttribute('width', 750 * .72 * eOut(P(t, C.dedil55, C.pleio55)));
  popIn('S48-tk', t, C.pleio55, { rot: -20 });
  popIn('S48-p', t, a + .1); idle('s48p', t, 0, 1.2); expr('s48p', t > C.pleio55 + .3 ? 'happy' : 'neutral');
  fly('S48-env', t, C.pleio55 - .2, .6, 300, 560, 1620, 490, 200, { r: 360 });
  slam('S48-l', t, C.dedil55, { from: 2.2, rot: -4 }); slam('S48-l2', t, C.safos, { from: 1.8 });
};
F.S49 = t => {
  const { a, b } = SH.S49;
  cam('S49-cam', t, [[a, 1100, 580, 1.06], [C.ster, 1100, 540, 1.02], [C.meio, 760, 540, 1.02], [b, 960, 540, 1.0]]);
  popIn('S49-door', t, a); slam('S49-lock', t, C.ster, { from: 2.4, rot: -10 });
  for (let i = 0; i < 3; i++) {
    popIn('S49-s' + i, t, a + .2 + i * .08);
    const w = eIO(P(t, C.meio - .3, C.dyn56)), knock = t > C.dyn56 ? 80 * eOut(P(t, C.dyn56, C.dyn56 + .3)) : 0;
    if (t > a + .6) put('S49-s' + i, { dx: 560 * w - knock * (1 + i * .2), dy: w > 0 && w < 1 ? hop(t, i, 10) : 0, o: 1 });
    idle('s49s' + i, t, i * .3); expr('s49s' + i, t > C.dyn56 ? 'sad' : 'neutral');
  }
  popIn('S49-x', t, C.dyn56, { rot: 30 });
  slam('S49-l2', t, C.ster, { from: 2.2, rot: -4 }); slam('S49-l', t, C.meio, { from: 1.8 });
};
F.S50 = t => {
  const { a, b } = SH.S50;
  cam('S50-cam', t, [[a, 960, 580, 1.04], [C.synen, 960, 540, 1.0], [C.stath57 - .8, 960, 540, 1.0], [C.stath57 - .1, 2500, 560, 1.04], [b, 2500, 540, 1.08]]);
  const DST = [560, 560, 1360, 1360], SX = [240, 860, 1060, 1680];
  let gA = 0, gB = 0;
  for (let i = 0; i < 4; i++) {
    const t0 = C.synen - .3 + i * .15, p = eIn(P(t, t0, t0 + .7));
    popIn('S50-s' + i, t, a + i * .08);
    if (t > a + .5) put('S50-s' + i, { x: lerp(SX[i], DST[i], p), dy: p > 0 ? -Math.abs(Math.sin(p * Math.PI * 3)) * 40 : bob(t, 3, 5, i), r: (DST[i] > SX[i] ? 1 : -1) * 360 * p, o: p >= 1 ? 0 : 1 });
    if (p >= 1) { if (DST[i] === 560) gA++; else gB++; }
  }
  popIn('S50-A', t, a); popIn('S50-B', t, a + .1);
  if (t > a + .5) { put('S50-A', { s: 1 + .14 * gA + .03 * Math.sin(t * 4), o: 1 }); put('S50-B', { s: 1 + .14 * gB + .03 * Math.sin(t * 4 + 1), o: 1 }); }
  popIn('S50-tab', t, a); for (const k of ['A', 'B']) put('S50-t' + k, { dy: bob(t, 3, 4, k === 'A' ? 0 : 1) });
  slam('S50-l', t, C.synen, { from: 2.2, rot: -4 }); fadeOut('S50-l', t, C.stath57 - .8); slam('S50-l2', t, C.stath57, { from: 2.2, rot: 3 });
};
F.S51 = t => {
  const { a, b } = SH.S51;
  cam('S51-cam', t, [[a, 760, 580, 1.06], [C.piesi, 860, 540, 1.0], [C.anavr, 1060, 540, 1.0], [b, 1060, 520, 1.04]]);
  if (t < a) op('S51-wl', 0); else put('S51-wl', { dx: -500 * (1 - eOut(P(t, C.antip - .3, C.antip + .3))), o: 1 });
  popIn('S51-g', t, a); idle('s51g', t, 0, 1.5); expr('s51g', t > C.piesi ? 'strain' : 'neutral');
  if (t > C.antip) put('S51-g', { sx: 1 - .08 * P(t, C.antip, C.antip + .4), dx: 20 * P(t, C.antip, C.antip + .4), o: 1 });
  put('S51-pr', { dy: 150 * eOut(P(t, C.piesi - .3, C.anavr + .6)) });
  $('S51-ndl').setAttribute('transform', `rotate(${-120 + 210 * eOut(P(t, C.piesi, C.anavr + .6)) + (t > C.anavr ? Math.sin(t * 25) * 4 : 0)})`); popIn('S51-ga', t, a + .1);
  if (t < a) op('S51-cau', 0); else put('S51-cau', { dx: 900 * (1 - eOut(P(t, C.anavr - .6, C.anavr))), dy: t > C.anavr ? bob(t, 20, 4) : 0, o: 1 });
  for (let i = 0; i < 5; i++) { const ph = ((t - C.anavr) * 1.4 + i / 5) % 1; if (t < C.anavr) { op('S51-st' + i, 0); continue; } put('S51-st' + i, { dy: -220 * ph, s: .5 + ph, o: 1 - ph }); }
  slam('S51-l', t, C.piesi, { from: 2.2, rot: -4 }); slam('S51-l2', t, C.anavr, { from: 2, rot: 3 });
};
F.S52 = t => {
  const { a, b } = SH.S52;
  cam('S52-cam', t, [[a, 960, 580, 1.08], [C.yiot, 960, 540, 1.0], [b, 960, 520, 1.04]]);
  popIn('S52-g', t, a); popIn('S52-t', t, a + .08); idle('s52g', t, 0, 1.2); idle('s52t', t, .4, 1.2);
  expr('s52g', t > C.yiot + .3 ? 'happy' : 'neutral'); expr('s52t', 'happy');
  popBob('S52-pp', t, a + .2, { amp: 5 }); popIn('S52-st', t, C.yiot + .15, { rot: -25 });
  slam('S52-l', t, C.yiot, { from: 2.4, rot: -5 });
};
F.S53 = t => {
  const { a, b } = SH.S53;
  cam('S53-cam', t, [[a, 960, 520, 1.08], [C.tomi, 960, 500, 1.04], [C.metav, 960, 560, 1.0], [b, 960, 560, 1.06]]);
  slide('S53-rib', t, a, .4, 0, -300); if (t > C.metav - .3) put('S53-rib', { o: 1 - P(t, C.metav - .3, C.metav + .2) }); slide('S53-sc', t, a + .1, C.tomi - a - .4, -900, 0);
  const chop = t < C.tomi ? Math.abs(Math.sin((t - a) * 8)) * 22 : 0;
  $('bladeA').setAttribute('transform', `rotate(${-chop})`); $('bladeB').setAttribute('transform', `rotate(${chop})`);
  if (t > C.tomi) put('S53-sc', { dy: -400 * eIn(P(t, C.tomi + .3, C.tomi + .8)), o: 1 - P(t, C.tomi + .5, C.tomi + .8) });
  const sp = eOut(P(t, C.tomi, C.tomi + .6));
  $('S53-ra').setAttribute('transform', `translate(${-60 * sp},${30 * sp}) rotate(${-6 * sp})`); $('S53-rb').setAttribute('transform', `translate(${60 * sp},${30 * sp}) rotate(${6 * sp})`);
  const ch = eIO(P(t, C.metav - .2, C.metav + .8));
  for (let i = 0; i < 7; i++) put('S53-hl' + i, { sy: Math.max(.01, 1 - ch), dy: bob(t, 2, 3, i) * (1 - ch) });
  for (let i = 0; i < 2; i++) slide('S53-M' + i, t, C.metav + i * .15, .8, 0, 700);
  slam('S53-l', t, C.tomi, { from: 2.6, rot: -6 }); fadeOut('S53-l', t, C.metav - .3); slam('S53-l2', t, C.metav, { from: 2.2, rot: 3 });
  op('S53-black', P(t, C.end + .6, C.end + 2.0));
};
