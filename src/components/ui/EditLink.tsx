import Link from "next/link";
import { Pencil } from "lucide-react";

type EditLinkProps = {
  href: string;
  label?: string;
  variant?: "button" | "icon";
};

export default function EditLink({
  href,
  label = "Edit",
  variant = "button",
}: EditLinkProps) {
  if (variant === "icon") {
    return (
      <Link
        href={href}
        aria-label={label}
        title={label}
        className="rounded p-1 text-zinc-400 transition-colors duration-150 hover:bg-zinc-100 hover:text-zinc-600 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
      >
        <Pencil size={14} />
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors duration-150 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
    >
      <Pencil size={14} /> {label}
    </Link>
  );
}
