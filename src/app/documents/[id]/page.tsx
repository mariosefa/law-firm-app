import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import type { DocumentRecord, MatterRef } from "@/utils/supabase/types";
import { formatUploadedDate, getFileType } from "@/lib/documents";
import { FILE_ICONS } from "@/components/DocumentsTable";
import DeleteButton from "@/components/ui/DeleteButton";
import EditLink from "@/components/ui/EditLink";
import { deleteDocument } from "../actions";

type DocumentDetail = Pick<
  DocumentRecord,
  "id" | "file_name" | "category" | "storage_path" | "created_at"
> & {
  matters: MatterRef | null;
};

export default async function DocumentDetailPage({
  params,
}: PageProps<"/documents/[id]">) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: document, error } = await supabase
    .from("documents")
    .select(
      "id, file_name, category, storage_path, created_at, matters ( id, title )"
    )
    .eq("id", id)
    .maybeSingle<DocumentDetail>();

  if (error || !document) notFound();

  const { data: signedUrlData } = await supabase.storage
    .from("documents")
    .createSignedUrl(document.storage_path, 3600);

  const Icon = FILE_ICONS[getFileType(document.file_name)];

  const fields = [
    { label: "Category", value: document.category },
    { label: "Matter", value: document.matters?.title ?? "—" },
    { label: "Uploaded", value: formatUploadedDate(document.created_at) },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/documents"
        className="text-sm text-zinc-500 transition-colors duration-150 hover:text-brand dark:text-zinc-400 dark:hover:text-[#7DD3FC]"
      >
        &larr; Back to Documents
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand dark:bg-brand/20 dark:text-[#7DD3FC]">
            <Icon size={20} />
          </span>
          <h1 className="truncate text-2xl font-serif-brand font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
            {document.file_name}
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <EditLink
            href={`/documents/${document.id}/edit`}
            label="Edit Document"
          />
          <DeleteButton
            label="Delete Document"
            onDelete={deleteDocument.bind(null, document.id)}
            redirectTo="/documents"
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

      {signedUrlData?.signedUrl ? (
        <a
          href={signedUrlData.signedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center justify-center rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-hover"
        >
          View / Download File
        </a>
      ) : (
        <p className="mt-6 text-sm text-red-600 dark:text-red-400">
          Unable to generate a download link for this file.
        </p>
      )}
    </div>
  );
}
