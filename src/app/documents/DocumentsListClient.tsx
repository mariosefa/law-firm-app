"use client";

import { useMemo, useState } from "react";
import DocumentsTable, { type DocumentRow } from "@/components/DocumentsTable";
import SearchInput from "@/components/ui/SearchInput";
import { deleteDocument } from "./actions";

export default function DocumentsListClient({
  documents,
}: {
  documents: DocumentRow[];
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return documents;
    return documents.filter(
      (doc) =>
        doc.name.toLowerCase().includes(query) ||
        doc.matter.toLowerCase().includes(query)
    );
  }, [documents, search]);

  return (
    <div>
      <div className="mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search documents or matters..."
          className="sm:max-w-xs"
        />
      </div>
      <DocumentsTable
        documents={filtered}
        emptyMessage={
          documents.length === 0
            ? "No documents yet."
            : "No documents match your search."
        }
        onDelete={deleteDocument}
      />
    </div>
  );
}
