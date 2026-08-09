import { formatEventDate } from "@/lib/timelineEvents";
import DeleteButton from "@/components/ui/DeleteButton";
import EditLink from "@/components/ui/EditLink";

export type TimelineEventRowData = {
  id: string;
  title: string;
  eventDate: string;
  description: string | null;
};

export default function TimelineEventRow({
  event,
  editHref,
  onDelete,
}: {
  event: TimelineEventRowData;
  editHref?: string;
  onDelete?: () => Promise<void>;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 py-4 transition-colors duration-150 hover:bg-zinc-50 dark:hover:bg-zinc-900">
      <div className="min-w-0">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          {event.title}
        </p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {formatEventDate(event.eventDate)}
        </p>
        {event.description && (
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {event.description}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {editHref && (
          <EditLink
            variant="icon"
            label="Edit timeline event"
            href={editHref}
          />
        )}
        {onDelete && (
          <DeleteButton
            variant="icon"
            label="Delete timeline event"
            onDelete={onDelete}
          />
        )}
      </div>
    </div>
  );
}
