// ===== Historically-style video engine: RUNTIME (browser side) =====
// Loaded by every episode page BEFORE the episode's shots.js.
// Provides: easing, transforms (put/slam/popIn/drop/slide/draw/cam/count), character helpers (expr/idle/headTilt/blinkAt),
// global FX registries (shk = screen shake, fl = white flash), subtitles and the seek(t) dispatcher.
// Episode code must define:  F[shotId] = t => {...}   for every shot in D.shots, and may call shk()/fl().
// Runtime for video.html — window.seek(t) renders absolute time t (seconds)
const C = D.C, PP = D.PP || {};
const $ = id => document.getElementById(id);
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const P = (t, a, b) => clamp((t - a) / (b - a));
const eIO = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const eOut = t => 1 - Math.pow(1 - t, 3);
const eIn = t => t * t;
const eBack = (t, s = 2.2) => { const c = s + 1; return 1 + c * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2); };
const bounce = t => { const n = 7.5625, d = 2.75; if (t < 1 / d) return n * t * t; if (t < 2 / d) return n * (t -= 1.5 / d) * t + .75; if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + .9375; return n * (t -= 2.625 / d) * t + .984375; };
const q15 = t => Math.floor(t * 15) / 15;
const noise = (t, s) => Math.sin(t * 61.3 + s) * .5 + Math.sin(t * 37.7 + s * 2.1) * .35 + Math.sin(t * 93.1 + s * 3.7) * .15;

// ---- base transforms ----
const base = {};
function B(id) { if (!base[id]) { const e = $(id); if (!e) throw new Error('missing ' + id); base[id] = { e, x: +e.dataset.x || 0, y: +e.dataset.y || 0, s: +e.dataset.s || 1 }; } return base[id]; }
function put(id, { dx = 0, dy = 0, s = 1, sx = 1, sy = 1, r = 0, o = null, x = null, y = null } = {}) {
  const b = B(id); const X = (x ?? b.x) + dx, Y = (y ?? b.y) + dy;
  b.e.setAttribute('transform', `translate(${X},${Y}) rotate(${r}) scale(${b.s * s * sx},${b.s * s * sy})`);
  if (o !== null) b.e.setAttribute('opacity', o);
}
const vis = (id, v) => { $(id).style.display = v ? 'inline' : 'none'; };
const op = (id, v) => $(id).setAttribute('opacity', v);
// effects
function slam(id, t, t0, { from = 2.3, rot = 0, dur = .42, x = null, y = null } = {}) {
  if (t < t0) { op(id, 0); return; }
  const p = P(t, t0, t0 + dur); put(id, { s: lerp(from, 1, eBack(p, 2.6)), r: rot * (1 - p), o: clamp((t - t0) / .06), x, y });
}
function popIn(id, t, t0, { dur = .38, rot = 0, s = 1, x = null, y = null, dy = 0 } = {}) {
  if (t < t0) { op(id, 0); return; }
  const p = P(t, t0, t0 + dur); put(id, { s: s * Math.max(0.001, eBack(p, 2.4)), r: rot * (1 - p), o: 1, x, y, dy });
}
function fadeIn(id, t, t0, dur = .3) { op(id, clamp((t - t0) / dur)); }
function drop(id, t, t0, { h = 950, fall = .34 } = {}) { // character falls from above and squashes on landing
  if (t < t0) { op(id, 0); return false; }
  const tl = t0 + fall; let dy = 0, sx = 1, sy = 1;
  if (t < tl) { dy = -h * (1 - eIn((t - t0) / fall)); sx = .9; sy = 1.14; }
  else { const k = t - tl, w = Math.exp(-6 * k) * Math.cos(2 * Math.PI * 2.6 * k); sx = 1 + .2 * w; sy = 1 - .24 * w; }
  put(id, { dy, sx, sy, o: 1 }); return t >= tl;
}
function slide(id, t, t0, dur, fx, fy, { o = 1 } = {}) { // from offset (fx,fy) to base
  if (t < t0) { op(id, 0); return; } const p = eOut(P(t, t0, t0 + dur)); put(id, { dx: fx * (1 - p), dy: fy * (1 - p), o });
}
function draw(id, t, t0, dur, ease = eOut) { $(id).setAttribute('stroke-dashoffset', 1000 * (1 - ease(P(t, t0, t0 + dur)))); }
function expr(id, name) { if (!$(id + '-x-' + name)) name = 'neutral'; for (const n of ['neutral', 'angry', 'blink', 'shock', 'happy', 'sad', 'yawn', 'strain']) { const e = $(id + '-x-' + n); if (e) e.style.display = n === name ? 'inline' : 'none'; } }
function idle(id, t, ph = 0, amp = 1) {
  const tq = q15(t), b = Math.sin((tq + ph) * Math.PI * 2 / 1.7);
  const body = $(id + '-body'), head = $(id + '-head');
  if (body) body.setAttribute('transform', `translate(0,${-b * 1.5 * amp}) scale(1,${1 + b * .012 * amp})`);
  if (head) head.setAttribute('transform', `rotate(${Math.sin((tq + ph) * 2.2) * 1.4 * amp},0,-150) translate(0,${-b * 2 * amp})`);
}
function headTilt(id, deg) { const h = $(id + '-head'); if (h) h.setAttribute('transform', `rotate(${deg},0,-150)`); }
function blinkAt(t, times) { const tq = q15(t); return times.some(b => tq >= b && tq < b + .12); }
function cam(id, t, keys) { // keys: [[t, cx, cy, s], ...] eased; centre (cx,cy) shown at screen centre
  let k = keys[0]; let x = k[1], y = k[2], s = k[3];
  for (let i = 0; i < keys.length - 1; i++) { const a = keys[i], b = keys[i + 1]; if (t >= a[0] && t <= b[0]) { const p = eIO(P(t, a[0], b[0])); x = lerp(a[1], b[1], p); y = lerp(a[2], b[2], p); s = lerp(a[3], b[3], p); } }
  const last = keys[keys.length - 1]; if (t > last[0]) { x = last[1]; y = last[2]; s = last[3]; }
  $(id).setAttribute('transform', `translate(960,540) scale(${s}) translate(${-x},${-y})`);
}
const fmt = n => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
function count(id, t, t0, dur, target, suffix = '') { const tx = $(id).querySelector('text'); const v = t < t0 ? 0 : target * eOut(P(t, t0, t0 + dur)); tx.textContent = fmt(v) + suffix; }
function waves(p, t) { const w = $(p + '-waves'); if (w) w.setAttribute('transform', `translate(${(t * 18) % 90},0)`); }

