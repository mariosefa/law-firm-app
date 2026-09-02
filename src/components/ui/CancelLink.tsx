import Link from "next/link";

export default function CancelLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors duration-150 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
    >
      Cancel
    </Link>
  );
}
