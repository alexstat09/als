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
| AI | **FREE only**, all behind `api/_model.js`: Groq for `text`/`vision`/`web`, **Gemini for `video`** (the only provider that can watch a YouTube URL). **Never Anthropic, never a paid key.** |
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

- Roles: `text` (`gpt-oss-120b` → `qwen3.6-27b` → `llama-3.3-70b`), `vision`
  (`qwen3.6-27b`, the only image model, and it is PREVIEW with no fallback),
  and **`video`** — the one role that is NOT Groq. It goes to Gemini
  (`gemini-3.6-flash` → `3.5-flash` → `3.5-flash-lite`) via `watch()`, because
  it is the only provider that can ingest a YouTube URL rather than read text
  about it. Needs `GEMINI_API_KEY`. ⚠️ A **200 with no text** is `truncated` or
  `empty`, never an empty answer — Gemini bills thinking against the output
  budget, so this is the gpt-oss trap wearing another provider's clothes.
- ⚠️ **`watch()` has three settings that are load-bearing, not tuning.**
  `thinkingLevel:'low'` (Gemini 3 defaults to **high**, which alone blew the
  60s function cap), `mediaResolution: LOW` and `fps: 0.2` (~100 → ~45 tokens
  per second of video; the argument is in the AUDIO, which is billed flat).
  It also takes `clip:{start,end}` — that is what makes a long video
  several requests instead of one impossible one.
- ⚠️ **Its retry policy is Gemini's, not Groq's — see hard constraint 21.**
  One shared deadline envelope (`GEM_DEADLINE_MS`, 48s inside the platform's
  60), a per-model overload predicate, and no two retry reasons sharing a flag.
- `llama-3.3-70b` dies **16/08/26**.
- API: `json(role, payload)` → `{ok, obj, raw, model}`, `stream(role, payload)`.
- ⚠️ **`gpt-oss-120b` counts hidden reasoning inside `max_tokens`.** A long call
  returns EMPTY, not an error. Use `reasoning:'low'` plus chunking.
- ⚠️ **`response_format: json_object` is a VALIDATOR, not a hint.** If the
  model's output isn't valid JSON — usually truncated, because reasoning tokens
  eat the same budget — Groq rejects the **whole call with a 400** instead of
  returning what it produced. This took BOTH photo paths down at once and read
  as "the vision model is dead" when the model was fine. `json()` now retries
  the same model once with `response_format` stripped and rescues the object
  via `parse()`, accepting it only if an object actually comes back
  (als-v419). **Budget generously for JSON calls** and, when a Groq endpoint
  400s, read the upstream message before touching the prompt.
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
- **Never load ANY load-bearing dependency from an external CDN.** The SW never
  caches cross-origin (see the `sw.js` header), so one flaky load leaves the
  global undefined and the feature dies **silently**. It has now happened
  twice: the Supabase client from jsdelivr left `window.supabase` undefined →
  topbar's login gate failed **open** and `sync.js` no-opped (vendored
  **als-v402**); and `html5-qrcode` from unpkg left the barcode scanner's
  `if (!window.Html5Qrcode) return;` doing nothing at all, which is a large
  part of why "most barcodes don't scan" (vendored **als-v413**). Vendor it
  into `vendor/`, add it to SW `CORE`, and never write a guard that returns
  silently when a library is missing — say it's missing.
- **The stranded banner tells the truth AND the cause** (`als-sync-status.js`):
  `fail(name, detail)` carries the HTTP status, so it prints
  `gym & weigh-ins · HTTP 401` (stored in `als:sync-errd`, cleared on `ok()`). A
  stuck engine is **usually a stale session** — cached reads still render so the
  page looks fine while writes 401; the fix is re-login.
- ⭐ **A DESTRUCTIVE ACK MAY ONLY FOLLOW A CONFIRMED CLOUD WRITE.** Same rule as
  `lastJson`, one level up. `run.html`'s watch-inbox drain acked on a plain
  `persist()`; the ack makes the server prune the FIT bytes *and* keep the
  activity marked done upstream, so a failed push left the run in exactly one
  localStorage with the only other copy already deleted (als-v424). If a local
  write triggers something irreversible elsewhere, **read the row back and find
  the record before you let go of the source.**
- ⭐ **Never DECIDE WHOSE ACCOUNT THIS IS by guessing, and never collapse "I
  cannot tell" into an account.** Use the session's `user.id`, and *wait* for it
  (~12s — a cold PWA start beats topbar.js/sync.js). ⚠️ **Do not parse
  `sb-*-auth-token` out of localStorage**: supabase-js chunks a large session
  across `.0`/`.1` and neither fragment is valid JSON, so the check fails on
  exactly the devices with the most state. A wrong answer here renders the other
  person's data, plausibly, with no error (als-v424).
- ⭐ **Deleting from a synced store must go through the page's normal save.**
  `sync.js` intercepts `localStorage.setItem`/`removeItem` and diffs the old
  value against the new one to stamp **deletion tombstones**; arrays merge by
  UNION, so anything removed without a tombstone is simply re-added from the
  cloud on the next pull. Clearing a key by hand (console, `localStorage.clear`,
  a bulk wipe that bypasses the store) therefore looks like it worked and
  silently undoes itself. `ALSSync.drop(key, id)` forces one explicitly.
- `sync.js` merges any object child named **`logs`** with `Math.max`, so a
  counter cannot decrease unless every write stamps `_ts`.
- Every synced key must be known to `BUNDLES` in `backup.html` or it syncs fine
  and is silently **unrestorable**. `smoke-test.sh` enforces this.
- Device-local by design (never synced, excluded from the vault): `gcal:*`,
  `improve:paused` (pausing the Library's reader on the laptop must not stop the
  phone, but it must survive a reload or reopening restarts the flood),
  `nut:streakfix` (a once-per-device repair flag, like `bible:seedv`).
- ⭐ **A DEFAULT IS NOT DATA. Never seed a store from a render.** `nut:streak`
  carries Alex's real MyFitnessPal streak, carried over at 788 on 6 Jul 2026.
  The seed sat inside `getStreak()` — which *renders* — and it **wrote**: any
  paint before the cloud pull landed found the key absent, wrote the default
  back with a **fresh `_ts`**, and beat the real count under whole-object LWW.
  His streak fell **796 → 790** that way (als-v436), and 790 is exactly
  788 + 2. A reader must never write, a seed belongs behind a device-local
  flag or nowhere at all, and "I have not read it yet" must never be resolved
  into "there is nothing here" — constraint 10 with a write on the end.

### Auth / security
`api/_auth.js` gates endpoints (same-origin + rate limit + cron secret). RLS and
service-role are live. Rows are keyed `(user_id, key)` — **never hardcode "Alex",
never write an unowned row.**

---

## 3 · Hard constraints

Violating any of these breaks production or loses data.

1. **≤12 routed `api/*.js`.** All 12 slots are full.
2. **Bump `CACHE` in `sw.js:15` on every deploy.** Currently `als-v439`. Never
   move it backwards.
3. **`on_conflict=user_id,key`.** Never `key` alone.
4. **Modals:** native `<dialog>` + `showModal()`, or the `als-dialog.js` helpers
   (`ALSConfirm` / `ALSAlert` / `ALSPrompt`). An ancestor `transform` breaks
   `position:fixed`, so hand-rolled overlays render off-frame. Two more ways a
   styled `<dialog>` bites, both found by LOOKING, both invisible to assertions:
   a page-level `*{margin:0}` kills the UA's `dialog{margin:auto}` centering
   (§5, als-v408), and **`display` must be scoped to `[open]`** — a bare
   `dialog.x{display:flex}` beats `dialog:not([open]){display:none}` and leaves
   the modal permanently on screen (als-v431).
5. **A week is Mon–Sun:** `(d.getDay()+6)%7`. Settled, do not re-litigate.
6. **Bucket `nut:logs` by `dateKey`** (the day the food is FOR), never `ts`.
7. **Never rename, merge, or delete** an existing exercise id or one of his foods.
8. **Never run a sync script in a render harness.** It writes to live Supabase.
   Strip every `<script>` first, then delete the artifact.
9. **Free AI only.** No paid keys, no OAuth secrets in the repo.
10. **Silent-empty is this project's disease.** "No data" and "we failed to read
    it" must never render the same way. Use `lsGet/lsSet/lsRem`; never
    monkey-patch `localStorage` (it breaks Safari).
11. **Deleting from a synced store goes through the page's normal save.** A key
    cleared behind `sync.js`'s back leaves no tombstone, and arrays merge by
    union — so it looks like it worked and syncs straight back (§2).
12. **A class you toggle from JS must exist in CSS — grep it.** `.hidden` was
    toggled on Home's arc band for two versions and defined nowhere (`aurora.css`
    is that page's only stylesheet). The "new chapter" badge was permanently lit
    and a failed read drew an empty band. A no-op class fails silently, which is
    silent-empty wearing a different hat.
13. **A SCROLLING flex child never gets `flex: 1` when the container's height is
    indefinite.** `flex: 1` is `flex: 1 1 0%`; against a container with only a
    `max-height`, Chrome resolves that basis from content and looks perfect while
    **iOS Safari collapses the item to ZERO height.** The caffeine log sheet drew
    a header, a search box, chips and a footer with **no drinks at all** on his
    phone — through a green suite and a clean desktop render (als-v432). Use
    `flex: 1 1 auto` plus the item's own `min-height` and `max-height`. This is
    also constraint 10 in disguise: the empty pane rendered *silently*, so "no
    search results" and "the list failed to build" must say different things.
14. **A local must never share a name with a helper it might call.** This has now
    bitten twice. `var` is **function**-scoped, so a `var` inside a single
    `switch` case shadows that name for the WHOLE function: `var tk` in one case
    of `home-live.js`'s `metric()` made `tk()` unavailable on its first line and
    silently reverted **every tile on the home screen** to demo values for two
    weeks (als-v433). `caffeine.html`'s `loadSleep()` declared `const logs` over
    the module-level `logs` and got away with it. **Before adding a local to a
    long function, grep the enclosing scope for that name** — especially the
    short ones these files are full of (`ls`, `tk`, `t`, `logs`, `href`, `cap`,
    `render`, `esc`). Where a function has a helper set, pin it with a test like
    `tests/home-tiles.test.js`'s shadowing guard.
15. **A guarantee that holds on one code path must hold on its TWIN.** A rule
    enforced in one place and not the other is not a rule, it is a coincidence
    with a good reputation. The Library's TikTok reader graded, grounded and
    carried receipts from the day it shipped; its YouTube reader did none of the
    three for two versions, so **every** YouTube video in the library wore the
    LESSON badge and its key points were never checked (als-v434). Nobody
    noticed because the honest half was the one being talked about. **When you
    add a guarantee to a reader, a writer or a validator, grep for every sibling
    that makes the same promise to the user and either port it or make the
    difference visible on screen.** Two prompts that must agree also must not be
    two copies: `_youtube.js` now `require`s the shelves from `_tiktok.js`,
    because two copies of a taxonomy is two taxonomies with a delay.
16. **A store is written by the page that OWNS it.** Writing another page's key
    from here is a silent no-op with a delayed loss: this page's `sync.js`
    engine does not match that key, so the write never pushes and leaves no
    tombstone, and the owning page later pushes its own copy straight over it.
    Anything that has to reach another page leaves through a **LINK**, and that
    page creates the row through its own save path — `improve.html` sends an
    adopted habit to `identity.html?habit=…`, which calls its own `addHabit()`
    and clears the query with `replaceState` so a refresh cannot add it twice.
    A page that needs its own outbox gets its own key (`improve:actions`).
17. **Never wrap a storage write in an empty `catch`.** `localStorage` throws
    `QuotaExceededError` on a full device, and swallowing it makes a failed save
    look exactly like a successful one — the UI paints, the work continues, and
    nothing is stored. `improve.html` shipped that for its whole life while
    caching transcripts of up to 9,000 characters each (als-v434). This is
    constraint 10 with a fuse: **catch it, report it in words, and keep saying
    so for as long as it is true.**
18. **An ANIMATION can make an ancestor a containing block, and a fill mode
    makes it permanent.** Constraint 4 says an ancestor `transform` breaks
    `position: fixed`. The trap is that the ancestor does not need a transform
    *property* — an animation that touches `transform` is enough while it runs,
    and `animation-fill-mode: both`/`forwards` keeps it applied **forever**,
    even when the value it settles on is `none`. `topbar.js` puts a page-entrance
    animation on **`<body>` itself**, so for as long as that rule ended in
    `both`, every `position: fixed; bottom: 0` child in the app was laid out
    against the **body box** rather than the viewport. On Home that box is about
    5,000px tall: the bottom bar was never pinned to the foot of the screen, it
    was parked at the foot of the **document**, seven screens down. Alex reported
    it as *"even if i am at the top its visible at the bottom"* and it had been
    true for as long as the bar existed (fixed **als-v438**). **Grep for a fill
    mode on any animation that touches `transform` on `html`, `body`, or a page
    wrapper**, and when something fixed is in the wrong place, measure its
    `getBoundingClientRect().top` against `innerHeight` before touching its CSS —
    the rule usually looks perfect, because the rule usually *is* perfect.
19. **Never build a regex out of a string in a render harness — and never let
    the guard share the builder with the thing it guards.** The constraint-8
    strip that removes sync scripts before a harness renders was built with
    `new RegExp(name.replace(...))`, the escaping was wrong by one backslash, and
    the assertion that was supposed to catch a survivor **used the same broken
    escaping** — so it passed while `supabase.min.js` and `pocoach-sync.js` both
    loaded and a live 401 pull went out (als-v438). Plain string containment
    only. And note what no static strip can ever catch: **`topbar.js` CREATES a
    `<script>` for `pocoach-sync.js` at runtime**, so any harness that keeps
    `topbar.js` runs a sync engine unless the harness also blocks dynamically
    inserted scripts. The working harness is described in §5.
    ⚠️ **The needle must be the `src=` CONTEXT, not the bare filename.** A plain
    string ban on `sync.js` trips on the words *"sync.js's mergeArray"* in a
    **code comment** — `nutrition.html` has several. A guard that cries wolf is
    a guard somebody loosens, which is how the broken one above survived. Ban
    `src="sync.js` / `src='sync.js` (als-v439).

20. **Anything that rewrites `ts` on an EXISTING log entry must preserve `ts0`
    first.** These two facts are coupled and the second only exists because of
    the first: `sync.js`'s `mergeArray` settles a same-id conflict on the
    **newer `ts`** with a **tie to local**, so any edit that must reach a second
    device has to move `ts` — otherwise the other device keeps its own stale
    copy forever and pushes it back. But `nutrition.html`'s `pruneDupes` deletes
    entries matching on name/grams/macros within a **15-minute `ts` window**, so
    a bulk rewrite lands every touched entry on the same instant and two
    genuinely separate identical portions (an egg at 08:00, another at 12:00)
    become an "accidental double-add" and **one is silently deleted**. `ts0`
    holds when the food was actually LOGGED and the pruner judges on
    `ts0 || ts`; the fallback keeps every pre-`ts0` entry behaving as before.
    This was **already live in `moveEntries`** before the meal groups that
    exposed it — "move all of Lunch to Dinner" could eat a real portion
    (als-v439). Generally: **a timestamp doing double duty as both a sync
    tiebreaker and a business-logic window is a latent data loss.** Separate
    them before adding the third caller.

21. **A RETRY POLICY IS PER-PROVIDER. Never reuse one provider's
    fall-through rule for another, and never let two retry reasons share a
    counter.** `shouldFallThrough()` is correct for Groq, where a 5xx means the
    whole platform is unwell and walking the chain makes it worse. **Google's
    503 is per-MODEL** — "this model is experiencing high demand" on
    `gemini-3.6-flash` says nothing about `3.5-flash-lite`. Reusing Groq's
    predicate meant the recap gave up instantly on the one failure a fallback
    chain exists for, and **the other two models were never tried** (als-v441).
    Three coupled rules came out of fixing it, and each was a live bug:
    - Give the new provider its **own predicate** (`isOverloaded()` /
      `geminiFallThrough()`); do not bend the shared one, because four other
      callers depend on its old meaning.
    - **Two reasons to retry the same model must not share a flag.** The
      overload retry first reused the config-trim counter, so it went out with
      the config already trimmed — discarding `thinkingLevel:'low'`, the single
      setting that makes the call fit in 60s. It would have retried its way
      into the timeout it existed to avoid.
    - ⭐ **A deadline across a retry chain is ONE shared envelope, never a
      per-attempt timeout.** The moment the chain actually walked, three models
      × 48s became 144 seconds against a 60-second function: the fix for the
      overload would have *guaranteed* the 504 it was meant to prevent. Pass
      what REMAINS (`left()`) to every attempt, and never start one that cannot
      finish. And distinguish THEIR capacity (`overloaded`, clears in a minute)
      from OUR quota (`rate`, lasts a day) — they need different sentences.

