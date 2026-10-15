# k2-b3 — REVIEW (DIRECTOR_MODE loops 3–4)
Built directly on Alex's real ElevenLabs voice (Eleni, 15/10, `08_37_30`, 197.6 s), made from voice.txt — no draft round.

## Round 0 — the voice, before any timing
- `hear.py` on the untouched source: first word «Τρία» (right file). 2 blocks, both Whisper noise: «Οι ηγετικές» heard as
  «Οι γετικές» (the two /i/ merge) and a misplaced «ένα» at 183.96 — `--at 184` hears «και πολλά άτομα» cleanly.
  No headings, footnotes or Latin letters read; no repeated sentence → no `voice_edits.json`, voice.mp3 == voice_source.mp3.
- ⚠️ The e-book prints «καταβολές.Οι» (full stop glued to the next word); voice.txt has «καταβολές… Οι». The phrase split
  wanted a space after the stop, so book and voice would have split differently. **Tool fix**: `align.py` and `subs.py`
  share one rule — a full stop glued to a capital IS a phrase end, and «…» ends a phrase like «.». subs.py remembers the
  missing space (`glue`) so the verbatim guard still rebuilds «καταβολές.Οι» exactly; it writes `glue:''` into
  timing.json and `check.mjs` reads it. Proven harmless: every other episode's book/voice splits identically, and
  k2-b1 + k2-b4 `phrases.json` / `timing.json` come out **byte-identical**.
- 40 phrases (2 title + 38 book), 0 interpolated, 0.140 s/syllable, VERBATIM OK.

## Round 1 — check.mjs + per-shot sheets
- New person in the engine: `CH.koumoundouros` (portrait: grey hair, white moustache + chin tuft, bow tie) with a new
  `tuft` option in `person()`; CAST.md row. Russian flag added to `P.flag('ru')` for the Powers' ships (sailing ships,
  not the steamships of `P.ship` — anachronistic for the aid the text means).
- check.mjs: 5 late cues (S14 «εντάσεις», S17 «Δύσης», S20 «κρίσιμες», S22 «παλαιότερους», S39 «στρωμάτων») → bound earlier.
- Sheets: S2 poles leaned into the old leaders → all droop the same way, leaders to their left · S12 label on the roof →
  building smaller · S15 scrolls covered the faces → hang higher · S23/S24 sapling tiny (scale applied twice) · S31 black
  strip at the right end of the pan → wider world · S34 «ΕΠΑΝΑΣΤΑΣΗ» on the cloud's own word → split left/right ·
  S37 label on the ΠΑΝΕΠΙΣΤΗΜΙΟ sign → smaller building · S38 ✕ marks hid letters → moved past the boards ·
  S17 the train entered THROUGH the cart → train on its own rails behind, cart on the road in front.

## Round 2 — independent reviewer (29 findings on 4 per-shot sheets: first frames + end states), triaged
Already fixed before the report landed: S17 (cart through the train), S31 width, S38 ✕ marks.
Fixed:
- ⭐ **Double scale**: `put()`/`fly()` multiply the G's own `data-s`, so passing the base scale again shrank things to
  nothing — newspapers (S12), flying books (S14), the sapling (S23/S24). Pass `s` only for a CHANGE, never the base.
- S31 black strip at the start of the pan + labels cut mid-pan → panel 1 moved in, panel 3 further out, the bank label
  enters/leaves with the camera. S35 the throne left the frame and «hands» floated → two townspeople push it half-way.
- S41 weak ending (Όθων gone, ship clipped, then walking on water) → a pier to the ship, he boards and sails in frame.
- S14 the opposing group wore top hats (= the upper strata of S39/S40) → farmers. S19 «backpacks» read as an amphora and
  a ghost → real packs. S3 roots read as stilts → short wavy roots above the subtitle band. S28 moth ×2.2. S32 cards ×1.25.
- Framing: S20 ships start in view, S22 new background + framing (it repeated S21), S27 starts as a crowd, S11 towers
  already rising, S29 tables in frame, S34 bolt off the faces, S36 officers fade in inside the frame, S40 building in frame,
  S24 «ΟΘΩΝ» tag over his crown, S12 one «ΑΠΟΦΑΣΕΙΣ» instead of two.
Left: S13 signatures (boxed scribbles, readable) · S38 storm cloud instead of scales (clear enough) · S26/S33 and
S27/S34 echo on purpose (same calendar, same cloud → the 1850s discontent becomes the 1862 revolt).
check.mjs OK after the changes; targeted stills on every fixed shot: clean. ONE full render.

## Round 3 — final_sheet.jpg
- S23 opened on an empty-looking frame (a sapling squashed to 15 % height, no label until «συνταγματικό») → the tree
  starts at 45 % and grows, the label lands with the cut. Re-rendered that range only (`render --clear`), re-shipped.
- ⚠️ The partial re-render hung twice (30 and 60 min, both killed) right after «frames done in 0.2 min»: ffmpeg in a
  background job reads the keyboard and is stopped by SIGTTIN. **Tool fix**: `render.mjs` passes `-nostdin` to both
  ffmpeg calls (ship.mjs already ignores stdin). Noted in PIPELINE.md's gotcha table.
