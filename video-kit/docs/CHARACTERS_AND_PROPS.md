# Characters & props — adding new ones

Look at `docs/catalog.jpg` first (regenerate with `node tools/catalog.mjs` → docs/catalog.png after changes).

## New historical person
Prefer `P.person({...})` options before writing a new function:
```
id (required, unique)   start: 'neutral'|'happy'|'angry'|'sad'|'shock'|'yawn'|'blink'|'strain'
coat pants skin         hair: 'short'|'long'|'side'  hairC     face: 'stache'|'goatee'|'sideburns'  faceC
hat: 'top'|'sam'|'bowler'|'phrygian'|'kepi'|'flat'  hatC bandC     glasses: true
arms: 'down'|'crossed'|'up'|'hold'   vest (colour or url(#pattern))   sash: [colours]   pin: colour (crown pin)
dress: true (+dressC) female: true   stripes: true (US trousers)   chest/prop: extra SVG (e.g. rifle, shovel)
```
If a person recurs across chapters (Trikoupis, Deligiannis, Otto, Kapodistrias, Plastiras…), write a dedicated function
in `engine/chars.mjs` like `venizelos()`: same proportions, same parts structure (`<id>-body`, `<id>-head`, expression
groups `<id>-x-<name>` for at least neutral/happy/angry/sad/shock/blink, optional `<id>-stache`, `<id>-glint`).
Design rules: 1–2 signature features from portraits (hair/beard/hat/uniform), never realistic; same head r=84; ink 5.5.
Research what they looked like (web search) and what they wore at that date. Add them to catalog.mjs.

## New prop
Add a function to `engine/props.mjs` returning an SVG string; origin bottom-centre for standing things, centre for flat
ones; INK outlines 4–6 px; flat fills; text inside uses Fira Sans Extra Condensed 900. Put animatable inner parts under
ids only when the runtime needs them (and then make the id unique per use or document it — e.g. `pressPlate`,
`vaultWheel`, `beam`, `bladeA/B` are single-use ids).

## Expressions
`expr(id, name)`; if a character lacks an expression the runtime falls back to neutral — but add it properly.
Konstantinos lacks 'sad' — add it if needed.
