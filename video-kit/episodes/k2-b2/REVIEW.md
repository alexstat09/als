# k2-b2 — REVIEW (DIRECTOR_MODE loops 3–4)
Built directly on Alex's real ElevenLabs voice (Eleni, 15/10, `08_35_31`, 147.1 s), made from voice.txt — no draft round.

## Round 0 — the voice, before any timing
- `hear.py` on the untouched source: first word «Δύο» (heard «2.», digits filtered → right file). 3 blocks, all Whisper noise
  (merged vowels / same first sound): «καθόλου‿στο» → «καθόλους το», «υποψηφίους‿στις» → «… της» (`--at 104.9` confirms the σ
  is swallowed by the preceding -ους), «το‿ναυτικό» → «τον αυτικό». No headings, footnotes or re-takes → voice.mp3 == source.
- `voice.py use`: 35 phrases (2 title + 33 book), 2 «~» only on tiny phrases («Ο Κωλέττης,», «Μετά το θάνατο του Κωλέττη,»),
  VERBATIM OK (the book's own «νέεςανάγκες» and «κόμματος του» kept in the subtitles).

## Round 1 — check.mjs + per-shot sheets
- New person in the engine: `CH.kolettis` + CAST.md row. ⚠️ His oil portrait has a RED fez — that is Βούλγαρης's signature, so
  he wears the BLACK tall fez of the 1842 Paris photograph; plus big black moustache and a bordeaux fur coat over fustanella.
- check.mjs: 6 late cues (βασιλιά, παρακμής, εκλογές, αυλή, οπαδών, Ελλάδα) → bound to earlier words of the same phrase.
- ⭐ **Tool fix — numbers read as words.** Phrase 6 reads «(1844-1864)» as eight spoken words, so the one syllable ruler of
  `Wt` put «ουσιαστικά» at 26.9 s while the aligner had it at 24.96: the S5/S6 cut landed 2 s late (seen on the sheet as the
  next subtitle under the old picture). `cueTools` now also returns `CK(prefix)` (aligned chunk start) and
  `Wr(i, w, from, to, ta, tb)` (Wt inside one text span). k2-b3/k2-b4 rebuild unchanged. Row added to PIPELINE.md.
- Sheets: S18 an MP sat in Κωλέττης's «empty» seat → that bench has no MP · S8 «ΚΙΝΔΥΝΟΣ» on the church dome → sign moved
  right of the church · S1 subtitle line crossed the flag tops → shorter poles · S21 the portrait cut his head → re-framed ·
  S24 the candidates floated above the podium → they stand on it and hop, an arrow says «ενισχύσει».

## Round 2 — independent reviewer (25 findings on 4 sheets: first frames + end states), triaged
Fixed:
- ⭐ **One design = one person, again:** the μπράβοι of S15 (armatolos: fustanella + fez + big black moustache, fez re-coloured
  dark) read as Κωλέττης clones. Re-coloring the red fez was not enough — the whole silhouette was his. Now plain coat, vraka,
  bare head, goatee. Lesson: when a new named person shares a generic prop's silhouette, the GENERIC changes, not the person.
- S19 «ΑΔΥΝΑΤΟΣ» → «ΑΔΥΝΑΤΟ» (agrees with «τον έλεγχο … αδύνατο»), «ΕΛΕΓΧΟΣ» next to the magnifier.
- Empty openings: S5 scrolls + bar from the cut; S12 Κωλέττης lands at the cut (the subtitle already names him); S20 the
  podium, Κωλέττης and the MPs are there from the start; every `drop()` is now a short fall (`dropQ`, 600 px / 0.26 s).
- S9 the lock now opens + «ΛΥΘΗΚΑΝ» before the cut (cut moved to «πολιτικοί»); S10 «ΟΡΘΟΔΟΞΟ ΔΟΓΜΑ» lands inside its shot.
- S17 all 7 doors framed at the end, no door pop-scaling mid-pan · S14 shovel out of the subtitle band, digger left of the
  building · S22 title off the top edge · S25/S27/S30 framing (palace, flags, ships, chain) · S26 wave above the heads ·
  S34 the snapped flag stays in frame · S35 label fades before the curtain · S2 «ΑΝΑΠΤΥΞΗ;» off the arrow tip · tags appear
  after their owners land (S10, S28) · S8/S7 the duplicate `stroke-dasharray` attribute removed from two `line()` calls.
Left: «νέεςανάγκες» (the BOOK's typo, kept verbatim by Alex's rule) · Hellas laurel (sash + tag suffice) · S1 parliament
(tried; it tangled with the flag poles) · «more background per shot» (general; the level matches k2-b3/b4).
check.mjs OK; targeted stills on every fixed shot: clean. ONE full render.
