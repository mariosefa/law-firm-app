export type DocumentFileType = "pdf" | "docx" | "xlsx" | "other";

export const DOCUMENT_CATEGORIES = [
  "Pleading",
  "Discovery",
  "Filing",
  "Billing",
  "Contract",
  "Intake",
  "Other",
];

// Common document formats plus image types for scanned documents.
export const ALLOWED_FILE_EXTENSIONS = [
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "png",
  "jpg",
  "jpeg",
];

export const ALLOWED_FILE_TYPES_LABEL = "PDF, DOC, DOCX, XLS, XLSX, PNG, JPG";

export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;
export const MAX_FILE_SIZE_LABEL = "25MB";

export function isAllowedFileExtension(fileName: string): boolean {
  const ext = fileName.split(".").pop()?.toLowerCase();
  return Boolean(ext && ALLOWED_FILE_EXTENSIONS.includes(ext));
}

export function formatFileSize(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export function getFileType(fileName: string): DocumentFileType {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "pdf";
  if (ext === "doc" || ext === "docx") return "docx";
  if (ext === "xls" || ext === "xlsx") return "xlsx";
  return "other";
}

export function formatUploadedDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
