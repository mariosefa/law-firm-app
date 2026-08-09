"use client";

import { useActionState } from "react";
import { signup, type SignupFormState } from "./actions";

const INPUT_CLASSES =
  "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 transition-colors duration-150 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";

const initialState: SignupFormState = { error: null, info: null };

export default function SignupForm() {
  const [state, formAction, pending] = useActionState(signup, initialState);

  if (state.info) {
    return (
      <div className="rounded-xl border border-zinc-200/80 bg-white p-6 text-sm text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
        {state.info}
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="space-y-6 rounded-xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="space-y-2">
        <label
          htmlFor="firm_name"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Firm Name
        </label>
        <input
          id="firm_name"
          name="firm_name"
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
          autoComplete="email"
          required
          className={INPUT_CLASSES}
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className={INPUT_CLASSES}
        />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          At least 8 characters.
        </p>
      </div>

      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-hover disabled:opacity-50"
      >
        {pending ? "Creating your firm…" : "Create Firm & Sign Up"}
      </button>
    </form>
  );
}
