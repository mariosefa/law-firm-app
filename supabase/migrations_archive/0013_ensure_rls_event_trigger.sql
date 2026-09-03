-- Baseline for the last untracked object from Critical finding #1 in
-- docs/audit-2026-09.md: the "ensure_rls" event trigger and the
-- rls_auto_enable() function it calls, which auto-enables RLS on every
-- new table created in the public schema. Pulled verbatim via
-- pg_get_functiondef() in the Supabase SQL Editor.
--
-- This changes nothing about live behavior -- both objects already
-- exist and already behave this way today. Safe to re-run (create or
-- replace / drop-if-exists + create).
--
-- Worth knowing (see docs/audit-2026-09.md remediation item 2): the
-- EXCEPTION block below only RAISE LOGs a failed RLS-enable, and this
-- project has no server-side log monitoring -- a failure here would
-- silently leave a new table without RLS.

begin;

create or replace function public.rls_auto_enable()
 returns event_trigger
 language plpgsql
 security definer
 set search_path to 'pg_catalog'
as $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$;

drop event trigger if exists ensure_rls;

create event trigger ensure_rls
  on ddl_command_end
  execute function public.rls_auto_enable();

commit;
