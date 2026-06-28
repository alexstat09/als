# ALS Dashboard — Session Summary (for handoff to another conversation)

_Generated 2026-06-24. Paste this into a new conversation to bring it up to speed._

---

## 1. Primary Request & Intent
Build/perfect the ALS personal performance dashboard PWA (**AURORA**, repo `alexstat09/als`, Vercel). Standing directive: "make it perfect, make no mistakes, push." Push to main → Vercel auto-deploys.

This session's arc:
1. Finish nav-redesign demos →
2. Pivot to **Command Core** (Stark/JARVIS radial home) →
3. Classic-vs-CommandCore view switch →
4. Recategorize Command Core lenses →
5. Recategorize the Classic home (5 spaces) →
6. Build an **MCP server** so Claude can "ask anything / do anything" with live dashboard data from anywhere →
7. Add MCP power tools (undo/delete) →
8. Build the **intelligence layer** (Insight Engine v2) →
9. Build the **Coach** surface →
10. Deliver an honest full-dashboard audit + finish-line punch-list →
11. Save the audit to persistent memory.

## 2. Key Technical Concepts
- **Stack:** Static HTML PWA + localStorage + Supabase sync. Service worker `sw.js`: network-first, precaches CORE list, version `var CACHE = "als-vNN"` bumped every change (now **als-v89**).
- **app_state BUNDLE architecture (critical):** Supabase `app_state` rows keyed by `appKey`, each bundles MANY localStorage keys.
  - `po-coach` → po_workouts / po_coach_weights / po_coach_workout_done
  - `nutrition` → nut:logs / nut:profile / nut:custom / nut:meals
  - `caffeine` → caf:logs
  - `health` → po_water_v1 / stack:items / stack:taken:<date>
  - `identity` → habits:list / habits:log / journal:entries / identity:northstar
  - `sleep` → sleep:logs / sleep:profile
  - `bills` → bills:items / bills:paid / bills:nospend
  - `movies` → movies:seen / movies:watch
  - `improve` → improve:videos / improve:habits
  - `body-measure` → bm:logs ; `ideas` → ideas:items ; `finance` → subs / nw:* ; `mealplan` ; `nova-chat` → nova:memory
  - Read = `readRow(appKey)[lsKey]`.
- **sync.js merge engine (obey for writes):** `idOf` keys array items by id→dateKey→date. `mergeArray` union-merges; same-id collision keeps NEWER `ts` (no ts → local wins). `mergeObject`: child named `logs` → Math.max per key; child object with `_ts` → whole-object last-write-wins. Deletes propagate via `_deletes[lsKey][idOf(item)]=Date.now()` tombstones. pocoach-sync.js has its own `mergeWeights` (by dateKey, newer ts wins).
  - **RULES:** adds need id/dateKey; updates must stamp `ts=Date.now()`; deletes need tombstone; settings objects (po_water_v1, nut:profile) must stamp `_ts`.
- **_supa.js helpers:** `readRow(key)` → data JSON or `{}`; `writeRow(key,data)` whole-row upsert. Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (bypasses RLS).
- **MCP** over Streamable HTTP: JSON-RPC initialize/tools/list/tools/call/ping/notifications. Token auth via `?token=` or `Authorization: Bearer`.
- **jsc testing:** `/System/Library/Frameworks/JavaScriptCore.framework/Versions/A/Helpers/jsc`; parse-check via `new Function(src)`; Monte-Carlo for stats. Node NOT available in dev env; jsc DOES support Intl timezones.
- **aurora.css tokens:** --au-void, --au-ivory, --au-dim, --au-faint, --au-line, --au-mono, --au-sans, --au-serif.

