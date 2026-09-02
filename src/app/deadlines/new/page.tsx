import { createClient } from "@/utils/supabase/server";
import { getFirmId } from "@/utils/supabase/profile";
import type { MatterRef } from "@/utils/supabase/types";
import CancelLink from "@/components/ui/CancelLink";
import { createDeadline } from "../actions";

const INPUT_CLASSES =
  "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 transition-colors duration-150 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";

export default async function NewDeadlinePage() {
  const supabase = await createClient();
  const firmId = await getFirmId(supabase);
  const { data: matters } = await supabase
    .from("matters")
    .select("id, title")
    .eq("firm_id", firmId)
    .order("title")
    .returns<MatterRef[]>();

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-serif-brand font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
        New Deadline
      </h1>
      <form
        action={createDeadline}
        className="space-y-6 rounded-xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
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
            htmlFor="matter_id"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Matter
          </label>
          <select
            id="matter_id"
            name="matter_id"
            required
            defaultValue=""
            className={INPUT_CLASSES}
          >
            <option value="" disabled>
              Select a matter
            </option>
            {matters?.map((matter) => (
              <option key={matter.id} value={matter.id}>
                {matter.title}
              </option>
            ))}
          </select>
          {matters?.length === 0 && (
            <p className="text-xs text-zinc-500">
              No matters found — add one to the matters table first.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="due_date"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Due Date
          </label>
          <input
            id="due_date"
            name="due_date"
            type="date"
            required
            className={INPUT_CLASSES}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="priority"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            defaultValue="Medium"
            className={INPUT_CLASSES}
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-hover"
          >
            Add Deadline
          </button>
          <CancelLink href="/deadlines" />
        </div>
      </form>
    </div>
  );
}
