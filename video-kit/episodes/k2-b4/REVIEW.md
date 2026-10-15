# k2-b4 — REVIEW (DIRECTOR_MODE loops 3–4)
Built directly on Alex's real ElevenLabs voice (Eleni, 15/10, `08_39_46`, 286.7 s), made from voice.txt — no draft round.

## Round 0 — the voice, before any timing
- `hear.py` on the untouched source: 5 blocks, all Whisper noise (αθωμανική, ενεξαρτησία, «άνει για», «τους την»). «Δ.»
  is spoken as a short initial (~0.4 s voiced, RMS envelope 80.50–81.24 s) — the book says «Δ. Γρίβα», so it stays.
  No headings, no footnote numbers, no Latin letters read → no `voice_edits.json`, voice.mp3 == voice_source.mp3.
- ⚠️ align/subs split a phrase AFTER «Δ.» (they treated the initial as a sentence end): a subtitle ended «…υπό τον Δ.»
  and the next began «Γρίβα και…». **Tool fix**: `align.py` and `subs.py` share a rule that an initial (one capital +
  «.») is not a phrase end. Only k2-b4 has one, so no older episode changes. 63 phrases, 0.144 s/syllable, VERBATIM OK.
- The book repeats one sentence (phrases 46/47); kept (book's typo, Alex's rule) and drawn twice differently (S40/S41).

## Round 1 — check.mjs + sheets
- check.mjs first build: no runtime errors, tiling OK; 3 late cues (S10 «θεσμούς», S24 «στρατό», S35 «κοινής») → bound
  earlier (S10 sinks on «κοινοβουλευτικούς»+0.5; S24's third card at «διοίκηση»+0.45; S35's label at «έκφραση»+0.4).
- **Tool**: `stills.mjs --shots S1-S27 [--at -.6|.25]` — one still PER SHOT (end state or first frame). The `--every 20`
  sheet saw 15 of 53 shots; this sees all of them in two sheets.
- Fixed from the sheets: S4 an invented «31» on the October calendar page (only book numbers on screen) → empty grid;
  S4 «ΕΚΛΟΓΕΣ» sign hidden by the voters → above the door; S8 ended on the mountain only → pulls back to show both
  signs; S12 «ΕΞΟΥΣΙΑ» behind Βούλγαρης's head → above the throne; S17 name under the flag → left of the summit, Γρίβας
  stands ON the summit; S19 first label cut by the pan → the pan ends centred; S26 puzzle pieces over «ΛΟΓΙΟΙ» → beside
  the banner; S33 the chain broke before it was seen → breaks on «δικαιοσύνης»; S36 hooded men drifted off-frame →
  gentler camera; S45 «ΔΥΟ ΜΕΓΑΛΑ ΚΟΜΜΑΤΑ ΕΞΟΥΣΙΑΣ» off the right edge → centred; S46 Westminster tower off the top
  → ×0.8, flag on the roof; S40/S48 envelope landed ON faces → above the head; S49 ✕ over «ΚΥΒΕΡΝΗΣΗ», S50 blobs over
  the table label, S52 ✓ over the paper text → moved; S30 ✕ hid «ΣΥΝΤΑΓΜΑΤΙΚΗ ΜΟΝΑΡΧΙΑ» → a red strike line;
  S32 voter hid «ΟΧΙ» → stops short; S28 the two civil-war sides looked alike → a big green and a big brown flag;
  S53 the cut ribbon lingered over the new landscape → fades.
- Also: several world widths were too narrow for their pans (S27/S28/S33/S50) → widened before any still showed it.

## Round 2 — independent reviewer (34 findings on 4 per-shot sheets: first frames + end states), triaged
Fixed:
- EMPTY first frames: S24 (first card now at the shot start), S36 (signpost + hooded men at the start), S9 (flags and
  Βούλγαρης land at once), S5 (deputies pop instead of falling), S41 (the hemicycle builds in 0.35 s), and drops cut by the
  top edge (S14/S16/S30/S44 → lower, faster falls).
- S39 «ΔΕΝ ΟΡΙΣΤΗΚΕ ΜΕ ΣΑΦΗΝΕΙΑ» slammed from 2× over the document title → from 1.3×.
- S6 falling heads over the «ΞΕΝΙΚΑ» sign → the party men slide in from the sides.
- ⛔ CAST: the S19 shipowner wore a RED fez = Βούλγαρης's signature → dark-blue fez (one design = one person).
- S28 the civil-war sides looked identical → big chest cockades + flags in faction colours, the brown side faces the
  green one, both lean in.
- S30 nobody held the crown → cushion + crown rest on the people's raised hands; the struck card is wider.
- S25 kingdom blue vanished into the sea → darker blue, thicker outline; «ΟΘΩΜΑΝΙΚΗ ΑΥΤΟΚΡΑΤΟΡΙΑ» moved off the sea.
- S3 deputies floated in space → a floor. S4 tree/door cut at the edge → inward. S5 the party hand read as a bar → arm
  further in, label clear of the ✕. S18 repeats Γρίβας's name tag (S17's lands late in its shot). S20 flags on tall
  poles. S31 sceptre out of the subtitle band. S32 tag 1.33×. S35 Βουλή framed from the start, «ΚΟΜΜΑΤΑ» larger.
  S40 pulls back at the end so the king is in the frame. S41 a small leader figure at the arrow's end, label moved.
  S45 Τρικούπης stays in frame, pillars beside him. S51 a real PRESS lowers on the king as the gauge climbs.
- Same-hall fatigue: S5/S14/S26/S48/S49 recoloured, S52 moved outdoors.
Left: S11→S12 (continuation of one sentence, same soldiers by design), S27/S50 end states (motion carries them).
check.mjs OK after the changes; targeted stills on every fixed shot: clean.

## Round 3 — the repeated sentence goes (als-v608, Alex 15/10: «δεν το λέει διπλά»)
- The e-book index2_3 prints «ήταν ότι ο βασιλιάς όφειλε … της Βουλής.» twice; the printed book once. Removed from
  istoria-voithima.html (sic entry dropped, a test now asserts ONE occurrence), the grounding source, book.txt, voice.txt.
- Audio: CUT [206.30, 216.22] of voice_source.mp3 (both points in digital silence, −87 dB; 0.48 s pause left) via
  voice_edits.json → 276.7 s. Re-aligned: 62 phrases, VERBATIM OK.
- scenes.mjs: phrase indices ≥48 shifted by −1 (one regex over Wt/S/E/cut/mid), the phrase-47 cues and S41 (hemicycle)
  removed, 3 SFX removed. check.mjs OK, stills S40–S53 each on its own phrase, one full re-render.
