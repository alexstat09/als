# Pipeline — exact commands (run from video-kit/)

```bash
# 0. once
npm install && npx playwright install chromium
pip install numpy scipy            # + ffmpeg must be on PATH (brew install ffmpeg / winget install ffmpeg)

# 1. new episode
cp -r episodes/_template episodes/enotita-05
#    put the chapter text, verbatim, in episodes/enotita-05/book.txt

# 2. voice text
python3 tools/voice_script.py episodes/enotita-05      # fix REVIEW items in voice.txt (+replacements.json)
#    → Alex: ElevenLabs (voice Eleni) → episodes/enotita-05/voice.mp3

# 3. timing
python3 tools/align.py episodes/enotita-05             # phrases.json (check the printed table)
python3 tools/subs.py  episodes/enotita-05             # timing.json  (verbatim subtitle chunks)

# 4. storyboard → STORYBOARD.md, show Alex

# 5. build + QA loop
node episodes/enotita-05/scenes.mjs                    # builds build/video.html (+ cues.json)
node tools/stills.mjs episodes/enotita-05 --every 3    # LOOK at build/stills/sheet.jpg
node tools/stills.mjs episodes/enotita-05 21.4 22 35.8 # targeted checks
#    (open build/video.html in a browser and call seek(t) in the console for interactive debugging)

# 6. audio
python3 tools/mix.py episodes/enotita-05               # build/mix.wav

# 7. render (parallel, resumable) + encode
node tools/render.mjs episodes/enotita-05              # → build/final_hq.mp4, build/final_web.mp4
node tools/render.mjs episodes/enotita-05 --clear 52.8 60.5   # after fixing one shot: re-render just that range
```
Render speed: ~0.4 s/frame/worker (heavier on zoomed-out maps). A 3.5-min video = 6,450 frames → with 7 workers ≈ 7–10 min.

## Into the app (School Studies on Vercel)
- Copy `build/final_web.mp4` (≈30 MB per 3.5 min) to the app's static folder, e.g. `public/videos/istoria/enotita-05.mp4`
  (keep files < 50 MB; GitHub rejects > 100 MB).
- In the Ιστορία page data for that ενότητα, set its `video` field; the «Βίντεο» tab appears only when a video exists.
  (If the tab system doesn't exist yet: add a «Βίντεο» tab with `<video controls preload="metadata" playsinline>`,
  16:9, rounded corners + thin border like the page cards, small mono label «ΕΝΟΤΗΤΑ N · ANIMATION». No autoplay.)
- Keep `build/` out of git (.gitignore). Commit the episode sources (book/voice txt, json, scenes.mjs, shots.js,
  audio.json, STORYBOARD.md, voice.mp3).
