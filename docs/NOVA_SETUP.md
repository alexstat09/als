# Conversational Nova — one-time setup (~2 min, FREE)

This turns on the **chat with Nova** experience: a real, streaming AI coach that
you can talk to, and that answers from your *live* data — training, sleep,
recovery, nutrition, habits, goals.

It runs on **Groq's free API** — **no credit card**, fast, and available
worldwide (including Switzerland, where Google's Gemini free tier is *not*
offered). Until you add the key below, the chat page loads but Nova replies
"my brain isn't connected yet" — nothing else is affected.

## How it works
- `nova-chat.html` streams your messages to a serverless function
  `/api/nova-chat`, which holds the API key **server-side** (never in the
  browser), assembles a compact snapshot of your current data from Supabase, and
  streams the reply back token-by-token.
- Model: **`llama-3.3-70b-versatile`** (smart, fast, free on Groq). Change it
  anytime with an optional `GROQ_MODEL` env var.

## 1. Get a free Groq API key
1. Go to **https://console.groq.com/keys** and sign in (Google/GitHub/email — no card).
2. Click **Create API Key** → copy it (starts with `gsk_...`).

## 2. Add it to Vercel
Vercel → your **als** project → **Settings → Environment Variables** (Production):

| Name | Value |
|------|-------|
| `GROQ_API_KEY` | the `gsk_...` key from step 1 |

*(Optional)* `GROQ_MODEL` = `llama-3.1-8b-instant` for an even faster, lighter model.

Then **redeploy** (Deployments → ⋯ → Redeploy, or push any commit).

## 3. Use it
- On any page, tap the **Nova** crystal → the briefing pops up → tap **✦ Talk to me**.
- Or open `nova-chat.html` directly.
- Ask anything: *"How should I train today?"*, *"Am I on track with my recomp?"*,
  *"Why's my sleep off this week?"*, *"Give me a pep talk."*

## Nutrition: "🔍 Find the exact product online" (optional, FREE)
The AI Describe tab has a web-search button that finds a *specific branded
product's real label* online. It works in two reliable steps: we run the web
search ourselves (so the request stays small — no "request too large" errors),
then a fast model reads only those results and extracts the per-100g label,
which we validate against the macros and scale to your serving. The source
domain is shown ("✓ Verified from …").

To enable it, add **one free key** (no credit card):
1. Go to **https://tavily.com** → sign up → copy your API key (`tvly-...`).
2. Vercel → **als** → Settings → Environment Variables (Production):

| Name | Value |
|------|-------|
| `TAVILY_API_KEY` | the `tvly-...` key (free tier: 1000 searches/month) |

Then redeploy. (Parsing reuses your existing `GROQ_API_KEY`.) Until it's added,
the web button cleanly offers Nova's estimate instead — nothing breaks.
*(Optional)* `GROQ_WEB_PARSE_MODEL` overrides the parsing model.

## Notes
- The conversation is stored locally on the device (`nova:chat:v1`) — tap **Clear**
  to wipe it.
- Nova never writes to your data — she reads it to advise you.
- Groq's free tier is generous (plenty for daily personal use). If you ever hit a
  busy-minute limit, Nova says so and you wait a moment.
- The old `GEMINI_API_KEY` env var is no longer used — you can remove it.
- The backend is provider-agnostic (same data brief + persona); swapping to a
  different provider later is a small change to `/api/nova-chat`.
