import { describe, expect, it } from "vitest";
import { isValidEmail, isValidPhone } from "./clients";

describe("isValidEmail", () => {
  it("accepts ordinary addresses", () => {
    expect(isValidEmail("jane@example.com")).toBe(true);
    expect(isValidEmail("jane.doe+intake@law-firm.co.uk")).toBe(true);
  });

  it("rejects input with no @ or no domain", () => {
    expect(isValidEmail("not-an-email")).toBe(false);
    expect(isValidEmail("jane@")).toBe(false);
    expect(isValidEmail("@example.com")).toBe(false);
    expect(isValidEmail("jane@example")).toBe(false);
  });

  it("rejects whitespace inside the address", () => {
    expect(isValidEmail("jane doe@example.com")).toBe(false);
  });
});

describe("isValidPhone", () => {
  it("accepts common US formats", () => {
    expect(isValidPhone("(555) 123-4567")).toBe(true);
    expect(isValidPhone("555-123-4567")).toBe(true);
    expect(isValidPhone("5551234567")).toBe(true);
  });

  it("accepts an international number with a leading +", () => {
    expect(isValidPhone("+44 20 7946 0958")).toBe(true);
  });

  it("rejects letters", () => {
    expect(isValidPhone("call-me-maybe")).toBe(false);
  });

  it("rejects too few digits", () => {
    expect(isValidPhone("123-456")).toBe(false);
    expect(isValidPhone("555")).toBe(false);
  });
});
