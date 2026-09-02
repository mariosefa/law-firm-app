import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { DOCUMENT_CATEGORIES } from "@/lib/documents";
import type { DocumentRecord } from "@/utils/supabase/types";
import CancelLink from "@/components/ui/CancelLink";
import { updateDocument } from "../../actions";

const INPUT_CLASSES =
  "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 transition-colors duration-150 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";

export default async function EditDocumentPage({
  params,
}: PageProps<"/documents/[id]/edit">) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: document, error } = await supabase
    .from("documents")
    .select("id, file_name, category")
    .eq("id", id)
    .maybeSingle<Pick<DocumentRecord, "id" | "file_name" | "category">>();

  if (error || !document) notFound();

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-serif-brand font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
        Edit Document
      </h1>
      <form
        action={updateDocument}
        className="space-y-6 rounded-xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <input type="hidden" name="id" value={document.id} />

        <div className="space-y-2">
          <label
            htmlFor="file_name"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            File Name
          </label>
          <input
            id="file_name"
            name="file_name"
            type="text"
            required
            defaultValue={document.file_name}
            className={INPUT_CLASSES}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="category"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Category
          </label>
          <select
            id="category"
            name="category"
            required
            defaultValue={document.category}
            className={INPUT_CLASSES}
          >
            {DOCUMENT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-hover"
          >
            Save Changes
          </button>
          <CancelLink href={`/documents/${document.id}`} />
        </div>
      </form>
    </div>
  );
}