22. **A scroll region whose bottom starts off-screen must NEVER carry
    `overscroll-behavior: contain`.** `improve.html`'s detail pane is
    `max-height: 100dvh − 96px` inside a `position: sticky; top: 74px` column,
    but it begins ~216px down the page — so its bottom sits ~120px **below the
    fold until the PAGE scrolls** and the sticky pins. `contain` blocks exactly
    that chaining, so the wheel scrolled the pane's own content to its end and
    then stopped dead: the page never moved, the sticky never pinned, and the
    last 120px — holding *Mark watched* and *Remove* — was unreachable
    (als-v443). Alex reported it as *"on some videos it doesn't let me scroll to
    the very end"*, and **"some" was the diagnosis**: a box with no scroll range
    chains anyway, so it only bit when the content overflowed.
    Also settled there, so nobody re-derives it: use **`100dvh`, not `100vh`**
    (on iOS `vh` counts the retracted toolbar and hides the same buttons); a
    fixed bottom sheet needs `env(safe-area-inset-bottom)` or its last row is
    untappable; and a **`min-height` on the sibling column does NOT** recover
    the residual 30px of sticky clipping — measured and reverted, because at
    maximum page scroll the containing block ends `100dvh − 126px` from the top
    **regardless of row height**.

---

## 4 · What is built

Everything on the original review list is shipped. All 34 live pages carry the
Elevated MÉTRON design (`aurora.css`).

**Body & training** — `gym.html` (246 seeded exercises, templates, folders),
`body.html`, `measure.html`, `pr.html`,
`weight.html` — weigh-ins, rebuilt als-v422/423 (§5). The page's argument is that
his 0.335 kg of daily noise is not the signal: the **7-day trend is the hero
line**, each morning hangs off it as scatter, the y-axis never zooms tighter than
3 kg, his 72 kg goal is drawn, and a rate is only called a direction when it
exceeds its own standard error. Logging is a ritual (steppers + live sanity
feedback) rather than a form,
`sleep.html` (score is MEASURED only; feelings are an outcome, never an input —
and for Chrissie it now draws her watch's whole night: measured window,
hypnogram, stage split, continuity, overnight body. Three states that must LOOK
different: no measurement renders nothing, a duration with no window says so in
words, a full night draws the timeline. For Alex, a **My protocol** section
(als-v396) carries a read-only wake-time **anchor tracker** — last 14 nights vs
his 10:00 target, a ±30-min band, drift status, streak — over a collapsible
playbook),
`caffeine.html` — rebuilt als-v431/432 as **one continuous day** rather than a
form and three lists (§5): the energy curve IS the page, his drinks sit on it as
points of light, and the drink library is Greek-first and metric.
`po-water.html`, and `supps.html` — the **one** supplement page
(als-v401): a timing timeline tuned to Alex's real routine (morning ~10–11 AM,
afternoon ~5–6 PM, night ~11 PM — not the old generic 7–10 / 12–2 / 9–11), a
**streak + 14-day per-supplement consistency** memory (computed from the
never-pruned `stack:taken:*` history, zero backend), a native-`<dialog>` **"Manage
your stack"** modal (74-entry library, add/edit/delete, window reassignment,
running-low → shown as a "Low" badge), and **window push nudges** (§5).
`health.html` was folded into it and is now a redirect; water is `po-water.html`
only.

**Food** — `nutrition.html`. Finding a food is **one pipeline behind one
button** (als-v413→419, §5): it decides what KIND of food you typed, then a
packaged product is looked up and verified against real labels while a cooked
dish is costed from its ingredients against the verified core DB. Every answer
carries its receipts — the source, whether it was label-verified or estimated,
and a reason whenever confidence drops. Photographing the nutrition label is
the exact path when nothing has it. Plus photo macros, food search, per-piece weight
guard (`unitOK()`, the 111g-Oreo fix), favourites, streaks.
**A meal is one thing, not three rows** (als-v439, §5): foods logged together
carry `grp` / `grpName` / `grpOf` — a fresh `grp` per LOGGING — and the diary
draws them as ONE row that opens to its ingredients. Any slot with ≥2 foods
offers `+ Save these 3 as one meal` right there in the diary, which both stores
the reusable meal in `nut:meals` and groups what he just named. Entries without
`grp` are ordinary foods and render exactly as they always have, so nothing
needed migrating. `nut:mealDraft` (a half-built meal) is **device-local, never
synced**. ⚠️ The `ts`/`ts0` rule that makes this safe is **constraint 20** —
read it before touching any entry's timestamp.

**Mind & life** — `main.html` (outcome goals auto-tracked from workouts, weight,
nutrition, films, runs), `coach.html` (weekly Focus Loop with memory, grades
last week against real data, deterministic Nova briefing), `insights.html`
(Welch t-test hypothesis engine, three states: confirmed / ruled-out / watching,
weekly memory), `arc.html` (chapters; on Home the arc rests as a one-line rail
under the dateline and expands to the full band only for the three days after a
chapter turns, so nothing outranks the greeting on an ordinary day),
`improve.html` — **the Library** (§5): a laptop-first three-pane shell over four
worlds, YouTube · TikTok · **The Room** · Habits, filed onto **nine fixed
shelves** (Faith · Mind · Body · Food · Money · World · Sport · Sound · Laughs).
**Both readers grade before they summarise** (als-v434): a saved video is either
a *lesson* whose key points are checked against the material — each one able to
show the sentence it came from — or a *keepsake* naming what the video is. It is
never a fabricated summary, and a card always says what it was read FROM
(a transcript, on-screen text, a chapter list, a description, or only a title).
⚠️ **YouTube has no transcript and never will** — its caption endpoint is locked
— so a YouTube lesson rests on the creator's own description and says so.
⭐ **THE RECAP (als-v440→443) is the way around that**: a button on any YouTube
video hands its URL to **Gemini**, which watches the real thing, and returns a
full reading page — opening, sections in the video's own order, and the hard
specifics — shown in its own full-screen `<dialog>`. Grade `watched`; once one
exists it **replaces** the description-written key points on the card and they
fold away. On demand, never swept, because it costs real quota.
**A video over 25 minutes is watched in PARTS** — the server returns a plan of
15-minute slices, the *page* walks them, each part is saved as it lands so a
retry resumes, and a final call composes them into one page. See §5.
**The Room** is the archive read as a page rather than a grid: every grounded
CORE line by shelf, what is due for recall (3/7/21/60/150 days), and the
practice list that the `DO:` lines feed via `improve:actions`, `movies.html`
(Letterboxd + TMDB, real recommendations), `ideas.html`, `identity.html`,
`planner.html`, `finance.html` (rebuilt as **Money** for €1000 cash, no income),
and `scripture.html` — a Bible reading tracker. Alex reads *Η Εικονογραφημένη
Αγία Γραφή* (illustrated demotic-Greek Bible) **by page, not chapter:verse**, and
reflects with the **S.O.A.P.** method (Scripture/Observation/Application/Prayer).
So the canon of his exact copy is encoded from its contents pages (66 books, the
start page of each) and a typed page range **auto-names its book**. Finish-the-
Bible North Star (% of 1,721 pages), a canon map (all 66 books, filled by
read-fraction, current book pulses, tap-to-filter), the S.O.A.P. journal, streak
+ Mon–Sun week. His notebook history + the 4 finished Gospels are seeded. Synced
via appKey `scripture` / key `bible:sessions`; reachable from Home → Life.

**Study** — `arxaia.html`, `istoria.html`, and `study.html` (the Πανελλήνιες
command center «Η Χρονιά»; see §5 — live but its direction has pivoted to Notion).

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

**HEAD is `als-v443` — THE RECAP: the Library can finally WATCH a video**
(2026-07-30; **23 suites** + smoke green; `tests/recap.test.js` = 230 assertions).
⚠️ **Read "the 504 it shipped with" below before touching anything timing-related.**
His brief, and the diagnosis was inside it: *"i dont like the key points it
provides, too vague, not that much good tbh… have like something i can press
inside the video i just watched that makes it read the video and truly say
anything that should stick to my brain, but very nice and organized in a nice
text page."* Then, on what the page is for: *"i watch a video, i look at the
recap, i remember, and whenever i feel like i need a refresh, i rewatch the
recap and it has everything i need to remember from the video, not tiny
pieces."*

### ⭐⭐ It was never a prompt problem — the reader had never heard the video
YouTube's caption endpoint is locked, so every "lesson" this page has ever
written was a summary of the creator's **description** — marketing copy. A
model given marketing copy and asked what should stick can only produce
something safely true of any video on the subject. That is the vagueness he
rejected, and no rewording of `DISTILL_SYS` could have fixed it.

**Gemini takes a YouTube URL directly** and ingests the real audio and frames.
Google owns YouTube, so there is nothing to scrape and nothing to break.
- **`_model.js` has a fourth role, `video`**, and it is the only one that is
  not Groq: `gemini-3.6-flash → 3.5-flash → 3.5-flash-lite`. Callers still
  name a ROLE and never learn which company answered.
- Two silent failures are handled in `watch()` rather than left to callers:
  `mediaResolution` is a newer generationConfig field, so a 400 retries the
  **same model** with the config trimmed (falling through the chain would burn
  every model for a field none of them take); and a **200 with no text** is
  `truncated` or `empty`, never an empty recap — these are thinking models and
  thinking is billed against the output budget, the gpt-oss trap in another
  provider's clothes.
- Low media resolution: **~100 tokens/sec of video instead of ~300**. For a
  talking video the value is in what is said, and it is what makes an hour
  affordable. Free tier = **8 hours of YouTube a day**, public videos only.
- **On demand, never swept.** An hour of video is a real slice of the day's
  quota; sweeping 46 videos would spend it on ones he never watched. A test
  asserts the sweep body cannot reach it.

### ⚠️⚠️ The honesty limit, stated once and enforced in the UI
`groundKeys()` is deliberately **NOT** called on this path, and its absence is
the point. Grounding checks a claim's names and numbers against the MATERIAL
it was built from — and here the material is the video, which we never
receive. There is no haystack on this side of the wire.
The tempting fix, asking for verbatim quotes as receipts, is exactly the
failure receipts were built to catch: a model that will invent a fact will
invent the quote supporting it. So instead there is a new grade **`watched`**
with its own SRC line that says what actually happened and claims no check
that did not. A recap badge outranks every other badge because it is the only
one making a claim about the **source** rather than about a reading.

### What shipped
- `?ytrecap` on the courier (no 13th function). Every failure names itself —
  "public videos only" and "the daily quota is spent" need different actions.
- **A reading view, not a panel**: full-screen native `<dialog>`, one centred
  measure, serif body, an opening, sections in the video's own order, and a
  **Worth keeping** block of hard specifics, because names and dates fade
  first. Opening it stamps `revisitTs` — reading it IS revisiting it.
- **The Room gained "The pages you keep"** — his sentence describes a place he
  comes back to, and the wall is for finding what to watch, not re-reading.
- Stored **on the video** in `improve:videos`: already synced, already in
  BUNDLES, no new key (constraint 16). Search reaches it, memo signature and
  all — the omission the transcript suffered for this page's whole life.

### ⚠️ Three mistakes made building this, all worth keeping
- **`SECTION*/FACTS` inside a block comment terminated the comment** and broke
  the whole inline script. Same family as the backtick-in-a-template-literal
  bug als-v437 and als-v438 both paid for.
- ⭐ **Two of my own new assertions failed, and both were the GUARD being
  wrong** — they matched the forbidden pattern inside the *comment documenting
  it* (`dialog.rc{display:flex}`, and "sweeping 46 videos"). That is
  **constraint 19** exactly: a guard that cries wolf is a guard somebody
  loosens. The suite now strips comments and searches the sweep's actual body.
- ⭐⭐ **Three things only a screenshot caught, through 105 green assertions**:
  the meta line rendered `7/29/2026` (US month-first, on a page read in
  Greece — `whenAgo()` now); `showModal()` autofocused the ✕ so the recap
  opened wearing **Chrome's blue focus ring**, the one UA colour in a page
  with no blue in it; and `.b` never set `text-decoration`, so
  **every `<a class="b">` on this page has been underlined** beside its
  `<button>` siblings for the page's whole life. All three are pinned now.

### ⭐ ONE CARD, ONE VOICE — the follow-up pass
Both open questions were answered *"do what is best"*, and both answers were
the same answer. **A recap replaces the summary, not the action.** Showing a
recap next to the description-written key points puts a good summary and a
grey one on the same card and makes him decide which to trust every time.
- The recap moves to the TOP of the pane and the earlier reading folds into
  **"The earlier summary, from the description"** — nothing deleted, just no
  longer competing. The **DO / practice block stays visible**: a recap replaces
  a summary, it does not replace an action.
- `recapBlockHTML()` is ONE function drawn in two positions (an offer sits
  under the thin reading; a finished recap sits on top as the summary), so the
  two placements cannot drift into two components.
- ⚠️ **Four surfaces print a core, and all four had to learn this** — the tile,
  the pane, the Room row, the recall card. Two were caught only by looking at
  a render: the wall wore a **RECAP badge over "A tour of Roman history"**, and
  the pane chip two inches away still said **LESSON**. A test now counts all
  four, so a fifth surface cannot appear without somebody looking.
- **A recap is due for recall on its own** — `dueAt()` no longer requires
  `keypoints && isLesson`, which would have excluded exactly the readings most
  worth not forgetting (any video whose old points are legacy, i.e. most of
  them). `recapTs` joins the anchor; **opening** the reading view stamps
  `revisitTs`, **writing** one must not, or every recap lands already due.
- Both recall cards read the recap when there is one, or they would draw an
  empty card under a "Before you forget it" heading.
- The watched line said *"everything below"* while rendering at the FOOT of
  the pane. It points up now.

### ⭐⭐ als-v441 — THE 504 IT SHIPPED WITH, AND WHY
Alex, on the first real video: *"it said this. The server said 504."* Three
separate faults, and every one had to be fixed:
1. **THE CAUSE — Gemini 3 defaults `thinking_level` to HIGH.** On a video that
   means reasoning over the whole thing before writing a word, and the call
   comfortably outran `run-reminders.js`'s **60s** cap in `vercel.json`. A
   recap is a summarisation job, not a reasoning one — the material is already
   there, it only has to be written down well. `thinkingConfig.thinkingLevel:
   'low'` is both correct for the task and the difference between finishing
   and being killed. ⚠️ It is a Gemini-3 field and errors on anything older,
   which is what the trimmed retry already existed to survive.
2. **Vercel then answered with its own HTML gateway page**, so `r.json()` threw
   and the page had nothing. `_model.js` now holds a deadline it owns —
   `GEM_DEADLINE_MS = 48000` with an `AbortController`, inside the platform's
   60s — and returns a typed `timeout`. ⚠️ A deadline must **not** fall through
   the model chain: every model would take just as long, so we would spend
   three timeouts to report one.
3. **The page rendered the STATUS CODE as the message.** A status code is not a
   message — constraint 10 wearing a number. `recapFailMsg()` gives every
   status a real sentence, an unparseable reply stays `null` rather than
   becoming an empty success object, and the wait now shows **elapsed seconds**
   so a minute of silence never reads as a dead button.

Also added: **duration**, one cheap `contentDetails` field, so a timeout can
NAME ITS CAUSE ("it is 52 minutes long") instead of being a mystery. Unknown
duration says nothing rather than "0 minutes".
⚠️ **The 60s cap is still the ceiling on ONE request** — `maxDuration: 300`
would lift it but needs Vercel **Pro**, and on Hobby it is a deploy error, so
it was deliberately not changed. It is no longer the ceiling on video LENGTH:
als-v442 below makes a long video several requests instead of one. A test pins
the 60 the 48s deadline is set against; change them together or not at all.

### ⭐⭐ "THIS MODEL IS CURRENTLY EXPERIENCING HIGH DEMAND" — Google's 503
The second thing he hit, fixed alongside the segmenting below. **`watch()` was
reusing Groq's fall-through rule**, where a 5xx means the whole platform is
unwell and walking the chain only makes it worse. **Google's 503 is per-MODEL**
— "high demand" on `gemini-3.6-flash` says nothing about `3.5-flash-lite`,
which is older and far less contended. So the one failure a fallback chain
exists for was the one it skipped: the call returned instantly and **the other
two models were never tried.** This is now **hard constraint 21**.

- `isOverloaded()` / `geminiFallThrough()` are the video path's OWN predicates.
  The shared `shouldFallThrough()` was left alone rather than bent, because
  four other callers depend on its Groq meaning.
