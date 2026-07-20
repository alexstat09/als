# Nova model upgrade — Hy3

Researched 2026-07-20. Everything below was verified against live APIs and
official docs, not blog posts. Blogs were wrong three separate times during
this research (free-model counts, Kimi-on-Groq, Nemotron being strongest) —
so re-verify before acting if a lot of time has passed.

---

## The decision

**Winner: `tencent/hy3` via OpenRouter.**

295B MoE (21B active), 262K context, native tool-calling, configurable
reasoning effort. Free variant is `tencent/hy3:free`.

## Why it's worth doing

Artificial Analysis Intelligence Index v4.1 — one consistent scale:

| Model | Score |
|---|---|
| `openai/gpt-oss-120b` (high) — **what Nova runs today** | 24 |
| `tencent/hy3` — the upgrade | 41 |
| Claude Sonnet 4.6 (adaptive, max effort) | 47 |

The jump from today's model to Hy3 (+17) is nearly **three times** the
remaining gap to Sonnet (+6). The current model is the weak link, by a lot.

Caveat kept deliberately: these are composite benchmark scores, not a linear
ruler. Benchmarks stress hard multi-step problems; Nova mostly does grounded
summarization and pattern-spotting over real data, where the gap compresses.
Expect a clear improvement, not a 71% one.

## Why not the alternatives

- **Nemotron 3 Ultra 550B** — bigger but *worse*: index 38, tool-calling 65%
  Sonnet-aligned vs Hy3's 73%, and a 40.6s p95 that would feel broken in chat.
  Parameter count was the wrong proxy.
- **Cerebras** — free tier caps context at **8,192 tokens**. Nova's system
  prompt + brief is ~3K, and tool results cap at 200 rows. One `find_food`
  call overflows it. Would break her tools.
- **Gemini** — free tier is still limit:0 in the EEA/Greece. See
  `api/nova-chat.js:16`; this is why Nova is on Groq in the first place.
- **Mistral** — free tier is explicitly evaluation-only, limits undisclosed.

---

## THE PRIVACY FORK — read before step 2

OpenRouter's `:free` models **require** enabling "allow providers that may
train on your data". Without it every request fails with
`404 No endpoints found matching your data policy`.

Nova's prompt contains the full daily brief: weight, measurements, meals,
sleep, caffeine, habits, journal, goals. **Chrissie's too**, when she chats —
consenting on her behalf is not Alex's to give.

Two doors. **Setup is identical either way**; the only difference is the
`:free` suffix and whether credit is loaded. Starting free costs no rework.

| | Free | Paid |
|---|---|---|
| Model ID | `tencent/hy3:free` | `tencent/hy3` |
| Cost | $0 | $0.20/M in, $0.80/M out |
| Realistic monthly | $0 | ~$0.30–0.90 (a $10 top-up lasts ~a year) |
| Trains on your data | **Yes — required** | No |
| Rate limit | 20/min, **50/day** | 20/min, 1000/day |

Note: buying $10 credit *once, ever* also raises the **free**-model ceiling to
1000/day permanently — the credit doesn't have to be spent.

For reference, the current setup (Groq) does **not** train on API data:
prompts aren't retained by default and Zero Data Retention is available. So
the free door is a genuine downgrade in privacy from where things stand today.

---

## Steps

### 1. Account
**openrouter.ai** → sign in with Google. No card required.

### 2. Only if taking the FREE door
**Settings → Privacy** → enable *"Allow providers that may train on your data"*.
Skip this entirely on the paid door.

### 3. Only if taking the PAID door
**Settings → Credits → Add Credits → $10.**

### 4. Create the key
**Settings → Keys → Create Key.** Copy immediately — shown once.
Format: `sk-or-v1-...`

### 5. Add to Vercel — do this in the dashboard, never paste the key into chat
- Vercel → the **`als`** project → **Settings → Environment Variables**
- Name: `OPENROUTER_API_KEY`
- Value: the key
- Environments: tick **Production, Preview, Development**
- Save

### 6. Hand back to Claude
Say "OpenRouter key is in Vercel, took the free/paid door". Then Claude:

- Makes `api/_model.js` **provider-aware** — an extension of the existing
  role/chain design, not a rewrite. Callers still ask for the `text` role.
- Puts Hy3 at the top of the `text` chain.
- **Keeps Groq beneath it as the fallback** — a 429, a dead key, or exhausted
  free-tier requests degrade to free-and-working, never to broken.
- Retires `llama-3.3-70b` in the same pass (see deadline below).
- No 13th serverless function — edits only, so the ≤12 Vercel cap holds.
- Leaves Nova's brief, persona, and the 4 tools **untouched**. Brain swap only.

### 7. Judge it on real data
Same real brief + same real question through Hy3 and current Groq, side by
side. If Hy3 isn't clearly better, revert — nothing lost.

---

## Deadline that stands regardless

**`llama-3.3-70b-versatile` shuts down 16 August 2026.** It is the last
fallback in the `text` chain. Nothing breaks the day it dies — `gpt-oss-120b`
sits above it — but the safety net silently thins by one model.

Free to fix, no account needed, ~15 minutes. Do this even if the Hy3 upgrade
never happens.

---

## Verified sources

- Live model list + pricing: `https://openrouter.ai/api/v1/models`
- Rate limits: https://openrouter.ai/docs/api-reference/limits
- Privacy fork: https://openrouter.ai/docs/guides/privacy/provider-logging
- Groq's real model list: https://console.groq.com/docs/models
- Groq data policy: https://console.groq.com/docs/your-data
- Benchmarks: https://artificialanalysis.ai/models/comparisons/hy3-vs-gpt-oss-120b
  and .../hy3-vs-claude-sonnet-4-6-adaptive
