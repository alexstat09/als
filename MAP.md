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
als-v450), `istoria.html` (Ιστορία, als-v451) and `arxaia.html` (Αρχαία,
als-v454) are the study pages.
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
the same row). Λατινικά is a *drill*, not a notebook: `latin-engine.js` derives
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
