#!/usr/bin/env python3
"""Surgical edits on the real narration — cut a word, or replace one word with a re-take — reproducibly.
   python3 tools/voice_edit.py episodes/<ep>            builds <ep>/voice.mp3 from <ep>/voice_edits.json, then align + subs
   python3 tools/voice_edit.py episodes/<ep> --dry      prints the ffmpeg graph only
<ep>/voice_edits.json:
 { "source": "voice_source.mp3",                         ← the UNTOUCHED ElevenLabs file, committed next to it
   "edits": [
     {"cut": [153.30, 153.655], "why": "«δέκα» = footnote 10 read aloud"},
     {"replace": [201.715, 202.225], "with": "retakes/neous.mp3", "trim": [0.035, 0.765],
      "tempo": 1.15, "gain_db": -4.5, "why": "«βέους» (Latin v in the book) → «νέους»"} ] }
Rules this encodes (k2-b1, each one cost a round):
 * Always rebuild from the SOURCE with every edit in ONE graph → one MP3 generation, and an edit list anyone can re-run.
 * Times are SOURCE times (before any earlier cut). Find them on DECODED audio (atrim / tools/hear.py --env), never with
   `ffmpeg -ss` on an mp3, and cut in an energy dip between words.
 * An isolated-word re-take is slower, louder and ends in a decay to silence: trim its head/tail, tempo ≈1.1–1.2,
   gain to the neighbours' level, or the splice is audible as a pause.
 * libmp3lame rejects acrossfade output directly ("inadequate AVFrame plane padding") → render WAV, then encode.
 * After: python3 tools/hear.py episodes/<ep> --at <t>  must hear the right word; then check.mjs (cues re-time for free).
"""
import json, os, subprocess, sys
ep = sys.argv[1]; DRY = '--dry' in sys.argv
cfg = json.load(open(os.path.join(ep, 'voice_edits.json'), encoding='utf-8'))
src = os.path.join(ep, cfg['source'])
edits = sorted(cfg['edits'], key=lambda e: (e.get('cut') or e['replace'])[0])
inputs, parts, chains, take, t, n = ['-i', src], [], [], [], 0.0, 0
for e in edits:
    a, b = e.get('cut') or e['replace']
    if a < t: sys.exit(f'⛔ edits overlap at {a}')
    parts.append(f'[0]atrim={t}:{a},asetpts=PTS-STARTPTS[p{n}]'); chains.append(f'p{n}'); take.append(False); n += 1
    if 'replace' in e:
        inputs += ['-i', os.path.join(ep, e['with'])]; k = len(inputs) // 2 - 1
        s, f = e.get('trim', [0, None])
        f_ = f'atrim={s}:{f}' if f is not None else f'atrim={s}'
        fx = [f_, 'asetpts=PTS-STARTPTS']
        if e.get('tempo'): fx.append(f"atempo={e['tempo']}")
        if e.get('gain_db'): fx.append(f"volume={e['gain_db']}dB")
        parts.append(f'[{k}]' + ','.join(fx) + f'[p{n}]'); chains.append(f'p{n}'); take.append(True); n += 1
    t = b
parts.append(f'[0]atrim={t},asetpts=PTS-STARTPTS[p{n}]'); chains.append(f'p{n}'); take.append(False)
# joins: 20 ms at a pure cut, 12 ms around a re-take (short: the re-take is one word)
cur = chains[0]
for i, nxt in enumerate(chains[1:]):
    d = 0.012 if (take[i] or take[i + 1]) else 0.02
    out = f'j{i}'; parts.append(f'[{cur}][{nxt}]acrossfade=d={d}:c1=qsin:c2=qsin[{out}]'); cur = out
graph = ';'.join(parts)
if DRY: print(graph); sys.exit()
os.makedirs(os.path.join(ep, 'build'), exist_ok=True)
wav, mp3 = os.path.join(ep, 'build', 'voice_edit.wav'), os.path.join(ep, 'voice.mp3')
subprocess.run(['ffmpeg', '-v', 'error', '-y', *inputs, '-filter_complex', graph, '-map', f'[{cur}]', '-ac', '1', '-ar', '44100', wav], check=True)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', wav, '-b:a', '192k', mp3], check=True)
d = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp3], capture_output=True, text=True).stdout)
print(f'{mp3}: {d:.2f} s ← {len(edits)} edit(s) on {cfg["source"]}')
here = os.path.dirname(os.path.abspath(__file__))
subprocess.run([sys.executable, os.path.join(here, 'align.py'), ep], check=True)
subprocess.run([sys.executable, os.path.join(here, 'subs.py'), ep], check=True)
