import { describe, expect, it } from "vitest";
import { ilikePattern, mergeById } from "./search";

describe("ilikePattern", () => {
  it("wraps ordinary text for a contains-match", () => {
    expect(ilikePattern("acme")).toBe("%acme%");
  });

  it("escapes a literal percent sign", () => {
    expect(ilikePattern("50% Rebate LLC")).toBe("%50\\% Rebate LLC%");
  });

  it("escapes a literal underscore", () => {
    expect(ilikePattern("my_file")).toBe("%my\\_file%");
  });

  it("escapes a literal backslash", () => {
    expect(ilikePattern("a\\b")).toBe("%a\\\\b%");
  });

  it("escapes multiple special characters in one query", () => {
    expect(ilikePattern("100%_off")).toBe("%100\\%\\_off%");
  });

  it("leaves an empty query as an empty wildcard", () => {
    expect(ilikePattern("")).toBe("%%");
  });
});

describe("mergeById", () => {
  it("concatenates lists with no overlap", () => {
    const a = [{ id: "1", name: "Ann" }];
    const b = [{ id: "2", name: "Ben" }];
    expect(mergeById(a, b)).toEqual([
      { id: "1", name: "Ann" },
      { id: "2", name: "Ben" },
    ]);
  });

  it("keeps the first occurrence when the same id appears in a later list", () => {
    const byName = [{ id: "1", name: "Ann", via: "name" }];
    const byEmail = [{ id: "1", name: "Ann", via: "email" }];
    expect(mergeById(byName, byEmail)).toEqual([
      { id: "1", name: "Ann", via: "name" },
    ]);
  });

  it("returns an empty array for no matches", () => {
    expect(mergeById([], [])).toEqual([]);
  });
});
