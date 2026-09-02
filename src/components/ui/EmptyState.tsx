import Link from "next/link";
import type { LucideIcon } from "lucide-react";

type EmptyStateProps = {
  icon: LucideIcon;
  message: string;
  action?: { label: string; href: string };
};

export default function EmptyState({
  icon: Icon,
  message,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-brand dark:bg-brand/20 dark:text-[#7DD3FC]">
        <Icon size={22} />
      </span>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{message}</p>
      {action && (
        <Link
          href={action.href}
          className="mt-1 inline-flex items-center gap-1.5 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-hover"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
