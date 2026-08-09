"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Briefcase,
  Clock,
  FileText,
  LayoutDashboard,
  Menu,
  Users,
  X,
} from "lucide-react";
import Logo from "./Logo";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/matters", label: "Matters", icon: Briefcase },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/deadlines", label: "Deadlines", icon: Clock },
  { href: "/documents", label: "Documents", icon: FileText },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-3 border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-black md:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="text-zinc-700 dark:text-zinc-300"
        >
          <Menu size={22} />
        </button>
        <Link href="/" className="flex items-center gap-2">
          <Logo size={24} />
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Casefile
          </span>
        </Link>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-zinc-200 bg-white transition-transform duration-200 dark:border-zinc-800 dark:bg-black md:sticky md:top-0 md:h-screen md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <Link
            href="/"
            className="flex items-center gap-2"
            onClick={() => setOpen(false)}
          >
            <Logo size={28} />
            <span className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
              Casefile
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="text-zinc-500 md:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-col gap-1 px-3">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-brand/10 text-brand dark:bg-brand/20 dark:text-[#7DD3FC]"
                    : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
