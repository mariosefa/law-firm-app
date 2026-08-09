"use client";

import { useState } from "react";
import Link from "next/link";
import { CircleCheckBig } from "lucide-react";
import { MOCK_MATTER_NAMES } from "@/lib/mock-data";

const INPUT_CLASSES =
  "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 transition-colors duration-150 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";

export default function NewDeadlinePage() {
  const [submitted, setSubmitted] = useState(false);
  const [title, setTitle] = useState("");

  if (submitted) {
    return (
      <div className="mx-auto w-full max-w-xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-zinc-200/80 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <CircleCheckBig
            size={36}
            className="mx-auto text-green-600 dark:text-green-400"
          />
          <h1 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            {title || "Deadline"} added
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            This is a mock submission — nothing was saved. Deadline tracking
            isn&apos;t wired to Supabase yet.
          </p>
          <Link
            href="/deadlines"
            className="mt-6 inline-flex items-center justify-center rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-hover"
          >
            Back to Deadlines
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
        New Deadline
      </h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
        }}
        className="space-y-6 rounded-xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="space-y-2">
          <label
            htmlFor="title"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Title
          </label>
          <input
            id="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={INPUT_CLASSES}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="matter"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Matter
          </label>
          <select
            id="matter"
            required
            defaultValue=""
            className={INPUT_CLASSES}
          >
            <option value="" disabled>
              Select a matter
            </option>
            {MOCK_MATTER_NAMES.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="dueDate"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Due Date
          </label>
          <input
            id="dueDate"
            type="date"
            required
            className={INPUT_CLASSES}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="priority"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Priority
          </label>
          <select
            id="priority"
            defaultValue="Medium"
            className={INPUT_CLASSES}
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-hover"
        >
          Add Deadline
        </button>
      </form>
    </div>
  );
}
