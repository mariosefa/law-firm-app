import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import type { MatterWithClient } from "@/utils/supabase/types";
import { MOCK_DOCUMENTS } from "@/lib/mock-data";
import StatusBadge from "@/components/StatusBadge";
import DocumentsTable from "@/components/DocumentsTable";

export default async function MatterDetailPage({
  params,
}: PageProps<"/matters/[id]">) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: matter, error } = await supabase
    .from("matters")
    .select(
      "id, title, practice_area, status, matter_number, opened_date, clients ( id, name )"
    )
    .eq("id", id)
    .maybeSingle<MatterWithClient>();

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
        <StatusBadge status={matter.status} />
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
        Documents
      </h2>
      <DocumentsTable
        documents={MOCK_DOCUMENTS.filter((doc) => doc.matter === matter.title)}
        showMatterColumn={false}
        emptyMessage="No documents for this matter yet."
      />
    </div>
  );
}
