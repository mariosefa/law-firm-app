import type { MatterStatus } from "@/utils/supabase/types";

const STYLES: Record<MatterStatus, string> = {
  Active:
    "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  "On Hold": "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  Closed: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

export default function StatusBadge({ status }: { status: MatterStatus }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium ${STYLES[status]}`}
    >
      {status}
    </span>
  );
}
