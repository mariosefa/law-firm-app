import Link from "next/link";
import Logo from "@/components/Logo";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center px-4 py-10">
      <div className="mb-8">
        <Logo size={26} />
      </div>
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-center text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Log in to your firm
        </h1>
        <LoginForm />
        <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Don&apos;t have a firm yet?{" "}
          <Link
            href="/signup"
            className="font-medium text-brand hover:text-brand-hover dark:text-[#7DD3FC]"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
