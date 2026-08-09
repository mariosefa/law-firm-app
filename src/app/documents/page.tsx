import { File, FileSpreadsheet, FileText, type LucideIcon } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";

const FILE_ICONS: Record<string, LucideIcon> = {
  pdf: FileText,
  docx: File,
  xlsx: FileSpreadsheet,
};

// MOCK DATA — replace with Supabase query once documents are tracked
const MOCK_DOCUMENTS = [
  {
    id: "1",
    name: "Complaint - Smith v. Jones.pdf",
    type: "pdf",
    category: "Pleading",
    matter: "Smith v. Jones",
    uploadedDate: "Aug 1, 2026",
  },
  {
    id: "2",
    name: "Discovery Responses.docx",
    type: "docx",
    category: "Discovery",
    matter: "Chen LLC Contract Review",
    uploadedDate: "Aug 3, 2026",
  },
  {
    id: "3",
    name: "Trademark Application.pdf",
    type: "pdf",
    category: "Filing",
    matter: "Martinez Trademark Filing",
    uploadedDate: "Jul 28, 2026",
  },
  {
    id: "4",
    name: "Billing Summary Q3.xlsx",
    type: "xlsx",
    category: "Billing",
    matter: "Johnson Estate Planning",
    uploadedDate: "Aug 6, 2026",
  },
  {
    id: "5",
    name: "Settlement Agreement Draft.docx",
    type: "docx",
    category: "Contract",
    matter: "Williams Personal Injury Claim",
    uploadedDate: "Aug 7, 2026",
  },
  {
    id: "6",
    name: "Client Intake Form.pdf",
    type: "pdf",
    category: "Intake",
    matter: "Anderson Divorce Proceedings",
    uploadedDate: "Jul 30, 2026",
  },
];

export default function DocumentsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Documents"
        description="Files uploaded across all matters."
        action={
          <button
            type="button"
            className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-hover"
          >
            Upload Document
          </button>
        }
      />

      <Card className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Category</th>
              <th className="px-5 py-3 font-medium">Matter</th>
              <th className="px-5 py-3 font-medium">Uploaded</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
            {MOCK_DOCUMENTS.map((doc) => {
              const Icon = FILE_ICONS[doc.type] ?? File;
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
                  <td className="px-5 py-4 text-zinc-600 dark:text-zinc-400">
                    {doc.matter}
                  </td>
                  <td className="px-5 py-4 text-zinc-600 dark:text-zinc-400">
                    {doc.uploadedDate}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
