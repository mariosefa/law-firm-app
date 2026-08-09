import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";

// MOCK DATA — replace with Supabase query once a clients table is wired up
const MOCK_CLIENTS = [
  {
    id: "1",
    name: "Sarah Chen",
    email: "schen@chenllc.com",
    phone: "(415) 555-0182",
    activeMatters: 2,
  },
  {
    id: "2",
    name: "Marcus Johnson",
    email: "marcus.johnson@email.com",
    phone: "(312) 555-0147",
    activeMatters: 1,
  },
  {
    id: "3",
    name: "Elena Martinez",
    email: "elena.martinez@martinezco.com",
    phone: "(646) 555-0193",
    activeMatters: 1,
  },
  {
    id: "4",
    name: "David Williams",
    email: "d.williams@email.com",
    phone: "(206) 555-0121",
    activeMatters: 0,
  },
  {
    id: "5",
    name: "Priya Anderson",
    email: "priya.anderson@email.com",
    phone: "(503) 555-0165",
    activeMatters: 1,
  },
];

export default function ClientsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Clients"
        description="Everyone your firm currently represents."
        action={
          <button
            type="button"
            className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-hover"
          >
            New Client
          </button>
        }
      />

      {/*
        Empty-state design: this branch won't render today since
        MOCK_CLIENTS is always non-empty, but it's the real empty
        state this page will show once it's wired to Supabase and
        a firm genuinely has zero clients.
      */}
      {MOCK_CLIENTS.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No clients yet. Add your first client to get started.
          </p>
        </Card>
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
              {MOCK_CLIENTS.map((client) => (
                <tr
                  key={client.id}
                  className="transition-colors duration-150 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                >
                  <td className="px-5 py-4 font-medium text-zinc-900 dark:text-zinc-50">
                    {client.name}
                  </td>
                  <td className="px-5 py-4 text-zinc-600 dark:text-zinc-400">
                    {client.email}
                  </td>
                  <td className="px-5 py-4 text-zinc-600 dark:text-zinc-400">
                    {client.phone}
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
