import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import type {
  DeadlineRecord,
  DocumentRecord,
  MatterWithClient,
  TimelineEventRecord,
} from "@/utils/supabase/types";
import { formatUploadedDate } from "@/lib/documents";
import StatusBadge from "@/components/StatusBadge";
import DocumentsTable from "@/components/DocumentsTable";
import DeadlineRow from "@/components/DeadlineRow";
import TimelineEventRow from "@/components/TimelineEventRow";
import Card from "@/components/ui/Card";
import DeleteButton from "@/components/ui/DeleteButton";
import EditLink from "@/components/ui/EditLink";
import { deleteMatter } from "../actions";
import { deleteTimelineEvent } from "./timeline/actions";

export default async function MatterDetailPage({
  params,
}: PageProps<"/matters/[id]">) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: matter, error },
    { data: deadlines },
    { data: documents },
    { data: timelineEvents },
  ] = await Promise.all([
    supabase
      .from("matters")
      .select(
        "id, title, practice_area, status, matter_number, opened_date, narrative, clients ( id, name )"
      )
      .eq("id", id)
      .maybeSingle<MatterWithClient>(),
    supabase
      .from("deadlines")
      .select("id, title, due_at, priority")
      .eq("matter_id", id)
      .order("due_at", { ascending: true })
      .returns<
        Pick<DeadlineRecord, "id" | "title" | "due_at" | "priority">[]
      >(),
    supabase
      .from("documents")
      .select("id, file_name, category, created_at")
      .eq("matter_id", id)
      .order("created_at", { ascending: false })
      .returns<
        Pick<DocumentRecord, "id" | "file_name" | "category" | "created_at">[]
      >(),
    supabase
      .from("timeline_events")
      .select("id, title, event_date, description")
      .eq("matter_id", id)
      .order("event_date", { ascending: true })
      .returns<
        Pick<
          TimelineEventRecord,
          "id" | "title" | "event_date" | "description"
        >[]
      >(),
  ]);

  if (error || !matter) notFound();

  const fields = [
    { label: "Client", value: matter.clients?.name ?? "—" },
    { label: "Practice Area", value: matter.practice_area },
    ...(matter.matter_number
      ? [{ label: "Matter Number", value: matter.matter_number }]
      : []),
    { label: "Opened", value: matter.opened_date },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/matters"
        className="text-sm text-zinc-500 transition-colors duration-150 hover:text-brand dark:text-zinc-400 dark:hover:text-[#7DD3FC]"
      >
        &larr; Back to Matters
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {matter.title}
        </h1>
        <div className="flex items-center gap-3">
          <StatusBadge status={matter.status} />
          <EditLink href={`/matters/${matter.id}/edit`} label="Edit Matter" />
          <DeleteButton
            label="Delete Matter"
            onDelete={deleteMatter.bind(null, matter.id)}
            redirectTo="/matters"
          />
        </div>
      </div>

      <dl className="mt-8 divide-y divide-zinc-100 rounded-xl border border-zinc-200/80 bg-white shadow-sm dark:divide-zinc-900 dark:border-zinc-800 dark:bg-zinc-950">
        {fields.map((field) => (
          <div
            key={field.label}
            className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <dt className="text-sm text-zinc-500 dark:text-zinc-400">
              {field.label}
            </dt>
            <dd className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              {field.value}
            </dd>
          </div>
        ))}
      </dl>

      <h2 className="mt-10 mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Case Narrative
      </h2>
      <Card>
        {matter.narrative ? (
          <p className="whitespace-pre-wrap px-5 py-4 text-sm text-zinc-700 dark:text-zinc-300">
            {matter.narrative}
          </p>
        ) : (
          <p className="px-5 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
            No narrative yet.
          </p>
        )}
      </Card>

      <div className="mt-10 mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Timeline
        </h2>
        <Link
          href={`/matters/${matter.id}/timeline/new`}
          className="text-sm font-medium text-brand transition-colors duration-150 hover:text-brand-hover dark:text-[#7DD3FC]"
        >
          + Add Event
        </Link>
      </div>
      <Card>
        {timelineEvents && timelineEvents.length > 0 ? (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-900">
            {timelineEvents.map((event) => (
              <TimelineEventRow
                key={event.id}
                event={{
                  id: event.id,
                  title: event.title,
                  eventDate: event.event_date,
                  description: event.description,
                }}
                editHref={`/matters/${matter.id}/timeline/${event.id}/edit`}
                onDelete={() => deleteTimelineEvent(event.id)}
              />
            ))}
          </div>
        ) : (
          <p className="px-5 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
            No timeline events for this matter yet.
          </p>
        )}
      </Card>

      <h2 className="mt-10 mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Deadlines
      </h2>
      <Card>
        {deadlines && deadlines.length > 0 ? (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-900">
            {deadlines.map((deadline) => (
              <DeadlineRow
                key={deadline.id}
                deadline={{
                  id: deadline.id,
                  title: deadline.title,
                  matter: matter.title,
                  dueAt: deadline.due_at,
                  priority: deadline.priority,
                }}
              />
            ))}
          </div>
        ) : (
          <p className="px-5 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
            No deadlines for this matter yet.
          </p>
        )}
      </Card>

      <h2 className="mt-10 mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Documents
      </h2>
      <DocumentsTable
        documents={(documents ?? []).map((doc) => ({
          id: doc.id,
          name: doc.file_name,
          category: doc.category,
          matter: matter.title,
          uploadedDate: formatUploadedDate(doc.created_at),
        }))}
        showMatterColumn={false}
        emptyMessage="No documents for this matter yet."
      />
    </div>
  );
}
