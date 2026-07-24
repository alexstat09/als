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
`_youtube`, `_prices`, `_movies`, `_vault`, `_garmin`, …) are **not** routed and
are free.

New server logic folds into an existing function. `api/run-reminders.js` is the
courier: it early-returns on `?movies=`, `?youtube=`, `?ytdistill`, `?ytorganize`,
`?prices`, `?backup=auto`, `?garmin=diag`, `?icu=1`. Add there. It runs on an
hourly QStash schedule; the Vercel cron entry is `?backup=auto` only, which
returns before the couriers — so anything that must run unattended needs the
QStash tick or a page that asks for it.

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
- **`supabase-js` does NOT throw on an HTTP-rejected write.** `.upsert()` /
  `.insert()` / `.update()` **resolve** with an `{ error }` field. Awaiting one
  without reading `res.error` is a silent-success trap: `sync.js` was advancing
  `lastJson` and reporting "Saved" over rejected writes (fixed **als-v403** —
  both upsert sites now `if (res.error) throw res.error`). This is the
  supabase-js twin of the `r.ok` rule above. `pocoach-sync.js` (raw `fetch`)
  was already honest, which is why the stranded banner names *it*.
- **Never load a sync-critical dependency from an external CDN.** The Supabase
  client was loaded from jsdelivr; the SW never caches cross-origin (see `sw.js`
  header), so one flaky load left `window.supabase` undefined → topbar's login
  gate fails **open** and `sync.js` no-ops **silently** (constraint 10). Vendored
  to `vendor/supabase.min.js` + added to SW `CORE` (**als-v402**). Self-host sync
  deps; never CDN them.
- **The stranded banner tells the truth AND the cause** (`als-sync-status.js`):
  `fail(name, detail)` carries the HTTP status, so it prints
  `gym & weigh-ins · HTTP 401` (stored in `als:sync-errd`, cleared on `ok()`). A
  stuck engine is **usually a stale session** — cached reads still render so the
  page looks fine while writes 401; the fix is re-login.
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
2. **Bump `CACHE` in `sw.js:15` on every deploy.** Currently `als-v405`. Never
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
`body.html`, `measure.html`, `pr.html`,
`sleep.html` (score is MEASURED only; feelings are an outcome, never an input —
and for Chrissie it now draws her watch's whole night: measured window,
hypnogram, stage split, continuity, overnight body. Three states that must LOOK
different: no measurement renders nothing, a duration with no window says so in
words, a full night draws the timeline. For Alex, a **My protocol** section
(als-v396) carries a read-only wake-time **anchor tracker** — last 14 nights vs
his 10:00 target, a ±30-min band, drift status, streak — over a collapsible
playbook),
`caffeine.html`, `po-water.html`, and `supps.html` — the **one** supplement page
(als-v401): a timing timeline tuned to Alex's real routine (morning ~10–11 AM,
afternoon ~5–6 PM, night ~11 PM — not the old generic 7–10 / 12–2 / 9–11), a
**streak + 14-day per-supplement consistency** memory (computed from the
never-pruned `stack:taken:*` history, zero backend), a native-`<dialog>` **"Manage
your stack"** modal (74-entry library, add/edit/delete, window reassignment,
running-low → shown as a "Low" badge), and **window push nudges** (§5).
`health.html` was folded into it and is now a redirect; water is `po-water.html`
only.

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
race-day crown, `intervals.icu` auto-import, and a **shoe stage** that knows
which shoe it is drawing (§5).

---

## 5 · Open

**HEAD is `als-v405`** (run.html adopted the "Road to Athens" redesign,
**visual-only** — her data path byte-identical; that work is its own thread).
It sits on top of **this session's sync-resilience pair, `als-v402`/`als-v403`**
(2026-07-24, on `main`, 11 suites + smoke green). Triggered by Chrissie's run
data + Alex's phone not reaching the cloud, and the dashboard's *"changes from
the last 9 hours are only on this device"* banner:

- **`als-v402` — self-hosted Supabase (the silent no-cloud fix).** Every page
  loaded the Supabase client from `cdn.jsdelivr.net`; the SW never caches
  cross-origin, so a flaky load on the PWA left `window.supabase` undefined →
  topbar's login gate fails **open** and `sync.js` no-ops **silently** while the
  page looks totally normal (localStorage still renders). Vendored the exact
  build (2.110.8) to `vendor/supabase.min.js`, repointed **all 32 pages**, added
  it to SW `CORE`. See the two new §2 sync rules.
