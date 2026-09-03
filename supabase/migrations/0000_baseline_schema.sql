


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE OR REPLACE FUNCTION "public"."debug_try_insert_firm_no_returning"("p_name" "text" DEFAULT 'Debug No Returning'::"text") RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
begin
  insert into public.firms(name) values (p_name);
  return 'SUCCESS (no returning)';
exception when others then
  return 'FAILED: ' || sqlerrm || ' (sqlstate=' || sqlstate || ')';
end;
$$;


ALTER FUNCTION "public"."debug_try_insert_firm_no_returning"("p_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_my_firm_id"() RETURNS "uuid"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  select firm_id from users where id = auth.uid()
$$;


ALTER FUNCTION "public"."get_my_firm_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_my_role"() RETURNS "text"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  select role from public.users where id = auth.uid()
$$;


ALTER FUNCTION "public"."get_my_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rls_auto_enable"() RETURNS "event_trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog'
    AS $$
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
$$;


ALTER FUNCTION "public"."rls_auto_enable"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."user_can_access_matter"("p_matter_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  select exists (
    select 1
    from public.matters m
    where m.id = p_matter_id
      and m.firm_id = get_my_firm_id()
      and (
        get_my_role() = 'owner'
        or exists (
          select 1
          from public.matter_assignments ma
          where ma.matter_id = m.id
            and ma.user_id = auth.uid()
        )
      )
  )
$$;


ALTER FUNCTION "public"."user_can_access_matter"("p_matter_id" "uuid") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."clients" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "firm_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "email" "text",
    "phone" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."clients" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."deadlines" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "matter_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "due_at" timestamp with time zone NOT NULL,
    "priority" "text" DEFAULT 'normal'::"text",
    "is_done" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."deadlines" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."documents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "matter_id" "uuid" NOT NULL,
    "file_name" "text" NOT NULL,
    "category" "text",
    "storage_path" "text" NOT NULL,
    "uploaded_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."documents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."firms" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."firms" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."matter_assignments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "matter_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "firm_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."matter_assignments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."matters" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "firm_id" "uuid" NOT NULL,
    "client_id" "uuid",
    "assigned_user_id" "uuid",
    "matter_number" "text",
    "title" "text" NOT NULL,
    "practice_area" "text",
    "status" "text" DEFAULT 'open'::"text" NOT NULL,
    "opened_date" "date" DEFAULT CURRENT_DATE,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "narrative" "text"
);


ALTER TABLE "public"."matters" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."timeline_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "matter_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "event_date" "date" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."timeline_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "firm_id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "role" "text" DEFAULT 'attorney'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."deadlines"
    ADD CONSTRAINT "deadlines_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."firms"
    ADD CONSTRAINT "firms_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."matter_assignments"
    ADD CONSTRAINT "matter_assignments_matter_id_user_id_key" UNIQUE ("matter_id", "user_id");



ALTER TABLE ONLY "public"."matter_assignments"
    ADD CONSTRAINT "matter_assignments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."matters"
    ADD CONSTRAINT "matters_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."timeline_events"
    ADD CONSTRAINT "timeline_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE INDEX "matter_assignments_matter_id_idx" ON "public"."matter_assignments" USING "btree" ("matter_id");



CREATE INDEX "matter_assignments_user_id_idx" ON "public"."matter_assignments" USING "btree" ("user_id");



