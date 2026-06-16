# Conversational Nova — one-time setup (~2 min, FREE)

This turns on the **chat with Nova** experience: a real, streaming AI coach that
you can talk to, and that answers from your *live* data — training, sleep,
recovery, nutrition, habits, goals.

It runs on **Google Gemini's free API** — **no credit card**, a daily limit far
bigger than one person needs. Until you add the key below, the chat page loads
but Nova replies "my brain isn't connected yet" — nothing else is affected.

## How it works
- `nova-chat.html` streams your messages to a serverless function
  `/api/nova-chat`, which holds the API key **server-side** (never in the
  browser), assembles a compact snapshot of your current data from Supabase, and
  streams the reply back token-by-token.
- Model: **`gemini-2.5-flash`** (fast, free, genuinely good for a data-grounded
  coach). Change it anytime with an optional `GEMINI_MODEL` env var.

## 1. Get a free Gemini API key
1. Go to **https://aistudio.google.com/apikey** and sign in with a Google account.
2. Click **Create API key** → copy it (starts with `AIza...`). No billing needed.

## 2. Add it to Vercel
Vercel → your **als** project → **Settings → Environment Variables** (Production):

| Name | Value |
|------|-------|
| `GEMINI_API_KEY` | the `AIza...` key from step 1 |

*(Optional)* `GEMINI_MODEL` = `gemini-2.0-flash` if you ever want to pin a
different free model.

Then **redeploy** (Deployments → ⋯ → Redeploy, or push any commit).

## 3. Use it
- On any page, tap the **Nova** crystal → the briefing pops up → tap **✦ Talk to me**.
- Or open `nova-chat.html` directly.
- Ask anything: *"How should I train today?"*, *"Am I on track with my recomp?"*,
  *"Why's my sleep off this week?"*, *"Give me a pep talk."*

## Notes
- The conversation is stored locally on the device (`nova:chat:v1`) — tap **Clear**
  to wipe it.
- Gemini Flash streams replies in a few seconds, well within the function limit.
- Nova never writes to your data — she reads it to advise you.
- **Want to upgrade to Claude later?** The backend is provider-agnostic — the
  data brief + persona are the same. Swapping `/api/nova-chat` to the Anthropic
  API (`claude-opus-4-8`) is a small change; ask and it's a 2-minute switch.
- Remove the env var to cleanly turn the feature off again.
