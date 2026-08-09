import Link from "next/link";
import { MOCK_DOCUMENTS } from "@/lib/mock-data";
import PageHeader from "@/components/ui/PageHeader";
import DocumentsListClient from "./DocumentsListClient";

export default function DocumentsPage() {
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

      <DocumentsListClient documents={MOCK_DOCUMENTS} />
    </div>
  );
}
