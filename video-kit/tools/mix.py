#!/usr/bin/env python3
"""Final audio: narration + ducked music bed + SPARSE sound effects  →  <ep>/build/mix.wav  (−16 LUFS, −1.5 dBTP)
   python3 tools/mix.py episodes/<ep>          (needs numpy, scipy, ffmpeg; run AFTER scenes.mjs so build/cues.json exists)
<ep>/audio.json:
 { "music":  [ {"file": "music_epic_infraction.mp3", "at": 0, "offset": 0, "length": 54, "fadeIn": 0.3, "fadeOut": 2}, ...
               ("length": "END" = until the end; short files loop automatically) ],
   "events": [ {"cue": "dix", "dt": 0, "sound": "lowhit", "gain": 0.85, "pan": 0}, {"t": 10.55, "sound": "whoosh", "gain": 0.55}, ... ] }
"cue" = a key of the episode's cue object C (build/cues.json); "t" = absolute seconds. pan −1 (left) … +1 (right).
Sound names → see SOUNDS below (files in ../sounds). Add new sounds there (file + optional trim [start,end]).
Levels: voice speech RMS ≈ −18 dBFS, music ≈ −36 dBFS and ducks a further ~5 dB while the voice talks, SFX peak-normalised.
RULE: ≤ ~1 effect per 4 seconds on average. Effects mark visual beats (titles, stamps, drops, cuts); never under every word.
"""
import json, os, sys, subprocess, tempfile
import numpy as np
from scipy.io import wavfile
from scipy import signal
SR = 48000
KIT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOUNDS = {  # name: (file, trim_start, trim_end)  — trims in seconds (None = whole file)
    'whoosh': ('whoosh.mp3', None, None), 'zap': ('zap.mp3', None, None), 'pop': ('pop.mp3', None, None),
    'punch': ('punch.mp3', None, None), 'lowhit': ('lowhit.mp3', None, None), 'magic': ('magic.mp3', 0, 1.8),
    'whistle1': ('whistles.mp3', 8.42, 9.15), 'whistle2': ('whistles.mp3', 15.0, 15.78),
    'whistle_long': ('whistles.mp3', 11.6, 14.3),
}
ep = sys.argv[1]
C = json.load(open(os.path.join(ep, 'build/cues.json')))
A = json.load(open(sys.argv[2] if len(sys.argv) > 2 else os.path.join(ep, 'audio.json'), encoding='utf-8'))  # optional 2nd arg: alternative audio config
DUR = C['DUR']; N = int(DUR * SR)
def load(path):
    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as f: tmp = f.name
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', path, '-ar', str(SR), '-ac', '2', tmp], check=True)
    sr, x = wavfile.read(tmp); os.unlink(tmp); return x.astype(np.float32) / 32768.0
db = lambda x: 10 ** (x / 20)
def fade(x, fi=.01, fo=.05):
    n = len(x); a, b = min(n, int(fi * SR)), min(n, int(fo * SR)); x = x.copy()
    if a: x[:a] *= np.linspace(0, 1, a)[:, None]
    if b: x[n - b:] *= np.linspace(1, 0, b)[:, None]
    return x
def place(buf, t, x, g=1.0, pan=0.0):
    i = max(0, int(t * SR)); x = x[:max(0, N - i)]
    gl, gr = np.cos((pan + 1) * np.pi / 4) * 1.414, np.sin((pan + 1) * np.pi / 4) * 1.414
    buf[i:i + len(x), 0] += x[:, 0] * g * gl; buf[i:i + len(x), 1] += x[:, 1] * g * gr
voice = np.zeros((N, 2), np.float32); music = np.zeros_like(voice); sfx = np.zeros_like(voice)
v = load(os.path.join(ep, 'voice.mp3')); voice[:min(N, len(v))] = v[:N]
cache = {}
for m in A.get('music', []):
    src = cache.setdefault(m['file'], load(os.path.join(KIT, 'sounds', m['file'])))
    length = (DUR - m['at']) if m['length'] == 'END' else m['length']
    need = int((m.get('offset', 0) + length) * SR) + 1
    s = np.concatenate([src] * (need // len(src) + 1)) if need > len(src) else src
    seg = s[int(m.get('offset', 0) * SR):int((m.get('offset', 0) + length) * SR)]
    place(music, m['at'], fade(seg, m.get('fadeIn', 1), m.get('fadeOut', 2)), m.get('gain', 1.0))
snd = {}
def sound(name):
    if name not in snd:
        f, a, b = SOUNDS[name]; x = load(os.path.join(KIT, 'sounds', f))
        if a is not None: x = fade(x[int(a * SR):int(b * SR)], .005, .08)
        snd[name] = x / (np.max(np.abs(x)) + 1e-9) * db(-3)
    return snd[name]
for e in A.get('events', []):
    t = (C[e['cue']] if 'cue' in e else e['t']) + e.get('dt', 0)
    place(sfx, t, sound(e['sound']), e.get('gain', .5), e.get('pan', 0))
def rms_db(x):
    y = x[np.abs(x).sum(1) > 1e-4]; return 20 * np.log10(np.sqrt(np.mean(y ** 2)) + 1e-9) if len(y) else -99
voice *= db(-18 - rms_db(voice))
if np.abs(music).max() > 0: music *= db(A.get('musicLevelDb', -36) - rms_db(music))
sfx *= db(A.get('sfxGainDb', -6))
env = signal.sosfilt(signal.butter(2, 4, 'low', fs=SR, output='sos'), np.abs(voice).mean(1))
gain = signal.sosfilt(signal.butter(1, 2, 'low', fs=SR, output='sos'), 1 - .45 * np.clip(env / (np.percentile(env, 70) + 1e-9), 0, 1))
music *= gain[:, None]
mix = voice + music + sfx
e0 = int((C['end'] + .8) * SR)
if e0 < N: mix[e0:] *= np.linspace(1, 0, N - e0)[:, None]
mix = np.tanh(mix * 1.2) / 1.2
os.makedirs(os.path.join(ep, 'build'), exist_ok=True)
raw = os.path.join(ep, 'build/mix_raw.wav'); wavfile.write(raw, SR, (np.clip(mix, -1, 1) * 32767).astype(np.int16))
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', raw, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', str(SR), os.path.join(ep, 'build/mix.wav')], check=True)
print(f"mix.wav written: {len(A.get('events', []))} effects, {len(A.get('music', []))} music segments, {DUR:.1f}s")
