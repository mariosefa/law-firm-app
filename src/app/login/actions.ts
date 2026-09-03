"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { ensureUserProfile } from "@/utils/supabase/profile";
import { logServerError } from "@/lib/action-errors";

export type AuthFormState = { error: string | null };

export async function login(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    logServerError("login", error);
    return { error: error.message };
  }

  await ensureUserProfile(supabase, data.user);

  redirect("/");
}
