import { createClient } from "@/utils/supabase/server";
import { getFirmId, getAccountInfo } from "@/utils/supabase/profile";
import type { Client, FirmMember } from "@/utils/supabase/types";
import CancelLink from "@/components/ui/CancelLink";
import PracticeAreaField from "@/components/ui/PracticeAreaField";
import TeamAccessField from "@/components/ui/TeamAccessField";
import { createMatter } from "../actions";

export default async function NewMatterPage() {
  const supabase = await createClient();
  const firmId = await getFirmId(supabase);
  const account = await getAccountInfo(supabase);
  const isOwner = account?.role === "owner";

  const { data: clients } = await supabase
    .from("clients")
    .select("id, name")
    .eq("firm_id", firmId)
    .order("name")
    .returns<Client[]>();

  let otherMembers: FirmMember[] = [];
  if (isOwner) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: members } = await supabase
      .from("users")
      .select("id, email, role")
      .eq("firm_id", firmId)
      .order("email")
      .returns<FirmMember[]>();

    otherMembers = (members ?? []).filter((member) => member.id !== user?.id);
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-serif-brand font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
        New Matter
      </h1>
      <form
        action={createMatter}
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
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 transition-colors duration-150 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
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
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 transition-colors duration-150 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
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

        <PracticeAreaField />

        {isOwner && otherMembers.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Assign team members
            </label>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              You&apos;ll be assigned automatically as the creator. Select
              anyone else who should have access to this matter.
            </p>
            <TeamAccessField members={otherMembers} />
          </div>
        )}

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
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 transition-colors duration-150 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          >
            <option value="Active">Active</option>
            <option value="On Hold">On Hold</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-hover"
          >
            Create Matter
          </button>
          <CancelLink href="/matters" />
        </div>
      </form>
    </div>
  );
}
