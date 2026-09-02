import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import type { MatterStatus } from "@/utils/supabase/types";
import StatusBadge from "@/components/StatusBadge";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";

export type MatterRow = {
  id: string;
  title: string;
  client?: string;
  practiceArea: string;
  status: MatterStatus;
};

type MattersRowTableProps = {
  matters: MatterRow[];
  showClientColumn?: boolean;
  getHref?: (matter: MatterRow) => string;
  emptyMessage?: string;
  emptyIcon?: LucideIcon;
  emptyAction?: { label: string; href: string };
};

export default function MattersRowTable({
  matters,
  showClientColumn = true,
  getHref,
  emptyMessage = "No matters found.",
  emptyIcon,
  emptyAction,
}: MattersRowTableProps) {
  if (matters.length === 0) {
    if (emptyIcon) {
      return (
        <Card>
          <EmptyState
            icon={emptyIcon}
            message={emptyMessage}
            action={emptyAction}
          />
        </Card>
      );
    }
    return (
      <Card className="py-10 text-center">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {emptyMessage}
        </p>
      </Card>
    );
  }

  return (
    <Card className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            <th className="px-5 py-3 font-medium">Title</th>
            {showClientColumn && (
              <th className="px-5 py-3 font-medium">Client</th>
            )}
            <th className="px-5 py-3 font-medium">Practice Area</th>
            <th className="px-5 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
          {matters.map((matter) => {
            const href = getHref?.(matter);
            return (
              <tr
                key={matter.id}
                className="transition-colors duration-150 hover:bg-zinc-50 dark:hover:bg-zinc-900"
              >
                <td className="px-5 py-4">
                  {href ? (
                    <Link
                      href={href}
                      className="font-medium text-zinc-900 transition-colors duration-150 hover:text-brand dark:text-zinc-50 dark:hover:text-[#7DD3FC]"
                    >
                      {matter.title}
                    </Link>
                  ) : (
                    <span className="font-medium text-zinc-900 dark:text-zinc-50">
                      {matter.title}
                    </span>
                  )}
                </td>
                {showClientColumn && (
                  <td className="px-5 py-4 text-zinc-600 dark:text-zinc-400">
                    {matter.client ?? "—"}
                  </td>
                )}
                <td className="px-5 py-4 text-zinc-600 dark:text-zinc-400">
                  {matter.practiceArea}
                </td>
                <td className="px-5 py-4">
                  <StatusBadge status={matter.status} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}
