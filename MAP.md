# AURORA — where everything lives

The repo is **flat on purpose**. There are no rewrites in `vercel.json`, so a
page's filename *is* its URL: `gym.html` is live at `/gym.html`. Moving a page
into a folder would change its URL and break every link, the service-worker
precache, your bookmarks, and the installed PWAs. So: **live pages stay in the
root, and this file is the index.**

Everything in the root is live. Anything retired is in `archive/`.

---

## The 33 live pages

**Home & shell**
| Page | What it is |
|---|---|
| `index.html` | **The home screen.** Hero, quick row (water · nutrition · sleep), Focus card, Nova noticings, forecasts. |
| `main.html` | The "Mind" hub — reached from the bottom-nav Mind tab. |
| `identity.html` | Identity / who-you're-becoming. |
| `arc.html` | Your Arc — the long-view story of your data. |

**Body & training**
| Page | What it is |
|---|---|
| `gym.html` | Fitness — the big one (164 KB). Workouts, sessions, lifts. |
| `body.html` | Body hub. |
| `weight.html` · `measure.html` | Weigh-ins · body measurements. |
| `pr.html` | PR board. |
| `health.html` | Health. |
| `trends.html` | Trends across metrics. |

**Fuel**
| Page | What it is |
|---|---|
| `nutrition.html` | Nutrition (151 KB). Meals, macros, photo→macros. |
| `planner.html` | Meal planner. |
| `po-water.html` | Water tracker (the home water chip links here). |
| `caffeine.html` | Caffeine. |
| `supps.html` | Supplement timing. |

**Sleep** — `sleep.html` (sleep & recovery).

**Mind & life** — `ideas.html`, `movies.html`, `improve.html`.

**Money** — `finance.html` (the Money tab), `bills.html`.

**Nova & intelligence**
| Page | What it is |
|---|---|
| `nova-chat.html` | Nova — the conversational coach. |
| `coach.html` | Coach — the *action* view ("what to do"). |
| `insights.html` | Insight Engine — the *evidence* view ("why we think so"). |
| `morning.html` | Morning briefing. |
| `weekly.html` | Weekly review. |

**Running** — `run.html` — **Chrissie's standalone PWA** (own manifest, `run.webmanifest`, starts at `/run.html`, nav hidden). Not part of your dashboard chrome.

**Study** — `arxaia.html` (Αρχαία), `istoria.html` (Ιστορία).

**Tools** — `import.html` (MyFitnessPal), `import-strong.html` (Strong), `backup.html` (backup & restore).

---

## The scripts

**Shell (on every page)** — `topbar.js` injects the top + bottom bar, runs the
login gate, registers the service worker, and lazy-loads the engines below.
`sync.js` is the Supabase layer. `lock.js` is the gate. `als-dialog.js` is the
modal helper (native `<dialog>`).

**Home only** — `home-live.js` (data → the home tiles, incl. the water chip),
`home-motion.js` (entrance choreography).

**Engines (lazy-loaded)** — `insights-engine.js` (correlations, t-gated),
`forecast-engine.js` (trend projections), `chapters-engine.js`,
`nova.js` / `nova-life.js` / `nova-coach.js` / `nova-actions.js` / `nova-gem.js`.

**Motion** — `aurora-motion.js`, `page-motion.js`, `aurora-bg.js`.

**Other** — `water.js`, `tdee.js`, `xp.js`, `push.js`, `reminders.js`,
`pocoach-sync.js`, `gcal.js`, `error-toast.js`, `insights.js`.

**Styles** — `aurora.css` (35 pages), `aurora-page.css`, `jarvis.css`.
Home has its own token set inline in `index.html`.

**`api/`** — 12 serverless functions. **`vendor/`** — GSAP, Lenis.

---

## Folders

- **`archive/`** — retired pages kept for reference: the demos that became the
  current design, the pre-redesign homes (`index-classic.html`), and
  `gym-classic.html` / `body-classic.html`. **Nothing links here.** Not deployed
  (see `.vercelignore`).
- **`docs/`** — setup notes and older write-ups. Not deployed.

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
   weigh-in once.)
5. **Run `./smoke-test.sh` before pushing.** It parses every JS file and inline
   script and checks that every local link resolves.

## Known inconsistency (not yet resolved)

The **Mind tab points to two different pages**: the bottom nav in `topbar.js`
sends it to `main.html`, while home's own nav sends it to `identity.html`.
Both pages are live. Worth picking one.