- A spike lasts seconds, so each model gets **one short wait and a retry**
  before we move on — six attempts across the chain, measured at 3.6s total.
- ⚠️⚠️ **THE BUG INSIDE THE FIX, and the reason constraint 21 has a second
  half:** the overload retry first reused the same `pass` counter as the
  config-trim retry, so it went out with the config **already trimmed** —
  throwing away `thinkingLevel:'low'`, the one setting that makes the call fit
  inside 60s. It would have retried its way straight into the timeout it
  existed to avoid. Two reasons to retry the same model must not share a flag.
- ⚠️⚠️ **And the budget had to become shared.** The deadline began as a
  per-fetch timeout, harmless only while the chain never walked. The moment an
  overloaded model started falling through, three models × 48s became 144
  seconds against a 60-second function — **the fix for the overload would have
  guaranteed the 504 it was meant to prevent.** `left()` now gives every
  attempt, retry and wait what REMAINS of one envelope.
- `overloaded` is its own error code, distinct from `rate`: that is OUR quota
  being spent and lasts a day; this is THEIR capacity and lasts a minute. The
  message says so and blames neither his key nor his quota.

### ⭐⭐ als-v442 — LONG VIDEOS: several ordinary requests, not one impossible one
Alex, after a 39-minute video came back *"this took too long to watch"*:
*"i want to be able to summarize at least 50 minute videos."*

**The wall was never Gemini or the video — it is that every invocation of
`run-reminders.js` is capped at 60 seconds**, and `maxDuration: 300` needs
Vercel Pro. No amount of tuning gets 50 minutes through one of those.

So a long video stops being one impossible request:
- **`videoMetadata` clips the video** (`startOffset`/`endOffset` as `{seconds}`
  objects), so each slice is watched in its own 60-second window.
- **`fps: 0.2`** — one frame per five seconds instead of the default one per
  second. The argument lives in the AUDIO, which is billed flat at 32 tok/sec
  whatever we do; frames are what cost, and this cuts that half by 5×.
- `planSegments()` cuts at **15 min** per slice, **even** (four 13-minute
  slices, never "full, full, full, and a 40-second stub"), contiguous, in
  order. ≤25 min still goes through in **ONE pass** — two calls where one will
  do is worse for coherence and worse for his quota.
- Two prompts: `RECAP_SEG_SYS` takes dense notes on a slice and is told
  **not to conclude** (it has only seen part of it); `RECAP_MERGE_SYS`
  composes the page and is told plainly it **did not see the video** and may
  use only the notes. The seams must not show.

⚠️⚠️ **THE PAGE ORCHESTRATES, NOT THE SERVER.** A server-side loop would put
every slice back inside a single invocation and rebuild the exact wall this
climbs over. A test asserts the courier's recap branch contains no such loop.

⭐ **Every finished part is persisted the moment it lands.** A part is the
expensive thing here; losing four because the fifth timed out would make a long
video worse than useless. Pressing again **resumes** — proven by driving it:
part 3 failed with a 503, and the retry requested only `[2, 3]`, merged all
four notes in order, then dropped the parts (this store has hit
`QuotaExceededError` before). `recapPartsSig` stops a re-plan from mixing notes
from two different slicings.

The wait now says **"Watching part 2 of 4"** with a bar, because a two-minute
silence is how a tab gets closed. ⚠️ `recapBusy` is an OBJECT everywhere now,
never a bare timestamp — a shape that is sometimes a number is how a render
prints NaN at somebody.

### ⭐ als-v443 — the end of the detail pane could not be reached
**The permanent rule is hard constraint 22.**
Alex: *"on some videos it doesn't let me scroll to the very end where i can
press that i watched it."* **One cause, found by measuring rather than
guessing** — and "some videos" was the clue that identified it.

`.pane` is `max-height: 100dvh − 96px` inside a `position: sticky; top: 74px`
column, but it begins ~216px down the page (below the header), so **its bottom
sits ~120px below the fold until the PAGE scrolls** and the sticky pins. The
pane carried `overscroll-behavior: contain`, which blocks scroll chaining — so
the wheel scrolled the pane's own content to its end and then **stopped dead**.
The page never moved, the sticky never pinned, and the last 120px, which is
exactly where *Mark watched* and *Remove* live, was unreachable.

It only ever bit on videos whose pane content **overflows**, because a box with
no scroll range chains anyway. That is precisely his "some videos".
Also fixed: `100vh` → `100dvh` (on iOS `vh` counts the retracted toolbar and
hides the same buttons), and the phone sheet now clears the home indicator with
`env(safe-area-inset-bottom)` — measured 48px of clearance at 393/430/820px.

⚠️ **A `min-height` on `.lb-main` does NOT fix the residual 30px of sticky
clipping at maximum page scroll — I tried it, measured it, and reverted it.**
The containing block's bottom at full scroll is `100dvh − 126px` regardless of
row height, so extra height buys nothing and costs a screenful of empty column
under a short wall. The alternatives are shrinking the pane to `100dvh − 200px`
on every screen, or living with 30px at one scroll extreme. Living with it.

### 🔴 Open — where the recap actually stands
- ✅ **`GEMINI_API_KEY` is set.** ✅ Both original open questions were answered
  *"do what is best"* and are **built** (see "one card, one voice").
- 🔴 **A long video has never completed end-to-end against the real Gemini.**
  Everything up to als-v441 he drove himself, and each failure he reported was
  real. The segmenting of als-v442 is proven by **driving the whole flow in a
  browser against a stubbed server** — plan → 4 parts → a 503 on part 3 → the
  retry requesting only `[2,3]` → merge of all four notes in order → parts
  cleaned up. What is unproven is the part only he can run: **four real
  Gemini calls of ~13 minutes each, back to back, inside his daily quota.**
  ⚠️ Watch for a slice that individually outruns 60s; if that happens the fix
  is `SEG_SECS`, not the architecture.
- 🔴 **Nothing in als-v440→443 is proven on his phone.** The reading view was
  measured at 393px and the sheet's safe-area clearance at 393/430/820, but
  headless only.
- **The quality of a merged recap is unjudged.** A one-pass recap and a
  four-part merged one are written by different prompts; only he can say
  whether the long one reads as well. If it feels stitched, the lever is
  `RECAP_MERGE_SYS`, not the segmenting.
- Untouched and still true: the TikTok half, the background distiller, and the
  nine shelves all work exactly as before — the recap is additive everywhere.

---

**Before that — `als-v439` — A MEAL IS ONE THING, NOT THREE ROWS** (2026-07-29,
`bd05c56` on `main`, pushed; 22 suites + smoke green; `tests/nut-meals.test.js`
= 48 assertions).
His brief: *"whenever i put a meal, like in a lunch and for example it contains
of 3 ingredients like tuna pasta and tomato paste… i wanna make that a meal,
make it possible."*

### The capability already existed — it was just nowhere near the thought
`nut:meals`, a full builder, and *"Save this Lunch as a meal"* have all been in
this page for versions (he has **25 seeded meals**, including one with tomato
paste in it). What did not exist was any way to reach it from where the food
actually is: he had to tap `+`, cross to the **7th of 8 tabs**, and find it
there. This is the launcher lesson again — **position beats organisation.**

- **The offer lives in the diary now.** Any slot holding ≥2 foods shows
  `+ Save these 3 as one meal`, and it disappears once the slot already *is*
  one meal. The default name is the two biggest things on the plate
  (Tuna + pasta + tomato paste → *"Pasta & Tuna"*); the prompt lists every
  ingredient and its kcal so he sees what he is naming.
- ⭐ **And a logged meal now READS as one meal** — one row, its name, total
  kcal, `3 ingredients · 265g`, that opens to the ingredients (each still
  individually editable, movable and deletable) and can be removed as a unit.
  Foods logged together carry `grp` / `grpName` / `grpOf`; **a fresh `grp` per
  LOGGING**, so the same meal twice in a day is two meals, not one six-item
  blur. Everything is additive — an entry with no `grp` renders exactly as it
  always has, so no log he has ever made needed migrating.

### ⭐⭐ The trap: making the group converge on sync can EAT a real portion
Two coupled facts, and the second only exists because of the first:

1. `sync.js`'s `mergeArray` settles a same-id conflict on the **newer `ts`** and
   gives a **tie to local**. Stamping a group without moving `ts` would let a
   second device keep its own ungrouped copy forever and push it back — the
   group would silently never propagate. So a stamp **must** rewrite `ts`.
2. Which means every stamped entry lands on the **same instant** — and
   `pruneDupes` judged "accidental double-add" on a 15-minute `ts` window plus
   an exact name/grams/macros match. Two genuinely separate identical portions
   (an egg at 08:00, another at 12:00) stamped into one meal would match on
   every field and **one would be silently deleted.**

Fix: **`ts0` carries when the food was actually LOGGED**, and `pruneDupes`
judges its window on `ts0 || ts`, never on a `ts` that something rewrote. The
fallback means every older entry behaves exactly as before.
⚠️ **This bug was already live in `moveEntries`** — it rewrites `ts` too, so
"move all of Lunch to Dinner" could already eat a duplicate portion. `moveEntries`
now carries `ts0` as well. **Anything that rewrites `ts` on an existing entry
must preserve `ts0` first.**

### Three other silent losses closed while in here
- **Editing one ingredient dropped it out of its meal.** An edit re-creates the
  row with a fresh id (`delEntry` + `addEntry`), so anything the row carried
  beyond its macros was lost. `commitDiaryAdd` now carries `grp`/`ts0` across.
- **`copyMealDay` REMAPS group ids** rather than copying them — a copy is a new
  logging, so copying the same day twice must give two meals in the diary, not
  one that silently doubles in size.
- **A half-built meal no longer dies on a stray tap.** `closeSheet()` nulls
  `editMeal`, so four ingredients used to vanish with nothing said. The draft
  persists to `nut:mealDraft` (**device-local, never synced** — it is a
  scratchpad mid-edit, not data) and the Meals tab *offers* to continue it.
  ⚠️ Written only from the sites that MUTATE the meal — never from a render,
  which is exactly how the streak got destroyed (als-v436). A test asserts
  `renderMealEditor` / `renderTab` / `groupSlot` contain no write.

### Verified by driving it, not only by asserting
48 assertions, then the real page in headless Chrome: the offer appears on a
3-food Lunch and **not** on a 1-food Breakfast, clicking it writes the saved
meal and collapses the diary to one 506 kcal row (197+297+12 — the day total is
untouched, grouping is presentation and not maths), the chevron actually
rotates (`matrix(0,1,-1,0,0,0)`), expand/collapse works, each ingredient keeps
its own ✕, the offer is gone afterwards, and deleting the group removes exactly
its three rows while Breakfast survives.
⚠️ **Found by LOOKING and invisible to all 48:** the chevron at
`rgba(--nu,.75)` / 11px was effectively invisible against the row tint. It is
`rgb(var(--nu))` / 14px now.
⚠️ **My own harness guard was wrong first** — a plain-string ban on `sync.js`
tripped on the words *"sync.js's mergeArray"* in a **code comment**. Constraint
19 says plain strings, but the needle has to be the `src=` **context**
(`src="sync.js`), or the guard cries wolf and gets loosened. `SYNC-NEUTERED`
confirmed no engine ran; nothing touched live Supabase.

🔴 **Unproven on his phone.** Driven headless only. He needs a full PWA reopen
for `als-v439`. Open questions that are his, not mine: should a logged meal open
**collapsed** by default (it currently opens expanded only for the one he just
saved), and does he want the same one-row treatment applied retroactively to the
meals he logs from the Meals tab (it already is) — or per-day totals per meal?

---

**Before that — `als-v438` — ONE CONTROL: the bar is gone, and so is the reason
nothing ever stayed pinned to the bottom** (2026-07-29, `461c1d6` on `main`,
pushed; 19 suites + smoke green; `tests/launcher.test.js` = 72 assertions, up
from 56). Alex's brief:
*"code it so its only the 'all' button there and even if i am at the top its
visible at the bottom without interfering with anything nice and smoothly, as
well as at the home page which rn doesnt have anything."*

### ⭐⭐ The finding: his second clause was a real bug, not a preference
The handoff for this work guessed that "not visible at the top" was a padding or
scroll-container problem and said to find out what before redesigning. It was
neither, and it was **worse than a navigation complaint**:

`topbar.js` puts a page-entrance animation on **`<body>` itself**, and that rule
ended in `animation-fill-mode: both`. The keyframes animate `transform`, a
filled transform animation keeps a transform applied even when it settles on
`none`, and an element with a transform is a **containing block for fixed
descendants**. So `position: fixed; bottom: 0` was resolving against the body
box — about **5,000px** on Home. **The bottom bar was never pinned to the foot
of the screen. It was parked at the foot of the DOCUMENT**, and had been for as
long as the bar existed. Measured on an 820px viewport: the control sat at
`top: 1301` before, `top: 762` after (`820 − 16 − 42`, exactly right).

The fix is deleting one word. The permanent rule is **constraint 18**; it is
constraint 4 with the ancestor being `<body>` and the transform being invisible.

### What shipped
- **The five-tab `.bottombar` is deleted**, markup and CSS. A full-width bar
  holding one control is still a bar: it reserves a strip across the foot of
  every page whatever is in it, which is the "interfering" he described. What
  survives is the floating `.alx-fab` **gym.html already had** — now on every
  page, which collapses what were TWO navigation paths into one (constraint 15
  applied to a control rather than a guarantee). It is a pill, not the bare
  circle gym had: it is the only navigation control left, so it says ALL.
- ⚠️ **`topbar.js` styles it, not `launcher.js`.** `topbar.js` creates the
  button and injects its `<style>` synchronously; `launcher.js` arrives on a
  separate deferred fetch. Once this was the only nav in the app, styling it
  from a file that has not landed meant a flash of an unstyled `<button>` on
  every page load. **The file that creates the element owns its CSS**, and the
  rule now lives in exactly one place.
- **Home's two bottom navs are down to zero.** `index.html` was hiding the
  shared bar with `#bottombar{display:none}` and drawing a private
  `<nav class="nav">` of its own — Home/Body/Mind/Money/Nova, no All button, and
  a Mind link pointing at `identity.html` while the shared bar's pointed at
  `main.html`. **That override is why he said Home "doesn't have anything"**: it
  was hiding the one control that had an All button. Both are gone, so Home can
  no longer drift from every other page, and MAP.md's long-standing
  "Mind points at two different pages" inconsistency is resolved by deletion.
- `currentPageKey()` went with the tabs it lit. Its `BODY`/`MIND`/`MONEY` lists
  were a second, drifting copy of the launcher's own grouping; the one question
  the shell still asks is `isHubPage()`, for the Back button.
- **`run.html` is the only page with no All button** — Chrissie's app, her own
  5-tab nav. `gym.html` gets the button but not the body padding, exactly as
  before.
- **"This week vs last" is deleted, and `xp.js` with it** — see below.

### The button, exactly as it stands (so nobody re-derives it)
`.alx-fab` is styled in `topbar.js`'s `css` block and built by `makeAllButton()`
in the same file. A pill: nine-dot emerald glyph + the word **ALL** in the mono
stack, `position: fixed; right: 14px; bottom: calc(16px + safe-area)`,
**79 × 42px**, `z-index: 39`, dark glass with `backdrop-filter`, a 0.24s-delayed
fade-and-rise entrance, `:active` scale 0.94. `body.has-alxfab` reserves
`calc(64px + safe-area)` — the bar's old 72px, 8px smaller — everywhere except
`gym.html`, which never carried the bar's padding and still ends clear of the
corner on its own. Home overrides that to 78px (it used to run 116px, to clear
the bar *and* its own floating nav stacked above it).

### How it was verified — and one false alarm worth remembering
Probed on `index.html`, `nutrition.html`, `gym.html` and `sleep.html` at **393px
and 1100px**: in all eight runs the button lands at `top: 762` in an 820px
viewport (`820 − 16 − 42`, i.e. genuinely pinned), `rightGap: 14`, `opacity: 1`,
mono font, and clicking it opens the launcher (`dialog.alx[open]`,
`display: flex`). Absent on `run.html`, as intended.
⚠️ **`nutrition.html` failed the first probe — `PINNED:false`, `opacity:0` — and
it was a false alarm.** That page is heavy enough that at 900ms its entrance
animation was still running and its layout had not settled. At 9,000ms of
virtual time it is identical to every other page. **Give a probe real time
before believing a failure**, and check `animationPlayState` before concluding
anything from an opacity of 0.
✅ **No collision with `.nova-fab`**, measured rather than assumed: on
`finance.html` at 393px, Nova occupies **671 → 728** and the ALL pill **762 →
804**, both at `right: 14px` — a **34px** vertical gap and no overlap. They read
as one deliberate right-hand stack. `.nova-fab`'s `bottom: 86px` was originally
chosen to clear the bar; it still works, so it was left alone.

