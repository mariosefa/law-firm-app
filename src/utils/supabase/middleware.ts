import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY env var."
  );
}

// Logged-in users get redirected away from these (they don't make sense
// once you're already signed in).
const UNAUTHENTICATED_ONLY_PATHS = ["/login", "/signup"];

// Reachable regardless of auth state, and never auto-redirected by
// middleware in either direction -- these are transitional routes in the
// invite flow that need to run their own logic instead:
// /auth/confirm is where an invited (or signing-up) user's emailed link
// lands, which is what establishes their session in the first place, so
// it must work while unauthenticated. /auth/switch-account is the
// "you're logged in as someone else" prompt /auth/confirm bounces to
// when a session already exists, so it must work while authenticated.
const PUBLIC_PATHS = ["/auth/confirm", "/auth/switch-account"];

export const updateSession = async (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Do not run code between createServerClient and supabase.auth.getUser().
  // A simple mistake could make it very hard to debug issues with users
  // being randomly logged out.
  //
  // getUser() revalidates the auth token with Supabase on every request,
  // which is what actually refreshes the session cookies.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isUnauthenticatedOnlyPath = UNAUTHENTICATED_ONLY_PATHS.includes(pathname);
  const isPublicPath = PUBLIC_PATHS.includes(pathname);

  if (!user && !isUnauthenticatedOnlyPath && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isUnauthenticatedOnlyPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    const redirectResponse = NextResponse.redirect(url);
    // Preserve any session cookies getUser() just refreshed above —
    // returning a fresh NextResponse.redirect() here would otherwise
    // silently drop them.
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return redirectResponse;
  }

  return supabaseResponse;
};
