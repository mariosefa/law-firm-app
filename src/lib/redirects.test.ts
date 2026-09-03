import { describe, expect, it } from "vitest";
import { safeRedirectPath } from "./redirects";

describe("safeRedirectPath", () => {
  it("passes through an ordinary relative path", () => {
    expect(safeRedirectPath("/matters/123")).toBe("/matters/123");
  });

  it("falls back for a path with no leading slash", () => {
    expect(safeRedirectPath("evil.com")).toBe("/");
    expect(safeRedirectPath("https://evil.com")).toBe("/");
  });

  it("falls back for a protocol-relative path (//host)", () => {
    expect(safeRedirectPath("//evil.com")).toBe("/");
  });

  it("falls back for a backslash-leading path", () => {
    expect(safeRedirectPath("/\\evil.com")).toBe("/");
  });

  it("honors a custom fallback", () => {
    expect(safeRedirectPath("//evil.com", "/login")).toBe("/login");
  });
});
