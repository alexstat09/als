# Lock down your data — one-time setup (~10 min)

Your dashboard now has a **login gate** (email + password) on every page. The real
protection is **Supabase Row-Level Security (RLS)**: once enabled, only your
logged-in session (and the server, via a service key) can read or write your data
— anyone else with the URL gets nothing.

Do the steps **in this order** so you never lock yourself out. The login screen
already works the moment this deploys; RLS is what actually seals it.

---

## 1. Create your account (in the app)
1. Open your dashboard. You'll see the **AURORA login** screen.
2. Tap **Create account**, enter your email + a password, tap **Create account**.
3. If Supabase asks you to confirm your email, click the link it sends, then come
   back and **Log in**.
   - *(Optional, for instant signup with no email step: Supabase → **Authentication
     → Providers → Email** → turn **off** "Confirm email".)*
4. You're in. Do this once on each device (the session stays signed in after).

## 2. Turn on Row-Level Security (Supabase → SQL Editor → run this)
```sql
alter table public.app_state enable row level security;

drop policy if exists "authenticated full access" on public.app_state;
create policy "authenticated full access" on public.app_state
  for all
  to authenticated
  using (true)
  with check (true);
```
This blocks the anonymous (public) key entirely and allows only logged-in
sessions. (The server uses the service-role key, which bypasses RLS — see step 4.)

## 3. Stop anyone else from signing up
Supabase → **Authentication → Providers → Email** (or **Authentication → Settings**)
→ turn **off** "Allow new users to sign up".
Now your account is the only one that exists, so "logged in" = you.

## 4. Give the server its key (so reminders + Nova keep working)
1. Supabase → **Project Settings → API → Project API keys** → copy the
   **`service_role`** secret (NOT the publishable one — keep this private).
2. Vercel → **als → Settings → Environment Variables** (Production) → add:

   | Name | Value |
   |------|-------|
   | `SUPABASE_SERVICE_ROLE_KEY` | the `service_role` secret |

3. **Redeploy.**

---

## That's it
- Direct database access with the public key is now **denied** — your data is
  private to your login.
- The push-reminder cron and Nova's data brief run on the server with the
  service-role key, so they keep working.
- To log out of a device: it'll re-prompt after `window.ALSAuth.signOut()` (a
  Sign-out button can be added to the top bar later if you want one).

### If you ever get stuck on the login screen
The gate is **fail-open by design** — it never blocks you due to a bug. If a real
login problem happens, you can always manage your account/data from the Supabase
dashboard directly. Your data is never deleted by any of this.

### Residual note (smaller, optional follow-up)
`/api/nova-chat` still answers anyone who calls it directly (it returns a coaching
brief built from your data). The DB itself is now locked; if you want, we can also
require your login token on that endpoint later.
