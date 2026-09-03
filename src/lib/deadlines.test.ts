import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  toISODate,
  dueDateOnly,
  getDisplayPriority,
  getPriorityColor,
  getDisplayLabel,
  formatDeadlineDate,
} from "./deadlines";

describe("toISODate", () => {
  it("formats a Date as local YYYY-MM-DD", () => {
    expect(toISODate(new Date(2026, 0, 5))).toBe("2026-01-05");
  });

  it("zero-pads month and day", () => {
    expect(toISODate(new Date(2026, 8, 9))).toBe("2026-09-09");
  });
});

describe("dueDateOnly", () => {
  it("keeps a plain date unchanged", () => {
    expect(dueDateOnly("2026-09-09")).toBe("2026-09-09");
  });

  it("drops the time portion of a timestamp", () => {
    expect(dueDateOnly("2026-09-09T14:30:00+00:00")).toBe("2026-09-09");
  });
});

describe("getDisplayPriority", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 15)); // 2026-06-15 local
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("reports a past-due deadline as Overdue regardless of its stored priority", () => {
    expect(getDisplayPriority("2026-06-14", "Low")).toBe("Overdue");
    expect(getDisplayPriority("2026-06-14", "High")).toBe("Overdue");
  });

  it("is not overdue on the due date itself (strict comparison)", () => {
    expect(getDisplayPriority("2026-06-15", "Medium")).toBe("Medium");
  });

  it("returns the stored priority for a future deadline", () => {
    expect(getDisplayPriority("2026-06-16T08:00:00Z", "High")).toBe("High");
  });
});

describe("getPriorityColor", () => {
  it("maps each display priority to a badge colour", () => {
    expect(getPriorityColor("Overdue")).toBe("red");
    expect(getPriorityColor("High")).toBe("amber");
    expect(getPriorityColor("Medium")).toBe("blue");
    expect(getPriorityColor("Low")).toBe("gray");
  });
});

describe("getDisplayLabel", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 15));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("keeps the priority visible on an overdue deadline", () => {
    expect(getDisplayLabel("2026-06-01", "High")).toBe("Overdue · High priority");
  });

  it("is just the priority when not overdue", () => {
    expect(getDisplayLabel("2026-07-01", "Medium")).toBe("Medium");
  });
});

describe("formatDeadlineDate", () => {
  it("formats a plain date without timezone drift", () => {
    expect(formatDeadlineDate("2026-09-09")).toBe("Sep 9, 2026");
  });

  it("formats from a timestamp using only the calendar day", () => {
    expect(formatDeadlineDate("2026-12-25T23:00:00Z")).toBe("Dec 25, 2026");
  });
});
