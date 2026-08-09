import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { getFirmId } from "@/utils/supabase/profile";
import type { DocumentWithMatter } from "@/utils/supabase/types";
import { formatUploadedDate } from "@/lib/documents";
import PageHeader from "@/components/ui/PageHeader";
import DocumentsListClient from "./DocumentsListClient";

export default async function DocumentsPage() {
  const supabase = await createClient();
  const firmId = await getFirmId(supabase);
  const { data: documents, error } = await supabase
    .from("documents")
    .select("id, file_name, category, created_at, matters!inner ( id, title )")
    .eq("matters.firm_id", firmId)
    .order("created_at", { ascending: false })
    .returns<DocumentWithMatter[]>();

  const rows = (documents ?? []).map((doc) => ({
    id: doc.id,
    name: doc.file_name,
    category: doc.category,
    matter: doc.matters?.title ?? "—",
    uploadedDate: formatUploadedDate(doc.created_at),
  }));

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Documents"
        description="Files uploaded across all matters."
        action={
          <Link
            href="/documents/new"
            className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-hover"
          >
            Upload Document
          </Link>
        }
      />

      {error ? (
        <p className="text-sm text-red-600">
          Failed to load documents: {error.message}
        </p>
      ) : (
        <DocumentsListClient documents={rows} />
      )}
    </div>
  );
}
