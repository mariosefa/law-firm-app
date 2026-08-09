type CardProps = {
  className?: string;
  children: React.ReactNode;
};

export default function Card({ className = "", children }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950 ${className}`}
    >
      {children}
    </div>
  );
}
