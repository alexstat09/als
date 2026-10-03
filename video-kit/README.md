# video-kit — Ιστορία σε animation (στυλ Historically)

Εργαλεία + οδηγίες για να φτιάχνει το Claude Code βίντεο για κάθε ενότητα Ιστορίας, στο ίδιο επίπεδο με την ενότητα 4.

## Εγκατάσταση στο repo του app (μία φορά)
1. Βάλε τον φάκελο `video-kit/` στη ρίζα του repo.
2. Αντέγραψε το skill στη ρίζα: `video-kit/.claude/skills/historically-video/` → `<repo>/.claude/skills/historically-video/`
   (έτσι το Claude Code το βρίσκει αυτόματα).
3. Πρόσθεσε στο `<repo>/.gitignore`: `video-kit/node_modules/` και `video-kit/episodes/*/build/`.
4. `cd video-kit && npm install && npx playwright install chromium && pip install numpy scipy` (+ ffmpeg).

## Νέα ενότητα — τι λες στο Claude Code
> «Φτιάξε το βίντεο για την ενότητα 5 με το skill historically-video. Το κείμενο: …»

Σου δίνει το `voice.txt` για το ElevenLabs (φωνή Eleni) και **ξεκινάει αμέσως** με προσωρινή φωνή — δεν σε περιμένει.
Όταν κατεβάσεις το mp3 (πέφτει στα Downloads ως `ElevenLabs_…mp3`), πες «έτοιμη η φωνή»· το βρίσκει μόνο του,
ξαναχρονίζει όλο το βίντεο, το ελέγχει, το κάνει render και το βάζει στο app.

Τα εργαλεία που το κάνουν γρήγορο: `tools/voice.py` (προσωρινή/αληθινή φωνή) · `tools/check.mjs` (αυτόματος έλεγχος
σε 20″) · `tools/ship.mjs` (στο app σε μία εντολή). Οδηγίες: `docs/PIPELINE.md`.

## Περιεχόμενα
- `engine/` μηχανή (χάρτες, χαρακτήρες, αντικείμενα, κινήσεις, σελίδα)
- `tools/` κείμενο φωνής, συγχρονισμός, υπότιτλοι, έλεγχος (stills), μίξη, rendering σε πολλούς πυρήνες
- `sounds/` εφέ ήχου (Pixabay) — χωρίς μουσική, όπως αποφάσισες
- `docs/` οδηγίες στυλ, κίνησης, σχεδιασμού σκηνών, λάθη προς αποφυγή, catalog.jpg
- `episodes/enotita-04/` η ενότητα 4 πλήρης (παράδειγμα) · `episodes/k2-a1/` τα Πελατειακά δίκτυα (ο τωρινός τρόπος) ·
  `episodes/_template/` αφετηρία για νέες