- **`als-v403` — sync.js stopped lying + the banner names the cause.** `sync.js`
  awaited `supa.upsert()` but never read `.error`; supabase-js **resolves** (not
  throws) on an HTTP rejection, so failed writes advanced `lastJson` and reported
  "Saved." Both upsert sites now check `res.error`. And `fail(name, detail)` now
  carries the HTTP status → the stranded banner prints `gym & weigh-ins · HTTP
  401` (`als:sync-errd`), so a stuck write is **readable off the phone**. **Open
  follow-up:** the live banner's cause was never confirmed — when Alex reads the
  new second line, `HTTP 401/403` → stale session (re-login), `413` → row too
  big, `400` → malformed. Chase whatever it actually says.

**Before that — `als-v399` → `als-v401`, `supps.html` became the whole
supplement world** (2026-07-23, on `main`, 11 test suites + smoke green,
manager + timeline headless-verified). Three moves:

- **v399 — real timing + memory + push.** The page used generic windows (7–10 /
  12–2 / 9–11) and marked Alex's afternoon dose "missed" by 2 PM; it now matches
  how he actually doses (morning ~10–11, afternoon ~5–6 PM, night ~11 PM;
  `winStatus` normalises the pre-6 AM tail, h<6 → h+24). Added a **streak +
  14-day per-supplement consistency** section computed from the never-pruned
  `stack:taken:*` history (no new data, no backend) and three **window push
  reminders** folded into `api/run-reminders.js` (`supp-morning` defHour 10,
  `supp-lunch` 17, `supp-evening` 23 — **no 13th function**). Each fires only when
  its window still has UNTAKEN daily supps and names exactly what's left (reads
  `stack:items` + `stack:taken:'+today` from the `health` Supabase row); "anytime"
  (creatine) rides with the morning nudge. Default-on, relevance-gated.
- **v400/v401 — one page, no stray.** The stack **manager** (add/edit/delete,
  74-entry autocomplete library, per-item window reassignment, running-low) was
  ported from `health.html` into a native `<dialog>` modal in `supps.html`.
  ⚠️ **Seeding is EMPTY-ONLY** — `ensureSeed()` writes `STACK_DEFAULTS` only when
  `stack:items` is absent/empty, **never** on version mismatch. The old
  `health.html` reseeded on `stack:version !== 9` and could wipe a customised
  stack; **do not reintroduce version-based reseeding.** Mutations use
  `rawItems()` (unfiltered) so a save never prunes.
- **`health.html` retired to a hash-aware redirect** (`#water`→`po-water.html`,
  else→`supps.html`) — its water duplicated `po-water.html`, and it was reachable
  only from places Alex never looked. Repointed EVERY referrer: topbar water pill
  (`topbar.js`)→`po-water.html`; Home tile (`index.html`) + `home-live.js`
  count-case + `home-motion.js` grouping + `body.html` "Open" + `settings.html`
  →`supps.html` (settings lists Supplements + Water separately). Don't point any
  of these back at `health.html`.

**Before that — `als-v396`, Alex's sleep protocol on his own page** (2026-07-23,
on `main`, tests + smoke pass, headless-verified). `sleep.html` gained a **My
protocol** section (after *Tonight*): a wake-time **anchor tracker**
(`renderWakeAnchor()`) reads the last 14 logged nights against his profile wake
of **10:00**, plots each night's drift over a ±30-min band, and reads
**LOCKED / DRIFTING / ALL OVER** with a streak — sitting over a static,
collapsible **playbook** (nightly timeline, stop-the-early-waking, supps,
when-you-wake-early, buy list). The tracker is **read-only** (never writes a
night) and is wired into `renderAll` + `refreshDerived`. New CSS is `.wa-*`
(anchor) and `.pb-*` (playbook); the playbook is static markup so it can't
silent-empty. Alongside it, **four daily Google Calendar reminders** were created
on his account via the GCal MCP (☕14:00 caffeine · 💧22:30 fluids · 😴23:00–00:15
wind-down + supps · 📵00:00 screen-down); they fold into THE DAY's routine
cluster like his other habit reminders. His sleep crux is **involuntary early
waking** (dawn light in Rhodes summer); the goal is a **consistent 9:30 for
growth**, not raw hours. His real data lives in `~/ALS DASHBOARD ALL FILES/BACKUPS/`
(device + cloud exports) — the live cloud rows are only reachable through the
`api/mcp.js` connector in the **claude.ai** app, never from Claude Code.

**Before that — `als-v394` / `als-v395`, her shoes became objects** (2026-07-22
and 23, on `main`, live byte-verified). Detail in the block below.

**Before that — `als-v393`, Chrissie's real Garmin night** (2026-07-22, on
`main`, verified on her phone). Her sleep now arrives complete and unattended:
bedtime and wake, the hypnogram, deep/light/REM, whether it broke, and the
overnight body. Detail in the block below.

