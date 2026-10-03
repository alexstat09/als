#!/usr/bin/env python3
"""Subtitles that are VERBATIM book text, timed to the narration.
   python3 tools/subs.py episodes/<ep>
Needs <ep>/phrases.json (align.py), <ep>/book.txt, <ep>/voice.txt.
Book and voice are split into phrases with the same rule (after , . : ;), so they map 1:1 — that's why voice.txt must keep
EXACTLY the same punctuation as book.txt. Extra phrases at the START of voice.txt (spoken title) are mapped through
<ep>/replacements.json (e.g. ["Ενότητα πέντε.", "Ενότητα 5"]) or kept as-is.
Short phrases of one sentence are merged; long ones split into balanced ≤84-char chunks timed by syllables.
Writes <ep>/timing.json  {phrases, chunks}  — phrases keep the VOICE text (for word cues); chunks hold BOOK text.
"""
import json, re, sys, os
ep = sys.argv[1]
ph = json.load(open(os.path.join(ep, 'phrases.json'), encoding='utf-8'))
split = lambda s: [p for p in re.split(r'(?<=[,.:;·!?])\s+', ' '.join(s.split())) if p.strip()]
book = split(open(os.path.join(ep, 'book.txt'), encoding='utf-8').read())
voice = split(open(os.path.join(ep, 'voice.txt'), encoding='utf-8').read())
repl = json.load(open(os.path.join(ep, 'replacements.json'), encoding='utf-8')) if os.path.exists(os.path.join(ep, 'replacements.json')) else []
off = len(voice) - len(book)
if off < 0: sys.exit(f'voice.txt has FEWER phrases ({len(voice)}) than book.txt ({len(book)}): punctuation differs — fix voice.txt.')
assert len(voice) == len(ph), 'phrases.json is stale — re-run align.py'
def title(v):
    for a, b in repl:
        if a in v: v = v.replace(a, b)
    return v
for k in range(len(book)):  # sanity check: same digits-free skeleton length ratio
    v, b = voice[k + off], book[k]
    if v[-1:] != b[-1:]: print(f'WARNING phrase {k}: punctuation differs → "{b[-25:]}" vs "{v[-25:]}"')
book_ph = [title(voice[i]) for i in range(off)] + book
vow = re.compile(r'(αι|ει|οι|υι|ου|αυ|ευ|ηυ|[αεηιουωάέήίόύώϊϋΐΰ])', re.I)
syl = lambda s: max(1, len(vow.findall(s)))
units, cur = [], None
# Title phrases (i < off) never share a chunk with book phrases: makeSubs({skipBefore}) drops title chunks, so a merged
# first book phrase silently lost its subtitle (k2-a1, when the title line had no full stop).
for i, (p, b) in enumerate(zip(ph, book_ph)):
    if cur and cur['title'] == (i < off) and not cur['text'].endswith(('.', ':', ';', '!', '?')) and len(cur['text']) + 1 + len(b) <= 84 and p['start'] - cur['b'] < .6:
        cur['text'] += ' ' + b; cur['b'] = p['end']; cur['vs'] += syl(p['text'])
    else:
        cur = {'a': p['start'], 'b': p['end'], 'text': b, 'vs': syl(p['text']), 'title': i < off}; units.append(cur)
chunks, is_title = [], []
for u in units:
    ws = u['text'].split(' '); n = max(1, -(-len(u['text']) // 84)); target = len(u['text']) / n; groups, g, acc = [], [], 0
    for w in ws:
        if g and acc + len(w) > target * (len(groups) + 1) and len(groups) < n - 1: groups.append(g); g = []
        g.append(w); acc += len(w) + 1
    groups.append(g); tl = sum(len(' '.join(x)) for x in groups); t = u['a']
    for x in groups:
        d = (u['b'] - u['a']) * len(' '.join(x)) / tl; chunks.append({'a': round(t, 2), 'b': round(t + d, 2), 'text': ' '.join(x)}); is_title.append(u['title']); t += d
json.dump({'phrases': ph, 'chunks': chunks}, open(os.path.join(ep, 'timing.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
for c in chunks: print(f"{c['a']:7.2f} {c['b']:7.2f}  {c['text']}")
# Verbatim guard: the non-title chunks, joined, must be EXACTLY book.txt (whitespace-normalised).
body = ' '.join(c['text'] for c, tt in zip(chunks, is_title) if not tt)
want = ' '.join(open(os.path.join(ep, 'book.txt'), encoding='utf-8').read().split())
print('VERBATIM OK' if body == want else f'⛔ SUBTITLES ≠ book.txt — first difference at char {next((k for k in range(min(len(body), len(want))) if body[k] != want[k]), min(len(body), len(want)))}')
