type ComingSoonPageProps = {
  title: string;
  description: string;
};

export default function ComingSoonPage({
  title,
  description,
}: ComingSoonPageProps) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-4 py-24 text-center sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        {title}
      </h1>
      <p className="mt-3 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
        {description}
      </p>
      <span className="mt-6 inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
        Coming soon
      </span>
    </div>
  );
}
