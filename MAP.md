# AURORA — where everything lives

The repo is **flat on purpose**. There are no rewrites in `vercel.json`, so a
page's filename *is* its URL: `gym.html` is live at `/gym.html`. Moving a page
into a folder would change its URL and break every link, the service-worker
precache, your bookmarks, and the installed PWAs. So: **live pages stay in the
root, and this file is the index.**

Everything in the root is live. Anything retired is in `archive/`.

---

## The 35 live pages

**Home & shell**
| Page | What it is |
|---|---|
| `index.html` | **The home screen.** Hero, quick row (water · nutrition · sleep), Focus card, Nova noticings, forecasts. |
| `main.html` | The "Mind" hub — reached from the bottom-nav Mind tab. |
| `identity.html` | Identity / who-you're-becoming. |
| `arc.html` | Your Arc — the long-view story of your data. |
| `settings.html` | **Settings.** Owns editing your details; the only route in is the account button in `topbar.js` (initials, top-right). Unreachable otherwise — don't "tidy" that link away. |

**Body & training**
| Page | What it is |
|---|---|
| `gym.html` | Fitness — the big one (164 KB). Workouts, sessions, lifts. |
| `body.html` | Body hub. |
| `weight.html` | Weigh-ins. Trend-first chart (7-day trend is the line, each morning is scatter on it), 3 kg minimum y-span, goal line from `goals_outcomes_v1`. Rebuilt als-v422/423 — see CLAUDE.md §5 before changing the chart. |
| `measure.html` | Body measurements. |
| `pr.html` | PR board. |
| `health.html` | Health. |
| `trends.html` | Trends across metrics. |

