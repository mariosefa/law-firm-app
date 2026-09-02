"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronsUpDown, LogOut, Settings } from "lucide-react";
import { logout } from "@/app/actions";
import type { AccountInfo } from "@/utils/supabase/profile";

export default function AccountMenu({
  account,
}: {
  account: AccountInfo | null;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initial = (account?.email ?? "?").charAt(0).toUpperCase();

  return (
    <div
      ref={containerRef}
      className="relative mt-auto border-t border-zinc-200 px-3 py-3 dark:border-zinc-800"
    >
      {open && (
        <div className="absolute right-3 bottom-full left-3 mb-2 overflow-hidden rounded-md border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
          <button
            type="button"
            disabled
            className="flex w-full cursor-not-allowed items-center gap-2 px-3 py-2 text-left text-sm text-zinc-400 dark:text-zinc-600"
          >
            <Settings size={16} />
            Settings
            <span className="ml-auto text-xs">Soon</span>
          </button>
          <form action={logout}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-700 transition-colors duration-150 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <LogOut size={16} />
              Log out
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors duration-150 hover:bg-zinc-100 dark:hover:bg-zinc-900"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white dark:bg-[#7DD3FC] dark:text-zinc-900">
          {initial}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
            {account?.email ?? "Account"}
          </span>
          <span className="block truncate text-xs text-zinc-500 dark:text-zinc-400">
            {account?.firmName || "—"}
          </span>
        </span>
        <ChevronsUpDown size={16} className="shrink-0 text-zinc-400" />
      </button>
    </div>
  );
}
