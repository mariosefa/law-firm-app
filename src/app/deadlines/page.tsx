import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Badge, { type BadgeColor } from "@/components/ui/Badge";

// MOCK DATA — replace with Supabase query once deadlines are tracked.
// Already sorted soonest-first (matches how this page should always render).
const MOCK_DEADLINES: {
  id: string;
  title: string;
  matter: string;
  dueDate: string;
  priority: string;
  color: BadgeColor;
}[] = [
  {
    id: "1",
    title: "File motion for summary judgment",
    matter: "Smith v. Jones",
    dueDate: "Aug 5, 2026",
    priority: "Overdue",
    color: "red",
  },
  {
    id: "2",
    title: "Respond to discovery request",
    matter: "Chen LLC Contract Review",
    dueDate: "Aug 11, 2026",
    priority: "High",
    color: "amber",
  },
  {
    id: "3",
    title: "Submit trademark renewal",
    matter: "Martinez Trademark Filing",
    dueDate: "Aug 14, 2026",
    priority: "High",
    color: "amber",
  },
  {
    id: "4",
    title: "File estate tax return",
    matter: "Johnson Estate Planning",
    dueDate: "Aug 18, 2026",
    priority: "Medium",
    color: "blue",
  },
  {
    id: "5",
    title: "Deposition prep meeting",
    matter: "Williams Personal Injury Claim",
    dueDate: "Aug 22, 2026",
    priority: "Medium",
    color: "blue",
  },
  {
    id: "6",
    title: "Client status call",
    matter: "Anderson Divorce Proceedings",
    dueDate: "Aug 29, 2026",
    priority: "Low",
    color: "gray",
  },
];

export default function DeadlinesPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Deadlines"
        description="Everything due, soonest first."
        action={
          <button
            type="button"
            className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-hover"
          >
            New Deadline
          </button>
        }
      />

      <Card>
        <ul className="divide-y divide-zinc-100 dark:divide-zinc-900">
          {MOCK_DEADLINES.map((deadline) => (
            <li
              key={deadline.id}
              className="flex items-center justify-between gap-4 px-5 py-4 transition-colors duration-150 hover:bg-zinc-50 dark:hover:bg-zinc-900"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {deadline.title}
                </p>
                <p className="truncate text-sm text-zinc-500 dark:text-zinc-400">
                  {deadline.matter} · Due {deadline.dueDate}
                </p>
              </div>
              <Badge color={deadline.color}>{deadline.priority}</Badge>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
