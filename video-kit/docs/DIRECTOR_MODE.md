# Director mode — think like the Claude that made ενότητα 4 (autonomous, self-critical)

Alex does NOT want to supervise. You are the director, the animator AND the strict reviewer. The quality of ενότητα 4
came from loops, not from one pass. Follow these loops literally; write the outputs into the episode folder so the
work is visible (`STORYBOARD.md`, `REVIEW.md`).

## Loop 1 — Ideas (per phrase), before any code
For EVERY phrase with a key term, write 3 candidate visuals in STORYBOARD.md, then pick one with this rubric
(score 1–5 each, pick the highest total, note the score):
1. **Literal** — does the image literally show the WORD (υπονόμευσαν → tunnel under the building)? A generic image
   (a character standing there) scores 1.
2. **Memorable** — would a 17-year-old remember it a month later? Gag, exaggeration, surprise.
3. **Accurate** — nothing false or anachronistic (flags, borders, uniforms, who did what).
4. **Readable in 1 second** — one focal point, the exam word on screen as a label.
5. **Varied** — not the same shot type as the previous 2 shots.
Reject anything scoring < 3 on Literal or Accurate.

## Loop 2 — Fact check
List every historical claim the VISUALS make (borders, places, dates, people present, flags, uniforms, routes).
Web-search each one you're not certain of; write source links in STORYBOARD.md under FACTS. If unsure and you cannot
verify → choose a visual that doesn't assert it (e.g. a labelled sign instead of a precise border).

## Loop 3 — Build, then look like a harsh critic (repeat until clean, minimum 2 rounds)
1. `node tools/stills.mjs <ep> --every 3` → open `build/stills/sheet.jpg` AND `docs/reference_enotita04_sheet.jpg`
   side by side. Ask: is my sheet as rich, varied, colourful and readable as the reference? Where is it emptier?
2. Stills at every cue (+0.4 s) and at the first/last 0.2 s of every shot.
3. For EACH still write one line in `REVIEW.md`: what's good, what's wrong (use QA_CHECKLIST.md categories).
   Typical things to catch: overlapping labels, empty frames, objects too small, edges revealed, wrong expression,
   label landing late, text in subtitle band, static shots, two similar shots in a row.
4. Fix everything, regenerate stills, and write "Round 2" in REVIEW.md. Stop only when a round finds nothing.
5. **Independent reviewer:** spawn a fresh subagent (Task tool) with only: the stills sheet, the storyboard,
   QA_CHECKLIST.md and the reference sheet, asking it to list every flaw it sees. Fix what it finds. (A fresh pair of
   eyes catches what the author misses.)

## Loop 4 — Motion check
Render 3–4 short ranges (`node tools/render.mjs <ep> --from A --to B --no-encode`) around the busiest beats, make a
frame strip (`ffmpeg -i build/frames/f%05d.jpg` … or look at consecutive frames) and check: entrances overshoot, nothing
pops without motion, camera never static, landings squash, shake on impacts, timing lands on the word.

## Loop 5 — Final
Full render → contact sheet of `final_web.mp4` every 3 s → compare with the reference once more → only then put it
into the app. Tell Alex in 3–4 Greek sentences what the video contains, and ask him to listen to the audio (you can't).

## Mindset
- Default to MORE visual ideas per minute, not fewer: ενότητα 4 had a new visual beat every ~2.5 s.
- If a shot feels like a slide (text + one object), add an action that illustrates the verb.
- Never "good enough". If you would not show it to Alex as "perfect", it's not done.
- Use the strongest available model and think deeply on Loops 1–3; they decide the quality.
