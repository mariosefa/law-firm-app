import { createClient } from "@/utils/supabase/server";
import type { Client } from "@/utils/supabase/types";
import { createMatter } from "../actions";

export default async function NewMatterPage() {
  const supabase = await createClient();
  const { data: clients } = await supabase
    .from("clients")
    .select("id, name")
    .order("name")
    .returns<Client[]>();

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        New Matter
      </h1>
      <form
        action={createMatter}
        className="space-y-6 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
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
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
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
            defaultValue=""
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="" disabled>
              Select a client
            </option>
            {clients?.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
          {clients?.length === 0 && (
            <p className="text-xs text-zinc-500">
              No clients found — add one to the clients table first.
            </p>
          )}
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
            required
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
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
            defaultValue="Active"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="Active">Active</option>
            <option value="On Hold">On Hold</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover"
        >
          Create Matter
        </button>
      </form>
    </div>
  );
}
