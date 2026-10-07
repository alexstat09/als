#!/usr/bin/env python3
"""The narration file, both lives of it.
   python3 tools/voice.py draft episodes/<ep>
       macOS «Melina» reads voice.txt → <ep>/voice.mp3 + VOICE_IS_DRAFT.txt, then align + subs.
       Lets you BUILD the whole film before Alex sends the real voice (k2-a1 was made this way). Everything is
       keyed to words (C.* / D.shots), so the real voice later re-times it with zero code changes.
   python3 tools/voice.py use episodes/<ep> [file.mp3]
       The real ElevenLabs file. With no path: the NEWEST ~/Downloads/ElevenLabs_*.mp3 (that is how it arrives).
       Copies it to <ep>/voice.mp3, removes VOICE_IS_DRAFT.txt, runs align + subs, prints the table to check.
   A wrong WORD in the real voice is never fixed by re-generating everything: tools/voice_edit.py splices a re-take.
⛔ ship.mjs refuses to publish while VOICE_IS_DRAFT.txt exists — a draft voice must never reach the app.
"""
import glob, os, shutil, subprocess, sys
mode, ep = sys.argv[1], sys.argv[2]
mp3, marker = os.path.join(ep, 'voice.mp3'), os.path.join(ep, 'VOICE_IS_DRAFT.txt')
here = os.path.dirname(os.path.abspath(__file__))
def run(*a): subprocess.run(a, check=True)
def dur(f): return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f],
                                        capture_output=True, text=True).stdout)
if mode == 'draft':
    os.makedirs(os.path.join(ep, 'build'), exist_ok=True)
    aiff = os.path.join(ep, 'build', 'draft.aiff')
    run('say', '-v', 'Melina', '-f', os.path.join(ep, 'voice.txt'), '-o', aiff)
    run('ffmpeg', '-v', 'error', '-y', '-i', aiff, '-ar', '44100', '-ac', '1', '-b:a', '128k', mp3)
    open(marker, 'w').write('voice.mp3 is a DRAFT (macOS Melina) used ONLY for building/QA.\n'
                            'Replace with: python3 tools/voice.py use ' + ep + '\nNEVER ship this.\n')
elif mode == 'use':
    src = sys.argv[3] if len(sys.argv) > 3 else None
    if not src:
        c = glob.glob(os.path.expanduser('~/Downloads/ElevenLabs_*.mp3'))
        if not c: sys.exit('no ~/Downloads/ElevenLabs_*.mp3 — pass the file path explicitly')
        # a one-word RE-TAKE (voice_edit.py) is also an ElevenLabs_*.mp3 and is usually the newest download (k2-b1,
        # «νέους», 0.9 s) — skip anything shorter than 30 s instead of making it the whole narration
        c = [f for f in c if dur(f) >= 30]
        if not c: sys.exit('no full-length ~/Downloads/ElevenLabs_*.mp3 (only short re-takes) — pass the file path explicitly')
        src = max(c, key=os.path.getmtime)
    print('voice ←', src)
    # and an explicit path is checked against the text: ~0.14–0.18 s per syllable is how Eleni reads
    vow = r'(αι|ει|οι|υι|ου|αυ|ευ|ηυ|[αεηιουωάέήίόύώϊϋΐΰ])'
    import re
    est = len(re.findall(vow, open(os.path.join(ep, 'voice.txt'), encoding='utf-8').read(), re.I)) * 0.14
    if dur(src) < 0.5 * est:
        sys.exit(f'⛔ {dur(src):.1f} s is far too short for voice.txt (~{est:.0f} s) — a re-take goes through voice_edit.py, not here')
    # the newest download may still be the PREVIOUS episode's voice (Alex has not exported the new one yet):
    # refuse a file that is byte-identical to another episode's voice.mp3 instead of silently re-using it
    import hashlib
    h = lambda f: hashlib.sha1(open(f, 'rb').read()).hexdigest()
    me = os.path.realpath(ep)
    for other in glob.glob(os.path.join(here, '..', 'episodes', '*', 'voice.mp3')):
        if os.path.realpath(os.path.dirname(other)) != me and h(other) == h(src):
            sys.exit(f'⛔ that file IS the voice of {os.path.basename(os.path.dirname(other))} — export the new one first')
    shutil.copyfile(src, mp3)
    if os.path.exists(marker): os.remove(marker)
else:
    sys.exit('mode must be draft or use')
print(f'{mp3}: {dur(mp3):.2f} s')
run(sys.executable, os.path.join(here, 'align.py'), ep)
run(sys.executable, os.path.join(here, 'subs.py'), ep)
print('\nNext: read the align table (≈0.15–0.18 s/syllable, «~» only on tiny phrases), then `node tools/check.mjs', ep + '`')
