# Audio

## Voice (ElevenLabs)
- Voice: **Eleni – Soft Narrational and Calm** (used for ενότητα 4; keep it for every chapter so the series is consistent).
- Alex pastes `voice.txt` (from tools/voice_script.py, reviewed by you) into ElevenLabs Text-to-Speech, downloads the MP3,
  saves it as `episodes/<ep>/voice.mp3`. Ask him to listen for mispronunciations (abbreviations like ΗΠΑ, elisions like
  σ' έναν / κατ' αρχήν, numbers). If something is wrong, change only voice.txt spelling and regenerate.
- Claude cannot hear audio: always ask Alex to listen-check the voice and the final mix.

## Music
**None.** Alex removed background music (he prefers voice + sparse effects). Do not add music unless he asks.
Never use files named *preview* / *-pr* (they contain spoken watermarks — this happened with ενότητα 4).

## Sound effects (sounds/, from Pixabay — free licence)
| name | use |
|---|---|
| whoosh | major scene changes, scissors swing, camera whips |
| lowhit | titles, named events (stamps), dates of big events, doom moments |
| punch | landings, stamps, bonks, padlock |
| pop | small labels, numbers, pins |
| zap | ✕ marks, sparks, cuts |
| magic | transformations (ghost money, ideas, seals, success) |
| whistle1 / whistle2 / whistle_long | something falling from above (before a drop/punch) |
Rules: ≈1 effect per 4 s on average; only on visual beats; gains 0.3–0.9 (whooshes ~0.55, big lowhits 0.8–0.9);
pan characters' effects toward their side (−0.6 / +0.6). Write events in `episodes/<ep>/audio.json` keyed to cues:
`{"cue": "dix", "dt": 0, "sound": "lowhit", "gain": 0.85, "pan": 0}`. Run `python3 tools/mix.py episodes/<ep>`.
New sounds: add the file to sounds/ and an entry in `SOUNDS` in tools/mix.py (licence must allow use).
