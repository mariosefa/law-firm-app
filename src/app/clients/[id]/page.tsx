import Link from "next/link";
import { notFound } from "next/navigation";
import { MOCK_CLIENTS } from "@/lib/mock-data";
import MattersRowTable from "@/components/MattersRowTable";

export default async function ClientDetailPage({
  params,
}: PageProps<"/clients/[id]">) {
  const { id } = await params;
  const client = MOCK_CLIENTS.find((c) => c.id === id);

  if (!client) notFound();

  const fields = [
    { label: "Email", value: client.email },
    { label: "Phone", value: client.phone },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/clients"
        className="text-sm text-zinc-500 transition-colors duration-150 hover:text-brand dark:text-zinc-400 dark:hover:text-[#7DD3FC]"
      >
        &larr; Back to Clients
      </Link>

      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        {client.name}
      </h1>

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
        matters={client.matters.map((matter) => ({
          id: matter.id,
          title: matter.title,
          practiceArea: matter.practiceArea,
          status: matter.status,
        }))}
        showClientColumn={false}
        emptyMessage="No matters for this client yet."
      />
    </div>
  );
}
