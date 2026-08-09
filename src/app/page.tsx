import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { DEV_FIRM_ID } from "@/lib/constants";
import type { MatterWithClient } from "@/utils/supabase/types";
import StatusBadge from "@/components/StatusBadge";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [{ count: matterCount }, { data: recentMatters }] = await Promise.all(
    [
      supabase
        .from("matters")
        .select("id", { count: "exact", head: true })
        .eq("firm_id", DEV_FIRM_ID),
      supabase
        .from("matters")
        .select("id, title, practice_area, status, clients ( id, name )")
        .eq("firm_id", DEV_FIRM_ID)
        .order("created_at", { ascending: false })
        .limit(5)
        .returns<MatterWithClient[]>(),
    ]
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Welcome back to Casefile.
          </p>
        </div>
        <Link
          href="/matters/new"
          className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover"
        >
          New Matter
        </Link>
      </div>

      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Total Matters
          </p>
          <p className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
            {matterCount ?? 0}
          </p>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Recent Matters
        </h2>
        <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          {recentMatters && recentMatters.length > 0 ? (
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-900">
              {recentMatters.map((matter) => (
                <li key={matter.id}>
                  <Link
                    href={`/matters/${matter.id}`}
                    className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                        {matter.title}
                      </p>
                      <p className="truncate text-sm text-zinc-500 dark:text-zinc-400">
                        {matter.clients?.name ?? "—"} · {matter.practice_area}
                      </p>
                    </div>
                    <StatusBadge status={matter.status} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
              No matters yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
