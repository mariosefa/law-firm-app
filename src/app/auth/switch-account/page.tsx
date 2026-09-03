import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getAccountInfo } from "@/utils/supabase/profile";
import { safeRedirectPath } from "@/lib/redirects";
import Logo from "@/components/Logo";
import { logoutAndRetryInvite } from "./actions";

export default async function SwitchAccountPage({
  searchParams,
}: PageProps<"/auth/switch-account">) {
  const params = await searchParams;
  const tokenHash = typeof params.token_hash === "string" ? params.token_hash : null;
  const type = typeof params.type === "string" ? params.type : null;
  const next = safeRedirectPath(
    typeof params.next === "string" ? params.next : "/"
  );

  if (!tokenHash || !type) redirect("/login?error=invite_link_invalid");

  const supabase = await createClient();
  const account = await getAccountInfo(supabase);

  // Session disappeared between /auth/confirm and here (e.g. it expired,
  // or someone logged out in another tab) -- just retry the link, which
  // will now proceed normally since there's no session in the way.
  if (!account) {
    const retryParams = new URLSearchParams({ token_hash: tokenHash, type, next });
    redirect(`/auth/confirm?${retryParams}`);
  }

  const logoutAndRetry = logoutAndRetryInvite.bind(null, tokenHash, type, next);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center px-4 py-10">
      <div className="mb-8">
        <Logo size={26} />
      </div>
      <div className="w-full max-w-sm rounded-xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="mb-2 text-center text-xl font-serif-brand font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          You&apos;re already logged in
        </h1>
        <p className="mb-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          You&apos;re currently logged in as{" "}
          <strong className="text-zinc-700 dark:text-zinc-300">
            {account.email}
          </strong>
          . This invite link is for a different account — log out to
          continue.
        </p>
        <form action={logoutAndRetry}>
          <button
            type="submit"
            className="w-full rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-hover"
          >
            Log out and continue
          </button>
        </form>
      </div>
    </div>
  );
}
