-- ════════════════════════════════════════════════════════════════════════
-- AURORA · migration 001 — give every row an owner, then lock the table.
--
-- WHY: app_state rows are keyed by `key` alone and RLS lets anonymous
-- requests through, so the publishable key in sync.js is enough to read
-- (and write) everything. The login gate protects the UI, not the data.
-- This makes the DATABASE enforce the split — which is also exactly what
-- is needed before a second person (Chrissie) gets an account.
--
-- HOW TO RUN: Supabase dashboard → SQL Editor → paste this whole file → Run.
-- It is safe to run twice (every step is idempotent).
-- Nothing is deleted. Only a column is added and policies are replaced.
-- ════════════════════════════════════════════════════════════════════════

-- ── 0. Who is the owner? (must match the email you log in with) ──────────
--    If this returns 0 rows, STOP — log into the app once first.
select id as owner_user_id, email, created_at
from auth.users
where email = 'astathatos09@gmail.com';


-- ── 1. Add the owner column (nullable for now, so nothing breaks) ────────
alter table public.app_state
  add column if not exists user_id uuid references auth.users(id) on delete cascade;


-- ── 2. Stamp EVERY existing row as yours ─────────────────────────────────
--    All 26 rows currently have no owner. They are all yours.
update public.app_state
   set user_id = (select id from auth.users where email = 'astathatos09@gmail.com')
 where user_id is null;

--    Guard: if any row is still unowned, the rest of this script would make
--    it invisible. Refuse to continue rather than orphan your data.
do $$
declare orphans int;
begin
  select count(*) into orphans from public.app_state where user_id is null;
  if orphans > 0 then
    raise exception 'ABORT: % app_state row(s) still have no user_id — did the email match?', orphans;
  end if;
end $$;


-- ── 3. Now it can be required, and the key becomes (owner, key) ──────────
--    Two people may both have a row called 'sleep'; only the pair is unique.
alter table public.app_state alter column user_id set not null;

alter table public.app_state drop constraint if exists app_state_pkey;
alter table public.app_state add  constraint app_state_pkey primary key (user_id, key);

create index if not exists app_state_user_idx on public.app_state (user_id);


-- ── 4. Replace every existing policy with: you can only touch your rows ──
--    (Drops whatever is there now, whatever it was called — that is what is
--     currently letting anonymous requests read everything.)
do $$
declare p record;
begin
  for p in select policyname from pg_policies
            where schemaname = 'public' and tablename = 'app_state'
  loop
    execute format('drop policy %I on public.app_state', p.policyname);
  end loop;
end $$;

alter table public.app_state enable row level security;

create policy "own rows only"
  on public.app_state
  for all
  to authenticated
  using      (auth.uid() = user_id)
  with check (auth.uid() = user_id);

--    Belt and braces: anonymous visitors get no access to this table at all.
--    (The service-role key used by cron / Vault / MCP bypasses RLS and is
--     unaffected by any of this.)
revoke all on public.app_state from anon;


-- ── 5. Proof it worked ───────────────────────────────────────────────────
select
  (select count(*) from public.app_state)                        as total_rows,
  (select count(*) from public.app_state where user_id is null)  as unowned_rows,   -- must be 0
  (select count(*) from pg_policies
     where schemaname='public' and tablename='app_state')        as policies;       -- must be 1
