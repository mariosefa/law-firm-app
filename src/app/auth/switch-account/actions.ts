"use server";

import { redirect } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";

// Bound to (tokenHash, type, next) by the page before being wired up as
// a <form action>. Signs out AND verifies the token in this single
// request/response cycle -- redirecting back through /auth/confirm as a
// second hop instead loses the freshly-set session cookie somewhere in
// Next's client-side handling of a Server Action redirect that targets a
// Route Handler which itself redirects again. Doing both here avoids
// that chain entirely.
export async function logoutAndRetryInvite(
  tokenHash: string,
  type: string,
  next: string,
  _formData: FormData
) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const { error } = await supabase.auth.verifyOtp({
    type: type as EmailOtpType,
    token_hash: tokenHash,
  });

  redirect(error ? "/login?error=invite_link_invalid" : next);
}
