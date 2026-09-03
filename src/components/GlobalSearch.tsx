"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, FileText, Search, Users } from "lucide-react";
import { globalSearch, type SearchResult, type SearchResults } from "@/app/actions";
import { useSidebarClose } from "./SidebarShell";

const EMPTY_RESULTS: SearchResults = { clients: [], matters: [], documents: [] };

const GROUPS: {
  key: keyof SearchResults;
  label: string;
  icon: typeof Briefcase;
}[] = [
  { key: "matters", label: "Matters", icon: Briefcase },
  { key: "clients", label: "Clients", icon: Users },
  { key: "documents", label: "Documents", icon: FileText },
];

// Debounce delay before firing the Server Action while the user is still
// typing -- short enough to feel instant, long enough that fast typing
// doesn't fire a request per keystroke.
const DEBOUNCE_MS = 200;

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>(EMPTY_RESULTS);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const closeSidebar = useSidebarClose();
  const router = useRouter();

  // Global Cmd/Ctrl+K opens the palette from anywhere; Escape closes it.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
        return;
      }
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Debounced search, guarded against out-of-order responses: if the query
  // changes again before a request comes back, that request's result is
  // discarded instead of clobbering what's now on screen.
  useEffect(() => {
    if (!open) return;

    const trimmed = query.trim();
    // Below 2 characters we simply don't search -- render hides the
    // results/loading UI via `hasQuery` regardless of what's still sitting
    // in state, so there's nothing to reset here (no setState-in-effect).
    // `loading` itself is set from the input's onChange handler, not here --
    // an effect body isn't supposed to call setState synchronously
    // (react-hooks/set-state-in-effect), only from inside an async callback
    // like the .then() below.
    if (trimmed.length < 2) return;

    let cancelled = false;
    const timeout = setTimeout(() => {
      globalSearch(trimmed).then((found) => {
        if (!cancelled) {
          setResults(found);
          setLoading(false);
        }
      });
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [query, open]);

  function close() {
    setOpen(false);
    setQuery("");
    setResults(EMPTY_RESULTS);
  }

  function select(result: SearchResult) {
    close();
    closeSidebar();
    router.push(result.href);
  }

  const hasQuery = query.trim().length >= 2;
  const hasResults =
    results.matters.length > 0 ||
    results.clients.length > 0 ||
    results.documents.length > 0;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium text-zinc-500 transition-colors duration-150 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-300"
      >
        <Search size={18} />
        <span className="flex-1">Search</span>
        <kbd className="hidden rounded border border-zinc-300 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400 md:inline dark:border-zinc-700 dark:text-zinc-500">
          ⌘K
        </kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[15vh]">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={close}
            aria-hidden="true"
          />

          <div className="relative w-full max-w-lg overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
              <Search size={18} className="shrink-0 text-zinc-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(event) => {
                  const value = event.target.value;
                  setQuery(value);
                  if (value.trim().length >= 2) setLoading(true);
                }}
                placeholder="Search matters, clients, documents…"
                className="w-full bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-zinc-50"
              />
            </div>

            <div className="max-h-80 overflow-y-auto py-2">
              {!hasQuery && (
                <p className="px-4 py-6 text-center text-sm text-zinc-400">
                  Type at least 2 characters to search.
                </p>
              )}

              {hasQuery && loading && (
                <p className="px-4 py-6 text-center text-sm text-zinc-400">
                  Searching…
                </p>
              )}

              {hasQuery && !loading && !hasResults && (
                <p className="px-4 py-6 text-center text-sm text-zinc-400">
                  No matches for &ldquo;{query.trim()}&rdquo;.
                </p>
              )}

              {hasQuery &&
                !loading &&
                GROUPS.map(({ key, label, icon: Icon }) => {
                  const items = results[key];
                  if (items.length === 0) return null;
                  return (
                    <div key={key} className="px-2 py-1">
                      <p className="px-2 py-1 text-xs font-semibold tracking-wide text-zinc-400 uppercase">
                        {label}
                      </p>
                      {items.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => select(item)}
                          className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm transition-colors duration-150 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                        >
                          <Icon size={16} className="shrink-0 text-zinc-400" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-medium text-zinc-900 dark:text-zinc-50">
                              {item.label}
                            </span>
                            {item.sublabel && (
                              <span className="block truncate text-xs text-zinc-500 dark:text-zinc-400">
                                {item.sublabel}
                              </span>
                            )}
                          </span>
                        </button>
                      ))}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
