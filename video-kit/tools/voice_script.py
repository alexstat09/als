#!/usr/bin/env python3
"""Book text -> text for the TTS voice (ElevenLabs), so numbers/ordinals are pronounced correctly.
   python3 tools/voice_script.py episodes/<ep>
Reads  <ep>/book.txt   (the chapter text EXACTLY as in the textbook — never "fix" it; the student wants it verbatim)
Writes <ep>/voice.txt  (what the user pastes into ElevenLabs)
       <ep>/replacements.json  [[voice_form, book_form], ...]  used by subs.py to turn subtitles back into book text
Prints a REVIEW list: things a human/Claude must check (gender of numbers, ordinals, abbreviations).
Rules of thumb (Greek):
  * years are read as cardinals:            1915 -> χίλια εννιακόσια δεκαπέντε
  * amounts with dots:                       12.000.000 -> δώδεκα εκατομμύρια
  * percentages:                             50% -> πενήντα τοις εκατό
  * ordinals like Α΄/Β΄ before a noun depend on case/gender (Α΄ Παγκόσμιο -> Πρώτο Παγκόσμιο) -> listed for review
  * numbers before FEMININE nouns need τρεις/τέσσερις/μία/-ες forms (3 φορές -> τρεις φορές) -> listed for review
"""
import re, sys, json, os
ep = sys.argv[1]
book = open(os.path.join(ep, 'book.txt'), encoding='utf-8').read().strip()
U = ['', 'ένα', 'δύο', 'τρία', 'τέσσερα', 'πέντε', 'έξι', 'επτά', 'οκτώ', 'εννέα']
TEEN = ['δέκα', 'έντεκα', 'δώδεκα', 'δεκατρία', 'δεκατέσσερα', 'δεκαπέντε', 'δεκαέξι', 'δεκαεπτά', 'δεκαοκτώ', 'δεκαεννέα']
TENS = ['', '', 'είκοσι', 'τριάντα', 'σαράντα', 'πενήντα', 'εξήντα', 'εβδομήντα', 'ογδόντα', 'ενενήντα']
HUN_N = ['', 'εκατό', 'διακόσια', 'τριακόσια', 'τετρακόσια', 'πεντακόσια', 'εξακόσια', 'επτακόσια', 'οκτακόσια', 'εννιακόσια']
HUN_F = ['', 'εκατό', 'διακόσιες', 'τριακόσιες', 'τετρακόσιες', 'πεντακόσιες', 'εξακόσιες', 'επτακόσιες', 'οκτακόσιες', 'εννιακόσιες']
def below1000(n, fem=False):
    h, r = divmod(n, 100); out = []
    if h: out.append(('εκατόν' if (h == 1 and r) else (HUN_F if fem else HUN_N)[h]))
    if r:
        if r < 10: w = U[r]
        elif r < 20: w = TEEN[r - 10]
        else:
            t, u = divmod(r, 10); w = TENS[t] + ((' ' + U[u]) if u else '')
        if fem:
            w = re.sub(r'\bένα$', 'μία', w); w = re.sub(r'τρία$', 'τρεις', w); w = re.sub(r'τέσσερα$', 'τέσσερις', w)
        out.append(w)
    return ' '.join(out)
def num2words(n, fem=False):
    if n == 0: return 'μηδέν'
    parts = []
    b, n = divmod(n, 10**9); m, n = divmod(n, 10**6); k, n = divmod(n, 1000)
    if b: parts.append('ένα δισεκατομμύριο' if b == 1 else below1000(b) + ' δισεκατομμύρια')
    if m: parts.append('ένα εκατομμύριο' if m == 1 else below1000(m) + ' εκατομμύρια')
    if k: parts.append('χίλια' if k == 1 else below1000(k, fem=True) + ' χιλιάδες')
    if n: parts.append(below1000(n, fem))
    return ' '.join(parts)
review, repl = [], []
FEM_HINT = re.compile(r'^(δραχμ|λίρ|φορ|χιλιάδ|μέρ|ώρ|εβδομάδ|ημέρ|χώρ|πόλ|μονάδ)', re.I)
def conv(m):
    raw = m.group(0); after = book[m.end():m.end() + 20].strip().split(' ')[0] if m.end() < len(book) else ''
    if raw.endswith('%'):
        w = num2words(int(raw[:-1].replace('.', ''))) + ' τοις εκατό'
    else:
        n = int(raw.replace('.', ''))
        fem = bool(FEM_HINT.match(after))
        w = num2words(n, fem=fem)
        if fem or (n % 10 in (1, 3, 4) and n < 1000 and not (1000 <= n <= 2100)): review.append(f'GENDER? "{raw} {after}" -> "{w} {after}"')
    repl.append([w, raw]); return w
voice = re.sub(r'\d{1,3}(?:\.\d{3})+%?|\d+%|\d+', conv, book)
for m in re.finditer(r'\b([Α-Ω])[΄\']\s+(\w+)', book):
    review.append(f'ORDINAL: "{m.group(0)}" — write the spoken form (e.g. Α΄ Παγκόσμιο -> Πρώτο Παγκόσμιο) in voice.txt and add the pair to replacements.json')
for m in re.finditer(r'\b[Α-Ω]{2,}\b', book):
    review.append(f'ABBREVIATION: "{m.group(0)}" — check how the TTS says it (e.g. ΗΠΑ)')
# k2-b1: both of these reached the real voice because ElevenLabs was fed the PAGE, but they must be caught here anyway
for m in re.finditer(r'([Α-Ωα-ωΆ-Ώά-ώϊϋΐΰ]+)(\d{1,2})(?![\d.,])', book):
    review.append(f'FOOTNOTE? "{m.group(0)}" — a footnote number glued to a word is read aloud («ψηφοφορίας10» → «δέκα»): '
                  f'remove "{m.group(2)}" from voice.txt (book.txt and the subtitles keep the book as is)')
for m in re.finditer(r'\S*[Α-Ωα-ωΆ-Ώά-ώ]\S*', book):
    if re.search(r'[A-Za-z]', m.group(0)):
        review.append(f'LATIN LETTER IN A GREEK WORD: "{m.group(0)}" — the book has a typo the voice will read literally '
                      f'(«vέους» → «βέους»): write the Greek letter in voice.txt')
for m in re.finditer(r'\d+ος\b|\d+ης\b|\d+ο\b', voice):
    review.append(f'ORDINAL NUMBER: "{m.group(0)}" — write it out by hand')
open(os.path.join(ep, 'voice.txt'), 'w', encoding='utf-8').write(voice + '\n')
seen = set(); repl = [p for p in sorted(repl, key=lambda p: -len(p[0])) if not (tuple(p) in seen or seen.add(tuple(p)))]
json.dump(repl, open(os.path.join(ep, 'replacements.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('voice.txt + replacements.json written.')
print('\nREVIEW (fix voice.txt by hand, and keep replacements.json in sync):' if review else '\nNothing to review.')
for r in dict.fromkeys(review): print('  -', r)
print('\n⛔ ElevenLabs gets voice.txt — NEVER the text of the page (k2-b1 was voiced from the page: headings, «δέκα», «βέους»).')
print('   When the real voice arrives:  python3 tools/hear.py ' + ep + '   (before aligning to it)')
print('\nTip: add a spoken title line at the top of voice.txt, e.g. "Ενότητα πέντε. <τίτλος>." — and the pair ["Ενότητα πέντε.", "Ενότητα 5"] to replacements.json.')