### The last of the game layer (his second ask)
*"we didnt delete the last week vs this week xp usage thingy."* Correct —
`als-v435` kept it on the grounds that it was a measurement rather than a game.
It was not much of one: its headline **Performance** score comes from `xp.js`'s
`weekWindow()`, and **45% of that score is `goals:` to-do completion, a store he
has never used.** It reads 0 every week, so the number was **structurally capped
at 55** and could not reach the top however good the week was. A score you
cannot win is a game after all, and a worse one than the ladder, because it
looked like an instrument. Gone: the section, its CSS, `paintAgent()`,
`latestRecovery()` (its only caller), `xp.js` itself and its SW `CORE` entry.
Nothing measured there is lost — training lives on `gym.html` and in the outcome
goals on `main.html`, sleep on `sleep.html`, nutrition days on `nutrition.html`,
and `coach.html` already grades a real week against real data.
Found in passing and fixed: SW `CORE` precached `home-live.js?v=206` /
`home-motion.js?v=202` while the page requested `208`/`203`, so both precache
entries were dead weight. Realigned at `209`/`204`.

### ⚠️ Two mistakes made while building this, both worth keeping
- **I reintroduced the backtick-in-the-`css`-template-literal bug** that
  als-v437 already paid for, inside a comment explaining a different trap. It
  terminated the whole stylesheet, so `topbar.js` injected nothing and the
  button vanished from a render — which for ten minutes looked like the fix
  having failed. `smoke-test.sh` catches it; run it before believing a render.
- ⚠️⚠️ **A render harness ran a sync engine against live Supabase.** The
  constraint-8 strip built its ban regexes from strings, the escaping was wrong
  by one backslash, and **the assertion meant to catch a survivor used the same
  broken builder**, so it passed while `supabase.min.js` and `pocoach-sync.js`
  both loaded and a 401 pull went out. No write occurred (the pull failed auth
  and reads never write), but the guard was decorative. Permanent rule:
  **constraint 19.**

### ✅ The render harness that actually works (reusable)
Plain string containment, never a regex built from a name — plus the part no
static strip can catch, because **`topbar.js` creates a `<script>` for
`pocoach-sync.js` at runtime**: override `document.createElement` in the harness
so any script whose `src` matches `/sync|supabase/i` is dropped, and log each
block. On this run it caught **three** (`als-sync-status.js`, `sync.js`,
`pocoach-sync.js`) that the strip could never have seen. Keep the harness in the
scratchpad and point at the repo with `<base href="file://…/als/">` plus
`--allow-file-access-from-files`, so the repo is never written to at all.
⚠️ The headless shell screenshots the **full page**, which expands the viewport
and puts a `position: fixed` element somewhere useless. **Measure with a probe
script** (`getBoundingClientRect().top` vs `innerHeight`) rather than trusting a
screenshot, and shorten the page if you want to *see* it in place.

### ⭐ Open — what to pick up next
- 🔴 **Unproven on his phone.** Driven headless only, on every page listed above.
  He was asked to fully reopen the PWA so the new service worker lands and then
  say whether the pill sits where he wants it. **His answer is the next input;
  do not redesign it before he replies.**
- **Two changes already offered, either a few lines**: centre the pill instead of
  right-aligning it, or drop the ALL label and keep the glyph alone (the shape
  `gym.html` wore before this). Both were offered in the ship reply, so if he
  says "make it centred" or "just the icon", that is what he means.
- ⚠️ `.alx-fab` is `z-index: 39`, under gym's sheets (61) and modals (71). The
  only bottom-right neighbour in the app is `.nova-fab`, which is measured clear
  above. **A new page with its own bottom-right control is the collision to
  look for**, and there is no assertion for that — it needs a probe.
- **The harness and probe scripts from this session lived in the scratchpad and
  are gone.** The recipe above is complete enough to rebuild them in a few
  minutes; do that rather than trusting a screenshot.
- Housekeeping, harmless: **`_render-check.html` (1.7MB) is an untracked local
  leftover** from the als-v433 session and still contains the old `#bottombar` /
  `has-bottombar` / `xp.js` chrome. It is not in git, so it never deploys and
  nothing reads it. Safe to delete; ignore it otherwise.
- Everything below this line is the previous session, kept for the lessons.

### als-v435 → als-v437, in order

**`als-v435` — the game layer is gone** (`569d012`). Alex: *"i dont like the
game system with the xp, i think that should be deleted, as well it takes space
on the home page at the end."*
- Deleted: `xp.js`'s **20 milestone badges** (*Hat Trick*, *Fortnight*, *Month
  Warrior*, *Flawless*, *Operator*), the four-badge grid on Home, and the
  streak chip in the "Where you stand" header.
- The chip read `goal_streak_v1`, which is `{count: 0, lastProcessedDate: ""}`
  in his device export. **The only streak Home has ever shown him was a zero he
  never earned.** `processStreak()` itself is correct; the to-do behind it is
  what is unused.
- Deleted `collectData()`, which swept the WHOLE of localStorage on every home
  load (~200 `JSON.parse` calls over his `goals:`/`po_coach_logs:` keys) to
  decide whether four icons should glow, plus `prCount()`/`sleepNights()`/
  `daysTracked()` in `home-live.js`, which had no other caller.
- **Kept: "This week vs last"** — see NEXT SESSION, he now wants it gone too.
- Home: 5,153px → 5,031px at a 393px phone width.

