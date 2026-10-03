# k2-a1 — REVIEW (DIRECTOR_MODE loops 3–4)
Rounds 1–3 were built against a DRAFT voice (macOS Melina); every time is a word cue or shot bound, so the real
ElevenLabs voice (Eleni, 156.76 s) re-timed the film. Round 4 below re-ran the review on the real timing.

## Round 1 — sheet every 3 s
- S1 0.5: network lines barely visible at the zoomed-out start → acceptable (they read as the title fills).
- S6 24.5: knocked-down notable lands in the subtitle band → moved to y 860, x 1360.
- S7 30.5: «ΟΘΩΜΑΝΙΚΗ ΔΙΟΙΚΗΣΗ» sat on the turban → raised to y 395, white.
- S8 33.5: tightrope walker cut at the top, «ΑΠΟΥΣΙΑ» on his head → rope lowered to y 480, walker .78.
- S9 36.5: ? marks too small for a 4× close-up → 1.7×.
- S13 66.5: «ΠΕΛΟΠΟΝΝΗΣΟΣ» fell into the subtitle band under the zoom → moved NW into the Ionian.
- S16 84.5: «ΣΤΕΡΕΑ ΕΛΛΑΔΑ» and «ΜΕΓΑΛΟΑΡΜΑΤΟΛΟΙ» overlapped; armatolos too small → Sterea to HUD, armatolos .62.
- S17: shipowner family too small on deck → .55/.5.

## Round 2 — stills at every cue (+0.3–0.5 s): late landings (QA «visible ≥0.8 s»)
- S5 the 3 reason cards landed on «λόγοι», 0.4 s before the cut → keyed to «εξής», staggered 0.3 s.
- S3 the ΚΟΜΜΑΤΑ blocks crumbled 0.15 s before the cut → crash on «κόμματα», shot held +0.5 s.
- S7 bolts on «αυθαιρεσιών», 0.7 s before the cut → cloud on «υπηκόους», bolts on «περιπτώσεις».
- S8 safety net appeared 0.6 s before the cut → net fades in 0.7 s after «απουσία».
- S10 shield → on «στοιχειώδη».
- S14 «ΟΙΚΟΓΕΝΕΙΕΣ ΠΡΟΚΡΙΤΩΝ» 0.57 s → shot held +0.5 s.
- S17 «ΜΕΓΑΛΟΙ ΠΛΟΙΟΚΤΗΤΕΣ» 0.78 s → keyed to «μεγάλων».
- S19 the crimson fill finished AFTER the cut → fill on «οθωμανική», crescent on «κυριαρχία», shot held +0.7 s.
- S21 «ΔΗΜΟΣΙΑ ΕΡΓΑ» sign 0.4 s → drops at the start of «ζητήματα δημοσίων έργων»; moved clear of the villager.
- S23 the strike-through 0.57 s → label on «διαφορετικές», strike on «πολιτικές».

## Loop 4 — motion strips (22.6–24.0, 101.9–103.4)
- S6 the two notables overlapped bodies at the seat → stop 320 px apart, winner hops onto the seat; label moved off his head.
- S19 fill → crescent → label reads in order, frame stays put, villager reacts. OK.

## Checks
- Subtitles == book.txt verbatim (scripted diff: True); book.txt == the 4 paragraphs in istoria-voithima.html (4/4).
- 0 runtime errors over 4 seeks per shot (build/dbg.mjs).
- On-screen numbers: only 1715-1821 and 1821 (both in the text).

## Round 3 — independent reviewer (fresh subagent, 30 findings) → fixed
- ⛔ The first spoken phrase had NO subtitle: subs.py merged it into the title chunk, which makeSubs skips. Fixed by
  keeping the full stops in replacements.json, so the title chunks stay separate.
- Kept on purpose: «σταοποία», «Οιφορείς» are the BOOK's typos (Alex keeps them in subtitles); voice.txt reads them correctly.
- S2 flag moved below the title · commoners lose the post-1829 fez shape · S4 brace now under the sack.
- S7 the Ottoman official HOLDS the holed umbrella, label + arrow, holes clear of ΠΡΟΣΤΑΣΙΑ, bolts fall through the holes.
- S9 face raised out of the subtitle band, ? orbit clear of the eyes, punch-in on «αβεβαιότητας».
- S10 cloud off the title, ✕ on the door · S12 vertical ropes reach heads/platform, labels clear, wider start.
- S13 the two webs GROW during «1715-1821…» and pulse on «δύο» (no more static map) · S14 ΚΟΡΥΦΗ with arrows.
- S15 tower → stone konak with arches, tiled roof; camera beats (no 10 s static) · S18 white arrowhead.
- S19 side labels clear of the frame · S20 bubbles leave as the panels arrive · S21 camera beat, sign off the edge.
- S23 webs build in 0.3 s (no empty frame) · S24 web/building no longer overlap figures, closing push-in.
- Re-checked after the zoom beats: titles of S15/S21 stay inside the frame.

## Round 4 — the real ElevenLabs voice (Eleni)
- align.py default → −32 dB / 0.07 s: at −40 dB her soft breaths merged phrases and shifted every cue.
- Re-bound cues that fell under 0.8 s visible on the new timing (S20 «ΖΗΤΗΜΑΤΑ» scroll pops on «ζητήματα», leaves before «διαφωνίες»).
- Final encode: 1920×1080 · 30 fps · h264/aac 48 kHz · 159.0 s · mean −19.7 dB / peak −3.8 dB (no clipping).
- Contact sheet of the FINAL mp4 every 6 s: every frame has its title/subtitle in frame, nothing in the subtitle band.
