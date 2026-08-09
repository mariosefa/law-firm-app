import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getFirmId } from "@/utils/supabase/profile";
import { PRACTICE_AREAS } from "@/lib/matters";
import type { Client, Matter } from "@/utils/supabase/types";
import { updateMatter } from "../../actions";

const INPUT_CLASSES =
  "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 transition-colors duration-150 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";

type EditableMatter = Pick<
  Matter,
  "id" | "title" | "practice_area" | "status" | "client_id" | "narrative"
>;

export default async function EditMatterPage({
  params,
}: PageProps<"/matters/[id]/edit">) {
  const { id } = await params;
  const supabase = await createClient();
  const firmId = await getFirmId(supabase);

  const [{ data: matter, error }, { data: clients }] = await Promise.all([
    supabase
      .from("matters")
      .select("id, title, practice_area, status, client_id, narrative")
      .eq("id", id)
      .maybeSingle<EditableMatter>(),
    supabase
      .from("clients")
      .select("id, name")
      .eq("firm_id", firmId)
      .order("name")
      .returns<Client[]>(),
  ]);

  if (error || !matter) notFound();

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
        Edit Matter
      </h1>
      <form
        action={updateMatter}
        className="space-y-6 rounded-xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <input type="hidden" name="id" value={matter.id} />

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
            defaultValue={matter.title}
            className={INPUT_CLASSES}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="client_id"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Client
          </label>
          <select
            id="client_id"
            name="client_id"
            required
            defaultValue={matter.client_id}
            className={INPUT_CLASSES}
          >
            {clients?.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="practice_area"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Practice Area
          </label>
          <input
            id="practice_area"
            name="practice_area"
            type="text"
            list="practice-area-options"
            required
            autoComplete="off"
            defaultValue={matter.practice_area}
            className={INPUT_CLASSES}
          />
          <datalist id="practice-area-options">
            {PRACTICE_AREAS.map((area) => (
              <option key={area} value={area} />
            ))}
          </datalist>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="status"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={matter.status}
            className={INPUT_CLASSES}
          >
            <option value="Active">Active</option>
            <option value="On Hold">On Hold</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="narrative"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Case Narrative
          </label>
          <textarea
            id="narrative"
            name="narrative"
            rows={6}
            defaultValue={matter.narrative ?? ""}
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
