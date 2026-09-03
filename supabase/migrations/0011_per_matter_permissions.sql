-- Per-matter user permissions.
--
-- matter_assignments becomes the access-control list for who can see a matter.
-- matters.assigned_user_id stays as a display-only "primary attorney" field and
-- is no longer consulted for access. Firm owner sees every matter in the firm;
-- a member sees only matters they're assigned to (default: none). deadlines,
-- documents, timeline_events and document storage files all inherit visibility
-- from their parent matter.
--
-- Run this whole file in the Supabase SQL Editor. It is one transaction: if any
-- statement fails, nothing is applied.

begin;

-- Role helper: mirrors get_my_firm_id() (STABLE SECURITY DEFINER SQL, reads the
-- caller's own users row bypassing RLS). Returns NULL when the caller has no
-- profile row yet, which fails closed everywhere it's used.
create or replace function public.get_my_role()
returns text
language sql
stable
security definer
as $$
  select role from public.users where id = auth.uid()
$$;

-- The access-control list: one row per (matter, user) that can see the matter.
create table public.matter_assignments (
  id uuid primary key default gen_random_uuid(),
  matter_id uuid not null references public.matters(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  firm_id uuid not null,
  created_at timestamptz not null default now(),
  unique (matter_id, user_id)
);

-- Index for "who is on this matter" lookups (the unique constraint already
-- indexes (matter_id, user_id), so this is a small redundancy kept per spec).
create index matter_assignments_matter_id_idx on public.matter_assignments (matter_id);

-- Index for "which matters is this user on" lookups (used by the matters SELECT
-- policy and the owner's per-member matter counts).
create index matter_assignments_user_id_idx on public.matter_assignments (user_id);

-- PostgREST reaches the table as the anon/authenticated roles; RLS below does
-- the real gating. New tables receive no grants by default.
grant select, insert, update, delete on table public.matter_assignments to anon, authenticated;

-- Enable RLS (the project's "ensure_rls" event trigger, which fires on
-- ddl_command_end and calls a rls_auto_enable() function, already does
-- this for new public tables; this line is explicit for clarity and
-- re-runs). Corrected from an earlier version of this comment that
-- called the trigger itself "rls_auto_enable" -- that's actually the
-- name of the function the trigger calls, not the trigger.
alter table public.matter_assignments enable row level security;

-- SELECT: anyone in the firm can read the firm's assignment rows (needed for the
-- owner's "who has access to what" view; harmless for members).
create policy "View assignments in your firm"
  on public.matter_assignments
  for select
  using (firm_id = get_my_firm_id());

-- INSERT: a member may add only themselves, and only while the matter has no
-- assignments yet (this is how the matter creator is auto-assigned on create,
-- and only on create -- it can't be used to self-add to an existing matter);
-- the owner may add anyone, anytime. Both firm-scoped.
create policy "Self-assign on create, or owner assigns anyone"
  on public.matter_assignments
  for insert
  with check (
    firm_id = get_my_firm_id()
    and (
      (
        user_id = auth.uid()
        and not exists (
          select 1 from public.matter_assignments x
          where x.matter_id = matter_assignments.matter_id
        )
      )
      or get_my_role() = 'owner'
    )
  );

-- UPDATE: owner only.
create policy "Only the owner edits assignments"
  on public.matter_assignments
  for update
  using (firm_id = get_my_firm_id() and get_my_role() = 'owner')
  with check (firm_id = get_my_firm_id() and get_my_role() = 'owner');

-- DELETE (un-assign): owner only.
create policy "Only the owner removes assignments"
  on public.matter_assignments
  for delete
  using (firm_id = get_my_firm_id() and get_my_role() = 'owner');

-- Shared visibility check for a matter's child rows. SECURITY DEFINER so its
-- reads of matters / matter_assignments bypass those tables' own RLS (prevents
-- recursion). True when the matter is in my firm AND (I'm the owner OR I'm
-- assigned to it).
create or replace function public.user_can_access_matter(p_matter_id uuid)
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1
    from public.matters m
    where m.id = p_matter_id
      and m.firm_id = get_my_firm_id()
      and (
        get_my_role() = 'owner'
        or exists (
          select 1
          from public.matter_assignments ma
          where ma.matter_id = m.id
            and ma.user_id = auth.uid()
        )
      )
  )
$$;

-- Replace the single FOR ALL policy on matters with per-command policies.
drop policy if exists "Users can manage their firm's matters" on public.matters;

-- SELECT: firm-scoped; owner sees all, a member sees only assigned matters.
create policy "View matters you're assigned to (owner sees all)"
  on public.matters
  for select
  using (
    firm_id = get_my_firm_id()
    and (
      get_my_role() = 'owner'
      or exists (
        select 1 from public.matter_assignments
        where matter_assignments.matter_id = matters.id
          and matter_assignments.user_id = auth.uid()
      )
    )
  );

-- INSERT: any member of the firm may create a matter (the server action inserts
-- the creator's assignment row in the same operation).
create policy "Create matters in your firm"
  on public.matters
  for insert
  with check (firm_id = get_my_firm_id());

-- UPDATE: same rule as SELECT, on both the existing row and the updated row
-- (the with_check also blocks moving a matter to another firm).
create policy "Edit matters you're assigned to (owner edits all)"
  on public.matters
  for update
  using (
    firm_id = get_my_firm_id()
    and (
      get_my_role() = 'owner'
      or exists (
        select 1 from public.matter_assignments
        where matter_assignments.matter_id = matters.id
          and matter_assignments.user_id = auth.uid()
      )
    )
  )
  with check (
    firm_id = get_my_firm_id()
    and (
      get_my_role() = 'owner'
      or exists (
        select 1 from public.matter_assignments
        where matter_assignments.matter_id = matters.id
          and matter_assignments.user_id = auth.uid()
      )
    )
  );

-- DELETE: owner only.
create policy "Only the owner deletes matters"
  on public.matters
  for delete
  using (firm_id = get_my_firm_id() and get_my_role() = 'owner');

-- deadlines: swap firm-through-matter scoping for matter-visibility scoping,
-- keeping the single FOR ALL policy shape it has today.
drop policy if exists "Users can manage their firm's deadlines" on public.deadlines;
create policy "Manage deadlines for matters you can access"
  on public.deadlines
  for all
  using (user_can_access_matter(matter_id))
  with check (user_can_access_matter(matter_id));

-- documents: same treatment.
drop policy if exists "Users can manage their firm's documents" on public.documents;
create policy "Manage documents for matters you can access"
  on public.documents
  for all
  using (user_can_access_matter(matter_id))
  with check (user_can_access_matter(matter_id));

-- timeline_events: same treatment.
drop policy if exists "Users can manage their firm's timeline events" on public.timeline_events;
create policy "Manage timeline events for matters you can access"
  on public.timeline_events
  for all
  using (user_can_access_matter(matter_id))
  with check (user_can_access_matter(matter_id));

-- storage: document files are stored under "<matter_id>/<file>" in the
-- 'documents' bucket. Scope file access to matter visibility so a member can't
-- pull a file from an unassigned matter by direct URL. (Beyond STEP 2's four
-- tables -- same "documents inherit matter visibility" rule, and the plan tests
-- direct-URL access. Drop this statement to handle storage separately.)
drop policy if exists "Users can manage their firm's document files" on storage.objects;
create policy "Manage document files for matters you can access"
  on storage.objects
  for all
  to authenticated
  using (
    bucket_id = 'documents'
    and exists (
      select 1 from public.matters
      where matters.id::text = (storage.foldername(name))[1]
        and user_can_access_matter(matters.id)
    )
  )
  with check (
    bucket_id = 'documents'
    and exists (
      select 1 from public.matters
      where matters.id::text = (storage.foldername(name))[1]
        and user_can_access_matter(matters.id)
    )
  );

-- Backfill: every matter that names a primary attorney gets an explicit
-- assignment for that user, so nobody who can see a matter today loses access
-- when the new SELECT policy takes effect.
insert into public.matter_assignments (matter_id, user_id, firm_id)
select id, assigned_user_id, firm_id
from public.matters
where assigned_user_id is not null
on conflict (matter_id, user_id) do nothing;

commit;
