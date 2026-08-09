import type { MatterStatus } from "@/utils/supabase/types";
import Badge, { type BadgeColor } from "@/components/ui/Badge";

const COLORS: Record<MatterStatus, BadgeColor> = {
  Active: "green",
  "On Hold": "gray",
  Closed: "gray",
};

export default function StatusBadge({ status }: { status: MatterStatus }) {
  return <Badge color={COLORS[status]}>{status}</Badge>;
}
