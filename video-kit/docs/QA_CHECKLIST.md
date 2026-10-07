# QA checklist — every one of these happened once. Check ALL before rendering.

**Step 0 — `node tools/check.mjs episodes/<ep>` (20 s, exit 1 on ⛔).** It automates the items marked **[auto]** below:
runtime errors on every shot, shot tiling, cues landing <0.8 s before their cut, subtitles == book.txt, audio cues exist,
draft voice. Clear it first; it is cheaper than a stills round.
Then `node tools/stills.mjs episodes/<ep> --every 3` and LOOK at sheet.jpg; then stills exactly at each cue (cue time
+0.5 s) and at each shot's first and last 0.2 s.

## Accuracy
- [ ] Every number/date on screen appears in the book text. No invented counters ("770.504 δρχ" was a bug).
- [ ] Counters end on the exact number; count ≤0.6 s.
- [ ] Map borders match the DATE of the scene (no W. Thrace before 1920, Dodecanese Italian until 1947, etc. — MAPS.md).
- [ ] Who-controlled-what researched (e.g. 1916: E. Macedonia under Bulgarian occupation, not Venizelist).
- [ ] Flags correct for the period; countries shown only if they were really involved at that moment.
- [ ] **[auto]** Subtitles are verbatim book text (diff them against book.txt), title card excluded.
- [ ] Greek caps on screen without accents; no typos in labels.

## Composition
- [ ] Nothing important in the subtitle band (y > 960): names/labels were moved up after this bug.
- [ ] Labels don't overlap each other, faces, or the HUD date (e.g. «1915 ΕΠΙΣΤΡΑΤΕΥΣΗ» vs «ΑΣΚΟΠΗ»).
- [ ] Camera never shows the edge of a background (black strips appeared at right edge in 2 shots).
- [ ] Characters don't overlap each other when new ones enter (fade/move the old ones out first).
- [ ] Objects that must be "underground"/"inside" are clipped (digger had to be clipped below ground).
- [ ] Map zoom shows the places named (Odessa at y −727 needed the camera to go up: compute positions from `PP`).

## Timing
- [ ] **[auto]** Each cue's visual is visible ≥0.8 s inside its shot (ΠΑΘΗΤΙΚΟ landed at the last 0.7 s → shot extended).
- [ ] Shot boundaries 0.1–0.2 s before the phrase.
- [ ] Map labels from a previous beat fade out when the camera moves on.
- [ ] **No shot is static for >6 s** — a long phrase needs camera beats (punch-in on a key word). k2-a1 S13/S15 had 10 s
      of a still map/building; the independent reviewer caught it, a single stills sheet did not.
- [ ] **After adding any zoom/punch-in, re-check the shot's TITLE stays in frame** at the zoom's peak (k2-a1 S15/S21 cut
      their titles; the zoom had to be reduced).

- [ ] **Alignment sanity (k2-a1):** after align.py, the «~» (interpolated) rows must be only tiny phrases and every phrase
      ≈0.15–0.18 s/syllable. At the old default −40 dB/0.12 s the ElevenLabs title pauses were missed and the first book
      phrases slid one slot early. Compare two settings; boundaries should agree within ~0.25 s.
- [ ] **[auto]** **The first book phrase HAS a subtitle:** title lines in replacements.json must KEEP their full stop, or subs.py merges
      the first phrase into the title chunk and makeSubs({skipBefore}) silently drops it (happened in k2-a1).
- [ ] **No literal seconds** in scenes.mjs/shots.js/audio.json — cues (C.*) and shot bounds (D.shots) only, so a new voice
      re-times everything (k2-a1 was built on a draft voice and re-timed this way).