ALTER TABLE ONLY "public"."clients"
    ADD CONSTRAINT "clients_firm_id_fkey" FOREIGN KEY ("firm_id") REFERENCES "public"."firms"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."deadlines"
    ADD CONSTRAINT "deadlines_matter_id_fkey" FOREIGN KEY ("matter_id") REFERENCES "public"."matters"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_matter_id_fkey" FOREIGN KEY ("matter_id") REFERENCES "public"."matters"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."matter_assignments"
    ADD CONSTRAINT "matter_assignments_matter_id_fkey" FOREIGN KEY ("matter_id") REFERENCES "public"."matters"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."matter_assignments"
    ADD CONSTRAINT "matter_assignments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."matters"
    ADD CONSTRAINT "matters_assigned_user_id_fkey" FOREIGN KEY ("assigned_user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."matters"
    ADD CONSTRAINT "matters_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."matters"
    ADD CONSTRAINT "matters_firm_id_fkey" FOREIGN KEY ("firm_id") REFERENCES "public"."firms"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."timeline_events"
    ADD CONSTRAINT "timeline_events_matter_id_fkey" FOREIGN KEY ("matter_id") REFERENCES "public"."matters"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_firm_id_fkey" FOREIGN KEY ("firm_id") REFERENCES "public"."firms"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Create matters in your firm" ON "public"."matters" FOR INSERT WITH CHECK (("firm_id" = "public"."get_my_firm_id"()));



CREATE POLICY "Edit matters you're assigned to (owner edits all)" ON "public"."matters" FOR UPDATE USING ((("firm_id" = "public"."get_my_firm_id"()) AND (("public"."get_my_role"() = 'owner'::"text") OR (EXISTS ( SELECT 1
   FROM "public"."matter_assignments"
  WHERE (("matter_assignments"."matter_id" = "matters"."id") AND ("matter_assignments"."user_id" = "auth"."uid"()))))))) WITH CHECK ((("firm_id" = "public"."get_my_firm_id"()) AND (("public"."get_my_role"() = 'owner'::"text") OR (EXISTS ( SELECT 1
   FROM "public"."matter_assignments"
  WHERE (("matter_assignments"."matter_id" = "matters"."id") AND ("matter_assignments"."user_id" = "auth"."uid"())))))));



CREATE POLICY "Invited users can join their assigned firm as a member" ON "public"."users" FOR INSERT TO "authenticated" WITH CHECK ((("id" = "auth"."uid"()) AND ("role" = 'member'::"text") AND ("firm_id" = ((("auth"."jwt"() -> 'app_metadata'::"text") ->> 'invited_firm_id'::"text"))::"uuid") AND ((("auth"."jwt"() -> 'app_metadata'::"text") ->> 'invited_role'::"text") = 'member'::"text")));



CREATE POLICY "Manage deadlines for matters you can access" ON "public"."deadlines" USING ("public"."user_can_access_matter"("matter_id")) WITH CHECK ("public"."user_can_access_matter"("matter_id"));



CREATE POLICY "Manage documents for matters you can access" ON "public"."documents" USING ("public"."user_can_access_matter"("matter_id")) WITH CHECK ("public"."user_can_access_matter"("matter_id"));



CREATE POLICY "Manage timeline events for matters you can access" ON "public"."timeline_events" USING ("public"."user_can_access_matter"("matter_id")) WITH CHECK ("public"."user_can_access_matter"("matter_id"));



CREATE POLICY "Only the owner deletes matters" ON "public"."matters" FOR DELETE USING ((("firm_id" = "public"."get_my_firm_id"()) AND ("public"."get_my_role"() = 'owner'::"text")));



CREATE POLICY "Only the owner edits assignments" ON "public"."matter_assignments" FOR UPDATE USING ((("firm_id" = "public"."get_my_firm_id"()) AND ("public"."get_my_role"() = 'owner'::"text"))) WITH CHECK ((("firm_id" = "public"."get_my_firm_id"()) AND ("public"."get_my_role"() = 'owner'::"text")));



CREATE POLICY "Only the owner removes assignments" ON "public"."matter_assignments" FOR DELETE USING ((("firm_id" = "public"."get_my_firm_id"()) AND ("public"."get_my_role"() = 'owner'::"text")));



CREATE POLICY "Self-assign on create, or owner assigns anyone" ON "public"."matter_assignments" FOR INSERT WITH CHECK ((("firm_id" = "public"."get_my_firm_id"()) AND ((("user_id" = "auth"."uid"()) AND (NOT (EXISTS ( SELECT 1
   FROM "public"."matter_assignments" "x"
  WHERE ("x"."matter_id" = "matter_assignments"."matter_id"))))) OR ("public"."get_my_role"() = 'owner'::"text"))));



CREATE POLICY "Users can create a firm during signup" ON "public"."firms" FOR INSERT TO "authenticated" WITH CHECK ((NOT (EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE ("users"."id" = "auth"."uid"())))));



