-- ════════════════════════════════════════════════════════════════════════
-- AURORA · migration 002 — give Chrissie her own running history.
--
-- CONTEXT: run.html is HER app, but until now she signed in as Alex, so her
-- 515 runs live in the `run` row of HIS account. Migration 001 stamped every
-- unowned row as Alex's — correct, but it means that when she signs in as
-- HERSELF for the first time, her app would open empty.
--
-- This COPIES (never moves, never deletes) her running data into her account.
-- Alex keeps his copy; nothing of his is touched.
--
-- RUN THIS ONLY AFTER:
--   1. migration 001 has run, AND
--   2. Chrissie has created her account in the app (so auth.users has her row).
--
-- Safe to run twice: it will not clobber her data if she has already started
-- using her own account (see the guard in step 2).
-- ════════════════════════════════════════════════════════════════════════

-- ── 0. Set her email here, then check she exists. If 0 rows: she has not
--       created her account yet — STOP and do that first. ─────────────────
select id as chrissie_user_id, email, created_at
from auth.users
where email = 'CHRISSIE_EMAIL_HERE';


-- ── 1. What she is about to receive (sanity check — expect ~515 run:logs) ──
select
  jsonb_array_length(coalesce(data->'run:logs', '[]'::jsonb)) as runs,
  jsonb_array_length(coalesce(data->'run:plan', '[]'::jsonb)) as plan_items,
  updated_at
from public.app_state
where key = 'run'
  and user_id = (select id from auth.users where email = 'astathatos09@gmail.com');


-- ── 2. Copy the run bundle into her account ───────────────────────────────
--    ON CONFLICT DO NOTHING is the guard: if she already has a `run` row with
--    her own data in it, this refuses to overwrite it. Copying is never
--    destructive.
insert into public.app_state (user_id, key, data, updated_at)
select
  (select id from auth.users where email = 'CHRISSIE_EMAIL_HERE'),
  'run',
  data,
  now()
from public.app_state
where key = 'run'
  and user_id = (select id from auth.users where email = 'astathatos09@gmail.com')
on conflict (user_id, key) do nothing;


-- ── 3. Proof: she now has her runs, and Alex still has his copy ───────────
select
  u.email,
  jsonb_array_length(coalesce(s.data->'run:logs', '[]'::jsonb)) as runs
from public.app_state s
join auth.users u on u.id = s.user_id
where s.key = 'run';