- [ ] **The voice says what voice.txt says (k2-b1).** If Alex made the MP3 from the PAGE instead of voice.txt, it also
      reads the HEADINGS and the book's typos aloud: «Β. Χειραφέτηση… (1844-1880)», «ψηφοφορίας10» → «…ψηφοφορίας ΔΕΚΑ»,
      «vέους» (Latin v) → «βέους». The tell is in align.py's table: the title row at ~0.10 s/syllable and the first book
      phrase at ~0.29. **[auto]** `voice_script.py` now flags FOOTNOTE? and LATIN LETTER IN A GREEK WORD before the
      voice is made, and **`python3 tools/hear.py episodes/<ep>`** (Whisper, phonetic diff vs voice.txt) lists every
      place the voice differs — run it on EVERY real voice before aligning. Digits/letter names («1844», «V», «Γάμα»)
      are filtered; what remains is a short list to judge (k2-b1 source: 6 blocks, 2 real).
      Known Whisper noise, not errors: «κα» right after a splice (= the onset of the next word, proven), «σόρους»
      for «όρους», «νικρού», «δυναμία». ⚠️ A word whose FIRST sound differs is never noise («βέους»/«νέους»).

- [ ] **A wrong word is fixed by a RE-TAKE, never by re-generating the whole voice.** Alex exports ONE word from
      ElevenLabs; it goes to `<ep>/retakes/<word>.mp3`, the untouched full file stays as `<ep>/voice_source.mp3`, and
      the edit is a line in `<ep>/voice_edits.json` → `python3 tools/voice_edit.py episodes/<ep>`. Cut points in an
      energy dip (`hear.py --env a b`, decoded audio — `ffmpeg -ss` on an mp3 lands ~20 ms off); trim the re-take's
      head and its decay tail (an isolated word ends in silence → an audible gap), tempo ~1.15, gain to the
      neighbours (~−4.5 dB). Verify with `hear.py --at <t>` — and on the SHIPPED mp4 (`--file ../videos/istoria/<id>.mp4`).
      Cues re-time for free; the film is re-rendered whole.

## Technical
- [ ] Every expression used exists for that character (venizelos/konstantinos lacked 'happy'/'sad' → blank eyes;
      runtime now falls back to 'neutral', but ADD the expression instead).
- [ ] clipPaths/gradients used by more than one shot live in global defs (`extraDefs`), not inside a shot `<g>`
      (shots are display:none when inactive).
- [ ] **[auto: missing ids]** Every animated element has a unique id across the whole page (prefix with the shot id: `S12-…`, chars `s12f`).
- [ ] No emoji in SVG (no emoji font in headless Chromium → tofu boxes).
- [ ] Text inside SVG `<script>`-free; never put `<script>` inside `<svg>` (the `<` in code breaks parsing).
- [ ] `seek(t)` must be pure: set every animated attribute for every t (no state carried between frames).

## Voice
- [ ] **[auto]** Not shipping the draft: `VOICE_IS_DRAFT.txt` gone (check.mjs warns, ship.mjs refuses).
- [ ] After `voice.py use`, re-run check.mjs: the real voice moves every cue, so late cues reappear in new places.
- [ ] **[auto]** `voice.py use` skips Downloads under 30 s and refuses a file < half the text's length: the newest
      ElevenLabs download is often a one-word RE-TAKE (k2-b1 «νέους», 0.9 s), never the narration.
- [ ] A phrase can start ~0.3 s early on an audible in-breath (its peaks cross −32 dB; k2-b1 phrase 45). Harmless
      (the subtitle leads by a breath). ⛔ Don't «fix» it globally in align.py — a −28 dB breath-snap was tried and
      moved 22 phrases by 0.2–0.3 s while barely moving the one it was for. Only if a CUT then lands inside a word.

## Audio
- [ ] No background music (Alex's choice). Never use files named *preview*/*-pr* (they contain spoken watermarks).
- [ ] ≤ ~1 SFX per 4 s; no SFX on top of an important spoken number/term.
- [ ] Final loudness −16 LUFS (mix.py does it); listen-check requested from Alex (Claude cannot hear).
