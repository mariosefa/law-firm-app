import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { DEV_FIRM_ID } from "@/lib/constants";
import type { ClientWithMatterStatuses } from "@/utils/supabase/types";
import PageHeader from "@/components/ui/PageHeader";
import ClientsListClient, { type ClientRow } from "./ClientsListClient";

export default async function ClientsPage() {
  const supabase = await createClient();
  const { data: clients, error } = await supabase
    .from("clients")
    .select("id, name, email, phone, matters ( status )")
    .eq("firm_id", DEV_FIRM_ID)
    .order("name")
    .returns<ClientWithMatterStatuses[]>();

  const rows: ClientRow[] = (clients ?? []).map((client) => ({
    id: client.id,
    name: client.name,
    email: client.email,
    phone: client.phone,
    activeMatters: (client.matters ?? []).filter(
      (matter) => matter.status === "Active"
    ).length,
  }));

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Clients"
        description="Everyone your firm currently represents."
        action={
          <Link
            href="/clients/new"
            className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-hover"
          >
            New Client
          </Link>
        }
      />

      {error ? (
        <p className="text-sm text-red-600">
          Failed to load clients: {error.message}
        </p>
      ) : (
        <ClientsListClient clients={rows} />
      )}
    </div>
  );
}