**Fuel**
| Page | What it is |
|---|---|
| `nutrition.html` | Nutrition (155 KB). Macros, photo→macros, and **composite meals** — foods logged together share a `grp` and draw as one row that opens (als-v439; see CLAUDE.md constraint 20 before touching an entry's `ts`). |
| `planner.html` | Meal planner. |
| `po-water.html` | Water tracker (the home water chip links here). |
| `caffeine.html` | Caffeine. |
| `supps.html` | Supplement timing. |

**Sleep** — `sleep.html` (sleep & recovery).

**Mind & life** — `ideas.html`, `movies.html`, `improve.html` (**the Library** — four worlds in one
shell: the YouTube queue, saved TikToks, **The Room** and Habits. The Room is the
archive read as a page — every grounded CORE line by shelf, what is due for
recall, and the practice list the DO lines feed. Keys `improve:videos`,
`improve:tiktoks`, `improve:habits`, `improve:profile`, **`improve:actions`**,
appKey `improve`; `improve:paused` is device-local), `scripture.html` (Bible reading tracker: page-based progress across all 66 books, the canon map, S.O.A.P. journal; key `bible:sessions`, appKey `scripture`).

**Money** — `finance.html` (the Money tab), `bills.html`.

**Nova & intelligence**
| Page | What it is |
|---|---|
| `nova-chat.html` | Nova — the conversational coach. |
| `coach.html` | Coach — the *action* view ("what to do"). |
| `insights.html` | Insight Engine — the *evidence* view ("why we think so"). |
| `morning.html` | Morning briefing. |
| `weekly.html` | Weekly review. |

**Running** — `run.html` — Chrissie's running app. Has its own manifest
(`run.webmanifest`, starts at `/run.html`) so it installs as a standalone icon,
**but since als-v326 it is a full citizen of the app**: Chrissie has her own
account, so `topbar.js` now renders the shared top bar on it — and with it the
same Back button every other page has. It keeps its own 5-tab `.rn-tabs` nav,
which is Chrissie's whole navigation, so it is the one page that gets no All
button (als-v438). The page sizes itself to the bar via `--tbh` / `setTbh()`.

**Study** — `latinika.html` (Λατινικά, als-v449), `tonos.html` (Τονισμός,
als-v450), `istoria.html` (Ιστορία, als-v451), `arxaia.html` (Αρχαία,
als-v454, **+ `arxaia-sokratis.html` / `arxaia-platon.html`, als-v497**) and
`ekthesi.html` (Έκθεση, als-v495) are the study pages, and
**`homework.html` (School Studies, als-v483)** is the room above them.

⭐⭐ **`ekthesi.html` closed the last empty 30%.** Έκθεση ties with Αρχαία for
weight and had **zero data** until als-v495 — `homework.html` said so in as many
words (`page:null` → «δεν υπάρχει σελίδα ακόμη»). It owns the synonym/antonym
lexicon: `ekthesi-data.js` (the material, **hand-verified from the photographed
book page, never model-read at runtime**) and `ekthesi-engine.js` (the grader).
Store `ekt:v1` — `els` (**the truth**: one Leitner record per ΣΤΟΙΧΕΙΟ, keys
`cardId:groupId:index` where **groupId is a word, not a number**) + `words` (a
**derived translation** for `ladders.js`, rebuilt on every save, never edited by
hand) + `sessions`.

⛔⛔ **THERE IS NO SCORE, AND THAT IS HIS DECISION** (19/08/26): *«δεν μας
βαθμολογεί· όσα περισσότερα ξέρεις καλύτερο για σένα όταν γράψεις έκθεση — δεν
θέλω να με σκοτώνεις σε βαθμολογίες»*. The teacher gives a word and wants as
many synonyms/antonyms as he can recall. So there is no `PASS`, no percentage,
no `✗`. The unit of progress is **the item**: 89 words you collect, and the only
question is «το έχεις ή όχι ακόμη». The counter only goes up. Anything that
looks like a mark is pressure with nothing behind it.

⭐ **It is the only study page graded on WRITING, not speech,** which is why it
has its own engine instead of `lesson-grade.js`. Recitation pages can forgive
spelling because speech recognition does the typing; here Alex types and the
exam is on paper. Three tiers count — `ok` / `spell` / `form` — plus `cross`
(right word, **wrong column**: it re-asks, charges nothing, and is the most
useful feedback the page can give) and `extra` (outside the book — **never
penalised**).

**Two screens, and that is the whole page.** *Η ΣΕΛΙΔΑ*: the lexicon typeset as
a lexicon — no cards, no chips, no borders — where words you own are bright
ivory and the rest are dim; a fully-owned entry turns its own headword coral,
the only progress indicator inside the page. *Η ΕΞΑΣΚΗΣΗ*: **one item at a
time** — word, column, one line to type. It never re-asks what you own, it
serves one item per word before deepening (breadth first), and the shrinking
cue is always one tap away.

⚠️ **The cue never punishes.** A correct answer given with the cue leaves the
box where it is and books tomorrow — it does not advance and it does **not**
drop. An early build dropped a box for asking for help, which is the surest way
to make him never ask again.

⚠️⚠️ **«το έχω» ≠ «μου ζητείται τώρα».** An owned item that falls due is *both*,
and conflating them meant a review could never be answered — the page replied
«το έχεις ήδη, δώσε άλλο» forever. Invisible until the third night. `live()`
is the distinction; `tests/ekthesi-page.test.js` drives the real page to prove
it.

🔴🔴 **IT IS PHASES 0–4 OF AN 8-PHASE SPEC, AND IT WAS REPORTED AS FINISHED.**
Read **`docs/XREOS_V2_SPEC.md` first** (the current truth — it says what changes
and in what order; ✅ its Φάση 0, ΤΟ ΣΥΜΒΟΛΑΙΟ, shipped als-v471), then
`docs/HOMEWORK_SPEC.md` §15 (phases) and §16 (acceptance) before you touch
it or describe it. ✅ **Φάση 1 (ΤΟ ΞΑΚΡΙΣΜΑ) shipped als-v478**: the page is
**four blocks — ΜΙΑ ΑΠΟΦΑΣΗ · Η ΣΥΛΛΗΨΗ · Η ΜΕΡΑ · ΤΟ ΧΡΕΟΣ** — the dead `est`
placeholders and the «10′/20′/45′/90′» chips are gone, the seven-bar horizon is
one sentence with a **button that actually moves a task** (`hw:v1` only, never a
ladder, never an exam, never into the past), and nothing is drawn twice: one
ranking per paint, the card shows the top item and every list below shows **the
rest**.
✅ **Φάση 2 (ΟΙ ΤΡΕΙΣ ΠΟΡΤΕΣ) shipped als-v479** — one file, three doors:
`homework.html` (full) · **`#capture`** (the field, focused, everything else
folded) · **`#tonight`** (today's lessons, in order, with their real times).
✅ **ΦΑΣΗ 1 ΤΟΥ ΚΕΝΤΡΟΥ shipped als-v482** — a FOURTH door, **`#mathimata`**
(«Τα μαθήματά μου»): the four subjects over the five ladder stores, entered
from a link in the spine. ⚠️ The grouping is **read from `ladders.js`'s own
`subject` field, never re-derived here** — which is why ο τονισμός correctly
sits inside Αρχαία. Additive: the page is still THREE `hw-sec` blocks, the room
is `display:none` outside its hash, and `renderLessons4()` never writes.
✅⭐⭐ **ΟΙ ΕΡΓΑΣΙΕΣ ΓΙΝΟΝΤΑΙ ΟΜΑΔΕΣ — shipped als-v487, 14 Aug 2026.** Το δωμάτιο
`#ergasies` έπαψε να είναι επίπεδη λίστα. ⭐⭐ **ΟΜΑΔΟΠΟΙΕΙ ΑΝΑ ΓΡΑΠΤΟ
(`exam || subject`), ΟΧΙ ΑΝΑ ΚΛΕΙΔΙ — και αυτό ΜΕΤΡΗΘΗΚΕ ΠΡΙΝ ΣΧΕΔΙΑΣΤΕΙ:** από
τις έξι ανοιχτές του εργασίες, **οι ΤΡΕΙΣ κάθονται στο παλιό σκέτο `arxaia`**,
κλειδί που ΔΕΝ υπάρχει στο `SUBJ_ORDER`. Ομαδοποίηση από εκείνη τη λίστα θα τις
**εξαφάνιζε σιωπηλά** και θα άφηνε τρεις άδειες στήλες δίπλα. Είναι ο κανόνας
της als-v485 («αθροίζουμε ανά `exam`, ποτέ ανά κλειδί») εφαρμοσμένος στην ΟΘΟΝΗ.
- ⭐ **Η ΔΙΑΓΝΩΣΗ ΗΤΑΝ Ο ΑΡΙΘΜΟΣ ΤΩΝ ΚΟΥΜΠΙΩΝ, ΟΧΙ ΤΟ ΧΡΩΜΑ:** κάθε γραμμή
  φορούσε ΕΞΙ chips — 36 στόχοι σε μία οθόνη, καμία ιεραρχία. Σε ηρεμία η γραμμή
  δείχνει τώρα **μηδέν κουμπιά**: κύκλος, τίτλος, είδος, ημερομηνία. Οι πράξεις
  έρχονται στο hover, **απόλυτα τοποθετημένες πάνω στην ημερομηνία**, άρα μηδέν
  μετατόπιση διάταξης. ⛔ Στο κινητό ξεδιπλώνονται — μια διαδρομή κρυμμένη πίσω
  από χειρονομία που η συσκευή δεν έχει δεν είναι κομψή, είναι σπασμένη.
- **Ο κύκλος ΑΝΤΙΚΑΘΙΣΤΑ το «Έγινε»** (ίδιο `data-done`, ίδια `toggleDone`) και
  γεμίζει με το χρώμα του μαθήματος. **Τα τελειωμένα φεύγουν σε `<details>`** —
  ως τώρα ήταν ανακατεμένα με τα ανοιχτά· «τι χρωστάω» και «τι έκανα» είναι δύο
  ερωτήσεις. ⭐⭐ Εκεί προσγειώνεται το **DONE ≠ LEARNED**.
- ⚠️⚠️ **ΤΟ ΣΟΒΑΡΟ, ΚΑΙ ΤΟ ΕΙΣΗΓΑΓΑ ΕΓΩ: σταθερή αρχή 26, ξανά.** Ένας γυμνός
  κανόνας `.hw-tacts{opacity:0}` άφηνε τα κουμπιά της **κάρτας ΜΙΑ ΑΠΟΦΑΣΗ**
  (που φοράει την ίδια κλάση χωρίς να είναι `.hw-task`) **μόνιμα αόρατα** — η
  πιο επείγουσα εργασία θα ήταν η μόνη που δεν σβήνεται από πουθενά. **Ο,τι
  κρύβει, κρύβει ΜΕΣΑ στο συστατικό του.**
- ⚠️ **ΤΡΙΑ ΠΟΥ ΒΡΗΚΕ ΤΟ RENDER:** το «Καθάρισε τα τελειωμένα» κρεμόταν ΚΑΤΩ από
  το κλειστό δίπλωμα (κουμπί που δρα σε περιεχόμενο που δεν φαίνεται) · «1
  έγιναν» αντί «1 έγινε» · και μια **τελειωμένη** εργασία τύπωνε «Δευτέρα · η
  επόμενη» — παραγόμενη προθεσμία σε κάτι που έγινε, δηλαδή απάντηση σε ερώτηση
  που δεν έγινε (σταθ. 33).
- ⚠️ **ΚΑΙ ΜΙΑ ΔΙΚΗ ΜΟΥ ΒΕΒΑΙΩΣΗ ΔΕΝ ΔΑΓΚΩΝΕ:** ο φρουρός του διχτυού ήταν
  **regex**, και ένα `if (0)` μπροστά στην κλήση άφηνε το κείμενο στη θέση του
  ενώ ο κώδικας ήταν ΝΕΚΡΟΣ (η παγίδα της als-v484). Έγινε συμπεριφορικός: το
  `l4Groups()` τρέχει σε vm και κάθε μάθημα του `SUBJ_ORDER` πρέπει να βγαίνει
  ΣΤΗΝ ΟΘΟΝΗ. ⭐ Η ομαδοποίηση ζει σε **ένα συνεχόμενο μπλοκ λογικής** με φρουρό
  στο τέλος, ώστε να κόβεται και να δοκιμάζεται με τις ΑΛΗΘΙΝΕΣ του εργασίες.
- **ΜΕΤΡΗΜΕΝΟ:** δωμάτιο @1440 **1.073 → 1.013px** (−6% ΜΕ τρεις κεφαλίδες και
  ένα δίπλωμα παραπάνω) · chips στο DOM **31 → 23** · και **0 ορατά σε ηρεμία**.
  Το όνομα «Οι εργασίες μου» έπαψε να λέγεται δύο φορές (σταθ. της als-v477).
- Δοκιμασμένο ότι δαγκώνει: **6 μεταλλάξεις**, καθαρό 0. Suite 386 → **414**.

✅⭐⭐ **ΟΙ ΚΑΡΤΕΣ ΒΓΗΚΑΝ ΜΠΡΟΣΤΑ — shipped als-v486, 14 Aug 2026.** Τα πέντε
μαθήματα έπαψαν να είναι μια γραμμή κειμένου («Τα μαθήματά μου —») και έγιναν
**η αρχική οθόνη**. Αφορμή: ένα Notion template που του άρεσε — από εκεί
κρατήθηκε **ΜΟΝΟ η πινακίδα** (`.hw-plate`), και απορρίφθηκαν ρητά οι stock
φωτογραφίες (δανεική ταυτότητα, μία με watermark TikTok) και το άδειο
ημερολόγιο. ⭐ **Η ΓΕΩΜΕΤΡΙΑ ΕΙΝΑΙ ΟΙ ΣΥΝΤΕΛΕΣΤΕΣ ΤΟΥ:** τα Αρχαία στέκονται
μαζί κάτω από ΕΝΑ γραπτό (30%), η Έκθεση πιάνει ολόκληρη γραμμή (30%, χωρίς
σελίδα ακόμη), Ιστορία+Λατινικά μοιράζονται τη σειρά (20% το καθένα). Το βάρος
γράφεται **μία φορά ανά `exam`** — δύο κάρτες με «30%» διαβάζονται 60.
- ⛔ **Η ΠΟΡΤΑ `#mathimata` ΠΕΘΑΝΕ ΜΑΖΙ, ΚΑΙ ΕΙΝΑΙ ΤΟ ΝΟΗΜΑ:** το δωμάτιό της
  περιείχε ΑΚΡΙΒΩΣ αυτές τις κάρτες (μετρημένο) — κρατώντας το, ο σύνδεσμος θα
  οδηγούσε σε αντίγραφο της οθόνης που μόλις είδες. Η πλοήγηση: **3 tabs → 2**.
  Ένα παλιό `#mathimata` bookmark δεν σπάει: άγνωστο hash → πλήρης σελίδα.
- **ΜΕΤΡΗΜΕΝΟ, και το κόστος δηλώνεται:** αρχική @1440 **830 → 1.653px**,
  @393 **821 → 1.756px**. Στο κινητό η ΣΥΛΛΗΨΗ μένει ΠΡΩΤΗ, άρα το ύψος
  προστίθεται κάτω από αυτό που χρησιμοποιεί στις 18:00. Πίσω από πόρτα τίποτα
  δεν διέρρευσε: `#capture` 160px · `#tonight` 197 · `#programma` 265 ·
  `#ergasies` 401. Overflow-x: **μηδέν σε 9 σκηνές**.
- ⚠️⚠️ **ΤΟ RENDER ΕΠΙΑΣΕ ΔΥΟ ΑΟΡΑΤΑ ΣΕ 385 ΒΕΒΑΙΩΣΕΙΣ:** (1) η πρόζα
  κεντραριζόταν στα 560 μέσα σε 880, οπότε **δύο αριστερές ακμές** ζιγκ-ζαγκάραν
  σε κάθε εναλλαγή — σωστό markup, σωστό `max-width`, λάθος γεωμετρία. Ο
  κανόνας: **ΜΙΑ αριστερή ακμή**· η στήλη κειμένου ξεκινάει από το ίδιο σημείο
  και απλώς σταματάει νωρίτερα. (2) **Το ίδιο το harness**: σκέτο
  `.hw-wrap{max-width:393px}` αφήνει το viewport στα ~500 και το PNG κόβει τη
  δεξιά στήλη — διαβάζεται σαν overflow ΤΗΣ ΣΕΛΙΔΑΣ ενώ είναι κόψιμο ΤΗΣ
  ΦΩΤΟΓΡΑΦΙΑΣ (σταθ. 30). Πρέπει να καρφωθεί ΚΑΙ το `body`.
- ⭐ **Ο κανόνας των στηλών εφαρμόστηκε ΑΝΑΠΟΔΑ, επίτηδες:** η als-v484 έκλεισε
  το κέντρο στα 560 επειδή είχε ΕΝΑ μπλοκ. Τώρα υπάρχει όγκος, άρα 880 — αλλά
  **η πρόζα και τα πεδία μένουν 560**, γιατί ο κανόνας των 75 χαρακτήρων δεν
  καταργείται επειδή δίπλα του κάθεται πλέγμα.

✅⭐⭐ **ΤΟ ΞΑΚΡΙΣΜΑ shipped als-v484 — Η ΑΡΧΙΚΗ ΟΘΟΝΗ ΕΙΝΑΙ ΤΕΣΣΕΡΑ ΠΡΑΓΜΑΤΑ.**
Alex: *«δεν μ' αρέσει υπερβολικά το οργκανάιζινγκ και το αισθητικ του πέιτζ
μόλις μπαίνω· νιώθω ότι έχει πολλά πράγματα που δεν κάνουν και τίποτα»*. Η
διάγνωση ήταν πιο άσχημη από το παράπονο: **η σελίδα δεν σχεδιάστηκε,
συσσωρεύτηκε** — κάθε φάση πρόσθετε δωμάτιο και ΚΡΑΤΟΥΣΕ ό,τι υπήρχε, ώσπου
οκτώ μπλοκ πάλευαν για την ίδια οθόνη και τρία δεν είχαν ΚΑΝΕΝΑ κουμπί.
Έμειναν: **ΤΟ ΟΝΟΜΑ · Η ΣΥΛΛΗΨΗ · ΜΙΑ ΑΠΟΦΑΣΗ · ΤΡΕΙΣ ΠΟΡΤΕΣ.**
- **Έφυγαν, με τον λόγο τους:** Ο ΧΡΟΝΟΣ (πέντε γραμμές αφαίρεσης = αριθμητική
  πριν την πράξη) · Η ΜΕΡΑ (ζωγράφιζε το πρόγραμμα που ΖΕΙ, και οι εξηγήσεις
  κάτω από κάθε slot ήμουν εγώ που του εξηγούσα τον σχεδιασμό μου) · ΤΙ ΞΕΧΝΑΩ
  (έλεγε ΑΚΡΙΒΩΣ ό,τι το δωμάτιο «Τα μαθήματά μου» — σταθ. 15) · το υποσέλιδο
  (δικαιολογούσε την αρχιτεκτονική του).
- ⛔ **Ο,ΤΙ ΣΒΗΣΤΗΚΕ ΕΙΝΑΙ ΟΘΟΝΗ, ΠΟΤΕ ΑΠΟΘΗΚΗ.** Καμία γραμμή δεδομένων, κανένα
  κλειδί, καμία σκάλα. Το `budget()` **δεν σβήστηκε** — τρέφει ακόμη το «χωράει»
  της κατάταξης· έφυγε μόνο η ζωγραφική του. Το `ladders.js` διαβάζεται σε κάθε
  paint και η μνήμη φαίνεται ΟΛΟΚΛΗΡΗ πίσω από την πόρτα των μαθημάτων.
- ⭐ **ΤΡΙΤΗ ΠΟΡΤΑ «ΑΠΟΨΕ», ΚΑΙ ΕΙΝΑΙ ΑΠΑΙΤΗΣΗ ΤΗΣ ΤΟΜΗΣ, ΟΧΙ ΠΡΟΣΘΗΚΗ.** Η μόνη
  είσοδος στο `#tonight` από τη σελίδα ήταν το «Μόνο αυτό» ΜΕΣΑ στη ΜΕΡΑ (η άλλη
  είναι το push των 21:45, που **δεν έχει χτυπήσει ποτέ**). Κόβοντας τη ΜΕΡΑ
  χωρίς αυτό, το ξαναδιάβασμα ΚΑΙ το «πες μου τα σημερινά» θα γίνονταν απρόσιτα.
  Η πόρτα είναι **μόνιμη** και η υπογραμμή της λέει «δεν ξέρω ακόμη» αντί για
  μηδέν (σταθ. 33) — μια πόρτα που εμφανίζεται μόνο όταν ξέρουμε τα μαθήματα
  είναι πόρτα που δεν μπορείς να ανοίξεις για να μας ΠΕΙΣ τα μαθήματα.
- ⭐ Η ΣΥΣΣΩΡΕΥΣΗ (`hwOver`) μετακόμισε ΜΕΣΑ στο δωμάτιο των εργασιών: μετακινεί
  ΕΡΓΑΣΙΑ, άρα η αιτία και το αποτέλεσμα είναι πλέον στην ίδια οθόνη.
- ⚠️⚠️ **ΤΟ RENDER ΒΡΗΚΕ ΔΕΥΤΕΡΟ ΠΡΑΓΜΑ, ΑΟΡΑΤΟ ΣΕ 366 ΒΕΒΑΙΩΣΕΙΣ: η δεξιά
  στήλη άδειασε.** Οι δύο στήλες (320px + περιεχόμενο) υπήρχαν για να κρατάνε
  τέσσερα μπλοκ· έμεινε ένα, δηλαδή **146px περιεχομένου σε 790px στήλη** στα
  1440. ⭐ **Ο κανόνας που γενικεύεται: μια διάταξη πολλών στηλών είναι απάντηση
  στον ΟΓΚΟ, όχι στο πλάτος της οθόνης — όταν κόβεις περιεχόμενο, ξαναμέτρα τη
  διάταξη που το κρατούσε** (σταθ. 36 από την ανάποδη). Το ΚΕΝΤΡΟ είναι πλέον
  μία κεντραρισμένη στήλη 560px· ⛔ τα ΔΩΜΑΤΙΑ κρατάνε τα δικά τους πλάτη.
- **ΜΕΤΡΗΜΕΝΟ, ΟΧΙ ΙΣΧΥΡΙΣΜΕΝΟ** (ίδιο harness σε `git show HEAD:` και στο νέο):

  | | ΠΡΙΝ als-v483 | ΜΕΤΑ als-v484 |
  |---|---|---|
  | ύψος αρχικής @393 | 2.336px | **756px** (−68%) |
  | ύψος αρχικής @1440 | 1.472px | **770px** |
  | πού ξεκινάει Η ΑΠΟΦΑΣΗ @393 | 863px | **374px** |
  | Η ΜΕΡΑ @393 | 712px (30% του ύψους) | — |
  | ΤΙ ΞΕΧΝΑΩ · Ο ΧΡΟΝΟΣ · υποσέλιδο @393 | 424 · 277 · 97 | — |
  | πόρτες @1440 | 2 × 320px | **3 × 524px**, καμία κοπή |
  | overflow-x | 0 | **0** σε 10 σκηνές |

- ⭐ **9 μεταλλάξεις, καθαρό 0:** δεύτερο `hw-sec` → 6 fail · σβήσιμο `budget()`
  → 2 · η πόρτα «Απόψε» φεύγει → 3 · η πόρτα γράφει «0» → 1 · καρφωμένη τιμή
  μπροστά από τον αναγνώστη → 1 · `renderLessons4` σε σχόλιο → 1 · η συσσώρευση
  δεν ζωγραφίζεται → 1 · βγαίνει έξω από τις εργασίες → 1 · το κέντρο ξαναγίνεται
  φαρδύ → 1 · χάνεται το πλάτος δωματίου → 1 · σειρά έξω από media query → 1.
  ⚠️ **ΤΡΕΙΣ δικές μου βεβαιώσεις ΔΕΝ δάγκωναν με την πρώτη γραφή**, και η
  διόρθωσή τους είναι το χρήσιμο μέρος: (α) έλεγχαν **ΠΑΡΟΥΣΙΑ** (`κάπου μέσα
  στα 300 chars υπάρχει tv.state`) αντί για **ΣΧΗΜΑ**, που περνάει κάθε
  μετάλλαξη που ΠΡΟΣΘΕΤΕΙ μπροστά· (β) το `CODE` σβήνει μόνο σχόλια **μπλοκ**,
  οπότε ένα `// renderLessons4();` άφηνε το κείμενο και ο έλεγχος περνούσε ενώ η
  κλήση ήταν νεκρή — ελέγχεται πλέον το ΣΩΜΑ του `paint()` σε αρχή γραμμής.
  ⚠️ Και **σταθ. 19 για τέταρτη φορά σε αυτό το αρχείο, ΔΥΟ φορές εδώ**: ο
  φρουρός «το Τι ξεχνάω έφυγε» έπιασε το ΣΧΟΛΙΟ που τεκμηριώνει τη διαγραφή, και
  ο φρουρός του harness έπιασε το δικό μου placeholder `__blocked_supabase…`.
- ⚠️ **ΔΗΛΩΜΕΝΟ ΑΝΤΑΛΛΑΓΜΑ:** οι τέσσερις προτάσεις κατάστασης του ημερολογίου
  («δεν έχω το ημερολόγιο» / «δεν το διάβασα ακόμη» / «δεν φόρτωσε το gcal.js»)
  έφυγαν μαζί με το ρολόι. Υπήρχαν επειδή η κορυφή ΔΗΛΩΝΕ αριθμό βγαλμένο από το
  ημερολόγιο· κανένας αριθμός δεν δηλώνεται πια, άρα δεν υπάρχει ισχυρισμός να
  συνοδευτεί. **Το φορτίο επιβιώνει ακέραιο και ελέγχεται:** το «δεν ξέρω» δεν
  γράφεται ΠΟΤΕ σαν «δεν έχεις» (σταθ. 10), στο `#tonight` και στην πόρτα του.
- 🔴 **Αδοκίμαστο στο κινητό του.** 370 βεβαιώσεις, 10 σκηνές ρεντεραρισμένες σε
  αληθινό Chrome (κέντρο + 4 πόρτες × 393/1440) και διαβασμένες ως PNG.
  **Κανένα δάχτυλο.** Θέλει πλήρες reopen του PWA.
- 🔴 **Δικό του:** στο κινητό η σειρά μένει ΣΥΛΛΗΨΗ → όνομα → απόφαση → πόρτες
  (als-v479, δική του εντολή για τις 18:00). Με τέσσερα μόνο πράγματα, το όνομα
  ανάμεσα στη σύλληψη και την απόφαση φαίνεται πιο πολύ από πριν. Ένα `order`.

✅ **ΦΑΣΕΙΣ 2+3 shipped als-v483** — the page is now **three rooms behind one
nav**: ΚΕΝΤΡΟ (default) · **`#ergasies`** (ΟΙ ΕΡΓΑΣΙΕΣ, its own room) ·
**`#mathimata`**. ⭐ `renderTasks` is handed **`null`** — the card and the list
are never on one screen, so nothing is omitted and «all my homework» really is
all of it. The debt block kept only the memory half and is now called
**«Τι ξεχνάω»**. ⛔ `#capture`/`#tonight` are **moments, not rooms**: they hide
the nav and keep their own one-exit bar, so the 18:00 push is untouched.
⚠️ The doors are ONE column — they live in the ~300px spine and two columns
clipped them; the demo's 2-col grid assumed FULL width.
The page is now named **School Studies** in all six human-facing places;
⛔ the filename, `hw:v1` and the appKey are machine-read and stay frozen.
**On the phone capture is now FIRST with no hash**, done with `order` +
`display:contents` so there is still exactly **one markup tree** and the laptop's
sticky spine is untouched. The **18:00 push opens `#capture` directly** — one
entry in the existing reminder cron, a `url` on the payload, and `sw.js` learning
to `navigate` rather than only focus (⛔ no 13th `api/*.js`). And **his words are
now stored verbatim**: stopwords come off only when they are the entire title.
⛔ **Deep links here are DECLARED, not guessed** — the closed `DOORS` table in
the page is what the cron's `url` is asserted against, from both ends.
⛔⛔ **Two live bugs fell out of rendering it**, both invisible to 140 green
assertions: `subjectOfText()` matched **substrings**, and «φροντ**ιστ**ήριο»
contains «ιστ» — so **every lesson in his calendar was labelled Ιστορία** since
als-v470 (σταθερή αρχή 38); and behind `#capture` the one visible block was born
`opacity:0` waiting for an IntersectionObserver, i.e. a **black screen** at the
one moment the feature exists for (σταθερή αρχή 39).
Still live and wrong: **the 14:30 and 21:45 rituals are still empty without
Google Calendar and have no manual path** (φάση 3 — the door says so honestly
rather than pretending). Unbuilt: the third task state (ΣΤΟ ΠΡΟΓΡΑΜΜΑ),
replanning, exams, ΤΟ ΕΔΑΦΟΣ, and measured `est`.
⚠️ On iPhone the capture door **cannot raise the keyboard by itself** — iOS
refuses a programmatic `focus()` without a user gesture, and a push arrival is
not one. The field is first and carries the caret; the keyboard is one tap.
⚠️ **`hw:pics` still shares the `homework` appKey** (σταθερή αρχή 34): photos can
still starve `flushOnUnload`'s 64 KiB keepalive for the tasks.

⭐⭐ **`homework.html` IS THE ONLY SURFACE THAT SEES BOTH DEBTS.** Every night he
closes four subjects' worth of debt: **new work** the φροντιστήριο gave him at
15:15–18:00, and **old work his memory is quietly losing**. Five stores already
compute a `due` and none of them can see the other four. This page can, and that
is the whole feature — true without a single AI call.
- **It owns exactly one key**, `hw:v1` (+ `hw:pics`), appKey `homework`. The five
  study stores are **READ-ONLY** here (σταθερή αρχή 16); anything that has to
  reach another page leaves through a **LINK**. `tests/homework-plan.test.js`
  drives the shipped helpers and asserts nothing else is ever written.
- ⭐⭐ **`ladders.js` is why the page could be built at all.** The five stores have
  **FOUR different shapes** — `lat:v1.cells` is an **ARRAY**, `ton:v1.cells` and
  `arx:v1.cells` are **MAPS** (`arx:v1` was an array until als-v458), `ist:v1`
  and `arx:gn` keep the ladder in `.units` with accuracy in a separate `.els`
  map, and `arx:v1` keeps its ladder in **`.pages`** while its cells are keyed by
  VERB. A naive `store.cells.forEach` returns **silent zero** for at least two.
  `home-live.js` was refactored onto it in the same commit and
  `tests/ladders.test.js` proves the four Home tiles are **byte-identical** to
  `git show HEAD:`.
- ⭐⭐ **ΤΟ ΣΥΜΒΟΛΑΙΟ (als-v471) — `sessions`.** Every study page owes the
  command center a session log **inside its own store** (`ton:v1.sessions`,
  `ist:v1.sessions`, …): `{id, ts, ms, unit, mode, asked, right, pass, fin}`,
  append-only, no `_ts` (records never change, so `mergeArray`'s union by `id`
  is enough). `ladders.js` is the only reader and derives `typical` (median
  minutes per mode, **finished sessions only**, ≥3 samples or `null`), `byHour`
  and `abandoned`. **`tonos.html` is the only writer so far** — the contract is
  proven on one page before it is written into five (`docs/XREOS_V2_SPEC.md`
  §2.3). Full brief in that file; the record shape is repeated in `ladders.js`.
- **The day, not the evening.** The morning block (11:15–15:00) is bigger than
  the evening one, so the unit is Η ΜΕΡΑ with the φροντιστήριο as its spine.
  21:45–22:30 is reserved for **today's three lessons** and never for homework.
- **Ο ΧΡΟΝΟΣ shows the SUBTRACTION**, never asserts a number: horizon − each
  named block − the declared travel constant = what is left. It deliberately does
  **not** use `GCal.day(0).gaps` (its 30-minute floor would stop the lines from
  adding up, and the only thing that makes that number trustworthy is that it can
  be checked by eye). `gcal:*` is **device-local and never synced**, so an
  unauthorised device says so in words and falls back to a labelled blueprint.
- **Capture is a one-line deterministic parser**, never a model — plus
  `add_homework` / `get_homework` inside the existing `api/mcp.js` (zero new
  serverless functions). ⛔ **No photograph is ever read by a machine here.**
- ⚠️ **The parser must not treat `-` as a date separator.** «ασκήσεις 4-7 για
  Τρίτη» read `4-7` as 4 July — an exercise RANGE becoming a deadline, with his
  own words vanishing into it. Greek dates are `20/8` or `20.8`; the dash is his.

⭐⭐ **`arxaia.html` IS TWO WORLDS BEHIND ONE DOOR (als-v460).** His words:
*«βαλε το μεσα στα αρχαια αλλα πριν μπαινω να διαλεγω ειτε αρχαια αγνωστο ειτε
αρχαια γνωστο»*. The page now opens on a **chooser**, never on a world, and the
chooser is shown **every time** — a door that opens itself into yesterday's
world is not a door. Each card carries a status line, and both use the same
colour rule: **accent only when something is due**, faint otherwise.
- **ΑΓΝΩΣΤΟ** = the αρχικοί χρόνοι drill, unchanged. Key `arx:v1`, appKey `arxaia`.
- **ΓΝΩΣΤΟ** = **two kinds of work since als-v497**, not one.
  Key **`arx:gn`**, appKey **`arxaia-gn`**. ⚠️ Its `initCloudSync` writes the key
  **literally**, not through `var KEY` — two worlds in one file means no `var KEY`
  is unambiguous any more, and `smoke-test.sh` resolves that name statically.
- ⭐⭐ **Η ΕΙΣΑΓΩΓΗ LEFT THE RECALL ENGINE (als-v497).** It used to be six units,
  *«Οι φιλοσοφικές ιδέες του Σωκράτη»*, read in four layers and then recalled
  out loud — Ιστορία's shape. His words: *«το γνωστό δεν το μαθαίνουμε απέξω
  αλλά πρέπει απλά να ξέρουμε όλες τις πληροφορίες που δίνει»*. Right engine,
  **wrong material**. The εισαγωγή is now **two standalone study packets**,
  linked from the top of the ΓΝΩΣΤΟ world: **`arxaia-sokratis.html`** (η δίκη
  και ο θάνατος του Σωκράτη) and **`arxaia-platon.html`** (ο βίος του Πλάτωνα).
  - ⛔ **They carry NO progress, NO deadline, NO grade** — that was the entire
    point. `tests/arxaia-gnosto.test.js` §9 forbids `localStorage` inside them.
  - ⛔ **They went in VERBATIM, on explicit instruction** («ακριβώς όπως είναι,
    χωρίς καμία αλλαγή»). Copied with `cp`, never retyped. The **only** edit is
    one `← Αρχαία` line, and §9 strips exactly that line and compares the rest
    against a **pinned sha256**. If you "improve" a sentence in there, the test
    fails — which is the intent.
  - ⛔ **The six units were NOT deleted**: `archive/arxaia-gnosto-eisagogi.js`
    (the corpus, with his margin notes) and
    `archive/arxaia-gnosto-eisagogi.source.txt` (his raw, **uncorrected**
    transcription). §9 proves both are still there. The handout does not exist
    online — if that transcription goes, it is gone.
  - ⚠️ **`verbatim` is retired.** It meant one specific thing (the two
    paragraphs ΓΤΠ demanded word-for-word) and left with them. Texts declare
    `byHeart`. The test forbids the field from coming back.
- ⭐⭐ **THE ΓΝΩΣΤΟ WORLD IS LAPTOP-WIDE NOW (als-v498).** His words: *«ούτε το
  αισθητικό ούτε ότι είναι φτιαγμένο για κινητή χρήση ενώ θα διαβάζω συνήθως
  από το λάπτοπ»*. The diagnosis was **measurable, not taste**: `.ar-wrap` is
  620px, so on his ~2000px laptop the page was a ribbon in a field of black
  and the two packets — now the main thing — read as two empty list rows.
  - **Every rule is locked to `#gnWrap`.** ΑΓΝΩΣΤΟ and the door share the same
    `.ar-*` classes and are untouched. ⛔ Never write a bare `.ar-row` /
    `.ar-wrap` rule in that block. Below 1040px it collapses back to one
    column at 640px — the phone is not sacrificed.
  - ⭐⭐ **THE FONT WAS THE REAL CULPRIT, AND IT IS CHECKABLE.** `aurora.css`
    *names* Instrument Serif in `--au-serif`, but the `@import` lives in
    `aurora-page.css`, which only **ideas · caffeine · main** load. So every
    serif headline on `arxaia.html` had been **Georgia** (the fallback) its
    whole life. The page now links the font directly — *not* `aurora-page.css`,
    which would also repaint the background and the ΑΓΝΩΣΤΟ world.
    ⚠️ CDN failure degrades to Georgia and the page still stands; the
    "never CDN" rule is about **sync deps**, where failure is silent.
  - **The material is not invented here**: the warm sky, the 1px inner top
    highlight and the hairline that lights on hover are `aurora.css`'s own
    `.au-card` signatures — they had simply never reached this page.
  - ⚠️⚠️ **A SILENT REGRESSION THIS CHANGE CAUSED, AND THE GUARD FOR IT.**
    `paintDoorStatus()` counts the packets from the DOM. The plates changed
    class (`.ar-row[href]` → `.gn-pl`), the selector returned **0**, and the
    door line dropped its packet count with **no error**. §8 of the test now
    resolves the selector out of the page and asserts it matches exactly as
    many plates as there are declared packets. Mutation-tested: reverting the
    selector fails the suite.
- ⛔⛔ **NO MICROPHONE IN ΑΡΧΑΙΑ AT ALL (als-v499).** His words: *«δεν θέλω να
  υπάρχει ο μηχανισμός που με ακούει να το λέω σωστά, δεν με νοιάζει, μόνο στην
  ιστορία το θέλω αυτό πουθενά αλλού»*, then *«Α, βγάλε το και από άγνωστο και
  από γνωστό»*. **Speech recognition now lives in `istoria.html` only**, and the
  test guards it from **both** sides — forbidden in `arxaia.html`, required in
  `istoria.html`, so nobody can satisfy the rule by deleting it everywhere.
  - ⚠️ **THE RECALL *WAS* THE MICROPHONE — that is why it left whole.** Grading
    ran only off the transcript, and «το είπα αυτό» *selected* the phrase out of
    his own words («ένα σύστημα που μπορεί να γράψει την απόδειξη μπορεί και να
    την εφεύρει»). With no listener there is no evidence, so anything kept would
    have been a percentage nobody measured.
  - **What replaced it: «Το ξέρω απέξω»** — already built, already honest, always
    labelled ΔΗΛΩΜΕΝΟ. The ladder runs on it. Gone with the recall: «Τα λάθη
    μου», «Τα αδύναμά μου», «Κατευθείαν στην ανάκληση», per-element accuracy.
  - ⭐ On the ΑΓΝΩΣΤΟ side the removal also **fixes something broken**: `el-GR`
    has a *modern* Greek model and replaces an unknown ancient form with a real
    modern word (his words: «δν μπορει να ακουσει αρχαια»). No measurement was
    lost — one that never held was.
  - ⛔ **Stored data untouched.** `arx:gn.els` / `.heard` and `arx:v1.cells` stay;
    nothing writes them any more. His only ΓΝΩΣΤΟ recall was 7 Aug on `gn4`,
    a unit already archived — checked with `get_raw` before cutting.
  - ⚠️⚠️ **A DELETION-BY-REGION TRAP, PAID FOR TWICE.** Cutting `weakest()` also
    swallowed `elCount()` sitting in the same region: the whole ΓΝΩΣΤΟΣ world
    died at load with `elCount is not defined` — a black screen, no visible
    error. **The vm driver caught it, reading did not.** And `s.index()` on a
    comment both worlds share targeted the *wrong* world; only an assertion
    stopped it. Region deletes in this file must be driven afterwards, never
    just re-read.
  - ⚠️ The **lesson and recall views are still 620px** (`.ar-vwrap`). They were
    deliberately left alone — that redesign has not been reviewed. Obvious
    next step, and the `align` layer (ancient ‖ translation) is what gains most.
- **ΤΑ ΚΕΙΜΕΝΑ** = what stayed behind the recall engine, and it belongs there:
  ancient original + official translation, and the translation genuinely is
  said out loud. `gk1` (Αριστοτέλης, *Μετὰ τὰ Φυσικά*) is the first.
  ⚠️ `homework.html` builds its unit index from `ARXGN.UNITS`, so the parser no
  longer resolves `gn1`…`gn6` — checked against his live homework first: **no
  row references them**, so nothing of his degraded.
- ⚠️ **The voice recall WORKS here**, unlike the ΑΓΝΩΣΤΟ side: this material is
  **modern** Greek prose, so `el-GR` transcribes it properly. Hard constraint 28
  killed voice for ancient FORMS only.
- ⭐ **A FOURTH level of truth.** Ιστορία has three (book / my words / out of
  syllabus); this adds **`mine`** — his own handwritten margin notes, in their own
  colour, and `tests/arxaia-gnosto.test.js` forbids them an `anchor` so they can
  never look like text he must recite.
- ⭐ **`verbatim: true`** marks the **two** paragraphs the teacher assigned word
  for word (gn2, gn3 — the two after the Apology excerpt). The badge shows on the
  row, the lesson head and the recall. The test pins that there are exactly two.
- **`lesson-grade.js`** is the shared grader (`matched` / `gradePoint` /
  `gradeUnit` / `bodyOf` / `nextDue`, PASS 0.9, ladder 0/3/10/30/90). ⚠️ It
  requires **only `greek-ear.js`** — constraint 25. `istoria-data.js` still holds
  its own copies on purpose (that page works and is used daily), so the test
  asserts the two implementations are **byte-identical**. If that fails, change
  BOTH or neither.
- **Script order in the head is load-bearing and tested**: `greek-ear.js` →
  `lesson-grade.js` → `arxaia-gnosto-data.js`.
- ⭐⭐ **`study-stamp.js`** (als-v468) is what keeps a repeat recital from being
  undone by the next sync. Every study page whose progress lives in a nested
  **object map** (`ist:v1` units/els · `arx:v1` pages/cells · `arx:gn`
  units/els · `ton:v1` cells) wires it: `reload()` seeds, `save()` stamps. See
  hard constraint 31 — without it `sync.js` resolves each scalar leaf in favour
  of the cloud and every edit after a record's first reverts in ~400ms.
  Λατινικά needs nothing: its cells are an array of `{id, ts}`.
- ⚠️ `home-live.js`'s `arxaia.html` tile reads **both** keys now (constraint 23) —
  it read only `arx:v1`, so a term spent on ΓΝΩΣΤΟ alone would have left Home
  saying «ξεκίνα» for ever. All locals stay `arx*` prefixed (constraint 14).
⭐⭐ **`arxaia.html` WAS REBUILT AGAIN IN ΙΣΤΟΡΙΑ'S SHAPE (als-v458)**, because
Alex reported the drill *"περισσοτερο με μπερδευε"* while Ιστορία *"με βοηθαει
πολυ"*. The diagnosis: **Ιστορία is a LESSON that ends in an exam; Αρχαία was
only an exam** — it opened on «Σήμερα · 12 ερωτήσεις» of four different kinds in
random order, with no teaching first. Now **the unit is a PAGE of the handout**
(one per φροντιστήριο lesson, `added` IS the assignment) and it is read in
layers — `01 ΜΕ ΑΠΛΑ ΛΟΓΙΑ` → `02 Ο ΠΙΝΑΚΑΣ` **re-sorted by family, never
alphabetically** → `03 ΤΙ ΒΓΑΙΝΕΙ ΜΟΝΟ ΤΟΥ` (ΠΡΤ and ΥΠΡ are derived, so 12
cells become 3) → `04 ΟΙ ΑΛΥΣΙΔΕΣ` → **Η ΑΝΑΚΛΗΣΗ, out loud**. Nothing was
dropped: the families became the ORDER, the ΣΤΗΛΗ became the recall, the ΧΑΡΤΗΣ
became «τα λάθη μου» per CELL. Recognition (multiple choice) belongs to the
unbuilt **spelling** pass, which is where it was always right.
⚠️ **The voice checks WHICH form, not how it is spelled** («ἤγγειλα» and
«ήγγηλα» sound identical) and the page says so on screen.
⭐ **`greek-ear.js` is the shared ear** (constraint 15): Greek homophone folding,
number expansion, `bestSentence`, and **stress position** — the last one exists
because `ἀγγέλλω` (ΕΝΣ) and `ἀγγελῶ` (ΜΕΛ) are the same sound, which will recur
on every υγρόληκτο verb. It requires nothing (constraint 25).
⚠️ In Αρχαία the ear needed a NEW limit, not a copied workaround (constraint 24):
forms are whole words that hide inside each other — **«ἄγω» is literally inside
«ἀγορεύω»** — so matching is word-by-word with rejoined split words, never a
substring of the whole blob. Below, the als-v454 build it replaced:

⭐ **`arxaia.html` is LIVE again (als-v454)** and it is a rebuild, not a revert:
the retired page was a 31-day plan bound to July 2026 dates, and **nothing in
the new one is bound to a date at all**, so it cannot go stale the same way.
It drills the **αρχικοί χρόνοι** and nothing else. The ύλη is TRANSCRIBED BY
HAND from photos of his φροντιστήριο handout into `arxaia-data.js` — there is
no OCR and no generation, because a principal part is exactly the thing no rule
can derive. `arxaia-engine.js` never invents a form; it audits the transcription
(ending signature per tense, augment on the historic tenses, a breathing on
every initial vowel, an accent on every word), gates reverse questions on
uniqueness, and builds traps from neighbouring cells of the same verb.
⭐ **Nothing written in the prompt is asked or used as a trap** — the lemma
«αἰδέομαι – αἰδοῦμαι» spells out its own present, so that cell is never a
production question and neither word is ever a wrong option. New key **`arx:v1`**,
appKey `arxaia`; the dead plan's `arxaia:v1` is untouched beside it in the same
row, in `BUNDLES` and in `api/mcp.js`'s `BUNDLE`. **Τονισμός is the same
shape as Λατινικά**: `tonos-engine.js` reads a hand-accented word apart with
Unicode combining marks, derives its syllables, accent position, breathing and
name, and then CHECKS all of it against the three laws — so a wrong quantity
declaration fails the build instead of teaching him a wrong accent. The corpus
declares only what no rule can derive (the quantity of a δίχρονο α/ι/υ). Mastery
is per RULE, not per word. Key `ton:v1`, appKey `tonos`.
**`istoria.html` is back (als-v451)** and it is the opposite kind of page: history
has no rule to derive from, so the guarantee is GROUNDING instead. `istoria-data.js`
holds the corpus; every verbatim paragraph is checked word-for-word against the real
textbook pasted by hand into `tests/istoria-data.test.js`, and **every skeleton point
carries an `anchor` phrase that must exist inside that text**, so a point the book
does not make cannot ship. Three levels of truth stay visibly separate on screen: the
book's words, my plain-Greek vocabulary, and out-of-syllabus context. A unit is read
in seven layers and then RECALLED against a blank screen, **out loud**. The page
listens with the browser's own speech recognition, says nothing while he recites,
and then grades **element by element** (als-v452): each point breaks into the
separate facts inside it, so a point is complete only when every one of them was
said, and the summary shows exactly which were missed. Key `ist:v1`, appKey `istoria` (the retired page's `istoria:v1` is untouched in
the same row). **ΕΝΤΕΚΑ ενότητες, 154 σημεία, 513 στοιχεία (als-v494)** — τελευταία
η `b5` «Η δημιουργία τραπεζικού συστήματος», ολόκληρη η υποενότητα σε 5
παραγράφους (24 σημεία / 77 στοιχεία, η ΜΕΓΑΛΥΤΕΡΗ του corpus)· πριν από αυτήν
η `b4` «Η εκμετάλλευση των ορυχείων».

⭐⭐ **als-v489: ΤΟ `istoria-demo.html` ΕΓΙΝΕ Η `istoria.html`.** Δική του απόφαση
(17/08/26): *«θέλω να παραμείνει μόνο το πλαγιότιτλοι page, και να σβηστεί το
history page· μόλις συμβεί αυτό να ονομαστεί το πλαγιότιτλοι page history και να
μπει μέσα στο School Studies»*. Η παλιά σελίδα σβήστηκε, το αρχείο μετονομάστηκε
στη θέση της, και **το URL δεν άλλαξε** — bookmarks και home-screen shortcut
ζουν. Καθαρίστηκαν στο ίδιο commit: `index.html` (Study 7 → **6** πλακίδια,
2 φαρδιά· μετρημένο σε render 393px: 4 σειρές, κανένα ορφανό) · `launcher.js` ·
`home-motion.js` (οι λέξεις «Πλαγιότιτλοι/Πλαγιότιτλος» δείχνουν εδώ) ·
`als-profile.js` · `home-live.js` (**ένα** case τώρα: `plag` πρώτα, εφεδρεία τα
`units`, ίδια σειρά με το `nowTarget()` της σελίδας) · `sw.js` `CORE` + `CACHE`.
⚠️ **Ο ΠΑΛΙΟΣ ΒΑΘΥΣ ΣΥΝΔΕΣΜΟΣ `#recall:<id>` ΖΕΙ ΑΚΟΜΗ, ΕΠΙΤΗΔΕΣ** — τον στέλνουν
το `istoria-video-demo.html` και το `homework.html`, και χωρίς αυτόν η `fromHash`
έκανε `return` **χωρίς λέξη** (σταθερή αρχή 10). Το `tests/video-timing.test.js`
δείχνει πλέον σε ΕΚΕΙΝΗ τη γραμμή.
⭐ **Και το School Studies βλέπει τους ΠΛΑΓΙΟΤΙΤΛΟΥΣ:** το `ladders.js` απέκτησε
`altLadder: 'plag'` (δεύτερη σκάλα στο ΙΔΙΟ κλειδί· εφεδρεία οι υποενότητες όσο
δεν υπάρχει κανένας), τα items κουβαλάνε `unitKind` + `title`, και το
`deepLink()` γράφει `#recall:p:` ή `#recall:u:`. Οδηγημένο σε αληθινό Chrome:
η κάρτα «Μία απόφαση» γράφει **«Ιστορία · Γιατί δεν μοιράστηκαν οι εθνικές
γαίες»** — τα λόγια του καθηγητή, όχι «b3».

Το ιστορικό, γιατί εξηγεί το σχήμα: **`istoria-demo.html` (als-v473) sat BESIDE it and did not replace it** — his
explicit instruction, and `docs/ISTORIA_SPEC.md`'s Φάση 0.5. The unit of examination
there is the **πλαγιότιτλος του καθηγητή**, not the υποενότητα: he writes the
teacher's own words as a title and PICKS paragraphs, and `I.pointsOf()` resolves them
to points deterministically because every skeleton `anchor` already lives in exactly
one paragraph (154/154 as of als-v494, enforced by `tests/istoria-plag.test.js`). No new syllabus, no
model, no server. **It writes the SAME `ist:v1` / appKey `istoria`** — a new `plag`
map plus a measured `pace` — so nothing changed in `BUNDLES` or `BUNDLE`.
⚠️ That sharing is why `istoria.html`'s `load()` had to stop being an allow-list
(constraint 35): it was silently deleting any field it did not name. The one grader
lives in `lesson-grade.js` **and** its deliberate twin inside `istoria-data.js`;
both gained `gradePoints()` in the same commit, proven identical.
⭐ **als-v474 το έβαλε ΜΕΣΑ στο MÉTRON**: Home tile (w2), `launcher.js`,
search index, `als-profile.js` (⚠️ **ΚΑΙ** `OWNER_ONLY` — «άγνωστη σελίδα =
ορατή» την είχε δώσει στον λογαριασμό της Χριστίνας για μία έκδοση), και ένα
`metric()` case που διαβάζει `ist:v1.plag` **έξω από το `ladders.js`**, επειδή
εκεί το `ist:v1` είναι ήδη πιασμένο και μια δεύτερη εγγραφή θα σκίαζε σιωπηλά
το πλακίδιο «Ιστορία».
Λατινικά is a *drill*, not a notebook: `latin-engine.js` derives
every declension and conjugation from rules, so the page can generate unlimited
exercises AND grade them, and the heatmap shows which cell he actually misses.
A pattern is only drillable once `tests/latin-engine.test.js` holds a
hand-verified paradigm for it. Key `lat:v1`, appKey `latinika`. `study.html`
(«Η Χρονιά») is still a **redirect** to the Notion **«Η ΧΡΟΝΙΑ»** workspace that
replaced it (als-v447); its seven `study:*` keys are untouched in Supabase and in
the Vault.

**Tools** — `import.html` (MyFitnessPal), `import-strong.html` (Strong), `backup.html` (backup & restore).

**The icon** — settled: **Pulse** (one heartbeat in the brand gradient) is the
mark. It lives in `icon.svg` (`puBg` / `puStroke`), rasterised to `icon-192.png`,
`icon-512.png` and `apple-touch-icon.png`. The chooser that picked it,
`icon-lab.html`, is retired to `archive/` — the decision is made and the other
three concepts (Nova Gem, Ribbon, Dawn) are rejected.

**Nova** — settled (2026-07-16): Nova IS the Pulse. Same heartbeat as the app
mark, scaled 512→100 (`M18.8 50 H38.3 …`), with a bright run travelling it and
the node firing at the peak. The old rotated diamond with two dark eyes is gone
from all 11 hosts. Its chooser, `nova-lab.html`, retires to `archive/` like
icon-lab did — the decision is made.

- **Everything that MOVES lives in `aurora.css`, once** (`novaTrace`, `novaNode`,
  `novaRingBeat`, plus `--nova-beat`, which `is-thinking` and `nova-look` retune).
  Never redefine those keyframes in a page.
- **The geometry is inline in each host on purpose** — flat files, no flash, no
  JS dependency. `smoke-test.sh` pins it: it fails if the diamond returns, if a
  page redefines the beat, or if any copy of the path drifts from icon.svg's.
- **Timing is derived, not guessed.** The path is 157.4 units; the peak sits at
  56.7; the comet's centre is at `200p+12`, so it hits the peak at p=22.4% —
  hence the node fires at 22%. The 24/176 dash period (200 > 157.4) keeps
  exactly one beat on the path and leaves a real rest between beats.
- **Small marks** (coach.html's 22–24px orbs) use heavier strokes and are
  static — at that size a 2.6 stroke on a 100-box is sub-pixel and vanishes.
- `nova-gem.js` (three.js) and `nova-life.js` are now **dead** — nothing loads
  them, and neither is precached. The gem was nova-chat's intro hero; it painted
  the old eyes onto a spinning crystal and cost 600KB of CDN three.js.

---

## The scripts

**Shell (on every page)** — `topbar.js` injects the top bar and the **All**
button, runs the login gate, registers the service worker, and lazy-loads the
engines below. `launcher.js` is the **"All" sheet** (als-v437): every page as an
index, one press, from anywhere. It is loaded lazily by `topbar.js` and **owns
no state** — no storage write, no key, no network — so it can be reverted with
nothing to migrate. ⚠️ Adding a new live page means adding it to `GROUPS` there;
`tests/launcher.test.js` fails if a root `.html` page is unreachable from it.

⚠️ **There is no bottom BAR any more (als-v438).** The five tabs (Home · Mind ·
All · Money · Nova) are gone and the single floating `.alx-fab` that `gym.html`
had is now the one control on every page. `topbar.js` styles it, because
`topbar.js` creates it and `launcher.js` arrives on a later fetch. `run.html`
is the only page without it. Home's private `<nav class="nav">` and its
`#bottombar{display:none}` override went at the same time, so Home no longer
draws a second, stale bottom nav of its own.

⚠️⚠️ **`body { animation: _tbIn … }` must never regain a fill mode.** The
keyframes animate `transform`; a filled transform animation keeps a transform
applied and makes `<body>` a containing block, so every `position: fixed` child
was laid out against the ~5,000px body box instead of the viewport. That is why
the old bar sat at the foot of the *document* rather than the screen.
`tests/launcher.test.js` pins it.
`sync.js` is the Supabase layer. `lock.js` is the gate. `als-dialog.js` is the
modal helper (native `<dialog>`).

**Home only** — `home-live.js` (data → the home tiles, incl. the water chip),
`home-motion.js` (entrance choreography).
⭐ **`home-live.js` owns EVERY number on Home.** `index.html` authors none of
them: each tile ships a `—` placeholder that `metric()` + `paintTile()` replace
at runtime. **Never hardcode a value into the home markup** — a fixture there is
indistinguishable from real data when a paint fails, which is exactly how the
whole home screen showed demo numbers for two weeks (als-v433, CLAUDE.md §5).
`tests/home-tiles.test.js` fails the build if an authored `data-to` reappears.

**Engines (lazy-loaded)** — `insights-engine.js` (correlations, t-gated),
`forecast-engine.js` (trend projections), `chapters-engine.js`,
`nova.js` / `nova-life.js` / `nova-coach.js` / `nova-actions.js` / `nova-gem.js`.

**Motion** — `aurora-motion.js`, `page-motion.js`, `aurora-bg.js`.

**Other** — `water.js`, `tdee.js`, `push.js`, `reminders.js`,
`pocoach-sync.js`, `gcal.js`, `error-toast.js`, `insights.js`.
(`xp.js` was deleted in als-v438 with the last of the game layer.)

**Styles** — `aurora.css` (35 pages), `aurora-page.css`, `jarvis.css`.
Home has its own token set inline in `index.html`.

**`api/`** — 12 serverless functions, plus `_`-prefixed helpers that Vercel
neither routes nor counts (`_model`, `_supa`, `_auth`, `_vault`, `_movies`,
`_prices`, `_youtube`, `_tiktok`, `_recap`, `_garmin`, `_core-foods`,
`_food-know`, `_nut-check`, …).
New server logic goes into a helper and is called from an existing function.

The Library's two worlds: `_youtube.js` (playlist mirror, `?ytdistill`,
`?ytorganize`, `?ytrecap`) and `_tiktok.js` (`?tiktok=`, `?ttread`, `?ttrecap`,
and the **nine shelves**, which `_youtube.js` `require`s rather than restating).
**`_recap.js` holds the reading-page contract they SHARE** — the prompt, the
parser, the word count — so a recap cannot mean two things. ⚠️ It requires
nothing on purpose: `_youtube` → `_tiktok` already exists, and a cycle in Node
yields a half-built module instead of an error (hard constraint 25).

Food lookup specifically: `food-search.js` (databases + barcode),
`nutrition-web.js` (classify → retrieve → verify, and the dish-from-ingredients
route), `nutrition-estimate.js` (last-resort estimate + per-piece weights),
`meal-photo.js` (plate photos **and** `mode:'label'`, the label transcriber).
The knowledge and the judgement live in the two helpers: `_food-know.js`
(what kind of food is this, Greek→English, source tiers, portion and category
priors) and `_nut-check.js` (grounding, label arithmetic, priors, consensus).

**`vendor/`** — GSAP, Lenis, Supabase, `html5-qrcode` (self-hosted: a CDN'd
scanner leaves `window.Html5Qrcode` undefined and the Scan tab dies silently).

---

## Folders

- **`archive/`** — retired pages kept for reference: the demos that became the
  current design, the pre-redesign homes (`index-classic.html`), and
  `gym-classic.html` / `body-classic.html`. **Nothing links here.** Not deployed
  (see `.vercelignore`).
- **`docs/`** — setup notes and older write-ups. Not deployed.
- **`tests/`** — 22 suites, run with plain `node`. Three cover her runs end to
  end: `run-inbox` (the drain, and the ack that may never precede a confirmed
  cloud write), `run-identity` (whose app is this — owner window vs her app), and
  `run-courier` (the server's delivery bookkeeping, where her cloud row is the
  proof). Also holds
  `garmin-probe.js`, an interactive **tool** (not a suite) for re-issuing
  Chrissie's Garmin token, and `garmin-probe-out/` — gitignored, because it
  holds a live credential and her raw sleep data.

---

## Rules that will bite you

1. **≤12 entries in `vercel.json` → `functions`. All 12 are used.** Adding a
   13th routed `api/*.js` breaks the deploy. Free LLMs only (Groq / Gemini).
2. **Bump `CACHE` in `sw.js` (line 15) on every deploy.** It's network-first;
   a stale version serves stale files. Never move the number *backwards*.
3. **`sync.js` merges any object child named `logs` with `Math.max`** — a
   counter can't decrease unless the write stamps `_ts`.
4. **Never run a sync script in a render harness.** `home-live.js` and the sync
   layer write to *live* Supabase; a headless render of a page with its scripts
   intact touches real data. Strip every `<script>` first. (This corrupted a
   weigh-in once.) **Then delete the artifact the moment you're done** —
   `_pv-*.html`, `_gympv.html`, `_hpv.html`, `render-*.html`. `.gitignore` stops
   them deploying, but it does not stop them piling up: a 2026-07-16 audit found
   **31** of them in the root — 45% of the .html files — and one still had its
   sync layer wired in. Gitignored is not the same as gone.
5. **Run `./smoke-test.sh` before pushing.** It parses every JS file and inline
   script and checks that every local link resolves.

## Known inconsistency — RESOLVED als-v438

The **Mind tab used to point to two different pages**: the bottom nav in
`topbar.js` sent it to `main.html`, Home's own nav sent it to `identity.html`.
Both navs are gone. The launcher lists Goals (`main.html`) and Identity
(`identity.html`) as the separate pages they are, so there is nothing left to
disagree.
