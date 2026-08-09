import Link from "next/link";
import Logo from "@/components/Logo";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-24 text-center dark:bg-black">
      <Logo size={72} />
      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
        Casefile
      </h1>
      <p className="mt-3 max-w-sm text-base text-zinc-600 dark:text-zinc-400">
        Practice management for small firms
      </p>
      <Link
        href="/matters"
        className="mt-8 inline-flex items-center justify-center rounded-md bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-hover"
      >
        View matters
      </Link>
    </div>
  );
}
