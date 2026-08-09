import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { DEV_FIRM_ID } from "@/lib/constants";
import type { MatterWithClient } from "@/utils/supabase/types";

export default async function MattersPage() {
  const supabase = await createClient();
  const { data: matters, error } = await supabase
    .from("matters")
    .select("id, title, practice_area, status, clients ( id, name )")
    .eq("firm_id", DEV_FIRM_ID)
    .order("created_at", { ascending: false })
    .returns<MatterWithClient[]>();

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Matters
        </h1>
        <Link
          href="/matters/new"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          New Matter
        </Link>
      </div>

      {error && (
        <p className="text-sm text-red-600">
          Failed to load matters: {error.message}
        </p>
      )}

      {!error && matters?.length === 0 && (
        <p className="text-sm text-zinc-500">No matters yet.</p>
      )}

      {!error && matters && matters.length > 0 && (
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800">
              <th className="py-2 pr-4 font-medium">Title</th>
              <th className="py-2 pr-4 font-medium">Client</th>
              <th className="py-2 pr-4 font-medium">Practice Area</th>
              <th className="py-2 pr-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {matters.map((matter) => (
              <tr
                key={matter.id}
                className="border-b border-zinc-100 dark:border-zinc-900"
              >
                <td className="py-3 pr-4">
                  <Link
                    href={`/matters/${matter.id}`}
                    className="font-medium text-zinc-900 hover:underline dark:text-zinc-50"
                  >
                    {matter.title}
                  </Link>
                </td>
                <td className="py-3 pr-4 text-zinc-600 dark:text-zinc-400">
                  {matter.clients?.name ?? "—"}
                </td>
                <td className="py-3 pr-4 text-zinc-600 dark:text-zinc-400">
                  {matter.practice_area}
                </td>
                <td className="py-3 pr-4 text-zinc-600 dark:text-zinc-400">
                  {matter.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
