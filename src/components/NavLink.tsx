"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebarClose } from "./SidebarShell";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function NavLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  const pathname = usePathname();
  const close = useSidebarClose();
  const active = isActive(pathname, href);

  return (
    <Link
      href={href}
      onClick={close}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 ${
        active
          ? "bg-brand/10 text-brand dark:bg-brand/20 dark:text-[#7DD3FC]"
          : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}