**And before that — `als-v391`, the arc rail** (2026-07-22), the previous change
to a page Alex himself uses before v396.
His words: *"the surge on top of the home screen is too big, ur eye doesnt
really see the good morning alex."* He was right. See §4 for the behaviour and
constraint 11 for the bug it uncovered. Two things it left unsettled:

- `ANNOUNCE_DAYS = 3` in `paintArcBand()` is a guess. **Nobody finds out whether
  it is right until a chapter actually turns** — so if he mentions the band
  feeling long or having missed it, that constant is the dial, not the design.
- Home's arc **tile** still reads "Surge / chapter · day 184", which the rail now
  duplicates a few hundred pixels above it. Left alone on purpose (every page
  owns a tile), but he never ruled on it.

### The shoe stage (`als-v394` / `v395`)

**Why it exists.** `SHOE_RETIRE` was a flat 700km. Chrissie's *default* shoe is
`"Saucony endrorphin pro 5"` (her spelling) — a carbon racer finished at ~400km —
so every auto-imported run piled onto it against a limit 300km too generous, on
knees that already ache from eight hours standing. Her other pair is
`"Hoka Bondi 9"`, max cushion, 800km. Recognising the model is what makes the
number honest; the picture is a consequence, not the point.

**How it decides.** `SHOE_KB` is 73 models (keywords, lifespan, stack, drop,
plate, palette). `shoeIdentify()` scores brand + model tokens with a bounded
Levenshtein ≤2, **penalises unmatched keywords** (without that, "Nike Pegasus 41"
matches *Pegasus Trail*), and accepts a lone distinctive model token ≥5 chars
(so "vaporfly next% 4" resolves with no brand). Precedence for the limit is
`retireUser` → catalogue → stored `retireKm` → 700.

- **Identification is read-only.** `shoeLifeKm()` computes at render; nothing is
  ever written back onto a shoe. An unidentified shoe keeps whatever limit it had
  and says so in words — it never invents a number.
- Her photo replaces the drawing: `run:shoePics`, ≤26KB, synced **and** in
  `BUNDLES`. At the limit, «Κάρτα ✧» draws a keepsake of the distance those shoes
  carried her.

**The shoe itself is drawn, never fetched.** No free, legal, durable shoe-image
API exists; brand CDN URLs rot and a PWA offline in Rhodes would show a broken
box. Don't re-pitch fetching product photos. Geometry comes from the model's own
stack and drop, so it can do what a catalogue photo cannot — wear out.

**`als-v395` makes it real 3D, on the GPU, with no dependency.** `shoeMeshGL()`
lofts ~6,600 triangles; two inline shaders do per-pixel Phong. Laces and tread
lugs are real geometry and the lugs flatten to nothing by end of life. The drawn
2D SVG remains the fallback.

⚠️ **Gotchas here, in the order they bit:**

- **`y` grows DOWNWARD** in the shoe code (`GY=136` is the ground, the collar is
  ~50). Two separate bugs came from forgetting it: `ry=(yTop-yBot)/2` went
  negative and flattened the shoe into a ribbon, and `y<=yOut(t)` painted the
  whole upper in the outsole's colour. The GL buffer flips Y on the way in.
- **One shared GL context, blitted into each shoe's own 2D canvas.** Never one
  context per shoe — browsers cap them and silently drop the oldest.
  `webglcontextlost` falls back to the drawing; nothing on the page breaks.
- **Colour lives on the vertices**, not the faces. Per-quad colour stair-steps the
  midsole line and the flank sweep into something that looks like Minecraft.
- Panels (toe bumper, heel counter, topline seam) are what stop a lofted profile
  reading as a smooth loaf. The lens is *solved* from the canvas shape, not
  hardcoded.
- **Nothing animates on its own** — painted once, then only when she touches it,
  so a shoe on screen costs her no battery. The gyroscope is deliberately unused:
  iOS needs a permission prompt, and a system dialog because she touched a picture
  of her trainers is not delight.

**Not yet confirmed on a device:** the whole stage is verified by headless render
and 2,153 assertions, but nobody has run a finger over it on Chrissie's iPhone.
The keepsake card (`shoeKeepsake`) now rasterises the GL canvas rather than the
SVG — that path in particular has only been read, never tapped.

### The Garmin sleep pipe (`als-v392` / `v393`)

**Why a second pipe exists.** `intervals.icu` carries exactly four numbers per
night — duration, restingHR, hrv, Garmin's score — and **structurally cannot**
carry bed/wake, stages or continuity. Garmin's partner API never sends it sleep
onset/offset; intervals' own forum says so. Don't re-investigate it.

