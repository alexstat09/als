---
name: historically-video
description: Make a Historically-style animated explainer video (Greek, voice-synced, verbatim subtitles) for a History chapter (ενότητα) of Alex's Ιστορία study pages, using the video-kit engine. Use whenever Alex asks for a video/animation for any ενότητα, or to edit an existing one.
---

# Historically-style chapter videos — the playbook

You are making a ~3–4 minute animated video for ONE textbook chapter (ενότητα) of Greek Γ΄ Λυκείου History.
The narration is the chapter text **verbatim** (read by an ElevenLabs voice). The video's job: **every key phrase of the
text gets its own visual cue at the moment it is spoken**, so Alex remembers the exact textbook wording through images.
The reference episode `video-kit/episodes/enotita-04/` was approved by Alex as "perfect". Match or beat that level.
Alex's previous experience with Claude Code was "much worse" — so do NOT cut corners. Read these before starting:

0. **`video-kit/docs/DIRECTOR_MODE.md` — HOW TO THINK. Work autonomously with its 5 self-review loops. Mandatory.**
1. `video-kit/docs/STYLE_BIBLE.md` — the look (palette, line, type, characters). Non-negotiable.
2. `video-kit/docs/SCENE_DESIGN.md` — HOW to turn text into shots (the creative core). Read fully.
3. `video-kit/docs/MOTION.md` — how things move (timing, easing, camera, FX).
4. `video-kit/docs/QA_CHECKLIST.md` — every mistake already made once. Check all of them.
5. `video-kit/docs/ENGINE_API.md` — the helpers you build with. `video-kit/docs/catalog.jpg` — LOOK at it.
6. `video-kit/episodes/enotita-04/scenes.mjs` + `shots.js` — the full worked example. Copy its patterns.
   `video-kit/episodes/k2-a1/` — the second one, built the CURRENT way (`cut(i)`, `SH.Sx`, zero literal seconds,
   draft voice → real voice). Its `REVIEW.md` lists every flaw a review round found — read it, they recur.
Also as needed: `docs/MAPS.md` (any map), `docs/CHARACTERS_AND_PROPS.md` (new people/objects), `docs/AUDIO.md`, `docs/PIPELINE.md`.

## Non-negotiables (Alex's explicit requirements)
- **Zero mistakes.** Historically accurate visuals: borders by date, who held what, flags, dates. Verify with web search
  when unsure; never invent numbers, dates, quotes or events. Only numbers that are IN the text may appear on screen.
  If a counter animates, it must end on the exact book number and count fast (≤0.6 s).
