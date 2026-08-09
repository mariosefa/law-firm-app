import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import DeadlinesView from "./DeadlinesView";

export default function DeadlinesPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Deadlines"
        description="Everything due, soonest first."
        action={
          <Link
            href="/deadlines/new"
            className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-hover"
          >
            New Deadline
          </Link>
        }
      />

      <DeadlinesView />
    </div>
  );
}
