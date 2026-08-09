import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import type { MatterWithClient } from "@/utils/supabase/types";

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

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link
        href="/matters"
        className="text-sm text-zinc-500 hover:underline"
      >
        &larr; Back to Matters
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        {matter.title}
      </h1>
      <dl className="mt-6 flex flex-col gap-4 text-sm">
        <div>
          <dt className="text-zinc-500">Client</dt>
          <dd className="text-zinc-900 dark:text-zinc-50">
            {matter.clients?.name ?? "—"}
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500">Practice Area</dt>
          <dd className="text-zinc-900 dark:text-zinc-50">
            {matter.practice_area}
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500">Status</dt>
          <dd className="text-zinc-900 dark:text-zinc-50">
            {matter.status}
          </dd>
        </div>
        {matter.matter_number && (
          <div>
            <dt className="text-zinc-500">Matter Number</dt>
            <dd className="text-zinc-900 dark:text-zinc-50">
              {matter.matter_number}
            </dd>
          </div>
        )}
        <div>
          <dt className="text-zinc-500">Opened</dt>
          <dd className="text-zinc-900 dark:text-zinc-50">
            {matter.opened_date}
          </dd>
        </div>
      </dl>
    </div>
  );
}
