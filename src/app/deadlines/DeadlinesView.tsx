"use client";

import { useMemo, useState } from "react";
import { CalendarDays, List } from "lucide-react";
import { DayPicker, type DayButtonProps } from "react-day-picker";
import type { BadgeColor } from "@/components/ui/Badge";
import type { DeadlinePriority } from "@/utils/supabase/types";
import {
  dueDateOnly,
  formatDeadlineDate,
  getDisplayPriority,
  getPriorityColor,
  toISODate,
  type DeadlineDisplayPriority,
} from "@/lib/deadlines";
import Card from "@/components/ui/Card";
import SearchInput from "@/components/ui/SearchInput";
import DeadlineRow from "@/components/DeadlineRow";
import { deleteDeadline } from "./actions";

export type DeadlineListItem = {
  id: string;
  title: string;
  matter: string;
  dueAt: string;
  priority: DeadlinePriority;
};

type DeadlineWithDisplay = DeadlineListItem & {
  display: DeadlineDisplayPriority;
};

const PRIORITY_OPTIONS: (DeadlineDisplayPriority | "All")[] = [
  "All",
  "Overdue",
  "High",
  "Medium",
  "Low",
];

const DOT_ORDER: BadgeColor[] = ["red", "amber", "blue", "gray"];

const DOT_COLOR_CLASSES: Record<BadgeColor, string> = {
  red: "bg-red-500",
  amber: "bg-amber-500",
  blue: "bg-blue-500",
  gray: "bg-zinc-400",
  green: "bg-green-500",
};

function CustomDayButton({
  day,
  modifiers,
  children,
  className,
  ...props
}: DayButtonProps) {
  const activeColors = DOT_ORDER.filter((color) => modifiers[`dot-${color}`]);
  const isSelected = Boolean(modifiers.isSelected);
  return (
    <button
      {...props}
      className={className}
      style={
        isSelected ? { backgroundColor: "#0C447C", color: "#fff" } : undefined
      }
    >
      <span>{day.date.getDate()}</span>
      {activeColors.length > 0 && (
        <span className="mt-0.5 flex gap-0.5">
          {activeColors.map((color) => (
            <span
              key={color}
              className={`h-1 w-1 rounded-full ${DOT_COLOR_CLASSES[color]}`}
            />
          ))}
        </span>
      )}
    </button>
  );
}

const CALENDAR_CLASS_NAMES = {
  root: "text-sm",
  months: "flex flex-col",
  month: "space-y-3",
  month_caption:
    "flex items-center justify-center h-8 font-medium text-zinc-900 dark:text-zinc-50",
  nav: "flex items-center justify-between",
  button_previous:
    "p-1 rounded-md text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:text-zinc-400",
  button_next:
    "p-1 rounded-md text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:text-zinc-400",
  month_grid: "w-full border-collapse mt-2",
  weekdays: "flex",
  weekday:
    "flex-1 text-center text-xs font-medium text-zinc-400 dark:text-zinc-500 pb-2",
  week: "flex w-full",
  day: "flex-1 text-center p-0.5",
  day_button:
    "w-9 h-9 mx-auto flex flex-col items-center justify-center rounded-md text-sm text-zinc-700 transition-colors duration-150 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800",
  outside: "text-zinc-300 dark:text-zinc-700",
  disabled: "text-zinc-300 dark:text-zinc-700 pointer-events-none",
};

