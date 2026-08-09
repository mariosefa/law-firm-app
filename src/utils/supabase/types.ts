export type MatterStatus = "Active" | "On Hold" | "Closed";

export type Client = {
  id: string;
  name: string;
};

export type ClientRecord = {
  id: string;
  firm_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  created_at: string;
};

export type ClientWithMatterStatuses = Pick<
  ClientRecord,
  "id" | "name" | "email" | "phone"
> & {
  matters: { status: MatterStatus }[] | null;
};

export type Matter = {
  id: string;
  firm_id: string;
  client_id: string;
  assigned_user_id: string | null;
  matter_number: string | null;
  title: string;
  practice_area: string;
  status: MatterStatus;
  opened_date: string;
  created_at: string;
};

export type MatterWithClient = Matter & {
  clients: Client | null;
};
