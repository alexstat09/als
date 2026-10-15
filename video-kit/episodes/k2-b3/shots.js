// Κεφ.2 Β.3 — per-shot animation (browser, after engine/runtime.js). seek(t) is PURE.
// ⚠️ No literal seconds: everything is a cue (C.*) or a shot bound (SH.Sx.a / .b), so a new voice re-times it all.
const SH = {}; D.shots.forEach(s => { SH[s.id] = s; });
const bob = (t, f = 2, a = 8, ph = 0) => Math.sin(t * f + ph) * a;
const fadeOut = (id, t, t0, d = .25) => { if (t > t0) put(id, { o: 1 - P(t, t0, t0 + d) }); };
const hop = (t, i, a = 10) => -Math.abs(Math.sin(q15(t) * 6 + i)) * a;
const popBob = (id, t, t0, o = {}) => { popIn(id, t, t0, o); if (t > t0 + (o.dur ?? .38)) put(id, { dy: bob(t, 2, o.amp ?? 6, o.ph ?? 0), o: 1 }); };
const fly = (id, t, t0, d, x0, y0, x1, y1, h = 120, o = {}) => {
  if (t < t0) { op(id, 0); return 0; }
  const p = eIO(P(t, t0, t0 + d)); put(id, { x: lerp(x0, x1, p), y: lerp(y0, y1, p) - h * Math.sin(Math.PI * p), s: o.s ?? 1, r: (o.r ?? 0) * p, o: 1 }); return p;
};
const people = (ids, t, ex = 'neutral', amp = 1.2) => ids.forEach((id, i) => { idle(id, t, i * .37, amp); expr(id, ex); });

[[C.parak, 8], [C.vios, 8], [C.diam + .1, 14], [C.istor, 8], [C.them + .3, 14], [C.stam, 8], [C.entas, 12], [C.dysl17, 10], [C.antip, 12], [C.kritik, 8],
 [C.avli + .3, 10], [C.vasil24 + .3, 14], [C.atal, 12], [C.y1850, 10], [C.dysar26, 12], [C.y1862a, 12], [C.epan33, 18, .5], [C.apom, 10], [C.adik, 8], [C.y1862b, 12]].forEach(a => shk(...a));
[C.epan33, C.y1862b].forEach(t => fl(t, .35));

