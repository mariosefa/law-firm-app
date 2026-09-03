-- Local dev/test seed. Runs after migrations on `supabase db reset` / first
-- `supabase start` (see config.toml [db.seed]).

-- Test Firm (was the INSERT in the old migration 0001_dev_setup.sql). The app
-- no longer references a DEV_FIRM_ID constant -- auth + get_my_firm_id() drive
-- firm scoping now -- but a fixed, known firm id is convenient for test
-- fixtures. `firms` has RLS enabled and no anon INSERT policy, so this seed
-- runs as the postgres superuser, not via the app.
insert into public.firms (id, name)
values ('a07e2a73-e861-4122-a4fe-adf1e0cc99d5', 'Test Firm')
on conflict (id) do nothing;
