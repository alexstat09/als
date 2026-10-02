# Scene design — turning textbook text into shots (the creative core)

## Goal
Alex watches these when he doesn't feel like reading. He must leave with the **exact textbook wording** anchored to
images. So: one strong, literal, memorable visual per key phrase, landing exactly when the phrase is spoken.

## Step 1 — mark the text
Go through `timing.json → phrases`. For every phrase write down:
- **Key terms** (exam words: names, dates, numbers, technical terms like «αναγκαστικό δάνειο», «χωρίς αντίκρυσμα»).
  These become (a) yellow subtitle highlights (`HL` list) and (b) on-screen labels/cues.
- **Verbs of change** (ενοποιήθηκε, υπονόμευσαν, απέσυραν, κατέρρευσε…) → each needs a visible ACTION.
- **Places** → map or location sign. **People/actors** → characters. **Numbers/dates** → slam or counter.

## Step 2 — group into shots
- One shot per idea, usually 1–2 phrases, **3–10 s** each (ενότητα 4: 28 shots for 215 s ≈ 7.7 s average).
- Cut on phrase boundaries, ~0.1–0.2 s BEFORE the phrase starts (shot.a = S(i) − 0.15).
- If a cue word lands in the last 0.8 s of a shot, extend the shot (QA item).
- Alternate shot TYPES so it never feels like a slideshow: map → character scene → concept (night) → close-up → map…

## Step 3 — find the visual metaphor (literalise the words)
Proven patterns from ενότητα 4 (reuse and extend):
| text | visual |
|---|---|
| δύσκολες και περίπλοκες συνθήκες | a tangled scribble wraps the map, ? marks pop |
| σύγκρουση Χ με Υ | two characters face off, angry expressions, ink "tension sparks" between them |
| ο Διχασμός (named event) | big red rubber STAMP slams over the scene + screen shake + flash |
| άσκοπη … επιστράτευση | soldiers lined up yawning |
| δαπανηρή | money sack leaking coins, red down-arrow |
| διάσπαση σε δυο κράτη | map cracks along the line, one side ink-floods in a new colour |
| αποκλεισμός | warships in a line block the port, supply boat turns back with ✕ |
| μεγάλο κόστος | red meters filling + "ΜΕΓΑΛΟ!" |
| υπονόμευσαν τα κεκτημένα | digger tunnels under building «ΚΕΚΤΗΜΕΝΑ», it cracks and sinks |
| επέμβαση των Συμμάχων … ενοποιήθηκε | flag-sleeved hands push the halves; crack seals; colour floods everything |
| αδύνατο … χωρίς αρωγή | character straining under a giant weight; dashed empty helper outlines with "?" |
| δανεισμός / δάνειο | scroll «ΔΑΝΕΙΟ» handed over by the lenders |
| οδυνηρές συνέπειες στο μέλλον | camera pans right to a storm cloud «ΜΕΛΛΟΝ» |
| ενέκριναν | green stamp «ΕΓΚΡΙΘΗΚΑΝ» |
| amounts (12.000.000 λίρες…) | money bags drop one per amount, number slams below, flag above |
| θεωρητικός | bags fade into dashed "ghosts" |
| δεν δόθηκαν | dashed arrow to Greece + big red ✕ |
| κάλυμμα για έκδοση χαρτονομίσματος | ghost bags float like an umbrella over a printing press printing notes |
| απόθεμα … υπό ξένο έλεγχο | vault with gold & FX; padlock with foreign flags; character reaches and is blocked |
| χρηματοδότησε μέτωπα/εκστρατείες | map tour; a banknote flies along each route; pins drop on each place |
| ισορροπία … δεν άργησαν να φανούν | balance wobbles then tips |
| έχασε τις εκλογές | ballot box; character turns sad; winners drop in |
| επαναφέρουν τον βασιλιά | king drops in with a floating crown |
| σε αντίποινα αποσύρουν την κάλυψη | angry lenders pull the ghost bags up and away; notes fade = «ΧΩΡΙΣ ΑΝΤΙΚΡΥΣΜΑ» |
| ισολογισμός με παθητικό | ledger: green income bars short, red expense bars long, big red "−" |
| πλήρες αδιέξοδο / απρόσμενος τρόπος | character runs into a brick wall «ΑΔΙΕΞΟΔΟ» (stars), then a light bulb |
| διχοτόμηση | scissors cut the banknote, halves split apart |
| 50% κυκλοφορεί / ομολογίες | left half passes between citizens «50%»; right half → state, bond pops out |
| στέφθηκε από επιτυχία | laurel wreath + «ΕΠΙΤΥΧΙΑ»; number counts up |
| επαναλήφθηκε | circular "repeat" arrow + year |
| δεν στάθηκε ικανός να προλάβει την καταστροφή | the "money patch" falls off the map, front retreats, fire/smoke, screen darkens, title slams |
New chapters will have other ideas (laws, reforms, refugees, constitutions, factories, strikes…). Invent visuals with the
same logic: the WORD becomes an OBJECT or ACTION. Ask: "what would a cartoonist draw for this word?"

## Step 4 — write STORYBOARD.md (before coding)
For each shot:
```
S7  30.55–34.62  phrase 9 «είχαν οπωσδήποτε μεγάλο οικονομικό και κοινωνικό κόστος…»
  SEE:   night bg, two meters «ΟΙΚΟΝΟΜΙΚΟ ΚΟΣΤΟΣ», «ΚΟΙΝΩΝΙΚΟ ΚΟΣΤΟΣ»
  MOVE:  meter 1 fades in & fills red at cue oik; meter 2 at cue koin; «ΜΕΓΑΛΟ!» pops at the end of each fill
  CUES:  oik = Wt(9,'οικονομικό'), koin = Wt(9,'κοινωνικό')
  SFX:   none (voice carries it)
  FACTS: —
```
Research FACTS for anything historical (borders, uniforms, flags, which country did what) and note sources.

## Step 5 — composition rules
- One focal point per moment. Labels never overlap characters' faces or each other; subtitles band (y>960) stays clear.
- Characters on a common ground line; facing each other in conflicts; 2–4 characters max per frame.
- Use scale contrast (huge weight vs small character; tiny pins on big map).
- Titles/dates in the top-left HUD slot; scene label centred top (y 130–260).
- Keep the textbook term on screen as a label when it is the exam word (e.g. «ΧΩΡΙΣ ΑΝΤΙΚΡΥΣΜΑ»).
