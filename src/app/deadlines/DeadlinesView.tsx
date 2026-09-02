"use client";

import { useMemo, useState } from "react";
import { CalendarClock, CalendarDays, List } from "lucide-react";
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
import EmptyState from "@/components/ui/EmptyState";
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
  const isToday = Boolean(modifiers.today);
  return (
    <button
      {...props}
      className={`${className ?? ""} ${
        isSelected
          ? "bg-brand/10 ring-1 ring-inset ring-brand dark:bg-[#7DD3FC]/15 dark:ring-[#7DD3FC]"
          : ""
      }`}
    >
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full text-sm ${
          isToday
            ? "bg-brand font-semibold text-white dark:bg-[#7DD3FC] dark:text-zinc-900"
            : "text-zinc-700 dark:text-zinc-200"
        }`}
      >
        {day.date.getDate()}
      </span>
      <span className="flex h-2 items-center gap-1">
        {activeColors.map((color) => (
          <span
            key={color}
            className={`h-1.5 w-1.5 rounded-full ${DOT_COLOR_CLASSES[color]}`}
          />
        ))}
      </span>
    </button>
  );
}

const CALENDAR_CLASS_NAMES = {
  root: "relative text-sm w-full",
  months: "flex flex-col w-full",
  month: "w-full",
  month_caption:
    "flex h-10 items-center pl-1 text-lg font-serif-brand font-semibold tracking-tight text-zinc-900 dark:text-zinc-50",
  nav: "absolute right-0 top-0 flex h-10 items-center gap-1.5",
  button_previous:
    "p-2 rounded-md border border-zinc-200 text-zinc-500 transition-colors duration-150 hover:border-brand hover:bg-brand/5 hover:text-brand dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-[#7DD3FC] dark:hover:bg-[#7DD3FC]/10 dark:hover:text-[#7DD3FC]",
  button_next:
    "p-2 rounded-md border border-zinc-200 text-zinc-500 transition-colors duration-150 hover:border-brand hover:bg-brand/5 hover:text-brand dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-[#7DD3FC] dark:hover:bg-[#7DD3FC]/10 dark:hover:text-[#7DD3FC]",
  month_grid: "w-full border-collapse mt-3",
  weekdays: "flex border-b border-zinc-100 dark:border-zinc-900",
  weekday:
    "flex-1 pb-2 text-center text-xs font-medium tracking-wide text-zinc-400 uppercase dark:text-zinc-500",
  week: "flex w-full mt-1",
  day: "flex-1 p-0.5",
  day_button:
    "flex h-16 w-full flex-col items-center justify-start gap-1 rounded-lg pt-2 text-sm text-zinc-700 transition-colors duration-150 hover:bg-zinc-100 sm:h-20 sm:pt-3 dark:text-zinc-300 dark:hover:bg-zinc-800",
  outside: "opacity-40",
  disabled: "opacity-40 pointer-events-none",
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
  const [selectedDay, setSelectedDay] = useState<string | null>(() =>
    toISODate(new Date())
  );
  const [month, setMonth] = useState<Date>(new Date());

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

        <div className="flex items-center gap-2">
          {view === "calendar" && (
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                setMonth(now);
                setSelectedDay(toISODate(now));
              }}
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-600 transition-colors duration-150 hover:border-brand hover:text-brand dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-[#7DD3FC] dark:hover:text-[#7DD3FC]"
            >
              Today
            </button>
          )}
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
      </div>

      {view === "list" ? (
        filtered.length === 0 ? (
          deadlines.length === 0 ? (
            <Card>
              <EmptyState
                icon={CalendarClock}
                message="No deadlines yet. Add one to start tracking what's due."
                action={{ label: "New Deadline", href: "/deadlines/new" }}
              />
            </Card>
          ) : (
            <Card className="py-10 text-center">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No deadlines match your search.
              </p>
            </Card>
          )
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
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <Card className="p-4 sm:p-6">
            <DayPicker
              month={month}
              onMonthChange={setMonth}
              modifiers={dayModifiers}
              onDayClick={(date) => setSelectedDay(toISODate(date))}
              classNames={CALENDAR_CLASS_NAMES}
              components={{ DayButton: CustomDayButton }}
            />
          </Card>

          <Card className="lg:sticky lg:top-6 lg:self-start">
            <div className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-900">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                {selectedDay ? formatDeadlineDate(selectedDay) : "Select a day"}
              </p>
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                {selectedDay
                  ? `${selectedDayDeadlines.length} ${
                      selectedDayDeadlines.length === 1
                        ? "deadline"
                        : "deadlines"
                    }`
                  : "Pick a date to see what's due."}
              </p>
            </div>
            {selectedDay && selectedDayDeadlines.length > 0 ? (
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
            ) : (
              <p className="px-5 py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
                {selectedDay
                  ? "No deadlines on this day."
                  : "Nothing selected yet."}
              </p>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
