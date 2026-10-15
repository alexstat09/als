// Κεφ.2 Β.2 — per-shot animation (browser, after engine/runtime.js). seek(t) is PURE.
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
const dropQ = (id, t, t0, o = {}) => drop(id, t, t0, { h: 600, fall: .26, ...o });   // short fall: a shot never opens on an empty frame
const people = (ids, t, ex = 'neutral', amp = 1.2) => ids.forEach((id, i) => { idle(id, t, i * .37, amp); expr(id, ex); });

[[C.t1 + .1, 8], [C.parak - .1, 12], [C.y1864, 8], [C.kind, 12], [C.lyth, 8], [C.kol + .34, 14], [C.koinv + .2, 12], [C.via, 12], [C.noth, 8],
 [C.y1846, 10], [C.adyn, 10], [C.dikt, 16], [C.y1847b, 10], [C.parak23, 10], [C.diam, 12], [C.sygkr, 14], [C.krim, 12], [C.viai, 12],
 [C.apok, 10], [C.dysx, 14], [C.itta, 14]].forEach(a => shk(...a));
[C.dikt, C.sygkr].forEach(t => fl(t, .35));

F.S1 = t => {
  const { a, b } = SH.S1;
  cam('S1-cam', t, [[a, 960, 600, 1.12], [C.t2, 960, 560, 1.02], [b, 960, 540, 1.05]]);
  [0, 1, 2].forEach(i => { popIn(`S1-f${i}`, t, a + .15 + i * .12); if (t > a + .55 + i * .12) put(`S1-f${i}`, { r: bob(t, 2.4, 2, i), o: 1 }); });
  slam('S1-t1', t, C.t1 + .1, { from: 2.6, rot: -8 }); slam('S1-t2', t, C.t2, { from: 2.2, rot: 4 }); slam('S1-t3', t, C.t2 + .5, { from: 1.8 });
};
F.S2 = t => {
  const { a, b } = SH.S2;
  cam('S2-cam', t, [[a, 960, 560, 1.08], [C.synt, 960, 580, 1.0], [b, 1060, 560, 1.04]]);
  popIn('S2-bk', t, a + .05, { dur: .5 });
  ['S2-a', 'S2-b', 'S2-c'].forEach((id, i) => drop(id, t, C.komm - .2 + i * .14));
  people(['s2a', 's2b', 's2c'], t, t > C.anapt ? 'happy' : 'neutral');
  slam('S2-l', t, C.komm);
  popBob('S2-ar', t, C.anapt, { amp: 10 }); slam('S2-l2', t, C.anapt + .2);
};
F.S3 = t => {
  const { a, b } = SH.S3;
  cam('S3-cam', t, [[a, 760, 560, 1.12], [C.stasim, 760, 560, 1.06], [C.anag, 1060, 560, 1.0], [b, 1000, 545, 1.03]]);
  popIn('S3-g', t, a + .1); put('S3-n', { r: -64 + bob(t, 9, 3), o: 1 });
  people(['s3m0', 's3m1', 's3m2'], t, 'yawn', .5);
  [0, 1, 2].forEach(i => { op(`S3-m${i}`, 1); fadeIn(`S3-w${i}`, t, C.stasim + i * .1, .4); });
  slam('S3-l', t, C.sympt);
  [0, 1, 2].forEach(i => { slide(`S3-c${i}`, t, a + .3 + i * .1, .45, 600, 0); idle(`s3c${i}`, t, i * .4, 1.4); expr(`s3c${i}`, t > C.anag + .6 ? 'angry' : 'neutral');
    popBob(`S3-b${i}`, t, C.anag + i * .14, { ph: i }); });
  slam('S3-l2', t, C.anag);
  [0, 1, 2].forEach(i => { if (t > C.anag + .5) put(`S3-m${i}`, { sx: -1, o: 1 }); });
};
F.S4 = t => {
  const { a, b } = SH.S4;
  cam('S4-cam', t, [[a, 960, 560, 1.0], [b, 960, 600, 1.08]]);
  [0, 1, 2].forEach(i => { const p = eIO(P(t, a + .1, C.parak + .2)); put(`S4-f${i}`, { r: -7 * p + bob(t, 2, 1, i), dy: 40 * p, o: 1 }); op(`S4-g${i}`, p); });
  slam('S4-l', t, C.parak - .1, { from: 2.6, rot: -6 });
  slide('S4-ar', t, C.parak - .05, .4, 0, -200); if (t > C.parak + .4) put('S4-ar', { dy: bob(t, 3, 10), o: 1 });
};
F.S5 = t => {
  const { a, b } = SH.S5;
  cam('S5-cam', t, [[a, 960, 560, 1.08], [C.y1844, 760, 560, 1.06], [C.y1864, 1160, 560, 1.06], [b, 960, 560, 1.0]]);
  slam('S5-l', t, C.metax - .1);
  popIn('S5-s0', t, a + .05); popIn('S5-s1', t, a + .2);
  draw('S5-bar', t, a + .3, C.y1864 - a - .3); draw('S5-bar2', t, a + .3, C.y1864 - a - .3);
  slam('S5-y0', t, C.y1844); slam('S5-y1', t, C.y1864);
};
F.S6 = t => {
  const { a, b } = SH.S6;
  cam('S6-cam', t, [[a, 900, 560, 1.06], [C.ikan, 960, 560, 1.0], [b, 1010, 560, 1.04]]);
  dropQ('S6-m', t, a + .05); idle('s6m', t, 0, 1.3); expr('s6m', t > C.ikan + .3 ? 'happy' : 'neutral');
  popIn('S6-p', t, a + .3);
  [0, 1, 2].forEach(i => popIn(`S6-k${i}`, t, C.ikan + .2 + i * .22, { rot: -20 }));
  slam('S6-l', t, C.ikan); slam('S6-tg', t, C.rosik - .1);
};
F.S7 = t => {
  const { a, b } = SH.S7;
  cam('S7-cam', t, [[a, 900, 560, 1.06], [b, 1060, 540, 1.0]]);
  popIn('S7-p', t, a + .05); draw('S7-ln', t, a + .25, .5); popIn('S7-ch', t, a + .5, { dur: .5 });
  slam('S7-l', t, C.orth7 - .1);
};
F.S8 = t => {
  const { a, b } = SH.S8;
  cam('S8-cam', t, [[a, 800, 560, 1.08], [C.kind, 1000, 560, 1.02], [b, 1100, 545, 1.05]]);
  dropQ('S8-m', t, a + .05); idle('s8m', t, 0, 1.6); expr('s8m', 'angry');
  [0, 1, 2].forEach(i => op(`S8-w${i}`, t > C.napai ? .5 + .5 * Math.sin(t * 10 - i) : 0));
  slam('S8-tg', t, C.napai);
  popIn('S8-sg', t, C.kind, { rot: 15 }); if (t > C.kind + .4) put('S8-sg', { r: bob(t, 14, 4), o: 1 });
  slam('S8-l2', t, C.kind + .1); slam('S8-l', t, C.orth8 - .1);
};
F.S9 = t => {
  const { a, b } = SH.S9;
  cam('S9-cam', t, [[a, 960, 560, 1.1], [C.lyth, 1060, 540, 1.0], [b, 1100, 540, 1.02]]);
  popIn('S9-lk', t, a + .1); slam('S9-l', t, C.zit);
  fly('S9-key', t, C.lyth - .8, .5, 1600, 560, 1060, 600, 80, { r: -30 });
  put('S9-sh', { dy: -60 * eBack(P(t, C.lyth - .3, C.lyth)), o: 1 });
  popIn('S9-k', t, C.lyth - .2, { rot: -20 }); slam('S9-l2', t, C.lyth - .1);
};
F.S10 = t => {
  const { a, b } = SH.S10;
  cam('S10-cam', t, [[a, 960, 560, 1.06], [b, 960, 540, 1.0]]);
  [0, 1, 2].forEach(i => { drop(`S10-m${i}`, t, a + .05 + i * .1); idle(`s10m${i}`, t, i * .4, 1.3); expr(`s10m${i}`, 'happy');
    popBob(`S10-x${i}`, t, C.dogma - 1.3 + i * .12, { ph: i }); });
  slam('S10-l', t, a + .45); slam('S10-l2', t, C.dogma - .9);
};
F.S11 = t => {
  const { a, b } = SH.S11;
  cam('S11-cam', t, [[a, 860, 560, 1.06], [C.theseis, 900, 560, 1.0], [C.epik, 1100, 540, 1.0], [b, 1060, 540, 1.04]]);
  dropQ('S11-m', t, a + .05); idle('s11m', t, 0, 1); expr('s11m', 'sad');
  slam('S11-l', t, C.logos); slam('S11-x', t, C.logos + .35, { from: 2 });
  popIn('S11-pl', t, C.theseis - .3); if (t > C.theseis + .1) put('S11-pl', { r: bob(t, 8, 3), o: 1 });
  popBob('S11-q', t, C.theseis + .2);
  [0, 1, 2].forEach(i => fly(`S11-n${i}`, t, C.epik - .1 + i * .18, 1.1, 2200, 520 + i * 60, 1300 + i * 170, 470 + (i % 2) * 120, 60, { s: 1 }));
  slam('S11-l2', t, C.epik);
};
F.S12 = t => {
  const { a, b } = SH.S12;
  cam('S12-cam', t, [[a, 960, 580, 1.12], [C.kol + .4, 960, 560, 1.04], [b, 1000, 545, 1.0]]);
  slide('S12-f', t, a + .05, .5, 400, 0); if (t > a + .6) put('S12-f', { r: bob(t, 2.2, 1.5), o: 1 });
  [0, 1].forEach(i => { popIn(`S12-b${i}`, t, a + .5 + i * .1); idle(`s12b${i}`, t, i, 1); });
  dropQ('S12-k', t, a + .02); idle('s12k', t, 0, 1.2); expr('s12k', t > C.arch ? 'happy' : 'neutral');
  slam('S12-tg', t, a + .35); slam('S12-l', t, C.arch); popIn('S12-ff', t, C.gall13 - .1);
};
F.S13 = t => {
  const { a, b } = SH.S13;
  cam('S13-cam', t, [[a, 960, 560, 1.04], [C.enis14, 1000, 540, 1.0], [b, 1060, 520, 1.03]]);
  op('S13-th', 1); idle('s13k', t, 0, 1.2); expr('s13k', 'happy'); idle('s13o', t, .5, 1.2); expr('s13o', t > C.enis14 + .4 ? 'happy' : 'neutral');
  const g = eOut(P(t, C.enis14 - .2, C.enis14 + 1.2)); put('S13-o', { s: 1 + .32 * g, o: 1 });
  put('S13-bl', { sx: t > C.enis14 - .3 ? 1 - .18 * Math.abs(Math.sin(t * 9)) : 1, o: 1 });
  slam('S13-l', t, C.kyv); popIn('S13-ar', t, C.enis14 + .1); slam('S13-l2', t, C.enis14 + .3); slam('S13-tg', t, a + .3);
};
F.S14 = t => {
  const { a, b } = SH.S14;
  cam('S14-cam', t, [[a, 900, 600, 1.0], [C.koinv, 1000, 560, 1.03], [b, 1040, 560, 1.06]]);
  draw('S14-tun', t, a + .1, C.koinv - a);
  const p = eIO(P(t, a + .1, C.koinv)); put('S14-k', { dx: 300 * p, dy: hop(t, 0, 6), o: 1 }); idle('s14k', t, 0, 1.4); expr('s14k', 'strain');
  const k = eOut(P(t, C.koinv, C.koinv + .6)); put('S14-b', { r: -7 * k, dy: 30 * k, o: 1 });
  slam('S14-l', t, C.koinv);
};
F.S15 = t => {
  const { a, b } = SH.S15;
  cam('S15-cam', t, [[a, 700, 560, 1.06], [C.noth, 960, 560, 1.0], [C.trom, 1200, 560, 1.02], [b, 1100, 545, 1.04]]);
  op('S15-bx', 1);
  [0, 1].forEach(i => { slide(`S15-t${i}`, t, a + .05 + i * .1, .4, -500, 0); idle(`s15t${i}`, t, i, 1.5); expr(`s15t${i}`, 'angry');
    if (t < C.via) op(`S15-c${i}`, 0); else put(`S15-c${i}`, { r: 30 * Math.sin((t - C.via) * 9 + i), o: 1 }); });
  slam('S15-l', t, C.via); slam('S15-l2', t, C.noth);
  [0, 1, 2].forEach(i => { const t0 = C.noth + .1 + i * .18; if (t < t0) op(`S15-p${i}`, 0); else { const p = P(t, t0, t0 + .5); put(`S15-p${i}`, { dy: 160 * eIn(p) - 100, r: 20 * i, o: 1 - P(t, t0 + .45, t0 + .55) }); } });
  [0, 1, 2].forEach(i => { slide(`S15-v${i}`, t, a + .2 + i * .1, .4, 400, 0); idle(`s15v${i}`, t, i * .3, 1.2); expr(`s15v${i}`, t > C.trom ? 'shock' : 'neutral'); });
  slam('S15-l3', t, C.trom);
};
F.S16 = t => {
  const { a, b } = SH.S16;
  cam('S16-cam', t, [[a, 900, 560, 1.04], [b, 1000, 540, 1.0]]);
  popIn('S16-bx', t, a + .05);
  [0, 1, 2].forEach(i => { op(`S16-v${i}`, 1); idle(`s16v${i}`, t, i * .3, 1.1); expr(`s16v${i}`, 'sad');
    const p = fly(`S16-p${i}`, t, C.psif + i * .16, .6, 420 + i * 210, 560, 1250, 640, 220, { r: 200 }); if (p >= 1) op(`S16-p${i}`, 0); });
  slam('S16-l', t, C.komm17 - .3); popIn('S16-k', t, C.komm17, { rot: -20 });
};
F.S17 = t => {
  const { a, b } = SH.S17;
  cam('S17-cam', t, [[a, 700, 600, 1.06], [C.ypourg, 960, 560, .97], [b, 960, 560, .95]]);
  [0, 1, 2, 3, 4, 5, 6].forEach(i => { op(`S17-d${i}`, 1); popIn(`S17-q${i}`, t, a + .1 + i * .04); });
  [0, 1, 3, 4, 6].forEach((i, j) => popIn(`S17-k${i}`, t, C.pente + j * .2, { rot: -12 }));
  slam('S17-y', t, C.y1846); slam('S17-l', t, C.ypourg - .1);
};
F.S18 = t => {
  const { a, b } = SH.S18;
  cam('S18-cam', t, [[a, 900, 560, 1.04], [C.kath, 1100, 560, 1.06], [b, 1100, 545, 1.08]]);
  [0, 1, 2].forEach(i => { op(`S18-be${i}`, 1); popIn(`S18-m${i}`, t, a + .05 + i * .08); idle(`s18m${i}`, t, i * .3, 1); expr(`s18m${i}`, t > C.kath + .3 ? 'shock' : 'neutral'); });
  op('S18-e', 1); fadeIn('S18-w', t, C.parous, .5);
  slam('S18-st', t, C.kath, { rot: -12 }); slam('S18-l', t, C.koinov - .1);
};
F.S19 = t => {
  const { a, b } = SH.S19;
  cam('S19-cam', t, [[a, 900, 560, 1.04], [C.adyn, 960, 560, 1.0], [b, 1060, 545, 1.03]]);
  op('S19-dr', 1); popIn('S19-lk', t, a + .1);
  dropQ('S19-m', t, a + .05); idle('s19m', t, 0, 1.2); expr('s19m', t > C.adyn ? 'sad' : 'neutral');
  popIn('S19-mg', t, a + .3); if (t > a + .7) { const k = t < C.adyn ? 0 : Math.exp(-5 * (t - C.adyn)) * Math.sin((t - C.adyn) * 18); put('S19-mg', { dx: P(t, a + .7, C.adyn) * 220 - 90 * Math.abs(k), r: -20 * k, o: 1 }); }
  slam('S19-l2', t, a + .35); slam('S19-x', t, C.adyn); slam('S19-l3', t, C.adyn + .15); slam('S19-l', t, C.ekt - .1);
};
F.S20 = t => {
  const { a, b } = SH.S20;
  cam('S20-cam', t, [[a, 960, 620, 1.1], [C.dikt, 960, 560, 1.0], [b, 960, 545, 1.04]]);
  op('S20-pd', 1);
  dropQ('S20-k', t, a + .05); idle('s20k', t, 0, 1.5); expr('s20k', 'angry');
  [0, 1, 2, 3].forEach(i => { popIn(`S20-m${i}`, t, a + .1 + i * .05); idle(`s20m${i}`, t, i * .3, 1); expr(`s20m${i}`, 'shock'); });
  slam('S20-st', t, C.dikt - .2, { from: 3, rot: -8 });
};
F.S21 = t => {
  const { a, b } = SH.S21;
  cam('S21-cam', t, [[a, 960, 520, 1.12], [b, 1020, 540, 1.0]]);
  fadeIn('S21-fr', t, a + .05, .6); idle('s21k', t, 0, .3); expr('s21k', 'neutral');
  if (t < C.than) op('S21-rb', 0); else { const p = eOut(P(t, C.than, C.than + .5)); put('S21-rb', { sy: p, o: 1 }); }
  popIn('S21-cd', t, a + .3); put('S21-fl', { sx: 1 + bob(t, 13, .08), sy: 1 + bob(t, 11, .1, 1), o: 1 });
  slam('S21-l', t, C.than); slam('S21-y', t, C.y1847b);
};
F.S22 = t => {
  const { a, b } = SH.S22;
  cam('S22-cam', t, [[a, 960, 540, 1.0], [b, 960, 580, 1.06]]);
  const p = eIO(P(t, a + .2, C.parak23 + .3)); put('S22-f', { r: -9 * p + bob(t, 2, 1), dy: 80 * p, o: 1 }); op('S22-g', p);
  slam('S22-l', t, C.gall23 - .1); slam('S22-l2', t, C.parak23 - .5);
  slide('S22-ar', t, C.parak23 - .5, .4, 0, -200); if (t > C.parak23 - .1) put('S22-ar', { dy: bob(t, 3, 10), o: 1 });
};
F.S23 = t => {
  const { a, b } = SH.S23;
  cam('S23-cam', t, [[a, 960, 560, 1.08], [b, 960, 540, 1.0]]);
  const w = t > C.diam ? Math.sin((t - C.diam) * 6) : 0;
  put('S23-ch', { dx: 40 * w, r: 4 * w, o: 1 });
  slide('S23-a', t, a + .05, .4, -400, 0); slide('S23-b', t, a + .1, .4, 400, 0);
  if (t > a + .5) { put('S23-a', { dx: 30 * w, r: -6, o: 1 }); put('S23-b', { dx: 30 * w, r: 6, o: 1 }); }
  idle('s23a', t, 0, 1.6); idle('s23b', t, .5, 1.6); expr('s23a', 'angry'); expr('s23b', 'angry');
  popBob('S23-bt', t, C.diam + .1, { amp: 12 }); slam('S23-l', t, C.diam); slam('S23-l2', t, C.diad - .1);
};
F.S24 = t => {
  const { a, b } = SH.S24;
  cam('S24-cam', t, [[a, 800, 560, 1.06], [C.ypops, 900, 540, 1.0], [C.ypops + .4, 1100, 540, 1.0], [b, 1100, 540, 1.03]]);
  dropQ('S24-o', t, C.otto - .2); idle('s24o', t, 0, 1.3); expr('s24o', 'happy');
  slide('S24-pd', t, a + .1, .4, 0, 200);
  put('S24-cs', { dy: -40 * Math.sin(Math.PI * P(t, C.enis25, C.enis25 + .45)), o: 1 }); popBob('S24-ar', t, C.enis25, { amp: 8 });
  [0, 1, 2].forEach(i => { idle(`s24c${i}`, t, i * .3, 1.2); expr(`s24c${i}`, 'happy'); });
  slam('S24-l', t, C.ypops - .1); popIn('S24-bx', t, C.ypops - .1); slam('S24-l2', t, C.ypops + .3);
};
F.S25 = t => {
  const { a, b } = SH.S25;
  cam('S25-cam', t, [[a, 960, 560, .98], [C.sygkr, 1060, 560, 1.0], [b, 960, 545, .97]]);
  popIn('S25-pa', t, a + .05); popIn('S25-ct', t, a + .2); idle('s25ct', t, 0, 1.4); expr('s25ct', 'angry');
  [0, 1, 2].forEach(i => { slide(`S25-m${i}`, t, a + .1 + i * .1, .4, -500, 0); idle(`s25m${i}`, t, i * .3, 1.5); expr(`s25m${i}`, 'angry'); });
  [0, 1, 2].forEach(i => { if (t < C.sygkr) op(`S25-b${i}`, 0); else put(`S25-b${i}`, { o: (Math.sin((t - C.sygkr) * 12 + i * 2) > -.3) ? 1 : 0, r: bob(t, 20, 8, i) }); });
  slam('S25-l', t, C.antip - .1); slam('S25-l3', t, C.sygkr); slam('S25-l2', t, C.antip + .4);
};
F.S26 = t => {
  const { a, b } = SH.S26;
  cam('S26-cam', t, [[a, 960, 560, 1.04], [b, 960, 540, 1.0]]);
  [0, 1, 2].forEach(i => { popIn(`S26-m${i}`, t, a + .05 + i * .08); idle(`s26m${i}`, t, i * .3, 1.2); expr(`s26m${i}`, t > C.apal ? 'happy' : 'angry'); });
  const p = eIO(P(t, C.apal - .3, C.apal + .5));
  op('S26-zz', t < C.diaf - .2 ? 0 : 1 - p); op('S26-wv', p);
  slam('S26-l', t, C.diaf); slam('S26-l2', t, C.apal);
};
F.S27 = t => {
  const { a, b } = SH.S27;
  cam('S27-cam', t, [[a, 960, 560, 1.0], [b, 960, 545, .98]]);
  slide('S27-l', t, a + .05, .5, -500, 0); slide('S27-r', t, a + .1, .5, 500, 0);
  put('S27-ca', { dx: t > C.krim ? -12 * Math.abs(Math.sin((t - C.krim) * 7)) : 0, o: 1 });
  [0, 1, 2, 3].forEach(i => { const t0 = C.krim + i * .2; if (t < t0) op(`S27-s${i}`, 0); else put(`S27-s${i}`, { s: .6 + .5 * eOut(P(t, t0, t0 + .8)), dy: -40 * P(t, t0, t0 + 2), o: 1 - .4 * P(t, t0 + 1, t0 + 2) }); });
  slam('S27-t', t, C.krim - .1);
};
F.S28 = t => {
  const { a, b } = SH.S28;
  cam('S28-cam', t, [[a, 800, 560, 1.04], [C.empist + .3, 1100, 560, 1.0], [b, 1100, 545, 1.03]]);
  dropQ('S28-a', t, a + .05); dropQ('S28-b', t, a + .15); idle('s28a', t, 0, 1.2); idle('s28b', t, .4, 1.2);
  expr('s28a', t > C.empist ? 'sad' : 'neutral'); expr('s28b', t > C.empist ? 'sad' : 'neutral');
  slam('S28-t1', t, a + .45); slam('S28-t2', t, a + .55);
  const hp = eOut(P(t, C.empist + .1, C.empist + .6));
  popIn('S28-hl', t, C.empist - .3); popIn('S28-hr', t, C.empist - .3);
  if (t > C.empist + .1) { put('S28-hl', { dx: -40 * hp, r: -14 * hp, o: 1 }); put('S28-hr', { dx: 40 * hp, r: 14 * hp, o: 1 }); }
  [0, 1, 2, 3].forEach(i => { popIn(`S28-c${i}`, t, a + .2 + i * .07); idle(`s28c${i}`, t, i * .3, 1.2);
    if (t > C.empist + .4) put(`S28-c${i}`, { sx: -1, dx: 260 * eIn(P(t, C.empist + .4 + i * .1, C.empist + 1.6)), o: 1 }); });
  slam('S28-l', t, C.empist - .1); slam('S28-l2', t, C.empist + .4);
};
F.S29 = t => {
  const { a, b } = SH.S29;
  cam('S29-cam', t, [[a, 960, 600, 1.08], [C.gall28, 960, 560, 1.0], [b, 960, 545, 1.04]]);
  slide('S29-j', t, a + .05, .45, -500, 0); slide('S29-m', t, a + .1, .45, 500, 0);
  idle('s29j', t, 0, 1.6); idle('s29m', t, .5, 1.6); expr('s29j', 'angry'); expr('s29m', 'angry');
  popIn('S29-h', t, a + .3); idle('s29h', t, .2, .8); expr('s29h', 'shock'); if (t > C.viai) put('S29-h', { dx: bob(t, 30, 3), o: 1 });
  slam('S29-l', t, C.viai - .1); slam('S29-t1', t, C.angl28 - .1); slam('S29-t2', t, C.gall28 - .1); slam('S29-t3', t, a + .5);
};
F.S30 = t => {
  const { a, b } = SH.S30;
  cam('S30-cam', t, [[a, 1000, 560, 1.0], [b, 960, 560, .97]]);
  op('S30-ld', 1);
  [0, 1, 2].forEach(i => { slide(`S30-s${i}`, t, a + .05 + i * .12, .6, 900, 0); if (t > a + .7 + i * .12) put(`S30-s${i}`, { dy: bob(t, 2, 6, i), r: bob(t, 1.6, 1.2, i), o: 1 }); });
  draw('S30-ch', t, C.naft + .2, .6); slam('S30-l', t, C.naft);
};
F.S31 = t => {
  const { a, b } = SH.S31;
  cam('S31-cam', t, [[a, 800, 560, 1.06], [C.pats, 1100, 560, 1.0], [b, 1140, 545, 1.03]]);
  popIn('S31-ck', t, a + .05); put('S31-h', { r: -720 * eIO(P(t, a + .2, C.pats)), o: 1 });
  slam('S31-l', t, C.proig - .1);
  dropQ('S31-d', t, C.pats - .3, { h: 700 });
};
F.S32 = t => {
  const { a, b } = SH.S32;
  cam('S32-cam', t, [[a, 960, 560, 1.04], [b, 960, 545, 1.0]]);
  [['S32-gr', 0], ['S32-uk', 1], ['S32-fr', 2]].forEach(([id, i]) => { popIn(id, t, a + .05 + i * .08); if (t > a + .5) put(id, { r: bob(t, 2, 1.2, i), o: 1 }); });
  const k = eBack(P(t, C.dysx, C.dysx + .5)); op('S32-rl', 1); op('S32-rr', 1);
  if (t > C.dysx) { put('S32-rl', { r: 16 * k, o: 1 }); put('S32-rr', { r: -16 * k, o: 1 }); }
  popIn('S32-bt', t, C.dysx); slam('S32-l', t, C.sxes - .1);
};
F.S33 = t => {
  const { a, b } = SH.S33;
  cam('S33-cam', t, [[a, 900, 560, 1.04], [C.prosor, 1100, 560, 1.0], [b, 1100, 545, 1.03]]);
  dropQ('S33-m', t, a + .05); idle('s33m', t, 0, 1.6); expr('s33m', 'happy');
  [0, 1, 2, 3].forEach(i => { const t0 = C.kerdi - .3 + i * .12; if (t < t0) op(`S33-c${i}`, 0); else put(`S33-c${i}`, { dy: -80 * eOut(P(t, t0, t0 + .5)) + bob(t, 3, 6, i), o: 1 }); });
  popIn('S33-hg', t, C.prosor - .3);
  const s = P(t, C.prosor, b); put('S33-st', { sy: 1 - s, o: 1 }); put('S33-sb', { sy: .2 + .8 * s, o: 1 });
  slam('S33-l', t, C.kerdi - .1); slam('S33-l2', t, C.prosor);
};
F.S34 = t => {
  const { a, b } = SH.S34;
  cam('S34-cam', t, [[a, 800, 560, 1.04], [C.apodyn, 1100, 560, 1.0], [b, 1100, 545, 1.04]]);
  if (t < C.itta) { popIn('S34-f', t, a + .05); } else put('S34-f', { r: 42 * eBack(P(t, C.itta, C.itta + .5)), o: 1 });
  op('S34-m', 1); idle('s34m', t, 0, 1); expr('s34m', 'sad');
  put('S34-m', { s: 1 - .3 * eIO(P(t, C.apodyn - .2, C.apodyn + 1)), o: 1 });
  slam('S34-l', t, C.itta - .1); slam('S34-l2', t, C.apodyn);
};
F.S35 = t => {
  const { a, b } = SH.S35;
  cam('S35-cam', t, [[a, 960, 520, 1.0], [C.end, 960, 560, 1.06]]);
  idle('s35m', t, 0, .8); expr('s35m', 'sad');
  const steps = Math.floor(P(t, C.stad, C.exaf + .6) * 4) / 4; put('S35-m', { o: 1 - steps });
  const c = eIO(P(t, C.exaf, C.skini + .8)); put('S35-cl', { dx: 800 * c, o: 1 }); put('S35-cr', { dx: -800 * c, o: 1 });
  slam('S35-l', t, C.stad); if (t > C.exaf) put('S35-l', { o: 1 - P(t, C.exaf, C.exaf + .4) });
  op('S35-black', P(t, C.end + .6, C.end + 2.0));
};
