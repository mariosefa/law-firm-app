import Link from "next/link";
import { Briefcase, Clock, FileText, Users } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { DEV_FIRM_ID } from "@/lib/constants";
import type { DeadlineWithMatter, MatterWithClient } from "@/utils/supabase/types";
import StatusBadge from "@/components/StatusBadge";
import DeadlineRow from "@/components/DeadlineRow";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";

// MOCK DATA — replace with Supabase query once documents are tracked
const PENDING_DOCUMENTS_COUNT = 3;

export default async function DashboardPage() {
  const supabase = await createClient();

  const [
    { count: matterCount },
    { count: clientCount },
    { count: deadlineCount },
    { data: recentMatters },
    { data: upcomingDeadlines },
  ] = await Promise.all([
    supabase
      .from("matters")
      .select("id", { count: "exact", head: true })
      .eq("firm_id", DEV_FIRM_ID),
    supabase
      .from("clients")
      .select("id", { count: "exact", head: true })
      .eq("firm_id", DEV_FIRM_ID),
    supabase
      .from("deadlines")
      .select("id, matters!inner ( firm_id )", { count: "exact", head: true })
      .eq("matters.firm_id", DEV_FIRM_ID),
    supabase
      .from("matters")
      .select("id, title, practice_area, status, clients ( id, name )")
      .eq("firm_id", DEV_FIRM_ID)
      .order("created_at", { ascending: false })
      .limit(5)
      .returns<MatterWithClient[]>(),
    supabase
      .from("deadlines")
      .select("id, title, due_at, priority, matters!inner ( id, title )")
      .eq("matters.firm_id", DEV_FIRM_ID)
      .order("due_at", { ascending: true })
      .limit(4)
      .returns<DeadlineWithMatter[]>(),
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Dashboard"
        description="Welcome back to Casefile."
        action={
          <Link
            href="/matters/new"
            className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-hover"
          >
            New Matter
          </Link>
        }
      />

      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Matters" value={matterCount ?? 0} icon={Briefcase} />
        <StatCard
          label="Upcoming Deadlines"
          value={deadlineCount ?? 0}
          icon={Clock}
        />
        <StatCard
          label="Active Clients"
          value={clientCount ?? 0}
          icon={Users}
        />
        <StatCard
          label="Pending Documents"
          value={PENDING_DOCUMENTS_COUNT}
          icon={FileText}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Recent Matters
          </h2>
          <Card>
            {recentMatters && recentMatters.length > 0 ? (
              <ul className="divide-y divide-zinc-100 dark:divide-zinc-900">
                {recentMatters.map((matter) => (
                  <li key={matter.id}>
                    <Link
                      href={`/matters/${matter.id}`}
                      className="flex items-center justify-between gap-4 px-5 py-4 transition-colors duration-150 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                          {matter.title}
                        </p>
                        <p className="truncate text-sm text-zinc-500 dark:text-zinc-400">
                          {matter.clients?.name ?? "—"} ·{" "}
                          {matter.practice_area}
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
          </Card>
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Upcoming Deadlines
          </h2>
          <Card>
            {upcomingDeadlines && upcomingDeadlines.length > 0 ? (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-900">
                {upcomingDeadlines.map((deadline) => (
                  <DeadlineRow
                    key={deadline.id}
                    deadline={{
                      id: deadline.id,
                      title: deadline.title,
                      matter: deadline.matters?.title ?? "—",
                      dueAt: deadline.due_at,
                      priority: deadline.priority,
                    }}
                  />
                ))}
              </div>
            ) : (
              <p className="px-5 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                No deadlines yet.
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
