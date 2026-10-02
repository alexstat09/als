# Maps

`engine/map.mjs` → `buildMap({ box, bounds, clip })` projects Natural-Earth 10 m data (world-atlas) with Mercator,
fitted so `bounds` (lon/lat corners, default the Aegean 19.2–28.4°E, 34.7–41.9°N) fills `box` (pixels, default
[[390,10],[1630,1070]]). `clip` widens the drawn area for zoom-outs (ενότητα 4 uses [[-2600,-2600],[5200,2700]] so the
camera can show Europe, the Black Sea and Anatolia).

Returns: `land` (all land, no modern borders — good for history), `mainland`, `north`/`south`/`foreign` island groups
(1916 classification), clip rings `northClip`, `thraceClip`, `occClip`, `pt([lon,lat]) → [x,y]`, `path` (d3 geoPath),
`athens`, `thess`.

## Accuracy — borders change with the date of EACH SCENE
Modern Greece ≠ historical Greece. The modern polygon is used and corrected with clip overlays in SAND:
| period | Greece included | NOT Greek (paint SAND) |
|---|---|---|
| 1830–1864 | Peloponnese, Sterea, Euboea, Cyclades | Ionian islands (British), Thessaly, Epirus, Macedonia, Crete, Aegean isl., Thrace, Dodecanese |
| 1864–1881 | + Ionian islands | Thessaly/Arta onward |
| 1881–1912 | + Thessaly, Arta | Epirus, Macedonia, Crete, N. Aegean, Thrace, Dodecanese |
| 1913–1919 | + Epirus (south), Macedonia, Crete, N. Aegean isl. | W. Thrace (Bulgarian), Dodecanese (Italian) — `thraceClip`, `foreign` |
| 1920–1923 | + W. Thrace (and E. Thrace / Smyrna zone 1920–22 by Sèvres) | Dodecanese |
| 1923–1947 | modern minus Dodecanese | Dodecanese |
| 1947– | modern | — |
Verify specifics with a web search for each new episode (e.g. Sèvres zones, Northern Epirus 1914–16) and note sources
in STORYBOARD.md. 1916–17 Schism split (done in ενότητα 4): Venizelist = Macedonia W of Strymon + Crete + N. Aegean
islands; E. Macedonia (E of Strymon) under Bulgarian occupation (SAND); the dividing line is stylised (neutral zone).

## Recipes (see ενότητα 4 S5, S9, S17, S22, S28)
- Whole country one colour: `seaLand('S1') + greeceOne(BLUE) + paperOver`.
- Region in another colour: `<use href="#m-main" fill="${RED}" clip-path="url(#c-north)"/>` (define new clip rings with
  `M.pt` → `'M'+pts.map(M.pt).join('L')+'Z'` and add them to `extraDefs` as `<clipPath>`).
- Ink-flood a colour from a city: wrap the coloured layer in `clip-path="url(#S5-spread)"` whose `<circle>` radius
  animates 0→1400 (`$('S5-sc').setAttribute('r', …)`).
- Crack/front lines: jagged path from lon/lat points (`crackPts` in ενότητα 4), drawn with `draw()`.
- Routes/arrows: `line([[lon,lat],…])`, dashed + `marker-end="url(#ah)"`, animate `stroke-dashoffset = -t*60` (marching).
- Places: compute `PP = {name: M.pt([lon,lat])}`, pass via `data: { PP }`, use `PP.name` in shots.js for cameras/pins.
- Camera on maps: points far north/east have NEGATIVE y / x > 1920 (Odessa y≈−727). Choose cam centre/scale so all
  named places are inside 960/scale of the centre.
