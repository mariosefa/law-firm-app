import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import type { ClientRecord } from "@/utils/supabase/types";
import { updateClientRecord } from "../../actions";

const INPUT_CLASSES =
  "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 transition-colors duration-150 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";

export default async function EditClientPage({
  params,
}: PageProps<"/clients/[id]/edit">) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: client, error } = await supabase
    .from("clients")
    .select("id, name, email, phone")
    .eq("id", id)
    .maybeSingle<Pick<ClientRecord, "id" | "name" | "email" | "phone">>();

  if (error || !client) notFound();

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
        Edit Client
      </h1>
      <form
        action={updateClientRecord}
        className="space-y-6 rounded-xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <input type="hidden" name="id" value={client.id} />

        <div className="space-y-2">
          <label
            htmlFor="name"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={client.name}
            className={INPUT_CLASSES}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            defaultValue={client.email ?? ""}
            className={INPUT_CLASSES}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="phone"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            defaultValue={client.phone ?? ""}
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