F.S1 = t => {
  const { a, b } = SH.S1;
  cam('S1-cam', t, [[a, 960, 600, 1.1], [C.t2, 960, 560, 1.02], [b, 960, 540, 1.05]]);
  slide('S1-fo', t, a, .7, -900, 0); slide('S1-fy', t, a + .15, .7, 900, 0);
  idle('s1o', t, 0, 1); idle('s1y', t, .5, 1); expr('s1o', 'neutral'); expr('s1y', t > C.t2 ? 'happy' : 'neutral');
  slam('S1-t1', t, C.t1 + .1, { from: 2.6, rot: -8 }); slam('S1-t2', t, C.t2, { from: 2.2, rot: 4 });
};
F.S2 = t => {
  const { a, b } = SH.S2;
  cam('S2-cam', t, [[a, 960, 520, 1.06], [b, 960, 560, 1.0]]);
  const p = eOut(P(t, C.parak, C.parak + .9));
  for (let i = 0; i < 3; i++) { put('S2-f' + i, { r: 3 + p * (12 + i * 3), o: 1 }); op('S2-g' + i, p * .85); }
  for (let i = 0; i < 3; i++) slide('S2-o' + i, t, a + i * .08, .4, 0, 400);
  people(['s2o0', 's2o1', 's2o2'], t, t > C.parak ? 'sad' : 'neutral');
  slam('S2-l0', t, a + .05, { from: 1.4 }); slam('S2-l', t, C.parak, { from: 2.2, rot: -5 });
};
F.S3 = t => {
  const { a, b } = SH.S3;
  cam('S3-cam', t, [[a, 960, 600, 1.08], [C.nea2, 960, 560, 1.02], [b, 960, 540, 1.04]]);
  put('S3-sun', { dy: 260 * (1 - eOut(P(t, a, a + 1.6))), r: t * 6, o: 1 });
  for (let i = 0; i < 4; i++) { slide('S3-y' + i, t, a + .1 + i * .1, .5, 0, 420); }
  people(['s3y0', 's3y1', 's3y2', 's3y3'], t, t > C.nea2 ? 'happy' : 'neutral', 1.4);
  for (let i = 0; i < 4; i++) popBob('S3-b' + i, t, C.noot2 + i * .07, { amp: 6, ph: i });
  for (let i = 0; i < 4; i++) { draw('S3-r' + i, t, C.katav + i * .06, .5); draw('S3-rb' + i, t, C.katav + .15 + i * .06, .5); }
  slam('S3-l', t, C.nea2, { from: 2.3, rot: -4 }); slam('S3-l2', t, C.noot2, { from: 1.8 }); slam('S3-l3', t, C.katav, { from: 1.8 });
};
F.S4 = t => {
  const { a, b } = SH.S4;
  cam('S4-cam', t, [[a, 960, 620, 1.12], [C.vios, 960, 520, 1.0], [b, 960, 500, 1.04]]);
  for (let i = 0; i < 3; i++) slide('S4-o' + i, t, a + i * .1, .45, 0, 360);
  people(['s4o0', 's4o1', 's4o2'], t, t > C.vios ? 'happy' : 'neutral');
  for (let i = 0; i < 3; i++) popBob('S4-st' + i, t, C.igetik + i * .1, { rot: 30, amp: 4, ph: i });
  popIn('S4-cl', t, C.vios - .2, { dur: .45 }); if (t > C.vios + .3) put('S4-cl', { dy: bob(t, 2, 6), o: 1 });
  if (t > C.vios) put('S4-cf', { r: bob(t, 3, 3), o: 1 });
  slam('S4-l', t, C.igetik, { from: 2, rot: -3 }); fadeOut('S4-l', t, C.vios - .1, .2); if (t < C.vios - .1) op('S4-l2', 0); else slam('S4-l2', t, C.vios - .1, { from: 1.8 });
};
F.S5 = t => {
  const { a, b } = SH.S5;
  cam('S5-cam', t, [[a, 900, 560, 1.05], [C.diam, 1000, 520, 1.0], [b, 1060, 560, 1.06]]);
  slide('S5-o', t, a, .5, -500, 0); idle('s5o', t, 0, .6); expr('s5o', t > C.diam + .2 ? 'strain' : 'neutral');
  popIn('S5-c0', t, C.idan - .1, { rot: -8 }); popIn('S5-c1', t, C.apop - .1, { rot: 8 });
  const dropT = C.diam - .15, p = eOut(P(t, dropT, dropT + .25)), up = eIO(P(t, dropT + .7, dropT + 1.1));
  if (t < dropT) op('S5-m', 0); else put('S5-m', { dy: -500 * (1 - p) + 120 * p - 380 * up, o: 1 });
  op('S5-s0', clamp((t - dropT - .25) / .1)); op('S5-s1', clamp((t - dropT - .25) / .1));
  slam('S5-st', t, C.proep, { from: 2.4, rot: -10 });
};
F.S6 = t => {
  const { a, b } = SH.S6;
  cam('S6-cam', t, [[a, 900, 560, 1.06], [C.istor, 1100, 560, 1.02], [b, 1160, 580, 1.06]]);
  slide('S6-y', t, a, .5, -500, 0); idle('s6y', t, 0, 1.2); expr('s6y', t > C.istor ? 'happy' : 'neutral');
  popIn('S6-sc', t, a + .1, { dur: .3 });
  const ps = eIO(P(t, C.istor - .5, C.istor + .1));
  if (t > a + .4) put('S6-sc', { s: 1 - .9 * ps, dy: 380 * ps, o: 1 - clamp((ps - .85) / .15) });
  popIn('S6-bo', t, C.anik - .3); if (t > C.istor + .1) op('S6-bo', 0);
  if (t < C.istor + .1) op('S6-bc', 0); else popIn('S6-bc', t, C.istor + .1, { s: 1.3 });
  slam('S6-l', t, C.epom, { from: 1.8 }); slam('S6-l2', t, C.istor, { from: 2, rot: -4 });
};
F.S7 = t => {
  const { a, b } = SH.S7;
  cam('S7-cam', t, [[a, 960, 600, 1.1], [b, 960, 540, 1.02]]);
  const sp = 40 + 360 * eOut(P(t, C.ragd - .3, C.ragd + .8));
  put('S7-sp', { r: (t - a) * sp, o: 1 });
  for (let i = 0; i < 5; i++) put('S7-w' + i, { dx: ((t * 600 + i * 300) % 1400) - 700, o: clamp((t - C.ragd + .2) / .3) * .9 });
  popIn('S7-y', t, a + .05); if (t > a + .45) put('S7-y', { r: bob(t, 7, 8), dx: bob(t, 5, 30), s: 1.25, o: 1 });
  idle('s7y', t, 0, 1.5); expr('s7y', t > C.ragd ? 'shock' : 'neutral');
  slam('S7-l', t, C.ragd, { from: 2.4, rot: -6 });
};
F.S8 = t => {
  const { a, b } = SH.S8;
  cam('S8-cam', t, [[a, 960, 600, 1.04], [C.protog, 960, 520, 1.0], [b, 960, 540, 1.03]]);
  const keys = [C.polit8, C.oikon8, C.techn], fast = 1 + 5 * eOut(P(t, C.protog - .2, C.protog + .6));
  for (let i = 0; i < 3; i++) { popIn('S8-g' + i, t, Math.max(a + .05, keys[i] - .15)); put('S8-gr' + i, { r: (i % 2 ? -1 : 1) * (t - a) * 60 * fast, o: 1 }); }
  popIn('S8-ga', t, C.akol - .2); put('S8-nd', { r: -80 + 150 * eBack(P(t, C.protog - .1, C.protog + .45), 1.4) + (t > C.protog + .4 ? bob(t, 30, 3) : 0), o: 1 });
  slam('S8-l', t, C.protog, { from: 2, rot: -4 });
};
F.S9 = t => {
  const { a, b } = SH.S9;
  cam('S9-cam', t, [[a, 960, 560, 1.04], [C.them, 960, 600, 1.0], [b, 960, 560, 1.05]]);
  slide('S9-r0', t, C.oikon10 - .2, .4, -500, 0); slide('S9-r1', t, C.koin10 - .2, .4, 500, 0);
  const lift = eOut(P(t, C.them - .3, C.them)), down = eOut(P(t, C.them + .6, C.them + .9));
  put('S9-h', { dy: -160 * lift + 160 * down + (t > C.oikon10 && t < C.them ? bob(t, 30, 3) : 0), o: 1 });
  if (t < C.them) put('S9-fo', { o: 1 }); else put('S9-fo', { dy: 300 * eIO(P(t, C.them, C.them + .4)), o: 1 - P(t, C.them + .2, C.them + .5) });
  if (t < C.them + .2) op('S9-fn', 0); else slide('S9-fn', t, C.them + .2, .4, 900, 0);
  slam('S9-l', t, C.them, { from: 2.2, rot: -4 }); slam('S9-l2', t, C.antil, { from: 1.6 });
};
F.S10 = t => {
  const { a, b } = SH.S10;
  cam('S10-cam', t, [[a, 960, 520, 1.05], [b, 1060, 560, 1.0]]);
  for (let i = 0; i < 3; i++) { popIn('S10-p' + i, t, a + i * .08, { dur: .3 }); idle('s10a' + i, t, i, .4); expr('s10a' + i, t > C.stam + .2 ? 'angry' : 'neutral'); }
  for (let i = 0; i < 2; i++) { if (t < a) op('S10-y' + i, 0); else put('S10-y' + i, { dx: 420 * eIO(P(t, C.stam - .1, b)), dy: hop(t, i, 8), o: 1 }); idle('s10y' + i, t, i, 1.2); expr('s10y' + i, 'happy'); }
  slam('S10-l', t, a + .1, { from: 1.6 }); draw('S10-x', t, C.stam, .3);
};
F.S11 = t => {
  const { a, b } = SH.S11;
  cam('S11-cam', t, [[a, 800, 560, 1.06], [b, 1100, 540, 1.0]]);
  for (let i = 0; i < 2; i++) popIn('S11-v' + i, t, a + i * .06, { s: .6 });
  for (let i = 0; i < 5; i++) { if (t < a) { op('S11-t' + i, 0); continue; } put('S11-t' + i, { sy: Math.max(.15, eBack(P(t, a + .1 + i * .1, C.astik + .3 + i * .1), 1.6)), o: 1 }); }
  for (let i = 0; i < 3; i++) { if (t < a) op('S11-p' + i, 0); else put('S11-p' + i, { dx: 520 * P(t, a, b), dy: hop(t, i, 8), s: .85, o: 1 }); idle('s11p' + i, t, i, 1); expr('s11p' + i, 'happy'); }
  popIn('S11-ar', t, C.astik + .2); if (t > C.astik + .6) put('S11-ar', { dy: bob(t, 3, 10), s: 1, o: 1 });
  slam('S11-l', t, C.astik, { from: 2, rot: -4 });
};
F.S12 = t => {
  const { a, b } = SH.S12;
  cam('S12-cam', t, [[a, 800, 560, 1.04], [C.enim, 1000, 560, 1.0], [b, 1100, 560, 1.04]]);
  popIn('S12-b', t, a + .02, { s: 1.6, dur: .35 });
  for (let i = 0; i < 3; i++) { slide('S12-c' + i, t, a + .05 + i * .07, .4, 400, 0); idle('s12c' + i, t, i, 1.1); expr('s12c' + i, t > C.enim + .3 ? 'happy' : 'neutral'); }
  for (let i = 0; i < 3; i++) fly('S12-n' + i, t, C.enim - .2 + i * .1, .5, 640, 420, 1220 + i * 230, 700, 200, { r: 360 });
  slam('S12-l', t, C.kentra, { from: 1.8 }); slam('S12-l2', t, C.enim, { from: 2 });
};
F.S13 = t => {
  const { a, b } = SH.S13;
  cam('S13-cam', t, [[a, 960, 560, 1.06], [b, 960, 540, 1.0]]);
  for (let i = 0; i < 5; i++) { popIn('S13-m' + i, t, a + i * .05, { s: .95 }); idle('s13m' + i, t, i, 1); expr('s13m' + i, t > C.meios + .3 + i * .2 ? 'happy' : 'neutral'); }
  for (let i = 0; i < 5; i++) { popIn('S13-k' + i, t, a + .1 + i * .05); const t0 = C.meios + i * .18; op('S13-x' + i, t < t0 ? 1 : 1 - P(t, t0, t0 + .15)); draw('S13-sg' + i, t, t0 + .1, .35); }
  slam('S13-l', t, C.meios - .05, { from: 2 }); popIn('S13-ar', t, C.analf); slam('S13-l2', t, C.andr, { from: 1.6 });
};
F.S14 = t => {
  const { a, b } = SH.S14;
  cam('S14-cam', t, [[a, 800, 560, 1.04], [C.entas - .35, 1000, 560, 1.0], [b, 1020, 560, 1.02]]);
  popIn('S14-sch', t, a + .02, { s: 1.25 });
  for (let i = 0; i < 4; i++) fly('S14-bk' + i, t, C.diad + i * .14, .6, 330, 560, 820 + i * 260, 440 + (i % 2) * 60, 220, { r: 40 });
  for (let i = 0; i < 2; i++) { slide('S14-c' + i, t, a + .1, .4, -300, 0); slide('S14-u' + i, t, a + .15, .4, 300, 0); }
  people(['s14c0', 's14c1'], t, t > C.entas - .35 ? 'angry' : 'neutral'); people(['s14u0', 's14u1'], t, t > C.entas - .35 ? 'angry' : 'neutral');
  for (let i = 0; i < 3; i++) { if (t < C.entas - .35) op('S14-z' + i, 0); else put('S14-z' + i, { o: (Math.floor(t * 12 + i) % 3 ? 1 : .3), r: bob(t, 20, 8, i) }); }
  slam('S14-l', t, C.diad, { from: 1.8 }); slam('S14-l2', t, C.entas - .35, { from: 2.2, rot: -6 });
};
F.S15 = t => {
  const { a, b } = SH.S15;
  cam('S15-cam', t, [[a, 960, 560, 1.05], [b, 960, 600, 1.0]]);
  for (let i = 0; i < 3; i++) { popIn('S15-c' + i, t, a + i * .06, { s: 1.05 }); idle('s15c' + i, t, i, 1.4); expr('s15c' + i, t > C.ayx16 ? 'angry' : 'neutral'); }
  for (let i = 0; i < 3; i++) { if (t < a + .2) { op('S15-sc' + i, 0); continue; } put('S15-sc' + i, { sy: .2 + .7 * eBack(P(t, C.ayx16 - .2 + i * .1, C.ayx16 + .5 + i * .1), 1.3), dy: bob(t, 3, 4, i), o: 1 }); }
  slam('S15-l', t, C.apait, { from: 2 }); popIn('S15-ar', t, C.ayx16); if (t > C.ayx16 + .4) put('S15-ar', { dy: bob(t, 3, 8), o: 1 });
};
F.S16 = t => {
  const { a, b } = SH.S16;
  cam('S16-cam', t, [[a, 800, 560, 1.06], [C.dysl17, 1000, 540, 1.0], [b, 1060, 540, 1.04]]);
  slide('S16-s', t, a, .4, -400, 0); idle('s16s', t, 0, 1.3); expr('s16s', t > C.epikr ? 'angry' : 'neutral');
  popIn('S16-mc', t, a + .05, { dur: .35 });
  const jam = t > C.dysl17; put('S16-g0', { r: jam ? 20 + bob(t, 40, 4) : (t - a) * 50, o: 1 }); put('S16-g1', { r: jam ? -15 + bob(t, 40, 4, 1) : -(t - a) * 70, o: 1 });
  if (jam) put('S16-mc', { dx: bob(t, 50, 4), o: 1 });
  for (let i = 0; i < 3; i++) { if (t < C.dysl17 + i * .15) op('S16-sm' + i, 0); else put('S16-sm' + i, { dy: -60 * P(t, C.dysl17 + i * .15, b) + bob(t, 2, 6, i), s: .6 + .6 * P(t, C.dysl17, b), o: .9 }); }
  slam('S16-l0', t, C.imim - .1, { from: 1.6 }); slam('S16-l', t, C.dysl17, { from: 2.2, rot: -5 });
};
F.S17 = t => {
  const { a, b } = SH.S17;
  cam('S17-cam', t, [[a, 700, 560, 1.0], [C.dysis - .5, 1100, 560, 1.0], [b, 1250, 540, 1.04]]);
  put('S17-cart', { dx: 60 * P(t, a, b), dy: hop(t, 0, 3), o: 1 }); put('S17-wa', { r: (t - a) * 40, o: 1 }); put('S17-wb', { r: (t - a) * 40, o: 1 });
  if (t < a) op('S17-tr', 0); else put('S17-tr', { dx: -900 * (1 - eOut(P(t, a, C.dysis - .5))), s: .8, o: 1 });
  for (let i = 0; i < 3; i++) put('S17-sm' + i, { dx: -900 * (1 - eOut(P(t, a, C.dysis - .5))) - 60 * ((t * 2 + i) % 1), dy: -30 * ((t * 2 + i) % 1), o: .8 });
  slam('S17-l', t, C.kath, { from: 2.2, rot: -5 }); slam('S17-l2', t, C.dysis - .6, { from: 1.8 });
};
F.S18 = t => {
  const { a, b } = SH.S18;
  cam('S18-cam', t, [[a, 960, 580, 1.08], [b, 960, 540, 1.0]]);
  popIn('S18-h', t, a + .02, { dur: .35 });
  for (let i = 0; i < 5; i++) { slide('S18-y' + i, t, a + .05 + i * .06, .4, 0, 300); if (t > a + .5) put('S18-y' + i, { dy: hop(t, i, t > C.epith ? 16 : 4), s: .95, o: 1 }); }
  people(['s18y0', 's18y1', 's18y2', 's18y3', 's18y4'], t, t > C.epith ? 'happy' : 'neutral', 1.5);
  slam('S18-l', t, C.symm18 - .2, { from: 2.2, rot: -4 });
};
F.S19 = t => {
  const { a, b } = SH.S19;
  cam('S19-cam', t, [[a, 960, 560, 1.04], [b, 900, 520, 1.0]]);
  slide('S19-o', t, a, .4, -400, 0); slide('S19-os', t, a, .4, -400, 0); slide('S19-y', t, a + .1, .4, 400, 0); slide('S19-ys', t, a + .1, .4, 400, 0);
  idle('s19o', t, 0, 1); idle('s19y', t, .4, 1); expr('s19o', 'neutral'); expr('s19y', t > C.empeir ? 'sad' : 'neutral');
  [C.tourk, C.epan20, C.antiv].forEach((k, i) => { popIn('S19-c' + i, t, k - .1, { rot: i % 2 ? 6 : -6 }); if (t > k + .3) put('S19-c' + i, { dy: bob(t, 2, 4, i), o: 1 }); });
  put('S19-os', { s: 1 + .12 * (t > C.tourk) + .12 * (t > C.epan20) + .12 * (t > C.antiv), o: t < a ? 0 : 1 });
  popIn('S19-e', t, C.empeir); slam('S19-l', t, C.empeir - .1, { from: 1.6 });
};
F.S20 = t => {
  const { a, b } = SH.S20;
  cam('S20-cam', t, [[a, 960, 560, 1.04], [b, 960, 600, 1.0]]);
  for (let i = 0; i < 3; i++) { if (t < a) { op('S20-s' + i, 0); continue; } put('S20-s' + i, { dx: -700 * (1 - eOut(P(t, C.dynam - .3 + i * .15, C.dynam + .6 + i * .15))), dy: bob(t, 2, 6, i), r: bob(t, 1.6, 1.5, i), s: .62, o: 1 }); }
  slam('S20-c', t, a + .05, { from: 2 }); slam('S20-l', t, C.dynam + .4, { from: 1.6 });
};
F.S21 = t => {
  const { a, b } = SH.S21;
  cam('S21-cam', t, [[a, 900, 560, 1.04], [C.komm22, 1100, 540, 1.0], [b, 1160, 540, 1.04]]);
  for (let i = 0; i < 3; i++) { popIn('S21-f' + i, t, a + i * .05); if (t > a + .4) put('S21-f' + i, { r: bob(t, 2, 3, i) + (t > C.komm22 ? -10 : 0), o: 1 }); }
  popIn('S21-o0', t, a, { s: 1.05 }); popIn('S21-o1', t, a + .05, { s: 1.05 });
  if (t > a + .4) { put('S21-o0', { r: bob(t, 9, 4), s: 1.05, o: 1 }); put('S21-o1', { r: -bob(t, 9, 4), s: 1.05, o: 1 }); }
  people(['s21o0', 's21o1'], t, 'angry', 1.6);
  if (t < C.antip - .1) op('S21-z', 0); else put('S21-z', { o: (Math.floor(t * 10) % 3 ? 1 : .35), r: bob(t, 20, 10), s: .9 });
  if (t < a) op('S21-y', 0); else put('S21-y', { dx: 140 * eOut(P(t, C.apost, C.apost + .6)), s: 1.1, o: 1 }); idle('s21y', t, 0, 1.2); expr('s21y', t > C.apost ? 'neutral' : 'shock');
  popIn('S21-ar', t, C.apost); if (t > C.apost + .4) put('S21-ar', { dx: bob(t, 4, 12), o: 1 });
  slam('S21-l', t, C.antip, { from: 2, rot: -5 }); slam('S21-l2', t, C.apost, { from: 1.6 });
};
F.S22 = t => {
  const { a, b } = SH.S22;
  cam('S22-cam', t, [[a, 1200, 520, 1.08], [C.kritik, 1150, 540, 1.06], [b, 900, 560, 1.0]]);
  for (let i = 0; i < 3; i++) { popIn('S22-o' + i, t, a + i * .05); if (t > a + .4) put('S22-o' + i, { s: 1 - .25 * eOut(P(t, C.kritik, C.kritik + .6)), o: 1 }); }
  people(['s22o0', 's22o1', 's22o2'], t, t > C.kritik ? 'sad' : 'neutral');
  slide('S22-y', t, a, .4, 400, 0); idle('s22y', t, 0, 1.6); expr('s22y', t > C.kritik - .2 ? 'angry' : 'neutral');
  popIn('S22-ar', t, C.kritik - .2); if (t > C.kritik + .2) put('S22-ar', { dx: bob(t, 6, 14), o: 1 });
  slam('S22-l', t, C.kritik, { from: 2.2, rot: -5 }); slam('S22-l2', t, C.kritik + .4, { from: 1.6 });
};
const lidAnim = (p, t, a, grow) => {
  if (t < a) op(p + '-tr', 0); else put(p + '-tr', { sy: grow, sx: .62, s: .62, dx: grow > .99 ? bob(t, 30, 3) : 0, o: 1 });
  popIn(p + '-lid', t, a, { dur: .3 });
};
F.S23 = t => {
  const { a, b } = SH.S23;
  cam('S23-cam', t, [[a, 960, 600, 1.06], [b, 960, 540, 1.0]]);
  const g = .45 + .55 * eOut(P(t, a, C.anapt));
  if (t < a) op('S23-tr', 0); else put('S23-tr', { sy: g * .96, dx: t > C.anapt ? bob(t, 40, 4) : 0, o: 1 });
  popIn('S23-lid', t, a, { dur: .3 }); if (t > C.anapt) put('S23-lid', { dy: bob(t, 40, 2), o: 1 });
  slam('S23-l', t, a + .1, { from: 1.8 }); slam('S23-l2', t, C.anapt, { from: 2, rot: -4 });
};
F.S24 = t => {
  const { a, b } = SH.S24;
  cam('S24-cam', t, [[a, 960, 540, 1.0], [C.avli, 960, 520, .92], [b, 960, 520, .92]]);
  put('S24-tr', { sy: .96, dx: bob(t, 40, 4) * (t > C.vasil24 ? 2 : 1), o: 1 }); put('S24-lid', { dy: t > C.vasil24 + .3 ? 8 : 0, o: 1 });
  for (let i = 0; i < 3; i++) drop('S24-c' + i, t, C.avli - .25 + i * .1, { h: 700, fall: .3 });
  people(['s24c0', 's24c1', 's24c2'], t, 'happy', 1);
  drop('S24-ot', t, C.vasil24 - .1, { h: 800, fall: .3 }); idle('s24ot', t, 0, 1); expr('s24ot', 'neutral');
  slam('S24-l', t, C.avli, { from: 2 }); slam('S24-n', t, C.vasil24, { from: 1.8 }); slam('S24-l2', t, C.vasil24 + .1, { from: 1.6 });
};
F.S25 = t => {
  const { a, b } = SH.S25;
  cam('S25-cam', t, [[a, 900, 520, 1.04], [C.atal, 1000, 560, 1.0], [b, 1060, 560, 1.03]]);
  popIn('S25-ot', t, a, { s: 1.3 }); idle('s25ot', t, 0, 1.4); expr('s25ot', t > C.atal ? 'shock' : 'strain');
  for (let i = 0; i < 3; i++) {
    if (t < a + .2) { op('S25-b' + i, 0); continue; }
    if (t < C.atal) { const ang = (t * 4 + i * 2.1); put('S25-b' + i, { dx: Math.cos(ang) * 150, dy: Math.sin(ang) * 80 - 80, o: 1 }); }
    else { const fall = P(t, C.atal, C.atal + .5); const ang = (C.atal * 4 + i * 2.1); put('S25-b' + i, { dx: Math.cos(ang) * 150 + (i - 1) * 140 * fall, dy: Math.sin(ang) * 80 - 80 + 640 * fall * fall, o: 1 }); }
  }
  slam('S25-st', t, C.atal, { from: 2.6, rot: -12 });
};
F.S26 = t => {
  const { a, b } = SH.S26;
  cam('S26-cam', t, [[a, 960, 540, 1.04], [b, 960, 540, 1.0]]);
  popIn('S26-pf', t, a, { dur: .3 });
  for (let i = 0; i < 3; i++) { const t0 = a + .2 + i * ((C.y1850 - a - .3) / 3); if (t < t0) put('S26-p' + (2 - i), { o: 1 }); else put('S26-p' + (2 - i), { dy: -700 * eIO(P(t, t0, t0 + .35)), r: -30 * P(t, t0, t0 + .35), o: 1 - P(t, t0 + .2, t0 + .35) }); }
  if (t > C.y1850) put('S26-pf', { s: 1 + .08 * (1 - eOut(P(t, C.y1850, C.y1850 + .3))), o: 1 });
};
F.S27 = t => {
  const { a, b } = SH.S27;
  cam('S27-cam', t, [[a, 960, 600, 1.06], [b, 960, 540, 1.0]]);
  for (let i = 0; i < 7; i++) { popIn('S27-p' + i, t, (i < 5 ? a : C.megal - .2) + (i % 3) * .07, { s: .9 }); idle('s27p' + i, t, i * .3, 1.3); expr('s27p' + i, t > C.dysar26 ? 'angry' : 'neutral'); }
  popIn('S27-cl', t, C.dysar26 - .2, { s: 1.6, dur: .45 }); if (t > C.dysar26 + .3) put('S27-cl', { dx: bob(t, 1.5, 20), s: 1.6, o: 1 });
  slam('S27-l', t, C.dysar26, { from: 2.2, rot: -4 });
};
F.S28 = t => {
  const { a, b } = SH.S28;
  cam('S28-cam', t, [[a, 700, 560, 1.04], [C.dysl26, 1200, 560, 1.0], [b, 960, 540, 1.0]]);
  popIn('S28-bag', t, a, { s: 1.5 }); if (t > C.dyspr) put('S28-bag', { sy: 1.5 - .5 * eOut(P(t, C.dyspr, C.dyspr + .5)), sx: 1.5, s: 1, o: 1 });
  if (t < C.dyspr) op('S28-mo', 0); else put('S28-mo', { dy: -120 * P(t, C.dyspr, b) + bob(t, 6, 14), dx: bob(t, 3, 30), o: 1 });
  popIn('S28-mc', t, C.dysl26 - .25, { dur: .35 }); put('S28-g0', { r: 20 + bob(t, 40, 5), o: 1 }); put('S28-g1', { r: -15 + bob(t, 40, 5, 1), o: 1 });
  for (let i = 0; i < 2; i++) { if (t < C.dysl26 + i * .2) op('S28-sm' + i, 0); else put('S28-sm' + i, { dy: -50 * P(t, C.dysl26, b), s: .7 + .5 * P(t, C.dysl26, b), o: .9 }); }
  slam('S28-l', t, C.dyspr, { from: 1.8 }); slam('S28-l2', t, C.dysl26, { from: 1.6 }); slam('S28-l3', t, C.dysl26 + .1, { from: 1.6 });
};
F.S29 = t => {
  const { a, b } = SH.S29;
  cam('S29-cam', t, [[a, 800, 560, 1.04], [C.aitim26, 1200, 560, 1.0], [b, 1250, 560, 1.03]]);
  for (let k = 0; k < 2; k++) { popIn('S29-t' + k, t, a + k * .1); for (let j = 0; j < 2; j++) { slide(`S29-y${k}${j}`, t, C.synkr - .1 + k * .15 + j * .05, .4, j ? 300 : -300, 0); idle(`s29y${k}${j}`, t, k + j, 1.3); expr(`s29y${k}${j}`, 'happy'); } }
  slam('S29-bd', t, C.aitim26 - .3, { from: 1.6, rot: 5 });
  slam('S29-l', t, C.antipol, { from: 1.8 }); slam('S29-l2', t, C.eksyg, { from: 1.6 });
};
F.S30 = t => {
  const { a, b } = SH.S30;
  cam('S30-cam', t, [[a, 700, 560, 1.04], [C.elafr, 1200, 560, 1.0], [b, 1100, 560, 1.03]]);
  popIn('S30-bx', t, a, { s: 1.4 }); fly('S30-bal', t, C.ekl - .3, .5, 500, 300, 500, 560, 60);
  if (t > C.ekl + .25) op('S30-bal', 0);
  slide('S30-f', t, C.forol - .2, .4, 500, 0); idle('s30f', t, 0, 1.2); expr('s30f', t > C.elafr + .2 ? 'happy' : 'strain');
  if (t < C.forol - .2) op('S30-sk', 0); else put('S30-sk', { s: 1 - .55 * eBack(P(t, C.elafr, C.elafr + .5), 1.4), dx: 500 * (1 - eOut(P(t, C.forol - .2, C.forol + .2))), o: 1 });
  slam('S30-l', t, C.ekl - .1, { from: 1.8 }); slam('S30-l2', t, C.forol, { from: 1.6 }); slam('S30-l3', t, C.elafr, { from: 1.6 });
};
F.S31 = t => {
  const { a, b } = SH.S31;
  cam('S31-cam', t, [[a, 600, 560, 1.0], [C.ypod + .3, 600, 560, 1.0], [C.trap - .1, 1500, 560, 1.0], [C.trap2 + .4, 1500, 560, 1.0], [C.dioik - .1, 2900, 540, 1.0], [b, 2900, 540, 1.03]]);
  if (t < a) op('S31-br', 0); else put('S31-br', { sx: Math.max(.02, eOut(P(t, a, C.ypod))), s: 1.1, o: 1 });
  popIn('S31-bk', t, C.trap - .2, { s: 1.3 }); slam('S31-l2', t, C.trap - .1, { from: 1.6 }); fadeOut('S31-l2', t, C.dioik - .3, .2); slide('S31-v', t, C.trap2 - .3, .4, 300, 0); idle('s31v', t, 0, 1); expr('s31v', 'happy');
  popIn('S31-co', t, C.trap2, { s: .5 }); if (t > C.trap2 + .3) put('S31-co', { dy: bob(t, 4, 8), s: .5, o: 1 });
  if (t < C.dioik) op('S31-tg', 1); else op('S31-tg', 1 - P(t, C.dioik + .2, C.dioik + .5));
  if (t < C.dioik + .3) op('S31-st', 0); else slide('S31-st', t, C.dioik + .3, .4, -300, 0);
};
F.S32 = t => {
  const { a, b } = SH.S32;
  cam('S32-cam', t, [[a, 960, 600, 1.06], [C.alex, 960, 540, 1.0], [b, 960, 540, 1.03]]);
  popIn('S32-k', t, a, { s: 1.3 }); idle('s32k', t, 0, 1.2); expr('s32k', t > C.exefr ? 'happy' : 'neutral');
  const XY = [[420, 360], [420, 560], [420, 760], [1500, 450], [1500, 680]];
  for (let i = 0; i < 5; i++) { const [x, y] = XY[i]; fly('S32-c' + i, t, C.exefr - .3 + i * .12, .6, x < 960 ? -300 : 2200, y, x, y, 140); if (t > C.exefr + .6 + i * .12) put('S32-c' + i, { x, y: y + bob(t, 2, 6, i), o: 1 }); }
  slam('S32-n', t, C.alex, { from: 2, rot: -4 });
};
F.S33 = t => {
  const { a, b } = SH.S33;
  cam('S33-cam', t, [[a, 960, 560, 1.06], [b, 960, 540, 1.0]]);
  slam('S33-pg', t, C.feb - .2, { from: 1.6, rot: 4 }); slam('S33-y', t, C.y1862a, { from: 2.4, rot: -6 });
};
F.S34 = t => {
  const { a, b } = SH.S34;
  cam('S34-cam', t, [[a, 960, 520, 1.06], [C.epan33, 960, 560, 1.0], [b, 960, 560, 1.04]]);
  popIn('S34-cl', t, a, { s: 1.5 }); if (t > C.epan33) put('S34-cl', { s: 1.5 + .25 * P(t, C.epan33, C.epan33 + .2), dx: bob(t, 30, 6), o: 1 - .3 * P(t, C.epan33 + .2, b) });
  for (let i = 0; i < 6; i++) { popIn('S34-p' + i, t, C.epan33 - .3 + i * .05, { s: .9 }); if (t > C.epan33 + .2) put('S34-p' + i, { dy: hop(t, i, 14), s: .9, o: 1 }); }
  people(['s34p0', 's34p1', 's34p2', 's34p3', 's34p4', 's34p5'], t, 'angry', 1.6);
  for (let i = 0; i < 3; i++) { popIn('S34-f' + i, t, C.epan33 + i * .1); if (t > C.epan33 + .5) put('S34-f' + i, { r: bob(t, 4, 6, i), o: 1 }); }
  slam('S34-l', t, C.epan33, { from: 2.6, rot: -6 });
};
F.S35 = t => {
  const { a, b } = SH.S35;
  cam('S35-cam', t, [[a, 900, 560, 1.04], [b, 1150, 540, 1.0]]);
  popIn('S35-th', t, a, { s: 1.1 }); if (t > C.apom) put('S35-th', { dx: 480 * eIO(P(t, C.apom, C.apom + 1.2)), r: 5 * P(t, C.apom, C.apom + 1.2), s: 1.1, o: 1 });
  idle('s35ot', t, 0, 1); expr('s35ot', t > C.apom ? 'shock' : 'neutral');
  for (let i = 0; i < 2; i++) { if (t < a) op('S35-h' + i, 0); else put('S35-h' + i, { dx: -400 * (1 - eOut(P(t, a, a + .5))) + 480 * eIO(P(t, C.apom, C.apom + 1.2)), dy: hop(t, i, t > C.apom ? 8 : 0), o: 1 }); idle('s35h' + i, t, i, 1.4); expr('s35h' + i, 'angry'); }
  slam('S35-tg', t, C.aitim34, { from: 1.8 }); slam('S35-l', t, C.apom, { from: 2.2, rot: -4 });
};
F.S36 = t => {
  const { a, b } = SH.S36;
  cam('S36-cam', t, [[a, 960, 560, 1.06], [b, 960, 540, 1.0]]);
  for (let i = 0; i < 4; i++) { if (t < a) { op('S36-o' + i, 0); continue; } const p = eOut(P(t, a + i * .12, C.axiom + i * .08)); put('S36-o' + i, { dx: -360 * (1 - p), dy: hop(t, i, p < 1 ? 14 : 0), s: 1.05, o: clamp(p * 4) }); }
  people(['s36o0', 's36o1', 's36o2', 's36o3'], t, 'angry', 1);
  slam('S36-l', t, C.axiom, { from: 2.2, rot: -4 });
};
F.S37 = t => {
  const { a, b } = SH.S37;
  cam('S37-cam', t, [[a, 960, 600, 1.06], [b, 960, 540, 1.0]]);
  popIn('S37-u', t, a, { s: 1.1, dur: .35 });
  for (let i = 0; i < 3; i++) { popIn('S37-g' + i, t, a + .1 + i * .07); idle('s37g' + i, t, i, 1.2); expr('s37g' + i, t > C.anerg ? 'sad' : 'neutral'); }
  slam('S37-l', t, C.anerg, { from: 2.2, rot: -5 }); slam('S37-l2', t, C.apof, { from: 1.6 });
};
F.S38 = t => {
  const { a, b } = SH.S38;
  cam('S38-cam', t, [[a, 800, 560, 1.04], [C.adik, 1100, 560, 1.0], [b, 1150, 560, 1.02]]);
  popIn('S38-sp0', t, a, { s: 1.1 }); popIn('S38-sp1', t, a + .08, { s: 1.1 });
  slam('S38-x0', t, C.agrot36, { from: 2 }); slam('S38-x1', t, C.viot, { from: 2 });
  slide('S38-g', t, a, .4, 400, 0); idle('s38g', t, 0, 1.2); expr('s38g', t > C.adik ? 'sad' : 'angry');
  if (t < C.adik - .2) op('S38-cl', 0); else put('S38-cl', { dy: -200 * (1 - eOut(P(t, C.adik - .2, C.adik + .3))) + bob(t, 2, 6), s: .7, o: 1 });
  slam('S38-l', t, C.adik, { from: 2, rot: -4 });
};
F.S39 = t => {
  const { a, b } = SH.S39;
  cam('S39-cam', t, [[a, 800, 560, 1.04], [b, 1100, 560, 1.0]]);
  popIn('S39-py', t, a, { dur: .35 });
  for (let i = 0; i < 3; i++) { if (t < a + .1) { op('S39-u' + i, 0); continue; } const p = eIO(P(t, C.anot + .2 + i * .15, C.anot + 1.2 + i * .15)); put('S39-u' + i, { x: lerp(540 + i * 80, 1150 - i * 120, p), y: lerp(560, 900, p) - 120 * Math.sin(Math.PI * p), s: lerp(.55, .9, p), o: 1 }); idle('s39u' + i, t, i, 1); expr('s39u' + i, 'neutral'); }
  for (let i = 0; i < 3; i++) { popIn('S39-c' + i, t, a + .15 + i * .05, { s: .9 }); idle('s39c' + i, t, i, 1.2); expr('s39c' + i, t > C.anot + .6 ? 'happy' : 'neutral'); }
  slam('S39-l', t, C.anot, { from: 1.8, rot: -3 });
};
F.S40 = t => {
  const { a, b } = SH.S40;
  cam('S40-cam', t, [[a, 960, 580, 1.02], [b, 1080, 540, 1.0]]);
  popIn('S40-h', t, a, { s: .7 }); popIn('S40-tg', t, C.efk - .1, { rot: -8 });
  for (let i = 0; i < 2; i++) { if (t < a) { op('S40-u' + i, 0); continue; } const p = clamp(P(t, C.efk + i * .2, b - .2)); const step = Math.min(5, Math.floor(p * 6)); put('S40-u' + i, { dx: 180 * step + 120 + i * 0, dy: -80 * step + hop(t, i, 6), s: .8, o: 1 }); idle('s40u' + i, t, i, 1); expr('s40u' + i, 'happy'); }
  slam('S40-l', t, C.energ, { from: 2 });
};
F.S41 = t => {
  const { a, b } = SH.S41;
  cam('S41-cam', t, [[a, 700, 560, 1.04], [C.egkat, 960, 540, 1.0], [b, 1200, 540, 1.02]]);
  slam('S41-cal', t, C.d12, { from: 1.8, rot: -4 });
  popIn('S41-ot', t, a + .05, { s: .85 }); idle('s41ot', t, 0, 1); expr('s41ot', 'sad');
  const board = eIO(P(t, C.othon, C.egkat)), sail = 420 * eIO(P(t, C.egkat, C.end + 1)), sb = bob(t, 2, 6);
  if (t > a + .4) put('S41-ot', { dx: 830 * board + sail, dy: hop(t, 0, board > 0 && board < 1 ? 6 : 0) + (board >= 1 ? 10 + sb : 0), s: .85 - .2 * board, o: 1 });
  put('S41-sh', { dx: sail, dy: sb, r: bob(t, 1.6, 1.2), s: .75, o: 1 });
  slam('S41-n', t, C.othon, { from: 1.8 }); fadeOut('S41-n', t, C.egkat, .3);
  slam('S41-l', t, C.egkat, { from: 1.8 });
  op('S41-black', P(t, C.end + 1.6, C.end + 2.35));
};
