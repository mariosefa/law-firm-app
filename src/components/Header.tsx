import Link from "next/link";
import Logo from "./Logo";

export default function Header() {
  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Logo size={28} />
          <span className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            Casefile
          </span>
        </Link>
        <Link
          href="/matters"
          className="text-sm font-medium text-zinc-700 hover:text-brand dark:text-zinc-300 dark:hover:text-[#7DD3FC]"
        >
          Matters
        </Link>
      </div>
    </header>
  );
}
