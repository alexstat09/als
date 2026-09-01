# ΤΟ ΧΡΕΟΣ — `homework.html`

**The MÉTRON study command center. Implementation contract.**

Read `CLAUDE.md` first — all 56 σταθερές αρχές apply. This file does not repeat
them; it says which ones bite here and where.

---

## 0 · ONE SENTENCE

> **Every night I close four subjects' worth of debt — new work the φροντιστήριο
> gave me, and old work my memory is quietly losing. This page is the only place
> that can see both, and it tells me which one to pay first.**

Nothing else on earth can build this page, because nothing else holds his five
ladders, his real timetable and his body's day in one place. That is the whole
competitive claim, and it is true without a single AI call.

---

## 1 · THE INVERSION — read this before designing anything

The obvious build is a homework app that plans his evening. **That is the wrong
product and it will be abandoned in four days**, exactly like `study.html` was.

Three corrections, in order of how much they change the design:

### 1.1 Do not invent a plan. Fill the blueprint he already agreed to.

His day is not "school, then a free evening". It is already programmed, in
Google Calendar, and he accepted it:

| | |
|---|---|
| 10:00 | wake (locked — sleep protocol) |
| **11:15 – 15:00** | **ΤΟ ΜΕΓΑΛΟ ΠΑΡΑΘΥΡΟ** — the biggest study capacity of his day |
| 14:30 – 15:00 | ⭐ recap the subject of TODAY'S 15:15 lesson (established rule) |
| 15:15 – 18:00 | ΦΡΟΝΤΙΣΤΗΡΙΟ — three 45′ periods. **New homework is born here.** |
| 18:45 – 20:30 | gym · 21:00 dinner |
| **21:45 – 22:30** | **ΞΑΝΑΔΙΑΒΑΣΜΑ** — re-read tonight's three lessons, SAME NIGHT |
| 00:00 | wind-down · 00:15 lights out |

Two consequences the original brief missed completely:

- **The morning block is bigger than the evening block.** A page whose hero is
  "tonight" is planning the smaller half of his day. The unit is **Η ΜΕΡΑ**, with
  the φροντιστήριο as its spine — not "tonight".
- **21:45 is already spoken for.** Same-day review is worth ~3× the same effort a
  week later, and the block's job is fixed: today's three lessons. The page must
  **fill it with exactly those three subjects**, never with homework that happens
  to be due. Homework and ladder debt go in the morning window.

⛔ Do not build a generic "evening timeline". Build **the day he actually lives**,
with the two windows named, and put the right kind of work in each.

### 1.2 The recall ladder is the hero data, not the homework list.

He already knows he has homework — someone told him three hours ago. **What he
cannot see is what he is forgetting.** Five stores already compute a `due`:

| store | page | what decays |
|---|---|---|
| `ist:v1` | `istoria.html` | 6 ενότητες, per-ELEMENT |
| `arx:gn` | `arxaia.html` ΓΝΩΣΤΟ | Σωκράτης + ΤΑ ΚΕΙΜΕΝΑ |
| `arx:v1` | `arxaia.html` ΑΓΝΩΣΤΟ | αρχικοί χρόνοι, per-CELL |
| `lat:v1` | `latinika.html` | per-PATTERN mastery |
| `ton:v1` | `tonos.html` | 9 rules |

All five run the same ladder — **0 / +3 / +10 / +30 / +90** — and none of them can
see the other four. **This page is the first surface in the app that can.** That is
the feature. Ship it first, before capture, before AI, before anything.

### 1.3 Two surfaces, one store. The phone captures; the laptop decides.

