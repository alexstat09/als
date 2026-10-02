# Motion — how things move (Historically level)

Everything is cutout animation driven by `window.seek(t)` (pure function of time → frame-accurate, re-renderable).

## Principles
1. **Nothing is ever static.** Every shot has a slow camera drift (`cam()` keys: scale 1.00→1.04–1.08 or a pan),
   characters breathe (`idle()`), waves scroll (`waves()`), floating objects bob (`Math.sin(t*2)*8`).
2. **Overshoot & settle.** Entrances use `slam()` (big→1 with back-ease, slight rotation that straightens) or `popIn()`
   (0→1 back-ease). Never linear fades for main objects.
3. **Squash & stretch.** Characters arrive with `drop()` (fall 0.34 s, stretched; land squashed, wobble 2.6 Hz).
4. **Anticipate the word.** Visual hits land ON the cue (±0.1 s). Movement that leads into it starts 0.2–0.7 s before.
5. **Impact = shake (+ flash for big moments).** `shk(t, amp, dur)` in shots.js: 6–12 small, 14–24 big. `fl(t, .45)`
   white flash only for 3–5 biggest beats per video.
6. **Characters animate "on twos"** (15 fps feel) via `q15(t)` inside idle/blinks — cartoon look. Camera stays 30 fps.
7. **Expressions tell the story**: switch `expr(id,'angry'|'sad'|'happy'|'shock'|…)` exactly on the cue; add blinks
   (`blinkAt(t,[…])`) for life; head tilt toward the opponent in conflicts.
8. **Cuts**: hard cuts on phrase boundaries (whoosh SFX on major scene changes). Close-up split screens for
   confrontations (see S5 → close-up in the test, and S3).
9. **Counters** (`count()`) only to the exact book number, ≤0.6 s.

## Timing defaults
| action | duration |
|---|---|
| slam | 0.35–0.5 s |
| popIn | 0.3–0.4 s |
| character drop | 0.34 s fall + ~0.6 s settle |
| slide-in from side | 0.3–0.6 s, eOut |
| map colour flood (clip circle) | 1.5–2.5 s eIO |
| crack draw | 0.5–0.6 s eOut |
| camera move between beats | 0.7–2 s eIO |
| label after its object | +0.1–0.3 s |

## Camera
`cam(id, t, [[t, cx, cy, scale], …])` centres (cx,cy) of the shot's world on screen. Keep the visible area inside the
drawn background: visible half-width = 960/scale. Backgrounds from `sky()`/`night()` extend 400 px past every edge,
maps much more. Check the first and last frame of every camera move in stills (QA).
