import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  label: string;
  value: string | number;
  icon: LucideIcon;
};

export default function StatCard({ label, value, icon: Icon }: StatCardProps) {
  return (
    <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          {label}
        </p>
        <div className="rounded-lg bg-brand/10 p-2 text-brand dark:bg-brand/20 dark:text-[#7DD3FC]">
          <Icon size={18} />
        </div>
      </div>
      <p className="mt-3 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
        {value}
      </p>
    </div>
  );
}
