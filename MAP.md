# AURORA — where everything lives

The repo is **flat on purpose**. There are no rewrites in `vercel.json`, so a
page's filename *is* its URL: `gym.html` is live at `/gym.html`. Moving a page
into a folder would change its URL and break every link, the service-worker
precache, your bookmarks, and the installed PWAs. So: **live pages stay in the
root, and this file is the index.**

Everything in the root is live. Anything retired is in `archive/`.

---

## The 34 live pages

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

**Running** — `run.html` — Chrissie's running app. Has its own manifest
(`run.webmanifest`, starts at `/run.html`) so it installs as a standalone icon,
**but since als-v326 it is a full citizen of the app**: Chrissie has her own
account, so `topbar.js` now renders the shared top bar on it — and with it the
same Back button every other page has. It keeps its own 5-tab `.rn-tabs` nav, so
it skips the global bottom bar (same treatment as `gym.html`). The page sizes
itself to the bar via `--tbh` / `setTbh()`.

**Study** — `arxaia.html` (Αρχαία), `istoria.html` (Ιστορία).

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

**`api/`** — 12 serverless functions, plus `_`-prefixed helpers that Vercel
neither routes nor counts (`_model`, `_supa`, `_auth`, `_vault`, `_movies`,
`_prices`, `_youtube`, `_garmin`, …). New server logic goes into a helper and is
called from an existing function. **`vendor/`** — GSAP, Lenis.

---

## Folders

- **`archive/`** — retired pages kept for reference: the demos that became the
  current design, the pre-redesign homes (`index-classic.html`), and
  `gym-classic.html` / `body-classic.html`. **Nothing links here.** Not deployed
  (see `.vercelignore`).
- **`docs/`** — setup notes and older write-ups. Not deployed.
- **`tests/`** — 9 suites, 229 assertions, run with plain `node`. Also holds
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

## Known inconsistency (not yet resolved)

The **Mind tab points to two different pages**: the bottom nav in `topbar.js`
sends it to `main.html`, while home's own nav sends it to `identity.html`.
Both pages are live. Worth picking one.
