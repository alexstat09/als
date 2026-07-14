-- ════════════════════════════════════════════════════════════════════════
-- AURORA · ROLLBACK for migration 001.
--
-- Use this ONLY if something breaks after 001 and you want the app working
-- again immediately. It puts the table back exactly how it was: key alone is
-- the primary key, and the app can talk to it without a session.
--
-- It does NOT delete anything. The user_id column is left in place (harmless,
-- and it means re-running 001 later is instant). Your data is never touched by
-- either script — 001 only ADDS an owner column; it has no delete, no drop
-- table, no truncate.
--
-- Supabase dashboard → SQL Editor → paste → Run.
-- ════════════════════════════════════════════════════════════════════════

-- 1. Back to the old primary key (key alone)
alter table public.app_state drop constraint if exists app_state_pkey;
alter table public.app_state add  constraint app_state_pkey primary key (key);

-- 2. Owner no longer required
alter table public.app_state alter column user_id drop not null;

-- 3. Remove the strict policy and re-open access (this is the OLD, leaky state
--    — only do this to get working again, and tell Claude so we fix it properly)
drop policy if exists "own rows only" on public.app_state;

grant all on public.app_state to anon, authenticated;

create policy "open access (legacy)"
  on public.app_state
  for all
  to anon, authenticated
  using (true)
  with check (true);

-- 4. Proof: rows still all there
select count(*) as total_rows from public.app_state;
