// Ενότητα NN — per-shot animation (browser). One F.<shotId> per shot. Keep seek(t) PURE.
F.S1 = t => {
  waves('S1', t);
  cam('S1-cam', t, [[0, 1010, 540, .27], [2.6, 1000, 540, 1], [S1END(), 1000, 540, 1.05]]);
  slam('S1-t1', t, C.t1 + .1, { from: 2.6, rot: -8 }); slam('S1-t2', t, C.t2, { from: 2.2, rot: 4 });
};
F.S2 = t => {
  cam('S2-cam', t, [[D.shots[1].a, 960, 540, 1], [D.shots[1].b, 960, 540, 1.05]]);
  drop('S2-V', t, D.shots[1].a + .3); idle('s2v', t);
  slam('S2-l', t, D.shots[1].a + 1);
  op('S2-black', P(t, C.end + .6, C.end + 2.0));
};
function S1END() { return D.shots[0].b; }
// screen shakes / flashes for this episode
shk(C.t1, 8);
