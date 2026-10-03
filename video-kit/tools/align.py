#!/usr/bin/env python3
"""Align the narration audio to the text, phrase by phrase (no speech model needed).
   python3 tools/align.py episodes/<ep>            (needs <ep>/voice.mp3 and <ep>/voice.txt, ffmpeg on PATH)
How: ffmpeg silencedetect finds every pause; a global dynamic-programming pass assigns phrase boundaries
(text split after , . : ;) to pauses so that each phrase's duration matches its syllable count. Sentence ends
prefer long pauses. Output <ep>/phrases.json  [{i,start,end,text,anch}]  (anch=False → boundary interpolated).
Accuracy ≈ ±0.3–0.5 s per phrase; word cues inside a phrase are interpolated by syllables (engine cueTools.Wt).
If a phrase looks wrong (check with tools/stills.mjs or by listening): tweak NOISE_DB / MIN_PAUSE below and re-run.
"""
import re, json, math, sys, os, subprocess
ep = sys.argv[1]
# -32/0.07 since k2-a1: at -40/0.12 the ElevenLabs title pauses were missed and the first book phrases shifted one slot
# early (13 interpolated boundaries). Sanity-check: «~» rows should be only tiny phrases, ≈0.15–0.18 s/syllable.
NOISE_DB, MIN_PAUSE = -32, 0.07
text = open(os.path.join(ep, 'voice.txt'), encoding='utf-8').read()
phr = [p for p in re.split(r'(?<=[,.:;·!?])\s+', ' '.join(text.split())) if p.strip()]
vow = re.compile(r'(αι|ει|οι|υι|ου|αυ|ευ|ηυ|[αεηιουωάέήίόύώϊϋΐΰ])', re.I)
syl = [max(1, len(vow.findall(p))) for p in phr]
audio = os.path.join(ep, 'voice.mp3')
dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', audio], capture_output=True, text=True).stdout)
log = subprocess.run(['ffmpeg', '-i', audio, '-af', f'silencedetect=noise={NOISE_DB}dB:d={MIN_PAUSE}', '-f', 'null', '-'], capture_output=True, text=True).stderr
st = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', log)]; en = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', log)]
P = list(zip(st, en + [dur] * (len(st) - len(en))))
START = P[0][1] if P and P[0][0] < .05 else 0.0
if P and P[0][0] < .05: P = P[1:]
END = P[-1][0] if P and P[-1][1] >= dur - .05 else dur
P = [p for p in P if p[1] < END]
K, J = len(phr), len(P)
rate = (END - START - sum(e - s for s, e in P)) / sum(syl)
strong = [p.endswith(('.', ':', ';', '!', '?', '·')) for p in phr]
def pstart(j): return END if j == J else P[j][0]
def pend(j): return START if j == -1 else P[j][1]
f = {(-1, -1): (0.0, None)}
for k in range(K):
    for j in ([J] if k == K - 1 else range(J)):
        best = (1e18, None)
        for kp in range(max(-1, k - 5), k):
            nsyl = sum(syl[kp + 1:k + 1]); un = sum((3.0 if strong[q] else .25) for q in range(kp + 1, k))
            for (kk, jj), (c, _) in list(f.items()):
                if kk != kp or jj >= j: continue
                a, b = pend(jj), pstart(j); sk = P[jj + 1:j]
                sp = (b - a) - sum(e - s for s, e in sk)
                if sp <= .2: continue
                cost = c + 12 * math.log(sp / (nsyl * rate)) ** 2 + un + sum(max(0, (e - s) - .15) * 25 for s, e in sk)
                if j < J and not strong[k] and (P[j][1] - P[j][0]) > .3: cost += 1.0
                if j < J and strong[k] and (P[j][1] - P[j][0]) < .2: cost += 1.5
                if cost < best[0]: best = (cost, (kp, jj))
        if best[0] < 1e18: f[(k, j)] = best
node, assign = (K - 1, J), {}
while node and node != (-1, -1): assign[node[0]] = node[1]; node = f[node][1]
out, pk, pt = [], -1, START
for k, j in sorted(assign.items()):
    a, b = pt, pstart(j); seg = list(range(pk + 1, k + 1)); ns = sum(syl[q] for q in seg); t = a
    for q in seg:
        d = (b - a) * syl[q] / ns; out.append({'i': q, 'start': round(t, 2), 'end': round(t + d, 2), 'text': phr[q], 'anch': q == k}); t += d
    pk, pt = k, (pend(j) if j < J else END)
json.dump(out, open(os.path.join(ep, 'phrases.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(f'{K} phrases, {J} pauses, {sum(not o["anch"] for o in out)} interpolated, speech rate {rate:.3f}s/syllable')
for o in out: print(f"[{o['i']:2}] {o['start']:7.2f}-{o['end']:7.2f} {'  ' if o['anch'] else '~ '} {o['text'][:90]}")
