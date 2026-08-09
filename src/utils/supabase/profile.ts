import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import type { createClient } from "./server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

// The proxy (middleware) already redirects unauthenticated requests to
// /login before a page or action ever runs — this is a defense-in-depth
// backstop, not the primary guard. See src/utils/supabase/middleware.ts.
//
// It also self-heals via ensureUserProfile rather than redirecting to
// /login on a missing profile row: an authenticated user with no
// public.users row yet is a real, reachable state (mid-signup, or a
// previous profile-creation attempt that failed partway through), and
// /login would immediately bounce them straight back here — middleware
// redirects logged-in users away from /login — producing a redirect
// loop with no way out.
export async function getFirmId(
  supabase: SupabaseServerClient
): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return ensureUserProfile(supabase, user);
}

// Signup ("first person creates the firm") needs a firm_id + owner row
// in public.users, but neither exists yet at that point — auth.users
// alone isn't enough for the rest of the app, which is scoped by
// public.users.firm_id via get_my_firm_id().
//
// Whether this runs right after signUp() or is deferred to the user's
// first login depends on whether the Supabase project requires email
// confirmation: signUp() only returns a live session immediately when
// confirmation is off. When it's on, there's no session yet to create
// these rows with (RLS requires auth.uid()), so creation is deferred
// until the confirmed user actually logs in. Calling this from the
// signup and login actions, and again as getFirmId's fallback, handles
// either configuration and recovers from a partial failure — for an
// already-onboarded user it's a single cheap SELECT that finds an
// existing row and no-ops.
export async function ensureUserProfile(
  supabase: SupabaseServerClient,
  user: User
): Promise<string> {
  const { data: existing } = await supabase
    .from("users")
    .select("firm_id")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) return existing.firm_id;
  if (!user.email) throw new Error("Signed-in user has no email.");

  const firmName =
    (user.user_metadata?.firm_name as string | undefined)?.trim() ||
    "My Firm";

  const { data: firm, error: firmError } = await supabase
    .from("firms")
    .insert({ name: firmName })
    .select("id")
    .single();

  if (firmError) throw new Error(firmError.message);

  const { error: userError } = await supabase.from("users").insert({
    id: user.id,
    firm_id: firm.id,
    email: user.email,
    role: "owner",
  });

  if (userError) throw new Error(userError.message);

  return firm.id;
}