**`als-v436` — the nutrition streak seed was destroying the streak it existed
to preserve** (`7076b52`). The permanent rule is in **§2** ("A DEFAULT IS NOT
DATA"); the full story is in memory `als_nutrition_streak`. Short version:
- ⭐ **His streak is REAL, not a fixture.** He carried it over from
  **MyFitnessPal** — seeded 788 on **2026-07-06**, and his own logging record is
  **194 of 195 days** (1 Jan → 14 Jul), the single miss being 2 May, which sits
  *before* the seed.
- The seed lived inside `getStreak()` — **a function that renders** — and it
  **wrote**. Any paint before the cloud pull landed wrote `{count:788}` back with
  a fresh `_ts` and beat the true count under whole-object LWW. **796 → 790.**
  A streak can only rise by one or reset to one, so a *decrease* is always a bug.
- Now: `getStreak()` never writes, the seed is **deleted** rather than guarded
  (the value syncs from the cloud, so any future firing could only destroy
  something — and it would have handed Chrissie a fake 788-day streak on her
  first meal), and `repairStreak()` rebuilds the count from his own diary,
  anchored at the observed **14 Jul = 796**, behind five guards.
  `nut:streakfix` is device-local. `tests/nut-streak.test.js` = 36 assertions.
- ✅ **Confirmed live by Alex.** Do not re-open. It should read **812 on 30 Jul**
  and climb.
- ⚠️ His first report was *"still says 790"* — that was the **old cached page**,
  before the new SW landed. A full PWA reopen is part of shipping.

**`als-v437` — the launcher** (`3e1e4a5`). His brief: *"too many pages, most of
them are so many scrolls away at my phone I just forget about them."* Measured,
he was right: Home is ~5,000px at 393px, about **seven screens**, and 63% of it
is a directory of 21 tiles — while the three pages he actually reaches (water,
nutrition, sleep) are the three at **zero scroll** in the quick row. Position
beats organisation.
- `launcher.js`, injected by `topbar.js`, so it is on every page. Native
  `<dialog>` + `showModal()`.
- ⭐ **It is an INDEX, not a springboard.** A 4-across grid of 22 glyphs solves
  *reaching* a page and does nothing about *forgetting* one, which was the
  actual complaint. So: six fixed pins, then every page as a text row under
  serif group names in the accent each space already wears on Home, plus a
  **recency note** (`3d`, `4w`, `today`) — the one thing on screen able to say
  *"you have not opened this in a while."*
- ⚠️ **The recency note is deliberately NOT what `metric()` computes.**
  `metric()` gives a page's VALUE ("28 films"); this gives its AGE. Different
  questions, so it is not a second copy and the two cannot drift.
- **The pins never reorder.** A list that rearranges itself by usage cannot be
  learned. (The Library's shelf rule, applied again.)
- ⭐ **REVERTIBLE BY CONSTRUCTION**, because he asked for that explicitly: the
  launcher owns **no state** — zero storage writes, no key, nothing synced,
  nothing in BUNDLES, no network call, and the six pins are **hardcoded rather
  than stored** so the feature cannot come to own anything. `git revert 3e1e4a5`
  + an SW bump and nothing needs migrating. `tests/launcher.test.js` asserts
  every one of those so it stays true.
- One assertion **fails if any future live page is added without a launcher
  entry** — the app can no longer quietly grow pages he cannot find.

### ⚠️ Two bugs that only rendering caught (both invisible to 56 assertions)
- **"ALL" rendered in a different TYPEFACE from its four siblings.**
  `button.bottombar-tab { font: inherit }` looked like a routine reset. The
  shorthand resets `font-family`, `button.bottombar-tab` (0,1,1) outranks
  `.bottombar-tab` (0,1,0), and the label fell back to the bar's sans stack.
  **The rule now sets no font property at all** — author styles already beat the
  UA button defaults. A test pins it.
- **`"Search your pages…"` rendered as `pagesâ€¦`** when the host document
  declared no charset. Every rendered non-ASCII string in `launcher.js` is now a
  `\u` escape — which matters most for **Αρχαία / Ιστορία / Η Χρονιά**.
- And `smoke-test.sh` caught a third: a CSS comment used **backticks inside the
  `css` template literal** in `topbar.js` and terminated it. Run it. Always.

### Open on the launcher
- 🔴 **Unproven on his phone.** Driven headless only: the scroll pane measures
  598px (not the zero constraint 13 warns about), search narrows to one row and
  restores, the dialog computes `display:none` closed (the als-v431 trap), the
  field clears on close. Rendered at 393px and 1100px.
- `gym.html` has no bar of its own, so it gets a floating `.alx-fab` at
  **z-index 39** — deliberately *under* gym's own sheets (61) and modals (71).
- `run.html` was left alone on purpose: it is Chrissie's app.

**Before that — `als-v434` — THE LIBRARY'S YOUTUBE HALF WAS A FABRICATION ENGINE**
(2026-07-28, on `main`, 17 suites + smoke green; `tests/library.test.js` = 229
assertions, up from 157). Read this if the task touches the Library, **or any
feature where one code path is honest and its twin is not.**

He asked for the page to be made "1000 times better" and then for all of it,
built and pushed. The deepest finding was not a design problem.

### ⭐⭐ The cause: the lesson only ever got applied to ONE of the two worlds
`als-v426` built the TikTok reader around a rule — **classify before you
summarise** — because three of his five real favourites had nothing to teach.
`grade()` decides in code, `groundKeys()` strikes any point citing something
never said, and the card carries receipts. **None of it was ever ported to the
YouTube half**, which is the older and larger world:

- `DISTILL_SYS` emitted **no `KIND:` line**, so `isLesson()` fell through to
  `!!v.ytId` and **every YouTube video in the library was declared a LESSON,
  unconditionally** — a match, a stream, a trailer, all of them.
- It demanded `<3 to 5 of them>` — required padding — where the TikTok prompt
  says *"three real points beat five padded ones."*
- `groundKeys()` was **never called** on this path. No check at all.
- Its input is the creator's own **description** (marketing copy), plus the
  instruction *"where you must generalise, stay at a level that is safely
  true"*, and with no description it was told to work **from the title alone**.
- ⭐ `distill()` had always computed `sourced` — whether it had real material —
  and the courier did `json({ text: dout.text })`, **dropping it on the floor.**
  The one honesty signal this path produced never reached the page.

**The lesson worth carrying: a rule enforced on one code path and not its twin
is not a rule, it is a coincidence.** When a guarantee is added to one reader,
grep for every other reader that makes the same promise.

Now: `grade(meta, notes, title)` returns `notes` / `chapters` / `description`
(lesson-eligible) or `title` / `none`, the prompt declares a KIND that is read
back out of the reply, key points are grounded **against the material and not
the prompt** (an instruction in the haystack would let a fabrication cite it),
and the shelves are `require`d from `_tiktok.js` rather than restated — two
copies of a taxonomy is two taxonomies with a delay.
⚠️ There is deliberately **no `thin` grade on the YouTube side**: the page
shares one `SRC` map, and 'thin' already means "nothing was said and nothing was
written on screen", which is TikTok's sentence.

### ⚠️ A reading made before the grader existed is UNVERIFIED, not a lesson
`RVER` marks the boundary and those cards say so in amber until re-read.
**The version number alone was NOT the test, and using it alone would have been
expensive**: every TikTok predates `rver` too, and every one was already read by
the graded path — a version check by itself would have re-read his whole TikTok
wall for nothing. The real marker is the **absence of the honesty fields**
(`!v.kind && !v.grade`). Re-reads run after everything unread, **25 per pass**,
and **only replace on success** — losing a reading to fix a reading is worse
than the label it was removing.

### Other things that were quietly wrong
- ⚠️⚠️ **`persist()` swallowed QuotaExceededError with an empty catch.** A full
  device looked exactly like a successful save: wall painted, reader read on,
  nothing stored. Constraint 10 with a fuse — transcripts are capped at 9,000
  chars each. It reports now, in words, and stays on screen.
- **A starred lesson VANISHED from the Lessons shelf.** `stateOf()` returned
  `'star'`, which can never equal `'lesson'`, while the rail still counted it —
  rail said 12, wall drew 9. **Starred is a facet, not a state**; it now narrows
  whichever view is chosen.
- **`classList.toggle('live')` on `.lb-status` — a class defined NOWHERE.**
  Constraint 12, in the file that constraint was written about, a no-op for the
  page's whole life. A test fails if it returns.
- **Search never looked at the `transcript`** — the one field this library has
  that nothing else does. It also needed the query as one unbroken run
  ("faith discipline" found nothing) and did no Greek folding, so *προσευχή*
  never matched *προσευχη*. Now folded (NFD + final sigma), every term matched
  in any order, memoised per item, debounced 110ms.
- `select()` rebuilt **every tile** to move a one-pixel ring, so held `j`/`k`
  re-rendered per keypress and then scrolled a node it had just destroyed.

### What is new
- ⭐ **THE ROOM** (4th world, `rm`): the archive read as a page rather than a
  grid — every grounded CORE by shelf in canonical order, what is due for
  recall, and the practice list. No endpoint, no new data.
  ⚠️ The world pill is `calc((100% - 6px)/4)`; **that divisor and the number of
  tabs change together** or it stops covering its tab. Habits and the Room hide
  the rail via `body.no-rail` — emptying the `<aside>` was not enough, it still
  claimed a grid column.
- ⭐ **The DO line can leave the page.** It used to render in a box and die
  there; the Library was the only page that manufactures intentions and the only
  one with nowhere to put them. `improve:actions` is the outbox (synced, in
  BUNDLES). ⚠️ **It is a store this page OWNS on purpose** — writing
  `coach:focus` or `habits:list` from here would be a write to a key another
  engine owns: it would never push, would leave no tombstone, and would be
  overwritten by the owner later. **Anything crossing pages leaves through a
  LINK** — the habits world now links to `identity.html?habit=…` and *Identity*
  builds the row through its own `addHabit()`, clearing the query with
  `replaceState` so a refresh cannot add it twice.
- **Recall actually expands**: 3 → 7 → 21 → 60 → 150 days, resetting on "I'd
  forgotten it". It was one item, on a flat 5-day loop, in the empty pane that
  disappears the moment he clicks anything. ⚠️ The interval anchors on
  `Math.max(revisitTs, distilledTs)` — a re-read carries an old `revisitTs`, and
  anchoring on that alone makes a reading he has never seen due on arrival.
  ⚠️ `applyKP()` must **not** stamp `revisitTs` on a re-read, or every sweep
  silently empties the recall queue.
- **The wall shows weight it already knew**: a checked lesson from a real
  transcript spans two columns. Guard sits at 300px, not 420 — on a 393px phone
  the wall is two columns and a full-width lesson is the hierarchy working.

### ⚠️ The render harness — reusable, and it earned its keep again
A green suite said the Room was perfect. Rendering it showed **"across 6
SHELFVES"** in the side pane, from `'shelf'+(n===1?'':'ves')`. Assertions cannot
see that. There is no puppeteer in this repo, but Chrome's headless shell is on
the machine:

```
~/.cache/puppeteer/chrome-headless-shell/mac_arm-*/chrome-headless-shell-mac-arm64/chrome-headless-shell \
  --headless --disable-gpu --hide-scrollbars --window-size=1440,1300 \
  --virtual-time-budget=2500 --screenshot=out.png "file://$PWD/harness.html"
```

⚠️ **Hard constraint 8 applies and is not optional.** Build the harness by
copying the page, stripping **every** `<script src>` and neutering the
`initCloudSync(` call, then **assert both are zero before rendering** — a sync
script in a harness writes to live Supabase. Seed by injecting a `<script>` that
fills `localStorage` immediately *before* the page's own inline script (it is
not deferred). Then read `stderr` for `CONSOLE` lines: with no server, the only
expected errors are `file://` fetch failures, so anything else is real.
⚠️ Watch the masthead: `countTo()` is a 650ms entrance animation, so a
screenshot can catch the metrics mid-count and show numbers that look wrong but
are not.

### Open on this page
- 🔴 **Unproven in his browser.** 229 assertions, plus headless renders of all
  four worlds at 1440px and the wall + Room at 393px, seeded with a fixture that
  includes a legacy reading, a pending fetch and a starred lesson. No finger has
  touched it. The re-read of his existing YouTube readings will run on his first
  open — it is paced and stoppable, and nothing is replaced unless it succeeds.
- ⚠️ **The re-read costs one model call per old YouTube reading** (25 per pass).
  If he has many, the first few opens will be busy. Stop works throughout.
- Not built: a Room digest across shelves ("what do my 12 Faith videos agree
  on?") — it would be a second, ungrounded synthesis layer over already-grounded
  cores, and that needs a grounding design of its own before it ships.
- `identity.html` has a pre-existing `transition: width` on `.hb-prog-fill`
  (L60), untouched here — it belongs to that page's own polish pass.

**Before that — `als-v433` — HOME WAS SHOWING DEMO NUMBERS, NOT HIS DATA**
(2026-07-28, on `main`, 19 suites + smoke green; `tests/home-tiles.test.js` = 72
assertions). His report: *"the home page has fixated numbers, different ones of
the ones that are inside the actual pages… SOS… make sure that all my data are
intact."* He was exactly right, and it was
worse than it looked: **every tile on the home screen** had been showing the
built-in demo values since **als-v426**. Home said **78.4 kg** while
`po_coach_weights` said **70.4**; 1,840 kcal, 142 kg on the PR board, 6/8
supplements, a 12-day streak, "protein 148g · on plan" — none of it his.

### ⭐⭐ The cause: one `var` in a switch case took down the whole function
The Library commit added `case 'improve.html'` with
`var tk = ls('improve:tiktoks', [])`. **`var` hoists to the whole FUNCTION, not
the case block**, so that name shadowed the `tk()` date helper across *all* of
`metric()` — and `var t = tk()` on metric's **first line** threw
`TypeError: tk is not a function` on **every call, for every tile**. `metric()`
catches its own errors and returns `null`; `paintTile()` returns early on `null`
and leaves the markup alone. So one unlucky variable name in one case silently
reverted the entire home screen to its demo fixture, and it looked plausible
enough to survive two weeks.

**Three lessons, none of them about `tk`:**
- ⚠️ **A `var` inside a `switch` case is function-scoped.** Any case may shadow
  any sibling helper. `tests/home-tiles.test.js` now asserts that **no local in
  `metric()` shares a name with an outer helper** — that guard catches the class,
  not just this instance.
- ⚠️⚠️ **A fallback that is a plausible fiction is worse than no fallback.** The
  `try/catch` did its job — the page never broke — which is precisely why nobody
  noticed. This is constraint 10 (silent-empty) in its most expensive form: the
  failure didn't render as empty, it rendered as **someone else's life**.
- **Placeholders are now `—` everywhere on Home**, never invented values. The
  `agent` section already followed this rule and was the only part of the page
  that stayed honest through the outage — it is the pattern, not the exception.

### What changed
- `home-live.js` — the shadowing local renamed (`toks`); `paintVault()` added so
  the vault line reads real `backup:lastFile` instead of the static *"last backup
  · 2 days ago"*; the empty tile state shows `—` rather than echoing the tile's
  own `.name` (it rendered "Nutrition / Nutrition / log food").
- `index.html` — **every** authored number deleted: 13 numeric tiles, 5 text
  tiles, the readiness ring and its two sentences, the fabricated sparklines, and
  4 invented insight/forecast cards (an unmeasured sleep-to-volume correlation, a
  76.5 kg projection). Real values are injected at runtime, never authored.
- `home-motion.js` — ⚠️ **`countUp` wrote `fmt(0)` into any `.cnt` with no
  `data-to`**, turning "no value yet" into "your value is 0". It now returns
  early. A placeholder must never be formatted into a number.

### His data was never involved — and that was proven, not asserted
He opened with an SOS about it, so: this change is **read-only end to end**.
`localStorage.setItem` sites in `home-live.js` **2 → 2** (both pre-existing: the
water quick-add and the `arc:seen` stamp), and `git diff` adds **no** `setItem`,
`removeItem`, `.clear()`, or sync call in any touched file. `home-live.js` only
ever *reads* the stores the pages own. Nothing in Supabase or localStorage was
written, migrated, or renamed. The wrong numbers were painted-on fixture, never
stored state — which is also why the fix needed no data repair.

⚠️ **Diagnostic method worth reusing:** the bug was found in ~10 minutes by
slicing `metric()` out of `home-live.js` and running it in Node against
`BACKUPS/2026-07-14_device-export_538-keys.json` (538 real keys). Every tile
returned `THREW tk is not a function` in one shot. **When a surface shows the
wrong number, run its computation against the device export before reading a
single line of UI code** — and note that `metric()`'s own `try/catch` has to be
rethrown in the harness or it hides the very error you are hunting.

### Open on this page
- 🔴 **Unproven in his browser.** Verified by 72 assertions and a headless render
  seeded from his real 14 Jul device export (readiness 87, PR 294 kg leg press,
  515 runs, 9.2 h sleep, 70.4 kg all correct). No finger has touched it.
- The tiles for `scripture.html` and `study.html` have **no case in `metric()`**,
  so they stay static text. They assert nothing false, but they are the only two
  tiles that never go live. Cheap to add if he wants them.

**Before that — `als-v432`, `caffeine.html` was rebuilt as ONE CONTINUOUS DAY**
(2026-07-28, on `main`, 19 suites + smoke green; 34 assertions in the caffeine
harness). Read this first if the task touches caffeine, **any chart in this app**,
or **any scroll pane inside a flex column** — most of the lessons are not about
caffeine.

His words: *"somethings off for me… I need it premium, looking like a 1000 dollar
app, truly perfect."* He gave full authority to reshape it, with one condition:
*"just make sure that my data is always protected and never lost."* No demo — live.

### ⭐⭐ The three transferable traps

**1. `PageMotion.countUp` is an ENTRANCE animation. NEVER call it on an update.**
It only ever tweens **0 → target over 750ms, with no cancel.** The old ring
re-fired it on every `mousemove` (clearing `data-done` first to force a replay), so
scrubbing the chart spawned dozens of overlapping rAF loops writing one node — the
number snapped to 0 and raced up on every pixel of movement, while the ring lagged
on a *separate* 900ms CSS transition. **Two animation systems fighting over one
value.** This is what Alex reported. The pattern that fixes it: ONE target, ONE
displayed value, ONE rAF loop, exponential settle
(`shown += (target-shown) * (1 - 0.001^(dt/210))`), driving text and geometry
together — it counts *through* every number, 60→59→58. `countTo()` (set `data-to`,
write in place once `data-done`) was already the correct helper; the ring bypassed it.

**2. `preserveAspectRatio="none"` is why a chart looks cheap.** Same root cause as
`weight.html` (below), found independently here. A fixed `viewBox="0 0 700 140"`
stretched to whatever width the box happens to be scales x and y by **different**
factors: hour labels squashed to half-width on a phone and stretched wide on a
laptop, strokes elliptical, the `feGaussianBlur` glow smeared sideways. Measure the
host, set `viewBox` in real CSS pixels, `ResizeObserver`. ⚠️ Compare the observer
against **the width last DRAWN at** (`lastDrawnW`), never a captured local — its
first callback fires before the first paint and would kill the draw-in animation.
**Two pages have now shipped this bug. Grep for it before building any chart.**

**3. The Safari flex collapse — see constraint 13.** Cost a second deploy and was
the only thing he came back about.

### What the page is now
hero → **The Day** (arc + curve + 3 moments) → **Today's Load** → **Log** →
**Today's Timeline** → **The Week** → *Caffeine & Sleep* (conditional) → **The
Protocol**. The boxy "Smart Timing" tiles are **gone** — he said they "don't seem
nice to the eye"; their three times now annotate the curve they describe and their
detail lives in the sub lines, so nothing was dropped. The curve carries a soft
dawn/dusk night gradient, HIGH/LOW zone hairlines, the caffeine-free baseline as a
ghost line, **a pip for every drink at the minute he had it**, CUTOFF + CRASH ticks
and a floating scrub chip. Three modes kept for parity: **Curve / Lift / Hours**.
New and cheap: **"System clear"**, when the last of it actually leaves, solved on an
ABSOLUTE clock (`activeMgAbs`) so a 2:55 AM answer means tomorrow (`⁺`).

### Bugs found by RENDERING AND LOOKING — every one invisible to a green suite
- **asleep/awake switched instantly → a VERTICAL WALL** at wake and bedtime in the
  line. Now a smoothstep cross-fade over ~24 min (`EDGE_BLEND = 0.4h`); away from
  the edges the numbers are unchanged, so peak/crash/cutoff still answer the same.
- ⭐ **The crash detector never required the END of its 2h window to be awake**, so
  *falling asleep* was the biggest drop of any day and the page announced *"you'll
  crash around 11:30 PM"* — which is just bedtime. It had done this since the page
  was built. Now it finds real dips (−16 pts, not −45).
- `fmtH` wraps past 24, so a 2 PM cold brew read *"cleared 5:42 AM"* — before the
  drink. `fmtHD()` appends `⁺`.
- "TARGET" printed straight through whichever week column was tallest → the target
  line got its own 46px right-hand lane, and `.wk-v` numbers carry a text-shadow
  halo that knocks the dashed line out behind the digits.
- The night shading was clipped to the plot band, leaving a hard horizontal edge
  across the card. Full height now.
- ✅ The long-standing apostrophe bug is **fixed**: `J()` is
  `JSON.stringify(v).replace(/"/g,'&quot;')` into a **double**-quoted attribute.
  Verified against `Bob's brew`, `Coke & Rum`, `say "hi"`, `</script>`.

### The drink library is his now (als-v432)
The whole thing was 64 entries in **US ounces** — *"Monster Energy (16 oz)"* is not
something he can buy; the can in his hand says 500 ml. Now **83 entries, all metric,
Greek first**: freddo espresso μονός/διπλός, freddo cappuccino, frappé, ελληνικός,
Nescafé 3-in-1, plus Hell, Burn, 330 ml cans, Coke Zero, Pepsi Max.
⚠️ **Greek sweetness (σκέτος/μέτριος/γλυκός) changes NO caffeine** — only shot count
does, so entries are sized by shots. Renaming stock entries is data-safe: `DRINKS`
is a constant, never persisted, and his customs still sort first under "Yours".

### How data safety was PROVEN (reusable method, not a claim)
Diff every storage/read function against `git show HEAD:<page>` with comments and
whitespace normalised. **14 of 17 byte-identical**; the other three differed by a
local rename, brace style and comments, with **zero writes** in any of them.
`localStorage.setItem` sites 5 → 5, appKey `caffeine` + `syncedKeys` unchanged, and
the midnight rollup into `caf:days` pinned by a test. Do this on any redesign.
⚠️ Found in passing: the old `loadSleep()` declared `const logs` — **shadowing the
module-level `logs`**. Harmless there, a landmine anywhere else. Renamed `slogs`.

### Open on this page
- 🔴 **Only the sheet fix has been reported on by him.** The scrub, the curve and
  the week are verified by 34 assertions and headless renders at 393/500/896px —
  no finger has touched the scrub on iOS. The `touchstart` handler is new (the page
  previously bound only `touchmove`, so the first tap did nothing until you slid).
- Ask whether **Lift** and **Hours** earn their place, or whether **Curve** alone is
  enough. They were kept for parity, not because he asked for them.
- If a drink he buys is still missing, put a real number on it rather than guessing.
- Still deferred from the old phase work: surfacing caffeine in Nova / the morning
  briefing, and folding sleep debt into the energy baseline.

---

**Before that — `als-v430`, `improve.html` became the Library: two worlds,
laptop-first** (2026-07-28, on `main`, 17 suites + smoke green;
`tests/library.test.js` = 157
assertions; every endpoint verified live against his own videos). Read this if the
task touches the Library, TikTok, or **any feature where an AI summarises
something** — most of the lessons below are not about TikTok.

His words: *"it's literally just one scroll and unorganised by a lot… I will
mostly use it at my laptop, an actual $1000 premium page"*, plus a second world
for his saved TikToks that tells him *"exactly what I should be taking from the
video, not less not more."*

### The layout
It was a 600px column of stacked cards — a phone page shown on a 15-inch screen.
Now a **three-pane library**: shelves · the wall · the one you're looking at.
The rail and detail pane are **`position: sticky`, never fixed**, so neither
fights the topbar or the bottom nav (and constraint 4 can't bite). Three worlds
behind one switch — **YouTube · TikTok · Habits** — each with its own aurora
accent. `/` focuses search, `1`/`2`/`3` switch worlds, `j`/`k` walk the wall,
`Enter` plays, `Esc` closes. On a phone the rail becomes a chip row and the pane
a sheet. **`page-motion.js` is deliberately NOT loaded here**: it hides content
behind `translateY(18px)` until scrolled into view, which is wrong for an app
shell and is exactly the transformed ancestor that breaks fixed children.
Nothing was dropped — playlist mirror, background reader, shelves, Sharpen (now
"my own note"), Remember, Focus, momentum, manual add, habits. `ord` still owns
queue order, never `ts`.

### ⭐ THE NINE SHELVES — fixed, shared by both worlds
`Faith · Mind · Body · Food · Money · World · Sport · Sound · Laughs`

Alex rejected AI-named shelves outright: *"the categorys are too individual, they
need to be more generic but στοχευμένα — if it's talking about faith it's going
there, whatever it is, if it's improvement it goes there, if it's what to eat it
goes there."* Letting the model name its own had produced **six labels for eight
videos** (Music / Edits / Football / Fitness / Health / History) and a vocabulary
that drifted with every new batch. These are **life areas, not subjects.**

Defined in `api/_tiktok.js` (`SHELVES` + `SHELF_RULES`) and **mirrored in
`improve.html`**. ⚠️ **Change one, change both, and bump `CVER`** — that
re-shelves the whole library exactly once.

- **The tie-breakers matter more than the labels**, because ambiguity is where
  the bad filing came from: **FAITH WINS** over everything · **the SUBJECT beats
  the FORMAT** (a football edit set to music is Sport; an edit of a singer is
  Sound) · if it teaches, it shelves by the life area it teaches about, and if
  it is kept for how it feels it is Sound or Laughs.
- The sorter runs **strict** (`?ytorganize` + `strict:true`): it may **file**,
  never **name**, and an answer outside the nine is **discarded, not adopted**.
- **The rail is in canonical order, never by size.** A shelf that moves as videos
  arrive cannot be learned, and the point is that he stops reading the list.
- The reader picks its own TOPIC from the same nine and the server validates it,
  so most videos need no sorting pass at all.
- Verified live: sermon → Faith · Jhené Aiko cover → Sound · Ronaldo edit → Sport.

### ⭐⭐ The key points are CHECKED, not trusted
*"make sure the key takes are actually 100 percent perfect and correct."*
Prompting for honesty is not a guarantee — the `_nut-check.js` lesson, where
asking the model to grade its own homework returned fabricated numbers at
confidence 1.0. So `groundKeys()` **removes any key point whose numbers or names
never appear in the source material.** Verified against deliberate fakes: it
catches an invented verse (*Philippians 4:13*), an invented statistic (*87%
Harvard*) and an invented name, while keeping true paraphrases.

- ⚠️⚠️ **IT TWICE PUNISHED SPELLING INSTEAD OF SUBSTANCE, and both were found by
  running LIVE output rather than fixtures.** (1) It dropped a TRUE point because
  the model wrote `"Second Corinthians 1:3-4"` where the speaker said "chapter 1
  verses 3 and 4" → numbers are now checked as **digit runs**, and single digits
  are ignored as too weak to judge on. (2) It dropped another because the screen
  said `"Jhene Aiko"` and the model wrote `"Jhene Aiko's"` → **possessives are
  stripped before comparing.** **Dropping a true takeaway is worse than the
  fabrication the check exists to catch.** Both are pinned by tests against the
  exact live strings.
- It **never strips a card to nothing** — if every point fails, the reading is
  flagged `suspect` and says so, rather than showing a confident blank. A
  shortened list always names what was removed and why.
- Faith vocabulary (God / Jesus / Lord / Bible …) is deliberately never treated
  as a suspicious name, or every sermon would fight the check.
- **RECEIPTS:** each key point can show the transcript sentence it came from.
  ⚠️ Matched **in the page** by word overlap — it **SELECTS a real sentence and
  cannot write one.** Asking a model to quote its own source invites it to invent
  the quote too, which is the exact failure this catches.

### ⭐ The lesson worth carrying to every other AI feature
**Five of his real favourites went through the pipe before a line of UI was
written**, and they killed the obvious design:

| what it was | signal | verdict |
|---|---|---|
| Lana Del Rey edit | `#lanadelrey #xybzca #viral` | nothing to take |
| Ronaldo edit | hashtags only | nothing to take |
| Jhené Aiko cover | on-screen sticker `"Stranger - Jhene Aiko"` | the song IS the answer |
| Future clip | ASR captions (song lyrics) | nothing to take |
| WEWOKEUP sermon | **552 words of real ASR transcript** | a genuine lesson |

**Three of five had nothing to teach.** A model asked for "key takeaways" there
returns confident fiction — this project's worst failure mode. So the reader
**classifies before it writes**: a LESSON gets CORE / KEY / DO; everything else
gets a **KEEPSAKE** naming what the video *is* so he can find it again, and no
invented takeaway. `grade()` in `api/_tiktok.js` decides that **in code, before
any model runs** — a hashtag wall can never reach a lesson-eligible grade
(`transcript` / `screen` / `notes`).

- ⭐ **Being ELIGIBLE to write a lesson is not having written one.** The rap clip
  had a transcript, qualified, and correctly came back KEEPSAKE. `kind` is read
  back **out of the reply**, never assumed from eligibility, or the card
  promises takeaways it doesn't have.
- Every card carries **receipts**: read from what was said / from the text on
  screen / from your own note / from a caption that can't teach anything.

### What TikTok actually gives us (measured, not assumed)
The watch page's `__UNIVERSAL_DATA_FOR_REHYDRATION__` blob carries caption,
hashtags, creator, duration, cover, sound — plus the two that matter:
`stickersOnItem[].stickerText` (**the on-screen text**) and
`video.subtitleInfos[]` → a **WEBVTT URL of TikTok's own ASR captions that IS
fetchable server-side**. This is the transcript YouTube has refused us twice.
- ⚠️ **The subtitle URL expires within the hour** — the transcript is fetched at
  save time and the TEXT stored. Never the URL. Covers are signed too, so
  `?tiktok=` doubles as the refresh call and a dead `<img>` triggers it.
- ⚠️ **TikTok does NOT block Vercel** — verified from production, 200 in 1.5 s
  with all 552 words. That was the one risk that could have killed the feature,
  which is why the server half shipped alone first.
- Capture is a **paste box that eats his whole Notes list at once**. There is no
  favourites API; don't go looking for one.

**Getting his favourites out of TikTok — the two routes that work:**
1. **A console snippet on his own Favourites tab** (fastest). Scrolls to load,
   collects `a[href*="/video/"]` in DOM order — which is **newest-first** — and
   downloads them as a .txt. ⚠️ **Do not use DevTools' `copy()` after an
   `await`**: the Command Line API only exists in the *top-level* console
   evaluation, so it is gone by the time an async continuation runs
   (`copy is not defined` — he hit exactly this). Save to a global and download
   via a Blob instead. His uBlock also fills the console with
   `ERR_BLOCKED_BY_CLIENT` from TikTok telemetry; it is noise.
2. **TikTok's official data export** (Settings → Account → Download your data,
   JSON). Complete, and the **only source with real dates**, so ordering is
   verifiable rather than assumed. NOT YET SEEN — if he sends the file, read its
   actual shape before writing an importer; TikTok has changed it between
   versions. An import button for it is offered but unbuilt.

**Order is preserved end to end** (verified): the paste regex keeps text order →
`addTikToks` assigns sequential `ord` → the wall sorts on `ord` → and reading
never reorders, because position lives in `ord`, never in `ts`. Starred items are
the only thing that float above it.

### Bugs found inside the build — all silent, all now pinned by tests
- **A PENDING TikTok has an EMPTY `ttId`** (it only learns its id from the
  server), so `!!v.ttId` routed it into the *YouTube* store. `isTikTok()` decides
  now.
- **The ingest panel lived inside the wall**, which the background reader
  re-renders every few seconds — a sweep finishing would have wiped fifty
  freshly pasted links. Ingest and wall are separate containers; the note editor
  keeps its draft and never has focus stolen mid-typing.
- A keepsake takes its **name** from its core sentence, and printed it twice.
- A 9:16 poster pushed every key point below the fold; idle it's a banner.
- The pane reported *"70% of the YouTube queue watched"* on the TikTok wall.

`improve:tiktoks` is registered in backup `BUNDLES` (synced-but-unrestorable is
the trap `smoke-test.sh` exists to catch). Home's tile is now **Library**.

### Three things his first hour with it found (als-v427 / als-v428)
- ⚠️ **TIKTOK DOES NOT PLAY INLINE, AND MUST NOT.** Its `/embed/v2` iframe is a
  marketing surface, not a player: it forces a **white** card into a black page,
  ships its own like/comment/share chrome and a "Watch now" upsell bar, repeats
  the caption in its own fonts, and still overflows a 9:16 box — and being
  cross-origin, none of it can be styled away. The poster is now a link that
  opens a real TikTok tab. These are videos he has **already watched**; the pane
  is for what to take from them. **Do not put the embed back.** YouTube still
  plays inline, because that embed is genuinely good.
- ⚠️ **A background reader needs a STOP, and a big paste needs an UNDO.** He hit
  this within the hour: *"i think i send too much, how do i stop the progress."*
  Before, the only stop was closing the tab and the only undo was one-at-a-time.
  Now `paused` (device-local `improve:paused`) is checked by **both** sweeps
  before starting **and between videos**, and "Remove the N unread" drops
  everything with no key points while never touching one already read.
- **And then he wanted the whole batch gone** — *"clear the tiktok links i sent,
  i want to send another batch more clearer."* **"Start over · remove all N"**
  sits beside the paste box. It removes through `persist()` so tombstones are
  stamped (see the rule now in §2 — a hand-cleared key syncs straight back), and
  it lifts any pause so the next batch reads immediately.

### Open on this page
- 🔴 **He is loading his first real batch of ~100 now.** Everything client-side —
  the wall, the paste box, Stop, "Start over", the receipts toggle — has met only
  seeded data in headless Chrome. **His report is the test.** The server half is
  verified live end to end against his own videos.
- **Ask him whether nine shelves is right at 100 videos**, or whether `World` and
  `Laughs` end up nearly empty and should fold in. Renaming or merging a shelf is
  a `SHELVES` edit + a `CVER` bump, not a rebuild.
- Pace is ~3 s per video (fetch + read), so 100 ≈ 5 minutes of background work.
  He can Stop at any point and nothing already read is lost.
- Not built: the TikTok-export importer, timestamps per key point (TikTok has no
  reliable seek parameter, so it would be decoration), and animated hover posters
  (`dynamicCover` is available but not stored).

**Before that — `als-v424` — the running page proves delivery instead of assuming
it** (2026-07-27, on `main`, 17 suites + smoke green; `tests/run-identity.test.js`
32 assertions, `tests/run-courier.test.js` 17, `tests/run-inbox.test.js` 36).
Read this first if the task touches her runs, the courier, or ANY page that has
to work out whose account it is looking at.

**The report:** *"her account not seeing her runs, and it's not only her — I
opened it on Safari and the new run wasn't there either."* Two independent
faults, both silent, both producing a page that looked merely behind.

### Fault 1 — the page guessed whose app it was, and losing the guess was invisible
`run.html` is Chrissie's app; Alex gets a read-only window into it. Identity was
decided twice, badly:

- a synchronous scan of every `sb-*-auth-token` in localStorage. **supabase-js
  CHUNKS a large session** across `…-auth-token.0`/`.1` and neither fragment is
  parseable JSON, so the owner read as *not* the owner on exactly the devices
  holding a big session.
- then a **network probe** whose every failure — session not restored yet,
  offline, a cold serverless start, the `_auth` rate limit — was collapsed into
  `return false`, meaning "this is the runner".

Answer "runner" for Alex and the page starts a cloud sync on **his** account and
renders **his own pre-migration `run` row**: her runs, frozen on 13 Jul, complete
enough to read as "the app is just behind". That is what he saw on Safari.
Answer "peek" for Chrissie and her real app renders **empty**.

Now: the decision is the **session's own `user.id`**, awaited on the same ~12s
budget as `icuEnsureToken` and re-run on `als:auth` (so a session that lands
*after* the wait expired still gets an answer). The only synchronous input is
`als:uid`, which topbar.js writes from the real session — it can be absent, it
cannot be wrong. **`?peek=1` is no longer consulted at all**: Home's Running tile
always carries it, so honouring it put the read-only shadow up over HER app and
hid every run behind the welcome screen. And **"I could not tell" is never
resolved into an account** — nothing syncs, nothing drains, the local cache
renders, and the page says so. A peek `403` now stays read-only and names itself
instead of falling through to the runner path.

### Fault 2 — the ack was destructive and it followed an UNCONFIRMED write
The drain acked the inbox on the strength of a bare `persist()`. The ack makes
the courier prune the FIT bytes **and** keep the activity marked done at
intervals, so once sync.js's debounced push failed (stale JWT, offline, the tab
closed inside the 400ms window, or the engine not started yet) the run existed in
exactly one place on earth — that phone's localStorage — and the only other copy
was already gone. **This is the `lastJson`-before-the-upsert shape in a new
place.** Live proof at the time: `?icu=diag` showed her 25 Jul 16.3 km run as
`doneIds` + `acked: 1` with `pending: []`, and Alex still could not see it.

Now the loop is closed at **both** ends:

- **Client:** `icuCloudHas(needIds)` reads her own `run` row back with her own
  JWT and looks for the ids, retrying for ~11s while the push lands. Nothing is
  marked seen and nothing is acked until they are there; an unconfirmed run says
  so on the amber strip and the next open re-drains harmlessly (`findMatch`
  dedupes). A run that is merely *already present locally* is confirmed too —
  that case is precisely a run stranded by the old behaviour, so re-draining it
  is the repair. She sees the run and the toast **before** the confirmation runs.
- **Server:** `doneIds`/`seenIds` are demoted to bookkeeping and **her cloud row
  is the proof**. `icuCheck()` reads `run:logs` and re-offers anything it
  delivered that is not in there, matching on local date + distance within 250 m
  (the client's own `findMatch` rule). Re-delivery also **un-sees** the id, or
  the next tick's seen-filter would prune it before her phone opened. Bounded:
  **once per activity ever** (`inbox.redelivered`) so a run she deletes on
  purpose cannot come back hourly, and **≤3 per tick** so one invocation can't
  flood. ⚠️ **An unreadable `run` row and an empty history are the same value**,
  so a null row re-delivers NOTHING rather than re-downloading her whole month.

### Also
- `?icu=diag` gained **`herApp`**: how many runs her account actually holds, its
  newest date, and `missingFromApp` — the runs intervals has that her account
  does not. Counts could never tell "she has not run" from "every run is being
  dropped"; this names the gap directly. Still read-only. ⚠️ **The whole diag
  payload nests under `.icu`** — `d['icu']['herApp']`, not `d['herApp']`.
  **Use this instead of asking Alex "did you lose a run?"** It is the first
  artefact in this project that can answer that question by itself.
- The owner's peek payload gained **`waiting`**, and the banner now says
  «N τρέξιμο περιμένει — μπαίνει όταν ανοίξει την εφαρμογή της». Auto-import is
  pull-on-open, so a wait is normal; not being able to SEE the wait is what read
  as a lost run.
- The cloud sync engine now starts **before** the drain, so the drain's `flush()`
  is real rather than a no-op against an undefined `window.ALSSync`.

### What was PROVEN in production after the deploy (not inferred)
Read this before re-diagnosing anything about her runs.

- **`herApp.runs: 520`** → the 515-run recovery from the previous session **did
  apply**. That question is closed; don't ask him again.
- **`herApp.newest: 2026-07-22`**, and `missingFromApp` held **exactly one**
  activity: the **25 Jul, 16.33 km** run. So the fault was real, it was that one
  run, and it was one run only.
- One `?icu=1` tick then returned **`redelivered: 1`** and the diag showed the
  run back in `pending` with **136 KB of FIT** and `acked: 0`. The re-delivery
  path works end to end against real data, not just fixtures.

🔴 **THE ONE OPEN THING: no phone has run als-v424.** Auto-import is
pull-on-open, so the re-delivered run lands when **she opens the app** (and the
PWA needs a full reopen to pick up the new SW). Two paths both work: if her phone
lacks the run, the drain takes it from the inbox; if her phone still has it
locally — it is the device that drained it in July, so its local `run:icuSeen`
would skip the item — sync.js pushes it up on open instead.

**Check it without asking her:**
```bash
H=https://als-ochre.vercel.app
curl -s "$H/api/run-reminders?icu=diag" -H "Origin: $H"   # → .icu.herApp
```
`newest` moves 22 Jul → 25 Jul and `missingFromApp` empties. That means the run
is in her **account**, not merely on her phone — which is the whole point of this
version. If instead she reports a banner, it now names its own cause: no session
/ offline / HTTP 401 (stale session → sign out and back in) / storage full.

⏭️ **Still true and NOT fixed here:** her 515 pre-migration runs are a separate
data-restore job (see below), and six other clients still carry the
`Bearer (token || KEY)` fallback (Known open bugs).

**Before that — `als-v423`, `weight.html` was rebuilt over two passes, the second one
driven by Alex's own review** (2026-07-27, on `main`, 15 suites + smoke green;
`tests/weight-chart.test.js` = 161 assertions; verified live). Read this if the
task touches the weigh-in page — and skim it before building **any chart in this
app**, because most of the lessons are not about weight.

**His data, which drove every decision:** 149 weigh-ins, 8 Feb → 13 Jul 2026,
**7 missed days ever** (96%), range 69.2–73.2 kg, and a mean day-to-day move of
**0.335 kg**. That last number is the whole thesis: his daily noise is about a
third of an entire month's real movement, so **the daily reading is not the
signal — the trend is.** Monthly averages 69.8 → 71.2 → **72.1** → 70.9 → 70.5
→ 70.7: he reached his 72 kg goal in April and gave it back, and the old page
never said so.

### The chart — rules it now obeys
- ⭐ **Exactly ONE path through the plot.** v422 drew the bold trend *and* a faint
  thread joining the daily dots; Alex read that immediately as *"the chart gets
  its own route, that confuses me"* and he was right. v423 deleted the thread and
  tethers each reading to the trend with a hairline (`.wt-whisk`). The dots are
  scatter **around** the line, and a morning that landed on it disappears into
  it. **Never reintroduce a second line through this chart.** (An earlier ±SD
  envelope band also went: the tethers say the same thing from real readings, and
  "is this reading odd?" moved to the input, where it's actionable.)
- **Never autoscale to the visible min/max.** The original `pad =
  max((max−min)*0.18, 0.4)` let a 0.6 kg wobble fill 170px and read as a crisis.
  There is now a **3 kg floor** (`MIN_SPAN`), ticks on real half/whole-kg values,
  and gridline labels rendered **inside** the SVG so line and label can't drift.
- **`preserveAspectRatio="none"` is why it looked cheap.** A 320-unit viewBox
  stretched non-uniformly to device width, so strokes had different weights per
  axis, dots rendered as **ovals** and tooltip text was squashed. The viewBox now
  tracks real CSS pixels (1 unit == 1 px) via `ResizeObserver`. ⚠️ That observer's
  own first callback fires **before** the chart has ever painted, so it compares
  against **`wtLastW`** (the width last DRAWN at), never a captured local —
  otherwise it re-renders and kills the draw-in animation.
- ⚠️ **Compute a trend from the FULL history, then slice to the window.** v422
  computed it from the visible rows, so on 7D the line "warmed up" from a single
  sample and started wherever that one morning happened to land. Every range is a
  suffix of the sorted array, so `trendSeries(allRows).slice(startIdx)` is all it
  takes. The 7-day window itself is by **calendar date, not array index**, so a
  missed day widens the gap instead of shifting the window.
- ⚠️ **A slope smaller than its own standard error is not a trend.** The first
  build announced "↓ −0.07 kg/week · losing" over data that is statistically
  flat. `trendRate()` returns `{rate, se, n}`; `isSteady()` gates on
  `|rate| < max(0.05, 1.5×se)`. **Never state a direction the data can't support.**
- ⚠️ **Up is not automatically bad.** The old page painted every gain amber, which
  is simply wrong for someone climbing to **72 kg**. The verdict is coloured by
  whether he's moving *toward his own target*, read from `goals_outcomes_v1`
  (`type:'bodyweight'`) — **read-only, never written**. No goal = no goal line, no
  invented target, and the stat cell falls back to LOWEST.
- **Distance-to-goal is measured from the TREND, not the last reading.** Mixing
  the two had the stat cell saying +1.6 while Nova said 1.3 — two answers to one
  question on one screen.
- Also here: the month-by-month rail (labels thin from the newest end past ~9
  months so they can't collide), `touch-action:pan-y` **plus** gesture detection
  so a 214px chart doesn't eat the page scroll, and equal-width range segments so
  the sliding pill animates **transform only**.

### The logging ritual and the history list
Both were the generic leftovers — the form led with a raw `<input type="date">`,
and the list was 149 rows × 2 always-on buttons, which is an admin table, not a
record of his year.

- A serif prompt, **∓0.1 steppers** seeded from his last reading, and a **live
  feedback line that reads the delta back BEFORE saving** — it catches a `704` or
  a `7.04`, judged against `typicalSwing()` (his own ~0.34 kg move), never a
  hardcoded threshold.
- ⚠️ **The field ghosts his last reading as a PLACEHOLDER, never a value.** A
  pre-filled number can be committed unread, and a stale weigh-in is worse than
  an empty field.
- The date picker folds behind **"LOGGING FOR TODAY · CHANGE"**, which names the
  day in words so a back-dated entry can't happen silently. Feedback compares
  against the last entry logged **before the selected date**, so back-dating and
  editing both read correctly.
- Row actions live behind a tap; the freed space carries a **position marker**, so
  scrolling shows the shape of a month, not only its digits. A flat month centres
  every marker rather than dividing by zero.
- ⚠️ **Revealing Edit + Delete squeezed the row until `70.6 kg` WRAPPED onto two
  lines.** Only visible at a true 321px card width — invisible at any wider
  viewport and invisible to all 161 assertions. `.wt-history-val` is `nowrap`,
  the date is the only element allowed to ellipsis, and the delta hides while a
  row is open. **The rendering technique that caught it is in §6.**

### Data safety
Both passes are **presentation only**. Every storage function —
`wtLoad`/`wtSave`/`wtSaveEntry`/`wtDeleteEntry`/`wtGetSelectedDate`/
`parseWeight`/`wtDateKey` — is **byte-identical** to before the work,
`localStorage.setItem` call sites 1 → 1, and `pocoach-sync.js` wiring is
untouched. `doSave` and `wtEditEntry` gained UI-reset lines in v423 (classes and
label text only, nothing removed), verified line-by-line to add no storage or
array writes. The suite asserts his 149 rows survive a render unmodified.

### Still open on this page
- 🔴 **NOTHING HAS BEEN TOUCHED ON A PHONE.** Verified by 161 assertions and
  headless renders at 321/330/428 px only. Ask him about two things he has not
  ruled on: whether **tap-to-open** on a history row annoys him (one extra tap on
  something he does rarely), and whether the **position markers** read as useful
  or as fussy. Both are cheap to pull back.
- The chart's touch gesture split (vertical drag scrolls the page, horizontal
  scrubs the readout) is the most iOS-dependent thing here and is unproven.
- Pre-existing and **not** caused by this work: `tests/goals-rhythm.test.js`
  fails one date-dependent assertion ("current week marked"). It reads
  `main.html` only and fails identically with `weight.html` stashed.

**Before that — `als-v421`, the anon key in her drain** (2026-07-27).
**Superseded by als-v424 above**, which is the block to read; the permanent rules
live in §2. Kept here only for the parts that are still load-bearing:

- `icuHdr` sent `'Bearer ' + (ICU_TOKEN || ICU_SB_KEY)` and RLS answered `200` +
  `[]`, byte-identical to "no new runs". Now JWT-only with a ~12s wait and an
  `als:auth` re-drain. **An empty inbox is the ONE quiet exit**; every other
  failure names itself on its own amber strip, because `#lgToast` lives inside
  the log view and is invisible from every other tab.
- **Storage-full does not stall forever on the same run.** A 16 km run carries a
  route *and* a per-second series and is the biggest thing this page stores; the
  old code returned without acking and retried the identical oversized write at
  every open. It now sheds `series`/`route`/`laps` and retries — she keeps
  distance, time, pace, HR — and only if *that* fails rolls back and refuses to
  ack.
- ⚠️ **If she reports a run missing, check `?icu=diag`'s `newest` FIRST.** If
  intervals does not have it either, the gap is upstream (watch → Garmin Connect
  → intervals), not in this app.

### ⚠️ THE SAME SESSION UNCOVERED A BIGGER THING: her 515 runs were ORPHANED

Alex then said "i dont see her run on 25 there" and, worse, "why did every other
run of her leave? she had downloaded from 2022". He was right that they were
gone from view, and it was **not** the v421 change.

- **What her account held: 5 runs** (15, 18, 20, 22, 22 Jul) — *exactly* the five
  the courier had delivered and acked. Her run history in that account began the
  day the courier began. **The tell is the date arithmetic:** the gap starts
  15 Jul, twelve days before the v421 deploy. Nothing in the drain removes an
  existing run (the only shrinking line, `logs.length=base`, restores the
  pre-import length after a failed save).
- **The cause is the 14 Jul multi-user migration.** Her whole history was
  imported into the SINGLE pre-migration account. When the accounts split she got
  a new `run` row that started empty, and only the courier has written to it
  since. **Nothing was ever deleted:** `_deletes` in the pre-migration snapshot
  holds tombstones for `run:plan` and `run:shifts` and **zero** for `run:logs`.
- **Where the data actually is** — `~/ALS DASHBOARD ALL FILES/BACKUPS/2026-07-14_pre-migration_cloud-rows.json`,
  row `key:"run"` → `run:logs`: **515 runs, 2022-01-18 → 2026-07-13, 3,348 km,
  515 unique ids, 343 with splits, only 5 with routes** (the bulk history was
  imported stats-only by design — those maps were never there, so don't chase
  them). That file is 26 pre-migration rows with `user_id: undefined`; it is the
  single best artefact in the repo's orbit for any "did we lose X?" question.
- **The recovery file I generated** (runs ONLY, so it cannot touch her plan /
  shoes / profile): `2026-07-14_RUNS-RECOVERY_515-runs.json`, in that BACKUPS
  folder and copied to his Desktop. Shape is the vault's own
  `{date, takenAt, rows:{run:{"run:logs":[…]}}}`, which `normalizeSnapshot()`
  accepts as `kind:'vault'`. Simulated against her 5 using the page's own
  `idOfItem`: **adds 515, removes 0 → 520.**
- **The route, and the trap:** `backup.html` has **TWO file pickers that do
  opposite things.** "Keep a copy → Choose a backup file" is the **destructive**
  full restore. The correct one is **"Go back to a day" → "Older than 14 days?
  Open a backup file"** → then the middle **✚ "See what's different"** →
  **"Bring back 515 entries"**. Never the red ⚠ "Restore this whole day". And it
  must be done **signed in as HER**, or her history lands on his row again.
- ✅ **CONFIRMED APPLIED, 2026-07-27.** `?icu=diag`'s new `herApp` block reads
  her account server-side: **`runs: 520`**. The recovery landed exactly as
  simulated (5 + 515, nothing removed). Don't re-open this.
- ⏭️ **The obvious follow-up nobody has checked:** if `run:logs` was orphaned by
  the migration, **what else of hers was?** Her `run:plan` / `run:shoes` /
  `run:profile` / `run:strength` are all in that same pre-migration row and were
  deliberately left OUT of the recovery file to keep the blast radius at one
  store. Diff her live bundle against that snapshot before assuming it is only
  runs.
- Minor, found in passing: `FRIENDLY` in `backup.html:1121` labels `runs` and
  `run:runs`, neither of which exists — the real key is **`run:logs`**. Cosmetic
  only (`FRIENDLY[k] || k`, so Repair still offers the store under its raw name),
  but fix the label when next in that file.

**Before that — `als-v419`, the nutrition lookup was rebuilt to be grounded,
classified and honest** (2026-07-26, on `main`, 38 test groups in
`tests/nutrition-lookup.test.js` + all 13 suites + smoke green). Read this
first if the task touches finding or logging a food.

**The one lesson worth carrying to any task, not just this one:** every real
bug in this arc was invisible to a green test suite and obvious the moment I
read live output. Five deploys, and four of them fixed something the tests had
already blessed. When the failure mode is a *plausible wrong number* rather
than an error, tests only prove you didn't break what you thought to check.
`curl` production and look at what it actually says.

To reproduce any of it: `curl` production with an `Origin` header — the `_auth`
gate rejects a bare curl.

```bash
H=https://als-ochre.vercel.app
curl -s -X POST $H/api/nutrition-web -H "Content-Type: application/json" \
  -H "Origin: $H" -d '{"text":"τυρόπιτα"}'
```

- 🔴 **STILL UNVERIFIED, needs a device — the whole CLIENT half.** The scanner
  rewrite (native `BarcodeDetector`, camera-failure messages), the label-photo
  flow through the UI, and the receipts line in `showPortion` are syntax- and
  logic-checked only: **no browser, no camera and no real photo has touched
  them.** The SERVER half is verified live end-to-end, including a Greek label
  transcribed exactly (kcal/macros/fibre/sugar right, salt 0,45 g → 180 mg
  sodium, serving 35 g, package 132 g). The **plate** photo path is also
  unconfirmed — it refuses a label image, which is correct for a nonsense
  input, but nobody has sent it a real meal. **Start here next session:** ask
  Alex what the Scan tab says on a failure, since it now names its own cause.
- **Three kinds of food, three roads** (`api/_food-know.js` → `classify()`).
  A packaged product has a label to find. A homemade dish **does not**, and
  hunting one is what produced the worst numbers in the app: "τυρόπιτα από
  φούρνο" returned **60 kcal / 28 g** from eatthismuch.com while the core DB
  held 316 kcal/100g at 120 g. Dishes are now **costed from ingredients**
  against the verified core DB — traceable, and better than any recipe page.
  Don't route a dish at a product search again.
- **`found` is computed, never self-reported** (`api/_nut-check.js`). The old
  prompt asked the model to grade its own homework and it returned
  400/40/40/14 at **confidence 1.0** for a Born Winner bar — numbers on no
  label anywhere, which Atwater ±20% waved through. Three independent tests
  now: **GROUNDING** (do the digits literally appear in the page we read? a
  fabrication cannot cite a source), **INTERNAL** (Atwater + sugar ⊆ carbs,
  satfat ⊆ fat, ≤100 g/100 g), **PRIOR** (plausible for this *kind* of food).
  Every downgrade writes a human-readable reason onto the card.
- **Source tier decides who may confirm.** arise-app.com, fitvibestd.com and
  dietandfitnesstoday.com were all sourcing real answers. Tier 0 =
  manufacturer/Greek retailer, 1 = Open Food Facts, 2 = national DB, 3 =
  trackers, 4 = everything else. **Tier ≥3 can corroborate but never confirm
  alone.**
- **Portion is a first-class answer.** Correct macros on the wrong mass is
  still a wrong log: Kinder Bueno resolved to **21 g — one finger of a
  two-finger bar**. `PORTION_PRIORS` holds as-eaten weights (γύρος 320 g,
  τυρόπιτα 150 g, Bueno 43 g) and `quantityOf()` reads his own count.
- **The label photo is the certainty ceiling** (`mode:'label'` in
  `api/meal-photo.js`, same vision slot, no 13th function). A photo of the
  nutrition table IS the ground truth every database copies from, so a
  database miss offers to read the pack instead of dead-ending. It is
  **transcription, not estimation** — the prompt forbids inference, an
  unreadable photo says so, and `healFood()` must never "correct" a real
  reading into a generic one.
- ⚠️ **Barcode failures were mostly SILENT, not missing data.** The scanner
  had four swallowed failures in six lines (`if(!lib) return`, empty catches,
  empty `.catch`) and loaded from **unpkg** — the exact CDN mistake als-v402
  exists to prevent. Now: vendored, native `BarcodeDetector` preferred,
  grocery formats only (`ean_13`/`ean_8`/`upc_*`), and every camera failure
  names its cause. Lookup tries OFF mirrors → USDA Branded by GTIN before
  saying "not in any database".
- **Bugs found INSIDE the fix, all locked by tests** — this is the useful part
  for a future session, because each one produced a plausible wrong number
  rather than an error: a backtracking digit run read `200g chicken` as **20
  portions**; `'πίτα'` matched inside `'τυρόπιτα'` and steered a cheese-pie
  query to pita bread; unfolded Greek keys meant final sigma never matched;
  **`a.tier || 9` sorted tier-0 manufacturers LAST** (0 is falsy); `"water"`
  matched **"Watermelon"** by unbounded prefix; one token of `"Magnum ice
  cream bar"` counted as a full ingredient match; `"tomato sauce"` matched
  `"Chicken in tomato sauce"` until the **head noun** had to match too;
  `"egg"` costed as egg white (52 vs 143 kcal); and Greek **plurals** matched
  no dish word at all, so `"2 τυρόπιτες"` dead-ended on "no label found" — the
  stem must be a **fixed 5-char prefix**, not `length − 2`, or two inflections
  never meet.
- **Known imprecision, left in deliberately:** a bare `"cream"` still costs as
  *Cream cheese*. Precision is favoured over recall throughout — a miss falls
  back to a sane per-100g estimate, a wrong match silently poisons the meal.
- Not built: contributing a missing product back to Open Food Facts, and a
  local lookup cache (resolved foods are already remembered as Custom foods,
  which covers the common case).
- ⚠️⚠️ **A SEPARATE outage was found while verifying this, and it was not a
  regression:** both photo paths had been returning HTTP 400 because Groq's
  `json_object` mode is a validator that rejects a truncated reply outright.
  Fixed in the brain-stem — **see §2 "AI calls"**, which is the permanent home
  for that rule. Worth knowing the shape of it: the failure said "the vision
  model is not responding" when the model was fine, because the upstream
  message was being discarded.

**Before that — `als-v412`.** The last sessions built, rebuilt (×3), then **pivoted**
the study page. Read this first if the task touches studying / Πανελλήνιες:

- **What `study.html` is** — a single-page study OS for Alex's exams (Γ Λυκείου
  → **Πανελλήνιες ~June 2027**, Θεωρητική: Αρχαία, Ιστορία, Λατινικά, Έκθεση).
  Countdown North Star, timetable-driven Today, homework with **auto-due-dates**
  (from the next class of that subject), exams+scores, study-plan ring/streak,
  subjects+ύλη status tracker, timetable editor (Φροντ./Σχολείο tabs). appKey
  `study`; 7 synced keys (`study:subjects/timetable/homework/exams/units/plan/goal`)
  in `initCloudSync` + backup `BUNDLES` + SW `CORE` + a Home "Study" tile.
  Owner-gated **empty-only** seed (4 subjects + 15 ύλη units incl. Ιστορία's
  Προσφυγικό/Κόμματα/Οικονομία/Κρητικό/Παρευξείνιος). `study:seedv` is local-only.
- **⚠️ THIS PAGE IS LAPTOP-ONLY** — Alex: *"i will be seeing it ONLY from the
  laptop."* Design **desktop-first** (wide multi-column) if it continues.
- **Three aesthetics, all rejected by Alex** (taste is the hard part, not
  features — every rebuild kept 100% parity): v409 emerald card-stack ("generic,
  layout AND aesthetic"), v410 warm editorial day-spine + antique gold ("the
  colours are weird"), v411/412 neutral-graphite + blue laptop dashboard ("not so
  premium… its off"). v412 also fixed a dead Σχολείο/Φροντ. tab (tabs had `data-tk`
  but no handler). **Don't reflexively re-skin a 4th time** — see the pivot.
- **⭐ THE PIVOT — going Notion.** Alex chose to move the study page OUT to
  **Notion** (a premium look he controls himself) and "connect it here so you can
  read it." Planned **«Η Χρονιά»** workspace: a dashboard (live countdown +
  Σήμερα + this-week) over **6 linked DBs** — Μαθήματα, Ύλη, Εργασίες,
  Διαγωνίσματα, Πρόγραμμα, Διάβασμα (full spec in memory `als_study_command_center`).