**The route.** `api/_garmin.js` (a free `_` helper — the 12-function ceiling is
untouched) exchanges a long-lived OAuth1 token for a bearer and reads Garmin's
`dailySleepData`. `publishSleepInbox()` in `run-reminders.js` is the **single
writer** of `sleep:inbox`; precedence is field-by-field, Garmin > intervals >
already-delivered, a null never erases a real value, and an empty read is never
published over a good snapshot. The intervals leg stays as the fallback. Steady
state is ONE request per tick (today only) — older days are fetched solely to
fill a gap, because Garmin needs one request per day and that endpoint is not
ours to hammer.

**No password on the server.** `tests/garmin-probe.js` is run once on the Mac
(prompts, hides input, refuses placeholder values because Garmin locks accounts
after repeated failures); its OAuth1 token goes into Vercel as
`GARMIN_OAUTH1_TOKEN` / `GARMIN_OAUTH1_SECRET` (+ optional `GARMIN_DISPLAY_NAME`).
`tests/garmin-probe-out/` is gitignored — it holds a live credential and her raw
health data.

⚠️ **Garmin's window is DETECTED SLEEP, not time in bed.** On her 2026-07-22
night `sleepEnd − sleepStart` and `sleepTimeSeconds` were both 24420s with
`awakeSleepSeconds` 0. Feed that to efficiency and it reads **100% every night by
construction** — exactly the flattery `sleep.html` was rebuilt in July to stop.
So the START of time-in-bed is only ever what she types; only the END may come
from the watch. Which makes her bedtime worth MORE, not less: lights-out plus the
watch's measured onset yields **measured latency**, the one number neither side
has alone (guarded to 0–180 min). `midMin()` prefers measured onset/offset, so
Timing scores itself. Garmin's own `sleepScore` stays quarantined as
`garminScore`: displayed once, labelled as theirs, never in her score.

**Gotchas that cost time here, in the order they bit:**
- `*TimestampLocal` are epoch-ms **already shifted** into her timezone — read
  them with UTC getters or 00:39 renders as 03:39 on a UTC server.
- `activityLevel` 0=deep 1=light 2=rem 3=awake, **proven** by summing segments
  against the DTO totals, never assumed.
- **Vercel stores env values literally.** A pasted quote character becomes part
  of the HMAC and yields `exchange 401`, which looks exactly like an IP block.
  `?garmin=diag` fingerprints the env values (length + SHA prefix, never the
  secret) and tells a bad paste (401) from a refused IP (403/429). Vercel's IP is
  **not** blocked.
- The drain compares `stages`/`hypno` by **JSON shape** — `!==` on an object is
  always true and would flush + re-render forever.
- `sleep.html` nudges `?icu=1` itself (throttled to 15 min). Without it the
  courier only ran on the hourly cron and when `run.html` opened, so opening only
  the sleep page read a stale row. The daily Vercel cron does **not** cover it:
  `?backup=auto` returns before the courier runs.

⏳ **Garmin retires OAuth1 on 2026-12-31.** Successor is an iPhone → Apple Health
Shortcut (Garmin Connect has written full sleep stages to Apple Health since Dec
2024). The item shape is deliberately source-agnostic, so only the courier
changes — page, merge and tests carry over untouched.

**Needs Alex, not code**
- Connect Garmin directly on `intervals.icu` and remove Strava. Still blocks her
  RUN auto-import (sleep no longer depends on it); the marathon is 8 Nov 2026.
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
- Supplement **refill/supply intelligence** on `supps.html` (Phase 3, not built):
  opt-in bottle count → days-left from real adherence → "Magnesium: ~6 days left,
  reorder." The running-low flag (`stack:low`) already exists to hang it on.

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
for f in tests/*.js; do node "$f"; done   # 10 suites, 2,382 assertions
./smoke-test.sh                            # MUST pass before every push
```

`smoke-test.sh` parses every JS file and inline `<script>`, checks every local
link resolves, bans `on_conflict=key`, and fails if a synced key is missing from
`BUNDLES`. It skips `tests/garmin-probe-out/` (pages Garmin served US — foreign
markup, never deployed) and chokes on a `#!` shebang, so don't add one.

`tests/garmin-probe.js` lives in `tests/` but is an interactive **tool**, not a
suite: run it directly to re-issue Chrissie's Garmin token. It exits quietly
when stdin isn't a TTY so the loop above doesn't hang waiting for a password.

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

⚠️ **`--disable-gpu` silently kills WebGL**, so the shoe stage renders as an empty
canvas and the page looks broken when it isn't. To shoot anything using the GPU,
swap that flag for software rendering:

```bash
  --use-angle=swiftshader --enable-unsafe-swiftshader
```

**Looking at generative graphics is not optional.** The shoe took six rounds of
render-screenshot-`Read`-the-PNG before it was worth shipping, and every round
caught something the tests could not see: tread hanging below the sole, a heel
that read as mush, inverted lighting, a shoe flattened into a ribbon. Assert the
geometry is finite in a test; then *look at it*.

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