// ---- global FX ----
const SHAKES = [], FLASH = [];
const shk = (t, a, d = .35) => SHAKES.push([t, a, d]);
const fl = (t, o = .5) => FLASH.push([t, o]);
function shake(t) { let x = 0, y = 0, r = 0; for (const [s, a, d] of SHAKES) { if (t < s || t > s + d) continue; const k = (t - s) / d, amp = a * Math.pow(1 - k, 2); x += noise(t, s * 7) * amp; y += noise(t, s * 13 + 5) * amp; r += noise(t, s * 3 + 9) * amp * .04; } return { x, y, r }; }
const F = {};
// ---- subtitles ----
const sub = document.getElementById('sub'); let lastSub = null;
function subs(t) { const c = D.subs.find(s => t >= s.a - .05 && t < s.b + .25); const h = c ? c.h : ''; if (h !== lastSub) { sub.innerHTML = h; lastSub = h; } sub.style.opacity = t > C.end + .3 ? 0 : 1; }

let lastShot = null;
window.seek = function (t) {
  $('boilT').setAttribute('seed', Math.floor(t * 12) % 9 + 1);
  const s = D.shots.find(s => t >= s.a && t < s.b) || D.shots[D.shots.length - 1];
  if (s.id !== lastShot) { if (lastShot) vis(lastShot, false); vis(s.id, true); lastShot = s.id; }
  F[s.id](t);
  const sh = shake(t); $('stage').setAttribute('transform', `translate(${sh.x},${sh.y}) rotate(${sh.r},960,540)`);
  let fo = 0; for (const [a, o] of FLASH) if (t >= a && t < a + .1) fo = Math.max(fo, o * (1 - (t - a) / .1)); $('flash').setAttribute('opacity', fo);
  subs(t);
};
window.DUR = C.end + 2.2;
// seek(0) is called by the page after shots.js is loaded
