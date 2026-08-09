-- Dev-only: allow the app (anon key, no auth yet) to insert clients.
-- Mirrors the "open for dev, tighten before real data" approach used for
-- matters and for the clients SELECT policy in 0001_dev_setup.sql.
-- TIGHTEN OR REMOVE this once auth/firm scoping is added.

create policy "Allow anon insert access to clients"
  on public.clients
  for insert
  to anon
  with check (true);