- **⚠️⚠️ BLOCKER — the Notion connector is NOT reachable from Claude Code.** Alex
  authorized **Notion in claude.ai's connectors** and said "connected, start
  building." But this **Claude Code CLI has no Notion tool** (a tool search for
  "notion" returns only Higgsfield / Google-Calendar MCPs). So the page **cannot
  be built from Claude Code** as-is. To actually build it: **(a)** do it from the
  **claude.ai app** (where the Notion connector lives), or **(b)** add a **Notion
  MCP server to Claude Code** (`claude mcp add` / `/mcp`). Fallback that DOES work
  from here: generate a **self-build kit** — import-ready CSVs for the DBs + a
  short setup guide. **Never tell Alex "building it now" from Claude Code until a
  Notion tool actually exists** — verify first. (When last left, I had NOT started
  the Notion build; the session ended here because he was tired.)
- **`study.html`'s fate is undecided** — keep it live for now; retire to a
  redirect only if Notion fully replaces it (his call).
- **Real timetable still pending** (drops into whichever tool wins): **φροντιστήριο
  starts 3 Aug** (Mon–Fri, 3 lessons **18:00–21:00**, the 4 subjects), **school
  mid-September**; general school subjects TBD. Target σχολή/μόρια optional.

**`als-v408`** — `scripture.html`, the Bible reading tracker, built then
refined on Alex's feedback (2026-07-24, on `main`, 12 suites + a 55-assertion
`tests/scripture.test.js` + smoke green; page and centered dialog headless-shot).
`als-v407` shipped the page; `als-v408` corrected and extended it. What a fresh
session must know:

