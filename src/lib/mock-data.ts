// MOCK DATA — this whole module stands in for tables that don't exist in
// Supabase yet (documents). Replace each export with a real query once
// its table is wired up. Centralized here (rather than duplicated per
// page) because several pages now cross-reference the same matter names
// and documents.

export const MOCK_MATTER_NAMES = [
  "Smith v. Jones",
  "Chen LLC Contract Review",
  "Martinez Trademark Filing",
  "Johnson Estate Planning",
  "Williams Personal Injury Claim",
  "Anderson Divorce Proceedings",
];

export type MockDocument = {
  id: string;
  name: string;
  type: "pdf" | "docx" | "xlsx";
  category: string;
  matter: string;
  uploadedDate: string;
};

export const MOCK_DOCUMENT_CATEGORIES = [
  "Pleading",
  "Discovery",
  "Filing",
  "Billing",
  "Contract",
  "Intake",
  "Other",
];

export const MOCK_DOCUMENTS: MockDocument[] = [
  {
    id: "1",
    name: "Complaint - Smith v. Jones.pdf",
    type: "pdf",
    category: "Pleading",
    matter: "Smith v. Jones",
    uploadedDate: "Aug 1, 2026",
  },
  {
    id: "2",
    name: "Discovery Responses.docx",
    type: "docx",
    category: "Discovery",
    matter: "Chen LLC Contract Review",
    uploadedDate: "Aug 3, 2026",
  },
  {
    id: "3",
    name: "Trademark Application.pdf",
    type: "pdf",
    category: "Filing",
    matter: "Martinez Trademark Filing",
    uploadedDate: "Jul 28, 2026",
  },
  {
    id: "4",
    name: "Billing Summary Q3.xlsx",
    type: "xlsx",
    category: "Billing",
    matter: "Johnson Estate Planning",
    uploadedDate: "Aug 6, 2026",
  },
  {
    id: "5",
    name: "Settlement Agreement Draft.docx",
    type: "docx",
    category: "Contract",
    matter: "Williams Personal Injury Claim",
    uploadedDate: "Aug 7, 2026",
  },
  {
    id: "6",
    name: "Client Intake Form.pdf",
    type: "pdf",
    category: "Intake",
    matter: "Anderson Divorce Proceedings",
    uploadedDate: "Jul 30, 2026",
  },
];

