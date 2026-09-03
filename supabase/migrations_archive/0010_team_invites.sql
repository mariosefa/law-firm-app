-- Invited-user firm join: an authenticated user with no public.users row
-- yet may create one under the firm they were invited to, as role
-- 'member', PROVIDED the firm_id/role match app_metadata on their own
-- JWT. app_metadata can only be set via the service-role Admin API
-- (never by the user themselves via client-side updateUser, which only
-- writes user_metadata) -- so this cannot be used to join an arbitrary
-- firm by guessing or leaking a firm id. Additive alongside the existing
-- "Users can create their own user row as firm owner" policy (permissive
-- RLS policies OR together).
create policy "Invited users can join their assigned firm as a member"
  on public.users
  for insert
  to authenticated
  with check (
    id = auth.uid()
    and role = 'member'
    and firm_id = ((auth.jwt() -> 'app_metadata' ->> 'invited_firm_id'))::uuid
    and (auth.jwt() -> 'app_metadata' ->> 'invited_role') = 'member'
  );
