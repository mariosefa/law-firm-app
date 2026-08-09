import type { DeadlinePriority } from "@/utils/supabase/types";
import {
  formatDeadlineDate,
  getDisplayLabel,
  getDisplayPriority,
  getPriorityColor,
} from "@/lib/deadlines";
import Badge from "@/components/ui/Badge";
import DeleteButton from "@/components/ui/DeleteButton";
import EditLink from "@/components/ui/EditLink";

export type DeadlineRowData = {
  id: string;
  title: string;
  matter: string;
  dueAt: string;
  priority: DeadlinePriority;
};

export default function DeadlineRow({
  deadline,
  editHref,
  onDelete,
}: {
  deadline: DeadlineRowData;
  editHref?: string;
  onDelete?: () => Promise<void>;
}) {
  const display = getDisplayPriority(deadline.dueAt, deadline.priority);
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4 transition-colors duration-150 hover:bg-zinc-50 dark:hover:bg-zinc-900">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
          {deadline.title}
        </p>
        <p className="truncate text-sm text-zinc-500 dark:text-zinc-400">
          {deadline.matter} · Due {formatDeadlineDate(deadline.dueAt)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Badge color={getPriorityColor(display)}>
          {getDisplayLabel(deadline.dueAt, deadline.priority)}
        </Badge>
        {editHref && (
          <EditLink variant="icon" label="Edit deadline" href={editHref} />
        )}
        {onDelete && (
          <DeleteButton
            variant="icon"
            label="Delete deadline"
            onDelete={onDelete}
          />
        )}
      </div>
    </div>
  );
}
