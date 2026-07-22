# MÉTRON — working contract

Personal performance PWA. Two real users: **Alex** (17, Rhodes, Greece) and his
mother **Chrissie** (48, training for the Athens Marathon on 8 Nov 2026).
Separate Supabase accounts, one codebase.

- Repo `alexstat09/als` · deploys to `https://als-ochre.vercel.app`
- **Read `MAP.md` first** for what every page and script is. This file is the
  operating contract: stack, systems, rules, state.

---

## 1 · Stack

No build step. No framework. No bundler. No TypeScript.

| Layer | What |
|---|---|
| Pages | **Self-contained single-file `.html`** with inline `<style>` + `<script>` |
| Shared JS | Plain root-level `.js`, loaded with `<script src>` (no modules) |
| Shared CSS | `aurora.css` (design system) · `aurora-page.css` · `jarvis.css` (legacy) |
| Backend | Vercel serverless, CommonJS `api/*.js` (`module.exports`) |
| Data | Supabase Postgres + RLS + Auth |
| AI | **FREE only**: Groq (`api/_model.js`), Gemini. **Never Anthropic, never a paid key.** |
| Deps | `web-push` only. That is the entire `package.json`. |
| Offline | `sw.js`, **network-first**, versioned `als-vNNN` |

**Node for tests:** `export PATH="$HOME/.local/node-v24.18.0-darwin-arm64/bin:$PATH"`

Don't introduce React, Tailwind, shadcn, a bundler, or a package. If a change
seems to need one, it is the wrong change.

---

## 2 · Architecture

### Layout
Flat **on purpose**: filename == URL. `morning.html` is `/morning.html`.
Never move a live page or script into a folder. `archive/` and `docs/` are not
deployed. Full inventory in `MAP.md`.

### Serverless — the hard ceiling
**`vercel.json` `functions` has 12 entries and all 12 are used.** A 13th routed
`api/*.js` breaks the deploy. `_`-prefixed helpers (`_model`, `_supa`, `_auth`,
`_youtube`, `_prices`, `_movies`, `_vault`, …) are **not** routed and are free.

New server logic folds into an existing function. `api/run-reminders.js` is the
courier: it early-returns on `?movies=`, `?youtube=`, `?ytdistill`, `?ytorganize`,
`?prices`, `?backup=auto`. Add there.

### AI calls
`api/_model.js` is the only brain-stem. **Callers name a ROLE, never a model.**

- Roles: `text` (`gpt-oss-120b` → `qwen3.6-27b` → `llama-3.3-70b`) and `vision`
  (`qwen3.6-27b`, the only image model, and it is PREVIEW with no fallback).
- `llama-3.3-70b` dies **16/08/26**.
- API: `json(role, payload)` → `{ok, obj, raw, model}`, `stream(role, payload)`.
- ⚠️ **`gpt-oss-120b` counts hidden reasoning inside `max_tokens`.** A long call
  returns EMPTY, not an error. Use `reasoning:'low'` plus chunking.
- `reasoning_effort` is gpt-oss-only. `tune()` maps generic params per model.

### Sync — the most expensive bug class in this project
Supabase table `app_state`, primary key **`(user_id, key)`**.

- **`on_conflict` must be `user_id,key`.** `on_conflict=key` returns Postgres
  `42P10` / HTTP 400 before RLS even runs. This silently ate every phone
  weigh-in for months. `smoke-test.sh` now bans it; do not reintroduce it.
- Client REST **must send the session JWT**, never the bare anon key, or a fresh
  device pulls EMPTY under RLS.
- `sync.js` = `initCloudSync({appKey, syncedKeys, syncedPrefixes, onApplied, readOnly})`.
  Engines: `health`, `nutrition`, `sleep`, `goals`, `coach`, `caffeine`, `ideas`,
  `identity`, `body-measure`, `finance`, `improve`, `arxaia`, `istoria`, `po-coach`.
- **Weigh-ins and gym live in `pocoach-sync.js`, not `sync.js`.**
- `fetch()` resolves on 4xx. Always check `r.ok`. `lastJson` advances only on a
  confirmed write.
- `sync.js` merges any object child named **`logs`** with `Math.max`, so a
  counter cannot decrease unless every write stamps `_ts`.
- Every synced key must be known to `BUNDLES` in `backup.html` or it syncs fine
  and is silently **unrestorable**. `smoke-test.sh` enforces this.
- Device-local by design (never synced, excluded from the vault): `gcal:*`.

### Auth / security
`api/_auth.js` gates endpoints (same-origin + rate limit + cron secret). RLS and
service-role are live. Rows are keyed `(user_id, key)` — **never hardcode "Alex",
never write an unowned row.**

