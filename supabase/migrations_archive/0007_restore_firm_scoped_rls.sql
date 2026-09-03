-- Restore real firm-scoped security now that auth exists.
--
-- The original firm-scoped policies (using get_my_firm_id()) on clients,
-- matters, deadlines, documents, firms, and users were never removed —
-- they were just made moot. Postgres RLS policies are permissive and
-- OR together, so the wide-open "Allow anon ..." policies added in
-- 0001/0003/0004 granted full access regardless of firm, which meant
-- the firm-scoped policies underneath never actually restricted
-- anything. Dropping the anon policies is what actually re-activates
-- them; no CREATE POLICY is needed for clients/matters/deadlines/
-- documents/firms/users themselves.
--
-- Policy names below are taken from a live introspection of the
-- database (pg_policies), not from the 0001/0003/0004 migration files
-- — the documents-bucket storage policy in particular was renamed
-- directly in Supabase at some point and no longer matches what
-- 0004_documents_dev_policy.sql shows.

drop policy "Allow anon delete access to clients" on public.clients;
drop policy "Allow anon insert access to clients" on public.clients;
drop policy "Allow anon read access to clients" on public.clients;
drop policy "Allow anon update access to clients" on public.clients;
drop policy "Allow anon full access to deadlines" on public.deadlines;
drop policy "Allow anon full access to documents" on public.documents;
drop policy "Allow anon full access to matters" on public.matters;
drop policy "Allow anon full access to documents storage" on storage.objects;

-- firms and users only ever had SELECT policies ("view your own firm" /
-- "view your firm's users") — there was no way for a brand-new user to
-- create their firm or their own profile row, i.e. no way to ever sign
-- up. Add the minimal INSERT policies the signup flow needs.

-- An authenticated user with no public.users row yet (nobody has
-- signed up as them before) may create one firm — the "first person
-- creates the firm" step. Once they have a users row, this closes.
create policy "Users can create a firm during signup"
  on public.firms
  for insert
  to authenticated
  with check (
    not exists (select 1 from public.users where id = auth.uid())
  );

-- A user may only ever insert their own row (id must be their own
-- auth uid), and only as the owner of a firm that has no members yet
-- (i.e. the firm they just created in the step above, not someone
-- else's firm — this closes off using a leaked/guessed firm id to
-- join an existing firm with a self-assigned role).
create policy "Users can create their own user row as firm owner"
  on public.users
  for insert
  to authenticated
  with check (
    id = auth.uid()
    and role = 'owner'
    and not exists (
      select 1 from public.users existing_member
      where existing_member.firm_id = users.firm_id
    )
  );

-- storage.objects never had a firm-scoped policy of its own — only the
-- anon dev one just dropped above. Documents are uploaded under
-- "<matter_id>/<timestamp>-<filename>" (see documents/actions.ts), so
-- scope storage access the same way the documents table itself is
-- scoped: through the matter's firm_id.
create policy "Users can manage their firm's document files"
  on storage.objects
  for all
  to authenticated
  using (
    bucket_id = 'documents'
    and exists (
      select 1 from public.matters
      where matters.id::text = (storage.foldername(name))[1]
        and matters.firm_id = get_my_firm_id()
    )
  )
  with check (
    bucket_id = 'documents'
    and exists (
      select 1 from public.matters
      where matters.id::text = (storage.foldername(name))[1]
        and matters.firm_id = get_my_firm_id()
    )
  );
