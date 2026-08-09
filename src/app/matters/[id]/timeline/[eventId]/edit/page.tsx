import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import type { TimelineEventRecord } from "@/utils/supabase/types";
import { updateTimelineEvent } from "../../actions";

const INPUT_CLASSES =
  "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 transition-colors duration-150 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";

export default async function EditTimelineEventPage({
  params,
}: PageProps<"/matters/[id]/timeline/[eventId]/edit">) {
  const { id, eventId } = await params;
  const supabase = await createClient();

  const { data: event, error } = await supabase
    .from("timeline_events")
    .select("id, matter_id, title, event_date, description")
    .eq("id", eventId)
    .eq("matter_id", id)
    .maybeSingle<
      Pick<
        TimelineEventRecord,
        "id" | "matter_id" | "title" | "event_date" | "description"
      >
    >();

  if (error || !event) notFound();

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
        Edit Timeline Event
      </h1>
      <form
        action={updateTimelineEvent}
        className="space-y-6 rounded-xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <input type="hidden" name="id" value={event.id} />
        <input type="hidden" name="matter_id" value={event.matter_id} />

        <div className="space-y-2">
          <label
            htmlFor="title"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            defaultValue={event.title}
            className={INPUT_CLASSES}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="event_date"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Event Date
          </label>
          <input
            id="event_date"
            name="event_date"
            type="date"
            required
            defaultValue={event.event_date}
            className={INPUT_CLASSES}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="description"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={event.description ?? ""}
            className={INPUT_CLASSES}
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-hover"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
