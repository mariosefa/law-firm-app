import type { MockDeadline } from "@/lib/mock-data";
import { formatDeadlineDate } from "@/lib/mock-data";
import Badge from "@/components/ui/Badge";

export default function DeadlineRow({ deadline }: { deadline: MockDeadline }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4 transition-colors duration-150 hover:bg-zinc-50 dark:hover:bg-zinc-900">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
          {deadline.title}
        </p>
        <p className="truncate text-sm text-zinc-500 dark:text-zinc-400">
          {deadline.matter} · Due {formatDeadlineDate(deadline.date)}
        </p>
      </div>
      <Badge color={deadline.color}>{deadline.priority}</Badge>
    </div>
  );
}
