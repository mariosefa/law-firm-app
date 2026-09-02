"use client";

import { useMemo, useState } from "react";
import { Briefcase } from "lucide-react";
import type { MatterStatus } from "@/utils/supabase/types";
import MattersRowTable, { type MatterRow } from "@/components/MattersRowTable";
import SearchInput from "@/components/ui/SearchInput";

const STATUS_OPTIONS: (MatterStatus | "All")[] = [
  "All",
  "Active",
  "On Hold",
  "Closed",
];

export default function MattersListClient({
  matters,
}: {
  matters: MatterRow[];
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<MatterStatus | "All">("All");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return matters.filter((matter) => {
      const matchesQuery =
        !query ||
        matter.title.toLowerCase().includes(query) ||
        (matter.client ?? "").toLowerCase().includes(query);
      const matchesStatus = status === "All" || matter.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [matters, search, status]);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search matters or clients..."
          className="sm:max-w-xs"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as MatterStatus | "All")}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 transition-colors duration-150 focus:border-brand focus:ring-1 focus:ring-brand focus:outline-none sm:w-44 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option === "All" ? "All statuses" : option}
            </option>
          ))}
        </select>
      </div>

      <MattersRowTable
        matters={filtered}
        getHref={(matter) => `/matters/${matter.id}`}
        emptyMessage={
          matters.length === 0
            ? "No matters yet. Create your first matter to get started."
            : "No matters match your search."
        }
        emptyIcon={matters.length === 0 ? Briefcase : undefined}
        emptyAction={
          matters.length === 0
            ? { label: "New Matter", href: "/matters/new" }
            : undefined
        }
      />
    </div>
  );
}
