const COLORS = {
  green:
    "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  amber:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  red: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  gray: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
} as const;

export type BadgeColor = keyof typeof COLORS;

type BadgeProps = {
  color: BadgeColor;
  children: React.ReactNode;
};

export default function Badge({ color, children }: BadgeProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium ${COLORS[color]}`}
    >
      {children}
    </span>
  );
}
