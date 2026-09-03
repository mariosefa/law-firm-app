import { describe, expect, it } from "vitest";
import {
  ALLOWED_FILE_EXTENSIONS,
  MAX_FILE_SIZE_BYTES,
  isAllowedFileExtension,
  formatFileSize,
  getFileType,
} from "./documents";

describe("isAllowedFileExtension", () => {
  it("accepts every extension on the allow-list", () => {
    for (const ext of ALLOWED_FILE_EXTENSIONS) {
      expect(isAllowedFileExtension(`file.${ext}`)).toBe(true);
    }
  });

  it("is case-insensitive", () => {
    expect(isAllowedFileExtension("BRIEF.PDF")).toBe(true);
  });

  it("uses the last extension of a multi-dot name", () => {
    expect(isAllowedFileExtension("2026.06.01-brief.docx")).toBe(true);
  });

  it("rejects a disallowed extension", () => {
    expect(isAllowedFileExtension("archive.zip")).toBe(false);
    expect(isAllowedFileExtension("script.exe")).toBe(false);
  });

  it("rejects a name with no extension", () => {
    expect(isAllowedFileExtension("README")).toBe(false);
    expect(isAllowedFileExtension("")).toBe(false);
  });
});

describe("formatFileSize", () => {
  it("renders megabytes to one decimal place", () => {
    expect(formatFileSize(MAX_FILE_SIZE_BYTES)).toBe("25.0MB");
    expect(formatFileSize(1.5 * 1024 * 1024)).toBe("1.5MB");
    expect(formatFileSize(0)).toBe("0.0MB");
  });
});

describe("getFileType", () => {
  it("classifies known office formats", () => {
    expect(getFileType("motion.pdf")).toBe("pdf");
    expect(getFileType("draft.doc")).toBe("docx");
    expect(getFileType("draft.docx")).toBe("docx");
    expect(getFileType("costs.xls")).toBe("xlsx");
    expect(getFileType("costs.xlsx")).toBe("xlsx");
  });

  it("is case-insensitive", () => {
    expect(getFileType("SCAN.PDF")).toBe("pdf");
  });

  it("falls back to 'other' for images and unknown/absent extensions", () => {
    expect(getFileType("scan.png")).toBe("other");
    expect(getFileType("photo.jpeg")).toBe("other");
    expect(getFileType("noext")).toBe("other");
  });
});
