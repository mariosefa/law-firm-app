import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";

// Landing point for emailed auth links (invite, signup confirmation,
// password recovery, ...). Supabase's hosted /verify redirect uses a URL
// hash fragment for tokens, which a server-rendered app can't read --
// this route instead takes a token_hash and verifies it server-side,
// establishing the session via cookies. See the "Invite user" email
// template change in the invite-teammates plan for the matching
// {{ .TokenHash }} link.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";

  if (!tokenHash || !type) {
    return NextResponse.redirect(`${origin}/login?error=invite_link_invalid`);
  }

  const supabase = await createClient();

  // A browser already signed in as someone else must not silently
  // verify this token -- verifyOtp would swap the session out from under
  // them with no explanation. Bounce to a prompt instead, carrying the
  // original params through so it can be retried once they log out (see
  // src/app/auth/switch-account -- it signs out and verifies the token
  // in one request rather than looping back through this route, since a
  // Server Action redirect landing on a Route Handler that redirects
  // again doesn't reliably carry the freshly-set session cookie). We
  // deliberately don't know (or claim to know) *who* the link is for at
  // this point -- token_hash can only be resolved by consuming it via
  // verifyOtp, which is exactly what we're avoiding here.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const params = new URLSearchParams({ token_hash: tokenHash, type, next });
    return NextResponse.redirect(`${origin}/auth/switch-account?${params}`);
  }

  const { error } = await supabase.auth.verifyOtp({
    type,
    token_hash: tokenHash,
  });

  if (!error) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/login?error=invite_link_invalid`);
}