---

## 3 · Hard constraints

Violating any of these breaks production or loses data.

1. **≤12 routed `api/*.js`.** All 12 slots are full.
2. **Bump `CACHE` in `sw.js:15` on every deploy.** Currently `als-v391`. Never
   move it backwards.
3. **`on_conflict=user_id,key`.** Never `key` alone.
4. **Modals:** native `<dialog>` + `showModal()`, or the `als-dialog.js` helpers
   (`ALSConfirm` / `ALSAlert` / `ALSPrompt`). An ancestor `transform` breaks
   `position:fixed`, so hand-rolled overlays render off-frame.
5. **A week is Mon–Sun:** `(d.getDay()+6)%7`. Settled, do not re-litigate.
6. **Bucket `nut:logs` by `dateKey`** (the day the food is FOR), never `ts`.
7. **Never rename, merge, or delete** an existing exercise id or one of his foods.
8. **Never run a sync script in a render harness.** It writes to live Supabase.
   Strip every `<script>` first, then delete the artifact.
9. **Free AI only.** No paid keys, no OAuth secrets in the repo.
10. **Silent-empty is this project's disease.** "No data" and "we failed to read
    it" must never render the same way. Use `lsGet/lsSet/lsRem`; never
    monkey-patch `localStorage` (it breaks Safari).
11. **A class you toggle from JS must exist in CSS — grep it.** `.hidden` was
    toggled on Home's arc band for two versions and defined nowhere (`aurora.css`
    is that page's only stylesheet). The "new chapter" badge was permanently lit
    and a failed read drew an empty band. A no-op class fails silently, which is
    silent-empty wearing a different hat.

---

## 4 · What is built

Everything on the original review list is shipped. All 34 live pages carry the
Elevated MÉTRON design (`aurora.css`).

**Body & training** — `gym.html` (246 seeded exercises, templates, folders),
`health.html`, `body.html`, `measure.html`, `pr.html`, `supps.html`,
`sleep.html` (score is MEASURED only; feelings are an outcome, never an input),
`caffeine.html`, `po-water.html`.

**Food** — `nutrition.html` with photo macros, food search, per-piece weight
guard (`unitOK()`, the 111g-Oreo fix), favourites, streaks.

**Mind & life** — `main.html` (outcome goals auto-tracked from workouts, weight,
nutrition, films, runs), `coach.html` (weekly Focus Loop with memory, grades
last week against real data, deterministic Nova briefing), `insights.html`
(Welch t-test hypothesis engine, three states: confirmed / ruled-out / watching,
weekly memory), `arc.html` (chapters; on Home the arc rests as a one-line rail
under the dateline and expands to the full band only for the three days after a
chapter turns, so nothing outranks the greeting on an ordinary day),
`improve.html` (YouTube shelves + background reader), `movies.html`
(Letterboxd + TMDB, real recommendations), `ideas.html`, `identity.html`,
`planner.html`, `finance.html` (rebuilt as **Money** for €1000 cash, no income).

**Study** — `arxaia.html`, `istoria.html`.

**Nova** — `nova-chat.html` plus `api/nova-chat.js`. Four read-only tools, every
result bound. Empty is not an error and she must never invent a number.

**Morning briefing** — `morning.html`. Includes **THE DAY** (als-v390): the
Google Calendar panel that classifies rather than lists. His calendar is ~95%
five-minute recurring habit reminders, so routines fold into quiet clusters,
real events sit on a rail with a live NOW marker, and exams outrank the page.
Read-only scope, device-local cache, no backend.

