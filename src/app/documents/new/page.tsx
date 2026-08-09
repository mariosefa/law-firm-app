import { createClient } from "@/utils/supabase/server";
import { getFirmId } from "@/utils/supabase/profile";
import type { MatterRef } from "@/utils/supabase/types";
import UploadDocumentForm from "./UploadDocumentForm";

export default async function NewDocumentPage() {
  const supabase = await createClient();
  const firmId = await getFirmId(supabase);
  const { data: matters } = await supabase
    .from("matters")
    .select("id, title")
    .eq("firm_id", firmId)
    .order("title")
    .returns<MatterRef[]>();

  return <UploadDocumentForm matters={matters ?? []} />;
}
