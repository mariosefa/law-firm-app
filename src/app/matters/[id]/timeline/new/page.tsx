import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import CancelLink from "@/components/ui/CancelLink";
import { createTimelineEvent } from "../actions";

const INPUT_CLASSES =
  "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 transition-colors duration-150 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";

export default async function NewTimelineEventPage({
  params,
}: PageProps<"/matters/[id]/timeline/new">) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: matter, error } = await supabase
    .from("matters")
    .select("id, title")
    .eq("id", id)
    .maybeSingle();

  if (error || !matter) notFound();

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-2 text-2xl font-serif-brand font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
        New Timeline Event
      </h1>
      <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-400">
        {matter.title}
      </p>
      <form
        action={createTimelineEvent}
        className="space-y-6 rounded-xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <input type="hidden" name="matter_id" value={matter.id} />

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
            className={INPUT_CLASSES}
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-hover"
          >
            Add Event
          </button>
          <CancelLink href={`/matters/${matter.id}`} />
        </div>
      </form>
    </div>
  );
}
