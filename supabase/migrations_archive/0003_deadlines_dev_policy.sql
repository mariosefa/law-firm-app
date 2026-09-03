-- Dev-only: open up read/write access on deadlines so the app works
-- today without auth, same as matters and clients.
--
-- Deadlines don't have their own firm_id column — they're scoped to a
-- firm through their matter's firm_id — so this policy (like matters')
-- is wide open at the row level; the app scopes queries itself by
-- joining through matters.firm_id. TIGHTEN OR REMOVE this once
-- auth/firm scoping is added.

alter table public.deadlines enable row level security;

create policy "Allow anon full access to deadlines"
  on public.deadlines
  for all
  to anon
  using (true)
  with check (true);
