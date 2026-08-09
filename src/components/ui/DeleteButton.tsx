"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Check, Trash2, X } from "lucide-react";

type DeleteButtonProps = {
  onDelete: () => Promise<void>;
  label?: string;
  variant?: "button" | "icon";
  // Where to navigate after a successful delete. Omit to stay on the
  // current page and just refresh its server data (e.g. removing a row
  // from a list).
  redirectTo?: string;
};

export default function DeleteButton({
  onDelete,
  label = "Delete",
  variant = "button",
  redirectTo,
}: DeleteButtonProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      try {
        await onDelete();
        if (redirectTo) {
          router.push(redirectTo);
        } else {
          router.refresh();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete.");
        setConfirming(false);
      }
    });
  }

  if (variant === "icon") {
    if (confirming) {
      return (
        <span className="inline-flex items-center gap-1">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isPending}
            aria-label={`Confirm ${label.toLowerCase()}`}
            className="rounded p-1 text-red-600 transition-colors duration-150 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/30"
          >
            <Check size={14} />
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            disabled={isPending}
            aria-label="Cancel"
            className="rounded p-1 text-zinc-500 transition-colors duration-150 hover:bg-zinc-100 disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            <X size={14} />
          </button>
        </span>
      );
    }
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        aria-label={label}
        title={label}
        className="rounded p-1 text-zinc-400 transition-colors duration-150 hover:bg-red-50 hover:text-red-600 dark:text-zinc-500 dark:hover:bg-red-950/30 dark:hover:text-red-400"
      >
        <Trash2 size={14} />
      </button>
    );
  }

  return (
    <span className="inline-flex flex-col items-end gap-1">
      {confirming ? (
        <span className="inline-flex items-center gap-2">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            Are you sure?
          </span>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isPending}
            className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-red-700 disabled:opacity-50"
          >
            {isPending ? "Deleting…" : "Confirm"}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            disabled={isPending}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors duration-150 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
        </span>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="inline-flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition-colors duration-150 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
        >
          <Trash2 size={14} /> {label}
        </button>
      )}
      {error && (
        <span className="text-xs text-red-600 dark:text-red-400">
          {error}
        </span>
      )}
    </span>
  );
}
