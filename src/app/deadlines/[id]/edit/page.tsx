import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { DEV_FIRM_ID } from "@/lib/constants";
import { dueDateOnly } from "@/lib/deadlines";
import type { DeadlineRecord, MatterRef } from "@/utils/supabase/types";
import { updateDeadline } from "../../actions";

const INPUT_CLASSES =
  "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 transition-colors duration-150 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";

type EditableDeadline = Pick<
  DeadlineRecord,
  "id" | "title" | "matter_id" | "due_at" | "priority"
>;

export default async function EditDeadlinePage({
  params,
}: PageProps<"/deadlines/[id]/edit">) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: deadline, error }, { data: matters }] = await Promise.all([
    supabase
      .from("deadlines")
      .select("id, title, matter_id, due_at, priority")
      .eq("id", id)
      .maybeSingle<EditableDeadline>(),
    supabase
      .from("matters")
      .select("id, title")
      .eq("firm_id", DEV_FIRM_ID)
      .order("title")
      .returns<MatterRef[]>(),
  ]);

  if (error || !deadline) notFound();

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
        Edit Deadline
      </h1>
      <form
        action={updateDeadline}
        className="space-y-6 rounded-xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <input type="hidden" name="id" value={deadline.id} />

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
            defaultValue={deadline.title}
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
            defaultValue={deadline.matter_id}
            className={INPUT_CLASSES}
          >
            {matters?.map((matter) => (
              <option key={matter.id} value={matter.id}>
                {matter.title}
              </option>
            ))}
          </select>
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
            defaultValue={dueDateOnly(deadline.due_at)}
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
            defaultValue={deadline.priority}
            className={INPUT_CLASSES}
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
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
