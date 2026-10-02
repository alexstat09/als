# Engine API

Two halves:
- **node side** (`engine/page.mjs`, `props.mjs`, `chars.mjs`, `map.mjs`): builds the STATIC scene graph (all shots as
  hidden `<g>` groups) into `episodes/<ep>/build/video.html`.
- **browser side** (`engine/runtime.js` + the episode's `shots.js`): `window.seek(t)` shows the active shot and sets every
  animated attribute for time t. Rendering = calling seek(t) for each frame and screenshotting.

## Node side — engine/page.mjs
| helper | what |
|---|---|
| `cueTools(timingPath)` → `{timing, PH, S, E, Wt}` | `S(i)`/`E(i)` phrase start/end; `Wt(i,'word')` time the word starts (throws if the word isn't in phrase i — good, catches typos) |
| `G(id, inner, x, y, s, extra)` | animatable group with base transform (data-x/y/s). ALL animated things must be a G |
| `T(id, 'ΚΕΙΜΕΝΟ', x, y, size, fill, anchor, strokeW)` | big outlined label (inside a G, so slam/popIn work) |
| `sky(top, bottom, ground, groundY)` / `night()` / `clouds(prefix)` | backgrounds (oversized) |
| `vign` | vignette rect — put after the camera group of every shot |
| `pin(colour)` | map pin (origin = tip) |
| `K(id, expr)` / `V(id, expr)` | Konstantinos / Venizelos |
| `P.*` | all people & props (see catalog.jpg): `P.person({...})`, `P.marianne/johnbull/unclesam/soldier/citizen/minister(id, opts)`, `P.moneyBag, banknote, scroll, stamp, ship, palace, cloudStorm, weightBlock, vault, goldBars, fxStack, padlock, press, ballotBox, ledger, balance, scissors, wreath, bond, wall, bulb, building, flag('gr'|'fr'|'uk'|'us')` |
| `mapDefs(M)`, `seaLand(prefix)`, `greeceOne(colour)`, `paperOver` | maps (see MAPS.md) |
| `makeSubs(timing, HL, {skipBefore})` | subtitle chunks with yellow highlight terms |
| `buildPage({out, shots, subs, C, extraDefs, data, runtimeJs, shotsJs})` | writes the page. `data` → available as `D.*` in the browser (e.g. projected map points `D.PP`) |
| constants | `W H INK BLUE RED SAND YEL SEA NIGHT` |

Shot definition pattern (scenes.mjs):
```js
const shots = []; const shot = (id, a, b, inner) => shots.push({ id, a, b, svg: `<g id="${id}" class="shot" style="display:none">${inner}</g>` });
shot('S7', 30.55, 34.62, `<g id="S7-cam">${sky(...)} ${G('S7-bag', P.moneyBag('£'), 960, 800, 1.5)} ${T('S7-l', 'ΛΕΞΗ', 960, 150, 90)}</g>${vign}`);
```
- Shots must tile the timeline: S(n).b === S(n+1).a. Last shot ends at `C.end + 2.4` (fade to black).
- IDs: prefix with the shot id (`S7-…`); character ids lowercase (`s7v`) — expressions become `s7v-x-angry`, etc.
- Things shared by several shots (clipPaths) → `extraDefs`.

## Browser side — engine/runtime.js (globals available in shots.js)
| helper | what |
|---|---|
| `C`, `PP`, `D` | cues, projected map points, all data |
| `P(t,a,b)` | 0→1 progress clamp. Easings: `eIO eOut eIn eBack(t,s) bounce`. `lerp clamp q15 noise` |
| `put(id,{dx,dy,s,sx,sy,r,o,x,y})` | set transform relative to the G's base (x/y override base position) |
| `op(id,v)`, `vis(id,bool)` | opacity / display |
| `slam(id,t,t0,{from,rot,dur,x,y})` | big→1 overshoot entrance (labels, stamps, dates) |
| `popIn(id,t,t0,{dur,rot,s,x,y})` | 0→1 overshoot entrance (objects) |
| `fadeIn(id,t,t0,dur)` | opacity ramp |
| `drop(id,t,t0,{h,fall})` | character falls + squash; returns true after landing |
| `slide(id,t,t0,dur,fx,fy)` | slide in from offset |
| `draw(id,t,t0,dur,ease)` | stroke draw-on (path needs `pathLength="1000" stroke-dasharray="1000 1000"`) |
| `cam(id,t,[[t,cx,cy,s],…])` | camera keys (eIO between keys) |
| `count(id,t,t0,dur,target,suffix)` | number counter in a T() label (Greek thousands dots) |
| `expr(charId,name)`, `idle(charId,t,phase,amp)`, `headTilt(charId,deg)`, `blinkAt(t,[times])` | character acting |
| `waves(prefix,t)` | scroll the sea pattern of a map shot |
| `shk(t,amp,dur)`, `fl(t,opacity)` | register screen shake / white flash (call at top level of shots.js) |

Shot animation pattern (shots.js):
```js
F.S7 = t => {
  cam('S7-cam', t, [[30.55, 960, 540, 1], [34.62, 960, 540, 1.05]]);
  popIn('S7-bag', t, C.oik - .2);
  slam('S7-l', t, C.oik, { from: 2.2, rot: -6 });
  if (t > C.oik + .5) put('S7-bag', { dy: Math.sin(t * 2) * 8 });   // secondary motion
};
shk(C.oik, 12);
```
`seek(t)` must be PURE: set every animated attribute for any t, in any order (renders run in parallel, out of order).
