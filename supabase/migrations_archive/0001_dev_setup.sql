-- Dev-only setup for the Matters feature.
-- There's no auth yet, so the app talks to Supabase with the anon
-- (publishable) key. These policies open up read/write access on
-- existing tables so the app works today. TIGHTEN OR REMOVE these
-- once auth/firm scoping is added.
--
-- CAUTION: this ALTERs RLS on tables that already existed before this
-- migration (matters, clients). If either table currently has RLS
-- disabled, enabling it will restrict access to whatever roles have a
-- matching policy — review this against any other consumers of these
-- tables before running it against a database with real data.

alter table public.matters enable row level security;

create policy "Allow anon full access to matters"
  on public.matters
  for all
  to anon
  using (true)
  with check (true);

alter table public.clients enable row level security;

create policy "Allow anon read access to clients"
  on public.clients
  for select
  to anon
  using (true);

-- Seed a single dev firm so the app can use it as matters.firm_id
-- until firm selection/auth exists. firms has no anon insert policy
-- (intentionally), so this must be run with elevated access (SQL
-- Editor / Table Editor), not via the app's anon key.
-- The id below must match DEV_FIRM_ID in src/lib/constants.ts —
-- update both together if you re-seed with a different id.
insert into public.firms (id, name)
values ('a07e2a73-e861-4122-a4fe-adf1e0cc99d5', 'Test Firm')
on conflict (id) do nothing;
