-- ════════════════════════════════════════════════════════════════════════
-- AURORA · migration 002 — give Chrissie her own running history.
--
-- CONTEXT: run.html is HER app, but until now she signed in as Alex, so her
-- 515 runs live in the `run` row of HIS account. Migration 001 stamped every
-- unowned row as Alex's — correct, but it means that when she signs in as
-- HERSELF for the first time, her app could open empty.
--
-- This COPIES (never moves, never deletes) her running data into her account.
-- Alex keeps his copy; nothing of his is touched.
--
--   Alex     astathatos09@gmail.com   1655556c-97af-43ac-970f-fcbdbd8f7f0c
--   Chrissie ckymmas@hotmail.com      c9f571f5-e12b-4843-8e14-2225d2969168
--
-- RUN THIS BEFORE she opens the running app signed in as herself. If she opens
-- it first on a phone with no local data, her app would sync an EMPTY `run` row
-- into her account, and step 2 below (which refuses to overwrite) would then
-- decline to copy her runs.
--
-- Safe to run twice.
-- ════════════════════════════════════════════════════════════════════════

-- ── 1. What she is about to receive (expect ~515 runs) ────────────────────
select
  jsonb_array_length(coalesce(data->'run:logs',  '[]'::jsonb)) as runs,
  jsonb_array_length(coalesce(data->'run:plan',  '[]'::jsonb)) as plan_items,
  jsonb_array_length(coalesce(data->'run:shoes', '[]'::jsonb)) as shoes,
  updated_at
from public.app_state
where key = 'run'
  and user_id = '1655556c-97af-43ac-970f-fcbdbd8f7f0c';   -- Alex


-- ── 2. Copy the whole run bundle into her account ─────────────────────────
--    (run:logs, run:plan, run:profile, run:shoes, run:shifts, run:strength)
--    ON CONFLICT DO NOTHING is the guard: if she already has a `run` row, this
--    refuses to touch it. Copying is never destructive.
insert into public.app_state (user_id, key, data, updated_at)
select
  'c9f571f5-e12b-4843-8e14-2225d2969168',                  -- Chrissie
  'run',
  data,
  now()
from public.app_state
where key = 'run'
  and user_id = '1655556c-97af-43ac-970f-fcbdbd8f7f0c'     -- Alex
on conflict (user_id, key) do nothing;


-- ── 3. Proof: she has her runs, and Alex still has his copy ───────────────
select
  u.email,
  jsonb_array_length(coalesce(s.data->'run:logs', '[]'::jsonb)) as runs,
  s.updated_at
from public.app_state s
join auth.users u on u.id = s.user_id
where s.key = 'run'
order by u.email;
