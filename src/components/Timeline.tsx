import { formatEventDate } from "@/lib/timelineEvents";
import DeleteButton from "@/components/ui/DeleteButton";
import EditLink from "@/components/ui/EditLink";

export type TimelineEvent = {
  id: string;
  title: string;
  eventDate: string;
  description: string | null;
};

// Above this count, events are grouped under sticky month headers so a
// long history stays scannable.
const MONTH_GROUP_THRESHOLD = 8;

function monthLabel(eventDate: string) {
  return new Date(`${eventDate}T00:00:00`).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function TimelineItem({
  event,
  editHref,
  onDelete,
}: {
  event: TimelineEvent;
  editHref: string;
  onDelete: () => Promise<void>;
}) {
  return (
    <li className="group grid grid-cols-[5.5rem_1fr] gap-x-4 sm:grid-cols-[7rem_1fr] sm:gap-x-5">
      <p className="pt-px text-right text-xs font-semibold text-zinc-600 tabular-nums dark:text-zinc-300 sm:text-sm">
        {formatEventDate(event.eventDate)}
      </p>
      <div className="relative border-l border-zinc-200 pb-8 pl-6 group-last:border-transparent group-last:pb-1 dark:border-zinc-800">
        <span className="absolute top-1 -left-[5px] h-2.5 w-2.5 rounded-full bg-brand ring-4 ring-white dark:bg-[#7DD3FC] dark:ring-zinc-950" />
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              {event.title}
            </p>
            {event.description && (
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {event.description}
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2 opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-within:opacity-100">
            <EditLink
              variant="icon"
              label="Edit timeline event"
              href={editHref}
            />
            <DeleteButton
              variant="icon"
              label="Delete timeline event"
              onDelete={onDelete}
            />
          </div>
        </div>
      </div>
    </li>
  );
}

export default function Timeline({
  events,
  getEditHref,
  onDelete,
}: {
  events: TimelineEvent[];
  getEditHref: (eventId: string) => string;
  onDelete: (eventId: string) => Promise<void>;
}) {
  if (events.length === 0) {
    return (
      <p className="px-5 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
        No timeline events for this matter yet.
      </p>
    );
  }

  const grouped = events.length > MONTH_GROUP_THRESHOLD;

  if (!grouped) {
    return (
      <ol className="px-5 py-5">
        {events.map((event) => (
          <TimelineItem
            key={event.id}
            event={event}
            editHref={getEditHref(event.id)}
            onDelete={onDelete.bind(null, event.id)}
          />
        ))}
      </ol>
    );
  }

  const months: { label: string; events: TimelineEvent[] }[] = [];
  for (const event of events) {
    const label = monthLabel(event.eventDate);
    const current = months[months.length - 1];
    if (current?.label === label) {
      current.events.push(event);
    } else {
      months.push({ label, events: [event] });
    }
  }

  return (
    <div className="px-5 py-2">
      {months.map((month) => (
        <section key={month.label}>
          <h3 className="sticky top-0 z-10 -mx-5 border-b border-zinc-100 bg-white px-5 py-2.5 text-xs font-semibold tracking-wide text-zinc-500 uppercase dark:border-zinc-900 dark:bg-zinc-950 dark:text-zinc-400">
            {month.label}
          </h3>
          <ol className="pt-2 pb-1">
            {month.events.map((event) => (
              <TimelineItem
                key={event.id}
                event={event}
                editHref={getEditHref(event.id)}
                onDelete={onDelete.bind(null, event.id)}
              />
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
