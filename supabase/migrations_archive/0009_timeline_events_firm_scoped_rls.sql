-- Restore real firm-scoped security for timeline_events, same as 0007 did
-- for clients/matters/deadlines/documents/firms/users.
--
-- 0008 gave timeline_events only a dev-only "Allow anon..." policy and
-- never followed up with a firm-scoped one (unlike deadlines/documents,
-- which 0007 already covered) — timeline_events didn't exist yet when
-- 0007 ran. That leaves it with zero policies for the `authenticated`
-- role: any authenticated insert/select/update/delete is rejected by
-- RLS with "new row violates row-level security policy for table
-- timeline_events", confirmed via live testing against a real logged-in
-- user. Dropping the anon policy and adding the same
-- matter_id -> matters.firm_id scoping used for deadlines/documents
-- fixes this.

drop policy "Allow anon full access to timeline events" on public.timeline_events;

create policy "Users can manage their firm's timeline events"
  on public.timeline_events
  for all
  using (
    matter_id in (select matters.id from matters where matters.firm_id = get_my_firm_id())
  );
