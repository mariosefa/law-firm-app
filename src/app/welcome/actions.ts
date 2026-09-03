"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { logServerError } from "@/lib/action-errors";

export type SetPasswordFormState = { error: string | null };

export async function setPassword(
  _prevState: SetPasswordFormState,
  formData: FormData
): Promise<SetPasswordFormState> {
  const password = formData.get("password")?.toString();

  if (!password || password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    logServerError("welcome.setPassword", error);
    return { error: error.message };
  }

  redirect("/");
}
