# Style bible — "Style A / Historically" (approved by Alex)

Reference stills: open `episodes/enotita-04/build/stills/sheet.jpg` after `node tools/stills.mjs episodes/enotita-04 --every 6`.
Inspiration: the YouTube channel *Historically* (@HeyHistorically) — chibi characters, bold labels, parchment maps.
We are inspired, never copying: all characters/props are our own designs.

## Canvas
- 1920×1080, 30 fps. Safe area: keep important content within x 60–1860, y 40–960.
- **Bottom band y > 960 belongs to subtitles.** Never put labels/names there (QA item).
- Top-left corner (x 60–700, y 40–260) = HUD slot for date + title ("1916", "ΝΟΕΜΒΡΙΟΣ 1920"). Keep it free otherwise.

## Palette (engine/page.mjs exports these — use the constants, not new hexes)
| name | hex | use |
|---|---|---|
| INK | #1d1a17 | all outlines, text strokes |
| SEA | #79AFC4 | sea on maps (+ moving `waves` pattern) |
| SAND | #E6D3A8 | land that is "not the subject" (other countries, occupied areas) |
| BLUE | #5D8BD0 | Greece / Palace / royalist side / royalist governments (1920–22) |
| RED | #DE5B45 | Venizelos side (Εθνική Άμυνα, 1917–20 Venizelist Greece); also danger/negative |
| YEL | #FFD54A | key labels, dates, highlighted subtitle words |
| NIGHT | #2f3b4a | "concept" scenes (numbers, scales, meters) — dark slate with paper grain |
Colour meaning must stay consistent inside an episode and across episodes. If a new chapter needs other factions,
pick clearly distinct flat colours and document them here.

## Line & texture
- Outlines: INK, 4–6 px at 1×, round joins. Characters lw 5.5.
- Paper grain: `filter="url(#paper)"` overlay at 0.18–0.45 opacity on land/backgrounds (already in sky(), seaLand()).
- Vignette `vign` on every shot (outside the camera group).
- Characters get `filter="url(#boil)"` (hand-drawn line boil, re-seeded 12×/s by the runtime).

## Typography
- Big labels: `T()` → Fira Sans Extra Condensed 900, white (or YEL/RED) fill, INK stroke 8–16 px (paint-order stroke).
  Sizes: title 110–150, scene label 64–100, names 46–64, small tags 30–40. Greek caps WITHOUT accents.
- Subtitles: Commissioner 700, 38 px, white with 8 px ink stroke, key terms `<b>` → YEL. Max 84 chars per chunk (2 lines).
- Never use fonts other than the four bundled (Fira Sans Extra Condensed, Commissioner, Noto Serif Display, JetBrains Mono).

## Characters
- Chibi: big round head r=84 centred at (0,−228), small body, feet at (0,0), total ≈330 units tall.
- Faces: dot eyes, simple brows that carry the emotion, blush ovals. Identify people by 1–2 signature features
  (Venizelos: bald + round glasses + short white beard; Konstantinos: peaked cap with crown + big upturned moustache).
- Typical on-screen scale: 0.9–1.65 (feet on the ground line ~y 880–1010). Close-ups: 4–5× (faces fill half the frame).
- National personifications for countries: Marianne (France), John Bull (UK), Uncle Sam (USA).

## Backgrounds
- Outdoor: `sky(top, bottom, ground, groundY)` + `clouds()`; warm/cool variants per mood (dusk orange for conflict,
  blue for neutral, grey for doom).
- Concept scenes: `night()` slate.
- Maps: `seaLand()` + Greece variants (see MAPS.md).
- Everything wider than the frame (camera moves must never reveal edges).
