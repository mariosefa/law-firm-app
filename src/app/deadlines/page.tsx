import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { getFirmId } from "@/utils/supabase/profile";
import type { DeadlineWithMatter } from "@/utils/supabase/types";
import PageHeader from "@/components/ui/PageHeader";
import DeadlinesView, { type DeadlineListItem } from "./DeadlinesView";

export default async function DeadlinesPage() {
  const supabase = await createClient();
  const firmId = await getFirmId(supabase);
  const { data: deadlines, error } = await supabase
    .from("deadlines")
    .select("id, title, due_at, priority, matters!inner ( id, title )")
    .eq("matters.firm_id", firmId)
    .order("due_at", { ascending: true })
    .returns<DeadlineWithMatter[]>();

  const rows: DeadlineListItem[] = (deadlines ?? []).map((deadline) => ({
    id: deadline.id,
    title: deadline.title,
    matter: deadline.matters?.title ?? "—",
    matterId: deadline.matters?.id ?? "",
    dueAt: deadline.due_at,
    priority: deadline.priority,
  }));

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Deadlines"
        description="Everything due, soonest first."
        action={
          <Link
            href="/deadlines/new"
            className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-hover"
          >
            New Deadline
          </Link>
        }
      />

      {error ? (
        <p className="text-sm text-red-600">
          Failed to load deadlines: {error.message}
        </p>
      ) : (
        <DeadlinesView deadlines={rows} />
      )}
    </div>
  );
}