- **The canon is transcribed from a photo of his Bible's contents pages, and the
  first transcription was wrong.** From the blurry photo I column-shifted the OT
  poetry/prophets. The corrected starts (from a clear photo, locked by a test):
  Proverbs **836**, Ecclesiastes 878, Song 890, Isaiah 900, Jeremiah **980**,
  Lamentations 1060, Ezekiel 1070 (the old values gave Jeremiah a 10-page span).
  Genesis 2 → Malachi 1223, Matthew 1232 → Revelation 1692, `END`=1723 (Χάρτες).
  If a book boundary ever looks off, it's editable per-entry and the auto-detect
  self-corrects — but fix the `BIBLE[]` value too.
- **Seeding uses an additive, versioned migration — not empty-only.** His notebook
  (27 entries) + the 4 finished Gospels are seeded. `bible:seedv` is a **LOCAL,
  never-synced** flag; `applySeed()` full-seeds an empty page, else adds only
  entries newer than the stored `SEED_V` **by absent id**, once per device. Gospel
  ids (`seed_g_*`) are brand-new so a tombstoned delete can't resurrect them. **To
  ship more seed data later: add entries, bump `SEED_V`.** (The plain empty-only
  pattern would never reach a device that already seeded.)
- **The modal-off-frame trap bit again even with native `<dialog>`+`showModal()`.**
  The page's own `*{margin:0}` reset kills the UA `dialog{margin:auto}` centering,
  so the modal pinned off-frame. Fixed with `position:fixed; top/left:50%;
  transform:translate(-50%,-50%)`. **Any single-file page that both resets margins
  and uses `<dialog>` needs explicit centering** — this is constraint 4's cousin.