CREATE POLICY "Users can create their own user row as firm owner" ON "public"."users" FOR INSERT TO "authenticated" WITH CHECK ((("id" = "auth"."uid"()) AND ("role" = 'owner'::"text") AND (NOT (EXISTS ( SELECT 1
   FROM "public"."users" "existing_member"
  WHERE ("existing_member"."firm_id" = "users"."firm_id"))))));



CREATE POLICY "Users can manage their firm's clients" ON "public"."clients" USING (("firm_id" = "public"."get_my_firm_id"()));



CREATE POLICY "Users can view their firm's users" ON "public"."users" FOR SELECT USING (("firm_id" = "public"."get_my_firm_id"()));



CREATE POLICY "Users can view their own firm" ON "public"."firms" FOR SELECT USING (("id" = "public"."get_my_firm_id"()));



CREATE POLICY "View assignments in your firm" ON "public"."matter_assignments" FOR SELECT USING (("firm_id" = "public"."get_my_firm_id"()));



CREATE POLICY "View matters you're assigned to (owner sees all)" ON "public"."matters" FOR SELECT USING ((("firm_id" = "public"."get_my_firm_id"()) AND (("public"."get_my_role"() = 'owner'::"text") OR (EXISTS ( SELECT 1
   FROM "public"."matter_assignments"
  WHERE (("matter_assignments"."matter_id" = "matters"."id") AND ("matter_assignments"."user_id" = "auth"."uid"())))))));



ALTER TABLE "public"."clients" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."deadlines" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."documents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."firms" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."matter_assignments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."matters" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."timeline_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."debug_try_insert_firm_no_returning"("p_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."debug_try_insert_firm_no_returning"("p_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."debug_try_insert_firm_no_returning"("p_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_my_firm_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_firm_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_firm_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_my_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_role"() TO "service_role";



GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "anon";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "service_role";



GRANT ALL ON FUNCTION "public"."user_can_access_matter"("p_matter_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."user_can_access_matter"("p_matter_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_can_access_matter"("p_matter_id" "uuid") TO "service_role";



GRANT ALL ON TABLE "public"."clients" TO "anon";
GRANT ALL ON TABLE "public"."clients" TO "authenticated";
GRANT ALL ON TABLE "public"."clients" TO "service_role";



GRANT ALL ON TABLE "public"."deadlines" TO "anon";
GRANT ALL ON TABLE "public"."deadlines" TO "authenticated";
GRANT ALL ON TABLE "public"."deadlines" TO "service_role";



GRANT ALL ON TABLE "public"."documents" TO "anon";
GRANT ALL ON TABLE "public"."documents" TO "authenticated";
GRANT ALL ON TABLE "public"."documents" TO "service_role";



GRANT ALL ON TABLE "public"."firms" TO "anon";
GRANT ALL ON TABLE "public"."firms" TO "authenticated";
GRANT ALL ON TABLE "public"."firms" TO "service_role";



GRANT ALL ON TABLE "public"."matter_assignments" TO "anon";
GRANT ALL ON TABLE "public"."matter_assignments" TO "authenticated";
GRANT ALL ON TABLE "public"."matter_assignments" TO "service_role";



GRANT ALL ON TABLE "public"."matters" TO "anon";
GRANT ALL ON TABLE "public"."matters" TO "authenticated";
GRANT ALL ON TABLE "public"."matters" TO "service_role";



GRANT ALL ON TABLE "public"."timeline_events" TO "anon";
GRANT ALL ON TABLE "public"."timeline_events" TO "authenticated";
GRANT ALL ON TABLE "public"."timeline_events" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";


-- ---------------------------------------------------------------------------
-- ensure_rls event trigger (was migration 0013).
--
-- pg_dump --schema public does not capture event triggers (they are global,
-- not schema-scoped), so the dump above is missing this. Folded in here so a
-- fresh local DB matches remote: rls_auto_enable() auto-enables RLS on every
-- new table created in the public schema. See docs/audit-2026-09.md, finding #1.
-- The rls_auto_enable() function itself IS in the dump above (lines ~61-90);
-- this block only adds the CREATE EVENT TRIGGER that binds it.
-- ---------------------------------------------------------------------------

DROP EVENT TRIGGER IF EXISTS "ensure_rls";

CREATE EVENT TRIGGER "ensure_rls"
  ON "ddl_command_end"
  EXECUTE FUNCTION "public"."rls_auto_enable"();







