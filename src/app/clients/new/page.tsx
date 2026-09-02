import CancelLink from "@/components/ui/CancelLink";
import { createClientRecord } from "../actions";

const INPUT_CLASSES =
  "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 transition-colors duration-150 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";

export default function NewClientPage() {
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-serif-brand font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
        New Client
      </h1>
      <form
        action={createClientRecord}
        className="space-y-6 rounded-xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="space-y-2">
          <label
            htmlFor="name"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className={INPUT_CLASSES}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className={INPUT_CLASSES}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="phone"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            className={INPUT_CLASSES}
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-hover"
          >
            Add Client
          </button>
          <CancelLink href="/clients" />
        </div>
      </form>
    </div>
  );
}
