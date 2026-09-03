-- RLS / permissions test suite.
--
-- Implements remediation items 2 and 3 from docs/audit-2026-09.md §16.I:
--   * cross-tenant isolation (firm A cannot read/write firm B's data)
--   * per-matter permissions (a member sees only assigned matters; the
--     owner sees all; child rows inherit matter visibility)
--   * plus the schema-level backstop item 2 calls out: no public table
--     may have RLS disabled, and the ensure_rls event trigger enforces it.
--
-- The security model lives entirely in Postgres (see the audit, §4): every
-- policy keys off auth.uid() via the SECURITY DEFINER helpers
-- get_my_firm_id() / get_my_role() / user_can_access_matter(). These tests
-- run as the real `authenticated` / `anon` roles with a synthetic JWT claim
-- so the policies are exercised exactly as PostgREST would trigger them.
--
-- Run: npx supabase test db

BEGIN;

SET LOCAL search_path = public, auth, extensions;

SELECT no_plan();

-- ---------------------------------------------------------------------------
-- Test helpers (rolled back with the transaction)
-- ---------------------------------------------------------------------------

CREATE SCHEMA IF NOT EXISTS tests;

-- Become `authenticated` with the given user id as the JWT subject. Mirrors
-- the set_config pattern from supabase/supabase_test_helpers -- set_config
-- with is_local => true persists for the rest of the transaction after the
-- function returns.
CREATE OR REPLACE FUNCTION tests.login_as(user_id uuid)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  PERFORM set_config('role', 'authenticated', true);
  PERFORM set_config(
    'request.jwt.claims',
    json_build_object('sub', user_id::text, 'role', 'authenticated')::text,
    true
  );
END;
$$;

CREATE OR REPLACE FUNCTION tests.login_anon()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  PERFORM set_config('role', 'anon', true);
  PERFORM set_config('request.jwt.claims', '', true);
END;
$$;

CREATE OR REPLACE FUNCTION tests.logout()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  PERFORM set_config('role', 'postgres', true);
  PERFORM set_config('request.jwt.claims', '', true);
END;
$$;

-- Rows a write actually touches, without raising when RLS silently filters
-- it to zero (UPDATE/DELETE against rows the USING clause hides just affect
-- nothing -- unlike INSERT, which raises 42501 on a WITH CHECK violation).
CREATE OR REPLACE FUNCTION tests.write_count(sql text)
RETURNS bigint LANGUAGE plpgsql AS $$
DECLARE n bigint;
BEGIN
  EXECUTE 'WITH _w AS (' || sql || ' RETURNING 1) SELECT count(*) FROM _w' INTO n;
  RETURN n;
END;
$$;

-- Unfiltered row count for a public table, for "the owner sees everything"
-- assertions that must not depend on what earlier mutating tests changed.
-- SECURITY DEFINER + owned by postgres (BYPASSRLS) => sees every row.
CREATE OR REPLACE FUNCTION tests.count_all(tbl text)
RETURNS bigint LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE n bigint;
BEGIN
  EXECUTE format('SELECT count(*) FROM public.%I', tbl) INTO n;
  RETURN n;
END;
$$;

-- The helpers are called after switching into the anon / authenticated
-- roles, so those roles need to be able to reach them. (SET ROLE itself
-- still works from any role because the session user stays `postgres`.)
GRANT USAGE ON SCHEMA tests TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA tests TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- Fixtures (created as postgres / BYPASSRLS)
-- ---------------------------------------------------------------------------

-- Firms
INSERT INTO public.firms (id, name) VALUES
  ('aaaaaaaa-0000-0000-0000-00000000000a', 'Firm A'),
  ('bbbbbbbb-0000-0000-0000-00000000000b', 'Firm B');

-- Auth users (only `id` is NOT NULL without a default on auth.users locally)
INSERT INTO auth.users (id, email) VALUES
  ('a0000000-0000-0000-0000-0000000000a0', 'owner-a@a.test'),
  ('a0000000-0000-0000-0000-0000000000a1', 'member-a1@a.test'),
  ('a0000000-0000-0000-0000-0000000000a2', 'member-a2@a.test'),
  ('b0000000-0000-0000-0000-0000000000b0', 'owner-b@b.test'),
  ('b0000000-0000-0000-0000-0000000000b1', 'member-b1@b.test');

-- App profiles
INSERT INTO public.users (id, firm_id, email, role) VALUES
  ('a0000000-0000-0000-0000-0000000000a0', 'aaaaaaaa-0000-0000-0000-00000000000a', 'owner-a@a.test',  'owner'),
  ('a0000000-0000-0000-0000-0000000000a1', 'aaaaaaaa-0000-0000-0000-00000000000a', 'member-a1@a.test', 'member'),
  ('a0000000-0000-0000-0000-0000000000a2', 'aaaaaaaa-0000-0000-0000-00000000000a', 'member-a2@a.test', 'member'),
  ('b0000000-0000-0000-0000-0000000000b0', 'bbbbbbbb-0000-0000-0000-00000000000b', 'owner-b@b.test',  'owner'),
  ('b0000000-0000-0000-0000-0000000000b1', 'bbbbbbbb-0000-0000-0000-00000000000b', 'member-b1@b.test', 'member');

-- Clients
INSERT INTO public.clients (id, firm_id, name) VALUES
  ('ca000000-0000-0000-0000-0000000000c1', 'aaaaaaaa-0000-0000-0000-00000000000a', 'Client A'),
  ('cb000000-0000-0000-0000-0000000000c2', 'bbbbbbbb-0000-0000-0000-00000000000b', 'Client B');

-- Matters: A1 assigned to member A1; A2 assigned to owner A (simulates the
-- owner creating it); B1 assigned to member B1.
INSERT INTO public.matters (id, firm_id, client_id, title, status) VALUES
  ('4a000000-0000-0000-0000-0000000000a1', 'aaaaaaaa-0000-0000-0000-00000000000a', 'ca000000-0000-0000-0000-0000000000c1', 'Matter A1', 'open'),
  ('4a000000-0000-0000-0000-0000000000a2', 'aaaaaaaa-0000-0000-0000-00000000000a', 'ca000000-0000-0000-0000-0000000000c1', 'Matter A2', 'open'),
  ('4b000000-0000-0000-0000-0000000000b1', 'bbbbbbbb-0000-0000-0000-00000000000b', 'cb000000-0000-0000-0000-0000000000c2', 'Matter B1', 'open');

INSERT INTO public.matter_assignments (matter_id, user_id, firm_id) VALUES
  ('4a000000-0000-0000-0000-0000000000a1', 'a0000000-0000-0000-0000-0000000000a1', 'aaaaaaaa-0000-0000-0000-00000000000a'),
  ('4a000000-0000-0000-0000-0000000000a2', 'a0000000-0000-0000-0000-0000000000a0', 'aaaaaaaa-0000-0000-0000-00000000000a'),
  ('4b000000-0000-0000-0000-0000000000b1', 'b0000000-0000-0000-0000-0000000000b1', 'bbbbbbbb-0000-0000-0000-00000000000b');

-- Child rows: one per matter A1 / A2 so "inherits matter visibility" is testable.
INSERT INTO public.deadlines (id, matter_id, title, due_at) VALUES
  ('d1000000-0000-0000-0000-0000000000a1', '4a000000-0000-0000-0000-0000000000a1', 'Deadline A1', now() + interval '7 days'),
  ('d1000000-0000-0000-0000-0000000000a2', '4a000000-0000-0000-0000-0000000000a2', 'Deadline A2', now() + interval '7 days');

INSERT INTO public.documents (id, matter_id, file_name, storage_path) VALUES
  ('d0000000-0000-0000-0000-0000000000a1', '4a000000-0000-0000-0000-0000000000a1', 'a1.pdf', '4a000000-0000-0000-0000-0000000000a1/a1.pdf'),
  ('d0000000-0000-0000-0000-0000000000a2', '4a000000-0000-0000-0000-0000000000a2', 'a2.pdf', '4a000000-0000-0000-0000-0000000000a2/a2.pdf');

INSERT INTO public.timeline_events (id, matter_id, title, event_date) VALUES
  ('71000000-0000-0000-0000-0000000000a1', '4a000000-0000-0000-0000-0000000000a1', 'Event A1', current_date),
  ('71000000-0000-0000-0000-0000000000a2', '4a000000-0000-0000-0000-0000000000a2', 'Event A2', current_date);


-- ===========================================================================
-- A. Schema-level RLS backstop (audit §16.I item 2)
-- ===========================================================================

SELECT is(
  (SELECT coalesce(array_agg(tablename::text ORDER BY tablename), ARRAY[]::text[])
     FROM pg_tables WHERE schemaname = 'public' AND NOT rowsecurity),
  ARRAY[]::text[],
  'every table in the public schema has row level security enabled'
);

SELECT is(
  (SELECT coalesce(array_agg(t ORDER BY t), ARRAY[]::text[])
     FROM unnest(ARRAY['firms','users','clients','matters','matter_assignments','deadlines','documents','timeline_events']) AS t
    WHERE NOT EXISTS (
      SELECT 1 FROM pg_policies p WHERE p.schemaname = 'public' AND p.tablename = t
    )),
  ARRAY[]::text[],
  'every tenant table carries at least one policy'
);

-- The ensure_rls event trigger auto-enables RLS on any new public table.
SELECT tests.logout();
CREATE TABLE public.zzz_rls_probe (id int);
SELECT is(
  (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'zzz_rls_probe'),
  true,
  'ensure_rls event trigger auto-enables RLS on a newly created public table'
);
DROP TABLE public.zzz_rls_probe;


-- ===========================================================================
-- B. Anonymous access is fully closed
-- ===========================================================================

SELECT tests.login_anon();

SELECT is( (SELECT count(*) FROM public.firms),   0::bigint, 'anon sees no firms' );
SELECT is( (SELECT count(*) FROM public.matters), 0::bigint, 'anon sees no matters' );
SELECT is( (SELECT count(*) FROM public.clients), 0::bigint, 'anon sees no clients' );
SELECT is( (SELECT count(*) FROM public.users),   0::bigint, 'anon sees no users' );

SELECT throws_ok(
  $$ INSERT INTO public.matters (firm_id, client_id, title, status)
     VALUES ('aaaaaaaa-0000-0000-0000-00000000000a', 'ca000000-0000-0000-0000-0000000000c1', 'x', 'open') $$,
  '42501', NULL,
  'anon cannot insert a matter'
);


-- ===========================================================================
-- C. Cross-tenant isolation (audit §16.I item 2 -- the core test)
-- ===========================================================================

-- Firm A owner
SELECT tests.login_as('a0000000-0000-0000-0000-0000000000a0');

SELECT is(
  (SELECT coalesce(array_agg(title ORDER BY title), ARRAY[]::text[]) FROM public.matters),
  ARRAY['Matter A1','Matter A2'],
  'firm A owner sees exactly firm A''s matters, never firm B''s'
);
SELECT is(
  (SELECT array_agg(name) FROM public.clients),
  ARRAY['Client A'],
  'firm A owner sees only firm A clients'
);
SELECT is(
  (SELECT array_agg(email ORDER BY email) FROM public.users),
  ARRAY['member-a1@a.test','member-a2@a.test','owner-a@a.test'],
  'firm A owner sees only firm A users'
);
SELECT is(
  (SELECT array_agg(name) FROM public.firms),
  ARRAY['Firm A'],
  'firm A owner sees only their own firm row'
);
SELECT is(
  (SELECT count(*) FROM public.matter_assignments), 2::bigint,
  'firm A owner sees only firm A assignment rows'
);

-- Direct-id reads of firm B objects return nothing
SELECT is(
  (SELECT count(*) FROM public.matters WHERE id = '4b000000-0000-0000-0000-0000000000b1'),
  0::bigint,
  'firm A owner cannot read a firm B matter by id'
);
SELECT is(
  (SELECT count(*) FROM public.deadlines WHERE matter_id = '4b000000-0000-0000-0000-0000000000b1'),
  0::bigint,
  'firm A owner cannot read firm B deadlines'
);

-- Cross-tenant writes
SELECT is(
  tests.write_count($$ UPDATE public.matters SET title = 'hijacked' WHERE id = '4b000000-0000-0000-0000-0000000000b1' $$),
  0::bigint,
  'firm A owner cannot update a firm B matter'
);
SELECT is(
  tests.write_count($$ DELETE FROM public.matters WHERE id = '4b000000-0000-0000-0000-0000000000b1' $$),
  0::bigint,
  'firm A owner cannot delete a firm B matter'
);
SELECT throws_ok(
  $$ INSERT INTO public.matters (firm_id, client_id, title, status)
     VALUES ('bbbbbbbb-0000-0000-0000-00000000000b', 'cb000000-0000-0000-0000-0000000000c2', 'sneaky', 'open') $$,
  '42501', NULL,
  'firm A owner cannot insert a matter into firm B'
);
SELECT throws_ok(
  $$ INSERT INTO public.clients (firm_id, name)
     VALUES ('bbbbbbbb-0000-0000-0000-00000000000b', 'sneaky client') $$,
  '42501', NULL,
  'firm A owner cannot insert a client into firm B'
);

-- The other direction: firm B owner cannot see firm A
SELECT tests.login_as('b0000000-0000-0000-0000-0000000000b0');
SELECT is(
  (SELECT count(*) FROM public.matters WHERE firm_id = 'aaaaaaaa-0000-0000-0000-00000000000a'),
  0::bigint,
  'firm B owner cannot read firm A matters'
);
SELECT is(
  tests.write_count($$ UPDATE public.clients SET name = 'x' WHERE id = 'ca000000-0000-0000-0000-0000000000c1' $$),
  0::bigint,
  'firm B owner cannot update a firm A client'
);


-- ===========================================================================
-- D. Per-matter permissions within one firm (audit §16.I item 3)
-- ===========================================================================

-- Owner sees every matter in the firm
SELECT tests.login_as('a0000000-0000-0000-0000-0000000000a0');
SELECT is( (SELECT count(*) FROM public.matters), 2::bigint,
  'owner sees all matters in the firm regardless of assignment' );

-- Member assigned to A1 only
SELECT tests.login_as('a0000000-0000-0000-0000-0000000000a1');
SELECT is(
  (SELECT array_agg(title ORDER BY title) FROM public.matters),
  ARRAY['Matter A1'],
  'member sees only the matter they are assigned to'
);
SELECT is(
  (SELECT count(*) FROM public.matters WHERE id = '4a000000-0000-0000-0000-0000000000a2'),
  0::bigint,
  'member cannot read an unassigned matter in their own firm by id'
);

-- Member assigned to nothing
SELECT tests.login_as('a0000000-0000-0000-0000-0000000000a2');
SELECT is( (SELECT count(*) FROM public.matters), 0::bigint,
  'member with no assignments sees no matters' );

-- Member update is gated by assignment
SELECT tests.login_as('a0000000-0000-0000-0000-0000000000a1');
SELECT is(
  tests.write_count($$ UPDATE public.matters SET status = 'closed' WHERE id = '4a000000-0000-0000-0000-0000000000a1' $$),
  1::bigint,
  'member can update a matter they are assigned to'
);
SELECT is(
  tests.write_count($$ UPDATE public.matters SET status = 'closed' WHERE id = '4a000000-0000-0000-0000-0000000000a2' $$),
  0::bigint,
  'member cannot update a matter they are not assigned to'
);

-- Delete is owner-only, even for an assigned member
SELECT is(
  tests.write_count($$ DELETE FROM public.matters WHERE id = '4a000000-0000-0000-0000-0000000000a1' $$),
  0::bigint,
  'assigned member still cannot delete a matter (owner-only)'
);
SELECT tests.login_as('a0000000-0000-0000-0000-0000000000a0');
SELECT is(
  tests.write_count($$ DELETE FROM public.matters WHERE id = '4a000000-0000-0000-0000-0000000000a2' $$),
  1::bigint,
  'owner can delete a matter'
);

-- INSERT is firm-scoped: any member may create a matter in their own firm...
SELECT tests.login_as('a0000000-0000-0000-0000-0000000000a2');
SELECT lives_ok(
  $$ INSERT INTO public.matters (id, firm_id, client_id, title, status)
     VALUES ('4a000000-0000-0000-0000-00000000aaaa', 'aaaaaaaa-0000-0000-0000-00000000000a', 'ca000000-0000-0000-0000-0000000000c1', 'Member-made', 'open') $$,
  'any member can create a matter in their own firm'
);
-- ...and self-assign on a matter that has no assignments yet (the createMatter flow)
SELECT lives_ok(
  $$ INSERT INTO public.matter_assignments (matter_id, user_id, firm_id)
     VALUES ('4a000000-0000-0000-0000-00000000aaaa', 'a0000000-0000-0000-0000-0000000000a2', 'aaaaaaaa-0000-0000-0000-00000000000a') $$,
  'member can self-assign to a matter that has no assignments yet'
);

-- ...but cannot self-assign onto a matter that already has assignments
SELECT throws_ok(
  $$ INSERT INTO public.matter_assignments (matter_id, user_id, firm_id)
     VALUES ('4a000000-0000-0000-0000-0000000000a1', 'a0000000-0000-0000-0000-0000000000a2', 'aaaaaaaa-0000-0000-0000-00000000000a') $$,
  '42501', NULL,
  'member cannot self-assign onto a matter that already has an assignment'
);

-- ...and cannot assign someone else at all
SELECT tests.login_as('a0000000-0000-0000-0000-0000000000a1');
SELECT throws_ok(
  $$ INSERT INTO public.matter_assignments (matter_id, user_id, firm_id)
     VALUES ('4a000000-0000-0000-0000-00000000aaaa', 'a0000000-0000-0000-0000-0000000000a1', 'aaaaaaaa-0000-0000-0000-00000000000a') $$,
  '42501', NULL,
  'member cannot assign another user (only the owner can)'
);

-- Owner can assign anyone
SELECT tests.login_as('a0000000-0000-0000-0000-0000000000a0');
SELECT lives_ok(
  $$ INSERT INTO public.matter_assignments (matter_id, user_id, firm_id)
     VALUES ('4a000000-0000-0000-0000-0000000000a1', 'a0000000-0000-0000-0000-0000000000a2', 'aaaaaaaa-0000-0000-0000-00000000000a') $$,
  'owner can assign any firm user to a matter'
);

-- Only the owner removes assignments
SELECT tests.login_as('a0000000-0000-0000-0000-0000000000a1');
SELECT is(
  tests.write_count($$ DELETE FROM public.matter_assignments WHERE matter_id = '4a000000-0000-0000-0000-0000000000a1' AND user_id = 'a0000000-0000-0000-0000-0000000000a1' $$),
  0::bigint,
  'member cannot remove their own assignment (owner-only)'
);
SELECT tests.login_as('a0000000-0000-0000-0000-0000000000a0');
SELECT is(
  tests.write_count($$ DELETE FROM public.matter_assignments WHERE matter_id = '4a000000-0000-0000-0000-0000000000a1' AND user_id = 'a0000000-0000-0000-0000-0000000000a2' $$),
  1::bigint,
  'owner can remove an assignment'
);


-- ===========================================================================
-- E. Child rows (deadlines / documents / timeline_events) inherit matter access
-- ===========================================================================

-- Member assigned to A1 only
SELECT tests.login_as('a0000000-0000-0000-0000-0000000000a1');

SELECT is(
  (SELECT array_agg(title) FROM public.deadlines),
  ARRAY['Deadline A1'],
  'member sees deadlines only for matters they can access'
);
SELECT is(
  (SELECT array_agg(file_name) FROM public.documents),
  ARRAY['a1.pdf'],
  'member sees documents only for matters they can access'
);
SELECT is(
  (SELECT array_agg(title) FROM public.timeline_events),
  ARRAY['Event A1'],
  'member sees timeline events only for matters they can access'
);

SELECT lives_ok(
  $$ INSERT INTO public.deadlines (matter_id, title, due_at)
     VALUES ('4a000000-0000-0000-0000-0000000000a1', 'new', now() + interval '1 day') $$,
  'member can add a deadline to a matter they can access'
);
SELECT throws_ok(
  $$ INSERT INTO public.deadlines (matter_id, title, due_at)
     VALUES ('4a000000-0000-0000-0000-0000000000a2', 'new', now() + interval '1 day') $$,
  '42501', NULL,
  'member cannot add a deadline to a matter they cannot access'
);
SELECT throws_ok(
  $$ INSERT INTO public.timeline_events (matter_id, title, event_date)
     VALUES ('4a000000-0000-0000-0000-0000000000a2', 'new', current_date) $$,
  '42501', NULL,
  'member cannot add a timeline event to a matter they cannot access'
);

-- Member with no matters sees no child rows at all
SELECT tests.login_as('a0000000-0000-0000-0000-0000000000a2');
SELECT is( (SELECT count(*) FROM public.deadlines),       0::bigint, 'member with no matters sees no deadlines' );
SELECT is( (SELECT count(*) FROM public.documents),       0::bigint, 'member with no matters sees no documents' );
SELECT is( (SELECT count(*) FROM public.timeline_events), 0::bigint, 'member with no matters sees no timeline events' );

-- Owner sees all child rows in the firm -- compared against the unfiltered
-- total so this doesn't depend on what section D mutated.
SELECT tests.login_as('a0000000-0000-0000-0000-0000000000a0');
SELECT is( (SELECT count(*) FROM public.deadlines),       tests.count_all('deadlines'),
  'owner sees every deadline in the firm (no matter-level filtering)' );
SELECT is( (SELECT count(*) FROM public.timeline_events), tests.count_all('timeline_events'),
  'owner sees every timeline event in the firm (no matter-level filtering)' );


-- ===========================================================================
-- F. firms / users signup INSERT policies
-- ===========================================================================

-- An already-onboarded user cannot spin up a second firm
SELECT tests.login_as('a0000000-0000-0000-0000-0000000000a0');
SELECT throws_ok(
  $$ INSERT INTO public.firms (id, name) VALUES ('cccccccc-0000-0000-0000-00000000000c', 'Second Firm') $$,
  '42501', NULL,
  'a user who already has a profile row cannot create another firm'
);

-- A brand-new authenticated user (no public.users row) can bootstrap: create
-- a firm, then their own owner row.
SELECT tests.logout();
INSERT INTO auth.users (id, email) VALUES ('e0000000-0000-0000-0000-0000000000e0', 'fresh@new.test');
SELECT tests.login_as('e0000000-0000-0000-0000-0000000000e0');
SELECT lives_ok(
  $$ INSERT INTO public.firms (id, name) VALUES ('dddddddd-0000-0000-0000-00000000000d', 'Fresh Firm') $$,
  'a brand-new user with no profile row can create their firm'
);
SELECT lives_ok(
  $$ INSERT INTO public.users (id, firm_id, email, role)
     VALUES ('e0000000-0000-0000-0000-0000000000e0', 'dddddddd-0000-0000-0000-00000000000d', 'fresh@new.test', 'owner') $$,
  'a brand-new user can create their own owner profile row'
);
SELECT throws_ok(
  $$ INSERT INTO public.users (id, firm_id, email, role)
     VALUES ('e0000000-0000-0000-0000-0000000000e0', 'dddddddd-0000-0000-0000-00000000000d', 'fresh@new.test', 'owner') $$,
  '42501', NULL,
  'a second user cannot self-insert as owner of a firm that already has members'
);


SELECT * FROM finish();
ROLLBACK;
