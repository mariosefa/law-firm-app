import { describe, expect, it } from "vitest";
import { assertPresent } from "./validation";

describe("assertPresent", () => {
  it("does not throw when every value is truthy", () => {
    const a: string = "a";
    const b: string = "b";
    const c: number = 1;
    expect(() => assertPresent(a && b && c)).not.toThrow();
  });

  it("throws the default message when the condition is falsy", () => {
    const empty = "";
    expect(() => assertPresent(empty)).toThrow("All fields are required.");
  });

  it("throws a custom message when given one", () => {
    expect(() => assertPresent(undefined, "Title and event date are required.")).toThrow(
      "Title and event date are required."
    );
  });

  it("catches a falsy value anywhere in a chained && condition", () => {
    const a = "present";
    const b = "";
    const c = "also present";
    expect(() => assertPresent(a && b && c)).toThrow("All fields are required.");
  });
});