## 3. Key Files
- **api/mcp.js** — Remote MCP server, 41 tools. KEYMAP `BUNDLE` (lsKey→appKey), per-request CACHE, `mutateBundle(appKey, fn)` read-modify-write whole row. Timezone: `getTz()` from `push:prefs.tz` (default 'Europe/Athens'), `fmtLocal`/`localToday`/`shiftKey`/`resolveDate`. Auth fails closed if MCP_TOKEN unset. Reads: snapshot, get_recovery/training/nutrition/body/money/mind/life, get_supplements/journal/ideas/watchlist, list_keys, get_raw. Writes: log_meal, log_weight, add_water, log_caffeine, log_sleep, mark_workout_done, mark_bill_paid, add_no_spend_day, add_habit, complete_habit, take_supplement, log_movie, add_to_watchlist, add_idea, add_learning, journal_entry, set_calorie_target, log_measurement, complete_learning, adopt_habit, mark_idea_done. Undo: remove_water, delete_last_meal, delete_idea, remove_from_watchlist, unmark_bill_paid, remove_no_spend_day. **Critical fix:** add_water stamps `w._ts = Date.now()`.
- **insights-engine.js (v2)** — `var T_MIN = 3.8;` Welch t-gate. timeline() captures recovery/sleepH/quality/energy/soreness/mood/weight/volume/trained/pr/kcal/protein/carbs/caf/cafLate/water. `splitAuto` returns {hiMean,loMean,hiSD,loSD,d,t,nHi,nLo,n}. 16 HYP each with action+domain+e. crossDomain gate filters |t|<T_MIN. Output: {id,text,emoji,strength,effect,confidence,d,action,domain}. compute() filters strength≥0.30, sorts, slice(0,8).
- **coach.html** — Dedicated intelligence view. Includes aurora-bg.js + insights-engine.js + forecast-engine.js. Hero = strongest insight w/ action (DMAP domain→{page,color,label}). Honest empty/learning state. confLabel(): ≥0.6 'strong', ≥0.38 'clear', else 'emerging'. (NOTE: still missing bottom nav / topbar.js — punch-list #6.)
- **index.html** — Classic home = 5 spaces Train(Fitness·PR)/Body(Body hub·Sleep)/Mind(Goals·Identity·Ideas·Improve)/Money(Finance·Bills)/Life(Movies·Arc·Trends), tiles ·01–·13. View-switch `⬚ Classic | ◉ Command Core`. 🧠 COACH button in hub-briefing-wrap (`.hub-coach-btn` cyan). Palette entries for Coach + Command Core + demos.
- **demo-core.html** — "Command Core", wired radial Stark/JARVIS home, 6 lenses, reads localStorage. Ribbon switch to Classic.
- **sw.js** — CACHE="als-v89", added 'coach.html' to CORE. Removed vapid-check.js.

## 4. Errors Fixed This Session
- **Wrong Classic recategorization** (split Body into Nutrition/Water/Caffeine tiles + redundant body.html). Fixed: single Body hub tile (Option A), commit 985e09e. body.html is a HUB; po-water's weight/caffeine refs are formula INPUTS not duplicates.
- **MCP v1 wrong keys** (per-key rows don't exist; app_state is bundles). Fixed in v2 with BUNDLE map.
- **Vercel Hobby 12-function limit.** Removed unused api/vapid-check.js, commit 29db5cc.
- **Water write didn't show (3→4).** po_water_v1 merges last-write-wins by `_ts`; add_water wrote without `_ts`. Fixed by stamping `w._ts`, commit c4718a4.
- **Latent log_sleep/log_weight bugs** (didn't stamp ts). Fixed, commit ad4b99f.
- **Insight engine false-positive rate.** Switched to Welch t-test gate; Monte-Carlo chose T_MIN=3.8 (~3% FP).

## 5. THE FINISH-LINE PUNCH-LIST (do in order)
State: **~85–90% to "perfect."** 33 HTML, 17 JS, 12 API fns, ~13MB. 0 TODO markers, all internal links resolve.

1. **🔴 Lock down open API endpoints (DO FIRST — only real liability).** OPEN (no auth/401/rate-limit/origin): `nova-chat`, `food-search`, `meal-photo`, `nutrition-estimate`, `nutrition-web`, `fire-push`, `run-reminders`. MCP IS token-gated (fine). Fix = shared-secret/origin check + rate-limit.
2. **🔴 Full-dashboard JSON export/restore.** No backup today; import.html only does MFP/Strong *in*. Need one-button export/restore.
3. **🟠 Resolve two-homes fork + delete scaffolding** (demo.html, demo-constellation.html, demo-worlds.html, aurora-preview.html — KEEP demo-core.html = Command Core).
4. **🟠 Decide Nova's role.** In-app Nova = shallow GROQ chatbot, no memory, not proactive; real brain is Claude-via-MCP. Make Nova a real agent OR commit to MCP-as-brain.
5. **🟠 Proactivity.** Wire #1 insight into morning.html briefing + weekly push nudge.
6. **🟡 Consistency pass.** po-water.html OFF aurora design system; coach.html no bottom nav.
7. **🟡 Smoke-test + global error toast.**

Priority read: 1–3 remove real risk + stop shipping scaffolding. 4–5 are the soul ("very good" → "out of this world"). 6–7 final shine. **Recommended: start at #1, work down one at a time.**

## 6. Next Step
Saving complete. Natural next action = start punch-list **#1 (lock down open API endpoints)** — the only real liability. Confirm before beginning.
