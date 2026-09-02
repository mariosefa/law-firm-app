import { createClient } from "@/utils/supabase/server";
import { getFirmId, getAccountInfo } from "@/utils/supabase/profile";
import Logo from "@/components/Logo";
import WelcomeForm from "./WelcomeForm";

export default async function WelcomePage() {
  const supabase = await createClient();
  // getAccountInfo alone won't create the users row -- getFirmId calls
  // ensureUserProfile, which is what actually joins this invited user to
  // their assigned firm on first load.
  await getFirmId(supabase);
  const account = await getAccountInfo(supabase);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center px-4 py-10">
      <div className="mb-8">
        <Logo size={26} />
      </div>
      <div className="w-full max-w-sm rounded-xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="mb-2 text-center text-xl font-serif-brand font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          You&apos;ve joined {account?.firmName || "the firm"}
        </h1>
        <p className="mb-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Set a password to finish setting up your account.
        </p>
        <WelcomeForm />
      </div>
    </div>
  );
}
