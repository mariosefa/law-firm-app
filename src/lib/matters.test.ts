import { describe, expect, it } from "vitest";
import { PRACTICE_AREAS } from "./matters";

describe("PRACTICE_AREAS", () => {
  it("is a non-empty list of unique, trimmed strings", () => {
    expect(PRACTICE_AREAS.length).toBeGreaterThan(0);
    expect(new Set(PRACTICE_AREAS).size).toBe(PRACTICE_AREAS.length);
    for (const area of PRACTICE_AREAS) {
      expect(area).toBe(area.trim());
      expect(area.length).toBeGreaterThan(0);
    }
  });

  it("includes the common practice areas the UI seeds", () => {
    expect(PRACTICE_AREAS).toContain("Litigation");
    expect(PRACTICE_AREAS).toContain("Family Law");
  });
});
