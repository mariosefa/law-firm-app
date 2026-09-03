import {
  Briefcase,
  Clock,
  FileText,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";
import type { AccountInfo } from "@/utils/supabase/profile";
import GlobalSearch from "./GlobalSearch";
import NavLink from "./NavLink";
import SidebarShell from "./SidebarShell";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/matters", label: "Matters", icon: Briefcase },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/deadlines", label: "Deadlines", icon: Clock },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
];

// The nav list is rendered here, in a Server Component, so the set of items
// is fixed by the server payload on every request. NavLink is a Client
// Component only for pathname-based active state — a stale client bundle can
// mis-highlight, but it can never drop or add an item.
export default function Sidebar({ account }: { account: AccountInfo | null }) {
  return (
    <SidebarShell account={account}>
      <nav className="flex flex-col gap-1 px-3">
        <GlobalSearch />
        <div className="my-1 border-t border-zinc-200 dark:border-zinc-800" />
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={<Icon size={18} />}
            />
          );
        })}
      </nav>
    </SidebarShell>
  );
}
