"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { PRACTICE_AREAS } from "@/lib/matters";

// A plain <input list=...> renders its native dropdown-picker
// indicator inconsistently across browsers and interaction states —
// it isn't reliably suppressible via CSS either. Authoring the
// dropdown affordance ourselves guarantees it always looks the same.
// The field stays free text: typing anything not on the suggested
// list is still accepted.
export default function PracticeAreaField({
  defaultValue = "",
}: {
  defaultValue?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const suggestions = PRACTICE_AREAS.filter((area) =>
    area.toLowerCase().includes(value.trim().toLowerCase())
  );

  return (
    <div className="space-y-2">
      <label
        htmlFor="practice_area"
        className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
      >
        Practice Area
      </label>
      <div ref={containerRef} className="relative">
        <input
          id="practice_area"
          name="practice_area"
          type="text"
          required
          autoComplete="off"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setOpen(true)}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 pr-9 text-sm text-zinc-900 transition-colors duration-150 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle practice area suggestions"
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-zinc-400 transition-colors duration-150 hover:text-zinc-600 dark:hover:text-zinc-300"
        >
          <ChevronDown size={16} />
        </button>
        {open && suggestions.length > 0 && (
          <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md border border-zinc-200 bg-white py-1 text-sm shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
            {suggestions.map((area) => (
              <li key={area}>
                <button
                  type="button"
                  onClick={() => {
                    setValue(area);
                    setOpen(false);
                  }}
                  className="block w-full px-3 py-1.5 text-left text-zinc-700 transition-colors duration-150 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  {area}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
