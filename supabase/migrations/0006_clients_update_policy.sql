-- Dev-only: clients was missing an UPDATE policy (only ever got select,
-- insert, and delete). Verified this with a real round-trip update
-- against a live row before writing this — PostgREST returned 204
-- either way, but the value silently didn't change without this policy.
--
-- matters, deadlines, and documents already have "for all" anon
-- policies from earlier migrations, and a similar round-trip check
-- confirmed updates on those genuinely persist — no migration needed
-- for them.
create policy "Allow anon update access to clients"
  on public.clients
  for update
  to anon
  using (true)
  with check (true);
