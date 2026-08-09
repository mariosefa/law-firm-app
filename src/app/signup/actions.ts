"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { ensureUserProfile } from "@/utils/supabase/profile";

export type SignupFormState = { error: string | null; info: string | null };

export async function signup(
  _prevState: SignupFormState,
  formData: FormData
): Promise<SignupFormState> {
  const firmName = formData.get("firm_name")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!firmName || !email || !password) {
    return {
      error: "Firm name, email, and password are all required.",
      info: null,
    };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters.", info: null };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { firm_name: firmName } },
  });

  if (error) return { error: error.message, info: null };
  if (!data.user) {
    return {
      error: "Something went wrong creating your account.",
      info: null,
    };
  }

  // No session yet means the project requires email confirmation —
  // there's nothing more we can do until the user confirms and logs
  // in (ensureUserProfile runs there too, and picks up firm_name from
  // this signUp's user_metadata).
  if (!data.session) {
    return {
      error: null,
      info: "Check your email to confirm your account, then log in.",
    };
  }

  await ensureUserProfile(supabase, data.user);

  redirect("/");
}
