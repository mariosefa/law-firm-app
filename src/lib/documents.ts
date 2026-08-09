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
