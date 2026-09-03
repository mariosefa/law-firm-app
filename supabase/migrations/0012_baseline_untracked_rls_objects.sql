-- Baseline for security-critical objects that have existed live since
-- before this repo's migration history began, but were never themselves
-- captured in a migration file (see docs/audit-2026-09.md, Critical
-- finding #1). Every firm-scoping policy in 0007/0009/0010/0011 calls
-- get_my_firm_id() without it ever being defined in a tracked migration;
-- 0007's own comment names the "clients", "firms", and "users" policies
-- below as pre-existing but never gives their CREATE POLICY text.
--
-- This migration changes nothing about live behavior -- it documents
-- objects that already exist and already behave this way today. It's
-- written to be safely re-runnable (create or replace / drop-if-exists
-- + create) so applying it against the live project is a no-op.
--
-- Deliberately NOT included here: the "rls_auto_enable" event trigger
-- also flagged as untracked in the audit -- its actual definition hasn't
-- been captured yet. Add it in a follow-up migration once that's in hand.

begin;

create or replace function public.get_my_firm_id()
returns uuid
language sql
stable
security definer
as $$
  select firm_id from users where id = auth.uid()
$$;

-- clients: the one table among 0007's original six whose pre-existing
-- policy was never later dropped/replaced (matters/deadlines/documents
-- all got replaced by 0011's per-matter-access policies instead).
drop policy if exists "Users can manage their firm's clients" on public.clients;
create policy "Users can manage their firm's clients"
  on public.clients
  for all
  using (firm_id = get_my_firm_id());

-- firms: per 0007's own comment, this SELECT policy predates tracked
-- history and was never itself replaced -- 0007 only added the INSERT
-- policy alongside it.
drop policy if exists "Users can view their own firm" on public.firms;
create policy "Users can view their own firm"
  on public.firms
  for select
  using (id = get_my_firm_id());

-- users: same story as firms -- 0007 only added the two INSERT policies
-- (owner signup, invited-member join) alongside this pre-existing SELECT
-- policy.
drop policy if exists "Users can view their firm's users" on public.users;
create policy "Users can view their firm's users"
  on public.users
  for select
  using (firm_id = get_my_firm_id());

commit;
