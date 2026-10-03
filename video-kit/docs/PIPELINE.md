# Pipeline — exact commands (run from video-kit/)

Node is not on PATH in this repo: `export PATH="$HOME/.local/node-v24.18.0-darwin-arm64/bin:$PATH"` first.
Episode folder = the unit id of `istoria-voithima.html` (`k2-a1`, `k2-a2` …), so ship needs no renaming.

```bash
# 0. once (already done in this repo)
npm install && npx playwright install chromium        # + ffmpeg on PATH, python3 with numpy/scipy

# 1. new episode
cp -r episodes/_template episodes/k2-a2
#    book.txt = the chapter EXACTLY as istoria-voithima.html has it (typos included — Alex keeps them)

# 2. voice text
python3 tools/voice_script.py episodes/k2-a2          # fix every REVIEW item by hand in voice.txt (+replacements.json)
#    title lines in replacements.json KEEP their full stop (["Ενότητα δύο.", "Ενότητα 2."])
#    → give Alex voice.txt for ElevenLabs (voice Eleni). DON'T WAIT for it:

# 3. draft voice → build the whole film now (every time is a word cue, so the real voice re-times it for free)
python3 tools/voice.py draft episodes/k2-a2           # Melina → voice.mp3 + VOICE_IS_DRAFT.txt, runs align + subs

# 4. storyboard (DIRECTOR_MODE loops 1–2) → STORYBOARD.md, then build scenes.mjs + shots.js + audio.json

# 5. QA loop — check FIRST (20 s), stills second
node tools/check.mjs episodes/k2-a2                   # runtime errors · tiling · late cues · verbatim subs · audio cues
node tools/stills.mjs episodes/k2-a2 --every 3        # LOOK at build/stills/sheet.jpg
node tools/stills.mjs episodes/k2-a2 21.4 22 35.8     # targeted checks

# 6. the real voice arrives (newest ~/Downloads/ElevenLabs_*.mp3 is picked automatically)
python3 tools/voice.py use episodes/k2-a2             # refuses a file that is another episode's voice
node tools/check.mjs episodes/k2-a2                   # re-timed film: re-check late cues + stills sheet

# 7. audio + render (parallel; frames from an older page are wiped automatically)
python3 tools/mix.py episodes/k2-a2                   # build/mix.wav
node tools/render.mjs episodes/k2-a2                  # → build/final_hq.mp4 + final_web.mp4 + final.stamp
node tools/render.mjs episodes/k2-a2 --clear 52.8 60.5   # after fixing ONE shot: redo only that range

# 8. into the app
node tools/ship.mjs episodes/k2-a2 k2-a2              # → ../videos/istoria/k2-a2.mp4 + .jpg + build/final_sheet.jpg
```

## Timing: what it costs
- 2.5–3 min video ≈ 4,800 frames; on this Mac the full render took **~2 min** (k2-a1). Cheap — prefer a full re-render
  over clever partial ones unless one shot changed.
- ⛔ **Run render.mjs in the BACKGROUND and wait for its completion notification.** Never a blocking `until … sleep`
  loop — Alex rejected exactly that. Do other work (docs, REVIEW.md) meanwhile.

## Gotchas that cost time in k2-a1 (now handled by the tools)
| problem | handled by |
|---|---|
| `Cannot read properties of null (setAttribute)` with no clue which id | runtime `$$` → «missing element #S13-l4» |
| first phrase lost its subtitle (title merged with it) | subs.py never merges title + book chunks, prints `VERBATIM OK` |
| align at −40 dB shifted phrases one slot | align.py default −32/0.07; compare with `--db -40 --pause 0.12 --dry` |
| `align_try.py` copy just to test settings | `--db/--pause/--dry` flags |
| frames of an old cut silently reused | render.mjs hashes the page, wipes stale frames |
| shipping an encode older than the last fix | ship.mjs compares page+mix hash with `final.stamp` |
| shipping the Melina draft | ship.mjs refuses while `VOICE_IS_DRAFT.txt` exists |
| grabbing last episode's mp3 from Downloads | voice.py refuses a file identical to another episode's voice |
| cue landing in the last 0.8 s of its shot | check.mjs lists them (reads `C.x ± n` per `F.Sx`) |

## Permissions in this environment
- `rm -rf` is denied. Never plan around deleting: render.mjs wipes stale frames itself; scratch files go in
  `episodes/<ep>/build/` (gitignored) or the session scratchpad.
- New files under `tools/` need approval; throwaway debug scripts belong in `episodes/<ep>/build/`.

## Into the app (what ship.mjs prints, and the rest by hand)
1. `istoria-voithima.html`, the unit's object in `CHAPTERS`: `video: { src: "videos/istoria/<id>.mp4", poster: "videos/istoria/<id>.jpg" },`
   → the «Βίντεο» tab appears by itself.
2. `tests/istoria-voithima.test.js`: copy the k2-a1 block (boot `#/<id>/video`, its OWN eyebrow + title, file exists).
   ⚠️ src is set as a PROPERTY (smoke-test treats every src-attribute as a link) — assert it on `CHAPTERS`, not on the HTML.
3. `sw.js:15` bump `als-vNNN`; `CLAUDE.md` «Currently als-vNNN».
4. Tests (`tests/istoria-voithima.test.js` must be 0 failures; `insights-page` + `ladders` were already red), `./smoke-test.sh`.
5. Commit (episode sources + voice.mp3 + videos/istoria/<id>.*, never build/), push, then confirm live:
   `curl -sI https://als-ochre.vercel.app/videos/istoria/<id>.mp4` → 200 video/mp4, and sw.js shows the new version.
