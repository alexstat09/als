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

## Notes
- The conversation is stored locally on the device (`nova:chat:v1`) — tap **Clear**
  to wipe it.
- Nova never writes to your data — she reads it to advise you.
- Groq's free tier is generous (plenty for daily personal use). If you ever hit a
  busy-minute limit, Nova says so and you wait a moment.
- The old `GEMINI_API_KEY` env var is no longer used — you can remove it.
- The backend is provider-agnostic (same data brief + persona); swapping to a
  different provider later is a small change to `/api/nova-chat`.
