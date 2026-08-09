import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { DEV_FIRM_ID } from "@/lib/constants";
import type { MatterWithClient } from "@/utils/supabase/types";
import StatusBadge from "@/components/StatusBadge";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";

export default async function MattersPage() {
  const supabase = await createClient();
  const { data: matters, error } = await supabase
    .from("matters")
    .select("id, title, practice_area, status, clients ( id, name )")
    .eq("firm_id", DEV_FIRM_ID)
    .order("created_at", { ascending: false })
    .returns<MatterWithClient[]>();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Matters"
        description="Every matter your firm is working on."
        action={
          <Link
            href="/matters/new"
            className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-hover"
          >
            New Matter
          </Link>
        }
      />

      {error && (
        <p className="text-sm text-red-600">
          Failed to load matters: {error.message}
        </p>
      )}

      {!error && matters?.length === 0 && (
        <Card className="py-12 text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No matters yet.
          </p>
        </Card>
      )}

      {!error && matters && matters.length > 0 && (
        <Card className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                <th className="px-5 py-3 font-medium">Title</th>
                <th className="px-5 py-3 font-medium">Client</th>
                <th className="px-5 py-3 font-medium">Practice Area</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
              {matters.map((matter) => (
                <tr
                  key={matter.id}
                  className="transition-colors duration-150 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                >
                  <td className="px-5 py-4">
                    <Link
                      href={`/matters/${matter.id}`}
                      className="font-medium text-zinc-900 transition-colors duration-150 hover:text-brand dark:text-zinc-50 dark:hover:text-[#7DD3FC]"
                    >
                      {matter.title}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-zinc-600 dark:text-zinc-400">
                    {matter.clients?.name ?? "—"}
                  </td>
                  <td className="px-5 py-4 text-zinc-600 dark:text-zinc-400">
                    {matter.practice_area}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={matter.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
