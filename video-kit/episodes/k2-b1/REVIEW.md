# k2-b1 — REVIEW (DIRECTOR_MODE loops 3–4)
Built directly on Alex's real ElevenLabs voice (Eleni, 07/10) — no draft round was needed.

## Round 0 — the voice did not say what voice.txt said
- align.py's table showed the title at ~0.10 s/syllable and the first book phrase at ~0.29: impossible for one speaker.
- A local Whisper transcript (faster-whisper `small`, el) showed why: the MP3 was made from the PAGE text, so it reads the
  two headings («Β. Χειραφέτηση και αναμόρφωση (1844-1880)» · «1. Το σύνταγμα του 1844») and two of the book's typos:
  «ψηφοφορίας10» → «…ψηφοφορίας ΔΕΚΑ» and «vέους» → «βέους».
- voice.txt rewritten so its title lines are what was spoken; «ΔΕΚΑ» cut from the audio at 153.30–153.655 s (measured on
  the RMS envelope + spectral centroid; original kept in build/). Whisper then labelled the first syllable after the splice
  «κα» — proven to be the «για» itself by cutting ONE more syllable and watching «για» (not «κα») disappear.
- After the fix every phrase boundary agrees with Whisper within ~0.2 s, and subs.py prints VERBATIM OK.
- ⚠️ «βέους» is left in — it can't be fixed by cutting. Flagged to Alex.

## Round 1 — sheet every 3 s
- S2 «Η ΕΠΑΝΑΣΤΑΣΗ» stayed on screen over «ΕΔΡΑΣΕ ΚΑΤΑΛΥΤΙΚΑ» after the whip → both HUD labels fade on the whip;
  «ΠΟΛΙΤΙΚΑ ΠΡΑΓΜΑΤΑ» moved beside the flask (it sat on the subtitle band).
- S5 the scroll covered the Russian-party man's face → he stands behind the table, the scroll lies on it.
- S14 «ΑΠΟ ΚΟΙΝΟΥ» cut by the zoom → label lowered, zoom ≤ 1.04; the three arms shortened (.62).
- S15 1.6 s of empty sky before the handshake, and «ΚΑΤΟΧΥΡΩΣΗ» cut by a 1.25 zoom → arms rise from the first frame,
  zoom ≤ 1.12, the label lands after the pull-back.
- S16 / S17 / S21 / S33 / S40 black strips or a background seam at the end of a pan → walls widened, palace night spans
  the whole view, `skyW()` = one continuous sky for wide worlds.
- S17 the «ΑΥΘΑΙΡΕΣΙΑ» stamp stayed above the frame → it now lands ON the shield; its label moved beside it.
- S23 the queue emptied (one voter left at 153.5 s) — wrong for UNIVERSAL suffrage → an endless queue: the voter at the
  front votes and someone new joins at the back. «Α)» was printed twice → HUD only.
- S27 1.7 s of empty sky before the buildings → they drop at the shot start and pulse on «Βουλής» / «Γερουσίας».
- S34 «ΜΙΚΡΗ ΗΓΕΤΙΚΗ ΟΜΑΔΑ» sat on the building → the group stands on a taller pedestal, the building beside it.
- S36 the meter + its label sat on the dashed frame → raised inside it.
- check.mjs: «σαφήνεια» and «γεγονός» landed < 0.8 s before their cut → bound to «μεγαλύτερη» and «αποδεικνύεται».
- Targeted stills on every fixed shot: all clean.

## Round 2 — independent reviewer (30 findings, triaged)
Several findings were mid-animation frames (e.g. the S29 ✕ lands ON «δεν υπήρξε»); those were checked with targeted stills and left.
Fixed:
- S2 palace smaller than the crowd → palace ×1.35, crowd smaller and to the sides, every civilian carries a torch.
- S6 «ΥΠΕΡ» stamp sat on the word → moved under the scroll.
- S15 handshake inside the subtitle band → raised 170px with its label.
- S16 neighbouring frames' labels cut at the edge («ΧΙ ΔΟΥΛΕΙΑ») → each label fades before the next frame lands.
- S18 card labels too small to read → cards 236px, labels 36px.
- S21 dark strip at the end of the pan, Otto bigger than the palace → hall and night widened, palace ×1.45, Otto ×.62 in front of it.
- S27 empty sky at the start → buildings drop on the first frame.
- S29 party men too small → ×.62.
- S30 tiny labels, orphan-genitive headline → «ΚΑΝΟΝΙΣΜΟΣ / ΤΗΣ ΒΟΥΛΗΣ» 58px, «ΤΩΝ ΚΟΙΝΟΒΟΥΛΕΥΤΙΚΩΝ ΕΠΙΤΡΟΠΩΝ», committee labels 50px.
- S33 flags in the subtitle band / over the gate → right of the gate, higher.
- S34 crowd crossed the frame edge → packed inside.
- S35 sign truncated → 520px wide, ✕ beside it.
- S36 empty first frame → poster pops on the first frame.
- S39 green arc band at the top, ticks on the sign text, orphan genitive → band removed, ticks above the signs, «Η ΕΛΛΗΝΙΚΗ ΚΟΙΝΩΝΙΑ».
- S40 «ΚΡΑΤΟΣ ΔΙΚΑΙΟΥ» completed only in S41, crowd floating → blocks start at «σταδιακή», roof 1.05 s later; everyone on the ground.
- S42 empty first frame → title lands at the shot start.
- check.mjs OK after the changes; targeted stills on every fixed shot: clean.
