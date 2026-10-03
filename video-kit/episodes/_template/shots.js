// Ενότητα NN — per-shot animation (browser). One F.<shotId> per shot. Keep seek(t) PURE.
// ⚠️ No literal seconds: a time is a cue (C.x ± offset) or a shot bound (SH.Sx.a / SH.Sx.b) — never 37.2.
// tools/check.mjs reads `C.x ± n` inside each F.Sx to flag a visual landing <0.8 s before its cut, so write offsets inline.
const SH = {}; D.shots.forEach(s => { SH[s.id] = s; });
const bob = (t, f = 2, a = 8, ph = 0) => Math.sin(t * f + ph) * a;   // secondary motion (floating labels, ? marks)
F.S1 = t => {
  waves('S1', t);
  cam('S1-cam', t, [[0, 1010, 540, .27], [C.t2, 1000, 540, 1], [SH.S1.b, 1000, 540, 1.05]]);
  slam('S1-t1', t, C.t1 + .1, { from: 2.6, rot: -8 }); slam('S1-t2', t, C.t2, { from: 2.2, rot: 4 });
};
F.S2 = t => {
  cam('S2-cam', t, [[SH.S2.a, 960, 540, 1], [SH.S2.b, 960, 540, 1.05]]);
  drop('S2-V', t, SH.S2.a + .3); idle('s2v', t);
  slam('S2-l', t, SH.S2.a + 1);
  op('S2-black', P(t, C.end + .6, C.end + 2.0));
};
// screen shakes / flashes for this episode
shk(C.t1, 8);
