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

Θα σου δώσει το `voice.txt` για το ElevenLabs (φωνή Eleni), εσύ του δίνεις το `voice.mp3`, σου δείχνει storyboard,
το φτιάχνει, το ελέγχει και το βάζει στο app.

## Περιεχόμενα
- `engine/` μηχανή (χάρτες, χαρακτήρες, αντικείμενα, κινήσεις, σελίδα)
- `tools/` κείμενο φωνής, συγχρονισμός, υπότιτλοι, έλεγχος (stills), μίξη, rendering σε πολλούς πυρήνες
- `sounds/` εφέ ήχου (Pixabay) — χωρίς μουσική, όπως αποφάσισες
- `docs/` οδηγίες στυλ, κίνησης, σχεδιασμού σκηνών, λάθη προς αποφυγή, catalog.jpg
- `episodes/enotita-04/` η ενότητα 4 πλήρης (παράδειγμα) · `episodes/_template/` αφετηρία για νέες
