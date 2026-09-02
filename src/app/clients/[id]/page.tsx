import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import type { ClientRecord, Matter } from "@/utils/supabase/types";
import MattersRowTable from "@/components/MattersRowTable";
import DeleteButton from "@/components/ui/DeleteButton";
import EditLink from "@/components/ui/EditLink";
import { deleteClientRecord } from "../actions";

export default async function ClientDetailPage({
  params,
}: PageProps<"/clients/[id]">) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: client, error }, { data: matters }] = await Promise.all([
    supabase
      .from("clients")
      .select("id, name, email, phone")
      .eq("id", id)
      .maybeSingle<Pick<ClientRecord, "id" | "name" | "email" | "phone">>(),
    supabase
      .from("matters")
      .select("id, title, practice_area, status")
      .eq("client_id", id)
      .order("created_at", { ascending: false })
      .returns<Pick<Matter, "id" | "title" | "practice_area" | "status">[]>(),
  ]);

  if (error || !client) notFound();

  const fields = [
    { label: "Email", value: client.email ?? "—" },
    { label: "Phone", value: client.phone ?? "—" },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/clients"
        className="text-sm text-zinc-500 transition-colors duration-150 hover:text-brand dark:text-zinc-400 dark:hover:text-[#7DD3FC]"
      >
        &larr; Back to Clients
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-serif-brand font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {client.name}
        </h1>
        <div className="flex items-center gap-3">
          <EditLink href={`/clients/${client.id}/edit`} label="Edit Client" />
          <DeleteButton
            label="Delete Client"
            onDelete={deleteClientRecord.bind(null, client.id)}
            redirectTo="/clients"
          />
        </div>
      </div>

      <dl className="mt-8 divide-y divide-zinc-100 rounded-xl border border-zinc-200/80 bg-white shadow-sm dark:divide-zinc-900 dark:border-zinc-800 dark:bg-zinc-950">
        {fields.map((field) => (
          <div
            key={field.label}
            className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <dt className="text-sm text-zinc-500 dark:text-zinc-400">
              {field.label}
            </dt>
            <dd className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              {field.value}
            </dd>
          </div>
        ))}
      </dl>

      <h2 className="mt-10 mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Matters
      </h2>
      <MattersRowTable
        matters={(matters ?? []).map((matter) => ({
          id: matter.id,
          title: matter.title,
          practiceArea: matter.practice_area,
          status: matter.status,
        }))}
        showClientColumn={false}
        emptyMessage="No matters for this client yet."
      />
    </div>
  );
}
