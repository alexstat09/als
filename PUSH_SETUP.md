# Push notifications — one-time setup (~10 min)

This turns on the gym **rest-timer alert that buzzes your iPhone with sound even
while you're in Instagram or the screen is locked**, and lays the groundwork for
daily reminders + the talking Nova later.

Until you finish these steps, the app behaves exactly as before (in-app beep
only) — nothing is broken in the meantime.

## How it works
When you leave the app mid-rest, it asks a tiny serverless function (already in
`/api`) to schedule a Web Push via **QStash** that fires at your rest end-time.
The service worker shows it. No data is stored server-side — your push
subscription is passed through per request.

## 1. Get VAPID keys (the push signing keys)
On your computer, run:
```
npx web-push generate-vapid-keys
```
It prints a **Public Key** and a **Private Key**. (No npm? use https://vapidkeys.com.)

## 2. Get a free QStash token (the scheduler)
1. Sign up at https://upstash.com (free).
2. Open **QStash** → copy the **QSTASH_TOKEN**.

## 3. Add 4 environment variables in Vercel
Vercel → your `als` project → **Settings → Environment Variables** → add (Production):

| Name | Value |
|------|-------|
| `VAPID_PUBLIC_KEY`  | the public key from step 1 |
| `VAPID_PRIVATE_KEY` | the private key from step 1 |
| `VAPID_SUBJECT`     | `mailto:astathatos09@gmail.com` |
| `QSTASH_TOKEN`      | the token from step 2 |

Then **redeploy** (Deployments → ⋯ → Redeploy, or just push any commit).

## 4. On your iPhone (once)
1. Open the site in Safari → Share → **Add to Home Screen**.
2. Open it from the **Home Screen icon** (push only works for installed PWAs on iOS).
3. Start a workout, open the rest popup, tap **🔔 Alert me when rest ends**, tap **Allow**.

## Test it
Start a workout → check off a set so rest starts → swipe to another app → wait.
You should get a **"Rest complete 💪"** notification with sound. Tap it to jump back.

## Notes
- `/api/fire-push` is intentionally lenient (returns 200 on a dead subscription)
  so QStash never retry-storms.
- If push ever misbehaves, removing the env vars disables it cleanly — the app
  falls back to the in-app beep with no errors.
- Daily reminders (8am weigh-in, protein, caffeine cutoff, "no training in 3
  days") will reuse this same setup via a scheduled job — a later add-on.
