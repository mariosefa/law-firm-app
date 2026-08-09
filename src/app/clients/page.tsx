import Link from "next/link";
import { MOCK_CLIENTS } from "@/lib/mock-data";
import PageHeader from "@/components/ui/PageHeader";
import ClientsListClient from "./ClientsListClient";

export default function ClientsPage() {
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

      <ClientsListClient clients={MOCK_CLIENTS} />
    </div>
  );
}
