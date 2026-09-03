import { describe, expect, it } from "vitest";
import { formatEventDate } from "./timelineEvents";

describe("formatEventDate", () => {
  it("formats an ISO date as a US short date", () => {
    expect(formatEventDate("2026-09-09")).toBe("Sep 9, 2026");
  });

  it("anchors to local midnight so the calendar day never shifts", () => {
    // Parsed as local time (no trailing Z), so the day is stable regardless
    // of the machine timezone.
    expect(formatEventDate("2026-01-01")).toBe("Jan 1, 2026");
    expect(formatEventDate("2026-12-31")).toBe("Dec 31, 2026");
  });
});