export default function DeadlinesView({
  deadlines,
}: {
  deadlines: DeadlineListItem[];
}) {
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState<DeadlineDisplayPriority | "All">(
    "All"
  );
  const [view, setView] = useState<"list" | "calendar">("list");
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const withDisplay: DeadlineWithDisplay[] = useMemo(
    () =>
      deadlines.map((deadline) => ({
        ...deadline,
        display: getDisplayPriority(deadline.dueAt, deadline.priority),
      })),
    [deadlines]
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return withDisplay.filter((deadline) => {
      const matchesQuery =
        !query ||
        deadline.title.toLowerCase().includes(query) ||
        deadline.matter.toLowerCase().includes(query);
      const matchesPriority =
        priority === "All" || deadline.display === priority;
      return matchesQuery && matchesPriority;
    });
  }, [withDisplay, search, priority]);

  const deadlinesByDate = useMemo(() => {
    const map = new Map<string, DeadlineWithDisplay[]>();
    for (const deadline of filtered) {
      const key = dueDateOnly(deadline.dueAt);
      const list = map.get(key) ?? [];
      list.push(deadline);
      map.set(key, list);
    }
    return map;
  }, [filtered]);

  const dayModifiers = useMemo(() => {
    const modifiers: Record<string, Date[]> = {};
    for (const [iso, dayDeadlines] of deadlinesByDate) {
      for (const deadline of dayDeadlines) {
        const key = `dot-${getPriorityColor(deadline.display)}`;
        modifiers[key] = modifiers[key] ?? [];
        modifiers[key].push(new Date(`${iso}T00:00:00`));
      }
    }
    if (selectedDay) {
      modifiers.isSelected = [new Date(`${selectedDay}T00:00:00`)];
    }
    return modifiers;
  }, [deadlinesByDate, selectedDay]);

  const selectedDayDeadlines = selectedDay
    ? (deadlinesByDate.get(selectedDay) ?? [])
    : [];

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search deadlines or matters..."
            className="sm:max-w-xs"
          />
          <select
            value={priority}
            onChange={(e) =>
              setPriority(e.target.value as DeadlineDisplayPriority | "All")
            }
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 transition-colors duration-150 focus:border-brand focus:ring-1 focus:ring-brand focus:outline-none sm:w-44 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          >
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option === "All" ? "All priorities" : option}
              </option>
            ))}
          </select>
        </div>

        <div className="inline-flex rounded-md border border-zinc-300 p-0.5 dark:border-zinc-700">
          <button
            type="button"
            onClick={() => setView("list")}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium transition-colors duration-150 ${
              view === "list"
                ? "bg-brand text-white"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
          >
            <List size={14} /> List
          </button>
          <button
            type="button"
            onClick={() => setView("calendar")}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium transition-colors duration-150 ${
              view === "calendar"
                ? "bg-brand text-white"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
          >
            <CalendarDays size={14} /> Calendar
          </button>
        </div>
      </div>

      {view === "list" ? (
        filtered.length === 0 ? (
          <Card className="py-10 text-center">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {deadlines.length === 0
                ? "No deadlines yet."
                : "No deadlines match your search."}
            </p>
          </Card>
        ) : (
          <Card>
            <div className="divide-y divide-zinc-100 dark:divide-zinc-900">
              {filtered.map((deadline) => (
                <DeadlineRow
                  key={deadline.id}
                  deadline={deadline}
                  editHref={`/deadlines/${deadline.id}/edit`}
                  onDelete={() => deleteDeadline(deadline.id)}
                />
              ))}
            </div>
          </Card>
        )
      ) : (
        <div className="space-y-4">
          <Card className="flex justify-center p-4">
            <DayPicker
              defaultMonth={new Date()}
              modifiers={dayModifiers}
              modifiersClassNames={{
                today: "font-semibold text-brand dark:text-[#7DD3FC]",
              }}
              onDayClick={(date) => setSelectedDay(toISODate(date))}
              classNames={CALENDAR_CLASS_NAMES}
              components={{ DayButton: CustomDayButton }}
            />
          </Card>
          {selectedDay && (
            <Card>
              <div className="border-b border-zinc-100 px-5 py-3 text-sm font-medium text-zinc-900 dark:border-zinc-900 dark:text-zinc-50">
                {formatDeadlineDate(selectedDay)}
              </div>
              {selectedDayDeadlines.length === 0 ? (
                <p className="px-5 py-6 text-sm text-zinc-500 dark:text-zinc-400">
                  No deadlines on this day.
                </p>
              ) : (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-900">
                  {selectedDayDeadlines.map((deadline) => (
                    <DeadlineRow
                      key={deadline.id}
                      deadline={deadline}
                      editHref={`/deadlines/${deadline.id}/edit`}
                      onDelete={() => deleteDeadline(deadline.id)}
                    />
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
