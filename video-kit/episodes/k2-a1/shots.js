// Κεφ.2 Α.1 — per-shot animation (browser, after engine/runtime.js). seek(t) is PURE.
// ⚠️ No literal seconds: everything is a cue (C.*) or a shot bound (SH.Sx.a / .b), so a new voice re-times it all.
const SH = {}; D.shots.forEach(s => { SH[s.id] = s; });
const bob = (t, f = 2, a = 8, ph = 0) => Math.sin(t * f + ph) * a;

// screen shakes & flashes (time, amplitude, duration)
[[C.t2, 8], [C.antik + .3, 12], [C.kommata4 - .05, 14], [C.pelat, 10], [C.katal + .3, 14], [C.perip + .3, 10], [C.apous, 10],
 [C.xilia, 8], [C.koryfi + .3, 12], [C.armat + .2, 12], [C.den26, 14], [C.dedom, 8], [C.anamf, 8], [C.othom28, 18, .5],
 [C.logo, 10], [C.nomoth, 8], [C.exot, 8], [C.polit34 + .2, 12], [C.oroi, 10], [C.anagk, 10]].forEach(a => shk(...a));
[C.pelat, C.othom28].forEach(t => fl(t, .4));

F.S1 = t => {
  const { a, b } = SH.S1; waves('S1', t);
  cam('S1-cam', t, [[a, 980, 560, .55], [C.t2, 1000, 600, 1.05], [b, 1010, 610, 1.12]]);
  for (let i = 0; i < 11; i++) draw('S1-l' + i, t, a + .2 + i * .09, .5);
  for (let i = 0; i < 12; i++) popIn('S1-n' + i, t, a + .15 + i * .07);
  slam('S1-t1', t, C.t1 + .1, { from: 2.6, rot: -8 }); slam('S1-t2', t, C.t2, { from: 2.2, rot: 4 }); slam('S1-t3', t, C.t2 + .45, { from: 1.8, rot: -3 });
};
F.S2 = t => {
  const { a, b } = SH.S2;
  cam('S2-cam', t, [[a, 960, 540, 1.02], [b, 960, 540, 1.08]]);
  $('S2-fill').setAttribute('width', 1248 * eOut(P(t, C.proep - .2, C.proep + 1.1)));
  const pd = P(t, a + .1, a + .6); put('S2-pin', { dy: -260 * (1 - bounce(pd)), o: t < a + .1 ? 0 : 1 }); slam('S2-1821', t, a + .45, { from: 1.8 });
  slam('S2-l1', t, C.proep, { from: 2, rot: -4 });
  // the Ottoman banner drops in and covers the period
  const fd = P(t, C.antik - .15, C.antik + .3); put('S2-flag', { dy: -900 * (1 - eOut(fd)), o: t < C.antik - .15 ? 0 : 1, r: t > C.antik + .3 ? Math.sin((t - C.antik) * 3) * 1.5 : 0 });
  slam('S2-l2', t, C.antik + .2, { from: 2.2, rot: 5 });
};
F.S3 = t => {
  const { a, b } = SH.S3;
  cam('S3-cam', t, [[a, 960, 540, 1], [b, 960, 520, 1.05]]);
  ['S3-a', 'S3-b', 'S3-c'].forEach((id, i) => drop(id, t, Math.min(C.ellines, a + .5) - .3 + i * .12));
  slide('S3-ott', t, a, .4, -400, 0);
  const crash = C.kommata4 - .05;
  for (let i = 0; i < 7; i++) {
    const t0 = C.sygkr - .1 + i * .1;
    if (t < t0) { op('S3-k' + i, 0); continue; }
    if (t < crash) { const p = eBack(P(t, t0, t0 + .35), 1.6); put('S3-k' + i, { dy: -500 * (1 - p), r: (1 - p) * (i % 2 ? 30 : -30), o: 1 }); }
    else { const k = t - crash; put('S3-k' + i, { dx: (i - 3) * 60 * k, dy: 700 * k * k + 140 * k, r: (i % 2 ? 1 : -1) * 200 * k, o: 1 - clamp((k - .7) / .3) }); }
  }
  popIn('S3-x', t, crash + .1, { rot: 30 });
  ['s3a', 's3b', 's3c'].forEach((id, i) => { idle(id, t, i * .5); expr(id, t > crash ? 'sad' : (t > C.sygkr ? 'happy' : (blinkAt(t, [a + 1 + i * .3]) ? 'blink' : 'neutral'))); headTilt(id, t > crash ? (i - 1) * 6 : 0); });
  slam('S3-l2', t, C.sygkr + .5, { from: 1.8 }); slam('S3-l', t, crash, { from: 2.2, rot: -4 });
};
F.S4 = t => {
  const { a, b } = SH.S4;
  cam('S4-cam', t, [[a, 960, 560, 1.06], [b, 960, 540, 1]]);
  const held = t > C.ypost + .45;
  idle('s4v', t, 0, held ? 1 : .4); expr('s4v', held ? 'happy' : 'strain');
  const wob = held ? 0 : Math.sin(q15(t) * 22) * 6;
  put('S4-v', { sy: held ? 1 : .94 + Math.sin(q15(t) * 22) * .01 });
  put('S4-sack', { dy: held ? -40 * eOut(P(t, C.ypost + .45, C.ypost + .8)) : wob, r: held ? 0 : wob * .4 });
  slide('S4-brace', t, C.ypost - .1, .5, 900, 0);
  slam('S4-l', t, C.alli, { from: 2, rot: -5 });
};
F.S5 = t => {
  const { a, b } = SH.S5;
  cam('S5-cam', t, [[a, 800, 540, 1.25], [C.odig - .3, 860, 540, 1.05], [C.odig + .5, 960, 540, 1], [b, 960, 540, 1.03]]);
  popIn('S5-w-hub', t, a + .05);
  for (let i = 0; i < 7; i++) { draw(`S5-w-l${i}`, t, a + .2 + i * .1, .4); popIn(`S5-w-n${i}`, t, a + .45 + i * .1); draw(`S5-w-r${i}`, t, C.pelat + i * .06, .4); }
  slam('S5-l', t, C.pelat, { from: 2.6, rot: -6 });
  ['S5-c0', 'S5-c1', 'S5-c2'].forEach((id, i) => { popIn(id, t, C.exis - .1 + i * .3, { rot: i % 2 ? 8 : -8 }); if (t > C.exis + 1.2) put(id, { dy: bob(t, 2, 6, i), o: 1 }); });
  slam('S5-l2', t, C.exis - .3, { from: 1.8 });
};
F.S6 = t => {
  const { a, b } = SH.S6;
  cam('S6-cam', t, [[a, 960, 560, 1.04], [C.katal, 960, 540, 1.1], [b, 960, 520, 1.12]]);
  const run = P(t, C.antag - .1, C.katal);
  const sat = t > C.katal;
  // left notable wins the seat, right one is knocked down
  const ax = lerp(360, 800, eIO(run)), bx = lerp(1560, 1120, eIO(run));
  if (!sat) { put('S6-a', { x: ax, dy: -Math.abs(Math.sin(q15(t) * 12)) * 26 * (run > 0 && run < 1) }); put('S6-b', { x: bx, dy: -Math.abs(Math.sin(q15(t) * 12 + 1)) * 26 * (run > 0 && run < 1) }); }
  else { const k = eOut(P(t, C.katal, C.katal + .4)); put('S6-a', { x: lerp(800, 960, k), y: lerp(910, 690, k) - Math.sin(k * Math.PI) * 120 }); put('S6-b', { x: lerp(1120, 1360, k), y: lerp(910, 860, k), r: 78 * k }); }
  idle('s6a', t, 0); idle('s6b', t, .5);
  expr('s6a', sat ? 'happy' : (run > 0 ? 'angry' : 'neutral')); expr('s6b', sat ? 'shock' : (run > 0 ? 'angry' : 'neutral'));
  op('S6-spark', run > .1 && !sat ? (Math.floor(t * 15) % 3 ? 1 : .3) : 0);
  slam('S6-l', t, C.antag, { from: 2.4, rot: -6 }); slam('S6-l2', t, C.theseon, { from: 2 });
};
F.S7 = t => {
  const { a, b } = SH.S7;
  cam('S7-cam', t, [[a, 960, 540, 1], [b, 1000, 540, 1.06]]);
  slide('S7-off', t, a, .4, -700, 0); idle('s7o', t, 0);
  expr('s7o', t > C.othom9 + .2 && t < C.othom9 + 1.6 ? 'yawn' : (blinkAt(t, [a + .9, C.afth + .8]) ? 'blink' : 'neutral'));
  popIn('S7-umb', t, a + .2); put('S7-umb', { dy: bob(t, 1.6, 4), o: t > a + .2 ? 1 : 0 });
  for (let i = 0; i < 4; i++) $('S7-h' + i).setAttribute('opacity', t > C.ellip + i * .12 ? 1 : 0);
  slide('S7-cloud', t, C.ypik - .2, .5, 0, -500); if (t > C.ypik + .3) put('S7-cloud', { dx: bob(t, 9, 3), o: 1 });
  for (let i = 0; i < 3; i++) { const t0 = C.perip + .1 + i * .22, k = (t - t0) % .9; if (t < t0) { op('S7-b' + i, 0); continue; } put('S7-b' + i, { dy: k * 380, o: k < .75 ? 1 : 0 }); }
  idle('s7v', t, .3); expr('s7v', t > C.perip + .3 ? 'shock' : 'neutral');
  if (t > C.perip + .3) put('S7-v', { dx: Math.sin(q15(t) * 40) * 3 });
  slam('S7-l', t, C.ellip, { from: 2.2, rot: -5 }); slam('S7-l2', t, C.othom9, { from: 1.8 }); fadeIn('S7-ar', t, C.othom9 + .2, .2);
};
F.S8 = t => {
  const { a, b } = SH.S8;
  cam('S8-cam', t, [[a, 960, 520, 1.08], [b, 960, 560, 1]]);
  put('S8-v', { r: Math.sin(t * 3.2) * 9, dx: Math.sin(t * 1.6) * 14 }); idle('s8v', t, 0);
  slam('S8-l', t, C.apous, { from: 2.6, rot: -6 });
  fadeIn('S8-net', t, C.apous + .7, .35); if (t > C.apous + 1.1) $('S8-net').setAttribute('opacity', .55 + .35 * Math.abs(Math.sin(t * 5)));
  popIn('S8-q', t, C.pron - .3, { rot: 15 }); if (t > C.pron + .1) put('S8-q', { dy: bob(t, 4, 10), o: 1 });
};
F.S9 = t => {
  const { a, b } = SH.S9;
  cam('S9-cam', t, [[a, 960, 560, 1.1], [C.avev - .1, 960, 540, 1.02], [C.avev + .3, 960, 520, 1.18], [b, 960, 520, 1.2]]);
  expr('s9v', blinkAt(t, [a + 1.4]) ? 'blink' : (t > C.avev ? 'shock' : 'sad'));
  idle('s9v', t, 0, .4); put('S9-v', { dx: Math.sin(t * 2.4) * 10 });
  for (let i = 0; i < 5; i++) { const ang = t * 1.6 + i * 2 * Math.PI / 5; put('S9-q' + i, { x: 960 + Math.cos(ang) * 720, y: 470 + Math.sin(ang) * 300, s: .8 + .25 * Math.sin(ang), o: t > C.diark - .3 + i * .1 ? 1 : 0, r: Math.sin(t * 3 + i) * 12 }); }
  slam('S9-l', t, C.avev - .1, { from: 2.2, rot: -5 });
};
F.S10 = t => {
  const { a, b } = SH.S10;
  cam('S10-cam', t, [[a, 900, 560, 1.06], [C.asfal, 1000, 540, 1], [b, 1020, 540, 1.04]]);
  $('S10-door').setAttribute('opacity', t > C.katafeug - .2 ? 1 : 0); popIn('S10-x', t, C.katafeug, { rot: 20 });
  const run = P(t, C.katafeug, C.katafeug + 1.3);
  put('S10-v', { x: lerp(700, 1500, eIO(run)), dy: run > 0 && run < 1 ? -Math.abs(Math.sin(q15(t) * 14)) * 30 : 0, sx: 1 });
  idle('s10v', t, 0); expr('s10v', run >= 1 ? 'happy' : (run > 0 ? 'shock' : 'sad'));
  ['s10w', 's10p'].forEach((id, i) => { idle(id, t, i * .6); expr(id, 'happy'); });
  slam('S10-l', t, C.kratik, { from: 2, rot: -5 });
  popIn('S10-sh', t, C.stoix - .2, { rot: -15 }); if (t > C.stoix + .4) put('S10-sh', { dy: bob(t, 2.4, 8), o: 1 });
  slam('S10-l2', t, C.stoix, { from: 1.8 });
};
F.S11 = t => {
  const { a, b } = SH.S11;
  cam('S11-cam', t, [[a, 960, 650, 1.7], [C.evryt - .2, 960, 640, 1.55], [C.evryt + .9, 960, 540, 1], [b, 960, 540, .98]]);
  ['s11a', 's11b'].forEach((id, i) => { idle(id, t, i * .5); expr(id, blinkAt(t, [a + .8 + i * .3]) ? 'blink' : 'happy'); });
  for (let i = 0; i < 6; i++) { popIn('S11-r' + i, t, C.evryt + .05 + Math.abs(2.5 - i) * .12); idle('s11r' + i, t, i * .3); }
  slam('S11-l', t, C.protos - .05, { from: 1.8 }); slam('S11-l2', t, C.evryt + .4, { from: 2.2, rot: -4 });
};
F.S12 = t => {
  const { a, b } = SH.S12;
  cam('S12-cam', t, [[a, 960, 760, 1.12], [C.katheta - .1, 960, 740, 1.1], [C.katheta + 1, 960, 560, 1], [b, 960, 540, 1.03]]);
  for (let i = 0; i < 3; i++) { popIn('S12-g' + i, t, a + .1 + i * .12); idle('s12m' + i, t, i * .4); idle('s12w' + i, t, i * .4 + .2); }
  draw('S12-h0', t, C.orizon - .1, .5); draw('S12-h1', t, C.orizon + .1, .5); slam('S12-o', t, C.orizon, { from: 1.8 });
  for (let i = 0; i < 3; i++) draw('S12-v' + i, t, C.katheta + .1 + i * .15, .6);
  slam('S12-k', t, C.katheta + .3, { from: 1.8 });
  const rise = eBack(P(t, C.ypsil - .1, C.ypsil + .6), 1.4);
  put('S12-plat', { dy: 160 * (1 - eOut(P(t, C.katheta - .2, C.katheta + .5))) - 50 * rise + bob(t, 1.5, 4), o: t > C.katheta - .2 ? 1 : 0 });
  idle('s12p', t, 0); idle('s12pw', t, .5); expr('s12p', 'happy');
  slam('S12-p', t, C.patron, { from: 2.2, rot: -4 }); slam('S12-y', t, C.ypsil, { from: 1.8 });
};
F.S13 = t => {
  const { a, b } = SH.S13; waves('S13', t);
  const pe = PP.pelop;
  cam('S13-cam', t, [[a, 1010, 560, .85], [C.pelop + .2, pe[0] + 60, pe[1] - 20, 1.6], [b, pe[0] + 60, pe[1] - 30, 1.75]]);
  $('S13-hl').setAttribute('opacity', .85 * eOut(P(t, C.pelop, C.pelop + .6)));
  slam('S13-pe', t, C.pelop + .15, { from: 2 });
  slam('S13-y', t, C.xilia, { from: 2.6, rot: -8 });
  ['A', 'B'].forEach((k, j) => { const t0 = C.xilia + .6 + j * 1.2; for (let i = 0; i < 5; i++) { if (i < 4) draw(`S13-${k}-l${i}`, t, t0 + i * .08, .45); popIn(`S13-${k}-n${i}`, t, t0 + .2 + i * .07); } });
  slam('S13-l', t, C.dyo - .1, { from: 1.8 }); ['A', 'B'].forEach((k, j) => { const pu = t > C.dyo + j * .2 ? Math.exp(-5 * (t - C.dyo - j * .2)) * Math.sin((t - C.dyo - j * .2) * 18) : 0; for (let i = 0; i < 5; i++) if (t > C.xilia + .8 + j * 1.2 + .2 + i * .07 + .4) put(`S13-${k}-n${i}`, { s: 1 + .5 * pu, o: 1 }); });
};
F.S14 = t => {
  const { a, b } = SH.S14;
  cam('S14-cam', t, [[a, 960, 600, 1.08], [b, 960, 540, 1]]);
  ['S14A', 'S14B'].forEach((p, j) => {
    for (let i = 0; i < 5; i++) { const id = `${p}-c${i}`; drop(id, t, a + j * .15 + (i < 3 ? 0 : .3) + (i % 3) * .06, { h: 700 }); idle(`${p}c${i}`.toLowerCase(), t, i * .3 + j, .5); expr(`${p}c${i}`.toLowerCase(), 'strain'); }
    drop(`${p}-top`, t, C.koryfi - .1 + j * .15, { h: 900 });
    idle(`${p}p`.toLowerCase(), t, j); idle(`${p}w`.toLowerCase(), t, j + .4);
  });
  slam('S14-k', t, C.koryfi + .2, { from: 1.8 }); fadeIn('S14-ka', t, C.koryfi + .35, .25); slam('S14-l', t, C.prokr, { from: 2.2, rot: -4 });
};
F.S15 = t => {
  const { a, b } = SH.S15;
  cam('S15-cam', t, [[a, 960, 560, 1.06], [C.epipeda - .2, 960, 540, 1], [C.epipeda + .6, 960, 470, 1.15], [C.dimth - .1, 960, 470, 1.15], [C.dimth + .6, 960, 540, 1], [b, 960, 540, 1.02]]);
  const tug = Math.sin(t * 2.6) * 40;
  put('S15-a', { dx: -Math.max(0, tug) * .4, r: -10 }); put('S15-b', { dx: Math.max(0, -tug) * .4, r: 10 }); put('S15-knot', { dx: tug });
  idle('s15a', t, 0); idle('s15b', t, .5); expr('s15a', 'strain'); expr('s15b', 'strain');
  for (let i = 0; i < 4; i++) { const t0 = C.epipeda + i * .28; $('S15-f' + i).setAttribute('fill', t < t0 ? '#e9dcc0' : (Math.floor((t - t0) * 2.5 + i) % 2 ? '#c6b2d9' : '#a8d6cf')); }
  for (let i = 0; i < 4; i++) popIn('S15-ch' + i, t, C.dimth + i * .12);
  slam('S15-l', t, C.entonos, { from: 2.2, rot: -5 }); slam('S15-e', t, C.epirr, { from: 1.8, rot: -6 }); slam('S15-d', t, C.dimth + .2, { from: 1.8, rot: 6 });
};
F.S16 = t => {
  const { a, b } = SH.S16; waves('S16', t);
  const st = PP.sterea, hy = PP.hydra, ps = PP.psara;
  cam('S16-cam', t, [[a, st[0], st[1] + 40, 1.25], [C.nisia - .25, st[0] + 60, st[1] + 40, 1.35], [C.nisia + .6, (hy[0] + ps[0]) / 2, (hy[1] + ps[1]) / 2 + 40, .95], [b, (hy[0] + ps[0]) / 2, (hy[1] + ps[1]) / 2 + 40, .9]]);
  $('S16-hl').setAttribute('opacity', .85 * eOut(P(t, C.sterea - .1, C.sterea + .5)));
  slam('S16-st', t, C.sterea, { from: 2 });
  for (let i = 0; i < 5; i++) { draw('S16-sl' + i, t, C.armat - .2 + i * .08, .4); popIn('S16-sn' + i, t, C.armat + i * .08); }
  drop('S16-ar', t, C.armat - .35, { h: 600 }); idle('s16a', t, 0);
  slam('S16-l', t, C.armat, { from: 2.2, rot: -4 });
  for (let i = 0; i < 3; i++) { popIn('S16-sh' + i, t, C.nisia + .3 + i * .15, { s: 1 }); if (t > C.nisia + .8) put('S16-sh' + i, { dy: bob(t, 2, 3, i), r: Math.sin(t * 1.6 + i) * 3, o: 1 }); }
  slam('S16-ns', t, C.nisia + .2, { from: 2 });
};
F.S17 = t => {
  const { a, b } = SH.S17;
  cam('S17-cam', t, [[a, 960, 560, 1.05], [b, 960, 540, 1]]);
  $('S17-cam').querySelector('rect[fill="url(#waves)"]').setAttribute('transform', `translate(${(t * 22) % 90},0)`);
  const sl = P(t, a, C.igesia + .2); put('S17-ship', { dx: -1400 * (1 - eOut(sl)), dy: bob(t, 1.8, 6), r: Math.sin(t * 1.3) * 1.5 });
  for (let i = 0; i < 3; i++) { popIn('S17-s' + i, t, a + .3 + i * .15); if (t > a + .8) put('S17-s' + i, { dy: bob(t, 2.2, 5, i), r: Math.sin(t * 1.7 + i) * 2, o: 1 }); draw('S17-l' + i, t, C.megal25 - .2 + i * .1, .5); }
  idle('s17o', t, 0); idle('s17w', t, .5);
  slam('S17-l', t, C.igesia, { from: 1.8 }); slam('S17-l2', t, C.megal25, { from: 2.2, rot: -4 });
};
F.S18 = t => {
  const { a, b } = SH.S18;
  cam('S18-cam', t, [[a, 960, 560, 1.06], [b, 960, 540, 1]]);
  popIn('S18-w-hub', t, a + .05); for (let i = 0; i < 6; i++) { draw(`S18-w-l${i}`, t, a + .1 + i * .05, .3); draw(`S18-w-r${i}`, t, a + .3, .3); popIn(`S18-w-n${i}`, t, a + .2 + i * .05); }
  slam('S18-n1', t, a + .3, { from: 1.6 }); popIn('S18-bld', t, C.katop + .3); slam('S18-n2', t, C.katop + .5, { from: 1.6 });
  draw('S18-ar', t, C.katop, .7);
  const brk = t > C.den26; $('S18-ar').setAttribute('stroke', brk ? '#DE5B45' : '#f4efe4'); $('S18-ar').setAttribute('stroke-dasharray', brk ? '255 70 1000' : '1000 1000');
  popIn('S18-brk', t, C.den26, { rot: 20 }); slam('S18-x', t, C.den26 + .1, { from: 2.6, rot: 25 });
  slam('S18-l', t, C.metex - .3, { from: 2, rot: -4 });
};
F.S19 = t => {
  const { a, b } = SH.S19;
  cam('S19-cam', t, [[a, 960, 540, 1.08], [C.othom28, 960, 540, 1], [b, 960, 540, 1.04]]);
  slam('S19-l', t, C.plaisio - .1, { from: 2, rot: -4 }); popIn('S19-fr', t, a + .1, { rot: -6 });
  [0, 1].forEach(i => slam('S19-bo' + i, t, C.dedom + i * .12, { from: 3 })); [2, 3].forEach(i => slam('S19-bo' + i, t, C.anamf + (i - 2) * .12, { from: 3 }));
  slam('S19-d1', t, C.dedom, { from: 1.8, rot: -6 }); slam('S19-d2', t, C.anamf, { from: 1.8, rot: 6 });
  idle('s19v', t, 0, .5); expr('s19v', t > C.othom28 ? 'shock' : 'strain'); put('S19-v', { dx: t < C.othom28 ? Math.sin(q15(t) * 30) * 4 : 0 });
  $('S19-fill').setAttribute('r', 600 * eIO(P(t, C.othom28 - .1, C.othom28 + .7)));
  popIn('S19-cres', t, C.kyriarx + .5, { rot: -20 });
  slam('S19-k', t, C.othom28, { from: 2.4, rot: -4 }); slam('S19-hud', t, a + .2, { from: 2, rot: -6 });
};
F.S20 = t => {
  const { a, b } = SH.S20;
  cam('S20-cam', t, [[a, 960, 700, 1.3], [C.axiom - .4, 960, 640, 1.15], [C.axiom + .3, 960, 540, 1], [b, 960, 540, 1.03]]);
  ['s20a', 's20b'].forEach((id, i) => { idle(id, t, i * .5, 1.4); expr(id, t > C.diafon ? 'angry' : 'neutral'); headTilt(id, t > C.diafon ? (i ? -7 : 7) : 0); });
  popIn('S20-ba', t, C.diafon, { rot: -10 }); popIn('S20-bb', t, C.diafon + .25, { rot: 10 });
  const gone = 1 - P(t, C.axiom - .6, C.axiom - .3);
  if (t > C.diafon + .5) { put('S20-ba', { dy: bob(t, 6, 5), o: gone }); put('S20-bb', { dy: bob(t, 6, 5, 1), o: gone }); }
  slam('S20-l', t, C.diafon + .1, { from: 1.8 }); if (t > C.diafon + .5) put('S20-l', { o: gone });
  slide('S20-p0', t, C.axiom - .45, .45, -900, 0); slam('S20-e0', t, C.axiom - .4, { from: 1.8 }); slam('S20-t0', t, C.axiom, { from: 2 });
  slide('S20-p1', t, C.mikro - .45, .45, 900, 0); slam('S20-e1', t, C.mikro - .4, { from: 1.8 }); slam('S20-t1', t, C.mikro, { from: 2 });
  const dk = ((t - C.mikro) % 1.1) / 1.1; $('S20-drip').setAttribute('cy', -70 + dk * 160); $('S20-drip').setAttribute('opacity', t > C.mikro && dk < .85 ? 1 : 0);
};
F.S21 = t => {
  const { a, b } = SH.S21;
  cam('S21-cam', t, [[a, 960, 560, 1.06], [C.texn, 960, 540, 1.12], [SH.S21.b - 2, 960, 540, 1.12], [b, 1060, 560, 1.02]]);
  idle('s21a', t, 0); idle('s21b', t, .4); expr('s21a', 'happy'); expr('s21b', blinkAt(t, [a + 1.5]) ? 'blink' : 'happy');
  const hit = Math.max(0, Math.sin(q15(t) * 14)); $('s21a-armR') && put('S21-a', { dy: -hit * 8 });
  for (let i = 0; i < 3; i++) { const t0 = a + .5 + i * .9, p = P(t, t0, t0 + .45); put('S21-st' + i, { dy: -500 * (1 - bounce(p)), o: t < t0 ? 0 : 1 }); }
  slam('S21-l', t, C.texn - .05, { from: 2.2, rot: -5 });
  drop('S21-sign', t, SH.S21.b - 1.9, { h: 700 });
};
F.S22 = t => {
  const { a, b } = SH.S22;
  cam('S22-cam', t, [[a, 700, 560, 1.12], [C.nomoth - .2, 760, 560, 1.05], [C.exot + .4, 960, 540, 1], [b, 960, 540, 1.02]]);
  ['s22a', 's22b', 's22c'].forEach((id, i) => { idle(id, t, i * .4); expr(id, t > C.logo + .2 ? 'sad' : 'neutral'); });
  popIn('S22-bub', t, C.logo - .5, { rot: -8 }); slam('S22-x', t, C.logo, { from: 2.6, rot: 25 });
  if (t > C.logo + .4) put('S22-bub', { o: 1 - .5 * P(t, C.logo + .4, C.logo + 1), dy: 20 * P(t, C.logo + .4, C.logo + 1) });
  slam('S22-l', t, C.logo + .05, { from: 2.2, rot: -4 });
  slide('S22-d0', t, C.nomoth - .3, .4, 0, -900); slide('S22-d1', t, C.exot - .3, .4, 0, -900);
};
F.S23 = t => {
  const { a, b } = SH.S23;
  cam('S23-cam', t, [[a, 960, 560, 1.05], [b, 960, 540, 1]]);
  ['S23-a', 'S23-b'].forEach((w, j) => { popIn(`${w}-hub`, t, a - .01 + j * .08); for (let i = 0; i < 6; i++) { draw(`${w}-l${i}`, t, a + j * .08 + i * .03, .25); draw(`${w}-r${i}`, t, a + .25, .25); popIn(`${w}-n${i}`, t, a + .05 + i * .03 + j * .08); } });
  popIn('S23-ba', t, C.diamorf, { rot: -8 }); popIn('S23-bb', t, C.diamorf + .2, { rot: 8 });
  if (t > C.diamorf + .5) { put('S23-ba', { dy: bob(t, 2, 6), o: 1 }); put('S23-bb', { dy: bob(t, 2, 6, 1), o: 1 }); }
  slam('S23-eq', t, C.diamorf + .5, { from: 2 });
  slam('S23-l', t, C.diaf34 - .2, { from: 1.8 }); draw('S23-slash', t, C.polit34 + .2, .35);
};
F.S24 = t => {
  const { a, b } = SH.S24;
  cam('S24-cam', t, [[a, 960, 540, 1.02], [C.anagk, 960, 520, 1.1], [b, 960, 500, 1.16]]);
  popIn('S24-w-hub', t, a + .05); for (let i = 0; i < 6; i++) { draw(`S24-w-l${i}`, t, a + .1 + i * .05, .3); draw(`S24-w-r${i}`, t, a + .4, .3); popIn(`S24-w-n${i}`, t, a + .2 + i * .05); }
  slide('S24-p', t, a, .4, -500, 0); idle('s24p', t, 0);
  popIn('S24-bld', t, a + .2); ['S24-c1', 'S24-c2'].forEach((id, i) => drop(id, t, a + .4 + i * .15)); idle('s24c1', t, 0); idle('s24c2', t, .5);
  slam('S24-n1', t, a + .3, { from: 1.8 }); slam('S24-n2', t, a + .5, { from: 1.8 });
  popIn('S24-neq', t, C.oroi - .2, { rot: -20 }); if (t > C.oroi + .3) put('S24-neq', { r: Math.sin(t * 2) * 4, o: 1 });
  slam('S24-o', t, C.oroi, { from: 2 }); slam('S24-a', t, C.anagk, { from: 2 });
  if (t > C.anagk + .4) put('S24-neq', { s: 1 + .06 * Math.sin(t * 5), r: Math.sin(t * 2) * 4, o: 1 });
  op('S24-black', P(t, C.end + .6, C.end + 2.0));
};