**Infrastructure** — daily GitHub vault backups with 14-day rollback and
additive-only repair (`backup.html`), multi-user auth, push notifications,
`api/mcp.js` (41 read+write tools, live on Alex's Pro), sync watchdog with
per-engine persisted state (`als-sync-status.js`).

**Running app for Chrissie** — `run.html`, editorial Rose 5-tab PWA, Athens
race-day crown, `intervals.icu` auto-import.

---

## 5 · Open

**Last shipped — `als-v391`, the arc rail** (2026-07-22, pushed to `main`).
His words: *"the surge on top of the home screen is too big, ur eye doesnt
really see the good morning alex."* He was right. See §4 for the behaviour and
constraint 11 for the bug it uncovered. Two things it left unsettled:

- `ANNOUNCE_DAYS = 3` in `paintArcBand()` is a guess. **Nobody finds out whether
  it is right until a chapter actually turns** — so if he mentions the band
  feeling long or having missed it, that constant is the dial, not the design.
- Home's arc **tile** still reads "Surge / chapter · day 184", which the rail now
  duplicates a few hundred pixels above it. Left alone on purpose (every page
  owns a tile), but he never ruled on it.

**Needs Alex, not code**
- Connect Garmin directly on `intervals.icu` and remove Strava. This blocks
  Chrissie's auto-import and the marathon is 8 Nov 2026.
- Send his 4 gym trial templates (folder `f-cbas`). ⚠️ Zero leg sets in all of
  2026. Don't fight him on volume; argue frequency.
- Decide the Nova → Hy3 model upgrade. Free tier requires training consent
  including Chrissie's data; paid is ~€0.30–0.90/mo. Steps in
  `docs/NOVA_MODEL_UPGRADE.md`.
- Two Google Calendar calls: 2-way write (recommended: skip) and a cloud
  snapshot so Nova sees the calendar from any device (a privacy decision).
- Delete the daily 🛒 "Order Skincare Products" calendar event.

**Could be built**
- Fuel timing, wind-down, and workout-vs-event collision flags off the gym
  block. `GCal.day()` already exposes `anchor`, `gaps`, and `bedtime`; the fuel
  and recovery panels just don't consume them yet.
- Exam countdown on the study pages (`GCal.nextExam()` exists, Nova already
  gets it). Revisit in September when real exams appear.
- Close `/api/nova-chat` to direct calls. Last real security gap; protects the
  free Groq quota.
- Promote Home's "Studio" segment to a real index.

**Known open bugs**
- `po_water_v1` uses whole-object last-write-wins, so concurrent edits on two
  devices can clobber each other.
- The Mind tab points to two different pages: `topbar.js` sends it to
  `main.html`, Home's own nav sends it to `identity.html`. Both are live.
- `_water-test.html` and `_abtest.html` are local-only and 404 in production,
  but opening `_water-test.html` seeds fake water data. Safe to delete.
- Bar-blur smear on the nav (low priority).

---

## 6 · Workflow

```bash
export PATH="$HOME/.local/node-v24.18.0-darwin-arm64/bin:$PATH"
for f in tests/*.js; do node "$f"; done   # 8 suites, 181 assertions
./smoke-test.sh                            # MUST pass before every push
```

`smoke-test.sh` parses every JS file and inline `<script>`, checks every local
link resolves, bans `on_conflict=key`, and fails if a synced key is missing from
`BUNDLES`.

**Before pushing:** bump `sw.js:15`, run the tests, run the smoke test.
Small commits. Note the SW bump in the message. Push only when asked, or when
the request clearly ends in "push".

**Testing pattern for single-file pages:** extract the inline `<script>` with a
regex, run it in a `vm` with a stubbed DOM and `localStorage`, and assert on the
rendered markup. `tests/gcal-panel.test.js` is the reference implementation.
Assert that something rendered, not just that nothing threw.

**Seeing a layout change before he does:** copy the page to the scratchpad,
`replace(/<script[\s\S]*?<\/script>/gi,'')`, then **assert no `<script>`
survived and throw if one did** — constraint 8 is a data-loss rule, not a style
one. Hardcode what the JS would have painted, force `[data-rise]` to
`opacity:1`, and shoot it:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless \
  --disable-gpu --screenshot=after.png --window-size=393,700 \
  --virtual-time-budget=3000 --hide-scrollbars "file://$PWD/after.html"
```

Render `git show HEAD:<page>` the same way for a real before/after. Headless
does not apply the mobile viewport, so the right edge clips — compare the two
shots against each other, never a shot against the phone. Delete both when done.

**Design work:** the `impeccable`, `ui-ux-pro-max`, and `redesign-existing-projects`
skills are installed, but every output stays vanilla single-file HTML/CSS/JS.
Motion is original and data-driven; take inspiration from references, never copy.

**For big or exploratory redesigns:** build an isolated demo page first
(`*-demo.html`) and let him choose. A redesign is an upgrade, never a feature
drop: inventory the live page, reach 100% parity, then polish.

---

## 7 · Working style

- Answer on line one. Headings and bullets, spaced and scannable.
- Mistakes and gotchas go up top under `## Worth knowing`, never buried.
- Ship replies end with **Live / You do / Open**.
- Touching more than two files? Plan first, then build.
- Land real code every turn. Don't narrate what you're about to do.
- Report outcomes honestly: if a test fails, show the output.
- **Cost:** context is re-sent every turn, so a long session gets expensive fast.
  One task per session, `/clear` after a ship. Read big files in targeted slices
  (`morning.html` is 1,700 lines). Don't load a large skill for a small question.
