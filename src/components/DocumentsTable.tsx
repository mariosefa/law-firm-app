import { File, FileSpreadsheet, FileText, type LucideIcon } from "lucide-react";
import { getFileType, type DocumentFileType } from "@/lib/documents";
import Card from "@/components/ui/Card";

export const FILE_ICONS: Record<DocumentFileType, LucideIcon> = {
  pdf: FileText,
  docx: File,
  xlsx: FileSpreadsheet,
  other: File,
};

export type DocumentRow = {
  id: string;
  name: string;
  category: string;
  matter: string;
  uploadedDate: string;
};

type DocumentsTableProps = {
  documents: DocumentRow[];
  showMatterColumn?: boolean;
  emptyMessage?: string;
};

export default function DocumentsTable({
  documents,
  showMatterColumn = true,
  emptyMessage = "No documents yet.",
}: DocumentsTableProps) {
  if (documents.length === 0) {
    return (
      <Card className="py-10 text-center">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {emptyMessage}
        </p>
      </Card>
    );
  }

  return (
    <Card className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            <th className="px-5 py-3 font-medium">Name</th>
            <th className="px-5 py-3 font-medium">Category</th>
            {showMatterColumn && (
              <th className="px-5 py-3 font-medium">Matter</th>
            )}
            <th className="px-5 py-3 font-medium">Uploaded</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
          {documents.map((doc) => {
            const Icon = FILE_ICONS[getFileType(doc.name)];
            return (
              <tr
                key={doc.id}
                className="transition-colors duration-150 hover:bg-zinc-50 dark:hover:bg-zinc-900"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand dark:bg-brand/20 dark:text-[#7DD3FC]">
                      <Icon size={16} />
                    </span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-50">
                      {doc.name}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-4 text-zinc-600 dark:text-zinc-400">
                  {doc.category}
                </td>
                {showMatterColumn && (
                  <td className="px-5 py-4 text-zinc-600 dark:text-zinc-400">
                    {doc.matter}
                  </td>
                )}
                <td className="px-5 py-4 text-zinc-600 dark:text-zinc-400">
                  {doc.uploadedDate}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}