- Registered everywhere a synced page must be: appKey `scripture` / key
  `bible:sessions` in `sync.js` init + backup `BUNDLES` + `MAP.md`; `scripture.html`
  in SW `CORE`; a Home **Life** tile in `index.html`. The whole coverage model is
  the union of read page-ranges → % of canon, per-book completion, `continueTarget()`
  for the resume card, and a `renderMilestone()` seal (the 4 Gospels are the first).

**`als-v406`** — Chrissie's sleep page is hers again. Alex reported the
als-v396 **"My protocol"** section (his 10:00 wake anchor + early-waking
playbook) showing on *her* account, and thought that update had also killed her
Garmin sleep sync. The section was the real bug: `#protoSec` rendered
**unconditionally**, a "never hardcode Alex" violation. Now gated on
`ALSProfile.isOwner()` (`protoIsOwner()` / `applyProtoVisibility()` hide it for a
non-owner, `renderWakeAnchor()` early-returns, an `ALSProfile.ready()` hook
corrects the guess once her session lands; owner-default so it never flashes
hidden for Alex). Verified both branches headless. (2026-07-24, on `main`, 11
suites + smoke green.)

**Her missing Garmin night was NOT this update** and NOT code — proven live and
worth keeping: the sleep-page changes never touch the pipe (`_garmin.js`,
`run-reminders.js`, the `sleep:inbox` drain), and `renderWakeAnchor` runs *after*
her night is painted. Diagnosis by endpoint (from a logged-in browser, same
origin — a plain `curl` is `{"error":"forbidden"}`):
`?garmin=diag` → `verdict:"OK — token is good"`, status 200, env clean;
`?icu=1` → `wellness:12, rich:12, unchanged:true, garminError:null`. So the
server pipe is **healthy and her inbox is fully current** — the data was in the
cloud. The break was **client-side on her phone**: a **stale session JWT** makes
the drain read her `sleep:inbox` empty under RLS, so cached older nights render
while today's never lands (this project's #1 failure mode — see the als-v403
follow-up below). **Fix that worked: sign out / back in on her phone + fully
reopen the PWA** (picks up the latest SW). When "sync looks broken but the page
renders," suspect a stale session before touching code.

**After the re-login, her night history briefly showed ONLY today's night — NOT
data loss, needs NO code fix.** Verified from code, not guessed: sign-out is a
bulk `localStorage.clear()` (topbar.js `purgeLocal`), which leaves **no deletion
tombstones** — tombstones are only stamped on individual deletions through sync's
write interceptor, so a bulk clear can't mark her old nights for removal. And
`sleep:logs` merges by **UNION** (`mergeArray`, sync.js:44-61): the phone's
freshly-drained single night unions with her full cloud history by night-id →
**every night survives**; whole-blob LWW was deliberately removed so a cleared
phone can't overwrite the cloud. What she saw was the gap between "signed in +
drained today" and "the cloud pull landed." **It self-heals** — the next time her
app opens online, sync pulls her full `sleep:logs` and all nights reappear
automatically; nobody has to touch her phone.

⚠️ **Claude Code cannot reach her live account** (no phone, no cloud rows, no
service key in the repo). The ONLY bridge to her Supabase data is the **claude.ai
`api/mcp.js` connector**, which needs one-time authorization in Alex's claude.ai
connector settings — NOT authorized this session, so her `sleep:logs` was never
read live. **OPEN (Alex can't access her phone):** to get certainty, authorize
that connector and read her live `sleep:logs` (exact night count + oldest/newest
date); the **Vault** (daily GitHub backups, 14-day rollback, additive repair) is
the backstop if it is ever genuinely short.

It sits on top of **the earlier sync-resilience pair, `als-v402`/`als-v403`**
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
constraint 12 (the class-in-CSS rule) for the bug it uncovered. Two things it
left unsettled:

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
- 🔴 **Meal groups (als-v439) are unproven on his phone.** Two calls are his:
  should a logged meal open **collapsed** by default (right now only the one he
  just saved opens expanded, so nothing appears to vanish the second he names
  it), and is `+ Save these 3 as one meal` in the right place — under the foods,
  above the one-tap-usual link. Both are a few lines. He needs a full PWA reopen
  for the new SW.
- 🔴 **The launcher (als-v437) is unproven on his phone.** Does "All" feel right
  in the centre, are the six pins the right six, and do the recency notes read
  as useful or as noise? All three are cheap to change; none of them is stored.
- ✅ **The nutrition streak is fixed and he confirmed it live.** Don't re-ask.
  ⚠️ And never call that number a fixture again — it is a real MyFitnessPal
  carry-over (memory `als_nutrition_streak`).
- **The to-do conversation is still owed.** He said *"ill use it but we have to
  talk about it."* The evidence to open with: nine days between 14 Jun and 7 Jul
  hold the SAME line, `STUDY HISTORY AND ANCIENT GREEK`, never ticked. That is
  not a to-do failing, it is a **recurring commitment typed into a one-day
  container** — you never finish studying history. The feature he needed already
  exists and he has never opened it: `identity.html`'s habits
  (`habits:list` / `habits:log` are ALL absent from his export), which is the
  navigation problem in miniature.
- **`caffeine.html`'s `saveDays()` has an empty catch** (`caffeine.html:784`) —
  and it is the write that must land *before* `saveLogs()` prunes the old
  entries out of `caf:logs`. Constraint 17, and the same "destructive act after
  an unconfirmed write" shape as als-v424. Also worth telling him: that page
  keeps history as **daily totals only**; the individual drinks are discarded at
  the midnight rollup by design, which is why it can look like he logged once.
  Ask what **The Week** shows him before assuming data was lost.
- 🔴 **Home (als-v433): do the tiles now match the pages?** He reported them
  wrong and the fix is verified against his device export, but **he has not
  opened it**. He needs a full PWA reopen to pick up the new SW. If any tile is
  still off, it is a *different* bug from the one fixed — that one is pinned by
  72 assertions — so get the tile name and compare it against the page.
  Also his call: should the `scripture.html` / `study.html` tiles go live too?
- 🔴 **`caffeine.html` (als-v432): does the scrub feel right on his phone now?**
  He reported the empty drink sheet and that is fixed and confirmed live, but the
  thing he originally complained about — dragging the curve — has only been proven
  in headless Chrome. Also his call: do **Lift** and **Hours** earn their place, or
  is **Curve** alone enough? And name any drink still missing so it gets a real
  number instead of a guess.
- 🔴 **`weight.html` (als-v423) has never been opened on a phone.** Two calls are
  his, not mine: does **tap-to-open** on a history row annoy him, and do the
  **position markers** in the list read as useful or fussy? Also unproven on iOS:
  the chart's gesture split (vertical drag scrolls, horizontal scrubs). Details
  at the top of this section.
- 🔴 **Did her 25 Jul 16.3 km run finally land?** It was re-delivered into her
  inbox in production on 2026-07-27 (`redelivered: 1`, 136 KB of FIT waiting),
  and auto-import is pull-on-open, so it reaches her app the next time she opens
  it. Check `?icu=diag` → `herApp.missingFromApp` is empty and `newest` moves
  from 22 Jul to 25 Jul. (The 515-run recovery is ✅ confirmed applied: 520.)
- ⚠️ **Auto-import is PULL-ON-OPEN, not push.** The courier parks the run in her
  inbox within the hour, but it only reaches her app **when she opens it**. If he
  ever asks why a run "took until this evening", that is why — not a bug. Real
  background delivery would need a push subscription on her device.
- ✅ **Garmin is connected directly on `intervals.icu` — this is DONE** (proven
  live 2026-07-27, see als-v421). Every run since 15 Jul arrives as
  `source: GARMIN_CONNECT`. Don't re-pitch it.
- Her runs from **27 Jun → 13 Jul are permanently unimportable** (12 activities,
  `source: STRAVA`). intervals returns `422 "Cannot read Strava activities via
  the API"`, and even the full activity object comes back with no type, no name
  and no distance — there is nothing to salvage server-side. If she wants them,
  the only route is a Garmin Connect / Strava export dropped into the app's own
  file import. Don't spend another session trying to fetch them.
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
- ⚠️ **Six other clients still carry the `Bearer (token || KEY)` fallback that
  broke her run import** (als-v421 fixed only `run.html`): `nova-actions.js:40`,
  `sync.js:457`, `pocoach-sync.js:144`, `backup.html:432`, `morning.html:1599`,
  `coach.html:292`. The *writes* are comparatively safe — RLS rejects them and
  als-v403 now reports it — but the **reads** return `200` + `[]`, so a device
  whose session has not restored reads EMPTY and cannot tell. `pocoach-sync.js`
  is the one that already cost 149 weigh-ins. The Vault is protected server-side
  (`api/_vault.js` refuses to write an empty snapshot), so this is not urgent,
  but it is the same bug waiting in six places. **`smoke-test.sh` currently
  BLESSES this shape** — its guardrail was written to allow `|| KEY`. Worth its
  own session: make the token mandatory, then tighten the guardrail.
- `run-demo.html` is a stale duplicate of the pre-fix `run.html` (it still has
  the anon-key fallback at :4253). It is not linked from anywhere. Delete it.
- `po_water_v1` uses whole-object last-write-wins, so concurrent edits on two
  devices can clobber each other.
- The Mind tab points to two different pages: `topbar.js` sends it to
  `main.html`, Home's own nav sends it to `identity.html`. Both are live.
- `_water-test.html` and `_abtest.html` are local-only and 404 in production,
  but opening `_water-test.html` seeds fake water data. Safe to delete.
- **`_render-check.html` (1.7 MB) is sitting in the repo root** — the als-v433
  render harness, seeded with a copy of his real device data. `_*.html` is
  gitignored so it can never be committed or deployed, but delete it. (The
  `rm` was denied twice in that session; it needs his approval or a manual
  delete.) Same for anything else matching `_*.html` / `render-*.html`.
- Bar-blur smear on the nav (low priority).

---

## 6 · Workflow

```bash
export PATH="$HOME/.local/node-v24.18.0-darwin-arm64/bin:$PATH"
for f in tests/*.js; do node "$f"; done   # 24 files; 23 suites.
# ⚠️ `tests/*.test.js` is only 21 of them. reinstall-safety.js and
# sync-regression.js carry NO `.test.` in their names and they guard the
# sync data-loss bugs — the most expensive bug class here. A loop over
# `*.test.js` silently skips both. Only garmin-probe.js is a TOOL.
./smoke-test.sh                            # MUST pass before every push
```

⚠️ **`tests/goals-rhythm.test.js` fails ONE assertion ("current week marked") on
some dates** and has since before als-v422. (It passed clean again on 2026-07-29
with all 23 suites green.) It reads `main.html` only and the
failure is **date-dependent**. So a clean tree is
**22 pass, or 21 pass / 1 fail**; either is expected. Don't assume you broke it and
don't chase it unless the task is Home's heatmap. To prove any failure isn't yours:
`git stash push <your files>`, re-run, `git stash pop`.

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

**To see BEHAVIOUR, not just layout — strip only the EXTERNAL scripts.** The
static harness above cannot open a `<dialog>`, run a `ResizeObserver`, or prove
anything about interaction. Strip `<script ... src=...>` only, keep the page's own
inline script, and **assert no `src=` survived**:

```js
h = h.replace(/<script[^>]*\ssrc=[^>]*>\s*<\/script>/gi, '');
if (/<script[^>]+src=/i.test(h)) throw new Error('an external script survived');
```

That removes `sync.js`, `vendor/supabase.min.js`, `topbar.js`, `nova*.js` — every
path to the network and to live Supabase, so constraint 8 holds — while the page
still boots, seeds `localStorage`, and can be driven (`openSheet().click()`).
Report measurements by writing them into `document.title` and reading them back
with `--dump-dom`; that is how the collapsed-list height was measured.

⚠️ **Headless lays out at ~500px CSS width regardless of `--window-size` in some
invocations**, so `100vw`, `vw` units and viewport-relative `min()` do NOT
correspond to the flag you passed — a dialog looked clipped at `--window-size=393`
purely because `100vw` had resolved to 485. **Measure `document.documentElement
.clientWidth` before trusting any vw-based finding**, and shoot at whatever width
it reports. `max-width` pinning (above) is unaffected and stays the reliable way
to inspect a true phone width.

**Looking at generative graphics is not optional.** The shoe took six rounds of
render-screenshot-`Read`-the-PNG before it was worth shipping, and every round
caught something the tests could not see: tread hanging below the sole, a heel
that read as mush, inverted lighting, a shoe flattened into a ribbon. Assert the
geometry is finite in a test; then *look at it*.

Render `git show HEAD:<page>` the same way for a real before/after. Headless
does not apply the mobile viewport, so the right edge clips — compare the two
shots against each other, never a shot against the phone. Delete both when done.

⚠️ **That clip hides real mobile bugs, so don't just live with it.** To inspect
the layout at a genuine phone width, **pin the wrapper and shoot a WIDER window**:

```bash
# .wp-wrap max-width 393px → card content is exactly 321px, the real iPhone
# value, while the 470px window keeps the page from overflowing and clipping
--window-size=470,1700     # + inject: .wp-wrap,.wp-hero{max-width:393px!important}
```

This is how `weight.html`'s wrapped-value bug was found: revealing two buttons in
a list row squeezed `70.6 kg` onto two lines **only** at 321px. Nothing wider
showed it and no assertion could see it. **A layout that is only ever rendered
wide is untested at the width he actually uses.** Crop the PNG to the region you
care about and `Read` it — a full-page shot at phone width is too small to judge.

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
