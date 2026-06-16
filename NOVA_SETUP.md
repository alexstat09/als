# Conversational Nova — one-time setup (~2 min)

This turns on the **chat with Nova** experience: a real, streaming AI coach
(powered by Claude) that you can talk to, and that answers from your *live*
data — training, sleep, recovery, nutrition, habits, goals.

Until you add the key below, the chat page loads but Nova replies "my brain
isn't connected yet" — nothing else in the app is affected.

## How it works
- The page `nova-chat.html` streams your messages to a serverless function
  `/api/nova-chat`, which holds the Anthropic API key **server-side** (never in
  the browser), assembles a compact snapshot of your current data from Supabase,
  and streams Claude's reply back token-by-token.
- Model: **`claude-opus-4-8`** (Anthropic's most capable Opus). Replies are
  short and coach-like; each call reads your latest data so Nova is always current.

## 1. Get an Anthropic API key
1. Go to **https://console.anthropic.com** → sign in.
2. **Settings → API Keys → Create Key**. Copy it (starts with `sk-ant-...`).
3. You'll need a little credit on the account (Billing) — Opus is ~$5 / 1M input
   tokens, and each chat turn is tiny, so real use costs cents.

## 2. Add it to Vercel
Vercel → your **als** project → **Settings → Environment Variables** (Production):

| Name | Value |
|------|-------|
| `ANTHROPIC_API_KEY` | the `sk-ant-...` key from step 1 |

Then **redeploy** (Deployments → ⋯ → Redeploy, or push any commit).

## 3. Use it
- On any page, tap the **Nova** crystal → the briefing pops up → tap **✦ Talk to me**.
- Or open `nova-chat.html` directly.
- Ask anything: *"How should I train today?"*, *"Am I on track with my recomp?"*,
  *"Why's my sleep off this week?"*, *"Give me a pep talk."*

## Notes
- The conversation is stored locally on the device (`nova:chat:v1`) — tap **Clear**
  to wipe it.
- The chat function has a 60s max duration (clamped to your plan's limit) so
  streamed replies always finish.
- Nova never writes to your data — she reads it to advise you.
- Remove the env var to cleanly turn the feature off again.
