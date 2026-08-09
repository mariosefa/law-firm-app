import type { BadgeColor } from "@/components/ui/Badge";
import type { DeadlinePriority } from "@/utils/supabase/types";

export type DeadlineDisplayPriority = DeadlinePriority | "Overdue";

export function toISODate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// due_at may come back as a plain date or a full timestamp — only the
// calendar day matters for display and grouping.
export function dueDateOnly(dueAt: string) {
  return dueAt.slice(0, 10);
}

// A deadline whose due date has passed displays as "Overdue" regardless
// of its stored priority — priority can't be set to "Overdue" directly.
export function getDisplayPriority(
  dueAt: string,
  priority: DeadlinePriority
): DeadlineDisplayPriority {
  return dueDateOnly(dueAt) < toISODate(new Date()) ? "Overdue" : priority;
}

const PRIORITY_COLORS: Record<DeadlineDisplayPriority, BadgeColor> = {
  Overdue: "red",
  High: "amber",
  Medium: "blue",
  Low: "gray",
};

export function getPriorityColor(display: DeadlineDisplayPriority): BadgeColor {
  return PRIORITY_COLORS[display];
}

export function formatDeadlineDate(dueAt: string) {
  return new Date(`${dueDateOnly(dueAt)}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
