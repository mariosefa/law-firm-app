"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Users } from "lucide-react";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import SearchInput from "@/components/ui/SearchInput";

export type ClientRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  activeMatters: number;
};

export default function ClientsListClient({
  clients,
}: {
  clients: ClientRow[];
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return clients;
    return clients.filter((client) =>
      client.name.toLowerCase().includes(query)
    );
  }, [clients, search]);

  return (
    <div>
      <div className="mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search clients..."
          className="sm:max-w-xs"
        />
      </div>

      {filtered.length === 0 ? (
        clients.length === 0 ? (
          <Card>
            <EmptyState
              icon={Users}
              message="No clients yet. Add your first client to get started."
              action={{ label: "New Client", href: "/clients/new" }}
            />
          </Card>
        ) : (
          <Card className="py-10 text-center">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No clients match your search.
            </p>
          </Card>
        )
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Phone</th>
                <th className="px-5 py-3 font-medium">Active Matters</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
              {filtered.map((client) => (
                <tr
                  key={client.id}
                  className="transition-colors duration-150 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                >
                  <td className="px-5 py-4">
                    <Link
                      href={`/clients/${client.id}`}
                      className="font-medium text-zinc-900 transition-colors duration-150 hover:text-brand dark:text-zinc-50 dark:hover:text-[#7DD3FC]"
                    >
                      {client.name}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-zinc-600 dark:text-zinc-400">
                    {client.email ?? "—"}
                  </td>
                  <td className="px-5 py-4 text-zinc-600 dark:text-zinc-400">
                    {client.phone ?? "—"}
                  </td>
                  <td className="px-5 py-4 text-zinc-600 dark:text-zinc-400">
                    {client.activeMatters}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
