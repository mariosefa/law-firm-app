"use client";

import { useRouter } from "next/navigation";
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
  // When set, clicking the row navigates to this parent matter. Omitted on
  // the matter detail page, where the row's matter is already in view.
  matterId?: string;
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
  const router = useRouter();
  const display = getDisplayPriority(deadline.dueAt, deadline.priority);
  const navigate = deadline.matterId
    ? () => router.push(`/matters/${deadline.matterId}`)
    : undefined;

  return (
    <div
      onClick={navigate}
      onKeyDown={
        navigate
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate();
              }
            }
          : undefined
      }
      role={navigate ? "button" : undefined}
      tabIndex={navigate ? 0 : undefined}
      className={`flex items-center justify-between gap-4 px-5 py-4 transition-colors duration-150 hover:bg-zinc-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand dark:hover:bg-zinc-900 ${
        navigate ? "cursor-pointer" : ""
      }`}
    >
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
        {(editHref || onDelete) && (
          <div
            className="flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
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
        )}
      </div>
    </div>
  );
}
