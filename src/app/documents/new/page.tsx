import { createClient } from "@/utils/supabase/server";
import { DEV_FIRM_ID } from "@/lib/constants";
import type { MatterRef } from "@/utils/supabase/types";
import UploadDocumentForm from "./UploadDocumentForm";

export default async function NewDocumentPage() {
  const supabase = await createClient();
  const { data: matters } = await supabase
    .from("matters")
    .select("id, title")
    .eq("firm_id", DEV_FIRM_ID)
    .order("title")
    .returns<MatterRef[]>();

  return <UploadDocumentForm matters={matters ?? []} />;
}
