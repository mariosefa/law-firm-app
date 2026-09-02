"use client";

import { useActionState, useEffect, useRef } from "react";
import { inviteTeammate, type InviteFormState } from "./actions";

const initialState: InviteFormState = { error: null, info: null };

export default function InviteForm() {
  const [state, formAction, pending] = useActionState(
    inviteTeammate,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.info) formRef.current?.reset();
  }, [state.info]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-3 sm:flex-row sm:items-start"
    >
      <div className="flex-1">
        <label htmlFor="email" className="sr-only">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="teammate@example.com"
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 transition-colors duration-150 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />
        {state.error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {state.error}
          </p>
        )}
        {state.info && (
          <p className="mt-2 text-sm text-green-700 dark:text-green-400">
            {state.info}
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-hover disabled:opacity-50"
      >
        {pending ? "Sending…" : "Send Invite"}
      </button>
    </form>
  );
}