Capture happens at **18:00 at the φροντιστήριο with a phone in his hand.** Deciding
happens at a laptop. The original brief's "desktop-first, mobile must still work"
has this backwards and it is the exact sentence that killed `study.html`
(*"i will be seeing it ONLY from the laptop"* → three rejected aesthetics → *"i
never touched those two"*).

- **Phone view is not a squeezed desktop.** It is a different, smaller page with
  ONE job at the top: **capture in three taps**, then START HERE, then today.
  Everything else collapses.
- **Desktop is where the week, the ledger and the horizon live.** Three panes,
  real density, no wasted margin.

---

## 2 · NON-NEGOTIABLE STACK FACTS

The original brief asked about "the framework", "routes", "state management",
"migrations" and "the database abstraction". **None of those exist.** Here is the
real machine, so no discovery time is wasted:

- **One self-contained `.html` file.** Inline `<style>` + inline `<script>`. No
  build step, no framework, no bundler, no TypeScript, no package. Shared logic
  goes in a plain root-level `.js` loaded with `<script src>` (no modules).
- **Flat layout on purpose: filename == URL.** `homework.html` is
  `/homework.html`. Never move a live page into a folder.
- **≤12 routed `api/*.js` and all 12 are full.** ⛔ **The PAGE adds no server code
  at all** — everything it renders is computable on the device. The only server
  change in this whole project is **one new tool inside the existing
  `api/mcp.js`** (§5.4), which is free. If anything else ever seems to need a
  backend, fold it into `api/run-reminders.js`; **never create a 13th file.**
- **Service worker is network-first**, versioned `als-vNNN`. Bump `sw.js:15` and
  add the page + any new `.js` to `CORE`.
- **A synced key lives in THREE places** or it silently becomes unrestorable /
  unreadable: the page's `initCloudSync`, `backup.html` `BUNDLES`, and
  `api/mcp.js` `BUNDLE`. `smoke-test.sh` enforces the second; **nothing enforces
  the third** — do it by hand.
- **Design system is `aurora.css`.** Reuse it. Do not create a second one.
- **Modals are native `<dialog>` + `showModal()`**, or the `als-dialog.js` helpers.
  Scope `display` to `[open]` or the modal is permanently on screen.
- **This page is `OWNER_ONLY`.** Chrissie must never see it. Register in
  `als-profile.js` `ALL_PAGES` **and** `OWNER_ONLY`.

---

## 3 · WHAT ALREADY EXISTS — reuse, never rebuild

| Need | Already built | How to use it |
|---|---|---|
| The timetable & fixed commitments | **`gcal.js`** — `GCal.day(0..6)` returns `{events, routines, sleep, bedtime, anchor, **gaps**}`, `GCal.week()`, `GCal.nextExam()`, `GCal.classify()` | Read it. ⚠️ Read-only and **device-local** (`gcal:*` never syncs) — see §6.3 |
| Recall / grading | `lesson-grade.js` + `greek-ear.js` | ⛔ Never re-implement. This page **links**, it does not grade |
| Ladder state | the five keys in §1.2 | **READ ONLY** — see §4 |
| Ύλη, εργασίες, διαγωνίσματα (the plan) | **Notion «Η Χρονιά»** | Stays alive. This page does **not** read or write it (Notion MCP is not reachable from a browser). They coexist; he compares them himself |
| Navigation / search | `launcher.js` (the ALL pill), `home-motion.js` search index | ⛔ Do **not** build a rival ⌘K. If a palette is wanted, it EXTENDS the launcher |
| Nested-map cloud persistence | `study-stamp.js` | Mandatory — see §4.3 |
| Confirm / alert / prompt | `als-dialog.js` | Reuse |
| Motion | `page-motion.js` conventions | ⚠️ `PageMotion.countUp` is an **entrance** animation — never call it on an update |

---

## 4 · THE DATA CONTRACT — the part that most easily loses data

### 4.1 This page owns exactly ONE key

**`hw:v1`**, appKey **`homework`**. Nothing else. Registered in all three places
(§2). Everything about the five study stores is **read-only**.

### 4.2 σταθερή αρχή 16 — a store is written by the page that OWNS it

Writing `ist:v1` from here is a **silent no-op with a delayed loss**: this page's
sync engine does not declare that key, so the write never pushes and leaves no
tombstone, and `istoria.html` later pushes its own copy straight over it.

- **Reading** the five ladders: allowed, encouraged, the entire point.
- **Writing** any of them: ⛔ forbidden, no exceptions.
- Anything that has to reach another page leaves through a **LINK**
  (`istoria.html#u=b2`), and that page creates the state through its own save path.
- A test must assert `hw:v1` is the only key this page writes.

### 4.3 σταθερή αρχή 31 — every task record carries `_ts`

The task store is a nested object map (`{tasks: {id: {…scalars}}}`). `sync.js`
resolves a **scalar** conflict by keeping the REMOTE value, so **no local edit
survives** unless the record carries `_ts`: the page writes, the pull merges the
old cloud copy back, `applyLocal` writes the reverted value down, and the same
cycle pushes the revert up. Deterministic, not a race — and it **hides**, because
the FIRST write of any record works.

Use **`study-stamp.js`**. Do not sprinkle `_ts = Date.now()` at the twelve places
that write; stamp inside `save()`. Its three defences are load-bearing: an
all-falsy record never gets stamped · seeding is not stamping · legacy records
adopt their real time, never `now`.

### 4.4 σταθερή αρχή 32 — the page paints an interactive list before sync exists

He will dismiss a task within a second of the page opening. `sync.js`'s `setItem`
interception **does not exist until `initCloudSync` has run** (0.5–3s cold, up to
12s), so that delete leaves no tombstone, the first pull unions it back by id, and
the push makes the resurrection the cloud's truth. This is als-v469 verbatim.

**Stamp the tombstone yourself**, into `'__synctomb__' + appKey`, mirroring the
rule **verbatim, never improved**: `T = max(now, ts + 1)`, arrays keyed `id:<id>`.
Stamp only after a confirmed write. **Grep for the bulk deletes too** — "clear
completed", "dismiss all", any re-import.

### 4.5 ⭐⭐ READING THE FIVE LADDERS — they are FOUR DIFFERENT SHAPES

**The single most likely way to ship this page silently broken.** §1.2 makes the
ladder the hero, and a naive `store.cells.forEach(...)` returns **zero** for at
least two of the five — no error, no empty state, just a page confidently
reporting that he owes nothing. Measured in the live files:

| store | container | shape |
|---|---|---|
| `lat:v1` | `.cells` | **ARRAY** of `{r, w}` (`home-live.js:176`) |
| `ton:v1` | `.cells` | **OBJECT** map of `{r, w}` (`:200`) |
| `arx:v1` | `.cells` | **OBJECT** map — **was an ARRAY** until als-v458, and `home-live.js:211` carries an explicit comment that both must keep working |
| `ist:v1` | `.units` | **OBJECT** map of `{learnedAt, due, …}` |
| `arx:gn` | `.units` | same family as `ist:v1` — **verify before writing the reader** |

And they do not even answer the same question: four expose *accuracy*, only
`ist:v1` exposes a real `due`.

⭐ **The fix is `ladders.js` — one DOM-free shared reader.** `home-live.js`
already contains four bespoke readers of these exact stores. A fifth copy here is
σταθερή αρχή 15 (a rule enforced on one path and not its twin is not a rule, it is
a coincidence with a good reputation) and it *will* drift the first time a store
changes shape again — which has already happened once.

```js
// ladders.js — reads all five, returns ONE shape.
// ⛔ requires NOTHING (σταθερή αρχή 25: a module two siblings share must
//    depend on neither, or Node hands out a half-built module object).
[{ store, page, unitId, label, due, accuracy, learned, samples }]
```

- `home-live.js` is refactored onto it in the same commit, and a test asserts the
  four Home tiles produce **byte-identical** output to `git show HEAD:` before and
  after. **A refactor that quietly changes a shipped value is a regression wearing
  a cleanup's clothes.**
- `tests/ladders.test.js` holds a **hand-written fixture per shape**, including the
  legacy `arx:v1` array. ⛔ Never generate those fixtures from the reader — they
  would agree with every bug perfectly (the `-erint`/`-erunt` lesson).
- **An unreadable store is `null`, never `0`.** «δεν μπόρεσα να διαβάσω τα
  Λατινικά» and «δεν χρωστάς Λατινικά» are different sentences (σταθερή αρχή 10).

### 4.6 The task shape — deliberately small

The original brief listed 18 fields and 7 states. He has ~4 tasks a night. Seven
states is seven ways to hold a stale row.

```js
{ id, ts, _ts,
  subject,      // 'istoria' | 'arxaia' | 'latinika' | 'ekthesi'   (frozen ids)
  title,        // his own words, verbatim, never rewritten
  due,          // 'YYYY-MM-DD' | null   — null is legal and must render honestly
  kind,         // 'apexo' | 'askisi' | 'grapto' | 'diagonisma'
  link,         // { page:'istoria.html', unit:'b2' } | null
  est,          // minutes | null  ⚠️ null unless MEASURED — see §7.3
  done,         // 0 | timestamp
  src,          // { type:'photo'|'text', id } | null
  note }        // optional
```

Three states only: **ΝΕΟ → ΣΤΟ ΠΡΟΓΡΑΜΜΑ → ΕΓΙΝΕ.** Anything else is bookkeeping
he will not maintain.

⚠️ `subject` ids are **machine values and frozen**. Human-facing labels are Greek
and live in one map.

### 4.7 ⭐⭐ ΤΟ ΣΥΜΒΟΛΑΙΟ — `sessions` (added als-v471, superseded brief in `XREOS_V2_SPEC.md` §2)

§4.5 above reads **five `due` timestamps**. That is enough to sort and never enough
to understand: it cannot know that the recall took 18 minutes, that it was
abandoned halfway, or that Λατινικά go well in the morning and badly at 23:00.

So every study page owes this page a session log, written **inside its own store**
(σταθερή αρχή 16 — no new key, no new appKey, nothing added to `BUNDLES`/`BUNDLE`,
no migration):

```js
// ist:v1.sessions · arx:gn.sessions · arx:v1.sessions · lat:v1.sessions · ton:v1.sessions
{ id, ts, ms, unit, mode, asked, right, pass, fin }
```

- **`ms` is the point.** It is the one number nothing else in the app can compute.
- **`fin: 0` is the most valuable field and the one nobody records.** An
  abandonment is signal, not noise.
- **No `_ts`, and that is safe by construction.** σταθερή αρχή 31 is about records
  that get REWRITTEN; a session never changes after it is written, so `mergeArray`
  only ever unions by `id`. The `id` carries randomness so two devices in the same
  millisecond cannot collapse into one.
- **No pruning**, deliberately, unlike `days` (90). ~300 sessions × ~120 bytes =
  36 KB/year, comfortably under the 64 KiB that kills `flushOnUnload` (σταθερή
  αρχή 34). Revisit **with a measurement** if it ever matters.
- `ladders.js` is the **only** reader. It derives `typical` (median minutes per
  mode, **finished sessions only** — an abandonment at 40s is a true signal about
  WHETHER and a lie about HOW LONG), `byHour` (local hours) and `abandoned`.
- ⛔ **No page is unlocked before its own `sessions` is written** — the contract is
  proven on ONE page (`tonos.html`) before it is written into five.
- ⛔ Until a store reports, `est` and the `10′/20′/45′/90′` chips **stay off that
  row**. §7.3 stands: `null` until measured, never a guess.

---

## 5 · CAPTURE — his decision, and it overrides the original brief

> *"i want to send u photos and all that here not there"*

**⛔ THERE IS NO PHOTO-TO-HOMEWORK AI IN THIS PAGE.** No vision call, no confidence
badge, no extracted deadline. This is the same decision already locked for Αρχαία
(*«κανε το απλα να στο στελνω εγω εδω και να μπαινει εκει»*) and it is correct
technically as well: the `vision` role is one **preview** model with **no
fallback**, Greek handwriting is exactly what it fails at most confidently, and
**a wrong deadline is worse than no deadline** — a plausible fiction rendering as
truth is this project's most expensive failure (als-v433).

### 5.1 The ύλη road — through the chat, not the page

Φυλλάδια, ενότητες, κείμενα, αρχικοί χρόνοι: he photographs them into the chat,
they are transcribed **by hand** into `istoria-data.js` / `arxaia-data.js` /
`arxaia-gnosto-data.js`, the second-transcription test must agree, then push.
That loop already works and is not this page's business.

### 5.2 The homework road — ONE LINE, parsed deterministically

Ephemeral work ("ασκήσεις 4-7 για Τρίτη") must not need a chat round-trip. So:
**one text field, one line, three taps.**

```
Ιστορία b2 απέξω Τρίτη
```

The parser is **deterministic and closed**, not a model:

- **Subject**: matched against the four known subjects + their real abbreviations
  and misspellings (`ιστ`, `ιστορια`, `αρχ γν`, `αγνωστο`, `λατ`, `εκθ`).
- **Unit**: matched against the **actual unit ids already in the corpora**
  (`a1a a1b a2 b1 b1b b2 gn1…gn6 gk1`) and their titles. An unrecognised token is
  left in `title`, never guessed.
- **Date**: Greek weekday names, `αύριο`, `μεθαύριο`, `dd/mm`. **A weekday resolves
  to the NEXT occurrence.** Nothing found → `due: null`, and the card says
  «χωρίς ημερομηνία» rather than inventing one.
- **Kind**: `απέξω` / `ασκήσ` / `γράψ` / `διαγώνισμα` keywords, else `askisi`.

⭐ **The parse is shown before it is saved, as an editable line of chips**, and
every chip that was *not* matched is visibly grey. He fixes it with a tap. **The
page never claims to have understood something it guessed.**

### 5.3 The photograph is SOURCE, never input

He can attach the whiteboard photo to a task. It is stored, shown, and never read
by anything. Clicking SOURCE shows the original — this makes the record auditable
and it was the best idea in the original brief (§17).

⚠️ **Quota discipline is mandatory (σταθερή αρχή 17).** `localStorage` throws
`QuotaExceededError` on a full device and swallowing it makes a failed save look
identical to a successful one. Precedent: `run:shoePics` caps at **26 KB**.

- Downscale to ≤1200px, JPEG q0.72, **hard cap 40 KB per photo**.
- Keep at most **12** photos; the oldest un-attached one is dropped, with a
  sentence on screen saying so.
- Wrap every write in a real `catch` that **reports in words and keeps saying so**.
- Photos live in their own key `hw:pics` — declared in all three places, and
  deliberately **excluded from the ladder read path** so a full photo store can
  never break the recommendation.

### 5.4 ⭐⭐ THE CHAT ROAD — `add_homework`, tool #45 in `api/mcp.js`

His question, verbatim: *"will i send the pic of my homework that i have to you and
it will organize it perfectly inside there?"* **Yes, and this is the mechanism.**

`api/mcp.js` is ONE of the twelve routed functions and already holds **44 tools**, a
tombstone-aware `mutateBundle`, and precedent for `_ts`-stamped MCP writes
(`api/mcp.js:330`, `:496`). **Tool #45 costs zero new functions.**

```
photo → chat → Claude reads it → shows the parse → he confirms
      → add_homework writes hw:v1 in his Supabase row → the page pulls it
```

**Why this is correct and not a workaround.** The transcription happens **in front
of him**, in chat, where a misread is one message from being fixed — instead of by
a **preview** vision model with **no fallback**, silently, on a server, inventing a
deadline. It is σταθερή αρχή 28's lesson applied before the fact: get the reading
from something that actually reads, and let a human confirm it. It extends the
locked Αρχαία decision from ύλη to homework rather than contradicting it.

**Rules for the tool — all four are load-bearing:**

1. ⛔ **It never writes without a confirmed parse in the conversation.** One task
   per call, echoed back. A batch is N calls, each visible.
2. ⭐ **It stamps `_ts` (σταθερή αρχή 31).** A record written by MCP into a nested
   map with no `_ts` **loses to whatever is on his phone** on the next merge, and
   the loss is invisible: correct chat, correct row, gone in 400ms.
3. ⭐ **It mirrors `sync.js`'s conventions verbatim, never improves them**
   (σταθερή αρχή 23): tasks are `{id, ts}`-shaped so `mergeArray` handles them, and
   the read side must pass through `liveOnly()` or it will resurrect tasks he has
   already ticked off — the exact bug that made the MCP report **4,671 kcal**
   against the app's 1,461.
4. **`hw:v1` and `hw:pics` go in `BUNDLE`.** Nothing enforces that map; a key
   missing from it answers `Unknown key`, which reads exactly like "there is no
   homework".

⚠️ **The friction is real and must be designed around.** At 18:00, bag on shoulder,
opening a chat is more expensive than typing a line. **The typed one-liner of §5.2
is the primary road; the chat road is for the days he photographs anyway.** The page
must not be able to tell which road a task arrived by — one store, one shape.

### 5.5 BRAIN DUMP — keep it, and keep it dumb

A free-text box that splits on newlines and commas into candidate lines, each run
through the same parser, each shown for confirmation. **No model.** An unparseable
line becomes a plain note with `due: null` — which is fine, because a captured
thought beats an organised one that was never captured.

---

## 6 · START HERE — the recommendation

The hero. One card, one answer, and it must be **explainable in his own language**.

### 6.1 The candidates, in one pool

1. **Ladder debt** — any of the five stores with `due <= today`. This is the pool
   nothing else can see.
2. **Homework** from `hw:v1` with `done == 0`.
3. **Tomorrow's φροντιστήριο lessons** (from `GCal`) that have unrecalled material.
4. **Nothing** — a legitimate, first-class answer. See §6.5.

### 6.2 Scoring — deterministic, explainable, no opaque number

⛔ Never render a score. ⭐ Always render the REASON, in Greek, as the same
sentence that produced the score:

> **Ιστορία · b2**
> Ανάκληση · 18′
> **αδύνατο + έληξε + Ιστορία αύριο**

Factors, each contributing a named clause: `έληξε` (overdue on the ladder) ·
`αύριο` (due date) · `αδύνατο` (accuracy below its own page's PASS) · `αύριο έχεις`
(that subject is in tomorrow's timetable) · `διαγώνισμα` (an exam in `GCal` within
7 days) · `χωράει` (fits the remaining window).

Ties break toward the subject with the **highest συντελεστής**: Έκθεση 30% ·
Αρχαία 30% · Ιστορία 20% · Λατινικά 20%. This is the one place a weighting is
justified, and it is his, not invented.

### 6.3 Ο ΧΡΟΝΟΣ — the number most likely to be wrong, so SHOW THE SUBTRACTION

A confident wrong "2h 18m" at the top destroys trust in everything under it. So the
page **never asserts** the number; it **builds it in front of him**:

```
ΩΣ ΤΟ ΞΑΝΑΔΙΑΒΑΣΜΑ          3h 45m
− φροντιστήριο 15:15-18:00  −2h 45m
− δρόμος ×2                 −  30m
= ΜΕΝΟΥΝ                       30m
```

- Source of truth: `GCal.day(0).gaps` when the calendar is authorised **on this
  device**.
- ⚠️ `gcal:*` is **device-local and never synced**. On a device where he has not
  authorised it, the calendar is not "empty" — it is **unknown**. Say so in words
  and fall back to the blueprint shape (§1.1) as a declared constant, labelled on
  screen as «κατά το πρόγραμμα, όχι από το ημερολόγιο». **σταθερή αρχή 10: "no
  data" and "we could not read it" must never render the same way.**
- The blueprint constant is one object with a comment saying it changes when
  **school starts mid-September 2026**.

### 6.4 «ΕΧΩ 20 ΛΕΠΤΑ» — keep it, it is the best secondary feature

Chips: `10′ · 20′ · 45′ · 90′`. Re-runs §6.2 with a hard `fits` filter. Zero
planning. This is what turns a bus ride into a recall.

### 6.5 «ΤΕΛΕΙΩΣΕΣ» is a real answer

If nothing is due and nothing decayed, the page says so and **stops**. It does not
manufacture work. §24 of the original brief is right and is a genuine
differentiator: the objective is not maximum study time.

---

## 7 · THE DAY — the ledger, not a calendar grid

One continuous horizontal line for **the whole day**, 10:00 → 00:15, with a live
NOW marker. The two study windows are the only regions drawn with weight; the
φροντιστήριο is the spine; gym, dinner and sleep are drawn but quiet.

- **The morning window** holds homework + ladder debt.
- **14:30–15:00** is pre-filled with the recap of today's 15:15 subject.
- **The 21:45 block** is pre-filled with **today's three φροντιστήριο lessons** and
  nothing else. If he drags homework into it, the page allows it and says what it
  displaced.

### 7.1 Replanning is arithmetic, not an announcement

When something runs long, the line re-flows and one quiet sentence appears:

> **Τα Λατινικά φεύγουν για αύριο.** Η Έκθεση μένει — έχει προθεσμία.

⛔ Never move something silently. ⛔ Never make it feel like failure.

### 7.2 Η ΕΒΔΟΜΑΔΑ — pressure, not a calendar

Five columns, Mon–Sun with `(d.getDay()+6)%7` (σταθερή αρχή 5 — settled, do not
re-litigate). Each column's height is real: `Σ(est) + ladder due that day + exams
from GCal`. Clicking a day opens its detail. **Collision is the whole point** —
when three obligations land on Thursday, the page says so **on Monday** and offers
to move 35 minutes forward. He accepts or edits; it never moves work by itself.

### 7.3 ⛔ NEVER RENDER AN INVENTED ESTIMATE

`est` is `null` until it has been **measured**. The first time he does Ιστορία
recall, the page learns nothing; the third time it can say «συνήθως 18′».

Until then the card shows «—», not a guess. This is exactly the als-v433 rule: a
plausible fiction is worse than an empty field, and `home-motion.js`'s `countUp`
once turned "no value yet" into "your value is 0". A rolling median per
`subject × kind`, minimum 3 samples, is the entire "learning from reality"
feature — and it is honest.

---

## 8 · FOCUS IS A DOOR, NOT A ROOM

⛔ **Do not build a second recall engine.** `istoria.html` and `arxaia.html` already
listen, grade **per element**, share `lesson-grade.js` with a divergence guard, and
carry a proven ladder. A second grader is σταθερή αρχή 15 — a guarantee that holds
on one path and not its twin is not a guarantee, it is a coincidence.

**START** on a ladder task navigates to the owning page, deep-linked to the unit.
That page does the work and writes its own key. When he returns, this page re-reads
the five stores and the debt is gone. **That is the loop, and it needs no
coordination at all** — which is why it cannot break.

### 8.1 ⭐ HIS ANSWER IS "BOTH" — so the written half is first-class

Asked whether his homework is mostly *«μάθε το απέξω»* or real written work, he
said **both**. That settles the size of this page: it is **not** a thin router.

Two kinds of task, visibly different on screen, and the difference is **who owns
the work**:

| | ΑΠΕΞΩ | ΓΡΑΠΤΟ |
|---|---|---|
| owner | `istoria.html` / `arxaia.html` / `latinika.html` / `tonos.html` | **this page** |
| START does | navigates, deep-linked to the unit | opens focus mode here |
| grading | the owning page's, per element | none — it is done when he says it is |
| feeds | that page's ladder | `est` learning + `done` |
| ⛔ | never graded here | never given a fake mastery % |

**Focus mode for ΓΡΑΠΤΟ earns its keep**: the surroundings go quiet, elapsed time
runs, the SOURCE photo is one tap away (that is the whole reason §5.3 exists), and
it **resumes where he left off** rather than restarting. Its only outputs are the
measured duration and `done`.

⚠️ **Do not invent a completion score for written work.** There is no ground truth
for "did I write a good Έκθεση" and a fabricated percentage on that card would be
the als-v433 disease in a new place. `done` is a fact; anything else would be a
guess wearing a number.

---

## 9 · ΕΚΘΕΣΗ — the reserved lane

**30% of his μόρια — tied with Αρχαία — and it has no page, no corpus, no drill.**
Its own brief is coming. Until then this page must **not** pretend it does not
exist: Έκθεση is a first-class `subject`, it appears in the week horizon, it can
hold a deadline, a source photo and a timer, and it shows «δεν υπάρχει σελίδα
ακόμη» where the other three show ΑΝΟΙΞΕ. An honest gap beats a hidden one.

---

## 10 · THE LOOK

Everything in the original brief's §5–§6 and §37–§39 stands. Reinforced:

- **`aurora.css` first.** Elevated MÉTRON. Subject accents restrained; each of the
  four gets one hue and uses it for identity only, never decoration.
- **LESS CARDS.** The information makes the design: typography, rules, a timeline,
  a matrix, inline metrics, one right-hand inspection column. Cards only where they
  genuinely create hierarchy.
- **Greek must look excellent.** It is 100% of the content. Test at 393px that no
  subject name wraps, and remember the measured `section` budget on `istoria.html`
  (**297px**, a long title ate the numbers that were the useful part).
- **Non-ASCII in shared JS ships as `\u` escapes** — `launcher.js` learned this the
  hard way (`pagesâ€¦`).
- **Motion communicates state, never decorates.** No repeated entrance animations;
  no two loops over one value; nothing that shifts layout. ⚠️ An animation that
  touches `transform` on a wrapper with `fill-mode: both` makes that wrapper a
  containing block **forever** and every `position: fixed` child lands at the foot
  of the *document* (σταθερή αρχή 18).
- **A class toggled from JS must exist in CSS — grep it** (σταθερή αρχή 12).
- **A short class name inside a nested component is a landmine** (σταθερή αρχή 26):
  `.rc-el.n` collided with `.rc-slot .n` and rendered text 14px wide in the wrong
  typeface through 570 green assertions.
- **A scrolling flex child never gets `flex: 1`** when the container's height is
  indefinite — desktop looks perfect, **iOS Safari collapses it to zero**
  (σταθερή αρχή 13). Use `flex: 1 1 auto` + explicit `min/max-height`.

---

## 11 · EMPTY, ERROR, AND UNKNOWN — three different sentences

σταθερή αρχή 10 is this project's disease. Every one of these must read
differently:

| situation | what it says |
|---|---|
| Nothing due | «ΕΙΣΑΙ ΕΝΤΑΞΕΙ.» + when the next thing wakes up |
| Nothing captured yet | «Γράψε μία γραμμή.» + a real example |
| Calendar not authorised here | «Δεν έχω το ημερολόγιο σε αυτή τη συσκευή» + the blueprint fallback, labelled |
| Calendar authorised, day genuinely free | «Καθαρή μέρα.» |
| A study store unreadable | names the store and says the debt is **unknown**, never zero |
| Storage full | says so, in words, and **keeps saying so** |

---

## 12 · WIRING CHECKLIST — a page is not shipped until all of it is done

- [ ] `hw:v1` + `hw:pics` in the page's `initCloudSync`
- [ ] both in `backup.html` `BUNDLES` — ⚠️ **grep for a duplicate key**; a later
      entry in an object literal silently shadows an earlier one (this bit `istoria`)
- [ ] both in `api/mcp.js` `BUNDLE` — nothing enforces this one
- [ ] `add_homework` registered as tool #45 in `api/mcp.js`, `_ts`-stamping,
      writing through `mutateBundle`, read path through `liveOnly()`
- [ ] `ladders.js` in `sw.js` `CORE`, and `home-live.js` refactored onto it
- [ ] `homework.html` + any new `.js` in `sw.js` `CORE`; `CACHE` bumped
- [ ] Home tile in `index.html` — ⚠️ **Study becomes FIVE tiles, so exactly one
      `w2` is affordable again and it belongs to this page.** `w2` only fits at an
      ODD tile count; getting this wrong strands one tile on a third row
- [ ] `launcher.js` row (Greek as `\u` escapes)
- [ ] `home-motion.js` search index
- [ ] `home-live.js` `metric()` case — ⚠️ **every local prefixed `hw*`**
      (σταθερή αρχή 14: a `var` in one `switch` case shadows the whole function
      and once reverted every tile on Home to demo values for two weeks)
- [ ] `als-profile.js` `ALL_PAGES` **and** `OWNER_ONLY`
- [ ] `tests/home-tiles.test.js` `DESTS`; out of `tests/launcher.test.js` `EXEMPT`
- [ ] `MAP.md`

---

## 13 · VERIFICATION — green assertions are not evidence

Every serious bug in this repo's history was invisible to a green suite. Required,
in this order:

1. **`tests/homework-plan.test.js`** — the parser (every subject alias, every
   weekday, an unparseable line), the recommender (a fixture where the answer is
   knowable by hand), the time subtraction, `(d.getDay()+6)%7`, and **the
   read-only guard: `hw:*` is the only key written**.
1b. **`tests/ladders.test.js`** — a **hand-written** fixture for each of the four
   shapes in §4.5, including the legacy `arx:v1` array, plus a byte-identical
   comparison of Home's four tiles against `git show HEAD:home-live.js`.
2. **`tests/homework-sync.test.js`** — drives the **real** `sync.js` and the
   **real** `study-stamp.js` in a `vm`. Assert that a second edit to the same task
   survives a merge, and that a delete before `initCloudSync` leaves a tombstone.
   **Reverting the fix must fail it.**
3. **`./smoke-test.sh`** — mandatory before any push.
4. **Drive it in headless Chrome and READ the render.** Strip only external
   scripts and **assert none survived** (σταθερή αρχή 8 — a sync script in a
   harness writes to live Supabase; σταθερή αρχή 19 — plain string containment,
   ban the `src=` context, never a regex built from a name, and note that
   `topbar.js` creates a `<script>` at RUNTIME so `document.createElement` must be
   overridden too).
5. **Look at it at 1440px AND at 393px.** Then look again at 1440 with **one**
   task, with **zero**, with **fourteen**, and with a task that has no due date.

---

## 14 · EXPLICITLY NOT BUILDING

Named so they are not "discovered" later as omissions:

- ⛔ Any AI extraction of homework from a photo, PDF or screenshot **inside the
  page** (§5). ⚠️ This does **not** forbid the chat road of §5.4 — there the
  reading is done by Claude in conversation and confirmed by him before a byte is
  written. The ban is on a model reading a photo *unsupervised, on a server*.
- ⛔ Any second recall/grading engine (§8).
- ⛔ Any write to `ist:v1` / `arx:v1` / `arx:gn` / `lat:v1` / `ton:v1` (§4.2).
- ⛔ Any read or write of Notion (unreachable from a browser). «Η Χρονιά» stays
  alive and untouched — he compares the two himself.
- ⛔ A 13th `api/*.js`.
- ⛔ A rival command palette (extend `launcher.js` or skip it).
- ⛔ Machine learning. A rolling median over ≥3 real samples is the whole thing.
- ⛔ Retiring, redirecting or deleting **any** existing page.

---

## 15 · PHASES — land real code every phase

| | | done when |
|---|---|---|
| **0** | **`ladders.js`** — the shared reader (§4.5), `home-live.js` refactored onto it, fixtures per shape | ✅ als-v470. Home's four tiles are byte-identical to before, and one call returns all five ladders |
| **0b** | **ΤΟ ΣΥΜΒΟΛΑΙΟ** (§4.7) — `sessions` read by `ladders.js`, written by `tonos.html` | ✅ als-v471. A real Τονισμός exam produces a duration the command center reads. **The other four pages still owe theirs** |
| **1** | **THE DEBT.** Draw what is due, across all five. One column, no capture, no plan. | It tells him something he could not otherwise know, on his phone, today |
| **2** | **START HERE** + the reason clause + «ΕΧΩ 20 ΛΕΠΤΑ» + deep links out | Pressing START lands on the right unit of the right page |
| **3** | **CAPTURE** — the one-line parser, the chip confirmation, the photo as source, brain dump | He adds tomorrow's homework in three taps at the φροντιστήριο |
| **3b** | **`add_homework`**, tool #45 in `api/mcp.js` (§5.4) | A photo sent in chat lands in the page without a deploy |
| **4** | **Η ΜΕΡΑ** — the ledger, the visible subtraction, the two windows, the 21:45 rule | The number at the top can be checked by reading the lines under it |
| **5** | **Η ΕΒΔΟΜΑΔΑ** — pressure, collision detection, "move 35 minutes forward" | Thursday's pile-up is visible on Monday |
| **6** | **FOCUS for ΓΡΑΠΤΟ** (§8.1 — half his homework) + `est` learning | He can sit down to a written exercise here, with the source photo one tap away |
| **7** | **THE EDIT.** Remove 30% of the visible UI. | It became impressive by subtraction |

---

## 16 · ACCEPTANCE — falsifiable, not aspirational

Not done because it compiles or looks good. Done when **each of these can be
demonstrated on a real render**:

**Correctness**
- [ ] Every number on screen is traceable to a store or is `—`. Zero invented values.
- [ ] The recommendation's reason clause is the same logic that produced the ranking.
- [ ] Deleting a task 200ms after load survives a reload and a cloud pull.
- [ ] Editing the same task twice survives a merge (the als-v468 scene).
- [ ] `hw:*` is the only key written. Proven by a test, not by reading.
- [ ] The calendar being unauthorised, being empty, and being unreadable produce
      three different sentences.
- [ ] A due date the parser did not find renders as «χωρίς ημερομηνία».

**Feel**
- [ ] Two seconds tell him: where he is, how much time he really has, what to do.
- [ ] He can capture homework with a phone in one hand at the φροντιστήριο.
- [ ] START never lands on a dead end.
- [ ] Nothing on screen exists only to be looked at.
- [ ] It looks like MÉTRON's next room, not a template.

---

> **DO NOT BUILD A HOMEWORK DASHBOARD. BUILD THE ONE SURFACE THAT CAN SEE BOTH
> WHAT HE OWES AND WHAT HE IS FORGETTING — AND MAKE IT SAY ONE SENTENCE.**