- **Subtitles = textbook text verbatim** (including the book's own typos — Alex chose to keep them). Never paraphrase.
- **Style A ("Historically")**: bright flat cartoon, thick ink outlines, chibi characters, parchment-sand maps on blue sea,
  big white Fira Sans Extra Condensed caps with ink outline. NOT the dark app theme.
- **Motion must feel professional** (Historically level): nothing static, cuts every 3–8 s, snappy overshoot, squash & stretch.
- **No background music.** Alex removed it. Only the narration + SPARSE sound effects (≈1 per 4 s, on visual beats).
- Greek on screen: CAPS WITHOUT accents (ΔΙΧΑΣΜΟΣ, not ΔΙΧΑΣΜΌΣ). Subtitles keep normal case & accents.
- Talk to Alex in Greek, short and clear. Work autonomously; the only things he must do: give the text, make the
  ElevenLabs MP3, and listen to the final audio.

## Workflow (do these in order; see docs/PIPELINE.md for exact commands)
0. Already installed in this repo. Node: `export PATH="$HOME/.local/node-v24.18.0-darwin-arm64/bin:$PATH"`.
   Episode folder = the unit id in `istoria-voithima.html` (`k2-a2`), so shipping needs no renaming.
1. **Text in.** `cp -r episodes/_template episodes/<id>`; `book.txt` = the unit's paragraphs EXACTLY as in
   `istoria-voithima.html` (typos included). If Alex says «θα σου δώσω το speech μετά», that's the voice — start now.
2. **Voice script.** `python3 tools/voice_script.py episodes/enotita-NN` → fix every REVIEW item by hand in `voice.txt`
   (ordinals, feminine numbers, abbreviations). Keep punctuation IDENTICAL to book.txt. Add the spoken title line at the
   top and its pair in `replacements.json`. Give Alex `voice.txt` to paste into ElevenLabs (voice: **Eleni – Soft
   Narrational and Calm**, same as ενότητα 4). Title lines in `replacements.json` KEEP their full stop.
   **Don't wait for his MP3:** `python3 tools/voice.py draft episodes/<id>` (Melina) and build the whole film on it.
   When he sends the file (it lands as `~/Downloads/ElevenLabs_*.mp3`): `python3 tools/voice.py use episodes/<id>`.
   ⛔ Tell him: ElevenLabs gets **voice.txt**, never the text of the page (k2-b1 was voiced from the page → headings,
   a footnote «10» read as «δέκα», «vέους» read as «βέους»). Then **`python3 tools/hear.py episodes/<id>`** on EVERY
   real voice, before anything is timed to it. A wrong word = ask him for that ONE word as a re-take →
   `retakes/<w>.mp3` + `voice_edits.json` → `python3 tools/voice_edit.py episodes/<id>` (keeps `voice_source.mp3`
   untouched; k2-b1 is the reference). Never re-generate the whole voice for one word — every timing would move.
3. **Align.** (voice.py runs align + subs for you.) Read the table: ≈0.15–0.18 s/syllable, «~» rows only on tiny
   phrases, and subs.py must print `VERBATIM OK`. To compare settings: `align.py <ep> --db -40 --pause 0.12 --dry`.
4. **Storyboard first, code second.** Write `episodes/enotita-NN/STORYBOARD.md` following SCENE_DESIGN.md: list every
   shot with time range, the phrase(s), the key word cues, what we SEE, how it MOVES, labels, SFX. Research every
   historical visual. Alex wants you AUTONOMOUS: do NOT wait for his approval — apply DIRECTOR_MODE Loops 1–2 yourself
   (3 ideas per phrase, rubric, fact-check) and proceed. Only ask him if a decision is truly his (e.g. a new voice).
5. **Build.** Copy `episodes/_template/` → fill `scenes.mjs` (cues + static SVG per shot) and `shots.js` (animation per
   shot). Reuse engine helpers & props; add new characters/props to the ENGINE (not the episode) so the library grows.
6. **QA loop (mandatory, before any full render) — DIRECTOR_MODE Loops 3–4, incl. an independent reviewer subagent.** FIRST `node tools/check.mjs episodes/<id>` until CHECK OK, then `node tools/stills.mjs episodes/<id> --every 3` and LOOK at
   `build/stills/sheet.jpg`, then targeted stills at each cue. Go through QA_CHECKLIST.md. Fix → repeat until clean.
7. **Audio.** Write `audio.json` events (cue-keyed), run `python3 tools/mix.py …`.
8. **Render.** `node tools/render.mjs episodes/<id>` **in the background** — wait for the completion notification,
   never a blocking sleep-poll (Alex rejected that). ~2 min for 2.5 min of video; stale frames are wiped automatically.
9. **Ship.** `node tools/ship.mjs episodes/<id> <id>` → remux + poster + `build/final_sheet.jpg` (LOOK at it) + loudness.
   It refuses a draft voice or an encode older than the last change. Then the app steps in docs/PIPELINE.md →
   "Into the app" (CHAPTERS `video:` line, test block, SW bump, tests, smoke, push, curl the live mp4).
   After a voice edit, also `hear.py episodes/<id> --file ../videos/istoria/<id>.mp4 --at <t>` — prove the SHIPPED file.
10. Update the engine library/docs with anything new you learned (new props, new QA items). If a mistake cost time,
    make a TOOL catch it (check.mjs / ship.mjs), not just a sentence — that is how k2-a1's lessons became automatic.

## Quality bar — what made ενότητα 4 good (keep doing this)
- A **concrete visual metaphor for every abstract phrase**: "υπονόμευσαν τα κεκτημένα" → someone digs a tunnel and the
  building labelled ΚΕΚΤΗΜΕΝΑ sinks; "θεωρητικός δανεισμός" → money bags turn into dashed ghosts; "διχοτόμηση του
  χαρτονομίσματος" → scissors cut a banknote in two; "στέφθηκε από επιτυχία" → a laurel wreath. Literalise the words.
- **Recurring characters and consistent colour meaning** (Venizelos = RED side, Palace/royalists = BLUE).
- **Every label lands on its word** (cue = Wt(phrase, 'word')). Dates slam in when spoken.
- Each shot has: an establishing move (slide/drop/pop), 1–3 beats synced to words, continuous secondary motion
  (idle breathing, camera drift, waves), and a payoff (stamp, slam, shake).
- Comedy comes from the visuals (expressions, gags), never from changing the text.
