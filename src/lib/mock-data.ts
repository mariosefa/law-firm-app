import type { BadgeColor } from "@/components/ui/Badge";
import type { MatterStatus } from "@/utils/supabase/types";

// MOCK DATA — this whole module stands in for tables that don't exist in
// Supabase yet (clients, deadlines, documents). Replace each export with a
// real query once its table is wired up. Centralized here (rather than
// duplicated per page) because several pages now cross-reference the same
// matter names, deadlines, and documents.

export const MOCK_MATTER_NAMES = [
  "Smith v. Jones",
  "Chen LLC Contract Review",
  "Martinez Trademark Filing",
  "Johnson Estate Planning",
  "Williams Personal Injury Claim",
  "Anderson Divorce Proceedings",
];

export type MockDeadline = {
  id: string;
  title: string;
  matter: string;
  date: string; // ISO yyyy-mm-dd
  priority: "Overdue" | "High" | "Medium" | "Low";
  color: BadgeColor;
};

// Sorted soonest-first — every consumer relies on this order.
export const MOCK_DEADLINES: MockDeadline[] = [
  {
    id: "1",
    title: "File motion for summary judgment",
    matter: "Smith v. Jones",
    date: "2026-08-05",
    priority: "Overdue",
    color: "red",
  },
  {
    id: "2",
    title: "Respond to discovery request",
    matter: "Chen LLC Contract Review",
    date: "2026-08-11",
    priority: "High",
    color: "amber",
  },
  {
    id: "3",
    title: "Submit trademark renewal",
    matter: "Martinez Trademark Filing",
    date: "2026-08-14",
    priority: "High",
    color: "amber",
  },
  {
    id: "4",
    title: "File estate tax return",
    matter: "Johnson Estate Planning",
    date: "2026-08-18",
    priority: "Medium",
    color: "blue",
  },
  {
    id: "5",
    title: "Deposition prep meeting",
    matter: "Williams Personal Injury Claim",
    date: "2026-08-22",
    priority: "Medium",
    color: "blue",
  },
  {
    id: "6",
    title: "Client status call",
    matter: "Anderson Divorce Proceedings",
    date: "2026-08-29",
    priority: "Low",
    color: "gray",
  },
];

export function formatDeadlineDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

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

export type MockClientMatter = {
  id: string;
  title: string;
  practiceArea: string;
  status: MatterStatus;
};

export type MockClient = {
  id: string;
  name: string;
  email: string;
  phone: string;
  matters: MockClientMatter[];
};

export const MOCK_CLIENTS: MockClient[] = [
  {
    id: "1",
    name: "Sarah Chen",
    email: "schen@chenllc.com",
    phone: "(415) 555-0182",
    matters: [
      {
        id: "1",
        title: "Chen LLC Contract Review",
        practiceArea: "Corporate",
        status: "Active",
      },
      {
        id: "2",
        title: "Chen LLC Trademark Search",
        practiceArea: "Intellectual Property",
        status: "On Hold",
      },
    ],
  },
  {
    id: "2",
    name: "Marcus Johnson",
    email: "marcus.johnson@email.com",
    phone: "(312) 555-0147",
    matters: [
      {
        id: "3",
        title: "Johnson Estate Planning",
        practiceArea: "Estate Planning",
        status: "Active",
      },
    ],
  },
  {
    id: "3",
    name: "Elena Martinez",
    email: "elena.martinez@martinezco.com",
    phone: "(646) 555-0193",
    matters: [
      {
        id: "4",
        title: "Martinez Trademark Filing",
        practiceArea: "Intellectual Property",
        status: "Active",
      },
    ],
  },
  {
    id: "4",
    name: "David Williams",
    email: "d.williams@email.com",
    phone: "(206) 555-0121",
    matters: [
      {
        id: "5",
        title: "Williams Personal Injury Claim",
        practiceArea: "Personal Injury",
        status: "Closed",
      },
    ],
  },
  {
    id: "5",
    name: "Priya Anderson",
    email: "priya.anderson@email.com",
    phone: "(503) 555-0165",
    matters: [
      {
        id: "6",
        title: "Anderson Divorce Proceedings",
        practiceArea: "Family Law",
        status: "Active",
      },
    ],
  },
];
