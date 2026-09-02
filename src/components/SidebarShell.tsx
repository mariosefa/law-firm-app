"use client";

import { createContext, useContext, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import type { AccountInfo } from "@/utils/supabase/profile";
import AccountMenu from "./AccountMenu";
import Logo from "./Logo";

const AUTH_PATHS = ["/login", "/signup", "/welcome", "/auth/switch-account"];

// Lets nav links close the mobile drawer without the shell having to clone
// children or thread callbacks through the server component that renders them.
const SidebarCloseContext = createContext<() => void>(() => {});

export function useSidebarClose() {
  return useContext(SidebarCloseContext);
}

export default function SidebarShell({
  account,
  children,
}: {
  account: AccountInfo | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (AUTH_PATHS.includes(pathname)) return null;

  const close = () => setOpen(false);

  return (
    <SidebarCloseContext.Provider value={close}>
      <div className="flex items-center gap-3 border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-black md:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="text-zinc-700 transition-colors duration-150 hover:text-brand dark:text-zinc-300 dark:hover:text-[#7DD3FC]"
        >
          <Menu size={22} />
        </button>
        <Link href="/" className="flex items-center">
          <Logo size={20} />
        </Link>
      </div>

      <div
        className={`fixed inset-0 z-30 bg-black/40 transition-opacity duration-200 md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={close}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-zinc-200 bg-white transition-transform duration-200 dark:border-zinc-800 dark:bg-black md:sticky md:top-0 md:h-screen md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <Link href="/" className="flex items-center" onClick={close}>
            <Logo size={22} />
          </Link>
          <button
            type="button"
            onClick={close}
            aria-label="Close menu"
            className="text-zinc-500 transition-colors duration-150 hover:text-brand md:hidden dark:hover:text-[#7DD3FC]"
          >
            <X size={20} />
          </button>
        </div>

        {children}

        <AccountMenu account={account} />
      </aside>
    </SidebarCloseContext.Provider>
  );
}
