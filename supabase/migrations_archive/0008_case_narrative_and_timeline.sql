-- Case narrative + timeline of events for matters.

-- Free-form long-form text where the case's facts/story live. Nullable —
-- empty until someone writes it. matters already has firm-scoped RLS
-- (0007), which applies to all columns of a row, so no policy changes
-- are needed here.
alter table public.matters
  add column narrative text;

-- Dev-only: same "open for dev" approach used for matters/clients/
-- deadlines/documents in 0001/0003/0004, before auth existed. This
-- table doesn't have its own firm_id — like deadlines and documents,
-- it's scoped to a firm through its matter's firm_id — so once the
-- Supabase JWT/PostgREST bug blocking authenticated RLS testing is
-- fixed, this should get the same firm-scoped policy treatment 0007
-- gave deadlines/documents (drop the anon policy below, scope through
-- matters.firm_id via matter_id). TIGHTEN OR REMOVE at that point.
create table public.timeline_events (
  id uuid primary key default gen_random_uuid(),
  matter_id uuid not null references public.matters(id) on delete cascade,
  title text not null,
  event_date date not null,
  description text,
  created_at timestamptz not null default now()
);

alter table public.timeline_events enable row level security;

create policy "Allow anon full access to timeline events"
  on public.timeline_events
  for all
  to anon
  using (true)
  with check (true);
