import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Accepts either the new-style "secret key" or the legacy "service_role"
// key -- whichever this project's Supabase dashboard shows. Never expose
// this value via a NEXT_PUBLIC_* var or import this module from a client
// component: it bypasses RLS entirely.
const supabaseAdminKey =
  process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

export const createAdminClient = () => {
  if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL env var.");
  }

  if (!supabaseAdminKey) {
    throw new Error(
      "Missing SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY) env var."
    );
  }

  return createSupabaseClient(supabaseUrl, supabaseAdminKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
};
