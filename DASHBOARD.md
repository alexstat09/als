# Alex's Personal Dashboard

A mobile-first personal dashboard with five trackers, cloud sync, and a home-screen PWA icon. Built as plain HTML/CSS/JS — no framework, no build step.

---

## Pages

| File | What it does |
|---|---|
| `index.html` | **Goals** — daily goal tracking with a ticker and progress cards |
| `health.html` | **Health Stack** — supplement tracker + water tracker embedded at the bottom |
| `gym.html` | **Fitness** — progressive overload coach, weight log, progress photos |
| `finance.html` | **Finance** — net worth, subscriptions, orders, wishlist (own internal bottom nav) |
| `po-water.html` | **Water Tracker** — standalone page, also embeds inside health.html via iframe |

---

## Shared files

| File | What it does |
|---|---|
| `topbar.js` | Injects the sticky top bar (water pill + finance button) and bottom tab bar (Main / Health / Fitness) on every page except finance.html and iframes |
| `sync.js` | Shared cloud-sync helper — each page calls `initCloudSync({...})` to push/pull its localStorage keys to Supabase in real time |
| `manifest.json` | PWA manifest — enables Add to Home Screen |
| `icon.svg` | App icon (SVG, used in manifest) |
| `icon-192.png` / `icon-512.png` | PNG icons for Android home screen |
| `apple-touch-icon.png` | 180×180 PNG for iOS home screen |

---

## Navigation

```
┌─────────────────────────────────────┐
│  [💧 2/8  +]              [📊]      │  ← sticky top bar (all pages except finance)
├─────────────────────────────────────┤
│                                     │
│           page content              │
│                                     │
├─────────────────────────────────────┤
│   🏠 Main   💊 Health   💪 Fitness  │  ← fixed bottom tab bar
└─────────────────────────────────────┘
```

- **Water pill** — shows today's progress, tapping goes to health.html#water, "+" logs a drink instantly
- **Finance button** — opens finance.html which has its own internal 4-tab nav and no shared chrome
- **Bottom tabs** — active tab is highlighted, icons are grayscale

---

## Cloud sync (Supabase)

### How it works
Every page syncs its localStorage keys to a single `public.app_state` table in Supabase. Changes push within ~250ms. Realtime subscriptions pull changes from other devices instantly.

### Sync keys per page
| Page | Supabase `key` | localStorage keys synced |
|---|---|---|
| Goals (`index.html`) | `goals` | `goals:*` (all keys with this prefix) |
| Health (`health.html`) | `health` | `stack:items`, `stack:version`, `stack:low`, `po_water_v1`, `stack:taken:*` |
| Water (`po-water.html`) | `health` | `po_water_v1` (only when loaded standalone) |
| Fitness (`gym.html`) | `po-coach` | `po_coach_v1`, `po_coach_workout_done`, `po_coach_weights`, `po_coach_photos` |
| Finance (`finance.html`) | `finance` | `subs`, `wishlist`, `incoming_orders`, `nw_currency`, `nw:activity`, `nw:history`, `nw:*` |

### Progress photos
Photos are stored in **Supabase Storage** (`progress-photos` bucket), not in the database row. The JSONB row only stores the public URL. This prevents the row from hitting Supabase's size limits.

- New photo → compressed locally → uploaded to Storage → URL saved → dataUrl deleted
- Sync pushes URL-only entries; local pending-upload photos are never stripped until they have a URL
- On another device: remote URL photos merge with any local pending-upload photos

### Required Supabase setup
**Table:**
```sql
create table public.app_state (
  key        text primary key,
  data       jsonb not null default '{}',
  updated_at timestamptz not null default now()
);
alter table public.app_state enable row level security;
create policy "anon select" on public.app_state for select to anon using (true);
create policy "anon insert" on public.app_state for insert to anon with check (true);
create policy "anon update" on public.app_state for update to anon using (true);
```

**Storage bucket:** `progress-photos` — set to **Public**. Add an anon INSERT policy so uploads work.

---

## Credentials

Stored in two places in the repo (both need the same values):

| File | Variable |
|---|---|
| `topbar.js` | `TOPBAR_SUPABASE_URL` / `TOPBAR_SUPABASE_KEY` |
| `gym.html` | `SUPABASE_URL` / `SUPABASE_KEY` |
| `sync.js` | `SUPABASE_URL` / `SUPABASE_KEY` |

---

## iOS / PWA

- All pages have `viewport-fit=cover` and `<link rel="manifest">`
- Top bar uses `env(safe-area-inset-top)` so the Dynamic Island doesn't cover the pills
- Bottom bar uses `env(safe-area-inset-bottom)` so tabs clear the home indicator
- `body.has-bottombar` adds `padding-bottom` so page content isn't hidden behind the tab bar
- Add to Home Screen: iOS → Safari → Share → Add to Home Screen

---

## Deployment

Deployed on **Vercel** via the GitHub repo `alexstat09/als`. Every push to `main` triggers an automatic redeploy.

**⚠️ Privacy:** The site URL is public and the Supabase key is visible in source. To lock it down, enable **Password Protection** in Vercel → Settings → Deployment Protection.
