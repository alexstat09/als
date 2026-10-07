#!/usr/bin/env python3
"""LISTEN to the real narration before timing anything to it (k2-b1: the voice did NOT say what voice.txt said).
   python3 tools/hear.py episodes/<ep>                 whole file vs voice.txt → only the places where they DIFFER
   python3 tools/hear.py episodes/<ep> --file x.mp3    another file (e.g. the untouched source, or a re-take)
   python3 tools/hear.py episodes/<ep> --at 201.5      the words around 201.5 s, with times
   python3 tools/hear.py episodes/<ep> --env 201 202.4 RMS envelope (20 ms) on DECODED audio → where to cut
Needs faster-whisper in ~/.cache/video-kit-whisper (one-time:
   python3 -m venv ~/.cache/video-kit-whisper && ~/.cache/video-kit-whisper/bin/pip install faster-whisper).
What it catches, all seen in k2-b1: a voice generated from the PAGE instead of voice.txt (headings read aloud, a
footnote «ψηφοφορίας10» read as «δέκα», a Latin v in «vέους» read «βέους»). Whisper misspells homophones all the time
(«σώρους» for «όρους»), so the comparison is phonetic and only BLOCKS of disagreement are printed: inserted words
(spoken but not in the text), dropped words, and replacements that do not sound alike. Read them; most are noise.
"""
import os, re, subprocess, sys, unicodedata, difflib
VENV = os.path.expanduser('~/.cache/video-kit-whisper/bin/python')
try:
    import numpy as np
    from faster_whisper import WhisperModel
except ImportError:
    # compare PREFIXES, not executables: a venv's python is a symlink to the system one (realpath is identical)
    if os.path.exists(VENV) and os.path.realpath(sys.prefix) != os.path.realpath(os.path.dirname(os.path.dirname(VENV))):
        os.execv(VENV, [VENV] + sys.argv)
    sys.exit('faster-whisper missing — see the header of this file for the one-time install')
a = sys.argv[1:]; ep = a[0]
src = a[a.index('--file') + 1] if '--file' in a else os.path.join(ep, 'voice.mp3')
def pcm(f, s=0.0, e=None):
    af = f'atrim={s}' + (f':{e}' if e is not None else '') + ',asetpts=PTS-STARTPTS'
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-af', af, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.int16).astype(np.float32) / 32768
if '--env' in a:
    s, e = float(a[a.index('--env') + 1]), float(a[a.index('--env') + 2]); x = pcm(src, s, e)
    for i in range(0, len(x) - 160, 320):
        w = x[i:i + 320]; db = 20 * np.log10(np.sqrt((w ** 2).mean()) + 1e-9)
        zc = (np.abs(np.diff(np.sign(w))) > 0).mean()   # high (>0.4) = σ/ς/φ hiss, low = vowel
        print(f'{s + i / 16000:8.2f} {db:6.1f} dB  zc {zc:.2f} ' + '#' * max(0, int(db + 60)))
    sys.exit()
model = WhisperModel('small', compute_type='int8')
def words(x, off=0.0):
    segs, _ = model.transcribe(x, language='el', word_timestamps=True, vad_filter=False)
    return [(w.start + off, w.end + off, w.word.strip()) for s in segs for w in s.words]
if '--at' in a:
    t = float(a[a.index('--at') + 1]); s = max(0.0, t - 4)
    for ws, we, w in words(pcm(src, s, t + 4), s): print(f'{ws:8.2f}-{we:7.2f}  {w}' + ('   ◀' if ws <= t <= we else ''))
    sys.exit()
def fold(w):   # sound, not spelling: ι/η/υ/ει/οι → ι, ω → ο, αι → ε, double consonants, no accents/punctuation
    w = ''.join(c for c in unicodedata.normalize('NFD', w.lower()) if unicodedata.category(c) != 'Mn')
    w = re.sub(r'[^α-ωa-z0-9]', '', w.replace('ς', 'σ'))
    for p, r in (('ει', 'ι'), ('οι', 'ι'), ('υι', 'ι'), ('αι', 'ε'), ('η', 'ι'), ('υ', 'ι'), ('ω', 'ο')): w = w.replace(p, r)
    return re.sub(r'(.)\1', r'\1', w)
NUMW = {fold(w) for w in '''μηδέν ένα μία μια δύο τρία τρεις τέσσερα τέσσερις πέντε έξι επτά εφτά οκτώ οχτώ εννέα εννιά δέκα
  έντεκα δώδεκα είκοσι τριάντα σαράντα πενήντα εξήντα εβδομήντα ογδόντα ενενήντα εκατό εκατόν διακόσια τριακόσια
  τετρακόσια πεντακόσια εξακόσια επτακόσια οκτακόσια εννιακόσια χίλια χιλιάδες εκατομμύρια πρώτη πρώτο δεύτερη τρίτης
  τρίτη τέταρτη άλφα βήτα γάμα δέλτα γ) α) β) ένα. ογδόντα.'''.split()}
text = open(os.path.join(ep, 'voice.txt'), encoding='utf-8').read().split()
heard = words(pcm(src))
A, B = [fold(w) for w in text], [fold(w) for _, _, w in heard]
n = 0
for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, A, B, autojunk=False).get_opcodes():
    if op == 'equal': continue
    said, want = ''.join(B[j1:j2]), ''.join(A[i1:i2])
    # numbers and letter names: Whisper writes «1844» / «V» / «3η» for «χίλια οκτακόσια…» / «Βήτα» / «τρίτης»
    if op == 'replace' and (re.search(r'\d', said) or all(fold(w) in NUMW for w in text[i1:i2])): continue
    if op == 'replace':
        # word-for-word blocks are judged per word, and a word whose FIRST sound differs is never "the same sound":
        # «βέους» vs «νέους» is 80 % alike as letters and is exactly the error that must be caught
        if i2 - i1 == j2 - j1:
            if all(x == y or (x[:1] == y[:1] and difflib.SequenceMatcher(None, x, y).ratio() >= .6)
                   for x, y in zip(A[i1:i2], B[j1:j2])): continue
        elif difflib.SequenceMatcher(None, said, want).ratio() >= .75: continue   # «δημιούργει σε» = «δημιούργησε»
    t = heard[j1][0] if j1 < len(heard) else heard[-1][1]
    n += 1
    print(f'{t:8.2f}  {op:7}  text: {" ".join(text[i1:i2]) or "—":40.40}  heard: {" ".join(w for _, _, w in heard[j1:j2]) or "—"}')
print(f'\n{len(heard)} words heard, {len(text)} in voice.txt, {n} block(s) to judge by ear' +
      ('' if n else ' — the voice says the text'))
